/* 2차시 2장 빛 · 국화(교과서 74쪽 그림 Ⅱ-3): 가을, 낮이 짧아질 때 꽃을 피운다.
   24시간 시계(위가 낮 12시, 아래가 밤 12시)의 «해 지는 시각» 손잡이를 돌려 낮 길이를 정한다(해 뜨는 시각은 낮 12시를 사이에 두고 마주 움직인다).
   날이 흘러가며 국화가 자라고, 낮이 기준보다 짧은 날이 이어지면 꽃눈이 생겨 핀다. 기준 길이(12시간)는 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const { el, pt, clamp, lerp, loop } = window.Eco;
  const C = { x: 290, y: 340 }, R = 170, CRIT = 12;
  const ang = (h) => Math.PI / 2 + (h - 12) / 24 * Math.PI * 2;   // 시각 → 각도(SVG, 12시가 위 → y가 위로 가도록 아래에서 뒤집음)
  const P = (h, r = R) => ({ x: C.x - r * Math.cos(ang(h)), y: C.y - r * Math.sin(ang(h)) });

  function mount(root) {
    const svg = root.querySelector('.cm-svg');
    el('rect', { class: 'cm-bg', x: -400, y: -300, width: 1856, height: 1300 }, svg);
    // 시계
    el('circle', { class: 'cm-face', cx: C.x, cy: C.y, r: R + 34 }, svg);
    const night = el('circle', { class: 'cm-night', cx: C.x, cy: C.y, r: R }, svg);
    const day = el('path', { class: 'cm-day' }, svg);
    for (let h = 0; h < 24; h++) {
      const a = P(h, R + 6), b = P(h, R + (h % 6 ? 16 : 26));
      el('line', { class: 'cm-tick', x1: a.x, y1: a.y, x2: b.x, y2: b.y }, svg);
      // 눈금 글자: 6시·18시는 손잡이(해 뜨는·지는 시각)가 지나가는 자리라 시계판 바깥으로 비켜 둔다
      if (h % 6 === 0) { const side = h === 6 || h === 18; const q = P(h, side ? R + 42 : R + 52); const t = el('text', { class: 'cm-hr', x: q.x, y: q.y + 8 }, svg); t.textContent = { 0: '밤 12시', 6: '6시', 12: '낮 12시', 18: '18시' }[h]; if (side) t.style.textAnchor = q.x < C.x ? 'end' : 'start'; }
    }
    const crit = el('path', { class: 'cm-crit' }, svg);
    const hand = el('line', { class: 'cm-hand', x1: C.x, y1: C.y }, svg);
    const sunI = el('circle', { class: 'cm-sunI', r: 14 }, svg);
    const riseK = el('circle', { class: 'cm-rise', r: 14 }, svg);
    const knob = el('g', { class: 'cm-knob', tabindex: '0', role: 'slider', 'aria-label': '해 지는 시각(낮 길이)', 'aria-valuemin': '8', 'aria-valuemax': '16' }, svg);
    el('circle', { r: 26 }, knob); el('text', { y: 8 }, knob).textContent = '☾';
    const lenT = el('text', { class: 'cm-len', x: C.x, y: C.y + R + 100 }, svg);
    const lenS = el('text', { class: 'cm-lens', x: C.x, y: C.y + R + 138 }, svg);
    // 화분과 국화
    const pot = el('g', { transform: 'translate(-110 0)' }, svg);
    el('path', { class: 'cm-pot', d: 'M650 560 L670 640 L830 640 L850 560 Z' }, pot);
    el('rect', { class: 'cm-pot', x: 638, y: 548, width: 224, height: 20, rx: 6 }, pot);
    const plant = el('g', { transform: 'translate(-110 0)' }, svg);
    const stems = [-60, -20, 20, 60].map((dx) => ({ dx, e: el('path', { class: 'cm-stem' }, plant) }));
    const leaves = Array.from({ length: 14 }, (_, i) => el('path', { class: 'cm-leaf', 'data-i': i }, plant));
    const heads = stems.map(() => {
      const g = el('g', { class: 'cm-head' }, plant);
      const bud = el('circle', { class: 'cm-bud', r: 9 }, g);
      const petals = Array.from({ length: 14 }, (_, i) => el('ellipse', { class: 'cm-pet', rx: 5, ry: 16, transform: `rotate(${i * 360 / 14}) translate(0 -14)` }, g));
      const mid = el('circle', { class: 'cm-mid', r: 8 }, g);
      return { g, bud, petals, mid };
    });
    el('text', { class: 'cm-pn', x: 640, y: 680 }, svg).textContent = '국화';
    // 시금치(낮이 길어질 때 꽃대가 올라오는 식물) — 국화와 거꾸로
    const sp = el('g', { transform: 'translate(905 548)' }, svg);
    el('path', { class: 'cm-pot', d: 'M-74 12 L-60 92 L60 92 L74 12 Z' }, sp);
    el('rect', { class: 'cm-pot', x: -86, y: 0, width: 172, height: 20, rx: 6 }, sp);
    const spStalk = el('path', { class: 'cm-stem' }, sp);
    const spFl = Array.from({ length: 7 }, () => el('circle', { class: 'cm-spfl', r: 6 }, sp));
    const spLeaves = Array.from({ length: 7 }, (_, i) => el('path', { class: 'cm-spl', 'data-i': i }, sp));
    el('text', { class: 'cm-pn', x: 905, y: 680 }, svg).textContent = '시금치';
    // 하늘 창
    const sky = el('rect', { class: 'cm-sky', x: 560, y: 40, width: 380, height: 120, rx: 14 }, svg);
    const skySun = el('circle', { class: 'cm-ssun', r: 16 }, svg);
    const skyMoon = el('circle', { class: 'cm-smoon', r: 12 }, svg);
    const dayT = el('text', { class: 'cm-dayt', x: 750, y: 196 }, svg);
    const now = root.querySelector('.cm-now'), stage = root.querySelector('.cm-state'), stage2 = root.querySelector('.cm-state2');
    let len = 15, grow = 0.15, bud = 0, bolt = 0, days = 0, clock = 6, shortRun = 0;

    function paint() {
      const set = 12 + len / 2, rise = 12 - len / 2;
      const a = P(rise), b = P(set);
      day.setAttribute('d', `M${C.x} ${C.y} L${a.x.toFixed(1)} ${a.y.toFixed(1)} A${R} ${R} 0 ${len > 12 ? 1 : 0} 1 ${b.x.toFixed(1)} ${b.y.toFixed(1)} Z`);
      const ca = P(12 - CRIT / 2, R + 4), cb = P(12 + CRIT / 2, R + 4);
      crit.setAttribute('d', `M${ca.x.toFixed(1)} ${ca.y.toFixed(1)} A${R + 4} ${R + 4} 0 0 1 ${cb.x.toFixed(1)} ${cb.y.toFixed(1)}`);
      const k = P(set, R + 2); knob.setAttribute('transform', `translate(${k.x.toFixed(1)} ${k.y.toFixed(1)})`);
      const r0 = P(rise, R + 2); riseK.setAttribute('cx', r0.x.toFixed(1)); riseK.setAttribute('cy', r0.y.toFixed(1));
      const hh = P(clock, R - 20); hand.setAttribute('x2', hh.x.toFixed(1)); hand.setAttribute('y2', hh.y.toFixed(1));
      sunI.setAttribute('cx', hh.x.toFixed(1)); sunI.setAttribute('cy', hh.y.toFixed(1));
      const isDay = clock > rise && clock < set; sunI.setAttribute('class', 'cm-sunI ' + (isDay ? 'd' : 'n'));
      knob.setAttribute('aria-valuenow', len.toFixed(1));
      lenT.textContent = `낮 ${len.toFixed(1).replace('.0', '')}시간`;
      lenS.textContent = `밤 ${(24 - len).toFixed(1).replace('.0', '')}시간`;
      root.dataset.short = String(len <= CRIT);
      // 하늘
      const u = clamp((clock - rise) / len, 0, 1), v = ((clock - set + 24) % 24) / (24 - len);
      sky.setAttribute('class', 'cm-sky ' + (isDay ? 'd' : 'n'));
      skySun.setAttribute('cx', (580 + 340 * u).toFixed(1)); skySun.setAttribute('cy', (140 - Math.sin(u * Math.PI) * 80).toFixed(1)); skySun.style.opacity = isDay ? 1 : 0;
      skyMoon.setAttribute('cx', (580 + 340 * clamp(v, 0, 1)).toFixed(1)); skyMoon.setAttribute('cy', (140 - Math.sin(clamp(v, 0, 1) * Math.PI) * 70).toFixed(1)); skyMoon.style.opacity = isDay ? 0 : 1;
      dayT.textContent = `${days}일째`;
      // 국화
      const top = 548 - lerp(90, 300, grow);
      stems.forEach((s, i) => { const tx = 750 + s.dx * lerp(0.4, 1, grow), ty = top + Math.abs(s.dx) * 0.5; s.e.setAttribute('d', `M750 548 Q${(750 + s.dx * 0.3).toFixed(1)} ${((548 + ty) / 2).toFixed(1)} ${tx.toFixed(1)} ${ty.toFixed(1)}`); s.tx = tx; s.ty = ty; void i; });
      leaves.forEach((l, i) => {
        const s = stems[i % 4], f = 0.25 + 0.65 * (Math.floor(i / 4) / 3 + (i % 2) * 0.1);
        const x = lerp(750, s.tx, f), y = lerp(548, s.ty, f), side = i % 2 ? 1 : -1, sz = lerp(0.5, 1, grow);
        l.setAttribute('d', `M${x.toFixed(1)} ${y.toFixed(1)} q${side * 20 * sz} ${-18 * sz} ${side * 42 * sz} ${-4 * sz} q${-side * 18 * sz} ${14 * sz} ${-side * 42 * sz} ${4 * sz}`);
        l.style.opacity = i < 4 + grow * 10 ? 1 : 0;
      });
      heads.forEach((H, i) => {
        const s = stems[i]; H.g.setAttribute('transform', `translate(${s.tx.toFixed(1)} ${(s.ty - 6).toFixed(1)})`);
        const b = clamp(bud * 1.25 - i * 0.08, 0, 1);
        H.bud.style.opacity = b > 0.05 && b < 0.4 ? 1 : 0; H.bud.setAttribute('r', (4 + b * 18).toFixed(1));
        const o = clamp((b - 0.35) / 0.65, 0, 1);
        H.petals.forEach((p) => { p.style.opacity = o; p.setAttribute('ry', (4 + 14 * o).toFixed(1)); });
        H.mid.style.opacity = o > 0 ? 1 : 0;
      });
      spLeaves.forEach((l, i) => {
        const a = -Math.PI + (i + 0.5) * Math.PI / 7, L = lerp(40, 78, grow);
        const ex = Math.cos(a) * L, ey = Math.sin(a) * L * 0.75 - 4;
        l.setAttribute('d', `M0 -2 Q${(ex * 0.5 - ey * 0.25).toFixed(1)} ${(ey * 0.5 + ex * 0.2 - 8).toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)} Q${(ex * 0.5 + ey * 0.25).toFixed(1)} ${(ey * 0.5 - ex * 0.2 + 4).toFixed(1)} 0 -2`);
      });
      const sh = lerp(0, 230, bolt);
      spStalk.setAttribute('d', `M0 -4 Q6 ${(-sh * 0.5).toFixed(1)} 0 ${(-sh).toFixed(1)}`); spStalk.style.opacity = bolt > 0.03 ? 1 : 0;
      spFl.forEach((c, i) => { const o = clamp((bolt - 0.45) / 0.5, 0, 1); c.setAttribute('cx', ((i % 2 ? 1 : -1) * (6 + (i % 3) * 3)).toFixed(1)); c.setAttribute('cy', (-sh + 10 + i * 14).toFixed(1)); c.style.opacity = o; });
      stage2.textContent = bolt > 0.85 ? '꽃대가 올라와 꽃이 피었다' : bolt > 0.05 ? '꽃대가 올라오고 있다' : '잎만 자란다';
      const st = bud > 0.85 ? '꽃이 활짝 피었다' : bud > 0.3 ? '꽃눈이 부풀고 있다' : bud > 0.05 ? '꽃눈이 생겼다' : '잎과 줄기만 자란다';
      stage.textContent = st;
      now.textContent = len > CRIT ? '낮이 길다 · 시금치 꽃대를 보고, 손잡이(☾)를 돌려 낮을 짧게 해 보자' : `낮이 짧은 날 ${shortRun}일째 · 국화: ${st}`;
      now.classList.toggle('done', bud > 0.85);
    }
    function step(dt) {
      clock += dt * 10;                       // 한 날 = 2.4초
      if (clock >= 24) { clock -= 24; days += 1; shortRun = len <= CRIT ? shortRun + 1 : 0; }
      grow = clamp(grow + dt * 0.03, 0, 1);
      if (len <= CRIT) bud = clamp(bud + dt * 0.05 * (1 + (CRIT - len) * 0.25), 0, 1);
      else bud = clamp(bud - dt * 0.01, 0, 1);
      if (len > CRIT) bolt = clamp(bolt + dt * 0.05 * (1 + (len - CRIT) * 0.25), 0, 1);
      else bolt = clamp(bolt - dt * 0.01, 0, 1);
      paint();
    }
    const setFromPt = (p) => {
      let a = Math.atan2(C.y - p.y, C.x - p.x);             // ang()의 거꾸로
      let h = 12 + (a - Math.PI / 2) / (Math.PI * 2) * 24;
      h = ((h % 24) + 24) % 24;
      if (h < 12) h = h < 9 ? 24 : 12;                        // 자정을 넘기면 가장 긴 낮, 오전 쪽이면 가장 짧은 낮에 멈춘다
      len = clamp((h - 12) * 2, 8, 16); len = Math.round(len * 2) / 2; paint();
    };
    let dragging = null;
    knob.addEventListener('pointerdown', (e) => { if (e.button) return; dragging = e.pointerId; e.stopPropagation(); e.preventDefault(); try { knob.setPointerCapture(e.pointerId); } catch (err) { /* 합성 */ } });
    knob.addEventListener('pointermove', (e) => { if (dragging === e.pointerId) setFromPt(pt(svg, e)); });
    const end = (e) => { if (dragging === e.pointerId) dragging = null; };
    knob.addEventListener('pointerup', end); knob.addEventListener('pointercancel', end);
    // 시계판 아무 데나 눌러도 그 시각으로 해 지는 손잡이가 간다
    night.addEventListener('pointerdown', (e) => { setFromPt(pt(svg, e)); });
    day.addEventListener('pointerdown', (e) => { setFromPt(pt(svg, e)); });
    knob.addEventListener('keydown', (e) => {
      if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
      e.preventDefault(); e.stopPropagation(); len = clamp(len + (e.key === 'ArrowRight' || e.key === 'ArrowUp' ? 0.5 : -0.5), 8, 16); paint();
    });
    paint();
    const L = loop(step);
    root._cm = { len(v) { len = clamp(v, 8, 16); paint(); }, run(sec) { for (let i = 0; i < sec * 30; i++) step(1 / 30); }, get bud() { return bud; }, get bolt() { return bolt; } };
    return { setActive(on) { if (on) L.start(); else L.stop(); } };
  }
  window.MumDial = { mount };
})();
