/* 3-2 2차시 표지 «우주 정거장은 지금도 떨어지고 있다?»(사건 파일 18 · 교과서 124·130쪽).
   우주에서 본 지구 둘레를 정거장이 돈다(높이·크기는 크게 과장). 정거장을 꾹 누르고 있으면 시간이 느려지고
   그 순간의 중력 화살표(지구 중심 쪽)와 운동 방향 화살표, «중력이 없다면» 곧은 길이 보인다.
   누른 채 운동 반대쪽으로 끌면 빠르기가 줄고(앞으로 끌면 다시 늘고) 앞으로 갈 길이 점선으로 미리 보인다.
   손을 떼면 그 빠르기로 날아간다: 느리면 지구 쪽으로 파고들어 공기에 걸려 나선으로 떨어지고, 다시 빠르기를 채우면(앞으로 끌기) 처음 궤도로 되올라간다.
   떨어진 뒤 화면을 누르면 처음 궤도로. 화면은 늘 움직인다(궤도·구름·별·달).
   키보드: 스페이스 화살표 보기(누르기), 왼쪽·오른쪽 화살표 빠르기 줄이기·늘리기, 엔터 놓기, 0 처음부터.
   Station.mount(root) → { fit, setActive } · 시험용: root._st.hold(on) · speed(f) · release() · run(초) · reset() · state() */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const R0 = 1.45, T0 = 10; // 궤도 반지름(지구 반지름 단위, 과장) · 한 바퀴 시간(초, 화면용)
  const VC0 = TAU * R0 / T0, GM = VC0 * VC0 * R0, ATM = 1.22; // ATM 아래는 공기 저항
  const vc = (r) => Math.sqrt(GM / r);
  const KMS = 7.7; // 원 궤도 빠르기(국제 우주 정거장 높이, km/s) — 화면 표시용
  function step(o, dt) { // 반-암시적 오일러
    const r = Math.hypot(o.x, o.y), a = -GM / (r * r * r);
    let ax = a * o.x, ay = a * o.y;
    if (r < ATM) { const k = 1.6 * (ATM - r) / (ATM - 1); ax -= k * o.vx; ay -= k * o.vy; }
    o.vx += ax * dt; o.vy += ay * dt; o.x += o.vx * dt; o.y += o.vy * dt;
    if (Math.hypot(o.x, o.y) <= 1.0) { o.down = true; const q = Math.hypot(o.x, o.y); o.x /= q; o.y /= q; }
  }
  // 자체 확인: 원 궤도 빠르기면 한 바퀴 뒤에도 높이 그대로, 0.9배면 지구에 떨어진다
  (function () {
    const o = { x: R0, y: 0, vx: 0, vy: -VC0 }; for (let i = 0; i < T0 * 1000; i++) step(o, 0.001);
    const s = { x: R0, y: 0, vx: 0, vy: -VC0 * 0.9 }; for (let i = 0; i < 20000 && !s.down; i++) step(s, 0.001);
    console.assert(Math.abs(Math.hypot(o.x, o.y) - R0) < 0.01 && s.down, 'station: 궤도');
  })();

  // 3차원 값 잡음(지구 대륙·구름 무늬, gravity.js와 같은 방법)
  const sm = (a, b, x) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
  const hash = (i, j, k) => { const s = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453; return s - Math.floor(s); };
  function noise(x, y, z) {
    const i = Math.floor(x), j = Math.floor(y), k = Math.floor(z), u = x - i, v = y - j, w = z - k;
    const fu = u * u * (3 - 2 * u), fv = v * v * (3 - 2 * v), fw = w * w * (3 - 2 * w), L = (a, b, t) => a + (b - a) * t, c = (a, b, d) => hash(i + a, j + b, k + d);
    return L(L(L(c(0, 0, 0), c(1, 0, 0), fu), L(c(0, 1, 0), c(1, 1, 0), fu), fv), L(L(c(0, 0, 1), c(1, 0, 1), fu), L(c(0, 1, 1), c(1, 1, 1), fu), fv), fw);
  }
  const fbm = (x, y, z, n) => { let s = 0, a = 0.5, f = 1; for (let o = 0; o < n; o++) { s += a * noise(x * f, y * f, z * f); a *= 0.5; f *= 2.03; } return s / (1 - Math.pow(0.5, n)); };
  function bakeEarth(n) {
    const mk = () => { const cv = document.createElement('canvas'); cv.width = cv.height = n; return [cv, cv.getContext('2d')]; };
    const [base, b] = mk(), [cloud, cl] = mk(), [shade, sh] = mk();
    const ib = b.createImageData(n, n), ic = cl.createImageData(n, n), is = sh.createImageData(n, n), Lt = [-0.55, -0.5, 0.67];
    for (let py = 0; py < n; py++) for (let px = 0; px < n; px++) {
      const x = (px + 0.5) / n * 2 - 1, y = (py + 0.5) / n * 2 - 1, r2 = x * x + y * y; if (r2 > 1) continue;
      const z = Math.sqrt(1 - r2), o = (py * n + px) * 4, edge = sm(1, 0.985, Math.sqrt(r2));
      const h = fbm(x * 1.6 + 3.1, y * 1.6 - 1.7, z * 1.6 + 0.4, 5), dry = fbm(x * 3 + 9, y * 3, z * 3 - 4, 3);
      let R, Gc, B;
      if (Math.abs(y) > 0.9 - (h - 0.5) * 0.25) { R = 236; Gc = 242; B = 247; }
      else if (h > 0.53) { const m = sm(0.53, 0.7, h), d = sm(0.45, 0.62, dry) * (1 - Math.abs(y)); R = 62 + 70 * d + 30 * m; Gc = 128 + 30 * d - 25 * m; B = 58 + 30 * d; }
      else { const s = sm(0.4, 0.53, h); R = 14 + 30 * s; Gc = 58 + 70 * s; B = 128 + 60 * s; }
      ib.data[o] = R; ib.data[o + 1] = Gc; ib.data[o + 2] = B; ib.data[o + 3] = 255 * edge;
      const cv = fbm(x * 2.4 - 5, y * 4.2 + 2, z * 2.4 + 7, 4);
      ic.data[o] = ic.data[o + 1] = ic.data[o + 2] = 255; ic.data[o + 3] = 230 * sm(0.55, 0.72, cv) * edge;
      const lit = Math.max(0, x * Lt[0] + y * Lt[1] + z * Lt[2]);
      is.data[o] = 4; is.data[o + 1] = 8; is.data[o + 2] = 24; is.data[o + 3] = 255 * edge * (0.72 * (1 - sm(0, 0.55, lit)) + 0.12 * (1 - z));
    }
    b.putImageData(ib, 0, 0); cl.putImageData(ic, 0, 0); sh.putImageData(is, 0, 0);
    return { base, cloud, shade };
  }

  function mount(root) {
    const stage = root.querySelector('.ob-stage'), now = root.querySelector('.ob-now'), P = window.Play;
    let o, held, f, fell, trail, boost = null, t = 0, msg = '', flash = 0, earthImg = null, earthKey = 0, stars = null, grab = null, saved = false;
    function reset() { o = { x: 0, y: -R0, vx: VC0, vy: 0, down: false }; held = false; f = 1; fell = false; saved = false; trail = []; grab = null; flash = 0; boost = null; }
    reset();
    const say = (h, ok) => { if (h !== msg) { msg = h; now.textContent = h; now.classList.toggle('done', !!ok); } };
    const L = () => { const W = S.W, H = S.H, R = Math.min(W * 0.27, H * 0.315); return { W, H, R, cx: W * 0.5, cy: H * 0.52 }; };
    const scr = (l, x, y) => [l.cx + x * l.R, l.cy + y * l.R];
    const rad = () => Math.hypot(o.x, o.y);
    const tang = () => { const v = Math.hypot(o.vx, o.vy) || 1; return [o.vx / v, o.vy / v]; };
    const speedF = () => Math.hypot(o.vx, o.vy) / vc(rad());
    // 놓을 때: 지금 운동 방향(지름에 수직인 쪽) · 빠르기 f × 그 높이의 원 궤도 빠르기
    function apply() {
      const r = rad(), ux = -o.y / r, uy = o.x / r, sgn = (o.vx * ux + o.vy * uy) >= 0 ? 1 : -1, v = f * vc(r);
      o.vx = sgn * ux * v; o.vy = sgn * uy * v;
      if (f < 0.97) fell = true; else if (fell && !o.down) { fell = false; saved = true; boost = { r0: r, k: 0, dir: sgn }; } // 빠르기를 채우면 처음 궤도로 되올라간다
    }
    function release() { if (!held) return; held = false; grab = null; apply(); }
    function preview(n) { // 지금 빠르기로 갈 길(점선)
      const q = { ...o }, r = Math.hypot(q.x, q.y), ux = -q.y / r, uy = q.x / r, sgn = (q.vx * ux + q.vy * uy) >= 0 ? 1 : -1, v = f * vc(r);
      q.vx = sgn * ux * v; q.vy = sgn * uy * v; const pts = [];
      for (let i = 0; i < n && !q.down; i++) { for (let k = 0; k < 4; k++) step(q, 0.005); pts.push([q.x, q.y]); }
      return { pts, down: q.down };
    }

    function arrow(c, x0, y0, x1, y1, col, w) {
      const a = Math.atan2(y1 - y0, x1 - x0), len = Math.hypot(x1 - x0, y1 - y0); if (len < 4) return;
      const hl = Math.min(w * 3.2, len * 0.6);
      c.save(); c.translate(x0, y0); c.rotate(a);
      c.beginPath(); c.moveTo(0, -w / 2); c.lineTo(len - hl, -w / 2); c.lineTo(len - hl, -w * 1.5); c.lineTo(len, 0); c.lineTo(len - hl, w * 1.5); c.lineTo(len - hl, w / 2); c.lineTo(0, w / 2); c.closePath();
      c.lineJoin = 'round'; c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 4; c.stroke(); c.fillStyle = col; c.fill(); c.restore();
    }
    const label = (c, s, x, y, col, fnt, al) => { c.save(); c.font = `${fnt} "IBM Plex Sans KR", sans-serif`; c.textAlign = al || 'center'; c.lineJoin = 'round'; c.strokeStyle = 'rgba(8,14,30,.9)'; c.lineWidth = 5; c.strokeText(s, x, y); c.fillStyle = col; c.fillText(s, x, y); c.restore(); };
    // 정거장(가운데 몸체 + 긴 뼈대 + 금빛·남색 태양 전지판 네 쌍). 진행 방향이 +x
    function station(c, x, y, ang, k) {
      c.save(); c.translate(x, y); c.rotate(ang); c.scale(k, k);
      c.strokeStyle = '#c9ccd2'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(0, -30); c.lineTo(0, 30); c.stroke(); // 뼈대(진행 방향에 수직)
      [-26, -14, 14, 26].forEach((yy) => {
        [-1, 1].forEach((sd) => {
          const g = c.createLinearGradient(0, 0, sd * 22, 0); g.addColorStop(0, '#5a3f12'); g.addColorStop(0.5, '#d9a441'); g.addColorStop(1, '#7a5418');
          c.fillStyle = g; c.fillRect(sd > 0 ? 2 : -22, yy - 4, 20, 8);
          c.strokeStyle = 'rgba(40,25,5,.7)'; c.lineWidth = 0.6; for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo((sd > 0 ? 2 : -22) + i * 4, yy - 4); c.lineTo((sd > 0 ? 2 : -22) + i * 4, yy + 4); c.stroke(); }
        });
      });
      const g = c.createLinearGradient(0, -6, 0, 6); g.addColorStop(0, '#ffffff'); g.addColorStop(0.5, '#cfd3d8'); g.addColorStop(1, '#7d838c');
      c.fillStyle = g; c.strokeStyle = '#4a4f57'; c.lineWidth = 1; c.beginPath(); c.roundRect(-16, -5, 32, 10, 4); c.fill(); c.stroke(); // 몸체(진행 방향으로 길다)
      c.beginPath(); c.roundRect(-5, -10, 10, 20, 3); c.fill(); c.stroke();
      c.fillStyle = '#e8e3d0'; c.fillRect(-12, 6, 8, 5); c.fillStyle = '#9fb7d8'; c.fillRect(6, -11, 6, 4); // 방열판·창
      c.restore();
    }
    function moon(c, x, y, r) {
      P.glow(c, x, y, r * 2.2, 'rgba(230,230,220,.25)', 'rgba(230,230,220,0)');
      const g = c.createRadialGradient(x - r * 0.4, y - r * 0.4, 1, x, y, r); g.addColorStop(0, '#f1efe8'); g.addColorStop(0.7, '#b9b6ad'); g.addColorStop(1, '#6f6c65'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
      c.fillStyle = 'rgba(90,88,82,.45)'; [[-0.3, -0.1, 0.25], [0.25, 0.3, 0.18], [0.2, -0.35, 0.14]].forEach(([u, v, s]) => { c.beginPath(); c.arc(x + u * r, y + v * r, s * r, 0, TAU); c.fill(); });
    }

    const S = P.make(stage, {
      draw(c, W, H, dt) {
        const l = L(), { cx, cy, R } = l;
        t += dt; if (flash > 0) flash = Math.max(0, flash - dt * 1.2);
        const k = held ? 0.12 : 1; // 누르고 있으면 느리게
        if (boost && !held) { // 처음 궤도로 되올라가기(1.5초)
          boost.k = Math.min(1, boost.k + dt / 1.5); const e = boost.k * boost.k * (3 - 2 * boost.k), r = boost.r0 + (R0 - boost.r0) * e, a = Math.atan2(o.y, o.x) + boost.dir * vc(r) / r * dt;
          o.x = Math.cos(a) * r; o.y = Math.sin(a) * r; o.vx = -Math.sin(a) * vc(r) * boost.dir; o.vy = Math.cos(a) * vc(r) * boost.dir; if (boost.k >= 1) boost = null;
        } else if (!o.down) { const n = Math.ceil(dt * k / 0.004); for (let i = 0; i < n && !o.down; i++) step(o, dt * k / n); if (o.down) { flash = 1; fell = true; held = false; grab = null; window.RxT && window.RxT.jolt(stage, 1); } }
        if (dt && !o.down) { trail.push([o.x, o.y]); if (trail.length > 240) trail.shift(); }
        // 우주와 별
        const bg = c.createRadialGradient(cx, cy, R, cx, cy, W * 0.9); bg.addColorStop(0, '#111a33'); bg.addColorStop(1, '#03050c'); c.fillStyle = bg; c.fillRect(0, 0, W, H);
        if (!stars || stars.W !== W || stars.H !== H) stars = { W, H, s: Array.from({ length: 130 }, (_, i) => [((i * 7919) % 1000) / 1000 * W, ((i * 104729) % 997) / 997 * H, 0.6 + (i % 3) * 0.5, i]) };
        stars.s.forEach(([x, y, r, i]) => { c.fillStyle = `rgba(255,255,255,${0.35 + 0.35 * Math.sin(t * 1.5 + i * 1.7)})`; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); });
        // 먼 달(천천히 지나간다)
        const ma = -2.5 + 0.02 * t; moon(c, cx + Math.cos(ma) * W * 0.62, cy + Math.sin(ma) * H * 0.78, R * 0.13);
        // 지구
        const n = Math.min(520, Math.round(R * 2 * Math.min(1.5, window.devicePixelRatio || 1)));
        if (n !== earthKey) { earthImg = bakeEarth(n); earthKey = n; }
        P.glow(c, cx, cy, R * (ATM + 0.06), 'rgba(110,170,255,.42)', 'rgba(110,170,255,0)');
        c.drawImage(earthImg.base, cx - R, cy - R, R * 2, R * 2);
        c.save(); c.translate(cx, cy); c.rotate(t * 0.02); c.drawImage(earthImg.cloud, -R, -R, R * 2, R * 2); c.restore();
        c.drawImage(earthImg.shade, cx - R, cy - R, R * 2, R * 2);
        c.strokeStyle = 'rgba(150,200,255,.55)'; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, R + 1, 0, TAU); c.stroke();
        // 처음 궤도(옅은 점선)
        c.save(); c.setLineDash([3, 9]); c.strokeStyle = 'rgba(255,255,255,.22)'; c.lineWidth = 1.5; c.beginPath(); c.arc(cx, cy, R * R0, 0, TAU); c.stroke(); c.restore();
        // 지나온 길
        for (let i = 1; i < trail.length; i++) { const [x0, y0] = scr(l, ...trail[i - 1]), [x1, y1] = scr(l, ...trail[i]); c.strokeStyle = `rgba(255,216,77,${0.55 * i / trail.length})`; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); }
        const [sx, sy] = scr(l, o.x, o.y), [tx, ty] = tang();
        if (held) {
          // 앞으로 갈 길(지금 빠르기)
          const pv = preview(260); c.save(); c.setLineDash([8, 7]); c.lineDashOffset = -t * 30; c.strokeStyle = pv.down ? 'rgba(255,120,90,.9)' : 'rgba(140,230,255,.9)'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(sx, sy); pv.pts.forEach(([x, y]) => c.lineTo(...scr(l, x, y))); c.stroke(); c.restore();
          if (pv.down && pv.pts.length) { const [ex, ey] = scr(l, ...pv.pts[pv.pts.length - 1]); c.fillStyle = 'rgba(255,120,90,.9)'; c.beginPath(); c.arc(ex, ey, 6 + 2 * Math.sin(t * 8), 0, TAU); c.fill(); }
          // 중력이 없다면: 곧은 길
          c.save(); c.setLineDash([4, 6]); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(sx, sy); c.lineTo(sx + tx * R * 1.3, sy + ty * R * 1.3); c.stroke(); c.restore();
          label(c, '중력이 없다면 이 길로', Math.max(95, Math.min(W - 95, sx + tx * R * 1.3)), sy + ty * R * 1.3 + (ty > 0 ? 24 : -10), 'rgba(255,255,255,.85)', '700 17px');
          // 중력(지구 중심 쪽) · 운동 방향
          const gl = R * 0.6, ux = -o.x / rad(), uy = -o.y / rad();
          arrow(c, sx, sy, sx + ux * gl, sy + uy * gl, '#ff5a3c', 8);
          label(c, '중력', sx + ux * (gl + 26), sy + uy * (gl + 26) + 8, '#ffb3a1', '800 22px');
          const vl = R * 0.75 * f; arrow(c, sx, sy, sx + tx * vl, sy + ty * vl, '#ffd84d', 8);
          label(c, '운동 방향', sx + tx * (vl + 50), sy + ty * (vl + 22) + 8, '#ffe48a', '800 22px');
          // 직각 표시
          const q = 14; c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 2; c.beginPath(); c.moveTo(sx + ux * q, sy + uy * q); c.lineTo(sx + ux * q + tx * q, sy + uy * q + ty * q); c.lineTo(sx + tx * q, sy + ty * q); c.stroke();
        }
        // 정거장
        if (!o.down || flash > 0) {
          P.glow(c, sx, sy, 26 + (held ? 6 * Math.sin(t * 6) : 0), held ? 'rgba(255,216,77,.55)' : 'rgba(200,220,255,.35)');
          if (!o.down) station(c, sx, sy, Math.atan2(ty, tx), Math.max(0.9, R / 105));
          if (o.down) { P.glow(c, sx, sy, 60 * flash + 10, `rgba(255,170,80,${flash})`, 'rgba(255,90,40,0)'); }
        }
        if (!held && !o.down) { const b = 4 * Math.sin(t * 4); c.strokeStyle = 'rgba(255,216,77,.9)'; c.lineWidth = 2.5; c.beginPath(); c.arc(sx, sy, 30 + b, 0, TAU); c.stroke(); }
        // 빠르기 계기(아래 가운데)
        const sp = o.down ? 0 : held ? f : Math.min(1.2, speedF()), bw = Math.min(260, W * 0.5), bx = (W - bw) / 2, by = H - 34;
        c.fillStyle = 'rgba(8,14,30,.75)'; c.beginPath(); c.roundRect(bx - 12, by - 26, bw + 24, 46, 10); c.fill();
        c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(bx, by, bw, 10); c.fillStyle = sp >= 0.97 ? '#7fe0a0' : '#ff8a6a'; c.fillRect(bx, by, bw * Math.min(1, sp / 1.1), 10);
        c.fillStyle = '#fff'; c.fillRect(bx + bw / 1.1 - 1, by - 4, 2, 18);
        P.txt(c, o.down ? '빠르기 —' : `빠르기 약 ${(KMS * (held ? f * vc(rad()) : Math.hypot(o.vx, o.vy)) / VC0).toFixed(1)} km/s`, W / 2, by - 7, '#fff', '700 17px');
        if (flash > 0) { c.fillStyle = `rgba(255,200,140,${flash * 0.25})`; c.fillRect(0, 0, W, H); }
        // 안내
        if (o.down) say('지구에 떨어졌다! 화면을 누르면 처음 궤도로');
        else if (held && f < 0.97) say(`느려지면 지구 쪽으로 더 떨어진다 — 앞으로 끌면 다시 빨라진다`);
        else if (held) say('중력은 지구 중심 쪽, 운동 방향은 옆쪽 — 뒤로 끌면 느려진다');
        else if (fell) say('지구를 비켜 가지 못하고 나선으로 떨어진다! 다시 눌러 앞으로 끌자');
        else if (saved) say('다시 빨라져 지구를 비켜 간다 — 궤도 복원!', true);
        else say('도는 정거장을 꾹 눌러 보자');
      },
      down(p) {
        if (o.down) { reset(); return; }
        const l = L(), [sx, sy] = scr(l, o.x, o.y);
        if (Math.hypot(p.x - sx, p.y - sy) < 52) { held = true; f = Math.min(1, speedF()); grab = { x: p.x, y: p.y, f }; }
      },
      move(p) {
        if (!held || !grab) return; const [tx, ty] = tang();
        f = Math.max(0.35, Math.min(1, grab.f + ((p.x - grab.x) * tx + (p.y - grab.y) * ty) / 160));
      },
      up() { release(); },
      key(e) {
        if (e.key === ' ') { if (o.down) reset(); else if (!held) { held = true; f = Math.min(1, speedF()); } return true; }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { if (o.down) return true; if (!held) { held = true; f = Math.min(1, speedF()); } f = Math.max(0.35, Math.min(1, f + (e.key === 'ArrowRight' ? 0.05 : -0.05))); return true; }
        if (e.key === 'Enter') { release(); return true; }
        if (e.key === '0') { reset(); return true; } return false;
      },
    });
    const state = () => ({ dir: tang().map((v) => +v.toFixed(2)), r: +rad().toFixed(3), speed: +speedF().toFixed(3), f: +f.toFixed(2), held, fell, saved, down: o.down, msg });
    root._st = {
      hold: (on) => { if (on) { held = true; f = Math.min(1, speedF()); } else release(); S.kick(); return state(); },
      speed: (x) => { f = Math.max(0.35, Math.min(1, x)); S.kick(); return state(); },
      release: () => { release(); S.kick(); return state(); },
      run: (sec) => { for (let i = 0; i < sec * 250 && !o.down; i++) step(o, 0.004); if (o.down) fell = true; S.kick(); return state(); },
      pos: () => { const l = L(); return scr(l, o.x, o.y); },
      reset: () => { reset(); S.kick(); return state(); },
      state,
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Station = { mount };
})();
