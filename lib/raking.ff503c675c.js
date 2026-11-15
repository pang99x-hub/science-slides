/* 1차시 표지 «빛 옮기기»(교과서 14쪽 도입): 바닷가 바위 면을 위에서 본 그림. 손전등(빛)을 끌어 옮기면 빛의 방향·높이에 따라
   바위의 그림자가 바뀐다. 빛을 머리 위에서 비추면 발자국이 거의 안 보이고, 낮고 비스듬히 비추면 움푹한 발자국이 그림자로 드러난다.
   높이 지도(바위 결 + 갈라진 틈 + 세 발가락 발자국 줄)를 미리 만들고, 빛이 바뀔 때마다 면의 기울기로 밝기를 다시 칠한다.
   LtRake.mount(root) → { setActive, fit, light(az, el) } · 시험용 root._lt */
(function () {
  'use strict';
  const W = 300, H = 210;               // 높이 지도 해상도(화면에는 늘려 그린다)
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function noise(seed) {   // 값 잡음(부드러운 바위 결)
    const r = (i, j) => { const s = Math.sin(i * 127.1 + j * 311.7 + seed * 74.7) * 43758.5453; return s - Math.floor(s); };
    const sm = (t) => t * t * (3 - 2 * t);
    return (x, y) => {
      const i = Math.floor(x), j = Math.floor(y), fx = sm(x - i), fy = sm(y - j);
      const a = r(i, j), b = r(i + 1, j), c = r(i, j + 1), d = r(i + 1, j + 1);
      return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
    };
  }

  function heightMap() {
    const h = new Float32Array(W * H), n1 = noise(1), n2 = noise(2);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      h[y * W + x] = 0.55 * n1(x / 26, y / 26) + 0.22 * n2(x / 7, y / 7) + 0.06 * n1(x / 2.2, y / 2.2);
    }
    // 바위 틈(길게 갈라진 금)
    const crack = (x0, y0, x1, y1) => { for (let t = 0; t <= 1; t += 0.002) { const x = Math.round(x0 + (x1 - x0) * t + 3 * Math.sin(t * 19)), y = Math.round(y0 + (y1 - y0) * t); for (let k = -1; k <= 1; k++) { const i = (y) * W + x + k; if (x + k >= 0 && x + k < W && y >= 0 && y < H) h[i] -= 0.35 * (k ? 0.5 : 1); } } };
    crack(20, 0, 70, H); crack(230, 0, 280, 120);
    // 세 발가락 발자국: 걷는 방향으로 왼발·오른발이 엇갈린다
    const prints = [];
    for (let k = 0; k < 6; k++) { const t = k / 5; prints.push({ x: 40 + t * 225, y: 128 - t * 50 + (k % 2 ? -17 : 17), a: -0.2 }); }
    const sub = (cx, cy, rx, ry, a, d) => {
      const ca = Math.cos(a), sa = Math.sin(a), R = Math.max(rx, ry) + 3;
      for (let y = Math.floor(cy - R); y <= cy + R; y++) for (let x = Math.floor(cx - R); x <= cx + R; x++) {
        if (x < 0 || y < 0 || x >= W || y >= H) continue;
        const dx = x - cx, dy = y - cy, u = (dx * ca + dy * sa) / rx, v = (-dx * sa + dy * ca) / ry, q = u * u + v * v;
        if (q < 1.6) h[y * W + x] -= d * (q < 1 ? Math.cos(q * Math.PI / 2) : -0.18 * Math.sin((q - 1) / 0.6 * Math.PI));   // 가장자리는 살짝 솟는다
      }
    };
    prints.forEach((p) => {
      const a = p.a;
      sub(p.x, p.y, 9, 7, a, 0.9);                                   // 발바닥
      [-0.62, 0, 0.62].forEach((s) => {                                // 발가락 셋
        const ang = a + s, len = s ? 15 : 18;
        for (let j = 1; j <= 4; j++) sub(p.x + Math.cos(ang) * (len * j / 4 + 4), p.y + Math.sin(ang) * (len * j / 4 + 4), 3.6, 3.2, ang, 0.8);
      });
    });
    return { h, prints };
  }

  function mount(root) {
    const stage = root.querySelector('.lt-stage'), cv = stage.querySelector('canvas'), lamp = stage.querySelector('.lt-lamp'), now = stage.querySelector('.lt-now');
    const { h, prints } = heightMap();
    const off = document.createElement('canvas'); off.width = W; off.height = H;
    const octx = off.getContext('2d'), img = octx.createImageData(W, H);
    // 면의 기울기(한 번만 계산)
    const nx = new Float32Array(W * H), ny = new Float32Array(W * H), wet = new Float32Array(W * H);
    const K = 7;   // 높낮이 과장
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, l = h[y * W + Math.max(0, x - 1)], r = h[y * W + Math.min(W - 1, x + 1)], u = h[Math.max(0, y - 1) * W + x], d = h[Math.min(H - 1, y + 1) * W + x];
      nx[i] = -(r - l) * K; ny[i] = -(d - u) * K; wet[i] = 0;
    }
    let az = -0.6, el = 1.35, g = null, found = false;
    function paint() {
      const lx = Math.cos(el) * Math.cos(az), ly = Math.cos(el) * Math.sin(az), lz = Math.sin(el), d = img.data, gain = 0.3 + 2.4 * Math.cos(el);
      for (let i = 0; i < W * H; i++) {
        const a = nx[i], b = ny[i], m = 1 / Math.sqrt(a * a + b * b + 1);
        const dot = (a * lx + b * ly + lz) * m;
        const s = clamp(0.74 + (Math.max(-0.2, dot) - lz) * gain, 0.12, 1.3);
        const base = 0.85 + 0.15 * h[i];
        d[i * 4] = clamp(196 * s * base, 0, 255); d[i * 4 + 1] = clamp(178 * s * base, 0, 255); d[i * 4 + 2] = clamp(150 * s * base, 0, 255); d[i * 4 + 3] = 255;
      }
      octx.putImageData(img, 0, 0);
      draw();
    }
    function draw() {
      if (!g) return;
      const { ctx, w, h: hh } = g;
      ctx.imageSmoothingEnabled = true; ctx.drawImage(off, 0, 0, w, hh);
      // 빛이 오는 쪽이 밝게(손전등 느낌)
      const p = lampXY(), grd = ctx.createRadialGradient(p.x, p.y, 10, p.x, p.y, Math.max(w, hh));
      grd.addColorStop(0, 'rgba(255,240,200,.28)'); grd.addColorStop(1, 'rgba(20,24,35,.25)');
      ctx.fillStyle = grd; ctx.fillRect(0, 0, w, hh);
      if (found) {   // 찾은 뒤: 걸어간 방향을 점선 화살표로
        const sx = w / W, sy = hh / H, a = prints[0], b = prints[prints.length - 1];
        const x0 = (a.x - 6) * sx, y0 = (a.y + (a.y > b.y ? 0 : 0)) * sy, x1 = (b.x + 22) * sx, y1 = b.y * sy;
        const mx0 = x0, my0 = (prints[0].y + prints[1].y) / 2 * sy, mx1 = x1, my1 = (prints[4].y + prints[5].y) / 2 * sy;
        ctx.save(); ctx.setLineDash([14, 10]); ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,226,122,.95)';
        ctx.beginPath(); ctx.moveTo(mx0, my0 + 30); ctx.lineTo(mx1, my1 + 30); ctx.stroke(); ctx.setLineDash([]);
        const ang = Math.atan2(my1 - my0, mx1 - mx0); ctx.fillStyle = 'rgba(255,226,122,.95)';
        ctx.beginPath(); ctx.moveTo(mx1 + Math.cos(ang) * 16, my1 + 30 + Math.sin(ang) * 16); ctx.lineTo(mx1 + Math.cos(ang + 2.5) * 16, my1 + 30 + Math.sin(ang + 2.5) * 16); ctx.lineTo(mx1 + Math.cos(ang - 2.5) * 16, my1 + 30 + Math.sin(ang - 2.5) * 16); ctx.fill();
        ctx.font = '700 22px "IBM Plex Sans KR", sans-serif'; ctx.textAlign = 'center';
        const lx = (mx0 + mx1) / 2, ly = (my0 + my1) / 2 + 66; const t = '걸어간 방향', tw = ctx.measureText(t).width + 24;
        ctx.fillStyle = 'rgba(29,36,51,.78)'; ctx.beginPath(); ctx.roundRect(lx - tw / 2, ly - 24, tw, 34, 17); ctx.fill();
        ctx.fillStyle = '#ffe27a'; ctx.fillText(t, lx, ly);
        ctx.restore(); void x0; void y0; void y1;
      }
    }
    // 손전등 자리 ↔ 빛 방향: 가운데면 머리 위, 가장자리로 갈수록 낮게 눕는다
    function lampXY() { const w = stage.clientWidth, hh = stage.clientHeight, r = (1.42 - el) / 1.3; return { x: w / 2 + Math.cos(az) * r * w * 0.47, y: hh / 2 + Math.sin(az) * r * hh * 0.47 }; }
    function place() {
      const p = lampXY(); lamp.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) rotate(${az * 180 / Math.PI + 180}deg)`;
      const low = el < 0.42;
      now.textContent = low ? '움푹 팬 자국이 그림자로 드러났다!' : el > 1.05 ? (found ? '' : '빛이 머리 위에 있어 자국이 안 보인다') : '희미하게 보인다… 조금 더 가장자리로';
      now.classList.toggle('done', low);
      if (low && !found) { found = true; root.classList.add('lt-found'); draw(); }
    }
    function light(a, e) { az = a; el = clamp(e, 0.12, 1.42); place(); paint(); }
    function fromPointer(e) {
      const r = stage.getBoundingClientRect(), k = r.width / stage.clientWidth;
      const x = (e.clientX - r.left) / k - stage.clientWidth / 2, y = (e.clientY - r.top) / k - stage.clientHeight / 2;
      const rx = x / (stage.clientWidth * 0.47), ry = y / (stage.clientHeight * 0.47), rr = clamp(Math.hypot(rx, ry), 0, 1);
      light(Math.atan2(ry, rx), 1.42 - rr * 1.3);
    }
    let drag = null;
    stage.addEventListener('pointerdown', (e) => { drag = e.pointerId; try { stage.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ } fromPointer(e); });
    stage.addEventListener('pointermove', (e) => { if (drag === e.pointerId) fromPointer(e); });
    const up = (e) => { if (drag === e.pointerId) drag = null; };
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
    lamp.addEventListener('keydown', (e) => {
      const m = { ArrowLeft: [-0.2, 0], ArrowRight: [0.2, 0], ArrowUp: [0, 0.12], ArrowDown: [0, -0.12] }[e.key];
      if (m) { e.preventDefault(); e.stopPropagation(); light(az + m[0], el + m[1]); }
    });
    const api = {
      setActive(on) { if (on) { g = window.Stage.fit(cv); place(); paint(); } },
      fit() { g = window.Stage.fit(cv); place(); draw(); },
      light, get found() { return found; }, prints,
    };
    root._lt = api;
    return api;
  }
  window.LtRake = { mount };
})();
