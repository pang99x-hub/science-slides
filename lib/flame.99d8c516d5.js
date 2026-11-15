/* 1차시 3장(교과서 40~41쪽 해 보기): 알코올램프 불꽃과 집게로 잡은 구리판.
   구리판은 30×5칸. 칸마다 온도 T(0~1)와 산화 정도 ox(0 붉은 Cu ~ 1 검은 CuO)를 따로 셈한다.
   - 겉불꽃: 데워지고, 뜨거우면 산소를 얻는다(산화). 불꽃 위 뜨거운 공기에서도 천천히 산화.
   - 속불꽃: 데워지고, 뜨거우면 산소를 잃는다(환원, CO가 O를 떼어 감).
   - 불꽃 밖: 식는다. 아직 뜨거우면 공기 중 산소와 다시 만나 검어진다(교과서 수업 도우미).
   - 구리는 열을 잘 전해 이웃 칸끼리 온도가 고르게 퍼진다.
   빠르기 값은 이해를 돕기 위한 예. 오른쪽 위 확대 창은 가장 뜨거운 칸에서 일어나는 일을 분자 모형으로 보여 준다. */
(function () {
  'use strict';
  const { el, clamp, pt, hold, atom, f, mix, keep } = window.RX;
  const COLS = 24, ROWS = 5, PW = 240, PH = 46, CW = PW / COLS, CH = PH / ROWS;
  const WX = 380, WY = 560, TIP = 250;          // 심지 끝, 불꽃 꼭대기
  // 불꽃 모양: s = 심지에서 올라간 정도(0~1)일 때 반폭
  const outerW = (s) => (s < 0 || s > 1 ? 0 : s < 0.22 ? 70 * Math.sqrt(s / 0.22) : 70 * Math.pow((1 - s) / 0.78, 0.75));
  const innerW = (s) => (s < 0 || s > 0.42 ? 0 : 28 * Math.min(1, Math.sqrt(s / 0.08)) * Math.pow(1 - s / 0.42, 0.7));
  function zone(x, y) {
    const s = (WY - y) / (WY - TIP), dx = Math.abs(x - WX);
    if (dx < innerW(s)) return 'in';
    if (dx < outerW(s)) return 'out';
    if (y < TIP && y > TIP - 90 && dx < 34) return 'hot';
    return 'air';
  }
  const flamePath = (wf, top) => {
    const pts = [];
    for (let i = 0; i <= 24; i++) { const s = i / 24 * top; pts.push([WX + wf(s), WY - s * (WY - TIP)]); }
    const back = pts.slice().reverse().map(([x, y]) => [2 * WX - x, y]);
    return 'M' + pts.concat(back).map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ') + ' Z';
  };

  function mount(root) {
    const svg = root.querySelector('.rx-fl-svg');
    const now = root.querySelector('.rx-fl-now');
    const obs = Object.fromEntries([...root.querySelectorAll('.rx-obs')].map((o) => [o.dataset.k, o]));

    el('rect', { x: 0, y: 0, width: 1056, height: 740, fill: '#eef2ef' }, svg);
    el('rect', { x: 0, y: 690, width: 1056, height: 50, fill: '#cdbfa8' }, svg);
    // 알코올램프
    el('path', { class: 'rx-fl-lamp', d: `M${WX - 120} 692 Q ${WX - 130} 600 ${WX - 40} 590 L ${WX + 40} 590 Q ${WX + 130} 600 ${WX + 120} 692 Z` }, svg);
    el('path', { d: `M${WX - 112} 682 Q ${WX - 118} 630 ${WX - 60} 624 L ${WX + 60} 624 Q ${WX + 118} 630 ${WX + 112} 682 Z`, fill: '#bfe3f2', opacity: 0.6 }, svg);
    el('rect', { class: 'rx-fl-neck', x: WX - 24, y: 568, width: 48, height: 26, rx: 4 }, svg);
    el('rect', { x: WX - 5, y: WY - 6, width: 10, height: 16, fill: '#f2ede3', stroke: '#1d2433', 'stroke-width': 2 }, svg);
    const outer = el('path', { class: 'rx-fl-outer' }, svg);
    const innerP = el('path', { class: 'rx-fl-inner' }, svg);
    const lab = (x, y, t, x2, y2) => { el('path', { class: 'rx-fl-lead', d: `M${x2} ${y2} L ${x} ${y}` }, svg); el('text', { class: 'rx-fl-lab', x, y: y - 8, 'text-anchor': x < WX ? 'end' : 'start' }, svg).textContent = t; };
    lab(WX - 150, 300, '겉불꽃', WX - 40, 340);
    lab(WX - 150, 470, '속불꽃', WX - 12, 490);

    // 확대 창
    const IX = 880, IY = 150, IR = 118;
    const inset = el('g', {}, svg);
    el('circle', { cx: IX, cy: IY, r: IR, fill: '#fffdf8', stroke: '#1d2433', 'stroke-width': 4 }, inset);
    const iclip = el('clipPath', { id: 'rx-fl-ic' }, el('defs', {}, svg)); el('circle', { cx: IX, cy: IY, r: IR - 3 }, iclip);
    const iin = el('g', { 'clip-path': 'url(#rx-fl-ic)' }, inset);
    const iBg = el('rect', { x: IX - IR, y: IY - IR, width: IR * 2, height: IR * 2, fill: '#fffdf8' }, iin);
    const cus = [], os = [];
    for (let i = 0; i < 5; i++) { cus.push(atom(iin, 'Cu', IX - 80 + i * 40, IY + 62, 18)); os.push(atom(iin, 'O', IX - 80 + i * 40, IY + 34, 12)); }
    const flow = [];
    for (let i = 0; i < 4; i++) {
      const g = el('g', {}, iin);
      g._o2 = el('g', {}, g); atom(g._o2, 'O', -10, 0, 12); atom(g._o2, 'O', 10, 0, 12);
      g._co = el('g', {}, g); atom(g._co, 'C', -9, 0, 12); atom(g._co, 'O', 11, 0, 11);
      g._co2 = el('g', {}, g); atom(g._co2, 'O', -21, 0, 11); atom(g._co2, 'C', 0, 0, 12); atom(g._co2, 'O', 21, 0, 11);
      flow.push(g);
    }
    const iCap = el('text', { class: 'rx-fl-icap', x: IX, y: IY + IR + 30 }, svg);
    el('text', { class: 'rx-fl-icap2', x: IX, y: IY - IR - 12 }, svg).textContent = '가장 뜨거운 곳 확대';
    const lead = el('path', { class: 'rx-fl-ilead', d: '' }, svg);

    // 집게 + 구리판
    const rig = el('g', { class: 'rx-fl-rig', tabindex: -1 }, svg);
    el('path', { class: 'rx-fl-tong', d: `M10 -6 L 250 -16 M 10 6 L 250 16` }, rig);
    el('rect', { class: 'rx-fl-handle', x: 236, y: -22, width: 76, height: 44, rx: 18 }, rig);
    el('rect', { class: 'rx-fl-jaw', x: -8, y: -14, width: 22, height: 28, rx: 4 }, rig);
    const cellsG = el('g', {}, rig);
    const cells = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) cells.push({ r, c, T: 0, ox: 0, wasBlack: false, wasRed: false, e: el('rect', { x: -PW + c * CW, y: -PH / 2 + r * CH, width: CW + 0.6, height: CH + 0.6 }, cellsG) });
    el('rect', { x: -PW, y: -PH / 2, width: PW, height: PH, fill: 'none', stroke: '#1d2433', 'stroke-width': 2.5 }, rig);
    el('text', { class: 'rx-fl-grip', x: 150, y: -34 }, rig).textContent = '집게를 끌어요';
    [outer, innerP].forEach((n) => { n.style.pointerEvents = 'none'; svg.insertBefore(n, inset); });
    svg.insertBefore(rig, outer);
    let gx = 730, gy = 360;
    const place = (x, y) => { gx = clamp(x, PW + 20, 1040); gy = clamp(y, 120, 660); rig.setAttribute('transform', `translate(${gx} ${gy})`); };
    place(gx, gy);
    let grab = null;
    hold(svg, {
      down(e) {
        const p = pt(svg, e);
        if (p.x > gx - PW - 20 && p.x < gx + 330 && Math.abs(p.y - gy) < 60) { grab = { dx: gx - p.x, dy: gy - p.y }; svg.classList.add('holding'); }
      },
      move(e) { if (!grab) return; const p = pt(svg, e); place(p.x + grab.dx, p.y + grab.dy); },
      up() { grab = null; svg.classList.remove('holding'); },
    });
    keep(svg);
    svg.addEventListener('keydown', (e) => {
      const d = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] }[e.key];
      if (d) { place(gx + d[0], gy + d[1]); e.preventDefault(); }
    });

    const done = { out: false, in: false, back: false };
    function record(k, html) {
      if (done[k]) return; done[k] = true;
      obs[k].classList.add('on'); obs[k].querySelector('p').innerHTML = html;
      now.textContent = !done.in ? '② 검게 변한 곳을 속불꽃에 넣어 보자' : !done.back ? '③ 붉어진 곳을 불꽃 밖으로 빼 보자' : '산화와 환원을 말로 정리해 보자';
      if (done.out && done.in && done.back) now.classList.add('done');
    }
    let T = 0, maxOx = 0;
    const massBar = root.querySelector('.rx-fl-mass'), massTxt = root.querySelector('.rx-fl-mv');
    const Tn = new Float32Array(cells.length);
    function step(dt) {
      T += dt;
      const fl = 1 + 0.04 * Math.sin(T * 9);
      outer.setAttribute('d', flamePath((s) => outerW(s) * fl, 1));
      innerP.setAttribute('d', flamePath(innerW, 0.42));
      let hot = null;
      let black = 0;
      for (let i = 0; i < cells.length; i++) {
        const c = cells[i], x = gx - PW + (c.c + 0.5) * CW, y = gy - PH / 2 + (c.r + 0.5) * CH;
        const z = zone(x, y); c.z = z;
        if (z === 'in' || z === 'out') c.T += (1 - c.T) * 2.4 * dt;
        else if (z === 'hot') c.T += (0.75 - c.T) * 1.2 * dt;
        else c.T -= c.T * 0.32 * dt;
        if (z === 'out' && c.T > 0.3) c.ox += 0.9 * c.T * dt;
        else if (z === 'hot' && c.T > 0.3) c.ox += 0.35 * c.T * dt;
        else if (z === 'in' && c.T > 0.3) c.ox -= 1.3 * c.T * dt;
        else if (z === 'air' && c.T > 0.4) c.ox += 1.1 * (c.T - 0.4) * dt;
        c.ox = clamp(c.ox, 0, 1);
        if (c.ox > 0.75) { if (c.wasRed && z !== 'in' && !done.back && done.in) record('back', '붉던 곳이 금세 다시 <b>검어졌다</b> — 아직 뜨거운 구리가 공기 중 산소와 다시 만났다(산화). 속불꽃 안에서만 붉다'); c.wasBlack = true; c.wasRed = false; }
        if (c.ox < 0.2 && c.wasBlack && z === 'in') { c.wasRed = true; if (done.out) record('in', '검은 곳이 다시 <b>붉은색</b> — 산화 구리(Ⅱ)가 산소를 잃었다 → <b class="rx-red">환원</b>. CO는 산소를 받아 CO₂로 바뀐다'); }
        if (c.ox > 0.7) black++;
        if ((z === 'in' || z === 'out') && (!hot || c.T > hot.T)) hot = c;
      }
      let sox = 0; for (const c of cells) sox += c.ox; sox /= cells.length; maxOx = Math.max(maxOx, sox);
      massBar.style.width = (40 + sox * 300) + '%';
      massTxt.textContent = sox < 0.01 ? '처음 그대로' : sox < maxOx - 0.02 ? '검을 때보다 줄었다' : '처음보다 늘었다';
      if (black >= 8) record('out', '닿은 곳이 붉은색 → <b>검은색</b> — 구리가 산소를 얻었다 → <b class="rx-ox">산화</b>, 산화 구리(Ⅱ)가 생긴다');
      // 열이 판을 따라 퍼진다
      for (let i = 0; i < cells.length; i++) {
        const c = cells[i]; let s = 0, n = 0;
        if (c.c > 0) { s += cells[i - 1].T; n++; } if (c.c < COLS - 1) { s += cells[i + 1].T; n++; }
        if (c.r > 0) { s += cells[i - COLS].T; n++; } if (c.r < ROWS - 1) { s += cells[i + COLS].T; n++; }
        Tn[i] = c.T + (s / n - c.T) * Math.min(1, 6 * dt);
      }
      for (let i = 0; i < cells.length; i++) {
        const c = cells[i]; c.T = Tn[i];
        const base = mix('#d9824f', '#231f1f', c.ox);
        c.e.setAttribute('fill', mix(base, '#ff8a3a', Math.max(0, c.T - 0.35) * 0.55));
      }
      // 확대 창
      let inHot = null; for (const c of cells) if (c.z === 'in' && c.T > 0.3 && (!inHot || c.T > inHot.T)) inHot = c;
      if (inHot) hot = inHot;
      const ref = hot || cells[COLS * 2];
      const mode = hot ? hot.z : 'air';
      const nO = Math.round(ref.ox * 5);
      os.forEach((o, i) => o.setAttribute('opacity', i < nO ? 1 : 0));
      cus.forEach((c, i) => c._c.setAttribute('fill', i < nO ? '#5b4a40' : '#c8743a'));
      iBg.setAttribute('fill', mode === 'out' ? '#fff1dd' : mode === 'in' ? '#e5ecfb' : '#fffdf8');
      flow.forEach((g, i) => {
        const u = (T * 0.45 + i / 4) % 1;
        g._o2.style.display = mode === 'out' ? '' : 'none';
        g._co.style.display = mode === 'in' && u < 0.5 ? '' : 'none';
        g._co2.style.display = mode === 'in' && u >= 0.5 ? '' : 'none';
        const x = IX - 80 + i * 52;
        const y = mode === 'out' ? IY - 100 + u * 120 : mode === 'in' ? (u < 0.5 ? IY - 90 + u * 2 * 110 : IY + 20 - (u - 0.5) * 2 * 140) : IY;
        g.setAttribute('transform', `translate(${x} ${y})`);
        g.setAttribute('opacity', mode === 'air' ? 0 : Math.min(1, u * 5, (1 - u) * 5).toFixed(2));
      });
      iCap.textContent = mode === 'out' ? '산소 분자가 와서 구리 원자에 붙는다' : mode === 'in' ? '일산화 탄소가 산소 원자를 떼어 간다' : '불꽃 밖 — 식어 가는 중';
      const rx = gx - PW + (ref.c + 0.5) * CW, ry = gy - PH / 2 + (ref.r + 0.5) * CH;
      lead.setAttribute('d', hot ? `M${rx} ${ry} L ${IX - IR * 0.7} ${IY + IR * 0.7}` : '');
    }
    const loop = window.Stage.loop(step);
    step(0.016);
    return {
      setActive(on) { if (on) { if (window.Stage.reduce) step(0.016); else loop.start(); } else loop.stop(); },
      place, get pos() { return [gx, gy]; }, done,
    };
  }
  window.RxFlame = { mount };
})();
