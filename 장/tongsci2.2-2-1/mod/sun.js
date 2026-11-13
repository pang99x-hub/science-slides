/* 태양 조각들(2-2-1 1차시). 장에 묶이지 않게 root만 받아 붙는다.
   SunGlow  표지의 이글거리는 태양(캔버스)
   SunCut   태양 내부 단면 + 온도 탐침(SVG): 숫자는 교과서 두 값(표면 약 6000 K, 중심 약 1500만 K)만 쓴다
   SunOutput 중심부에서 생긴 에너지가 복사층(이리저리)·대류층(흐름을 타고)을 지나 표면에서 사방으로 퍼지고
             지구에는 아주 일부만 닿는 모습(캔버스) */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const css = () => getComputedStyle(document.documentElement);
  const tok = (k) => css().getPropertyValue('--' + k).trim();
  const SVGNS = 'http://www.w3.org/2000/svg';
  const svgEl = (tag, attrs, parent) => { const e = document.createElementNS(SVGNS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; };

  // 캔버스를 화면 크기에 맞춘다(슬라이드 좌표 = clientWidth/Height, 해상도는 화면 배율까지)
  function fit(cv) {
    const w = cv.clientWidth || 1, h = cv.clientHeight || 1;
    const s = Math.min(2, (window.devicePixelRatio || 1) * (window.Reveal && Reveal.getScale ? Reveal.getScale() : 1)) || 1;
    cv.width = Math.round(w * s); cv.height = Math.round(h * s);
    const ctx = cv.getContext('2d'); ctx.setTransform(s, 0, 0, s, 0, 0);
    return { ctx, w, h };
  }
  // 장이 보일 때만 도는 애니메이션 고리
  function loop(step) {
    let raf = 0, last = 0, on = false;
    const tick = (t) => { if (!on) return; const dt = Math.min(0.05, last ? (t - last) / 1000 : 0.016); last = t; step(dt); raf = requestAnimationFrame(tick); };
    return {
      start() { if (on) return; on = true; last = 0; raf = requestAnimationFrame(tick); },
      stop() { on = false; cancelAnimationFrame(raf); },
    };
  }

  // ---------------- 표지: 이글거리는 태양 ----------------
  function glow(cv) {
    let g = fit(cv), t = 0;
    const cells = Array.from({ length: 70 }, () => ({ a: Math.random() * Math.PI * 2, r: Math.sqrt(Math.random()) * 0.9, s: 0.35 + Math.random() * 0.5, p: Math.random() * 6 }));
    function draw(dt) {
      t += dt;
      if (g.w < 60 || g.h < 60) return;
      const { ctx, w, h } = g, cx = w * 0.5, cy = h * 0.5, R = Math.min(h * 0.36, w * 0.2);
      ctx.clearRect(0, 0, w, h);
      // 코로나 빛살
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(t * 0.05);
      for (let i = 0; i < 24; i++) {
        const len = R * (1.55 + 0.25 * Math.sin(t * 1.3 + i * 1.7));
        ctx.rotate(Math.PI * 2 / 24);
        ctx.beginPath(); ctx.moveTo(R * 1.05, -6); ctx.lineTo(len, 0); ctx.lineTo(R * 1.05, 6); ctx.closePath();
        ctx.fillStyle = 'rgba(245, 207, 58, .55)'; ctx.fill();
      }
      ctx.restore();
      const halo = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.8);
      halo.addColorStop(0, 'rgba(255, 207, 90, .55)'); halo.addColorStop(1, 'rgba(255, 207, 90, 0)');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, R * 1.8, 0, Math.PI * 2); ctx.fill();
      const disk = ctx.createRadialGradient(cx - R * 0.25, cy - R * 0.25, R * 0.1, cx, cy, R);
      disk.addColorStop(0, tok('sun-core')); disk.addColorStop(0.55, tok('sun-rad')); disk.addColorStop(1, tok('sun-conv'));
      ctx.fillStyle = disk; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      // 쌀알 무늬(대류): 밝기가 일렁인다
      for (const c of cells) {
        const x = cx + Math.cos(c.a) * c.r * R, y = cy + Math.sin(c.a) * c.r * R;
        const a = 0.12 + 0.12 * Math.sin(t * c.s * 3 + c.p);
        ctx.fillStyle = `rgba(226, 98, 43, ${a.toFixed(3)})`;
        ctx.beginPath(); ctx.arc(x, y, R * 0.09, 0, Math.PI * 2); ctx.fill();
      }
      ctx.lineWidth = 3; ctx.strokeStyle = tok('ink'); ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
    }
    const l = loop(draw);
    draw(0);
    return {
      setActive(on) { if (on) { g = fit(cv); if (reduce) draw(0); else l.start(); } else l.stop(); },
      fit() { g = fit(cv); draw(0); },
    };
  }

  // ---------------- 태양 내부 단면 + 온도 탐침 ----------------
  function cut(root) {
    const svg = root.querySelector('.sc-svg');
    const range = root.querySelector('#probe');
    const zoneEl = root.querySelector('.pr-zone'), tempEl = root.querySelector('.pr-temp'), fuseEl = root.querySelector('.pr-fuse');
    const thermo = root.querySelector('.thermo i');
    const C = { x: 420, y: 390 }, R = 345;
    const ang = -Math.PI / 4;                                     // 탐침이 들어오는 방향(오른쪽 위)
    const S = { x: C.x + Math.cos(ang) * R, y: C.y + Math.sin(ang) * R };
    // 층(바깥부터)
    svgEl('circle', { cx: C.x, cy: C.y, r: R + 6, fill: tok('sun-surf'), class: 'sc-layer' }, svg);
    svgEl('circle', { cx: C.x, cy: C.y, r: R, fill: tok('sun-conv'), class: 'sc-layer' }, svg);
    const conv = svgEl('g', { class: 'sc-conv' }, svg);
    for (let i = 0; i < 14; i++) {                                // 대류층의 소용돌이 흐름
      const a = i / 14 * Math.PI * 2, rm = R * 0.85, w = 0.16;
      const p = (k, rr) => `${(C.x + Math.cos(a + k) * rr).toFixed(1)} ${(C.y + Math.sin(a + k) * rr).toFixed(1)}`;
      svgEl('path', { d: `M${p(-w, R * 0.74)} A${rm * 0.18} ${rm * 0.18} 0 1 1 ${p(w, R * 0.74)}` }, conv);
    }
    svgEl('circle', { cx: C.x, cy: C.y, r: R * 0.7, fill: tok('sun-rad'), class: 'sc-layer' }, svg);
    const hot = svgEl('circle', { cx: C.x, cy: C.y, r: R * 0.25 + 26, fill: tok('hl'), class: 'sc-hot' }, svg);
    svgEl('circle', { cx: C.x, cy: C.y, r: R * 0.25, fill: tok('sun-core'), class: 'sc-layer' }, svg);
    // 이름표: 층 안쪽 아래(탐침 길과 겹치지 않는 쪽)에 바로 적고, 표면만 밖으로 끌어낸다
    const text = (x, y, t, cls = 'sc-label') => { const e = svgEl('text', { x, y, class: cls }, svg); e.textContent = t; return e; };
    text(C.x, C.y + R * 0.1, '핵(중심부)'); text(C.x, C.y + R * 0.1 + 30, '약 1500만 K', 'sc-label sm');
    text(C.x, C.y + R * 0.49, '복사층');
    text(C.x, C.y + R * 0.87, '대류층');
    const sa = Math.PI * 0.16, sp = { x: C.x + Math.cos(sa) * (R + 4), y: C.y + Math.sin(sa) * (R + 4) };
    svgEl('path', { d: `M${sp.x} ${sp.y} L${sp.x + 40} ${sp.y + 26} H${sp.x + 60}`, class: 'sc-lead' }, svg);
    svgEl('circle', { cx: sp.x, cy: sp.y, r: 5, fill: tok('ink') }, svg);
    text(sp.x + 68, sp.y + 34, '표면', 'sc-label left'); text(sp.x + 68, sp.y + 64, '약 6000 K', 'sc-label sm left');
    // 탐침 길(점선)과 탐침
    svgEl('line', { x1: S.x + Math.cos(ang) * 60, y1: S.y + Math.sin(ang) * 60, x2: C.x, y2: C.y, class: 'sc-path' }, svg);
    const probe = svgEl('g', { class: 'sc-probe' }, svg);
    const pLine = svgEl('line', {}, probe), pTip = svgEl('circle', { r: 13 }, probe);
    const outer = { x: S.x + Math.cos(ang) * 110, y: S.y + Math.sin(ang) * 110 };

    const lnLo = Math.log(6000), lnHi = Math.log(1.5e7);
    function set(d) {                                             // d: 0 표면 → 1 중심
      const tip = { x: S.x + (C.x - S.x) * d, y: S.y + (C.y - S.y) * d };
      pLine.setAttribute('x1', outer.x); pLine.setAttribute('y1', outer.y); pLine.setAttribute('x2', tip.x); pLine.setAttribute('y2', tip.y);
      pTip.setAttribute('cx', tip.x); pTip.setAttribute('cy', tip.y);
      const rf = 1 - d;
      zoneEl.textContent = rf > 0.97 ? '표면' : rf > 0.7 ? '대류층' : rf > 0.25 ? '복사층' : '핵(중심부)';
      if (d < 0.03) tempEl.innerHTML = '약 6000 K';
      else if (d > 0.97) tempEl.innerHTML = '약 1500만 K <small>(중심)</small>';
      else tempEl.innerHTML = '↑ 점점 높아져요 <small>(6000 K와 1500만 K 사이)</small>';
      const f = Math.pow(d, 1.25);                                // 눈금은 로그(자릿수)로: 6000 K → 1500만 K
      thermo.style.width = (6 + 94 * f).toFixed(1) + '%';
      thermo.parentElement.title = `온도 눈금(자릿수): 약 ${Math.round(Math.exp(lnLo + (lnHi - lnLo) * f)).toLocaleString('ko-KR')} K 근처`;
      const core = rf <= 0.25;
      fuseEl.textContent = core ? '수소 핵융합이 일어나는 곳' : '핵융합 없음';
      fuseEl.classList.toggle('on', core);
      hot.style.opacity = core ? '0.85' : '0';
    }
    const obj = { d: 0 };
    range.addEventListener('input', () => { obj.d = range.value / 100; set(obj.d); });
    const go = (to) => {
      if (!window.gsap) { obj.d = to; range.value = to * 100; set(to); return; }
      gsap.to(obj, { d: to, duration: reduce ? 0 : 1.4, ease: 'power2.inOut', onUpdate: () => { range.value = obj.d * 100; set(obj.d); } });
    };
    root.querySelector('#probe-core').addEventListener('click', () => go(1));
    root.querySelector('#probe-surf').addEventListener('click', () => go(0));
    // 끌어서 움직이기: 탐침 끝을 잡고 반지름을 따라
    let drag = false;
    const toD = (e) => {
      const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
      const p = pt.matrixTransform(svg.getScreenCTM().inverse());
      const vx = C.x - S.x, vy = C.y - S.y;
      return Math.max(0, Math.min(1, ((p.x - S.x) * vx + (p.y - S.y) * vy) / (vx * vx + vy * vy)));
    };
    probe.style.cursor = 'grab';
    probe.addEventListener('pointerdown', (e) => { drag = true; probe.setPointerCapture(e.pointerId); e.stopPropagation(); });
    probe.addEventListener('pointermove', (e) => { if (!drag) return; obj.d = toD(e); range.value = obj.d * 100; set(obj.d); });
    probe.addEventListener('pointerup', () => { drag = false; });
    set(0);
    return {};
  }

  // ---------------- 중심부에서 지구까지 ----------------
  function output(root) {
    const cv = root.querySelector('.out-cv');
    const follow = root.querySelector('#out-follow');
    let g = fit(cv), ph = [], spawnT = 0, emitT = 0, watched = null, swirl = 0, out = 0, hits = 0, flash = 0;
    const geo = () => { const { w, h } = g, R = h * 0.56; return { w, h, R, cx: R * 0.12, cy: h * 0.5, ex: w - 70, ey: h * 0.5 - 40, er: 13 }; };
    function spawn(G) {
      const a = (Math.random() - 0.5) * Math.PI * 0.9, r = Math.random() * G.R * 0.22;
      ph.push({ x: G.cx + Math.cos(a) * r, y: G.cy + Math.sin(a) * r, st: 'rad', vx: 0, vy: 0, trail: [], hit: false });
    }
    function step(dt) {
      const G = geo();
      swirl += dt; flash = Math.max(0, flash - dt * 1.5);
      spawnT += dt;
      while (spawnT > 0.04) { spawnT -= 0.04; if (ph.length < 320) spawn(G); }
      // 표면 곳곳에서 사방으로 나가는 빛(속에서 올라온 알갱이와 같은 몫이 늘 나간다)
      emitT += dt;
      while (emitT > 0.025) {
        emitT -= 0.025;
        const a = (Math.random() - 0.5) * Math.PI * 0.94;
        ph.push({ x: G.cx + Math.cos(a) * (G.R + 6), y: G.cy + Math.sin(a) * (G.R + 6), st: 'free', vx: Math.cos(a) * 460, vy: Math.sin(a) * 460, trail: [], hit: false, out: true });
        out++;
      }
      for (const p of ph) {
        const dx = p.x - G.cx, dy = p.y - G.cy, r = Math.hypot(dx, dy) || 1, ux = dx / r, uy = dy / r;
        if (p.st === 'rad') {                                     // 복사층: 이리저리 부딪히며 아주 조금씩 밖으로
          const a = Math.random() * Math.PI * 2;
          p.x += (Math.cos(a) * 5 + ux * 2.2) * dt * 60; p.y += (Math.sin(a) * 5 + uy * 2.2) * dt * 60;
          if (p.x < G.cx) p.x = G.cx + 2;
          if (r > G.R * 0.7) p.st = 'conv';
        } else if (p.st === 'conv') {                             // 대류층: 뜨거운 기체 흐름을 타고 출렁이며 올라간다
          const wob = Math.sin(r * 0.05 + swirl * 2) * 40;
          p.x += (ux * 100 - uy * wob) * dt; p.y += (uy * 100 + ux * wob) * dt;
          if (r > G.R) { p.st = 'free'; p.vx = ux * 460; p.vy = uy * 460; out++; }
        } else {                                                  // 표면 밖: 곧게 사방으로
          p.x += p.vx * dt; p.y += p.vy * dt;
          if (!p.hit && Math.hypot(p.x - G.ex, p.y - G.ey) < G.er + 5) { p.hit = true; hits++; flash = 1; }
        }
        if (p === watched) { p.trail.push([p.x, p.y]); if (p.trail.length > 900) p.trail.shift(); }
      }
      ph = ph.filter((p) => p.x > -20 && p.x < G.w + 20 && p.y > -20 && p.y < G.h + 20);
      if (follow.getAttribute('aria-pressed') === 'true' && (!watched || !ph.includes(watched))) {
        watched = ph.find((p) => p.st === 'rad' && Math.hypot(p.x - G.cx, p.y - G.cy) < G.R * 0.15) || null;
        if (watched) watched.trail = [];
      }
      draw(G);
    }
    function draw(G) {
      if (g.w < 60 || g.h < 60) return;
      const { ctx, w, h } = g;
      ctx.clearRect(0, 0, w, h);
      const ring = (rr, fill) => { ctx.beginPath(); ctx.arc(G.cx, G.cy, rr, 0, Math.PI * 2); ctx.fillStyle = fill; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = tok('ink'); ctx.stroke(); };
      ring(G.R + 5, tok('sun-surf')); ring(G.R, tok('sun-conv'));
      ctx.save(); ctx.strokeStyle = 'rgba(29,36,51,.35)'; ctx.lineWidth = 2.5;          // 대류 고리
      for (let i = 0; i < 10; i++) {
        const a = -Math.PI / 2 + (i + 0.5) / 10 * Math.PI, rr = G.R * 0.85, x = G.cx + Math.cos(a) * rr, y = G.cy + Math.sin(a) * rr;
        ctx.beginPath(); ctx.arc(x, y, G.R * 0.11, swirl * 1.2 + i, swirl * 1.2 + i + Math.PI * 1.5); ctx.stroke();
      }
      ctx.restore();
      ring(G.R * 0.7, tok('sun-rad')); ring(G.R * 0.25, tok('sun-core'));
      const label = (t, x, y, font = '700 22px "IBM Plex Sans KR", sans-serif') => {
        ctx.font = font; ctx.textAlign = 'center'; ctx.lineJoin = 'round';
        ctx.lineWidth = 6; ctx.strokeStyle = tok('paper-2'); ctx.strokeText(t, x, y); ctx.fillStyle = tok('ink'); ctx.fillText(t, x, y);
      };
      // 지구(닿을 때 반짝)
      if (flash > 0) { ctx.beginPath(); ctx.arc(G.ex, G.ey, G.er + 14 * flash + 4, 0, Math.PI * 2); ctx.fillStyle = `rgba(245, 207, 58, ${(0.7 * flash).toFixed(2)})`; ctx.fill(); }
      ctx.beginPath(); ctx.arc(G.ex, G.ey, G.er, 0, Math.PI * 2); ctx.fillStyle = tok('s'); ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = tok('ink'); ctx.stroke();
      label('지구', G.ex, G.ey + 44, '600 22px "IBM Plex Sans KR", sans-serif');
      label(`닿은 것 ${hits} / 나간 것 ${out}`, G.ex - 70, G.ey - 40, '600 20px "IBM Plex Sans KR", sans-serif');
      // 빛 알갱이
      const light = tok('e-light'), lightInk = tok('e-light-ink');
      for (const p of ph) {
        if (p.st === 'free') {
          ctx.strokeStyle = p.hit ? lightInk : 'rgba(138,106,0,.55)'; ctx.lineWidth = p.hit ? 4 : 2;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(p.x - p.vx * 0.03, p.y - p.vy * 0.03); ctx.stroke();
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.st === 'free' ? 3.5 : 4.5, 0, Math.PI * 2);
        ctx.fillStyle = light; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = lightInk; ctx.stroke();
      }
      label('핵', G.cx + G.R * 0.12, G.cy + 8);
      label('복사층', G.cx + G.R * 0.47, G.cy - G.R * 0.36);
      label('대류층', G.cx + G.R * 0.8, G.cy - G.R * 0.64);
      if (watched && watched.trail.length > 1) {
        ctx.strokeStyle = tok('ink'); ctx.lineWidth = 3; ctx.beginPath();
        watched.trail.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
        ctx.beginPath(); ctx.arc(watched.x, watched.y, 9, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.stroke();
      }
    }
    follow.addEventListener('click', () => {
      const on = follow.getAttribute('aria-pressed') !== 'true';
      follow.setAttribute('aria-pressed', String(on)); if (!on) watched = null;
    });
    const l = loop(step);
    // 처음 보일 때 이미 퍼져 있게 미리 돌려 둔다
    const warm = () => { for (let i = 0; i < 360; i++) step(1 / 60); };
    return {
      setActive(on) { if (on) { g = fit(cv); if (!ph.length) warm(); if (reduce) draw(geo()); else l.start(); } else l.stop(); },
      fit() { g = fit(cv); },
    };
  }

  window.SunGlow = { mount: glow };
  window.SunCut = { mount: cut };
  window.SunOutput = { mount: output };
})();
