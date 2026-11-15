/* 2-2-2 보완(2026-10-31): 기존 조작 장에 «해 볼 일 ①②③ + 알게 된 것»을 붙이는 공통 손잡이.
   기존 조작 모듈은 그대로 두고, 그 모듈이 바꾸는 화면 상태(표 칸·단추·글)를 읽어 단계를 맞춘다.
   Gx.track(root, [조건1, 조건2, 조건3], 말?) : 조건은 화면을 읽는 함수. 한 번 참이 되면 그 단계는 끝(✓)으로 남는다.
     장이 보일 때만 0.4초마다 읽는다. 모두 끝나면 «알게 된 것»(L1.done).
   Gx.single(단추들) : 예측 보기 하나만 고르기(.share-opts — 수업방이 반 전체 답을 센다).
   Gx.join(...조각) : 한 장에 조각이 여럿일 때 setActive·fit 등을 함께 부른다.
   시험용: root._gx.all() 모든 단계를 끝난 것으로 */
(function () {
  'use strict';
  function track(root, conds, say) {
    const L1 = window.L1, n = conds.length, ok = new Array(n).fill(false);
    const msg = root.querySelector('.gx-msg');
    let last = -2;
    const upd = () => {
      conds.forEach((c, i) => { if (!ok[i]) { try { if (c(root)) ok[i] = true; } catch { /* 아직 없음 */ } } });
      let cur = ok.indexOf(false); cur = cur < 0 ? 0 : cur + 1;
      if (cur === last) return; last = cur;
      L1.steps(root, cur, ok.map((v, i) => (v ? i + 1 : 0)).filter(Boolean));
      L1.done(root, cur === 0);
      if (msg && say) msg.textContent = say[cur] || '';
    };
    let tm = 0;
    upd();
    root._gx = { all() { ok.fill(true); upd(); }, upd };
    return {
      setActive(on) { clearInterval(tm); tm = 0; if (on) { upd(); tm = setInterval(upd, 400); } },
    };
  }
  function single(btns) {
    btns.forEach((b) => b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') !== 'true';
      btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
    }));
  }
  function join(...parts) {
    parts = parts.filter(Boolean);
    const out = {};
    for (const k of ['setActive', 'fit', 'fragment', 'sync']) {
      const fs = parts.filter((p) => typeof p[k] === 'function');
      if (fs.length) out[k] = (...a) => fs.forEach((p) => p[k](...a));
    }
    return out;
  }
  window.Gx = { track, single, join };
})();
