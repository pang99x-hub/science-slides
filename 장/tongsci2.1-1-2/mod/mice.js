/* 1차시 표지(교과서 20쪽 도입): 왼쪽 모래사막·오른쪽 용암 지대. 털빛이 다른 쥐 여섯 마리(같은 종 안의 변이)를 끌어 옮긴다.
   쥐 털빛과 발밑 땅색의 차이(Lab 색차)로 «눈에 띄는 정도»를 셈하고, 매는 늘 가장 잘 보이는 쥐 위로 날아간다. */
(function () {
  'use strict';
  const K = window.EvKit, { el, clamp } = K;
  const FUR = [[240, 222, 178], [214, 184, 128], [170, 128, 80], [118, 88, 60], [72, 58, 50], [40, 34, 32]];
  const SAND = [236, 214, 160], LAVA = [58, 52, 50];
  const bx = (y) => 330 + 26 * Math.sin(y / 34) + 14 * Math.sin(y / 13);

  function mouse(p, fur) {
    const g = el('g', { class: 'ev-m' }, p);
    const c = K.hex(fur), d = K.hex(K.mix(fur, [0, 0, 0], 0.35));
    el('path', { d: 'M-26 6 C -46 10, -56 -2, -66 8', fill: 'none', stroke: d, 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    el('ellipse', { cx: 0, cy: 0, rx: 30, ry: 18, fill: c, stroke: '#1d2433', 'stroke-width': 2.5 }, g);
    el('circle', { cx: 26, cy: -8, r: 13, fill: c, stroke: '#1d2433', 'stroke-width': 2.5 }, g);
    el('circle', { cx: 20, cy: -21, r: 8, fill: K.hex(K.mix(fur, [240, 170, 170], 0.4)), stroke: '#1d2433', 'stroke-width': 2 }, g);
    el('circle', { cx: 31, cy: -10, r: 2.6, fill: '#111' }, g);
    el('circle', { cx: 39, cy: -5, r: 2.6, fill: '#e58f9a' }, g);
    el('ellipse', { cx: 0, cy: 0, rx: 64, ry: 44, fill: 'transparent' }, g);   // 잡기 쉽게 넓힌 자리
    return g;
  }

  function mount(root) {
    const svg = root.querySelector('.ev-mice-svg'), now = root.querySelector('.ev-mice-now');
    // 땅
    el('rect', { x: 0, y: 0, width: 660, height: 400, fill: K.hex(SAND) }, svg);
    let d = 'M 660 0 L 660 400';
    for (let y = 400; y >= 0; y -= 8) d += ` L ${bx(y).toFixed(1)} ${y}`;
    el('path', { d: d + ' Z', fill: K.hex(LAVA) }, svg);
    [[60, 120, 90], [200, 70, 60], [110, 300, 120], [240, 360, 70]].forEach(([x, y, r]) => el('ellipse', { cx: x, cy: y, rx: r, ry: r * 0.22, fill: '#e3c88c', opacity: 0.8 }, svg));
    // 선인장
    const cac = el('g', { transform: 'translate(70 88)' }, svg);
    el('path', { d: 'M0 70 V0 a12 12 0 0 1 24 0 V70 Z M24 34 h12 V14 a8 8 0 0 1 16 0 V44 H24 Z M0 44 h-12 V24 a8 8 0 0 0 -16 0 V54 H0 Z', fill: '#6aa564', stroke: '#1d2433', 'stroke-width': 2.5 }, cac);
    // 용암 바위
    const rr = K.rng(7);
    for (let i = 0; i < 26; i++) {
      const y = 20 + rr() * 370, x = bx(y) + 20 + rr() * (640 - bx(y)), s = 14 + rr() * 30;
      el('path', { d: `M${x - s} ${y + s * .4} L ${x - s * .6} ${y - s * .5} L ${x + s * .3} ${y - s * .7} L ${x + s} ${y} L ${x + s * .5} ${y + s * .5} Z`, fill: rr() < .5 ? '#4a4340' : '#2c2827', stroke: '#1a1716', 'stroke-width': 2 }, svg);
    }
    el('text', { x: 20, y: 388, fill: '#7a5a2a', style: 'font:700 20px var(--f-body)' }, svg).textContent = '모래사막';
    el('text', { x: 548, y: 388, fill: '#e8e2da', style: 'font:700 20px var(--f-body)' }, svg).textContent = '용암 지대';
    // 매의 그림자와 매
    const shadow = el('ellipse', { rx: 34, ry: 9, fill: 'rgba(0,0,0,.18)' }, svg);
    const ring = el('circle', { r: 54, fill: 'none', stroke: '#d9483b', 'stroke-width': 4, 'stroke-dasharray': '10 8' }, svg);
    const mice = FUR.map((f, i) => {
      const g = mouse(svg, f);
      const m = { g, f, x: i < 3 ? 380 + i * 90 : 60 + (i - 3) * 100, y: i < 3 ? 160 + i * 80 : 170 + (i - 3) * 75, v: 0 };
      return m;
    });
    // 처음엔 밝은 쥐가 용암 쪽, 어두운 쥐가 모래 쪽에 섞여 있다
    [[400, 170], [520, 260], [440, 330], [90, 190], [210, 270], [120, 330]].forEach(([x, y], i) => { mice[i].x = x; mice[i].y = y; });
    const hawk = el('g', { class: 'ev-hawk' }, svg);
    el('path', { d: 'M0 0 C -20 -18, -48 -22, -70 -10 C -46 -8, -30 0, -16 6 L -10 16 L 0 10 L 10 16 L 16 6 C 30 0, 46 -8, 70 -10 C 48 -22, 20 -18, 0 0 Z', fill: '#5a4430', stroke: '#1d2433', 'stroke-width': 2.5 }, hawk);
    el('circle', { cx: 0, cy: -4, r: 7, fill: '#5a4430', stroke: '#1d2433', 'stroke-width': 2 }, hawk);
    el('path', { d: 'M-3 2 l3 6 l3 -6 z', fill: '#f2c230' }, hawk);
    const tagBg = el('rect', { rx: 10, height: 30, fill: 'rgba(255,255,255,.92)', stroke: '#1d2433', 'stroke-width': 2 }, svg);
    const tag = el('text', { class: 'ev-eye-t', 'text-anchor': 'middle' }, svg);
    // 매의 눈 눈금(아래)
    const mbg = el('rect', { x: 330 - 150, y: 340, width: 300, height: 40, rx: 20, fill: 'rgba(255,255,255,.92)', stroke: '#1d2433', 'stroke-width': 2 }, svg);
    void mbg;
    el('text', { x: 200, y: 366, style: 'font:700 17px var(--f-body)' }, svg).textContent = '매의 눈';
    el('rect', { x: 270, y: 352, width: 190, height: 16, rx: 8, fill: '#e3e7ea', stroke: '#1d2433', 'stroke-width': 1.5 }, svg);
    const bar = el('rect', { x: 270, y: 352, width: 0, height: 16, rx: 8, fill: '#d9483b' }, svg);

    let hx = 330, hy = 120, tm = 0, held = null, moved = 0, last = null;
    const ground = (x, y) => (x < bx(y) ? SAND : LAVA);
    function score() {
      mice.forEach((m) => { m.v = clamp(K.dE(m.f, ground(m.x, m.y)) / 75, 0, 1); });
    }
    function place() {
      mice.forEach((m) => m.g.setAttribute('transform', `translate(${m.x.toFixed(1)} ${m.y.toFixed(1)})${m === held ? ' scale(1.12)' : ''}`));
    }
    function target() { return mice.reduce((a, b) => (b.v > a.v ? b : a)); }
    function label(m) {
      const t = m.v > 0.55 ? '잘 보인다!' : m.v > 0.25 ? '조금 보인다' : '땅과 비슷해 숨었다';
      tag.textContent = t;
      const w = t.length * 17 + 24;
      tag.setAttribute('x', m.x); tag.setAttribute('y', m.y - 42);
      tagBg.setAttribute('x', m.x - w / 2); tagBg.setAttribute('y', m.y - 63); tagBg.setAttribute('width', w);
    }
    score(); place();
    K.hold(svg, {
      down(p) {
        const m = mice.slice().reverse().find((q) => Math.abs(p.x - q.x) < 52 && Math.abs(p.y - q.y) < 36);
        if (!m) return false;
        held = m; svg.appendChild(m.g); m.g.classList.add('held'); m.ox = m.x - p.x; m.oy = m.y - p.y; return true;
      },
      move(p) { if (!held) return; held.x = clamp(p.x + held.ox, 40, 620); held.y = clamp(p.y + held.oy, 90, 372); score(); place(); last = held; },
      up() { if (!held) return; held.g.classList.remove('held'); last = held; held = null; moved++; place(); score();
        now.textContent = moved < 2 ? '② 다른 쥐도 옮겨 보자. 매는 누구를 노릴까?' : '털빛과 땅색이 비슷할수록 매의 눈에 덜 띈다'; if (moved >= 2) now.classList.add('done'); },
    }, (e) => K.svgPt(svg, e));

    const tk = K.ticker((dt) => {
      tm += dt;
      const t = target();
      const tx = t.x + 70 * Math.cos(tm * 1.6), ty = t.y - 70 + 22 * Math.sin(tm * 1.6);
      hx += (tx - hx) * Math.min(1, dt * 2.2); hy += (Math.max(40, ty) - hy) * Math.min(1, dt * 2.2);
      const flap = 1 + 0.18 * Math.sin(tm * 9);
      hawk.setAttribute('transform', `translate(${hx.toFixed(1)} ${hy.toFixed(1)}) scale(${flap.toFixed(2)} 1)`);
      shadow.setAttribute('cx', (hx + 30).toFixed(1)); shadow.setAttribute('cy', (hy + 120).toFixed(1));
      ring.setAttribute('cx', t.x); ring.setAttribute('cy', t.y); ring.setAttribute('opacity', (0.3 + 0.7 * t.v).toFixed(2));
      const show = held || last || t;
      label(show); bar.setAttribute('width', (190 * show.v).toFixed(1));
      svg.appendChild(hawk);
    });
    return { setActive(on) { if (on) tk.start(); else tk.stop(); }, _mice: mice };
  }
  window.EvMice = { mount };
})();
