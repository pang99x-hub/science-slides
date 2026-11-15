/* 3-1-2 3차시 「지진과 지구시스템」(교과서 116~121쪽 + 참고서 143~144쪽): 장마다 조각을 붙인다.
   차례(10장): 표지(퍼져 나가는 흔들림) → 이론(지진과 지구시스템) → 체험(지진 해일) → 체험(흔들려도 버티는 건물)
   → 체험(실제 사례 넷, 해 보기 116쪽) → 체험(투명 용기 속 작은 지구, 창의력 키움 121쪽) → 미니 게임 → 문제로 다지기
   → 정리(단원 전체) → 확인. 옛 2차시에서 나눠 옴. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const J = (m, root) => window.EthTrack.join(m, window.L1.frame(root));
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  part('cover', (root) => {
    const m = window.Cov.mount(root, 'quake');
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector('#pr-i').classList.toggle('answer', on);
    return { fit: m.fit, setActive: m.setActive, fragment(f, on) { if (f.dataset.anim === 'au') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="au"]'); answer(!!f && f.classList.contains('visible')); } };
  });
  part('qttheory', (root) => window.RxT.stepper(root));
  part('tsunami', (root) => J(window.Tsunami.mount(root), root));
  part('shake', (root) => J(window.Shake.mount(root), root));
  part('cases', (root) => window.Cases.mount(root));
  part('terra', (root) => window.Terra.mount(root));
  part('game4', (root) => window.EthGame.mount(root, {
    id: 'geochg', title: '40초 피해일까, 이용일까?', seconds: 40,
    intro: '해를 끼칠까, 쓸모가 있을까, 막아 줄까?<br>«게임 시작»을 누르자',
    endSay: '무너지고 덮치면 피해 · 땅·열·지진파를 쓰면 이용 · 미리 막고 알리면 대비',
    items: [
      { q: '화산재가 햇빛을 가려 농작물이 덜 자란다', a: 'harm', why: '기권을 거친 피해.' },
      { q: '화산 가스가 녹은 산성비', a: 'harm', why: '숲과 생물에 해롭다.' },
      { q: '용암이 마을과 숲을 덮친다', a: 'harm', why: '지권·생물권 피해.' },
      { q: '화산재 때문에 비행기가 뜨지 못한다', a: 'harm', why: '사회 경제적 피해.' },
      { q: '해저 지진으로 생긴 지진 해일', a: 'harm', why: '해안을 덮친다.' },
      { q: '지진 뒤 끊어진 전선에서 난 불', a: 'harm', why: '간접 피해.' },
      { q: '화산재가 풍화되어 생긴 비옥한 흙', a: 'use', why: '농사가 잘된다.' },
      { q: '화산 지대의 온천', a: 'use', why: '데워진 지하수.' },
      { q: '지열 발전', a: 'use', why: '땅속 열로 전기를 만든다.' },
      { q: '화산 지형 관광지(예: 제주 성산 일출봉)', a: 'use', why: '독특한 지형을 관광 자원으로.' },
      { q: '지진파로 지구 속 구조를 알아낸다', a: 'use', why: '117쪽 ➋.' },
      { q: '인공 지진으로 석유·가스를 찾는다', a: 'use', why: '지하자원 탐사.' },
      { q: '건물에 내진 설계를 한다', a: 'guard', why: '흔들려도 버티게.' },
      { q: '먼저 오는 약한 지진파를 잡아 경보를 울린다', a: 'guard', why: '강한 흔들림 전에 알린다.' },
      { q: '해안에 해일 경보 시스템을 둔다', a: 'guard', why: '대피 시간을 번다.' },
      { q: '화산 주변 땅의 부풂·가스·지진 횟수를 감시한다', a: 'guard', why: '분출 시점을 미리 짐작.' },
      { q: '용암이 마을을 비켜 가도록 수로와 제방을 만든다', a: 'guard', why: '흐름을 돌린다.' },
      { q: '화산 반대편 언덕에 대피소를 짓는다', a: 'guard', why: '피할 곳을 미리.' },
    ],
  }));
  part('drill6', (root) => window.Drill.mount(root, [
    { q: '지진의 영향을 설명한 것 중 틀린 것은?', opts: ['건물과 도로가 무너질 수 있다.', '산사태나 화재 같은 간접 피해도 생긴다.', '해저 지진은 지진 해일을 일으킬 수 있다.', '지진파로 지구 내부 구조를 알 수 있다.', '지진은 지구 내부 에너지와 관계없다.'], a: 4, why: '지진은 지구 내부 에너지가 지표로 나오는 현상.' },
    { q: '지진·화산 피해를 줄이는 방법으로 알맞지 않은 것은?', opts: ['건물에 내진 설계를 한다.', '지진 경보 체계를 갖춘다.', '화산 주변의 지진 횟수·땅 부풂을 감시한다.', '용암 흐름을 돌릴 수로를 만든다.', '단층 바로 위에 큰 건물을 몰아 짓는다.'], a: 4, why: '약한 지반·활발한 단층 위는 <b>피한다</b>.' },
    { q: '지진·화산을 설명한 것 중 틀린 것은?(단원 복습)', opts: ['화산 가스가 녹아든 비는 산성을 띤다.', '지진파를 읽어 땅속 깊은 곳의 모습을 알아낸다.', '화산이 자주 터지는 곳에는 지진이 전혀 없다.', '지진·화산은 땅속 에너지가 겉으로 나오는 현상이다.', '오래 풍화된 화산재는 기름진 흙이 된다.'], a: 2, why: '화산이 터지는 곳에서는 보통 <b>지진도 함께</b> 난다.' },
    { q: '기권의 네 층을 설명한 것 중 틀린 것은?(단원 복습)', opts: ['대류권에서 기상 현상이 일어난다.', '성층권에 오존층이 있다.', '중간권에서는 대류가 일어난다.', '열권은 낮과 밤의 기온 차가 크다.', '대류권과 중간권은 모두 안정한 층이다.'], a: 4, why: '대류권·중간권은 아래가 따뜻해 <b>불안정</b>(대류). 안정한 층은 성층권.' },
    { q: '물의 순환에 대해 옳은 것만 고른 것은?(단원 복습)', box: ['ㄱ. 땅속 열이 주된 힘이다.', 'ㄴ. 흐르는 강물이 골짜기를 깎는 것은 수권–지권 사이의 일이다.', 'ㄷ. 수증기는 응결할 때 에너지를 내놓는다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 3, why: '물의 순환은 <b>태양 에너지</b>(ㄱ ×).' },
    { q: '판의 경계를 설명한 것 중 틀린 것은?(단원 복습)', opts: ['발산형 경계에서 새 해양 지각이 생긴다.', '보존형 경계에서는 판이 생기지도 없어지지도 않는다.', '해양판과 대륙판이 만나면 해양판이 아래로 들어간다.', '해구는 수렴형 경계에서 생긴다.', '해구는 발산형 경계에서 생긴다.'], a: 4, why: '발산형은 해령·열곡대, 해구는 <b>수렴형</b>.' },
    { q: '옳은 것만 고른 것은?(중단원 마무리 119쪽 변형)', box: ['ㄱ. 생물이 숨을 쉬면 몸속 탄소가 공기 중으로 나간다.', 'ㄴ. 바다의 해류는 주로 땅과 바다가 서로 영향을 주어 생긴다.', 'ㄷ. 히말라야는 두 판이 가까워지는 곳에서 솟았다.'], opts: ['ㄱ', 'ㄴ', 'ㄱ, ㄷ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '해류는 바람이 일으킨다 — <b>기권과 수권</b>(ㄴ ×).' },
  ]));
  part('sum6', (root) => window.RxT.sum(root));
  part('check6', (root) => { window.LessonParts.mountWrap(root); });
})();
