/* 3차시 표지(교과서 24쪽 그림 Ⅰ-13, 32쪽): 갈라파고스 제도 지도 위 돋보기. 렌즈 가운데가 섬 위에 오면 그 섬의 핀치와 먹이가 렌즈 안에 크게 보인다.
   네 섬에 그림 Ⅰ-13의 네 부리를 둔다(어느 섬에 어떤 핀치가 사는지는 이해를 돕기 위한 배치). */
(function () {
  'use strict';
  const K = window.EvKit, F = window.EvFinch, { el, clamp } = K;
  const ISL = [
    { x: 150, y: 140, r: 58, k: 'cactus' }, { x: 300, y: 270, r: 64, k: 'seed' }, { x: 470, y: 130, r: 52, k: 'insect' }, { x: 505, y: 300, r: 50, k: 'tool' },
    { x: 260, y: 120, r: 26 }, { x: 380, y: 200, r: 22 }, { x: 90, y: 270, r: 24 }, { x: 600, y: 210, r: 20 }, { x: 400, y: 340, r: 18 }, { x: 190, y: 340, r: 16 }, { x: 560, y: 80, r: 14 }, { x: 340, y: 60, r: 15 }, { x: 40, y: 170, r: 13 },
  ];
  function blob(cx, cy, r, seed) {
    const rr = K.rng(seed); let d = '';
    for (let i = 0; i <= 14; i++) { const a = i / 14 * Math.PI * 2, q = r * (0.75 + 0.35 * rr()); d += (i ? ' L ' : 'M ') + (cx + Math.cos(a) * q * 1.2).toFixed(1) + ' ' + (cy + Math.sin(a) * q * 0.85).toFixed(1); }
    return d + ' Z';
  }
  function food(p, k) {
    if (k === 'cactus') { const g = el('g', { transform: 'translate(-40 30)' }, p); el('path', { d: 'M0 30 V -30 a12 12 0 0 1 24 0 V 30 Z M24 0 h12 v-18 a8 8 0 0 1 16 0 v26 H24 Z', fill: '#6aa564', stroke: '#1d2433', 'stroke-width': 2.5 }, g); el('circle', { cx: 12, cy: -42, r: 7, fill: '#e2622b', stroke: '#1d2433', 'stroke-width': 2 }, g); }
    if (k === 'seed') [[-40, 46], [-14, 54], [12, 48], [36, 56]].forEach(([x, y]) => el('ellipse', { cx: x, cy: y, rx: 12, ry: 9, fill: '#7a5230', stroke: '#1d2433', 'stroke-width': 2 }, p));
    if (k === 'insect') [[-36, 44], [30, 52], [0, 58]].forEach(([x, y]) => { el('ellipse', { cx: x, cy: y, rx: 7, ry: 4.5, fill: '#2a2a2a' }, p); el('path', { d: `M${x - 6} ${y - 5} l 4 3 M${x + 6} ${y - 5} l -4 3`, stroke: '#2a2a2a', 'stroke-width': 1.5 }, p); });
    if (k === 'tool') { el('rect', { x: 34, y: -70, width: 40, height: 150, fill: '#8a6a4a', stroke: '#1d2433', 'stroke-width': 2.5 }, p); el('ellipse', { cx: 40, cy: -6, rx: 8, ry: 12, fill: '#2a1d14' }, p); el('path', { d: 'M-6 -16 L 38 -8', stroke: '#c9a77c', 'stroke-width': 3 }, p); }
  }

  function mount(root) {
    const svg = root.querySelector('.ev-ln-svg'), now = root.querySelector('.ev-ln-now');
    const defs = el('defs', {}, svg);
    const lg = el('linearGradient', { id: 'ev-ln-sea', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el('stop', { offset: 0, 'stop-color': '#a9d8ec' }, lg); el('stop', { offset: 1, 'stop-color': '#6fb3d4' }, lg);
    const cp = el('clipPath', { id: 'ev-ln-clip' }, defs); el('circle', { r: 76 }, cp);
    el('rect', { x: 0, y: 0, width: 660, height: 400, fill: 'url(#ev-ln-sea)' }, svg);
    for (let i = 0; i < 18; i++) el('path', { d: `M${(i * 97) % 640} ${30 + (i * 53) % 360} q 10 -6 20 0 t 20 0`, stroke: 'rgba(255,255,255,.45)', 'stroke-width': 2, fill: 'none' }, svg);
    ISL.forEach((s, i) => { el('path', { d: blob(s.x, s.y, s.r, i + 3), fill: '#d9c58a', stroke: '#8a7444', 'stroke-width': 2 }, svg); el('path', { d: blob(s.x - s.r * 0.1, s.y - s.r * 0.05, s.r * 0.55, i + 30), fill: '#9cbf6a', opacity: 0.9 }, svg); });
    el('text', { x: 14, y: 388, style: 'font:700 18px var(--f-body)', fill: '#1d2433' }, svg).textContent = '갈라파고스 제도 · 19개 섬';
    el('path', { d: 'M560 382 h 80 l -10 -8 m 10 8 l -10 8', stroke: '#1d2433', 'stroke-width': 2.5, fill: 'none' }, svg);
    el('text', { x: 640, y: 368, 'text-anchor': 'end', style: 'font:700 16px var(--f-body)', fill: '#1d2433' }, svg).textContent = '남아메리카 대륙까지 약 1000 km';
    // 렌즈
    const lens = el('g', { class: 'ev-lens', tabindex: '0', role: 'slider', 'aria-label': '돋보기(화살표 키로 옮긴다)', style: 'cursor:grab' }, svg);
    el('path', { d: 'M54 54 L 104 104', stroke: '#5a3b26', 'stroke-width': 16, 'stroke-linecap': 'round' }, lens);
    const inner = el('g', { 'clip-path': 'url(#ev-ln-clip)' }, lens);
    const bg = el('rect', { x: -80, y: -80, width: 160, height: 160, fill: '#bfe2f2' }, inner);
    const scenes = {};
    Object.keys(F.TYPES).forEach((k) => { const g = el('g', { opacity: 0 }, inner); el('ellipse', { cx: 0, cy: 70, rx: 110, ry: 34, fill: '#d9c58a' }, g); food(g, k); const f = F.draw(g, { ...F.TYPES[k] }); f.setAttribute('transform', 'translate(-8 6) scale(1.5)'); scenes[k] = g; });
    el('circle', { r: 76, fill: 'none', stroke: '#1d2433', 'stroke-width': 8 }, lens);
    el('circle', { r: 76, fill: 'none', stroke: '#f2f2f2', 'stroke-width': 3 }, lens);
    el('path', { d: 'M-50 -40 A 64 64 0 0 1 -10 -64', stroke: 'rgba(255,255,255,.7)', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }, lens);
    const capG = el('g', { opacity: 0 }, svg);
    const capR = el('rect', { height: 52, rx: 10, fill: 'rgba(255,255,255,.95)', stroke: '#1d2433', 'stroke-width': 2 }, capG);
    const cap1 = el('text', { style: 'font:700 18px var(--f-body)', fill: '#1d2433', 'text-anchor': 'middle' }, capG);
    const cap2 = el('text', { style: 'font:600 15px var(--f-body)', fill: '#4b566a', 'text-anchor': 'middle' }, capG);
    let lx = 600, ly = 330;
    const seen = new Set();
    function place() {
      lens.setAttribute('transform', `translate(${lx} ${ly})`);
      const hit = ISL.find((s) => s.k && Math.hypot(lx - s.x, ly - s.y) < s.r * 1.05);
      Object.entries(scenes).forEach(([k, g]) => g.setAttribute('opacity', hit && hit.k === k ? 1 : 0));
      bg.setAttribute('fill', hit ? '#cfe8c0' : '#bfe2f2');
      if (hit) {
        const T = F.TYPES[hit.k]; seen.add(hit.k);
        cap1.textContent = T.name; cap2.textContent = `주로 ${T.food}을(를) 먹는다`;
        const w = 250, cx = clamp(lx, w / 2 + 6, 660 - w / 2 - 6), cy = ly > 200 ? ly - 150 : ly + 96;
        capR.setAttribute('x', cx - w / 2); capR.setAttribute('y', cy); capR.setAttribute('width', w);
        cap1.setAttribute('x', cx); cap1.setAttribute('y', cy + 22); cap2.setAttribute('x', cx); cap2.setAttribute('y', cy + 42);
        capG.setAttribute('opacity', 1); svg.appendChild(capG);
        now.textContent = seen.size < 4 ? `부리가 다른 핀치 ${seen.size} / 4 찾음 — 다른 섬도 보자` : '네 섬의 부리가 모두 다르다! 먹이가 다르기 때문일까?';
        now.classList.toggle('done', seen.size >= 4);
      } else capG.setAttribute('opacity', 0);
    }
    K.hold(svg, {
      down(p) { if (Math.hypot(p.x - lx, p.y - ly) > 110) return false; lens.ox = lx - p.x; lens.oy = ly - p.y; return true; },
      move(p) { lx = clamp(p.x + lens.ox, 40, 620); ly = clamp(p.y + lens.oy, 40, 360); place(); },
      up() {},
    }, (e) => K.svgPt(svg, e));
    lens.addEventListener('keydown', (e) => {
      const d = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] }[e.key]; if (!d) return;
      e.preventDefault(); e.stopPropagation(); lx = clamp(lx + d[0], 40, 620); ly = clamp(ly + d[1], 40, 360); place();
    });
    place();
    root._ln = { to: (i) => { lx = ISL[i].x; ly = ISL[i].y; place(); } };
    return {};
  }
  window.EvLens = { mount };
})();
