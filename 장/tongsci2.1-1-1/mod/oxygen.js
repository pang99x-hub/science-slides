/* 2차시 «산소와 오존층»(교과서 16쪽): 선캄브리아시대 바다 단면. 바닷속 남세균 무리를 누르고 있는 동안만 시간이 흐른다.
   스트로마톨라이트가 한 겹씩 자라고 산소 방울이 바다 → 공기로 올라가며, 다세포 생물(에디아카라)이 나타나고,
   하늘에 오존층이 생겨 강한 자외선을 막으면 뭍으로 식물, 이어서 동물이 올라온다(고생대). 손을 떼면 멈춘다.
   산소·오존 눈금은 정도만 보여 준다(이해를 돕기 위한 예). */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const sm = (v, a, b) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
  const mix = (c1, c2, t) => { const a = c1.match(/\w\w/g).map((h) => parseInt(h, 16)), b = c2.match(/\w\w/g).map((h) => parseInt(h, 16)); return '#' + a.map((v, i) => Math.round(v + (b[i] - v) * t).toString(16).padStart(2, '0')).join(''); };
  const XS = [110, 210, 320, 430, 530];
  const UVX = [660, 720, 790, 860, 930];
  const MSG = [
    [0.02, '바닷속 남세균 무리를 꾹 누르고 있자'],
    [0.3, '남세균이 광합성 → 산소 방울이 바닷물에 녹아든다'],
    [0.42, '바다가 산소로 차고, 이제 공기로도 빠져나간다'],
    [0.58, '산소를 쓰는 다세포 생물이 나타났다(에디아카라 생물군)'],
    [0.8, '공기의 산소 일부가 오존층이 되어 자외선을 막기 시작한다'],
    [0.93, '자외선이 줄어든 뭍으로 식물이 먼저 올라온다'],
    [1.01, '이어서 동물도 뭍으로 — 고생대가 열렸다'],
  ];

  function mount(root) {
    const svg = root.querySelector('.o2-svg'), now = root.querySelector('.o2-now'), eraChip = root.querySelector('.o2-era');
    const bars = { sea: root.querySelector('.o2-bar[data-k="sea"] i'), air: root.querySelector('.o2-bar[data-k="air"] i'), oz: root.querySelector('.o2-bar[data-k="oz"] i') };
    const steps = [...root.querySelectorAll('.o2-step')];
    const A = window.EraArt.A;
    el('defs', {}, svg).innerHTML = '<linearGradient id="o2-sea" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4c8aa8"/><stop offset="1" stop-color="#1f4f74"/></linearGradient>';
    const sky = el('rect', { x: 0, y: 0, width: 1000, height: 340 }, svg);
    const sun = el('g', { transform: 'translate(930 70)' }, svg); el('circle', { r: 44, fill: '#f6c64a', stroke: '#1d2433', 'stroke-width': 2 }, sun);
    const oz = el('g', { class: 'o2-oz' }, svg); el('rect', { x: 0, y: 118, width: 1000, height: 30, fill: '#7fd0c4' }, oz);
    const ozT = el('text', { class: 'o2-lab', x: 20, y: 140 }, oz); ozT.textContent = '오존층';
    const uv = UVX.map((x) => { const g = el('g', { class: 'o2-uv' }, svg); const l = el('path', { d: '' }, g); const b = el('path', { class: 'o2-burst', d: '' }, g); return { g, l, b, x }; });
    const uvT = el('text', { class: 'o2-lab o2-uvt', x: 640, y: 90, 'text-anchor': 'end' }, svg); uvT.textContent = '강한 자외선';
    // 뭍
    el('path', { d: 'M600 620 L 600 380 C 640 352 680 340 720 336 C 820 326 900 340 1000 330 L 1000 620 Z', fill: '#8a6a52', stroke: '#1d2433', 'stroke-width': 2.5 }, svg);
    const moss = el('path', { d: 'M640 352 C 680 340 720 336 760 334 C 840 328 900 340 1000 330 L 1000 346 C 900 356 820 342 760 348 C 720 350 680 356 640 366 Z', fill: '#5f9a3a', opacity: 0 }, svg);
    const plants = el('g', { opacity: 0 }, svg);
    [[720, 338, 0.45], [800, 334, 0.6], [880, 338, 0.5], [960, 332, 0.42]].forEach(([x, y, s]) => { el('g', { transform: `translate(${x} ${y}) scale(${s})` }, plants).innerHTML = `<g class="lz-sway">${A.fern()}</g>`; });
    const animal = el('g', { opacity: 0, transform: 'translate(650 352) scale(.7)' }, svg); animal.innerHTML = `<g class="lz-walk">${A.amph()}</g>`;
    const bug = el('g', { opacity: 0, transform: 'translate(820 230) scale(.6)' }, svg); bug.innerHTML = `<g class="lz-fly">${A.dfly()}</g>`;
    // 바다
    el('path', { d: 'M0 330 H 640 C 620 360 610 400 600 440 L 600 620 H 0 Z', fill: 'url(#o2-sea)', stroke: '#1d2433', 'stroke-width': 2.5 }, svg);
    const seaTint = el('path', { d: 'M0 330 H 640 C 620 360 610 400 600 440 L 600 620 H 0 Z', fill: '#7fe0d0', opacity: 0 }, svg);
    el('path', { d: 'M0 620 L 0 590 C 160 576 380 598 600 580 L 600 620 Z', fill: '#c9b48a', stroke: '#1d2433', 'stroke-width': 2 }, svg);
    const ed = el('g', { opacity: 0 }, svg);
    [[170, 560, 0.75], [380, 566, 0.9], [470, 560, 0.6]].forEach(([x, y, s]) => { el('g', { transform: `translate(${x} ${y}) scale(${s})` }, ed).innerHTML = `<g class="lz-sway">${A.ediac()}</g>`; });
    const strom = XS.map((x) => el('g', { transform: `translate(${x} 588)` }, svg));
    const mat = el('path', { class: 'o2-mat', d: 'M40 590 C 160 576 380 598 580 582 L 580 592 C 380 606 160 586 40 600 Z' }, svg);
    const matT = el('text', { class: 'o2-lab', x: 300, y: 614, 'text-anchor': 'middle' }, svg); matT.textContent = '남세균 무리';
    const bubG = el('g', {}, svg);
    const hold = el('circle', { class: 'o2-hold', r: 34, cx: -99, cy: -99 }, svg);

    let p = 0, holding = false, raf = 0, last = 0, active = false;
    const bubs = [];
    function draw() {
      const seaO = sm(p, 0.05, 0.4), airO = sm(p, 0.3, 0.72), ozo = sm(p, 0.55, 0.85), grow = sm(p, 0, 0.55);
      sky.setAttribute('fill', mix('d98e5e', 'a9d4ec', airO));
      seaTint.setAttribute('opacity', (seaO * 0.18).toFixed(3));
      oz.setAttribute('opacity', ozo.toFixed(3));
      const blocked = Math.round(ozo * 5);
      uv.forEach((u, i) => {
        const stop = i < blocked, y1 = stop ? 120 : 330 + (u.x > 640 ? 0 : 10);
        u.l.setAttribute('d', `M${u.x + 30} 20 L ${u.x} ${y1}`);
        u.b.setAttribute('d', stop ? `M${u.x - 12} 112 l 10 8 l 8 -12 l 6 12 l 10 -6` : '');
        u.g.classList.toggle('blocked', stop);
      });
      strom.forEach((g, i) => {
        const k = Math.max(0.08, grow * (0.75 + 0.25 * Math.sin(i * 2.1 + 1))), n = Math.floor(grow * 9);
        const dome = (s) => `M${-44 * k * s} 0 C ${-44 * k * s} ${-70 * k * s} ${44 * k * s} ${-70 * k * s} ${44 * k * s} 0`;
        let h = `<path class="o2-st" d="${dome(1)} Z"/>`;
        for (let j = 1; j <= n; j++) h += `<path class="o2-sl" d="${dome(j / (n + 1))}"/>`;
        g.innerHTML = h;
      });
      ed.setAttribute('opacity', sm(p, 0.4, 0.5).toFixed(3));
      moss.setAttribute('opacity', sm(p, 0.8, 0.88).toFixed(3));
      plants.setAttribute('opacity', sm(p, 0.82, 0.92).toFixed(3));
      animal.setAttribute('opacity', sm(p, 0.93, 0.99).toFixed(3));
      bug.setAttribute('opacity', sm(p, 0.95, 1).toFixed(3));
      bars.sea.style.width = (seaO * 100).toFixed(1) + '%'; bars.air.style.width = (airO * 100).toFixed(1) + '%'; bars.oz.style.width = (ozo * 100).toFixed(1) + '%';
      [0.001, 0.2, 0.4, 0.6, 0.82].forEach((t, i) => { steps[i].classList.toggle('on', p >= t); steps[i].classList.toggle('cur', p >= t && (i === 4 || p < [0.2, 0.4, 0.6, 0.82][i])); });
      now.textContent = (MSG.find(([t]) => p < t) || MSG[MSG.length - 1])[1];
      now.classList.toggle('done', p >= 1);
      eraChip.textContent = p >= 0.82 ? '고생대' : '선캄브리아시대';
      eraChip.classList.toggle('pz', p >= 0.82);
    }
    function step(t) {
      raf = 0; if (!active) return;
      const dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016); last = t;
      if (holding && p < 1) { p = Math.min(1, p + dt / 13); draw(); }
      if (holding && Math.random() < dt * 14) {
        const x = 50 + Math.random() * 520, c = el('circle', { class: 'o2-bub', cx: x, cy: 584, r: 3 + Math.random() * 4 }, bubG);
        bubs.push({ c, x, y: 584, v: 60 + Math.random() * 50, top: p > 0.3 ? 140 + Math.random() * 120 : 330 });
      }
      for (let i = bubs.length - 1; i >= 0; i--) {
        const b = bubs[i]; b.y -= b.v * dt; b.x += Math.sin(b.y / 18) * 0.4;
        b.c.setAttribute('cy', b.y.toFixed(1)); b.c.setAttribute('cx', b.x.toFixed(1));
        if (b.y < 332) b.c.setAttribute('opacity', Math.max(0, (b.y - b.top) / (332 - b.top)).toFixed(2));
        if (b.y <= b.top) { b.c.remove(); bubs.splice(i, 1); }
      }
      raf = requestAnimationFrame(step);
    }
    const toSvg = (e) => { const q = svg.createSVGPoint(); q.x = e.clientX; q.y = e.clientY; return q.matrixTransform(svg.getScreenCTM().inverse()); };
    const start = (e) => { holding = true; svg.classList.add('holding'); if (e && e.clientX !== undefined) { const q = toSvg(e); hold.setAttribute('cx', q.x.toFixed(0)); hold.setAttribute('cy', q.y.toFixed(0)); } hold.classList.add('on'); };
    const stop = () => { holding = false; svg.classList.remove('holding'); hold.classList.remove('on'); };
    svg.addEventListener('pointerdown', (e) => { if (e.button) return; try { svg.setPointerCapture(e.pointerId); } catch (err) { /* 합성 */ } start(e); e.stopPropagation(); });
    svg.addEventListener('pointermove', (e) => { if (holding) { const q = toSvg(e); hold.setAttribute('cx', q.x.toFixed(0)); hold.setAttribute('cy', q.y.toFixed(0)); } });
    svg.addEventListener('pointerup', stop); svg.addEventListener('pointercancel', stop); svg.addEventListener('lostpointercapture', stop);
    svg.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); if (!holding) { start(); hold.setAttribute('cx', 300); hold.setAttribute('cy', 560); } } });
    svg.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') stop(); });
    root.querySelector('.o2-reset').addEventListener('click', () => { p = 0; bubs.splice(0).forEach((b) => b.c.remove()); draw(); });
    draw();
    root._o2 = { set(v) { p = Math.max(0, Math.min(1, v)); draw(); }, get p() { return p; } };
    return {
      setActive(on) { active = on; if (on && !raf) { last = 0; raf = requestAnimationFrame(step); } if (!on) stop(); },
    };
  }
  window.Oxygen = { mount };
})();
