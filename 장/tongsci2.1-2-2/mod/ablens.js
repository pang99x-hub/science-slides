/* 2차시 4장(교과서 48~49쪽 생활 · 우리 주변의 산과 염기): 돋보기를 끌어 물건 위에 대면 렌즈 속에 그 안의 이온이 보이고,
   오른쪽에 이온화 식과 함께 산·염기로 쌓인다. 렌즈 속 입자 수는 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const { el, ion, grab, loop, chemHTML } = window.AB;
  const ITEMS = [
    { k: 'stomach', name: '위액', what: '염산', kind: 'a', eq: 'HCl → H^+ + Cl^-', ions: [['H', 4], ['Cl', 4]], x: 120, liq: '#f6dcd6' },
    { k: 'vin', name: '식초', what: '아세트산', kind: 'a', eq: 'CH_3COOH → H^+ + CH_3COO^-', ions: [['H', 3], ['AC', 3]], x: 280, liq: '#f1e6cf' },
    { k: 'soda', name: '탄산음료', what: '탄산', kind: 'a', eq: 'H_2CO_3 → 2H^+ + CO_3^2-', ions: [['H', 4], ['CO3', 2]], x: 430, liq: '#e9f4ec' },
    { k: 'batt', name: '자동차 배터리', what: '황산', kind: 'a', eq: 'H_2SO_4 → 2H^+ + SO_4^2-', ions: [['H', 4], ['SO4', 2]], x: 590, liq: '#eef0e2' },
    { k: 'drain', name: '배수구 세정제', what: '수산화 나트륨', kind: 'b', eq: 'NaOH → Na^+ + OH^-', ions: [['Na', 4], ['OH', 4]], x: 750, liq: '#e3eef5' },
    { k: 'cell', name: '건전지', what: '수산화 칼륨', kind: 'b', eq: 'KOH → K^+ + OH^-', ions: [['K', 3], ['OH', 3]], x: 900, liq: '#ece6f3' },
  ];
  const Y = 390, R = 96;

  function draw(svg, it) {
    const g = el('g', { transform: `translate(${it.x} ${Y})` }, svg), s = { stroke: '#1d2433', 'stroke-width': 3 };
    if (it.k === 'stomach') {
      el('path', { d: 'M-30 -90 q-4 30 10 50 q-50 10 -40 70 q10 50 70 40 q40 -10 46 -60 q4 -40 -30 -60 q-20 -10 -24 -40 z', fill: '#f2a7a0', ...s }, g);
      el('path', { d: 'M-20 0 q20 20 50 0', fill: 'none', stroke: '#c56b63', 'stroke-width': 3 }, g);
    }
    if (it.k === 'vin') { el('path', { d: 'M-30 80 V-10 Q-30 -36 -10 -44 V-80 H10 V-44 Q30 -36 30 -10 V80 Z', fill: '#f3efe6', ...s }, g); el('rect', { x: -12, y: -92, width: 24, height: 14, fill: '#c8402f', ...s }, g); el('rect', { x: -26, y: 10, width: 52, height: 30, fill: '#fff', ...s, 'stroke-width': 2 }, g); el('text', { class: 'ab-small', y: 31, text: '식초' }, g); }
    if (it.k === 'soda') { el('rect', { x: -30, y: -70, width: 60, height: 150, rx: 10, fill: '#3fa65c', ...s }, g); el('rect', { x: -30, y: -20, width: 60, height: 40, fill: '#e9f4ec', ...s, 'stroke-width': 2 }, g); el('ellipse', { cx: 0, cy: -70, rx: 30, ry: 8, fill: '#c9ced6', ...s }, g); }
    if (it.k === 'batt') { el('rect', { x: -66, y: -40, width: 132, height: 120, rx: 6, fill: '#3c4558', ...s }, g); [-36, 36].forEach((x) => el('rect', { x: x - 10, y: -58, width: 20, height: 18, fill: x < 0 ? '#d9483b' : '#1d2433', ...s, 'stroke-width': 2 }, g)); el('text', { x: 0, y: 30, 'text-anchor': 'middle', fill: '#fff', 'font-size': 22, 'font-weight': 800, text: '+  −' }, g); }
    if (it.k === 'drain') { el('path', { d: 'M-36 80 V-30 Q-36 -50 -16 -56 V-80 H16 V-56 Q36 -50 36 -30 V80 Z', fill: '#2c62c6', ...s }, g); el('rect', { x: -20, y: -96, width: 40, height: 18, fill: '#ffe27a', ...s }, g); el('rect', { x: -28, y: 0, width: 56, height: 36, fill: '#fff', ...s, 'stroke-width': 2 }, g); el('text', { class: 'ab-small', y: 24, text: '세정제', 'font-size': 14 }, g); }
    if (it.k === 'cell') { el('rect', { x: -26, y: -60, width: 52, height: 140, rx: 8, fill: '#e2b23a', ...s }, g); el('rect', { x: -26, y: 20, width: 52, height: 60, rx: 0, fill: '#1d2433' }, g); el('rect', { x: -8, y: -72, width: 16, height: 12, fill: '#c9ced6', ...s, 'stroke-width': 2 }, g); }
    el('text', { class: 'ab-label', y: 122, text: it.name }, g);
    return g;
  }

  function mount(root) {
    const svg = root.querySelector('.ab-ln-svg'), now = root.querySelector('.ab-ln-now');
    const info = root.querySelector('.ab-ln-info'), lists = { a: root.querySelector('.ab-ln-list[data-k="a"]'), b: root.querySelector('.ab-ln-list[data-k="b"]') };
    el('rect', { x: 0, y: 500, width: 1000, height: 100, fill: '#e6dccb' }, svg);
    el('rect', { x: 0, y: 492, width: 1000, height: 12, fill: '#c9a77c' }, svg);
    ITEMS.forEach((it) => draw(svg, it));
    const defs = el('defs', {}, svg), cp = el('clipPath', { id: 'ab-ln-cp' }, defs); el('circle', { r: R - 6 }, cp);
    const lens = el('g', { class: 'ab-hand', tabindex: 0, role: 'button', 'aria-label': '돋보기(끌어서 물건 위에 대기)' }, svg);
    el('path', { d: 'M62 62 L150 150', stroke: '#6b4a2b', 'stroke-width': 26, 'stroke-linecap': 'round' }, lens);
    const view = el('g', { 'clip-path': 'url(#ab-ln-cp)' }, lens);
    const bg = el('circle', { r: R, fill: '#ffffff', opacity: 0.18 }, view);
    const pg = el('g', {}, view);
    el('circle', { r: R, fill: 'none', stroke: '#1d2433', 'stroke-width': 12 }, lens);
    el('circle', { r: R, fill: 'none', stroke: '#c9ced6', 'stroke-width': 6 }, lens);
    el('circle', { r: R + 50, class: 'ab-hit', fill: 'transparent' }, lens);
    let lx = 500, ly = 160, curIt = null, ps = [];
    const found = new Set();
    function setItem(it) {
      if (it === curIt) return; curIt = it; pg.innerHTML = ''; ps = [];
      if (!it) { bg.setAttribute('fill', '#ffffff'); bg.setAttribute('opacity', 0.18); info.innerHTML = '돋보기를 물건 위에 대 보자.'; return; }
      bg.setAttribute('fill', it.liq); bg.setAttribute('opacity', 0.95);
      const list = []; it.ions.forEach(([k, n]) => { for (let i = 0; i < n; i++) list.push(k); }); for (let i = 0; i < 3; i++) list.push('W');
      list.forEach((k, i) => { const a = i * 2.4, r = 20 + (i * 37) % 62; const x = Math.cos(a) * r, y = Math.sin(a) * r; const g = ion(pg, k, x, y, k === 'W' ? 0.75 : 1); if (k === 'W') g.style.opacity = 0.55; ps.push({ g, x, y, ph: i * 1.7 }); });
      info.innerHTML = `<b>${it.name}</b> 속 <b>${it.what}</b> — ${it.kind === 'a' ? '산' : '염기'}<br><span class="ab-ln-eq">${chemHTML(it.eq)}</span>`;
      if (!found.has(it.k)) {
        found.add(it.k);
        const li = document.createElement('li'); li.innerHTML = `${it.name} <small>${it.what}</small>`; lists[it.kind].appendChild(li);
        now.textContent = found.size >= ITEMS.length ? '산에는 늘 ___ , 염기에는 늘 ___' : `찾은 물건 ${found.size} / ${ITEMS.length}`;
        now.classList.toggle('done', found.size >= ITEMS.length);
      }
    }
    function place() {
      lens.setAttribute('transform', `translate(${lx.toFixed(1)} ${ly.toFixed(1)})`);
      setItem(ITEMS.find((it) => Math.abs(it.x - lx) < 62 && ly > Y - 110 && ly < Y + 100) || null);
    }
    let ox = 0, oy = 0;
    grab(lens, svg, { start(p) { ox = p.x - lx; oy = p.y - ly; }, move(p) { lx = Math.max(60, Math.min(940, p.x - ox)); ly = Math.max(70, Math.min(520, p.y - oy)); place(); } });
    lens.addEventListener('keydown', (e) => { const d = { ArrowRight: [40, 0], ArrowLeft: [-40, 0], ArrowUp: [0, -40], ArrowDown: [0, 40] }[e.key]; if (d) { e.preventDefault(); e.stopPropagation(); lx = Math.max(60, Math.min(940, lx + d[0])); ly = Math.max(70, Math.min(520, ly + d[1])); place(); } });
    const l = loop(() => { const t = performance.now() / 1000; ps.forEach((q) => q.g.setAttribute('transform', `translate(${(q.x + 5 * Math.sin(t * 1.7 + q.ph)).toFixed(1)} ${(q.y + 5 * Math.cos(t * 1.3 + q.ph)).toFixed(1)})`)); });
    place();
    root._ln = { at(i) { lx = ITEMS[i].x; ly = Y - 10; place(); } };
    return { setActive(on) { if (on) l.start(); else l.stop(); } };
  }
  window.ABLens = { mount };
})();
