/* 2-2-3 기존 체험 장에 «해 볼 일 ①②③ + 알게 된 것»을 덧붙인다(2026-10-31 보완: 기존 조작·그림은 그대로 두고 더하기만).
   UDock.mount(root, { steps: ['…','…','…'], learn: 'html', on: [조건, 조건, 조건] })
     조건: 선택자 문자열 = 그 요소(안쪽 포함)를 누르거나 끌거나 막대를 움직이면 끝 · 함수(root) = 참이 되면 끝(장에 있는 동안 0.4초마다 살핀다)
   해 볼 일은 눈썹 글 줄 오른쪽(.u-dock, 머리 칸 안에 두어 엔진 칸 맞춤이 줄이지 않게), 셋을 다 하면 «알게 된 것»이 꼬리말 자리에 한 줄로 뜬다(.u-toast, ✕로 접기).
   시험용: root._dock.mark(i) · root._dock.state() */
(function () {
  'use strict';
  const DIG = '①②③④⑤';
  function mount(root, cfg) {
    const frame = root.querySelector('.frame');
    const dock = document.createElement('div'); dock.className = 'u-dock';
    dock.innerHTML = '<span>해 볼 일</span><ol class="u-steps">' + cfg.steps.map((s, i) => `<li data-s="${i + 1}"><b>${DIG[i]}</b> ${s}</li>`).join('') + '</ol>';
    const toast = document.createElement('div'); toast.className = 'u-learn u-toast'; toast.setAttribute('aria-live', 'polite');
    toast.innerHTML = `<b>알게 된 것</b><p>${cfg.learn}</p><button type="button" class="u-x" aria-label="알게 된 것 접기">✕</button>`;
    (root.querySelector('.head') || frame).appendChild(dock); root.appendChild(toast);   // 꼬리말 자리에 띄우려고 장(section)에 단다
    toast.querySelector('.u-x').addEventListener('click', (e) => { e.stopPropagation(); toast.classList.add('closed'); });
    const ok = cfg.steps.map(() => false);
    const paint = () => {
      const now = ok.indexOf(false) + 1;
      window.L1.steps(root, now, ok.map((v, i) => (v ? i + 1 : 0)).filter(Boolean));
      window.L1.done(root, now === 0);
    };
    const mark = (i) => { if (!ok[i]) { ok[i] = true; paint(); } };
    cfg.on.forEach((c, i) => {
      if (typeof c !== 'string') return;
      const hit = (e) => { if (e.target.closest && e.target.closest(c) && root.contains(e.target)) mark(i); };
      ['pointerdown', 'click', 'input', 'change', 'keydown'].forEach((t) => root.addEventListener(t, hit, true));
    });
    let tm = 0;
    const poll = () => cfg.on.forEach((c, i) => { if (typeof c === 'function' && !ok[i]) { try { if (c(root)) mark(i); } catch { /* 아직 준비 안 됨 */ } } });
    paint();
    root._dock = { mark, state: () => ok.slice() };
    return { setActive(on) { clearInterval(tm); if (on) { poll(); tm = setInterval(poll, 400); } } };
  }
  window.UDock = { mount };
})();
