/* 1-2 1차시 이론 장 «눈금 읽기»(교과서 28쪽 측주: 측정에는 반올림 같은 어림이 따른다). 눈금 실린더(1 mL 눈금)의
   물 높이를 막대로 바꾸면, 오른쪽 돋보기에 눈금 사이를 10등분한 읽기(예: 75.5 mL)가 나온다. 마지막 자리는 어림한 값.
   Gauge.mount(root) → {} · 시험용: root._gg.set(mL) */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, at, par) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; };
  const LO = 70, HI = 80, Y0 = 470, Y1 = 50, CX = 220, W = 120;
  const yOf = (v) => Y0 - (v - LO) / (HI - LO) * (Y0 - Y1);
  function mount(root) {
    const svg = root.querySelector('.gg-svg'), range = root.querySelector('.gg-range'), out = root.querySelector('.gg-out');
    el('rect', { x: 0, y: 0, width: 900, height: 520, fill: '#f6f8f5' }, svg);
    const clip = el('clipPath', { id: 'gg-clip' }, el('defs', {}, svg)); el('rect', { x: CX - W / 2, y: Y1 - 20, width: W, height: Y0 - Y1 + 40 }, clip);
    el('rect', { x: CX - W / 2, y: Y1 - 20, width: W, height: Y0 - Y1 + 40, fill: '#fff', stroke: '#1d2433', 'stroke-width': 4 }, svg);
    const water = el('g', { 'clip-path': 'url(#gg-clip)' }, svg);
    const body = el('rect', { x: CX - W / 2, width: W, height: 600, fill: '#bfe0f2' }, water);
    const men = el('path', { fill: 'none', stroke: '#2a73b8', 'stroke-width': 4 }, water);
    for (let v = LO; v <= HI; v++) {
      const y = yOf(v), big = v % 5 === 0;
      el('line', { x1: CX + W / 2, y1: y, x2: CX + W / 2 - (big ? 46 : 26), y2: y, stroke: '#1d2433', 'stroke-width': big ? 3 : 2 }, svg);
      el('text', { x: CX + W / 2 + 10, y: y + 7, class: 'gg-n' }, svg).textContent = String(v);
    }
    el('text', { x: CX, y: Y0 + 46, 'text-anchor': 'middle', class: 'gg-l' }, svg).textContent = '눈금 실린더(mL)';
    // 돋보기
    const L = { x: 600, y: 260, r: 190 };
    el('line', { x1: CX + W / 2 + 4, y1: 0, x2: L.x - L.r, y2: L.y, class: 'gg-lk' }, svg);
    el('circle', { cx: L.x, cy: L.y, r: L.r, fill: '#fff', stroke: '#1d2433', 'stroke-width': 5 }, svg);
    const zc = el('clipPath', { id: 'gg-zc' }, svg.querySelector('defs')); el('circle', { cx: L.x, cy: L.y, r: L.r - 3 }, zc);
    const zoom = el('g', { 'clip-path': 'url(#gg-zc)' }, svg);
    const zin = el('g', {}, zoom);
    const zWater = el('rect', { x: L.x - 400, width: 800, height: 900, fill: '#bfe0f2' }, zin);
    const zMen = el('path', { fill: 'none', stroke: '#2a73b8', 'stroke-width': 6 }, zin);
    const zTicks = el('g', {}, zin);
    const eye = el('line', { x1: L.x - L.r + 10, x2: L.x + L.r - 10, stroke: '#d9483b', 'stroke-width': 3, 'stroke-dasharray': '10 8' }, zoom);
    const K = 18;   // 확대 배율(눈금 1칸 = 42px → 756px... 화면에서는 1 mL = K × 42)
    let v = 75.5;
    function set(x) {
      v = Math.round(Math.max(LO + 0.5, Math.min(HI - 0.5, x)) * 10) / 10; range.value = String(v);
      const y = yOf(v);
      body.setAttribute('y', y); men.setAttribute('d', `M${CX - W / 2} ${y - 8} Q${CX} ${y + 8} ${CX + W / 2} ${y - 8}`);
      // 돋보기 속: 물 높이(오목한 면의 아래쪽)를 가운데에 놓고 0.1 mL를 크게
      const s = (Y0 - Y1) / (HI - LO) * K / 4.5, cy = L.y;
      const zy = (u) => cy - (u - v) * s;
      zWater.setAttribute('y', cy); zMen.setAttribute('d', `M${L.x - L.r} ${cy - 30} Q${L.x} ${cy + 30} ${L.x + L.r} ${cy - 30}`);
      zTicks.textContent = '';
      for (let u = Math.floor(v) - 1; u <= Math.ceil(v) + 1; u++) {
        el('line', { x1: L.x + 30, y1: zy(u), x2: L.x + L.r, y2: zy(u), stroke: '#1d2433', 'stroke-width': 5 }, zTicks);
        el('text', { x: L.x + 40, y: zy(u) - 10, class: 'gg-zn' }, zTicks).textContent = `${u} mL`;
        for (let k = 1; k < 10; k++) el('line', { x1: L.x + 120, y1: zy(u + k / 10), x2: L.x + 150, y2: zy(u + k / 10), stroke: '#c3cecd', 'stroke-width': 2, 'stroke-dasharray': '4 4' }, zTicks);
      }
      eye.setAttribute('y1', cy + 30); eye.setAttribute('y2', cy + 30);
      const whole = Math.floor(v), tenth = Math.round((v - whole) * 10);
      out.innerHTML = `<b>${v.toFixed(1)} mL</b> = 눈금으로 확실한 <span class="gg-sure">${whole}</span> + 어림한 <span class="gg-est">0.${tenth}</span><small>눈금 사이를 10등분해 한 자리 더 읽는다(마지막 자리는 어림)</small>`;
    }
    range.addEventListener('input', () => set(+range.value));
    set(v);
    root._gg = { set };
    return {};
  }
  window.Gauge = { mount };
})();
