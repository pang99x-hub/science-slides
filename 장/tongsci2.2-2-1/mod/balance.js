/* 사라진 질량 저울(조각). 단계(→)에 맞춰
   1) 왼쪽 접시에 수소 원자핵 4개(4.0292 u) → 왼쪽으로 크게 기운다
   2) 오른쪽 접시에 헬륨 원자핵 1개(4.0015 u) → 왼쪽으로 아주 조금 기운다(잘 보이게 키움)
   3) 왼쪽의 수소 원자핵 넷이 헬륨 원자핵 하나로 합쳐지며 차이 0.0277 u가 빛이 되어 빠져나가 수평
   숫자는 1.0073 u × 4 = 4.0292 u, 4.0015 u. 기울기는 보이도록 과장했다. */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SVGNS = 'http://www.w3.org/2000/svg';
  const el = (tag, attrs, parent) => { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };

  function mount(root, opts = {}) {
    const svg = root.querySelector('.bal-svg');
    const steps = [...root.querySelectorAll('.fragment.custom[data-anim="mrow"]')].filter((f) => Number(f.dataset.fragmentIndex) <= 2);
    const PV = { x: 480, y: 250 }, ARM = 320, DROP = 190;
    // 받침대
    el('path', { d: 'M380 712 L580 712 L540 680 L420 680 Z', class: 'bal-post' }, svg);
    el('rect', { x: 466, y: PV.y, width: 28, height: 432, class: 'bal-post' }, svg);
    const beam = el('g', {}, svg);
    el('rect', { x: PV.x - ARM - 10, y: PV.y - 9, width: 2 * ARM + 20, height: 18, rx: 9, class: 'bal-beam' }, beam);
    el('circle', { cx: PV.x, cy: PV.y, r: 16, class: 'bal-post' }, svg);
    // 접시(줄 둘 + 접시 + 위에 놓는 것)
    const pan = (side) => {
      const g = el('g', {}, svg);
      el('line', { x1: 0, y1: 0, x2: -110, y2: DROP, class: 'bal-string' }, g);
      el('line', { x1: 0, y1: 0, x2: 110, y2: DROP, class: 'bal-string' }, g);
      el('path', { d: `M-125 ${DROP} Q0 ${DROP + 60} 125 ${DROP} Z`, class: 'bal-pan' }, g);
      const load = el('g', {}, g);
      const tag = el('text', { x: 0, y: DROP + 98, class: 'bal-tag big' }, g);
      return { g, load, tag, side };
    };
    const L = pan(-1), R = pan(1);
    // 움직이는 것은 바깥 g(변환 속성 없음), 자리는 안쪽 g의 translate로 — GSAP가 자리를 덮어쓰지 않게
    const proton = (parent, x, y, r = 25) => {
      const w = el('g', {}, parent), g = el('g', { transform: `translate(${x} ${y})` }, w);
      el('circle', { r, class: 'nuc-p' }, g);
      el('path', { d: `M-9 0H9M0 -9V9`, class: 'nuc-plus' }, g);
      return w;
    };
    const neutron = (parent, x, y, r = 25) => { const w = el('g', {}, parent), g = el('g', { transform: `translate(${x} ${y})` }, w); el('circle', { r, class: 'nuc-n' }, g); return w; };
    const helium = (parent) => { const g = el('g', {}, parent); neutron(g, -18, DROP - 64); proton(g, 18, DROP - 64); proton(g, -18, DROP - 30); neutron(g, 18, DROP - 30); return g; };
    // 왼쪽: 수소 원자핵 넷(한 줄) → 3단계에서 헬륨 원자핵(he2)으로 합쳐진다
    const HX = [-81, -27, 27, 81];
    const hs = HX.map((x) => proton(L.load, x, DROP - 28));
    const he2 = helium(L.load);
    // 오른쪽: 헬륨 원자핵(양성자 2 + 중성자 2가 뭉친 것)
    const he = helium(R.load);
    // 차이(빛이 되어 나가는 조각)
    const gap = el('g', {}, L.load);
    el('rect', { x: -58, y: DROP - 120, width: 116, height: 44, rx: 22, class: 'bal-gap' }, gap);
    const gt = el('text', { x: 0, y: DROP - 89, class: 'bal-tag' }, gap); gt.textContent = '0.0277 u';
    const rays = el('g', {}, svg);
    for (let i = 0; i < 12; i++) { const a = i / 12 * Math.PI * 2; el('line', { x1: Math.cos(a) * 30, y1: Math.sin(a) * 30, x2: Math.cos(a) * 70, y2: Math.sin(a) * 70, class: 'bal-ray' }, rays); }
    el('circle', { r: 22, class: 'bal-ray-f' }, rays);
    const lens = el('g', { class: 'bal-lens' }, svg);
    const lt = el('text', { x: 480, y: 140, 'text-anchor': 'middle' }, lens); lt.textContent = '기울기는 잘 보이게 키움 · 실제 차이는 약 0.7 %';
    const msg = el('g', { class: 'bal-lens' }, svg);
    const mt = el('text', { x: 480, y: 92, 'text-anchor': 'middle', style: 'fill: var(--ink); font-size: 38px' }, msg); mt.textContent = '수소 원자핵 4개 → 헬륨 원자핵 1개 + 에너지';

    const S = { a: 0 };                                          // 저울대 각도(도, 음수 = 왼쪽이 내려감)
    function place() {
      beam.setAttribute('transform', `rotate(${S.a} ${PV.x} ${PV.y})`);
      const r = S.a * Math.PI / 180;
      for (const [p, s] of [[L, -1], [R, 1]]) {
        const ex = PV.x + Math.cos(r) * ARM * s, ey = PV.y + Math.sin(r) * ARM * s;
        p.g.setAttribute('transform', `translate(${ex} ${ey})`);
      }
    }
    const show = (n, on, t) => { if (!window.gsap) { n.style.opacity = on ? 1 : 0; return; } gsap.to(n, { autoAlpha: on ? 1 : 0, duration: t }); };
    let cur = -1, tl = null;
    // n: 지금 보이는 단계 수(0~3). instant면 움직임 없이
    function to(n, instant) {
      if (tl) tl.kill();
      const g = window.gsap, quick = instant || reduce || !g;
      const ang = [0, -9, -3, 0][n];
      if (quick) {
        if (g) gsap.set([...hs, he, he2, gap, rays, lens, msg], { clearProps: 'all' });
        const vis = (node, v) => { node.style.opacity = v ? 1 : 0; node.style.visibility = v ? 'visible' : 'hidden'; };
        hs.forEach((h) => vis(h, n >= 1 && n < 3)); vis(he2, n >= 3); vis(he, n >= 2);
        gap.style.opacity = 0; gap.style.visibility = 'hidden';
        vis(rays, false); vis(lens, n === 2); vis(msg, n >= 3);
        S.a = ang; place();
        L.tag.textContent = n >= 1 ? (n >= 3 ? '4.0015 u' : '4.0292 u') : ''; R.tag.textContent = n >= 2 ? '4.0015 u' : '';
        cur = n; return;
      }
      tl = gsap.timeline({ onUpdate: place });
      if (n >= 1 && cur < 1) {
        gsap.set(hs, { autoAlpha: 0, y: -260 });
        hs.forEach((h, i) => tl.to(h, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'bounce.out' }, i * 0.22));
        tl.call(() => { L.tag.textContent = '4.0292 u'; });
        tl.to(S, { a: -9, duration: 0.9, ease: 'elastic.out(1, 0.5)' }, '-=0.1');
      }
      if (n >= 2 && cur < 2) {
        gsap.set(he, { autoAlpha: 0, y: -260 });
        tl.to(he, { autoAlpha: 1, y: 0, duration: 0.55, ease: 'bounce.out' });
        tl.call(() => { R.tag.textContent = '4.0015 u'; });
        tl.to(S, { a: -3, duration: 1.1, ease: 'elastic.out(1, 0.45)' }, '-=0.1');
        tl.to(lens, { autoAlpha: 1, duration: 0.4 });
      }
      if (n >= 3 && cur < 3) {
        // 왼쪽 접시의 수소 원자핵 넷이 가운데로 모여 헬륨 원자핵이 되고, 차이만큼이 떠올라 빛이 되어 흩어진다
        const r = S.a * Math.PI / 180, ex = PV.x - Math.cos(r) * ARM, ey = PV.y - Math.sin(r) * ARM;
        gsap.set(gap, { autoAlpha: 0, y: 0, scale: 1, transformOrigin: '50% 50%' });
        gsap.set(rays, { autoAlpha: 0, x: ex, y: ey + DROP - 160, scale: 0.4, transformOrigin: '0 0' });
        gsap.set(he2, { autoAlpha: 0, scale: 0.6, transformOrigin: '50% 50%' });
        tl.to(lens, { autoAlpha: 0, duration: 0.3 });
        hs.forEach((h, i) => tl.to(h, { x: -HX[i], y: -20, autoAlpha: 0, duration: 0.6, ease: 'power2.in' }, i ? '<' : '>'));
        tl.to(he2, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'back.out(2)' }, '-=0.15');
        tl.to(gap, { autoAlpha: 1, duration: 0.35 }, '<');
        tl.to(gap, { y: -120, duration: 0.7, ease: 'power2.out' });
        tl.call(() => { L.tag.textContent = '4.0015 u'; });
        tl.to(gap, { autoAlpha: 0, scale: 0.3, duration: 0.25 });
        tl.to(rays, { autoAlpha: 1, scale: 1.4, duration: 0.35, ease: 'power2.out' }, '<');
        tl.to(rays, { autoAlpha: 0, scale: 2.4, duration: 0.6 });
        tl.to(S, { a: 0, duration: 1.0, ease: 'elastic.out(1, 0.5)' }, '<');
        tl.to(msg, { autoAlpha: 1, duration: 0.4 });
      }
      cur = n;
    }
    const count = () => steps.filter((f) => f.classList.contains('visible')).length;
    place(); to(0, true);
    root.querySelector('#bal-replay').addEventListener('click', () => { const n = count(); to(0, true); to(n); });
    const api = {
      fragment(f) { if (f.dataset.anim === 'mrow' && Number(f.dataset.fragmentIndex) <= 2) { const n = count(); if (n > cur) to(n); else to(n, true); } },
      sync() { to(count(), true); },
    };
    if (opts.expose) root._balance = api;
    return api;
  }

  window.MassBalance = { mount };
})();
