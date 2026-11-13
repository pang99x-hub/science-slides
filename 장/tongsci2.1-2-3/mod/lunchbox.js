/* 3차시 표지: 발열 도시락 단면. 오른쪽 끈 고리를 당긴다(최대 110). 85 넘게 당기면 물주머니가 터지고,
   물이 산화 칼슘 판에 스며들며 거품·김이 오르고 위 칸 음식 온도계가 20 → 75 °C(이해를 돕기 위한 예)로 오른다.
   덜 당기고 놓으면 끈이 되돌아간다. */
(function () {
  'use strict';
  const { el, clamp } = window.EA;
  function mount(root) {
    const svg = root.querySelector('.ea-lb-svg');
    el('rect', { class: 'ea-lb-bg', x: 0, y: 0, width: 640, height: 380 }, svg);
    el('rect', { class: 'ea-lb-table', x: 0, y: 340, width: 640, height: 40 }, svg);
    el('rect', { class: 'ea-lb-box', x: 90, y: 110, width: 400, height: 230, rx: 14 }, svg);
    el('rect', { class: 'ea-lb-lid', x: 82, y: 92, width: 416, height: 26, rx: 8 }, svg);
    el('circle', { class: 'ea-lb-hole', cx: 150, cy: 105, r: 7 }, svg);
    // 위 칸 음식
    el('rect', { class: 'ea-lb-tray', x: 110, y: 130, width: 360, height: 100, rx: 10 }, svg);
    el('path', { class: 'ea-lb-rice', d: 'M126 222 q20 -60 80 -60 q60 0 80 60 z' }, svg);
    el('path', { class: 'ea-lb-curry', d: 'M300 222 q20 -50 70 -50 q60 0 80 50 z' }, svg);
    el('text', { class: 'ea-lb-t', x: 290, y: 148, text: '음식 칸' }, svg);
    // 아래 칸
    el('rect', { class: 'ea-lb-heat', x: 110, y: 246, width: 360, height: 80, rx: 8 }, svg);
    const pad = el('rect', { class: 'ea-lb-pad', x: 124, y: 290, width: 332, height: 26, rx: 6 }, svg);
    const pouch = el('rect', { class: 'ea-lb-pouch', x: 150, y: 256, width: 280, height: 30, rx: 14 }, svg);
    const wet = el('rect', { class: 'ea-lb-wet', x: 124, y: 284, width: 332, height: 32, rx: 6 }, svg);
    el('text', { class: 'ea-lb-t sm', x: 290, y: 342 - 8, text: '' }, svg);
    el('text', { class: 'ea-lb-t sm', x: 290, y: 276, text: '물주머니' }, svg);
    const padT = el('text', { class: 'ea-lb-t sm', x: 290, y: 308, text: '회색 가루 판' }, svg);
    const bub = [...Array(12)].map((_, i) => ({ c: el('circle', { class: 'ea-lb-bub', r: 4 }, svg), x: 140 + i * 27, k: i / 12 }));
    const steam = [...Array(6)].map((_, i) => ({ c: el('ellipse', { class: 'ea-lb-steam', rx: 14, ry: 9 }, svg), k: i / 6 }));
    const arrows = el('g', { class: 'ea-lb-arr' }, svg);
    [180, 290, 400].forEach((x) => el('path', { d: `M${x} 282 V 236`, 'marker-end': 'url(#lb-h)' }, arrows));
    const m = el('marker', { id: 'lb-h', viewBox: '0 0 10 10', refX: 5, refY: 5, markerWidth: 4, markerHeight: 4, orient: 'auto' }, el('defs', {}, svg)); el('path', { d: 'M0 0 L10 5 L0 10 z', class: 'ea-lb-hh' }, m);
    const th = window.EA.thermo(svg, { x: 250, y: 214, h: 90, lo: 0, hi: 100, w: 12, cls: 'ea-lb-th' });
    // 끈
    const cord = el('path', { class: 'ea-lb-cord' }, svg);
    const ring = el('g', { class: 'ea-lb-ring', tabindex: 0, role: 'slider', 'aria-label': '끈 고리(오른쪽으로 끝까지 당기기, 오른쪽 화살표 키로도 당긴다)', 'aria-valuemin': 0, 'aria-valuemax': 100 }, svg);
    el('circle', { r: 16 }, ring); el('circle', { class: 'ea-lb-rhit', r: 40 }, ring);
    const say = el('text', { class: 'ea-lb-say', x: 560, y: 60 }, svg);
    const say2 = el('text', { class: 'ea-lb-say sm', x: 560, y: 86 }, svg);

    let pull = 0, held = false, start = 0, go = 0, T = 20, t = 0;
    window.EA.drag(ring, svg, {
      start(p) { held = true; start = p.x - pull; return go === 0; },
      move(p) { pull = clamp(p.x - start, 0, 110); if (pull >= 85 && go === 0) go = 0.001; },
      end() { held = false; },
    });
    ring.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' && go === 0) { e.preventDefault(); e.stopPropagation(); pull = clamp(pull + 30, 0, 110); if (pull >= 85) go = 0.001; } });
    function step(dt) {
      t += dt;
      if (!held && go === 0) pull += (0 - pull) * Math.min(1, dt * 6);
      if (go > 0) go = Math.min(1, go + dt / 6);
      const x = 500 + pull;
      cord.setAttribute('d', `M430 271 C 470 271, 480 300, ${x} 300`);
      ring.setAttribute('transform', `translate(${(x + 14).toFixed(1)} 300)`);
      ring.setAttribute('aria-valuenow', String(Math.round(pull / 1.1)));
      pouch.style.opacity = go > 0 ? String(Math.max(0, 1 - go * 6)) : '1';
      wet.style.opacity = String(Math.min(1, go * 4) * 0.7);
      const r = go > 0 ? Math.sin(Math.min(1, go * 1.6) * Math.PI / 2) * (1 - Math.max(0, go - 0.75) * 1.5) : 0;
      bub.forEach((b) => { b.k = (b.k + dt * 1.4) % 1; b.c.setAttribute('cx', b.x); b.c.setAttribute('cy', (312 - b.k * 30).toFixed(1)); b.c.style.opacity = String(r * (1 - b.k)); });
      steam.forEach((s, i) => { s.k = (s.k + dt * 0.4) % 1; s.c.setAttribute('cx', (150 + Math.sin(t * 2 + i) * 10 + s.k * 30).toFixed(1)); s.c.setAttribute('cy', (96 - s.k * 80).toFixed(1)); s.c.setAttribute('rx', (12 + s.k * 18).toFixed(1)); s.c.style.opacity = String(r * (1 - s.k) * 0.9); });
      arrows.style.opacity = String(r);
      T += ((20 + 55 * Math.min(1, go * 1.4)) - T) * Math.min(1, dt / 2);
      th.set(T);
      padT.textContent = go > 0.1 ? '가루 + 물 → 뜨거워짐' : '회색 가루 판';
      say.textContent = go === 0 ? (pull > 20 ? '끝까지!' : '끈 고리를 당기자') : T > 60 ? '음식이 데워졌다' : '김이 오른다';
      say2.textContent = go === 0 ? '→' : '열은 아래 칸에서 위로';
    }
    const loop = window.Stage.loop(step);
    step(0.016);
    const btns = [...root.querySelectorAll('.share-opts button')];
    window.EA.single(btns);
    const answer = (on) => root.querySelector('#pr-lime').classList.toggle('answer', on);
    root._lb = { pull() { pull = 110; go = 0.001; } };
    return {
      setActive(on) { if (on) loop.start(); else loop.stop(); },
      fragment(f, on) { if (f.dataset.anim === 'lb') answer(on); },
      sync(slide) { const f = slide.querySelector('[data-anim="lb"]'); answer(!!f && f.classList.contains('visible')); },
    };
  }
  window.LunchBox = { mount };
})();
