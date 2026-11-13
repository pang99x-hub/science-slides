/* 1차시 3장(교과서 47쪽 그림 Ⅰ-25): 묽은 염산·수산화 나트륨 수용액 병을 끌어 시험관 위에서 아래로 끌면 병이 기울고,
   많이 기울일수록 빨리 부어진다. 염산 + 마그네슘 → 수소 거품, 염산 + 달걀 껍데기 → 이산화 탄소 거품,
   수산화 나트륨 + 두부 → 겉이 흐물흐물. 나머지는 변화 없음. 거품 양·속도는 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const { el, grab, loop, clamp } = window.AB;
  const TX = [140, 270, 400, 600, 730, 860], TOP = 300, BOT = 560;
  const ITEM = ['mg', 'egg', 'tofu', 'mg', 'egg', 'tofu'];
  const INAME = { mg: '마그네슘 리본', egg: '달걀 껍데기', tofu: '두부' };
  const RESULT = { 'a-mg': ['y', '거품 — 수소 기체', '수소', 'Mg + 2HCl → MgCl_2 + H_2'], 'a-egg': ['y', '거품 — 이산화 탄소 기체', '이산화 탄소', 'CaCO_3 + 2HCl → CaCl_2 + H_2O + CO_2'], 'b-tofu': ['y', '겉이 흐물흐물해짐', '', ''] };
  const LNAME = { a: '묽은 염산', b: '수산화 나트륨 수용액' };

  function mount(root) {
    const svg = root.querySelector('.ab-po-svg'), now = root.querySelector('.ab-po-now'), msg = root.querySelector('.ab-po-msg');
    const tbl = root.querySelector('.ab-po-tbl');
    el('rect', { x: 0, y: 600, width: 1000, height: 60, fill: '#e6dccb' }, svg);
    el('rect', { x: 80, y: 530, width: 840, height: 40, rx: 6, fill: '#c9a77c', stroke: '#1d2433', 'stroke-width': 3 }, svg);
    el('rect', { x: 80, y: 340, width: 840, height: 22, rx: 6, fill: '#c9a77c', stroke: '#1d2433', 'stroke-width': 3 }, svg);
    const defs = el('defs', {}, svg);
    const T = TX.map((x, i) => {
      const d = `M${x - 28} ${TOP} V${BOT - 28} A28 28 0 0 0 ${x + 28} ${BOT - 28} V${TOP}`;
      const cp = el('clipPath', { id: `ab-po-cp${i}` }, defs); el('path', { d }, cp);
      const g = el('g', { class: 'ab-po-tube', tabindex: 0, role: 'button', 'aria-label': `${INAME[ITEM[i]]} 시험관(누르면 비운다)` }, svg);
      el('path', { d: d + ' Z', fill: '#eef6fa', 'fill-opacity': 0.7 }, g);
      const inner = el('g', { 'clip-path': `url(#ab-po-cp${i})` }, g);
      const liq = el('rect', { x: x - 30, y: BOT, width: 60, height: 0, fill: '#d6eaf5', opacity: 0.85 }, inner);
      const item = el('g', {}, inner);
      const bub = el('g', {}, inner);
      el('path', { d, fill: 'none', stroke: '#1d2433', 'stroke-width': 3 }, g);
      el('ellipse', { cx: x, cy: TOP, rx: 30, ry: 6, fill: 'none', stroke: '#1d2433', 'stroke-width': 3 }, g);
      el('text', { class: 'ab-small', x, y: 594, text: INAME[ITEM[i]] }, svg);
      const gas = el('text', { class: 'ab-label', x, y: TOP - 18, text: '', 'font-size': 18 }, svg);
      const t = { i, x, g, liq, item, bub, gas, k: ITEM[i], l: null, v: 0, p: 0, t: 0, bubbles: [], spawn: 0, logged: false };
      drawItem(t);
      return t;
    });
    function drawItem(t) {
      t.item.innerHTML = '';
      const x = t.x, s = 1 - (t.k === 'tofu' ? 0 : t.p * 0.75);
      if (t.k === 'mg') el('rect', { x: x - 5, y: BOT - 6 - 80 * s, width: 10, height: 80 * s, rx: 2, fill: '#a7b0ba', stroke: '#1d2433', 'stroke-width': 2 }, t.item);
      if (t.k === 'egg') [[-12, -14, 12], [8, -10, 10], [-2, -26, 9]].forEach(([dx, dy, r]) => el('path', { d: `M${x + dx - r * s} ${BOT + dy} l${r * s} ${-r * s * 1.1} l${r * s * 1.1} ${r * s * 0.6} l${-r * s * 0.4} ${r * s * 0.8} z`, fill: '#f6efe2', stroke: '#1d2433', 'stroke-width': 1.6 }, t.item));
      if (t.k === 'tofu') {
        const m = t.p, w = 38 - 6 * m, h = 32 - 8 * m;
        el('rect', { x: x - w / 2, y: BOT - 8 - h, width: w, height: h, rx: 3 + 12 * m, fill: '#f5eed6', 'fill-opacity': 1 - 0.45 * m, stroke: '#1d2433', 'stroke-width': 2, 'stroke-dasharray': m > 0.3 ? '5 4' : null }, t.item);
        if (m > 0.2) el('ellipse', { cx: x, cy: BOT - 10, rx: 22, ry: 6, fill: '#f5eed6', opacity: 0.5 * m }, t.item);
      }
    }
    // 병
    const B = ['a', 'b'].map((l) => {
      const home = l === 'a' ? [110, 140] : [890, 140], s = l === 'a' ? 1 : -1;
      const g = el('g', { class: 'ab-po-bottle ab-hand', tabindex: 0, role: 'button', 'aria-label': LNAME[l] + ' 병(끌어서 기울이기)' }, svg);
      el('rect', { class: 'ab-hit', x: -70, y: -110, width: 140, height: 210 }, g);
      el('path', { class: 'ab-po-body', d: 'M-44 82 V-20 Q-44 -46 -16 -54 V-88 H16 V-54 Q44 -46 44 -20 V82 Q44 90 36 90 H-36 Q-44 90 -44 82 Z', fill: '#eef6fa' }, g);
      el('path', { d: 'M-38 82 V0 H38 V82 Q38 84 34 84 H-34 Q-38 84 -38 82 Z', fill: l === 'a' ? '#e3f0f6' : '#e6eef6' }, g);
      el('rect', { x: -41, y: 14, width: 82, height: 50, rx: 4, fill: '#fff', stroke: '#1d2433', 'stroke-width': 2 }, g);
      const tx = el('text', { class: 'ab-label', y: l === 'a' ? 46 : 36, 'font-size': l === 'a' ? 17 : 13 }, g);
      if (l === 'a') tx.textContent = '묽은 염산';
      else { tx.textContent = '수산화 나트륨'; el('text', { class: 'ab-label', y: 54, 'font-size': 13, text: '수용액' }, g); }
      el('rect', { x: -14, y: -96, width: 28, height: 10, rx: 3, fill: l === 'a' ? '#d95560' : '#2c62c6', stroke: '#1d2433', 'stroke-width': 2 }, g);
      const b = { l, g, home, s, x: home[0], y: home[1], ang: 0, held: false };
      return b;
    });
    const stream = el('path', { d: '', stroke: '#9cc7e2', 'stroke-width': 7, 'stroke-linecap': 'round', fill: 'none', opacity: 0.9 }, svg);
    svg.appendChild(B[0].g); svg.appendChild(B[1].g);
    const place = (b) => b.g.setAttribute('transform', `translate(${b.x.toFixed(1)} ${b.y.toFixed(1)}) rotate(${(b.s * b.ang).toFixed(1)})`);
    B.forEach(place);
    let cur = null, offx = 0, offy = 0, pourT = null, missMsg = 0;
    B.forEach((b) => grab(b.g, svg, {
      start(p) { cur = b; b.held = true; offx = p.x - b.x; offy = p.y - b.y; l.start(); },
      move(p) {
        b.x = clamp(p.x - offx, 70, 930);
        const want = p.y - offy;
        if (want <= 205) { b.y = Math.max(90, want); b.ang = 0; } else { b.y = 205; b.ang = clamp((want - 205) * 0.9, 0, 120); }
        place(b);
      },
      end() { b.held = false; cur = null; },
    }));
    const mouth = (b) => { const a = b.ang * Math.PI / 180; return [b.x + b.s * 100 * Math.sin(a), b.y - 100 * Math.cos(a)]; };
    function log(t) {
      if (t.logged || !t.l) return;
      const r = RESULT[`${t.l}-${t.k}`] || ['n', '변화 없음', ''];
      const td = tbl.querySelector(`tr[data-l="${t.l}"] td[data-s="${t.k}"]`);
      td.textContent = r[1]; td.className = r[0] + ' new';
      t.logged = true;
      msg.innerHTML = r[3] ? `${LNAME[t.l]} + ${INAME[t.k]}: <b>${window.AB.chemHTML(r[3])}</b>` : `${LNAME[t.l]} + ${INAME[t.k]}: ${r[1]}`;
      const n = tbl.querySelectorAll('td.y, td.n').length;
      now.textContent = n >= 6 ? '산과 염기가 어떻게 달랐나?' : B.every((x) => tbl.querySelector(`tr[data-l="${x.l}"] td.y, tr[data-l="${x.l}"] td.n`)) ? '③ 아직 안 부은 시험관도 채워 보자' : '② 다른 병도 다른 줄 시험관에 부어 보자';
      now.classList.toggle('done', n >= 6);
    }
    function empty(t) {
      t.l = null; t.v = 0; t.p = 0; t.t = 0; t.logged = false; t.jolted = false; t.gas.textContent = '';
      t.bubbles.forEach((q) => q.n.remove()); t.bubbles = [];
      t.liq.setAttribute('y', BOT); t.liq.setAttribute('height', 0); drawItem(t);
      msg.textContent = `${INAME[t.k]} 시험관을 비우고 새것을 넣었다.`;
    }
    T.forEach((t) => { t.g.addEventListener('click', () => empty(t)); t.g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); empty(t); } }); });
    function pour(t, l, amt) {
      if (t.l && t.l !== l) { msg.textContent = `이 시험관에는 이미 ${LNAME[t.l]}이 들어 있다. 시험관을 눌러 비우고 붓자.`; return false; }
      if (t.v >= 1) { msg.textContent = '시험관이 가득 찼다.'; return false; }
      t.l = l; t.v = Math.min(1, t.v + amt);
      const h = t.v * 150; t.liq.setAttribute('y', (BOT - h).toFixed(1)); t.liq.setAttribute('height', h.toFixed(1));
      return true;
    }
    const l = loop((dt) => {
      let any = !!cur;
      // 붓기
      stream.setAttribute('d', '');
      for (const b of B) {
        if (!b.held && (b.ang > 0 || Math.hypot(b.x - b.home[0], b.y - b.home[1]) > 0.5)) {
          b.ang = Math.max(0, b.ang - 300 * dt); b.x += (b.home[0] - b.x) * Math.min(1, dt * 8); b.y += (b.home[1] - b.y) * Math.min(1, dt * 8); place(b); any = true;
        }
        if (b.held && b.ang > 70) {
          const [mx, my] = mouth(b), t = T.find((q) => Math.abs(q.x - mx) < 34);
          const rate = (b.ang - 70) / 50 * 0.45 * dt;
          const yEnd = t ? BOT - t.v * 150 : 600;
          stream.setAttribute('d', `M${mx.toFixed(1)} ${my.toFixed(1)} Q${(mx + b.s * 6).toFixed(1)} ${((my + yEnd) / 2).toFixed(1)} ${t ? t.x : mx} ${yEnd}`);
          stream.setAttribute('stroke', b.l === 'a' ? '#a9d0e8' : '#a9bfe8');
          if (t) { if (pour(t, b.l, rate)) msg.innerHTML = `${INAME[t.k]}에 <b>${LNAME[b.l]}</b>을 붓는 중`; }
          else if (performance.now() - missMsg > 1500) { missMsg = performance.now(); msg.textContent = '병 입구가 시험관 바로 위에 오게 옮겨 보자.'; }
        }
      }
      // 반응
      for (const t of T) {
        if (!t.l || t.v < 0.12) continue;
        const r = RESULT[`${t.l}-${t.k}`];
        t.t += dt;
        if (r) {
          // 마그네슘이 염산에서 거세게 거품을 내기 시작하는 순간: 화면 흔들림 + 진동(지원 기기만), 시험관마다 한 번
          if (!t.jolted && t.k === 'mg' && t.v > 0.3) { t.jolted = true; if (window.RxT && window.RxT.jolt) window.RxT.jolt(svg.parentElement, 2); }
          if (t.p < 1) { t.p = Math.min(1, t.p + dt * 0.05 * (0.4 + t.v)); drawItem(t); any = true; }
          if (t.k !== 'tofu') {
            t.spawn -= dt * (1 - t.p * 0.8) * (6 + 14 * t.v);
            while (t.spawn < 0) { t.spawn += 1; const n = el('circle', { class: 'ab-bub', cx: t.x + (Math.random() - 0.5) * 30, cy: BOT - 16, r: 3 + Math.random() * 4 }, t.bub); t.bubbles.push({ n, y: BOT - 16, vy: 50 + Math.random() * 50 }); }
            if (t.p > 0.08) t.gas.textContent = r[2] + ' 기체';
          }
          if (t.p > 0.15) log(t);
        } else if (t.t > 2.5) log(t);
        for (let j = t.bubbles.length - 1; j >= 0; j--) {
          const q = t.bubbles[j]; q.y -= q.vy * dt;
          if (q.y < BOT - t.v * 150) { q.n.remove(); t.bubbles.splice(j, 1); } else q.n.setAttribute('cy', q.y.toFixed(1));
        }
        if (t.bubbles.length || (r && t.p < 1) || !t.logged) any = true;
      }
      if (!any) l.stop();
    });
    root._po = {
      pour(i, lq, v) { pour(T[i], lq, v); l.start(); },
      tilt(lq, x, ang) { const b = B.find((q) => q.l === lq); b.held = true; b.x = x; b.y = 205; b.ang = ang; place(b); l.start(); },
      release() { B.forEach((b) => { b.held = false; }); },
    };
    return { setActive(on) { if (on) l.start(); else l.stop(); } };
  }
  window.ABPour = { mount };
})();
