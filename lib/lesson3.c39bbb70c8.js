/* 1-1-1 3차시 「움직이는 대륙과 달라지는 환경」(교과서 16~17쪽, 선생님 요청으로 더한 차시): 장마다 조각을 붙인다.
   차례(2026-10-30 2차 재구성): 표지 → 설명(판과 판이 만나는 곳, 3D 단면) → 체험(판 밀고 당기기) → 설명(판게아, 3D 지구)
   → 설명(대륙이 움직이면 생물도) → 체험(이 지구는 언제일까?) → 정리(뒤집기 카드) → 확인.
   표지 예측(.share-opts)·확인 ○×(.qs)는 수업방 응답 모으기가 그대로 읽는다. 3장(#plates)의 data-word는 «한 낱말 묻기»에 미리 들어간다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));

  // 1. 표지: 산꼭대기 확대 + 예측(한 번 넘기면 답 표시)
  part('cover', (root) => {
    window.ZoomHill.mount(root);
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector('#pr-up').classList.toggle('answer', on);
    return {
      fragment(f, on) { if (f.dataset.anim === 'zm') answer(on); },
      sync(slide) { const f = slide.querySelector('[data-anim="zm"]'); answer(!!f && f.classList.contains('visible')); },
    };
  });
  // 2. 설명: 3D 판 경계 단면
  part('bound', (root) => window.Plate3D.mount(root));
  // 3. 체험: 판 밀기·벌리기 → ①산맥 ②지진 ③새 바다
  part('plates', (root) => window.Plates.mount(root));
  part('plates', (root) => {
    let hi = 0, lo = 0, q = 0;
    const upd = () => {
      const pl = root._pl; if (pl) { hi = Math.max(hi, pl.d); lo = Math.min(lo, pl.d); q = Math.max(q, pl.quakes); }
      const a = hi > 0.85, b = q > 0, c = lo < -0.85;
      window.L1.steps(root, !a ? 1 : !b ? 2 : !c ? 3 : 0, [a ? 1 : 0, b ? 2 : 0, c ? 3 : 0]);
      window.L1.done(root, a && b && c);
    };
    window.T2.watch(root, upd);
    root.querySelector('#pl-d').addEventListener('input', upd);
    root.querySelector('.pl-stage canvas').addEventListener('pointermove', upd);
    root.querySelector('#pl-reset').addEventListener('click', () => { hi = 0; lo = 0; q = 0; upd(); });
    let iv = 0;
    return { setActive(on) { clearInterval(iv); if (on) iv = setInterval(upd, 400); } };
  });
  // 4. 설명: 3D 지구
  part('globe', (root) => window.Globe.mount(root));
  // 5. 설명: 대륙이 움직이면 생물도
  part('effect', (root) => window.T3.effect(root));
  // 6. 체험: 지구 그림을 시대 칸에 → ①놓기 ②셋 다 맞음 ③대서양 물음
  part('gmatch', (root) => window.T3.match(root));
  part('gmatch', (root) => {
    const n = root.querySelector('.mt-n');
    window.T2.watch(root, () => {
      const m = root._mt; if (!m) return;
      const placed = root.querySelectorAll('.mt-in img').length, right = m.right, ok = m.asked === 'wide';
      n.textContent = `${right}/3`;
      window.L1.steps(root, !placed ? 1 : right < 3 ? 2 : !ok ? 3 : 0, [placed ? 1 : 0, right >= 3 ? 2 : 0, ok ? 3 : 0]);
      window.L1.done(root, right >= 3 && ok);
    });
    return {};
  });
  part('sum3', (root) => window.T1.sum(root));
  part('check3', (root) => { window.LessonParts.mountWrap(root); });
})();
