/* 해 보기 «자동차의 에너지 효율»(교과서 112쪽 값). 달리는 차에 진단기를 끌어 부품(엔진·냉각 장치·바퀴·모터…)에 대면
   그곳에서 새는 에너지가 드러나 아래 폭포 그래프의 제자리에 쌓인다(부품을 눌러도 된다). 새는 곳을 다 찾은 뒤 바퀴를 짚으면 효율이 나온다.
   가솔린: 100 − 엔진 열 68 − 엔진 냉각 4 − 마찰 3 = 바퀴 25 %
   전기: 100 − 충전 10 − 구동 18 − 냉각 3 − 보조 4 + 회생 제동 22 = 바퀴 87 % (회생 제동을 끄면 단순 계산 65 %) */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const CARS = {
    gas: [
      { t: 'start', v: 100, n: '가솔린의\n화학 에너지', p: 'tank', say: '연료 탱크의 가솔린: 화학 에너지 100 %', c: 'e-chem' },
      { t: 'loss', v: 68, n: '엔진에서\n버려지는 열', p: 'engine', say: '엔진이 달아오르고 배기가스로 열이 빠져나간다', also: 'exh' },
      { t: 'loss', v: 4, n: '엔진\n냉각', p: 'cool', say: '엔진을 식히는 냉각 장치에 쓰인다' },
      { t: 'loss', v: 3, n: '마찰로\n손실', p: 'fric', say: '바퀴와 부품의 마찰로 잃는다' },
      { t: 'res', n: '바퀴의\n동력', p: 'wheel', say: '바퀴를 굴리는 데 쓰인 에너지' },
    ],
    ev: [
      { t: 'start', v: 100, n: '전기\n에너지', p: 'charge', say: '충전소에서 받은 전기 에너지 100 %', c: 'e-elec' },
      { t: 'loss', v: 10, n: '충전\n과정 손실', p: 'charge', say: '충전하는 동안 잃는다' },
      { t: 'loss', v: 18, n: '구동\n과정 손실', p: 'motor', say: '모터와 회로를 거치며 잃는다' },
      { t: 'loss', v: 3, n: '냉각\n손실', p: 'cool', say: '냉각 장치에서 잃는다' },
      { t: 'loss', v: 4, n: '보조\n부품', p: 'aux', say: '전조등·에어컨 같은 보조 부품이 쓴다' },
      { t: 'gain', v: 22, n: '회생 제동\n회수', p: 'regen', say: '브레이크를 밟을 때 운동 에너지를 전기로 되찾는다' },
      { t: 'res', n: '바퀴의\n동력', p: 'wheel', say: '바퀴를 굴리는 데 쓰인 에너지' },
    ],
  };
  const el = (tag, attrs, parent) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v); if (parent) parent.appendChild(e); return e; };

  function column(col) {
    const kind = col.dataset.car, steps = CARS[kind];
    const wf = col.querySelector('.wf-svg'), car = col.querySelector('.car-svg'), eff = col.querySelector('.car-eff em');
    const call = car.querySelector('.cr-call'), callR = call.querySelector('rect'), callT = call.querySelector('text');
    const regenBtn = col.querySelector('#ev-regen'), note = col.querySelector('.car-note'), hint = col.querySelector('.car-hint');
    let k = 0, regen = true;
    const found = new Set([0]);
    const X0 = 40, X1 = 770, Y0 = 30, Y1 = 330, H = Y1 - Y0, slot = (X1 - X0) / steps.length, bw = slot * 0.62;
    const yOf = (v) => Y1 - H * v / 100;
    const levels = () => { let L = 0; return steps.map((s) => { const from = L; if (s.t === 'start') L = s.v; else if (s.t === 'loss') L -= s.v; else if (s.t === 'gain') L += regen ? s.v : 0; return { from, to: L }; }); };
    // 눈금
    [0, 25, 50, 75, 100].forEach((v) => { el('line', { class: 'wf-grid', x1: X0 - 6, x2: X1, y1: yOf(v), y2: yOf(v) }, wf); el('text', { class: 'wf-ax', x: X0 - 10, y: yOf(v) + 5 }, wf).textContent = String(v); });
    el('text', { class: 'wf-ax', x: X0 - 10, y: 14 }, wf).textContent = '%';
    const bars = steps.map((s, i) => {
      const g = el('g', { class: `wf-bar ${s.t}`, tabindex: '0', role: 'button', 'aria-label': `${s.n.replace('\n', ' ')} 단계로` }, wf);
      const x = X0 + i * slot + (slot - bw) / 2;
      const r = el('rect', { x, width: bw, rx: 4 }, g);
      const v = el('text', { class: 'wf-v', x: x + bw / 2 }, g);
      s.n.split('\n').forEach((t, j) => { el('text', { class: 'wf-n', x: x + bw / 2, y: Y1 + 26 + j * 20 }, g).textContent = t; });
      return { g, r, v, x, s };
    });
    const links = steps.slice(1).map(() => el('line', { class: 'wf-link' }, wf));
    function paint() {
      const L = levels();
      bars.forEach((b, i) => {
        const { s } = b, { from, to } = L[i];
        let lo, hi, txt;
        if (s.t === 'start') { lo = 0; hi = s.v; txt = `${s.v} %`; }
        else if (s.t === 'loss') { lo = to; hi = from; txt = `−${s.v} %`; }
        else if (s.t === 'gain') { lo = from; hi = from + s.v; txt = regen ? `+${s.v} %` : '꺼짐'; }
        else { lo = 0; hi = from; txt = `${from} %`; }
        b.r.setAttribute('y', yOf(hi)); b.r.setAttribute('height', Math.max(1, yOf(lo) - yOf(hi)));
        b.v.setAttribute('y', yOf(hi) - 8); b.v.textContent = txt;
        b.g.classList.toggle('shown', found.has(i)); b.g.classList.toggle('now', i === k);
        b.g.classList.toggle('off', s.t === 'gain' && !regen);
        if (s.c) b.r.style.fill = `var(--${s.c})`;
        if (i > 0) { const ln = links[i - 1], y = yOf(L[i - 1].to); ln.setAttribute('x1', bars[i - 1].x + bw); ln.setAttribute('x2', b.x); ln.setAttribute('y1', y); ln.setAttribute('y2', y); ln.classList.toggle('shown', found.has(i) && found.has(i - 1)); }
      });
      const fin = L[L.length - 1].to, done = found.has(steps.length - 1);
      eff.textContent = done ? `${fin} %` : '?';
      if (note) note.textContent = done && !regen ? '회생 제동 없이 단순 계산' : '';
      col.classList.toggle('done', done);
      // 차의 부품 반짝이기
      const s = steps[k];
      car.querySelectorAll('.part').forEach((p) => p.classList.toggle('hot', p.dataset.p === s.p || p.dataset.p === s.also));
      const part = car.querySelector(`.part[data-p="${s.p}"]`);
      callT.textContent = s.t === 'gain' && !regen ? '회생 제동을 껐다: 되찾는 에너지 없음' : s.say;
      const bb = part ? part.getBBox() : { x: 300, y: 40, width: 0, height: 0 };
      const tw = callT.getComputedTextLength() + 28;
      const cx = Math.max(6, Math.min(780 - tw - 6, bb.x + bb.width / 2 - tw / 2)), cy = Math.max(4, bb.y - 46);
      call.setAttribute('transform', `translate(${cx.toFixed(1)} ${cy.toFixed(1)})`); callR.setAttribute('width', tw.toFixed(1)); callT.setAttribute('x', (tw / 2).toFixed(1));
    }
    // 진단기: 부품에 대면 그 부품의 단계를 연다. 바퀴(결과)는 새는 곳을 다 찾은 뒤에
    const last = steps.length - 1, need = () => steps.filter((x, i) => i > 0 && i < last && !found.has(i)).length;
    const WHEEL = ['fric', 'regen', 'wheel'];                        // 바퀴 둘레에서 찾는 것(보이지 않는 그림이라 바퀴로 짚는다)
    function probe(p) {
      if (p === 'wheels') { const j = steps.findIndex((x, n) => (x.p === 'fric' || x.p === 'regen') && !found.has(n)); p = j >= 0 ? steps[j].p : 'wheel'; }
      const i = steps.findIndex((x, j) => (x.p === p || x.also === p) && j > 0 && !found.has(j)) , j0 = steps.findIndex((x) => x.p === p || x.also === p);
      if (i === last && need()) { k = j0 >= 0 ? j0 : k; hint.textContent = `바퀴에 닿기 전에 새는 곳이 ${need()}곳 더 있다`; paint(); return; }
      if (i < 0) { if (j0 >= 0) { k = j0; hint.textContent = j0 === 0 ? '여기서 에너지 100 %가 들어온다' : '이미 찾은 곳이다'; paint(); } return; }
      found.add(i); k = i; hint.textContent = i === last ? '새는 곳을 다 찾았다!' : need() ? `새는 곳 ${need()}곳 더 찾아보자` : '이제 바퀴를 짚어 보자';
      paint();
    }
    car.classList.add('run');
    car.querySelectorAll('.part').forEach((pt) => {
      if (WHEEL.includes(pt.dataset.p)) return;
      pt.setAttribute('tabindex', '0'); pt.setAttribute('role', 'button'); pt.setAttribute('aria-label', '진단기로 짚기');
      pt.addEventListener('click', () => probe(pt.dataset.p));
      pt.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); probe(pt.dataset.p); } });
    });
    // 진단기 그림(끌어서 부품에 대기). 끝(빨간 점)이 닿은 부품을 짚는다
    const pr = el('g', { class: 'cr-probe', tabindex: '-1' }, car);
    el('rect', { class: 'cr-pr-body', x: -62, y: -50, width: 54, height: 38, rx: 8 }, pr); el('text', { class: 'cr-pr-t', x: -35, y: -25 }, pr).textContent = '진단';
    el('path', { class: 'cr-pr-stick', d: 'M-14 -14 L 0 0' }, pr); el('circle', { class: 'cr-pr-tip', cx: 0, cy: 0, r: 6 }, pr);
    const REST = { x: 772, y: 56 };
    const putProbe = (x, y) => pr.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    const ptOf = (ev) => { const p = car.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(car.getScreenCTM().inverse()); };
    const partAt = (x, y) => [...car.querySelectorAll('.part')].filter((g) => !WHEEL.includes(g.dataset.p)).find((g) => { const b = g.getBBox(); return x > b.x - 12 && x < b.x + b.width + 12 && y > b.y - 12 && y < b.y + b.height + 12; });
    let hold = false, over = null;
    pr.addEventListener('pointerdown', (ev) => { hold = true; try { pr.setPointerCapture(ev.pointerId); } catch { /* 합성 이벤트 */ } pr.classList.add('drag'); ev.stopPropagation(); });
    pr.addEventListener('pointermove', (ev) => {
      if (!hold) return; const p = ptOf(ev); putProbe(p.x, p.y);
      const g = partAt(p.x, p.y); if (g !== over) { if (over) over.classList.remove('aim'); over = g; if (g) g.classList.add('aim'); }
    });
    const up = () => { if (!hold) return; hold = false; pr.classList.remove('drag'); if (over) { over.classList.remove('aim'); probe(over.dataset.p); over = null; } putProbe(REST.x, REST.y); };
    pr.addEventListener('pointerup', up); pr.addEventListener('pointercancel', up);
    putProbe(REST.x, REST.y);
    if (regenBtn) regenBtn.addEventListener('click', () => {
      regen = !regen; regenBtn.setAttribute('aria-pressed', String(regen)); regenBtn.textContent = regen ? '회생 제동 켜짐' : '회생 제동 꺼짐';
      paint();
    });
    paint();
    return { paint, probe, all() { steps.forEach((x, i) => found.add(i)); k = last; paint(); } };
  }

  function mount(root) {
    const cols = [...root.querySelectorAll('.car-col')].map(column);
    const opts = [...root.querySelectorAll('.car-pred button')];
    opts.forEach((b) => b.addEventListener('click', () => { const on = b.getAttribute('aria-pressed') !== 'true'; opts.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b))); }));
    root._cars = cols;
    return { setActive(on) { if (on) cols.forEach((c) => c.paint()); } };
  }
  window.CarEfficiency = { mount };
})();
