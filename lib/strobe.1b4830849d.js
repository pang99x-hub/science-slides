/* 3-2 1차시 체험 «낙하 사진 분석하기»(교과서 125쪽 해 보기 · 그림 Ⅲ-15 · 참고서 161쪽 구간 평균 속도 표).
   어두운 촬영 배경에 0~130 cm 눈금자, 위에 공 거는 집게, 바닥에 받침 상자, 오른쪽에 삼각대 위 스마트 기기와 섬광등.
   ① 받침 상자의 공을 집게까지 끌어 걸면 집게가 열리고 공이 떨어지며 0.1초마다 섬광 → 공의 잔상이 차례로 남는다(느린 화면 ×1/5).
   ② 자(캘리퍼스)의 두 집게를 끌어 이웃한 두 공의 중심에 맞추면(가까우면 착 붙음) 표·그래프가 채워진다.
   ③ 셋 이상 잰 뒤 그래프를 누르면 기울기(≈ 9.8 m/s²)를 읽는다.
   거리는 공기 저항이 없다고 보고 d = ½·g·t²(g = 9.8 m/s²)로 계산한 이해를 돕기 위한 예.
   Strobe.mount(root) → { fit, setActive } · 시험용: root._sf.drop() · measure(1~5) · slope() · state() · geo() */
