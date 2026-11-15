/* 3-3-1 2차시 «효소의 작용»(교과서 146~147쪽 + 참고서): 장마다 조각을 붙인다.
   차례(9장): 표지(상처 소독 거품, 사건 파일 22) → 이론(활성화에너지와 효소) → 체험(에너지 언덕 넘기) → 이론(효소의 작용과 특성)
   → 체험(효소와 기질 맞추기) → 미니 게임 → 문제로 다지기 → 정리 → 확인. 감자즙 실험·반응 속도·활용은 3차시(lesson5)로 옮겼다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const J = (m, root) => window.EthTrack.join(m, window.L1.frame(root));
  part('cover', (root) => {
    const st = window.Wound.mount(root), fr = window.L1.frame(root), btns = [...root.querySelectorAll('.share-opts button')];
    btns.forEach((b) => b.addEventListener('click', () => { const on = b.getAttribute('aria-pressed') !== 'true'; btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b))); }));
    const answer = (on) => root.querySelector('#pr-b').classList.toggle('answer', on);
    return { fit: st.fit, setActive(on) { st.setActive(on); fr.setActive(on); }, fragment(f, on) { if (f.dataset.anim === 'wd') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="wd"]'); answer(!!f && f.classList.contains('visible')); } };
  });
  part('aetheory', (root) => window.RxT.stepper(root));
  part('hill', (root) => J(window.Hill.mount(root), root));
  part('entheory', (root) => window.RxT.stepper(root));
  part('lockkey', (root) => J(window.LockKey.mount(root), root));
  part('enztemp', (root) => window.Labs.mount(root, 'temp'));
  part('game2', (root) => window.EthGame.mount(root, {
    id: 'enzyme', title: '40초 효소의 어떤 성질일까?', seconds: 40,
    intro: '맞는 짝만, 다시, 망가지면 끝<br>«게임 시작»을 누르자',
    endSay: '한 물질에만 → 기질특이성 · 계속 다시 → 재사용 · 열·산에 망가짐 → 변성',
    items: [
      { q: '침 속 아밀레이스는 녹말은 분해하지만 단백질은 분해하지 못한다', a: 'spec', why: '구조가 맞는 기질에만.' },
      { q: '카탈레이스는 에탄올을 넣어도 거품이 생기지 않는다', a: 'spec', why: '과산화 수소에만 작용.' },
      { q: '소화 단계마다 다른 효소가 일한다', a: 'spec', why: '단계마다 기질이 달라 효소도 다르다.' },
      { q: '단백질 분해 효소는 지방을 분해하지 못한다', a: 'spec', why: '맞지 않는 기질.' },
      { q: '몸에는 수천 가지 효소가 있다', a: 'spec', why: '한 효소가 한 가지 반응만 맡기 때문.' },
      { q: '아주 적은 양의 효소로도 많은 기질을 처리한다', a: 'reuse', why: '반응 뒤 그대로 남아 다시 일한다.' },
      { q: '거품이 멈춘 감자즙에 과산화 수소수를 더 넣으면 다시 거품이 난다', a: 'reuse', why: '효소가 변하지 않고 남아 있다.' },
      { q: '효소는 반응 뒤 생성물과 떨어져 새 기질과 결합한다', a: 'reuse', why: '재사용.' },
      { q: '효소 세제 한 숟가락으로 빨래 여러 벌을 빤다', a: 'reuse', why: '같은 효소가 계속 일한다.' },
      { q: '반응 전과 후에 효소의 모양과 성질이 같다', a: 'reuse', why: '그래서 다시 쓸 수 있다.' },
      { q: '삶은 감자에 과산화 수소수를 부으면 거품이 거의 없다', a: 'den', why: '열에 효소 구조가 망가졌다.' },
      { q: '끓인 파인애플을 넣으면 고기가 연해지지 않는다', a: 'den', why: '단백질 분해 효소가 열에 변성.' },
      { q: '높은 열이 난 몸에서 효소가 제대로 일하지 못한다', a: 'den', why: '구조가 흐트러진다.' },
      { q: '강한 산에 담근 효소가 기질과 결합하지 못한다', a: 'den', why: '입체 구조가 바뀌었다.' },
      { q: '가열한 생간 조각으로는 산소가 생기지 않는다', a: 'den', why: '간의 카탈레이스가 변성.' },
      { q: '익힌 달걀흰자가 다시 투명해지지 않는 것처럼 효소도 되돌아오지 않는다', a: 'den', why: '단백질이 변성되면 되돌리기 어렵다.' },
      { q: '엿기름의 아밀레이스가 밥의 녹말만 엿당으로 바꾼다', a: 'spec', why: '녹말에만 작용.' },
      { q: '혈당 측정기는 포도당에만 반응하는 효소를 쓴다', a: 'spec', why: '포도당만 골라 잰다.' },
    ],
  }));
  part('drill2', (root) => window.Drill.mount(root, [
    { q: '활성화에너지를 설명한 것으로 옳은 것은?', opts: ['처음 물질과 나중 물질의 에너지 높이 차다.', '반응이 일어나는 데 필요한 최소한의 에너지다.', '클수록 반응이 빨라진다.', '효소가 있으면 커진다.', '생성물이 가진 에너지다.'], a: 1, why: '작을수록 반응이 <b>빠르고</b>, 효소가 있으면 <b>작아진다</b>.' },
    { q: '과산화 수소 분해 반응의 에너지 그래프를 효소가 있을 때와 없을 때 견주었다. 옳은 것만 고른 것은?', box: ['ㄱ. 효소가 있을 때 언덕의 높이가 낮다.', 'ㄴ. 효소가 있을 때 반응물과 생성물의 높이 차가 작다.', 'ㄷ. 두 경우 생성물은 같다.'], opts: ['ㄱ', 'ㄴ', 'ㄱ, ㄷ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '높이 차(<b>반응열</b>)는 효소와 관계없이 같다(ㄴ ×).' },
    { q: '효소를 설명한 것 중 틀린 것은?', opts: ['주성분은 단백질이다.', '생체 촉매이다.', '반응열을 줄여 반응을 빠르게 한다.', '기질과 결합해 복합체를 만든다.', '대부분의 물질대사에 관여한다.'], a: 2, why: '효소는 <b>활성화에너지</b>를 낮출 뿐 반응열은 그대로다.' },
    { q: '효소의 작용 순서로 옳은 것은?', opts: ['생성물 → 효소·기질 복합체 → 기질', '기질과 효소 결합 → 효소·기질 복합체 → 생성물과 효소 분리', '효소 분해 → 기질 생성', '기질 → 효소 변성 → 생성물', '효소와 생성물 결합 → 기질'], a: 1, why: '결합 → 복합체 → 생성물이 떨어지고 효소는 그대로(재사용).' },
    { q: '카탈레이스는 과산화 수소는 분해하지만 에탄올에는 아무 일도 하지 않는다. 이와 관계있는 효소의 특성은?', opts: ['재사용', '변성', '기질특이성', '반응열', '촉매 독'], a: 2, why: '입체 구조가 맞는 기질에만 — <b>기질특이성</b>.' },
    { q: '반응이 끝나 생성물이 떨어져 나간 뒤 효소는 어떻게 되는가?', opts: ['생성물과 함께 분해된다.', '변하지 않고 남아 새 기질과 다시 결합한다.', '기질로 바뀐다.', '활성화에너지가 된다.', '반응열로 바뀐다.'], a: 1, why: '효소는 반응 뒤에도 그대로라 <b>재사용</b>된다.' },
  ]));
  part('sum2', (root) => window.RxT.sum(root));
  part('check2', (root) => { window.LessonParts.mountWrap(root); });
})();
