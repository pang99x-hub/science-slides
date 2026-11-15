/* 2차시 표지: 비버의 댐(교과서 74쪽 그림 Ⅱ-4). 위에서 내려다본 냇물. 둑의 통나무를 끌어 냇물의 댐 자리에 하나씩 쌓는다.
   쌓을수록 위쪽에 물이 고여 물길이 넓어지고 물살이 느려지며, 둘레가 습지로 바뀌어 부들·오리·개구리가 들어온다(생물 → 환경). */
(function () {
  'use strict';
  const { el, hold, clamp, lerp, draw, loop } = window.Eco;
  const N = 6, DX = 380;
  const cy = (x) => 196 + x * 0.04 + Math.sin(x / 70) * 8;      // 냇물 가운데 선

  function mount(root) {
    const svg = root.querySelector('.bv-svg');
    el('rect', { class: 'bv-land', x: -300, y: -300, width: 1240, height: 1000 }, svg);
    for (let i = 0; i < 26; i++) draw.grass(svg, (i * 97) % 640, 40 + ((i * 53) % 330), 0.5, '#7fae5a');
    const wet = el('ellipse', { class: 'bv-wet', cx: 240, cy: 200, rx: 60, ry: 30 }, svg);
    const pool = el('ellipse', { class: 'bv-pool', cx: 250, cy: 200, rx: 40, ry: 20 }, svg);
    let d = '', d2 = '';
    for (let x = -20; x <= 660; x += 20) d += `${x === -20 ? 'M' : 'L'}${x} ${(cy(x) - 18).toFixed(1)} `;
    for (let x = 660; x >= -20; x -= 20) d2 += `L${x} ${(cy(x) + 18).toFixed(1)} `;
    el('path', { class: 'bv-stream', d: d + d2 + 'Z' }, svg);
    const parts = el('g', {}, svg);
    const drops = Array.from({ length: 22 }, (_, i) => ({ x: (i * 31) % 660, e: el('path', { class: 'bv-flow' }, parts), k: (i % 3) - 1 }));
    const reeds = el('g', { class: 'bv-reeds' }, svg);
    const reedPts = Array.from({ length: 14 }, (_, i) => i / 14 * Math.PI * 2);
    const reedEls = reedPts.map(() => draw.cattail(reeds, 0, 0, 0.32));
    const duck = draw.duck(svg, 0, 0, 0.55), frog = draw.frog(svg, 0, 0, 0.6);
    const dam = el('g', { class: 'bv-dam' }, svg);
    const site = el('rect', { class: 'bv-site', x: DX - 22, y: cy(DX) - 40, width: 44, height: 80, rx: 10 }, svg);
    const wl = el('text', { class: 'bv-tag', x: 170, y: 110 }, svg); wl.textContent = '습지';
    const flowT = el('text', { class: 'bv-speed', x: 620, y: 30 }, svg);
    // 비버
    const bv = el('g', { class: 'bv-beaver' }, svg);
    el('ellipse', { class: 'ec-o', fill: '#4a3a2e', cx: 22, cy: 0, rx: 16, ry: 9, transform: 'rotate(-10 22 0)' }, bv);
    el('ellipse', { class: 'ec-o', fill: '#8a5a32', cx: 0, cy: 0, rx: 22, ry: 15 }, bv);
    el('circle', { class: 'ec-o', fill: '#8a5a32', cx: -20, cy: -2, r: 10 }, bv);
    el('rect', { x: -31, y: 1, width: 5, height: 5, fill: '#fff', stroke: '#1d2433', 'stroke-width': 1 }, bv);
    el('circle', { cx: -22, cy: -6, r: 1.8, fill: '#1d2433' }, bv);
    // 통나무 더미
    const logs = Array.from({ length: N }, (_, i) => {
      const g = el('g', { class: 'bv-log', 'data-i': i, tabindex: '0', role: 'button', 'aria-label': `통나무 ${i + 1} 끌어 댐에 쌓기` }, svg);
      el('rect', { class: 'bv-logb', x: -34, y: -8, width: 68, height: 16, rx: 8 }, g);
      el('ellipse', { class: 'bv-ring', cx: 30, cy: 0, rx: 5, ry: 7 }, g);
      const home = { x: 70 + (i % 3) * 76, y: 318 + Math.floor(i / 3) * 30 };
      g.setAttribute('transform', `translate(${home.x} ${home.y})`);
      return { g, home, on: false };
    });
    let n = 0, h = 0, tm = 0;
    const now = root.querySelector('.bv-now');
    function paint() {
      const H = h;
      const prx = lerp(40, 210, H), pcx = DX - prx + 4; pool.setAttribute('rx', prx.toFixed(1)); pool.setAttribute('ry', lerp(16, 112, H).toFixed(1)); pool.setAttribute('cx', pcx.toFixed(1));
      pool.style.opacity = H > 0.02 ? 1 : 0;
      wet.setAttribute('cx', (pcx - 10).toFixed(1)); wet.setAttribute('rx', lerp(60, 270, H).toFixed(1)); wet.setAttribute('ry', lerp(30, 150, H).toFixed(1)); wet.style.opacity = clamp(H * 1.5 - 0.3, 0, 1);
      wl.style.opacity = H > 0.6 ? 1 : 0;
      reedEls.forEach((r, i) => {
        const a = reedPts[i], rx = lerp(40, 222, H), ry = lerp(16, 120, H);
        r.setAttribute('transform', `translate(${(pcx + rx * Math.cos(a)).toFixed(1)} ${(200 + ry * Math.sin(a) + 6).toFixed(1)}) scale(0.32)`);
        r.style.opacity = H > 0.45 + (i % 4) * 0.12 ? 1 : 0;
      });
      duck.setAttribute('transform', `translate(${pcx - 20 + Math.sin(tm * 0.5) * 40} ${180 + Math.cos(tm * 0.4) * 20}) scale(0.55)`); duck.style.opacity = H > 0.62 ? 1 : 0;
      frog.setAttribute('transform', 'translate(110 222) scale(0.6)'); frog.style.opacity = H > 0.95 ? 1 : 0;
      dam.innerHTML = '';
      for (let i = 0; i < n; i++) {
        const span = 46 + i * 10 + H * 30;
        el('rect', { class: 'bv-logb', x: DX - 6 - (i % 2) * 8 + (i > 2 ? 6 : 0), y: cy(DX) - span / 2, width: 14, height: span, rx: 7, transform: `rotate(${(i % 3 - 1) * 6} ${DX} ${cy(DX)})` }, dam);
      }
      site.style.opacity = n < N ? 1 : 0;
      flowT.textContent = n === 0 ? '물살: 빠르다' : n < 4 ? '물살: 느려진다' : '물살: 거의 고였다';
      now.textContent = n === 0 ? '통나무를 끌어 냇물의 댐 자리에 쌓자' : n < N ? `통나무 ${n}개 · 더 쌓아 보자` : '댐 완성 · 둘레가 어떻게 바뀌었나?';
      now.classList.toggle('done', n === N);
    }
    function step(dt) {
      tm += dt;
      h = lerp(h, n / N, clamp(dt * 1.5, 0, 1));
      const H = h;
      drops.forEach((p) => {
        const up = p.x < DX, v = up ? 70 * (1 - 0.9 * H) : 70 * (1 - 0.65 * H);
        p.x += v * dt; if (p.x > 660) p.x = -20; if (up && p.x > DX - 30 && H > 0.3) p.x = DX + 20;
        const y = cy(p.x) + p.k * 8, L = up ? 18 * (1 - 0.8 * H) + 2 : 16 * (1 - 0.5 * H) + 2;
        p.e.setAttribute('d', `M${(p.x - L).toFixed(1)} ${y.toFixed(1)} L${p.x.toFixed(1)} ${y.toFixed(1)}`);
        p.e.style.opacity = up && H > 0.85 ? 0.25 : 0.9;
      });
      const bx = n === N ? DX + 4 : 300 + Math.sin(tm * 1.2) * 10, by = n === N ? cy(DX) - 30 : 330;
      bv.setAttribute('transform', `translate(${bx.toFixed(1)} ${by.toFixed(1)})`);
      paint();
    }
    logs.forEach((L) => {
      let off = null;
      hold(L.g, svg, {
        down: (p) => { if (L.on) return false; off = { x: L.home.x - p.x, y: L.home.y - p.y }; L.g.classList.add('lift'); },
        move: (p) => L.g.setAttribute('transform', `translate(${(p.x + off.x).toFixed(1)} ${(p.y + off.y).toFixed(1)})`),
        up: (p) => {
          L.g.classList.remove('lift');
          const x = p.x + off.x, y = p.y + off.y;
          if (Math.abs(x - DX) < 80 && Math.abs(y - cy(DX)) < 80) place(L); else L.g.setAttribute('transform', `translate(${L.home.x} ${L.home.y})`);
        },
      });
      L.g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); place(L); } });
    });
    function place(L) { if (L.on) return; L.on = true; L.g.style.display = 'none'; n += 1; paint(); }
    paint(); step(0);
    const lp = loop(step);
    root._bv = { add(k) { logs.filter((l) => !l.on).slice(0, k).forEach(place); }, get n() { return n; } };
    return { setActive(on) { if (on) lp.start(); else lp.stop(); } };
  }
  window.BeaverDam = { mount };
})();
