/* 1-1-3 3차시 「보전 사례 조사와 실천 방안」(교과서 30~31쪽 탐구): 장마다 조각을 붙인다.
   차례(2026-10-31 승인 기준으로 다시 짬): 표지(기온 막대·사례 고르기) → 설명(사례 여섯, 카드) → 설명(멸종 위기종 복원, 사진)
   → 체험(손잡이 둘) → 체험(습지 보호 구역) → 설명(외래생물, Manim 단계 그림 + 사진) → 체험(연못 잡아내기)
   → 체험(실천 점검표) → 정리(뒤집기 카드) → 확인.
   사례 고르기(.share-opts)·확인 ○×(.qs)는 수업방 응답 모으기가 그대로 읽는다. 8장(#plan)의 data-word는 «한 낱말 묻기»에 미리 들어간다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const { single } = window.Kit;
  const L1 = window.L1;
  const onNow = (root, sel, fn) => { const n = root.querySelector(sel); const go = () => fn(n.textContent.trim()); new MutationObserver(go).observe(n, { childList: true, characterData: true, subtree: true }); go(); };

  part('cover', (root) => { single([...root.querySelectorAll('.share-opts button')]); return window.Climate.mount(root); });

  // 설명 장
  part('cases', (root) => {
    const cards = [...root.querySelectorAll('.cs-card')], box = root.querySelector('.cs-now');
    const data = Object.fromEntries([...root.querySelectorAll('.cs-data li')].map((li) => [li.dataset.k, li]));
    function pick(k) {
      cards.forEach((c) => c.setAttribute('aria-pressed', String(c.dataset.k === k)));
      const c = cards.find((x) => x.dataset.k === k), li = data[k], parts = li.innerHTML.split(/<b>[^<]*<\/b>/).filter(Boolean);
      box.classList.remove('empty');
      box.querySelector('.cs-tag').textContent = c.querySelector('.cs-who').textContent + '의 노력';
      box.querySelector('.cs-name').textContent = c.querySelector('b').textContent;
      box.querySelector('.cs-goal').innerHTML = parts[0] || '';
      box.querySelector('.cs-what').innerHTML = parts[1] || '';
      box.querySelector('.cs-cr').textContent = '사진: ' + li.dataset.cr;
    }
    cards.forEach((c) => c.addEventListener('click', () => pick(c.dataset.k)));
    root._cs = { pick };
    return {};
  });
  part('revive', (root) => window.BdT.gallery(root));
  part('invade', (root) => {
    window.BdT.stepper(root); window.BdT.gallery(root);
    let was = 0;
    root.addEventListener('st-step', (e) => { if (e.detail >= 2 && was < 2) window.BdT.jolt(root.querySelector('.al-st'), 2); was = e.detail; });
    return {};
  });
  part('sum3', (root) => window.BdT.sum(root));

  // 체험 장
  part('restore', (root) => {
    const m = window.Restore.mount(root);
    const dv = [...root.querySelectorAll('.rt-dv')], first = dv.map((d) => d.textContent);
    let a = false, b = false, c = false;
    const upd = () => {
      if (dv[0].textContent !== first[0]) a = true;
      if (dv[1].textContent !== first[1]) b = true;
      if (root.querySelector('.rt-now').textContent.startsWith('두 손잡이')) c = true;
      L1.steps(root, c ? 0 : b ? 3 : a ? 2 : 1, [a ? 1 : 0, b ? 2 : 0, c ? 3 : 0]); L1.done(root, c);
    };
    dv.forEach((d) => new MutationObserver(upd).observe(d, { childList: true, characterData: true, subtree: true }));
    upd();
    return m;
  });
  part('wetland', (root) => {
    const m = window.Wetland.mount(root);
    const msg = root.querySelector('.wl-msg'), range = root.querySelector('#wl-t');
    let a = false, b = false, c = false;
    const upd = () => {
      const t = msg.textContent;
      if (t.startsWith('둥지와 희귀 물풀을 모두')) { a = true; b = true; }
      if (b && +range.value >= 95) c = true;
      L1.steps(root, c ? 0 : b ? 3 : a ? 2 : 1, [a ? 1 : 0, b ? 2 : 0, c ? 3 : 0]); L1.done(root, c);
    };
    new MutationObserver(upd).observe(msg, { childList: true, characterData: true, subtree: true });
    range.addEventListener('input', upd);
    upd();
    return m;
  });
  part('alien', (root) => {
    const m = window.Alien.mount(root);
    const gate = root.querySelector('.al-gate'), cnt = root.querySelector('.al-c');
    let a = false, b = false, c = false;
    const upd = () => {
      if (/[1-9]/.test(cnt.textContent)) a = true;
      if (gate.checked) b = true;
      if (root.querySelector('.al-now').textContent.startsWith('«처음부터»')) c = true;
      L1.steps(root, c ? 0 : b ? 3 : a ? 2 : 1, [a ? 1 : 0, b ? 2 : 0, c ? 3 : 0]); L1.done(root, c && a);
    };
    new MutationObserver(upd).observe(cnt, { childList: true, characterData: true, subtree: true });
    onNow(root, '.al-now', () => upd());
    gate.addEventListener('change', upd);
    root.querySelector('.al-again').addEventListener('click', () => { a = b = c = false; upd(); });
    return m;
  });
  part('plan', (root) => {
    const m = window.ActPlan.mount(root);
    let talk = false;
    onNow(root, '.pl-now', (t) => {
      const four = !t.startsWith('카드를 판 위'), best = t.startsWith('왜 그 자리');
      if (best) talk = true;
      L1.steps(root, best ? 3 : four ? 2 : 1, [four ? 1 : 0, best ? 2 : 0, 0]); L1.done(root, talk && best);
    });
    return m;
  });
  part('check3', (root) => { window.LessonParts.mountWrap(root); });
})();
