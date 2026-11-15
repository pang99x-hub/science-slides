/* 2-1 조작 장 공용 도구(캔버스 + 손 조작 + 계속 도는 애니메이션).
   Play.make(stage, { draw(c, W, H, dt), down(p, e), move(p, e), up(p, e), key(e) }) → { fit, setActive, W, H, c, redraw }
   p = { x, y } 캔버스 좌표(슬라이드 배율을 나눈 값). 장이 보일 때만 매 프레임 draw(dt)를 부른다(움직임 줄이기 설정이면 조작할 때만). */
(function () {
  'use strict';
  const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function make(stage, o) {
    const cv = stage.querySelector('canvas'), c = cv.getContext('2d');
    const S = { W: 0, H: 0, c, cv, active: false };
    let raf = 0, last = 0, held = false;
    function fit() {
      const k = (window.Reveal && Reveal.getScale) ? Reveal.getScale() : 1;
      S.W = stage.offsetWidth; S.H = stage.offsetHeight; if (!S.W) return;
      const dpr = Math.max(1, Math.min(2, (window.devicePixelRatio || 1) * k));
      cv.width = Math.round(S.W * dpr); cv.height = Math.round(S.H * dpr); c.setTransform(dpr, 0, 0, dpr, 0, 0);
      o.draw(c, S.W, S.H, 0);
    }
    const frame = (t) => { raf = 0; if (!S.active) return; const dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016); last = t; o.draw(c, S.W, S.H, dt); if (!reduce() || held) raf = requestAnimationFrame(frame); };
    const kick = () => { if (S.active && !raf) { last = 0; raf = requestAnimationFrame(frame); } };
    const pt = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * S.W, y: (e.clientY - r.top) / r.height * S.H }; };
    cv.addEventListener('pointerdown', (e) => { held = true; try { cv.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ } cv.classList.add('holding'); if (o.down) o.down(pt(e), e); kick(); });
    cv.addEventListener('pointermove', (e) => { if (o.move) o.move(pt(e), e, held); if (held) kick(); });
    const up = (e) => { if (!held) return; held = false; cv.classList.remove('holding'); if (o.up) o.up(pt(e), e); kick(); };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    if (o.key) cv.addEventListener('keydown', (e) => { if (o.key(e)) { e.preventDefault(); e.stopPropagation(); kick(); } });
    if (window.ResizeObserver) new ResizeObserver(() => { if (stage.offsetWidth) fit(); }).observe(stage);
    S.fit = fit; S.kick = kick;
    S.redraw = () => o.draw(c, S.W, S.H, 0);
    S.setActive = (on) => { S.active = on; if (on) { fit(); kick(); } else if (raf) { cancelAnimationFrame(raf); raf = 0; } };
    return S;
  }
  const txt = (c, t, x, y, col = '#fbfcf9', f = '700 22px', al = 'center') => { c.fillStyle = col; c.font = `${f} "IBM Plex Sans KR", sans-serif`; c.textAlign = al; c.fillText(t, x, y); };
  const glow = (c, x, y, r, inner, outer = 'rgba(0,0,0,0)') => { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, inner); g.addColorStop(1, outer); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); };
  window.Play = { make, txt, glow };
})();
