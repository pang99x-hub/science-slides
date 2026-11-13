/* 2차시 표지 «시대 풍경 순서 맞추기»(교과서 16쪽 도입): 이름 없는 네 시대 풍경 카드를 끌어 오래된 것부터 늘어놓는다.
   끄는 동안 다른 카드가 비켜 자리를 내준다. 키보드: 카드에 초점을 두고 ←→로 옮긴다. 맞으면 카드 밑에 시대 이름이 나타난다.
   풍경 그림은 eralens.js의 EraArt.scene을 쓴다. */
(function () {
  'use strict';
  const RIGHT = ['pc', 'pz', 'mz', 'cz'];
  const START = ['mz', 'pc', 'cz', 'pz'];

  function mount(root) {
    const box = root.querySelector('.od-box'), now = root.querySelector('.od-now');
    const Art = window.EraArt;
    let order = START.slice(), solved = false;
    const cards = {};
    RIGHT.forEach((k) => {
      const E = Art.ERAS.find((e) => e.k === k);
      const c = document.createElement('div');
      c.className = 'od-card'; c.dataset.k = k; c.tabIndex = 0; c.setAttribute('role', 'button');
      c.setAttribute('aria-label', '시대 풍경 카드(끌어서 순서 바꾸기, ←→ 키로 옮기기)');
      c.innerHTML = `<svg viewBox="0 0 1000 600" aria-hidden="true">${Art.scene(k, 'od')}</svg><span class="od-name">${E.name}</span>`;
      box.appendChild(c); cards[k] = c;
    });
    const W = 316, H = 214, GX = 20, GY = 46;
    const pos = (i) => ({ x: (i % 2) * (W + GX), y: Math.floor(i / 2) * (H + GY) });
    function layout(skip) {
      order.forEach((k, i) => { if (k === skip) return; const p = pos(i); cards[k].style.left = p.x + 'px'; cards[k].style.top = p.y + 'px'; });
      root.querySelectorAll('.od-slot').forEach((s, i) => { s.classList.toggle('ok', solved || order[i] === RIGHT[i]); });
    }
    function check() {
      const ok = order.every((k, i) => k === RIGHT[i]);
      if (ok && !solved) {
        solved = true; box.classList.add('solved');
        now.textContent = '맞았다! 아래 이름을 보며 무엇이 달라졌는지 말해 보자'; now.classList.add('done');
        if (window.gsap && !Deck.reduce) gsap.from(box.querySelectorAll('.od-name'), { autoAlpha: 0, y: 12, stagger: 0.12, duration: 0.4 });
      } else if (!ok) {
        const n = order.filter((k, i) => k === RIGHT[i]).length;
        now.textContent = n ? `제자리에 놓인 카드 ${n}장 — 나머지를 바꿔 보자` : '오래된 풍경부터 1 → 4로 끌어 놓자';
      }
      layout();
    }
    // 끌기
    Object.values(cards).forEach((c) => {
      let on = null, sx = 0, sy = 0, ox = 0, oy = 0;
      c.addEventListener('pointerdown', (e) => {
        if (e.button || solved) return;
        on = e.pointerId; sx = e.clientX; sy = e.clientY; ox = parseFloat(c.style.left); oy = parseFloat(c.style.top);
        try { c.setPointerCapture(e.pointerId); } catch (err) { /* 합성 */ }
        c.classList.add('drag'); e.stopPropagation();
      });
      c.addEventListener('pointermove', (e) => {
        if (on !== e.pointerId) return;
        const k = (window.Reveal && Reveal.getScale && Reveal.getScale()) || 1;
        const x = ox + (e.clientX - sx) / k, y = oy + (e.clientY - sy) / k;
        c.style.left = x + 'px'; c.style.top = y + 'px';
        // 가장 가까운 칸으로 자리 바꾸기
        let best = 0, bd = Infinity;
        for (let i = 0; i < 4; i++) { const p = pos(i), d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = i; } }
        const cur = order.indexOf(c.dataset.k);
        if (best !== cur) { order.splice(cur, 1); order.splice(best, 0, c.dataset.k); layout(c.dataset.k); }
      });
      const end = (e) => { if (on !== e.pointerId) return; on = null; c.classList.remove('drag'); check(); };
      c.addEventListener('pointerup', end); c.addEventListener('pointercancel', end);
      c.addEventListener('keydown', (e) => {
        const d = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
        if (!d || solved) return; e.preventDefault(); e.stopPropagation();
        const i = order.indexOf(c.dataset.k), j = Math.max(0, Math.min(3, i + d));
        [order[i], order[j]] = [order[j], order[i]]; check(); c.focus();
      });
    });
    layout(); check();
    root._od = { set(arr) { order = arr.slice(); check(); }, get order() { return order.slice(); } };
    return {};
  }
  window.EraOrder = { mount };
})();
