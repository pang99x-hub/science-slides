/* 1차시 3장 종다양성(교과서 27쪽): 넓이가 같은 풀밭 (가)(나)(다)에서 날아다니는 곤충을 포충망으로 쓸어 잡는다.
   잡힌 곤충은 표에 종 수·개체수·비율 막대로 쌓인다. 개체수는 이해를 돕기 위한 예:
   (가) 4종 13·1·1·1  (나) 4종 4·4·4·4  (다) 6종 3·3·3·3·2·2 — 모두 16마리. */
(function () {
  'use strict';
  const { el, hold, clamp, rand } = window.Kit;
  const W = 1056, H = 700;
  const SP = [
    { k: 'w', name: '흰나비', c: '#f4f1e4', kind: 'fly' },
    { k: 'y', name: '노랑나비', c: '#f2c230', kind: 'fly' },
    { k: 'b', name: '꿀벌', c: '#e9a21a', kind: 'bee' },
    { k: 'l', name: '무당벌레', c: '#d6402f', kind: 'bug' },
    { k: 'g', name: '메뚜기', c: '#7aa43a', kind: 'hop' },
    { k: 'd', name: '잠자리', c: '#3a78c2', kind: 'drag' },
  ];
  const PLOTS = { ga: [13, 1, 1, 1, 0, 0], na: [4, 4, 4, 4, 0, 0], da: [3, 3, 3, 3, 2, 2] };
  const PN = { ga: '(가)', na: '(나)', da: '(다)' };

  function bug(p, s) {
    const g = el('g', { class: 'md-bug' }, p), c = s.c;
    if (s.kind === 'fly') { const w = el('g', { class: 'md-wing' }, g); el('path', { d: 'M0 0 C -26 -26 -30 4 -6 6 C -24 22 -6 26 0 4 Z', fill: c }, w); el('path', { d: 'M0 0 C 26 -26 30 4 6 6 C 24 22 6 26 0 4 Z', fill: c }, w); el('path', { d: 'M0 -10 v 22', class: 'md-body' }, g); }
    if (s.kind === 'bee') { el('ellipse', { rx: 14, ry: 9, fill: c, class: 'md-ln' }, g); el('path', { d: 'M-4 -9 v 18 M4 -9 v 18', class: 'md-band' }, g); const w = el('g', { class: 'md-wing' }, g); el('ellipse', { cx: -2, cy: -14, rx: 8, ry: 6, class: 'md-glass' }, w); el('ellipse', { cx: 6, cy: -13, rx: 7, ry: 5, class: 'md-glass' }, w); }
    if (s.kind === 'bug') { el('circle', { r: 12, fill: c, class: 'md-ln' }, g); el('path', { d: 'M0 -12 v 24', class: 'md-ln' }, g); for (const [a, b] of [[-5, -3], [5, -3], [-5, 5], [5, 5]]) el('circle', { cx: a, cy: b, r: 2.5, fill: '#1d2433' }, g); el('circle', { cy: -13, r: 5, fill: '#1d2433' }, g); }
    if (s.kind === 'hop') { el('path', { d: 'M-18 4 q 16 -12 34 -4 q -16 10 -34 4 z', fill: c, class: 'md-ln' }, g); el('path', { d: 'M-2 2 l 8 -14 l 10 18', class: 'md-leg' }, g); }
    if (s.kind === 'drag') { el('path', { d: 'M-22 0 h 34', stroke: c, 'stroke-width': 6, 'stroke-linecap': 'round' }, g); const w = el('g', { class: 'md-wing' }, g); for (const [a, b] of [[4, -1], [4, 1], [-4, -1], [-4, 1]]) el('ellipse', { cx: a, cy: b * 12, rx: 5, ry: 13, class: 'md-glass' }, w); el('circle', { cx: 14, r: 5, fill: c, class: 'md-ln' }, g); }
    return g;
  }

  function mount(root) {
    const svg = root.querySelector('.md-svg'), now = root.querySelector('.md-now'), segs = [...root.querySelectorAll('.md-seg button')];
    const rows = Object.fromEntries(Object.keys(PLOTS).map((k) => [k, root.querySelector(`.md-tr[data-p="${k}"]`)]));
    const verdict = root.querySelector('.md-verdict');
    el('rect', { class: 'md-sky', width: W, height: H }, svg);
    el('path', { class: 'md-grass', d: `M0 150 Q 260 120 528 140 T ${W} 130 V ${H} H 0 Z` }, svg);
    const r0 = rand(3);
    const flowers = el('g', {}, svg);
    for (let i = 0; i < 70; i++) { const x = r0() * W, y = 170 + r0() * (H - 190); el('path', { class: 'md-blade', d: `M${x.toFixed(0)} ${y.toFixed(0)} q ${(4 - r0() * 8).toFixed(0)} -16 ${(6 - r0() * 12).toFixed(0)} -28` }, flowers); if (i % 4 === 0) el('circle', { class: 'md-flower', cx: x.toFixed(0), cy: (y - 28).toFixed(0), r: 6, fill: ['#f7f2e8', '#f1b7cf', '#f7d64a'][i % 3] }, flowers); }
    const plotName = el('text', { class: 'md-pname', x: 30, y: 60 }, svg);
    const jar = el('g', { class: 'md-jar', transform: `translate(${W - 120} 40)` }, svg);
    el('rect', { x: 0, y: 0, width: 96, height: 76, rx: 10, class: 'md-jarb' }, jar); const jarN = el('text', { x: 48, y: 50, class: 'md-jarn' }, jar);
    const swarm = el('g', {}, svg);
    const net = el('g', { class: 'md-net', transform: 'translate(-300 -300)' }, svg);
    el('path', { d: 'M40 40 L 140 140', class: 'md-pole' }, net); el('circle', { r: 56, class: 'md-hoop' }, net); el('path', { d: 'M-40 -40 q 40 70 80 0', class: 'md-mesh' }, net);
    const trail = el('path', { class: 'md-trail', d: '' }, svg);

    const state = {}; let plot = 'ga', bugs = [], pts = [];
    Object.keys(PLOTS).forEach((k) => { state[k] = PLOTS[k].map(() => 0); });
    function spawn() {
      swarm.innerHTML = ''; const rnd = rand({ ga: 11, na: 22, da: 33 }[plot]);
      bugs = [];
      PLOTS[plot].forEach((n, i) => { for (let j = state[plot][i]; j < n; j++) { const g = bug(swarm, SP[i]); bugs.push({ i, g, x: 60 + rnd() * (W - 200), y: 190 + rnd() * (H - 240), a: rnd() * 6.28, sp: 40 + rnd() * 50, t: rnd() * 10 }); } });
      plotName.textContent = `풀밭 ${PN[plot]} · 넓이는 셋 다 같다`;
      draw();
    }
    function draw() { bugs.forEach((b) => b.g.setAttribute('transform', `translate(${b.x.toFixed(1)} ${b.y.toFixed(1)}) scale(${Math.cos(b.a) < 0 ? -1.7 : 1.7} 1.7)`)); jarN.textContent = `${state[plot].reduce((a, c) => a + c, 0)}마리`; }
    function table() {
      Object.keys(PLOTS).forEach((k) => {
        const got = state[k], tot = got.reduce((a, c) => a + c, 0), sp = got.filter((c) => c > 0).length, tr = rows[k];
        tr.querySelector('.md-n').textContent = tot ? `${tot}` : '–';
        tr.querySelector('.md-s').textContent = tot ? `${sp}` : '–';
        const bar = tr.querySelector('.md-bar'); bar.innerHTML = '';
        got.forEach((c, i) => { if (!c) return; const s = document.createElement('i'); s.style.flexGrow = c; s.style.background = SP[i].c; s.title = `${SP[i].name} ${c}`; s.textContent = c; bar.appendChild(s); });
        tr.classList.toggle('done', tot === 16);
      });
      const done = Object.keys(PLOTS).filter((k) => state[k].reduce((a, c) => a + c, 0) === 16);
      verdict.innerHTML = done.length < 3 ? `잡은 풀밭 ${done.length}/3 — 세 풀밭을 모두 쓸어 보자`
        : '<b>(다) &gt; (나) &gt; (가)</b> · (가)와 (나)는 종 수가 같아도 (나)가 더 고르다. (다)는 종 수도 많고 고르다.';
    }
    function sweep(p) {
      net.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
      pts.push(p); if (pts.length > 14) pts.shift();
      trail.setAttribute('d', pts.length > 1 ? 'M' + pts.map((q) => `${q.x.toFixed(0)} ${q.y.toFixed(0)}`).join(' L ') : '');
      const fast = pts.length > 2 && Math.hypot(p.x - pts[pts.length - 3].x, p.y - pts[pts.length - 3].y) > 14;
      if (!fast) return;
      bugs = bugs.filter((b) => {
        if (Math.hypot(b.x - p.x, b.y - p.y) > 60) return true;
        state[plot][b.i]++; b.g.classList.add('caught'); setTimeout(() => b.g.remove(), 380);
        return false;
      });
      draw(); table();
      const left = bugs.length;
      now.textContent = left ? `망을 휘둘러 곤충을 잡자 · 남은 곤충 ${left}마리` : segs.every((s) => state[s.dataset.p].reduce((a, c) => a + c, 0) === 16) ? '세 풀밭을 견주어 보자' : '다 잡았다 — 다른 풀밭을 골라 보자';
    }
    hold(svg, { hover: (p) => net.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`), down: (p) => { pts = [p]; sweep(p); }, move: sweep, up: () => { pts = []; trail.setAttribute('d', ''); } }, svg);
    segs.forEach((b) => b.addEventListener('click', () => { plot = b.dataset.p; segs.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); spawn(); now.textContent = bugs.length ? '망을 휘둘러 곤충을 잡자' : '이 풀밭은 다 잡았다'; }));
    const loop = window.Kit.ticker((dt) => {
      bugs.forEach((b) => {
        b.t += dt; b.a += (Math.sin(b.t * 1.7 + b.sp) * 1.6) * dt;
        const v = SP[b.i].kind === 'bug' ? 0.4 : SP[b.i].kind === 'hop' ? (Math.sin(b.t * 3) > 0.7 ? 3 : 0.1) : 1;
        b.x += Math.cos(b.a) * b.sp * v * dt; b.y += Math.sin(b.a) * b.sp * 0.6 * v * dt;
        if (b.x < 40 || b.x > W - 160) b.a = Math.PI - b.a; if (b.y < 180 || b.y > H - 30) b.a = -b.a;
        b.x = clamp(b.x, 40, W - 160); b.y = clamp(b.y, 180, H - 30);
        b.g.classList.toggle('flap', Math.sin(b.t * 14) > 0);
      });
      draw();
    });
    spawn(); table();
    root._meadow = { pick(k) { segs.find((s) => s.dataset.p === k).click(); }, catchAll() { bugs.forEach((b) => { state[plot][b.i]++; b.g.remove(); }); bugs = []; draw(); table(); } };
    return { setActive(on) { if (on) loop.start(); else loop.stop(); } };
  }
  window.Meadow = { mount };
})();
