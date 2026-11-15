/* 1-2-1 산화와 환원 · 단원 공용 도구(RX). 장 모듈이 SVG·캔버스 그림을 손으로 움직이게 할 때 쓴다.
   RX.el(태그, 속성, 부모)  SVG 요소
   RX.pt(svg, e)  누른 자리 → viewBox 좌표 (슬라이드 배율과 관계없이)
   RX.cpt(cv, e)  누른 자리 → 캔버스 논리 좌표(clientWidth 기준)
   RX.hold(요소, { down(e), move(e), up(e) })  누르고 끄는 동안 이어 받기(포인터 붙잡기, 슬라이드 넘김 막기)
   RX.f(텍스트 요소, 'CO_2', 'Cu^2+')  SVG 글자에 아래·위 첨자를 넣는다(_숫자는 아래, ^…는 위)
   RX.atom(부모, 원소, x, y, r)  원자 모형(색 원 + 기호)
   RX.mix(색1, 색2, t)  두 색 사이 · RX.clamp · RX.lerp · RX.smooth(a, b, x) */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a = {}, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  function pt(svg, e) {
    const m = svg.getScreenCTM();
    if (!m) return { x: 0, y: 0 };
    const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY;
    const q = p.matrixTransform(m.inverse());
    return { x: q.x, y: q.y };
  }
  function cpt(cv, e) {
    const r = cv.getBoundingClientRect();
    return { x: (e.clientX - r.left) / (r.width || 1) * cv.clientWidth, y: (e.clientY - r.top) / (r.height || 1) * cv.clientHeight };
  }
  function hold(node, o) {
    let id = null;
    node.addEventListener('pointerdown', (e) => {
      if (e.button) return;
      e.stopPropagation(); e.preventDefault();
      if (o.down) o.down(e);          // down에서 요소를 맨 위로 옮겨도(DOM 이동) 붙잡기가 풀리지 않게 먼저 부른다
      id = e.pointerId; try { node.setPointerCapture(id); } catch (err) { /* 붙잡기가 안 돼도 이어 간다 */ }
    });
    node.addEventListener('pointermove', (e) => { if (id === e.pointerId && o.move) { e.stopPropagation(); o.move(e); } });
    const end = (e) => { if (id !== e.pointerId) return; id = null; if (o.up) o.up(e); };
    node.addEventListener('pointerup', end);
    node.addEventListener('pointercancel', end);
    node.style.touchAction = 'none';
  }
  // 'Fe_2O_3' · 'Cu^2+' · 'e^-' → tspan 첨자
  function f(t, s) {
    while (t.firstChild) t.removeChild(t.firstChild);
    const re = /([^_^]+)|_(\d+)|\^([0-9]*[+\-−])/g;
    let m;
    while ((m = re.exec(s))) {
      if (m[1]) t.appendChild(document.createTextNode(m[1]));
      else if (m[2]) el('tspan', { 'baseline-shift': 'sub', 'font-size': '68%' }, t).textContent = m[2];
      else el('tspan', { 'baseline-shift': 'super', 'font-size': '64%' }, t).textContent = m[3].replace('-', '−');
    }
    return t;
  }
  // 원자 색(교과서 그림처럼 산소는 빨강, 탄소는 검정, 수소는 흰색)
  const COL = { O: '#e0463c', C: '#3b3f4a', H: '#ffffff', Cu: '#c8743a', Zn: '#a3adb9', Ag: '#dfe3e8', Mg: '#c9d2bd', Fe: '#8d7462', N: '#6f8fd8', S: '#e6c13a', Ar: '#b9a3d9' };
  const INK = { O: '#fff', C: '#fff', H: '#1d2433', Cu: '#fff', Zn: '#1d2433', Ag: '#1d2433', Mg: '#1d2433', Fe: '#fff', N: '#fff', S: '#1d2433', Ar: '#1d2433' };
  function atom(p, k, x, y, r, label = k) {
    const g = el('g', { class: 'rx-atom', transform: `translate(${x} ${y})` }, p);
    g._c = el('circle', { r, fill: COL[k] || '#ccc', stroke: '#1d2433', 'stroke-width': Math.max(1.5, r * 0.09) }, g);
    el('circle', { cx: -r * 0.35, cy: -r * 0.38, r: r * 0.28, fill: '#fff', opacity: 0.35 }, g);
    if (label) { g._t = el('text', { class: 'rx-asym', y: r * 0.36, 'font-size': r * 0.95, fill: INK[k] || '#1d2433' }, g); f(g._t, label); }
    return g;
  }
  const hex = (c) => { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
  function mix(a, b, t) {
    const A = hex(a), B = hex(b);
    return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(t, 0, 1))).toString(16).padStart(2, '0')).join('');
  }
  // 키보드 화살표가 슬라이드를 넘기지 않게
  const keep = (node) => node.addEventListener('keydown', (e) => { if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Enter'].includes(e.key)) e.stopPropagation(); });
  window.RX = { NS, el, clamp, lerp, smooth, pt, cpt, hold, f, atom, mix, keep, COL };
})();
/* 반응식 꺾은 화살표(2026-10-31 선생님 검토: «반응 화살표는 물질의 변화를 잇는다»)
   <p class="bx" data-ox="0>2" data-red="1>3" data-by="o|e|s" data-oxe="2" data-rede="2">Zn + Cu<sup>2+</sup> → Zn<sup>2+</sup> + Cu</p>
   항(+ · → 사이)을 0부터 센다. 산화는 식 위 주황, 환원은 식 아래 파랑 화살표로 «바뀌기 전 물질 → 바뀐 뒤 물질»을 잇는다.
   data-by: o 산소를 얻음/잃음 · e 전자를 잃음/얻음 · s «산화»«환원»만. data-oxl·data-redl로 이름표 글을 직접 줄 수도 있다.
   data-oxe·data-rede: 화살표 이름표 옆 전자 꼬리표(«e⁻ 2개»). 동적으로 바꾼 뒤에는 RX.bx(p). */
