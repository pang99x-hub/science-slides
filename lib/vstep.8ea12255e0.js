/* 1-2-2 Manim 단계 영상 넘기기(2026-10-31 선생님: «정지 그림이 아니라 실제로 움직이는 Manim»).
   단계 단추를 누르면 그 단계 영상(3~6초, 소리 없음)이 처음부터 재생되고 마지막 장면에서 멈춘다(덮개 = 마지막 장면).
   «다시 보기»로 다시 재생. 지금 단계 풀이(.st-text li)가 카드(.st-tag .st-name .st-d)에 나온다.
   ABVStep.mount(root) → 장 조각 · 시험용 root._vs.set(k) */
(function () {
  'use strict';
  function mount(root) {
    const vids = [...root.querySelectorAll('.vs-v')], pills = [...root.querySelectorAll('.st-pills button')];
    const tag = root.querySelector('.st-tag'), nm = root.querySelector('.st-name'), d = root.querySelector('.st-d');
    const items = [...root.querySelectorAll('.st-text li')].map((li) => ({ n: li.querySelector('h4').innerHTML, d: li.querySelector('p').innerHTML }));
    const again = root.querySelector('.vs-again');
    let cur = 0, active = false;
    const play = (v) => { try { v.currentTime = 0; } catch { /* 아직 못 읽음 */ } const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    function set(k, run = true) {
      cur = Math.max(0, Math.min(vids.length - 1, k));
      vids.forEach((v, i) => { v.hidden = i !== cur; if (i !== cur) v.pause(); });
      pills.forEach((b, i) => { b.setAttribute('aria-pressed', String(i === cur)); b.classList.toggle('past', i < cur); });
      if (tag) tag.textContent = `${cur + 1}단계 / ${vids.length}`;
      if (items[cur]) { nm.innerHTML = items[cur].n; d.innerHTML = items[cur].d; }
      root.dispatchEvent(new CustomEvent('st-step', { detail: cur }));
      if (run && active) play(vids[cur]);
    }
    pills.forEach((b, i) => b.addEventListener('click', () => set(i)));
    if (again) again.addEventListener('click', () => play(vids[cur]));
    root.addEventListener('keydown', (e) => {
      if (!e.target.closest || !e.target.closest('.st-pills')) return;
      const m = { ArrowLeft: -1, ArrowRight: 1 }[e.key]; if (m) { e.preventDefault(); e.stopPropagation(); set(cur + m); pills[cur].focus(); }
    });
    set(0, false);
    root._vs = { set: (k) => set(k), get cur() { return cur; } };
    return { setActive(on) { active = on; if (on) play(vids[cur]); else vids.forEach((v) => v.pause()); } };
  }
  window.ABVStep = { mount };
})();
