/* 2-1-4 1차시 «이온 결합»(교과서 68~69쪽). 차례(7장): 표지(나트륨과 염소) → 체험(이온 결합) → 체험(3D 염화 나트륨) → 미니 게임 → 문제로 다지기 → 정리 → 확인. */
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
  cov('salt');
  part('ionic', (root) => window.Ionic.mount(root));
  part('salt3d', (root) => window.Salt3D.mount(root));
  part('game11', (root) => window.EthGame.mount(root, {
    id: 'ratio', title: '40초 몇 대 몇으로 결합할까', seconds: 40,
    intro: '양이온 : 음이온 개수비를 골라!<br>«게임 시작»을 누르자',
    endSay: '(+)전하와 (−)전하의 합이 0이 되게 결합한다',
    items: [
      { q: 'Na⁺ 와 Cl⁻', a: 'a', why: '+1과 −1 → 1 : 1(염화 나트륨).' },
      { q: 'K⁺ 와 Cl⁻', a: 'a', why: '+1과 −1 → 1 : 1.' },
      { q: 'Li⁺ 와 F⁻', a: 'a', why: '+1과 −1 → 1 : 1.' },
      { q: 'Mg²⁺ 와 O²⁻', a: 'a', why: '+2와 −2 → 1 : 1(산화 마그네슘).' },
      { q: 'Ca²⁺ 와 O²⁻', a: 'a', why: '+2와 −2 → 1 : 1.' },
      { q: 'Ca²⁺ 와 Cl⁻', a: 'b', why: '+2 하나에 −1 둘 → 1 : 2(염화 칼슘).' },
      { q: 'Mg²⁺ 와 Cl⁻', a: 'b', why: '+2 하나에 −1 둘 → 1 : 2.' },
      { q: 'Ca²⁺ 와 F⁻', a: 'b', why: '+2 하나에 −1 둘 → 1 : 2.' },
      { q: 'Mg²⁺ 와 F⁻', a: 'b', why: '+2 하나에 −1 둘 → 1 : 2.' },
      { q: 'Na⁺ 와 O²⁻', a: 'c', why: '+1 둘에 −2 하나 → 2 : 1.' },
      { q: 'K⁺ 와 O²⁻', a: 'c', why: '+1 둘에 −2 하나 → 2 : 1.' },
      { q: 'Li⁺ 와 O²⁻', a: 'c', why: '+1 둘에 −2 하나 → 2 : 1.' },
    ],
  }));
  part('drill11', (root) => window.Drill.mount(root, [
    { q: '나트륨 원자(2, 8, 1)와 염소 원자(2, 8, 7)가 염화 나트륨을 만들 때 옳은 것만 고른 것은?', box: ['ㄱ. 나트륨은 전자 1개를 잃어 네온과 같은 전자 배치가 된다.', 'ㄴ. 염화 이온은 아르곤과 같은 전자 배치를 한다.', 'ㄷ. 두 원자는 전자쌍을 공유하여 결합한다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '전자를 <b>주고받아</b> 생긴 이온 사이의 정전기적 인력 → 이온 결합(ㄷ ×).' },
    { q: '이온의 기호와 이름이 바르게 짝 지어지지 않은 것은?', opts: ['Na⁺ — 나트륨 이온', 'Cl⁻ — 염화 이온', 'O²⁻ — 산화 이온', 'Mg²⁺ — 마그네슘 이온', 'S²⁻ — 황 이온'], a: 4, why: '음이온은 «~화 이온»: S²⁻은 <b>황화 이온</b>.' },
    { q: '칼슘(Ca, 원자가 전자 2)과 염소(Cl, 원자가 전자 7)가 염화 칼슘을 만들 때 옳은 것만 고른 것은?', box: ['ㄱ. 칼슘 원자는 전자 2개를 잃는다.', 'ㄴ. Ca²⁺ 1개와 Cl⁻ 2개가 결합한다.', 'ㄷ. 염화 칼슘 전체는 (+)전하를 띤다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '(+2) + 2 × (−1) = 0 → 전체는 <b>전기적으로 중성</b>(ㄷ ×).' },
    { q: '마그네슘(전자 배치 2, 8, 2)과 산소(2, 6)가 결합해 산화 마그네슘이 될 때 옳은 것만 고른 것은?', box: ['ㄱ. 마그네슘 원자는 전자 2개를 잃는다.', 'ㄴ. 산소 원자는 전자 2개를 얻는다.', 'ㄷ. 생긴 두 이온의 전자 배치는 모두 아르곤과 같다.'],
      opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: 'Mg²⁺도 O²⁻도 전자 배치가 2, 8 → <b>네온</b>과 같다(ㄷ ×).' },
    { q: '이온 결합에 대해 옳은 것은?',
      opts: ['두 원자가 전자쌍을 함께 가진다.', '같은 전하를 띤 이온끼리 끌어당긴다.', '주로 금속 원소의 원자와 비금속 원소의 원자 사이에 생긴다.', '비금속 원소의 원자끼리 만든다.', '이온이 될 때 원자핵 속 양성자 수가 달라진다.'], a: 2,
      why: '금속 원자는 전자를 잃고 비금속 원자는 얻어, <b>반대 전하</b>를 띤 이온끼리 끌어당긴다. 바뀌는 것은 전자 수뿐.' },
  ]));
  part('sum11', (root) => window.RxT.sum(root));
  part('check11', (root) => { window.LessonParts.mountWrap(root); });
  part('burn11', (r) => window.M34.mount(r, 'burn11'));
  part('pull11', (r) => window.M34.mount(r, 'pull11'));
  part('salt11', (r) => window.M34.mount(r, 'salt11'));
})();