(function () {
  'use strict';
  const TAU = Math.PI * 2, G = 980, DT = 0.1, N = 5, SLOW = 5, LAND = 124, R = 17;
  const pos = (t) => 0.5 * G * t * t;                       // 놓은 지 t초 뒤 떨어진 거리(cm)
  const GHOST = Array.from({ length: N + 1 }, (_, i) => pos(i * DT)); // 0, 4.9, 19.6, 44.1, 78.4, 122.5
  const gap = (i) => GHOST[i] - GHOST[i - 1];               // i번째 구간(1~5) 거리(cm)
  const vavg = (i) => gap(i) / 100 / DT;                     // 구간 평균 속도(m/s)
  const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1), f2 = (x) => (Math.round(x * 100) / 100).toFixed(2);
  // 자체 확인: 구간 거리 4.9·14.7·24.5·34.3·44.1 cm, 기울기 9.8 m/s²
  console.assert([1, 2, 3, 4, 5].map((i) => f1(gap(i))).join() === '4.9,14.7,24.5,34.3,44.1' && Math.abs((vavg(5) - vavg(1)) / 0.4 - 9.8) < 1e-9, 'strobe: 구간 거리·기울기');

  function mount(root) {
    const stage = root.querySelector('.sf-stage'), now = root.querySelector('.sf-now'), out = root.querySelector('.sf-out');
    const tbody = root.querySelector('.sf-tab tbody'), gbox = root.querySelector('.sf-graph'), svg = gbox.querySelector('svg');
    const photo = root.querySelector('.sf-photo');
    const P = window.Play;
    let ph, t, wait, ghosts, flash, ball, drag, jaws, meas, last, slope, clock, msg, calIn, bg = null, bgKey = '';

    function reset() {
      ph = 'idle'; t = 0; wait = 0; ghosts = []; flash = 0; drag = null; meas = new Set(); last = 0; slope = false; clock = 0; calIn = 0; msg = '';
      ball = null; jaws = [{ cm: 52, snap: -1 }, { cm: 68, snap: -1 }];
      tbody.innerHTML = [1, 2, 3, 4, 5].map((i) => `<tr data-i="${i}"><td>${f1((i - 1) * DT)} ~ ${f1(i * DT)}</td><td class="d"></td><td class="v"></td></tr>`).join('');
      say('받침 상자의 <b>공</b>을 맨 위 <b>집게</b>(점선 원)까지 끌어 올려 걸어 보자.');
      graph(); steps();
    }
    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };

    // ── 자리 잡기(무대 크기에 맞춰) ──
    const geo = () => {
      const W = S.W, H = S.H, Y0 = Math.max(100, H * 0.145), floor = H - 30;
      const k = (floor - 26 - R - Y0) / LAND;
      return { W, H, Y0, k, floor, RX: W * 0.07, BX: W * 0.27, CX: W * 0.37, SX: W * 0.6, PX: W * 0.74, Y: (cm) => Y0 + cm * k };
    };
    const rest = (g) => ({ x: g.SX, y: g.floor - 64 - R }); // 처음 공이 놓인 받침대 위

    // ── 그림 ──
    function drawBall(c, x, y, a = 1, glow = 0) {
      c.save(); c.globalAlpha = a;
      if (glow) P.glow(c, x, y, R * 2.4, `rgba(255,236,150,${0.35 * glow})`);
      const g = c.createRadialGradient(x - R * 0.4, y - R * 0.45, R * 0.1, x, y, R);
      g.addColorStop(0, '#fff7c2'); g.addColorStop(0.35, '#f6cf3c'); g.addColorStop(0.85, '#c98f12'); g.addColorStop(1, '#7c5508');
      c.fillStyle = g; c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(60,35,5,.75)'; c.lineWidth = 1.4;
      c.beginPath(); c.arc(x, y, R, 0, TAU); c.stroke();
      c.save(); c.beginPath(); c.arc(x, y, R - 0.5, 0, TAU); c.clip();
      c.beginPath(); c.moveTo(x - R, y + 2); c.bezierCurveTo(x - R * 0.3, y - 4, x + R * 0.3, y + 8, x + R, y + 1); c.stroke();
      c.beginPath(); c.ellipse(x - R * 0.9, y, R * 0.55, R * 1.05, 0, -1.2, 1.2); c.stroke();
      c.beginPath(); c.ellipse(x + R * 0.9, y, R * 0.55, R * 1.05, 0, Math.PI - 1.2, Math.PI + 1.2); c.stroke();
      c.restore();
      c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(x - R * 0.38, y - R * 0.45, R * 0.28, R * 0.16, -0.6, 0, TAU); c.fill();
      c.restore();
    }

    function paintBg(g) {
      const { W, H, RX, BX, Y, Y0, floor, PX } = g;
      const k2 = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const cv = document.createElement('canvas'); cv.width = W * k2; cv.height = H * k2;
      const c = cv.getContext('2d'); c.setTransform(k2, 0, 0, k2, 0, 0);
      // 검은 촬영 천(가운데가 조금 밝은 그라데이션 + 주름)
      const wall = c.createRadialGradient(W * 0.3, H * 0.45, 40, W * 0.3, H * 0.5, W * 0.75);
      wall.addColorStop(0, '#2a2f3a'); wall.addColorStop(1, '#0b0d12'); c.fillStyle = wall; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 14; i++) { const x = (i + 0.5) / 14 * W, gg = c.createLinearGradient(x - 30, 0, x + 30, 0); gg.addColorStop(0, 'rgba(255,255,255,0)'); gg.addColorStop(0.5, `rgba(255,255,255,${i % 2 ? 0.025 : 0.045})`); gg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gg; c.fillRect(x - 30, 0, 60, floor); }
      for (let i = 0; i < 900; i++) { c.fillStyle = `rgba(255,255,255,${0.012 + (i % 5) * 0.004})`; c.fillRect(((i * 397) % 1009) / 1009 * W, ((i * 211) % 997) / 997 * floor, 1.5, 1.5); }
      // 바닥(나무 마루)
      const fl = c.createLinearGradient(0, floor, 0, H); fl.addColorStop(0, '#5b4330'); fl.addColorStop(1, '#3a2a1d'); c.fillStyle = fl; c.fillRect(0, floor, W, H - floor);
      c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1; for (let x = 20; x < W; x += 90) { c.beginPath(); c.moveTo(x, floor); c.lineTo(x - 14, H); c.stroke(); }
      c.fillStyle = 'rgba(255,220,170,.18)'; c.fillRect(0, floor, W, 2);
      // 스탠드 기둥과 팔(집게는 매 장면 그린다)
      const px = RX - 24;
      const metal = (x0, w) => { const m = c.createLinearGradient(x0, 0, x0 + w, 0); m.addColorStop(0, '#6d737c'); m.addColorStop(0.45, '#e3e7ec'); m.addColorStop(1, '#5a6068'); return m; };
      c.fillStyle = metal(px - 5, 10); c.fillRect(px - 5, Y0 - 52, 10, floor - Y0 + 52);
      c.fillStyle = '#2b2f36'; c.beginPath(); c.roundRect(px - 40, floor - 12, 80, 12, 4); c.fill();
      const arm = c.createLinearGradient(0, Y0 - 50, 0, Y0 - 42); arm.addColorStop(0, '#e3e7ec'); arm.addColorStop(1, '#5a6068');
      c.fillStyle = arm; c.fillRect(px, Y0 - 50, BX - px + 4, 8);
      c.fillStyle = '#3a3f47'; c.beginPath(); c.roundRect(px - 9, Y0 - 56, 18, 20, 4); c.fill();
      // 세로 눈금자(cm)
      const top = Y(-3), bot = Y(130), rw = 66;
      const wood = c.createLinearGradient(RX, 0, RX + rw, 0); wood.addColorStop(0, '#f2ead3'); wood.addColorStop(0.5, '#fffaf0'); wood.addColorStop(1, '#e2d6b8');
      c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(RX + 4, top + 4, rw, bot - top + 8);
      c.fillStyle = wood; c.fillRect(RX, top, rw, bot - top + 8);
      c.strokeStyle = '#1d2433'; c.lineWidth = 1;
      for (let cm = 0; cm <= 130; cm++) {
        const y = Y(cm), L = cm % 10 === 0 ? 22 : cm % 5 === 0 ? 14 : 8;
        c.beginPath(); c.moveTo(RX + rw - L, y); c.lineTo(RX + rw, y); c.stroke();
        if (cm % 10 === 0) P.txt(c, String(cm), RX + rw - 24, y + 7, '#1d2433', '700 20px', 'right');
      }
      P.txt(c, 'cm', RX + rw / 2, top - 8, '#e9edf3', '700 20px');
      // 받침 상자(스펀지)와 처음 공 받침대
      const cy = Y(LAND) + R + 2;
      c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.ellipse(BX, floor, 74, 8, 0, 0, TAU); c.fill();
      const sp = c.createLinearGradient(0, cy, 0, floor); sp.addColorStop(0, '#3f78b8'); sp.addColorStop(1, '#244a77');
      c.fillStyle = sp; c.beginPath(); c.roundRect(BX - 66, cy, 132, floor - cy, 6); c.fill();
      for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.arc(BX - 60 + ((i * 37) % 120), cy + 4 + ((i * 13) % Math.max(4, floor - cy - 8)), 1.6, 0, TAU); c.fill(); }
      P.txt(c, '받침 상자', BX, floor + 22, '#f3e6d2', '700 18px');
      const s = rest(g);
      c.fillStyle = '#7d5a3a'; c.beginPath(); c.roundRect(s.x - 34, floor - 64, 68, 64, 6); c.fill();
      c.fillStyle = '#9b744f'; c.fillRect(s.x - 34, floor - 64, 68, 8);
      P.txt(c, '공', s.x, floor - 22, '#f7ecd8', '700 20px');
      // 섬광등과 삼각대 위 스마트 기기
      const lx = PX, ly = H * 0.2;
      c.strokeStyle = '#3a3f47'; c.lineWidth = 6; c.beginPath(); c.moveTo(lx, ly + 30); c.lineTo(lx, floor); c.stroke();
      c.lineWidth = 4; [-32, 32].forEach((dx) => { c.beginPath(); c.moveTo(lx, floor - 70); c.lineTo(lx + dx, floor); c.stroke(); });
      const hood = c.createLinearGradient(lx - 34, 0, lx + 34, 0); hood.addColorStop(0, '#2b2f36'); hood.addColorStop(0.5, '#59606b'); hood.addColorStop(1, '#2b2f36');
      c.fillStyle = hood; c.beginPath(); c.moveTo(lx - 22, ly - 26); c.lineTo(lx + 22, ly - 26); c.lineTo(lx + 36, ly + 26); c.lineTo(lx - 36, ly + 26); c.closePath(); c.fill();
      P.txt(c, '섬광등', lx, ly - 36, '#e9edf3', '700 20px');
      const tx = PX, ty = H * 0.56;
      c.strokeStyle = '#3a3f47'; c.lineWidth = 4; [-40, 0, 40].forEach((dx) => { c.beginPath(); c.moveTo(tx, ty + 44); c.lineTo(tx + dx, floor); c.stroke(); });
      c.fillStyle = '#16191f'; c.beginPath(); c.roundRect(tx - 32, ty - 50, 64, 100, 10); c.fill();
      c.strokeStyle = '#59606b'; c.lineWidth = 2; c.stroke();
      c.fillStyle = '#0b0d12'; c.beginPath(); c.roundRect(tx - 26, ty - 42, 52, 84, 6); c.fill();
      P.txt(c, '스마트 기기', tx, ty + 74, '#e9edf3', '700 20px');
      return cv;
    }

    function clampAt(c, g, open) {
      const { BX, Y0 } = g, o = open * 10;
      c.fillStyle = '#3a3f47'; c.beginPath(); c.roundRect(BX - 14, Y0 - 50, 28, 18, 4); c.fill();
      c.strokeStyle = '#c9ced5'; c.lineWidth = 5; c.lineCap = 'round';
      c.beginPath(); c.moveTo(BX - 8, Y0 - 34); c.quadraticCurveTo(BX - 14 - o, Y0 - 22, BX - 9 - o * 1.4, Y0 - 9); c.stroke();
      c.beginPath(); c.moveTo(BX + 8, Y0 - 34); c.quadraticCurveTo(BX + 14 + o, Y0 - 22, BX + 9 + o * 1.4, Y0 - 9); c.stroke();
      c.lineCap = 'butt';
    }

    function draw(c, W, H, dt) {
      if (!W) return;
      const g = geo(); clock += dt;
      const key = W + 'x' + H; if (key !== bgKey) { bg = paintBg(g); bgKey = key; }
      c.clearRect(0, 0, W, H); c.drawImage(bg, 0, 0, W, H);
      const { BX, CX, Y, Y0, PX, floor } = g;
      // 움직임: 떨어지는 동안
      if (ph === 'hang') { wait += dt; if (wait > 0.55) { ph = 'fall'; t = 0; stamp(0); say('번쩍! 섬광이 터질 때의 공만 사진에 남는다. <small>(느린 화면 · 실제로는 약 0.5초)</small>'); } }
      if (ph === 'fall') {
        const t1 = t + dt / SLOW;
        for (let i = 1; i <= N; i++) if (t < i * DT && t1 >= i * DT) stamp(i);
        t = t1;
        if (pos(t) >= LAND) { ph = 'photo'; t = Math.sqrt(2 * LAND / G); say('아래로 갈수록 공 사이가 <b>벌어졌다</b>. 오른쪽 <b>자</b>의 두 집게를 이웃한 두 공의 <b>중심</b>에 맞춰 보자.'); steps(); }
      }
      if (ph === 'photo') calIn = Math.min(1, calIn + dt * 2.5);
      flash = Math.max(0, flash - dt * 3);
      // 섬광등 불빛
      const lx = PX, ly = H * 0.2, lamp = ph === 'fall' || ph === 'hang' ? 0.25 + flash : flash;
      if (lamp > 0.02) { c.save(); c.globalAlpha = Math.min(1, lamp); const beam = c.createRadialGradient(lx, ly, 10, lx - 40, ly + 80, W * 0.5); beam.addColorStop(0, 'rgba(255,255,240,.55)'); beam.addColorStop(1, 'rgba(255,255,240,0)'); c.fillStyle = beam; c.beginPath(); c.moveTo(lx - 30, ly + 20); c.lineTo(BX - 120, floor); c.lineTo(BX + 220, floor); c.lineTo(lx + 30, ly + 20); c.closePath(); c.fill(); c.restore(); }
      c.fillStyle = flash > 0.3 ? '#fffbe0' : '#c9ced5'; c.beginPath(); c.ellipse(lx, ly + 24, 34, 6, 0, 0, TAU); c.fill();
      // 스마트 기기 화면: 촬영 중 표시
      const tx = PX, ty = H * 0.56, rec = ph === 'hang' || ph === 'fall';
      c.fillStyle = rec ? '#1f2b3d' : '#141922'; c.fillRect(tx - 26, ty - 42, 52, 84);
      for (let i = 0; i < ghosts.length; i++) { c.fillStyle = '#f6cf3c'; c.beginPath(); c.arc(tx - 6, ty - 34 + ghosts[i] * 0.55, 2.4, 0, TAU); c.fill(); }
      if (rec && Math.sin(clock * 8) > 0) { c.fillStyle = '#ff4b3e'; c.beginPath(); c.arc(tx + 15, ty - 33, 5, 0, TAU); c.fill(); }
      // 섬광 사진의 공들(잔상)
      ghosts.forEach((cm, i) => {
        const y = Y(cm), sh = 0.06 * Math.sin(clock * 2 + i);
        drawBall(c, BX, y, 0.88 + sh, 0.6);
        P.txt(c, `${f1(i * DT)} s`, BX - R - 12, y + 6, '#cfd6e2', '700 18px', 'right');
      });
      clampAt(c, g, ph === 'idle' || ph === 'drag' ? 0.2 + 0.2 * Math.sin(clock * 2) : ph === 'hang' ? Math.max(0, Math.min(1, (wait - 0.3) / 0.25)) : 1);
      // 집게 표적
      if (ph === 'idle' || ph === 'drag') {
        c.save(); c.setLineDash([7, 6]); c.lineDashOffset = -clock * 18; c.strokeStyle = '#ffd84d'; c.lineWidth = 3;
        c.beginPath(); c.arc(BX, Y0, R + 12 + Math.sin(clock * 3) * 2, 0, TAU); c.stroke(); c.restore();
        P.txt(c, '여기에 걸기', BX + R + 22, Y0 + 7, '#ffd84d', '700 20px', 'left');
      }
      // 움직이는 공
      let bx, by;
      if (ph === 'idle') { const s = rest(g); bx = s.x; by = s.y + Math.sin(clock * 3) * 1.5; }
      else if (ph === 'drag') { bx = ball.x; by = ball.y; }
      else if (ph === 'hang') { bx = BX; by = Y0; }
      else if (ph === 'fall') { bx = BX; by = Y(pos(t)); }
      else { bx = BX; by = Y(LAND) + 4; }
      if (ph === 'fall') { c.save(); c.globalAlpha = 0.25; for (let j = 1; j < 5; j++) drawBall(c, BX, Y(pos(Math.max(0, t - j * 0.004))), 0.3); c.restore(); }
      drawBall(c, bx, by, 1, ph === 'drag' ? 0.6 : 0);
      if (ph === 'idle') hand(c, bx, by - R - 58 - Math.abs(Math.sin(clock * 2.4)) * 12);
      // 섬광 번쩍
      if (flash > 0) { c.fillStyle = `rgba(255,255,245,${0.22 * flash})`; c.fillRect(0, 0, W, floor); }
      // 자(캘리퍼스)
      if (calIn > 0) caliper(c, g);
      if (ph === 'photo' && meas.size === 0 && calIn >= 1 && !drag) { const o = order(); hand(c, CX + 90, Y(jaws[o[0]].cm) + 8 + Math.abs(Math.sin(clock * 2.4)) * 10); }
    }

    // 안내 화살표(위로 끌라는 뜻, 살짝 튄다)
    function hand(c, x, y) {
      c.save(); c.translate(x, y); c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = 6;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(16, 20); c.lineTo(6, 20); c.lineTo(6, 44); c.lineTo(-6, 44); c.lineTo(-6, 20); c.lineTo(-16, 20); c.closePath();
      c.fillStyle = '#ffd84d'; c.fill(); c.shadowBlur = 0; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.stroke(); c.restore();
    }

    const order = () => [0, 1]; // 위 집게 0, 아래 집게 1(서로 넘지 않는다)
    function caliper(c, g) {
      const { CX, BX, Y, RX } = g, slide = (1 - calIn) * 260, x = CX + slide;
      const [ia, ib] = order(), ya = Y(jaws[ia].cm), yb = Y(jaws[ib].cm);
      c.save(); c.globalAlpha = calIn;
      // 자의 몸통(세로 막대)
      const top = Y(-6), bot = Y(128);
      const body = c.createLinearGradient(x + 18, 0, x + 40, 0); body.addColorStop(0, '#8d949e'); body.addColorStop(0.5, '#eef1f5'); body.addColorStop(1, '#7a818b');
      c.fillStyle = body; c.beginPath(); c.roundRect(x + 18, top, 22, bot - top, 6); c.fill();
      c.strokeStyle = 'rgba(0,0,0,.4)'; c.lineWidth = 1; for (let cm = 0; cm <= 125; cm += 5) { const y = Y(cm); c.beginPath(); c.moveTo(x + 18, y); c.lineTo(x + (cm % 10 ? 25 : 30), y); c.stroke(); }
      // 두 집게: 끝이 공 중심을 가리킨다
      [[ia, ya, -1], [ib, yb, 1]].forEach(([j, y, dir]) => {
        const J = jaws[j], on = J.snap >= 0, col = on ? '#5cd68a' : '#ffd84d';
        c.save(); c.setLineDash([5, 6]); c.strokeStyle = on ? 'rgba(92,214,138,.85)' : 'rgba(255,216,77,.7)'; c.lineWidth = 2;
        c.beginPath(); c.moveTo(RX + 66, y); c.lineTo(BX + R + 8, y); c.stroke(); c.restore();
        const jg = c.createLinearGradient(0, y - 7, 0, y + 7); jg.addColorStop(0, '#f4f6f9'); jg.addColorStop(1, '#8d949e');
        c.fillStyle = jg; c.beginPath(); c.moveTo(BX + R + 6, y); c.lineTo(BX + R + 26, y - 7); c.lineTo(x + 40, y - 7); c.lineTo(x + 40, y + 7); c.lineTo(BX + R + 26, y + 7); c.closePath(); c.fill();
        c.strokeStyle = col; c.lineWidth = 2.5; c.stroke();
        // 손잡이(위 집게는 위로, 아래 집게는 아래로)
        const hy = dir < 0 ? y - 52 : y + 4;
        const hg = c.createLinearGradient(x + 44, 0, x + 118, 0); hg.addColorStop(0, '#3a3f47'); hg.addColorStop(1, '#22262c');
        c.fillStyle = hg; c.beginPath(); c.roundRect(x + 42, hy, 96, 48, 10); c.fill();
        c.strokeStyle = col; c.lineWidth = drag && drag.j === j ? 4 : 2.5; c.stroke();
        for (let r = 0; r < 3; r++) { c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x + 52 + r * 8, hy + 12, 3, 24); }
        P.txt(c, f1(J.cm), x + 130, hy + 32, col, '700 20px', 'right');
      });
      // 두 집게 사이 거리
      const d = jaws[ib].cm - jaws[ia].cm, mid = (ya + yb) / 2;
      if (yb - ya > 26) { c.strokeStyle = '#fbfcf9'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 8, ya + 3); c.lineTo(x + 8, yb - 3); c.stroke(); }
      const lab = `${f1(d)} cm`, lw = 98, lxp = x + 146, lyp = Math.max(ya + 4, Math.min(yb - 4, mid)) - 17;
      c.fillStyle = 'rgba(15,22,48,.88)'; c.beginPath(); c.roundRect(lxp, lyp, lw, 34, 8); c.fill();
      c.strokeStyle = jaws[0].snap >= 0 && jaws[1].snap >= 0 ? '#5cd68a' : '#ffd84d'; c.lineWidth = 2; c.stroke();
      P.txt(c, lab, lxp + lw / 2, lyp + 25, '#fbfcf9', '700 21px');
      c.restore();
    }

    // ── 사진·측정·그래프 ──
    function stamp(i) { if (ghosts.length === i) ghosts.push(GHOST[i]); flash = 1; try { if (navigator.vibrate) navigator.vibrate(12); } catch { /* 지원 안 함 */ } }

    function record(i) {
      const fresh = !meas.has(i); meas.add(i); last = i;
      const tr = tbody.querySelector(`tr[data-i="${i}"]`);
      const inc = meas.has(i - 1) ? ` <em>+${f1(gap(i) - gap(i - 1))}</em>` : '';
      tr.querySelector('.d').innerHTML = f1(gap(i)) + inc; tr.querySelector('.v').textContent = f2(vavg(i));
      if (meas.has(i + 1)) { const tn = tbody.querySelector(`tr[data-i="${i + 1}"] .d`); tn.innerHTML = `${f1(gap(i + 1))} <em>+${f1(gap(i + 1) - gap(i))}</em>`; }
      tbody.querySelectorAll('tr').forEach((r) => r.classList.toggle('new', +r.dataset.i === i));
      const s = `${f1((i - 1) * DT)}~${f1(i * DT)}초: <b>${f1(gap(i))} cm</b> 떨어졌다 → ${f1(gap(i))} cm ÷ 0.1 s = <b>${f2(vavg(i))} m/s</b>`;
      say(meas.size >= 3 && !slope ? `${s}<br>점이 한 줄로 늘어선다. <b>그래프를 눌러</b> 기울기를 읽자.` : fresh && meas.size < 3 ? `${s}<br><small>다른 이웃 구간도 재 보자(${meas.size}/3).</small>` : s);
      graph(); steps();
    }

    function showSlope() {
      if (meas.size < 3) { say(`그래프의 점이 아직 ${meas.size}개다. 구간을 <b>셋 이상</b> 재야 기울기를 읽을 수 있다.`); gbox.classList.remove('bad'); void gbox.offsetWidth; gbox.classList.add('bad'); return; }
      slope = true; const a = Math.min(...meas), b = Math.max(...meas), dv = vavg(b) - vavg(a), dtt = (b - a) * DT;
      say(`기울기 = 속도 변화 ÷ 걸린 시간 = ${f2(dv)} m/s ÷ ${f1(dtt)} s ≈ <b>9.8 m/s²</b> → 1초마다 9.8 m/s씩 빨라진다.`);
      graph(); steps();
    }

    function graph() {
      const x0 = 74, x1 = 600, y0 = 210, y1 = 46, X = (s) => x0 + s / 0.5 * (x1 - x0), V = (v) => y0 - v / 5 * (y0 - y1);
      let h = '';
      for (let v = 0; v <= 5; v++) h += `<line x1="${x0}" x2="${x1}" y1="${V(v)}" y2="${V(v)}" class="gl"/><text x="${x0 - 10}" y="${V(v) + 7}" text-anchor="end">${v}</text>`;
      for (let k = 0; k <= 5; k++) h += `<line x1="${X(k / 10)}" x2="${X(k / 10)}" y1="${y0}" y2="${y0 + 6}" class="ax"/><text x="${X(k / 10)}" y="${y0 + 28}" text-anchor="middle">${f1(k / 10)}</text>`;
      h += `<line x1="${x0}" x2="${x1 + 10}" y1="${y0}" y2="${y0}" class="ax"/><line x1="${x0}" x2="${x0}" y1="${y0}" y2="${y1 - 14}" class="ax"/>`;
      h += `<text x="${x0 - 52}" y="24" class="lab">구간 평균 속도(m/s)</text><text x="${x1 + 30}" y="${y0 - 12}" text-anchor="end" class="lab">시간(s)</text>`;
      const pts = [...meas].sort((a, b) => a - b);
      if (pts.length >= 2) h += `<line x1="${X(0)}" y1="${V(0)}" x2="${X(0.5)}" y2="${V(4.9)}" class="fit"/>`;
      if (slope) {
        const a = pts[0], b = pts[pts.length - 1], ta = (a - 0.5) * DT, tb = (b - 0.5) * DT;
        h += `<path d="M${X(ta)} ${V(vavg(a))} H${X(tb)} V${V(vavg(b))}" class="tri"/>`;
        h += `<text x="${(X(ta) + X(tb)) / 2}" y="${V(vavg(a)) + 26}" text-anchor="middle" class="tl">${f1(tb - ta)} s</text>`;
        h += `<text x="${X(tb) + 10}" y="${(V(vavg(a)) + V(vavg(b))) / 2 + 8}" class="tl">${f2(vavg(b) - vavg(a))} m/s</text>`;
        h += `<rect x="${x0 + 14}" y="${y1 - 6}" width="262" height="44" rx="10" class="sbox"/><text x="${x0 + 30}" y="${y1 + 24}" class="sl">기울기 ≈ 9.8 m/s²</text>`;
      } else if (pts.length >= 3) h += `<text x="${x0 + 18}" y="${y1 + 18}" class="hint">눌러서 기울기 읽기</text>`;
      else if (!pts.length) h += `<text x="${(x0 + x1) / 2}" y="${(y0 + y1) / 2 + 8}" text-anchor="middle" class="hint">자로 재면 여기에 점이 찍힌다</text>`;
      pts.forEach((i) => { h += `<circle cx="${X((i - 0.5) * DT)}" cy="${V(vavg(i))}" r="9" class="pt${i === last ? ' new' : ''}"/>`; });
      svg.innerHTML = h;
      gbox.classList.toggle('ready', pts.length >= 3 && !slope);
    }

    function steps() {
      const ok = []; if (ph === 'photo') ok.push(1); if (meas.size >= 3) ok.push(2); if (slope) ok.push(3);
      const st = [1, 2, 3].find((n) => !ok.includes(n)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      now.textContent = st === 1 ? '① 공을 집게까지 끌어 올리기' : st === 2 ? `② 자의 집게를 이웃한 두 공 중심에 (${meas.size}/3)` : st === 3 ? '③ 오른쪽 그래프 누르기' : '✓ 가속도 약 9.8 m/s²';
      now.classList.toggle('done', st === 0);
    }

    function drop() { if (ph !== 'idle' && ph !== 'drag') return; ph = 'hang'; wait = 0; ghosts = []; say('찰칵, 집게에 걸렸다 — 곧 집게가 열린다!'); S.kick(); }
    function snapAll() {
      const g = geo();
      jaws.forEach((J) => { J.snap = -1; ghosts.forEach((cm, i) => { if (Math.abs(g.Y(cm) - g.Y(J.cm)) < 1) J.snap = i; }); });
    }
    function judge() {
      const a = jaws[0].snap, b = jaws[1].snap;
      if (a < 0 || b < 0) { say('집게 끝을 공의 <b>중심</b>에 가까이 가져가면 착 붙는다. 공의 가장자리가 아니라 중심끼리 잰다.'); return; }
      if (a === b) { say('두 집게가 같은 공에 있다. 하나를 바로 아래(또는 위) 공으로 옮기자.'); return; }
      if (Math.abs(a - b) > 1) { say(`공 ${Math.abs(a - b) - 1}개를 건너뛰었다 — 그러면 ${f1(Math.abs(a - b) * DT)}초 동안의 거리다. <b>이웃한</b> 두 공에 맞추자.`); return; }
      record(Math.max(a, b));
    }
    function measure(i) {
      if (ph !== 'photo') { say('먼저 공을 떨어뜨려 <b>섬광 사진</b>을 찍자(엔터).'); return; }
      jaws[0].cm = GHOST[i - 1]; jaws[1].cm = GHOST[i]; calIn = 1; snapAll(); judge();
    }

    // ── 손 조작 ──
    const S = P.make(stage, {
      draw,
      down(p) {
        const g = geo();
        if (ph === 'idle') { const s = rest(g); if (Math.hypot(p.x - s.x, p.y - s.y) < 52) { ph = 'drag'; ball = { x: p.x, y: p.y }; drag = { ball: true }; say('그대로 맨 위 <b>집게</b>까지 끌어 올리자.'); } return; }
        if (ph === 'photo' && calIn >= 1) {
          const x = g.CX, [ia, ib] = order(), ya = g.Y(jaws[ia].cm), yb = g.Y(jaws[ib].cm);
          const hit = (y0, y1) => p.x > x + 34 && p.x < x + 146 && p.y > y0 && p.y < y1;
          let j = hit(ya - 60, ya + 2) ? ia : hit(yb - 2, yb + 60) ? ib : -1;
          if (j < 0 && p.x > g.BX + R && p.x < x + 44) j = Math.abs(p.y - ya) < 14 ? ia : Math.abs(p.y - yb) < 14 ? ib : -1;
          if (j >= 0) drag = { j, dy: g.Y(jaws[j].cm) - p.y };
          return;
        }
        if (slope || meas.size >= 3) return;
        if (ph === 'hang' || ph === 'fall') say('사진을 찍는 중이다. 섬광이 몇 번 터지는지 세어 보자.');
      },
      move(p, e, held) {
        if (!drag) {
          if (ph === 'idle') { const s = rest(geo()); S.cv.classList.toggle('can-grab', Math.hypot(p.x - s.x, p.y - s.y) < 52); }
          return;
        }
        const g = geo();
        if (drag.ball) { ball.x = Math.max(R, Math.min(g.W - R, p.x)); ball.y = Math.max(R, Math.min(g.floor - R, p.y)); return; }
        const J = jaws[drag.j]; let cm = (p.y + drag.dy - g.Y0) / g.k; const lo = drag.j ? jaws[0].cm + 2 : -3, hi = drag.j ? 126 : jaws[1].cm - 2;
        cm = Math.max(lo, Math.min(hi, cm)); J.cm = cm; J.snap = -1;
        let best = -1, bd = 18; ghosts.forEach((gc, i) => { const d = Math.abs(g.Y(gc) - g.Y(cm)); if (d < bd && gc >= lo && gc <= hi) { bd = d; best = i; } });
        if (best >= 0) { J.cm = ghosts[best]; J.snap = best; }
      },
      up() {
        if (!drag) return;
        const g = geo();
        if (drag.ball) {
          drag = null;
          if (Math.hypot(ball.x - g.BX, ball.y - g.Y0) < 60) { drop(); }
          else { ph = 'idle'; say('집게 가까이(노란 점선 원)에 놓아야 걸린다. 다시 끌어 보자.'); }
          return;
        }
        drag = null; judge();
      },
      key(e) {
        if (e.key === 'Enter') { if (ph === 'idle') drop(); else if (ph === 'photo') { if (meas.size >= 3) showSlope(); else say('숫자 키 <b>1~5</b>로 구간을 잴 수 있다.'); } return true; }
        if (/^[1-5]$/.test(e.key)) { measure(+e.key); return true; }
        if (e.key === '0') { reset(); return true; }
        return false;
      },
    });

    gbox.addEventListener('click', () => { if (ph === 'photo') showSlope(); else say('먼저 공을 떨어뜨려 <b>섬광 사진</b>을 찍자.'); S.kick(); });
    gbox.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); gbox.click(); } });
    const zoom = (on) => { photo.classList.toggle('big', on); photo.setAttribute('aria-expanded', String(on)); };
    photo.addEventListener('click', () => zoom(!photo.classList.contains('big')));
    photo.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ' || (e.key === 'Escape' && photo.classList.contains('big'))) { e.preventDefault(); e.stopPropagation(); zoom(e.key === 'Escape' ? false : !photo.classList.contains('big')); } });
    root.querySelector('.sf-reset').addEventListener('click', () => { reset(); zoom(false); S.kick(); });

    reset();
    root._sf = {
      drop: () => { drop(); ph = 'photo'; ghosts = GHOST.slice(); calIn = 1; steps(); S.redraw(); return root._sf.state(); },
      measure: (i) => { measure(i); S.redraw(); return root._sf.state(); },
      slope: () => { showSlope(); return root._sf.state(); },
      state: () => ({ ph, ghosts: ghosts.length, meas: [...meas].sort(), slope, done: root.classList.contains('u-done'), jaws: jaws.map((j) => ({ cm: +f1(j.cm), snap: j.snap })), out: out.textContent }),
      geo: () => { const g = geo(); return { W: g.W, H: g.H, BX: g.BX, CX: g.CX, Y0: g.Y0, k: g.k, rest: rest(g), ghostY: GHOST.map(g.Y) }; },
    };
    return { fit: S.fit, setActive: (on) => { S.setActive(on); if (!on) zoom(false); } };
  }
  window.Strobe = { mount };
})();
