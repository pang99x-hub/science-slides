/* 2차시 표지: 꿀벌 몰기(교과서 28쪽 «박쥐와 꿀벌은 꽃가루를 옮겨 식물의 번식을 돕는다»).
   꿀벌은 손가락(마우스)을 따라 난다. 꽃에 닿으면 그 꽃의 꽃가루를 묻히고, 묻혀 온 꽃가루가 같은 종의 다른 꽃이면 그 꽃에 열매가 맺힌다.
   다른 종의 꽃가루로는 열매가 맺히지 않는다. 꽃 수는 그림을 위한 것. */
(function () {
  'use strict';
  const { el, hold, clamp } = window.Kit;
  const W = 660, H = 380;
  const SPP = { a: { name: '분홍 꽃', c: '#ef8fb4' }, b: { name: '파란 꽃', c: '#6c8fe0' } };
  const SPOTS = [[90, 270, 'a'], [190, 310, 'b'], [280, 250, 'a'], [370, 320, 'b'], [450, 260, 'a'], [540, 300, 'b'], [610, 240, 'a'], [150, 210, 'b'], [500, 200, 'a']];

  function mount(root) {
    const svg = root.querySelector('.be-svg'), now = root.querySelector('.be-now'), read = root.querySelector('.be-read');
    el('rect', { class: 'be-sky', width: W, height: H }, svg);
    el('path', { class: 'be-hill', d: `M0 150 C 150 110 300 150 420 120 S 600 100 ${W} 120 V ${H} H 0 Z` }, svg);
    for (let i = 0; i < 9; i++) { const x = 30 + i * 74; el('path', { class: 'be-root', d: `M${x} 150 q -6 30 4 60 M${x} 175 q 14 10 18 26` }, svg); el('circle', { class: 'be-tree', cx: x, cy: 118 - (i % 3) * 6, r: 22 }, svg); }
    el('text', { class: 'be-note', x: 645, y: 30 }, svg).textContent = '나무뿌리는 흙이 쓸려';
    el('text', { class: 'be-note', x: 645, y: 52 }, svg).textContent = '내려가지 않게 붙잡는다';
    const flowers = SPOTS.map(([x, y, k]) => {
      const g = el('g', { class: 'be-fl', transform: `translate(${x} ${y})` }, svg);
      el('path', { class: 'be-stem', d: 'M0 0 v 60' }, g);
      for (let i = 0; i < 5; i++) { const a = i * 72 * Math.PI / 180; el('ellipse', { cx: 14 * Math.cos(a), cy: 14 * Math.sin(a), rx: 11, ry: 8, transform: `rotate(${i * 72} ${14 * Math.cos(a)} ${14 * Math.sin(a)})`, fill: SPP[k].c, class: 'be-pet' }, g); }
      el('circle', { r: 8, class: 'be-mid' }, g);
      const fruit = el('g', { class: 'be-fruit' }, g); el('circle', { cx: 0, cy: 0, r: 13, fill: k === 'a' ? '#d6402f' : '#3a4aa8' }, fruit); el('path', { d: 'M0 -13 q 4 -8 10 -8', class: 'be-stem' }, fruit);
      return { x, y, k, g, done: false, cool: 0 };
    });
    const bee = el('g', { class: 'be-bee' }, svg);
    const wing = el('g', { class: 'be-wing' }, bee);
    el('ellipse', { cx: -4, cy: -16, rx: 11, ry: 8 }, wing); el('ellipse', { cx: 8, cy: -15, rx: 9, ry: 7 }, wing);
    el('ellipse', { rx: 18, ry: 12, class: 'be-body' }, bee);
    el('path', { d: 'M-5 -11 v 22 M5 -11 v 22', class: 'be-band' }, bee);
    el('circle', { cx: 17, cy: -2, r: 6, class: 'be-head' }, bee);
    const dust = el('g', {}, bee); const dots = [[-10, 8], [0, 12], [10, 9], [-14, 0]].map(([a, b]) => el('circle', { cx: a, cy: b, r: 3.4, class: 'be-dust' }, dust));
    let bx = 330, by = 90, tx = 330, ty = 90, carry = null, from = null, n = 0, t = 0;
    function say(msg) { read.innerHTML = msg; }
    function visit(f) {
      if (f.cool > 0) return; f.cool = 1.2;
      f.g.classList.add('hit'); setTimeout(() => f.g.classList.remove('hit'), 300);
      if (carry && carry === f.k && from !== f && !f.done) {
        f.done = true; n++; f.g.classList.add('done');
        say(`<b>열매가 맺혔다!</b> 꿀벌이 ${SPP[f.k].name}의 꽃가루를 같은 종의 다른 꽃에 옮겼다 (${n}/${flowers.length})`);
      } else if (carry && carry !== f.k) say('다른 종의 꽃가루로는 열매가 맺히지 않는다');
      else if (!carry) say(`${SPP[f.k].name}의 꽃가루를 묻혔다 — 같은 종의 다른 꽃으로 가 보자`);
      carry = f.k; from = f; dots.forEach((d) => d.setAttribute('fill', SPP[f.k].c)); dust.classList.add('on');
      now.textContent = n >= flowers.length ? '모든 꽃에 열매가 맺혔다!' : n ? `열매 ${n}개 · 더 옮겨 보자` : '같은 색 꽃을 차례로 들러 보자';
    }
    const aim = (p) => { tx = clamp(p.x, 20, W - 20); ty = clamp(p.y, 20, H - 20); };
    hold(svg, { hover: aim, down: aim, move: aim }, svg);
    const loop = window.Kit.ticker((dt) => {
      t += dt;
      const k = 1 - Math.exp(-dt * 5); bx += (tx - bx) * k; by += (ty - by) * k;
      const wob = Math.sin(t * 9) * 3;
      bee.setAttribute('transform', `translate(${bx.toFixed(1)} ${(by + wob).toFixed(1)}) scale(${tx < bx - 2 ? -1 : 1} 1)`);
      wing.setAttribute('transform', `scale(1 ${Math.sin(t * 50) > 0 ? 1 : 0.4})`);
      flowers.forEach((f) => { f.cool = Math.max(0, f.cool - dt); if (Math.hypot(f.x - bx, f.y - by) < 26) visit(f); });
    });
    say('꿀벌을 꽃으로 데려가 보자');
    root._bee = {
      fly(path) { path.forEach(([x, y]) => { bx = x; by = y; tx = x; ty = y; flowers.forEach((f) => { if (Math.hypot(f.x - bx, f.y - by) < 26) { f.cool = 0; visit(f); } }); }); },
      spots: () => flowers.map((f) => [f.x, f.y, f.k]),
    };
    return { setActive(on) { if (on) loop.start(); else loop.stop(); } };
  }
  window.Bee = { mount };
})();
