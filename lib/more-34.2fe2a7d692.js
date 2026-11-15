/* 2-1-3·2-1-4 늘린 체험 장 공용 틀(2026-11-13 차시 늘리기, 작업-4).
   M34.def(종류, K) 로 장마다 그림·조작을 등록하고, lessonN.js 에서 M34.mount(root, 종류) → { fit, setActive }.
   흐름: 오른쪽 「예측」에서 하나 고르기 → 캔버스에서 손으로 해 보기 → K 가 api.judge(정답) 로 맞춰 보기 → 표(.m4-tab)가 채워짐.
   K = { vw, vh, bg, init(st, api), draw(c, st, api, D), down(p, st, api), move(p, st, api, held), up(p, st, api), key(k, st, api), hint(st), test(st, api, …) }
   좌표는 가상 크기 vw×vh(기본 1060×700)로 그리고 무대에 맞춰 늘린다. CSS 는 이 파일이 <style id="m34-css"> 로 넣는다(공용 unit.css 를 건드리지 않음).
   시험용: root._m4.pick(k) · root._m4.test(…) · root._m4.run(초) · root._m4.st */
(function () {
  'use strict';
  const TAU = Math.PI * 2, FONT = '"IBM Plex Sans KR", sans-serif';
  const lerp = (a, b, k) => a + (b - a) * k, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), ease = (k) => k * k * (3 - 2 * k);
  const hash = (i, k = 0) => { const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); };

  const D = {
    TAU, lerp, clamp, ease, hash, FONT,
    F: (w, s) => `${w} ${s}px ${FONT}`,
    txt(c, t, x, y, col = '#1d2433', f = '700 18px', al = 'center', base = 'alphabetic') { c.fillStyle = col; c.font = `${f} ${FONT}`; c.textAlign = al; c.textBaseline = base; c.fillText(t, x, y); c.textBaseline = 'alphabetic'; },
    // 글자 뒤에 옅은 바탕을 깔아 그림 위에서도 읽히게
    tag(c, t, x, y, o = {}) {
      const f = o.f || '700 16px', pad = o.pad || 8; c.font = `${f} ${FONT}`; const w = c.measureText(t).width + pad * 2, h = o.h || 26;
      const al = o.al || 'center', x0 = al === 'left' ? x : al === 'right' ? x - w : x - w / 2;
      c.fillStyle = o.bg || 'rgba(251,252,249,.92)'; c.beginPath(); c.roundRect(x0, y - h / 2, w, h, o.r == null ? 7 : o.r); c.fill();
      if (o.line) { c.strokeStyle = o.line; c.lineWidth = 1.5; c.stroke(); }
      D.txt(c, t, x0 + w / 2, y + 5.5, o.col || '#1d2433', f); return w;
    },
    pill(c, x, y, t, bg = '#1d2433', fg = '#fff', f = '700 17px') {
      c.font = `${f} ${FONT}`; const w = c.measureText(t).width + 24;
      c.fillStyle = bg; c.beginPath(); c.roundRect(x - w / 2, y - 16, w, 32, 16); c.fill(); D.txt(c, t, x, y + 6, fg, f); return w;
    },
    rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); },
    lin(c, x0, y0, x1, y1, stops) { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach((s, i) => g.addColorStop(Array.isArray(s) ? s[0] : i / (stops.length - 1), Array.isArray(s) ? s[1] : s)); return g; },
    ball(c, x, y, r, col, dark, hi = '#ffffff') {
      const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r); g.addColorStop(0, hi); g.addColorStop(0.32, col); g.addColorStop(1, dark);
      c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    },
    glow(c, x, y, r, inner, outer = 'rgba(0,0,0,0)') { if (r <= 0) return; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, inner); g.addColorStop(1, outer); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); },
    line(c, x1, y1, x2, y2, col, w = 2, dash) { c.strokeStyle = col; c.lineWidth = w; if (dash) c.setLineDash(dash); c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); if (dash) c.setLineDash([]); },
    arrow(c, x1, y1, x2, y2, col, w = 3, hd = 12) {
      const a = Math.atan2(y2 - y1, x2 - x1); D.line(c, x1, y1, x2 - Math.cos(a) * hd * 0.6, y2 - Math.sin(a) * hd * 0.6, col, w);
      c.fillStyle = col; c.beginPath(); c.moveTo(x2, y2); c.lineTo(x2 - Math.cos(a - 0.45) * hd, y2 - Math.sin(a - 0.45) * hd); c.lineTo(x2 - Math.cos(a + 0.45) * hd, y2 - Math.sin(a + 0.45) * hd); c.closePath(); c.fill();
    },
    shadow(c, x, y, rx, ry, a = 0.22) { const g = c.createRadialGradient(x, y, 0, x, y, rx); g.addColorStop(0, `rgba(20,24,34,${a})`); g.addColorStop(1, 'rgba(20,24,34,0)'); c.save(); c.translate(x, y); c.scale(1, ry / rx); c.translate(-x, -y); c.fillStyle = g; c.beginPath(); c.arc(x, y, rx, 0, TAU); c.fill(); c.restore(); },
    // 실험실 벽 + 나무 실험대(윗면·앞면·나뭇결)
    lab(c, W, H, y, o = {}) {
      c.fillStyle = D.lin(c, 0, 0, 0, y, [o.w0 || '#eef2ee', o.w1 || '#dde5df']); c.fillRect(0, 0, W, y);
      c.strokeStyle = 'rgba(120,140,130,.10)'; c.lineWidth = 1; c.beginPath();
      for (let gy = y - 60; gy > 0; gy -= 60) { c.moveTo(0, gy); c.lineTo(W, gy); }
      for (let r = 0, gy = y; gy > 0; gy -= 60, r++) for (let gx = (r % 2) * 45; gx < W; gx += 90) { c.moveTo(gx, gy); c.lineTo(gx, gy - 60); }
      c.stroke();
      const top = y, fr = y + (o.depth || 26);
      c.fillStyle = D.lin(c, 0, top, 0, fr, ['#d9b98d', '#c89f6d']); c.fillRect(0, top, W, fr - top);
      c.fillStyle = D.lin(c, 0, fr, 0, H, ['#a77a4b', '#8c6239']); c.fillRect(0, fr, W, H - fr);
      c.strokeStyle = 'rgba(90,55,25,.18)'; c.lineWidth = 1.2;
      for (let i = 0; i < 7; i++) { const yy = fr + 8 + i * ((H - fr - 10) / 7); c.beginPath(); c.moveTo(0, yy); for (let x = 0; x <= W; x += 40) c.lineTo(x, yy + Math.sin(x * 0.013 + i * 1.7) * 2.2); c.stroke(); }
      D.line(c, 0, top, W, top, 'rgba(255,240,215,.8)', 2); D.line(c, 0, fr, W, fr, 'rgba(60,35,15,.35)', 2);
    },
    // 비커: 바닥 가운데 x, 바닥 높이 bot, 반폭 hw, 높이 h. o = { level(0~1), liq: [윗색, 아랫색], ticks:[[비율, '50']], unit:'mL' }
    beaker(c, x, bot, hw, h, o = {}) {
      const top = bot - h, lv = o.level == null ? 0.6 : o.level;
      D.shadow(c, x, bot + 4, hw * 1.15, 10, 0.25);
      c.fillStyle = 'rgba(214,232,240,.35)'; D.rr(c, x - hw, top, hw * 2, h, [4, 4, 14, 14]); c.fill();
      if (lv > 0) {
        const ly = bot - h * lv * 0.92;
        c.fillStyle = D.lin(c, 0, ly, 0, bot, o.liq || ['rgba(170,210,235,.75)', 'rgba(120,175,215,.85)']);
        D.rr(c, x - hw + 3, ly, hw * 2 - 6, bot - ly - 3, [2, 2, 12, 12]); c.fill();
        c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.ellipse(x, ly, hw - 3, 5, 0, 0, TAU); c.fill();
      }
      c.strokeStyle = 'rgba(70,95,115,.75)'; c.lineWidth = 2.5; D.rr(c, x - hw, top, hw * 2, h, [4, 4, 14, 14]); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(x - hw + 7, top + 10, 5, h - 26);
      c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x + hw - 14, top + 14, 3, h - 34);
      c.strokeStyle = 'rgba(70,95,115,.9)'; c.lineWidth = 3; c.beginPath(); c.ellipse(x, top, hw + 2, 4, 0, 0, TAU); c.stroke();
      (o.ticks || []).forEach(([k, t]) => { const yy = bot - h * k * 0.92; D.line(c, x + hw - 22, yy, x + hw - 6, yy, 'rgba(60,80,100,.7)', 1.5); if (t) D.txt(c, t, x + hw - 25, yy + 5, 'rgba(50,70,90,.85)', '600 12px', 'right'); });
      if (o.unit) D.txt(c, o.unit, x + hw - 14, top + 22, 'rgba(50,70,90,.8)', '600 12px');
    },
    // 보어 원자 모형: o = { Z, sh:[2,8,1], r0, dr, t, hl(바깥 전자 강조), dim, ecol, ncol, spin }
    atom(c, x, y, o) {
      const sh = o.sh || [], r0 = o.r0 || 18, dr = o.dr || 22, t = o.t || 0, n = sh.length;
      for (let i = 0; i < (o.rings || n); i++) {
        const R = r0 + 12 + dr * i + dr * 0.5;
        c.strokeStyle = o.ring || 'rgba(110,150,200,.55)'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, R, 0, TAU); c.stroke();
        c.strokeStyle = 'rgba(160,200,240,.18)'; c.lineWidth = 7; c.beginPath(); c.arc(x, y, R, 0, TAU); c.stroke();
      }
      D.glow(c, x, y, r0 * 1.8, 'rgba(240,110,90,.35)');
      D.ball(c, x, y, r0, o.ncol || '#e2553f', o.ndark || '#8f2414', '#ffd6c8');
      if (o.Z != null) D.txt(c, `${o.Z}+`, x, y + r0 * 0.3, '#fff', `800 ${Math.round(r0 * 0.8)}px`);
      sh.forEach((m, i) => {
        const R = r0 + 12 + dr * i + dr * 0.5;
        for (let k = 0; k < m; k++) {
          const a = (k / m) * TAU + t * (o.spin == null ? 0.5 - i * 0.1 : o.spin) + i * 0.4;
          const ex = x + Math.cos(a) * R, ey = y + Math.sin(a) * R, er = o.er || 6.5;
          if (o.hl && i === n - 1) { c.strokeStyle = '#f2b705'; c.lineWidth = 2.5; c.beginPath(); c.arc(ex, ey, er + 4, 0, TAU); c.stroke(); }
          D.ball(c, ex, ey, er, o.ecol || '#3f8fe0', o.edark || '#174a8a', '#d8ecff');
        }
      });
      return r0 + 12 + dr * (n - 1) + dr * 0.5;
    },
    // 둥근 판(카드): 종이 바탕 + 그림자 + 테
    card(c, x, y, w, h, o = {}) {
      c.save(); c.shadowColor = 'rgba(20,24,34,.18)'; c.shadowBlur = o.blur == null ? 12 : o.blur; c.shadowOffsetY = 4;
      c.fillStyle = o.bg || '#fbfcf9'; D.rr(c, x, y, w, h, o.r == null ? 12 : o.r); c.fill(); c.restore();
      c.strokeStyle = o.line || 'rgba(29,36,51,.75)'; c.lineWidth = o.lw || 2; D.rr(c, x, y, w, h, o.r == null ? 12 : o.r); c.stroke();
      if (o.title) D.txt(c, o.title, x + 14, y + 24, o.tcol || '#1f5f4a', '800 16px', 'left');
    },
    // 그래프: o = { x0, x1, y0, y1, xt:[눈금], yt:[눈금], xl, yl, grid }
    axes(c, x, y, w, h, o) {
      const X = (v) => x + ((v - o.x0) / (o.x1 - o.x0)) * w, Y = (v) => y + h - ((v - o.y0) / (o.y1 - o.y0)) * h;
      c.fillStyle = o.bg || '#ffffff'; c.fillRect(x, y, w, h);
      c.strokeStyle = 'rgba(29,36,51,.08)'; c.lineWidth = 1; c.beginPath();
      (o.xt || []).forEach((v) => { c.moveTo(X(v), y); c.lineTo(X(v), y + h); }); (o.yt || []).forEach((v) => { c.moveTo(x, Y(v)); c.lineTo(x + w, Y(v)); }); c.stroke();
      D.line(c, x, y + h, x + w + 6, y + h, '#1d2433', 2); D.line(c, x, y + h, x, y - 6, '#1d2433', 2);
      const fs = o.fs || 12;
      (o.xt || []).forEach((v) => { D.line(c, X(v), y + h, X(v), y + h + 5, '#1d2433', 1.5); D.txt(c, o.xf ? o.xf(v) : String(v), X(v), y + h + 7 + fs, '#4a5366', `600 ${fs}px`); });
      (o.yt || []).forEach((v) => { D.line(c, x - 5, Y(v), x, Y(v), '#1d2433', 1.5); D.txt(c, o.yf ? o.yf(v) : String(v), x - 8, Y(v) + fs * 0.38, '#4a5366', `600 ${fs}px`, 'right'); });
      if (o.xl) D.txt(c, o.xl, x + w, y + h + 2 * fs + 12, '#1d2433', `700 ${fs + 1}px`, 'right');
      if (o.yl) D.txt(c, o.yl, x + 2, y - 12, '#1d2433', `700 ${fs + 1}px`, 'left');
      return { X, Y };
    },
    // 숫자 표시창(LCD)
    lcd(c, x, y, w, h, val, unit, o = {}) {
      c.fillStyle = D.lin(c, 0, y, 0, y + h, ['#4b5466', '#2b3242']); D.rr(c, x - 6, y - 6, w + 12, h + 12, 10); c.fill();
      c.fillStyle = D.lin(c, 0, y, 0, y + h, [o.on === false ? '#8a9488' : '#cfe3b4', o.on === false ? '#727c70' : '#b5d08f']); D.rr(c, x, y, w, h, 6); c.fill();
      D.txt(c, val, x + w - (unit ? 44 : 10), y + h * 0.72, '#1f2a14', `800 ${Math.round(h * 0.62)}px`, 'right');
      if (unit) D.txt(c, unit, x + w - 8, y + h * 0.72, '#1f2a14', `700 ${Math.round(h * 0.36)}px`, 'right');
      if (o.label) D.txt(c, o.label, x + w / 2, y - 12, o.lcol || '#e8edf5', '700 13px');
    },
    // 바늘 계기: frac 0~1, labels: [값…], unit
    gauge(c, x, y, r, frac, labels, unit, o = {}) {
      c.fillStyle = D.lin(c, 0, y - r, 0, y + r * 0.5, ['#fdfdf8', '#e9ece4']); c.strokeStyle = '#2b3242'; c.lineWidth = 3;
      D.rr(c, x - r - 12, y - r - 14, 2 * r + 24, r + 44, 12); c.fill(); c.stroke();
      const a0 = Math.PI * 1.15, a1 = Math.PI * 1.85;
      c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, r - 4, a0, a1); c.stroke();
      labels.forEach((t, i) => { const a = lerp(a0, a1, i / (labels.length - 1)); D.line(c, x + Math.cos(a) * (r - 12), y + Math.sin(a) * (r - 12), x + Math.cos(a) * (r - 3), y + Math.sin(a) * (r - 3), '#1d2433', 2); D.txt(c, String(t), x + Math.cos(a) * (r - 24), y + Math.sin(a) * (r - 24) + 4, '#1d2433', '700 12px'); });
      for (let i = 0; i <= (labels.length - 1) * 5; i++) { const a = lerp(a0, a1, i / ((labels.length - 1) * 5)); D.line(c, x + Math.cos(a) * (r - 8), y + Math.sin(a) * (r - 8), x + Math.cos(a) * (r - 3), y + Math.sin(a) * (r - 3), 'rgba(29,36,51,.6)', 1); }
      const a = lerp(a0, a1, clamp(frac, 0, 1.02));
      c.strokeStyle = o.col || '#c73a2a'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * (r - 8), y + Math.sin(a) * (r - 8)); c.stroke();
      D.ball(c, x, y, 6, '#4b5466', '#1d2433');
      if (unit) D.txt(c, unit, x, y + 22, '#1d2433', '800 14px');
      if (o.label) D.txt(c, o.label, x, y - r - 22, '#1d2433', '800 14px');
    },
    // 굵은 전선(겉피복 + 반짝임)
    wire(c, pts, col = '#c0392b', w = 6) {
      c.lineCap = 'round'; c.lineJoin = 'round';
      [[w + 3, 'rgba(20,24,34,.35)'], [w, col], [w * 0.3, 'rgba(255,255,255,.35)']].forEach(([lw, s], k) => {
        c.strokeStyle = s; c.lineWidth = lw; c.beginPath(); pts.forEach(([px, py], i) => (i ? c.lineTo(px, py - (k === 2 ? w * 0.2 : 0)) : c.moveTo(px, py - (k === 2 ? w * 0.2 : 0)))); c.stroke();
      });
      c.lineCap = 'butt';
    },
    // 악어 집게(끝이 x, y, 방향 a)
    clip(c, x, y, a, col = '#c0392b') {
      c.save(); c.translate(x, y); c.rotate(a);
      c.fillStyle = D.lin(c, 0, -8, 0, 8, ['#e7e9ec', '#9aa1ab']); c.beginPath(); c.moveTo(0, -3); c.lineTo(-26, -9); c.lineTo(-26, 9); c.lineTo(0, 3); c.closePath(); c.fill();
      c.strokeStyle = '#5b626d'; c.lineWidth = 1; c.stroke();
      for (let i = 0; i < 4; i++) D.line(c, -6 - i * 5, -4 - i, -6 - i * 5, 4 + i, 'rgba(60,65,75,.6)', 1);
      c.fillStyle = col; D.rr(c, -50, -9, 26, 18, 6); c.fill(); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(-46, -6, 18, 4);
      c.restore();
    },
    // 손가락(끝이 x, y)
    hand(c, x, y, s = 1, a = 1) {
      c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s); c.rotate(-0.25);
      c.fillStyle = '#fff'; c.strokeStyle = '#1d2433'; c.lineWidth = 2.4; c.lineJoin = 'round';
      const part = (px, py, w, h, r) => { c.beginPath(); c.roundRect(px, py, w, h, r); c.fill(); c.stroke(); };
      part(-13, 22, 36, 34, 11); part(-23, 30, 13, 22, 6.5); part(3, 18, 11, 18, 5.5); part(12, 21, 11, 16, 5.5); part(-6, 0, 12, 36, 6);
      c.strokeStyle = 'rgba(29,36,51,.35)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-3, 6); c.lineTo(3, 6); c.stroke();
      c.restore();
    },
    hint(c, x, y, t, dx = 1, dy = 0, label, dist = 90) {
      const k = (t * 0.7) % 1, m = ease(clamp((k - 0.15) / 0.6, 0, 1)), a = k < 0.1 ? k / 0.1 : k > 0.85 ? (1 - k) / 0.15 : 1;
      const L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, ex = x + ux * dist, ey = y + uy * dist;
      c.save(); c.globalAlpha = 0.85 * a; D.arrow(c, x, y, ex, ey, '#f2b705', 5, 18); c.restore();
      if (k < 0.25) { c.strokeStyle = `rgba(242,183,5,${0.8 * (1 - k / 0.25)})`; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 10 + k * 90, 0, TAU); c.stroke(); }
      D.hand(c, x + ux * dist * m, y + uy * dist * m, 1.05, a);
      if (label) D.pill(c, x + ux * dist / 2, y + uy * dist / 2 - 44, label, 'rgba(29,36,51,.88)', '#ffd84d', '700 16px');
    },
    tap(c, x, y, t, label) {
      const k = (t * 1.1) % 1, press = k < 0.2 ? k / 0.2 : k < 0.4 ? 1 - (k - 0.2) / 0.2 : 0;
      if (k > 0.2 && k < 0.7) { c.strokeStyle = `rgba(242,183,5,${0.9 * (1 - (k - 0.2) / 0.5)})`; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 8 + (k - 0.2) * 80, 0, TAU); c.stroke(); }
      D.hand(c, x + 4, y + 6 - press * 6, 1.0, 0.95);
      if (label) D.pill(c, x, y - 36, label, 'rgba(29,36,51,.88)', '#ffd84d', '700 16px');
    },
    // 돋보기 테와 손잡이(속은 따로 그린다): 원 중심 x, y, 반지름 r
    lensRim(c, x, y, r, a = 0.8) {
      const hx = x + Math.cos(a) * (r + 8), hy = y + Math.sin(a) * (r + 8), ex = x + Math.cos(a) * (r + 92), ey = y + Math.sin(a) * (r + 92);
      c.lineCap = 'round'; c.strokeStyle = '#3b2a1c'; c.lineWidth = 20; c.beginPath(); c.moveTo(hx, hy); c.lineTo(ex, ey); c.stroke();
      c.strokeStyle = '#7a5434'; c.lineWidth = 15; c.beginPath(); c.moveTo(hx, hy); c.lineTo(ex, ey); c.stroke();
      c.strokeStyle = 'rgba(255,220,180,.35)'; c.lineWidth = 4; c.beginPath(); c.moveTo(hx + 3, hy - 4); c.lineTo(ex + 3, ey - 4); c.stroke(); c.lineCap = 'butt';
      c.strokeStyle = D.lin(c, x - r, y - r, x + r, y + r, ['#e6e8ec', '#7d838d', '#f4f5f7', '#6c727c']); c.lineWidth = 10; c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke();
      c.strokeStyle = 'rgba(29,36,51,.55)'; c.lineWidth = 1.5; c.beginPath(); c.arc(x, y, r + 5, 0, TAU); c.stroke(); c.beginPath(); c.arc(x, y, r - 5, 0, TAU); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 5; c.beginPath(); c.arc(x, y, r - 14, Math.PI * 1.1, Math.PI * 1.45); c.stroke();
    },
    // 원소 칸(주기율표 칸 모양 카드)
    cell(c, x, y, w, h, sym, num, name, o = {}) {
      c.save(); c.shadowColor = 'rgba(20,24,34,.25)'; c.shadowBlur = o.lift ? 16 : 6; c.shadowOffsetY = o.lift ? 8 : 3;
      c.fillStyle = o.bg || D.lin(c, 0, y, 0, y + h, ['#ffffff', '#eef1ec']); D.rr(c, x, y, w, h, 8); c.fill(); c.restore();
      c.strokeStyle = o.line || '#1d2433'; c.lineWidth = 2; D.rr(c, x, y, w, h, 8); c.stroke();
      D.txt(c, String(num), x + 7, y + 16, o.ncol || '#4a5366', '700 12px', 'left');
      D.txt(c, sym, x + w / 2, y + h * 0.62, o.scol || '#1d2433', `800 ${Math.round(h * 0.38)}px`);
      if (name) D.txt(c, name, x + w / 2, y + h - 7, o.ncol || '#4a5366', '600 11px');
    },
  };

  const CSS = `
section.ex .body.sim.m4-body { grid-template-columns: 1060px minmax(0, 1fr); }
.m4-stage { position: relative; border: 2px solid var(--ink); border-radius: 12px; overflow: hidden; background: #f4f1e8; }
.m4-stage canvas { touch-action: none; cursor: grab; display: block; width: 100%; height: 100%; }
.m4-stage canvas.holding { cursor: grabbing; }
section.ex .m4-panel { gap: 12px; }
.m4-pred { border: 2px solid var(--ink); border-radius: 12px; background: var(--paper-2); padding: 10px 14px 12px; flex: none; }
.m4-pred .m4-q { margin: 0 0 8px; font: 600 20px/1.45 var(--f-body); color: var(--ink); }
.m4-pred .m4-q .tg { display: inline-block; font: 800 15px/1.6 var(--f-body); color: #fff; background: var(--accent); border-radius: 999px; padding: 0 10px; margin-right: 8px; vertical-align: 2px; }
.m4-opts { display: flex; flex-wrap: wrap; gap: 8px; }
.m4-opts button { flex: 1 1 0; min-width: 0; font: 700 18px/1.3 var(--f-body); padding: 9px 6px; border: 2px solid var(--ink); border-radius: 10px; background: #fff; color: var(--ink); cursor: pointer; box-shadow: 0 3px 0 var(--ink); }
.m4-opts button[aria-pressed="true"] { background: color-mix(in srgb, var(--hl) 75%, #fff); transform: translateY(2px); box-shadow: 0 1px 0 var(--ink); }
.m4-opts button.m4-right { background: var(--good-soft); border-color: var(--good); box-shadow: 0 0 0 4px color-mix(in srgb, var(--good) 35%, transparent); }
.m4-opts button.m4-right::after { content: " ✓"; color: var(--good); font-weight: 800; }
.m4-opts button.m4-wrong { text-decoration: line-through; opacity: .75; }
.m4-opts button:disabled { cursor: default; }
.m4-pred .m4-v { display: none; margin: 8px 0 0; font: 700 18px/1.4 var(--f-body); }
.m4-pred.hit .m4-v, .m4-pred.miss .m4-v { display: block; }
.m4-pred.hit .m4-v { color: var(--good); }
.m4-pred.miss .m4-v { color: #b0412e; }
.m4-pred.nudge { animation: m4-nudge .55s ease; }
@keyframes m4-nudge { 0%, 100% { transform: none; } 25% { transform: translateX(-8px); } 75% { transform: translateX(8px); } }
.m4-out { margin: 0; font-size: 20px; line-height: 1.5; background: #fffbe6; border: 2px solid var(--accent); border-radius: 12px; padding: 8px 14px; min-height: 3.1em; flex: none; }
.m4-out b { color: var(--accent); }
.m4-tab { width: 100%; border-collapse: collapse; font: 500 17px/1.35 var(--f-body); flex: none; background: #fff; }
.m4-tab th { background: #e4ece7; font-weight: 700; text-align: left; padding: 5px 8px; border: 1.5px solid var(--ink); }
.m4-tab td { padding: 5px 8px; border: 1.5px solid var(--ink); color: var(--ink); }
.m4-tab td:first-child { font-weight: 700; white-space: nowrap; }
.m4-tab td.wait { color: var(--ink-3); }
.m4-tab tr.fill td { animation: m4-fill 1s ease; }
@keyframes m4-fill { from { background: var(--hl); } to { background: transparent; } }
.m4-panel .u-learn p { font-size: 20px; line-height: 1.5; }
.m4-panel .u-steps li { font-size: 20px; }
`;
  function inject() {
    if (document.getElementById('m34-css')) return;
    const s = document.createElement('style'); s.id = 'm34-css'; s.textContent = CSS; document.head.appendChild(s);
  }
  inject();

  const KINDS = {};
  function mount(root, kind) {
    const K = KINDS[kind]; if (!K) throw new Error('M34: 없는 종류 ' + kind);
    const VW = K.vw || 1060, VH = K.vh || 700, P = window.Play;
    const stage = root.querySelector('.m4-stage'), out = root.querySelector('.m4-out'), tb = root.querySelector('.m4-tab tbody');
    const opts = [...root.querySelectorAll('.m4-opts button')], pbox = root.querySelector('.m4-pred'), verdict = root.querySelector('.m4-v'), resetB = root.querySelector('.m4-reset');
    const nSteps = root.querySelectorAll('.u-steps li').length, tb0 = tb ? tb.innerHTML : '';
    const tf = { s: 1, ox: 0, oy: 0 };
    let st, msg = '';
    const fx = [];
    const api = {
      say(h) { if (h !== msg) { msg = h; if (out) out.innerHTML = h; } },
      ok(n) {
        if (!st.ok.includes(n)) st.ok.push(n);
        if (!nSteps || !window.L1) return;
        const cur = Array.from({ length: nSteps }, (_, i) => i + 1).find((k) => !st.ok.includes(k)) || 0;
        window.L1.steps(root, cur, st.ok); window.L1.done(root, cur === 0);
      },
      has: (n) => st.ok.includes(n),
      cell(r, col, h) {
        if (!tb) return; const tr = tb.rows[r]; if (!tr || !tr.cells[col] || tr.cells[col].innerHTML === h) return;
        tr.cells[col].innerHTML = h; tr.cells[col].classList.remove('wait'); tr.classList.remove('fill'); void tr.offsetWidth; tr.classList.add('fill');
      },
      row(r, cells) { cells.forEach((h, i) => { if (h != null) api.cell(r, i + 1, h); }); },
      // 예측 맞춰 보기: 정답 키와 한 줄 풀이
      judge(right, why = '') {
        if (st.judged) return st.pred === right; st.judged = true;
        opts.forEach((b) => { b.disabled = true; b.classList.toggle('m4-right', b.dataset.k === right); b.classList.toggle('m4-wrong', b.dataset.k === st.pred && st.pred !== right); });
        const hit = st.pred === right;
        if (pbox) { pbox.classList.toggle('hit', hit); pbox.classList.toggle('miss', !hit); }
        if (verdict) verdict.innerHTML = (hit ? '예측이 맞았다. ' : '예측과 달랐다. ') + why;
        return hit;
      },
      spark(x, y, col = '#ffd84d', n = 14, sp = 160) { for (let i = 0; i < n; i++) { const a = Math.random() * TAU, v = sp * (0.4 + Math.random() * 0.6); fx.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, t: 0, life: 0.6 + Math.random() * 0.4, col, r: 2 + Math.random() * 3 }); } },
      ring(x, y, col = 'rgba(242,183,5,.9)', R = 60) { fx.push({ ring: true, x, y, t: 0, life: 0.7, col, R }); },
      jolt() { if (window.RxT && window.RxT.jolt) window.RxT.jolt(stage, 1); },
      VW, VH,
    };
    function choose(k) {
      if (!st || st.judged) return;
      st.pred = k; opts.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === k)));
      if (st.nudged) { st.nudged = false; api.say(st.say0 || ''); }   // 예측 고르기 재촉 글을 처음 안내로 되돌린다
      api.ok(1); if (K.onPred) K.onPred(k, st, api); S.kick();
    }
    opts.forEach((b) => b.addEventListener('click', () => choose(b.dataset.k)));
    function reset() {
      st = { t: 0, touched: false, ok: [], pred: null, judged: false };
      opts.forEach((b) => { b.disabled = false; b.setAttribute('aria-pressed', 'false'); b.classList.remove('m4-right', 'm4-wrong'); });
      if (pbox) pbox.classList.remove('hit', 'miss'); if (verdict) verdict.textContent = '';
      if (tb) tb.innerHTML = tb0; fx.length = 0; msg = '';
      if (nSteps && window.L1) { window.L1.steps(root, 1, []); window.L1.done(root, false); }
      K.init(st, api); st.say0 = msg;
      if (!opts.length) api.ok(1);
    }
    const nudge = () => { if (!pbox) return; pbox.classList.remove('nudge'); void pbox.offsetWidth; pbox.classList.add('nudge'); st.nudged = true; api.say('먼저 오른쪽 <b>예측</b>에서 하나를 골라 보자. 고른 뒤에 해 보고 맞춰 본다.'); };
    const toV = (p) => ({ x: (p.x - tf.ox) / tf.s, y: (p.y - tf.oy) / tf.s });
    function frame(c, W, H, dt) {
      st.t += dt; st.dt = dt;
      tf.s = Math.min(W / VW, H / VH); tf.ox = (W - VW * tf.s) / 2; tf.oy = (H - VH * tf.s) / 2;
      c.fillStyle = K.bg || '#e9ede8'; c.fillRect(0, 0, W, H);
      c.save(); c.translate(tf.ox, tf.oy); c.scale(tf.s, tf.s);
      c.beginPath(); c.rect(0, 0, VW, VH); c.clip();
      K.draw(c, st, api, D);
      for (let i = fx.length - 1; i >= 0; i--) {
        const f = fx[i]; f.t += dt; if (f.t > f.life) { fx.splice(i, 1); continue; }
        const k = f.t / f.life;
        if (f.ring) { c.strokeStyle = f.col; c.globalAlpha = 1 - k; c.lineWidth = 4; c.beginPath(); c.arc(f.x, f.y, 10 + f.R * ease(k), 0, TAU); c.stroke(); c.globalAlpha = 1; continue; }
        f.x += f.vx * dt; f.y += f.vy * dt; f.vy += 160 * dt; c.globalAlpha = 1 - k; c.fillStyle = f.col; c.beginPath(); c.arc(f.x, f.y, f.r, 0, TAU); c.fill(); c.globalAlpha = 1;
      }
      if (!st.pred && opts.length) {
        const a = 0.75 + 0.25 * Math.sin(st.t * 4);
        c.globalAlpha = a; D.pill(c, VW - 210, K.chipY || VH - 26, '① 먼저 오른쪽에서 예측 고르기  →', 'rgba(29,36,51,.9)', '#ffd84d', '700 17px'); c.globalAlpha = 1;
      } else if (!st.touched && K.hint) {
        const h = K.hint(st); if (h) (h.tap ? D.tap(c, h.x, h.y, st.t, h.label) : D.hint(c, h.x, h.y, st.t, h.dx, h.dy, h.label, h.dist));
      }
      c.restore();
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) { frame(c, W, H, dt); },
      down(p) { const v = toV(p); if (opts.length && !st.pred) { nudge(); return; } st.touched = true; if (K.down) K.down(v, st, api); },
      move(p, e, held) { if (K.move) K.move(toV(p), st, api, held); },
      up(p) { if (opts.length && !st.pred) return; if (K.up) K.up(toV(p), st, api); },
      key(e) {
        if (opts.length && !st.pred && /^[1-9]$/.test(e.key)) { const b = opts[+e.key - 1]; if (b) { choose(b.dataset.k); return true; } }
        if (e.key === '0') { reset(); return true; }
        if (!K.key) return false; if (opts.length && !st.pred) { nudge(); return false; }
        const r = K.key(e.key, st, api); if (r) st.touched = true; return r;
      },
    });
    if (resetB) resetB.addEventListener('click', () => { reset(); S.kick(); });
    reset();
    root._m4 = {
      get st() { return st; }, api,
      pick: (k) => choose(k),
      test: (...a) => { st.touched = true; const r = K.test && K.test(st, api, ...a); S.kick(); return r; },
      run(sec) { const c = S.c; for (let i = 0; i < sec * 30; i++) frame(c, S.W, S.H, 1 / 30); },
      reset,
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.M34 = { mount, def: (k, o) => { KINDS[k] = o; }, D };
})();
