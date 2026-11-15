/* 탐구 «개체군 변동 모의실험하기»(교과서 79쪽)를 화면에서: 투명 뚜껑(참새)을 끌어 던지면 판 위를 미끄러져 멈추고, 뚜껑 안의 클립(메뚜기)을 잡아먹는다.
   규칙(이 화면의 모델 — window.HopperRule로 3장 모의실험기와 같이 쓴다):
     3마리마다 다음 세대 참새 1마리(3마리 미만이면 굶어 사라짐) · 남은 메뚜기는 두 배(판에는 100마리까지) · 참새가 모두 사라지면 1마리가 날아온다.
   뚜껑 넓이는 판 넓이의 8 %(반지름 101 / 판 720×560) — 그래서 메뚜기 한 마리가 한 뚜껑에 잡힐 확률이 약 0.08. */
(function () {
  'use strict';
  const { el, pt, clamp, rng } = window.Eco;
  const RULE = window.HopperRule = { p: 0.08, need: 3, mult: 2, cap: 100, g0: 20, s0: 3 };
  const BX0 = 168, BY0 = 20, BX1 = 888, BY1 = 580, LR = 101;
  const ZL = [80, 300], ZR = [976, 300];

  function mount(root) {
    const svg = root.querySelector('.th-svg'), now = root.querySelector('.th-now'), msg = root.querySelector('.th-msg');
    const gEl = root.querySelector('.th-g'), sEl = root.querySelector('.th-s'), hEl = root.querySelector('.th-h');
    const chart = root.querySelector('.th-chart');
    let R = rng(3);
    el('rect', { class: 'th-bg', x: -400, y: -300, width: 1856, height: 1300 }, svg);
    el('rect', { class: 'th-zone', x: 8, y: BY0, width: 146, height: BY1 - BY0, rx: 14 }, svg);
    el('rect', { class: 'th-zone r', x: 902, y: BY0, width: 146, height: BY1 - BY0, rx: 14 }, svg);
    el('text', { class: 'th-zt', x: 81, y: BY1 - 14 }, svg).textContent = '사냥 준비';
    el('text', { class: 'th-zt', x: 975, y: BY1 - 14 }, svg).textContent = '살아남은 참새';
    el('rect', { class: 'th-board', x: BX0, y: BY0, width: BX1 - BX0, height: BY1 - BY0, rx: 10 }, svg);
    const tex = el('g', { class: 'th-tex' }, svg);
    for (let i = 0; i < 70; i++) { const x = BX0 + 10 + R() * 700, y = BY0 + 10 + R() * 540; el('path', { d: `M${x.toFixed(0)} ${y.toFixed(0)} l 4 -10 M ${(x + 6).toFixed(0)} ${y.toFixed(0)} l -2 -12` }, tex); }
    for (let i = 0; i < 6; i++) el('ellipse', { class: 'th-rock', cx: BX0 + 40 + R() * 640, cy: BY0 + 30 + R() * 500, rx: 14 + R() * 10, ry: 8 + R() * 5 }, svg);
    const clipLayer = el('g', {}, svg), lidLayer = el('g', {}, svg);

    let clips = [], lids = [], gen = 0, rec = [], busy = false, thrownTotal = 0;
    function addClip() {
      const x = BX0 + 18 + R() * (BX1 - BX0 - 36), y = BY0 + 14 + R() * (BY1 - BY0 - 28), a = Math.round(R() * 180);
      const e = el('g', { class: 'th-clip', transform: `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${a})` }, clipLayer);
      el('rect', { x: -13, y: -6, width: 26, height: 12, rx: 6 }, e); el('path', { d: 'M-8 0 h 14' }, e);
      clips.push({ x, y, e, alive: true });
    }
    function makeLid(cls = '') {
      const g = el('g', { class: `th-lid ${cls}`.trim(), tabindex: '0', role: 'button', 'aria-label': '참새 뚜껑' }, lidLayer);
      el('circle', { r: LR }, g); el('circle', { class: 'th-rim', r: LR - 10 }, g);
      const ic = window.Eco.org(g, 'sparrow', 0, 18, 1.2); ic.classList.add('th-bird');
      const lab = el('text', { class: 'th-lab', y: LR - 22 }, g);
      const L = { g, lab, x: ZL[0], y: ZL[1], s: 0.45, state: 'ready', catch: 0, vx: 0, vy: 0 };
      bindLid(L); lids.push(L); return L;
    }
    const put = (L) => L.g.setAttribute('transform', `translate(${L.x.toFixed(1)} ${L.y.toFixed(1)}) scale(${L.s.toFixed(3)})`);
    // 구역 안 자리: 수가 많으면 작게 여러 줄로
    function slots(n, z) {
      const cols = n <= 4 ? 1 : n <= 10 ? 2 : 3, s = cols === 1 ? 0.55 : cols === 2 ? 0.32 : 0.22, rows = Math.ceil(n / cols), gap = Math.min(128, 520 / Math.max(rows, 1));
      return Array.from({ length: n }, (_, i) => ({ x: z[0] + ((i % cols) - (cols - 1) / 2) * (cols === 2 ? 66 : 44), y: BY0 + 70 + Math.floor(i / cols) * gap, s }));
    }
    function arrange(state, z, animate = true) {
      const L = lids.filter((l) => l.state === state), S = slots(L.length, z);
      L.forEach((l, i) => { const t = S[i]; if (animate && window.gsap) gsap.to(l, { x: t.x, y: t.y, s: t.s, duration: 0.45, ease: 'power2.out', onUpdate: () => put(l) }); else { Object.assign(l, t); put(l); } });
    }
    // 던지기
    function bindLid(L) {
      let trail = [], on = false;
      L.g.addEventListener('pointerdown', (e) => {
        if (L.state !== 'ready' || busy) return;
        e.preventDefault(); e.stopPropagation(); on = true;
        lidLayer.appendChild(L.g); L.g.setPointerCapture(e.pointerId);   // 맨 앞으로 옮긴 뒤 붙잡는다(옮기면 붙잡기가 풀린다)
        const p = pt(svg, e); trail = [[p.x, p.y, performance.now()]];
        L.state = 'held'; L.g.classList.add('held');
        if (window.gsap) gsap.killTweensOf(L);
        if (window.gsap) gsap.to(L, { s: 1, x: p.x, y: p.y, duration: 0.15, onUpdate: () => put(L) }); else { L.s = 1; L.x = p.x; L.y = p.y; put(L); }
      });
      L.g.addEventListener('pointermove', (e) => {
        if (!on) return; const p = pt(svg, e), t = performance.now();
        trail.push([p.x, p.y, t]); while (trail.length > 2 && t - trail[0][2] > 90) trail.shift();
        L.x = p.x; L.y = p.y; L.s = 1; put(L);
      });
      const up = () => {
        if (!on) return; on = false; L.g.classList.remove('held');
        const a = trail[0], b = trail[trail.length - 1], dt = Math.max(16, b[2] - a[2]) / 1000;
        let vx = (b[0] - a[0]) / dt, vy = (b[1] - a[1]) / dt; const sp = Math.hypot(vx, vy);
        if (sp > 2600) { vx *= 2600 / sp; vy *= 2600 / sp; }
        if (L.x < BX0 - 20 && sp < 150) { L.state = 'ready'; arrange('ready', ZL); return; }   // 그냥 집었다 놓으면 제자리로
        L.vx = vx; L.vy = vy; L.state = 'fly'; startLoop();
      };
      L.g.addEventListener('pointerup', up); L.g.addEventListener('pointercancel', up);
      L.g.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && L.state === 'ready') { e.preventDefault(); e.stopPropagation(); autoOne(L); } });
    }
    let raf = 0, lastT = 0;
    function startLoop() { if (!raf) { lastT = performance.now(); raf = requestAnimationFrame(tick); } }
    function tick(t) {
      const dt = Math.min(0.04, (t - lastT) / 1000); lastT = t; let any = false;
      lids.forEach((L) => {
        if (L.state !== 'fly') return; any = true;
        L.x += L.vx * dt; L.y += L.vy * dt;
        const k = Math.exp(-3.4 * dt); L.vx *= k; L.vy *= k;
        const inside = L.x > BX0 + LR * 0.3 && L.x < BX1 - LR * 0.3;
        if (inside) {   // 판 가장자리에서 튕긴다
          if (L.x < BX0 + LR) { L.x = BX0 + LR; L.vx = Math.abs(L.vx) * 0.5; }
          if (L.x > BX1 - LR) { L.x = BX1 - LR; L.vx = -Math.abs(L.vx) * 0.5; }
          if (L.y < BY0 + LR) { L.y = BY0 + LR; L.vy = Math.abs(L.vy) * 0.5; }
          if (L.y > BY1 - LR) { L.y = BY1 - LR; L.vy = -Math.abs(L.vy) * 0.5; }
        }
        if (Math.hypot(L.vx, L.vy) < 40) {
          L.x = clamp(L.x, BX0 + LR, BX1 - LR); L.y = clamp(L.y, BY0 + LR, BY1 - LR);
          land(L);
        }
        put(L);
      });
      raf = any ? requestAnimationFrame(tick) : 0;
    }
    function land(L) {
      L.state = 'landed'; thrownTotal++;
      const got = clips.filter((c) => c.alive && Math.hypot(c.x - L.x, c.y - L.y) <= LR - 6);
      got.forEach((c) => { c.alive = false; c.e.classList.add('eaten'); if (window.gsap) gsap.to(c.e, { attr: { transform: `translate(${L.x.toFixed(1)} ${L.y.toFixed(1)}) scale(.3)` }, opacity: 0, duration: 0.5, delay: 0.1 }); });
      L.catch = got.length; L.lab.textContent = `${got.length}마리`;
      L.g.classList.add(got.length >= RULE.need ? 'fed' : 'hungry');
      msg.textContent = got.length ? `뚜껑 안의 메뚜기 ${got.length}마리를 잡아먹었다${got.length >= RULE.need ? ' — 살아남을 수 있다' : ` — ${RULE.need}마리가 안 되어 굶는다`}` : '빈 곳에 떨어져 한 마리도 못 잡았다';
      paint();
    }
    function autoOne(L, delay = 0) {
      L.state = 'fly-auto'; lidLayer.appendChild(L.g);
      const tx = BX0 + LR + R() * (BX1 - BX0 - 2 * LR), ty = BY0 + LR + R() * (BY1 - BY0 - 2 * LR);
      if (window.gsap) gsap.to(L, { x: tx, y: ty, s: 1, duration: 0.55, delay, ease: 'power2.out', onUpdate: () => put(L), onComplete: () => land(L) });
      else { L.x = tx; L.y = ty; L.s = 1; put(L); land(L); }
    }
    function autoAll() { if (busy) return; lids.filter((l) => l.state === 'ready').forEach((l, i) => autoOne(l, i * 0.22)); }
    function endGen() {
      if (busy) return;
      const ready = lids.filter((l) => l.state === 'ready' || l.state === 'fly' || l.state === 'fly-auto' || l.state === 'held');
      if (ready.length) { msg.textContent = '아직 던지지 않은 뚜껑이 있다 — 모두 던진 뒤 세대를 마치자'; return; }
      busy = true;
      let born = 0, died = 0, lived = 0;
      lids.filter((l) => l.state === 'landed').forEach((L) => {
        const k = Math.floor(L.catch / RULE.need);
        L.lab.textContent = ''; L.g.classList.remove('fed', 'hungry');
        if (k === 0) { died++; L.state = 'dead'; L.g.classList.add('dead'); if (window.gsap) gsap.to(L.g, { opacity: 0, duration: 0.5, onComplete: () => L.g.remove() }); else L.g.remove(); }
        else { lived++; L.state = 'safe'; for (let j = 1; j < k; j++) { born++; const b = makeLid('baby'); Object.assign(b, { x: L.x, y: L.y, s: 0.3, state: 'safe' }); put(b); } }
      });
      lids = lids.filter((l) => l.state !== 'dead');
      let came = 0;
      if (!lids.length) { came = 1; const n = makeLid('new'); Object.assign(n, { x: 1080, y: 80, s: 0.4, state: 'safe' }); put(n); }
      clips.filter((c) => !c.alive).forEach((c) => setTimeout(() => c.e.remove(), 600));
      clips = clips.filter((c) => c.alive);
      const before = clips.length, after = Math.min(RULE.cap, Math.round(before * RULE.mult));
      for (let i = before; i < after; i++) addClip();
      clips.slice(before).forEach((c) => { if (window.gsap) gsap.from(c.e, { opacity: 0, duration: 0.6, delay: 0.3 }); });
      gen++; rec.push([gen, lids.length, clips.length]);
      arrange('safe', ZR);
      msg.textContent = `${gen}세대: 살아남은 참새 ${lived}, 새끼 ${born}, 굶어 사라진 참새 ${died}${came ? ', 다른 곳에서 날아온 참새 1' : ''} · 메뚜기 ${before} → ${after}마리`;
      paint();
      setTimeout(() => { lids.forEach((l) => { l.state = 'ready'; l.g.classList.remove('baby', 'new'); }); arrange('ready', ZL); busy = false; paint(); }, 900);
    }
    function reset() {
      if (window.gsap) lids.forEach((l) => gsap.killTweensOf(l));
      clipLayer.innerHTML = ''; lidLayer.innerHTML = ''; clips = []; lids = []; gen = 0; thrownTotal = 0; busy = false; R = rng(3 + Math.floor(Math.random() * 1000));
      for (let i = 0; i < RULE.g0; i++) addClip();
      for (let i = 0; i < RULE.s0; i++) makeLid();
      arrange('ready', ZL, false);
      rec = [[0, RULE.s0, RULE.g0]]; msg.textContent = ''; paint();
    }
    function paintChart() {
      chart.innerHTML = '';
      const W = 540, H = 230, x0 = 46, x1 = W - 46, y0 = H - 30, y1 = 14, gmax = Math.max(10, gen), smax = Math.max(10, ...rec.map((r) => r[1]));
      const X = (g) => x0 + g / gmax * (x1 - x0), YH = (v) => y0 - v / 100 * (y0 - y1), YS = (v) => y0 - v / smax * (y0 - y1);
      el('rect', { class: 'th-cbg', x: x0, y: y1, width: x1 - x0, height: y0 - y1 }, chart);
      [0, 50, 100].forEach((v) => el('text', { class: 'th-ct h', x: x0 - 6, y: YH(v) + 6 }, chart).textContent = v);
      [0, smax].forEach((v) => el('text', { class: 'th-ct s', x: x1 + 6, y: YS(v) + 6 }, chart).textContent = v);
      el('text', { class: 'th-ct', x: (x0 + x1) / 2, y: H - 4 }, chart).textContent = `세대 (0~${gmax})`;
      const path = (f, k) => rec.map((r, i) => `${i ? 'L' : 'M'}${X(r[0]).toFixed(1)} ${f(r[k]).toFixed(1)}`).join(' ');
      el('path', { class: 'th-cl h', d: path(YH, 2) }, chart); el('path', { class: 'th-cl s', d: path(YS, 1) }, chart);
      rec.forEach((r) => { el('circle', { class: 'th-cd h', cx: X(r[0]), cy: YH(r[2]), r: 4 }, chart); el('circle', { class: 'th-cd s', cx: X(r[0]), cy: YS(r[1]), r: 4 }, chart); });
      el('text', { class: 'th-cn h', x: x0 + 8, y: y1 + 20 }, chart).textContent = '메뚜기(왼쪽)';
      el('text', { class: 'th-cn s', x: x1 - 8, y: y1 + 20 }, chart).textContent = '참새(오른쪽)';
    }
    function paint() {
      gEl.textContent = gen; sEl.textContent = lids.length; hEl.textContent = clips.filter((c) => c.alive).length;
      const ready = lids.filter((l) => l.state === 'ready').length, moving = lids.some((l) => /fly|held/.test(l.state));
      now.textContent = busy ? '다음 세대를 준비한다' : ready ? (thrownTotal ? `남은 뚜껑 ${ready}개 — 계속 던져 보자` : '왼쪽 뚜껑을 끌어 판 위로 던져 보자') : moving ? '뚜껑이 멈추기를 기다리자' : '«세대 마치기»를 눌러 보자';
      now.classList.toggle('done', !ready && !moving && !busy);
      paintChart();
    }
    root.querySelector('#th-auto').addEventListener('click', autoAll);
    root.querySelector('#th-next').addEventListener('click', endGen);
    root.querySelector('#th-reset').addEventListener('click', reset);
    reset();
    root._th = { get thrown() { return thrownTotal; }, get gen() { return gen; }, auto: autoAll, next: endGen };
    return { setActive(on) { if (on) arrange('ready', ZL, false); } };
  }
  window.LidToss = { mount };
})();
