/* 효율 높이기 ② 에너지 수확(압전 바닥·전파). 타일을 누르면 타일이 눌리며 아래 압전 소자에서 작은 전기가 생기고,
   전기 알갱이가 바닥 아래 전선을 따라 «모은 전기»로 간다. 칸이 다 차면 안내등이 몇 초 켜지고 모은 전기를 쓴다.
   «학생 무리가 지나가기»: 사람 여럿이 타일을 밟고 지나간다. 위 안테나는 전파를 모아 작은 센서를 깜빡인다(CSS). */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const N = 6, X0 = 60, TW = 150, GAP = 12, TY = 494;
  const STEP = 0.08;                                   // 한 걸음이 채우는 몫(그림용)

  function mount(root) {
    const svg = root.querySelector('.hv-svg'), q = (s) => svg.querySelector(s);
    const tilesG = q('.hv-tiles'), walkG = q('.hv-walkers'), leds = q('.hv-leds'), sf = q('.hv-sf'), sign = q('.hv-sign');
    const nEl = root.querySelector('.hv-n'), state = root.querySelector('.hv-state'), hint = root.querySelector('.hv-hint');
    const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); p.appendChild(e); return e; };
    q('.hv-wire').setAttribute('d', 'M780 275 H 700 V 125 H 670');
    // 복도 사물함(벽 장식)
    const lockers = el('g', { class: 'hv-lockers' }, svg); svg.insertBefore(lockers, q('.hv-sign'));
    for (let i = 0; i < 9; i++) { const x = 60 + i * 70; el('rect', { class: 'hv-locker', x, y: 250, width: 66, height: 188, rx: 4 }, lockers); [270, 280, 290].forEach((y) => el('path', { class: 'hv-vent', d: `M${x + 16} ${y} H ${x + 50}` }, lockers)); }
    const bus = el('path', { class: 'hv-bus', d: `M${X0 + TW / 2} 600 H 940 V 320` }, svg);
    svg.insertBefore(bus, tilesG);
    const busL = bus.getTotalLength();
    for (let i = 0; i < 14; i++) el('circle', { class: 'hv-led', cx: 40 + i * 34, cy: 82, r: 10 }, leds);
    const tiles = [];
    for (let i = 0; i < N; i++) {
      const x = X0 + i * (TW + GAP), g = el('g', { class: 'hv-tile', tabindex: '0', role: 'button', 'aria-label': `바닥 타일 ${i + 1} 밟기` }, tilesG);
      el('path', { class: 'hv-pz', d: `M${x + 30} 560 l 15 -14 l 15 14 l 15 -14 l 15 14 l 15 -14 l 15 14 l 15 -14 l 15 14` }, g);
      el('path', { class: 'hv-lead', d: `M${x + TW / 2} 566 V 600` }, g);
      const top = el('rect', { class: 'hv-top', x, y: TY, width: TW, height: 40, rx: 6 }, g);
      el('text', { class: 'hv-tt', x: x + TW / 2, y: TY + 27 }, g).textContent = '압전';
      tiles.push({ g, top, x, t: 0 });
      const press = (e) => { if (e) e.preventDefault(); step(i); };
      g.addEventListener('pointerdown', press);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.stopPropagation(); press(e); } });
    }
    let charge = 0, steps = 0, lit = 0, flash = 0, packets = [], walkers = [], sparks = [];
    function step(i) {
      const t = tiles[i]; t.t = 0.25; steps++; flash = 0.25; hint.classList.add('gone');
      // 타일 아래에서 버스선까지의 거리로 출발점을 정한다
      const start = (t.x + TW / 2 - (X0 + TW / 2));
      packets.push({ s: start, g: el('circle', { class: 'hv-pk', r: 7 }, svg) });
      sparks.push({ x: t.x + TW / 2, y: 552, a: 1, g: el('path', { class: 'hv-spark', d: 'M0 0' }, svg) });
      nEl.textContent = String(steps);
    }
    function loop(dt) {
      tiles.forEach((t) => { t.t = Math.max(0, t.t - dt); t.g.setAttribute('transform', `translate(0 ${t.t > 0 ? 8 : 0})`); });
      packets = packets.filter((p) => {
        p.s += dt * 520;
        if (p.s >= busL) { p.g.remove(); charge = Math.min(1, charge + STEP); return false; }
        const pt = bus.getPointAtLength(p.s); p.g.setAttribute('cx', pt.x.toFixed(1)); p.g.setAttribute('cy', pt.y.toFixed(1));
        return true;
      });
      sparks = sparks.filter((s) => {
        s.a -= dt * 2.5; if (s.a <= 0) { s.g.remove(); return false; }
        const r = 22 * (1.2 - s.a);
        s.g.setAttribute('d', [0, 1, 2, 3, 4, 5].map((k) => { const a = -Math.PI * (0.1 + k * 0.16); return `M${(s.x + Math.cos(a) * r * 0.4).toFixed(1)} ${(s.y + Math.sin(a) * r * 0.4).toFixed(1)} L ${(s.x + Math.cos(a) * r).toFixed(1)} ${(s.y + Math.sin(a) * r).toFixed(1)}`; }).join(' '));
        s.g.style.opacity = String(s.a);
        return true;
      });
      if (charge >= 1 && lit <= 0) { lit = 4; charge = 0.999; }
      if (lit > 0) { lit -= dt; charge = Math.max(0, charge - dt * 0.25); if (lit <= 0) charge = 0; }
      flash = Math.max(0, flash - dt);
      sign.classList.toggle('on', lit > 0);
      leds.querySelectorAll('.hv-led').forEach((c, k) => c.classList.toggle('blink', lit <= 0 && flash > 0 && k < 2));
      sf.setAttribute('width', (168 * Math.min(1, charge)).toFixed(1));
      state.textContent = lit > 0 ? '안내등이 켜졌다! 모은 전기를 쓰는 중' : charge > 0 ? '조금씩 모이는 중 — 더 밟아 보자' : '한 걸음은 아주 작은 전기';
      // 지나가는 학생
      walkers = walkers.filter((w) => {
        w.x += dt * 260; w.ph += dt * 9;
        if (w.x > 1100) { w.g.remove(); return false; }
        const ti = tiles.findIndex((t) => Math.abs(w.x - (t.x + TW / 2)) < 10);
        if (ti >= 0 && w.lastTile !== ti) { w.lastTile = ti; step(ti); }
        const lg = Math.sin(w.ph) * 14;
        w.g.setAttribute('transform', `translate(${w.x.toFixed(1)} ${TY})`);
        w.legs.setAttribute('d', `M0 -60 L ${lg.toFixed(1)} -4 M 0 -60 L ${(-lg).toFixed(1)} -4`);
        return true;
      });
    }
    function person() {
      const g = el('g', { class: 'hv-man' }, walkG);
      el('circle', { cx: 0, cy: -150, r: 18 }, g);
      el('path', { d: 'M0 -132 V -60 M 0 -116 L -22 -84 M 0 -116 L 22 -84' }, g);
      const legs = el('path', { d: 'M0 -60 L 10 -4 M 0 -60 L -10 -4' }, g);
      return { g, legs };
    }
    root.querySelector('#hv-crowd').addEventListener('click', () => {
      for (let k = 0; k < 6; k++) { const p = person(); walkers.push({ ...p, x: -60 - k * 120, ph: k, lastTile: -1 }); }
      hint.classList.add('gone');
    });
    const lp = window.Stage.loop(loop);
    loop(0);
    return { setActive(on) { if (on && !window.Stage.reduce) lp.start(); else { lp.stop(); loop(0); } } };
  }
  window.EnergyHarvest = { mount };
})();
