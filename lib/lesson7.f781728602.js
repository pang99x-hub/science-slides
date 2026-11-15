/* 2-1-2 1차시 «별의 탄생과 수소 핵융합»(교과서 54~55쪽). 차례(7장): 표지(타는 불과 태양) → 이론(별의 탄생) → 이론(수소 핵융합과 별의 크기) → 미니 게임 → 문제로 다지기 → 정리 → 확인. */
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
  cov('fuel');
  part('birth', (root) => window.Birth.mount(root));
  part('balance', (root) => window.Balance.mount(root));
  part('game7', (root) => window.EthGame.mount(root, {
    id: 'starborn', title: '30초 성운 · 원시별 · 별', seconds: 30,
    intro: '설명이 어느 단계인지 골라!<br>«게임 시작»을 누르자',
    endSay: '성운이 수축해 원시별, 수소 핵융합이 시작되면 별',
    items: [
      { q: '수소·헬륨 기체와 티끌이 모인 구름', a: 'neb', why: '별이 태어나는 곳.' },
      { q: '밀도가 큰 곳부터 수축이 시작된다', a: 'neb', why: '성운 속 밀도가 큰 부분이 뭉친다.' },
      { q: '별의 재료가 넓게 퍼져 있다', a: 'neb', why: '아직 뭉치기 전.' },
      { q: '중력으로 수축하며 중심 온도가 오른다', a: 'proto', why: '수축할수록 뜨거워진다.' },
      { q: '아직 핵융합을 하지 않는다', a: 'proto', why: '핵융합이 시작되면 별.' },
      { q: '크기가 점점 줄어든다', a: 'proto', why: '중력이 내부 압력보다 크다.' },
      { q: '중심 온도가 1000만 K에 못 미친다', a: 'proto', why: '1000만 K에 이르러야 수소 핵융합.' },
      { q: '중심에서 수소 핵융합이 일어난다', a: 'star', why: '수소 원자핵 4개 → 헬륨 원자핵 1개.' },
      { q: '중력과 내부 압력이 평형을 이룬다', a: 'star', why: '핵융합 에너지가 내부 압력을 만든다.' },
      { q: '크기가 일정하게 유지된다', a: 'star', why: '두 힘이 평형.' },
      { q: '지금의 태양', a: 'star', why: '약 46억 년째 수소 핵융합 중.' },
      { q: '중심에 헬륨이 점점 쌓인다', a: 'star', why: '수소 핵융합의 결과.' },
    ],
  }));
  part('drill7', (root) => window.Drill.mount(root, [
    { q: '별의 탄생에 대한 설명으로 옳은 것은?',
      opts: ['성운에서 밀도가 낮은 곳에 원시별이 생긴다.', '원시별은 중력으로 수축하며 점점 커진다.', '원시별은 내부 압력과 중력이 평형을 이룬다.', '원시별 중심이 1000만 K을 넘으면 핵융합이 시작되어 별이 된다.', '수소 핵융합이 시작되면 별은 계속 커진다.'], a: 3,
      why: '원시별은 밀도가 <b>큰</b> 곳에서 생겨 수축하며 <b>작아진다</b>. 평형은 핵융합이 시작된 뒤 — 그때부터 크기가 <b>일정</b>.' },
    { q: '별 속 두 힘에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 수소 핵융합 중인 별에서는 중력과 내부 압력에 의한 힘이 평형을 이룬다.', 'ㄴ. 중심의 핵융합이 멈추면 중력이 더 커져 중심이 수축한다.', 'ㄷ. 중력이 내부 압력에 의한 힘보다 크면 별이 팽창한다.'],
      opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '중력이 크면 <b>수축</b>, 내부 압력이 크면 팽창(ㄷ ×).' },
    { q: '별의 중심에서 일어나는 수소 핵융합에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 수소 원자핵 4개가 합쳐져 헬륨 원자핵 1개가 된다.', 'ㄴ. 반응 뒤 질량이 조금 줄고, 그만큼 에너지가 나온다.', 'ㄷ. 중심 온도가 약 1000만 K 이상일 때 일어난다.'],
      opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 4, why: '세 가지 모두 옳다. 이 에너지로 별이 <b>빛나고</b>, 중력에 맞서는 내부 압력이 생긴다.' },
    { q: '원시별과 별을 견준 것으로 옳은 것은?',
      opts: ['원시별은 별보다 중심 온도가 높다.', '원시별은 수축하고, 별은 크기가 일정하다.', '둘 다 중심에서 수소 핵융합을 한다.', '별은 성운이 되었다가 원시별이 된다.', '원시별에서는 내부 압력이 중력보다 크다.'], a: 1,
      why: '원시별은 중력이 더 커서 <b>수축</b>하고, 핵융합을 시작한 별은 두 힘이 평형이라 크기가 <b>일정</b>하다.' },
    { q: '수소 핵융합을 하는 동안 태양의 크기가 거의 변하지 않는 까닭은?',
      opts: ['태양이 고체로 되어 있어서', '중력이 작용하지 않아서', '안으로 당기는 중력과 밖으로 미는 내부 압력에 의한 힘이 평형을 이루어서', '핵융합으로 질량이 계속 늘어나서', '둘레의 행성들이 태양을 붙잡고 있어서'], a: 2,
      why: '핵융합 에너지가 만든 <b>내부 압력</b>이 <b>중력</b>과 맞선다.' },
  ]));
  part('sum7', (root) => window.RxT.sum(root));
  part('check7', (root) => { window.LessonParts.mountWrap(root); });
  part('pp', (r) => window.Xpa.mount(r, 'pp'));
  part('life', (r) => window.Xpa.mount(r, 'life'));
  part('sunlab', (r) => window.Xpa.mount(r, 'sunlab'));
})();
