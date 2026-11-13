/* 3차시 2장 탐구(교과서 50~51쪽): 염산 피펫·수산화 나트륨 피펫을 병에 담근 채 필러 바퀴를 위로 굴리면 1 mL씩 빨려 오르고,
   피펫을 6홈판의 홈으로 끌어 바퀴를 아래로 굴리면 그만큼 들어간다. 한 홈의 합이 12 mL가 되면 유리 막대로 젓고
   디지털 온도계가 오르다 멈춘다(최고 온도). BTB 스포이트를 홈에 끌어 놓으면 색이 바뀐다.
   온도: 교과서 다섯 조합은 교과서 51쪽 예시 값, 그 밖은 «모형 값»(AB.MIX). 결과는 AB.state.lab에 두고 그래프 장이 읽는다. */
(function () {
  'use strict';
  const { el, grab, loop, clamp, MIX, ind, state } = window.AB;
  const ML = 22;                       // 피펫 눈금 1 mL의 길이
  const WX = [470, 560, 650, 740, 830, 920], WY = 520, WR = 38;
  const NAMES = ['가', '나', '다', '라', '마', '바'];
  const PLAN = [[2, 10], [4, 8], [6, 6], [8, 4], [10, 2], null];
  const STOCK = { a: { x: 110, name: '염산', c: '#e3f0f6' }, b: { x: 270, name: '수산화 나트륨 수용액', short: '수산화 나트륨', c: '#e6eef6' } };

  function mount(root) {
    const svg = root.querySelector('.ab-pp-svg'), now = root.querySelector('.ab-pp-now'), msg = root.querySelector('.ab-pp-msg');
    const tbody = root.querySelector('.ab-pp-tbl tbody');
    tbody.innerHTML = NAMES.map((n, i) => `<tr data-i="${i}"><th>${n}</th><td class="pa"></td><td class="pb"></td><td class="pt"></td><td class="pc"></td></tr>`).join('');
    state.lab = state.lab || {};
    el('rect', { x: 0, y: 580, width: 1000, height: 60, fill: '#e6dccb' }, svg);
    // 병
    Object.entries(STOCK).forEach(([k, s]) => {
      el('rect', { x: s.x - 55, y: 430, width: 110, height: 140, fill: s.c }, svg);
      el('path', { d: `M${s.x - 62} 370 V562 Q${s.x - 62} 576 ${s.x - 48} 576 H${s.x + 48} Q${s.x + 62} 576 ${s.x + 62} 562 V370`, class: 'ab-glass', fill: 'none' }, svg);
      el('line', { x1: s.x - 55, y1: 430, x2: s.x + 55, y2: 430, stroke: '#6fa4c6', 'stroke-width': 2 }, svg);
      el('text', { class: 'ab-small', x: s.x, y: 600, text: s.short || s.name, 'font-size': 15 }, svg);
      el('text', { class: 'ab-small', x: s.x, y: 620, text: '24.5 °C', 'font-size': 14 }, svg);
    });
    // 6홈판
    el('rect', { x: 420, y: 470, width: 550, height: 100, rx: 18, fill: '#f8fafb', stroke: '#1d2433', 'stroke-width': 3 }, svg);
    el('text', { class: 'ab-small', x: 695, y: 600, text: '6홈판' }, svg);
    const W = WX.map((x, i) => {
      el('circle', { cx: x, cy: WY, r: WR, fill: '#eef3f5', stroke: '#1d2433', 'stroke-width': 2.5 }, svg);
      const liq = el('circle', { cx: x, cy: WY, r: 0, fill: '#dbe9f2' }, svg);
      el('text', { class: 'ab-label', x, y: WY - WR - 10, text: NAMES[i], 'font-size': 19 }, svg);
      const vol = el('text', { class: 'ab-small', x, y: WY + 6, text: '', 'font-size': 13 }, svg);
      return { i, x, liq, vol, a: 0, b: 0, T: null, btb: false, done: false };
    });
    // 디지털 온도계
    const cable = el('path', { d: '', fill: 'none', stroke: '#3c4558', 'stroke-width': 4 }, svg);
    el('rect', { x: 620, y: 30, width: 280, height: 120, rx: 14, fill: '#2b3242', stroke: '#1d2433', 'stroke-width': 3 }, svg);
    el('text', { x: 640, y: 56, fill: '#c9ced6', 'font-size': 15, 'font-weight': 700, text: '디지털 온도계' }, svg);
    const tRead = el('text', { x: 856, y: 118, 'text-anchor': 'end', fill: '#9cf0b0', 'font-size': 54, 'font-weight': 700, 'font-family': 'IBM Plex Mono, monospace', text: '24.5' }, svg);
    el('text', { x: 862, y: 118, fill: '#9cf0b0', 'font-size': 20, text: '°C' }, svg);
    const tTag = el('text', { x: 640, y: 138, fill: '#ffe27a', 'font-size': 15, 'font-weight': 700, text: '' }, svg);
    const probe = el('g', {}, svg);
    el('rect', { x: -4, y: -90, width: 8, height: 90, fill: '#c9ced6', stroke: '#1d2433', 'stroke-width': 2 }, probe);
    el('rect', { x: -9, y: -110, width: 18, height: 26, rx: 4, fill: '#3c4558' }, probe);
    const rod = el('line', { x1: 0, y1: 0, x2: 0, y2: 0, stroke: '#9fc3d6', 'stroke-width': 7, 'stroke-linecap': 'round', opacity: 0 }, svg);
    // BTB 스포이트
    const btbHome = [400, 330];
    const btb = el('g', { class: 'ab-hand', tabindex: 0, role: 'button', 'aria-label': 'BTB 용액 스포이트(끌어서 홈에 놓기)' }, svg);
    el('rect', { class: 'ab-hit', x: -30, y: -90, width: 60, height: 110 }, btb);
    el('path', { d: 'M-6 0 L-6 -50 L6 -50 L6 0 L0 10 Z', fill: '#e8f3ea', stroke: '#1d2433', 'stroke-width': 2 }, btb);
    el('rect', { x: -5, y: -30, width: 10, height: 28, fill: '#3fa65c' }, btb);
    el('ellipse', { cx: 0, cy: -66, rx: 13, ry: 18, fill: '#3c4558', stroke: '#1d2433', 'stroke-width': 2 }, btb);
    el('text', { class: 'ab-small', y: 34, text: 'BTB', 'font-size': 15 }, btb);
    let bx = btbHome[0], by = btbHome[1];
    const placeB = () => btb.setAttribute('transform', `translate(${bx} ${by})`); placeB();
    // 피펫
    const P = ['a', 'b'].map((k) => {
      const s = STOCK[k], g = el('g', { 'aria-label': s.name + ' 피펫' }, svg);
      const body = el('g', { class: 'ab-hand', tabindex: 0, role: 'button', 'aria-label': s.name + ' 피펫 옮기기' }, g);
      el('rect', { class: 'ab-hit', x: -26, y: -260, width: 52, height: 262 }, body);
      el('path', { d: 'M-7 -250 V-20 L-2 0 H2 L7 -20 V-250 Z', fill: '#f4fafd', stroke: '#1d2433', 'stroke-width': 2.5 }, body);
      const col = el('rect', { x: -5, y: 0, width: 10, height: 0, fill: k === 'a' ? '#8fc0de' : '#8fa6de' }, body);
      for (let m = 1; m <= 10; m++) el('line', { x1: 7, x2: m % 5 ? 13 : 18, y1: -m * ML, y2: -m * ML, stroke: '#1d2433', 'stroke-width': 1.5 }, body);
      el('text', { x: 20, y: -10 * ML + 5, 'font-size': 13, fill: '#4b566a', text: '10' }, body);
      el('text', { x: 20, y: -5 * ML + 5, 'font-size': 13, fill: '#4b566a', text: '5' }, body);
      el('rect', { x: -14, y: -300, width: 28, height: 52, rx: 8, fill: k === 'a' ? '#d95560' : '#2c62c6', stroke: '#1d2433', 'stroke-width': 2.5 }, g);
      const wheel = el('g', { class: 'ab-hand', tabindex: 0, role: 'slider', 'aria-label': s.name + ' 피펫 필러 바퀴(위로 굴리면 빨아올리고 아래로 굴리면 내보낸다)' }, g);
      el('circle', { class: 'ab-hit', cx: 0, cy: -275, r: 44 }, wheel);
      el('circle', { cx: 0, cy: -275, r: 20, fill: '#f2f2f2', stroke: '#1d2433', 'stroke-width': 2.5 }, wheel);
      const spokes = el('g', {}, wheel);
      for (let j = 0; j < 6; j++) el('line', { x1: 0, y1: -275, x2: 0, y2: -293, stroke: '#1d2433', 'stroke-width': 2.5, transform: `rotate(${j * 60} 0 -275)` }, spokes);
      const volT = el('text', { x: -24, y: -230, 'text-anchor': 'end', 'font-size': 18, 'font-weight': 800, fill: '#1d2433', text: '' }, g);
      el('text', { x: 0, y: -312, 'text-anchor': 'middle', 'font-size': 14, 'font-weight': 700, fill: '#1d2433', text: k === 'a' ? '염산용' : '수산화 나트륨용' }, g);
      const home = [s.x, 540];
      return { k, s, g, body, wheel, spokes, col, volT, x: home[0], y: home[1], home, vol: 0, at: 'stock', spin: 0 };
    });
    function placeP(p) {
      p.g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
      p.col.setAttribute('y', (-p.vol * ML).toFixed(1)); p.col.setAttribute('height', (p.vol * ML).toFixed(1));
      p.volT.textContent = p.vol ? `${p.vol} mL` : '';
      p.spokes.setAttribute('transform', `rotate(${p.spin.toFixed(1)} 0 -275)`);
    }
    P.forEach(placeP);
    const wellAt = (x, y) => W.find((w) => Math.abs(w.x - x) < 46 && y > WY - 70 && y < WY + 50);
    function paintWell(w) {
      const tot = w.a + w.b;
      w.liq.setAttribute('r', (tot / 12 * (WR - 4)).toFixed(1));
      w.liq.setAttribute('fill', w.btb && tot ? ind('btb', MIX.kind(w.a, w.b)) : '#dbe9f2');
      w.vol.textContent = tot ? `${w.a}+${w.b}` : '';
      const tr = tbody.querySelector(`tr[data-i="${w.i}"]`), plan = PLAN[w.i];
      tr.querySelector('.pa').innerHTML = tot || !plan ? (w.a ? `${w.a}` : (tot ? '0' : '')) : `<span class="ab-plan">${plan[0]}</span>`;
      tr.querySelector('.pb').innerHTML = tot || !plan ? (w.b ? `${w.b}` : (tot ? '0' : '')) : `<span class="ab-plan">${plan[1]}</span>`;
      tr.querySelector('.pt').innerHTML = w.T == null ? '' : `${w.T.toFixed(1)}${w.src === 'model' ? '<small>모형</small>' : ''}`;
      const k = MIX.kind(w.a, w.b), cname = { a: '노란색', n: '초록색', b: '파란색' }[k];
      tr.querySelector('.pc').innerHTML = w.btb && tot ? `<span class="ab-cell"><i style="--c:${ind('btb', k)}"></i>${cname}</span>` : '';
    }
    W.forEach(paintWell);
    // 측정
    let meas = null;
    function measure(w) {
      const r = MIX.temp(w.a, w.b);
      meas = { w, t: 0, T: r.T, src: (!w.a || !w.b) ? 'none' : r.src };
      probe.setAttribute('transform', `translate(${w.x + 14} ${WY + 10})`);
      cable.setAttribute('d', `M${w.x + 14} ${WY - 100} C ${w.x + 14} 230, 760 260, 760 150`);
      rod.setAttribute('opacity', 0.9);
      tTag.textContent = '젓는 중…'; l.start();
    }
    function finish() {
      const w = meas.w; w.T = meas.T; w.src = meas.src; w.done = true;
      state.lab[NAMES[w.i]] = { a: w.a, b: w.b, T: w.T, src: w.src, k: MIX.kind(w.a, w.b) };
      document.dispatchEvent(new CustomEvent('ab-lab'));
      tRead.textContent = w.T.toFixed(1);
      tTag.textContent = w.src === 'none' ? '한 가지만 넣어 반응 없음' : `${NAMES[w.i]} 최고 온도${w.src === 'model' ? ' (모형 값)' : ''}`;
      rod.setAttribute('opacity', 0); paintWell(w);
      let say = `<b>${NAMES[w.i]}</b> (염산 ${w.a} mL + 수산화 나트륨 ${w.b} mL): 온도가 더 오르지 않을 때 <b>${w.T.toFixed(1)} °C</b>`;
      if (w.i === 2 && state.pred != null) say += ` · 내 예측은 ${state.pred.toFixed(1)} °C`;
      msg.innerHTML = say + '. BTB 스포이트를 끌어 넣어 보자.';
      meas = null; hint();
    }
    function hint() {
      const n = W.filter((w) => w.done).length;
      const p = P.find((q) => q.vol > 0);
      now.textContent = n >= 5 ? '다섯 홈 끝 — 최고 온도가 가장 높은 홈은?'
        : p ? `② ${p.s.short || p.s.name} 피펫을 홈으로 끌어 바퀴를 아래로` : n ? `③ 다음 홈도 합이 12 mL가 되게 (${n}/5)` : '① 염산 피펫의 바퀴를 위로 굴려 빨아올리자';
      now.classList.toggle('done', n >= 5);
    }
    // 피펫 옮기기
    P.forEach((p) => {
      let ox = 0, oy = 0;
      grab(p.body, svg, {
        start(q) { ox = q.x - p.x; oy = q.y - p.y; p.at = null; svg.appendChild(p.g); },
        move(q) { p.x = clamp(q.x - ox, 40, 960); p.y = clamp(q.y - oy, 320, 560); placeP(p); },
        end() {
          const w = wellAt(p.x, p.y);
          if (Math.abs(p.x - p.s.x) < 70 && p.y > 400) { p.x = p.home[0]; p.y = p.home[1]; p.at = 'stock'; msg.textContent = '병에 담갔다. 바퀴를 위로 굴리면 빨려 올라온다.'; }
          else if (w) { p.x = w.x - 16; p.y = WY - 6; p.at = w; msg.innerHTML = `<b>${NAMES[w.i]}</b> 홈 위. 바퀴를 아래로 굴리면 들어간다.`; }
          else if (Math.abs(p.x - STOCK[p.k === 'a' ? 'b' : 'a'].x) < 70 && p.y > 400) { p.x = p.home[0]; p.y = p.home[1]; p.at = 'stock'; msg.textContent = '피펫은 용액마다 따로 쓴다. 제 병으로 돌려놓았다.'; }
          else { p.x = p.home[0]; p.y = p.home[1]; p.at = 'stock'; }
          placeP(p); hint();
        },
      });
      let y0 = 0, v0 = 0;
      const turn = (nv) => {
        if (p.at === 'stock') { nv = clamp(nv, 0, 10); }
        else if (p.at && p.at.i != null) {
          const w = p.at; if (w.done || meas) { msg.textContent = '이 홈은 이미 측정했다. 다른 홈을 쓰거나 홈판을 씻자.'; return; }
          const room = 12 - w.a - w.b; nv = clamp(nv, Math.max(0, p.vol - room), p.vol);
          const d = p.vol - nv; if (d) { w[p.k] += d; paintWell(w); if (w.a + w.b >= 12) { p.vol = nv; if (!nv) { p.x = p.home[0]; p.y = p.home[1]; p.at = 'stock'; } placeP(p); measure(w); return; } }
        } else return;
        p.vol = nv;
        if (!nv && p.at && p.at.i != null) { p.x = p.home[0]; p.y = p.home[1]; p.at = 'stock'; }   // 다 내보낸 피펫은 제 병으로
        placeP(p); hint();
      };
      grab(p.wheel, svg, {
        start(q) { y0 = q.y; v0 = p.vol; if (!p.at) return false; },
        move(q) { p.spin = (y0 - q.y) * 3; turn(v0 + Math.round((y0 - q.y) / ML)); placeP(p); },
      });
      p.wheel.addEventListener('keydown', (e) => { const d = { ArrowUp: 1, ArrowDown: -1 }[e.key]; if (d) { e.preventDefault(); e.stopPropagation(); turn(p.vol + d); } });
      p.api = { turn };
    });
    // BTB 넣기
    grab(btb, svg, {
      move(q) { bx = q.x; by = q.y; placeB(); },
      end() { const w = wellAt(bx, by + 10); if (w && w.a + w.b > 0) { w.btb = true; paintWell(w); msg.innerHTML = `<b>${NAMES[w.i]}</b>에 BTB 용액 2~3방울 → ${{ a: '노란색(산성)', n: '초록색(중성)', b: '파란색(염기성)' }[MIX.kind(w.a, w.b)]}`; } bx = btbHome[0]; by = btbHome[1]; placeB(); },
    });
    root.querySelector('.ab-pp-reset').addEventListener('click', () => { W.forEach((w) => { w.a = 0; w.b = 0; w.T = null; w.btb = false; w.done = false; paintWell(w); }); state.lab = {}; document.dispatchEvent(new CustomEvent('ab-lab')); tRead.textContent = '24.5'; tTag.textContent = ''; msg.textContent = '홈판을 씻었다.'; hint(); });
    const l = loop((dt) => {
      if (!meas) { l.stop(); return; }
      meas.t += dt;
      const u = 1 - Math.exp(-meas.t / 0.9), v = MIX.T0 + (meas.T - MIX.T0) * u;
      tRead.textContent = v.toFixed(1);
      const w = meas.w, a = meas.t * 7;
      rod.setAttribute('x1', w.x + 40 * Math.cos(a) * 0.4); rod.setAttribute('y1', WY - 110); rod.setAttribute('x2', w.x + 22 * Math.cos(a)); rod.setAttribute('y2', WY + 10 * Math.sin(a));
      if (meas.t > 3.2) finish();
    });
    hint();
    root._pp = {
      fill(i, a, b, withBtb = true) { const w = W[i]; w.a = a; w.b = b; w.btb = withBtb; paintWell(w); const r = MIX.temp(a, b); meas = { w, t: 9, T: r.T, src: (!a || !b) ? 'none' : r.src }; finish(); },
      draw(k, n) { const p = P.find((q) => q.k === k); p.at = 'stock'; p.api.turn(n); },
      to(k, i) { const p = P.find((q) => q.k === k), w = W[i]; p.x = w.x - 16; p.y = WY - 6; p.at = w; placeP(p); },
      give(k, n) { const p = P.find((q) => q.k === k); p.api.turn(p.vol - n); },
    };
    return { setActive(on) { if (!on) l.stop(); else if (meas) l.start(); } };
  }
  window.ABPipette = { mount };
})();
