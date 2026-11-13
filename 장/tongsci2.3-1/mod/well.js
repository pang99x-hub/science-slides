/* 탐구 1 단백질을 이용한 감염병 진단 기술 체험(교과서 132쪽): 4홈판에 순서대로 두 방울씩 넣는다.
   ① 포획 항체(홈 1~4) → 5분 ② 진단 시료(홈 1 음성 표준, 2 양성 표준, 3 사람 1, 4 사람 2) → 5분 ③ 검출 시약 → 5분 ④ 진단 반응물.
   병원체 단백질이 있는 시료(양성 표준·사람 1)의 홈만 붉은색, 나머지는 무색(교과서 결과). 순서가 틀리면 힌트.
   스포이트를 홈에 놓으면 그 홈에, 판 위(홈 바깥)에 놓으면 아직 안 넣은 홈 모두에 넣는다(진단 시료는 홈마다 달라 하나씩). 바닥의 «새 4홈판»을 누르면 처음부터. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const NAME = { cap: '포획 항체', neg: '음성 표준 시료', pos: '양성 표준 시료', p1: '사람 1의 시료', p2: '사람 2의 시료', det: '검출 시약', sub: '진단 반응물' };
  const SAMPLE = ['neg', 'pos', 'p1', 'p2'], POSITIVE = [false, true, true, false];
  const STEP = ['cap', 'sample', 'det', 'sub'], STEP_NAME = ['포획 항체', '진단 시료', '검출 시약', '진단 반응물'];
  const jong = (w) => (w.charCodeAt(w.length - 1) - 0xac00) % 28, eul = (w) => (jong(w) ? '을' : '를');

  function mount(root) {
    const svg = root.querySelector('.wl-svg'), plate = svg.querySelector('.wl-plate'), wellsG = svg.querySelector('.wl-wells'), hand = svg.querySelector('.wl-chand'), clockT = svg.querySelector('.wl-ct');
    const pips = [...root.querySelectorAll('.wl-pip')], msg = root.querySelector('.wl-msg'), rows = [...root.querySelectorAll('.wl-table tbody tr')];
    let step = 0, busy = false;
    const added = [0, 1, 2, 3].map(() => [false, false, false, false]);
    const wells = [0, 1, 2, 3].map((i) => {
      const x = 30 + 664 * (i + 0.5) / 4, y = 318;
      const g = el('g', { class: 'wl-well', 'data-w': i, transform: `translate(${x} ${y})`, tabindex: '0', role: 'button', 'aria-label': `홈 ${i + 1}` }, wellsG);
      el('circle', { class: 'wl-rim', r: 70 }, g); el('circle', { class: 'wl-hole', r: 60 }, g);
      const liq = el('circle', { class: 'wl-liq', r: 0 }, g);
      el('ellipse', { class: 'wl-shine', cx: -21, cy: -24, rx: 18, ry: 10 }, g);
      el('text', { class: 'wl-no', y: 104 }, g).textContent = `홈 ${i + 1}`;
      const tag = el('text', { class: 'wl-tag', y: -84 }, g); tag.textContent = ['음성 표준', '양성 표준', '사람 1', '사람 2'][i];
      return { g, liq, x, y };
    });
    const count = (w) => added.reduce((n, row) => n + (row[w] ? 1 : 0), 0);   // 홈 w에 지금까지 넣은 단계 수
    function level(w) { wells[w].liq.setAttribute('r', String(count(w) ? 14 + 11 * count(w) : 0)); }
    // 홈 바닥 확대: 포획 항체(바닥) → 병원체 단백질을 붙잡음 → 검출 시약이 달라붙음 → 반응물이 붉게(이해를 돕기 위한 그림)
    const Z = el('g', { class: 'wl-zoom', transform: 'translate(722 34)' }, svg);
    el('rect', { class: 'wl-zbox', width: 318, height: 500, rx: 16 }, Z);
    const zt = el('text', { class: 'wl-zt', x: 159, y: 30 }, Z);
    const chips = [0, 1, 2, 3].map((i) => {
      const c = el('g', { class: 'wl-zc', transform: `translate(${16 + i * 74} 44)`, tabindex: '0', role: 'button', 'aria-label': `홈 ${i + 1} 바닥 보기` }, Z);
      el('rect', { width: 66, height: 32, rx: 16 }, c); el('text', { x: 33, y: 22 }, c).textContent = `홈 ${i + 1}`;
      const pick = () => { sel = i; paintZoom(); };
      c.addEventListener('click', pick); c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); pick(); } });
      return c;
    });
    el('rect', { class: 'wl-zview', x: 12, y: 88, width: 294, height: 304, rx: 12 }, Z);
    const wash = el('rect', { class: 'wl-zwash', x: 12, y: 88, width: 294, height: 268, rx: 12 }, Z);
    el('rect', { class: 'wl-zfloor', x: 12, y: 356, width: 294, height: 36 }, Z); el('text', { class: 'wl-zft', x: 159, y: 380 }, Z).textContent = '홈 바닥';
    const layer = (c) => el('g', { class: `wl-zl ${c}` }, Z);
    const capG = layer('cap'), agG = layer('ag'), detG = layer('det'), colG = layer('col'), floatG = layer('float');
    const XS = [54, 124, 194, 264];
    const yUp = (g, x, y) => el('path', { class: 'wl-y', d: `M${x} ${y + 30} V ${y} M ${x} ${y} L ${x - 13} ${y - 18} M ${x} ${y} L ${x + 13} ${y - 18}` }, g);
    const yDown = (g, x, y) => { el('path', { class: 'wl-y det', d: `M${x - 12} ${y + 16} L ${x} ${y} L ${x + 12} ${y + 16} M ${x} ${y} V ${y - 24}` }, g); el('path', { class: 'wl-enz', d: `M${x} ${y - 40} l 5 9 l 10 1 l -7 7 l 2 10 l -10 -5 l -10 5 l 2 -10 l -7 -7 l 10 -1 z` }, g); };
    XS.forEach((x) => {
      yUp(capG, x, 326);
      const a = el('g', { class: 'wl-ag', transform: `translate(${x} 294)` }, agG); el('circle', { r: 12 }, a); [[-12, -4], [12, -4], [0, -13], [-7, 9], [7, 9]].forEach(([dx, dy]) => el('circle', { class: 'sp', cx: dx, cy: dy, r: 3.5 }, a));
      yDown(detG, x, 268);
      [[-18, 196], [16, 206], [-4, 178], [20, 182], [-22, 216]].forEach(([dx, y]) => el('circle', { class: 'wl-red', cx: x + dx, cy: y, r: 5 + ((dx + y) % 3) }, colG));
    });
    [[70, 150], [150, 196], [230, 140], [110, 120]].forEach(([x, y]) => { const g = el('g', { transform: `rotate(${(x % 40) - 20} ${x} ${y})` }, floatG); yDown(g, x, y); });
    const cap1 = el('text', { class: 'wl-zcap', x: 159, y: 424 }, Z), cap2 = el('text', { class: 'wl-zcap', x: 159, y: 448 }, Z);
    const leg = el('g', { class: 'wl-zleg', transform: 'translate(18 476)' }, Z);
    yUp(leg, 6, 0).setAttribute('transform', 'translate(0 -16) scale(.55)'); el('text', { x: 22, y: 4 }, leg).textContent = '포획 항체';
    el('circle', { class: 'wl-legag', cx: 108, cy: 0, r: 7 }, leg); el('text', { x: 120, y: 4 }, leg).textContent = '병원체 단백질';
    el('path', { class: 'wl-enz', d: 'M226 -9 l 4 7 l 8 1 l -6 5 l 2 8 l -8 -4 l -8 4 l 2 -8 l -6 -5 l 8 -1 z' }, leg); el('text', { x: 240, y: 4 }, leg).textContent = '검출 시약';
    let sel = 1;
    function paintZoom() {
      const w = sel, pos = POSITIVE[w], s = [0, 1, 2, 3].map((k) => added[k][w]);
      zt.textContent = `홈 바닥 확대 · 홈 ${w + 1}(${['음성 표준', '양성 표준', '사람 1', '사람 2'][w]})`;
      chips.forEach((c, i) => c.classList.toggle('on', i === w));
      capG.classList.toggle('on', s[0]); agG.classList.toggle('on', s[1] && pos); detG.classList.toggle('on', s[2] && pos);
      floatG.classList.toggle('on', s[2] && !pos && !s[3]); colG.classList.toggle('on', s[3] && pos); wash.classList.toggle('on', s[3] && pos);
      const t = s[3] ? (pos ? ['검출 시약이 있는 곳에서', '반응물이 붉게 변했다'] : ['검출 시약이 남지 않아', '색이 변하지 않는다'])
        : s[2] ? (pos ? ['검출 시약이 붙잡힌 단백질에', '달라붙었다'] : ['검출 시약이 붙을 곳이 없어', '남지 않는다'])
          : s[1] ? (pos ? ['포획 항체가', '병원체 단백질을 붙잡았다'] : ['붙잡을 병원체 단백질이', '들어 있지 않다'])
            : s[0] ? ['바닥에 포획 항체가', '붙어 있다'] : ['아직 아무것도', '넣지 않았다'];
      cap1.textContent = t[0]; cap2.textContent = t[1];
    }
    function setCell(w, s) { rows[w].children[1 + s].textContent = s === 1 ? `${rows[w].children[2].textContent.replace(' ✓', '')} ✓` : '2방울 ✓'; }
    // 지금 넣을 스포이트와 아직 안 넣은 홈을 표시
    function guide() {
      const need = step >= 4 ? [] : [0, 1, 2, 3].filter((w) => !added[step][w]);
      const want = new Set(need.map((w) => (step === 1 ? SAMPLE[w] : STEP[step])));
      pips.forEach((p) => { p.classList.toggle('now', want.has(p.dataset.r)); p.classList.toggle('later', step < 4 && !want.has(p.dataset.r)); });
      wells.forEach((W, i) => W.g.classList.toggle('wait', !busy && need.includes(i)));
    }
    function say() {
      guide();
      msg.textContent = step >= 4 ? '끝! 붉은색으로 변한 홈을 양성 표준(홈 2)과 견주어 보자'
        : step === 1 ? '2단계: 홈마다 정해진 진단 시료를 두 방울씩(홈 1 음성 표준 · 2 양성 표준 · 3 사람 1 · 4 사람 2)'
          : `${step + 1}단계: ${STEP_NAME[step]}${eul(STEP_NAME[step])} 홈 1~4에 두 방울씩 넣자`;
    }
    function drops(w, color) {
      if (!window.gsap || window.Deck.reduce) return;
      for (let k = 0; k < 2; k++) {
        const d = el('path', { class: 'wl-drop', d: 'M0 -14 C -7 -2, -9 4, 0 10 C 9 4, 7 -2, 0 -14 Z', fill: color, transform: `translate(${wells[w].x} 40)` }, svg);
        gsap.fromTo(d, { y: 0, opacity: 1 }, { y: wells[w].y - 40 - 10, duration: 0.45, delay: k * 0.22, ease: 'power2.in', onComplete: () => d.remove() });
      }
    }
    function develop() {
      wells.forEach((W, i) => { W.g.classList.toggle('red', POSITIVE[i]); rows[i].querySelector('.col').textContent = POSITIVE[i] ? '붉은색' : '무색'; rows[i].classList.toggle('red', POSITIVE[i]); });
      root.classList.add('wl-done');
    }
    function wait5(next) {
      busy = true; clockT.textContent = '5분 지나는 중'; guide();
      const end = () => { busy = false; clockT.textContent = '5분 기다리기'; next(); };
      if (window.gsap && !window.Deck.reduce) gsap.fromTo(hand, { rotation: 0, svgOrigin: '0 0' }, { rotation: 360, svgOrigin: '0 0', duration: 1.1, ease: 'none', onComplete: end });
      else end();
    }
    function put(pip, w, quiet) {
      if (busy) { msg.textContent = '5분을 기다리는 중이다'; return false; }
      if (step >= 4) { msg.textContent = '실험이 끝났다. «처음부터»로 다시 해 볼 수 있다'; return false; }
      const r = pip.dataset.r, want = step === 1 ? SAMPLE[w] : STEP[step];
      if (step === 1 && SAMPLE.includes(r) && r !== want) { msg.textContent = `홈 ${w + 1}에는 ${NAME[want]}${eul(NAME[want])} 넣는다`; return false; }
      if (r !== want) { msg.textContent = `지금은 ${step + 1}단계 — ${step === 1 ? '진단 시료' : NAME[want]} 차례다`; shake(pip); return false; }
      if (added[step][w]) { msg.textContent = `홈 ${w + 1}에는 이미 넣었다`; return false; }
      added[step][w] = true; level(w); setCell(w, step); guide(); sel = w; paintZoom(); if (!quiet) drops(w, getComputedStyle(pip).getPropertyValue('--c'));
      if (added[step].every(Boolean)) {
        const fin = step === 3;
        wait5(() => { step++; if (fin) develop(); say(); });
      } else if (!quiet) msg.textContent = `홈 ${w + 1}에 ${NAME[r]} 두 방울 ✓ — 나머지 홈에도`;
      return true;
    }
    const shake = (e) => { e.classList.remove('bad'); e.getBoundingClientRect(); e.classList.add('bad'); };
    function putAll(pip) {
      if (busy) { msg.textContent = '5분을 기다리는 중이다'; return; }
      if (step >= 4) { msg.textContent = '실험이 끝났다. 아래 «새 4홈판»을 누르면 처음부터 다시 한다'; return; }
      if (step === 1) { msg.textContent = '진단 시료는 홈마다 달라서 홈 하나하나에 넣자'; return; }
      if (pip.dataset.r !== STEP[step]) { msg.textContent = `지금은 ${step + 1}단계 — ${NAME[STEP[step]]} 차례다`; shake(pip); return; }
      [0, 1, 2, 3].forEach((w) => { if (!added[step][w]) put(pip, w); });
    }
    const drag = window.Drag.cards(pips, {
      find: (x) => { if (!x.closest) return null; const g = x.closest('#well .wl-well'); if (g) return Number(g.dataset.w); return x.closest('#well .wl-plate') ? 'plate' : null; },
      hover: (w) => { wells.forEach((W, i) => W.g.classList.toggle('target', i === w)); plate.classList.toggle('target', w === 'plate'); },
      drop: (p, w) => { if (w === 'plate') { putAll(p); return; } if (w === null || w === undefined) { msg.textContent = '스포이트를 홈 위에 놓아 보자'; return; } put(p, w); },
      pick: (p) => { if (p) msg.textContent = `${p.textContent} — 넣을 홈을 눌러요`; },
    });
    wells.forEach((W, i) => {
      const go = () => { if (drag.picked) { const p = drag.picked; drag.unpick(); put(p, i); } };
      W.g.addEventListener('click', go);
      W.g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); go(); } });
    });
    function fillStep() {
      if (busy || step >= 4) return;
      [0, 1, 2, 3].forEach((w) => { if (added[step][w]) return; const want = step === 1 ? SAMPLE[w] : STEP[step]; put(pips.find((p) => p.dataset.r === want), w, true); });
    }
    plate.addEventListener('click', (e) => { if (!e.target.closest('.wl-well') && drag.picked) { const p = drag.picked; drag.unpick(); putAll(p); } });
    // 새 4홈판: 누르면 처음부터
    const fresh = el('g', { class: 'wl-new', transform: 'translate(40 470)', tabindex: '0', role: 'button', 'aria-label': '새 4홈판으로 처음부터' }, svg);
    el('rect', { class: 'wl-nb', width: 196, height: 70, rx: 16 }, fresh);
    [0, 1, 2, 3].forEach((i) => el('circle', { class: 'wl-nh', cx: 26 + i * 22, cy: 35, r: 9 }, fresh));
    el('text', { class: 'wl-nt', x: 148, y: 30 }, fresh).textContent = '새 4홈판';
    el('text', { class: 'wl-ns', x: 148, y: 52 }, fresh).textContent = '처음부터';
    const reset = () => {
      if (busy) return; step = 0; added.forEach((a) => a.fill(false)); root.classList.remove('wl-done');
      wells.forEach((W, i) => { W.g.classList.remove('red'); level(i); }); paintZoom();
      rows.forEach((r, i) => { [1, 3, 4].forEach((c) => { r.children[c].textContent = ''; }); r.children[2].textContent = ['음성 표준', '양성 표준', '사람 1', '사람 2'][i]; r.querySelector('.col').textContent = ''; r.classList.remove('red'); });
      say(); paintZoom(); msg.textContent = '새 4홈판을 놓았다 — 1단계부터 다시';
    };
    fresh.addEventListener('click', reset);
    fresh.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); reset(); } });
    root._well = { auto() { const tick = () => { if (step >= 4) return; if (!busy) fillStep(); setTimeout(tick, 200); }; tick(); }, get step() { return step; } };
    say(); paintZoom();
    return {};
  }
  window.WellPlate = { mount };
})();
