/* 2차시 4장: 도화지 색(환경)을 2차원 색판(가로 색상, 세로 밝기)에서 고르고, 컴퓨터가 모의실험을 빠르게 되풀이한다.
   세대마다 40개 가운데 20개를 집는다(가중치 0.02 + (도화지와의 Lab 색차/100)²) → 남은 20개가 같은 색으로 두 배. 자손 5 %는 다른 색(돌연변이).
   수와 비율은 이해를 돕기 위한 모형. */
(function () {
  'use strict';
  const K = window.EvKit, C = window.EvChoco, { clamp } = K;
  const CS = ['red', 'yellow', 'green', 'blue', 'brown'];
  const N = 40, RAD = 16;
  function hsl(h, s, l) {
    const k = (n) => (n + h / 30) % 12, a = s * Math.min(l, 1 - l);
    const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, 9 - k(n), 1));
    return [f(0) * 255, f(8) * 255, f(4) * 255];
  }
  const padColor = (u, v) => hsl(u * 360, 0.72, K.lerp(0.86, 0.16, v));

  function mount(root) {
    const cv = root.querySelector('.ev-pp-cv'), pad = root.querySelector('.ev-pad'), pc = root.querySelector('.ev-pp-pad'), dot = root.querySelector('.ev-pad-dot');
    const chart = root.querySelector('.ev-pp-chart'), now = root.querySelector('.ev-pp-now'), genT = root.querySelector('.ev-pp-gen'), runB = root.querySelector('.ev-pp-run');
    let g = K.fit(cv), pg = K.fit(pc), cg = K.fit(chart);
    let u = 48 / 360, v = 0.3, paper = padColor(u, v), ch = [], hist = [], gen = 0, run = true, timer = 0, moves = 0, lastWin = null, flips = 0;
    function spot() { return { x: Math.random(), y: Math.random() }; }
    function reset() {
      ch = []; CS.forEach((c) => { for (let i = 0; i < N / 5; i++) ch.push({ c, ...spot(), pop: 1, out: 0 }); });
      hist = [share()]; gen = 0; genT.textContent = '0세대'; flips = 0; lastWin = null; drawChart();
    }
    function share() { const n = {}; CS.forEach((c) => { n[c] = 0; }); ch.forEach((o) => { if (!o.out) n[o.c]++; }); const t = ch.filter((o) => !o.out).length || 1; CS.forEach((c) => { n[c] /= t; }); return n; }
    function generation() {
      ch = ch.filter((o) => !o.out);
      const live = ch.slice();
      for (let k = 0; k < N / 2; k++) { const w = live.map((o) => 0.02 + Math.pow(C.vis(C.COL[o.c], paper) / 100, 2)); const i = K.pickW(w); live[i].out = 0.001; live.splice(i, 1); }
      live.forEach((o) => { let c = o.c; if (Math.random() < 0.05) c = CS.filter((x) => x !== c)[Math.floor(Math.random() * 4)]; ch.push({ c, ...spot(), pop: 0, out: 0 }); });
      gen++; genT.textContent = gen + '세대';
      const s = share(); hist.push(s); if (hist.length > 41) hist.shift();
      const win = CS.reduce((a, b) => (s[b] > s[a] ? b : a));
      if (s[win] > 0.6) { if (lastWin && lastWin !== win) { flips++; } lastWin = win; }
      if (flips >= 1) { now.textContent = `도화지가 바뀌자 이기는 색이 ${C.NAME[win]}(으)로 바뀌었다`; now.classList.add('done'); }
      drawChart();
    }
    function drawPad() {
      const { ctx: c, w, h } = pg;
      for (let x = 0; x < w; x += 4) for (let y = 0; y < h; y += 4) { c.fillStyle = K.hex(padColor(x / w, y / h)); c.fillRect(x, y, 4, 4); }
      dot.style.left = (u * 100) + '%'; dot.style.top = (v * 100) + '%'; dot.style.background = K.hex(paper);
    }
    function drawChart() {
      const { ctx: c, w, h } = cg; c.clearRect(0, 0, w, h);
      c.strokeStyle = '#c3cecd'; c.lineWidth = 1; c.fillStyle = '#7b8597'; c.font = '600 13px "IBM Plex Sans KR", sans-serif';
      [0, 0.5, 1].forEach((q) => { const y = h - 6 - (h - 16) * q; c.beginPath(); c.moveTo(34, y); c.lineTo(w - 50, y); c.stroke(); c.fillText(Math.round(q * 100) + '%', 0, y + 4); });
      CS.forEach((cc) => {
        c.strokeStyle = K.hex(C.COL[cc]); c.lineWidth = cc === 'yellow' ? 5 : 3.5; c.beginPath();
        hist.forEach((s, i) => { const x = 34 + (w - 90) * i / 40, y = h - 6 - (h - 16) * s[cc]; if (i) c.lineTo(x, y); else c.moveTo(x, y); }); c.stroke();
        const last = hist[hist.length - 1]; if (last[cc] > 0.12) { c.fillStyle = '#1d2433'; c.font = '700 14px "IBM Plex Sans KR", sans-serif'; c.fillText(C.NAME[cc], 34 + (w - 90) * (hist.length - 1) / 40 + 6, h - 2 - (h - 16) * last[cc]); }
      });
    }
    function draw() {
      const c = g.ctx; C.table(c, g.w, g.h);
      const px = 24, py = 24, pw = g.w - 48, ph = g.h - 48; C.paper(c, px, py, pw, ph, paper);
      ch.forEach((o) => { const a = o.out ? 1 - o.out : 1; if (a <= 0) return; C.choco(c, px + RAD + o.x * (pw - 2 * RAD), py + RAD + o.y * (ph - 2 * RAD), RAD * (0.3 + 0.7 * o.pop), C.COL[o.c], a); });
    }
    function step(dt) {
      ch.forEach((o) => { if (o.pop < 1) o.pop = Math.min(1, o.pop + dt * 3); if (o.out) o.out = Math.min(1, o.out + dt * 3); });
      if (run) { timer += dt; if (timer > 0.9) { timer = 0; generation(); } }
      draw();
    }
    function setUV(a, b) {
      u = clamp(a, 0, 1); v = clamp(b, 0, 1); paper = padColor(u, v); drawPad(); draw();
      moves++; if (moves === 1 || !now.classList.contains('done')) now.textContent = '② 세대가 흐르는 동안 다시 다른 색으로 바꾸어 보자';
    }
    K.hold(pad, {
      down(p) { setUV(p.x, p.y); return true; },
      move(p) { setUV(p.x, p.y); },
      up() {},
    }, (e) => { const r = pc.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }; });
    pad.addEventListener('keydown', (e) => {
      const d = { ArrowLeft: [-0.03, 0], ArrowRight: [0.03, 0], ArrowUp: [0, -0.05], ArrowDown: [0, 0.05] }[e.key];
      if (!d) return; e.preventDefault(); e.stopPropagation(); setUV(u + d[0], v + d[1]);
    });
    runB.addEventListener('click', () => { run = !run; runB.setAttribute('aria-pressed', String(run)); runB.textContent = run ? '멈추기' : '이어 가기'; });
    root.querySelector('.ev-pp-reset').addEventListener('click', () => { reset(); draw(); });
    reset();
    const tk = K.ticker(step);
    root._pp = { set: (a, b) => setUV(a, b), gens: (n) => { for (let i = 0; i < n; i++) generation(); ch.forEach((o) => { o.pop = 1; }); draw(); } };
    return {
      setActive(on) { if (on) { g = K.fit(cv); pg = K.fit(pc); cg = K.fit(chart); drawPad(); drawChart(); draw(); tk.start(); } else tk.stop(); },
      fit() { g = K.fit(cv); pg = K.fit(pc); cg = K.fit(chart); drawPad(); drawChart(); draw(); },
    };
  }
  window.EvPaper = { mount };
})();
