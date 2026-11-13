/* 2차시 3장(교과서 48~49쪽 이온화 식): 물속에 놓인 산·염기 입자에서 H 또는 OH를 손으로 잡아 떼어 내면
   끈이 늘어나다 끊기며 이온(전하)이 되고, 남은 부분도 이온이 된다. 다 떼면 이온화 식이 지어진다. */
(function () {
  'use strict';
  const { el, ion, chem, chemHTML, grab, loop, ION } = window.AB;
  const MOL = {
    HCl: { kind: 'a', core: 'Cl', coreT: 'Cl', part: 'H', n: 1, eq: 'HCl → H^+ + Cl^-', name: '염화 수소(염산)' },
    AC: { kind: 'a', core: 'AC', coreT: 'CH_3COO', part: 'H', n: 1, eq: 'CH_3COOH → H^+ + CH_3COO^-', name: '아세트산' },
    H2SO4: { kind: 'a', core: 'SO4', coreT: 'SO_4', part: 'H', n: 2, eq: 'H_2SO_4 → 2H^+ + SO_4^2-', name: '황산' },
    H2CO3: { kind: 'a', core: 'CO3', coreT: 'CO_3', part: 'H', n: 2, eq: 'H_2CO_3 → 2H^+ + CO_3^2-', name: '탄산' },
    NaOH: { kind: 'b', core: 'Na', coreT: 'Na', part: 'OH', n: 1, eq: 'NaOH → Na^+ + OH^-', name: '수산화 나트륨' },
    KOH: { kind: 'b', core: 'K', coreT: 'K', part: 'OH', n: 1, eq: 'KOH → K^+ + OH^-', name: '수산화 칼륨' },
    CaOH2: { kind: 'b', core: 'Ca', coreT: 'Ca', part: 'OH', n: 2, eq: 'Ca(OH)_2 → Ca^2+ + 2OH^-', name: '수산화 칼슘' },
    NH4OH: { kind: 'b', core: 'NH4', coreT: 'NH_4', part: 'OH', n: 1, eq: 'NH_4OH → NH_4^+ + OH^-', name: '암모니아수' },
  };
  const CX = 500, CY = 300, SNAP = 150;

  function mount(root) {
    const svg = root.querySelector('.ab-sp-svg'), now = root.querySelector('.ab-sp-now'), msg = root.querySelector('.ab-sp-msg');
    const eqEl = root.querySelector('.ab-sp-eq'), picks = [...root.querySelectorAll('.ab-sp-pick')];
    const sumA = root.querySelector('.ab-sp-sum[data-k="a"] b'), sumB = root.querySelector('.ab-sp-sum[data-k="b"] b');
    el('rect', { x: 70, y: 70, width: 860, height: 500, fill: '#d6eaf5' }, svg);
    el('path', { d: 'M60 30 V560 Q60 590 90 590 H910 Q940 590 940 560 V30', class: 'ab-glass', fill: 'none' }, svg);
    el('line', { x1: 70, y1: 70, x2: 930, y2: 70, stroke: '#6fa4c6', 'stroke-width': 3 }, svg);
    el('text', { class: 'ab-small', x: 870, y: 100, text: '물' }, svg);
    const bonds = el('g', {}, svg), stage = el('g', {}, svg), free = el('g', {}, svg);
    let cur = null, coreG = null, parts = [], floaters = [], done = { a: new Set(), b: new Set() };
    const t0 = performance.now();
    function pick(k) {
      cur = k; const M = MOL[k];
      picks.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === k)));
      bonds.innerHTML = ''; stage.innerHTML = ''; free.innerHTML = ''; floaters = [];
      coreG = el('g', { transform: `translate(${CX} ${CY})` }, stage);
      const R = ION[M.core].r * 2;
      el('circle', { r: R, fill: ION[M.core].f, stroke: '#1d2433', 'stroke-width': 2.5 }, coreG);
      const ct = el('text', { class: 'ab-ion-t' + (ION[M.core].w ? ' w' : ''), y: 9, 'font-size': M.core === 'AC' ? 22 : 28 }, coreG); chem(ct, M.coreT);
      coreG._t = ct;
      parts = [];
      for (let i = 0; i < M.n; i++) {
        const a = (M.n === 1 ? -30 : -60 + i * 120) * Math.PI / 180, d = R + (M.part === 'H' ? 34 : 44);
        const hx = CX + d * Math.cos(a), hy = CY + d * Math.sin(a);
        const line = el('line', { x1: CX, y1: CY, x2: hx, y2: hy, stroke: '#1d2433', 'stroke-width': 7, 'stroke-linecap': 'round' }, bonds);
        const g = el('g', { class: 'ab-hand', tabindex: 0, role: 'button', 'aria-label': `${M.part === 'H' ? 'H' : 'OH'} 떼어 내기` }, stage);
        el('circle', { class: 'ab-hit', r: 64 }, g);
        el('circle', { r: M.part === 'H' ? 26 : 38, fill: ION[M.part].f, stroke: '#1d2433', 'stroke-width': 2.5 }, g);
        const t = el('text', { class: 'ab-ion-t', y: 9, 'font-size': 26 }, g); chem(t, M.part === 'H' ? 'H' : 'OH');
        const P = { g, t, line, hx, hy, x: hx, y: hy, off: false, back: false };
        g.setAttribute('transform', `translate(${hx} ${hy})`);
        grab(g, svg, {
          start() { if (P.off) return false; P.back = false; },
          move(p) {
            P.x = p.x; P.y = p.y; g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
            const d2 = Math.hypot(p.x - CX, p.y - CY) - Math.hypot(hx - CX, hy - CY);
            line.setAttribute('x2', p.x.toFixed(1)); line.setAttribute('y2', p.y.toFixed(1));
            line.setAttribute('stroke-width', Math.max(1.5, 7 - d2 / 25).toFixed(1));
            line.setAttribute('stroke-dasharray', d2 > 60 ? '6 6' : '');
            if (d2 > SNAP) snap(P);
          },
          end() { if (!P.off) { P.back = true; l.start(); msg.textContent = '조금 더 멀리 끌어야 떨어진다.'; } },
        });
        g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); if (!P.off) snap(P); } });
        parts.push(P);
      }
      eqEl.innerHTML = chemHTML(M.eq.split(' → ')[0]) + ' → <span class="ab-sp-q">?</span>';
      msg.innerHTML = `<b>${M.name}</b> 입자. ${M.part === 'H' ? 'H' : 'OH'}를 잡아 멀리 떼어 내 보자.`;
      now.textContent = `② ${M.part === 'H' ? 'H' : 'OH'}를 잡고 멀리 끌어 보자`;
      l.start();
    }
    function snap(P) {
      const M = MOL[cur];
      P.off = true; P.line.remove(); P.g.remove();
      const ig = ion(free, M.part, P.x, P.y);
      floaters.push({ g: ig, x: P.x, y: P.y, vx: (P.x - CX) * 0.6, vy: (P.y - CY) * 0.6, k: 1.6 });
      const left = parts.filter((q) => !q.off).length;
      if (!left) {
        coreG.remove();
        const cg = ion(free, M.core, CX, CY);
        floaters.push({ g: cg, x: CX, y: CY, vx: 0, vy: 30, k: 2 });
        eqEl.innerHTML = chemHTML(M.eq);
        done[M.kind].add(cur);
        picks.find((b) => b.dataset.k === cur).classList.add('ok');
        msg.innerHTML = `${M.part === 'H' ? '수소 이온' : '수산화 이온'} ${M.n}개와 ${chemHTML(ION[M.core].t)} 1개로 나뉘었다.`;
        sum();
        now.textContent = done.a.size + done.b.size >= 4 ? '여러 산·염기에 공통인 이온은?' : '③ 다른 물질도 골라 떼어 보자';
        now.classList.toggle('done', done.a.size >= 2 && done.b.size >= 2);
      } else msg.textContent = `하나 떨어졌다. 남은 ${M.part === 'H' ? 'H' : 'OH'}도 떼어 보자.`;
    }
    function sum() {
      sumA.innerHTML = done.a.size ? `H<sup>+</sup> <small>(${done.a.size}가지 산 모두)</small>` : '?';
      sumB.innerHTML = done.b.size ? `OH<sup>−</sup> <small>(${done.b.size}가지 염기 모두)</small>` : '?';
    }
    const l = loop((dt) => {
      let any = false;
      for (const P of parts) if (P.back && !P.off) {
        P.x += (P.hx - P.x) * Math.min(1, dt * 10); P.y += (P.hy - P.y) * Math.min(1, dt * 10);
        P.g.setAttribute('transform', `translate(${P.x.toFixed(1)} ${P.y.toFixed(1)})`);
        P.line.setAttribute('x2', P.x.toFixed(1)); P.line.setAttribute('y2', P.y.toFixed(1)); P.line.setAttribute('stroke-width', 7); P.line.setAttribute('stroke-dasharray', '');
        if (Math.hypot(P.hx - P.x, P.hy - P.y) < 0.5) P.back = false; else any = true;
      }
      const t = (performance.now() - t0) / 1000;
      for (const q of floaters) {
        q.vx *= 0.97; q.vy *= 0.97;
        q.x = Math.max(110, Math.min(890, q.x + q.vx * dt + Math.sin(t * 1.3 + q.k * 7 + q.y) * 0.3));
        q.y = Math.max(110, Math.min(540, q.y + q.vy * dt + Math.cos(t * 1.1 + q.x) * 0.3));
        q.g.setAttribute('transform', `translate(${q.x.toFixed(1)} ${q.y.toFixed(1)}) scale(${q.k})`);
        any = true;
      }
      if (!any) l.stop();
    });
    picks.forEach((b) => { b.innerHTML = chemHTML(b.dataset.f); b.addEventListener('click', () => pick(b.dataset.k)); });
    pick('HCl');
    root._sp = { pick, pull(k) { pick(k); parts.forEach((P) => { P.x = P.hx + 200; P.y = P.hy - 40; snap(P); }); } };
    return { setActive(on) { if (on) l.start(); else l.stop(); } };
  }
  window.ABSplit = { mount };
})();
