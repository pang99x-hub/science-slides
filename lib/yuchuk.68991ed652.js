/* 1-2 1차시 표지 «암행어사의 유척»(교과서 28쪽 도입). 마을 사람이 세금으로 바칠 베(옷감) 20자를
   관아의 자로 재어 내면, 유척을 대어 보는 순간 관아의 자가 더 길다는 것이 드러난다.
   «한 자 재기»를 누르면 자가 베 위를 한 칸씩 옮겨 간다. Yuchuk.mount(root) → {} · 시험용: root._yc.step() · check() */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, at, par) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; };
  const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const N = 20, YU = 40, GW = 48;      // 유척 한 자 = 40px, 관아의 자 = 48px(1.2배)
  function mount(root) {
    const svg = root.querySelector('.yc-svg'), stepB = root.querySelector('.yc-step'), chkB = root.querySelector('.yc-check'), now = root.querySelector('.yc-now'), cnt = root.querySelector('.yc-cnt');
    el('rect', { x: 0, y: 0, width: 1000, height: 560, fill: '#f3ead6' }, svg);
    el('rect', { x: 0, y: 380, width: 1000, height: 180, fill: '#c9a26c' }, svg);
    // 베 한 필(두루마리 + 펼친 천)
    const X0 = 20;
    el('rect', { x: X0, y: 220, width: N * GW + 6, height: 90, fill: '#f8f1df', stroke: '#b9a57e', 'stroke-width': 3 }, svg);
    for (let i = 0; i < 26; i++) el('line', { x1: X0, y1: 226 + i * 3.3, x2: X0 + N * GW + 6, y2: 226 + i * 3.3, stroke: '#ece0c4', 'stroke-width': 1 }, svg);
    const paid = el('rect', { x: X0, y: 220, width: 0, height: 90, fill: 'rgba(217,72,59,.18)' }, svg);
    // 관아의 자
    const ruler = el('g', { class: 'yc-ruler' }, svg);
    el('rect', { x: 0, y: 0, width: GW, height: 26, fill: '#7a4a1e', stroke: '#3b2410', 'stroke-width': 2 }, ruler);
    for (let k = 1; k < 10; k++) el('line', { x1: k * GW / 10, y1: 0, x2: k * GW / 10, y2: k === 5 ? 14 : 8, stroke: '#f3ead6', 'stroke-width': 1.5 }, ruler);
    el('text', { x: GW / 2, y: -8, 'text-anchor': 'middle', class: 'yc-lab' }, ruler).textContent = '관아의 자';
    // 유척(놋쇠, 아래)
    const yu = el('g', { class: 'yc-yu', opacity: 0 }, svg);
    for (let i = 0; i < 24; i++) {
      el('rect', { x: X0 + i * YU, y: 318, width: YU, height: 22, fill: i % 2 ? '#d9b44a' : '#c9a23a', stroke: '#6b5414', 'stroke-width': 1.5 }, yu);
      if (i % 4 === 3) el('text', { x: X0 + (i + 1) * YU, y: 360, 'text-anchor': 'middle', class: 'yc-num' }, yu).textContent = String(i + 1);
    }
    el('text', { x: X0, y: 380, class: 'yc-lab' }, yu).textContent = '유척(나라에서 정한 자)으로 잰 길이 →';
    const verdict = el('text', { x: 500, y: 140, 'text-anchor': 'middle', class: 'yc-ver' }, svg);
    let n = 0, checked = false, busy = false;
    const place = () => ruler.setAttribute('transform', `translate(${X0 + Math.min(n, N - 1) * GW} 190)`);
    function say() {
      cnt.textContent = `${n} / ${N}자`;
      now.textContent = checked ? '관아의 자 20자 = 유척으로 24자! 4자나 더 걷었다' : n >= N ? '② «유척을 대 보기»를 누르자' : '① «두 자씩 재기»를 눌러 베 20자를 재자';
      now.classList.toggle('done', checked);
      chkB.disabled = n < N; stepB.disabled = n >= N;
    }
    function step(times = 1) {
      if (busy) return;
      for (let t = 0; t < times && n < N; t++) n += 1;
      paid.setAttribute('width', n * GW);
      if (window.gsap && !reduce()) { busy = true; gsap.to(ruler, { attr: { transform: `translate(${X0 + Math.min(n, N - 1) * GW} 190)` }, duration: 0.18, onComplete: () => { busy = false; } }); } else place();
      say();
    }
    function check() {
      if (n < N || checked) return; checked = true;
      if (window.gsap && !reduce()) gsap.to(yu, { opacity: 1, duration: 0.6 }); else yu.setAttribute('opacity', 1);
      verdict.textContent = '«20자»라며 걷은 베가 유척으로 재니 24자';
      root.dispatchEvent(new CustomEvent('yc-check')); say();
    }
    stepB.addEventListener('click', () => step(2));
    chkB.addEventListener('click', check);
    place(); say();
    root._yc = { step, check, all: () => { n = N; paid.setAttribute('width', n * GW); place(); say(); } };
    return {};
  }
  window.Yuchuk = { mount };
})();
