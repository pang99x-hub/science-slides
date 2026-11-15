/* 1-2-2 3차시 「탐구: 산과 염기를 섞을 때의 온도」(교과서 50~51쪽). 실험 장의 결과는 AB.state.lab으로 그래프 장에 넘어간다.
   차례(2026-10-31 이론 장 추가): 표지 → 이론(중화 반응과 중화열, 판서 + 실험 영상) → 설명(탐구 설계, 사진) → 체험(피펫) → 체험(그래프) → 설명(결과 읽기, Manim 영상) → 체험(막대 + 중화 적정 챌린지) → 정리 → 확인. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  const cover = (root, mod, right) => {
    single([...root.querySelectorAll('.share-opts button')]);
    const ans = (on) => root.querySelector(right).classList.toggle('ab-ans', on);
    return {
      setActive: (on) => mod.setActive && mod.setActive(on),
      fragment(f, on) { if (f.dataset.anim === 'abq') ans(on); },
      sync(slide) { const f = slide.querySelector('[data-anim="abq"]'); ans(!!f && f.classList.contains('visible')); },
    };
  };
  part('cover', (root) => cover(root, window.ABThermo.mount(root), '#pr-up'));
  const ev = (root, mod, sel, map) => { root._mod = mod; window.ABWatch(root, sel, map); return mod; };
  // 설명 장
  part('design', (root) => window.ABGal(root));
  part('readres', (root) => window.ABVStep.mount(root));
  part('sum3', (root) => window.RxT.sum(root));
  // 체험 장
  part('mixlab', (root) => ev(root, window.ABPipette.mount(root), '.ab-pp-now'));
  part('plot', (root) => {
    single([...root.querySelectorAll('.share-opts button')]);
    const m = window.ABPlot.mount(root); window.ABWatch(root, '.ab-pl-now', (t) => (t.startsWith('제자리') ? 2 : null));
    const ans = (on) => root.querySelector('#pl-da').classList.toggle('ab-ans', on);
    return { setActive: m.setActive, fragment(f, on) { if (f.dataset.anim === 'abrow') ans(on); }, sync(s) { const f = s.querySelector('[data-anim="abrow"]'); ans(!!f && f.classList.contains('visible')); } };
  });
  // 막대 체험: 지나간 비율로 해 볼 일 ①②③을 맞춘다(① 움직임 ② 양쪽 끝 ③ 6 : 6)
  part('scrub', (root) => {
    const m = window.ABScrub.mount(root), r = root.querySelector('.ab-sc-range'), seen = new Set();
    const L = window.L1, upd = () => {
      const v = +r.value; seen.add(v);
      const moved = seen.size > 1, ends = seen.has(2) || seen.has(0), ends2 = seen.has(10) || seen.has(12), mid = moved && ends && ends2 && v === 6;
      const now = mid ? 0 : !moved ? 1 : !(ends && ends2) ? 2 : 3;
      L.steps(root, now, [moved && 1, ends && ends2 && 2, mid && 3].filter(Boolean)); if (mid) L.done(root, true);
    };
    r.addEventListener('input', upd); upd();
    return m;
  });
  part('check3', (root) => { window.LessonParts.mountWrap(root); });
})();
