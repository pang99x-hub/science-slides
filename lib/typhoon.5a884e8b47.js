/* 표지: 가상의 바다와 태풍(이해를 돕기 위한 그림). «관측 자료» 막대를 올리면 관측 지점(관측소·부이·위성)이 늘고,
   태풍이 앞으로 갈 길의 예보 범위(원뿔)가 좁아지며 예보 중심이 실제 길에 가까워진다. 태풍을 직접 끌면(누르면 저절로) 실제로 지나간 길이 그려진다. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const P = [[560, 330], [430, 322], [300, 238], [200, 112]];                    // 실제 길(3차 베지에)
  const bez = (t) => { const u = 1 - t; return [0, 1].map((k) => u * u * u * P[0][k] + 3 * u * u * t * P[1][k] + 3 * u * t * t * P[2][k] + t * t * t * P[3][k]); };
  const tan = (t) => { const a = bez(Math.max(0, t - 0.01)), b = bez(Math.min(1, t + 0.01)); const dx = b[0] - a[0], dy = b[1] - a[1], L = Math.hypot(dx, dy) || 1; return [dx / L, dy / L]; };
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  function mount(root) {
    const svg = root.querySelector('.ty-svg'), input = root.querySelector('#ty-data'), dv = root.querySelector('.ty-dv');
    const defs = el('defs', {}, svg);
    const og = el('linearGradient', { id: 'ty-sea', x1: 0, y1: 0, x2: 1, y2: 1 }, defs); el('stop', { offset: 0, 'stop-color': '#a9d6ee' }, og); el('stop', { offset: 1, 'stop-color': '#6fb0d8' }, og);
    el('rect', { width: 640, height: 380, rx: 6, fill: 'url(#ty-sea)' }, svg);
    const grid = el('g', { class: 'ty-grid' }, svg);
    for (let x = 80; x < 640; x += 80) el('path', { d: `M${x} 0 V 380` }, grid);
    for (let y = 76; y < 380; y += 76) el('path', { d: `M0 ${y} H 640` }, grid);
    el('path', { class: 'ty-land', d: 'M0 0 H 270 C 258 42, 226 62, 236 100 C 246 142, 204 164, 162 174 C 112 186, 92 214, 60 234 C 32 250, 12 246, 0 256 Z' }, svg);
    el('path', { class: 'ty-land', d: 'M600 0 H 640 V 120 C 620 110, 610 80, 616 50 C 620 30, 604 16, 600 0 Z' }, svg);
    el('circle', { class: 'ty-city', cx: 150, cy: 120, r: 7 }, svg); el('text', { class: 'ty-ct', x: 150, y: 104 }, svg).textContent = '해안 도시';
    const obs = el('g', { class: 'ty-obs' }, svg);
    const pts = Array.from({ length: 40 }, () => { const x = 20 + rnd() * 600, y = 20 + rnd() * 340; const land = (x < 230 && y < 230 - x * 0.5) || (x > 610 && y < 110); return { x, y, land }; });
    const marks = pts.map((p) => (p.land ? el('path', { class: 'ty-st', d: `M${p.x} ${p.y - 7} l 7 12 h -14 z` }, obs) : el('circle', { class: 'ty-buoy', cx: p.x, cy: p.y, r: 5 }, obs)));
    const sat = el('g', { class: 'ty-sat', transform: 'translate(540 40)' }, svg); el('rect', { x: -9, y: -9, width: 18, height: 18, rx: 3 }, sat); el('rect', { class: 'pn', x: -34, y: -5, width: 22, height: 10 }, sat); el('rect', { class: 'pn', x: 12, y: -5, width: 22, height: 10 }, sat);
    el('text', { class: 'ty-satt', x: 0, y: 26 }, sat).textContent = '위성';
    const cone = el('path', { class: 'ty-cone' }, svg), mid = el('path', { class: 'ty-mid' }, svg);
    const days = [1, 2, 3].map((d) => { const g = el('g', { class: 'ty-day' }, svg); el('circle', { r: 5 }, g); el('text', { x: 10, y: -8 }, g).textContent = `${d}일 뒤`; return g; });
    const real = el('path', { class: 'ty-real', d: '' }, svg);
    const ty = el('g', { class: 'ty-ty', tabindex: '0', role: 'slider', 'aria-label': '태풍(끌어서 앞으로 옮기기, 좌우 화살표 키)' }, svg);
    el('circle', { class: 'ty-hit', r: 34 }, ty); el('circle', { class: 'ty-eye', r: 22 }, ty); const sw = el('path', { class: 'ty-sw', d: 'M0 -20 C 18 -20, 22 4, 6 8 M 0 20 C -18 20, -22 -4, -6 -8' }, ty); el('circle', { class: 'ty-core', r: 5 }, ty);
    const note = el('text', { class: 'ty-note', x: 320, y: 368 }, svg);
    const count = el('text', { class: 'ty-count', x: 288, y: 26 }, svg);
    const hint = el('text', { class: 'ty-hint', x: 560, y: 286 }, svg); hint.textContent = '태풍을 끌어 보자';
    let run = null, spin = 0, tNow = 0;
    function track(d) {
      const left = [], right = [], center = [];
      for (let i = 0; i <= 30; i++) {
        const t = i / 30, [x, y] = bez(t), [tx, ty2] = tan(t), nx = -ty2, ny = tx;
        const off = -(1 - d) * 70 * t, w = 8 + (1 - d) * 100 * t + 16 * t;
        const cx = x + nx * off, cy = y + ny * off; center.push([cx, cy]);
        left.push([cx + nx * w, cy + ny * w]); right.push([cx - nx * w, cy - ny * w]);
      }
      return { left, right, center };
    }
    function paint() {
      const d = Number(input.value) / 100, T = track(d), f = (a) => a.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L ');
      cone.setAttribute('d', `M${f(T.left)} L ${f(T.right.slice().reverse())} Z`);
      mid.setAttribute('d', `M${f(T.center)}`);
      days.forEach((g, i) => { const [x, y] = T.center[(i + 1) * 10]; g.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`); });
      const n = 4 + Math.round(d * 36);
      marks.forEach((m, i) => m.classList.toggle('on', i < n));
      sat.classList.toggle('on', d > 0.3);
      count.textContent = `관측 지점 ${n}곳${d > 0.3 ? ' + 위성' : ''}`;
      dv.textContent = d < 0.25 ? '적다' : d < 0.55 ? '보통' : d < 0.85 ? '많다' : '아주 많다';
      if (!run) moveTo(tNow);
    }
    // 태풍 옮기기: 지나온 길(빨강)을 그리고, 끝까지 가면 예보와 견준다
    function moveTo(k) {
      tNow = Math.max(0, Math.min(1, k));
      const pts2 = []; for (let i = 0; i <= 60 * tNow; i++) pts2.push(bez(i / 60).map((v) => v.toFixed(1)).join(' '));
      real.setAttribute('d', pts2.length > 1 ? 'M' + pts2.join(' L ') : '');
      const [x, y] = bez(tNow); ty.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${spin})`);
      hint.style.opacity = tNow > 0.02 ? '0' : '1';
      const d = Number(input.value) / 100;
      note.textContent = tNow < 0.98 ? (tNow > 0.02 ? '태풍이 지나간 실제 길(빨강) — 예보 범위 안에 있을까?' : '')
        : d < 0.4 ? '실제 길은 범위 안이었지만, 범위가 넓어 어디를 대비할지 정하기 어렵다' : '예보한 좁은 범위 안으로 지나갔다 — 미리 대비할 수 있다';
    }
    function send() {
      if (run) return;
      const k0 = tNow >= 0.98 ? 0 : tNow, t0 = performance.now(), D = window.Deck.reduce ? 0 : 2600 * (1 - k0);
      const step = (now) => { const k = D ? Math.min(1, k0 + (1 - k0) * (now - t0) / D) : 1; spin += 9; moveTo(k); if (k < 1) run = requestAnimationFrame(step); else run = null; };
      run = requestAnimationFrame(step);
    }
    const sp = (ev) => { const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
    let hold = null;
    ty.addEventListener('pointerdown', (e) => { if (run) return; hold = { x: e.clientX, y: e.clientY, moved: false }; try { ty.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ } ty.classList.add('drag'); e.stopPropagation(); });
    ty.addEventListener('pointermove', (e) => {
      if (!hold) return; if (Math.hypot(e.clientX - hold.x, e.clientY - hold.y) > 4) hold.moved = true; if (!hold.moved) return;
      const q = sp(e); let best = tNow, bd = Infinity;
      for (let i = 0; i <= 100; i++) { const [x, y] = bez(i / 100), dd = Math.hypot(x - q.x, y - q.y); if (dd < bd) { bd = dd; best = i / 100; } }
      spin += (best - tNow) * 300; moveTo(best);
    });
    const up = () => { if (!hold) return; const tap = !hold.moved; hold = null; ty.classList.remove('drag'); if (tap) send(); };
    ty.addEventListener('pointerup', up); ty.addEventListener('pointercancel', () => { hold = null; ty.classList.remove('drag'); });
    ty.addEventListener('keydown', (e) => { const d = { ArrowRight: 0.05, ArrowLeft: -0.05 }[e.key]; if (d) { e.preventDefault(); e.stopPropagation(); spin += d * 300; moveTo(tNow + d); } });
    input.addEventListener('input', () => { moveTo(0); paint(); });
    input.addEventListener('keydown', (e) => e.stopPropagation());
    paint();
    root._ty = { set: (v) => { input.value = String(v); paint(); }, send };
    return {};
  }
  window.TyphoonMap = { mount };
})();
