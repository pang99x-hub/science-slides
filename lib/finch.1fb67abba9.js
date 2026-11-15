/* 3차시가 함께 쓰는 핀치(옆모습, 오른쪽을 봄) 그리기. 부리는 길이 L·두께 D로 정한다(교과서 24쪽 그림 Ⅰ-13의 네 부리).
   EvFinch.draw(부모, {L, D, col}) → g(g._beak로 부리 바꾸기) · EvFinch.TYPES 네 부리 · EvFinch.byT(t) 작은 씨앗(0)~큰 씨앗(1) 부리 */
(function () {
  'use strict';
  const K = window.EvKit, { el } = K;
  const TYPES = {
    insect: { L: 13, D: 11, name: '짧고 단단한 부리', food: '곤충' },
    tool: { L: 25, D: 6, name: '뾰족하고 가느다란 부리', food: '나무 구멍 속 곤충' },
    cactus: { L: 28, D: 10, name: '길고 뾰족한 부리', food: '선인장' },
    seed: { L: 19, D: 21, name: '크고 두꺼운 부리', food: '크고 단단한 씨앗' },
  };
  const beakD = (L, D) => `M22 ${-14 - D / 2} Q ${22 + L * 0.55} ${-14 - D / 2 - 1} ${22 + L} -13 Q ${22 + L * 0.5} ${-14 + D / 2 + 1} 22 ${-14 + D / 2} Z`;
  function draw(p, o = {}) {
    const L = o.L || 16, D = o.D || 12, col = o.col || '#6b5444';
    const g = el('g', {}, p);
    el('path', { d: 'M-22 2 L -44 10 L -40 -2 Z', fill: col, stroke: '#1d2433', 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
    el('path', { d: 'M-6 16 v 14 m 10 -14 v 14', stroke: '#c98c4a', 'stroke-width': 3, 'stroke-linecap': 'round' }, g);
    el('ellipse', { cx: -2, cy: 0, rx: 26, ry: 17, fill: col, stroke: '#1d2433', 'stroke-width': 2.2 }, g);
    el('path', { d: 'M-18 -4 Q -4 -12 10 -2 Q -4 6 -18 -4 Z', fill: K.hex(K.mix([107, 84, 68], [0, 0, 0], 0.25)), opacity: 0.8 }, g);
    el('circle', { cx: 14, cy: -14, r: 12, fill: col, stroke: '#1d2433', 'stroke-width': 2.2 }, g);
    const beak = el('path', { d: beakD(L, D), fill: '#e9b04a', stroke: '#1d2433', 'stroke-width': 2, 'stroke-linejoin': 'round' }, g);
    el('circle', { cx: 17, cy: -17, r: 2.6, fill: '#111' }, g);
    g._beak = (l, d) => beak.setAttribute('d', beakD(l, d));
    return g;
  }
  // 씨앗 크기에 맞춘 부리: 작은 씨앗(0) 짧고 가는 부리 → 큰 씨앗(1) 크고 두꺼운 부리
  const byT = (t) => ({ L: K.lerp(12, 20, t), D: K.lerp(7, 22, t) });
  window.EvFinch = { TYPES, draw, byT };
})();
