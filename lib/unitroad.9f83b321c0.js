/* 1-1 2차시 이론 장 «같은 길이, 여러 단위»(교과서 19쪽). 집에서 학교까지 길 위의 사람을 끌면
   같은 거리가 m·km·리·ft·걸음으로 함께 읽힌다(걸음은 사람마다 달라 두 값). 아래 접두어 단추로 nm~km를 바꿔 읽는다.
   1리 ≈ 393 m, 1 ft = 0.3048 m, 걸음은 이해를 돕기 위한 예(0.6 m·0.8 m). UnitRoad.mount(root) → {} · 시험용: root._ur.set(m) · pre(k) */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, at, par) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const MAXM = 4000, X0 = 80, X1 = 820, Y = 150;
  const fmt = (v, d = 0) => v.toLocaleString('ko-KR', { maximumFractionDigits: d });
  const PRE = { n: ['nm', 1e-9, '나노'], u: ['μm', 1e-6, '마이크로'], mm: ['mm', 1e-3, '밀리'], c: ['cm', 1e-2, '센티'], m: ['m', 1, '(기본)'], k: ['km', 1e3, '킬로'] };

  function mount(root) {
    const svg = root.querySelector('.ur-svg'), rows = root.querySelector('.ur-rows'), pre = [...root.querySelectorAll('.ur-pre button')], preOut = root.querySelector('.ur-preout');
    el('rect', { x: 0, y: 0, width: 900, height: 250, fill: '#e8f1e4' }, svg);
    el('path', { d: `M${X0 - 40} ${Y} H${X1 + 40}`, stroke: '#8d97a3', 'stroke-width': 34, 'stroke-linecap': 'round' }, svg);
    el('path', { d: `M${X0} ${Y} H${X1}`, stroke: '#fbfcf9', 'stroke-width': 3, 'stroke-dasharray': '16 14' }, svg);
    // 집·학교
    el('path', { d: `M${X0 - 30} ${Y - 30} V${Y - 70} L${X0} ${Y - 96} L${X0 + 30} ${Y - 70} V${Y - 30} Z`, fill: '#c9a26c', stroke: '#5b4630', 'stroke-width': 3 }, svg);
    el('text', { x: X0, y: Y + 60, 'text-anchor': 'middle', class: 'ur-lb' }, svg).textContent = '집';
    el('rect', { x: X1 - 40, y: Y - 100, width: 80, height: 70, fill: '#e6d6a8', stroke: '#5b4630', 'stroke-width': 3 }, svg);
    el('path', { d: `M${X1 - 50} ${Y - 100} L${X1} ${Y - 126} L${X1 + 50} ${Y - 100} Z`, fill: '#b9603c', stroke: '#5b4630', 'stroke-width': 3 }, svg);
    el('text', { x: X1, y: Y + 60, 'text-anchor': 'middle', class: 'ur-lb' }, svg).textContent = '학교';
    for (let m = 0; m <= MAXM; m += 500) { const x = X0 + (X1 - X0) * m / MAXM; el('line', { x1: x, y1: Y + 20, x2: x, y2: Y + (m % 1000 ? 28 : 36), stroke: '#4a5468', 'stroke-width': 2 }, svg); }
    const walker = el('g', { class: 'ur-walk', tabindex: 0, role: 'slider', 'aria-label': '사람: 끌거나 화살표 키로 옮긴다' }, svg);
    el('circle', { cx: 0, cy: -58, r: 11, fill: '#f2c9a0', stroke: '#1d2433', 'stroke-width': 2.5 }, walker);
    el('path', { d: 'M-10 -46 H10 L13 -18 H-13 Z', fill: '#2a73b8', stroke: '#1d2433', 'stroke-width': 2.5 }, walker);
    el('path', { d: 'M-6 -18 L-10 0 M6 -18 L10 0', stroke: '#1d2433', 'stroke-width': 5, 'stroke-linecap': 'round' }, walker);
    el('circle', { cx: 0, cy: -30, r: 34, fill: 'transparent' }, walker);
    const trail = el('path', { stroke: '#d9483b', 'stroke-width': 6, 'stroke-linecap': 'round' }, svg);
    svg.appendChild(walker);
    let d = 1530, pk = 'k';
    function set(v) {
      d = clamp(Math.round(v / 10) * 10, 0, MAXM);
      const x = X0 + (X1 - X0) * d / MAXM; walker.setAttribute('transform', `translate(${x} ${Y - 4})`); trail.setAttribute('d', `M${X0} ${Y} H${x}`);
      const R = [
        ['m', '미터', fmt(d), '기본 단위', true],
        ['km', '킬로미터', fmt(d / 1000, 2), '1 km = 1000 m'],
        ['리', '리(옛 단위)', fmt(d / 393, 1), '1리 ≈ 393 m'],
        ['ft', '피트', fmt(d / 0.3048), '1 ft = 30.48 cm'],
        ['걸음', '걸음', `${fmt(d / 0.8)}~${fmt(d / 0.6)}`, '사람마다 다르다!'],
      ];
      rows.innerHTML = R.map((r) => `<tr class="${r[4] ? 'base' : ''}"><th>${r[1]}</th><td><b>${r[2]}</b> ${r[0]}</td><td>${r[3]}</td></tr>`).join('');
      preView();
    }
    function preView() {
      const [u, f, nm] = PRE[pk], v = d / f;
      preOut.innerHTML = `${fmt(d)} m = <b>${v >= 1e6 ? v.toExponential(2).replace('e+', ' × 10^') : fmt(v, v < 10 ? 3 : 1)} ${u}</b> <small>${nm === '(기본)' ? '기본 단위' : `${nm}(${u.replace('m', '')}) = ${f >= 1 ? fmt(f) : '1/' + fmt(1 / f)}배`}</small>`;
      pre.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.p === pk)));
    }
    const toX = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()).x; };
    let drag = false;
    svg.addEventListener('pointerdown', (e) => { drag = true; try { svg.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ } set((toX(e) - X0) / (X1 - X0) * MAXM); });
    svg.addEventListener('pointermove', (e) => { if (drag) set((toX(e) - X0) / (X1 - X0) * MAXM); });
    svg.addEventListener('pointerup', () => { drag = false; }); svg.addEventListener('pointercancel', () => { drag = false; });
    walker.addEventListener('keydown', (e) => { const m = { ArrowLeft: -100, ArrowRight: 100 }[e.key]; if (m) { e.preventDefault(); e.stopPropagation(); set(d + m); } });
    pre.forEach((b) => b.addEventListener('click', () => { pk = b.dataset.p; preView(); }));
    set(d);
    root._ur = { set, pre: (k) => pre.find((b) => b.dataset.p === k).click() };
    return {};
  }
  window.UnitRoad = { mount };
})();
