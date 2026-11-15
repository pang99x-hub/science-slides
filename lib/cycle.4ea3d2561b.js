/* 정리: 오르내림의 고리(교과서 79쪽 탐구 정리). 고리 손잡이를 돌리면(각도 θ, 한 바퀴 = 한 주기) 오른쪽 풀밭의 메뚜기·참새 수와
   아래 그래프의 지금 자리가 함께 움직인다. 모델: 메뚜기 = 1 + 0.65·sin 2πθ, 참새 = 1 + 0.65·sin 2π(θ − ¼) (참새가 ¼주기 늦게 따라감). */
(function () {
  'use strict';
  const { el, pt, org, rng } = window.Eco;
  const CX = 280, CY = 360, RR = 200;
  const Q = [
    { t: '① 메뚜기가 는다', b: '참새가 적어서 메뚜기가 덜 잡아먹힌다. 메뚜기가 빠르게 번식한다.', c: 'var(--hopper)' },
    { t: '② 참새가 는다', b: '먹이인 메뚜기가 넉넉해 더 많은 참새가 살아남아 번식한다. 메뚜기는 가장 많을 때를 지나 줄기 시작한다.', c: 'var(--sparrow)' },
    { t: '③ 메뚜기가 준다', b: '많아진 참새에게 메뚜기가 많이 잡아먹혀 수가 크게 준다.', c: 'var(--hopper)' },
    { t: '④ 참새가 준다', b: '먹이가 모자라 굶는 참새가 생긴다. 참새가 줄면 다시 ①로 — 메뚜기가 덜 먹혀 늘어난다.', c: 'var(--sparrow)' },
  ];
  const hopper = (th) => 1 + 0.65 * Math.sin(2 * Math.PI * th), sparrow = (th) => 1 + 0.65 * Math.sin(2 * Math.PI * (th - 0.25));
  const GX0 = 560, GX1 = 1030, GY0 = 664, GY1 = 430;

  function mount(root) {
    const svg = root.querySelector('.cy-svg'), now = root.querySelector('.cy-now');
    const it = root.querySelector('.cy-it'), ib = root.querySelector('.cy-ib');
    el('rect', { class: 'cy-bg', x: -400, y: -300, width: 1856, height: 1300 }, svg);
    // 고리: 네 칸(시곗바늘 방향, 위에서 시작)
    const arcs = Q.map((q, i) => {
      const a0 = (i / 4) * 2 * Math.PI - Math.PI / 2 + 0.06, a1 = ((i + 1) / 4) * 2 * Math.PI - Math.PI / 2 - 0.06;
      const p = (a, r) => `${(CX + Math.cos(a) * r).toFixed(1)} ${(CY + Math.sin(a) * r).toFixed(1)}`;
      const g = el('g', { class: 'cy-q' }, svg);
      el('path', { class: 'cy-arc', d: `M${p(a0, RR)} A ${RR} ${RR} 0 0 1 ${p(a1, RR)}`, style: `stroke:${q.c}` }, g);
      el('path', { class: 'cy-tip', d: `M${p(a1 - 0.02, RR - 16)} L ${p(a1 + 0.05, RR)} L ${p(a1 - 0.02, RR + 16)}`, style: `fill:${q.c}` }, g);
      const am = (a0 + a1) / 2, tx = CX + Math.cos(am) * (RR - 70), ty = CY + Math.sin(am) * (RR - 70);
      const [l1, l2] = q.t.split(' ').reduce((a, w, j) => (j < 1 ? [w, ''] : [a[0], (a[1] + ' ' + w).trim()]), ['', '']);
      el('text', { class: 'cy-qt', x: tx, y: ty - 6 }, g).textContent = l1;
      el('text', { class: 'cy-qt', x: tx, y: ty + 24 }, g).textContent = l2;
      return g;
    });
    el('circle', { class: 'cy-hub', cx: CX, cy: CY, r: 70 }, svg);
    const hubT = el('text', { class: 'cy-hubt', x: CX, y: CY + 12 }, svg);
    const knob = el('g', { class: 'cy-knob', tabindex: '0', role: 'slider', 'aria-label': '고리 손잡이(주기 속 지금 자리)', 'aria-valuemin': '0', 'aria-valuemax': '100' }, svg);
    el('circle', { class: 'cy-khit', r: 52 }, knob); el('circle', { class: 'cy-kc', r: 30 }, knob);
    el('path', { class: 'cy-ka', d: 'M-12 -6 a 14 14 0 1 1 0 12 M -12 -6 l -2 -10 M -12 -6 l 9 -3' }, knob);
    const ring = el('circle', { class: 'cy-ringhit', cx: CX, cy: CY, r: RR, }, svg);
    svg.insertBefore(ring, knob);
    // 풀밭
    el('rect', { class: 'cy-field', x: GX0, y: 30, width: GX1 - GX0, height: 330, rx: 10 }, svg);
    el('text', { class: 'cy-ft', x: GX0 + 14, y: 58 }, svg).textContent = '풀밭';
    const R = rng(9);
    const hops = Array.from({ length: 22 }, () => org(svg, 'grasshopper', GX0 + 30 + R() * (GX1 - GX0 - 60), 210 + R() * 140, 0.85, R() < 0.5));
    const birds = Array.from({ length: 12 }, () => org(svg, 'sparrow', GX0 + 30 + R() * (GX1 - GX0 - 60), 80 + R() * 110, 1.0, R() < 0.5));
    const bars = el('g', {}, svg);
    // 그래프(두 주기)
    el('rect', { class: 'cy-gbg', x: GX0, y: GY1 - 20, width: GX1 - GX0, height: GY0 - GY1 + 20 }, svg);
    const gx = (th) => GX0 + th / 2 * (GX1 - GX0), gy = (v) => GY0 - v / 1.8 * (GY0 - GY1);
    const line = (f) => { const p = []; for (let k = 0; k <= 200; k++) p.push(`${gx(k / 100).toFixed(1)} ${gy(f(k / 100)).toFixed(1)}`); return 'M' + p.join(' L '); };
    el('path', { class: 'cy-gl h', d: line(hopper) }, svg); el('path', { class: 'cy-gl s', d: line(sparrow) }, svg);
    el('text', { class: 'cy-gn h', x: gx(0.25), y: gy(1.65) - 10 }, svg).textContent = '메뚜기';
    el('text', { class: 'cy-gn s', x: gx(0.5), y: gy(1.65) - 10 }, svg).textContent = '참새';
    el('text', { class: 'cy-gx', x: GX1, y: GY0 + 26 }, svg).textContent = '시간 →';
    el('text', { class: 'cy-gx l', x: GX0, y: GY0 + 26 }, svg).textContent = '개체수';
    const cur = el('g', {}, svg); el('path', { class: 'cy-cur', d: `M0 ${GY1 - 20} V ${GY0}` }, cur);
    const dh = el('circle', { class: 'cy-dot h', r: 9 }, cur), ds = el('circle', { class: 'cy-dot s', r: 9 }, cur);

    let th = 0, turned = 0;
    function paint() {
      const a = th * 2 * Math.PI - Math.PI / 2;
      knob.setAttribute('transform', `translate(${(CX + Math.cos(a) * RR).toFixed(1)} ${(CY + Math.sin(a) * RR).toFixed(1)})`);
      knob.setAttribute('aria-valuenow', Math.round(th * 100));
      const qi = Math.floor(((th % 1) + 1) % 1 * 4) % 4;
      arcs.forEach((g, i) => g.classList.toggle('on', i === qi));
      hubT.textContent = ['메뚜기 ↑', '참새 ↑', '메뚜기 ↓', '참새 ↓'][qi];
      it.textContent = Q[qi].t; ib.textContent = Q[qi].b;
      const H = hopper(th), S = sparrow(th);
      const nH = Math.round(H / 1.65 * 22), nS = Math.round(S / 1.65 * 12);
      hops.forEach((h, i) => h.style.display = i < nH ? '' : 'none');
      birds.forEach((b, i) => b.style.display = i < nS ? '' : 'none');
      cur.setAttribute('transform', `translate(${gx(th % 1).toFixed(1)} 0)`);
      dh.setAttribute('cy', gy(H).toFixed(1)); ds.setAttribute('cy', gy(S).toFixed(1));
      bars.innerHTML = '';
      now.textContent = turned < 0.2 ? '손잡이를 시곗바늘 방향으로 돌려 보자' : turned < 1 ? '한 바퀴를 다 돌려 보자' : '그래프에서 두 봉우리의 자리를 견주어 보자';
      now.classList.toggle('done', turned >= 1);
    }
    let drag = false, lastA = null;
    const angle = (p) => (Math.atan2(p.y - CY, p.x - CX) + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI) / (2 * Math.PI);
    function move(e) {
      const p = angle(pt(svg, e));
      if (lastA !== null) { let d = p - lastA; if (d > 0.5) d -= 1; if (d < -0.5) d += 1; th = (th + d + 1) % 1; if (d > 0) turned += d; }
      lastA = p; paint();
    }
    [knob, ring].forEach((t) => t.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); drag = true; t.setPointerCapture(e.pointerId); lastA = angle(pt(svg, e)); if (t === ring) { const d = (lastA - th + 1.5) % 1 - 0.5; th = lastA; if (d > 0) turned += d; paint(); } }));
    [knob, ring].forEach((t) => { t.addEventListener('pointermove', (e) => { if (drag) move(e); }); ['pointerup', 'pointercancel'].forEach((n) => t.addEventListener(n, () => { drag = false; lastA = null; })); });
    knob.addEventListener('keydown', (e) => {
      const d = { ArrowRight: 0.02, ArrowDown: 0.02, ArrowLeft: -0.02, ArrowUp: -0.02 }[e.key];
      if (d === undefined) return; e.preventDefault(); e.stopPropagation(); th = (th + d + 1) % 1; if (d > 0) turned += d; paint();
    });
    paint();
    root._cy = { get phase() { return turned; }, set: (v) => { th = v % 1; turned = Math.max(turned, v); paint(); } };
    return {};
  }
  window.CycleDial = { mount };
})();
