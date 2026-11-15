/* 3차시 4장(교과서 25쪽 그림 Ⅰ-14): 대륙의 조상 핀치를 끌었다 놓아(튕겨) 섬으로 날려 보낸다. 놓는 순간의 속도로 날아가 공기 저항으로 느려진다.
   섬 위에서 느려지면 내려앉고, 바다 위에서 멈추면 대륙으로 돌아온다. 섬마다 1.4초에 한 세대: 자손 둘(부모 형질 + 작은 차이) → 아홉 마리가 넘으면 그 섬 먹이에 가장 안 맞는 개체가 빠진다.
   형질 t(0 조상 부리 → 1 그 섬에 맞는 부리)의 평균이 0.75를 넘으면 «새로운 종». 수는 이해를 돕기 위한 모형. */
(function () {
  'use strict';
  const K = window.EvKit, F = window.EvFinch, { el, clamp } = K;
  const ANC = { L: 16, D: 12 };
  const ISL = [
    { k: 'cactus', name: '선인장 섬', x: 520, y: 175, rx: 125, ry: 78, col: '#2f9e5b' },
    { k: 'seed', name: '큰 씨앗 섬', x: 560, y: 535, rx: 135, ry: 82, col: '#8a5a33' },
    { k: 'insect', name: '곤충 섬', x: 885, y: 345, rx: 118, ry: 84, col: '#2a63c9' },
  ];
  const gauss = () => Math.sqrt(-2 * Math.log(Math.random() + 1e-9)) * Math.cos(2 * Math.PI * Math.random());

  function mount(root) {
    const svg = root.querySelector('.ev-is-svg'), tree = root.querySelector('.ev-is-tree'), now = root.querySelector('.ev-is-now'), msg = root.querySelector('.ev-is-msg');
    el('rect', { x: 0, y: 0, width: 1056, height: 700, fill: '#8cc6e0' }, svg);
    for (let i = 0; i < 26; i++) el('path', { d: `M${180 + (i * 131) % 860} ${20 + (i * 71) % 660} q 12 -7 24 0 t 24 0`, stroke: 'rgba(255,255,255,.5)', 'stroke-width': 2, fill: 'none' }, svg);
    el('path', { d: 'M0 0 H 150 C 120 120, 175 240, 140 360 S 120 600, 160 700 H 0 Z', fill: '#b9c98a', stroke: '#6f7f45', 'stroke-width': 3 }, svg);
    el('text', { x: 18, y: 40, style: 'font:800 22px var(--f-body)', fill: '#1d2433' }, svg).textContent = '남아메리카';
    el('text', { x: 18, y: 66, style: 'font:800 22px var(--f-body)', fill: '#1d2433' }, svg).textContent = '대륙';
    const isl = ISL.map((s) => {
      const g = el('g', {}, svg);
      el('ellipse', { cx: s.x, cy: s.y, rx: s.rx, ry: s.ry, fill: '#e2cf8c', stroke: '#8a7444', 'stroke-width': 3 }, g);
      el('ellipse', { cx: s.x - 10, cy: s.y + 4, rx: s.rx * 0.7, ry: s.ry * 0.6, fill: '#c9d68f', opacity: 0.7 }, g);
      const fd = el('g', {}, g);
      for (let i = 0; i < 4; i++) {
        const x = s.x - s.rx * 0.6 + i * s.rx * 0.4, y = s.y + s.ry * 0.45;
        if (s.k === 'cactus') el('path', { d: `M${x} ${y} v -34 a8 8 0 0 1 16 0 v 34 z M${x + 16} ${y - 16} h8 v-10 a5 5 0 0 1 10 0 v16 h-18 z`, fill: '#6aa564', stroke: '#1d2433', 'stroke-width': 2 }, fd);
        if (s.k === 'seed') el('ellipse', { cx: x + 8, cy: y - 6, rx: 11, ry: 8, fill: '#7a5230', stroke: '#1d2433', 'stroke-width': 2 }, fd);
        if (s.k === 'insect') { el('ellipse', { cx: x + 8, cy: y - 6, rx: 6, ry: 4, fill: '#2a2a2a' }, fd); el('path', { d: `M${x + 2} ${y - 12} l 4 3 M${x + 14} ${y - 12} l -4 3`, stroke: '#2a2a2a', 'stroke-width': 1.5 }, fd); }
      }
      const lab = el('text', { x: s.x, y: s.y - s.ry - 12, 'text-anchor': 'middle', style: 'font:800 20px var(--f-body)', fill: '#1d2433' }, svg);
      lab.textContent = s.name;
      return { ...s, g, lab, pop: [], gens: 0, timer: 0, opt: F.TYPES[s.k], species: false };
    });
    const flyG = el('g', {}, svg);
    // 대륙의 조상 무리
    const perch = [[60, 170], [95, 250], [55, 330], [100, 410], [60, 490], [95, 570]];
    const flock = perch.map(([x, y]) => ({ x, y, hx: x, hy: y, g: null, state: 'perch' }));
    flock.forEach((b) => { b.g = F.draw(flyG, ANC); b.g.setAttribute('transform', `translate(${b.x} ${b.y}) scale(0.9)`); });
    // 계통수
    el('rect', { x: 0, y: 0, width: 520, height: 330, fill: '#fbfcf9' }, tree);
    el('path', { d: 'M260 300 V 250', stroke: '#6b5444', 'stroke-width': 8, 'stroke-linecap': 'round' }, tree);
    el('text', { x: 260, y: 324, 'text-anchor': 'middle', style: 'font:700 16px var(--f-body)', fill: '#4b566a' }, tree).textContent = '핀치 조상(대륙)';
    const anc = F.draw(tree, ANC); anc.setAttribute('transform', 'translate(300 288) scale(0.6)');
    const branches = isl.map((s, i) => {
      const path = el('path', { stroke: s.col, 'stroke-width': 7, fill: 'none', 'stroke-linecap': 'round', opacity: 0 }, tree);
      const bird = F.draw(tree, ANC); bird.setAttribute('opacity', 0);
      const t1 = el('text', { 'text-anchor': 'middle', style: 'font:800 15px var(--f-body)', fill: s.col }, tree);
      const t2 = el('text', { 'text-anchor': 'middle', style: 'font:600 13px var(--f-body)', fill: '#4b566a' }, tree);
      return { path, bird, t1, t2, tx: 90 + i * 170 };
    });
    const beakOf = (s, t) => ({ L: K.lerp(ANC.L, s.opt.L, t), D: K.lerp(ANC.D, s.opt.D, t) });
    const inIsl = (x, y) => isl.find((s) => ((x - s.x) / s.rx) ** 2 + ((y - s.y) / s.ry) ** 2 < 0.85);
    function settle(s, t) {
      const a = Math.random() * Math.PI * 2, q = Math.sqrt(Math.random()) * 0.6;
      const b = { t: clamp(t, 0, 1), x: s.x + Math.cos(a) * s.rx * q, y: s.y + Math.sin(a) * s.ry * q - 10 };
      b.g = F.draw(s.g, beakOf(s, b.t)); b.g.setAttribute('transform', `translate(${b.x} ${b.y}) scale(0.62)`);
      s.pop.push(b); return b;
    }
    function mean(s) { return s.pop.reduce((a, b) => a + b.t, 0) / (s.pop.length || 1); }
    function drawTree() {
      isl.forEach((s, i) => {
        const B = branches[i]; if (!s.pop.length && !s.gens) return;
        const len = 40 + Math.min(1, s.gens / 14) * 130, ex = B.tx, ey = 250 - len;
        B.path.setAttribute('d', `M260 250 Q ${(260 + ex) / 2} 250 ${ex} ${Math.min(240, 250 - len * 0.3)} V ${ey}`); B.path.setAttribute('opacity', 1);
        const mb = beakOf(s, mean(s)); B.bird._beak(mb.L, mb.D); B.bird.setAttribute('transform', `translate(${ex} ${ey - 16}) scale(0.7)`); B.bird.setAttribute('opacity', 1);
        B.t1.setAttribute('x', ex); B.t1.setAttribute('y', ey - 60); B.t1.textContent = s.species ? '새로운 종' : `${s.gens}세대`;
        B.t2.setAttribute('x', ex); B.t2.setAttribute('y', ey - 42); B.t2.textContent = s.species ? s.opt.name : s.name;
      });
    }
    function generation(s) {
      s.gens++;
      for (let k = 0; k < 2; k++) { const par = s.pop[Math.floor(Math.random() * s.pop.length)]; settle(s, par.t + 0.18 * Math.abs(gauss()) * (Math.random() < 0.75 ? 1 : -1)); }
      while (s.pop.length > 9) { const w = s.pop.reduce((a, b) => (b.t < a.t ? b : a)); w.g.remove(); s.pop.splice(s.pop.indexOf(w), 1); }
      s.lab.textContent = `${s.name} · ${s.gens}세대`;
      if (!s.species && mean(s) > 0.75) { s.species = true; msg.innerHTML = `${s.name}: 여러 세대 동안 그 섬 먹이에 맞는 부리가 선택되어 <b>${s.opt.name}</b>를 가진 새로운 종이 되었다.`; }
      const done = isl.filter((x) => x.species).length;
      if (done >= 2) { now.textContent = `한 조상에서 ${done}종으로 갈라졌다 → 생물다양성`; now.classList.add('done'); }
      drawTree();
    }
    let held = null, trail = [];
    K.hold(svg, {
      down(p) { const b = flock.find((q) => q.state === 'perch' && Math.hypot(p.x - q.x, p.y - q.y) < 50); if (!b) return false; held = b; b.state = 'held'; trail = [{ t: performance.now(), x: p.x, y: p.y }]; return true; },
      move(p) { if (!held) return; held.x = p.x; held.y = p.y; trail.push({ t: performance.now(), x: p.x, y: p.y }); while (trail.length > 2 && performance.now() - trail[0].t > 110) trail.shift(); held.g.setAttribute('transform', `translate(${p.x} ${p.y}) scale(0.9)`); },
      up(p) {
        const b = held; held = null; if (!b) return;
        const a = trail[0], dt = Math.max(0.016, (performance.now() - a.t) / 1000);
        launch(b, (p.x - a.x) / dt, (p.y - a.y) / dt);
      },
    }, (e) => K.svgPt(svg, e));
    function launch(b, vx, vy) {
      const sp = Math.hypot(vx, vy);
      if (sp < 120) { b.state = 'home'; return; }
      const k = Math.min(1, 1500 / sp); b.vx = vx * k; b.vy = vy * k; b.state = 'fly';
    }
    function step(dt) {
      flock.forEach((b) => {
        if (b.state === 'fly') {
          b.x += b.vx * dt; b.y += b.vy * dt; const f = Math.exp(-1.8 * dt); b.vx *= f; b.vy *= f;
          const sp = Math.hypot(b.vx, b.vy), s = inIsl(b.x, b.y);
          if (s && sp < 650) { settle(s, 0); b.state = 'refill'; b.wait = 1; b.g.setAttribute('opacity', 0);
            if (s.pop.length === 1) msg.innerHTML = `${s.name}에 핀치가 내려앉았다. 이제 이 섬에서 세대가 흐른다.`;
            now.textContent = '② 다른 섬에도 날려 보내자'; return; }
          if (sp < 70 || b.x > 1080 || b.y < -40 || b.y > 740 || b.x < -40) { b.state = 'home'; msg.innerHTML = '바다를 다 건너지 못하고 대륙으로 돌아왔다. 더 세게 튕겨 보자.'; }
          const flap = 1 + 0.25 * Math.sin(performance.now() / 50);
          b.g.setAttribute('transform', `translate(${b.x.toFixed(1)} ${b.y.toFixed(1)}) scale(${(0.9 * (b.vx < 0 ? -1 : 1)).toFixed(2)} ${(0.9 * flap).toFixed(2)})`);
        } else if (b.state === 'home') {
          b.x += (b.hx - b.x) * Math.min(1, dt * 3); b.y += (b.hy - b.y) * Math.min(1, dt * 3);
          b.g.setAttribute('transform', `translate(${b.x.toFixed(1)} ${b.y.toFixed(1)}) scale(-0.9 0.9)`);
          if (Math.hypot(b.x - b.hx, b.y - b.hy) < 3) { b.state = 'perch'; b.g.setAttribute('transform', `translate(${b.hx} ${b.hy}) scale(0.9)`); }
        } else if (b.state === 'refill') {
          b.wait -= dt; if (b.wait <= 0) { b.x = b.hx; b.y = b.hy; b.state = 'perch'; b.g.setAttribute('opacity', 1); b.g.setAttribute('transform', `translate(${b.hx} ${b.hy}) scale(0.9)`); }
        }
      });
      isl.forEach((s) => { if (!s.pop.length) return; s.timer += dt; if (s.timer > 1.4) { s.timer = 0; generation(s); } });
    }
    const tk = K.ticker(step);
    root._is = { send: (i) => { settle(isl[i], 0); drawTree(); }, gens: (n) => { for (let k = 0; k < n; k++) isl.forEach((s) => { if (s.pop.length) generation(s); }); }, launch: (vx, vy) => { const b = flock.find((q) => q.state === 'perch'); launch(b, vx, vy); } };
    return { setActive(on) { if (on) tk.start(); else tk.stop(); } };
  }
  window.EvIslands = { mount };
})();
