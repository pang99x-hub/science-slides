/* 1-1 2차시 체험 «투수의 공, 속력 재기»(교과서 21쪽 그림 I-4 속력). 공을 뒤로 끌었다 놓으면(새총처럼)
   당긴 만큼 빠르게 18.44 m(투수판~홈 플레이트)를 날아가고, 걸린 시간으로 속력 = 거리 ÷ 시간을 계산한다.
   화면은 실제보다 3배 느리게 보여 준다. «km/h로 바꾸기»는 × 3.6. 받는 순간 흔들림·진동.
   Pitch.mount(root) → { setActive, fit } · 시험용: root._pt.throw(m/s) · unit() */
(function () {
  'use strict';
  const D = 18.44, SLOW = 3, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function mount(root) {
    const stage = root.querySelector('.pt-stage'), cv = stage.querySelector('canvas'), c = cv.getContext('2d');
    const gun = root.querySelector('.pt-gun'), calc = root.querySelector('.pt-calc'), log = root.querySelector('.pt-log tbody'), ub = root.querySelector('.pt-unit'), now = root.querySelector('.pt-now');
    let W = 0, H = 0, pull = null, fly = null, raf = 0, kmh = false; const shots = [];
    const xa = () => W * 0.14, xb = () => W * 0.88, gy = () => H * 0.62;
    function fit() { const k = (window.Reveal && Reveal.getScale) ? Reveal.getScale() : 1; W = stage.offsetWidth; H = stage.offsetHeight; if (!W) return; const dpr = clamp((window.devicePixelRatio || 1) * k, 1, 2); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); c.setTransform(dpr, 0, 0, dpr, 0, 0); draw(); }
    function person(x, y, s, flip, col) {
      c.save(); c.translate(x, y); c.scale(flip ? -s : s, s);
      c.strokeStyle = '#1d2433'; c.lineWidth = 3; c.fillStyle = col;
      c.beginPath(); c.arc(0, -78, 13, 0, Math.PI * 2); c.fillStyle = '#f2c9a0'; c.fill(); c.stroke();
      c.fillStyle = col; c.beginPath(); c.moveTo(-14, -62); c.lineTo(14, -62); c.lineTo(12, -22); c.lineTo(-12, -22); c.closePath(); c.fill(); c.stroke();
      c.lineWidth = 6; c.beginPath(); c.moveTo(-6, -22); c.lineTo(-14, 0); c.moveTo(6, -22); c.lineTo(16, 0); c.stroke();
      c.beginPath(); c.moveTo(12, -58); c.lineTo(30, -46); c.stroke(); c.restore();
    }
    function ballAt() {
      if (fly) return [xa() + (xb() - xa()) * fly.p, gy() - 70 - Math.sin(fly.p * Math.PI) * 14];
      if (pull) return [pull.x, pull.y];
      return [xa() + 26, gy() - 70];
    }
    function draw() {
      if (!W) return;
      const sky = c.createLinearGradient(0, 0, 0, gy()); sky.addColorStop(0, '#bfe0f2'); sky.addColorStop(1, '#eaf5fb'); c.fillStyle = sky; c.fillRect(0, 0, W, H);
      c.fillStyle = '#8cc46c'; c.fillRect(0, gy(), W, H - gy());
      c.fillStyle = '#c99a62'; c.beginPath(); c.ellipse(xa(), gy() + 6, 70, 14, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#fbfcf9'; c.fillRect(xa() - 16, gy() - 2, 32, 6); c.beginPath(); c.moveTo(xb() - 16, gy()); c.lineTo(xb() + 16, gy()); c.lineTo(xb() + 16, gy() + 6); c.lineTo(xb(), gy() + 14); c.lineTo(xb() - 16, gy() + 6); c.fill();
      // 거리 화살표
      c.strokeStyle = '#1f5f4a'; c.lineWidth = 3; c.setLineDash([10, 8]); c.beginPath(); c.moveTo(xa(), gy() + 46); c.lineTo(xb(), gy() + 46); c.stroke(); c.setLineDash([]);
      c.fillStyle = '#1f5f4a'; c.font = '800 24px "IBM Plex Sans KR", sans-serif'; c.textAlign = 'center'; c.fillText('18.44 m', (xa() + xb()) / 2, gy() + 80);
      c.font = '600 18px "IBM Plex Sans KR", sans-serif'; c.fillStyle = '#1d2433'; c.fillText('투수판', xa(), gy() + 110); c.fillText('홈 플레이트', xb(), gy() + 110);
      person(xa(), gy(), 1.1, false, '#2a73b8'); person(xb() + 30, gy(), 1.05, true, '#4a5468');
      c.fillStyle = '#7a5234'; c.beginPath(); c.arc(xb() - 2, gy() - 64, 16, 0, Math.PI * 2); c.fill();
      // 당기는 고무줄
      const [bx, by] = ballAt();
      if (pull) { c.strokeStyle = '#d9483b'; c.lineWidth = 3; c.beginPath(); c.moveTo(xa() + 26, gy() - 70); c.lineTo(bx, by); c.stroke(); c.fillStyle = '#d9483b'; c.font = '700 20px "IBM Plex Sans KR", sans-serif'; c.fillText(`힘 ${Math.round(pullPow() * 100)}%`, bx, by - 30); }
      if (fly && fly.p > 0) { c.strokeStyle = 'rgba(29,36,51,.18)'; c.lineWidth = 6; c.beginPath(); c.moveTo(xa() + 26, gy() - 70); c.lineTo(bx, by); c.stroke(); }
      c.fillStyle = '#fff'; c.strokeStyle = '#1d2433'; c.lineWidth = 2.5; c.beginPath(); c.arc(bx, by, 11, 0, Math.PI * 2); c.fill(); c.stroke();
      c.strokeStyle = '#d9483b'; c.lineWidth = 2; c.beginPath(); c.arc(bx - 4, by, 7, -1, 1); c.stroke();
      if (!pull && !fly) { c.fillStyle = '#1d2433'; c.font = '700 20px "IBM Plex Sans KR", sans-serif'; c.fillText('← 공을 뒤로 끌었다 놓기', xa() + 150, gy() - 120); }
    }
    const pullPow = () => (pull ? clamp(Math.hypot(pull.x - (xa() + 26), pull.y - (gy() - 70)) / 160, 0.15, 1) : 0);
    const xy = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * H / r.height]; };
    cv.addEventListener('pointerdown', (e) => { if (fly) return; const [x, y] = xy(e); if (Math.hypot(x - xa() - 26, y - gy() + 70) > 70) return; pull = { x, y }; try { cv.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ } draw(); });
    cv.addEventListener('pointermove', (e) => { if (!pull) return; const [x, y] = xy(e); pull.x = Math.min(x, xa() + 26); pull.y = y; draw(); });
    const release = () => { if (!pull) return; const v = 18 + pullPow() * 27; pull = null; throwIt(v); };
    cv.addEventListener('pointerup', release); cv.addEventListener('pointercancel', () => { pull = null; draw(); });
    cv.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); throwIt(36); } });
    const show = (v) => (kmh ? `${(v * 3.6).toFixed(0)} km/h` : `${v.toFixed(1)} m/s`);
    function throwIt(v) {
      if (fly) return;
      const t = D / v, dur = t * SLOW * 1000, t0 = performance.now(); fly = { p: 0 };
      gun.textContent = '…'; calc.textContent = '공이 날아가는 중… (화면은 3배 느리게)';
      const tick = (n) => {
        fly.p = reduce() ? 1 : clamp((n - t0) / dur, 0, 1); draw();
        if (fly.p < 1) { raf = requestAnimationFrame(tick); return; }
        raf = 0; fly = null; draw();
        if (window.RxT && window.RxT.jolt) window.RxT.jolt(stage, v > 38 ? 2 : 1);
        shots.push({ v, t }); render();
      };
      raf = requestAnimationFrame(tick);
    }
    function render() {
      const last = shots[shots.length - 1];
      if (last) {
        gun.textContent = show(last.v);
        calc.innerHTML = `속력 = <b>거리</b> ÷ <b>시간</b> = 18.44 m ÷ ${last.t.toFixed(2)} s ≈ <b>${last.v.toFixed(1)} m/s</b>${kmh ? `<br>× 3.6 → <b>${(last.v * 3.6).toFixed(0)} km/h</b> (1 m/s = 3.6 km/h)` : ''}`;
      }
      log.innerHTML = shots.slice(-4).map((s, i) => `<tr><td>${shots.length - Math.min(4, shots.length) + i + 1}번</td><td>${s.t.toFixed(2)} s</td><td>${show(s.v)}</td></tr>`).join('');
      const vs = shots.map((s) => s.v), ok = [];
      if (shots.length) ok.push(1); if (vs.length >= 2 && Math.max(...vs) - Math.min(...vs) >= 5) ok.push(2); if (kmh && shots.length) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      now.textContent = st === 1 ? '① 공을 뒤로 끌었다 놓아 던지자' : st === 2 ? '② 더 세게(또는 약하게) 던져 시간과 속력을 비교하자' : st === 3 ? '③ «km/h로 바꾸기»를 눌러 보자' : '같은 거리를 짧은 시간에 갈수록 빠르다';
      now.classList.toggle('done', st === 0);
    }
    ub.addEventListener('click', () => { kmh = !kmh; ub.setAttribute('aria-pressed', String(kmh)); ub.textContent = kmh ? 'm/s로 보기' : 'km/h로 바꾸기'; render(); });
    render();
    root._pt = { throw: throwIt, unit: () => ub.click() };
    return { setActive(on) { if (on) fit(); else if (raf) { cancelAnimationFrame(raf); raf = 0; fly = null; } }, fit };
  }
  window.Pitch = { mount };
})();
