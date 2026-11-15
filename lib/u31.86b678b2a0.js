/* 3-1 공통(2026-10-31 보완): 기존 조작 장의 오른쪽 칸 «해 볼 일 ①②③ + 알게 된 것»을 조작 상태에 맞춘다.
   U31.track(root, 판정) — 장 안의 모양이 바뀔 때마다(조작 모듈은 그대로) 판정()을 다시 불러 지금 단계(1~3, 0 = 끝)를 L1.steps·L1.done으로 표시한다.
   U31.rows(root, 갤러리 선택자, 줄 선택자) — 사진을 누르면 data-row가 같은 왼쪽 줄이 밝아진다.
   U31.single(단추들) — 예측 보기 하나만 고르기. */
(function () {
  'use strict';
  function mark(root, n, max = 3) {
    const ok = []; for (let k = 1; k <= max; k++) if (n === 0 || k < n) ok.push(k);
    window.L1.steps(root, n, ok); window.L1.done(root, n === 0);
  }
  function track(root, judge, max = 3) {
    let last = null, raf = 0, best = 1;
    const upd = () => {
      raf = 0;
      let n = judge(); if (n == null) return;
      // 한 번 지난 단계로는 되돌아가지 않는다(끝 = 0은 그대로 유지)
      if (last === 0) n = 0; else if (n !== 0) { best = Math.max(best, n); n = best; }
      if (n === last) return; last = n; mark(root, n, max);
    };
    const later = () => { if (!raf) raf = requestAnimationFrame(upd); };
    new MutationObserver(later).observe(root, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ['class', 'value', 'aria-pressed'] });
    root.addEventListener('input', later); root.addEventListener('click', later); root.addEventListener('pointerup', later);
    upd();
    return { reset() { last = null; best = 1; upd(); } };
  }
  function rows(root, rowSel) {
    const rs = [...root.querySelectorAll(rowSel)];
    root.querySelector('.gv').addEventListener('gv-pick', (e) => rs.forEach((x) => x.classList.toggle('on', x.dataset.k === e.detail.b.dataset.row)));
  }
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  window.U31 = { mark, track, rows, single };
})();
