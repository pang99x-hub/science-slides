/* 2-1 1차시 체험 «우주 배경 복사»(교과서 52쪽 그림 Ⅱ-6). 시간 막대(빅뱅 후 30만~45만 년)를 밀어 본다.
   38만 년 전: 전자가 따로 떠다녀 빛(노란 알갱이)이 이리저리 부딪혀 갇힌다(뿌연 우주).
   38만 년(약 3000 K): 전자가 원자핵에 붙잡혀 원자가 되고, 빛이 곧게 퍼져 오른쪽 «지금의 망원경»에 닿는다 = 우주 배경 복사.
   온도 값은 이해를 돕기 위한 예(38만 년 = 약 3000 K만 교과서 값). CMB.mount(root) → { fit, setActive } · 시험용: root._cm.set(만 년) · zoom() */
(function () {
  'use strict';
  const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function mount(root) {
    const stage = root.querySelector('.cm-stage'), cv = stage.querySelector('canvas'), c = cv.getContext('2d');
    const range = root.querySelector('.cm-range') || document.createElement('input'), out = root.querySelector('.cm-out'), now = root.querySelector('.cm-now'), fig = root.querySelector('.cm-photo');
    let moved = false, W = 0, H = 0, t = 30, raf = 0, active = false, hits = 0, sawFog = false, sawClear = false, zoomed = false;
    const NUC = [], EL = [], PH = [];
    for (let i = 0; i < 12; i++) NUC.push({ x: 0.08 + (i % 4) * 0.2 + (i % 3) * 0.03, y: 0.18 + Math.floor(i / 4) * 0.3 + (i % 2) * 0.06, he: i % 4 === 1 });
    NUC.forEach((n, i) => EL.push({ n, x: Math.random() * 0.8, y: Math.random(), vx: (Math.random() - 0.5) * 0.004, vy: (Math.random() - 0.5) * 0.004, a: i }));
    for (let i = 0; i < 26; i++) PH.push({ x: Math.random() * 0.8, y: Math.random(), d: Math.random() * Math.PI * 2 });
    function fit() {
      const k = (window.Reveal && Reveal.getScale) ? Reveal.getScale() : 1;
      W = stage.offsetWidth; H = stage.offsetHeight; if (!W) return;
      const dpr = Math.max(1, Math.min(2, (window.devicePixelRatio || 1) * k));
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); c.setTransform(dpr, 0, 0, dpr, 0, 0); draw();
    }
    const clear = () => t >= 38;
    function step() {
      PH.forEach((p) => {
        if (clear()) { p.d = 0; p.x += 0.006; if (p.x > 0.86) { p.x = 0; p.y = Math.random(); hits++; } }
        else { p.x += Math.cos(p.d) * 0.005; p.y += Math.sin(p.d) * 0.005; if (Math.random() < 0.08) p.d = Math.random() * Math.PI * 2; if (p.x < 0 || p.x > 0.84) p.d = Math.PI - p.d; if (p.y < 0.03 || p.y > 0.97) p.d = -p.d; p.x = Math.max(0, Math.min(0.84, p.x)); }
      });
      EL.forEach((e) => { if (clear()) { e.a += 0.06; } else { e.x += e.vx; e.y += e.vy; if (e.x < 0.02 || e.x > 0.82) e.vx *= -1; if (e.y < 0.04 || e.y > 0.96) e.vy *= -1; } });
    }
    function draw() {
      if (!W) return;
      const fog = clear() ? 0 : 0.35;
      c.fillStyle = clear() ? '#0f1630' : '#4a2a1a'; c.fillRect(0, 0, W, H);
      const X = (v) => v * W, Y = (v) => v * H;
      NUC.forEach((n) => {
        const x = X(n.x), y = Y(n.y);
        if (n.he) { [[-5, -5, '#e0503f'], [5, -5, '#a7adb5'], [-5, 5, '#a7adb5'], [5, 5, '#e0503f']].forEach(([dx, dy, col]) => { c.fillStyle = col; c.beginPath(); c.arc(x + dx, y + dy, 7, 0, Math.PI * 2); c.fill(); }); }
        else { c.fillStyle = '#e0503f'; c.beginPath(); c.arc(x, y, 9, 0, Math.PI * 2); c.fill(); }
        if (clear()) { c.strokeStyle = 'rgba(185,194,216,.6)'; c.lineWidth = 1.5; c.beginPath(); c.arc(x, y, 26, 0, Math.PI * 2); c.stroke(); }
      });
      EL.forEach((e) => {
        let x, y;
        if (clear()) { x = X(e.n.x) + Math.cos(e.a) * 26; y = Y(e.n.y) + Math.sin(e.a) * 26; } else { x = X(e.x); y = Y(e.y); }
        c.fillStyle = '#5aa9f0'; c.beginPath(); c.arc(x, y, 6, 0, Math.PI * 2); c.fill();
      });
      PH.forEach((p) => { const x = X(p.x), y = Y(p.y); c.fillStyle = '#ffd84d'; c.shadowColor = '#ffd84d'; c.shadowBlur = 10; c.beginPath(); c.arc(x, y, 5, 0, Math.PI * 2); c.fill(); c.shadowBlur = 0; if (clear()) { c.strokeStyle = 'rgba(255,216,77,.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 30, y); c.lineTo(x, y); c.stroke(); } });
      if (fog) { c.fillStyle = `rgba(255,190,120,${fog})`; c.fillRect(0, 0, W * 0.86, H); }
      // 오른쪽: 지금의 망원경
      c.fillStyle = '#16203f'; c.fillRect(W * 0.86, 0, W * 0.14, H);
      c.fillStyle = '#cfd6e6'; c.beginPath(); c.moveTo(W * 0.88, H * 0.42); c.lineTo(W * 0.97, H * 0.36); c.lineTo(W * 0.97, H * 0.64); c.lineTo(W * 0.88, H * 0.58); c.closePath(); c.fill();
      c.fillStyle = '#fbfcf9'; c.font = '700 22px "IBM Plex Sans KR", sans-serif'; c.textAlign = 'center';
      c.fillText('지금의', W * 0.93, H * 0.24); c.fillText('망원경', W * 0.93, H * 0.24 + 28);
      c.fillText(clear() ? `받은 빛 ${hits}` : '빛이 안 온다', W * 0.93, H * 0.76);
      // 시간 손잡이(화면 아래, 끌어서 옮긴다)
      { const y = H - 18, x0 = W * 0.2, x1 = W * 0.82, hx = x0 + (x1 - x0) * (t - 30) / 15; c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(x0, y - 3, x1 - x0, 6); const m = x0 + (x1 - x0) * 8 / 15; c.fillStyle = '#ffd84d'; c.fillRect(m - 1, y - 10, 3, 20); c.beginPath(); c.arc(hx, y, 11, 0, Math.PI * 2); c.fill(); c.font = '700 16px "IBM Plex Sans KR", sans-serif'; c.textAlign = 'center'; c.fillText('38만 년', m, y - 14); c.fillStyle = '#fbfcf9'; c.textAlign = 'left'; c.fillText('30만 년', x0 - 70, y + 5); c.fillText('45만 년', x1 + 14, y + 5); }
      // 범례
      c.textAlign = 'left'; c.font = '600 21px "IBM Plex Sans KR", sans-serif';
      [['#e0503f', '원자핵'], ['#5aa9f0', '전자'], ['#ffd84d', '빛']].forEach(([col, n], i) => { c.fillStyle = col; c.beginPath(); c.arc(20, H - 86 + i * 30, 7, 0, Math.PI * 2); c.fill(); c.fillStyle = '#fbfcf9'; c.fillText(n, 34, H - 79 + i * 30); });
    }
    function sync() {
      const K = Math.round(3000 * 38 / t / 100) * 100;
      if (t < 38) sawFog = true; if (t >= 38) sawClear = true;
      out.innerHTML = clear()
        ? `<b>빅뱅 후 ${t}만 년 · 약 ${t === 38 ? 3000 : K} K</b> 전자가 원자핵에 붙잡혀 <b>원자</b>가 됐다 → 빛이 곧게 퍼져 <b>투명</b>`
        : `<b>빅뱅 후 ${t}만 년 · 약 ${K} K</b> 전기를 띤 전자가 빛을 흩어 <b>불투명</b>`;
      const ok = []; if (moved) ok.push(1); if (sawClear) ok.push(2); if (zoomed) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      now.textContent = st === 2 ? '② 화면을 오른쪽으로 끌어 38만 년을 넘기자' : st === 3 ? '③ 오른쪽 지도 사진을 눌러 크게 보자' : st === 1 ? '① 화면을 좌우로 끌어 시간을 움직이자' : '그때의 빛 = 우주 배경 복사';
      now.classList.toggle('done', st === 0);
      draw();
    }
    function set(v) { const was = clear(); t = Math.max(30, Math.min(45, Math.round(v))); range.value = String(t); if (!was && clear()) { hits = 0; window.RxT.jolt(stage, 1); } sync(); }
    function tick() { raf = 0; if (!active) return; step(); draw(); raf = requestAnimationFrame(tick); }
    function zoom() { zoomed = !fig.classList.contains('big') || zoomed; fig.classList.toggle('big'); sync(); }
    range.addEventListener('input', () => { moved = true; set(+range.value); });
    let dragX = null;
    const toT = (e) => { const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width; return 30 + (x - 0.2) / 0.62 * 15; };
    cv.addEventListener('pointerdown', (e) => { dragX = true; try { cv.setPointerCapture(e.pointerId); } catch { /* 합성 */ } moved = true; set(toT(e)); });
    cv.addEventListener('pointermove', (e) => { if (dragX) set(toT(e)); });
    const upc = () => { dragX = null; }; cv.addEventListener('pointerup', upc); cv.addEventListener('pointercancel', upc);
    cv.addEventListener('keydown', (e) => { const d = { ArrowLeft: -1, ArrowRight: 1 }[e.key]; if (d) { e.preventDefault(); e.stopPropagation(); moved = true; set(t + d); } });
    fig.addEventListener('click', zoom);
    fig.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); zoom(); } });
    set(30);
    root._cm = { set: (v) => { moved = true; set(v); }, zoom };
    return { fit, setActive(on) { active = on; if (on) { fit(); if (!raf && !reduce()) raf = requestAnimationFrame(tick); } else { if (raf) cancelAnimationFrame(raf); raf = 0; fig.classList.remove('big'); } } };
  }
  window.CMB = { mount };
})();
