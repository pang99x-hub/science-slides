/* 1차시 3장 해 보기(교과서 73쪽): 연못 생태계의 생물·환경을 끌어 오른쪽 관계도(환경 칸과 생물 세 칸)에 넣는다.
   칸이 채워지면 그 칸을 잇는 화살표에 양분이 흐른다. 틀리면 연못으로 돌아가며 까닭을 묻는 힌트가 뜬다. */
(function () {
  'use strict';
  const { el, draw, ghosts } = window.Eco;
  const CAT = { abio: '비생물요소', prod: '생산자', cons: '소비자', dec: '분해자' };
  // 이름, 칸, 틀렸을 때 힌트
  const IT = {
    light: ['빛', 'abio', '빛은 살아 있는 생물일까? 생물을 둘러싼 환경일까?'],
    air: ['공기', 'abio', '공기는 스스로 자라거나 번식하지 않는다.'],
    temp: ['온도', 'abio', '온도는 생물이 사는 곳의 환경 조건이다.'],
    water: ['물', 'abio', '물은 생물이 아니라 생물이 사는 환경이다.'],
    soil: ['토양', 'abio', '토양(흙)은 생물이 살아가는 바탕이 되는 환경이다.'],
    duck: ['오리', 'cons', '오리는 스스로 양분을 만들까, 다른 생물을 먹을까?'],
    lotus: ['수련', 'prod', '수련의 잎은 물 위에서 햇빛을 받는다. 양분을 어떻게 얻을까?'],
    cattail: ['부들', 'prod', '부들은 초록 잎으로 햇빛을 받아 양분을 만든다.'],
    hya: ['부레옥잠', 'prod', '부레옥잠도 잎으로 빛을 받는 식물이다.'],
    hyd: ['검정말', 'prod', '검정말은 물속에서 빛을 받아 자라는 식물이다.'],
    frog: ['개구리', 'cons', '개구리는 벌레를 잡아먹는다.'],
    snail: ['다슬기', 'cons', '다슬기는 돌에 붙은 작은 생물을 갉아 먹는다.'],
    para: ['짚신벌레', 'cons', '짚신벌레는 물속의 더 작은 생물을 먹는다.'],
    fish: ['붕어', 'cons', '붕어는 물속의 작은 동물과 식물을 먹는다.'],
    mush: ['버섯', 'dec', '버섯은 빛으로 양분을 만들지 못한다. 썩은 나무에서 무엇을 할까?'],
  };
  // 관계도 칸(가운데 좌표, 너비, 높이)
  const Z = { abio: [284, 62, 540, 96], prod: [284, 228, 300, 112], cons: [120, 432, 224, 150], dec: [450, 432, 224, 150] };
  // 화살표: [시작 칸, 끝 칸, 경로, 이름표 x, y, 글]
  const AR = [
    ['abio', 'prod', 'M284 112 L284 168', 300, 146, '빛·물·공기', 'start'],
    ['prod', 'cons', 'M200 270 L150 352', 112, 312, '먹힌다', 'middle'],
    ['prod', 'dec', 'M370 270 L420 352', 456, 312, '낙엽·사체', 'middle'],
    ['cons', 'dec', 'M234 446 L336 446', 285, 432, '사체·배설물', 'middle'],
    ['dec', 'abio', 'M560 380 C 600 300, 600 140, 556 100', 584, 236, '흙 속 양분', 'end'],
  ];

  function pondScene(svg) {
    el('rect', { class: 'pd-sky', x: -400, y: -300, width: 1856, height: 550 }, svg);
    draw.tree(svg, 180, 250, 1.0); draw.tree(svg, 520, 236, 0.75); draw.tree(svg, 900, 250, 1.1);
    el('path', { class: 'pd-bank', d: 'M-400 230 L0 230 Q520 200 1056 236 L1456 236 L1456 1000 L-400 1000 Z' }, svg);
    el('path', { class: 'pd-water', d: 'M60 300 Q520 250 1000 300 L1000 560 Q520 600 60 560 Z' }, svg);
    el('path', { class: 'pd-surface', d: 'M60 300 Q520 250 1000 300' }, svg);
    el('path', { class: 'pd-mud', d: 'M60 540 Q520 520 1000 540 L1000 560 Q520 600 60 560 Z' }, svg);
    const items = {};
    const put = (k, x, y, make, lx, ly) => {
      const g = el('g', { class: 'pd-item', 'data-k': k, tabindex: '0', role: 'button', 'aria-label': IT[k][0] + ' 끌어 넣기' }, svg);
      if (make) make(g);
      const tx = lx ?? x, ty = ly ?? y;
      const w = 24 + IT[k][0].length * 22;
      el('rect', { class: 'pd-tag', x: tx - w / 2, y: ty - 18, width: w, height: 34, rx: 17 }, g);
      el('text', { class: 'pd-tagt', x: tx, y: ty + 6 }, g).textContent = IT[k][0];
      el('text', { class: 'pd-ok', x: tx + w / 2 - 4, y: ty - 10 }, g).textContent = '✓';
      items[k] = g; return g;
    };
    put('light', 600, 70, (g) => draw.sun(g, 600, 70, 0.8), 600, 136);
    put('air', 360, 70, (g) => { draw.cloud(g, 360, 74, 0.9); }, 360, 100);
    put('temp', 800, 70, (g) => { el('rect', { class: 'ec-o', fill: '#fff', x: 792, y: 22, width: 16, height: 60, rx: 8 }, g); el('circle', { class: 'ec-o', fill: '#e05a3a', cx: 800, cy: 86, r: 12 }, g); el('rect', { x: 796, y: 46, width: 8, height: 36, fill: '#e05a3a' }, g); }, 800, 120);
    put('water', 520, 400, null);
    put('soil', 960, 586, null, 960, 576);
    put('duck', 640, 300, (g) => draw.duck(g, 620, 300, 1.1), 620, 246);
    put('lotus', 360, 312, (g) => { draw.lotus(g, 360, 312, 1.0); draw.lotus(g, 440, 318, 0.7); }, 380, 352);
    put('cattail', 880, 300, (g) => { draw.cattail(g, 860, 300, 1.0); draw.cattail(g, 890, 300, 0.85); }, 878, 178);
    put('hya', 760, 310, (g) => draw.hyacinth(g, 760, 312, 1.0), 772, 240);
    put('hyd', 600, 540, (g) => { draw.hydrilla(g, 590, 540, 1.0); draw.hydrilla(g, 620, 540, 0.8); }, 610, 430);
    put('frog', 210, 296, (g) => draw.frog(g, 210, 296, 1.1), 210, 248);
    put('snail', 170, 540, (g) => draw.snail(g, 170, 540, 1.0), 170, 498);
    put('para', 300, 470, (g) => { el('circle', { class: 'pd-lens', cx: 300, cy: 470, r: 40 }, g); draw.paramecium(g, 300, 480, 1.0); }, 300, 530);
    put('fish', 800, 480, (g) => draw.fish(g, 800, 486, 1.4), 800, 520);
    put('mush', 60, 236, (g) => { el('rect', { class: 'ec-o', fill: '#8a6142', x: 10, y: 222, width: 100, height: 18, rx: 9 }, g); draw.mushroom(g, 40, 224, 0.8); draw.mushroom(g, 72, 224, 0.6, '#b9773f'); }, 60, 270);
    return items;
  }

  function diagram(dg) {
    const zones = {}, lists = {}, flows = [];
    AR.forEach(([a, b, d, lx, ly, t, anc]) => {
      const g = el('g', { class: 'pd-ar', 'data-a': a, 'data-b': b }, dg);
      el('path', { class: 'pd-arl', d, 'marker-end': 'url(#pd-head)' }, g);
      el('path', { class: 'pd-flow', d }, g);
      el('text', { class: 'pd-art', x: lx, y: ly, 'text-anchor': anc }, g).textContent = t;
      flows.push(g);
    });
    const defs = el('defs', {}, dg);
    const m = el('marker', { id: 'pd-head', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
    el('path', { d: 'M0 0 L10 5 L0 10 z', fill: '#4b566a' }, m);
    Object.entries(Z).forEach(([k, [cx, cy, w, h]]) => {
      const g = el('g', { class: 'pd-zone ' + k, 'data-zone': k, tabindex: '0', role: 'button', 'aria-label': CAT[k] + ' 칸' }, dg);
      el('rect', { class: 'pd-zbox', x: cx - w / 2, y: cy - h / 2, width: w, height: h, rx: 14 }, g);
      el('text', { class: 'pd-zt', x: cx, y: cy - h / 2 + 30 }, g).textContent = CAT[k];
      lists[k] = el('text', { class: 'pd-zl', x: cx, y: cy - h / 2 + 62 }, g);
      zones[k] = g;
    });
    return { zones, lists, flows };
  }

  function mount(root) {
    const svg = root.querySelector('.pd-svg'), dg = root.querySelector('.pd-dg');
    const items = pondScene(svg);
    const { zones, lists, flows } = diagram(dg);
    const msg = root.querySelector('.pd-msg'), cnt = root.querySelector('.pd-n');
    const placed = { abio: [], prod: [], cons: [], dec: [] };
    function relist() {
      Object.entries(placed).forEach(([k, arr]) => {
        const t = lists[k]; t.textContent = '';
        const per = k === 'abio' ? 5 : 2;
        const [cx, cy, w, h] = Z[k];
        arr.forEach((name, i) => {
          const col = i % per, row = Math.floor(i / per);
          el('tspan', { x: cx - w / 2 + (w / per) * (col + 0.5), y: cy - h / 2 + 62 + row * 30 }, t).textContent = name;
        });
      });
      const has = (k) => placed[k].length > 0;
      flows.forEach((f) => f.classList.toggle('on', has(f.dataset.a) && has(f.dataset.b)));
      const n = Object.values(placed).reduce((a, b) => a + b.length, 0);
      cnt.textContent = `${n} / 15`;
      root.querySelector('.pd-now').classList.toggle('done', n === 15);
      root.dispatchEvent(new CustomEvent('pd-prog', { detail: { abio: placed.abio.length, bio: n - placed.abio.length, n } }));
      if (n === 15) msg.textContent = '모두 넣었다! 화살표를 따라가면 양분이 생산자 → 소비자 → 분해자 → 흙으로 돌아 다시 생산자에게 간다.';
    }
    function place(k, zk) {
      const it = IT[k];
      if (it[1] !== zk) {
        msg.textContent = `${it[0]}: ${it[2]}`; msg.classList.add('bad');
        items[k].classList.remove('pd-shake'); void items[k].getBBox(); items[k].classList.add('pd-shake');
        zones[zk].classList.add('pd-no'); setTimeout(() => zones[zk].classList.remove('pd-no'), 500);
        return false;
      }
      if (placed[zk].includes(it[0])) return true;
      placed[zk].push(it[0]); items[k].classList.add('ec-done');
      zones[zk].classList.add('pd-yes'); setTimeout(() => zones[zk].classList.remove('pd-yes'), 500);
      msg.classList.remove('bad');
      msg.textContent = {
        abio: `${it[0]}: 생물이 살아가는 데 영향을 주는 환경 → 비생물요소`,
        prod: `${it[0]}: 빛에너지로 광합성을 해 양분을 스스로 만든다 → 생산자`,
        cons: `${it[0]}: 남을 먹어서 양분을 얻는다 → 소비자`,
        dec: `${it[0]}: 죽은 생물과 배설물을 분해해 양분을 얻는다 → 분해자`,
      }[zk];
      relist(); return true;
    }
    const g = ghosts(Object.values(items), {
      label: (c) => IT[c.dataset.k][0],
      over: (z) => Object.values(zones).forEach((x) => x.classList.toggle('pd-hover', x === z)),
      drop: (z, c) => { if (z) place(c.dataset.k, z.dataset.zone); },
      pick: (c) => { if (c) msg.textContent = `${IT[c.dataset.k][0]}을(를) 골랐다 → 오른쪽 칸을 누르자`; },
    });
    Object.values(zones).forEach((z) => {
      const go = () => { const c = g.picked; if (!c) return; g.unpick(); place(c.dataset.k, z.dataset.zone); };
      z.addEventListener('click', go);
      z.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); go(); } });
    });
    const all = root.querySelector('#pd-all');
    if (all) all.addEventListener('click', () => Object.keys(IT).forEach((k) => place(k, IT[k][1])));
    relist();
    msg.textContent = '연못의 생물과 환경을 하나씩 끌어 오른쪽 칸에 넣자';
    root._pd = { place, reset() { Object.keys(placed).forEach((k) => { placed[k] = []; }); Object.values(items).forEach((i) => i.classList.remove('ec-done')); relist(); } };
    return {};
  }
  window.PondSort = { mount };
})();
