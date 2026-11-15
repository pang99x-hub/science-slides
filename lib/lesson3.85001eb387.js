/* 2-2-1 3차시 「핵산과 뉴클레오타이드」(교과서 84~85쪽 + 참고서 97~99쪽): 장마다 조각을 붙인다.
   차례(8장): 표지(네 글자 암호, 사건 파일 11) → 이론(핵산의 구조) → 체험(뉴클레오타이드 조립) → 이론(DNA와 RNA)
   → 미니 게임 → 문제로 다지기 → 정리 → 확인. 이중 나선·짝 규칙은 4차시(lesson5). */
(function () {
  'use strict';
  const { part } = window.Deck;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  part('cover', (root) => {
    const cx = window.Code4.mount(root);
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector('#pr-s').classList.toggle('answer', on);
    return { fit: cx.fit, setActive: cx.setActive, fragment(f, on) { if (f.dataset.anim === 'cx') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="cx"]'); answer(!!f && f.classList.contains('visible')); } };
  });
  part('nctheory', (root) => window.RxT.stepper(root));
  part('nucleo', (root) => window.Nucleo.mount(root));
  part('nucomp', window.EthTrack.theory);
  part('extract', (root) => window.EthTrack.join(window.More.mount(root, 'extract'), window.L1.frame(root)));
  part('forensic', (root) => window.EthTrack.join(window.More.mount(root, 'forensic'), window.L1.frame(root)));
  part('game3', (root) => window.EthGame.mount(root, {
    id: 'nucleic', title: '40초 DNA? RNA? 둘 다?', seconds: 40,
    intro: '가닥 수·당·염기를 떠올리자!<br>«게임 시작»을 누르자',
    endSay: 'T·디옥시라이보스·두 가닥 → DNA, U·라이보스·한 가닥 → RNA',
    items: [
      { q: '이중 나선 구조', a: 'd', why: '두 가닥이 꼬인 것은 DNA.' },
      { q: '한 가닥 구조', a: 'r', why: 'RNA는 단일 가닥.' },
      { q: '타이민(T)', a: 'd', why: 'T는 DNA에만.' },
      { q: '유라실(U)', a: 'r', why: 'U는 RNA에만.' },
      { q: '아데닌(A)', a: 'b', why: 'A·G·C는 둘 다.' },
      { q: '구아닌(G)', a: 'b', why: '둘 다 쓴다.' },
      { q: '사이토신(C)', a: 'b', why: '둘 다 쓴다.' },
      { q: '인산', a: 'b', why: '뉴클레오타이드의 인산은 둘 다.' },
      { q: '디옥시라이보스', a: 'd', why: 'DNA의 D는 이 당의 이름.' },
      { q: '라이보스', a: 'r', why: 'RNA의 R은 이 당의 이름.' },
      { q: '유전 정보를 저장', a: 'd', why: 'DNA는 정보 저장 창고.' },
      { q: '정보를 옮기고 단백질 만들기에 참여', a: 'r', why: 'RNA의 일.' },
      { q: '뉴클레오타이드가 이어진 핵산', a: 'b', why: '둘 다 핵산.' },
      { q: '염기 짝: A–T, G–C로 두 가닥이 맞물림', a: 'd', why: '이중 나선 DNA의 짝 규칙.' },
      { q: 'A와 T의 양이 늘 같다', a: 'd', why: '두 가닥이 짝지어 있으니 A = T.' },
      { q: '당-인산이 이어진 골격이 있다', a: 'b', why: '둘 다 당-인산 골격.' },
      { q: '세포핵 속 염색체의 주성분', a: 'd', why: '염색체는 DNA가 단백질에 감겨 뭉친 것.' },
      { q: '질소가 들어 있는 염기를 가진다', a: 'b', why: '둘 다 염기에 질소가 있다.' },
    ],
  }));
  part('drill3', (root) => window.Drill.mount(root, [
    { q: '핵산의 기본 단위체에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 이름은 뉴클레오타이드이다.', 'ㄴ. 인산·당·염기가 1 : 1 : 1로 결합해 있다.', 'ㄷ. 약 20종류가 있다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '20종류는 <b>아미노산</b>. 뉴클레오타이드는 DNA용 4종, RNA용 4종.' },
    { q: '폴리뉴클레오타이드에서 이웃한 두 뉴클레오타이드가 결합하는 자리는?', opts: ['염기와 염기', '인산과 당', '당과 염기', '인산과 인산', '염기와 인산'], a: 1, why: '앞 뉴클레오타이드의 <b>인산</b>과 뒤 뉴클레오타이드의 <b>당</b>이 공유 결합 → 당-인산 골격.' },
    { q: 'DNA와 RNA를 비교한 것으로 옳지 않은 것은?', opts: ['DNA는 두 가닥, RNA는 한 가닥이다.', '당이 DNA는 디옥시라이보스, RNA는 라이보스이다.', 'DNA에는 T, RNA에는 U가 있다.', '둘 다 인산을 가진다.', 'RNA가 유전 정보를 저장하고 DNA가 전달한다.'], a: 4, why: '저장은 <b>DNA</b>, 전달·단백질 합성 참여는 <b>RNA</b>.' },
    { q: 'DNA용과 RNA용 뉴클레오타이드를 합하면 몇 종류인가?', opts: ['4종류', '5종류', '8종류', '10종류', '20종류'], a: 2, why: '당이 달라 같은 A·G·C라도 다른 종류 → DNA용 4 + RNA용 4 = <b>8</b>.' },
    { q: '단백질과 DNA를 비교한 것으로 옳은 것만 고른 것은?', box: ['ㄱ. 둘 다 기본 단위체가 이어진 큰 분자이다.', 'ㄴ. 둘 다 구성 원소에 질소가 있다.', 'ㄷ. 둘 다 단위체의 배열 순서에 따라 입체 구조가 크게 달라진다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: 'DNA는 서열이 달라도 <b>이중 나선</b> 그대로(ㄷ ×).' },
    { q: 'RNA에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 한 가닥으로 되어 있다.', 'ㄴ. 당은 라이보스이다.', 'ㄷ. 염기로 타이민(T)을 가진다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: 'RNA에는 T 대신 <b>유라실(U)</b>이 있다(ㄷ ×).' },
    { q: '뉴클레오타이드 20개가 이어진 한 가닥에 들어 있는 인산·당·염기의 수는?', opts: ['각각 10개', '각각 20개', '인산 20개, 당·염기 각 10개', '각각 40개', '인산 1개, 당·염기 각 20개'], a: 1, why: '뉴클레오타이드 하나에 인산·당·염기가 <b>하나씩</b> → 20개씩.' },
  ]));
  part('sum3', (root) => window.RxT.sum(root));
  part('check3', (root) => { window.LessonParts.mountWrap(root); });
})();
