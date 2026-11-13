/* 1차시 2장: 개체 → 개체군 → 군집 → 생태계(교과서 72쪽 그림 Ⅱ-1). 풀밭의 사슴 한 마리를 두른 점선 고리를
   손가락으로 끌어 넓힌다(그림 어디를 끌어도 고리 가장자리가 손가락까지 온다). 고리 안에 든 생물에 따라 이름이 바뀌고,
   그림을 다 덮을 만큼 넓히면 빛·공기·물·토양·온도까지 들어와 «생태계»가 된다. */
(function () {
  'use strict';
  const { el, hold, clamp, draw } = window.Eco;
  const C = { x: 430, y: 520 };
  const ECO_R = 600, MAX_R = 760, MIN_R = 70;
  const LEVEL = {
    ind: { name: '개체', what: '스스로 살아가는 생물 한 마리(한 그루)' },
    pop: { name: '개체군', what: '한곳에 모여 사는 같은 종 개체들의 무리 — 한 종' },
    com: { name: '군집', what: '그곳에 사는 여러 개체군을 모두 합친 것 — 여러 종' },
    eco: { name: '생태계', what: '군집과 둘레 환경(빛·공기·물·토양·온도)이 서로 맞물려 돌아가는 체계' },
  };
  const ORDER = ['ind', 'pop', 'com', 'eco'];

  function scene(svg) {
    const defs = el('defs', {}, svg);
    const lg = el('linearGradient', { id: 'rg-skyg', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el('stop', { offset: 0, 'stop-color': '#cfe6f2' }, lg); el('stop', { offset: 1, 'stop-color': '#eef6ee' }, lg);
    el('rect', { x: -400, y: -300, width: 1856, height: 1300, fill: 'url(#rg-skyg)' }, svg);
    el('path', { class: 'rg-mt', d: 'M-400 300 L0 300 L140 190 L260 270 L400 150 L560 260 L700 170 L860 250 L1056 160 L1456 200 L1456 330 L-400 330 Z' }, svg);
    el('path', { class: 'rg-ground', d: 'M-400 320 L0 320 Q300 290 600 318 T1056 300 L1456 300 L1456 1000 L-400 1000 Z' }, svg);
    el('path', { class: 'rg-pond', d: 'M780 470 Q820 420 930 430 Q1040 440 1040 500 Q1030 570 900 572 Q790 570 780 470 Z' }, svg);
    const items = [];
    const add = (kind, g, x, y) => { g.classList.add('rg-it'); items.push({ kind, g, x, y }); return g; };
    // 멀리(군집 단계에서 들어오는 것)
    [[110, 360, 1.0], [250, 330, 0.8], [720, 350, 0.9], [980, 340, 0.75], [60, 470, 1.1]].forEach(([x, y, s]) => add('tree', draw.tree(svg, x, y, s), x, y - 60 * s));
    [[90, 600], [200, 520], [660, 600], [720, 470], [560, 380], [320, 380], [980, 610], [760, 610]].forEach(([x, y]) => add('grass', draw.grass(svg, x, y, 1.1), x, y - 10));
    [[690, 540, 0.9], [180, 610, 0.85], [240, 430, 0.8]].forEach(([x, y, s]) => add('rabbit', draw.rabbit(svg, x, y, s), x, y - 15));
    [[130, 420, 0.9], [770, 420, 0.8]].forEach(([x, y, s]) => add('squirrel', draw.squirrel(svg, x, y, s), x, y - 15));
    // 사슴 무리(개체군)
    [[300, 470, 0.9], [560, 470, 0.95], [480, 410, 0.8], [330, 600, 1.0], [560, 610, 0.95]].forEach(([x, y, s], i) => add('deer', draw.deer(svg, x, y, s, { doe: i % 2 === 1 }), x, y - 40 * s));
    // 가운데 한 마리(개체)
    add('deer', draw.deer(svg, C.x, C.y + 14, 1.15, { lying: true }), C.x, C.y);
    // 비생물요소 꼬리표
    const abio = [];
    const tag = (k, txt, x, y, icon) => {
      const g = el('g', { class: 'rg-ab', 'data-k': k, transform: `translate(${x} ${y})` }, svg);
      if (icon) icon(g);
      el('rect', { class: 'rg-abbox', x: -36, y: -20, width: 72, height: 36, rx: 18 }, g);
      el('text', { class: 'rg-abt', x: 0, y: 6 }, g).textContent = txt;
      abio.push(g); return g;
    };
    draw.sun(svg, 960, 80, 0.9);
    tag('light', '빛', 960, 150);
    tag('air', '공기', 560, 90);
    tag('temp', '온도', 330, 110);
    tag('water', '물', 910, 505);
    tag('soil', '토양', 640, 560);
    return { items, abio };
  }

  function mount(root) {
    const svg = root.querySelector('.rg-svg');
    const { items, abio } = scene(svg);
    const ring = el('circle', { class: 'rg-ring', cx: C.x, cy: C.y, r: 90 }, svg);
    const shade = el('path', { class: 'rg-shade' }, svg);
    const lab = el('g', { class: 'rg-lab' }, svg);
    const labBox = el('rect', { class: 'rg-labbox', x: -70, y: -24, width: 140, height: 44, rx: 22 }, lab);
    const labT = el('text', { class: 'rg-labt', x: 0, y: 8 }, lab);
    const knob = el('circle', { class: 'rg-knob', r: 18 }, svg);
    const hit = el('rect', { class: 'rg-hit', x: -400, y: -300, width: 1856, height: 1300 }, svg);
    svg.insertBefore(hit, ring);
    const steps = [...root.querySelectorAll('.rg-step')];
    const nameEl = root.querySelector('.rg-name'), whatEl = root.querySelector('.rg-what');
    const counts = [...root.querySelectorAll('.rg-cnt')];
    const abChips = [...root.querySelectorAll('.rg-abc')];
    const now = root.querySelector('.rg-now');
    let r = 90, level = '';

    function paint() {
      ring.setAttribute('r', r.toFixed(1));
      shade.setAttribute('d', `M-400 -300 H1456 V1000 H-400 Z M${C.x - r} ${C.y} a${r} ${r} 0 1 0 ${2 * r} 0 a${r} ${r} 0 1 0 ${-2 * r} 0 Z`);
      const inside = items.filter((it) => Math.hypot(it.x - C.x, it.y - C.y) <= r);
      items.forEach((it) => it.g.classList.toggle('rg-in', inside.includes(it)));
      const kinds = new Set(inside.map((i) => i.kind));
      const deer = inside.filter((i) => i.kind === 'deer').length;
      const lv = r >= ECO_R ? 'eco' : kinds.size > 1 ? 'com' : deer > 1 ? 'pop' : 'ind';
      abio.forEach((a) => a.classList.toggle('rg-on', lv === 'eco'));
      // 꼬리표·손잡이는 고리의 왼쪽 위(그림 안)에 둔다
      const ang = -2.3, kx = clamp(C.x + r * Math.cos(ang), 30, 1026), ky = clamp(C.y + r * Math.sin(ang), 30, 610);
      knob.setAttribute('cx', kx.toFixed(1)); knob.setAttribute('cy', ky.toFixed(1));
      lab.setAttribute('transform', `translate(${clamp(kx + 90, 90, 960).toFixed(1)} ${clamp(ky - 6, 40, 600).toFixed(1)})`);
      labT.textContent = LEVEL[lv].name; labBox.setAttribute('class', 'rg-labbox ' + lv);
      if (lv !== level) {
        level = lv;
        nameEl.textContent = LEVEL[lv].name; whatEl.textContent = LEVEL[lv].what;
        steps.forEach((s) => { const i = ORDER.indexOf(s.dataset.k); s.classList.toggle('on', s.dataset.k === lv); s.classList.toggle('past', i < ORDER.indexOf(lv)); });
        root.dataset.level = lv;
      }
      const cnt = { deer: 0, rabbit: 0, squirrel: 0, tree: 0, grass: 0 };
      inside.forEach((i) => { cnt[i.kind] += 1; });
      counts.forEach((c) => { const n = cnt[c.dataset.k]; c.querySelector('b').textContent = n; c.classList.toggle('on', n > 0); });
      abChips.forEach((c) => c.classList.toggle('on', lv === 'eco'));
      now.textContent = lv === 'ind' ? '그림을 끌어 고리를 넓혀 보자' : lv === 'eco' ? '생물과 환경을 모두 품었다' : '더 넓혀 보자';
      now.classList.toggle('done', lv === 'eco');
    }
    const setR = (p) => { r = clamp(Math.hypot(p.x - C.x, p.y - C.y), MIN_R, MAX_R); paint(); };
    [hit, knob, ring].forEach((t) => hold(t, svg, { down: setR, move: setR }));
    svg.setAttribute('tabindex', '0');
    svg.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft' && e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return;
      e.preventDefault(); e.stopPropagation();
      r = clamp(r + (e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 40 : -40), MIN_R, MAX_R); paint();
    });
    paint();
    root._rg = { r(v) { r = clamp(v, MIN_R, MAX_R); paint(); }, get level() { return level; } };
    return {};
  }
  window.EcoRing = { mount };
})();
