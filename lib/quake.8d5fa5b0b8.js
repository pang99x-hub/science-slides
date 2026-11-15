/* 1-2 2차시 체험 «지진파로 진앙 찾기»(교과서 33쪽 그림 I-8: 지진파를 측정·분석해 지진이 일어난 곳을 안다).
   «지진 발생»을 누르면 화면이 흔들리고 세 관측소의 지진 기록(P파·S파)이 그려진다. 기록에서 두 파의 도착 시간 차(S-P)를 읽어
   관측소마다 원의 크기(거리 ≈ 8 km × 초)를 막대로 맞추면, 세 원이 만나는 곳이 진앙이다.
   거리 공식(8 km/s)과 지도 배치는 이해를 돕기 위한 예. Quake.mount(root) → { setActive, fit } · 시험용: root._qk.go() · set(i, km) */
(function () {
  'use strict';
  const ST = [{ n: '가 관측소', x: 180, y: 150 }, { n: '나 관측소', x: 720, y: 120 }, { n: '다 관측소', x: 420, y: 470 }];
  const EP = { x: 470, y: 250 }, KM = 0.8; // 지도 1 px = 0.8 km
  const dist = (s) => Math.hypot(s.x - EP.x, s.y - EP.y) * KM;
  function mount(root) {
    const stage = root.querySelector('.qk-stage'), svg = stage.querySelector('svg'), recs = root.querySelector('.qk-recs'), now = root.querySelector('.qk-now'), goB = root.querySelector('.qk-go'), msg = root.querySelector('.qk-msg');
    const ranges = [...root.querySelectorAll('.qk-r')], vals = [...root.querySelectorAll('.qk-v')];
    const NS = 'http://www.w3.org/2000/svg', el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
    el('rect', { x: 0, y: 0, width: 900, height: 600, fill: '#e8efe0' }, svg);
    el('path', { d: 'M0 420 Q200 380 330 460 T620 520 T900 470 L900 600 L0 600 Z', fill: '#bfe0f2' }, svg);
    el('path', { d: 'M560 60 L640 30 L720 80 L700 160 L640 190 Z', fill: '#c8d7b2' }, svg);
    for (let i = 0; i < 10; i++) el('line', { x1: i * 100, y1: 0, x2: i * 100, y2: 600, stroke: 'rgba(29,36,51,.06)' }, svg);
    for (let i = 0; i < 7; i++) el('line', { x1: 0, y1: i * 100, x2: 900, y2: i * 100, stroke: 'rgba(29,36,51,.06)' }, svg);
    el('line', { x1: 40, y1: 570, x2: 40 + 100 / KM, y2: 570, stroke: '#1d2433', 'stroke-width': 4 }, svg);
    el('text', { x: 40, y: 560, class: 'qk-sc' }, svg).textContent = '100 km';
    const circles = ST.map((s, i) => el('circle', { cx: s.x, cy: s.y, r: 0, class: 'qk-c c' + i }, svg));
    ST.forEach((s, i) => { const g = el('g', {}, svg); el('path', { d: `M${s.x} ${s.y - 18} L${s.x + 14} ${s.y + 10} L${s.x - 14} ${s.y + 10} Z`, class: 'qk-st c' + i }, g); el('text', { x: s.x, y: s.y + 36, 'text-anchor': 'middle', class: 'qk-sn' }, g).textContent = s.n; });
    const star = el('path', { d: 'M0 -22 L6 -7 L22 -7 L9 3 L14 19 L0 9 L-14 19 L-9 3 L-22 -7 L-6 -7 Z', class: 'qk-ep', transform: `translate(${EP.x} ${EP.y})`, opacity: 0 }, svg);
    const pick = el('circle', { r: 16, class: 'qk-pick', opacity: 0 }, svg);
    let started = false, found = false; const R = [0, 0, 0];
    const sp = ST.map((s) => dist(s) / 8);   // S-P 시간(초)
    function drawRecs() {
      recs.innerHTML = ST.map((s, i) => {
        const T = 60, pts = []; const p = 4, sArr = p + sp[i];
        for (let k = 0; k <= 300; k++) { const tt = k / 300 * T; let a = 0.4 * Math.sin(tt * 9 + i);
          if (tt > p) a += 6 * Math.exp(-(tt - p) * 0.5) * Math.sin(tt * 23);
          if (tt > sArr) a += 16 * Math.exp(-(tt - sArr) * 0.25) * Math.sin(tt * 13 + 1);
          pts.push(`${(k / 300 * 560).toFixed(1)},${(40 - Math.max(-34, Math.min(34, a))).toFixed(1)}`); }
        const xp = p / T * 560, xs = sArr / T * 560;
        return `<div class="qk-rec"><b class="c${i}">${s.n}</b><svg viewBox="0 0 560 80" aria-label="${s.n} 지진 기록: P파가 ${p}초, S파가 ${sArr.toFixed(0)}초에 도착"><polyline points="${started ? pts.join(' ') : '0,40 560,40'}" class="qk-w"/>${started ? `<line x1="${xp}" y1="4" x2="${xp}" y2="76" class="qk-p"/><text x="${xp + 4}" y="14" class="qk-t">P</text><line x1="${xs}" y1="4" x2="${xs}" y2="76" class="qk-s"/><text x="${xs + 4}" y="14" class="qk-t">S</text>` : ''}</svg><span>${started ? `S - P = <b>${sp[i].toFixed(0)}초</b>` : '기록 없음'}</span></div>`;
      }).join('');
    }
    function update() {
      ST.forEach((s, i) => { circles[i].setAttribute('r', R[i] / KM); vals[i].textContent = `${R[i]} km`; });
      const ok = ST.every((s, i) => Math.abs(R[i] - dist(s)) < 12);
      const st = !started ? 1 : !ok ? 2 : !found ? 3 : 0;
      const did = [1, 2, 3].filter((k) => k < (st || 4));
      window.L1.steps(root, st, did); window.L1.done(root, st === 0);
      now.textContent = st === 1 ? '① «지진 발생»을 누르자' : st === 2 ? '② S-P 시간 × 8 km로 원 세 개의 크기를 맞추자' : st === 3 ? '③ 세 원이 만나는 곳을 눌러 보자' : '지진파(신호)를 분석해 진앙(정보)을 찾았다';
      now.classList.toggle('done', st === 0);
      return ok;
    }
    function go() {
      if (started) return; started = true; goB.disabled = true; ranges.forEach((r) => { r.disabled = false; });
      if (window.RxT && window.RxT.jolt) window.RxT.jolt(stage, 3);
      drawRecs(); msg.className = 'u-msg'; msg.textContent = '기록에서 P파와 S파의 도착 시간 차를 읽자'; update();
    }
    goB.addEventListener('click', go);
    ranges.forEach((r, i) => r.addEventListener('input', () => { R[i] = +r.value; update(); }));
    svg.addEventListener('click', (e) => {
      if (!started) return; const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(svg.getScreenCTM().inverse());
      pick.setAttribute('cx', q.x); pick.setAttribute('cy', q.y); pick.setAttribute('opacity', 1);
      const okR = update(), near = Math.hypot(q.x - EP.x, q.y - EP.y) < 40;
      if (okR && near) { found = true; star.setAttribute('opacity', 1); msg.className = 'u-msg ok'; msg.innerHTML = '진앙을 찾았다! 세 관측소의 <b>신호</b>를 분석해 지진이 난 곳이라는 <b>정보</b>를 얻었다'; }
      else { msg.className = 'u-msg no'; msg.textContent = okR ? '세 원이 모두 지나는 한 점을 눌러 보자' : '먼저 원 세 개의 크기를 기록에 맞추자'; }
      update();
    });
    ranges.forEach((r) => { r.disabled = true; });
    drawRecs(); update();
    root._qk = { go, set: (i, km) => { ranges[i].value = String(km); ranges[i].dispatchEvent(new Event('input')); }, pickEp: () => { const p = svg.createSVGPoint(); p.x = EP.x; p.y = EP.y; const q = p.matrixTransform(svg.getScreenCTM()); svg.dispatchEvent(new MouseEvent('click', { clientX: q.x, clientY: q.y, bubbles: true })); }, dist: () => ST.map(dist) };
    return {};
  }
  window.Quake = { mount };
})();
