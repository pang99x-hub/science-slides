/* 1-2-1 2차시 「전자를 주고받는 산화와 환원」(교과서 42~45쪽): 장마다 조각을 붙인다.
   차례(2026-10-31 중복 줄임, 14장): 표지 → 이론(전자의 이동, 왼쪽 판서 + 오른쪽 전자 장부 Manim) → 체험(확대) → 체험(구리와 질산 은)
   → 설명(마그네슘의 연소 3D + 두 눈은 하나) → 미니 게임(전자 맞추기) → 이론(우리 주변의 산화·환원, 왼쪽 표 + 오른쪽 사진) → 체험(유리종)
   → 설명(용광로 3D) → 체험(풀무) → 설명(생활 속, 사진) → 체험(시간 막대) → 정리(뒤집기 카드) → 확인.
   예측(.share-opts)·확인 ○×(.qs)는 수업방 응답 모으기가 그대로 읽는다. 9장(#furn3d)의 data-word는 «한 낱말 묻기»에 미리 들어간다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const L1 = window.L1;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  // 체험 장: 기존 모듈의 «지금 할 것» 칩 글을 읽어 해 볼 일 ①②③을 맞춘다(1차시와 같음)
  const DIG = '①②③④';
  function watch(root, sel, map, extraDone) {
    const chip = root.querySelector(sel); if (!chip) return () => {};
    const all = [...root.querySelectorAll('.u-steps li')].map((li) => +li.dataset.s);
    let cur = 1;
    const upd = () => {
      const fin = chip.classList.contains('done') && (!extraDone || extraDone());
      if (fin) { L1.steps(root, 0, all); L1.done(root, true); return; }
      const t = chip.textContent.trim();
      let n = map ? map(t, chip.classList.contains('done')) : null;
      if (n == null) { const i = DIG.indexOf(t[0]); if (i >= 0) n = i + 1; }
      if (n != null) cur = n;
      L1.steps(root, cur, all.filter((k) => k < cur)); L1.done(root, false);
    };
    new MutationObserver(upd).observe(chip, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    upd();
    return upd;
  }
  const eqOn = (root, k, map) => root.querySelectorAll('.m3-eq[data-k]').forEach((p) => p.classList.toggle('on', map[p.dataset.k](k)));

  part('cover', (root) => {
    const m = window.RxDip.mount(root); root._dip = m;
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => { const b = root.querySelector('#pr-ion'); const was = b.classList.contains('rx-right'); b.classList.toggle('rx-right', on); if (on && !was) window.RxFx.burst(b); };
    return {
      setActive: m.setActive,
      fragment(f, on) { if (f.dataset.anim === 'rxans') answer(on); },
      sync(slide) { const f = slide.querySelector('[data-anim="rxans"]'); answer(!!f && f.classList.contains('visible')); },
    };
  });

  // 설명 장
  part('theo2', (root) => window.RxT.join(window.RxT.stepper(root), window.RxPeek.mount(root)));
  part('mg3d', (root) => {
    const r = window.RxMol.mount(root, window.RxScenes.mg());
    const eyes = [...root.querySelectorAll('.mg-eye button')];
    const set = (e) => {
      eyes.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.eye === e)));
      root.querySelector('.mg-o').hidden = e !== 'o'; root.querySelector('.mg-e').hidden = e !== 'e';
      root.classList.toggle('eye-o', e === 'o');
      const full = root.querySelector('.mg-full');
      // 산소의 눈으로는 마그네슘의 산화만 보인다(산소를 잃는 물질이 없다) → 환원은 전자의 눈에서만 긋는다(교과서 43쪽)
      full.dataset.by = e; if (e === 'e') full.dataset.red = '1>2'; else delete full.dataset.red;
      window.RX.bx(full);
    };
    eyes.forEach((b) => b.addEventListener('click', () => set(b.dataset.eye)));
    root.addEventListener('st-step', (ev) => { if (ev.detail >= 2) set('e'); });
    set('o');
    root._eye = set;
    return window.RxT.join(r, window.RxPeek.mount(root));
  });
  part('theo3', (root) => {
    const rows = [...root.querySelectorAll('.th-big-tab tr[data-k]')];
    root.querySelector('.gv').addEventListener('gv-pick', (e) => rows.forEach((x) => x.classList.toggle('on', x.dataset.k === e.detail.b.dataset.row)));
    return window.RxT.gallery(root);
  });
  part('furn3d', (root) => window.RxT.join(window.RxFurn3d.mount(root), window.RxPeek.mount(root)));
  part('life2', (root) => window.RxT.gallery(root));
  part('sum2', (root) => window.RxT.sum(root));

  // 체험 장
  part('zoom', (root) => {
    const m = window.RxZoom.mount(root); root._zoom = m;
    let hSeen = false;
    const upd = watch(root, '.rx-zm-now', (t, done) => (done ? (hSeen ? null : 3) : 1), () => hSeen);
    const hb = root.querySelector('[data-sol="h"]');
    hb.addEventListener('click', () => { if (root.querySelector('.rx-zm-now').classList.contains('done')) hSeen = true; setTimeout(upd, 0); });
    return m;
  });
  part('dish', (root) => { const m = window.RxDish.mount(root); root._dish = m; watch(root, '.rx-ds-now', (t) => (t.startsWith('잠긴') ? 2 : null)); return m; });
  part('ebal', (root) => window.RxEbal.mount(root));
  part('jar', (root) => { const m = window.RxJar.mount(root); root._jar = m; watch(root, '.rx-jr-now'); return m; });
  part('furnace', (root) => { const m = window.RxFurnace.mount(root); root._fu = m; watch(root, '.rx-fu-now', (t) => (t.startsWith('계속') ? 2 : t.startsWith('바람') ? 2 : null)); return m; });
  part('shelf', (root) => { const m = window.RxShelf.mount(root); root._shelf = m; watch(root, '.rx-sh-now', (t) => (t.startsWith('계속') ? 2 : t.startsWith('②') ? 3 : null)); return m; });
  part('check2', (root) => { window.LessonParts.mountWrap(root); });
})();
