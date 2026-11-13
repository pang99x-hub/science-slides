/* 2차시 3장 온도 · 여우(교과서 74쪽 그림 Ⅱ-3): 사막여우는 몸이 작고 귀가 크고, 북극여우는 반대다.
   왼쪽 온도계의 빨간 기둥을 위아래로 끌면 사는 곳(눈밭 ↔ 모래 언덕)과 여우의 몸(몸집·귀·주둥이·다리·털빛·털 두께)이 함께 바뀐다.
   열 화면: 귀와 몸에서 빠져나가는 열이 물결로 보인다(더운 곳에서는 큰 귀로 열을 내보내 몸을 식힌다). 눈금에 숫자는 없다. */
(function () {
  'use strict';
  const { el, hold, clamp, lerp, loop } = window.Eco;
  const TY0 = 520, TY1 = 90;   // 온도계 기둥 아래·위 끝
  const mix = (a, b, u) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], u))).join(',')})`; };

  function mount(root) {
    const svg = root.querySelector('.fx-svg');
    const sky = el('rect', { x: -400, y: -300, width: 1856, height: 1300 }, svg);
    const dunes = el('path', { class: 'fx-dune', d: 'M-400 470 Q 300 380 700 450 T 1456 430 L1456 1000 L-400 1000 Z' }, svg);
    const ground = el('path', { d: 'M-400 520 Q 400 490 1456 515 L1456 1000 L-400 1000 Z' }, svg);
    const pines = el('g', {}, svg);
    [[300, 470, 1.1], [980, 460, 0.9], [880, 480, 0.7]].forEach(([x, y, s]) => window.Eco.draw.pine(pines, x, y, s));
    const cacti = el('g', {}, svg);
    [[330, 480], [960, 470]].forEach(([x, y]) => { el('path', { class: 'ec-o', fill: '#5e9a52', d: `M${x - 10} ${y} v-80 a10 10 0 0 1 20 0 v80 z M${x + 10} ${y - 40} h12 v-24 a6 6 0 0 1 12 0 v30 a6 6 0 0 1 -6 6 h-18 z` }, cacti); });
    const snow = el('g', {}, svg);
    const flakes = Array.from({ length: 40 }, (_, i) => ({ x: (i * 83) % 1056, y: (i * 47) % 560, e: el('circle', { class: 'fx-flake', r: 3 + (i % 3) }, snow) }));
    const shimmer = el('g', { class: 'fx-shim' }, svg);
    [0, 1, 2].forEach((i) => el('path', { d: `M${420 + i * 160} 440 q10 -10 0 -20 t0 -20 t0 -20` }, shimmer));
    const sun = el('circle', { class: 'ec-o', cx: 960, cy: 90, r: 40, fill: '#ffd34d' }, svg);
    // 여우
    const fox = el('g', {}, svg);
    const tail = el('path', { class: 'fx-fur' }, fox);
    const legs = [0, 1, 2, 3].map(() => el('path', { class: 'fx-leg' }, fox));
    const body = el('ellipse', { class: 'fx-fur' }, fox);
    const earB = el('path', { class: 'fx-fur' }, fox);
    const head = el('circle', { class: 'fx-fur' }, fox);
    const snout = el('path', { class: 'fx-fur' }, fox);
    const earF = el('path', { class: 'fx-fur' }, fox);
    const earIn = el('path', { class: 'fx-earin' }, fox);
    const eye = el('circle', { r: 4, fill: '#1d2433' }, fox);
    const nose = el('circle', { r: 4.5, fill: '#1d2433' }, fox);
    const heat = el('g', { class: 'fx-heat' }, svg);
    const waves = Array.from({ length: 6 }, () => el('path', {}, heat));
    const bodyHeat = Array.from({ length: 5 }, () => el('path', { class: 'fx-bheat' }, heat));
    // 온도계
    const th = el('g', { class: 'fx-th', tabindex: '0', role: 'slider', 'aria-label': '사는 곳의 온도: 위로 끌면 덥고 아래로 끌면 춥다' }, svg);
    el('rect', { class: 'fx-tube', x: 66, y: TY1 - 30, width: 48, height: TY0 - TY1 + 60, rx: 24 }, th);
    el('circle', { class: 'fx-tube', cx: 90, cy: TY0 + 46, r: 38 }, th);
    const col = el('rect', { class: 'fx-col', x: 78, width: 24, rx: 12 }, th);
    el('circle', { class: 'fx-bulb', cx: 90, cy: TY0 + 46, r: 28 }, th);
    for (let i = 0; i <= 8; i++) el('line', { class: 'fx-tk', x1: 114, x2: 128, y1: TY0 - i * (TY0 - TY1) / 8, y2: TY0 - i * (TY0 - TY1) / 8 }, th);
    const grip = el('g', { class: 'fx-grip' }, th);
    el('rect', { x: -34, y: -14, width: 68, height: 28, rx: 14 }, grip); el('path', { d: 'M-8 -5 h16 M-8 0 h16 M-8 5 h16' }, grip);
    el('text', { class: 'fx-tl', x: 140, y: TY1 + 6 }, th).textContent = '덥다';
    el('text', { class: 'fx-tl', x: 140, y: TY0 + 6 }, th).textContent = '춥다';
    const where = el('text', { class: 'fx-where', x: 600, y: 60 }, svg);
    const now = root.querySelector('.fx-now');
    const bars = { size: root.querySelector('.fx-bar[data-k="size"] i'), ear: root.querySelector('.fx-bar[data-k="ear"] i'), loss: root.querySelector('.fx-bar[data-k="loss"] i') };
    const cards = [...root.querySelectorAll('.fx-card')];
    let u = 0.5, tm = 0;

    function shape() {
      const s = lerp(1.75, 0.98, u), earL = lerp(22, 92, u), earW = lerp(20, 34, u), leg = lerp(38, 58, u), sn = lerp(22, 34, u);
      const fur = mix('#f4f4ef', '#e2ae6a', u), fluff = lerp(10, 2.5, u);
      const X = 590, G = 590, by = -leg - 30;
      fox.setAttribute('transform', `translate(${X} ${G}) scale(${s.toFixed(3)})`);
      [tail, body, earB, head, snout, earF].forEach((p) => { p.setAttribute('fill', fur); p.style.strokeWidth = (2.5 + fluff * 0.15) + 'px'; });
      body.setAttribute('cx', 0); body.setAttribute('cy', by); body.setAttribute('rx', 72 + fluff); body.setAttribute('ry', 30 + fluff * 1.2);
      [[-46, -1], [-30, 1], [36, -1], [50, 1]].forEach(([lx], i) => legs[i].setAttribute('d', `M${lx} ${by + 10} L${lx + 2} 0`));
      legs.forEach((l) => { l.style.stroke = mix('#d9d9d2', '#b7834a', u); });
      const hx = 80, hy = by - 34;
      head.setAttribute('cx', hx); head.setAttribute('cy', hy); head.setAttribute('r', 28 + fluff * 0.5);
      snout.setAttribute('d', `M${hx + 14} ${hy - 10} L${hx + 22 + sn} ${hy + 6} L${hx + 12} ${hy + 16} Z`);
      nose.setAttribute('cx', hx + 22 + sn); nose.setAttribute('cy', hy + 6);
      eye.setAttribute('cx', hx + 12); eye.setAttribute('cy', hy - 6);
      const ear = (bx) => `M${bx - earW / 2} ${hy - 18} L${bx + 4} ${hy - 18 - earL} L${bx + earW / 2} ${hy - 16} Z`;
      earB.setAttribute('d', ear(hx - 16)); earF.setAttribute('d', ear(hx + 4));
      earIn.setAttribute('d', `M${hx + 4 - earW / 4} ${hy - 20} L${hx + 8} ${hy - 18 - earL * 0.8} L${hx + 4 + earW / 4} ${hy - 19} Z`);
      tail.setAttribute('d', `M-62 ${by - 6} Q-130 ${by - 10 - fluff * 2} -150 ${by + 40} Q-120 ${by + 30 + fluff} -60 ${by + 14} Z`);
      // 열 물결: 귀(+몸)에서 밖으로. 더울수록 귀에서 많이(몸을 식힌다), 추울 때 작은 귀·두꺼운 털은 열을 덜 잃는다
      const earTip = { x: X + (hx + 8) * s, y: G + (hy - 18 - earL * 0.6) * s };
      waves.forEach((w, i) => {
        const ph = (tm * 0.8 + i / waves.length) % 1, r = 20 + ph * 70;
        const a0 = -1.9 + (i % 3) * 0.45;
        w.setAttribute('d', `M${(earTip.x + r * Math.cos(a0)).toFixed(1)} ${(earTip.y + r * Math.sin(a0)).toFixed(1)} a${r} ${r} 0 0 1 ${(r * (Math.cos(a0 + 0.5) - Math.cos(a0))).toFixed(1)} ${(r * (Math.sin(a0 + 0.5) - Math.sin(a0))).toFixed(1)}`);
        w.style.opacity = ((1 - ph) * lerp(0.1, 1, u)).toFixed(2);
      });
      bodyHeat.forEach((w, i) => {
        const ph = (tm * 0.6 + i / bodyHeat.length) % 1, x = X + (-40 + i * 22) * s, y = G + (by - 34 - fluff) * s - ph * 50;
        w.setAttribute('d', `M${x.toFixed(1)} ${y.toFixed(1)} q6 -8 0 -16 t0 -16`);
        w.style.opacity = ((1 - ph) * 0.5 * lerp(0.2, 0.6, u)).toFixed(2);
      });
      return { s, earL };
    }
    function paint() {
      sky.setAttribute('fill', mix('#dfe9f2', '#f7e2b5', u));
      ground.setAttribute('fill', mix('#ffffff', '#e9c98f', u));
      dunes.setAttribute('fill', mix('#eef3f7', '#dcb06e', u));
      dunes.style.opacity = u.toFixed(2);
      pines.style.opacity = clamp(1 - u * 2, 0, 1).toFixed(2); cacti.style.opacity = clamp(u * 2 - 1, 0, 1).toFixed(2);
      snow.style.opacity = clamp(1 - u * 2.2, 0, 1).toFixed(2); shimmer.style.opacity = clamp(u * 2 - 1, 0, 1).toFixed(2);
      sun.style.opacity = (0.35 + 0.65 * u).toFixed(2);
      const top = lerp(TY0, TY1, u);
      col.setAttribute('y', top.toFixed(1)); col.setAttribute('height', (TY0 + 46 - top).toFixed(1));
      grip.setAttribute('transform', `translate(90 ${top.toFixed(1)})`);
      th.setAttribute('aria-valuenow', String(Math.round(u * 100)));
      const { s, earL } = shape();
      where.textContent = u < 0.3 ? '추운 눈밭 — 북극여우를 닮아 간다' : u > 0.7 ? '뜨거운 모래 언덕 — 사막여우를 닮아 간다' : '두 곳의 중간';
      bars.size.style.width = (lerp(15, 100, (s - 0.98) / 0.77)).toFixed(0) + '%';
      bars.ear.style.width = (lerp(10, 100, (earL - 22) / 70)).toFixed(0) + '%';
      bars.loss.style.width = (lerp(12, 100, u)).toFixed(0) + '%';
      cards.forEach((c) => c.classList.toggle('on', c.dataset.k === (u < 0.3 ? 'arctic' : u > 0.7 ? 'desert' : '')));
      now.textContent = u > 0.3 && u < 0.7 ? '온도계 기둥을 끌어 위아래로 끝까지 가 보자' : '반대쪽 끝으로도 끌어 보자';
    }
    function step(dt) {
      tm += dt;
      flakes.forEach((f) => { f.y += dt * 60; f.x += Math.sin(tm + f.y / 50) * dt * 20; if (f.y > 560) f.y = -10; f.e.setAttribute('cx', f.x.toFixed(1)); f.e.setAttribute('cy', f.y.toFixed(1)); });
      shape();
    }
    const setY = (p) => { u = clamp((TY0 - p.y) / (TY0 - TY1), 0, 1); paint(); };
    hold(th, svg, { down: setY, move: setY });
    th.addEventListener('keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
      e.preventDefault(); e.stopPropagation(); u = clamp(u + (e.key === 'ArrowUp' || e.key === 'ArrowRight' ? 0.1 : -0.1), 0, 1); paint();
    });
    paint();
    const L = loop(step);
    root._fx = { set(v) { u = clamp(v, 0, 1); paint(); } };
    return { setActive(on) { if (on) L.start(); else L.stop(); } };
  }
  window.FoxTemp = { mount };
})();
