/* 3-2 1차시 체험 «가속 페달과 브레이크»(교과서 124쪽 그림 Ⅲ-14 가속도의 방향).
   옆에서 본 도로와 자동차. 오른쪽 아래 가속 페달·브레이크를 꾹 누르고 있는 동안만 빨라지거나 느려진다(떼면 그 속도 그대로).
   1초마다 차 위에 속도 화살표(길이 = 속력)가 도장처럼 남고, 왼쪽 위 그림판에 처음 속도·나중 속도·속도 변화량,
   오른쪽 칸에 가속도 = (나중 − 처음) ÷ 시간 계산이 바뀐다. 가속도 화살표는 빨라질 때 앞(주황), 느려질 때 뒤(보라).
   차를 끌어 옮길 수 있다(끌면 멈춤). 가속 2 m/s²·감속 4 m/s²는 이해를 돕기 위한 예.
   Accel.mount(root) → { fit, setActive } · 시험용: root._ac.hold('gas'|'brake', 초) · state() */
(function () {
  'use strict';
  const TAU = Math.PI * 2, A = { gas: 2, brake: -4 }, VMAX = 24, TICK = 0.1;
  // 0.1초 단위로 속도를 바꿔 화면의 나눗셈이 늘 딱 맞는다(마지막 멈춤 조각만 0.05초)
  const fmt = (x) => { const r = Math.round(x * 100) / 100; return Math.abs(r) < 0.005 ? '0' : String(+r.toFixed(Math.abs(r * 10 - Math.round(r * 10)) > 0.01 ? 2 : Math.abs(r - Math.round(r)) > 0.01 ? 1 : 0)); };
  const sgn = (x) => (x > 0.05 ? '+' : x < -0.05 ? '−' : '');
  console.assert(fmt(2) === '2' && fmt(6.6) === '6.6' && fmt(1.65) === '1.65' && sgn(-3) === '−', 'accel: 숫자 표기');

  function mount(root) {
    const stage = root.querySelector('.ac-stage'), now = root.querySelector('.ac-now'), out = root.querySelector('.ac-out');
    const calc = root.querySelector('.ac-num'), recEl = { gas: root.querySelector('.ac-rec[data-k="gas"]'), brake: root.querySelector('.ac-rec[data-k="brake"]') };
    const P = window.Play;
    let acc = 0, x, v, cam, pedal, press, recs, stamps, nextStamp, t, drag, msg, cmpT, wheel, uiT = 0, keyHeld = null;
    function reset() { x = 0; v = 0; cam = 0; pedal = null; press = null; recs = { gas: null, brake: null }; stamps = []; nextStamp = 1; t = 0; drag = null; msg = ''; cmpT = -1; wheel = 0; showRecs(); }
    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };
    const f = () => S.W / 1060, PXM = () => 16 * f(); // 화면 1 m
    const X0 = () => S.W * 0.2; // 처음 위치(화면)
    const carSX = () => X0() + (x - cam) * PXM();
    const roadY = () => S.H * 0.74;
    const K = () => 16 * 0.9 * f(); // 속도 화살표: 1 m/s당 길이(1초에 가는 거리보다 조금 짧게)
    const pedals = () => { const w = 300 * f(), h = 150 * f(); const bx = S.W - w - 14, by = S.H - h - 12; return { bx, by, w, h, brake: { x: bx + w * 0.08, y: by + h * 0.3, w: w * 0.44, h: h * 0.5 }, gas: { x: bx + w * 0.64, y: by + h * 0.12, w: w * 0.26, h: h * 0.7 } }; };

    function start(k) {
      if (drag) return;
      if (k === 'brake' && v < 0.05) { pedal = null; say('차가 서 있어서 브레이크로 더 느려질 수 없다. 먼저 <b>가속 페달</b>로 달리게 하자.'); return; }
      pedal = k; acc = 0; press = { k, v0: v, t: 0, v1: v, end: false };
      say(k === 'gas' ? '가속 페달을 누르는 동안 1초마다 속도가 <b>2 m/s씩</b> 커진다. 차 위에 찍히는 화살표가 점점 길어진다.' : '브레이크를 누르는 동안 1초마다 속도가 <b>4 m/s씩</b> 줄어든다. 브레이크등이 켜지고 화살표가 짧아진다.');
      showRecs(); S.kick();
    }
    function stop() {
      if (!pedal) return;
      const p = press; pedal = null;
      if (p && p.t >= 0.25) {
        const dv = p.v1 - p.v0;
        if (Math.abs(dv) >= 0.4) recs[p.k] = { ...p };
        const a = dv / p.t;
        say(p.k === 'gas'
          ? `${fmt(p.t)}초 동안 ${fmt(p.v0)} → ${fmt(p.v1)} m/s, 속도 변화량 <b>+${fmt(dv)} m/s</b>. 가속도 = ${fmt(dv)} ÷ ${fmt(p.t)} = <b>+${fmt(a)} m/s²</b> — 운동 방향(앞)과 <b>같은 쪽</b>.${recs.brake ? '' : ' 이제 브레이크를 꾹 눌러 보자.'}`
          : `${fmt(p.t)}초 동안 ${fmt(p.v0)} → ${fmt(p.v1)} m/s, 속도 변화량 <b>−${fmt(-dv)} m/s</b>. 가속도 = ${fmt(dv)} ÷ ${fmt(p.t)} = <b>−${fmt(-a)} m/s²</b> — 운동 방향과 <b>반대쪽</b>(뒤).${recs.gas ? '' : ' 가속 페달도 눌러 보자.'}`);
      } else say('페달을 <b>꾹 누르고 있어야</b> 속도가 계속 바뀐다. 1초 넘게 눌러 보자.');
      showRecs(); steps(); S.kick();
    }
    function showRecs() {
      ['gas', 'brake'].forEach((k) => {
        const r = recs[k], el = recEl[k], b = el.querySelector('.ac-rv');
        el.classList.toggle('on', !!r);
        if (!r) { b.innerHTML = k === 'gas' ? '가속 페달을 꾹 →' : '브레이크를 꾹 →'; return; }
        const dv = r.v1 - r.v0, a = dv / r.t;
        b.innerHTML = `${fmt(r.v0)} → ${fmt(r.v1)} m/s, ${fmt(r.t)} s<br><span class="ac-big">${sgn(a)}${fmt(Math.abs(a))}&nbsp;m/s²</span><br><span class="ac-dir">${a > 0 ? '운동 방향과 같다 ⟶' : '⟵ 운동 방향과 반대'}</span>`;
      });
    }
    function calcText() {
      const p = press;
      if (!p) { calc.innerHTML = '= (<i>나중</i> − <i>처음</i>) ÷ <i>시간</i> — 페달을 누르면 채워진다'; return; }
      const dv = p.v1 - p.v0, a = p.t > 0.05 ? dv / p.t : 0;
      calc.innerHTML = `= (<span class="v">${fmt(p.v1)}</span> − <span class="v">${fmt(p.v0)}</span>) m/s ÷ <span class="v">${fmt(p.t)}</span> s<br>= <b class="${dv >= 0 ? 'up' : 'dn'}">${sgn(a)}${fmt(Math.abs(a))}&nbsp;m/s²</b>`;
    }
    function steps() {
      const big = (r) => r && (Math.abs(r.v1 - r.v0) >= 1.5 || r.end); // 1초 가까이 눌렀거나 끝까지(멈춤·최고 속도)
      const ok = []; if (big(recs.gas)) ok.push(1); if (big(recs.brake)) ok.push(2);
      if (ok.length === 2 && cmpT < 0) cmpT = t;
      if (cmpT >= 0 && t - cmpT > 1.6) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      root.querySelector('.ac-recs').classList.toggle('cmp', ok.length >= 2);
      const nt = st === 1 ? '① 가속 페달을 1초 넘게 꾹' : st === 2 ? (v < 0.05 ? '② 먼저 달리게 한 뒤 브레이크를 꾹' : '② 브레이크를 1초 넘게 꾹') : st === 3 ? '③ 두 기록의 가속도 방향 비교' : '빨라질 때 앞, 느려질 때 뒤';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
      if (st === 3 && !pedal) say('위의 두 기록을 견줘 보자. 차는 계속 <b>앞으로</b> 갔는데, 가속도는 빨라질 때 <b>앞</b>, 느려질 때 <b>뒤</b>를 향했다. 가속도는 속도 변화량과 같은 쪽을 가리킨다.');
      calcText();
    }
    function step(dt) {
      t += dt; cmpT = cmpT;
      if (pedal && !press.end) {
        acc += dt;
        while (acc >= TICK && !press.end) {
          acc -= TICK;
          const dv = A[pedal] * TICK, room = pedal === 'brake' ? v : VMAX - v, part = Math.min(1, room / Math.abs(dv));
          v = Math.round((v + dv * part) * 100) / 100; press.t = Math.round((press.t + TICK * part) * 100) / 100; press.v1 = v;
          if (part < 1 || room - Math.abs(dv) < 1e-6) { press.end = true; say(pedal === 'brake' ? '차가 멈췄다 — 속도 0. 손을 떼면 기록이 남는다.' : '이 길의 최고 속도(24 m/s)다. 손을 떼 보자.'); }
        }
      }
      if (drag) { // 왼쪽 끝으로 끌면 길이 되감긴다
        if (drag.px - drag.dx < S.W * 0.3 && cam > 0) { cam = Math.max(0, cam - 30 * dt); x = Math.max(0, cam + (drag.px - drag.dx - X0()) / PXM()); }
      } else {
        x += v * dt; wheel += v * dt / 0.32;
        // 1초마다 속도 화살표 도장(달리는 동안)
        if (v > 0.05 || pedal) { if (t >= nextStamp) { stamps.push({ x, v, k: pedal }); if (stamps.length > 40) stamps.shift(); nextStamp = Math.floor(t) + 1; } }
        else nextStamp = Math.floor(t) + 1;
        const sx = carSX(); if (sx > S.W * 0.52) cam += (sx - S.W * 0.52) / PXM();
      }
    }

    // ── 그리기 ──
    function arrow(c, x0, y0, len, col, w, edge) {
      if (Math.abs(len) < 3) return;
      const d = Math.sign(len), L = Math.abs(len), hl = Math.min(w * 2.6, L * 0.6);
      c.save(); c.translate(x0, y0); c.scale(d, 1);
      c.beginPath(); c.moveTo(0, -w / 2); c.lineTo(L - hl, -w / 2); c.lineTo(L - hl, -w * 1.4); c.lineTo(L, 0); c.lineTo(L - hl, w * 1.4); c.lineTo(L - hl, w / 2); c.lineTo(0, w / 2); c.closePath();
      c.lineJoin = 'round'; if (edge !== false) { c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 3; c.stroke(); } c.fillStyle = col; c.fill(); c.restore();
    }
    function car(c, cx, by, s, braking) {
      // cx = 차 가운데, by = 바퀴 바닥
      c.save(); c.translate(cx, by); c.scale(s, s);
      c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(0, 2, 88, 7, 0, 0, TAU); c.fill();
      const g = c.createLinearGradient(0, -62, 0, -10); g.addColorStop(0, '#e9eef3'); g.addColorStop(0.45, '#c6d0da'); g.addColorStop(1, '#7f8c99');
      c.fillStyle = g; c.strokeStyle = '#3a4450'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(-84, -16); c.quadraticCurveTo(-88, -36, -74, -40); c.lineTo(-44, -44); c.quadraticCurveTo(-26, -66, 4, -66); c.quadraticCurveTo(30, -66, 46, -46); c.quadraticCurveTo(78, -42, 86, -32); c.quadraticCurveTo(90, -20, 86, -14); c.lineTo(-84, -14); c.closePath(); c.fill(); c.stroke();
      // 창문
      c.fillStyle = '#4e6a86'; c.beginPath(); c.moveTo(-36, -44); c.quadraticCurveTo(-22, -61, 0, -61); c.lineTo(0, -44); c.closePath(); c.fill();
      c.beginPath(); c.moveTo(6, -61); c.quadraticCurveTo(28, -61, 40, -44); c.lineTo(6, -44); c.closePath(); c.fill();
      c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.moveTo(-28, -47); c.lineTo(-16, -58); c.lineTo(-10, -58); c.lineTo(-22, -47); c.fill();
      c.strokeStyle = 'rgba(40,50,60,.5)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(3, -44); c.lineTo(3, -16); c.moveTo(-44, -30); c.lineTo(84, -30); c.stroke();
      // 등
      c.fillStyle = '#fff5c8'; c.beginPath(); c.ellipse(83, -30, 4, 5, 0, 0, TAU); c.fill();
      c.fillStyle = braking ? '#ff2a1a' : '#a8261c'; c.fillRect(-86, -36, 5, 10);
      if (braking) P.glow(c, -88, -31, 26, 'rgba(255,60,40,.75)');
      // 바퀴
      [-52, 54].forEach((wx) => {
        c.fillStyle = '#1f2328'; c.beginPath(); c.arc(wx, -14, 15, 0, TAU); c.fill();
        c.fillStyle = '#b9c1c9'; c.beginPath(); c.arc(wx, -14, 8, 0, TAU); c.fill();
        c.strokeStyle = '#59616a'; c.lineWidth = 2.2; for (let i = 0; i < 5; i++) { const a = wheel + i * TAU / 5; c.beginPath(); c.moveTo(wx, -14); c.lineTo(wx + Math.cos(a) * 8, -14 + Math.sin(a) * 8); c.stroke(); }
      });
      c.restore();
    }
    function card(c, x, y, w, h) { c.fillStyle = 'rgba(255,255,255,.93)'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.roundRect(x, y, w, h, 12); c.fill(); c.stroke(); }
    function draw(c, W, H, dt) {
      if (dt) step(dt);
      const s = f(), m = PXM(), ry = roadY(), vis = (u, k) => ((u - cam * m * k) % (W + 200) + W + 200) % (W + 200) - 100;
      // 하늘·구름·산(시차)
      const sky = c.createLinearGradient(0, 0, 0, ry); sky.addColorStop(0, '#8cc4ea'); sky.addColorStop(1, '#e8f4fa'); c.fillStyle = sky; c.fillRect(0, 0, W, ry);
      c.fillStyle = 'rgba(255,255,255,.9)';
      [[0.15, 0.36], [0.55, 0.3], [0.85, 0.42]].forEach(([u, vv], i) => { const cx = vis(u * W + t * 6 * s, 0.03), cy = H * vv; [[0, 0, 22], [24, -8, 18], [44, 2, 15], [-20, 4, 14]].forEach(([dx, dy, r]) => { c.beginPath(); c.arc(cx + dx * s, cy + dy * s, r * s, 0, TAU); c.fill(); }); });
      c.fillStyle = '#9db9a4'; c.beginPath(); c.moveTo(0, ry - 70 * s);
      for (let px = 0; px <= W; px += 8) { const u = px + cam * m * 0.12; c.lineTo(px, ry - 70 * s - 46 * s * (0.5 + 0.5 * Math.sin(u * 0.006)) - 22 * s * Math.sin(u * 0.017)); }
      c.lineTo(W, ry); c.lineTo(0, ry); c.fill();
      c.fillStyle = '#7fa86a'; c.fillRect(0, ry - 30 * s, W, 30 * s);
      // 나무(시차 0.6)
      for (let i = 0; i < 9; i++) { const tx = vis(i * 150 * s, 0.6), ty = ry - 24 * s; c.fillStyle = '#6b4a2b'; c.fillRect(tx - 3 * s, ty - 30 * s, 6 * s, 30 * s); c.fillStyle = i % 2 ? '#3f7d36' : '#4f9442'; c.beginPath(); c.arc(tx, ty - 42 * s, 18 * s, 0, TAU); c.arc(tx - 10 * s, ty - 32 * s, 13 * s, 0, TAU); c.arc(tx + 11 * s, ty - 33 * s, 13 * s, 0, TAU); c.fill(); }
      // 도로
      const rh = 64 * s, rg = c.createLinearGradient(0, ry - 8 * s, 0, ry + rh); rg.addColorStop(0, '#5b6068'); rg.addColorStop(1, '#3a3e45');
      c.fillStyle = '#c9c4b8'; c.fillRect(0, ry - 12 * s, W, 6 * s); c.fillStyle = rg; c.fillRect(0, ry - 6 * s, W, rh);
      c.fillStyle = '#f2f2ea'; const dash = 6 * m; for (let k = Math.floor(cam / 6) - 1; k < cam / 6 + W / dash + 2; k++) { const px = X0() + (k * 6 - cam) * m; c.fillRect(px, ry + rh * 0.45, 3 * m, 4 * s); }
      c.fillStyle = '#8c7a5c'; c.fillRect(0, ry + rh - 6 * s, W, H - ry - rh + 6 * s);
      // 10 m 표지
      for (let k = Math.max(0, Math.floor(cam / 10)); k < cam / 10 + W / (10 * m) + 1; k++) { const px = X0() + (k * 10 - cam) * m; if (px < -20 || px > W + 20) continue; c.fillStyle = '#e8e2d4'; c.fillRect(px - 1.5 * s, ry - 40 * s, 3 * s, 30 * s); c.fillStyle = k ? '#fff' : '#ffd23f'; c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; c.beginPath(); c.roundRect(px - 22 * s, ry - 62 * s, 44 * s, 22 * s, 4); c.fill(); c.stroke(); P.txt(c, k ? `${k * 10} m` : '출발', px, ry - 45 * s, '#1d2433', `700 ${Math.round(16 * s)}px`); }
      // 속도 도장
      const lane = ry - 132 * s;
      stamps.forEach((p, i) => {
        const px = X0() + (p.x - cam) * m; if (px > W + 10 || px + p.v * K() < -10) return;
        c.fillStyle = 'rgba(29,36,51,.55)'; c.beginPath(); c.arc(px, lane, 4 * s, 0, TAU); c.fill();
        arrow(c, px, lane, p.v * K(), '#2f6fd0', 7 * s);
        if (p.v * K() > 64 * s) P.txt(c, `${fmt(p.v)}`, px + p.v * K() / 2, lane - 14 * s, '#1d3f80', `800 ${Math.round(18 * s)}px`);
      });
      if (stamps.length) P.txt(c, '1초마다 찍힌 속도(m/s)', Math.max(140 * s, Math.min(W - 160 * s, X0() + (stamps[0].x - cam) * m + 90 * s)), lane - 38 * s, '#1d3f80', `700 ${Math.round(18 * s)}px`);
      // 자동차
      const cx = carSX(), braking = pedal === 'brake' && !press.end;
      car(c, cx, ry + 26 * s, 1.15 * s, braking);
      if (drag) { c.strokeStyle = 'rgba(255,210,63,.95)'; c.lineWidth = 3; c.setLineDash([6, 5]); c.beginPath(); c.roundRect(cx - 104 * s, ry - 64 * s, 208 * s, 96 * s, 12); c.stroke(); c.setLineDash([]); }
      else if (!stamps.length && v < 0.05 && !pedal) { const b = Math.sin(t * 4) * 4 * s; P.txt(c, '⟷ 끌어서 옮길 수 있다', cx, ry - 80 * s + b, '#1d2433', `700 ${Math.round(17 * s)}px`); }
      // 가속도 화살표(차 몸통 위)
      const aa = pedal && !press.end ? A[pedal] : 0;
      if (aa) { const col = aa > 0 ? '#ef6a1a' : '#8a3fd1'; arrow(c, cx, ry - 30 * s, aa * 22 * s, col, 9 * s); P.txt(c, `가속도 ${sgn(aa)}${Math.abs(aa)} m/s²`, cx, ry - 80 * s, col, `800 ${Math.round(20 * s)}px`); }
      else if (v > 0.05 && !drag) P.txt(c, '가속도 0 (속도 그대로)', cx, ry - 80 * s, '#46505e', `700 ${Math.round(18 * s)}px`);
      // 그림판: 처음·나중 속도와 속도 변화량(그림 Ⅲ-14처럼)
      const gx = 16, gy = 72 * s, gw = 560 * s, gh = 196 * s, k2 = 12.5 * s, ax = gx + 150 * s;
      card(c, gx, gy, gw, gh);
      const head = !press ? '페달을 꾹 누르면 그려진다' : press ? (press.k === 'gas' ? (pedal ? '빨라지는 중' : '빨라질 때(방금)') : (pedal ? '느려지는 중' : '느려질 때(방금)')) : '';
      P.txt(c, `속도 변화 그림 · ${head}`, gx + 16 * s, gy + 30 * s, '#1d2433', `800 ${Math.round(20 * s)}px`, 'left');
      const rowY = [gy + 72 * s, gy + 118 * s, gy + 164 * s], p = press;
      ['처음 속도', '나중 속도', '속도 변화량'].forEach((n, i) => P.txt(c, n, gx + 16 * s, rowY[i] + 7 * s, i === 2 ? (p && p.v1 < p.v0 ? '#8a3fd1' : '#c4520f') : '#1f4fa0', `700 ${Math.round(19 * s)}px`, 'left'));
      c.strokeStyle = 'rgba(29,36,51,.25)'; c.lineWidth = 1; c.beginPath(); c.moveTo(ax, gy + 50 * s); c.lineTo(ax, gy + gh - 12 * s); c.stroke();
      if (p) {
        arrow(c, ax, rowY[0], p.v0 * k2, '#2f6fd0', 8 * s, false);
        arrow(c, ax, rowY[1], p.v1 * k2, '#2f6fd0', 8 * s, false);
        c.setLineDash([4, 4]); c.strokeStyle = 'rgba(29,36,51,.5)'; c.beginPath(); c.moveTo(ax + p.v0 * k2, rowY[0]); c.lineTo(ax + p.v0 * k2, rowY[2] + 12 * s); c.moveTo(ax + p.v1 * k2, rowY[1]); c.lineTo(ax + p.v1 * k2, rowY[2] + 12 * s); c.stroke(); c.setLineDash([]);
        const dv = p.v1 - p.v0;
        arrow(c, ax + p.v0 * k2, rowY[2], dv * k2, dv >= 0 ? '#ef6a1a' : '#8a3fd1', 8 * s, false);
        const lx = (vv) => Math.min(gx + gw - 92 * s, ax + Math.max(0, vv) * k2 + 10 * s), fs = `700 ${Math.round(17 * s)}px`;
        P.txt(c, `${fmt(p.v0)} m/s`, lx(p.v0), rowY[0] + 6 * s, '#1f4fa0', fs, 'left');
        P.txt(c, `${fmt(p.v1)} m/s`, lx(p.v1), rowY[1] + 6 * s, '#1f4fa0', fs, 'left');
        if (Math.abs(dv) > 0.05) P.txt(c, `${sgn(dv)}${fmt(Math.abs(dv))} m/s`, lx(Math.max(p.v0, p.v1)), rowY[2] + 6 * s, dv >= 0 ? '#c4520f' : '#8a3fd1', `800 ${Math.round(17 * s)}px`, 'left');
      }
      // 속도계
      const dw = 230 * s, dx0 = W - dw - 16, dy0 = 16;
      card(c, dx0, dy0, dw, 214 * s);
      const ox = dx0 + dw / 2, oy = dy0 + 124 * s, r = 84 * s;
      c.lineWidth = 10 * s; c.strokeStyle = '#e3e7ec'; c.beginPath(); c.arc(ox, oy, r, Math.PI, TAU); c.stroke();
      c.strokeStyle = '#2f6fd0'; c.beginPath(); c.arc(ox, oy, r, Math.PI, Math.PI + Math.PI * v / VMAX); c.stroke();
      for (let k = 0; k <= 24; k += 4) { const a = Math.PI + Math.PI * k / VMAX; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.moveTo(ox + Math.cos(a) * (r - 14 * s), oy + Math.sin(a) * (r - 14 * s)); c.lineTo(ox + Math.cos(a) * (r - 5 * s), oy + Math.sin(a) * (r - 5 * s)); c.stroke(); P.txt(c, String(k), ox + Math.cos(a) * (r - 30 * s), oy + Math.sin(a) * (r - 30 * s) + 6 * s, '#46505e', `700 ${Math.round(15 * s)}px`); }
      const na = Math.PI + Math.PI * v / VMAX; c.strokeStyle = '#c0392b'; c.lineWidth = 4 * s; c.lineCap = 'round'; c.beginPath(); c.moveTo(ox, oy); c.lineTo(ox + Math.cos(na) * (r - 18 * s), oy + Math.sin(na) * (r - 18 * s)); c.stroke(); c.lineCap = 'butt';
      c.fillStyle = '#1d2433'; c.beginPath(); c.arc(ox, oy, 6 * s, 0, TAU); c.fill();
      P.txt(c, '속도계', ox, dy0 + 28 * s, '#1d2433', `800 ${Math.round(19 * s)}px`);
      P.txt(c, `${(Math.round(v * 10) / 10).toFixed(1)} m/s`, ox, oy + 42 * s, '#1d2433', `800 ${Math.round(26 * s)}px`);
      P.txt(c, `누른 시간 ${press ? press.t.toFixed(1) : '0.0'} s`, ox, oy + 72 * s, '#46505e', `700 ${Math.round(17 * s)}px`);
      // 페달
      const pd = pedals();
      const fw = c.createLinearGradient(0, pd.by, 0, pd.by + pd.h); fw.addColorStop(0, '#2b3038'); fw.addColorStop(1, '#14171c');
      c.fillStyle = fw; c.strokeStyle = '#0a0c10'; c.lineWidth = 2; c.beginPath(); c.roundRect(pd.bx, pd.by, pd.w, pd.h, 14); c.fill(); c.stroke();
      [['brake', '브레이크'], ['gas', '가속 페달']].forEach(([k, n]) => {
        const q = pd[k], on = pedal === k, sq = on ? 0.88 : 1, qw = q.w * sq, qh = q.h * sq, qx = q.x + (q.w - qw) / 2, qy = q.y + (q.h - qh) / 2 + (on ? 6 * s : 0);
        c.fillStyle = '#555c66'; c.fillRect(q.x + q.w / 2 - 4 * s, q.y - 10 * s, 8 * s, 14 * s);
        const pg = c.createLinearGradient(qx, 0, qx + qw, 0); pg.addColorStop(0, on ? '#3a3f47' : '#5d646e'); pg.addColorStop(0.5, on ? '#4b525c' : '#8a929c'); pg.addColorStop(1, on ? '#30353c' : '#545a63');
        c.fillStyle = pg; c.beginPath(); c.roundRect(qx, qy, qw, qh, 8 * s); c.fill();
        c.strokeStyle = on ? (k === 'gas' ? '#ef6a1a' : '#8a3fd1') : 'rgba(0,0,0,.6)'; c.lineWidth = on ? 4 : 2; c.stroke();
        c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 2; for (let yy = qy + 10 * s; yy < qy + qh - 6 * s; yy += 9 * s) { c.beginPath(); c.moveTo(qx + 6 * s, yy); c.lineTo(qx + qw - 6 * s, yy); c.stroke(); }
        P.txt(c, n, q.x + q.w / 2, pd.by + pd.h - 8 * s, on ? '#ffd23f' : '#fff', `800 ${Math.round(18 * s)}px`);
      });
      if (!recs.gas && !pedal) { const b = (0.5 + 0.5 * Math.sin(t * 5)) * 8 * s, q = pd.gas; c.fillStyle = 'rgba(255,210,63,.95)'; c.beginPath(); c.moveTo(q.x + q.w / 2, q.y - 14 * s - b); c.lineTo(q.x + q.w / 2 - 12 * s, q.y - 34 * s - b); c.lineTo(q.x + q.w / 2 + 12 * s, q.y - 34 * s - b); c.fill(); P.txt(c, '꾹 누르기', q.x + q.w / 2 - 30 * s, q.y - 42 * s - b, '#ffd23f', `800 ${Math.round(18 * s)}px`); }
      uiT += dt; if (uiT > 0.12 || !dt) { uiT = 0; steps(); }
    }

    const inR = (p, q) => p.x > q.x - 6 && p.x < q.x + q.w + 6 && p.y > q.y - 10 && p.y < q.y + q.h + 10;
    const S = P.make(stage, {
      draw,
      down(p) {
        const pd = pedals();
        if (inR(p, pd.gas)) { start('gas'); return; }
        if (inR(p, pd.brake)) { start('brake'); return; }
        const s = f(), cx = carSX(), ry = roadY();
        if (Math.abs(p.x - cx) < 104 * s && p.y > ry - 70 * s && p.y < ry + 34 * s) { drag = { dx: p.x - cx, px: p.x }; v = 0; pedal = null; press = null; stamps = []; say('차를 옮기는 중 — 손으로 잡으면 멈춘다. 놓은 자리에서 다시 출발한다.'); }
      },
      move(p, e, held) {
        if (!held || !drag) return;
        drag.px = p.x; x = Math.max(0, cam + (p.x - drag.dx - X0()) / PXM());
      },
      up() {
        if (drag) { drag = null; nextStamp = Math.floor(t) + 1; say(x < 1 ? '처음 위치로 돌아왔다. 다시 가속 페달을 꾹 눌러 보자.' : '차를 내려놓았다. 페달을 꾹 눌러 보자.'); steps(); return; }
        stop();
      },
      key(e) {
        if (e.repeat && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) return true;
        if (e.key === 'ArrowUp') { keyHeld = e.key; start('gas'); return true; }
        if (e.key === 'ArrowDown') { keyHeld = e.key; start('brake'); return true; }
        if (e.key === '0') { reset(); steps(); return true; }
        return false;
      },
    });
    S.cv.addEventListener('keyup', (e) => { if (e.key === keyHeld) { keyHeld = null; stop(); e.preventDefault(); } });
    S.cv.addEventListener('blur', () => { if (keyHeld) { keyHeld = null; stop(); } });
    reset();
    root.querySelector('.ac-reset').addEventListener('click', () => { reset(); steps(); S.kick(); });
    steps();
    root._ac = {
      hold: (k, sec) => { start(k); for (let i = 0; i < sec * 30; i++) step(1 / 30); stop(); return root._ac.state(); },
      run: (sec) => { for (let i = 0; i < sec * 30; i++) step(1 / 30); steps(); return root._ac.state(); },
      state: () => ({ sx: +carSX().toFixed(1), ry: +roadY().toFixed(1), x: +x.toFixed(2), v: +v.toFixed(2), stamps: stamps.length, gas: recs.gas && +((recs.gas.v1 - recs.gas.v0) / recs.gas.t).toFixed(2), brake: recs.brake && +((recs.brake.v1 - recs.brake.v0) / recs.brake.t).toFixed(2), done: root.classList.contains('u-done') }),
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Accel = { mount };
})();