(function () {
  'use strict';
  const LBL = { o: ['산소를 얻음 → 산화', '산소를 잃음 → 환원'], e: ['전자를 잃음 → 산화', '전자를 얻음 → 환원'], s: ['산화', '환원'] };
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); p.appendChild(e); return e; };
  function wrap(p) {
    if (p.querySelector(':scope > .t')) return;
    const parts = p.innerHTML.trim().split(/\s+(\+|→)\s+/);
    p.innerHTML = parts.map((s, i) => (i % 2 ? ` <span class="op">${s}</span> ` : `<span class="t">${s}</span>`)).join('');
  }
  function draw(p) {
    if (!p.isConnected) return;
    if (!p.classList.contains('bx')) { p.style.paddingTop = ''; p.style.paddingBottom = ''; const o = p.querySelector(':scope > .bx-ov'); if (o) o.remove(); return; }
    wrap(p);
    let ov = p.querySelector(':scope > .bx-ov');
    if (!ov) { ov = document.createElement('span'); ov.className = 'bx-ov'; ov.setAttribute('aria-hidden', 'true'); p.appendChild(ov); }
    ov.textContent = '';
    p.style.paddingTop = ''; p.style.paddingBottom = '';
    // 칸이 좁으면 글자를 조금(최대 20%) 줄여 한 줄에 맞춘다
    p.style.removeProperty('font-size');
    if (p.clientWidth && p.scrollWidth > p.clientWidth + 1) {
      const f0 = parseFloat(getComputedStyle(p).fontSize);
      p.style.setProperty('font-size', f0 * Math.max(0.6, (p.clientWidth - 2) / p.scrollWidth) + 'px', 'important');
    }
    const W = p.clientWidth, ts = [...p.querySelectorAll(':scope > .t')];
    const jobs = [['ox', true], ['red', false]].map(([k, up]) => {
      const v = p.dataset[k]; if (!v || !W) return null;
      const [a, b] = v.split('>').map(Number);
      return ts[a] && ts[b] ? { k, up, A: ts[a], B: ts[b] } : null;
    }).filter(Boolean);
    p.classList.toggle('bx-u', jobs.some((j) => j.up)); p.classList.toggle('bx-d', jobs.some((j) => !j.up));
    if (jobs.length) {
      const cs = getComputedStyle(p), fs = parseFloat(cs.fontSize), by = p.dataset.by || 'o';
      const rise = fs * 0.42, sw = Math.max(2, fs * 0.075), hd = fs * 0.22;
      // 이름표부터 만들어 높이를 잰다
      jobs.forEach((j) => {
        const l = document.createElement('span'); l.className = 'bx-l bx-' + j.k;
        l.textContent = p.dataset[j.k + 'l'] || LBL[by][j.k === 'ox' ? 0 : 1];
        const n = p.dataset[j.k + 'e'];
        if (n) { const e = document.createElement('i'); e.className = 'bx-e'; e.innerHTML = `e<sup>−</sup> ${n}개`; l.appendChild(e); }
        ov.appendChild(l); j.l = l;
      });
      const pt0 = parseFloat(cs.paddingTop), pb0 = parseFloat(cs.paddingBottom);
      const top = (e) => e.offsetTop + fs * 0.1, bot = (e) => e.offsetTop + e.offsetHeight - fs * 0.06;
      // 이름표가 칸 밖으로 나가지 않게 위·아래 여백을 늘린다
      let addT = 0, addB = 0;
      jobs.forEach((j) => {
        const lh = j.l.offsetHeight;
        if (j.up) addT = Math.max(addT, lh / 2 + rise + 3 - Math.min(top(j.A), top(j.B)));
        else addB = Math.max(addB, Math.max(bot(j.A), bot(j.B)) + rise + lh / 2 + 3 - p.clientHeight);
      });
      if (addT > 0) p.style.paddingTop = pt0 + addT + 'px';
      if (addB > 0) p.style.paddingBottom = pb0 + addB + 'px';
      const H = p.clientHeight;
      const svg = mk('svg', { width: W, height: H, viewBox: `0 0 ${W} ${H}` }, ov);
      jobs.forEach((j) => {
        const ax = j.A.offsetLeft + j.A.offsetWidth / 2, bx = j.B.offsetLeft + j.B.offsetWidth / 2;
        const ya = j.up ? top(j.A) : bot(j.A), yb = j.up ? top(j.B) : bot(j.B);
        const yBar = j.up ? Math.min(ya, yb) - rise : Math.max(ya, yb) + rise;
        const s = j.up ? 1 : -1, col = j.k === 'ox' ? 'var(--rx-ox)' : 'var(--rx-red)';
        mk('path', { d: `M${ax} ${ya}V${yBar}H${bx}V${yb - s * hd}`, fill: 'none', stroke: col, 'stroke-width': sw, 'stroke-linejoin': 'round' }, svg);
        mk('path', { d: `M${bx - hd * 0.62} ${yb - s * hd}L${bx + hd * 0.62} ${yb - s * hd}L${bx} ${yb}Z`, fill: col }, svg);
        const lw = j.l.offsetWidth, lh = j.l.offsetHeight;
        let lx = (ax + bx) / 2 - lw / 2;
        lx = lw > W ? (W - lw) / 2 : Math.max(0, Math.min(W - lw, lx));
        j.l.style.left = lx + 'px'; j.l.style.top = yBar - lh / 2 + 'px';
      });
    }
    p._bxHtml = p.innerHTML;
  }
  const ro = typeof ResizeObserver === 'function' ? new ResizeObserver((es) => es.forEach((e) => draw(e.target))) : null;
  function bx(p) { if (!p._bxOn) { p._bxOn = 1; if (ro) ro.observe(p); } draw(p); }
  const host = (n) => (n && (n.nodeType === 1 ? n : n.parentElement)) || null;
  const mo = new MutationObserver((rs) => {
    const s = new Set();
    for (const r of rs) {
      r.addedNodes.forEach((n) => { if (n.nodeType !== 1) return; if (n.classList.contains('bx')) s.add(n); if (n.querySelectorAll) n.querySelectorAll('.bx').forEach((x) => s.add(x)); });
      const h = host(r.target); const b = h && h.closest ? h.closest('.bx') : null;
      if (b && b.innerHTML !== b._bxHtml) s.add(b);
    }
    s.forEach(bx);
  });
  function start() {
    document.querySelectorAll('.bx').forEach(bx);
    mo.observe(document.body, { childList: true, subtree: true, characterData: true });
    if (document.fonts) document.fonts.ready.then(() => document.querySelectorAll('.bx').forEach(draw));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
  window.RX.bx = bx;
})();
