/* 1-1-2 생물의 진화 · 장 모듈이 함께 쓰는 작은 도구(단원 전용).
   EvKit.el(태그, 속성, 부모)  SVG 요소 · EvKit.svgPt(svg, e)  화면 → SVG 좌표 · EvKit.cvPt(cv, e)  화면 → 캔버스(슬라이드) 좌표
   EvKit.hold(요소, {down, move, up}, toPt)  누르고 끌기(손가락·마우스, 슬라이드 넘김 막기)
   EvKit.rng(씨앗)  되풀이되는 난수 · EvKit.pickW(가중치)  가중치대로 하나 고르기 · EvKit.lab(rgb)  색 차이 계산용 Lab
   EvKit.ticker(step)  장이 보일 때만 도는 고리(dt 초) · EvKit.keep(입력)  ←→ 키가 슬라이드를 넘기지 않게 */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a = {}, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, u) => a + (b - a) * u;
  function svgPt(svg, e) {
    const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    const m = svg.getScreenCTM(); if (!m) return { x: 0, y: 0 };
    const q = p.matrixTransform(m.inverse()); return { x: q.x, y: q.y };
  }
  function cvPt(cv, e) {
    const r = cv.getBoundingClientRect();
    return { x: (e.clientX - r.left) / (r.width || 1) * cv.clientWidth, y: (e.clientY - r.top) / (r.height || 1) * cv.clientHeight };
  }
  // 누르고 끌기: down(p, e)이 false를 돌려주면 이번 누름은 무시한다
  function hold(target, o, toPt) {
    let on = false, id = null;
    target.addEventListener('pointerdown', (e) => {
      if (e.button) return;
      const p = toPt(e);
      if (o.down && o.down(p, e) === false) return;
      on = true; id = e.pointerId;
      try { target.setPointerCapture(id); } catch (err) { /* 무시 */ }
      e.stopPropagation(); e.preventDefault();
    });
    target.addEventListener('pointermove', (e) => { if (on && e.pointerId === id && o.move) o.move(toPt(e), e); });
    const end = (e) => { if (!on || e.pointerId !== id) return; on = false; if (o.up) o.up(toPt(e), e); };
    target.addEventListener('pointerup', end);
    target.addEventListener('pointercancel', end);
    return { get on() { return on; } };
  }
  function rng(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function pickW(ws, r = Math.random) {
    const s = ws.reduce((a, b) => a + b, 0); let u = r() * s;
    for (let i = 0; i < ws.length; i++) { u -= ws[i]; if (u <= 0) return i; }
    return ws.length - 1;
  }
  // sRGB(0~255) → CIE Lab: 배경과 얼마나 다르게 보이는지 견줄 때 쓴다
  function lab([r, g, b]) {
    const f = (c) => { c /= 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    const R = f(r), G = f(g), B = f(b);
    const X = (R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047, Y = R * 0.2126 + G * 0.7152 + B * 0.0722, Z = (R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883;
    const h = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    return [116 * h(Y) - 16, 500 * (h(X) - h(Y)), 200 * (h(Y) - h(Z))];
  }
  const dE = (a, b) => { const A = lab(a), B = lab(b); return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]); };
  const hex = (c) => '#' + c.map((v) => Math.round(clamp(v, 0, 255)).toString(16).padStart(2, '0')).join('');
  const mix = (a, b, u) => a.map((v, i) => lerp(v, b[i], u));
  function ticker(step) {
    let raf = 0, last = 0, on = false;
    const tick = (t) => { if (!on) return; const dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016); last = t; step(dt); raf = requestAnimationFrame(tick); };
    return { start() { if (on) return; on = true; last = 0; raf = requestAnimationFrame(tick); }, stop() { on = false; cancelAnimationFrame(raf); }, get on() { return on; } };
  }
  const keep = (inp) => inp.addEventListener('keydown', (e) => e.stopPropagation());
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  // 캔버스를 화면 크기에 맞춘다(엔진 Stage.fit과 같음, 슬라이드 좌표)
  function fit(cv) {
    const w = cv.clientWidth || 1, h = cv.clientHeight || 1;
    const s = Math.min(2, (window.devicePixelRatio || 1) * (window.Reveal && Reveal.getScale ? Reveal.getScale() : 1)) || 1;
    cv.width = Math.round(w * s); cv.height = Math.round(h * s);
    const ctx = cv.getContext('2d'); ctx.setTransform(s, 0, 0, s, 0, 0);
    return { ctx, w, h };
  }
  // 한 개 고르기 단추 묶음(응답 모으기용 .share-opts)
  function single(btns) {
    btns.forEach((b) => b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') !== 'true';
      btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
    }));
  }
  window.EvKit = { NS, el, clamp, lerp, svgPt, cvPt, hold, rng, pickW, lab, dE, hex, mix, ticker, keep, reduce, fit, single };
})();
