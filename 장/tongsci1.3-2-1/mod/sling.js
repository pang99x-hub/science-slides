/* 3-2 2차시 체험 «줄에 매단 공 돌리기»(참고서 164쪽 원운동 · 교과서 130쪽 그림 Ⅲ-21 인공위성).
   위에서 내려다본 손과 줄에 매단 공. 공을 끌어 원을 그리면 줄이 팽팽해지고, 놓으면 같은 빠르기로 계속 돈다.
   돌 때: 줄이 당기는 힘(빨강, 늘 손 쪽 = 원의 중심)과 운동 방향(파랑, 접선)이 늘 직각(90° 표시). 도는 공을 누르면 잠깐 멈춰 본다.
   줄 끊기: 빈 곳에서 줄을 가로질러 문지르면(가위) 잘리고, 손을 누르면 손이 펴져 놓친다. 공은 그 순간의 운동 방향으로 곧게 날아간다
   (느린 화면 · 바깥으로 튕긴다는 생각은 ✗ 점선으로 함께 보여 준다). 오른쪽 위 작은 그림: 같은 원리의 인공위성(중력 = 줄).
   Sling.mount(root) → { fit, setActive } · 시험용: root._sl.spin(ω) · tap() · cut() · state() */
(function () {
  'use strict';
  const TAU = Math.PI * 2, WMIN = 1.5, WMAX = 6;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  // 선분 ab와 cd가 만나나
  function cross(a, b, c, d) {
    const o = (p, q, r) => (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x);
    return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0;
  }
  // 점 p와 선분 ab 사이 거리
  function segDist(p, a, b) { const dx = b.x - a.x, dy = b.y - a.y, k = clamp(((p.x - a.x) * dx + (p.y - a.y) * dy) / (dx * dx + dy * dy || 1), 0, 1); return Math.hypot(p.x - a.x - dx * k, p.y - a.y - dy * k); }
  console.assert(Math.abs(segDist({ x: 5, y: 3 }, { x: 0, y: 0 }, { x: 10, y: 0 }) - 3) < 1e-9, 'sling: 거리');
  console.assert(cross({ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }) && !cross({ x: 0, y: 1 }, { x: 0, y: 2 }, { x: -1, y: 0 }, { x: 1, y: 0 }), 'sling: 선분 교차');

  function mount(root) {
    const stage = root.querySelector('.sl-stage'), now = root.querySelector('.sl-now'), out = root.querySelector('.sl-out');
    const P = window.Play;
    let th, w, attached, fly, trail, mode, prev, wEst, lastT, moved, freeze, turned, ok, msg, open, t, slow, scis, satA, cutAt, ghosts;
    function reset() {
      th = -0.6; w = 0; attached = true; fly = null; trail = []; mode = null; prev = null; wEst = 0; lastT = 0; moved = 0; freeze = 0; turned = 0;
      ok = new Set(); open = false; t = 0; slow = 0; scis = null; satA = 0; cutAt = null; ghosts = [];
      say('<b>공</b>을 잡고 손 둘레로 <b>원을 그리며</b> 끌었다가 놓아 보자');
      steps();
    }
    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };
    const L = () => { const W = S.W, H = S.H, R = Math.min(W * 0.24, H * 0.33); return { W, H, hx: W * 0.36, hy: H * 0.53, R, ix: W * 0.69, iy: 16, iw: W * 0.31 - 16, ih: Math.min(H * 0.6, W * 0.36) }; };
    const ballAt = (l) => (fly ? { x: fly.x, y: fly.y } : { x: l.hx + Math.cos(th) * l.R, y: l.hy + Math.sin(th) * l.R });
    // 바닥(운동장 모래, 한 번만 그림)
    let floor = null, fW = 0, fH = 0;
    function bakeFloor(W, H) {
      floor = document.createElement('canvas'); floor.width = W; floor.height = H; fW = W; fH = H; const g = floor.getContext('2d');
      const gr = g.createRadialGradient(W * 0.36, H * 0.5, 40, W * 0.4, H * 0.5, W * 0.8); gr.addColorStop(0, '#e9dcbf'); gr.addColorStop(1, '#cdb994'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      let sd = 3; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
      for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${rnd() < 0.5 ? '90,70,40' : '255,250,235'},${0.08 + rnd() * 0.15})`; g.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 2.5, 1 + rnd() * 2.5); }
      for (let i = 0; i < 18; i++) { const x = rnd() * W, y = rnd() * H, r = 3 + rnd() * 6; g.fillStyle = 'rgba(120,105,85,.55)'; g.beginPath(); g.ellipse(x, y, r, r * 0.7, rnd() * 3, 0, TAU); g.fill(); }
    }
    function arrow(c, x, y, dx, dy, len, col, label, mid) {
      const n = Math.hypot(dx, dy) || 1, ux = dx / n, uy = dy / n, ex = x + ux * len, ey = y + uy * len;
      c.save(); c.lineCap = 'round'; c.strokeStyle = '#111'; c.lineWidth = 10; c.beginPath(); c.moveTo(x, y); c.lineTo(ex - ux * 14, ey - uy * 14); c.stroke();
      c.strokeStyle = col; c.lineWidth = 6; c.stroke();
      c.fillStyle = col; c.strokeStyle = '#111'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex - ux * 22 - uy * 12, ey - uy * 22 + ux * 12); c.lineTo(ex - ux * 22 + uy * 12, ey - uy * 22 - ux * 12); c.closePath(); c.fill(); c.stroke();
      if (label) { c.font = '800 20px "IBM Plex Sans KR", sans-serif'; const tw = c.measureText(label).width; const ax = mid ? x + ux * len * 0.5 + uy * 30 : ex + ux * 16, ay = mid ? y + uy * len * 0.5 - ux * 30 : ey + uy * 16, bx = ax - tw / 2 - 8, by = ay - 15; c.fillStyle = col; c.strokeStyle = '#111'; c.lineWidth = 2; c.beginPath(); c.roundRect(bx, by, tw + 16, 30, 15); c.fill(); c.stroke(); P.txt(c, label, bx + tw / 2 + 8, by + 22, '#111', '800 20px'); }
      c.restore();
    }
    function drawHand(c, x, y, a) {
      // 팔(소매)은 아래에서 올라온다
      c.save(); c.translate(x, y);
      c.fillStyle = 'rgba(60,40,20,.22)'; c.beginPath(); c.ellipse(8, 10, 54, 48, 0, 0, TAU); c.fill();
      const sl = c.createLinearGradient(-40, 0, 40, 0); sl.addColorStop(0, '#2c5ea8'); sl.addColorStop(0.5, '#4a82d0'); sl.addColorStop(1, '#2c5ea8');
      c.fillStyle = sl; c.strokeStyle = '#1a2d4f'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-36, 40); c.lineTo(-44, S.H); c.lineTo(44, S.H); c.lineTo(36, 40); c.closePath(); c.fill(); c.stroke();
      const sk = c.createRadialGradient(-10, -12, 6, 0, 0, 50); sk.addColorStop(0, '#ffe0bd'); sk.addColorStop(1, '#d9a476');
      c.fillStyle = sk; c.strokeStyle = '#7a4e2c'; c.lineWidth = 2.5;
      if (!open) {
        c.beginPath(); c.ellipse(0, 6, 40, 42, 0, 0, TAU); c.fill(); c.stroke();
        for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(-27 + i * 18, -30, 10, 12, 0, 0, TAU); c.fill(); c.stroke(); }
        c.beginPath(); c.ellipse(-36, 6, 12, 22, 0.5, 0, TAU); c.fill(); c.stroke();
      } else {
        c.beginPath(); c.ellipse(0, 10, 40, 40, 0, 0, TAU); c.fill(); c.stroke();
        for (let i = 0; i < 4; i++) { c.save(); c.translate(-27 + i * 18, -22); c.rotate((i - 1.5) * 0.12); c.beginPath(); c.roundRect(-8, -52, 16, 56, 8); c.fill(); c.stroke(); c.restore(); }
        c.save(); c.translate(-38, 10); c.rotate(-0.9); c.beginPath(); c.roundRect(-8, -44, 16, 46, 8); c.fill(); c.stroke(); c.restore();
      }
      c.restore();
    }
    function drawBall(c, x, y, r) {
      c.fillStyle = 'rgba(60,40,20,.25)'; c.beginPath(); c.ellipse(x + 10, y + 12, r, r * 0.85, 0, 0, TAU); c.fill();
      const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); g.addColorStop(0, '#ff9a8a'); g.addColorStop(0.5, '#e0362c'); g.addColorStop(1, '#8e1712');
      c.fillStyle = g; c.strokeStyle = '#4a0a06'; c.lineWidth = 2.5; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, r * 0.7, -0.4 + t * 0, 1.2); c.stroke();
    }
    function drawScissors(c, x, y, a, k) {
      c.save(); c.translate(x, y); c.rotate(a); c.scale(k, k); c.lineWidth = 3; c.strokeStyle = '#222';
      c.fillStyle = '#d8dde6'; [-1, 1].forEach((s) => { c.save(); c.rotate(s * 0.28); c.beginPath(); c.moveTo(0, 0); c.lineTo(34, s * -3); c.lineTo(34, s * 3); c.closePath(); c.fill(); c.stroke(); c.restore(); });
      c.fillStyle = '#f2a03d'; [-1, 1].forEach((s) => { c.beginPath(); c.ellipse(-16, s * 10, 10, 7, 0, 0, TAU); c.fill(); c.stroke(); });
      c.fillStyle = '#222'; c.beginPath(); c.arc(0, 0, 3, 0, TAU); c.fill(); c.restore();
    }
    function drawInset(c, l, dt) {
      const { ix, iy, iw, ih } = l, cx = ix + iw / 2, cy = iy + 40 + (ih - 96) / 2, ro = Math.min(iw - 40, ih - 160) / 2, re = ro * 0.5;
      satA += dt * 0.55;
      c.save(); c.fillStyle = '#070b1c'; c.strokeStyle = '#111'; c.lineWidth = 2.5; c.beginPath(); c.roundRect(ix, iy, iw, ih, 14); c.fill(); c.stroke(); c.clip();
      for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(220,230,255,.6)'; c.fillRect(ix + (i * 97) % iw, iy + (i * 53) % ih, 1.6, 1.6); }
      P.glow(c, cx, cy, re * 1.4, 'rgba(110,180,255,.35)');
      const eg = c.createRadialGradient(cx - re * 0.4, cy - re * 0.4, re * 0.1, cx, cy, re); eg.addColorStop(0, '#6fb4ff'); eg.addColorStop(0.6, '#2a6fc0'); eg.addColorStop(1, '#0f2f60');
      c.fillStyle = eg; c.beginPath(); c.arc(cx, cy, re, 0, TAU); c.fill();
      c.fillStyle = 'rgba(90,160,80,.85)'; c.beginPath(); c.ellipse(cx - re * 0.25, cy - re * 0.2, re * 0.35, re * 0.22, 0.5, 0, TAU); c.fill(); c.beginPath(); c.ellipse(cx + re * 0.3, cy + re * 0.3, re * 0.2, re * 0.3, -0.3, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.3)'; c.setLineDash([6, 6]); c.lineWidth = 1.5; c.beginPath(); c.arc(cx, cy, ro, 0, TAU); c.stroke(); c.setLineDash([]);
      const sx = cx + Math.cos(satA) * ro, sy = cy + Math.sin(satA) * ro, tx = -Math.sin(satA), ty = Math.cos(satA);
      if (cutAt) { c.strokeStyle = 'rgba(255,255,255,.55)'; c.setLineDash([5, 6]); c.lineWidth = 2; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + tx * iw, sy + ty * iw); c.stroke(); c.setLineDash([]); }
      arrow(c, sx, sy, cx - sx, cy - sy, ro * 0.62, '#ff6b6b');
      arrow(c, sx, sy, tx, ty, ro * 0.6, '#4dd2ff');
      c.save(); c.translate(sx, sy); c.rotate(satA + Math.PI / 2); c.fillStyle = '#3d6fd8'; c.strokeStyle = '#111'; c.lineWidth = 1.5; c.fillRect(-26, -5, 17, 10); c.strokeRect(-26, -5, 17, 10); c.fillRect(9, -5, 17, 10); c.strokeRect(9, -5, 17, 10);
      c.fillStyle = '#e6c35a'; c.fillRect(-8, -8, 16, 16); c.strokeRect(-8, -8, 16, 16); c.restore();
      P.txt(c, '인공위성도 같은 원리', ix + iw / 2, iy + 28, '#fbfcf9', '800 20px');
      P.txt(c, '줄 대신 중력이 늘 중심 쪽으로', ix + iw / 2, iy + ih - 34, '#ffb3b3', '700 16px');
      P.txt(c, cutAt ? '중력이 없다면 점선 쪽으로 곧게' : '운동 방향과 늘 직각', ix + iw / 2, iy + ih - 12, cutAt ? '#fbfcf9' : '#a8e6ff', '700 16px');
      c.restore();
    }
    function draw(c, W, H, dt) {
      if (!W) return;
      if (!floor || fW !== W || fH !== H) bakeFloor(W, H);
      const l = L(), real = dt; t += dt;
      if (freeze > 0) { freeze = Math.max(0, freeze - real); dt = 0; }
      if (slow > 0) { slow = Math.max(0, slow - real); dt *= 0.3; }
      // 가위를 댄 채 있으면 돌아오는 줄이 걸려 잘린다
      if (mode === 'cut' && scis && attached && moved > 6 && segDist(scis, { x: l.hx, y: l.hy - 30 }, ballAt(l)) < 16) { release(true, { x: scis.x, y: scis.y }); scis = null; mode = null; }
      if (attached && mode !== 'ball' && w) { th += w * dt; turned += Math.abs(w * dt); if (turned >= TAU * 1.5 && !ok.has(1)) { ok.add(1); say('줄을 놓아도 공은 <b>같은 빠르기</b>로 계속 돈다. 빨간 화살표(줄이 당기는 힘)와 파란 화살표(운동 방향)를 보자. <b>도는 공을 누르면</b> 잠깐 멈춰 볼 수 있다'); steps(); } }
      if (fly) {
        fly.x += fly.vx * dt; fly.y += fly.vy * dt; fly.gt += dt;
        if (fly.gt > 0.09) { fly.gt = 0; ghosts.push({ x: fly.x, y: fly.y }); }
        if (fly.x < -80 || fly.x > W + 80 || fly.y < -80 || fly.y > H + 80) { if (!fly.gone) { fly.gone = true; say('공이 떠났다. <b>손을 누르면</b> 새 공을 매단다(또는 «처음부터»)'); } }
      }
      c.drawImage(floor, 0, 0, W, H);
      const b = ballAt(l), turning = attached && (Math.abs(w) > 0 || (mode === 'ball' && Math.abs(wEst) > WMIN));
      // 도는 길(점선 원)
      c.strokeStyle = 'rgba(80,60,40,.35)'; c.setLineDash([10, 10]); c.lineWidth = 2; c.beginPath(); c.arc(l.hx, l.hy, l.R, 0, TAU); c.stroke(); c.setLineDash([]);
      // 끊은 뒤: 맞는 길(접선)과 틀린 생각(바깥으로)
      if (cutAt) {
        const { x, y, ux, uy } = cutAt, rx = x - l.hx, ry = y - l.hy, rn = Math.hypot(rx, ry);
        c.lineWidth = 3; c.setLineDash([12, 10]); c.strokeStyle = 'rgba(30,120,60,.9)'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + ux * 2000, y + uy * 2000); c.stroke();
        c.strokeStyle = 'rgba(190,40,40,.75)'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + rx / rn * 260, y + ry / rn * 260); c.stroke(); c.setLineDash([]);
        ghosts.forEach((g, i) => { c.globalAlpha = 0.18 + 0.5 * i / Math.max(1, ghosts.length); drawBall(c, g.x, g.y, 20); }); c.globalAlpha = 1;
      }
      // 줄과 손
      drawHand(c, l.hx, l.hy, th);
      c.lineCap = 'round';
      if (attached) {
        const slack = !turning && mode !== 'ball';
        c.strokeStyle = '#5a3a1a'; c.lineWidth = 4; c.beginPath(); c.moveTo(l.hx, l.hy - 6);
        if (slack) { const mx = (l.hx + b.x) / 2 + Math.sin(th) * 24, my = (l.hy + b.y) / 2 - Math.cos(th) * 24; c.quadraticCurveTo(mx, my, b.x, b.y); } else c.lineTo(b.x, b.y);
        c.stroke(); c.strokeStyle = '#c9a26b'; c.lineWidth = 2; c.stroke();
        // 줄 위 가위 표시(문질러 자르기)
        if (!scis) drawScissors(c, l.hx + (b.x - l.hx) * 0.55, l.hy + (b.y - l.hy) * 0.55 - 26, 0.15 * Math.sin(t * 3), 0.7);
      } else if (fly) {
        // 손에 남은 줄 토막 · 공에 매달린 토막
        const cx0 = cutAt.hx, cy0 = cutAt.hy;
        c.strokeStyle = '#5a3a1a'; c.lineWidth = 4; if (cutAt.byScissors) { c.beginPath(); c.moveTo(l.hx, l.hy - 6); c.lineTo(cx0, cy0); c.stroke(); }
        const tl = cutAt.byScissors ? cutAt.tail : l.R * 0.85, n = Math.hypot(fly.vx, fly.vy) || 1;
        c.beginPath(); c.moveTo(fly.x, fly.y); c.lineTo(fly.x - fly.vx / n * tl, fly.y - fly.vy / n * tl + Math.sin(t * 9) * 6); c.stroke();
      }
      drawBall(c, b.x, b.y, 24);
      // 화살표(돌 때): 줄이 당기는 힘 · 운동 방향 · 직각 표시
      if (attached && turning) {
        const dir = Math.sign(mode === 'ball' ? wEst : w) || 1, ux = (l.hx - b.x) / l.R, uy = (l.hy - b.y) / l.R, tx = -uy * -dir, ty = ux * -dir;
        const vlen = clamp(Math.abs(mode === 'ball' ? wEst : w) * l.R * 0.22, 70, 180);
        const sq = 18; c.strokeStyle = freeze ? '#ffd84d' : '#111'; c.lineWidth = freeze ? 4 : 2.5; c.beginPath(); c.moveTo(b.x + ux * sq, b.y + uy * sq); c.lineTo(b.x + ux * sq + tx * sq, b.y + uy * sq + ty * sq); c.lineTo(b.x + tx * sq, b.y + ty * sq); c.stroke();
        arrow(c, b.x + ux * 26, b.y + uy * 26, ux, uy, l.R * 0.45, '#ff6b6b', '줄이 당기는 힘', true);
        arrow(c, b.x + tx * 26, b.y + ty * 26, tx, ty, vlen, '#4dd2ff', '운동 방향');
        if (freeze) { c.font = '800 26px "IBM Plex Sans KR", sans-serif'; const x = b.x + (ux + tx) * 46, y = b.y + (uy + ty) * 46; c.fillStyle = '#ffd84d'; c.strokeStyle = '#111'; c.lineWidth = 2; c.beginPath(); c.roundRect(x - 34, y - 20, 68, 38, 10); c.fill(); c.stroke(); P.txt(c, '90°', x, y + 9, '#111', '800 26px'); }
      }
      if (fly && cutAt) { const n = Math.hypot(fly.vx, fly.vy); if (n > 1 && !fly.gone) arrow(c, fly.x + fly.vx / n * 28, fly.y + fly.vy / n * 28, fly.vx, fly.vy, 110, '#4dd2ff', '운동 방향'); }
      if (cutAt) {
        const { x, y } = cutAt, rx = x - l.hx, ry = y - l.hy, rn = Math.hypot(rx, ry) || 1;
        const qx = x + rx / rn * 270, qy = y + ry / rn * 270;
        c.font = '800 20px "IBM Plex Sans KR", sans-serif'; const lab = '바깥으로 튕겨 나간다? ✗', tw = c.measureText(lab).width;
        const bx = clamp(qx - tw / 2 - 8, 8, W - tw - 24), by = clamp(qy - 15, 8, H - 40);
        c.fillStyle = 'rgba(255,235,235,.95)'; c.strokeStyle = '#b02020'; c.lineWidth = 2; c.beginPath(); c.roundRect(bx, by, tw + 16, 30, 8); c.fill(); c.stroke(); P.txt(c, lab, bx + 8 + tw / 2, by + 22, '#b02020', '800 20px');
      }
      if (scis) drawScissors(c, scis.x, scis.y, scis.a, 1);
      const cap = freeze > 0 ? '잠깐 멈춤 — 두 화살표는 늘 직각' : slow > 0 ? '느린 화면' : '';
      if (cap) { c.font = '800 22px "IBM Plex Sans KR", sans-serif'; const tw = c.measureText(cap).width; c.fillStyle = 'rgba(255,251,230,.92)'; c.strokeStyle = '#5a3a1a'; c.lineWidth = 2; c.beginPath(); c.roundRect(16, H - 54, tw + 24, 38, 19); c.fill(); c.stroke(); P.txt(c, cap, 28 + tw / 2, H - 27, '#5a3a1a', '800 22px'); }
      drawInset(c, l, real);
    }
    function steps() {
      const st = [1, 2, 3].find((q) => !ok.has(q)) || 0;
      window.L1.steps(root, st, [...ok]); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 공을 잡고 원을 그리며 끌었다 놓자' : st === 2 ? '② 도는 공을 눌러 두 화살표를 보자' : st === 3 ? '③ 줄을 문질러 자르거나 손을 누르자' : '공은 그 순간의 운동 방향으로 곧게';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    function release(byScissors, at) {
      if (!attached) return;
      const l = L(), b = ballAt(l), dir = Math.sign(w), sp = Math.abs(w) * l.R;
      attached = false; mode = null;
      const ux = -Math.sin(th) * dir, uy = Math.cos(th) * dir;
      fly = { x: b.x, y: b.y, vx: ux * sp, vy: uy * sp, gt: 0, gone: false };
      const cut = at || { x: l.hx + (b.x - l.hx) * 0.5, y: l.hy + (b.y - l.hy) * 0.5 };
      cutAt = { x: b.x, y: b.y, ux: dir ? ux : 0, uy: dir ? uy : 0, byScissors, hx: cut.x, hy: cut.y, tail: Math.hypot(b.x - cut.x, b.y - cut.y) };
      if (!dir) { fly.gone = true; say('멈춰 있던 공은 그 자리에 그대로. 공을 <b>돌리는 중에</b> 끊어야 어디로 가는지 볼 수 있다 — 손을 눌러 다시 매달자'); return; }
      slow = 2.2; ghosts = []; ok.add(3); steps();
      say(`${byScissors ? '줄이 잘리자' : '손을 펴자'} 공은 <b>바깥으로 튕기지 않고</b>, 끊긴 그 순간의 <b>운동 방향(초록 점선, 원의 접선)</b>으로 곧게 날아간다. 당기는 힘이 없어지니 방향을 바꿀 까닭이 없다`);
    }
    function newBall() { attached = true; fly = null; cutAt = null; ghosts = []; open = false; w = 0; turned = 0; th = -0.6; say('새 공을 매달았다. 다시 원을 그리며 돌려 보자'); }
    function tapBall() {
      if (!attached) return;
      if (Math.abs(w) < WMIN) { say('먼저 공을 <b>원을 그리며</b> 끌어 돌린 뒤 놓자'); return; }
      freeze = 3; ok.add(2); steps();
      say('멈춰 보면 <b>줄이 당기는 힘은 늘 원의 중심(손) 쪽</b>, 운동 방향은 원의 접선 쪽 — 둘은 <b>직각</b>이다. 힘이 방향만 바꾸니 빠르기는 그대로. 이제 <b>줄을 끊어</b> 보자');
    }
    const S = P.make(stage, {
      draw,
      down(p) {
        const l = L(), b = ballAt(l); moved = 0; prev = p; scis = null;
        if (attached && Math.hypot(p.x - b.x, p.y - b.y) < 50) { mode = 'ball'; wEst = 0; lastT = performance.now(); freeze = 0; }
        else if (Math.hypot(p.x - l.hx, p.y - (l.hy + 4)) < 56) mode = 'hand';
        else { mode = 'cut'; scis = { x: p.x, y: p.y, a: 0 }; }
      },
      move(p, e, held) {
        if (!held || !mode) return;
        const l = L(); moved += Math.hypot(p.x - prev.x, p.y - prev.y);
        if (mode === 'ball') {
          const a = Math.atan2(p.y - l.hy, p.x - l.hx), nowT = performance.now(), dt = Math.max(8, nowT - lastT) / 1000; lastT = nowT;
          const d = wrap(a - th); th = a; wEst += (clamp(d / dt, -12, 12) - wEst) * 0.35;
        } else if (mode === 'cut') {
          scis = { x: p.x, y: p.y, a: Math.atan2(p.y - prev.y, p.x - prev.x) };
          if (attached && (cross(prev, p, { x: l.hx, y: l.hy }, ballAt(l)) || segDist(p, { x: l.hx, y: l.hy - 30 }, ballAt(l)) < 14)) { release(true, p); scis = null; mode = null; }
        }
        prev = p;
      },
      up() {
        if (mode === 'ball') {
          if (moved < 8) tapBall();
          else if (Math.abs(wEst) > WMIN) { w = Math.sign(wEst) * clamp(Math.abs(wEst), WMIN + 0.5, WMAX); if (!ok.has(1)) say('손을 떼도 공이 계속 돈다! 한 바퀴 반쯤 지켜보자'); }
          else { w = 0; say('조금 더 <b>빠르게, 원을 그리며</b> 끌었다가 놓아 보자'); }
        } else if (mode === 'hand' && moved < 12) {
          if (attached) { open = true; release(false); } else newBall();
        } else if (mode === 'cut' && attached && moved > 20) say('<b>가위</b>로 줄을 가로질러 문질러야 잘린다');
        mode = null; scis = null;
      },
      key(e) {
        const k = e.key;
        if (k === 'ArrowRight' || k === 'ArrowLeft') { if (attached) { w = clamp((w || (k === 'ArrowRight' ? WMIN : -WMIN)) + (k === 'ArrowRight' ? 0.7 : -0.7), -WMAX, WMAX); if (Math.abs(w) < WMIN) w = 0; } return true; }
        if (k === ' ' || k === 'Enter') { tapBall(); return true; }
        if (k === 'c' || k === 'C' || k === 'x' || k === 'X') { release(true); return true; }
        if (k === 'h' || k === 'H') { if (attached) { open = true; release(false); } else newBall(); return true; }
        if (k === '0') { reset(); return true; }
        return false;
      },
    });
    root.querySelector('.sl-reset').addEventListener('click', () => { reset(); S.kick(); });
    reset();
    root._sl = {
      spin(x) { w = x; return w; }, tap: tapBall, cut() { release(true); },
      geo() { const l = L(), b = ballAt(l); return { hx: l.hx, hy: l.hy, R: l.R, bx: b.x, by: b.y, W: S.W, H: S.H }; },
      state: () => ({ w: +w.toFixed(2), attached, ok: [...ok], fly: fly && { vx: Math.round(fly.vx), vy: Math.round(fly.vy) }, cut: cutAt && { ux: +cutAt.ux.toFixed(2), uy: +cutAt.uy.toFixed(2) }, th: +th.toFixed(2) }),
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Sling = { mount };
})();
