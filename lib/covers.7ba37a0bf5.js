/* 1-2 새 차시 표지 둘: 화면을 좌우로 끌면(화살표 키) 값 v(0~1)가 바뀌고 그림이 따라 움직인다. 그림 도구는 xp.js의 XK.
   Cov.mount(root, 종류) → { fit, setActive } · 종류: zone(깃발을 동쪽으로 옮겨 시각 견주기) bits(목소리를 끊어 읽고 0과 1로 보내기)
   시험용: root._cv.set(0~1) · 사이 경도의 시각과 파형·0과 1의 값은 이해를 돕기 위한 예 */
(function () {
  'use strict';
  const X = window.XK, TAU = Math.PI * 2, YL = '#ffd84d', DIM = 'rgba(205,212,230,.8)', INK = '#fbfcf9';
  // 바늘 시계(앞면 명암 + 눈금): h는 시(소수), t는 초침
  function clock(c, x, y, r, h, t, label, col) {
    X.shadow(c, x + 4, y + r + 8, r * 0.8, 6, 0.4);
    X.ball(c, x, y, r + 7, col, '#2b3142', '#ffffff'); const fg = c.createRadialGradient(x - r * 0.3, y - r * 0.3, 2, x, y, r); fg.addColorStop(0, '#ffffff'); fg.addColorStop(1, '#dfe4ee'); c.fillStyle = fg; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    for (let i = 0; i < 12; i++) { const a = TAU * i / 12; X.line(c, x + Math.cos(a) * r * (i % 3 ? 0.84 : 0.76), y + Math.sin(a) * r * (i % 3 ? 0.84 : 0.76), x + Math.cos(a) * r * 0.94, y + Math.sin(a) * r * 0.94, '#1d2433', i % 3 ? 2 : 3.5); }
    const ha = TAU * (h % 12) / 12 - Math.PI / 2, ma = TAU * (h % 1) - Math.PI / 2, sa = TAU * (t % 60) / 60 - Math.PI / 2;
    X.line(c, x, y, x + Math.cos(ha) * r * 0.5, y + Math.sin(ha) * r * 0.5, '#1d2433', 6); X.line(c, x, y, x + Math.cos(ma) * r * 0.76, y + Math.sin(ma) * r * 0.76, '#1d2433', 4);
    X.line(c, x, y, x + Math.cos(sa) * r * 0.84, y + Math.sin(sa) * r * 0.84, '#e4572e', 2); c.fillStyle = '#e4572e'; c.beginPath(); c.arc(x, y, 4, 0, TAU); c.fill();
    X.pill(c, x, y + r + 26, label, 'rgba(16,20,32,.85)', INK, '700 15px');
  }
  const hm = (h) => { const H = Math.floor(h + 1e-6), m = Math.round((h - H) * 60); return `${H < 12 ? '오전' : H === 12 ? '낮' : '오후'} ${H > 12 ? H - 12 : H}시${m ? ` ${m}분` : ''}`; };
  const BITS = '0110100111010010110101101';
  const KINDS = {
    // 표준시: 북극 위에서 내려다본 지구. 그리니치(경도 0°)에서 동경 135°까지 (교과서 30쪽)
    zone: {
      // 북극에서 내려다본 대륙(경도, 위도) — 적도 밖은 잘린다. 모양은 크게 간추린 것
      LAND: [
        [[-17, 15], [-17, 21], [-10, 30], [-6, 36], [-9, 37], [-9, 43], [-1, 46], [-4, 48], [2, 51], [5, 53], [8, 57], [5, 62], [15, 69], [25, 71], [40, 67], [44, 68], [60, 69], [70, 73], [80, 73], [100, 77], [115, 73], [130, 71], [150, 71], [170, 70], [180, 67], [178, 64], [165, 60], [160, 55], [155, 59], [143, 59], [140, 54], [135, 43], [130, 42], [129, 35], [126, 35], [126, 38], [122, 40], [118, 38], [121, 32], [121, 28], [117, 23], [110, 21], [108, 16], [109, 11], [105, 9], [100, 13], [100, 3], [104, 1], [98, 8], [98, 16], [94, 17], [91, 22], [86, 20], [80, 15], [78, 8], [73, 18], [72, 21], [67, 25], [57, 25], [56, 22], [52, 17], [45, 13], [43, 13], [51, 11], [42, 0], [40, -10], [20, -35], [12, -15], [9, 4], [5, 5], [-8, 5], [-15, 11]],
        [[-168, 66], [-162, 70], [-140, 70], [-125, 70], [-110, 68], [-95, 72], [-85, 70], [-80, 63], [-90, 57], [-82, 52], [-78, 60], [-65, 60], [-60, 55], [-55, 52], [-66, 45], [-70, 42], [-76, 35], [-81, 31], [-80, 25], [-82, 28], [-90, 30], [-97, 28], [-97, 22], [-87, 21], [-83, 10], [-78, 8], [-62, 11], [-50, 0], [-35, -8], [-70, -30], [-81, -3], [-86, 12], [-105, 20], [-110, 23], [-118, 33], [-124, 40], [-124, 48], [-135, 58], [-150, 60], [-160, 58], [-165, 62]],
        [[-55, 60], [-45, 60], [-20, 70], [-20, 82], [-60, 82], [-73, 78], [-55, 68]],
        [[-5, 50], [1, 51], [-2, 57], [-5, 58], [-6, 55], [-3, 54], [-5, 52]],
        [[130, 31], [135, 34], [140, 35], [142, 40], [141, 45], [145, 44], [141, 41], [139, 37], [133, 33]],
      ],
      ISLE: [[[95, 6], [106, -6], [104, -6], [95, 2]], [[109, 1], [117, 7], [119, 1], [116, -4], [110, -3]], [[120, 18], [124, 13], [126, 7], [122, 8], [120, 14]], [[-24, 64], [-18, 66], [-13, 65], [-18, 63]], [[142, 46], [143, 54], [141, 52]], [[80, 9], [82, 7], [80, 6]]],
      SEA: [[[-5, 36], [0, 38.5], [3, 43], [9, 44], [12, 44], [16, 41], [19, 40], [23, 37], [28, 41], [36, 36], [35, 32], [30, 31], [20, 31], [10, 37], [0, 36]], [[28, 42], [28, 46], [33, 46], [41, 42], [36, 41]], [[47, 37], [50, 45], [53, 45], [54, 37]], [[-95, 58], [-92, 57], [-82, 52], [-78, 56], [-80, 63], [-88, 64], [-94, 61]]],
      CITY: [['런던', 0, 51.5], ['카이로', 31, 30], ['뉴델리', 77, 28.6], ['서울', 127, 37.5]],
      draw(c, P, W, H, v, t) {
        const lon = v * 135, cx = W * 0.5, cy = H * 0.5, R = Math.min(W * 0.28, H * 0.4), th = (d) => Math.PI / 2 - d * Math.PI / 180;
        const at = (d, la, k = 1) => { const r = R * (90 - la) / 90 * k; return [cx + Math.cos(th(d)) * r, cy + Math.sin(th(d)) * r]; };
        X.vgrad(c, 0, 0, W, H, ['#070b18', '#121a33']); X.stars(c, W, H, t, 80, 5);
        // 햇빛은 아래(그리니치 쪽)에서 온다
        const sg = c.createLinearGradient(0, H, 0, H * 0.55); sg.addColorStop(0, 'rgba(255,214,110,.35)'); sg.addColorStop(1, 'rgba(255,214,110,0)'); c.fillStyle = sg; c.fillRect(0, H * 0.55, W, H * 0.45);
        for (let k = 0; k < 5; k++) { const x = cx - R * 0.8 + k * R * 0.4, q = (t * 0.6 + k * 0.2) % 1; X.arrow(c, x, H - 2 - q * 10, x, H - 22 - q * 10, `rgba(255,214,110,${0.7 * (1 - q)})`, 2, 7); }
        X.glow(c, cx, cy, R * 1.22, 'rgba(110,170,255,.28)');
        { const og = c.createRadialGradient(cx, cy + R * 0.55, R * 0.05, cx, cy, R * 1.05); og.addColorStop(0, '#6fb8f0'); og.addColorStop(0.45, '#2f7fc8'); og.addColorStop(1, '#0d2c55'); c.fillStyle = og; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.fill(); }
        c.save(); c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.clip();
        this.LAND.forEach((L, li) => { const lg = c.createRadialGradient(cx, cy, R * 0.1, cx, cy, R); lg.addColorStop(0, '#a9cf86'); lg.addColorStop(1, '#4f8f45'); c.fillStyle = li === 2 ? '#eef4f8' : lg; c.strokeStyle = 'rgba(20,60,20,.5)'; c.lineWidth = 1; c.beginPath(); L.forEach(([d, la], i) => { const [x, y] = at(d, la); if (!i) c.moveTo(x, y); else c.lineTo(x, y); }); c.closePath(); c.fill(); c.stroke(); });
        const poly = (L) => { c.beginPath(); L.forEach(([d, la], i) => { const [x, y] = at(d, la); if (!i) c.moveTo(x, y); else c.lineTo(x, y); }); c.closePath(); };
        this.ISLE.forEach((L) => { poly(L); c.fillStyle = '#7db463'; c.fill(); });
        this.SEA.forEach((L) => { poly(L); c.fillStyle = '#2a76bd'; c.fill(); });
        c.fillStyle = 'rgba(240,248,255,.92)'; c.beginPath(); c.arc(cx, cy, R * 0.12, 0, TAU); c.fill();
        // 햇빛은 아래(그리니치 쪽)에서 온다: 위쪽 반이 밤. 낮·밤 경계(새벽·저녁)는 가로줄
        const night = c.createLinearGradient(0, cy - R, 0, cy + R * 0.06); night.addColorStop(0, 'rgba(4,7,20,.82)'); night.addColorStop(0.9, 'rgba(4,7,20,.74)'); night.addColorStop(1, 'rgba(4,7,20,0)'); c.fillStyle = night; c.fillRect(cx - R, cy - R, 2 * R, R * 1.06);
        const day = c.createLinearGradient(0, cy + R, 0, cy); day.addColorStop(0, 'rgba(255,240,190,.22)'); day.addColorStop(1, 'rgba(255,240,190,0)'); c.fillStyle = day; c.fillRect(cx - R, cy, 2 * R, R);
        c.restore();
        for (let d = 0; d < 360; d += 15) { const a = th(d); X.line(c, cx + Math.cos(a) * R * 0.12, cy + Math.sin(a) * R * 0.12, cx + Math.cos(a) * R, cy + Math.sin(a) * R, d % 45 ? 'rgba(255,255,255,.12)' : 'rgba(255,255,255,.3)', 1); }
        [[45, '45°E'], [90, '90°E'], [135, '135°E'], [-90, '90°W'], [180, '180°']].forEach(([d, n]) => { const a = th(d); X.txt(c, n, cx + Math.cos(a) * (R + 16), cy + Math.sin(a) * (R + 16) + 4, 'rgba(205,212,230,.75)', '700 10px'); });
        X.line(c, cx, cy, ...at(0, -8), '#ffd84d', 3);
        X.txt(c, '0° 그리니치', cx - 8, cy + R + 16, YL, '800 12px', 'right'); X.txt(c, '낮', cx + R * 0.62, cy + R * 0.78, 'rgba(255,240,190,.9)', '800 12px'); X.txt(c, '밤', cx - R * 0.62, cy - R * 0.72, 'rgba(205,212,230,.9)', '800 12px');
        // 도시
        this.CITY.forEach(([n, d, la]) => { const [x, y] = at(d, la); if (y < cy) X.glow(c, x, y, 9, 'rgba(255,220,120,.7)'); X.ball(c, x, y, 3.5, y < cy ? '#ffe28a' : '#fff', '#8a93a6'); X.txt(c, n, x + 6, y + 4, '#fff', '700 10px', 'left'); });
        // 깃발까지 호와 깃발
        c.strokeStyle = 'rgba(255,216,77,.9)'; c.lineWidth = 4; c.beginPath(); c.arc(cx, cy, R * 0.3, th(0), th(lon), true); c.stroke();
        X.txt(c, `${lon.toFixed(0)}°`, ...at(lon / 2, 64, 1), YL, '800 12px');
        const [fx, fy] = at(lon, 35);
        X.line(c, fx, fy, fx, fy - 34, '#e9edf5', 2.5); const wv = Math.sin(t * 5) * 3; c.fillStyle = '#e4572e'; c.beginPath(); c.moveTo(fx, fy - 34); c.quadraticCurveTo(fx + 12, fy - 30 + wv, fx + 24, fy - 27); c.lineTo(fx, fy - 18); c.closePath(); c.fill();
        X.ball(c, fx, fy, 5, '#ffd84d', '#b8860b');
        const r = Math.min(W * 0.1, H * 0.15);
        clock(c, W * 0.1 + 2, cy - 6, r, 12, t, '그리니치 낮 12시', '#c9a227');
        clock(c, W * 0.9 - 2, cy - 6, r, 12 + lon / 15, t, `깃발 ${hm(12 + lon / 15)}`, '#e4572e');
        X.txt(c, '북극 위에서 내려다본 지구', cx, 16, DIM, '700 12px');
      },
      hint(W, H, v) { const R = Math.min(W * 0.28, H * 0.4), r = R * 55 / 90; return { x: W * 0.5 + 6, y: H * 0.5 + r, dx: 1, dy: -0.35, dist: 70 }; },
      say(v, moved) {
        const lon = v * 135, h = lon / 15;
        return [v < 0.02 ? '경도 0° 그리니치 — 세계 시각의 <b>기준</b>' : v >= 1 ? '동경 135° — 우리나라 표준시의 기준 경도. 그리니치보다 <b>9시간</b> 빠르다' : `동경 ${lon.toFixed(0)}° — 그리니치보다 <b>${h.toFixed(1)}시간</b> 빠르다(경도 15°마다 1시간)`,
          moved ? (v < 1 ? '동경 135°까지 끌어 보자' : '우리나라 표준시') : '오른쪽으로 끌어 깃발을 동쪽으로', v >= 1];
      },
    },
    // 목소리(아날로그 신호)를 끊어 읽고 0과 1로 보낸다 (교과서 33~34쪽)
    bits: {
      draw(c, P, W, H, v, t) {
        X.vgrad(c, 0, 0, W, H, ['#10162a', '#1c2542']);
        const k = Math.min(1, v * 2), s = Math.max(0, v * 2 - 1), x0 = W * 0.2, x1 = W * 0.64, y = H * 0.46, A = H * 0.17, n = 8, w = (x1 - x0) / n;
        const f = (x) => Math.sin(x * 0.03 + t * 1.6) * 0.6 + Math.sin(x * 0.071 - t * 0.9) * 0.32;
        // 마이크
        const mx = W * 0.09, my = H * 0.44;
        for (let i = 1; i <= 3; i++) { const q = (t * 0.9 + i / 3) % 1; c.strokeStyle = `rgba(150,210,255,${0.6 * (1 - q)})`; c.lineWidth = 2.5; c.beginPath(); c.arc(mx, my - 8, 26 + q * 26, -0.9, 0.9); c.stroke(); }
        X.line(c, mx, my + 34, mx, my + 70, '#8a93a6', 5); X.line(c, mx - 18, my + 72, mx + 18, my + 72, '#8a93a6', 5);
        c.strokeStyle = '#8a93a6'; c.lineWidth = 3; c.beginPath(); c.arc(mx, my + 6, 26, 0.1, Math.PI - 0.1); c.stroke();
        const mg = c.createLinearGradient(mx - 16, 0, mx + 16, 0); mg.addColorStop(0, '#5b6578'); mg.addColorStop(0.5, '#dfe4ee'); mg.addColorStop(1, '#5b6578'); c.fillStyle = mg; X.rr(c, mx - 15, my - 36, 30, 58, 15); c.fill();
        c.strokeStyle = 'rgba(29,36,51,.5)'; c.lineWidth = 1; for (let i = 0; i < 5; i++) X.line(c, mx - 13, my - 26 + i * 8, mx + 13, my - 26 + i * 8, 'rgba(29,36,51,.45)', 1);
        X.txt(c, '마이크', mx, my + 96, DIM, '700 14px');
        // 신호 화면
        c.fillStyle = 'rgba(0,0,0,.45)'; X.rr(c, x0 - 12, y - A - 34, x1 - x0 + 24, 2 * A + 68, 10); c.fill(); X.grid(c, x0 - 12, y - A - 34, x1 - x0 + 24, 2 * A + 68, w, 'rgba(120,160,220,.12)');
        c.strokeStyle = `rgba(120,200,255,${1 - k * 0.55})`; c.lineWidth = 3; c.beginPath(); for (let x = x0; x <= x1; x += 2) { const yy = y - f(x) * A; if (x === x0) c.moveTo(x, yy); else c.lineTo(x, yy); } c.stroke();
        const codes = [];
        for (let i = 0; i < n; i++) {
          const xx = x0 + (i + 0.5) * w, lv = X.clamp(Math.floor((f(xx) + 1) * 4), 0, 7), q = (lv - 3.5) / 4, a = X.clamp(k * n - i, 0, 1);
          if (a <= 0) continue;
          c.fillStyle = `rgba(255,216,77,${0.35 * a})`; c.fillRect(xx - w * 0.38, Math.min(y, y - q * A), w * 0.76, Math.abs(q * A) || 2);
          X.ball(c, xx, y - q * A, 5, '#ffd84d', '#b8860b');
          const code = lv.toString(2).padStart(3, '0'); if (a >= 1) codes.push(code);   // 여덟 단계(000~111) — 세 자리로 넘치지 않는다
          if (k > 0.6) X.txt(c, code, xx, y + A + 26, `rgba(255,216,77,${a})`, '800 14px');
        }
        X.txt(c, k < 0.3 ? '연속으로 변하는 목소리 신호' : '일정한 간격으로 끊어 읽은 값', (x0 + x1) / 2, y - A - 12, DIM, '700 15px');
        // 휴대 전화
        const px = W * 0.87, py = H * 0.46, pw = W * 0.12, ph = H * 0.5;
        X.shadow(c, px + 4, py + ph / 2 + 10, pw * 0.5, 6, 0.4);
        c.fillStyle = '#0b0e18'; c.strokeStyle = '#8a93a6'; c.lineWidth = 2.5; X.rr(c, px - pw / 2, py - ph / 2, pw, ph, 12); c.fill(); c.stroke();
        X.vgrad(c, px - pw / 2 + 5, py - ph / 2 + 12, pw - 10, ph - 24, ['#22305a', '#121a33']);
        if (s > 0) {
          for (let i = 0; i < 10; i++) { const u = ((t * 0.5 + i / 10) % 1) * s, xx = X.lerp(x1 + 22, px - pw / 2 - 6, u), yy = y - Math.sin(u * Math.PI) * 40; X.txt(c, BITS[i], xx, yy + 6, YL, '800 18px'); }
          for (let i = 0; i < 6; i++) { const h = Math.abs(f(x0 + (i * 2 + 0.5) * w)) * ph * 0.3 * s + 4; c.fillStyle = '#7dffb0'; c.fillRect(px - pw / 2 + 10 + i * (pw - 20) / 6, py - h / 2, (pw - 20) / 6 - 3, h); }
          if (s >= 0.95) { X.ball(c, px, py + ph * 0.3, 11, '#2f9e5b', '#145c33'); X.txt(c, '✓', px, py + ph * 0.3 + 6, '#fff', '800 15px'); }
        }
        X.txt(c, '받는 휴대 전화', px, py + ph / 2 + 28, DIM, '700 14px');
        if (k > 0.6) {   // 0과 1의 줄(보내는 순서대로)
          const ty = H * 0.88, tx0 = x0 - 12, tx1 = px - pw / 2 - 8, str = codes.join(' ');
          c.fillStyle = 'rgba(0,0,0,.4)'; X.rr(c, tx0, ty - 18, tx1 - tx0, 28, 8); c.fill();
          c.save(); c.beginPath(); c.rect(tx0 + 4, ty - 18, tx1 - tx0 - 8, 28); c.clip();
          const off = s > 0 ? (t * 40) % 60 : 0; X.txt(c, str, tx0 + 10 + off, ty + 2, YL, '800 15px', 'left'); if (s > 0) X.txt(c, str, tx0 + 10 + off - c.measureText(str + ' ').width, ty + 2, YL, '800 15px', 'left');
          c.restore(); X.txt(c, '보내는 0과 1', tx0, ty - 24, DIM, '700 12px', 'left');
        }
      },
      say(v, moved) {
        return [v < 0.15 ? '빛·소리·온도처럼 자연의 신호는 <b>연속</b>으로 변한다' : v < 0.5 ? '일정한 간격으로 끊어 읽는다 → <b>디지털</b>' : v < 0.97 ? '끊어 읽은 값을 <b>0과 1</b>로 바꾸어 멀리 보낸다' : '받는 쪽에 그대로 도착 — 저장·분석·<b>전송</b>이 쉽다',
          moved ? (v < 0.97 ? '끝까지 끌어 보자' : '디지털 정보가 도착했다') : '오른쪽으로 끌어 끊어 읽고 보내자', v >= 0.97];
      },
    },
  };
  function mount(root, kind) {
    const K = KINDS[kind], P = window.Play;
    const stage = root.querySelector('.au-stage'), out = root.querySelector('.au-out'), now = root.querySelector('.au-now');
    let v = 0, v0 = 0, x0 = 0, t = 0, moved = false;
    function set(x) { v = Math.max(0, Math.min(1, x)); const [o, n, done] = K.say(v, moved); out.innerHTML = o; now.textContent = n; now.classList.toggle('done', !!done); }
    const S = P.make(stage, {
      draw(c, W, H, dt) { t += dt; c.clearRect(0, 0, W, H); K.draw(c, P, W, H, v, t); if (!moved) { const h = K.hint ? K.hint(W, H, v) : { x: W * 0.3, y: H * 0.86, dx: 1, dy: 0, label: '오른쪽으로 끌기', dist: 150 }; X.hint(c, h.x, h.y, t, h.dx, h.dy, h.label, h.dist); } },
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
