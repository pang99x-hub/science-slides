/* 1-1 1차시 체험 «레이저로 거리 재기»(교과서 16쪽: 레이저로 빛을 쏘아 빛이 왕복한 시간을 이용).
   교실 벽: 벽을 끌어 1~15 m에 두고 쏘면 빛이 1억 배 느리게 다녀오고 시간(ns)과 계산이 나온다.
   달 반사경: 실제 걸리는 시간(약 2.56초) 그대로 빛이 다녀온다(지구·달 크기와 거리는 같은 비율).
   거리 = 빛의 속력 × 걸린 시간 ÷ 2. 기록표에 쏜 결과가 쌓인다.
   Laser.mount(root) → { setActive, fit } · 시험용: root._lz.mode('wall'|'moon') · wall(m) · fire() */
(function () {
  'use strict';
  const C = 299792458, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const MOON = 384400e3;
  const fmtNum = (v, d = 0) => v.toLocaleString('ko-KR', { maximumFractionDigits: d, minimumFractionDigits: d });

  function mount(root) {
    const stage = root.querySelector('.lz-stage'), cv = stage.querySelector('canvas'), c = cv.getContext('2d');
    const fireB = root.querySelector('.lz-fire'), modes = [...root.querySelectorAll('.lz-mode button')];
    const watch = root.querySelector('.lz-watch'), calc = root.querySelector('.lz-calc'), log = root.querySelector('.lz-log tbody'), now = root.querySelector('.lz-now');
    let W = 0, H = 0, mode = 'wall', dist = 5, shot = null, raf = 0, active = false;
    const shots = []; let movedShot = false, moonShot = false;
    const wallX = () => 150 + (dist - 1) / 14 * (W - 280);
    function fit() {
      const k = (window.Reveal && Reveal.getScale) ? Reveal.getScale() : 1; W = stage.offsetWidth; H = stage.offsetHeight; if (!W) return;
      const dpr = clamp((window.devicePixelRatio || 1) * k, 1, 2); cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); c.setTransform(dpr, 0, 0, dpr, 0, 0); draw();
    }
    function drawWall(p) {
      const fy = H * 0.8, ly = H * 0.52;
      c.fillStyle = '#eef1ea'; c.fillRect(0, 0, W, fy); c.fillStyle = '#d9cdb4'; c.fillRect(0, fy, W, H - fy);
      // 바닥 눈금(1 m마다)
      c.strokeStyle = '#7d6f57'; c.fillStyle = '#4a5468'; c.font = '600 18px "IBM Plex Sans KR", sans-serif'; c.textAlign = 'center';
      for (let m = 0; m <= 15; m++) { const x = 150 + (m - 1) / 14 * (W - 280); if (x < 100) continue; c.lineWidth = m % 5 ? 2 : 3; c.beginPath(); c.moveTo(x, fy); c.lineTo(x, fy + (m % 5 ? 12 : 22)); c.stroke(); if (m % 5 === 0 || m === 1) c.fillText(`${m} m`, x, fy + 44); }
      // 측정기(삼각대)
      c.strokeStyle = '#2b3a4a'; c.lineWidth = 5; c.beginPath(); c.moveTo(96, ly + 20); c.lineTo(76, fy); c.moveTo(96, ly + 20); c.lineTo(116, fy); c.stroke();
      c.fillStyle = '#2b3a4a'; c.beginPath(); c.roundRect(62, ly - 22, 70, 44, 8); c.fill(); c.fillStyle = '#d9483b'; c.beginPath(); c.arc(132, ly, 7, 0, Math.PI * 2); c.fill();
      // 벽(손잡이)
      const x = wallX(); const g = c.createLinearGradient(x, 0, x + 40, 0); g.addColorStop(0, '#cfc6b4'); g.addColorStop(1, '#a99f8b');
      c.fillStyle = g; c.fillRect(x, H * 0.08, 40, fy - H * 0.08); c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.strokeRect(x, H * 0.08, 40, fy - H * 0.08);
      c.fillStyle = '#1d2433'; c.font = '700 20px "IBM Plex Sans KR", sans-serif'; c.fillText('⇔ 끌어 옮기기', x + 20, H * 0.08 - 10);
      c.fillStyle = '#ffd84d'; c.beginPath(); c.arc(x, ly, 9, 0, Math.PI * 2); c.fill();
      // 거리 화살표
      c.strokeStyle = '#1f5f4a'; c.lineWidth = 3; c.setLineDash([8, 6]); c.beginPath(); c.moveTo(132, fy - 40); c.lineTo(x, fy - 40); c.stroke(); c.setLineDash([]);
      c.fillStyle = '#1f5f4a'; c.font = '800 26px "IBM Plex Sans KR", sans-serif'; c.fillText(shots.length && shot === null && shots[shots.length - 1].mode === 'wall' && Math.abs(shots[shots.length - 1].d - dist) < 1e-6 ? `${dist.toFixed(1)} m` : '? m', (132 + x) / 2, fy - 52);
      if (p != null) beam(132, x, ly, p);
    }
    function drawMoon(p) {
      const sky = c.createLinearGradient(0, 0, 0, H); sky.addColorStop(0, '#0d1430'); sky.addColorStop(1, '#1f2a4f'); c.fillStyle = sky; c.fillRect(0, 0, W, H);
      let r = 11; const rnd = () => { r = (r * 16807) % 2147483647; return r / 2147483647; }; c.fillStyle = 'rgba(255,255,255,.7)'; for (let i = 0; i < 90; i++) c.fillRect(rnd() * W, rnd() * H, 1.5, 1.5);
      const x0 = 90, x1 = W - 90, scale = (x1 - x0) / MOON, de = 12742e3 * scale, dm = 3474e3 * scale, y = H * 0.48;
      const g = c.createRadialGradient(x0 - de * .2, y - de * .2, 1, x0, y, de / 2); g.addColorStop(0, '#8fd0f5'); g.addColorStop(1, '#1f5f9a');
      c.fillStyle = g; c.beginPath(); c.arc(x0, y, de / 2, 0, Math.PI * 2); c.fill();
      c.fillStyle = '#cfcfc8'; c.beginPath(); c.arc(x1, y, Math.max(dm / 2, 4), 0, Math.PI * 2); c.fill();
      c.fillStyle = '#fbfcf9'; c.font = '700 22px "IBM Plex Sans KR", sans-serif'; c.textAlign = 'center';
      c.fillText('지구 · 천문대', x0, y + 52); c.fillText('달 · 반사경', x1, y + 40);
      c.font = '500 18px "IBM Plex Sans KR", sans-serif'; c.fillStyle = '#c3cbe0'; c.fillText('지구와 달의 크기·거리는 같은 비율로 줄인 그림', W / 2, H - 22);
      if (p != null) beam(x0 + de / 2, x1, y, p, true);
    }
    function beam(xa, xb, y, p, wide) {
      const go = p <= 0.5, t = go ? p * 2 : (p - 0.5) * 2, x = go ? xa + (xb - xa) * t : xb - (xb - xa) * t;
      c.strokeStyle = 'rgba(217,72,59,.35)'; c.lineWidth = wide ? 3 : 6; c.beginPath(); c.moveTo(go ? xa : xb, y + (go ? 0 : 8)); c.lineTo(x, y + (go ? 0 : 8)); c.stroke();
      c.fillStyle = '#ff3b2f'; c.shadowColor = '#ff6b5f'; c.shadowBlur = 18; c.beginPath(); c.arc(x, y + (go ? 0 : 8), wide ? 6 : 9, 0, Math.PI * 2); c.fill(); c.shadowBlur = 0;
    }
    function draw() { if (!W) return; c.clearRect(0, 0, W, H); const p = shot ? shot.p : null; if (mode === 'wall') drawWall(p); else drawMoon(p); }
    function realT() { return 2 * (mode === 'wall' ? dist : MOON) / C; }
    function showWatch(t) { watch.textContent = mode === 'wall' ? `${fmtNum(t * 1e9, 1)} ns` : `${fmtNum(t, 2)} 초`; }
    function result() {
      const t = realT(), d = C * t / 2;
      const tTxt = mode === 'wall' ? `${fmtNum(t * 1e9, 1)} ns(= ${(t * 1e9 / 1e9).toFixed(10).replace(/0+$/, '')}초)` : `${fmtNum(t, 2)}초`;
      calc.innerHTML = `거리 = <b>빛의 속력</b> × <b>걸린 시간</b> ÷ 2<br>= 3억 m/s × ${tTxt} ÷ 2 ≈ <b>${mode === 'wall' ? fmtNum(d, 1) + ' m' : fmtNum(d / 1000 / 10000, 1) + '만 km'}</b>`;
      shots.push({ mode, d: mode === 'wall' ? dist : MOON, t });
      const tr = document.createElement('tr'); tr.innerHTML = `<td>${mode === 'wall' ? '교실 벽' : '달'}</td><td>${mode === 'wall' ? fmtNum(t * 1e9, 1) + ' ns' : fmtNum(t, 2) + ' 초'}</td><td>${mode === 'wall' ? fmtNum(dist, 1) + ' m' : '약 38만 km'}</td>`;
      log.appendChild(tr); while (log.children.length > 4) log.firstElementChild.remove();
      const walls = shots.filter((x) => x.mode === 'wall');
      if (walls.length >= 2 && new Set(walls.map((x) => x.d.toFixed(1))).size >= 2) movedShot = true;
      if (mode === 'moon') { moonShot = true; window.RxT && window.RxT.jolt && window.RxT.jolt(stage, 1); }
      steps();
    }
    function steps() {
      const walls = shots.some((x) => x.mode === 'wall'), ok = [];
      if (walls) ok.push(1); if (movedShot) ok.push(2); if (moonShot) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      now.textContent = st === 1 ? '① «레이저 쏘기»를 누르자' : st === 2 ? '② 벽을 끌어 옮긴 뒤 다시 쏘자' : st === 3 ? '③ 위에서 «달 반사경»을 고르고 쏘자' : '빛이 다녀온 시간으로 거리를 쟀다';
      now.classList.toggle('done', st === 0);
    }
    function fire() {
      if (shot) return;
      const real = realT(), dur = mode === 'wall' ? 1400 : real * 1000, t0 = performance.now();
      shot = { p: 0 }; fireB.disabled = true; calc.textContent = mode === 'wall' ? '빛이 가는 중… (화면은 1억 배쯤 느리게)' : '빛이 가는 중… (실제 걸리는 시간 그대로)';
      const tick = (now) => {
        const p = reduce() ? 1 : clamp((now - t0) / dur, 0, 1); shot.p = p; showWatch(real * p); draw();
        if (p < 1) raf = requestAnimationFrame(tick); else { raf = 0; shot = null; fireB.disabled = false; showWatch(real); result(); draw(); }
      };
      raf = requestAnimationFrame(tick);
    }
    fireB.addEventListener('click', fire);
    modes.forEach((b) => b.addEventListener('click', () => { if (shot) return; mode = b.dataset.m; modes.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); watch.textContent = '0'; calc.textContent = mode === 'wall' ? '벽까지 거리를 모른다고 하고, 빛으로 재 보자' : '사람이 달에 두고 온 반사경을 겨눈다'; stage.classList.toggle('moon', mode === 'moon'); draw(); }));
    // 벽 끌기
    let drag = false; const xOf = (e) => { const r = cv.getBoundingClientRect(); return (e.clientX - r.left) * (W / r.width); };
    cv.addEventListener('pointerdown', (e) => { if (mode !== 'wall' || shot) return; if (Math.abs(xOf(e) - wallX() - 20) < 70) { drag = true; try { cv.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ } } });
    cv.addEventListener('pointermove', (e) => { if (!drag) { cv.style.cursor = mode === 'wall' && Math.abs(xOf(e) - wallX() - 20) < 70 ? 'ew-resize' : ''; return; } dist = Math.round(clamp(1 + (xOf(e) - 20 - 150) / (W - 280) * 14, 1, 15) * 2) / 2; draw(); });
    const up = () => { drag = false; }; cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('keydown', (e) => { const m = { ArrowLeft: -.5, ArrowRight: .5 }[e.key]; if (m && mode === 'wall') { e.preventDefault(); e.stopPropagation(); dist = clamp(dist + m, 1, 15); draw(); } });
    steps();
    root._lz = { mode: (m) => modes.find((b) => b.dataset.m === m).click(), wall: (m) => { dist = clamp(m, 1, 15); draw(); }, fire };
    return { setActive(on) { active = on; if (on) fit(); else if (raf) { cancelAnimationFrame(raf); raf = 0; if (shot) { shot = null; fireB.disabled = false; } } void active; }, fit };
  }
  window.Laser = { mount };
})();
