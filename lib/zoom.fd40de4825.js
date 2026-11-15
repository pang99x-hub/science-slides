/* 2차시 2장(교과서 42쪽 그림 Ⅰ-23): 수용액 속 아연판을 확대 손잡이(또는 휠)로 키워 본다.
   z = 0 비커(눈) → 0.5 아연판 표면(돋보기) → 1 원자 모형. 세 층이 이어서 커지며 겹쳐 바뀐다.
   원자 모형: 1.8초마다 표면의 아연 원자 하나가 전자 2개를 내주고 Zn²⁺로 녹아 나간다.
   - 황산 구리(Ⅱ): 다가온 Cu²⁺ 하나가 전자 2개를 받아 그 자리에 구리 원자로 붙는다(Zn + Cu²⁺ → Zn²⁺ + Cu).
   - 묽은 염산: H⁺ 두 개가 전자를 하나씩 받아 H₂ 분자가 되어 거품으로 올라간다(Zn + 2H⁺ → Zn²⁺ + H₂).
   이온 개수는 이해를 돕기 위한 모형 값. */
(function () {
  'use strict';
  const { el, clamp, smooth, atom, f, mix, keep } = window.RX;
  const SOL = {
    cu: { cat: 'Cu', catL: 'Cu^2+', an: 'SO4', anL: 'SO_4^2-', n0: 12, eq: 'Zn + Cu<sup>2+</sup> → Zn<sup>2+</sup> + Cu',
      half: '',
      rows: [['Zn<sup>2+</sup> 아연 이온', 'zn'], ['Cu<sup>2+</sup> 구리 이온', 'cat'], ['SO<sub>4</sub><sup>2−</sup> 황산 이온', 'an']], color: '#3f8fd8' },
    h: { cat: 'H', catL: 'H^+', an: 'Cl', anL: 'Cl^-', n0: 16, eq: 'Zn + 2H<sup>+</sup> → Zn<sup>2+</sup> + H<sub>2</sub>',
      half: '',
      rows: [['Zn<sup>2+</sup> 아연 이온', 'zn'], ['H<sup>+</sup> 수소 이온', 'cat'], ['Cl<sup>−</sup> 염화 이온', 'an']], color: '#dfe9ee' },
  };

  function mount(root) {
    const svg = root.querySelector('.rx-zm-svg');
    const range = root.querySelector('.rx-zm-range');
    const now = root.querySelector('.rx-zm-now');
    const q = (s) => root.querySelector(s);
    const rows = [...root.querySelectorAll('.rx-cnt-row')];
    el('rect', { x: 0, y: 0, width: 1056, height: 740, fill: '#f4f7f6' }, svg);
    const LA = el('g', {}, svg), LB = el('g', {}, svg), LC = el('g', {}, svg);
    const tag = el('text', { class: 'rx-zm-tag', x: 1036, y: 40, 'text-anchor': 'end' }, svg);

    // A: 비커
    el('rect', { x: 0, y: 640, width: 1056, height: 100, fill: '#cdbfa8' }, LA);
    const solA = el('rect', { x: 334, y: 300, width: 392, height: 336, fill: '#3f8fd8' }, LA);
    el('path', { class: 'rx-tb-glass', d: 'M330 200 L 330 640 L 730 640 L 730 200' }, LA);
    el('rect', { x: 500, y: 140, width: 60, height: 420, fill: '#b8c0c8', stroke: '#1d2433', 'stroke-width': 3 }, LA);
    const crustA = el('rect', { x: 500, y: 300, width: 60, height: 260, fill: '#a5532b', opacity: 0.4 }, LA);
    el('rect', { x: 552, y: 452, width: 22, height: 22, fill: 'none', stroke: '#e2622b', 'stroke-width': 3, 'stroke-dasharray': '5 4' }, LA);
    el('text', { class: 'rx-dp-lab', x: 530, y: 128, 'text-anchor': 'middle' }, LA).textContent = '아연판';
    // B: 표면
    const solB = el('rect', { x: 0, y: 0, width: 1056, height: 740, fill: '#3f8fd8', opacity: 0.6 }, LB);
    el('path', { d: 'M0 0 L 470 0 L 450 120 L 486 260 L 456 400 L 490 560 L 462 740 L 0 740 Z', fill: '#b8c0c8', stroke: '#1d2433', 'stroke-width': 4 }, LB);
    for (let i = 0; i < 28; i++) el('circle', { cx: 440 + Math.sin(i * 7.1) * 40, cy: 20 + i * 26, r: 10 + (i * 13 % 9), fill: '#a5532b', stroke: '#6b2f17', 'stroke-width': 2 }, LB);
    el('text', { class: 'rx-zm-big', x: 220, y: 380, 'text-anchor': 'middle' }, LB).textContent = '아연판 표면';
    el('text', { class: 'rx-zm-big', x: 760, y: 380, 'text-anchor': 'middle' }, LB).textContent = '수용액';
    el('text', { class: 'rx-dp-lab', x: 560, y: 120 }, LB).textContent = '← 붉은 갈색 알갱이(구리)';
    // C: 원자 모형
    const solC = el('rect', { x: 0, y: 0, width: 1056, height: 740, fill: '#e3effa' }, LC);
    el('rect', { x: 0, y: 0, width: 420, height: 740, fill: '#e6e9ec' }, LC);
    el('text', { class: 'rx-zm-side', x: 210, y: 715, 'text-anchor': 'middle' }, LC).textContent = '아연판(금속)';
    el('text', { class: 'rx-zm-side', x: 760, y: 715, 'text-anchor': 'middle' }, LC).textContent = '수용액';
    const lat = el('g', {}, LC), ions = el('g', {}, LC), fx = el('g', {}, LC);

    let sol = 'cu', z = 0, latt = [], free = [], counts = {}, ev = null, evT = 0, T = 0;
    const R = 27;
    function ion(k, label, x, y) {
      let g;
      if (k === 'SO4') { g = el('g', { transform: `translate(${x} ${y})` }, ions); [[-16, -14], [16, -14], [-16, 14], [16, 14]].forEach(([a, b]) => atom(g, 'O', a, b, 10, '')); atom(g, 'S', 0, 0, 15, 'S'); }
      else if (k === 'Cl') { g = el('g', { transform: `translate(${x} ${y})` }, ions); const a = atom(g, 'O', 0, 0, 20, 'Cl'); a._c.setAttribute('fill', '#5fbf6a'); }
      else if (k === 'H') { g = atom(ions, 'H', x, y, 14, 'H'); }
      else { g = atom(ions, k, x, y, R - 4, k); }
      const t = f(el('text', { class: 'rx-mlab', y: k === 'H' ? 32 : 42 }, g), label);
      return { g, k, x, y, vx: 0, vy: 0, t };
    }
    function build() {
      lat.innerHTML = ''; ions.innerHTML = ''; fx.innerHTML = '';
      latt = []; free = []; ev = null; evT = 0;
      for (let r = 0; r < 7; r++) for (let c = 0; c < 5; c++) { const x = 80 + c * 64 + (r % 2) * 22, y = 110 + r * 82; latt.push({ x, y, k: 'Zn', g: atom(lat, 'Zn', x, y, R) }); }
      const S = SOL[sol];
      for (let i = 0; i < S.n0; i++) free.push(ion(S.cat, S.catL, 540 + (i % 4) * 120 + Math.random() * 40, 90 + Math.floor(i / 4) * (sol === 'h' ? 150 : 200) + Math.random() * 40));
      const nAn = sol === 'cu' ? S.n0 : S.n0;
      for (let i = 0; i < nAn; i++) free.push(ion(S.an, S.anL, 600 + (i % 3) * 140 + Math.random() * 40, 60 + Math.floor(i / 3) * (sol === 'h' ? 120 : 160) + Math.random() * 30));
      counts = { zn: 0, cat: S.n0, an: nAn };
      q('.rx-zm-eq').innerHTML = S.eq; q('.rx-zm-half').innerHTML = S.half;
      rows.forEach((row, i) => { row.querySelector('span').innerHTML = S.rows[i][0]; row.dataset.k = S.rows[i][1]; });
      counts0 = counts.zn + counts.cat + counts.an;
      update();
    }
    let counts0 = 0;
    function update() {
      rows.forEach((row) => { const v = counts[row.dataset.k]; row.querySelector('i').style.width = (v / 16 * 100) + '%'; row.querySelector('em').textContent = v; });
      const tot = counts.zn + counts.cat + counts.an;
      q('.rx-cnt-sum').innerHTML = `전체 이온 수 ${tot}개 (처음 ${counts0}개) → <b>${tot === counts0 ? '그대로' : '줄었다'}</b>`;
      const left = counts.cat / SOL[sol].n0;
      if (sol === 'cu') { solA.setAttribute('fill', mix('#dbe9f2', '#3f8fd8', left)); solB.setAttribute('fill', mix('#dbe9f2', '#3f8fd8', left)); solC.setAttribute('fill', mix('#f1f5f8', '#d3e5f6', left)); }
      else { solA.setAttribute('fill', '#e3edf2'); solB.setAttribute('fill', '#e3edf2'); solC.setAttribute('fill', '#eef3f6'); }
      crustA.setAttribute('opacity', sol === 'cu' ? (0.15 + (1 - left) * 0.85).toFixed(2) : 0);
    }
    function start() {
      const zn = latt.filter((a) => a.k === 'Zn').sort((a, b) => b.x - a.x)[0];
      if (!zn) { ev = { reset: true, t: 0 }; return; }
      const S = SOL[sol], need = sol === 'h' ? 2 : 1;
      const cats = free.filter((a) => a.k === S.cat && !a.busy).sort((a, b) => Math.hypot(a.x - zn.x, a.y - zn.y) - Math.hypot(b.x - zn.x, b.y - zn.y)).slice(0, need);
      if (!zn || cats.length < need) { ev = { reset: true, t: 0 }; return; }
      cats.forEach((c) => { c.busy = true; });
      const es = [0, 1].map(() => el('circle', { r: 8, class: 'rx-e' }, fx));
      ev = { zn, cats, es, t: 0, sx: cats.map((c) => [c.x, c.y]) };
    }
    function stepEv(dt) {
      if (!ev) { evT += dt; if (evT > 0.6) { evT = 0; start(); } return; }
      if (ev.reset) { ev.t += dt; if (ev.t > 2.5) build(); return; }
      ev.t += dt / 1.8;
      const u = ev.t, { zn, cats, es } = ev;
      // 1) 양이온이 표면 가까이로
      cats.forEach((c, i) => {
        const tx = zn.x + 56 + i * 8, ty = zn.y + (i ? 26 : -20);
        const k = smooth(0, 0.35, u);
        if (u < 0.75) { c.x = ev.sx[i][0] + (tx - ev.sx[i][0]) * k; c.y = ev.sx[i][1] + (ty - ev.sx[i][1]) * k; }
      });
      // 2) 전자 둘이 아연 원자에서 양이온으로
      es.forEach((e, i) => {
        const c = cats[Math.min(i, cats.length - 1)], k = smooth(0.35, 0.62, u);
        e.setAttribute('cx', zn.x + (c.x - zn.x) * k + (i ? 6 : -6)); e.setAttribute('cy', zn.y + (c.y - zn.y) * k + (i ? 8 : -8));
        e.setAttribute('opacity', u > 0.35 && u < 0.66 ? 1 : 0);
      });
      if (u >= 0.66 && !ev.done) {
        ev.done = true;
        // 아연 원자 → Zn²⁺ 이온(수용액으로)
        zn.g.remove(); zn.k = 'gone';
        const zi = ion('Zn', 'Zn^2+', zn.x, zn.y); zi.vx = 140; zi.vy = (Math.random() - 0.5) * 40; zi.out = 0.8; free.push(zi);
        if (sol === 'cu') {
          const c = cats[0]; c.g.remove(); free.splice(free.indexOf(c), 1);
          zn.k = 'Cu'; zn.g = atom(lat, 'Cu', zn.x, zn.y, R);
        } else {
          cats.forEach((c) => { c.g.remove(); free.splice(free.indexOf(c), 1); });
          const h2 = el('g', {}, fx); atom(h2, 'H', -11, 0, 13); atom(h2, 'H', 11, 0, 13); f(el('text', { class: 'rx-mlab', y: 32 }, h2), 'H_2');
          ev.h2 = { g: h2, x: zn.x + 60, y: zn.y };
        }
        counts.zn++; counts.cat -= sol === 'h' ? 2 : 1; update();
      }
      if (ev.h2) { ev.h2.y -= 160 * dt; ev.h2.g.setAttribute('transform', `translate(${ev.h2.x} ${ev.h2.y})`); }
      if (u >= 1) { es.forEach((e) => e.remove()); if (ev.h2) ev.h2.g.remove(); ev = null; }
    }
    function drift(dt) {
      free.forEach((a) => {
        if (a.busy && !a.out) { a.g.setAttribute('transform', `translate(${a.x} ${a.y})`); return; }
        if (a.out > 0) { a.out -= dt; a.x += a.vx * dt; a.y += a.vy * dt; }
        else { a.vx += (Math.random() - 0.5) * 120 * dt; a.vy += (Math.random() - 0.5) * 120 * dt; a.vx *= 0.97; a.vy *= 0.97; a.x += a.vx * dt; a.y += a.vy * dt; }
        if (a.x < 480) { a.x = 480; a.vx = Math.abs(a.vx); } if (a.x > 1020) { a.x = 1020; a.vx = -Math.abs(a.vx); }
        if (a.y < 40) { a.y = 40; a.vy = Math.abs(a.vy); } if (a.y > 680) { a.y = 680; a.vy = -Math.abs(a.vy); }
        a.g.setAttribute('transform', `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)})`);
      });
    }
    function view() {
      const sa = 1 + 9 * smooth(0, 0.45, z), sb = 0.5 + 1.2 * smooth(0.2, 0.75, z), sc = 0.55 + 0.45 * smooth(0.55, 0.9, z);
      LA.setAttribute('transform', `translate(563 463) scale(${sa}) translate(-563 -463)`);
      LB.setAttribute('transform', `translate(528 370) scale(${sb}) translate(-528 -370)`);
      LC.setAttribute('transform', `translate(528 370) scale(${sc}) translate(-528 -370)`);
      LA.setAttribute('opacity', 1 - smooth(0.25, 0.4, z));
      LB.setAttribute('opacity', smooth(0.25, 0.4, z) * (1 - smooth(0.6, 0.72, z)));
      LC.setAttribute('opacity', smooth(0.6, 0.72, z));
      LA.style.display = z > 0.42 ? 'none' : ''; LB.style.display = z < 0.24 || z > 0.74 ? 'none' : ''; LC.style.display = z < 0.58 ? 'none' : '';
      tag.textContent = z < 0.33 ? '눈으로 본 비커' : z < 0.66 ? '돋보기로 본 아연판 표면' : '원자 모형';
      now.textContent = z < 0.66 ? '① 확대 손잡이를 끝까지 밀어 보자' : '② 노란 전자가 어디에서 어디로 가는지 보자';
      now.classList.toggle('done', z >= 0.66);
      range.value = Math.round(z * 100);
    }
    const setZ = (v) => { z = clamp(v, 0, 1); view(); };
    range.addEventListener('input', () => setZ(range.value / 100));
    keep(range);
    svg.addEventListener('wheel', (e) => { e.preventDefault(); e.stopPropagation(); setZ(z - e.deltaY * 0.0012); }, { passive: false });
    root.querySelectorAll('[data-sol]').forEach((b) => b.addEventListener('click', () => {
      root.querySelectorAll('[data-sol]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      sol = b.dataset.sol; build();
    }));
    function step(dt) { T += dt; stepEv(dt); drift(dt); }
    const loop = window.Stage.loop(step);
    build(); view(); step(0.016);
    return { setActive(on) { if (on) loop.start(); else loop.stop(); }, setZ, sol: (k) => root.querySelector(`[data-sol="${k}"]`).click(), get counts() { return counts; } };
  }
  window.RxZoom = { mount };
})();
