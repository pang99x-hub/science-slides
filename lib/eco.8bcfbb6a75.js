/* 2-1-2 생태계평형 공용 도우미: SVG 만들기, 화면 좌표 → SVG 좌표, 씨앗 있는 난수, 생물 그림.
   생물 그림은 모두 (0,0)을 발밑 가운데로 두고 크기 1일 때 높이 약 60 단위로 그린다. Eco.org(부모, '종류', x, y, 크기, 좌우뒤집기) */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a = {}, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  function pt(svg, e) {
    const m = svg.getScreenCTM(); if (!m) return { x: 0, y: 0 };
    const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    const q = p.matrixTransform(m.inverse()); return { x: q.x, y: q.y };
  }
  function rng(seed) { let s = seed >>> 0 || 1; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  const jong = (w) => { const c = w.charCodeAt(w.length - 1) - 0xac00; return c >= 0 && c < 11172 && c % 28 > 0; };
  const josa = { ga: (w) => w + (jong(w) ? '이' : '가'), eun: (w) => w + (jong(w) ? '은' : '는'), eul: (w) => w + (jong(w) ? '을' : '를'), wa: (w) => w + (jong(w) ? '과' : '와'),
    ege: (w) => w + '에게',
    ro: (w) => { const c = w.charCodeAt(w.length - 1) - 0xac00; return w + (jong(w) && c % 28 !== 8 ? '으로' : '로'); } };
  const keyStop = (inp) => inp.addEventListener('keydown', (e) => e.stopPropagation());

  // ---------- 생물 그림 ----------
  const D = {
    rice(g) {
      el('path', { class: 'o-stem', d: 'M0 0 C 2 -20 -2 -40 4 -58' }, g);
      el('path', { class: 'o-leaf', d: 'M0 -8 q -18 -14 -26 -36 q 14 16 28 26 z' }, g);
      el('path', { class: 'o-leaf', d: 'M2 -16 q 16 -10 22 -30 q -6 20 -20 34 z' }, g);
      const h = el('g', { class: 'o-head' }, g);
      for (let i = 0; i < 6; i++) el('ellipse', { class: 'o-grain', cx: 6 + i * 3.2, cy: -56 + i * 4.6, rx: 3.2, ry: 5, transform: `rotate(${-30 + i * 6} ${6 + i * 3.2} ${-56 + i * 4.6})` }, h);
    },
    grass(g) {
      el('path', { class: 'o-stem', d: 'M0 0 C -2 -20 4 -40 0 -56' }, g);
      el('path', { class: 'o-leaf', d: 'M0 -4 q -16 -10 -22 -30 q 10 14 24 24 z' }, g);
      el('path', { class: 'o-leaf', d: 'M0 -10 q 14 -8 18 -26 q -2 16 -16 30 z' }, g);
      el('ellipse', { class: 'o-fox', cx: -1, cy: -64, rx: 6, ry: 14, transform: 'rotate(-12 -1 -64)' }, g);
    },
    grasshopper(g) {
      el('path', { class: 'o-gh-leg', d: 'M-6 -8 L -14 -20 L -22 -2' }, g);
      el('ellipse', { class: 'o-gh', cx: 0, cy: -10, rx: 20, ry: 7 }, g);
      el('circle', { class: 'o-gh', cx: 18, cy: -13, r: 6 }, g);
      el('circle', { class: 'o-eye', cx: 20, cy: -14, r: 1.8 }, g);
      el('path', { class: 'o-gh-leg', d: 'M2 -6 l -4 6 M 10 -6 l 3 6' }, g);
      el('path', { class: 'o-ant', d: 'M21 -18 q 8 -12 18 -14' }, g);
    },
    sparrow(g) {
      el('ellipse', { class: 'o-sp', cx: 0, cy: -16, rx: 17, ry: 13 }, g);
      el('path', { class: 'o-sp-w', d: 'M-12 -22 q 10 -10 22 0 q -10 8 -22 0 z' }, g);
      el('circle', { class: 'o-sp-h', cx: 14, cy: -28, r: 9 }, g);
      el('path', { class: 'o-sp-c', d: 'M10 -22 q 4 4 10 0' }, g);
      el('path', { class: 'o-beak', d: 'M22 -29 l 8 2 l -8 3 z' }, g);
      el('circle', { class: 'o-eye', cx: 17, cy: -30, r: 2 }, g);
      el('path', { class: 'o-sp-t', d: 'M-15 -14 l -14 -6 l 2 8 z' }, g);
      el('path', { class: 'o-leg', d: 'M-2 -4 v 4 M 4 -4 v 4' }, g);
    },
    rabbit(g) {
      el('ellipse', { class: 'o-rb', cx: -4, cy: -16, rx: 20, ry: 15 }, g);
      el('circle', { class: 'o-rb', cx: 14, cy: -30, r: 10 }, g);
      el('ellipse', { class: 'o-rb', cx: 10, cy: -50, rx: 4, ry: 13, transform: 'rotate(-12 10 -50)' }, g);
      el('ellipse', { class: 'o-rb', cx: 18, cy: -50, rx: 4, ry: 13, transform: 'rotate(8 18 -50)' }, g);
      el('circle', { class: 'o-eye', cx: 18, cy: -32, r: 2 }, g);
      el('circle', { class: 'o-rb-t', cx: -24, cy: -18, r: 5 }, g);
    },
    mouse(g) {
      el('path', { class: 'o-tail', d: 'M-16 -8 q -16 2 -22 -10' }, g);
      el('ellipse', { class: 'o-ms', cx: 0, cy: -10, rx: 16, ry: 10 }, g);
      el('circle', { class: 'o-ms', cx: 6, cy: -20, r: 6 }, g);
      el('path', { class: 'o-ms', d: 'M12 -16 l 12 2 l -12 4 z' }, g);
      el('circle', { class: 'o-eye', cx: 14, cy: -15, r: 1.6 }, g);
    },
    frog(g) {
      el('ellipse', { class: 'o-fr', cx: 0, cy: -12, rx: 20, ry: 12 }, g);
      el('circle', { class: 'o-fr', cx: -9, cy: -24, r: 6 }, g); el('circle', { class: 'o-fr', cx: 9, cy: -24, r: 6 }, g);
      el('circle', { class: 'o-eye', cx: -9, cy: -25, r: 2.2 }, g); el('circle', { class: 'o-eye', cx: 9, cy: -25, r: 2.2 }, g);
      el('path', { class: 'o-fr-l', d: 'M-18 -4 q -10 4 -12 4 M 18 -4 q 10 4 12 4' }, g);
    },
    mole(g) {
      el('ellipse', { class: 'o-dirt', cx: 0, cy: -2, rx: 30, ry: 8 }, g);
      el('ellipse', { class: 'o-ml', cx: 0, cy: -12, rx: 18, ry: 12 }, g);
      el('ellipse', { class: 'o-ml-n', cx: 18, cy: -12, rx: 6, ry: 4 }, g);
      el('path', { class: 'o-ml-c', d: 'M-12 -4 l -6 4 M -8 -2 l -3 5 M 8 -2 l 3 5' }, g);
    },
    snake(g) {
      el('path', { class: 'o-sn', d: 'M-28 -6 q 10 -12 20 0 t 20 0 t 16 -12' }, g);
      el('ellipse', { class: 'o-sn-h', cx: 30, cy: -20, rx: 8, ry: 6 }, g);
      el('circle', { class: 'o-eye', cx: 32, cy: -22, r: 1.6 }, g);
      el('path', { class: 'o-tng', d: 'M38 -20 l 6 0 l 3 -2 M 44 -20 l 3 2' }, g);
    },
    owl(g) {
      el('ellipse', { class: 'o-ow', cx: 0, cy: -26, rx: 17, ry: 24 }, g);
      el('path', { class: 'o-ow', d: 'M-14 -46 l -2 -10 l 10 6 z M 14 -46 l 2 -10 l -10 6 z' }, g);
      el('circle', { class: 'o-ow-f', cx: -7, cy: -36, r: 7 }, g); el('circle', { class: 'o-ow-f', cx: 7, cy: -36, r: 7 }, g);
      el('circle', { class: 'o-eye', cx: -7, cy: -36, r: 2.6 }, g); el('circle', { class: 'o-eye', cx: 7, cy: -36, r: 2.6 }, g);
      el('path', { class: 'o-beak', d: 'M-3 -30 l 3 6 l 3 -6 z' }, g);
      el('path', { class: 'o-ow-b', d: 'M-8 -16 q 8 4 16 0 M -8 -10 q 8 4 16 0' }, g);
    },
    hawk(g) {
      el('path', { class: 'o-hk-w', d: 'M-4 -26 q -30 -16 -40 -4 q 16 -2 34 12 z M 4 -26 q 30 -16 40 -4 q -16 -2 -34 12 z' }, g);
      el('ellipse', { class: 'o-hk', cx: 0, cy: -20, rx: 10, ry: 18 }, g);
      el('circle', { class: 'o-hk', cx: 0, cy: -40, r: 8 }, g);
      el('path', { class: 'o-beak', d: 'M4 -42 q 8 0 6 8 l -4 -3 z' }, g);
      el('circle', { class: 'o-eye', cx: 3, cy: -42, r: 1.8 }, g);
      el('path', { class: 'o-hk-t', d: 'M-6 -4 l 6 6 l 6 -6 z' }, g);
    },
    deer(g) {
      el('path', { class: 'o-dr-l', d: 'M-16 -14 v 14 M -8 -14 v 14 M 10 -14 v 14 M 16 -14 v 14' }, g);
      el('ellipse', { class: 'o-dr', cx: 0, cy: -22, rx: 22, ry: 10 }, g);
      el('path', { class: 'o-dr', d: 'M16 -26 l 8 -18 l 8 2 l -6 20 z' }, g);
      el('ellipse', { class: 'o-dr', cx: 30, cy: -44, rx: 9, ry: 5, transform: 'rotate(18 30 -44)' }, g);
      el('path', { class: 'o-ant', d: 'M26 -48 l -4 -12 m 2 6 l -6 -2 M 30 -48 l 2 -12 m -1 6 l 6 -3' }, g);
      el('circle', { class: 'o-eye', cx: 31, cy: -46, r: 1.6 }, g);
      el('circle', { class: 'o-dr-s', cx: -6, cy: -24, r: 2 }, g); el('circle', { class: 'o-dr-s', cx: 4, cy: -20, r: 2 }, g);
    },
    wolf(g) {
      el('path', { class: 'o-wf-l', d: 'M-16 -12 v 12 M -8 -12 v 12 M 10 -12 v 12 M 16 -12 v 12' }, g);
      el('path', { class: 'o-wf', d: 'M-24 -18 q -10 -8 -14 -2 q 6 0 14 6 z' }, g);
      el('ellipse', { class: 'o-wf', cx: 0, cy: -20, rx: 22, ry: 9 }, g);
      el('path', { class: 'o-wf', d: 'M16 -24 l 10 -10 l 4 -8 l 4 8 l 10 6 l -6 4 l -14 2 z' }, g);
      el('circle', { class: 'o-eye', cx: 32, cy: -32, r: 1.6 }, g);
    },
    fish(g) {
      el('path', { class: 'o-fs', d: 'M-18 -10 q 14 -14 30 0 q -16 14 -30 0 z' }, g);
      el('path', { class: 'o-fs', d: 'M-16 -10 l -10 -8 l 0 16 z' }, g);
      el('circle', { class: 'o-eye', cx: 6, cy: -12, r: 1.8 }, g);
    },
    heron(g) {
      el('path', { class: 'o-leg', d: 'M-2 -20 v 20 M 4 -20 v 20' }, g);
      el('ellipse', { class: 'o-hr', cx: 0, cy: -30, rx: 16, ry: 10 }, g);
      el('path', { class: 'o-hr-n', d: 'M10 -34 q 8 -10 0 -20 q -6 -8 4 -12' }, g);
      el('circle', { class: 'o-hr', cx: 15, cy: -66, r: 5 }, g);
      el('path', { class: 'o-beak', d: 'M19 -67 l 16 2 l -16 2 z' }, g);
    },
    butterfly(g) {
      el('path', { class: 'o-bf', d: 'M0 -14 q -18 -20 -20 -4 q 2 10 20 4 z M 0 -14 q 18 -20 20 -4 q -2 10 -20 4 z' }, g);
      el('path', { class: 'o-bf2', d: 'M0 -12 q -12 12 -10 16 q 6 0 10 -14 z M 0 -12 q 12 12 10 16 q -6 0 -10 -14 z' }, g);
      el('path', { class: 'o-stem', d: 'M0 -20 v 14' }, g);
    },
    flower(g) {
      el('path', { class: 'o-stem', d: 'M0 0 v -26' }, g);
      for (let i = 0; i < 5; i++) { const a = i * 72 * Math.PI / 180; el('circle', { class: 'o-pet', cx: Math.cos(a) * 6, cy: -30 + Math.sin(a) * 6, r: 5 }, g); }
      el('circle', { class: 'o-ctr', cx: 0, cy: -30, r: 4 }, g);
    },
    tree(g) {
      el('rect', { class: 'o-trunk', x: -5, y: -30, width: 10, height: 30 }, g);
      el('circle', { class: 'o-crown', cx: 0, cy: -48, r: 24 }, g);
      el('circle', { class: 'o-crown', cx: -16, cy: -36, r: 14 }, g); el('circle', { class: 'o-crown', cx: 16, cy: -36, r: 14 }, g);
    },
    vine(g) {   // 가시박: 덩굴이 덮은 잎
      el('path', { class: 'o-vine', d: 'M-24 0 q 6 -22 18 -18 q 10 4 4 -14 q 12 4 20 -6' }, g);
      [[-16, -14], [0, -22], [14, -28], [-4, -8], [20, -12]].forEach(([x, y]) => el('path', { class: 'o-vleaf', d: `M${x} ${y} l -8 -4 l 4 -8 l 4 4 l 4 -4 l 4 8 z` }, g));
    },
  };
  function org(parent, kind, x, y, s = 1, flip = false, cls = '') {
    const g = el('g', { class: `org org-${kind} ${cls}`.trim(), transform: `translate(${x} ${y}) scale(${flip ? -s : s} ${s})` }, parent);
    D[kind](g);
    return g;
  }
  const place = (g, x, y, s = 1, flip = false) => g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${flip ? -s : s} ${s})`);

  window.Eco = { NS, el, clamp, lerp, pt, rng, josa, keyStop, org, place, kinds: Object.keys(D) };
})();
