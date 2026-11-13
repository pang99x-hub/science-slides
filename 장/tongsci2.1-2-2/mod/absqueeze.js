/* 1차시 표지(교과서 46쪽 도입): 레몬 반쪽과 식초병을 누르고 있는 동안 즙이 한 방울씩 떨어져 아래 BTB 접시(초록)가 노랗게 바뀐다.
   여섯 방울이면 다 바뀐다(이해를 돕기 위한 예). 키보드는 Enter·스페이스 한 번에 한 방울. */
(function () {
  'use strict';
  const { el, mix, C, loop } = window.AB;
  const FULL = 6;

  function mount(root) {
    const svg = root.querySelector('.ab-sq-svg'), now = root.querySelector('.ab-sq-now');
    el('rect', { x: 0, y: 252, width: 640, height: 148, fill: '#e6dccb' }, svg);
    el('path', { d: 'M0 252 H640', stroke: '#c9bba3', 'stroke-width': 3 }, svg);
    const S = {};
    // 접시 둘
    [['lemon', 170], ['vin', 470]].forEach(([k, x]) => {
      const g = el('g', { transform: `translate(${x} 300)` }, svg);
      el('ellipse', { cx: 0, cy: 14, rx: 118, ry: 30, fill: '#cfd8dc', stroke: 'none' }, g);
      el('path', { d: 'M-112 0 v14 a112 28 0 0 0 224 0 v-14', fill: '#eef5f8', stroke: '#1d2433', 'stroke-width': 3 }, g);
      const liq = el('ellipse', { cx: 0, cy: 2, rx: 104, ry: 22, fill: C.btbN }, g);
      el('ellipse', { cx: 0, cy: 0, rx: 112, ry: 28, fill: 'none', stroke: '#1d2433', 'stroke-width': 3 }, g);
      el('text', { class: 'ab-small', y: 56, text: 'BTB 용액' }, g);
      const tag = el('text', { class: 'ab-label', y: 82, text: '' }, g);
      S[k] = { x, liq, tag, n: 0, hold: false, t: 0 };
    });
    // 레몬 반쪽
    const L = el('g', { class: 'ab-sq-press', tabindex: 0, role: 'button', 'aria-label': '레몬 짜기(누르고 있기)' }, svg);
    const lb = el('g', { transform: 'translate(170 120)' }, L);
    el('ellipse', { class: 'ab-sq-ring', rx: 118, ry: 92 }, lb);
    el('ellipse', { rx: 96, ry: 64, fill: '#f6d23c', stroke: '#1d2433', 'stroke-width': 3 }, lb);
    el('ellipse', { rx: 80, ry: 50, fill: '#fbeaa0', stroke: '#e3b81f', 'stroke-width': 3 }, lb);
    for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; el('path', { d: `M0 0 L${(78 * Math.cos(a)).toFixed(1)} ${(48 * Math.sin(a)).toFixed(1)}`, stroke: '#e9c43a', 'stroke-width': 4 }, lb); }
    el('circle', { r: 9, fill: '#fff6cf', stroke: '#e3b81f', 'stroke-width': 2 }, lb);
    el('text', { class: 'ab-label', x: 170, y: 228, text: '레몬' }, L);
    // 식초병
    const V = el('g', { class: 'ab-sq-press', tabindex: 0, role: 'button', 'aria-label': '식초병 짜기(누르고 있기)' }, svg);
    const vb = el('g', { transform: 'translate(470 110)' }, V);
    el('rect', { class: 'ab-sq-ring', x: -82, y: -98, width: 164, height: 214, rx: 20 }, vb);
    el('path', { d: 'M-46 90 V-6 Q-46 -36 -18 -46 V-74 H18 V-46 Q46 -36 46 -6 V90 Q46 100 36 100 H-36 Q-46 100 -46 90 Z', fill: '#f3efe6', stroke: '#1d2433', 'stroke-width': 3 }, vb);
    el('path', { d: 'M-40 90 V20 H40 V90 Q40 94 34 94 H-34 Q-40 94 -40 90 Z', fill: '#efe1c0' }, vb);
    el('rect', { x: -22, y: -92, width: 44, height: 22, rx: 5, fill: '#c8402f', stroke: '#1d2433', 'stroke-width': 3 }, vb);
    el('rect', { x: -40, y: 30, width: 80, height: 40, rx: 4, fill: '#fff', stroke: '#1d2433', 'stroke-width': 2 }, vb);
    el('text', { class: 'ab-label', y: 57, text: '식초', 'font-size': 19 }, vb);
    el('text', { class: 'ab-label', x: 470, y: 238, text: '식초' }, V);
    // 떨어지는 방울
    const dropsG = el('g', {}, svg);
    const drops = [];
    S.lemon.node = lb; S.lemon.from = [170, 178]; S.lemon.col = '#f7e27a';
    S.vin.node = vb; S.vin.from = [470, 222]; S.vin.col = '#f2e6c9';
    const press = (k, on) => {
      const s = S[k]; s.hold = on;
      if (k === 'lemon') lb.setAttribute('transform', `translate(170 ${on ? 126 : 120}) scale(${on ? 1.06 : 1} ${on ? 0.84 : 1})`);
      else vb.setAttribute('transform', `translate(470 110) rotate(${on ? 14 : 0})`);
      if (on) { s.t = 0.12; l.start(); }
    };
    const spawn = (k) => {
      const s = S[k], [x, y] = s.from;
      const n = el('ellipse', { cx: x, cy: y, rx: 6, ry: 9, fill: s.col, stroke: '#9c8a3c', 'stroke-width': 1.5 }, dropsG);
      drops.push({ k, n, x, y, v: 60 });
    };
    function paint(k) {
      const s = S[k], u = Math.min(1, s.n / FULL);
      s.liq.setAttribute('fill', mix(C.btbN, C.btbA, u));
      s.tag.textContent = s.n ? (u >= 1 ? '노란색이 되었다' : `${s.n}방울`) : '';
      const done = S.lemon.n >= FULL, dv = S.vin.n >= FULL;
      now.textContent = done && dv ? '두 접시 모두 노랗게 — 공통점은?' : done ? '② 이번엔 식초병을 누르고 있어 보자' : '레몬을 누르고 있어 보자';
      now.classList.toggle('done', done && dv);
    }
    const l = loop((dt) => {
      for (const k of ['lemon', 'vin']) { const s = S[k]; if (s.hold) { s.t -= dt; if (s.t <= 0) { s.t = 0.24; spawn(k); } } }
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i]; d.v += 900 * dt; d.y += d.v * dt;
        if (d.y >= 298) { d.n.remove(); drops.splice(i, 1); S[d.k].n++; paint(d.k); continue; }
        d.n.setAttribute('cy', d.y.toFixed(1));
      }
      if (!drops.length && !S.lemon.hold && !S.vin.hold) l.stop();
    });
    [[L, 'lemon'], [V, 'vin']].forEach(([g, k]) => {
      g.addEventListener('pointerdown', (e) => { if (e.button) return; e.preventDefault(); e.stopPropagation(); try { g.setPointerCapture(e.pointerId); } catch (err) { /* */ } press(k, true); });
      const off = () => { if (S[k].hold) press(k, false); };
      g.addEventListener('pointerup', off); g.addEventListener('pointercancel', off); g.addEventListener('lostpointercapture', off);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); spawn(k); l.start(); } });
    });
    paint('lemon');
    root._sq = { drip(k, n) { for (let i = 0; i < n; i++) S[k].n++; paint(k); } };
    return { setActive(on) { if (!on) { press('lemon', false); press('vin', false); l.stop(); } } };
  }
  window.ABSqueeze = { mount };
})();
