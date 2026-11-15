/* 3-2 3차시 체험 «갈릴레이의 빗면»(참고서 170쪽 갈릴레이의 사고 실험 · 177쪽 문제).
   왼쪽 빗면(40°) 위 공을 끌어 높이를 정하고 놓으면 골짜기를 지나 오른쪽 빗면으로 올라간다. 처음 높이는 가로 점선.
   오른쪽 빗면은 끝의 손잡이(또는 빗면 자체)를 끌어 기울기를 바꾼다(50° → 0°, 2° 아래는 수평으로 붙음).
   마찰: 처음에는 레일이 거칠다(사포 무늬). 상자의 걸레를 레일 위로 끌어 와 문지르면 마찰이 줄어 없어진다.
   마찰이 없으면 공은 오른쪽 빗면에서 처음 높이까지 오르고, 기울기를 낮출수록 더 멀리 가서 같은 높이에 이른다.
   수평이면 멈추지 않고 같은 빠르기로 계속 간다(화면이 따라감, 중력·떠받치는 힘 화살표와 «알짜힘 0»).
   마찰이 있으면 처음 높이에 못 미치고, 수평면에서는 결국 멈춘다. 1 m = 100 px, 중력 가속도는 화면용 7 m/s²(느린 화면).
   Galileo.mount(root) → { fit, setActive } · 시험용: root._gl.set({ th, rough, h }) · roll() · state() · geo() */
