/* 3-2-2 1차시 «관성»(교과서 132쪽 + 참고서): 장마다 조각을 붙인다.
   차례(8장): 표지(버스 속 공, 사건 파일 19) → 이론(관성과 역학 시스템) → 체험(버스 손잡이) → 체험(관성 마술) → 체험(갈릴레이의 빗면)
   → 문제로 다지기 → 정리 → 확인. 운동량·충격량은 2차시(lesson6)로 옮겼다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const J = (m, root) => window.EthTrack.join(m, window.L1.frame(root));
  part('cover', (root) => {
    const st = window.BusToss.mount(root), fr = window.L1.frame(root), btns = [...root.querySelectorAll('.share-opts button')];
    btns.forEach((b) => b.addEventListener('click', () => { const on = b.getAttribute('aria-pressed') !== 'true'; btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b))); }));
    const answer = (on) => root.querySelector('#pr-b').classList.toggle('answer', on);
    return { fit: st.fit, setActive(on) { st.setActive(on); fr.setActive(on); }, fragment(f, on) { if (f.dataset.anim === 'bt') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="bt"]'); answer(!!f && f.classList.contains('visible')); } };
  });
  part('intheory', (root) => window.RxT.stepper(root));
  part('bus', (root) => J(window.Bus.mount(root), root));
  part('magic', (root) => J(window.Magic.mount(root), root));
  part('galileo', (root) => J(window.Galileo.mount(root), root));
  part('cartmass', (root) => window.Labs.mount(root, 'carts'));
  part('umbrella', (root) => window.Labs.mount(root, 'shake'));
  part('drill3', (root) => window.Drill.mount(root, [
    { q: '관성에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 정지해 있는 물체는 관성이 없다.', 'ㄴ. 물체가 하던 운동 상태를 이어 가려는 성질이다.', 'ㄷ. 질량이 클수록 관성이 크다.'], opts: ['ㄱ', 'ㄴ', 'ㄱ, ㄷ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 3, why: '멈춰 있는 물체도 그대로 있으려 한다(ㄱ ×).' },
    { q: '서 있던 버스가 급출발하면 승객 몸이 뒤로 젖혀진다. 이와 같은 까닭으로 일어나는 일은?', opts: ['급정거하자 몸이 앞으로 쏠린다.', '컵 위의 카드를 튕기면 동전이 컵 속으로 떨어진다.', '페달을 멈춰도 바퀴가 계속 돈다.', '로켓이 가스를 뒤로 뿜어 앞으로 나간다.', '도움닫기를 하면 더 멀리 뛴다.'], a: 1, why: '모두 관성이지만, <b>멈춰 있던 것이 그대로 있으려는</b> 경우는 동전.' },
    { q: '갈릴레이의 빗면 사고 실험(마찰 없음)에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 공은 반대쪽 빗면에서 처음 높이까지 올라간다.', 'ㄴ. 반대쪽 빗면을 완만하게 할수록 공은 더 멀리 간다.', 'ㄷ. 반대쪽을 수평으로 하면 공은 곧 멈춘다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '힘이 없으면 <b>멈추지 않고 등속 직선 운동</b>을 계속한다(ㄷ ×).' },
    { q: '달리던 버스가 갑자기 멈추면 서 있던 승객의 몸은 어떻게 되는가?', opts: ['뒤로 젖혀진다.', '앞으로 쏠린다.', '위로 떠오른다.', '그 자리에 그대로 있다.', '옆으로만 쏠린다.'], a: 1, why: '몸은 앞으로 가던 운동을 <b>이어 가려</b> 하는데 버스만 멈추기 때문이다.' },
    { q: '같은 빠르기로 굴러오는 빈 수레와 짐을 가득 실은 수레를 멈추려 한다. 옳은 것은?', opts: ['빈 수레가 멈추기 더 어렵다.', '짐을 실은 수레가 멈추기 더 어렵다.', '둘은 똑같이 쉽게 멈춘다.', '짐을 실은 수레에는 관성이 없다.', '빈 수레는 힘을 주지 않아도 바로 멈춘다.'], a: 1, why: '질량이 클수록 <b>관성</b>이 커서 운동 상태를 바꾸기 어렵다.' },
  ]));
  part('sum3', (root) => window.RxT.sum(root));
  part('check3', (root) => { window.LessonParts.mountWrap(root); });
})();
