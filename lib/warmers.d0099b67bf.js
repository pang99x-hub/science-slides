/* 2차시 표지: 손바닥 위의 손난로(흔들기)와 냉찜질 팩(주먹으로 세게 치기). 교과서 56쪽 그림 I-30.
   손난로: 좌우로 끈 거리만큼 공기가 섞여(반응 정도 a) 손바닥 온도 = 20 + 32a °C.
   냉찜질 팩: 주먹을 끌어내려 팩 윗면을 지날 때 속력이 빠르면 물주머니가 터지고, 질산 암모늄이 녹으며 손바닥 온도가 20 → 4 °C.
   온도 값은 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const { el, clamp, lerp } = window.EA;

  function palm(svg, cx) {
    el('path', { class: 'ea-hw-arm', d: `M${cx - 70} 400 L ${cx - 50} 330 L ${cx + 50} 330 L ${cx + 70} 400 Z` }, svg);
    const p = el('path', { class: 'ea-hw-palm', d: `M${cx - 120} 300 q-10 -30 20 -34 q40 -4 100 -2 q60 -2 100 2 q30 4 20 34 q-10 40 -120 40 q-110 0 -120 -40 z` }, svg);
    return p;
  }
  function mount(root) {
    const svg = root.querySelector('.ea-hw-svg');
    el('rect', { class: 'ea-hw-bg', x: 0, y: 0, width: 640, height: 400 }, svg);
    el('line', { class: 'ea-hw-split', x1: 320, y1: 20, x2: 320, y2: 380 }, svg);
    // 손난로 쪽
    const glowW = el('ellipse', { class: 'ea-hw-glow warm', cx: 160, cy: 290, rx: 140, ry: 60 }, svg);
    const palmW = palm(svg, 160);
    const warm = el('g', { class: 'ea-hw-warm', tabindex: 0, role: 'button', 'aria-label': '손난로(좌우로 끌어 흔들기, Enter로도 흔든다)' }, svg);
    const wBody = el('g', {}, warm);
    el('rect', { class: 'ea-hw-pouch', x: 90, y: 170, width: 140, height: 110, rx: 18 }, wBody);
    el('rect', { class: 'ea-hw-win', x: 108, y: 186, width: 104, height: 78, rx: 10 }, wBody);
    const iron = [...Array(30)].map((_, i) => ({ c: el('circle', { class: 'ea-hw-fe', r: 4.5 }, wBody), x: 114 + (i * 13) % 92, y: 236 + (i * 7) % 24 }));
    const o2 = [...Array(8)].map((_, i) => ({ g: el('g', { class: 'ea-hw-o2' }, wBody), k: i / 8 }));
    o2.forEach((o) => { el('circle', { cx: -5, cy: 0, r: 5 }, o.g); el('circle', { cx: 5, cy: 0, r: 5 }, o.g); });
    for (let i = 0; i < 9; i++) el('circle', { class: 'ea-hw-pore', cx: 98 + i * 15, cy: 176, r: 2.5 }, wBody);
    el('rect', { class: 'ea-hw-hit', x: 60, y: 150, width: 200, height: 150 }, warm);
    const waves = el('g', { class: 'ea-hw-waves' }, svg);
    [110, 160, 210].forEach((x) => el('path', { d: `M${x} 160 q-10 -14 0 -28 q10 -14 0 -28` }, waves));
    const thW = window.EA.thermo(svg, { x: 286, y: 300, h: 150, lo: 0, hi: 60, w: 14, cls: 'ea-hw-th' });
    el('text', { class: 'ea-hw-lab', x: 160, y: 30, text: '손난로' }, svg);
    const sayW = el('text', { class: 'ea-hw-say', x: 160, y: 372 }, svg);
    // 냉찜질 팩 쪽
    const glowC = el('ellipse', { class: 'ea-hw-glow cold', cx: 480, cy: 290, rx: 140, ry: 60 }, svg);
    palm(svg, 480);
    const pack = el('g', { class: 'ea-hw-pack' }, svg);
    el('rect', { class: 'ea-hw-cbag', x: 400, y: 206, width: 160, height: 80, rx: 14 }, pack);
    const inner = el('rect', { class: 'ea-hw-inner', x: 428, y: 220, width: 104, height: 44, rx: 18 }, pack);
    const spill = el('rect', { class: 'ea-hw-spill', x: 404, y: 230, width: 152, height: 52, rx: 12 }, pack);
    const salt = [...Array(22)].map((_, i) => ({ c: el('rect', { class: 'ea-hw-salt', width: 7, height: 7 }, pack), x: 410 + (i * 17) % 140, y: 270 - (i % 3) * 5 }));
    const fist = el('g', { class: 'ea-hw-fist', tabindex: 0, role: 'button', 'aria-label': '주먹(아래로 빠르게 끌어 팩을 치기, Enter로도 친다)' }, svg);
    el('path', { class: 'ea-hw-fistp', d: 'M-40 -24 q0 -16 16 -16 h52 q16 0 16 16 v30 q0 18 -18 18 h-48 q-18 0 -18 -18 z' }, fist);
    el('path', { class: 'ea-hw-knuck', d: 'M-26 16 v-10 M-8 16 v-10 M10 16 v-10' }, fist);
    el('rect', { class: 'ea-hw-wrist', x: -20, y: -84, width: 40, height: 46, rx: 8 }, fist);
    el('rect', { class: 'ea-hw-fhit', x: -60, y: -90, width: 120, height: 130 }, fist);
    const thC = window.EA.thermo(svg, { x: 612, y: 300, h: 150, lo: 0, hi: 60, w: 14, cls: 'ea-hw-th', left: true });
    el('text', { class: 'ea-hw-lab', x: 480, y: 30, text: '냉찜질 팩' }, svg);
    const sayC = el('text', { class: 'ea-hw-say', x: 480, y: 372 }, svg);

    let a = 0, shakeX = 0, lastX = null, Tw = 20, Tc = 20, burst = 0, broken = false, fy = 110, fv = 0, held = false, lastT = 0, lastY = 110, t = 0, bounce = 0;
    window.EA.drag(warm, svg, {
      start(p) { lastX = p.x; return true; },
      move(p) { const d = p.x - lastX; lastX = p.x; shakeX = clamp(shakeX + d, -40, 40); a = clamp(a + Math.abs(d) / 2400, 0, 1); },
      end() { lastX = null; },
    });
    warm.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); a = clamp(a + 0.12, 0, 1); shakeX = shakeX > 0 ? -30 : 30; } });
    function strike() { if (broken) return; broken = true; burst = 0.001; fy = 196; }
    window.EA.drag(fist, svg, {
      start(p) { held = true; lastT = performance.now(); lastY = p.y; return true; },
      move(p) {
        const now = performance.now(), dt = Math.max(1, now - lastT) / 1000;
        const ny = clamp(p.y, 40, 196);
        fv = (ny - lastY) / dt; lastY = ny; lastT = now;
        if (ny >= 196 && fy < 196) { if (fv > 700) strike(); else if (!broken) { bounce = 0.5; sayC.textContent = '더 세게, 빠르게 쳐 보자'; } }
        fy = ny;
      },
      end() { held = false; },
    });
    fist.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); strike(); } });

    function step(dt) {
      t += dt;
      // 손난로
      shakeX *= Math.pow(0.02, dt);
      wBody.setAttribute('transform', `translate(${shakeX.toFixed(1)} 0)`);
      Tw += (20 + 32 * a - Tw) * Math.min(1, dt / 1.2);
      thW.set(Tw);
      iron.forEach((f, i) => {
        const jig = a > 0 && Math.abs(shakeX) > 2 ? Math.sin(t * 20 + i) * 4 : 0;
        f.c.setAttribute('cx', (f.x + jig).toFixed(1)); f.c.setAttribute('cy', (f.y - Math.abs(Math.sin(i + shakeX / 10)) * 30 * Math.min(1, Math.abs(shakeX) / 30)).toFixed(1));
        f.c.classList.toggle('ox', i / iron.length < a);
      });
      o2.forEach((o, i) => {
        o.k = (o.k + dt * (0.15 + Math.abs(shakeX) / 60)) % 1;
        o.g.setAttribute('transform', `translate(${(100 + i * 14).toFixed(1)} ${(150 + o.k * 90).toFixed(1)})`);
        o.g.style.opacity = a < 1 ? String(0.9 * (1 - o.k)) : '0';
      });
      glowW.style.opacity = String(clamp((Tw - 22) / 30, 0, 0.85));
      waves.style.opacity = String(clamp((Tw - 26) / 20, 0, 1));
      sayW.textContent = a === 0 ? '좌우로 흔들어 보자' : Tw > 45 ? '철 가루 + 산소 → 따뜻!' : '공기가 들어가 반응한다';
      // 냉찜질 팩
      if (!held) { fy += (110 - fy) * Math.min(1, dt * 4); }
      bounce = Math.max(0, bounce - dt);
      fist.setAttribute('transform', `translate(480 ${(fy - Math.sin(bounce * 20) * 10 * bounce).toFixed(1)})`);
      if (broken) burst = Math.min(1, burst + dt / 3.5);
      inner.style.opacity = broken ? '0' : '1';
      spill.style.opacity = String(Math.min(1, burst * 3) * 0.8);
      salt.forEach((s, i) => { const k = clamp(1 - burst * 1.3 + (i % 4) * 0.05, 0, 1); s.c.setAttribute('x', s.x); s.c.setAttribute('y', s.y); s.c.setAttribute('width', (7 * k).toFixed(1)); s.c.setAttribute('height', (7 * k).toFixed(1)); });
      Tc += ((broken ? 20 - 16 * burst : 20) - Tc) * Math.min(1, dt / 0.8);
      thC.set(Tc);
      glowC.style.opacity = String(clamp((20 - Tc) / 14, 0, 0.85));
      if (broken) sayC.textContent = Tc < 8 ? '질산 암모늄이 녹으며 열 흡수 → 차갑다!' : '물주머니가 터졌다';
      else if (bounce <= 0) sayC.textContent = '주먹을 끌어내려 세게 치자';
    }
    const loop = window.Stage.loop(step);
    step(0.016);
    const btns = [...root.querySelectorAll('.share-opts button')];
    window.EA.single(btns);
    const answer = (on) => root.querySelector('#pr-dissolve').classList.toggle('answer', on);
    root._hw = { shake(n = 1) { a = clamp(a + n, 0, 1); }, strike };
    return {
      setActive(on) { if (on) loop.start(); else loop.stop(); },
      fragment(f, on) { if (f.dataset.anim === 'hw') answer(on); },
      sync(slide) { const f = slide.querySelector('[data-anim="hw"]'); answer(!!f && f.classList.contains('visible')); },
    };
  }
  window.HandPacks = { mount };
})();
