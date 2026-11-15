/* 3-2 3차시 체험 «무엇이 더 멈추기 어려울까?»(교과서 133쪽 그림 Ⅲ-23 볼링공 · 그림 Ⅲ-24 물 미끄럼틀·고속 열차 + 참고서 운동량).
   볼링 레인(옆에서 비스듬히 본 모습). 왼쪽 아래 공 받침의 3·5·7 kg 공 가운데 하나를 끌어 레인에 놓고, 공을 뒤로 당겼다 놓으면 당긴 만큼의 속도(1~8 m/s)로 굴러간다.
   레인 끝 «멈추는 판»(용수철 완충)이 공을 세우며 밀리는 깊이 = 운동량에 비례(판 위 눈금이 곧 kg·m/s). 위쪽 막대에 p = m × v.
   핀 자리를 누르면 핀 10개가 서고, 쓰러지는 수는 운동량에 따라 늘어난다(핀은 가벼워 공의 운동량은 거의 그대로라고 본다).
   오른쪽 아래 비교 칸: 혼자 미끄럼틀 / 여럿이 탄 배(같은 빠르기, 질량 다름), 달리는 / 멈춘 고속 열차(운동량 0) 카드를 누른다.
   ① 같은 속도로 질량이 다른 공 ② 같은 공을 다른 속도로 ③ 질량이 다른데 운동량이 같은 두 번(3 kg × 7 m/s = 7 kg × 3 m/s).
   질량·속도·사람·열차 값은 이해를 돕기 위한 예. 화면 속 굴러가는 빠르기는 실제보다 느리다.
   Bowling.mount(root) → { fit, setActive } · 시험용: root._bw.throw(m, v) · pins(on) · card(0~3) · state() · geo() */
