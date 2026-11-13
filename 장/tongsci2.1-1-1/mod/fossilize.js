/* 1차시 «화석이 되기까지»(교과서 14쪽 그림 I-1): 바다 밑 단면. 시간 손잡이를 돌리면(시계 방향 = 시간이 흐름)
   생물이 죽어 가라앉고 → 퇴적물에 묻히고 → 층이 쌓여 굳고 → 땅이 솟고 → 깎여 화석이 드러난다. 그림 아래 띠에 지금 단계가 켜진다.
   생물(단단한 껍데기의 조개 / 몸이 부드러운 해파리)과 묻히는 빠르기(빨리 / 천천히)를 바꿔 끝까지 돌리면 실험 기록표에 결과가 남는다.
   해 볼 일(체험: 앞 설명 장의 조건 확인): ① 조개·빨리 ② 해파리 ③ 조개·천천히 → 셋 다 끝나면 «알게 된 것»(L1 틀).
   FzForm.mount(root) → {} · 시험용 root._fz = { p(0~1), kind(k), speed(0~1), rec } */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a), 0, 1);
  const STEPS = [
    { k: 'live', at: 0, s: '살아 있음', d: '바다 밑에서 조개가 살아간다. 손잡이를 시계 방향으로 돌려 시간을 보내 보자.' },
    { k: 'die', at: 0.06, s: '가라앉음', d: '죽은 몸이 바닥에 놓였다. 이대로 오래 두면 썩거나 다른 동물에게 먹힌다.' },
    { k: 'bury', at: 0.16, s: '묻힘', d: '진흙과 모래가 위를 덮는다. 빨리 덮일수록 덜 망가진다.' },
    { k: 'pile', at: 0.26, s: '쌓임', d: '오랜 세월 그 위로 퇴적물이 계속 쌓여 무겁게 누른다.' },
    { k: 'rock', at: 0.5, s: '굳음', d: '눌린 퇴적물은 퇴적암이 되고, 묻힌 껍데기도 돌처럼 바뀐다.' },
    { k: 'up', at: 0.62, s: '솟음', d: '땅이 움직여 바다 밑이던 지층이 물 위로 솟아오른다.' },
    { k: 'erode', at: 0.8, s: '깎여 드러남', d: '비와 바람이 위층을 깎아 내면 묻혀 있던 것이 땅 위로 나온다.' },
  ];
  const ROW = { 'clam-fast': '조개 · 빨리 묻힘', jelly: '해파리', 'clam-slow': '조개 · 천천히 묻힘' };

  function defs(svg) {
    const d = el('defs', {}, svg);
    const lin = (id, stops) => { const g = el('linearGradient', { id, x1: 0, y1: 0, x2: 0, y2: 1 }, d); stops.forEach(([o, c, op]) => el('stop', { offset: o, 'stop-color': c, 'stop-opacity': op ?? 1 }, g)); };
    const rad = (id, stops) => { const g = el('radialGradient', { id, cx: 0.5, cy: 0.75, r: 0.75 }, d); stops.forEach(([o, c, op]) => el('stop', { offset: o, 'stop-color': c, 'stop-opacity': op ?? 1 }, g)); };
    lin('fzSea', [[0, '#a9dcef'], [0.55, '#5aa2d3'], [1, '#2f6fa3']]);
    rad('fzShell', [[0, '#fffaf0'], [0.6, '#f1dcb4'], [1, '#d2ab72']]);
    rad('fzStone', [[0, '#cfc8bb'], [0.6, '#a59d90'], [1, '#7d766b']]);
    rad('fzBell', [[0, '#ffd9f0', 0.95], [1, '#e48cc4', 0.75]]);
    // 퇴적층 결: 바탕색 + 알갱이 + 얇은 줄(층마다 다른 결)
    const pat = (id, base, ink, w, h, draw) => { const p = el('pattern', { id, patternUnits: 'userSpaceOnUse', width: w, height: h }, d); el('rect', { width: w, height: h, fill: base }, p); draw(p, ink); };
    const sand = (p, ink) => { [[6, 8, 1.6], [22, 20, 2.2], [40, 6, 1.4], [52, 28, 1.8], [14, 34, 1.2], [33, 38, 2]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: ink, opacity: 0.45 }, p)); };
    const mud = (p, ink) => { [[4, 10, 18], [30, 24, 22], [10, 36, 14], [44, 4, 12]].forEach(([x, y, l]) => el('path', { d: `M${x} ${y} h ${l}`, stroke: ink, 'stroke-width': 1.6, opacity: 0.4 }, p)); };
    const pebble = (p, ink) => { sand(p, ink); [[28, 12, 4, 2.6], [50, 34, 3, 2]].forEach(([x, y, rx, ry]) => el('ellipse', { cx: x, cy: y, rx, ry, fill: 'none', stroke: ink, 'stroke-width': 1.2, opacity: 0.5 }, p)); };
    pat('fzL0', '#dcc596', '#7a6440', 60, 44, sand);
    pat('fzL1', '#c9ad7e', '#5d4a2c', 60, 44, mud);
    pat('fzL2', '#e4d2a8', '#7a6440', 60, 44, pebble);
    pat('fzL3', '#bea27a', '#5d4a2c', 60, 44, mud);
    pat('fzBase', '#a9926f', '#4f402b', 80, 46, (p, ink) => { el('path', { d: 'M0 30 q 20 -5 40 0 t 40 0', fill: 'none', stroke: ink, 'stroke-width': 1.8, opacity: 0.35 }, p); sand(p, ink); });
  }

  function mount(root) {
    const svg = root.querySelector('.fz-svg'), msg = root.querySelector('.fz-msg');
    const kindBtns = [...root.querySelectorAll('.fz-kind button')], speedBtns = [...root.querySelectorAll('.fz-speed button')];
    defs(svg);

    // ---- 그림 ----
    el('rect', { class: 'fz-sky', x: 0, y: 0, width: 1000, height: 620 }, svg);
    el('circle', { class: 'fz-sun', cx: 90, cy: 80, r: 40 }, svg);
    const sea = el('rect', { x: 0, y: 190, width: 1000, height: 430, fill: 'url(#fzSea)' }, svg);
    const waves = el('path', { class: 'fz-wave', d: 'M0 190 q 25 -10 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0 t 50 0' }, svg);
    const rays = el('g', { class: 'fz-rays' }, svg);
    [140, 380, 620].forEach((x) => el('path', { d: `M${x} 195 l -70 290 h 80 z` }, rays));
    const block = el('g', { class: 'fz-block' }, svg);             // 솟아오르는 땅 덩어리
    el('rect', { class: 'fz-base', x: -20, y: 500, width: 1040, height: 400, fill: 'url(#fzBase)' }, block);
    // 바닥의 해초·자갈(묻히면 층에 가려진다)
    const weed = el('g', { class: 'fz-weed' }, block);
    [[120, 1], [250, -1], [760, 1], [880, -1]].forEach(([x, s]) => el('path', { d: `M${x} 500 q ${8 * s} -26 0 -48 q ${-8 * s} -22 ${4 * s} -50 M${x + 14} 500 q ${-6 * s} -20 2 -36 q ${8 * s} -16 0 -32` }, weed));
    const pebbles = el('g', { class: 'fz-pebble' }, block);
    [[330, 497, 14], [610, 498, 10], [690, 496, 16], [180, 498, 9]].forEach(([x, y, r]) => el('ellipse', { cx: x, cy: y, rx: r, ry: r * 0.55 }, pebbles));
    const orgG = el('g', { class: 'fz-org' });
    // 조개(단단한 껍데기): 아래 껍데기 + 열고 닫는 위 껍데기 + 살
    const clam = el('g', { class: 'fz-clam' }, orgG);
    el('path', { class: 'fz-shell', d: 'M-46 0 Q 0 -4 46 0 Q 34 22 0 24 Q -34 22 -46 0 Z' }, clam);
    const flesh = el('ellipse', { class: 'fz-flesh', cx: 0, cy: -2, rx: 30, ry: 7 }, clam);
    const shellT = el('g', { class: 'fz-lid' }, clam);
    el('path', { class: 'fz-shell', d: 'M-46 0 C -46 -30 -26 -46 0 -46 C 26 -46 46 -30 46 0 Q 0 6 -46 0 Z' }, shellT);
    [-0.95, -0.66, -0.38, -0.12, 0.12, 0.38, 0.66, 0.95].forEach((t) => el('path', { class: 'fz-rib', d: `M0 2 Q ${t * 30} -20 ${t * 44} ${-42 + Math.abs(t) * 22}` }, shellT));
    [16, 30].forEach((r) => el('path', { class: 'fz-band', d: `M${-r * 1.15} -1 C ${-r * 1.15} ${-r * 0.8} ${-r * 0.6} ${-r * 1.15} 0 ${-r * 1.15} C ${r * 0.6} ${-r * 1.15} ${r * 1.15} ${-r * 0.8} ${r * 1.15} -1` }, shellT));
    el('path', { class: 'fz-hinge', d: 'M-8 1 Q 0 6 8 1' }, shellT);
    // 해파리(부드러운 몸)
    const jelly = el('g', { class: 'fz-jelly' }, orgG);
    const tent = el('g', { class: 'fz-tent' }, jelly);
    [-26, -12, 2, 16, 28].forEach((x, i) => el('path', { d: `M${x} -2 q ${i % 2 ? 8 : -8} 22 0 44 q ${i % 2 ? -8 : 8} 22 0 44` }, tent));
    el('path', { class: 'fz-bell', d: 'M-40 0 Q -40 -48 0 -50 Q 40 -48 40 0 Q 20 -8 0 0 Q -20 -8 -40 0 Z' }, jelly);
    el('path', { class: 'fz-gloss', d: 'M-24 -24 Q -18 -40 0 -42' }, jelly);
    // 쌓이는 퇴적층 넷(맨 아래가 화석을 덮는 층)
    const layerG = el('g', { class: 'fz-layers' }, block);
    const layers = [0, 1, 2, 3].map((i) => {
      const g = el('g', {}, layerG);
      el('rect', { x: -20, y: 500 - (i + 1) * 52, width: 1040, height: 52, fill: `url(#fzL${i})` }, g);
      el('path', { class: 'fz-ll', d: `M-20 ${500 - (i + 1) * 52} H 1020` }, g);
      return { g };
    });
    layerG.after(orgG);   // 단면이므로 묻힌 생물도 층 속에 보인다
    // 깎는 비·바람
    const erodeMask = el('rect', { class: 'fz-air', x: -20, y: 0, width: 1040, height: 0 }, block);
    const land = el('path', { class: 'fz-grass', d: 'M-20 0 H 1020' }, block);
    const rain = el('g', { class: 'fz-rain' }, svg);
    for (let i = 0; i < 26; i++) el('path', { d: `M${40 + i * 37} ${20 + (i % 5) * 18} l -10 26` }, rain);
    // 찾는 사람
    const finder = el('g', { class: 'fz-finder' }, svg);
    el('circle', { class: 'fz-face', cx: 0, cy: -92, r: 13 }, finder);
    el('path', { class: 'fz-body', d: 'M-14 -76 h 28 v 40 h -28 z' }, finder);
    el('path', { class: 'fz-leg', d: 'M-8 -36 v 36 M 8 -36 v 36 M 14 -70 l 26 18' }, finder);
    el('path', { class: 'fz-ham', d: 'M36 -60 l 10 16 M 32 -56 l 14 -8' }, finder);
    const found = el('g', { class: 'fz-found' }, svg);
    el('rect', { x: -80, y: -26, width: 160, height: 44, rx: 22 }, found); el('text', { y: 5 }, found).textContent = '화석 발견!';
    const lost = el('g', { class: 'fz-found fz-lost' }, svg);
    const lostR = el('rect', { x: -170, y: -26, width: 340, height: 44, rx: 22 }, lost); const lostT = el('text', { y: 5 }, lost);
    // 시간의 흐름 띠(그림 아래)
    const strip = el('g', { class: 'fz-strip' }, svg);
    const widths = STEPS.map((s) => s.s.length * 22 + 30), gap = 26, total = widths.reduce((a, b) => a + b, 0) + gap * (STEPS.length - 1);
    let sx = (1000 - total) / 2;
    el('rect', { class: 'fz-strip-bg', x: sx - 14, y: 556, width: total + 28, height: 56, rx: 28 }, strip);
    const pills = STEPS.map((s, i) => {
      const g = el('g', { class: 'fz-pill' }, strip);
      el('rect', { x: sx, y: 564, width: widths[i], height: 40, rx: 20 }, g);
      el('text', { x: sx + widths[i] / 2, y: 592 }, g).textContent = s.s;
      if (i < STEPS.length - 1) el('path', { class: 'fz-sarr', d: `M${sx + widths[i] + 5} 584 h 14 m -6 -6 l 6 6 l -6 6` }, strip);
      sx += widths[i] + gap;
      return g;
    });
    // 시간 손잡이
    const dial = el('g', { class: 'fz-dial', tabindex: 0, role: 'slider', 'aria-label': '시간 손잡이: 시계 방향으로 돌리면 시간이 흐른다. 화살표 키로도 돌린다' }, svg);
    el('circle', { class: 'fz-dbase', cx: 905, cy: 95, r: 70 }, dial);
    const spin = el('g', { class: 'dl-spin' }, dial);
    el('path', { class: 'fz-arm', d: 'M905 95 L 905 40' }, spin); el('circle', { class: 'fz-knob', cx: 905, cy: 40, r: 16 }, spin);
    el('circle', { class: 'fz-hub', cx: 905, cy: 95, r: 12 }, dial);
    el('text', { class: 'fz-dt', x: 905, y: 212 }, svg).textContent = '시간 손잡이';
    const arc = el('path', { class: 'fz-arc', d: '' }, svg);

    const OX = 470, OY = 500;   // 생물이 놓이는 바닥 자리
    let kind = 'clam', speed = 0.9, p = 0;
    const rec = {};
    function decayOf() {
      // 묻히기 전까지 드러나 있던 시간 × 썩는 빠르기
      const exposed = seg(p, 0.08, 0.16 + (1 - speed) * 0.22);
      const rate = kind === 'clam' ? (1 - speed) * 1.25 : 1.6 - speed * 0.75;
      return clamp(exposed * rate, 0, 1);
    }
    function ui() {
      const fast = rec['clam-fast'] !== undefined, jel = rec.jelly !== undefined, slow = rec['clam-slow'] !== undefined;
      const all = fast && jel && slow;
      window.L1.steps(root, all ? 0 : !fast ? 1 : !jel ? 2 : 3, [fast ? 1 : 0, jel ? 2 : 0, slow ? 3 : 0]);
      Object.keys(ROW).forEach((k) => {
        const tr = root.querySelector(`.fz-log tr[data-r="${k}"]`), td = tr.querySelector('.res');
        tr.className = rec[k] === undefined ? '' : rec[k] ? 'yes' : 'no';
        td.textContent = rec[k] === undefined ? '?' : rec[k] ? '남았다' : '안 남았다';
      });
      window.L1.done(root, all);
    }
    function render() {
      const live = p < 0.06, d = decayOf();
      const sink = seg(p, 0.03, 0.09);
      const y0 = kind === 'jelly' ? OY - 200 : OY - 2;
      const y = y0 + (OY - 4 - y0) * sink;
      orgG.setAttribute('transform', `translate(${OX} ${y}) scale(1.6)`);
      clam.style.display = kind === 'clam' ? '' : 'none'; jelly.style.display = kind === 'jelly' ? '' : 'none';
      shellT.setAttribute('transform', live ? 'rotate(-10 -46 0)' : 'rotate(0)');
      flesh.style.opacity = String(kind === 'clam' ? clamp(1 - seg(p, 0.07, 0.2) * 1.4, 0, 1) : 0);
      tent.setAttribute('transform', `scale(1 ${kind === 'jelly' ? 1 - sink * 0.75 : 1})`);
      // 썩음: 단단한 껍데기는 오래 버틴다
      const keep = kind === 'clam' ? 1 - Math.max(0, d - 0.35) / 0.65 : 1 - d;
      orgG.style.opacity = String(clamp(keep, 0, 1));
      const stone = seg(p, 0.5, 0.62);
      orgG.classList.toggle('stone', stone > 0.5);
      // 퇴적층
      const pile = seg(p, 0.16 + (1 - speed) * 0.22, 0.5);
      layers.forEach((L, i) => { const f = clamp(pile * 4 - i, 0, 1); L.g.style.opacity = String(f); L.g.setAttribute('transform', `translate(0 ${(1 - f) * -30})`); });
      layerG.classList.toggle('hard', stone > 0.5);
      // 융기: 덩어리 전체가 물 위로
      const up = seg(p, 0.62, 0.8), lift = -150 * up;
      block.setAttribute('transform', `translate(0 ${lift})`);
      const top = 500 - 4 * 52;
      // 침식: 위에서부터 깎인다(화석 층 바로 위까지)
      const er = seg(p, 0.8, 0.97), cut = top + er * (4 * 52 - 46);
      erodeMask.setAttribute('y', top - 400); erodeMask.setAttribute('height', String(Math.max(0, cut - (top - 400))));
      land.setAttribute('d', `M-20 ${cut} H 1020`); land.style.opacity = String(up > 0.7 ? 1 : 0);
      rain.style.opacity = String(er > 0 && er < 1 ? 0.9 : 0);
      sea.setAttribute('y', String(190 + 420 * up)); waves.setAttribute('transform', `translate(0 ${420 * up})`); rays.style.opacity = String(1 - up);
      const surf = OY + lift;
      const show = er >= 0.97, ok = keep > 0.35;
      finder.setAttribute('transform', `translate(${OX + 120} ${cut + lift + 2})`); finder.style.opacity = String(show ? 1 : 0);
      found.setAttribute('transform', `translate(${OX} ${surf - 80})`); found.style.opacity = String(show && ok ? 1 : 0);
      lostT.textContent = kind === 'jelly' ? '부드러운 몸은 썩어 남지 않았다' : '묻히기 전에 부서져 남지 않았다';
      const lw = lostT.textContent.length * 22 + 40;
      lostR.setAttribute('width', String(lw)); lostR.setAttribute('x', String(-lw / 2));
      lost.setAttribute('transform', `translate(${OX} ${surf - 110})`); lost.style.opacity = String(show && !ok ? 1 : 0);
      const a = p * 2 * Math.PI * 0.999, r = 82, x1 = 905 + r * Math.sin(a), y1 = 95 - r * Math.cos(a);
      arc.setAttribute('d', p > 0.002 ? `M905 ${95 - r} A ${r} ${r} 0 ${a > Math.PI ? 1 : 0} 1 ${x1.toFixed(1)} ${y1.toFixed(1)}` : '');
      // 단계 띠와 한 줄 풀이
      let cur = 0; STEPS.forEach((s, i) => { if (p >= s.at) cur = i; });
      pills.forEach((g, i) => { g.classList.toggle('on', i < cur); g.classList.toggle('cur', i === cur); });
      let m = STEPS[cur].d;
      if (cur >= 2 && cur < 6 && keep < 0.35) m = kind === 'jelly' ? '부드러운 몸은 덮이기도 전에 거의 썩어 버렸다.' : '너무 늦게 덮여 껍데기가 부서지고 흩어졌다.';
      if (show) {
        const key = kind === 'jelly' ? 'jelly' : speed > 0.5 ? 'clam-fast' : 'clam-slow';
        if (rec[key] !== ok) { rec[key] = ok; ui(); }
        m = ok ? '단단한 껍데기가 돌처럼 굳어 그대로 남았다. 이것이 화석이다.'
          : kind === 'jelly' ? '몸이 부드러운 생물은 화석으로 남기 어렵다.' : '천천히 묻히면 그동안 망가져 남기 어렵다.';
        const next = Object.keys(ROW).find((k) => rec[k] === undefined);
        if (next) m += ` 이제 «${ROW[next]}»으로 해 보자.`;
      }
      msg.textContent = m;
    }
    const dl = window.Scene3D.dial(dial, 905, 95, { max: 720, v0: 0, onChange: (v) => { p = v; render(); } });
    const pick = (btns, b) => btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    kindBtns.forEach((b) => b.addEventListener('click', () => { kind = b.dataset.k; pick(kindBtns, b); dl.set(0); }));
    speedBtns.forEach((b) => b.addEventListener('click', () => { speed = Number(b.dataset.v); pick(speedBtns, b); dl.set(0); }));
    render(); ui();
    root._fz = {
      p: (v) => dl.set(v), kind: (k) => kindBtns.find((b) => b.dataset.k === k).click(),
      speed: (v) => speedBtns.find((b) => (Number(b.dataset.v) > 0.5) === (v > 0.5)).click(),
      get rec() { return { ...rec }; },
    };
    return {};
  }
  window.FzForm = { mount };
})();
