/* 2-2-3 2차시 「에너지 효율」: 장마다 조각을 붙인다.
   차례(2026-10-31 보완, 기존 장 모두 그대로 + 더함, 11장): 표지(사건 파일 2) → 이론(에너지 효율, Manim) → 체험(전구) → 체험(효율 구하기)
   → 체험 심화(열기관) → 이론(효율을 높이는 방법, 사진) → 체험(자동차) → 체험(버려지는 열) → 미니 게임 → 정리(뒤집기 카드) → 확인(+ 사건 풀기).
   예측(.share-opts)·확인 ○×(.qs)는 수업방 응답 모으기가 그대로 읽는다. 7장(#reuse)의 data-word는 수업방 «한 낱말 묻기»에 미리 들어간다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const NS = 'http://www.w3.org/2000/svg';
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  const J = (...p) => window.RxT.join(...p);
  const dock = (root, cfg) => window.UDock.mount(root, cfg);
  const stopKeys = (i) => i.addEventListener('keydown', (e) => e.stopPropagation());   // ←→로 장이 넘어가지 않게

  // 1. 표지: 켜 둔 시간을 늘리면 열화상 속 세 기구가 달아오른다
  part('cover', (root) => {
    const input = root.querySelector('#hu-time'), lab = root.querySelector('.hu-min');
    const blobs = [...root.querySelectorAll('.hu-b')];
    const draw = () => {
      const t = Number(input.value), f = Math.min(1, t / 40);
      lab.textContent = `${t}분`;
      blobs.forEach((b) => { b.style.opacity = String(t ? Number(b.dataset.o) * (0.12 + 0.88 * f) : 0); b.style.transform = `scale(${0.5 + 0.5 * f})`; });
    };
    input.addEventListener('input', draw); stopKeys(input);
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector('#pr-waste').classList.toggle('answer', on);
    draw();
    return {
      fragment(f, on) { if (f.dataset.anim === 'hu') answer(on); },
      sync(slide) { const f = slide.querySelector('[data-anim="hu"]'); answer(!!f && f.classList.contains('visible')); },
    };
  });

  part('effdef', (root) => {
    const defs = [...root.querySelectorAll('.ed-def')];
    root.addEventListener('st-step', (e) => defs.forEach((d, i) => d.classList.toggle('on', i === e.detail)));
    return window.RxT.stepper(root);
  });

  part('bulbs', (root) => {
    const seen = new Set();
    root.querySelectorAll('.bl-pick').forEach((g) => ['click', 'keydown', 'pointerdown'].forEach((t) => g.addEventListener(t, () => seen.add(g.dataset.b), true)));
    return J(window.BulbSwap.mount(root), dock(root, {
    steps: ['전구 예측하기', '전구 갈아 끼우기', '세 전구 모두 켜기'],
    on: ['.bl-share button', '.bl-pick', () => seen.size >= 3],
    learn: '같은 밝기라도 <b>발광 다이오드</b>는 공급 막대가 가장 짧고 열이 적다 → 효율이 가장 높다.',
  }));
  });

  // 3. 효율 작업대: 공급 막대를 칼로 잘라 유용·버려짐을 나눈다(10 J 단위). 막대 끝을 끌면 공급량이 바뀐다.
  //    문제 단추 셋(추가 정리 문제 2, 효율 25 %, 효율 100 %). 칼은 공급보다 10 J 앞까지만 간다(버려지는 열이 늘 남는다)
  part('eff', (root) => {
    const svg = root.querySelector('.ef-svg3'), q = (s) => svg.querySelector(s);
    const pv = root.querySelector('.ef-pv'), msg = root.querySelector('.ef-msg'), gOn = root.querySelector('.ef-g-on'), gN = root.querySelector('.ef-g-n'), gauge = root.querySelector('.ef-gauge');
    const X0 = 60, K = 0.84, X = (j) => X0 + j * K, GL = Math.PI * 120;
    const tasks = [...root.querySelectorAll('.ef-tasks button')];
    let S = 500, U = 150, task = 0, done = new Set(), pushEnd = 0;
    const ticks = q('.eb-ticks');
    for (let j = 0; j <= 1000; j += 100) { const l = document.createElementNS(NS, 'path'); l.setAttribute('d', `M${X(j)} 368 v ${j % 500 ? 12 : 22}`); ticks.appendChild(l); const t = document.createElementNS(NS, 'text'); t.setAttribute('x', X(j)); t.setAttribute('y', 410); t.textContent = j; ticks.appendChild(t); }
    const hw = q('.eb-hw');
    function draw() {
      const Wst = S - U, e = U / S;
      q('.eb-use').setAttribute('width', Math.max(0, X(U) - X0)); q('.eb-waste').setAttribute('x', X(U)); q('.eb-waste').setAttribute('width', Math.max(0, X(S) - X(U)));
      q('.eb-knife').setAttribute('transform', `translate(${X(U).toFixed(1)} 0)`); q('.eb-end').setAttribute('transform', `translate(${X(S).toFixed(1)} 0)`);
      const lu = q('.eb-lu'), lu2 = q('.eb-lu2'), lw = q('.eb-lw'), lw2 = q('.eb-lw2'), wide = (a, b) => X(b) - X(a) > 120;
      lu.setAttribute('x', ((X0 + X(U)) / 2).toFixed(1)); lu2.setAttribute('x', ((X0 + X(U)) / 2).toFixed(1)); lu.textContent = wide(0, U) ? '유용' : ''; lu2.textContent = wide(0, U) ? `${U} J` : '';
      lw.setAttribute('x', ((X(U) + X(S)) / 2).toFixed(1)); lw2.setAttribute('x', ((X(U) + X(S)) / 2).toFixed(1)); lw.textContent = wide(U, S) ? '버려짐(열)' : ''; lw2.textContent = wide(U, S) ? `${Wst} J` : '';
      hw.innerHTML = ''; for (let x = X(U) + 30; x < X(S) - 10; x += 60) { const p = document.createElementNS(NS, 'path'); p.setAttribute('d', `M${x} 258 c -8 -10 8 -16 0 -26 s 8 -16 0 -26`); hw.appendChild(p); }
      q('.eb-sup').textContent = `공급한 에너지 ${S} J = 유용 ${U} J + 버려짐 ${Wst} J`;
      q('.em-glow').style.opacity = String(Math.min(1, U / 500)); q('.em-heat').style.opacity = String(Math.min(1, Wst / 400));
      q('.em-in').style.strokeWidth = String(6 + S * 0.05); q('.em-out').style.strokeWidth = String(Math.max(3, U * 0.05));
      q('.ef-rotor2').style.animationDuration = `${Math.max(0.3, 2.2 - U / 400)}s`;
      pv.textContent = String(Math.round(e * 1000) / 10);
      gOn.style.strokeDasharray = `${(GL * e).toFixed(1)} ${GL.toFixed(1)}`;
      gN.setAttribute('transform', `rotate(${(-90 + 180 * e).toFixed(1)} 150 150)`);
      // 문제 확인
      const ok = (t, txt) => { if (!done.has(t)) { done.add(t); tasks[t - 1].classList.add('done'); } msg.textContent = txt; };
      if (task === 1 && S === 500 && Math.abs(U - 150) <= 5) ok(1, '✓ 맞았다: 150 ÷ 500 × 100 = 30 %');
      else if (task === 2 && S === 800 && Math.abs(U - 200) <= 5) ok(2, '✓ 맞았다: 200 ÷ 800 × 100 = 25 %');
    }
    const pt = (ev) => { const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
    function grab(el, move) {
      let on = false;
      el.addEventListener('pointerdown', (ev) => { on = true; try { el.setPointerCapture(ev.pointerId); } catch { /* 합성 이벤트 */ } el.classList.add('drag'); ev.stopPropagation(); });
      el.addEventListener('pointermove', (ev) => { if (on) { move((pt(ev).x - X0) / K); draw(); } });
      const up = () => { on = false; el.classList.remove('drag'); };
      el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    }
    const setU = (j) => {
      const lim = S - 10, want = Math.round(j / 10) * 10;
      if (want > lim) { pushEnd++; if (pushEnd > 2) { msg.textContent = '끝까지는 자를 수 없다 — 버려지는 열이 늘 남는다'; gauge.classList.remove('bad'); gauge.getBoundingClientRect(); gauge.classList.add('bad'); if (task === 3) { done.add(3); tasks[2].classList.add('done'); } } }
      else pushEnd = 0;
      U = Math.max(0, Math.min(lim, want));
    };
    const setS = (j) => { S = Math.max(100, Math.min(1000, Math.round(j / 50) * 50)); U = Math.min(U, S - 10); };
    grab(q('.eb-knife'), setU); grab(q('.eb-end'), setS);
    const keys = (el, f, step) => el.addEventListener('keydown', (ev) => { const d = { ArrowLeft: -step, ArrowRight: step }[ev.key]; if (d) { ev.preventDefault(); ev.stopPropagation(); f(d); draw(); } });
    keys(q('.eb-knife'), (d) => setU(U + d), 10); keys(q('.eb-end'), (d) => setS(S + d), 50);
    const TASK = { 1: [500, 300, '① 발전기에 500 J을 넣어 전기 150 J을 얻었다 — 칼로 150 J에서 잘라 보자'], 2: [800, 400, '② 800 J을 넣고 효율이 25 %가 되게 잘라 보자'], 3: [600, 300, '③ 칼을 오른쪽 끝까지 밀어 효율 100 %를 만들어 보자'] };
    tasks.forEach((b) => b.addEventListener('click', () => { task = Number(b.dataset.t); const [s0, u0, t] = TASK[task]; S = s0; U = u0; pushEnd = 0; tasks.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); draw(); msg.textContent = t; }));
    draw(); msg.textContent = '칼(✂)을 끌어 막대를 잘라 보자. 막대 끝을 끌면 공급량이 바뀐다';
    return dock(root, {
      steps: ['칼(✂)로 자르기', '문제 ① 풀기', '100 %에 도전'],
      on: ['.eb-knife, .eb-end', '#ef-t1', '#ef-t3'],
      learn: '효율 = 유용 ÷ 공급 × 100. 칼은 끝까지 가지 않는다 — 버려지는 열이 늘 남아 <b>100 %가 될 수 없다</b>.',
    });
  });

  part('heng', (root) => J(window.HeatEngine.mount(root), dock(root, {
    steps: ['석탄 삽 수 바꾸기', '밸브 돌리기', '문제 답 열기'],
    on: ['#he-less, .he-coal, .he-shovel', '.he-valve', (r) => r.querySelector('.he-prob .fragment.visible')],
    learn: '열기관도 에너지 보존(<b>Q₁ = W + Q₂</b>). 내보내는 열 Q₂가 있어 열효율 e는 1보다 작다.',
  })));
  part('tech', (root) => {
    const rows = [...root.querySelectorAll('.tc-def')];
    root.querySelector('.gv').addEventListener('gv-pick', (e) => rows.forEach((x) => x.classList.toggle('on', x.dataset.k === e.detail.b.dataset.row)));
    return window.RxT.gallery(root);
  });
  part('cars', (root) => J(window.CarEfficiency.mount(root), dock(root, {
    steps: ['차 예측하기', '진단기 대기', '회생 제동 끄고 켜기'],
    on: ['#cp-gas, #cp-ev, #cp-same', '.cr-probe, .cr-pt, [data-p]', '#ev-regen'],
    learn: '가솔린 자동차는 <b>25 %</b>, 전기 자동차는 <b>87 %</b>. 모터는 열 손실이 적고 회생 제동으로 에너지를 되찾는다.',
  })));

  part('reuse', (root) => J(window.HeatReuse.mount(root), dock(root, {
    steps: ['열 나오는 곳 고르기', '쓸 곳에 잇기', '네 곳 모두 잇기'],
    on: ['.ru-src', (r) => r.querySelector('.ru-pipe'), (r) => r.querySelectorAll('.ru-pipe').length >= 4],
    learn: '버려지던 열도 <b>온수·난방</b>에 이어 쓰면 전체 에너지 효율이 높아진다.',
  })));

  part('game2', (root) => window.EnGame.mount(root, {
    id: 'eff', title: '40초 효율 올리기 내리기', seconds: 40,
    intro: '이 선택은 에너지 효율을 높일까, 낮출까?<br>«게임 시작»을 누르자',
    endSay: '틀린 카드는 «버려지는 열이 줄었나?»로 다시 따져 보자',
    items: [
      { q: '백열등을 발광 다이오드 전구로 바꾼다', a: 'up', why: '같은 밝기를 더 적은 전기로 낸다.' },
      { q: '냉장고를 1등급 대신 5등급으로 산다', a: 'down', why: '등급 숫자가 작을수록 효율이 높다.' },
      { q: '발전소에서 남는 열을 동네 난방에 쓴다', a: 'up', why: '열병합 발전 — 버리던 열을 다시 쓴다.' },
      { q: '전기 자동차가 감속할 때 전기를 되찾는다', a: 'up', why: '회생 제동 — 운동 에너지를 전지에 모은다.' },
      { q: '자동차 브레이크 열을 그냥 공기로 버린다', a: 'down', why: '운동 에너지가 모두 쓸모없는 열이 된다.' },
      { q: '창을 세 겹 유리로 바꾼다', a: 'up', why: '새는 열이 줄어 난방 에너지를 덜 쓴다.' },
      { q: '깨진 창문을 그대로 두고 난방한다', a: 'down', why: '데운 열이 밖으로 새어 나간다.' },
      { q: '에너지 절약 표시가 있는 제품을 고른다', a: 'up', why: '대기 전력까지 줄인 제품이다.' },
      { q: '노트북 열로 손을 데우는 것뿐', a: 'down', why: '쓰려던 일이 아닌 열 — 이미 버려진 몫이다.' },
      { q: '가솔린 자동차 대신 전기 자동차를 탄다', a: 'up', why: '교과서 값: 25 % → 87 %.' },
      { q: '세탁기의 효율 등급을 낮은 등급으로 고른다', a: 'down', why: '등급 숫자가 클수록 전기를 더 쓴다.' },
      { q: '공장 폐열로 온실을 데운다', a: 'up', why: '버려질 열을 다시 쓴다.' },
      { q: '형광등을 백열등으로 되돌린다', a: 'down', why: '백열등은 대부분을 열로 버린다.' },
      { q: '벽에 단열재를 채운다', a: 'up', why: '열이 덜 새어 냉난방을 덜 한다.' },
    ],
  }));
  part('sum2', (root) => window.RxT.sum(root));
  part('check2', (root) => { window.LessonParts.mountWrap(root); });
})();
