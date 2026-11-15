/* 1-1-3 장 모듈이 함께 쓰는 작은 도구(SVG 만들기·좌표·흔들기·안내 줄·고르기 단추).
   Kit.el(태그, 속성, 부모) · Kit.pt(svg, 사건) → viewBox 좌표 · Kit.rand(씨앗) → 늘 같은 난수
   Kit.hold(대상, { down(p,e), move(p,e), up(p,e) }, svg)  손가락·마우스 끌기(슬라이드 넘김을 막는다)
   Kit.single(단추들)  하나만 눌리는 고르기 · Kit.josa(낱말, '이가'|'을를'|'은는'|'와과') */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a = {}, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function pt(svg, e) { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(svg.getScreenCTM().inverse()); return { x: q.x, y: q.y }; }
  function rand(seed = 1) { let s = seed >>> 0 || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
  function hold(target, o, svg) {
    let id = null;
    target.addEventListener('pointerdown', (e) => {
      if (e.button) return;
      const p = pt(svg || target.ownerSVGElement || target, e);
      if (o.down && o.down(p, e) === false) return;
      id = e.pointerId; try { target.setPointerCapture(id); } catch { /* 합성 사건 */ }
      e.stopPropagation(); e.preventDefault();
    });
    target.addEventListener('pointermove', (e) => { if (id === null || e.pointerId !== id) { if (o.hover) o.hover(pt(svg || target.ownerSVGElement || target, e), e); return; } if (o.move) o.move(pt(svg || target.ownerSVGElement || target, e), e); });
    const end = (e) => { if (id === null || e.pointerId !== id) return; id = null; if (o.up) o.up(pt(svg || target.ownerSVGElement || target, e), e); };
    target.addEventListener('pointerup', end); target.addEventListener('pointercancel', end);
    return { get on() { return id !== null; } };
  }
  const single = (btns, cb) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
    if (cb) cb(on ? b : null);
  }));
  const jong = (w) => { const c = w.charCodeAt(w.length - 1); return c >= 0xac00 && c <= 0xd7a3 && (c - 0xac00) % 28 > 0; };
  const josa = (w, p) => w + (jong(w) ? p[0] : p[1]);
  const shake = (e) => { e.classList.remove('bd-bad'); void e.getBoundingClientRect(); e.classList.add('bd-bad'); };
  // 장이 보일 때만 도는 고리
  function ticker(step) {
    let raf = 0, last = 0, on = false;
    const tick = (t) => { if (!on) return; const dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016); last = t; step(dt); raf = requestAnimationFrame(tick); };
    return { start() { if (on) return; on = true; last = 0; raf = requestAnimationFrame(tick); }, stop() { on = false; cancelAnimationFrame(raf); }, get on() { return on; } };
  }
  // 키보드 ←→가 슬라이드를 넘기지 않게
  const keep = (e) => e.addEventListener('keydown', (ev) => ev.stopPropagation());
  // 개념 줄(data-anim="mrow")·예측 답 표시를 단계에 묶는다
  function answerOn(root, key, sel) {
    const set = (on) => root.querySelectorAll(sel).forEach((b) => b.classList.toggle('bd-answer', on));
    return {
      fragment(f, on) { if (f.dataset.anim === key) set(on); },
      sync(slide) { const f = slide.querySelector(`[data-anim="${key}"]`); set(!!f && f.classList.contains('visible')); },
    };
  }
  window.Kit = { NS, el, clamp, pt, rand, hold, single, josa, shake, ticker, keep, answerOn, reduce: window.matchMedia('(prefers-reduced-motion: reduce)').matches };
})();
