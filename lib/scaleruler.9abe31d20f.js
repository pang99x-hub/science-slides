/* 1-1 1차시 이론 장 «규모 자»: 10배마다 같은 간격인 자(로그 눈금) 위의 점을 끌면 가장 가까운 예가 읽힌다.
   공간 규모(m) ↔ 시간 규모(s)를 단추로 바꾼다. 교과서 14~15쪽의 예 + 이해를 돕기 위한 예.
   ScaleRuler.mount(root) → {} · 시험용: root._sr.mode('space'|'time') · pick(i) */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, at, par) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const pow = (n) => '10' + (n < 0 ? '⁻' : '') + String(Math.abs(n)).split('').map((d) => SUP[d]).join('');
  // [이름, 값, 읽기 쉬운 값, 무리(미시·거시 / 짧은·일상·긴), 한 줄]
  const DATA = {
    space: { unit: 'm', lo: -11, hi: 22, items: [
      ['수소 원자', 1e-10, '약 0.1 nm', 'mi', '원자 하나. 가장 좋은 현미경으로 겨우 보인다'],
      ['바이러스', 1e-7, '약 0.1 μm', 'ma', '전자 현미경으로 본다. 그래도 원자보다 1000배쯤 크다'],
      ['적혈구', 7e-6, '약 7 μm', 'ma', '피 속의 붉은 세포. 광학 현미경으로 본다'],
      ['동전 두께', 1.5e-3, '1.5 mm', 'ma', '자의 가장 작은 눈금(1 mm) 정도'],
      ['DVD 지름', 0.12, '12 cm', 'ma', '손에 든 물건은 자로 바로 잰다'],
      ['농구대 높이', 3.05, '305 cm', 'ma', '줄자로 잰다'],
      ['첨성대 높이', 9.51, '9.51 m', 'ma', '건물 높이 정도의 규모'],
      ['에베레스트산 높이', 8848, '8848 m', 'ma', '땅 위에서 가장 높은 곳'],
      ['지구 반지름', 6.4e6, '약 6400 km', 'ma', '자로는 잴 수 없는 규모'],
      ['지구~달 거리', 3.84e8, '약 38만 km', 'ma', '빛으로 1.3초쯤 걸리는 거리'],
      ['지구~태양 거리', 1.5e11, '약 1억 5천만 km', 'ma', '빛으로 8분 남짓'],
      ['우리은하 지름', 1e21, '약 10만 광년', 'ma', '빛도 10만 년을 가야 하는 크기'],
    ] },
    time: { unit: 's', lo: -9, hi: 18, items: [
      ['빛이 교실을 가로지르는 시간', 3e-8, '약 3천만분의 1초', 'sh', '10 m를 빛이 지나는 데 걸리는 시간'],
      ['번개가 번쩍이는 순간', 1e-4, '약 1만분의 1초', 'sh', '한 줄기 번개의 길이는 아주 짧다'],
      ['눈 한 번 깜빡임', 0.3, '약 0.3초', 'ev', '사람이 느끼는 가장 짧은 시간쯤'],
      ['100 m 달리기', 12, '10초 남짓', 'ev', '초시계로 잴 수 있다'],
      ['하루', 86400, '24시간', 'ev', '지구가 한 바퀴 자전하는 시간'],
      ['달이 지구를 한 바퀴', 2.36e6, '27.3일', 'ev', '달이 지구 둘레를 도는 시간'],
      ['1년', 3.15e7, '365일', 'ev', '지구가 태양 둘레를 한 바퀴'],
      ['사람의 일생', 2.5e9, '약 80년', 'ev', '사람이 직접 겪을 수 있는 시간'],
      ['암석이 풍화되는 시간', 3e13, '약 100만 년', 'lo', '초시계로는 잴 수 없는 규모'],
      ['공룡이 사라진 뒤', 2.1e15, '약 6600만 년', 'lo', '중생대 끝부터 지금까지'],
      ['우주의 나이', 4.35e17, '약 138억 년', 'lo', '가장 긴 시간 규모'],
    ] },
  };
  const GROUP = { mi: ['미시 세계', 'k-mi'], ma: ['거시 세계', 'k-ma'], sh: ['아주 짧은 시간', 'k-mi'], ev: ['사람이 겪는 시간', 'k-ev'], lo: ['아주 긴 시간', 'k-ma'] };
  const X0 = 40, X1 = 860, AY = 150;
  // 카드 그림: 확대 장(zoom.js)의 그림을 빌려 쓴다(이름 → 그 장의 번호). 없으면 이 파일의 그림
  const PIC = { '수소 원자': 0, '바이러스': 2, '적혈구': 4, 'DVD 지름': 7, '첨성대 높이': 9, '에베레스트산 높이': 10, '지구 반지름': 11, '지구~달 거리': 12, '지구~태양 거리': 13, '우리은하 지름': 15 };
  const UNITS = [[1e20, '해'], [1e16, '경'], [1e12, '조'], [1e8, '억'], [1e4, '만']];
  function kor(n) {
    for (const [u, w] of UNITS) if (n >= u) { const k = n / u; return `${k >= 10 ? Math.round(k) : Math.round(k * 10) / 10}${w}`; }
    return n >= 10 ? String(Math.round(n)) : String(Math.round(n * 10) / 10);
  }
  function compare(mode, v) {
    const base = mode === 'space' ? 1.7 : 1, nm = mode === 'space' ? '사람 키(1.7 m)' : '1초', r = v / base;
    if (r >= 0.5 && r <= 2) return `${nm}와 비슷하다`;
    return r > 1 ? `${nm}의 약 <b>${kor(r)}배</b>` : `${nm}의 약 <b>${kor(1 / r)}분의 1</b>`;
  }
  function drawPic(cv, mode, it) {
    const c = cv.getContext('2d'), S = cv.width; c.clearRect(0, 0, S, S);
    const dark = mode === 'space' && Math.log10(it[1]) > 6;
    c.fillStyle = dark ? '#1c2744' : '#eef3ee'; c.beginPath(); c.roundRect(0, 0, S, S, 18); c.fill();
    const Z = window.Zoom && window.Zoom.O;
    if (mode === 'space' && Z && PIC[it[0]] != null) { Z[PIC[it[0]]][3](c, S / 2, S / 2, S * (PIC[it[0]] === 10 ? 0.42 : PIC[it[0]] === 12 ? 0.8 : PIC[it[0]] === 13 ? 0.6 : 0.7)); return; }
    if (it[0] === '동전 두께') {
      c.fillStyle = '#c9a24a'; c.strokeStyle = '#7d5f1f'; c.lineWidth = 4;
      c.beginPath(); c.ellipse(S / 2, S / 2 - 8, 80, 26, 0, 0, Math.PI * 2); c.fill(); c.stroke();
      c.fillRect(S / 2 - 80, S / 2 - 8, 160, 18); c.beginPath(); c.ellipse(S / 2, S / 2 + 10, 80, 26, 0, 0, Math.PI); c.fill(); c.stroke();
      c.strokeStyle = '#d9483b'; c.lineWidth = 3; c.beginPath(); c.moveTo(S / 2 + 96, S / 2 - 8); c.lineTo(S / 2 + 96, S / 2 + 12); c.stroke(); return;
    }
    if (it[0] === '농구대 높이') {
      c.fillStyle = '#4a5468'; c.fillRect(S / 2 - 50, 40, 10, 170); c.fillStyle = '#fff'; c.strokeStyle = '#1d2433'; c.lineWidth = 3; c.fillRect(S / 2 - 46, 40, 90, 60); c.strokeRect(S / 2 - 46, 40, 90, 60);
      c.strokeStyle = '#d9631e'; c.lineWidth = 5; c.beginPath(); c.ellipse(S / 2 + 20, 104, 26, 8, 0, 0, Math.PI * 2); c.stroke(); return;
    }
    // 시간: 초시계 — 바늘이 규모(로그) 자리를 가리킨다
    const D = DATA.time, f = (Math.log10(it[1]) - D.lo) / (D.hi - D.lo), cx = S / 2, cy = S / 2 + 10, r = 82;
    c.fillStyle = '#fff'; c.strokeStyle = '#1d2433'; c.lineWidth = 6; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill(); c.stroke();
    c.fillStyle = '#1d2433'; c.fillRect(cx - 12, cy - r - 22, 24, 16);
    c.strokeStyle = '#2f8a4a'; c.lineWidth = 14; c.beginPath(); c.arc(cx, cy, r - 16, -Math.PI / 2, -Math.PI / 2 + f * Math.PI * 2); c.stroke();
    c.strokeStyle = '#d9483b'; c.lineWidth = 5; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.sin(f * Math.PI * 2) * (r - 26), cy - Math.cos(f * Math.PI * 2) * (r - 26)); c.stroke();
  }

  function mount(root) {
    const box = root.querySelector('.sr'), svg = box.querySelector('.sr-svg');
    const pic = box.querySelector('.sr-pic'), cmp = box.querySelector('.sr-cmp'), nm = box.querySelector('.sr-name'), val = box.querySelector('.sr-val'), pw = box.querySelector('.sr-pow'), chip = box.querySelector('.sr-chip'), d = box.querySelector('.sr-d');
    const btns = [...box.querySelectorAll('.sr-mode button')];
    let mode = 'space', items = [], cur = 0, dots = [];
    const xOf = (v) => { const D = DATA[mode]; return X0 + (Math.log10(v) - D.lo) / (D.hi - D.lo) * (X1 - X0); };
    const knob = el('g', { class: 'sr-knob', tabindex: 0, role: 'slider', 'aria-label': '점: 끌거나 화살표 키로 옮긴다' });
    function draw() {
      svg.textContent = '';
      const D = DATA[mode]; items = D.items;
      // 미시/거시 띠(공간) · 짧은/긴 띠(시간)
      if (mode === 'space') {
        const xm = xOf(1e-9);
        el('rect', { x: X0, y: AY - 64, width: xm - X0, height: 92, class: 'sr-band mi' }, svg);
        el('rect', { x: xm, y: AY - 64, width: X1 - xm, height: 92, class: 'sr-band ma' }, svg);
        el('text', { x: (X0 + xm) / 2, y: AY - 40, class: 'sr-bt', 'text-anchor': 'middle' }, svg).textContent = '미시';
        el('text', { x: xm + 14, y: AY - 40, class: 'sr-bt' }, svg).textContent = '거시 세계 →';
      } else {
        const a = xOf(0.1), b = xOf(3e9);
        el('rect', { x: X0, y: AY - 64, width: a - X0, height: 92, class: 'sr-band mi' }, svg);
        el('rect', { x: a, y: AY - 64, width: b - a, height: 92, class: 'sr-band ev' }, svg);
        el('rect', { x: b, y: AY - 64, width: X1 - b, height: 92, class: 'sr-band ma' }, svg);
        el('text', { x: (a + b) / 2, y: AY - 40, class: 'sr-bt', 'text-anchor': 'middle' }, svg).textContent = '사람이 겪는 시간';
      }
      el('line', { x1: X0, y1: AY, x2: X1, y2: AY, class: 'sr-ax' }, svg);
      for (let n = D.lo; n <= D.hi; n++) {
        const x = X0 + (n - D.lo) / (D.hi - D.lo) * (X1 - X0), big = n % 3 === 0;
        el('line', { x1: x, y1: AY, x2: x, y2: AY + (big ? 16 : 8), class: 'sr-tk' }, svg);
        if (big) el('text', { x, y: AY + 42, class: 'sr-tl', 'text-anchor': 'middle' }, svg).textContent = pow(n);
      }
      el('text', { x: X1, y: AY + 76, class: 'sr-unit', 'text-anchor': 'end' }, svg).textContent = mode === 'space' ? '(m) 눈금 한 칸마다 10배' : '(초) 눈금 한 칸마다 10배';
      dots = items.map((it, i) => {
        const g = el('g', { class: 'sr-dot' }, svg), x = xOf(it[1]);
        el('circle', { cx: x, cy: AY, r: 9 }, g);
        g.addEventListener('click', () => set(x));
        return g;
      });
      svg.appendChild(knob); knob.textContent = '';
      el('line', { x1: 0, y1: -52, x2: 0, y2: 24, class: 'sr-kl' }, knob);
      el('circle', { cx: 0, cy: -60, r: 20, class: 'sr-ko' }, knob);
      el('circle', { cx: 0, cy: -60, r: 7, class: 'sr-ki' }, knob);
      btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.m === mode)));
    }
    function show(i) {
      cur = i; const it = items[i];
      dots.forEach((g, k) => g.classList.toggle('on', k === i));
      nm.textContent = it[0]; val.textContent = it[2];
      pw.textContent = `약 ${pow(Math.round(Math.log10(it[1])))} ${DATA[mode].unit}`;
      chip.textContent = GROUP[it[3]][0]; chip.className = 'chip sr-chip ' + GROUP[it[3]][1];
      d.textContent = it[4]; cmp.innerHTML = compare(mode, it[1]); drawPic(pic, mode, it);
    }
    function set(x, snap = true) {
      x = clamp(x, X0, X1);
      let best = 0, bd = Infinity; items.forEach((it, i) => { const dd = Math.abs(xOf(it[1]) - x); if (dd < bd) { bd = dd; best = i; } });
      const sx = snap ? xOf(items[best][1]) : x;
      knob.setAttribute('transform', `translate(${sx} ${AY})`);
      if (best !== cur || !snap) show(best); else show(best);
      root.dispatchEvent(new CustomEvent('sr-pick', { detail: { mode, i: best } }));
    }
    const toX = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()).x; };
    let drag = false;
    svg.addEventListener('pointerdown', (e) => { drag = true; try { svg.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ } set(toX(e), false); });
    svg.addEventListener('pointermove', (e) => { if (drag) set(toX(e), false); });
    const up = (e) => { if (!drag) return; drag = false; set(toX(e)); };
    svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', () => { drag = false; });
    knob.addEventListener('keydown', (e) => { const m = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1 }[e.key]; if (!m) return; e.preventDefault(); e.stopPropagation(); const i = clamp(cur + m, 0, items.length - 1); set(xOf(items[i][1])); });
    btns.forEach((b) => b.addEventListener('click', () => { mode = b.dataset.m; cur = 0; draw(); set(xOf(items[mode === 'space' ? 2 : 3][1])); }));
    draw(); set(xOf(items[2][1]));
    root._sr = { mode: (m) => btns.find((b) => b.dataset.m === m).click(), pick: (i) => set(xOf(items[i][1])) };
    return {};
  }
  window.ScaleRuler = { mount };
})();
