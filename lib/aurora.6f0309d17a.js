/* 2-1 1차시 표지 «오로라의 색»(교과서 48쪽 도입). 오로라 사진 위의 둥근 분광기를 끌어 대면
   그 자리의 빛을 나눈 띠가 아래에 나온다. 초록 부분에서는 557.7 nm 초록 선 하나가 또렷하다(누구의 선인지는 마지막 장에서 푼다).
   사진 색을 읽어 초록이 짙으면 초록 선, 붉은 기가 돌면 붉은 선(630 nm)이 세진다.
   Aurora.mount(root) → { fit, setActive } · 시험용: root._au.at(x비율, y비율) */
(function () {
  'use strict';
  function mount(root) {
    const stage = root.querySelector('.au-stage'), cv = stage.querySelector('canvas'), c = cv.getContext('2d');
    const img = root.querySelector('.au-src'), now = root.querySelector('.au-now'), out = root.querySelector('.au-out');
    const off = document.createElement('canvas'), oc = off.getContext('2d', { willReadFrequently: true });
    let W = 0, H = 0, lx = 0.15, ly = 0.75, drag = false, found = false, sg = 0, sr = 0, ready = false;
    const PH = () => H - 92;            // 사진 높이(아래 92px은 띠)
    function fit() {
      const k = (window.Reveal && Reveal.getScale) ? Reveal.getScale() : 1;
      W = stage.offsetWidth; H = stage.offsetHeight; if (!W) return;
      const dpr = Math.max(1, Math.min(2, (window.devicePixelRatio || 1) * k));
      cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); c.setTransform(dpr, 0, 0, dpr, 0, 0);
      off.width = Math.round(W); off.height = Math.round(PH());
      if (img.complete && img.naturalWidth) { cover(oc, off.width, off.height); ready = true; }
      sample(); draw();
    }
    function cover(ctx, w, h) {           // 사진을 칸에 꽉 채워(가운데 맞춤) 그린다
      const r = Math.max(w / img.naturalWidth, h / img.naturalHeight), iw = img.naturalWidth * r, ih = img.naturalHeight * r;
      ctx.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih);
    }
    function sample() {
      if (!ready) return;
      const R = 34, x = Math.round(lx * W), y = Math.round(ly * PH());
      let r = 0, g = 0, b = 0, n = 0;
      try {
        const d = oc.getImageData(Math.max(0, x - R), Math.max(0, y - R), R * 2, R * 2).data;
        for (let i = 0; i < d.length; i += 16) { r += d[i]; g += d[i + 1]; b += d[i + 2]; n++; }
      } catch (e) { return; }
      r /= n; g /= n; b /= n;
      sg = Math.max(0, Math.min(1, (g - (r + b) / 2) / 70));
      sr = Math.max(0, Math.min(1, (r - g) / 60)) * Math.min(1, (r + g + b) / 260);
      if (sg > 0.7 && !found) { found = true; root.classList.add('au-found'); }
    }
    function draw() {
      if (!W) return;
      c.clearRect(0, 0, W, H);
      if (ready) cover(c, W, PH()); else { c.fillStyle = '#0e1630'; c.fillRect(0, 0, W, PH()); }
      const x = lx * W, y = ly * PH();
      // 분광기 렌즈
      c.save(); c.lineWidth = 6; c.strokeStyle = '#fbfcf9'; c.beginPath(); c.arc(x, y, 38, 0, Math.PI * 2); c.stroke();
      c.lineWidth = 2; c.strokeStyle = '#1d2433'; c.beginPath(); c.arc(x, y, 42, 0, Math.PI * 2); c.stroke();
      c.fillStyle = '#fbfcf9'; c.font = '700 22px "IBM Plex Sans KR", sans-serif'; c.textAlign = 'center'; c.fillText('분광기', x, y - 52); c.restore();
      // 아래: 렌즈 속 빛을 나눈 띠
      const by = PH() + 10, bx = 16, bw = W - 32;
      c.fillStyle = '#0b0e18'; c.fillRect(0, PH(), W, H - PH());
      const lines = [[557.7, sg], [630.0, Math.max(sr, sg * 0.15)], [636.4, sr * 0.5]].filter((l) => l[1] > 0.05);
      window.Spec.band(c, bx, by, bw, 46, { mode: 'emit', lines });
      window.Spec.scale(c, bx, by + 48, bw, '#b9c2d8');
      if (sg > 0.5) { const gx = window.Spec.xOf(557.7, bx, bw); c.fillStyle = '#fbfcf9'; c.font = '700 21px "IBM Plex Sans KR", sans-serif'; c.textAlign = 'left'; c.fillText('← 557.7 nm', gx + 10, by + 29); }
      now.textContent = found ? '초록 선 하나가 또렷하다 — 누구의 선일까?' : '분광기를 끌어 초록 빛에 대 보자';
      now.classList.toggle('done', found);
      out.textContent = sg > 0.5 ? '초록 빛 → 557.7 nm 자리에 밝은 선' : sr > 0.3 ? '붉은 빛 → 630 nm 자리에 붉은 선' : '어두운 하늘 → 선이 거의 없다';
    }
    function at(px, py) { lx = Math.max(0.04, Math.min(0.96, px)); ly = Math.max(0.08, Math.min(0.92, py)); sample(); draw(); }
    const pos = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width, (e.clientY - r.top) / r.height * H / PH()]; };
    cv.addEventListener('pointerdown', (e) => { drag = true; cv.setPointerCapture(e.pointerId); cv.classList.add('holding'); at(...pos(e)); });
    cv.addEventListener('pointermove', (e) => { if (drag) at(...pos(e)); });
    const up = () => { drag = false; cv.classList.remove('holding'); };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('keydown', (e) => {
      const d = { ArrowLeft: [-0.04, 0], ArrowRight: [0.04, 0], ArrowUp: [0, -0.05], ArrowDown: [0, 0.05] }[e.key];
      if (d) { e.preventDefault(); e.stopPropagation(); at(lx + d[0], ly + d[1]); }
    });
    if (!img.complete) img.addEventListener('load', fit);
    root._au = { at };
    return { fit, setActive(on) { if (on) fit(); } };
  }
  window.Aurora = { mount };
})();
