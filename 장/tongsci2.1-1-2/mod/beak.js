/* 3차시 3장(교과서 24~25쪽): 섬의 씨앗 크기 분포(갈색 곡선, 꼭대기 손잡이를 끈다)와 핀치 부리 크기 분포(초록 막대 20칸).
   한 세대(1초)마다: 부리 b의 적합도 f(b) = Σ 씨앗(s)·exp(−(b−s)²/2·0.12²) + 0.02 → p(b) ← p(b)·f(b) 정규화 → 이웃 칸으로 조금 퍼짐(변이).
   위 장면의 핀치는 이 분포에서 뽑은 부리로 씨앗을 쫀다(맞으면 깨고, 너무 크면 못 깸). 모형 값은 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const K = window.EvKit, F = window.EvFinch, { el, clamp } = K;
  const NB = 20, X0 = 90, X1 = 1000, GY = 660, GH = 210, SD = 0.12;
  const gx = (s) => X0 + s * (X1 - X0);
  const word = (v) => (v < 0.35 ? '작다' : v < 0.62 ? '중간' : '크다');

  function mount(root) {
    const svg = root.querySelector('.ev-bk-svg'), now = root.querySelector('.ev-bk-now'), genT = root.querySelector('.ev-bk-gen'), msg = root.querySelector('.ev-bk-msg');
    const seedT = root.querySelector('.ev-bk-seed'), meanT = root.querySelector('.ev-bk-mean'), kinds = root.querySelector('.ev-bk-kinds');
    [[0, '작고 가는 부리'], [0.5, '중간 부리'], [1, '크고 두꺼운 부리']].forEach(([t, s], i) => { const f = F.draw(kinds, { ...F.byT(t) }); f.setAttribute('transform', `translate(${90 + i * 170} 56) scale(1.2)`); el('text', { x: 100 + i * 170, y: 112, 'text-anchor': 'middle', style: 'font:600 15px var(--f-body)', fill: '#4b566a' }, kinds).textContent = s; });
    el('rect', { x: 0, y: 0, width: 1056, height: 380, fill: '#e6d29a' }, svg);
    el('rect', { x: 0, y: 0, width: 1056, height: 70, fill: '#cfe8f3' }, svg);
    el('rect', { x: 0, y: 380, width: 1056, height: 320, fill: '#fbfcf9' }, svg);
    el('path', { d: 'M0 380 H1056', stroke: '#1d2433', 'stroke-width': 2 }, svg);
    const seedG = el('g', {}, svg), birdG = el('g', {}, svg), fx = el('g', {}, svg);
    // 그래프 틀
    el('path', { d: `M${X0} ${GY} H ${X1}`, stroke: '#1d2433', 'stroke-width': 2.5 }, svg);
    el('text', { x: X0, y: GY + 28, style: 'font:600 16px var(--f-body)', fill: '#7b8597' }, svg).textContent = '작다';
    el('text', { x: X1, y: GY + 28, 'text-anchor': 'end', style: 'font:600 16px var(--f-body)', fill: '#7b8597' }, svg).textContent = '크다 (씨앗 크기 · 부리 크기)';
    const barG = el('g', {}, svg);
    const bars = [...Array(NB)].map((_, i) => el('rect', { x: gx(i / NB) + 2, width: (X1 - X0) / NB - 4, y: GY, height: 0, fill: 'rgba(47,158,91,.55)', stroke: '#1f5f4a', 'stroke-width': 1.5 }, barG));
    const curve = el('path', { fill: 'rgba(122,82,48,.15)', stroke: '#7a5230', 'stroke-width': 4 }, svg);
    const meanL = el('path', { stroke: '#1f5f4a', 'stroke-width': 3, 'stroke-dasharray': '6 5' }, svg);
    const meanTx = el('text', { style: 'font:700 16px var(--f-body)', fill: '#1f5f4a', 'text-anchor': 'middle' }, svg);
    el('text', { x: X0 + 6, y: 412, style: 'font:700 17px var(--f-body)', fill: '#7a5230' }, svg).textContent = '― 섬에 나는 씨앗 크기';
    el('text', { x: X0 + 240, y: 412, style: 'font:700 17px var(--f-body)', fill: '#1f5f4a' }, svg).textContent = '▮ 핀치 부리 크기(개체 수 비율)';
    const handle = el('g', { tabindex: '0', role: 'slider', 'aria-label': '씨앗 크기 곡선 손잡이(←→ 키)', style: 'cursor:grab' }, svg);
    el('circle', { r: 22, fill: '#f2c230', stroke: '#1d2433', 'stroke-width': 3 }, handle);
    el('path', { d: 'M-9 0 h18 M-9 0 l5 -5 M-9 0 l5 5 M9 0 l-5 -5 M9 0 l-5 5', stroke: '#1d2433', 'stroke-width': 2.5, fill: 'none' }, handle);
    let m = 0.3, p = new Float64Array(NB), gen = 0, timer = 0, birds = [], seeds = [], moved = false;
    const reset = () => { for (let i = 0; i < NB; i++) { const b = (i + 0.5) / NB; p[i] = Math.exp(-((b - 0.3) ** 2) / (2 * 0.1 ** 2)); } norm(); gen = 0; };
    function norm() { const s = p.reduce((a, b) => a + b, 0); for (let i = 0; i < NB; i++) p[i] /= s; }
    const seedPdf = (s) => Math.exp(-((s - m) ** 2) / (2 * SD * SD));
    const mean = () => p.reduce((a, v, i) => a + v * (i + 0.5) / NB, 0);
    function sampleBeak() { const i = K.pickW([...p]); return clamp((i + Math.random()) / NB, 0, 1); }
    function sampleSeed() { for (let t = 0; t < 50; t++) { const s = Math.random(); if (Math.random() < seedPdf(s)) return s; } return m; }
    function scene() {
      seedG.innerHTML = ''; birdG.innerHTML = '';
      seeds = [...Array(18)].map((_, i) => { const s = sampleSeed(), x = 60 + (i * 53) % 940 + Math.random() * 20, y = 250 + Math.random() * 110; const e = el('ellipse', { cx: x, cy: y, rx: 4 + s * 14, ry: 3 + s * 10, fill: K.hex(K.mix([196, 160, 96], [110, 70, 36], s)), stroke: '#1d2433', 'stroke-width': 1.5 }, seedG); return { s, x, y, e, eaten: false }; });
      birds = [...Array(12)].map((_, i) => { const b = sampleBeak(), x = 70 + i * 82, y = 200 + (i % 2) * 40; const g = F.draw(birdG, { ...F.byT(b) }); g.setAttribute('transform', `translate(${x} ${y})`); return { b, x, y, g, t: Math.random() * 1.2 }; });
    }
    function graph() {
      let d = `M${X0} ${GY}`; for (let i = 0; i <= 100; i++) { const s = i / 100; d += ` L ${gx(s).toFixed(1)} ${(GY - GH * seedPdf(s)).toFixed(1)}`; } curve.setAttribute('d', d + ` L ${X1} ${GY} Z`);
      handle.setAttribute('transform', `translate(${gx(m)} ${GY - GH})`);
      const top = Math.max(...p); bars.forEach((b, i) => { const h = GH * 0.95 * p[i] / top; b.setAttribute('y', GY - h); b.setAttribute('height', h); });
      const mu = mean(); meanL.setAttribute('d', `M${gx(mu)} ${GY + 4} V ${GY - GH - 24}`); meanTx.setAttribute('x', gx(mu)); meanTx.setAttribute('y', GY - GH - 30); meanTx.textContent = '부리 평균';
      seedT.textContent = word(m); meanT.textContent = word(mu); genT.textContent = gen + '세대';
    }
    function generation() {
      const f = (b) => { let s = 0; for (let k = 0; k <= 40; k++) { const x = k / 40; s += seedPdf(x) * Math.exp(-((b - x) ** 2) / (2 * 0.12 * 0.12)); } return s + 0.02; };
      for (let i = 0; i < NB; i++) p[i] *= f((i + 0.5) / NB); norm();
      const q = Float64Array.from(p); for (let i = 0; i < NB; i++) p[i] = 0.8 * q[i] + 0.1 * (q[i - 1] ?? q[i]) + 0.1 * (q[i + 1] ?? q[i]); norm();
      gen++; graph(); if (gen % 3 === 0) scene();
      const mu = mean();
      if (moved && Math.abs(mu - m) < 0.08 && gen > 3) { now.textContent = '부리 분포가 씨앗 쪽으로 옮겨 갔다'; now.classList.add('done'); msg.innerHTML = `${gen}세대: 씨앗을 잘 깨는 부리의 개체가 더 많이 살아남아 자손을 남겼다 → 부리 평균이 <b>${word(mu)}</b> 쪽으로.`; }
    }
    function peck(dt) {
      birds.forEach((bd) => {
        bd.t += dt;
        if (bd.t > 0.7) {
          bd.t = 0; const sd = seeds.filter((s) => !s.eaten).sort((a, b) => Math.abs(a.x - bd.x) - Math.abs(b.x - bd.x))[0]; if (!sd) return;
          const ok = Math.abs(bd.b - sd.s) < 0.22;
          bd.g.setAttribute('transform', `translate(${sd.x - 34} ${sd.y - 10})`);
          const mk = el('text', { x: sd.x, y: sd.y - 20, 'text-anchor': 'middle', style: 'font:800 26px var(--f-body)', fill: ok ? '#2f9e5b' : '#d9483b' }, fx); mk.textContent = ok ? '✓' : '×';
          if (ok) { sd.eaten = true; sd.e.setAttribute('opacity', 0.15); }
          setTimeout(() => mk.remove(), 700);
        }
      });
    }
    reset(); scene(); graph();
    K.hold(svg, {
      down(q) { if (q.y < 380 || Math.abs(q.x - gx(m)) > 70) return false; return true; },
      move(q) { m = clamp((q.x - X0) / (X1 - X0), 0.05, 0.95); moved = true; graph(); if (!now.classList.contains('done')) now.textContent = '② 세대가 흐르며 초록 막대가 어떻게 되는지 보자'; },
      up() { scene(); },
    }, (e) => K.svgPt(svg, e));
    handle.addEventListener('keydown', (e) => { if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return; e.preventDefault(); e.stopPropagation(); m = clamp(m + (e.key === 'ArrowRight' ? 0.05 : -0.05), 0.05, 0.95); moved = true; graph(); });
    const tk = K.ticker((dt) => { timer += dt; peck(dt); if (timer > 1.1) { timer = 0; generation(); } });
    root._bk = { set: (v) => { m = v; moved = true; graph(); }, gens: (n) => { for (let i = 0; i < n; i++) generation(); } };
    return { setActive(on) { if (on && !K.reduce) tk.start(); else tk.stop(); } };
  }
  window.EvBeak = { mount };
})();
