/* 1-1 2차시 표지 «되로 주고 말로 받는다»(교과서 18쪽 도입). 되로 쌀을 퍼서 말에 붓는다.
   «우리 마을 되»는 10번에 말이 차고, «이웃 마을 되»는 더 커서 8번이면 찬다 → 같은 «한 되»라도 쌀의 양이 다르다.
   Doe.mount(root) → {} · 시험용: root._doe.pour() · town('a'|'b') */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, at, par) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; };
  const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TOWN = { a: { k: 1, name: '우리 마을 되', kg: 1.6 }, b: { k: 1.25, name: '이웃 마을 되', kg: 2.0 } };
  const MAL = 10;   // 말의 들이(우리 마을 되로 10되)

  function mount(root) {
    const svg = root.querySelector('.de-svg'), btn = root.querySelector('.de-pour'), towns = [...root.querySelectorAll('.de-town button')];
    const now = root.querySelector('.de-now'), cnt = root.querySelector('.de-cnt');
    el('rect', { x: 0, y: 0, width: 1000, height: 620, fill: '#f6efe0' }, svg);
    el('rect', { x: 0, y: 470, width: 1000, height: 150, fill: '#d8c3a0' }, svg);
    for (let i = 0; i < 12; i++) el('line', { x1: i * 90, y1: 470, x2: i * 90 - 40, y2: 620, stroke: '#c4ab84', 'stroke-width': 3 }, svg);
    // 쌀가마
    const sack = el('g', {}, svg);
    el('path', { d: 'M60 470 Q40 330 90 300 L210 300 Q260 330 240 470 Z', fill: '#e9dcc0', stroke: '#7d6f57', 'stroke-width': 4 }, sack);
    el('path', { d: 'M90 300 Q150 270 210 300', fill: '#f8f4ea', stroke: '#7d6f57', 'stroke-width': 3 }, sack);
    el('text', { x: 150, y: 405, 'text-anchor': 'middle', class: 'de-lab' }, sack).textContent = '쌀';
    // 되(바닥이 좁은 네모 그릇) — 크기는 마을마다
    const doe = el('g', { class: 'de-doe' }, svg);
    const doeBody = el('path', { fill: '#b98a52', stroke: '#5b4630', 'stroke-width': 4 }, doe);
    const doeRice = el('path', { fill: '#fbf7ec', stroke: '#d8cdb5', 'stroke-width': 2 }, doe);
    const doeName = el('text', { 'text-anchor': 'middle', class: 'de-lab' }, doe);
    // 말(큰 통) + 눈금
    const MX = 620, MY = 470, MW = 280, MH = 300;
    el('path', { d: `M${MX} ${MY} L${MX - 14} ${MY - MH} L${MX + MW + 14} ${MY - MH} L${MX + MW} ${MY} Z`, fill: '#8d6a3e', stroke: '#4a3826', 'stroke-width': 5 }, svg);
    const clip = el('clipPath', { id: 'de-clip' }, el('defs', {}, svg));
    el('path', { d: `M${MX + 8} ${MY - 6} L${MX - 4} ${MY - MH + 8} L${MX + MW + 4} ${MY - MH + 8} L${MX + MW - 8} ${MY - 6} Z` }, clip);
    el('rect', { x: MX - 20, y: MY - MH, width: MW + 40, height: MH, fill: '#5e452b' }, el('g', { 'clip-path': 'url(#de-clip)' }, svg));
    const riceG = el('g', { 'clip-path': 'url(#de-clip)' }, svg);
    const rice = el('rect', { x: MX - 20, y: MY, width: MW + 40, height: 0, fill: '#fbf7ec' }, riceG);
    for (let i = 1; i < MAL; i++) { const y = MY - 8 - (MH - 16) * i / MAL; el('line', { x1: MX + MW - 6, y1: y, x2: MX + MW + 18, y2: y, stroke: '#4a3826', 'stroke-width': 2 }, svg); }
    el('text', { x: MX + MW / 2, y: MY + 46, 'text-anchor': 'middle', class: 'de-lab' }, svg).textContent = '말 (한 말)';
    const full = el('text', { x: MX + MW / 2, y: MY - MH - 24, 'text-anchor': 'middle', class: 'de-full' }, svg);
    const stream = el('g', { class: 'de-stream' }, svg);

    let town = 'a', n = 0, busy = false; const done = { a: 0, b: 0 };
    function shape() {
      const k = TOWN[town].k, w = 120 * k, h = 90 * k, x = 330, y = 470;
      doeBody.setAttribute('d', `M${x - w / 2} ${y - h} L${x + w / 2} ${y - h} L${x + w / 2 - 14} ${y} L${x - w / 2 + 14} ${y} Z`);
      doeRice.setAttribute('d', `M${x - w / 2 + 4} ${y - h + 2} Q${x} ${y - h - 26 * k} ${x + w / 2 - 4} ${y - h + 2} Z`);
      doeName.setAttribute('x', x); doeName.setAttribute('y', y + 40); doeName.textContent = TOWN[town].name;
    }
    function level() {
      const v = Math.min(1, n * TOWN[town].k / MAL); rice.setAttribute('y', MY - (MH - 8) * v); rice.setAttribute('height', (MH - 8) * v);
      const fulln = v >= 0.999;
      full.textContent = fulln ? `${n}되로 한 말이 찼다!` : '';
      cnt.textContent = `${n}되`;
      btn.disabled = fulln;
      return fulln;
    }
    function say() {
      now.textContent = done.a && done.b ? '같은 «한 되», 같은 «한 말»인데 붓는 횟수가 달랐다' : done.a ? '② «이웃 마을 되»로 바꿔 다시 부어 보자' : '① «한 되 붓기»를 눌러 말을 채우자';
      now.classList.toggle('done', !!(done.a && done.b));
    }
    function pour() {
      if (busy || btn.disabled) return; busy = true;
      const fin = () => { n += 1; busy = false; if (level()) { done[town] = n; root.dispatchEvent(new CustomEvent('de-full', { detail: { ...done } })); } say(); };
      if (reduce() || !window.gsap) { fin(); return; }
      stream.textContent = '';
      for (let i = 0; i < 18; i++) { const c = el('circle', { cx: 330 + (i % 5 - 2) * 6, cy: 360, r: 5, fill: '#fbf7ec', stroke: '#c4b48f', 'stroke-width': 1 }, stream); gsap.to(c, { attr: { cx: MX + MW / 2 + (i % 7 - 3) * 18, cy: MY - 30 }, duration: 0.55, delay: i * 0.02, ease: 'power1.in', onComplete: () => c.remove() }); }
      gsap.fromTo(doe, { rotation: 0, transformOrigin: '330px 430px' }, { rotation: 28, duration: 0.25, yoyo: true, repeat: 1, ease: 'power1.inOut' });
      setTimeout(fin, 650);
    }
    btn.addEventListener('click', pour);
    towns.forEach((b) => b.addEventListener('click', () => { town = b.dataset.t; towns.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); n = 0; shape(); level(); say(); }));
    shape(); level(); say();
    root._doe = { pour, town: (t) => towns.find((b) => b.dataset.t === t).click(), done };
    return {};
  }
  window.Doe = { mount };
})();
