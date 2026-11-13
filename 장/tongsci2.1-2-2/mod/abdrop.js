/* 4차시 2장(교과서 52쪽 그림 Ⅰ-26·27): 묽은 염산(H⁺·Cl⁻ 10쌍, 이해를 돕기 위한 예)에 스포이트 고무를 톡 누를 때마다
   수산화 나트륨 수용액 1 mL(Na⁺·OH⁻ 한 쌍)가 떨어진다. OH⁻은 H⁺을 찾아가 물이 되고, 이온 수 막대·지시약 색·온도·전류 세기가 변한다.
   온도는 모형 값: 24.5 °C + 8 °C × (생긴 물 ÷ 전체 mL) — 1 : 1에서 4 °C 오르는 교과서 탐구 값과 맞춘다. */
(function () {
  'use strict';
  const { el, ion, loop, ind, chemHTML } = window.AB;
  const N0 = 10, MAX = 20, BX0 = 170, BX1 = 550, BOT = 588;
  const temp = (n) => 24.5 + 8 * Math.min(n, N0) / (N0 + n);
  const cx = (n) => 640 + n / MAX * 320, cy = (t) => 560 - (t - 24) / 5 * 220;

  function mount(root) {
    const svg = root.querySelector('.ab-dp-svg'), now = root.querySelector('.ab-dp-now'), msg = root.querySelector('.ab-dp-msg');
    const bars = Object.fromEntries(['H', 'Cl', 'Na', 'OH', 'W', 'I'].map((k) => [k, root.querySelector(`.ab-bar[data-k="${k}"]`)]));
    const indBtns = [...root.querySelectorAll('.ab-dp-ind button')], salt = root.querySelector('.ab-dp-salt');
    el('rect', { x: 0, y: 596, width: 1000, height: 44, fill: '#e6dccb' }, svg);
    const liq = el('rect', { x: BX0 + 6, width: BX1 - BX0 - 12, fill: '#ecc51e', 'fill-opacity': 0.4 }, svg);
    el('path', { d: `M${BX0} 250 V${BOT - 14} Q${BX0} ${BOT} ${BX0 + 14} ${BOT} H${BX1 - 14} Q${BX1} ${BOT} ${BX1} ${BOT - 14} V250`, class: 'ab-glass', fill: 'none' }, svg);
    for (let m = 10; m <= 30; m += 10) { const y = BOT - m * 10; el('line', { x1: BX1 - 30, x2: BX1, y1: y, y2: y, stroke: '#1d2433', 'stroke-width': 2 }, svg); el('text', { x: BX1 - 36, y: y + 5, 'text-anchor': 'end', 'font-size': 14, fill: '#4b566a', text: `${m} mL` }, svg); }
    const layer = el('g', {}, svg);
    // 스포이트
    const drop = el('g', { class: 'ab-hand', tabindex: 0, role: 'button', 'aria-label': '스포이트 고무 누르기(한 번에 1 mL)' }, svg);
    el('rect', { class: 'ab-hit', x: 300, y: 20, width: 120, height: 210 }, drop);
    el('path', { d: 'M352 130 V214 L360 230 L368 214 V130 Z', fill: '#eef3fb', stroke: '#1d2433', 'stroke-width': 2.5 }, drop);
    el('rect', { x: 354, y: 160, width: 12, height: 56, fill: '#8fa6de' }, drop);
    const bulb = el('ellipse', { cx: 360, cy: 96, rx: 30, ry: 42, fill: '#3c4558', stroke: '#1d2433', 'stroke-width': 3 }, drop);
    el('text', { x: 420, y: 100, 'font-size': 17, 'font-weight': 700, fill: '#1d2433', text: '수산화 나트륨 수용액' }, svg);
    el('text', { x: 420, y: 124, 'font-size': 15, fill: '#4b566a', text: '톡 누르면 1 mL' }, svg);
    el('text', { class: 'ab-small', x: 360, y: 618, text: '묽은 염산 10 mL', 'font-size': 16 }, svg);
    // 온도 그래프
    el('path', { d: 'M640 330 V560 H970', fill: 'none', stroke: '#1d2433', 'stroke-width': 2.5 }, svg);
    for (let t = 24; t <= 29; t++) { el('line', { x1: 636, x2: 640, y1: cy(t), y2: cy(t), stroke: '#1d2433' }, svg); el('text', { x: 632, y: cy(t) + 5, 'text-anchor': 'end', 'font-size': 13, fill: '#4b566a', text: t }, svg); }
    [0, 10, 20].forEach((n) => el('text', { x: cx(n), y: 580, 'text-anchor': 'middle', 'font-size': 13, fill: '#4b566a', text: n }, svg));
    el('text', { x: 805, y: 600, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: '#1d2433', text: '넣은 NaOH 수용액(mL)' }, svg);
    el('text', { x: 640, y: 318, 'font-size': 14, 'font-weight': 700, fill: '#1d2433', text: '온도(°C, 모형)' }, svg);
    const npLine = el('line', { x1: cx(10), x2: cx(10), y1: 330, y2: 560, stroke: '#3fa65c', 'stroke-width': 2, 'stroke-dasharray': '6 5', opacity: 0 }, svg);
    const npText = el('text', { x: cx(10), y: 344, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 800, fill: '#2f9e5b', text: '중화점', opacity: 0 }, svg);
    const tLine = el('polyline', { points: '', fill: 'none', stroke: '#d9483b', 'stroke-width': 3 }, svg);
    el('rect', { x: 660, y: 40, width: 300, height: 110, rx: 14, fill: '#2b3242' }, svg);
    el('text', { x: 676, y: 66, fill: '#c9ced6', 'font-size': 15, 'font-weight': 700, text: '온도계(모형 값)' }, svg);
    const tRead = el('text', { x: 920, y: 128, 'text-anchor': 'end', fill: '#9cf0b0', 'font-size': 50, 'font-weight': 700, 'font-family': 'IBM Plex Mono, monospace', text: '24.5' }, svg);
    el('text', { x: 926, y: 128, fill: '#9cf0b0', 'font-size': 18, text: '°C' }, svg);
    let n = 0, tool = 'btb', P = [], falling = [], hist = [24.5];
    const cnt = () => ({ H: P.filter((p) => p.k === 'H' && !p.gone).length, Cl: P.filter((p) => p.k === 'Cl').length, Na: P.filter((p) => p.k === 'Na').length, OH: P.filter((p) => p.k === 'OH' && !p.gone).length, W: P.filter((p) => p.k === 'W').length });
    const rnd = (a, b) => a + Math.random() * (b - a);
    const top = () => BOT - (N0 + n) * 10;
    function add(k, x, y) { const g = ion(layer, k, x, y, 0.85); const p = { k, g, x, y, vx: rnd(-20, 20), vy: rnd(-20, 20), gone: false }; P.push(p); return p; }
    function reset() {
      layer.innerHTML = ''; P = []; falling.forEach((f) => f.n.remove()); falling = []; n = 0; hist = [24.5];
      for (let i = 0; i < N0; i++) { add('H', rnd(200, 520), rnd(top() + 20, BOT - 20)); add('Cl', rnd(200, 520), rnd(top() + 20, BOT - 20)); }
      paint();
    }
    function logical() { // 반응이 다 끝난 뒤의 수(지시약·막대는 이 값을 쓴다)
      const r = Math.min(n, N0); return { H: N0 - r, Cl: N0, Na: n, OH: n - r, W: r };
    }
    function paint() {
      const L = logical(), kind = L.H ? 'a' : L.OH ? 'b' : 'n';
      liq.setAttribute('y', top()); liq.setAttribute('height', BOT - 4 - top());
      const c = ind(tool, kind); liq.setAttribute('fill', c || '#dbe9f2'); liq.setAttribute('fill-opacity', c ? 0.42 : 0.6);
      const T = temp(n); tRead.textContent = T.toFixed(1);
      tLine.setAttribute('points', hist.map((t, i) => `${cx(i).toFixed(1)},${cy(t).toFixed(1)}`).join(' '));
      const I = L.H + L.Cl + L.Na + L.OH;
      Object.entries({ H: L.H, Cl: L.Cl, Na: L.Na, OH: L.OH, W: L.W }).forEach(([k, v]) => { bars[k].style.setProperty('--v', v / MAX); bars[k].querySelector('b').textContent = v; });
      const cur = I / (N0 + n) / 2; bars.I.style.setProperty('--v', cur); bars.I.querySelector('b').textContent = Math.round(cur * 100) + '%';
      const np = n >= N0; npLine.setAttribute('opacity', np ? 1 : 0); npText.setAttribute('opacity', np ? 1 : 0);
      salt.hidden = n !== N0;
      const word = tool === 'btb' ? { a: '노란색', n: '초록색', b: '파란색' }[kind] : (kind === 'b' ? '붉은색' : '무색');
      msg.innerHTML = n === 0 ? '염산만 있다. 스포이트 고무를 톡 눌러 보자.'
        : n < N0 ? `${n} mL 넣음: OH<sup>−</sup>이 H<sup>+</sup>을 만나 물이 되었다. H<sup>+</sup>이 남아 <b>산성</b>(${word}).`
        : n === N0 ? `<b>중화점</b>: H<sup>+</sup>과 OH<sup>−</sup>이 모두 반응했다 → <b>중성</b>(${word}). 온도가 가장 높다.`
        : `중화점 뒤: 더 반응할 H<sup>+</sup>이 없어 OH<sup>−</sup>이 쌓인다 → <b>염기성</b>(${word}). 반응열이 없고 식은 용액이 들어와 온도가 내려간다.`;
      now.textContent = n >= MAX ? '다 넣었다 — 이온 수가 어떻게 변했나?' : n >= N0 ? '중화점을 지나면 무엇이 달라질까? 더 넣어 보자' : '스포이트 고무를 톡 눌러 한 방울씩';
      now.classList.toggle('done', n >= N0);
    }
    function tap() {
      if (n >= MAX) { msg.textContent = '비커가 찼다. «다시»로 처음부터.'; return; }
      bulb.setAttribute('ry', 30); setTimeout(() => bulb.setAttribute('ry', 42), 140);
      const f = { n: el('ellipse', { cx: 360, cy: 236, rx: 8, ry: 11, fill: '#8fa6de', stroke: '#3c4558', 'stroke-width': 1.5 }, svg), y: 236, v: 120 };
      falling.push(f); n++; hist.push(temp(n)); l.start();
    }
    function land() {
      const x = rnd(250, 470), y = top() + 24;
      add('Na', x - 18, y);
      const oh = add('OH', x + 18, y);
      const h = P.filter((p) => p.k === 'H' && !p.gone && !p.taken).sort((a, b) => Math.hypot(a.x - x, a.y - y) - Math.hypot(b.x - x, b.y - y))[0];
      if (h) { h.taken = true; oh.target = h; }
      paint();
    }
    function bond(oh) {
      const h = oh.target; oh.gone = true; h.gone = true; oh.g.remove(); h.g.remove();
      P = P.filter((p) => p !== oh && p !== h);
      const w = add('W', (oh.x + h.x) / 2, (oh.y + h.y) / 2);
      const flash = el('circle', { cx: w.x, cy: w.y, r: 26, fill: '#ffe27a', opacity: 0.8 }, svg); setTimeout(() => flash.remove(), 260);
    }
    drop.addEventListener('pointerdown', (e) => { if (e.button) return; e.preventDefault(); e.stopPropagation(); tap(); });
    drop.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); tap(); } });
    indBtns.forEach((b) => b.addEventListener('click', () => { tool = b.dataset.k; indBtns.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); paint(); }));
    root.querySelector('.ab-dp-reset').addEventListener('click', reset);
    const l = loop((dt) => {
      for (let i = falling.length - 1; i >= 0; i--) { const f = falling[i]; f.v += 1400 * dt; f.y += f.v * dt; if (f.y >= top()) { f.n.remove(); falling.splice(i, 1); land(); } else f.n.setAttribute('cy', f.y.toFixed(1)); }
      for (const p of P) {
        if (p.target) {
          const h = p.target, dx = h.x - p.x, dy = h.y - p.y, d = Math.hypot(dx, dy);
          if (d < 26) { bond(p); continue; }
          p.x += dx / d * 260 * dt; p.y += dy / d * 260 * dt;
        } else {
          p.vx += rnd(-260, 260) * dt; p.vy += rnd(-260, 260) * dt; p.vx *= 0.985; p.vy *= 0.985; p.x += p.vx * dt; p.y += p.vy * dt;
        }
        if (p.x < BX0 + 22) { p.x = BX0 + 22; p.vx = Math.abs(p.vx); } if (p.x > BX1 - 48) { p.x = BX1 - 48; p.vx = -Math.abs(p.vx); }
        if (p.y < top() + 18) { p.y = top() + 18; p.vy = Math.abs(p.vy); } if (p.y > BOT - 18) { p.y = BOT - 18; p.vy = -Math.abs(p.vy); }
        p.g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
      }
    });
    root.querySelector('.ab-dp-eq').innerHTML = chemHTML('H^+ + OH^- → H_2O');
    reset();
    root._dp = { tap(k) { for (let i = 0; i < k; i++) tap(); }, tool(t) { indBtns.find((b) => b.dataset.k === t).click(); } };
    return { setActive(on) { if (on) l.start(); else l.stop(); } };
  }
  window.ABDrop = { mount };
})();
