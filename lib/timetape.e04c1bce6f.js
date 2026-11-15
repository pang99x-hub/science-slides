/* 1차시 «지질 시대의 길이»(교과서 15쪽 그림 I-2): 46억 년 줄자. 시대 경계 깃발 셋(고생대·중생대·신생대가 시작한 때)을
   짐작해 줄자 위에 꽂고 «맞춰 보기»를 누르면 교과서 값(5억 3900만·2억 5200만·6600만 년 전) 자리에 진짜 깃발이 서고
   네 시대가 칠해진다(88.2·6.3·4.1·1.4 %). 마지막 6억 년은 아래에 확대해 보여 준다.
   오른쪽 칸: 깃발마다 얼마나 어긋났는지 → 46억 년을 하루(24시간)로 줄인 시계가 칠해진다(체험: 앞 설명 장의 길이·하루 시계 확인).
   TpTape.mount(root) → {} · 시험용 root._tp = { put(k, 억 년), check(), reset() } */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const X0 = 50, X1 = 950, TY = 170, AGE = 46;
  const ax = (age) => X0 + (AGE - age) / AGE * (X1 - X0);
  const ageOf = (x) => AGE - (x - X0) / (X1 - X0) * AGE;
  const ZX = (age) => X0 + (6 - age) / 6 * (X1 - X0), ZY = 340;     // 확대 띠: 6억 년 전 ~ 현재
  const FLAGS = [
    { k: 'pz', t: '고생대 시작', age: 5.39, c: '#5b8fd0', s: '약 5억 3900만 년 전' },
    { k: 'mz', t: '중생대 시작', age: 2.52, c: '#4fa36b', s: '약 2억 5200만 년 전' },
    { k: 'cz', t: '신생대 시작', age: 0.66, c: '#e0a03a', s: '약 6600만 년 전' },
  ];
  const ERAS = [
    { t: '선캄브리아시대', a: 46, b: 5.39, pct: 88.2, c: '#c7b8a3' },
    { t: '고생대', a: 5.39, b: 2.52, pct: 6.3, c: '#5b8fd0' },
    { t: '중생대', a: 2.52, b: 0.66, pct: 4.1, c: '#4fa36b' },
    { t: '신생대', a: 0.66, b: 0, pct: 1.4, c: '#e0a03a' },
  ];
  const fmt = (a) => (a >= 1 ? `${a.toFixed(1)}억 년 전` : `${Math.round(a * 10000)}만 년 전`);

  function mount(root) {
    const svg = root.querySelector('.tp-svg'), msg = root.querySelector('.tp-msg'), now = root.querySelector('.tp-now');
    const checkBtn = root.querySelector('.tp-check'), resetBtn = root.querySelector('.tp-reset');
    const clock = root.querySelector('.tp-clock'), dayList = root.querySelector('.tp-day');
    el('rect', { class: 'tp-bg', x: 0, y: 0, width: 1000, height: 560 }, svg);
    const eraG = el('g', { class: 'tp-eras' }, svg);
    // 줄자 몸통
    el('rect', { class: 'tp-tape', x: X0 - 6, y: TY - 26, width: X1 - X0 + 12, height: 52, rx: 6 }, svg);
    const ticks = el('g', { class: 'tp-ticks' }, svg);
    for (let a = 45; a >= 0; a -= 1) {
      const x = ax(a), big = a % 5 === 0;
      el('path', { d: `M${x} ${TY - 26} v ${big ? 22 : 11}` }, ticks);
      if (a % 10 === 0 && a > 0) el('text', { x, y: TY + 20 }, ticks).textContent = `${a}억`;
    }
    el('path', { d: `M${ax(46)} ${TY - 26} v 22` }, ticks);
    el('text', { class: 'tp-end', x: ax(46) - 6, y: TY + 64 }, svg).textContent = '46억 년 전 · 지구 탄생';
    el('text', { class: 'tp-end r', x: ax(0) + 6, y: TY + 64 }, svg).textContent = '현재';
    // 확대 띠(맞춰 본 뒤)
    const zoom = el('g', { class: 'tp-zoom' }, svg);
    el('path', { class: 'tp-zl', d: `M${ax(6)} ${TY + 26} L ${X0} ${ZY - 22} M ${ax(0)} ${TY + 26} L ${X1} ${ZY - 22}` }, zoom);
    el('rect', { class: 'tp-ztape', x: X0, y: ZY - 22, width: X1 - X0, height: 44, rx: 6 }, zoom);
    const zEra = el('g', {}, zoom);
    for (let a = 6; a >= 0; a -= 1) { el('path', { class: 'tp-zt', d: `M${ZX(a)} ${ZY - 22} v 12` }, zoom); if (a % 2 === 0) el('text', { class: 'tp-zn', x: ZX(a), y: ZY + 48 }, zoom).textContent = a ? `${a}억` : '현재'; }
    el('text', { class: 'tp-zcap', x: X0, y: ZY - 34 }, zoom).textContent = '마지막 6억 년을 크게 본 것';
    const trueG = el('g', { class: 'tp-true' }, svg);
    // 깃발(끌어 꽂기)
    const TRAYY = 500;
    const flags = FLAGS.map((f, i) => {
      const g = el('g', { class: 'tp-flag', tabindex: 0, role: 'button', 'aria-label': `${f.t} 깃발: 끌어서 줄자 위에 꽂는다. 꽂은 뒤 화살표 키로 옮긴다` }, svg);
      el('path', { class: 'tp-pole', d: 'M0 0 V -88' }, g);
      el('path', { class: 'tp-cloth', d: 'M0 -88 h 150 l -16 21 l 16 21 h -150 z', fill: f.c }, g);
      el('text', { class: 'tp-ft', x: 68, y: -59 }, g).textContent = f.t;
      el('circle', { class: 'tp-foot', cx: 0, cy: 0, r: 7 }, g);
      el('rect', { class: 'tp-hit', x: -20, y: -100, width: 180, height: 114 }, g);
      const o = { ...f, g, x: 130 + i * 290, y: TRAYY, on: false };
      o.put = () => g.setAttribute('transform', `translate(${o.x} ${o.y})`); o.put();
      return o;
    });
    el('text', { class: 'tp-traycap', x: 500, y: 540 }, svg).textContent = '▲ 깃발을 끌어 위 줄자에 꽂기';
    let checked = false;
    const svgPt = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
    function ui() {
      const placed = flags.filter((f) => f.on).length;
      root.querySelector('.tp-n').textContent = `${placed}/3`;
      window.L1.steps(root, checked ? 0 : placed < 3 ? 1 : 2, [placed === 3 || checked ? 1 : 0, checked ? 2 : 0]);
      window.L1.done(root, checked);
    }
    function update() {
      const placed = flags.filter((f) => f.on).length;
      checkBtn.disabled = placed < 3;
      if (!checked) {
        now.textContent = placed === 3 ? '다 꽂았다! 오른쪽 아래 «맞춰 보기»' : '';
        now.classList.toggle('done', placed === 3);
        msg.innerHTML = flags.filter((f) => f.on).map((f) => `<span class="tp-g" style="--c:${f.c}">${f.t}</span> ${fmt(ageOf(f.x))}`).join(' · ') || '지구 나이는 46억 년. 세 시대가 언제 시작했을지 짐작해 보자.';
      }
      ui();
    }
    flags.forEach((f) => {
      let d = null;
      f.g.addEventListener('pointerdown', (e) => { if (checked) return; d = { id: e.pointerId, dx: svgPt(e).x - f.x, dy: svgPt(e).y - f.y }; try { f.g.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ } f.g.classList.add('drag'); e.stopPropagation(); });
      f.g.addEventListener('pointermove', (e) => { if (!d || d.id !== e.pointerId) return; const q = svgPt(e); f.x = clamp(q.x - d.dx, X0, X1); f.y = clamp(q.y - d.dy, 90, 540); f.put(); });
      const up = (e) => {
        if (!d || d.id !== e.pointerId) return; d = null; f.g.classList.remove('drag');
        if (Math.abs(f.y - TY) < 150) { f.y = TY - 26; f.on = true; } else { f.on = false; f.y = TRAYY; }
        f.put(); update();
      };
      f.g.addEventListener('pointerup', up); f.g.addEventListener('pointercancel', up);
      f.g.addEventListener('keydown', (e) => {
        if (checked) return;
        const m = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
        if (m) { e.preventDefault(); e.stopPropagation(); if (!f.on) { f.on = true; f.y = TY - 26; } f.x = clamp(f.x + m * (X1 - X0) / 92, X0, X1); f.put(); update(); }
      });
    });
    // 하루 시계: 46억 년 = 24시간
    const C = 130, R = 104;
    const pt = (h, r) => [C + r * Math.sin(h / 24 * 2 * Math.PI), C - r * Math.cos(h / 24 * 2 * Math.PI)];
    el('circle', { class: 'tp-cface', cx: C, cy: C, r: R + 18 }, clock);
    const ring = el('g', {}, clock);
    el('circle', { class: 'tp-cring', cx: C, cy: C, r: R, 'stroke-width': 30 }, ring);
    [0, 6, 12, 18].forEach((h) => { const [x, y] = pt(h, R - 36); el('text', { class: 'tp-ch', x, y: y + 9 }, clock).textContent = h === 0 ? '0시' : `${h}시`; });
    const ctxt = el('text', { class: 'tp-cc', x: C, y: C + 8 }, clock); ctxt.textContent = '?';
    const hm = (pc) => { const m = Math.round(pc / 100 * 24 * 60); return `${Math.floor(m / 60)}시 ${String(m % 60).padStart(2, '0')}분`; };
    function paintClock() {
      ring.textContent = '';
      let acc = 0;
      ERAS.forEach((r) => {
        const h0 = acc / 100 * 24, h1 = (acc + r.pct) / 100 * 24; acc += r.pct;
        const [x0, y0] = pt(h0, R), [x1, y1] = pt(Math.min(h1, 23.999), R);
        el('path', { d: `M${x0} ${y0} A ${R} ${R} 0 ${h1 - h0 > 12 ? 1 : 0} 1 ${x1} ${y1}`, stroke: r.c, class: 'tp-carc' }, ring);
      });
      ctxt.textContent = '하루';
      let a2 = 0;
      dayList.innerHTML = ERAS.map((r) => { const s = a2; a2 += r.pct; return `<li><i style="--c:${r.c}"></i><b>${r.t}</b><span>${r.b === 0 ? hm(s) + '~24시' : hm(s) + '~'}</span></li>`; }).join('');
    }
    function check() {
      checked = true; root.classList.add('tp-checked');
      eraG.textContent = ''; zEra.textContent = ''; trueG.textContent = '';
      ERAS.forEach((r) => {
        el('rect', { x: ax(r.a), y: TY - 26, width: ax(r.b) - ax(r.a), height: 52, fill: r.c, class: 'tp-era' }, eraG);
        if (r.a > 6) { const t = el('text', { class: 'tp-et', x: (ax(r.a) + ax(r.b)) / 2, y: TY + 64 }, eraG); t.textContent = `선캄브리아시대 ${r.pct} %`; }
        const za = Math.min(r.a, 6);
        el('rect', { x: ZX(za), y: ZY - 22, width: ZX(r.b) - ZX(za), height: 44, fill: r.c, class: 'tp-era' }, zEra);
        const t2 = el('text', { class: 'tp-zet', x: (ZX(za) + ZX(r.b)) / 2, y: ZY + 8 }, zEra); t2.textContent = r.a > 6 ? '←' : `${r.t} ${r.pct} %`;
      });
      const rows = [];
      flags.forEach((f) => {
        const g = el('g', { class: 'tp-tf', transform: `translate(${ax(f.age)} ${TY + 26})` }, trueG);
        el('path', { d: 'M0 0 V 34', stroke: f.c }, g);
        el('path', { class: 'tp-ar', d: `M${f.x - ax(f.age)} -40 Q ${(f.x - ax(f.age)) / 2} -80 0 -52` }, g);
        const zg = el('g', { class: 'tp-tf', transform: `translate(${ZX(f.age)} ${ZY + 22})` }, trueG);
        el('path', { d: 'M0 0 V -64', stroke: f.c }, zg);
        el('text', { class: 'tp-zf', x: f.k === 'pz' ? 8 : 0, y: f.k === 'mz' ? 108 : 78 }, zg).textContent = f.s;
        const diff = ageOf(f.x) - f.age;
        rows.push(`<span class="tp-g" style="--c:${f.c}">${f.t.replace(' 시작', '')}</span> ${Math.abs(diff) < 0.5 ? '거의 맞음' : `${Math.abs(diff).toFixed(1)}억 년 ${diff > 0 ? '일찍' : '늦게'}`}`);
      });
      now.textContent = '색 띠가 실제 시대, 빨간 화살은 내 깃발에서 실제 자리까지'; now.classList.add('done');
      msg.innerHTML = `<b>내 깃발이 어긋난 정도</b><br>${rows.join(' · ')}`;
      paintClock(); ui();
    }
    function reset() {
      checked = false; root.classList.remove('tp-checked'); eraG.textContent = ''; zEra.textContent = ''; trueG.textContent = '';
      ring.textContent = ''; el('circle', { class: 'tp-cring', cx: C, cy: C, r: R, 'stroke-width': 30 }, ring); ctxt.textContent = '?'; dayList.innerHTML = '';
      flags.forEach((f, i) => { f.on = false; f.x = 130 + i * 290; f.y = TRAYY; f.put(); }); update();
    }
    checkBtn.addEventListener('click', check); resetBtn.addEventListener('click', reset);
    update();
    root._tp = { put(k, age) { const f = flags.find((x) => x.k === k); f.on = true; f.x = ax(age); f.y = TY - 26; f.put(); update(); }, check, reset };
    return {};
  }
  window.TpTape = { mount };
})();
