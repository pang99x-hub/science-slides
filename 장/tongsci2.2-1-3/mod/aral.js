/* 2차시 표지(교과서 82쪽 도입, 8차시 도입 «아랄해의 사막화 알아보기»): 아랄해 지도(SVG).
   두 강(아무다리야·시르다리야)이 바다로 들어간다. 강 끝(동그란 손잡이)을 잡아 목화밭으로 옮기면 물길이 밭으로 가서 목화가 자라고,
   바다로 들어오던 물이 줄어 해마다 바다가 줄어든다(동쪽 얕은 곳부터 마름). 배는 모래 위에 남고, 마른 바닥에서 소금 먼지가 인다.
   바다 크기 L은 들어오는 물 I에 맞춰 천천히 변한다: L → 0.08 + 0.92·I(이해를 돕기 위한 예). 면적 10 % 이하는 교과서 82쪽 값. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // 바다 덩어리: [가운데 x, y, 반지름 x, y, 마르는 순서(작을수록 먼저)]
  const BLOBS = [[300, 120, 70, 46, 0.55], [255, 225, 62, 92, 0.86], [360, 230, 92, 96, 0.0], [330, 170, 70, 50, 0.3]];
  const RIVERS = {
    amu: { name: '아무다리야강', from: [660, 410], via: [520, 360], mouth: [350, 318], field: [520, 300], share: 0.6 },
    syr: { name: '시르다리야강', from: [690, 70], via: [560, 110], mouth: [400, 120], field: [565, 175], share: 0.4 },
  };

  function mount(root) {
    const svg = root.querySelector('.ar-svg'), now = root.querySelector('.ar-now'), yr = root.querySelector('.ar-yr');
    el('rect', { x: 0, y: 0, width: 700, height: 420, class: 'ar-land' }, svg);
    // 옛 해안선(점선)
    const old = el('g', { class: 'ar-old' }, svg);
    BLOBS.forEach(([x, y, rx, ry]) => el('ellipse', { cx: x, cy: y, rx, ry }, old));
    const bed = el('g', { class: 'ar-bed' }, svg);
    BLOBS.forEach(([x, y, rx, ry]) => el('ellipse', { cx: x, cy: y, rx, ry }, bed));
    const water = el('g', { class: 'ar-water' }, svg);
    const wb = BLOBS.map(([x, y, rx, ry]) => el('ellipse', { cx: x, cy: y, rx, ry }, water));
    const fish = el('g', { class: 'ar-fish' }, svg);
    const fishes = [[320, 140], [270, 230], [380, 250], [350, 190], [300, 100], [250, 260]].map(([x, y]) => { const f = el('path', { d: `M${x} ${y} q 10 -8 20 0 q -10 8 -20 0 m 20 0 l 8 -6 v 12 z` }, fish); return { f, x, y }; });
    // 목화밭
    const fields = {};
    Object.entries(RIVERS).forEach(([k, r]) => {
      const g = el('g', { class: 'ar-field', 'data-k': k }, svg);
      el('rect', { x: r.field[0] - 58, y: r.field[1] - 34, width: 116, height: 68, rx: 8, class: 'ar-fbg' }, g);
      const rows = el('g', { class: 'ar-rows' }, g);
      for (let i = 0; i < 4; i++) el('line', { x1: r.field[0] - 48, x2: r.field[0] + 48, y1: r.field[1] - 22 + i * 15, y2: r.field[1] - 22 + i * 15 }, rows);
      const cot = el('g', { class: 'ar-cot' }, g);
      for (let i = 0; i < 12; i++) el('circle', { cx: r.field[0] - 44 + (i % 6) * 18, cy: r.field[1] - 16 + Math.floor(i / 6) * 30, r: 6 }, cot);
      el('text', { x: r.field[0], y: r.field[1] + 54, class: 'ar-ft' }, g).textContent = '목화밭';
      fields[k] = g;
    });
    // 배·항구·먼지
    const boats = [[292, 92, 0.72, '아랄스크'], [270, 296, 0.9, '무이나크']].map(([x, y, th, name]) => {
      const g = el('g', { class: 'ar-boat', transform: `translate(${x} ${y})` }, svg);
      el('path', { d: 'M-22 0 h44 l-8 12 h-28 z', class: 'ar-hull' }, g); el('path', { d: 'M0 0 v-30 l18 22 h-18', class: 'ar-sail' }, g);
      el('text', { x: 0, y: 34, class: 'ar-pt' }, g).textContent = name;
      return { g, x, y, th };
    });
    const dust = el('g', { class: 'ar-dust' }, svg);
    const puffs = Array.from({ length: 14 }, (_, i) => ({ c: el('circle', { r: 10 }, dust), u: i / 14, y: 140 + (i * 37) % 160 }));
    // 강과 손잡이
    const riv = {};
    Object.entries(RIVERS).forEach(([k, r]) => {
      const path = el('path', { class: 'ar-river' }, svg);
      const lab = el('text', { x: r.via[0] + 30, y: r.via[1] + (k === 'amu' ? 40 : -22), class: 'ar-rt' }, svg); lab.textContent = r.name;
      const h = el('g', { class: 'ar-handle', tabindex: '0', role: 'button', 'aria-label': `${r.name} 끝(끌어서 옮기기, Enter로 밭↔바다)` }, svg);
      el('circle', { r: 26, class: 'ar-hhit' }, h); el('circle', { r: 14, class: 'ar-hdot' }, h);
      riv[k] = { r, path, h, end: [...r.mouth], toField: false };
    });
    let L = 1, years = 0, tm = 0, active = false, raf = 0, last = 0;
    const inflow = () => Object.values(riv).reduce((s, x) => s + (x.toField ? 0 : x.r.share), 0);
    function riverPath(x) {
      const [fx, fy] = x.r.from, [vx, vy] = x.r.via, [ex, ey] = x.end;
      return `M${fx} ${fy} Q ${vx} ${vy} ${(vx + ex) / 2} ${(vy + ey) / 2} T ${ex} ${ey}`;
    }
    function place(x) { x.path.setAttribute('d', riverPath(x)); x.h.setAttribute('transform', `translate(${x.end[0].toFixed(1)} ${x.end[1].toFixed(1)})`); }
    function paint() {
      BLOBS.forEach(([x, y, rx, ry, o], i) => { const k = clamp((L - o * 0.92) / (1 - o * 0.92), 0, 1); const s = Math.sqrt(k); wb[i].setAttribute('rx', (rx * s).toFixed(1)); wb[i].setAttribute('ry', (ry * s).toFixed(1)); });
      const area = BLOBS.reduce((s, [, , rx, ry, o]) => s + rx * ry * clamp((L - o * 0.92) / (1 - o * 0.92), 0, 1), 0) / BLOBS.reduce((s, [, , rx, ry]) => s + rx * ry, 0);
      fishes.forEach((f, i) => f.f.style.opacity = area > (i + 1) / 8 ? 1 : 0);
      boats.forEach((b) => b.g.classList.toggle('stuck', L < b.th));
      Object.entries(riv).forEach(([k, x]) => fields[k].classList.toggle('on', x.toField));
      const dry = clamp(1 - area, 0, 1);
      dust.style.opacity = dry > 0.4 ? ((dry - 0.4) * 1.6).toFixed(2) : 0;
      yr.textContent = years < 0.5 ? '물길을 바꾸기 전' : `물길을 바꾼 뒤 ${Math.round(years)}년`;
      const div = Object.values(riv).filter((x) => x.toField).length;
      now.textContent = !div ? '강 끝(동그라미)을 목화밭으로 끌어 보자'
        : area > 0.6 ? '밭은 푸르러지는데 바다는…'
        : area > 0.12 ? '바다가 줄어 배가 모래 위에 남았다'
        : '면적이 처음의 10 % 이하 · 마른 바닥에서 소금 먼지';
      now.classList.toggle('done', area <= 0.12);
      root.querySelector('.ar-area').textContent = `바다 넓이 약 ${Math.round(area * 100)} %`;
    }
    function tick(t) {
      raf = 0; if (!active) return;
      const dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t; tm += dt;
      const I = inflow(), eq = 0.08 + 0.92 * I;
      if ((I < 0.999 || L < 0.999) && Math.abs(eq - L) > 0.004) { years += dt * 3; L += (eq - L) * Math.min(1, dt * 0.14); }
      puffs.forEach((p) => { p.u = (p.u + dt * 0.12) % 1; p.c.setAttribute('cx', (200 + p.u * 520).toFixed(1)); p.c.setAttribute('cy', (p.y - p.u * 60 + Math.sin(tm * 2 + p.u * 9) * 6).toFixed(1)); p.c.setAttribute('r', (8 + p.u * 22).toFixed(1)); p.c.style.opacity = (1 - p.u).toFixed(2); });
      fishes.forEach((f, i) => f.f.setAttribute('transform', `translate(${(Math.sin(tm * 0.8 + i) * 8).toFixed(1)} 0)`));
      paint(); raf = requestAnimationFrame(tick);
    }
    // 끌기
    const toSvg = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(svg.getScreenCTM().inverse()); return [q.x, q.y]; };
    function settle(x, toField) {
      x.toField = toField;
      const tgt = toField ? x.r.field : x.r.mouth;
      if (window.gsap) gsap.to(x.end, { 0: tgt[0], 1: tgt[1], duration: window.Deck.D(0.35), ease: 'power2.out', onUpdate: () => place(x) }); else { x.end[0] = tgt[0]; x.end[1] = tgt[1]; place(x); }
      paint();
    }
    Object.values(riv).forEach((x) => {
      let on = false;
      x.h.addEventListener('pointerdown', (e) => { on = true; e.stopPropagation(); try { x.h.setPointerCapture(e.pointerId); } catch { /* 합성 */ } x.h.classList.add('drag'); });
      x.h.addEventListener('pointermove', (e) => { if (!on) return; const [px, py] = toSvg(e); x.end[0] = clamp(px, 10, 690); x.end[1] = clamp(py, 10, 410); place(x); });
      const up = () => { if (!on) return; on = false; x.h.classList.remove('drag'); const d = Math.hypot(x.end[0] - x.r.field[0], x.end[1] - x.r.field[1]); settle(x, d < 80); };
      x.h.addEventListener('pointerup', up); x.h.addEventListener('pointercancel', up);
      x.h.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); settle(x, !x.toField); } });
      place(x);
    });
    root.querySelector('.ar-reset').addEventListener('click', () => { Object.values(riv).forEach((x) => settle(x, false)); L = 1; years = 0; paint(); });
    paint();
    root._aral = { divert(k, on) { settle(riv[k], on); }, ff(y) { for (let i = 0; i < y / 0.15; i++) { const I = inflow(); years += 0.15; L += (0.08 + 0.92 * I - L) * 0.05 * 0.14; } paint(); } };
    return {
      setActive(on) {
        active = on && !window.Stage.reduce;
        if (active && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
        if (!active && raf) { cancelAnimationFrame(raf); raf = 0; }
      },
    };
  }
  window.Aral = { mount };
})();
