/* 2-2-2 2차시 「전기적 성질의 활용」(교과서 89~99쪽 + 참고서 104~107쪽): 장마다 조각을 붙인다.
   차례(9장): 표지(충전기 속 다이오드) → 체험(다이오드 방향) → 체험(무선 마우스 분해, 해 보기 90쪽) → 이론(활용 사진)
   → 체험(색이 바뀌는 자동차, 과학 이야기 92쪽) → 미니 게임 → 문제로 다지기 → 정리 → 확인. 옛 1차시에서 나눠 옴. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  part('cover', (root) => {
    const m = window.Cov.mount(root, 'rect');
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector('#pr-o').classList.toggle('answer', on);
    return { fit: m.fit, setActive: m.setActive, fragment(f, on) { if (f.dataset.anim === 'au') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="au"]'); answer(!!f && f.classList.contains('visible')); } };
  });
  part('diode', (root) => window.EthTrack.join(window.Diode.mount(root), window.L1.frame(root)));
  part('mouse', (root) => window.Mouse.mount(root));
  part('useit', window.EthTrack.theory);
  part('eink', (root) => window.EthTrack.join(window.EInk.mount(root), window.L1.frame(root)));
  part('solar', (root) => window.EthTrack.join(window.More.mount(root, 'solar'), window.L1.frame(root)));
  part('game4', (root) => window.EthGame.mount(root, {
    id: 'conduct', title: '40초 도체? 부도체? 반도체?', seconds: 40,
    intro: '자유 전자가 얼마나 있을까?<br>«게임 시작»을 누르자',
    endSay: '금속 → 도체 · 유리·고무·플라스틱 → 부도체 · 규소·칩 → 반도체',
    items: [
      { q: '구리 전선', a: 'c', why: '자유 전자가 많은 금속.' },
      { q: '금', a: 'c', why: '금·은·구리는 대표 도체.' },
      { q: '피뢰침', a: 'c', why: '벼락 전류를 땅으로 흘린다.' },
      { q: '정전기 방지 패드', a: 'c', why: '손의 전자를 금속 패드로 옮긴다.' },
      { q: '터치 장갑 끝의 전도성 실', a: 'c', why: '손가락의 전류가 화면에 닿게 한다.' },
      { q: '전선 피복', a: 'i', why: '전류가 새지 않게 막는다.' },
      { q: '절연 장갑', a: 'i', why: '작업자 몸으로 전류가 흐르지 않게.' },
      { q: '유리', a: 'i', why: '자유 전자가 거의 없다.' },
      { q: '고무 지우개', a: 'i', why: '해 보기 88쪽 — 전류 0.' },
      { q: '나무 막대', a: 'i', why: '전류가 거의 흐르지 않는다.' },
      { q: '반도체 기판의 코팅 물질', a: 'i', why: '회로를 보호하고 오작동을 막는다.' },
      { q: '규소', a: 's', why: '대표적인 반도체.' },
      { q: '저마늄', a: 's', why: '규소와 함께 반도체.' },
      { q: '발광 다이오드', a: 's', why: '전류가 흐르면 빛을 내는 반도체 소자.' },
      { q: '태양 전지', a: 's', why: '빛을 받으면 전류가 흐른다.' },
      { q: '컴퓨터의 칩', a: 's', why: '반도체 소자를 모은 집적 회로.' },
      { q: '불순물을 넣어 성질을 조절하는 물질', a: 's', why: '인·붕소를 섞은 규소.' },
      { q: '연필심(흑연)', a: 'c', why: '비금속이지만 전류가 흐른다 — 해 보기 88쪽.' },
    ],
  }));
  part('drill6', (root) => window.Drill.mount(root, [
    { q: '다이오드에 대한 설명으로 옳은 것은?', opts: ['전류를 양쪽으로 똑같이 흐르게 한다.', '전류를 한 방향으로만 흐르게 한다.', '부도체로만 만든다.', '직류를 교류로 바꾼다.', '빛을 받아야만 작동한다.'], a: 1, why: '한 방향으로만 — 그래서 교류를 <b>직류</b>로 바꾸는 데 쓴다.' },
    { q: '반도체의 성질을 활용한 것만 고른 것은?', box: ['ㄱ. 태양 전지', 'ㄴ. 절연 장갑', 'ㄷ. 발광 다이오드 조명'], opts: ['ㄱ', 'ㄴ', 'ㄱ, ㄷ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '절연 장갑은 <b>부도체</b>.' },
    { q: '전선은 구리 도선을 플라스틱 피복으로 감싸 만든다. 옳지 않은 것은?', opts: ['구리는 도체이다.', '피복은 부도체이다.', '구리는 피복보다 자유 전자가 많다.', '피복은 전류를 막는 성질을 이용한 것이다.', '구리와 피복 모두 불순물을 넣어 전기적 성질을 조절한다.'], a: 4, why: '불순물로 성질을 조절하는 것은 <b>반도체</b>.' },
    { q: '전기 자동차 전지 재료는 «전자의 이동을 쉽게 조절할 수 있고, 열을 덜 내 에너지 손실이 적어야» 한다. 가장 알맞은 것은?', opts: ['도체', '부도체', '반도체', '도체와 부도체', '셋 다 알맞지 않다'], a: 2, why: '이동을 <b>조절</b>하고 열이 적은 것 — 반도체.' },
    { q: '전자 잉크(과학 이야기 92쪽)에 대한 설명으로 옳은 것만 고른 것은?', box: ['ㄱ. 마이크로캡슐 속 흰 안료와 검은 안료는 서로 다른 전하를 띤다.', 'ㄴ. 전압을 걸면 한쪽 안료가 표면으로 모인다.', 'ㄷ. 색을 유지하려면 전기를 계속 많이 써야 한다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '전기를 <b>거의 쓰지 않는다</b>(ㄷ ×).' },
    { q: '무선 마우스를 분해해 부품을 전기적 성질로 나눈 것으로 옳은 것은?', opts: ['구리 배선 — 부도체', '겉 껍데기 — 도체', '칩 — 반도체', '휠 — 도체', '전지 단자 — 반도체'], a: 2, why: '칩·발광 다이오드는 <b>반도체</b>, 구리 배선·전지 단자는 도체, 겉 껍데기·휠은 부도체.' },
    { q: '도체의 성질을 활용한 것만 고른 것은?', box: ['ㄱ. 피뢰침', 'ㄴ. 정전기 방지 패드', 'ㄷ. 전선의 피복'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '전선 피복은 전류를 막는 <b>부도체</b>(ㄷ ×).' },
  ]));
  part('sum6', (root) => window.RxT.sum(root));
  part('check6', (root) => { window.LessonParts.mountWrap(root); });
})();
