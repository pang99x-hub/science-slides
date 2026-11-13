/* 2차시: 냉장고 속 냉매(교과서 56쪽 해 보기 예시). 냉매 방울을 관을 따라 앞으로만 끌어 돌린다.
   안쪽 관(증발기)을 지나는 동안 냉매가 기화하며 안의 열을 흡수 → 안쪽 온도가 (T − 3) × 0.35씩 내려간다(한 바퀴).
   압축기 → 뒤쪽 관(응축기)에서 액화하며 그 열을 방 안으로 방출 → 뒤쪽 공기가 잠깐 데워진다. 가는 관을 지나 다시 차가운 액체.
   온도 값은 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const { el, clamp, lerp } = window.EA;
  // 관의 꺾이는 점들과 구간 이름
  const P = [];
  const add = (x, y, seg) => P.push({ x, y, seg });
  add(170, 110, 'evap');
  [[470, 110], [470, 145], [170, 145], [170, 180], [470, 180], [470, 215], [170, 215], [170, 250], [470, 250]].forEach(([x, y]) => add(x, y, 'evap'));
  [[560, 250], [560, 600], [640, 600]].forEach(([x, y]) => add(x, y, 'line'));
  add(740, 600, 'comp');
  [[740, 520], [900, 520]].forEach(([x, y]) => add(x, y, 'line2'));
  [[900, 470], [620, 470], [620, 420], [900, 420], [900, 370], [620, 370], [620, 320], [900, 320], [900, 270], [620, 270], [620, 220], [900, 220], [900, 170], [620, 170], [620, 120]].forEach(([x, y]) => add(x, y, 'cond'));
  [[620, 40], [170, 40], [170, 110]].forEach(([x, y]) => add(x, y, 'exp'));

  function mount(root) {
    const svg = root.querySelector('.ea-fr-svg');
    const now = root.querySelector('.fr-now'), steps = [...root.querySelectorAll('.ea-fr-steps li')];
    const R = { laps: root.querySelector('.fr-laps'), tin: root.querySelector('.fr-tin'), tout: root.querySelector('.fr-tout') };
    // 샘플(4 px마다)
    const S = []; let L = 0;
    for (let i = 1; i < P.length; i++) {
      const a = P[i - 1], b = P[i], d = Math.hypot(b.x - a.x, b.y - a.y), n = Math.max(1, Math.round(d / 4));
      for (let k = 0; k < n; k++) S.push({ x: lerp(a.x, b.x, k / n), y: lerp(a.y, b.y, k / n), seg: b.seg === 'evap' && a.seg !== 'evap' ? 'evap' : (i === 1 ? 'evap' : b.seg), l: L + d * k / n });
      L += d;
    }
    S.forEach((s) => { s.u = s.l / L; });
    // 그림
    el('rect', { class: 'ea-fr-room', x: 0, y: 0, width: 1060, height: 700 }, svg);
    el('rect', { class: 'ea-fr-floor', x: 0, y: 650, width: 1060, height: 50 }, svg);
    el('rect', { class: 'ea-fr-cab', x: 110, y: 60, width: 420, height: 590, rx: 18 }, svg);
    const inside = el('rect', { class: 'ea-fr-in', x: 140, y: 80, width: 360, height: 545, rx: 8 }, svg);
    el('text', { class: 'ea-fr-t', x: 320, y: 690, text: '냉장고(옆에서 자른 모습)' }, svg);
    el('text', { class: 'ea-fr-t', x: 790, y: 690, text: '냉장고 뒤쪽(방 안 공기)' }, svg);
    [380, 480].forEach((y) => el('rect', { class: 'ea-fr-shelf', x: 150, y, width: 340, height: 8 }, svg));
    el('path', { class: 'ea-fr-milk', d: 'M190 380 v-90 l14 -18 h40 l14 18 v90 z' }, svg);
    el('text', { class: 'ea-fr-mt', x: 226, y: 345, text: '우유' }, svg);
    [[320, 362], [370, 362], [345, 336]].forEach(([x, y]) => el('circle', { class: 'ea-fr-apple', cx: x, cy: y, r: 20 }, svg));
    el('rect', { class: 'ea-fr-box', x: 200, y: 520, width: 240, height: 90, rx: 10 }, svg);
    el('rect', { class: 'ea-fr-comp', x: 630, y: 562, width: 130, height: 76, rx: 12 }, svg);
    el('text', { class: 'ea-fr-lt', x: 695, y: 552, text: '압축기' }, svg);
    el('text', { class: 'ea-fr-lt', x: 320, y: 98, text: '안쪽 관' }, svg);
    el('text', { class: 'ea-fr-lt', x: 760, y: 100, text: '뒤쪽 관' }, svg);
    el('text', { class: 'ea-fr-lt', x: 395, y: 30, text: '가는 관' }, svg);
    const d = 'M' + P.map((p) => `${p.x} ${p.y}`).join(' L ');
    el('path', { class: 'ea-fr-pipe', d }, svg);
    el('path', { class: 'ea-fr-flow', d }, svg);
    const heatIn = el('g', { class: 'ea-fr-hin' }, svg), heatOut = el('g', { class: 'ea-fr-hout' }, svg);
    const thIn = window.EA.thermo(svg, { x: 470, y: 600, h: 200, lo: 0, hi: 30, w: 16, cls: 'ea-fr-th' });
    const thOut = window.EA.thermo(svg, { x: 960, y: 600, h: 200, lo: 0, hi: 40, w: 16, cls: 'ea-fr-th' });
    const blob = el('g', { class: 'ea-fr-blob', tabindex: 0, role: 'slider', 'aria-label': '냉매 방울(관을 따라 끌기, 오른쪽 화살표 키로도 움직인다)' }, svg);
    const bShape = el('circle', { r: 20 }, blob);
    el('circle', { class: 'ea-fr-bhit', r: 46 }, blob);
    const bTag = el('text', { class: 'ea-fr-btag', y: -30 }, svg);

    let u = 0, laps = 0, Tin = 20, Tout = 20, idx = 0, dots = [], t = 0, moving = 0;
    const segAt = (i) => S[i].seg;
    function advanceTo(j) {
      // j: 새 샘플 번호(앞으로만, 한 바퀴를 넘으면 0부터)
      while (idx !== j) {
        const s = S[idx];
        if (s.seg === 'evap') { const n = S.filter((x) => x.seg === 'evap').length; Tin -= (Tin - 3) * (1 - Math.pow(0.65, 1 / n)); if (Math.random() < 0.08) spawn('in', s); }
        if (s.seg === 'cond') { const n = S.filter((x) => x.seg === 'cond').length; Tout += 5 / n * Math.max(0.2, (20 - Tin + 4) / 20); if (Math.random() < 0.08) spawn('out', s); }
        idx++; if (idx >= S.length) { idx = 0; laps++; }
        moving = 0.4;
      }
      u = S[idx].u;
    }
    function spawn(kind, s) {
      if (kind === 'in') { const c = el('circle', { class: 'ea-fr-hd in', r: 8 }, heatIn); dots.push({ c, x0: 240 + Math.random() * 180, y0: 300 + Math.random() * 260, x1: s.x, y1: s.y, k: 0 }); }
      else { const p = el('path', { class: 'ea-fr-hd out', d: 'M0 0 q8 -10 0 -20 q-8 -10 0 -20' }, heatOut); dots.push({ c: p, x0: s.x, y0: s.y, x1: s.x + 60 + Math.random() * 60, y1: s.y - 30, k: 0, wave: true }); }
    }
    window.EA.drag(blob, svg, {
      start() { return true; },
      move(p) {
        let best = idx, bd = Infinity;
        for (let k = 0; k < 40; k++) { const j = (idx + k) % S.length, dd = Math.hypot(S[j].x - p.x, S[j].y - p.y); if (dd < bd) { bd = dd; best = j; } }
        if (bd < 90) advanceTo(best);
        draw();
      },
    });
    blob.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); advanceTo((idx + 12) % S.length); draw(); } });
    const NAME = { evap: '기화 · 열 흡수', line: '기체', comp: '압축', line2: '뜨거운 기체', cond: '액화 · 열 방출', exp: '차가운 액체' };
    function draw() {
      const s = S[idx];
      blob.setAttribute('transform', `translate(${s.x.toFixed(1)} ${s.y.toFixed(1)})`);
      const seg = s.seg;
      const evapK = seg === 'evap' ? S.filter((x) => x.seg === 'evap' && x.l <= s.l).length / S.filter((x) => x.seg === 'evap').length : 0;
      bShape.setAttribute('class', 'ea-fr-b ' + (seg === 'exp' || (seg === 'evap' && evapK < 0.5) ? 'liq' : seg === 'comp' || seg === 'line2' || (seg === 'cond' && s.l < S.find((x) => x.seg === 'cond').l + 400) ? 'hot' : seg === 'cond' ? 'liq' : 'gas'));
      bTag.setAttribute('x', s.x); bTag.setAttribute('y', s.y - 30); bTag.textContent = NAME[seg];
      const key = seg === 'line' ? 'comp' : seg === 'line2' ? 'cond' : seg;
      steps.forEach((li) => li.classList.toggle('on', li.dataset.k === key));
      R.laps.textContent = String(laps); R.tin.textContent = `${Math.round(Tin)} °C`; R.tout.textContent = `${Math.round(Tout)} °C`;
      thIn.set(Tin); thOut.set(Tout);
      inside.style.fill = window.EA.tcol(Tin, 0, 20, 40);
      now.textContent = laps === 0 && idx < 20 ? '① 파란 냉매 방울을 잡고 화살표 방향으로 관을 따라 끌자' : laps < 3 ? '② 계속 돌려 보자 — 안쪽 온도계를 보자' : '③ 안은 차갑고, 뒤쪽은 따뜻하다. 열은 어디로 갔을까?';
      now.classList.toggle('done', laps >= 3);
    }
    function step(dt) {
      t += dt;
      Tout += (20 - Tout) * Math.min(1, dt / 6);
      Tin += (20 - Tin) * Math.min(1, dt / 400);
      moving = Math.max(0, moving - dt);
      dots = dots.filter((o) => {
        o.k += dt / 0.9; const k = Math.min(1, o.k);
        const x = lerp(o.x0, o.x1, k), y = lerp(o.y0, o.y1, k);
        if (o.wave) o.c.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`); else { o.c.setAttribute('cx', x.toFixed(1)); o.c.setAttribute('cy', y.toFixed(1)); }
        o.c.style.opacity = String(1 - k * 0.7);
        if (k >= 1) { o.c.remove(); return false; } return true;
      });
      R.tout.textContent = `${Math.round(Tout)} °C`; thOut.set(Tout);
      svg.querySelector('.ea-fr-flow').style.strokeDashoffset = String(-t * 30);
    }
    draw();
    const loop = window.Stage.loop(step);
    root._fr = {
      push(f) { const j = S.findIndex((s) => s.u >= f); advanceTo(j < 0 ? 0 : j); draw(); },
      laps(n) { for (let i = 0; i < n; i++) advanceTo((idx + S.length - 1) % S.length), advanceTo((idx + 1) % S.length); draw(); },
    };
    return { setActive(on) { if (on) loop.start(); else loop.stop(); } };
  }
  window.FridgeLoop = { mount };
})();
