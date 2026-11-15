/* 1-2 2차시 체험 «아날로그를 디지털로»(교과서 33쪽 «디지털: 연속적으로 변하는 양을 최소 단위를 갖는 끊긴 값으로»).
   하루 기온 곡선(또는 손으로 그린 곡선)을 «몇 번 잴까(표본 수)»와 «몇 단계로 적을까(비트)»에 따라 계단 모양 디지털 값으로 바꾼다.
   아래에 0과 1로 쓴 값과 저장 크기가 나온다. ADC.mount(root) → { setActive, fit } · 시험용: root._ad.set(표본, 비트) · draw(점들) */
(function () {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const base = (x) => clamp(0.45 - 0.33 * Math.cos((x - 0.15) * Math.PI * 2) + 0.05 * Math.sin(x * 31) + 0.04 * Math.sin(x * 7), 0.02, 0.98);
  function mount(root) {
    const stage = root.querySelector('.ad-stage'), cv = stage.querySelector('canvas'), c = cv.getContext('2d');
    const nR = root.querySelector('.ad-n'), bR = root.querySelector('.ad-b'), nV = root.querySelector('.ad-nv'), bV = root.querySelector('.ad-bv'), bits = root.querySelector('.ad-bits'), size = root.querySelector('.ad-size'), drawB = root.querySelector('.ad-draw'), now = root.querySelector('.ad-now');
    let W = 0, H = 0, N = 24, B = 3, user = null, drawing = false; const seen = { few: false, many: false, drew: false };
    const f = (x) => { if (!user) return base(x); const i = clamp(x * (user.length - 1), 0, user.length - 1), a = Math.floor(i), b = Math.min(a + 1, user.length - 1); return user[a] + (user[b] - user[a]) * (i - a); };
    function fit() { const k = (window.Reveal && Reveal.getScale) ? Reveal.getScale() : 1; W = stage.offsetWidth; H = stage.offsetHeight; if (!W) return; const d = clamp((window.devicePixelRatio || 1) * k, 1, 2); cv.width = Math.round(W * d); cv.height = Math.round(H * d); c.setTransform(d, 0, 0, d, 0, 0); draw(); }
    const box = () => ({ x: 70, y: 30, w: W - 100, h: H - 90 });
    function draw() {
      if (!W) return; const g = box(), L = Math.pow(2, B);
      c.fillStyle = '#fbfcf9'; c.fillRect(0, 0, W, H);
      c.strokeStyle = '#e1e6e1'; c.lineWidth = 1; for (let k = 0; k <= L; k++) { const y = g.y + g.h - k / L * g.h; c.beginPath(); c.moveTo(g.x, y); c.lineTo(g.x + g.w, y); c.stroke(); }
      c.strokeStyle = '#1d2433'; c.lineWidth = 3; c.beginPath(); c.moveTo(g.x, g.y); c.lineTo(g.x, g.y + g.h); c.lineTo(g.x + g.w, g.y + g.h); c.stroke();
      c.fillStyle = '#4a5468'; c.font = '600 18px "IBM Plex Sans KR", sans-serif'; c.textAlign = 'right'; c.fillText(user ? '내가 그린 값' : '기온', g.x - 8, g.y + 14); c.fillText(user ? '' : '0시 → 24시', g.x + g.w, g.y + g.h + 28);
      // 아날로그 곡선
      c.strokeStyle = '#f2b21c'; c.lineWidth = 5; c.beginPath(); for (let i = 0; i <= 300; i++) { const x = i / 300, px = g.x + x * g.w, py = g.y + g.h - f(x) * g.h; i ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke();
      // 디지털 계단(파랑)과 잰 점(빨강)
      c.strokeStyle = '#2a73b8'; c.lineWidth = 4; c.beginPath(); const codes = [];
      for (let k = 0; k < N; k++) { const x0 = k / N, x1 = (k + 1) / N, q = Math.min(L - 1, Math.floor(f(x0) * L)), y = g.y + g.h - (q + 0.5) / L * g.h; codes.push(q.toString(2).padStart(B, '0')); k ? c.lineTo(g.x + x0 * g.w, y) : c.moveTo(g.x, y); c.lineTo(g.x + x1 * g.w, y); }
      c.stroke();
      c.fillStyle = '#d9483b'; for (let k = 0; k < N; k++) { const x0 = k / N; c.beginPath(); c.arc(g.x + x0 * g.w, g.y + g.h - f(x0) * g.h, 5, 0, Math.PI * 2); c.fill(); }
      bits.textContent = codes.join(' ');
      size.innerHTML = `${N}번 × ${B}비트 = <b>${N * B}비트</b> · 값의 단계 ${L}개`;
      nV.textContent = `${N}번`; bV.textContent = `${B}비트(${L}단계)`;
    }
    function steps() {
      if (N <= 6) seen.few = true; if (N >= 40 && B >= 5) seen.many = true;
      const ok = []; if (seen.few) ok.push(1); if (seen.many) ok.push(2); if (seen.drew) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      now.textContent = st === 1 ? '① 재는 횟수를 6번 이하로 줄여 보자' : st === 2 ? '② 횟수 40번 이상, 5비트로 늘려 보자' : st === 3 ? '③ «직접 그리기»로 곡선을 그려 보자' : '촘촘히 잴수록 원래 모양에 가깝다';
      now.classList.toggle('done', st === 0);
    }
    nR.addEventListener('input', () => { N = +nR.value; draw(); steps(); });
    bR.addEventListener('input', () => { B = +bR.value; draw(); steps(); });
    drawB.addEventListener('click', () => { drawing = !drawing; drawB.setAttribute('aria-pressed', String(drawing)); drawB.textContent = drawing ? '그리는 중 · 그림 위를 끌자' : '직접 그리기'; if (!drawing && user) { seen.drew = true; steps(); } });
    const pt = (e) => { const r = cv.getBoundingClientRect(), g = box(); return [clamp(((e.clientX - r.left) * W / r.width - g.x) / g.w, 0, 1), clamp(1 - ((e.clientY - r.top) * H / r.height - g.y) / g.h, 0.02, 0.98)]; };
    let down = false;
    cv.addEventListener('pointerdown', (e) => { if (!drawing) return; down = true; try { cv.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ } user = new Array(121).fill(null); const [x, y] = pt(e); user[Math.round(x * 120)] = y; });
    cv.addEventListener('pointermove', (e) => { if (!down) return; const [x, y] = pt(e); user[Math.round(x * 120)] = y; fill(); draw(); });
    cv.addEventListener('pointerup', () => { if (!down) return; down = false; fill(); seen.drew = true; draw(); steps(); });
    function fill() { let last = user.find((v) => v != null) ?? 0.5; for (let i = 0; i < user.length; i++) { if (user[i] == null) user[i] = last; else last = user[i]; } }
    root.querySelector('.ad-reset').addEventListener('click', () => { user = null; draw(); });
    nR.value = String(N); bR.value = String(B); steps();
    root._ad = { set: (n, b) => { nR.value = String(n); bR.value = String(b); N = n; B = b; draw(); steps(); }, draw: (arr) => { user = arr.slice(); seen.drew = true; draw(); steps(); } };
    return { setActive(on) { if (on) fit(); }, fit };
  }
  window.ADC = { mount };
})();
