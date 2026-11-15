/* 1-1 새 차시 표지 둘: 화면을 좌우로 끌면(화살표 키) 값 v(0~1)가 바뀌고 그림이 따라 움직인다. 그림 도구는 xp.js의 XK.
   Cov.mount(root, 종류) → { fit, setActive } · 종류: clock(해를 옮겨 시계 세 가지로 시간 재기) run(선수를 끌어 100 m 달리기)
   시험용: root._cv.set(0~1) · 달리는 빠르기(8 m/s)는 이해를 돕기 위한 예 */
(function () {
  'use strict';
  const X = window.XK, TAU = Math.PI * 2, YL = '#ffd84d', INK = '#fbfcf9', DIM = 'rgba(205,212,230,.75)';
  const SI = ['묘시', '진시', '사시', '오시', '미시', '신시', '유시'];
  // 해 + 빛 번짐
  function sun(c, x, y, r, t) { X.glow(c, x, y, r * 4.2, 'rgba(255,214,110,.45)'); for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + t * 0.2; X.line(c, x + Math.cos(a) * r * 1.3, y + Math.sin(a) * r * 1.3, x + Math.cos(a) * r * (1.7 + 0.15 * Math.sin(t * 3 + i)), y + Math.sin(a) * r * (1.7 + 0.15 * Math.sin(t * 3 + i)), 'rgba(255,220,120,.7)', 3); } X.ball(c, x, y, r, '#ffd84d', '#f29a1d', '#fffbe0'); }
  function sky(c, W, H, h) { // h: 해 높이 0(지평선)~1(한낮)
    const top = `rgb(${Math.round(X.lerp(52, 70, h))},${Math.round(X.lerp(60, 140, h))},${Math.round(X.lerp(110, 220, h))})`, low = `rgb(${Math.round(X.lerp(245, 180, h))},${Math.round(X.lerp(150, 215, h))},${Math.round(X.lerp(110, 240, h))})`;
    X.vgrad(c, 0, 0, W, H, [top, low]);
  }
  function hills(c, W, H, gy, h) {
    [[0.55, '#3d6b4a', 0.9], [0.35, '#2f5a3c', 1.3]].forEach(([k, col, f]) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 8) c.lineTo(x, gy - 18 * k * 3 - Math.sin(x / W * Math.PI * f * 2 + k * 5) * 22 * k * 2); c.lineTo(W, H); c.fill(); });
    X.vgrad(c, 0, gy, W, H - gy, ['#6f8f4e', '#4f6b36']); c.fillStyle = `rgba(0,0,0,${0.25 * (1 - h)})`; c.fillRect(0, 0, W, H);
  }
  // 앙부일구(오목한 솥 모양 해시계): 앞에서 비스듬히 본 모습, 그림자 끝 sx(0~1 = 묘시~유시)
  function angbu(c, cx, cy, R, u, t) {
    X.shadow(c, cx, cy + R * 1.18, R * 1.3, R * 0.16, 0.35);
    c.fillStyle = '#8b8f97'; X.rr(c, cx - R * 1.15, cy + R * 0.95, R * 2.3, R * 0.22, 6); c.fill();
    [-0.7, -0.25, 0.25, 0.7].forEach((k) => { c.strokeStyle = '#3c3326'; c.lineWidth = R * 0.07; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx + k * R, cy + R * 0.55); c.quadraticCurveTo(cx + k * R * 1.25, cy + R * 0.8, cx + k * R * 1.15, cy + R * 0.98); c.stroke(); });
    const bg = c.createLinearGradient(cx - R, 0, cx + R, 0); bg.addColorStop(0, '#5a4630'); bg.addColorStop(0.45, '#a88a5c'); bg.addColorStop(1, '#4a3a26');
    c.fillStyle = bg; c.beginPath(); c.ellipse(cx, cy, R, R * 0.32, 0, 0, Math.PI); c.lineTo(cx - R, cy); c.fill(); c.beginPath(); c.moveTo(cx - R, cy); c.quadraticCurveTo(cx - R, cy + R * 0.85, cx, cy + R * 0.88); c.quadraticCurveTo(cx + R, cy + R * 0.85, cx + R, cy); c.fill();
    const ig = c.createRadialGradient(cx - R * 0.2, cy - R * 0.05, 4, cx, cy, R); ig.addColorStop(0, '#e9d7a8'); ig.addColorStop(1, '#a8874f'); c.fillStyle = ig; c.beginPath(); c.ellipse(cx, cy, R * 0.94, R * 0.29, 0, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(70,50,20,.55)'; c.lineWidth = 1.5; for (let i = 0; i < 7; i++) { const x = cx - R * 0.8 + i * R * 1.6 / 6; c.beginPath(); c.moveTo(x, cy - R * 0.2 * Math.cos((i - 3) / 3.3)); c.quadraticCurveTo(x + (x - cx) * 0.06, cy, x, cy + R * 0.22 * Math.cos((i - 3) / 3.3)); c.stroke(); }
    c.beginPath(); c.ellipse(cx, cy, R * 0.8, R * 0.18, 0, 0, TAU); c.stroke(); c.beginPath(); c.ellipse(cx, cy, R * 0.55, R * 0.12, 0, 0, TAU); c.stroke();
    c.strokeStyle = '#2b2116'; c.lineWidth = 4; c.beginPath(); c.ellipse(cx, cy, R * 0.94, R * 0.29, 0, 0, TAU); c.stroke();
    const tx = cx - R * 0.8 + u * R * 1.6, ty = cy + R * 0.03 * Math.sin(u * Math.PI);
    c.strokeStyle = 'rgba(40,28,12,.7)'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(cx, cy - R * 0.25); c.lineTo(tx, ty); c.stroke();
    X.glow(c, tx, ty, 16, 'rgba(255,90,40,.6)');
    c.strokeStyle = '#d8c48a'; c.lineWidth = 4; c.beginPath(); c.moveTo(cx, cy - R * 0.28); c.lineTo(cx, cy - R * 0.02); c.stroke();
    SI.forEach((s, i) => X.txt(c, s, cx - R * 0.8 + i * R * 1.6 / 6, cy - R * 0.36, i === Math.round(u * 6) ? YL : 'rgba(255,255,255,.85)', i === Math.round(u * 6) ? '800 17px' : '600 15px'));
  }
  // 달리는 사람(발이 y, 단계 p)
  function runner(c, x, y, p, s, col, bob) {
    const hip = [x, y - 52 * s - bob], sh = [x + 9 * s, y - 92 * s - bob];
    const limb = (o, a1, a2, l1, l2, w) => { const k = [o[0] + Math.sin(a1) * l1, o[1] + Math.cos(a1) * l1], e = [k[0] + Math.sin(a2) * l2, k[1] + Math.cos(a2) * l2]; c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(o[0], o[1]); c.lineTo(k[0], k[1]); c.lineTo(e[0], e[1]); c.stroke(); };
    const sw = Math.sin(p), sw2 = Math.sin(p + Math.PI);
    limb(hip, sw2 * 0.8, sw2 * 0.8 - 0.9 - Math.max(0, -sw2) * 0.6, 28 * s, 28 * s, 10 * s); limb(sh, -sw2 * 0.9, -sw2 * 0.9 + 1.4, 20 * s, 18 * s, 7 * s);
    c.strokeStyle = '#e4572e'; c.lineWidth = 17 * s; c.beginPath(); c.moveTo(hip[0], hip[1]); c.lineTo(sh[0], sh[1]); c.stroke(); c.strokeStyle = '#1d4e86'; c.lineWidth = 18 * s; c.beginPath(); c.moveTo(hip[0], hip[1] + 4 * s); c.lineTo(hip[0] + 2 * s, hip[1] - 6 * s); c.stroke();
    limb(hip, sw * 0.8, sw * 0.8 - 0.9 - Math.max(0, -sw) * 0.6, 28 * s, 28 * s, 10 * s); limb(sh, -sw * 0.9, -sw * 0.9 + 1.4, 20 * s, 18 * s, 7 * s);
    X.ball(c, sh[0] + 6 * s, sh[1] - 16 * s, 11 * s, '#f2c79a', '#b07a48', '#fff1e0');
    c.fillStyle = '#fff'; X.rr(c, x - 4 * s, y - 84 * s - bob, 22 * s, 16 * s, 3); c.fill(); X.txt(c, '7', x + 7 * s, y - 71 * s - bob, '#1d2433', `800 ${Math.round(13 * s)}px`);
  }
  const KINDS = {
    // 시간 재기: 해의 움직임 → 앙부일구의 그림자 → 세슘 원자시계 (교과서 16쪽)
    clock: {
      draw(c, P, W, H, v, t) {
        const k = Math.min(2, Math.floor(v * 3)), u = X.clamp(v * 3 - k, 0, 1), cx = W / 2, gy = H * 0.74;
        if (k < 2) {
          const a = Math.PI * (1 - u), R = Math.min(W * 0.4, H * 0.55), sx = cx + Math.cos(a) * R, sy = gy - Math.sin(a) * R * 0.95, h = Math.sin(a);
          sky(c, W, H, h); X.stars(c, W, H * 0.5, t, 40, 3, Math.max(0, 0.6 - h * 2));
          c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2; c.setLineDash([4, 9]); c.beginPath(); c.ellipse(cx, gy, R, R * 0.95, 0, Math.PI, TAU); c.stroke(); c.setLineDash([]);
          sun(c, sx, sy, 22, t); [[0.18, 0.22], [0.7, 0.16]].forEach(([q, y], i) => { const x = ((q * W + t * (8 + i * 5)) % (W + 160)) - 80; c.fillStyle = 'rgba(255,255,255,.75)'; [[0, 0, 26], [24, 6, 20], [-22, 8, 18], [8, 12, 22]].forEach(([dx, dy, r]) => { c.beginPath(); c.arc(x + dx, H * y + dy, r, 0, TAU); c.fill(); }); });
          hills(c, W, H, gy, h);
          X.txt(c, '동', W * 0.06, gy + 30, INK, '800 18px'); X.txt(c, '서', W * 0.94, gy + 30, INK, '800 18px');
          if (k === 0) {
            const px = cx, py = gy + 10, L = 60 / Math.max(0.15, h), dir = -Math.sign(Math.cos(a)) || 1;
            c.strokeStyle = 'rgba(20,30,15,.5)'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(px, py); c.lineTo(px + dir * Math.min(L, W * 0.4) * Math.abs(Math.cos(a)) + dir * 6, py + 8); c.stroke();
            c.strokeStyle = '#6b4a2b'; c.lineWidth = 7; c.beginPath(); c.moveTo(px, py); c.lineTo(px, py - 70); c.stroke();
            X.pill(c, W - 110, 30, `해가 뜬 지 ${Math.round(u * 12)}시간쯤`, 'rgba(29,36,51,.8)', YL, '700 17px');
          } else angbu(c, cx, H * 0.5, Math.min(W * 0.27, H * 0.3), u, t);
        } else {
          X.vgrad(c, 0, 0, W, H, ['#0d1424', '#1b2440']);
          const tx = cx, ty = H * 0.34, L = W * 0.62, r = H * 0.13;
          const mg = c.createLinearGradient(0, ty - r, 0, ty + r); mg.addColorStop(0, '#d7dde8'); mg.addColorStop(0.5, '#8a93a6'); mg.addColorStop(1, '#4b5263');
          c.fillStyle = mg; X.rr(c, tx - L / 2, ty - r, L, 2 * r, r); c.fill();
          c.fillStyle = 'rgba(8,12,24,.85)'; X.rr(c, tx - L * 0.32, ty - r * 0.55, L * 0.64, r * 1.1, r * 0.5); c.fill();
          X.glow(c, tx, ty, r * 1.4, 'rgba(120,200,255,.35)');
          const R = X.rnd(9); for (let i = 0; i < 22; i++) { const x = tx - L * 0.28 + ((R() * L * 0.56 + t * 40 * (0.5 + R())) % (L * 0.56)), y = ty + (R() - 0.5) * r * 0.8; X.ball(c, x, y, 5, '#ffb08a', '#b8321c'); }
          c.strokeStyle = YL; c.lineWidth = 3; c.beginPath(); for (let x = 0; x <= W * 0.8; x += 3) { const yy = H * 0.6 + Math.sin(x * 0.16 - t * 22) * 14; if (!x) c.moveTo(W * 0.1 + x, yy); else c.lineTo(W * 0.1 + x, yy); } c.stroke();
          X.txt(c, '원자가 내는 빛의 떨림', W * 0.1, H * 0.6 - 22, DIM, '700 15px', 'left');
          const n = Math.floor(t * 9192631770 % 1e10);
          c.fillStyle = 'rgba(0,0,0,.55)'; X.rr(c, cx - 150, H * 0.68, 300, 44, 10); c.fill();
          X.txt(c, String(n).padStart(10, '0'), cx, H * 0.68 + 33, '#7dffb0', '700 30px');
          X.pill(c, W - 150, 30, '9,192,631,770번 떨리면 1초', 'rgba(29,36,51,.8)', YL, '700 16px');
        }
        c.fillStyle = 'rgba(12,16,28,.78)'; c.fillRect(0, H - 30, W, 30);
        ['해의 움직임', '앙부일구', '원자시계'].forEach((s, i) => {
          const x = W * (0.1 + 0.33 * i), y = H - 15; if (i) X.line(c, x - W * 0.33 + 100, y, x - 14, y, i <= k ? YL : 'rgba(185,194,216,.45)', 3);
          X.ball(c, x, y, i === k ? 8 : 6, i <= k ? YL : '#8790a6', i <= k ? '#b8860b' : '#4b5263'); X.txt(c, s, x + 14, y + 5, i === k ? YL : '#c9d0e0', i === k ? '800 15px' : '600 14px', 'left');
        });
      },
      hint: (W, H) => [W * 0.25, H * 0.45],
      say(v, moved) {
        const k = Math.min(2, Math.floor(v * 3));
        return [['해와 달의 <b>움직임</b>으로 하루와 한 달을 헤아렸다', '앙부일구 — 해의 <b>그림자</b> 끝이 가리키는 눈금으로 시각을 읽었다', '세슘 원자시계 — <b>3000만 년</b>에 1초쯤 어긋날 만큼 정밀하다'][k],
          moved ? ['더 끌면 해시계가 나온다', '한 번 더 끌어 오늘날의 시계로', '옛 시계와 무엇이 다를까?'][k] : '오른쪽으로 끌어 해를 서쪽으로 옮기자', k === 2];
      },
    },
    // 달리기: 길이와 시간을 함께 재면 속력 (교과서 21쪽)
    run: {
      draw(c, P, W, H, v, t) {
        const T = v * 12.5, d = 8 * T, x0 = W * 0.09, x1 = W * 0.91, ty = H * 0.7, x = x0 + (x1 - x0) * d / 100, moving = v > 0 && v < 1;
        X.vgrad(c, 0, 0, W, H * 0.42, ['#3c6fb5', '#9cc7ef']);
        X.vgrad(c, 0, H * 0.2, W, H * 0.24, ['#3b4252', '#262c3a']);
        const R = X.rnd(4); for (let i = 0; i < 160; i++) { const cx = R() * W, cy = H * 0.24 + R() * H * 0.17, j = Math.sin(t * 6 + i) * (d > 90 ? 3 : 1); c.fillStyle = ['#e4572e', '#ffd84d', '#fbfcf9', '#4a90d9', '#2f9e5b'][i % 5]; c.beginPath(); c.arc(cx, cy + j, 3.2, 0, TAU); c.fill(); }
        X.vgrad(c, 0, H * 0.42, W, H * 0.12, ['#4f8f45', '#3e7a37']);
        X.vgrad(c, 0, H * 0.54, W, H * 0.46, ['#c4553a', '#a9432c']);
        for (let i = 0; i < 4; i++) X.line(c, 0, H * 0.58 + i * H * 0.1, W, H * 0.58 + i * H * 0.1, 'rgba(255,255,255,.8)', 2);
        for (let m = 0; m <= 100; m += 10) { const xx = x0 + (x1 - x0) * m / 100; X.line(c, xx, H * 0.56, xx, H * 0.6, 'rgba(255,255,255,.9)', 2); if (!(m % 25)) X.txt(c, `${m} m`, xx, H - 10, INK, '800 15px'); }
        for (let j = 0; j < 8; j++) { c.fillStyle = j % 2 ? '#fff' : '#1d2433'; c.fillRect(x1 - 8, H * 0.58 + j * H * 0.04, 8, H * 0.04); c.fillStyle = j % 2 ? '#1d2433' : '#fff'; c.fillRect(x1, H * 0.58 + j * H * 0.04, 8, H * 0.04); }
        X.line(c, x0, H * 0.58, x0, H * 0.9, '#fff', 4);
        if (v < 1) { c.strokeStyle = '#fff'; c.lineWidth = 2; c.beginPath(); c.moveTo(x1 + 4, ty - 70); c.quadraticCurveTo(x1 + 4 + Math.sin(t * 4) * 4, ty - 40, x1 + 4, ty - 10); c.stroke(); }
        for (let i = 1; i <= 5 && moving; i++) { const px = x - i * 14, q = (t * 3 + i * 0.2) % 1; c.fillStyle = `rgba(230,200,170,${0.35 - i * 0.06})`; c.beginPath(); c.arc(px, ty - 4 - q * 8, 6 + i * 2, 0, TAU); c.fill(); }
        X.shadow(c, x + 4, ty + 2, 26, 6, 0.3);
        runner(c, x, ty, moving ? d * 1.2 : 0.3 * Math.sin(t * 2), 1.05, '#6b4430', moving ? Math.abs(Math.sin(d * 1.2)) * 5 : Math.sin(t * 2) * 1.5);
        c.fillStyle = 'rgba(16,20,32,.85)'; X.rr(c, W * 0.4, 62, W * 0.58, 50, 12); c.fill();
        X.txt(c, `길이 ${d.toFixed(0)} m`, W * 0.54, 96, INK, '800 24px'); X.txt(c, `시간 ${T.toFixed(1)} s`, W * 0.84, 96, '#7dffb0', '800 24px');
        X.glow(c, W * 0.69, 87, 14, 'rgba(228,87,46,.6)'); X.ball(c, W * 0.69, 87, 6 + Math.abs(Math.sin(t * 3)) * 2, '#e4572e', '#8f2a1a');
      },
      hint: (W, H) => [W * 0.1, H * 0.62],
      say(v, moved) {
        const T = v * 12.5, d = 8 * T;
        return [v < 0.02 ? '출발선 — <b>길이</b>와 <b>시간</b>을 함께 잴 준비' : `${d.toFixed(0)} m ÷ ${T.toFixed(1)} s = 1초에 <b>8 m</b>씩`,
          moved ? (v < 1 ? '결승선까지 끌어 보자' : '100 m를 12.5초에 달렸다') : '선수를 오른쪽으로 끌어 달리게 하자', v >= 1];
      },
    },
  };
  function mount(root, kind) {
    const K = KINDS[kind], P = window.Play;
    const stage = root.querySelector('.au-stage'), out = root.querySelector('.au-out'), now = root.querySelector('.au-now');
    let v = 0, v0 = 0, x0 = 0, t = 0, moved = false;
    function set(x) { v = Math.max(0, Math.min(1, x)); const [o, n, done] = K.say(v, moved); out.innerHTML = o; now.textContent = n; now.classList.toggle('done', !!done); }
    const S = P.make(stage, {
      draw(c, W, H, dt) { t += dt; c.clearRect(0, 0, W, H); K.draw(c, P, W, H, v, t); if (!moved) { const [hx, hy] = K.hint(W, H); X.hint(c, hx, hy, t, 1, 0, '오른쪽으로 끌기', 150); } },
      down(p) { x0 = p.x; v0 = v; },
      move(p, e, held) { if (held) { moved = true; set(v0 + (p.x - x0) / S.W * 1.3); } },
      key(e) { const d = { ArrowLeft: -0.05, ArrowRight: 0.05 }[e.key]; if (!d) return false; moved = true; set(v + d); return true; },
    });
    set(0);
    root._cv = { set: (x) => { moved = true; set(x); S.redraw(); } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Cov = { mount };
})();
