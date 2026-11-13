/* 2-2 3차시 핵산 장 공용 그림 도구(교과서 탐구 86~87쪽 모형 색: 당 보라, 인산 빨강, 염기 A 노랑·T 주황·G 초록·C 파랑·U 분홍).
   광택 구슬(인산), 입체 오각형 판(당), 퍼즐 조각 염기(A–T는 세모 돌기·홈, G–C는 둥근 돌기·홈 — 짝끼리 모양이 맞물림),
   둥근 관(골격), 빛나는 점선(수소 결합), 매끈한 카드·받침·바탕. 구슬·판 같은 무거운 그러데이션은 오프스크린에 그려 두고 다시 쓴다.
   NArt.bg(c,W,H) · ball(c,x,y,r,col) · pent(c,x,y,r,col) · base(c,x,y,len,h,k,dir,label) · tube(c,pts,col,w) · hb(c,x1,y1,x2,y2,n) · card(c,x,y,w,h,col,text,font) · tray(c,W,H,y) */
(function () {
  'use strict';
  const COL = { A: '#ffd84d', T: '#f2a03d', G: '#5cc77a', C: '#5aa9f0', U: '#f28bb5', S: '#9b6bd6', P: '#e0503f' };
  const cache = new Map();
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); const f = (v) => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
  // 한 번 그린 그림을 오프스크린에 두고 다시 쓴다(크기·색이 같으면). 2배로 그려 확대 화면에서도 매끈하게.
  function sprite(key, w, h, fn) {
    let s = cache.get(key);
    if (!s) { s = document.createElement('canvas'); s.width = Math.ceil(w * 2); s.height = Math.ceil(h * 2); const g = s.getContext('2d'); g.scale(2, 2); fn(g, w, h); cache.set(key, s); if (cache.size > 400) cache.delete(cache.keys().next().value); }
    return s;
  }
  function bg(c, W, H) {
    const s = sprite(`bg${Math.round(W)}x${Math.round(H)}`, W, H, (g) => {
      const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#16224a'); gr.addColorStop(1, '#0b1128'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      const v = g.createRadialGradient(W / 2, H * 0.4, Math.min(W, H) * 0.2, W / 2, H * 0.45, Math.max(W, H) * 0.75); v.addColorStop(0, 'rgba(90,120,200,.10)'); v.addColorStop(1, 'rgba(0,0,0,.35)'); g.fillStyle = v; g.fillRect(0, 0, W, H);
    });
    c.drawImage(s, 0, 0, W, H);
  }
  function ball(c, x, y, r, col) {
    const R = Math.round(r * 2) / 2, s = sprite(`b${col}${R}`, R * 2 + 8, R * 2 + 8, (g) => {
      const cx = R + 4, cy = R + 4;
      g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(cx + R * 0.15, cy + R * 0.25, R, R * 0.95, 0, 0, Math.PI * 2); g.fill();
      const gr = g.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R); gr.addColorStop(0, shade(col, 0.55)); gr.addColorStop(0.45, col); gr.addColorStop(1, shade(col, -0.45));
      g.fillStyle = gr; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
      g.fillStyle = 'rgba(255,255,255,.55)'; g.beginPath(); g.ellipse(cx - R * 0.35, cy - R * 0.45, R * 0.32, R * 0.2, -0.5, 0, Math.PI * 2); g.fill();
    });
    c.drawImage(s, x - R - 4, y - R - 4, R * 2 + 8, R * 2 + 8);
  }
  function pentPath(g, cx, cy, r) { g.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i / 5 * Math.PI * 2; g[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * r, cy + Math.sin(a) * r); } g.closePath(); }
  function pent(c, x, y, r, col) {
    const R = Math.round(r * 2) / 2, s = sprite(`p${col}${R}`, R * 2 + 10, R * 2 + 10, (g) => {
      const cx = R + 5, cy = R + 5;
      g.fillStyle = 'rgba(0,0,0,.3)'; pentPath(g, cx + 2, cy + 3, R); g.fill();
      const gr = g.createLinearGradient(cx - R, cy - R, cx + R, cy + R); gr.addColorStop(0, shade(col, 0.4)); gr.addColorStop(0.55, col); gr.addColorStop(1, shade(col, -0.4));
      g.fillStyle = gr; pentPath(g, cx, cy, R); g.fill();
      g.strokeStyle = shade(col, 0.6); g.lineWidth = Math.max(1.2, R * 0.1); pentPath(g, cx, cy, R * 0.92); g.stroke();
      g.strokeStyle = shade(col, -0.55); g.lineWidth = 1; pentPath(g, cx, cy, R); g.stroke();
    });
    c.drawImage(s, x - R - 5, y - R - 5, R * 2 + 10, R * 2 + 10);
  }
  // 염기 조각: 몸통이 (x,y)에서 dir 방향으로 len만큼 뻗고, 끝에 짝 모양(A·U 세모 돌기, T 세모 홈, G 둥근 돌기, C 둥근 홈)
  function basePath(g, x, y, len, h, k, dir) {
    const tip = h * 0.42, half = h / 2, e = x + dir * len, notch = k === 'T' || k === 'C', round = k === 'G' || k === 'C';
    g.beginPath(); g.moveTo(x, y - half); g.lineTo(e - dir * (notch ? 0 : 0), y - half);
    if (round) { if (notch) g.arc(e, y, tip, -Math.PI / 2, Math.PI / 2, dir > 0); else g.arc(e, y, tip, -Math.PI / 2, Math.PI / 2, dir < 0); g.lineTo(e, y + half); }
    else { g.lineTo(e, y - tip); g.lineTo(e + dir * (notch ? -tip : tip), y); g.lineTo(e, y + tip); g.lineTo(e, y + half); }
    g.lineTo(x, y + half); g.closePath();
  }
  function base(c, x, y, len, h, k, dir, label) {
    const col = COL[k] || '#ccc';
    c.save(); c.fillStyle = 'rgba(0,0,0,.28)'; basePath(c, x + 2, y + 3, len, h, k, dir); c.fill();
    const gr = c.createLinearGradient(0, y - h / 2, 0, y + h / 2); gr.addColorStop(0, shade(col, 0.45)); gr.addColorStop(0.5, col); gr.addColorStop(1, shade(col, -0.35));
    c.fillStyle = gr; basePath(c, x, y, len, h, k, dir); c.fill();
    c.strokeStyle = shade(col, -0.5); c.lineWidth = 1.2; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(Math.min(x, x + dir * len * 0.9) + 2, y - h / 2 + 2, Math.abs(len * 0.9) - 4, Math.max(1.5, h * 0.14));
    c.restore();
    if (label) window.Play.txt(c, label, x + dir * len * 0.45, y + Math.min(h * 0.3, 7), '#1d2433', `800 ${Math.round(Math.min(18, h * 0.62))}px`);
  }
  function tube(c, pts, col, w) {
    if (pts.length < 2) return;
    c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
    const path = () => { c.beginPath(); pts.forEach(([x, y], i) => c[i ? 'lineTo' : 'moveTo'](x, y)); };
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = w + 3; c.translate(1.5, 2.5); path(); c.stroke(); c.translate(-1.5, -2.5);
    c.strokeStyle = shade(col, -0.35); c.lineWidth = w; path(); c.stroke();
    c.strokeStyle = col; c.lineWidth = w * 0.6; path(); c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = Math.max(1, w * 0.18); c.translate(0, -w * 0.18); path(); c.stroke();
    c.restore();
  }
  // 수소 결합: (x1,y1)→(x2,y2) 방향으로 n줄 빛나는 점선, 줄 사이 간격 gap
  function hb(c, x1, y1, x2, y2, n, gap = 5) {
    const d = Math.hypot(x2 - x1, y2 - y1) || 1, nx = -(y2 - y1) / d, ny = (x2 - x1) / d;
    c.save(); c.strokeStyle = '#e8f6ff'; c.lineWidth = 1.6; c.setLineDash([2.5, 3]); c.shadowColor = '#7fd1ff'; c.shadowBlur = 6;
    for (let h = 0; h < n; h++) { const o = (h - (n - 1) / 2) * gap; c.beginPath(); c.moveTo(x1 + nx * o, y1 + ny * o); c.lineTo(x2 + nx * o, y2 + ny * o); c.stroke(); }
    c.restore();
  }
  function card(c, x, y, w, h, col, text, font) {
    c.save(); c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.roundRect(x - w / 2 + 1.5, y - h / 2 + 3, w, h, 8); c.fill();
    const gr = c.createLinearGradient(0, y - h / 2, 0, y + h / 2); gr.addColorStop(0, shade(col, 0.45)); gr.addColorStop(0.55, col); gr.addColorStop(1, shade(col, -0.3));
    c.fillStyle = gr; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, 8); c.fill();
    c.strokeStyle = shade(col, -0.45); c.lineWidth = 1.2; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.4)'; c.beginPath(); c.roundRect(x - w / 2 + 3, y - h / 2 + 2, w - 6, h * 0.22, 5); c.fill();
    c.restore();
    if (text) window.Play.txt(c, text, x, y + 6, '#1d2433', font || '800 18px');
  }
  function tray(c, W, H, y) {
    const gr = c.createLinearGradient(0, y, 0, H); gr.addColorStop(0, '#22305c'); gr.addColorStop(1, '#141c3a'); c.fillStyle = gr; c.fillRect(0, y, W, H - y);
    c.fillStyle = 'rgba(160,190,255,.25)'; c.fillRect(0, y, W, 1.5);
  }
  window.NArt = { COL, shade, bg, ball, pent, base, tube, hb, card, tray, sprite };
})();
