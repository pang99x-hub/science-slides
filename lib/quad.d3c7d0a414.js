/* 1차시 설명 장 «종다양성»(교과서 27쪽): 풀밭에 놓은 방형구(1 m × 1 m) 안의 식물 24포기.
   «종 수» 막대(1~6종)와 «고른 정도» 막대(한 종에 몰림 ↔ 고름)를 끌면 방형구 안 식물·개체수 막대그래프·종다양성 눈금·풀이가 함께 바뀐다.
   위의 보기 단추(풀밭 가·나·다)는 정해 둔 예로 바로 간다. 개체수는 이해를 돕기 위한 예.
   눈금은 «무작위로 두 포기를 골랐을 때 다른 종일 확률»(심프슨 지수)을 쉬운 말로만 보여 준다(메모에 설명).
   시험용: root._qd.set(n, e) · root._qd.preset(k) */
(function () {
  'use strict';
  const { el } = window.Kit;
  const M = 24;
  const SP = [
    { n: '민들레', c: '#f2c230' }, { n: '토끼풀', c: '#e9efe6' }, { n: '제비꽃', c: '#8a5cc8' },
    { n: '질경이', c: '#4f8a3c' }, { n: '강아지풀', c: '#c9a85a' }, { n: '냉이', c: '#f7f3e6' },
  ];
  const PRESET = { ga: [4, 0], na: [4, 1], da: [6, 1] };
  function counts(n, e) {
    if (n === 1) return [M];
    const p1 = 1 / n + (1 - e) * (0.75 - 1 / n);
    const a = [Math.round(M * p1)]; const rest = M - a[0];
    for (let i = 1; i < n; i++) a.push(Math.floor(rest / (n - 1)) + (i <= rest % (n - 1) ? 1 : 0));
    return a;
  }
  const simpson = (a) => 1 - a.reduce((s, c) => s + (c / M) ** 2, 0);
  // 식물 그림(교과서 삽화처럼 잎·꽃을 갖춘 작은 그림)
  function plant(k, g) {
    const leaf = (d, f = '#5a9a45') => el('path', { d, fill: f, stroke: '#2f5a2a', 'stroke-width': 1.6, 'stroke-linejoin': 'round' }, g);
    if (k === 0) { // 민들레
      for (const a of [-60, -20, 20, 60, 100, 140, 180, 220]) leaf(`M0 0 l6 -6 l-3 -3 l6 -6 l-3 -3 l5 -8 l-7 2 l-2 -4 l-6 6 l-2 -3 l-4 9 z`, '#5f9e3f').setAttribute('transform', `rotate(${a})`);
      el('path', { d: 'M0 0 q2 -18 0 -30', stroke: '#6f8a3a', 'stroke-width': 3, fill: 'none' }, g);
      for (let i = 0; i < 14; i++) el('ellipse', { cx: 0, cy: -38, rx: 3, ry: 9, fill: '#f2c230', stroke: '#b98a12', 'stroke-width': 1, transform: `rotate(${i * 360 / 14} 0 -30)` }, g);
      el('circle', { cx: 0, cy: -30, r: 6, fill: '#e3a80f' }, g);
    } else if (k === 1) { // 토끼풀
      for (const [x, a] of [[-12, -20], [10, 15]]) {
        el('path', { d: `M0 0 q${x / 2} -8 ${x} -14`, stroke: '#4f8a3c', 'stroke-width': 2.4, fill: 'none' }, g);
        for (const r of [0, 120, 240]) el('ellipse', { cx: x, cy: -14 - 7, rx: 6, ry: 7.5, fill: '#5fa04a', stroke: '#2f5a2a', 'stroke-width': 1.3, transform: `rotate(${r + a} ${x} -14)` }, g);
      }
      el('path', { d: 'M0 0 q-2 -18 1 -32', stroke: '#5a8a3a', 'stroke-width': 2.6, fill: 'none' }, g);
      for (let i = 0; i < 12; i++) el('circle', { cx: 1 + 7 * Math.cos(i), cy: -38 + 6 * Math.sin(i * 1.7), r: 4, fill: '#fbfbf4', stroke: '#b9b8a8', 'stroke-width': 1 }, g);
      el('circle', { cx: 1, cy: -38, r: 4, fill: '#f0eee0' }, g);
    } else if (k === 2) { // 제비꽃
      for (const a of [-40, 0, 40]) leaf('M0 0 q-12 -10 -8 -24 q6 -6 8 2 q2 -8 8 -2 q4 14 -8 24 z', '#4f9545').setAttribute('transform', `rotate(${a})`);
      el('path', { d: 'M0 0 q6 -20 2 -32', stroke: '#5c8a3a', 'stroke-width': 2.4, fill: 'none' }, g);
      for (let i = 0; i < 5; i++) el('ellipse', { cx: 2, cy: -44, rx: 5.5, ry: 9, fill: '#8a5cc8', stroke: '#4e2f80', 'stroke-width': 1.2, transform: `rotate(${i * 72} 2 -36)` }, g);
      el('circle', { cx: 2, cy: -36, r: 3, fill: '#f2d64b' }, g);
    } else if (k === 3) { // 질경이
      for (const a of [-70, -30, 10, 50, 90, 140, 200]) {
        const p = leaf('M0 0 q-10 -12 0 -28 q10 16 0 28 z', '#4f8a3c'); p.setAttribute('transform', `rotate(${a})`);
        el('path', { d: 'M0 -2 v-22', stroke: '#2f5a2a', 'stroke-width': 1, transform: `rotate(${a})` }, g);
      }
      el('path', { d: 'M0 0 v-40', stroke: '#6f7a3a', 'stroke-width': 2.4 }, g);
      el('rect', { x: -3, y: -58, width: 6, height: 22, rx: 3, fill: '#a7a368', stroke: '#6b6a3a', 'stroke-width': 1 }, g);
    } else if (k === 4) { // 강아지풀
      for (const a of [-14, -4, 8, 18]) el('path', { d: `M0 0 q${a} -14 ${a * 1.8} -26`, stroke: '#6fa042', 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }, g);
      el('path', { d: 'M0 0 q3 -30 14 -46', stroke: '#7a9a3a', 'stroke-width': 2.4, fill: 'none' }, g);
      el('path', { d: 'M12 -44 q12 -6 16 6 q-6 4 -16 -6 z', fill: '#d8bc72', stroke: '#9a7a3a', 'stroke-width': 1.2 }, g);
      for (let i = 0; i < 7; i++) el('line', { x1: 13 + i * 2.2, y1: -44 + i * 0.6, x2: 15 + i * 2.2, y2: -52 + i * 1.6, stroke: '#b79a52', 'stroke-width': 1 }, g);
    } else { // 냉이
      for (const a of [-80, -40, 0, 40, 80, 120, 160]) leaf('M0 0 l-4 -8 l4 -2 l-4 -8 l4 -2 l-2 -8 l4 6 l2 -2 l2 10 l-2 2 l3 6 z', '#5a9a45').setAttribute('transform', `rotate(${a})`);
      el('path', { d: 'M0 0 q-2 -26 2 -50', stroke: '#6a8a3a', 'stroke-width': 2, fill: 'none' }, g);
      for (const [x, y] of [[-6, -26], [6, -32], [-5, -38]]) el('path', { d: `M${x * 0.2} ${y} l${x} -3 m0 0 l-3 -4 l6 0 z`, fill: '#a9c46a', stroke: '#4f6a2a', 'stroke-width': 1 }, g);
      for (const [x, y] of [[0, -52], [-4, -48], [4, -48]]) el('circle', { cx: x + 2, cy: y, r: 2.6, fill: '#fbfaf0', stroke: '#a9a890', 'stroke-width': 0.8 }, g);
    }
  }
  function mount(root) {
    const svg = root.querySelector('.qd-svg'), nIn = root.querySelector('.qd-n'), eIn = root.querySelector('.qd-e');
    const nv = root.querySelector('.qd-nv'), ev = root.querySelector('.qd-ev'), bars = root.querySelector('.qd-bars'), say = root.querySelector('.qd-say');
    const meter = root.querySelector('.qd-meter i'), mv = root.querySelector('.qd-mv'), presets = [...root.querySelectorAll('.qd-pre button')];
    // 배경: 풀밭 + 방형구 끈
    const defs = el('defs', {}, svg);
    const gr = el('linearGradient', { id: 'qd-grass', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el('stop', { offset: 0, 'stop-color': '#b9d58a' }, gr); el('stop', { offset: 1, 'stop-color': '#8fb862' }, gr);
    el('rect', { x: 0, y: 0, width: 900, height: 600, fill: 'url(#qd-grass)' }, svg);
    const rnd = window.Kit.rand(11);
    for (let i = 0; i < 260; i++) { const x = rnd() * 900, y = rnd() * 600; el('path', { d: `M${x} ${y} l${(rnd() - 0.5) * 6} -${6 + rnd() * 8}`, stroke: rnd() < 0.5 ? '#7aa452' : '#a3c477', 'stroke-width': 2, 'stroke-linecap': 'round' }, svg); }
    const Q = { x: 150, y: 54, w: 600, h: 520 };
    el('rect', { x: Q.x + 6, y: Q.y + 6, width: Q.w, height: Q.h, fill: 'none', stroke: 'rgba(0,0,0,.18)', 'stroke-width': 8 }, svg);
    el('rect', { x: Q.x, y: Q.y, width: Q.w, height: Q.h, fill: 'rgba(255,255,255,.08)', stroke: '#f4ecd2', 'stroke-width': 7, 'stroke-dasharray': '3 0' }, svg);
    el('rect', { x: Q.x, y: Q.y, width: Q.w, height: Q.h, fill: 'none', stroke: '#b89a5a', 'stroke-width': 2.5, 'stroke-dasharray': '10 8' }, svg);
    for (const [x, y] of [[Q.x, Q.y], [Q.x + Q.w, Q.y], [Q.x, Q.y + Q.h], [Q.x + Q.w, Q.y + Q.h]]) { el('rect', { x: x - 7, y: y - 7, width: 14, height: 14, rx: 2, fill: '#8a6a3a', stroke: '#4a3a1e', 'stroke-width': 2 }, svg); }
    el('rect', { x: Q.x + Q.w / 2 - 120, y: Q.y - 22, width: 240, height: 40, rx: 20, fill: '#fffaf0', stroke: '#1d2433', 'stroke-width': 2 }, svg);
    el('text', { x: Q.x + Q.w / 2, y: Q.y + 6, class: 'qd-tag', 'text-anchor': 'middle' }, svg).textContent = '방형구 1 m × 1 m';
    // 포기 자리: 6×4 칸에 흔들어 놓는다
    const slots = [];
    for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) slots.push({ x: Q.x + 55 + c * 98 + (rnd() - 0.5) * 40, y: Q.y + 112 + r * 122 + (rnd() - 0.5) * 34 });
    const order = slots.map((_, i) => i).sort(() => rnd() - 0.5);
    const gP = el('g', {}, svg);
    const plants = slots.map((p) => { const o = el('g', { transform: `translate(${p.x} ${p.y}) scale(1.35)` }, gP); const g = el('g', {}, o); return { g, p, k: -1 }; });
    // 막대그래프 줄
    const rows = SP.map((sp, i) => {
      const li = document.createElement('li'); li.innerHTML = `<span class="qd-sw" style="background:${sp.c}"></span><span class="qd-nm">${sp.n}</span><b class="bd-bar"><i></i></b><em>0</em>`;
      bars.appendChild(li); return li;
    });
    let N = 4, E = 0;
    function set(n, e, from) {
      N = Math.max(1, Math.min(6, Math.round(n))); E = Math.max(0, Math.min(1, e));
      nIn.value = String(N); eIn.value = String(Math.round(E * 100));
      const a = counts(N, E), kinds = [];
      a.forEach((c, k) => { for (let j = 0; j < c; j++) kinds.push(k); });
      order.forEach((si, j) => {
        const P = plants[si], k = kinds[j];
        if (P.k === k) return;
        P.k = k; P.g.innerHTML = ''; plant(k, P.g);
        if (window.gsap && from !== 'init') gsap.fromTo(P.g, { scale: 0.3, transformOrigin: '50% 100%' }, { scale: 1, duration: 0.35, ease: 'back.out(2)', delay: (j % 6) * 0.02 });
      });
      rows.forEach((li, k) => {
        const c = a[k] || 0; li.classList.toggle('off', k >= N);
        li.querySelector('i').style.width = (c / M * 100) + '%'; li.querySelector('em').textContent = k < N ? `${c}포기` : '–';
      });
      const D = simpson(a);
      meter.style.width = Math.round(D / 0.84 * 100) + '%';
      const lv = D < 0.3 ? '아주 낮다' : D < 0.6 ? '낮은 편' : D < 0.78 ? '높은 편' : '가장 높다';
      mv.textContent = lv;
      nv.textContent = `${N}종`;
      ev.textContent = N === 1 ? '–' : E < 0.25 ? '한 종에 몰림' : E < 0.75 ? '조금 고름' : '고름';
      const top = SP[0].n;
      say.innerHTML = N === 1 ? `한 종만 있다 → 종다양성이 <b>가장 낮다</b>. 농사짓는 밭처럼 한 작물만 기르는 곳이 이렇다.`
        : E < 0.25 ? `${N}종이 있지만 <b>${top}</b>이 ${a[0]}포기로 대부분이다 → 다른 종은 몇 포기만 사라져도 없어질 수 있다. 종 수가 같아도 <b>고르지 않으면</b> 종다양성이 낮다.`
          : E < 0.75 ? `${N}종, 조금씩 고르게 바뀌는 중 → 고를수록 눈금이 오른다.`
            : `${N}종이 <b>고르게</b> 있다 → 종 수가 <b>많을수록</b>, 고를수록 종다양성이 높다.`;
      presets.forEach((b) => { const [pn, pe] = PRESET[b.dataset.k]; b.setAttribute('aria-pressed', String(pn === N && Math.abs(pe - E) < 0.02)); });
      root.dispatchEvent(new CustomEvent('qd-set', { detail: { N, E } }));
    }
    nIn.addEventListener('input', () => set(+nIn.value, E));
    eIn.addEventListener('input', () => set(N, +eIn.value / 100));
    [nIn, eIn].forEach((x) => x.addEventListener('keydown', (e) => e.stopPropagation()));
    presets.forEach((b) => b.addEventListener('click', () => { const [n, e] = PRESET[b.dataset.k]; set(n, e); }));
    set(4, 0, 'init');
    root._qd = { set: (n, e) => set(n, e), preset: (k) => presets.find((b) => b.dataset.k === k).click() };
    return {};
  }
  window.BdQuad = { mount };
})();
