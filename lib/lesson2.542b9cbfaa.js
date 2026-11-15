/* 2-2-2 2차시 「전자기 유도」: 장마다 모듈을 붙인다.
   시뮬레이션 장(다섯 경우·방향·세기·에너지)은 모두 실험실 엔진(lab.js)을 옵션만 바꿔 쓴다. */
(function () {
  'use strict';
  const { part, D } = window.Deck;
  const Lab = window.InductionLab;
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const stampIn = (el, text) => {
    el.textContent = text;
    if (window.gsap) gsap.fromTo(el, { autoAlpha: 0, scale: 1.6 }, { autoAlpha: 1, scale: 1, duration: D(0.35), ease: 'back.out(2)' });
  };
  const press = (btns, on) => btns.forEach((b) => b.setAttribute('aria-pressed', String(b === on)));
  const activate = (el, fn) => {
    el.addEventListener('click', fn);
    el.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); fn(); } });
  };

  // ---------- 2. 다섯 경우 (교과서 그림 Ⅱ-19) ----------
  part('cases', (root) => {
    let rec = null, playing = 0;
    const FULL_C = 1.2;          // 코일 입구까지 넣었다 빼는 정도의 움직임에서 바늘이 넉넉히 움직이게
    const lab = Lab.mount(root, {
      full: FULL_C,
      onFrame(st) {
        if (!rec) return;
        rec.peak = Math.max(rec.peak, Math.abs(st.Ie) / FULL_C);
        if (Math.abs(st.dAbs) > Math.abs(rec.dAbs)) rec.dAbs = st.dAbs;
      },
    });
    const rows = [...root.querySelectorAll('tr[data-case]')];
    // 자석 아랫면(magY)과 코일 윗면(coilY, 430)의 화면 높이.
    // 코일 위에서만 오가면 코일을 통과하는 자기장의 변화가 너무 작아(최대 전류가 엔진 기준의 5%) 자석 끝이 코일 속으로 90쯤 들어가게 한다
    const CASES = [
      { set: { mode: 'magnet', magY: 360, coilY: 430 }, hold: 1.2 },       // (가) 모두 정지
      { set: { mode: 'magnet', magY: 250, coilY: 430 }, to: { magY: 520 } }, // (나) N극을 가까이
      { set: { mode: 'magnet', magY: 520, coilY: 430 }, to: { magY: 250 } }, // (다) N극을 멀리
      { set: { mode: 'coil', magY: 400, coilY: 500 }, to: { coilY: 300 } },  // (라) 코일을 가까이
      { set: { mode: 'coil', magY: 400, coilY: 300 }, to: { coilY: 500 } },  // (마) 코일을 멀리
    ];
    async function play(k) {
      const my = ++playing, c = CASES[k];
      rows.forEach((r, i) => r.classList.toggle('on', i === k));
      lab.set(Object.assign({ polarity: 1 }, c.set));
      await sleep(250);
      rec = { peak: 0, dAbs: 0 };
      if (c.to) await lab.tween(c.to, 0.9); else await sleep(c.hold * 1000);
      await sleep(300);
      if (my !== playing) return;
      const r = rec; rec = null;
      const row = rows[k];
      stampIn(row.querySelector('.c-f'), Math.abs(r.dAbs) < 0.05 ? '일정' : r.dAbs > 0 ? '증가' : '감소');
      stampIn(row.querySelector('.c-b'), r.peak > 0.06 ? '켜짐' : '꺼짐');
      row.classList.add('done');
    }
    rows.forEach((r) => activate(r, () => play(Number(r.dataset.case))));
    return {
      setActive: lab.setActive, fit: lab.fit,
      fragment(f, on) { if (f.dataset.anim === 'case' && on) play(Number(f.dataset.case)); },
    };
  });

  // ---------- 4. 유도 전류의 방향 ----------
  part('direction', (root) => {
    let rec = null, playing = 0, cur = 0, pred = null;
    const lab = Lab.mount(root, {
      induced: true, full: 1.2,
      onFrame(st) { if (rec && Math.abs(st.Ie) > Math.abs(rec.I)) { rec.I = st.Ie; rec.dAbs = st.dAbs; } },
    });
    const caseBtns = [...root.querySelectorAll('.dir-cases button')];
    const predBtns = [...root.querySelectorAll('.dir-pred .seg button')];
    const verdict = root.querySelector('.dir-verdict');
    const table = root.querySelector('.dirt');
    const CASES = [{ pol: 1, from: 250, to: 520 }, { pol: 1, from: 520, to: 250 }, { pol: -1, from: 250, to: 520 }, { pol: -1, from: 520, to: 250 }];
    const place = (c) => lab.set({ polarity: c.pol, magY: c.from, coilY: 430, mode: 'magnet' });
    function choose(k) {
      cur = k; pred = null;
      press(caseBtns, caseBtns[k]); press(predBtns, null);
      verdict.textContent = '';
      place(CASES[k]);
    }
    function fill(k, r, text) {
      const td = table.querySelector(`tr[data-r="${r}"]`).children[k + 1];
      stampIn(td, text); td.classList.add('done');
    }
    caseBtns.forEach((b, i) => b.addEventListener('click', () => choose(i)));
    predBtns.forEach((b) => b.addEventListener('click', () => {
      pred = pred === b.dataset.v ? null : b.dataset.v;
      press(predBtns, predBtns.find((x) => x.dataset.v === pred) || null);
    }));
    root.querySelector('#dir-play').addEventListener('click', async () => {
      const my = ++playing, k = cur, c = CASES[k];
      place(c);
      await sleep(200);
      rec = { I: 0, dAbs: 0 };
      await lab.tween({ magY: c.to }, 1.1);
      await sleep(200);
      if (my !== playing) return;
      const r = rec; rec = null;
      // N극이 아래면 코일을 지나는 자석의 자기장은 아래쪽(↓), S극이 아래면 위쪽(↑)
      const down = c.pol === 1, inc = r.dAbs > 0, up = r.I > 0;
      fill(k, 'f', `${down ? '↓' : '↑'} ${inc ? '증가' : '감소'}`);
      fill(k, 'i', `${up ? '↑' : '↓'} 위쪽 ${up ? 'N' : 'S'}극`);
      fill(k, 'c', up ? 'B→Ⓖ→A' : 'A→Ⓖ→B');
      const dir = up ? 'BA' : 'AB';
      verdict.textContent = !pred ? '' : pred === dir ? '예측 맞음!' : '예측과 달라요. 표를 보며 까닭을 찾아봐요.';
    });
    choose(0);
    return { setActive: lab.setActive, fit: lab.fit };
  });

  // ---------- 5. 유도 전류의 세기 (변인 통제) ----------
  part('strength', (root) => {
    const FULL_S = 20, FROM = 250, TO = 610;     // 빠르게·30회·2개면 «보통·10회·1개»의 13배쯤
    const DUR = { 1: 2.0, 2: 1.0, 3: 0.45 };
    const NAME = { speed: { 1: '느리게', 2: '보통', 3: '빠르게' }, turns: { 10: '10회', 20: '20회', 30: '30회' }, mag: { 1: '자석 1개', 2: '자석 2개' } };
    // 막대 숫자: «보통·10회·1개»의 최댓값을 1로
    const BASE = Lab.simulatePeak({ from: FROM, to: TO, duration: DUR[2] });
    let rec = null, running = false, last = null;
    const trials = [];
    const lab = Lab.mount(root, { full: FULL_S, onFrame(st) { if (rec) rec.peak = Math.max(rec.peak, Math.abs(st.Ie)); } });
    const cond = { speed: 2, turns: 10, mag: 1 };
    const bars = root.querySelector('.bars'), warn = root.querySelector('.st-warn');
    root.querySelectorAll('.seg').forEach((seg) => {
      const btns = [...seg.querySelectorAll('button[data-k]')];
      btns.forEach((b) => b.addEventListener('click', () => {
        cond[b.dataset.k] = Number(b.dataset.v); press(btns, b);
        if (b.dataset.k !== 'speed') lab.set({ [b.dataset.k]: cond[b.dataset.k] });
      }));
    });
    function render() {
      const top = Math.max(3, ...trials.map((t) => t.v));
      bars.innerHTML = trials.map((t) => `<div class="b"><span class="v">${t.v.toFixed(1)}</span><i style="height:${Math.max(2, t.v / top * 150)}px"></i><span class="l">${NAME.speed[t.speed]}<br>${NAME.turns[t.turns]}<br>${NAME.mag[t.mag]}</span></div>`).join('');
    }
    root.querySelector('#st-run').addEventListener('click', async () => {
      if (running) return;
      running = true;
      const changed = last ? ['speed', 'turns', 'mag'].filter((k) => last[k] !== cond[k]) : [];
      warn.textContent = changed.length > 1 ? '두 가지 이상을 한꺼번에 바꿨어요. 하나만 바꿔야 무엇 때문인지 알 수 있어요.' : '';
      lab.set({ polarity: 1, magY: FROM, coilY: 430, mode: 'magnet', turns: cond.turns, mag: cond.mag });
      await sleep(300);
      rec = { peak: 0 };
      await lab.tween({ magY: TO }, DUR[cond.speed]);
      await sleep(300);
      const peak = rec.peak; rec = null;
      trials.push(Object.assign({ v: peak / BASE }, cond));
      if (trials.length > 6) trials.shift();
      render();
      last = Object.assign({}, cond);
      await lab.tween({ magY: FROM }, 1.2);
      running = false;
    });
    root.querySelector('#st-clear').addEventListener('click', () => { trials.length = 0; last = null; warn.textContent = ''; render(); });
    render();
    return { setActive: lab.setActive, fit: lab.fit };
  });

  // ---------- 6. 에너지 전환과 공짜 전기는 없다 ----------
  part('energy', (root) => Lab.mount(root, { force: true, switchable: true }));

  // ---------- 7. 생활 속 전자기 유도 ----------
  part('uses', (root) => {
    const cards = [...root.querySelectorAll('.card')];
    cards.forEach((c) => c.addEventListener('click', () => c.classList.toggle('flipped')));
    root.querySelector('#uses-all').addEventListener('click', () => {
      const any = cards.some((c) => !c.classList.contains('flipped'));
      cards.forEach((c) => c.classList.toggle('flipped', any));
    });
  });

  // ---------- 8. 확인 문제 ----------
  part('check2', (root) => {
    window.LessonParts.mountWrap(root);
    const chips = [...root.querySelectorAll('.chips button')];
    const out = root.querySelector('.f-result');
    chips.forEach((b) => b.addEventListener('click', () => {
      b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true'));
      chips.forEach((x) => x.classList.remove('right', 'wrong'));
      out.textContent = '';
    }));
    root.querySelector('#f-check').addEventListener('click', () => {
      let ok = true;
      chips.forEach((b) => {
        const picked = b.getAttribute('aria-pressed') === 'true', right = b.dataset.right === 'true';
        b.classList.toggle('right', right);
        b.classList.toggle('wrong', picked && !right);
        if (picked !== right) ok = false;
      });
      out.textContent = ok ? '정답! ㄱ, ㄴ, ㄷ. ㄹ 감은 방향은 유도 전류의 방향만 바꿔요.'
        : '초록 테두리가 정답이에요(ㄱ, ㄴ, ㄷ). ㄹ 감은 방향은 세기가 아니라 방향만 바꿔요.';
    });
  });
})();

