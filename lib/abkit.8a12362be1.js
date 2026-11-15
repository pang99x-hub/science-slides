/* 1-2-2 산과 염기 — 장 모듈이 함께 쓰는 도우미(단원 전용). 엔진 이름과 겹치지 않게 window.AB에 둔다.
   AB.el(태그, 속성, 부모)  SVG 요소 · AB.pt(svg, 사건)  화면 → SVG 좌표(슬라이드 배율과 무관)
   AB.grab(요소, svg, { start(p,e)→false면 취소, move(p,e), end(p,e) })  손가락·마우스 끌기(슬라이드 넘김을 막는다)
   AB.loop(step)  장이 보일 때만 도는 고리 · AB.ind(지시약, 액성)  지시약 색 · AB.chem(텍스트, 'H_2SO_4')  아래·위 첨자
   AB.ion(부모, 종류, x, y)  교과서 그림 Ⅰ-26·27과 같은 색의 이온 모형 · AB.mix(색1, 색2, u)  색 섞기 */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function el(tag, a, p) {
    const e = document.createElementNS(NS, tag);
    if (a) for (const k in a) { if (k === 'text') e.textContent = a[k]; else if (a[k] != null) e.setAttribute(k, a[k]); }
    if (p) p.appendChild(e);
    return e;
  }
  function pt(svg, e) {
    const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    return p.matrixTransform(svg.getScreenCTM().inverse());
  }
  function grab(node, svg, h) {
    node.style.touchAction = 'none';
    node.addEventListener('pointerdown', (e) => {
      if (e.button) return;
      const p0 = pt(svg, e);
      if (h.start && h.start(p0, e) === false) return;
      e.preventDefault(); e.stopPropagation();
      try { node.setPointerCapture(e.pointerId); } catch (err) { /* 붙잡기 실패해도 움직임은 받는다 */ }
      const mv = (ev) => { ev.stopPropagation(); if (h.move) h.move(pt(svg, ev), ev); };
      const up = (ev) => {
        node.removeEventListener('pointermove', mv); node.removeEventListener('pointerup', up); node.removeEventListener('pointercancel', up);
        if (h.end) h.end(pt(svg, ev), ev);
      };
      node.addEventListener('pointermove', mv); node.addEventListener('pointerup', up); node.addEventListener('pointercancel', up);
    });
  }
  function loop(step) {
    let raf = 0, on = false, last = 0;
    const tick = (t) => { if (!on) return; const dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016); last = t; step(dt); raf = requestAnimationFrame(tick); };
    return {
      start() { if (on) return; on = true; last = 0; raf = requestAnimationFrame(tick); },
      stop() { on = false; cancelAnimationFrame(raf); },
      get on() { return on; },
    };
  }
  // 색: 리트머스(푸른·붉은), BTB(노랑·초록·파랑), 페놀프탈레인(염기에서만 붉은색)
  const C = { litB: '#5c86cf', litR: '#d95560', btbA: '#ecc51e', btbN: '#3fa65c', btbB: '#2c62c6', pp: '#e2457f', clear: '#dcecf5' };
  function ind(tool, kind) {
    if (tool === 'btb') return kind === 'a' ? C.btbA : kind === 'b' ? C.btbB : C.btbN;
    if (tool === 'pp') return kind === 'b' ? C.pp : null;
    if (tool === 'blue') return kind === 'a' ? C.litR : C.litB;
    if (tool === 'red') return kind === 'b' ? C.litB : C.litR;
    return null;
  }
  const hex = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16));
  function mix(a, b, u) {
    const x = hex(a), y = hex(b); u = clamp(u, 0, 1);
    return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * u).toString(16).padStart(2, '0')).join('');
  }
  // 'H_2SO_4^2-' 처럼: _숫자는 아래 첨자, ^숫자±는 위 첨자
  const parts = (s) => { const out = []; const re = /_(\d+)|\^(\d*[+\-−])|([^_^]+)/g; let m; while ((m = re.exec(s))) out.push(m[1] ? ['sub', m[1]] : m[2] ? ['sup', m[2].replace('-', '−')] : ['n', m[3]]); return out; };
  function chem(t, s) {
    t.textContent = '';
    let shift = 0;
    for (const [k, v] of parts(s)) {
      const want = k === 'sub' ? 0.32 : k === 'sup' ? -0.42 : 0;
      const sp = el('tspan', { dy: (want - shift).toFixed(2) + 'em', 'font-size': k === 'n' ? null : '68%', text: v }, t);
      // 글자 크기를 줄인 tspan의 dy는 그 글자 크기 기준이라 em을 맞춘다
      if (k !== 'n') sp.setAttribute('dy', ((want - shift) / 0.68).toFixed(2) + 'em');
      shift = want;
    }
    if (shift) el('tspan', { dy: (-shift).toFixed(2) + 'em', text: '​' }, t);
    return t;
  }
  const chemHTML = (s) => parts(s).map(([k, v]) => k === 'sub' ? `<sub>${v}</sub>` : k === 'sup' ? `<sup>${v}</sup>` : v).join('');
  // 이온 모형(교과서 그림 색: H⁺ 흰 회색 작은 공, Cl⁻ 초록, Na⁺ 노랑, OH⁻ 주황, H₂O 하늘색)
  const ION = {
    H: { f: '#eef0f2', r: 13, t: 'H^+' }, Cl: { f: '#46a35a', r: 22, t: 'Cl^-', w: 1 }, Na: { f: '#f2cf3c', r: 18, t: 'Na^+' },
    OH: { f: '#ec8a3a', r: 20, t: 'OH^-' }, W: { f: '#7fc3ea', r: 19, t: 'H_2O' }, K: { f: '#b58ad6', r: 21, t: 'K^+' },
    Ca: { f: '#c9d3dc', r: 21, t: 'Ca^2+' }, SO4: { f: '#d9d26a', r: 25, t: 'SO_4^2-' }, CO3: { f: '#9fb3c6', r: 24, t: 'CO_3^2-' },
    AC: { f: '#a8b9a4', r: 27, t: 'CH_3COO^-' }, NH4: { f: '#9ed0c4', r: 22, t: 'NH_4^+' },
  };
  function ion(p, kind, x, y, k = 1) {
    const d = ION[kind], g = el('g', { class: 'ab-ion ab-ion-' + kind, transform: `translate(${x} ${y})` }, p);
    el('circle', { r: d.r * k, fill: d.f }, g);
    const t = el('text', { class: 'ab-ion-t' + (d.w ? ' w' : ''), y: 5 * k, 'font-size': (kind === 'AC' ? 11 : kind === 'H' ? 13 : 14) * k }, g);
    chem(t, d.t);
    return g;
  }
  // 슬라이드 넘김 키(←→·스페이스)가 입력 칸에서 새지 않게
  const keyStop = (n) => n.addEventListener('keydown', (e) => e.stopPropagation());
  // 여러 장이 함께 보는 값(3차시 실험 → 그래프)
  const state = {};
  // 3차시 탐구 값(교과서 51쪽 예시 답안): 혼합 전 24.5 °C, 전체 12 mL에서 HCl 2·4·6·8·10 mL일 때의 최고 온도와 BTB 색.
  // 교과서에 없는 조합은 모형 값: 오른 온도 = 4.0 °C × (반응한 쪽 부피 ÷ 6 mL) — 교과서 다섯 값과 0.1 °C 안에서 맞는다.
  const BOOK = { 2: 25.9, 4: 27.2, 6: 28.5, 8: 27.1, 10: 25.8 };
  const MIX = {
    T0: 24.5, BOOK, WELLS: ['가', '나', '다', '라', '마'],
    kind: (a, b) => (a > b ? 'a' : a < b ? 'b' : 'n'),
    temp(a, b) {
      if (a + b === 12 && BOOK[a] != null) return { T: BOOK[a], src: 'book' };
      if (!a || !b) return { T: 24.5, src: a + b === 12 ? 'book' : 'model' };
      return { T: Math.round((24.5 + 4.0 * Math.min(a, b) / 6 * (12 / (a + b))) * 10) / 10, src: 'model' };
    },
  };
  window.AB = { MIX, el, pt, grab, loop, ind, mix, chem, chemHTML, ion, ION, C, clamp, keyStop, reduce, state };
})();
