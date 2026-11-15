/* 1-2-2 4차시 「중화 반응과 그 이용」(교과서 52~53쪽).
   차례(2026-10-31 이론 장·중복 정리): 표지 → 이론(중화 반응과 염, 판서 + 3D) → 체험(한 방울씩 + 중화 적정 챌린지) → 설명(이온 수·온도 그래프, Manim 영상) → 체험(그래프 그리기)
   → 이론(생활 속 중화, 판서 표 + 사진) → 체험(알맞은 것으로 중화) → 정리 → 확인. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  part('cover', (root) => {
    single([...root.querySelectorAll('.share-opts button')]);
    window.ABRub.mount(root);
    const ans = (on) => root.querySelector('#pr-base').classList.toggle('ab-ans', on);
    return {
      fragment(f, on) { if (f.dataset.anim === 'abq') ans(on); },
      sync(slide) { const f = slide.querySelector('[data-anim="abq"]'); ans(!!f && f.classList.contains('visible')); },
    };
  });
  const ev = (root, mod, sel, map) => { root._mod = mod; window.ABWatch(root, sel, map); return mod; };
  part('neut3d', (root) => window.RxMol.mount(root, window.ABScenes.neut()));
  part('cnt', (root) => window.ABVStep.mount(root));
  part('use', (root) => window.ABGal(root));
  part('sum4', (root) => window.RxT.sum(root));
  part('drop', (root) => ev(root, window.ABDrop.mount(root), '.ab-dp-now', (t) => (t.startsWith('스포이트') ? 1 : 2)));
  part('draw', (root) => ev(root, window.ABDraw.mount(root), '.ab-dr-now', (t) => (t.includes('예상 선') ? 1 : t.startsWith('다른') ? 3 : null)));
  part('shake', (root) => ev(root, window.ABShake.mount(root), '.ab-sh-now', (t) => (/\(0\/4\)/.test(t) || !/\//.test(t) ? 1 : 3)));
  part('check4', (root) => { window.LessonParts.mountWrap(root); });
})();
