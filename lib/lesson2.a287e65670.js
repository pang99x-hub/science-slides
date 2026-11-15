/* 1-2-2 2차시 「산과 염기의 이온화」(교과서 48~49쪽).
   차례(2026-10-31 이론 장 추가·중복 정리): 표지 → 이론(산과 염기란?, 판서 + 3D 이온화) → 설명(이온 이동 실험, 3D) → 체험(다이얼) → 설명(여러 산·염기와 개수비, Manim 영상) → 체험(떼어 내기 + 빨리 가르기 게임)
   → 설명(우리 주변의 산과 염기, 사진) → 체험(돋보기) → 정리(뒤집기 카드) → 확인. 표지 예측·응답 모으기는 1차시와 같다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  const ev = (root, mod, sel, map) => { root._mod = mod; window.ABWatch(root, sel, map); return mod; };
  part('cover', (root) => {
    single([...root.querySelectorAll('.share-opts button')]);
    const ans = (on) => root.querySelector('#pr-ion').classList.toggle('ab-ans', on);
    return {
      fragment(f, on) { if (f.dataset.anim === 'abq') ans(on); },
      sync(slide) { const f = slide.querySelector('[data-anim="abq"]'); ans(!!f && f.classList.contains('visible')); },
    };
  });
  part('theo2', (root) => window.RxMol.mount(root, window.ABScenes.ionize()));
  part('mig3d', (root) => window.RxMol.mount(root, window.ABScenes.migrate()));
  part('ioneq', (root) => window.ABVStep.mount(root));
  part('life2', (root) => window.ABGal(root));
  part('sum2', (root) => window.RxT.sum(root));
  part('migrate', (root) => { single([...root.querySelectorAll('.share-opts button')]); return ev(root, window.ABMigrate.mount(root), '.ab-mg-now', (t) => (t.startsWith('전') || t.startsWith('다') ? 1 : null)); });
  part('split', (root) => ev(root, window.ABSplit.mount(root), '.ab-sp-now'));
  part('lens', (root) => ev(root, window.ABLens.mount(root), '.ab-ln-now', (t) => (/찾은 물건 [1-9]/.test(t) ? 2 : null)));
  part('check2', (root) => { window.LessonParts.mountWrap(root); });
})();
