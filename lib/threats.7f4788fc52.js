/* 생태계평형을 깨뜨릴 수 있는 환경 변화(교과서 81쪽 그림 Ⅱ-8): 숲·강·풀밭 강가 생태계에 원인 카드를 끌어 놓으면
   그곳 모습이 바뀌고 생물 수가 준다. 먹이 관계로 이어진 생물도 함께 준다(나무 → 사슴, 물고기 → 왜가리, 풀꽃 → 나비). 줄어드는 비율은 모델. */
(function () {
  'use strict';
  const { el, org, rng, clamp } = window.Eco;
  const SP = [['tree', '나무', 'forest'], ['deer', '사슴', 'forest'], ['fish', '물고기', 'river'], ['heron', '왜가리', 'river'], ['flower', '풀꽃', 'meadow'], ['fly', '나비', 'meadow']];
  const ZN = { forest: '숲', river: '강', meadow: '풀밭' };
  const TK = { dig: '서식지파괴', dirty: '환경오염', net: '남획', vine: '외래생물 유입', fire: '자연재해' };
  const E = {
    dig: { forest: [{ tree: 0.35, deer: 0.5 }, '나무를 베어 낸 자리에 길과 건물이 들어섰다. 살 곳을 잃은 사슴이 줄었다.'],
      river: [{ fish: 0.4 }, '강가를 흙으로 메워 땅을 넓혔다. 물고기가 알을 낳던 물가가 사라졌다.'],
      meadow: [{ flower: 0.3 }, '풀밭을 갈아엎어 공사장이 되었다. 풀꽃이 사라지자 나비도 떠났다.'] },
    dirty: { forest: [{ tree: 0.6, deer: 0.8 }, '공장 매연이 섞인 산성비가 내려 숲이 시들었다.'],
      river: [{ fish: 0.35 }, '폐수와 쓰레기가 흘러들어 물이 탁해지고 물고기가 죽었다. 물고기를 먹는 왜가리도 줄었다.'],
      meadow: [{ flower: 0.55, fly: 0.7 }, '쓰레기와 농약이 땅에 스며 풀꽃과 나비가 줄었다.'] },
    net: { forest: [{ deer: 0.25 }, '사슴을 마구 잡아들였다. 번식할 사슴이 모자라 멸종 위기에 놓일 수 있다.'],
      river: [{ fish: 0.25 }, '촘촘한 그물로 물고기를 싹쓸이했다. 먹이를 잃은 왜가리도 줄었다.'],
      meadow: [{ fly: 0.3 }, '나비를 마구 채집했다. 꽃가루받이를 돕던 나비가 줄었다.'] },
    vine: { forest: [{ tree: 0.6 }, '천적이 없는 가시박 덩굴이 숲 가장자리 나무를 뒤덮어 빛을 가렸다.'],
      river: [{ fish: 0.85, heron: 0.85 }, '강둑을 가시박이 뒤덮어 물가 식물이 자라지 못한다.'],
      meadow: [{ flower: 0.35 }, '가시박이 빠르게 퍼져 토종 풀꽃이 빛을 받지 못한다. 꽃이 줄자 나비도 줄었다.'] },
    fire: { forest: [{ tree: 0.3, deer: 0.6 }, '산불이 번져 숲이 탔다(자연적인 변화).'],
      river: [{ fish: 0.6, heron: 0.8 }, '큰 홍수로 강바닥과 물가가 쓸려 나갔다(자연적인 변화).'],
      meadow: [{ flower: 0.45, fly: 0.7 }, '심한 가뭄으로 풀밭이 바싹 말랐다(자연적인 변화).'] },
  };

  function mount(root) {
    const svg = root.querySelector('.hz-svg'), now = root.querySelector('.hz-now');
    const it = root.querySelector('.hz-it'), ib = root.querySelector('.hz-ib'), barsEl = root.querySelector('.hz-bars');
    const R = rng(8);
    el('rect', { class: 'hz-sky', x: -400, y: -300, width: 1856, height: 1300 }, svg);
    const zoneR = { forest: [0, 380], river: [380, 640], meadow: [640, 1056] };
    el('rect', { class: 'hz-forest', x: -400, y: 60, width: 780, height: 900 }, svg);
    el('rect', { class: 'hz-meadow', x: 640, y: 60, width: 820, height: 900 }, svg);
    el('rect', { class: 'hz-bank', x: 380, y: 60, width: 260, height: 900 }, svg);
    const riverP = 'M430 60 C 470 200 360 300 450 420 S 560 520 540 620 L 600 620 C 620 520 520 420 560 300 S 560 160 580 60 Z';
    const river = el('path', { class: 'hz-river', d: riverP }, svg);
    const over = el('g', {}, svg);
    const pos = { tree: [], deer: [], fish: [], heron: [], flower: [], fly: [] };
    const icons = {};
    for (let i = 0; i < 12; i++) pos.tree.push([30 + (i % 4) * 88 + R() * 20, 150 + Math.floor(i / 4) * 130 + R() * 20]);
    for (let i = 0; i < 5; i++) pos.deer.push([60 + i * 62, 230 + (i % 2) * 140]);
    for (let i = 0; i < 9; i++) { const y = 110 + i * 48; pos.fish.push([480 + Math.sin(y / 70) * 30 + (i % 2) * 22, y]); }
    pos.heron = [[400, 190], [620, 330], [395, 470]];
    for (let i = 0; i < 16; i++) pos.flower.push([680 + (i % 6) * 60 + R() * 18, 200 + Math.floor(i / 6) * 120 + R() * 30]);
    for (let i = 0; i < 6; i++) pos.fly.push([700 + i * 55, 140 + (i % 3) * 120]);
    const KIND = { tree: 'tree', deer: 'deer', fish: 'fish', heron: 'heron', flower: 'flower', fly: 'butterfly' }, SC = { tree: 1.5, deer: 1.0, fish: 1.1, heron: 0.9, flower: 1.3, fly: 1.1 };
    const order = ['tree', 'flower', 'deer', 'fish', 'heron', 'fly'];
    order.forEach((k) => { icons[k] = pos[k].map(([x, y]) => org(svg, KIND[k], x, y, SC[k], R() < 0.4)); });
    const fx = el('g', {}, svg);
    // 놓을 자리(투명)
    const zones = Object.entries(zoneR).map(([z, [x0, x1]]) => { const r = el('rect', { class: 'hz-zone', 'data-z': z, x: x0, y: 60, width: x1 - x0, height: 500, tabindex: '0', role: 'button', 'aria-label': ZN[z] }, svg); return r; });
    Object.entries(zoneR).forEach(([z, [x0, x1]]) => { const t = el('g', { class: 'hz-zl' }, svg); el('rect', { x: (x0 + x1) / 2 - 44, y: 72, width: 88, height: 34, rx: 17 }, t); el('text', { x: (x0 + x1) / 2, y: 96 }, t).textContent = ZN[z]; });
    // 오른쪽 막대
    const bars = SP.map(([k, n]) => { const d = document.createElement('div'); d.className = 'hz-bar'; d.innerHTML = `<span>${n}</span><b><i></i></b><em></em>`; barsEl.appendChild(d); return { k, i: d.querySelector('i'), e: d.querySelector('em') }; });

    let v, placed;
    function eff() {
      const e = { ...v };
      e.deer = Math.min(e.deer, 0.25 + 0.75 * e.tree);
      e.heron = Math.min(e.heron, 0.1 + 0.9 * e.fish);
      e.fly = Math.min(e.fly, 0.1 + 0.9 * e.flower);
      return e;
    }
    function paint() {
      const e = eff();
      order.forEach((k) => { const n = Math.round(icons[k].length * e[k]); icons[k].forEach((g, i) => g.classList.toggle('hz-gone', i >= n)); });
      bars.forEach((b) => { b.i.style.width = (e[b.k] * 100) + '%'; b.e.textContent = Math.round(e[b.k] * 100) + ' %'; b.i.classList.toggle('low', e[b.k] < 0.5); });
      river.classList.toggle('dirty', placed.some((p) => p.z === 'river' && (p.t === 'dirty')));
      river.classList.toggle('filled', placed.some((p) => p.z === 'river' && p.t === 'dig'));
      now.textContent = !placed.length ? '카드를 숲·강·풀밭 가운데 한 곳에 끌어 놓아 보자' : placed.length < 3 ? '다른 카드도 다른 곳에 놓아 보자' : '«처음 모습으로»를 누르고 다른 곳에 놓아 비교해 보자';
      now.classList.toggle('done', placed.length >= 3);
    }
    function decorate(t, z) {
      const [x0, x1] = zoneR[z], cx = (x0 + x1) / 2, g = el('g', { class: `hz-fx ${t}` }, fx);
      if (t === 'dig') {
        el('path', { class: 'hz-dirt', d: `M${cx - 110} 420 q 40 -60 110 -50 q 80 0 100 60 q -100 40 -210 -10 z` }, g);
        const ex = el('g', { transform: `translate(${cx - 30} 420)` }, g);
        el('rect', { class: 'hz-dig', x: -40, y: -36, width: 70, height: 30, rx: 4 }, ex); el('rect', { class: 'hz-dig', x: -20, y: -60, width: 30, height: 26, rx: 3 }, ex);
        el('path', { class: 'hz-arm', d: 'M20 -40 L 60 -80 L 90 -40' }, ex); el('path', { class: 'hz-dig', d: 'M84 -46 l 18 8 l -8 14 z' }, ex);
        el('rect', { class: 'hz-track', x: -46, y: -8, width: 82, height: 14, rx: 7 }, ex);
      } else if (t === 'dirty') {
        if (z === 'river') { el('rect', { class: 'hz-pipe', x: 600, y: 120, width: 70, height: 18 }, g); el('path', { class: 'hz-sludge', d: 'M600 130 q -30 20 -60 60 q -20 40 -40 120' }, g); }
        else { el('rect', { class: 'hz-stack', x: cx + 60, y: 120, width: 30, height: 100 }, g); for (let i = 0; i < 3; i++) el('circle', { class: 'hz-smoke', cx: cx + 75 + i * 26, cy: 100 - i * 24, r: 22 + i * 6 }, g); }
        el('rect', { class: 'hz-tint', x: x0, y: 60, width: x1 - x0, height: 500 }, g);
      } else if (t === 'net') {
        const n = el('g', { transform: `translate(${cx - 70} 330)` }, g);
        for (let i = 0; i <= 6; i++) { el('path', { class: 'hz-net', d: `M${i * 24} 0 l 0 120` }, n); el('path', { class: 'hz-net', d: `M0 ${i * 20} l 144 0` }, n); }
        el('path', { class: 'hz-rope', d: 'M0 0 L 144 0 L 144 120 L 0 120 Z' }, n);
      } else if (t === 'vine') {
        for (let i = 0; i < 9; i++) { const vg = org(g, 'vine', x0 + 40 + R() * (x1 - x0 - 80), 160 + R() * 360, 1.6, R() < 0.5); if (window.gsap) gsap.from(vg, { opacity: 0, scale: 0.2, transformOrigin: 'center', duration: 0.6, delay: i * 0.18 }); }
      } else if (t === 'fire') {
        if (z === 'river') for (let i = 0; i < 4; i++) el('path', { class: 'hz-wave', d: `M${x0 - 20} ${170 + i * 90} q 40 -24 80 0 t 80 0 t 80 0 t 80 0` }, g);
        else for (let i = 0; i < 6; i++) { const x = x0 + 40 + R() * (x1 - x0 - 80), y = 170 + R() * 330; el('path', { class: z === 'meadow' ? 'hz-dry' : 'hz-flame', d: `M${x} ${y} q -18 -30 0 -60 q 6 24 18 10 q 10 30 -18 50 z` }, g); }
        if (z !== 'river') el('rect', { class: 'hz-burn', x: x0, y: 60, width: x1 - x0, height: 500 }, g);
      }
      if (window.gsap && t !== 'vine') gsap.from(g, { opacity: 0, duration: 0.5 });
    }
    function put(t, z) {
      const [mult, text] = E[t][z];
      for (const [k, f] of Object.entries(mult)) v[k] = clamp(v[k] * f, 0, 1);
      placed.push({ t, z }); decorate(t, z);
      it.textContent = `${ZN[z]}에 ${TK[t]}`; ib.textContent = text;
      paint();
    }
    function reset() { v = { tree: 1, deer: 1, fish: 1, heron: 1, flower: 1, fly: 1 }; placed = []; fx.innerHTML = ''; it.textContent = '건강한 강가'; ib.textContent = '세 곳의 생물이 먹고 먹히며 균형을 이루고 있다.'; paint(); }
    const cards = [...root.querySelectorAll('.hz-tok')];
    const drag = window.Drag.cards(cards, {
      find: (x) => x.closest && x.closest('#threats .hz-zone'),
      hover: (z) => zones.forEach((r) => r.classList.toggle('target', r === z)),
      drop: (c, z) => { if (z) put(c.dataset.k, z.dataset.z); else { c.classList.remove('bad'); c.getBoundingClientRect(); c.classList.add('bad'); } },
      pick: (c) => { svg.classList.toggle('picking', !!c); if (c) { it.textContent = TK[c.dataset.k]; ib.textContent = '놓을 곳(숲·강·풀밭)을 눌러요.'; } },
    });
    zones.forEach((r) => {
      const go = () => { if (drag.picked) { const c = drag.picked; drag.unpick(); put(c.dataset.k, r.dataset.z); } };
      r.addEventListener('click', go);
      r.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); go(); } });
    });
    root.querySelector('#hz-reset').addEventListener('click', reset);
    reset();
    root._hz = { put, get placed() { return placed.length; } };
    return {};
  }
  window.EcoThreats = { mount };
})();
