/* 1-1 1차시 체험 «우주의 규모 여행»(교과서 17쪽 탐구 · 크기를 비교하는 시뮬레이션).
   막대·바퀴·두 손가락·확대/축소 단추로 화면 너비를 10배씩 바꾸며 수소 원자에서 관측 가능한 우주까지 오간다.
   물체는 크기 차례로 옆에 늘어서 있고, 화면 너비에 맞는 물체 두세 개가 함께 보인다. 아래 막대 = 그 길이.
   Zoom.mount(root) → { setActive, fit } · 시험용: root._zm.go(log10 화면 너비 m) · L */
(function () {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const TAU = Math.PI * 2;
  // [이름, 크기(m), 크기 글, 그리기]
  const O = [
    ['수소 원자', 1e-10, '지름 약 0.1 nm', atom],
    ['DNA 가닥', 2e-9, '폭 약 2 nm', dna],
    ['바이러스', 1.2e-7, '약 0.1 μm', virus],
    ['대장균', 2e-6, '길이 약 2 μm', bacterium],
    ['적혈구', 7e-6, '지름 약 7 μm', rbc],
    ['머리카락', 8e-5, '굵기 약 0.08 mm', hair],
    ['개미', 4e-3, '길이 약 4 mm', ant],
    ['DVD', 0.12, '지름 12 cm', dvd],
    ['사람', 1.7, '키 약 1.7 m', human],
    ['첨성대', 9.51, '높이 9.51 m', tower],
    ['에베레스트산', 8848, '높이 8848 m', mountain],
    ['지구', 1.27e7, '지름 약 1만 2700 km', earth],
    ['지구와 달', 3.84e8, '사이 거리 약 38만 km', earthMoon],
    ['태양', 1.39e9, '지름 약 139만 km', sun],
    ['태양계', 9e12, '해왕성 궤도 지름 약 90억 km', system],
    ['우리은하', 1e21, '지름 약 10만 광년', galaxy],
    ['관측 가능한 우주', 8.8e26, '지름 약 930억 광년', universe],
  ];
  const LMIN = Math.log10(O[0][1] * 2.6), LMAX = Math.log10(O[O.length - 1][1] * 1.5);
  // 세상 속 자리: 크기 차례로 오른쪽으로 늘어선다
  const X = []; O.forEach((o, i) => { X.push(i ? X[i - 1] + O[i - 1][1] * 0.75 + o[1] * 0.75 : 0); });
  const LI = O.map((o) => Math.log10(o[1] * 2.6));
  function centerAt(L) {
    if (L <= LI[0]) return X[0];
    for (let i = 1; i < O.length; i++) if (L <= LI[i]) { const t = (L - LI[i - 1]) / (LI[i] - LI[i - 1]); const e = t * t * (3 - 2 * t); return X[i - 1] + (X[i] - X[i - 1]) * e; }
    return X[O.length - 1];
  }
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const pw = (n) => '10' + (n < 0 ? '⁻' : '') + String(Math.abs(n)).split('').map((d) => SUP[d]).join('');
  function barName(n) {
    const t = { '-12': '0.001 nm', '-11': '0.01 nm', '-10': '0.1 nm', '-9': '1 nm', '-8': '10 nm', '-7': '100 nm', '-6': '1 μm', '-5': '10 μm', '-4': '0.1 mm', '-3': '1 mm', '-2': '1 cm', '-1': '10 cm', 0: '1 m', 1: '10 m', 2: '100 m', 3: '1 km', 4: '10 km', 5: '100 km', 6: '1000 km', 7: '1만 km', 8: '10만 km', 9: '100만 km', 10: '1000만 km', 11: '1억 km', 12: '10억 km', 13: '100억 km' }[n];
    if (t) return t;
    const ly = n - 16; return ly <= 0 ? '약 1광년' : `약 ${['', '10', '100', '1000', '1만', '10만', '100만', '1000만', '1억', '10억', '100억'][ly] || pw(ly)}광년`;
  }

  // ---------- 그림(가운데 x, y · 크기 s px) ----------
  function atom(c, x, y, s) {
    const g = c.createRadialGradient(x, y, 0, x, y, s / 2); g.addColorStop(0, 'rgba(90,150,230,.75)'); g.addColorStop(1, 'rgba(90,150,230,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, s / 2, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(42,115,184,.6)'; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y, s * .36, s * .14, .5, 0, TAU); c.stroke();
    c.fillStyle = '#d9483b'; c.beginPath(); c.arc(x, y, Math.max(2, s * .04), 0, TAU); c.fill();
    c.fillStyle = '#1d2433'; c.beginPath(); c.arc(x + s * .3, y - s * .17, Math.max(2, s * .03), 0, TAU); c.fill();
  }
  function dna(c, x, y, s) {
    const L = s * 4; c.lineWidth = Math.max(2, s * .12);
    for (let k = 0; k < 2; k++) {
      c.strokeStyle = k ? '#2a73b8' : '#d9483b'; c.beginPath();
      for (let i = 0; i <= 60; i++) { const t = i / 60, yy = y - L / 2 + L * t, xx = x + Math.sin(t * TAU * 2 + k * Math.PI) * s / 2; i ? c.lineTo(xx, yy) : c.moveTo(xx, yy); }
      c.stroke();
    }
    c.strokeStyle = 'rgba(29,36,51,.35)'; c.lineWidth = Math.max(1, s * .05);
    for (let i = 1; i < 16; i++) { const t = i / 16, yy = y - L / 2 + L * t, a = Math.sin(t * TAU * 2) * s / 2; c.beginPath(); c.moveTo(x + a, yy); c.lineTo(x - a, yy); c.stroke(); }
  }
  function virus(c, x, y, s) {
    c.strokeStyle = '#7b4bb0'; c.lineWidth = Math.max(1.5, s * .03);
    for (let i = 0; i < 14; i++) { const a = i / 14 * TAU; c.beginPath(); c.moveTo(x + Math.cos(a) * s * .36, y + Math.sin(a) * s * .36); c.lineTo(x + Math.cos(a) * s * .5, y + Math.sin(a) * s * .5); c.stroke(); c.fillStyle = '#b48ad6'; c.beginPath(); c.arc(x + Math.cos(a) * s * .5, y + Math.sin(a) * s * .5, Math.max(1.5, s * .035), 0, TAU); c.fill(); }
    const g = c.createRadialGradient(x - s * .1, y - s * .1, 0, x, y, s * .38); g.addColorStop(0, '#e9dcf6'); g.addColorStop(1, '#9b6cc8');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, s * .36, 0, TAU); c.fill(); c.stroke();
  }
  function bacterium(c, x, y, s) {
    c.strokeStyle = '#3f7d3a'; c.lineWidth = Math.max(1, s * .02); c.beginPath();
    for (let i = 0; i <= 30; i++) { const t = i / 30; const xx = x + s * .48 + t * s * .45, yy = y + Math.sin(t * 12) * s * .05; i ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke();
    const w = s, h = s * .4, g = c.createLinearGradient(0, y - h / 2, 0, y + h / 2); g.addColorStop(0, '#b6dca0'); g.addColorStop(1, '#5e9e4f');
    c.fillStyle = g; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, h / 2); c.fill(); c.strokeStyle = '#2f5f2a'; c.lineWidth = Math.max(1.5, s * .02); c.stroke();
  }
  function rbc(c, x, y, s) {
    const g = c.createRadialGradient(x, y, s * .05, x, y, s / 2); g.addColorStop(0, '#f08a7c'); g.addColorStop(.45, '#c9302c'); g.addColorStop(1, '#8f1d1a');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, s / 2, 0, TAU); c.fill();
  }
  function hair(c, x, y, s) {
    const g = c.createLinearGradient(x - s / 2, 0, x + s / 2, 0); g.addColorStop(0, '#3a2414'); g.addColorStop(.4, '#7a5234'); g.addColorStop(1, '#2c1a0e');
    c.fillStyle = g; c.fillRect(x - s / 2, y - s * 3, s, s * 6);
    c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = Math.max(1, s * .03);
    for (let i = 0; i < 9; i++) { const yy = y - s * 3 + i * s * .7; c.beginPath(); c.moveTo(x - s / 2, yy); c.lineTo(x + s / 2, yy - s * .2); c.stroke(); }
  }
  function ant(c, x, y, s) {
    c.strokeStyle = '#2a1d14'; c.lineWidth = Math.max(1.2, s * .025);
    for (let i = -1; i <= 1; i++) { c.beginPath(); c.moveTo(x - s * .05 + i * s * .08, y); c.lineTo(x - s * .2 + i * s * .12, y + s * .22); c.moveTo(x - s * .05 + i * s * .08, y); c.lineTo(x - s * .15 + i * s * .14, y - s * .2); c.stroke(); }
    c.fillStyle = '#3a271a';
    [[-.3, .14, .12], [-.03, .1, .08], [.27, .17, .13]].forEach(([dx, rx, ry]) => { c.beginPath(); c.ellipse(x + dx * s, y, rx * s, ry * s, 0, 0, TAU); c.fill(); });
  }
  function dvd(c, x, y, s) {
    const g = c.createConicGradient(0, x, y); ['#d8dde3', '#bcd6f2', '#e6d0f2', '#f7efc4', '#cfeccf', '#d8dde3'].forEach((k, i) => g.addColorStop(i / 5, k));
    c.fillStyle = g; c.beginPath(); c.arc(x, y, s / 2, 0, TAU); c.fill(); c.strokeStyle = '#7d8794'; c.lineWidth = 2; c.stroke();
    c.fillStyle = '#fbfcf9'; c.beginPath(); c.arc(x, y, s * .06, 0, TAU); c.fill(); c.stroke();
  }
  function human(c, x, y, s) {
    const top = y - s / 2; c.fillStyle = '#2b3a4a';
    c.beginPath(); c.arc(x, top + s * .07, s * .07, 0, TAU); c.fill();
    c.beginPath(); c.roundRect(x - s * .1, top + s * .16, s * .2, s * .38, s * .05); c.fill();
    c.fillRect(x - s * .09, top + s * .52, s * .07, s * .48); c.fillRect(x + s * .02, top + s * .52, s * .07, s * .48);
    c.fillRect(x - s * .16, top + s * .18, s * .05, s * .3); c.fillRect(x + s * .11, top + s * .18, s * .05, s * .3);
  }
  function tower(c, x, y, s) {
    const top = y - s / 2, bot = y + s / 2, w = s * .34;
    c.fillStyle = '#c9b48f'; c.beginPath(); c.moveTo(x - w / 2, bot); c.bezierCurveTo(x - w * .62, bot - s * .4, x - w * .25, top + s * .3, x - w * .3, top + s * .1); c.lineTo(x + w * .3, top + s * .1); c.bezierCurveTo(x + w * .25, top + s * .3, x + w * .62, bot - s * .4, x + w / 2, bot); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(29,36,51,.35)'; c.lineWidth = Math.max(1, s * .006);
    for (let i = 1; i < 14; i++) { const yy = top + s * .1 + i * s * .065; c.beginPath(); c.moveTo(x - w * .6, yy); c.lineTo(x + w * .6, yy); c.stroke(); }
    c.fillStyle = '#9c8865'; c.fillRect(x - w * .38, top, w * .76, s * .1); c.fillStyle = '#2b2b2b'; c.fillRect(x - w * .08, y - s * .05, w * .16, s * .09);
  }
  function mountain(c, x, y, s) {
    const g = c.createLinearGradient(0, y - s / 2, 0, y + s / 2); g.addColorStop(0, '#8d97a3'); g.addColorStop(1, '#4b5563');
    c.fillStyle = g; c.beginPath(); c.moveTo(x - s * 1.4, y + s / 2); c.lineTo(x - s * .3, y - s * .1); c.lineTo(x, y - s / 2); c.lineTo(x + s * .5, y + s * .05); c.lineTo(x + s * 1.4, y + s / 2); c.fill();
    c.fillStyle = '#fbfcf9'; c.beginPath(); c.moveTo(x, y - s / 2); c.lineTo(x - s * .16, y - s * .26); c.lineTo(x - s * .05, y - s * .3); c.lineTo(x + s * .05, y - s * .24); c.lineTo(x + s * .17, y - s * .28); c.fill();
  }
  function earthBall(c, x, y, d) {
    const g = c.createRadialGradient(x - d * .15, y - d * .15, d * .05, x, y, d / 2); g.addColorStop(0, '#7fc2ef'); g.addColorStop(1, '#1f5f9a');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, d / 2, 0, TAU); c.fill();
    if (d > 20) { c.fillStyle = '#5f9e4f'; [[-.15, -.12, .16, .1], [.14, .08, .13, .16], [-.05, .2, .1, .07]].forEach(([a, b, rx, ry]) => { c.beginPath(); c.ellipse(x + a * d, y + b * d, rx * d, ry * d, .4, 0, TAU); c.fill(); }); }
  }
  function earth(c, x, y, s) { earthBall(c, x, y, s); }
  function earthMoon(c, x, y, s) {
    const de = Math.max(4, s * .033), dm = Math.max(3, s * .009);
    c.setLineDash([6, 6]); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - s / 2, y); c.lineTo(x + s / 2, y); c.stroke(); c.setLineDash([]);
    earthBall(c, x - s / 2, y, de);
    c.fillStyle = '#c9c9c4'; c.beginPath(); c.arc(x + s / 2, y, dm / 2, 0, TAU); c.fill();
  }
  function sun(c, x, y, s) {
    const g = c.createRadialGradient(x, y, s * .1, x, y, s * .75); g.addColorStop(0, '#fff3b0'); g.addColorStop(.62, '#ffb52e'); g.addColorStop(.67, 'rgba(255,170,40,.45)'); g.addColorStop(1, 'rgba(255,170,40,0)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, s * .75, 0, TAU); c.fill();
  }
  function system(c, x, y, s) {
    c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 1.5;
    [.013, .025, .034, .052, .17, .32, .64, 1].forEach((r) => { c.beginPath(); c.arc(x, y, s / 2 * r, 0, TAU); c.stroke(); });
    c.fillStyle = '#ffcf3a'; c.beginPath(); c.arc(x, y, Math.max(3, s * .004), 0, TAU); c.fill();
    c.fillStyle = '#9ec7ef'; c.beginPath(); c.arc(x + s / 2, y, 4, 0, TAU); c.fill();
  }
  function galaxy(c, x, y, s) {
    const g = c.createRadialGradient(x, y, 0, x, y, s / 2); g.addColorStop(0, 'rgba(255,240,200,.95)'); g.addColorStop(.25, 'rgba(190,180,255,.35)'); g.addColorStop(1, 'rgba(120,120,220,0)');
    c.fillStyle = g; c.beginPath(); c.ellipse(x, y, s / 2, s / 2 * .55, -.3, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,.75)';
    for (let i = 0; i < 260; i++) { const k = i % 2, t = (i / 260) * 3.2, r = s / 2 * (.08 + t / 3.6), a = t * 2.2 + k * Math.PI; const px = x + Math.cos(a - .3) * r, py = y + Math.sin(a) * r * .55; c.fillRect(px, py, 1.6, 1.6); }
  }
  function universe(c, x, y, s) {
    const g = c.createRadialGradient(x, y, 0, x, y, s / 2); g.addColorStop(0, 'rgba(60,60,110,.9)'); g.addColorStop(.92, 'rgba(30,30,70,.85)'); g.addColorStop(1, 'rgba(180,140,255,.6)');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, s / 2, 0, TAU); c.fill();
    let r = 7; const rnd = () => { r = (r * 16807) % 2147483647; return r / 2147483647; };
    c.fillStyle = 'rgba(255,230,190,.8)';
    for (let i = 0; i < 420; i++) { const a = rnd() * TAU, d = Math.sqrt(rnd()) * s / 2 * .95; c.fillRect(x + Math.cos(a) * d, y + Math.sin(a) * d, 1.5, 1.5); }
  }

  function mount(root) {
    const stage = root.querySelector('.zm-stage'), cv = stage.querySelector('canvas'), c = cv.getContext('2d');
    const range = root.querySelector('.zm-range'), now = root.querySelector('.zm-now'), badge = root.querySelector('.zm-badge');
    const bar = root.querySelector('.zm-bar'), barT = root.querySelector('.zm-bar b'), find = root.querySelector('.zm-find');
    range.min = String(LMIN); range.max = String(LMAX);
    let L = Math.log10(1.7 * 2.6), Lt = L, W = 0, H = 0, raf = 0, active = false, minHit = false, maxHit = false;
    function fit() {
      const r = stage.getBoundingClientRect(), k = (window.Reveal && Reveal.getScale) ? Reveal.getScale() : 1;
      W = stage.offsetWidth; H = stage.offsetHeight; if (!W || !H) return;
      const dpr = clamp((window.devicePixelRatio || 1) * k, 1, 2);
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); c.setTransform(dpr, 0, 0, dpr, 0, 0); draw(); void r;
    }
    function draw() {
      if (!W) return;
      const Wm = Math.pow(10, L), cx = centerAt(L), mid = H * .47;
      const space = clamp((L - 6.6) / 1.2, 0, 1), micro = clamp((-L - 6.6) / 2, 0, 1);
      c.fillStyle = `rgb(${Math.round(251 - 225 * space - 20 * micro)},${Math.round(252 - 222 * space - 8 * micro)},${Math.round(249 - 200 * space)})`;
      c.fillRect(0, 0, W, H);
      // 가까운 크기의 물체들
      let best = -1, bd = Infinity;
      O.forEach((o, i) => {
        const s = o[1] / Wm * W, x = (X[i] - cx) / Wm * W + W / 2;
        const a = clamp(Math.min((s - 4) / 30, (W * 1.6 - s) / (W * .5)), 0, 1);
        if (a <= 0 || x < -W || x > W * 2) return;
        c.globalAlpha = a; o[3](c, x, mid, s); c.globalAlpha = 1;
        if (s > 46 && x > -40 && x < W + 40) {
          c.globalAlpha = clamp((s - 46) / 40, 0, 1) * a;
          const ty = Math.min(H - 70, mid + Math.min(s * (o[3] === hair || o[3] === dna ? 3.1 : .62), H * .4) + 30);
          c.font = '700 22px "IBM Plex Sans KR", "Apple SD Gothic Neo", sans-serif'; c.textAlign = 'center';
          c.fillStyle = space > .5 ? '#fbfcf9' : '#1d2433'; c.fillText(o[0], clamp(x, 90, W - 90), ty);
          c.font = '500 18px "IBM Plex Sans KR", "Apple SD Gothic Neo", sans-serif'; c.fillStyle = space > .5 ? '#d7dde8' : '#4a5468'; c.fillText(o[2], clamp(x, 90, W - 90), ty + 24);
          c.globalAlpha = 1;
        }
        const d = Math.abs(Math.log10(o[1] * 2.6) - L); if (d < bd) { bd = d; best = i; }
      });
      // 길이 막대: 화면 너비의 10~30%가 되는 10의 거듭제곱
      const n = Math.floor(Math.log10(Wm * .3)), px = Math.pow(10, n) / Wm * W;
      bar.style.width = `${px.toFixed(1)}px`; barT.textContent = barName(n);
      bar.classList.toggle('dark', space > .5);
      const mic = L < -8.2;
      badge.textContent = mic ? '미시 세계' : '거시 세계'; badge.classList.toggle('mi', mic);
      if (best >= 0) find.textContent = `가까이 보이는 것: ${O[best][0]} (${O[best][2]})`;
    }
    function frame() {
      raf = 0; const d = Lt - L; L += Math.abs(d) < .002 || reduce() ? d : d * .18; draw();
      if (Math.abs(Lt - L) > .001) raf = requestAnimationFrame(frame);
    }
    function go(v, instant) {
      Lt = clamp(v, LMIN, LMAX); range.value = String(Lt);
      if (instant || !active) { L = Lt; draw(); } else if (!raf) raf = requestAnimationFrame(frame);
      if (Lt <= LMIN + .25) minHit = true; if (Lt >= LMAX - .3) maxHit = true;
      now.textContent = maxHit && minHit ? '③ 오른쪽에서 잴 방법을 골라 보자' : minHit ? '② 이번에는 끝까지 축소해 가장 큰 것을 찾자' : '① 끝까지 확대해 가장 작은 것을 찾자';
      root.dispatchEvent(new CustomEvent('zm-change', { detail: { L: Lt, minHit, maxHit } }));
    }
    range.addEventListener('input', () => go(+range.value));
    cv.addEventListener('wheel', (e) => { e.preventDefault(); go(Lt + Math.sign(e.deltaY) * .25); }, { passive: false });
    // 두 손가락 벌리기·오므리기, 한 손가락 위아래 끌기
    const pts = new Map(); let pinch = 0, y0 = 0, L0 = 0;
    cv.addEventListener('pointerdown', (e) => { pts.set(e.pointerId, [e.clientX, e.clientY]); try { cv.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ } if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = Math.hypot(a[0] - b[0], a[1] - b[1]); L0 = Lt; } else { y0 = e.clientY; L0 = Lt; } });
    cv.addEventListener('pointermove', (e) => {
      if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, [e.clientX, e.clientY]);
      if (pts.size === 2 && pinch) { const [a, b] = [...pts.values()]; go(L0 - Math.log10(Math.hypot(a[0] - b[0], a[1] - b[1]) / pinch) * 3); }
      else if (pts.size === 1) go(L0 + (e.clientY - y0) / 40);
    });
    const up = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch = 0; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    // 확대·축소 단추: 누르고 있으면 계속
    root.querySelectorAll('.zm-btn').forEach((b) => {
      let tm = 0; const dir = +b.dataset.d;
      const stop = () => { clearInterval(tm); tm = 0; };
      b.addEventListener('pointerdown', (e) => { e.preventDefault(); go(Lt + dir * .5); stop(); tm = setInterval(() => go(Lt + dir * .35), 120); });
      ['pointerup', 'pointerleave', 'pointercancel'].forEach((k) => b.addEventListener(k, stop));
      b.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); go(Lt + dir); } });
    });
    cv.addEventListener('keydown', (e) => { const m = { ArrowUp: -1, ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1 }[e.key]; if (m) { e.preventDefault(); e.stopPropagation(); go(Lt + m * .5); } });
    go(L, true);
    root._zm = { go: (v) => go(v, true), get L() { return Lt; } };
    return { setActive(on) { active = on; if (on) fit(); }, fit };
  }
  window.Zoom = { mount, O };
})();
