/* 3-1 2차시 체험 «어떤 에너지가 일으킬까?»(교과서 108쪽 지구시스템의 에너지원 + 참고서: 태양 99.9% 이상, 에너지원끼리는 서로 바뀌지 않는다).
   위에 움직이는 판 셋: 태양(햇살이 뻗는 이글거리는 해) · 지구 내부(붉게 빛나는 핵과 도는 맨틀 대류) · 조력(지구를 도는 달과 부푸는 바닷물).
   아래 현상 카드 12장을 끌어 알맞은 판에 놓으면 판 안에 쌓이며 판이 반응(햇살 번쩍·핵 맥동·물결 출렁), 틀리면 튕기며 까닭.
   키보드: 좌우로 카드 고르기, 1 태양 · 2 지구 내부 · 3 조력, 0 처음부터.
   Energy.mount(root) → { fit, setActive } · 시험용: root._en.put('typhoon') · state() */
(function () {
  'use strict';
  const SRC = { sun: ['태양 에너지', '#ffb627'], core: ['지구 내부 에너지', '#ef5b4c'], tide: ['조력 에너지', '#4aa3f0'] };
  const ORDER = ['sun', 'core', 'tide'];
  const CARDS = [
    { k: 'typhoon', n: '태풍', s: 'sun', why: '데워진 바다에서 수증기가 올라 생긴다 — 햇빛이 데운 열' },
    { k: 'wind', n: '바람', s: 'sun', why: '땅과 바다가 고르지 않게 데워져 공기가 움직인다' },
    { k: 'current', n: '해류', s: 'sun', why: '바람이 바닷물을 밀고, 데워진 정도가 달라 흐른다' },
    { k: 'photo', n: '광합성', s: 'sun', why: '식물이 햇빛을 받아 양분을 만든다' },
    { k: 'rain', n: '물의 순환', s: 'sun', why: '햇빛이 바닷물을 증발시켜 순환이 시작된다' },
    { k: 'quake', n: '지진', s: 'core', why: '땅속에 쌓인 힘이 한꺼번에 풀린다 — 지구 속 열이 판을 움직인 결과' },
    { k: 'volcano', n: '화산 분출', s: 'core', why: '지구 속 열로 녹은 마그마가 솟는다' },
    { k: 'drift', n: '대륙 이동', s: 'core', why: '맨틀이 천천히 흐르며 판을 옮긴다' },
    { k: 'mantle', n: '맨틀 대류', s: 'core', why: '지구 속 열 때문에 고체 맨틀이 아주 천천히 돈다' },
    { k: 'ebb', n: '밀물과 썰물', s: 'tide', why: '달·태양이 끌어당겨 바닷물 높이가 하루 두 번쯤 오르내린다' },
    { k: 'flat', n: '갯벌 생성', s: 'tide', why: '밀물·썰물이 날라 온 흙이 쌓이고 드러나기를 되풀이' },
    { k: 'tpower', n: '조력 발전', s: 'tide', why: '밀물·썰물 때 물 높이 차이로 발전기를 돌린다' },
  ];
  const WRONG = {
    sun: '햇빛이 데운 열로 일어나는 일이다',
    core: '지구 속 열이 일으키는 일이다',
    tide: '달·태양의 끌어당기는 힘이 일으키는 일이다',
  };
  function mount(root) {
    const stage = root.querySelector('.en-stage'), now = root.querySelector('.en-now'), out = root.querySelector('.en-out');
    const P = window.Play;
    let placed = {}, drag = null, bounce = null, hit = {}, sel = 0, t = 0, msg = '', miss = 0, art = null, artW = 0;
    const L = (H) => H - 92; // 판 높이(아래는 카드 받침)
    const panelAt = (x, W) => ORDER[Math.max(0, Math.min(2, Math.floor(x / (W / 3))))];
    const cardPos = (W, H, i) => [W * (0.085 + (i % 6) * 0.166), L(H) + 26 + Math.floor(i / 6) * 40];
    function say(h) { if (h !== msg) { msg = h; out.innerHTML = h; } }
    function steps() {
      const ks = Object.keys(placed), n = ks.length, cov = new Set(ks.map((k) => CARDS.find((q) => q.k === k).s));
      const ok = []; if (n >= 4) ok.push(1); if (cov.size === 3) ok.push(2); if (n === CARDS.length) ok.push(3);
      const st = [1, 2, 3].find((q) => !ok.includes(q)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? `① 카드를 끌어 알맞은 에너지에 놓자 (${n}/4)` : st === 2 ? `② 세 에너지에 하나씩은 (${cov.size}/3)` : st === 3 ? `③ 남은 카드도 (${n}/12)` : `모두 맞혔다 — 틀린 시도 ${miss}번`;
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    function drop(k, x) {
      const q = CARDS.find((c) => c.k === k); if (!q || placed[k]) return false;
      const s = panelAt(x, S.W);
      if (s === q.s) { placed[k] = true; hit[s] = 1; window.RxT.jolt(stage, 1); say(`<b>${q.n}</b> → <b>${SRC[s][0]}</b>: ${q.why}`); }
      else { miss += 1; bounce = { x, y: L(S.H) * 0.5, a: 1 }; say(`튕겼다 — <b>${q.n}</b>은(는) ${SRC[s][0]}가 아니다. ${WRONG[q.s]}`); }
      steps(); S.kick(); return s === q.s;
    }
    // 판 셋의 바탕(그라데이션·별·지구 단면 틀)은 크기가 바뀔 때만 다시 그린다
    function backdrop(W, H) {
      if (art && artW === W) return art;
      art = document.createElement('canvas'); art.width = W; art.height = H; artW = W; const c = art.getContext('2d'), l = L(H), w = W / 3;
      const bg = [['#fff3c9', '#ffd783'], ['#3a1712', '#160806'], ['#0b1a3a', '#03081a']];
      bg.forEach(([a, b], i) => { const g = c.createLinearGradient(0, 0, 0, l); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(w * i, 0, w, l); });
      let s = 5; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
      for (let i = 0; i < 50; i++) { c.fillStyle = `rgba(255,255,255,${0.2 + rnd() * 0.6})`; c.fillRect(w * 2 + rnd() * w, rnd() * l, 1.4, 1.4); }
      c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(w - 1.5, 0, 3, l); c.fillRect(w * 2 - 1.5, 0, 3, l);
      return art;
    }
    function panelSun(c, x0, w, l, a) {
      const cx = x0 + w / 2, cy = l * 0.36, r = Math.min(w, l) * 0.16 * (1 + a * 0.12);
      for (let i = 0; i < 16; i++) { const ang = i / 16 * Math.PI * 2 + t * 0.25, len = r * (1.5 + 0.25 * Math.sin(t * 3 + i) + a * 0.6); c.strokeStyle = `rgba(255,170,30,${0.55 + a * 0.4})`; c.lineWidth = 5; c.beginPath(); c.moveTo(cx + Math.cos(ang) * r * 1.1, cy + Math.sin(ang) * r * 1.1); c.lineTo(cx + Math.cos(ang) * len, cy + Math.sin(ang) * len); c.stroke(); }
      P.glow(c, cx, cy, r * 2.2, 'rgba(255,190,60,.7)', 'rgba(255,220,120,0)');
      const g = c.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.1, cx, cy, r); g.addColorStop(0, '#fffbe0'); g.addColorStop(0.6, '#ffc93a'); g.addColorStop(1, '#f08a12'); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill();
      for (let i = 0; i < 5; i++) { c.fillStyle = 'rgba(240,120,20,.35)'; c.beginPath(); c.arc(cx + Math.cos(t * 0.4 + i * 1.3) * r * 0.5, cy + Math.sin(t * 0.5 + i * 1.7) * r * 0.5, r * 0.12, 0, Math.PI * 2); c.fill(); }
      P.txt(c, '전체의 99.9% 이상', cx, l * 0.66, '#8a4b00', '800 15px');
    }
    function panelCore(c, x0, w, l, a) {
      const cx = x0 + w / 2, cy = l * 0.4, R = Math.min(w, l) * 0.3;
      // 지구 단면: 지각 · 맨틀(도는 대류 화살) · 외핵 · 내핵(맥동)
      c.fillStyle = '#6b4a2e'; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fill();
      const m = c.createRadialGradient(cx, cy, R * 0.4, cx, cy, R * 0.96); m.addColorStop(0, '#e2582d'); m.addColorStop(1, '#8c2f1a'); c.fillStyle = m; c.beginPath(); c.arc(cx, cy, R * 0.96, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#f6a33a'; c.beginPath(); c.arc(cx, cy, R * 0.52, 0, Math.PI * 2); c.fill();
      const pulse = 1 + 0.06 * Math.sin(t * 3) + a * 0.15; P.glow(c, cx, cy, R * 0.55 * pulse, 'rgba(255,250,200,.95)', 'rgba(255,190,80,0)');
      c.fillStyle = '#fff4c2'; c.beginPath(); c.arc(cx, cy, R * 0.22 * pulse, 0, Math.PI * 2); c.fill();
      c.strokeStyle = `rgba(255,230,190,${0.6 + a * 0.4})`; c.lineWidth = 2.5;
      for (let i = 0; i < 4; i++) { const b = i * Math.PI / 2 + t * 0.6; c.beginPath(); c.ellipse(cx + Math.cos(b) * R * 0.74, cy + Math.sin(b) * R * 0.74, R * 0.17, R * 0.1, b, 0.3, 5.6); c.stroke(); const e = b + 5.6; P.glow(c, cx + Math.cos(b) * R * 0.74 + Math.cos(e) * R * 0.17, cy + Math.sin(b) * R * 0.74 + Math.sin(e) * R * 0.1, 5, 'rgba(255,240,200,.9)'); }
      P.txt(c, '지구 속 열', cx, l * 0.82, '#ffd6c2', '800 15px');
    }
    function panelTide(c, x0, w, l, a) {
      const cx = x0 + w / 2, cy = l * 0.42, R = Math.min(w, l) * 0.13, ang = t * 0.5, mx = cx + Math.cos(ang) * R * 2.6, my = cy + Math.sin(ang) * R * 1.4;
      c.strokeStyle = 'rgba(255,255,255,.2)'; c.setLineDash([4, 5]); c.lineWidth = 1.5; c.beginPath(); c.ellipse(cx, cy, R * 2.6, R * 1.4, 0, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
      // 달 쪽과 반대쪽으로 부푼 바닷물
      const bulge = 1.35 + 0.08 * Math.sin(t * 4) + a * 0.25;
      c.save(); c.translate(cx, cy); c.rotate(Math.atan2(my - cy, mx - cx)); c.fillStyle = 'rgba(74,163,240,.55)'; c.beginPath(); c.ellipse(0, 0, R * bulge, R * 1.05, 0, 0, Math.PI * 2); c.fill(); c.restore();
      const e = c.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R); e.addColorStop(0, '#6cc0ff'); e.addColorStop(1, '#14498f'); c.fillStyle = e; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#4f9b45'; c.beginPath(); c.ellipse(cx - R * 0.2, cy - R * 0.1, R * 0.4, R * 0.25, 0.5, 0, Math.PI * 2); c.fill();
      const mg = c.createRadialGradient(mx - 3, my - 3, 1, mx, my, R * 0.4); mg.addColorStop(0, '#f4f4f0'); mg.addColorStop(1, '#8d8f95'); c.fillStyle = mg; c.beginPath(); c.arc(mx, my, R * 0.4, 0, Math.PI * 2); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(mx, my); c.lineTo(cx + (mx - cx) * 0.45, cy + (my - cy) * 0.45); c.stroke();
      // 아래 해안: 오르내리는 물높이
      const sea = l * (0.8 + 0.035 * Math.sin(t * 1.2)); c.fillStyle = '#c9a66b'; c.beginPath(); c.moveTo(x0, l * 0.92); c.lineTo(x0 + w, l * 0.74); c.lineTo(x0 + w, l); c.lineTo(x0, l); c.fill();
      c.fillStyle = 'rgba(74,163,240,.75)'; c.fillRect(x0, sea, w, l - sea);
      P.txt(c, '달·태양의 끌어당김', cx, l * 0.71, '#cfe6ff', '800 15px');
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const l = L(H), w = W / 3;
        c.drawImage(backdrop(W, H), 0, 0);
        const over = drag ? panelAt(drag.x, W) : null;
        [panelSun, panelCore, panelTide].forEach((f, i) => { const s = ORDER[i], a = hit[s] || 0; f(c, w * i, w, l, a); if (a) { hit[s] = Math.max(0, a - dt * 1.2); } });
        // 판 이름 + 드래그 중인 판 테두리
        ORDER.forEach((s, i) => {
          const [nm, col] = SRC[s]; c.font = '800 17px "IBM Plex Sans KR", sans-serif'; const tw = c.measureText(nm).width + 20;
          c.fillStyle = 'rgba(10,16,32,.72)'; c.beginPath(); c.roundRect(w * i + w / 2 - tw / 2, 8, tw, 28, 9); c.fill(); P.txt(c, nm, w * i + w / 2, 28, col, '800 17px');
          if (over === s) { c.strokeStyle = '#ffd84d'; c.lineWidth = 5; c.strokeRect(w * i + 4, 4, w - 8, l - 8); }
        });
        // 판 안에 쌓인 카드
        ORDER.forEach((s, i) => { CARDS.filter((q) => q.s === s && placed[q.k]).forEach((q, j) => tag(c, q, w * i + w * (j % 2 ? 0.72 : 0.28), l - 26 - Math.floor(j / 2) * 34, 0.95, SRC[s][1])); });
        // 받침
        c.fillStyle = 'rgba(12,18,36,.92)'; c.fillRect(0, l, W, H - l);
        CARDS.forEach((q, i) => { if (placed[q.k] || (drag && drag.k === q.k)) return; const [x, y] = cardPos(W, H, i); tag(c, q, x, y, 1, i === sel ? '#ffd84d' : '#5a6a90'); });
        if (drag) tag(c, CARDS.find((q) => q.k === drag.k), drag.x, drag.y, 0.92, '#ffd84d');
        if (bounce) { c.strokeStyle = `rgba(239,91,76,${bounce.a})`; c.lineWidth = 4; c.beginPath(); c.arc(bounce.x, bounce.y, 50 * (2 - bounce.a), 0, Math.PI * 2); c.stroke(); bounce.a -= dt * 1.5; if (bounce.a <= 0) bounce = null; }
      },
      down(p) {
        const i = CARDS.findIndex((q, j) => { if (placed[q.k]) return false; const [x, y] = cardPos(S.W, S.H, j); return Math.abs(p.x - x) < S.W * 0.08 && Math.abs(p.y - y) < 18; });
        if (i >= 0) { sel = i; drag = { k: CARDS[i].k, x: p.x, y: p.y }; }
      },
      move(p, e, held) { if (held && drag) { drag.x = p.x; drag.y = p.y; } },
      up(p) { if (!drag) return; const k = drag.k; drag = null; if (p.y < L(S.H)) drop(k, p.x); else S.kick(); },
      key(e) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { const left = CARDS.map((q, i) => i).filter((i) => !placed[CARDS[i].k]); if (!left.length) return true; const j = left.indexOf(sel); sel = left[(Math.max(0, j) + (e.key === 'ArrowRight' ? 1 : left.length - 1)) % left.length]; return true; }
        const i = '123'.indexOf(e.key);
        if (i >= 0 && e.key) { const q = CARDS[sel]; if (q && !placed[q.k]) drop(q.k, S.W * (i + 0.5) / 3); return true; }
        if (e.key === '0') { reset(); return true; } return false;
      },
    });
    function tag(c, q, x, y, a, edge) {
      c.globalAlpha = a; c.font = '800 15px "IBM Plex Sans KR", sans-serif'; const w = c.measureText(q.n).width + 22;
      c.save(); c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 6; c.shadowOffsetY = 3; c.fillStyle = '#fff7d6'; c.beginPath(); c.roundRect(x - w / 2, y - 15, w, 30, 9); c.fill(); c.restore();
      c.strokeStyle = edge; c.lineWidth = 2.5; c.beginPath(); c.roundRect(x - w / 2, y - 15, w, 30, 9); c.stroke();
      P.txt(c, q.n, x, y + 5, '#1d2433', '800 15px'); c.globalAlpha = 1;
    }
    function reset() { placed = {}; miss = 0; drag = null; sel = 0; msg = ''; hit = {}; say('현상 카드를 끌어 그 일을 일으키는 에너지 판에 놓자'); steps(); S.kick(); }
    root.querySelector('.en-reset')?.addEventListener('click', reset);
    root._en = { put: (k) => { const q = CARDS.find((c) => c.k === k); return drop(k, S.W * (ORDER.indexOf(q.s) + 0.5) / 3); }, state: () => ({ placed: Object.keys(placed), miss }) };
    reset();
    console.assert(panelAt(10, 900) === 'sun' && panelAt(450, 900) === 'core' && panelAt(890, 900) === 'tide', 'energy: 판 판정');
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Energy = { mount };
})();
