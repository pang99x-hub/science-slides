/* 1-1-1 2차시 「지질 시대의 환경과 생물」(교과서 16~17쪽): 장마다 조각을 붙인다.
   차례(2026-10-30 2차 재구성, 1차시 승인판의 틀): 표지 → 설명(선캄브리아시대: 산소) → 체험(남세균) → 설명(시대 탐험기)
   → 설명(대표 화석 3D) → 체험(시간 돋보기) → 설명(생물이 나타난 차례) → 설명+체험(대륙 맞추기) → 정리(뒤집기 카드) → 확인.
   설명 장의 조작 그림은 teach2.js(T2)·fossil3d.js, 정리 카드는 teach1.js의 T1.sum, 체험 장의 ①②③·알게 된 것은 l1frame.js의 L1.
   예측(.share-opts)·확인 ○×(.qs)는 수업방 응답 모으기가 그대로 읽는다. 6장(#eras)의 data-word는 «한 낱말 묻기»에 미리 들어간다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));

  // 1. 표지: 시대 풍경 순서 맞추기 + 예측(한 번 넘기면 답 표시)
  part('cover', (root) => {
    window.EraOrder.mount(root);
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector('#pr-both').classList.toggle('answer', on);
    return {
      fragment(f, on) { if (f.dataset.anim === 'od') answer(on); },
      sync(slide) { const f = slide.querySelector('[data-anim="od"]'); answer(!!f && f.classList.contains('visible')); },
    };
  });

  // 2. 설명: 선캄브리아시대 — 시간 막대 다섯 그림 + 사진 + 정리 영상
  part('pcox', (root) => { window.T2.steps(root); window.T2.gal(root, '.gl-pc'); return {}; });
  part('pcox', (root) => window.L1.frame(root));

  // 3. 체험: 남세균 누르고 있기 → ①바다 산소 ②오존층 ③뭍으로
  part('oxygen', (root) => window.Oxygen.mount(root));
  part('oxygen', (root) => {
    window.T2.watch(root, () => {
      const p = root._o2 ? root._o2.p : 0;
      window.L1.steps(root, p < 0.42 ? 1 : p < 0.82 ? 2 : p < 0.995 ? 3 : 0, [p >= 0.42 ? 1 : 0, p >= 0.82 ? 2 : 0, p >= 0.995 ? 3 : 0]);
      window.L1.done(root, p >= 0.995);
    });
    return {};
  });

  // 4. 설명: 시대 탐험기
  part('tour', (root) => window.T2.tour(root));
  // 5. 설명: 대표 화석 3D
  part('spec', (root) => window.Fossil3D.mount(root));

  // 6. 체험: 시간 돋보기 → ①생물 화석 ②땅속 증거 ③세 시대 이상
  const EVID = ['fold', 'coal', 'ash', 'glac'];
  part('eras', (root) => window.EraLens.mount(root));
  part('eras', (root) => {
    const cnt = root.querySelector('.lz-eras');
    window.T2.watch(root, () => {
      const f = root._lz ? root._lz.found : {};
      const all = Object.values(f).flatMap((s) => [...s]);
      const life = all.some((k) => !EVID.includes(k)), evid = all.some((k) => EVID.includes(k));
      const eras = Object.values(f).filter((s) => s.size).length;
      cnt.textContent = `${Math.min(eras, 3)}/3`;
      window.L1.steps(root, !life ? 1 : !evid ? 2 : eras < 3 ? 3 : 0, [life ? 1 : 0, evid ? 2 : 0, eras >= 3 ? 3 : 0]);
      window.L1.done(root, life && evid && eras >= 3);
    });
    return {};
  });

  // 7. 설명: 생물이 나타난 차례
  part('order', (root) => window.T2.lineage(root));

  // 8. 설명 + 체험: 처음에는 화석 사진과 설명, → (data-anim="pz-go")에서 조각 맞추기
  part('gondwana', (root) => window.Gondwana.mount(root));
  part('gondwana', (root) => {
    const n = root.querySelector('.pz-n');
    window.T2.watch(root, () => {
      const placed = [...root.querySelectorAll('.pz-piece.placed')].map((g) => g.dataset.k);
      const sa = placed.includes('sa'), all = placed.length >= 4;
      n.textContent = `${placed.length}/4`;
      window.L1.steps(root, !sa ? 1 : !all ? 2 : 0, [sa ? 1 : 0, all ? 2 : 0, all ? 3 : 0]);
      window.L1.done(root, all);
    });
    const go = (on) => root.classList.toggle('pz-play', on);
    return {
      fragment(f, on) { if (f.dataset.anim === 'pz-go') go(on); },
      sync(slide) { const f = slide.querySelector('[data-anim="pz-go"]'); go(!!f && f.classList.contains('visible')); },
    };
  });

  // 9. 정리: 뒤집기 카드
  part('sum2', (root) => window.T1.sum(root));
  part('check2', (root) => { window.LessonParts.mountWrap(root); });
})();
