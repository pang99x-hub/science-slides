/* 1차시 해 보기 «지질 시대의 환경 추론하기»(교과서 15쪽): 환경 패드(가로 = 물: 메마른 땅 → 축축한 땅 → 얕은 바다 → 깊은 바다,
   세로 = 기온: 추움 → 따뜻함)에서 점을 끌면 왼쪽 풍경이 그 환경으로 바뀌고, 오늘날의 고사리·조개·산호가 그곳에서 잘 사는지가 보인다.
   화석 카드(가)(나)(다)를 고르고, 그 생물이 잘 사는 환경을 찾아 점을 잠시 머물게 하면 «화석이 나온 지층이 쌓일 때의 환경»이 기록된다.
   HbPad.mount(root) → {} · 시험용 root._hb = { set(물 0~1, 기온 0~1), pick(k) } */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const mix = (a, b, t) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  // 잘 사는 곳: 물 w(0~1), 기온 c(0~1)
  const LIVE = {
    fern: (w, c) => w > 0.24 && w < 0.5 && c > 0.55,
    clam: (w, c) => w >= 0.5 && w < 0.72 && c > 0.4,
    coral: (w, c) => w >= 0.52 && w < 0.7 && c > 0.72,
  };
  const CARDS = {
    ga: { org: 'fern', env: '따뜻하고 습한 육지', where: '강원 태백의 지층' },
    na: { org: 'clam', env: '얕고 따뜻한 바다', where: '제주 서귀포의 지층' },
    da: { org: 'clam', env: '얕은 바다 → 뒤에 솟아오름', where: '강원 태백 구문소 산골짜기의 바위' },
  };
  const ENV = (w, c) => {
    const t = c < 0.3 ? '춥고' : c < 0.55 ? '서늘하고' : '따뜻하고';
    if (w < 0.25) return `${t} 메마른 땅`;
    if (w < 0.5) return `${t} 축축한 땅`;
    if (w < 0.72) return `${t} 얕은 바다(갯벌·바닷가)`;
    return `${c < 0.55 ? '차갑고' : '따뜻하고'} 깊은 바다`;
  };

  function fern(p, x, y, s) {
    const g = el('g', { class: 'hb-fern', transform: `translate(${x} ${y}) scale(${s})` }, p);
    el('ellipse', { class: 'hb-shadow', cx: 0, cy: 4, rx: 70, ry: 10 }, g);
    [-58, -32, -10, 12, 34, 60].forEach((a) => {
      const f = el('g', { transform: `rotate(${a})` }, g);
      const L = 140 - Math.abs(a) * 0.55, bend = a > 0 ? 26 : -26;
      el('path', { class: 'hb-stem', d: `M0 0 Q ${bend * 0.4} ${-L * 0.55} ${bend} ${-L}` }, f);
      for (let k = 1; k < 12; k++) {
        const t = k / 12, yy = -L * t, xx = bend * t * t, w = 26 * (1 - t * 0.85);
        el('path', { class: 'hb-leaf', d: `M${xx} ${yy} q ${-w * 0.5} -2 ${-w} -10 q ${w * 0.6} -1 ${w} 10 Z` }, f);
        el('path', { class: 'hb-leaf', d: `M${xx} ${yy} q ${w * 0.5} -2 ${w} -10 q ${-w * 0.6} -1 ${-w} 10 Z` }, f);
      }
      el('circle', { class: 'hb-curl', cx: bend, cy: -L, r: 5 }, f);
    });
    return g;
  }
  function clam(p, x, y, s) {
    const g = el('g', { class: 'hb-clam', transform: `translate(${x} ${y}) scale(${s})` }, p);
    el('ellipse', { class: 'hb-shadow', cx: 0, cy: 3, rx: 34, ry: 6 }, g);
    el('path', { class: 'hb-shell', d: 'M-32 0 Q -30 -32 0 -34 Q 30 -32 32 0 Q 0 6 -32 0 Z' }, g);
    [-24, -14, -5, 5, 14, 24].forEach((xx) => el('path', { class: 'hb-rib', d: `M0 -1 Q ${xx * 0.5} -18 ${xx * 0.95} -30` }, g));
    [-10, -20].forEach((yy, i) => el('path', { class: 'hb-band', d: `M${-28 + i * 5} ${yy} Q 0 ${yy - 8} ${28 - i * 5} ${yy}` }, g));
    el('path', { class: 'hb-hinge', d: 'M-8 2 Q 0 6 8 2' }, g);
    return g;
  }
  function coral(p, x, y, s) {
    const g = el('g', { class: 'hb-coral', transform: `translate(${x} ${y}) scale(${s})` }, p);
    el('path', { d: 'M0 0 V -40 M0 -24 L -22 -50 V -66 M -22 -54 L -36 -70 M0 -30 L 20 -56 V -74 M 20 -60 L 34 -72 M 0 -40 L -6 -70' }, g);
    [[-22, -66], [-36, -70], [20, -74], [34, -72], [-6, -70]].forEach(([x, y]) => el('circle', { class: 'hb-polyp', cx: x, cy: y, r: 6 }, g));
    return g;
  }

  function mount(root) {
    const svg = root.querySelector('.hb-scene'), pad = root.querySelector('.hb-pad'), now = root.querySelector('.hb-now');
    const envOut = root.querySelector('.hb-env'), msg = root.querySelector('.hb-msg'), cards = [...root.querySelectorAll('.hb-card')];
    // ---- 풍경 ----
    const defs = el('defs', {}, svg);
    const grad = (id, stops, v) => { const g = el('linearGradient', { id, x1: 0, y1: 0, x2: v ? 0 : 1, y2: v ? 1 : 0 }, defs); stops.forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, g)); };
    grad('hbLeaf', [[0, '#7cc25e'], [1, '#2f7a33']], true);
    grad('hbShell', [[0, '#fbf1dc'], [1, '#d9b98a']], true);
    grad('hbShade', [[0, 'rgba(255,255,255,0)'], [1, 'rgba(40,30,20,.18)']], true);
    const sky = el('rect', { x: 0, y: 0, width: 1000, height: 620 }, svg);
    const sun = el('circle', { class: 'hb-sun', cx: 860, cy: 90, r: 46 }, svg);
    const landG = el('g', {}, svg);
    const ground = el('path', { d: 'M0 330 Q 250 300 500 322 T 1000 316 V 620 H 0 Z' }, landG);
    el('path', { d: 'M0 330 Q 250 300 500 322 T 1000 316 V 620 H 0 Z', fill: 'url(#hbShade)' }, landG);
    const stones = el('g', { class: 'hb-stone' }, landG);
    [[90, 520, 22], [260, 560, 14], [470, 540, 26], [640, 585, 16], [900, 530, 20], [380, 600, 12]].forEach(([x, y, r]) => el('ellipse', { cx: x, cy: y, rx: r, ry: r * 0.6 }, stones));
    const cracks = el('g', { class: 'hb-crack' }, landG);
    for (let i = 0; i < 12; i++) el('path', { d: `M${40 + i * 82} ${380 + (i % 3) * 50} l 18 14 l -6 18 l 22 10` }, cracks);
    const puddles = el('g', { class: 'hb-puddle' }, landG);
    [[160, 420, 70], [520, 470, 90], [820, 400, 60]].forEach(([x, y, r]) => el('ellipse', { cx: x, cy: y, rx: r, ry: r * 0.22 }, puddles));
    const grass = el('g', { class: 'hb-grass' }, landG);
    for (let i = 0; i < 40; i++) el('path', { d: `M${12 + i * 25} ${340 + (i % 4) * 4} q 4 -18 10 -24 M ${16 + i * 25} ${340 + (i % 4) * 4} q -6 -14 -12 -18` }, grass);
    const ferns = el('g', {}, landG);
    [[150, 360, 0.9], [330, 350, 1.15], [700, 356, 1], [880, 352, 0.8]].forEach(([x, y, s]) => fern(ferns, x, y, s));
    const seaG = el('g', {}, svg);
    const water = el('rect', { x: 0, y: 120, width: 1000, height: 500 }, seaG);
    const rays = el('g', { class: 'hb-rays' }, seaG);
    [120, 330, 560, 780].forEach((x) => el('path', { d: `M${x} 120 l -60 300 h 70 z` }, rays));
    const floor = el('path', { d: 'M0 470 Q 300 440 520 466 T 1000 458 V 620 H 0 Z' }, seaG);
    const fish = el('g', { class: 'hb-fish' }, seaG);
    [[230, 260, 1], [560, 330, -1], [760, 230, 1]].forEach(([x, y, d]) => { const f = el('g', { transform: `translate(${x} ${y}) scale(${d} 1)` }, fish); el('path', { d: 'M-22 0 Q 0 -14 20 0 Q 0 14 -22 0 Z M-22 0 L -34 -10 V 10 Z' }, f); el('circle', { class: 'eye', cx: 11, cy: -3, r: 2.5 }, f); });
    const clams = el('g', {}, seaG);
    [[180, 470, 1.1], [420, 478, 0.9], [640, 470, 1.2], [900, 462, 0.9]].forEach(([x, y, s]) => clam(clams, x, y, s));
    const corals = el('g', {}, seaG);
    [[290, 470, 1.4], [520, 476, 1.1], [760, 468, 1.5]].forEach(([x, y, s]) => coral(corals, x, y, s));
    const snow = el('g', { class: 'hb-snow' }, svg);
    for (let i = 0; i < 40; i++) el('circle', { cx: (i * 131) % 1000, cy: (i * 71) % 300 + 10, r: 4 }, snow);
    const ice = el('path', { class: 'hb-ice', d: 'M0 112 H 1000 V 132 H 0 Z' }, svg);
    const wave = el('path', { class: 'hb-wl', d: 'M0 120 q 25 -9 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0' }, svg);
    const tag = el('g', { class: 'hb-tag' }, svg); const tagR = el('rect', { x: 16, y: 556, width: 10, height: 46, rx: 23 }, tag); const tagT = el('text', { x: 36, y: 587 }, tag);

    // ---- 패드 ----
    const P = 400;
    el('rect', { class: 'hb-pbg', x: 0, y: 0, width: P, height: P, rx: 10 }, pad);
    [0.25, 0.5, 0.72].forEach((x) => el('path', { class: 'hb-pgrid', d: `M${x * P} 0 V ${P}` }, pad));
    el('path', { class: 'hb-pgrid', d: `M0 ${P / 2} H ${P}` }, pad);
    [['메마른', '땅', 0.125], ['축축한', '땅', 0.375], ['얕은', '바다', 0.61], ['깊은', '바다', 0.86]].forEach(([a, b, x]) => { const t = el('text', { class: 'hb-pl', x: x * P, y: P - 44 }, pad); el('tspan', { x: x * P }, t).textContent = a; el('tspan', { x: x * P, dy: 33 }, t).textContent = b; });
    el('text', { class: 'hb-pl b', x: 10, y: 34, 'text-anchor': 'start' }, pad).textContent = '따뜻함';
    el('text', { class: 'hb-pl b', x: 10, y: P - 96, 'text-anchor': 'start' }, pad).textContent = '추움';
    const trail = el('path', { class: 'hb-trail', d: '' }, pad);
    const knob = el('g', { class: 'hb-knob', tabindex: 0, role: 'slider', 'aria-label': '환경 고르기: 좌우 화살표는 물, 위아래 화살표는 기온' }, pad);
    el('circle', { r: 26 }, knob); el('circle', { class: 'in', r: 9 }, knob);

    let w = 0.12, c = 0.2, card = null, dwell = 0, raf = 0, last = 0;
    const steps = [...root.querySelectorAll('.hb-steps li')], learn = root.querySelector('.hb-learn');
    const NAME = { ga: '고사리', na: '조개', da: '조개' }, AIM = { fern: [0.37, 0.8], clam: [0.61, 0.75] };
    const done = {};
    const pts = [];
    function render() {
      const sea = clamp((w - 0.44) / 0.12, 0, 1), wet = clamp(w / 0.5, 0, 1), depth = clamp((w - 0.5) / 0.5, 0, 1);
      sky.setAttribute('fill', mix('#c9d3dc', '#bfe3f5', c));
      sun.style.opacity = String(0.3 + 0.7 * c); sun.setAttribute('r', String(30 + 22 * c));
      landG.style.opacity = String(1 - sea); seaG.style.opacity = String(sea);
      ground.setAttribute('fill', mix(mix('#d8c49a', '#7aa35a', wet), '#e9edf0', clamp((0.3 - c) / 0.3, 0, 1) * 0.85));
      cracks.style.opacity = String(clamp(1 - wet * 2, 0, 1));
      puddles.style.opacity = String(clamp((wet - 0.5) * 2, 0, 1));
      grass.style.opacity = String(clamp(wet * 1.4 - 0.2, 0, 1) * clamp(c * 2, 0.2, 1));
      water.setAttribute('fill', mix(mix('#9fdbe0', '#1c4a7e', depth), '#7f97ad', clamp((0.4 - c) / 0.4, 0, 1) * 0.6));
      rays.style.opacity = String(clamp(1 - depth * 1.6, 0, 1) * (0.3 + 0.7 * c));
      floor.setAttribute('fill', mix('#e3cf9f', '#4d5a6a', depth));
      floor.setAttribute('transform', `translate(0 ${depth * 40})`);
      snow.style.opacity = String(clamp((0.3 - c) / 0.25, 0, 1));
      ice.style.opacity = String(sea * clamp((0.25 - c) / 0.2, 0, 1));
      wave.style.opacity = String(sea);
      const live = { fern: LIVE.fern(w, c), clam: LIVE.clam(w, c), coral: LIVE.coral(w, c) };
      ferns.classList.toggle('ok', live.fern); clams.classList.toggle('ok', live.clam); corals.classList.toggle('ok', live.coral);
      const env = ENV(w, c);
      tagT.textContent = env; tagR.setAttribute('width', String(env.length * 22 + 40));
      if (envOut) envOut.textContent = env;
      knob.setAttribute('transform', `translate(${w * P} ${(1 - c) * P})`);
      trail.setAttribute('d', pts.length > 1 ? 'M' + pts.map((p) => `${(p[0] * P).toFixed(0)} ${((1 - p[1]) * P).toFixed(0)}`).join(' L ') : '');
      const names = { fern: '고사리', clam: '조개', coral: '산호' };
      const alive = Object.keys(live).filter((k) => live[k]).map((k) => names[k]);
      const all = Object.keys(CARDS).every((k) => done[k]);
      const stepNow = all ? 0 : !card || done[card] ? 1 : 2;
      steps.forEach((li) => { const n = +li.dataset.s; li.classList.toggle('now', n === stepNow); li.classList.toggle('ok', n === 3 ? all : n === 1 ? !!card : n === 2 ? Object.keys(done).length > 0 : false); });
      learn.classList.toggle('on', all);
      if (!card) { now.textContent = ''; msg.textContent = '먼저 오른쪽에서 화석 카드를 하나 골라 보자.'; now.classList.remove('done'); return; }
      const cd = CARDS[card], ok = LIVE[cd.org](w, c), nm = NAME[card];
      now.textContent = done[card] ? `기록! ${nm}는 «${cd.org === 'fern' ? '따뜻하고 습한 육지' : '얕고 따뜻한 바다'}»에서 산다` : ok ? `${nm}가 싱싱해졌다… 잠깐 그대로!` : `${nm}가 시들어 있다`;
      now.classList.toggle('warn', !done[card] && !ok);
      now.classList.toggle('done', !!done[card] || ok);
      let hint = '';
      if (!ok && !done[card]) {
        if (cd.org === 'fern') hint = w >= 0.5 ? '고사리는 뭍에서 자라는 식물이라 바닷물 속에서는 못 산다. 물이 적은 쪽으로!' : w < 0.25 ? '너무 메마르면 고사리가 말라 버린다. 조금 더 축축한 쪽으로!' : '고사리는 추운 곳에서 잘 못 자란다. 더 따뜻한 쪽으로!';
        else hint = w < 0.5 ? '조개는 물속에 사는 동물이라 땅 위에서는 못 산다. 바다 쪽으로!' : w >= 0.72 ? '조개는 깊은 바다보다 얕은 바닷가에 많다. 조금 덜 깊은 쪽으로!' : '너무 차가운 바다에서는 조개가 살기 어렵다. 더 따뜻한 쪽으로!';
      }
      if (hint) { msg.textContent = hint; return; }
      msg.textContent = (alive.length ? `지금 이 환경에서 잘 사는 것: ${alive.join(', ')}` : '지금 이 환경에서는 고사리·조개·산호 모두 살기 어렵다.') + hint;
    }
    function tick(t) {
      raf = 0; const dt = last ? (t - last) / 1000 : 0; last = t;
      if (!card) return;
      const cd = CARDS[card];
      if (!done[card] && LIVE[cd.org](w, c)) { dwell += dt; if (dwell > 0.7) record(); else raf = requestAnimationFrame(tick); } else dwell = 0;
    }
    function kick() { if (!raf) { last = 0; raf = requestAnimationFrame(tick); } }
    function record() {
      done[card] = true; dwell = 0;
      const b = cards.find((x) => x.dataset.k === card); b.classList.add('done');
      b.querySelector('.hb-res').textContent = '→ ' + CARDS[card].env;
      render();
    }
    function set(nw, nc) { w = clamp(nw, 0, 1); c = clamp(nc, 0, 1); pts.push([w, c]); if (pts.length > 40) pts.shift(); render(); kick(); }
    const svgPt = (e) => { const p = pad.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(pad.getScreenCTM().inverse()); };
    let d = null;
    pad.addEventListener('pointerdown', (e) => { d = e.pointerId; try { pad.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ } const q = svgPt(e); set(q.x / P, 1 - q.y / P); });
    pad.addEventListener('pointermove', (e) => { if (d !== e.pointerId) return; const q = svgPt(e); set(q.x / P, 1 - q.y / P); });
    const up = (e) => { if (d === e.pointerId) d = null; };
    pad.addEventListener('pointerup', up); pad.addEventListener('pointercancel', up);
    knob.addEventListener('keydown', (e) => {
      const m = { ArrowLeft: [-0.04, 0], ArrowRight: [0.04, 0], ArrowUp: [0, 0.05], ArrowDown: [0, -0.05] }[e.key];
      if (m) { e.preventDefault(); e.stopPropagation(); set(w + m[0], c + m[1]); }
    });
    cards.forEach((b) => b.addEventListener('click', () => { card = b.dataset.k; cards.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); dwell = 0; render(); kick(); }));
    render();
    root._hb = { set, pick: (k) => cards.find((b) => b.dataset.k === k).click(), get done() { return { ...done }; } };
    return {};
  }
  window.HbPad = { mount };
})();
