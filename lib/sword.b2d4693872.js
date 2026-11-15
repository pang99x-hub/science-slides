/* 1차시 표지(교과서 38쪽 도입): 박물관 진열장 속 철검 + 세월 다이얼.
   다이얼을 시계 방향으로 끌어 돌리면(0~270°) 세월 t가 흐르고, 칼날 곳곳의 녹 얼룩이 저마다의 문턱을 넘으며 번진다.
   되돌리면 갓 만든 칼로 돌아간다. 녹 얼룩 자리·문턱은 고정 난수(이해를 돕기 위한 그림). */
(function () {
  'use strict';
  const { el, clamp, smooth, pt, hold, mix, keep } = window.RX;

  function mount(root) {
    const svg = root.querySelector('.rx-sw-svg');
    const defs = el('defs', {}, svg);
    const steel = el('linearGradient', { id: 'rx-sw-steel', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    [[0, '#eef2f5'], [0.45, '#b9c2cb'], [0.55, '#8e99a5'], [1, '#d5dbe1']].forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, steel));
    const clip = el('clipPath', { id: 'rx-sw-clip' }, defs);
    const BLADE = 'M196 196 L 560 182 L 612 200 L 560 218 L 196 206 Z';
    el('path', { d: BLADE }, clip);

    // 진열장
    el('rect', { class: 'rx-sw-wall', x: 0, y: 0, width: 660, height: 470 }, svg);
    el('rect', { class: 'rx-sw-base', x: 40, y: 300, width: 580, height: 44, rx: 6 }, svg);
    el('rect', { class: 'rx-sw-cloth', x: 60, y: 120, width: 540, height: 180, rx: 4 }, svg);
    el('rect', { class: 'rx-sw-glass', x: 50, y: 40, width: 560, height: 262, rx: 6 }, svg);
    el('path', { class: 'rx-sw-shine', d: 'M90 60 l 70 0 l -60 220 l -40 0 z M190 60 l 18 0 l -60 220 l -18 0 z' }, svg);
    const label = el('g', {}, svg);
    el('rect', { class: 'rx-sw-plate', x: 420, y: 256, width: 170, height: 34, rx: 4 }, label);
    el('text', { class: 'rx-sw-pt', x: 505, y: 279 }, label).textContent = '철검 · 철기 시대';

    // 칼: 손잡이 + 날
    const sword = el('g', {}, svg);
    el('rect', { class: 'rx-sw-grip', x: 92, y: 190, width: 82, height: 22, rx: 8 }, sword);
    el('rect', { class: 'rx-sw-guard', x: 172, y: 168, width: 22, height: 66, rx: 6 }, sword);
    el('circle', { class: 'rx-sw-guard', cx: 86, cy: 201, r: 13 }, sword);
    const blade = el('path', { d: BLADE, fill: 'url(#rx-sw-steel)', stroke: '#1d2433', 'stroke-width': 2.5 }, sword);
    const dull = el('path', { d: BLADE, fill: '#6f6a64', opacity: 0 }, sword);
    const rustG = el('g', { 'clip-path': 'url(#rx-sw-clip)' }, sword);
    let seed = 11; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const spots = [];
    for (let i = 0; i < 70; i++) {
      const x = 200 + rnd() * 410, y = 182 + rnd() * 38, r = 5 + rnd() * 16;
      const th = Math.pow(rnd(), 0.9) * 0.85 + (x > 560 ? -0.1 : 0);
      const c = ['#a4461f', '#c25b2a', '#7d3417', '#b8642e'][i % 4];
      spots.push({ e: el('ellipse', { cx: x, cy: y, rx: r * 1.4, ry: r * 0.8, fill: c, opacity: 0 }, rustG), th, r });
    }
    // 부스러진 녹 조각(오래될수록 진열천 위에 떨어져 있다)
    const flakes = [];
    for (let i = 0; i < 16; i++) flakes.push({ e: el('circle', { cx: 230 + rnd() * 360, cy: 236 + rnd() * 50, r: 2 + rnd() * 3, fill: '#9b4520', opacity: 0 }, svg), th: 0.55 + rnd() * 0.4 });
    el('path', { d: BLADE, fill: 'none', stroke: '#1d2433', 'stroke-width': 2.5 }, sword);

    // 세월 다이얼
    const CX = 330, CY = 402, R = 46;
    const dial = el('g', { class: 'rx-sw-dial', tabindex: 0, role: 'slider', 'aria-label': '세월 다이얼', 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': 0 }, svg);
    const arc = (a0, a1, r) => {
      const p = (a) => [CX + r * Math.sin(a * Math.PI / 180), CY - r * Math.cos(a * Math.PI / 180)];
      const [x0, y0] = p(a0), [x1, y1] = p(a1);
      return `M${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
    };
    el('circle', { cx: CX, cy: CY, r: R + 30, fill: 'transparent' }, dial);
    el('path', { class: 'rx-sw-track', d: arc(-135, 135, R + 14) }, dial);
    const fillArc = el('path', { class: 'rx-sw-fill', d: arc(-135, -134, R + 14) }, dial);
    el('circle', { class: 'rx-sw-knob', cx: CX, cy: CY, r: R }, dial);
    for (let k = 0; k < 12; k++) el('rect', { class: 'rx-sw-grip2', x: CX - 3, y: CY - R + 4, width: 6, height: 12, rx: 3, transform: `rotate(${k * 30} ${CX} ${CY})` }, dial);
    const pointer = el('g', {}, dial);
    el('path', { class: 'rx-sw-ptr', d: `M${CX} ${CY - R + 18} L ${CX} ${CY - 6}` }, pointer);
    el('circle', { class: 'rx-sw-hub', cx: CX, cy: CY, r: 8 }, dial);
    el('text', { class: 'rx-sw-dt', x: CX - 96, y: CY + 52 }, svg).textContent = '만든 날';
    el('text', { class: 'rx-sw-dt', x: CX + 96, y: CY + 52 }, svg).textContent = '오늘';
    const era = el('text', { class: 'rx-sw-era', x: 520, y: 412 }, svg);
    const turn = el('text', { class: 'rx-sw-hint', x: 130, y: 412 }, svg); turn.textContent = '↻ 돌려 보자';

    let t = 0, ang = -135;
    function draw() {
      fillArc.setAttribute('d', arc(-135, Math.max(-134, ang), R + 14));
      pointer.setAttribute('transform', `rotate(${ang} ${CX} ${CY})`);
      spots.forEach((s) => s.e.setAttribute('opacity', (smooth(s.th, s.th + 0.22, t) * 0.92).toFixed(3)));
      flakes.forEach((f) => f.e.setAttribute('opacity', smooth(f.th, f.th + 0.1, t).toFixed(2)));
      dull.setAttribute('opacity', (smooth(0.05, 0.7, t) * 0.75).toFixed(3));
      blade.setAttribute('stroke', mix('#1d2433', '#5a2a14', t));
      era.textContent = t < 0.04 ? '갓 만든 칼' : t < 0.4 ? '땅속에서 세월이 흐른다' : t < 0.85 ? '녹이 번진다' : '오늘 · 박물관';
      dial.setAttribute('aria-valuenow', Math.round(t * 100));
      turn.style.opacity = t > 0.05 ? 0 : 1;
    }
    const set = (a) => { ang = clamp(a, -135, 135); t = (ang + 135) / 270; draw(); };
    const turnTo = (e) => {
      const p = pt(svg, e);
      let a = Math.atan2(p.x - CX, -(p.y - CY)) * 180 / Math.PI;
      if (Math.abs(a) > 135) a = ang > 0 ? 135 : -135;     // 아래 빈틈에서는 가까운 끝에 멈춘다
      if (Math.abs(a - ang) < 150) set(a);                  // 한 번에 반대쪽 끝으로 건너뛰지 않게
    };
    hold(dial, { down: turnTo, move: turnTo });
    keep(dial);
    dial.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { set(ang + 15); e.preventDefault(); }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { set(ang - 15); e.preventDefault(); }
    });
    draw();
    return { set: (v) => set(-135 + 270 * v), get t() { return t; } };
  }
  window.RxSword = { mount };
})();
