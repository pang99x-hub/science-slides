/* 1차시 2장(교과서 38~39쪽 그림 Ⅰ-20~22): 잎·석탄불·용광로 세 장면 위로 돋보기를 끈다.
   렌즈 안(clipPath)에만 분자 모형 층이 보인다. 한 장면을 1초쯤 비추면 오른쪽 기록이 채워지고, 셋을 다 보면 공통점 칸이 열린다.
   교과서 유의점: 이 장은 «산소가 관여한다»까지만 — 반응식·자세한 과정은 쓰지 않는다. 분자 수·빠르기는 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const { el, clamp, pt, hold, atom, f, keep } = window.RX;
  const W = 1056, H = 740, LR = 112;
  const PANELS = [
    { k: 'leaf', x0: 0, x1: 352, name: '잎', rec: '빛을 받은 잎에서 <b>산소</b>가 빠져나온다' },
    { k: 'fire', x0: 352, x1: 704, name: '석탄불', rec: '공기 중 <b>산소</b>가 불 속으로 들어가 이산화 탄소와 물(수증기)이 되어 나온다' },
    { k: 'iron', x0: 704, x1: 1056, name: '용광로', rec: '광석(산화 철(Ⅲ))에서 <b>산소</b>가 떨어져 나가고 철이 남는다' },
  ];

  // 분자 모형(원자 위치는 분자 중심 기준)
  function mol(p, kind, label) {
    const g = el('g', { class: 'rx-mol' }, p);
    const A = {
      O2: [['O', -10, 0, 12], ['O', 10, 0, 12]],
      CO2: [['O', -21, 0, 11], ['C', 0, 0, 12], ['O', 21, 0, 11]],
      H2O: [['H', -15, 9, 8], ['H', 15, 9, 8], ['O', 0, 0, 12]],
      CO: [['C', -9, 0, 12], ['O', 11, 0, 11]],
    }[kind];
    A.forEach(([k, x, y, r]) => atom(g, k, x, y, r, r > 9 ? k : ''));
    if (label) f(el('text', { class: 'rx-mlab', y: 30 }, g), label);
    return g;
  }

  function mount(root) {
    const svg = root.querySelector('.rx-ln-svg');
    const now = root.querySelector('.rx-ln-now');
    const recs = Object.fromEntries([...root.querySelectorAll('.rx-rec')].map((r) => [r.dataset.k, r]));
    const common = root.querySelector('.rx-ln-common');
    const defs = el('defs', {}, svg);
    const clip = el('clipPath', { id: 'rx-ln-clip' }, defs);
    const clipC = el('circle', { r: LR - 4 }, clip);

    // ---------- 눈으로 본 장면 ----------
    const macro = el('g', {}, svg);
    // 잎
    el('rect', { x: 0, y: 0, width: 352, height: H, fill: '#dff0f7' }, macro);
    const sun = el('g', {}, macro);
    el('circle', { cx: 70, cy: 70, r: 38, fill: '#ffd447', stroke: '#1d2433', 'stroke-width': 2.5 }, sun);
    for (let i = 0; i < 6; i++) el('path', { d: `M${110 + i * 18} ${90 + i * 22} l 40 26`, stroke: '#f2b417', 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0.7 }, sun);
    el('path', { d: 'M176 690 C 180 600, 170 520, 186 440', fill: 'none', stroke: '#4c7d3a', 'stroke-width': 10, 'stroke-linecap': 'round' }, macro);
    el('path', { class: 'rx-ln-leaf', d: 'M186 440 C 60 400, 40 250, 120 170 C 200 200, 300 300, 186 440 Z' }, macro);
    el('path', { d: 'M186 440 C 160 360, 140 270, 120 180', fill: 'none', stroke: '#2f6b2a', 'stroke-width': 4 }, macro);
    [[150, 340, 110, 310], [140, 290, 96, 250], [165, 380, 230, 340], [150, 300, 210, 260]].forEach(([a, b, c, d]) => el('path', { d: `M${a} ${b} L ${c} ${d}`, stroke: '#2f6b2a', 'stroke-width': 2.5 }, macro));
    el('text', { class: 'rx-ln-t', x: 176, y: 560 }, macro).textContent = '광합성';
    // 석탄불
    el('rect', { x: 352, y: 0, width: 352, height: H, fill: '#f5ebe0' }, macro);
    el('rect', { x: 400, y: 520, width: 256, height: 70, rx: 10, fill: '#6b6f78', stroke: '#1d2433', 'stroke-width': 3 }, macro);
    const flames = el('g', {}, macro);
    const flameP = [];
    [[468, 1], [528, 1.25], [590, 0.95]].forEach(([x, s]) => flameP.push({ e: el('path', { fill: '#f08a24', stroke: '#c8402f', 'stroke-width': 2.5 }, flames), x, s }));
    const inner = el('g', {}, macro);
    [[470], [528], [588]].forEach(([x]) => flameP.push({ e: el('path', { fill: '#ffd447' }, inner), x, s: 0.55 }));
    for (let i = 0; i < 9; i++) el('ellipse', { cx: 420 + (i % 5) * 50 + (i > 4 ? 25 : 0), cy: i > 4 ? 498 : 516, rx: 28, ry: 16, fill: '#2d2f36', stroke: '#1d2433', 'stroke-width': 2 }, macro);
    el('text', { class: 'rx-ln-t', x: 528, y: 640 }, macro).textContent = '연소';
    // 용광로
    el('rect', { x: 704, y: 0, width: 352, height: H, fill: '#ece7e3' }, macro);
    el('path', { class: 'rx-ln-fur', d: 'M800 70 L 960 70 L 1000 300 L 980 560 L 780 560 L 760 300 Z' }, macro);
    el('path', { d: 'M812 90 L 948 90 L 982 300 L 964 540 L 796 540 L 778 300 Z', fill: '#3a2a24' }, macro);
    const glow = el('path', { d: 'M790 360 L 970 360 L 964 540 L 796 540 Z', fill: '#e2622b', opacity: 0.85 }, macro);
    for (let i = 0; i < 14; i++) el('circle', { cx: 806 + (i % 7) * 24 + (i > 6 ? 12 : 0), cy: i > 6 ? 150 : 128, r: 11, fill: '#8a4b33', stroke: '#1d2433', 'stroke-width': 1.5 }, macro);
    el('rect', { x: 796, y: 506, width: 168, height: 34, fill: '#ffb02e' }, macro);
    el('path', { d: 'M964 520 L 1030 540 L 1030 556 L 964 540 Z', fill: '#ffb02e', stroke: '#1d2433', 'stroke-width': 2 }, macro);
    el('text', { class: 'rx-ln-t', x: 880, y: 620 }, macro).textContent = '철의 제련';
    [352, 704].forEach((x) => el('line', { x1: x, y1: 0, x2: x, y2: H, stroke: '#1d2433', 'stroke-width': 3 }, macro));
    const seenMark = PANELS.map((p) => { const g = el('g', { class: 'rx-ln-seen', transform: `translate(${p.x1 - 44} 40)` }, svg); el('circle', { r: 22 }, g); el('path', { d: 'M-10 0 l 7 8 l 13 -16' }, g); return g; });

    // ---------- 렌즈 속 분자 모형 ----------
    const micro = el('g', { 'clip-path': 'url(#rx-ln-clip)' }, svg);
    el('rect', { x: 0, y: 0, width: W, height: H, fill: '#ffffff', opacity: 0.86 }, micro);
    const movers = [];
    // 잎: CO₂가 들어오고, 물은 줄기로 올라오고, O₂가 나간다
    for (let i = 0; i < 4; i++) movers.push({ g: mol(micro, 'CO2', i === 0 ? 'CO_2' : ''), a: [20, 200 + i * 70], b: [150, 300 + i * 18], ph: i / 4, sp: 0.18 });
    for (let i = 0; i < 3; i++) movers.push({ g: mol(micro, 'H2O', i === 0 ? 'H_2O' : ''), a: [176 + i * 6, 680], b: [176, 430], ph: i / 3, sp: 0.16 });
    for (let i = 0; i < 5; i++) movers.push({ g: mol(micro, 'O2', i === 0 ? 'O_2' : ''), a: [180 + (i % 2) * 30, 300 + i * 20], b: [300 - (i % 3) * 20, 40], ph: i / 5, sp: 0.2, hot: true });
    // 석탄불: O₂가 들어가고 CO₂·H₂O가 올라간다
    for (let i = 0; i < 6; i++) { const left = i % 2 === 0; movers.push({ g: mol(micro, 'O2', i === 0 ? 'O_2' : ''), a: [left ? 362 : 694, 380 + (i >> 1) * 40], b: [left ? 490 : 566, 480], ph: i / 6, sp: 0.22, hot: true }); }
    for (let i = 0; i < 4; i++) movers.push({ g: mol(micro, 'CO2', i === 0 ? 'CO_2' : ''), a: [470 + i * 34, 440], b: [440 + i * 50, 30], ph: i / 4, sp: 0.15 });
    for (let i = 0; i < 3; i++) movers.push({ g: mol(micro, 'H2O', i === 0 ? 'H_2O' : ''), a: [500 + i * 30, 430], b: [560 + i * 30, 40], ph: i / 3 + 0.15, sp: 0.15 });
    // 용광로: 광석 덩어리(Fe·O)에서 O가 떨어져 나가 CO와 만나 CO₂로 올라간다
    const ore = el('g', {}, micro);
    const oreAt = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) {
      const x = 812 + c * 46 + (r % 2) * 22, y = 250 + r * 42;
      oreAt.push({ k: 'Fe', x, y, g: atom(ore, 'Fe', x, y, 15) });
    }
    const oxy = [];
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
      const x = 800 + c * 42 + (r % 2) * 18, y = 228 + r * 44;
      if ((r * 5 + c) % 4 === 3) continue;
      oxy.push({ x, y, g: atom(ore, 'O', x, y, 11), off: 0 });
    }
    const coMol = mol(micro, 'CO', 'CO');
    const co2Up = mol(micro, 'CO2', 'CO_2');
    el('text', { class: 'rx-mlab big', x: 880, y: 400 }, micro).textContent = '광석 속 산화 철(Ⅲ)';

    // 돋보기
    const lens = el('g', { class: 'rx-ln-lens', tabindex: -1 }, svg);
    el('path', { class: 'rx-ln-handle', d: `M${LR * 0.72} ${LR * 0.72} l 70 70` }, lens);
    el('circle', { class: 'rx-ln-rim', r: LR }, lens);
    el('circle', { class: 'rx-ln-rim2', r: LR - 6 }, lens);
    let lx = 176, ly = 560;
    const placeLens = (x, y) => {
      lx = clamp(x, 40, W - 40); ly = clamp(y, 40, H - 40);
      lens.setAttribute('transform', `translate(${lx} ${ly})`);
      clipC.setAttribute('cx', lx); clipC.setAttribute('cy', ly);
    };
    placeLens(lx, ly);
    let grab = null;
    hold(svg, {
      down(e) { const p = pt(svg, e); grab = Math.hypot(p.x - lx, p.y - ly) < LR + 60 ? { dx: lx - p.x, dy: ly - p.y } : { dx: 0, dy: 0 }; placeLens(p.x + grab.dx, p.y + grab.dy); svg.classList.add('holding'); },
      move(e) { if (!grab) return; const p = pt(svg, e); placeLens(p.x + grab.dx, p.y + grab.dy); },
      up() { grab = null; svg.classList.remove('holding'); },
    });
    keep(svg);
    svg.addEventListener('keydown', (e) => {
      const d = { ArrowLeft: [-40, 0], ArrowRight: [40, 0], ArrowUp: [0, -40], ArrowDown: [0, 40] }[e.key];
      if (d) { placeLens(lx + d[0], ly + d[1]); e.preventDefault(); }
    });

    // ---------- 움직임 ----------
    const dwell = { leaf: 0, fire: 0, iron: 0 }, seen = new Set();
    let T = 0, oreT = 0, oreIdx = 0;
    function see(k) {
      if (seen.has(k)) return;
      seen.add(k);
      const p = PANELS.find((x) => x.k === k);
      recs[k].classList.add('on'); recs[k].querySelector('p').innerHTML = p.rec;
      seenMark[PANELS.indexOf(p)].classList.add('on');
      const left = PANELS.filter((x) => !seen.has(x.k));
      if (left.length) { now.textContent = `${left[0].name}도 비춰 보자 (${seen.size}/3)`; }
      else { now.textContent = '세 반응의 공통점은?'; now.classList.add('done'); common.classList.add('rx-on'); }
    }
    function step(dt) {
      T += dt;
      // 불꽃 일렁임
      flameP.forEach((fl, i) => {
        const h = (130 + 26 * Math.sin(T * 7 + i * 1.7)) * fl.s, w = 46 * fl.s;
        fl.e.setAttribute('d', `M${fl.x - w} 520 C ${fl.x - w} ${520 - h * 0.5}, ${fl.x - 6 + 8 * Math.sin(T * 5 + i)} ${520 - h * 0.8}, ${fl.x + 4 * Math.sin(T * 9 + i)} ${520 - h} C ${fl.x + 8} ${520 - h * 0.7}, ${fl.x + w} ${520 - h * 0.5}, ${fl.x + w} 520 Z`);
      });
      glow.setAttribute('opacity', (0.75 + 0.15 * Math.sin(T * 3)).toFixed(2));
      // 흐르는 분자
      movers.forEach((m) => {
        const u = (m.ph + T * m.sp) % 1;
        const x = m.a[0] + (m.b[0] - m.a[0]) * u + 10 * Math.sin(T * 2 + m.ph * 9);
        const y = m.a[1] + (m.b[1] - m.a[1]) * u;
        m.g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
        m.g.setAttribute('opacity', Math.min(1, u * 6, (1 - u) * 6).toFixed(2));
      });
      // 광석: 0.9초마다 산소 원자 하나가 CO와 만나 CO₂로 떠난다. 다 떠나면 철이 녹아내리고 다시 시작
      oreT += dt;
      const cyc = 1.3, i = Math.floor(oreT / cyc), u = (oreT % cyc) / cyc;
      if (i >= oxy.length + 2) { oreT = 0; oxy.forEach((o) => { o.g.setAttribute('transform', `translate(${o.x} ${o.y})`); o.g.setAttribute('opacity', 1); }); oreAt.forEach((a) => a.g.setAttribute('transform', `translate(${a.x} ${a.y})`)); return; }
      oxy.forEach((o, j) => {
        if (j < i) { o.g.setAttribute('opacity', 0); return; }
        if (j === i) {
          const tx = o.x + (u < 0.5 ? 0 : (u - 0.5) * 2 * 30), ty = o.y - (u < 0.5 ? u * 2 * 40 : 40 + (u - 0.5) * 2 * 160);
          o.g.setAttribute('transform', `translate(${tx} ${ty})`); o.g.setAttribute('opacity', u < 0.5 ? 1 : 0);
          coMol.setAttribute('transform', `translate(${o.x - 60 + u * 2 * 50} ${o.y - 40})`); coMol.setAttribute('opacity', u < 0.5 ? 1 : 0);
          co2Up.setAttribute('transform', `translate(${o.x + (u - 0.5) * 60} ${o.y - 40 - (u - 0.5) * 2 * 160})`); co2Up.setAttribute('opacity', u < 0.5 ? 0 : 1 - (u - 0.5) * 1.6);
        }
      });
      if (i >= oxy.length) { const k = Math.min(1, (oreT - oxy.length * cyc) / (cyc * 2)); oreAt.forEach((a) => a.g.setAttribute('transform', `translate(${a.x} ${a.y + k * (470 - a.y)})`)); coMol.setAttribute('opacity', 0); co2Up.setAttribute('opacity', 0); }
      // 렌즈가 머문 장면
      const p = PANELS.find((x) => lx >= x.x0 && lx < x.x1);
      if (p && ly > 60 && ly < 660) { dwell[p.k] += dt; if (dwell[p.k] > 1) see(p.k); }
    }
    const loop = window.Stage.loop(step);
    step(0.016);
    return {
      setActive(on) { if (on) { if (window.Stage.reduce) step(0.016); else loop.start(); } else loop.stop(); },
      fragment(fr, on) { if (fr.classList.contains('rx-ln-common') && on) PANELS.forEach((x) => see(x.k)); },
      lens: (x, y) => placeLens(x, y),
      see,
    };
  }
  window.RxLens = { mount };
})();