/* 2026-10-31 보완(승인 틀): 표지 사건 예측 · 이론(Manim 단계 영상) · 기존 조작 장의 해 볼 일 ①②③ · 미니 게임 · 뒤집기 카드. 기존 장 모듈은 그대로 둔다. */
(function () {
  'use strict';
  const { part } = window.Deck, Gx = window.Gx;
  const filled = (els) => [...els].filter((e) => e.textContent.trim() && e.textContent.trim() !== '?').length;
  part('cover', (root) => { Gx.single([...root.querySelectorAll('.cv-case .share-opts button')]); return {}; });
  part('cases', (root) => Gx.track(root, [
    (r) => filled(r.querySelectorAll('.c-f')) >= 1,
    (r) => filled(r.querySelectorAll('.c-f')) >= 3,
    (r) => filled(r.querySelectorAll('.c-f')) >= 5,
  ]));
  part('dirth', (root) => {
    const defs = [...root.querySelectorAll('.rl-def')];
    root.addEventListener('st-step', (e) => defs.forEach((d, i) => d.classList.toggle('on', i === (e.detail === 0 ? 0 : e.detail === 3 ? 0 : 1))));
    return window.RxT.stepper(root);
  });
  part('rhand', (root) => {
    const defs = [...root.querySelectorAll('.rl-def')];
    root.addEventListener('st-step', (e) => defs.forEach((d, i) => d.classList.toggle('on', e.detail === 3 || i === e.detail)));
    return window.RxT.stepper(root);
  });
  part('direction', (root) => Gx.track(root, [
    (r) => !!r.querySelector('.dir-pred .seg button[aria-pressed="true"]') || filled(r.querySelectorAll('.dirt td')) > 0,
    (r) => filled(r.querySelectorAll('.dirt td')) >= 3,
    (r) => filled(r.querySelectorAll('.dirt td')) >= 12,
  ]));
  part('strength', (root) => Gx.track(root, [1, 2, 4].map((n) => (r) => r.querySelectorAll('.bars .b').length >= n)));
  part('energy', (root) => {
    const sw = root.querySelector('#en-switch'), hand = root.querySelector('.ebar[data-e="hand"] i');
    let cut = false, cutMoved = false, again = false;
    sw.addEventListener('click', () => { if (sw.getAttribute('aria-pressed') === 'true') cut = true; });
    root.querySelector('#en-reset').addEventListener('click', () => { if (cut && sw.getAttribute('aria-pressed') !== 'true') again = true; });
    root.querySelector('canvas').addEventListener('pointerdown', () => { if (sw.getAttribute('aria-pressed') === 'true') cutMoved = true; });
    root.querySelector('#en-demo').addEventListener('click', () => { if (sw.getAttribute('aria-pressed') === 'true') cutMoved = true; });
    return Gx.track(root, [
      () => parseFloat(hand.style.width || '0') > 0,
      () => cut && cutMoved,
      () => again,
    ]);
  });
  part('game2', (root) => window.EcoGame.mount(root, {
    id: 'uses', title: '40초 전자기 유도 찾기', seconds: 40,
    intro: '이 물건은 전자기 유도를 쓸까?<br>«게임 시작»을 누르자',
    endSay: '틀린 카드는 «속에 코일이 있고, 자기장이 바뀌나?»로 다시 따져 보자',
    items: [
      { q: '발전소의 발전기', a: 'yes', why: '터빈이 자석을 돌려 코일을 지나는 자기장이 바뀐다.' },
      { q: '휴대폰 무선 충전기', a: 'yes', why: '패드 코일의 바뀌는 자기장이 휴대폰 코일에 전류를 만든다.' },
      { q: '인덕션 레인지', a: 'yes', why: '바뀌는 자기장이 냄비 바닥에 전류를 흐르게 해 열이 난다.' },
      { q: '버스 교통 카드', a: 'yes', why: '단말기의 바뀌는 자기장이 카드 속 코일에 전류를 만든다.' },
      { q: '전기 기타의 소리 장치', a: 'yes', why: '줄이 떨리면 코일을 지나는 자기장이 바뀐다.' },
      { q: '변압기', a: 'yes', why: '한쪽 코일의 바뀌는 자기장이 다른 코일에 전류를 만든다.' },
      { q: '공항의 금속 탐지기', a: 'yes', why: '바뀌는 자기장으로 금속 속 전류를 알아챈다.' },
      { q: '손으로 돌리는 손전등', a: 'yes', why: '손잡이가 속의 자석을 돌린다.' },
      { q: '건전지로 켜는 리모컨', a: 'no', why: '건전지에 저장된 에너지를 그대로 쓴다.' },
      { q: '태양 전지 계산기', a: 'no', why: '빛이 바로 전기가 된다 — 코일·자석이 없다.' },
      { q: '전기 주전자의 열선', a: 'no', why: '전류가 흐르는 열선이 뜨거워질 뿐이다.' },
      { q: '천장의 전등', a: 'no', why: '들어온 전기를 빛으로 바꿀 뿐이다.' },
      { q: '흔들어 쓰는 손난로', a: 'no', why: '철가루가 산화하며 열이 난다(화학 반응).' },
      { q: '자전거 바퀴에 단 발전기', a: 'yes', why: '바퀴가 돌리는 자석 곁의 코일에 전류가 생긴다.' },
    ],
  }));
  part('sum2', (root) => window.RxT.sum(root));
})();
