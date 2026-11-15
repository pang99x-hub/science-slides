/* 1-2-3 1차시 「에너지를 흡수하거나 방출하는 현상」(교과서 54~55쪽).
   차례(2026-10-31 승인 틀 + 중복 줄이기 + 재미 요소): 표지(예측 걸기) → 이론(방출·흡수와 주변 온도, 먼저 보기 영상 + Manim) → 체험(해 보기 젓기)
   → 이론(상태 변화, 먼저 보기 + Manim) → 체험(온도계 대기) → 이론(화학 변화, 먼저 보기 + 3D) → 체험(에너지 계단) → 미니 게임(빠르게 고르기)
   → 정리(뒤집기 카드) → 확인(사건 해결). 예측(.share-opts)·확인 ○×(.qs)는 수업방 응답 모으기가 그대로 읽는다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const merge = window.EAMerge;
  part('cover', (root) => merge(window.DryIce.mount(root), window.EAPred(root, { ans: 'heat', anim: 'di', bind: false })));
  part('theo1', (root) => merge(window.ABVStep.mount(root), window.EAFirst(root)));
  part('thermo', (root) => { const m = window.StirLab.mount(root); window.EAWatch(root, '.st-now', (t) => (t.startsWith('③') ? 0 : null)); return m; });
  part('theo2', (root) => merge(window.ABVStep.mount(root), window.EAFirst(root)));
  part('probe', (root) => { const m = window.ProbeScenes.mount(root); window.EAWatch(root, '.pb-now'); return m; });
  part('chem3d', (root) => merge(window.RxMol.mount(root, window.EAScenes.chem()), window.EAFirst(root)));
  part('ladder', (root) => {
    const m = window.EnergyLadder.mount(root);
    window.EAWatch(root, '.ld-now', (t) => {
      if (root.querySelectorAll('.ea-ld-done > *').length >= 3 || t.startsWith('여덟')) return 0;
      if (t.includes('열 알갱이')) return 3;
      if (t.startsWith('물질을 끌어')) return 2;
      if (t.startsWith('다른 변화')) return 1;
      return null;
    });
    return m;
  });
  part('game1', (root) => {
    const g = window.EAGame.mount(root, {
      id: 'l1', seconds: 40, title: '방출? 흡수? 40초',
      intro: '카드에 나온 변화는 에너지를 방출할까, 흡수할까?<br><small>«게임 시작»을 누르면 40초가 흐른다</small>',
      endSay: '헷갈린 카드는 «주변 온도가 오르나 내리나»로 다시 따져 보자',
      items: [
        { q: '가스레인지에서 뷰테인이 탄다', a: 'out', why: '연료가 타면 열과 빛을 내놓는다 → 방출' },
        { q: '철 수세미가 공기 속에서 녹슨다', a: 'out', why: '철이 산소와 천천히 반응하며 열을 내놓는다 → 방출' },
        { q: '반딧불이의 꽁무니가 빛난다', a: 'out', why: '몸속 반응이 빛 에너지를 내놓는다 → 방출' },
        { q: '염화 칼슘이 물에 녹는다', a: 'out', why: '해 보기 (나): 20 °C → 25 °C, 주변이 따뜻해졌다 → 방출' },
        { q: '이글루 안쪽에 뿌린 물이 언다', a: 'out', why: '응고는 열을 내놓는다 → 안이 따뜻해진다' },
        { q: '소나기 전, 수증기가 물방울로 바뀐다', a: 'out', why: '액화는 열을 내놓는다 → 후덥지근해진다' },
        { q: '산화 칼슘에 물을 붓는다', a: 'out', why: '물과 반응하며 많은 열을 내놓는다 → 방출(3차시 탐구)' },
        { q: '염산에 수산화 나트륨 용액을 부어 섞는다', a: 'out', why: '중화 반응은 열을 내놓는다 → 방출' },
        { q: '추운 아침 유리창에 서리가 생긴다', a: 'out', why: '수증기가 곧바로 얼음이 되는 승화는 방출' },
        { q: '손에 바른 소독제가 날아간다', a: 'in', why: '알코올이 증발하며 손의 열을 가져간다 → 흡수' },
        { q: '빵 반죽 속 탄산수소 나트륨이 오븐에서 분해된다', a: 'in', why: '열을 받아 분해되고 기체가 생겨 빵이 부푼다 → 흡수' },
        { q: '음료 속 얼음이 녹는다', a: 'in', why: '융해는 열을 가져간다 → 음료가 시원해진다' },
        { q: '드라이아이스가 기체로 바뀐다', a: 'in', why: '고체 → 기체 승화는 열을 가져간다 → 흡수' },
        { q: '수산화 바륨과 염화 암모늄이 반응한다', a: 'in', why: '해 보기 (가): 20 °C → 16 °C → 흡수' },
        { q: '질산 암모늄이 물에 녹는다', a: 'in', why: '녹으며 물의 열을 가져간다 → 흡수(냉찜질 팩)' },
        { q: '더운 날 피부의 땀이 마른다', a: 'in', why: '증발(기화)하며 몸의 열을 가져간다 → 흡수' },
      ],
    });
    window.EAWatch(root, '.eg-now');
    return g;
  });
  part('sum1', (root) => window.RxT.sum(root));
  part('check1', (root) => { window.LessonParts.mountWrap(root); });
})();
