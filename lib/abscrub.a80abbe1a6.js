/* 3차시 4장(교과서 51쪽 결과 4 · 52쪽 그림 Ⅰ-27): 전체 12 mL를 염산과 수산화 나트륨 수용액으로 나누는 막대를 밀면
   비커 속 입자 모형(1 mL에 이온 한 쌍, 이해를 돕기 위한 예)이 바뀐다. H⁺과 OH⁻이 1 : 1로 만나 생긴 물 분자 수,
   남은 이온, 액성(BTB 색), 최고 온도(교과서 값 또는 모형 값)가 함께 움직인다. */
(function () {
  'use strict';
  const { el, ion, ind, MIX } = window.AB;
  const SLOTS = [];
  for (let r = 0; r < 6; r++) for (let c = 0; c < 8; c++) SLOTS.push([170 + c * 66 + (r % 2) * 30 + ((c * 7 + r * 3) % 5) * 3, 230 + r * 58 + ((c * 5 + r) % 4) * 4]);

  function mount(root) {
    const svg = root.querySelector('.ab-sc-svg'), range = root.querySelector('.ab-sc-range'), lab = root.querySelector('.ab-sc-val');
    const out = { H: root.querySelector('[data-c="H"]'), OH: root.querySelector('[data-c="OH"]'), W: root.querySelector('[data-c="W"]'), Cl: root.querySelector('[data-c="Cl"]'), Na: root.querySelector('[data-c="Na"]') };
    const kindEl = root.querySelector('.ab-sc-kind'), tEl = root.querySelector('.ab-sc-t'), mini = root.querySelector('.ab-sc-mini');
    el('rect', { x: 0, y: 590, width: 1000, height: 50, fill: '#e6dccb' }, svg);
    const liq = el('rect', { x: 128, y: 196, width: 584, height: 380, fill: '#dbe9f2' }, svg);
    el('path', { d: 'M120 150 V560 Q120 588 148 588 H692 Q720 588 720 560 V150', class: 'ab-glass', fill: 'none' }, svg);
    el('line', { x1: 128, y1: 196, x2: 712, y2: 196, stroke: '#6fa4c6', 'stroke-width': 2 }, svg);
    const layer = el('g', {}, svg);
    // 왼쪽 위 두 눈금 실린더
    const cyl = (x, name, c) => {
      el('rect', { x: x - 26, y: 30, width: 52, height: 120, rx: 6, fill: '#f4fafd', stroke: '#1d2433', 'stroke-width': 2.5 }, svg);
      const f = el('rect', { x: x - 22, width: 44, fill: c }, svg);
      el('text', { class: 'ab-small', x, y: 172, text: name, 'font-size': 15 }, svg);
      const t = el('text', { x: x + 34, y: 96, 'font-size': 20, 'font-weight': 800, fill: '#1d2433', text: '' }, svg);
      return (v) => { const h = v / 12 * 112; f.setAttribute('y', (146 - h).toFixed(1)); f.setAttribute('height', h.toFixed(1)); t.textContent = `${v} mL`; };
    };
    const cA = cyl(800, '염산', '#8fc0de'), cB = cyl(910, '수산화 나트륨', '#8fa6de');
    const therm = el('g', {}, svg);
    el('rect', { x: 780, y: 230, width: 190, height: 110, rx: 14, fill: '#2b3242' }, therm);
    el('text', { x: 796, y: 256, fill: '#c9ced6', 'font-size': 15, 'font-weight': 700, text: '최고 온도' }, therm);
    const tv = el('text', { x: 950, y: 318, 'text-anchor': 'end', fill: '#9cf0b0', 'font-size': 46, 'font-weight': 700, 'font-family': 'IBM Plex Mono, monospace', text: '' }, therm);
    const tsrc = el('text', { x: 875, y: 365, 'text-anchor': 'middle', fill: '#4b566a', 'font-size': 15, 'font-weight': 700, text: '' }, svg);
    // 작은 그래프(교과서 다섯 값 + 지금 위치)
    const mx = (a) => 790 + a / 12 * 180, my = (t) => 560 - (t - 24) / 5 * 150;
    el('path', { d: 'M790 410 V560 H975', fill: 'none', stroke: '#1d2433', 'stroke-width': 2 }, svg);
    el('polyline', { points: [2, 4, 6, 8, 10].map((a) => `${mx(a)},${my(MIX.BOOK[a])}`).join(' '), fill: 'none', stroke: '#d9483b', 'stroke-width': 2.5 }, svg);
    [2, 4, 6, 8, 10].forEach((a) => el('circle', { cx: mx(a), cy: my(MIX.BOOK[a]), r: 4, fill: '#d9483b' }, svg));
    const dot = el('circle', { r: 9, fill: 'none', stroke: '#2c62c6', 'stroke-width': 3.5 }, svg);
    el('text', { x: 880, y: 584, 'text-anchor': 'middle', 'font-size': 13, 'font-weight': 600, fill: '#4b566a', text: '염산 부피 →' }, svg);
    function paint() {
      const a = Number(range.value), b = 12 - a, w = Math.min(a, b), h = a - w, oh = b - w;
      cA(a); cB(b);
      const list = []; for (let i = 0; i < w; i++) list.push('W'); for (let i = 0; i < a; i++) list.push('Cl'); for (let i = 0; i < b; i++) list.push('Na'); for (let i = 0; i < h; i++) list.push('H'); for (let i = 0; i < oh; i++) list.push('OH');
      layer.innerHTML = '';
      list.forEach((k, i) => ion(layer, k, SLOTS[(i * 17) % SLOTS.length][0], SLOTS[(i * 17) % SLOTS.length][1], k === 'H' ? 1.1 : 0.95));
      const k = MIX.kind(a, b); liq.setAttribute('fill', a && b ? ind('btb', k) : '#dbe9f2'); liq.setAttribute('fill-opacity', 0.35);
      const r = MIX.temp(a, b);
      tv.textContent = r.T.toFixed(1);
      tsrc.textContent = !a || !b ? '한 가지만 — 반응 없음' : r.src === 'book' ? '교과서 51쪽 예시 값' : '모형 값';
      dot.setAttribute('cx', mx(a)); dot.setAttribute('cy', my(r.T));
      lab.textContent = `염산 ${a} mL + 수산화 나트륨 ${b} mL`;
      out.H.textContent = h; out.OH.textContent = oh; out.W.textContent = w; out.Cl.textContent = a; out.Na.textContent = b;
      kindEl.innerHTML = `<i class="ab-dot" style="--c:${ind('btb', k)}"></i>${!a || !b ? (a ? '산성(염산만)' : '염기성(수산화 나트륨만)') : { a: 'H⁺이 남아 산성', n: '모두 반응해 중성', b: 'OH⁻이 남아 염기성' }[k]}`;
      tEl.textContent = r.T.toFixed(1);
      mini.textContent = w === 6 ? '물 분자가 가장 많다 → 중화열이 가장 많아 온도가 가장 높다.' : w ? `물 분자 ${w}개. 같은 수의 물이 생기는 짝(염산 ${b} mL + 수산화 나트륨 ${a} mL)도 최고 온도가 거의 같다.` : '';
    }
    range.addEventListener('input', paint); range.addEventListener('keydown', (e) => e.stopPropagation());
    paint();
    root._sc = { set(v) { range.value = String(v); paint(); } };
    return {};
  }
  window.ABScrub = { mount };
})();
