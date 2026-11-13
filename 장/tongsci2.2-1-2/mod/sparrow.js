/* 1차시 표지: 논의 참새·메뚜기·벼(교과서 76쪽 도입). 참새를 누르면 그물로 잡히고, 그물을 누르면 모두 풀려난다.
   모델(이해를 돕기 위한 것): 메뚜기 G는 스스로 늘다가(로지스틱) 참새 S에게 잡아먹힌다. 벼 이삭 R은 메뚜기가 많을수록 줄어든다.
     dG/dt = 0.9·G(1 − G) − 0.085·S·G,   R → 1 − 0.85·G 쪽으로 천천히 */
(function () {
  'use strict';
  const { el, org, place, clamp, rng } = window.Eco;
  const NS = 8, NR = 14, GMAX = 30;

  function mount(root) {
    const svg = root.querySelector('.sp-svg'), now = root.querySelector('.sp-now');
    const bar = { s: root.querySelector('.sp-bs'), g: root.querySelector('.sp-bg'), r: root.querySelector('.sp-br') };
    const txt = { s: root.querySelector('.sp-vs'), g: root.querySelector('.sp-vg'), r: root.querySelector('.sp-vr') };
    const R = rng(7);
    el('rect', { class: 'sp-sky', x: -200, y: -200, width: 1060, height: 480 }, svg);
    el('circle', { class: 'sp-sun', cx: 70, cy: 60, r: 30 }, svg);
    el('path', { class: 'sp-hill', d: 'M-200 250 Q 120 190 330 236 T 860 226 V 600 H -200 Z' }, svg);
    el('rect', { class: 'sp-paddy', x: -200, y: 282, width: 1060, height: 300 }, svg);
    for (let i = 0; i < 4; i++) el('path', { class: 'sp-ridge', d: `M-200 ${300 + i * 22} H 860` }, svg);
    // 벼
    const rice = Array.from({ length: NR }, (_, i) => {
      const x = 26 + i * 46 + (i % 2) * 8, y = 372 - (i % 3) * 10;
      const g = org(svg, 'rice', x, y, 1.45, i % 2 === 1);
      return { g, head: g.querySelector('.o-head'), x, y };
    });
    // 메뚜기(보이는 수만 바꾼다)
    const hop = Array.from({ length: GMAX }, () => {
      const x = 20 + R() * 620, y = 296 + R() * 70;
      const g = org(svg, 'grasshopper', x, y, 0.62, R() < 0.5);
      return { g, x, y, ph: R() * 6, vis: false };
    });
    // 그물
    const net = el('g', { class: 'sp-net', tabindex: '0', role: 'button', 'aria-label': '그물: 누르면 잡은 참새를 모두 풀어 준다', transform: 'translate(586 36)' }, svg);
    el('path', { class: 'sp-pole', d: 'M-10 -20 L 30 60' }, net);
    el('path', { class: 'sp-bag', d: 'M-44 -24 q 34 -14 60 4 q 6 40 -26 64 q -30 -20 -34 -68 z' }, net);
    for (let i = 1; i < 4; i++) el('path', { class: 'sp-mesh', d: `M${-42 + i * 14} -24 q 2 30 ${-4 + i * 2} 60` }, net);
    const netN = el('text', { class: 'sp-netn', x: -14, y: 64 }, net);
    // 참새
    const birds = Array.from({ length: NS }, (_, i) => {
      const g = el('g', { class: 'sp-bird', tabindex: '0', role: 'button', 'aria-label': `참새 ${i + 1}: 누르면 잡는다` }, svg);
      el('circle', { class: 'sp-hit', r: 44, cy: -16 }, g);
      const body = org(g, 'sparrow', 0, 0, 1.1);
      return { g, body, x: 60 + R() * 520, y: 70 + R() * 150, vx: (R() < 0.5 ? -1 : 1) * (50 + R() * 50), ph: R() * 6, free: true, dive: 0, tx: 0, ty: 0 };
    });
    let G = 0.25, Rv = 1 - 0.85 * 0.25, caught = 0, touched = false;
    const level = (v) => (v < 0.2 ? '적음' : v < 0.45 ? '보통' : v < 0.7 ? '많음' : '아주 많음');
    function catchBird(b) {
      if (!b.free) return;
      b.free = false; caught++; touched = true;
      b.g.classList.add('caught');
      if (window.gsap) gsap.to(b, { x: 572, y: 52, duration: 0.6, ease: 'power2.in', onComplete: () => { b.g.style.visibility = 'hidden'; } });
      else b.g.style.visibility = 'hidden';
      paintCounts();
    }
    function releaseAll() {
      birds.forEach((b) => { if (!b.free) { b.free = true; b.g.classList.remove('caught'); b.g.style.visibility = ''; b.x = 570; b.y = 60; b.vx = -(60 + R() * 60); } });
      caught = 0; paintCounts();
    }
    birds.forEach((b) => {
      b.g.addEventListener('pointerdown', (e) => { e.stopPropagation(); catchBird(b); });
      b.g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); catchBird(b); } });
    });
    net.addEventListener('pointerdown', (e) => { e.stopPropagation(); releaseAll(); });
    net.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); releaseAll(); } });

    function paintCounts() {
      const S = NS - caught;
      netN.textContent = caught ? `${caught}마리` : '';
      net.classList.toggle('full', caught > 0);
      bar.s.style.width = (S / NS * 100) + '%'; txt.s.textContent = `${S}마리`;
      bar.g.style.width = (G * 100) + '%'; txt.g.textContent = level(G);
      bar.r.style.width = (Rv * 100) + '%'; txt.r.textContent = Rv > 0.7 ? '많음' : Rv > 0.45 ? '줄어듦' : '크게 줄어듦';
      now.textContent = !touched ? '참새를 눌러 잡아 보자' : S === 0 ? '메뚜기와 벼를 지켜보자 — 그물을 누르면 풀어 준다' : caught ? '참새를 더 잡거나, 그물을 눌러 풀어 주자' : '참새를 눌러 잡아 보자';
    }
    function step(dt) {
      const S = NS - caught;
      G = clamp(G + (0.9 * G * (1 - G) - 0.085 * S * G) * dt * 0.7, 0.02, 1);
      Rv += ((1 - 0.85 * G) - Rv) * dt * 0.35;
      const t = performance.now() / 1000;
      // 참새: 하늘을 날다 가끔 메뚜기 쪽으로 내려온다
      birds.forEach((b) => {
        if (!b.free) { place(b.body, 0, 0, 1.1, b.vx < 0); b.g.setAttribute('transform', `translate(${b.x.toFixed(1)} ${b.y.toFixed(1)}) scale(.8)`); return; }
        if (b.dive > 0) {
          b.dive -= dt; b.x += (b.tx - b.x) * dt * 3; b.y += (b.ty - b.y) * dt * 3;
          if (b.dive <= 0) b.vx = (R() < 0.5 ? -1 : 1) * (60 + R() * 50);
        } else {
          b.x += b.vx * dt; b.y += Math.sin(t * 2 + b.ph) * 18 * dt + (110 - b.y) * dt * 0.4;
          if (b.x < 30 || b.x > 630) { b.vx *= -1; b.x = clamp(b.x, 30, 630); }
          if (R() < dt * 0.25 * G * 3) { const h = hop.find((q) => q.vis && R() < 0.3); if (h) { b.dive = 0.9; b.tx = h.x; b.ty = h.y - 10; } }
        }
        place(b.body, 0, 0, 1.1, b.vx < 0);
        b.g.setAttribute('transform', `translate(${b.x.toFixed(1)} ${b.y.toFixed(1)})`);
      });
      const nG = Math.round(2 + (GMAX - 2) * G);
      hop.forEach((h, i) => {
        const v = i < nG; if (v !== h.vis) { h.vis = v; h.g.style.display = v ? '' : 'none'; }
        if (v) place(h.g, h.x, h.y - Math.max(0, Math.sin(t * 3 + h.ph)) * 8, 0.62, i % 2 === 0);
      });
      const nR = Math.round(NR * clamp((Rv - 0.1) / 0.75, 0, 1));
      rice.forEach((r, i) => r.head.classList.toggle('eaten', i >= nR ? true : false));
      paintCounts();
    }
    rice.forEach((r, i) => { r.order = (i * 5) % NR; });
    rice.sort((a, b) => a.order - b.order);
    paintCounts();
    const loop = window.Stage.loop(step);
    root._sp = { catch: (n) => birds.filter((b) => b.free).slice(0, n).forEach(catchBird), release: releaseAll, fast: (sec) => { for (let i = 0; i < sec * 30; i++) step(1 / 30); }, get G() { return G; } };
    return { setActive(on) { if (on) loop.start(); else loop.stop(); } };
  }
  window.SparrowField = { mount };
})();
