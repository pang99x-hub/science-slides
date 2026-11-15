/* 1차시: 물질이 가진 에너지(교과서 54쪽 지도상의 유의점, 56쪽 «흡수한 만큼 생성물의 에너지가 높아진다»).
   왼쪽 «처음» 칸의 물질을 «나중» 칸 높이로 옮긴다. 세로 위치 = 물질이 가진 에너지.
   내려가는 변화: 물질을 끌어 내리면 한 칸(36)마다 열 알갱이 하나가 오른쪽 «주변»으로 튀어 나가고 주변 온도계가 오른다.
   올라가는 변화: 물질은 혼자 올라가지 못한다. 주변의 열 알갱이를 물질에 끌어 넣을 때마다 한 칸 올라가고 주변 온도계가 내려간다.
   계단 높이·알갱이 하나 1.5 °C는 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const { el, clamp, lerp, pt } = window.EA;
  const STEP = 36, XA = 250, XB = 560, PER = 1.5;
  const CH = {
    melt: { a: ['ice', '얼음'], b: ['water', '물'], ya: 450, yb: 340 },
    freeze: { a: ['water', '물'], b: ['ice', '얼음'], ya: 330, yb: 440 },
    evap: { a: ['water', '물'], b: ['vapor', '수증기'], ya: 420, yb: 200 },
    cond: { a: ['vapor', '수증기'], b: ['water', '물'], ya: 200, yb: 452 },
    dry: { a: ['dryice', '드라이아이스'], b: ['co2', '이산화 탄소 기체'], ya: 480, yb: 300 },
    cacl: { a: ['cacl', '염화 칼슘 + 물'], b: ['caclaq', '염화 칼슘 수용액'], ya: 300, yb: 444 },
    baoh: { a: ['baoh', '수산화 바륨 + 염화 암모늄'], b: ['slush', '반응하고 난 물질'], ya: 440, yb: 296 },
    fuel: { a: ['butane', '뷰테인 + 산소'], b: ['burnt', '이산화 탄소 + 물'], ya: 150, yb: 510 },
  };
  for (const c of Object.values(CH)) { c.out = c.yb > c.ya; c.units = Math.round(Math.abs(c.yb - c.ya) / STEP); }

  function icon(g, kind) {
    const add = (t, a) => el(t, a, g);
    switch (kind) {
      case 'ice': add('rect', { class: 'i-ice', x: -30, y: -30, width: 60, height: 60, rx: 8 }); add('path', { class: 'i-shine', d: 'M-18 -16 l10 -6 M-18 -4 l18 -10' }); break;
      case 'water': add('path', { class: 'i-water', d: 'M0 -38 C 18 -12 30 2 30 14 a30 30 0 0 1 -60 0 C -30 2 -18 -12 0 -38 Z' }); break;
      case 'vapor': [[-20, 4, 18], [6, -8, 22], [22, 10, 16]].forEach(([x, y, r]) => add('circle', { class: 'i-vapor', cx: x, cy: y, r })); break;
      case 'dryice': add('rect', { class: 'i-dry', x: -34, y: -22, width: 68, height: 44, rx: 6 }); add('path', { class: 'i-fog', d: 'M-30 -26 q10 -14 20 0 q10 -14 20 0 q10 -14 20 0' }); break;
      case 'co2': for (let i = 0; i < 3; i++) { const x = -26 + i * 26, y = (i % 2) * 14 - 6; add('circle', { class: 'i-c', cx: x, cy: y, r: 8 }); add('circle', { class: 'i-o', cx: x - 12, cy: y, r: 6 }); add('circle', { class: 'i-o', cx: x + 12, cy: y, r: 6 }); } break;
      case 'cacl': add('path', { class: 'i-beaker', d: 'M-30 -30 V 26 q0 6 6 6 H 24 q6 0 6 -6 V -30' }); add('rect', { class: 'i-sol', x: -28, y: -6, width: 56, height: 36, rx: 3 }); for (let i = 0; i < 5; i++) add('circle', { class: 'i-grain', cx: -18 + i * 9, cy: 24 - (i % 2) * 5, r: 5 }); break;
      case 'caclaq': add('path', { class: 'i-beaker', d: 'M-30 -30 V 26 q0 6 6 6 H 24 q6 0 6 -6 V -30' }); add('rect', { class: 'i-sol', x: -28, y: -6, width: 56, height: 36, rx: 3 }); break;
      case 'baoh': add('path', { class: 'i-beaker', d: 'M-30 -30 V 26 q0 6 6 6 H 24 q6 0 6 -6 V -30' }); add('path', { class: 'i-pw1', d: 'M-26 30 q12 -22 24 0 z' }); add('path', { class: 'i-pw2', d: 'M2 30 q12 -18 24 0 z' }); break;
      case 'slush': add('path', { class: 'i-beaker', d: 'M-30 -30 V 26 q0 6 6 6 H 24 q6 0 6 -6 V -30' }); add('rect', { class: 'i-slush', x: -28, y: 4, width: 56, height: 26, rx: 3 }); break;
      case 'butane': add('rect', { class: 'i-can', x: -36, y: -24, width: 34, height: 52, rx: 8 }); add('rect', { class: 'i-cap2', x: -28, y: -32, width: 18, height: 10 }); add('circle', { class: 'i-o', cx: 16, cy: -6, r: 8 }); add('circle', { class: 'i-o', cx: 30, cy: -6, r: 8 }); add('circle', { class: 'i-o', cx: 16, cy: 18, r: 8 }); add('circle', { class: 'i-o', cx: 30, cy: 18, r: 8 }); break;
      case 'burnt': add('circle', { class: 'i-c', cx: -20, cy: -8, r: 9 }); add('circle', { class: 'i-o', cx: -34, cy: -8, r: 7 }); add('circle', { class: 'i-o', cx: -6, cy: -8, r: 7 }); add('circle', { class: 'i-o', cx: 20, cy: 14, r: 10 }); add('circle', { class: 'i-h', cx: 8, cy: 24, r: 6 }); add('circle', { class: 'i-h', cx: 32, cy: 24, r: 6 }); break;
      default: break;
    }
  }

  function mount(root) {
    const svg = root.querySelector('.ea-ld-svg');
    const pick = [...root.querySelectorAll('.ea-ld-pick button')];
    const R = { a: root.querySelector('.ld-a'), b: root.querySelector('.ld-b'), io: root.querySelector('.ld-io'), env: root.querySelector('.ld-env') };
    const msg = root.querySelector('.ld-msg'), now = root.querySelector('.ld-now'), doneBox = root.querySelector('.ea-ld-done');
    const defs = el('defs', {}, svg);
    const m = el('marker', { id: 'ld-head', viewBox: '0 0 10 10', refX: 5, refY: 5, markerWidth: 5, markerHeight: 5, orient: 'auto' }, defs); el('path', { d: 'M0 0 L10 5 L0 10 z', class: 'ea-ld-axh' }, m);
    el('path', { class: 'ea-ld-axis', d: 'M70 610 V 40', 'marker-end': 'url(#ld-head)' }, svg);
    el('text', { class: 'ea-ld-axt', x: 0, y: 0, transform: 'translate(46 330) rotate(-90)', text: '물질이 가진 에너지' }, svg);
    el('text', { class: 'ea-ld-col', x: XA, y: 600, text: '처음(반응물)' }, svg);
    el('text', { class: 'ea-ld-col', x: XB, y: 600, text: '나중(생성물)' }, svg);
    const shelfA = el('g', { class: 'ea-ld-shelf' }, svg), shelfB = el('g', { class: 'ea-ld-shelf b' }, svg);
    const shA = el('line', { x1: XA - 110, x2: XA + 110 }, shelfA), shB = el('line', { x1: XB - 110, x2: XB + 110 }, shelfB);
    const ghost = el('g', { class: 'ea-ld-ghost' }, svg);
    const gap = el('path', { class: 'ea-ld-gap' }, svg);
    const gapT = el('text', { class: 'ea-ld-gapt' }, svg);
    // 주변
    el('rect', { class: 'ea-ld-env', x: 760, y: 90, width: 280, height: 480, rx: 14 }, svg);
    el('text', { class: 'ea-ld-envt', x: 900, y: 74, text: '주변(물·용기·공기)' }, svg);
    const th = window.EA.thermo(svg, { x: 800, y: 520, h: 380, lo: 0, hi: 40, w: 18, cls: 'ea-ld-th' });
    const pG = el('g', { class: 'ea-ld-parts' }, svg);
    const tokG = el('g', { class: 'ea-ld-tok', tabindex: 0, role: 'button', 'aria-label': '물질(위아래로 끌기, 화살표 키로도 옮긴다)' }, svg);
    const tokIcon = el('g', {}, tokG), tokName = el('text', { class: 'ea-ld-tname', y: 64 }, tokG);
    el('circle', { class: 'ea-ld-thit', r: 64 }, tokG);

    let C = CH.melt, key = 'melt', y = 0, moved = 0, parts = [], fly = [], T = 20, done = false, t = 0, shake = 0;
    const finished = new Set();
    function particle(x, y0) {
      const c = el('circle', { class: 'ea-ld-p', r: 13, cx: x, cy: y0 }, pG);
      const p = { c, x, y: y0, vx: (Math.random() - 0.5) * 40, vy: (Math.random() - 0.5) * 40, held: false };
      window.EA.drag(c, svg, {
        start() { if (done || C.out) return false; p.held = true; c.classList.add('held'); return true; },
        move(q) { p.x = q.x; p.y = q.y; },
        end(q) {
          p.held = false; c.classList.remove('held');
          const tx = lerp(XA, XB, moved / C.units), d = Math.hypot(q.x - tx, q.y - y);
          if (d < 80) absorb(p); else { p.x = clamp(p.x, 790, 1020); p.y = clamp(p.y, 110, 550); }
        },
      });
      parts.push(p); return p;
    }
    function absorb(p) {
      parts = parts.filter((x) => x !== p); p.c.remove();
      moved++; T -= PER; y = C.ya - moved * STEP;
      if (moved >= C.units) finish();
      draw();
    }
    function release() {
      const tx = lerp(XA, XB, moved / C.units);
      const c = el('circle', { class: 'ea-ld-p', r: 13, cx: tx, cy: y }, pG);
      fly.push({ c, x0: tx, y0: y, x1: 830 + Math.random() * 180, y1: 130 + Math.random() * 400, k: 0 });
      moved++; T += PER;
    }
    function finish() {
      done = true; y = C.yb;
      tokIcon.replaceChildren(); icon(tokIcon, C.b[0]); tokName.textContent = C.b[1];
      finished.add(key);
      doneBox.innerHTML = [...finished].map((k) => `<span class="ea-ld-chip ${CH[k].out ? 'out' : 'in'}">${CH[k].a[1]} → ${CH[k].b[1]} · ${CH[k].out ? '방출' : '흡수'}</span>`).join('');
      now.textContent = finished.size < 8 ? '다른 변화도 골라 해 보자' : '여덟 변화를 다 해 보았다';
      now.classList.add('done');
    }
    function load(k) {
      key = k; C = CH[k]; y = C.ya; moved = 0; done = false; T = 20;
      parts.forEach((p) => p.c.remove()); parts = []; fly.forEach((f) => f.c.remove()); fly = [];
      for (let i = 0; i < 10; i++) particle(830 + (i % 3) * 70 + Math.random() * 30, 140 + i * 40);
      tokIcon.replaceChildren(); icon(tokIcon, C.a[0]); tokName.textContent = C.a[1];
      ghost.replaceChildren(); icon(ghost, C.b[0]); ghost.setAttribute('transform', `translate(${XB} ${C.yb - 40})`);
      shA.setAttribute('y1', C.ya + 40); shA.setAttribute('y2', C.ya + 40); shB.setAttribute('y1', C.yb + 40); shB.setAttribute('y2', C.yb + 40);
      R.a.textContent = C.a[1]; R.b.textContent = C.b[1];
      pick.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === k)));
      now.classList.remove('done');
      now.textContent = C.out ? '물질을 끌어 «나중» 높이까지 내려 보자' : '물질을 끌어 올려 보고, 안 되면 주변의 열 알갱이를 물질에 끌어 넣자';
      msg.textContent = C.out ? '나중 상태가 더 낮다. 내려가는 동안 남는 에너지는 어디로 갈까?' : '나중 상태가 더 높다. 올라가는 데 필요한 에너지는 어디서 올까?';
      draw();
    }
    window.EA.drag(tokG, svg, {
      start() { return !done; },
      move(q) {
        if (C.out) {
          y = clamp(q.y - 0, C.ya + moved * STEP - 6, C.yb);
          while (moved < C.units && y >= C.ya + (moved + 1) * STEP - 4) release();
          if (moved >= C.units) finish();
        } else if (q.y < y - 30) { shake = 0.4; msg.textContent = '혼자서는 올라가지 못한다 — 에너지가 모자라다. 주변의 열 알갱이를 물질에 끌어 넣어 보자.'; }
        draw();
      },
    });
    tokG.addEventListener('keydown', (e) => {
      if (!['ArrowDown', 'ArrowUp'].includes(e.key) || done) return;
      e.preventDefault(); e.stopPropagation();
      if (C.out && e.key === 'ArrowDown') { y = C.ya + (moved + 1) * STEP; release(); if (moved >= C.units) finish(); }
      if (!C.out && e.key === 'ArrowUp' && parts.length) absorb(parts[0]);
      draw();
    });
    pick.forEach((b) => b.addEventListener('click', () => load(b.dataset.k)));
    function draw() {
      const k = C.units ? moved / C.units : 0, x = done ? XB : lerp(XA, XB, k);
      tokG.setAttribute('transform', `translate(${x.toFixed(1)} ${(y - 40).toFixed(1)})`);
      ghost.style.opacity = done ? '0' : '0.28';
      const x0 = XB + 140;
      gap.setAttribute('d', `M${x0} ${C.ya + 40} V ${C.yb + 40} M${x0 - 10} ${C.ya + 40} H ${x0 + 10} M${x0 - 10} ${C.yb + 40} H ${x0 + 10}`);
      gapT.setAttribute('x', x0 + 18); gapT.setAttribute('y', (C.ya + C.yb) / 2 + 48);
      gapT.textContent = '차이';
      gap.classList.toggle('dash', C.ya + 40 === C.yb + 40);
      th.set(T); R.env.textContent = `${T.toFixed(1)} °C`;
      R.io.textContent = moved === 0 ? '?' : C.out ? '방출 · 주변으로 나감' : '흡수 · 주변에서 들어옴';
      R.io.className = 'ld-io ' + (moved === 0 ? '' : C.out ? 'out' : 'in');
      if (done) msg.textContent = C.out ? `가진 에너지가 줄어든 만큼 주변으로 나갔다 → 주변 온도가 ${(C.units * PER).toFixed(1)} °C 올랐다(예).` : `주변에서 받아 온 만큼 물질의 에너지가 늘었다 → 주변 온도가 ${(C.units * PER).toFixed(1)} °C 내려갔다(예).`;
    }
    function step(dt) {
      t += dt;
      parts.forEach((p) => {
        if (p.held) { p.c.setAttribute('cx', p.x.toFixed(1)); p.c.setAttribute('cy', p.y.toFixed(1)); return; }
        const s = 0.6 + T / 40;
        p.vx += (Math.random() - 0.5) * 300 * dt * s; p.vy += (Math.random() - 0.5) * 300 * dt * s;
        p.vx *= 0.96; p.vy *= 0.96;
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.x < 836 || p.x > 1022) p.vx *= -1; if (p.y < 108 || p.y > 552) p.vy *= -1;
        p.x = clamp(p.x, 836, 1022); p.y = clamp(p.y, 108, 552);
        p.c.setAttribute('cx', p.x.toFixed(1)); p.c.setAttribute('cy', p.y.toFixed(1));
      });
      fly = fly.filter((f) => {
        f.k += dt / 0.7; const k = Math.min(1, f.k), e = 1 - (1 - k) * (1 - k);
        f.c.setAttribute('cx', lerp(f.x0, f.x1, e).toFixed(1)); f.c.setAttribute('cy', (lerp(f.y0, f.y1, e) - Math.sin(k * Math.PI) * 120).toFixed(1));
        if (k >= 1) { f.c.remove(); particle(f.x1, f.y1); return false; }
        return true;
      });
      if (shake > 0) { shake -= dt; const k = C.units ? moved / C.units : 0; tokG.setAttribute('transform', `translate(${(lerp(XA, XB, k) + Math.sin(t * 60) * 8 * shake).toFixed(1)} ${(y - 40).toFixed(1)})`); }
    }
    load('melt');
    const loop = window.Stage.loop(step);
    root._ld = { load, drop: (n) => { for (let i = 0; i < n && !done; i++) { if (C.out) { y = C.ya + (moved + 1) * STEP; release(); if (moved >= C.units) finish(); } else absorb(parts[0]); } draw(); } };
    return { setActive(on) { if (on) loop.start(); else loop.stop(); } };
  }
  window.EnergyLadder = { mount };
})();
