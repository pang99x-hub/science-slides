/* 3차시 2장 «다윈과 비글호»(교과서 32쪽): 대서양·남아메리카 지도 위 항로를 따라 배를 끌면 정거장마다 사진·풀이가 바뀐다.
   지도는 위경도를 그대로 편 단순한 그림. 항로는 실제 경로를 줄여 그린 것. 시험용: root._vy.go(정거장 번호) */
(function () {
  'use strict';
  const K = window.EvKit;
  const X = (lon) => (lon + 112) / 124 * 1000, Y = (lat) => (62 - lat) / 124 * 640;
  const pts = (a) => a.map(([lo, la]) => `${X(lo).toFixed(1)},${Y(la).toFixed(1)}`).join(' ');
  const LAND = [
    [[-80, 9], [-75, 11.5], [-62, 10.5], [-51, 4], [-50, 0], [-44, -2.5], [-35, -6], [-39, -15], [-41, -22], [-48, -27], [-53, -34], [-58, -38], [-62, -39], [-65, -42], [-66, -47], [-69, -51], [-68, -55], [-72, -53], [-75, -47], [-73.5, -40], [-72, -30], [-70.5, -18], [-76, -14], [-81, -6], [-80, -1], [-78, 2]],
    [[-80, 9], [-83, 9], [-86, 12], [-88, 14], [-92, 15], [-97, 16], [-105, 20], [-112, 28], [-112, 62], [-60, 62], [-56, 52], [-66, 44], [-70, 41], [-76, 35], [-81, 31], [-81, 25], [-84, 30], [-90, 29], [-97, 27], [-97, 21], [-91, 19], [-87, 21], [-88, 16]],
    [[-17, 15], [-16, 11], [-12, 7], [-8, 4.5], [-2, 5], [5, 5.5], [9, 4], [9.5, 1], [12, -5], [12, -18], [12, -60], [12, 62], [12, 54], [8, 54], [4, 52], [2, 51], [-1, 46], [-1.8, 43.4], [-9, 43], [-9, 37], [-5.5, 36], [-2, 36.7], [0, 38.5], [3, 42], [3.5, 43], [6, 43], [9, 44], [12, 44], [12, 37], [10, 37], [10, 33], [3, 36.8], [-6, 35.8], [-9.5, 30], [-13, 27], [-17, 21]],
    [[-5.7, 50], [1.3, 51], [1.7, 52.7], [0, 53.5], [-1.7, 55.6], [-3, 58.6], [-5, 58.6], [-6.2, 56.5], [-5, 55], [-3, 54.5], [-3.3, 53.3], [-4.8, 52.8], [-3.2, 51.4]],
    [[-6, 52], [-8.5, 54.5], [-10, 52], [-9, 51.6]],
  ];
  const ROUTE = [[-4, 50.3], [-12, 40], [-20, 28], [-24, 15], [-30, 2], [-35, -6], [-38.5, -13], [-43, -23], [-50, -30], [-57.8, -34.6], [-60, -40], [-64, -46], [-66, -52], [-68, -56], [-74, -54], [-76, -45], [-73.5, -36], [-71.8, -33], [-73, -24], [-75, -16], [-77.5, -12], [-82, -6], [-88, -1.5], [-91, -0.6], [-96, -3], [-102, -6], [-112, -9]];
  const STOP = [
    { at: 0, name: '1831년 영국 출발', d: '<b>22살</b>의 다윈이 해군 측량선 <b>비글호</b>를 타고 영국을 떠났다. 처음 계획보다 길어져 <b>5년</b> 동안 세계를 돌았다.', img: 'DW_BEAGLE', cr: 'Conrad Martens(비글호 그림) · 퍼블릭 도메인' },
    { at: 6, name: '브라질 열대우림', d: '빽빽한 숲에서 처음 보는 곤충·새·식물을 관찰하고 표본으로 모았다.', img: 'DW_YOUNG', cr: 'George Richmond(젊은 다윈) · 퍼블릭 도메인' },
    { at: 9, name: '아르헨티나 대초원', d: '끝없는 초원과 바닷가 절벽에서 지금 동물과 닮았지만 훨씬 큰 옛 동물의 <b>화석</b>을 찾았다.', img: '', cr: '' },
    { at: 17, name: '칠레 안데스산맥', d: '높은 산에서 바다 생물의 화석을 보고, 땅이 오랜 세월 솟아올랐다고 생각했다.', img: '', cr: '' },
    { at: 23, name: '갈라파고스 제도', d: '섬마다 <b>핀치의 부리</b>가 서로 다르고, 거북 등딱지 생김새도 섬에 따라 달랐다 → 생물은 사는 환경에 따라 <b>바뀔 수 있다</b>는 생각.', img: 'DW_TORTOISE', cr: 'Bernard Gagnon(갈라파고스땅거북) · CC BY-SA 3.0' },
    { at: 25, name: '1836년 귀국 → 1859년 『종의 기원』', d: '태평양·인도양을 건너 돌아온 뒤 관찰한 것을 바탕으로 <b>20여 년</b> 연구해 1859년 『종의 기원』을 펴냈다.', img: 'DW_OLD', cr: 'Julia Margaret Cameron(1868년의 다윈) · 퍼블릭 도메인' },
  ];
  function mount(root) {
    const svg = root.querySelector('.vy-map'), card = root.querySelector('.vy-card'), store = root.querySelector('.vy-store');
    const el = (t, a, p) => K.el(t, a, p);
    el('rect', { x: 0, y: 0, width: 1000, height: 640, fill: '#cfe6f2' }, svg);
    for (let la = -60; la <= 60; la += 30) el('line', { x1: 0, x2: 1000, y1: Y(la), y2: Y(la), stroke: la === 0 ? '#c8402f' : '#a9c9db', 'stroke-width': la === 0 ? 2 : 1.2, 'stroke-dasharray': '8 6' }, svg);
    el('text', { x: 10, y: Y(0) - 8, class: 'vy-eq' }, svg).textContent = '적도';
    LAND.forEach((p) => el('polygon', { points: pts(p), class: 'vy-land' }, svg));
    [[-60, 15, '남아메리카'], [-100, 40, '북아메리카'], [2, 15, '아프리카'], [-1, 47, '유럽'], [-35, 30, '대서양'], [-102, -25, '태평양']].forEach(([lo, la, t]) => { el('text', { x: X(lo), y: Y(la), class: la === 30 || la === -25 ? 'vy-sea' : 'vy-cont' }, svg).textContent = t; });
    const d = 'M' + ROUTE.map(([lo, la]) => `${X(lo).toFixed(1)} ${Y(la).toFixed(1)}`).join(' L');
    el('path', { d, class: 'vy-route' }, svg);
    const done = el('path', { d, class: 'vy-done' }, svg);
    const path = el('path', { d, fill: 'none', stroke: 'transparent', 'stroke-width': 40 }, svg);
    const L = path.getTotalLength();
    // 길이 → 정거장 자리
    const segLen = []; { let acc = 0; segLen.push(0); for (let i = 1; i < ROUTE.length; i++) { acc += Math.hypot(X(ROUTE[i][0]) - X(ROUTE[i - 1][0]), Y(ROUTE[i][1]) - Y(ROUTE[i - 1][1])); segLen.push(acc); } }
    const stopL = STOP.map((s) => segLen[s.at]);
    const dots = STOP.map((s, i) => { const [lo, la] = ROUTE[s.at]; const g = el('g', { class: 'vy-stop', transform: `translate(${X(lo)} ${Y(la)})` }, svg); el('circle', { r: 13 }, g); el('text', { y: 7, 'text-anchor': 'middle' }, g).textContent = String(i + 1); g.addEventListener('click', () => go(i)); return g; });
    el('text', { x: X(-110), y: Y(-20), class: 'vy-note' }, svg).textContent = '← 태평양·인도양을 건너 영국으로';
    const ship = el('g', { class: 'vy-ship', tabindex: 0, role: 'slider', 'aria-label': '비글호: 끌어서 항로를 따라 옮긴다(←→ 키도 된다)' }, svg);
    el('circle', { r: 30, class: 'vy-halo' }, ship);
    el('path', { d: 'M-22 4 L22 4 L15 15 L-15 15 Z', class: 'vy-hull' }, ship);
    el('path', { d: 'M-2 4 V-28 M10 4 V-20 M-14 4 V-18', class: 'vy-mast' }, ship);
    el('path', { d: 'M0 -26 L16 -10 L0 -8 Z M-12 -16 L-1 -6 L-12 -4 Z', class: 'vy-sail' }, ship);
    let len = 0, cur = -1, lock = -1, tw = null;   // lock: 단추로 갈 때 도착할 정거장(가는 동안 번호를 바꾸지 않는다)
    function place(l) {
      len = Math.max(0, Math.min(L, l));
      const p = path.getPointAtLength(len); ship.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
      done.setAttribute('stroke-dasharray', `${len} ${L}`);
      let k = 0; stopL.forEach((s, i) => { if (len >= s - 8) k = i; });
      if (cur >= 0 && k === cur - 1 && len > stopL[cur] - 40) k = cur;   // 경계에서 손이 조금 흔들려도 번호가 되돌아가지 않게
      if (lock >= 0) return;
      if (k !== cur) show(k);
    }
    function show(k) {
      cur = k; const s = STOP[k];
      dots.forEach((g, i) => { g.classList.toggle('on', i === k); g.classList.toggle('past', i < k); });
      root.querySelectorAll('.vy-pills button').forEach((b, i) => b.setAttribute('aria-pressed', String(i === k)));
      card.querySelector('.vy-tag').textContent = `${k + 1} / ${STOP.length}`;
      card.querySelector('.vy-name').innerHTML = s.name; card.querySelector('.vy-d').innerHTML = s.d;
      const im = card.querySelector('.vy-img'), src = s.img && store.querySelector(`img[data-k="${s.img}"]`);
      card.classList.toggle('noimg', !src);
      if (src) { im.src = src.src; im.alt = src.alt; }
      card.querySelector('.vy-cr').textContent = s.cr ? '그림·사진: ' + s.cr : '';
    }
    function go(i) {
      const to = stopL[i];
      if (tw) tw.kill();
      lock = i; show(i);
      if (window.gsap && !window.Deck.reduce) { const o = { v: len }; tw = gsap.to(o, { v: to, duration: 0.9, ease: 'power2.inOut', onUpdate: () => place(o.v), onComplete: () => { lock = -1; tw = null; } }); } else { place(to); lock = -1; }
    }
    // 끌기: 배 근처를 잡고, 지금 자리 앞뒤 구간에서만 따라간다(갔다 돌아오는 항로가 가까이 붙은 곳에서 튀지 않게)
    let dragging = false;
    K.hold(svg, {
      down: (p) => { if (tw) { tw.kill(); tw = null; lock = -1; } const q = path.getPointAtLength(len); if ((q.x - p.x) ** 2 + (q.y - p.y) ** 2 > 70 * 70) nearest(p, 0, L); dragging = true; },
      move: (p) => { if (dragging) nearest(p, len - L * 0.08, len + L * 0.08); },
      up: () => { dragging = false; },
    }, (e) => K.svgPt(svg, e));
    function nearest(p, a, b) { a = Math.max(0, a); b = Math.min(L, b); let best = len, bd = 1e9; for (let l = a; l <= b; l += 3) { const q = path.getPointAtLength(l), dd = (q.x - p.x) ** 2 + (q.y - p.y) ** 2; if (dd < bd) { bd = dd; best = l; } } if (bd < 120 * 120) { if (tw) { tw.kill(); tw = null; lock = -1; } place(best); } }
    ship.addEventListener('keydown', (e) => { const m = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (m) { e.preventDefault(); e.stopPropagation(); go(Math.max(0, Math.min(STOP.length - 1, cur + m))); } });
    root.querySelectorAll('.vy-pills button').forEach((b, i) => b.addEventListener('click', () => go(i)));
    place(0);
    root._vy = { go: (i) => place(stopL[i]) };
    return {};
  }
  window.EvVoyage = { mount };
})();
