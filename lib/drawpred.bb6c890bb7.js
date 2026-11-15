/* 4차시 표지: 고생대가 시작된 뒤 바다 생물 과의 수가 어떻게 바뀌었을지 손으로 그리는 예측 그래프.
   그린 곡선은 window.Lesson111.pred = [[나이(억 년 전), 높이 0~1], …]에 두고 이 기기에 저장해 3장(다양성 그래프)에서 겹쳐 본다. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const L = window.Lesson111 = window.Lesson111 || {};
  const KEY = 'hanmin-tongsci2-111-pred';
  const AGE0 = 5.39, X0 = 86, X1 = 630, Y0 = 34, Y1 = 318;
  const ax = (age) => X0 + (AGE0 - age) / AGE0 * (X1 - X0);
  const xa = (x) => AGE0 - (x - X0) / (X1 - X0) * AGE0;
  const ERAS = [['고생대', 5.39, 2.52, '#e9f0e2'], ['중생대', 2.52, 0.66, '#f4ead8'], ['신생대', 0.66, 0, '#e4eef5']];
  try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (Array.isArray(s) && s.length > 1) L.pred = s; } catch (e) { /* 저장이 막혀도 그대로 */ }

  function mount(root) {
    const svg = root.querySelector('.dw-svg'), now = root.querySelector('.dw-now');
    ERAS.forEach(([n, a, b, c]) => {
      el('rect', { class: 'dw-band', x: ax(a), y: Y0, width: ax(b) - ax(a), height: Y1 - Y0, fill: c }, svg);
      el('text', { class: 'dw-era', x: (ax(a) + ax(b)) / 2, y: Y1 + 28 }, svg).textContent = n;
    });
    for (let i = 1; i <= 3; i++) el('line', { class: 'dw-grid', x1: X0, x2: X1, y1: Y1 - i * (Y1 - Y0) / 3.3, y2: Y1 - i * (Y1 - Y0) / 3.3 }, svg);
    el('path', { class: 'dw-axis', d: `M${X0} ${Y0 - 10} V ${Y1} H ${X1 + 10}` }, svg);
    [5.39, 2.52, 0.66, 0].forEach((a) => { el('line', { class: 'dw-axis', x1: ax(a), x2: ax(a), y1: Y1, y2: Y1 + 7 }, svg); el('text', { class: 'dw-tick', x: ax(a), y: Y1 + 48 }, svg).textContent = String(a); });
    el('text', { class: 'dw-lab', x: X1 + 10, y: 396, 'text-anchor': 'end' }, svg).textContent = '시간(억 년 전)';
    const yl = el('text', { class: 'dw-lab', transform: `translate(30 ${(Y0 + Y1) / 2}) rotate(-90)`, 'text-anchor': 'middle' }, svg); yl.textContent = '바다 생물 과의 수';
    const start = el('circle', { class: 'dw-start', cx: X0, cy: Y1 - 18, r: 11 }, svg);
    const line = el('path', { class: 'dw-line', d: '' }, svg);
    const pen = el('circle', { class: 'dw-pen', r: 9, cx: X0, cy: Y1 - 18 }, svg);
    let pts = [], on = false;

    const toSvg = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
    const clampY = (y) => Math.max(Y0, Math.min(Y1, y));
    function draw() {
      line.setAttribute('d', pts.length ? 'M' + pts.map((p) => p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' L ') : '');
      const last = pts[pts.length - 1];
      if (last) { pen.setAttribute('cx', last[0]); pen.setAttribute('cy', last[1]); }
      pen.style.opacity = pts.length ? 1 : 0;
    }
    function save() {
      L.pred = pts.map(([x, y]) => [+xa(x).toFixed(3), +((Y1 - y) / (Y1 - Y0)).toFixed(3)]);
      try { localStorage.setItem(KEY, JSON.stringify(L.pred)); } catch (e) { /* 그대로 */ }
    }
    function add(x, y) {
      x = Math.max(X0, Math.min(X1, x)); y = clampY(y);
      // 되돌아 그으면 그 뒤를 지우고 다시 이어 그린다(시간은 한 방향)
      while (pts.length > 1 && pts[pts.length - 1][0] >= x) pts.pop();
      if (!pts.length) pts.push([X0, Y1 - 18]);
      if (x > pts[pts.length - 1][0]) pts.push([x, y]);
    }
    svg.addEventListener('pointerdown', (e) => {
      const p = toSvg(e); if (p.x > X1 + 20) return;
      on = true; try { svg.setPointerCapture(e.pointerId); } catch { /* 합성 */ }
      if (p.x - X0 < 40 || !pts.length) pts = [[X0, Y1 - 18]];
      add(p.x, p.y); draw(); now.classList.add('gone'); e.preventDefault();
    });
    svg.addEventListener('pointermove', (e) => { if (!on) return; const p = toSvg(e); add(p.x, p.y); draw(); });
    const end = () => {
      if (!on) return; on = false; save();
      if (pts.length > 2 && pts[pts.length - 1][0] > X1 - 30) { now.textContent = '예측 그래프 완성! 아래에서 하나 골라 보자'; now.classList.add('done'); }
      else { now.textContent = '오른쪽 끝(지금)까지 이어 그려 보자'; now.classList.remove('done'); }
      now.classList.remove('gone');
    };
    svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
    root.querySelector('.dw-clear').addEventListener('click', () => {
      pts = []; draw(); L.pred = null; try { localStorage.removeItem(KEY); } catch (e) { /* 그대로 */ }
      now.textContent = '왼쪽 점에서 오른쪽으로 그어 보자'; now.classList.remove('done', 'gone');
    });
    // 저장된 예측이 있으면 다시 보여 준다
    if (L.pred) { pts = L.pred.map(([a, v]) => [ax(a), Y1 - v * (Y1 - Y0)]); }
    draw(); void start;
    return {
      draw(list) { pts = []; list.forEach(([a, v]) => add(ax(a), Y1 - v * (Y1 - Y0))); draw(); on = true; end(); },
    };
  }
  window.DrawPred = { mount, ERAS };
})();
