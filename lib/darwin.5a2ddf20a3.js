/* 3차시 2장(교과서 24쪽): 다윈의 자연선택설을 세월 바퀴(회전 손잡이)로 넘겨 본다. 한 바퀴 = 한 단계, T = 0~5.
   0→1 과잉 생산(알에서 새끼 30마리) · 1→2 변이(부리 크기가 저마다) · 2→3 생존 경쟁(씨앗 8개로 몰림) · 3→4 자연선택(씨앗을 깰 만큼 큰 부리만 남음)
   4→5 유전과 진화(여러 세대 뒤 부리 분포가 큰 쪽으로). 같은 씨앗(난수)으로 늘 같은 장면이 나와 되감을 수 있다. 수는 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const K = window.EvKit, F = window.EvFinch, { el, clamp } = K;
  const STAGE = ['과잉 생산', '변이', '생존 경쟁', '자연선택', '유전과 진화'];
  const CX = 905, CY = 250, CR = 112;
  function gauss(r) { return Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r()); }

  function mount(root) {
    const svg = root.querySelector('.ev-dw-svg'), now = root.querySelector('.ev-dw-now'), steps = [...root.querySelectorAll('.ev-steps5 li')];
    const r = K.rng(5);
    el('rect', { x: 0, y: 0, width: 1056, height: 680, fill: '#cfe8f3' }, svg);
    el('path', { d: 'M0 230 Q 200 190 400 215 T 770 205 V 680 H 0 Z', fill: '#e6d29a' }, svg);
    el('rect', { x: 770, y: 0, width: 286, height: 680, fill: '#f6f3ea' }, svg);
    el('path', { d: 'M770 0 V 680', stroke: '#1d2433', 'stroke-width': 2 }, svg);
    const title = el('text', { x: 385, y: 60, 'text-anchor': 'middle', style: 'font:800 34px var(--f-display)', fill: '#1d2433' }, svg);
    const sub = el('text', { x: 385, y: 96, 'text-anchor': 'middle', style: 'font:600 19px var(--f-body)', fill: '#4b566a' }, svg);
    // 씨앗(크고 단단한)
    const seeds = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const x = 90 + i * 85, y = 478; el('ellipse', { cx: x, cy: y, rx: 16, ry: 12, fill: '#7a5230', stroke: '#1d2433', 'stroke-width': 2 }, svg); return { x, y }; });
    // 둥지와 어미
    const nests = [0, 1, 2, 3, 4, 5].map((i) => ({ x: 90 + i * 120, y: 200 }));
    nests.forEach((n) => el('path', { d: `M${n.x - 38} ${n.y + 18} q 38 26 76 0`, stroke: '#8a6a4a', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round' }, svg));
    const parents = nests.map((n) => { const s = clamp(0.36 + gauss(r) * 0.14, 0.05, 0.9); const g = F.draw(svg, { ...F.byT(s) }); g.setAttribute('transform', `translate(${n.x} ${n.y}) scale(0.9)`); return { g, s }; });
    const chicks = [];
    for (let i = 0; i < 30; i++) {
      const s = clamp(0.38 + gauss(r) * 0.2, 0.02, 0.98), hx = 60 + (i % 10) * 70 + (Math.floor(i / 10) % 2) * 30, hy = 285 + Math.floor(i / 10) * 60;
      const sd = seeds[Math.floor(r() * 8)];
      const egg = el('ellipse', { rx: 11, ry: 14, fill: '#f3ead6', stroke: '#1d2433', 'stroke-width': 2 }, svg);
      const g = F.draw(svg, { ...F.byT(0.38) });
      chicks.push({ s, hx, hy, tx: sd.x + (r() - 0.5) * 60, ty: sd.y - 30 + (r() - 0.5) * 24, egg, g, n: nests[i % 6] });
    }
    const sorted = chicks.filter((c) => c.s < 0.52).sort((a, b) => a.s - b.s);
    const later = [];
    for (let i = 0; i < 30; i++) { const g = F.draw(svg, { ...F.byT(0.5) }); later.push({ g, z: gauss(r), x: 60 + (i % 10) * 70 + (Math.floor(i / 10) % 2) * 30, y: 285 + Math.floor(i / 10) * 60 }); }
    const fight = el('g', {}, svg);
    [[200, 420], [420, 430], [610, 415], [330, 400]].forEach(([x, y]) => el('text', { x, y, style: 'font:800 30px var(--f-body)', fill: '#d9483b' }, fight).textContent = '!');
    // 막대그래프
    const H = el('g', {}, svg);
    el('rect', { x: 30, y: 528, width: 720, height: 140, rx: 10, fill: 'rgba(255,255,255,.85)', stroke: '#1d2433', 'stroke-width': 2 }, H);
    el('text', { x: 46, y: 552, style: 'font:700 16px var(--f-body)', fill: '#1f5f4a' }, H).textContent = '부리 크기별 개체 수';
    el('text', { x: 60, y: 660, style: 'font:600 14px var(--f-body)', fill: '#7b8597' }, H).textContent = '작은 부리';
    el('text', { x: 730, y: 660, 'text-anchor': 'end', style: 'font:600 14px var(--f-body)', fill: '#7b8597' }, H).textContent = '큰 부리';
    const bars = [...Array(10)].map((_, i) => el('rect', { x: 64 + i * 66, width: 50, y: 640, height: 0, fill: K.hex(K.mix([233, 176, 74], [140, 80, 30], i / 9)), stroke: '#1d2433', 'stroke-width': 1.5 }, H));
    const thr = el('path', { d: `M${64 + 0.52 * 660} 560 V 642`, stroke: '#d9483b', 'stroke-width': 3, 'stroke-dasharray': '6 5' }, H);
    // 세월 바퀴
    el('text', { x: CX, y: 64, 'text-anchor': 'middle', style: 'font:800 28px var(--f-display)', fill: '#1d2433' }, svg).textContent = '세월 바퀴';
    el('circle', { cx: CX, cy: CY, r: CR + 10, fill: '#e3d6bd', stroke: '#1d2433', 'stroke-width': 3 }, svg);
    const wheel = el('g', {}, svg);
    el('circle', { cx: 0, cy: 0, r: CR, fill: '#c9a77c', stroke: '#1d2433', 'stroke-width': 3 }, wheel);
    for (let i = 0; i < 6; i++) el('path', { d: `M0 0 L ${Math.cos(i * Math.PI / 3) * CR} ${Math.sin(i * Math.PI / 3) * CR}`, stroke: '#8a6a4a', 'stroke-width': 8 }, wheel);
    el('circle', { r: 20, fill: '#5a3b26', stroke: '#1d2433', 'stroke-width': 3 }, wheel);
    const knob = el('g', { tabindex: '0', role: 'slider', 'aria-label': '세월 바퀴 손잡이(←→ 키로도 돌린다)', 'aria-valuemin': '0', 'aria-valuemax': '5', style: 'cursor:grab' }, wheel);
    el('circle', { cx: CR - 18, cy: 0, r: 26, fill: '#f2c230', stroke: '#1d2433', 'stroke-width': 3 }, knob);
    el('path', { d: `M${CX - 60} ${CY - CR - 30} A ${CR + 30} ${CR + 30} 0 0 1 ${CX + 60} ${CY - CR - 30}`, stroke: '#1f5f4a', 'stroke-width': 4, fill: 'none', 'marker-end': '' }, svg);
    el('path', { d: `M${CX + 60} ${CY - CR - 30} l -14 -4 l 6 13 z`, fill: '#1f5f4a' }, svg);
    const tT = el('text', { x: CX, y: CY + CR + 60, 'text-anchor': 'middle', style: 'font:400 40px var(--f-pen)', fill: '#1d2433' }, svg);
    const tB = el('text', { x: CX, y: CY + CR + 96, 'text-anchor': 'middle', style: 'font:600 18px var(--f-body)', fill: '#4b566a' }, svg);
    const dots = STAGE.map((_, i) => el('circle', { cx: CX - 80 + i * 40, cy: CY + CR + 130, r: 11, fill: '#fff', stroke: '#1d2433', 'stroke-width': 2 }, svg));
    let T = 0, ang = 0;
    const seg = (k) => clamp(T - k, 0, 1);
    function render() {
      const u0 = seg(0), u1 = seg(1), u2 = seg(2), u3 = seg(3), u4 = seg(4);
      const k = Math.min(4, Math.floor(T));
      title.textContent = T < 0.02 ? '크고 단단한 씨앗이 많은 섬' : `${k + 1}. ${STAGE[k]}`;
      sub.textContent = ['어미 핀치 여섯 마리가 알을 낳았다. 씨앗은 8개뿐이다.', '같은 어미의 새끼라도 부리 크기가 저마다 다르다.', '새끼는 많고 씨앗은 적다. 서로 차지하려 다툰다.', '단단한 씨앗을 깰 만큼 부리가 큰 개체가 살아남는다.', '자손은 부모의 부리를 닮는다. 여러 세대가 쌓인다.'][k];
      if (T < 0.02) sub.textContent = '바퀴를 돌리면 시간이 흐른다.';
      wheel.setAttribute('transform', `translate(${CX} ${CY}) rotate(${(ang * 180 / Math.PI).toFixed(1)})`);
      knob.setAttribute('aria-valuenow', T.toFixed(2));
      tT.textContent = T < 4 ? `${STAGE[k]}` : `${Math.round(1 + u4 * 29)}세대 뒤`; tB.textContent = `한 바퀴에 한 단계 · ${Math.min(5, T).toFixed(1)} / 5`;
      dots.forEach((d, i) => d.setAttribute('fill', T >= i + 0.98 ? '#1f5f4a' : T > i ? '#ffe27a' : '#fff'));
      steps.forEach((li, i) => { li.classList.toggle('on', T > i); li.classList.toggle('cur', k === i && T > 0.02); });
      parents.forEach((p) => p.g.setAttribute('opacity', 1 - u4));
      const cnt = Array(10).fill(0);
      chicks.forEach((c, i) => {
        const hatch = clamp(u0 * 30 * 1.1 - i, 0, 1);
        const ex = K.lerp(c.n.x, c.hx, clamp(u0 * 1.4 - i / 40, 0, 1)), ey = K.lerp(c.n.y + 6, c.hy, clamp(u0 * 1.4 - i / 40, 0, 1));
        c.egg.setAttribute('cx', c.n.x + (i % 3 - 1) * 14); c.egg.setAttribute('cy', c.n.y + 4); c.egg.setAttribute('opacity', u0 > 0 && hatch < 1 && u0 < 1 ? 1 : 0);
        const size = K.lerp(0.38, c.s, u1), b = F.byT(size); c.g._beak(b.L, b.D);
        const x = K.lerp(ex, c.tx, u2), y = K.lerp(ey, c.ty, u2);
        const di = sorted.indexOf(c), die = di < 0 ? 0 : clamp(u3 * (sorted.length + 4) - di, 0, 1);
        const op = (hatch > 0 ? 1 : 0) * (1 - die) * (1 - u4);
        c.g.setAttribute('transform', `translate(${x.toFixed(1)} ${(y - die * 30).toFixed(1)}) scale(${(0.55 + 0.25 * Math.min(1, u0 * 1.2)).toFixed(2)})`);
        c.g.setAttribute('opacity', op.toFixed(2));
        if (op > 0.5) cnt[Math.min(9, Math.floor(size * 10))]++;
      });
      const mean = K.lerp(0.62, 0.78, u4);
      later.forEach((l) => {
        const s = clamp(mean + l.z * 0.12, 0.02, 0.98), b = F.byT(s); l.g._beak(b.L, b.D);
        l.g.setAttribute('transform', `translate(${l.x} ${l.y}) scale(0.8)`); l.g.setAttribute('opacity', u4.toFixed(2));
        if (u4 > 0.5) cnt[Math.min(9, Math.floor(s * 10))]++;
      });
      fight.setAttribute('opacity', u2 > 0.3 && T < 3.3 ? 1 : 0);
      thr.setAttribute('opacity', T > 2.9 && T < 4 ? 1 : 0);
      bars.forEach((b, i) => { const h = cnt[i] * 9; b.setAttribute('y', 640 - h); b.setAttribute('height', h); });
      H.setAttribute('opacity', T < 1 ? 0.35 : 1);
      if (T >= 4.95) { now.textContent = '여러 세대 뒤: 부리가 크고 두꺼운 핀치 집단이 되었다'; now.classList.add('done'); }
      else if (T > 0.3) now.textContent = '② 계속 돌리자. 거꾸로 돌리면 되감긴다';
    }
    let prevA = null;
    K.hold(svg, {
      down(p) { if (Math.hypot(p.x - CX, p.y - CY) > CR + 40) return false; prevA = Math.atan2(p.y - CY, p.x - CX); return true; },
      move(p) {
        const a = Math.atan2(p.y - CY, p.x - CX); let d = a - prevA; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; prevA = a;
        const nT = clamp(T + d / (2 * Math.PI), 0, 5); ang += (nT - T) * 2 * Math.PI; T = nT; render();
      },
      up() {},
    }, (e) => K.svgPt(svg, e));
    knob.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return; e.preventDefault(); e.stopPropagation();
      const nT = clamp(T + (e.key === 'ArrowRight' ? 0.125 : -0.125), 0, 5); ang += (nT - T) * 2 * Math.PI; T = nT; render();
    });
    render();
    root._dw = { t: (v) => { ang += (v - T) * 2 * Math.PI; T = v; render(); } };
    return {};
  }
  window.EvDarwin = { mount };
})();
