/* 1차시 표지: 아이스크림 택배 상자 단면(교과서 54쪽 도입). «배송 시간» 막대로 시간을 훑고, «드라이아이스» 막대로 덩이 수를 바꾼다.
   드라이아이스가 남아 있는 동안 상자 안의 열이 드라이아이스로 들어가(주황 화살표) 안이 차갑게 머문다. 다 없어지면 바깥 열이 벽을 지나 들어와 아이스크림이 녹는다.
   값(덩이마다 150분, 바깥 25 °C 등)은 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const { el, clamp } = window.EA;
  const LIFE = 150, OUT = 25, T_DRY = -32;

  // 덩이 수마다 0~360분 상자 안 온도와 아이스크림 녹은 정도를 미리 셈한다
  function plan(n) {
    const T = [], M = []; let t = -18, m = 0;
    for (let i = 0; i <= 360; i++) {
      const dry = n > 0 && i < n * LIFE;
      t += dry ? (T_DRY + 6 - t) / 25 : (OUT - t) / 95;
      if (t > -4) m = Math.min(1, m + (t + 4) / 900);
      T.push(t); M.push(m);
    }
    return { T, M };
  }
  const PLANS = [0, 1, 2, 3].map(plan);

  function mount(root) {
    const svg = root.querySelector('.ea-di-svg');
    const tIn = root.querySelector('#di-time'), nIn = root.querySelector('#di-n');
    const tv = root.querySelector('.di-tv'), nv = root.querySelector('.di-nv');
    [tIn, nIn].forEach(window.EA.keep);
    // 바깥(택배 차 짐칸 공기)
    el('rect', { class: 'ea-di-air', x: 0, y: 0, width: 640, height: 360 }, svg);
    // 상자: 두꺼운 스타이로폼 벽 단면
    el('rect', { class: 'ea-di-wall', x: 36, y: 70, width: 400, height: 262, rx: 10 }, svg);
    el('rect', { class: 'ea-di-in', x: 66, y: 98, width: 340, height: 206, rx: 4 }, svg);
    for (let i = 0; i < 46; i++) { const x = 40 + (i * 53) % 392, y = 74 + (i * 37) % 254; if (x > 62 && x < 410 && y > 94 && y < 308) continue; el('circle', { class: 'ea-di-bead', cx: x, cy: y, r: 3 }, svg); }
    el('rect', { class: 'ea-di-lid', x: 30, y: 52, width: 412, height: 26, rx: 6 }, svg);
    el('text', { class: 'ea-di-lab', x: 236, y: 46, text: '스타이로폼 상자(단면)' }, svg);
    // 아이스크림 세 개
    const creams = [];
    [[130, 'choco'], [205, 'pink'], [280, 'choco']].forEach(([x, k], i) => {
      const g = el('g', { class: 'ea-di-cream' }, svg);
      el('rect', { class: 'ea-di-stick', x: x - 5, y: 236, width: 10, height: 26, rx: 3 }, g);
      const body = el('g', { class: 'ea-di-body' }, g);
      el('path', { class: 'ea-di-ic ' + k, d: `M${x - 26} 238 V 150 a26 26 0 0 1 52 0 V 238 Z` }, body);
      if (k === 'choco') el('path', { class: 'ea-di-nut', d: `M${x - 18} 166 h8 M${x + 6} 190 h10 M${x - 12} 214 h8` }, body);
      creams.push({ body, x, i, k });
    });
    el('rect', { class: 'ea-di-tray', x: 82, y: 262, width: 300, height: 8, rx: 4 }, svg);
    creams.forEach((c) => { c.drip = el('ellipse', { class: 'ea-di-drip ' + c.k, cx: c.x, cy: 261, rx: 0, ry: 0 }, svg); });
    // 드라이아이스 덩이(바닥)
    const blocks = [0, 1, 2].map((i) => el('rect', { class: 'ea-di-dry', x: 100 + i * 96, y: 276, width: 76, height: 24, rx: 6 }, svg));
    el('text', { class: 'ea-di-lab sm', x: 236, y: 322, text: '드라이아이스(고체 이산화 탄소)' }, svg);
    const fog = el('g', { class: 'ea-di-fog' }, svg);
    const puffs = [...Array(9)].map((_, i) => ({ c: el('ellipse', { rx: 18, ry: 9 }, fog), u: i / 9, x0: 100 + (i % 3) * 96 + 38 }));
    // 열 화살표: 드라이아이스로 들어감 / 벽을 지나 들어옴
    const toDry = el('g', { class: 'ea-di-arrows' }, svg);
    [[130, 240, 150, 272], [205, 240, 205, 272], [280, 240, 262, 272], [80, 190, 108, 270], [392, 190, 360, 270]].forEach(([a, b, c, d]) => el('path', { class: 'ea-di-arr', d: `M${a} ${b} L ${c} ${d}`, 'marker-end': 'url(#di-head)' }, toDry));
    const intoBox = el('g', { class: 'ea-di-arrows' }, svg);
    [[10, 150, 70, 160], [10, 230, 70, 220], [330, 8, 330, 104], [630, 140, 404, 140]].forEach(([a, b, c, d]) => el('path', { class: 'ea-di-arr', d: `M${a} ${b} L ${c} ${d}`, 'marker-end': 'url(#di-head)' }, intoBox));
    const defs = el('defs', {}, svg);
    const mk = el('marker', { id: 'di-head', viewBox: '0 0 10 10', refX: 6, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto-start-reverse' }, defs);
    el('path', { d: 'M0 0 L10 5 L0 10 z', class: 'ea-di-head' }, mk);
    // 온도계(상자 안) · 바깥 온도
    const th = window.EA.thermo(svg, { x: 360, y: 250, h: 136, lo: -40, hi: 30, w: 14, cls: 'ea-di-th' });
    const clock = el('text', { class: 'ea-di-clock', x: 548, y: 124 }, svg);
    el('text', { class: 'ea-di-lab', x: 548, y: 84, text: '배송 시작 뒤' }, svg);
    el('text', { class: 'ea-di-lab sm', x: 548, y: 300, text: '바깥 공기 25 °C' }, svg);
    const say = el('text', { class: 'ea-di-say', x: 548, y: 186 }, svg);
    const say2 = el('text', { class: 'ea-di-say sm', x: 548, y: 214 }, svg);
    const say3 = el('text', { class: 'ea-di-say sm', x: 548, y: 236 }, svg);

    let t = 0, n = 2, phase = 0;
    function draw() {
      const P = PLANS[n], T = P.T[t], m = P.M[t];
      const left = n ? clamp(1 - t / (n * LIFE), 0, 1) : 0;
      blocks.forEach((b, i) => {
        const on = i < n, w = 76 * (on ? Math.max(0, left) : 0), h = 24 * (on ? Math.sqrt(Math.max(0, left)) : 0);
        b.setAttribute('width', w.toFixed(1)); b.setAttribute('x', (100 + i * 96 + (76 - w) / 2).toFixed(1));
        b.setAttribute('height', h.toFixed(1)); b.setAttribute('y', (300 - h).toFixed(1));
      });
      creams.forEach((c) => {
        const k = 1 - 0.5 * m, sx = 1 + 0.25 * m;
        c.body.setAttribute('transform', `translate(${(c.x * (1 - sx)).toFixed(1)} ${(238 * (1 - k)).toFixed(1)}) scale(${sx.toFixed(3)} ${k.toFixed(3)})`);
        c.drip.setAttribute('rx', (38 * m).toFixed(1)); c.drip.setAttribute('ry', (7 * m).toFixed(1));
      });
      th.set(T);
      const h = Math.floor(t / 60), mm = t % 60;
      clock.textContent = t === 0 ? '0분' : `${h ? h + '시간 ' : ''}${mm ? mm + '분' : ''}`.trim();
      tv.textContent = t === 0 ? '출발' : `${h}:${String(mm).padStart(2, '0')}`;
      nv.textContent = `${n}덩이`;
      const dry = left > 0;
      toDry.classList.toggle('on', dry); intoBox.classList.toggle('on', !dry && t > 0);
      fog.style.opacity = dry ? String(0.35 + 0.5 * Math.min(1, left * 2)) : '0';
      say.textContent = dry ? '열 → 드라이아이스' : t === 0 ? '' : m > 0.6 ? '아이스크림이 녹았다' : m > 0.05 ? '녹기 시작' : '안이 데워진다';
      say2.textContent = dry ? '승화하면서' : t > 0 && n > 0 ? '드라이아이스가' : '';
      say3.textContent = dry ? '주변의 열을 흡수' : t > 0 && n > 0 ? '다 없어졌다' : '';
    }
    function step(dt) {
      phase += dt;
      const left = n ? clamp(1 - t / (n * LIFE), 0, 1) : 0;
      puffs.forEach((p, i) => {
        p.u = (p.u + dt * 0.22) % 1;
        const on = left > 0 && (i % 3) < n;
        p.c.setAttribute('cx', (p.x0 + Math.sin(phase * 1.3 + i) * 14 + p.u * 30).toFixed(1));
        p.c.setAttribute('cy', (290 - p.u * 70).toFixed(1));
        p.c.setAttribute('rx', (12 + p.u * 22).toFixed(1));
        p.c.style.opacity = on ? String((1 - p.u) * 0.8) : '0';
      });
    }
    tIn.addEventListener('input', () => { t = Number(tIn.value); draw(); });
    nIn.addEventListener('input', () => { n = Number(nIn.value); draw(); });
    draw(); step(0);
    const loop = window.Stage.loop(step);
    const btns = [...root.querySelectorAll('.share-opts button')];
    window.EA.single(btns);
    const answer = (on) => root.querySelector('#pr-heat').classList.toggle('answer', on);
    root._di = { set(time, count) { if (count != null) { n = count; nIn.value = count; } t = time; tIn.value = time; draw(); } };
    return {
      setActive(on) { if (on && !window.EA.reduce) loop.start(); else loop.stop(); },
      fragment(f, on) { if (f.dataset.anim === 'di') answer(on); },
      sync(slide) { const f = slide.querySelector('[data-anim="di"]'); answer(!!f && f.classList.contains('visible')); },
    };
  }
  window.DryIce = { mount };
})();
