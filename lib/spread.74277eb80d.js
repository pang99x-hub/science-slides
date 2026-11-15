/* 흩어진 열 다시 모으기: 뜨거운 물컵 안에 모여 있던 열 알갱이가 방 안으로 퍼져 나간다(마구 걷기).
   방 안을 누르고 끌면 손 근처의 알갱이가 끌려오지만, 놓으면 다시 흩어진다. 알갱이 수(총량)는 늘 그대로이고,
   컵 안에 모여 있는 수(모아 쓰기 쉬운 정도)만 줄어든다. 컵 물 색도 식어 간다. */
(function () {
  'use strict';
  const { tok, label } = window.Stage;
  const TAU = Math.PI * 2, N = 180;

  function mount(root) {
    const cv = root.querySelector('.sp-cv'), nEl = root.querySelector('.sp-n'), totEl = root.querySelector('.sp-total');
    const useI = root.querySelector('.sp-use i'), hint = root.querySelector('.sp-hint');
    let g = window.Stage.fit(cv), P = [], hand = null, fast = 0, t = 0, frac = 1, seededW = 0;
    const geo = () => {
      const { w, h } = g, floor = h * 0.86, top = floor - h * 0.24, cx = w * 0.5, cup = { x0: cx - 54, x1: cx + 54, y0: top - 120, y1: top - 6 };
      return { w, h, floor, table: { x0: w * 0.3, x1: w * 0.7, y: top }, cup, wall: 26 };
    };
    const inCup = (p, G) => p.x > G.cup.x0 + 6 && p.x < G.cup.x1 - 6 && p.y > G.cup.y0 + 14 && p.y < G.cup.y1 - 4;
    function seed() {
      const G = geo();
      P = Array.from({ length: N }, () => ({ x: G.cup.x0 + 12 + Math.random() * (G.cup.x1 - G.cup.x0 - 24), y: G.cup.y0 + 24 + Math.random() * (G.cup.y1 - G.cup.y0 - 34), a: Math.random() * TAU, s: 50 + Math.random() * 50 }));
      seededW = g.w;
    }
    function step(dt) {
      const G = geo(), k = fast > 0 ? 5 : 1; fast = Math.max(0, fast - dt); t += dt;
      for (let sub = 0; sub < k; sub++) {
        for (const p of P) {
          const was = inCup(p, G);
          p.a += (Math.random() - 0.5) * 5 * Math.sqrt(dt);
          let vx = Math.cos(p.a) * p.s, vy = Math.sin(p.a) * p.s - (was ? 18 : 0);   // 컵 안 뜨거운 물은 위로 조금 더
          if (hand) {
            const dx = hand.x - p.x, dy = hand.y - p.y, d = Math.hypot(dx, dy);
            if (d < 150 && d > 1) { const f = 260 * (1 - d / 150); vx += dx / d * f; vy += dy / d * f; }
          }
          let nx = p.x + vx * dt, ny = p.y + vy * dt;
          // 방 벽·바닥·탁자
          if (nx < G.wall + 4 || nx > G.w - G.wall - 4) { p.a = Math.PI - p.a; nx = p.x; }
          if (ny < G.wall + 4 || ny > G.floor - 4) { p.a = -p.a; ny = p.y; }
          const T = G.table;
          if (nx > T.x0 && nx < T.x1 && ((p.y <= T.y - 4 && ny > T.y - 4) || (p.y >= T.y + 20 && ny < T.y + 20))) { p.a = -p.a; ny = p.y; }
          // 컵 벽: 위로 열린 곳으로만 드나든다
          const inside = nx > G.cup.x0 + 6 && nx < G.cup.x1 - 6 && ny > G.cup.y0 && ny < G.cup.y1 - 4;
          const wasIn = p.x > G.cup.x0 + 6 && p.x < G.cup.x1 - 6 && p.y > G.cup.y0 && p.y < G.cup.y1 - 4;
          if (wasIn && !inside && ny > G.cup.y0) { p.a = Math.PI - p.a; nx = p.x; }
          if (!wasIn && inside && p.y > G.cup.y0) { p.a = Math.PI - p.a; nx = p.x; ny = p.y; }
          p.x = nx; p.y = ny;
        }
      }
      draw();
    }
    function draw() {
      const { ctx, w, h } = g; if (w < 50) return;
      const G = geo();
      const inside = P.filter((p) => inCup(p, G)).length;
      frac += (inside / N - frac) * 0.2;
      // 방
      ctx.fillStyle = `rgb(${236 + 10 * (1 - frac)},${238 - 6 * (1 - frac)},${232 - 10 * (1 - frac)})`; ctx.fillRect(0, 0, w, h);
      ctx.fillStyle = '#d9cbb3'; ctx.fillRect(0, G.floor, w, h - G.floor);
      ctx.strokeStyle = tok('ink'); ctx.lineWidth = 4; ctx.strokeRect(G.wall, G.wall, w - G.wall * 2, G.floor - G.wall);
      // 창문
      ctx.fillStyle = '#d6e8f2'; ctx.lineWidth = 3; ctx.fillRect(w * 0.08, h * 0.12, w * 0.16, h * 0.22); ctx.strokeRect(w * 0.08, h * 0.12, w * 0.16, h * 0.22);
      ctx.beginPath(); ctx.moveTo(w * 0.16, h * 0.12); ctx.lineTo(w * 0.16, h * 0.34); ctx.moveTo(w * 0.08, h * 0.23); ctx.lineTo(w * 0.24, h * 0.23); ctx.stroke();
      // 탁자
      ctx.fillStyle = tok('wood'); ctx.fillRect(G.table.x0, G.table.y, G.table.x1 - G.table.x0, 16); ctx.strokeRect(G.table.x0, G.table.y, G.table.x1 - G.table.x0, 16);
      ctx.fillRect(G.table.x0 + 20, G.table.y + 16, 14, G.floor - G.table.y - 16); ctx.strokeRect(G.table.x0 + 20, G.table.y + 16, 14, G.floor - G.table.y - 16);
      ctx.fillRect(G.table.x1 - 34, G.table.y + 16, 14, G.floor - G.table.y - 16); ctx.strokeRect(G.table.x1 - 34, G.table.y + 16, 14, G.floor - G.table.y - 16);
      // 컵: 물 색은 컵 안 열 알갱이 비율로 식어 간다
      const hot = Math.min(1, frac * 1.3), c = G.cup;
      ctx.fillStyle = `rgb(${Math.round(120 + 112 * hot)},${Math.round(160 - 64 * hot)},${Math.round(200 - 140 * hot)})`;
      ctx.beginPath(); ctx.moveTo(c.x0 + 4, c.y0 + 18); ctx.lineTo(c.x1 - 4, c.y0 + 18); ctx.lineTo(c.x1 - 10, c.y1); ctx.lineTo(c.x0 + 10, c.y1); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = tok('ink'); ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(c.x0, c.y0); ctx.lineTo(c.x0 + 8, c.y1 + 6); ctx.lineTo(c.x1 - 8, c.y1 + 6); ctx.lineTo(c.x1, c.y0); ctx.stroke();
      ctx.beginPath(); ctx.arc(c.x1 + 8, (c.y0 + c.y1) / 2 + 6, 24, -1.2, 1.2); ctx.stroke();
      if (hot > 0.25) {
        ctx.strokeStyle = `rgba(160,170,185,${hot * 0.8})`; ctx.lineWidth = 4;
        for (let k = 0; k < 3; k++) { const x = c.x0 + 26 + k * 28, ph = (t * 0.6 + k * 0.33) % 1; ctx.globalAlpha = Math.sin(Math.PI * ph); ctx.beginPath(); for (let j = 0; j < 9; j++) ctx.lineTo(x + Math.sin(j * 0.9 + t * 4) * 6, c.y0 - 6 - ph * 30 - j * 7); ctx.stroke(); }
        ctx.globalAlpha = 1;
      }
      // 열 알갱이
      for (const p of P) {
        ctx.fillStyle = tok('e-heat'); ctx.strokeStyle = tok('paper-2'); ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(p.x, p.y, 5.5, 0, TAU); ctx.fill(); ctx.stroke();
      }
      // 손
      if (hand) {
        ctx.strokeStyle = tok('accent'); ctx.lineWidth = 3; ctx.setLineDash([8, 8]);
        ctx.beginPath(); ctx.arc(hand.x, hand.y, 150, 0, TAU); ctx.stroke(); ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(31,95,74,.18)'; ctx.beginPath(); ctx.arc(hand.x, hand.y, 30, 0, TAU); ctx.fill();
        ctx.font = '40px sans-serif'; ctx.textAlign = 'center'; ctx.fillText('✋', hand.x, hand.y + 14);
      }
      label(ctx, '뜨거운 물 한 컵', (c.x0 + c.x1) / 2, G.table.y + 48, '700 22px "IBM Plex Sans KR", sans-serif');
      nEl.textContent = String(inside); totEl.textContent = String(P.length);
      useI.style.width = `${Math.round(inside / N * 100)}%`;
    }
    const pt = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * g.w / r.width, y: (e.clientY - r.top) * g.h / r.height }; };
    cv.addEventListener('pointerdown', (e) => { hand = pt(e); cv.setPointerCapture(e.pointerId); cv.classList.add('dragging'); hint.classList.add('gone'); });
    cv.addEventListener('pointermove', (e) => { if (hand) hand = pt(e); });
    const up = () => { hand = null; cv.classList.remove('dragging'); };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    root.querySelector('#sp-wait').addEventListener('click', () => { fast = 3; });
    root.querySelector('#sp-reset').addEventListener('click', () => { seed(); frac = 1; if (!loop.on) draw(); });
    const loop = window.Stage.loop(step);
    return {
      setActive(on) {
        if (on) { g = window.Stage.fit(cv); if (!P.length || Math.abs(g.w - seededW) > 1) seed(); if (window.Stage.reduce) draw(); else loop.start(); }
        else loop.stop();
      },
      fit() { g = window.Stage.fit(cv); if (Math.abs(g.w - seededW) > 1) seed(); draw(); },
    };
  }
  window.HeatSpread = { mount };
})();
