/* 생태계평형의 유지(교과서 77쪽 그림 Ⅱ-7): 생산자·1차·2차 소비자 세 층 피라미드. 층 끝 손잡이를 끌어 개체수를 바꾸고 놓으면
   먹이 관계 모델이 돌아가 세 층이 번갈아 늘고 줄며 평형으로 돌아온다. 2차 소비자를 거의 다 없애면 사라져 새 상태로 굳는다.
   모델(평형값을 1로 맞춘 단순 먹이 사슬): dP = 2P(1 − P/2) − PH,  dH = 1.5PH − 0.5H − HC,  dC = HC − C  (C < 0.04이면 사라짐) */
(function () {
  'use strict';
  const { el, pt, clamp, org } = window.Eco;
  const CX = 528, TH = 96, BASE = 392, WEQ = [700, 440, 200], NAME = ['생산자', '1차 소비자', '2차 소비자'];
  const KIND = ['grass', 'rabbit', 'hawk'], ISCALE = [0.95, 0.9, 0.85], COL = ['var(--lv0)', 'var(--lv1)', 'var(--lv2)'];
  const GX0 = 120, GX1 = 1010, GY0 = 668, GY1 = 470, TMAX = 24, VMAX = 2.8;

  function mount(root) {
    const svg = root.querySelector('.bl-svg'), now = root.querySelector('.bl-now'), msg = root.querySelector('.bl-msg');
    const steps = [...root.querySelectorAll('.bl-steps li')], back = root.querySelector('#bl-back');
    el('rect', { class: 'bl-bg', x: -400, y: -300, width: 1856, height: 1300 }, svg);
    el('path', { class: 'bl-ground', d: `M-400 ${BASE} H 1456` }, svg);
    let v = [1, 1, 1], t = 0, run = false, dragging = -1, extinct = false, touched = false;
    const tiers = [0, 1, 2].map((i) => {
      const y = BASE - (i + 1) * TH;
      const g = el('g', { class: 'bl-tier' }, svg);
      const eq = el('rect', { class: 'bl-eq', x: CX - WEQ[i] / 2, y: y + 4, width: WEQ[i], height: TH - 8, rx: 10 }, g);
      const body = el('rect', { class: 'bl-body', y: y + 4, height: TH - 8, rx: 10, style: `fill:${COL[i]}` }, g);
      const clip = el('clipPath', { id: `bl-clip-${i}` }, g); const cr = el('rect', { y: y + 4, height: TH - 8, rx: 10 }, clip);
      const icons = el('g', { 'clip-path': `url(#bl-clip-${i})` }, g);
      for (let k = 0; k < 15; k++) org(icons, KIND[i], CX + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 66, y + TH - 14, ISCALE[i], k % 2 === 1);
      el('text', { class: 'bl-name', x: 28, y: y + TH / 2 + 9 }, g).textContent = NAME[i];
      const hd = el('g', { class: 'bl-handle', tabindex: '0', role: 'slider', 'aria-label': `${NAME[i]} 개체수`, 'aria-valuemin': '0', 'aria-valuemax': '2' }, g);
      el('circle', { class: 'bl-hhit', r: 46 }, hd); el('circle', { class: 'bl-hc', r: 26 }, hd);
      el('path', { class: 'bl-ha', d: 'M-14 0 h 28 M -14 0 l 7 -7 M -14 0 l 7 7 M 14 0 l -7 -7 M 14 0 l -7 7' }, hd);
      const read = el('text', { class: 'bl-read', y: y + TH / 2 + 8 }, g);
      return { y, eq, body, cr, hd, read, i };
    });
    // 그래프
    const gg = el('g', { class: 'bl-graph' }, svg);
    el('rect', { class: 'bl-gbg', x: GX0, y: GY1 - 14, width: GX1 - GX0, height: GY0 - GY1 + 14 }, gg);
    el('path', { class: 'bl-axis', d: `M${GX0} ${GY1 - 14} V ${GY0} H ${GX1}` }, gg);
    const yv = (val) => GY0 - (GY0 - GY1) * Math.min(val, VMAX) / VMAX;
    el('path', { class: 'bl-one', d: `M${GX0} ${yv(1)} H ${GX1}` }, gg);
    el('text', { class: 'bl-ax', x: GX0 - 10, y: yv(1) + 7 }, gg).textContent = '평형';
    el('text', { class: 'bl-ax', x: GX0 - 10, y: GY0 + 6 }, gg).textContent = '0';
    el('text', { class: 'bl-ax', x: GX1, y: GY0 + 28 }, gg).textContent = '시간 →';
    el('text', { class: 'bl-ax l', x: GX0 + 6, y: GY1 - 22 }, gg).textContent = '개체수(평형일 때를 1로)';
    const lines = [0, 1, 2].map((i) => el('path', { class: 'bl-line', style: `stroke:${COL[i]}` }, gg));
    const leg = el('g', { class: 'bl-leg', transform: `translate(${GX1 - 380} ${GY1 - 30})` }, gg);
    NAME.forEach((n, i) => { el('rect', { x: i * 132, y: -12, width: 22, height: 10, rx: 3, style: `fill:${COL[i]}` }, leg); el('text', { x: i * 132 + 28, y: 0 }, leg).textContent = n; });
    let hist = [];

    function deriv(P, H, C) { return [2 * P * (1 - P / 2) - P * H, 1.5 * P * H - 0.5 * H - H * C, H * C - C]; }
    let lastD = [0, 0, 0];
    function sim(dt) {
      const n = Math.ceil(dt / 0.01), h = dt / n;
      for (let k = 0; k < n; k++) {
        const d = deriv(v[0], v[1], v[2]);
        v = v.map((x, i) => Math.max(0, x + d[i] * h)); lastD = d;
        if (v[2] < 0.04 && v[2] > 0) { v[2] = 0; extinct = true; }
        if (v[0] < 0.02) v[0] = 0.02;
      }
      t += dt;
    }
    function step(dt) {
      if (run && dragging < 0) {
        sim(dt * 1.5);
        hist.push([t, ...v]);
        while (hist.length && hist[0][0] < t - TMAX) hist.shift();
        const still = Math.max(...lastD.map(Math.abs)) < 0.004;
        if (still) run = false;
      }
      paint();
    }
    function phase() {
      const [P, H, C] = v, [dP, dH, dC] = lastD;
      if (extinct) return -1;
      if (Math.abs(P - 1) < 0.04 && Math.abs(H - 1) < 0.04 && Math.abs(C - 1) < 0.04) return 0;
      if (C < 1 && dH > 0) return 1;
      if (H > 1 && dC > 0) return 2;
      if (C > 1 && dH < 0) return 3;
      if (H < 1 && dP > 0) return 4;
      return null;
    }
    const word = (x) => (x < 0.05 ? '사라짐' : x < 0.85 ? '평형보다 적다' : x > 1.15 ? '평형보다 많다' : '평형 가까이');
    let lastPh = 0;
    function paint() {
      tiers.forEach((tr, i) => {
        const w = Math.min(1000, WEQ[i] * v[i]);
        tr.body.setAttribute('x', CX - w / 2); tr.body.setAttribute('width', Math.max(0, w));
        tr.cr.setAttribute('x', CX - w / 2); tr.cr.setAttribute('width', Math.max(0, w));
        const hx = CX + Math.max(w, 0) / 2 + 30;
        tr.hd.setAttribute('transform', `translate(${hx} ${tr.y + TH / 2})`);
        tr.hd.setAttribute('aria-valuenow', v[i].toFixed(2));
        tr.read.setAttribute('x', hx + 40); tr.read.textContent = `×${v[i].toFixed(2)}`;
      });
      lines.forEach((l, i) => {
        if (!hist.length) { l.setAttribute('d', ''); return; }
        const t0 = Math.max(0, t - TMAX);
        l.setAttribute('d', hist.map((h, k) => `${k ? 'L' : 'M'}${(GX0 + (h[0] - t0) / TMAX * (GX1 - GX0)).toFixed(1)} ${yv(h[i + 1]).toFixed(1)}`).join(' '));
      });
      const ph = run || extinct ? phase() : (touched && dragging < 0 ? 0 : (dragging >= 0 ? null : 0));
      if (ph !== null) lastPh = ph;
      steps.forEach((li, k) => li.classList.toggle('on', lastPh === k));
      back.classList.toggle('hot', extinct);
      if (extinct) {
        msg.textContent = '2차 소비자가 사라졌다 → 1차 소비자는 많고 생산자는 적은 새 상태로 굳는다. 회복할 수 있는 정도를 넘어섰다.';
        now.textContent = '«2차 소비자 다시 들여오기»를 눌러 보자';
      } else if (dragging >= 0) {
        msg.textContent = `${NAME[dragging]}: ${word(v[dragging])} — 놓으면 먹이 관계가 움직이기 시작한다`;
        now.textContent = '놓아 보자';
      } else if (run) {
        msg.textContent = NAME.map((n, i) => `${n} ${word(v[i])}`).join(' · ');
        now.textContent = '세 층이 번갈아 늘고 준다';
      } else {
        msg.textContent = touched ? '다시 평형에 이르렀다. 수가 오르내렸지만 결국 처음과 같은 크기로 돌아왔다.' : '';
        now.textContent = touched ? '다른 층도 끌어 보자 · 맨 위층을 거의 다 없애 보자' : '맨 위층 손잡이를 왼쪽으로 끌었다가 놓아 보자';
        now.classList.toggle('done', touched);
      }
    }
    function setV(i, x) { const max = Math.min(2, 1000 / WEQ[i]); v[i] = clamp(x, 0, max); if (i === 2 && v[2] > 0) extinct = false; }
    function release() {
      if (dragging < 0) return;
      const i = dragging; dragging = -1; touched = true;
      if (i === 2 && v[2] < 0.04) { v[2] = 0; extinct = true; }
      if (!hist.length || hist[hist.length - 1][0] < t) hist.push([t, ...v]);
      run = true; paint();
    }
    tiers.forEach((tr) => {
      tr.hd.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); tr.hd.setPointerCapture(e.pointerId); dragging = tr.i; run = false; hist.push([t, ...v]); });
      tr.hd.addEventListener('pointermove', (e) => { if (dragging !== tr.i) return; const p = pt(svg, e); setV(tr.i, (p.x - 30 - CX) * 2 / WEQ[tr.i]); paint(); });
      tr.hd.addEventListener('pointerup', release); tr.hd.addEventListener('pointercancel', release);
      tr.hd.addEventListener('keydown', (e) => {
        const d = { ArrowLeft: -0.1, ArrowDown: -0.1, ArrowRight: 0.1, ArrowUp: 0.1 }[e.key];
        if (d === undefined) return;
        e.preventDefault(); e.stopPropagation(); dragging = tr.i; run = false; setV(tr.i, v[tr.i] + d); paint();
      });
      tr.hd.addEventListener('keyup', (e) => { if (e.key.startsWith('Arrow')) release(); });
    });
    back.addEventListener('click', () => { if (v[2] < 0.05) { v[2] = 0.3; extinct = false; run = true; touched = true; } });
    root.querySelector('#bl-reset').addEventListener('click', () => { v = [1, 1, 1]; extinct = false; run = false; hist = []; t = 0; touched = false; lastD = [0, 0, 0]; paint(); });
    paint();
    const loop = window.Stage.loop(step);
    root._bl = {
      pull: (i, x) => { dragging = i; setV(i, x); release(); },
      fast: (sec) => { for (let k = 0; k < sec * 30; k++) step(1 / 30); },
      get v() { return v.slice(); }, get extinct() { return extinct; },
    };
    return { setActive(on) { if (on) loop.start(); else loop.stop(); } };
  }
  window.EcoBalance = { mount };
})();
