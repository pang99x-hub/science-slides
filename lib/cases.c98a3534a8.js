/* 3-1 4차시 체험 «실제 사례 네 가지»(교과서 116쪽 해 보기 «지권의 변화가 지구시스템에 미치는 영향»).
   위 탭에서 사례(가 동일본 대지진 2011, 나 킬라우에아 2018, 다 튀르키예·시리아 대지진 2023, 라 통가 해저 화산 2022)를 고르면
   왼쪽에 실제 사진, 아래 받침에 그 사례의 영향 카드 넷이 나온다. 카드를 오른쪽 기권·수권·지권·생물권 칸에 끌어 넣으면
   맞을 때 칸이 빛나고 사진 귀퉁이 세계 지도에 사례 자리가 켜진다. 틀리면 튕기며 까닭. 사례마다 네 권역에 하나씩.
   사실은 USGS·NOAA·NASA 발표 수준, 수치는 «약».
   키보드: 좌우로 카드 고르기, 1 기권 2 수권 3 지권 4 생물권, A~D 사례, 0 처음부터.
   Cases.mount(root) → { fit, setActive } · 시험용: root._cs.pick(0~3) · put(k) · state() */
(function () {
  'use strict';
  const SPH = { atm: ['기권', '#5fb2f2'], hyd: ['수권', '#2f7fd9'], geo: ['지권', '#b9783c'], bio: ['생물권', '#45b264'] };
  const ORDER = ['atm', 'hyd', 'geo', 'bio'];
  // 사례: 이름·종류·경위도(세계 지도 표시)·카드 넷(권역마다 하나)
  const CASES = [
    { n: '동일본 대지진', y: '2011년', kind: '지진', lon: 142.4, lat: 38.3, cards: [
      { k: 'jp-air', s: 'atm', n: '방사성 물질이 공기로 퍼짐', why: '해일에 잠긴 원자력 발전소가 고장 나 방사성 물질이 바람을 타고 퍼졌다' },
      { k: 'jp-sea', s: 'hyd', n: '거대한 해일이 해안을 덮침', why: '바다 밑 땅이 크게 솟아 바닷물이 한꺼번에 밀려왔다' },
      { k: 'jp-land', s: 'geo', n: '땅이 동쪽으로 수 m 움직임', why: '판이 갑자기 미끄러지며 일본 땅의 위치와 높이가 바뀌었다' },
      { k: 'jp-farm', s: 'bio', n: '바닷물에 잠긴 논밭이 망가짐', why: '소금기가 남은 땅에서는 한동안 농작물이 자라지 못했다' },
    ] },
    { n: '킬라우에아 화산', y: '2018년', kind: '화산', lon: -155.3, lat: 19.4, cards: [
      { k: 'hi-gas', s: 'atm', n: '화산 가스로 공기가 뿌옇게', why: '이산화 황이 섞인 화산 스모그가 섬 하늘을 덮었다' },
      { k: 'hi-laze', s: 'hyd', n: '용암이 바다에 닿아 산성 증기', why: '뜨거운 용암이 바닷물을 끓여 따가운 증기 기둥이 생겼다' },
      { k: 'hi-crack', s: 'geo', n: '땅이 갈라지고 새 땅이 생김', why: '틈에서 용암이 솟고, 바다로 흘러가 굳으며 해안선이 넓어졌다' },
      { k: 'hi-forest', s: 'bio', n: '용암이 숲을 태워 나무가 사라짐', why: '흘러내린 용암이 지나간 자리의 숲과 밭이 불탔다' },
    ] },
    { n: '튀르키예·시리아 대지진', y: '2023년', kind: '지진', lon: 37.0, lat: 37.2, cards: [
      { k: 'tr-dust', s: 'atm', n: '무너진 건물 먼지와 연기', why: '건물이 한꺼번에 무너지며 먼지와 화재 연기가 하늘을 덮었다' },
      { k: 'tr-water', s: 'hyd', n: '수도관이 끊겨 마실 물 부족', why: '땅이 흔들려 수도관과 물탱크가 부서졌다' },
      { k: 'tr-fault', s: 'geo', n: '땅이 수백 km 길이로 갈라짐', why: '단층이 길게 어긋나며 땅에 금이 가고 도로가 끊겼다' },
      { k: 'tr-people', s: 'bio', n: '수많은 사람이 삶터를 잃음', why: '사람도 생물권의 일원 — 다치고 집을 잃은 사람이 많았다' },
    ] },
    { n: '통가 해저 화산', y: '2022년', kind: '화산', lon: -175.4, lat: -20.5, cards: [
      { k: 'to-plume', s: 'atm', n: '화산재 기둥이 약 50 km 넘게 솟음', why: '분연 기둥이 성층권을 넘어 중간권 높이까지 올라갔다' },
      { k: 'to-wave', s: 'hyd', n: '해일이 태평양 건너까지 퍼짐', why: '폭발이 바닷물을 밀어 먼 나라 해안까지 해일이 닿았다' },
      { k: 'to-island', s: 'geo', n: '화산섬 대부분이 사라짐', why: '폭발로 섬이 날아가 바다 위 모양이 크게 바뀌었다' },
      { k: 'to-crop', s: 'bio', n: '화산재가 덮여 농작물·산호 피해', why: '재가 밭과 바다를 덮어 농작물과 산호초가 상했다' },
    ] },
  ];
  function mount(root) {
    const stage = root.querySelector('.cs-stage'), now = root.querySelector('.cs-now'), out = root.querySelector('.cs-out');
    const tabs = [...root.querySelectorAll('.cs-tab')], imgs = [...root.querySelectorAll('.cs-img')], mapImg = root.querySelector('.cs-map');
    const P = window.Play;
    let cur = 0, placed = {}, drag = null, bounce = null, flash = null, sel = 0, t = 0, msg = '', miss = 0;
    const L = (H) => H - 84; // 위(사진·칸)와 아래 받침의 경계
    const split = (W) => W * 0.5; // 왼쪽 사진, 오른쪽 네 칸
    function box(s, W, H) { const i = ORDER.indexOf(s), x0 = split(W) + 12, w = (W - x0 - 12) / 2 - 6, h = (L(H) - 24) / 2 - 6; return { x: x0 + (i % 2) * (w + 12), y: 12 + Math.floor(i / 2) * (h + 12), w, h }; }
    const done = (ci) => CASES[ci].cards.every((q) => placed[q.k]);
    function say(h) { if (h !== msg) { msg = h; out.innerHTML = h; } }
    function steps() {
      const n = CASES.filter((_, i) => done(i)).length, ok = [];
      if (n >= 1) ok.push(1); if (n >= 2) ok.push(2); if (n === 4) ok.push(3);
      const st = [1, 2, 3].find((q) => !ok.includes(q)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const left = CASES[cur].cards.filter((q) => !placed[q.k]).length;
      const nt = st === 0 ? `네 사례 모두 끝 — 틀린 시도 ${miss}번` : left ? `${'가나다라'[cur]} ${CASES[cur].n}: 카드를 알맞은 권역 칸에 (${4 - left}/4)` : `${'가나다라'[cur]} 끝 — 위에서 다른 사례를 고르자 (${n}/4)`;
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
      tabs.forEach((b, i) => { b.setAttribute('aria-pressed', String(i === cur)); b.classList.toggle('done', done(i)); });
      if (st === 0) say('<b>네 사례 모두</b> — 지진이든 화산이든 지권의 변화는 기권·수권·지권·생물권 <b>네 권역 모두</b>에 잇따라 영향을 준다. 지구 속 에너지와 물질이 겉으로 나오며 다른 권역을 바꾼다.');
    }
    function pick(i) { if (i < 0 || i > 3) return; cur = i; drag = null; sel = 0; const c = CASES[i]; say(`<b>${'가나다라'[i]} ${c.n}(${c.y})</b> — ${c.kind}가 남긴 변화 넷. 카드를 끌어 어느 권역의 변화인지 칸에 넣자.`); steps(); S.kick(); }
    function drop(k, s) {
      const q = CASES[cur].cards.find((c) => c.k === k); if (!q || placed[k]) return false;
      if (q.s === s) { placed[k] = s; flash = { s, a: 1 }; window.RxT.jolt(stage, 1); say(`<b>${q.n}</b> → <b>${SPH[s][0]}</b>: ${q.why}.${done(cur) ? ' <b>네 권역에 모두 번졌다.</b>' : ''}`); }
      else { miss += 1; const b = box(s, S.W, S.H); bounce = { x: b.x + b.w / 2, y: b.y + b.h / 2, a: 1 }; say(`튕겼다 — 거기는 <b>${SPH[s][0]}</b>. <b>${q.n}</b>: ${q.why}. 무엇이 바뀌었는지 — 공기·물·땅·생물 가운데 무엇일까?`); }
      steps(); S.kick(); return q.s === s;
    }
    const cards = () => CASES[cur].cards;
    const cardPos = (W, H, i) => [W * (0.125 + i * 0.25), L(H) + 42];
    function hit(x, y) { return ORDER.find((s) => { const b = box(s, S.W, S.H); return x > b.x - 20 && x < b.x + b.w + 20 && y > b.y - 20 && y < b.y + b.h + 20; }) || null; }
    // 칸 작은 그림(구름·물결·지층·잎)
    function icon(c, s, x, y, r) {
      c.save(); c.translate(x, y);
      if (s === 'atm') { c.fillStyle = '#fff'; [[-0.5, 0.1, 0.42], [0, -0.15, 0.55], [0.5, 0.1, 0.4], [0, 0.25, 0.45]].forEach(([u, v, k]) => { c.beginPath(); c.arc(u * r, v * r, k * r, 0, 7); c.fill(); }); }
      else if (s === 'hyd') { c.strokeStyle = '#d6efff'; c.lineWidth = r * 0.16; c.lineCap = 'round'; for (let j = 0; j < 3; j++) { c.beginPath(); for (let u = -1; u <= 1.01; u += 0.1) c.lineTo(u * r, (j - 1) * r * 0.5 + Math.sin(u * 6 + t * 3 + j) * r * 0.12); c.stroke(); } }
      else if (s === 'geo') { ['#d9a86a', '#a8743f', '#7a4f29'].forEach((col, j) => { c.fillStyle = col; c.fillRect(-r, -r * 0.6 + j * r * 0.45, 2 * r, r * 0.45); }); c.strokeStyle = '#2b1a0c'; c.lineWidth = 3; c.beginPath(); c.moveTo(-0.2 * r, -0.6 * r); c.lineTo(0.1 * r, 0); c.lineTo(-0.1 * r, 0.75 * r); c.stroke(); }
      else { c.rotate(-0.6); c.fillStyle = '#3fae5a'; c.beginPath(); c.moveTo(0, -r); c.quadraticCurveTo(0.8 * r, 0, 0, r); c.quadraticCurveTo(-0.8 * r, 0, 0, -r); c.fill(); c.strokeStyle = '#d9f5cf'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -0.9 * r); c.lineTo(0, r); c.stroke(); }
      c.restore();
    }
    function wrap(c, s, x, y, maxW, lh, col, f) {
      c.font = `${f} "IBM Plex Sans KR", sans-serif`; const words = s.split(' '), lines = []; let line = '';
      words.forEach((w) => { const tt = line ? line + ' ' + w : w; if (c.measureText(tt).width > maxW && line) { lines.push(line); line = w; } else line = tt; }); lines.push(line);
      lines.forEach((ln, i) => P.txt(c, ln, x, y + i * lh, col, f)); return lines.length;
    }
    function card(c, q, x, y, a, edge, small) {
      const w = small ? Math.min(150, S.W * 0.22) : Math.min(190, S.W * 0.23), h = small ? 40 : 58;
      c.globalAlpha = a; c.save(); c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 6; c.shadowOffsetY = 3; c.fillStyle = '#fff7d6'; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, 9); c.fill(); c.restore();
      c.strokeStyle = edge; c.lineWidth = 2.5; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, 9); c.stroke();
      const fs = small ? 12 : 14; c.font = `800 ${fs}px "IBM Plex Sans KR", sans-serif`;
      const n = c.measureText(q.n).width > w - 16 ? 2 : 1; wrap(c, q.n, x, y + (n === 2 ? -fs * 0.35 : fs * 0.35), w - 16, fs + 3, '#1d2433', `800 ${fs}px`); c.globalAlpha = 1;
    }
    // 사진(가운데 맞춰 잘라 채우기)
    function photo(c, im, x, y, w, h) {
      if (!im || !im.complete || !im.naturalWidth) { c.fillStyle = '#26324f'; c.fillRect(x, y, w, h); P.txt(c, '사진 불러오는 중', x + w / 2, y + h / 2, '#cfd8ea', '700 16px'); return; }
      const k = Math.max(w / im.naturalWidth, h / im.naturalHeight), sw = w / k, sh = h / k;
      c.drawImage(im, (im.naturalWidth - sw) / 2, (im.naturalHeight - sh) / 2, sw, sh, x, y, w, h);
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const l = L(H), sx = split(W);
        c.fillStyle = '#121a33'; c.fillRect(0, 0, W, H);
        // 사진 + 사례 이름 띠
        c.save(); c.beginPath(); c.roundRect(10, 10, sx - 16, l - 20, 10); c.clip(); photo(c, imgs[cur], 10, 10, sx - 16, l - 20);
        // 세계 지도(사례 자리, 끝난 사례는 초록)와 사례 이름 띠(사진 아래쪽 — 위쪽은 안내 칩 자리)
        const mw = Math.min(170, sx * 0.4), mh = mw / 2, mx = sx - mw - 18, my = l - mh - 18;
        c.fillStyle = 'rgba(12,18,40,.8)'; c.fillRect(10, l - 44, mx - 22, 34); P.txt(c, `${'가나다라'[cur]}  ${CASES[cur].n} · ${CASES[cur].y} · ${CASES[cur].kind}`, 22, l - 21, '#fff', '800 16px', 'left');
        c.fillStyle = 'rgba(0,0,0,.5)'; c.fillRect(mx - 3, my - 3, mw + 6, mh + 6);
        if (mapImg && mapImg.complete && mapImg.naturalWidth) c.drawImage(mapImg, mx, my, mw, mh); else { c.fillStyle = '#1e4f86'; c.fillRect(mx, my, mw, mh); }
        CASES.forEach((cs, i) => { const px = mx + (cs.lon + 180) / 360 * mw, py = my + (90 - cs.lat) / 180 * mh, d = done(i);
          if (i === cur) { c.strokeStyle = `rgba(255,216,77,${0.6 + 0.4 * Math.sin(t * 5)})`; c.lineWidth = 2; c.beginPath(); c.arc(px, py, 8 + 2 * Math.sin(t * 5), 0, 7); c.stroke(); }
          c.fillStyle = d ? '#7be08a' : i === cur ? '#ffd84d' : '#ff6b5b'; c.beginPath(); c.arc(px, py, 4, 0, 7); c.fill(); });
        c.restore();
        c.strokeStyle = '#3a4a73'; c.lineWidth = 2; c.beginPath(); c.roundRect(10, 10, sx - 16, l - 20, 10); c.stroke();
        // 네 권역 칸
        const hot = drag ? hit(drag.x, drag.y) : null;
        ORDER.forEach((s) => {
          const b = box(s, W, H), on = cards().filter((q) => placed[q.k] === s), lit = (flash && flash.s === s) ? flash.a : 0;
          const g = c.createLinearGradient(0, b.y, 0, b.y + b.h); g.addColorStop(0, SPH[s][1]); g.addColorStop(1, '#0f1a36'); c.fillStyle = g;
          c.beginPath(); c.roundRect(b.x, b.y, b.w, b.h, 10); c.fill();
          if (on.length) { P.glow(c, b.x + b.w / 2, b.y + b.h / 2, b.w * 0.6, 'rgba(255,216,77,.28)'); }
          c.strokeStyle = hot === s ? '#ffd84d' : lit ? `rgba(255,216,77,${lit})` : on.length ? 'rgba(255,230,140,.85)' : 'rgba(200,215,245,.45)'; c.lineWidth = hot === s ? 4 : 3; c.beginPath(); c.roundRect(b.x, b.y, b.w, b.h, 10); c.stroke();
          icon(c, s, b.x + 30, b.y + 30, 16); P.txt(c, SPH[s][0], b.x + 56, b.y + 37, '#fff', '800 20px', 'left');
          on.forEach((q) => card(c, q, b.x + b.w / 2, b.y + b.h - 30, 1, '#ffd84d', true));
        });
        if (flash) { flash.a -= dt * 0.9; if (flash.a <= 0) flash = null; }
        // 받침과 카드
        c.fillStyle = 'rgba(8,12,28,.95)'; c.fillRect(0, l, W, H - l);
        cards().forEach((q, i) => { if (placed[q.k] || (drag && drag.k === q.k)) return; const [x, y] = cardPos(W, H, i); card(c, q, x, y, 1, i === sel ? '#ffd84d' : '#5a6a90'); });
        if (drag) card(c, cards().find((q) => q.k === drag.k), drag.x, drag.y, 0.93, '#ffd84d');
        if (cards().every((q) => placed[q.k])) P.txt(c, CASES.every((_, i) => done(i)) ? '네 사례 모두 끝 — 지권의 변화 → 네 권역 모두' : '이 사례 끝 — 위 탭에서 다른 사례를 고르자', W / 2, l + 48, '#ffd84d', '800 18px');
        if (bounce) { c.strokeStyle = `rgba(239,91,76,${bounce.a})`; c.lineWidth = 4; c.beginPath(); c.arc(bounce.x, bounce.y, 40 * (2 - bounce.a), 0, 7); c.stroke(); bounce.a -= dt * 1.5; if (bounce.a <= 0) bounce = null; }
      },
      down(p) {
        const i = cards().findIndex((q, j) => { if (placed[q.k]) return false; const [x, y] = cardPos(S.W, S.H, j); return Math.abs(p.x - x) < S.W * 0.12 && Math.abs(p.y - y) < 32; });
        if (i >= 0) { sel = i; drag = { k: cards()[i].k, x: p.x, y: p.y }; }
      },
      move(p, e, held) { if (held && drag) { drag.x = p.x; drag.y = p.y; } },
      up() {
        if (!drag) return; const { k, x, y } = drag; drag = null; const s = y < L(S.H) ? hit(x, y) : null;
        if (s) drop(k, s); else { if (y < L(S.H)) say('오른쪽 <b>네 권역 칸</b> 가운데 하나에 놓자'); S.kick(); }
      },
      key(e) {
        const left = cards().map((q, i) => i).filter((i) => !placed[cards()[i].k]);
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { if (left.length) { const j = left.indexOf(sel); sel = left[(Math.max(0, j) + (e.key === 'ArrowRight' ? 1 : left.length - 1)) % left.length]; } return true; }
        const si = '1234'.indexOf(e.key); if (si >= 0) { const q = cards()[left.includes(sel) ? sel : left[0]]; if (q) drop(q.k, ORDER[si]); return true; }
        const ci = 'abcd'.indexOf(e.key.toLowerCase()); if (ci >= 0) { pick(ci); return true; }
        if (e.key === '0') { reset(); return true; } return false;
      },
    });
    tabs.forEach((b, i) => b.addEventListener('click', () => pick(i)));
    [...imgs, mapImg].forEach((im) => im && im.addEventListener('load', () => S.kick(), { once: true }));
    function reset() { placed = {}; miss = 0; flash = null; bounce = null; pick(0); }
    root.querySelector('.cs-reset')?.addEventListener('click', reset);
    root._cs = { pick, put: (k) => { const ci = CASES.findIndex((c) => c.cards.some((q) => q.k === k)); if (ci < 0) return false; if (ci !== cur) pick(ci); return drop(k, CASES[ci].cards.find((q) => q.k === k).s); }, state: () => ({ cur, placed: Object.keys(placed), done: CASES.map((_, i) => done(i)), miss }), keys: () => CASES.map((c) => c.cards.map((q) => q.k)) };
    reset();
    console.assert(CASES.every((c) => ORDER.every((s) => c.cards.filter((q) => q.s === s).length === 1)), 'cases: 사례마다 네 권역에 카드 하나씩');
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Cases = { mount };
})();
