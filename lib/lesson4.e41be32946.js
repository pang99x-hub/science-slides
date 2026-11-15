/* 1-1-1 4차시 「생물 대멸종과 생물다양성」(교과서 18~19쪽): 장마다 조각을 붙인다.
   차례(2026-10-30 2차 재구성): 표지(예측 그래프) → 설명(생물 대멸종이란, 그림 I-11) → 설명(원인 가설 셋, Manim 단계 그림 + 증거 사진)
   → 체험(증거로 가설의 무게 달기) → 설명(대멸종 뒤 빈자리, Manim 가지 그림·영상) → 체험(새총) → 정리(뒤집기 카드) → 확인.
   표지 예측(.share-opts)·확인 ○×(.qs)는 수업방 응답 모으기가 그대로 읽는다. 표지에서 그린 예측 곡선은 2장 그래프에 겹쳐 보인다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));

  part('cover', (root) => {
    const d = window.DrawPred.mount(root);
    root._dw = d;
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector('#pr-dip').classList.toggle('answer', on);
    return {
      fragment(f, on) { if (f.dataset.anim === 'dw') answer(on); },
      sync(slide) { const f = slide.querySelector('[data-anim="dw"]'); answer(!!f && f.classList.contains('visible')); },
    };
  });
  // 2. 설명: 그림 I-11 짚기 + 대멸종 점 단추
  part('divg', (root) => window.DivGraph.mount(root));
  part('divg', (root) => {
    const btns = [...root.querySelectorAll('.mx-dots button')];
    btns.forEach((b) => b.addEventListener('click', () => { root._dv.at(+b.dataset.a); btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); }));
    return {};
  });
  // 3. 설명: 가설 셋(가설 단추로 칸 바꾸기, 칸마다 시간 막대)
  part('hyp', (root) => {
    const tabs = [...root.querySelectorAll('.hy-tabs button')], panes = [...root.querySelectorAll('.hy-pane')];
    panes.forEach((p) => window.T2.steps(root, `.hy-pane[data-h="${p.dataset.h}"] .st-fig`));
    const show = (h) => { tabs.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.h === h))); panes.forEach((p) => { p.hidden = p.dataset.h !== h; }); };
    tabs.forEach((b) => b.addEventListener('click', () => show(b.dataset.h)));
    root._hy = { show, step: (h, k) => { show(h); root._sts[`.hy-pane[data-h="${h}"] .st-fig`].set(k); } };
    const sum = (on) => root.classList.toggle('hy-summing', on);
    return {
      fragment(f, on) { if (f.dataset.anim === 'mrow') sum(on); },
      sync(slide) { const f = slide.querySelector('.hy-sum'); sum(!!f && f.classList.contains('visible')); },
    };
  });
  // 4. 체험: 증거 카드 → ①카드 하나 ②기준 셋 ③다른 시기도
  part('evid', (root) => window.Evidence.mount(root));
  part('evid', (root) => {
    const doneEv = new Set();
    window.T2.watch(root, () => {
      const on = root.querySelectorAll('.ev-crit li.on').length, ev = root.querySelector('.ev-stage').dataset.ev;
      if (on >= 3 && ev) doneEv.add(ev);
      const one = on >= 1 || doneEv.size > 0, two = doneEv.size >= 1, three = doneEv.size >= 2;
      window.L1.steps(root, !one ? 1 : !two ? 2 : !three ? 3 : 0, [one ? 1 : 0, two ? 2 : 0, three ? 3 : 0]);
      window.L1.done(root, three);
    });
    return {};
  });
  // 5. 설명: 대멸종 뒤 빈자리(가지 그림) + 정리 영상
  part('after', (root) => window.T2.steps(root));
  part('after', (root) => window.L1.frame(root));
  // 6. 체험: 새총 → ①쏘기 ②끝까지 ③다른 세기로 한 번 더
  part('sling', (root) => window.SlingWorld.mount(root));
  part('sling', (root) => {
    const now = root.querySelector('.sl-now'); let fired = false, runs = 0, was = false;
    window.T2.watch(root, () => {
      const d = now.classList.contains('done');
      if (now.classList.contains('gone')) fired = true;
      if (d && !was) runs += 1; was = d;
      if (runs) fired = true;
      window.L1.steps(root, !fired ? 1 : runs < 1 ? 2 : runs < 2 ? 3 : 0, [fired ? 1 : 0, runs >= 1 ? 2 : 0, runs >= 2 ? 3 : 0]);
      window.L1.done(root, runs >= 2);
    });
    return {};
  });
  part('sum4', (root) => window.T1.sum(root));
  part('c4-check', (root) => { window.LessonParts.mountWrap(root); });
})();
