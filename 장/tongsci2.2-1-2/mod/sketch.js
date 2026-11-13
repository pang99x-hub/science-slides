/* 2차시 표지: 예측 그래프 그리기. 메뚜기·참새 펜으로 세대(0~20)에 따른 개체수 예측 곡선을 손가락으로 그린다.
   그린 값은 세대마다 0~1로 window.Lesson212.pred.hopper / .sparrow에 둔다(3장 모의실험기가 «내 예측»으로 겹쳐 그린다). */
(function () {
  'use strict';
  const { el, pt, clamp } = window.Eco;
  const X0 = 70, X1 = 630, Y0 = 320, Y1 = 40, NG = 20;
  const store = window.Lesson212 = window.Lesson212 || {};
  store.pred = store.pred || { hopper: [], sparrow: [] };

  function mount(root) {
    const svg = root.querySelector('.sk-svg'), now = root.querySelector('.sk-now');
    const pens = [...root.querySelectorAll('.sk-pen')];
    el('rect', { class: 'sk-bg', x: -200, y: -200, width: 1060, height: 760 }, svg);
    for (let g = 0; g <= NG; g += 5) { const x = X0 + g / NG * (X1 - X0); el('path', { class: 'sk-grid', d: `M${x} ${Y1} V ${Y0}` }, svg); el('text', { class: 'sk-tk', x, y: Y0 + 24 }, svg).textContent = g; }
    for (let k = 1; k <= 4; k++) el('path', { class: 'sk-grid', d: `M${X0} ${Y0 - k / 4 * (Y0 - Y1)} H ${X1}` }, svg);
    el('path', { class: 'sk-axis', d: `M${X0} ${Y1 - 10} V ${Y0} H ${X1 + 10}` }, svg);
    el('text', { class: 'sk-lab', x: X1, y: Y0 + 24 + 4, 'text-anchor': 'end' }, svg);
    el('text', { class: 'sk-lab', x: X1 + 12, y: Y0 - 8 }, svg).textContent = '세대';
    el('text', { class: 'sk-lab', x: X0 - 8, y: Y1 - 18 }, svg).textContent = '개체수';
    el('text', { class: 'sk-lab dim', x: X0 - 12, y: Y0 + 4, 'text-anchor': 'end' }, svg).textContent = '적다';
    el('text', { class: 'sk-lab dim', x: X0 - 12, y: Y1 + 8, 'text-anchor': 'end' }, svg).textContent = '많다';
    const line = { hopper: el('path', { class: 'sk-line hopper' }, svg), sparrow: el('path', { class: 'sk-line sparrow' }, svg) };
    const hit = el('rect', { class: 'sk-hit', x: X0 - 20, y: Y1 - 20, width: X1 - X0 + 40, height: Y0 - Y1 + 40 }, svg);
    let pen = 'hopper', drawing = false, last = null;
    const val = { hopper: Array(NG + 1).fill(null), sparrow: Array(NG + 1).fill(null) };
    function paint() {
      for (const k of ['hopper', 'sparrow']) {
        const pts = val[k].map((v, g) => (v === null ? null : `${(X0 + g / NG * (X1 - X0)).toFixed(1)} ${(Y0 - v * (Y0 - Y1)).toFixed(1)}`));
        let d = '', on = false;
        pts.forEach((p) => { if (p === null) { on = false; return; } d += (on ? ' L ' : ' M ') + p; on = true; });
        line[k].setAttribute('d', d.trim());
        store.pred[k] = val[k].slice();
      }
      const nh = val.hopper.filter((v) => v !== null).length, ns = val.sparrow.filter((v) => v !== null).length;
      now.textContent = nh < 6 ? '메뚜기 펜으로 왼쪽에서 오른쪽으로 그려 보자' : ns < 6 ? '이번엔 참새 펜으로 그려 보자' : '두 곡선을 견주어 보고 아래에서 하나를 고르자';
      now.classList.toggle('done', nh >= 6 && ns >= 6);
    }
    // 지나간 세대 칸마다 값을 채운다(빠르게 그어도 빈 곳이 없게 사이를 메운다)
    function mark(p) {
      const gf = clamp((p.x - X0) / (X1 - X0) * NG, 0, NG), v = clamp((Y0 - p.y) / (Y0 - Y1), 0, 1);
      if (last) {
        const [g0, v0] = last, a = Math.round(Math.min(g0, gf)), b = Math.round(Math.max(g0, gf));
        for (let g = a; g <= b; g++) { const t = gf === g0 ? 1 : clamp((g - g0) / (gf - g0), 0, 1); val[pen][g] = v0 + (v - v0) * t; }
      } else val[pen][Math.round(gf)] = v;
      last = [gf, v]; paint();
    }
    hit.addEventListener('pointerdown', (e) => { e.preventDefault(); drawing = true; last = null; hit.setPointerCapture(e.pointerId); mark(pt(svg, e)); });
    hit.addEventListener('pointermove', (e) => { if (drawing) mark(pt(svg, e)); });
    ['pointerup', 'pointercancel'].forEach((t) => hit.addEventListener(t, () => { drawing = false; last = null; }));
    pens.forEach((b) => b.addEventListener('click', () => { pen = b.dataset.k; pens.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); }));
    root.querySelector('.sk-clear').addEventListener('click', () => { val[pen].fill(null); paint(); });
    paint();
    return {};
  }
  window.PredSketch = { mount };
})();
