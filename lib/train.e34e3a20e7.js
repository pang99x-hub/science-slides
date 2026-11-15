/* 3-2 4차시 표지 «고속 열차에는 왜 안전띠가 없을까?»(사건 파일 20, 교과서 132쪽 도입).
   위 칸 고속 열차, 아래 칸 자동차가 같은 빠르기(72 km/h)로 나란히 달린다(창밖 풍경이 흘러간다).
   칸마다 왼쪽 «멈추는 손잡이»를 아래로 끌면 제동: 열차는 바퀴·레일 사이 마찰이 작아 아무리 당겨도 천천히(긴 시간·긴 거리) 서고,
   자동차는 세게 당기면 짧은 시간에 급정거한다. 손잡이를 끈 만큼 제동이 세다. 손잡이를 다시 올리면 다시 달린다.
   승객 몸이 앞으로 쏠리는 정도와 오른쪽 «승객이 받는 힘» 막대 = 승객 질량 × 감속도. 같은 빠르기에서 멈추면 운동량 변화가 같으므로 시간이 길수록 힘이 작다.
   위 칸 오른쪽 «충돌하면?» 표지판: 느린 속력으로 완충 벽에 부딪치는 장면(느린 화면) — 열차 앞부분 완충 장치가 찌그러지며 멈추는 시간을 늘린다.
   수치(빠르기·감속도·승객 60 kg·찌그러지는 길이)는 이해를 돕기 위한 예.
   키보드: 위·아래 화살표 열차 손잡이, 왼쪽·오른쪽 화살표 자동차 손잡이(→ 당김), C 충돌하면?, 0 처음부터.
   Train.mount(root) → { fit, setActive } · 시험용: root._tr.pull(lane, f) · run(초) · crash() · state() */
