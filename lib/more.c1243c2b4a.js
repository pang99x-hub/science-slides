/* 2-2 늘린 장(2026-11-13) 체험 여섯 가지. More.mount(root, 종류) → { fit, setActive }
   장 구조: .mx-stage(캔버스) · .mx-now(지금 할 것 칩) · .mx-out(풀이) · .mx-reset(처음부터) · .u-steps li[data-s]
   종류: extract(바나나에서 DNA 꺼내기) forensic(현장 DNA와 맞는 사람 찾기) — 2-2-1 3차시
         unzip(DNA 지퍼 열기, 수소 결합 수) repair(상처 난 가닥 되살리기) — 2-2-1 4차시
         wire(전선 껍질 벗겨 보기) — 2-2-2 1차시 · solar(햇빛으로 선풍기 돌리기) — 2-2-2 2차시
   끌기 전에는 손가락이 할 일을 가리키고, 처음 누르면 사라진다. 키보드: 0 처음부터 + 종류마다 적은 키.
   시험용: root._mx.state() · root._mx.act(이름, …) */
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

  // ─────────── 1. 바나나에서 DNA 꺼내기 ───────────
  // 단계: 0 으깨기 → 1 세제·소금물 넣기 → 2 걸러 담기(저절로) → 3 차가운 에탄올 붓기 → 4 유리 막대로 감기 → 5 끝
  KINDS.extract = {
    first: '지퍼 백 속 바나나를 손으로 <b>문질러 으깨자</b>. 세포를 부수어야 속의 DNA가 나온다.',
    steps: ['① 지퍼 백을 좌우로 문질러 바나나를 으깨자', '② 세제와 소금을 끌어 백에 넣자', '③ 차가운 에탄올 병을 컵 위로 끌어 붓자', '④ 유리 막대 둘레를 빙글빙글 돌려 감자'],
    done: 'DNA를 꺼냈다 — 흰 실처럼 보인다',
    init: () => ({ st: 0, mash: 0, det: false, salt: false, filt: 0, eth: 0, wind: 0, drag: null, ang: null, bub: [], last: null }),
    geo(W, H) { return { ty: H * 0.72, bag: [W * 0.06, H * 0.3, W * 0.3, H * 0.4], cup: [W * 0.56, H * 0.72, W * 0.17, H * 0.36], det: [W * 0.84, H * 0.72], salt: [W * 0.93, H * 0.72], eth: [W * 0.88, H * 0.95] }; },
    step(st, api) { const n = st.st; api.ok(1, n > 0); api.ok(2, n > 1); api.ok(3, n > 3); api.ok(4, n > 4); },
    draw(c, W, H, st, t, dt, api) {
      const g = this.geo(W, H), [bx, by, bw, bh] = g.bag, [cx, cy, cw, ch] = g.cup;
      // 부엌 벽 + 탁자
      const wg = c.createLinearGradient(0, 0, 0, g.ty); wg.addColorStop(0, '#2c3b62'); wg.addColorStop(1, '#1b2442'); c.fillStyle = wg; c.fillRect(0, 0, W, g.ty);
      c.strokeStyle = 'rgba(255,255,255,.05)'; c.lineWidth = 1; for (let x = 0; x < W; x += 48) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, g.ty); c.stroke(); } for (let y = 0; y < g.ty; y += 48) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
      // 창문(바깥 햇빛)과 탁자 위 바나나 한 송이
      const wx = W * 0.6, wy = H * 0.05, ww = W * 0.34, wh = H * 0.3;
      c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(wx + 5, wy + 6, ww, wh);
      const sky = c.createLinearGradient(0, wy, 0, wy + wh); sky.addColorStop(0, '#8fc4ef'); sky.addColorStop(1, '#d8ecfa'); c.fillStyle = sky; c.fillRect(wx, wy, ww, wh);
      c.fillStyle = 'rgba(255,255,255,.85)'; [[0.2, 0.35, 26], [0.62, 0.55, 20]].forEach(([u, v2, r]) => { c.beginPath(); c.arc(wx + ww * u + Math.sin(t * 0.2) * 6, wy + wh * v2, r, 0, TAU); c.arc(wx + ww * u + r, wy + wh * v2 + 4, r * 0.8, 0, TAU); c.arc(wx + ww * u - r, wy + wh * v2 + 6, r * 0.7, 0, TAU); c.fill(); });
      c.strokeStyle = '#e9e2d0'; c.lineWidth = 8; c.strokeRect(wx, wy, ww, wh); c.lineWidth = 5; c.beginPath(); c.moveTo(wx + ww / 2, wy); c.lineTo(wx + ww / 2, wy + wh); c.moveTo(wx, wy + wh / 2); c.lineTo(wx + ww, wy + wh / 2); c.stroke();
      c.fillStyle = 'rgba(255,240,200,.06)'; c.beginPath(); c.moveTo(wx, wy + wh); c.lineTo(wx + ww, wy + wh); c.lineTo(wx + ww * 0.8, g.ty); c.lineTo(wx - ww * 0.4, g.ty); c.fill();
      table(c, W, H, g.ty);
      const bnx = W * 0.18, bny = H * 0.88;
      [0, 1].forEach((k) => { c.save(); c.translate(bnx + k * 22, bny - k * 6); c.rotate(-0.15 + k * 0.1);
        c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(4, 14, 70, 10, 0, 0, TAU); c.fill();
        const bgr = c.createLinearGradient(0, -20, 0, 16); bgr.addColorStop(0, '#ffe66b'); bgr.addColorStop(0.6, '#f2c230'); bgr.addColorStop(1, '#b8871a');
        c.fillStyle = bgr; c.beginPath(); c.moveTo(-70, -2); c.quadraticCurveTo(0, 34, 70, -6); c.quadraticCurveTo(0, 12, -70, -2); c.fill(); c.strokeStyle = '#8a6514'; c.lineWidth = 1.5; c.stroke();
        c.fillStyle = '#4a3416'; c.beginPath(); c.arc(-70, -2, 4, 0, TAU); c.fill(); c.fillRect(66, -12, 10, 6); c.restore(); });
      txt(c, '바나나', bnx + 10, H - 12, DIM, '700 14px');
      // 지퍼 백(투명) + 바나나 → 으깬 반죽
      const m = st.mash, liquid = (st.det ? 0.5 : 0) + (st.salt ? 0.5 : 0), tiltB = st.st === 2 ? ease(clamp(st.filt * 3, 0, 1)) * 0.5 * (1 - ease(clamp((st.filt - 0.8) * 5, 0, 1))) : 0;
      c.save(); if (st.st > 2) c.globalAlpha = 0.45; c.translate(bx + bw / 2, by + bh / 2); c.rotate(tiltB); c.translate(-(bx + bw / 2), -(by + bh / 2));
      const squish = st.drag === 'bag' ? Math.sin(t * 18) * 3 : 0;
      c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.roundRect(bx + 4, by + 8, bw, bh, 18); c.fill();
      c.fillStyle = 'rgba(225,240,255,.16)'; c.beginPath(); c.roundRect(bx, by, bw, bh + squish, 18); c.fill();
      const left = st.st >= 2 ? 1 - clamp(st.filt * 1.4, 0, 1) : 1;
      if (left > 0.02) {
        const lh = bh * 0.55 * left, ly = by + bh - lh;
        const pg = c.createLinearGradient(0, ly, 0, by + bh); pg.addColorStop(0, `rgba(${lerp(250, 235, m) | 0},${lerp(225, 210, m) | 0},${lerp(120, 150, m) | 0},${0.35 + 0.5 * m})`); pg.addColorStop(1, `rgba(214,184,110,${0.5 + 0.4 * m})`);
        if (m > 0.05) { c.fillStyle = pg; c.beginPath(); c.moveTo(bx + 6, by + bh - 6); c.lineTo(bx + 6, ly + 6 * Math.sin(t * 3)); for (let x = bx + 6; x <= bx + bw - 6; x += 8) c.lineTo(x, ly + 4 * Math.sin(x * 0.08 + t * 3)); c.lineTo(bx + bw - 6, by + bh - 6); c.closePath(); c.fill(); }
        // 덜 으깬 바나나 조각
        for (let i = 0; i < 5; i++) {
          const s = (1 - m) * 1, px = bx + bw * (0.2 + i * 0.15), py = by + bh * (0.62 + (i % 2) * 0.12);
          if (s < 0.05) continue;
          c.save(); c.translate(px, py); c.rotate(i * 0.7 + squish * 0.02); c.scale(s, s);
          const bg2 = c.createLinearGradient(0, -14, 0, 14); bg2.addColorStop(0, '#fff3a8'); bg2.addColorStop(1, '#e6c75a');
          c.fillStyle = bg2; c.beginPath(); c.ellipse(0, 0, 26, 14, 0, 0, TAU); c.fill(); c.strokeStyle = '#c9a43c'; c.lineWidth = 1.5; c.stroke();
          c.fillStyle = 'rgba(120,90,40,.5)'; [-8, 0, 8].forEach((d) => { c.beginPath(); c.arc(d, 0, 1.6, 0, TAU); c.fill(); });
          c.restore();
        }
        if (liquid > 0) for (const b of st.bub) { c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.2; c.beginPath(); c.arc(b.x, b.y, b.r, 0, TAU); c.stroke(); }
      }
      c.strokeStyle = 'rgba(225,240,255,.8)'; c.lineWidth = 2.5; c.beginPath(); c.roundRect(bx, by, bw, bh + squish, 18); c.stroke();
      c.fillStyle = '#d64545'; c.fillRect(bx + 8, by + 10, bw - 16, 5); c.fillStyle = '#3d6fd6'; c.fillRect(bx + 8, by + 16, bw - 16, 4);
      c.restore();
      txt(c, '지퍼 백', bx + bw / 2, by - 10, DIM, '700 16px');
      // 깔때기 + 거름종이 + 컵
      const fx = cx, fy = cy - ch - 6;
      glass(c, cx, cy, cw, ch);
      // 컵 속 거른 액(누런빛) + 에탄올 층(투명) + DNA 실
      const extract = st.st >= 2 ? clamp(st.st === 2 ? st.filt : 1, 0, 1) : 0, lvl1 = ch * 0.38 * extract, lvl2 = ch * 0.3 * st.eth;
      if (extract > 0) {
        const eg = c.createLinearGradient(0, cy - lvl1, 0, cy); eg.addColorStop(0, 'rgba(240,215,130,.75)'); eg.addColorStop(1, 'rgba(200,160,80,.85)');
        c.fillStyle = eg; c.fillRect(cx - cw / 2 + 5, cy - lvl1, cw - 10, lvl1 - 3);
      }
      if (st.eth > 0) {
        c.fillStyle = 'rgba(200,225,255,.28)'; c.fillRect(cx - cw / 2 + 4, cy - lvl1 - lvl2, cw - 8, lvl2);
        // 경계면에 생기는 흰 실 같은 DNA(에탄올이 많을수록 짙게, 감을수록 줄어든다)
        const dn = st.eth * (1 - st.wind), iy = cy - lvl1;
        c.save(); c.strokeStyle = `rgba(255,255,255,${0.75 * dn})`; c.lineWidth = 1.6;
        for (let i = 0; i < 14; i++) { c.lineWidth = 1.2 + (i % 3) * 0.6; c.beginPath(); const x0 = cx - cw * 0.4 + i * cw * 0.06; c.moveTo(x0, iy); c.bezierCurveTo(x0 + 8, iy - 14 - 8 * Math.sin(t + i), x0 - 8, iy - 26, x0 + 5 * Math.sin(t * 0.7 + i), iy - 44 * dn - 4); c.stroke(); }
        c.fillStyle = `rgba(255,255,255,${0.35 * dn})`; c.beginPath(); c.ellipse(cx, iy - 4, cw * 0.42, 7, 0, 0, TAU); c.fill();
        c.restore();
        glow(c, cx, iy - 8, cw * 0.4, `rgba(255,255,255,${0.18 * dn})`);
      }
      if (st.st < 4) { // 깔때기
        c.fillStyle = 'rgba(220,235,255,.25)'; c.strokeStyle = 'rgba(220,235,255,.85)'; c.lineWidth = 2.5;
        c.beginPath(); c.moveTo(fx - cw * 0.45, fy - 40); c.lineTo(fx + cw * 0.45, fy - 40); c.lineTo(fx + 6, fy + 6); c.lineTo(fx + 6, fy + 26); c.lineTo(fx - 6, fy + 26); c.lineTo(fx - 6, fy + 6); c.closePath(); c.fill(); c.stroke();
        c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.moveTo(fx - cw * 0.38, fy - 36); c.lineTo(fx + cw * 0.38, fy - 36); c.lineTo(fx, fy + 2); c.closePath(); c.fill();
        if (st.st === 2) { for (let i = 0; i < 3; i++) { const u = (t * 1.5 + i / 3) % 1; c.fillStyle = 'rgba(230,200,110,.9)'; c.beginPath(); c.ellipse(fx, fy + 28 + u * (ch * 0.6), 2.5, 4, 0, 0, TAU); c.fill(); } }
        txt(c, '거름종이', fx, fy - 48, DIM, '700 14px');
      }
      // 유리 막대
      const rodX = cx + Math.cos(st.ang0 || 0) * 4, rodTop = cy - ch - 40 - (st.st > 4 ? ch * 0.55 : 0);
      if (st.st >= 4) {
        c.strokeStyle = 'rgba(230,240,255,.9)'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(rodX, rodTop); c.lineTo(rodX, cy - ch * 0.38 + 6 - (st.st > 4 ? ch * 0.55 : 0)); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(rodX - 1.5, rodTop + 4); c.lineTo(rodX - 1.5, cy - ch * 0.4 - (st.st > 4 ? ch * 0.55 : 0)); c.stroke();
        // 감긴 DNA 뭉치: 감을수록 커지고, 다 감으면 막대째 들어 올린다
        if (st.wind > 0) {
          const wy = cy - ch * 0.38 - 6 - (st.st > 4 ? ch * 0.55 : 0), R = 10 + 18 * st.wind;
          glow(c, rodX, wy, R * 2.2, 'rgba(255,255,255,.25)');
          for (let i = 0; i < 26 * st.wind; i++) { c.strokeStyle = `rgba(255,255,255,${0.45 + 0.4 * Math.abs(Math.sin(i * 1.7))})`; c.lineWidth = 1.4 + (i % 3) * 0.5; c.beginPath(); c.ellipse(rodX + Math.sin(i * 2.3) * R * 0.25, wy + Math.cos(i * 1.3) * R * 0.45, R * (0.55 + 0.45 * Math.abs(Math.sin(i))), R * 0.3, Math.sin(i + t * 0.6) * 0.6, 0, TAU); c.stroke(); }
          if (st.st > 4) { for (let i = 0; i < 4; i++) { c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(rodX - 8 + i * 5, wy + R * 0.4); c.quadraticCurveTo(rodX - 10 + i * 6, wy + R + 10, rodX - 6 + i * 4 + Math.sin(t * 2 + i) * 3, wy + R + 22); c.stroke(); } pill(c, rodX + R + 10, wy, 'DNA 뭉치', 'rgba(255,255,255,.95)', INK, '800 15px', 'left'); }
        }
      }
      // 병들(세제·소금·에탄올) — 끌고 있는 것은 손 위치에
      const dpos = st.drag && st.drag.k !== 'bag' && st.drag.k !== 'rod' ? st.drag : null;
      const at = (k, x, y) => (dpos && dpos.k === k ? [dpos.x, dpos.y] : [x, y]);
      if (!st.det) { const [x, y] = at('det', ...g.det); bottle(c, x, y, 48, 96, '#3fbf6f', '세제', 0, '#2f8f52'); }
      if (!st.salt) { const [x, y] = at('salt', ...g.salt); bottle(c, x, y, 40, 70, '#f2f4f8', '소금', 0, '#9aa3b5'); }
      // 얼음 그릇 속 차가운 에탄올
      const icx = g.eth[0], icy = g.eth[1] - 8;
      c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(icx + 3, icy + 4, 70, 18, 0, 0, TAU); c.fill();
      const ig = c.createLinearGradient(0, icy - 30, 0, icy + 10); ig.addColorStop(0, '#7aa6d6'); ig.addColorStop(1, '#3d6496'); c.fillStyle = ig; c.beginPath(); c.moveTo(icx - 70, icy - 30); c.quadraticCurveTo(icx, icy + 30, icx + 70, icy - 30); c.closePath(); c.fill();
      for (let i = 0; i < 6; i++) { c.fillStyle = 'rgba(230,245,255,.85)'; c.beginPath(); c.roundRect(icx - 56 + i * 19, icy - 40 + (i % 2) * 6, 16, 14, 3); c.fill(); }
      if (st.eth < 1 || (st.drag && st.drag.k === 'eth')) {
        const pouring = st.drag && st.drag.k === 'eth' && this.over(st.drag, g);
        const [x, y] = st.drag && st.drag.k === 'eth' ? [st.drag.x, st.drag.y] : [icx, icy - 26];
        bottle(c, x, y, 40, 92, '#bfe3ff', '에탄올', pouring ? -1.9 : 0, '#5a8fd0');
        if (pouring) { c.strokeStyle = 'rgba(200,230,255,.8)'; c.lineWidth = 4; c.beginPath(); c.moveTo(x - 87, y + 30); c.quadraticCurveTo(cx - 10, y, cx - 6, cy - ch * 0.38 - lvl2); c.stroke(); }
      }
      txt(c, '차가운 에탄올(얼음 그릇)', icx, H - 10, DIM, '700 14px');
      // 진행 막대(으깨기)
      if (st.st === 0 && m > 0) { c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.roundRect(bx, by + bh + 18, bw, 12, 6); c.fill(); c.fillStyle = EL; c.beginPath(); c.roundRect(bx, by + bh + 18, bw * m, 12, 6); c.fill(); }
      // 거품 움직임
      st.bub.forEach((b) => { b.y -= dt * 16; b.r += dt * 0.5; }); st.bub = st.bub.filter((b) => b.y > by + bh * 0.35);
      if (st.st === 1 && (st.det || st.salt) && Math.random() < dt * 12) st.bub.push({ x: bx + 20 + Math.random() * (bw - 40), y: by + bh - 10, r: 2 + Math.random() * 3 });
      // 걸러 담기(저절로)
      if (st.st === 2) { st.filt += dt * 0.4; if (st.filt >= 1) { st.st = 3; api.say('거른 액을 컵에 받았다. 이제 <b>차가운 에탄올</b>을 컵 벽을 따라 가만히 붓자 — 에탄올은 위층에 뜬다.'); this.step(st, api); } }
      if (st.drag && st.drag.k === 'eth' && this.over(st.drag, g) && st.st === 3) {
        st.eth = Math.min(1, st.eth + dt * 0.4);
        if (st.eth > 0.3) api.say('두 층 경계에 <b>흰 실 같은 것</b>이 생긴다 — DNA가 에탄올에 녹지 않고 뭉쳐 보인다. 계속 붓자.');
        if (st.eth >= 1) { st.st = 4; st.drag = null; api.say('유리 막대를 경계에 넣었다. 막대 둘레를 <b>빙글빙글 돌려</b> 흰 실을 감아 올리자.'); this.step(st, api); }
      }
    },
    over: (d, g) => Math.abs(d.x - (g.cup[0] + 70)) < 80 && d.y < g.cup[1] - g.cup[3] + 30 && d.y > g.cup[1] - g.cup[3] - 160,
    hint(st, W, H) { const g = this.geo(W, H); return st.st === 0 ? [g.bag[0] + g.bag[2] * 0.3, g.bag[1] + g.bag[3] * 0.7, g.bag[2] * 0.4, 0] : st.st === 1 ? [g.det[0], g.det[1] - 50, g.bag[0] + g.bag[2] / 2 - g.det[0], -40] : st.st === 3 ? [g.eth[0], g.eth[1] - 70, g.cup[0] + 70 - g.eth[0], -(g.eth[1] - g.cup[1] + g.cup[3] + 30)] : st.st === 4 ? [g.cup[0] - 30, g.cup[1] - g.cup[3] * 0.5, 60, 0] : null; },
    down(st, p, api) {
      const g = this.geo(api.W, api.H), [bx, by, bw, bh] = g.bag;
      if (st.st === 0 && inR(p, bx, by, bw, bh)) { st.drag = { k: 'bag', x: p.x }; return; }
      if (st.st === 1 && !st.det && near(p, g.det[0], g.det[1] - 48, 50)) { st.drag = { k: 'det', x: p.x, y: p.y }; return; }
      if (st.st === 1 && !st.salt && near(p, g.salt[0], g.salt[1] - 35, 42)) { st.drag = { k: 'salt', x: p.x, y: p.y }; return; }
      if (st.st === 3 && near(p, g.eth[0], g.eth[1] - 70, 60)) { st.drag = { k: 'eth', x: p.x, y: p.y }; return; }
      if (st.st === 4 && near(p, g.cup[0], g.cup[1] - g.cup[3] * 0.5, 130)) { st.drag = { k: 'rod' }; st.ang = Math.atan2(p.y - (g.cup[1] - g.cup[3] * 0.5), p.x - g.cup[0]); }
    },
    move(st, p, held, api) {
      if (!held || !st.drag) return; const g = this.geo(api.W, api.H);
      if (st.drag.k === 'bag') {
        st.mash = Math.min(1, st.mash + Math.abs(p.x - st.drag.x) / 900); st.drag.x = p.x;
        api.say(st.mash < 1 ? `세포벽과 세포막이 부서지며 바나나가 으깨진다 — ${Math.round(st.mash * 100)}%` : '바나나가 곤죽이 되었다. 이제 <b>주방 세제</b>와 <b>소금</b>을 백에 넣자.');
        if (st.mash >= 1) { st.st = 1; st.drag = null; this.step(st, api); }
      } else if (st.drag.k === 'rod') {
        const a = Math.atan2(p.y - (g.cup[1] - g.cup[3] * 0.5), p.x - g.cup[0]); let d = a - st.ang; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; st.ang = a; st.ang0 = a;
        st.wind = Math.min(1, st.wind + Math.abs(d) / (TAU * 2.5));
        if (st.wind >= 1 && st.st === 4) { st.st = 5; api.say('막대에 <b>흰 실 뭉치</b>가 감겨 올라왔다 — 바나나 세포 속 DNA다. 맨눈에 보일 만큼 많은 DNA 가닥이 엉겨 붙은 것.'); this.step(st, api); }
      } else { st.drag.x = p.x; st.drag.y = p.y; }
    },
    up(st, p, api) {
      const d = st.drag; st.drag = null; if (!d) return; const g = this.geo(api.W, api.H), [bx, by, bw, bh] = g.bag;
      if ((d.k === 'det' || d.k === 'salt') && inR(p, bx - 30, by - 60, bw + 60, bh + 90)) this.add(st, api, d.k);
    },
    add(st, api, k) {
      st[k] = true;
      api.say(k === 'det' ? '<b>세제</b>가 세포막과 핵막(기름 성분)을 녹여 DNA가 밖으로 풀려 나온다.' : '<b>소금</b>은 풀려 나온 DNA 가닥이 서로 뭉치기 쉽게 돕는다.');
      if (st.det && st.salt) { st.st = 2; st.filt = 0; setTimeout(() => api.say('백을 기울여 <b>거름종이</b>로 걸러 컵에 받는다…'), 900); }
      this.step(st, api);
    },
    key(st, e, api) {
      if (e.key === ' ' || e.key === 'Enter') { this.act.next(st, api); return true; }
      return false;
    },
    act: {
      next(st, api) {
        if (st.st === 0) { st.mash = 1; st.st = 1; api.say('바나나가 곤죽이 되었다. 이제 <b>주방 세제</b>와 <b>소금</b>을 백에 넣자.'); }
        else if (st.st === 1) KINDS.extract.add(st, api, st.det ? 'salt' : 'det');
        else if (st.st === 2) st.filt = 1;
        else if (st.st === 3) { st.eth = 1; st.st = 4; api.say('유리 막대를 경계에 넣었다. 막대 둘레를 <b>빙글빙글 돌려</b> 흰 실을 감아 올리자.'); }
        else if (st.st === 4) { st.wind = 1; st.st = 5; api.say('막대에 <b>흰 실 뭉치</b>가 감겨 올라왔다 — 바나나 세포 속 DNA다.'); }
        KINDS.extract.step(st, api); return st.st;
      },
    },
  };

  // ─────────── 2. 현장 DNA와 맞는 사람 찾기(유전자 감식) ───────────
  const SCENE = 'GATCCATGTAGC';
  const SUS = [{ n: '가', s: 'GATCGATGTTGC' }, { n: '나', s: 'GATCCATGTAGC' }, { n: '다', s: 'CATCCAAGTAGG' }];
  KINDS.forensic = {
    first: '현장에서 찾은 머리카락 한 올의 DNA 염기 서열이다. <b>노란 띠</b>를 끌어 세 사람의 띠 위에 하나씩 대 보자.',
    steps: ['① 현장 띠를 끌어 한 사람의 띠에 대 보자', '② 세 사람 모두 대 보자', '③ 모두 맞는 사람의 «일치» 칸을 누르자'],
    done: '서열이 모두 같은 사람을 찾았다',
    init: () => ({ drag: null, tried: new Set(), cmp: -1, stamp: -1, flash: 0 }),
    geo(W, H) { const cw = Math.min(40, (W * 0.62) / 12 - 4); return { cw, sx: W * 0.33, sy: H * 0.17, rows: SUS.map((_, i) => H * (0.45 + i * 0.17)), x0: W * 0.33 }; },
    strip(c, x0, y, seq, cw, ref, glowOn) {
      for (let i = 0; i < seq.length; i++) {
        const x = x0 + i * (cw + 4) + cw / 2, ch = seq[i], same = ref ? ref[i] === ch : null;
        tile(c, x, y, cw, 36, COL[ch], ch, '800 16px');
        if (ref) { c.strokeStyle = same ? '#5cff9a' : '#ff6b6b'; c.lineWidth = 3; c.beginPath(); c.roundRect(x - cw / 2 - 2, y - 20, cw + 4, 40, 8); c.stroke(); if (glowOn && same) glow(c, x, y, 22, 'rgba(92,255,154,.25)'); }
      }
    },
    draw(c, W, H, st, t, dt, api) {
      const g = this.geo(W, H); bg(c, W, H, '#1a2a4a', '#0c1428');
      // 실험대 불빛 판
      c.fillStyle = 'rgba(255,255,255,.04)'; c.beginPath(); c.roundRect(W * 0.3, H * 0.34, W * 0.68, H * 0.6, 16); c.fill();
      // 왼쪽: 머리카락과 돋보기
      const hx = W * 0.14, hy = H * 0.24;
      c.fillStyle = 'rgba(255,255,255,.06)'; c.beginPath(); c.roundRect(W * 0.03, H * 0.1, W * 0.23, H * 0.27, 14); c.fill();
      c.strokeStyle = '#5a3a1a'; c.lineWidth = 3; c.beginPath(); c.moveTo(W * 0.05, hy + 30); c.bezierCurveTo(W * 0.1, hy - 20, W * 0.16, hy + 60, W * 0.24, hy + 4); c.stroke();
      const mx = hx + Math.sin(t * 0.8) * 20, my = hy + 10 + Math.cos(t * 0.8) * 8;
      c.save(); c.beginPath(); c.arc(mx, my, 34, 0, TAU); c.clip(); c.fillStyle = 'rgba(220,240,255,.15)'; c.fill();
      c.strokeStyle = '#3a2a1a'; c.lineWidth = 6; c.beginPath(); c.moveTo(W * 0.05, hy + 30); c.bezierCurveTo(W * 0.1, hy - 20, W * 0.16, hy + 60, W * 0.24, hy + 4); c.stroke();
      c.fillStyle = '#f2e6c8'; c.beginPath(); c.ellipse(W * 0.05 + 4, hy + 30, 6, 9, 0.6, 0, TAU); c.fill(); c.restore();
      c.strokeStyle = '#c9ccd4'; c.lineWidth = 5; c.beginPath(); c.arc(mx, my, 34, 0, TAU); c.stroke(); c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(mx + 24, my + 24); c.lineTo(mx + 46, my + 46); c.stroke(); c.lineCap = 'butt';
      txt(c, '현장의 머리카락', W * 0.145, H * 0.155, DIM, '700 16px');
      txt(c, 'DNA를 꺼내 서열을 읽었다 →', W * 0.145, H * 0.355, DIM, '600 14px');
      // 현장 띠
      const dragging = st.drag, sx = dragging ? dragging.x : g.sx, sy = dragging ? dragging.y : g.sy;
      c.save(); if (!dragging) { glow(c, sx + 6 * (g.cw + 4), sy, 200, `rgba(255,216,77,${0.10 + 0.05 * Math.sin(t * 3)})`); }
      c.fillStyle = 'rgba(255,216,77,.22)'; c.beginPath(); c.roundRect(sx - 10, sy - 28, 12 * (g.cw + 4) + 16, 56, 12); c.fill();
      c.strokeStyle = EL; c.lineWidth = 2.5; c.stroke(); this.strip(c, sx, sy, SCENE, g.cw, null); c.restore();
      txt(c, '현장 DNA', sx + 12 * (g.cw + 4) + 14, sy + 6, EL, '800 16px', 'left');
      // 세 사람 띠
      SUS.forEach((q, i) => {
        const y = g.rows[i], on = st.cmp === i;
        c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.roundRect(W * 0.04, y - 30, W * 0.24, 60, 12); c.fill();
        // 사람 실루엣
        const px = W * 0.08; c.fillStyle = ['#8fb3e8', '#e8a98f', '#a8e08f'][i]; c.beginPath(); c.arc(px, y - 8, 11, 0, TAU); c.fill(); c.beginPath(); c.roundRect(px - 16, y + 4, 32, 18, 9); c.fill();
        txt(c, `(${q.n}) 사람`, W * 0.12, y + 6, '#fbfcf9', '800 18px', 'left');
        this.strip(c, g.x0, y, q.s, g.cw, on ? SCENE : null, on);
        if (st.tried.has(i)) {
          const same = [...q.s].filter((ch, k) => ch === SCENE[k]).length;
          txt(c, `${same} / 12 같음`, g.x0 + 12 * (g.cw + 4) + 8, y - 4, same === 12 ? '#8de0a3' : DIM, '800 15px', 'left');
          const bx = g.x0 + 12 * (g.cw + 4) + 8, by = y + 6; c.fillStyle = st.stamp === i ? '#2e9e5b' : 'rgba(255,255,255,.12)'; c.beginPath(); c.roundRect(bx, by, 64, 22, 6); c.fill(); txt(c, st.stamp === i ? '일치 ✓' : '일치?', bx + 32, by + 16, '#fbfcf9', '800 13px');
        }
      });
      if (st.flash > 0) st.flash -= dt;
    },
    hint(st, W, H) { const g = this.geo(W, H); return st.tried.size < 3 ? [g.sx + 40, g.sy + 30, 0, g.rows[[0, 1, 2].find((i) => !st.tried.has(i))] - g.sy] : st.stamp < 0 ? [g.x0 + 12 * (g.cw + 4) + 40, g.rows[1] + 22, 0, 0] : null; },
    down(st, p, api) {
      const g = this.geo(api.W, api.H);
      if (inR(p, g.sx - 10, g.sy - 28, 12 * (g.cw + 4) + 16, 56)) { st.drag = { x: g.sx, y: g.sy, ox: p.x - g.sx, oy: p.y - g.sy }; return; }
      SUS.forEach((q, i) => { const bx = g.x0 + 12 * (g.cw + 4) + 8, by = g.rows[i] + 6; if (st.tried.has(i) && inR(p, bx, by, 64, 22)) this.stampIt(st, api, i); });
    },
    move(st, p, held) { if (held && st.drag) { st.drag.x = p.x - st.drag.ox; st.drag.y = p.y - st.drag.oy; } },
    up(st, p, api) {
      if (!st.drag) return; const g = this.geo(api.W, api.H), d = st.drag; st.drag = null;
      const i = g.rows.findIndex((y) => Math.abs(d.y - y) < 40);
      if (i >= 0) this.cmpIt(st, api, i);
    },
    cmpIt(st, api, i) {
      st.cmp = i; st.tried.add(i); const q = SUS[i], same = [...q.s].filter((ch, k) => ch === SCENE[k]).length;
      api.say(same === 12 ? `(${q.n}) 사람: 열두 글자가 <b>모두 같다</b>. 다른 두 사람도 확인했나?` : `(${q.n}) 사람: 12글자 중 <b>${12 - same}글자</b>가 다르다(빨간 테). 염기 서열은 사람마다 다르다.`);
      api.ok(1, true); api.ok(2, st.tried.size === 3);
    },
    stampIt(st, api, i) {
      if (st.tried.size < 3) { api.say('먼저 세 사람 모두와 대 보고 고르자.'); return; }
      if (SUS[i].s !== SCENE) { api.say(`(${SUS[i].n}) 사람은 다른 글자가 있다 — 한 글자라도 다르면 같은 사람의 DNA가 아니다.`); return; }
      st.stamp = i; api.ok(3, true);
      api.say('(나) 사람과 <b>서열이 모두 같다</b>. 사람마다 염기 서열이 조금씩 달라 DNA로 사람을 가려낼 수 있다(<b>유전자 감식</b>). 실제로는 여러 곳의 서열을 함께 비교한다.');
    },
    key(st, e, api) { const i = '123'.indexOf(e.key); if (i >= 0) { this.cmpIt(st, api, i); return true; } if (e.key === 'Enter' && st.tried.size === 3) { this.stampIt(st, api, 1); return true; } return false; },
    act: { cmp: (st, api, i) => KINDS.forensic.cmpIt(st, api, i), stamp: (st, api, i) => KINDS.forensic.stampIt(st, api, i) },
  };

  // ─────────── 3. DNA 지퍼 열기(수소 결합 수) ───────────
  const ZIP = 'ATTAATGCGCGG';
  KINDS.unzip = {
    first: 'DNA 두 가닥이 수소 결합으로 붙어 있다. 위쪽 <b>노란 손잡이</b>를 아래로 끌어 지퍼처럼 열어 보자.',
    steps: ['① 손잡이를 아래로 끌어 A–T 구간을 연다', '② G–C 구간까지 계속 연다', '③ 끝까지 열고 끊은 결합 수를 세자'],
    done: '끝까지 열었다 — G–C 쪽이 더 버텼다',
    init: () => ({ open: 0, pull: 0, drag: null, sparks: [], last: 0 }),
    geo(W, H) { const n = ZIP.length, top = H * 0.12, step = (H * 0.8) / n; return { n, top, step, cx: W * 0.36, gap: 120 }; },
    bonds: (k) => (k === 'A' || k === 'T' ? 2 : 3),
    draw(c, W, H, st, t, dt, api) {
      const g = this.geo(W, H); bg(c, W, H);
      const k = st.open * g.n; // 열린 쌍 수(소수)
      for (let i = 0; i < g.n; i++) {
        const y = g.top + (i + 0.5) * g.step, op = clamp(k - i, 0, 1), sp = ease(op) * (60 + i * 0) + (op > 0 && op < 1 ? Math.sin(t * 30) * 1.5 : 0);
        const lx = g.cx - g.gap / 2 - sp, rx = g.cx + g.gap / 2 + sp, wob = Math.sin(t * 1.4 + i * 0.6) * 1.5;
        // 골격
        const lx2 = g.cx - g.gap / 2 - ease(clamp(k - i - 1, 0, 1)) * 60, rx2 = g.cx + g.gap / 2 + ease(clamp(k - i - 1, 0, 1)) * 60;
        if (i < g.n - 1) { [[lx, lx2], [rx, rx2]].forEach(([a, b]) => { c.strokeStyle = '#7b5fc0'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(a + wob, y); c.lineTo(b + wob, y + g.step); c.stroke(); c.strokeStyle = '#b9a2f0'; c.lineWidth = 3; c.stroke(); }); }
        ball(c, lx + wob - 10, y + g.step * 0.5, 6, COL.P); ball(c, rx + wob + 10, y + g.step * 0.5, 6, COL.P);
        ball(c, lx + wob, y, 9, COL.S); ball(c, rx + wob, y, 9, COL.S);
        const L = ZIP[i], R = MATE[L], bl = g.gap / 2 - 16;
        tile(c, lx + wob + 10 + bl / 2, y, bl, 24, COL[L], L, '800 14px'); tile(c, rx + wob - 10 - bl / 2, y, bl, 24, COL[R], R, '800 14px');
        if (op < 1) { c.save(); c.globalAlpha = 1 - op; c.strokeStyle = '#e8f6ff'; c.lineWidth = 2; c.setLineDash([3, 3]); c.shadowColor = '#7fd1ff'; c.shadowBlur = 8; const nb = this.bonds(L); for (let b = 0; b < nb; b++) { const o = (b - (nb - 1) / 2) * 6; c.beginPath(); c.moveTo(g.cx - 8, y + o); c.lineTo(g.cx + 8, y + o); c.stroke(); } c.restore(); }
      }
      // 손잡이(지퍼 머리): 열린 곳 바로 아래
      const zy = g.top + Math.min(k, g.n) * g.step;
      c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.roundRect(g.cx - 22, zy - 8, 48, 30, 8); c.fill();
      const zg = c.createLinearGradient(0, zy - 10, 0, zy + 20); zg.addColorStop(0, '#ffe98a'); zg.addColorStop(1, '#d9a91a'); c.fillStyle = zg; c.beginPath(); c.roundRect(g.cx - 24, zy - 10, 48, 30, 8); c.fill(); c.strokeStyle = '#8a6a10'; c.lineWidth = 2; c.stroke();
      c.fillStyle = '#8a6a10'; c.beginPath(); c.roundRect(g.cx - 6, zy + 20, 12, 22, 5); c.fill();
      // 불꽃
      st.sparks.forEach((s) => { s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt; c.fillStyle = `rgba(160,220,255,${clamp(s.life * 2, 0, 1)})`; c.beginPath(); c.arc(s.x, s.y, 2.5, 0, TAU); c.fill(); }); st.sparks = st.sparks.filter((s) => s.life > 0);
      // 오른쪽 계기판: 지금 당기는 힘 + 끊은 결합
      const px = W * 0.66, pw = W * 0.3, cur = Math.min(g.n - 1, Math.floor(k)), need = this.bonds(ZIP[cur]);
      c.fillStyle = 'rgba(255,255,255,.06)'; c.beginPath(); c.roundRect(px, H * 0.1, pw, H * 0.8, 14); c.fill();
      txt(c, '당기는 힘', px + pw / 2, H * 0.17, DIM, '800 18px');
      const fw = pw - 40, fy = H * 0.22, pulled = st.drag ? clamp(st.pull, 0, 1.2) : 0;
      c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.roundRect(px + 20, fy, fw, 24, 12); c.fill();
      const fg = c.createLinearGradient(px + 20, 0, px + 20 + fw, 0); fg.addColorStop(0, '#5cc77a'); fg.addColorStop(0.6, EL); fg.addColorStop(1, '#e4572e');
      c.fillStyle = fg; c.beginPath(); c.roundRect(px + 20, fy, fw * clamp(pulled / 1.2, 0, 1), 24, 12); c.fill();
      txt(c, k >= g.n ? '다 열렸다' : `지금 떼는 짝 ${ZIP[cur]}–${MATE[ZIP[cur]]} · 수소 결합 ${need}개`, px + pw / 2, fy + 52, k >= g.n ? '#8de0a3' : '#fbfcf9', '700 16px');
      let at = 0, gc = 0, hbn = 0; for (let i = 0; i < Math.min(g.n, Math.floor(k + 1e-6)); i++) { if ('AT'.includes(ZIP[i])) at++; else gc++; hbn += this.bonds(ZIP[i]); }
      [['A–T 쌍', at, '× 2개'], ['G–C 쌍', gc, '× 3개']].forEach(([n, v, b], j) => { const y = H * (0.42 + j * 0.12); tile(c, px + 50, y, 70, 34, j ? COL.G : COL.A, n, '800 14px'); txt(c, `${v}쌍 ${b}`, px + 100, y + 6, '#fbfcf9', '700 18px', 'left'); });
      c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(px + 20, H * 0.63, fw, 2);
      txt(c, `끊은 수소 결합 ${hbn}개`, px + pw / 2, H * 0.7, EL, '800 22px');
      // 힘 그래프(쌍마다 필요한 힘 막대)
      for (let i = 0; i < g.n; i++) { const b = this.bonds(ZIP[i]), x = px + 24 + i * (fw - 8) / g.n, h = b * 14; c.fillStyle = i < k ? (b === 3 ? COL.G : COL.A) : 'rgba(255,255,255,.18)'; c.fillRect(x, H * 0.86 - h, (fw - 8) / g.n - 3, h); }
      txt(c, '쌍마다 끊을 결합 수', px + pw / 2, H * 0.86 + 20, DIM, '600 13px');
    },
    hint(st, W, H) { const g = this.geo(W, H); return st.open < 1 ? [g.cx, g.top + st.open * g.n * g.step + 30, 0, 90] : null; },
    down(st, p, api) { const g = this.geo(api.W, api.H), zy = g.top + st.open * g.n * g.step; if (Math.abs(p.x - g.cx) < 70 && Math.abs(p.y - zy) < 60) st.drag = { y: p.y }; },
    move(st, p, held, api) {
      if (!held || !st.drag) return; const g = this.geo(api.W, api.H), dy = p.y - st.drag.y; st.drag.y = p.y; if (dy <= 0) { st.pull = 0; return; }
      const cur = Math.min(g.n - 1, Math.floor(st.open * g.n)), need = this.bonds(ZIP[cur]);
      // G–C(3개)는 같은 거리를 끌어도 덜 열린다 — 더 세게(오래) 당겨야 한다
      const before = st.open; st.open = Math.min(1, st.open + dy / (g.step * g.n) * (need === 2 ? 1 : 0.55)); st.pull = need === 2 ? 0.55 : 1.05;
      if (Math.floor(st.open * g.n) > Math.floor(before * g.n)) { const y = g.top + Math.floor(st.open * g.n) * g.step; for (let s = 0; s < 6; s++) st.sparks.push({ x: g.cx, y, vx: (Math.random() - 0.5) * 160, vy: (Math.random() - 0.5) * 120, life: 0.6 }); }
      this.sync(st, api);
    },
    up(st) { st.drag = null; st.pull = 0; },
    sync(st, api) {
      const n = ZIP.length, k = st.open * n, at = ZIP.indexOf('G');
      api.ok(1, k >= at); api.ok(2, k >= n - 1); api.ok(3, st.open >= 1);
      api.say(st.open >= 1 ? 'A–T 여섯 쌍은 결합 <b>2개</b>씩, G–C 여섯 쌍은 <b>3개</b>씩 끊었다. 같은 길이라도 <b>G–C가 많을수록</b> 두 가닥이 더 단단히 붙어 있다.'
        : k < at ? 'A–T 짝은 수소 결합 <b>2개</b> — 비교적 쉽게 떨어진다.' : 'G–C 짝은 수소 결합 <b>3개</b> — 같은 거리를 끌어도 덜 열린다. 더 끌자.');
    },
    key(st, e, api) { if (e.key === 'ArrowDown') { st.open = Math.min(1, st.open + 1 / ZIP.length); this.sync(st, api); return true; } return false; },
    act: { open: (st, api, v) => { st.open = clamp(v, 0, 1); KINDS.unzip.sync(st, api); return st.open; } },
  };

  // ─────────── 4. 상처 난 가닥 되살리기 ───────────
  const RP = 'TGCATTGACG';
  KINDS.repair = {
    first: '두 가닥 DNA다. 위 가닥 위로 <b>지우개</b>를 문질러 염기 몇 개를 망가뜨려 보자.',
    steps: ['① 지우개로 위 가닥 염기 셋 이상을 지운다', '② 아래 받침의 염기를 끌어 빈자리를 채운다', '③ 모든 빈자리를 맞는 염기로 되살린다'],
    done: '맞은편 가닥 덕분에 서열을 되살렸다',
    init: () => ({ gone: new Set(), drag: null, er: null, miss: 0, bounce: null }),
    geo(W, H) { const n = RP.length, cw = Math.min(64, (W * 0.84) / n), x0 = W / 2 - cw * (n - 1) / 2; return { n, cw, x0, yT: H * 0.34, yB: H * 0.6, trayY: H * 0.86, er: [W * 0.1, H * 0.14] }; },
    draw(c, W, H, st, t, dt, api) {
      const g = this.geo(W, H); bg(c, W, H);
      c.strokeStyle = '#b9a2f0'; c.lineWidth = 6; c.lineCap = 'round';
      [g.yT - 34, g.yB + 34].forEach((y) => { c.beginPath(); c.moveTo(g.x0 - g.cw * 0.6, y); c.lineTo(g.x0 + g.cw * (g.n - 0.4), y); c.stroke(); });
      for (let i = 0; i < g.n; i++) {
        const x = g.x0 + i * g.cw, top = RP[i], bot = MATE[top], gone = st.gone.has(i), wob = Math.sin(t * 1.5 + i * 0.6) * 1.2;
        ball(c, x - g.cw / 2, g.yT - 34, 6, COL.P); ball(c, x - g.cw / 2, g.yB + 34, 6, COL.P); ball(c, x, g.yT - 34, 9, COL.S); ball(c, x, g.yB + 34, 9, COL.S);
        const mid = (g.yT + g.yB) / 2, h1 = mid - 8 - (g.yT - 24), c1 = (g.yT - 24 + mid - 8) / 2, c2 = (mid + 8 + g.yB + 24) / 2;
        if (gone) { c.strokeStyle = 'rgba(255,120,120,.8)'; c.setLineDash([5, 5]); c.lineWidth = 2; c.strokeRect(x - g.cw * 0.36, c1 - h1 / 2, g.cw * 0.72, h1); c.setLineDash([]); txt(c, '?', x, c1 + 8, '#ff9a9a', '800 24px'); }
        else tile(c, x, c1 + wob, g.cw * 0.72, h1, COL[top], top, '800 22px');
        tile(c, x, c2 + wob, g.cw * 0.72, h1, COL[bot], bot, '800 22px');
        if (!gone) { c.save(); c.strokeStyle = '#e8f6ff'; c.lineWidth = 1.8; c.setLineDash([3, 3]); c.shadowColor = '#7fd1ff'; c.shadowBlur = 6; const nb = 'AT'.includes(top) ? 2 : 3; for (let b = 0; b < nb; b++) { const o = (b - (nb - 1) / 2) * 7; c.beginPath(); c.moveTo(x + o, mid - 9); c.lineTo(x + o, mid + 9); c.stroke(); } c.restore(); }
      }
      txt(c, '위 가닥', g.x0 - g.cw * 0.6, g.yT - 52, DIM, '700 15px', 'left'); txt(c, '맞은편 가닥(그대로)', g.x0 - g.cw * 0.6, g.yB + 66, DIM, '700 15px', 'left');
      // 지우개(자외선·화학 물질에 상한 것을 나타냄)
      const [ex, ey] = st.er ? [st.er.x, st.er.y] : g.er;
      c.save(); c.translate(ex, ey); c.rotate(-0.3);
      c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.roundRect(-30 + 3, -16 + 4, 60, 32, 6); c.fill();
      c.fillStyle = '#f28bb5'; c.beginPath(); c.roundRect(-30, -16, 34, 32, 6); c.fill(); c.fillStyle = '#5aa9f0'; c.beginPath(); c.roundRect(2, -16, 28, 32, 6); c.fill();
      c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-26, -12, 52, 5); c.restore();
      txt(c, '지우개(상처)', g.er[0], g.er[1] + 36, DIM, '600 13px');
      // 받침: 염기 넷
      c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(0, g.trayY - 34, W, H - g.trayY + 34);
      'ATGC'.split('').forEach((k, i) => { const x = W * (0.3 + i * 0.13); if (!(st.drag && st.drag.k === k)) tile(c, x, g.trayY, 56, 40, COL[k], k, '800 20px'); });
      txt(c, '염기를 끌어 빈자리에', W * 0.12, g.trayY + 6, DIM, '700 15px');
      if (st.drag && st.drag.k) tile(c, st.drag.x, st.drag.y, 56, 40, COL[st.drag.k], st.drag.k, '800 20px');
      if (st.bounce) { st.bounce.t -= dt; const b = st.bounce; tile(c, lerp(b.tx, b.x, b.t / 0.4), lerp(b.ty, b.y, b.t / 0.4), 56, 40, COL[b.k], b.k, '800 20px', 0.8); if (b.t <= 0) st.bounce = null; }
    },
    hint(st, W, H) { const g = this.geo(W, H); if (st.gone.size < 3) return [g.er[0], g.er[1] + 10, g.x0 + g.cw * 4 - g.er[0], g.yT - g.er[1] - 10]; const i = [...st.gone][0]; if (i == null) return null; const k = RP[i]; return [W * (0.3 + 'ATGC'.indexOf(k) * 0.13), g.trayY, g.x0 + i * g.cw - W * (0.3 + 'ATGC'.indexOf(k) * 0.13), g.yT - g.trayY]; },
    down(st, p, api) {
      const g = this.geo(api.W, api.H);
      if (near(p, g.er[0], g.er[1], 44)) { st.er = { x: p.x, y: p.y }; st.erasing = true; return; }
      const i = 'ATGC'.split('').findIndex((_, j) => near(p, api.W * (0.3 + j * 0.13), g.trayY, 32));
      if (i >= 0) st.drag = { k: 'ATGC'[i], x: p.x, y: p.y };
    },
    move(st, p, held, api) {
      if (!held) return; const g = this.geo(api.W, api.H);
      if (st.erasing) {
        st.er = { x: p.x, y: p.y };
        if (p.y > g.yT - 40 && p.y < (g.yT + g.yB) / 2) { const i = Math.round((p.x - g.x0) / g.cw); if (i >= 0 && i < g.n && !st.gone.has(i) && st.gone.size < 5) { st.gone.add(i); this.sync(st, api); } }
      } else if (st.drag) { st.drag.x = p.x; st.drag.y = p.y; }
    },
    up(st, p, api) {
      if (st.erasing) { st.erasing = false; st.er = null; return; }
      const d = st.drag; st.drag = null; if (!d) return; const g = this.geo(api.W, api.H);
      const i = Math.round((p.x - g.x0) / g.cw);
      if (p.y > g.yT - 70 && p.y < (g.yT + g.yB) / 2 + 10 && i >= 0 && i < g.n && st.gone.has(i)) this.fill(st, api, i, d.k, p);
    },
    fill(st, api, i, k, p) {
      if (RP[i] !== k) { st.miss++; const g = this.geo(api.W, api.H); st.bounce = { k, x: p ? p.x : g.x0 + i * g.cw, y: p ? p.y : g.yT, tx: api.W * (0.3 + 'ATGC'.indexOf(k) * 0.13), ty: g.trayY, t: 0.4 }; api.say(`맞은편이 <b>${MATE[RP[i]]}</b>이니 ${k}는 짝이 맞지 않는다 — 튕겨 나갔다.`); return false; }
      st.gone.delete(i); st.filled = true; api.say(`맞은편 <b>${MATE[k]}</b>의 짝인 <b>${k}</b>로 채웠다.`); this.sync(st, api); return true;
    },
    sync(st, api) {
      if (st.gone.size >= 3 && !st.cut) { st.cut = true; api.ok(1, true); api.say('위 가닥의 염기가 지워졌다. <b>맞은편 가닥</b>을 보면 무엇이 있었는지 알 수 있을까? 받침에서 염기를 끌어 채우자.'); return; }
      if (!st.cut) { api.say(`지운 염기 ${st.gone.size}개 — 셋 이상 지워 보자.`); return; }
      if (st.filled) api.ok(2, true);
      if (st.gone.size === 0) { api.ok(2, true); api.ok(3, true); api.say(`모두 되살렸다(틀린 시도 ${st.miss}번). 한 가닥이 상해도 <b>짝 규칙</b>으로 맞은편 가닥에서 서열을 다시 알 수 있다 — 두 가닥이 서로의 <b>예비 사본</b> 노릇을 해 유전 정보가 안정하게 지켜진다.`); }
    },
    key(st, e, api) {
      if (e.key === 'x' || e.key === 'X') { const i = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].find((j) => !st.gone.has(j)); if (i != null && st.gone.size < 5) st.gone.add(i * 3 % 10); this.sync(st, api); return true; }
      const k = e.key.toUpperCase(); if ('ATGC'.includes(k) && e.key.length === 1 && st.gone.size) { const i = [...st.gone][0]; this.fill(st, api, i, k); return true; }
      return false;
    },
    act: { cut: (st, api, arr) => { arr.forEach((i) => st.gone.add(i)); KINDS.repair.sync(st, api); return [...st.gone]; }, fill: (st, api, i, k) => KINDS.repair.fill(st, api, i, k) },
  };

  // ─────────── 5. 전선 껍질 벗겨 보기 ───────────
  KINDS.wire = {
    first: '쓰지 않는 전기 기구의 전선이다. <b>벗기개</b>를 왼쪽으로 끌어 오른쪽 끝의 바깥 껍질을 벗겨 보자.',
    steps: ['① 벗기개를 왼쪽으로 끌어 껍질을 벗긴다', '② 검사봉을 고무 껍질과 구리에 각각 대 본다', '③ 구리 끝을 끌어 다른 가닥에 맞닿게 해 본다'],
    done: '껍질(부도체)이 구리(도체)를 감싸는 까닭을 알았다',
    init: () => ({ strip: 0, drag: null, probe: null, touched: new Set(), lit: 0, short: 0, meet: 0 }),
    geo(W, H) { const y = H * 0.66; return { y, ty: H * 0.5, x0: W * 0.14, x1: W * 0.7, cut: W * 0.47, ex: W * 0.8, probe: [W * 0.3, H * 0.9], tester: [W * 0.9, H * 0.86] }; },
    ends(st, g) { const m = st.meet; return [g.y - 26 * (1 - m), g.y + 26 * (1 - m)]; },
    draw(c, W, H, st, t, dt, api) {
      const g = this.geo(W, H);
      // 벽: 공구판(구멍 판)과 걸린 공구
      const wg = c.createLinearGradient(0, 0, 0, g.ty); wg.addColorStop(0, '#3a4766'); wg.addColorStop(1, '#262f48'); c.fillStyle = wg; c.fillRect(0, 0, W, g.ty);
      const bx = W * 0.5, by = H * 0.08, bw = W * 0.44, bh = H * 0.34;
      c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(bx + 5, by + 6, bw, bh); c.fillStyle = '#b08a5a'; c.fillRect(bx, by, bw, bh);
      c.fillStyle = 'rgba(60,40,20,.55)'; for (let i = 0; i < 14; i++) for (let j = 0; j < 7; j++) { c.beginPath(); c.arc(bx + 16 + i * (bw - 32) / 13, by + 14 + j * (bh - 28) / 6, 2.2, 0, TAU); c.fill(); }
      // 펜치
      c.save(); c.translate(bx + bw * 0.22, by + bh * 0.2); c.rotate(0.1); c.fillStyle = '#c9ccd4'; c.beginPath(); c.moveTo(-6, 0); c.lineTo(6, 0); c.lineTo(4, 40); c.lineTo(-4, 40); c.fill();
      c.fillStyle = '#e4572e'; c.beginPath(); c.moveTo(-5, 40); c.quadraticCurveTo(-22, 80, -16, 110); c.lineTo(-8, 110); c.quadraticCurveTo(-12, 80, 0, 44); c.fill(); c.beginPath(); c.moveTo(5, 40); c.quadraticCurveTo(22, 80, 16, 110); c.lineTo(8, 110); c.quadraticCurveTo(12, 80, 0, 44); c.fill(); c.restore();
      // 드라이버
      c.save(); c.translate(bx + bw * 0.5, by + bh * 0.15); c.fillStyle = '#f2c230'; c.beginPath(); c.roundRect(-9, 0, 18, 50, 7); c.fill(); c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(-2, 6, 4, 38); c.fillStyle = '#c9ccd4'; c.fillRect(-2.5, 50, 5, 56); c.restore();
      // 절연 장갑
      c.save(); c.translate(bx + bw * 0.78, by + bh * 0.22); c.fillStyle = '#e8a33a'; c.beginPath(); c.roundRect(-22, 20, 44, 60, 12); c.fill(); [-16, -6, 4, 14].forEach((dx, i) => { c.beginPath(); c.roundRect(dx - 4, 0 - (i === 1 || i === 2 ? 6 : 0), 9, 30, 4.5); c.fill(); }); c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(-22, 66, 44, 6); c.restore();
      txt(c, '절연 장갑', bx + bw * 0.78, by + bh - 8, '#3a2a14', '700 13px');
      table(c, W, H, g.ty);
      const sx = lerp(g.x1, g.cut, st.strip), sh = 40, [yR, yK] = this.ends(st, g);
      // 플러그(왼쪽 끝) + 검사기 집게선
      const px = g.x0; c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.roundRect(px - 64 + 3, g.y - 26 + 5, 64, 52, 10); c.fill();
      const pg = c.createLinearGradient(0, g.y - 26, 0, g.y + 26); pg.addColorStop(0, '#f2f0e6'); pg.addColorStop(1, '#a9a596'); c.fillStyle = pg; c.beginPath(); c.roundRect(px - 64, g.y - 26, 64, 52, 10); c.fill();
      c.fillStyle = '#d4d8e0'; c.fillRect(px - 96, g.y - 14, 34, 7); c.fillRect(px - 96, g.y + 7, 34, 7);
      txt(c, '플러그', px - 40, g.y + 50, DIM, '700 14px');
      // 바깥 껍질(회색 고무)
      c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.roundRect(px + 3, g.y - sh / 2 + 7, sx - px, sh, sh / 2); c.fill();
      const og = c.createLinearGradient(0, g.y - sh / 2, 0, g.y + sh / 2); og.addColorStop(0, '#a9b0bf'); og.addColorStop(0.45, '#69718a'); og.addColorStop(1, '#353a4a');
      c.fillStyle = og; c.beginPath(); c.roundRect(px - 4, g.y - sh / 2, sx - px + 4, sh, sh / 2); c.fill();
      c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(px + 10, g.y - sh / 2 + 6, sx - px - 30, 4);
      // 속 전선 두 가닥: 벗긴 만큼 드러나 부채꼴로 벌어지고, 끝 2 cm쯤은 구리
      if (st.strip > 0.02) {
        [['#d64545', yR], ['#2a2d36', yK]].forEach(([col, ye], j) => {
          const y0 = g.y + (j ? 7 : -7), cx2 = g.ex - 34;
          const cg = c.createLinearGradient(0, ye - 8, 0, ye + 8); cg.addColorStop(0, shade(col, 0.4)); cg.addColorStop(1, shade(col, -0.35));
          c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 16; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx - 6, y0 + 5); c.quadraticCurveTo((sx + cx2) / 2, y0 + 5, cx2, ye + 5); c.stroke();
          c.strokeStyle = cg; c.lineWidth = 14; c.beginPath(); c.moveTo(sx - 6, y0); c.quadraticCurveTo((sx + cx2) / 2, y0, cx2, ye); c.stroke();
          for (let k = -2; k <= 2; k++) { const yy = ye + k * 2.2, ccg = c.createLinearGradient(0, yy - 2, 0, yy + 2); ccg.addColorStop(0, '#ffd8a8'); ccg.addColorStop(1, '#b0632a'); c.strokeStyle = ccg; c.lineWidth = 2.4; c.beginPath(); c.moveTo(cx2, yy); c.lineTo(g.ex + 6, yy + k * 1.2); c.stroke(); }
        });
        if (st.strip > 0.4) { txt(c, '속 전선 피복', (sx + g.ex) / 2 - 10, yR - 22, DIM, '700 14px'); txt(c, '구리 선', g.ex + 14, g.y + 6, '#ffcf9a', '800 15px', 'left'); }
      }
      if (st.short > 0) { st.short -= dt; for (let i = 0; i < 10; i++) { const a = Math.random() * TAU, r = 6 + Math.random() * 26; c.strokeStyle = `rgba(255,${200 + Math.random() * 55 | 0},120,.95)`; c.lineWidth = 2; c.beginPath(); c.moveTo(g.ex, g.y); c.lineTo(g.ex + Math.cos(a) * r, g.y + Math.sin(a) * r); c.stroke(); } glow(c, g.ex, g.y, 60, 'rgba(255,230,140,.65)'); }
      // 벗겨 낸 껍질 조각
      if (st.strip > 0.05) { c.save(); c.translate(g.cut + 30, H * 0.86); c.rotate(-0.08); const L = (g.x1 - sx) * 0.75; c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.roundRect(3, 5, L, 30, 15); c.fill(); c.fillStyle = og; c.beginPath(); c.roundRect(0, 0, L, 30, 15); c.fill(); c.fillStyle = '#2a2d36'; c.beginPath(); c.ellipse(L - 4, 15, 6, 13, 0, 0, TAU); c.fill(); c.restore(); txt(c, '벗긴 껍질', g.cut + 60, H * 0.86 + 52, DIM, '700 13px'); }
      // 벗기개
      if (st.strip < 1) {
        const kx = st.drag && st.drag.k === 'strip' ? st.drag.x : sx;
        c.save(); c.translate(kx, g.y);
        c.fillStyle = '#c9ccd4'; c.fillRect(-5, -sh / 2 - 6, 10, sh + 12);
        const hg = c.createLinearGradient(-14, 0, 14, 0); hg.addColorStop(0, '#ff7a5a'); hg.addColorStop(1, '#b8341f');
        c.fillStyle = hg; c.beginPath(); c.roundRect(-14, -sh / 2 - 72, 28, 66, 10); c.fill(); c.beginPath(); c.roundRect(-14, sh / 2 + 6, 28, 66, 10); c.fill();
        c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(-9, -sh / 2 - 66, 4, 54); c.restore();
        txt(c, '벗기개', kx, g.y - sh / 2 - 84, DIM, '700 15px');
      }
      txt(c, '바깥 껍질: 고무·플라스틱', (px + Math.max(sx, px + 200)) / 2, g.y - sh / 2 - 12, DIM, '700 15px');
      // 검사기: 건전지 + 발광 다이오드, 집게선은 플러그 날에, 검사봉은 손으로
      const [tx, ty] = g.tester, on = st.lit > 0.05;
      c.strokeStyle = '#c0392b'; c.lineWidth = 3; c.beginPath(); c.moveTo(tx - 50, ty - 20); c.bezierCurveTo(tx - 200, ty - 120, px - 140, g.y + 120, px - 90, g.y + 10); c.stroke();
      c.fillStyle = '#c0392b'; c.beginPath(); c.roundRect(px - 104, g.y + 2, 18, 12, 3); c.fill();
      c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.roundRect(tx - 56 + 3, ty - 46 + 4, 112, 92, 12); c.fill();
      const tg = c.createLinearGradient(0, ty - 46, 0, ty + 46); tg.addColorStop(0, '#f2f0e6'); tg.addColorStop(1, '#b9b5a8'); c.fillStyle = tg; c.beginPath(); c.roundRect(tx - 56, ty - 46, 112, 92, 12); c.fill();
      c.fillStyle = '#2a2d36'; c.beginPath(); c.roundRect(tx - 40, ty + 4, 70, 24, 5); c.fill(); c.fillStyle = '#f2c230'; c.fillRect(tx - 40, ty + 4, 22, 24); c.fillStyle = '#c9ccd4'; c.fillRect(tx + 30, ty + 10, 5, 12); txt(c, '+', tx - 29, ty + 22, INK, '800 14px');
      if (on) glow(c, tx, ty - 22, 56, `rgba(255,90,80,${0.7 * st.lit})`);
      ball(c, tx, ty - 22, 13, on ? '#ff5a4a' : '#7a3a3a'); c.fillStyle = '#9aa2b2'; c.fillRect(tx - 9, ty - 10, 18, 6);
      txt(c, on ? '켜짐' : '꺼짐', tx + 38, ty - 16, INK, '800 14px');
      const [qx, qy] = st.probe ? [st.probe.x, st.probe.y] : g.probe;
      c.strokeStyle = '#2a2d36'; c.lineWidth = 3; c.beginPath(); c.moveTo(tx - 56, ty + 10); c.bezierCurveTo(tx - 220, ty + 60, qx + 80, qy + 70, qx, qy + 40); c.stroke();
      c.save(); c.translate(qx, qy); c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.roundRect(-5, 4, 14, 44, 6); c.fill(); c.fillStyle = '#2a2d36'; c.beginPath(); c.roundRect(-7, 0, 14, 44, 6); c.fill(); c.fillStyle = '#c9ccd4'; c.beginPath(); c.moveTo(-3, 0); c.lineTo(3, 0); c.lineTo(0, -22); c.closePath(); c.fill(); c.restore();
      txt(c, '검사봉', g.probe[0], g.probe[1] + 66 > H ? g.probe[1] - 34 : g.probe[1] + 66, DIM, '700 14px');
      if (st.lit > 0 && !(st.drag && st.drag.k === 'probe')) st.lit -= dt * 0.5;
    },
    hint(st, W, H) { const g = this.geo(W, H), [yR] = this.ends(st, g); return st.strip < 1 ? [g.x1, g.y + 40, g.cut - g.x1, 0] : st.touched.size < 2 ? [g.probe[0], g.probe[1], (st.touched.has('rub') ? g.ex + 4 : W * 0.3) - g.probe[0], (st.touched.has('rub') ? yR : g.y) - g.probe[1] + 24] : !st.shorted ? [g.ex, yR + 24, 0, 40] : null; },
    down(st, p, api) {
      const g = this.geo(api.W, api.H), sx = lerp(g.x1, g.cut, st.strip), [yR, yK] = this.ends(st, g);
      if (st.strip < 1 && Math.abs(p.x - sx) < 40 && Math.abs(p.y - g.y) < 100) { st.drag = { k: 'strip', x: p.x }; return; }
      if (st.strip >= 1 && near(p, g.probe[0], g.probe[1] + 20, 56)) { st.probe = { x: p.x, y: p.y }; st.drag = { k: 'probe' }; return; }
      if (st.strip >= 1 && st.touched.size >= 2 && (near(p, g.ex - 10, yR, 46) || near(p, g.ex - 10, yK, 46))) { st.drag = { k: 'core', y0: p.y }; }
    },
    move(st, p, held, api) {
      if (!held || !st.drag) return; const g = this.geo(api.W, api.H);
      if (st.drag.k === 'strip') { st.drag.x = clamp(p.x, g.cut, g.x1); st.strip = Math.max(st.strip, (g.x1 - st.drag.x) / (g.x1 - g.cut)); if (st.strip > 0.97) { st.strip = 1; st.drag = null; api.say('껍질 속에 <b>피복을 입힌 전선 두 가닥</b>, 그 끝에 <b>구리 선</b>이 드러났다. 검사기 집게는 플러그 날에 물려 있다. 검사봉을 대 보자.'); api.ok(1, true); } }
      else if (st.drag.k === 'probe') {
        st.probe = { x: p.x, y: p.y - 22 };
        const [yR] = this.ends(st, g), tipY = p.y - 44, onCu = Math.abs(p.x - (g.ex - 4)) < 34 && Math.abs(tipY - yR) < 22, onRub = p.x > g.x0 + 10 && p.x < g.cut - 10 && Math.abs(tipY - g.y) < 26;
        if (onCu) { st.lit = 1; st.touched.add('cu'); api.say('<b>구리</b>에 대니 불이 켜졌다 — 플러그 날에서 구리 선을 따라 전류가 흘렀다. 구리는 자유 전자가 많은 <b>도체</b>.'); }
        else if (onRub) { st.lit = 0; st.touched.add('rub'); api.say('<b>고무 껍질</b>에 대니 꺼져 있다 — 전류가 거의 흐르지 않는 <b>부도체</b>.'); }
        if (st.touched.size >= 2) api.ok(2, true);
      } else if (st.drag.k === 'core') {
        st.meet = clamp(Math.abs(p.y - st.drag.y0) / 26, 0, 1);
        if (st.meet > 0.92 && !st.shorted) { st.shorted = true; st.short = 1.4; api.ok(3, true); api.say('구리끼리 닿자 <b>불꽃</b>이 튄다(합선). 피복의 부도체가 구리 두 가닥이 닿지 않게 하고, 사람 손에도 전류가 흐르지 않게 <b>막아 준다</b>.'); }
      }
    },
    up(st) { if (st.drag && st.drag.k === 'probe') st.probe = null; if (st.drag && st.drag.k === 'core') st.meet = 0; st.drag = null; },
    key(st, e, api) { if (e.key === 'Enter' || e.key === ' ') { this.act.next(st, api); return true; } return false; },
    act: {
      next(st, api) {
        if (st.strip < 1) { st.strip = 1; api.ok(1, true); api.say('껍질 속에 <b>피복을 입힌 전선 두 가닥</b>, 그 끝에 <b>구리 선</b>이 드러났다.'); }
        else if (st.touched.size < 2) { st.touched.add('rub'); st.touched.add('cu'); st.lit = 1; api.ok(2, true); api.say('<b>구리</b>에 대면 켜지고 <b>고무 껍질</b>에 대면 꺼진다.'); }
        else { st.shorted = true; st.short = 1.4; api.ok(3, true); api.say('구리끼리 닿자 <b>불꽃</b>이 튄다(합선). 피복의 부도체가 이를 막아 준다.'); }
        return st.strip;
      },
    },
  };

  // ─────────── 6. 햇빛으로 태양 전지 돌리기 ───────────
  KINDS.solar = {
    first: '태양 전지판에 선풍기와 전류계가 이어져 있다. 하늘의 <b>해</b>를 끌어 높이 올려 보자.',
    steps: ['① 해를 끌어 하늘 높이 올린다', '② 구름을 끌어 해를 가려 본다', '③ 전지판을 눌러 속을 확대해 본다'],
    done: '빛이 셀수록 전류가 세다',
    init: () => ({ sun: 0.08, cloud: 0.88, drag: null, zoom: false, ang: 0, el: [] }),
    geo(W, H) { return { gy: H * 0.74, pan: [W * 0.42, H * 0.7], fan: [W * 0.82, H * 0.6], arc: [W * 0.42, H * 0.86, W * 0.4, H * 0.7] }; },
    sunXY(st, g) { const a = Math.PI * (1 - st.sun), [cx, cy, rx, ry] = g.arc; return [cx + Math.cos(a) * rx, cy - Math.sin(a) * ry]; },
    light(st, g, W) { const [sx] = this.sunXY(st, g), el = Math.sin(Math.PI * st.sun), cx = W * (0.1 + 0.8 * st.cloud), cover = clamp(1 - Math.abs(cx - sx) / 110, 0, 1); return el * (1 - 0.75 * cover); },
    draw(c, W, H, st, t, dt, api) {
      const g = this.geo(W, H), L = this.light(st, g, W), [sx, sy] = this.sunXY(st, g);
      const sk = c.createLinearGradient(0, 0, 0, g.gy); sk.addColorStop(0, `rgb(${lerp(30, 70, L) | 0},${lerp(50, 150, L) | 0},${lerp(100, 230, L) | 0})`); sk.addColorStop(1, `rgb(${lerp(80, 190, L) | 0},${lerp(80, 220, L) | 0},${lerp(120, 245, L) | 0})`);
      c.fillStyle = sk; c.fillRect(0, 0, W, g.gy);
      // 해(빛 번짐 + 빛살)
      glow(c, sx, sy, 110, `rgba(255,230,140,${0.25 + 0.4 * L})`);
      c.save(); c.translate(sx, sy); c.rotate(t * 0.2); c.strokeStyle = 'rgba(255,220,120,.7)'; c.lineWidth = 3; for (let i = 0; i < 12; i++) { c.rotate(TAU / 12); c.beginPath(); c.moveTo(38, 0); c.lineTo(50 + 4 * Math.sin(t * 3 + i), 0); c.stroke(); } c.restore();
      const sg = c.createRadialGradient(sx - 8, sy - 8, 4, sx, sy, 30); sg.addColorStop(0, '#fffbe0'); sg.addColorStop(1, '#ffb52e'); c.fillStyle = sg; c.beginPath(); c.arc(sx, sy, 30, 0, TAU); c.fill();
      // 구름
      const cx = W * (0.1 + 0.8 * st.cloud), cyy = H * 0.24;
      c.fillStyle = 'rgba(40,50,80,.25)'; c.beginPath(); c.ellipse(cx + 4, cyy + 26, 90, 14, 0, 0, TAU); c.fill();
      const cg = c.createLinearGradient(0, cyy - 40, 0, cyy + 30); cg.addColorStop(0, '#ffffff'); cg.addColorStop(1, '#b7c3d6'); c.fillStyle = cg; c.beginPath();
      [[-60, 10, 32], [-20, -12, 44], [30, -4, 40], [70, 12, 28], [0, 14, 38]].forEach(([dx, dy, r]) => { c.moveTo(cx + dx + r, cyy + dy); c.arc(cx + dx, cyy + dy, r, 0, TAU); }); c.fill();
      txt(c, '구름', cx, cyy + 8, '#5a6a8a', '700 15px');
      // 땅
      c.fillStyle = `rgba(${lerp(40, 90, L) | 0},${lerp(70, 130, L) | 0},${lerp(80, 120, L) | 0},.8)`; c.beginPath(); c.moveTo(0, g.gy); for (let x = 0; x <= W; x += 10) c.lineTo(x, g.gy - 30 - 22 * Math.sin(x * 0.006 + 1) - 10 * Math.sin(x * 0.02)); c.lineTo(W, g.gy); c.fill();
      const gg = c.createLinearGradient(0, g.gy, 0, H); gg.addColorStop(0, '#5f9a4e'); gg.addColorStop(1, '#2d5130'); c.fillStyle = gg; c.fillRect(0, g.gy, W, H - g.gy);
      [[0.06, 1], [0.14, 0.8], [0.95, 0.9]].forEach(([u, k]) => { const tx2 = W * u, ty2 = g.gy + 6; c.fillStyle = '#5a3d2a'; c.fillRect(tx2 - 4, ty2 - 50 * k, 8, 50 * k); const tg = c.createRadialGradient(tx2 - 10, ty2 - 80 * k, 4, tx2, ty2 - 70 * k, 40 * k); tg.addColorStop(0, '#7fd08a'); tg.addColorStop(1, '#2b7a3d'); c.fillStyle = tg; c.beginPath(); c.arc(tx2 + Math.sin(t + u * 9) * 1.5, ty2 - 72 * k, 34 * k, 0, TAU); c.fill(); });
      // 빛 화살(햇빛 → 전지판), 셀수록 굵고 많다
      const [px, py] = g.pan;
      for (let i = 0; i < 5; i++) { const u = (t * 0.9 + i / 5) % 1, a0 = 0.2 + 0.8 * L; if (L < 0.05) break; const x = lerp(sx, px - 60 + i * 30, u), y = lerp(sy, py - 40, u); c.fillStyle = `rgba(255,224,110,${a0 * (1 - u * 0.4)})`; c.beginPath(); c.arc(x, y, 3 + 3 * L, 0, TAU); c.fill(); }
      // 태양 전지판(기울어진 판 + 칸)
      c.save(); c.translate(px, py); c.transform(1, 0, -0.35, 1, 0, 0);
      c.fillStyle = 'rgba(0,0,0,.35)'; c.fillRect(-86, -48, 172, 70);
      const pg = c.createLinearGradient(-90, -60, 90, 10); pg.addColorStop(0, '#2b4fa8'); pg.addColorStop(1, '#0f1f4a'); c.fillStyle = pg; c.fillRect(-90, -54, 172, 68);
      c.strokeStyle = 'rgba(180,200,255,.5)'; c.lineWidth = 1.2; for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(-90 + i * 172 / 6, -54); c.lineTo(-90 + i * 172 / 6, 14); c.stroke(); } for (let j = 1; j < 3; j++) { c.beginPath(); c.moveTo(-90, -54 + j * 68 / 3); c.lineTo(82, -54 + j * 68 / 3); c.stroke(); }
      c.fillStyle = `rgba(255,255,255,${0.1 + 0.25 * L})`; c.beginPath(); c.moveTo(-80, -50); c.lineTo(-20, -50); c.lineTo(-60, 10); c.lineTo(-90, 10); c.fill();
      c.restore();
      c.fillStyle = '#6b7183'; c.fillRect(px - 4, py + 14, 8, g.gy - py - 10);
      txt(c, '태양 전지판', px, py + 44, '#fbfcf9', '800 16px');
      // 전선 → 전류계 → 선풍기
      const [fx, fy] = g.fan, ax = W * 0.66, ay = H * 0.86;
      c.strokeStyle = '#1d2433'; c.lineWidth = 4; c.beginPath(); c.moveTo(px + 60, py + 10); c.bezierCurveTo(px + 120, py + 60, ax - 60, ay, ax - 36, ay); c.moveTo(ax + 36, ay); c.bezierCurveTo(ax + 80, ay, fx - 20, fy + 90, fx, fy + 70); c.stroke();
      for (let i = 0; i < 6; i++) { if (L < 0.05) break; const u = (t * L * 0.8 + i / 6) % 1; const x = u < 0.5 ? lerp(px + 60, ax - 36, u * 2) : lerp(ax + 36, fx, (u - 0.5) * 2), y = u < 0.5 ? lerp(py + 10, ay, u * 2) + Math.sin(u * Math.PI * 2) * 10 : lerp(ay, fy + 70, (u - 0.5) * 2); c.fillStyle = '#7fd1ff'; c.beginPath(); c.arc(x, y, 3, 0, TAU); c.fill(); }
      // 전류계
      c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.roundRect(ax - 40 + 3, ay - 34 + 4, 80, 60, 10); c.fill();
      c.fillStyle = '#f2f0e6'; c.beginPath(); c.roundRect(ax - 40, ay - 34, 80, 60, 10); c.fill();
      c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.arc(ax, ay + 12, 30, Math.PI * 1.15, Math.PI * 1.85); c.stroke();
      const na = Math.PI * (1.15 + 0.7 * L) + Math.sin(t * 9) * 0.01; c.strokeStyle = '#e4572e'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(ax, ay + 12); c.lineTo(ax + Math.cos(na) * 28, ay + 12 + Math.sin(na) * 28); c.stroke();
      txt(c, '전류계', ax, ay + 44, '#fbfcf9', '700 14px');
      // 선풍기(날개가 빛 세기만큼 돈다)
      st.ang += dt * L * 18;
      c.fillStyle = '#c9ccd4'; c.fillRect(fx - 4, fy, 8, g.gy - fy); c.fillStyle = '#8a93a8'; c.beginPath(); c.ellipse(fx, g.gy, 28, 7, 0, 0, TAU); c.fill();
      c.save(); c.translate(fx, fy); c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.arc(0, 0, 52, 0, TAU); c.fill(); c.strokeStyle = 'rgba(220,230,250,.7)'; c.lineWidth = 2; c.stroke();
      for (let i = 0; i < 4; i++) { c.save(); c.rotate(st.ang + i * TAU / 4); const bg2 = c.createLinearGradient(0, 0, 46, 0); bg2.addColorStop(0, '#7fb4ff'); bg2.addColorStop(1, '#3d6fd6'); c.fillStyle = bg2; c.beginPath(); c.ellipse(26, 0, 22, 9, 0.2, 0, TAU); c.fill(); c.restore(); }
      ball(c, 0, 0, 8, '#e4572e'); c.restore();
      txt(c, L > 0.6 ? '쌩쌩' : L > 0.2 ? '천천히' : '멈춤', fx, fy - 64, '#fbfcf9', '800 16px');
      // 확대 그림: 반도체 두 층(n형·p형)에서 빛이 전자를 떼어 낸다
      if (st.zoom) {
        const zx = W * 0.02, zy = H * 0.5, zw = W * 0.31, zh = H * 0.47;
        c.strokeStyle = 'rgba(255,255,255,.7)'; c.setLineDash([5, 5]); c.lineWidth = 2; c.beginPath(); c.moveTo(zx + zw, zy + 20); c.lineTo(px - 70, py - 30); c.moveTo(zx + zw, zy + zh - 20); c.lineTo(px - 60, py + 10); c.stroke(); c.setLineDash([]);
        c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.roundRect(zx + 4, zy + 5, zw, zh, 14); c.fill();
        c.fillStyle = '#f7f4ea'; c.beginPath(); c.roundRect(zx, zy, zw, zh, 14); c.fill(); c.strokeStyle = INK; c.lineWidth = 2; c.stroke();
        const ly1 = zy + zh * 0.32, ly2 = zy + zh * 0.62;
        c.fillStyle = '#c9dcff'; c.fillRect(zx + 14, ly1, zw - 28, ly2 - ly1); c.fillStyle = '#ffd9c9'; c.fillRect(zx + 14, ly2, zw - 28, zh * 0.26);
        txt(c, 'n형 반도체', zx + zw - 20, ly1 + 22, '#2b4fa8', '800 14px', 'right'); txt(c, 'p형 반도체', zx + zw - 20, ly2 + 22, '#a8452b', '800 14px', 'right');
        txt(c, '속을 확대하면', zx + 16, zy + 26, INK, '800 16px', 'left');
        // 빛 알갱이가 경계에 닿아 전자(−)와 빈자리(+)가 생겨 갈라진다
        if (Math.random() < dt * 6 * L) st.el.push({ x: zx + 30 + Math.random() * (zw - 60), u: 0 });
        st.el.forEach((e) => { e.u += dt * 0.7; }); st.el = st.el.filter((e) => e.u < 1.6);
        st.el.forEach((e) => {
          if (e.u < 0.5) { const y = lerp(zy + 36, ly2, e.u * 2); c.fillStyle = '#ffcf3a'; c.beginPath(); c.arc(e.x, y, 4, 0, TAU); c.fill(); }
          else { const k = e.u - 0.5; c.fillStyle = '#2b6fd6'; c.beginPath(); c.arc(e.x, ly2 - k * 50, 6, 0, TAU); c.fill(); txt(c, '−', e.x, ly2 - k * 50 + 4, '#fff', '800 11px'); c.strokeStyle = '#d64545'; c.lineWidth = 2; c.beginPath(); c.arc(e.x, ly2 + k * 40, 6, 0, TAU); c.stroke(); txt(c, '+', e.x, ly2 + k * 40 + 4, '#d64545', '800 11px'); }
        });
        txt(c, '빛 → 전자(−)가 떨어져 나와 전선으로 흐른다', zx + zw / 2, zy + zh - 10, INK, '700 13px');
      }
    },
    hint(st, W, H) { const g = this.geo(W, H), [sx, sy] = this.sunXY(st, g); return st.sun < 0.4 ? [sx, sy + 10, W * 0.25, -H * 0.3] : !st.cl ? [W * (0.1 + 0.8 * st.cloud), H * 0.3, sx - W * (0.1 + 0.8 * st.cloud), 0] : !st.zoom ? [g.pan[0], g.pan[1] - 20, 0, 0] : null; },
    down(st, p, api) {
      const g = this.geo(api.W, api.H), [sx, sy] = this.sunXY(st, g);
      if (near(p, sx, sy, 50)) { st.drag = 'sun'; return; }
      if (near(p, api.W * (0.1 + 0.8 * st.cloud), api.H * 0.24, 80)) { st.drag = 'cloud'; return; }
      if (near(p, g.pan[0], g.pan[1] - 20, 90)) this.zoomIt(st, api);
    },
    move(st, p, held, api) {
      if (!held || !st.drag) return; const g = this.geo(api.W, api.H);
      if (st.drag === 'sun') { const [cx, cy, rx, ry] = g.arc; st.sun = clamp(1 - Math.atan2((cy - p.y) / ry, (p.x - cx) / rx) / Math.PI, 0.02, 0.98); if (Math.sin(Math.PI * st.sun) > 0.9) api.ok(1, true); }
      else { st.cloud = clamp((p.x / api.W - 0.1) / 0.8, 0, 1); const [sx] = this.sunXY(st, g); if (Math.abs(api.W * (0.1 + 0.8 * st.cloud) - sx) < 40 && api.okd(1)) { st.cl = true; api.ok(2, true); } }
      this.sync(st, api);
    },
    up(st) { st.drag = null; },
    zoomIt(st, api) { st.zoom = !st.zoom; if (st.zoom) api.ok(3, true); this.sync(st, api); },
    sync(st, api) {
      const g = this.geo(api.W, api.H), L = this.light(st, g, api.W);
      api.say(st.zoom && api.okd(1) && api.okd(2) ? '태양 전지는 <b>빛을 받으면 전류가 흐르는</b> 반도체로 만든다. 빛이 반도체 속 전자를 떼어 내고, 두 층의 경계가 전자를 한쪽으로 보내 전류가 된다.'
        : L > 0.7 ? '햇빛이 세다 — 전류계 바늘이 크게 움직이고 선풍기가 <b>빠르게</b> 돈다.' : L > 0.2 ? '빛이 약해지자 전류가 줄고 선풍기가 <b>느려졌다</b>.' : '빛이 거의 없다 — 전류가 흐르지 않는다.');
    },
    key(st, e, api) {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { st.sun = clamp(st.sun + (e.key === 'ArrowRight' ? 0.05 : -0.05), 0.02, 0.98); if (Math.sin(Math.PI * st.sun) > 0.9) api.ok(1, true); this.sync(st, api); return true; }
      if (e.key === 'c' || e.key === 'C') { const g = this.geo(api.W, api.H), [sx] = this.sunXY(st, g); st.cloud = clamp((sx / api.W - 0.1) / 0.8, 0, 1); st.cl = true; if (api.okd(1)) api.ok(2, true); this.sync(st, api); return true; }
      if (e.key === 'z' || e.key === 'Z' || e.key === 'Enter') { this.zoomIt(st, api); return true; }
      return false;
    },
    act: { sun: (st, api, v) => { st.sun = v; if (Math.sin(Math.PI * v) > 0.9) api.ok(1, true); KINDS.solar.sync(st, api); return KINDS.solar.light(st, KINDS.solar.geo(api.W, api.H), api.W); }, cloud: (st, api, v) => { st.cloud = v; st.cl = true; if (api.okd(1)) api.ok(2, true); KINDS.solar.sync(st, api); return KINDS.solar.light(st, KINDS.solar.geo(api.W, api.H), api.W); }, zoom: (st, api) => KINDS.solar.zoomIt(st, api) },
  };

  // ─────────── 공용 틀 ───────────
  function mount(root, kind) {
    const K = KINDS[kind], P = window.Play;
    const stage = root.querySelector('.mx-stage'), now = root.querySelector('.mx-now'), out = root.querySelector('.mx-out');
    const nSteps = root.querySelectorAll('.u-steps li').length || K.steps.length;
    let st, t = 0, idle = -99, held = false, msg = '';
    const ok = new Set();
    function sync() {
      const cur = Array.from({ length: nSteps }, (_, i) => i + 1).find((k) => !ok.has(k)) || 0;
      window.L1.steps(root, cur, [...ok]); window.L1.done(root, cur === 0);
      const tx = cur ? K.steps[cur - 1] : K.done;
      if (now.textContent !== tx) now.textContent = tx; now.classList.toggle('done', cur === 0);
    }
    const api = {
      say(h) { if (h !== msg) { msg = h; out.innerHTML = h; } },
      ok(k, on = true) { if (on && !ok.has(k)) { ok.add(k); sync(); } },
      okd: (k) => ok.has(k),
      get W() { return S.W; }, get H() { return S.H; },
    };
    const S = P.make(stage, {
      draw(c, W, H, dt) { t += dt; K.draw.call(K, c, W, H, st, t, dt, api); if (!held && t - idle > 3 && K.hint) { const h = K.hint.call(K, st, W, H); if (h) hand(c, h[0], h[1], h[2], h[3], t); } },
      down(p) { held = true; idle = t; if (K.down) K.down.call(K, st, p, api); },
      move(p, e, held) { if (K.move) K.move.call(K, st, p, held, api); },
      up(p) { if (K.up) K.up.call(K, st, p, api); held = false; idle = t; },
      key(e) { if (e.key === '0') { reset(); return true; } const r = K.key && K.key.call(K, st, e, api); if (r) idle = t; return !!r; },
    });
    function reset() { st = K.init(api); ok.clear(); idle = -99; held = false; msg = ''; api.say(K.first); sync(); S.kick(); }
    root.querySelector('.mx-reset')?.addEventListener('click', reset);
    reset();
    root._mx = { state: () => st, act: (name, ...a) => { const r = K.act[name](st, api, ...a); S.kick(); return r; }, steps: () => [...ok] };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.More = { mount };
})();
