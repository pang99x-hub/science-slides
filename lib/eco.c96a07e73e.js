/* 2-1-1 생물과 환경 — 장 모듈이 함께 쓰는 도구와 생물 그림(SVG).
   Eco.el(태그, 속성, 부모) · Eco.pt(svg, 이벤트) → viewBox 좌표 · Eco.hold(요소, svg, { down, move, up }) 끌기
   Eco.ghost(원본, { label, drop(칸|null, 원본), over(칸|null) }) 칸으로 끌어 넣을 때 손가락을 따라오는 복사본
   Eco.draw.이름(부모, x, y, 크기, 옵션) → 발밑(바닥)이 (x, y)인 생물 그림 g
   클래스는 모두 ec-로 시작한다(엔진·다른 단원 이름과 겹치지 않게). */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); if (a) for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, u) => a + (b - a) * u;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function pt(svg, e) {
    const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    const m = svg.getScreenCTM(); return m ? p.matrixTransform(m.inverse()) : { x: 0, y: 0 };
  }
  // 요소를 눌러 끄는 동안 viewBox 좌표를 넘겨준다. down이 false를 돌려주면 끌지 않는다
  function hold(target, svg, o) {
    let on = null;
    target.addEventListener('pointerdown', (e) => {
      if (e.button) return;
      if (o.down && o.down(pt(svg, e), e) === false) return;
      on = e.pointerId; e.stopPropagation(); e.preventDefault();
      try { target.setPointerCapture(e.pointerId); } catch (err) { /* 합성 이벤트 */ }
    });
    target.addEventListener('pointermove', (e) => { if (on === e.pointerId && o.move) o.move(pt(svg, e), e); });
    const end = (e) => { if (on !== e.pointerId) return; on = null; if (o.up) o.up(pt(svg, e), e); };
    target.addEventListener('pointerup', end); target.addEventListener('pointercancel', end);
  }
  // 끌어 넣기: 원본(SVG g 또는 HTML)을 누르면 복사본이 손가락을 따라오고, 놓은 자리의 [data-zone]을 drop에 넘긴다.
  // 누르기만 하고 떼면 «골라 두기»가 되고, 그다음 칸을 누르면 그 칸에 넣는다(작은 화면·키보드).
  function ghosts(items, o) {
    let picked = null;
    const setPick = (c) => { if (picked) picked.classList.remove('ec-picked'); picked = c; if (c) c.classList.add('ec-picked'); if (o.pick) o.pick(c); };
    const zoneAt = (x, y) => { const t = document.elementFromPoint(x, y); return t ? t.closest('[data-zone]') : null; };
    items.forEach((c) => {
      let g = null, sx = 0, sy = 0, moved = false, on = null, last = null;
      c.addEventListener('pointerdown', (e) => {
        if (e.button || c.classList.contains('ec-done')) return;
        on = e.pointerId; sx = e.clientX; sy = e.clientY; moved = false;
        try { c.setPointerCapture(e.pointerId); } catch (err) { /* 합성 이벤트 */ }
        e.stopPropagation(); e.preventDefault();
      });
      c.addEventListener('pointermove', (e) => {
        if (on !== e.pointerId) return;
        if (!moved && Math.hypot(e.clientX - sx, e.clientY - sy) < 6) return;
        if (!moved) {
          moved = true; setPick(null);
          const r = c.getBoundingClientRect();
          g = document.createElement('div'); g.className = 'ec-ghost';
          g.textContent = o.label ? o.label(c) : c.textContent;
          document.body.appendChild(g);
          c.classList.add('ec-lifted'); void r;
        }
        g.style.left = e.clientX + 'px'; g.style.top = e.clientY + 'px';
        const z = zoneAt(e.clientX, e.clientY);
        if (z !== last) { last = z; if (o.over) o.over(z); }
      });
      const end = (e, cancel) => {
        if (on !== e.pointerId) return; on = null;
        if (!moved) { if (!cancel) setPick(picked === c ? null : c); return; }
        const z = cancel ? null : zoneAt(e.clientX, e.clientY);
        if (g) g.remove(); g = null; c.classList.remove('ec-lifted');
        if (o.over) o.over(null); last = null;
        o.drop(z, c);
      };
      c.addEventListener('pointerup', (e) => end(e, false));
      c.addEventListener('pointercancel', (e) => end(e, true));
      c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); setPick(picked === c ? null : c); } });
    });
    return { get picked() { return picked; }, unpick: () => setPick(null) };
  }
  // 장이 보일 때만 도는 고리
  function loop(step) {
    let raf = 0, last = 0, on = false;
    const tick = (t) => { if (!on) return; const dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016); last = t; step(dt); raf = requestAnimationFrame(tick); };
    return { start() { if (on) return; on = true; last = 0; raf = requestAnimationFrame(tick); }, stop() { on = false; cancelAnimationFrame(raf); }, get on() { return on; } };
  }
  const keyStop = (inp) => inp.addEventListener('keydown', (e) => e.stopPropagation());   // ←→로 슬라이드가 넘어가지 않게

  // ---------- 생물 그림 (발밑이 원점, 크기 1에서 키 약 100) ----------
  const G = (p, x, y, s, cls) => el('g', { transform: `translate(${x} ${y}) scale(${s})`, class: cls || '' }, p);
  const D = {
    tree(p, x, y, s = 1, o = {}) {
      const g = G(p, x, y, s, 'ec-tree');
      el('path', { class: 'ec-o ec-trunk', d: 'M-9 0 L-7 -70 L7 -70 L9 0 Z' }, g);
      const leaf = o.color || '#5f9c4f';
      [[-34, -96, 34], [30, -100, 36], [0, -132, 42], [-8, -88, 30]].forEach(([cx, cy, r]) => el('circle', { class: 'ec-o', cx, cy, r, fill: leaf }, g));
      return g;
    },
    pine(p, x, y, s = 1) {
      const g = G(p, x, y, s, 'ec-tree');
      el('rect', { class: 'ec-o ec-trunk', x: -6, y: -22, width: 12, height: 22 }, g);
      el('path', { class: 'ec-o', fill: '#3f7f52', d: 'M0 -130 L34 -64 L18 -64 L42 -22 L-42 -22 L-18 -64 L-34 -64 Z' }, g);
      return g;
    },
    grass(p, x, y, s = 1, color = '#6aa84f') {
      const g = G(p, x, y, s, 'ec-grass');
      el('path', { d: 'M-12 0 Q-14 -18 -20 -28 M-4 0 Q-4 -22 -8 -36 M4 0 Q6 -20 12 -32 M12 0 Q16 -12 22 -20', stroke: color, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round' }, g);
      return g;
    },
    sun(p, x, y, s = 1) {
      const g = G(p, x, y, s, 'ec-sun');
      for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; el('line', { x1: 38 * Math.cos(a), y1: 38 * Math.sin(a), x2: 52 * Math.cos(a), y2: 52 * Math.sin(a), class: 'ec-ray' }, g); }
      el('circle', { r: 30, class: 'ec-o', fill: '#ffd34d' }, g);
      return g;
    },
    cloud(p, x, y, s = 1) {
      const g = G(p, x, y, s, 'ec-cloud');
      el('path', { class: 'ec-o', fill: '#ffffff', d: 'M-50 0 a20 20 0 0 1 10 -34 a26 26 0 0 1 46 -8 a22 22 0 0 1 38 14 a18 18 0 0 1 6 28 z' }, g);
      return g;
    },
    mushroom(p, x, y, s = 1, color = '#c8643c') {
      const g = G(p, x, y, s, 'ec-mush');
      el('path', { class: 'ec-o', fill: '#f4ead8', d: 'M-7 0 L-6 -24 L6 -24 L7 0 Z' }, g);
      el('path', { class: 'ec-o', fill: color, d: 'M-24 -22 Q-24 -50 0 -52 Q24 -50 24 -22 Z' }, g);
      [[-10, -38], [8, -42], [12, -30]].forEach(([cx, cy]) => el('circle', { cx, cy, r: 3.5, fill: '#fbe8d4' }, g));
      return g;
    },
    worm(p, x, y, s = 1) {
      const g = G(p, x, y, s, 'ec-worm');
      el('path', { class: 'ec-wormb', d: 'M-30 0 C-20 -12 -10 10 0 0 S20 -10 30 0' }, g);
      el('circle', { cx: 30, cy: 0, r: 3, fill: '#8a3b3b' }, g);
      return g;
    },
    deer(p, x, y, s = 1, o = {}) {
      const g = G(p, x, y, s, 'ec-deer');
      const fur = '#c98a4a';
      if (o.lying) {
        el('path', { class: 'ec-o', fill: fur, d: 'M-46 0 Q-50 -34 -10 -36 Q30 -40 44 -14 Q46 0 30 0 Z' }, g);
        el('path', { class: 'ec-o', fill: fur, d: 'M30 -24 L40 -60 L52 -62 L50 -22 Z' }, g);
        el('path', { class: 'ec-o', fill: fur, d: 'M40 -64 Q46 -76 60 -70 L68 -58 Q58 -54 48 -54 Z' }, g);
      } else {
        [-30, -18, 22, 32].forEach((lx) => el('path', { class: 'ec-o ec-leg', d: `M${lx} -40 L${lx + 2} 0` }, g));
        el('ellipse', { class: 'ec-o', fill: fur, cx: 0, cy: -50, rx: 42, ry: 18 }, g);
        el('path', { class: 'ec-o', fill: fur, d: 'M28 -58 L40 -92 L52 -90 L46 -54 Z' }, g);
        el('path', { class: 'ec-o', fill: fur, d: 'M40 -96 Q48 -108 62 -100 L70 -88 Q60 -84 48 -86 Z' }, g);
      }
      const hy = o.lying ? -70 : -100;
      if (!o.doe) el('path', { class: 'ec-ant', d: `M46 ${hy - 2} L40 ${hy - 26} M42 ${hy - 16} L32 ${hy - 22} M50 ${hy - 2} L58 ${hy - 26} M56 ${hy - 16} L66 ${hy - 20}` }, g);
      [[-20, -52], [-4, -56], [10, -50], [-12, -44]].forEach(([cx, cy]) => el('circle', { cx, cy: cy + (o.lying ? 30 : 0), r: 3, fill: '#f7e6c8' }, g));
      return g;
    },
    rabbit(p, x, y, s = 1) {
      const g = G(p, x, y, s, 'ec-rabbit');
      el('ellipse', { class: 'ec-o', fill: '#9b7b62', cx: 0, cy: -16, rx: 20, ry: 15 }, g);
      el('circle', { class: 'ec-o', fill: '#9b7b62', cx: 18, cy: -30, r: 10 }, g);
      el('path', { class: 'ec-o', fill: '#9b7b62', d: 'M16 -38 Q12 -62 18 -60 Q22 -50 22 -38 Z M22 -38 Q24 -60 30 -56 Q30 -46 26 -36 Z' }, g);
      el('circle', { cx: -20, cy: -18, r: 5, fill: '#efe6dc', class: 'ec-o' }, g);
      return g;
    },
    squirrel(p, x, y, s = 1) {
      const g = G(p, x, y, s, 'ec-squirrel');
      el('path', { class: 'ec-o', fill: '#b5652e', d: 'M-10 -8 Q-40 -10 -34 -46 Q-28 -60 -16 -48 Q-24 -30 -6 -20 Z' }, g);
      el('ellipse', { class: 'ec-o', fill: '#c8763a', cx: 2, cy: -14, rx: 12, ry: 14 }, g);
      el('circle', { class: 'ec-o', fill: '#c8763a', cx: 10, cy: -30, r: 8 }, g);
      return g;
    },
    duck(p, x, y, s = 1) {
      const g = G(p, x, y, s, 'ec-duck');
      el('path', { class: 'ec-o', fill: '#ffffff', d: 'M-34 -10 Q-30 -34 0 -30 L16 -30 Q14 -48 26 -50 Q38 -50 38 -40 L48 -38 L38 -34 Q34 -24 26 -22 Q30 -4 0 0 Q-30 2 -34 -10 Z' }, g);
      el('circle', { cx: 30, cy: -42, r: 2.5, fill: '#1d2433' }, g);
      el('path', { d: 'M38 -40 L48 -38 L38 -34 Z', fill: '#f2a23a' }, g);
      return g;
    },
    frog(p, x, y, s = 1) {
      const g = G(p, x, y, s, 'ec-frog');
      el('path', { class: 'ec-o', fill: '#6fae4a', d: 'M-22 0 Q-30 -20 -10 -26 Q0 -30 12 -26 Q30 -20 22 0 Z' }, g);
      el('circle', { class: 'ec-o', fill: '#6fae4a', cx: -8, cy: -28, r: 6 }, g); el('circle', { class: 'ec-o', fill: '#6fae4a', cx: 8, cy: -28, r: 6 }, g);
      el('circle', { cx: -8, cy: -29, r: 2.4, fill: '#1d2433' }, g); el('circle', { cx: 8, cy: -29, r: 2.4, fill: '#1d2433' }, g);
      el('path', { class: 'ec-o', fill: 'none', d: 'M-22 0 L-30 -6 M22 0 L30 -6' }, g);
      return g;
    },
    fish(p, x, y, s = 1, color = '#c9a65a') {
      const g = G(p, x, y, s, 'ec-fish');
      el('path', { class: 'ec-o', fill: color, d: 'M-34 -14 Q-6 -36 24 -14 Q-6 8 -34 -14 Z' }, g);
      el('path', { class: 'ec-o', fill: color, d: 'M-32 -14 L-48 -26 L-46 -2 Z' }, g);
      el('circle', { cx: 14, cy: -17, r: 2.4, fill: '#1d2433' }, g);
      return g;
    },
    snail(p, x, y, s = 1) {
      const g = G(p, x, y, s, 'ec-snail');
      el('path', { class: 'ec-o', fill: '#8b7d6b', d: 'M-14 0 L0 -34 L14 0 Z' }, g);
      el('path', { d: 'M-8 -10 L8 -12 M-5 -20 L5 -22', stroke: '#5c5245', 'stroke-width': 2 }, g);
      el('path', { class: 'ec-o', fill: '#b9a993', d: 'M10 0 Q24 -2 26 -6 L12 -6 Z' }, g);
      return g;
    },
    paramecium(p, x, y, s = 1) {
      const g = G(p, x, y, s, 'ec-para');
      el('path', { class: 'ec-o', fill: '#d8e8c6', d: 'M-30 -10 Q-26 -26 0 -24 Q28 -22 30 -10 Q26 4 0 2 Q-26 4 -30 -10 Z' }, g);
      for (let i = -24; i <= 24; i += 8) el('path', { d: `M${i} -24 l-2 -6 M${i} 3 l-2 6`, stroke: '#7b8597', 'stroke-width': 1.5 }, g);
      el('ellipse', { cx: 2, cy: -11, rx: 7, ry: 5, fill: '#9fbf85' }, g);
      return g;
    },
    lotus(p, x, y, s = 1) {
      const g = G(p, x, y, s, 'ec-lotus');
      el('path', { class: 'ec-o', fill: '#4f9a52', d: 'M-40 0 A40 12 0 1 0 40 0 A40 12 0 0 0 4 -10 L0 0 L-4 -10 A40 12 0 0 0 -40 0 Z' }, g);
      [-14, 0, 14].forEach((dx, i) => el('path', { class: 'ec-o', fill: i === 1 ? '#f7b7cf' : '#f3c9d9', d: `M${dx} -6 Q${dx - 10} -24 ${dx} -34 Q${dx + 10} -24 ${dx} -6 Z` }, g));
      return g;
    },
    cattail(p, x, y, s = 1) {
      const g = G(p, x, y, s, 'ec-cattail');
      el('path', { d: 'M0 0 L0 -110 M-10 0 Q-14 -50 -22 -80 M10 0 Q16 -50 24 -86', stroke: '#5f8c3f', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, g);
      el('rect', { class: 'ec-o', fill: '#7a4a2a', x: -6, y: -96, width: 12, height: 34, rx: 6 }, g);
      return g;
    },
    hyacinth(p, x, y, s = 1) {
      const g = G(p, x, y, s, 'ec-hya');
      [[-18, -16], [0, -22], [18, -16]].forEach(([cx, cy]) => el('ellipse', { class: 'ec-o', fill: '#5aa34a', cx, cy, rx: 12, ry: 15 }, g));
      el('path', { d: 'M0 -26 L0 -58', stroke: '#5f8c3f', 'stroke-width': 4 }, g);
      [[-6, -56], [6, -60], [0, -68], [-4, -48], [6, -50]].forEach(([cx, cy]) => el('circle', { class: 'ec-o', fill: '#9a7bd1', cx, cy, r: 6 }, g));
      return g;
    },
    hydrilla(p, x, y, s = 1) {
      const g = G(p, x, y, s, 'ec-hyd');
      el('path', { d: 'M0 0 Q-6 -40 4 -90', stroke: '#3f7f4a', 'stroke-width': 3, fill: 'none' }, g);
      for (let k = 1; k <= 8; k++) { const yy = -k * 11, xx = Math.sin(k) * 2; el('path', { d: `M${xx} ${yy} l-12 -4 M${xx} ${yy} l12 -4 M${xx} ${yy} l-8 6 M${xx} ${yy} l8 6`, stroke: '#4f9a52', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, g); }
      return g;
    },
    cabbage(p, x, y, s = 1) {
      const g = G(p, x, y, s, 'ec-cab');
      el('path', { class: 'ec-o', fill: '#8cc56a', d: 'M-30 0 Q-40 -30 -14 -40 Q0 -48 14 -40 Q40 -30 30 0 Z' }, g);
      el('path', { class: 'ec-o', fill: '#b9e08f', d: 'M-14 0 Q-20 -26 0 -34 Q20 -26 14 0 Z' }, g);
      el('path', { d: 'M0 -2 L0 -30', stroke: '#e9f5d6', 'stroke-width': 2.5 }, g);
      return g;
    },
    ant(p, x, y, s = 1) {
      const g = G(p, x, y, s, 'ec-ant');
      [[-10, 4], [0, 5], [10, 6]].forEach(([cx, r]) => el('circle', { cx, cy: -6, r, fill: '#3a2a22' }, g));
      el('path', { d: 'M-4 -6 l-6 6 M0 -6 l0 7 M4 -6 l6 6 M-4 -6 l-6 -6 M4 -6 l6 -6', stroke: '#3a2a22', 'stroke-width': 1.6 }, g);
      return g;
    },
    moss(p, x, y, s = 1) {
      const g = G(p, x, y, s, 'ec-moss');
      for (let i = -3; i <= 3; i++) el('path', { d: `M${i * 7} 0 l0 -10 l-3 -4 M${i * 7} -10 l3 -4`, stroke: '#5c9a3a', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, g);
      return g;
    },
    pillbug(p, x, y, s = 1) {
      const g = G(p, x, y, s, 'ec-pill');
      el('path', { class: 'ec-o', fill: '#6b6f78', d: 'M-16 0 Q-16 -14 0 -14 Q16 -14 16 0 Z' }, g);
      [-8, -2, 4, 10].forEach((dx) => el('path', { d: `M${dx} -13 l0 13`, stroke: '#4b4f58', 'stroke-width': 1.4 }, g));
      return g;
    },
  };

  window.Eco = { NS, el, pt, hold, ghosts, loop, clamp, lerp, reduce, keyStop, draw: D };
})();
