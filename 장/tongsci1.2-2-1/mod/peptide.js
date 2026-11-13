/* 2-2 2차시 체험 «펩타이드 결합 잇기»(교과서 82쪽 그림 Ⅱ-29 단백질의 형성 · 측주 펩타이드결합).
   아미노산 카드 = 왼쪽 H₂N(아미노기) · 가운데 C · 오른쪽 COOH(카복실기) · 아래 곁사슬 R(색으로 종류 구분, 네 가지만 보임).
   아래 받침의 카드를 끌어 판의 사슬 끝(오른쪽 COOH 쪽, 또는 왼쪽 H₂N 쪽)에 놓으면 OH와 H가 반짝이며 떨어져
   물 분자가 되어 위로 떠올라 «빠져나온 물» 칸에 쌓이고, 두 카드 사이에 노란 펩타이드 결합 막대가 생긴다.
   받침 카드를 누르면 좌우가 뒤집힌다 — 아미노기끼리·카복실기끼리 마주 보게 놓으면 튕긴다.
   사슬은 판 폭에 맞춰 뱀처럼 꺾여 접힌다. 아미노산 n · 결합 n−1 · 물 n−1(참고서 내용), 이름(다이·트라이·폴리펩타이드 — 다른 자료 내용).
   Peptide.mount(root) → { fit, setActive } · 시험용: root._pp.add(n) · info() */
