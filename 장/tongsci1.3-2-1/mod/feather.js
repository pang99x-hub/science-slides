/* 3-2 1차시 표지 «달에서 망치와 깃털을 함께 놓으면?»(사건 파일 17 · 아폴로 15호, 1971).
   우주인이 선 땅(지구 풀밭 / 달 표면). 오른쪽 위 표지판 «지구»·«달»을 누르면 장소가 바뀐다.
   바닥의 망치나 깃털을 위로 끌면 우주인이 두 손으로 둘을 같은 높이로 들어 올리고, 손을 떼면 함께 떨어진다.
   지구: 망치는 곧장, 깃털은 공기에 막혀 하늘하늘 늦게(끝 속력 약 0.5 m/s) · 달: 공기가 없어 둘이 함께 닿고 먼지가 튄다.
   화면은 늘 움직인다(지구: 구름·풀, 달: 별 반짝임·하늘의 지구 빛). 높이·시간은 이해를 돕기 위한 예.
   키보드: 위·아래 화살표 들어 올리기, 스페이스·엔터 놓기, 1 지구, 2 달, 0 처음부터.
   Feather.mount(root) → { fit, setActive } · 시험용: root._fh.place('earth'|'moon') · lift(m) · drop() · run(초) · state() */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const G = { earth: 9.8, moon: 1.62 }, VT = { hammer: 40, feather: 0.5 }; // 끝 속력(공기 속, m/s)
  const H0 = 0.6, H1 = 1.7; // 손 높이 범위(m)
  // 한 걸음: 공기가 있으면 a = g(1 - v²/vt²)
  const stepObj = (o, g, air, dt) => { const a = g * (1 - (air ? (o.v * o.v) / (VT[o.k] * VT[o.k]) : 0)); o.v += a * dt; o.y -= o.v * dt; o.t += dt; if (o.y <= 0) { o.y = 0; o.down = true; } };
  // 자체 확인: 달에서는 둘이 같은 시간, 지구에서는 깃털이 훨씬 늦다
  (function () {
    const fall = (k, g, air) => { const o = { k, y: 1.5, v: 0, t: 0, down: false }; while (!o.down) stepObj(o, g, air, 0.002); return o.t; };
    const mh = fall('hammer', G.moon, false), mf = fall('feather', G.moon, false), eh = fall('hammer', G.earth, true), ef = fall('feather', G.earth, true);
    console.assert(Math.abs(mh - mf) < 1e-9 && mh > 1.3 && mh < 1.4 && eh < 0.6 && ef > 2.5, 'feather: 낙하 시간');
  })();

  function mount(root) {
    const stage = root.querySelector('.fh-stage'), now = root.querySelector('.fh-now');
    const P = window.Play;
    let place = 'earth', fade = 0, t = 0, hand, held, falling, objs, dust, msg = '', drag = false, result = null, art = null, artKey = '';
    function reset(keepPlace) {
      hand = H0; held = false; falling = false; result = null; dust = [];
      objs = [{ k: 'hammer', y: 0, v: 0, t: 0, down: true, x: 0, rot: 0 }, { k: 'feather', y: 0, v: 0, t: 0, down: true, x: 0, rot: 0 }];
      if (!keepPlace) place = 'earth';
    }
    reset();
    const say = (h, ok) => { if (h !== msg) { msg = h; now.textContent = h; now.classList.toggle('done', !!ok); } };
    // 배치: 땅 높이, 1 m 당 화소, 우주인 위치, 두 손 x, 표지판
    const lay = (W, H) => {
      const ground = H * 0.84, ppm = (ground - 84) / 2.0, cx = W * 0.4;
      return { ground, ppm, cx, hx: [cx - 0.62 * ppm, cx + 0.62 * ppm], sign: [{ k: 'earth', x: W - 176, y: 14, w: 76, h: 46 }, { k: 'moon', x: W - 92, y: 14, w: 76, h: 46 }] };
    };

    // ---------- 바탕(장소·크기가 바뀔 때만 다시 그린다) ----------
    function backdrop(W, H, where) {
      const key = W + 'x' + H + where; if (art && artKey === key) return art;
      art = document.createElement('canvas'); art.width = W * 2; art.height = H * 2; artKey = key;
      const c = art.getContext('2d'); c.scale(2, 2); const L = lay(W, H);
      let s = where === 'moon' ? 11 : 5; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
      if (where === 'earth') {
        let g = c.createLinearGradient(0, 0, 0, L.ground); g.addColorStop(0, '#3d7cc9'); g.addColorStop(0.7, '#9cc9ec'); g.addColorStop(1, '#d9eef8'); c.fillStyle = g; c.fillRect(0, 0, W, L.ground);
        // 먼 산
        c.fillStyle = '#8fb3a0'; c.beginPath(); c.moveTo(0, L.ground - 40); for (let x = 0; x <= W; x += 20) c.lineTo(x, L.ground - 46 - 22 * Math.sin(x * 0.012) - 10 * Math.sin(x * 0.037)); c.lineTo(W, L.ground); c.lineTo(0, L.ground); c.fill();
        c.fillStyle = '#6f9b62'; c.beginPath(); c.moveTo(0, L.ground - 14); for (let x = 0; x <= W; x += 20) c.lineTo(x, L.ground - 18 - 9 * Math.sin(x * 0.02 + 1)); c.lineTo(W, L.ground); c.lineTo(0, L.ground); c.fill();
        // 풀밭(명암과 풀잎)
        g = c.createLinearGradient(0, L.ground, 0, H); g.addColorStop(0, '#5f9a3e'); g.addColorStop(1, '#3d6b28'); c.fillStyle = g; c.fillRect(0, L.ground, W, H - L.ground);
        for (let i = 0; i < 260; i++) { const x = rnd() * W, y = L.ground + rnd() * (H - L.ground); c.strokeStyle = `rgba(${rnd() < 0.5 ? '160,205,110' : '40,80,25'},.55)`; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (rnd() - 0.5) * 4, y - 4 - rnd() * 5); c.stroke(); }
      } else {
        c.fillStyle = '#05070f'; c.fillRect(0, 0, W, L.ground);
        // 달 표면(회색 표토, 구덩이)
        let g = c.createLinearGradient(0, L.ground - 30, 0, H); g.addColorStop(0, '#8e8c86'); g.addColorStop(1, '#4e4c48'); c.fillStyle = g;
        c.beginPath(); c.moveTo(0, L.ground - 6); for (let x = 0; x <= W; x += 16) c.lineTo(x, L.ground - 4 - 5 * Math.sin(x * 0.02) - 3 * Math.sin(x * 0.07)); c.lineTo(W, H); c.lineTo(0, H); c.fill();
        for (let i = 0; i < 14; i++) { const x = rnd() * W, y = L.ground + 6 + rnd() * (H - L.ground - 10), r = 4 + rnd() * 12; c.fillStyle = 'rgba(40,38,35,.35)'; c.beginPath(); c.ellipse(x, y, r, r * 0.32, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(220,218,210,.35)'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(x, y + 1, r, r * 0.32, 0, 0.1, Math.PI - 0.1); c.stroke(); }
        for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(${rnd() < 0.5 ? '230,228,220' : '30,28,25'},${0.12 + rnd() * 0.2})`; c.fillRect(rnd() * W, L.ground + rnd() * (H - L.ground), 1.4, 1.4); }
        // 착륙선 다리(왼쪽 끝, 금박)
        const lx = W - 120; c.strokeStyle = '#b8b2a0'; c.lineWidth = 5; c.beginPath(); c.moveTo(lx + 40, L.ground - 118); c.lineTo(lx + 6, L.ground - 6); c.moveTo(lx + 70, L.ground - 118); c.lineTo(lx + 92, L.ground - 30); c.stroke();
        c.fillStyle = '#9a968a'; c.beginPath(); c.ellipse(lx + 6, L.ground - 4, 16, 5, 0, 0, TAU); c.fill();
        g = c.createLinearGradient(lx, 0, lx + 110, 0); g.addColorStop(0, '#7a5a1c'); g.addColorStop(0.4, '#e3b54a'); g.addColorStop(0.7, '#b98a2c'); g.addColorStop(1, '#6e4f18'); c.fillStyle = g;
        c.beginPath(); c.moveTo(lx - 34, L.ground - 120); c.lineTo(lx + 100, L.ground - 120); c.lineTo(lx + 92, L.ground - 168); c.lineTo(lx - 34, L.ground - 168); c.fill();
        c.strokeStyle = 'rgba(80,55,15,.6)'; c.lineWidth = 1; for (let k = 0; k < 7; k++) { c.beginPath(); c.moveTo(lx - 30 + k * 18, L.ground - 166); c.lineTo(lx - 24 + k * 17, L.ground - 122); c.stroke(); }
      }
      return art;
    }
    // 움직이는 하늘(바탕 위에 매 프레임)
    function sky(c, W, H, L, where) {
      if (where === 'earth') {
        [[0.12, 60, 1], [0.55, 40, 0.8], [0.85, 92, 1.2]].forEach(([u, y, k], i) => {
          const x = ((u * W + t * (10 + i * 4)) % (W + 160)) - 80;
          c.fillStyle = 'rgba(255,255,255,.85)'; [[0, 0, 26], [22, 4, 20], [-22, 6, 18], [8, -10, 18]].forEach(([dx, dy, r]) => { c.beginPath(); c.arc(x + dx * k, y + dy * k, r * k, 0, TAU); c.fill(); });
        });
        P.glow(c, 60, 46, 54, 'rgba(255,240,170,.9)', 'rgba(255,240,170,0)'); c.fillStyle = '#fff6c8'; c.beginPath(); c.arc(60, 46, 18, 0, TAU); c.fill();
      } else {
        let s = 3; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
        for (let i = 0; i < 70; i++) { const x = rnd() * W, y = rnd() * (L.ground - 20), ph = rnd() * TAU, a = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t * (1 + rnd() * 2) + ph)); c.fillStyle = `rgba(255,255,255,${a})`; c.fillRect(x, y, 1.6, 1.6); }
        // 하늘의 지구(빛이 은은하게 숨 쉰다)
        const ex = W * 0.7, ey = 70, er = 26, pul = 0.5 + 0.5 * Math.sin(t * 1.3);
        P.glow(c, ex, ey, er * (2 + pul * 0.4), `rgba(120,180,255,${0.35 + 0.15 * pul})`, 'rgba(120,180,255,0)');
        const g = c.createRadialGradient(ex - 8, ey - 8, 3, ex, ey, er); g.addColorStop(0, '#9fd2ff'); g.addColorStop(0.7, '#2c6fc0'); g.addColorStop(1, '#0d2f66'); c.fillStyle = g; c.beginPath(); c.arc(ex, ey, er, 0, TAU); c.fill();
        c.save(); c.beginPath(); c.arc(ex, ey, er, 0, TAU); c.clip(); c.fillStyle = 'rgba(110,170,80,.85)'; const r = (t * 4) % (er * 4);
        [[-0.4, -0.2, 0.4, 0.25], [0.3, 0.25, 0.3, 0.2]].forEach(([u, v, rw, rh]) => { c.beginPath(); c.ellipse(ex + u * er * 2 - r + er * 2, ey + v * er, rw * er, rh * er, 0.4, 0, TAU); c.fill(); });
        c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(ex - 4, ey - 12, er * 0.6, 3, 0.2, 0, TAU); c.fill();
        const sh = c.createLinearGradient(ex - er, 0, ex + er, 0); sh.addColorStop(0.45, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,10,.75)'); c.fillStyle = sh; c.fillRect(ex - er, ey - er, er * 2, er * 2); c.restore();
        P.txt(c, '지구', ex, ey + er + 22, 'rgba(200,225,255,.9)', '700 18px');
      }
    }

    // ---------- 물체 그림 ----------
    function hammer(c, x, y, k, rot) { // (x, y) = 손잡이 끝, 머리는 바깥쪽
      c.save(); c.translate(x, y); c.rotate(rot);
      const len = 0.36 * k, hw = 0.035 * k;
      let g = c.createLinearGradient(0, -hw, 0, hw); g.addColorStop(0, '#d9b277'); g.addColorStop(1, '#8c6232'); c.fillStyle = g; c.beginPath(); c.roundRect(0, -hw / 2, len, hw, 3); c.fill();
      c.strokeStyle = 'rgba(80,50,20,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(4, 0); c.lineTo(len - 6, 0); c.stroke();
      g = c.createLinearGradient(0, -0.09 * k, 0, 0.09 * k); g.addColorStop(0, '#d8dde3'); g.addColorStop(0.45, '#8a929c'); g.addColorStop(1, '#3d434b'); c.fillStyle = g;
      c.beginPath(); c.roundRect(len - 0.05 * k, -0.09 * k, 0.07 * k, 0.18 * k, 3); c.fill(); c.strokeStyle = '#2a2e34'; c.lineWidth = 1.5; c.stroke();
      c.restore();
    }
    function feather(c, x, y, k, rot, flut) { // (x, y) = 깃촉, 깃은 위쪽으로
      c.save(); c.translate(x, y); c.rotate(rot); const L = 0.3 * k;
      for (let i = 0; i < 18; i++) { // 깃가지(한쪽씩, 끝으로 갈수록 짧게)
        const u = 0.18 + i / 18 * 0.8, yy = -L * u, w = 0.06 * k * Math.sin(Math.PI * Math.min(1, u * 1.1)) * (1 + 0.1 * Math.sin(flut + i));
        c.strokeStyle = `rgba(${235 - i * 3},${230 - i * 3},${222 - i * 4},.95)`; c.lineWidth = 2.6;
        c.beginPath(); c.moveTo(0, yy); c.quadraticCurveTo(-w * 0.6, yy - 4, -w, yy - 10 - 2 * Math.sin(flut + i * 0.5)); c.stroke();
        c.beginPath(); c.moveTo(0, yy); c.quadraticCurveTo(w * 0.5, yy - 4, w * 0.85, yy - 9 - 2 * Math.cos(flut + i * 0.5)); c.stroke();
      }
      c.strokeStyle = 'rgba(120,100,80,.35)'; c.lineWidth = 1; for (let i = 0; i < 4; i++) { const yy = -L * (0.35 + i * 0.15); c.beginPath(); c.moveTo(0, yy); c.lineTo(-0.05 * k, yy - 12); c.stroke(); }
      c.strokeStyle = '#f4efe2'; c.lineWidth = 2.4; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -L); c.stroke(); // 깃대
      c.strokeStyle = '#9b8a6e'; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -L * 0.18); c.stroke();
      c.restore();
    }
    // 우주인(흰 우주복·금빛 얼굴 가리개·등짐). 두 손 높이 hand(m)
    function astronaut(c, L, hh) {
      const { cx, ground, ppm } = L, Y = (m) => ground - m * ppm, sh = Y(1.42), hipY = Y(0.92);
      const suit = (x0, x1) => { const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, '#c9ccd0'); g.addColorStop(0.45, '#fbfbf9'); g.addColorStop(1, '#a9adb3'); return g; };
      // 그림자
      c.fillStyle = place === 'moon' ? 'rgba(0,0,0,.45)' : 'rgba(20,50,10,.3)'; c.beginPath(); c.ellipse(cx + 10, ground + 4, 0.5 * ppm, 7, 0, 0, TAU); c.fill();
      // 등짐
      c.fillStyle = '#d7d9dc'; c.strokeStyle = '#7c8088'; c.lineWidth = 1.5; c.beginPath(); c.roundRect(cx - 0.3 * ppm, Y(1.62), 0.6 * ppm, 0.62 * ppm, 8); c.fill(); c.stroke();
      // 다리·장화
      [-1, 1].forEach((sd) => {
        c.strokeStyle = suit(cx + sd * 0.12 * ppm - 12, cx + sd * 0.12 * ppm + 12); c.lineWidth = 0.17 * ppm; c.lineCap = 'round';
        c.beginPath(); c.moveTo(cx + sd * 0.1 * ppm, hipY); c.lineTo(cx + sd * 0.15 * ppm, Y(0.12)); c.stroke();
        c.fillStyle = '#e9e7e1'; c.strokeStyle = '#6d6a63'; c.lineWidth = 1.5; c.beginPath(); c.roundRect(cx + sd * 0.15 * ppm - 0.11 * ppm, Y(0.13), 0.22 * ppm, 0.13 * ppm, 5); c.fill(); c.stroke();
      });
      // 몸통
      c.fillStyle = suit(cx - 0.24 * ppm, cx + 0.24 * ppm); c.beginPath(); c.roundRect(cx - 0.24 * ppm, Y(1.5), 0.48 * ppm, 0.62 * ppm, 14); c.fill(); c.strokeStyle = '#8a8e95'; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = '#9aa2ad'; c.beginPath(); c.roundRect(cx - 0.13 * ppm, Y(1.33), 0.26 * ppm, 0.16 * ppm, 4); c.fill(); // 가슴 조절 장치
      ['#d9483b', '#2a73b8', '#f0c43c'].forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.arc(cx - 0.07 * ppm + i * 0.07 * ppm, Y(1.25), 3, 0, TAU); c.fill(); });
      c.fillStyle = '#c8392e'; c.fillRect(cx - 0.24 * ppm, Y(0.98), 0.48 * ppm, 4); // 허리띠
      // 헬멧
      const hy = Y(1.68), hr = 0.17 * ppm; let g = c.createRadialGradient(cx - hr * 0.4, hy - hr * 0.4, 2, cx, hy, hr); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#b9bdc3'); c.fillStyle = g; c.beginPath(); c.arc(cx, hy, hr, 0, TAU); c.fill(); c.strokeStyle = '#7c8088'; c.stroke();
      g = c.createLinearGradient(cx - hr, hy - hr, cx + hr, hy + hr); g.addColorStop(0, '#ffe8a0'); g.addColorStop(0.4, '#d39b2a'); g.addColorStop(1, '#6b4310'); c.fillStyle = g; c.beginPath(); c.ellipse(cx, hy + 2, hr * 0.78, hr * 0.6, 0, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(cx - hr * 0.35, hy - hr * 0.12, hr * 0.18, hr * 0.08, -0.5, 0, TAU); c.fill();
      // 팔(어깨 → 팔꿈치 → 손)
      L.hx.forEach((hx, i) => {
        const sd = i ? 1 : -1, sx = cx + sd * 0.22 * ppm, hy2 = Y(hh), ex = (sx + hx) / 2 + sd * 0.05 * ppm, ey = Math.max(sh, hy2) + 0.12 * ppm * (hh < 1.3 ? 1 : 0.2);
        c.strokeStyle = suit(Math.min(sx, hx) - 10, Math.max(sx, hx) + 10); c.lineWidth = 0.13 * ppm; c.lineCap = 'round'; c.lineJoin = 'round';
        c.beginPath(); c.moveTo(sx, sh); c.lineTo(ex, ey); c.lineTo(hx, hy2); c.stroke();
        c.strokeStyle = 'rgba(120,124,130,.5)'; c.lineWidth = 1.2; c.stroke();
        c.fillStyle = '#5a5f66'; c.beginPath(); c.arc(hx, hy2, 0.065 * ppm, 0, TAU); c.fill(); // 장갑
      });
    }

    // ---------- 물리 ----------
    function drop() {
      if (!held) return; held = false; falling = true; result = null;
      objs.forEach((o) => { o.y = hand; o.v = 0; o.t = 0; o.down = false; o.x = 0; o.rot = 0; });
    }
    function step(dt) {
      if (!falling) return;
      const g = G[place], air = place === 'earth';
      objs.forEach((o) => {
        if (o.down) return; stepObj(o, g, air, dt);
        if (o.k === 'feather' && air) { o.x = 0.12 * Math.sin(o.t * 3.2) * Math.min(1, o.t * 1.5); o.rot = 0.6 * Math.sin(o.t * 3.2 + 0.8) * Math.min(1, o.t * 1.5) - 1.3; }
        else if (o.k === 'feather') o.rot = -1.3 * Math.min(1, o.t * 0.4); else o.rot = 0.4 * Math.min(1, o.t);
        if (o.down) land(o);
      });
      if (objs.every((o) => o.down)) {
        falling = false; const [h, f] = objs; result = { place, hammer: +h.t.toFixed(2), feather: +f.t.toFixed(2), from: +hand.toFixed(2) };
        if (place === 'moon') window.RxT.jolt(stage, 1);
      }
    }
    function land(o) {
      const n = place === 'moon' ? 22 : 6;
      for (let i = 0; i < n * (o.k === 'hammer' ? 1 : 0.4); i++) { const a = Math.PI + Math.random() * Math.PI; dust.push({ i: o.k === 'hammer' ? 0 : 1, dx: 0, dy: 0, vx: Math.cos(a) * (20 + Math.random() * 50), vy: Math.sin(a) * (30 + Math.random() * 50), a: 1 }); }
    }

    const Y = (L, m) => L.ground - m * L.ppm;
    const objPos = (L, o, i) => {
      if (held || (!falling && !result && hand > H0)) return { x: L.hx[i], y: Y(L, hand) };
      return { x: L.hx[i] + o.x * L.ppm, y: Y(L, o.y) - (o.down && !held ? 4 : 0) };
    };
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; if (fade > 0) fade = Math.max(0, fade - dt * 2.5);
        // 물리는 잘게 나눠 진행
        for (let k = 0; k < 4; k++) step(dt / 4);
        const L = lay(W, H);
        c.drawImage(backdrop(W, H, place), 0, 0, W, H); sky(c, W, H, L, place);
        // 높이 자(왼쪽)
        const rx = 18; c.fillStyle = 'rgba(255,255,255,.82)'; c.beginPath(); c.roundRect(rx - 6, Y(L, 2) - 8, 58, 2 * L.ppm + 16, 6); c.fill();
        c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(rx + 4, Y(L, 0)); c.lineTo(rx + 4, Y(L, 2)); c.stroke();
        for (let m = 0; m <= 2.001; m += 0.5) { c.beginPath(); c.moveTo(rx + 4, Y(L, m)); c.lineTo(rx + (m % 1 ? 12 : 18), Y(L, m)); c.stroke(); if (m % 1 === 0) P.txt(c, `${m} m`, rx + 21, Y(L, m) + 7, '#1d2433', '700 18px', 'left'); }
        // 같은 높이 점선
        const lifted = held || (hand > H0 + 0.05 && !falling && !result);
        if (lifted) {
          const y = Y(L, hand); c.strokeStyle = '#ffd84d'; c.setLineDash([8, 6]); c.lineWidth = 2.5; c.beginPath(); c.moveTo(rx + 4, y); c.lineTo(L.hx[1] + 60, y); c.stroke(); c.setLineDash([]);
          const tag = `같은 높이 ${hand.toFixed(1)} m`; c.font = '800 20px "IBM Plex Sans KR", sans-serif'; const tw = c.measureText(tag).width + 16;
          c.fillStyle = 'rgba(29,36,51,.85)'; c.beginPath(); c.roundRect(L.hx[1] + 62, y - 15, tw, 30, 15); c.fill(); P.txt(c, tag, L.hx[1] + 70, y + 7, '#ffd84d', '800 20px', 'left');
        }
        astronaut(c, L, held || falling || result ? hand : 0.95);
        // 먼지
        dust.forEach((d) => { d.dx += d.vx * dt; d.dy += d.vy * dt; d.vy += (place === 'moon' ? 40 : 160) * dt; d.a -= dt * (place === 'moon' ? 0.9 : 1.6); });
        dust = dust.filter((d) => d.a > 0);
        // 물체
        objs.forEach((o, i) => {
          const p = objPos(L, o, i), flut = t * (place === 'earth' ? 5 : 0.6);
          if (o.k === 'hammer') { if (held || lifted) hammer(c, p.x, p.y, L.ppm, Math.PI); else if (o.down && !falling && !result) hammer(c, p.x + 0.18 * L.ppm, Y(L, 0) - 5, L.ppm, Math.PI); else hammer(c, p.x, p.y - (o.down ? 5 : 0), L.ppm, Math.PI + o.rot); }
          else { const breeze = place === 'earth' ? 0.12 * Math.sin(t * 2.3) : 0; if (held || lifted) feather(c, p.x, p.y, L.ppm, 0.25 + breeze, flut); else if (o.down && !falling && !result) feather(c, p.x - 0.14 * L.ppm, Y(L, 0) - 4, L.ppm, 1.45, flut); else feather(c, p.x, p.y - (o.down ? 3 : 0), L.ppm, (o.down ? 1.45 : 0.25 + o.rot * 0.2 + (place === 'earth' ? 0.4 * Math.sin(o.t * 3.2) : 0)), flut); }
          // 속력·시간
          if (falling && !o.down) P.txt(c, `${o.v.toFixed(1)} m/s`, p.x + (i ? 30 : -30), p.y - 26, '#fff', '800 20px', i ? 'left' : 'right');
          if (result || (falling && o.down)) { const tg = `${o.k === 'hammer' ? '망치' : '깃털'} ${o.t.toFixed(2)}초`; c.font = '800 20px "IBM Plex Sans KR", sans-serif'; const tw = c.measureText(tg).width + 18, bx = L.hx[i] - tw / 2; c.fillStyle = 'rgba(255,255,255,.94)'; c.beginPath(); c.roundRect(bx, Y(L, 0) + 10, tw, 32, 8); c.fill(); P.txt(c, tg, L.hx[i], Y(L, 0) + 33, '#1d2433', '800 20px'); }
        });
        dust.forEach((d) => { c.fillStyle = place === 'moon' ? `rgba(190,186,176,${d.a})` : `rgba(120,90,50,${d.a * 0.6})`; c.beginPath(); c.arc(L.hx[d.i] + d.dx, Y(L, 0) + d.dy, 2.4, 0, TAU); c.fill(); });
        // 끌기 안내(처음)
        if (!held && !falling && !result && hand <= H0 + 0.01) {
          const b = 6 * Math.sin(t * 4); [0, 1].forEach((i) => { const x = L.hx[i], y = Y(L, 0) - 46 + b; c.strokeStyle = 'rgba(255,216,77,.95)'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, y + 26); c.lineTo(x, y - 6); c.moveTo(x - 10, y + 4); c.lineTo(x, y - 8); c.lineTo(x + 10, y + 4); c.stroke(); });
          P.txt(c, '위로 끌기', L.hx[1] + 28, Y(L, 0) - 34 + b, '#fff', '800 20px', 'left');
        }
        // 표지판
        L.sign.forEach((sg) => {
          const on = sg.k === place; c.fillStyle = '#6b4a2b'; c.fillRect(sg.x + sg.w / 2 - 3, sg.y + sg.h, 6, 18);
          c.fillStyle = on ? '#ffd84d' : '#f3ead7'; c.strokeStyle = '#1d2433'; c.lineWidth = on ? 3 : 2; c.beginPath(); c.roundRect(sg.x, sg.y, sg.w, sg.h, 8); c.fill(); c.stroke();
          P.txt(c, sg.k === 'earth' ? '지구' : '달', sg.x + sg.w / 2, sg.y + 31, '#1d2433', '800 21px');
        });
        P.txt(c, `중력 가속도 약 ${place === 'earth' ? '9.8' : '1.6'} m/s² · ${place === 'earth' ? '공기 있음' : '공기 없음'}`, W - 14, H - 12, place === 'earth' ? '#fff' : '#e8e6df', '700 18px', 'right');
        if (fade > 0) { c.fillStyle = `rgba(0,0,0,${fade})`; c.fillRect(0, 0, W, H); }
        // 안내 한 줄
        const nm = place === 'earth' ? '지구' : '달';
        if (held) say(`${nm}: 같은 높이 ${hand.toFixed(1)} m — 손을 떼면 떨어진다`);
        else if (falling) say(place === 'earth' ? '지구: 망치는 곧장, 깃털은 공기에 막혀 하늘하늘' : '달: 둘이 나란히 떨어진다');
        else if (result) say(place === 'earth' ? `지구: 망치 ${result.hammer}초, 깃털 ${result.feather}초 — 깃털만 늦다` : `달: 망치 ${result.hammer}초, 깃털 ${result.feather}초 — 동시에 닿았다!`, true);
        else say(`${nm}: 망치나 깃털을 위로 끌었다 놓아 보자`);
      },
      down(p) {
        const L = lay(S.W, S.H), sg = L.sign.find((q) => p.x >= q.x - 6 && p.x <= q.x + q.w + 6 && p.y >= q.y - 6 && p.y <= q.y + q.h + 24);
        if (sg) { if (sg.k !== place) { place = sg.k; fade = 0.9; reset(true); } return; }
        if (falling) return;
        if (Math.min(...L.hx.map((x) => Math.abs(p.x - x))) < 0.4 * L.ppm && p.y > Y(L, H1 + 0.3)) { if (result) reset(true); drag = true; held = true; hand = Math.max(hand, Math.min(H1, Math.max(H0, (L.ground - p.y) / L.ppm))); }
      },
      move(p) { if (!drag) return; const L = lay(S.W, S.H); hand = Math.min(H1, Math.max(H0, (L.ground - p.y) / L.ppm)); },
      up() { if (!drag) return; drag = false; if (hand > H0 + 0.15) drop(); else { held = false; hand = H0; } },
      key(e) {
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { if (falling) return true; if (result) reset(true); held = true; hand = Math.min(H1, Math.max(H0, hand + (e.key === 'ArrowUp' ? 0.2 : -0.2))); return true; }
        if (e.key === ' ' || e.key === 'Enter') { if (held && hand > H0 + 0.15) drop(); return true; }
        if (e.key === '1' || e.key === '2') { place = e.key === '1' ? 'earth' : 'moon'; fade = 0.9; reset(true); return true; }
        if (e.key === '0') { reset(); return true; } return false;
      },
    });
    const state = () => ({ place, hand: +hand.toFixed(2), held, falling, result, hammer: +objs[0].y.toFixed(2), feather: +objs[1].y.toFixed(2) });
    root._fh = {
      place: (w) => { place = w; reset(true); S.kick(); return state(); },
      lift: (m) => { if (result) reset(true); held = true; hand = Math.min(H1, Math.max(H0, m)); S.kick(); return state(); },
      drop: () => { drop(); S.kick(); return state(); },
      run: (sec) => { for (let i = 0; i < sec * 500; i++) step(0.002); S.kick(); return state(); },
      state,
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Feather = { mount };
})();
