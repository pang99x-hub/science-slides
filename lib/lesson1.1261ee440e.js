/* 1-1-3 1차시 「생물다양성의 세 가지 요소」(교과서 26~27쪽): 장마다 조각을 붙인다.
   차례(2026-10-31 승인 기준으로 다시 짬): 표지 → 설명(생물다양성, 배율 막대) → 설명(유전적 다양성, 사진) → 체험(품종 밭)
   → 설명(종다양성, 방형구) → 체험(포충망) → 설명(생태계다양성, 3D 섬) → 체험(섬 빚기) → 정리(뒤집기 카드) → 확인.
   설명 장은 그림을 조작하면 풀이가 바뀐다(teach.js·quad.js·eco3d.js). 체험 장은 기존 조작 모듈 + 해 볼 일 ①②③(frame.js).
   예측(.share-opts)·확인 ○×(.qs)는 수업방 응답 모으기가 그대로 읽는다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const { single, answerOn } = window.Kit;
  const L1 = window.L1;
  // 체험 장 «지금 할 것» 칩의 글이 바뀔 때마다 fn(글)을 부른다
  const onNow = (root, sel, fn) => { const n = root.querySelector(sel); const go = () => fn(n.textContent.trim()); new MutationObserver(go).observe(n, { childList: true, characterData: true, subtree: true }); go(); };

  part('cover', (root) => {
    const L = window.Lens.mount(root);
    single([...root.querySelectorAll('.share-opts button')]);
    return Object.assign({}, L, answerOn(root, 'pr', '#pr-stable'));
  });

  // 설명 장
  part('what', (root) => {
    const r = window.BdT.stepper(root);
    const cr = root.querySelector('.lv-cr'), ims = [...root.querySelectorAll('.st-im')];
    const show = (k) => { cr.textContent = '사진: ' + (ims[k].dataset.cr || ''); root.querySelector('.lv-stage').dataset.k = k; };
    root.addEventListener('st-step', (e) => show(e.detail)); show(0);
    return r;
  });
  part('gene', (root) => window.BdT.gallery(root));
  part('species', (root) => window.BdQuad.mount(root));
  part('eco', (root) => window.BdEco.mount(root));
  part('sum1', (root) => window.BdT.sum(root));

  // 체험 장: 기존 모듈 + 해 볼 일
  part('crop', (root) => {
    const m = window.Field.mount(root);
    let mono = false, mixed = false;
    onNow(root, '.gf-now', (t) => {
      const kinds = +(root.querySelector('.gf-mix').textContent.match(/(\d+)가지/) || [0, 0])[1];
      if (t.startsWith('«다시 심기»')) { if (kinds <= 1) mono = true; else mixed = true; }
      const ok = [mono || mixed ? 1 : 0, mono || mixed ? 2 : 0, mono && mixed ? 3 : 0];
      const now = mono && mixed ? 0 : t.includes('퍼뜨리기') || t.includes('번지는') ? 2 : mono ? 3 : 1;
      L1.steps(root, now, ok); L1.done(root, mono && mixed);
    });
    return m;
  });
  part('meadow', (root) => {
    const m = window.Meadow.mount(root);
    const rows = [...root.querySelectorAll('.md-tr')];
    const upd = () => {
      const d = rows.map((r) => r.classList.contains('done')), all = d.every(Boolean);
      L1.steps(root, all ? 0 : d[0] ? 2 : 1, [d[0] ? 1 : 0, all ? 2 : 0, all ? 3 : 0]); L1.done(root, all);
    };
    rows.forEach((r) => new MutationObserver(upd).observe(r, { attributes: true, attributeFilter: ['class'] }));
    upd();
    return m;
  });
  part('island', (root) => {
    const m = window.Island.mount(root);
    const items = () => Object.fromEntries([...root.querySelectorAll('.il-list li')].map((li) => [li.dataset.k, li.classList.contains('on')]));
    const upd = () => {
      const o = items(), n = Object.values(o).filter(Boolean).length;
      const a = !!(o.forest || o.alpine), b = !!o.lake, c = n >= 5;
      L1.steps(root, c && a && b ? 0 : !a ? 1 : !b ? 2 : 3, [a ? 1 : 0, b ? 2 : 0, c ? 3 : 0]); L1.done(root, a && b && c);
    };
    const list = root.querySelector('.il-list');
    new MutationObserver(upd).observe(list, { attributes: true, subtree: true, attributeFilter: ['class'], childList: true });
    upd();
    return m;
  });
  part('check1', (root) => { window.LessonParts.mountWrap(root); });
})();
