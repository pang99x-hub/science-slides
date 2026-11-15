/* 3차시 3장(교과서 51쪽 결과 및 정리): 실험에서 읽은 최고 온도 점 다섯(가~마)을 오른쪽 칸에서 끌어 그래프에 찍는다.
   가로는 염산 부피(아래 줄은 수산화 나트륨 부피), 세로는 최고 온도. 1 mL·0.1 °C 단위로 붙는다.
   제자리에 찍힌 점은 초록 테, 어긋나면 붉은 테와 힌트. 다섯이 다 맞으면 선이 이어지고 BTB 색이 붙는다.
   값은 실험 장에서 잰 값(AB.state.lab), 안 쟀으면 교과서 51쪽 예시 값. */
(function () {
  'use strict';
  const { el, grab, clamp, MIX, ind, state } = window.AB;
  const X0 = 120, X1 = 780, Y0 = 540, Y1 = 80, T0 = 20, T1 = 30;
  const gx = (v) => X0 + (v / 12) * (X1 - X0), gy = (t) => Y0 - (t - T0) / (T1 - T0) * (Y0 - Y1);
  const vx = (x) => (x - X0) / (X1 - X0) * 12, ty = (y) => T0 + (Y0 - y) / (Y0 - Y1) * (T1 - T0);
  const PLAN = { 가: [2, 10], 나: [4, 8], 다: [6, 6], 라: [8, 4], 마: [10, 2] };

  function mount(root) {
    const svg = root.querySelector('.ab-pl-svg'), now = root.querySelector('.ab-pl-now'), msg = root.querySelector('.ab-pl-msg');
    // 모눈과 축
    for (let v = 0; v <= 12; v++) el('line', { x1: gx(v), x2: gx(v), y1: Y1, y2: Y0, stroke: v % 2 ? '#e3e9e8' : '#cfd9d8', 'stroke-width': 1.5 }, svg);
    for (let t = T0; t <= T1; t += 0.5) el('line', { x1: X0, x2: X1, y1: gy(t), y2: gy(t), stroke: t % 2 === 0 ? '#c3cecd' : '#e3e9e8', 'stroke-width': t % 1 ? 1 : 1.5 }, svg);
    el('path', { d: `M${X0} ${Y1 - 10} V${Y0} H${X1 + 10}`, fill: 'none', stroke: '#1d2433', 'stroke-width': 3 }, svg);
    el('path', { d: `M${X0 - 9} ${Y0 - 18} l18 -6 M${X0 - 9} ${Y0 - 10} l18 -6`, stroke: '#1d2433', 'stroke-width': 2 }, svg);
    for (let t = 20; t <= 30; t += 2) el('text', { x: X0 - 14, y: gy(t) + 6, 'text-anchor': 'end', 'font-size': 18, 'font-weight': 600, fill: '#4b566a', text: t }, svg);
    for (let v = 2; v <= 10; v += 2) { el('text', { x: gx(v), y: Y0 + 26, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: '#1d2433', text: v }, svg); el('text', { x: gx(v), y: Y0 + 48, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 600, fill: '#4b566a', text: 12 - v }, svg); }
    el('text', { x: X1 + 12, y: Y0 + 26, 'font-size': 16, 'font-weight': 700, fill: '#1d2433', text: '염산(mL)' }, svg);
    el('text', { x: X1 + 12, y: Y0 + 48, 'font-size': 16, 'font-weight': 600, fill: '#4b566a', text: '수산화 나트륨(mL)' }, svg);
    el('text', { x: X0 - 50, y: Y1 - 22, 'font-size': 17, 'font-weight': 700, fill: '#1d2433', text: '최고 온도(°C)' }, svg);
    const line = el('polyline', { points: '', fill: 'none', stroke: '#d9483b', 'stroke-width': 4, opacity: 0 }, svg);
    const chips = el('g', {}, svg);
    const cross = el('g', { opacity: 0 }, svg);
    const cx1 = el('line', { stroke: '#2c62c6', 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }, cross), cy1 = el('line', { stroke: '#2c62c6', 'stroke-width': 1.5, 'stroke-dasharray': '5 4' }, cross);
    const ct = el('text', { 'font-size': 17, 'font-weight': 800, fill: '#2c62c6' }, cross);
    // 오른쪽 점 칸
    el('rect', { x: 860, y: 60, width: 126, height: 470, rx: 12, fill: '#f3f5f4', stroke: '#7b8597', 'stroke-width': 2, 'stroke-dasharray': '8 6' }, svg);
    el('text', { x: 923, y: 50, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 700, fill: '#1f5f4a', text: '찍을 점' }, svg);
    let P = [];
    const data = () => MIX.WELLS.map((n) => {
      const L = state.lab && state.lab[n], pl = PLAN[n];
      if (L && L.a === pl[0] && L.b === pl[1]) return { n, a: L.a, T: L.T, src: 'lab', k: L.k };
      return { n, a: pl[0], T: MIX.BOOK[pl[0]], src: 'book', k: MIX.kind(pl[0], pl[1]) };
    });
    function build() {
      [...svg.querySelectorAll('.ab-pl-pt')].forEach((g) => g.remove()); chips.innerHTML = '';
      line.setAttribute('opacity', 0); line.setAttribute('points', '');
      P = data().map((d, i) => {
        const g = el('g', { class: 'ab-pl-pt ab-hand', tabindex: 0, role: 'button', 'aria-label': `${d.n} 점(${d.T} °C) 끌어서 그래프에 찍기` }, svg);
        el('circle', { class: 'ab-hit', r: 34 }, g);
        const ring = el('circle', { r: 15, fill: '#fff', stroke: '#1d2433', 'stroke-width': 3 }, g);
        el('circle', { r: 6, fill: '#d9483b' }, g);
        el('text', { x: 0, y: -22, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: '#1d2433', text: d.n }, g);
        const lab = el('text', { x: 22, y: 6, 'font-size': 16, 'font-weight': 700, fill: '#4b566a', text: `${d.T.toFixed(1)}°C` }, g);
        const p = { ...d, g, ring, lab, hx: 892, hy: 100 + i * 88, x: 892, y: 100 + i * 88, on: false, ok: false };
        const put = () => g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`); put(); p.put = put;
        grab(g, svg, {
          start() { svg.appendChild(g); cross.setAttribute('opacity', 1); },
          move(q) { p.x = clamp(q.x, 40, 990); p.y = clamp(q.y, 40, 600); put(); show(p); },
          end() { cross.setAttribute('opacity', 0); drop(p); },
        });
        return p;
      });
      msg.innerHTML = P.some((p) => p.src === 'lab') ? '실험에서 잰 값으로 점을 만들었다.' : '실험을 하지 않았다면 교과서 51쪽 예시 값으로 점을 만든다.';
      check();
    }
    function show(p) {
      if (p.x > 840) { cross.setAttribute('opacity', 0); return; }
      cross.setAttribute('opacity', 1);
      const v = clamp(Math.round(vx(p.x)), 0, 12), t = clamp(Math.round(ty(p.y) * 10) / 10, T0, T1);
      cx1.setAttribute('x1', gx(v)); cx1.setAttribute('x2', gx(v)); cx1.setAttribute('y1', gy(t)); cx1.setAttribute('y2', Y0);
      cy1.setAttribute('x1', X0); cy1.setAttribute('x2', gx(v)); cy1.setAttribute('y1', gy(t)); cy1.setAttribute('y2', gy(t));
      ct.setAttribute('x', gx(v) + 14); ct.setAttribute('y', gy(t) - 14); ct.textContent = `염산 ${v} mL · ${t.toFixed(1)} °C`;
    }
    function drop(p) {
      if (p.x > 840 || p.x < X0 - 20 || p.y > Y0 + 20 || p.y < Y1 - 20) { p.x = p.hx; p.y = p.hy; p.on = false; p.ok = false; p.put(); p.ring.setAttribute('stroke', '#1d2433'); check(); return; }
      const v = clamp(Math.round(vx(p.x)), 0, 12), t = clamp(Math.round(ty(p.y) * 10) / 10, T0, T1);
      p.x = gx(v); p.y = gy(t); p.on = true; p.put();
      const okX = v === p.a, okY = Math.abs(t - p.T) <= 0.25;
      p.ok = okX && okY;
      p.ring.setAttribute('stroke', p.ok ? '#2f9e5b' : '#d9483b'); p.ring.setAttribute('stroke-width', p.ok ? 5 : 4);
      msg.innerHTML = p.ok ? `<b>${p.n}</b>: 염산 ${p.a} mL, ${p.T.toFixed(1)} °C — 제자리다.`
        : !okX ? `<b>${p.n}</b>는 염산 ${p.a} mL(수산화 나트륨 ${12 - p.a} mL)이었다. 가로 위치를 다시 보자.`
        : `<b>${p.n}</b>의 최고 온도는 ${p.T.toFixed(1)} °C. 세로 눈금을 다시 읽어 보자(지금 ${t.toFixed(1)} °C).`;
      check();
    }
    function check() {
      const n = P.filter((p) => p.ok).length;
      chips.innerHTML = '';
      if (n === P.length) {
        const s = [...P].sort((a, b) => a.a - b.a);
        line.setAttribute('points', s.map((p) => `${p.x},${p.y}`).join(' ')); line.setAttribute('opacity', 1);
        s.forEach((p) => { el('rect', { x: p.x - 16, y: Y0 - 30, width: 32, height: 22, rx: 5, fill: ind('btb', p.k), stroke: '#1d2433', 'stroke-width': 2 }, chips); });
        const top = s.reduce((a, b) => (b.T > a.T ? b : a));
        el('text', { x: top.x, y: top.y - 44, 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: '#d9483b', text: '가장 높다' }, chips);
        el('text', { x: X0 + 10, y: Y0 - 40, 'font-size': 15, 'font-weight': 700, fill: '#4b566a', text: 'BTB 색' }, chips);
        msg.innerHTML += ' 다섯 점이 모두 제자리 — 산 모양 그래프가 되었다.';
      } else line.setAttribute('opacity', 0);
      now.textContent = n === P.length ? '가장 높은 점은 어느 홈? 왜 그곳일까?' : P.some((p) => p.on) ? `제자리 ${n} / 5` : '오른쪽 점을 끌어 그래프에 찍어 보자';
      now.classList.toggle('done', n === P.length);
    }
    document.addEventListener('ab-lab', () => { if (!P.some((p) => p.on)) build(); });
    build();
    root._pl = { place(i, a, t) { const p = P[i]; p.x = gx(a); p.y = gy(t); drop(p); }, all() { P.forEach((p) => { p.x = gx(p.a); p.y = gy(p.T); drop(p); }); }, build };
    return { setActive(on) { if (on && !P.some((p) => p.on)) build(); } };
  }
  window.ABPlot = { mount };
})();
