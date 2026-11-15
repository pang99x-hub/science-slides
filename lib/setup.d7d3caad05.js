/* 3차시 탐구 과정 1~3: 주머니를 반응 용기로 끌어 넣고(1~5개), 비커 윗부분을 잡고 돌려 기울여 물을 붓는다.
   붓는 빠르기 = (기운 각 − 쏟기 시작하는 각) × 1.6 mL/초. 너무 많이 기울이면 쏟아지며 김이 튄다(경고).
   «조리 용기 겹쳐 놓고 재기» → LimeModel로 20분 그래프를 12초에 그린다(모형). */
(function () {
  'use strict';
  const { el, clamp, lerp } = window.EA;
  const C = { x: 250, y: 470, w: 300, h: 150 };          // 반응 용기
  const PIV = { x: 600, y: 420 };                         // 비커 회전 중심(바닥 왼쪽 모서리)
  const G = { x: 730, y: 50, w: 300, h: 220 };            // 태블릿 그래프
  function mount(root) {
    const svg = root.querySelector('.ea-su-svg');
    const R = { n: root.querySelector('.su-n'), w: root.querySelector('.su-w'), t: root.querySelector('.su-t') };
    const now = root.querySelector('.su-now'), msg = root.querySelector('.su-msg');
    const stackBtn = root.querySelector('#su-stack'), resetBtn = root.querySelector('#su-reset');
    el('rect', { class: 'ea-su-wall', x: 0, y: 0, width: 1060, height: 700 }, svg);
    el('rect', { class: 'ea-su-bench', x: 0, y: 620, width: 1060, height: 80 }, svg);
    // 스탠드와 센서
    el('rect', { class: 'ea-su-base', x: 120, y: 604, width: 120, height: 16, rx: 4 }, svg);
    el('line', { class: 'ea-su-rod', x1: 150, y1: 604, x2: 150, y2: 150 }, svg);
    el('line', { class: 'ea-su-rod', x1: 150, y1: 200, x2: 400, y2: 200 }, svg);
    const sensor = el('line', { class: 'ea-su-sensor', x1: 400, y1: 200, x2: 400, y2: 300 }, svg);
    el('path', { class: 'ea-su-wire', d: `M400 200 C 460 120, 600 80, ${G.x} ${G.y + 120}` }, svg);
    // 태블릿 그래프
    el('rect', { class: 'ea-su-tab', x: G.x - 16, y: G.y - 16, width: G.w + 32, height: G.h + 44, rx: 18 }, svg);
    el('rect', { class: 'ea-su-scr', x: G.x, y: G.y, width: G.w, height: G.h }, svg);
    for (let i = 0; i <= 4; i++) { const y = G.y + G.h - i * G.h / 4; el('line', { class: 'ea-su-grid', x1: G.x, x2: G.x + G.w, y1: y, y2: y }, svg); el('text', { class: 'ea-su-ax', x: G.x + 4, y: y - 4, text: `${20 + i * 20}` }, svg); }
    el('text', { class: 'ea-su-ax', x: G.x + G.w - 4, y: G.y + G.h + 22, 'text-anchor': 'end', text: '20분' }, svg);
    el('text', { class: 'ea-su-ax', x: G.x + 30, y: G.y + 16, text: '°C · 조리 용기 물(모형)' }, svg);
    const curve = el('path', { class: 'ea-su-curve' }, svg);
    // 반응 용기
    el('rect', { class: 'ea-su-cont', x: C.x, y: C.y, width: C.w, height: C.h, rx: 8 }, svg);
    const water = el('rect', { class: 'ea-su-water', x: C.x + 4, width: C.w - 8, rx: 4 }, svg);
    const pG = el('g', {}, svg);
    const pot = el('g', { class: 'ea-su-pot' }, svg);
    el('rect', { x: C.x + 20, y: C.y - 60, width: C.w - 40, height: 110, rx: 8 }, pot);
    el('rect', { class: 'ea-su-potw', x: C.x + 26, y: C.y - 30, width: C.w - 52, height: 76, rx: 4 }, pot);
    el('text', { x: C.x + C.w / 2, y: C.y - 36, text: '조리 용기 · 물 300 mL' }, pot);
    const steam = [...Array(5)].map((_, i) => ({ c: el('ellipse', { class: 'ea-su-steam', rx: 14, ry: 9 }, svg), k: i / 5, x: C.x + 30 + i * 60 }));
    const splash = el('g', { class: 'ea-su-splash' }, svg);
    for (let i = 0; i < 8; i++) el('circle', { cx: C.x + 40 + i * 30, cy: C.y - 20 - (i % 3) * 20, r: 6 }, splash);
    // 주머니 더미
    const stack = [];
    for (let i = 0; i < 5; i++) {
      const g = el('g', { class: 'ea-su-pouch', tabindex: 0, role: 'button', 'aria-label': `산화 칼슘 주머니 ${i + 1}(끌어서 반응 용기에 넣기, Enter로도 넣고 뺀다)` }, svg);
      el('rect', { x: -40, y: -16, width: 80, height: 32, rx: 10 }, g);
      el('text', { x: 0, y: 6, text: 'CaO 10 g' }, g);
      const home = { x: 70 + (i % 2) * 20, y: 590 - i * 36 };
      const p = { g, home, x: home.x, y: home.y, inC: false };
      stack.push(p);
      window.EA.drag(g, svg, {
        start() { return !running; },
        move(q) { p.x = q.x; p.y = q.y; place(p); },
        end(q) { const into = q.x > C.x && q.x < C.x + C.w && q.y > C.y - 80 && q.y < C.y + C.h; setIn(p, into); },
      });
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); if (!running) setIn(p, !p.inC); } });
    }
    // 비커
    const beaker = el('g', { class: 'ea-su-beaker', tabindex: 0, role: 'slider', 'aria-label': '물 비커(윗부분을 잡고 왼쪽으로 돌려 기울이기, 위 화살표 키로도 기울인다)' }, svg);
    const bWater = el('rect', { class: 'ea-su-bw', x: 4, width: 92, rx: 3 }, beaker);
    el('path', { class: 'ea-su-bg', d: 'M0 -150 V 0 H 100 V -150' }, beaker);
    [0.25, 0.5, 0.75].forEach((f) => el('line', { class: 'ea-su-tick', x1: 70, x2: 96, y1: -150 * f, y2: -150 * f }, beaker));
    el('text', { class: 'ea-su-bt', x: 50, y: -60, text: '물' }, beaker);
    el('rect', { class: 'ea-su-bhit', x: -20, y: -190, width: 140, height: 200 }, beaker);
    const stream = el('path', { class: 'ea-su-stream' }, svg);
    const th = window.EA.thermo(svg, { x: 1000, y: 600, h: 230, lo: 0, hi: 100, w: 16, cls: 'ea-su-th', left: true });

    let ang = 0, held = false, lastA = 0, vol = 200, poured = 0, running = false, runT = 0, res = null, t = 0, splashT = 0;
    function place(p) { p.g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`); }
    function count() { return stack.filter((p) => p.inC).length; }
    function setIn(p, into) {
      if (into && poured > 5) { msg.textContent = '물을 부은 뒤에는 주머니를 넣지 않는다 — 처음부터 다시 하자.'; into = false; }
      p.inC = into;
      if (into) { const k = stack.filter((s) => s.inC).indexOf(p); p.x = C.x + 50 + k * 50; p.y = C.y + C.h - 24 - (k % 2) * 8; } else { p.x = p.home.x; p.y = p.home.y; }
      place(p); update();
    }
    window.EA.drag(beaker, svg, {
      start(q) { if (running) return false; held = true; lastA = Math.atan2(q.y - PIV.y, q.x - PIV.x); return true; },
      move(q) { const a = Math.atan2(q.y - PIV.y, q.x - PIV.x); let d = a - lastA; if (d > Math.PI) d -= 2 * Math.PI; if (d < -Math.PI) d += 2 * Math.PI; lastA = a; ang = clamp(ang - d * 180 / Math.PI, 0, 120); },
      end() { held = false; },
    });
    beaker.addEventListener('keydown', (e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); e.stopPropagation(); ang = clamp(ang + 15, 0, 120); held = true; setTimeout(() => { held = false; }, 900); } });
    stackBtn.addEventListener('click', () => {
      if (!count()) { msg.textContent = '먼저 주머니를 넣자.'; return; }
      if (poured < 40) { msg.textContent = '물을 더 붓자(교과서 양 120 mL).'; return; }
      res = window.LimeModel.run({ n: count(), water: poured, food: 300 }); running = true; runT = 0;
    });
    resetBtn.addEventListener('click', reset);
    function reset() { running = false; res = null; vol = 200; poured = 0; ang = 0; stack.forEach((p) => setIn(p, false)); curve.setAttribute('d', ''); update(); }
    function update() {
      const n = count();
      R.n.textContent = `${n}개`; R.w.textContent = `${Math.round(poured)} mL`;
      water.setAttribute('y', (C.y + C.h - 4 - poured / 200 * 110).toFixed(1)); water.setAttribute('height', (poured / 200 * 110).toFixed(1));
      pot.style.opacity = running || res ? '1' : '0';
      sensor.setAttribute('y2', running || res ? '420' : '300');
      now.textContent = !n ? '① 산화 칼슘 주머니를 반응 용기에 끌어 넣자(1~5개)' : poured < 100 ? '② 비커 윗부분을 잡고 왼쪽으로 돌려 천천히 붓자' : !res ? '③ «조리 용기 겹쳐 놓고 재기»를 누르자' : '④ 그래프에서 가장 높은 온도와 머문 시간을 읽자';
      now.classList.toggle('done', !!res && !running);
    }
    function step(dt) {
      t += dt;
      if (!held) ang += (0 - ang) * Math.min(1, dt * 3);
      const start = 90 - vol / 200 * 60, over = ang - start;
      let rate = 0;
      if (over > 0 && vol > 0 && !running) { rate = Math.min(vol, over * 1.6 * dt); vol -= rate; poured += rate; }
      if (over > 35 && rate > 0) { splashT = 0.8; msg.textContent = '너무 빨리 부었다! 김과 물이 튄다 — 천천히 붓자.'; }
      splashT = Math.max(0, splashT - dt);
      splash.style.opacity = String(splashT);
      beaker.setAttribute('transform', `translate(${PIV.x} ${PIV.y}) rotate(${(-ang).toFixed(1)})`);
      const lh = vol / 200 * 140; bWater.setAttribute('y', (-lh - 4).toFixed(1)); bWater.setAttribute('height', lh.toFixed(1));
      const a = -ang * Math.PI / 180, lip = { x: PIV.x + 150 * Math.sin(a), y: PIV.y - 150 * Math.cos(a) };
      stream.setAttribute('d', rate > 0 ? `M${lip.x.toFixed(1)} ${lip.y.toFixed(1)} Q ${(lip.x - 20).toFixed(1)} ${(lip.y + 40).toFixed(1)} ${(lip.x - 30).toFixed(1)} ${(C.y + C.h - poured / 200 * 110).toFixed(1)}` : '');
      stream.style.strokeWidth = String(4 + Math.min(14, over * 0.4));
      if (rate > 0 && splashT === 0) msg.textContent = poured > 125 ? `교과서 양(120 mL)보다 많이 부었다 — ${Math.round(poured)} mL.` : `붓는 중 · ${Math.round(poured)} mL`;
      let T = 20, steamK = 0;
      if (res) {
        if (running) { runT = Math.min(1, runT + dt / 12); if (runT >= 1) { running = false; msg.textContent = `최고 ${Math.round(res.peak)} °C, 최고 온도 근처에서 약 ${res.hold.toFixed(0)}분 머물렀다(모형). 주머니 수를 바꿔 다시 해 보자.`; } }
        const m = Math.max(1, Math.round(runT * (res.t.length - 1)));
        T = res.tf[m]; steamK = Math.min(1, (res.steam[m] || 0) * 3 + (res.tr[m] > 85 ? 0.4 : 0));
        curve.setAttribute('d', res.tf.slice(0, m + 1).map((v, i) => `${i ? 'L' : 'M'}${(G.x + i / (res.t.length - 1) * G.w).toFixed(1)} ${(G.y + G.h - (v - 20) / 80 * G.h).toFixed(1)}`).join(' '));
        if (running) msg.textContent = `${Math.round(res.t[m])}분 · 조리 용기 물 ${Math.round(T)} °C`;
      }
      steam.forEach((s, i) => { s.k = (s.k + dt * 0.5) % 1; s.c.setAttribute('cx', (s.x + Math.sin(t + i) * 8).toFixed(1)); s.c.setAttribute('cy', (C.y - 70 - s.k * 90).toFixed(1)); s.c.style.opacity = String((res ? 0.3 + steamK : 0) * (1 - s.k)); });
      th.set(T); R.t.textContent = `${Math.round(T)} °C`;
      update();
    }
    stack.forEach(place);
    const loop = window.Stage.loop(step);
    step(0.016);
    root._su = {
      pouches(n) { stack.forEach((p, i) => setIn(p, i < n)); },
      pour(ml) { poured = ml; vol = 200 - ml; update(); },
      stack() { stackBtn.click(); },
    };
    return { setActive(on) { if (on) loop.start(); else loop.stop(); } };
  }
  window.LimeSetup = { mount };
})();
