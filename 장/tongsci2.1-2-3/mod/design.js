/* 3차시 탐구 과정 6: 설계대. 주머니 상자를 누르면 하나씩 들어가고(1~5), 용기 속 주머니를 누르면 빠진다.
   반응 용기 물(60~200 mL)·조리 용기 음식 양(150~300 mL)은 옆 손잡이를 위아래로 끈다. 뚜껑·수건은 눌러 씌우고 벗긴다.
   «조리 시작» → LimeModel로 20분을 8초에 돌려 그래프·익은 정도·김 위험을 보이고, 시도마다 기록 줄을 쌓는다.
   «주머니 바꾸기»로 질산 암모늄 주머니를 쓰면 온도가 내려간다(흡수). 익는 조건과 김 위험은 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const { el, clamp, lerp } = window.EA;
  const RC = { x: 260, y: 360, w: 360, h: 170 };   // 반응 용기
  const CV = { x: 300, y: 214, w: 280, h: 140 };   // 조리 용기
  const GX = { x0: 50, x1: 545, y0: 190, y1: 20 };  // 그래프(20~100 °C)
  const FOODC = { milk: '#fbfaf5', soup: '#f1dfae', egg: '#f5cf3a', ramen: '#c9874a' };
  function mount(root) {
    const svg = root.querySelector('.ea-de-svg'), gsvg = root.querySelector('.ea-de-graph');
    const now = root.querySelector('.de-now'), msg = root.querySelector('.de-msg'), need = root.querySelector('.ea-de-need');
    const foods = [...root.querySelectorAll('.ea-de-food button')], goBtn = root.querySelector('#de-go'), kindBtn = root.querySelector('#de-kind');
    const cookBar = root.querySelector('.de-cook'), riskBar = root.querySelector('.de-risk'), log = root.querySelector('.ea-de-log tbody');
    el('rect', { class: 'ea-de-bg', x: 0, y: 0, width: 1060, height: 560 }, svg);
    el('rect', { class: 'ea-de-bench', x: 0, y: 530, width: 1060, height: 30 }, svg);
    // 주머니 상자
    const box = el('g', { class: 'ea-de-box', tabindex: 0, role: 'button', 'aria-label': '주머니 상자(누르면 반응 용기에 하나 넣는다)' }, svg);
    el('rect', { x: 30, y: 380, width: 170, height: 150, rx: 10 }, box);
    const boxT = el('text', { x: 115, y: 450, text: '산화 칼슘' }, box);
    el('text', { class: 'sm', x: 115, y: 476, text: '주머니 10 g' }, box);
    el('text', { class: 'sm', x: 115, y: 506, text: '누르면 넣기' }, box);
    // 반응 용기·수건
    const towel = el('rect', { class: 'ea-de-towel', x: RC.x - 18, y: RC.y - 4, width: RC.w + 36, height: RC.h + 8, rx: 16 }, svg);
    el('rect', { class: 'ea-de-rc', x: RC.x, y: RC.y, width: RC.w, height: RC.h, rx: 8 }, svg);
    const water = el('rect', { class: 'ea-de-water', x: RC.x + 4, width: RC.w - 8, rx: 4 }, svg);
    const pouchG = el('g', {}, svg);
    // 조리 용기·음식·뚜껑
    el('rect', { class: 'ea-de-cv', x: CV.x, y: CV.y, width: CV.w, height: CV.h, rx: 8 }, svg);
    const food = el('rect', { class: 'ea-de-food', x: CV.x + 6, width: CV.w - 12, rx: 4 }, svg);
    const lid = el('g', { class: 'ea-de-lid', tabindex: 0, role: 'button', 'aria-label': '뚜껑(누르면 씌우거나 벗긴다)' }, svg);
    el('rect', { x: -150, y: -12, width: 300, height: 20, rx: 8 }, lid); el('rect', { x: -24, y: -26, width: 48, height: 16, rx: 6 }, lid);
    const towelBtn = el('g', { class: 'ea-de-tbtn', tabindex: 0, role: 'button', 'aria-label': '수건(누르면 반응 용기를 감싸거나 푼다)' }, svg);
    el('rect', { x: 780, y: 380, width: 220, height: 70, rx: 12 }, towelBtn); el('text', { x: 890, y: 424, text: '수건으로 감싸기' }, towelBtn);
    const lidLab = el('text', { class: 'ea-de-lab', x: 890, y: 280, text: '뚜껑' }, svg);
    // 손잡이(물·음식 양)
    const hW = el('g', { class: 'ea-de-handle', tabindex: 0, role: 'slider', 'aria-label': '반응 용기 물의 양(위아래로 끌기)' }, svg);
    el('circle', { r: 20 }, hW); const hWt = el('text', { x: 30, y: 7 }, hW);
    const hF = el('g', { class: 'ea-de-handle f', tabindex: 0, role: 'slider', 'aria-label': '조리 용기 음식의 양(위아래로 끌기)' }, svg);
    el('circle', { r: 20 }, hF); const hFt = el('text', { x: 30, y: 7 }, hF);
    const steam = [...Array(6)].map((_, i) => ({ c: el('ellipse', { class: 'ea-de-steam', rx: 14, ry: 8 }, svg), k: i / 6 }));
    const th = window.EA.thermo(svg, { x: 700, y: 330, h: 150, lo: 0, hi: 100, w: 14, cls: 'ea-de-th' });
    // 그래프
    for (let T = 20; T <= 100; T += 20) { const y = lerp(GX.y0, GX.y1, (T - 20) / 80); el('line', { class: 'ea-de-grid', x1: GX.x0, x2: GX.x1, y1: y, y2: y }, gsvg); el('text', { class: 'ea-de-ax', x: GX.x0 - 8, y: y + 5, text: String(T) }, gsvg); }
    el('text', { class: 'ea-de-ax', x: GX.x1, y: 212, text: '20분' }, gsvg);
    el('text', { class: 'ea-de-ax', x: GX.x0 - 8, y: 212, text: '0' }, gsvg);
    const needLine = el('line', { class: 'ea-de-needl', x1: GX.x0, x2: GX.x1 }, gsvg);
    const ghost = el('g', {}, gsvg);
    const curve = el('path', { class: 'ea-de-curve' }, gsvg);

    const S = { n: 2, water: 120, amount: 300, lid: false, wrap: false, cold: false, food: 'egg' };
    let res = null, runT = 0, running = false, trial = 0, t = 0;
    const gy = (T) => lerp(GX.y0, GX.y1, clamp((T - 20) / 80, -0.25, 1));
    function drawPouches() {
      pouchG.replaceChildren();
      for (let i = 0; i < S.n; i++) {
        const g = el('g', { class: 'ea-de-pouch' + (S.cold ? ' cold' : ''), transform: `translate(${RC.x + 50 + i * 64} ${RC.y + RC.h - 26})` }, pouchG);
        el('rect', { x: -28, y: -14, width: 56, height: 28, rx: 9 }, g);
        g.addEventListener('click', (e) => { e.stopPropagation(); if (!running && S.n > 1) { S.n--; draw(); } });
      }
    }
    function draw() {
      drawPouches();
      const wh = (S.water - 20) / 200 * (RC.h - 10);
      water.setAttribute('y', (RC.y + RC.h - 4 - wh).toFixed(1)); water.setAttribute('height', wh.toFixed(1));
      const fh = S.amount / 300 * (CV.h - 30);
      food.setAttribute('y', (CV.y + CV.h - 6 - fh).toFixed(1)); food.setAttribute('height', fh.toFixed(1));
      food.style.fill = FOODC[S.food];
      hW.setAttribute('transform', `translate(${RC.x + RC.w + 34} ${(RC.y + RC.h - 4 - wh).toFixed(1)})`); hWt.textContent = `물 ${Math.round(S.water)} mL`;
      hF.setAttribute('transform', `translate(${CV.x - 34} ${(CV.y + CV.h - 6 - fh).toFixed(1)})`); hFt.textContent = `${Math.round(S.amount)} mL`;
      hFt.setAttribute('x', '-30'); hFt.setAttribute('text-anchor', 'end');
      lid.setAttribute('transform', S.lid ? `translate(${CV.x + CV.w / 2} ${CV.y - 8})` : 'translate(890 310)');
      lidLab.style.opacity = S.lid ? '0' : '1';
      towel.style.opacity = S.wrap ? '1' : '0';
      towelBtn.classList.toggle('on', S.wrap);
      boxT.textContent = S.cold ? '질산 암모늄' : '산화 칼슘';
      box.classList.toggle('cold', S.cold);
      kindBtn.textContent = '주머니 바꾸기: ' + (S.cold ? '질산 암모늄' : '산화 칼슘');
      const f = window.LimeModel.FOODS[S.food];
      need.innerHTML = `<b>${f.name}</b>이 익으려면: 조리 용기가 <b>${f.need} °C 넘게 ${f.min}분</b> (예)`;
      needLine.setAttribute('y1', gy(f.need)); needLine.setAttribute('y2', gy(f.need));
      foods.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === S.food)));
    }
    const tap = (g, fn) => { g.addEventListener('click', (e) => { e.stopPropagation(); if (!running) { fn(); draw(); } }); g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); if (!running) { fn(); draw(); } } }); };
    tap(box, () => { S.n = Math.min(5, S.n + 1); });
    tap(lid, () => { S.lid = !S.lid; });
    tap(towelBtn, () => { S.wrap = !S.wrap; });
    const level = (g, key, lo, hi, top, bot) => {
      window.EA.drag(g, svg, { start() { return !running; }, move(q) { S[key] = Math.round(lerp(lo, hi, clamp((bot - q.y) / (bot - top), 0, 1)) / 10) * 10; draw(); } });
      g.addEventListener('keydown', (e) => { if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); S[key] = clamp(S[key] + (e.key === 'ArrowUp' ? 10 : -10), lo, hi); draw(); } });
    };
    level(hW, 'water', 60, 200, RC.y + 4 + (RC.h - 10) * (1 - 180 / 200) , RC.y + RC.h - 4 - (40 / 200) * (RC.h - 10));
    level(hF, 'amount', 150, 300, CV.y + 30, CV.y + CV.h - 6 - (CV.h - 30) / 2);
    foods.forEach((b) => b.addEventListener('click', () => { if (!running) { S.food = b.dataset.k; draw(); } }));
    kindBtn.addEventListener('click', () => { if (!running) { S.cold = !S.cold; draw(); } });
    goBtn.addEventListener('click', () => {
      if (running) return;
      if (res) { const old = el('path', { class: 'ea-de-old', d: curve.getAttribute('d') }, ghost); void old; }
      res = window.LimeModel.run({ n: S.n, water: S.water, food: S.amount, lid: S.lid, wrap: S.wrap, cold: S.cold });
      running = true; runT = 0; trial++;
      now.textContent = '조리 중… 20분을 빨리 보기';
    });
    function finish() {
      running = false;
      const f = window.LimeModel.FOODS[S.food], got = window.LimeModel.above(res, f.need), cooked = got >= f.min;
      const risk = res.risk, rl = risk < 0.34 ? '낮음' : risk < 0.67 ? '주의' : '높음';
      const tr = document.createElement('tr');
      tr.className = cooked ? (risk < 0.67 ? 'good' : 'warn') : 'bad';
      tr.innerHTML = `<td>${trial}</td><td>${S.cold ? '질산 암모늄' : '산화 칼슘'} ${S.n}개</td><td>${S.water} mL</td><td>${f.name} ${S.amount} mL</td><td>${[S.lid ? '뚜껑' : '', S.wrap ? '수건' : ''].filter(Boolean).join('·') || '없음'}</td><td>${Math.round(res.peak)} °C</td><td>${cooked ? '익음' : '덜 익음'}</td><td>${rl}</td>`;
      log.prepend(tr);
      while (log.children.length > 5) log.lastChild.remove();
      msg.textContent = S.cold ? '질산 암모늄은 물에 녹으며 열을 흡수해 오히려 차가워졌다 — 조리에는 방출하는 반응을 써야 한다.'
        : !cooked ? `${f.need} °C 넘은 시간이 ${got.toFixed(1)}분뿐이다. 주머니를 늘리거나, 뚜껑·수건으로 열이 덜 새게 하거나, 양을 줄여 보자.`
          : risk >= 0.67 ? '익었지만 김이 튈 위험이 높다. 주머니를 줄이고 대신 뚜껑·수건으로 보완해 보자(안전성).'
            : '익었고 위험도 낮다! 논리성·적절성·안전성으로 내 설계를 평가해 보자.';
      now.textContent = cooked && risk < 0.67 && !S.cold ? '성공한 설계를 발표해 보자' : '장치를 고쳐 다시 «조리 시작»';
      now.classList.toggle('done', cooked && risk < 0.67 && !S.cold);
    }
    function step(dt) {
      t += dt;
      let T = 20, steamK = 0;
      if (res) {
        if (running) { runT = Math.min(1, runT + dt / 8); if (runT >= 1) finish(); }
        const m = Math.max(1, Math.round(runT * (res.t.length - 1)));
        T = res.tf[m]; steamK = clamp((res.steam[m] || 0) * 3 + (res.tr[m] > 85 ? 0.3 : 0) + (S.lid ? 0 : T / 300), 0, 1);
        curve.setAttribute('d', res.tf.slice(0, m + 1).map((v, i) => `${i ? 'L' : 'M'}${lerp(GX.x0, GX.x1, i / (res.t.length - 1)).toFixed(1)} ${gy(v).toFixed(1)}`).join(' '));
        const f = window.LimeModel.FOODS[S.food], got = res.tf.slice(0, m + 1).filter((v) => v >= f.need).length * 10 / 60;
        cookBar.style.width = (clamp(got / f.min, 0, 1) * 100).toFixed(0) + '%';
        riskBar.style.width = (res.risk * runT * 100).toFixed(0) + '%';
      }
      steam.forEach((s, i) => { s.k = (s.k + dt * 0.5) % 1; s.c.setAttribute('cx', (CV.x + 40 + i * 44 + Math.sin(t + i) * 8).toFixed(1)); s.c.setAttribute('cy', (CV.y - 30 - s.k * 110).toFixed(1)); s.c.style.opacity = String(steamK * (1 - s.k)); });
      th.set(T);
    }
    draw();
    const loop = window.Stage.loop(step);
    step(0.016);
    root._de = { set(o) { Object.assign(S, o); draw(); }, go() { goBtn.click(); } };
    return { setActive(on) { if (on) loop.start(); else loop.stop(); } };
  }
  window.LimeDesign = { mount };
})();
