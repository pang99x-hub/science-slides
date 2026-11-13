/* 탐구 2 핵산을 이용한 감염병 진단 기술 체험(교과서 133쪽). 증폭 손잡이를 원을 그리며 돌리면(한 바퀴에 30번, 12°에 한 번) 증폭 횟수가 늘고,
   확대 창에서 사람 3의 병원체 핵산(빨강)은 1 → 2 → 4 → …로 늘며, 사람 4는 병원체 핵산이 없어 그대로다(회색은 사람의 핵산, 늘리지 않는다).
   그래프: 핵산의 양-증폭 횟수(눈금 없음, 모양만). 30번이면 처음의 2³⁰ ≈ 10억 배. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const MAXN = 30, SHOW = 64;
  const amount = (n) => (Math.exp(0.09 * n) - 1) / (Math.exp(0.09 * MAXN) - 1);   // 교과서 그래프처럼 처음엔 완만하다 가팔라진다(모양만)
  const big = (n) => { const v = 2 ** n; if (v < 10000) return v.toLocaleString('ko-KR'); if (v < 1e8) return `약 ${Math.round(v / 1e4).toLocaleString('ko-KR')}만`; return `약 ${Math.round(v / 1e8).toLocaleString('ko-KR')}억`; };
  const helix = (p, x, y, cls) => { const g = el('g', { class: `pc-h ${cls}`, transform: `translate(${x} ${y})` }, p); el('path', { d: 'M-8 -9 C 6 -5, -6 5, 8 9 M 8 -9 C -6 -5, 6 5, -8 9' }, g); el('path', { class: 'pc-rung', d: 'M-3 -6 H 3 M -3 0 H 3 M -3 6 H 3' }, g); return g; };

  function mount(root) {
    const svg = root.querySelector('.pc-svg'), q = (s) => svg.querySelector(s);
    const cnt = q('.pc-count'), mult = q('.pc-mult'), l3 = q('.pc-l3'), l4 = q('.pc-l4'), g3 = q('.pc-g3'), g4 = q('.pc-g4');
    const z3 = q('.pc-z3 .pc-dna'), z4 = q('.pc-z4 .pc-dna'), t3 = q('.pc-tube3'), t4 = q('.pc-tube4');
    // 위쪽: 두 시료 관과 장치로 들어가는 화살표(정적)
    const top = q('.pc-steps');
    [[170, '사람 3'], [300, '사람 4']].forEach(([x, n]) => { const g = el('g', { class: 'pc-samp', transform: `translate(${x} 40)` }, top); el('path', { d: 'M-14 0 h 28 v 74 a 14 14 0 0 1 -28 0 z' }, g); el('path', { class: 'pc-sl', d: 'M-14 44 h 28 v 30 a 14 14 0 0 1 -28 0 z' }, g); el('text', { y: -10 }, g).textContent = n; });
    el('path', { class: 'pc-arrow', d: 'M240 126 V 158' }, top);
    // 사람 핵산(회색) 몇 가닥은 두 창 모두 그대로
    const fixed = (g, x0) => { [[x0 + 30, 140], [x0 + 160, 170], [x0 + 60, 280], [x0 + 170, 290]].forEach(([x, y]) => helix(g, x, y, 'human')); };
    fixed(z3, 580); fixed(z4, 806);
    const path3 = [], slots = [];
    for (let i = 0; i < SHOW; i++) slots.push([580 + 22 + (i % 8) * 22, 114 + 24 + Math.floor(i / 8) * 21]);
    let n = 0, shown = 0;
    const X = (k) => 610 + 380 * k / MAXN, Y = (v) => 610 - 200 * v;
    function paint() {
      cnt.textContent = `증폭 ${n}회`;
      mult.textContent = n ? `병원체 핵산: 처음의 ${big(n)}배` : '손잡이를 돌려 증폭하자';
      const want = Math.min(SHOW, 2 ** n);
      while (shown < want) { const [x, y] = slots[shown]; const h = helix(z3, x, y, 'path'); path3.push(h); if (window.gsap && !window.Deck.reduce) gsap.from(h, { scale: 0.2, transformOrigin: '50% 50%', duration: 0.3 }); shown++; }
      while (shown > want) { path3.pop().remove(); shown--; }
      q('.pc-z3').classList.toggle('full', 2 ** n > SHOW);
      const p3 = [], p4 = [];
      for (let k = 0; k <= n; k++) { p3.push(`${X(k).toFixed(1)} ${Y(amount(k)).toFixed(1)}`); p4.push(`${X(k).toFixed(1)} ${Y(0).toFixed(1)}`); }
      l3.setAttribute('d', 'M' + p3.join(' L ')); l4.setAttribute('d', 'M' + p4.join(' L '));
      g3.setAttribute('x', (Math.min(X(n), 930) + 8).toFixed(1)); g3.setAttribute('y', (Y(amount(n)) - 14).toFixed(1));
      g4.setAttribute('x', (Math.min(X(n), 930) + 8).toFixed(1)); g4.setAttribute('y', (Y(0) + 22).toFixed(1));
      t3.classList.toggle('glow', n >= 14); t4.classList.remove('glow');
      root.classList.toggle('pc-done', n >= MAXN);
    }
    const knob = window.Scene3D.dial(q('.pc-knob'), 200, 400, { max: 360, v0: 0, onChange: (v) => { const k = Math.round(v * MAXN); if (k !== n) { n = k; paint(); } } });
    root._pcr = { set: (k) => knob.set(k / MAXN) };
    paint();
    return {};
  }
  window.PcrAmp = { mount };
})();
