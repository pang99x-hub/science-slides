/* 2-1-4 2차시 «공유 결합»(교과서 70~71쪽). 차례(7장): 표지(수소 원자 둘) → 체험(공유 결합) → 체험(분자 만들기) → 미니 게임 → 문제로 다지기 → 정리 → 확인. */
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
  cov('share');
  part('covalent', (root) => window.Covalent.mount(root));
  part('molkit', (root) => window.MolKit.mount(root));
  part('game12', (root) => window.EthGame.mount(root, {
    id: 'bond', title: '40초 이온 결합? 공유 결합?', seconds: 40,
    intro: '금속 원소가 들어 있나 보자!<br>«게임 시작»을 누르자',
    endSay: '금속 + 비금속 → 이온 결합, 비금속끼리 → 공유 결합',
    items: [
      { q: '염화 나트륨 NaCl', a: 'i', why: '나트륨(금속) + 염소(비금속) → 이온 결합.' },
      { q: '물 H₂O', a: 'c', why: '수소·산소 모두 비금속 → 공유 결합.' },
      { q: '산소 O₂', a: 'c', why: '산소 원자 둘이 전자쌍 2개를 공유.' },
      { q: '염화 칼슘 CaCl₂', a: 'i', why: '칼슘(금속) Ca²⁺ + 염화 이온 2개.' },
      { q: '이산화 탄소 CO₂', a: 'c', why: '탄소·산소 모두 비금속.' },
      { q: '산화 마그네슘 MgO', a: 'i', why: 'Mg²⁺ + O²⁻ → 이온 결합.' },
      { q: '메테인 CH₄', a: 'c', why: '탄소와 수소가 전자쌍 4개를 공유.' },
      { q: '암모니아 NH₃', a: 'c', why: '질소와 수소 — 비금속끼리.' },
      { q: '염화 칼륨 KCl', a: 'i', why: '칼륨(1족 금속) + 염소.' },
      { q: '플루오린화 수소 HF', a: 'c', why: '수소·플루오린 모두 비금속.' },
      { q: '탄산 칼슘 CaCO₃ (달걀 껍데기)', a: 'i', why: '칼슘 이온 + 탄산 이온 → 이온 결합.' },
      { q: '수산화 마그네슘 Mg(OH)₂ (제산제)', a: 'i', why: '마그네슘 이온 + 수산화 이온.' },
      { q: '뷰테인 C₄H₁₀ (휴대용 가스)', a: 'c', why: '탄소·수소 — 공유 결합 분자.' },
      { q: '설탕 C₁₂H₂₂O₁₁', a: 'c', why: '탄소·수소·산소 — 녹아도 분자 그대로.' },
      { q: '질소 N₂', a: 'c', why: '질소 원자 둘이 전자쌍 3개를 공유(삼중 결합).' },
      { q: '황산 구리(Ⅱ) CuSO₄', a: 'i', why: '구리 이온 Cu²⁺ + 황산 이온 — 수용액에서 전류가 흐른다.' },
      { q: '플루오린화 나트륨 NaF', a: 'i', why: '나트륨(금속) + 플루오린.' },
      { q: '염소 Cl₂', a: 'c', why: '염소 원자 둘이 전자쌍 1개를 공유.' },
      { q: '수용액에서 전류가 흐르는 흰 가루', a: 'i', why: '물에 녹아 이온으로 나뉜다 → 이온 결합 물질.' },
      { q: '수용액에서도 전류가 흐르지 않는 흰 가루', a: 'c', why: '분자로 흩어진다 → 공유 결합 물질(설탕 등).' },
    ],
  }));
  part('drill12', (root) => window.Drill.mount(root, [
    { q: '물 분자(H₂O)에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 공유 전자쌍 수는 2이다.', 'ㄴ. 수소 원자는 헬륨과 같은 전자 배치를 한다.', 'ㄷ. 산소 원자는 전자 2개를 잃어 네온과 같은 전자 배치가 된다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '산소는 수소와 전자쌍을 <b>공유</b>해 바깥 껍질을 8개로 채운다(ㄷ ×).' },
    { q: '두 원자 사이에 공유 전자쌍이 3개인 삼중 결합이 있는 분자는?', opts: ['H₂', 'HF', 'O₂', 'N₂', 'H₂O'], a: 3, why: '질소(원자가 전자 5)는 3개씩 내놓아 <b>전자쌍 3개</b>를 공유한다. O₂는 이중 결합.' },
    { q: '이온 결합으로 이루어진 물질만 고른 것은?', box: ['ㄱ. 염화 칼슘(CaCl₂)', 'ㄴ. 이산화 탄소(CO₂)', 'ㄷ. 산화 마그네슘(MgO)'], opts: ['ㄱ', 'ㄴ', 'ㄱ, ㄷ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '금속(칼슘·마그네슘)이 든 것이 이온 결합. CO₂는 비금속끼리 → 공유 결합.' },
    { q: '공유 결합에 대해 옳은 것은?',
      opts: ['주로 금속 원소와 비금속 원소 사이에 생긴다.', '비금속 원소의 원자들이 전자쌍을 함께 가져 생긴다.', '한 원자가 다른 원자에게 전자를 완전히 넘겨준다.', '결합하면 양이온과 음이온이 생긴다.', '18족 원소의 원자끼리 잘 만든다.'], a: 1,
      why: '전자를 주고받지 않고 <b>쌍으로 함께</b> 가진다 → 이온이 생기지 않는다.' },
    { q: '산소 분자(O₂)에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 두 산소 원자는 전자쌍 2개를 공유한다.', 'ㄴ. 결합한 뒤 각 산소 원자는 네온과 같은 전자 배치를 이룬다.', 'ㄷ. 한 산소 원자가 다른 산소 원자에게 전자 2개를 넘겨준다.'],
      opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '원자가 전자 6개 + 함께 가진 전자 → 8개(네온). 넘겨주는 것이 아니라 <b>공유</b>(ㄷ ×).' },
  ]));
  part('sum12', (root) => window.RxT.sum(root));
  part('check12', (root) => { window.LessonParts.mountWrap(root); });
  part('zoom12', (r) => window.M34.mount(r, 'zoom12'));
  part('count12', (r) => window.M34.mount(r, 'count12'));
  part('butane12', (r) => window.M34.mount(r, 'butane12'));
})();
