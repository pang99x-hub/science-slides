/* 2-2-3 1차시 「에너지 전환과 보존」: 장마다 조각을 붙인다.
   차례(2026-10-31 보완, 기존 장 모두 그대로 + 더함, 10장): 표지(사건 파일 1) → 이론(에너지 전환, 사진) → 체험(생활 기구) → 체험(자연)
   → 이론(에너지 보존 법칙, Manim) → 체험(휴대 전화 장부) → 체험(흩어진 열) → 미니 게임(빠른 퀴즈) → 정리(뒤집기 카드) → 확인(+ 사건 풀기).
   기존 체험 장에는 해 볼 일 ①②③과 알게 된 것(UDock)만 덧붙였다.
   예측(.share-opts)·빗방울 예측(.pred[data-row] .seg)·확인 ○×(.qs)는 수업방 응답 모으기가 그대로 읽는다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const J = (...p) => window.RxT.join(...p);
  // 한 묶음에서 하나만 누르게(다시 누르면 풀림)
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  const dock = (root, cfg) => window.UDock.mount(root, cfg);

  part('cover', (root) => window.SolarPlane.mount(root));
  part('conv', (root) => window.RxT.gallery(root));
  part('devices', (root) => J(window.DevicesLab.mount(root), dock(root, {
    steps: ['기구 켜기', '카드 놓기', '열화상 카메라 비추기'],
    on: ['.dv-pow', (r) => r.querySelector('.slot.on'), '.dv-cam'],
    learn: '기구는 쓰려는 에너지(빛·소리)와 함께 <b>열에너지</b>도 내놓는다. 카메라를 대야 보이는 몫이다.',
  })));
  part('nature', (root) => {
    const btns = [...root.querySelectorAll('.rain-pred .seg button')];
    btns.forEach((b) => b.setAttribute('aria-pressed', 'false'));
    single(btns);
    return J(window.NatureScenes.mount(root), dock(root, {
      steps: ['빗방울 떨어뜨리기', '합 예측하기', '장작 넣기'],
      on: ['#rain-drop, .rain-cv', '.rain-pred button', '#fire-add, .fire-stage'],
      learn: '빗방울은 <b>위치 → 운동 → 소리</b>, 모닥불은 <b>화학 → 빛·열</b>. 자연에서도 에너지는 모습을 바꾼다.',
    }));
  });
  part('law', (root) => {
    const defs = [...root.querySelectorAll('.lw-def')];
    root.addEventListener('st-step', (e) => defs.forEach((d, i) => d.classList.toggle('on', i === e.detail)));
    return window.RxT.stepper(root);
  });
  part('phone', (root) => J(window.PhoneLab.mount(root), dock(root, {
    steps: ['충전기 꽂기', '측정기 대기', '100 J 써 보기'],
    on: ['#ph-plug, .ph-chg', (r) => r.querySelector('.ph-bub.metered'), (r) => r.querySelector('.ph-ledger.done')],   // ②③은 실제로 대고 넷 다 재야 끝(먼저 눌러도 ✓가 붙지 않게)
    learn: '넷을 모두 재면 합이 공급한 <b>100 J</b>과 같다 — 에너지 보존 법칙. 열은 0이 되지 않는다.',
  })));
  part('spread', (root) => J(window.HeatSpread.mount(root), dock(root, {
    steps: ['시간 보내기', '끌어서 열 모으기', '다시 데우기'],
    on: ['#sp-wait', '.sp-cv', '#sp-reset'],
    learn: '열 알갱이의 <b>총수는 그대로</b>지만 흩어지면 모아 쓰기 어렵다 → 그래서 에너지를 아껴야 한다.',
  })));

  part('game1', (root) => window.EnGame.mount(root, {
    id: 'conv', title: '40초 에너지 전환 맞히기', seconds: 40,
    intro: '기구가 «쓰려고» 만드는 에너지를 고르자<br>«게임 시작»을 누르자',
    endSay: '틀린 카드는 «이 기구를 왜 켜지?»부터 다시 물어보자',
    items: [
      { q: '선풍기', a: 'kin', why: '날개를 돌린다 → 전기가 운동 에너지로.' },
      { q: '전기난로', a: 'heat', why: '방을 데운다 → 전기가 열에너지로.' },
      { q: '손전등', a: 'light', why: '어둠을 밝힌다 → 전지의 에너지가 빛으로.' },
      { q: '라디오', a: 'sound', why: '방송을 들려준다 → 전기가 소리 에너지로.' },
      { q: '믹서', a: 'kin', why: '칼날을 빠르게 돌린다 → 운동 에너지.' },
      { q: '다리미', a: 'heat', why: '옷을 데워 편다 → 열에너지.' },
      { q: '가로등', a: 'light', why: '밤길을 밝힌다 → 빛에너지.' },
      { q: '초인종', a: 'sound', why: '«딩동» 소리로 알린다 → 소리 에너지.' },
      { q: '인덕션', a: 'heat', why: '냄비를 데운다 → 전기가 열에너지로.' },
      { q: '전기 자동차', a: 'kin', why: '바퀴를 굴린다 → 전기가 운동 에너지로.' },
      { q: '텔레비전 화면', a: 'light', why: '화면이 빛난다 → 빛에너지.' },
      { q: '이어폰', a: 'sound', why: '귀에 소리를 들려준다 → 소리 에너지.' },
      { q: '전기밥솥', a: 'heat', why: '쌀을 익힌다 → 열에너지.' },
      { q: '휴대 전화 진동', a: 'kin', why: '몸체가 떨린다 → 운동 에너지.' },
      { q: '전광판', a: 'light', why: '글자를 빛으로 보여 준다 → 빛에너지.' },
      { q: '스피커', a: 'sound', why: '콘이 떨려 음악을 낸다 → 소리 에너지(열도 조금).' },
    ],
  }));

  part('sum1', (root) => window.RxT.sum(root));
  part('check1', (root) => { window.LessonParts.mountWrap(root); });
})();
