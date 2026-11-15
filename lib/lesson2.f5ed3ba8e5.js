/* 1-1-2 2차시 「자연선택 모의실험」(교과서 22~23쪽 탐구): 장마다 조각을 붙인다.
   차례(2026-10-30 승인 기준으로 다시 짬): 표지(흔들어 섞기) → 설명(실험 과정, Manim 단계 그림) → 체험(포식자 되어 집기, 핵심 탐구)
   → 설명(결과 읽기, 누적 막대) → 설명+체험(무엇을 흉내 냈나) → 체험(도화지 색 바꾸기) → 정리 → 확인.
   예측(.share-opts)·확인 ○×(.qs)는 수업방 응답 모으기가 그대로 읽는다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const K = window.EvKit;
  part('cover', (root) => {
    const m = window.EvShake.mount(root);
    const btns = [...root.querySelectorAll('.share-opts button')];
    K.single(btns);
    const now = root.querySelector('.ev-now');
    const steps = () => {
      const picked = btns.some((b) => b.getAttribute('aria-pressed') === 'true');
      window.L1.steps(root, picked ? 0 : 1, [picked ? 1 : 0]);
    };
    new MutationObserver(steps).observe(now, { attributes: true, attributeFilter: ['class'] });
    btns.forEach((b) => b.addEventListener('click', steps));
    steps();
    const answer = (on) => root.querySelector('#pr-yel').classList.toggle('ev-right', on);
    return {
      setActive: m.setActive, fit: m.fit,
      fragment(f, on) { if (f.dataset.anim === 'ev-ans') answer(on); },
      sync(slide) { const f = slide.querySelector('[data-anim="ev-ans"]'); answer(!!f && f.classList.contains('visible')); },
    };
  });
  part('plan', (root) => window.EvT.stepper(root));
  part('result', (root) => window.EvResult.mount(root));
  part('sum2', (root) => window.EvT.sum(root));
  // 체험: 포식자 놀이 — «지금 할 것» 칩: ① 눈 감기, ② 집기, ④ 초록→노랑, «N회:»(3회부터) → 4단계
  part('hunt', (root) => {
    const m = window.EvHunt.mount(root);
    window.L1.watch(root, (t) => { if (t.startsWith('④')) return 3; const r = t.match(/^(\d)회/); if (r && +r[1] >= 3) return 4; if (t.startsWith('②') || t.startsWith('다른 포식자')) return null; return null; });
    return m;
  });
  // 설명 + 체험: 시간 띠 — 이어진 짝 수로 단계를 맞춘다
  part('analogy', (root) => {
    const m = window.EvAnalogy.mount(root);
    const lis = [...root.querySelectorAll('.ev-pairs li')];
    const upd = () => { const n = lis.filter((li) => li.classList.contains('on')).length; if (n >= lis.length) { window.L1.steps(root, 0, [1, 2, 3]); window.L1.done(root, true); } else { window.L1.steps(root, n ? 2 : 1, n ? [1] : []); window.L1.done(root, false); } };
    lis.forEach((li) => new MutationObserver(upd).observe(li, { attributes: true, attributeFilter: ['class'] }));
    upd();
    return m;
  });
  part('paper', (root) => { const m = window.EvPaper.mount(root); window.L1.watch(root); return m; });
  part('check2', (root) => { window.LessonParts.mountWrap(root); });
})();
