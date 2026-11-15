/* 1-1 1차시 표지 «엇갈린 사냥 약속»(교과서 14쪽 도입 만화).
   «내일 해가 여기에 있을 때 산골짜기에서 만나자» — 시간 막대(새벽 6시~저녁 6시)를 끌면 해가 하늘을 지나고,
   해가 약속한 높이를 지나는 두 번(오전 9시·오후 3시)에 맞춰 두 사람이 서로 다른 골짜기로 간다.
   Hunt.mount(root) → { setActive, fit } · 시험용: root._hunt.set(시각) */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const el = (tag, at, par) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; };

  // 해: 6시 동쪽(왼쪽) 지평선 → 12시 남쪽 높이 → 18시 서쪽(오른쪽)
  const sunAt = (h) => { const a = Math.PI * (h - 6) / 12; return [lerp(70, 930, (h - 6) / 12), 330 - 270 * Math.sin(a)]; };
  const MEET_Y = sunAt(9)[1];   // 약속한 해 높이(오전 9시 = 오후 3시)
  const VALLEY = [[215, 300], [500, 290], [785, 300]];
  const HOME = [[110, 520], [890, 520]];
  // 사람마다 [시각, 위치] 마디: 그사이는 걸어간다
  const PLAN = [
    [[6, HOME[0]], [8, HOME[0]], [9, VALLEY[0]], [11.5, VALLEY[0]], [12.6, HOME[0]], [18, HOME[0]]],
    [[6, HOME[1]], [14, HOME[1]], [15, VALLEY[2]], [18, VALLEY[2]]],
  ];
  const posAt = (plan, h) => {
    for (let i = 1; i < plan.length; i++) if (h <= plan[i][0]) { const [h0, p0] = plan[i - 1], [h1, p1] = plan[i]; const t = h1 === h0 ? 1 : clamp((h - h0) / (h1 - h0), 0, 1); return [lerp(p0[0], p1[0], t), lerp(p0[1], p1[1], t), t > 0 && t < 1]; }
    const p = plan[plan.length - 1][1]; return [p[0], p[1], false];
  };
  const fmt = (h) => { const hh = Math.floor(h + 1e-6), mm = Math.round((h - hh) * 60 / 10) * 10; const ap = hh < 12 ? '오전' : '오후'; const d = hh > 12 ? hh - 12 : hh; return `${ap} ${d}시${mm ? ' ' + (mm === 60 ? 0 : mm) + '분' : ''}`; };

  function person(g, col) {
    const p = el('g', { class: 'hn-man' }, g);
    el('line', { x1: 22, y1: -64, x2: 30, y2: 10, class: 'hn-spear' }, p);
    el('path', { d: 'M27 -74 l4 -14 l4 14 z', class: 'hn-tip' }, p);
    el('path', { d: 'M-14 -2 L-10 -40 Q0 -48 10 -40 L14 -2 Z', fill: col, class: 'hn-body' }, p);
    el('line', { x1: -6, y1: -2, x2: -9, y2: 22, class: 'hn-leg l1' }, p);
    el('line', { x1: 6, y1: -2, x2: 9, y2: 22, class: 'hn-leg l2' }, p);
    el('circle', { cx: 0, cy: -56, r: 12, class: 'hn-head' }, p);
    el('path', { d: 'M-12 -60 Q0 -78 12 -60 Z', fill: col, class: 'hn-cap' }, p);
    const say = el('g', { class: 'hn-say' }, p);
    el('rect', { x: -90, y: -142, width: 180, height: 46, rx: 14, class: 'hn-bub' }, say);
    el('path', { d: 'M-8 -97 L0 -82 L8 -97 Z', class: 'hn-bub' }, say);
    const t = el('text', { x: 0, y: -111, 'text-anchor': 'middle', class: 'hn-saytx' }, say);
    return { p, say, t };
  }

  function mount(root) {
    const svg = root.querySelector('.hn-svg'), range = root.querySelector('.hn-range'), now = root.querySelector('.hn-now'), clock = root.querySelector('.hn-clock');
    const defs = el('defs', {}, svg);
    const sky = el('linearGradient', { id: 'hn-sky', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    const s0 = el('stop', { offset: '0' }, sky), s1 = el('stop', { offset: '1' }, sky);
    el('rect', { x: 0, y: 0, width: 1000, height: 620, fill: 'url(#hn-sky)' }, svg);
    // 약속한 해 높이(점선)
    const meet = el('g', { class: 'hn-meet' }, svg);
    el('line', { x1: 20, y1: MEET_Y, x2: 980, y2: MEET_Y }, meet);
    el('text', { x: 500, y: MEET_Y - 10, 'text-anchor': 'middle' }, meet).textContent = '«해가 여기에 있을 때» 높이';
    const sun = el('g', { class: 'hn-sun' }, svg);
    for (let i = 0; i < 8; i++) el('line', { x1: 0, y1: -40, x2: 0, y2: -54, transform: `rotate(${i * 45})` }, sun);
    el('circle', { r: 30 }, sun);
    const ring = el('circle', { r: 46, class: 'hn-ring' }, sun);
    // 산줄기와 골짜기 셋
    el('path', { d: 'M0 360 L80 210 L150 280 L215 330 L290 230 L360 170 L430 250 L500 320 L570 240 L650 160 L720 260 L785 330 L850 250 L920 200 L1000 290 L1000 620 L0 620 Z', class: 'hn-mt' }, svg);
    el('path', { d: 'M0 430 Q250 380 500 420 T1000 410 L1000 620 L0 620 Z', class: 'hn-field' }, svg);
    VALLEY.forEach(([x, y], i) => {
      el('path', { d: `M${x - 40} ${y + 16} Q${x} ${y + 40} ${x + 40} ${y + 16}`, class: 'hn-path' }, svg);
      el('text', { x, y: y + 66, 'text-anchor': 'middle', class: 'hn-vl' }, svg).textContent = ['동쪽 골짜기', '가운데 골짜기', '서쪽 골짜기'][i];
    });
    HOME.forEach(([x, y]) => { el('path', { d: `M${x - 34} ${y + 30} L${x - 34} ${y - 6} L${x} ${y - 36} L${x + 34} ${y - 6} L${x + 34} ${y + 30} Z`, class: 'hn-hut' }, svg); });
    const men = [person(svg, '#d9483b'), person(svg, '#2a73b8')];
    men.forEach((m, i) => el('text', { x: 0, y: 48, 'text-anchor': 'middle', class: 'hn-name' }, m.p).textContent = i ? '가람' : '누리');

    let h = 6, seen = new Set(), walk = 0;
    function set(v) {
      h = clamp(v, 6, 18); range.value = String(h);
      const [sx, sy] = sunAt(h); sun.setAttribute('transform', `translate(${sx} ${sy})`);
      const day = Math.sin(Math.PI * (h - 6) / 12);
      s0.setAttribute('stop-color', `hsl(205 ${40 + 30 * day}% ${55 + 25 * day}%)`);
      s1.setAttribute('stop-color', `hsl(${30 + 170 * day} ${50 + 20 * day}% ${78 + 12 * day}%)`);
      const atMeet = Math.abs(sy - MEET_Y) < 9;
      ring.classList.toggle('on', atMeet); meet.classList.toggle('on', atMeet);
      walk += 1;
      men.forEach((m, i) => {
        const [x, y, moving] = posAt(PLAN[i], h);
        m.p.setAttribute('transform', `translate(${x} ${y})${x > 500 ? '' : ''}`);
        m.p.classList.toggle('walk', moving); m.p.classList.toggle('step', moving && walk % 2 === 0);
        let say = '';
        if (i === 0 && h >= 9 && h < 11.5) say = '아무도 없네?';
        if (i === 0 && h >= 11.5 && h < 12.6) say = '집에 가야지';
        if (i === 1 && h >= 15) say = '왜 안 오지?';
        if (i === 0 && h >= 8 && h < 9) say = '해가 저 높이야!';
        if (i === 1 && h >= 14 && h < 15) say = '이제 해가 저 높이!';
        m.say.classList.toggle('on', !!say); if (say) m.t.textContent = say;
      });
      clock.textContent = fmt(h);
      if (h >= 9) seen.add('a'); if (h >= 15) seen.add('b');
      now.textContent = seen.has('b') ? '두 사람은 같은 말을 듣고 서로 다른 때, 다른 곳으로 갔다' : seen.has('a') ? '② 막대를 계속 끌어 가람이는 언제 오는지 보자' : '① 시간 막대를 오른쪽으로 끌어 보자';
      now.classList.toggle('done', seen.has('b'));
      root.querySelectorAll('.cov-steps li').forEach((li) => { const n = +li.dataset.s; li.classList.toggle('ok', n === 1 ? seen.has('a') : seen.has('b')); li.classList.toggle('now', n === (seen.has('a') ? 2 : 1) && !seen.has('b')); });
    }
    range.addEventListener('input', () => set(+range.value));
    set(6);
    root._hunt = { set };
    return { setActive() {}, fit() {} };
  }
  window.Hunt = { mount };
})();
