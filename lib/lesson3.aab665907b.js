/* 2-1-3 1차시 «주기율표와 원소의 성질»(교과서 60~63쪽). 차례(9장): 표지(원소 달력, 사건 파일 7) → 이론(주기율표 읽기) → 체험(금속·비금속 실험대) → 체험(알칼리 금속, 탐구 63쪽) → 체험(할로젠) → 미니 게임 → 문제로 다지기 → 정리 → 확인. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  // 표지: 오른쪽 손 조작 + 예측 둘 중 하나, 한 번 넘기면 답에 테
  const cover = (mount, ans = '#pr-el', anim = 'au') => part('cover', (root) => {
    const m = mount(root);
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector(ans).classList.toggle('answer', on);
    return { fit: m.fit, setActive: m.setActive, fragment(f, on) { if (f.dataset.anim === anim) answer(on); }, sync(slide) { const f = slide.querySelector(`[data-anim="${anim}"]`); answer(!!f && f.classList.contains('visible')); } };
  });
  const cov = (kind) => cover((r) => window.Cov.mount(r, kind));
  cover((r) => window.Calendar.mount(r), '#pr-e', 'ca');
  part('ptable', (root) => window.Ptable.mount(root));
  part('metal', (root) => window.Metal.mount(root));
  const J = window.EthTrack.join;
  part('alkali', (root) => J(window.Alkali.mount(root), window.L1.frame(root)));
  part('halogen', (root) => J(window.Halogen.mount(root), window.L1.frame(root)));
  part('game3', (root) => window.EthGame.mount(root, {
    id: 'metal', title: '30초 금속일까 비금속일까', seconds: 30,
    intro: '원소나 성질을 보고 골라!<br>«게임 시작»을 누르자',
    endSay: '금속은 전기·열을 잘 전하고 펴진다, 비금속은 그 반대',
    items: [
      { q: '전기가 잘 통한다', a: 'm', why: '금속의 성질.' },
      { q: '열을 잘 전한다', a: 'm', why: '금속의 성질.' },
      { q: '두드리면 얇게 펴진다', a: 'm', why: '금속은 부서지지 않고 펴진다.' },
      { q: '특유의 광택이 있다', a: 'm', why: '금속 광택.' },
      { q: '나트륨', a: 'm', why: '1족 알칼리 금속.' },
      { q: '구리', a: 'm', why: '전선에 쓰는 금속.' },
      { q: '마그네슘', a: 'm', why: '2족 금속.' },
      { q: '주기율표의 왼쪽과 가운데에 많다', a: 'm', why: '금속 원소의 자리.' },
      { q: '산소', a: 'n', why: '16족 비금속.' },
      { q: '염소', a: 'n', why: '17족 할로젠 → 비금속.' },
      { q: '황', a: 'n', why: '16족 비금속. 두드리면 부서진다.' },
      { q: '수소', a: 'n', why: '1족에 있지만 비금속.' },
      { q: '고체를 두드리면 부서진다', a: 'n', why: '비금속 고체의 성질.' },
      { q: '주기율표의 오른쪽에 많다', a: 'n', why: '비금속 원소의 자리.' },
    ],
  }));
  part('drill3', (root) => window.Drill.mount(root, [
    { q: '금속 원소에 대한 설명으로 옳지 않은 것은?', opts: ['대부분 특유의 광택이 있다.', '전기가 잘 통한다.', '열을 잘 전달한다.', '전자를 잃고 양이온이 되기 쉽다.', '힘을 주면 쉽게 부서진다.'], a: 4, why: '금속은 두드려도 부서지지 않고 <b>모양만 변한다</b>(펴진다).' },
    { q: '오늘날의 주기율표에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 원소들을 원자 번호 순서로 놓았다.', 'ㄴ. 세로줄을 족이라 하며 1족부터 7족까지 있다.', 'ㄷ. 같은 주기 원소들은 화학적 성질이 비슷하다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 0, why: '족은 1~<b>18</b>족, 성질이 비슷한 것은 같은 <b>족</b>(세로줄).' },
    { q: '알칼리 금속을 석유에 넣어 보관하는 것과 관계있는 성질만 고른 것은?', box: ['ㄱ. 공기 중의 산소와 빠르게 반응한다.', 'ㄴ. 실온에서도 물과 격렬하게 반응한다.', 'ㄷ. 물과 반응한 뒤 수용액은 염기성을 띤다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '석유는 <b>공기·물을 막으려고</b>. 염기성은 보관과 관계없다.' },
    { q: '(가) 리튬을 자르니 단면의 광택이 곧 사라졌다. (나) 리튬 조각을 물에 넣자 기체가 생겼다. (다) 페놀프탈레인을 넣었다. 옳은 것만 고른 것은?', box: ['ㄱ. (가)에서 리튬은 공기 중 산소와 반응했다.', 'ㄴ. (나)의 기체에 불꽃을 대면 «퍽» 소리가 난다.', 'ㄷ. (다)에서 용액은 푸른색이 된다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '기체는 수소(퍽). 수용액은 염기성 → 페놀프탈레인은 <b>붉은색</b>(ㄷ ×).' },
    { q: '할로젠에 대한 설명으로 옳지 않은 것은?', opts: ['17족에 속하는 비금속 원소이다.', '실온에서 원자 둘이 결합한 분자로 있다.', '전자를 잃고 양이온이 되기 쉽다.', '수소·알칼리 금속과 잘 반응한다.', '수소와 반응해 생긴 물질은 물에 녹아 산성을 띤다.'], a: 2, why: '비금속이라 전자를 <b>얻어 음이온</b>이 되기 쉽다.' },
  ]));
  part('sum3', (root) => window.RxT.sum(root));
  part('check3', (root) => { window.LessonParts.mountWrap(root); });
  part('use3', (r) => window.M34.mount(r, 'use3'));
  part('pencil3', (r) => window.M34.mount(r, 'pencil3'));
})();
