/* 1-1-3 2차시 「생물다양성의 가치와 보전」(교과서 28~29쪽): 장마다 조각을 붙인다.
   차례(2026-10-31 승인 기준으로 다시 짬): 표지 → 설명(생태계의 안정, Manim 단계 그림) → 체험(먹이그물 뽑기) → 설명(생물자원, 사진)
   → 체험(마을 시설) → 설명(서식지 파괴와 단편화, 3D 숲) → 체험(숲에 길 긋기) → 설명(감소 원인 다섯, 사진)
   → 설명(보전 노력, 사진 + 주체 고르기) → 체험(힘 나누기) → 정리(뒤집기 카드) → 확인.
   예측(.share-opts)·확인 ○×(.qs)는 수업방 응답 모으기가 그대로 읽는다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const { single, answerOn } = window.Kit;
  const L1 = window.L1;
  const onNow = (root, sel, fn) => { const n = root.querySelector(sel); const go = () => fn(n.textContent.trim()); new MutationObserver(go).observe(n, { childList: true, characterData: true, subtree: true }); go(); };

  part('cover', (root) => {
    const B = window.Bee.mount(root);
    single([...root.querySelectorAll('.share-opts button')]);
    return Object.assign({}, B, answerOn(root, 'pr', '#pr-chain'));
  });

  // 설명 장
  part('stable', (root) => window.BdT.stepper(root));
  part('resgal', (root) => window.BdT.gallery(root));
  part('frag', (root) => { const m = window.BdFrag.mount(root); window.BdT.stepper(root); return m; });
  part('threat', (root) => window.BdT.gallery(root));
  part('save', (root) => {
    window.BdT.gallery(root);
    const fs = [...root.querySelectorAll('.sv-filter button')], th = [...root.querySelectorAll('.gv-thumbs button')], cards = [...root.querySelectorAll('.sv-who')];
    function pick(w) {
      fs.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.who === w)));
      th.forEach((b) => b.classList.toggle('dim', w !== 'all' && b.dataset.who !== w));
      cards.forEach((c) => { c.classList.toggle('on', w !== 'all' && c.dataset.who === w); c.classList.toggle('dim', w !== 'all' && c.dataset.who !== w); });
      const first = th.find((b) => w === 'all' || b.dataset.who === w);
      if (first && first.classList.contains('dim') === false && (w !== 'all')) first.click();
    }
    fs.forEach((b) => b.addEventListener('click', () => pick(b.dataset.who)));
    root._sv = { pick };
    return {};
  });
  part('sum2', (root) => window.BdT.sum(root));

  // 체험 장
  part('web', (root) => {
    const m = window.FoodWeb.mount(root);
    let simple = false, rich = false;
    const seg = () => root.querySelector('.fw-seg [aria-pressed="true"]').dataset.w;
    onNow(root, '.fw-now', (t) => {
      if (t.startsWith('«복잡한')) simple = true;
      if (t.startsWith('«다시»') && seg() === 'rich') rich = true;
      L1.steps(root, rich ? 0 : simple ? 2 : 1, [simple ? 1 : 0, rich ? 2 : 0, rich ? 3 : 0]); L1.done(root, rich);
    });
    return m;
  });
  part('res', (root) => {
    const m = window.BioRes.mount(root);
    onNow(root, '.rs-now', (t) => {
      const one = t.startsWith('다른 생물도') || t.startsWith('여섯'), all = t.startsWith('여섯');
      L1.steps(root, all ? 0 : one ? 2 : 1, [one ? 1 : 0, all ? 2 : 0, all ? 3 : 0]); L1.done(root, all);
    });
    return m;
  });
  part('road', (root) => {
    const m = window.RoadCut.mount(root);
    let a = false, b = false, c = false;
    onNow(root, '.rd-now', (t) => {
      if (t.startsWith('숲을 가로질러')) { a = b = c = false; }
      if (t.startsWith('도로를 하나 더')) a = true;
      if (t.startsWith('생태통로를')) { a = true; b = true; }
      if (t.startsWith('토끼가')) { a = b = c = true; }
      L1.steps(root, c ? 0 : b ? 3 : a ? 2 : 1, [a ? 1 : 0, b ? 2 : 0, c ? 3 : 0]); L1.done(root, c);
    });
    return m;
  });
  part('effort', (root) => {
    const m = window.Effort.mount(root);
    let a = false, b = false, c = false;
    onNow(root, '.ef-now', (t) => {
      const good = t.startsWith('한쪽에');
      if (good && !a) a = true; else if (!good && a) b = true; else if (good && b) c = true;
      L1.steps(root, c ? 0 : b ? 3 : a ? 2 : 1, [a ? 1 : 0, b ? 2 : 0, c ? 3 : 0]); L1.done(root, c);
    });
    return m;
  });
  part('check2', (root) => { window.LessonParts.mountWrap(root); });
})();
