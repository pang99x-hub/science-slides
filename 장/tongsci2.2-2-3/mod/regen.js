/* 효율 높이기 ① 회생 제동. «가속»을 누르고 있으면 전지의 전기로 바퀴가 빨라지고, «브레이크»를 누르고 있으면 느려진다.
   일반 브레이크: 줄어든 운동 에너지(속도²에 비례)가 모두 브레이크 마찰열로 버려진다(바퀴가 달아오름).
   회생 제동: 모터가 발전기처럼 돌아 그중 일부를 전기로 바꿔 전지에 되돌린다(나머지는 열). 값은 비교를 위한 그림. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const REGEN = 0.6;                                   // 회생 제동으로 되찾는 몫(그림용)

  function mount(root) {
    const svg = root.querySelector('.rg-svg'), q = (s) => svg.querySelector(s);
    const near = q('.rg-near'), dashG = q('.rg-dash'), car = q('.rg-car'), flow = q('.rg-flow'), heat = q('.rg-heat');
    const discs = [...svg.querySelectorAll('.rg-disc')], wheels = [...svg.querySelectorAll('.rg-wheel')];
    const needle = q('.rg-needle'), bf = q('.rg-bf'), bt = q('.rg-bt'), sayT = q('.rg-say text'), sayR = q('.rg-say rect');
    const hBar = root.querySelector('.rg-h'), rBar = root.querySelector('.rg-r');
    const bNormal = root.querySelector('#rg-normal'), bRegen = root.querySelector('#rg-regen');
    const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); p.appendChild(e); return e; };
    // 길가의 나무·전봇대, 도로 점선(밀어서 움직인다)
    const things = [];
    for (let i = 0; i < 6; i++) {
      const g = el('g', { class: i % 2 ? 'rg-pole' : 'rg-tree' }, near);
      if (i % 2) { el('rect', { x: -5, y: 380, width: 10, height: 140 }, g); el('path', { d: 'M-30 392 H 30' }, g); }
      else { el('rect', { x: -7, y: 450, width: 14, height: 70, class: 'rg-trunk' }, g); el('circle', { cx: 0, cy: 430, r: 44, class: 'rg-leaf' }, g); }
      things.push({ g, x: i * 220 });
    }
    const dashes = []; for (let i = 0; i < 9; i++) dashes.push({ r: el('rect', { y: 584, width: 70, height: 10, rx: 4 }, dashG), x: i * 150 });
    let v = 0.35, batt = 0.6, hAcc = 0, rAcc = 0, mode = 'regen', gas = false, brake = false, auto = null, off = 0, ang = 0, last = '';

    function say(t, kind) {
      if (t === last) return; last = t; sayT.textContent = t;
      sayR.setAttribute('class', kind || '');
    }
    function step(dt) {
      const v0 = v, braking = brake || auto === 'stop', going = (gas || auto === 'go') && batt > 0.01;
      if (going) v = Math.min(1, v + dt * 0.42 * (1 - v * 0.5));
      else if (braking) v = Math.max(0, v - dt * 0.55);
      else v = Math.max(0, v - dt * 0.03);
      const dKE = v * v - v0 * v0;
      if (dKE > 0) batt = Math.max(0, batt - dKE * 0.32 - dt * 0.002);
      else if (dKE < 0) {
        const rel = -dKE;
        if (braking && mode === 'regen') { batt = Math.min(1, batt + rel * 0.32 * REGEN); rAcc += rel * REGEN; hAcc += rel * (1 - REGEN); }
        else hAcc += rel;
      }
      if (auto === 'go' && v >= 0.8) auto = 'stop';
      if (auto === 'stop' && v <= 0) auto = null;
      // 움직임
      off += v * dt * 620; ang = (ang + v * dt * 720) % 360;
      things.forEach((t) => { const x = ((t.x - off) % 1320 + 1320) % 1320 - 130; t.g.setAttribute('transform', `translate(${x.toFixed(1)} 0)`); });
      dashes.forEach((d) => { const x = ((d.x - off) % 1350 + 1350) % 1350 - 100; d.r.setAttribute('x', x.toFixed(1)); });
      wheels.forEach((w) => { const [cx, cy] = w.dataset.c.split(' '); w.setAttribute('transform', `rotate(${ang.toFixed(1)} ${cx} ${cy})`); });
      car.setAttribute('transform', `translate(0 ${(Math.sin(off / 40) * 1.5 * v).toFixed(2)})`);
      // 에너지 흐름: 가속 = 전지 → 모터 → 바퀴, 회생 제동 = 바퀴 → 모터 → 전지, 일반 브레이크 = 바퀴에서 열
      const regenNow = braking && mode === 'regen' && v > 0, heatNow = braking && v > 0;
      flow.classList.toggle('on', going || regenNow);
      flow.classList.toggle('back', going);
      discs.forEach((d) => d.classList.toggle('hot', heatNow && mode === 'normal'));
      discs.forEach((d) => d.classList.toggle('warm', heatNow && mode === 'regen'));
      heat.style.opacity = heatNow ? (mode === 'normal' ? '1' : '.35') : '0';
      needle.setAttribute('transform', `rotate(${(-80 + 160 * v).toFixed(1)} 125 120)`);
      bf.setAttribute('width', (156 * batt).toFixed(1)); bf.classList.toggle('low', batt < 0.15);
      bt.textContent = `${Math.round(batt * 100)}%`;
      const mx = Math.max(0.6, hAcc, rAcc);
      hBar.style.width = `${(hAcc / mx * 100).toFixed(1)}%`; rBar.style.width = `${(rAcc / mx * 100).toFixed(1)}%`;
      if (going) say('가속: 전지의 전기 → 모터 → 바퀴(운동)', 'go');
      else if (regenNow) say('회생 제동: 바퀴의 운동 → 전기 → 전지 충전!', 'ok');
      else if (heatNow) say('일반 브레이크: 운동 에너지가 마찰열로 버려진다', 'hot');
      else if (batt <= 0.01) say('전지가 다 닳았다 — 가속할 수 없다', 'hot');
      else if (v <= 0) say('멈췄다. 가속해 보자', '');
      else say('달리는 중: 운동 에너지를 가지고 있다', '');
    }
    const hold = (b, set) => {
      b.addEventListener('pointerdown', (e) => { set(true); auto = null; try { b.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ } e.preventDefault(); });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach((ev) => b.addEventListener(ev, () => set(false)));
      b.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); set(true); } });
      b.addEventListener('keyup', (e) => { if (e.key === 'Enter' || e.key === ' ') set(false); });
    };
    hold(root.querySelector('#rg-gas'), (on) => { gas = on; });
    hold(root.querySelector('#rg-brake'), (on) => { brake = on; });
    root.querySelector('#rg-stop').addEventListener('click', () => { auto = v < 0.75 ? 'go' : 'stop'; });
    root.querySelector('#rg-reset').addEventListener('click', () => { hAcc = 0; rAcc = 0; });
    const setMode = (m) => { mode = m; bNormal.setAttribute('aria-pressed', String(m === 'normal')); bRegen.setAttribute('aria-pressed', String(m === 'regen')); };
    bNormal.addEventListener('click', () => setMode('normal'));
    bRegen.addEventListener('click', () => setMode('regen'));
    const opts = [...root.querySelectorAll('.rg-share button')];
    opts.forEach((b) => b.addEventListener('click', () => { const on = b.getAttribute('aria-pressed') !== 'true'; opts.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b))); }));
    const loop = window.Stage.loop(step);
    root._regen = { set: (o) => { if ('v' in o) v = o.v; if ('mode' in o) setMode(o.mode); if ('auto' in o) auto = o.auto; } };
    step(0);
    return { setActive(on) { if (on && !window.Stage.reduce) loop.start(); else { loop.stop(); step(0); } } };
  }
  window.RegenBrake = { mount };
})();
