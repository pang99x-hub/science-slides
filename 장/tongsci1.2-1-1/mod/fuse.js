/* 2-1 1차시 체험 «수소 : 헬륨 = 3 : 1 만들기»(교과서 52쪽). 빅뱅 후 약 3분, 양성자 14개와 중성자 2개(약 7 : 1)가 떠다닌다.
   중성자를 양성자에 끌어 붙여 묶음 둘을 만들고, 두 묶음을 합치면 헬륨 원자핵(양성자 2 + 중성자 2)이 된다(번쩍 + 흔들림).
   «질량 견주기»를 누르면 남은 수소 원자핵 12개(질량 12)와 헬륨 원자핵 1개(질량 4)가 저울에 올라 3 : 1이 된다.
   개수비 7 : 1은 이해를 돕기 위해 고른 값(교과서 본문은 질량비 약 3 : 1만 다룬다). 엔터 키를 누르면 다음 붙이기를 대신 한다.
   Fuse.mount(root) → { fit, setActive } · 시험용: root._fu.auto() · weigh() */
(function () {
  'use strict';
  const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function mount(root) {
    const stage = root.querySelector('.fu-stage'), cv = stage.querySelector('canvas'), c = cv.getContext('2d');
    const now = root.querySelector('.fu-now'), msg = root.querySelector('.fu-msg'), wB = root.querySelector('.fu-weigh'), rB = root.querySelector('.fu-reset');
    let W = 0, H = 0, raf = 0, active = false, drag = null, he = false, weighed = 0, flash = 0;
    let P = [];
    const R = () => Math.max(16, Math.min(24, W / 40));
    function reset() {
      P = [];
      for (let i = 0; i < 16; i++) P.push({ k: i < 14 ? 'p' : 'n', x: 0.08 + ((i * 0.37) % 0.6), y: 0.15 + ((i * 0.53) % 0.62), vx: (Math.sin(i * 7) * 0.0006), vy: (Math.cos(i * 5) * 0.0006), g: null });
      P[14].x = 0.25; P[14].y = 0.5; P[15].x = 0.5; P[15].y = 0.3;
      he = false; weighed = 0; wB.disabled = true; msg.className = 'u-msg fu-msg'; msg.textContent = ''; steps(); draw();
    }
    function fit() {
      const k = (window.Reveal && Reveal.getScale) ? Reveal.getScale() : 1;
      W = stage.offsetWidth; H = stage.offsetHeight; if (!W) return;
      const dpr = Math.max(1, Math.min(2, (window.devicePixelRatio || 1) * k));
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); c.setTransform(dpr, 0, 0, dpr, 0, 0); draw();
    }
    const AW = () => (weighed ? 0.62 : 1);   // 저울이 나오면 위쪽만 쓴다
    const px = (p) => [p.x * W * 0.98, p.y * H * AW()];
    function nucleon(x, y, k, r) {
      c.fillStyle = k === 'p' ? '#e0503f' : '#a7adb5'; c.strokeStyle = '#fbfcf9'; c.lineWidth = 2;
      c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); c.stroke();
      if (k === 'p') { c.fillStyle = '#fff'; c.font = `800 ${Math.round(r * 1.1)}px "IBM Plex Sans KR", sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('+', x, y + 1); c.textBaseline = 'alphabetic'; }
    }
    const groups = () => { const m = new Map(); P.forEach((p) => { if (p.g != null) { if (!m.has(p.g)) m.set(p.g, []); m.get(p.g).push(p); } }); return [...m.values()]; };
    function draw() {
      if (!W) return;
      c.fillStyle = '#0f1630'; c.fillRect(0, 0, W, H);
      const r = R();
      c.globalAlpha = weighed ? 0.22 : 1;
      P.forEach((p) => { if (p.g == null && !p.hide) { const [x, y] = px(p); nucleon(x, y, p.k, r); } });
      groups().forEach((g) => {
        const cx = g.reduce((a, p) => a + p.x, 0) / g.length, cy = g.reduce((a, p) => a + p.y, 0) / g.length;
        const offs = g.length === 2 ? [[-0.6, 0], [0.6, 0]] : [[-0.55, -0.55], [0.55, -0.55], [-0.55, 0.55], [0.55, 0.55]];
        g.sort((a, b) => (a.k > b.k ? 1 : -1));
        const order = g.length === 4 ? [g[0], g[2], g[3], g[1]] : g;
        order.forEach((p, i) => nucleon(cx * W * 0.98 + offs[i][0] * r * 1.6, cy * H * AW() + offs[i][1] * r * 1.6, p.k, r));
        c.fillStyle = '#ffd84d'; c.font = '700 22px "IBM Plex Sans KR", sans-serif'; c.textAlign = 'center';
        c.fillText(g.length === 4 ? '헬륨 원자핵' : '중수소 원자핵', cx * W * 0.98, cy * H * AW() - r * 2.6);
      });
      c.globalAlpha = 1;
      if (flash > 0) { c.fillStyle = `rgba(255,240,180,${flash})`; c.fillRect(0, 0, W, H); }
      c.fillStyle = '#b9c2d8'; c.font = '600 22px "IBM Plex Sans KR", sans-serif'; c.textAlign = 'right'; c.fillText('빅뱅 후 약 3분 안에', W - 14, 32);
      if (weighed) scale();
    }
    function scale() {
      const t = Math.min(1, weighed), y0 = H * 0.66, r = R() * 0.7;
      c.fillStyle = '#16203f'; c.fillRect(0, y0 - 8, W, H - y0 + 8);
      const ang = -0.12 * t, cx = W / 2, cy = y0 + 40, L = W * 0.32;
      c.save(); c.translate(cx, cy); c.rotate(ang);
      c.strokeStyle = '#cfd6e6'; c.lineWidth = 6; c.beginPath(); c.moveTo(-L, 0); c.lineTo(L, 0); c.stroke();
      // 왼쪽 접시: 수소 원자핵 12
      for (let i = 0; i < 12; i++) nucleon(-L + (i % 6 - 2.5) * r * 2.2, -r * 1.2 - Math.floor(i / 6) * r * 2.1, 'p', r);
      // 오른쪽 접시: 헬륨 원자핵 1
      [[-.55, -.55, 'p'], [.55, -.55, 'n'], [-.55, .55, 'n'], [.55, .55, 'p']].forEach(([dx, dy, k]) => nucleon(L + dx * r * 1.6, -r * 2.2 + dy * r * 1.6, k, r));
      c.restore();
      c.fillStyle = '#cfd6e6'; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx - 22, H - 6); c.lineTo(cx + 22, H - 6); c.closePath(); c.fill();
      c.fillStyle = '#fbfcf9'; c.font = '800 24px "IBM Plex Sans KR", sans-serif'; c.textAlign = 'center';
      c.fillText('수소 원자핵 12개 · 질량 12', cx - L, H - 14); c.fillText('헬륨 원자핵 1개 · 질량 4', cx + L, H - 14);
      if (t >= 1) { c.fillStyle = '#ffd84d'; c.font = '800 34px "IBM Plex Sans KR", sans-serif'; c.fillText('12 : 4 = 3 : 1', cx, y0 + 28); }
    }
    function tick() {
      raf = 0; if (!active) return;
      if (!drag && !weighed) P.forEach((p) => { if (p.g != null) return; p.x += p.vx; p.y += p.vy; if (p.x < 0.04 || p.x > 0.96) p.vx *= -1; if (p.y < 0.08 || p.y > 0.92) p.vy *= -1; });
      if (flash > 0) flash = Math.max(0, flash - 0.04);
      draw(); raf = requestAnimationFrame(tick);
    }
    const near = (a, b, d) => Math.hypot((a.x - b.x) * W, (a.y - b.y) * H * AW()) < d;
    let gid = 0;
    function bind(n) {
      if (n.g != null) return false;
      const pr = P.filter((p) => p.k === 'p' && p.g == null && near(p, n, R() * 3));
      if (!pr.length) return false;
      n.g = pr[0].g = ++gid; n.x = pr[0].x = (n.x + pr[0].x) / 2; n.y = pr[0].y = (n.y + pr[0].y) / 2;
      msg.className = 'u-msg fu-msg ok'; msg.innerHTML = '양성자 1 + 중성자 1 = <b>중수소 원자핵</b>(수소와 양성자 수는 같고 더 무겁다)';
      return true;
    }
    function joinHe(gA) {
      const gs = groups().filter((g) => g.length === 2); if (gs.length < 2) return false;
      const a = gs.find((g) => g[0].g === gA) || gs[0], b = gs.find((g) => g !== a);
      if (gA != null && !near(a[0], b[0], R() * 4)) return false;
      const cx = (a[0].x + b[0].x) / 2, cy = (a[0].y + b[0].y) / 2;
      [...a, ...b].forEach((p) => { p.g = 99; p.x = cx; p.y = cy; });
      he = true; flash = 0.8; window.RxT.jolt(stage, 2); wB.disabled = false;
      msg.className = 'u-msg fu-msg ok'; msg.innerHTML = '번쩍! <b>헬륨 원자핵</b>(양성자 2 + 중성자 2)이 생겼다 — 남은 양성자는 <b>수소 원자핵</b>';
      return true;
    }
    function steps() {
      const ok = []; if (groups().some((g) => g.length === 2) || he) ok.push(1); if (he) ok.push(2); if (weighed >= 1) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      now.textContent = st === 1 ? '① 회색 중성자를 빨간 양성자에 끌어 붙이자' : st === 2 ? (groups().filter((g) => g.length === 2).length < 2 ? '① 남은 중성자도 붙이자' : '② 두 묶음을 끌어 합치자') : st === 3 ? '③ «질량 견주기»를 누르자' : '수소 : 헬륨 질량비 ≈ 3 : 1';
      now.classList.toggle('done', st === 0);
    }
    function auto() {
      const n = P.find((p) => p.k === 'n' && p.g == null);
      if (n) { const p = P.find((q) => q.k === 'p' && q.g == null); n.x = p.x + 0.01; n.y = p.y; bind(n); }
      else if (!he) joinHe(null);
      steps(); draw();
    }
    function weigh() {
      if (!he || weighed) return; wB.disabled = true;
      const fin = () => { weighed = 1; draw(); steps(); msg.className = 'u-msg fu-msg ok'; msg.innerHTML = '개수비 12 : 1, 질량비 <b>수소 : 헬륨 ≈ 3 : 1</b> — 오늘날 별·은하의 빛을 분석한 값과 같다'; };
      if (reduce()) { fin(); return; }
      const t0 = performance.now(); const go = (t) => { weighed = Math.min(1, (t - t0) / 900) || 0.001; draw(); if (weighed < 1) requestAnimationFrame(go); else fin(); }; requestAnimationFrame(go);
    }
    const at = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width / 0.98, y: (e.clientY - r.top) / r.height / AW() }; };
    cv.addEventListener('pointerdown', (e) => {
      if (weighed) return; const m = at(e);
      const hit = P.find((p) => Math.hypot((p.x - m.x) * W, (p.y - m.y) * H * AW()) < R() * 1.6 && (p.k === 'n' || (p.g != null && p.g !== 99)));
      if (!hit) return;
      drag = { g: hit.g, ps: hit.g != null ? P.filter((p) => p.g === hit.g) : [hit] };
      cv.setPointerCapture(e.pointerId); cv.classList.add('holding');
    });
    cv.addEventListener('pointermove', (e) => { if (!drag) return; const m = at(e); drag.ps.forEach((p) => { p.x = Math.max(0.03, Math.min(0.97, m.x)); p.y = Math.max(0.05, Math.min(0.95, m.y)); }); draw(); });
    const up = () => {
      if (!drag) return; const d = drag; drag = null; cv.classList.remove('holding');
      if (d.g == null) { if (!bind(d.ps[0])) { msg.className = 'u-msg fu-msg no'; msg.textContent = '양성자 바로 옆에 놓아야 붙는다'; } }
      else if (!joinHe(d.g)) { msg.className = 'u-msg fu-msg no'; msg.textContent = groups().filter((g) => g.length === 2).length < 2 ? '먼저 중성자를 하나 더 붙여 묶음을 둘 만들자' : '다른 묶음 바로 옆에 놓아 합치자'; }
      steps(); draw();
    };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); auto(); } });
    wB.addEventListener('click', weigh); rB.addEventListener('click', reset);
    reset();
    root._fu = { auto, weigh };
    return { fit, setActive(on) { active = on; if (on) { fit(); if (!raf && !reduce()) raf = requestAnimationFrame(tick); } else if (raf) { cancelAnimationFrame(raf); raf = 0; } } };
  }
  window.Fuse = { mount };
})();
