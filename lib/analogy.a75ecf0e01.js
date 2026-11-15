/* 2차시 3장(교과서 22~23쪽 탐구 속 물음): 모의실험(왼쪽 도화지)과 자연(오른쪽 풀밭의 딱정벌레)을 한 시간 띠로 묶는다.
   띠 위치 t(0~4): 0→1 늘어놓기/무리, 1→2 집어내기/잡아먹힘, 2→3 같은 색 더하기/자손, 3→4 초록→노랑/돌연변이. 거꾸로 끌면 되감긴다. */
(function () {
  'use strict';
  const K = window.EvKit, { el, clamp } = K;
  const COL = { red: '#d62e3a', green: '#2c9c58', blue: '#2862c8', yellow: '#f4c62c' };
  const SPOTS = [[80, 140, 'red'], [190, 120, 'green'], [300, 150, 'blue'], [410, 130, 'red'], [120, 250, 'blue'], [240, 230, 'red'], [360, 260, 'green'], [450, 240, 'blue'], [90, 360, 'green'], [210, 350, 'blue'], [330, 370, 'red'], [440, 350, 'green']];
  const EAT = [2, 7, 4, 0];      // 눈에 띄는 것부터(파랑·빨강)
  const MUT = 6;                 // 이 초록의 자손 하나가 노랑으로
  const CAP_L = ['초콜릿을 골고루 늘어놓는다', '눈에 띄는 것을 손으로 집어낸다', '남은 수만큼 같은 색을 더한다', '초록 3개를 노랑 3개로 바꾼다'];
  const CAP_R = ['몸 색이 여러 가지인 딱정벌레 무리', '새가 눈에 띄는 벌레를 잡아먹는다', '살아남은 벌레가 자손을 남긴다', '부모에게 없던 노란 벌레가 태어난다'];
  const TX = (t) => 90 + t * 219;

  function choco(p, c) {
    const g = el('g', {}, p);
    el('ellipse', { cx: 3, cy: 6, rx: 19, ry: 14, fill: 'rgba(60,40,10,.25)' }, g);
    const b = el('ellipse', { rx: 19, ry: 17, fill: COL[c], stroke: '#1d2433', 'stroke-width': 1.5 }, g);
    el('ellipse', { cx: -6, cy: -7, rx: 6, ry: 3.5, fill: 'rgba(255,255,255,.55)', transform: 'rotate(-25 -6 -7)' }, g);
    return { g, b };
  }
  function bug(p, c) {
    const g = el('g', {}, p);
    [-1, 1].forEach((s) => [-8, 0, 8].forEach((x) => el('path', { d: `M${x} ${s * 6} l ${x / 3} ${s * 10}`, stroke: '#141414', 'stroke-width': 2.5 }, g)));
    const b = el('ellipse', { rx: 18, ry: 12, fill: COL[c], stroke: '#141414', 'stroke-width': 2 }, g);
    el('circle', { cx: 19, r: 7, fill: '#2a2a2a', stroke: '#141414', 'stroke-width': 2 }, g);
    el('path', { d: 'M-18 0 H 12', stroke: 'rgba(0,0,0,.45)', 'stroke-width': 1.5 }, g);
    return { g, b };
  }

  function mount(root) {
    const svg = root.querySelector('.ev-an-svg'), msg = root.querySelector('.ev-an-msg'), pairs = [...root.querySelectorAll('.ev-pairs li')];
    el('rect', { x: 0, y: 0, width: 1056, height: 600, fill: '#f6f3ea' }, svg);
    // 왼쪽: 책상 + 노란 도화지
    el('rect', { x: 8, y: 50, width: 512, height: 420, rx: 10, fill: '#c9a77c', stroke: '#1d2433', 'stroke-width': 2 }, svg);
    el('rect', { x: 30, y: 70, width: 468, height: 380, fill: '#f7d656', stroke: '#b9952a', 'stroke-width': 2 }, svg);
    // 오른쪽: 마른 풀밭
    el('rect', { x: 536, y: 50, width: 512, height: 420, rx: 10, fill: '#e3cf7a', stroke: '#1d2433', 'stroke-width': 2 }, svg);
    const rr = K.rng(11);
    for (let i = 0; i < 90; i++) { const x = 546 + rr() * 492, y = 70 + rr() * 390; el('path', { d: `M${x} ${y} q ${rr() * 8 - 4} -10 ${rr() * 10 - 5} -18`, stroke: '#b99a3e', 'stroke-width': 2, fill: 'none' }, svg); }
    const capL = el('text', { x: 264, y: 36, 'text-anchor': 'middle', style: 'font:700 21px var(--f-body)', fill: '#1d2433' }, svg);
    const capR = el('text', { x: 792, y: 36, 'text-anchor': 'middle', style: 'font:700 21px var(--f-body)', fill: '#1d2433' }, svg);
    el('text', { x: 20, y: 492, style: 'font:600 16px var(--f-body)', fill: '#7b8597' }, svg).textContent = '모의실험';
    el('text', { x: 1036, y: 492, 'text-anchor': 'end', style: 'font:600 16px var(--f-body)', fill: '#7b8597' }, svg).textContent = '자연';
    const L = SPOTS.map(([x, y, c]) => ({ ...choco(svg, c), x, y, c }));
    const R = SPOTS.map(([x, y, c]) => ({ ...bug(svg, c), x: x + 528, y, c }));
    const surv = SPOTS.map((_, i) => i).filter((i) => !EAT.includes(i));
    const LT = surv.map((i) => ({ ...choco(svg, SPOTS[i][2]), x: SPOTS[i][0] + 26, y: SPOTS[i][1] + 34, i }));
    const RT = surv.map((i) => ({ ...bug(svg, SPOTS[i][2]), x: SPOTS[i][0] + 528 + 30, y: SPOTS[i][1] + 38, i }));
    const glove = el('g', {}, svg);
    el('path', { d: 'M-22 0 v 70 h 44 v -70 Z M-26 -40 h 52 v 44 h -52 Z M-24 -74 h 10 v 36 h -10 Z M-10 -80 h 10 v 42 h -10 Z M4 -80 h 10 v 42 h -10 Z M18 -72 h 10 v 34 h -10 Z', fill: '#eef1f4', stroke: '#1d2433', 'stroke-width': 2.5, 'stroke-linejoin': 'round' }, glove);
    const bird = el('g', {}, svg);
    el('path', { d: 'M0 0 C -30 -40, -70 -30, -90 -10 C -60 -10, -40 0, -20 10 Z', fill: '#7a5434', stroke: '#1d2433', 'stroke-width': 2.5 }, bird);
    el('ellipse', { rx: 36, ry: 20, fill: '#7a5434', stroke: '#1d2433', 'stroke-width': 2.5 }, bird);
    el('circle', { cx: 34, cy: -14, r: 15, fill: '#7a5434', stroke: '#1d2433', 'stroke-width': 2.5 }, bird);
    el('path', { d: 'M46 -18 L 66 -10 L 46 -6 Z', fill: '#d8d0c0', stroke: '#1d2433', 'stroke-width': 2 }, bird);
    el('circle', { cx: 38, cy: -17, r: 3, fill: '#111' }, bird);
    // 시간 띠
    el('rect', { x: 60, y: 520, width: 936, height: 20, rx: 10, fill: '#dfe5e3', stroke: '#1d2433', 'stroke-width': 2 }, svg);
    const fill = el('rect', { x: 60, y: 520, width: 0, height: 20, rx: 10, fill: '#1f5f4a' }, svg);
    const STN = ['시작', '늘어놓기', '집어내기', '같은 색 더하기', '초록→노랑'];
    const stn = STN.map((s, i) => { el('circle', { cx: TX(i), cy: 530, r: 9, fill: '#fff', stroke: '#1d2433', 'stroke-width': 2 }, svg); const t = el('text', { x: TX(i), y: 580, 'text-anchor': 'middle', style: 'font:700 18px var(--f-body)', fill: '#4b566a' }, svg); t.textContent = s; return t; });
    const hand = el('g', { tabindex: '0', role: 'slider', 'aria-label': '시간 띠 손잡이', 'aria-valuemin': '0', 'aria-valuemax': '4', style: 'cursor:grab' }, svg);
    el('circle', { r: 24, fill: '#f2c230', stroke: '#1d2433', 'stroke-width': 3 }, hand);
    el('path', { d: 'M-8 -8 v16 M0 -8 v16 M8 -8 v16', stroke: '#1d2433', 'stroke-width': 2.5 }, hand);
    let t = 0;
    const seg = (k) => clamp(t - k, 0, 1);
    function render() {
      const u0 = seg(0), u1 = seg(1), u2 = seg(2), u3 = seg(3);
      hand.setAttribute('transform', `translate(${TX(t)} 530)`); hand.setAttribute('aria-valuenow', t.toFixed(1));
      fill.setAttribute('width', TX(t) - 60);
      const k = Math.min(3, Math.floor(t)); capL.textContent = CAP_L[k]; capR.textContent = CAP_R[k];
      stn.forEach((s, i) => s.setAttribute('fill', t >= i - 0.05 ? '#1d2433' : '#9aa3ae'));
      L.forEach((o, i) => {
        const d = clamp(u0 * 1.6 - i * 0.05, 0, 1), y = K.lerp(o.y - 260, o.y, d * d);
        const e = EAT.indexOf(i), pe = e < 0 ? 0 : clamp(u1 * 4 - e, 0, 1);
        const lp = clamp((pe - 0.5) * 2, 0, 1); o.g.setAttribute('transform', `translate(${o.x} ${y + lp * 200})`); o.g.setAttribute('opacity', d <= 0 || pe >= 1 ? 0 : 1);
      });
      R.forEach((o, i) => {
        const d = clamp(u0 * 1.6 - i * 0.05, 0, 1), x = K.lerp(o.x + (i % 2 ? 260 : -260), o.x, d);
        const e = EAT.indexOf(i), pe = e < 0 ? 0 : clamp(u1 * 4 - e, 0, 1);
        const lp = clamp((pe - 0.5) * 2, 0, 1); o.g.setAttribute('transform', `translate(${x + lp * 60} ${o.y - lp * 160}) rotate(${(i * 37) % 360})`); o.g.setAttribute('opacity', (d <= 0 || pe >= 1 ? 0 : 1) * clamp((x - 520) / 40, 0, 1));
      });
      LT.forEach((o, j) => { const s = clamp(u2 * 3 - j * 0.25, 0, 1); o.g.setAttribute('transform', `translate(${o.x} ${o.y}) scale(${s})`); o.g.setAttribute('opacity', s > 0 ? 1 : 0); });
      RT.forEach((o, j) => { const s = clamp(u2 * 3 - j * 0.25, 0, 1); o.g.setAttribute('transform', `translate(${o.x} ${o.y}) scale(${0.65 * s}) rotate(${(j * 53) % 360})`); o.g.setAttribute('opacity', s > 0 ? 1 : 0); });
      // 돌연변이: 그 초록의 자손이 노랑으로
      const mi = surv.indexOf(MUT), c = K.hex(K.mix([44, 156, 88], [244, 198, 44], u3));
      LT[mi].b.setAttribute('fill', c); RT[mi].b.setAttribute('fill', c);
      // 장갑과 새
      const e = Math.min(3, Math.floor(u1 * 4)), le = u1 * 4 - e, on = u1 > 0 && u1 < 1;
      const tl = L[EAT[e]], tr = R[EAT[e]];
      glove.setAttribute('opacity', on ? 1 : 0); bird.setAttribute('opacity', on ? 1 : 0);
      if (on) {
        glove.setAttribute('transform', `translate(${tl.x} ${tl.y + 40 + Math.abs(le - 0.5) * 2 * 200})`);
        bird.setAttribute('transform', `translate(${tr.x - 60 + (le - 0.5) * 240} ${tr.y - 30 - Math.abs(le - 0.5) * 2 * 160})`);
      }
      pairs.forEach((li, i) => li.classList.toggle('on', t >= i + 0.9));
      const msgs = ['띠를 문지르기 전에 먼저 짐작해 보자. 왼쪽의 각 과정은 오른쪽에서 무엇일까?', '초콜릿 하나 = 개체 하나. 색이 여러 가지 = <b>변이</b>가 다양하다.', '손으로 집기 = <b>포식자에게 잡아먹힘</b>. 눈에 띄는 것이 먼저 사라진다.', '같은 색 더하기 = 살아남은 개체가 <b>자손</b>을 남김. 자손은 부모 색을 닮는다.', '초록을 노랑으로 = <b>돌연변이</b>로 집단에 없던 새 형질이 나타남.'];
      msg.innerHTML = msgs[Math.min(4, Math.floor(t + 0.1))];
    }
    K.hold(svg, {
      down(p) { if (p.y < 495) return false; t = clamp((p.x - 90) / 219, 0, 4); render(); return true; },
      move(p) { t = clamp((p.x - 90) / 219, 0, 4); render(); },
      up() {},
    }, (e) => K.svgPt(svg, e));
    hand.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return; e.preventDefault(); e.stopPropagation();
      t = clamp(t + (e.key === 'ArrowRight' ? 0.25 : -0.25), 0, 4); render();
    });
    render();
    root._an = { t: (v) => { t = v; render(); } };
    return {};
  }
  window.EvAnalogy = { mount };
})();
