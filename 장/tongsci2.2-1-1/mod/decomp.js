/* 1차시 4장: 분해자가 없다면? 숲 바닥 단면에 낙엽이 계속 떨어진다. 처음에는 분해자가 없어 낙엽이 쌓이고
   흙 속 양분이 줄어 풀이 누레진다. 손가락으로 땅을 칠하면 그 자리에 곰팡이 실(균사)과 버섯이 퍼지고,
   그곳 낙엽이 삭아 흙 속 양분이 되며 둘레 풀이 다시 짙어진다(속도·양은 이해를 돕기 위한 예). */
(function () {
  'use strict';
  const { el, pt, clamp, lerp, draw, loop } = window.Eco;
  const GY = 380, N = 44, CW = 1056 / N;
  const PLANTS = [120, 320, 520, 720, 930];

  function mount(root) {
    const svg = root.querySelector('.dc-svg');
    el('rect', { class: 'dc-sky', x: -400, y: -300, width: 1856, height: GY + 300 }, svg);
    [[150, GY, 1.6], [520, GY, 1.9], [880, GY, 1.7]].forEach(([x, y, s]) => draw.tree(svg, x, y, s, { color: '#7aa24a' }));
    el('rect', { class: 'dc-soil', x: -400, y: GY, width: 1856, height: 700 }, svg);
    const rich = [], hyph = [], mush = [];
    for (let c = 0; c < N; c++) {
      rich.push(el('rect', { class: 'dc-rich', x: c * CW, y: GY, width: CW + 0.5, height: 150 }, svg));
      const x = c * CW + CW / 2;
      hyph.push(el('path', { class: 'dc-hyph', d: `M${x - 10} ${GY + 6} q6 20 -2 40 q-6 14 4 30 M${x} ${GY + 4} q-8 18 4 34 M${x + 8} ${GY + 6} q8 24 -2 46` }, svg));
    }
    for (let c = 0; c < N; c += 2) mush.push({ c, g: draw.mushroom(svg, c * CW + CW, GY + 2, 0.55, c % 4 ? '#c8643c' : '#d9a441') });
    const plants = PLANTS.map((x) => {
      const roots = el('path', { class: 'dc-root', d: `M${x} ${GY} q-20 40 -40 70 M${x} ${GY} q4 50 -2 90 M${x} ${GY} q22 36 44 64` }, svg);
      const g = el('g', { class: 'dc-plant', transform: `translate(${x} ${GY})` }, svg);
      const leaves = [];
      [[-1, 0.9], [1, 0.8], [-1, 0.55], [1, 0.45], [0, 1.2]].forEach(([dir, h]) => {
        const d = dir === 0 ? `M0 0 Q-6 ${-60 * h} 0 ${-90 * h} Q6 ${-60 * h} 0 0` : `M0 0 Q${dir * 30} ${-40 * h} ${dir * 52} ${-70 * h} Q${dir * 14} ${-50 * h} 0 0`;
        leaves.push(el('path', { class: 'dc-leafp', d }, g));
      });
      return { x, g, roots, leaves, health: 0.6 };
    });
    const litterG = el('g', {}, svg);
    const fallG = el('g', {}, svg);
    const pile = Array.from({ length: N }, () => []);   // 칸마다 쌓인 낙엽 요소
    const nut = Array.from({ length: N }, () => 0.22);  // 흙 속 양분 0~1
    const dec = Array.from({ length: N }, () => 0);     // 분해자 0~1
    const falling = [];
    const now = root.querySelector('.dc-now');
    const bars = { lit: root.querySelector('.dc-bar[data-k="lit"] i'), nut: root.querySelector('.dc-bar[data-k="nut"] i'), hp: root.querySelector('.dc-bar[data-k="hp"] i') };
    const COLORS = ['#d98b3a', '#c9672f', '#e0b04a', '#b8742e'];
    let spawn = 0, painted = false, tm = 0;

    function addLeaf(c) {
      const k = pile[c].length; if (k > 14) return;
      const x = c * CW + CW / 2 + ((k * 7) % 11) - 5, y = GY - 3 - k * 5.5;
      const l = el('ellipse', { class: 'dc-lit', cx: x, cy: y, rx: 12, ry: 4.5, fill: COLORS[(c + k) % 4], transform: `rotate(${((c * 13 + k * 29) % 50) - 25} ${x} ${y})` }, litterG);
      pile[c].push({ l, rot: 0 });
    }
    function paintAt(p) {
      if (p.y < GY - 160 || p.y > 600) return;
      const c0 = Math.floor(p.x / CW);
      for (let c = c0 - 1; c <= c0 + 1; c++) if (c >= 0 && c < N) dec[c] = clamp(dec[c] + (c === c0 ? 0.35 : 0.18), 0, 1);
      if (!painted) { painted = true; }
      render();
    }
    function render() {
      for (let c = 0; c < N; c++) {
        rich[c].style.opacity = (0.08 + nut[c] * 0.8).toFixed(2);
        hyph[c].style.opacity = clamp(dec[c] * 1.6, 0, 1).toFixed(2);
      }
      mush.forEach(({ c, g }) => { const v = Math.max(dec[c], dec[c + 1] || 0); g.style.opacity = v > 0.55 ? 1 : 0; g.style.transform = ''; });
      plants.forEach((P) => {
        const h = P.health, col = `hsl(${lerp(48, 112, h).toFixed(0)} ${lerp(55, 45, h).toFixed(0)}% ${lerp(52, 38, h).toFixed(0)}%)`;
        P.leaves.forEach((l) => { l.setAttribute('fill', col); });
        P.g.setAttribute('transform', `translate(${P.x} ${GY}) scale(${lerp(0.7, 1.15, h).toFixed(3)})`);
      });
      const lit = pile.reduce((a, p) => a + p.length, 0) / (N * 10), nu = nut.reduce((a, b) => a + b, 0) / N, hp = plants.reduce((a, p) => a + p.health, 0) / plants.length;
      bars.lit.style.width = (clamp(lit, 0, 1) * 100).toFixed(1) + '%';
      bars.nut.style.width = (clamp(nu, 0, 1) * 100).toFixed(1) + '%';
      bars.hp.style.width = (clamp(hp, 0, 1) * 100).toFixed(1) + '%';
      const dsum = dec.reduce((a, b) => a + b, 0) / N;
      now.textContent = dsum < 0.02 ? '분해자가 없다 · 땅을 손가락으로 칠해 분해자를 퍼뜨리자' : dsum < 0.6 ? '칠한 곳과 안 칠한 곳을 견줘 보자' : '분해자가 숲 바닥 전체에서 일한다';
      now.classList.toggle('done', dsum >= 0.6);
    }
    function step(dt) {
      tm += dt;
      spawn += dt * 6;
      while (spawn > 1) { spawn -= 1; falling.push({ x: 60 + Math.random() * 936, y: 120 + Math.random() * 80, v: 40 + Math.random() * 30, ph: Math.random() * 6, e: null }); }
      for (let i = falling.length - 1; i >= 0; i--) {
        const f = falling[i];
        if (!f.e) f.e = el('ellipse', { class: 'dc-lit', rx: 11, ry: 4, fill: COLORS[i % 4] }, fallG);
        f.y += f.v * dt; const x = f.x + Math.sin(tm * 2 + f.ph) * 14;
        const c = clamp(Math.floor(x / CW), 0, N - 1);
        if (f.y >= GY - 4 - pile[c].length * 5.5) { f.e.remove(); falling.splice(i, 1); addLeaf(c); continue; }
        f.e.setAttribute('cx', x.toFixed(1)); f.e.setAttribute('cy', f.y.toFixed(1));
        f.e.setAttribute('transform', `rotate(${(Math.sin(tm * 3 + f.ph) * 40).toFixed(0)} ${x.toFixed(1)} ${f.y.toFixed(1)})`);
      }
      for (let c = 0; c < N; c++) {
        // 분해: 맨 위 낙엽부터 삭아 흙 속 양분이 된다
        if (dec[c] > 0.05 && pile[c].length) {
          const top = pile[c][pile[c].length - 1];
          top.rot += dt * dec[c] * 1.4;
          top.l.style.opacity = (1 - top.rot).toFixed(2);
          if (top.rot >= 1) { top.l.remove(); pile[c].pop(); nut[c] = clamp(nut[c] + 0.15, 0, 1); }
        }
        nut[c] = clamp(nut[c] - dt * 0.008, 0, 1);   // 풀이 빨아 쓰고 빗물에 씻긴다
      }
      plants.forEach((P) => {
        const c0 = Math.floor(P.x / CW); let s = 0;
        for (let c = c0 - 3; c <= c0 + 3; c++) if (c >= 0 && c < N) s += nut[c];
        s /= 7;
        P.health = clamp(P.health + (s - 0.3) * dt * 0.5, 0.05, 1);
      });
      render();
    }
    svg.addEventListener('pointerdown', (e) => {
      if (e.button) return; e.preventDefault();
      try { svg.setPointerCapture(e.pointerId); } catch (err) { /* 합성 이벤트 */ }
      svg._paint = e.pointerId; paintAt(pt(svg, e));
    });
    svg.addEventListener('pointermove', (e) => { if (svg._paint === e.pointerId) paintAt(pt(svg, e)); });
    const end = (e) => { if (svg._paint === e.pointerId) svg._paint = null; };
    svg.addEventListener('pointerup', end); svg.addEventListener('pointercancel', end);
    root.querySelector('#dc-clear').addEventListener('click', () => { dec.fill(0); render(); });
    for (let c = 0; c < N; c++) for (let k = 0; k < 3 + (c % 3); k++) addLeaf(c);
    render();
    const L = loop(step);
    root._dc = { paint(x0, x1) { for (let x = x0; x <= x1; x += 10) paintAt({ x, y: GY + 10 }); }, run(sec) { for (let i = 0; i < sec * 30; i++) step(1 / 30); } };
    return { setActive(on) { if (on) L.start(); else L.stop(); } };
  }
  window.Decomp = { mount };
})();
