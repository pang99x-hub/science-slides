/* 1-2 2차시 표지 «스마트워치의 심박수»(교과서 32쪽 도입). 손목 그림의 센서 자리를 누르고 있으면 초록 빛이 깜빡이고,
   혈관을 지나는 피의 양에 따라 되돌아오는 빛이 오르내리는 파형이 그려진다. 6초 동안 봉우리를 세어 1분 심박수를 낸다.
   심박수(72회/분)는 이해를 돕기 위한 예. Pulse.mount(root) → { setActive, fit } · 시험용: root._pu.hold(초) */
(function () {
  'use strict';
  const BPM = 72, WIN = 6;
  function mount(root) {
    const stage = root.querySelector('.pu-stage'), cv = stage.querySelector('canvas'), c = cv.getContext('2d'), now = root.querySelector('.pu-now'), out = root.querySelector('.pu-out');
    let W = 0, H = 0, holding = false, t = 0, raf = 0, last = 0, beats = 0, done = false; const pts = [];
    function fit() { const k = (window.Reveal && Reveal.getScale) ? Reveal.getScale() : 1; W = stage.offsetWidth; H = stage.offsetHeight; if (!W) return; const d = Math.max(1, Math.min(2, (window.devicePixelRatio || 1) * k)); cv.width = Math.round(W * d); cv.height = Math.round(H * d); c.setTransform(d, 0, 0, d, 0, 0); draw(); }
    const ppg = (x) => { const p = (x * BPM / 60) % 1; return Math.exp(-Math.pow((p - 0.18) / 0.07, 2)) + 0.35 * Math.exp(-Math.pow((p - 0.45) / 0.09, 2)); };
    function draw() {
      if (!W) return;
      c.fillStyle = '#f6f1ea'; c.fillRect(0, 0, W, H);
      // 손목과 시계(뒷면이 보이게)
      const cx = W * 0.26, cy = H * 0.5;
      c.fillStyle = '#f2c9a0'; c.strokeStyle = '#8a5a32'; c.lineWidth = 3; c.beginPath(); c.roundRect(cx - 95, -20, 190, H + 40, 80); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(42,115,184,.55)'; c.lineWidth = 6; c.beginPath(); c.moveTo(cx - 30, 0); c.bezierCurveTo(cx - 10, H * .3, cx - 50, H * .6, cx - 20, H); c.stroke();
      c.fillStyle = '#1d2433'; c.beginPath(); c.roundRect(cx - 80, cy - 90, 160, 180, 34); c.fill();
      c.fillStyle = '#2b3a4a'; c.beginPath(); c.arc(cx, cy, 52, 0, Math.PI * 2); c.fill();
      const on = holding && Math.floor(t * 12) % 2 === 0;
      [[-18, -16], [18, -16], [0, 20]].forEach(([dx, dy]) => { c.fillStyle = holding ? (on ? '#5dff8a' : '#1f8a3e') : '#21442c'; c.beginPath(); c.arc(cx + dx, cy + dy, 9, 0, Math.PI * 2); c.fill(); if (on) { c.fillStyle = 'rgba(93,255,138,.25)'; c.beginPath(); c.arc(cx + dx, cy + dy, 22, 0, Math.PI * 2); c.fill(); } });
      c.fillStyle = '#9fd1f2'; c.beginPath(); c.arc(cx, cy + 2, 7, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#fbfcf9'; c.font = '700 18px "IBM Plex Sans KR", sans-serif'; c.textAlign = 'center'; c.fillText(holding ? '빛 센서 작동 중' : '여기를 누르고 있기', cx, cy + 112);
      // 파형
      const gx = W * 0.5, gw = W * 0.46, gy = H * 0.2, gh = H * 0.5;
      c.fillStyle = '#fff'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.fillRect(gx, gy, gw, gh); c.strokeRect(gx, gy, gw, gh);
      c.fillStyle = '#4a5468'; c.font = '600 17px "IBM Plex Sans KR", sans-serif'; c.textAlign = 'left'; c.fillText('되돌아온 빛의 세기', gx + 8, gy - 8); c.textAlign = 'right'; c.fillText(`시간(${WIN}초)`, gx + gw, gy + gh + 22);
      c.strokeStyle = '#2f8a4a'; c.lineWidth = 3; c.beginPath();
      pts.forEach(([x, y], i) => { const px = gx + x / WIN * gw, py = gy + gh * 0.85 - y * gh * 0.65; i ? c.lineTo(px, py) : c.moveTo(px, py); }); c.stroke();
    }
    function frame(ts) {
      raf = 0; const dt = Math.min(0.05, (ts - last) / 1000 || 0.016); last = ts;
      if (holding && !done) { t += dt; pts.push([t, ppg(t)]); if (Math.floor((t - dt) * BPM / 60) !== Math.floor(t * BPM / 60)) beats += 1; if (t >= WIN) finish(); }
      draw(); say();
      if (holding && !done) raf = requestAnimationFrame(frame);
    }
    function finish() { done = true; holding = false; out.innerHTML = `${WIN}초 동안 봉우리 <b>${beats}개</b> → 1분이면 ${beats} × 10 = <b>${beats * 10}회</b>`; root.dispatchEvent(new CustomEvent('pu-done')); }
    function say() { now.textContent = done ? '빛의 변화(신호)를 재어 심박수(정보)를 알아냈다' : holding ? `측정 중… ${t.toFixed(1)}초` : '손목 시계의 센서를 꾹 누르고 있자'; now.classList.toggle('done', done); }
    const start = (e) => { if (done) return; const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width; if (x > W * 0.45) return; holding = true; last = performance.now(); if (!raf) raf = requestAnimationFrame(frame); };
    const stop = () => { holding = false; draw(); say(); };
    cv.addEventListener('pointerdown', start); cv.addEventListener('pointerup', stop); cv.addEventListener('pointerleave', stop); cv.addEventListener('pointercancel', stop);
    cv.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); if (!holding) { holding = true; last = performance.now(); raf = requestAnimationFrame(frame); } } });
    cv.addEventListener('keyup', stop);
    root.querySelector('.pu-again').addEventListener('click', () => { t = 0; beats = 0; done = false; pts.length = 0; out.textContent = ''; draw(); say(); });
    say();
    root._pu = { hold: (sec) => { done = false; while (t < Math.min(sec, WIN)) { t += 0.02; pts.push([t, ppg(t)]); if (Math.floor((t - 0.02) * BPM / 60) !== Math.floor(t * BPM / 60)) beats += 1; } if (t >= WIN) finish(); draw(); say(); } };
    return { setActive(on) { if (on) fit(); }, fit };
  }
  window.Pulse = { mount };
})();