(function () {
  'use strict';
  const TAU = Math.PI * 2, D = Math.PI / 180, AL = 40 * D, GR = 700, MU = 0.12, BR = 18, PX = 100;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // 공의 움직임(빗면 길 s, 속도 v) 한 걸음. 마찰은 에너지에서 빼고, 속력은 남은 에너지로 다시 구해 오차가 쌓이지 않게 한다.
  function stepBall(b, th, mu, dt) {
    const ang = b.s < 0 ? AL : th, sn = b.s < 0 ? -Math.sin(AL) : Math.sin(th);
    const h = (s) => (s < 0 ? -s * Math.sin(AL) : s * Math.sin(th));
    b.v += (-GR * sn - mu * GR * Math.cos(ang) * Math.sign(b.v)) * dt;
    const ds = b.v * dt; b.s += ds; b.E -= mu * GR * Math.cos(ang) * Math.abs(ds);
    const k = 2 * (b.E - GR * h(b.s));
    if (k <= 0) { b.v = 0; } else b.v = Math.sign(b.v || -sn || 1) * Math.sqrt(k);
    return b;
  }
  // 자체 확인: 마찰 없으면 30°·10° 빗면 모두 처음 높이(200 px)까지 오른다
  (function () {
    [30, 10].forEach((d) => {
      const b = { s: -200 / Math.sin(AL), v: 0, E: GR * 200 }; let top = 0;
      for (let i = 0; i < 20000; i++) { stepBall(b, d * D, 0, 1 / 240); if (b.s > 0) top = Math.max(top, b.s * Math.sin(d * D)); if (b.s > 0 && b.v <= 0) break; }
      console.assert(Math.abs(top - 200) < 3, 'galileo: 처음 높이 ' + d + '° ' + top.toFixed(1));
    });
  })();

  function mount(root) {
    const stage = root.querySelector('.gl-stage'), now = root.querySelector('.gl-now'), out = root.querySelector('.gl-out');
    const P = window.Play;
    let th, rough, h0, frac = 0.72, ballHL = 0, ball, rolling, cam, mode, prev, ok, msg, t, trail, tt, reach, flatGo, th1, olds, rubbed, cloth, stopSaid;

    function reset() {
      th = 35 * D; rough = 1; h0 = 0; ball = null; rolling = false; cam = 0; mode = null; prev = null; ok = new Set(); msg = ''; t = 0;
      trail = []; tt = 0; reach = null; flatGo = 0; th1 = null; olds = []; rubbed = 0; cloth = null; stopSaid = false;
      place(0.72); steps();
      say('공을 놓기 전에 예측해 보자. 오른쪽 빗면에서 공은 <b>처음 높이(점선)</b>까지 올라갈까? <b>공을 누르면</b> 굴러간다');
    }
    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };
    const mu = () => MU * rough;

    // ── 자리 ──
    const L = () => {
      const W = S.W, H = S.H, GY = H - 110, HL = Math.min(330, GY - 190), bx = 56 + HL / Math.tan(AL);
      return { W, H, GY, HL, bx, HR: HL + 40, box: { x: 18, y: GY + 28, w: 150, h: 64 } };
    };
    const at = (l, s) => (s < 0 ? { x: l.bx + s * Math.cos(AL), y: l.GY + s * Math.sin(AL) } : { x: l.bx + s * Math.cos(th), y: l.GY - s * Math.sin(th) });
    const hOf = (s) => (s < 0 ? -s * Math.sin(AL) : s * Math.sin(th));
    const rampLen = (l) => (th > 0.001 ? l.HR / Math.sin(th) : Infinity);
    function place(f) { const l = L(); frac = clamp(f, 0.25, 0.95); ballHL = l.HL; h0 = frac * l.HL; ball = { s: -h0 / Math.sin(AL), v: 0, E: GR * h0 }; rolling = false; trail = []; reach = null; flatGo = 0; stopSaid = false; }
    const ballPos = (l) => { const p = at(l, ball.s), n = ball.s < 0 ? [Math.sin(AL), -Math.cos(AL)] : [-Math.sin(th), -Math.cos(th)]; return { x: p.x + n[0] * (BR + 7), y: p.y + n[1] * (BR + 7) }; };

    // ── 그림 ──
    function sky(c, l) {
      const { W, H, GY } = l;
      const g = c.createLinearGradient(0, 0, 0, GY); g.addColorStop(0, '#cfe6f7'); g.addColorStop(1, '#f4efe2'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      // 먼 언덕(느리게 지나감)
      c.fillStyle = '#c6d8b8'; c.beginPath(); c.moveTo(0, GY);
      for (let x = 0; x <= W + 20; x += 20) { const wx = x + cam * 0.25; c.lineTo(x, GY - 70 - Math.sin(wx * 0.006) * 34 - Math.sin(wx * 0.017) * 12); }
      c.lineTo(W, GY); c.closePath(); c.fill();
      // 바닥
      const fg = c.createLinearGradient(0, GY, 0, H); fg.addColorStop(0, '#b9a684'); fg.addColorStop(1, '#8e7b5a'); c.fillStyle = fg; c.fillRect(0, GY, W, H - GY);
      c.strokeStyle = 'rgba(70,55,35,.35)'; c.lineWidth = 2;
      const off = ((cam % 80) + 80) % 80; for (let x = -off; x < W; x += 80) { c.beginPath(); c.moveTo(x, GY + 8); c.lineTo(x - 30, H); c.stroke(); }
    }
    function rail(c, l, a, b, w) {
      c.save(); c.lineCap = 'round';
      c.strokeStyle = '#5b3a1c'; c.lineWidth = w + 6; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke();
      c.strokeStyle = '#b07a43'; c.lineWidth = w; c.stroke();
      c.strokeStyle = 'rgba(255,230,190,.6)'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(a.x, a.y - w / 2 + 2); c.lineTo(b.x, b.y - w / 2 + 2); c.stroke();
      if (rough > 0.02) { // 사포처럼 거친 겉면
        const n = Math.hypot(b.x - a.x, b.y - a.y), ux = (b.x - a.x) / n, uy = (b.y - a.y) / n; c.fillStyle = `rgba(60,40,20,${0.65 * rough})`;
        for (let d = 4; d < n; d += 7) { const j = ((d * 37) % 11) / 11; c.fillRect(a.x + ux * d - 1.5, a.y + uy * d - w / 2 - 2 + j * 3, 3, 3); }
      } else { c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 2; c.beginPath(); c.moveTo(a.x, a.y - w / 2 + 1); c.lineTo(b.x, b.y - w / 2 + 1); c.stroke(); }
      c.restore();
    }
    function arrow(c, x, y, dx, dy, len, col, label, side = 1) {
      const n = Math.hypot(dx, dy) || 1, ux = dx / n, uy = dy / n, ex = x + ux * len, ey = y + uy * len;
      c.save(); c.lineCap = 'round'; c.strokeStyle = '#111'; c.lineWidth = 9; c.beginPath(); c.moveTo(x, y); c.lineTo(ex - ux * 12, ey - uy * 12); c.stroke();
      c.strokeStyle = col; c.lineWidth = 5; c.stroke();
      c.fillStyle = col; c.strokeStyle = '#111'; c.lineWidth = 2; c.beginPath(); c.moveTo(ex, ey); c.lineTo(ex - ux * 18 - uy * 10, ey - uy * 18 + ux * 10); c.lineTo(ex - ux * 18 + uy * 10, ey - uy * 18 - ux * 10); c.closePath(); c.fill(); c.stroke();
      if (label) P.txt(c, label, ex + side * 14, ey + (uy > 0 ? 8 : 18) - (uy > 0 ? 0 : 10), col === '#ff6b6b' ? '#b02020' : '#1c55a0', '800 18px', side > 0 ? 'left' : 'right');
      c.restore();
    }
    function chip(c, x, y, s, bg, fg, f = '800 20px', al = 'center') {
      c.font = `${f} "IBM Plex Sans KR", sans-serif`; const tw = c.measureText(s).width, x0 = al === 'left' ? x : x - tw / 2;
      c.fillStyle = bg; c.strokeStyle = fg; c.lineWidth = 2; c.beginPath(); c.roundRect(x0 - 12, y - 18, tw + 24, 36, 18); c.fill(); c.stroke();
      P.txt(c, s, x0 + tw / 2, y + 7, fg, f);
    }
    function drawBall(c, x, y, a = 1) {
      c.save(); c.globalAlpha = a;
      const g = c.createRadialGradient(x - BR * 0.4, y - BR * 0.45, 2, x, y, BR); g.addColorStop(0, '#ffd2cc'); g.addColorStop(0.4, '#e8483a'); g.addColorStop(1, '#6a120c');
      c.fillStyle = g; c.strokeStyle = '#3d0a06'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, BR, 0, TAU); c.fill(); c.stroke();
      if (a === 1) { const r = ball.s / BR; c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, BR * 0.62, r, r + 1.6); c.stroke(); }
      c.restore();
    }
    function drawCloth(c, x, y, on) {
      c.save(); c.translate(x, y); c.rotate(on ? Math.sin(t * 20) * 0.08 : -0.08);
      c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.ellipse(4, 18, 46, 8, 0, 0, TAU); c.fill();
      const g = c.createLinearGradient(0, -20, 0, 20); g.addColorStop(0, '#ffe58a'); g.addColorStop(1, '#e0b43a'); c.fillStyle = g; c.strokeStyle = '#7a5a10'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(-44, 14); c.quadraticCurveTo(-48, -10, -30, -18); c.quadraticCurveTo(0, -26, 30, -16); c.quadraticCurveTo(48, -6, 44, 14); c.closePath(); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(122,90,16,.5)'; c.lineWidth = 1; for (let k = -30; k <= 30; k += 8) { c.beginPath(); c.moveTo(k, -16); c.lineTo(k + 4, 12); c.stroke(); }
      c.restore();
    }

    function draw(c, W, H, dt) {
      if (!W) return;
      t += dt; const l = L();
      if (!rolling && ballHL !== l.HL) place(frac); // 화면 크기가 정해지거나 바뀌면 공 자리를 다시 잡는다
      // 물리
      if (rolling) {
        const n = 8; let turned = false; const was = ball.v;
        for (let i = 0; i < n; i++) {
          const pv = ball.v; stepBall(ball, th, mu(), dt / n);
          if (ball.s > 0 && pv > 0 && ball.v <= 0) turned = true;
          if (ball.s > rampLen(l)) { ball.s = rampLen(l); ball.v = 0; }
        }
        if (ball.s > 0) reach = Math.max(reach || 0, hOf(ball.s));
        tt += dt; if (tt > 0.2) { tt = 0; const p = ballPos(l); trail.push(p); if (trail.length > 14) trail.shift(); }
        if (turned) onTurn(l);
        if (th === 0 && ball.s > 0 && ball.v > 0) {
          flatGo = ball.s;
          if (rough === 0 && flatGo > 1400 && !ok.has(3)) { ok.add(3); steps(); say(`수평면에서는 공이 <b>멈추지 않는다</b>. 마찰이 없으니 운동을 방해하는 힘이 없고, 중력과 떠받치는 힘이 맞서 <b>알짜힘이 0</b> — 공은 <b>같은 빠르기로 곧게</b>(등속 직선 운동) 끝없이 간다. 이것이 <b>관성 법칙</b>이다. 공을 누르면 다시 출발점으로.`); }
        }
        if (Math.abs(ball.v) < 2 && Math.abs(was) < 2 && (ball.s >= 0 ? (th === 0 || Math.sin(th) <= mu() * Math.cos(th)) : false)) {
          rolling = false; if (!stopSaid) { stopSaid = true; say(th === 0 ? `마찰이 있으니 수평면에서도 공이 점점 느려지다가 <b>${(ball.s / PX).toFixed(1)} m</b> 가서 멈췄다. 멈추게 한 것은 <b>마찰력</b>이다. 걸레로 레일을 문질러 마찰을 없애 보자` : '공이 멈췄다. 공을 누르면 다시 출발점으로'); }
        }
        // 마찰 있는 왕복은 골짜기에서 오래 흔들리므로 적당히 끊는다
        if (rough > 0 && Math.abs(ball.v) < 25 && Math.abs(ball.s) < 6 && reach != null) { rolling = false; ball.v = 0; }
      }
      // 화면 따라가기
      const bp0 = at(l, ball.s), want = rolling && bp0.x > W * 0.55 ? bp0.x - W * 0.55 : (rolling ? cam : 0);
      cam += (Math.max(0, want) - cam) * Math.min(1, dt * (rolling ? 12 : 4));
      if (!rolling && cam < 0.5) cam = 0;

      sky(c, l);
      c.save(); c.translate(-cam, 0);
      // 처음 높이 점선
      const yh = l.GY - h0; c.strokeStyle = 'rgba(29,36,51,.55)'; c.lineWidth = 2; c.setLineDash([12, 9]); c.beginPath(); c.moveTo(cam, yh); c.lineTo(cam + W, yh); c.stroke(); c.setLineDash([]); P.txt(c, '처음 높이', cam + 14, yh - 10, 'rgba(29,36,51,.8)', '800 17px', 'left');
      // 지난 빗면 자국(마찰 없이 굴린 것)
      olds.forEach((o, i) => {
        const e = { x: l.bx + o.d * Math.cos(o.th), y: l.GY - o.d * Math.sin(o.th) }; c.strokeStyle = 'rgba(90,60,30,.35)'; c.lineWidth = 6; c.setLineDash([4, 6]); c.beginPath(); c.moveTo(l.bx, l.GY); c.lineTo(e.x + 40 * Math.cos(o.th), e.y - 40 * Math.sin(o.th)); c.stroke(); c.setLineDash([]);
        c.fillStyle = 'rgba(232,72,58,.45)'; c.beginPath(); c.arc(e.x, e.y - BR, 9, 0, TAU); c.fill(); P.txt(c, 'ABC'[i], e.x, e.y - BR - 18, 'rgba(120,30,20,.8)', '800 18px');
      });
      // 바닥 거리 눈금(골짜기에서)
      for (let m = 1; m * PX + l.bx < cam + W + 100; m++) { const x = l.bx + m * PX; if (x < cam - 60) continue; c.fillStyle = 'rgba(40,30,15,.6)'; c.fillRect(x - 1, l.GY + 10, 2, 12); if (m % 2 === 0 || th > 0) P.txt(c, `${m} m`, x, l.GY + 42, 'rgba(40,30,15,.75)', '700 15px'); }
      // 레일
      const lt = at(l, -l.HL / Math.sin(AL)); rail(c, l, lt, { x: l.bx, y: l.GY }, 14);
      c.fillStyle = '#8a5a2b'; c.beginPath(); c.moveTo(lt.x, lt.y + 8); c.lineTo(l.bx, l.GY + 8); c.lineTo(lt.x, l.GY + 8); c.closePath(); c.globalAlpha = 0.35; c.fill(); c.globalAlpha = 1;
      const RL = rampLen(l), end = at(l, Math.min(RL, (cam + W + 200 - l.bx) / Math.max(0.05, Math.cos(th))));
      rail(c, l, { x: l.bx, y: l.GY }, end, 14);
      if (th > 0) { c.fillStyle = 'rgba(138,90,43,.35)'; c.beginPath(); c.moveTo(l.bx, l.GY + 8); c.lineTo(end.x, end.y + 8); c.lineTo(end.x, l.GY + 8); c.closePath(); c.fill(); }
      // 오른쪽 빗면 손잡이
      const ks = Math.min(RL - 10, 420), kp = at(l, ks), kx = kp.x, ky = kp.y - 4;
      if (kx > cam - 40 && kx < cam + W + 40) {
        c.fillStyle = mode === 'tilt' ? '#ffd84d' : '#2a73b8'; c.strokeStyle = '#111'; c.lineWidth = 2.5; c.beginPath(); c.arc(kx, ky, 15, 0, TAU); c.fill(); c.stroke();
        if (!rolling && mode !== 'tilt') { const k = 0.5 + 0.5 * Math.sin(t * 4); P.txt(c, '↕', kx + 30, ky + 8, `rgba(42,115,184,${0.5 + k * 0.5})`, '800 26px'); }
        P.txt(c, `${Math.round(th / D)}°`, kx, ky - 26, '#1c3d66', '800 20px');
      }
      // 자국과 공
      trail.forEach((p, i) => drawBall(c, p.x, p.y, 0.08 + 0.2 * i / trail.length));
      const bp = ballPos(l);
      // 도달 높이 표시
      if (reach != null && ball.s > 0 && th > 0) {
        const sR = reach / Math.sin(th), q = at(l, sR), full = reach >= h0 - 3;
        c.strokeStyle = full ? '#2f8a4a' : '#d9483b'; c.lineWidth = 3; c.beginPath(); c.moveTo(q.x, q.y - 6); c.lineTo(q.x, l.GY); c.stroke();
        if (!rolling || Math.abs(ball.v) < 60) chip(c, q.x, q.y - 70, full ? '처음 높이까지 올라왔다' : `처음 높이의 ${Math.round(reach / h0 * 100)}%`, '#fffbe6', full ? '#2f8a4a' : '#d9483b', '800 19px');
      }
      drawBall(c, bp.x, bp.y);
      // 수평면에서: 힘 화살표와 알짜힘 0
      if (th === 0 && ball.s > 20 && rolling) {
        arrow(c, bp.x, bp.y + 6, 0, 1, 64, '#ff6b6b', '중력', 1);
        arrow(c, bp.x, bp.y - 6, 0, -1, 64, '#4dd2ff', '떠받치는 힘', 1);
        if (rough === 0) chip(c, bp.x, bp.y - 110, `알짜힘 0 · 속력 ${(Math.abs(ball.v) / PX).toFixed(1)} m/s 그대로`, '#e9f7ec', '#2f8a4a', '800 19px');
      }
      c.restore();
      // 걸레(상자 또는 끄는 중)
      const bx = l.box; c.fillStyle = 'rgba(255,255,255,.85)'; c.strokeStyle = 'rgba(29,36,51,.5)'; c.lineWidth = 2; c.beginPath(); c.roundRect(bx.x, bx.y, bx.w, bx.h, 10); c.fill(); c.stroke();
      if (!cloth) { drawCloth(c, bx.x + 75, bx.y + 26, false); P.txt(c, '걸레', bx.x + 75, bx.y + 58, '#7a5a10', '800 15px'); }
      else drawCloth(c, cloth.x, cloth.y, cloth.on);
      // 마찰 눈금(오른쪽 위)
      const gx = W - 280, gy = 16; c.fillStyle = 'rgba(255,255,255,.9)'; c.strokeStyle = 'rgba(29,36,51,.5)'; c.beginPath(); c.roundRect(gx, gy, 264, 66, 10); c.fill(); c.stroke();
      P.txt(c, rough === 0 ? '마찰 없음' : '레일의 마찰', gx + 132, gy + 24, rough === 0 ? '#2f8a4a' : '#7a3a10', '800 18px');
      c.fillStyle = '#e6e1d6'; c.fillRect(gx + 16, gy + 36, 232, 16); c.fillStyle = rough === 0 ? '#2f8a4a' : '#c46a2a'; c.fillRect(gx + 16, gy + 36, 232 * rough, 16); c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; c.strokeRect(gx + 16, gy + 36, 232, 16);
      if (!ok.size && !rolling && !mode && rough > 0) { const k = 0.5 + 0.5 * Math.sin(t * 3); c.globalAlpha = 0.6 + k * 0.4; chip(c, bx.x + bx.w + 26, bx.y + 32, '← 걸레를 레일 위로 끌어 와 문지르면 마찰이 준다', '#fffbe6', '#7a5a10', '800 18px', 'left'); c.globalAlpha = 1; }
      if (cam > 10 && ball.s > 0) chip(c, W / 2, 30, `골짜기에서 ${((at(l, ball.s).x - l.bx) / PX).toFixed(1)} m`, 'rgba(255,255,255,.92)', '#1d2433', '800 19px');
    }
    function onTurn(l) {
      const hr = reach || 0, full = hr >= h0 - 3, deg = Math.round(th / D), dist = ((at(l, ball.s).x - l.bx) / PX).toFixed(1);
      if (rough > 0) { say(`마찰이 있으니 공이 <b>처음 높이의 ${Math.round(hr / h0 * 100)}%</b>까지만 올라갔다. 오르내리는 동안 마찰이 운동을 방해했기 때문이다. 걸레로 레일을 문질러 <b>마찰을 없애</b> 보자`); return; }
      if (!full) return;
      if (!olds.some((o) => Math.abs(o.th - th) < 2 * D) && olds.length < 3) olds.push({ th, d: ball.s });
      if (!ok.has(1)) { ok.add(1); th1 = th; steps(); say(`마찰이 없으니 공이 오른쪽 빗면(${deg}°)에서 <b>처음 높이</b>까지 올라갔다(골짜기에서 ${dist} m). 이제 손잡이를 끌어 오른쪽 빗면을 <b>더 눕혀</b> 다시 굴려 보자`); return; }
      if (!ok.has(2) && th <= th1 - 5 * D) { ok.add(2); steps(); say(`빗면을 ${deg}°로 눕히니 공이 <b>더 멀리(${dist} m)</b> 가서 <b>같은 높이</b>에 이르렀다. 기울기가 0이 되면 같은 높이에 닿으려고 어디까지 갈까? 빗면을 <b>수평</b>으로 만들어 보자`); return; }
      say(`${deg}° 빗면에서도 <b>처음 높이</b>까지(골짜기에서 ${dist} m). 완만할수록 더 멀리 간다`);
    }
    function steps() {
      const st = [1, 2, 3].find((q) => !ok.has(q)) || 0;
      window.L1.steps(root, st, [...ok]); window.L1.done(root, st === 0);
      const nt = st === 1 ? (rough > 0 ? '① 걸레로 레일을 문질러 마찰 없애기' : '① 공을 눌러 굴리기') : st === 2 ? '② 손잡이를 끌어 빗면 눕히고 다시 굴리기' : st === 3 ? '③ 오른쪽 빗면을 수평으로 만들고 굴리기' : '힘이 없으면 운동은 멈추지 않는다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    function roll() { if (rolling) return; if (ball.s >= 0) place(h0 / L().HL); rolling = true; trail = []; reach = null; flatGo = 0; stopSaid = false; ball.E = GR * hOf(ball.s); h0 = hOf(ball.s); }
    function setTh(v) {
      const nv = v < 2 * D ? 0 : clamp(v, 0, 50 * D); if (nv === th) return; th = nv;
      if (rolling || ball.s > 0) place(h0 / L().HL);
      if (th === 0 && !ok.has(3)) say('오른쪽이 <b>수평</b>이 되었다. 마찰이 없을 때 공은 같은 높이에 닿으려고 얼마나 갈까? 공을 눌러 굴려 보자');
      steps();
    }
    function rub(d) {
      if (rough === 0) return;
      rubbed += d; rough = Math.max(0, 1 - rubbed / 1400); if (rough < 0.04) rough = 0;
      if (rough === 0) { say('레일이 매끈해져 <b>마찰이 없어졌다</b>(생각 속 실험). 공기 저항도 없다고 하자. 이제 <b>공을 눌러</b> 굴려 보자'); steps(); }
      else if (rubbed > 60) say(`문지를수록 레일이 매끈해진다 — 남은 마찰 <b>${Math.round(rough * 100)}%</b>`);
    }
    const S = P.make(stage, {
      draw,
      down(p) {
        const l = L(), w = { x: p.x + cam, y: p.y }, bp = ballPos(l); prev = { x: p.x, y: p.y, moved: 0 }; mode = null;
        if (Math.hypot(w.x - bp.x, w.y - bp.y) < 42) { mode = 'ball'; return; }
        const b = l.box; if (p.x > b.x && p.x < b.x + b.w && p.y > b.y && p.y < b.y + b.h) { mode = 'cloth'; cloth = { x: p.x, y: p.y, on: false }; if (rolling || ball.s >= 0) place(frac); return; } // 걸레질하려면 공을 출발점으로 치운다
        const RL = rampLen(l), ks = Math.min(RL - 10, 420), kp = at(l, ks);
        if (Math.hypot(w.x - kp.x, w.y - kp.y) < 46) { mode = 'tilt'; return; }
        // 오른쪽 빗면 몸통을 잡아도 기울기를 바꾼다
        const dx = w.x - l.bx, dy = l.GY - w.y, s = dx * Math.cos(th) + dy * Math.sin(th), d = Math.abs(-dx * Math.sin(th) + dy * Math.cos(th));
        if (s > 90 && s < RL && d < 40) { mode = 'tilt'; return; }
      },
      move(p, e, held) {
        if (!held || !mode) return;
        const l = L(); prev.moved += Math.hypot(p.x - prev.x, p.y - prev.y);
        if (mode === 'ball' && prev.moved > 8 && !rolling) { const w = { x: p.x + cam, y: p.y }, s = clamp((w.x - l.bx) / Math.cos(AL), -0.95 * l.HL / Math.sin(AL), -0.25 * l.HL / Math.sin(AL)); place(-s * Math.sin(AL) / l.HL); }
        else if (mode === 'tilt') setTh(Math.atan2(l.GY - p.y, Math.max(20, p.x + cam - l.bx)));
        else if (mode === 'cloth') {
          // 레일 위(골짜기 둘레)에 있을 때만 문질러진다
          const wx = p.x + cam, s = wx >= l.bx ? (wx - l.bx) / Math.cos(th) : (wx - l.bx) / Math.cos(AL), rp = at(l, s), onR = Math.abs(p.y - (rp.y - 22)) < 70;
          cloth.on = onR; cloth.x = p.x; cloth.y = onR ? rp.y - 22 : p.y; if (onR && !rolling) rub(Math.abs(p.x - prev.x));
        }
        prev.x = p.x; prev.y = p.y;
      },
      up() {
        if (mode === 'ball') { if (prev.moved <= 8) { if (rolling || ball.s >= 0 || reach != null) { place(h0 / L().HL); say('공을 출발점으로 되돌렸다. 공을 누르면 다시 굴러간다'); } else roll(); } else say('이 높이에서 출발한다. <b>공을 누르면</b> 굴러간다'); }
        else if (mode === 'cloth') { cloth = null; if (rough > 0 && rubbed < 30) say('걸레를 <b>레일 위</b>로 끌어 와서 좌우로 여러 번 문질러 보자'); }
        else if (mode === 'tilt' && !rolling && th > 0) say(`오른쪽 빗면 ${Math.round(th / D)}°. 공을 눌러 굴려 보자`);
        mode = null; steps();
      },
      key(e) {
        const k = e.key;
        if (k === 'ArrowUp') { setTh(th + 5 * D); return true; }
        if (k === 'ArrowDown') { setTh(th - 5 * D); return true; }
        if (k === ' ' || k === 'Enter') { if (rolling) place(h0 / L().HL); else roll(); return true; }
        if (k === 'f' || k === 'F') { rub(350); return true; }
        if (k === '0') { reset(); return true; }
        return false;
      },
    });
    root.querySelector('.gl-reset').addEventListener('click', () => { reset(); S.kick(); });
    reset();
    root._gl = {
      set(o) { if (o.th != null) setTh(o.th * D); if (o.rough != null) { rough = o.rough; rubbed = (1 - rough) * 1400; } if (o.h != null) place(o.h); steps(); S.kick(); },
      roll() { roll(); S.kick(); },
      geo() { const l = L(), bp = ballPos(l), ks = Math.min(rampLen(l) - 10, 420), kp = at(l, ks); return { W: S.W, H: S.H, cam, ball: { x: bp.x - cam, y: bp.y }, knob: { x: kp.x - cam, y: kp.y - 4 }, box: l.box, bx: l.bx - cam, GY: l.GY }; },
      state: () => ({ th: Math.round(th / D), rough: +rough.toFixed(2), rolling, s: Math.round(ball.s), v: Math.round(ball.v), h0: Math.round(h0), reach: reach && Math.round(reach), ok: [...ok], cam: Math.round(cam), done: root.classList.contains('u-done') }),
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Galileo = { mount };
})();
