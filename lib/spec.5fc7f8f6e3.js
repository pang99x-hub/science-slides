/* 2-1 스펙트럼 공용 도구. 파장(nm) → 색, 띠 그리기(연속·방출·흡수).
   선 위치는 실제 가시광선 선(nm)을 쓴다. Spec.LINES[원소] = [[파장, 세기]…]
   Spec.band(c, x, y, w, h, { mode: 'cont'|'emit'|'abs', lines, glow }) · Spec.xOf(nm, x, w) · Spec.rgb(nm, 밝기) */
(function () {
  'use strict';
  const LO = 400, HI = 700;
  const LINES = {
    H: [[410.2, .5], [434.0, .6], [486.1, .8], [656.3, 1]],
    He: [[447.1, .7], [471.3, .4], [492.2, .5], [501.6, .7], [587.6, 1], [667.8, .6]],
    Na: [[568.8, .3], [589.0, 1], [589.6, 1], [615.4, .3]],
    O: [[557.7, 1], [630.0, .8], [636.4, .4]],
    Ca: [[422.7, 1], [443.5, .5], [445.5, .6], [616.2, .4]],
  };
  const NAME = { H: '수소', He: '헬륨', Na: '나트륨', O: '산소', Ca: '칼슘' };
  function rgb(nm, k = 1) {
    let r = 0, g = 0, b = 0;
    if (nm < 440) { r = -(nm - 440) / 60; b = 1; } else if (nm < 490) { g = (nm - 440) / 50; b = 1; } else if (nm < 510) { g = 1; b = -(nm - 510) / 20; }
    else if (nm < 580) { r = (nm - 510) / 70; g = 1; } else if (nm < 645) { r = 1; g = -(nm - 645) / 65; } else { r = 1; }
    const f = nm < 420 ? 0.3 + 0.7 * (nm - 380) / 40 : nm > 680 ? 0.3 + 0.7 * (720 - nm) / 40 : 1;
    const c = (v) => Math.round(255 * Math.pow(Math.max(0, v * f * k), 0.8));
    return `rgb(${c(r)},${c(g)},${c(b)})`;
  }
  const xOf = (nm, x, w) => x + (nm - LO) / (HI - LO) * w;
  function band(c, x, y, w, h, o = {}) {
    const mode = o.mode || 'cont', lines = o.lines || [];
    c.save();
    c.fillStyle = '#05060a'; c.fillRect(x, y, w, h);
    if (mode !== 'emit') {
      const g = c.createLinearGradient(x, 0, x + w, 0);
      for (let i = 0; i <= 30; i++) { const nm = LO + (HI - LO) * i / 30; g.addColorStop(i / 30, rgb(nm, mode === 'dim' ? 0.35 : 1)); }
      c.fillStyle = g; c.fillRect(x, y, w, h);
    }
    const lw = Math.max(2.5, w / 260);
    lines.forEach(([nm, s]) => {
      const lx = xOf(nm, x, w);
      if (mode === 'abs') { c.fillStyle = `rgba(0,0,0,${0.55 + 0.45 * s})`; c.fillRect(lx - lw / 2, y, lw, h); }
      else if (mode === 'emit') {
        if (o.glow !== false) { c.shadowColor = rgb(nm); c.shadowBlur = 14 * s; }
        c.fillStyle = rgb(nm, 0.4 + 0.6 * s); c.fillRect(lx - lw / 2, y, lw, h); c.shadowBlur = 0;
      }
    });
    c.restore();
  }
  // 눈금(400~700 nm)
  function scale(c, x, y, w, color = '#4a5468') {
    c.save(); c.fillStyle = color; c.strokeStyle = color; c.lineWidth = 1.5; c.font = '600 19px "IBM Plex Mono", monospace';
    for (let nm = LO; nm <= HI; nm += 50) { const lx = xOf(nm, x, w); c.beginPath(); c.moveTo(lx, y); c.lineTo(lx, y + 7); c.stroke(); c.textAlign = nm === LO ? 'left' : nm === HI ? 'right' : 'center'; c.fillText(String(nm), lx, y + 26); }
    c.restore();
  }
  window.Spec = { LINES, NAME, rgb, xOf, band, scale, LO, HI };
})();
