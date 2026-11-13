/* 3-2 3차시 표지 «달리는 버스 안에서 위로 던진 공은 어디에 떨어질까?»(사건 파일 19).
   «버스 안»: 일정한 빠르기로 달리는 버스 안(창밖 풍경이 흘러간다). 승객 손의 공을 누르거나 위로 끌었다 놓으면 위로 튀어 올랐다가 손으로 다시 떨어진다.
   «길가»: 정류장 사람이 본 모습 — 버스가 지나갈 때 눌러 두면 정류장 앞에서 던지고, 공은 앞으로 날아가며 포물선을 그린 뒤 역시 손으로 돌아온다.
   왼쪽 위 손잡이(브레이크 ↔ 가속)를 끌면 «공이 떠 있는 동안» 버스가 속력을 바꾼다: 브레이크면 공이 앞쪽, 가속이면 뒤쪽에 떨어진다(관성).
   공이 떠 있는 동안은 느린 화면. 크기·빠르기는 이해를 돕기 위한 예.
   키보드: 스페이스·엔터 던지기, 위·아래 화살표 던지는 세기, 왼쪽·오른쪽 화살표 손잡이, 1 버스 안, 2 길가, 0 처음부터.
   BusToss.mount(root) → { fit, setActive } · 시험용: root._bt.view('bus'|'road') · accel(a) · toss(v0) · run(초) · state()
   버스 그림 도우미 window.BusArt(창밖 풍경·버스 안·사람·손잡이)는 bus.js(«버스 손잡이» 장)도 함께 쓴다. */
