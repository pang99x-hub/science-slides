/* 2차시가 함께 쓰는 초콜릿·도화지·고무장갑 그리기(교과서 22쪽 탐구 준비물). */
(function () {
  'use strict';
  const K = window.EvKit;
  const COL = { red: [214, 46, 58], yellow: [244, 198, 44], green: [44, 156, 88], blue: [40, 98, 200], brown: [118, 72, 40] };
  const NAME = { red: '빨강', yellow: '노랑', green: '초록', blue: '파랑', brown: '갈색' };
  const PAPER = [247, 214, 86];
  function choco(c, x, y, r, rgb, a = 1) {
    c.save(); c.globalAlpha = a;
    c.fillStyle = 'rgba(60,40,10,.28)'; c.beginPath(); c.ellipse(x + r * 0.18, y + r * 0.32, r * 1.02, r * 0.8, 0, 0, 7); c.fill();
    const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r * 1.05);
    g.addColorStop(0, K.hex(K.mix(rgb, [255, 255, 255], 0.45))); g.addColorStop(0.45, K.hex(rgb)); g.addColorStop(1, K.hex(K.mix(rgb, [0, 0, 0], 0.32)));
    c.fillStyle = g; c.beginPath(); c.ellipse(x, y, r, r * 0.9, 0, 0, 7); c.fill();
    c.strokeStyle = K.hex(K.mix(rgb, [0, 0, 0], 0.45)); c.lineWidth = 1.4; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(x - r * 0.38, y - r * 0.42, r * 0.28, r * 0.16, -0.5, 0, 7); c.fill();
    c.restore();
  }
  function table(c, w, h) {
    const g = c.createLinearGradient(0, 0, w, h); g.addColorStop(0, '#c9a77c'); g.addColorStop(1, '#b48f62');
    c.fillStyle = g; c.fillRect(0, 0, w, h);
    c.strokeStyle = 'rgba(90,60,30,.15)'; c.lineWidth = 2;
    for (let y = 12; y < h; y += 26) { c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(w * 0.3, y + 6, w * 0.6, y - 6, w, y + 3); c.stroke(); }
  }
  function paper(c, x, y, w, h, rgb) {
    c.fillStyle = 'rgba(40,25,10,.25)'; c.fillRect(x + 6, y + 8, w, h);
    c.fillStyle = K.hex(rgb); c.fillRect(x, y, w, h);
    c.strokeStyle = K.hex(K.mix(rgb, [0, 0, 0], 0.2)); c.lineWidth = 2; c.strokeRect(x, y, w, h);
  }
  // 고무장갑 낀 손(위에서 내려다본 모양). open 0~1: 손가락 벌림
  function glove(c, x, y, ang, open) {
    c.save(); c.translate(x, y); c.rotate(ang);
    c.fillStyle = '#eef1f4'; c.strokeStyle = '#1d2433'; c.lineWidth = 2.5;
    c.beginPath(); c.roundRect(-26, 10, 52, 120, 18); c.fill(); c.stroke();
    c.beginPath(); c.roundRect(-30, -24, 60, 56, 20); c.fill(); c.stroke();
    const sp = 4 + open * 8;
    [-1.5, -0.5, 0.5, 1.5].forEach((k, i) => { c.beginPath(); c.roundRect(k * (11 + open * 3) - 6, -58 - (i === 1 || i === 2 ? 6 : 0) + open * 4, 12, 40, 6); c.fill(); c.stroke(); void sp; });
    c.beginPath(); c.roundRect(24, -14, 14, 34, 7); c.fill(); c.stroke();
    c.restore();
  }
  const vis = (rgb, bg) => K.dE(rgb, bg);
  window.EvChoco = { COL, NAME, PAPER, choco, table, paper, glove, vis };
})();
