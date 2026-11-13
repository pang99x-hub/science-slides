/* 3차시 표지 · 해 보기(교과서 80쪽): 같은 장소의 «그때»와 «지금»을 한 그림에 겹치고, 가운데 막대를 끌어 나누는 자리를 옮긴다.
   알프스산맥 1908 → 2017(100여 년간 빙하 절반 이상 사라짐), 아마존 열대우림 2000 → 2019(20여 년간 약 7 % 사라짐) — 수치는 교과서 값. 그림은 사진을 바탕으로 다시 그림. */
(function () {
  'use strict';
  const { el, pt, clamp, rng } = window.Eco;
  const W = 660, H = 340;
  const SITES = {
    alps: { then: '1908년', now: '2017년', cap: '알프스산맥: 100여 년 사이 빙하가 절반 넘게 녹아 없어졌다.' },
    amazon: { then: '2000년', now: '2019년', cap: '아마존 열대우림: 20여 년 사이 열대우림 전체 넓이의 약 7 %가 없어졌다.' },
  };
  function alps(g, now) {
    el('rect', { class: 'gl-sky', x: 0, y: 0, width: W, height: H }, g);
    el('path', { class: 'gl-mt', d: 'M0 210 L 90 70 L 170 150 L 260 40 L 360 140 L 450 60 L 560 160 L 660 90 V 340 H 0 Z' }, g);
    el('path', { class: 'gl-snow', d: now ? 'M240 70 L 260 40 L 282 72 Z M 432 86 L 450 60 L 470 88 Z' : 'M60 116 L 90 70 L 124 118 L 100 110 Z M 220 100 L 260 40 L 300 98 L 270 92 Z M 410 118 L 450 60 L 494 112 L 460 104 Z M 620 116 L 660 90 V 130 Z' }, g);
    el('path', { class: 'gl-rock', d: 'M0 340 L 0 250 Q 160 200 330 230 T 660 240 V 340 Z' }, g);
    // 빙하 혀: 그때는 골짜기를 가득, 지금은 위쪽 일부만
    el('path', { class: 'gl-ice', d: now ? 'M300 150 Q 330 160 352 150 L 372 196 Q 340 214 300 200 Z' : 'M250 120 Q 330 140 410 120 L 470 300 Q 340 340 200 300 Z' }, g);
    if (now) { el('path', { class: 'gl-lake', d: 'M262 268 Q 340 250 420 270 Q 400 300 330 300 Q 270 296 262 268 Z' }, g); el('path', { class: 'gl-moraine', d: 'M220 230 Q 330 250 440 226' }, g); }
    else for (let i = 0; i < 5; i++) el('path', { class: 'gl-crev', d: `M${250 + i * 40} ${180 + i * 12} q 30 6 40 0` }, g);
  }
  function amazon(g, now) {
    const R = rng(4);
    el('rect', { class: 'gl-forest', x: 0, y: 0, width: W, height: H }, g);
    for (let i = 0; i < 260; i++) el('circle', { class: 'gl-can', cx: R() * W, cy: R() * H, r: 6 + R() * 9 }, g);
    el('path', { class: 'gl-river', d: 'M-10 290 Q 160 250 300 300 T 670 270' }, g);
    if (now) {
      const roads = [[120, 0, 160, 340], [380, 0, 340, 340], [560, 0, 600, 300]];
      roads.forEach(([x1, y1, x2, y2]) => {
        el('path', { class: 'gl-cut', d: `M${x1} ${y1} L ${x2} ${y2}` }, g);
        for (let t = 0.08; t < 0.95; t += 0.09) { const x = x1 + (x2 - x1) * t, y = y1 + (y2 - y1) * t, L = 30 + R() * 50; el('path', { class: 'gl-cut b', d: `M${x - L} ${y + 4} L ${x + L} ${y - 4}` }, g); }
        el('path', { class: 'gl-road', d: `M${x1} ${y1} L ${x2} ${y2}` }, g);
      });
    }
  }
  function mount(root) {
    const svg = root.querySelector('.gl-svg'), cap = root.querySelector('.gl-cap'), range = root.querySelector('#gl-pos');
    const tabs = [...root.querySelectorAll('.gl-tab')];
    const defs = el('defs', {}, svg); const cp = el('clipPath', { id: 'gl-clip' }, defs); const cr = el('rect', { x: 0, y: 0, width: W / 2, height: H }, cp);
    const nowG = el('g', {}, svg), thenG = el('g', { 'clip-path': 'url(#gl-clip)' }, svg);
    const bar = el('g', { class: 'gl-bar', tabindex: '-1' }, svg);
    el('path', { class: 'gl-line', d: `M0 0 V ${H}` }, bar);
    el('circle', { class: 'gl-knob', cy: H / 2, r: 24 }, bar); el('path', { class: 'gl-arr', d: `M-10 ${H / 2} h 20 M -10 ${H / 2} l 6 -6 M -10 ${H / 2} l 6 6 M 10 ${H / 2} l -6 -6 M 10 ${H / 2} l -6 6` }, bar);
    const lt = el('g', {}, svg), rtg = el('g', {}, svg);
    el('rect', { class: 'gl-tagbg', x: 10, y: 10, width: 96, height: 34, rx: 17 }, lt); const tThen = el('text', { class: 'gl-tag', x: 58, y: 34 }, lt);
    el('rect', { class: 'gl-tagbg now', x: W - 106, y: 10, width: 96, height: 34, rx: 17 }, rtg); const tNow = el('text', { class: 'gl-tag', x: W - 58, y: 34 }, rtg);
    const hit = el('rect', { class: 'gl-hit', x: 0, y: 0, width: W, height: H }, svg);
    let site = 'alps', pos = 0.5;
    function draw() {
      nowG.innerHTML = ''; thenG.innerHTML = '';
      (site === 'alps' ? alps : amazon)(nowG, true); (site === 'alps' ? alps : amazon)(thenG, false);
      tThen.textContent = SITES[site].then; tNow.textContent = SITES[site].now; cap.textContent = SITES[site].cap; paint();
    }
    function paint() { const x = pos * W; cr.setAttribute('width', x); bar.setAttribute('transform', `translate(${x.toFixed(1)} 0)`); range.value = String(Math.round(pos * 100)); }
    let drag = false;
    const set = (e) => { pos = clamp(pt(svg, e).x / W, 0.02, 0.98); paint(); };
    hit.addEventListener('pointerdown', (e) => { e.preventDefault(); drag = true; hit.setPointerCapture(e.pointerId); set(e); });
    hit.addEventListener('pointermove', (e) => { if (drag) set(e); });
    ['pointerup', 'pointercancel'].forEach((t) => hit.addEventListener(t, () => { drag = false; }));
    range.addEventListener('input', () => { pos = clamp(Number(range.value) / 100, 0.02, 0.98); paint(); });
    window.Eco.keyStop(range);
    tabs.forEach((b) => b.addEventListener('click', () => { site = b.dataset.k; tabs.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); pos = 0.5; draw(); }));
    draw();
    root._gl = { get pos() { return pos; } };
    return {};
  }
  window.GlacierWipe = { mount };
})();
