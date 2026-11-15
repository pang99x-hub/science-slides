/* 1차시 해 보기(교과서 54쪽): 두 비커를 유리 막대로 저어 반응시키고, 열화상 사진기를 단 휴대 전화로 본다.
   비커 안에서 원을 그린 각도만큼 반응이 진행된다(다섯 바퀴면 끝). 처음 20 °C → (가) 16 °C, (나) 25 °C(교과서 사진 값).
   그 사이의 온도는 저은 정도를 따라가는 모형. 반응이 진행되는 동안 (가)는 바깥 → 비커로, (나)는 비커 → 바깥으로 열 화살표가 흐른다. */
(function () {
  'use strict';
  const { el, clamp, pt } = window.EA;
  const TURNS = 5;
  // 열화상 색(차가움 남색 → 보라 → 빨강 → 노랑)
  const STOPS = [[13, [22, 32, 107]], [16.5, [59, 70, 214]], [20, [124, 52, 160]], [23, [224, 36, 94]], [26, [255, 154, 31]], [29, [255, 240, 122]]];
  function iron(t) {
    if (t <= STOPS[0][0]) return `rgb(${STOPS[0][1]})`;
    for (let i = 1; i < STOPS.length; i++) if (t <= STOPS[i][0]) {
      const [a, ca] = STOPS[i - 1], [b, cb] = STOPS[i], k = (t - a) / (b - a);
      return `rgb(${ca.map((v, j) => Math.round(v + (cb[j] - v) * k)).join(',')})`;
    }
    return `rgb(${STOPS[STOPS.length - 1][1]})`;
  }

  function beaker(svg, cx, key, name) {
    const g = el('g', { class: 'ea-st-bk', tabindex: 0, role: 'slider', 'aria-label': `${key} 비커 젓기(화살표 키로도 저을 수 있다)`, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-valuenow': 0 }, svg);
    const top = 120, bot = 420, w = 230;
    el('path', { class: 'ea-st-glass', d: `M${cx - w / 2} ${top} V ${bot - 14} q0 14 14 14 H ${cx + w / 2 - 14} q14 0 14 -14 V ${top}` }, g);
    el('path', { class: 'ea-st-lip', d: `M${cx - w / 2 - 10} ${top} H ${cx - w / 2 + 6} M${cx + w / 2 - 6} ${top} H ${cx + w / 2 + 10}` }, g);
    for (let i = 0; i < 4; i++) el('line', { class: 'ea-st-grad', x1: cx - w / 2 + 6, x2: cx - w / 2 + 34, y1: 200 + i * 50, y2: 200 + i * 50 }, g);
    const liq = el('path', { class: 'ea-st-liq ' + key }, g);
    const surf = el('ellipse', { class: 'ea-st-surf ' + key, cx, rx: w / 2 - 6, ry: 12 }, g);
    const solid = el('g', { class: 'ea-st-solid' }, g);
    const grains = [];
    for (let i = 0; i < 26; i++) {
      const pile = key === 'a' ? (i % 2) : 0, gx = cx + (key === 'a' ? (pile ? 34 : -40) : 0) + Math.sin(i * 2.3) * (key === 'a' ? 30 : 80), gy = bot - 10 - Math.abs(Math.cos(i * 1.7)) * (key === 'a' ? 34 : 14);
      grains.push({ c: el('circle', { class: 'ea-st-grain ' + (pile ? 'p2' : 'p1'), cx: gx, cy: gy, r: 7 + (i % 3) * 2 }, solid), gx, gy });
    }
    const swirl = el('g', { class: 'ea-st-swirl' }, g);
    const sdots = [0, 1, 2, 3, 4, 5].map(() => el('circle', { r: 4 }, swirl));
    const rod = el('line', { class: 'ea-st-rod' }, g);
    el('text', { class: 'ea-st-name', x: cx, y: 462, text: key === 'a' ? '(가)' : '(나)' }, g);
    el('text', { class: 'ea-st-sub', x: cx, y: 490, text: name }, g);
    const hit = el('rect', { class: 'ea-st-hit', x: cx - w / 2 - 20, y: top - 60, width: w + 40, height: bot - top + 80 }, g);
    const arrows = el('g', { class: 'ea-st-heat ' + (key === 'a' ? 'in' : 'out') }, svg);
    const A = [];
    for (let i = 0; i < 6; i++) {
      const side = i < 3 ? -1 : 1, y = 220 + (i % 3) * 64, x0 = cx + side * (w / 2 + 70), x1 = cx + side * (w / 2 + 16);
      A.push(el('path', { d: key === 'a' ? `M${x0} ${y} L ${x1} ${y}` : `M${x1} ${y} L ${x0} ${y}`, 'marker-end': `url(#st-h-${key})` }, arrows));
    }
    return { g, hit, liq, surf, grains, sdots, rod, arrows, cx, top, bot, w, key, p: 0, T: 20, ang: 0, last: null, flow: 0, tip: null };
  }

  function mount(root) {
    const svg = root.querySelector('.ea-st-svg');
    const defs = el('defs', {}, svg);
    for (const k of ['a', 'b']) { const m = el('marker', { id: 'st-h-' + k, viewBox: '0 0 10 10', refX: 6, refY: 5, markerWidth: 4, markerHeight: 4, orient: 'auto' }, defs); el('path', { d: 'M0 0 L10 5 L0 10 z', class: 'ea-st-hh ' + k }, m); }
    el('rect', { class: 'ea-st-bench', x: 0, y: 420, width: 1060, height: 12 }, svg);
    const B = [beaker(svg, 270, 'a', '수산화 바륨 + 염화 암모늄'), beaker(svg, 700, 'b', '염화 칼슘 + 물')];
    // 휴대 전화 + 열화상 사진기
    const ph = el('g', { class: 'ea-st-phone' }, svg);
    el('path', { class: 'ea-st-tri', d: 'M470 748 L 500 700 L 530 748 M500 700 V 676' }, ph);
    el('rect', { class: 'ea-st-pbody', x: 300, y: 512, width: 420, height: 180, rx: 22 }, ph);
    const scr = el('g', {}, ph);
    el('rect', { class: 'ea-st-screen', x: 318, y: 526, width: 384, height: 152, rx: 8, fill: iron(20) }, scr);
    for (let i = 0; i < 18; i++) el('rect', { class: 'ea-st-noise', x: 318 + (i * 61) % 380, y: 530 + (i * 29) % 140, width: 30, height: 10, rx: 5 }, scr);
    const blobs = B.map((b, i) => {
      const x = 410 + i * 200;
      const blob = el('ellipse', { class: 'ea-st-blob', cx: x, cy: 610, rx: 58, ry: 42 }, scr);
      const lab = el('text', { class: 'ea-st-btxt', x, y: 619 }, scr);
      el('text', { class: 'ea-st-bname', x, y: 670, text: i ? '(나)' : '(가)' }, scr);
      return { blob, lab };
    });
    const scale = el('g', {}, ph);
    for (let i = 0; i < 24; i++) el('rect', { x: 330 + i * 6, y: 532, width: 6, height: 8, fill: iron(13 + i * 16 / 23) }, scale);
    el('text', { class: 'ea-st-sc', x: 330, y: 556, text: '13' }, scale); el('text', { class: 'ea-st-sc', x: 466, y: 556, text: '29 °C' }, scale);
    el('rect', { class: 'ea-st-cam', x: 724, y: 560, width: 54, height: 84, rx: 10 }, ph);
    el('circle', { class: 'ea-st-lens', cx: 751, cy: 590, r: 15 }, ph);
    el('text', { class: 'ea-st-camt', x: 800, y: 606, text: '열화상 사진기' }, ph);

    const tab = { a: root.querySelector('.st-ta'), b: root.querySelector('.st-tb'), da: root.querySelector('.st-da'), db: root.querySelector('.st-db') };
    const bars = { a: root.querySelector('.ea-bar em[data-k="a"]'), b: root.querySelector('.ea-bar em[data-k="b"]') };
    const now = root.querySelector('.st-now'), msg = root.querySelector('.st-msg');
    let phase = 0;

    function rest(b) { b.tip = null; }
    function rodPos(b) {
      const tip = b.tip || { x: b.cx + 40, y: b.bot - 30 };
      const pivot = { x: b.cx + (tip.x - b.cx) * 0.35 + 70, y: b.top - 70 };
      b.rod.setAttribute('x1', pivot.x.toFixed(1)); b.rod.setAttribute('y1', pivot.y.toFixed(1));
      b.rod.setAttribute('x2', tip.x.toFixed(1)); b.rod.setAttribute('y2', tip.y.toFixed(1));
    }
    function addTurn(b, d) {
      const before = b.p;
      b.p = clamp(b.p + d / (Math.PI * 2 * TURNS), 0, 1);
      b.flow = Math.min(1, b.flow + (b.p - before) * 30);
      b.ang += d * 1.4;
      b.g.setAttribute('aria-valuenow', String(Math.round(b.p * 100)));
    }
    B.forEach((b) => {
      const cy = (b.top + b.bot) / 2 + 60;
      window.EA.drag(b.hit, svg, {
        start(p) { b.last = Math.atan2(p.y - cy, p.x - b.cx); b.tip = clampTip(b, p); return true; },
        move(p) {
          b.tip = clampTip(b, p);
          const a = Math.atan2(p.y - cy, p.x - b.cx); let d = a - b.last;
          if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2;
          b.last = a;
          if (Math.hypot(p.x - b.cx, p.y - cy) > 18) addTurn(b, Math.abs(d));
        },
        end() { rest(b); },
      });
      b.g.addEventListener('keydown', (e) => {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) { e.preventDefault(); e.stopPropagation(); addTurn(b, Math.PI / 2); }
      });
    });
    function clampTip(b, p) {
      return { x: clamp(p.x, b.cx - b.w / 2 + 22, b.cx + b.w / 2 - 22), y: clamp(p.y, 290, b.bot - 16) };
    }
    function liquid(b) {
      // (가): 가루 두 더미가 반응하며 질척한 액체가 생긴다 · (나): 물속 알갱이가 녹는다
      const lvl = b.key === 'a' ? b.bot - 8 - 120 * b.p : 260;
      b.liq.setAttribute('d', `M${b.cx - b.w / 2 + 2} ${lvl} V ${b.bot - 14} q0 12 12 12 H ${b.cx + b.w / 2 - 14} q12 0 12 -12 V ${lvl} Z`);
      b.surf.setAttribute('cy', String(lvl)); b.surf.style.opacity = b.key === 'a' && b.p < 0.05 ? '0' : '1';
      b.grains.forEach((gr, i) => {
        const k = clamp(1 - b.p * 1.15 + (i % 5) * 0.03, 0, 1);
        gr.c.setAttribute('r', ((7 + (i % 3) * 2) * k).toFixed(1));
        const swirl = b.p > 0 && b.p < 1 ? Math.sin(b.ang * 0.5 + i) * 10 * (1 - k) : 0;
        gr.c.setAttribute('cx', (gr.gx + swirl).toFixed(1));
      });
      b.sdots.forEach((d, i) => {
        const a = b.ang + i * Math.PI / 3, r = (b.w / 2 - 30) * (0.5 + 0.4 * ((i % 2))), y = lvl + 10 + 24 * (1 + Math.sin(a)) * (b.key === 'a' ? b.p : 1);
        d.setAttribute('cx', (b.cx + Math.cos(a) * r).toFixed(1)); d.setAttribute('cy', Math.min(b.bot - 12, y).toFixed(1));
        d.style.opacity = b.flow > 0.02 && (b.key === 'b' || b.p > 0.15) ? '0.55' : '0';
      });
    }
    function step(dt) {
      phase += dt;
      let all = true;
      B.forEach((b, i) => {
        const target = b.key === 'a' ? 20 - 4 * b.p : 20 + 5 * b.p;
        b.T += (target - b.T) * Math.min(1, dt / 0.6);
        b.flow = Math.max(0, b.flow - dt * 0.8);
        if (!b.tip) b.ang += dt * b.flow * 3;
        liquid(b); rodPos(b);
        b.arrows.style.opacity = String(Math.min(1, b.flow * 1.5));
        b.arrows.style.strokeDashoffset = String(-phase * 40);
        blobs[i].blob.setAttribute('fill', iron(b.T));
        blobs[i].lab.textContent = `${Math.round(b.T)} °C`;
        tab[b.key].textContent = `${Math.round(b.T)} °C`;
        const d = Math.round(b.T) - 20;
        tab['d' + b.key].textContent = d === 0 ? '—' : d < 0 ? `${-d} °C 내려감` : `${d} °C 올라감`;
        bars[b.key].style.width = (b.p * 100).toFixed(0) + '%';
        if (b.p < 1 || Math.abs(b.T - target) > 0.3) all = false;
      });
      const done = B.filter((b) => b.p >= 1).length;
      now.textContent = done === 0 ? '① 유리 막대를 끌어 비커 안을 빙글빙글 저어 보자' : done === 1 ? '② 다른 비커도 끝까지 저어 보자' : '③ 두 비커의 온도가 왜 반대로 바뀌었을까?';
      now.classList.toggle('done', done === 2);
      msg.textContent = all ? '(가)는 처음보다 차가워졌고 (나)는 따뜻해졌다. 비커 속 물질이 주변과 에너지를 어느 쪽으로 주고받았을까?'
        : B.some((b) => b.flow > 0.05) ? '반응이 진행되는 동안 화살표 쪽으로 에너지가 이동한다.' : '반응이 일어나는 동안 비커 속 물질과 주변 사이에 에너지가 오간다.';
    }
    const loop = window.Stage.loop(step);
    step(0.016);
    root._st = { stir(i, turns) { addTurn(B[i], turns * Math.PI * 2); }, done: () => B.map((b) => b.p) };
    return { setActive(on) { if (on) loop.start(); else loop.stop(); } };
  }
  window.StirLab = { mount };
})();
