/* 3-1-1 2차시 «에너지 흐름과 물질 순환»(교과서 108~111쪽 + 참고서 126~131쪽): 장마다 조각을 붙인다.
   차례(13장): 표지(물방울 여행, 사건 파일 14) → 이론(에너지원) → 체험(어떤 에너지가 일으킬까?) → 이론(물의 순환)
   → 체험(물의 순환과 지형, 해 보기 108쪽) → 이론(탄소의 순환) → 체험(탄소 원자의 여행) → 체험(어느 권역 사이?)
   → 이론(균형이 깨지면, 해 보기 111쪽) → 미니 게임 → 문제로 다지기 → 정리 → 확인. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const J = (m, root) => window.EthTrack.join(m, window.L1.frame(root));
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  part('cover', (root) => {
    const dr = window.Drop.mount(root);
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector('#pr-r').classList.toggle('answer', on);
    return { fit: dr.fit, setActive: dr.setActive, fragment(f, on) { if (f.dataset.anim === 'dr2') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="dr2"]'); answer(!!f && f.classList.contains('visible')); } };
  });
  part('egtheory', (root) => window.RxT.stepper(root));
  part('energy', (root) => J(window.Energy.mount(root), root));
  part('watheory', (root) => window.RxT.stepper(root));
  part('wcycle', (root) => J(window.WCycle.mount(root), root));
  part('catheory', (root) => window.RxT.stepper(root));
  part('carbon', (root) => window.Carbon.mount(root));
  part('inter', (root) => window.Inter.mount(root));
  part('balance', (root) => window.Balance.mount(root));
  part('game2', (root) => window.EthGame.mount(root, {
    id: 'esrc', title: '40초 어떤 에너지가 일으킬까?', seconds: 40,
    intro: '해·땅속·달 가운데 하나!<br>«게임 시작»을 누르자',
    endSay: '날씨·순환·광합성은 태양 · 지진·화산·판은 지구 내부 · 밀물·썰물은 조력',
    items: [
      { q: '비·눈·바람 같은 날씨 변화', a: 'sun', why: '대기를 데우고 움직이는 태양 에너지.' },
      { q: '태풍', a: 'sun', why: '따뜻한 바다의 수증기 — 태양 에너지.' },
      { q: '표층 해류', a: 'sun', why: '바람이 일으키고, 바람은 태양 에너지로.' },
      { q: '식물의 광합성', a: 'sun', why: '햇빛을 써서 양분을 만든다.' },
      { q: '물의 순환', a: 'sun', why: '증발을 일으키는 태양 에너지.' },
      { q: '사막의 모래바람', a: 'sun', why: '바람 — 태양 에너지.' },
      { q: '지진', a: 'in', why: '판을 움직이는 지구 내부 에너지.' },
      { q: '화산 활동', a: 'in', why: '땅속 마그마 — 지구 내부 에너지.' },
      { q: '맨틀 대류', a: 'in', why: '지구 속 열이 맨틀을 천천히 돌린다.' },
      { q: '대륙의 이동', a: 'in', why: '판의 움직임 — 지구 내부 에너지.' },
      { q: '히말라야 같은 높은 산맥이 솟음', a: 'in', why: '판이 부딪쳐 — 지구 내부 에너지.' },
      { q: '온천과 지열 발전', a: 'in', why: '땅속의 열.' },
      { q: '밀물과 썰물', a: 'tide', why: '달·태양이 바닷물을 끌어당김.' },
      { q: '갯벌이 드러났다 잠김', a: 'tide', why: '하루 두 번 바닷물 높이가 바뀜 — 조력.' },
      { q: '조력 발전소의 수차가 돈다', a: 'tide', why: '밀물·썰물의 흐름.' },
      { q: '하루 두 번 해수면이 오르내림', a: 'tide', why: '조석 — 조력 에너지.' },
      { q: '구름이 비를 뿌린 뒤 강이 계곡을 깎음', a: 'sun', why: '물의 순환 — 태양 에너지.' },
      { q: '가장 많은 양을 차지하는 에너지원', a: 'sun', why: '태양 에너지가 압도적으로 크다.' },
    ],
  }));
  part('drill2', (root) => window.Drill.mount(root, [
    { q: '지구시스템의 에너지원에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 태양 에너지가 가장 많은 양을 차지한다.', 'ㄴ. 지구 내부 에너지는 지진과 화산 활동을 일으킨다.', 'ㄷ. 공기를 돌게 하는 힘은 주로 조력 에너지에서 온다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '대기 순환은 <b>태양 에너지</b>. 조력은 밀물·썰물.' },
    { q: '지구시스템의 에너지원에 대한 설명으로 옳지 않은 것은?', opts: ['태양 에너지는 태양 속 핵융합에서 나온다.', '지구 내부 에너지는 판을 움직이고 화산을 일으킨다.', '조력 에너지는 달의 몫이 태양의 몫보다 크다.', '세 에너지원 가운데 태양 에너지가 가장 크다.', '태양 에너지가 땅속에 쌓이면 지구 내부 에너지로 바뀐다.'], a: 4, why: '에너지원끼리는 <b>서로 바뀌지 않는다</b>. 조력은 더 가까운 달의 영향이 크다.' },
    { q: '물의 순환에서 물이 에너지를 흡수하는 과정은?', opts: ['수증기가 응결해 구름이 될 때', '바닷물이 증발할 때', '구름에서 비가 내릴 때', '강물이 바다로 흘러갈 때', '지하수가 땅속을 흐를 때'], a: 1, why: '증발할 때 <b>흡수</b>, 응결할 때 방출.' },
    { q: '물수지 평형에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 육지·바다·대기가 각각 들어오는 물과 나가는 물의 양이 같다.', 'ㄴ. 바다는 강수량보다 증발량이 많고, 모자란 만큼 강물로 채워진다.', 'ㄷ. 육지는 증발량이 강수량보다 많아 점점 말라 간다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '육지는 <b>강수량이 더 많고</b>, 남는 물이 강으로 바다에 간다(ㄷ ×).' },
    { q: '권역과 탄소가 있는 모습의 짝으로 옳지 않은 것은?', opts: ['기권 — 이산화 탄소', '수권 — 탄산 이온', '지권 — 석회암·화석 연료', '생물권 — 유기물', '기권 — 석회암'], a: 4, why: '석회암은 <b>지권</b>.' },
    { q: '탄소의 이동 경로로 옳은 것만 고른 것은?', box: ['ㄱ. 광합성: 기권 → 생물권', 'ㄴ. 화석 연료의 연소: 지권 → 기권', 'ㄷ. 호흡: 기권 → 생물권'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '호흡은 생물권 → <b>기권</b>(ㄷ ×).' },
    { q: '화석 연료를 많이 태울 때 나타나는 변화로 옳지 않은 것은?', opts: ['기권의 이산화 탄소가 늘어난다.', '바다에 녹는 이산화 탄소가 늘어난다.', '지구의 평균 기온이 오른다.', '지권의 화석 연료 탄소가 줄어든다.', '지구 전체의 탄소 총량이 크게 늘어난다.'], a: 4, why: '총량은 <b>일정</b> — 권역 사이에서 자리만 옮긴다.' },
    { q: '상호작용하는 권역의 짝으로 옳은 것은?', opts: ['파도가 해안 절벽을 깎음 — 기권과 생물권', '오로라가 빛남 — 외권과 기권', '바람이 해류를 일으킴 — 지권과 수권', '화산재가 하늘을 덮음 — 수권과 생물권', '식물 뿌리가 바위를 쪼갬 — 기권과 수권'], a: 1, why: '태양풍 입자가 대기와 부딪쳐 빛난다 — <b>외권–기권</b>. 파도·절벽은 수권–지권, 바람·해류는 기권–수권, 화산재는 지권–기권, 뿌리·바위는 생물권–지권.' },
    { q: '지구시스템의 균형에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 한 권역의 변화는 다른 권역에 잇따라 영향을 준다.', 'ㄴ. 인간 활동은 지구시스템의 균형에 영향을 주지 않는다.', 'ㄷ. 북극해 얼음 면적이 줄어드는 것은 균형이 흔들린 예이다.'], opts: ['ㄱ', 'ㄴ', 'ㄱ, ㄷ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '온난화·오존층 파괴처럼 인간 활동이 균형을 흔든다(ㄴ ×).' },
  ]));
  part('sum2', (root) => window.RxT.sum(root));
  part('check2', (root) => { window.LessonParts.mountWrap(root); });
})();
