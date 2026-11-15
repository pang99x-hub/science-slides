/* 3차시 표지: 높은 산맥을 확대해 들어가면 꼭대기 바위의 지층 속에 바다 생물 화석(암모나이트·조개)이 박혀 있다.
   막대·바퀴·두 손가락 벌리기로 확대한다(1배 ~ 60배). 산 모양·화석 크기는 그림으로 만든 것. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ZMAX = 60, F = [612, 120];

  function scene(svg) {
    const defs = el('defs', {}, svg);
    const g1 = el('linearGradient', { id: 'zm-sky', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    el('stop', { offset: 0, 'stop-color': '#9cc9ec' }, g1); el('stop', { offset: 1, 'stop-color': '#e6f1f8' }, g1);
    el('clipPath', { id: 'zm-rockclip' }, defs).appendChild(el('path', { d: rockPath() }));
    el('rect', { x: -2000, y: -2000, width: 5000, height: 5000, fill: 'url(#zm-sky)' }, svg);
    const w = el('g', { class: 'zm-world' }, svg);
    // 먼 산
    el('path', { class: 'zm-far', d: 'M-200 420 L 80 230 L 190 300 L 330 190 L 450 290 L 520 250 L 700 330 L 820 210 L 960 300 L 1200 260 L 1200 600 L -200 600 Z' }, w);
    // 큰 산
    el('path', { class: 'zm-mt', d: 'M90 560 L 330 300 L 420 340 L 540 170 L 612 112 L 690 180 L 760 240 L 860 200 L 1010 380 L 1100 560 Z' }, w);
    el('path', { class: 'zm-shade', d: 'M612 112 L 690 180 L 760 240 L 700 560 L 600 560 L 640 300 Z' }, w);
    el('path', { class: 'zm-snow', d: 'M540 170 L 612 112 L 690 180 L 660 196 L 640 178 L 618 204 L 596 182 L 570 200 Z' }, w);
    el('path', { class: 'zm-snow', d: 'M330 300 L 420 340 L 392 346 L 366 330 L 344 344 Z' }, w);
    el('path', { class: 'zm-snow', d: 'M860 200 L 920 270 L 894 262 L 872 276 L 852 252 Z' }, w);
    // 아래 숲·구름
    for (let i = 0; i < 26; i++) { const x = 60 + i * 40 + (i % 3) * 7, y = 540 - (i % 4) * 6; el('path', { class: 'zm-tree', d: `M${x} ${y} l 12 -30 l 12 30 z` }, w); }
    [[180, 120, 1], [820, 90, 0.8], [420, 230, 0.7]].forEach(([x, y, s]) => el('path', { class: 'zm-cloud', d: `M${x} ${y} a ${24 * s} ${18 * s} 0 0 1 ${46 * s} -6 a ${20 * s} ${16 * s} 0 0 1 ${36 * s} 8 a ${14 * s} ${12 * s} 0 0 1 0 ${22 * s} h ${-82 * s} a ${12 * s} ${11 * s} 0 0 1 0 ${-24 * s} z` }, w));
    // 꼭대기 바위(드러난 지층)
    const rock = el('g', { class: 'zm-rock' }, w);
    el('path', { class: 'zm-rockbg', d: rockPath() }, rock);
    const bands = el('g', { 'clip-path': 'url(#zm-rockclip)' }, rock);
    const COL = ['#c9b79a', '#b39c7c', '#d8c8a8', '#a88f70', '#c2ad8c', '#9e8668'];
    for (let i = 0; i < 6; i++) {
      const y = F[1] - 9 + i * 4.2;
      el('path', { class: 'zm-band', fill: COL[i], d: `M${F[0] - 40} ${y} q 20 ${-3.2} 40 0 t 40 0 v 4.4 q -20 3.2 -40 0 t -40 0 z` }, bands);
    }
    // 바다에서 쌓인 층 표시(모래알)
    const grains = el('g', { class: 'zm-grains' }, bands);
    for (let i = 0; i < 260; i++) { const x = F[0] - 38 + ((i * 37) % 76) + ((i * 13) % 7) * 0.13, y = F[1] - 9 + ((i * 53) % 250) / 10; el('circle', { cx: x.toFixed(2), cy: y.toFixed(2), r: 0.12 + (i % 3) * 0.05 }, grains); }
    // 화석: 암모나이트·조개(바다 생물)
    const fos = el('g', { class: 'zm-fossils' }, bands);
    const amm = (x, y, r) => {
      const g = el('g', { class: 'zm-amm', transform: `translate(${x} ${y})` }, fos);
      let d = ''; for (let a = 0; a <= Math.PI * 6; a += 0.2) { const rr = r * Math.exp(-0.17 * (Math.PI * 6 - a)); d += (a ? 'L' : 'M') + (rr * Math.cos(a)).toFixed(3) + ' ' + (rr * Math.sin(a)).toFixed(3); }
      el('circle', { r: r * 1.04, class: 'zm-ammb' }, g); el('path', { d }, g);
      for (let k = 0; k < 14; k++) { const a = k / 14 * Math.PI * 2; el('path', { class: 'zm-rib', d: `M${(r * 0.55 * Math.cos(a)).toFixed(3)} ${(r * 0.55 * Math.sin(a)).toFixed(3)} L ${(r * Math.cos(a)).toFixed(3)} ${(r * Math.sin(a)).toFixed(3)}` }, g); }
      return g;
    };
    const clam = (x, y, s, rot) => {
      const g = el('g', { class: 'zm-clam', transform: `translate(${x} ${y}) rotate(${rot}) scale(${s})` }, fos);
      el('path', { d: 'M-1 0.6 C -1 -0.6, 1 -0.6, 1 0.6 Z' }, g);
      for (let k = -3; k <= 3; k++) el('path', { class: 'zm-rib', d: `M0 0.6 L ${(k * 0.28).toFixed(2)} -0.25` }, g);
      return g;
    };
    amm(F[0] - 2, F[1] + 0.6, 1.5); amm(F[0] + 9, F[1] - 4.2, 0.9); amm(F[0] - 15, F[1] + 5, 1.1);
    clam(F[0] + 5, F[1] + 4.6, 0.9, -12); clam(F[0] - 9, F[1] - 3.6, 0.7, 18); clam(F[0] + 16, F[1] + 1.2, 0.8, 6); clam(F[0] - 22, F[1] - 1, 0.6, -20);
    // 등산객(크기 비교)
    const hk = el('g', { class: 'zm-hiker', transform: `translate(${F[0] + 26} ${F[1] - 9})` }, w);
    el('circle', { cx: 0, cy: -4.2, r: 0.9 }, hk); el('path', { d: 'M0 -3.3 V -0.6 M0 -0.6 l -0.9 2 M0 -0.6 l 0.9 2 M -1 -2.6 l 1 0.6 l 1 -0.8' }, hk);
    el('path', { class: 'zm-flag', d: 'M1.4 -2 V -7 l 2.4 0.8 l -2.4 0.8' }, hk);
    // 이름표(확대 단계마다)
    const L = (x, y, size, txt, cls) => { const t = el('text', { x, y, 'font-size': size, class: 'zm-t ' + (cls || '') }, w); t.textContent = txt; return t; };
    const lab = {
      top: L(F[0], F[1] - 20, 15, '꼭대기 바위', 'mid'),
      band: L(F[0], F[1] - 12.5, 2.2, '줄무늬처럼 쌓인 층(지층)', 'mid'),
      a: L(F[0] - 2, F[1] + 3.5, 0.62, '암모나이트', 'mid'), c: L(F[0] + 5, F[1] + 6.3, 0.48, '조개', 'mid'), a2: L(F[0] + 9, F[1] - 2.7, 0.42, '암모나이트', 'mid'),
    };
    return { w, fos, lab, grains };
  }
  function rockPath() { return `M${F[0] - 34} ${F[1] + 16} L ${F[0] - 38} ${F[1] - 4} L ${F[0] - 24} ${F[1] - 10} L ${F[0] - 6} ${F[1] - 9} L ${F[0] + 14} ${F[1] - 11} L ${F[0] + 34} ${F[1] - 6} L ${F[0] + 38} ${F[1] + 14} Z`; }

  function mount(root) {
    const stage = root.querySelector('.zm-stage'), svg = root.querySelector('.zm-svg'), range = root.querySelector('#zm-z');
    const zv = root.querySelector('.zm-zv'), now = root.querySelector('.zm-now'), scale = root.querySelector('.zm-scale');
    const S = scene(svg);
    let v = 0;
    const fade = (e, a, b, c, d, z) => { const o = Math.min(clamp((z - a) / (b - a), 0, 1), 1 - clamp((z - c) / (d - c), 0, 1)); e.style.opacity = o.toFixed(3); };
    function set(nv) {
      v = clamp(nv, 0, 100); range.value = String(Math.round(v));
      const z = Math.pow(ZMAX, v / 100), k = Math.pow(clamp((z - 1) / 5, 0, 1), 0.7);
      const cx = 500 + (F[0] - 500) * k, cy = 280 + (F[1] + 2 - 280) * k;
      S.w.setAttribute('transform', `translate(500 280) scale(${z.toFixed(4)}) translate(${(-cx).toFixed(3)} ${(-cy).toFixed(3)})`);
      fade(S.lab.top, 1.4, 2.2, 5, 8, z); fade(S.lab.band, 5, 8, 18, 26, z);
      [S.lab.a, S.lab.c, S.lab.a2].forEach((t) => fade(t, 26, 36, 999, 1000, z));
      S.fos.style.opacity = clamp((z - 8) / 10, 0, 1).toFixed(3);
      S.grains.style.opacity = clamp((z - 10) / 15, 0, 0.8).toFixed(3);
      const stg = z < 2 ? 0 : z < 7 ? 1 : z < 24 ? 2 : 3;
      const name = ['산 전체', '꼭대기 바위', '바위 속 지층', '바다 생물 화석!'][stg];
      zv.textContent = name; scale.textContent = `${Math.round(z)}배`;
      now.textContent = ['막대를 밀어 꼭대기로 다가가 보자', '꼭대기 바위에 줄무늬가 있다 — 더 다가가자', '지층 속에 무늬가 보인다 — 더!', '바다에 살던 생물의 화석이 산꼭대기에!'][stg];
      now.classList.toggle('done', stg === 3);
    }
    range.addEventListener('input', () => set(Number(range.value)));
    range.addEventListener('keydown', (e) => e.stopPropagation());
    stage.addEventListener('wheel', (e) => { e.preventDefault(); set(v - Math.sign(e.deltaY) * 4); }, { passive: false });
    stage.addEventListener('keydown', (e) => { const d = { ArrowUp: 5, ArrowDown: -5, '+': 5, '=': 5, '-': -5 }[e.key]; if (d) { e.preventDefault(); e.stopPropagation(); set(v + d); } });
    // 두 손가락 벌리기
    const pts = new Map(); let d0 = 0, v0 = 0;
    const gap = () => { const [a, b] = [...pts.values()]; return Math.hypot(a.x - b.x, a.y - b.y); };
    stage.addEventListener('pointerdown', (e) => { pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pts.size === 2) { d0 = gap(); v0 = v; } });
    stage.addEventListener('pointermove', (e) => { if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); if (pts.size === 2 && d0 > 0) set(v0 + 34 * Math.log2(gap() / d0)); });
    const up = (e) => { pts.delete(e.pointerId); d0 = 0; };
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
    set(0);
    root._zm = { z: set };
    return {};
  }

  window.ZoomHill = { mount };
})();
