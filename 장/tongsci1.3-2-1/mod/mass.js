/* 3-2 1차시 체험 «무거운 것이 먼저?»(교과서 125쪽 그림 Ⅲ-15 · 질량과 관계없는 중력 가속도).
   커다란 투명 낙하 관(높이 1.5 m) + 진공 펌프. 오른쪽 선반의 볼링공·탁구공·깃털·동전 가운데 둘을 끌어 관 위 집게 두 자리에 건다.
   빨간 집게 단추를 누르면 둘이 같은 높이에서 동시에 떨어진다(0.1초마다 잔상 + 속력). 바닥에 닿은 뒤 단추를 다시 누르면 같은 둘을 다시 건다.
   펌프 손잡이를 아래로 끌 때마다 관 속 공기가 빠진다(기압 막대). 공기 밸브를 누르면 공기가 다시 들어온다.
   공기 저항: a = g(1 − 공기 비율 · v²/vt²), vt = 공기 속 끝 속력(볼링공 80 · 탁구공 9 · 동전 12 · 깃털 0.5 m/s). 질량·끝 속력은 이해를 돕기 위한 예.
   화면은 실제의 ½ 빠르기(시간 표시는 실제 값). 키보드: 1~4 물체 걸기, 엔터 집게, 아래 화살표 펌프, A 공기 넣기, 0 처음부터.
   MassDrop.mount(root) → { fit, setActive } · 시험용: root._ms.hang(['bowl','feather']) · pump(번) · air() · release() · run(초) · state() */
