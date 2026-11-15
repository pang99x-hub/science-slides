/* 2-1 4차시 과학 이야기 «제임스 웹 우주 망원경»(교과서 74쪽). 같은 «창조의 기둥»을 찍은 허블(가시광선)·웹(적외선) 사진을 겹쳐 두고
   가운데 경계 손잡이를 끌면(화살표 키) 한쪽은 허블, 한쪽은 웹으로 보인다. 손대기 전에는 경계가 천천히 오가며 끌 수 있음을 알린다.
   Jwst.mount(root) → { setActive } · 시험용: root._jw.set(0~1) */
(function () {
  'use strict';
  function mount(root) {
    const box = root.querySelector('.jw-wipe'), top = box.querySelector('.jw-b'), out = root.querySelector('.jw-out');
    let k = 0.5, touched = false, raf = 0, t0 = 0, seen = new Set();
    function set(v) {
      k = Math.max(0, Math.min(1, v));
      top.style.clipPath = `inset(0 0 0 ${k * 100}%)`;
      box.style.setProperty('--k', k);
      box.setAttribute('aria-valuenow', String(Math.round(k * 100)));
      if (k < 0.15) seen.add('w'); if (k > 0.85) seen.add('h');
      const h = seen.size === 2 ? '허블은 먼지에 가린 <b>어두운 기둥</b>, 웹은 먼지 너머의 <b>갓 태어난 별</b>까지 — 적외선은 먼지를 잘 뚫는다'
        : k < 0.5 ? '오른쪽 대부분이 <b>웹</b>(적외선): 기둥이 투명해지고 속의 별이 보인다' : '왼쪽 대부분이 <b>허블</b>(가시광선): 먼지 기둥이 짙게 막고 있다';
      if (out.innerHTML !== h) out.innerHTML = h;
    }
    const pt = (e) => { const r = box.getBoundingClientRect(); return (e.clientX - r.left) / r.width; };
    let held = false;
    box.addEventListener('pointerdown', (e) => { held = true; touched = true; try { box.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ } set(pt(e)); });
    box.addEventListener('pointermove', (e) => { if (held) set(pt(e)); });
    const up = () => { held = false; };
    box.addEventListener('pointerup', up); box.addEventListener('pointercancel', up);
    box.addEventListener('keydown', (e) => { const d = { ArrowLeft: -0.05, ArrowRight: 0.05 }[e.key]; if (d) { e.preventDefault(); e.stopPropagation(); touched = true; set(k + d); } });
    const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sway = (t) => { raf = 0; if (touched || reduce()) return; if (!t0) t0 = t; set(0.5 + Math.sin((t - t0) / 900) * 0.18); raf = requestAnimationFrame(sway); };
    set(0.5);
    root._jw = { set: (v) => { touched = true; set(v); } };
    return { setActive(on) { if (on && !raf) raf = requestAnimationFrame(sway); else if (!on && raf) { cancelAnimationFrame(raf); raf = 0; } } };
  }
  window.Jwst = { mount };
})();
