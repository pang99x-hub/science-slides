/* 1차시 3장(교과서 20쪽): 돌연변이. 위: DNA 한 가닥(14염기)과 노란 지퍼 손잡이. 손잡이를 오른쪽으로 밀면 짝(A–T, G–C)이 맞는 새 가닥이 생긴다.
   베낄 때마다 일정 확률로 한 자리가 틀린다(이해를 돕기 위한 예: 실제로는 훨씬 드물다). 끝까지 밀면 씨앗이 꽃밭에 떨어져 자란다.
   틀린 자리가 «꽃 크기» 구간(5~9번)이면 큰달맞이꽃(키·꽃이 크고 암술이 수술보다 길다), 다른 구간이면 겉모습은 그대로.
   큰달맞이꽃이 피면 곁에 그 씨앗에서 난 자손(역시 큰달맞이꽃)이 돋는다. */
(function () {
  'use strict';
  const K = window.EvKit, { el, clamp } = K;
  const SEQ = 'ATGCGTACCTGAGT'.split('');
  const PAIR = { A: 'T', T: 'A', G: 'C', C: 'G' };
  const COL = { A: '#d8573f', T: '#3a78c2', G: '#2f9e5b', C: '#b08a1e' };
  const X0 = 110, DX = 62, Y1 = 120, Y2 = 200, GENE = [5, 9];

  function flower(p, x, big, kid) {
    const g = el('g', { transform: `translate(${x} 640)` }, p);
    const s = (big ? 1.45 : 1) * (kid ? 0.62 : 1);
    const h = (big ? 230 : 160) * (kid ? 0.6 : 1);
    const stem = el('path', { d: `M0 0 C 6 ${-h * 0.4}, -6 ${-h * 0.7}, 0 ${-h}`, fill: 'none', stroke: '#4f8a3c', 'stroke-width': 6, 'stroke-linecap': 'round' }, g);
    el('path', { d: `M0 ${-h * 0.35} q 30 -10 40 -34 q -30 4 -40 34 Z M0 ${-h * 0.55} q -30 -10 -38 -32 q 28 4 38 32 Z`, fill: '#6aa564', stroke: '#1d2433', 'stroke-width': 2 }, g);
    const head = el('g', { transform: `translate(0 ${-h}) scale(${s})` }, g);
    for (let i = 0; i < 4; i++) el('path', { d: 'M0 0 C -18 -8, -26 -34, 0 -40 C 26 -34, 18 -8, 0 0 Z', fill: '#f7d23a', stroke: '#1d2433', 'stroke-width': 2 / s, transform: `rotate(${i * 90 + 45})` }, head);
    // 수술(짧은 선 넷)과 암술(가운데, 큰달맞이꽃은 길다)
    for (let i = 0; i < 4; i++) el('path', { d: `M0 0 L ${Math.cos(i * 1.57 + 0.4) * 12} ${Math.sin(i * 1.57 + 0.4) * 12 - 10}`, stroke: '#b9781a', 'stroke-width': 2.5 / s }, head);
    el('path', { d: `M0 0 L 0 ${big ? -30 : -13}`, stroke: '#7a5a18', 'stroke-width': 3 / s }, head);
    el('circle', { cx: 0, cy: big ? -30 : -13, r: 3.5 / s * 1.2, fill: '#7a5a18' }, head);
    if (window.gsap && !K.reduce) gsap.from(g, { scaleY: 0, transformOrigin: '50% 100%', duration: 0.9, ease: 'power2.out' });
    void stem;
    return g;
  }

  function mount(root) {
    const svg = root.querySelector('.ev-mu-svg'), now = root.querySelector('.ev-mu-now'), msg = root.querySelector('.ev-mu-msg');
    const nA = root.querySelector('.ev-mu-a'), nB = root.querySelector('.ev-mu-b');
    el('rect', { x: 0, y: 0, width: 1056, height: 680, fill: '#f6f3ea' }, svg);
    el('rect', { x: 0, y: 330, width: 1056, height: 350, fill: '#dbe9d2' }, svg);
    el('rect', { x: 0, y: 630, width: 1056, height: 50, fill: '#a98a5f' }, svg);
    el('path', { d: 'M0 330 H1056', stroke: '#1d2433', 'stroke-width': 2 }, svg);
    el('text', { class: 'ev-lab', x: 24, y: 40 }, svg).textContent = '부모 식물의 DNA';
    el('text', { class: 'ev-lab', x: 24, y: 290 }, svg).textContent = '씨앗에 들어갈 새 DNA';
    // 꽃 크기 유전자 구간 표시
    const gx = X0 + GENE[0] * DX - 30, gw = (GENE[1] - GENE[0] + 1) * DX;
    el('rect', { x: gx, y: 70, width: gw, height: 176, rx: 12, fill: 'rgba(247,210,58,.18)', stroke: '#c79a12', 'stroke-width': 2, 'stroke-dasharray': '8 6' }, svg);
    el('text', { class: 'ev-lab', x: gx + gw / 2, y: 64, 'text-anchor': 'middle', fill: '#8a6a00' }, svg).textContent = '꽃 크기 유전자';
    el('path', { d: `M${X0 - 30} ${Y1} H ${X0 + 13 * DX + 30}`, stroke: '#4b566a', 'stroke-width': 6, 'stroke-linecap': 'round' }, svg);
    SEQ.forEach((b, i) => {
      const x = X0 + i * DX;
      el('path', { d: `M${x} ${Y1} V ${Y1 + 22}`, stroke: '#4b566a', 'stroke-width': 4 }, svg);
      el('rect', { x: x - 24, y: Y1 - 26, width: 48, height: 48, rx: 8, fill: COL[b], stroke: '#1d2433', 'stroke-width': 2.5 }, svg);
      el('text', { class: 'ev-bt', x, y: Y1 + 8 }, svg).textContent = b;
    });
    const newG = el('g', {}, svg);
    const backbone = el('path', { stroke: '#4b566a', 'stroke-width': 6, 'stroke-linecap': 'round', fill: 'none' }, newG);
    const tiles = SEQ.map((b, i) => {
      const x = X0 + i * DX, g = el('g', { opacity: 0 }, newG);
      el('path', { d: `M${x} ${Y1 + 22} V ${Y2 - 4}`, stroke: '#4b566a', 'stroke-width': 4, 'stroke-dasharray': '5 4' }, g);
      const r = el('rect', { x: x - 24, y: Y2 - 4, width: 48, height: 48, rx: 8, stroke: '#1d2433', 'stroke-width': 2.5 }, g);
      const t = el('text', { class: 'ev-bt', x, y: Y2 + 28 }, g);
      const ring = el('rect', { x: x - 31, y: Y2 - 11, width: 62, height: 62, rx: 12, fill: 'none', stroke: '#d9483b', 'stroke-width': 5, opacity: 0 }, g);
      return { g, r, t, ring };
    });
    // 지퍼 손잡이
    const rail = el('path', { d: `M${X0 - 40} 160 H ${X0 + 13 * DX + 40}`, stroke: 'rgba(29,36,51,.18)', 'stroke-width': 18, 'stroke-linecap': 'round' }, svg);
    void rail;
    const hand = el('g', { class: 'ev-handle', tabindex: '0', role: 'slider', 'aria-label': 'DNA 복제 손잡이', 'aria-valuemin': '0', 'aria-valuemax': '14' }, svg);
    el('path', { d: 'M-22 -34 H 22 L 30 34 H -30 Z', fill: '#f2c230', stroke: '#1d2433', 'stroke-width': 3, 'stroke-linejoin': 'round' }, hand);
    el('rect', { x: -10, y: -10, width: 20, height: 20, rx: 4, fill: '#fff', stroke: '#1d2433', 'stroke-width': 2 }, hand);
    el('path', { d: 'M-8 44 l 8 10 l 8 -10', fill: 'none', stroke: '#1d2433', 'stroke-width': 3 }, hand);
    const field = el('g', {}, svg);
    const plants = [];
    let pos = 0, errAt = -1, err = null, copies = 0, busy = false, guaranteed = false;
    function plan() {
      copies++;
      // 이해를 돕기 위한 확률: 반쯤은 한 자리가 틀린다. 둘째 베끼기까지 꽃 유전자가 안 바뀌었으면 셋째에는 꼭 바꾼다
      errAt = -1; err = null;
      const force = copies >= 3 && !guaranteed;
      if (force || Math.random() < 0.5) {
        errAt = force ? GENE[0] + Math.floor(Math.random() * 5) : Math.floor(Math.random() * 14);
        const right = PAIR[SEQ[errAt]], wrong = 'ATGC'.split('').filter((b) => b !== right);
        err = wrong[Math.floor(Math.random() * 3)];
      }
    }
    function draw() {
      hand.setAttribute('transform', `translate(${X0 - 40 + pos * DX} 160)`);
      hand.setAttribute('aria-valuenow', String(Math.floor(pos)));
      const n = Math.floor(pos + 0.5);
      backbone.setAttribute('d', n > 0 ? `M${X0 - 30} ${Y2 + 20} H ${X0 + (n - 1) * DX + 30}` : 'M0 0');
      tiles.forEach((tl, i) => {
        const on = i < n; tl.g.setAttribute('opacity', on ? 1 : 0);
        if (!on) return;
        const b = i === errAt ? err : PAIR[SEQ[i]];
        tl.r.setAttribute('fill', COL[b]); tl.t.textContent = b; tl.ring.setAttribute('opacity', i === errAt ? 1 : 0);
      });
      if (errAt >= 0 && n > errAt) msg.innerHTML = `${errAt + 1}번째 자리: <b>${SEQ[errAt]}</b>의 짝은 <b>${PAIR[SEQ[errAt]]}</b>인데 <b>${err}</b>가 들어갔다! 염기 배열이 바뀌었다.`;
    }
    function count() {
      nA.textContent = plants.filter((p) => !p.big).length; nB.textContent = plants.filter((p) => p.big).length;
    }
    function addPlant(big, kid) {
      if (plants.length >= 9) { const o = plants.shift(); o.g.remove(); plants.forEach((p, i) => { p.x = 90 + i * 108; p.g.setAttribute('transform', `translate(${p.x} 640)`); }); }
      const x = 90 + plants.length * 108;
      const p = { big, x, g: flower(field, x, big, kid) }; plants.push(p); count();
    }
    function finish() {
      busy = true;
      const inGene = errAt >= GENE[0] && errAt <= GENE[1];
      if (inGene) guaranteed = true;
      // 씨앗이 떨어진다
      const seed = el('ellipse', { cx: X0 + 13 * DX, cy: 260, rx: 10, ry: 7, fill: '#6b4a2b', stroke: '#1d2433', 'stroke-width': 2 }, svg);
      const tx = 90 + Math.min(plants.length, 8) * 108;
      const done = () => {
        seed.remove(); addPlant(inGene, false);
        if (inGene) {
          msg.innerHTML = '꽃 크기 유전자가 바뀌어 키와 꽃이 큰 <b>큰달맞이꽃</b>이 피었다(암술이 수술보다 길다). 곧 그 씨앗에서 자손이 돋는다.';
          setTimeout(() => { addPlant(true, true); msg.innerHTML = '큰달맞이꽃의 자손도 큰달맞이꽃 → 바뀐 유전자가 <b>자손에게 전해졌다</b>. 집단에 새 변이가 생겼다.'; now.textContent = '돌연변이로 새 형질이 생기고, 자손에게 전해진다'; now.classList.add('done'); }, 1300);
        } else if (errAt >= 0) msg.innerHTML = '한 자리가 바뀌었지만 꽃 크기 유전자 밖이라 겉모습은 그대로다. 바뀌어도 드러나지 않을 때가 있다.';
        else msg.innerHTML = '틀린 자리 없이 똑같이 베꼈다 → 부모와 같은 달맞이꽃.';
        pos = 0; plan(); draw(); busy = false;
        if (!now.classList.contains('done')) now.textContent = '② 손잡이를 다시 밀어 여러 번 베껴 보자';
      };
      if (window.gsap && !K.reduce) gsap.to(seed, { attr: { cx: tx, cy: 630 }, duration: 0.9, ease: 'power1.in', onComplete: done }); else done();
    }
    plan(); draw();
    K.hold(svg, {
      down(p) { if (busy) return false; const hx = X0 - 40 + pos * DX; if (Math.abs(p.x - hx) > 60 || Math.abs(p.y - 160) > 70) return false; hand.ox = hx - p.x; return true; },
      move(p) { if (busy) return; const v = clamp((p.x + hand.ox - (X0 - 40)) / DX, 0, 14); pos = Math.max(pos, v); draw(); if (pos >= 13.95) finish(); },
      up() {},
    }, (e) => K.svgPt(svg, e));
    hand.addEventListener('keydown', (e) => {
      if (e.key !== 'ArrowRight' && e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault(); e.stopPropagation(); if (busy) return; pos = Math.min(14, Math.floor(pos) + 1); draw(); if (pos >= 14) finish();
    });
    // 처음 꽃밭: 부모와 같은 달맞이꽃 둘
    addPlant(false, false); addPlant(false, false);
    root._mu = { run: () => { pos = 14; draw(); finish(); }, force: (i, b) => { errAt = i; err = b; } };
    return {};
  }
  window.EvMutant = { mount };
})();