(function () {
  'use strict';
  const TAU = Math.PI * 2, G = 9.8, HT = 1.5, SLOW = 0.5;
  const KINDS = {
    bowl: { name: '볼링공', mass: '약 6 kg', g: 6000, vt: 80, r: 44 },
    ping: { name: '탁구공', mass: '약 2.7 g', g: 2.7, vt: 9, r: 18 },
    feather: { name: '깃털', mass: '약 0.1 g', g: 0.1, vt: 0.5, r: 46 },
    coin: { name: '동전', mass: '약 7.7 g', g: 7.7, vt: 12, r: 20 },
  };
  const ORDER = ['bowl', 'ping', 'feather', 'coin'];
  const stepObj = (o, air, dt) => { const vt = KINDS[o.k].vt, a = G * (1 - air * (o.v * o.v) / (vt * vt)); o.v += a * dt; o.d += o.v * dt; o.t += dt; if (o.d >= HT) { o.d = HT; o.land = true; } };
  // 자체 확인: 진공에서는 볼링공과 깃털이 같은 시간, 공기 속에서는 깃털이 훨씬 늦고 탁구공은 거의 같다
  (function () {
    const fall = (k, air) => { const o = { k, v: 0, d: 0, t: 0, land: false }; while (!o.land) stepObj(o, air, 0.001); return o.t; };
    const vb = fall('bowl', 0), vf = fall('feather', 0), ab = fall('bowl', 1), af = fall('feather', 1), ap = fall('ping', 1);
    console.assert(Math.abs(vb - vf) < 1e-9 && Math.abs(vb - 0.553) < 0.01 && af > 2.5 && ap - ab < 0.03, 'mass: 낙하 시간');
  })();

  function mount(root) {
    const stage = root.querySelector('.ms-stage'), now = root.querySelector('.ms-now'), out = root.querySelector('.ms-out');
    const P = window.Play;
    let t, air, airIn, slots, pos, falling, last, pick, pumpY, pumpGrab, msg, ok, mode, art = null, artKey = '';
    function reset() {
      t = 0; air = 1; airIn = false; slots = [null, null]; falling = []; last = null; pick = null; pumpY = 0; pumpGrab = null; msg = ''; ok = new Set(); mode = 'idle';
      pos = {}; ORDER.forEach((k) => { pos[k] = { where: 'tray' }; });
      out.innerHTML = '선반의 물체 둘을 <b>집게</b>에 걸어 보자.'; steps();
    }
    const say = (h, done) => { if (h !== msg) { msg = h; now.textContent = h; now.classList.toggle('done', !!done); } };
    // 배치(슬라이드 화소)
    const lay = (W, H) => {
      const tx = W * 0.33, tw = 340, top = 112, bot = H - 30, clampY = top + 34, hang = top + 150, yb = bot - 34;
      return { tx, tw, top, bot, clampY, hang, yb, ppm: (yb - hang) / HT, sx: [tx - 82, tx + 82], btn: { x: tx, y: top - 4, r: 26 },
        px: W * 0.625, pTop: H * 0.3, pLen: H * 0.3, gx: tx - tw / 2 - 64, valve: { x: tx - tw / 2 - 10, y: bot - 64 },
        shelf: { x: W * 0.735, y: H * 0.5, w: W * 0.265 - 14 } };
    };
    const trayAt = (L, k) => { const i = ORDER.indexOf(k); return { x: L.shelf.x + 64 + (i % 2) * (L.shelf.w - 128), y: L.shelf.y + Math.floor(i / 2) * 150 - 6 }; };

    // ---------- 그림 ----------
    function drawObj(c, k, x, y, rot, flut) { // (x, y) = 중심
      const r = KINDS[k].r;
      c.save(); c.translate(x, y); c.rotate(rot || 0);
      if (k === 'bowl') {
        let g = c.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r); g.addColorStop(0, '#5a7bd8'); g.addColorStop(0.55, '#1e3478'); g.addColorStop(1, '#0a1230'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(140,170,255,.35)'; c.lineWidth = 2; c.beginPath(); c.arc(0, 0, r * 0.7, 3.6, 4.6); c.stroke();
        [[-0.18, -0.38], [0.14, -0.42], [-0.02, -0.1]].forEach(([u, v]) => { c.fillStyle = '#05081a'; c.beginPath(); c.arc(u * r, v * r, r * 0.11, 0, TAU); c.fill(); c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 1; c.stroke(); });
        c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(-r * 0.42, -r * 0.5, r * 0.18, r * 0.08, -0.6, 0, TAU); c.fill();
      } else if (k === 'ping') {
        const g = c.createRadialGradient(-r * 0.35, -r * 0.4, 1, 0, 0, r); g.addColorStop(0, '#ffffff'); g.addColorStop(0.7, '#ffb25a'); g.addColorStop(1, '#d9761e'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(160,80,10,.35)'; c.lineWidth = 1; c.beginPath(); c.arc(0, 0, r - 0.5, 0, TAU); c.stroke();
      } else if (k === 'coin') {
        let g = c.createLinearGradient(-r, -r, r, r); g.addColorStop(0, '#f2f2f0'); g.addColorStop(0.5, '#a9adb2'); g.addColorStop(1, '#6e7378'); c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, r, r, 0, 0, TAU); c.fill();
        c.strokeStyle = '#5a5e63'; c.lineWidth = 2; c.stroke(); c.strokeStyle = 'rgba(80,84,90,.6)'; c.lineWidth = 1; c.beginPath(); c.arc(0, 0, r * 0.74, 0, TAU); c.stroke();
        c.fillStyle = 'rgba(70,74,80,.75)'; c.font = `800 ${Math.round(r * 0.62)}px "IBM Plex Sans KR", sans-serif`; c.textAlign = 'center'; c.fillText('500', 0, r * 0.22);
      } else { // 깃털: 깃촉이 아래, 중심 기준 세로 길이 2r
        const L = r * 2; c.translate(0, r);
        for (let i = 0; i < 18; i++) {
          const u = 0.16 + i / 18 * 0.82, yy = -L * u, w = r * 0.42 * Math.sin(Math.PI * Math.min(1, u * 1.08)) * (1 + 0.08 * Math.sin(flut + i));
          c.strokeStyle = `rgba(${236 - i * 3},${231 - i * 3},${224 - i * 4},.97)`; c.lineWidth = 3;
          c.beginPath(); c.moveTo(0, yy); c.quadraticCurveTo(-w * 0.6, yy - 4, -w, yy - 11 - 2 * Math.sin(flut + i * 0.5)); c.stroke();
          c.beginPath(); c.moveTo(0, yy); c.quadraticCurveTo(w * 0.5, yy - 4, w * 0.85, yy - 10 - 2 * Math.cos(flut + i * 0.5)); c.stroke();
        }
        c.strokeStyle = 'rgba(110,95,75,.35)'; c.lineWidth = 1; for (let i = 0; i < 4; i++) { const yy = -L * (0.35 + i * 0.15); c.beginPath(); c.moveTo(0, yy); c.lineTo(-r * 0.3, yy - 12); c.stroke(); }
        c.strokeStyle = '#efe8d6'; c.lineWidth = 2.6; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -L); c.stroke();
        c.strokeStyle = '#9b8a6e'; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -L * 0.16); c.stroke();
      }
      c.restore();
    }
    function backdrop(W, H) {
      const key = W + 'x' + H; if (art && artKey === key) return art;
      art = document.createElement('canvas'); art.width = W * 2; art.height = H * 2; artKey = key; const c = art.getContext('2d'); c.scale(2, 2); const L = lay(W, H);
      // 실험실 벽과 책상
      let g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#e9edf2'); g.addColorStop(1, '#cfd6de'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      c.strokeStyle = 'rgba(29,36,51,.06)'; c.lineWidth = 1; for (let x = 0; x < W; x += 40) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); }
      g = c.createLinearGradient(0, L.bot, 0, H); g.addColorStop(0, '#9b7653'); g.addColorStop(1, '#6e5238'); c.fillStyle = g; c.fillRect(0, L.bot, W, H - L.bot);
      // 선반
      const sh = L.shelf; c.fillStyle = 'rgba(255,255,255,.55)'; c.strokeStyle = 'rgba(29,36,51,.25)'; c.lineWidth = 1.5; c.beginPath(); c.roundRect(sh.x, sh.y - 130, sh.w, 400, 12); c.fill(); c.stroke();
      [0, 1].forEach((j) => { const y = sh.y + j * 150 + 46; g = c.createLinearGradient(0, y, 0, y + 14); g.addColorStop(0, '#b8916a'); g.addColorStop(1, '#7c5a3a'); c.fillStyle = g; c.fillRect(sh.x + 10, y, sh.w - 20, 14); });
      P.txt(c, '선반 — 끌어서 집게에', sh.x + sh.w / 2, sh.y - 92, '#1d2433', '800 20px');
      return art;
    }
    function tube(c, L) {
      const { tx, tw, top, bot } = L, x0 = tx - tw / 2;
      // 유리관 안쪽(공기 비율에 따라 아주 옅은 푸른 기)
      c.fillStyle = `rgba(190,220,245,${0.12 + 0.18 * air})`; c.fillRect(x0, top, tw, bot - top);
      // 공기 알갱이(계속 움직인다)
      const n = Math.round(60 * air); let s = 9; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
      for (let i = 0; i < 60; i++) { const bx = rnd(), by = rnd(), ph = rnd() * TAU; if (i >= n) continue; const x = x0 + 8 + ((bx * (tw - 16) + 18 * Math.sin(t * 1.7 + ph)) % (tw - 16) + (tw - 16)) % (tw - 16), y = top + 40 + ((by * (bot - top - 80) + t * 14 * (0.5 + bx)) % (bot - top - 80)); c.fillStyle = 'rgba(70,120,180,.35)'; c.beginPath(); c.arc(x, y, 2.2, 0, TAU); c.fill(); }
      // 유리 반사·테두리
      let g = c.createLinearGradient(x0, 0, x0 + tw, 0); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(0.08, 'rgba(255,255,255,.08)'); g.addColorStop(0.85, 'rgba(255,255,255,0)'); g.addColorStop(0.93, 'rgba(255,255,255,.4)'); g.addColorStop(1, 'rgba(120,150,180,.3)'); c.fillStyle = g; c.fillRect(x0, top, tw, bot - top);
      c.strokeStyle = 'rgba(60,90,120,.75)'; c.lineWidth = 3; c.strokeRect(x0, top, tw, bot - top);
      // 눈금(0.5 m마다)
      for (let m = 0; m <= HT + 0.001; m += 0.25) { const y = L.hang + m * L.ppm, big = Math.abs(m % 0.5) < 0.01; c.strokeStyle = 'rgba(29,36,51,.7)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0 + tw, y); c.lineTo(x0 + tw + (big ? 14 : 8), y); c.stroke(); if (big) P.txt(c, `${m.toFixed(1)} m`, x0 + tw + 17, y + 7, '#1d2433', '700 18px', 'left'); }
      P.txt(c, '떨어진', x0 + tw + 17, L.hang - 40, '#1d2433', '700 18px', 'left'); P.txt(c, '거리', x0 + tw + 17, L.hang - 18, '#1d2433', '700 18px', 'left');
      // 바닥 받침(스펀지)
      g = c.createLinearGradient(0, L.yb, 0, bot); g.addColorStop(0, '#f2c14e'); g.addColorStop(1, '#c9932a'); c.fillStyle = g; c.fillRect(x0 + 3, L.yb, tw - 6, bot - L.yb - 2);
      c.fillStyle = 'rgba(120,80,10,.25)'; for (let i = 0; i < 30; i++) c.fillRect(x0 + 8 + (i * 37) % (tw - 16), L.yb + 6 + (i * 13) % (bot - L.yb - 12), 3, 3);
      // 위·아래 금속 마개
      const cap = (y, h) => { const gg = c.createLinearGradient(0, y, 0, y + h); gg.addColorStop(0, '#d5dae0'); gg.addColorStop(0.5, '#8d96a1'); gg.addColorStop(1, '#5c646e'); c.fillStyle = gg; c.beginPath(); c.roundRect(x0 - 14, y, tw + 28, h, 6); c.fill(); c.strokeStyle = '#3d444d'; c.lineWidth = 1.5; c.stroke(); };
      cap(top - 18, 26); cap(bot - 6, 18);
      // 집게 막대
      c.fillStyle = '#4a525c'; c.fillRect(tx - 110, L.clampY - 6, 220, 12);
    }
    function clampBtn(c, L) {
      const b = L.btn, armed = slots[0] && slots[1] && !falling.length, pul = armed ? 0.5 + 0.5 * Math.sin(t * 5) : 0;
      if (armed) { c.strokeStyle = `rgba(255,216,77,${0.5 + pul * 0.5})`; c.lineWidth = 4; c.beginPath(); c.arc(b.x, b.y, b.r + 8 + pul * 6, 0, TAU); c.stroke(); }
      const g = c.createRadialGradient(b.x - 8, b.y - 8, 3, b.x, b.y, b.r); g.addColorStop(0, '#ff8a7a'); g.addColorStop(1, '#a8231a'); c.fillStyle = g; c.beginPath(); c.arc(b.x, b.y, b.r, 0, TAU); c.fill(); c.strokeStyle = '#1d2433'; c.lineWidth = 2.5; c.stroke();
      P.txt(c, '집게', b.x, b.y + 7, '#fff', '800 18px');
    }
    function pump(c, L) {
      const { px, pTop, pLen } = L, bx = px - 34, by = pTop + 40, bh = pLen + 80;
      // 호스(펌프 아래 → 관 아래 마개)
      c.strokeStyle = '#2f3a46'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(px, by + bh); c.bezierCurveTo(px, L.bot + 10, L.tx + L.tw / 2 + 60, L.bot + 16, L.tx + L.tw / 2 + 14, L.bot + 2); c.stroke();
      // 몸통
      let g = c.createLinearGradient(bx, 0, bx + 68, 0); g.addColorStop(0, '#4f7fb8'); g.addColorStop(0.45, '#9cc0e8'); g.addColorStop(1, '#2d5487'); c.fillStyle = g; c.beginPath(); c.roundRect(bx, by, 68, bh, 10); c.fill(); c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.stroke();
      c.fillStyle = '#3d444d'; c.fillRect(bx - 16, by + bh - 8, 100, 16);
      P.txt(c, '진공 펌프', px, by + bh + 40, '#1d2433', '800 20px');
      // 막대와 T 손잡이
      const hy = pTop + pumpY * pLen; c.fillStyle = '#b8bec6'; c.fillRect(px - 5, hy, 10, by - hy + 20);
      g = c.createLinearGradient(0, hy - 14, 0, hy + 14); g.addColorStop(0, '#3a3f46'); g.addColorStop(1, '#16191d'); c.fillStyle = g; c.beginPath(); c.roundRect(px - 48, hy - 14, 96, 28, 14); c.fill();
      if (!pumpGrab && air > 0) { const b = 5 * Math.sin(t * 4); c.strokeStyle = 'rgba(217,72,59,.9)'; c.lineWidth = 4; c.beginPath(); c.moveTo(px + 66, hy - 10 + b); c.lineTo(px + 66, hy + 34 + b); c.moveTo(px + 55, hy + 20 + b); c.lineTo(px + 66, hy + 36 + b); c.lineTo(px + 77, hy + 20 + b); c.stroke(); }
    }
    function gauge(c, L) {
      const x = L.gx, y0 = L.top + 40, h = L.yb - 150 - y0;
      c.fillStyle = 'rgba(255,255,255,.9)'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.roundRect(x - 18, y0, 36, h, 10); c.fill(); c.stroke();
      const g = c.createLinearGradient(0, y0 + h, 0, y0); g.addColorStop(0, '#2a73b8'); g.addColorStop(1, '#8fc1ee'); c.fillStyle = g; c.beginPath(); c.roundRect(x - 12, y0 + 6 + (h - 12) * (1 - air), 24, (h - 12) * air, 6); c.fill();
      P.txt(c, '관 속', x, y0 - 34, '#1d2433', '800 18px'); P.txt(c, '공기', x, y0 - 12, '#1d2433', '800 18px');
      P.txt(c, `${Math.round(air * 100)}%`, x, y0 + h + 26, '#1d2433', '800 20px');
      // 공기 밸브
      const v = L.valve; c.fillStyle = airIn ? '#2f8a4a' : '#5c646e'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.arc(v.x - 30, v.y, 20, 0, TAU); c.fill(); c.stroke();
      c.strokeStyle = '#fff'; c.lineWidth = 4; c.beginPath(); c.moveTo(v.x - 42, v.y); c.lineTo(v.x - 18, v.y); c.stroke(); c.fillStyle = '#5c646e'; c.fillRect(v.x - 12, v.y - 5, 12, 10);
      P.txt(c, '공기 밸브', v.x - 30, v.y + 44, '#1d2433', '700 18px');
      if (airIn) for (let i = 0; i < 4; i++) { const u = (t * 2 + i / 4) % 1; c.fillStyle = `rgba(70,120,180,${1 - u})`; c.beginPath(); c.arc(v.x - 60 + u * 50, v.y - 10 + Math.sin(u * 9 + i) * 6, 3, 0, TAU); c.fill(); }
    }
    // 집게에 걸린 물체의 중심(아랫면을 hang 선에 맞춘다 → 떨어지는 거리가 같다)
    const hangC = (L, k) => L.hang - KINDS[k].r;
    function jaw(c, x, yTop, L) {
      c.strokeStyle = '#4a525c'; c.lineWidth = 6; c.beginPath(); c.moveTo(x, L.clampY); c.lineTo(x, yTop - 8); c.stroke();
      c.fillStyle = '#2f353c'; c.beginPath(); c.moveTo(x - 14, yTop - 10); c.lineTo(x - 4, yTop + 2); c.lineTo(x - 4, yTop - 10); c.fill(); c.beginPath(); c.moveTo(x + 14, yTop - 10); c.lineTo(x + 4, yTop + 2); c.lineTo(x + 4, yTop - 10); c.fill();
    }

    // ---------- 조작 ----------
    function steps() {
      const st = [1, 2, 3].find((n) => !ok.has(n)) || 0;
      window.L1.steps(root, st, [...ok]); window.L1.done(root, st === 0);
    }
    function hang(i, k) {
      const j = slots.indexOf(k); if (j >= 0) slots[j] = null;
      if (slots[i]) pos[slots[i]] = { where: 'tray' };
      slots[i] = k; pos[k] = { where: 'slot', i }; last = null; mode = 'idle';
    }
    function release() {
      if (falling.length) return;
      if (!(slots[0] && slots[1])) {
        const back = ORDER.filter((k) => pos[k].where === 'floor');
        if (back.length === 2) { back.sort((a, b) => pos[a].i - pos[b].i).forEach((k, i) => hang(i, k)); out.innerHTML = '같은 둘을 다시 걸었다. <b>집게</b>를 누르자.'; return; }
        out.innerHTML = '집게 두 자리에 물체를 <b>하나씩</b> 걸어야 동시에 놓을 수 있다.'; return;
      }
      falling = slots.map((k, i) => ({ k, i, v: 0, d: 0, t: 0, land: false, ghosts: [], gt: 0.1, rot: 0, sx: 0, air0: air }));
      slots.forEach((k, i) => { pos[k] = { where: 'fall', i }; }); slots = [null, null]; mode = 'fall';
    }
    function step(dt) {
      if (airIn) { air = Math.min(1, air + dt * 0.8); if (air >= 1) airIn = false; }
      if (!falling.length) return;
      falling.forEach((o) => {
        if (o.land) return; stepObj(o, air, dt);
        while (o.t >= o.gt - 1e-9 && !o.land) { o.ghosts.push({ d: o.d, v: o.v, rot: o.rot, sx: o.sx }); o.gt += 0.1; }
        if (o.k === 'feather') { const w = Math.min(1, air * 2) * Math.min(1, o.t * 1.2); o.sx = 26 * Math.sin(o.t * 3.4) * w; o.rot = 0.5 * Math.sin(o.t * 3.4 + 0.8) * w; }
        if (o.k === 'coin') o.rot = air > 0.3 ? o.t * 7 * air : 0;
      });
      if (falling.every((o) => o.land)) finish();
    }
    function finish() {
      const [a, b] = falling, dtm = Math.abs(a.t - b.t), A = KINDS[a.k], B = KINDS[b.k], ratio = Math.max(A.g, B.g) / Math.min(A.g, B.g), inAir = air > 0.8, vac = air === 0;
      const light = A.g > B.g ? b : a;
      ok.add(1);
      if (inAir && ratio >= 50) ok.add(2);
      if (vac && [a.k, b.k].includes('bowl') && [a.k, b.k].includes('feather')) ok.add(3);
      const tm = `${A.name} ${a.t.toFixed(2)}초 · ${B.name} ${b.t.toFixed(2)}초`;
      let why;
      if (dtm < 0.005) why = vac ? `공기가 없으니 <b>똑같이</b> 빨라져 함께 닿았다. 질량은 ${Math.round(ratio).toLocaleString()}배나 다르다.` : '거의 함께 닿았다 — 무거운 것이 먼저가 아니다.';
      else if (dtm < 0.05) why = `${KINDS[light.k].name}이 아주 조금 늦다 — 공기 저항을 조금 받았다. 질량 차이(${Math.round(ratio).toLocaleString()}배)에 비하면 거의 같다.`;
      else why = `${KINDS[light.k].name}이 크게 늦다 — 무거워서가 아니라 가볍고 넓적해 <b>공기 저항</b>을 크게 받았다.${air > 0 ? ' 공기를 빼 보자.' : ''}`;
      out.innerHTML = `<b>${tm}</b> (공기 ${Math.round(air * 100)}%)<br>${why}`;
      falling.forEach((o) => { pos[o.k] = { where: 'floor', i: o.i }; });
      last = falling; falling = []; mode = 'done'; steps();
    }
    const objAt = (L, k) => {
      const p = pos[k];
      if (p.where === 'tray') { const q = trayAt(L, k); return { x: q.x, y: q.y + 52 - KINDS[k].r * (k === 'feather' ? 1 : 1) }; }
      if (p.where === 'slot') return { x: L.sx[p.i], y: hangC(L, k) };
      if (p.where === 'drag') return { x: p.x, y: p.y };
      if (p.where === 'floor') return { x: L.sx[p.i], y: L.yb - (k === 'feather' ? 6 : KINDS[k].r) };
      return null;
    };
    const hit = (L, q) => ORDER.find((k) => { const o = objAt(L, k); if (!o || pos[k].where === 'fall') return false; const r = Math.max(30, KINDS[k].r + 8); return Math.hypot(q.x - o.x, q.y - o.y) < r; });

    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; for (let k = 0; k < 4; k++) step(dt * SLOW / 4);
        const L = lay(W, H);
        c.drawImage(backdrop(W, H), 0, 0, W, H);
        tube(c, L); gauge(c, L); pump(c, L);
        // 빈 집게 자리(점선)
        [0, 1].forEach((i) => { if (!slots[i] && !falling.length) { c.strokeStyle = 'rgba(29,36,51,.5)'; c.setLineDash([7, 6]); c.lineWidth = 2; c.beginPath(); c.arc(L.sx[i], L.hang - 30, 30, 0, TAU); c.stroke(); c.setLineDash([]); jaw(c, L.sx[i], L.hang - 60, L); } });
        // 같은 높이 선
        c.strokeStyle = 'rgba(217,72,59,.55)'; c.setLineDash([10, 6]); c.lineWidth = 2; c.beginPath(); c.moveTo(L.tx - L.tw / 2 + 4, L.hang); c.lineTo(L.tx + L.tw / 2 - 4, L.hang); c.stroke(); c.setLineDash([]);
        P.txt(c, '같은 높이', L.tx - L.tw / 2 + 8, L.hang - 8, '#a8231a', '800 18px', 'left');
        // 떨어지는 중: 잔상(0.1초마다)과 속력
        falling.concat(last || []).forEach((o) => {
          const cx = L.sx[o.i], y0 = hangC(L, o.k);
          let ly = -99, lt = '';
          o.ghosts.forEach((g, j) => { const gy = y0 + g.d * L.ppm, tv = g.v.toFixed(1); c.globalAlpha = 0.28; drawObj(c, o.k, cx + g.sx, gy, g.rot, j); c.globalAlpha = 1; if (j > 0 && gy - ly > 24 && tv !== lt) { ly = gy; lt = tv; P.txt(c, tv, cx + (o.i ? 1 : -1) * (KINDS[o.k].r + 12), gy + 6, '#1d2433', '700 18px', o.i ? 'left' : 'right'); } }); // 같은 속력이 이어지면(끝 속력) 한 번만 적는다
        });
        falling.forEach((o) => {
          const cx = L.sx[o.i] + o.sx, y = hangC(L, o.k) + o.d * L.ppm; drawObj(c, o.k, cx, y, o.rot, t * 6);
          const tag = `${o.v.toFixed(1)} m/s`; c.font = '800 19px "IBM Plex Sans KR", sans-serif'; const tw = c.measureText(tag).width + 14, bx = cx - tw / 2, by = y - KINDS[o.k].r - 38;
          c.fillStyle = 'rgba(29,36,51,.88)'; c.beginPath(); c.roundRect(bx, by, tw, 30, 15); c.fill(); P.txt(c, tag, cx, by + 22, '#ffd84d', '800 19px');
        });
        // 걸린 것·선반·바닥·끄는 것
        ORDER.forEach((k) => {
          const p = pos[k], o = objAt(L, k); if (!o) return;
          if (p.where === 'slot') jaw(c, o.x, o.y - KINDS[k].r, L);
          const flut = t * 3 * air;
          drawObj(c, k, o.x, o.y, p.where === 'floor' && k === 'feather' ? 1.45 : p.where === 'slot' && k === 'feather' ? 0.04 * Math.sin(t * 2) * air : 0, flut);
          if (p.where === 'tray') { const q = trayAt(L, k); P.txt(c, KINDS[k].name, q.x, q.y + 92, '#1d2433', '800 20px'); P.txt(c, KINDS[k].mass, q.x, q.y + 116, '#4a5568', '700 18px'); }
          if (p.where === 'floor' && last) { const lo = last.find((q) => q.k === k); if (lo) { const tg = `${lo.t.toFixed(2)}초`; P.txt(c, tg, o.x, L.yb + 26, '#1d2433', '800 19px'); } }
        });
        clampBtn(c, L);
        P.txt(c, '느린 화면(실제의 ½ 빠르기)', W - 16, 34, '#1d2433', '700 18px', 'right');
        // 안내 한 줄
        if (pick) say(`${KINDS[pick].name}을 집게의 빈 자리로`);
        else if (pumpGrab) say(`펌프로 공기를 빼는 중 — 관 속 공기 ${Math.round(air * 100)}%`);
        else if (falling.length) say('같은 높이에서 동시에 출발! 0.1초마다 잔상이 찍힌다');
        else if (ok.size === 3) say('질량이 달라도 똑같이 떨어진다 — 늦어지는 까닭은 공기 저항', true);
        else if (!ok.has(1)) say(slots[0] && slots[1] ? '빨간 집게 단추를 누르자' : '① 선반의 물체 둘을 끌어 집게에 걸자');
        else if (!ok.has(2)) say('② 무거운 것과 가벼운 것을 공기 속에서 견주어 보자');
        else say(air > 0 ? '③ 펌프 손잡이를 아래로 끌어 공기를 끝까지 빼자' : '③ 공기가 빠졌다 — 볼링공과 깃털을 다시 떨어뜨려 보자');
      },
      down(q) {
        const L = lay(S.W, S.H);
        if (Math.hypot(q.x - L.btn.x, q.y - L.btn.y) < L.btn.r + 14) { release(); return; }
        if (Math.hypot(q.x - (L.valve.x - 30), q.y - L.valve.y) < 34) { if (air < 1) airIn = true; out.innerHTML = '밸브를 열어 공기를 다시 넣는다.'; return; }
        const hy = L.pTop + pumpY * L.pLen; if (Math.abs(q.x - L.px) < 64 && Math.abs(q.y - hy) < 36) { pumpGrab = { y: q.y, p: pumpY }; return; }
        if (falling.length) return;
        const k = hit(L, q); if (k) { pick = k; pos[k] = { where: 'drag', x: q.x, y: q.y }; last = null; }
      },
      move(q) {
        const L = lay(S.W, S.H);
        if (pumpGrab) { const np = Math.max(0, Math.min(1, pumpGrab.p + (q.y - pumpGrab.y) / L.pLen)); if (np > pumpY && !airIn) air *= Math.exp(-1.6 * (np - pumpY)); pumpY = np; if (air < 0.01) air = 0; return; }
        if (pick) pos[pick] = { where: 'drag', x: q.x, y: q.y };
      },
      up(q) {
        const L = lay(S.W, S.H);
        if (pumpGrab) { pumpGrab = null; springBack(); out.innerHTML = air === 0 ? '관 속 공기를 다 뺐다(<b>진공</b>).' : `관 속 공기 ${Math.round(air * 100)}% — 손잡이를 더 끌어 내리자.`; return; }
        if (!pick) return;
        const k = pick; pick = null; const i = [0, 1].map((j) => Math.hypot(q.x - L.sx[j], q.y - (L.hang - 30))).reduce((b, d, j, a) => (d < a[b] ? j : b), 0);
        if (Math.hypot(q.x - L.sx[i], q.y - (L.hang - 30)) < 110) { hang(i, k); out.innerHTML = slots[0] && slots[1] ? `${KINDS[slots[0]].name}과 ${KINDS[slots[1]].name}을 같은 높이에 걸었다. <b>집게</b>를 누르자.` : `${KINDS[k].name}을 걸었다. 하나 더!`; }
        else pos[k] = { where: 'tray' };
      },
      key(e) {
        const n = '1234'.indexOf(e.key); if (n >= 0 && !falling.length) { hang(slots[0] ? (slots[1] ? 0 : 1) : 0, ORDER[n]); return true; }
        if (e.key === 'Enter' || e.key === ' ') { release(); return true; }
        if (e.key === 'ArrowDown') { if (!airIn) air *= Math.exp(-0.8); if (air < 0.01) air = 0; return true; }
        if (e.key === 'a' || e.key === 'A') { if (air < 1) airIn = true; return true; }
        if (e.key === '0') { reset(); return true; } return false;
      },
    });
    // 손잡이는 놓으면 천천히 위로 돌아온다
    function springBack() { const tick = () => { if (pumpGrab) return; pumpY = Math.max(0, pumpY - 0.06); S.kick(); if (pumpY > 0) requestAnimationFrame(tick); }; requestAnimationFrame(tick); }
    root.querySelector('.ms-reset').addEventListener('click', () => { reset(); S.kick(); });
    reset();
    const state = () => ({ air: +air.toFixed(3), slots: slots.slice(), falling: falling.length, last: last && last.map((o) => ({ k: o.k, t: +o.t.toFixed(3), ghosts: o.ghosts.length })), ok: [...ok].sort() });
    root._ms = {
      hang: (ks) => { ks.forEach((k, i) => hang(i, k)); S.kick(); return state(); },
      pump: (n) => { for (let i = 0; i < n; i++) air *= Math.exp(-1.6); if (air < 0.01) air = 0; S.kick(); return state(); },
      air: () => { airIn = true; S.kick(); return state(); },
      release: () => { release(); S.kick(); return state(); },
      run: (sec) => { for (let i = 0; i < sec * 1000; i++) step(0.001); S.kick(); return state(); },
      state,
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.MassDrop = { mount };
})();
