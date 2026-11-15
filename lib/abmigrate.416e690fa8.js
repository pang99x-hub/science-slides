/* 2차시 2장(교과서 48~49쪽 탐구 자료): 질산 칼륨 수용액을 적신 리트머스 종이 가운데에 산(염산) 또는 염기(수산화 나트륨 수용액)를
   적신 거름종이를 놓고 전원 장치의 다이얼을 돌린다. 색을 바꾸는 이온(H⁺은 (−)극, OH⁻은 (+)극)이 전압에 비례해 번져 간다.
   극 바꾸기로 방향을 뒤집을 수 있다. 번지는 빠르기·이온 수는 이해를 돕기 위한 모형. */
(function () {
  'use strict';
  const { el, ion, grab, loop, clamp, C } = window.AB;
  const MODE = {
    a: { paper: C.litB, show: C.litR, ion: 'H', goes: -1, name: '염산', who: 'H⁺', word: '붉은색' },
    b: { paper: C.litR, show: C.litB, ion: 'OH', goes: 1, name: '수산화 나트륨 수용액', who: 'OH⁻', word: '푸른색' },
  };
  const X0 = 110, X1 = 890, MID = 500, Y0 = 250, Y1 = 330, DCX = 500, DCY = 520;

  function mount(root) {
    const svg = root.querySelector('.ab-mg-svg'), now = root.querySelector('.ab-mg-now'), msg = root.querySelector('.ab-mg-msg');
    const segBtns = [...root.querySelectorAll('.ab-mg-mode button')], flipBtn = root.querySelector('.ab-mg-flip'), newBtn = root.querySelector('.ab-mg-new');
    el('rect', { x: 70, y: 200, width: 860, height: 180, rx: 10, fill: '#eef6fa', stroke: '#9fb5c2', 'stroke-width': 3 }, svg);
    el('text', { class: 'ab-small', x: 140, y: 222, text: '유리판', 'text-anchor': 'start', style: 'text-anchor:start' }, svg);
    const paper = el('rect', { x: X0, y: Y0, width: X1 - X0, height: Y1 - Y0, fill: C.litB, stroke: '#1d2433', 'stroke-width': 2 }, svg);
    const band = el('rect', { x: MID, y: Y0, width: 0, height: Y1 - Y0, fill: C.litR }, svg);
    el('text', { class: 'ab-small', x: 300, y: Y1 + 26, text: '질산 칼륨 수용액을 적신 리트머스 종이' }, svg);
    const filt = el('rect', { x: MID - 22, y: Y0 + 12, width: 44, height: 56, rx: 4, fill: '#fbfbf7', stroke: '#1d2433', 'stroke-width': 2 }, svg);
    const fl = el('text', { class: 'ab-small', x: MID, y: Y0 - 12, text: '' }, svg);
    const ionsG = el('g', {}, svg);
    // 집게와 극 표시
    const pole = [X0 - 10, X1 + 10].map((x, i) => {
      el('rect', { x: x - 18, y: Y0 - 14, width: 36, height: Y1 - Y0 + 28, rx: 6, fill: '#3c4558', stroke: '#1d2433', 'stroke-width': 2 }, svg);
      const c = el('circle', { cx: x, cy: 150, r: 34, fill: '#fff', stroke: '#1d2433', 'stroke-width': 3 }, svg);
      const t = el('text', { x, y: 162, 'text-anchor': 'middle', 'font-size': 34, 'font-weight': 800, text: '' }, svg);
      el('path', { d: `M${x} ${Y1 + 14} V${DCY} H${i ? 640 : 360}`, fill: 'none', stroke: i ? '#d9483b' : '#1d2433', 'stroke-width': 4 }, svg);
      return { c, t };
    });
    // 전원 장치와 다이얼
    el('rect', { x: 330, y: 440, width: 340, height: 170, rx: 16, fill: '#d9dde3', stroke: '#1d2433', 'stroke-width': 3 }, svg);
    el('text', { class: 'ab-small', x: 400, y: 466, text: '전원 장치' }, svg);
    for (let i = 0; i <= 10; i++) { const a = (-135 + i * 27) * Math.PI / 180; el('line', { x1: DCX + 62 * Math.sin(a), y1: DCY - 62 * Math.cos(a), x2: DCX + 74 * Math.sin(a), y2: DCY - 74 * Math.cos(a), stroke: '#1d2433', 'stroke-width': i % 5 ? 2 : 4 }, svg); }
    el('text', { class: 'ab-small', x: DCX - 74, y: DCY + 72, text: '약하게' }, svg);
    el('text', { class: 'ab-small', x: DCX + 74, y: DCY + 72, text: '세게' }, svg);
    const dial = el('g', { class: 'ab-hand', tabindex: 0, role: 'slider', 'aria-label': '전압 다이얼(돌리기)', 'aria-valuemin': 0, 'aria-valuemax': 100 }, svg);
    el('circle', { cx: DCX, cy: DCY, r: 54, fill: '#3c4558', stroke: '#1d2433', 'stroke-width': 3 }, dial);
    const knob = el('g', {}, dial);
    el('rect', { x: DCX - 6, y: DCY - 50, width: 12, height: 34, rx: 5, fill: '#ffe27a' }, knob);
    el('circle', { cx: DCX, cy: DCY, r: 96, class: 'ab-hit' }, dial);
    let mode = 'a', flip = false, v = 0, fl1 = 0, fr1 = 0, parts = [];
    const sideOfIon = () => MODE[mode].goes * (flip ? -1 : 1);   // −1: 왼쪽으로, 1: 오른쪽으로
    function poles() {
      const left = flip ? '+' : '−', right = flip ? '−' : '+';
      pole[0].t.textContent = left; pole[1].t.textContent = right;
      pole[0].c.setAttribute('fill', left === '+' ? '#fde3df' : '#e3ecfb'); pole[1].c.setAttribute('fill', right === '+' ? '#fde3df' : '#e3ecfb');
    }
    function reset() {
      const M = MODE[mode];
      fl1 = 0; fr1 = 0; paper.setAttribute('fill', M.paper); band.setAttribute('fill', M.show);
      fl.textContent = `${M.name}을 적신 거름종이`;
      ionsG.innerHTML = ''; parts = [];
      for (let i = 0; i < 7; i++) { const g = ion(ionsG, M.ion, MID, Y0 + 20 + (i % 3) * 20); g.style.opacity = 0; parts.push({ g, d: Math.random(), y: Y0 + 18 + (i % 3) * 22 }); }
      paint();
    }
    const seen = { a: false, b: false, f: false };
    function paint() {
      const M = MODE[mode], s = sideOfIon();
      band.setAttribute('x', (MID - fl1).toFixed(1)); band.setAttribute('width', (fl1 + fr1).toFixed(1));
      knob.setAttribute('transform', `rotate(${(-135 + 270 * v).toFixed(1)} ${DCX} ${DCY})`);
      dial.setAttribute('aria-valuenow', Math.round(v * 100));
      const far = s < 0 ? fl1 : fr1, toward = (s < 0 ? (flip ? '(+)' : '(−)') : (flip ? '(−)' : '(+)'));
      if (far > 40) {
        msg.innerHTML = `${M.word}이 <b>${toward}극</b> 쪽으로 번진다 → 색을 바꾼 이온은 ${toward === '(−)' ? '양이온' : '음이온'}`;
        seen[mode] = true; if (flip) seen.f = true;
        const all = seen.a && seen.b && seen.f;
        now.textContent = all ? '색을 바꾼 이온: 산성은 H⁺, 염기성은 OH⁻' : !seen.b ? '② 이번엔 수산화 나트륨 수용액으로 바꿔 보자' : '③ 극을 바꾸면 어떻게 될까?';
        now.classList.toggle('done', all);
      } else msg.textContent = v < 0.05 ? '전원이 꺼져 있다. 다이얼을 돌려 보자.' : '전류가 흐른다. 색이 어디로 번지는지 보자.';
    }
    grab(dial, svg, {
      move(p) { let a = Math.atan2(p.x - DCX, -(p.y - DCY)) * 180 / Math.PI; a = clamp(a, -135, 135); v = (a + 135) / 270; paint(); },
    });
    dial.addEventListener('keydown', (e) => { const d = { ArrowRight: 0.1, ArrowUp: 0.1, ArrowLeft: -0.1, ArrowDown: -0.1 }[e.key]; if (d) { e.preventDefault(); e.stopPropagation(); v = clamp(v + d, 0, 1); paint(); } });
    segBtns.forEach((b) => b.addEventListener('click', () => { mode = b.dataset.k; segBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); reset(); }));
    flipBtn.addEventListener('click', () => { flip = !flip; flipBtn.setAttribute('aria-pressed', String(flip)); poles(); paint(); });
    newBtn.addEventListener('click', reset);
    const l = loop((dt) => {
      const s = sideOfIon(), sp = 46 * v;
      if (s < 0) fl1 = Math.min(MID - X0, fl1 + sp * dt); else fr1 = Math.min(X1 - MID, fr1 + sp * dt);
      fl1 = Math.max(fl1, Math.min(14, fl1 + 2 * dt)); fr1 = Math.max(fr1, Math.min(14, fr1 + 2 * dt));
      band.setAttribute('x', (MID - fl1).toFixed(1)); band.setAttribute('width', (fl1 + fr1).toFixed(1));
      const reach = s < 0 ? fl1 : fr1;
      for (const q of parts) {
        q.d = (q.d + dt * (0.15 + 0.6 * v)) % 1;
        const x = MID + s * q.d * Math.max(10, reach - 8);
        q.g.setAttribute('transform', `translate(${x.toFixed(1)} ${q.y}) scale(0.85)`);
        q.g.style.opacity = v > 0.05 ? (1 - q.d * 0.5).toFixed(2) : 0;
      }
      if (Math.random() < dt * 4) paint();
    });
    poles(); reset();
    root._mg = { set(m, vv, f) { if (m && m !== mode) segBtns.find((b) => b.dataset.k === m).click(); v = vv; if (f !== undefined && f !== flip) flipBtn.click(); paint(); }, run(sec) { for (let i = 0; i < sec * 30; i++) { const s = sideOfIon(); if (s < 0) fl1 = Math.min(MID - X0, fl1 + 46 * v / 30); else fr1 = Math.min(X1 - MID, fr1 + 46 * v / 30); } paint(); } };
    return { setActive(on) { if (on) l.start(); else l.stop(); } };
  }
  window.ABMigrate = { mount };
})();
