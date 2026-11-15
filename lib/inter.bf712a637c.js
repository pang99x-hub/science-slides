/* 3-1 2차시 체험 «어느 권역 사이?»(교과서 110쪽 그림 Ⅲ-9 지구시스템의 상호작용 + 참고서: 상호작용의 예).
   기권·수권·지권·생물권 네 구슬을 여섯 줄이 잇는다. 아래 현상 카드 18장을 끌어 알맞은 줄의 고리에 놓으면 딱 붙고,
   그 줄을 따라 두 권역 사이로 알갱이가 오간다(상호작용). 틀리면 튕기며 까닭. 줄마다 카드 셋.
   키보드: 좌우로 카드 고르기, 1~6 줄 고르기(1 기권–수권 2 기권–지권 3 기권–생물권 4 수권–지권 5 수권–생물권 6 지권–생물권), 0 처음부터.
   Inter.mount(root) → { fit, setActive } · 시험용: root._it.put('photo') · state() */
(function () {
  'use strict';
  const SPH = { atm: ['기권', '#5fb2f2'], hyd: ['수권', '#2f7fd9'], geo: ['지권', '#b9783c'], bio: ['생물권', '#45b264'] };
  const NODE = { atm: [0.5, 0.14], hyd: [0.84, 0.5], geo: [0.5, 0.84], bio: [0.16, 0.5] };
  // 줄: 두 권역 + 고리 자리(대각선 두 줄은 가운데에서 엇갈리므로 고리를 한쪽으로 비켜 둔다)
  const EDGES = [
    { k: 'atm-hyd', a: 'atm', b: 'hyd', t: 0.5 },
    { k: 'atm-geo', a: 'atm', b: 'geo', t: 0.32 },
    { k: 'atm-bio', a: 'atm', b: 'bio', t: 0.5 },
    { k: 'hyd-geo', a: 'hyd', b: 'geo', t: 0.5 },
    { k: 'hyd-bio', a: 'hyd', b: 'bio', t: 0.3 },
    { k: 'geo-bio', a: 'geo', b: 'bio', t: 0.5 },
  ];
  const CARDS = [
    { k: 'typhoon', n: '태풍', e: 'atm-hyd', why: '따뜻한 바다의 수증기가 하늘로 올라가 커다란 구름 덩어리가 된다' },
    { k: 'current', n: '표층 해류', e: 'atm-hyd', why: '바다 위를 늘 같은 쪽으로 부는 바람이 바닷물을 밀어 흐르게 한다' },
    { k: 'mush', n: '버섯바위', e: 'atm-geo', why: '모래를 실은 사막 바람이 바위 아랫부분을 더 많이 갉아 낸다' },
    { k: 'ash', n: '화산재', e: 'atm-geo', why: '땅속 마그마가 터져 재와 가스가 하늘로 퍼진다' },
    { k: 'photo', n: '광합성', e: 'atm-bio', why: '식물이 공기 속 이산화 탄소를 받아들여 양분을 만든다 (110쪽 질문)' },
    { k: 'breath', n: '호흡', e: 'atm-bio', why: '생물이 산소를 쓰고 이산화 탄소를 공기로 내보낸다' },
    { k: 'tsunami', n: '지진 해일', e: 'hyd-geo', why: '바다 밑 땅이 흔들려 거대한 물결이 일어난다' },
    { k: 'cave', n: '해식 동굴', e: 'hyd-geo', why: '파도가 바닷가 절벽을 오랫동안 깎아 굴을 낸다 (스스로 확인하기 ➋)' },
    { k: 'redtide', n: '적조', e: 'hyd-bio', why: '바다에 영양분이 넘치면 플랑크톤이 갑자기 불어나 물빛이 붉어진다' },
    { k: 'shell', n: '조개껍데기', e: 'hyd-bio', why: '조개가 바닷물에 녹은 칼슘 성분을 모아 껍데기를 짓는다' },
    { k: 'root', n: '뿌리 풍화', e: 'geo-bio', why: '자라는 나무뿌리가 바위 틈을 벌려 암석을 부순다' },
    { k: 'soil', n: '흙 속 생물', e: 'geo-bio', why: '흙은 지렁이·미생물·식물이 뿌리내려 사는 터전이 된다' },
    { k: 'nino', n: '엘니뇨', e: 'atm-hyd', why: '적도 태평양의 무역풍이 약해지자 동쪽 바다 표면이 평소보다 따뜻하게 남는다' },
    { k: 'dust', n: '황사', e: 'atm-geo', why: '메마른 땅의 흙먼지가 바람을 타고 하늘로 올라 먼 나라까지 날아간다' },
    { k: 'seed', n: '씨앗 날리기', e: 'atm-bio', why: '바람이 민들레 씨앗과 꽃가루를 멀리 실어 날라 식물이 퍼진다' },
    { k: 'uval', n: 'U자곡', e: 'hyd-geo', why: '두꺼운 빙하가 천천히 미끄러지며 골짜기 바닥을 넓고 둥글게 긁어 낸다' },
    { k: 'reef', n: '산호초', e: 'hyd-bio', why: '산호가 바닷물에 녹은 성분으로 뼈대를 쌓아 여러 바다 생물의 집을 만든다' },
    { k: 'coal', n: '석탄이 됨', e: 'geo-bio', why: '오래전 숲의 나무가 땅속에 묻혀 오랜 세월 눌리고 데워져 석탄이 된다' },
  ];
  const nameOf = (e) => `${SPH[e.a][0]}–${SPH[e.b][0]}`;
  function mount(root) {
    const stage = root.querySelector('.it-stage'), now = root.querySelector('.it-now'), out = root.querySelector('.it-out');
    const P = window.Play;
    let placed = {}, drag = null, bounce = null, flash = null, sel = 0, t = 0, msg = '', miss = 0, art = null, artW = 0, artH = 0;
    const L = (H) => H - 128; // 그물 높이(아래는 카드 받침, 세 줄)
    const nodeXY = (s, W, H) => [W * NODE[s][0], L(H) * NODE[s][1]];
    const R = (W, H) => Math.min(W * 0.085, L(H) * 0.13);
    function padXY(e, W, H) { const [ax, ay] = nodeXY(e.a, W, H), [bx, by] = nodeXY(e.b, W, H); return [ax + (bx - ax) * e.t, ay + (by - ay) * e.t]; }
    function nearest(x, y, W, H) {
      let best = null, bd = 1e9;
      EDGES.forEach((e) => { const [px, py] = padXY(e, W, H), d = Math.hypot(x - px, y - py); if (d < bd) { bd = d; best = e; } });
      return bd < Math.max(70, W * 0.08) ? best : null;
    }
    function say(h) { if (h !== msg) { msg = h; out.innerHTML = h; } }
    function steps() {
      const n = Object.keys(placed).length, cov = new Set(Object.keys(placed).map((k) => CARDS.find((q) => q.k === k).e));
      const ok = []; if (n >= 4) ok.push(1); if (cov.size === EDGES.length) ok.push(2); if (n === CARDS.length) ok.push(3);
      const st = [1, 2, 3].find((q) => !ok.includes(q)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? `① 카드를 끌어 알맞은 줄의 고리에 놓자 (${n}/4)` : st === 2 ? `② 여섯 줄에 하나씩은 놓자 (${cov.size}/6)` : st === 3 ? `③ 남은 카드도 (${n}/${CARDS.length})` : `모두 맞혔다 — 틀린 시도 ${miss}번`;
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    function drop(k, e) {
      const q = CARDS.find((c) => c.k === k); if (!q || placed[k] || !e) return false;
      const good = q.e === e.k;
      if (good) { placed[k] = 1; flash = { e: e.k, a: 1 }; window.RxT.jolt(stage, 1); say(`<b>${q.n}</b> → <b>${nameOf(e)}</b>: ${q.why}`); }
      else {
        miss += 1; const [x, y] = padXY(e, S.W, S.H); bounce = { x, y, a: 1 };
        say(`튕겼다 — 거기는 <b>${nameOf(e)}</b> 사이. <b>${q.n}</b>: ${q.why}. 어느 두 권역이 얽혔을까?`);
      }
      steps(); S.kick(); return good;
    }
    const cardPos = (W, H, i) => [W * (0.085 + (i % 6) * 0.166), L(H) + 22 + Math.floor(i / 6) * 37];
    // 권역 구슬 그림(크기가 바뀔 때만 오프스크린에)
    function orb(c, s, x, y, r) {
      c.save(); c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.clip();
      const lg = (y0, y1, st) => { const g = c.createLinearGradient(0, y0, 0, y1); st.forEach(([o, col]) => g.addColorStop(o, col)); return g; };
      if (s === 'atm') {
        c.fillStyle = lg(y - r, y + r, [[0, '#2e6fc0'], [1, '#bfe3fb']]); c.fillRect(x - r, y - r, 2 * r, 2 * r);
        c.fillStyle = 'rgba(255,255,255,.95)'; [[-0.3, 0.15, 0.32], [0.05, 0.02, 0.4], [0.38, 0.18, 0.28], [0.05, 0.28, 0.34]].forEach(([u, v, k]) => { c.beginPath(); c.arc(x + u * r, y + v * r, k * r, 0, Math.PI * 2); c.fill(); });
        c.fillStyle = 'rgba(120,150,190,.35)'; c.fillRect(x - r, y + 0.42 * r, 2 * r, 0.1 * r);
      } else if (s === 'hyd') {
        c.fillStyle = lg(y - r, y + r, [[0, '#8fd0f7'], [0.35, '#2f86d6'], [1, '#0a2c5e']]); c.fillRect(x - r, y - r, 2 * r, 2 * r);
        c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = Math.max(2, r * 0.06);
        for (let j = 0; j < 3; j++) { const yy = y - 0.35 * r + j * 0.32 * r; c.beginPath(); for (let u = -1; u <= 1.01; u += 0.1) c.lineTo(x + u * r, yy + Math.sin(u * 7 + j) * r * 0.06); c.stroke(); }
      } else if (s === 'geo') {
        [['#9a6a3a', -1], ['#7d532c', -0.45], ['#c4945a', -0.1], ['#6a4526', 0.25], ['#4c311b', 0.6]].forEach(([col, v]) => { c.fillStyle = col; c.beginPath(); c.moveTo(x - r, y + v * r + 0.1 * r); for (let u = -1; u <= 1.01; u += 0.25) c.lineTo(x + u * r, y + v * r + Math.sin(u * 3) * 0.08 * r); c.lineTo(x + r, y + r); c.lineTo(x - r, y + r); c.fill(); });
        c.fillStyle = 'rgba(255,255,255,.18)'; for (let j = 0; j < 14; j++) { c.beginPath(); c.arc(x + Math.sin(j * 7.1) * 0.8 * r, y + Math.cos(j * 3.3) * 0.8 * r, r * 0.04, 0, Math.PI * 2); c.fill(); }
      } else {
        c.fillStyle = lg(y - r, y + r, [[0, '#bde9a8'], [1, '#2f8a45']]); c.fillRect(x - r, y - r, 2 * r, 2 * r);
        // 잎 한 장(잎맥 포함)
        c.save(); c.translate(x, y); c.rotate(-0.6);
        c.fillStyle = '#2f9a4a'; c.beginPath(); c.moveTo(0, -0.7 * r); c.quadraticCurveTo(0.55 * r, -0.1 * r, 0, 0.7 * r); c.quadraticCurveTo(-0.55 * r, -0.1 * r, 0, -0.7 * r); c.fill();
        c.strokeStyle = 'rgba(220,255,210,.8)'; c.lineWidth = Math.max(1.5, r * 0.04); c.beginPath(); c.moveTo(0, -0.62 * r); c.lineTo(0, 0.75 * r); c.stroke();
        for (let j = -2; j <= 2; j++) { c.beginPath(); c.moveTo(0, j * 0.2 * r); c.lineTo(0.25 * r, j * 0.2 * r - 0.15 * r); c.moveTo(0, j * 0.2 * r); c.lineTo(-0.25 * r, j * 0.2 * r - 0.15 * r); c.stroke(); }
        c.restore();
      }
      // 구슬 빛(왼쪽 위 밝게, 오른쪽 아래 그늘)
      const g = c.createRadialGradient(x - 0.35 * r, y - 0.4 * r, r * 0.1, x, y, r * 1.05); g.addColorStop(0, 'rgba(255,255,255,.35)'); g.addColorStop(0.5, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(0,0,0,.35)');
      c.fillStyle = g; c.fillRect(x - r, y - r, 2 * r, 2 * r); c.restore();
      c.strokeStyle = SPH[s][1]; c.lineWidth = 4; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.stroke();
    }
    // 투명 바탕에 별·구슬만 그린다(배경과 줄은 매 프레임 그 아래에)
    function scene(W, H) {
      if (art && artW === W && artH === H) return art;
      art = document.createElement('canvas'); art.width = W; art.height = H; artW = W; artH = H; const c = art.getContext('2d'), l = L(H), r = R(W, H);
      let s = 5; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
      for (let i = 0; i < 50; i++) { c.fillStyle = `rgba(255,255,255,${0.15 + rnd() * 0.35})`; c.fillRect(rnd() * W, rnd() * l, 1.3, 1.3); }
      Object.keys(NODE).forEach((k) => { const [x, y] = nodeXY(k, W, H); orb(c, k, x, y, r); });
      return art;
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const l = L(H), r = R(W, H);
        const g = c.createRadialGradient(W / 2, l / 2, 10, W / 2, l / 2, W * 0.7); g.addColorStop(0, '#20305a'); g.addColorStop(1, '#0c1430'); c.fillStyle = g; c.fillRect(0, 0, W, l);
        // 줄(맞힌 카드가 있으면 밝고 알갱이가 오간다)
        EDGES.forEach((e, i) => {
          const [ax, ay] = nodeXY(e.a, W, H), [bx, by] = nodeXY(e.b, W, H), n = CARDS.filter((q) => q.e === e.k && placed[q.k]).length;
          c.strokeStyle = n ? 'rgba(255,230,140,.85)' : 'rgba(170,190,230,.35)'; c.lineWidth = n ? 4 : 3; c.setLineDash(n ? [] : [8, 7]);
          c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke(); c.setLineDash([]);
          if (n) for (let j = 0; j < 3 * n; j++) {
            const ph = (t * 0.25 + j / (3 * n) + i * 0.13) % 1, fw = j % 2 === 0, u = fw ? ph : 1 - ph, ca = SPH[fw ? e.a : e.b][1];
            const x = ax + (bx - ax) * u, y = ay + (by - ay) * u, ox = -(by - ay), oy = bx - ax, d = Math.hypot(ox, oy) || 1, sh = (fw ? 5 : -5);
            P.glow(c, x + ox / d * sh, y + oy / d * sh, 9, ca); c.fillStyle = '#fff'; c.beginPath(); c.arc(x + ox / d * sh, y + oy / d * sh, 2.4, 0, Math.PI * 2); c.fill();
          }
        });
        c.drawImage(scene(W, H), 0, 0, W, l, 0, 0, W, l);
        // 이름표: 위·아래 구슬은 오른쪽 옆에(가운데 줄의 카드와 겹치지 않게), 좌우 구슬은 아래에
        Object.keys(NODE).forEach((k) => { const [x, y] = nodeXY(k, W, H), side = k === 'atm' || k === 'geo'; P.txt(c, SPH[k][0], side ? x + r + 10 : x, side ? y + 7 : y + r + 24, '#fff', '800 19px', side ? 'left' : 'center'); });
        if (flash) {
          const e = EDGES.find((z) => z.k === flash.e); [e.a, e.b].forEach((s2) => { const [x, y] = nodeXY(s2, W, H); c.strokeStyle = `rgba(255,216,77,${flash.a})`; c.lineWidth = 6; c.beginPath(); c.arc(x, y, r + 6 + (1 - flash.a) * 14, 0, Math.PI * 2); c.stroke(); });
          flash.a -= dt * 0.9; if (flash.a <= 0) flash = null;
        }
        // 고리와 붙은 카드
        const hot = drag ? nearest(drag.x, drag.y, W, H) : null;
        EDGES.forEach((e) => {
          const [px, py] = padXY(e, W, H), on = CARDS.filter((q) => q.e === e.k && placed[q.k]);
          c.fillStyle = hot === e ? 'rgba(255,216,77,.35)' : 'rgba(12,18,36,.7)'; c.strokeStyle = hot === e ? '#ffd84d' : 'rgba(200,215,245,.7)'; c.lineWidth = 2.5;
          c.beginPath(); c.arc(px, py, 13 + (hot === e ? 3 * Math.sin(t * 8) + 3 : 0), 0, Math.PI * 2); c.fill(); c.stroke();
          on.forEach((q, j) => tag(c, q, px, py + (j - (on.length - 1) / 2) * 34, 0.96, '#ffd84d', 14));
        });
        // 받침
        c.fillStyle = 'rgba(12,18,36,.95)'; c.fillRect(0, l, W, H - l);
        CARDS.forEach((q, i) => { if (placed[q.k] || (drag && drag.k === q.k)) return; const [x, y] = cardPos(W, H, i); tag(c, q, x, y, 1, i === sel ? '#ffd84d' : '#5a6a90', 15); });
        if (drag) tag(c, CARDS.find((q) => q.k === drag.k), drag.x, drag.y, 0.92, '#ffd84d', 15);
        if (bounce) { c.strokeStyle = `rgba(239,91,76,${bounce.a})`; c.lineWidth = 4; c.beginPath(); c.arc(bounce.x, bounce.y, 40 * (2 - bounce.a), 0, Math.PI * 2); c.stroke(); bounce.a -= dt * 1.5; if (bounce.a <= 0) bounce = null; }
      },
      down(p) {
        const i = CARDS.findIndex((q, j) => { if (placed[q.k]) return false; const [x, y] = cardPos(S.W, S.H, j); return Math.abs(p.x - x) < S.W * 0.08 && Math.abs(p.y - y) < 18; });
        if (i >= 0) { sel = i; drag = { k: CARDS[i].k, x: p.x, y: p.y }; }
      },
      move(p, e, held) { if (held && drag) { drag.x = p.x; drag.y = Math.min(p.y, L(S.H) - 8); } },
      up(p) {
        if (!drag) return; const k = drag.k, x = drag.x, y = drag.y; drag = null;
        const e = p.y < L(S.H) ? nearest(x, y, S.W, S.H) : null;
        if (e) drop(k, e); else { if (p.y < L(S.H)) say('줄 위의 <b>고리</b> 가까이에 놓자 — 두 권역을 잇는 줄이다'); S.kick(); }
      },
      key(e) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { const left = CARDS.map((q, i) => i).filter((i) => !placed[CARDS[i].k]); if (!left.length) return true; const j = left.indexOf(sel); sel = left[(Math.max(0, j) + (e.key === 'ArrowRight' ? 1 : left.length - 1)) % left.length]; return true; }
        const ei = '123456'.indexOf(e.key);
        if (ei >= 0) { const q = CARDS[sel]; if (q && !placed[q.k]) drop(q.k, EDGES[ei]); return true; }
        if (e.key === '0') { reset(); return true; } return false;
      },
    });
    function tag(c, q, x, y, a, edge, fs) {
      c.globalAlpha = a; c.font = `800 ${fs}px "IBM Plex Sans KR", sans-serif`; const w = c.measureText(q.n).width + 20, h = fs + 14;
      c.save(); c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 6; c.shadowOffsetY = 3; c.fillStyle = '#fff7d6'; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, 8); c.fill(); c.restore();
      c.strokeStyle = edge; c.lineWidth = 2.5; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, 8); c.stroke();
      P.txt(c, q.n, x, y + fs * 0.35, '#1d2433', `800 ${fs}px`); c.globalAlpha = 1;
    }
    function reset() { placed = {}; miss = 0; drag = null; sel = 0; msg = ''; say('현상 카드를 끌어 두 권역을 잇는 줄의 고리에 놓자 — 어느 두 권역이 서로 영향을 주고받을까?'); steps(); S.kick(); }
    root.querySelector('.it-reset')?.addEventListener('click', reset);
    root._it = { put: (k) => { const q = CARDS.find((c) => c.k === k); return drop(k, EDGES.find((e) => e.k === q.e)); }, state: () => ({ placed: Object.keys(placed), miss }) };
    reset();
    console.assert(EDGES.every((e) => CARDS.filter((q) => q.e === e.k).length === 3), 'inter: 줄마다 카드 셋');
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Inter = { mount };
})();
