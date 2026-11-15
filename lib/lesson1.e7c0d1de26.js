/* 1-1-2 1차시 「변이와 자연선택」(교과서 20~21쪽): 장마다 조각을 붙인다.
   차례(2026-10-30 승인 기준으로 다시 짬): 표지 → 설명(변이) → 설명(유성생식, 3D 염색체) → 체험(한배 강아지) → 설명(돌연변이, 3D DNA)
   → 체험(DNA 베끼기) → 설명(자연선택, Manim 단계 그림) → 체험(해 보기 딱정벌레) → 설명(항생제 내성, Manim) → 체험(접시의 세균) → 정리 → 확인.
   설명 장은 그림을 조작하면 풀이가 바뀐다(teach.js·chromo3d.js·dna3d.js). 체험 장은 기존 조작 모듈 + 해 볼 일 ①②③(frame.js).
   예측(.share-opts)·확인 ○×(.qs)는 수업방 응답 모으기가 그대로 읽는다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const K = window.EvKit;

  // 1. 표지: ① 쥐 옮기기(매의 눈) → ② 예측 고르기. 한 번 넘기면 맞는 예측에 테
  part('cover', (root) => {
    const m = window.EvMice.mount(root);
    const btns = [...root.querySelectorAll('.share-opts button')];
    K.single(btns);
    const now = root.querySelector('.ev-now');
    const steps = () => {
      const moved = now.classList.contains('done'), picked = btns.some((b) => b.getAttribute('aria-pressed') === 'true');
      window.L1.steps(root, !moved ? 1 : !picked ? 2 : 0, [moved ? 1 : 0, picked ? 2 : 0]);
    };
    new MutationObserver(steps).observe(now, { attributes: true, attributeFilter: ['class'] });
    btns.forEach((b) => b.addEventListener('click', steps));
    steps();
    const answer = (on) => root.querySelector('#pr-sel').classList.toggle('ev-right', on);
    return {
      setActive: m.setActive,
      fragment(f, on) { if (f.dataset.anim === 'ev-ans') answer(on); },
      sync(slide) { const f = slide.querySelector('[data-anim="ev-ans"]'); answer(!!f && f.classList.contains('visible')); },
    };
  });

  // 설명 장
  part('vary', (root) => window.EvT.gallery(root));
  part('meiosis', (root) => window.EvChromo.mount(root));
  part('meiosis', (root) => window.EvT.stepper(root));
  part('dna', (root) => window.EvDna.mount(root));
  part('select', (root) => window.EvT.stepper(root));
  part('select', (root) => window.EvT.gallery(root));
  part('resist', (root) => window.EvT.stepper(root));
  part('resist', (root) => window.L1.frame(root));
  part('sum1', (root) => window.EvT.sum(root));

  // 체험 장: 기존 모듈 + 해 볼 일 단계(«지금 할 것» 칩을 읽는다)
  part('sexrep', (root) => {
    const m = window.EvPuppies.mount(root);
    const nIn = root.querySelector('#ev-sr-n');
    let many = false;
    const map = (t) => { if (t.startsWith('같은 부모')) { many = true; return +nIn.value >= 23 ? 0 : 3; } return null; };
    window.L1.watch(root, map);
    nIn.addEventListener('input', () => { if (many && +nIn.value >= 23) { window.L1.steps(root, 0, [1, 2, 3]); window.L1.done(root, true); } });
    return m;
  });
  part('mutant', (root) => { const m = window.EvMutant.mount(root); window.L1.watch(root); return m; });
  part('beetle', (root) => {
    const m = window.EvBeetle.mount(root);
    const fast = root.querySelector('.ev-bt-fast');
    window.L1.watch(root, (t) => (t.startsWith('②') && fast.getAttribute('aria-pressed') === 'true' ? 3 : null));
    fast.addEventListener('click', () => { if (root.querySelector('.ev-now').textContent.startsWith('②')) window.L1.steps(root, 3, [1, 2]); });
    return m;
  });
  part('superbug', (root) => {
    const m = window.EvSuperbug.mount(root);
    let doses = 0;
    window.L1.watch(root, (t) => (t.startsWith('②') ? (doses >= 2 ? 3 : 2) : null));
    root.querySelector('.ev-sb-cv').addEventListener('pointerdown', () => { doses++; });
    return m;
  });
  part('check1', (root) => { window.LessonParts.mountWrap(root); });
})();
