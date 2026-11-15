/* 생태통로(교과서 81쪽): 찻길이 숲을 위아래로 가른다. 동물은 늘 다니던 길(골짜기 물길 쪽이 큰길, 왼쪽은 작은 길)을 따라 찻길을 건너려 한다.
   생태통로 다리를 찻길을 따라 좌우로 끌면, 동물 길과 가까울 때 동물이 다리로 건너고 멀면 찻길로 건너다 차에 치이기도 한다. 수는 모델. */
(function () {
  'use strict';
  const { el, pt, clamp, org, rng } = window.Eco;
  const RY0 = 300, RY1 = 400, LANE = [330, 372], MAIN = 720, MINOR = 250, BW = 150, NEAR = 105;

  function mount(root) {
    const svg = root.querySelector('.co-svg'), now = root.querySelector('.co-now'), range = root.querySelector('#co-x');
    const safeEl = root.querySelector('.co-safe'), killEl = root.querySelector('.co-kill'), rateEl = root.querySelector('.co-rate');
    const it = root.querySelector('.co-it'), ib = root.querySelector('.co-ib');
    const R = rng(6);
    el('rect', { class: 'co-forest', x: -400, y: -300, width: 1856, height: 1300 }, svg);
    el('path', { class: 'co-stream', d: `M${MAIN - 20} -10 C ${MAIN + 30} 120 ${MAIN - 40} 220 ${MAIN} ${RY0} M ${MAIN} ${RY1} C ${MAIN + 40} 500 ${MAIN - 30} 600 ${MAIN + 10} 720` }, svg);
    for (let i = 0; i < 70; i++) { const x = R() * 1056, y = R() < 0.5 ? R() * 270 : 430 + R() * 270; if (Math.abs(x - MAIN) < 60) continue; org(svg, 'tree', x, y + 30, 0.8 + R() * 0.4); }
    // 동물 길(점선)
    const trails = [];
    const tr = (x0, y0, cx, x1, y1, w) => { trails.push({ x0, y0, cx, x1, y1, w }); el('path', { class: 'co-trail' + (w < 0.5 ? ' minor' : ''), d: `M${x0} ${y0} Q ${cx} ${(y0 + RY0) / 2} ${cx} ${RY0 - 6} M ${cx} ${RY1 + 6} Q ${cx} ${(y1 + RY1) / 2} ${x1} ${y1}` }, svg); };
    tr(600, 80, MAIN - 20, 840, 640, 0.4); tr(880, 120, MAIN + 20, 600, 650, 0.35); tr(160, 120, MINOR, 330, 640, 0.25);
    [[600, 80], [880, 120], [160, 120], [840, 640], [600, 650], [330, 640]].forEach(([x, y]) => el('ellipse', { class: 'co-den', cx: x, cy: y, rx: 30, ry: 16 }, svg));
    // 찻길
    el('rect', { class: 'co-road', x: -400, y: RY0, width: 1856, height: RY1 - RY0 }, svg);
    el('path', { class: 'co-mid', d: `M-400 ${(RY0 + RY1) / 2} H 1456` }, svg);
    const carL = el('g', {}, svg), aniL = el('g', {}, svg), markL = el('g', {}, svg);
    // 생태통로 다리
    let bx = 220;
    const bridge = el('g', { class: 'co-bridge', tabindex: '-1' }, svg);
    el('rect', { class: 'co-bdeck', x: -BW / 2, y: RY0 - 26, width: BW, height: RY1 - RY0 + 52, rx: 12 }, bridge);
    for (let i = 0; i < 4; i++) org(bridge, i % 2 ? 'grass' : 'tree', -48 + i * 32, RY0 + 10 + (i % 2) * 70, 0.55);
    el('rect', { class: 'co-brail', x: -BW / 2, y: RY0 - 26, width: 10, height: RY1 - RY0 + 52 }, bridge); el('rect', { class: 'co-brail', x: BW / 2 - 10, y: RY0 - 26, width: 10, height: RY1 - RY0 + 52 }, bridge);
    const lab = el('g', { class: 'co-blab' }, bridge); el('rect', { x: -58, y: RY0 - 66, width: 116, height: 34, rx: 17 }, lab); el('text', { x: 0, y: RY0 - 42 }, lab).textContent = '생태통로';
    const bhit = el('rect', { class: 'co-bhit', x: -BW / 2 - 20, y: RY0 - 70, width: BW + 40, height: RY1 - RY0 + 100 }, bridge);
    const placeB = () => { bridge.setAttribute('transform', `translate(${bx.toFixed(1)} 0)`); range.value = String(Math.round(bx)); };
    let cars = [], animals = [], spawnA = 0, spawnC = 0, safe = 0, kill = 0, road = 0, moved = false;
    function addAnimal() {
      let u = R(), t = trails[0]; for (const x of trails) { if (u < x.w) { t = x; break; } u -= x.w; }
      const down = R() < 0.5, cx = t.cx + (R() - 0.5) * 30;
      const useB = Math.abs(cx - bx) < NEAR, cross = useB ? bx + (R() - 0.5) * 50 : cx;
      const [sx, sy, ex, ey] = down ? [t.x0, t.y0, t.x1, t.y1] : [t.x1, t.y1, t.x0, t.y0];
      const pts = down ? [[sx, sy], [cx, RY0 - 30], [cross, RY0 - 10], [cross, RY1 + 10], [cx, RY1 + 30], [ex, ey]] : [[sx, sy], [cx, RY1 + 30], [cross, RY1 + 10], [cross, RY0 - 10], [cx, RY0 - 30], [ex, ey]];
      const kind = R() < 0.6 ? 'deer' : 'rabbit';
      const g = org(aniL, kind, sx, sy, kind === 'deer' ? 0.75 : 0.8);
      animals.push({ g, kind, pts, i: 0, x: sx, y: sy, useB, done: false });
    }
    function addCar() {
      const lane = R() < 0.5 ? 0 : 1, dir = lane === 0 ? 1 : -1, x = dir > 0 ? -80 : 1136;
      const g = el('g', { class: 'co-car' }, carL); el('rect', { x: -38, y: -15, width: 76, height: 30, rx: 8, style: `fill:${['#d9483b', '#3a78c2', '#f2c84b', '#7a7f8a'][Math.floor(R() * 4)]}` }, g); el('rect', { class: 'co-win', x: dir > 0 ? 8 : -26, y: -11, width: 18, height: 22, rx: 3 }, g);
      cars.push({ g, x, y: LANE[lane], v: dir * (240 + R() * 90) });
    }
    function step(dt) {
      spawnA -= dt; spawnC -= dt;
      if (spawnA <= 0) { addAnimal(); spawnA = 0.55 + R() * 0.4; }
      if (spawnC <= 0) { addCar(); spawnC = 0.35 + R() * 0.45; }
      cars.forEach((c) => { c.x += c.v * dt; c.g.setAttribute('transform', `translate(${c.x.toFixed(1)} ${c.y})`); });
      cars = cars.filter((c) => { if (c.x < -120 || c.x > 1180) { c.g.remove(); return false; } return true; });
      animals.forEach((a) => {
        if (a.done) return;
        const [tx, ty] = a.pts[a.i + 1], dx = tx - a.x, dy = ty - a.y, d = Math.hypot(dx, dy), sp = (a.i === 2 && !a.useB ? 120 : 95) * dt;
        if (d <= sp) { a.x = tx; a.y = ty; a.i++; if (a.i === 3) { if (a.useB) safe++; else road++; } if (a.i >= a.pts.length - 1) { a.done = true; a.g.remove(); } }
        else { a.x += dx / d * sp; a.y += dy / d * sp; }
        if (!a.done && !a.useB && a.y > RY0 && a.y < RY1 && cars.some((c) => Math.abs(c.y - a.y) < 22 && Math.abs(c.x - a.x) < 46)) {
          a.done = true; a.g.remove(); kill++;
          const m = el('g', { class: 'co-hit', transform: `translate(${a.x.toFixed(0)} ${a.y.toFixed(0)})` }, markL); el('path', { d: 'M-12 -12 L 12 12 M 12 -12 L -12 12' }, m);
          setTimeout(() => m.remove(), 2200);
        }
        if (!a.done) a.g.setAttribute('transform', `translate(${a.x.toFixed(1)} ${a.y.toFixed(1)}) scale(${a.kind === 'deer' ? 0.75 : 0.8})`);
      });
      animals = animals.filter((a) => !a.done);
      paint();
    }
    function paint() {
      safeEl.textContent = safe; killEl.textContent = kill;
      const tot = safe + road + kill;
      rateEl.textContent = tot ? Math.round(safe / tot * 100) + ' %' : '—';
      const near = Math.abs(bx - MAIN) < NEAR;
      if (!moved) { it.textContent = '갈라진 서식지'; ib.textContent = '길이 생기면 동물은 먹이와 짝을 찾아 길을 건너다 사고를 당하고, 두 숲의 무리가 서로 만나지 못한다.'; }
      else if (near) { it.textContent = '동물 길과 이어진 통로'; ib.textContent = '골짜기 물길을 따라 다니던 동물 대부분이 다리로 안전하게 건넌다. 위아래 숲의 무리가 다시 이어졌다.'; }
      else { it.textContent = '동물이 쓰지 않는 통로'; ib.textContent = '동물이 다니지 않는 곳에 지은 통로는 거의 쓰이지 않는다. 점선(동물 길)이 많이 모이는 곳을 찾아보자.'; }
      now.textContent = !moved ? '초록 다리를 좌우로 끌어 보자' : near ? '좋은 자리! 사고 수가 늘지 않는지 지켜보자' : '동물 길이 모이는 곳으로 옮겨 보자';
      now.classList.toggle('done', moved && near);
    }
    let drag = false, off = 0;
    bhit.addEventListener('pointerdown', (e) => { e.preventDefault(); drag = true; bhit.setPointerCapture(e.pointerId); off = pt(svg, e).x - bx; });
    bhit.addEventListener('pointermove', (e) => { if (!drag) return; bx = clamp(pt(svg, e).x - off, 140, 920); moved = true; placeB(); paint(); });
    ['pointerup', 'pointercancel'].forEach((t) => bhit.addEventListener(t, () => { drag = false; }));
    range.addEventListener('input', () => { bx = Number(range.value); moved = true; placeB(); paint(); });
    window.Eco.keyStop(range);
    placeB(); paint();
    const loop = window.Stage.loop(step);
    root._co = { get x() { return bx; }, fast: (sec) => { for (let i = 0; i < sec * 30; i++) step(1 / 30); }, set: (x) => { bx = x; moved = true; placeB(); paint(); } };
    return { setActive(on) { if (on) loop.start(); else loop.stop(); } };
  }
  window.EcoCorridor = { mount };
})();
