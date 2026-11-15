/* 3-3-3 3차시 «유전부호와 단백질 만들기»(교과서 157~160쪽 + 참고서): 옛 1차시에서 탐구·유전부호·단원 마무리를 떼어 낸 차시.
   차례(7장): 표지(코돈을 읽는 라이보솜) → 체험(주사위로 단백질 만들기) → 체험(모든 생물의 같은 사전) → 미니 게임 → 문제로 다지기
   → 정리(단원 한눈에 보기) → 확인(사건 파일 24 풀기 · 대단원 마무리). */
(function () {
  'use strict';
  const { part } = window.Deck;
  const J = (m, root) => window.EthTrack.join(m, window.L1.frame(root));
  part('cover', (root) => {
    const m = window.Cov.mount(root, 'stop'), fr = window.L1.frame(root), btns = [...root.querySelectorAll('.share-opts button')];
    btns.forEach((b) => b.addEventListener('click', () => { const on = b.getAttribute('aria-pressed') !== 'true'; btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b))); }));
    const answer = (on) => root.querySelector('#pr-b').classList.toggle('answer', on);
    return { fit: m.fit, setActive(on) { m.setActive(on); fr.setActive(on); }, fragment(f, on) { if (f.dataset.anim === 'au') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="au"]'); answer(!!f && f.classList.contains('visible')); } };
  });
  part('codonwheel', (root) => window.Labs.mount(root, 'wheel'));
  part('dice', (root) => J(window.Dice.mount(root), root));
  part('readframe', (root) => window.Labs.mount(root, 'frame'));
  part('universal', (root) => window.Universal.mount(root));
  part('glowgene', (root) => window.Labs.mount(root, 'glow'));
  part('game4', (root) => window.EthGame.mount(root, {
    id: 'central', title: '40초 DNA? RNA? 단백질?', seconds: 40,
    intro: '정보를 담나, 나르나, 일하나?<br>«게임 시작»을 누르자',
    endSay: '저장은 DNA · 전달은 RNA(코돈) · 일하는 것은 단백질',
    items: [
      { q: '핵 속에서 두 가닥이 꼬인 이중 나선을 이룬다', a: 'dna', why: 'DNA는 이중 나선.' },
      { q: '유전자는 이것의 특정 부위이다', a: 'dna', why: '유전자 = DNA의 한 부분.' },
      { q: '아미노산 하나를 정하는 3염기조합이 있다', a: 'dna', why: '3염기조합은 DNA의 말.' },
      { q: '염기 T(타이민)를 가진다', a: 'dna', why: 'T는 DNA에만.' },
      { q: '핵 밖으로 나가지 않고 정보를 보관한다', a: 'dna', why: '원본은 핵 안에.' },
      { q: '염색체를 이루는 유전 물질', a: 'dna', why: 'DNA가 단백질에 감겨 염색체.' },
      { q: '전사로 만들어지는 한 가닥 사슬', a: 'rna', why: 'DNA 한 가닥과 짝지어 합성.' },
      { q: '코돈을 가진다', a: 'rna', why: '코돈은 RNA의 염기 세 개.' },
      { q: '염기 U(유라실)를 가진다', a: 'rna', why: 'U는 RNA에만.' },
      { q: '핵공을 지나 세포질의 라이보솜으로 간다', a: 'rna', why: '정보를 나르는 심부름꾼.' },
      { q: '라이보솜이 세 염기씩 읽어 나가는 사슬', a: 'rna', why: '번역의 설계도.' },
      { q: '아미노산 구슬이 줄줄이 이어진 사슬', a: 'pro', why: '단백질.' },
      { q: '번역으로 만들어져 접혀서 입체 구조가 된다', a: 'pro', why: '단백질의 입체 구조.' },
      { q: '카탈레이스·아밀레이스 같은 효소의 주성분', a: 'pro', why: '효소는 단백질.' },
      { q: '적혈구 속에서 산소를 나르는 헤모글로빈', a: 'pro', why: '단백질.' },
      { q: '꽃잎에서 붉은 색소를 만드는 효소', a: 'pro', why: '효소 단백질의 작용 → 꽃 색.' },
      { q: '세균이 사람 유전자로 만들어 내는 인슐린', a: 'pro', why: '번역된 단백질.' },
      { q: '세포막에서 포도당을 통과시키는 통로', a: 'pro', why: '막단백질.' },
    ],
  }));
  part('drill8', (root) => window.Drill.mount(root, [
    { q: '사람의 인슐린 유전자를 넣은 세균이 사람과 같은 인슐린을 만드는 까닭은?', opts: ['세균이 사람 세포로 바뀌어서', '모든 생물이 같은 유전부호 체계를 써서', '세균에는 라이보솜이 없어서', '인슐린이 RNA여서', '세균의 DNA가 사람과 같아서'], a: 1, why: '같은 코돈은 어느 생물에서나 <b>같은 아미노산</b>을 정한다.' },
    { q: 'RNA의 코돈 UAA, UAG, UGA 가운데 하나를 만난 라이보솜에서 일어나는 일은?', opts: ['메싸이오닌을 잇는다.', '단백질 만들기를 멈춘다.', '처음부터 다시 읽는다.', 'DNA를 만든다.', '그 코돈을 건너뛰고 계속 읽는다.'], a: 1, why: '세 코돈은 아미노산을 정하지 않는 <b>종결코돈</b>이다.' },
    { q: '번역이 시작되는 개시코돈과 그 코돈이 정하는 아미노산의 짝은?', opts: ['UAA — 발린', 'AUG — 메싸이오닌', 'UGG — 라이신', 'GUU — 트립토판', 'AAA — 메싸이오닌'], a: 1, why: '<b>AUG</b>는 메싸이오닌을 정하면서 번역의 시작을 알린다.' },
    { q: '세포소기관과 하는 일의 짝으로 옳지 않은 것은?(단원 복습)', opts: ['핵 — DNA로 생명활동 조절', '라이보솜 — 단백질 합성', '골지체 — 단백질을 싸서 내보냄', '엽록체 — 광합성', '마이토콘드리아 — 유전정보 전사'], a: 4, why: '마이토콘드리아는 <b>세포호흡</b>. 전사는 핵에서.' },
    { q: '효소에 대한 설명으로 옳은 것만 고른 것은?(단원 복습)', box: ['ㄱ. 활성화에너지를 낮춘다.', 'ㄴ. 반응 뒤에 다시 쓰인다.', 'ㄷ. 반응열을 크게 한다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '반응열은 효소와 관계없이 <b>그대로</b>(ㄷ ×).' },
    { q: '진한 소금물에 넣은 양파 표피세포와 증류수에 넣은 적혈구에서 일어나는 일로 옳은 것은?(단원 복습)', opts: ['양파 세포는 터지고 적혈구는 쪼그라든다.', '양파 세포는 원형질분리, 적혈구는 부풀다 터질 수 있다.', '둘 다 변화가 없다.', '둘 다 터진다.', '양파 세포는 팽팽해지고 적혈구는 쪼그라든다.'], a: 1, why: '고장액 → 원형질분리, 저장액 → 적혈구 <b>용혈</b>.' },
  ]));
  part('sum8', (root) => window.RxT.sum(root));
  part('check8', (root) => { window.LessonParts.mountWrap(root); });
})();
