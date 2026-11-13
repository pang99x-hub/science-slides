/* 4차시 4장(교과서 53쪽 그림 Ⅰ-28 · 중화 반응의 이용): 장면 넷(속 쓰림·산성화된 밭·생선 비린내·충치)마다
   알맞은 물질 통을 끌어 대상 위에서 좌우로 흔들면 조금씩 뿌려지고, 아래 액성 띠의 눈금이 움직인다.
   반대 성질을 넣으면 더 나빠지고, 너무 많이 넣으면 반대쪽으로 넘어간다. 눈금 값은 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const { el, grab, loop, mix, clamp } = window.AB;
  const SC = {
    stomach: { name: '속 쓰림', v0: -0.8, why: '위액 속 염산이 너무 많이 나왔다.', acid: '식초', base: '제산제', use: '실제로는 제산제를 <b>먹는다</b>', ok: '제산제의 염기가 넘치는 위산을 중화했다 → 속 쓰림이 가라앉는다.' },
    soil: { name: '산성화된 밭', v0: -0.7, why: '산성비와 비료로 흙이 산성이 되었다.', acid: '식초', base: '석회 가루', use: '실제로도 석회 가루를 밭에 <b>뿌린다</b>', ok: '염기성인 석회 가루가 흙의 산을 중화했다 → 작물이 다시 자란다.' },
    fish: { name: '생선 비린내', v0: 0.65, why: '비린내 성분은 염기성 물질이다.', acid: '레몬즙', base: '제빵 소다', use: '실제로도 레몬즙을 생선에 <b>뿌린다</b>', ok: '산성인 레몬즙이 염기성 비린내 성분을 중화했다.' },
    teeth: { name: '충치 예방', v0: -0.6, why: '입속 세균이 음식물을 분해해 산을 만든다.', acid: '탄산음료', base: '치약', use: '실제로는 치약으로 이를 <b>닦는다</b>', ok: '염기성 성분이 든 치약이 입속의 산을 중화했다.' },
  };
  const ZONE = [120, 120, 540, 330];   // 대상이 있는 곳 x, y, w, h

  function mount(root) {
    const svg = root.querySelector('.ab-sh-svg'), now = root.querySelector('.ab-sh-now'), msg = root.querySelector('.ab-sh-msg');
    const tabs = [...root.querySelectorAll('.ab-sh-tab button')];
    const scene = el('g', {}, svg), tint = el('rect', { x: ZONE[0], y: ZONE[1], width: ZONE[2], height: ZONE[3], rx: 24, opacity: 0.18 }, svg);
    el('rect', { x: ZONE[0], y: ZONE[1], width: ZONE[2], height: ZONE[3], rx: 24, fill: 'none', stroke: '#7b8597', 'stroke-width': 2, 'stroke-dasharray': '10 8' }, svg);
    // 액성 띠
    const defs = el('defs', {}, svg), gr = el('linearGradient', { id: 'ab-sh-gr' }, defs);
    [[0, '#ecc51e'], [0.5, '#3fa65c'], [1, '#2c62c6']].forEach(([o, c]) => el('stop', { offset: o, 'stop-color': c }, gr));
    el('rect', { x: 120, y: 500, width: 540, height: 30, rx: 15, fill: 'url(#ab-sh-gr)', stroke: '#1d2433', 'stroke-width': 2.5 }, svg);
    el('rect', { x: 390 - 0.15 * 270, y: 494, width: 0.3 * 270, height: 42, rx: 8, fill: 'none', stroke: '#1d2433', 'stroke-width': 2.5, 'stroke-dasharray': '5 4' }, svg);
    [['산성', 120], ['중성', 390], ['염기성', 660]].forEach(([t, x]) => el('text', { x, y: 560, 'text-anchor': 'middle', 'font-size': 17, 'font-weight': 700, fill: '#1d2433', text: t }, svg));
    const mark = el('path', { d: 'M0 -10 L-12 -30 H12 Z', fill: '#1d2433' }, svg);
    // 물질 통 둘
    const box = (k, x) => {
      const g = el('g', { class: 'ab-hand', tabindex: 0, role: 'button', 'aria-label': (k === 'a' ? '산성' : '염기성') + ' 물질 통(끌어서 흔들기)' }, svg);
      el('rect', { class: 'ab-hit', x: -60, y: -90, width: 120, height: 170 }, g);
      el('path', { d: 'M-34 60 V-30 Q-34 -50 -14 -54 V-70 H14 V-54 Q34 -50 34 -30 V60 Q34 70 24 70 H-24 Q-34 70 -34 60 Z', fill: k === 'a' ? '#fbefb6' : '#cfdcf5', stroke: '#1d2433', 'stroke-width': 3 }, g);
      for (let i = -1; i <= 1; i++) el('circle', { cx: i * 8, cy: -64, r: 2.5, fill: '#1d2433' }, g);
      const t = el('text', { x: 0, y: 14, 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: '#1d2433' }, g);
      el('text', { x: 0, y: 92, 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: k === 'a' ? '#8a6a00' : '#2c62c6', text: k === 'a' ? '산성' : '염기성' }, g);
      return { k, g, t, hx: x, hy: 200, x, y: 200 };
    };
    const B = [box('a', 780), box('b', 910)];
    const place = (b) => b.g.setAttribute('transform', `translate(${b.x.toFixed(1)} ${b.y.toFixed(1)}) rotate(${b.k === 'a' ? -12 : 12} 0 0)`);
    B.forEach(place);
    const dust = el('g', {}, svg);
    let cur = 'stomach', S = {}, parts = [];
    Object.keys(SC).forEach((k) => { S[k] = { v: SC[k].v0, ok: false }; });
    function art() {
      scene.innerHTML = '';
      const g = el('g', { transform: 'translate(390 290)' }, scene), s = { stroke: '#1d2433', 'stroke-width': 3 };
      const v = S[cur].v, good = Math.abs(v) < 0.15;
      if (cur === 'stomach') {
        el('path', { d: 'M-40 -130 q-6 50 14 76 q-90 6 -86 100 q8 90 120 76 q90 -10 110 -100 q14 -70 -50 -110 q-40 -20 -52 -50 z', fill: '#f2a7a0', ...s }, g);
        el('path', { d: 'M-80 40 q40 -16 80 0 t80 0', fill: 'none', stroke: good ? '#3fa65c' : '#d9483b', 'stroke-width': 5 }, g);
        el('text', { x: 10, y: -10, 'text-anchor': 'middle', 'font-size': 22, 'font-weight': 800, fill: '#1d2433', text: good ? '편안' : '쓰림!' }, g);
      }
      if (cur === 'soil') {
        el('rect', { x: -250, y: 20, width: 500, height: 120, fill: '#8b6a4a', ...s }, g);
        for (let i = -3; i <= 3; i++) { const x = i * 70; el('path', { d: good ? `M${x} 20 V-70 M${x} -30 q-30 -10 -36 -36 M${x} -50 q30 -10 36 -36` : `M${x} 20 q6 -40 30 -60 M${x + 12} -14 q-20 0 -30 -10`, fill: 'none', stroke: good ? '#2f9e5b' : '#a39a5a', 'stroke-width': 6, 'stroke-linecap': 'round' }, g); }
      }
      if (cur === 'fish') {
        el('path', { d: 'M-200 0 Q-60 -110 120 -20 L200 -80 V80 L120 20 Q-60 110 -200 0 Z', fill: '#b9c3cc', ...s }, g);
        el('circle', { cx: -140, cy: -16, r: 9, fill: '#1d2433' }, g);
        if (!good) [-60, 0, 60].forEach((x) => el('path', { d: `M${x} -90 q14 -16 0 -32 q-14 -16 0 -32`, fill: 'none', stroke: '#8a9a5a', 'stroke-width': 5 }, g));
        el('ellipse', { cx: 150, cy: -110, rx: 30, ry: 22, fill: '#f6d23c', stroke: '#1d2433', 'stroke-width': 2 }, g);
      }
      if (cur === 'teeth') {
        el('path', { d: 'M-110 -100 q50 -40 110 0 q60 -40 110 0 q30 60 0 120 q-20 90 -40 120 q-20 10 -30 -40 q-20 -60 -40 0 q-10 50 -30 40 q-20 -30 -40 -120 q-30 -60 0 -120 z', fill: '#fbfbf7', ...s }, g);
        if (!good) [[-40, -40], [50, -20], [0, 30]].forEach(([x, y]) => el('circle', { cx: x, cy: y, r: 12, fill: '#c7a54a', opacity: 0.8 }, g));
      }
      tint.setAttribute('fill', v < 0 ? mix('#3fa65c', '#ecc51e', -v) : mix('#3fa65c', '#2c62c6', v));
      mark.setAttribute('transform', `translate(${(390 + v * 270).toFixed(1)} 500)`);
      B[0].t.textContent = SC[cur].acid; B[1].t.textContent = SC[cur].base;
    }
    function say() {
      const st = S[cur], P = SC[cur];
      if (st.ok && Math.abs(st.v) < 0.15) msg.innerHTML = `<b>${P.name}</b>: ${P.ok}<br><small>${P.use}</small>`;
      else if (Math.sign(st.v) !== Math.sign(P.v0) && Math.abs(st.v) >= 0.15) msg.innerHTML = `<b>너무 많이 넣었다</b> — 이번엔 ${st.v > 0 ? '염기성' : '산성'} 쪽으로 넘어갔다. 반대 성질로 조금 되돌리자.`;
      else msg.innerHTML = `<b>${P.name}</b>: ${P.why} 무엇을 넣어야 중성에 가까워질까?<br><small>통을 대상 위에서 좌우로 움직이면 조금씩 들어간다 · ${P.use}</small>`;
      const n = Object.values(S).filter((x) => x.ok).length;
      tabs.forEach((b) => b.classList.toggle('ok', S[b.dataset.k].ok));
      now.textContent = n >= 4 ? '네 곳 모두 중화했다!' : `알맞은 통을 대상 위로 끌어 좌우로 움직이자 (${n}/4)`;
      now.classList.toggle('done', n >= 4);
    }
    function dose(b) {
      const st = S[cur]; st.v = clamp(st.v + (b.k === 'a' ? -0.05 : 0.05), -1, 1);
      if (Math.abs(st.v) < 0.15) st.ok = true; else if (Math.abs(st.v) >= 0.15 && st.ok && Math.sign(st.v) !== Math.sign(SC[cur].v0)) st.ok = false;
      for (let i = 0; i < 6; i++) { const n = el('circle', { cx: b.x + (Math.random() - 0.5) * 30, cy: b.y - 70, r: 3 + Math.random() * 2, fill: b.k === 'a' ? '#d8b21a' : '#5a7fd0' }, dust); parts.push({ n, x: +n.getAttribute('cx'), y: b.y - 70, vy: 60 + Math.random() * 80 }); }
      art(); say(); l.start();
    }
    const inZone = (b) => b.x > ZONE[0] && b.x < ZONE[0] + ZONE[2] && b.y - 70 > ZONE[1] - 60 && b.y < ZONE[1] + ZONE[3];
    B.forEach((b) => {
      let ox = 0, oy = 0, dir = 0, lx = 0, run = 0;
      grab(b.g, svg, {
        start(p) { ox = p.x - b.x; oy = p.y - b.y; dir = 0; lx = p.x; run = 0; },
        move(p) {
          b.x = clamp(p.x - ox, 40, 970); b.y = clamp(p.y - oy, 100, 470); place(b);
          const dx = p.x - lx; lx = p.x; run += Math.abs(dx);
          const d = Math.sign(dx);
          if (d && d !== dir && run > 24) { if (inZone(b)) dose(b); run = 0; }
          if (d) dir = d;
        },
        end() { if (!inZone(b)) msg.textContent = '통을 점선 칸(대상) 위로 가져가 좌우로 움직여야 들어간다.'; b.x = b.hx; b.y = b.hy; place(b); },
      });
      b.g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); dose(b); } });
    });
    const l = loop((dt) => {
      for (let i = parts.length - 1; i >= 0; i--) { const q = parts[i]; q.vy += 300 * dt; q.y += q.vy * dt; if (q.y > 440) { q.n.remove(); parts.splice(i, 1); } else q.n.setAttribute('cy', q.y.toFixed(1)); }
      if (!parts.length) l.stop();
    });
    tabs.forEach((b) => b.addEventListener('click', () => { cur = b.dataset.k; tabs.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); art(); say(); }));
    art(); say();
    root._sh = { scene(k) { tabs.find((b) => b.dataset.k === k).click(); }, dose(k, n) { for (let i = 0; i < n; i++) dose(B.find((b) => b.k === k)); } };
    return { setActive(on) { if (!on) l.stop(); } };
  }
  window.ABShake = { mount };
})();
