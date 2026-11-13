/* 2차시 표지(교과서 22쪽 과정 1): 한쪽 구석에 몰린 빨강·초록·파랑 초콜릿 10개씩을 도화지째 흔들어 골고루 섞는다.
   도화지를 끌면 도화지가 따라 움직이고, 초콜릿은 관성으로 뒤처지며 미끄러진다(가속도의 반대쪽으로 힘 + 작은 흔들림, 마찰, 서로 밀어냄).
   «골고루 섞인 정도» = 도화지를 6×4칸으로 나눈 칸 가운데 초콜릿이 들어 있는 칸의 비율. */
(function () {
  'use strict';
  const K = window.EvKit, C = window.EvChoco, { clamp } = K;
  const R = 13;

  function mount(root) {
    const cv = root.querySelector('.ev-sh-cv'), now = root.querySelector('.ev-sh-now'), bar = root.querySelector('.ev-sh-bar i');
    let g = K.fit(cv), pw = 0, ph = 0, ox = 0, oy = 0, vx = 0, vy = 0, held = null, lastO = [0, 0], lastV = [0, 0], mixed = 0;
    const ch = [];
    const still = cv.dataset.still === '1';   // 표지(2026-10-30 선생님 요청): 흔들지 않고 처음부터 골고루 펼쳐 둔다
    const cols = ['red', 'green', 'blue'];
    function lay() {
      pw = g.w * 0.84; ph = g.h * 0.8;
      ch.length = 0;
      cols.forEach((c) => { for (let i = 0; i < 10; i++) ch.push({ c, x: 24 + Math.random() * 90, y: 24 + Math.random() * 70, vx: 0, vy: 0 }); });
      if (still) { ch.forEach((p) => { p.x = R + Math.random() * (pw - 2 * R); p.y = R + Math.random() * (ph - 2 * R); }); for (let n = 0; n < 40; n++) apart(); }
    }
    function apart() {
      for (let i = 0; i < ch.length; i++) for (let j = i + 1; j < ch.length; j++) {
        const a = ch[i], b = ch[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01;
        if (d < 2 * R + 4) { const o = (2 * R + 4 - d) / 2, ux = dx / d, uy = dy / d; a.x -= ux * o; a.y -= uy * o; b.x += ux * o; b.y += uy * o; }
      }
      ch.forEach((p) => { p.x = clamp(p.x, R, pw - R); p.y = clamp(p.y, R, ph - R); });
    }
    function meter() {
      if (still) return;
      const occ = new Set(); ch.forEach((p) => occ.add(Math.floor(p.x / pw * 6) + ',' + Math.floor(p.y / ph * 4)));
      mixed = occ.size / 24; bar.style.width = Math.round(mixed * 100) + '%';
      if (mixed > 0.8) { now.textContent = '골고루 섞였다! 이제 포식자가 될 차례'; now.classList.add('done'); }
    }
    function step(dt) {
      if (!dt) return;
      if (!held) { ox += (0 - ox) * Math.min(1, dt * 8); oy += (0 - oy) * Math.min(1, dt * 8); }
      const nvx = (ox - lastO[0]) / dt, nvy = (oy - lastO[1]) / dt;
      const ax = (nvx - lastV[0]) / dt, ay = (nvy - lastV[1]) / dt;
      lastO = [ox, oy]; lastV = [nvx, nvy];
      const kick = Math.min(1, Math.hypot(ax, ay) / 4000);
      ch.forEach((p) => {
        p.vx += (-ax * 0.12 + (Math.random() - 0.5) * 900 * kick) * dt; p.vy += (-ay * 0.12 + (Math.random() - 0.5) * 900 * kick) * dt;
        const f = Math.exp(-4 * dt); p.vx *= f; p.vy *= f;
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.x < R) { p.x = R; p.vx = Math.abs(p.vx) * 0.5; } if (p.x > pw - R) { p.x = pw - R; p.vx = -Math.abs(p.vx) * 0.5; }
        if (p.y < R) { p.y = R; p.vy = Math.abs(p.vy) * 0.5; } if (p.y > ph - R) { p.y = ph - R; p.vy = -Math.abs(p.vy) * 0.5; }
      });
      for (let i = 0; i < ch.length; i++) for (let j = i + 1; j < ch.length; j++) {
        const a = ch[i], b = ch[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01;
        if (d < 2 * R) { const o = (2 * R - d) / 2, ux = dx / d, uy = dy / d; a.x -= ux * o; a.y -= uy * o; b.x += ux * o; b.y += uy * o; }
      }
      meter(); draw();
    }
    function draw() {
      const c = g.ctx; C.table(c, g.w, g.h);
      const x0 = (g.w - pw) / 2 + ox, y0 = (g.h - ph) / 2 + 10 + oy;
      c.save(); C.paper(c, x0, y0, pw, ph, C.PAPER);
      ch.forEach((p) => C.choco(c, x0 + p.x, y0 + p.y, R, C.COL[p.c]));
      c.restore();
    }
    lay(); draw();
    if (!still) K.hold(cv, {
      down(p) { held = { x: p.x - ox, y: p.y - oy }; return true; },
      move(p) { ox = clamp(p.x - held.x, -60, 60); oy = clamp(p.y - held.y, -40, 40); },
      up() { held = null; },
    }, (e) => K.cvPt(cv, e));
    const tk = K.ticker(step);
    root._sh = { mix: () => { ch.forEach((p) => { p.x = R + Math.random() * (pw - 2 * R); p.y = R + Math.random() * (ph - 2 * R); }); meter(); draw(); } };
    return {
      setActive(on) { if (on) { const was = g.w; g = K.fit(cv); if (was < 50 || (still && was !== g.w)) lay(); draw(); if (!still) tk.start(); } else tk.stop(); },
      fit() { g = K.fit(cv); lay(); draw(); },
    };
  }
  window.EvShake = { mount };
})();
