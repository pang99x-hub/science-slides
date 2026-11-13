/* 2차시: 소화기(흡수)와 아세틸렌 용접(방출) — 교과서 56쪽 해 보기 예시.
   왼쪽: 누른 채 겨누면 노즐이 손가락 쪽으로 돌고 가루가 뿜어진다. 불꽃에 맞은 가루만큼 불의 세기가 줄고(열 흡수) 이산화 탄소 막이 쌓여 산소를 막는다.
   빗나가면 불이 다시 살아난다. 오른쪽: 산소 밸브 손잡이를 돌리면(0~270°) 불꽃이 짧고 뜨거워져 쇠판 이음매가 달아오르다 녹는다.
   막대 값은 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const { el, clamp, lerp } = window.EA;
  const FX = 330, FY = 470;                        // 불 밑동
  const NZ = { x: 120, y: 380 };                   // 노즐 끝 기준점
  function mount(root) {
    const svg = root.querySelector('.ea-fw-svg');
    const now = root.querySelector('.fw-now');
    const bar = { fire: root.querySelector('.fw-fire'), co2: root.querySelector('.fw-co2'), o2: root.querySelector('.fw-o2'), steel: root.querySelector('.fw-steel') };
    const say1 = root.querySelector('.fw-say1'), say2 = root.querySelector('.fw-say2');
    el('rect', { class: 'ea-fw-bg', x: 0, y: 0, width: 520, height: 700 }, svg);
    el('rect', { class: 'ea-fw-bg2', x: 540, y: 0, width: 520, height: 700 }, svg);
    el('rect', { class: 'ea-fw-floor', x: 0, y: 600, width: 1060, height: 100 }, svg);
    // 쓰레기통 불
    el('path', { class: 'ea-fw-bin', d: `M${FX - 70} 480 L ${FX - 56} 600 H ${FX + 56} L ${FX + 70} 480 Z` }, svg);
    el('rect', { class: 'ea-fw-binr', x: FX - 76, y: 470, width: 152, height: 16, rx: 4 }, svg);
    const flames = [0, 1, 2, 3, 4, 5].map(() => el('path', { class: 'ea-fw-fl' }, svg));
    const cores = [0, 1, 2].map(() => el('path', { class: 'ea-fw-flc' }, svg));
    const blanket = el('ellipse', { class: 'ea-fw-co2', cx: FX, cy: 440, rx: 120, ry: 60 }, svg);
    const o2s = [...Array(8)].map((_, i) => { const g = el('g', { class: 'ea-fw-o2' }, svg); el('circle', { cx: -6, cy: 0, r: 6 }, g); el('circle', { cx: 6, cy: 0, r: 6 }, g); return { g, x: 160 + i * 40, y: 160 + (i % 3) * 60, vx: 30 + (i % 4) * 10, vy: 40 }; });
    el('text', { class: 'ea-fw-o2t', x: 420, y: 120, text: '산소' }, svg);
    // 소화기
    el('rect', { class: 'ea-fw-ext', x: 40, y: 420, width: 70, height: 180, rx: 24 }, svg);
    el('rect', { class: 'ea-fw-lbl', x: 50, y: 470, width: 50, height: 60, rx: 6 }, svg);
    el('text', { class: 'ea-fw-lblt', x: 75, y: 506, text: '소화기' }, svg);
    const hose = el('path', { class: 'ea-fw-hose' }, svg);
    const nozzle = el('path', { class: 'ea-fw-noz', d: 'M0 -9 L 46 -6 L 46 6 L 0 9 Z' }, svg);
    const powder = el('g', {}, svg);
    const aimHit = el('rect', { class: 'ea-fw-hit', x: 0, y: 0, width: 520, height: 600 }, svg);
    // 용접
    el('rect', { class: 'ea-fw-plate', x: 600, y: 520, width: 190, height: 36, rx: 3 }, svg);
    el('rect', { class: 'ea-fw-plate', x: 800, y: 520, width: 190, height: 36, rx: 3 }, svg);
    const seam = el('rect', { class: 'ea-fw-seam', x: 770, y: 516, width: 50, height: 44, rx: 8 }, svg);
    const bead = el('ellipse', { class: 'ea-fw-bead', cx: 795, cy: 518, rx: 0, ry: 0 }, svg);
    el('path', { class: 'ea-fw-torch', d: 'M760 300 L 790 470 L 802 468 L 786 296 Z' }, svg);
    el('path', { class: 'ea-fw-handle', d: 'M700 160 L 760 300 L 786 296 L 730 150 Z' }, svg);
    el('path', { class: 'ea-fw-hoseA', d: 'M700 160 C 660 120, 620 160, 600 120' }, svg);
    el('path', { class: 'ea-fw-hoseO', d: 'M716 152 C 700 90, 880 120, 900 90' }, svg);
    el('text', { class: 'ea-fw-ht', x: 590, y: 108, text: '아세틸렌' }, svg);
    el('text', { class: 'ea-fw-ht', x: 920, y: 84, text: '산소' }, svg);
    const clip = el('clipPath', { id: 'fw-clip' }, el('defs', {}, svg)); el('rect', { x: 540, y: 0, width: 520, height: 524 }, clip);
    const tg = el('g', { 'clip-path': 'url(#fw-clip)' }, svg);
    const tflame = el('path', { class: 'ea-fw-tf' }, tg);
    const tcone = el('path', { class: 'ea-fw-tc' }, tg);
    const soot = el('g', { class: 'ea-fw-soot' }, svg);
    const sootP = [...Array(6)].map(() => el('circle', { r: 8 }, soot));
    const rays = el('g', { class: 'ea-fw-rays' }, svg);
    for (let i = 0; i < 8; i++) { const a = -Math.PI * (0.05 + 0.9 * i / 7); el('path', { d: `M${795 + Math.cos(a) * 40} ${505 + Math.sin(a) * 40} L ${795 + Math.cos(a) * 110} ${505 + Math.sin(a) * 110}` }, rays); }
    // 밸브 손잡이
    const valve = el('g', { class: 'ea-fw-valve', tabindex: 0, role: 'slider', 'aria-label': '산소 밸브(손잡이를 돌리기, 위아래 화살표 키로도 돌린다)', 'aria-valuemin': 0, 'aria-valuemax': 100 }, svg);
    el('circle', { class: 'ea-fw-vring', cx: 940, cy: 260, r: 70 }, valve);
    const spokes = el('g', {}, valve);
    for (let i = 0; i < 6; i++) { const a = i * Math.PI / 3; el('line', { x1: 940, y1: 260, x2: 940 + Math.cos(a) * 58, y2: 260 + Math.sin(a) * 58 }, spokes); }
    el('circle', { class: 'ea-fw-vknob', cx: 940, cy: 202, r: 12 }, spokes);
    el('circle', { class: 'ea-fw-vhub', cx: 940, cy: 260, r: 14 }, valve);
    el('text', { class: 'ea-fw-vt', x: 940, y: 362, text: '산소 밸브' }, svg);

    let fire = 1, co2 = 0, spraying = false, aim = { x: FX, y: FY }, rot = 0, lastA = null, t = 0, steel = 0, parts = [], out = false;
    window.EA.drag(aimHit, svg, {
      start(p) { spraying = true; aim = p; return true; },
      move(p) { aim = p; },
      end() { spraying = false; },
    });
    window.EA.drag(valve, svg, {
      start(p) { lastA = Math.atan2(p.y - 260, p.x - 940); return true; },
      move(p) { const a = Math.atan2(p.y - 260, p.x - 940); let d = a - lastA; if (d > Math.PI) d -= Math.PI * 2; if (d < -Math.PI) d += Math.PI * 2; lastA = a; rot = clamp(rot + d * 180 / Math.PI, 0, 270); },
    });
    valve.addEventListener('keydown', (e) => { if (['ArrowUp', 'ArrowRight', 'ArrowDown', 'ArrowLeft'].includes(e.key)) { e.preventDefault(); e.stopPropagation(); rot = clamp(rot + (e.key === 'ArrowUp' || e.key === 'ArrowRight' ? 20 : -20), 0, 270); } });
    root.querySelector('.ea-fw-stage').addEventListener('dblclick', () => { fire = 1; co2 = 0; out = false; });

    function step(dt) {
      t += dt;
      // 노즐 방향
      const ang = Math.atan2(aim.y - NZ.y, aim.x - NZ.x);
      nozzle.setAttribute('transform', `translate(${NZ.x} ${NZ.y}) rotate(${(ang * 180 / Math.PI).toFixed(1)})`);
      hose.setAttribute('d', `M75 430 C 75 360, ${NZ.x - 30} ${NZ.y + 20}, ${NZ.x} ${NZ.y}`);
      if (spraying) for (let i = 0; i < 3; i++) {
        const c = el('circle', { class: 'ea-fw-pw', r: 5 }, powder);
        const sp = (Math.random() - 0.5) * 0.25, a = ang + sp, dist = Math.hypot(aim.x - NZ.x, aim.y - NZ.y);
        parts.push({ c, x0: NZ.x + Math.cos(ang) * 46, y0: NZ.y + Math.sin(ang) * 46, x1: NZ.x + Math.cos(a) * (dist + 20), y1: NZ.y + Math.sin(a) * (dist + 20), k: 0 });
      }
      let hits = 0;
      parts = parts.filter((p) => {
        p.k += dt / 0.45; const k = Math.min(1, p.k);
        const x = lerp(p.x0, p.x1, k), y = lerp(p.y0, p.y1, k);
        p.c.setAttribute('cx', x.toFixed(1)); p.c.setAttribute('cy', y.toFixed(1)); p.c.setAttribute('r', (5 + k * 6).toFixed(1));
        p.c.style.opacity = String(0.8 * (1 - k * 0.6));
        if (k >= 1) { if (Math.abs(x - FX) < 90 && y > FY - 150 * fire - 30 && y < FY + 20) hits++; p.c.remove(); return false; }
        return true;
      });
      fire = clamp(fire - hits * 0.0035 + (spraying ? 0 : dt * 0.03 * (fire > 0 ? 1 : 0)) * (1 - co2) , 0, 1);
      co2 = clamp(co2 + hits * 0.004 - dt * 0.015, 0, 1);
      if (fire <= 0.01 && !out) { out = true; fire = 0; }
      if (out) fire = 0;
      flames.forEach((f, i) => {
        const x = FX - 50 + i * 20, h = (60 + 60 * Math.sin(t * 7 + i * 1.3) * 0.3 + (i % 3) * 30) * fire, w = 20 * Math.max(0.2, fire);
        f.setAttribute('d', `M${x - w} 478 Q ${x - w * 0.6} ${478 - h * 0.6} ${x + Math.sin(t * 5 + i) * 8} ${478 - h} Q ${x + w * 0.6} ${478 - h * 0.6} ${x + w} 478 Z`);
      });
      cores.forEach((f, i) => { const x = FX - 30 + i * 30, h = 50 * fire * (0.8 + 0.2 * Math.sin(t * 8 + i)); f.setAttribute('d', `M${x - 10} 478 Q ${x} ${478 - h} ${x + 10} 478 Z`); });
      blanket.style.opacity = String(co2 * 0.75);
      o2s.forEach((o) => {
        o.x += o.vx * dt; o.y += o.vy * dt;
        if (o.x < 150 || o.x > 500) o.vx *= -1;
        const floor = 470 - 80 * co2 - 60;
        if (o.y > floor) { o.vy = -Math.abs(o.vy); o.y = floor; } if (o.y < 140) o.vy = Math.abs(o.vy);
        o.g.setAttribute('transform', `translate(${o.x.toFixed(1)} ${o.y.toFixed(1)})`);
      });
      bar.fire.style.width = (fire * 100).toFixed(0) + '%'; bar.co2.style.width = (co2 * 100).toFixed(0) + '%';
      say1.textContent = out ? '불이 꺼졌다! 가루가 열을 흡수하고 이산화 탄소가 산소를 막았다. (두 번 눌러 다시 붙이기)' : hits ? '가루가 분해되며 불의 열을 흡수한다.' : spraying ? '불꽃 밑동을 겨누자.' : '가루를 불꽃에 맞혀 보자.';
      // 토치
      const o = rot / 270;
      const len = lerp(170, 60, o), wid = lerp(34, 14, o);
      tflame.setAttribute('d', `M788 470 Q ${788 - wid} ${470 + len * 0.5} ${795 + Math.sin(t * 9) * 4} ${470 + len} Q ${802 + wid} ${470 + len * 0.5} 802 470 Z`);
      tflame.style.fill = o < 0.35 ? '#f2a73b' : o < 0.7 ? '#9ec2ff' : '#d9ecff';
      tcone.setAttribute('d', `M790 470 Q 795 ${470 + len * 0.45 * o} 800 470 Z`);
      tcone.style.opacity = String(o);
      sootP.forEach((s, i) => { const k = ((t * 0.5 + i / 6) % 1); s.setAttribute('cx', (795 + Math.sin(i * 3 + t) * 20).toFixed(1)); s.setAttribute('cy', (620 - k * 200).toFixed(1)); s.style.opacity = String((1 - o * 2.5) * (1 - k) * 0.7); });
      const target = clamp((o - 0.3) / 0.6, 0, 1);
      steel += (target - steel) * Math.min(1, dt / 1.5);
      seam.style.fill = steel < 0.05 ? '#9aa3ae' : `rgb(${Math.round(lerp(150, 255, steel))},${Math.round(lerp(60, 240, Math.max(0, steel - 0.4) / 0.6))},${Math.round(lerp(40, 200, Math.max(0, steel - 0.7) / 0.3))})`;
      bead.setAttribute('rx', (steel > 0.8 ? 30 : 0).toFixed(0)); bead.setAttribute('ry', (steel > 0.8 ? 8 : 0).toFixed(0));
      rays.style.opacity = String(o * 0.9);
      spokes.setAttribute('transform', `rotate(${rot.toFixed(1)} 940 260)`);
      valve.setAttribute('aria-valuenow', String(Math.round(o * 100)));
      bar.o2.style.width = (o * 100).toFixed(0) + '%'; bar.steel.style.width = (steel * 100).toFixed(0) + '%';
      say2.textContent = o < 0.2 ? '산소가 모자라 불꽃이 길고 누렇다(그을음).' : steel > 0.8 ? '쇠가 녹아 이어 붙는다 — 많은 빛과 열을 방출!' : o > 0.5 ? '산소와 잘 타서 불꽃이 짧고 뜨겁다.' : '밸브를 더 돌려 보자.';
      now.textContent = !out ? '① 왼쪽 그림을 누른 채 불꽃 밑동을 겨누자' : steel < 0.8 ? '② 오른쪽 산소 밸브 손잡이를 잡고 돌리자' : '③ 하나는 흡수, 하나는 방출을 이용했다';
      now.classList.toggle('done', out && steel > 0.8);
    }
    const loop = window.Stage.loop(step);
    step(0.016);
    root._fw = {
      spray(sec) { aim = { x: FX, y: FY - 40 }; spraying = true; setTimeout(() => { spraying = false; }, sec * 1000); },
      valve(f) { rot = f * 270; },
    };
    return { setActive(on) { if (on) loop.start(); else { loop.stop(); spraying = false; } } };
  }
  window.FireWeld = { mount };
})();
