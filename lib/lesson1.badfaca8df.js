/* 1-2-1 1차시 「산소를 주고받는 산화와 환원」(교과서 38~41쪽): 장마다 조각을 붙인다.
   차례(2026-10-31 중복 줄임, 11장): 표지 → 설명(역사를 바꾼 세 반응, 사진) → 체험(돋보기) → 이론(산화와 환원이란? 왼쪽 판서 + 오른쪽 반응식 Manim) → 체험(구리판과 불꽃)
   → 설명(산화 구리(Ⅱ)와 탄소, 3D) → 체험(시험관 가열) → 설명(우리 주변, 사진) → 체험(페인트) → 정리(뒤집기 카드) → 확인.
   예측(.share-opts)·확인 ○×(.qs)는 수업방 응답 모으기가 그대로 읽는다. 2장(#hist)의 data-word는 «한 낱말 묻기»에 미리 들어간다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const L1 = window.L1;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  // 체험 장: 기존 모듈의 «지금 할 것» 칩 글을 읽어 해 볼 일 ①②③을 맞춘다. map(글) → 지금 단계(없으면 앞 단계 유지)
  const DIG = '①②③④';
  function watch(root, sel, map) {
    const chip = root.querySelector(sel); if (!chip) return;
    const all = [...root.querySelectorAll('.u-steps li')].map((li) => +li.dataset.s);
    let cur = 1;
    const upd = () => {
      if (chip.classList.contains('done')) { L1.steps(root, 0, all); L1.done(root, true); return; }
      const t = chip.textContent.trim();
      let n = map ? map(t) : null;
      if (n == null) { const i = DIG.indexOf(t[0]); if (i >= 0) n = i + 1; }
      if (n != null) cur = n;
      L1.steps(root, cur, all.filter((k) => k < cur)); L1.done(root, false);
    };
    new MutationObserver(upd).observe(chip, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    upd();
  }
  window.RxWatch = watch;
  // 3D 단계 장: 반응식 줄 밝히기
  const eqOn = (root, k, map) => root.querySelectorAll('.m3-eq[data-k]').forEach((p) => p.classList.toggle('on', map[p.dataset.k](k)));
  window.RxEqOn = eqOn;

  // 1. 표지: 세월 다이얼 + 예측(한 번 넘기면 «산소» 표시)
  part('cover', (root) => {
    window.RxSword.mount(root);
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => { const b = root.querySelector('#pr-o2'); const was = b.classList.contains('rx-right'); b.classList.toggle('rx-right', on); if (on && !was) window.RxFx.burst(b); };
    return {
      fragment(f, on) { if (f.dataset.anim === 'rxans') answer(on); },
      sync(slide) { const f = slide.querySelector('[data-anim="rxans"]'); answer(!!f && f.classList.contains('visible')); },
    };
  });

  // 설명 장
  part('hist', (root) => {
    const rows = [...root.querySelectorAll('.hs-row')];
    root.querySelector('.gv').addEventListener('gv-pick', (e) => rows.forEach((x) => x.classList.toggle('on', x.dataset.k === e.detail.b.dataset.row)));
    return window.RxT.gallery(root);
  });
  part('theo1', (root) => window.RxT.join(window.RxT.stepper(root), window.RxPeek.mount(root)));
  part('cuo3d', (root) => { const m = window.RxMol.mount(root, window.RxScenes.cuo()); window.RxBet.mount(root, (k) => k >= 3); return m; });
  part('life', (root) => window.RxT.gallery(root));
  part('sum1', (root) => window.RxT.sum(root));

  // 체험 장: 기존 모듈 + 해 볼 일
  part('three', (root) => {
    const m = window.RxLens.mount(root); root._lens = m;
    const recs = ['leaf', 'fire', 'iron'].map((k) => root.querySelector(`.rx-rec[data-k="${k}"]`));
    const upd = () => {
      const d = recs.map((r) => r.classList.contains('on')), all = d.every(Boolean);
      const now = all ? 0 : d.indexOf(false) + 1;
      L1.steps(root, now, d.map((x, i) => (x ? i + 1 : 0))); L1.done(root, all);
    };
    recs.forEach((r) => new MutationObserver(upd).observe(r, { attributes: true, attributeFilter: ['class'] }));
    upd();
    return m;
  });
  part('flame', (root) => { const m = window.RxFlame.mount(root); root._flame = m; watch(root, '.rx-fl-now'); return m; });
  part('tube', (root) => { const m = window.RxTube.mount(root); root._tube = m; watch(root, '.rx-tb-now', (t) => (t.startsWith('계속') || t.startsWith('불이 꺼져') ? 1 : null)); return m; });
  part('paint', (root) => {
    const m = window.RxPaint.mount(root); root._paint = m;
    watch(root, '.rx-pt-now', (t) => (t.startsWith('①') ? 1 : t.startsWith('날이') ? 2 : t.startsWith('②') ? 3 : null));
    return m;
  });
  part('check1', (root) => { window.LessonParts.mountWrap(root); });
})();
