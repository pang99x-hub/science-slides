/* 1-2-2 1차시 「산성과 염기성」(교과서 46~47쪽): 장마다 조각을 붙인다.
   차례(2026-10-31 승인 기준으로 다시 짬): 표지 → 설명(지시약, 사진 + 표) → 체험(홈판) → 설명(다른 물질과 만날 때, 사진) → 체험(붓기)
   → 설명(전류가 흐르는 까닭, 3D) → 체험(전기 전도성) → 정리(뒤집기 카드) → 확인.
   예측(.share-opts)·확인 ○×(.qs)는 수업방 응답 모으기가 그대로 읽는다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  // 표지의 예측: 한 번 넘기면 답(data-anim="abq")을 표시
  window.ABCover = (root, mod, right) => {
    single([...root.querySelectorAll('.share-opts button')]);
    const ans = (on) => root.querySelector(right).classList.toggle('ab-ans', on);
    return {
      setActive: (on) => mod && mod.setActive && mod.setActive(on), fit: () => mod && mod.fit && mod.fit(),
      fragment(f, on) { if (f.dataset.anim === 'abq') ans(on); },
      sync(slide) { const f = slide.querySelector('[data-anim="abq"]'); ans(!!f && f.classList.contains('visible')); },
    };
  };
  const ev = (root, mod, sel, map) => { root._mod = mod; window.ABWatch(root, sel, map); return mod; };
  part('cover', (root) => window.ABCover(root, window.ABSqueeze.mount(root), '#pr-acid'));
  // 설명 장
  part('ind', (root) => window.ABGal(root));
  part('react', (root) => window.ABGal(root));
  part('cond3d', (root) => {
    const cfg = window.ABScenes.cond();
    const res = { su: ['흐르지 않음 · 이온 없음', '흐르지 않음 · 이온 없음'], a: ['흐름 · H⁺·Cl⁻이 나름', ''], b: ['흐름 · Na⁺·OH⁻이 나름', ''] };
    cfg.onStep = (k) => root.querySelectorAll('.cd-v').forEach((e) => {
      const on = k >= 1; e.textContent = on ? res[e.dataset.k][0] : '—';
      e.classList.toggle('yes', on && e.dataset.k !== 'su'); e.classList.toggle('no', on && e.dataset.k === 'su');
    });
    return window.RxMol.mount(root, cfg);
  });
  part('sum1', (root) => window.RxT.sum(root));
  // 체험 장
  part('wells', (root) => ev(root, window.ABWells.mount(root), '.ab-wl-now'));
  part('pour', (root) => ev(root, window.ABPour.mount(root), '.ab-po-now'));
  part('probe', (root) => ev(root, window.ABProbe.mount(root), '.ab-pr-now'));
  part('check1', (root) => { window.LessonParts.mountWrap(root); });
})();