(function () {
  'use strict';
  const TAU = Math.PI * 2, V0 = 20, M = 60, FMAX = 1000;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const hash = (i, k) => { const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); };
  // 칸별 성질: 최대 감속도(m/s²), 다시 달릴 때 가속도
  const LANES = [
    { k: 'train', name: '고속 열차', amax: 2.0, col: '#2a5fae' },
    { k: 'car', name: '자동차', amax: 8.0, col: '#c0392b' },
  ];
  // 충돌(위 칸): 5 m/s로 부딪쳐 완충 장치가 0.9 m 찌그러진다 → 일정한 감속도 v²/2d
  const CV = 5, CRUSH = 0.9, NOBUF = 0.06;
  const stopTime = (v, a) => v / a;
  (function () { // 자체 확인: 같은 속력에서 열차는 자동차보다 오래 걸려 서고, 승객이 받는 힘은 작다
    const tt = stopTime(V0, LANES[0].amax), tc = stopTime(V0, LANES[1].amax);
    console.assert(tt > tc && M * V0 / tt < M * V0 / tc && Math.abs(M * LANES[0].amax * tt - M * V0) < 1e-9, 'train: 충격량 같음, 시간 길면 힘 작음');
  })();

  function mount(root) {
    const stage = root.querySelector('.tr-stage'), now = root.querySelector('.tr-now'), P = window.Play, txt = P.txt;
    let L, t, msg, drag, crash;
    function reset() {
      t = 0; drag = null; crash = null;
      L = LANES.map((o) => ({ ...o, v: V0, off: 0, f: 0, a: 0, lean: 0, brk: null, last: null, peak: 0 }));
    }
    reset();
    const say = (h, ok) => { if (h !== msg) { msg = h; now.innerHTML = h; now.classList.toggle('done', !!ok); } };
    const lane = (i, W, H) => { const h = (H - 6) / 2, y = i * (h + 6); return { y, h, rail: y + h - 30, lv: { x: 10, y: y + 34, w: 58, h: h - 52 }, nose: W * 0.6 }; };
    const signC = (W, H) => { const g = lane(0, W, H); return { x: W - 128, y: g.y + g.h - 50, w: 118, h: 38 }; };

    // ---------- 물리 ----------
    function step(dt) {
      L.forEach((o) => {
        if (crash && o.k === 'train') return;
        let a;
        if (o.f > 0.04 && o.v > 0) a = -o.f * o.amax; // 제동
        else if (o.f <= 0.04 && o.v < V0) a = 6; // 손잡이를 올리면 다시 달린다
        else a = 0;
        if (a < 0 && !o.brk) o.brk = { t: 0, d: 0, v: o.v };
        o.v = clamp(o.v + a * dt, 0, V0); o.a = o.v <= 0 && a < 0 ? 0 : a;
        if (o.brk && !o.brk.done) {
          o.brk.t += dt; o.brk.d += o.v * dt;
          if (o.v === 0) { o.brk.done = true; if (o.brk.v >= V0 - 0.01) o.last = { t: o.brk.t, d: o.brk.d, F: M * V0 / o.brk.t }; }
        }
        if (o.f <= 0.04 && o.brk) o.brk = null; // 손잡이를 올리면 끝(서기 전에 풀면 기록 안 함)
        o.off += o.v * dt;
        o.lean += (clamp(-o.a / 8, -0.15, 1) * 0.55 - o.lean) * Math.min(1, dt * 9);
      });
      if (crash) {
        const c = crash; c.t += dt;
        if (c.ph === 'in') { c.gap -= c.v * dt; if (c.gap <= 0) { c.gap = 0; c.ph = 'hit'; c.t0 = c.t; } }
        else if (c.ph === 'hit') { const a = CV * CV / (2 * CRUSH); c.v = Math.max(0, c.v - a * dt); c.crush += c.v * dt; c.F = c.v > 0 ? M * a : 0; L[0].lean += ((c.v > 0 ? a / 8 * 0.55 : 0) - L[0].lean) * Math.min(1, dt * 9); if (c.v === 0) { c.ph = 'stop'; c.dur = c.t - c.t0; c.hold = 2.6; } }
        else if (c.ph === 'stop') { c.hold -= dt; L[0].lean *= 0.9; if (c.hold <= 0) { crash = null; L[0].v = 0; L[0].f = 0; } }
      }
    }
    function startCrash() { if (crash) return; L[0].f = 0; L[0].brk = null; crash = { ph: 'in', t: 0, v: CV, gap: 6, crush: 0, F: 0 }; }

    // ---------- 그림 ----------
    function sky(c, W, g, off, k) {
      c.save(); c.beginPath(); c.rect(0, g.y, W, g.h); c.clip();
      let gr = c.createLinearGradient(0, g.y, 0, g.rail); gr.addColorStop(0, k === 'train' ? '#7db7e6' : '#8fc1e8'); gr.addColorStop(1, '#e3f0f3'); c.fillStyle = gr; c.fillRect(0, g.y, W, g.h);
      // 먼 산(천천히)
      c.fillStyle = k === 'train' ? '#8aa7a0' : '#97aa95';
      c.beginPath(); c.moveTo(0, g.rail - 20);
      for (let x = 0; x <= W + 20; x += 20) { const u = (x + off * 1.2) / 140; c.lineTo(x, g.rail - 34 - 22 * (Math.sin(u) * 0.6 + Math.sin(u * 2.3 + 1) * 0.4)); }
      c.lineTo(W, g.rail); c.lineTo(0, g.rail); c.fill();
      // 나무·전봇대(빠르게)
      const sp = 150, o = off * 12, i0 = Math.floor(o / sp);
      for (let i = i0 - 1; i < i0 + W / sp + 2; i++) {
        const x = i * sp - o + 40 * hash(i, 3), gy = g.rail - 14;
        if (k === 'train') { c.fillStyle = '#6b7178'; c.fillRect(x, g.y + 18, 5, gy - g.y - 18); c.fillRect(x - 12, g.y + 22, 30, 4); }
        else { c.fillStyle = '#6b4a2b'; c.fillRect(x - 3, gy - 34, 6, 34); const tg = c.createRadialGradient(x - 6, gy - 52, 2, x, gy - 44, 24); tg.addColorStop(0, '#7fbf63'); tg.addColorStop(1, '#3f7f3a'); c.fillStyle = tg; c.beginPath(); c.arc(x, gy - 46, 20 + 4 * hash(i, 5), 0, TAU); c.fill(); }
      }
      if (k === 'train') { c.strokeStyle = '#4b5158'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, g.y + 24); c.lineTo(W, g.y + 24); c.stroke(); }
      // 땅
      gr = c.createLinearGradient(0, g.rail - 14, 0, g.y + g.h); gr.addColorStop(0, k === 'train' ? '#a59d8c' : '#6a6d72'); gr.addColorStop(1, k === 'train' ? '#7d7668' : '#4b4e53'); c.fillStyle = gr; c.fillRect(0, g.rail - 14, W, g.y + g.h - g.rail + 14);
      if (k === 'train') { // 침목·레일
        const s2 = 22, o2 = off * 12 % s2; c.fillStyle = '#5b4636'; for (let x = -o2; x < W; x += s2) c.fillRect(x, g.rail + 2, 12, 9);
        c.fillStyle = '#c9ccd0'; c.fillRect(0, g.rail - 1, W, 4); c.fillStyle = '#80858b'; c.fillRect(0, g.rail + 3, W, 2);
      } else { const s2 = 70, o2 = off * 12 % s2; c.fillStyle = '#f2f2ea'; for (let x = -o2; x < W; x += s2) c.fillRect(x, g.rail + 10, 38, 4); }
      c.restore();
    }
    // 앉은 승객(옆모습, 오른쪽을 본다): 엉덩이 (x, y), 크기 s, 앞으로 기운 각 lean
    function rider(c, x, y, s, lean, shirt, belt) {
      const th = -Math.PI / 2 + 0.12 + lean, tx = x + Math.cos(th) * s * 0.9, ty = y + Math.sin(th) * s * 0.9;
      c.lineCap = 'round';
      c.strokeStyle = '#2d3540'; c.lineWidth = s * 0.3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + s * 0.7, y + s * 0.05); c.lineTo(x + s * 0.78, y + s * 0.7); c.stroke(); // 다리
      c.strokeStyle = shirt; c.lineWidth = s * 0.42; c.beginPath(); c.moveTo(x, y - s * 0.05); c.lineTo(tx, ty); c.stroke(); // 몸통
      c.strokeStyle = shirt; c.lineWidth = s * 0.16; c.beginPath(); c.moveTo(tx + s * 0.05, ty + s * 0.12); c.lineTo(tx + s * 0.38 + lean * s * 0.4, ty + s * 0.5); c.stroke(); // 팔
      if (belt) { c.strokeStyle = '#30343b'; c.lineWidth = s * 0.08; c.beginPath(); c.moveTo(tx - s * 0.15, ty + s * 0.05); c.lineTo(x + s * 0.18, y - s * 0.12); c.stroke(); }
      const hx = x + Math.cos(th) * s * 1.22, hy = y + Math.sin(th) * s * 1.22, hr = s * 0.24;
      const g = c.createRadialGradient(hx + hr * 0.3, hy - hr * 0.3, 1, hx, hy, hr); g.addColorStop(0, '#f6d2ad'); g.addColorStop(1, '#d9a679'); c.fillStyle = g; c.beginPath(); c.arc(hx, hy, hr, 0, TAU); c.fill();
      c.fillStyle = '#2a1d15'; c.beginPath(); c.arc(hx - hr * 0.1, hy - hr * 0.15, hr * 1.02, Math.PI * 0.9, Math.PI * 1.9); c.fill();
      c.fillStyle = '#1d1d22'; c.beginPath(); c.arc(hx + hr * 0.5, hy - hr * 0.05, hr * 0.12, 0, TAU); c.fill();
    }
    function seat(c, x, y, s, col) {
      c.fillStyle = col; c.beginPath(); c.roundRect(x - s * 0.55, y - s * 1.25, s * 0.28, s * 1.3, s * 0.1); c.fill();
      c.beginPath(); c.roundRect(x - s * 0.5, y - s * 0.02, s * 0.95, s * 0.22, s * 0.08); c.fill();
      c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x - s * 0.35, y + s * 0.2, s * 0.12, s * 0.45);
    }
    function drawTrain(c, W, g, o) {
      const nose = g.nose + (crash ? -crash.gap * 26 + 0 : 0), cr = crash ? Math.min(crash.crush / CRUSH, 1) : 0;
      const top = g.rail - 128, bot = g.rail - 12, front = nose - cr * 40;
      // 차체(왼쪽 화면 밖까지)
      let gr = c.createLinearGradient(0, top, 0, bot); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.6, '#e6eaef'); gr.addColorStop(1, '#b9c0c9'); c.fillStyle = gr;
      c.beginPath(); c.moveTo(-10, top + 6); c.lineTo(front - 150, top + 6); c.bezierCurveTo(front - 70, top + 8, front - 10, bot - 46, front, bot - 18); c.quadraticCurveTo(front + 2, bot, front - 20, bot); c.lineTo(-10, bot); c.closePath(); c.fill();
      c.strokeStyle = '#7b8591'; c.lineWidth = 2; c.stroke();
      // 파란 띠
      c.fillStyle = '#2a5fae'; c.beginPath(); c.moveTo(-10, bot - 34); c.lineTo(front - 26, bot - 34); c.quadraticCurveTo(front - 8, bot - 30, front - 4, bot - 22); c.lineTo(-10, bot - 22); c.fill();
      // 운전석 창
      c.fillStyle = '#1d2a3a'; c.beginPath(); c.moveTo(front - 140, top + 14); c.quadraticCurveTo(front - 90, top + 16, front - 60, top + 40); c.lineTo(front - 132, top + 40); c.closePath(); c.fill();
      // 객실 창(잘라 보기): 승객
      const wx0 = front - 300, wy0 = top + 16, ww = 150, wh = 80;
      c.save(); c.beginPath(); c.roundRect(wx0, wy0, ww, wh, 10); c.clip();
      c.fillStyle = '#eee5d3'; c.fillRect(wx0, wy0, ww, wh);
      c.fillStyle = '#d8ccb5'; c.fillRect(wx0, wy0 + wh - 10, ww, 10);
      seat(c, wx0 + 54, wy0 + wh - 14, 30, '#3a5f9e'); rider(c, wx0 + 54, wy0 + wh - 16, 30, o.lean, '#c46a2f', false);
      // 앞 의자(등받이 뒷면)
      c.fillStyle = '#3a5f9e'; c.beginPath(); c.roundRect(wx0 + 112, wy0 + 14, 14, wh - 16, 5); c.fill();
      c.restore();
      c.strokeStyle = '#5c6670'; c.lineWidth = 3; c.beginPath(); c.roundRect(wx0, wy0, ww, wh, 10); c.stroke();
      for (let x = wx0 - 70; x > -40; x -= 80) { c.fillStyle = '#26364a'; c.beginPath(); c.roundRect(x, wy0 + 6, 56, 34, 8); c.fill(); }
      // 바퀴 덮개·바퀴
      for (const bx of [front - 120, front - 380]) { c.fillStyle = '#3b4148'; c.fillRect(bx - 44, bot - 4, 88, 10); [-24, 24].forEach((d) => { c.fillStyle = '#1e2226'; c.beginPath(); c.arc(bx + d, bot + 4, 10, 0, TAU); c.fill(); c.fillStyle = '#8c939b'; c.beginPath(); c.arc(bx + d, bot + 4, 4, 0, TAU); c.fill(); }); }
      // 완충 장치(충돌 때만 드러남): 앞 덮개 속 벌집 구조
      if (crash) {
        const bw = 44 * (1 - cr) + 8, bx = front - 6;
        c.fillStyle = '#f0b23a'; c.strokeStyle = '#8a5a12'; c.lineWidth = 1.5; c.beginPath(); c.rect(bx, bot - 46, bw, 30); c.fill(); c.stroke();
        const n = 5; for (let i = 1; i < n; i++) { const xx = bx + bw * i / n; c.beginPath(); c.moveTo(xx, bot - 46); c.lineTo(xx + (cr > 0 ? 3 : 0), bot - 31); c.lineTo(xx, bot - 16); c.stroke(); }
        if (cr > 0.02) { c.strokeStyle = '#5b6470'; c.lineWidth = 2; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(front - 12 - i * 7, top + 70 + i * 6); c.lineTo(front - 4 - i * 7, top + 78 + i * 6); c.stroke(); } }
        // 완충 벽
        const wx = bx + bw;
        gr = c.createLinearGradient(wx, 0, wx + 40, 0); gr.addColorStop(0, '#8a8f96'); gr.addColorStop(1, '#5d636a'); c.fillStyle = gr; c.fillRect(wx, g.rail - 100, 40, 100);
        c.save(); c.beginPath(); c.rect(wx, g.rail - 100, 40, 18); c.clip(); for (let k = -2; k < 8; k++) { c.fillStyle = k % 2 ? '#f2c230' : '#1d2433'; c.beginPath(); c.moveTo(wx + k * 12, g.rail - 100); c.lineTo(wx + k * 12 + 12, g.rail - 100); c.lineTo(wx + k * 12 + 30, g.rail - 82); c.lineTo(wx + k * 12 + 18, g.rail - 82); c.fill(); } c.restore();
      }
    }
    function drawCar(c, W, g, o) {
      const nose = g.nose, bot = g.rail + 4, top = bot - 92, back = nose - 250;
      c.save(); c.translate(nose, bot); c.scale(1.2, 1.2); c.translate(-nose, -bot); // 승객이 잘 보이게 조금 크게
      let gr = c.createLinearGradient(0, top, 0, bot); gr.addColorStop(0, '#e2574a'); gr.addColorStop(0.55, '#c0392b'); gr.addColorStop(1, '#7e2219'); c.fillStyle = gr;
      c.beginPath(); c.moveTo(back, bot - 22); c.lineTo(back + 4, bot - 54); c.quadraticCurveTo(back + 30, bot - 60, back + 56, top + 8); c.lineTo(nose - 108, top + 6); c.quadraticCurveTo(nose - 80, top + 10, nose - 56, bot - 56); c.quadraticCurveTo(nose - 6, bot - 52, nose, bot - 34); c.lineTo(nose, bot - 18); c.quadraticCurveTo(nose, bot - 10, nose - 10, bot - 10); c.lineTo(back + 8, bot - 10); c.closePath(); c.fill();
      c.strokeStyle = '#6a1c14'; c.lineWidth = 2; c.stroke();
      // 창(잘라 보기)
      c.save(); c.beginPath(); c.moveTo(back + 64, top + 14); c.lineTo(nose - 110, top + 12); c.quadraticCurveTo(nose - 88, top + 16, nose - 66, bot - 56); c.lineTo(back + 40, bot - 56); c.closePath(); c.clip();
      c.fillStyle = '#e9e2d2'; c.fillRect(back, top, 260, 80);
      seat(c, nose - 140, bot - 34, 28, '#3a3f48'); rider(c, nose - 140, bot - 36, 28, o.lean, '#3f6fb5', true);
      c.strokeStyle = '#25282d'; c.lineWidth = 5; c.beginPath(); c.moveTo(nose - 92, bot - 46); c.lineTo(nose - 106, bot - 70); c.stroke(); c.beginPath(); c.ellipse(nose - 106, bot - 72, 4, 13, -0.4, 0, TAU); c.stroke(); // 운전대
      c.restore();
      c.strokeStyle = '#6a1c14'; c.lineWidth = 3; c.beginPath(); c.moveTo(nose - 172, top + 12); c.lineTo(nose - 172, bot - 56); c.stroke();
      c.fillStyle = '#fff3b0'; c.beginPath(); c.roundRect(nose - 12, bot - 38, 10, 12, 3); c.fill(); c.fillStyle = '#ff6a50'; c.fillRect(back + 6, bot - 44, 8, 12);
      [nose - 52, back + 52].forEach((wx) => { const r = 19, rot = (o.off / 0.32) % TAU; c.fillStyle = '#16181b'; c.beginPath(); c.arc(wx, bot - 10, r, 0, TAU); c.fill(); c.fillStyle = '#a7adb5'; c.beginPath(); c.arc(wx, bot - 10, r * 0.55, 0, TAU); c.fill(); c.strokeStyle = '#5a6068'; c.lineWidth = 2.5; for (let k = 0; k < 5; k++) { const a = rot + k * TAU / 5; c.beginPath(); c.moveTo(wx, bot - 10); c.lineTo(wx + Math.cos(a) * r * 0.55, bot - 10 + Math.sin(a) * r * 0.55); c.stroke(); } });
      if (o.a < -3 && o.v > 0) { c.strokeStyle = 'rgba(40,40,40,.5)'; c.lineWidth = 4; c.beginPath(); c.moveTo(nose - 52, bot + 9); c.lineTo(nose - 52 - 120, bot + 9); c.moveTo(back + 52, bot + 9); c.lineTo(back + 52 - 120, bot + 9); c.stroke(); }
      c.restore();
    }
    function lever(c, g, o) {
      const v = g.lv; c.fillStyle = 'rgba(255,255,255,.92)'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.roundRect(v.x, v.y - 26, v.w, v.h + 34, 10); c.fill(); c.stroke();
      txt(c, '손잡이', v.x + v.w / 2, v.y - 7, '#1d2433', '800 15px');
      const sx = v.x + v.w / 2, y0 = v.y + 20, y1 = v.y + v.h - 22;
      const gr = c.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, '#2f8a4a'); gr.addColorStop(1, '#d9483b'); c.fillStyle = gr; c.beginPath(); c.roundRect(sx - 5, y0, 10, y1 - y0, 5); c.fill();
      const ky = y0 + o.f * (y1 - y0), bob = o.f < 0.05 && !drag ? 3 * Math.sin(t * 4) : 0;
      c.fillStyle = '#ffd84d'; c.strokeStyle = '#1d2433'; c.lineWidth = 3; c.beginPath(); c.roundRect(sx - 20, ky - 11 + bob, 40, 22, 8); c.fill(); c.stroke();
      if (o.f < 0.05 && !drag) { c.fillStyle = '#1d2433'; c.beginPath(); c.moveTo(sx - 7, ky + 18 + bob); c.lineTo(sx + 7, ky + 18 + bob); c.lineTo(sx, ky + 27 + bob); c.fill(); }
      txt(c, '제동', sx, v.y + v.h + 2, '#b0301f', '800 15px');
    }
    function meter(c, W, g, o, i) {
      const x = W - 228, y = g.y + 8, w = 218, h = 76;
      c.fillStyle = 'rgba(255,255,255,.93)'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.roundRect(x, y, w, h, 10); c.fill(); c.stroke();
      txt(c, o.name, x + 10, y + 22, o.col, '800 17px', 'left');
      const kmh = Math.round((crash && i === 0 ? crash.v : o.v) * 3.6); txt(c, `${kmh} km/h`, x + w - 10, y + 22, '#1d2433', '700 16px', 'right');
      txt(c, '승객이 받는 힘', x + 10, y + 44, '#1d2433', '700 14px', 'left');
      const F = crash && i === 0 ? crash.F : Math.max(0, -o.a * M), bx = x + 112, bw = w - 122, k = clamp(F / FMAX, 0, 1);
      c.fillStyle = '#e8e4da'; c.fillRect(bx, y + 32, bw, 16);
      c.fillStyle = F > 600 ? '#d9483b' : F > 300 ? '#ef8a2b' : '#3f9a55'; c.fillRect(bx, y + 32, bw * k, 16); c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; c.strokeRect(bx, y + 32, bw, 16);
      if (o.last && !(crash && i === 0)) { const kx = bx + bw * clamp(o.last.F / FMAX, 0, 1); c.strokeStyle = '#1d2433'; c.lineWidth = 3; c.beginPath(); c.moveTo(kx, y + 28); c.lineTo(kx, y + 52); c.stroke(); }
      let line;
      if (crash && i === 0) line = crash.ph === 'stop' ? `멈추는 데 ${crash.dur.toFixed(2)}초 · ${Math.round(M * CV / crash.dur)} N` : crash.ph === 'hit' ? '완충 장치가 찌그러지는 중' : '느린 속력으로 다가간다';
      else if (o.brk && !o.brk.done) line = `멈추는 중 ${o.brk.t.toFixed(1)}초 · ${Math.round(o.brk.d)} m`;
      else if (o.last) line = `멈추는 데 ${o.last.t.toFixed(1)}초 · ${Math.round(o.last.d)} m · ${Math.round(o.last.F)} N`;
      else line = '손잡이를 아래로 끌어 세운다';
      txt(c, line, x + 10, y + 68, '#1d2433', '700 14px', 'left');
    }
    function drawSign(c, W, H) {
      const s = signC(W, H), on = !!crash; c.fillStyle = '#6b4a2b'; c.fillRect(s.x + s.w / 2 - 3, s.y + s.h, 6, 10);
      c.fillStyle = on ? '#ffd84d' : '#f3ead7'; c.strokeStyle = '#1d2433'; c.lineWidth = on ? 3 : 2; c.beginPath(); c.roundRect(s.x, s.y, s.w, s.h, 8); c.fill(); c.stroke();
      txt(c, '충돌하면?', s.x + s.w / 2, s.y + 26, '#1d2433', '800 19px');
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const slow = crash && crash.ph !== 'in' ? 0.25 : 1;
        for (let k = 0; k < 4; k++) step(dt * slow / 4);
        c.fillStyle = '#1d2433'; c.fillRect(0, 0, W, H);
        L.forEach((o, i) => { const g = lane(i, W, H); sky(c, W, g, o.off * 0.5, o.k); c.save(); c.beginPath(); c.rect(0, g.y, W, g.h); c.clip(); if (i === 0) drawTrain(c, W, g, o); else drawCar(c, W, g, o); c.restore(); lever(c, g, o); meter(c, W, g, o, i); });
        drawSign(c, W, H);
        if (crash && crash.ph !== 'in') { const g = lane(0, W, H); c.fillStyle = 'rgba(255,251,230,.92)'; c.beginPath(); c.roundRect(W - 340, g.y + g.h - 48, 104, 30, 15); c.fill(); txt(c, '느린 화면', W - 288, g.y + g.h - 27, '#5a3a1a', '800 17px'); }
        // 안내 한 줄
        const a = L[0].last, b = L[1].last;
        if (crash) say(crash.ph === 'stop' ? '완충 장치가 <b>멈추는 시간</b>을 늘렸다' : '열차가 완충 벽에 부딪친다');
        else if (a && b) say(`열차 ${a.t.toFixed(1)}초 · 자동차 ${b.t.toFixed(1)}초 → <b>오래 걸릴수록 힘이 작다</b>`, a.t > b.t);
        else if (a || b) say(`${a ? '열차' : '자동차'} 멈춤! 이번엔 ${a ? '자동차' : '열차'}도 세워 보자`);
        else say('두 손잡이를 아래로 끌어 세워 보자');
      },
      down(p) {
        const W = S.W, H = S.H, s = signC(W, H);
        if (p.x >= s.x - 6 && p.x <= s.x + s.w + 6 && p.y >= s.y - 6 && p.y <= s.y + s.h + 12) { startCrash(); return; }
        for (let i = 0; i < 2; i++) { const g = lane(i, W, H), v = g.lv; if (p.x >= v.x - 8 && p.x <= v.x + v.w + 24 && p.y >= v.y - 30 && p.y <= v.y + v.h + 14) { if (i === 0 && crash) return; drag = { i, g }; this.move(p); return; } }
      },
      move(p) { if (!drag) return; const v = drag.g.lv, y0 = v.y + 20, y1 = v.y + v.h - 22; L[drag.i].f = clamp((p.y - y0) / (y1 - y0), 0, 1); },
      up() { drag = null; },
      key(e) {
        const k = e.key;
        if (k === 'ArrowUp' || k === 'ArrowDown') { if (!crash) L[0].f = k === 'ArrowDown' ? 1 : 0; return true; }
        if (k === 'ArrowRight' || k === 'ArrowLeft') { L[1].f = k === 'ArrowRight' ? 1 : 0; return true; }
        if (k === 'c' || k === 'C') { startCrash(); return true; }
        if (k === '0') { reset(); return true; } return false;
      },
    });
    const state = () => ({ lanes: L.map((o) => ({ k: o.k, v: +o.v.toFixed(2), f: o.f, last: o.last && { t: +o.last.t.toFixed(2), d: Math.round(o.last.d), F: Math.round(o.last.F) } })), crash: crash && { ph: crash.ph, dur: crash.dur }, msg });
    root._tr = {
      pull: (i, f) => { L[i].f = f; S.kick(); return state(); },
      run: (sec) => { for (let i = 0; i < sec * 500; i++) step(0.002); S.kick(); return state(); },
      crash: () => { startCrash(); S.kick(); return state(); },
      state,
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Train = { mount };
})();
