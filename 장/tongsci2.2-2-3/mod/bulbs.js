/* 같은 밝기, 다른 전구: 선반의 백열등·형광등·발광 다이오드를 끌어다(또는 눌러) 천장 전등에 바꿔 끼운다.
   밝기(빛 원뿔·밝기 측정기)는 셋 다 같고, 전기 사용량 바늘과 전구 둘레의 열(붉은 기운·아지랑이)이 달라진다.
   손(✋)을 끌어 전구에 가까이 가면 온도계가 오른다. 오른쪽 막대는 끼워 본 전구만 나타난다:
   빛 몫은 같고 열 몫만큼 공급한 전기가 길어진다. 값은 비교를 위한 그림(교과서에 수치 없음). */
(function () {
  'use strict';
  const B = {
    inc: { name: '백열등', sup: 1, heat: 1 },
    cfl: { name: '형광등', sup: 0.32, heat: 0.42 },
    led: { name: '발광 다이오드', sup: 0.18, heat: 0.14 },
  };
  const LIGHT = 0.06;                                   // 같은 밝기의 빛 몫(가장 긴 막대에 대한 비율)
  const SOCK = { x: 430, y: 262 };

  function mount(root) {
    const svg = root.querySelector('.bl-svg'), q = (s) => svg.querySelector(s);
    const cur = q('.bl-cur'), needle = q('.bl-needle'), heatG = q('.bl-heatg'), hw = q('.bl-hw'), capN = q('.bl-capn');
    const hand = q('.bl-hand'), thF = q('.bl-th-f'), feel = q('.bl-feel');
    const picks = [...svg.querySelectorAll('.bl-pick')], rows = [...root.querySelectorAll('.bl-row')];
    const tried = new Set(['inc']);
    let now = 'inc', hp = { x: 170, y: 330 }, shown = 0;

    const pt = (e) => { const r = svg.getBoundingClientRect(); return { x: (e.clientX - r.left) * 1056 / r.width, y: (e.clientY - r.top) * 652 / r.height }; };
    function feelHand() {
      const d = Math.hypot(hp.x - SOCK.x, hp.y - SOCK.y), near = Math.max(0, Math.min(1, 1 - (d - 70) / 420));
      const r = B[now].heat * near;
      hand.setAttribute('transform', `translate(${hp.x} ${hp.y})`);
      const h = 18 + 72 * Math.min(1, r * 1.1);
      thF.setAttribute('y', String(95 - h)); thF.setAttribute('height', String(h));
      thF.style.fill = r > 0.55 ? 'var(--e-heat)' : r > 0.25 ? '#f0883e' : '#7fa8c9';
      feel.textContent = r > 0.55 ? '앗, 뜨거워요!' : r > 0.25 ? '따뜻해요' : r > 0.1 ? '조금 따뜻해요' : '미지근해요';
    }
    function set(k) {
      now = k; tried.add(k);
      cur.setAttribute('href', `#bl-${k}`);
      const ang = -78 + 156 * B[k].sup;
      if (window.gsap && !window.Deck.reduce) gsap.to(needle, { rotation: ang, svgOrigin: '125 120', duration: 0.6, ease: 'back.out(1.6)', overwrite: true });
      else needle.setAttribute('transform', `rotate(${ang} 125 120)`);
      heatG.style.opacity = String(0.15 + 0.85 * B[k].heat);
      hw.style.opacity = String(B[k].heat);
      hw.style.setProperty('--sp', `${2.4 - 1.2 * B[k].heat}s`);
      capN.textContent = B[k].name;
      picks.forEach((p) => p.classList.toggle('in', p.dataset.b === k));
      rows.forEach((r) => {
        const b = B[r.dataset.b], on = tried.has(r.dataset.b);
        r.classList.toggle('on', on); r.classList.toggle('cur', r.dataset.b === k);
        r.querySelector('b').style.width = on ? `${b.sup * 100}%` : '0%';
        r.querySelector('.lt').style.width = `${LIGHT / b.sup * 100}%`;
      });
      if (window.gsap && !window.Deck.reduce && shown) gsap.fromTo(cur, { y: -10 }, { y: 0, duration: 0.35, ease: 'bounce.out' });
      shown++;
      feelHand();
    }
    // 선반 전구: 눌러서 또는 끌어서 바꿔 끼우기
    picks.forEach((p) => {
      const base = p.getAttribute('transform');
      let on = false, moved = false, s0 = null;
      p.addEventListener('pointerdown', (e) => { on = true; moved = false; s0 = pt(e); try { p.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ } e.stopPropagation(); });
      p.addEventListener('pointermove', (e) => {
        if (!on) return;
        const a = pt(e);
        if (!moved && Math.hypot(a.x - s0.x, a.y - s0.y) < 6) return;
        moved = true; p.classList.add('drag');
        p.setAttribute('transform', `translate(${a.x} ${a.y + 60}) rotate(180) scale(.56)`);
      });
      const end = (e) => {
        if (!on) return; on = false; p.classList.remove('drag'); p.setAttribute('transform', base);
        if (!moved) { set(p.dataset.b); return; }
        const a = pt(e);
        if (Math.hypot(a.x - SOCK.x, a.y - SOCK.y) < 170) set(p.dataset.b);
      };
      p.addEventListener('pointerup', end); p.addEventListener('pointercancel', () => { on = false; p.setAttribute('transform', base); });
      p.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); set(p.dataset.b); } });
    });
    // 손 끌기
    let hold = false;
    hand.addEventListener('pointerdown', (e) => { hold = true; hand.setPointerCapture(e.pointerId); e.stopPropagation(); });
    hand.addEventListener('pointermove', (e) => { if (!hold) return; const a = pt(e); hp = { x: Math.max(60, Math.min(720, a.x)), y: Math.max(90, Math.min(470, a.y)) }; feelHand(); });
    hand.addEventListener('pointerup', () => { hold = false; });
    hand.addEventListener('keydown', (e) => {
      const d = { ArrowLeft: [-30, 0], ArrowRight: [30, 0], ArrowUp: [0, -30], ArrowDown: [0, 30] }[e.key];
      if (d) { e.preventDefault(); e.stopPropagation(); hp = { x: Math.max(60, Math.min(720, hp.x + d[0])), y: Math.max(90, Math.min(470, hp.y + d[1])) }; feelHand(); }
    });
    // 예측 하나 고르기
    const opts = [...root.querySelectorAll('.bl-share button')];
    opts.forEach((b) => b.addEventListener('click', () => { const on = b.getAttribute('aria-pressed') !== 'true'; opts.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b))); }));
    set('inc');
    return { setActive(on) { if (on) feelHand(); } };
  }
  window.BulbSwap = { mount };
})();
