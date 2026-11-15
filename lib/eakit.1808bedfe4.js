/* 1-2-3 장 모듈이 함께 쓰는 도구(단원 전용). SVG 만들기, 손가락 좌표 → SVG 좌표, 막대 온도계, 온도 색, 끌기.
   EA.drag(요소, svg, { start(p, e) → false면 무시, move(p, e), end(p, e) })  p는 SVG 사용자 좌표 */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function el(tag, a, p) {
    const e = document.createElementNS(NS, tag);
    if (a) for (const [k, v] of Object.entries(a)) { if (k === 'text') e.textContent = v; else e.setAttribute(k, v); }
    if (p) p.appendChild(e);
    return e;
  }
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  function pt(svg, e) {
    const m = svg.getScreenCTM(); if (!m) return { x: 0, y: 0 };
    const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    const q = p.matrixTransform(m.inverse()); return { x: q.x, y: q.y };
  }
  function drag(target, svg, h) {
    let id = null;
    target.addEventListener('pointerdown', (e) => {
      if (e.button) return;
      if (h.start && h.start(pt(svg, e), e) === false) return;
      id = e.pointerId; try { target.setPointerCapture(id); } catch (err) { /* 무시 */ }
      e.preventDefault(); e.stopPropagation();
    });
    target.addEventListener('pointermove', (e) => { if (id !== e.pointerId) return; if (h.move) h.move(pt(svg, e), e); });
    const end = (e) => { if (id !== e.pointerId) return; id = null; if (h.end) h.end(pt(svg, e), e); };
    target.addEventListener('pointerup', end);
    target.addEventListener('pointercancel', end);
  }
  // 차가움(파랑) → 보통(종이색) → 뜨거움(빨강)
  function tcol(t, lo = 0, mid = 20, hi = 60) {
    const c = t < mid ? [[42, 143, 184], [233, 238, 236], clamp((t - lo) / (mid - lo), 0, 1)] : [[233, 238, 236], [226, 74, 43], clamp((t - mid) / (hi - mid), 0, 1)];
    const [a, b, k] = c;
    return `rgb(${a.map((v, i) => Math.round(lerp(v, b[i], k))).join(',')})`;
  }
  // 막대 온도계: (x, y)는 둥근 끝 가운데, h는 관 길이
  function thermo(parent, { x, y, h = 160, lo = 0, hi = 100, w = 16, label = true, cls = '', left = false }) {
    const g = el('g', { class: 'ea-th ' + cls }, parent);
    el('rect', { class: 'ea-th-tube', x: x - w / 2, y: y - h, width: w, height: h + 4, rx: w / 2 }, g);
    const liq = el('rect', { class: 'ea-th-liq', x: x - w / 2 + 4, width: w - 8, rx: (w - 8) / 2 }, g);
    el('circle', { class: 'ea-th-bulb', cx: x, cy: y + w * 0.55, r: w * 0.95 }, g);
    for (let i = 0; i <= 4; i++) el('line', { class: 'ea-th-tick', x1: x + w / 2, x2: x + w / 2 + 8, y1: y - 10 - (h - 20) * i / 4, y2: y - 10 - (h - 20) * i / 4 }, g);
    const txt = label ? el('text', { class: 'ea-th-t', x: left ? x - w / 2 - 12 : x + w / 2 + 14, y: y + 8, 'text-anchor': left ? 'end' : 'start' }, g) : null;
    let v = lo;
    const set = (t, fmt) => {
      v = t; const k = clamp((t - lo) / (hi - lo), 0, 1), top = y - 10 - (h - 20) * k;
      liq.setAttribute('y', top.toFixed(1)); liq.setAttribute('height', (y + 4 - top).toFixed(1));
      if (txt) { txt.textContent = fmt ? fmt(t) : `${Math.round(t)} °C`; txt.setAttribute('y', (top + 8).toFixed(1)); }
    };
    set(lo);
    return { g, set, get v() { return v; } };
  }
  // 슬라이드 넘김 키가 조작 키를 가로채지 않게
  const keep = (n) => n.addEventListener('keydown', (e) => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Enter', 'Home', 'End'].includes(e.key)) e.stopPropagation(); });
  // 한 번에 하나만 누르는 보기(.share-opts)
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  window.EA = { NS, el, clamp, lerp, pt, drag, tcol, thermo, keep, single, reduce };
})();
