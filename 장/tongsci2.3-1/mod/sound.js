/* 디지털 탐구 «실시간 생활 데이터 측정하기»(교과서 136~137쪽)를 연습하는 가상 소리 측정기.
   교실 그림의 소리(문 세게 닫기·의자 끌기·복도에서 뛰기·큰 소리로 이야기)를 누르면 실제 소리 크기(회색 선)가 생기고,
   기기는 «측정 간격»마다 한 번씩 재어 점으로 기록한다(단위 없는 센서 값, 0~최댓값). 기준선을 끌어 소음 기준값을 정하면 넘을 때 경보등이 켜진다.
   측정 간격 5초면 짧은 큰 소리를 놓치고, 최댓값 100이면 큰 소리가 모두 100에 걸린다 → 교과서 설정(255, 1초)의 까닭. 값은 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const KIND = {
    door: { name: '문 세게 닫기', dur: 0.4, say: '문을 세게 닫았다 — 짧고 아주 큰 소리' },
    chair: { name: '의자 끌기', dur: 1.8, say: '의자를 바닥에 끌었다 — 크고 거슬리는 소리' },
    hall: { name: '복도에서 뛰기', dur: 4, say: '복도에서 뛰어다닌다 — 쿵쿵 이어지는 소리' },
    talk: { name: '큰 소리로 이야기', dur: 5, say: '여럿이 큰 소리로 이야기한다 — 길게 이어지는 소리' },
  };
  const WIN = 40, GX0 = 90, GX1 = 1000, GY0 = 446, GY1 = 650;
  let seed = 5; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  function scene(svg) {
    el('rect', { class: 'sd-bg', x: -400, y: -300, width: 1856, height: 1290 }, svg);
    const room = el('g', { class: 'sd-room' }, svg);
    el('rect', { class: 'sd-wall', x: 20, y: 20, width: 600, height: 380, rx: 10 }, room);
    el('rect', { class: 'sd-floor', x: 20, y: 300, width: 600, height: 100 }, room);
    el('rect', { class: 'sd-board', x: 230, y: 50, width: 230, height: 90, rx: 4 }, room);
    el('path', { class: 'sd-hwin', d: 'M480 50 h 120 v 90 h -120 z M 540 50 v 90' }, room);
    // 문
    const door = el('g', { class: 'sd-src sd-door', 'data-k': 'door', tabindex: '0', role: 'button', 'aria-label': KIND.door.name }, svg);
    el('rect', { class: 'sd-frame', x: 50, y: 110, width: 110, height: 190 }, door);
    const leaf = el('g', { class: 'sd-leaf' }, door); el('rect', { x: 54, y: 114, width: 102, height: 186 }, leaf); el('circle', { class: 'sd-knob', cx: 142, cy: 210, r: 6 }, leaf);
    // 복도(창 너머로 뛰는 학생)
    const hall = el('g', { class: 'sd-src sd-hall', 'data-k': 'hall', tabindex: '0', role: 'button', 'aria-label': KIND.hall.name }, svg);
    el('rect', { class: 'sd-hz', x: 476, y: 46, width: 128, height: 98, rx: 6 }, hall);
    const runner = el('g', { class: 'sd-runner', transform: 'translate(500 120)' }, hall); el('circle', { cy: -38, r: 9 }, runner); el('path', { d: 'M0 -28 v 18 M 0 -10 l -10 14 M 0 -10 l 10 14 M 0 -22 l -12 6 M 0 -22 l 12 -6' }, runner);
    // 책상과 의자
    const chair = el('g', { class: 'sd-src sd-chair', 'data-k': 'chair', tabindex: '0', role: 'button', 'aria-label': KIND.chair.name }, svg);
    el('rect', { class: 'sd-desk', x: 200, y: 250, width: 120, height: 16, rx: 3 }, chair); el('path', { class: 'sd-leg', d: 'M210 266 v 50 M 310 266 v 50' }, chair);
    const seat = el('g', { class: 'sd-seat' }, chair); el('rect', { x: 220, y: 290, width: 70, height: 12, rx: 3 }, seat); el('path', { class: 'sd-leg', d: 'M226 302 v 40 M 284 302 v 40 M 284 290 v -44' }, seat);
    // 이야기하는 학생들
    const talk = el('g', { class: 'sd-src sd-talk', 'data-k': 'talk', tabindex: '0', role: 'button', 'aria-label': KIND.talk.name }, svg);
    [[400, '#e2622b'], [450, '#3a78c2'], [500, '#3fae6a']].forEach(([x, c]) => { el('circle', { class: 'sd-head', cx: x, cy: 236, r: 15 }, talk); el('path', { class: 'sd-bodyp', d: `M${x - 20} 300 v -28 a 20 20 0 0 1 40 0 v 28 z`, fill: c }, talk); });
    const bubbles = el('g', { class: 'sd-bubbles' }, talk); [[390, 196], [450, 186], [510, 198]].forEach(([x, y]) => { el('ellipse', { cx: x, cy: y, rx: 22, ry: 13 }, bubbles); el('text', { x, y: y + 6 }, bubbles).textContent = '!!'; });
    // 이름표
    [['door', 105, 96], ['hall', 540, 166], ['chair', 260, 362], ['talk', 450, 330]].forEach(([k, x, y]) => { const g = el('g', { class: 'sd-tag', 'data-k': k, transform: `translate(${x} ${y})` }, svg.querySelector(`.sd-src[data-k="${k}"]`)); el('rect', { x: -64, y: -15, width: 128, height: 28, rx: 14 }, g); el('text', { y: 5 }, g).textContent = KIND[k].name; });
    // 기기
    const dev = el('g', { class: 'sd-dev' }, svg);
    el('rect', { class: 'sd-pcb', x: 676, y: 40, width: 330, height: 250, rx: 22 }, dev);
    el('text', { class: 'sd-devt', x: 841, y: 76 }, dev).textContent = '피지컬 컴퓨팅 기기';
    const leds = []; for (let r = 0; r < 5; r++) for (let c = 0; c < 5; c++) leds.push(el('rect', { class: 'sd-led', x: 781 + c * 24, y: 104 + r * 24, width: 16, height: 16, rx: 3 }, dev));
    el('circle', { class: 'sd-mic', cx: 952, cy: 112, r: 12 }, dev); el('text', { class: 'sd-small', x: 952, y: 146 }, dev).textContent = '소리 센서';
    const alarm = el('circle', { class: 'sd-alarm', cx: 730, cy: 112, r: 16 }, dev); el('text', { class: 'sd-small', x: 730, y: 146 }, dev).textContent = '경보등';
    el('path', { class: 'sd-usb', d: 'M841 290 V 330 H 900' }, dev); el('rect', { class: 'sd-tab', x: 900, y: 312, width: 104, height: 70, rx: 10 }, dev);
    const tabv = el('text', { class: 'sd-tabv', x: 952, y: 356 }, dev);
    // 그래프
    const gr = el('g', { class: 'sd-graph' }, svg);
    el('rect', { class: 'sd-gbox', x: 40, y: 410, width: 976, height: 270, rx: 14 }, gr);
    el('path', { class: 'sd-axis', d: `M${GX0} ${GY0 - 10} V ${GY1} H ${GX1}` }, gr);
    const ylab = [0, 1, 2].map((k) => el('text', { class: 'sd-yl', x: GX0 - 10, y: GY1 - k * (GY1 - GY0) / 2 + 5 }, gr));
    el('text', { class: 'sd-xl', x: (GX0 + GX1) / 2, y: 674 }, gr).textContent = '시간(최근 40초)';
    const truth = el('path', { class: 'sd-true' }, gr), meas = el('path', { class: 'sd-meas' }, gr), pts = el('g', { class: 'sd-pts' }, gr);
    const th = el('g', { class: 'sd-th', tabindex: '0', role: 'slider', 'aria-label': '소음 기준값(위아래로 끌기, 화살표 키)' }, gr);
    el('path', { class: 'sd-thl', d: `M${GX0} 0 H ${GX1}` }, th); el('circle', { class: 'sd-thh', cx: GX1, cy: 0, r: 13 }, th); const thT = el('text', { class: 'sd-tht', x: GX1 - 20, y: -10 }, th);
    el('text', { class: 'sd-leg1', x: 120, y: 434 }, gr).textContent = '— 실제 소리';
    el('text', { class: 'sd-leg2', x: 250, y: 434 }, gr).textContent = '● 기기가 잰 값';
    return { leds, alarm, tabv, ylab, truth, meas, pts, th, thT };
  }

  function mount(root) {
    const svg = root.querySelector('.sd-svg'), R = scene(svg);
    const nowEl = root.querySelector('.sd-now'), thEl = root.querySelector('.sd-thv'), cntEl = root.querySelector('.sd-cnt'), msg = root.querySelector('.sd-msg');
    const maxNum = root.querySelector('.sd-num[data-k="max"]'), intNum = root.querySelector('.sd-num[data-k="int"]');
    let MAX = 255, INT = 1, TH = 150, t = 0, nextS = 0, alarms = 0, alarmT = 0, events = [], tr = [], sm = [], lastTr = -1, checkMiss = null;
    const Y = (v) => GY1 - Math.min(v, MAX) / MAX * (GY1 - GY0), X = (tt) => GX0 + (tt - (t - WIN)) / WIN * (GX1 - GX0);
    const level = (tt) => {
      let v = 18 + 6 * Math.sin(tt * 1.7) + 4 * Math.sin(tt * 4.1);
      events.forEach((e) => {
        const u = tt - e.t0; if (u < 0 || u > e.dur) return;
        const env = Math.min(1, u / 0.15, (e.dur - u) / 0.3);
        if (e.k === 'door') v += 225 * Math.exp(-(((u - 0.12) / 0.09) ** 2));
        if (e.k === 'chair') v += env * (125 + 18 * Math.sin(u * 37));
        if (e.k === 'hall') v += env * (90 + 34 * Math.max(0, Math.sin(u * 9)));
        if (e.k === 'talk') v += env * (68 + 14 * Math.sin(u * 5.3) + 8 * Math.sin(u * 13));
      });
      return Math.max(0, v);
    };
    function axis() { R.ylab.forEach((e, k) => { e.textContent = String(Math.round(MAX * k / 2)); }); }
    function placeTh() { const y = Y(TH); R.th.setAttribute('transform', `translate(0 ${y.toFixed(1)})`); R.thT.textContent = `기준값 ${TH}`; thEl.textContent = String(TH); }
    function leds(v, al) {
      const lv = Math.round(Math.min(v, MAX) / MAX * 5);
      R.leds.forEach((l, i) => { const c = i % 5, r = Math.floor(i / 5); const x = al ? (c === r || c === 4 - r) : (4 - r) < lv; l.classList.toggle('on', !!x); l.classList.toggle('al', !!al && x); });
    }
    function draw() {
      const f = (arr) => arr.filter(([tt]) => tt >= t - WIN).map(([tt, v]) => `${X(tt).toFixed(1)} ${Y(v).toFixed(1)}`);
      const a = f(tr), b = f(sm);
      R.truth.setAttribute('d', a.length ? 'M' + a.join(' L ') : ''); R.meas.setAttribute('d', b.length ? 'M' + b.join(' L ') : '');
      R.pts.innerHTML = ''; sm.filter(([tt]) => tt >= t - WIN).forEach(([tt, v]) => el('circle', { cx: X(tt).toFixed(1), cy: Y(v).toFixed(1), r: 5, class: v > TH ? 'hi' : '' }, R.pts));
    }
    function step(dt) {
      t += dt;
      if (t - lastTr >= 0.05) { tr.push([t, level(t)]); lastTr = t; }
      if (t >= nextS) {
        nextS = t + INT; const v = Math.round(Math.min(MAX, level(t))); sm.push([t, v]);
        nowEl.textContent = String(v); R.tabv.textContent = String(v);
        if (v > TH) { alarms++; alarmT = 1; cntEl.textContent = String(alarms); msg.textContent = `기준값 ${TH}을 넘었다 — 경보등!`; }
        if (MAX === 100 && v >= 100) msg.textContent = '큰 소리가 모두 최댓값 100에 걸려 크기를 구별할 수 없다';
        leds(v, alarmT > 0);
      }
      alarmT = Math.max(0, alarmT - dt); R.alarm.classList.toggle('on', alarmT > 0);
      if (checkMiss && t > checkMiss.end) {
        const peak = tr.filter(([tt]) => tt >= checkMiss.t0 && tt <= checkMiss.end).reduce((m, [, v]) => Math.max(m, v), 0);
        const got = sm.filter(([tt]) => tt >= checkMiss.t0 && tt <= checkMiss.end).reduce((m, [, v]) => Math.max(m, v), 0);
        if (peak > TH && got <= TH) msg.textContent = `측정 간격이 길어 «${KIND[checkMiss.k].name}»의 큰 소리를 놓쳤다!`;
        checkMiss = null;
      }
      tr = tr.filter(([tt]) => tt >= t - WIN - 2); sm = sm.filter(([tt]) => tt >= t - WIN - 6);
      draw();
    }
    function fire(k) {
      events.push({ k, t0: t, dur: KIND[k].dur }); events = events.filter((e) => t - e.t0 < 8);
      msg.textContent = KIND[k].say; checkMiss = { k, t0: t, end: t + KIND[k].dur + 0.1 };
      const src = svg.querySelector(`.sd-src[data-k="${k}"]`); src.classList.remove('act'); src.getBoundingClientRect(); src.classList.add('act');
      setTimeout(() => src.classList.remove('act'), KIND[k].dur * 1000 + 200);
      if (!loop.on) { for (let i = 0; i < 20; i++) step(0.05); }
    }
    svg.querySelectorAll('.sd-src').forEach((s) => {
      s.addEventListener('click', () => fire(s.dataset.k));
      s.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); fire(s.dataset.k); } });
    });
    // 코딩 블록의 숫자 칸: 누르면 값이 바뀐다
    function setMax(v) { MAX = v; maxNum.textContent = String(v); TH = Math.min(TH, MAX - 5); axis(); placeTh(); msg.textContent = MAX === 100 ? '최댓값을 100으로 줄였다 — 큰 소리를 내 보자' : '최댓값 255(교과서 설정)'; bump(maxNum); }
    function setInt(v) { INT = v; intNum.textContent = String(v); nextS = t; msg.textContent = INT === 5 ? '5초에 한 번만 잰다 — 문을 세게 닫아 보자' : '1초에 한 번 잰다(교과서 설정)'; bump(intNum); }
    const bump = (e) => { if (window.gsap && !window.Deck.reduce) gsap.fromTo(e, { scale: 0.8 }, { scale: 1, duration: 0.3, ease: 'back.out(3)' }); };
    maxNum.addEventListener('click', () => setMax(MAX === 255 ? 100 : 255));
    intNum.addEventListener('click', () => setInt(INT === 1 ? 5 : 1));
    // 기준선 끌기
    const pt = (ev) => { const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
    let hold = false;
    R.th.addEventListener('pointerdown', (e) => { hold = true; try { R.th.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ } R.th.classList.add('drag'); e.stopPropagation(); });
    R.th.addEventListener('pointermove', (e) => { if (!hold) return; const y = pt(e).y; TH = Math.round(Math.max(5, Math.min(MAX - 5, (GY1 - y) / (GY1 - GY0) * MAX))); placeTh(); draw(); });
    const up = () => { hold = false; R.th.classList.remove('drag'); };
    R.th.addEventListener('pointerup', up); R.th.addEventListener('pointercancel', up);
    R.th.addEventListener('keydown', (e) => { const d = { ArrowUp: 5, ArrowDown: -5 }[e.key]; if (d) { e.preventDefault(); e.stopPropagation(); TH = Math.max(5, Math.min(MAX - 5, TH + d)); placeTh(); draw(); } });
    const loop = window.Stage.loop(step);
    axis(); placeTh(); for (let i = 0; i < 40; i++) step(0.25);
    root._sound = { fire, th: (v) => { TH = v; placeTh(); }, int: setInt, max: setMax, run: (s) => { for (let i = 0; i < s * 20; i++) step(0.05); } };
    return { setActive(on) { if (on && !window.Stage.reduce) loop.start(); else loop.stop(); } };
  }
  window.SoundMeter = { mount };
})();
