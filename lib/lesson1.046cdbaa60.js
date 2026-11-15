/* 3-2 1차시 「과학기술의 발전과 한계」(교과서 144~149쪽): 장마다 조각을 붙인다.
   차례(2026-10-31 승인 틀로 보강, 10장 — 기존 6장은 그대로 두고 넷을 더함):
   표지(사건 파일 1) → 이론(사물 인터넷·인공지능·인공지능 로봇, 사진) → 체험(서빙 로봇) → 체험(스마트 홈 3D) → 체험(로봇 고쳐 보기)
   → 이론(유용성과 한계, 사진) → 체험(좋아지는 만큼 생기는 문제) → 미니 게임(기술 가르기, 빠른 퀴즈) → 정리(뒤집기 카드) → 확인(+ 사건 파일 1 풀기).
   예측·어려운 개선 고르기(.share-opts)·확인 ○×(.qs)는 수업방 응답 모으기가 그대로 읽는다. #aibot·#twoside의 data-word는 «한 낱말 묻기»에 미리 들어간다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  const { track, join, txt, pressed } = window.EthTrack;

  // 1. 표지: 3D 네발 로봇 + 예측(한 번 넘기면 답 표시, 사건은 확인 장에서 푼다)
  part('cover', (root) => {
    const q = window.QuadBot.mount(root);
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector('#pr-self').classList.toggle('answer', on);
    return {
      setActive: q.setActive, fit: q.fit,
      fragment(f, on) { if (f.dataset.anim === 'qb') answer(on); },
      sync(slide) { const f = slide.querySelector('[data-anim="qb"]'); answer(!!f && f.classList.contains('visible')); },
    };
  });

  // 2. 이론: 사진을 누르면 맞는 왼쪽 상자가 밝아진다
  part('tech', window.EthTrack.theory);

  // 3. 체험: 서빙 로봇 — ① 식탁 ② 길에 놓기 ③ 센서 → 판단 → 행동
  part('aibot', (root) => {
    const m = window.ServeBot.mount(root);
    const t = track(root, [
      () => !txt(root, '.sv-now').startsWith('①'),
      () => root.querySelector('.sv-obs').childElementCount > 0,
      () => !!root.querySelector('.sv-step[data-k="act"].on'),
    ]);
    return join(m, t);
  });

  // 4. 체험: 스마트 홈 — 지금 할 것 칩(①~⑤)을 해 볼 일 셋으로 묶는다
  part('iot', (root) => {
    const m = window.SmartHome.mount(root);
    const at = () => { const n = root.querySelector('.ih-now'); return n.classList.contains('done') ? 9 : '①②③④⑤'.indexOf(n.textContent.trim()[0]) + 1; };
    const t = track(root, [() => at() > 1, () => at() > 2, () => at() > 4]);
    return join(m, t);
  });

  // 5. 체험: 로봇 고쳐 보기 — ① 부품 하나 ② 넷 모두 ③ 가장 어려운 개선 고르기
  part('robofix', (root) => {
    single([...root.querySelectorAll('.share-opts button')]);
    const m = window.RobotFix.mount(root);
    const fixed = () => root.querySelectorAll('.rf-probs li.fixed').length;
    const t = track(root, [() => fixed() >= 1, () => fixed() >= 4, () => pressed(root, '.rf-opts')]);
    return join(m, t);
  });

  // 6. 이론: 유용성과 한계
  part('limits', window.EthTrack.theory);

  // 7. 체험: 좋아지는 만큼 생기는 문제 — ① 발전 막대 ② 장소 ③ 대비 막대
  part('twoside', (root) => {
    const m = window.TwoSides.mount(root);
    const t = track(root, [
      () => +root.querySelector('#ts-tech').value >= 90,
      () => txt(root, '.ts-it') !== '장소를 눌러 보자',
      () => +root.querySelector('#ts-prep').value >= 60,
    ]);
    return join(m, t);
  });

  // 8. 미니 게임: 어떤 기술일까(빠른 퀴즈)
  part('game1', (root) => window.EthGame.mount(root, {
    id: 'tech', title: '40초 기술 가르기', seconds: 40,
    intro: '생활 속 장면을 네 칸 중 하나로!<br>«게임 시작»을 누르자',
    endSay: '헷갈리면 «연결? 만들기? 내다보기? 몸으로 움직이기?» 차례로 물어보자',
    items: [
      { q: '퇴근길에 휴대 전화로 집 보일러를 켠다', a: 'iot', why: '집 기기와 전화가 인터넷으로 이어져 원격으로 다룬다 → 사물 인터넷.' },
      { q: '흙이 마르면 비닐하우스가 알아서 물을 준다', a: 'iot', why: '흙 센서 값을 받아 물주기 장치가 움직인다 → 사물 인터넷(스마트 팜).' },
      { q: '사람이 지나갈 때만 밝아지고 고장 나면 관리소에 알리는 가로등', a: 'iot', why: '센서와 통신으로 상태를 주고받는다 → 사물 인터넷.' },
      { q: '빈 주차 칸 수를 입구 전광판에 띄운다', a: 'iot', why: '칸마다 센서가 보낸 값을 모아 보여 준다 → 사물 인터넷.' },
      { q: '«바닷가의 고양이»라고 쓰면 그림이 나온다', a: 'gen', why: '글을 받아 새 그림을 만들어 낸다 → 생성형 인공지능.' },
      { q: '발표 대본 초안을 써 주는 대화 프로그램', a: 'gen', why: '새 글을 지어낸다 → 생성형 인공지능.' },
      { q: '흥얼거린 가락으로 짧은 노래를 지어 준다', a: 'gen', why: '새 음악을 만든다 → 생성형 인공지능.' },
      { q: '낮 사진의 하늘을 노을로 바꿔 그린다', a: 'gen', why: '없던 장면을 새로 그려 넣는다 → 생성형 인공지능.' },
      { q: '지난 판매 기록으로 내일 들여올 우유 양을 정한다', a: 'pre', why: '지난 흐름을 보고 앞일을 내다본다 → 예측형 인공지능.' },
      { q: '내일 오후 미세 먼지 농도를 미리 알려 준다', a: 'pre', why: '쌓인 자료로 앞으로의 변화를 내다본다 → 예측형 인공지능.' },
      { q: '동영상 앱이 다음에 볼 영상을 골라 준다', a: 'pre', why: '내가 무엇을 좋아할지 내다본다 → 예측형 인공지능.' },
      { q: '전기를 가장 많이 쓸 시간을 미리 알린다', a: 'pre', why: '사용 기록으로 앞일을 내다본다 → 예측형 인공지능.' },
      { q: '센서로 길을 찾아 음식을 식탁까지 나른다', a: 'bot', why: '알아채고 판단해 몸(바퀴)을 움직인다 → 인공지능 로봇.' },
      { q: '방 모양을 익혀 스스로 바닥을 청소한다', a: 'bot', why: '청소 길을 스스로 정해 움직인다 → 인공지능 로봇.' },
      { q: '박물관에서 길을 묻는 사람을 데려다준다', a: 'bot', why: '안내 로봇 — 상황을 보고 판단해 움직인다.' },
      { q: '창고에서 상자를 골라 들어 옮긴다', a: 'bot', why: '물건을 알아보고 팔과 바퀴를 움직인다 → 인공지능 로봇.' },
    ],
  }));

  part('sum1', (root) => window.RxT.sum(root));
  part('check1', (root) => { window.LessonParts.mountWrap(root); });
})();
