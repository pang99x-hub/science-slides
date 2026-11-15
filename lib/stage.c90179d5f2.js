/* 캔버스 조각이 함께 쓰는 도구(2-2-1 2차시부터, 2-2-3부터 엔진 공용). 장에 묶이지 않게 캔버스·root만 받는다.
   Stage.fit(cv)  캔버스를 화면 크기에 맞춘다(슬라이드 좌표 = clientWidth/Height, 해상도는 화면 배율까지)
   Stage.loop(step)  장이 보일 때만 도는 애니메이션 고리(dt 초)
   Stage.tok('e-heat')  색 토큰 */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function fit(cv) {
    const w = cv.clientWidth || 1, h = cv.clientHeight || 1;
    const s = Math.min(2, (window.devicePixelRatio || 1) * (window.Reveal && Reveal.getScale ? Reveal.getScale() : 1)) || 1;
    cv.width = Math.round(w * s); cv.height = Math.round(h * s);
    const ctx = cv.getContext('2d'); ctx.setTransform(s, 0, 0, s, 0, 0);
    return { ctx, w, h };
  }
  function loop(step) {
    let raf = 0, last = 0, on = false;
    const tick = (t) => { if (!on) return; const dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016); last = t; step(dt); raf = requestAnimationFrame(tick); };
    return {
      start() { if (on) return; on = true; last = 0; raf = requestAnimationFrame(tick); },
      stop() { on = false; cancelAnimationFrame(raf); },
      get on() { return on; },
    };
  }
  let css = null;
  const tok = (k) => { css = css || getComputedStyle(document.documentElement); return css.getPropertyValue('--' + k).trim(); };
  // 글자 둘레에 종이색 테두리를 둘러 그림 위에서도 읽히게
  function label(ctx, t, x, y, font = '700 22px "IBM Plex Sans KR", sans-serif', align = 'center') {
    ctx.font = font; ctx.textAlign = align; ctx.lineJoin = 'round';
    ctx.lineWidth = 6; ctx.strokeStyle = tok('paper-2'); ctx.strokeText(t, x, y);
    ctx.fillStyle = tok('ink'); ctx.fillText(t, x, y);
  }
  // 장 모듈이 돌려줄 기본 모양: 보일 때만 돌고, 움직임 줄이기면 한 번만 그린다
  function mountLoop(cv, step, draw) {
    let g = fit(cv);
    const l = loop((dt) => step(dt, g));
    return {
      get g() { return g; },
      setActive(on) { if (on) { g = fit(cv); if (reduce) { step(0.016, g); draw(g); } else l.start(); } else l.stop(); },
      fit() { g = fit(cv); draw(g); },
    };
  }
  window.Stage = { fit, loop, tok, label, mountLoop, reduce };
})();
