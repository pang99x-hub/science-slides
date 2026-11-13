/* 끌어다 놓기(카드 → 칸) 도우미(엔진 공용, 2-2-3부터). 손가락·마우스로 끌어도 되고, 카드를 누른 뒤 칸을 눌러도 된다(키보드·작은 화면).
   Drag.cards(카드 목록, { find(요소) → 놓을 칸|null, drop(카드, 칸|null), hover(칸|null), pick(카드|null) })
   카드는 놓은 뒤 제자리로 돌아온다(같은 카드를 여러 번 쓸 수 있게). 슬라이드 배율(Reveal.getScale)만큼 나눠 따라오게 한다. */
(function () {
  'use strict';
  function cards(list, o) {
    let picked = null;
    const setPick = (c) => {
      if (picked) picked.setAttribute('aria-pressed', 'false');
      picked = c;
      if (c) c.setAttribute('aria-pressed', 'true');
      if (o.pick) o.pick(c);
    };
    function under(c, e) {
      c.style.visibility = 'hidden';
      const el = document.elementFromPoint(e.clientX, e.clientY);
      c.style.visibility = '';
      return el ? o.find(el) : null;
    }
    list.forEach((c) => {
      c.setAttribute('aria-pressed', 'false');
      let sx = 0, sy = 0, moved = false, on = false, last = null;
      c.addEventListener('pointerdown', (e) => {
        if (e.button) return;
        sx = e.clientX; sy = e.clientY; moved = false; on = true;
        c.setPointerCapture(e.pointerId); e.stopPropagation();
      });
      c.addEventListener('pointermove', (e) => {
        if (!on) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (!moved && Math.hypot(dx, dy) < 6) return;
        if (!moved) { moved = true; setPick(null); }
        const k = (window.Reveal && Reveal.getScale && Reveal.getScale()) || 1;
        c.classList.add('drag'); c.style.transform = `translate(${dx / k}px, ${dy / k}px)`;
        const t = under(c, e);
        if (t !== last) { last = t; if (o.hover) o.hover(t); }
      });
      const end = (e, cancel) => {
        if (!on) return; on = false;
        if (!moved) { if (!cancel) setPick(picked === c ? null : c); return; }
        const t = cancel ? null : under(c, e);
        c.classList.remove('drag'); c.style.transform = '';
        if (o.hover) o.hover(null); last = null;
        o.drop(c, t);
      };
      c.addEventListener('pointerup', (e) => end(e, false));
      c.addEventListener('pointercancel', (e) => end(e, true));
      c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); });
      c.addEventListener('click', (e) => { if (e.detail === 0) setPick(picked === c ? null : c); });   // 키보드로 누를 때
    });
    return { get picked() { return picked; }, unpick: () => setPick(null) };
  }
  window.Drag = { cards };
})();
