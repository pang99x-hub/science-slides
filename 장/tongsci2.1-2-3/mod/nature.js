/* 2차시: 자연에서 일어나는 흡수와 방출(교과서 57쪽 그림 I-31).
   바다를 누르고 있으면 그 자리에서 수증기 덩이가 올라간다(증발 = 흡수, 수면 온도계가 조금 내려감).
   덩이가 높은 하늘(차가운 층, y < 230)에 닿으면 응결해 구름에 붙고 주황 반짝임(방출, 그 높이 공기가 데워짐).
   구름은 바람에 밀려 오른쪽으로 가며, 해와 나무 사이에 오면 나무에 닿는 빛 → 광합성 막대가 줄어든다. 커지면 비를 뿌린다.
   치타를 옆으로 끌면 달리며, 빠를수록 세포호흡으로 방출하는 에너지(아지랑이·입김)가 커진다. 막대·온도는 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const { el, clamp, lerp } = window.EA;
  const SUN = { x: 930, y: 90 }, TREE = { x: 800, y: 380 };
  function mount(root) {
    const svg = root.querySelector('.ea-na-svg');
    const now = root.querySelector('.na-now'), msg = root.querySelector('.na-msg');
    const bars = Object.fromEntries([...root.querySelectorAll('.ea-na-row')].map((r) => [r.dataset.k, r]));
    el('rect', { class: 'ea-na-sky', x: 0, y: 0, width: 1060, height: 560 }, svg);
    el('rect', { class: 'ea-na-cold', x: 0, y: 0, width: 1060, height: 230 }, svg);
    el('line', { class: 'ea-na-lvl', x1: 0, x2: 1060, y1: 230, y2: 230 }, svg);
    el('text', { class: 'ea-na-lt', x: 16, y: 220, text: '높은 하늘 · 차갑다' }, svg);
    const sun = el('g', { class: 'ea-na-sun' }, svg);
    el('circle', { cx: SUN.x, cy: SUN.y, r: 46 }, sun);
    for (let i = 0; i < 10; i++) { const a = i * Math.PI / 5; el('line', { x1: SUN.x + Math.cos(a) * 58, y1: SUN.y + Math.sin(a) * 58, x2: SUN.x + Math.cos(a) * 76, y2: SUN.y + Math.sin(a) * 76 }, sun); }
    const beam = el('path', { class: 'ea-na-beam', d: `M${SUN.x - 30} ${SUN.y + 30} L ${TREE.x - 90} ${TREE.y - 40} L ${TREE.x + 40} ${TREE.y - 70} L ${SUN.x + 10} ${SUN.y + 44} Z` }, svg);
    el('rect', { class: 'ea-na-sea', x: 0, y: 560, width: 560, height: 140 }, svg);
    [590, 620, 650, 680].forEach((y, i) => el('path', { class: 'ea-na-wave', d: `M${10 + i * 30} ${y} q20 -8 40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0 t40 0` }, svg));
    el('rect', { class: 'ea-na-grass', x: 560, y: 560, width: 500, height: 140 }, svg);
    // 나무
    el('rect', { class: 'ea-na-trunk', x: TREE.x - 16, y: TREE.y + 40, width: 32, height: 150 }, svg);
    const crown = el('g', { class: 'ea-na-crown' }, svg);
    [[-70, 10, 70], [0, -30, 86], [70, 10, 70], [-30, 50, 60], [40, 50, 60]].forEach(([dx, dy, r]) => el('circle', { cx: TREE.x + dx, cy: TREE.y + dy, r }, crown));
    const bubs = [...Array(8)].map((_, i) => ({ c: el('circle', { class: 'ea-na-o2', r: 6 }, svg), k: i / 8, x: TREE.x - 80 + i * 22 }));
    // 치타
    const cat = el('g', { class: 'ea-na-cat', tabindex: 0, role: 'slider', 'aria-label': '치타(옆으로 끌면 달린다, 오른쪽 화살표 키로도 달린다)' }, svg);
    const catBody = el('g', {}, cat);
    el('ellipse', { class: 'ea-na-cbody', cx: 0, cy: 0, rx: 70, ry: 22 }, catBody);
    el('circle', { class: 'ea-na-chead', cx: 74, cy: -12, r: 18 }, catBody);
    el('path', { class: 'ea-na-ctail', d: 'M-68 -6 q-40 -10 -60 12' }, catBody);
    for (let i = 0; i < 10; i++) el('circle', { class: 'ea-na-spot', cx: -50 + i * 11, cy: -6 + (i % 2) * 10, r: 3 }, catBody);
    const legs = [-40, -20, 30, 50].map((x) => el('line', { class: 'ea-na-leg', x1: x, y1: 14, x2: x, y2: 46 }, catBody));
    el('rect', { class: 'ea-na-chit', x: -140, y: -60, width: 250, height: 120 }, cat);
    const haze = el('g', { class: 'ea-na-haze' }, svg);
    const hz = [0, 1, 2].map(() => el('path', {}, haze));
    const breath = el('circle', { class: 'ea-na-breath', r: 0 }, svg);
    // 온도계: 수면, 높은 하늘
    const thSea = window.EA.thermo(svg, { x: 520, y: 540, h: 140, lo: 15, hi: 35, w: 14, cls: 'ea-na-th' });
    const thAir = window.EA.thermo(svg, { x: 40, y: 190, h: 120, lo: -20, hi: 0, w: 14, cls: 'ea-na-th' });
    const seaHit = el('rect', { class: 'ea-na-hit', x: 0, y: 560, width: 560, height: 140 }, svg);
    const puffG = el('g', {}, svg), cloudG = el('g', { class: 'ea-na-cloud' }, svg), sparkG = el('g', {}, svg), rainG = el('g', { class: 'ea-na-rain' }, svg);
    const cloudPuffs = [];

    let hold = null, puffs = [], sparks = [], cloud = { x: 260, n: 0 }, Tsea = 25, Tair = -12, t = 0, run = 0, catX = 640, dragX = null, evap = 0, cond = 0, photo = 1, spawnT = 0;
    window.EA.drag(seaHit, svg, { start(p) { hold = p; return true; }, move(p) { hold = { x: clamp(p.x, 10, 550), y: p.y }; }, end() { hold = null; } });
    window.EA.drag(cat, svg, {
      start(p) { dragX = p.x; return true; },
      move(p) { const d = p.x - dragX; dragX = p.x; run = clamp(run + Math.abs(d) / 260, 0, 1); },
      end() { dragX = null; },
    });
    cat.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); run = clamp(run + 0.25, 0, 1); } });

    function addCloudPuff() {
      cloud.n++;
      const i = cloud.n, c = el('circle', { r: 0 }, cloudG);
      cloudPuffs.push({ c, dx: ((i * 37) % 160) - 80, dy: ((i * 23) % 60) - 30, r: 22 + (i % 4) * 6 });
    }
    function step(dt) {
      t += dt;
      // 증발
      evap = hold ? Math.min(1, evap + dt * 2) : Math.max(0, evap - dt * 1.5);
      if (hold) { spawnT += dt; if (spawnT > 0.18) { spawnT = 0; const c = el('ellipse', { class: 'ea-na-vap', rx: 16, ry: 10 }, puffG); puffs.push({ c, x: hold.x + (Math.random() - 0.5) * 40, y: 560 }); } }
      Tsea += ((hold ? 22.5 : 25) - Tsea) * Math.min(1, dt / 2);
      cond = Math.max(0, cond - dt * 0.8);
      puffs = puffs.filter((p) => {
        p.y -= dt * 160; p.x += Math.sin(t * 2 + p.y / 40) * 0.6;
        p.c.setAttribute('cx', p.x.toFixed(1)); p.c.setAttribute('cy', p.y.toFixed(1));
        if (p.y < 230) {
          p.c.remove(); if (cloud.n < 26) addCloudPuff();
          cond = Math.min(1, cond + 0.35); Tair += 0.4;
          const s = el('path', { class: 'ea-na-spark', d: 'M0 -12 L3 -3 L12 0 L3 3 L0 12 L-3 3 L-12 0 L-3 -3 Z' }, sparkG);
          sparks.push({ s, x: cloud.x + (Math.random() - 0.5) * 120, y: 200 - Math.random() * 60, k: 0 });
          return false;
        }
        return true;
      });
      Tair += (-12 - Tair) * Math.min(1, dt / 5);
      sparks = sparks.filter((s) => { s.k += dt / 0.8; s.s.setAttribute('transform', `translate(${s.x.toFixed(1)} ${(s.y - s.k * 30).toFixed(1)}) scale(${(1 - s.k).toFixed(2)})`); if (s.k >= 1) { s.s.remove(); return false; } return true; });
      // 구름: 바람에 밀린다
      if (cloud.n > 0) cloud.x += dt * (6 + cloud.n * 2.2);
      if (cloud.x > 1200) { cloudG.replaceChildren(); cloudPuffs.length = 0; cloud = { x: 260, n: 0 }; }
      cloudPuffs.forEach((p) => { p.c.setAttribute('cx', (cloud.x + p.dx).toFixed(1)); p.c.setAttribute('cy', (150 + p.dy).toFixed(1)); p.c.setAttribute('r', String(p.r)); });
      const raining = cloud.n > 18;
      rainG.replaceChildren();
      if (raining) for (let i = 0; i < 14; i++) { const x = cloud.x - 90 + i * 14, y = 200 + ((t * 300 + i * 53) % 340); el('line', { x1: x, y1: y, x2: x - 4, y2: y + 18 }, rainG); }
      // 해와 나무 사이를 가리면 빛이 준다
      const between = cloud.n > 4 && cloud.x > 760 && cloud.x < 1010;
      const shade = between ? Math.min(0.85, cloud.n / 22) : 0;
      photo += ((1 - shade) - photo) * Math.min(1, dt / 0.6);
      beam.style.opacity = String(0.45 * photo);
      bubs.forEach((b) => { b.k = (b.k + dt * 0.5 * photo) % 1; b.c.setAttribute('cx', (b.x + Math.sin(b.k * 6) * 6).toFixed(1)); b.c.setAttribute('cy', (TREE.y - 70 - b.k * 90).toFixed(1)); b.c.style.opacity = String(photo * (1 - b.k)); });
      // 치타
      if (dragX === null) run = Math.max(0, run - dt * 0.25);
      catX += dt * run * 420; if (catX > 1120) catX = 560;
      cat.setAttribute('transform', `translate(${catX.toFixed(1)} 610)`);
      legs.forEach((l, i) => { const sw = Math.sin(t * (4 + run * 20) + i * 1.6) * 22 * run; l.setAttribute('x2', (Number(l.getAttribute('x1')) + sw).toFixed(1)); });
      catBody.setAttribute('transform', `translate(0 ${(Math.sin(t * 20) * 3 * run).toFixed(1)})`);
      hz.forEach((h, i) => { const x = catX - 40 + i * 30; h.setAttribute('d', `M${x} 580 q-8 -12 0 -24 q8 -12 0 -24`); });
      haze.style.opacity = String(run);
      breath.setAttribute('cx', (catX + 100).toFixed(1)); breath.setAttribute('cy', '596'); breath.setAttribute('r', (run * (8 + 6 * Math.sin(t * 8))).toFixed(1));
      thSea.set(Tsea); thAir.set(Tair);
      const B = { sea: evap, cloud: cond, tree: photo, run: 0.15 + 0.85 * run };
      for (const [k, v] of Object.entries(B)) { bars[k].querySelector('.ea-bar em').style.width = (v * 100).toFixed(0) + '%'; bars[k].classList.toggle('on', v > 0.2 && (k !== 'tree' || photo < 0.95 || cloud.n > 0)); }
      msg.textContent = hold ? '바닷물이 햇볕의 에너지를 흡수해 증발한다 — 수면이 조금 식는다.'
        : run > 0.3 ? '빨리 달릴수록 세포호흡이 활발해 몸에서 열이 난다.'
        : raining ? '수증기가 응결하며 방출한 에너지로 구름이 자란다. 태풍도 이렇게 에너지를 얻으며 커진다.'
          : between ? '구름이 햇빛을 가려 나무가 흡수하는 빛이 줄었다 → 광합성이 약해진다.'
            : run > 0.3 ? '빨리 달릴수록 세포호흡이 활발해 몸에서 열이 난다.'
              : cloud.n > 0 ? '높은 하늘에서 수증기가 응결하며 에너지를 방출해 둘레 공기가 데워진다.' : '바다를 누르면 햇볕이 바닷물을 데운다.';
      now.textContent = cloud.n === 0 ? '① 바다를 꾹 누르고 있어 보자' : !between && photo > 0.9 ? '② 구름을 키워 해를 가려 보자' : run < 0.3 ? '③ 치타를 옆으로 끌어 달리게 하자' : '④ 넷 가운데 흡수와 방출을 나누어 보자';
    }
    const loop = window.Stage.loop(step);
    step(0.016);
    root._na = {
      hold(sec) { hold = { x: 260, y: 600 }; setTimeout(() => { hold = null; }, sec * 1000); },
      run(v) { run = v; },
    };
    return { setActive(on) { if (on) loop.start(); else { loop.stop(); hold = null; } } };
  }
  window.NatureCycle = { mount };
})();
