/* 2차시: 물 하나로 데우기도, 식히기도 — 디지털 온도계를 끌어 장면마다 두 곳의 온도를 재어 견준다.
   과수원(응고 = 방출), 한여름 도로(기화 = 흡수), 카페 우유(액화 = 방출), 소금 얼음물(소금이 녹음 = 흡수).
   온도는 모두 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const { el, clamp, lerp } = window.EA;
  const SC = {
    orch: { o: [10, 10], spots: [{ x: 150, y: 190, T: 0, lab: '물 뿌린 꽃' }, { x: 360, y: 190, T: -4, lab: '안 뿌린 꽃' }], dir: 'out', why: '물이 얼며 방출 → 꽃이 0 °C 아래로 안 내려간다' },
    road: { o: [540, 10], spots: [{ x: 150, y: 250, T: 33, lab: '물 뿌린 길' }, { x: 370, y: 250, T: 48, lab: '마른 길' }], dir: 'in', why: '물이 증발하며 흡수 → 길이 식는다' },
    cafe: { o: [10, 340], spots: [{ x: 160, y: 220, T: 60, lab: '수증기 넣은 우유' }, { x: 380, y: 220, T: 5, lab: '처음 우유' }], dir: 'out', why: '수증기가 물이 되며 방출 → 우유가 데워진다' },
    salt: { o: [540, 340], spots: [{ x: 140, y: 220, T: -6, lab: '얼음물 + 소금' }, { x: 360, y: 220, T: 0, lab: '얼음물만' }], dir: 'in', why: '소금이 녹으며 흡수 → 더 차가워진다' },
  };
  function scene(g, k) {
    const a = (t, at) => el(t, at, g);
    if (k === 'orch') {
      a('rect', { class: 'ea-pb-dawn', width: 500, height: 310, rx: 10 });
      a('text', { class: 'ea-pb-st', x: 16, y: 32, text: '과수원 · 꽃 피는 철 새벽 영하' });
      [150, 360].forEach((x, i) => {
        a('path', { class: 'ea-pb-branch', d: `M${x - 90} 290 Q ${x - 20} 220 ${x + 30} 120` });
        [[x - 10, 180], [x + 18, 150], [x - 30, 220]].forEach(([bx, by]) => { for (let p = 0; p < 5; p++) { const an = p * Math.PI * 2 / 5; a('circle', { class: 'ea-pb-pet', cx: bx + Math.cos(an) * 9, cy: by + Math.sin(an) * 9, r: 7 }); } a('circle', { class: 'ea-pb-pc', cx: bx, cy: by, r: 5 }); });
        if (i === 0) { a('path', { class: 'ea-pb-ice', d: `M${x - 50} 140 q60 -20 100 30 q-10 70 -80 90 q-40 -50 -20 -120z` }); for (let d = 0; d < 7; d++) a('line', { class: 'ea-pb-drop', x1: x - 60 + d * 18, y1: 60, x2: x - 64 + d * 18, y2: 76 }); a('text', { class: 'ea-pb-small', x: x, y: 52, text: '물 뿌리개' }); }
      });
    } else if (k === 'road') {
      a('rect', { class: 'ea-pb-hot', width: 500, height: 310, rx: 10 });
      a('text', { class: 'ea-pb-st', x: 16, y: 32, text: '한여름 한낮의 도로' });
      a('circle', { class: 'ea-pb-sun', cx: 440, cy: 60, r: 30 });
      a('path', { class: 'ea-pb-road', d: 'M0 200 H500 V300 H0 Z' });
      a('path', { class: 'ea-pb-wet', d: 'M0 200 H250 V300 H0 Z' });
      for (let i = 0; i < 4; i++) a('path', { class: 'ea-pb-shim', d: `M${300 + i * 45} 190 q-6 -10 0 -20 q6 -10 0 -20` });
      for (let i = 0; i < 4; i++) a('path', { class: 'ea-pb-vapor', d: `M${40 + i * 55} 190 q-6 -12 0 -24` });
    } else if (k === 'cafe') {
      a('rect', { class: 'ea-pb-cafe', width: 500, height: 310, rx: 10 });
      a('text', { class: 'ea-pb-st', x: 16, y: 32, text: '카페 · 우유 데우기' });
      a('rect', { class: 'ea-pb-mach', x: 40, y: 50, width: 160, height: 80, rx: 8 });
      a('path', { class: 'ea-pb-wand', d: 'M150 130 L 165 230' });
      a('path', { class: 'ea-pb-pitch', d: 'M110 190 h100 l-10 90 h-80 z' });
      a('rect', { class: 'ea-pb-milk', x: 114, y: 210, width: 92, height: 66 });
      for (let i = 0; i < 4; i++) a('circle', { class: 'ea-pb-steam', cx: 140 + i * 16, cy: 205 - (i % 2) * 8, r: 7 });
      a('path', { class: 'ea-pb-carton', d: 'M340 280 v-110 l20 -24 h40 l20 24 v110 z' });
      a('text', { class: 'ea-pb-small', x: 380, y: 300, text: '냉장고에서 꺼낸 우유' });
    } else {
      a('rect', { class: 'ea-pb-kit', width: 500, height: 310, rx: 10 });
      a('text', { class: 'ea-pb-st', x: 16, y: 32, text: '얼음물에 음료 식히기' });
      [140, 360].forEach((x, i) => {
        a('path', { class: 'ea-pb-bowl', d: `M${x - 100} 180 h200 q-10 100 -100 100 q-90 0 -100 -100z` });
        a('rect', { class: 'ea-pb-iw', x: x - 92, y: 186, width: 184, height: 20 });
        [[-60, 186], [40, 190], [-10, 196]].forEach(([dx, dy]) => a('rect', { class: 'i-ice', x: x + dx, y: dy, width: 26, height: 22, rx: 4 }));
        a('rect', { class: 'ea-pb-can', x: x + 50, y: 120, width: 34, height: 70, rx: 6 });
        if (i === 0) { a('path', { class: 'ea-pb-shaker', d: `M${x - 40} 70 h30 v40 h-30 z` }); for (let d = 0; d < 6; d++) a('rect', { class: 'ea-pb-salt', x: x - 30 + (d % 3) * 6, y: 120 + d * 10, width: 5, height: 5 }); a('text', { class: 'ea-pb-small', x: x - 25, y: 62, text: '소금' }); }
      });
    }
  }
  function mount(root) {
    const svg = root.querySelector('.ea-pb-svg');
    const now = root.querySelector('.pb-now'), msg = root.querySelector('.pb-msg');
    const rows = Object.fromEntries([...root.querySelectorAll('.ea-pb-row')].map((r) => [r.dataset.k, r]));
    const spots = [];
    for (const [k, s] of Object.entries(SC)) {
      const g = el('g', { transform: `translate(${s.o[0]} ${s.o[1]})` }, svg);
      scene(g, k);
      s.spots.forEach((p, i) => {
        const ring = el('circle', { class: 'ea-pb-spot', cx: p.x, cy: p.y, r: 24 }, g);
        const tag = el('text', { class: 'ea-pb-tag', x: p.x, y: p.y + 48, text: p.lab }, g);
        spots.push({ k, i, x: s.o[0] + p.x, y: s.o[1] + p.y, T: p.T, ring, tag, done: false });
      });
    }
    const HOME = { x: 990, y: 600 };
    el('text', { class: 'ea-pb-home', x: HOME.x - 60, y: 690, text: '' }, svg);
    const pr = el('g', { class: 'ea-pb-probe', tabindex: 0, role: 'button', 'aria-label': '디지털 온도계(끌어서 동그라미에 대기, Enter를 누르면 다음 동그라미를 잰다)' }, svg);
    el('rect', { class: 'ea-pb-body', x: -38, y: -150, width: 76, height: 96, rx: 14 }, pr);
    el('rect', { class: 'ea-pb-scr', x: -30, y: -140, width: 60, height: 36, rx: 4 }, pr);
    const read = el('text', { class: 'ea-pb-read', x: 0, y: -114 }, pr);
    el('line', { class: 'ea-pb-stick', x1: 0, y1: -54, x2: 0, y2: 0 }, pr);
    el('rect', { class: 'ea-pb-phit', x: -60, y: -170, width: 120, height: 180 }, pr);
    let pos = { ...HOME }, shown = 20, target = null, held = false;
    function nearest(p) { let b = null, bd = 46; spots.forEach((s) => { const d = Math.hypot(s.x - p.x, s.y - p.y); if (d < bd) { bd = d; b = s; } }); return b; }
    function record(s) {
      s.done = true; s.ring.classList.add('done');
      const sc = SC[s.k], both = spots.filter((x) => x.k === s.k);
      const v = rows[s.k].querySelector('.pb-v');
      v.textContent = both.map((x) => x.done ? `${x.T} °C` : '?').join(' / ');
      if (both.every((x) => x.done)) {
        rows[s.k].classList.add(sc.dir); rows[s.k].querySelector('em').textContent = sc.dir === 'in' ? '흡수' : '방출';
        msg.textContent = sc.why + '.';
      } else msg.textContent = `${s.tag.textContent}: ${s.T} °C. 같은 장면의 다른 곳도 재 보자.`;
      const n = spots.filter((x) => x.done).length;
      now.textContent = n < 8 ? '② 장면마다 두 곳을 재서 견주자' : '③ 네 장면에서 물(소금)은 흡수했나, 방출했나?';
      now.classList.toggle('done', n === 8);
    }
    window.EA.drag(pr, svg, {
      start() { held = true; return true; },
      move(p) { pos = { x: clamp(p.x, 20, 1040), y: clamp(p.y + 70, 60, 690) }; target = nearest(pos); },
      end() { held = false; if (target && !target.done) record(target); },
    });
    pr.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); const s = spots.find((x) => !x.done); if (s) { pos = { x: s.x, y: s.y }; target = s; record(s); } } });
    function step(dt) {
      const goal = target ? target.T : 20;
      shown += (goal - shown) * Math.min(1, dt / 0.35);
      read.textContent = `${shown.toFixed(1)}`;
      pr.setAttribute('transform', `translate(${pos.x.toFixed(1)} ${pos.y.toFixed(1)})`);
      spots.forEach((s) => s.ring.classList.toggle('near', s === target));
    }
    const loop = window.Stage.loop(step);
    step(0.016);
    root._pb = { all() { spots.forEach((s) => { if (!s.done) { pos = { x: s.x, y: s.y }; target = s; record(s); } }); } };
    return { setActive(on) { if (on) loop.start(); else loop.stop(); } };
  }
  window.ProbeScenes = { mount };
})();
