/* 3차시 표지(교과서 50쪽 도입): 같은 온도(24.5 °C, 교과서 예시 값)의 염산과 수산화 나트륨 수용액을 같은 부피로 섞으면
   최고 온도는 얼마일까? 섞은 비커의 온도계 눈금을 끌어 예측한다. 예측은 AB.state.pred에 두고 실험 장에서 견준다. */
(function () {
  'use strict';
  const { el, grab, clamp, state } = window.AB;
  const Y20 = 360, PX = 22;   // 20 °C의 y, 1 °C당 px

  function mount(root) {
    const svg = root.querySelector('.ab-th-svg'), now = root.querySelector('.ab-th-now');
    const opts = [...root.querySelectorAll('.share-opts button')];
    el('rect', { x: 0, y: 330, width: 640, height: 80, fill: '#e6dccb' }, svg);
    const beaker = (x, w, h, label, c, t) => {
      el('rect', { x: x - w / 2 + 5, y: 330 - h * 0.62, width: w - 10, height: h * 0.62 - 4, fill: c }, svg);
      el('path', { d: `M${x - w / 2} ${330 - h} V322 Q${x - w / 2} 330 ${x - w / 2 + 8} 330 H${x + w / 2 - 8} Q${x + w / 2} 330 ${x + w / 2} 322 V${330 - h}`, class: 'ab-glass', fill: 'none' }, svg);
      el('text', { class: 'ab-small', x, y: 354, text: label }, svg);
      if (t) { el('rect', { x: x - 34, y: 330 - h - 46, width: 68, height: 32, rx: 6, fill: '#2b3242' }, svg); el('text', { x, y: 330 - h - 23, 'text-anchor': 'middle', fill: '#9cf0b0', 'font-size': 19, 'font-weight': 700, 'font-family': 'IBM Plex Mono, monospace', text: t }, svg); }
    };
    beaker(80, 96, 120, '염산', '#e3f0f6', '24.5');
    beaker(210, 96, 120, '수산화 나트륨', '#e6eef6', '24.5');
    el('text', { class: 'ab-small', x: 145, y: 380, text: '6 mL씩, 온도·농도 같게' }, svg);
    el('path', { d: 'M262 250 h50 m-14 -12 l14 12 l-14 12', stroke: '#1d2433', 'stroke-width': 4, fill: 'none' }, svg);
    beaker(390, 130, 150, '섞은 용액', '#dfeaf0');
    const read = el('text', { class: 'ab-label', x: 390, y: 150, text: '?', 'font-size': 34 }, svg);
    // 큰 온도계
    const tx = 540;
    el('rect', { x: tx - 16, y: Y20 - 12 * PX - 20, width: 32, height: 12 * PX + 40, rx: 16, fill: '#fff', stroke: '#1d2433', 'stroke-width': 3 }, svg);
    el('circle', { cx: tx, cy: Y20 + 26, r: 24, fill: '#d9483b', stroke: '#1d2433', 'stroke-width': 3 }, svg);
    for (let t = 20; t <= 32; t++) { const y = Y20 - (t - 20) * PX; el('line', { x1: tx + 16, y1: y, x2: tx + (t % 2 ? 24 : 32), y2: y, stroke: '#1d2433', 'stroke-width': 2 }, svg); if (t % 2 === 0) el('text', { x: tx + 38, y: y + 6, 'font-size': 16, 'font-weight': 600, fill: '#4b566a', text: t }, svg); }
    el('text', { x: tx + 30, y: Y20 - 12 * PX - 30, 'font-size': 16, 'font-weight': 700, fill: '#4b566a', text: '°C' }, svg);
    const base = el('line', { x1: tx - 26, x2: tx + 26, y1: Y20 - 4.5 * PX, y2: Y20 - 4.5 * PX, stroke: '#2c62c6', 'stroke-width': 3, 'stroke-dasharray': '6 4' }, svg);
    void base;
    el('text', { x: tx - 32, y: Y20 - 4.5 * PX + 5, 'text-anchor': 'end', 'font-size': 15, 'font-weight': 700, fill: '#2c62c6', text: '섞기 전' }, svg);
    const col = el('rect', { x: tx - 7, width: 14, fill: '#d9483b' }, svg);
    const hand = el('g', { class: 'ab-hand', tabindex: 0, role: 'slider', 'aria-label': '예측 온도(끌어서 맞추기)', 'aria-valuemin': 20, 'aria-valuemax': 32 }, svg);
    el('rect', { class: 'ab-hit', x: tx - 50, y: -30, width: 100, height: 60 }, hand);
    el('path', { d: 'M-40 0 h-24 l10 -10 m-10 10 l10 10', stroke: '#1d2433', 'stroke-width': 3, fill: 'none', transform: `translate(${tx} 0)` }, hand);
    el('rect', { x: tx - 22, y: -9, width: 44, height: 18, rx: 9, fill: '#ffe27a', stroke: '#1d2433', 'stroke-width': 2.5 }, hand);
    let T = 24.5, touched = false;
    function paint() {
      const y = Y20 - (T - 20) * PX;
      col.setAttribute('y', y.toFixed(1)); col.setAttribute('height', (Y20 + 10 - y).toFixed(1));
      hand.setAttribute('transform', `translate(0 ${y.toFixed(1)})`); hand.setAttribute('aria-valuenow', T.toFixed(1));
      read.textContent = touched ? `${T.toFixed(1)} °C?` : '?';
      now.textContent = touched ? (T > 24.6 ? '오른다고 예측했다' : T < 24.4 ? '내린다고 예측했다' : '그대로라고 예측했다') : '온도계 눈금을 끌어 예측해 보자';
    }
    function settle() {
      touched = true; state.pred = T; paint();
      const k = T > 24.6 ? 'up' : T < 24.4 ? 'down' : 'same';
      const b = opts.find((x) => x.dataset.k === k);
      if (b && b.getAttribute('aria-pressed') !== 'true') b.click();
    }
    grab(hand, svg, { move(p) { T = Math.round(clamp(20 + (Y20 - p.y) / PX, 20, 32) * 10) / 10; touched = true; paint(); }, end: settle });
    hand.addEventListener('keydown', (e) => { const d = { ArrowUp: 0.5, ArrowRight: 0.5, ArrowDown: -0.5, ArrowLeft: -0.5 }[e.key]; if (d) { e.preventDefault(); e.stopPropagation(); T = clamp(T + d, 20, 32); settle(); } });
    paint();
    root._th = { set(v) { T = v; settle(); } };
    return {};
  }
  window.ABThermo = { mount };
})();
