/* 1-2-3 2차시 「에너지의 흡수와 방출 이용」(교과서 56~57쪽).
   차례(2026-10-31 승인 틀 + 중복 줄이기 + 재미 요소): 표지(예측 걸기·사건) → 이론(생활 속 이용, 사진) → 체험(소화기·용접) → 설명(에너지 그림, Manim)
   → 체험(냉매 한 바퀴) → 이론(자연, 사진) → 체험(바다·구름·나무·치타) → 미니 게임(에너지 처방) → 정리(뒤집기 카드) → 확인(사건 해결). */
(function () {
  'use strict';
  const { part } = window.Deck;
  const merge = window.EAMerge;
  part('cover', (root) => merge(window.HandPacks.mount(root), window.EAPred(root, { ans: 'dissolve', anim: 'hw', bind: false })));
  part('use', (root) => window.ABGal(root));
  part('fireweld', (root) => { const m = window.FireWeld.mount(root); window.EAWatch(root, '.fw-now', (t) => (t.startsWith('③') ? 0 : null)); return m; });
  part('ediag', (root) => window.ABVStep.mount(root));
  part('fridge', (root) => { const m = window.FridgeLoop.mount(root); window.EAWatch(root, '.fr-now', (t) => (t.startsWith('③') ? 0 : null)); return m; });
  part('nat', (root) => window.ABGal(root));
  part('nature', (root) => { const m = window.NatureCycle.mount(root); window.EAWatch(root, '.na-now', (t) => (t.startsWith('④') ? 0 : null)); return m; });
  part('game2', (root) => {
    const g = window.EAGame.mount(root, {
      id: 'l2', seconds: 45, title: '에너지 처방 게임',
      intro: '상황을 읽고 무엇을 쓸지 골라라<br><small>데우려면 방출, 식히려면 흡수</small>',
      endSay: '같은 물이라도 얼리면 데우고, 증발시키면 식힌다',
      items: [
        { q: '축구하다 발목을 삐어 퉁퉁 부었다', a: 'cold', why: '부은 곳은 식혀야 한다 → 녹으며 열을 흡수하는 냉찜질 팩' },
        { q: '겨울 등굣길, 손가락이 꽁꽁 얼었다', a: 'warm', why: '철 가루가 산소와 반응하며 열을 방출하는 손난로' },
        { q: '불을 쓸 수 없는 산 대피소에서 밥을 데우고 싶다', a: 'lime', why: '산화 칼슘과 물이 반응하며 방출하는 열로 데운다' },
        { q: '꽃이 핀 과수원에 새벽 서리가 예보됐다', a: 'water', why: '뿌린 물이 얼며(응고) 열을 방출해 꽃을 지킨다' },
        { q: '한여름 뜨겁게 달궈진 마당을 식히고 싶다', a: 'water', why: '뿌린 물이 증발(기화)하며 열을 흡수한다' },
        { q: '열이 올라 이마가 뜨겁다', a: 'cold', why: '열을 흡수해 식히는 냉찜질 팩' },
        { q: '캠핑장에 전기도 불도 없는데 컵라면을 먹고 싶다', a: 'lime', why: '발열팩에 물을 부어 방출하는 열로 물을 데운다' },
        { q: '눈 오는 날 경기장 관중석에서 오래 앉아 있다', a: 'warm', why: '흔들면 몇 시간 동안 열을 방출하는 손난로' },
        { q: '눈 집 이글루 안을 조금 덜 춥게 하고 싶다', a: 'water', why: '안쪽에 뿌린 물이 얼며 열을 방출한다' },
        { q: '운동 뒤 근육이 화끈거리고 붓는다', a: 'cold', why: '흡수하는 냉찜질 팩으로 식힌다' },
        { q: '찬 도시락을 전자레인지 없이 따뜻하게 먹고 싶다', a: 'lime', why: '발열 도시락: 물과 산화 칼슘 반응 → 방출' },
        { q: '겨울 낚시터, 장갑 속 손이 시리다', a: 'warm', why: '손난로: 철이 천천히 녹슬며 방출' },
      ],
    });
    window.EAWatch(root, '.eg-now');
    return g;
  });
  part('sum2', (root) => window.RxT.sum(root));
  part('check2', (root) => { window.LessonParts.mountWrap(root); });
})();
