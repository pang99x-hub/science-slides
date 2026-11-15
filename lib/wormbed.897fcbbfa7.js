/* 1차시 표지: 지렁이가 사는 밭과 없는 밭(교과서 72쪽 도입). 흙 단면 아래 «시간 띠»의 손잡이를 끌어 몇 주를 앞뒤로 돌린다.
   지렁이 밭: 굴(공기 길)이 길어지고 낙엽이 삭아 흙이 검어지며(양분) 배추가 크게 자란다. 없는 밭: 흙이 단단하고 낙엽이 남아 배추가 덜 자란다.
   주 수는 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const { el, hold, clamp, lerp, draw, loop } = window.Eco;
  const WEEKS = 8, TOP = 168, BOT = 330;

  function bed(svg, x0, worms) {
    const g = el('g', { class: 'wm-bed' }, svg);
    el('rect', { class: 'wm-soil', x: x0, y: TOP, width: 290, height: BOT - TOP, rx: 6 }, g);
    const rich = el('rect', { class: 'wm-rich', x: x0, y: TOP, width: 290, height: BOT - TOP, rx: 6 }, g);
    if (!worms) for (let i = 0; i < 9; i++) el('path', { class: 'wm-hard', d: `M${x0 + 14} ${TOP + 18 + i * 17} h 262` }, g);
    el('rect', { class: 'wm-edge', x: x0, y: TOP, width: 290, height: BOT - TOP, rx: 6 }, g);
    const roots = [], cabs = [], litter = [], tunnels = [], wormEls = [], air = [];
    [x0 + 55, x0 + 145, x0 + 235].forEach((cx) => {
      const r = el('path', { class: 'wm-root', d: `M${cx} ${TOP} l-10 30 M${cx} ${TOP} l0 40 M${cx} ${TOP} l12 32` }, g);
      roots.push({ r, cx });
      cabs.push(draw.cabbage(g, cx, TOP, 0.5));
    });
    for (let i = 0; i < 7; i++) {
      const lx = x0 + 22 + i * 40 + (i % 2) * 8;
      const l = el('ellipse', { class: 'wm-leaf', cx: lx, cy: TOP - 4, rx: 13, ry: 5, transform: `rotate(${(i * 37) % 40 - 20} ${lx} ${TOP - 4})` }, g);
      litter.push(l);
    }
    const humus = el('g', { class: 'wm-humus' }, g);
    for (let i = 0; i < 26; i++) el('circle', { cx: x0 + 12 + (i * 53) % 266, cy: TOP + 10 + (i * 29) % 70, r: 3 + (i % 3) }, humus);
    if (worms) {
      const paths = [
        `M${x0 + 30} ${TOP + 4} C ${x0 + 40} ${TOP + 60}, ${x0 + 90} ${TOP + 40}, ${x0 + 100} ${TOP + 110} S ${x0 + 70} ${BOT - 20}, ${x0 + 120} ${BOT - 14}`,
        `M${x0 + 180} ${TOP + 4} C ${x0 + 170} ${TOP + 50}, ${x0 + 220} ${TOP + 70}, ${x0 + 200} ${TOP + 120} S ${x0 + 250} ${BOT - 30}, ${x0 + 270} ${BOT - 50}`,
        `M${x0 + 120} ${TOP + 4} C ${x0 + 130} ${TOP + 40}, ${x0 + 150} ${TOP + 60}, ${x0 + 140} ${TOP + 90}`,
      ];
      paths.forEach((d) => {
        const t = el('path', { class: 'wm-tunnel', d }, g);
        tunnels.push(t);
        const w = el('path', { class: 'wm-wormb', d: 'M-16 0 L16 0' }, g);
        wormEls.push(w);
      });
      for (let i = 0; i < 12; i++) air.push(el('circle', { class: 'wm-air', r: 3.5 }, g));
    }
    el('text', { class: 'wm-name', x: x0 + 145, y: BOT - 14 }, g).textContent = worms ? '지렁이가 사는 밭' : '지렁이가 없는 밭';
    return { g, x0, worms, rich, roots, cabs, litter, humus, tunnels, wormEls, air };
  }

  function mount(root) {
    const svg = root.querySelector('.wm-svg');
    el('rect', { class: 'wm-sky', x: 0, y: 0, width: 640, height: TOP }, svg);
    const A = bed(svg, 20, true), B = bed(svg, 330, false);
    // 시간 띠
    const bar = el('g', { class: 'wm-time', tabindex: '0', role: 'slider', 'aria-label': '지난 시간(주)', 'aria-valuemin': '0', 'aria-valuemax': String(WEEKS) }, svg);
    el('rect', { class: 'wm-film', x: 30, y: 344, width: 580, height: 44, rx: 10 }, bar);
    for (let w = 0; w <= WEEKS; w++) {
      const x = 60 + w * 65;
      el('line', { class: 'wm-tick', x1: x, y1: 350, x2: x, y2: 360 }, bar);
      if (w % 2 === 0) el('text', { class: 'wm-tickt', x, y: 382 }, bar).textContent = w + '주';
    }
    const knob = el('g', { class: 'wm-knob' }, bar);
    el('rect', { x: -20, y: -18, width: 40, height: 36, rx: 9 }, knob);
    el('path', { d: 'M-6 -7 v14 M0 -7 v14 M6 -7 v14' }, knob);
    let t = 0, tm = 0;
    const lens = A.tunnels.map((p) => p.getTotalLength());

    function paintBed(b, u) {
      const grow = b.worms ? u : u * 0.35;
      b.cabs.forEach((c, i) => {
        const s = 0.5 + grow * (b.worms ? 0.95 : 0.9) - (b.worms ? 0 : i * 0.02);
        c.setAttribute('transform', `translate(${b.roots[i].cx} ${TOP}) scale(${s.toFixed(3)})`);
        c.style.filter = b.worms ? '' : `saturate(${(1 - u * 0.4).toFixed(2)})`;
      });
      b.roots.forEach(({ r, cx }) => { const L = 30 + (b.worms ? 90 : 26) * u; r.setAttribute('d', `M${cx} ${TOP} q-8 ${L * 0.5} -18 ${L * 0.8} M${cx} ${TOP} l0 ${L} M${cx} ${TOP} q10 ${L * 0.5} 20 ${L * 0.75}`); });
      const rot = b.worms ? u : u * 0.12;     // 낙엽이 삭는 정도
      b.litter.forEach((l, i) => { const k = clamp(rot * 1.4 - i * 0.05, 0, 1); l.style.opacity = (1 - k).toFixed(2); });
      b.humus.style.opacity = (b.worms ? u : u * 0.1).toFixed(2);
      b.rich.style.opacity = (b.worms ? u * 0.55 : 0).toFixed(2);
      b.tunnels.forEach((p, i) => {
        const L = lens[i], d = L * clamp(u * 1.1 - i * 0.05, 0, 1);
        p.style.strokeDasharray = `${d.toFixed(1)} ${L}`;
        const head = p.getPointAtLength(Math.max(1, d)), back = p.getPointAtLength(Math.max(0, d - 26));
        const wig = Math.sin(tm * 5 + i) * 3;
        b.wormEls[i].setAttribute('d', `M${back.x.toFixed(1)} ${back.y.toFixed(1)} Q${((head.x + back.x) / 2 + wig).toFixed(1)} ${((head.y + back.y) / 2 - wig).toFixed(1)} ${head.x.toFixed(1)} ${head.y.toFixed(1)}`);
      });
      b.air.forEach((a, i) => {
        const p = b.tunnels[i % 3], L = lens[i % 3], at = L * ((i * 0.13 + 0.08) % 1);
        const on = at < L * clamp(u * 1.1 - (i % 3) * 0.05, 0, 1);
        const q = p.getPointAtLength(at); a.setAttribute('cx', q.x.toFixed(1)); a.setAttribute('cy', q.y.toFixed(1)); a.style.opacity = on ? 1 : 0;
      });
    }
    function paint() {
      knob.setAttribute('transform', `translate(${60 + t * WEEKS * 65} 366)`);
      bar.setAttribute('aria-valuenow', String(Math.round(t * WEEKS)));
      paintBed(A, t); paintBed(B, t);
      root.querySelector('.wm-now').textContent = t < 0.02 ? '시간 띠를 끌어 몇 주 뒤로 가 보자' : `${Math.round(t * WEEKS)}주 뒤 · 두 밭의 배추를 견줘 보자`;
    }
    const setX = (x) => { t = clamp((x - 60) / (WEEKS * 65), 0, 1); paint(); };
    hold(bar, svg, { down: (p) => setX(p.x), move: (p) => setX(p.x) });
    bar.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); t = clamp(t + (e.key === 'ArrowRight' ? 1 : -1) / WEEKS, 0, 1); paint(); }
    });
    const L = loop((dt) => { tm += dt; paintBed(A, t); });
    paint();
    root._wm = { set(w) { t = clamp(w / WEEKS, 0, 1); paint(); } };
    return { setActive(on) { if (on) L.start(); else L.stop(); } };
  }
  window.WormBed = { mount };
  void lerp;
})();
