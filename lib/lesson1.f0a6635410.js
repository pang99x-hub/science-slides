/* 1-1-1 1차시 「지질 시대와 화석」(교과서 14~15쪽): 장마다 조각을 붙인다.
   차례(2026-10-30 재구성): 표지 → 설명(지질 시대와 화석) → 설명(만들어지는 과정) → 체험(화석 만들기) → 설명(화석의 종류)
   → 체험(살던 곳 찾기) → 설명+체험(지층의 시기) → 설명(지질 시대의 구분) → 체험(46억 년 줄자) → 정리 → 확인.
   설명 장은 그림을 조작하며 설명하고(teach1.js), 단계(→)는 큰 묶음(요약 카드·표)에만 쓴다(unit.css의 data-anim="mrow").
   표지 예측(.share-opts)·확인 ○×(.qs)는 수업방 응답 모으기가 그대로 읽는다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));

  // 1. 표지: 손전등으로 발자국 찾기(①) + 예측(②, 한 번 넘기면 답과 풀이)
  part('cover', (root) => {
    const lt = window.LtRake.mount(root);
    const btns = [...root.querySelectorAll('.share-opts button')], ans = root.querySelector('.cov-ans');
    single(btns);
    let shown = false;
    const steps = () => {
      const found = root.classList.contains('lt-found'), picked = btns.some((b) => b.getAttribute('aria-pressed') === 'true');
      window.L1.steps(root, !found ? 1 : !picked && !shown ? 2 : 0, [found ? 1 : 0, picked || shown ? 2 : 0]);
    };
    new MutationObserver(steps).observe(root, { attributes: true, attributeFilter: ['class'] });
    btns.forEach((b) => b.addEventListener('click', () => { steps(); if (shown) answer(true); }));
    function answer(on) {
      shown = on;
      root.querySelector('#pr-life').classList.toggle('answer', on);
      const pick = btns.find((b) => b.getAttribute('aria-pressed') === 'true');
      ans.className = 'u-pres cov-ans' + (on && pick ? (pick.id === 'pr-life' ? ' yes' : ' no') : '');
      ans.textContent = !on ? '' : !pick || pick.id === 'pr-life'
        ? '발자국도 화석이다. 화석을 보면 어떤 생물이 언제, 어떤 곳에서 살았는지 알 수 있다.'
        : '비가 만든 무늬라면 같은 세 발가락 모양이 일정한 간격으로 이어지지 않는다. 이것은 공룡 발자국 화석이다.';
      steps();
    }
    steps();
    return {
      setActive: lt.setActive, fit: lt.fit,
      fragment(f, on) { if (f.dataset.anim === 'lt') answer(on); },
      sync(slide) { const f = slide.querySelector('[data-anim="lt"]'); answer(!!f && f.classList.contains('visible')); },
    };
  });
  // 체험 장: 설명 장에서 배운 것을 조작으로 확인한다(해 볼 일 ①②③ → 알게 된 것)
  part('fossilize', (root) => window.FzForm.mount(root));
  part('timetape', (root) => window.TpTape.mount(root));
  part('habitat', (root) => window.HbPad.mount(root));
  part('dig', (root) => window.DgSite.mount(root));
  // 설명 장: 구조·원리는 그림을 조작하며 설명한다(teach1.js). 단계(→)는 큰 묶음에만 쓴다
  part('what', (root) => window.T1.gallery(root));
  part('form', (root) => window.T1.form(root));
  part('form', (root) => window.L1.frame(root));   // «영상으로 한 번에 보기» 덮개(l1frame.js의 영상 단추)
  part('kinds', (root) => window.T1.kinds(root));
  part('eras', (root) => window.T1.eras(root));
  part('sum1', (root) => window.T1.sum(root));
  // 7장: 처음에는 설명(지층 잇기 영상 + 단계 문장), 다섯 번째 →(data-anim="dg-go")에서 두 절벽 파기로 바뀐다
  part('dig', (root) => {
    const video = root.querySelector('.dg-intro video');
    let active = false;
    const play = () => { try { video.currentTime = 0; } catch { /* 아직 못 읽음 */ } video.play().catch(() => {}); };
    const go = (on) => {
      root.classList.toggle('dg-play', on);
      if (on) video.pause(); else if (active && video.paused && video.currentTime === 0) play();
    };
    root.querySelector('.dg-vagain').addEventListener('click', play);
    return {
      setActive(on) { active = on; if (on && !root.classList.contains('dg-play')) play(); if (!on) video.pause(); },
      fragment(f, on) { if (f.dataset.anim === 'dg-go') go(on); },
      sync(slide) { const f = slide.querySelector('[data-anim="dg-go"]'); go(!!f && f.classList.contains('visible')); },
    };
  });
  part('check1', (root) => { window.LessonParts.mountWrap(root); });
})();
