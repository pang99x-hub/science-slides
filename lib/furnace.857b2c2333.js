/* 2차시 6장(교과서 44쪽 철의 제련): 용광로 단면과 풀무.
   풀무 손잡이를 아래로 누를 때마다(누른 길이만큼) 바람 air가 들어가고, 바람은 저절로 줄어든다.
   불 세기 heat는 바람을 천천히 따라간다. heat가 있을 때 아래에서 CO 분자가 생겨 올라가며(2C + O₂ → 2CO),
   광석 덩어리를 지나면 O 하나를 얻어 CO₂가 된다(Fe₂O₃ + 3CO → 2Fe + 3CO₂). 광석은 내려오며 회색 철이 되고, 녹은 철이 바닥에 고인다.
   철이 많이 고이면 출선구로 흘러 국자에 담긴다. 석회석은 불순물과 만나 슬래그(노란 층)가 되어 철 위에 뜬다. 값은 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const { el, clamp, pt, hold, atom, mix, keep } = window.RX;
  const SHAFT = 'M420 70 L 560 70 L 640 360 L 610 600 L 410 600 L 380 360 Z';
  const halfW = (y) => (y < 360 ? 70 + (y - 70) / 290 * 60 : 130 - (y - 360) / 240 * 30);

  function mount(root) {
    const svg = root.querySelector('.rx-fu-svg');
    const now = root.querySelector('.rx-fu-now');
    const q = (s) => root.querySelector(s);
    const cards = { c: q('.rx-eqc[data-k="c"]'), fe: q('.rx-eqc[data-k="fe"]') };
    el('rect', { x: 0, y: 0, width: 1056, height: 740, fill: '#ece7e3' }, svg);
    el('rect', { x: 0, y: 680, width: 1056, height: 60, fill: '#8a8f96' }, svg);
    // 바깥 벽
    el('path', { d: 'M396 40 L 584 40 L 676 360 L 646 640 L 374 640 L 344 360 Z', fill: '#7d6a5c', stroke: '#1d2433', 'stroke-width': 4 }, svg);
    el('path', { d: SHAFT, fill: '#3a2a24' }, svg);
    const glow = el('path', { d: 'M394 440 L 626 440 L 610 600 L 410 600 Z', fill: '#e2622b', opacity: 0 }, svg);
    const defs = el('defs', {}, svg); const cp = el('clipPath', { id: 'rx-fu-cp' }, defs); el('path', { d: SHAFT }, cp);
    const inside = el('g', { 'clip-path': 'url(#rx-fu-cp)' }, svg);
    const lumps = [];
    for (let i = 0; i < 46; i++) {
      const kind = i % 5 === 4 ? 'lime' : i % 2 ? 'coke' : 'ore';
      const e = el('ellipse', { rx: 15 + (i % 3) * 3, ry: 11 + (i % 2) * 3, stroke: '#1d2433', 'stroke-width': 1.5 }, inside);
      lumps.push({ e, kind, y: 80 + (i * 11.7) % 470, x: 0.15 + ((i * 37) % 70) / 100, red: 0 });
    }
    const pool = el('rect', { x: 400, width: 220, fill: '#ffb02e' }, inside);
    const slag = el('rect', { x: 400, width: 220, fill: '#f2d36b' }, inside);
    const gasG = el('g', {}, inside);
    el('path', { d: SHAFT, fill: 'none', stroke: '#1d2433', 'stroke-width': 3 }, svg);
    // 출선구와 국자
    el('rect', { x: 640, y: 584, width: 60, height: 14, fill: '#5b4a40', stroke: '#1d2433', 'stroke-width': 2 }, svg);
    const pour = el('path', { d: 'M700 591 Q 740 600 748 640', fill: 'none', stroke: '#ffb02e', 'stroke-width': 10, 'stroke-linecap': 'round', opacity: 0 }, svg);
    el('path', { d: 'M700 630 L 800 630 L 790 690 L 710 690 Z', fill: '#5b6370', stroke: '#1d2433', 'stroke-width': 3 }, svg);
    const ladle = el('rect', { x: 712, width: 76, fill: '#ffb02e' }, svg);
    // 맨 위 가스
    const top = el('g', {}, svg);
    el('path', { d: 'M470 40 L 470 10 L 760 10', fill: 'none', stroke: '#9aa3ae', 'stroke-width': 18 }, top);
    // 풀무
    const bel = el('g', {}, svg);
    el('path', { d: 'M230 560 L 380 560', stroke: '#9aa3ae', 'stroke-width': 18 }, bel);
    const bag = el('path', { fill: '#a0784f', stroke: '#1d2433', 'stroke-width': 3 }, bel);
    el('rect', { x: 70, y: 600, width: 180, height: 20, rx: 6, fill: '#6b4f3a', stroke: '#1d2433', 'stroke-width': 3 }, bel);
    const lid = el('rect', { x: 70, width: 180, height: 18, rx: 6, fill: '#6b4f3a', stroke: '#1d2433', 'stroke-width': 3 }, bel);
    const handle = el('g', { class: 'rx-fu-handle' }, bel);
    el('rect', { x: 140, y: -70, width: 40, height: 70, fill: '#4a3426' }, handle);
    el('rect', { x: 110, y: -96, width: 100, height: 34, rx: 16, fill: '#2b3242', stroke: '#1d2433', 'stroke-width': 2 }, handle);
    const puffs = el('g', {}, svg);
    // 이름표
    const lab = (x, y, t, a = 'start') => { el('text', { class: 'rx-fu-lab', x, y, 'text-anchor': a }, svg).textContent = t; };
    lab(700, 130, '철광석 · 코크스 · 석회석'); lab(700, 158, '위에서 넣는다');
    lab(770, 40, '가스(CO₂ 등)');
    lab(700, 420, '일산화 탄소가 올라가며');
    lab(700, 448, '광석의 산소를 빼앗는다');
    lab(160, 654, '풀무', 'middle'); lab(700, 540, '노란 층: 슬래그(불순물)'); lab(700, 566, '그 아래: 녹은 철'); lab(300, 590, '바람');
    lab(750, 712, '녹은 철', 'middle');
    const legend = el('g', { transform: 'translate(40 40)' }, svg);
    [['#8a4b33', '철광석'], ['#26272c', '코크스'], ['#e9e4d8', '석회석']].forEach(([c, t], i) => { el('ellipse', { cx: 14, cy: 14 + i * 34, rx: 14, ry: 10, fill: c, stroke: '#1d2433', 'stroke-width': 1.5 }, legend); el('text', { class: 'rx-fu-lab', x: 36, y: 21 + i * 34 }, legend).textContent = t; });

    let hy = 440, air = 0, heat = 0, iron = 0, ladleV = 0, strokes = 0, T = 0;
    const gas = [];
    const setH = (y) => {
      const ny = clamp(y, 380, 520);
      if (ny > hy) { air = clamp(air + (ny - hy) * 0.006, 0, 1); if (ny - hy > 1) for (let i = 0; i < 2; i++) gas.push({ puff: true, x: 240, y: 560, life: 0, e: el('circle', { r: 8, fill: '#ffffff', opacity: 0.8 }, puffs) }); }
      if (ny >= 515 && hy < 515) strokes++;
      hy = ny;
      handle.setAttribute('transform', `translate(0 ${hy})`);
      lid.setAttribute('y', hy);
      bag.setAttribute('d', `M78 ${hy + 18} L 70 ${(hy + 600) / 2} L 78 600 L 242 600 L 250 ${(hy + 600) / 2} L 242 ${hy + 18} Z`);
    };
    setH(440);
    let grab = null;
    hold(svg, {
      down(e) { const p = pt(svg, e); if (p.x < 330) { grab = hy - p.y; svg.classList.add('holding'); } },
      move(e) { if (grab == null) return; setH(pt(svg, e).y + grab); },
      up() { grab = null; svg.classList.remove('holding'); },
    });
    keep(svg);
    svg.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { setH(hy + 40); e.preventDefault(); } if (e.key === 'ArrowUp') { setH(hy - 40); e.preventDefault(); } });

    function step(dt) {
      T += dt;
      air = Math.max(0, air - 0.07 * dt);
      heat += (air - heat) * Math.min(1, dt * 1.2);
      glow.setAttribute('opacity', (heat * 0.9).toFixed(2));
      // 덩어리가 내려온다
      const v = 6 + 40 * heat;
      lumps.forEach((l) => {
        l.y += v * dt;
        if (l.y > 300 && l.kind === 'ore') l.red = clamp(l.red + heat * 0.5 * dt, 0, 1);
        if (l.y > 590) { l.y = 80; l.red = 0; }
        const w = halfW(l.y);
        l.e.setAttribute('cx', 510 + (l.x - 0.5) * 2 * (w - 18)); l.e.setAttribute('cy', l.y);
        l.e.setAttribute('fill', l.kind === 'coke' ? mix('#26272c', '#ff7a2a', l.y > 470 ? heat * 0.7 : 0) : l.kind === 'lime' ? '#e9e4d8' : mix('#8a4b33', '#8d949c', l.red));
      });
      // CO 분자가 올라간다
      if (heat > 0.08 && Math.random() < heat * 6 * dt) {
        const g = el('g', {}, gasG); atom(g, 'C', -8, 0, 9, ''); atom(g, 'O', 9, 0, 8, ''); const ex = atom(g, 'O', -25, 0, 8, ''); ex.style.display = 'none';
        gas.push({ x: 450 + Math.random() * 120, y: 570, life: 0, e: g, ex, co2: false });
      }
      for (let i = gas.length - 1; i >= 0; i--) {
        const m = gas[i]; m.life += dt;
        if (m.puff) { m.x += 160 * dt; m.e.setAttribute('cx', m.x); m.e.setAttribute('opacity', Math.max(0, 0.8 - m.life)); if (m.x > 380) { m.e.remove(); gas.splice(i, 1); } continue; }
        m.y -= (60 + 60 * heat) * dt; m.x += Math.sin(m.life * 3 + i) * 0.6;
        if (!m.co2 && m.y < 420 && Math.random() < 1.2 * dt) { m.co2 = true; m.ex.style.display = ''; iron = clamp(iron + 0.012, 0, 1); }
        m.e.setAttribute('transform', `translate(${m.x} ${m.y})`);
        if (m.y < 60) { m.e.remove(); gas.splice(i, 1); }
      }
      // 녹은 철 · 슬래그 · 쏟기
      const pour1 = iron > 0.8;
      if (pour1) { iron -= 0.05 * dt; ladleV = clamp(ladleV + 0.05 * dt, 0, 1); }
      pour.setAttribute('opacity', pour1 ? 1 : 0);
      const ph = 6 + iron * 70;
      pool.setAttribute('y', 600 - ph); pool.setAttribute('height', ph);
      const sh = iron > 0.05 ? 6 + iron * 14 : 0;
      slag.setAttribute('y', 600 - ph - sh); slag.setAttribute('height', sh);
      ladle.setAttribute('y', 688 - ladleV * 52); ladle.setAttribute('height', ladleV * 52);
      q('.rx-fu-air').style.width = (air * 100) + '%'; q('.rx-fu-airv').textContent = air < 0.05 ? '없음' : air < 0.4 ? '약함' : '센 바람';
      q('.rx-fu-iron').style.width = (Math.max(iron, ladleV) * 100) + '%'; q('.rx-fu-ironv').textContent = pour1 ? '흘러나온다' : iron < 0.05 ? '아직' : '고인다';
      cards.c.classList.toggle('on', heat > 0.15); cards.fe.classList.toggle('on', heat > 0.3);
      now.textContent = strokes < 3 ? '① 풀무 손잡이를 위아래로 여러 번 밀어 보자' : iron < 0.3 && ladleV === 0 ? '계속 바람을 넣자 · 회색 분자(CO)를 따라가 보자' : heat < 0.1 ? '바람이 끊기자 불이 사그라든다' : '녹은 철이 어떻게 생겼는지 말해 보자';
      now.classList.toggle('done', iron >= 0.3 || ladleV > 0);
    }
    const loop = window.Stage.loop(step);
    step(0.016);
    return { setActive(on) { if (on) loop.start(); else loop.stop(); }, pump(n = 1) { for (let i = 0; i < n; i++) { setH(380); setH(520); } }, get state() { return { air, heat, iron }; } };
  }
  window.RxFurnace = { mount };
})();