(function () {
  'use strict';
  const KIND = [
    { n: '글라이신', r: 'H', c: '#9aa6b8' }, { n: '알라닌', r: 'CH₃', c: '#5cc77a' },
    { n: '세린', r: 'CH₂OH', c: '#5aa9f0' }, { n: '라이신', r: '(CH₂)₄NH₂', c: '#f08cb4' },
  ];
  const MAX = 12; // 카드를 키워(11/10) 판에 세 줄 = 12개까지 — 폴리펩타이드(10개 이상)는 충분
  const NAME = (n) => (n < 2 ? '아미노산' : n === 2 ? '다이펩타이드' : n === 3 ? '트라이펩타이드' : n < 10 ? `펩타이드(아미노산 ${n}개)` : '폴리펩타이드');
  // 원자 공(명암·반사광)을 색·크기별로 오프스크린에 한 번 그려 두고 찍는다
  const balls = new Map();
  function ball(c, col, x, y, r) {
    const key = col + '|' + Math.round(r * 2), R2 = Math.ceil(r * 1.25), sc = 2;
    let cv = balls.get(key);
    if (!cv) {
      cv = document.createElement('canvas'); cv.width = cv.height = R2 * 2 * sc; const g = cv.getContext('2d'); g.scale(sc, sc);
      const gr = g.createRadialGradient(R2 - r * 0.35, R2 - r * 0.4, r * 0.08, R2, R2, r);
      gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.18, col); gr.addColorStop(1, 'rgba(0,0,0,.85)');
      g.fillStyle = col; g.beginPath(); g.arc(R2, R2, r, 0, Math.PI * 2); g.fill();
      g.globalAlpha = 0.85; g.fillStyle = gr; g.fill(); g.globalAlpha = 1;
      balls.set(key, cv);
    }
    c.drawImage(cv, x - R2, y - R2, R2 * 2, R2 * 2);
  }
  const stick = (c, x1, y1, x2, y2, w) => { c.lineCap = 'round'; c.strokeStyle = '#4a5370'; c.lineWidth = w + 2; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.strokeStyle = '#b9c2d8'; c.lineWidth = w; c.stroke(); };
  const EL = { N: '#3b6fd8', O: '#e0503f', C: '#3a3f4b', H: '#eef2f7' };

  function mount(root) {
    const stage = root.querySelector('.pp-stage'), now = root.querySelector('.pp-now'), out = root.querySelector('.pp-out'), cnt = root.querySelector('.pp-count');
    const P = window.Play;
    let chain = [], waters = [], flashes = [], drag = null, bounce = null, t = 0, msg = '';
    const flip = [false, false, false, false];
    const done = new Set();
    const G = (W, H) => {
      const cw = Math.min(132, W / 7), ch = cw * 0.72, gap = cw * 0.42, top = 74, left = 34, per = Math.max(2, Math.floor((W * 0.74 - left + gap) / (cw + gap)));
      return { cw, ch, gap, top, left, per, rowH: ch * 1.65, trayY: H - 52, pool: [W * 0.78, 18, W * 0.2, H * 0.42] };
    };
    // 뱀 모양 자리: 짝수 줄은 왼→오, 홀수 줄은 오→왼. 홀수 줄 카드는 좌우가 뒤집혀 보인다(N→C 방향 유지)
    const slot = (g, k) => { const row = Math.floor(k / g.per), col = k % g.per, c = row % 2 ? g.per - 1 - col : col; return { x: g.left + g.cw / 2 + c * (g.cw + g.gap), y: g.top + g.ch / 2 + row * g.rowH, rev: row % 2 === 1 }; };
    function say(h) { if (h !== msg) { msg = h; out.innerHTML = h; } }
    function stats() {
      const n = chain.length, b = Math.max(0, n - 1);
      cnt.innerHTML = `<span>아미노산 <b>${n}</b></span><span>펩타이드 결합 <b>${b}</b></span><span>빠져나온 물 <b>${b}</b></span><span class="pp-name">${n ? NAME(n) : '—'}</span>`;
      if (n >= 2) done.add(1); if (n >= 3) done.add(2); if (n >= 10) done.add(3);
      const ok = [...done], st = [1, 2, 3].find((k) => !done.has(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 아미노산 둘을 이어 보자' : st === 2 ? '② 하나 더 이어 트라이펩타이드로' : st === 3 ? `③ 열 개 넘게 이어 폴리펩타이드로(지금 ${n}개)` : '이을 때마다 물 한 분자가 빠진다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
      return { n, bonds: b, water: b, name: NAME(n) };
    }
    function bond(g, at, kind) { // at: 'end' | 'start'
      const k = at === 'end' ? chain.length - 1 : 0, s = slot(g, k), dir = s.rev ? -1 : 1;
      const jx = at === 'end' ? s.x + dir * (g.cw / 2 + g.gap / 2) : s.x - dir * (g.cw / 2 + g.gap / 2);
      const a = { kind, x: jx, y: s.y, born: t };
      if (at === 'end') chain.push(a); else chain.unshift(a);
      flashes.push({ x: jx, y: s.y, a: 1 });
      waters.push({ x: jx, y: s.y, vx: (Math.random() - 0.5) * 30, at: t });
      window.RxT.jolt(stage, 1);
      say(`<b>${KIND[kind].n}</b>를 이었다 — 카복실기의 <b>OH</b>와 아미노기의 <b>H</b>가 떨어져 <b>물(H₂O)</b>이 되고, 그 자리에 <b>펩타이드 결합</b>이 생겼다`);
    }
    function tryDrop(g, kind, x, y, rev) {
      if (!chain.length) { chain.push({ kind, x, y, born: t }); say(`첫 아미노산 <b>${KIND[kind].n}</b>(곁사슬 ${KIND[kind].r}). 다음 카드를 끝에 이어 보자`); return true; }
      if (chain.length >= MAX) { say(`판이 꽉 찼다(${MAX}개) — 실제 단백질은 아미노산이 수십~수천 개`); return false; }
      const e = slot(g, chain.length), f0 = slot(g, 0), sx = f0.x - (f0.rev ? -1 : 1) * (g.cw + g.gap);
      // 맨 앞 카드 왼쪽이 아니면 판 어디에 놓아도 사슬 끝에 잇는다(2026-11-10 실제 끌기 시험: 점선 칸을 정확히 맞히기 어려움)
      const nearStart = Math.hypot(x - sx, y - f0.y) < g.cw * 0.85, nearEnd = !nearStart && (Math.hypot(x - e.x, y - e.y) < g.cw * 0.85 || y < g.trayY - 40);
      if (!nearEnd && !nearStart) return false;
      const facing = nearEnd ? (rev ? 'COOH' : 'H₂N') : (rev ? 'H₂N' : 'COOH'), want = nearEnd ? 'H₂N' : 'COOH';
      if (facing !== want) {
        bounce = { x, y, a: 1 }; window.RxT.jolt(stage, 1);
        say(`튕겼다! ${facing === 'H₂N' ? '아미노기끼리' : '카복실기끼리'}는 붙지 않는다 — 펩타이드 결합은 <b>카복실기와 아미노기 사이</b>에서 생긴다. 받침 카드를 눌러 뒤집어 보자`);
        return false;
      }
      bond(g, nearEnd ? 'end' : 'start', kind); return true;
    }
    function card(c, g, x, y, kind, rev, alpha = 1, ends = [true, true]) {
      const { cw, ch } = g, K = KIND[kind], top = y - ch / 2, h = ch * 0.62;
      c.globalAlpha = alpha;
      c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.roundRect(x - cw / 2 + 3, top + 4, cw, h, 9); c.fill(); // 그림자
      const pg = c.createLinearGradient(0, top, 0, top + h); pg.addColorStop(0, '#2c3b6a'); pg.addColorStop(1, '#172042');
      c.fillStyle = pg; c.strokeStyle = K.c; c.lineWidth = 2; c.beginPath(); c.roundRect(x - cw / 2, top, cw, h, 9); c.fill(); c.stroke();
      const L = rev ? 'COOH' : 'H₂N', R = rev ? 'H₂N' : 'COOH', fs = Math.round(cw * 0.16), ya = y - ch * 0.29, r = cw * 0.1;
      const lx = x - cw * 0.3, rx = x + cw * 0.3;
      // 곁사슬로 내려가는 막대 → 곁사슬 알약
      stick(c, x, ya, x, y + ch * 0.2, 3);
      if (ends[0]) stick(c, lx, ya, x, ya, 3); if (ends[1]) stick(c, x, ya, rx, ya, 3);
      if (ends[0]) { ball(c, L === 'H₂N' ? EL.N : EL.O, lx, ya, r); P.txt(c, L, lx, y - ch * 0.04, L === 'H₂N' ? '#9cc9ff' : '#ffb0a4', `800 ${fs}px`); }
      if (ends[1]) { ball(c, R === 'H₂N' ? EL.N : EL.O, rx, ya, r); P.txt(c, R, rx, y - ch * 0.04, R === 'H₂N' ? '#9cc9ff' : '#ffb0a4', `800 ${fs}px`); }
      stick(c, x, ya, x, ya - ch * 0.17, 2); ball(c, EL.H, x, ya - ch * 0.17, r * 0.62); P.txt(c, 'H', x + r * 0.95, ya - ch * 0.13, '#eef2f7', `800 ${Math.round(fs * 0.8)}px`); // 가운데 탄소의 수소(가운데 카드가 C만 보여 허전했음)
      ball(c, EL.C, x, ya, r * 1.1); P.txt(c, 'C', x, ya + fs * 0.36, '#fbfcf9', `800 ${fs}px`);
      const rg = c.createLinearGradient(0, y + ch * 0.12, 0, y + ch * 0.46); rg.addColorStop(0, K.c); rg.addColorStop(1, 'rgba(0,0,0,.35)');
      c.fillStyle = K.c; c.beginPath(); c.roundRect(x - cw * 0.3, y + ch * 0.12, cw * 0.6, ch * 0.34, 7); c.fill();
      c.fillStyle = rg; c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.roundRect(x - cw * 0.26, y + ch * 0.14, cw * 0.52, ch * 0.08, 4); c.fill();
      P.txt(c, K.r, x, y + ch * 0.37, '#1d2433', `800 ${Math.round(cw * 0.16)}px`);
      c.globalAlpha = 1;
    }
    function water(c, x, y, s = 1) { // 공-막대 H₂O(굽은 모양)
      const h1 = [x - 10 * s, y + 7 * s], h2 = [x + 10 * s, y + 7 * s];
      stick(c, x, y, h1[0], h1[1], 2 * s); stick(c, x, y, h2[0], h2[1], 2 * s);
      ball(c, EL.H, h1[0], h1[1], 5.5 * s); ball(c, EL.H, h2[0], h2[1], 5.5 * s); ball(c, EL.O, x, y, 9 * s);
    }
    const trayPos = (W, g, i) => [W * (0.14 + i * 0.2), g.trayY];
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const g = G(W, H);
        const bg = c.createRadialGradient(W * 0.4, H * 0.3, 10, W * 0.45, H * 0.45, Math.max(W, H) * 0.8); bg.addColorStop(0, '#1f2b52'); bg.addColorStop(1, '#0b1124'); c.fillStyle = bg; c.fillRect(0, 0, W, H);
        // 빠져나온 물 칸
        const [px, py, pw, ph] = g.pool;
        c.fillStyle = 'rgba(90,169,240,.12)'; c.strokeStyle = 'rgba(127,209,255,.6)'; c.setLineDash([6, 5]); c.lineWidth = 2; c.beginPath(); c.roundRect(px, py, pw, ph, 12); c.fill(); c.stroke(); c.setLineDash([]);
        P.txt(c, `빠져나온 물 ${waters.length}`, px + pw / 2, py + 24, '#7fd1ff', '800 17px');
        waters.forEach((w, i) => {
          const tx = px + 22 + (i % 5) * (pw - 44) / 4, ty = py + ph - 22 - Math.floor(i / 5) * 26;
          const k = Math.min(1, (t - w.at) / 1.6), e = k * k * (3 - 2 * k);
          const x = w.x + (tx - w.x) * e + Math.sin(t * 2 + i) * 3 * (1 - e) + (1 - e) * w.vx * k, y = w.y + (ty - w.y) * e - Math.sin(k * Math.PI) * 60 + Math.sin(t * 1.6 + i) * 2;
          water(c, x, y, 0.85);
          if (k < 1) P.txt(c, 'H₂O', x, y - 18, '#7fd1ff', '700 13px');
        });
        // 사슬
        chain.forEach((a, k) => { const s = slot(g, k), m = 1 - Math.pow(0.001, dt); a.x += (s.x - a.x) * m * 2; a.y += (s.y - a.y) * m * 2; });
        for (let k = 0; k < chain.length - 1; k++) { // 펩타이드 결합 막대(줄 끝에서 꺾이면 세로)
          const a = chain[k], b = chain[k + 1], sa = slot(g, k), sb = slot(g, k + 1);
          const ax = sa.y === sb.y ? a.x + (sa.rev ? -1 : 1) * g.cw / 2 : a.x, ay = sa.y === sb.y ? a.y - g.ch * 0.12 : a.y + g.ch * 0.5;
          const bx = sa.y === sb.y ? b.x - (sb.rev ? -1 : 1) * g.cw / 2 : b.x, by = sa.y === sb.y ? b.y - g.ch * 0.12 : b.y - g.ch * 0.31;
          c.lineCap = 'round'; c.strokeStyle = 'rgba(255,216,77,.25)'; c.lineWidth = 16; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke();
          c.strokeStyle = '#ffd84d'; c.lineWidth = 6; c.stroke(); c.strokeStyle = '#fff6c8'; c.lineWidth = 2; c.stroke();
          if (k === 0) P.txt(c, '펩타이드 결합', (ax + bx) / 2, Math.min(a.y, b.y) - g.ch * 0.5 - 6, '#ffd84d', '700 13px');
        }
        chain.forEach((a, k) => { const s = slot(g, k), age = Math.min(1, (t - a.born) / 0.35); card(c, g, a.x, a.y, a.kind, s.rev, age, [k === 0, k === chain.length - 1]); });
        if (!chain.length) P.txt(c, '여기에 첫 아미노산을 놓자', g.left + g.cw * 1.6, g.top + g.ch * 0.3, 'rgba(251,252,249,.55)', '700 18px', 'left');
        else if (chain.length < MAX) { // 다음 자리 안내(점선)
          const e = slot(g, chain.length); c.strokeStyle = 'rgba(255,216,77,.45)'; c.setLineDash([5, 5]); c.lineWidth = 2; c.beginPath(); c.roundRect(e.x - g.cw / 2, e.y - g.ch / 2, g.cw, g.ch * 0.62, 9); c.stroke(); c.setLineDash([]);
        }
        flashes.forEach((f) => { P.glow(c, f.x, f.y, 40 * f.a + 10, `rgba(255,216,77,${f.a})`); P.txt(c, 'OH + H', f.x, f.y - 26, `rgba(255,255,255,${f.a})`, '800 14px'); f.a -= dt * 1.2; });
        flashes = flashes.filter((f) => f.a > 0);
        // 받침
        { const ty = g.trayY - g.ch * 0.6, bench = c.createLinearGradient(0, ty, 0, H); bench.addColorStop(0, '#3a4766'); bench.addColorStop(0.06, '#2a3555'); bench.addColorStop(1, '#1a2240'); c.fillStyle = bench; c.fillRect(0, ty, W, H - ty); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(0, ty, W, 2); }
        KIND.forEach((k, i) => { const [x, y] = trayPos(W, g, i); card(c, g, x, y, i, flip[i], drag && drag.i === i ? 0.35 : 1); P.txt(c, k.n + (flip[i] ? ' (뒤집힘)' : ''), x, y + g.ch * 0.62, '#fbfcf9', '700 13px'); });
        if (drag) card(c, g, drag.x, drag.y, drag.i, flip[drag.i], 0.92);
        if (bounce) { c.strokeStyle = `rgba(239,91,76,${bounce.a})`; c.lineWidth = 4; c.beginPath(); c.arc(bounce.x, bounce.y, 50 * (2 - bounce.a), 0, Math.PI * 2); c.stroke(); bounce.a -= dt * 1.5; if (bounce.a <= 0) bounce = null; }
      },
      down(p) {
        const g = G(S.W, S.H), i = KIND.findIndex((_, k) => { const [x, y] = trayPos(S.W, g, k); return Math.abs(p.x - x) < g.cw / 2 && Math.abs(p.y - y) < g.ch * 0.5; });
        if (i >= 0) drag = { i, x: p.x, y: p.y, sx: p.x, sy: p.y };
      },
      move(p, e, held) { if (held && drag) { drag.x = p.x; drag.y = p.y; } },
      up(p) {
        if (!drag) return; const g = G(S.W, S.H), d = drag; drag = null;
        if (Math.hypot(p.x - d.sx, p.y - d.sy) < 8) { flip[d.i] = !flip[d.i]; say(`${KIND[d.i].n} 카드를 뒤집었다 — 왼쪽이 ${flip[d.i] ? '카복실기' : '아미노기'}`); return; }
        if (!tryDrop(g, d.i, p.x, p.y, flip[d.i]) && chain.length && !bounce) say('카드를 판 위로 끌어 올려 놓자 — 맨 앞 카드 왼쪽에 놓으면 앞에 붙는다');
        stats();
      },
      key(e) { // 1~4 그 아미노산을 끝에 잇기 · Backspace 마지막 빼기 · 0 처음부터
        const i = '1234'.indexOf(e.key);
        if (i >= 0) { const g = G(S.W, S.H), s = slot(g, chain.length); tryDrop(g, i, s.x, s.y, false); stats(); return true; }
        if (e.key === 'Backspace' && chain.length) { chain.pop(); if (waters.length > Math.max(0, chain.length - 1)) waters.pop(); stats(); return true; }
        if (e.key === '0') { reset(); return true; }
        return false;
      },
    });
    function reset() { chain = []; waters = []; flashes = []; done.clear(); flip.fill(false); msg = ''; say('받침의 아미노산 카드를 끌어 판에 놓자'); stats(); S.kick(); }
    root.querySelector('.pp-reset')?.addEventListener('click', reset);
    reset();
    root._pp = {
      add(n) { const g = G(S.W || 700, S.H || 470); for (let k = 0; k < n; k++) { const s = slot(g, chain.length); tryDrop(g, chain.length % 4, s.x, s.y, false); } S.kick(); return stats(); },
      info: stats,
    };
    // 자체 검사: 결합·물 수는 n−1
    console.assert(NAME(2) === '다이펩타이드' && NAME(12) === '폴리펩타이드', 'peptide 이름 규칙');
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Peptide = { mount };
})();
