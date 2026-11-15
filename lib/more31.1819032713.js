/* 3-1 늘린 장(2026-11-13) 체험 여섯 가지. More31.mount(root, 종류) → { fit, setActive }
   종류: moho(대륙·바다 밑 지각 두께 재기) scale(지구를 1억분의 1로 줄이기) — 3-1-1 1차시 · water(지구의 물 나눠 담기) — 3-1-1 2차시
         sieve(화산 쇄설물 체로 거르기) watch(감시 기록으로 경보 시점 고르기) geo(땅속 열로 전기 만들기) — 3-1-2 2차시
   장 구조: .mx-stage · .mx-now · .mx-out · .mx-reset · .u-steps li[data-s] · .xp-pred(예측). 손가락 안내는 처음 한 번만.
   시험용: root._mx.state() · root._mx.act(이름, …) · root._mx.pick(번호) */
(function () {
  'use strict';
  const TAU = Math.PI * 2, F = '"IBM Plex Sans KR", sans-serif', EL = '#ffd84d', DIM = '#c8d4f0', INK = '#1d2433';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k, ease = (u) => u * u * (3 - 2 * u);
  const COL = { A: '#ffd84d', T: '#f2a03d', G: '#5cc77a', C: '#5aa9f0', S: '#9b6bd6', P: '#e0503f' }, MATE = { A: 'T', T: 'A', G: 'C', C: 'G' };
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); const f = (v) => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
  const txt = (c, t, x, y, col = '#fbfcf9', f = '700 18px', al = 'center') => { c.fillStyle = col; c.font = `${f} ${F}`; c.textAlign = al; c.fillText(t, x, y); };
  const glow = (c, x, y, r, col) => window.Play.glow(c, x, y, r, col);
  const near = (p, x, y, r) => Math.hypot(p.x - x, p.y - y) < r;
  const inR = (p, x, y, w, h) => p.x > x && p.x < x + w && p.y > y && p.y < y + h;
  function pill(c, x, y, t, bg, fg = INK, f = '800 16px', al = 'center') {
    c.font = `${f} ${F}`; const w = c.measureText(t).width + 22, x0 = al === 'left' ? x : al === 'right' ? x - w : x - w / 2;
    c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.roundRect(x0 + 1, y - 12, w, 28, 14); c.fill();
    c.fillStyle = bg; c.beginPath(); c.roundRect(x0, y - 14, w, 28, 14); c.fill(); txt(c, t, x0 + w / 2, y + 6, fg, f);
  }
  function arrow(c, x0, y0, x1, y1, w, col) {
    const a = Math.atan2(y1 - y0, x1 - x0), hl = 8 + w * 1.6;
    c.strokeStyle = col; c.fillStyle = col; c.lineWidth = w; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1 - Math.cos(a) * hl * 0.8, y1 - Math.sin(a) * hl * 0.8); c.stroke(); c.lineCap = 'butt';
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - Math.cos(a - 0.45) * hl, y1 - Math.sin(a - 0.45) * hl); c.lineTo(x1 - Math.cos(a + 0.45) * hl, y1 - Math.sin(a + 0.45) * hl); c.closePath(); c.fill();
  }
  function ball(c, x, y, r, col) {
    c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(x + r * 0.15, y + r * 0.3, r, r * 0.9, 0, 0, TAU); c.fill();
    const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); g.addColorStop(0, shade(col, 0.55)); g.addColorStop(0.45, col); g.addColorStop(1, shade(col, -0.45));
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(x - r * 0.35, y - r * 0.45, r * 0.3, r * 0.18, -0.5, 0, TAU); c.fill();
  }
  function tile(c, x, y, w, h, col, t, f = '800 17px', a = 1) {
    c.save(); c.globalAlpha = a;
    c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.roundRect(x - w / 2 + 1.5, y - h / 2 + 3, w, h, 7); c.fill();
    const g = c.createLinearGradient(0, y - h / 2, 0, y + h / 2); g.addColorStop(0, shade(col, 0.45)); g.addColorStop(0.55, col); g.addColorStop(1, shade(col, -0.3));
    c.fillStyle = g; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, 7); c.fill(); c.strokeStyle = shade(col, -0.45); c.lineWidth = 1.2; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.38)'; c.beginPath(); c.roundRect(x - w / 2 + 3, y - h / 2 + 2, w - 6, h * 0.22, 4); c.fill();
    if (t) txt(c, t, x, y + 6, INK, f);
    c.restore();
  }
  function bg(c, W, H, a = '#16224a', b = '#0b1128') {
    const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(0, 0, W, H);
    const v = c.createRadialGradient(W / 2, H * 0.4, Math.min(W, H) * 0.2, W / 2, H * 0.45, Math.max(W, H) * 0.75); v.addColorStop(0, 'rgba(90,120,200,.10)'); v.addColorStop(1, 'rgba(0,0,0,.35)'); c.fillStyle = v; c.fillRect(0, 0, W, H);
  }
  function table(c, W, H, y) {
    const g = c.createLinearGradient(0, y, 0, H); g.addColorStop(0, '#8a6544'); g.addColorStop(1, '#4b3424'); c.fillStyle = g; c.fillRect(0, y, W, H - y);
    c.strokeStyle = 'rgba(0,0,0,.12)'; c.lineWidth = 2; for (let i = 0; i < 6; i++) { c.beginPath(); c.moveTo(0, y + 14 + i * (H - y) / 6); c.bezierCurveTo(W * 0.3, y + 8 + i * (H - y) / 6, W * 0.7, y + 22 + i * (H - y) / 6, W, y + 12 + i * (H - y) / 6); c.stroke(); }
    c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(0, y, W, 2);
  }
  // 손가락 안내: 손끝 (x,y)에서 (dx,dy)로 미끄러짐. dx=dy=0이면 제자리 누르기
  function hand(c, x, y, dx, dy, t) {
    const u = (t % 1.8) / 1.8, k = ease(clamp(u / 0.8, 0, 1)), a = u < 0.85 ? 1 : 1 - (u - 0.85) / 0.15, tap = !dx && !dy;
    const hx = x + dx * k, hy = y + dy * k + (tap ? Math.max(0, Math.sin(u * TAU * 2)) * -8 : 0);
    c.save();
    if (!tap) { c.strokeStyle = 'rgba(255,216,77,.85)'; c.lineWidth = 3; c.setLineDash([8, 7]); c.beginPath(); c.moveTo(x, y - 34); c.lineTo(x + dx, y + dy - 34); c.stroke(); c.setLineDash([]); arrow(c, x + dx * 0.9, y + dy * 0.9 - 34, x + dx, y + dy - 34, 3, 'rgba(255,216,77,.95)'); }
    c.globalAlpha = a; c.translate(hx, hy);
    c.fillStyle = 'rgba(255,216,77,.35)'; c.beginPath(); c.arc(0, 0, 14 + 6 * Math.sin(t * 6), 0, TAU); c.fill();
    c.fillStyle = '#fff'; c.strokeStyle = INK; c.lineWidth = 2.2; c.lineJoin = 'round';
    c.beginPath(); c.roundRect(-6, -2, 12, 30, 6); c.fill(); c.stroke();
    c.beginPath(); c.roundRect(-8, 20, 30, 26, 9); c.fill(); c.stroke();
    [4, 12].forEach((ox) => { c.beginPath(); c.roundRect(ox - 1, 15, 9, 14, 4.5); c.fill(); c.stroke(); });
    c.beginPath(); c.ellipse(-10, 30, 6, 10, -0.5, 0, TAU); c.fill(); c.stroke();
    c.restore();
  }
  // 투명 유리컵(눈금·광택)
  function glass(c, x, y, w, h) {
    c.save(); c.strokeStyle = 'rgba(220,235,255,.85)'; c.lineWidth = 3;
    c.beginPath(); c.moveTo(x - w / 2, y - h); c.lineTo(x - w / 2 + 4, y - 6); c.quadraticCurveTo(x - w / 2 + 6, y, x - w / 2 + 14, y); c.lineTo(x + w / 2 - 14, y); c.quadraticCurveTo(x + w / 2 - 6, y, x + w / 2 - 4, y - 6); c.lineTo(x + w / 2, y - h); c.stroke();
    c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(x - w / 2 + 8, y - h + 10, 6, h - 24);
    c.strokeStyle = 'rgba(220,235,255,.5)'; c.lineWidth = 1.5; for (let i = 1; i < 5; i++) { c.beginPath(); c.moveTo(x + w / 2 - 16, y - h * i / 5); c.lineTo(x + w / 2 - 6, y - h * i / 5); c.stroke(); }
    c.restore();
  }
  function bottle(c, x, y, w, h, col, label, tilt = 0, cap = '#e8e8e8') {
    c.save(); c.translate(x, y); c.rotate(tilt);
    c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.roundRect(-w / 2 + 3, -h + 4, w, h, 10); c.fill();
    const g = c.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, shade(col, 0.35)); g.addColorStop(0.45, col); g.addColorStop(1, shade(col, -0.4));
    c.fillStyle = g; c.beginPath(); c.roundRect(-w / 2, -h, w, h, 10); c.fill();
    c.fillStyle = cap; c.fillRect(-w * 0.18, -h - 14, w * 0.36, 16); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-w * 0.18, -h - 2, w * 0.36, 3);
    c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.roundRect(-w / 2 + 5, -h * 0.62, w - 10, h * 0.3, 4); c.fill();
    txt(c, label, 0, -h * 0.42, INK, `800 ${Math.round(Math.min(15, w * 0.24))}px`);
    c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(-w / 2 + 5, -h + 8, 5, h - 18);
    c.restore();
  }

  const KINDS = {};
  // ─────────── 공용: 땅속 단면 색 ───────────
  const rockBand = (c, x, y, w, h, a, b) => { const g = c.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(x, y, w, h); };
  function speckle(c, x, y, w, h, n, col, seed = 1) { c.fillStyle = col; for (let i = 0; i < n; i++) { const u = (Math.sin(i * 12.9898 + seed) * 43758.5453) % 1, v = (Math.sin(i * 78.233 + seed) * 12345.678) % 1; c.fillRect(x + Math.abs(u) * w, y + Math.abs(v) * h, 2.5, 2); } }

  // ─────────── 1. 대륙과 바다 밑 지각 두께 재기(3-1-1 1차시) ───────────
  // 깊이 0~50 km를 세로로 부풀려 그린다. 대륙 약 35 km · 해양 약 5~6 km(모호면 깊이)
  KINDS.moho = {
    first: '왼쪽은 대륙, 오른쪽은 바다다. <b>시추 장비</b>를 원하는 곳으로 끌어 놓거나 눌러 보자. 손을 떼면 그 자리에서 땅을 뚫어 <b>모호면</b>(지각과 맨틀의 경계)까지 내려간다.',
    steps: ['① 시추 장비를 대륙 위에 두고 모호면까지 뚫는다', '② 바다 위로 옮겨 다시 뚫는다', '③ 두 곳의 암석 표본을 눌러 견준다'],
    done: '해양 지각은 얇고, 대륙 지각은 두껍다',
    init: () => ({ x: 0.22, drill: 0, got: {}, drag: false, pick: new Set(), spin: 0, armed: false, moved: 0 }),
    geo(W, H) { return { sea: H * 0.3, top: H * 0.3, d2y: (d) => H * 0.3 + d / 50 * H * 0.6, coast: W * 0.56 }; },
    // thick = 모호면 깊이(해수면 기준 km): 대륙 35 · 바다 9(바다 깊이 4 + 해양 지각 5)
    thick(u) { return u < 0.5 ? 35 : u > 0.66 ? 9 : lerp(35, 9, ease((u - 0.5) / 0.16)); },
    surf(u, g, H) { return Math.max(0, (this.land(u, g, H) - g.top) / (H * 0.6) * 50); },
    land(u, g, H) { return u < 0.52 ? g.top - 22 - 16 * Math.sin(u * 9) : u < 0.62 ? lerp(g.top - 10, g.d2y(4), ease((u - 0.52) / 0.1)) : g.d2y(4) + 2 * Math.sin(u * 40); },
    draw(c, W, H, st, t, dt, api) {
      const g = this.geo(W, H), N = 80, xs = Array.from({ length: N + 1 }, (_, i) => i / N);
      // 하늘
      const sk = c.createLinearGradient(0, 0, 0, g.top); sk.addColorStop(0, '#5d8fd0'); sk.addColorStop(1, '#bcd9f2'); c.fillStyle = sk; c.fillRect(0, 0, W, g.top + 40);
      // 맨틀(아래 전체) — 천천히 흐르는 무늬
      rockBand(c, 0, g.top, W, H - g.top, '#c8642e', '#7a2a16');
      c.save(); c.globalAlpha = 0.18; c.strokeStyle = '#ffd0a0'; c.lineWidth = 3; for (let k = 0; k < 5; k++) { c.beginPath(); for (let i = 0; i <= N; i++) { const x = W * i / N, y = H * (0.8 + k * 0.04) + 8 * Math.sin(i * 0.3 + t * 0.4 + k); if (i) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke(); } c.restore();
      // 지각: 대륙(화강암질, 밝은 회분홍) · 해양(현무암질, 어두운 회색)
      c.beginPath(); xs.forEach((u, i) => c[i ? 'lineTo' : 'moveTo'](u * W, this.land(u, g, H))); for (let i = N; i >= 0; i--) c.lineTo(xs[i] * W, g.d2y(this.thick(xs[i]))); c.closePath();
      const cg = c.createLinearGradient(0, 0, W, 0); cg.addColorStop(0, '#c9b2a6'); cg.addColorStop(0.5, '#b79d90'); cg.addColorStop(0.62, '#4f5560'); cg.addColorStop(1, '#3d424c'); c.fillStyle = cg; c.fill();
      speckle(c, 0, g.top - 30, W * 0.56, g.d2y(35) - g.top + 30, 160, 'rgba(255,255,255,.18)', 3); speckle(c, W * 0.62, g.d2y(4) + 2, W * 0.38, g.d2y(9) - g.d2y(4) - 4, 60, 'rgba(0,0,0,.25)', 7);
      // 모호면 점선
      c.save(); c.strokeStyle = '#ffe9a8'; c.lineWidth = 2.5; c.setLineDash([9, 7]); c.beginPath(); xs.forEach((u, i) => c[i ? 'lineTo' : 'moveTo'](u * W, g.d2y(this.thick(u)))); c.stroke(); c.restore();
      pill(c, W * 0.3, g.d2y(35) + 22, '모호면', 'rgba(255,233,168,.95)', INK, '800 15px');
      // 바다·땅 위
      const sea = c.createLinearGradient(0, g.top, 0, g.top + 40); sea.addColorStop(0, 'rgba(60,140,210,.95)'); sea.addColorStop(1, 'rgba(20,70,140,.95)');
      c.fillStyle = sea; c.beginPath(); c.moveTo(g.coast, g.top); for (let x = g.coast; x <= W; x += 8) c.lineTo(x, g.top + 2 * Math.sin(x * 0.05 + t * 2)); c.lineTo(W, g.top + 40); for (let i = N; i >= 0; i--) { const u = xs[i]; if (u * W < g.coast) break; c.lineTo(u * W, this.land(u, g, H)); } c.closePath(); c.fill();
      c.fillStyle = '#5f9a4e'; c.beginPath(); xs.forEach((u, i) => { if (u * W > g.coast + 6) return; c[i ? 'lineTo' : 'moveTo'](u * W, this.land(u, g, H) - 2); }); c.lineTo(g.coast + 6, this.land(0.565, g, H) + 6); c.lineTo(0, this.land(0, g, H) + 6); c.fill();
      [0.06, 0.12, 0.17, 0.36, 0.45].forEach((u, i) => { const x = u * W, y = this.land(u, g, H) - 1, s2 = 1 + (i % 2) * 0.3, sw = Math.sin(t * 1.3 + i) * 1.2; c.fillStyle = '#5a3d2a'; c.fillRect(x - 2, y - 12 * s2, 4, 12 * s2); const tg = c.createRadialGradient(x - 3 + sw, y - 22 * s2, 1, x + sw, y - 18 * s2, 11 * s2); tg.addColorStop(0, '#7ccf6a'); tg.addColorStop(1, '#2b7a3d'); c.fillStyle = tg; c.beginPath(); c.moveTo(x + sw, y - 34 * s2); c.lineTo(x - 10 * s2 + sw, y - 10 * s2); c.lineTo(x + 10 * s2 + sw, y - 10 * s2); c.closePath(); c.fill(); });
      [[0.25, '#c95353'], [0.29, '#3d7fb0']].forEach(([u, rf]) => { const x = u * W, y = this.land(u, g, H); c.fillStyle = '#efe6d2'; c.fillRect(x - 9, y - 14, 18, 14); c.fillStyle = rf; c.beginPath(); c.moveTo(x - 12, y - 14); c.lineTo(x, y - 24); c.lineTo(x + 12, y - 14); c.fill(); c.fillStyle = '#5a6a8a'; c.fillRect(x - 3, y - 9, 6, 9); });
      // 깊이 눈금
      for (let d = 0; d <= 50; d += 10) { const y = g.d2y(d); c.fillStyle = 'rgba(255,255,255,.75)'; c.fillRect(W - 46, y - 1, 10, 2); txt(c, `${d}`, W - 30, y + 5, '#fbfcf9', '700 13px', 'left'); }
      txt(c, '깊이(km)', W - 8, g.top - 8, '#1d2433', '700 13px', 'right');
      txt(c, '대륙 지각', W * 0.14, g.d2y(14), '#3a2a24', '800 18px'); txt(c, '해양 지각', st.x > 0.76 ? W * 0.68 : W * 0.86, g.d2y(7) + 5, '#e8ecf6', '800 14px'); txt(c, '바다', W * 0.9, g.d2y(2) + 5, '#cfe7ff', '700 13px'); txt(c, '맨틀', W * 0.5, H * 0.95, '#ffe0c0', '800 20px');
      // 시추 장비(대륙: 탑 / 바다: 배)
      const x = st.x * W, onSea = x > g.coast + 10, sy = onSea ? g.top + Math.sin(t * 2) * 2 : this.land(st.x, g, H), th = this.thick(st.x), bottom = g.d2y(th), fy = this.land(st.x, g, H);
      const dy = lerp(fy, bottom, st.drill);
      if (onSea) { c.strokeStyle = '#9aa2b2'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, sy); c.lineTo(x, fy); c.stroke(); }
      if (st.drill > 0) { c.strokeStyle = '#2a2d36'; c.lineWidth = 7; c.beginPath(); c.moveTo(x, fy); c.lineTo(x, dy); c.stroke(); c.strokeStyle = '#9aa2b2'; c.lineWidth = 3; c.stroke();
        c.save(); c.translate(x, dy); c.rotate(st.spin); c.fillStyle = '#e4572e'; c.beginPath(); c.moveTo(-8, -8); c.lineTo(8, -8); c.lineTo(0, 10); c.fill(); c.restore(); if (st.drill < 1) for (let i = 0; i < 3; i++) { c.fillStyle = 'rgba(255,230,180,.6)'; c.beginPath(); c.arc(x + Math.sin(t * 20 + i * 2) * 10, dy - 6 - i * 4, 2, 0, TAU); c.fill(); } }
      c.save(); c.translate(x, sy);
      if (onSea) { c.fillStyle = '#e8ecf6'; c.beginPath(); c.moveTo(-46, -6); c.lineTo(46, -6); c.lineTo(34, 10); c.lineTo(-34, 10); c.closePath(); c.fill(); c.fillStyle = '#e4572e'; c.fillRect(-46, -6, 92, 4); }
      c.strokeStyle = '#f2c230'; c.lineWidth = 3; c.beginPath(); c.moveTo(-18, -6); c.lineTo(0, -64); c.lineTo(18, -6); c.moveTo(-12, -26); c.lineTo(12, -26); c.moveTo(-8, -44); c.lineTo(8, -44); c.stroke();
      c.fillStyle = '#e4572e'; c.fillRect(-4, -70, 8, 8); c.restore();
      if (st.drill >= 1) pill(c, x, bottom + 24, onSea ? `해저에서 약 ${Math.round(th - this.surf(st.x, g, H))} km` : `지각 두께 약 ${Math.round(th - this.surf(st.x, g, H))} km`, EL, INK, '800 16px');
      if (!st.armed && !st.drag) pill(c, x, sy - 92, '옮기거나 눌러서 뚫기', 'rgba(16,20,32,.85)', EL, '700 13px');
      // 표본(뚫은 곳마다)
      const card = (k, cx, lab, col, dens) => {
        if (!st.got[k]) return; const on = st.pick.has(k);
        c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.roundRect(cx - 74 + 3, H * 0.06 + 4, 148, 78, 10); c.fill();
        c.fillStyle = on ? '#fffbe6' : 'rgba(255,255,255,.9)'; c.beginPath(); c.roundRect(cx - 74, H * 0.06, 148, 78, 10); c.fill(); c.strokeStyle = on ? '#e4572e' : '#5a6a8a'; c.lineWidth = 2; c.stroke();
        const rg = c.createLinearGradient(cx - 60, 0, cx - 20, 0); rg.addColorStop(0, shade(col, 0.3)); rg.addColorStop(1, shade(col, -0.3)); c.fillStyle = rg; c.beginPath(); c.roundRect(cx - 62, H * 0.06 + 14, 38, 50, 8); c.fill(); speckle(c, cx - 60, H * 0.06 + 16, 34, 46, 30, k === 'land' ? 'rgba(255,255,255,.5)' : 'rgba(0,0,0,.35)', k === 'land' ? 2 : 5);
        txt(c, lab, cx + 22, H * 0.06 + 30, INK, '800 15px'); txt(c, `두께 약 ${st.got[k]} km`, cx + 22, H * 0.06 + 50, '#3a4766', '700 13px');
        if (on) txt(c, dens, cx + 20, H * 0.06 + 70, '#c0392b', '800 12px');
      };
      card('land', W * 0.62, '대륙 지각', '#c9b2a6', '밀도 작다(가볍다)'); card('sea', W * 0.84, '해양 지각', '#4f5560', '밀도 크다(무겁다)');
      if (st.drill < 1 && !st.drag && st.armed) { st.drill = Math.min(1, st.drill + dt * 0.45); st.spin += dt * 12; if (st.drill >= 1) this.finish(st, api); }
    },
    finish(st, api) {
      const g0 = this.geo(api.W, api.H), th = Math.round(this.thick(st.x) - this.surf(st.x, g0, api.H)), k = st.x < 0.5 ? 'land' : st.x > 0.66 ? 'sea' : null;
      if (k) { st.got[k] = th; api.ok(1, !!st.got.land); api.ok(2, !!st.got.sea && !!st.got.land); } // 두 곳을 다 뚫어야 ②와 예측 판정(대륙 35 km·바다 5 km 비교)이 열린다
      api.say(k === 'land' ? `대륙 아래는 약 <b>${th} km</b>를 뚫어야 맨틀이 나온다. ${st.got.sea ? '' : '이제 바다 위로 옮겨 보자.'}` : k === 'sea' ? `바다 밑은 해저(약 4 km 깊이)에서 약 <b>${th} km</b>만 뚫으면 맨틀이다 — 대륙보다 훨씬 얇다. ${st.got.land ? '위의 표본을 눌러 보자.' : '대륙 위에서도 뚫어 보자.'}` : '대륙과 바다의 경계 — 지각이 차츰 얇아진다.');
    },
    hint(st, W, H) { return !st.got.land ? [st.x * W, H * 0.22, W * 0.1, 0] : !st.got.sea ? [st.x * W, H * 0.22, W * 0.78 - st.x * W, 0] : st.pick.size < 2 ? [W * (st.pick.has('land') ? 0.84 : 0.62), H * 0.13, 0, 0] : null; },
    down(st, p, api) {
      const W = api.W, H = api.H;
      if (p.y < H * 0.06 + 80 && p.y > H * 0.06) { const k = st.got.land && Math.abs(p.x - W * 0.62) < 74 ? 'land' : st.got.sea && Math.abs(p.x - W * 0.84) < 74 ? 'sea' : null; if (k) { this.pickIt(st, api, k); return; } }
      if (Math.abs(p.x - st.x * W) < 70) { st.drag = true; st.ox = p.x - st.x * W; st.moved = 0; }
    },
    move(st, p, held, api) { if (held && st.drag) { const nx = clamp((p.x - st.ox) / api.W, 0.04, 0.9); st.moved += Math.abs(nx - st.x); st.x = nx; if (st.moved > 0.01) st.drill = 0; } },
    up(st) { if (st.drag) st.armed = true; st.drag = false; },
    pickIt(st, api, k) {
      st.pick.add(k);
      if (st.pick.size >= 2) { api.ok(3, true); api.say('<b>해양 지각</b>(주로 현무암)은 얇지만 밀도가 크고, <b>대륙 지각</b>(주로 화강암)은 두껍지만 밀도가 작다. 지각 아래가 맨틀이고, 그 경계가 모호면이다.'); }
      else api.say(k === 'land' ? '대륙 지각은 주로 <b>화강암</b>처럼 밝은 암석 — 밀도가 비교적 작다.' : '해양 지각은 주로 <b>현무암</b>처럼 어두운 암석 — 밀도가 비교적 크다.');
    },
    key(st, e, api) { if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { st.x = clamp(st.x + (e.key === 'ArrowRight' ? 0.04 : -0.04), 0.04, 0.9); st.drill = 0; st.armed = true; return true; } if (e.key === 'Enter') { st.armed = true; return true; } if (e.key === '1' || e.key === '2') { if (st.got[e.key === '1' ? 'land' : 'sea']) this.pickIt(st, api, e.key === '1' ? 'land' : 'sea'); return true; } return false; },
    act: { at: (st, api, x) => { st.x = x; st.drill = 1; st.armed = true; KINDS.moho.finish(st, api); return st.got; }, pick: (st, api, k) => KINDS.moho.pickIt(st, api, k) },
  };

  // ─────────── 2. 지구를 1억분의 1로 줄여 보기(3-1-1 1차시) ───────────
  // 깊이(km): 지각 0~35(대륙) · 맨틀 ~2900 · 외핵 ~5100 · 내핵 ~6400. 1억분의 1이면 1 km = 0.01 mm
  const LAY = [{ k: 'crust', n: '지각', a: 0, b: 35, col: '#b79d90', st: '고체' }, { k: 'mantle', n: '맨틀', a: 35, b: 2900, col: '#d0743a', st: '고체(천천히 흐름)' }, { k: 'outer', n: '외핵', a: 2900, b: 5100, col: '#f2b134', st: '액체' }, { k: 'inner', n: '내핵', a: 5100, b: 6400, col: '#fff0a0', st: '고체' }];
  const mm = (km) => km * 0.01; // 1억분의 1
  const fmt = (v) => (v >= 10 ? `${(v / 10).toFixed(v >= 100 ? 0 : 1)} cm` : `${v.toFixed(v < 1 ? 2 : 1)} mm`);
  KINDS.scale = {
    first: '왼쪽은 지구를 반으로 자른 단면이다. 아래 <b>노란 손잡이</b>를 오른쪽으로 끌어 지구를 <b>1억분의 1</b>로 줄여 보자.',
    steps: ['① 손잡이를 끝까지 끌어 지구를 1억분의 1로 줄인다', '② 층을 눌러 줄인 두께를 읽는다(셋 이상)', '③ 가장 얇은 층과 가장 부피가 큰 층을 찾는다'],
    done: '지각은 아주 얇고, 맨틀이 가장 크다',
    init: () => ({ s: 0, drag: false, seen: new Set(), sel: null }),
    draw(c, W, H, st, t, dt, api) {
      bg(c, W, H, '#0e1838', '#050913');
      for (let i = 0; i < 50; i++) { c.fillStyle = `rgba(255,255,255,${0.3 + 0.3 * Math.sin(t + i)})`; c.fillRect((i * 97.1) % W, (i * 41.3) % (H * 0.8), 1.6, 1.6); }
      const k = ease(st.s), R0 = Math.min(H * 0.4, W * 0.21), R = lerp(R0, H * 0.13, k), cx = lerp(W * 0.25, W * 0.22, k), cy = lerp(H * 0.46, H * 0.5, k);
      // 반으로 자른 지구: 오른쪽 반은 겉(바다·대륙), 왼쪽 반은 층
      c.save(); c.beginPath(); c.arc(cx, cy, R, -Math.PI / 2, Math.PI / 2); c.closePath(); c.clip();
      const oc = c.createRadialGradient(cx + R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R); oc.addColorStop(0, '#5aa9f0'); oc.addColorStop(1, '#14427a'); c.fillStyle = oc; c.fillRect(cx, cy - R, R, R * 2);
      { // 정사영으로 그린 대륙(중심 경도 서경 20°·위도 10°): 아프리카·유럽·아라비아·남아메리카 동쪽
        const l0 = -20, p0 = 10 * Math.PI / 180, pr = ([lo, la]) => { const a1 = (lo - l0) * Math.PI / 180, b1 = la * Math.PI / 180; return [cx + R * Math.cos(b1) * Math.sin(a1), cy - R * (Math.cos(p0) * Math.sin(b1) - Math.sin(p0) * Math.cos(b1) * Math.cos(a1))]; };
        const CONT = [
          [[-17, 15], [-17, 21], [-10, 30], [-6, 36], [10, 37], [20, 32], [32, 31], [35, 28], [43, 12], [51, 11], [42, 0], [40, -10], [35, -25], [20, -35], [18, -30], [12, -15], [9, 4], [5, 5], [-8, 5], [-15, 11]],
          [[-9, 43], [-9, 37], [-6, 36], [3, 43], [12, 44], [18, 40], [23, 37], [28, 41], [40, 41], [50, 45], [60, 55], [60, 70], [30, 70], [25, 71], [15, 69], [5, 62], [8, 57], [5, 53], [-1, 46]],
          [[35, 28], [43, 13], [52, 17], [57, 22], [56, 26], [50, 30], [48, 30], [35, 33]],
          [[-35, -6], [-39, -14], [-41, -22], [-48, -26], [-55, -35], [-58, -38], [-65, -40], [-75, -40], [-80, -5], [-77, 8], [-62, 11], [-50, 0]],
          [[-5, 50], [1, 51], [-2, 57], [-5, 58], [-6, 55], [-3, 54], [-5, 52]], [[44, -13], [50, -15], [49, -25], [44, -24]]];
        CONT.forEach((L) => { const lg = c.createLinearGradient(cx, cy - R, cx + R, cy + R); lg.addColorStop(0, '#8cc46e'); lg.addColorStop(0.6, '#5f9a4e'); lg.addColorStop(1, '#a8925e'); c.fillStyle = lg; c.strokeStyle = 'rgba(20,60,20,.45)'; c.lineWidth = 1; c.beginPath(); L.forEach((q, i) => { const [x, y] = pr(q); if (!i) c.moveTo(x, y); else c.lineTo(x, y); }); c.closePath(); c.fill(); c.stroke(); });
        c.fillStyle = 'rgba(240,248,255,.85)'; c.beginPath(); c.ellipse(cx + R * 0.15, cy - R * 0.97, R * 0.35, R * 0.06, 0, 0, TAU); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.ellipse(cx + R * 0.45, cy - R * 0.1 + Math.sin(t * 0.3) * 3, R * 0.25, R * 0.05, 0.3, 0, TAU); c.fill();
      c.restore();
      LAY.forEach((L, i) => {
        const r1 = R * (1 - L.a / 6400), r0 = R * (1 - L.b / 6400), on = st.sel === L.k;
        const gg = c.createRadialGradient(cx, cy, Math.max(0, r0), cx, cy, r1); gg.addColorStop(0, shade(L.col, -0.15)); gg.addColorStop(1, shade(L.col, 0.15));
        c.fillStyle = gg; c.beginPath(); c.arc(cx, cy, r1, Math.PI / 2, Math.PI * 1.5); c.lineTo(cx, cy - r0); if (r0 > 0) c.arc(cx, cy, r0, Math.PI * 1.5, Math.PI / 2, true); c.closePath(); c.fill();
        if (on) { c.strokeStyle = EL; c.lineWidth = 3; c.stroke(); }
      });
      // 외핵 출렁임·맨틀 흐름 무늬
      c.save(); c.globalAlpha = 0.25; c.strokeStyle = '#fff'; c.lineWidth = 1.5; for (let j = 0; j < 3; j++) { const rr = R * (1 - (3300 + j * 550) / 6400); c.beginPath(); c.arc(cx, cy, rr + Math.sin(t * 2 + j) * 1.5, Math.PI * 0.6, Math.PI * 1.4); c.stroke(); } c.restore();
      glow(c, cx, cy, R * 0.25, 'rgba(255,250,200,.35)');
      // 지각은 너무 얇아 확대 동그라미로
      const zx = cx - R * 0.72, zy = cy - R * 0.72;
      if (k > 0.98) {
        // 줄인 공 아래 같은 배율의 자(1 cm = R/6.4)
        const u = R / 6.4, rx0 = cx - R, ry = cy + R + 14;
        c.fillStyle = '#f2e6c8'; c.fillRect(rx0, ry, u * 14, 16); c.fillStyle = INK;
        for (let i = 0; i <= 14; i++) { c.fillRect(rx0 + i * u, ry, 1.2, i % 5 ? 5 : 10); if (i % 5 === 0) txt(c, `${i}`, rx0 + i * u, ry + 28, DIM, '600 11px'); }
        txt(c, 'cm', rx0 + u * 14 + 4, ry + 28, DIM, '600 11px', 'left');
        c.strokeStyle = 'rgba(255,216,77,.8)'; c.lineWidth = 1.5; c.setLineDash([4, 3]); c.beginPath(); c.moveTo(cx - R, cy); c.lineTo(cx - R, ry); c.moveTo(cx + R, cy); c.lineTo(cx + R, ry); c.stroke(); c.setLineDash([]);
        txt(c, '지름 약 12.8 cm', cx, ry + 46, EL, '800 14px');
        // 지각 확대 동그라미
        const ax = cx - R * 0.71, ay = cy - R * 0.71, ix = cx + R * 0.15, iy = cy - R - 62, ir = 46;
        c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.5; c.beginPath(); c.arc(ax, ay, 5, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(ax + 3, ay - 4); c.lineTo(ix - ir * 0.7, iy + ir * 0.7); c.stroke();
        c.save(); c.beginPath(); c.arc(ix, iy, ir, 0, TAU); c.clip();
        const mg = c.createLinearGradient(0, iy - ir, 0, iy + ir); mg.addColorStop(0, '#0e1838'); mg.addColorStop(0.42, '#0e1838'); mg.addColorStop(0.43, '#b79d90'); mg.addColorStop(0.5, '#b79d90'); mg.addColorStop(0.51, '#d0743a'); mg.addColorStop(1, '#a24f22'); c.fillStyle = mg; c.fillRect(ix - ir, iy - ir, ir * 2, ir * 2);
        c.restore(); c.strokeStyle = st.sel === 'crust' ? EL : '#fbfcf9'; c.lineWidth = st.sel === 'crust' ? 3 : 2; c.beginPath(); c.arc(ix, iy, ir, 0, TAU); c.stroke();
        txt(c, '지각 0.35 mm', ix + ir + 8, iy - 2, '#fbfcf9', '800 13px', 'left'); txt(c, '(종이 서너 장)', ix + ir + 8, iy + 14, DIM, '600 12px', 'left');
      }
      // 오른쪽 판: 층별 실제 두께 → 줄인 두께
      const px = W * 0.5, pw = W * 0.47, rowH = H * 0.13;
      txt(c, k < 0.99 ? '실제 두께' : '1억분의 1로 줄이면', px + pw / 2, H * 0.1, DIM, '800 18px');
      LAY.forEach((L, i) => {
        const y = H * 0.15 + i * rowH, on = st.sel === L.k, th = L.b - L.a;
        c.fillStyle = on ? 'rgba(255,216,77,.18)' : 'rgba(255,255,255,.06)'; c.beginPath(); c.roundRect(px, y, pw, rowH - 10, 10); c.fill(); if (on) { c.strokeStyle = EL; c.lineWidth = 2; c.stroke(); }
        c.fillStyle = L.col; c.beginPath(); c.arc(px + 22, y + (rowH - 10) / 2, 11, 0, TAU); c.fill();
        txt(c, L.n, px + 44, y + (rowH - 10) / 2 + 6, '#fbfcf9', '800 18px', 'left');
        txt(c, `${L.a}~${L.b} km · ${L.st}`, px + 104, y + (rowH - 10) / 2 - 4, DIM, '600 13px', 'left');
        const real = `두께 ${th.toLocaleString()} km`, small = fmt(mm(th));
        txt(c, k < 0.99 ? real : (st.seen.has(L.k) ? `→ ${small}` : '눌러 보기'), px + pw - 14, y + (rowH - 10) / 2 + 14, k >= 0.99 ? EL : '#fbfcf9', '800 17px', 'right');
      });
      // 줄인 공과 자
      if (k > 0.98) {
        const by = H * 0.71; c.fillStyle = 'rgba(255,255,255,.08)'; c.beginPath(); c.roundRect(px, by, pw, H * 0.1, 10); c.fill();
        txt(c, '1억분의 1: 1 km → 0.01 mm', px + pw / 2, by + 24, '#fbfcf9', '700 15px'); txt(c, `대륙 지각 35 km → ${fmt(mm(35))}`, px + pw / 2, by + 44, EL, '800 14px');
      }
      // 손잡이
      const sx0 = W * 0.06, sx1 = W * 0.44, sy = H * 0.92, kx = lerp(sx0, sx1, st.s);
      c.strokeStyle = 'rgba(200,212,240,.35)'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx0, sy); c.lineTo(sx1, sy); c.stroke(); c.strokeStyle = EL; c.beginPath(); c.moveTo(sx0, sy); c.lineTo(kx, sy); c.stroke();
      c.fillStyle = EL; c.beginPath(); c.arc(kx, sy, 14 + (st.s < 0.02 ? Math.sin(t * 4) * 2 : 0), 0, TAU); c.fill(); c.strokeStyle = '#8a6a10'; c.lineWidth = 2; c.stroke();
      txt(c, '실제 지구', sx0, sy - 22, DIM, '700 13px', 'left'); txt(c, '1억분의 1', sx1, sy - 22, DIM, '700 13px', 'right');
    },
    hint(st, W, H) { return st.s < 0.98 ? [lerp(W * 0.06, W * 0.44, st.s), H * 0.92, W * 0.3, 0] : st.seen.size < 3 ? [W * 0.6, H * 0.15 + [0, 1, 2, 3].find((i) => !st.seen.has(LAY[i].k)) * H * 0.13 + 30, 0, 0] : null; },
    down(st, p, api) {
      const W = api.W, H = api.H, kx = lerp(W * 0.06, W * 0.44, st.s);
      if (Math.abs(p.y - H * 0.92) < 30 && Math.abs(p.x - kx) < 40) { st.drag = true; return; }
      if (p.x > W * 0.5) { const i = Math.floor((p.y - H * 0.15) / (H * 0.13)); if (i >= 0 && i < 4) this.tap(st, api, LAY[i].k); }
    },
    move(st, p, held, api) { if (held && st.drag) { st.s = clamp((p.x - api.W * 0.06) / (api.W * 0.38), 0, 1); if (st.s > 0.98) { st.s = 1; api.ok(1, true); api.say('지구 전체가 지름 <b>약 12.8 cm</b> 공이 되었다. 오른쪽 층을 눌러 줄인 두께를 읽자.'); } } },
    up(st) { st.drag = false; },
    tap(st, api, k) {
      if (st.s < 0.98) { api.say('먼저 손잡이를 끝까지 끌어 지구를 줄이자.'); return; }
      st.sel = k; st.seen.add(k); const L = LAY.find((q) => q.k === k);
      api.say(k === 'crust' ? `지각: ${fmt(mm(35))} — 대륙 지각도 <b>종이 서너 장</b> 두께밖에 안 된다. 해양 지각은 그보다 훨씬 얇다.` : k === 'mantle' ? `맨틀: ${fmt(mm(2865))} — 가장 두껍고, 지권 전체 부피의 <b>약 80%</b>를 차지한다.` : `${L.n}: ${fmt(mm(L.b - L.a))} — ${L.st} 상태.`);
      if (st.seen.size >= 3) api.ok(2, true);
      if (st.seen.has('crust') && st.seen.has('mantle') && st.seen.size >= 3) { api.ok(3, true); }
    },
    key(st, e, api) { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { st.s = clamp(st.s + (e.key === 'ArrowRight' ? 0.1 : -0.1), 0, 1); if (st.s > 0.98) { st.s = 1; api.ok(1, true); } return true; } const i = '1234'.indexOf(e.key); if (i >= 0) { this.tap(st, api, LAY[i].k); return true; } return false; },
    act: { shrink: (st, api) => { st.s = 1; api.ok(1, true); return st.s; }, tap: (st, api, k) => KINDS.scale.tap(st, api, k) },
  };

  // ─────────── 3. 지구의 물 나눠 담기(3-1-1 2차시) ───────────
  const WAT = [{ k: 'sea', n: '바닷물', v: 97.2, col: '#2f7fd0' }, { k: 'ice', n: '빙하', v: 2.15, col: '#bfe6ff' }, { k: 'gw', n: '지하수', v: 0.62, col: '#5aa9c0' }, { k: 'lake', n: '강·호수 등', v: 0.03, col: '#7fd1ff' }];
  KINDS.water = {
    first: '지구의 물 전체를 100으로 볼 때, 네 그릇에 얼마씩 들어갈까? 그릇 속 <b>물 높이를 끌어</b> 먼저 예상해 보자.',
    steps: ['① 네 그릇의 물 높이를 끌어 예상한다', '② ‘실제로 나누기’를 눌러 견준다', '③ 육지의 물을 눌러 확대해 본다'],
    done: '물은 거의 다 바다에 있다',
    init: () => ({ guess: [60, 20, 15, 5], real: 0, drag: -1, zoom: 0, moved: new Set() }),
    geo(W, H) { return { by: H * 0.78, bw: W * 0.17, bh: H * 0.5, xs: [0.14, 0.36, 0.58, 0.8].map((u) => u * W), btn: [W * 0.47, H * 0.1, 190, 44] }; },
    draw(c, W, H, st, t, dt, api) {
      const g = this.geo(W, H); bg(c, W, H, '#14304f', '#08142a');
      // 선반
      const sg = c.createLinearGradient(0, g.by, 0, g.by + 24); sg.addColorStop(0, '#8a6544'); sg.addColorStop(1, '#4b3424'); c.fillStyle = sg; c.fillRect(W * 0.03, g.by, W * 0.94, 24);
      if (st.real > 0 && st.real < 1) st.real = Math.min(1, st.real + dt * 0.7);
      WAT.forEach((q, i) => {
        const x = g.xs[i], v = lerp(st.guess[i], q.v, ease(st.real)), lv = g.bh * v / 100, top = g.by - g.bh;
        // 유리 비커: 위 테(타원) · 두께 있는 벽 · 바닥 타원 · 눈금
        const L = x - g.bw / 2, Rr = x + g.bw / 2, ry = 9;
        c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(x + 6, g.by + 4, g.bw * 0.55, 8, 0, 0, TAU); c.fill();
        c.fillStyle = 'rgba(200,225,255,.07)'; c.beginPath(); c.moveTo(L, top); c.lineTo(L, g.by); c.ellipse(x, g.by, g.bw / 2, ry, 0, Math.PI, 0, true); c.lineTo(Rr, top); c.ellipse(x, top, g.bw / 2, ry, 0, 0, Math.PI, true); c.closePath(); c.fill();
        if (lv > 0.5) {
          const sy = g.by - lv;
          c.save(); c.beginPath(); c.moveTo(L + 3, sy); c.lineTo(L + 3, g.by); c.ellipse(x, g.by, g.bw / 2 - 3, ry - 1, 0, Math.PI, 0, true); c.lineTo(Rr - 3, sy); c.closePath(); c.clip();
          if (q.k === 'gw') {
            const wg = c.createLinearGradient(0, sy, 0, g.by); wg.addColorStop(0, '#4a8fb8'); wg.addColorStop(1, '#2a5a7a'); c.fillStyle = wg; c.fillRect(L, sy - 2, g.bw, lv + ry + 2);
            for (let j = 0; j < 120; j++) { const gx = L + 5 + ((j * 29.7) % (g.bw - 10)), gy = g.by + 6 - ((j * 13.3) % (lv + 8)); if (gy < sy + 3) continue; const r = 3 + (j % 3); const gg = c.createRadialGradient(gx - 1, gy - 1, 0.5, gx, gy, r); gg.addColorStop(0, '#d9b98a'); gg.addColorStop(1, '#8a6a44'); c.fillStyle = gg; c.beginPath(); c.arc(gx, gy, r, 0, TAU); c.fill(); }
          } else if (q.k === 'ice') {
            const ig = c.createLinearGradient(L, 0, Rr, 0); ig.addColorStop(0, '#e9f6ff'); ig.addColorStop(0.5, '#bfe3fa'); ig.addColorStop(1, '#8fc4e8'); c.fillStyle = ig; c.fillRect(L, sy - 2, g.bw, lv + ry + 2);
            c.strokeStyle = 'rgba(70,130,180,.55)'; c.lineWidth = 1.2; for (let j = 0; j < 7; j++) { const yy = g.by - (j + 0.5) * 14; if (yy < sy) break; c.beginPath(); c.moveTo(L, yy + (j % 2) * 4); c.lineTo(L + g.bw * 0.4, yy - 3); c.lineTo(L + g.bw * 0.7, yy + 2); c.lineTo(Rr, yy - 2); c.stroke(); }
          } else {
            const wg = c.createLinearGradient(0, sy, 0, g.by); wg.addColorStop(0, shade(q.col, 0.25)); wg.addColorStop(1, shade(q.col, -0.4)); c.fillStyle = wg; c.fillRect(L, sy - 2, g.bw, lv + ry + 2);
            for (let j = 0; j < 4; j++) { const u = (t * 0.25 + j / 4) % 1, bx2 = L + 10 + ((j * 37) % (g.bw - 20)); c.fillStyle = `rgba(255,255,255,${0.35 * (1 - u)})`; c.beginPath(); c.arc(bx2, g.by - u * lv, 2.2, 0, TAU); c.fill(); }
          }
          // 물(얼음·흙) 윗면
          c.fillStyle = q.k === 'gw' ? '#6b8f5a' : q.k === 'ice' ? '#f4fbff' : shade(q.col, 0.45); c.beginPath(); for (let xx = L; xx <= Rr; xx += 4) c.lineTo(xx, sy + (q.k === 'ice' || q.k === 'gw' ? 0 : Math.sin(xx * 0.08 + t * 2 + i) * Math.min(2.5, lv * 0.3))); c.lineTo(Rr, sy + 4); c.lineTo(L, sy + 4); c.closePath(); c.fill();
          c.restore();
        }
        c.strokeStyle = 'rgba(220,235,255,.85)'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(L, top); c.lineTo(L, g.by); c.ellipse(x, g.by, g.bw / 2, ry, 0, Math.PI, 0, true); c.lineTo(Rr, top); c.stroke();
        c.beginPath(); c.ellipse(x, top, g.bw / 2, ry, 0, 0, TAU); c.stroke(); c.strokeStyle = 'rgba(220,235,255,.35)'; c.lineWidth = 5; c.beginPath(); c.ellipse(x, top, g.bw / 2 - 3, ry - 2, 0, 0, TAU); c.stroke();
        c.fillStyle = 'rgba(255,255,255,.22)'; c.fillRect(L + 7, top + 12, 5, g.bh - 30); c.fillStyle = 'rgba(255,255,255,.1)'; c.fillRect(Rr - 14, top + 12, 3, g.bh - 30);
        for (let k = 0; k <= 4; k++) { const yy = g.by - g.bh * k / 4; c.fillStyle = 'rgba(220,235,255,.7)'; c.fillRect(Rr - 12, yy - 0.75, k % 2 ? 6 : 10, 1.5); if (i === 0) txt(c, `${k * 25}`, L - 6, yy + 4, 'rgba(200,212,240,.75)', '600 10px', 'right'); }
        // 손잡이(예상할 때)
        if (st.real === 0) { const hy = g.by - lv; c.fillStyle = EL; c.beginPath(); c.roundRect(x - 26, hy - 9, 52, 18, 9); c.fill(); c.strokeStyle = '#8a6a10'; c.lineWidth = 1.5; c.stroke(); txt(c, '↕', x, hy + 5, INK, '800 13px'); }
        txt(c, q.n, x, g.by + 50, '#fbfcf9', '800 18px');
        txt(c, st.real ? `${v < 1 ? v.toFixed(2) : v.toFixed(1)}%` : `예상 ${Math.round(st.guess[i])}%`, x, g.by + 74, st.real ? EL : DIM, '800 16px');
        if (st.real >= 1) txt(c, `내 예상 ${Math.round(st.guess[i])}%`, x, top - 10, DIM, '600 13px');
      });
      // 합계와 단추
      const sum = st.guess.reduce((a, b) => a + b, 0);
      { const dx = W * 0.06, dy = H * 0.2, dr = 18; const dg = c.createRadialGradient(dx - 6, dy - 2, 2, dx, dy + 4, dr * 1.3); dg.addColorStop(0, '#bfe6ff'); dg.addColorStop(1, '#2f7fd0'); c.fillStyle = dg; c.beginPath(); c.moveTo(dx, dy - dr * 1.6); c.bezierCurveTo(dx + dr * 0.4, dy - dr * 0.8, dx + dr, dy - dr * 0.2, dx + dr, dy + dr * 0.3); c.arc(dx, dy + dr * 0.3, dr, 0, Math.PI); c.bezierCurveTo(dx - dr, dy - dr * 0.2, dx - dr * 0.4, dy - dr * 0.8, dx, dy - dr * 1.6); c.fill(); c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(dx - 7, dy + 2, 3, 6, -0.3, 0, TAU); c.fill(); txt(c, '지구의 물 전체 = 100', dx + dr + 8, dy + 4, '#cfe7ff', '700 13px', 'left'); }
      if (st.real === 0) txt(c, `예상 합계 ${Math.round(sum)}%`, W * 0.06 + 26, H * 0.2 + 24, Math.abs(sum - 100) < 3 ? '#8de0a3' : DIM, '700 14px', 'left');
      const [bx, by, bw, bh] = g.btn;
      if (st.real === 0) { c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.roundRect(bx + 3, by + 4, bw, bh, 22); c.fill(); c.fillStyle = st.moved.size ? '#e4572e' : '#6b7183'; c.beginPath(); c.roundRect(bx, by, bw, bh, 22); c.fill(); txt(c, '실제로 나누기', bx + bw / 2, by + 29, '#fff', '800 18px'); }
      // 육지 물 확대: 2.8%를 100으로 늘려 본다
      if (st.real >= 1) {
        const zx = W * 0.31, zy = H * 0.04, zw = W * 0.66, zh = H * 0.2;
        c.fillStyle = 'rgba(255,255,255,.08)'; c.beginPath(); c.roundRect(zx, zy, zw, zh, 12); c.fill();
        if (!st.zoom) { txt(c, '여기를 눌러 육지의 물(2.8%)만 크게 보기', zx + zw / 2, zy + zh / 2 + 6, EL, '800 16px'); }
        else {
          st.zoom = Math.min(1, st.zoom + dt * 1.5);
          txt(c, '육지의 물만 100으로 늘리면', zx + 14, zy + 24, DIM, '700 14px', 'left');
          let x = zx + 14; const tot = 2.8, bw2 = zw - 28;
          WAT.slice(1).forEach((q) => { const w = bw2 * q.v / tot * ease(st.zoom); c.fillStyle = q.col; c.fillRect(x, zy + 36, Math.max(2, w), 34); if (w > 60) txt(c, `${q.n} ${(q.v / tot * 100).toFixed(0)}%`, x + w / 2, zy + 59, INK, '800 14px'); x += w; });
          txt(c, '강·호수 등은 아주 적다 →', zx + zw - 14, zy + 92, '#7fd1ff', '700 13px', 'right');
        }
      }
    },
    hint(st, W, H) { const g = this.geo(W, H); return !st.moved.size ? [g.xs[0], g.by - g.bh * st.guess[0] / 100 + 12, 0, -60] : st.real === 0 ? [g.btn[0] + 95, g.btn[1] + 30, 0, 0] : !st.zoom ? [W * 0.64, H * 0.14, 0, 0] : null; },
    down(st, p, api) {
      const g = this.geo(api.W, api.H), [bx, by, bw, bh] = g.btn;
      if (st.real === 0 && inR(p, bx, by, bw, bh)) { this.reveal(st, api); return; }
      if (st.real >= 1 && !st.zoom && p.y < api.H * 0.26 && p.x > api.W * 0.31) { this.zoomIt(st, api); return; }
      if (st.real === 0) { const i = g.xs.findIndex((x) => Math.abs(p.x - x) < g.bw / 2); if (i >= 0) { st.drag = i; this.move(st, p, true, api); } }
    },
    move(st, p, held, api) { if (!held || st.drag < 0) return; const g = this.geo(api.W, api.H); st.guess[st.drag] = clamp((g.by - p.y) / g.bh * 100, 0, 100); st.moved.add(st.drag); if (st.moved.size >= 2) api.ok(1, true); api.say(`예상: 바닷물 ${Math.round(st.guess[0])}% · 빙하 ${Math.round(st.guess[1])}% · 지하수 ${Math.round(st.guess[2])}% · 강·호수 등 ${Math.round(st.guess[3])}%`); },
    up(st) { st.drag = -1; },
    reveal(st, api) { if (st.real) return; st.real = 0.001; api.ok(1, true); api.ok(2, true); api.say('실제로는 <b>바닷물이 97% 넘게</b> 차지한다. 육지의 물은 다 합쳐도 3%가 안 되고, 그중에서도 <b>빙하</b>가 가장 많다. 위 띠를 눌러 육지의 물을 확대해 보자.'); },
    zoomIt(st, api) { if (st.real < 1) st.real = 1; st.zoom = 0.01; api.ok(3, true); api.say('육지의 물만 놓고 보면 <b>빙하 &gt; 지하수 &gt; 강·호수</b> 순서다. 우리가 바로 쓰기 쉬운 강·호수의 물은 지구 전체 물의 아주 작은 부분이다.'); },
    key(st, e, api) { if (e.key === 'Enter') { if (!st.real) this.reveal(st, api); else this.zoomIt(st, api); return true; } return false; },
    act: { reveal: (st, api) => { KINDS.water.reveal(st, api); st.real = 1; return 1; }, zoom: (st, api) => KINDS.water.zoomIt(st, api), guess: (st, api, a) => { st.guess = a; st.moved = new Set([0, 1]); api.ok(1, true); } },
  };

  // ─────────── 4. 화산 쇄설물 체로 거르기(3-1-2 2차시) ───────────
  // 지름: 화산암괴 64 mm 이상 · 화산력 2~64 · 화산재 0.06~2 · 화산진 0.06 이하. 체 눈: 64 mm · 2 mm · 0.06 mm
  const SV = [{ n: '화산암괴', d: '64 mm 이상', col: '#4a3f3a', r: [9, 13] }, { n: '화산력', d: '2~64 mm', col: '#7a5f52', r: [4.5, 7] }, { n: '화산재', d: '0.06~2 mm', col: '#b3a397', r: [2.4, 3.2] }, { n: '화산진', d: '0.06 mm 이하', col: '#ece6de', r: [1.5, 2] }];
  KINDS.sieve = {
    first: '화산에서 튀어나온 고체 알갱이(<b>화산 쇄설물</b>)를 양동이에 담아 왔다. 양동이를 끌어 <b>체 위에 부어 보자</b>.',
    steps: ['① 양동이를 끌어 맨 위 체에 붓는다', '② 체를 좌우로 흔들어 거른다', '③ 바람에 가장 멀리 날아갈 칸을 누른다'],
    done: '작은 알갱이일수록 멀리 퍼진다',
    init: () => ({ ps: [], poured: false, shake: 0, sx: 0, drag: null, pick: -1 }),
    geo(W, H) { const x = W * 0.44, w = W * 0.38; return { x, w, ys: [H * 0.32, H * 0.5, H * 0.68, H * 0.86], bucket: [W * 0.075, H * 0.9 - 42] }; },
    pour(st, api) {
      if (st.poured) return; st.poured = true; const g = this.geo(api.W, api.H);
      for (let i = 0; i < 70; i++) { const kind = i < 7 ? 0 : i < 22 ? 1 : i < 46 ? 2 : 3, r = lerp(SV[kind].r[0], SV[kind].r[1], Math.random()); st.ps.push({ kind, r, x: g.x - g.w * 0.3 + Math.random() * g.w * 0.6, y: g.ys[0] - 60 - Math.random() * 60, vy: 0, lvl: 0, a: Math.random() * TAU }); }
      api.ok(1, true); api.say('맨 위 체(눈 64 mm)에 부었다. 이제 체를 <b>좌우로 흔들자</b> — 눈보다 작은 알갱이는 아래 체로 빠진다.');
    },
    draw(c, W, H, st, t, dt, api) {
      st.tt = t; const g = this.geo(W, H); bg(c, W, H, '#2a2236', '#120e18');
      // 뒤: 연기 나는 화산 실루엣
      const vg = c.createLinearGradient(W * 0.62, 0, W * 0.92, 0); vg.addColorStop(0, '#5a4650'); vg.addColorStop(0.5, '#7a6068'); vg.addColorStop(1, '#3a2c34'); c.fillStyle = vg; c.beginPath(); c.moveTo(W * 0.6, H * 0.24); c.quadraticCurveTo(W * 0.7, H * 0.12, W * 0.72, H * 0.06); c.lineTo(W * 0.78, H * 0.06); c.quadraticCurveTo(W * 0.82, H * 0.14, W * 0.94, H * 0.24); c.closePath(); c.fill();
      glow(c, W * 0.75, H * 0.065, 22, 'rgba(255,120,40,.7)'); c.strokeStyle = 'rgba(255,110,40,.75)'; c.lineWidth = 3; c.beginPath(); c.moveTo(W * 0.745, H * 0.07); c.quadraticCurveTo(W * 0.73, H * 0.13, W * 0.705, H * 0.2); c.stroke();
      for (let i = 0; i < 6; i++) { const u = (t * 0.15 + i / 6) % 1; c.fillStyle = `rgba(160,150,150,${0.35 * (1 - u)})`; c.beginPath(); c.arc(W * 0.75 + u * 60, H * 0.06 - u * 50, 10 + u * 26, 0, TAU); c.fill(); }
      // 탁자
      table(c, W, H, H * 0.9);
      const sh = Math.sin(st.shake * 30) * 8 * (st.drag === 'sieve' ? 1 : 0) + st.sx;
      { const pl = g.x - g.w / 2 - 14, pr = g.x + g.w / 2 + 14, top = g.ys[0] - 46, bot = H * 0.9;
        [pl, pr].forEach((px) => { const pg = c.createLinearGradient(px - 4, 0, px + 4, 0); pg.addColorStop(0, '#5b6276'); pg.addColorStop(0.5, '#c9ccd4'); pg.addColorStop(1, '#4b5263'); c.fillStyle = pg; c.fillRect(px - 4, top, 8, bot - top); c.fillStyle = '#3b4252'; c.fillRect(px - 12, bot - 6, 24, 6); });
        c.fillStyle = '#6b7183'; c.fillRect(pl - 4, top - 6, pr - pl + 8, 7);
        g.ys.forEach((y) => { c.fillStyle = '#8a93a8'; c.fillRect(pl, y + 8, 14, 4); c.fillRect(pr - 14, y + 8, 14, 4); }); }
      // 체 세 단 + 받침
      g.ys.forEach((y, i) => {
        const x0 = g.x - g.w / 2 + sh, on = st.pick === i;
        const cx = g.x + sh, ry = 11;
        c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(cx + 4, y + 16, g.w / 2, ry, 0, 0, TAU); c.fill();
        c.fillStyle = '#5b6276'; c.beginPath(); c.ellipse(cx, y - 12, g.w / 2, ry, 0, Math.PI, TAU); c.lineTo(cx + g.w / 2, y); c.ellipse(cx, y, g.w / 2, ry, 0, 0, Math.PI, true); c.closePath(); c.fill();
        c.save(); c.beginPath(); c.ellipse(cx, y, g.w / 2 - 2, ry - 1, 0, 0, TAU); c.clip();
        c.fillStyle = i < 3 ? 'rgba(30,32,44,.85)' : '#8a93a8'; c.fillRect(x0, y - ry, g.w, ry * 2);
        if (i < 3) { const gap = [14, 7, 3.5][i]; c.strokeStyle = 'rgba(200,206,220,.75)'; c.lineWidth = i === 2 ? 0.6 : 1; c.beginPath(); for (let xx = x0; xx < x0 + g.w; xx += gap) { c.moveTo(xx, y - ry); c.lineTo(xx, y + ry); } for (let yy = y - ry; yy < y + ry; yy += gap * 0.45) { c.moveTo(x0, yy); c.lineTo(x0 + g.w, yy); } c.stroke(); }
        c.restore();
        if (on) { c.strokeStyle = EL; c.lineWidth = 3; c.beginPath(); c.roundRect(x0 - 4, y - 34, g.w + 8, 46, 8); c.stroke(); }
        // 이름표(오른쪽)
        const lab = i < 3 ? `체 눈 ${['64 mm', '2 mm', '0.06 mm'][i]}` : '받침';
        txt(c, lab, x0 - 24, y + 4, DIM, '700 13px', 'right');
        const cnt = st.ps.filter((p) => p.lvl === i && p.rest).length;
      });
      // 알갱이: 체 눈보다 작으면 흔들 때 아래로 빠진다
      const sizeOK = (p, lvl) => p.kind > lvl; // 이 단의 체를 지나갈 수 있나
      st.ps.forEach((p) => {
        const floor = g.ys[p.lvl] - 4 - p.r;
        if (!p.rest) { p.vy += 900 * dt; p.y += p.vy * dt; if (p.y >= floor) { p.y = floor; p.vy = 0; p.rest = true; } }
        else if (st.drag === 'sieve' && p.lvl < 3 && sizeOK(p, p.lvl) && Math.random() < dt * 2.2) { p.lvl++; p.rest = false; p.vy = 40; }
        p.x = clamp(p.x + (st.drag === 'sieve' && p.rest ? Math.sin(st.shake * 30) * 0.6 : 0), g.x - g.w / 2 + 8, g.x + g.w / 2 - 8);
        const px = p.x + sh, gr = c.createRadialGradient(px - p.r * 0.3, p.y - p.r * 0.3, 0.5, px, p.y, p.r); gr.addColorStop(0, shade(SV[p.kind].col, 0.3)); gr.addColorStop(1, shade(SV[p.kind].col, -0.3));
        c.fillStyle = gr; c.beginPath(); if (p.kind < 2) { for (let k = 0; k < 7; k++) { const a = p.a + k / 7 * TAU, rr = p.r * (0.8 + 0.25 * Math.sin(k * 2.3 + p.a)); c[k ? 'lineTo' : 'moveTo'](px + Math.cos(a) * rr, p.y + Math.sin(a) * rr); } c.closePath(); } else c.arc(px, p.y, p.r, 0, TAU); c.fill();
        if (p.kind === 0) { c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.arc(px + 2, p.y - 1, 1.5, 0, TAU); c.arc(px - 3, p.y + 2, 1.2, 0, TAU); c.fill(); }
      });
      g.ys.forEach((y) => { const cx = g.x + sh, ry = 11, fg = c.createLinearGradient(0, y - 12, 0, y + ry); fg.addColorStop(0, '#e3e6ee'); fg.addColorStop(1, '#8a93a8'); c.fillStyle = fg; c.beginPath(); c.ellipse(cx, y - 12, g.w / 2, ry, 0, 0, Math.PI); c.lineTo(cx - g.w / 2, y); c.ellipse(cx, y, g.w / 2, ry, 0, Math.PI, 0, true); c.closePath(); c.fill(); c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(cx, y - 12, g.w / 2, ry, 0, 0, Math.PI); c.stroke(); });
      // 고른 칸의 알갱이가 바람을 타고 날아간다: 작을수록 천천히 떨어져 멀리 간다
      if (st.pick >= 0 && st.ft != null) {
        const u = (t - st.ft) % 4.5, vs = [260, 110, 26, 7][st.pick], wind = 70, gy = H * 0.9;
        st.ps.forEach((p, k) => { if (p.lvl !== st.pick) return; const lift = 34 * (1 - Math.exp(-u * 4)), fall = Math.max(0, vs * (u - 0.25)), y = Math.min(gy - p.r, p.y - lift + fall), land = y >= gy - p.r - 0.5, tl = land ? (gy - p.r - p.y + lift) / vs + 0.25 : u, x = p.x + sh + wind * tl * (0.8 + (k % 5) * 0.08);
          if (x > W + 10) return; const x0 = p.x + sh; c.strokeStyle = 'rgba(255,240,220,.18)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, p.y); c.quadraticCurveTo((x0 + x) / 2, p.y - lift, x, y); c.stroke(); c.fillStyle = st.pick > 1 ? '#fff3e0' : shade(SV[p.kind].col, 0.1); c.beginPath(); c.arc(x, y, Math.max(2.4, p.r * 0.8), 0, TAU); c.fill(); });
        const far = ['화산 가까이에 떨어진다', '조금 떨어진 곳에 쌓인다', '멀리까지 날아간다', '아주 멀리 · 하늘에 오래 떠 있다'][st.pick];
        pill(c, W * 0.5, H * 0.955, far, 'rgba(180,220,255,.92)', INK, '800 14px');
      }
      { const dust = st.ps.filter((p) => p.lvl === 3 && p.rest).length; if (dust) { const y = g.ys[3], mg = c.createRadialGradient(g.x + sh, y - 2, 2, g.x + sh, y, g.w * 0.3); mg.addColorStop(0, '#c9b8a2'); mg.addColorStop(0.7, '#9c8a74'); mg.addColorStop(1, 'rgba(120,104,88,.35)'); c.fillStyle = mg; c.beginPath(); c.ellipse(g.x + sh, y - 1, g.w * 0.3, 4 + dust * 0.5, 0, Math.PI, TAU); c.fill(); c.strokeStyle = 'rgba(60,46,38,.7)'; c.lineWidth = 1.2; c.stroke(); // 은색 받침 위에서도 보이게 고운 가루 더미를 진한 회갈색으로
        const Rd = (k) => ((Math.sin(k * 91.7) + 1) / 2); for (let k = 0; k < 40; k++) { const a = Math.PI + Rd(k) * Math.PI, rr2 = Math.sqrt(Rd(k + 50)) * 0.92; c.fillStyle = k % 3 ? 'rgba(70,56,46,.55)' : 'rgba(245,238,228,.8)'; c.fillRect(g.x + sh + Math.cos(a) * g.w * 0.3 * rr2, y - 1 + Math.sin(a) * (4 + dust * 0.5) * rr2, 1.6, 1.6); } } }
      g.ys.forEach((y, i) => { const x = g.x + g.w / 2 + 28, cnt = st.ps.filter((p) => p.lvl === i && p.rest).length, named = st.poured && st.shake > 1.2;
        if (!named && !cnt) return; c.fillStyle = 'rgba(10,8,16,.78)'; c.beginPath(); c.roundRect(x - 6, y - 26, 112, named ? 44 : 24, 8); c.fill();
        if (named) { txt(c, SV[i].n, x + 4, y - 8, '#fbfcf9', '800 16px', 'left'); txt(c, SV[i].d, x + 4, y + 11, DIM, '600 12px', 'left'); } else txt(c, `${cnt}알`, x + 4, y - 9, DIM, '600 13px', 'left'); });
      if (st.drag === 'sieve') st.shake += dt;
      if (st.poured && st.shake > 1.2) api.ok(2, true);
      // 양동이
      if (!st.poured) {
        const [bx, by] = st.drag === 'bucket' ? [st.bx, st.by] : g.bucket, tilt = st.drag === 'bucket' && Math.abs(bx - g.x) < g.w / 2 && by < g.ys[0] ? -0.9 : 0;
        c.save(); c.translate(bx, by); c.rotate(tilt);
        c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.moveTo(-44, -36); c.lineTo(48, -36); c.lineTo(38, 44); c.lineTo(-30, 44); c.closePath(); c.fill();
        const bg2 = c.createLinearGradient(-46, 0, 46, 0); bg2.addColorStop(0, '#7a8aa8'); bg2.addColorStop(1, '#3d4a66'); c.fillStyle = bg2; c.beginPath(); c.moveTo(-46, -40); c.lineTo(46, -40); c.lineTo(36, 40); c.lineTo(-36, 40); c.closePath(); c.fill();
        c.fillStyle = '#5a4a44'; c.beginPath(); c.ellipse(0, -40, 46, 10, 0, 0, TAU); c.fill(); for (let i = 0; i < 14; i++) { c.fillStyle = SV[i % 4].col; c.beginPath(); c.arc(-36 + (i * 13) % 72, -42 + (i % 3) * 3, 3 + (i % 4 === 0 ? 4 : 0), 0, TAU); c.fill(); }
        c.strokeStyle = '#c9ccd4'; c.lineWidth = 3; c.beginPath(); c.arc(0, -40, 50, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); c.restore();
        txt(c, '화산 쇄설물', g.bucket[0] + 4, g.bucket[1] - 112, DIM, '700 14px');
        if (tilt) this.pour(st, api);
      } else if (st.shake < 1.2) { txt(c, '← 체를 좌우로 끌어 흔들기 →', g.x, H * 0.97, EL, '800 15px'); }
      // 바람 화살표(③)
      if (api.okd(2)) { for (let i = 0; i < 3; i++) { const u = (t * 0.6 + i / 3) % 1; arrow(c, W * 0.06 + u * 80, H * (0.15 + i * 0.045), W * 0.06 + u * 80 + 40, H * (0.15 + i * 0.045), 3, `rgba(180,220,255,${0.8 - u * 0.6})`); } txt(c, '바람 →', W * 0.06, H * 0.13, '#b4dcff', '800 15px', 'left'); }
    },
    hint(st, W, H) { const g = this.geo(W, H); return !st.poured ? [g.bucket[0], g.bucket[1], g.x - g.bucket[0], g.ys[0] - 80 - g.bucket[1]] : st.shake < 1.2 ? [g.x, g.ys[1] - 10, 60, 0] : st.pick !== 3 ? [g.x + g.w / 2 + 40, g.ys[3] - 10, 0, 0] : null; },
    down(st, p, api) {
      const g = this.geo(api.W, api.H);
      if (!st.poured && near(p, g.bucket[0], g.bucket[1], 64)) { st.drag = 'bucket'; st.bx = p.x; st.by = p.y; return; }
      if (st.poured && st.shake > 1.2) { const i = g.ys.findIndex((y) => Math.abs(p.y - (y - 6)) < 32 && p.x > g.x - g.w / 2 - 20 && p.x < g.x + g.w / 2 + 150); if (i >= 0) { this.pickIt(st, api, i); return; } }
      if (st.poured && p.x > g.x - g.w / 2 - 20 && p.x < g.x + g.w / 2 + 20 && p.y > g.ys[0] - 60 && p.y < g.ys[3] + 20) { st.drag = 'sieve'; st.x0 = p.x; }
    },
    move(st, p, held) { if (!held) return; if (st.drag === 'bucket') { st.bx = p.x; st.by = p.y; } else if (st.drag === 'sieve') { st.sx = clamp(p.x - st.x0, -30, 30); } },
    up(st, p, api) { if (st.drag === 'sieve') { st.sx = 0; if (st.shake > 1.2) api.say('크기에 따라 네 칸으로 나뉘었다: <b>화산암괴 &gt; 화산력 &gt; 화산재 &gt; 화산진</b>. 바람이 불면 어느 칸의 알갱이가 가장 멀리 날아갈까? 칸을 눌러 보자.'); } st.drag = null; },
    pickIt(st, api, i) {
      st.pick = i; st.ft = st.tt || 0;
      if (i === 3) { api.ok(3, true); api.say('<b>화산진·화산재</b>처럼 작은 알갱이는 가벼워 바람을 타고 멀리, 높이는 성층권까지 올라가 오래 떠 있다. 그래서 햇빛을 가리고 비행기 운항을 막는다.'); }
      else api.say(i === 0 ? '화산암괴는 무거워 화산 가까이에 떨어진다.' : i === 1 ? '화산력은 화산 둘레 비교적 가까운 곳에 쌓인다.' : '화산재도 멀리 가지만, 더 작은 것이 있다.');
    },
    key(st, e, api) { if (e.key === 'Enter') { if (!st.poured) this.pour(st, api); else if (st.shake < 1.2) { st.ps.forEach((p) => { p.lvl = Math.min(p.kind, 3); p.rest = false; }); st.shake = 1.3; api.ok(2, true); } else this.pickIt(st, api, 3); return true; } const i = '1234'.indexOf(e.key); if (i >= 0 && st.shake > 1.2) { this.pickIt(st, api, i); return true; } return false; },
    act: { pour: (st, api) => KINDS.sieve.pour(st, api), shake: (st, api) => { st.ps.forEach((p) => { p.lvl = Math.min(p.kind, 3); p.rest = false; }); st.shake = 1.3; api.ok(2, true); return st.ps.length; }, pick: (st, api, i) => KINDS.sieve.pickIt(st, api, i) },
  };

  // ─────────── 5. 감시 기록으로 경보 시점 고르기(3-1-2 2차시) ───────────
  // 가상의 30일 기록: 분출(27일째) 열흘 전부터 지진 횟수·땅 부풂·가스 양이 함께 늘어난다(이해를 돕기 위한 예)
  const ERU = 27, rise = (d, s) => clamp((d - s) / (ERU - s), 0, 1);
  const SIG = [{ n: '하루 지진 횟수', f: (d) => 3 + 2 * Math.sin(d * 1.7) + 40 * rise(d, 16) ** 1.6, max: 50, col: '#ff8a5a', u: '번' }, { n: '땅 부풂', f: (d) => 0.3 * Math.sin(d * 0.9) + 12 * rise(d, 17) ** 1.3, max: 14, col: '#ffd84d', u: 'cm' }, { n: '화산 가스 양(상대값)', f: (d) => 10 + 2 * Math.sin(d * 2.3) + 60 * rise(d, 18) ** 1.5, max: 80, col: '#9fd0ff', u: '' }];
  KINDS.watch = {
    first: '화산 둘레 관측소의 30일 기록(가상)이다. <b>날짜 손잡이</b>를 오른쪽으로 끌며 기록을 읽고, 위험하다고 판단될 때 <b>‘경보’</b>를 누르자.',
    steps: ['① 날짜 손잡이를 끌어 기록을 읽는다', '② 세 기록이 함께 늘 때 ‘경보’를 누른다', '③ 끝까지 끌어 분출과 견준다'],
    done: '전조를 읽으면 미리 대피할 수 있다',
    init: () => ({ day: 0, drag: false, alarm: -1 }),
    geo(W, H) { return { gx: W * 0.08, gw: W * 0.56, gh: H * 0.19, ys: [H * 0.1, H * 0.34, H * 0.58], sy: H * 0.9, vx: W * 0.83, btn: [W * 0.7, H * 0.82, 230, 50] }; },
    draw(c, W, H, st, t, dt, api) {
      const g = this.geo(W, H), d = st.day; bg(c, W, H, '#162236', '#0a1020');
      SIG.forEach((s, i) => {
        const y = g.ys[i];
        c.fillStyle = 'rgba(255,255,255,.06)'; c.beginPath(); c.roundRect(g.gx - 10, y - 8, g.gw + 20, g.gh + 16, 10); c.fill();
        c.strokeStyle = 'rgba(200,212,240,.25)'; c.lineWidth = 1; for (let k = 0; k <= 30; k += 5) { const x = g.gx + g.gw * k / 30; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + g.gh); c.stroke(); }
        c.strokeStyle = 'rgba(200,212,240,.5)'; c.beginPath(); c.moveTo(g.gx, y + g.gh); c.lineTo(g.gx + g.gw, y + g.gh); c.stroke();
        c.save(); c.shadowColor = s.col; c.shadowBlur = 6; c.strokeStyle = s.col; c.lineWidth = 2.5; c.beginPath();
        for (let k = 0; k <= d * 4; k++) { const dd = k / 4, x = g.gx + g.gw * dd / 30, yy = y + g.gh - g.gh * clamp(s.f(dd) / s.max, 0, 1); if (k) c.lineTo(x, yy); else c.moveTo(x, yy); } c.stroke(); c.restore();
        [0, 0.5, 1].forEach((f) => { const yy = y + g.gh - g.gh * f; c.fillStyle = 'rgba(200,212,240,.6)'; c.fillRect(g.gx - 6, yy - 0.75, 6, 1.5); txt(c, `${Math.round(s.max * f)}`, g.gx - 9, yy + 4, DIM, '600 11px', 'right'); });
        txt(c, s.n + ['(번/일)', '(cm)', ''][i], g.gx + 6, y + 12, '#fbfcf9', '800 15px', 'left'); txt(c, `${Math.max(0, s.f(d)).toFixed(s.u === 'cm' ? 1 : 0)} ${s.u}`, g.gx + g.gw, y + 12, s.col, '800 15px', 'right');
      });
      // 날짜 축·경보·분출 표시
      for (let k = 0; k <= 30; k += 5) txt(c, `${k}일`, g.gx + g.gw * k / 30, g.ys[2] + g.gh + 22, DIM, '600 12px');
      const ax = (dd) => g.gx + g.gw * dd / 30;
      if (st.alarm >= 0) { c.strokeStyle = '#e4572e'; c.lineWidth = 2.5; c.setLineDash([6, 5]); c.beginPath(); c.moveTo(ax(st.alarm), g.ys[0] - 6); c.lineTo(ax(st.alarm), g.ys[2] + g.gh + 6); c.stroke(); c.setLineDash([]); pill(c, ax(st.alarm), g.ys[0] - 4, `경보 ${Math.round(st.alarm)}일`, '#e4572e', '#fff', '800 13px'); }
      if (d >= ERU) { c.strokeStyle = '#ffd84d'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(ax(ERU), g.ys[0] - 6); c.lineTo(ax(ERU), g.ys[2] + g.gh + 6); c.stroke(); pill(c, ax(ERU), g.ys[2] + g.gh + 44, '분출', EL, INK, '800 13px'); }
      // 날짜 손잡이
      const kx = ax(d); c.strokeStyle = 'rgba(200,212,240,.35)'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(ax(0), g.sy); c.lineTo(ax(30), g.sy); c.stroke(); c.strokeStyle = EL; c.beginPath(); c.moveTo(ax(0), g.sy); c.lineTo(kx, g.sy); c.stroke();
      c.fillStyle = EL; c.beginPath(); c.arc(kx, g.sy, 15, 0, TAU); c.fill(); c.strokeStyle = '#8a6a10'; c.lineWidth = 2; c.stroke(); txt(c, `${Math.floor(d)}`, kx, g.sy + 5, INK, '800 13px');
      c.strokeStyle = 'rgba(255,216,77,.5)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(kx, g.ys[0]); c.lineTo(kx, g.ys[2] + g.gh); c.stroke();
      // 오른쪽: 화산 그림(부풀고 연기·분출)
      const vx = g.vx, vy = H * 0.62, bul = 12 * rise(d, 17), er = d >= ERU;
      const sk = c.createLinearGradient(0, H * 0.06, 0, vy); sk.addColorStop(0, er ? '#3a2a2a' : '#2b4f86'); sk.addColorStop(1, er ? '#6a4a3a' : '#8fb4dc'); c.fillStyle = sk; c.beginPath(); c.roundRect(W * 0.68, H * 0.06, W * 0.3, vy - H * 0.06 + 40, 12); c.fill();
      c.save(); c.beginPath(); c.roundRect(W * 0.68, H * 0.06, W * 0.3, vy - H * 0.06 + 40, 12); c.clip();
      // 뒷산·땅
      c.fillStyle = 'rgba(70,90,120,.55)'; c.beginPath(); c.moveTo(W * 0.68, vy + 10); c.quadraticCurveTo(vx - 90, vy - 60, vx - 40, vy - 10); c.lineTo(W * 0.98, vy - 30); c.lineTo(W * 0.98, vy + 40); c.lineTo(W * 0.68, vy + 40); c.fill();
      // 화산: 명암을 준 원뿔 + 분화구 + 비탈 줄무늬
      const vg = c.createLinearGradient(vx - 150, 0, vx + 150, 0); vg.addColorStop(0, '#5a4438'); vg.addColorStop(0.45, '#8a6a58'); vg.addColorStop(1, '#3a2b24'); c.fillStyle = vg;
      c.beginPath(); c.moveTo(vx - 150, vy + 40); c.quadraticCurveTo(vx - 70, vy - 40 - bul, vx - 24, vy - 118 - bul); c.quadraticCurveTo(vx, vy - 112 - bul, vx + 24, vy - 118 - bul); c.quadraticCurveTo(vx + 70, vy - 40 - bul, vx + 150, vy + 40); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(40,28,22,.45)'; c.lineWidth = 1.5; [-0.6, -0.3, 0.25, 0.55].forEach((k) => { c.beginPath(); c.moveTo(vx + k * 30, vy - 110 - bul); c.quadraticCurveTo(vx + k * 90, vy - 40, vx + k * 200, vy + 40); c.stroke(); });
      c.fillStyle = '#2a1e1a'; c.beginPath(); c.ellipse(vx, vy - 117 - bul, 24, 6, 0, 0, TAU); c.fill();
      if (bul > 1) { c.strokeStyle = 'rgba(255,216,77,.85)'; c.lineWidth = 2; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(vx - 150, vy + 40); c.quadraticCurveTo(vx - 70, vy - 40, vx - 24, vy - 118); c.stroke(); c.setLineDash([]); pill(c, vx - 96, vy - 70 - bul, `부풂 +${Math.max(0, SIG[1].f(d)).toFixed(1)} cm`, 'rgba(16,20,32,.85)', EL, '700 11px'); }
      // 관측소(지진계·GPS·가스 측정)
      { const ox = vx + 92, oy = vy + 26; c.fillStyle = '#e9edf3'; c.fillRect(ox - 14, oy - 16, 28, 16); c.fillStyle = '#3d7fb0'; c.beginPath(); c.moveTo(ox - 17, oy - 16); c.lineTo(ox, oy - 26); c.lineTo(ox + 17, oy - 16); c.fill(); c.strokeStyle = '#c8d4f0'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(ox + 10, oy - 22); c.lineTo(ox + 10, oy - 42); c.stroke(); const b = 0.5 + 0.5 * Math.sin(t * 6); glow(c, ox + 10, oy - 43, 8, `rgba(125,255,176,${0.4 + 0.5 * b})`); pill(c, ox, oy - 58, '관측소', 'rgba(16,20,32,.85)', '#fbfcf9', '700 11px'); } // 아래 테두리에 잘리지 않게 안테나 위에 둔다
      const gas = SIG[2].f(d) / 80; for (let i = 0; i < 6; i++) { const u = (t * 0.25 + i / 6) % 1; c.fillStyle = er ? `rgba(80,70,70,${0.7 * (1 - u)})` : `rgba(230,230,235,${0.5 * gas * (1 - u)})`; c.beginPath(); c.arc(vx + Math.sin(u * 4 + i) * 10, vy - 124 - bul - u * (er ? 160 : 70), (er ? 18 : 8) + u * (er ? 40 : 14), 0, TAU); c.fill(); }
      if (er) { glow(c, vx, vy - 126, 60, 'rgba(255,120,40,.85)'); [[-1, 60, 20], [1, 50, 10], [-0.3, 25, 30]].forEach(([dir, sp, end], k) => { const lg = c.createLinearGradient(0, vy - 118, 0, vy + end); lg.addColorStop(0, '#ffd27a'); lg.addColorStop(0.4, '#ff6a2a'); lg.addColorStop(1, '#a8240c'); c.fillStyle = lg; c.beginPath(); c.moveTo(vx + dir * 10 - 5, vy - 116); c.quadraticCurveTo(vx + dir * sp * 0.6, vy - 50, vx + dir * sp, vy + end); c.lineTo(vx + dir * sp + 9, vy + end); c.quadraticCurveTo(vx + dir * sp * 0.6 + 7, vy - 52, vx + dir * 10 + 5, vy - 116); c.fill(); }); for (let k = 0; k < 8; k++) { const u = (t * 0.8 + k / 8) % 1, a = -Math.PI / 2 + (k - 3.5) * 0.25; c.fillStyle = `rgba(60,40,35,${1 - u})`; c.beginPath(); c.arc(vx + Math.cos(a) * u * 70, vy - 124 + Math.sin(a) * u * 90 + u * u * 50, 2.5, 0, TAU); c.fill(); } }
      const shake = SIG[0].f(d) / 50; c.fillStyle = '#e9dcc0'; [[-120, 26], [-96, 30], [110, 28]].forEach(([dx, h]) => { const x = vx + dx + (shake > 0.4 ? Math.sin(t * 40 + dx) * 2 * shake : 0); c.fillRect(x - 10, vy + 40 - h * 0.5, 20, h * 0.5); c.fillStyle = '#b5452f'; c.beginPath(); c.moveTo(x - 13, vy + 40 - h * 0.5); c.lineTo(x, vy + 40 - h * 0.5 - 10); c.lineTo(x + 13, vy + 40 - h * 0.5); c.fill(); c.fillStyle = '#e9dcc0'; });
      c.restore();
      txt(c, `${Math.floor(d)}일째`, vx, H * 0.06 + 26, '#fbfcf9', '800 18px');
      // 경보 단추
      const [bx, by, bw, bh] = g.btn;
      if (st.alarm < 0) { c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.roundRect(bx + 3, by + 4, bw, bh, 25); c.fill(); c.fillStyle = '#e4572e'; c.beginPath(); c.roundRect(bx, by, bw, bh, 25); c.fill(); txt(c, '경보 내리기', bx + bw / 2, by + 32, '#fff', '800 19px'); }
      else txt(c, st.alarm < ERU - 3 ? '대피할 시간이 있었다' : st.alarm < ERU ? '대피가 빠듯했다' : '경보가 늦었다', bx + bw / 2, by + 32, st.alarm < ERU - 3 ? '#8de0a3' : '#ffb08a', '800 18px');
    },
    hint(st, W, H) { const g = this.geo(W, H); return st.day < 14 ? [g.gx + g.gw * st.day / 30, g.sy, g.gw * 0.4, 0] : st.alarm < 0 && st.day > 19 ? [g.btn[0] + 115, g.btn[1] + 30, 0, 0] : st.alarm >= 0 && st.day < 30 ? [g.gx + g.gw * st.day / 30, g.sy, g.gw * (30 - st.day) / 30, 0] : null; },
    down(st, p, api) { const g = this.geo(api.W, api.H), [bx, by, bw, bh] = g.btn; if (st.alarm < 0 && inR(p, bx, by, bw, bh)) { this.alarmIt(st, api); return; } if (Math.abs(p.y - g.sy) < 34) { st.drag = true; this.move(st, p, true, api); } },
    move(st, p, held, api) {
      if (!held || !st.drag) return; const g = this.geo(api.W, api.H); st.day = clamp((p.x - g.gx) / g.gw * 30, 0, 30); if (st.day > 8) api.ok(1, true);
      if (st.day >= ERU && st.alarm >= 0) { api.ok(3, true); api.say(st.alarm < ERU - 3 ? `${Math.round(st.alarm)}일째 경보 → ${ERU}일째 분출. 지진이 잦아지고 땅이 부풀고 가스가 늘어나는 <b>전조</b>를 읽어 미리 대피할 수 있었다.` : `경보(${Math.round(st.alarm)}일째)가 분출(${ERU}일째)에 너무 가까웠다. 세 기록이 함께 늘기 시작할 때가 신호다.`); }
      else if (st.day >= ERU) api.say(`<b>${ERU}일째 분출!</b> 아직 경보를 내리지 않았다 — 기록을 되돌려 보고 언제 경보를 내렸어야 할지 찾아보자.`);
      else api.say(st.day < 15 ? '기록이 들쭉날쭉하지만 크게 변하지 않는다 — 평소 모습.' : '지진 횟수·땅 부풂·가스 양이 <b>함께 늘기</b> 시작했다. 마그마가 올라오고 있다는 신호일까?');
    },
    up(st) { st.drag = false; },
    alarmIt(st, api) { st.alarm = st.day; api.ok(1, true); api.ok(2, true); api.say(st.day < 15 ? `${Math.round(st.day)}일째 경보 — 아직 뚜렷한 신호가 없을 때다. 끝까지 끌어 결과를 보자.` : `${Math.round(st.day)}일째 경보를 내렸다. 날짜를 끝까지 끌어 실제 분출과 견주자.`); },
    key(st, e, api) { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { st.drag = true; const g = this.geo(api.W, api.H); this.move(st, { x: g.gx + g.gw * (st.day + (e.key === 'ArrowRight' ? 1 : -1)) / 30 }, true, api); st.drag = false; return true; } if (e.key === 'Enter' && st.alarm < 0) { this.alarmIt(st, api); return true; } return false; },
    act: { day: (st, api, d) => { st.drag = true; const g = KINDS.watch.geo(api.W, api.H); KINDS.watch.move(st, { x: g.gx + g.gw * d / 30 }, true, api); st.drag = false; return st.day; }, alarm: (st, api) => KINDS.watch.alarmIt(st, api) },
  };

  // ─────────── 6. 땅속 열로 전기 만들기(3-1-2 2차시) ───────────
  KINDS.geo = {
    first: '화산 지대 땅속에는 뜨거운 암석이 있다. 왼쪽 <b>펌프 손잡이</b>를 위아래로 끌어 찬물을 땅속으로 내려보내 보자.',
    steps: ['① 펌프 손잡이를 위아래로 끌어 찬물을 내려보낸다', '② 계속 펌프질해 증기로 터빈을 돌린다', '③ 온천을 눌러 땅속 열의 다른 쓰임을 본다'],
    done: '지구 내부 에너지가 전기와 온천이 된다',
    init: () => ({ pump: 0, last: null, water: 0, steam: 0, spin: 0, power: 0, spa: false, drops: [] }),
    geo(W, H) { return { gy: H * 0.4, wx1: W * 0.2, wx2: W * 0.42, hot: H * 0.82, plant: [W * 0.42, H * 0.4], town: W * 0.795, spa: [W * 0.945, H * 0.4 + 2], lever: [W * 0.1, H * 0.24] }; },
    draw(c, W, H, st, t, dt, api) {
      const g = this.geo(W, H);
      // 하늘과 화산(명암·분화구·연기)
      const sk = c.createLinearGradient(0, 0, 0, g.gy); sk.addColorStop(0, '#2b4f86'); sk.addColorStop(1, '#bcd8ef'); c.fillStyle = sk; c.fillRect(0, 0, W, g.gy);
      const vx = W * 0.66, vt = H * 0.08;
      const vg = c.createLinearGradient(W * 0.5, 0, W * 0.86, 0); vg.addColorStop(0, '#6a5a64'); vg.addColorStop(0.5, '#8d7a80'); vg.addColorStop(1, '#4a3c44'); c.fillStyle = vg;
      c.beginPath(); c.moveTo(W * 0.46, g.gy); c.quadraticCurveTo(vx - 50, vt + 60, vx - 18, vt); c.quadraticCurveTo(vx, vt + 6, vx + 18, vt); c.quadraticCurveTo(vx + 50, vt + 60, W * 0.88, g.gy); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(40,30,36,.35)'; c.lineWidth = 1.2; [-0.5, -0.15, 0.3].forEach((q) => { c.beginPath(); c.moveTo(vx + q * 30, vt + 6); c.quadraticCurveTo(vx + q * 90, vt + 60, vx + q * 190, g.gy); c.stroke(); });
      glow(c, vx, vt + 2, 16, 'rgba(255,130,60,.55)');
      for (let i = 0; i < 5; i++) { const u = (t * 0.12 + i / 5) % 1; c.fillStyle = `rgba(225,225,232,${0.45 * (1 - u)})`; c.beginPath(); c.arc(vx + u * 40 + Math.sin(u * 5) * 6, vt - u * 50, 8 + u * 20, 0, TAU); c.fill(); }
      // 땅속: 지층 + 아래로 갈수록 뜨거워지는 암석
      const ug = c.createLinearGradient(0, g.gy, 0, H); ug.addColorStop(0, '#7a5c44'); ug.addColorStop(0.35, '#6a4a36'); ug.addColorStop(0.7, '#8a3e22'); ug.addColorStop(1, '#e8641e'); c.fillStyle = ug; c.fillRect(0, g.gy, W, H - g.gy);
      c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 2; for (let k = 1; k < 4; k++) { const y = g.gy + k * (g.hot - g.gy) / 4; c.beginPath(); for (let x = 0; x <= W; x += 20) c.lineTo(x, y + 6 * Math.sin(x * 0.02 + k)); c.stroke(); }
      speckle(c, 0, g.gy, W, H - g.gy, 260, 'rgba(0,0,0,.16)', 4);
      for (let i = 0; i < 5; i++) { const u = (t * 0.1 + i / 5) % 1; c.fillStyle = `rgba(255,200,90,${0.3 * (1 - u)})`; c.beginPath(); c.ellipse(W * (0.1 + i * 0.2), H - u * 50, 70, 18, 0, 0, TAU); c.fill(); }
      txt(c, '뜨거운 암석(지구 내부 에너지)', W * 0.36, H - 12, '#fff3d0', '800 15px');
      txt(c, `땅속 온도: 깊을수록 높다`, W * 0.04, g.hot - 6, '#ffe0c0', '700 12px', 'left');
      // 잔디
      const gg = c.createLinearGradient(0, g.gy - 6, 0, g.gy + 8); gg.addColorStop(0, '#6fb34e'); gg.addColorStop(1, '#3f7a30'); c.fillStyle = gg; c.fillRect(0, g.gy - 4, W, 10);
      // 우물 두 개(관: 바깥 쇠관 + 속 흐름)
      const pipe = (x, col) => { const pg = c.createLinearGradient(x - 10, 0, x + 10, 0); pg.addColorStop(0, '#2a2d36'); pg.addColorStop(0.5, '#6b7183'); pg.addColorStop(1, '#2a2d36'); c.fillStyle = pg; c.fillRect(x - 10, g.gy, 20, g.hot - g.gy); c.fillStyle = col; c.fillRect(x - 5, g.gy, 10, g.hot - g.gy); };
      pipe(g.wx1, 'rgb(90,160,235)'); pipe(g.wx2, `rgb(${lerp(110, 255, st.steam) | 0},${lerp(110, 150, st.steam) | 0},${lerp(130, 80, st.steam) | 0})`);
      // 땅속 뜨거운 암석 사이 틈(물이 데워지는 곳)
      c.fillStyle = 'rgba(255,170,90,.25)'; c.beginPath(); c.ellipse((g.wx1 + g.wx2) / 2, g.hot + 8, (g.wx2 - g.wx1) / 2 + 30, 24, 0, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(255,220,160,.55)'; c.setLineDash([5, 6]); c.lineWidth = 3; c.beginPath(); c.moveTo(g.wx1, g.hot); c.bezierCurveTo(g.wx1 + 40, g.hot + 30, g.wx2 - 40, g.hot + 30, g.wx2, g.hot); c.stroke(); c.setLineDash([]);
      txt(c, '물이 데워지는 곳', (g.wx1 + g.wx2) / 2, g.hot + 44, '#ffe0c0', '700 12px');
      st.drops.forEach((d) => { d.u += dt * 0.6; const p = d.u < 1 ? [g.wx1, lerp(g.gy, g.hot, d.u)] : d.u < 1.4 ? [lerp(g.wx1, g.wx2, (d.u - 1) / 0.4), g.hot + 18 * Math.sin((d.u - 1) / 0.4 * Math.PI)] : [g.wx2, lerp(g.hot, g.gy, (d.u - 1.4) / 0.6)]; const hot = clamp((d.u - 0.8) / 0.6, 0, 1); c.fillStyle = `rgb(${lerp(90, 255, hot) | 0},${lerp(170, 160, hot) | 0},${lerp(255, 90, hot) | 0})`; c.beginPath(); c.arc(p[0], p[1], 5, 0, TAU); c.fill(); if (d.u >= 2 && !d.done) { d.done = true; st.steam = Math.min(1, st.steam + 0.08); } });
      st.drops = st.drops.filter((d) => d.u < 2.05);
      txt(c, '찬물 ↓', g.wx1 + 16, g.gy + 34, '#bfe3ff', '800 13px', 'left'); txt(c, '↑ 뜨거운 증기', g.wx2 + 16, g.gy + 34, '#ffd0a0', '800 13px', 'left');
      // 펌프: 받침돌 + 둥근 몸통 + 지렛대 손잡이
      const la = -0.5 + st.pump, bx = g.wx1;
      c.fillStyle = '#8a8478'; c.beginPath(); c.roundRect(bx - 26, g.gy - 12, 52, 12, 3); c.fill();
      const bg2 = c.createLinearGradient(bx - 16, 0, bx + 16, 0); bg2.addColorStop(0, '#3a4a6a'); bg2.addColorStop(0.45, '#7c8fb2'); bg2.addColorStop(1, '#2a3550'); c.fillStyle = bg2; c.beginPath(); c.roundRect(bx - 15, g.gy - 66, 30, 56, 8); c.fill();
      c.fillStyle = '#2a3550'; c.beginPath(); c.moveTo(bx + 14, g.gy - 48); c.lineTo(bx + 34, g.gy - 44); c.lineTo(bx + 34, g.gy - 38); c.lineTo(bx + 14, g.gy - 40); c.fill();
      c.fillStyle = '#5a6a8a'; c.beginPath(); c.arc(bx, g.gy - 68, 8, 0, TAU); c.fill();
      c.save(); c.translate(bx, g.gy - 68); c.rotate(la); c.strokeStyle = '#c9ccd4'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(14, 0); c.lineTo(-86, 0); c.stroke(); c.fillStyle = '#e4572e'; c.beginPath(); c.roundRect(-100, -7, 22, 14, 7); c.fill(); c.restore();
      txt(c, '펌프', bx + 26, g.gy - 74, '#1d2433', '800 13px', 'left');
      // 지열 발전소: 앞면·옆면이 있는 건물, 창 속 터빈, 발전기, 냉각탑, 증기관
      const px = g.wx2 + 78, py = g.gy - 2, bw = 150, bh = 92, dep = 18;
      // 생산정 → 발전소로 가는 보온 증기관
      c.strokeStyle = '#c9ccd4'; c.lineWidth = 9; c.lineJoin = 'round'; c.beginPath(); c.moveTo(g.wx2, g.gy); c.lineTo(g.wx2, py - 30); c.lineTo(px - bw / 2, py - 30); c.stroke();
      c.strokeStyle = `rgba(255,${(200 - 90 * st.steam) | 0},${(190 - 130 * st.steam) | 0},.9)`; c.lineWidth = 4; c.stroke(); c.lineJoin = 'miter';
      for (let k = 0; k < 3; k++) { c.fillStyle = '#8a93a6'; c.fillRect(g.wx2 - 7, py - 30 - 6 + k * 0, 14, 4); }
      c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(px + 10, py + 2, bw * 0.62, 7, 0, 0, TAU); c.fill();
      // 옆면(어둡게) + 지붕 윗면
      c.fillStyle = '#9aa3b4'; c.beginPath(); c.moveTo(px + bw / 2, py); c.lineTo(px + bw / 2 + dep, py - dep * 0.6); c.lineTo(px + bw / 2 + dep, py - bh - dep * 0.6); c.lineTo(px + bw / 2, py - bh); c.closePath(); c.fill();
      c.fillStyle = '#c3cad6'; c.beginPath(); c.moveTo(px - bw / 2, py - bh); c.lineTo(px - bw / 2 + dep, py - bh - dep * 0.6); c.lineTo(px + bw / 2 + dep, py - bh - dep * 0.6); c.lineTo(px + bw / 2, py - bh); c.closePath(); c.fill();
      const hg = c.createLinearGradient(px - bw / 2, 0, px + bw / 2, 0); hg.addColorStop(0, '#f1f4f8'); hg.addColorStop(1, '#cfd5df'); c.fillStyle = hg; c.fillRect(px - bw / 2, py - bh, bw, bh);
      c.strokeStyle = 'rgba(29,36,51,.25)'; c.lineWidth = 1; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(px - bw / 2, py - bh + k * bh / 4); c.lineTo(px + bw / 2, py - bh + k * bh / 4); c.stroke(); }
      c.fillStyle = '#2f9e5b'; c.fillRect(px - bw / 2, py - bh, bw, 6);
      // 큰 창: 터빈 홀
      c.fillStyle = '#1a2233'; c.beginPath(); c.roundRect(px - bw / 2 + 10, py - bh + 16, 74, 60, 5); c.fill();
      const tw = px - bw / 2 + 47, ty2 = py - bh + 46;
      st.spin += dt * st.steam * 14; c.save(); c.translate(tw, ty2); c.rotate(st.spin); for (let i = 0; i < 10; i++) { c.rotate(TAU / 10); const bl = c.createLinearGradient(0, 0, 24, 0); bl.addColorStop(0, '#9aa8c2'); bl.addColorStop(1, '#e8eef8'); c.fillStyle = bl; c.beginPath(); c.ellipse(13, 0, 13, 4, 0.35, 0, TAU); c.fill(); } c.fillStyle = '#e4572e'; c.beginPath(); c.arc(0, 0, 5, 0, TAU); c.fill(); c.restore();
      c.strokeStyle = 'rgba(160,190,230,.5)'; c.lineWidth = 2; c.beginPath(); c.arc(tw, ty2, 27, 0, TAU); c.stroke();
      if (st.steam > 0.05) for (let k = 0; k < 4; k++) { const u = (t * 1.2 + k / 4) % 1; c.fillStyle = `rgba(255,255,255,${0.5 * st.steam * (1 - u)})`; c.beginPath(); c.arc(px - bw / 2 + 12 + u * 30, ty2 - 4 + Math.sin(u * 6) * 3, 3 + u * 3, 0, TAU); c.fill(); }
      c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.moveTo(px - bw / 2 + 12, py - bh + 18); c.lineTo(px - bw / 2 + 34, py - bh + 18); c.lineTo(px - bw / 2 + 18, py - bh + 74); c.lineTo(px - bw / 2 + 12, py - bh + 74); c.fill();
      // 축과 발전기
      const gx = px + 38, gyy = ty2; c.strokeStyle = '#5a6476'; c.lineWidth = 5; c.beginPath(); c.moveTo(px - bw / 2 + 84, gyy); c.lineTo(gx - 20, gyy); c.stroke();
      const cg = c.createLinearGradient(0, gyy - 22, 0, gyy + 22); cg.addColorStop(0, '#5a9be8'); cg.addColorStop(0.5, '#2a6ac0'); cg.addColorStop(1, '#173c6a'); c.fillStyle = cg; c.beginPath(); c.roundRect(gx - 20, gyy - 22, 46, 44, 8); c.fill();
      for (let k = 0; k < 4; k++) { c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(gx - 14 + k * 10, gyy - 18, 3, 36); }
      c.fillStyle = '#3b4252'; c.fillRect(gx - 22, gyy + 22, 50, 6);
      if (st.power > 0.2) { glow(c, gx + 3, gyy, 34, `rgba(255,216,77,${0.45 * st.power})`); for (let k = 0; k < 3; k++) { const u = (t * 3 + k / 3) % 1; c.strokeStyle = `rgba(255,216,77,${st.power * (1 - u)})`; c.lineWidth = 2; c.beginPath(); c.moveTo(gx + 26, gyy - 10 + k * 10); c.lineTo(gx + 26 + u * 12, gyy - 14 + k * 10); c.stroke(); } }
      txt(c, '터빈', tw, py - 6, '#1d2433', '800 11px'); txt(c, '발전기', gx + 3, py - 6, '#1d2433', '800 11px');
      txt(c, '지열 발전소', px + 8, py - bh - dep - 8, '#1d2433', '800 14px');
      // 냉각탑(쌍곡 모양 + 명암 + 김)
      const tx = px - bw / 2 - 40, th = 84; const tg = c.createLinearGradient(tx - 24, 0, tx + 24, 0); tg.addColorStop(0, '#9aa2b2'); tg.addColorStop(0.4, '#eef1f5'); tg.addColorStop(1, '#8a93a6'); c.fillStyle = tg;
      c.beginPath(); c.moveTo(tx - 26, py); c.quadraticCurveTo(tx - 12, py - th * 0.55, tx - 17, py - th); c.lineTo(tx + 17, py - th); c.quadraticCurveTo(tx + 12, py - th * 0.55, tx + 26, py); c.closePath(); c.fill();
      c.fillStyle = '#6b7183'; c.beginPath(); c.ellipse(tx, py - th, 17, 4, 0, 0, TAU); c.fill();
      for (let i = 0; i < 6; i++) { const u = (t * 0.35 + i / 6) % 1; c.fillStyle = `rgba(255,255,255,${(0.25 + 0.55 * st.steam) * (1 - u)})`; c.beginPath(); c.arc(tx + Math.sin(u * 5) * 8 + u * 14, py - th - 6 - u * 70, 9 + u * 20, 0, TAU); c.fill(); }
      // 송전탑·전선
      st.power = lerp(st.power, st.steam, dt * 2);
      const tower = (x, h) => { c.strokeStyle = '#e3e7ee'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x - 9, py); c.lineTo(x, py - h); c.lineTo(x + 9, py); c.stroke(); c.lineWidth = 1; for (let k = 1; k < 4; k++) { const yy = py - h * k / 4, w = 9 * (1 - k / 4); c.beginPath(); c.moveTo(x - w, yy); c.lineTo(x + w, yy - h / 4); c.moveTo(x + w, yy); c.lineTo(x - w, yy - h / 4); c.stroke(); } c.lineWidth = 2; c.beginPath(); c.moveTo(x - 14, py - h * 0.85); c.lineTo(x + 14, py - h * 0.85); c.stroke(); };
      const p1 = px + bw / 2 + 30, p2 = p1; tower(p1, 74);
      c.strokeStyle = '#2a2d36'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(px + bw / 2, py - bh + 20); c.quadraticCurveTo((px + bw / 2 + p1) / 2, py - bh + 34, p1, py - 63); c.quadraticCurveTo((p1 + g.town) / 2, py - 40, g.town - 40, py - 30); c.stroke();
      for (let i = 0; i < 4; i++) { if (st.power < 0.2) break; const u = (t * 0.8 + i / 4) % 1; glow(c, lerp(p1, g.town - 40, u), lerp(py - 63, py - 30, u) + Math.sin(u * Math.PI) * 18, 6, 'rgba(255,216,77,.9)'); }
      // 마을: 크기가 다른 집 다섯 채 + 나무, 전기가 오면 창에 불
      [[-46, 36, 36, '#c95353'], [-8, 46, 40, '#3d7fb0'], [30, 32, 32, '#c98a3a'], [-72, 20, 0, null]].forEach(([dx, h, w, rf]) => {
        const x = g.town + dx;
        if (!rf) { c.fillStyle = '#5a3d2a'; c.fillRect(x - 2, py - 16, 4, 16); const tr = c.createRadialGradient(x - 3, py - 26, 2, x, py - 22, 12); tr.addColorStop(0, '#7ccf6a'); tr.addColorStop(1, '#2b7a3d'); c.fillStyle = tr; c.beginPath(); c.arc(x, py - 24, 11, 0, TAU); c.fill(); return; }
        c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x - w / 2 + 3, py - 2, w, 4);
        const wg2 = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0); wg2.addColorStop(0, '#f4ecdc'); wg2.addColorStop(1, '#d6c9ae'); c.fillStyle = wg2; c.fillRect(x - w / 2, py - h, w, h);
        c.fillStyle = rf; c.beginPath(); c.moveTo(x - w / 2 - 4, py - h); c.lineTo(x, py - h - w * 0.5); c.lineTo(x + w / 2 + 4, py - h); c.closePath(); c.fill(); c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.moveTo(x, py - h - w * 0.5); c.lineTo(x + w / 2 + 4, py - h); c.lineTo(x, py - h); c.fill();
        c.fillStyle = '#6b5a4a'; c.fillRect(x + w * 0.18, py - h - w * 0.42, 4, 9);
        const lit = st.power > 0.5; c.fillStyle = lit ? '#ffe27a' : '#5a6a8a'; [[-w / 2 + 5, 6], [w / 2 - 15, 6], [-w / 2 + 5, 20], [w / 2 - 15, 20]].forEach(([ox, oy]) => { if (oy + 12 < h - 12) { c.fillRect(x + ox, py - h + oy, 10, 9); c.fillStyle = 'rgba(29,36,51,.5)'; c.fillRect(x + ox + 4.5, py - h + oy, 1, 9); c.fillStyle = lit ? '#ffe27a' : '#5a6a8a'; } }); if (lit) glow(c, x, py - h + 14, 22, 'rgba(255,226,122,.35)');
        c.fillStyle = '#7a5030'; c.fillRect(x - 4, py - 14, 8, 14);
      });
      txt(c, '마을', g.town - 10, py + 16, '#fbfcf9', '800 13px');
      // 온천: 돌로 두른 웅덩이 + 김
      const [sx, sy] = g.spa;
      if (st.spa) { c.strokeStyle = 'rgba(127,209,232,.85)'; c.setLineDash([4, 5]); c.lineWidth = 2.5; c.beginPath(); c.moveTo(sx, sy + 10); c.quadraticCurveTo(sx - 20, H * 0.62, sx - 70, g.hot); c.stroke(); c.setLineDash([]); txt(c, '데워진 지하수', sx - 6, H * 0.62, '#bfe3ff', '800 13px', 'right'); }
      for (let k = 0; k < 9; k++) { const a = k / 9 * TAU; const rx = sx + Math.cos(a) * 40, ry2 = sy + Math.sin(a) * 11; ball(c, rx, ry2, 6, '#8a8478'); }
      const wg = c.createRadialGradient(sx - 8, sy - 3, 2, sx, sy, 36); wg.addColorStop(0, '#bff0fa'); wg.addColorStop(1, '#4fb0cc'); c.fillStyle = wg; c.beginPath(); c.ellipse(sx, sy, 34, 8, 0, 0, TAU); c.fill();
      for (let i = 0; i < 3; i++) { const u = (t * 0.5 + i / 3) % 1; c.strokeStyle = `rgba(255,255,255,${0.85 * (1 - u)})`; c.lineWidth = 2.5; c.beginPath(); c.moveTo(sx - 14 + i * 14, sy - 8 - u * 30); c.bezierCurveTo(sx - 20 + i * 14, sy - 18 - u * 30, sx - 8 + i * 14, sy - 24 - u * 30, sx - 14 + i * 14, sy - 34 - u * 30); c.stroke(); }
      txt(c, '온천', sx, sy + 26, '#fbfcf9', '800 13px');
      // 계기: 전기 생산
      const mx = W * 0.04, my = H * 0.55; c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.roundRect(mx, my, 140, 56, 10); c.fill();
      txt(c, '전기 생산', mx + 70, my + 20, '#fbfcf9', '700 13px'); c.fillStyle = 'rgba(255,255,255,.15)'; c.fillRect(mx + 12, my + 30, 116, 12); c.fillStyle = EL; c.fillRect(mx + 12, my + 30, 116 * st.power, 12);
      st.steam = Math.max(0, st.steam - dt * 0.05);
    },
    hint(st, W, H) { const g = this.geo(W, H); return st.steam < 0.6 ? [g.wx1 - 89 * Math.cos(-0.5 + st.pump), g.gy - 68 - 89 * Math.sin(-0.5 + st.pump) + 8, 0, 60] : !st.spa ? [g.spa[0], g.spa[1] - 4, 0, 0] : null; },
    down(st, p, api) { const g = this.geo(api.W, api.H); if (near(p, g.spa[0], g.spa[1], 50)) { this.spaIt(st, api); return; } if (p.x < g.wx1 + 30 && p.y < g.gy + 10) { st.last = p.y; st.dragP = true; } },
    move(st, p, held, api) {
      if (!held || !st.dragP) return; const dy = p.y - st.last; st.last = p.y; st.pump = clamp(st.pump + dy / 120, 0, 1);
      if (dy > 0) { st.acc = (st.acc || 0) + dy; if (st.acc > 30) { st.acc = 0; st.drops.push({ u: 0 }); st.water = Math.min(1, st.water + 0.1); api.ok(1, true); } }
      if (st.steam > 0.6) { api.ok(2, true); api.say('땅속 뜨거운 암석에 데워진 물이 <b>증기</b>가 되어 올라와 터빈을 돌리고, 발전기가 전기를 만들어 마을에 불이 켜졌다 — <b>지열 발전</b>.'); }
      else if (st.water > 0) api.say('찬물이 땅속 깊이 내려가 뜨거운 암석에 데워진다. 계속 펌프질하자.');
    },
    up(st) { st.dragP = false; },
    spaIt(st, api) { st.spa = true; api.ok(3, true); api.say('화산 지대에서는 마그마의 열에 <b>지하수가 데워져</b> 저절로 온천이 솟기도 한다. 땅속 열은 전기·난방·온천·관광에 쓰인다 — 화산이 주는 이로운 점.'); },
    key(st, e, api) { if (e.key === 'ArrowDown' || e.key === ' ') { for (let i = 0; i < 2; i++) st.drops.push({ u: 0 }); st.water = Math.min(1, st.water + 0.2); api.ok(1, true); return true; } if (e.key === 'Enter') { this.spaIt(st, api); return true; } return false; },
    act: { run: (st, api) => { st.water = 1; st.steam = 1; st.power = 1; for (let i = 0; i < 6; i++) st.drops.push({ u: i * 0.3 }); api.ok(1, true); api.ok(2, true); api.say('땅속 뜨거운 암석에 데워진 물이 <b>증기</b>가 되어 터빈을 돌린다 — <b>지열 발전</b>.'); return 1; }, spa: (st, api) => KINDS.geo.spaIt(st, api) },
  };


  // ─────────── 공용 틀 ───────────
  function mount(root, kind) {
    const K = KINDS[kind], P = window.Play;
    const stage = root.querySelector('.mx-stage'), now = root.querySelector('.mx-now'), out = root.querySelector('.mx-out');
    const nSteps = root.querySelectorAll('.u-steps li').length || K.steps.length;
    let st, t = 0, touched = false, msg = '', revealed = false;
    const ok = new Set();
    // 예측(고르기) → 해 보기 → 맞춰 보기: .xp-pred data-a(정답 번호) data-at(드러낼 단계, 없으면 마지막 단계) data-why
    const pred = root.querySelector('.xp-pred'), pBtns = pred ? [...pred.querySelectorAll('button')] : [];
    const pAt = pred ? +(pred.dataset.at || nSteps) : 0;
    function verdict() {
      if (!pred) return;
      const v = pred.querySelector('.xp-verdict'), a = +pred.dataset.a, pick = pBtns.findIndex((b) => b.getAttribute('aria-pressed') === 'true');
      if (!revealed) { pBtns.forEach((b) => b.classList.remove('answer')); v.innerHTML = pick < 0 ? '하나 고른 뒤 해 보고 맞춰 보자.' : '골랐다. 이제 그림을 직접 움직여 확인해 보자.'; v.classList.remove('on', 'miss'); return; }
      pBtns.forEach((b, i) => b.classList.toggle('answer', i === a));
      v.classList.add('on'); v.classList.toggle('miss', pick >= 0 && pick !== a);
      v.innerHTML = (pick < 0 ? '<b>결과</b> ' : pick === a ? '<b>예측이 맞았다.</b> ' : '<b>예측과 달랐다.</b> ') + pred.dataset.why;
    }
    pBtns.forEach((b) => b.addEventListener('click', () => { pBtns.forEach((o) => o.setAttribute('aria-pressed', String(o === b))); verdict(); }));
    function sync() {
      const cur = Array.from({ length: nSteps }, (_, i) => i + 1).find((k) => !ok.has(k)) || 0;
      window.L1.steps(root, cur, [...ok]); window.L1.done(root, cur === 0);
      const tx = cur ? K.steps[cur - 1] : K.done;
      if (now.textContent !== tx) now.textContent = tx; now.classList.toggle('done', cur === 0);
      if (pred && !revealed && ok.has(pAt)) { revealed = true; verdict(); }
    }
    const api = {
      say(h) { if (h !== msg) { msg = h; out.innerHTML = h; } },
      ok(k, on = true) { if (on && !ok.has(k)) { ok.add(k); sync(); } },
      okd: (k) => ok.has(k),
      get W() { return S.W; }, get H() { return S.H; },
    };
    // 손가락 안내는 처음에만: 한 번 누르거나 끌면 사라진다
    const S = P.make(stage, {
      draw(c, W, H, dt) { t += dt; K.draw.call(K, c, W, H, st, t, dt, api); if (!touched && K.hint) { const h = K.hint.call(K, st, W, H); if (h) hand(c, h[0], h[1], h[2], h[3], t); } },
      down(p) { touched = true; if (K.down) K.down.call(K, st, p, api); },
      move(p, e, held) { if (K.move) K.move.call(K, st, p, held, api); },
      up(p) { if (K.up) K.up.call(K, st, p, api); },
      key(e) { if (e.key === '0') { reset(); return true; } const r = K.key && K.key.call(K, st, e, api); if (r) touched = true; return !!r; },
    });
    function reset() { st = K.init(api); ok.clear(); msg = ''; revealed = false; verdict(); api.say(K.first); sync(); S.kick(); }
    root.querySelector('.mx-reset')?.addEventListener('click', () => { touched = true; reset(); });
    reset();
    root._mx = { state: () => st, pick: (i) => { if (pBtns[i]) pBtns[i].click(); }, act: (name, ...a) => { touched = true; const r = K.act[name](st, api, ...a); S.kick(); return r; }, steps: () => [...ok] };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.More31 = { mount };
})();