(function () {
  'use strict';
  const TAU = Math.PI * 2, VMAX = 8, PMAX = 56;
  const BALL = [
    { m: 3, r: 20, c: ['#bfe9ff', '#2a9fd6', '#145f8f', '#06283d'], ink: '#167ab0', name: '3 kg' },
    { m: 5, r: 24, c: ['#ffc9c2', '#e0443a', '#9c1e18', '#3d0805'], ink: '#c0321f', name: '5 kg' },
    { m: 7, r: 28, c: ['#d9c6ff', '#6a3fc0', '#3b1d7a', '#140833'], ink: '#5a32a8', name: '7 kg' },
  ];
  const CARDS = [
    { k: 'one', name: '혼자 미끄럼틀', m: 50, v: 8, mt: '50 kg' },
    { k: 'boat', name: '여럿이 탄 배', m: 300, v: 8, mt: '300 kg' },
    { k: 'run', name: '달리는 고속 열차', m: 400000, v: 80, mt: '400 t' },
    { k: 'stop', name: '멈춘 고속 열차', m: 400000, v: 0, mt: '400 t' },
  ];
  const pOf = (m, v) => m * v;
  const nPins = (p) => Math.min(10, Math.round(p / 5.5));
  const sep = (n) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  // 자체 확인: 3×7 = 7×3 = 21, 7 kg·8 m/s = 56(눈금 끝)이면 핀 10개, 288 km/h = 80 m/s
  console.assert(pOf(3, 7) === pOf(7, 3) && pOf(7, 8) === PMAX && nPins(56) === 10 && nPins(3) === 1 && 288000 / 3600 === 80, 'bowling: 운동량');

  function mount(root) {
    const stage = root.querySelector('.bw-stage'), chip = root.querySelector('.bw-now'), out = root.querySelector('.bw-out'), tab = root.querySelector('.bw-tab tbody');
    const P = window.Play;
    let ph, cur, v, bx, sp, comp, compMax, hold, pinsOn, pins, recs, drag, card, clock, msg, sel, bg = null, bgKey = '';

    function reset() {
      ph = 'empty'; cur = -1; v = 0; bx = 0; sp = 0; comp = 0; compMax = 0; hold = 0; pinsOn = false; pins = []; recs = []; drag = null; card = -1; clock = 0; msg = ''; sel = 1;
      say('왼쪽 아래 <b>공 받침</b>에서 공 하나를 끌어 <b>레인</b>에 올려놓자.');
      table(); steps();
    }
    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };

    // ── 자리 잡기 ──
    const geo = () => {
      const W = S.W, H = S.H, LY0 = 184, LY1 = 354, CY = (LY0 + LY1) / 2, LX0 = 176, WALL = W - 22, BR = WALL - 118, PK = 14;
      const DMAX = 96, BOT = 384;
      return { W, H, LY0, LY1, CY, LX0, WALL, BR, PK, DMAX, BOT, PX: BR - 230,
        rack: { x: 14, y: BOT + 12, w: 330, h: H - BOT - 24 }, box: { x: 358, y: BOT + 12, w: W - 358 - 14, h: H - BOT - 24 },
        meter: { x: 18, y: 64, w: W - 36, h: 80 } };
    };
    const rackAt = (g, i) => ({ x: g.rack.x + 62 + i * 102, y: g.rack.y + g.rack.h * 0.5 });
    const pinSpots = (g) => { const a = []; [1, 2, 3, 4].forEach((n, r) => { for (let j = 0; j < n; j++) a.push({ x: g.PX + r * 44, y: g.CY + (j - (n - 1) / 2) * 38, r }); }); return a; };
    const cardRects = (g) => { const b = g.box, w = (b.w - 24 - 3 * 8) / 4; return CARDS.map((_, i) => ({ x: b.x + 12 + i * (w + 8), y: b.y + 36, w, h: 62 })); };

    // ── 그림 도구 ──
    function ball(c, x, y, i, rot = 0, a = 1) {
      const B = BALL[i], R = B.r; c.save(); c.globalAlpha = a;
      c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(x + 3, y + R * 0.92, R * 0.95, R * 0.22, 0, 0, TAU); c.fill();
      const g = c.createRadialGradient(x - R * 0.4, y - R * 0.45, R * 0.08, x, y, R);
      g.addColorStop(0, B.c[0]); g.addColorStop(0.35, B.c[1]); g.addColorStop(0.8, B.c[2]); g.addColorStop(1, B.c[3]);
      c.fillStyle = g; c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill();
      c.save(); c.beginPath(); c.arc(x, y, R, 0, TAU); c.clip();
      c.strokeStyle = 'rgba(255,255,255,.14)'; c.lineWidth = 3; c.beginPath(); c.arc(x + R * 0.3, y + R * 0.2, R * 0.9, 3.3, 4.4); c.stroke();
      [0, 0.5, -0.45].forEach((d, k) => { const ang = rot + d, s = Math.sin(ang), cz = Math.cos(ang); if (cz < 0.05) return; const hx = x + R * 0.62 * s, hy = y - R * (k ? 0.18 : 0.42); c.fillStyle = `rgba(5,5,12,${0.55 + 0.4 * cz})`; c.beginPath(); c.ellipse(hx, hy, R * 0.13 * cz, R * 0.14, 0, 0, TAU); c.fill(); });
      c.restore();
      c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(x - R * 0.42, y - R * 0.48, R * 0.26, R * 0.12, -0.6, 0, TAU); c.fill();
      c.restore();
    }
    function pin(c, x, y, ang = 0, a = 1) { // (x, y) = 밑동
      c.save(); c.globalAlpha = a; c.translate(x, y); c.rotate(ang); c.scale(1.3, 1.3);
      if (!ang) { c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(2, 0, 9, 3, 0, 0, TAU); c.fill(); }
      const g = c.createLinearGradient(-8, 0, 8, 0); g.addColorStop(0, '#d9d6cf'); g.addColorStop(0.45, '#ffffff'); g.addColorStop(1, '#bdb8ae');
      c.fillStyle = g; c.strokeStyle = 'rgba(70,60,50,.55)'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(-4, 0); c.bezierCurveTo(-10, -10, -9, -22, -4, -28); c.bezierCurveTo(-2.5, -31, -3.5, -35, -4.5, -38); c.arc(0, -40, 4.6, Math.PI * 0.82, Math.PI * 0.18, false);
      c.bezierCurveTo(3.5, -35, 2.5, -31, 4, -28); c.bezierCurveTo(9, -22, 10, -10, 4, 0); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#c8281e'; c.fillRect(-3.6, -31.5, 7.2, 1.8); c.fillRect(-3.2, -29, 6.4, 1.6);
      c.restore();
    }
    function pill(c, x, y, s, bgc, fg = '#fff', f = '700 16px', al = 'center') {
      c.font = `${f} "IBM Plex Sans KR", sans-serif`; const w = c.measureText(s).width + 16, x0 = al === 'left' ? x : al === 'right' ? x - w : x - w / 2;
      c.fillStyle = bgc; c.beginPath(); c.roundRect(x0, y - 16, w, 26, 13); c.fill();
      P.txt(c, s, x0 + w / 2, y + 3, fg, f);
      return w;
    }
    function arrow(c, x0, y, x1, col, w = 8) {
      const d = Math.sign(x1 - x0) || 1, L = Math.abs(x1 - x0); if (L < 4) return;
      const hl = Math.min(18, L * 0.6);
      c.fillStyle = col; c.beginPath(); c.moveTo(x0, y - w / 2); c.lineTo(x1 - d * hl, y - w / 2); c.lineTo(x1 - d * hl, y - w * 1.3); c.lineTo(x1, y); c.lineTo(x1 - d * hl, y + w * 1.3); c.lineTo(x1 - d * hl, y + w / 2); c.lineTo(x0, y + w / 2); c.closePath(); c.fill();
    }

    function paintBg(g) {
      const { W, H, LY0, LY1, LX0, WALL, BR, BOT } = g;
      const k2 = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const cv = document.createElement('canvas'); cv.width = W * k2; cv.height = H * k2;
      const c = cv.getContext('2d'); c.setTransform(k2, 0, 0, k2, 0, 0);
      // 볼링장 벽(어두운 남색 + 조명)
      const wall = c.createLinearGradient(0, 0, 0, LY0); wall.addColorStop(0, '#141a2e'); wall.addColorStop(1, '#2a3354'); c.fillStyle = wall; c.fillRect(0, 0, W, LY0);
      for (let x = 60; x < W; x += 160) P.glow(c, x, 0, 90, 'rgba(255,214,140,.22)');
      // 바닥 카펫
      const fl = c.createLinearGradient(0, LY1, 0, H); fl.addColorStop(0, '#3b2a4a'); fl.addColorStop(1, '#22172d'); c.fillStyle = fl; c.fillRect(0, LY1, W, H - LY1);
      for (let i = 0; i < 220; i++) { c.fillStyle = ['rgba(255,200,80,.18)', 'rgba(90,200,255,.16)', 'rgba(255,110,160,.15)'][i % 3]; const x = ((i * 397) % 1009) / 1009 * W, y = LY1 + 30 + ((i * 211) % 997) / 997 * (H - LY1 - 30); c.beginPath(); c.arc(x, y, 2 + (i % 3), 0, TAU); c.fill(); }
      // 홈통(위·아래)과 레인 바닥(나뭇결)
      const gut = (y0, y1) => { const gg = c.createLinearGradient(0, y0, 0, y1); gg.addColorStop(0, '#2b2f38'); gg.addColorStop(0.5, '#5a606c'); gg.addColorStop(1, '#2b2f38'); c.fillStyle = gg; c.fillRect(LX0 - 130, y0, BR - LX0 + 130, y1 - y0); };
      gut(LY0 - 16, LY0); gut(LY1, LY1 + 16);
      const wood = c.createLinearGradient(0, LY0, 0, LY1); wood.addColorStop(0, '#c9945a'); wood.addColorStop(0.5, '#e7b979'); wood.addColorStop(1, '#b98549'); c.fillStyle = wood; c.fillRect(LX0 - 130, LY0, BR - LX0 + 130, LY1 - LY0);
      for (let y = LY0 + 6; y < LY1; y += 7.5) { c.strokeStyle = 'rgba(110,64,24,.28)'; c.lineWidth = 1; c.beginPath(); c.moveTo(LX0 - 130, y); c.lineTo(BR, y); c.stroke(); }
      for (let i = 0; i < 70; i++) { const x = LX0 - 120 + ((i * 397) % 1009) / 1009 * (BR - LX0 + 110), y = LY0 + 4 + ((i * 211) % 997) / 997 * (LY1 - LY0 - 8); c.strokeStyle = 'rgba(120,70,30,.18)'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 40, y + 0.5); c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,.16)'; c.fillRect(LX0 - 130, LY0, BR - LX0 + 130, 10);
      // 파울 선 · 던지는 자리 · 화살표 표지
      c.fillStyle = '#1d2433'; c.fillRect(LX0 - 2, LY0, 4, LY1 - LY0);
      c.fillStyle = 'rgba(29,36,51,.5)'; [-2, -1, 0, 1, 2].forEach((j) => { const x = LX0 + 150 + Math.abs(j) * 14, y = g.CY + j * 22; c.beginPath(); c.moveTo(x - 9, y); c.lineTo(x + 5, y - 6); c.lineTo(x + 5, y + 6); c.closePath(); c.fill(); });
      P.txt(c, '던지는 자리', LX0 - 64, LY1 - 10, 'rgba(29,36,51,.75)', '700 14px');
      // 멈추는 판 뒤 벽과 용수철 자리
      const bw = c.createLinearGradient(BR, 0, WALL + 22, 0); bw.addColorStop(0, '#20263a'); bw.addColorStop(1, '#0d1120'); c.fillStyle = bw; c.fillRect(BR, LY0 - 16, WALL - BR + 22, LY1 - LY0 + 32);
      c.fillStyle = '#7c8291'; c.fillRect(WALL, LY0 - 16, 8, LY1 - LY0 + 32);
      // 아래 칸 바탕
      [g.rack, g.box].forEach((r) => { c.fillStyle = 'rgba(255,255,255,.93)'; c.beginPath(); c.roundRect(r.x, r.y, r.w, r.h, 12); c.fill(); c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.stroke(); });
      P.txt(c, '공 받침 · 끌어서 레인에', g.rack.x + 14, g.rack.y + 26, '#1d2433', '800 18px', 'left');
      // 받침대(나무 + 홈)
      const rk = g.rack, ry = rackAt(g, 0).y + 22;
      const rw = c.createLinearGradient(0, ry, 0, ry + 26); rw.addColorStop(0, '#a8743f'); rw.addColorStop(1, '#6a4320'); c.fillStyle = rw; c.beginPath(); c.roundRect(rk.x + 14, ry, rk.w - 28, 26, 6); c.fill();
      [0, 1, 2].forEach((i) => { const p = rackAt(g, i); c.fillStyle = 'rgba(40,24,10,.55)'; c.beginPath(); c.ellipse(p.x, ry + 3, 24, 6, 0, 0, TAU); c.fill(); });
      P.txt(c, '비교 카드 · 눌러 보기', g.box.x + 14, g.box.y + 26, '#1d2433', '800 18px', 'left');
      return cv;
    }

    // 비교 칸의 작은 그림
    function scene(c, k, x, y, w, h) {
      c.save(); c.beginPath(); c.roundRect(x, y, w, h, 8); c.clip();
      if (k === 'one' || k === 'boat') {
        const sky = c.createLinearGradient(0, y, 0, y + h); sky.addColorStop(0, '#9fd8f7'); sky.addColorStop(1, '#e8f7ff'); c.fillStyle = sky; c.fillRect(x, y, w, h);
        c.fillStyle = '#6fbf6a'; c.fillRect(x, y + h - 14, w, 14);
        // 미끄럼틀(파란 홈) — 위에서 오른쪽 아래로
        c.lineCap = 'round'; c.strokeStyle = '#1f6fb8'; c.lineWidth = 26; c.beginPath(); c.moveTo(x + 6, y + 18); c.bezierCurveTo(x + w * 0.45, y + 20, x + w * 0.5, y + h - 30, x + w - 6, y + h - 26); c.stroke();
        c.strokeStyle = '#7cc8ff'; c.lineWidth = 16; c.stroke(); c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 3; c.setLineDash([8, 10]); c.lineDashOffset = -clock * 60; c.stroke(); c.setLineDash([]); c.lineCap = 'butt';
        const t = 0.62, px = x + w * t, py = y + 18 + (h - 44) * Math.pow(t, 1.4);
        if (k === 'one') { c.fillStyle = '#ffd25a'; c.beginPath(); c.ellipse(px, py, 16, 6, 0.35, 0, TAU); c.fill(); person(c, px, py - 6, '#e8483a'); }
        else { c.save(); c.translate(px - 10, py); c.rotate(0.35); const bg2 = c.createLinearGradient(0, -12, 0, 10); bg2.addColorStop(0, '#ffb13b'); bg2.addColorStop(1, '#d9761e'); c.fillStyle = bg2; c.beginPath(); c.moveTo(-40, -8); c.lineTo(40, -8); c.quadraticCurveTo(46, 6, 34, 10); c.lineTo(-34, 10); c.quadraticCurveTo(-46, 6, -40, -8); c.fill(); c.strokeStyle = '#7a3e0a'; c.lineWidth = 1.5; c.stroke();
          ['#e8483a', '#2a9fd6', '#43b04a', '#6a3fc0'].forEach((col, j) => person(c, -27 + j * 18, -8, col)); c.restore(); }
      } else {
        const sky = c.createLinearGradient(0, y, 0, y + h); sky.addColorStop(0, '#cfe6f5'); sky.addColorStop(1, '#f4f8fb'); c.fillStyle = sky; c.fillRect(x, y, w, h);
        c.fillStyle = '#8a8f98'; c.fillRect(x, y + h - 22, w, 22); c.fillStyle = '#5b5f66'; c.fillRect(x, y + h - 22, w, 4);
        for (let i = 0; i < 12; i++) { c.fillStyle = '#6b4a2b'; c.fillRect(x + ((i * 40 - (k === 'run' ? clock * 160 : 0)) % (w + 40) + w + 40) % (w + 40) - 20, y + h - 14, 22, 4); }
        if (k === 'stop') { c.fillStyle = '#b9bec6'; c.fillRect(x, y + h - 40, w, 18); c.fillStyle = '#ffd84d'; c.fillRect(x, y + h - 40, w, 3); }
        const tx = x + 14, ty = y + h - 62, tw = w - 28;
        const tb = c.createLinearGradient(0, ty, 0, ty + 40); tb.addColorStop(0, '#ffffff'); tb.addColorStop(0.7, '#dfe4ea'); tb.addColorStop(1, '#9aa3ad'); c.fillStyle = tb;
        c.beginPath(); c.moveTo(tx, ty + 6); c.lineTo(tx + tw - 70, ty + 6); c.bezierCurveTo(tx + tw - 20, ty + 6, tx + tw, ty + 26, tx + tw, ty + 40); c.lineTo(tx, ty + 40); c.closePath(); c.fill(); c.strokeStyle = '#4b5563'; c.lineWidth = 1.5; c.stroke();
        c.fillStyle = '#1f4f9a'; c.fillRect(tx, ty + 28, tw - 8, 5);
        for (let j = 0; j < 6; j++) { c.fillStyle = '#2b3a55'; c.beginPath(); c.roundRect(tx + 10 + j * ((tw - 110) / 6), ty + 12, (tw - 130) / 6, 9, 3); c.fill(); }
        c.fillStyle = '#2b3a55'; c.beginPath(); c.moveTo(tx + tw - 66, ty + 11); c.lineTo(tx + tw - 36, ty + 11); c.lineTo(tx + tw - 24, ty + 22); c.lineTo(tx + tw - 66, ty + 22); c.closePath(); c.fill();
        if (k === 'run') for (let j = 0; j < 4; j++) { c.strokeStyle = 'rgba(29,36,51,.35)'; c.lineWidth = 2; const sx = x + 4 + ((clock * 90 + j * 23) % 30); c.beginPath(); c.moveTo(sx, ty + 10 + j * 8); c.lineTo(sx - 26, ty + 10 + j * 8); c.stroke(); }
        if (k === 'stop') pill(c, x + w / 2, y + 22, '정지 · 속도 0', 'rgba(29,36,51,.85)', '#fff', '700 14px');
      }
      c.restore();
    }
    function person(c, x, y, col) {
      c.fillStyle = col; c.beginPath(); c.roundRect(x - 5, y - 14, 10, 14, 4); c.fill();
      c.fillStyle = '#f1c7a0'; c.beginPath(); c.arc(x, y - 19, 5.5, 0, TAU); c.fill(); c.fillStyle = '#3a2a1d'; c.beginPath(); c.arc(x, y - 21, 5.5, Math.PI, TAU); c.fill();
    }

    function draw(c, W, H, dt) {
      if (!W) return;
      const g = geo(); clock += dt;
      const key = W + 'x' + H; if (key !== bgKey) { bg = paintBg(g); bgKey = key; }
      c.clearRect(0, 0, W, H); c.drawImage(bg, 0, 0, W, H);
      step(g, dt);
      const { LY0, LY1, CY, LX0, WALL, BR, DMAX, PK } = g;

      // 운동량 막대(위)
      const M = g.meter, bx0 = M.x + 14, bx1 = M.x + M.w - 14, sc = (bx1 - bx0) / PMAX;
      c.fillStyle = 'rgba(255,255,255,.95)'; c.beginPath(); c.roundRect(M.x, M.y, M.w, M.h, 12); c.fill(); c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.stroke();
      const showV = ph === 'aim' ? v : (ph === 'roll' || ph === 'stop' || ph === 'back') ? v : 0, mm = cur >= 0 ? BALL[cur].m : 0, pp = pOf(mm, showV);
      for (let q = 0; q <= PMAX; q += 2) { const x = bx0 + q * sc; c.strokeStyle = 'rgba(29,36,51,.45)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x, M.y + M.h - 22); c.lineTo(x, M.y + M.h - (q % 10 ? 16 : 10)); c.stroke(); if (q % 10 === 0) P.txt(c, String(q), x, M.y + M.h - 26, '#59607a', '600 12px'); }
      recs.slice(0, 6).forEach((r) => { const x = bx0 + r.p * sc; c.fillStyle = BALL[r.i].c[1]; c.beginPath(); c.moveTo(x, M.y + M.h - 8); c.lineTo(x - 6, M.y + M.h); c.lineTo(x + 6, M.y + M.h); c.closePath(); c.fill(); });
      if (cur >= 0) {
        if (pp > 0) arrow(c, bx0, M.y + 52, bx0 + pp * sc, BALL[cur].c[1], 14);
        const eq = pp > 0 ? `운동량 p = m × v = ${mm} kg × ${showV} m/s = ${pp} kg·m/s →` : `운동량 p = m × v = ${mm} kg × 0 m/s = 0 · 뒤로 당겨 속도를 정하자`;
        P.txt(c, eq, M.x + 14, M.y + 26, '#1d2433', '800 19px', 'left');
      } else P.txt(c, '운동량 p = 질량 m × 속도 v  (단위 kg·m/s · 방향은 속도와 같다)', M.x + 14, M.y + 26, '#1d2433', '800 19px', 'left');
      P.txt(c, 'kg·m/s', M.x + M.w - 14, M.y + 26, '#59607a', '700 14px', 'right');

      // 멈추는 판 + 용수철 + 눈금(운동량)
      const bxp = BR + comp, sTop = LY0 - 8, sBot = LY1 + 8;
      [0.25, 0.5, 0.75].forEach((f) => { const y = LY0 + (LY1 - LY0) * f, n = 7; c.strokeStyle = '#c9ced5'; c.lineWidth = 3; c.beginPath(); c.moveTo(bxp + 14, y); for (let s = 1; s <= n; s++) c.lineTo(bxp + 14 + (WALL - bxp - 14) * s / n, y + (s % 2 ? -9 : 9) * (s === n ? 0 : 1)); c.stroke(); });
      const pg = c.createLinearGradient(bxp, 0, bxp + 14, 0); pg.addColorStop(0, '#ffd23a'); pg.addColorStop(1, '#c48a00'); c.fillStyle = pg; c.fillRect(bxp, sTop, 14, sBot - sTop); c.strokeStyle = '#3a2a00'; c.lineWidth = 1.5; c.strokeRect(bxp, sTop, 14, sBot - sTop);
      c.fillStyle = '#1d2433'; c.fillRect(BR, sBot + 4, DMAX + 14, 4);
      for (let q = 0; q <= PMAX; q += 10) { const x = BR + 7 + q / PMAX * DMAX; c.fillRect(x - 1, sBot + 8, 2, 7); }
      if (recs[0]) pill(c, WALL + 18, sTop - 14, `멈추는 판 · 눈금 ${recs[0].p} kg·m/s까지 밀림`, 'rgba(255,216,77,.95)', '#1d2433', '800 14px', 'right');
      else P.txt(c, '멈추는 판', BR + 40, sTop - 12, '#ffd84d', '800 15px');
      recs.slice(0, 6).forEach((r, j) => { const x = BR + 7 + r.p / PMAX * DMAX; c.globalAlpha = j ? 0.45 : 1; c.fillStyle = BALL[r.i].c[1]; c.beginPath(); c.moveTo(x, sBot + 16); c.lineTo(x - 6, sBot + 26); c.lineTo(x + 6, sBot + 26); c.closePath(); c.fill(); c.globalAlpha = 1; });

      // 핀
      if (pinsOn) {
        pins.filter((q) => !q.down).sort((a, b) => a.y - b.y).forEach((q) => pin(c, q.x, q.y + 14));
        pins.filter((q) => q.down).forEach((q) => { pin(c, q.x, q.y + 14, q.a, q.alpha); });
      } else if (ph !== 'roll') {
        c.save(); c.setLineDash([5, 5]); c.lineDashOffset = -clock * 12; c.strokeStyle = 'rgba(29,36,51,.55)'; c.lineWidth = 2; c.beginPath(); c.roundRect(g.PX - 26, LY0 + 8, 180, LY1 - LY0 - 16, 10); c.stroke(); c.restore();
        pinSpots(g).forEach((q) => { c.fillStyle = 'rgba(29,36,51,.25)'; c.beginPath(); c.arc(q.x, q.y + 12, 4, 0, TAU); c.fill(); });
        P.txt(c, '눌러서 핀 세우기', g.PX + 64, LY0 + 28, 'rgba(29,36,51,.75)', '700 14px');
      }

      // 레인 위 공
      if (cur >= 0 && ph !== 'empty' && ph !== 'carry') {
        const R = BALL[cur].r;
        if (ph === 'aim') {
          const pull = v * PK, x = LX0 - 10 - pull;
          if (v > 0) { arrow(c, LX0 + 6, CY - R - 22, LX0 + 6 + v * 26, '#ffd84d', 7); pill(c, LX0 + 30 + v * 13, CY - R - 46, `${v} m/s`, BALL[cur].ink, '#fff', '800 16px'); }
          c.strokeStyle = 'rgba(29,36,51,.5)'; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(x, CY); c.lineTo(LX0 - 10, CY); c.stroke(); c.setLineDash([]);
          ball(c, x, CY, cur, -pull / R);
          if (!drag) { c.save(); c.setLineDash([6, 5]); c.lineDashOffset = -clock * 16; c.strokeStyle = '#ffd84d'; c.lineWidth = 3; c.beginPath(); c.arc(x, CY, R + 7 + Math.sin(clock * 3) * 2, 0, TAU); c.stroke(); c.restore(); if (!v) hand(c, x - R - 40 - Math.abs(Math.sin(clock * 2.4)) * 16, CY); }
        } else ball(c, bx, CY, cur, (bx - LX0) / R, ph === 'back' ? Math.max(0, 1 - hold) : 1);
      }

      // 공 받침
      [0, 1, 2].forEach((i) => {
        const p = rackAt(g, i); if (i === cur && ph !== 'empty') { c.strokeStyle = 'rgba(29,36,51,.3)'; c.setLineDash([4, 4]); c.beginPath(); c.arc(p.x, p.y, BALL[i].r, 0, TAU); c.stroke(); c.setLineDash([]); }
        else ball(c, p.x, p.y + (2 - BALL[i].r / 10.5) + Math.sin(clock * 2 + i) * 0.6, i);
        P.txt(c, BALL[i].name, p.x, g.rack.y + g.rack.h - 12, BALL[i].ink, '800 18px');
      });
      if (ph === 'empty' && !recs.length) hand(c, rackAt(g, 1).x, rackAt(g, 1).y - 34 - Math.abs(Math.sin(clock * 2.4)) * 10, -Math.PI / 2);
      if (ph === 'carry' && drag) { ball(c, drag.x, drag.y, cur); const over = drag.y > LY0 - 30 && drag.y < LY1 + 30 && drag.x < BR - 40; c.save(); c.setLineDash([6, 5]); c.strokeStyle = over ? '#2fbf6a' : 'rgba(255,255,255,.6)'; c.lineWidth = 3; c.beginPath(); c.arc(LX0 - 10, CY, BALL[cur].r + 6, 0, TAU); c.stroke(); c.restore(); }

      // 비교 칸
      const cr = cardRects(g), b = g.box;
      cr.forEach((r, i) => {
        const on = i === card, C = CARDS[i];
        c.fillStyle = on ? '#fff3b0' : '#f2f4f8'; c.beginPath(); c.roundRect(r.x, r.y, r.w, r.h, 10); c.fill(); c.strokeStyle = on ? '#1d2433' : '#9aa1b2'; c.lineWidth = on ? 3 : 1.5; c.stroke();
        P.txt(c, C.name, r.x + r.w / 2, r.y + 26, '#1d2433', '800 16px');
        P.txt(c, `${C.mt} · ${C.v ? C.v + ' m/s' : '0 m/s'}`, r.x + r.w / 2, r.y + 49, '#59607a', '600 14px');
      });
      if (card < 0) {
        c.save(); c.setLineDash([6, 5]); c.lineDashOffset = -clock * 16; c.strokeStyle = '#e8b923'; c.lineWidth = 2.5; c.beginPath(); c.roundRect(cr[0].x - 4, cr[0].y - 4, cr[3].x + cr[3].w - cr[0].x + 8, cr[0].h + 8, 12); c.stroke(); c.restore();
        P.txt(c, '같은 빠르기라면 누가 더 멈추기 어려울까? 카드를 눌러 보자.', b.x + b.w / 2, b.y + 140, '#59607a', '600 16px');
      } else {
        const pair = card < 2 ? [0, 1] : [2, 3], sy = b.y + 108, sh = b.h - 120, sw = 200;
        scene(c, CARDS[card].k, b.x + 12, sy, sw, sh);
        const ps = pair.map((i) => pOf(CARDS[i].m, CARDS[i].v)), mx = Math.max(...ps), x0 = b.x + 24 + sw, x1 = b.x + b.w - 16;
        pair.forEach((i, j) => {
          const y = sy + 16 + j * 54, on = i === card, w = mx ? (x1 - x0) * ps[j] / mx : 0;
          P.txt(c, CARDS[i].name, x0, y, on ? '#1d2433' : '#59607a', on ? '800 16px' : '700 15px', 'left');
          c.fillStyle = '#e6e9ef'; c.fillRect(x0, y + 8, x1 - x0, 16);
          if (w > 0) { c.fillStyle = on ? '#e8483a' : '#9aa1b2'; c.fillRect(x0, y + 8, w * Math.min(1, (clock - (scene.t || 0)) * 2.2), 16); }
          P.txt(c, ps[j] ? `${sep(ps[j])} kg·m/s` : '0 kg·m/s', x1, y, on ? '#c0321f' : '#59607a', '800 15px', 'right');
        });
        const C = CARDS[card];
        P.txt(c, `${C.mt === '400 t' ? '400 000 kg' : C.mt} × ${C.v} m/s = ${sep(pOf(C.m, C.v))} kg·m/s`, x0, sy + sh - 8, '#1d2433', '700 15px', 'left');
      }
    }
    // 안내 손가락(기본: 오른쪽을 가리킴)
    function hand(c, x, y, rot = 0) {
      c.save(); c.translate(x, y); c.rotate(rot + Math.PI / 2); c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 5;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(14, 18); c.lineTo(5, 18); c.lineTo(5, 36); c.lineTo(-5, 36); c.lineTo(-5, 18); c.lineTo(-14, 18); c.closePath();
      c.fillStyle = '#ffd84d'; c.fill(); c.shadowBlur = 0; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.stroke(); c.restore();
    }

    // ── 움직임 ──
    function step(g, dt) {
      if (pinsOn) pins.forEach((q) => { if (!q.down || q.rest) return; q.x += q.vx * dt; q.y += q.vy * dt; q.a += q.va * dt; q.vx *= 0.97; q.vy *= 0.97; q.va *= 0.96; if (Math.abs(q.a) > 1.45) { q.a = Math.sign(q.a) * 1.5; q.va = 0; } if (q.x > g.BR - 14) { q.x = g.BR - 14; q.vx = -q.vx * 0.3; } q.y = Math.max(g.LY0 + 6, Math.min(g.LY1 - 24, q.y)); if (Math.hypot(q.vx, q.vy) < 4) q.rest = true; });
      if (ph === 'roll') {
        const R = BALL[cur].r, front = bx + R;
        if (pinsOn && !pins.hit && front >= g.PX - 8) knock(g);
        bx += sp * dt;
        const D = pOf(BALL[cur].m, v) / PMAX * g.DMAX;
        if (!hold && front >= g.BR) hold = sp * sp / (2 * Math.max(4, D)); // 판에 닿음: 깊이 D에서 멈추도록 고르게 느려진다(hold = 감속도)
        if (hold) { sp = Math.max(0, sp - hold * dt); comp = Math.min(D, bx + R - g.BR); if (sp <= 0.5 || comp >= D) { comp = D; compMax = D; bx = g.BR + D - R; ph = 'stop'; hold = 0; landed(); } }
      } else if (ph === 'stop') { hold += dt; if (hold > 0.8) { ph = 'back'; hold = 0; } }
      else if (ph === 'back') { comp = Math.max(0, comp - 220 * dt); bx = g.BR + comp - BALL[cur].r - 2; hold += dt * 0.9; if (hold >= 1) { ph = 'empty'; cur = -1; comp = 0; } }
    }
    function knock(g) {
      pins.hit = true; const n = nPins(pOf(BALL[cur].m, v));
      const order = pins.map((q, i) => i).sort((a, b) => (pins[a].r + Math.abs(pins[a].y - g.CY) / 30) - (pins[b].r + Math.abs(pins[b].y - g.CY) / 30));
      order.slice(0, n).forEach((i, k) => { const q = pins[i], side = Math.sign(q.y - g.CY) || (k % 2 ? 1 : -1); q.down = true; q.vx = 60 + v * 22; q.vy = side * (40 + v * 10); q.va = (side > 0 ? 1 : -1) * (5 + v); q.alpha = 1; });
      pins.n = n;
    }
    function setPins(on) {
      if (ph === 'roll') return;
      const g = geo(); pinsOn = on; pins = on ? pinSpots(g).map((q) => ({ ...q, down: false, a: 0 })) : [];
      if (on) say('핀 10개를 세웠다. 운동량이 클수록 많이 쓰러질까? 공을 굴려 보자.');
    }

    // ── 조작 ──
    function place(i) { if (ph === 'roll' || ph === 'stop') return; cur = i; ph = 'aim'; v = 0; sel = i; if (pinsOn && pins.hit) setPins(true); say(`<b>${BALL[i].m} kg</b> 공을 올렸다. 공을 잡고 <b>뒤로 당겼다 놓자</b>(많이 당길수록 빠르다).`); }
    function setV(s) { v = Math.max(0, Math.min(VMAX, Math.round(s))); }
    function roll() {
      if (ph !== 'aim' || v < 1) { if (ph === 'aim') say('조금 더 <b>뒤로</b> 당겨야 굴러간다.'); return; }
      const g = geo(); ph = 'roll'; bx = g.LX0 - 10; sp = 60 + v * 60; comp = 0; hold = 0;
      say(`<b>${BALL[cur].m} kg × ${v} m/s</b>로 굴러간다. 멈추는 판이 얼마나 밀릴까?`);
      try { if (navigator.vibrate) navigator.vibrate(12); } catch { /* 지원 안 함 */ }
    }
    function landed() {
      const m = BALL[cur].m, p = pOf(m, v), r = { i: cur, m, v, p, n: pinsOn ? pins.n : null };
      const prev = recs[0]; recs.unshift(r); if (recs.length > 12) recs.pop();
      let cmp = '';
      if (prev) {
        if (prev.v === v && prev.m !== m) cmp = ` 속도는 같고 질량이 ${prev.m} → ${m} kg: 운동량도 <b>${prev.p} → ${p}</b>. 무거울수록 멈추기 어렵다.`;
        else if (prev.m === m && prev.v !== v) cmp = ` 같은 공인데 ${prev.v} → ${v} m/s: 운동량 <b>${prev.p} → ${p}</b>. 빠를수록 멈추기 어렵다.`;
        else if (prev.p === p && prev.m !== m) cmp = ` ${prev.m} kg × ${prev.v} m/s와 <b>운동량이 같다</b> — 판도 같은 깊이만큼 밀렸다!`;
      }
      say(`<b>p = ${m} × ${v} = ${p} kg·m/s</b>. 판이 눈금 ${p}까지 밀렸다.` + (r.n != null ? ` 핀 ${r.n}개가 쓰러졌다.` : '') + cmp);
      table(); steps();
    }
    function pick(i) { card = i; scene.t = clock; const C = CARDS[i];
      say([
        '혼자 탄 사람 50 kg × 8 m/s = <b>400 kg·m/s</b>. 여럿이 탄 배와 빠르기는 같다.',
        '배와 네 사람을 합쳐 300 kg × 8 m/s = <b>2 400 kg·m/s</b>. 빠르기가 같아도 <b>질량이 커서</b> 운동량이 크다.',
        '400 000 kg × 80 m/s(288 km/h) = <b>32 000 000 kg·m/s</b>. 질량도 크고 빠르기도 빨라 멈추기가 매우 어렵다.',
        '질량은 400 000 kg으로 그대로지만 속도가 0 → 운동량 <b>0</b>. 질량이 커서 관성은 크지만, 운동량은 0이다.',
      ][i]); steps(); void C; }
    function pairs(f) { for (let a = 0; a < recs.length; a++) for (let b = a + 1; b < recs.length; b++) if (f(recs[a], recs[b])) return [a, b]; return null; }
    const s1 = () => pairs((a, b) => a.v === b.v && a.m !== b.m), s2 = () => pairs((a, b) => a.m === b.m && a.v !== b.v), s3 = () => pairs((a, b) => a.p === b.p && a.m !== b.m);
    function table() {
      const hl = new Set([s3(), s2(), s1()].filter(Boolean).slice(0, 1).flat());
      tab.innerHTML = [0, 1, 2, 3, 4].map((j) => { const r = recs[j]; return r ? `<tr class="${hl.has(j) ? 'hl' : ''}"><td style="color:${BALL[r.i].ink}">${r.m} kg</td><td>${r.v} m/s</td><td><b>${r.p}</b></td><td>${r.n == null ? '–' : r.n + '개'}</td></tr>` : '<tr><td></td><td></td><td></td><td></td></tr>'; }).join('');
    }
    function steps() {
      const ok = []; if (s1()) ok.push(1); if (s2()) ok.push(2); if (s3()) ok.push(3);
      const st = [1, 2, 3].find((n) => !ok.includes(n)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      chip.textContent = st === 1 ? '① 같은 속도로 가벼운 공·무거운 공' : st === 2 ? '② 같은 공을 느리게·빠르게' : st === 3 ? '③ 운동량이 같아지는 두 경우 찾기' : '✓ 질량이 크고 빠를수록 멈추기 어렵다';
      chip.classList.toggle('done', st === 0);
    }

    const S = P.make(stage, {
      draw,
      down(p) {
        const g = geo();
        const ci = cardRects(g).findIndex((r) => p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y < r.y + r.h);
        if (ci >= 0) { pick(ci); return; }
        if (ph === 'aim') { const x = g.LX0 - 10 - v * g.PK; if (Math.hypot(p.x - x, p.y - g.CY) < BALL[cur].r + 22) { drag = { pull: true, x0: p.x + v * g.PK }; return; } }
        if (ph !== 'roll' && ph !== 'stop') {
          const ri = [0, 1, 2].findIndex((i) => { const q = rackAt(g, i); return (i !== cur || ph === 'empty' || ph === 'back') && Math.hypot(p.x - q.x, p.y - q.y) < BALL[i].r + 16; });
          if (ri >= 0) { if (ph === 'back') { ph = 'empty'; comp = 0; } cur = ri; ph = 'carry'; drag = { x: p.x, y: p.y }; return; }
        }
        if (p.x > g.PX - 26 && p.x < g.PX + 154 && p.y > g.LY0 && p.y < g.LY1 && ph !== 'roll') { setPins(!pinsOn || pins.hit ? true : false); if (!pinsOn) say('핀을 치웠다.'); return; }
        if (ph === 'roll') say('굴러가는 중이다. 판이 얼마나 밀리는지 보자.');
      },
      move(p) {
        if (!drag) return;
        const g = geo();
        if (drag.pull) { setV((drag.x0 - p.x) / g.PK); say(v ? `당긴 만큼 <b>${v} m/s</b>. 놓으면 굴러간다 → p = ${BALL[cur].m} × ${v} = <b>${pOf(BALL[cur].m, v)} kg·m/s</b>` : '공을 <b>뒤로(왼쪽으로)</b> 당기자.'); return; }
        drag.x = p.x; drag.y = p.y;
      },
      up() {
        if (!drag) return;
        const g = geo(), d = drag; drag = null;
        if (d.pull) { roll(); return; }
        if (ph === 'carry') { if (d.y > g.LY0 - 30 && d.y < g.LY1 + 30 && d.x < g.BR - 40) place(cur); else { ph = 'empty'; cur = -1; say('공을 <b>레인 위</b>에 놓아야 한다.'); } }
      },
      key(e) {
        if (/^[1-3]$/.test(e.key)) { place(+e.key - 1); return true; }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { if (ph !== 'aim') place(sel); setV(v + (e.key === 'ArrowLeft' ? 1 : -1)); say(`<b>${BALL[cur].m} kg</b> 공 · <b>${v} m/s</b> → p = <b>${pOf(BALL[cur].m, v)} kg·m/s</b>. 엔터로 굴리자.`); return true; }
        if (e.key === 'Enter' || e.key === ' ') { roll(); return true; }
        if (e.key === 'p' || e.key === 'P') { setPins(!pinsOn || !!pins.hit); if (!pinsOn) say('핀을 치웠다.'); return true; }
        if (e.key === 'c' || e.key === 'C') { pick((card + 1) % 4); return true; }
        if (e.key === '0') { reset(); return true; }
        return false;
      },
    });
    root.querySelector('.bw-reset').addEventListener('click', () => { reset(); S.kick(); });

    reset();
    root._bw = {
      throw: (m, s) => { place(BALL.findIndex((b) => b.m === m)); setV(s); roll(); while (ph === 'roll') step(geo(), 0.02); S.redraw(); return root._bw.state(); },
      pins: (on) => { setPins(on); S.redraw(); return root._bw.state(); },
      card: (i) => { pick(i); S.redraw(); return root._bw.state(); },
      state: () => ({ ph, cur, v, comp: +comp.toFixed(1), pinsOn, card, recs: recs.map((r) => [r.m, r.v, r.p, r.n]), done: root.classList.contains('u-done'), out: out.textContent, chip: chip.textContent }),
      geo: () => { const g = geo(); return { W: g.W, H: g.H, LX0: g.LX0, CY: g.CY, LY0: g.LY0, LY1: g.LY1, PX: g.PX, PK: g.PK, BR: g.BR, rack: [0, 1, 2].map((i) => rackAt(g, i)), cards: cardRects(g) }; },
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Bowling = { mount };
})();
