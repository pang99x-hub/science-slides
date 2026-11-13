/* 1차시 4장(교과서 21쪽 해 보기): 산불로 검게 변한 토양과 딱정벌레. 손가락으로 땅을 문지르면 그 자리가 탄다(격자 값 0~1).
   새는 일정한 간격으로 날아와 한 마리를 잡는다: 눈에 띄는 정도 = 몸 색과 발밑 흙색의 Lab 색차 → 가중치 0.04 + v^2.5.
   여덟 마리가 잡히면 한 세대: 살아남은 벌레 가운데서 부모를 골라 마흔 마리로 채운다(자식은 부모 몸 색, 10 %는 한 단계 다르게). 수는 이해를 돕기 위한 모형. */
(function () {
  'use strict';
  const K = window.EvKit, { clamp } = K;
  const SHADE = [[226, 218, 202], [176, 166, 150], [124, 116, 106], [78, 72, 68], [34, 32, 32]];
  const SOIL = [200, 186, 162], BURNT = [38, 34, 33];
  const START = [10, 10, 8, 7, 5], N = 40, CELL = 16;

  function mount(root) {
    const cv = root.querySelector('.ev-bt-cv'), hc = root.querySelector('.ev-bt-hist');
    const now = root.querySelector('.ev-bt-now'), genT = root.querySelector('.ev-bt-gen'), fastB = root.querySelector('.ev-bt-fast');
    let g = K.fit(cv), hg = K.fit(hc);
    let cols = 0, rows = 0, burn = null, tex = null, burnCv = null;
    let bugs = [], gen = 1, caught = 0, bird = null, wait = 1.2, fast = false, tm = 0, painted = false;
    const r = Math.random;
    function grid() {
      const c2 = Math.ceil(g.w / CELL) + 1, r2 = Math.ceil(g.h / CELL) + 1;
      const old = burn, oc = cols, or = rows;
      cols = c2; rows = r2; burn = new Float32Array(cols * rows);
      if (old) for (let y = 0; y < Math.min(or, rows); y++) for (let x = 0; x < Math.min(oc, cols); x++) burn[y * cols + x] = old[y * oc + x];
    }
    function texture() {
      tex = document.createElement('canvas'); tex.width = Math.ceil(g.w); tex.height = Math.ceil(g.h);
      const c = tex.getContext('2d'), rr = K.rng(3);
      for (let i = 0; i < g.w * g.h / 260; i++) { c.fillStyle = rr() < 0.5 ? 'rgba(90,70,50,.10)' : 'rgba(255,255,255,.10)'; c.beginPath(); c.arc(rr() * g.w, rr() * g.h, 1 + rr() * 3, 0, 7); c.fill(); }
      for (let i = 0; i < 18; i++) { c.fillStyle = 'rgba(120,110,95,.25)'; c.beginPath(); c.ellipse(rr() * g.w, rr() * g.h, 6 + rr() * 10, 4 + rr() * 6, rr() * 3, 0, 7); c.fill(); }
      burnCv = document.createElement('canvas'); burnCv.width = tex.width; burnCv.height = tex.height;
      redrawBurn();
    }
    function redrawBurn() {
      const c = burnCv.getContext('2d'); c.clearRect(0, 0, burnCv.width, burnCv.height); c.filter = 'blur(8px)';
      for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++) {
        const v = burn[y * cols + x]; if (v < 0.02) continue;
        c.fillStyle = `rgba(${BURNT.join(',')},${v.toFixed(3)})`; c.fillRect(x * CELL - CELL / 2, y * CELL - CELL / 2, CELL, CELL);
      }
      c.filter = 'none';
    }
    const burnAt = (x, y) => { const i = clamp(Math.round(y / CELL), 0, rows - 1) * cols + clamp(Math.round(x / CELL), 0, cols - 1); return burn[i] || 0; };
    const soilAt = (x, y) => K.mix(SOIL, BURNT, Math.min(1, burnAt(x, y)));
    function scorch(px, py, rad, amt) {
      for (let y = Math.floor((py - rad) / CELL); y <= Math.ceil((py + rad) / CELL); y++) for (let x = Math.floor((px - rad) / CELL); x <= Math.ceil((px + rad) / CELL); x++) {
        if (x < 0 || y < 0 || x >= cols || y >= rows) continue;
        const d = Math.hypot(x * CELL - px, y * CELL - py); if (d > rad) continue;
        const i = y * cols + x; burn[i] = Math.min(1, burn[i] + amt * (1 - d / rad));
      }
      const c = burnCv.getContext('2d'), gr = c.createRadialGradient(px, py, 0, px, py, rad);
      gr.addColorStop(0, `rgba(${BURNT.join(',')},${amt.toFixed(2)})`); gr.addColorStop(0.6, `rgba(${BURNT.join(',')},${(amt * 0.6).toFixed(2)})`); gr.addColorStop(1, `rgba(${BURNT.join(',')},0)`);
      c.fillStyle = gr; c.beginPath(); c.arc(px, py, rad, 0, 7); c.fill();
      painted = true;
    }
    const sparks = [];
    function spawn(shade, x, y, baby) { return { s: shade, x, y, a: r() * 6.28, sp: 6 + r() * 10, turn: 0, born: baby ? 0 : 1, dead: false }; }
    function reset() {
      burn.fill(0); redrawBurn(); bugs = []; gen = 1; caught = 0; bird = null; wait = 1.2; painted = false;
      START.forEach((n, s) => { for (let i = 0; i < n; i++) bugs.push(spawn(s, 40 + r() * (g.w - 80), 80 + r() * (g.h - 120), false)); });
      genT.textContent = '1세대'; now.textContent = '① 손가락으로 땅을 문질러 검게 태우자'; now.classList.remove('done'); hist();
    }
    const visOf = (b) => clamp(K.dE(SHADE[b.s], soilAt(b.x, b.y)) / 60, 0, 1);
    function nextGen() {
      const alive = bugs.filter((b) => !b.dead);
      bugs = alive;
      while (bugs.length < N && alive.length) {
        const p = alive[Math.floor(r() * alive.length)];
        let s = p.s; if (r() < 0.1) s = clamp(s + (r() < 0.5 ? -1 : 1), 0, 4);
        bugs.push(spawn(s, clamp(p.x + (r() - 0.5) * 60, 20, g.w - 20), clamp(p.y + (r() - 0.5) * 60, 60, g.h - 20), true));
      }
      gen++; caught = 0; genT.textContent = gen + '세대'; hist();
      const burntShare = burn.reduce((a, b) => a + b, 0) / burn.length;
      const dark = bugs.filter((b) => b.s >= 3).length / bugs.length;
      if (burntShare > 0.5 && gen >= 4 && dark > 0.6) { now.textContent = '검게 탄 땅에서는 어두운 딱정벌레가 더 많이 남았다'; now.classList.add('done'); }
      else if (painted && !now.classList.contains('done')) now.textContent = '② 새가 어떤 벌레를 잡는지, 막대그래프가 어떻게 바뀌는지 보자';
    }
    function hist() {
      const { ctx: c, w, h } = hg; c.clearRect(0, 0, w, h);
      const cnt = [0, 0, 0, 0, 0]; bugs.forEach((b) => { if (!b.dead) cnt[b.s]++; });
      const tot = cnt.reduce((a, b) => a + b, 0) || 1, bw = w / 5, top = Math.max(0.5, ...cnt.map((n) => n / tot), ...START.map((n) => n / N));
      c.strokeStyle = '#c3cecd'; c.lineWidth = 1; for (let i = 1; i <= 4; i++) { const y = h - 26 - (h - 40) * i / 4; c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
      cnt.forEach((n, i) => {
        const v = n / tot, bh = (h - 58) * v / top, x = i * bw + bw * 0.18;
        const g0 = START[i] / N, gh = (h - 58) * g0 / top;
        c.setLineDash([5, 4]); c.strokeStyle = '#7b8597'; c.lineWidth = 2; c.strokeRect(x, h - 26 - gh, bw * 0.64, gh); c.setLineDash([]);
        c.fillStyle = K.hex(SHADE[i]); c.fillRect(x, h - 26 - bh, bw * 0.64, bh); c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.strokeRect(x, h - 26 - bh, bw * 0.64, bh);
        c.fillStyle = '#1d2433'; c.font = '700 17px "IBM Plex Sans KR", sans-serif'; c.textAlign = 'center';
        c.fillText(Math.round(v * 100) + '%', x + bw * 0.32, h - 32 - bh);
      });
      c.fillStyle = '#4b566a'; c.font = '600 14px "IBM Plex Sans KR", sans-serif'; c.textAlign = 'left'; c.fillText('점선: 1세대', 4, h - 6);
    }
    function drawBug(c, b) {
      const k = b.born < 1 ? 0.4 + 0.6 * b.born : 1;
      c.save(); c.translate(b.x, b.y); c.rotate(b.a); c.scale(k, k);
      c.strokeStyle = '#141414'; c.lineWidth = 2;
      const t = tm * 14 + b.x;
      for (let i = -1; i <= 1; i++) for (const sd of [-1, 1]) { const w = Math.sin(t + i) * 3; c.beginPath(); c.moveTo(i * 6, sd * 6); c.lineTo(i * 6 + w + i * 3, sd * 15); c.stroke(); }
      c.fillStyle = K.hex(SHADE[b.s]);
      c.beginPath(); c.ellipse(-2, 0, 13, 9, 0, 0, 7); c.fill(); c.stroke();
      c.beginPath(); c.ellipse(13, 0, 5, 5.5, 0, 0, 7); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(-15, 0); c.lineTo(9, 0); c.stroke();
      c.beginPath(); c.moveTo(17, -3); c.lineTo(23, -8); c.moveTo(17, 3); c.lineTo(23, 8); c.stroke();
      c.restore();
    }
    function drawBird(c, B) {
      c.save(); c.translate(B.x, B.y); c.scale(B.dir, 1);
      const f = Math.sin(tm * 18) * 0.6;
      c.fillStyle = '#7a5434'; c.strokeStyle = '#1d2433'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(-10, -4); c.quadraticCurveTo(-40, -40 - 30 * f, -70, -20 - 26 * f); c.quadraticCurveTo(-40, -6, -10, 8); c.fill(); c.stroke();
      c.beginPath(); c.ellipse(0, 0, 34, 20, 0, 0, 7); c.fill(); c.stroke();
      c.beginPath(); c.arc(34, -12, 16, 0, 7); c.fill(); c.stroke();
      c.fillStyle = '#d8d0c0'; c.beginPath(); c.moveTo(46, -16); c.lineTo(68, -8); c.lineTo(46, -4); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#fff'; c.beginPath(); c.arc(38, -16, 4.5, 0, 7); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.arc(39, -16, 2.4, 0, 7); c.fill();
      if (B.prey) { c.translate(64, -6); c.rotate(1.2); drawBug(c, { ...B.prey, x: 0, y: 0, a: 0, born: 1 }); }
      c.restore();
    }
    function step(dt) {
      tm += dt;
      const sp = fast ? 4 : 1;
      bugs.forEach((b) => {
        if (b.dead) return;
        b.born = Math.min(1, b.born + dt * 1.5);
        b.turn += (r() - 0.5) * dt * 6; b.turn *= 0.96; b.a += b.turn * dt * 3;
        b.x += Math.cos(b.a) * b.sp * dt; b.y += Math.sin(b.a) * b.sp * dt;
        if (b.x < 24 || b.x > g.w - 24) b.a = Math.PI - b.a; if (b.y < 70 || b.y > g.h - 20) b.a = -b.a;
        b.x = clamp(b.x, 22, g.w - 22); b.y = clamp(b.y, 68, g.h - 18);
      });
      // 새
      if (!bird) {
        wait -= dt * sp;
        if (wait <= 0) {
          const live = bugs.filter((b) => !b.dead);
          if (live.length) {
            const t = live[K.pickW(live.map((b) => 0.04 + Math.pow(visOf(b), 2.5)))];
            const from = r() < 0.5 ? -80 : g.w + 80;
            bird = { x: from, y: 40 + r() * 80, dir: from < 0 ? 1 : -1, t, ph: 0, sx: from, sy: 40 };
          }
        }
      } else {
        const B = bird; B.ph += dt * sp * 1.6;
        if (B.ph < 1) { const u = B.ph; B.x = K.lerp(B.sx, B.t.x - 60 * B.dir, u); B.y = K.lerp(B.sy, B.t.y + 4, u * u); }
        else if (!B.prey) { B.prey = B.t; B.t.dead = true; caught++; hist(); }
        if (B.ph >= 1) { const u = B.ph - 1; B.x += B.dir * 420 * dt * sp; B.y -= 260 * dt * sp; if (u > 1.4) { bird = null; wait = 0.5 + r() * 0.5; if (caught >= 8) nextGen(); } }
      }
      for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; s.t -= dt; s.y -= 40 * dt; if (s.t <= 0) sparks.splice(i, 1); }
      draw();
    }
    function draw() {
      const c = g.ctx; c.fillStyle = K.hex(SOIL); c.fillRect(0, 0, g.w, g.h);
      if (burnCv) c.drawImage(burnCv, 0, 0, g.w, g.h);
      if (tex) c.drawImage(tex, 0, 0, g.w, g.h);
      bugs.forEach((b) => { if (!b.dead) drawBug(c, b); });
      sparks.forEach((s) => { c.fillStyle = `rgba(255,${120 + Math.floor(100 * s.t)},40,${s.t})`; c.beginPath(); c.arc(s.x, s.y, 3 + 4 * s.t, 0, 7); c.fill(); });
      if (bird) drawBird(c, bird);
    }
    grid(); texture(); reset(); draw();
    let lastP = null;
    K.hold(cv, {
      down(p) { lastP = p; scorch(p.x, p.y, 56, 0.6); return true; },
      move(p) {
        const d = Math.hypot(p.x - lastP.x, p.y - lastP.y), n = Math.max(1, Math.ceil(d / 14));
        for (let i = 1; i <= n; i++) scorch(K.lerp(lastP.x, p.x, i / n), K.lerp(lastP.y, p.y, i / n), 56, 0.35);
        if (sparks.length < 60) sparks.push({ x: p.x + (r() - 0.5) * 30, y: p.y + (r() - 0.5) * 20, t: 1 });
        lastP = p; if (!now.classList.contains('done')) now.textContent = '② 새가 어떤 벌레를 잡는지, 막대그래프가 어떻게 바뀌는지 보자';
      },
      up() {},
    }, (e) => K.cvPt(cv, e));
    root.querySelector('.ev-bt-all').addEventListener('click', () => { for (let i = 0; i < burn.length; i++) burn[i] = 1; redrawBurn(); painted = true; draw(); now.textContent = '② 새가 어떤 벌레를 잡는지, 막대그래프가 어떻게 바뀌는지 보자'; });
    root.querySelector('.ev-bt-reset').addEventListener('click', () => { reset(); draw(); });
    fastB.addEventListener('click', () => { fast = !fast; fastB.setAttribute('aria-pressed', String(fast)); });
    const tk = K.ticker(step);
    root._bt = { burnAll: () => root.querySelector('.ev-bt-all').click(), gens: (n) => { for (let i = 0; i < n; i++) { const live = bugs.filter((b) => !b.dead); for (let k = 0; k < 8 && live.length; k++) { const t = live[K.pickW(live.map((b) => 0.04 + Math.pow(visOf(b), 2.5)))]; t.dead = true; live.splice(live.indexOf(t), 1); } nextGen(); } draw(); }, scorch };
    return {
      setActive(on) { if (on) { const was = g.w; g = K.fit(cv); hg = K.fit(hc); grid(); texture(); if (was < 50) reset(); hist(); if (K.reduce) draw(); tk.start(); } else tk.stop(); },
      fit() { g = K.fit(cv); hg = K.fit(hc); grid(); texture(); hist(); draw(); },
    };
  }
  window.EvBeetle = { mount };
})();
