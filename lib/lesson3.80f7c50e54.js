/* 1-2-3 3차시 「탐구: 물과 산화 칼슘으로 음식 조리하기」(교과서 58~59쪽).
   차례(2026-10-31 승인 틀 + 중복 줄이기 + 재미 요소): 표지(예측 걸기·사건 «산에서 라면») → 이론(산화 칼슘과 물, 먼저 보기 + 3D) → 체험(안전)
   → 체험(장치하고 재기) → 설명(그래프 읽기, Manim) → 미니 게임(발열 도시락 설계 챌린지) → 정리(뒤집기 카드) → 확인(사건 해결).
   온도 곡선은 limemodel.js의 모형(교과서 예시 결과에 맞춤). */
(function () {
  'use strict';
  const { part } = window.Deck;
  const merge = window.EAMerge;
  part('cover', (root) => merge(window.LunchBox.mount(root), window.EAPred(root, { ans: 'lime', anim: 'lb', bind: false })));
  part('lime3d', (root) => merge(window.RxMol.mount(root, window.EAScenes.lime()), window.EAFirst(root)));
  part('safety', (root) => { const m = window.LabSafety.mount(root); window.EAWatch(root, '.sf-now', (t) => (t.startsWith('③') ? 0 : null)); return m; });
  part('setup', (root) => { const m = window.LimeSetup.mount(root); window.EAWatch(root, '.su-now', (t) => (t.startsWith('④') ? 0 : null)); return m; });
  part('graph', (root) => window.ABVStep.mount(root));
  part('design', (root) => {
    const m = window.LimeDesign.mount(root);
    window.EAChall(root);
    window.EAWatch(root, '.de-now', (t, c) => (c.classList.contains('done') ? 0 : t.startsWith('조리 중') ? 2 : t.startsWith('장치를 고쳐') ? 3 : null));
    return m;
  });
  part('sum3', (root) => window.RxT.sum(root));
  part('check3', (root) => { window.LessonParts.mountWrap(root); });
})();
