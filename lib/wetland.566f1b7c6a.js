/* 3차시 3장 습지 보호 지정(람사르 협약 · 생태 우수 지역 보호 지정): 습지 지도 위 보호 구역 경계의 꼭짓점 여섯 개를 끌어 모양을 바꾼다.
   경계 안의 물새 둥지·희귀 식물·물길은 지켜지고, 밖은 «10년 뒤» 막대를 밀면 논·공장으로 메워진다.
   경계가 길수록 지키는 데 사람과 돈이 많이 들어, 길이에 한도를 두었다(이해를 돕기 위한 예). */
(function () {
  'use strict';
  const { el, hold, clamp, keep } = window.Kit;
  const LIMIT = 1900;
  function lily(p, sc) {
    const g = el('g', { transform: `scale(${sc || 1})` }, p);
    el('path', { class: 'wl-pad', d: 'M0 0 L 17 -6 A 18 18 0 1 1 6 -17 Z' }, g);   // 갈라진 연잎
    el('path', { class: 'wl-vein', d: 'M0 0 L -12 8 M0 0 L -4 14 M0 0 L 8 12 M0 0 L -14 -4' }, g);
    [0, 72, 144, 216, 288].forEach((a) => el('ellipse', { class: 'wl-petal', cx: 0, cy: -7, rx: 4, ry: 8, transform: `rotate(${a})` }, g));
    el('circle', { class: 'wl-core', r: 3.5 }, g);
    return g;
  }
  function paddy(g, x, y, w, h) {
    el('rect', { x, y, width: w, height: h, rx: 4, class: 'wl-paddy' }, g);
    for (let i = 1; i < 4; i++) el('path', { class: 'wl-rice', d: `M${x + 6} ${y + i * h / 4} H ${x + w - 6}` }, g);
    for (let i = 0; i < 5; i++) el('path', { class: 'wl-rice t', d: `M${x + 10 + i * (w - 20) / 4} ${y + h / 2 + 6} v -12` }, g);
  }
  function factory(g, x, y, w, h) {
    el('rect', { x, y, width: w, height: h, rx: 4, class: 'wl-fact' }, g);
    el('path', { class: 'wl-bld', d: `M${x + 8} ${y + h - 8} V ${y + h * 0.48} L ${x + w * 0.35} ${y + h * 0.62} V ${y + h * 0.48} L ${x + w * 0.62} ${y + h * 0.62} V ${y + h * 0.3} H ${x + w * 0.74} V ${y + h - 8} Z` }, g);
    el('path', { class: 'wl-smoke', d: `M${x + w * 0.68} ${y + h * 0.26} q 6 -8 0 -14 q -6 -6 2 -12` }, g);
  }
  const NESTS = [[300, 250], [420, 190], [560, 300], [700, 230], [820, 330], [250, 420], [640, 470]];
  const PLANTS = [[380, 360], [520, 420], [760, 420], [880, 200]];
  const inPoly = (p, P) => { let c = false; for (let i = 0, j = P.length - 1; i < P.length; j = i++) { const a = P[i], b = P[j]; if ((a[1] > p[1]) !== (b[1] > p[1]) && p[0] < (b[0] - a[0]) * (p[1] - a[1]) / (b[1] - a[1]) + a[0]) c = !c; } return c; };

  function mount(root) {
    const svg = root.querySelector('.wl-svg'), now = root.querySelector('.wl-now'), range = root.querySelector('#wl-t'), tv = root.querySelector('.wl-tv');
    const vLen = root.querySelector('.wl-len i'), vLenT = root.querySelector('.wl-lv'), vN = root.querySelector('.wl-nest'), vP = root.querySelector('.wl-plant'), msg = root.querySelector('.wl-msg');
    el('rect', { class: 'wl-land', width: 1056, height: 640 }, svg);
    el('path', { class: 'wl-water', d: 'M180 300 C 220 180 420 130 560 170 S 860 160 900 260 S 820 470 640 500 S 300 520 220 440 Z' }, svg);
    el('path', { class: 'wl-stream', d: 'M0 330 C 80 320 140 330 190 320 M900 260 C 960 240 1010 250 1056 230' }, svg);
    for (let i = 0; i < 40; i++) { const a = i / 40 * 6.28, x = 540 + 370 * Math.cos(a), y = 330 + 190 * Math.sin(a); el('path', { class: 'wl-reed', d: `M${x.toFixed(0)} ${y.toFixed(0)} v -22 M${(x + 6).toFixed(0)} ${y.toFixed(0)} v -16` }, svg); }
    // 메워지는 땅: 논·공장 칸(밖에 있는 것만 시간에 따라 드러남)
    const fill = []; for (let r = 0; r < 8; r++) for (let c = 0; c < 13; c++) { const x = 20 + c * 80, y = 20 + r * 76; const g = el('g', { class: 'wl-fillc' }, svg); if ((r + c) % 3) paddy(g, x, y, 76, 72); else factory(g, x, y, 76, 72); fill.push({ g, p: [x + 38, y + 36], k: (r * 7 + c * 5) % 10 / 10 }); }
    const nests = NESTS.map(([x, y]) => { const g = el('g', { class: 'wl-item', transform: `translate(${x} ${y})` }, svg); el('ellipse', { rx: 20, ry: 10, class: 'wl-nest' }, g); for (let i = 0; i < 3; i++) el('ellipse', { cx: -8 + i * 8, cy: -4, rx: 5, ry: 6, class: 'wl-egg' }, g); el('path', { d: 'M-4 -30 q 10 -14 22 -2 l 10 -2 l -10 6 q -6 12 -22 6 z', class: 'wl-bird' }, g); return { g, p: [x, y] }; });
    const plants = PLANTS.map(([x, y]) => { const g = el('g', { class: 'wl-item', transform: `translate(${x} ${y})` }, svg); lily(g, 1.25); return { g, p: [x, y] }; });
    // 범례: 그림과 함께
    const key = el('g', { class: 'wl-legend', transform: 'translate(0 648)' }, svg);
    el('rect', { x: 0, y: -16, width: 1056, height: 48, class: 'wl-legbg' }, key);
    let kx = 18;
    const item = (draw, label, w) => { const g = el('g', { transform: `translate(${kx} 8)` }, key); draw(g); el('text', { class: 'wl-key', x: 26, y: 7 }, g).textContent = label; kx += w; };
    item((g) => { const n = el('g', { transform: 'translate(8 4) scale(.7)' }, g); el('ellipse', { rx: 20, ry: 10, class: 'wl-nest' }, n); for (let i = 0; i < 3; i++) el('ellipse', { cx: -8 + i * 8, cy: -4, rx: 5, ry: 6, class: 'wl-egg' }, n); }, '물새 둥지', 170);
    item((g) => { const l = el('g', { transform: 'translate(8 0)' }, g); lily(l, 0.75); }, '희귀 물풀(연잎·보라 꽃)', 285);
    item((g) => paddy(g, -6, -12, 26, 24), '10년 뒤 논으로 메워짐', 270);
    item((g) => factory(g, -6, -12, 26, 24), '10년 뒤 공장이 들어섬', 270);
    const poly = el('path', { class: 'wl-poly' }, svg);
    let P = [[260, 210], [520, 140], [780, 170], [860, 330], [640, 460], [300, 430]];
    const knobs = P.map((_, i) => { const g = el('g', { class: 'wl-knob', tabindex: '0', role: 'button', 'aria-label': `경계 꼭짓점 ${i + 1}` }, svg); el('circle', { r: 20 }, g); return g; });
    const len = () => P.reduce((a, p, i) => a + Math.hypot(p[0] - P[(i + 1) % P.length][0], p[1] - P[(i + 1) % P.length][1]), 0);
    function paint() {
      const L = len(), over = L > LIMIT, u = Number(range.value) / 100;
      poly.setAttribute('d', 'M' + P.map((p) => p.join(' ')).join(' L ') + ' Z'); poly.classList.toggle('over', over);
      knobs.forEach((k, i) => k.setAttribute('transform', `translate(${P[i][0]} ${P[i][1]})`));
      const safe = (p) => !over && inPoly(p, P);
      fill.forEach((f) => f.g.style.opacity = !safe(f.p) && u > f.k ? 0.92 : 0);
      let n = 0, pl = 0;
      nests.forEach((x) => { const s = safe(x.p); x.g.classList.toggle('safe', s); x.g.classList.toggle('lost', !s && u > 0.5); if (s) n++; });
      plants.forEach((x) => { const s = safe(x.p); x.g.classList.toggle('safe', s); x.g.classList.toggle('lost', !s && u > 0.5); if (s) pl++; });
      vLen.style.width = clamp(L / LIMIT, 0, 1) * 100 + '%'; vLen.parentElement.classList.toggle('over', over);
      vLenT.textContent = over ? '너무 길다' : `${Math.round(L / LIMIT * 100)}%`;
      vN.textContent = `${n} / ${nests.length}`; vP.textContent = `${pl} / ${plants.length}`;
      tv.textContent = u < 0.02 ? '지금' : `${Math.round(u * 10)}년 뒤`;
      msg.innerHTML = over ? '<b>경계가 너무 길다.</b> 지킬 사람과 돈이 모자라 보호 구역이 제 역할을 못 한다 — 꼭 지킬 곳만 감싸 보자.'
        : n === nests.length && pl === plants.length ? '<b>둥지와 희귀 물풀을 모두 감쌌다.</b> «10년 뒤»로 밀어 경계 밖이 어떻게 되는지 보자.'
          : `둥지 ${nests.length - n}곳, 물풀 ${plants.length - pl}곳이 경계 밖에 있다.`;
      now.textContent = over ? '꼭짓점을 안쪽으로 당겨 경계를 줄이자' : '꼭짓점을 끌어 둥지와 물풀을 감싸 보자';
    }
    knobs.forEach((k, i) => {
      hold(k, { down() { k.classList.add('drag'); }, move(p) { P[i] = [clamp(p.x, 20, 1036), clamp(p.y, 20, 620)]; paint(); }, up() { k.classList.remove('drag'); } }, svg);
      k.addEventListener('keydown', (e) => { const d = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] }[e.key]; if (!d) return; e.preventDefault(); e.stopPropagation(); P[i] = [P[i][0] + d[0], P[i][1] + d[1]]; paint(); });
    });
    range.addEventListener('input', paint); keep(range);
    paint();
    root._wl = { set(Q) { P = Q; paint(); }, t(v) { range.value = String(v); paint(); } };
    return {};
  }
  window.Wetland = { mount };
})();
