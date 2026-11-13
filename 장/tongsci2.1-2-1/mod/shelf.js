/* 2차시 7장(교과서 45쪽 해 보기): 생활 속 물건 여섯을 한 선반에 두고, 로그 눈금 시간 막대(1초 ~ 30일)를 민다.
   물건마다 변하기 시작하는 때와 끝나는 때(초, 로그 눈금 사이를 부드럽게 잇는다)가 다르다 → 빠른 산화와 느린 산화.
   변한 물건을 누르면 무엇이 산화·환원되는지 오른쪽에 보인다. 시간 값은 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const { el, smooth, mix } = window.RX;
  const MAXS = 2.6e6;
  const IT = [
    { k: 'spark', name: '불꽃놀이 막대', a: 2, b: 60, g: 'fast', info: '금속 가루가 공기 중 산소를 얻어(<b class="rx-ox">산화</b>) 몇 초 만에 빛과 열을 낸다 — 빠른 산화(연소). 산소는 <b class="rx-red">환원</b>된다.' },
    { k: 'spoon', name: '은 숟가락 + 알루미늄 포일', a: 60, b: 900, g: 'fast', info: '소금물 속에서 검은 녹(황화 은) 속 Ag<sup>+</sup>가 전자를 받아 은 원자로 돌아가고(<b class="rx-red">환원</b>), 알루미늄은 전자를 잃어 <b class="rx-ox">산화</b>된다. 산소 없이 전자만 오간다.' },
    { k: 'bleach', name: '표백제와 누런 얼룩', a: 120, b: 2400, g: 'fast', info: '표백제가 얼룩의 색을 내는 물질을 <b class="rx-ox">산화</b>시켜 색이 사라진다. 머리 탈색도 같은 원리.' },
    { k: 'warm', name: '손난로', a: 20, b: 600, g: 'fast', info: '흔들면 속의 철 가루가 공기 중 산소를 얻어 <b class="rx-ox">산화</b>되며 몇 시간 동안 열을 낸다. 철을 다 쓰면 식는다.' },
    { k: 'apple', name: '깎은 사과', a: 600, b: 20000, g: 'slow', info: '과일 속 폴리페놀이 공기 중 산소로 <b class="rx-ox">산화</b>되어 갈색이 된다. 레몬즙을 바르거나 물에 담그면 늦출 수 있다.' },
    { k: 'nail', name: '젖은 철못', a: 90000, b: 1.6e6, g: 'slow', info: '물과 산소가 있으면 철이 산소를 얻어 붉은 녹(산화 철(Ⅲ))이 된다 — 며칠에 걸친 느린 <b class="rx-ox">산화</b>.' },
  ];
  const fmt = (s) => (s < 60 ? `${Math.round(s)}초` : s < 3600 ? `${Math.round(s / 60)}분` : s < 86400 ? `${Math.round(s / 3600)}시간` : `${Math.round(s / 86400)}일`);

  function mount(root) {
    const svg = root.querySelector('.rx-sh-svg');
    const range = root.querySelector('.rx-sh-range');
    const now = root.querySelector('.rx-sh-now'), clock = root.querySelector('.rx-sh-clock');
    const it = root.querySelector('.rx-sh-it'), ib = root.querySelector('.rx-sh-ib');
    const gl = Object.fromEntries([...root.querySelectorAll('.rx-sh-g')].map((g) => [g.dataset.g, g.querySelector('.rx-sh-gl')]));
    el('rect', { x: 0, y: 0, width: 1056, height: 740, fill: '#f6f1e8' }, svg);
    [350, 700].forEach((y) => el('rect', { x: 20, y, width: 1016, height: 18, rx: 4, fill: '#a87b4f', stroke: '#1d2433', 'stroke-width': 2.5 }, svg));
    const cells = IT.map((d, i) => {
      const x = 30 + (i % 3) * 340, y = (i < 3 ? 66 : 414);
      const g = el('g', { class: 'rx-sh-item', tabindex: 0, role: 'button', 'aria-label': d.name, transform: `translate(${x} ${y})` }, svg);
      el('rect', { class: 'rx-sh-hit', x: 0, y: 6, width: 320, height: 276, rx: 14 }, g);
      el('text', { class: 'rx-sh-name', x: 160, y: 272, 'text-anchor': 'middle' }, g).textContent = d.name;
      const done = el('text', { class: 'rx-sh-done', x: 300, y: 34, 'text-anchor': 'end' }, g);
      return { d, g, done, parts: {} };
    });
    const P = Object.fromEntries(cells.map((c) => [c.d.k, c]));
    // 그림
    { const g = P.spark.g, p = P.spark.parts;
      el('rect', { x: 70, y: 150, width: 200, height: 8, fill: '#6b7380' }, g);
      p.coat = el('rect', { x: 120, y: 144, width: 150, height: 20, rx: 6, fill: '#6f6a64', stroke: '#1d2433', 'stroke-width': 2 }, g);
      p.spark = el('g', {}, g); for (let i = 0; i < 12; i++) el('path', { d: `M0 0 L ${Math.cos(i * 0.52) * 40} ${Math.sin(i * 0.52) * 40}`, stroke: '#ffcf5a', 'stroke-width': 3 }, p.spark);
      p.ash = el('rect', { x: 120, y: 147, height: 14, fill: '#cfd3d6' }, g); }
    { const g = P.spoon.g, p = P.spoon.parts;
      el('rect', { x: 60, y: 90, width: 200, height: 160, fill: '#dff1f8', 'fill-opacity': 0.6, stroke: '#1d2433', 'stroke-width': 3 }, g);
      el('rect', { x: 66, y: 220, width: 188, height: 12, fill: '#cfd6dc', stroke: '#8d949c', 'stroke-width': 1.5 }, g);
      p.sp = el('path', { d: 'M90 210 L 200 150 a 26 18 -28 1 1 22 30 L 100 220 Z', stroke: '#1d2433', 'stroke-width': 2 }, g);
      el('text', { class: 'rx-sh-small', x: 160, y: 80, 'text-anchor': 'middle' }, g).textContent = '뜨거운 소금물'; }
    { const g = P.bleach.g, p = P.bleach.parts;
      el('path', { d: 'M90 70 L 130 50 L 190 50 L 230 70 L 260 120 L 230 135 L 225 250 L 95 250 L 90 135 L 60 120 Z', fill: '#ffffff', stroke: '#1d2433', 'stroke-width': 3 }, g);
      p.stain = el('ellipse', { cx: 160, cy: 170, rx: 40, ry: 28, fill: '#d9b84a' }, g);
      el('rect', { x: 240, y: 170, width: 40, height: 70, rx: 8, fill: '#7fb2f0', stroke: '#1d2433', 'stroke-width': 2 }, g); }
    { const g = P.warm.g, p = P.warm.parts;
      p.pack = el('rect', { x: 90, y: 80, width: 140, height: 170, rx: 18, stroke: '#1d2433', 'stroke-width': 3 }, g);
      el('text', { class: 'rx-sh-small', x: 160, y: 170, 'text-anchor': 'middle' }, g).textContent = '철 가루';
      p.wave = el('path', { d: 'M120 70 q 10 -15 0 -30 M160 70 q 10 -15 0 -30 M200 70 q 10 -15 0 -30', fill: 'none', stroke: '#e2622b', 'stroke-width': 4 }, g); }
    { const g = P.apple.g, p = P.apple.parts;
      el('path', { d: 'M160 80 C 70 60, 40 200, 160 250 C 280 200, 250 60, 160 80 Z', fill: '#c8402f', stroke: '#1d2433', 'stroke-width': 3 }, g);
      p.face = el('path', { d: 'M160 96 C 90 82, 70 196, 160 234 C 250 196, 230 82, 160 96 Z' }, g);
      el('path', { d: 'M150 150 l 6 18 l 6 -18', fill: '#4a3426' }, g); }
    { const g = P.nail.g, p = P.nail.parts;
      el('ellipse', { cx: 160, cy: 230, rx: 120, ry: 18, fill: '#9cc6e0', opacity: 0.6 }, g);
      p.nail = el('path', { d: 'M60 196 L 250 196 L 290 210 L 250 224 L 60 224 Z', stroke: '#1d2433', 'stroke-width': 2.5 }, g);
      el('rect', { x: 44, y: 182, width: 18, height: 56, rx: 4, fill: '#8d949c', stroke: '#1d2433', 'stroke-width': 2.5 }, g); }

    let t = 0, T = 0;
    const seen = new Set();
    const prog = (d, s) => smooth(Math.log10(d.a), Math.log10(d.b), Math.log10(Math.max(1, s)));
    function draw() {
      const s = Math.pow(10, t / 1000 * Math.log10(MAXS));
      clock.textContent = fmt(s) + ' 뒤';
      cells.forEach((c) => {
        const p = prog(c.d, s), q = c.parts;
        if (c.d.k === 'spark') { const L = 150 * (1 - p); q.coat.setAttribute('width', L); q.ash.setAttribute('x', 120 + L); q.ash.setAttribute('width', 150 - L); q.spark.setAttribute('transform', `translate(${120 + L} 154) rotate(${T * 200})`); q.spark.setAttribute('opacity', p > 0.02 && p < 0.98 ? 1 : 0); }
        if (c.d.k === 'spoon') q.sp.setAttribute('fill', mix('#2d2a28', '#e3e7ec', p));
        if (c.d.k === 'bleach') q.stain.setAttribute('opacity', (1 - p).toFixed(2));
        if (c.d.k === 'warm') { const cold = smooth(Math.log10(30000), Math.log10(80000), Math.log10(Math.max(1, s))); const h = p * (1 - cold); q.pack.setAttribute('fill', mix('#e8d9b8', '#f08a24', h)); q.wave.setAttribute('opacity', h.toFixed(2)); }
        if (c.d.k === 'apple') q.face.setAttribute('fill', mix('#f6efc8', '#a8733a', p));
        if (c.d.k === 'nail') q.nail.setAttribute('fill', mix('#a7aeb6', '#a4461f', p));
        c.done.textContent = p > 0.5 ? '변했다' : '';
        if (p > 0.5 && !seen.has(c.d.k)) seen.add(c.d.k);
      });
      ['fast', 'slow'].forEach((g) => { gl[g].textContent = IT.filter((d) => d.g === g && seen.has(d.k)).map((d) => d.name).join(' · ') || '—'; });
      now.textContent = seen.size < 3 ? '① 시간 막대를 오른쪽으로 천천히 밀어 보자' : seen.size < 6 ? '계속 밀어 한 달까지 가 보자' : '② 변한 물건을 눌러 무엇이 산화되는지 보자';
      now.classList.toggle('done', seen.size === 6);
    }
    function show(c) {
      const s = Math.pow(10, t / 1000 * Math.log10(MAXS));
      cells.forEach((x) => x.g.classList.toggle('on', x === c));
      it.textContent = c.d.name;
      ib.innerHTML = prog(c.d, s) < 0.3 ? '아직 거의 변하지 않았다 — 시간을 더 보내 보자.' : c.d.info;
    }
    cells.forEach((c) => {
      c.g.addEventListener('click', () => show(c));
      c.g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); show(c); } });
    });
    range.addEventListener('input', () => { t = +range.value; draw(); });
    range.addEventListener('keydown', (e) => e.stopPropagation());
    const loop = window.Stage.loop((dt) => { T += dt; draw(); });
    draw();
    return { setActive(on) { if (on) loop.start(); else loop.stop(); }, set(v) { t = v; range.value = v; draw(); }, show: (k) => show(P[k]) };
  }
  window.RxShelf = { mount };
})();
