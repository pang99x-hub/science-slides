/* 4차시 표지(교과서 53쪽 그림 Ⅰ-28): 벌레에 물린 팔. 물린 자리를 손가락으로 문지르면 연고(암모니아수가 든 약)가 발리며
   붉은 자국과 부기가 옅어진다. 문지른 길이만큼 가라앉는다(이해를 돕기 위한 예). */
(function () {
  'use strict';
  const { el, grab } = window.AB;
  const BX = 330, BY = 230, NEED = 2600;

  function mount(root) {
    const svg = root.querySelector('.ab-rb-svg'), now = root.querySelector('.ab-rb-now');
    el('rect', { x: 0, y: 0, width: 640, height: 410, fill: '#eaf2f6' }, svg);
    // 팔
    el('path', { d: 'M-20 160 Q200 140 470 150 Q540 150 580 170 Q640 200 640 240 Q630 290 560 300 Q480 312 420 306 Q200 300 -20 320 Z', fill: '#f2c9a5', stroke: '#1d2433', 'stroke-width': 3 }, svg);
    el('path', { d: 'M470 160 q40 -6 70 6 M480 300 q40 6 70 -4', fill: 'none', stroke: '#d9a47e', 'stroke-width': 3 }, svg);
    const red = el('ellipse', { cx: BX, cy: BY, rx: 70, ry: 46, fill: '#e2575a', opacity: 0.55 }, svg);
    const bump = el('ellipse', { cx: BX, cy: BY, rx: 20, ry: 14, fill: '#d23f43', stroke: '#9c2b2e', 'stroke-width': 2 }, svg);
    el('circle', { cx: BX, cy: BY - 2, r: 3, fill: '#5a1416' }, svg);
    const smear = el('polyline', { points: '', fill: 'none', stroke: '#ffffff', 'stroke-width': 26, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: 0.55 }, svg);
    const tag = el('text', { class: 'ab-label', x: BX, y: 140, text: '벌레 독(산성)이 들어간 자리', 'font-size': 18 }, svg);
    // 연고
    const tube = el('g', { transform: 'translate(120 70) rotate(-12)' }, svg);
    el('path', { d: 'M-70 -22 H40 L58 -10 V10 L40 22 H-70 Z', fill: '#f4f6f8', stroke: '#1d2433', 'stroke-width': 3 }, tube);
    el('rect', { x: 58, y: -8, width: 22, height: 16, rx: 3, fill: '#2c62c6', stroke: '#1d2433', 'stroke-width': 2 }, tube);
    el('text', { x: -16, y: 6, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: '#1d2433', text: '벌레 물린 데 연고' }, tube);
    el('text', { x: 40, y: 124, 'font-size': 15, 'font-weight': 600, fill: '#4b566a', text: '성분: 암모니아수' }, svg);
    const hit = el('rect', { class: 'ab-hit', x: 120, y: 120, width: 420, height: 220 }, svg);
    let len = 0, last = null, pts = [];
    function paint() {
      const u = Math.min(1, len / NEED);
      red.setAttribute('opacity', (0.55 * (1 - u)).toFixed(2)); red.setAttribute('rx', (70 - 30 * u).toFixed(1));
      bump.setAttribute('rx', (20 - 12 * u).toFixed(1)); bump.setAttribute('ry', (14 - 9 * u).toFixed(1)); bump.setAttribute('opacity', (1 - 0.7 * u).toFixed(2));
      tag.textContent = u >= 1 ? '붉은 기와 가려움이 가라앉았다' : '벌레 독(산성)이 들어간 자리';
      now.textContent = u >= 1 ? '가라앉았다 — 연고 속 물질은?' : len ? '계속 문질러 보자' : '물린 자리를 문질러 연고를 발라 보자';
      now.classList.toggle('done', u >= 1);
    }
    grab(hit, svg, {
      start(p) { last = p; },
      move(p) {
        const d = Math.hypot(p.x - last.x, p.y - last.y);
        if (Math.hypot(p.x - BX, p.y - BY) < 110) { len += d; pts.push(`${p.x.toFixed(0)},${p.y.toFixed(0)}`); if (pts.length > 60) pts.shift(); smear.setAttribute('points', pts.join(' ')); }
        last = p; paint();
      },
    });
    paint();
    root._rb = { rub(n) { len += n; paint(); } };
    return {};
  }
  window.ABRub = { mount };
})();