(function () {
  'use strict';
  const TAU = Math.PI * 2, G = 9.8;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const hash = (i, k) => { const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); };

  // ================= 버스 그림 도우미(BusArt) =================
  const txt = (c, t, x, y, col, f, al) => window.Play.txt(c, t, x, y, col, f, al);
  // 창밖 풍경: 사각형 (x, y, w, h) 안에, off = 버스가 간 거리(px). 먼 것일수록 천천히 흘러간다.
  function scenery(c, x, y, w, h, off, t) {
    c.save(); c.beginPath(); c.rect(x, y, w, h); c.clip();
    let g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, '#6eaee0'); g.addColorStop(0.75, '#cfe6f4'); g.addColorStop(1, '#e8f2f0'); c.fillStyle = g; c.fillRect(x, y, w, h);
    const base = y + h * 0.82;
    // 구름(아주 천천히)
    for (let i = -1; i < 4; i++) {
      const sp = 260, o = off * 0.02 + t * 6, k = Math.floor(o / sp), cx = x + (i + k) * sp - o + 80 + hash(i + k, 1) * 90, cy = y + h * (0.12 + 0.12 * hash(i + k, 2)), r = h * 0.07;
      c.fillStyle = 'rgba(255,255,255,.88)'; [[0, 0, 1.2], [1.1, 0.25, 0.9], [-1.1, 0.3, 0.85], [0.4, -0.5, 0.9]].forEach(([dx, dy, s]) => { c.beginPath(); c.arc(cx + dx * r, cy + dy * r, r * s, 0, TAU); c.fill(); });
    }
    // 먼 산
    c.fillStyle = '#9dbcae'; c.beginPath(); c.moveTo(x, base); for (let i = 0; i <= w + 20; i += 16) { const u = (i + off * 0.08) * 0.008; c.lineTo(x + i, base - h * (0.3 + 0.12 * Math.sin(u) + 0.06 * Math.sin(u * 2.7 + 1))); } c.lineTo(x + w + 20, base); c.fill();
    // 건물(중간 거리)
    { const sp = h * 0.42, o = off * 0.35, k = Math.floor(o / sp);
      for (let i = -1; i < w / sp + 2; i++) {
        const n = i + k, bx = x + n * sp - o, bw = sp * (0.62 + 0.3 * hash(n, 3)), bh = h * (0.28 + 0.36 * hash(n, 4)), hue = [['#d9cbb2', '#bfae92'], ['#c9d3dc', '#a8b5c1'], ['#e3c1a6', '#c79f80'], ['#cfd8c4', '#aebca1']][Math.floor(hash(n, 5) * 4)];
        if (hash(n, 6) < 0.18) continue;
        g = c.createLinearGradient(bx, 0, bx + bw, 0); g.addColorStop(0, hue[0]); g.addColorStop(1, hue[1]); c.fillStyle = g; c.fillRect(bx, base - bh, bw, bh);
        c.fillStyle = 'rgba(60,80,105,.45)'; for (let wy = base - bh + 6; wy < base - 8; wy += 11) for (let wx = bx + 5; wx < bx + bw - 7; wx += 10) c.fillRect(wx, wy, 5, 6);
      } }
    // 땅·길가
    g = c.createLinearGradient(0, base, 0, y + h); g.addColorStop(0, '#8aa46e'); g.addColorStop(1, '#6d8456'); c.fillStyle = g; c.fillRect(x, base, w, y + h - base);
    // 가로수·가로등(가까이, 빠르게)
    { const sp = h * 1.1, o = off, k = Math.floor(o / sp);
      for (let i = -1; i < w / sp + 2; i++) {
        const n = i + k, tx = x + n * sp - o + sp * 0.3 * hash(n, 7);
        if (hash(n, 8) < 0.35) { c.fillStyle = '#5d6670'; c.fillRect(tx, base - h * 0.75, 4, h * 0.75 + 4); c.fillRect(tx, base - h * 0.75, 22, 4); c.fillStyle = '#f4f0d0'; c.fillRect(tx + 16, base - h * 0.72, 8, 4); continue; }
        c.fillStyle = '#6b4a2e'; c.fillRect(tx - 3, base - h * 0.32, 6, h * 0.34);
        const r = h * (0.17 + 0.05 * hash(n, 9)); g = c.createRadialGradient(tx - r * 0.3, base - h * 0.42 - r * 0.3, 2, tx, base - h * 0.42, r * 1.2); g.addColorStop(0, '#7fb055'); g.addColorStop(1, '#2f6a2a'); c.fillStyle = g;
        [[0, 0, 1], [-0.6, 0.3, 0.7], [0.6, 0.3, 0.72], [0, -0.55, 0.7]].forEach(([dx, dy, s]) => { c.beginPath(); c.arc(tx + dx * r, base - h * 0.42 + dy * r, r * s, 0, TAU); c.fill(); });
      } }
    c.restore();
  }
  // 버스 안(옆 벽을 바라본 단면). L: floor, ceil, ppm, winTop, winBot, frontX, poles[], seats[]
  function interior(c, W, H, L, off, t) {
    const { floor, ceil, ppm, winTop, winBot, frontX } = L;
    let g = c.createLinearGradient(0, ceil, 0, floor); g.addColorStop(0, '#e9e4d6'); g.addColorStop(1, '#d6cfbd'); c.fillStyle = g; c.fillRect(0, 0, frontX, H);
    // 창(창틀 사이로 풍경)
    const sp = 1.55 * ppm;
    for (let wx = 10; wx < frontX - 30; wx += sp) {
      const ww = Math.min(sp - 0.2 * ppm, frontX - 14 - wx); if (ww < 30) break;
      scenery(c, wx, winTop, ww, winBot - winTop, off, t);
      c.fillStyle = 'rgba(160,200,215,.16)'; c.fillRect(wx, winTop, ww, winBot - winTop);
      c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.moveTo(wx + ww * 0.15, winTop); c.lineTo(wx + ww * 0.3, winTop); c.lineTo(wx + ww * 0.12, winBot); c.lineTo(wx - 2, winBot); c.fill();
      c.strokeStyle = '#4a4f57'; c.lineWidth = 7; c.beginPath(); c.roundRect(wx, winTop, ww, winBot - winTop, 8); c.stroke();
      c.strokeStyle = '#8b9099'; c.lineWidth = 2; c.stroke();
    }
    // 창 아래 벽판·위 선반
    g = c.createLinearGradient(0, winBot, 0, floor); g.addColorStop(0, '#5f8f8a'); g.addColorStop(1, '#46706c'); c.fillStyle = g; c.fillRect(0, winBot + 4, frontX, floor - winBot - 4);
    c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(0, winBot + 4, frontX, 3);
    // 천장(조명 띠)
    g = c.createLinearGradient(0, 0, 0, ceil + 0.12 * ppm); g.addColorStop(0, '#bfbab0'); g.addColorStop(1, '#e8e4dc'); c.fillStyle = g; c.fillRect(0, 0, frontX, ceil + 0.12 * ppm);
    c.fillStyle = 'rgba(255,252,230,.95)'; c.fillRect(0, ceil + 0.03 * ppm, frontX, 5);
    // 자리(앞을 보는 의자, 옆모습)
    (L.seats || []).forEach((sx) => seat(c, sx, floor, ppm));
    // 바닥(미끄럼 방지 무늬)
    g = c.createLinearGradient(0, floor, 0, H); g.addColorStop(0, '#6d6a66'); g.addColorStop(1, '#3d3b38'); c.fillStyle = g; c.fillRect(0, floor, W, H - floor);
    c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < W; i += 14) c.fillRect(i, floor + 6 + (i % 28 ? 6 : 0), 6, 2);
    c.fillStyle = '#c9b25a'; c.fillRect(0, floor, W, 3);
    // 앞유리(앞길이 다가온다)
    if (frontX < W) {
      c.save(); c.beginPath(); c.moveTo(frontX + 8, ceil + 4); c.lineTo(W, ceil + 4); c.lineTo(W, floor - 0.95 * ppm); c.lineTo(frontX + 30, floor - 0.95 * ppm); c.closePath(); c.clip();
      const hz = winTop + (floor - 0.95 * ppm - winTop) * 0.35;
      g = c.createLinearGradient(0, ceil, 0, hz); g.addColorStop(0, '#6eaee0'); g.addColorStop(1, '#d3e8f3'); c.fillStyle = g; c.fillRect(frontX, ceil, W - frontX, H);
      c.fillStyle = '#8aa46e'; c.fillRect(frontX, hz, W - frontX, H); c.fillStyle = '#5e6166'; c.beginPath(); c.moveTo(frontX + 40, hz); c.lineTo(W - 10, hz); c.lineTo(W + 120, floor); c.lineTo(frontX - 60, floor); c.fill();
      c.fillStyle = '#f2f2ea'; for (let k = 0; k < 6; k++) { const u = ((k + off * 0.004) % 6) / 6, yy = hz + (floor - hz) * u * u, ww = 2 + 8 * u * u; c.fillRect((frontX + W) / 2 + 10 - ww / 2, yy, ww, 6 + 20 * u * u); }
      c.restore();
      c.strokeStyle = '#3e434b'; c.lineWidth = 10; c.beginPath(); c.moveTo(frontX + 8, ceil + 4); c.lineTo(frontX + 30, floor - 0.95 * ppm); c.stroke();
      g = c.createLinearGradient(0, floor - 0.95 * ppm, 0, floor); g.addColorStop(0, '#3a3e45'); g.addColorStop(1, '#22252a'); c.fillStyle = g; c.fillRect(frontX + 10, floor - 0.95 * ppm, W - frontX, 0.95 * ppm);
      c.strokeStyle = '#1b1d21'; c.lineWidth = 7; c.beginPath(); c.ellipse(frontX + 0.45 * ppm, floor - 1.02 * ppm, 0.07 * ppm, 0.24 * ppm, -0.3, 0, TAU); c.stroke();
    }
    (L.poles || []).forEach((x) => pole(c, x, ceil, floor));
    // 손잡이 줄(천장 레일)
    c.fillStyle = '#9ca3ab'; c.fillRect(0, ceil + 0.14 * ppm, frontX, 6); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(0, ceil + 0.14 * ppm, frontX, 2);
  }
  function seat(c, x, floor, ppm) { // x = 의자 뒤쪽 끝, 앞(오른쪽)을 본다
    c.strokeStyle = '#8a9099'; c.lineWidth = 5; c.beginPath(); c.moveTo(x + 0.2 * ppm, floor - 0.42 * ppm); c.lineTo(x + 0.22 * ppm, floor); c.stroke();
    let g = c.createLinearGradient(0, floor - 0.5 * ppm, 0, floor - 0.38 * ppm); g.addColorStop(0, '#3f6db0'); g.addColorStop(1, '#264a80'); c.fillStyle = g;
    c.beginPath(); c.roundRect(x, floor - 0.5 * ppm, 0.48 * ppm, 0.12 * ppm, 6); c.fill();
    g = c.createLinearGradient(x - 0.05 * ppm, 0, x + 0.1 * ppm, 0); g.addColorStop(0, '#264a80'); g.addColorStop(1, '#4a7cc4'); c.fillStyle = g;
    c.beginPath(); c.moveTo(x - 0.02 * ppm, floor - 0.48 * ppm); c.lineTo(x - 0.1 * ppm, floor - 1.12 * ppm); c.quadraticCurveTo(x - 0.06 * ppm, floor - 1.2 * ppm, x + 0.04 * ppm, floor - 1.16 * ppm); c.lineTo(x + 0.11 * ppm, floor - 0.5 * ppm); c.fill();
    c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.roundRect(x - 0.1 * ppm, floor - 1.18 * ppm, 0.14 * ppm, 0.12 * ppm, 4); c.fill();
  }
  function pole(c, x, top, floor) {
    const g = c.createLinearGradient(x - 6, 0, x + 6, 0); g.addColorStop(0, '#b8860f'); g.addColorStop(0.4, '#ffd65a'); g.addColorStop(1, '#a87a0c'); c.fillStyle = g; c.fillRect(x - 6, top, 12, floor - top);
  }
  // 손잡이(천장 레일에 매단 고리): 매단 곳 (x, y), 줄 길이 len, 기운 각 ang(+ 앞쪽). 고리 위치를 돌려준다.
  function strap(c, x, y, len, ang, ppm) {
    const ex = x + Math.sin(ang) * len, ey = y + Math.cos(ang) * len, r = 0.075 * ppm;
    c.strokeStyle = '#3b3f46'; c.lineWidth = 0.045 * ppm; c.lineCap = 'butt'; c.beginPath(); c.moveTo(x, y); c.lineTo(ex, ey); c.stroke();
    c.fillStyle = '#5d636c'; c.fillRect(x - 0.03 * ppm, y - 3, 0.06 * ppm, 8);
    const rx = ex + Math.sin(ang) * r, ry = ey + Math.cos(ang) * r;
    c.strokeStyle = '#f2f0e8'; c.lineWidth = 0.035 * ppm; c.beginPath(); c.arc(rx, ry, r, 0, TAU); c.stroke();
    c.strokeStyle = 'rgba(120,115,100,.7)'; c.lineWidth = 1.5; c.beginPath(); c.arc(rx, ry, r + 0.017 * ppm, 0.3, 2.6); c.stroke();
    return { x: rx, y: ry + r * 0.7 };
  }
  // 사람(옆모습, 오른쪽을 본다). o: x, y(발 = 바닥), s(px/m), h(키 m), lean(+ 앞으로), 옷 색, kid, sit(엉덩이 높이 y), grip·hold·back(손이 갈 곳)
  function person(c, o) {
    const s = o.s, H = o.h * s, th = o.lean || 0, sn = Math.sin(th), cs = Math.cos(th), kid = !!o.kid;
    const bx = o.x, by = o.sit != null ? o.sit : o.y, u0 = o.sit != null ? 0.5 * H : 0;
    const P = (u, v) => ({ x: bx + (u - u0) * sn + v * cs, y: by - (u - u0) * cs + v * sn });
    const shade = (col, k) => { const n = parseInt(col.slice(1), 16), f = (v) => clamp(Math.round(v * k), 0, 255); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
    const limb = (pts, w, col) => { c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(pts[0].x, pts[0].y); pts.slice(1).forEach((p) => c.lineTo(p.x, p.y)); c.stroke(); };
    const ua = (kid ? 0.2 : 0.19) * H, fa = (kid ? 0.2 : 0.18) * H;
    function arm(S, T, front, hang) {
      let E, Hd;
      if (!T) { const sw = hang || 0; Hd = { x: S.x + Math.sin(sw) * (ua + fa), y: S.y + Math.cos(sw) * (ua + fa) }; E = { x: S.x + Math.sin(sw) * ua - 0.01 * H, y: S.y + Math.cos(sw) * ua }; }
      else {
        const dx = T.x - S.x, dy = T.y - S.y, d = Math.min(Math.hypot(dx, dy), ua + fa - 0.5), a0 = Math.atan2(dy, dx);
        const k = Math.acos(clamp((ua * ua + d * d - fa * fa) / (2 * ua * d), -1, 1));
        E = { x: S.x + Math.cos(a0 + k) * ua, y: S.y + Math.sin(a0 + k) * ua }; Hd = { x: S.x + Math.cos(a0) * d, y: S.y + Math.sin(a0) * d };
      }
      limb([S, E], 0.062 * H, front ? o.shirt : shade(o.shirt, 0.72)); limb([E, Hd], 0.05 * H, front ? o.skin : shade(o.skin, 0.85));
      c.fillStyle = front ? o.skin : shade(o.skin, 0.85); c.beginPath(); c.arc(Hd.x, Hd.y, 0.035 * H, 0, TAU); c.fill();
      return Hd;
    }
    // 그림자
    c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(o.x, o.y + 3, 0.2 * H, 0.025 * H, 0, 0, TAU); c.fill();
    const SB = P(0.8 * H, -0.035 * H), SF = P(0.79 * H, 0.015 * H);
    arm(SB, o.back, false, 0.08);
    // 다리
    const pantsD = shade(o.pants, 0.75);
    if (o.sit != null) {
      [[-0.01, pantsD], [0.03, o.pants]].forEach(([dv, col]) => { const hp = { x: bx + dv * H, y: by - 0.02 * H }, kn = { x: bx + 0.27 * H, y: by - 0.04 * H + dv * H * 0.2 }, ft = { x: bx + 0.3 * H + dv * H, y: o.y - 0.03 * H }; limb([hp, kn, ft], 0.075 * H, col); c.fillStyle = '#2b2b2e'; c.beginPath(); c.ellipse(ft.x + 0.03 * H, o.y - 0.015 * H, 0.06 * H, 0.025 * H, 0, 0, TAU); c.fill(); });
    } else {
      [[-0.045, pantsD], [0.04, o.pants]].forEach(([dv, col], i) => {
        const hp = P(0.49 * H, (i ? 0.01 : -0.02) * H), ft = { x: o.x + dv * H, y: o.y - 0.03 * H }, kn = { x: (hp.x + ft.x) / 2 + 0.012 * H, y: (hp.y + ft.y) / 2 };
        limb([hp, kn, ft], 0.072 * H, col); c.fillStyle = i ? '#2f2f33' : '#1f1f22'; c.beginPath(); c.ellipse(ft.x + 0.03 * H, o.y - 0.016 * H, 0.062 * H, 0.024 * H, 0, 0, TAU); c.fill();
      });
    }
    // 몸통
    const t1 = P(0.47 * H, -0.07 * H), t2 = P(0.47 * H, 0.07 * H), t3 = P(0.81 * H, 0.065 * H), t4 = P(0.83 * H, -0.07 * H);
    const g = c.createLinearGradient(t1.x, t1.y, t2.x, t2.y); g.addColorStop(0, shade(o.shirt, 0.78)); g.addColorStop(0.55, o.shirt); g.addColorStop(1, shade(o.shirt, 1.12)); c.fillStyle = g;
    c.beginPath(); c.moveTo(t1.x, t1.y); c.lineTo(t2.x, t2.y); c.quadraticCurveTo(P(0.66 * H, 0.09 * H).x, P(0.66 * H, 0.09 * H).y, t3.x, t3.y); c.quadraticCurveTo(P(0.86 * H, 0).x, P(0.86 * H, 0).y, t4.x, t4.y); c.quadraticCurveTo(P(0.65 * H, -0.09 * H).x, P(0.65 * H, -0.09 * H).y, t1.x, t1.y); c.fill();
    c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 1.5; c.stroke();
    if (o.bag) { const b1 = P(0.78 * H, -0.08 * H), b2 = P(0.52 * H, -0.12 * H); c.fillStyle = o.bag; c.beginPath(); c.ellipse((b1.x + b2.x) / 2 - 0.03 * H * cs, (b1.y + b2.y) / 2, 0.06 * H, 0.14 * H, th, 0, TAU); c.fill(); c.strokeStyle = 'rgba(0,0,0,.3)'; c.stroke(); }
    // 목·머리
    const hr = (kid ? 0.095 : 0.072) * H, hc = P((kid ? 0.9 : 0.915) * H, 0.012 * H), nk = P(0.85 * H, 0.005 * H);
    limb([P(0.8 * H, 0), nk], 0.045 * H, o.skin);
    let hg = c.createRadialGradient(hc.x + hr * 0.3, hc.y - hr * 0.3, 1, hc.x, hc.y, hr * 1.1); hg.addColorStop(0, shade(o.skin, 1.06)); hg.addColorStop(1, shade(o.skin, 0.86)); c.fillStyle = hg; c.beginPath(); c.arc(hc.x, hc.y, hr, 0, TAU); c.fill();
    // 코
    c.beginPath(); c.arc(hc.x + hr * 0.97 * cs - hr * 0.05 * sn, hc.y + hr * 0.05 * cs + hr * 0.97 * sn, hr * 0.16, 0, TAU); c.fill();
    // 머리카락(뒤·위)
    c.save(); c.translate(hc.x, hc.y); c.rotate(th); c.fillStyle = o.hair;
    c.beginPath(); c.arc(0, 0, hr * 1.06, Math.PI * 0.62, Math.PI * 1.88); c.quadraticCurveTo(hr * 0.2, -hr * 0.55, -hr * 0.1, -hr * 0.25); c.quadraticCurveTo(-hr * 0.55, hr * 0.05, -hr * 0.55, hr * 0.6); c.fill();
    if (o.long) { c.beginPath(); c.moveTo(-hr * 0.9, -hr * 0.2); c.quadraticCurveTo(-hr * 1.25, hr * 0.9, -hr * 0.55, hr * 1.35); c.lineTo(-hr * 0.2, hr * 0.7); c.fill(); }
    if (o.cap) { c.fillStyle = o.cap; c.beginPath(); c.arc(0, -hr * 0.1, hr * 1.08, Math.PI * 1.05, Math.PI * 1.98); c.fill(); c.fillRect(hr * 0.3, -hr * 0.28, hr * 0.95, hr * 0.18); }
    c.fillStyle = shade(o.skin, 0.8); c.beginPath(); c.ellipse(-hr * 0.08, hr * 0.12, hr * 0.17, hr * 0.24, 0, 0, TAU); c.fill(); // 귀
    c.fillStyle = '#1d1d22'; c.beginPath(); c.arc(hr * 0.55, -hr * 0.1, hr * 0.1, 0, TAU); c.fill(); // 눈
    c.strokeStyle = shade(o.skin, 0.6); c.lineWidth = 1.6; c.beginPath(); c.moveTo(hr * 0.55, hr * 0.42); c.lineTo(hr * 0.8, hr * 0.4); c.stroke(); // 입
    c.restore();
    return arm(SF, o.grip || o.hold, true, 0.04);
  }
  function ball(c, x, y, r, a) {
    c.save(); c.globalAlpha = a == null ? 1 : a;
    const g = c.createRadialGradient(x - r * 0.35, y - r * 0.35, 1, x, y, r); g.addColorStop(0, '#ffb3a0'); g.addColorStop(0.45, '#e2402c'); g.addColorStop(1, '#8e1d10'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = Math.max(1.5, r * 0.14); c.beginPath(); c.arc(x - r * 1.25, y, r * 1.05, -0.75, 0.75); c.stroke();
    c.restore();
  }
  function tag(c, t, x, y, bg, fg, al) { // 둥근 이름표
    c.font = '800 20px "IBM Plex Sans KR", sans-serif'; const w = c.measureText(t).width + 20, x0 = al === 'left' ? x : al === 'right' ? x - w : x - w / 2;
    c.fillStyle = bg; c.beginPath(); c.roundRect(x0, y - 16, w, 32, 16); c.fill(); txt(c, t, x0 + w / 2, y + 7, fg, '800 20px');
  }
  window.BusArt = { scenery, interior, seat, pole, strap, person, ball, tag, hash };

  // ================= 표지: 버스 안에서 던진 공 =================
  const V0 = 4, HAND = 1.12, CATCH = 0.13, SLOW = 0.45, AMIN = -2, AMAX = 1.5;
  // 버스 안에서 본 공의 앞뒤 위치: 버스 가속도 a(앞 +)일 때 x = −a t²/2
  const relX = (a, t) => -0.5 * a * t * t;
  (function () { // 자체 확인: 일정한 빠르기면 손으로, 브레이크면 앞쪽, 가속이면 뒤쪽
    const T = 2 * 3.2 / G; console.assert(relX(0, T) === 0 && relX(-3, T) > CATCH && relX(2, T) < -CATCH, 'bustoss: 떨어지는 곳');
  })();
  const ADULT = { h: 1.7, shirt: '#3f6fb5', pants: '#2d3540', skin: '#f0c49c', hair: '#2a1d15' };

  function mount(root) {
    const stage = root.querySelector('.bt-stage'), now = root.querySelector('.bt-now');
    const A = window.BusArt, P = window.Play;
    let view, fade, t, V, dist, roadX, aSet, fly, trail, armed, msg, aim, drag, lean, straps, last, rest;
    function reset() { view = 'bus'; fade = 0; t = 0; V = V0; dist = 0; roadX = -2; aSet = 0; fly = null; trail = []; armed = 0; aim = null; drag = null; lean = 0; straps = 0; last = null; rest = 0; }
    reset();
    const say = (h, ok) => { if (h !== msg) { msg = h; now.textContent = h; now.classList.toggle('done', !!ok); } };
    // 배치
    const layBus = (W, H) => { const floor = H - 30, ppm = (floor - 12) / 2.35, ceil = floor - 2.3 * ppm, frontX = W, px = W * 0.52;
      return { floor, ppm, ceil, winTop: floor - 2.0 * ppm, winBot: floor - 1.08 * ppm, frontX, px, hx: px + 0.34 * ppm, hy: floor - HAND * ppm, poles: [px - 0.42 * ppm, W - 0.5 * ppm], seats: [W * 0.05, W * 0.05 + 0.75 * ppm, W - 1.3 * ppm] }; };
    const BUSL = 7.2, HANDL = 3.1; // 버스 길이, 뒤끝에서 승객 손까지(m)
    const layRoad = (W, H) => { const ppm = W * 0.9 / BUSL, road = H - 36; return { ppm, road, floorH: 0.5, curb: H - 128, stopX: W * 0.07 }; };
    const signs = (W) => [{ k: 'bus', t: '버스 안', x: W - 222, y: 10, w: 104, h: 46 }, { k: 'road', t: '길가', x: W - 110, y: 10, w: 96, h: 46 }];
    const LV = { x: 12, y: 62, w: 290, h: 92 }; // 손잡이 판
    const lvX = (a) => LV.x + 30 + (a - AMIN) / (AMAX - AMIN) * (LV.w - 60), lvY = LV.y + 52;
    const aFromX = (x) => { const a = AMIN + (x - LV.x - 30) / (LV.w - 60) * (AMAX - AMIN); return Math.abs(a) < 0.3 ? 0 : clamp(Math.round(a * 2) / 2, AMIN, AMAX); };
    const flying = () => fly && fly.ph === 'air';
    const handGX = () => roadX + HANDL + 0.34;

    function toss(v0) {
      if (flying()) return;
      fly = { ph: 'air', t: 0, v0, a: aSet, x: 0, y: 0, res: null }; trail = []; armed = 0; last = null; rest = 0;
    }
    function step(dts) {
      // 버스: 공이 떠 있는 동안만 손잡이대로, 그 뒤엔 운전사가 원래 빠르기로 되돌린다
      const acc = flying() ? fly.a : clamp((V0 - V) * 1.6, -2, 2);
      V = Math.max(0.3, V + acc * dts); dist += V * dts; roadX += V * dts;
      lean += (clamp(-acc * 0.04, -0.2, 0.2) - lean) * Math.min(1, dts * 7); straps += (clamp(-acc * 0.1, -0.45, 0.45) - straps) * Math.min(1, dts * 4);
      if (fly && fly.ph === 'air') {
        fly.t += dts; fly.x = relX(fly.a, fly.t); fly.y = fly.v0 * fly.t - 0.5 * G * fly.t * fly.t;
        if (!last || fly.t - last >= 0.06) { last = fly.t; trail.push({ x: fly.x, y: fly.y, gx: handGX() + fly.x }); }
        if (fly.y <= 0 && fly.t > 0.1) {
          if (Math.abs(fly.x) < CATCH && fly.y > -0.15) { fly.ph = 'hand'; fly.x = 0; fly.y = 0; fly.res = 'hand'; }
          else if (fly.y <= -(HAND - 0.06)) { fly.y = -(HAND - 0.06); fly.ph = 'rest'; fly.res = fly.x > 0 ? 'front' : 'back'; rest = 1.8; }
        }
      } else if (fly && fly.ph === 'rest') { rest -= dts; if (rest <= 0) { fly.ph = 'done'; } }
    }
    // ---------- 그림: 버스 안 ----------
    function drawBus(c, W, H) {
      const L = layBus(W, H), ppm = L.ppm;
      A.interior(c, W, H, L, dist * ppm, t);
      // 손잡이 고리(흔들림)
      for (let x = 0.55 * ppm; x < L.frontX - 0.4 * ppm; x += 0.82 * ppm) A.strap(c, x, L.ceil + 0.17 * ppm, 0.36 * ppm, straps + 0.03 * Math.sin(t * 1.7 + x), ppm);
      // 궤적(버스 안 기준)
      trail.forEach((p, i) => A.ball(c, L.hx + p.x * ppm, L.hy - p.y * ppm - 0.06 * ppm, 0.06 * ppm, 0.18 + 0.25 * i / trail.length));
      if (fly && fly.ph !== 'air' && trail.length > 3) { // 위아래 곧은 길 표시
        c.strokeStyle = 'rgba(255,216,77,.9)'; c.setLineDash([7, 6]); c.lineWidth = 3; c.beginPath(); trail.forEach((p, i) => { const x = L.hx + p.x * ppm, y = L.hy - p.y * ppm - 0.06 * ppm; if (i) c.lineTo(x, y); else c.moveTo(x, y); }); c.stroke(); c.setLineDash([]);
      }
      const bp = ballPos(L.hx, L.hy, ppm);
      A.person(c, Object.assign({ x: L.px, y: L.floor, s: ppm, lean, back: { x: L.poles[0] + 4, y: L.floor - 1.28 * ppm }, hold: { x: L.hx, y: L.hy + 0.03 * ppm } }, ADULT));
      A.ball(c, bp.x, bp.y, 0.06 * ppm);
      if (aim) { const k = aim.pull / 160; c.strokeStyle = '#ffd84d'; c.lineWidth = 6; c.lineCap = 'round'; const y1 = L.hy - 0.15 * ppm, y2 = y1 - (40 + 110 * k); c.beginPath(); c.moveTo(L.hx, y1); c.lineTo(L.hx, y2); c.moveTo(L.hx - 12, y2 + 14); c.lineTo(L.hx, y2); c.lineTo(L.hx + 12, y2 + 14); c.stroke(); }
      if (!fly && !aim) { const b = 5 * Math.sin(t * 4), y = L.hy - 0.2 * ppm + b; c.strokeStyle = 'rgba(255,216,77,.95)'; c.lineWidth = 4; c.beginPath(); c.moveTo(L.hx, y); c.lineTo(L.hx, y - 34); c.moveTo(L.hx - 10, y - 22); c.lineTo(L.hx, y - 34); c.lineTo(L.hx + 10, y - 22); c.stroke(); txt(c, '눌러 던지기', L.hx + 18, y - 14, '#fff', '800 20px', 'left'); }
      // 떨어진 곳 이름표
      if (fly && fly.res && fly.ph !== 'air' && fly.ph !== 'done') { const r = fly.res, x = L.hx + fly.x * ppm; A.tag(c, r === 'hand' ? '손으로 다시!' : r === 'front' ? '앞쪽에 떨어짐' : '뒤쪽에 떨어짐', clamp(x, 90, W - 90), r === 'hand' ? L.hy - 0.62 * ppm : L.floor - 0.35 * ppm, r === 'hand' ? '#1f7a3a' : '#b0301f', '#fff'); }
      // 진행 방향
      c.fillStyle = 'rgba(29,36,51,.8)'; c.beginPath(); c.roundRect(12, H - 30, 150, 28, 14); c.fill(); txt(c, '버스 진행 →', 87, H - 9, '#fff', '800 18px');
    }
    function ballPos(hx, hy, ppm) {
      if (!fly || fly.ph === 'done') return { x: hx, y: hy - 0.06 * ppm };
      return { x: hx + fly.x * ppm, y: hy - fly.y * ppm - 0.06 * ppm };
    }
    // ---------- 그림: 길가 ----------
    function drawRoad(c, W, H) {
      const R = layRoad(W, H), ppm = R.ppm, X = (m) => m * ppm, rearX = X(roadX), busY = R.road;
      let g = c.createLinearGradient(0, 0, 0, R.curb); g.addColorStop(0, '#5ea3dc'); g.addColorStop(1, '#d6ebf5'); c.fillStyle = g; c.fillRect(0, 0, W, R.curb);
      // 건물(가만히)
      for (let i = 0; i < 9; i++) { const bx = i * W / 8 - 20 + 30 * A.hash(i, 1), bw = W / 9 + 20 * A.hash(i, 2), bh = 120 + 150 * A.hash(i, 3), col = ['#d9cbb2', '#c9d3dc', '#e3c1a6', '#cfd8c4'][i % 4];
        c.fillStyle = col; c.fillRect(bx, R.curb - bh, bw, bh); c.fillStyle = 'rgba(60,80,105,.4)'; for (let wy = R.curb - bh + 10; wy < R.curb - 20; wy += 22) for (let wx = bx + 8; wx < bx + bw - 14; wx += 18) c.fillRect(wx, wy, 9, 12); }
      // 먼 인도·차도
      c.fillStyle = '#c9c3b8'; c.fillRect(0, R.curb - 14, W, 14); c.fillStyle = '#9b958b'; c.fillRect(0, R.curb, W, 5);
      g = c.createLinearGradient(0, R.curb, 0, H); g.addColorStop(0, '#5b5e63'); g.addColorStop(1, '#45484d'); c.fillStyle = g; c.fillRect(0, R.curb + 5, W, H - R.curb);
      c.fillStyle = '#f2f2ea'; for (let x = 10; x < W; x += 90) c.fillRect(x, R.curb + 30, 50, 5);
      // 땅에 남은 공의 길(포물선)
      const grd = trail.map((p) => ({ x: X(p.gx), y: busY - X(R.floorH + HAND + p.y) - 0.06 * ppm }));
      // 버스(차체)
      const bl = X(BUSL), top = busY - X(3.0), wb = busY - X(1.2), wt = busY - X(2.55);
      g = c.createLinearGradient(0, top, 0, busY); g.addColorStop(0, '#45b06e'); g.addColorStop(0.55, '#2f8f55'); g.addColorStop(1, '#1f6a3d'); c.fillStyle = g;
      c.beginPath(); c.roundRect(rearX, top, bl, busY - top - X(0.25), [18, 26, 8, 8]); c.fill();
      // 창 안(밝은 실내 + 승객)
      c.save(); c.beginPath(); c.roundRect(rearX + X(0.3), wt, bl - X(0.65), wb - wt, 8); c.clip();
      c.fillStyle = '#e4ddcc'; c.fillRect(rearX, wt, bl, wb - wt);
      const fl = busY - X(R.floorH), hx = rearX + X(HANDL + 0.34), px = rearX + X(HANDL);
      A.pole(c, px - X(0.42), wt - 10, wb + 40);
      A.person(c, Object.assign({ x: px, y: fl, s: ppm, lean, back: { x: px - X(0.42) + 4, y: fl - X(1.28) }, hold: { x: hx, y: fl - X(HAND) + 3 } }, ADULT));
      c.restore();
      for (let k = 1; k < 5; k++) { const x = rearX + X(0.3) + (bl - X(0.65)) * k / 5; c.fillStyle = '#1f5c36'; c.fillRect(x - 4, wt, 8, wb - wt); }
      c.fillStyle = 'rgba(200,230,255,.2)'; c.fillRect(rearX + X(0.3), wt, bl - X(0.65), wb - wt); c.strokeStyle = '#1a3d28'; c.lineWidth = 4; c.beginPath(); c.roundRect(rearX + X(0.3), wt, bl - X(0.65), wb - wt, 8); c.stroke();
      c.fillStyle = '#f4f1e6'; c.fillRect(rearX, wb + 8, bl, 7); // 띠
      c.fillStyle = '#fff6b0'; c.beginPath(); c.roundRect(rearX + bl - 16, busY - X(0.8), 12, 22, 4); c.fill(); c.fillStyle = '#d0402a'; c.fillRect(rearX + 2, busY - X(0.8), 10, 22);
      [0.17, 0.8].forEach((u) => { const wx = rearX + bl * u, wy = busY - X(0.43), r = X(0.43), rot = (dist / 0.43) % TAU;
        c.fillStyle = '#16181b'; c.beginPath(); c.arc(wx, wy, r, 0, TAU); c.fill(); c.fillStyle = '#9aa0a8'; c.beginPath(); c.arc(wx, wy, r * 0.5, 0, TAU); c.fill();
        c.strokeStyle = '#5a6068'; c.lineWidth = 3; for (let k = 0; k < 5; k++) { const a = rot + k * TAU / 5; c.beginPath(); c.moveTo(wx, wy); c.lineTo(wx + Math.cos(a) * r * 0.5, wy + Math.sin(a) * r * 0.5); c.stroke(); } });
      // 포물선과 공
      if (grd.length > 1) { c.strokeStyle = 'rgba(255,216,77,.95)'; c.setLineDash([8, 6]); c.lineWidth = 3.5; c.beginPath(); grd.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.stroke(); c.setLineDash([]); grd.forEach((p, i) => A.ball(c, p.x, p.y, 0.06 * ppm + 2, 0.2 + 0.3 * i / grd.length)); }
      const bp = ballPos(hx, fl - X(HAND), ppm); A.ball(c, bp.x, bp.y, 0.06 * ppm + 2);
      if (fly && fly.res && fly.ph !== 'air' && fly.ph !== 'done') A.tag(c, fly.res === 'hand' ? '손으로 다시!' : fly.res === 'front' ? '앞쪽에 떨어짐' : '뒤쪽에 떨어짐', clamp(bp.x, 90, W - 90), top - 24, fly.res === 'hand' ? '#1f7a3a' : '#b0301f', '#fff');
      // 정류장 사람(앞쪽 인도)
      g = c.createLinearGradient(0, H - 26, 0, H); g.addColorStop(0, '#d8d2c6'); g.addColorStop(1, '#bdb6a8'); c.fillStyle = g; c.fillRect(0, H - 26, W, 26); c.fillStyle = '#8f897e'; c.fillRect(0, H - 26, W, 3);
      const sx = R.stopX; c.fillStyle = '#5d6670'; c.fillRect(sx + 52, H - 26 - 230, 7, 230); c.fillStyle = '#1f5fae'; c.beginPath(); c.arc(sx + 55, H - 250, 30, 0, TAU); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 3; c.stroke(); txt(c, '정류장', sx + 55, H - 243, '#fff', '800 18px');
      A.person(c, { x: sx, y: H - 8, s: ppm * 1.12, h: 1.62, shirt: '#c0582f', pants: '#3b3f4a', skin: '#f2c9a3', hair: '#3a2416', long: true, lean: 0 });
      if (armed && !flying()) A.tag(c, '정류장 앞에 오면 던진다', W / 2, top - 24, 'rgba(29,36,51,.85)', '#ffd84d');
      return grd;
    }
    // ---------- 손잡이 판·표지판 ----------
    function drawUI(c, W) {
      c.fillStyle = 'rgba(255,255,255,.93)'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.roundRect(LV.x, LV.y, LV.w, LV.h, 12); c.fill(); c.stroke();
      txt(c, '공이 떠 있는 동안 버스는', LV.x + LV.w / 2, LV.y + 25, '#1d2433', '800 18px');
      const x0 = lvX(AMIN), x1 = lvX(AMAX), xm = lvX(0);
      let g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, '#d9483b'); g.addColorStop((xm - x0) / (x1 - x0), '#e9e6dc'); g.addColorStop(1, '#2f8a4a'); c.fillStyle = g; c.beginPath(); c.roundRect(x0, lvY - 6, x1 - x0, 12, 6); c.fill();
      c.fillStyle = '#1d2433'; c.fillRect(xm - 1.5, lvY - 12, 3, 24);
      const kx = lvX(aSet); c.fillStyle = '#ffd84d'; c.strokeStyle = '#1d2433'; c.lineWidth = 3; c.beginPath(); c.arc(kx, lvY, 17, 0, TAU); c.fill(); c.stroke();
      txt(c, '브레이크', x0 - 4, LV.y + LV.h - 10, '#b0301f', '800 18px', 'left'); txt(c, '그대로', xm, LV.y + LV.h - 10, '#1d2433', '800 18px'); txt(c, '가속', x1 + 4, LV.y + LV.h - 10, '#1f6a3d', '800 18px', 'right');
      signs(W).forEach((sg) => { const on = sg.k === view; c.fillStyle = '#6b4a2b'; c.fillRect(sg.x + sg.w / 2 - 3, sg.y + sg.h, 6, 14); c.fillStyle = on ? '#ffd84d' : '#f3ead7'; c.strokeStyle = '#1d2433'; c.lineWidth = on ? 3 : 2; c.beginPath(); c.roundRect(sg.x, sg.y, sg.w, sg.h, 8); c.fill(); c.stroke(); txt(c, sg.t, sg.x + sg.w / 2, sg.y + 31, '#1d2433', '800 21px'); });
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; if (fade > 0) fade = Math.max(0, fade - dt * 2.5);
        const sl = flying() ? SLOW : 1; for (let k = 0; k < 4; k++) step(dt * sl / 4);
        // 길가: 버스가 오른쪽으로 빠져나가면 다시 왼쪽에서 온다(공이 떠 있을 때는 그대로)
        const R = layRoad(W, H);
        if (!flying() && roadX * R.ppm > W + 30) { roadX = -BUSL - 0.5; if (view === 'road') { trail = []; if (fly) fly.ph = 'done'; } }
        if (armed && !flying()) { const hx = handGX() * R.ppm; if (hx > W * 0.2 && hx < W * 0.42) toss(armed); }
        if (view === 'bus') drawBus(c, W, H); else drawRoad(c, W, H);
        drawUI(c, W);
        if (flying()) { c.font = '800 20px "IBM Plex Sans KR", sans-serif'; c.fillStyle = 'rgba(255,251,230,.92)'; c.beginPath(); c.roundRect(W - 140, H - (view === 'bus' ? 70 : 74), 124, 34, 17); c.fill(); txt(c, '느린 화면', W - 78, H - (view === 'bus' ? 46 : 50), '#5a3a1a', '800 20px'); }
        if (fade > 0) { c.fillStyle = `rgba(0,0,0,${fade})`; c.fillRect(0, 0, W, H); }
        // 안내 한 줄
        if (flying()) say(view === 'bus' ? '버스 안: 곧게 오르내린다' : '길가: 앞으로 날며 포물선');
        else if (fly && fly.res) say(fly.res === 'hand' ? '손으로 다시! 공도 버스와 함께 달렸다' : fly.res === 'front' ? '브레이크! 공은 하던 대로 앞쪽에' : '가속! 공이 못 따라가 뒤쪽에', fly.res === 'hand');
        else if (armed) say('정류장 앞에서 던진다');
        else say(view === 'bus' ? '공을 누르거나 위로 끌어 던지자' : '길가: 화면을 눌러 두자');
      },
      down(p) {
        const sg = signs(S.W).find((q) => p.x >= q.x - 6 && p.x <= q.x + q.w + 6 && p.y >= q.y - 6 && p.y <= q.y + q.h + 16);
        if (sg) { if (sg.k !== view) { view = sg.k; fade = 0.8; } return; }
        if (p.x >= LV.x && p.x <= LV.x + LV.w && p.y >= LV.y && p.y <= LV.y + LV.h + 8) { drag = 'lever'; if (!flying()) aSet = aFromX(p.x); return; }
        if (flying()) return;
        drag = 'toss'; aim = { y0: p.y, pull: 0 };
      },
      move(p) {
        if (drag === 'lever') { if (!flying()) aSet = aFromX(p.x); }
        else if (drag === 'toss' && aim) aim.pull = clamp(aim.y0 - p.y, 0, 160);
      },
      up() {
        if (drag === 'toss' && aim) { const v0 = aim.pull < 12 ? 3.2 : 2.3 + aim.pull / 160 * 1.5; aim = null; if (view === 'bus') toss(v0); else armed = v0; }
        drag = null;
      },
      key(e) {
        const k = e.key;
        if (k === ' ' || k === 'Enter') { if (view === 'bus') toss(3.2); else armed = 3.2; return true; }
        if (k === 'ArrowLeft' || k === 'ArrowRight') { if (!flying()) aSet = clamp(aSet + (k === 'ArrowLeft' ? -1 : 1), AMIN, AMAX); return true; }
        if (k === 'ArrowUp' || k === 'ArrowDown') { const v0 = k === 'ArrowUp' ? 3.8 : 2.6; if (view === 'bus') toss(v0); else armed = v0; return true; }
        if (k === '1' || k === '2') { view = k === '1' ? 'bus' : 'road'; fade = 0.8; return true; }
        if (k === '0') { reset(); return true; } return false;
      },
    });
    const state = () => ({ view, aSet, V: +V.toFixed(2), ph: fly && fly.ph, res: fly && fly.res, x: fly ? +fly.x.toFixed(3) : 0, trail: trail.length, armed: !!armed });
    root._bt = {
      view: (v) => { view = v; S.kick(); return state(); },
      accel: (a) => { aSet = clamp(a, AMIN, AMAX); return state(); },
      toss: (v0 = 3.2) => { toss(v0); S.kick(); return state(); },
      run: (sec) => { for (let i = 0; i < sec * 500; i++) step(0.002); S.kick(); return state(); },
      state,
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.BusToss = { mount };
})();
