/* 2차시 4장 물·토양 · 선인장과 함초(교과서 74쪽 그림 Ⅱ-3).
   물뿌리개를 끌어 밭 위로 가져가 누르고 있으면 기울어져 물이 쏟아진다. 날은 저절로 흐른다.
   왼쪽 건조한 땅: 잎 넓은 풀은 잎으로 물을 많이 잃어 금세 시들고, 잎이 가시로 바뀐 선인장은 줄기에 물을 모아 버틴다.
   오른쪽 염분 많은 땅: 물을 주어도 흙물이 짜서 보통 풀은 뿌리에서 물이 빠져나가 시들고, 세포 속을 더 짜게 유지하는 함초만 물을 빨아들인다.
   빠르기·양은 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const { el, hold, clamp, lerp, loop } = window.Eco;
  const GY = 520;
  const PL = [
    { k: 'cactus', name: '선인장', x: 150, bed: 'dry', W: 0.6, S: 0 },
    { k: 'leafy', name: '잎 넓은 풀', x: 380, bed: 'dry', W: 0.7, S: 0 },
    { k: 'glass', name: '함초', x: 680, bed: 'salt', W: 0.5, S: 0.3 },
    { k: 'plain', name: '보통 풀', x: 910, bed: 'salt', W: 0.7, S: 0.3 },
  ];

  function mount(root) {
    const svg = root.querySelector('.ws-svg');
    el('rect', { class: 'ws-sky', x: -400, y: -300, width: 1856, height: GY + 300 }, svg);
    el('rect', { class: 'ws-sand', x: -400, y: GY, width: 928, height: 700 }, svg);
    el('rect', { class: 'ws-mud', x: 528, y: GY, width: 928, height: 700 }, svg);
    for (let i = 0; i < 40; i++) { const sx = 540 + (i * 137 + (i * i * 7) % 61) % 510, sy = GY + 8 + (i * 71 + (i * i * 3) % 37) % 170; el('rect', { class: 'ws-salt', x: sx, y: sy, width: 6, height: 6, transform: `rotate(45 ${sx + 3} ${sy + 3})` }, svg); }
    el('line', { class: 'ws-div', x1: 528, y1: 60, x2: 528, y2: 900 }, svg);
    el('text', { class: 'ws-bt', x: 264, y: 250 }, svg).textContent = '건조한 땅';
    el('text', { class: 'ws-bt', x: 792, y: 250 }, svg).textContent = '염분이 많은 땅';
    const sun = el('circle', { class: 'ec-o', cx: 80, cy: 90, r: 34, fill: '#ffd34d' }, svg);
    const dayT = el('text', { class: 'ws-day', x: 1036, y: 50 }, svg);
    PL.forEach((p) => {
      p.wet = el('ellipse', { class: 'ws-wet', cx: p.x, cy: GY + 30, rx: 110, ry: 40 }, svg);
      p.roots = el('path', { class: 'ws-root', d: `M${p.x} ${GY} q-24 40 -50 80 M${p.x} ${GY} q4 60 -2 110 M${p.x} ${GY} q26 44 52 76` }, svg);
      p.arrows = el('g', { class: 'ws-arr' }, svg);
      [-1, 1].forEach(() => el('path', {}, p.arrows));
      p.g = el('g', { transform: `translate(${p.x} ${GY})` }, svg);
      p.vap = Array.from({ length: 4 }, () => el('path', { class: 'ws-vap' }, svg));
      p.gauge = el('g', { transform: `translate(${p.x} ${GY + 160}) scale(0.85)` }, svg);
      el('path', { class: 'ws-drop', d: 'M0 -34 C 14 -14, 22 0, 0 12 C -22 0, -14 -14, 0 -34 Z' }, p.gauge);
      p.fill = el('rect', { class: 'ws-dropf', x: -24, width: 48, y: -34, height: 46, 'clip-path': 'url(#ws-dclip)' }, p.gauge);
      el('path', { class: 'ws-dropo', d: 'M0 -34 C 14 -14, 22 0, 0 12 C -22 0, -14 -14, 0 -34 Z' }, p.gauge);
      el('text', { class: 'ws-pn', x: 0, y: 40 }, p.gauge).textContent = p.name;
    });
    const defs = el('defs', {}, svg);
    const cp = el('clipPath', { id: 'ws-dclip' }, defs); el('path', { d: 'M0 -34 C 14 -14, 22 0, 0 12 C -22 0, -14 -14, 0 -34 Z' }, cp);
    [['in', '#2a8fb8'], ['out', '#d9483b']].forEach(([k, c]) => { const mk = el('marker', { id: 'ws-head-' + k, viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 4, markerHeight: 4, orient: 'auto' }, defs); el('path', { d: 'M0 0 L10 5 L0 10 z', fill: c }, mk); });
    // 식물 모양(물 W에 따라 바뀐다)
    const C = PL[0], Lf = PL[1], Gs = PL[2], Pn = PL[3];
    const cBody = el('path', { class: 'ws-cac' }, C.g), cSp = el('g', { class: 'ws-spine' }, C.g);
    const lfStem = el('path', { class: 'ws-stem' }, Lf.g), lfLeaves = Array.from({ length: 6 }, () => el('path', { class: 'ws-lf' }, Lf.g));
    const gsSegs = Array.from({ length: 5 }, () => el('g', {}, Gs.g));
    const pnStem = el('path', { class: 'ws-stem' }, Pn.g), pnLeaves = Array.from({ length: 6 }, () => el('path', { class: 'ws-lf' }, Pn.g));
    // 물뿌리개
    const can = el('g', { class: 'ws-can', tabindex: '0', role: 'button', 'aria-label': '물뿌리개: 끌어서 밭 위에서 누르고 있으면 물을 붓는다. 엔터를 누르면 지금 자리에 붓는다' }, svg);
    const canIn = el('g', {}, can);
    el('path', { class: 'ws-canb', d: 'M-50 -40 L40 -40 L48 30 L-58 30 Z' }, canIn);
    el('path', { class: 'ws-canh', d: 'M-40 -40 Q-10 -84 30 -40' }, canIn);
    el('path', { class: 'ws-canb', d: 'M40 -10 L104 -52 L110 -44 L48 4 Z' }, canIn);
    el('ellipse', { class: 'ws-canb', cx: 108, cy: -50, rx: 10, ry: 14, transform: 'rotate(-35 108 -50)' }, canIn);
    const dropsG = el('g', {}, svg);
    const drops = [];
    let cx = 528, cy = 150, tilt = 0, pouring = false, tm = 0, days = 0, dayT0 = 0;
    const now = root.querySelector('.ws-now');
    const bars = Object.fromEntries(PL.map((p) => [p.k, root.querySelector(`.ws-bar[data-k="${p.k}"] i`)]));
    const notes = Object.fromEntries(PL.map((p) => [p.k, root.querySelector(`.ws-st[data-k="${p.k}"]`)]));

    function shapes() {
      const cw = lerp(26, 44, C.W);
      cBody.setAttribute('d', `M${-cw} 0 L${-cw} -150 Q0 ${-150 - cw * 1.6} ${cw} -150 L${cw} 0 Z M${cw} -80 h18 v-40 a10 10 0 0 1 20 0 v52 q0 8 -8 8 h-30 Z M${-cw} -60 h-16 v-30 a9 9 0 0 0 -18 0 v40 q0 8 8 8 h26 Z`);
      if (!cSp.childNodes.length) for (let i = 0; i < 16; i++) el('path', {}, cSp);
      [...cSp.childNodes].forEach((s, i) => { const y = -20 - (i % 8) * 17, sd = i < 8 ? -1 : 1, x = sd * cw; s.setAttribute('d', `M${x} ${y} l${sd * 10} -4 M${x} ${y} l${sd * 10} 4`); });
      const wl = clamp(1 - (Lf.W - 0.15) / 0.45, 0, 1);   // 시든 정도
      lfStem.setAttribute('d', `M0 0 Q${wl * 20} -70 ${wl * 50} ${-150 + wl * 60}`);
      lfLeaves.forEach((l, i) => {
        const t = 0.25 + (i >> 1) * 0.25, sd = i % 2 ? 1 : -1, x = wl * 50 * t * t, y = (-150 + wl * 60) * t, droop = 30 + wl * 70;
        const ex = sd * 60 * Math.cos(droop * Math.PI / 180 * (sd > 0 ? 1 : 1)), ey = 60 * Math.sin((droop - 60) * Math.PI / 180);
        l.setAttribute('d', `M${x.toFixed(1)} ${y.toFixed(1)} Q${(x + ex * 0.5).toFixed(1)} ${(y - 26 + ey * 0.4).toFixed(1)} ${(x + ex).toFixed(1)} ${(y + ey).toFixed(1)} Q${(x + ex * 0.5).toFixed(1)} ${(y + 10 + ey * 0.5).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`);
        l.setAttribute('fill', `hsl(${lerp(105, 45, wl).toFixed(0)} ${lerp(50, 55, wl).toFixed(0)}% ${lerp(40, 50, wl).toFixed(0)}%)`);
      });
      const gw = lerp(7, 13, Gs.W);
      gsSegs.forEach((g, i) => {
        g.innerHTML = '';
        const bx = (i - 2) * 24, h = 40 + (i % 3) * 14;
        for (let k = 0; k < 4; k++) el('rect', { class: 'ws-gseg', x: bx - gw / 2, y: -(k + 1) * (h / 4) - k * 2, width: gw, height: h / 4, rx: gw / 2, fill: k > 2 ? '#c4553f' : '#5aa34a' }, g);
      });
      const wp = clamp(1 - (Pn.W - 0.15) / 0.45, 0, 1);
      pnStem.setAttribute('d', `M0 0 Q${-wp * 18} -60 ${-wp * 46} ${-130 + wp * 50}`);
      pnLeaves.forEach((l, i) => {
        const t = 0.3 + (i >> 1) * 0.25, sd = i % 2 ? 1 : -1, x = -wp * 46 * t * t, y = (-130 + wp * 50) * t, droop = 20 + wp * 80;
        const ex = sd * 50, ey = 50 * Math.sin((droop - 50) * Math.PI / 180);
        l.setAttribute('d', `M${x.toFixed(1)} ${y.toFixed(1)} Q${(x + ex * 0.5).toFixed(1)} ${(y - 14 + ey * 0.4).toFixed(1)} ${(x + ex).toFixed(1)} ${(y + ey).toFixed(1)} Q${(x + ex * 0.5).toFixed(1)} ${(y + 6 + ey * 0.5).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`);
        l.setAttribute('fill', `hsl(${lerp(100, 45, wp).toFixed(0)} ${lerp(45, 55, wp).toFixed(0)}% ${lerp(42, 52, wp).toFixed(0)}%)`);
      });
    }
    function paint() {
      PL.forEach((p) => {
        p.wet.style.opacity = clamp(p.S * 1.2, 0, 0.85).toFixed(2);
        const h = 46 * p.W; p.fill.setAttribute('y', (12 - h).toFixed(1)); p.fill.setAttribute('height', h.toFixed(1));
        bars[p.k].style.width = (p.W * 100).toFixed(0) + '%';
        const inflow = p.bed === 'salt' ? (p.k === 'glass' ? 1 : -1) : 1;
        p.arrows.style.opacity = p.S > 0.08 ? 1 : 0;
        p.arrows.setAttribute('class', 'ws-arr ' + (inflow > 0 ? 'in' : 'out'));
        [...p.arrows.childNodes].forEach((a, i) => { const sd = i ? 1 : -1; a.setAttribute('marker-end', `url(#ws-head-${inflow > 0 ? 'in' : 'out'})`); a.setAttribute('d', inflow > 0 ? `M${p.x + sd * 80} ${GY + 70} L${p.x + sd * 30} ${GY + 70}` : `M${p.x + sd * 30} ${GY + 70} L${p.x + sd * 80} ${GY + 70}`); });
        notes[p.k].textContent = {
          cactus: p.W > 0.35 ? '줄기에 물을 모아 둔다' : '물이 모자라 홀쭉해졌다',
          leafy: p.W > 0.35 ? '넓은 잎으로 물이 빠져나간다' : '물을 잃고 시들었다',
          glass: p.S > 0.08 ? '짠 흙에서도 물을 빨아들인다' : '흙이 마르면 쉰다',
          plain: p.S > 0.08 ? '짠 흙물에 오히려 물을 빼앗긴다' : (p.W > 0.35 ? '아직 버틴다' : '물을 잃고 시들었다'),
        }[p.k];
      });
      can.setAttribute('transform', `translate(${cx.toFixed(1)} ${cy.toFixed(1)}) rotate(${tilt.toFixed(1)})`);
      dayT.textContent = `${days}일째`;
      shapes();
    }
    function spout() { const a = tilt * Math.PI / 180, x = 112, y = -50; return { x: cx + x * Math.cos(a) - y * Math.sin(a), y: cy + x * Math.sin(a) + y * Math.cos(a) }; }
    function step(dt) {
      tm += dt; dayT0 += dt; if (dayT0 > 2) { dayT0 = 0; days += 1; }
      tilt = lerp(tilt, pouring ? 38 : 0, clamp(dt * 8, 0, 1));
      if (pouring && tilt > 25) for (let i = 0; i < 3; i++) { const s = spout(); drops.push({ x: s.x + Math.random() * 10, y: s.y, vx: 40 + Math.random() * 40, vy: 0, e: el('circle', { class: 'ws-dr', r: 4 }, dropsG) }); }
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i]; d.vy += 900 * dt; d.x += d.vx * dt; d.y += d.vy * dt;
        if (d.y >= GY) {
          const p = PL.find((q) => Math.abs(q.x - d.x) < 120); if (p) p.S = clamp(p.S + 0.006, 0, 1);
          d.e.remove(); drops.splice(i, 1); continue;
        }
        d.e.setAttribute('cx', d.x.toFixed(1)); d.e.setAttribute('cy', d.y.toFixed(1));
      }
      PL.forEach((p) => {
        p.S = clamp(p.S - dt * (p.bed === 'dry' ? 0.05 : 0.02), p.bed === 'salt' ? 0 : 0, 1);
        let dW = 0;
        if (p.k === 'cactus') dW = p.S * 0.45 - 0.008;
        if (p.k === 'leafy') dW = p.S * 0.35 - 0.07;
        if (p.k === 'glass') dW = p.S * 0.4 - 0.015;
        if (p.k === 'plain') dW = -0.02 - p.S * 0.08;
        p.W = clamp(p.W + dW * dt, 0.03, 1);
        // 김(증산): 잎 넓은 풀은 많이, 선인장은 거의 없다
        const rate = { cactus: 0.12, leafy: 1, glass: 0.3, plain: 0.6 }[p.k] * clamp(p.W * 1.5, 0, 1);
        p.vap.forEach((v, i) => {
          const ph = (tm * 0.7 + i / 4) % 1, x = p.x + (i - 1.5) * 26, y = GY - 120 - ph * 70;
          v.setAttribute('d', `M${x.toFixed(1)} ${y.toFixed(1)} q6 -8 0 -16 t0 -16`); v.style.opacity = ((1 - ph) * rate * 0.8).toFixed(2);
        });
      });
      paint();
      const dead = PL.filter((p) => p.W < 0.25).map((p) => p.name);
      now.textContent = drops.length || pouring ? '물을 붓는 중' : dead.length ? `${dead.join('·')} 시드는 중 · 물을 부어 보자` : '물뿌리개를 끌어 밭 위에서 누르고 있자';
    }
    let off = null;
    hold(can, svg, {
      down: (p) => { off = { x: cx - p.x, y: cy - p.y }; pouring = true; },
      move: (p) => { cx = clamp(p.x + off.x, 60, 1000); cy = clamp(p.y + off.y, 80, GY - 160); },
      up: () => { pouring = false; },
    });
    can.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); pouring = true; setTimeout(() => { pouring = false; }, 1200); }
      const d = { ArrowLeft: -60, ArrowRight: 60 }[e.key]; if (d) { e.preventDefault(); e.stopPropagation(); cx = clamp(cx + d, 60, 1000); }
    });
    paint();
    const L = loop(step);
    root._ws = { pour(x, sec) { cx = x; pouring = true; for (let i = 0; i < sec * 30; i++) step(1 / 30); pouring = false; }, run(sec) { for (let i = 0; i < sec * 30; i++) step(1 / 30); }, get plants() { return PL.map((p) => [p.k, +p.W.toFixed(2), +p.S.toFixed(2)]); } };
    void sun;
    return { setActive(on) { if (on) L.start(); else { L.stop(); pouring = false; } } };
  }
  window.WaterSoil = { mount };
})();
