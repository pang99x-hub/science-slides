/* 1-2 2차시 체험 «질량으로 시간을 재는 액체 타이머»(교과서 39쪽 창의력 키움 활동). 구멍 크기(1초에 떨어지는 양)와 처음 물의 양을 정하고
   «시작»하면 물이 전자저울 위 컵으로 떨어지며 저울 숫자(디지털)와 질량-시간 그래프가 함께 자란다. 1분에 맞춰 다 떨어지면 성공,
   10초마다의 질량이 표에 남는다(그 질량을 보면 지난 시간을 안다). 화면은 4배 빠르게, 흐름은 일정하다고 본 단순한 예.
   Timer.mount(root) → { setActive, fit } · 시험용: root._tm.set(구멍, g) · run() */
(function () {
  'use strict';
  const HOLE = { s: [1.5, '작게'], m: [3, '중간'], l: [5, '크게'] }, FAST = 4;
  function mount(root) {
    const stage = root.querySelector('.tm-stage'), cv = stage.querySelector('canvas'), c = cv.getContext('2d');
    const holes = [...root.querySelectorAll('.tm-hole button')], gR = root.querySelector('.tm-g'), gV = root.querySelector('.tm-gv'), runB = root.querySelector('.tm-run'), msg = root.querySelector('.tm-msg'), tb = root.querySelector('.tm-tab tbody'), now = root.querySelector('.tm-now');
    let W = 0, H = 0, hole = 'm', G = 120, t = 0, running = false, raf = 0, last = 0, ok1 = false, tries = 0;
    const rate = () => HOLE[hole][0], end = () => G / rate();
    function fit() { const k = (window.Reveal && Reveal.getScale) ? Reveal.getScale() : 1; W = stage.offsetWidth; H = stage.offsetHeight; if (!W) return; const d = Math.max(1, Math.min(2, (window.devicePixelRatio || 1) * k)); cv.width = Math.round(W * d); cv.height = Math.round(H * d); c.setTransform(d, 0, 0, d, 0, 0); draw(); }
    function draw() {
      if (!W) return;
      c.fillStyle = '#f4f1ea'; c.fillRect(0, 0, W, H);
      const ax = W * 0.04, aw = W * 0.38;
      const left = Math.max(0, G - rate() * t), fallen = G - left;
      // 위 통
      const tx = ax + aw * 0.2, tw = aw * 0.6, ty = H * 0.08, th = H * 0.34;
      c.fillStyle = '#fff'; c.strokeStyle = '#1d2433'; c.lineWidth = 3; c.fillRect(tx, ty, tw, th); c.strokeRect(tx, ty, tw, th);
      const lh = th * left / 300; c.fillStyle = '#9fd1f2'; c.fillRect(tx + 2, ty + th - lh, tw - 4, lh);
      c.fillStyle = '#1d2433'; c.fillRect(tx + tw / 2 - (hole === 's' ? 3 : hole === 'm' ? 6 : 10), ty + th, hole === 's' ? 6 : hole === 'm' ? 12 : 20, 6);
      if (running && left > 0) { c.strokeStyle = '#5aa9dd'; c.lineWidth = hole === 's' ? 2 : hole === 'm' ? 4 : 7; c.beginPath(); c.moveTo(tx + tw / 2, ty + th + 6); c.lineTo(tx + tw / 2, H * 0.7); c.stroke(); }
      // 아래 컵 + 전자저울
      const cy0 = H * 0.58, ch = H * 0.16; c.fillStyle = '#fff'; c.fillRect(tx + 10, cy0, tw - 20, ch); c.strokeRect(tx + 10, cy0, tw - 20, ch);
      const fh = ch * fallen / 300; c.fillStyle = '#9fd1f2'; c.fillRect(tx + 12, cy0 + ch - fh, tw - 24, fh);
      c.fillStyle = '#c3cbd3'; c.fillRect(tx - 10, cy0 + ch, tw + 20, H * 0.1); c.strokeRect(tx - 10, cy0 + ch, tw + 20, H * 0.1);
      c.fillStyle = '#1d2433'; c.fillRect(tx + tw / 2 - 60, cy0 + ch + H * 0.02, 120, H * 0.06);
      c.fillStyle = '#7fe08a'; c.font = '800 24px "IBM Plex Mono", monospace'; c.textAlign = 'center'; c.fillText(`${fallen.toFixed(1)} g`, tx + tw / 2, cy0 + ch + H * 0.07);
      c.fillStyle = '#1d2433'; c.font = '700 18px "IBM Plex Sans KR", sans-serif'; c.fillText('전자저울', tx + tw / 2, cy0 + ch + H * 0.15);
      // 그래프
      const gx = W * 0.5, gw = W * 0.46, gy = H * 0.08, gh = H * 0.7, Tm = 90, Gm = 300;
      c.fillStyle = '#fff'; c.fillRect(gx, gy, gw, gh); c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.strokeRect(gx, gy, gw, gh);
      c.strokeStyle = '#e1e6e1'; for (let s = 10; s < Tm; s += 10) { const x = gx + s / Tm * gw; c.beginPath(); c.moveTo(x, gy); c.lineTo(x, gy + gh); c.stroke(); }
      const x60 = gx + 60 / Tm * gw; c.strokeStyle = '#d9483b'; c.setLineDash([8, 6]); c.beginPath(); c.moveTo(x60, gy); c.lineTo(x60, gy + gh); c.stroke(); c.setLineDash([]);
      c.fillStyle = '#d9483b'; c.font = '700 17px "IBM Plex Sans KR", sans-serif'; c.textAlign = 'center'; c.fillText('1분', x60, gy - 6);
      c.fillStyle = '#4a5468'; c.textAlign = 'left'; c.fillText('컵의 질량(g)', gx + 6, gy + 18); c.textAlign = 'right'; c.fillText('지난 시간(초)', gx + gw, gy + gh + 46);
      c.textAlign = 'center'; for (let s = 0; s <= Tm; s += 30) c.fillText(String(s), gx + s / Tm * gw, gy + gh + 22);
      c.strokeStyle = '#2a73b8'; c.lineWidth = 4; c.beginPath(); const tt = Math.min(t, Tm);
      for (let k = 0; k <= 60; k++) { const s = tt * k / 60, m = Math.min(G, rate() * s), x = gx + s / Tm * gw, y = gy + gh - m / Gm * gh; k ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
      c.fillStyle = '#1d2433'; c.font = '700 20px "IBM Plex Mono", monospace'; c.textAlign = 'right'; c.fillText(`${Math.min(t, 99).toFixed(1)} s`, gx + gw - 10, gy + 24);
    }
    function table() {
      tb.innerHTML = [10, 20, 30, 40, 50, 60].map((s) => `<td>${Math.min(G, rate() * s).toFixed(0)} g</td>`).join('').replace(/^/, '<tr>') + '</tr>';
    }
    function steps() {
      const ok = []; if (tries) ok.push(1); if (ok1) ok.push(2, 3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      now.textContent = st === 1 ? '① 구멍과 물의 양을 정하고 «시작»' : st === 2 ? '② 딱 1분에 다 떨어지게 맞춰 보자' : '10초마다의 질량을 보면 지난 시간을 안다';
      now.classList.toggle('done', st === 0);
    }
    function run() {
      if (running) return; running = true; t = 0; tries += 1; runB.disabled = true; msg.className = 'u-msg'; msg.textContent = '떨어지는 중… (화면은 4배 빠르게)';
      last = performance.now();
      const tick = (ts) => {
        const dt = (ts - last) / 1000 * FAST; last = ts; t += dt; draw();
        if (t < Math.max(end(), 0) + 0.2 && t < 90) { raf = requestAnimationFrame(tick); return; }
        running = false; runB.disabled = false; t = Math.min(end(), 90); draw();
        const e = end();
        if (Math.abs(e - 60) <= 3) { ok1 = true; msg.className = 'u-msg ok'; msg.innerHTML = `${e.toFixed(0)}초 만에 다 떨어졌다 — <b>1분 타이머 성공!</b> 아래 표의 질량이 곧 시각 눈금`; table(); }
        else { msg.className = 'u-msg no'; msg.textContent = `${e > 90 ? '90초가 넘도록' : e.toFixed(0) + '초 만에'} 다 떨어졌다. ${e > 60 ? '구멍을 키우거나 물을 줄이자' : '구멍을 줄이거나 물을 늘리자'} (1초에 ${rate()} g씩 떨어진다)`; }
        steps();
      };
      raf = requestAnimationFrame(tick);
    }
    holes.forEach((b) => b.addEventListener('click', () => { if (running) return; hole = b.dataset.h; holes.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); t = 0; draw(); }));
    gR.addEventListener('input', () => { if (running) return; G = +gR.value; gV.textContent = `${G} g`; t = 0; draw(); });
    runB.addEventListener('click', run);
    gR.value = String(G); gV.textContent = `${G} g`; steps();
    root._tm = { set: (h, g) => { holes.find((b) => b.dataset.h === h).click(); gR.value = String(g); gR.dispatchEvent(new Event('input')); }, run };
    return { setActive(on) { if (on) fit(); else if (raf) { cancelAnimationFrame(raf); running = false; runB.disabled = false; } }, fit };
  }
  window.Timer = { mount };
})();
