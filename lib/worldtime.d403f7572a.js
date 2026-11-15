/* 1-1 2차시 «세계 시각의 기준»(교과서 22쪽 과학 이야기). 시간대 띠(경도 15°마다 1시간) 위 도시들의 시계가
   그리니치 시각 막대를 따라 함께 돈다. «기준»을 서울로 바꾸면 모든 도시의 «기준과의 차이»가 다시 매겨진다.
   도시 시차는 표준시 기준(서머타임 뺌). WorldTime.mount(root) → {} · 시험용: root._wt.set(그리니치 시각) · base('grw'|'seoul') */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, at, par) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; };
  const CITY = [['로스앤젤레스', -8, 0], ['뉴욕', -5, 1], ['런던', 0, 0], ['파리', 1, 1], ['카이로', 2, 2], ['뉴델리', 5.5, 2], ['베이징', 8, 0], ['서울', 9, 1], ['시드니', 10, 2]];
  const X0 = 30, X1 = 870, xOf = (o) => X0 + (o + 12) / 24 * (X1 - X0);
  const hm = (h) => { h = ((h % 24) + 24) % 24; const H = Math.floor(h), M = Math.round((h - H) * 60); return `${H < 12 ? '오전' : '오후'} ${H % 12 === 0 ? 12 : H % 12}:${String(M).padStart(2, '0')}`; };
  function mount(root) {
    const svg = root.querySelector('.wt-svg'), range = root.querySelector('.wt-range'), bases = [...root.querySelectorAll('.wt-base button')], say = root.querySelector('.wt-say');
    el('rect', { x: 0, y: 0, width: 900, height: 360, fill: '#eef3f6' }, svg);
    for (let o = -12; o < 12; o++) el('rect', { x: xOf(o), y: 40, width: (X1 - X0) / 24, height: 280, class: 'wt-zone ' + (o % 2 ? 'b' : 'a') }, svg);
    const night = el('rect', { y: 40, height: 280, class: 'wt-night' }, svg), night2 = el('rect', { y: 40, height: 280, class: 'wt-night' }, svg);
    const mer = el('g', { class: 'wt-mer' }, svg);
    const merX = xOf(0) + (X1 - X0) / 48;
    el('line', { x1: merX, y1: 30, x2: merX, y2: 324 }, mer);
    const merT = el('text', { x: merX, y: 22, 'text-anchor': 'middle' }, mer);
    const cards = CITY.map(([n, o, row]) => {
      const x = xOf(o) + (X1 - X0) / 48, y = [92, 170, 248][row], g = el('g', { class: 'wt-city' }, svg);
      el('circle', { cx: x, cy: 316, r: 6 }, g); el('line', { x1: x, y1: 316, x2: x, y2: y + 36, class: 'wt-pin' }, g);
      el('rect', { x: x - 54, y: y - 36, width: 108, height: 72, rx: 10 }, g);
      const t1 = el('text', { x, y: y - 14, 'text-anchor': 'middle', class: 'wt-n' }, g); t1.textContent = n;
      const t2 = el('text', { x, y: y + 8, 'text-anchor': 'middle', class: 'wt-t' }, g);
      const t3 = el('text', { x, y: y + 29, 'text-anchor': 'middle', class: 'wt-d' }, g);
      return { o, g, t2, t3, n };
    });
    el('text', { x: 450, y: 348, 'text-anchor': 'middle', class: 'wt-ax' }, svg).textContent = '← 서쪽 · 경도 15°마다 1시간 · 동쪽 →';
    let g = 3, base = 'grw';
    function set(v) {
      g = ((v % 24) + 24) % 24; range.value = String(g);
      const b = base === 'grw' ? 0 : 9;
      cards.forEach((c) => { const loc = g + c.o; c.t2.textContent = hm(loc); const h = ((loc % 24) + 24) % 24; c.g.classList.toggle('dark', h < 6 || h >= 18); c.g.classList.toggle('base', c.o === b); const d = c.o - b; c.t3.textContent = d === 0 ? '기준' : `${d > 0 ? '+' : ''}${d}시간`; });
      // 밤인 경도 범위(지방 시각 18~6시)를 어둡게
      const nx = (off) => xOf(off), s0 = 18 - g, len = 12; let a = ((s0 + 12) % 24 + 24) % 24 - 12;
      const w = (X1 - X0) / 24 * len, xa = nx(a);
      night.setAttribute('x', xa); night.setAttribute('width', Math.max(0, Math.min(w, X1 - xa)));
      night2.setAttribute('x', X0); night2.setAttribute('width', Math.max(0, xa + w - X1));
      merT.textContent = base === 'grw' ? '본초 자오선(그리니치)' : '본초 자오선 — 기준은 서울로';
      say.innerHTML = base === 'grw'
        ? `그리니치 <b>${hm(g)}</b> → 서울은 <b>9시간 빠른</b> ${hm(g + 9)}`
        : `서울을 기준(0)으로 하면 런던은 <b>-9시간</b>. 지도·시계·항공 시간표를 모두 새로 고쳐야 한다`;
    }
    range.addEventListener('input', () => set(+range.value));
    bases.forEach((x) => x.addEventListener('click', () => { base = x.dataset.b; bases.forEach((y) => y.setAttribute('aria-pressed', String(y === x))); set(g); }));
    set(g);
    root._wt = { set, base: (k) => bases.find((x) => x.dataset.b === k).click() };
    return {};
  }
  window.WorldTime = { mount };
})();
