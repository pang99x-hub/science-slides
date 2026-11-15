/* 2차시 5장 보전을 위한 노력(교과서 29쪽 그림 Ⅰ-19): 한 줄 막대를 칸막이 둘로 «개인 · 국가와 사회 · 국제 사회»에 나눈다.
   개인의 노력(재활용·대중교통·친환경 제품) → 강이 맑아지고 물고기가 돌아온다.
   국가와 사회(법 제정·국립 공원·멸종 위기종 복원) → 숲이 지켜지고 곰이 돌아온다.
   국제 사회(생물다양성협약·람사르 협약) → 국경을 넘나드는 철새가 쉬어 갈 습지가 지켜진다.
   한 몫이 30 %를 넘으면 그 부분이 다 살아난다고 둔 모형(이해를 돕기 위한 예). 셋 중 하나라도 비면 전체가 낮다. */
(function () {
  'use strict';
  const { el, hold, clamp, rand } = window.Kit;
  const BX = 60, BW = 936, BY = 606, BH = 56;
  const PART = [
    { k: 'me', name: '개인', c: '#e9a21a' },
    { k: 'gov', name: '국가와 사회', c: '#3f8a4a' },
    { k: 'world', name: '국제 사회', c: '#3a78c2' },
  ];

  function mount(root) {
    const svg = root.querySelector('.ef-svg'), now = root.querySelector('.ef-now'), msg = root.querySelector('.ef-msg');
    const meters = PART.map((p) => root.querySelector(`.ef-m[data-k="${p.k}"] i`)), total = root.querySelector('.ef-total i'), tv = root.querySelector('.ef-tv');
    el('rect', { class: 'ef-sky', width: 1056, height: 560 }, svg);
    el('path', { class: 'ef-ground', d: 'M0 300 C 200 280 400 300 600 290 S 900 280 1056 290 V 560 H 0 Z' }, svg);
    // 강(왼쪽)
    const river = el('path', { class: 'ef-river', d: 'M60 560 C 120 470 220 430 200 360 S 260 300 330 290 L 380 300 C 320 320 300 360 300 400 S 220 500 230 560 Z' }, svg);
    const r = rand(4);
    const trash = Array.from({ length: 7 }, (_, i) => { const t = el('g', { class: 'ef-trash', transform: `translate(${150 + r() * 130} ${380 + r() * 150})` }, svg); el('rect', { x: -9, y: -6, width: 18, height: 12, rx: 3, fill: ['#c0c6cf', '#e07a3f', '#d9d2c0'][i % 3] }, t); return t; });
    const fish = Array.from({ length: 5 }, (_, i) => { const f = el('g', { class: 'ef-fish', transform: `translate(${170 + (i % 3) * 40 + (i > 2 ? 20 : 0)} ${420 + i * 22})` }, svg); el('path', { d: 'M-14 0 q 12 -10 24 0 q -12 10 -24 0 z M10 0 l 8 -6 v 12 z' }, f); return f; });
    el('text', { class: 'ef-lab', x: 120, y: 330 }, svg).textContent = '강';
    // 숲(가운데)
    const trees = Array.from({ length: 12 }, (_, i) => { const x = 420 + (i % 6) * 52 + (i > 5 ? 26 : 0), y = 330 + (i > 5 ? 60 : 0); const t = el('g', { class: 'ef-tree', transform: `translate(${x} ${y})` }, svg); el('path', { d: 'M0 30 v -24', class: 'ef-trunk' }, t); el('circle', { cy: -12, r: 24 }, t); return t; });
    const stumps = trees.map((t, i) => { const x = 420 + (i % 6) * 52 + (i > 5 ? 26 : 0), y = 356 + (i > 5 ? 60 : 0); return el('rect', { class: 'ef-stump', x: x - 7, y, width: 14, height: 8, rx: 2 }, svg); });
    const bears = [0, 1].map((i) => { const t = el('text', { class: 'ef-bear', x: 470 + i * 150, y: 500 }, svg); t.textContent = '🐻'; return t; });
    const park = el('g', { class: 'ef-park', transform: 'translate(640 250)' }, svg); el('rect', { x: -70, y: -24, width: 140, height: 40, rx: 6 }, park); el('text', { y: 4 }, park).textContent = '국립 공원'; el('path', { d: 'M0 16 v 30', class: 'ef-trunk' }, park);
    el('text', { class: 'ef-lab', x: 560, y: 545 }, svg).textContent = '숲';
    // 국경과 철새 쉼터(오른쪽)
    el('path', { class: 'ef-border', d: 'M860 60 V 560' }, svg);
    el('text', { class: 'ef-blab', x: 868, y: 84 }, svg).textContent = '국경';
    const marsh = el('ellipse', { class: 'ef-marsh', cx: 930, cy: 470, rx: 110, ry: 46 }, svg);
    el('text', { class: 'ef-lab', x: 930, y: 545 }, svg).textContent = '철새가 쉬어 가는 습지';
    const birds = Array.from({ length: 8 }, (_, i) => { const b = el('path', { class: 'ef-bird', d: 'M-14 0 q 7 -8 14 0 q 7 -8 14 0' }, svg); return { b, i }; });
    // 막대와 칸막이
    const segs = PART.map((p) => { const g = el('g', {}, svg); const rc = el('rect', { y: BY, height: BH, fill: p.c, class: 'ef-seg' }, g); const t = el('text', { y: BY + 37, class: 'ef-segt' }, g); return { rc, t }; });
    el('rect', { class: 'ef-barframe', x: BX, y: BY, width: BW, height: BH, rx: 8 }, svg);
    el('text', { class: 'ef-bartitle', x: BX, y: BY - 12 }, svg).textContent = '우리 사회가 쏟는 힘 전체(칸막이를 끌어 나누기)';
    const grips = [0, 1].map((j) => {
      const g = el('g', { class: 'ef-grip', tabindex: '0', role: 'slider', 'aria-label': j ? '국가와 사회 | 국제 사회 칸막이' : '개인 | 국가와 사회 칸막이' }, svg);
      el('rect', { x: -14, y: BY - 12, width: 28, height: BH + 24, rx: 8 }, g); el('path', { d: `M-4 ${BY + 14} v 28 M4 ${BY + 14} v 28` }, g);
      return g;
    });
    let d = [0.8, 0.95], t = 0;
    const f = (s) => clamp(s / 0.3, 0, 1);
    function paint() {
      const sh = [d[0], d[1] - d[0], 1 - d[1]], v = sh.map(f), all = Math.cbrt(v[0] * v[1] * v[2]);
      let x = BX; sh.forEach((s, i) => { const w = s * BW; segs[i].rc.setAttribute('x', x); segs[i].rc.setAttribute('width', Math.max(0, w)); segs[i].t.setAttribute('x', x + w / 2); segs[i].t.textContent = w > 120 ? `${PART[i].name} ${Math.round(s * 100)}%` : w > 50 ? `${Math.round(s * 100)}%` : ''; x += w; });
      grips.forEach((g, j) => g.setAttribute('transform', `translate(${(BX + d[j] * BW).toFixed(1)} 0)`));
      // 강
      river.style.fill = `color-mix(in srgb, #4d8fc4 ${Math.round(v[0] * 100)}%, #7b7350)`;
      trash.forEach((tr, i) => tr.style.opacity = i < Math.round((1 - v[0]) * trash.length) ? 1 : 0);
      fish.forEach((fi, i) => fi.style.opacity = i < Math.round(v[0] * fish.length) ? 1 : 0);
      // 숲
      const nT = Math.round(3 + v[1] * 9);
      trees.forEach((tr, i) => { tr.style.opacity = i < nT ? 1 : 0; stumps[i].style.opacity = i < nT ? 0 : 1; });
      bears.forEach((b, i) => b.style.opacity = v[1] > (i ? 0.95 : 0.6) ? 1 : 0);
      park.style.opacity = v[1] > 0.5 ? 1 : 0.2;
      marsh.style.opacity = 0.35 + 0.65 * v[2];
      meters.forEach((m, i) => { m.style.width = (v[i] * 100).toFixed(0) + '%'; });
      total.style.width = (all * 100).toFixed(0) + '%'; tv.textContent = `${Math.round(all * 100)}`;
      const low = PART.filter((_, i) => v[i] < 0.6).map((p) => p.name);
      msg.innerHTML = !low.length ? '<b>세 쪽이 함께 힘을 쏟자</b> 강·숲·철새 쉼터가 모두 살아났다. 보전은 개인 혼자의 일도, 나라 혼자의 일도 아니다.'
        : `<b>${low.join('·')}</b> 쪽의 힘이 모자라 ${low.map((n) => ({ 개인: '강이 더럽고', '국가와 사회': '숲이 베어지고', '국제 사회': '철새가 쉬어 갈 곳이 없고' })[n]).join(', ')} 있다.`;
      now.textContent = low.length ? '칸막이를 끌어 힘을 나눠 보자' : '한쪽에 몰아 보면 어떻게 될까?';
      paint.v = v;
    }
    grips.forEach((g, j) => {
      hold(g, { down() { g.classList.add('drag'); }, move(p) { const u = clamp((p.x - BX) / BW, 0, 1); d[j] = j ? clamp(u, d[0], 1) : clamp(u, 0, d[1]); paint(); }, up() { g.classList.remove('drag'); } }, svg);
      g.addEventListener('keydown', (e) => { const s = { ArrowLeft: -0.05, ArrowRight: 0.05 }[e.key]; if (!s) return; e.preventDefault(); e.stopPropagation(); d[j] = j ? clamp(d[j] + s, d[0], 1) : clamp(d[j] + s, 0, d[1]); paint(); });
    });
    const loop = window.Kit.ticker((dt) => {
      t += dt; const v = paint.v || [0, 0, 0], nB = Math.round(v[2] * birds.length);
      birds.forEach(({ b, i }) => {
        const on = i < nB, u = ((t * 0.08 + i * 0.11) % 1);
        // 국경 너머(오른쪽 바깥)에서 날아와 습지에 내려앉는다
        const x = on ? 870 + 190 * (1 - Math.min(1, u * 2)) + (i % 4) * 34 : 1100, y = on ? 120 + (i % 3) * 30 + Math.min(1, u * 2) * (300 - (i % 3) * 30) : -50;
        b.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(1 ${Math.sin(t * 8 + i) > 0 ? 1 : -0.4})`);
      });
    });
    paint();
    root._effort = { set(a, b) { d = [a, b]; paint(); } };
    return { setActive(on) { if (on) loop.start(); else loop.stop(); } };
  }
  window.Effort = { mount };
})();
