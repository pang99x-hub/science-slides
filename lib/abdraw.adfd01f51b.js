/* 4차시 3장(교과서 52쪽, 중화점 전후의 이온 수): 묽은 염산(H⁺ 10개, 이해를 돕기 위한 예)에 수산화 나트륨 수용액을 20 mL까지 넣을 때
   고른 입자의 수가 어떻게 변할지 손가락으로 그래프에 그린다. «넣어 보며 맞추기»를 누르면 실제 모형 선이 왼쪽부터 그려지며
   내 선과 겹쳐 보이고, 얼마나 맞았는지 알려 준다. */
(function () {
  'use strict';
  const { el, grab, loop, clamp } = window.AB;
  const X0 = 110, X1 = 830, Y0 = 540, Y1 = 90, NX = 20;
  const MODEL = {
    H: { name: 'H⁺', c: '#7b8597', f: (n) => Math.max(10 - n, 0), max: 20 },
    Cl: { name: 'Cl⁻', c: '#46a35a', f: () => 10, max: 20 },
    Na: { name: 'Na⁺', c: '#d1a91f', f: (n) => n, max: 20 },
    OH: { name: 'OH⁻', c: '#ec8a3a', f: (n) => Math.max(n - 10, 0), max: 20 },
    I: { name: '전체 이온', c: '#7d4cc4', f: (n) => (n <= 10 ? 20 : 2 * n), max: 40 },
    W: { name: '생긴 물 분자', c: '#2a8fb8', f: (n) => Math.min(n, 10), max: 20 },
  };
  const HINT = {
    H: '처음 10개가 OH⁻을 만나 줄어들다가 중화점에서 0, 그 뒤로는 계속 0.',
    Cl: '반응에 끼지 않는 구경꾼 이온 — 처음 수 그대로.',
    Na: '구경꾼 이온 — 넣는 만큼 꾸준히 는다.',
    OH: '중화점까지는 넣는 족족 H⁺과 반응해 0, 그 뒤로 늘어난다.',
    I: '중화점까지는 H⁺이 준 만큼 Na⁺이 늘어 일정, 그 뒤로 늘어난다.',
    W: '중화점까지 늘다가 그 뒤로는 일정 — 더 반응할 H⁺이 없다.',
  };

  function mount(root) {
    const svg = root.querySelector('.ab-dr-svg'), now = root.querySelector('.ab-dr-now'), msg = root.querySelector('.ab-dr-msg');
    const tabs = [...root.querySelectorAll('.ab-dr-tab button')], go = root.querySelector('.ab-dr-go'), clr = root.querySelector('.ab-dr-clear');
    let cur = 'H', ymax = 20;
    const gx = (n) => X0 + n / NX * (X1 - X0), gy = (v) => Y0 - v / ymax * (Y0 - Y1);
    const grid = el('g', {}, svg);
    el('path', { d: `M${X0} ${Y1 - 20} V${Y0} H${X1 + 20}`, fill: 'none', stroke: '#1d2433', 'stroke-width': 3 }, svg);
    el('text', { x: (X0 + X1) / 2, y: Y0 + 56, 'text-anchor': 'middle', 'font-size': 18, 'font-weight': 700, fill: '#1d2433', text: '넣은 NaOH 수용액의 부피(mL)' }, svg);
    const ylab = el('text', { x: X0 - 10, y: Y1 - 32, 'font-size': 18, 'font-weight': 700, fill: '#1d2433', text: '' }, svg);
    const np = el('g', { opacity: 0 }, svg);
    el('line', { x1: gx(10), x2: gx(10), y1: Y1, y2: Y0, stroke: '#3fa65c', 'stroke-width': 2.5, 'stroke-dasharray': '7 6' }, np);
    el('text', { x: gx(10), y: Y1 - 6, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 800, fill: '#2f9e5b', text: '중화점' }, np);
    const mine = el('polyline', { points: '', fill: 'none', stroke: '#1d2433', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'stroke-dasharray': '2 10', opacity: 0.85 }, svg);
    const real = el('polyline', { points: '', fill: 'none', 'stroke-width': 6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, svg);
    const hit = el('rect', { class: 'ab-hit', x: X0 - 20, y: Y1 - 30, width: X1 - X0 + 40, height: Y0 - Y1 + 50, style: 'cursor:crosshair' }, svg);
    const draw = {}; const done = {};
    function axes() {
      grid.innerHTML = '';
      for (let n = 0; n <= NX; n += 2) { el('line', { x1: gx(n), x2: gx(n), y1: Y1, y2: Y0, stroke: n % 10 ? '#e3e9e8' : '#c3cecd', 'stroke-width': 1.5 }, grid); if (n % 4 === 0 || n === 10) el('text', { x: gx(n), y: Y0 + 26, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 600, fill: '#4b566a', text: n }, grid); }
      const step = ymax / 4;
      for (let v = 0; v <= ymax; v += step) { el('line', { x1: X0, x2: X1, y1: gy(v), y2: gy(v), stroke: '#e3e9e8', 'stroke-width': 1.5 }, grid); el('text', { x: X0 - 12, y: gy(v) + 6, 'text-anchor': 'end', 'font-size': 17, 'font-weight': 600, fill: '#4b566a', text: v }, grid); }
    }
    function show() {
      const M = MODEL[cur]; ymax = M.max; axes();
      ylab.textContent = `${M.name} 수`;
      const d = draw[cur] || [];
      mine.setAttribute('points', d.map((v, i) => (v == null ? null : `${gx(i / 2).toFixed(1)},${gy(v).toFixed(1)}`)).filter(Boolean).join(' '));
      real.setAttribute('stroke', M.c); const lg = root.querySelector('.ab-dr-legend i.real'); if (lg) lg.style.borderTopColor = M.c;
      if (done[cur]) { real.setAttribute('points', pts(NX)); np.setAttribute('opacity', 1); } else { real.setAttribute('points', ''); np.setAttribute('opacity', 0); }
      tabs.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === cur)));
      msg.textContent = done[cur] ? HINT[cur] : d.some((v) => v != null) ? '다 그렸으면 «넣어 보며 맞추기»를 누르자.' : `왼쪽(0 mL)에서 오른쪽(20 mL)으로 ${M.name} 수의 변화를 그려 보자.`;
      now.textContent = `${M.name}: 예상 선을 손가락으로 그리자`;
    }
    const pts = (upto) => { const a = []; for (let i = 0; i <= upto * 2; i++) a.push(`${gx(i / 2).toFixed(1)},${gy(MODEL[cur].f(i / 2)).toFixed(1)}`); return a.join(' '); };
    let last = null;
    function put(p) {
      const i = clamp(Math.round((p.x - X0) / (X1 - X0) * NX * 2), 0, NX * 2), v = clamp((Y0 - p.y) / (Y0 - Y1) * ymax, 0, ymax);
      const d = draw[cur] = draw[cur] || new Array(NX * 2 + 1).fill(null);
      if (last) { const [i0, v0] = last, s = Math.sign(i - i0) || 1; for (let j = i0; j !== i; j += s) d[j] = v0 + (v - v0) * (j - i0) / (i - i0); }
      d[i] = v; last = [i, v];
      mine.setAttribute('points', d.map((q, k) => (q == null ? null : `${gx(k / 2).toFixed(1)},${gy(q).toFixed(1)}`)).filter(Boolean).join(' '));
    }
    grab(hit, svg, { start(p) { last = null; done[cur] = false; real.setAttribute('points', ''); np.setAttribute('opacity', 0); put(p); }, move: put, end() { show(); } });
    let anim = 0;
    const l = loop((dt) => {
      anim = Math.min(NX, anim + dt * 8); real.setAttribute('points', pts(Math.floor(anim * 2) / 2));
      if (anim >= NX) { l.stop(); judge(); }
    });
    function judge() {
      done[cur] = true; np.setAttribute('opacity', 1);
      const d = draw[cur] || []; const got = d.map((v, i) => (v == null ? null : Math.abs(v - MODEL[cur].f(i / 2)) / MODEL[cur].max)).filter((x) => x != null);
      const cov = got.length / (NX * 2 + 1), err = got.length ? got.reduce((a, b) => a + b, 0) / got.length : 1;
      const ok = cov > 0.6 && err < 0.12;
      msg.innerHTML = (ok ? '<b>잘 맞았다!</b> ' : cov <= 0.6 ? '<b>끝까지 그려 보자.</b> ' : '<b>어긋난 곳이 있다.</b> ') + HINT[cur];
      const tb = tabs.find((b) => b.dataset.k === cur); tb.classList.toggle('ok', ok);
      const n = tabs.filter((b) => b.classList.contains('ok')).length;
      now.textContent = n >= 4 ? `${n}가지 맞춤 — 중화점은 어디서 알아볼 수 있나?` : '다른 입자도 골라 그려 보자';
      now.classList.toggle('done', n >= 4);
    }
    go.addEventListener('click', () => { anim = 0; real.setAttribute('points', ''); l.start(); });
    clr.addEventListener('click', () => { draw[cur] = null; done[cur] = false; show(); });
    tabs.forEach((b) => b.addEventListener('click', () => { l.stop(); cur = b.dataset.k; show(); }));
    show();
    root._dr = { pick(k) { cur = k; show(); }, scribble(f) { draw[cur] = Array.from({ length: NX * 2 + 1 }, (_, i) => f(i / 2)); show(); }, check() { anim = NX; judge(); real.setAttribute('points', pts(NX)); } };
    return { setActive(on) { if (!on) l.stop(); } };
  }
  window.ABDraw = { mount };
})();
