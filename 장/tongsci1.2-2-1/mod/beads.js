/* 2-2 2차시 표지 «구슬 목걸이 접기»(교과서 82쪽 도입: 아미노산이 이어져 단백질이 된다).
   아래 받침의 색 구슬 여섯 종류(아미노산 A~F)를 끌어 위 줄에 꿰면 줄 끝에 붙는다. 6개 이상이면 구슬끼리의
   끌림(같은 종류끼리, A–D·B–E 짝끼리) 때문에 줄이 저절로 구부러지고 접혀 덩어리가 된다(계속 움직이는 물리).
   줄의 구슬 하나를 끌어 다른 구슬 위에 놓으면 둘이 자리를 바꾸고, 접힌 모양이 달라진다.
   키보드: 1~6 그 종류 구슬 꿰기, S 두 구슬 바꾸기, 0 처음부터.
   Beads.mount(root) → { fit, setActive } · 시험용: root._bd.fill(n) · swap() · state() */
(function () {
  'use strict';
  const T = [
    { c: '#ef5b4c', s: 'circle' }, { c: '#f2a03d', s: 'square' }, { c: '#5cc77a', s: 'tri' },
    { c: '#5aa9f0', s: 'diamond' }, { c: '#b07cf0', s: 'hex' }, { c: '#f4d35e', s: 'circle' },
  ];
  const NAME = 'ABCDEF', MAX = 14;
  const likes = (a, b) => a === b || (a + 3) % 6 === b || (b + 3) % 6 === a; // 같은 종류, A–D·B–E·C–F 짝

  function shape(c, s, x, y, r) {
    c.beginPath();
    if (s === 'circle') c.arc(x, y, r, 0, Math.PI * 2);
    else if (s === 'square') c.rect(x - r * 0.88, y - r * 0.88, r * 1.76, r * 1.76);
    else { const n = s === 'tri' ? 3 : s === 'diamond' ? 4 : 6, a0 = s === 'hex' ? 0 : -Math.PI / 2; for (let k = 0; k < n; k++) { const a = a0 + k / n * Math.PI * 2; c[k ? 'lineTo' : 'moveTo'](x + Math.cos(a) * r * 1.12, y + Math.sin(a) * r * 1.12); } c.closePath(); }
  }

  // 유리구슬 한 알(그림자·방사형 명암·반사광)을 오프스크린에 한 번 그려 두고 찍는다
  const cache = new Map();
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = (v) => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
  function bead(c, t, x, y, r) {
    const key = `${t}|${Math.round(r * 2)}`, sc = 2, R2 = Math.ceil(r * 1.5);
    let cv = cache.get(key);
    if (!cv) {
      cv = document.createElement('canvas'); cv.width = cv.height = R2 * 2 * sc; const g = cv.getContext('2d'); g.scale(sc, sc);
      const q = T[t], cx = R2, cy = R2 - r * 0.08;
      g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(cx + r * 0.12, cy + r * 1.05, r * 0.9, r * 0.28, 0, 0, Math.PI * 2); g.fill();
      const gr = g.createRadialGradient(cx - r * 0.35, cy - r * 0.4, r * 0.1, cx, cy, r * 1.2);
      gr.addColorStop(0, shade(q.c, 0.55)); gr.addColorStop(0.45, q.c); gr.addColorStop(1, shade(q.c, -0.5));
      g.fillStyle = gr; shape(g, q.s, cx, cy, r); g.fill();
      g.strokeStyle = shade(q.c, -0.6); g.lineWidth = 1.2; g.stroke();
      g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.ellipse(cx - r * 0.32, cy - r * 0.42, r * 0.26, r * 0.15, -0.6, 0, Math.PI * 2); g.fill();
      cache.set(key, cv);
    }
    c.drawImage(cv, x - R2, y - R2, R2 * 2, R2 * 2);
  }
  function thread(c, pts, w) { // 꼰 실: 어두운 바탕 + 밝은 결
    if (pts.length < 2) return;
    const path = () => { c.beginPath(); pts.forEach(([x, y], i) => c[i ? 'lineTo' : 'moveTo'](x, y)); };
    c.lineCap = 'round'; c.lineJoin = 'round';
    path(); c.strokeStyle = '#6b5a3e'; c.lineWidth = w + 2; c.stroke();
    path(); c.strokeStyle = '#d9c39a'; c.lineWidth = w; c.stroke();
    path(); c.setLineDash([3, 4]); c.strokeStyle = 'rgba(120,96,60,.8)'; c.lineWidth = w * 0.5; c.stroke(); c.setLineDash([]);
  }

  function mount(root) {
    const stage = root.querySelector('.bd-stage'), now = root.querySelector('.bd-now');
    const P = window.Play;
    let C = [], drag = null, swapped = false;
    const FILL = [0, 1, 3, 2, 4, 0, 5, 3, 1, 4, 2, 0, 5, 3];
    const R = () => Math.min(S.W, S.H) * 0.042;
    const anchor = () => [S.W * 0.5, S.H * 0.18];
    const trayY = () => S.H - R() * 2.2, trayX = (k) => S.W * (0.14 + k * 0.144);
    function add(t) {
      if (C.length >= MAX) return;
      const last = C[C.length - 1], [ax, ay] = anchor();
      C.push({ t, x: last ? last.x + R() * 2 : ax, y: last ? last.y + R() * 0.6 : ay, vx: 0, vy: 0 });
    }
    function swapPair(i, j) { const t = C[i].t; C[i].t = C[j].t; C[j].t = t; if (C.length >= 6) swapped = true; }
    function step(dt) {
      const r = R(), L = r * 2.3, n = C.length, fold = n >= 6;
      const [ax, ay] = anchor();
      for (let s = 0; s < 3; s++) {
        const h = dt / 3;
        for (let i = 0; i < n; i++) {
          const a = C[i]; let fx = 0, fy = 0;
          if (i === 0) { fx += (ax - a.x) * 40; fy += (ay - a.y) * 40; }
          for (let j = 0; j < n; j++) {
            if (j === i) continue;
            const b = C[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01, ux = dx / d, uy = dy / d;
            if (Math.abs(i - j) === 1) { const f = (d - L) * 60; fx += ux * f; fy += uy * f; }
            if (d < r * 2.1) { const f = (r * 2.1 - d) * 120; fx -= ux * f; fy -= uy * f; }
            else if (fold && Math.abs(i - j) > 2 && d < r * 16 && likes(a.t, b.t)) { const f = 160; fx += ux * f; fy += uy * f; }
          }
          if (!fold && i > 0) fy += 30; // 접히기 전에는 줄이 아래로 늘어진다
          a.vx = (a.vx + fx * h) * Math.pow(0.12, h); a.vy = (a.vy + fy * h) * Math.pow(0.12, h);
        }
        C.forEach((a) => { if (a !== drag?.b) { a.x += a.vx * h; a.y += a.vy * h; } a.x = Math.max(r, Math.min(S.W - r, a.x)); a.y = Math.max(r, Math.min(trayY() - r * 2, a.y)); });
      }
    }
    function chip() {
      const nt = C.length < 6 ? `아래 구슬을 끌어 줄에 꿰자 (${C.length}/6)` : !swapped ? '줄이 저절로 접힌다 — 구슬 둘의 자리를 바꿔 보자' : '순서가 바뀌면 접힌 모양도 바뀐다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', swapped); }
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        if (dt) step(dt);
        const r = R();
        const bg = c.createRadialGradient(W * 0.5, H * 0.35, 10, W * 0.5, H * 0.4, Math.max(W, H) * 0.75);
        bg.addColorStop(0, '#1f2b52'); bg.addColorStop(1, '#0b1124'); c.fillStyle = bg; c.fillRect(0, 0, W, H);
        const [ax, ay] = anchor();
        c.fillStyle = '#8a93a8'; c.beginPath(); c.arc(ax, ay - r * 2.4, 5, 0, Math.PI * 2); c.fill(); // 줄을 건 못
        thread(c, [[ax, ay - r * 2.4], [ax, ay], ...C.map((b) => [b.x, b.y])], 3);
        C.forEach((b) => { if (b === drag?.b) return; bead(c, b.t, b.x, b.y, r); P.txt(c, NAME[b.t], b.x, b.y + 5, 'rgba(29,36,51,.85)', '800 14px'); });
        // 받침: 나무 쟁반
        const ty = trayY() - r * 1.8, wood = c.createLinearGradient(0, ty, 0, H);
        wood.addColorStop(0, '#6b4a2e'); wood.addColorStop(0.08, '#8a6440'); wood.addColorStop(1, '#5a3c24');
        c.fillStyle = wood; c.fillRect(0, ty, W, H - ty);
        c.strokeStyle = 'rgba(40,24,12,.25)'; c.lineWidth = 1; for (let k = 1; k < 6; k++) { const yy = ty + (H - ty) * k / 6; c.beginPath(); c.moveTo(0, yy); c.bezierCurveTo(W * 0.3, yy - 3, W * 0.6, yy + 3, W, yy); c.stroke(); }
        P.txt(c, '아미노산 구슬 — 끌어서 줄에 꿰기', W * 0.5, ty - 6, 'rgba(200,212,240,.85)', '600 14px');
        T.forEach((t, k) => { bead(c, k, trayX(k), trayY(), r); P.txt(c, NAME[k], trayX(k), trayY() + 5, 'rgba(29,36,51,.85)', '800 14px'); });
        if (drag) { c.globalAlpha = 0.9; bead(c, drag.t, drag.x, drag.y, r * 1.1); c.globalAlpha = 1; }
        chip();
      },
      down(p) {
        const r = R();
        const k = T.findIndex((_, i) => Math.hypot(p.x - trayX(i), p.y - trayY()) < r * 1.4);
        if (k >= 0) { drag = { t: k, x: p.x, y: p.y, from: 'tray' }; return; }
        const b = C.find((q) => Math.hypot(p.x - q.x, p.y - q.y) < r * 1.3);
        if (b) drag = { t: b.t, x: p.x, y: p.y, from: 'chain', b };
      },
      move(p, e, held) { if (held && drag) { drag.x = p.x; drag.y = p.y; } },
      up(p) {
        if (!drag) return; const r = R();
        if (drag.from === 'tray') { if (p.y < trayY() - r * 2) add(drag.t); }
        else { const j = C.findIndex((q) => q !== drag.b && Math.hypot(p.x - q.x, p.y - q.y) < r * 1.6); if (j >= 0) swapPair(C.indexOf(drag.b), j); }
        drag = null;
      },
      key(e) {
        const k = '123456'.indexOf(e.key); if (k >= 0) { add(k); return true; }
        if (e.key === 's' || e.key === 'S') { api.swap(); return true; }
        if (e.key === '0') { C = []; swapped = false; return true; }
        return false;
      },
    });
    const api = {
      fill(n) { for (let i = 0; i < n; i++) add(FILL[C.length % FILL.length]); S.kick(); return C.length; },
      swap() { const i = C.findIndex((b, k) => k > 0 && C.some((q) => q.t !== b.t)); const j = C.findIndex((q) => q.t !== C[i]?.t); if (i >= 0 && j >= 0) swapPair(i, j); S.kick(); return swapped; },
      state: () => ({ n: C.length, swapped, seq: C.map((b) => NAME[b.t]).join('') }),
    };
    root._bd = api;
    console.assert(likes(0, 3) && likes(2, 2) && !likes(0, 1), 'beads: 끌림 규칙');
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Beads = { mount };
})();
