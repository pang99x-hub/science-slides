/* 1-2 1차시 체험 «어림 챌린지»(교과서 28쪽 어림과 측정). 화면에 나온 연필의 길이를 눈으로 어림해 막대로 고른 뒤
   «자로 재기»를 누르면 자가 미끄러져 들어와 실제 길이(0.1 cm까지)와 오차가 나온다. 세 번 하고 오차를 견준다.
   연필은 화면 기준 길이(1 cm = 이 화면의 한 칸)라 실제 자와는 다르다. Guess.mount(root) → { fit } · 시험용: root._gs.guess(cm) · measure() · next() */
(function () {
  'use strict';
  const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const LENS = [11.6, 6.3, 15.8];
  function mount(root) {
    const stage = root.querySelector('.gs-stage'), cv = stage.querySelector('canvas'), c = cv.getContext('2d');
    const range = root.querySelector('.gs-range'), val = root.querySelector('.gs-val'), mB = root.querySelector('.gs-measure'), nB = root.querySelector('.gs-next'), log = root.querySelector('.gs-log tbody'), now = root.querySelector('.gs-now');
    let W = 0, H = 0, round = 0, est = 10, shown = false, rulerX = 1, raf = 0; const rec = [];
    const PX = () => Math.min(W / 22, 52);      // 1 cm(화면 기준)
    function fit() { const k = (window.Reveal && Reveal.getScale) ? Reveal.getScale() : 1; W = stage.offsetWidth; H = stage.offsetHeight; if (!W) return; const dpr = Math.max(1, Math.min(2, (window.devicePixelRatio || 1) * k)); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); c.setTransform(dpr, 0, 0, dpr, 0, 0); draw(); }
    function pencil(x, y, len) {
      const h = PX() * 0.75;
      c.fillStyle = '#f2c230'; c.strokeStyle = '#1d2433'; c.lineWidth = 2.5;
      c.beginPath(); c.moveTo(x, y - h / 2); c.lineTo(x + len - h * 1.4, y - h / 2); c.lineTo(x + len, y); c.lineTo(x + len - h * 1.4, y + h / 2); c.lineTo(x, y + h / 2); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#f0d9b0'; c.beginPath(); c.moveTo(x + len - h * 1.4, y - h / 2); c.lineTo(x + len, y); c.lineTo(x + len - h * 1.4, y + h / 2); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#1d2433'; c.beginPath(); c.moveTo(x + len - h * 0.45, y - h * 0.16); c.lineTo(x + len, y); c.lineTo(x + len - h * 0.45, y + h * 0.16); c.fill();
      c.fillStyle = '#e88a9a'; c.fillRect(x - h * 0.8, y - h / 2, h * 0.8, h); c.strokeRect(x - h * 0.8, y - h / 2, h * 0.8, h);
      c.fillStyle = '#c3cbd3'; c.fillRect(x - 2, y - h / 2, 8, h);
    }
    function draw() {
      if (!W) return;
      c.fillStyle = '#e9e1cf'; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 9; i++) { c.strokeStyle = 'rgba(122,90,52,.12)'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, i * H / 8); c.bezierCurveTo(W * .3, i * H / 8 + 20, W * .6, i * H / 8 - 20, W, i * H / 8 + 10); c.stroke(); }
      const x0 = W * 0.08, y = H * 0.42, L = LENS[round] * PX();
      pencil(x0, y, L);
      // 어림 표시(파란 화살표)
      const ex = x0 + est * PX();
      c.strokeStyle = '#2a73b8'; c.lineWidth = 4; c.setLineDash([10, 8]); c.beginPath(); c.moveTo(x0, y - PX() * 1.6); c.lineTo(ex, y - PX() * 1.6); c.stroke(); c.setLineDash([]);
      c.fillStyle = '#2a73b8'; c.beginPath(); c.moveTo(ex, y - PX() * 1.6); c.lineTo(ex - 14, y - PX() * 1.6 - 9); c.lineTo(ex - 14, y - PX() * 1.6 + 9); c.fill();
      c.font = '700 22px "IBM Plex Sans KR", sans-serif'; c.fillText(`내 어림 ${est.toFixed(1)} cm`, x0, y - PX() * 1.6 - 16);
      // 자(밑에서 미끄러져 들어온다)
      if (rulerX < 1) {
        const rx = x0 + rulerX * W, ry = y + PX() * 0.75, rl = PX() * 20;
        c.fillStyle = '#f7f1d9'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.fillRect(rx, ry, rl, PX() * 1.3); c.strokeRect(rx, ry, rl, PX() * 1.3);
        for (let k = 0; k <= 200; k++) { const xx = rx + k * PX() / 10, t = k % 10 === 0 ? PX() * .55 : k % 5 === 0 ? PX() * .38 : PX() * .22; c.beginPath(); c.moveTo(xx, ry); c.lineTo(xx, ry + t); c.lineWidth = k % 10 ? 1 : 2; c.stroke(); if (k % 10 === 0) { c.fillStyle = '#1d2433'; c.font = '600 16px "IBM Plex Mono", monospace'; c.textAlign = 'center'; c.fillText(String(k / 10), xx, ry + PX() * 1.1); c.textAlign = 'left'; } }
        if (shown && rulerX === 0) { c.strokeStyle = '#d9483b'; c.lineWidth = 3; c.beginPath(); c.moveTo(x0 + L, y - PX()); c.lineTo(x0 + L, ry + PX() * 1.4); c.stroke(); c.fillStyle = '#d9483b'; c.font = '800 24px "IBM Plex Sans KR", sans-serif'; c.fillText(`자로 잰 길이 ${LENS[round].toFixed(1)} cm`, x0 + L + 10, ry + PX() * 2.1); }
      }
    }
    function steps() {
      const ok = []; if (rec.length >= 1) ok.push(1); if (rec.length >= 2) ok.push(2); if (rec.length >= 3) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      now.textContent = st ? `${round + 1}번째 연필 · 막대로 어림한 뒤 «자로 재기»` : '어림과 측정의 차이를 견줘 보자';
      now.classList.toggle('done', st === 0);
    }
    range.addEventListener('input', () => { if (shown) return; est = +range.value; val.textContent = `${est.toFixed(1)} cm`; draw(); });
    function measure() {
      if (shown) return; shown = true; mB.disabled = true; range.disabled = true;
      const fin = () => { rulerX = 0; draw(); const real = LENS[round], err = Math.abs(est - real); rec.push({ est, real, err }); const tr = document.createElement('tr'); tr.innerHTML = `<td>${rec.length}번</td><td>${est.toFixed(1)} cm</td><td>${real.toFixed(1)} cm</td><td class="${err <= 0.5 ? 'ok' : err <= 2 ? 'mid' : 'no'}">${err.toFixed(1)} cm</td>`; log.appendChild(tr); nB.disabled = rec.length >= 3; steps(); };
      if (reduce()) { fin(); return; }
      const t0 = performance.now(); const tick = (t) => { const p = Math.min(1, (t - t0) / 700); rulerX = 1 - (1 - Math.pow(1 - p, 3)); draw(); if (p < 1) raf = requestAnimationFrame(tick); else fin(); }; raf = requestAnimationFrame(tick);
    }
    function next() { if (rec.length >= 3 || !shown) return; round += 1; shown = false; rulerX = 1; est = 10; range.value = '10'; val.textContent = '10.0 cm'; range.disabled = false; mB.disabled = false; nB.disabled = true; draw(); steps(); }
    mB.addEventListener('click', measure); nB.addEventListener('click', next);
    nB.disabled = true; val.textContent = '10.0 cm'; steps();
    root._gs = { guess: (v) => { range.value = String(v); range.dispatchEvent(new Event('input')); }, measure, next };
    return { setActive(on) { if (on) fit(); else if (raf) cancelAnimationFrame(raf); }, fit };
  }
  window.Guess = { mount };
})();
