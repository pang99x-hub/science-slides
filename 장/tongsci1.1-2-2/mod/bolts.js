/* 1-2 1차시 체험 «두 공장의 볼트와 너트»(교과서 30쪽 측정 표준의 활용 · 자동차 부품). A 공장은 볼트, B 공장은 너트를
   «지름 10 mm»로 만든다. 저마다의 자로 만들면 실제 크기가 어긋나 볼트를 끌어 넣어도 걸리고, «국가 측정 표준으로 교정»하면 꼭 맞아 돌아 들어간다.
   Parts.mount(root) → { setActive, fit } · 시험용: root._pa.std(on) · tryFit() */
(function () {
  'use strict';
  const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function mount(root) {
    const stage = root.querySelector('.pa-stage'), cv = stage.querySelector('canvas'), c = cv.getContext('2d');
    const stdB = root.querySelector('.pa-std'), msg = root.querySelector('.pa-msg'), now = root.querySelector('.pa-now'), shoe = [...root.querySelectorAll('.pa-shoe button')];
    let W = 0, H = 0, std = false, bx = null, drag = null, raf = 0, spin = 0, inside = 0; const did = { fail: false, ok: false, shoe: false };
    const real = () => (std ? { bolt: 10.0, nut: 10.0 } : { bolt: 10.4, nut: 9.7 });
    function fit() { const k = (window.Reveal && Reveal.getScale) ? Reveal.getScale() : 1; W = stage.offsetWidth; H = stage.offsetHeight; if (!W) return; const d = Math.max(1, Math.min(2, (window.devicePixelRatio || 1) * k)); cv.width = Math.round(W * d); cv.height = Math.round(H * d); c.setTransform(d, 0, 0, d, 0, 0); if (bx == null) bx = W * 0.2; draw(); }
    const S = () => H / 70; // 1 mm 그림 크기
    function factory(x, name, col) {
      c.fillStyle = col; c.strokeStyle = '#1d2433'; c.lineWidth = 3;
      c.beginPath(); c.moveTo(x - 90, H * 0.92); c.lineTo(x - 90, H * 0.74); c.lineTo(x - 50, H * 0.68); c.lineTo(x - 50, H * 0.74); c.lineTo(x - 10, H * 0.68); c.lineTo(x - 10, H * 0.74); c.lineTo(x + 30, H * 0.68); c.lineTo(x + 90, H * 0.68); c.lineTo(x + 90, H * 0.92); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#1d2433'; c.font = '800 22px "IBM Plex Sans KR", sans-serif'; c.textAlign = 'center'; c.fillText(name, x, H * 0.97);
    }
    function ruler(x, y, k, label) {
      const w = S() * 10 * k; c.fillStyle = '#f7f1d9'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.fillRect(x - w / 2, y, w, 22); c.strokeRect(x - w / 2, y, w, 22);
      for (let i = 0; i <= 10; i++) { const xx = x - w / 2 + i * w / 10; c.beginPath(); c.moveTo(xx, y); c.lineTo(xx, y + (i % 5 ? 8 : 14)); c.stroke(); }
      c.fillStyle = '#4a5468'; c.font = '600 16px "IBM Plex Sans KR", sans-serif'; c.textAlign = 'center'; c.fillText(label, x, y + 40);
    }
    function draw() {
      if (!W) return;
      c.fillStyle = '#eef1ea'; c.fillRect(0, 0, W, H); c.fillStyle = '#d6dccf'; c.fillRect(0, H * 0.92, W, H * 0.08);
      const r = real(), sx = S();
      factory(W * 0.2, 'A 공장 · 볼트', '#cfe0f5'); factory(W * 0.78, 'B 공장 · 너트', '#f6dfb2');
      ruler(W * 0.2, H * 0.06, std ? 1 : 1.04, std ? '표준에 맞춘 10 mm' : 'A 공장 자의 «10 mm»');
      ruler(W * 0.78, H * 0.06, std ? 1 : 0.97, std ? '표준에 맞춘 10 mm' : 'B 공장 자의 «10 mm»');
      // 너트(옆에서 본 단면): 가운데 구멍
      const ny = H * 0.42, nx = W * 0.78, hole = r.nut * sx, nh = 26 * sx / 2.6;
      c.fillStyle = '#9aa3ad'; c.strokeStyle = '#1d2433'; c.lineWidth = 3;
      c.fillRect(nx - 60, ny - hole / 2 - 26, 120, 26); c.strokeRect(nx - 60, ny - hole / 2 - 26, 120, 26);
      c.fillRect(nx - 60, ny + hole / 2, 120, 26); c.strokeRect(nx - 60, ny + hole / 2, 120, 26);
      c.strokeStyle = 'rgba(29,36,51,.35)'; c.lineWidth = 1.5; for (let i = -60; i <= 60; i += 10) { c.beginPath(); c.moveTo(nx + i, ny - hole / 2); c.lineTo(nx + i + 5, ny - hole / 2 - 6); c.stroke(); c.beginPath(); c.moveTo(nx + i, ny + hole / 2); c.lineTo(nx + i + 5, ny + hole / 2 + 6); c.stroke(); }
      c.fillStyle = '#1d2433'; c.font = '700 18px "IBM Plex Sans KR", sans-serif'; c.textAlign = 'center'; c.fillText(`구멍 실제 ${r.nut.toFixed(1)} mm`, nx, ny + hole / 2 + 52);
      void nh;
      // 볼트(머리 + 몸통 나사)
      const by = ny, d = r.bolt * sx, len = 150, hx = bx;
      c.fillStyle = '#b9c2cc'; c.strokeStyle = '#1d2433'; c.lineWidth = 3;
      c.fillRect(hx - 30, by - d / 2 - 16, 30, d + 32); c.strokeRect(hx - 30, by - d / 2 - 16, 30, d + 32);
      c.fillStyle = '#cfd6de'; c.fillRect(hx, by - d / 2, len, d); c.strokeRect(hx, by - d / 2, len, d);
      c.strokeStyle = 'rgba(29,36,51,.5)'; c.lineWidth = 2; for (let i = 6; i < len; i += 9) { const o = (spin * 9) % 9; c.beginPath(); c.moveTo(hx + i + o, by - d / 2); c.lineTo(hx + i + o + 5, by + d / 2); c.stroke(); }
      c.fillStyle = '#1d2433'; c.font = '700 18px "IBM Plex Sans KR", sans-serif'; c.fillText(`볼트 실제 ${r.bolt.toFixed(1)} mm`, hx + len / 2, by - d / 2 - 30);
      if (!drag && inside === 0 && hx < W * 0.4) { c.fillStyle = '#1d2433'; c.font = '700 20px "IBM Plex Sans KR", sans-serif'; c.fillText('볼트를 오른쪽 너트로 끌어 보자 →', W * 0.45, H * 0.62); }
    }
    function tryFit() {
      const r = real(), nx = W * 0.78;
      if (r.bolt > r.nut + 0.05) {
        did.fail = true; bx = nx - 60 - 150 - 4; draw();
        if (window.RxT && window.RxT.jolt) window.RxT.jolt(stage, 2);
        msg.className = 'u-msg no'; msg.innerHTML = `걸렸다! 둘 다 «10 mm»로 만들었는데 볼트 <b>${r.bolt} mm</b>, 구멍 <b>${r.nut} mm</b> — 공장마다 자의 눈금이 달랐다`;
      } else {
        did.ok = true; msg.className = 'u-msg ok'; msg.innerHTML = '꼭 맞아 돌아 들어간다 — 두 공장이 <b>같은 측정 표준</b>으로 잰 덕분';
        const t0 = performance.now(), x0 = bx, x1 = nx - 60 - 40;
        const tick = (t) => { const p = reduce() ? 1 : Math.min(1, (t - t0) / 1400); bx = x0 + (x1 - x0) * p; spin = p * 14; inside = p; draw(); if (p < 1) raf = requestAnimationFrame(tick); };
        raf = requestAnimationFrame(tick);
      }
      steps();
    }
    function steps() {
      const ok = []; if (did.fail) ok.push(1); if (did.ok) ok.push(2); if (did.shoe) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      now.textContent = st === 1 ? '① 볼트를 너트로 끌어 넣어 보자' : st === 2 ? '② «국가 측정 표준으로 교정»을 누르고 다시 넣자' : st === 3 ? '③ 오른쪽 질문에 답해 보자' : '같은 표준으로 재야 서로 맞는다';
      now.classList.toggle('done', st === 0);
    }
    const xOf = (e) => { const r = cv.getBoundingClientRect(); return (e.clientX - r.left) * W / r.width; };
    cv.addEventListener('pointerdown', (e) => { if (inside) return; const x = xOf(e); if (x > bx - 40 && x < bx + 160) { drag = { dx: x - bx }; try { cv.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ } } });
    cv.addEventListener('pointermove', (e) => { if (!drag) return; bx = Math.max(W * 0.08, Math.min(W * 0.78 - 60 - 150, xOf(e) - drag.dx)); draw(); });
    cv.addEventListener('pointerup', () => { if (!drag) return; drag = null; if (bx > W * 0.78 - 60 - 150 - 60) tryFit(); else draw(); });
    cv.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); tryFit(); } });
    stdB.addEventListener('click', () => { std = !std; stdB.setAttribute('aria-pressed', String(std)); stdB.textContent = std ? '표준 교정 끄기' : '국가 측정 표준으로 교정'; bx = W * 0.2; inside = 0; spin = 0; msg.className = 'u-msg'; msg.textContent = std ? '두 공장의 자를 표준에 맞췄다. 다시 끼워 보자' : ''; draw(); });
    shoe.forEach((b) => b.addEventListener('click', () => { shoe.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); const ok = b.dataset.k === 'std'; b.classList.toggle('bad', !ok); if (ok) did.shoe = true; msg.className = 'u-msg ' + (ok ? 'ok' : 'no'); msg.textContent = ok ? '맞다. 발 길이 250 mm면 어느 회사의 250 mm 신발도 같은 길이다' : '발 모양은 사람마다 다르다. 같은 길이 표준(mm)이 있어서 치수만 보고 산다'; steps(); }));
    steps();
    root._pa = { std: (on) => { if (std !== !!on) stdB.click(); }, tryFit: () => { bx = W * 0.78 - 60 - 150 - 20; tryFit(); } };
    return { setActive(on) { if (on) fit(); else if (raf) cancelAnimationFrame(raf); }, fit };
  }
  window.Parts = { mount };
})();
