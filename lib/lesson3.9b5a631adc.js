/* 1-1-2 3차시 「진화와 생물다양성」(교과서 24~25·32쪽): 장마다 조각을 붙인다.
   차례(2026-10-30 승인 기준으로 다시 짬): 표지 → 설명(다윈과 비글호) → 설명(자연선택설, Manim) → 체험(세월 바퀴) → 설명(기린, 두 설명)
   → 설명(갈라파고스 3D 섬 지도) → 설명(3D 핀치 머리) → 체험(씨앗 곡선) → 설명(종 분화, Manim) → 체험(섬으로 날리기) → 정리 → 확인.
   예측(.share-opts)·확인 ○×(.qs)는 수업방 응답 모으기가 그대로 읽는다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const K = window.EvKit;
  part('cover', (root) => {
    window.EvLens.mount(root);
    const btns = [...root.querySelectorAll('.share-opts button')];
    K.single(btns);
    const now = root.querySelector('.ev-now');
    const steps = () => {
      const found = now.textContent.startsWith('네 섬'), picked = btns.some((b) => b.getAttribute('aria-pressed') === 'true');
      window.L1.steps(root, !found ? 1 : !picked ? 2 : 0, [found ? 1 : 0, picked ? 2 : 0]);
    };
    new MutationObserver(steps).observe(now, { childList: true, characterData: true, subtree: true });
    btns.forEach((b) => b.addEventListener('click', steps));
    steps();
    const answer = (on) => root.querySelector('#pr-one').classList.toggle('ev-right', on);
    return {
      fragment(f, on) { if (f.dataset.anim === 'ev-ans') answer(on); },
      sync(slide) { const f = slide.querySelector('[data-anim="ev-ans"]'); answer(!!f && f.classList.contains('visible')); },
    };
  });
  // 설명 장
  part('voyage', (root) => window.EvVoyage.mount(root));
  part('theory', (root) => window.EvT.stepper(root));
  part('theory', (root) => window.L1.frame(root));
  part('giraffe', (root) => window.EvGiraffe.mount(root));
  part('gala', (root) => window.EvGala.mount(root));
  part('beak3d', (root) => window.EvFinch3D.mount(root));
  part('speciate', (root) => window.EvT.stepper(root));
  part('speciate', (root) => window.L1.frame(root));
  part('sum3', (root) => window.EvT.sum(root));
  // 체험 장
  part('darwin', (root) => { const m = window.EvDarwin.mount(root); window.L1.watch(root); return m; });
  part('beak', (root) => { const m = window.EvBeak.mount(root); window.L1.watch(root); return m; });
  part('islands', (root) => { const m = window.EvIslands.mount(root); window.L1.watch(root); return m; });
  part('check3', (root) => { window.LessonParts.mountWrap(root); });
})();
