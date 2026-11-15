/* 3-2 2차시 「과학 관련 사회적 쟁점과 과학 윤리」(교과서 150~161쪽): 장마다 조각을 붙인다.
   차례(2026-10-31 승인 틀로 보강, 10장 — 기존 6장은 그대로 두고 넷을 더함):
   표지(사건 파일 2) → 체험(답이 하나가 아닌 과학 문제 + SSI 정의 상자) → 이론(근거를 들고 여러 관점으로, 사진) → 체험(인공지능 그림 저작권)
   → 이론(과학 윤리, 사진) → 체험(거짓 혈액 진단) → 체험(연구 윤리 다섯 가지 + 정의 상자) → 미니 게임(쟁점 분야 가르기, 빠른 퀴즈)
   → 정리(뒤집기 카드) → 확인(+ 사건 파일 2 풀기).
   예측·쟁점 고르기·저작권 고르기(.share-opts)는 각자 고른 의견을 수업방이 모은다(모둠 활동은 따로 모둠 활동 차시). 확인 ○×(.qs)도 그대로.
   #fraud의 data-word는 «한 낱말 묻기»에 미리 들어간다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  const { track, join, txt, pressed } = window.EthTrack;

  // 1. 표지: 개인 정보 동의 + 예측(한 번 넘기면 답 표시, 사건은 확인 장에서 푼다)
  part('cover', (root) => {
    window.Privacy.mount(root);
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector('#pr-more').classList.toggle('answer', on);
    return {
      fragment(f, on) { if (f.dataset.anim === 'pv') answer(on); },
      sync(slide) { const f = slide.querySelector('[data-anim="pv"]'); answer(!!f && f.classList.contains('visible')); },
    };
  });

  // 2. 체험: 쟁점 저울 — ① 하나 ② 셋 이상 ③ 토론할 쟁점 고르기
  part('ssi', (root) => {
    single([...root.querySelectorAll('.share-opts button')]);
    const m = window.IssueMap.mount(root);
    const seen = new Set();
    root.addEventListener('click', (e) => { const n = e.target.closest && e.target.closest('.ss-node'); if (n) seen.add(n.dataset.k); });
    root.addEventListener('keydown', (e) => { const n = e.target.closest && e.target.closest('.ss-node'); if (n) seen.add(n.dataset.k); });
    const t = track(root, [() => !!root.querySelector('.ss-node.on'), () => seen.size >= 3, () => pressed(root, '.ss-opts')]);
    return join(m, t);
  });

  // 3. 이론: 사진(쟁점 사례)을 누르면 맞는 왼쪽 상자가 밝아진다
  part('decide', window.EthTrack.theory);

  // 4. 체험: 인공지능 그림 — ① 그리기 ② 다른 사람 B ③ 저작권 고르기
  part('aiart', (root) => {
    const m = window.AIArt.mount(root);
    const at = () => { const n = txt(root, '.ai-now'); return '①②③④'.indexOf(n[0]) + 1; };
    const t = track(root, [() => at() >= 3, () => at() >= 4, () => pressed(root, '.ai-opts')]);
    return join(m, t);
  });

  // 5. 이론: 과학 윤리
  part('ethics', window.EthTrack.theory);

  // 6. 체험: 거짓 혈액 진단 — ① 시간 ② 검증 ③ 가장 일찍
  part('fraud', (root) => {
    const m = window.FakeTest.mount(root);
    const t = track(root, [
      () => +root.querySelector('#fr-t').value > 5,
      () => /검증했다$/.test(txt(root, '.fr-it')),
      () => txt(root, '.fr-now') === '가장 일찍 검증했다',
    ]);
    return join(m, t);
  });

  // 7. 체험: 연구 윤리 — ① 팻말 읽기 ② 카드 하나 ③ 다섯 장 모두
  part('reseth', (root) => {
    const m = window.LabEthics.mount(root);
    const used = () => root.querySelectorAll('.re-card.used').length;
    const t = track(root, [() => txt(root, '.re-it') !== '팻말을 눌러 보자', () => used() >= 1, () => used() >= 5]);
    return join(m, t);
  });

  // 8. 미니 게임: 쟁점 분야 가르기(빠른 퀴즈)
  part('game2', (root) => window.EthGame.mount(root, {
    id: 'ssi', title: '40초 쟁점 분야 가르기', seconds: 40,
    intro: '쟁점을 다섯 분야 중 하나로!<br>«게임 시작»을 누르자',
    endSay: '헷갈리면 «무엇이 걱정되는가 — 전기? 생명? 몸? 자연? 정보?»를 물어보자',
    items: [
      { q: '방사성 폐기물을 어디에 둘까', a: 'en', why: '원자력 발전에서 나온 폐기물 → 에너지 분야.' },
      { q: '바닷속 자원을 캐서 쓸까', a: 'en', why: '해양 자원 이용 → 에너지 분야.' },
      { q: '태양광·풍력 발전을 더 늘릴까', a: 'en', why: '신재생 에너지 확대 → 에너지 분야.' },
      { q: '배아로 하는 연구를 허락할까', a: 'bio', why: '생명의 시작을 다룬다 → 생명 윤리 분야.' },
      { q: '부모가 원하는 유전자를 고른 맞춤 아기', a: 'bio', why: '생명을 골라 만든다 → 생명 윤리 분야.' },
      { q: '새 약을 위해 동물로 실험해도 될까', a: 'bio', why: '동물의 생명과 존엄 → 생명 윤리 분야.' },
      { q: '병원체를 막는 약, 항생제를 너무 자주 쓴다', a: 'hl', why: '항생제 남용은 내 몸의 건강 문제 → 건강 분야.' },
      { q: '과자에 넣는 식품 첨가물은 괜찮을까', a: 'hl', why: '먹는 것이 몸에 미치는 영향 → 건강 분야.' },
      { q: '유전자를 바꾼 농산물을 먹어도 될까', a: 'hl', why: '먹는 사람 몸에 미칠 영향이 쟁점 → 건강 분야.' },
      { q: '갯벌을 메워 땅을 넓힐까', a: 'env', why: '간척 사업은 자연을 바꾼다 → 환경 분야.' },
      { q: '미세 먼지를 줄이려 공장을 멈출까', a: 'env', why: '공기 오염 문제 → 환경 분야.' },
      { q: '숲을 개발할까, 보전할까', a: 'env', why: '환경 보전과 개발 → 환경 분야.' },
      { q: '인공지능이 그린 그림의 저작권', a: 'info', why: '생성형 인공지능 결과물 → 정보·기술 분야.' },
      { q: '앱이 모은 내 위치 기록을 광고에 쓴다', a: 'info', why: '개인 정보 활용 → 정보·기술 분야.' },
      { q: '지구 둘레를 도는 우주 쓰레기', a: 'info', why: '우주 개발이 남긴 문제 → 정보·기술 분야.' },
      { q: '얼굴 인식 카메라를 거리마다 달까', a: 'info', why: '인공지능과 개인 정보 → 정보·기술 분야.' },
    ],
  }));

  part('sum2', (root) => window.RxT.sum(root));
  part('check2', (root) => { window.LessonParts.mountWrap(root); });
})();
