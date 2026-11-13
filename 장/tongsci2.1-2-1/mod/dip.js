/* 2차시 표지(교과서 42쪽): 푸른 황산 구리(Ⅱ) 수용액에 아연판을 담갔다 꺼낸다.
   아연판은 위아래 26줄. 수면 아래에 잠긴 줄만 구리로 덮여 가고(붉은 갈색), 덮인 만큼 수용액의 푸른색(Cu²⁺)이 옅어진다.
   빠르기는 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const { el, clamp, pt, hold, mix, keep } = window.RX;
  const BX0 = 190, BX1 = 470, SURF = 236, BOT = 432, ROWS = 26, PH = 260, PX = 300, PWD = 60;

  function mount(root) {
    const svg = root.querySelector('.rx-dp-svg');
    el('rect', { x: 0, y: 0, width: 660, height: 470, fill: '#eef2ef' }, svg);
    el('rect', { x: 0, y: 444, width: 660, height: 26, fill: '#cdbfa8' }, svg);
    // 스탠드
    el('rect', { class: 'rx-tb-steel', x: 560, y: 30, width: 14, height: 416 }, svg);
    el('rect', { class: 'rx-tb-steel', x: 520, y: 436, width: 110, height: 12, rx: 4 }, svg);
    const arm = el('rect', { class: 'rx-tb-steel', x: PX + PWD / 2 - 4, y: 40, width: 270, height: 12, rx: 4 }, svg);
    // 비커와 수용액
    const sol = el('path', { d: `M${BX0 + 4} ${SURF} L ${BX1 - 4} ${SURF} L ${BX1 - 4} ${BOT - 6} Q ${BX1 - 4} ${BOT} ${BX1 - 12} ${BOT} L ${BX0 + 12} ${BOT} Q ${BX0 + 4} ${BOT} ${BX0 + 4} ${BOT - 6} Z`, fill: '#3f8fd8' }, svg);
    const plateG = el('g', { class: 'rx-dp-plate' }, svg);
    const rod = el('rect', { class: 'rx-tb-steel', x: PX + PWD / 2 - 5, y: 0, width: 10, height: 10 }, svg);
    const clampEl = el('rect', { class: 'rx-tb-clamp', x: PX - 6, y: 0, width: PWD + 12, height: 22, rx: 5 }, svg);
    const cells = [];
    for (let r = 0; r < ROWS; r++) cells.push({ c: 0, e: el('rect', { x: PX, y: r * PH / ROWS, width: PWD, height: PH / ROWS + 0.6 }, plateG) });
    el('rect', { x: PX, y: 0, width: PWD, height: PH, fill: 'none', stroke: '#1d2433', 'stroke-width': 2.5 }, plateG);
    const bumps = el('g', {}, plateG);
    for (let i = 0; i < 40; i++) el('circle', { cx: PX + 4 + Math.random() * (PWD - 8), cy: Math.random() * PH, r: 2 + Math.random() * 3, fill: '#7d3a1c', opacity: 0, 'data-r': Math.floor(Math.random() * ROWS) }, bumps);
    const bumpEls = [...bumps.children];
    el('path', { class: 'rx-tb-glass', d: `M${BX0} 150 L ${BX0} ${BOT - 8} Q ${BX0} ${BOT + 4} ${BX0 + 12} ${BOT + 4} L ${BX1 - 12} ${BOT + 4} Q ${BX1} ${BOT + 4} ${BX1} ${BOT - 8} L ${BX1} 150` }, svg);
    el('line', { x1: BX0 + 4, y1: SURF, x2: BX1 - 4, y2: SURF, stroke: '#1d4f86', 'stroke-width': 2, opacity: 0.5 }, svg);
    el('text', { class: 'rx-dp-lab', x: BX0 - 12, y: 330, 'text-anchor': 'end' }, svg).textContent = '황산 구리(Ⅱ)';
    el('text', { class: 'rx-dp-lab', x: BX0 - 12, y: 356, 'text-anchor': 'end' }, svg).textContent = '수용액';
    const plateLab = el('text', { class: 'rx-dp-lab', 'text-anchor': 'middle' }, svg); plateLab.textContent = '아연판';
    const hint = el('text', { class: 'rx-sw-hint', x: 110, y: 120 }, svg); hint.textContent = '↓ 끌어 담그기';

    let top = -50, blue = 1, T = 0;
    const place = (y) => {
      top = clamp(y, -80, BOT - 8 - PH);
      plateG.setAttribute('transform', `translate(0 ${top})`);
      rod.setAttribute('y', 46); rod.setAttribute('height', Math.max(0, top - 46));
      clampEl.setAttribute('y', top - 18);
      plateLab.setAttribute('x', PX + PWD / 2); plateLab.setAttribute('y', top - 28);
      hint.style.opacity = top > 40 ? 0 : 1;
    };
    void arm;
    place(top);
    let grab = null;
    hold(svg, {
      down(e) { const p = pt(svg, e); grab = top - p.y; svg.classList.add('holding'); },
      move(e) { if (grab == null) return; place(pt(svg, e).y + grab); },
      up() { grab = null; svg.classList.remove('holding'); },
    });
    keep(svg);
    svg.addEventListener('keydown', (e) => { if (e.key === 'ArrowDown') { place(top + 20); e.preventDefault(); } if (e.key === 'ArrowUp') { place(top - 20); e.preventDefault(); } });
    function step(dt) {
      T += dt;
      let d = 0;
      cells.forEach((c, r) => {
        const y = top + (r + 0.5) * PH / ROWS;
        if (y > SURF + 2 && blue > 0.02) { const k = 0.09 * dt * blue * (1 - c.c * 0.6); c.c = clamp(c.c + k, 0, 1); d += k; }
        c.e.setAttribute('fill', mix(mix('#c3cad2', '#9fa8b2', (r % 3) / 3), '#a5532b', c.c));
      });
      blue = clamp(blue - d * 0.06, 0, 1);
      bumpEls.forEach((b) => b.setAttribute('opacity', clamp(cells[+b.getAttribute('data-r')].c * 1.4 - 0.3, 0, 1).toFixed(2)));
      sol.setAttribute('fill', mix('#dbe9f2', '#3f8fd8', blue));
    }
    const loop = window.Stage.loop(step);
    step(0.016);
    return { setActive(on) { if (on) loop.start(); else loop.stop(); }, place, get blue() { return blue; } };
  }
  window.RxDip = { mount };
})();
