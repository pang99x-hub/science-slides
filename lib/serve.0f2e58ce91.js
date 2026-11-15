/* 인공지능 로봇(교과서 145쪽): 식당 평면도의 서빙 로봇. 식탁을 누르면 주방에서 음식을 싣고 그 식탁으로 가고, 도착하면 돌아온다.
   그림 밑 부품함의 사람·의자·쏟아진 물을 바닥에 놓으면, 로봇이 다가가 센서로 찾고(센서) 무엇인지 알아본 뒤(판단) 다르게 움직인다(행동).
   사람 → 멈추고 기다린다(사람이 비켜 준다) · 의자 → 다른 길로 돌아간다 · 물 → 피해 가며 직원에게 알린다 · 길이 모두 막히면 멈추고 알린다.
   길 찾기는 칸(36px) 위 A* — 대각선은 양옆이 비어 있을 때만. 놓은 것은 눌러서 치운다. 거리·시간은 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const C = 40, COLS = 25, ROWS = 15, X0 = 28, Y0 = 62;
  const cx = (c) => X0 + (c + 0.5) * C, cy = (r) => Y0 + (r + 0.5) * C;
  const HOME = [2, 7];
  const TABLES = [[7, 2, 'top'], [13, 2, 'top'], [19, 2, 'top'], [7, 11, 'bot'], [13, 11, 'bot'], [19, 11, 'bot']];   // 왼쪽 위 칸, 3×2
  const SAY = {
    person: { sense: '앞 1 m쯤에 움직이는 물체가 있다', judge: '카메라로 보니 사람 → 곧 비켜 줄 것이다', act: '멈추고 기다린다', msg: '사람은 스스로 움직이니 잠깐 기다렸다가 간다' },
    chair: { sense: '앞 1 m쯤에 멈춰 있는 물체가 있다', judge: '의자 → 스스로 비키지 않는다', act: '다른 길을 찾아 돌아간다', msg: '의자는 비키지 않으니 비어 있는 다른 길을 스스로 찾았다' },
    spill: { sense: '앞 바닥이 번들거린다', judge: '쏟아진 물 → 바퀴가 미끄러질 수 있다', act: '피해 가고, 직원에게 닦아 달라고 알린다', msg: '물은 피해 가고, 직원에게 알렸다 — 곧 닦는다' },
    stuck: { act: '갈 길이 없다 → 멈추고 직원에게 알린다', msg: '갈 수 있는 길이 모두 막혔다 — 멈추고 알린다. 놓은 것을 하나 눌러 치워 보자' },
  };
  const SIZE = { person: [1, 1], chair: [1, 1], spill: [2, 1] };
  const jong = (w) => (w.charCodeAt(w.length - 1) - 0xac00) % 28 > 0, ga = (w) => w + (jong(w) ? '이' : '가'), eun = (w) => w + (jong(w) ? '은' : '는'), eul = (w) => w + (jong(w) ? '을' : '를');

  function mount(root) {
    const svg = root.querySelector('.sv-svg'), now = root.querySelector('.sv-now'), msg = root.querySelector('.sv-msg');
    const steps = Object.fromEntries([...root.querySelectorAll('.sv-step')].map((e) => [e.dataset.k, e]));
    const DEF = Object.fromEntries(Object.entries(steps).map(([k, e]) => [k, e.querySelector('p').textContent]));
    const cards = [...root.querySelectorAll('.sv-card')];
    // 칸: 0 빈 바닥, 1 벽·조리대·식탁
    const wall = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    const block = (c0, r0, w, h) => { for (let r = r0; r < r0 + h; r++) for (let c = c0; c < c0 + w; c++) if (wall[r] && c < COLS) wall[r][c] = 1; };
    block(4, 0, 1, 5); block(4, 10, 1, 5); block(0, 0, 2, 4); block(0, 11, 2, 4);
    TABLES.forEach(([c, r, s]) => block(c, s === 'top' ? r - 1 : r - 1, 3, 4));
    // 그림
    el('rect', { class: 'sv-bg', x: -400, y: -300, width: 1856, height: 1200 }, svg);
    el('rect', { class: 'sv-floor', x: X0, y: Y0, width: COLS * C, height: ROWS * C }, svg);
    const tiles = el('g', { class: 'sv-tiles' }, svg);
    for (let c = 0; c <= COLS; c++) el('line', { x1: X0 + c * C, y1: Y0, x2: X0 + c * C, y2: Y0 + ROWS * C }, tiles);
    for (let r = 0; r <= ROWS; r++) el('line', { x1: X0, y1: Y0 + r * C, x2: X0 + COLS * C, y2: Y0 + r * C }, tiles);
    el('rect', { class: 'sv-kitchen', x: X0, y: Y0, width: 4 * C, height: ROWS * C }, svg);
    el('text', { class: 'sv-kt', x: X0 + 2 * C, y: Y0 + 10.1 * C }, svg).textContent = '주방';
    [[4, 0, 1, 5], [4, 10, 1, 5]].forEach(([c, r, w, h]) => el('rect', { class: 'sv-counter', x: X0 + c * C, y: Y0 + r * C, width: w * C, height: h * C }, svg));
    [[0, 0, 2, 4], [0, 11, 2, 4]].forEach(([c, r, w, h]) => { const g = el('g', { class: 'sv-stove' }, svg); el('rect', { x: X0 + c * C + 4, y: Y0 + r * C + 4, width: w * C - 8, height: h * C - 8, rx: 6 }, g); el('circle', { cx: X0 + (c + 1) * C, cy: Y0 + (r + 1.2) * C, r: 14 }, g); el('circle', { cx: X0 + (c + 1) * C, cy: Y0 + (r + 2.8) * C, r: 14 }, g); });
    el('rect', { class: 'sv-wall', x: X0, y: Y0, width: COLS * C, height: ROWS * C }, svg);
    const tables = TABLES.map(([c, r, s], i) => {
      const g = el('g', { class: 'sv-table', tabindex: '0', role: 'button', 'aria-label': `식탁 ${i + 1}로 음식 보내기` }, svg);
      el('rect', { class: 'sv-hit', x: X0 + c * C - 6, y: Y0 + (r - 1) * C - 6, width: 3 * C + 12, height: 4 * C + 12, rx: 12 }, g);
      [0, 2].forEach((k) => { el('rect', { class: 'sv-chair', x: X0 + (c + k) * C + 6, y: Y0 + (r - 1) * C + 8, width: C - 12, height: C - 14, rx: 6 }, g); el('rect', { class: 'sv-chair', x: X0 + (c + k) * C + 6, y: Y0 + (r + 2) * C + 6, width: C - 12, height: C - 14, rx: 6 }, g); });
      el('rect', { class: 'sv-top', x: X0 + c * C + 3, y: Y0 + r * C + 3, width: 3 * C - 6, height: 2 * C - 6, rx: 8 }, g);
      el('text', { class: 'sv-tn', x: X0 + (c + 1.5) * C, y: Y0 + (r + 1) * C + 8 }, g).textContent = `${i + 1}`;
      const plate = el('circle', { class: 'sv-plate', cx: X0 + (c + 2.45) * C, cy: Y0 + (r + 1) * C, r: 12 }, g);
      return { g, c: c + 1, r: s === 'top' ? r + 3 : r - 2, plate, n: i + 1 };
    });
    const pathG = el('path', { class: 'sv-path' }, svg);
    const obsG = el('g', { class: 'sv-obs' }, svg);
    const bot = el('g', { class: 'sv-bot' }, svg);
    const cone = el('path', { class: 'sv-cone', d: 'M0 0 L 113 -65 A 130 130 0 0 1 113 65 Z' }, bot);
    el('circle', { class: 'sv-bbody', r: 20 }, bot); el('circle', { class: 'sv-bdish', r: 9 }, bot); el('rect', { class: 'sv-beye', x: 11, y: -8, width: 7, height: 16, rx: 3 }, bot);
    const bub = el('g', { class: 'sv-bub' }, svg); el('rect', { x: -86, y: -56, width: 172, height: 34, rx: 10 }, bub); const bubT = el('text', { y: -33 }, bub);
    const call = el('g', { class: 'sv-call' }, svg); el('rect', { x: 828, y: 10, width: 200, height: 44, rx: 10 }, call); el('text', { x: 928, y: 40 }, call).textContent = '직원 호출 중!';
    // 상태
    const obs = [];
    const rob = { x: cx(HOME[0]), y: cy(HOME[1]), a: 0 };
    let path = [], k = 0, mode = 'home', goal = null, wait = 0, hit = null, stage1 = 0, sent = false, reacted = false, active = false, raf = 0, last = 0;
    const occ = () => { const g = wall.map((row) => row.slice()); obs.filter((o) => o.known).forEach((o) => o.cells.forEach(([c, r]) => { g[r][c] = 1; })); return g; };
    function astar(from, to, g) {
      const key = (c, r) => r * COLS + c, open = [[0, from[0], from[1]]], came = new Map(), cost = new Map([[key(...from), 0]]);
      const H = (c, r) => Math.hypot(c - to[0], r - to[1]);
      while (open.length) {
        open.sort((a, b) => a[0] - b[0]); const [, c, r] = open.shift();
        if (c === to[0] && r === to[1]) { const out = [[c, r]]; let q = key(c, r); while (came.has(q)) { q = came.get(q); out.unshift([q % COLS, Math.floor(q / COLS)]); } return out; }
        for (let dc = -1; dc <= 1; dc++) for (let dr = -1; dr <= 1; dr++) {
          if (!dc && !dr) continue; const nc = c + dc, nr = r + dr;
          if (nc < 0 || nr < 0 || nc >= COLS || nr >= ROWS || g[nr][nc]) continue;
          if (dc && dr && (g[r][nc] || g[nr][c])) continue;
          const nk = key(nc, nr), nv = cost.get(key(c, r)) + (dc && dr ? 1.414 : 1);
          if (nv < (cost.get(nk) ?? Infinity)) { cost.set(nk, nv); came.set(nk, key(c, r)); open.push([nv + H(nc, nr), nc, nr]); }
        }
      }
      return null;
    }
    const cellOf = (x, y) => [Math.max(0, Math.min(COLS - 1, Math.floor((x - X0) / C))), Math.max(0, Math.min(ROWS - 1, Math.floor((y - Y0) / C)))];
    function plan() {
      const from = cellOf(rob.x, rob.y), g = occ(); g[from[1]][from[0]] = 0;
      const p = astar(from, goal, g);
      if (!p) return false;
      path = p.map(([c, r]) => [cx(c), cy(r)]); path[0] = [rob.x, rob.y]; k = 1; draw(); return true;
    }
    function draw() { pathG.setAttribute('d', path.length > k ? 'M' + [[rob.x, rob.y], ...path.slice(k)].map((q) => q.map((v) => v.toFixed(1)).join(' ')).join(' L ') : ''); }
    function light(on, t) {
      Object.entries(steps).forEach(([kk, e]) => { const i = ['sense', 'judge', 'act'].indexOf(kk); e.classList.toggle('on', on > i); e.classList.toggle('cur', on === i + 1); e.querySelector('p').textContent = t && t[kk] ? t[kk] : DEF[kk]; });
    }
    let bubLeft = 0;
    const say = (t) => { bubT.textContent = t; bub.classList.toggle('on', !!t); bubLeft = t ? 1.8 : 0; };
    function send(t) {
      if (['sense', 'judge', 'wait', 'aside'].includes(mode)) { msg.textContent = '로봇이 판단하는 중 — 잠깐 뒤에 눌러요'; return; }
      goal = [t.c, t.r]; tables.forEach((x) => x.g.classList.toggle('picked', x === t)); goal.t = t;
      if (!plan()) { mode = 'stuck'; light(3, SAY.stuck); msg.textContent = SAY.stuck.msg; call.classList.add('on'); return; }
      mode = 'go'; t.plate.classList.remove('on'); bot.classList.add('full');
      light(0); msg.textContent = `식탁 ${t.n}로 간다 — 길 위에 무엇을 놓아 볼까?`;
      if (!sent) { sent = true; now.textContent = '② 로봇 앞길에 사람·의자·물을 끌어 놓아 보자'; }
      say('');
    }
    // 놓기
    function place(kind, x, y) {
      const [c, r] = cellOf(x, y), [w, h] = SIZE[kind];
      const cells = []; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) cells.push([Math.min(COLS - 1, c + i), r + j]);
      const free = cells.every(([a, b]) => b < ROWS && !wall[b][a] && !obs.some((o) => o.cells.some(([p, q]) => p === a && q === b)));
      const [rc, rr] = cellOf(rob.x, rob.y), near = cells.some(([a, b]) => Math.abs(a - rc) <= 1 && Math.abs(b - rr) <= 1);
      if (x < X0 || y < Y0 || x > X0 + COLS * C || y > Y0 + ROWS * C || !free) { msg.textContent = '식탁·조리대가 아닌 빈 바닥(통로)에 놓아 보자'; return false; }
      if (near) { msg.textContent = '로봇 바로 옆이 아니라 조금 앞쪽 길 위에 놓아 보자'; return false; }
      if (obs.length >= 8) { msg.textContent = '놓은 것을 눌러 하나 치운 뒤 놓아 보자'; return false; }
      const g = el('g', { class: `sv-o ${kind}`, tabindex: '0', role: 'button', 'aria-label': `${kind === 'person' ? '사람' : kind === 'chair' ? '의자' : '쏟아진 물'} 치우기` }, obsG);
      const o = { kind, cells, g, known: false };
      art(o); obs.push(o);
      g.addEventListener('click', (e) => { e.stopPropagation(); if (drag.picked) return; remove(o); });
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); remove(o); } });
      if (window.gsap && !window.Deck.reduce) gsap.fromTo(g, { opacity: 0 }, { opacity: 1, duration: 0.3, clearProps: 'opacity' });
      if (mode === 'home') msg.textContent = '놓았다 — 식탁을 눌러 로봇을 보내 보자';
      return true;
    }
    function art(o) {
      o.g.innerHTML = '';
      const [c, r] = o.cells[0], x = cx(c), y = cy(r);
      if (o.kind === 'person') { el('circle', { class: 'sv-ph', cx: x, cy: y, r: 18 }, o.g); el('circle', { class: 'sv-pf', cx: x, cy: y, r: 9 }, o.g); }
      else if (o.kind === 'chair') { el('rect', { class: 'sv-oc', x: x - 16, y: y - 15, width: 32, height: 32, rx: 5 }, o.g); el('rect', { class: 'sv-ocb', x: x - 16, y: y - 20, width: 32, height: 8, rx: 3 }, o.g); }
      else { el('path', { class: 'sv-sp', d: `M${x - 16} ${y} c 0 -18 24 -20 40 -11 c 18 -11 40 0 33 16 c 7 13 -20 20 -35 11 c -16 11 -40 4 -38 -16 z` }, o.g); el('circle', { class: 'sv-spd', cx: x + 4, cy: y - 2, r: 4 }, o.g); }
    }
    function remove(o) {
      const i = obs.indexOf(o); if (i < 0) return; obs.splice(i, 1); o.g.remove();
      if (mode === 'stuck' && goal) { if (plan()) { mode = goal.back ? 'back' : 'go'; call.classList.remove('on'); light(0); msg.textContent = '길이 열렸다 — 다시 간다'; } }
      else if (['go', 'back'].includes(mode)) plan();
    }
    // 걷기
    function upcoming(n) { const out = []; for (let i = Math.max(1, k); i < Math.min(path.length, k + n); i++) out.push(cellOf(path[i][0], path[i][1])); return out; }
    function tick(t) {
      raf = 0; if (!active) return;
      const dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t;
      step(dt); raf = requestAnimationFrame(tick);
    }
    function step(dt) {
      if (mode === 'go' || mode === 'back') {
        // 센서: 앞길 3칸 안에 처음 보는 것이 있으면 멈춰 살핀다
        const ahead = upcoming(4);
        const o = obs.find((x) => !x.known && x.cells.some(([a, b]) => ahead.some(([p, q]) => Math.abs(p - a) + Math.abs(q - b) === 0)));
        if (o) { hit = o; o.known = true; mode = 'sense'; stage1 = 0.8; light(1, SAY[o.kind]); o.g.classList.add('seen'); bot.classList.add('sensing'); say('어? 앞에 무엇이 있다'); return; }
        const [tx, ty] = path[k] || [rob.x, rob.y], dx = tx - rob.x, dy = ty - rob.y, d = Math.hypot(dx, dy), v = 150 * dt;
        if (d > 0.5) rob.a += Math.atan2(Math.sin(Math.atan2(dy, dx) - rob.a), Math.cos(Math.atan2(dy, dx) - rob.a)) * Math.min(1, dt * 10);
        if (d <= v) { rob.x = tx; rob.y = ty; k++; if (k >= path.length) arrive(); }
        else { rob.x += dx / d * v; rob.y += dy / d * v; }
        draw();
      } else if (mode === 'sense') { stage1 -= dt; if (stage1 <= 0) { mode = 'judge'; stage1 = 0.9; light(2, SAY[hit.kind]); say(hit.kind === 'person' ? '사람이다!' : hit.kind === 'chair' ? '의자다' : '물이다 — 미끄럽다'); } }
      else if (mode === 'judge') { stage1 -= dt; if (stage1 <= 0) react(); }
      else if (mode === 'wait') { wait -= dt; if (wait <= 0) stepAside(); }
      else if (mode === 'deliver') { wait -= dt; if (wait <= 0) { goal = HOME.slice(); goal.back = true; mode = plan() ? 'back' : 'stuck'; if (mode === 'stuck') { light(3, SAY.stuck); msg.textContent = SAY.stuck.msg; call.classList.add('on'); } else msg.textContent = '주방으로 돌아간다'; } }
      else if (mode === 'stuck') { wait -= dt; if (wait <= 0) { wait = 0.6; if (plan()) { mode = goal.back ? 'back' : 'go'; call.classList.remove('on'); light(0); } } }
      bot.setAttribute('transform', `translate(${rob.x.toFixed(1)} ${rob.y.toFixed(1)}) rotate(${(rob.a * 180 / Math.PI).toFixed(1)})`);
      bub.setAttribute('transform', `translate(${Math.max(110, Math.min(946, rob.x)).toFixed(1)} ${Math.max(Y0 + 60, rob.y).toFixed(1)})`);
      if (bubLeft > 0 && !['sense', 'judge', 'wait', 'stuck'].includes(mode)) { bubLeft -= dt; if (bubLeft <= 0) bub.classList.remove('on'); }
    }
    function react() {
      const o = hit; bot.classList.remove('sensing'); light(3, SAY[o.kind]);
      reacted = true; now.textContent = '다른 것도 놓아 보자 · 길을 모두 막으면?';
      if (o.kind === 'person') { mode = 'wait'; wait = 1.8; say('잠시 기다릴게요'); msg.textContent = SAY.person.msg; return; }
      if (o.kind === 'spill') { call.classList.add('on'); setTimeout(() => { if (obs.includes(o)) { o.g.classList.add('wipe'); setTimeout(() => remove(o), 600); } call.classList.remove('on'); }, 5200); }
      if (plan()) { mode = goal.back ? 'back' : 'go'; say(o.kind === 'chair' ? '다른 길로 갈게요' : '피해 갈게요'); msg.textContent = SAY[o.kind].msg; }
      else { mode = 'stuck'; wait = 0.6; light(3, SAY.stuck); msg.textContent = SAY.stuck.msg; call.classList.add('on'); say('길이 막혔어요'); }
    }
    function stepAside() {
      const o = hit, [c, r] = o.cells[0], ahead = upcoming(8);
      const taken = (a, b) => b < 0 || b >= ROWS || a < 0 || a >= COLS || wall[b][a] || obs.some((x) => x !== o && x.cells.some(([p, q]) => p === a && q === b)) || ahead.some(([p, q]) => p === a && q === b);
      const [rc, rr] = cellOf(rob.x, rob.y);
      const cand = [[0, -2], [0, 2], [-2, 0], [2, 0], [1, -2], [-1, 2], [0, -1], [0, 1]].map(([dc, dr]) => [c + dc, r + dr]).filter(([a, b]) => !taken(a, b) && Math.hypot(a - rc, b - rr) > 1.5);
      say('');
      if (!cand.length) { if (plan()) { mode = goal.back ? 'back' : 'go'; msg.textContent = '사람이 비키지 못한다 — 돌아서 간다'; } else { mode = 'stuck'; light(3, SAY.stuck); msg.textContent = SAY.stuck.msg; call.classList.add('on'); } return; }
      const to = cand[0], dx = (to[0] - c) * C, dy = (to[1] - r) * C;
      o.cells = [to]; o.known = false;
      const done = () => { art(o); o.g.removeAttribute('transform'); o.known = false; mode = goal.back ? 'back' : 'go'; if (!plan()) { mode = 'stuck'; light(3, SAY.stuck); } msg.textContent = '사람이 비켜 주었다 — 다시 간다'; };
      if (window.gsap && !window.Deck.reduce) gsap.to(o.g, { x: dx, y: dy, duration: 0.7, ease: 'power1.inOut', onComplete: () => { gsap.set(o.g, { clearProps: 'transform' }); done(); } });
      else done();
      mode = 'aside';
    }
    function arrive() {
      pathG.setAttribute('d', '');
      if (goal && goal.back) { mode = 'home'; bot.classList.remove('full'); light(0); msg.textContent = '주방에 돌아왔다 — 다른 식탁을 눌러 보자'; tables.forEach((x) => x.g.classList.remove('picked')); return; }
      mode = 'deliver'; wait = 1.4; goal.t.plate.classList.add('on'); bot.classList.remove('full');
      say('음식 나왔습니다');
    }
    tables.forEach((t) => {
      t.g.addEventListener('click', () => { if (drag.picked) { msg.textContent = '식탁 위가 아니라 빈 바닥(통로)을 눌러 놓아요'; return; } send(t); });
      t.g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); send(t); } });
    });
    // 끌어 놓기 · 누른 뒤 바닥 누르기
    let lastPt = null;
    root.addEventListener('pointermove', (e) => { lastPt = e; }, true);
    const toSvg = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
    const drag = window.Drag.cards(cards, {
      find: (x) => (x.closest && x.closest('#aibot .sv-svg') && !x.closest('.sv-table')) ? svg : null,
      hover: (t) => svg.classList.toggle('target', !!t),
      drop: (c, t) => { if (!t || !lastPt) { if (!t) msg.textContent = '식당 바닥 위에 놓아 보자'; return; } const q = toSvg(lastPt); place(c.dataset.k, q.x, q.y); },
      pick: (c) => { svg.classList.toggle('picking', !!c); if (c) msg.textContent = `${eul(c.textContent.trim())} 놓을 바닥을 눌러요`; },
    });
    svg.addEventListener('click', (e) => { if (!drag.picked || e.target.closest('.sv-table')) return; const c = drag.picked, q = toSvg(e); if (place(c.dataset.k, q.x, q.y)) drag.unpick(); });
    step(0);
    root._serve = {
      send: (i) => send(tables[i]),
      put: (kind, c, r) => place(kind, cx(c), cy(r)),
      ahead: (n) => { const q = path[Math.min(path.length - 1, k + n)]; return q ? [q[0], q[1]] : null; },
      get mode() { return mode; },
    };
    return {
      setActive(on) { active = on; if (on && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); } if (!on && raf) { cancelAnimationFrame(raf); raf = 0; } },
    };
  }
  window.ServeBot = { mount };
})();
