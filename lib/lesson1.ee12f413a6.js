/* 2-2-1 1차시 «규산염 광물»(교과서 78~81쪽 + 참고서 88~93쪽): 장마다 조각을 붙인다.
   차례(11장): 표지(같은 블록 다른 구조, 사건 파일 9) → 이론(지각과 생명체의 원소) → 이론(기본 단위체·암석과 광물 사진)
   → 체험(3D 규산염 사면체) → 체험(사면체 이어 붙이기, 해 보기 80쪽) → 체험(3D 규산염 광물 다섯 구조) → 체험(망치와 비바람)
   → 미니 게임 → 문제로 다지기 → 정리 → 확인. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  part('cover', (root) => {
    const bk = window.Blocks.mount(root);
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector('#pr-q').classList.toggle('answer', on);
    return { fit: bk.fit, setActive: bk.setActive, fragment(f, on) { if (f.dataset.anim === 'bk') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="bk"]'); answer(!!f && f.classList.contains('visible')); } };
  });
  part('crust', (root) => window.Crust.mount(root));
  part('unitbase', window.EthTrack.theory);
  part('sitheory', (root) => window.RxT.stepper(root));
  part('sio4', (root) => window.SiO4.mount(root));
  part('link', (root) => window.Link.mount(root));
  part('mineral3d', (root) => window.Mineral3D.mount(root));
  part('weather', (root) => window.EthTrack.join(window.Weather.mount(root), window.L1.frame(root)));
  part('game1', (root) => window.EthGame.mount(root, {
    id: 'silicate', title: '40초 어떤 구조?', seconds: 40,
    intro: '사면체가 어떻게 이어졌을까?<br>«게임 시작»을 누르자',
    endSay: '감람석 홀로 · 휘석 한 줄 · 각섬석 두 줄 · 흑운모 판 · 장석·석영 그물',
    items: [
      { q: '감람석', a: 'ind', why: '사면체가 따로따로, 사이를 철·마그네슘 이온이 잇는다.' },
      { q: '휘석', a: 'sin', why: '사면체가 산소 둘을 나누며 한 줄로.' },
      { q: '각섬석', a: 'dou', why: '한 줄 사슬 둘이 나란히 이어진 두 줄.' },
      { q: '흑운모', a: 'she', why: '산소 셋을 나누며 얇은 판으로.' },
      { q: '석영', a: 'net', why: '산소 넷을 모두 나눠 입체 그물.' },
      { q: '장석', a: 'net', why: '석영처럼 입체 그물(일부 규소 자리에 알루미늄).' },
      { q: '사면체끼리 나누는 산소 0개', a: 'ind', why: '나누지 않고 양이온과 결합 → 독립형.' },
      { q: '사면체끼리 나누는 산소 4개', a: 'net', why: '꼭짓점을 모두 나눔 → 망상.' },
      { q: '사면체끼리 나누는 산소 3개', a: 'she', why: '바닥의 세 산소를 나눔 → 판상.' },
      { q: '얇게 한 방향으로 벗겨지는 검은 광물', a: 'she', why: '판과 판 사이가 약해 한 방향으로 쪼개진다(흑운모).' },
      { q: '바닷가 모래의 대부분', a: 'net', why: '풍화에 가장 강한 석영 → 망상.' },
      { q: '규소 : 산소 = 1 : 4', a: 'ind', why: '사면체 하나 그대로(SiO₄).' },
      { q: '규소 : 산소 = 1 : 2', a: 'net', why: '산소를 모두 나누면 SiO₂ — 석영.' },
      { q: '기둥 모양 결정, 한 줄 사슬', a: 'sin', why: '휘석.' },
      { q: '기둥 모양 결정, 두 줄 사슬', a: 'dou', why: '각섬석.' },
      { q: '풍화에 가장 약한 쪽', a: 'ind', why: '나누는 산소가 없어 가장 먼저 부서진다(감람석).' },
      { q: '올리브색 보석으로도 쓰는 광물', a: 'ind', why: '감람석(페리도트).' },
      { q: '육각기둥 모양 투명한 결정', a: 'net', why: '석영 — 산소 넷을 모두 나눈다.' },
    ],
  }));
  part('drill1', (root) => window.Drill.mount(root, [
    { q: '지각과 사람 몸을 이루는 원소(질량비)에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 두 곳 모두 산소가 가장 많다.', 'ㄴ. 지각에서 두 번째로 많은 원소는 규소이다.', 'ㄷ. 사람 몸에서 두 번째로 많은 원소는 수소이다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '사람 몸에서 두 번째는 <b>탄소</b>(탄소 화합물이 뼈대).' },
    { q: '지각을 이루는 물질을 큰 것부터 작은 것 순서로 바르게 늘어놓은 것은?', opts: ['지각 → 광물 → 암석 → 규산염 사면체', '지각 → 암석 → 광물 → 규산염 사면체', '지각 → 규산염 사면체 → 광물 → 암석', '암석 → 지각 → 광물 → 규산염 사면체', '광물 → 암석 → 지각 → 규산염 사면체'], a: 1, why: '지각을 쪼개면 <b>암석</b>, 암석을 쪼개면 <b>광물</b>, 광물 속에는 사면체의 반복.' },
    { q: '규산염 사면체에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 가운데 규소 1개, 꼭짓점에 산소 4개가 있다.', 'ㄴ. 규소는 원자가 전자가 4개라 산소 넷과 결합할 수 있다.', 'ㄷ. 사면체 전체는 전기적으로 중성이다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '사면체는 <b>음전하</b>를 띤다 — 그래서 양이온과 결합하거나 산소를 나눈다.' },
    { q: '규산염 사면체끼리 결합할 때 함께 쓰는 원자는?', opts: ['규소', '산소', '알루미늄', '철', '탄소'], a: 1, why: '꼭짓점의 <b>산소</b>를 함께 쓴다. 규소끼리는 붙지 않는다.' },
    { q: '광물과 결합 구조의 짝으로 옳지 않은 것은?', opts: ['감람석 — 독립형', '휘석 — 단사슬', '각섬석 — 복사슬', '흑운모 — 망상', '석영 — 망상'], a: 3, why: '흑운모는 <b>판상</b> 구조.' },
    { q: '규산염 광물의 구조와 성질에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 사면체끼리 나누는 산소가 많을수록 구조가 복잡하다.', 'ㄴ. 구조가 복잡할수록 풍화에 약하다.', 'ㄷ. 흑운모는 판과 판 사이를 따라 한 방향으로 얇게 쪼개진다.'], opts: ['ㄱ', 'ㄴ', 'ㄱ, ㄷ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '나누는 산소가 많고 복잡할수록 <b>풍화에 강하다</b>(ㄴ ×).' },
    { q: '사면체가 산소를 하나도 나누지 않으면 규소 : 산소 = 1 : 4이다. 산소 넷을 모두 나누는 석영의 규소 : 산소는?', opts: ['1 : 1', '1 : 2', '1 : 3', '1 : 4', '2 : 5'], a: 1, why: '꼭짓점 산소 하나를 사면체 둘이 반씩 쓴다 → 4 × ½ = 2, <b>SiO₂</b>.' },
    { q: '지각에 많은 산소·규소·철이 처음 만들어진 곳으로 옳은 것은?', opts: ['빅뱅 직후 우주', '별 속 핵융합', '지구의 마그마 바다', '바닷속 화산', '초신성 폭발에서만'], a: 1, why: '수소·헬륨은 빅뱅, 산소~철은 <b>별 속 핵융합</b>(2-1 단원).' },
    { q: '바닷가 모래가 대부분 석영 알갱이인 까닭으로 가장 알맞은 것은?', opts: ['석영이 바닷물에서 새로 생기기 때문', '석영이 산소를 모두 나눠 풍화에 가장 강하기 때문', '석영이 가장 무거워 가라앉기 때문', '석영만 물에 녹지 않는 금속이기 때문', '석영이 판상 구조라 잘 쪼개지기 때문'], a: 1, why: '다른 광물이 먼저 부서지고 <b>풍화에 강한 석영</b>이 남는다.' },
  ]));
  part('sum1', (root) => window.RxT.sum(root));
  part('check1', (root) => { window.LessonParts.mountWrap(root); });
})();
