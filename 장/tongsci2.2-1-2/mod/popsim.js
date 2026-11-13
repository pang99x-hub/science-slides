/* 모의실험기: 2장 뚜껑 던지기와 같은 규칙(window.HopperRule)을 컴퓨터가 40세대까지 되풀이한다.
   뚜껑마다 남은 메뚜기 한 마리를 잡을 확률 p(뚜껑 넓이 ÷ 판 넓이)로 잡은 수를 뽑는다. 막대로 번식 배수·살아남는 먹이 수·사람이 참새를 잡는 비율을 바꾸면
   실행 중에도 바로 그 규칙으로 이어진다. 표지에서 그린 예측(window.Lesson212.pred)을 점선으로 겹칠 수 있다. */
(function () {
  'use strict';
  const { el, rng, keyStop } = window.Eco;
  const X0 = 110, X1 = 950, Y0 = 652, Y1 = 236, NG = 40, SMAX = 20;
  const X = (g) => X0 + g / NG * (X1 - X0), YH = (v) => Y0 - Math.min(v, 100) / 100 * (Y0 - Y1), YS = (v) => Y0 - Math.min(v, SMAX) / SMAX * (Y0 - Y1);

  function mount(root) {
    const svg = root.querySelector('.ps-svg'), now = root.querySelector('.ps-now');
    const it = root.querySelector('.ps-it'), ib = root.querySelector('.ps-ib');
    const runBtn = root.querySelector('#ps-run'), predBtn = root.querySelector('#ps-pred');
    const inp = Object.fromEntries(['g0', 's0', 'mult', 'need', 'hunt'].map((k) => [k, root.querySelector('#ps-' + k)]));
    const RULE = window.HopperRule;
    el('rect', { class: 'ps-bg', x: -400, y: -300, width: 1856, height: 1300 }, svg);
    // 지금 판
    el('rect', { class: 'ps-board', x: X0, y: 24, width: X1 - X0, height: 150, rx: 10 }, svg);
    el('text', { class: 'ps-bt', x: X0 + 12, y: 48 }, svg).textContent = '지금 판';
    const R0 = rng(5);
    const hop = Array.from({ length: 100 }, (_, i) => { const x = X0 + 20 + (i % 25) * 26 + R0() * 8, y = 66 + Math.floor(i / 25) * 26 + R0() * 6; const g = el('g', { class: 'ps-clip', transform: `translate(${x.toFixed(0)} ${y.toFixed(0)}) rotate(${Math.round(R0() * 160)})` }, svg); el('rect', { x: -9, y: -4, width: 18, height: 8, rx: 4 }, g); return g; });
    const birds = Array.from({ length: SMAX }, (_, i) => { const g = window.Eco.org(svg, 'sparrow', 0, 0, 0.6); g.setAttribute('transform', `translate(${X0 + 700 + (i % 5) * 28} ${70 + Math.floor(i / 5) * 26}) scale(.6)`); return g; });
    const boardTxt = el('text', { class: 'ps-bt r', x: X1 - 12, y: 48 }, svg);
    // 그래프 틀
    el('rect', { class: 'ps-gbg', x: X0, y: Y1, width: X1 - X0, height: Y0 - Y1 }, svg);
    for (let v = 0; v <= 100; v += 25) { el('path', { class: 'ps-grid', d: `M${X0} ${YH(v)} H ${X1}` }, svg); el('text', { class: 'ps-tk h', x: X0 - 10, y: YH(v) + 7 }, svg).textContent = v; el('text', { class: 'ps-tk s', x: X1 + 10, y: YH(v) + 7 }, svg).textContent = v / 100 * SMAX; }
    for (let g = 0; g <= NG; g += 10) el('text', { class: 'ps-tx', x: X(g), y: Y0 + 28 }, svg).textContent = g;
    el('text', { class: 'ps-lab h', x: X0 - 10, y: Y1 - 14 }, svg).textContent = '메뚜기(마리)';
    el('text', { class: 'ps-lab s', x: X1 + 10, y: Y1 - 14 }, svg).textContent = '참새(마리)';
    el('text', { class: 'ps-tx', x: (X0 + X1) / 2, y: Y0 + 46 }, svg).textContent = '세대';
    const predH = el('path', { class: 'ps-pred h' }, svg), predS = el('path', { class: 'ps-pred s' }, svg);
    const lineH = el('path', { class: 'ps-line h' }, svg), lineS = el('path', { class: 'ps-line s' }, svg);
    const hunted = el('g', { class: 'ps-hunted' }, svg);
    const cur = el('path', { class: 'ps-cur' }, svg);

    let seed = 21, R = rng(seed), G, S, gen, hist, running = false, acc = 0, showPred = false;
    const val = (k) => Number(inp[k].value);
    function label() {
      root.querySelector('[data-for="ps-g0"]').textContent = val('g0');
      root.querySelector('[data-for="ps-s0"]').textContent = val('s0');
      root.querySelector('[data-for="ps-mult"]').textContent = '×' + val('mult').toFixed(1);
      root.querySelector('[data-for="ps-need"]').textContent = val('need') + '마리';
      root.querySelector('[data-for="ps-hunt"]').textContent = val('hunt') + ' %';
    }
    function reset() { R = rng(seed); G = val('g0'); S = val('s0'); gen = 0; hist = [[0, G, S, 0]]; running = false; runBtn.textContent = '실행'; paint(); }
    function nextGen() {
      let left = G, ns = 0;
      for (let k = 0; k < S; k++) { let c = 0; for (let j = 0; j < left; j++) if (R() < RULE.p) c++; left -= c; ns += Math.floor(c / val('need')); }
      const h = Math.round(ns * val('hunt') / 100); ns -= h;
      G = Math.min(RULE.cap, Math.round(left * val('mult'))); S = ns || 1; gen++;
      hist.push([gen, G, S, h]);
    }
    function lag() {   // 참새가 메뚜기를 몇 세대 늦게 따라가는지(상관이 가장 큰 늦음)
      if (hist.length < 12) return null;
      const h = hist.map((r) => r[1]), s = hist.map((r) => r[2]);
      let best = 0, bc = -2;
      for (let L = 0; L <= 4; L++) {
        const a = h.slice(0, h.length - L), b = s.slice(L), ma = a.reduce((x, y) => x + y, 0) / a.length, mb = b.reduce((x, y) => x + y, 0) / b.length;
        let sab = 0, saa = 0, sbb = 0; a.forEach((x, i) => { sab += (x - ma) * (b[i] - mb); saa += (x - ma) ** 2; sbb += (b[i] - mb) ** 2; });
        const c = sab / Math.sqrt(saa * sbb || 1); if (c > bc) { bc = c; best = L; }
      }
      return bc > 0.3 ? best : null;
    }
    function paint() {
      const path = (k, f) => hist.map((r, i) => `${i ? 'L' : 'M'}${X(r[0]).toFixed(1)} ${f(r[k]).toFixed(1)}`).join(' ');
      lineH.setAttribute('d', path(1, YH)); lineS.setAttribute('d', path(2, YS));
      cur.setAttribute('d', `M${X(gen)} ${Y1} V ${Y0}`);
      hunted.innerHTML = ''; hist.forEach((r) => { if (r[3] > 0) el('path', { d: `M${X(r[0])} ${Y0} v -10` }, hunted); });
      const pr = window.Lesson212 && window.Lesson212.pred;
      const pp = (arr) => { let d = '', on = false; (arr || []).forEach((v, g) => { if (v === null || v === undefined) { on = false; return; } d += `${on ? ' L ' : ' M '}${X(g).toFixed(1)} ${(Y0 - v * (Y0 - Y1)).toFixed(1)}`; on = true; }); return d.trim(); };
      predH.setAttribute('d', showPred && pr ? pp(pr.hopper) : ''); predS.setAttribute('d', showPred && pr ? pp(pr.sparrow) : '');
      hop.forEach((h, i) => h.style.display = i < G ? '' : 'none');
      birds.forEach((b, i) => b.style.display = i < S ? '' : 'none');
      boardTxt.textContent = `${gen}세대 · 메뚜기 ${G} · 참새 ${S}`;
      const L = lag(), hunt = val('hunt');
      if (gen === 0) { it.textContent = '처음 조건'; ib.textContent = `메뚜기 ${G}마리, 참새 ${S}마리로 시작한다. 규칙은 앞 장과 같다.`; }
      else if (hunt >= 40 && hist.slice(-6).every((r) => r[1] >= 90)) { it.textContent = '참새를 많이 잡으면'; ib.textContent = '참새가 거의 남지 않아 메뚜기를 잡아먹을 포식자가 없다 → 메뚜기가 판을 가득 채웠다(100마리).'; }
      else if (L !== null && gen >= 12) { it.textContent = `참새가 약 ${L}세대 늦게 따라간다`; ib.textContent = L === 0 ? '두 그래프가 거의 함께 오르내린다.' : `메뚜기가 많아진 뒤 ${L}세대쯤 지나 참새가 많아지고, 그 뒤 메뚜기가 줄어드는 일이 되풀이된다.`; }
      else { it.textContent = `${gen}세대`; ib.textContent = `메뚜기 ${G}마리, 참새 ${S}마리.`; }
      if (hunt > 0) ib.textContent += ` (그래프 아래 눈금: 사람이 참새를 잡은 세대)`;
      now.textContent = running ? '막대를 밀어 조건을 바꿔 보자' : gen >= NG ? '조건을 바꿔 «처음부터» 다시 해 보자' : gen ? '«실행»으로 이어 가자' : '«실행»을 눌러 보자';
      now.classList.toggle('done', gen >= NG);
    }
    function step(dt) {
      if (!running) return;
      acc += dt;
      if (acc >= 0.3) { acc = 0; nextGen(); if (gen >= NG) { running = false; runBtn.textContent = '실행'; } paint(); }
    }
    runBtn.addEventListener('click', () => { if (gen >= NG) reset(); running = !running; runBtn.textContent = running ? '멈춤' : '실행'; paint(); });
    root.querySelector('#ps-reset').addEventListener('click', reset);
    root.querySelector('#ps-seed').addEventListener('click', () => { seed = 1 + Math.floor(Math.random() * 9999); reset(); });
    predBtn.addEventListener('click', () => { showPred = !showPred; predBtn.setAttribute('aria-pressed', String(showPred)); paint(); });
    Object.entries(inp).forEach(([k, i]) => { keyStop(i); i.addEventListener('input', () => { label(); if ((k === 'g0' || k === 's0') && !running && gen === 0) reset(); else paint(); }); });
    label(); reset();
    const loop = window.Stage.loop(step);
    root._ps = { get gen() { return gen; }, run: () => runBtn.click(), fast: () => { while (gen < NG) nextGen(); paint(); } };
    return { setActive(on) { if (on) { loop.start(); paint(); } else { loop.stop(); } } };
  }
  window.PopSim = { mount };
})();
