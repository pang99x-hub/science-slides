/* 1차시 표지: 완도 그림 위의 돋보기(교과서 26쪽 그림 Ⅰ-15).
   돋보기를 끌어 바다·갯벌·숲 위에 놓고 가만히 두면 한 단계씩 깊이 보인다: 생태계 → 그곳의 여러 종 → 한 종의 여러 개체(무늬가 다름).
   많이 옮기면 처음 단계로 돌아간다. 생물 이름은 교과서(흑난초·완도허리노린재)와 그 지역에 흔한 생물. */
(function () {
  'use strict';
  const { el, clamp, hold, rand } = window.Kit;
  const W = 660, H = 380, R = 92;
  const ZONES = {
    sea: { name: '바다', eco: '바다 생태계', sp: ['미역', '전복', '돔', '불가사리'], one: '전복' },
    flat: { name: '갯벌', eco: '갯벌 생태계', sp: ['칠게', '갯지렁이', '바지락', '짱뚱어'], one: '바지락' },
    forest: { name: '숲', eco: '숲 생태계', sp: ['흑난초', '완도허리노린재', '동백나무', '박새'], one: '완도허리노린재' },
  };
  const LV = ['', '생태계', '여러 종', '한 종의 여러 개체'];
  const hillTop = (x) => (x < 480 ? 250 - (x - 300) / 180 * 178 : 72 + (x - 480) / 180 * 78);
  const zoneAt = (x, y) => (x > 305 && y < 246 && y > hillTop(x) ? 'forest' : y > 248 ? 'flat' : y > 150 ? 'sea' : 'sky');

  // 생물 그림(가운데 0,0, 크기 약 40)
  function draw(p, kind, x, y, s = 1, v = 0) {
    const g = el('g', { transform: `translate(${x} ${y}) scale(${s})`, class: 'ln-org' }, p);
    const hue = ['#c0392b', '#d68a1f', '#6b8e23', '#2c6e9b', '#7d4cc4', '#3a3a3a'][v % 6];
    switch (kind) {
      case '미역': for (let i = -1; i <= 1; i++) el('path', { d: `M${i * 10} 26 q ${8 + i * 2} -18 ${-2} -30 t ${4} -24`, class: 'ln-weed' }, g); break;
      case '전복': el('ellipse', { rx: 26, ry: 18, fill: ['#8a6b5a', '#5e7f6e', '#9b7d4f', '#6d5f86', '#7f8f5b', '#a0675e'][v % 6], class: 'ln-ln' }, g); for (let i = 0; i < 4; i++) el('circle', { cx: -14 + i * 9, cy: -8 + i, r: 2.6, class: 'ln-dot' }, g); el('path', { d: 'M-18 6 q 18 10 36 -2', class: 'ln-thin' }, g); break;
      case '돔': el('path', { d: 'M-26 0 q 20 -20 44 0 q -24 20 -44 0 z', fill: '#6d8fb3', class: 'ln-ln' }, g); el('path', { d: 'M18 0 l 12 -10 v 20 z', fill: '#6d8fb3', class: 'ln-ln' }, g); el('circle', { cx: -16, cy: -3, r: 2.5, class: 'ln-dot' }, g); break;
      case '불가사리': el('path', { d: 'M0 -24 L6 -7 L23 -7 L9 4 L14 21 L0 11 L-14 21 L-9 4 L-23 -7 L-6 -7 Z', fill: '#e07a3f', class: 'ln-ln' }, g); break;
      case '칠게': el('ellipse', { rx: 20, ry: 13, fill: '#7c6a4f', class: 'ln-ln' }, g); el('path', { d: 'M-20 -4 l -10 -10 M20 -4 l 10 -10 M-14 10 l -8 8 M14 10 l 8 8 M-6 12 l -4 9 M6 12 l 4 9', class: 'ln-thin' }, g); el('circle', { cx: -6, cy: -14, r: 3, class: 'ln-dot' }, g); el('circle', { cx: 6, cy: -14, r: 3, class: 'ln-dot' }, g); break;
      case '갯지렁이': el('path', { d: 'M-26 6 q 8 -14 16 0 t 16 0 t 16 0', class: 'ln-worm' }, g); break;
      case '바지락': {
        const c = ['#c9b18a', '#8b7a6a', '#d8c6a0', '#a08a6a', '#bfa06e', '#6f6a63'][v % 6];
        el('path', { d: 'M-24 10 q 0 -30 24 -30 q 24 0 24 30 q -24 8 -48 0 z', fill: c, class: 'ln-ln' }, g);
        const r = rand(v + 3);
        for (let i = 0; i < 5; i++) el('path', { d: `M${-18 + i * 9} ${8} q ${2 - r() * 4} -16 ${2} -24`, stroke: hue, class: 'ln-stripe', opacity: (0.25 + 0.7 * r()).toFixed(2) }, g);
        if (v % 2) el('path', { d: 'M-20 0 l 40 -8', stroke: '#3a3a3a', class: 'ln-stripe' }, g);
        break;
      }
      case '짱뚱어': el('path', { d: 'M-24 4 q 18 -18 40 -4 q -18 14 -40 4 z', fill: '#8e8a6a', class: 'ln-ln' }, g); el('circle', { cx: -14, cy: -6, r: 4, fill: '#fff', class: 'ln-ln' }, g); el('path', { d: 'M16 0 l 12 -8 v 14 z', fill: '#8e8a6a', class: 'ln-ln' }, g); break;
      case '흑난초': el('path', { d: 'M0 26 v -30', class: 'ln-stem' }, g); el('path', { d: 'M0 10 q -18 -2 -22 -14 M0 14 q 18 -2 22 -14', class: 'ln-leaf' }, g); for (let i = 0; i < 3; i++) el('circle', { cx: -6 + i * 6, cy: -10 - i * 7, r: 5, fill: '#4a2f3a', class: 'ln-ln' }, g); break;
      case '완도허리노린재': {
        const c = ['#7a8f3a', '#9b6a2f', '#5d7a4f', '#8a5a3a', '#6b6b2f', '#4f6a5a'][v % 6];
        el('path', { d: 'M-8 -14 l -10 -10 M8 -14 l 10 -10 M-12 0 l -16 -2 M12 0 l 16 -2 M-12 10 l -14 10 M12 10 l 14 10', class: 'ln-thin' }, g);
        el('path', { d: 'M-14 -10 q 14 -10 28 0 l 4 16 q -18 22 -36 0 z', fill: c, class: 'ln-ln' }, g);
        el('path', { d: 'M-12 -8 q 12 6 24 0', stroke: hue, class: 'ln-stripe' }, g);
        const r = rand(v + 11); for (let i = 0; i < 2 + (v % 3); i++) el('circle', { cx: (-8 + r() * 16).toFixed(1), cy: (0 + r() * 12).toFixed(1), r: 2.6, fill: v % 2 ? '#f1e3a0' : '#2c2c2c' }, g);
        el('circle', { cy: -16, r: 5, fill: '#3a3a2a' }, g);
        break;
      }
      case '동백나무': el('path', { d: 'M0 26 v -16', class: 'ln-stem' }, g); el('circle', { cy: -6, r: 20, fill: '#3e6b3e', class: 'ln-ln' }, g); for (const [a, b] of [[-8, -10], [8, -2], [0, 6]]) el('circle', { cx: a, cy: b, r: 5, fill: '#d23b4a' }, g); break;
      case '박새': el('ellipse', { rx: 18, ry: 12, fill: '#e7e2cf', class: 'ln-ln' }, g); el('circle', { cx: -14, cy: -10, r: 9, fill: '#2c2c2c' }, g); el('circle', { cx: -16, cy: -11, r: 3, fill: '#fff' }, g); el('path', { d: 'M16 -2 l 14 -6 v 10 z', fill: '#5d6b7a', class: 'ln-ln' }, g); el('path', { d: 'M-8 -2 v 12', stroke: '#2c2c2c', 'stroke-width': 4 }, g); break;
    }
    return g;
  }

  function mount(root) {
    const svg = root.querySelector('.ln-svg'), now = root.querySelector('.ln-now'), read = root.querySelector('.ln-read');
    const defs = el('defs', {}, svg);
    const clip = el('clipPath', { id: 'ln-clip' }, defs); const clipC = el('circle', { r: R - 4 }, clip);
    // 섬 그림: 하늘 · 바다 · 갯벌 · 숲이 덮인 산
    const land = el('g', { class: 'ln-land' }, svg);
    el('rect', { class: 'ln-sky', width: W, height: H }, land);
    el('path', { class: 'ln-sea', d: `M0 150 H${W} V${H} H0 Z` }, land);
    el('path', { class: 'ln-flat', d: `M250 ${H} C 260 300 300 250 360 240 C 430 230 520 250 ${W} 238 V${H} Z M0 260 C 70 250 160 240 250 250 C 220 300 210 340 230 ${H} H0 Z` }, land);
    el('path', { class: 'ln-hill', d: `M300 ${250} C 360 120 420 70 480 72 C 560 76 610 140 ${W} 150 V 250 C 560 250 430 232 300 250 Z` }, land);
    const r0 = rand(7);
    for (let i = 0; i < 60; i++) { const x = 330 + r0() * 320, y = 80 + r0() * 160; if (y < hillTop(x) + 14 || y > 236) continue; el('circle', { class: 'ln-tree', cx: x.toFixed(0), cy: y.toFixed(0), r: (9 + r0() * 7).toFixed(1) }, land); }
    for (let i = 0; i < 9; i++) el('path', { class: 'ln-wave', d: `M${20 + (i % 3) * 70 + (i > 5 ? 20 : 0)} ${175 + Math.floor(i / 3) * 26} q 10 -6 20 0 t 20 0` }, land);
    for (let i = 0; i < 14; i++) el('circle', { class: 'ln-mud', cx: (60 + r0() * 520).toFixed(0), cy: (268 + r0() * 100).toFixed(0), r: 2.5 }, land);
    el('text', { class: 'ln-tag', x: 120, y: 214 }, land).textContent = '바다';
    el('text', { class: 'ln-tag', x: 150, y: 330 }, land).textContent = '갯벌';
    el('text', { class: 'ln-tag', x: 520, y: 124 }, land).textContent = '숲';

    // 돋보기
    const lens = el('g', { class: 'ln-lens', tabindex: '0', role: 'slider', 'aria-label': '돋보기: 끌어서 옮기고 가만히 두면 더 깊이 보인다' }, svg);
    const inner = el('g', { 'clip-path': 'url(#ln-clip)' }, lens);
    const glass = el('circle', { class: 'ln-glass', r: R - 4 }, inner);
    const inside = el('g', {}, inner);
    el('path', { class: 'ln-handle', d: `M${R * 0.7} ${R * 0.7} l 46 46` }, lens);
    el('circle', { class: 'ln-rim', r: R }, lens);
    const ring = el('circle', { class: 'ln-ring', r: R + 8, 'stroke-dasharray': `0 999` }, lens);
    const chip = el('g', { class: 'ln-chip' }, lens); const chipBg = el('rect', { x: -84, y: -R - 46, width: 168, height: 34, rx: 17 }, chip); const chipT = el('text', { y: -R - 23 }, chip);
    void clipC;

    let x = 150, y = 300, lv = 1, zone = 'flat', anchor = { x, y }, still = 0, seen = new Set();
    const flip = () => { const up = y > 170; chipBg.setAttribute('y', up ? -R - 46 : R + 12); chipT.setAttribute('y', up ? -R - 23 : R + 35); };
    function paintInside() {
      inside.innerHTML = '';
      const Z = ZONES[zone];
      if (!Z) { glass.setAttribute('class', 'ln-glass sky'); chipT.textContent = '하늘'; chipBg.setAttribute('width', 168); return; }
      glass.setAttribute('class', 'ln-glass ' + zone);
      if (lv === 1) {
        // 생태계: 확대한 풍경
        if (zone === 'sea') { for (let i = 0; i < 5; i++) el('path', { class: 'ln-wave big', d: `M${-70 + (i % 2) * 20} ${-50 + i * 24} q 14 -8 28 0 t 28 0 t 28 0 t 28 0` }, inside); }
        if (zone === 'flat') { for (let i = 0; i < 18; i++) { const r = rand(i + 5); el('circle', { class: 'ln-mud big', cx: (-70 + r() * 140).toFixed(0), cy: (-60 + r() * 120).toFixed(0), r: (3 + r() * 4).toFixed(1) }, inside); } }
        if (zone === 'forest') { for (let i = 0; i < 9; i++) el('circle', { class: 'ln-tree', cx: -60 + (i % 3) * 60, cy: -50 + Math.floor(i / 3) * 50, r: 24 }, inside); }
      } else if (lv === 2) {
        Z.sp.forEach((k, i) => { const a = -Math.PI / 2 + i * Math.PI / 2; draw(inside, k, 44 * Math.cos(a), 40 * Math.sin(a) + 4, 0.85); });
      } else {
        for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3 + 0.3; draw(inside, Z.one, (i === 5 ? 0 : 50 * Math.cos(a)), (i === 5 ? 0 : 46 * Math.sin(a)), 0.7, i); }
      }
      chipT.textContent = lv === 1 ? Z.eco : lv === 2 ? `${Z.name}의 여러 종` : `${Z.one} 여러 마리`;
      chipBg.setAttribute('width', Math.max(168, chipT.textContent.length * 20 + 30)); chipBg.setAttribute('x', -Number(chipBg.getAttribute('width')) / 2);
      flip();
    }
    function say() {
      const Z = ZONES[zone];
      if (!Z) { now.textContent = '바다·갯벌·숲 위로 옮겨 보자'; read.innerHTML = '하늘에는 들여다볼 생태계가 없다'; return; }
      seen.add(zone + lv);
      read.innerHTML = lv === 1 ? `<b>${Z.eco}</b> — 이 섬에는 생태계가 여러 가지다`
        : lv === 2 ? `<b>${Z.sp.join(' · ')}</b> — 한 생태계에 여러 종이 산다`
          : `<b>${Z.one}</b> — 같은 종이어도 무늬·색이 저마다 다르다`;
      now.textContent = lv < 3 ? '돋보기를 가만히 두면 더 깊이 보인다' : seen.size >= 5 ? '다른 곳도 들여다보자 · 예측을 골라 보자' : '다른 곳으로 옮겨 보자';
    }
    function place(nx, ny) {
      x = clamp(nx, R - 30, W - R + 30); y = clamp(ny, R - 20, H - R + 40);
      lens.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
      inner.setAttribute('transform', '');
      flip();
      const z = zoneAt(x, y);
      if (z !== zone || Math.hypot(x - anchor.x, y - anchor.y) > 60) { zone = z; lv = 1; anchor = { x, y }; still = 0; paintInside(); say(); }
    }
    hold(lens, { down() { lens.classList.add('drag'); }, move(p) { place(p.x, p.y + 0); still = 0; }, up() { lens.classList.remove('drag'); } }, svg);
    lens.addEventListener('keydown', (e) => {
      const d = { ArrowLeft: [-30, 0], ArrowRight: [30, 0], ArrowUp: [0, -30], ArrowDown: [0, 30] }[e.key];
      if (d) { e.preventDefault(); e.stopPropagation(); place(x + d[0], y + d[1]); still = 0; }
    });
    // 가만히 두면 1.3초마다 한 단계 깊이
    const loop = window.Kit.ticker((dt) => {
      if (!ZONES[zone] || lv >= 3) { ring.setAttribute('stroke-dasharray', '0 999'); return; }
      still += dt; const u = clamp(still / 1.3, 0, 1), c = 2 * Math.PI * (R + 8);
      ring.setAttribute('stroke-dasharray', `${(u * c).toFixed(1)} 999`);
      if (u >= 1) { lv++; still = 0; anchor = { x, y }; paintInside(); say(); }
    });
    place(x, y); paintInside(); say();
    root._lens = { go(nx, ny, l) { place(nx, ny); if (l) { lv = l; paintInside(); say(); } } };
    return { setActive(on) { if (on) loop.start(); else loop.stop(); } };
  }
  window.Lens = { mount, draw };
})();
