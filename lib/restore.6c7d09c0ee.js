/* 3차시 2장 멸종 위기종 복원: 손잡이 둘 — «풀어 주는 개체 수»(0~20마리)와 «서식지 보전·연결»(0~100 %).
   20년 동안 개체 수를 셈한다(이해를 돕기 위한 모형):
     수용력 K = 6 + 70×서식지, 늘어남 = 0.3×서식지×N×(1 − N/K)
     줄어듦 = m×N, m = 0.08×(1 − 서식지) + 0.02(서식지가 나쁘면 사고·밀렵·먹이 부족으로 더 죽는다)
     10마리보다 적으면 가까운 개체끼리 짝짓기가 늘어 유전적 다양성이 낮아진다고 보고 m에 0.06을 더한다. */
(function () {
  'use strict';
  const { el, clamp } = window.Kit;
  const GX = 600, GY = 90, GW = 420, GH = 300;

  function model(n0, h) {
    const K = 6 + 70 * h, out = [n0]; let N = n0;
    for (let y = 1; y <= 20; y++) { const m = 0.08 * (1 - h) + 0.02 + (N < 10 ? 0.06 : 0); N = Math.max(0, N + 0.3 * h * N * (1 - N / K) - m * N); if (N < 0.5) N = 0; out.push(N); }
    return out;
  }

  function mount(root) {
    const svg = root.querySelector('.rt-svg'), now = root.querySelector('.rt-now'), msg = root.querySelector('.rt-msg'), vN = root.querySelector('.rt-n'), vG = root.querySelector('.rt-g i');
    el('rect', { class: 'rt-bg', width: 1056, height: 700 }, svg);
    el('path', { class: 'rt-mt', d: 'M0 420 L 150 150 L 260 260 L 380 110 L 560 420 Z' }, svg);
    const trees = []; for (let i = 0; i < 30; i++) { const x = 40 + (i * 37) % 500, y = 330 + ((i * 53) % 80); trees.push(el('circle', { class: 'rt-tree', cx: x, cy: y, r: 16 }, svg)); }
    const road = el('path', { class: 'rt-road', d: 'M0 380 C 150 360 300 400 560 370' }, svg);
    const bridge = el('path', { class: 'rt-bridge', d: 'M240 362 q 40 -30 80 0' }, svg);
    const bears = el('g', {}, svg);
    // 그래프
    el('rect', { class: 'rt-gbg', x: GX, y: GY, width: GW, height: GH }, svg);
    el('text', { class: 'rt-gt', x: GX, y: GY - 16 }, svg).textContent = '20년 동안의 개체 수';
    [0, 20, 40, 60].forEach((v) => { const y = GY + GH - v / 70 * GH; el('path', { class: 'rt-grid', d: `M${GX} ${y} h ${GW}` }, svg); el('text', { class: 'rt-ax', x: GX - 8, y: y + 6 }, svg).textContent = v; });
    [0, 10, 20].forEach((t) => el('text', { class: 'rt-axx', x: GX + t / 20 * GW, y: GY + GH + 26 }, svg).textContent = `${t}년`);
    const line = el('path', { class: 'rt-line' }, svg), ghost = el('path', { class: 'rt-ghost' }, svg);
    // 손잡이
    const dials = [['풀어 주는 개체 수', 180, 560], ['서식지 보전·연결', 430, 560]].map(([t, cx, cy]) => {
      const g = el('g', { class: 'rt-dial', tabindex: '0', role: 'slider', 'aria-label': t }, svg);
      el('circle', { cx, cy, r: 74, class: 'rt-dbase' }, g);
      const spin = el('g', { class: 'dl-spin' }, g); el('circle', { cx, cy, r: 58, class: 'rt-dknob' }, spin); el('path', { d: `M${cx} ${cy - 56} v 30`, class: 'rt-dmark' }, spin);
      for (let i = 0; i <= 10; i++) { const a = (i * 30) * Math.PI / 180; el('path', { class: 'rt-dtick', d: `M${cx + 78 * Math.sin(a)} ${cy - 78 * Math.cos(a)} L ${cx + 88 * Math.sin(a)} ${cy - 88 * Math.cos(a)}` }, svg); }
      el('text', { class: 'rt-dt', x: cx, y: cy + 112 }, svg).textContent = t;
      const v = el('text', { class: 'rt-dv', x: cx, y: cy + 12 }, svg);
      return { g, cx, cy, v };
    });
    let n0 = 6, h = 0.2, prev = null;
    function paint() {
      const s = model(n0, h), end = s[20];
      const pts = s.map((v, i) => `${(GX + i / 20 * GW).toFixed(1)} ${(GY + GH - Math.min(70, v) / 70 * GH).toFixed(1)}`);
      line.setAttribute('d', 'M' + pts.join(' L '));
      dials[0].v.textContent = `${n0}마리`; dials[1].v.textContent = `${Math.round(h * 100)}%`;
      vN.textContent = `${Math.round(end)}마리`;
      vG.style.width = clamp(end / 30, 0, 1) * 100 + '%';
      trees.forEach((t, i) => t.style.opacity = i < 8 + h * 22 ? 1 : 0.15);
      road.style.opacity = 1 - h * 0.5; bridge.style.opacity = h > 0.5 ? 1 : 0;
      bears.innerHTML = ''; const nb = Math.min(24, Math.round(end));
      for (let i = 0; i < nb; i++) {
        const g = el('g', { class: 'rt-bear', transform: `translate(${60 + (i * 83) % 460} ${244 + ((i * 47) % 100)})` }, bears);
        el('ellipse', { cx: 0, cy: 0, rx: 15, ry: 10, fill: '#2a2522', stroke: '#1d2433', 'stroke-width': 1.5 }, g);
        for (const x of [-9, -3, 5, 11]) el('rect', { x: x - 2, y: 6, width: 4, height: 8, rx: 2, fill: '#2a2522' }, g);
        el('circle', { cx: 15, cy: -6, r: 8, fill: '#2a2522', stroke: '#1d2433', 'stroke-width': 1.5 }, g);
        el('circle', { cx: 11, cy: -13, r: 3, fill: '#2a2522' }, g); el('circle', { cx: 19, cy: -13, r: 3, fill: '#2a2522' }, g);
        el('path', { d: 'M5 -3 q6 6 12 0', fill: 'none', stroke: '#f2ead6', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g);
        el('ellipse', { cx: 20, cy: -4, rx: 3, ry: 2.2, fill: '#8a6a4a' }, g);
      }
      msg.innerHTML = end < 1 ? (h < 0.4 ? '<b>사라졌다.</b> 풀어 준 곰이 살 숲이 모자라고 길에서 다치거나 잡힌다 — 서식지부터 지켜야 한다.' : '<b>사라졌다.</b> 너무 적게 풀어 주면 가까운 개체끼리 짝을 지어 유전적 다양성이 낮고 쉽게 줄어든다.')
        : end < n0 ? `<b>${Math.round(end)}마리로 줄었다.</b> 서식지를 더 지키고 이어 주어야 한다.`
          : end < 30 ? `<b>${Math.round(end)}마리로 조금 늘었다.</b> 더 늘리려면 무엇을 돌려야 할까?`
            : `<b>${Math.round(end)}마리로 늘었다.</b> 개체를 풀어 주고, 살 곳을 지키고 이어 줄 때 스스로 살아간다.`;
      now.textContent = end >= 30 ? '두 손잡이가 모두 필요했다' : '손잡이를 돌려 20년 뒤를 바꿔 보자';
      if (prev) ghost.setAttribute('d', prev);
    }
    const ctl = [
      window.Scene3D.dial(dials[0].g, dials[0].cx, dials[0].cy, { max: 300, v0: 6 / 20, onChange: (u) => { const v = Math.round(u * 20); if (v !== n0) { prev = line.getAttribute('d'); n0 = v; paint(); } } }),
      window.Scene3D.dial(dials[1].g, dials[1].cx, dials[1].cy, { max: 300, v0: 0.2, onChange: (u) => { const v = Math.round(u * 20) / 20; if (v !== h) { prev = line.getAttribute('d'); h = v; paint(); } } }),
    ];
    paint();
    root._rt = { set(a, b) { ctl[0].set(a / 20); ctl[1].set(b); }, model };
    return {};
  }
  window.Restore = { mount, model };
})();
