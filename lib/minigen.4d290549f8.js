/* 3차시의 2D 발전기 둘.
   SimpleGen: 교과서 106쪽 간이 발전기. 선풍기 바람으로 날개와 자석이 돌고, 옆에 고정한 코일에 유도 전류가 흐른다.
              코일은 도선 한 가닥(왼쪽 아래에서 감겨 오른쪽 위로 나온다). 발광 다이오드는 한쪽으로만 흘리므로
              전류 점·화살표는 다이오드가 켜지는 방향(+)일 때만 움직인다: 코일 속 왼쪽 → 오른쪽, 앞줄은 아래로.
              발광 다이오드는 한 방향 전류만 흘려서 깜박인다.
   RotGen:    발전기의 원리. 자석 사이에서 코일이 돌면 코일 면을 수직으로 통과하는 자기장이 변한다.
              자기력선을 (높이 Y, 깊이 Z) 격자로 그려, 코일 면을 지나는 줄 수가 |sin θ|에 비례하게 보이게 했다. */
(function () {
  'use strict';
  const DW = 1056, DH = 780;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function colors() {
    const css = getComputedStyle(document.documentElement), C = {};
    for (const k of ['ink', 'ink-2', 'ink-3', 'paper-2', 'rule', 'grid', 'accent', 'n', 's', 'field', 'current', 'copper-f', 'copper-b', 'glow', 'induced', 'hl'])
      C[k] = css.getPropertyValue('--' + k).trim();
    C.font = css.getPropertyValue('--f-body').trim();
    C.pen = css.getPropertyValue('--f-pen').trim();
    return C;
  }
  const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };

  // 무대 캔버스 공통: 크기 맞추기, 모눈, 좌표 변환, 반복
  function makeStage(root, draw, step) {
    const stage = root.querySelector('.stage'), canvas = stage.querySelector('canvas'), ctx = canvas.getContext('2d');
    const charts = [...root.querySelectorAll('canvas[data-chart]')];
    let scale = 1, dpr = 1, raf = 0, last = 0, active = false;
    const S = {
      stage, canvas, ctx, charts,
      get scale() { return scale; }, get dpr() { return dpr; },
      fit() {
        const w = stage.offsetWidth, h = stage.offsetHeight;
        scale = Math.min(w / DW, h / DH) || 1;
        const rs = (window.Reveal && Reveal.getScale) ? Reveal.getScale() : 1;
        dpr = clamp((window.devicePixelRatio || 1) * rs, 1, 3);
        canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
        for (const c of charts) { c.width = Math.round(c.offsetWidth * dpr); c.height = Math.round(c.offsetHeight * dpr); }
        S.paint();
      },
      paint() {
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.translate((stage.offsetWidth - DW * scale) / 2, (stage.offsetHeight - DH * scale) / 2); ctx.scale(scale, scale);
        ctx.lineCap = 'round'; ctx.lineJoin = 'round';
        draw(ctx);
      },
      toLocal(e) {
        const r = canvas.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width * stage.offsetWidth, py = (e.clientY - r.top) / r.height * stage.offsetHeight;
        return { x: (px - (stage.offsetWidth - DW * scale) / 2) / scale, y: (py - (stage.offsetHeight - DH * scale) / 2) / scale };
      },
      setActive(on) {
        active = on;
        if (on && !raf) { last = performance.now(); S.fit(); raf = requestAnimationFrame(frame); }
        if (!on && raf) { cancelAnimationFrame(raf); raf = 0; }
      },
    };
    function frame(t) {
      raf = 0; if (!active) return;
      const dt = clamp((t - last) / 1000 || 1 / 60, 1 / 240, 0.05); last = t;
      step(dt); S.paint();
      raf = requestAnimationFrame(frame);
    }
    return S;
  }
  function grid(ctx, C) {
    ctx.strokeStyle = C.grid; ctx.lineWidth = 1; ctx.beginPath();
    for (let x = 0; x <= DW; x += 40) { ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, DH); }
    for (let y = 0; y <= DH; y += 40) { ctx.moveTo(0, y + .5); ctx.lineTo(DW, y + .5); }
    ctx.stroke();
  }
  function label(ctx, C, text, x, y, align, size) {
    ctx.fillStyle = C.ink; ctx.font = `600 ${size || 26}px ${C.font}`; ctx.textAlign = align || 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(text, x, y);
  }
  // 작은 선그래프(축 하나, 계열 하나). shade(i)가 참인 구간은 노란 띠
  function lineChart(cv, dpr, C, data, { lo, hi, color, ticks, tickLabel, shade, marker }) {
    const c = cv.getContext('2d'), w = cv.offsetWidth, h = cv.offsetHeight;
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, h);
    const L = 46, Rp = 14, T = 10, B = 10, n = data.length;
    const X = (i) => L + (w - L - Rp) * i / (n - 1), Y = (v) => T + (h - T - B) * (1 - (v - lo) / (hi - lo));
    if (shade) {
      c.fillStyle = hexA(C.hl, 0.55);
      for (let i = 0; i < n - 1; i++) if (shade(i)) c.fillRect(X(i), T, X(i + 1) - X(i) + 0.5, h - T - B);
    }
    c.font = `500 18px ${C.font}`; c.fillStyle = C['ink-3']; c.textAlign = 'right'; c.textBaseline = 'middle';
    for (const t of ticks) {
      c.strokeStyle = t === 0 ? C['ink-3'] : C.rule; c.lineWidth = t === 0 ? 1.5 : 1;
      c.beginPath(); c.moveTo(L, Math.round(Y(t)) + .5); c.lineTo(w - Rp, Math.round(Y(t)) + .5); c.stroke();
      c.fillText(tickLabel(t), L - 10, Y(t));
    }
    c.strokeStyle = color; c.lineWidth = 2.5; c.beginPath();
    for (let i = 0; i < n; i++) { const x = X(i), y = Y(data[i]); if (i === 0) c.moveTo(x, y); else c.lineTo(x, y); }
    c.stroke();
    const m = marker === undefined ? n - 1 : marker;
    if (m !== null) {
      const ex = X(m), ey = Y(data[m]);
      c.fillStyle = C['paper-2']; c.beginPath(); c.arc(ex, ey, 7, 0, Math.PI * 2); c.fill();
      c.fillStyle = color; c.beginPath(); c.arc(ex, ey, 5, 0, Math.PI * 2); c.fill();
    }
    return { X, Y, L, T, B, w, h, c };
  }

  // ===================== 간이 발전기 =====================
  function mountSimple(root) {
    const C = colors();
    const HUB = { x: 400, y: 380 }, BLADE = 210, MAG = 112;          // 날개 반지름, 자석 반 길이
    const COIL = { x0: 548, x1: 668, y: 380, r: 62 };                  // 자석 끝에서 2~3 mm(그림에서는 36) 떨어진 코일
    const LED = { x: 900, y: 380 };
    const W_OF = [0, 2.6, 5.2, 9];                                     // 선풍기 단계별 날개의 목표 각속도(rad/s)
    const LED_ON = 0.15;
    const st = { fan: 0, w: 0, phi: 0, I: 0, air: 0, flow: 0, hist: new Float32Array(240), acc: 0 };
    const TURNS = 7, CK = 28;                                          // 그림의 감은 수, 한 바퀴를 나누는 점 수
    // 코일 도선: φ=π(왼쪽 끝 아래)에서 감기 시작해 φ가 늘며 오른쪽으로 가다 오른쪽 끝 위(φ≡0)에서 나온다. 앞줄 = 오른쪽 반쪽
    function coilPts() {
      const a = COIL.x0 + 10, b = COIL.x1 - 6, tot = 2 * Math.PI * TURNS + Math.PI, N = Math.round(tot / (2 * Math.PI) * CK), pts = [];
      for (let k = 0; k <= N; k++) { const ph = Math.PI + tot * k / N; pts.push([a + (b - a) * k / N + 9 * Math.sin(ph), COIL.y - COIL.r * Math.cos(ph), ph]); }
      return pts;
    }
    const frontAt = (ph) => Math.sin(ph) > 0;
    const ui = { fan: [...root.querySelectorAll('[data-fan]')], led: root.querySelector('.led-state'), rpm: root.querySelector('.spin-state') };

    function step(dt) {
      st.w += (W_OF[st.fan] - st.w) * (1 - Math.exp(-dt / 1.1));   // 바람을 받으면 천천히 빨라지고, 끄면 천천히 멈춘다
      if (st.fan === 0 && st.w < 0.02) st.w = 0;
      st.phi += st.w * dt;
      st.air += dt * (0.4 + st.fan * 0.6);
      st.I = st.w * Math.sin(st.phi) / W_OF[3];                    // 자석 N극 방향과 코일 축의 각이 φ. 자속 ∝ cos φ
      if (st.I > 0.04) st.flow += dt * st.I * 3;                    // 다이오드가 켜지는 방향일 때만 전류가 흐른다
      st.acc += dt;
      while (st.acc >= 1 / 40) { st.acc -= 1 / 40; st.hist.copyWithin(0, 1); st.hist[st.hist.length - 1] = st.I; }
      if (ui.led) ui.led.textContent = st.I > LED_ON ? '켜짐' : '꺼짐';
      if (ui.rpm) ui.rpm.textContent = st.w < 0.05 ? '멈춤' : `1초에 약 ${(st.w / (2 * Math.PI)).toFixed(1)}바퀴`;
    }

    function draw(ctx) {
      grid(ctx, C);
      // 선풍기와 바람
      ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.fillStyle = C['paper-2'];
      ctx.beginPath(); ctx.ellipse(110, 360, 34, 120, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(110, 480); ctx.lineTo(110, 640); ctx.moveTo(60, 640); ctx.lineTo(160, 640); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(110, 360, 10, 0, Math.PI * 2); ctx.fill();
      label(ctx, C, '선풍기', 110, 690);
      if (st.fan > 0) {
        ctx.strokeStyle = C['ink-3']; ctx.lineWidth = 3; ctx.setLineDash([16, 14]); ctx.lineDashOffset = -st.air * 60;
        for (const dy of [-90, -30, 30, 90]) { ctx.beginPath(); ctx.moveTo(160, 360 + dy); ctx.quadraticCurveTo(220, 360 + dy * 0.9, 250, 380 + dy * 0.7); ctx.stroke(); }
        ctx.setLineDash([]);
        ctx.font = `400 36px ${C.pen}`; ctx.fillStyle = C.ink; ctx.textAlign = 'center'; ctx.fillText('바람', 205, 250);
      }
      // 기둥과 받침대
      ctx.strokeStyle = C.ink; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(HUB.x, HUB.y); ctx.lineTo(HUB.x, 660); ctx.moveTo(300, 660); ctx.lineTo(760, 660); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(COIL.x0 + 60, COIL.y + COIL.r); ctx.lineTo(COIL.x0 + 60, 660); ctx.stroke();
      // 날개 4장
      ctx.save(); ctx.translate(HUB.x, HUB.y); ctx.rotate(st.phi);
      for (let k = 0; k < 4; k++) {
        ctx.rotate(Math.PI / 2);
        ctx.fillStyle = k % 2 ? '#dfe7ef' : '#eef1e4'; ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(18, -10); ctx.quadraticCurveTo(BLADE * 0.6, -70, BLADE, -20); ctx.quadraticCurveTo(BLADE * 0.7, 26, 18, 12); ctx.closePath(); ctx.fill(); ctx.stroke();
      }
      // 헤드의 네오디뮴 자석(날개와 같이 돈다)
      ctx.fillStyle = C.n; ctx.fillRect(0, -16, MAG, 32); ctx.fillStyle = C.s; ctx.fillRect(-MAG, -16, MAG, 32);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(-MAG, -16, 2 * MAG, 32);
      ctx.fillStyle = C['paper-2']; ctx.font = `800 24px ${C.font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('N', MAG * 0.6, 1); ctx.fillText('S', -MAG * 0.6, 1);
      ctx.restore();
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(HUB.x, HUB.y, 12, 0, Math.PI * 2); ctx.fill();
      // 고정된 코일(철판 위에 감음)
      ctx.fillStyle = '#c9ced4'; ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
      ctx.fillRect(COIL.x0 - 8, COIL.y - COIL.r - 14, 14, 2 * COIL.r + 28); ctx.strokeRect(COIL.x0 - 8, COIL.y - COIL.r - 14, 14, 2 * COIL.r + 28);
      const cp = coilPts();
      const strand = (isFront) => { ctx.beginPath(); let pen = false;
        for (let i = 1; i < cp.length; i++) { if (frontAt((cp[i - 1][2] + cp[i][2]) / 2) === isFront) { if (!pen) { ctx.moveTo(cp[i - 1][0], cp[i - 1][1]); pen = true; } ctx.lineTo(cp[i][0], cp[i][1]); } else pen = false; }
        ctx.stroke(); };
      ctx.strokeStyle = C['copper-b']; ctx.lineWidth = 4; strand(false);
      ctx.strokeStyle = C['copper-f']; ctx.lineWidth = 6; strand(true);
      label(ctx, C, '코일', (COIL.x0 + COIL.x1) / 2, COIL.y - COIL.r - 44);
      label(ctx, C, '날개', HUB.x - 150, 140);
      label(ctx, C, '네오디뮴 자석', HUB.x, HUB.y + 250);
      // 전선과 발광 다이오드
      // 코일 끝(오른쪽 위) → 다이오드 +쪽, 다이오드 −쪽 → 코일 아래로 돌아 감기 시작한 곳(왼쪽 아래)
      const e0 = cp[0], e1 = cp[cp.length - 1], yLow = COIL.y + COIL.r + 26;
      const outW = [[e1[0], e1[1]], [LED.x - 40, e1[1]], [LED.x - 40, LED.y - 30]];
      const backW = [[LED.x + 40, LED.y + 30], [LED.x + 40, yLow], [e0[0], yLow], [e0[0], e0[1]]];
      ctx.strokeStyle = C.ink; ctx.lineWidth = 4; ctx.beginPath();
      for (const w of [outW, backW]) { ctx.moveTo(w[0][0], w[0][1]); for (const p of w.slice(1)) ctx.lineTo(p[0], p[1]); }
      ctx.stroke();
      // 전류 점(다이오드가 켜지는 방향일 때만): −쪽 전선 → 코일 도선(감은 대로) → +쪽 전선
      if (st.I > 0.04) {
        const loop = [...backW.map((p) => [p, 'w']), ...cp.map((p) => [p, frontAt(p[2]) ? 'f' : 'b']), ...outW.map((p) => [p, 'w'])], segs = [];
        let tot = 0;
        for (let i = 0; i < loop.length - 1; i++) { const p0 = loop[i][0], p1 = loop[i + 1][0], L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]); if (L) { segs.push({ p0, p1, L, s: tot, k: loop[i][1] === 'w' || loop[i + 1][1] === 'w' ? 'w' : loop[i][1] }); tot += L; } }
        const a = clamp(st.I / 0.3, 0.25, 1); ctx.fillStyle = C.current;
        let j = 0;
        for (let d = (st.flow * 40) % 26; d < tot; d += 26) {
          while (j < segs.length - 1 && d >= segs[j].s + segs[j].L) j++;
          const g = segs[j], t = (d - g.s) / g.L;
          ctx.globalAlpha = a * (g.k === 'b' ? 0.4 : 1);
          ctx.beginPath(); ctx.arc(g.p0[0] + (g.p1[0] - g.p0[0]) * t, g.p0[1] + (g.p1[1] - g.p0[1]) * t, g.k === 'w' ? 5 : 4, 0, Math.PI * 2); ctx.fill();
        }
        // 앞줄의 전류 방향(아래로)
        ctx.globalAlpha = a; ctx.strokeStyle = C['paper-2']; ctx.lineWidth = 2.5;
        for (const m of [1, 3, 5]) {
          const k = Math.round(CK * (m - 0.25)), p = cp[Math.min(k, cp.length - 1)];
          ctx.save(); ctx.translate(p[0], p[1]); ctx.rotate(Math.PI / 2);
          ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(-8, -9); ctx.lineTo(-3, 0); ctx.lineTo(-8, 9); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore();
        }
        ctx.globalAlpha = 1;
      }
      const on = st.I > LED_ON, g = on ? clamp((st.I - LED_ON) / (1 - LED_ON) * 1.6, 0.25, 1) : 0;
      if (on) {
        const grd = ctx.createRadialGradient(LED.x, LED.y, 6, LED.x, LED.y, 110);
        grd.addColorStop(0, hexA(C.n, 0.55 * g)); grd.addColorStop(1, hexA(C.n, 0));
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(LED.x, LED.y, 110, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = '#eef1f3'; ctx.strokeStyle = C.ink; ctx.lineWidth = 3;
      ctx.fillRect(LED.x - 70, LED.y - 70, 140, 140); ctx.strokeRect(LED.x - 70, LED.y - 70, 140, 140);
      ctx.fillStyle = on ? C.n : C['paper-2'];
      ctx.beginPath(); ctx.moveTo(LED.x - 22, LED.y - 26); ctx.lineTo(LED.x + 18, LED.y); ctx.lineTo(LED.x - 22, LED.y + 26); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(LED.x + 20, LED.y - 26); ctx.lineTo(LED.x + 20, LED.y + 26); ctx.stroke();
      ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(LED.x - 40, LED.y - 30); ctx.lineTo(LED.x - 40, LED.y); ctx.lineTo(LED.x - 22, LED.y); ctx.moveTo(LED.x + 20, LED.y); ctx.lineTo(LED.x + 40, LED.y); ctx.lineTo(LED.x + 40, LED.y + 30); ctx.stroke();
      label(ctx, C, '발광 다이오드', LED.x, LED.y + 106);
      label(ctx, C, on ? '켜짐' : '꺼짐', LED.x, LED.y - 100, 'center', 28);
      // 그래프
      const cv = S.charts[0];
      if (cv) {
        lineChart(cv, S.dpr, C, st.hist, {
          lo: -1.1, hi: 1.1, color: C.current, ticks: [-1, 0, 1], tickLabel: (v) => (v === 0 ? '0' : v > 0 ? '+' : '−'),
          shade: (i) => st.hist[i] > LED_ON,
        });
      }
    }
    const S = makeStage(root, draw, step);
    ui.fan.forEach((b) => b.addEventListener('click', () => {
      st.fan = Number(b.dataset.fan);
      ui.fan.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    }));
    S.fit();
    return { setActive: S.setActive, fit: S.fit, setFan(l) { const b = ui.fan.find((x) => Number(x.dataset.fan) === l); if (b) b.click(); } };
  }

  // ===================== 자석 사이에서 도는 코일 =====================
  function mountRot(root) {
    const C = colors();
    const CEN = { x: 528, y: 360 }, A = 150, Bh = 120;                // 코일 반 너비, 반 높이
    const YS = [-90, -45, 0, 45, 90], ZS = [-140, -105, -70, -35, 0, 35, 70, 105, 140];
    const proj = (X, Y, Z) => [CEN.x + X - 0.38 * Z, CEN.y - Y + 0.3 * Z];   // 위쪽 앞에서 비스듬히 본 그림
    const CAPTION = {
      0: '0° · 코일 면이 자기장과 나란하다. 코일 면을 통과하는 자기력선이 없다.',
      45: '0°→90° · 코일 면을 똑바로 뚫고 지나는 자기장이 세진다. 통과하는 자기력선이 늘어난다.',
      90: '90° · 통과하는 자기력선이 가장 많다. 이 순간을 지나며 유도 전류의 방향이 바뀐다.',
      135: '90°→180° · 통과하는 자기력선이 줄어든다. 유도 전류는 반대 방향으로 흐른다.',
    };
    const st = { th: 0, w: 0, auto: false, drag: null, I: 0, dots: 0, tween: null };
    const ui = {
      count: root.querySelector('.readout .count b'), trend: root.querySelector('.readout .trend'), verdict: root.querySelector('.readout .verdict'),
      cap: root.querySelector('.rot-cap'), auto: root.querySelector('#rot-auto'), steps: [...root.querySelectorAll('[data-deg]')],
    };
    const W_AUTO = 2 * Math.PI / 4;                                     // 4초에 한 바퀴
    const count = () => {
      const s = Math.abs(Math.sin(st.th));
      return ZS.filter((z) => Math.abs(z) < A * s - 1e-6).length * YS.length;
    };

    function step(dt) {
      if (st.auto && !st.drag) st.w += (W_AUTO - st.w) * (1 - Math.exp(-dt / 0.4));
      else if (!st.drag && !st.tween) st.w *= Math.exp(-dt / 0.25);
      if (!st.drag && !st.tween) st.th += st.w * dt;
      st.I = -Math.cos(st.th) * st.w / W_AUTO;                          // Φ ∝ -sin θ 의 변화율
      st.dots += st.I * dt * 2;
      uiTick += dt;
      if (uiTick > 0.1) { uiTick = 0; updateUI(); }
    }
    let uiTick = 0, prevCount = 0;
    function updateUI() {
      const n = count();
      if (ui.count) ui.count.textContent = n;
      const d = Math.sign(Math.sin(2 * st.th) * st.w);                  // |sin θ|가 늘면 +
      if (ui.trend) ui.trend.innerHTML = Math.abs(st.w) < 0.05 ? '<span class="chip">―</span>변하지 않음' : d > 0 ? '<span class="chip">▲</span>늘어나는 중' : '<span class="chip">▼</span>줄어드는 중';
      if (ui.verdict) ui.verdict.innerHTML = Math.abs(st.I) < 0.06 ? '<b>바늘이 멈춰 있다</b> → 전류가 없다' : `<b>전류가 흐른다</b> → 바늘이 ${st.I > 0 ? '오른쪽' : '왼쪽'}`;
      prevCount = n;
    }

    function poly(pts) { ctx2.beginPath(); pts.forEach(([x, y], i) => (i ? ctx2.lineTo(x, y) : ctx2.moveTo(x, y))); ctx2.closePath(); }
    let ctx2 = null;
    function box(X0, X1, col, txt) {
      const Y0 = -170, Y1 = 170, Z0 = -190, Z1 = 190;
      const f = [proj(X0, Y1, Z1), proj(X1, Y1, Z1), proj(X1, Y0, Z1), proj(X0, Y0, Z1)];
      const t = [proj(X0, Y1, Z0), proj(X1, Y1, Z0), proj(X1, Y1, Z1), proj(X0, Y1, Z1)];
      const sd = X1 > 0 ? [proj(X1, Y1, Z0), proj(X1, Y0, Z0), proj(X1, Y0, Z1), proj(X1, Y1, Z1)] : [proj(X1, Y1, Z0), proj(X1, Y0, Z0), proj(X1, Y0, Z1), proj(X1, Y1, Z1)];
      ctx2.strokeStyle = C.ink; ctx2.lineWidth = 3;
      ctx2.fillStyle = hexA(col, 0.75); poly(t); ctx2.fill(); ctx2.stroke();
      ctx2.fillStyle = hexA(col, 0.6); poly(sd); ctx2.fill(); ctx2.stroke();
      ctx2.fillStyle = col; poly(f); ctx2.fill(); ctx2.stroke();
      const c = proj((X0 + X1) / 2, 0, Z1);
      ctx2.fillStyle = C['paper-2']; ctx2.font = `800 64px ${C.font}`; ctx2.textAlign = 'center'; ctx2.textBaseline = 'middle'; ctx2.fillText(txt, c[0], c[1]);
    }
    function draw(ctx) {
      ctx2 = ctx; grid(ctx, C);
      const s = Math.sin(st.th), cth = Math.cos(st.th);
      const corner = (u, y) => proj(u * cth * A, y, u * s * A);          // 코일 위의 점: 축(Y) 둘레로 θ만큼 돈 방향 u
      box(-450, -300, C.n, 'N');
      // 자기력선: 먼 줄(뒤)부터
      const lines = [];
      for (const y of YS) for (const z of ZS) lines.push({ y, z, through: Math.abs(z) < A * Math.abs(s) - 1e-6 });
      lines.sort((a, b) => a.z - b.z);
      for (const L of lines) {
        const [x0, y0] = proj(-300, L.y, L.z), [x1, y1] = proj(300, L.y, L.z);
        ctx.strokeStyle = C.field; ctx.globalAlpha = L.through ? 0.95 : 0.28; ctx.lineWidth = L.through ? 3.2 : 1.6;
        ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        ctx.fillStyle = C.field; ctx.beginPath(); const ax = x1 - 30, ay = y1;
        ctx.moveTo(ax + 12, ay); ctx.lineTo(ax - 6, ay - 7); ctx.lineTo(ax - 6, ay + 7); ctx.closePath(); ctx.fill();
      }
      ctx.globalAlpha = 1;
      box(300, 450, C.s, 'S');
      // 회전축과 손잡이
      const axTop = proj(0, Bh + 40, 0), axBot = proj(0, -Bh - 150, 0);
      ctx.strokeStyle = C['ink-2']; ctx.lineWidth = 7; ctx.beginPath(); ctx.moveTo(axTop[0], axTop[1]); ctx.lineTo(axBot[0], axBot[1]); ctx.stroke();
      const hc = proj(0, -Bh - 150, 0), arm = [proj(70 * cth, -Bh - 150, 70 * s)];
      ctx.lineWidth = 9; ctx.strokeStyle = C.ink; ctx.beginPath(); ctx.moveTo(hc[0], hc[1]); ctx.lineTo(arm[0][0], arm[0][1]); ctx.stroke();
      ctx.fillStyle = C.accent; ctx.beginPath(); ctx.arc(arm[0][0], arm[0][1], 16, 0, Math.PI * 2); ctx.fill();
      label(ctx, C, '손잡이를 좌우로 끌어 돌리기 →', hc[0] - 40, hc[1] + 6, 'right', 22);
      // 코일(사각 고리): 뒤쪽 변은 옅게
      const P = [corner(-1, Bh), corner(1, Bh), corner(1, -Bh), corner(-1, -Bh)];
      ctx.fillStyle = hexA(C['copper-b'], Math.abs(s) > 0.05 ? 0.12 : 0.05); poly(P); ctx.fill();
      ctx.strokeStyle = C['copper-f']; ctx.lineWidth = 10; poly(P); ctx.stroke();
      // 코일 속 전류 점
      if (Math.abs(st.I) > 0.04) {
        ctx.fillStyle = C.current;
        const per = [P[0], P[1], P[2], P[3], P[0]];
        const segs = [0, 1, 2, 3].map((i) => Math.hypot(per[i + 1][0] - per[i][0], per[i + 1][1] - per[i][1]));
        const tot = segs.reduce((a, b) => a + b, 0) || 1;
        for (let k = 0; k < 14; k++) {
          let d = ((k / 14 + st.dots) % 1 + 1) % 1 * tot, i = 0;
          while (i < 3 && d > segs[i]) { d -= segs[i]; i++; }
          const t = segs[i] ? d / segs[i] : 0;
          ctx.beginPath(); ctx.arc(per[i][0] + (per[i + 1][0] - per[i][0]) * t, per[i][1] + (per[i + 1][1] - per[i][1]) * t, 7, 0, Math.PI * 2); ctx.fill();
        }
      }
      // 각도 표시
      const deg = ((st.th * 180 / Math.PI) % 360 + 360) % 360;
      ctx.fillStyle = C.ink; ctx.font = `700 34px ${C.font}`; ctx.textAlign = 'left'; ctx.textBaseline = 'top';
      ctx.fillText(`코일이 돈 각: ${Math.round(deg)}°`, 30, 30);
      // 검류계(작게)
      const g = { x: 930, y: 640, r: 64 };
      ctx.fillStyle = C['paper-2']; ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      const na = clamp(st.I, -1.1, 1.1) * 55 * Math.PI / 180;
      ctx.strokeStyle = C.n; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(g.x, g.y + 18); ctx.lineTo(g.x + 48 * Math.sin(na), g.y + 18 - 48 * Math.cos(na)); ctx.stroke();
      label(ctx, C, '검류계', g.x, g.y + g.r + 24, 'center', 22);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(axBot[0], axBot[1]); ctx.lineTo(axBot[0], g.y + g.r + 6); ctx.lineTo(g.x, g.y + g.r + 6); ctx.stroke();
      // 그래프 두 개(가로축: 각도 0~360°)
      const N = 181, flux = new Float32Array(N), cur = new Float32Array(N);
      for (let i = 0; i < N; i++) { const a = i * 2 * Math.PI / (N - 1); flux[i] = 45 * Math.abs(Math.sin(a)); cur[i] = -Math.cos(a); }
      const m = Math.round(deg / 2);
      if (S.charts[0]) lineChart(S.charts[0], S.dpr, C, flux, { lo: 0, hi: 48, color: C.field, ticks: [0, 45], tickLabel: String, marker: m });
      if (S.charts[1]) {
        const ch = lineChart(S.charts[1], S.dpr, C, cur, { lo: -1.15, hi: 1.15, color: C.current, ticks: [-1, 0, 1], tickLabel: (v) => (v === 0 ? '0' : v > 0 ? '+' : '−'), marker: m });
        ch.c.strokeStyle = C['ink-3']; ch.c.setLineDash([4, 4]); ch.c.lineWidth = 1;
        for (const a of [90, 270]) { const x = ch.X(a / 2); ch.c.beginPath(); ch.c.moveTo(x, ch.T); ch.c.lineTo(x, ch.h - ch.B); ch.c.stroke(); }
        ch.c.setLineDash([]);
      }
    }
    const S = makeStage(root, draw, step);

    // 손잡이 돌리기: 좌우로 끌면 돈다
    S.canvas.addEventListener('pointerdown', (e) => {
      S.canvas.setPointerCapture(e.pointerId);
      stopTween(); st.drag = { id: e.pointerId, x: S.toLocal(e).x, t: performance.now() };
    });
    S.canvas.addEventListener('pointermove', (e) => {
      if (!st.drag || e.pointerId !== st.drag.id) return;
      const x = S.toLocal(e).x, t = performance.now(), d = (x - st.drag.x) * Math.PI / 360;
      st.th += d; st.w = d / Math.max((t - st.drag.t) / 1000, 1 / 120);
      st.drag.x = x; st.drag.t = t;
    });
    const end = (e) => { if (st.drag && e.pointerId === st.drag.id) st.drag = null; };
    S.canvas.addEventListener('pointerup', end); S.canvas.addEventListener('pointercancel', end);

    function stopTween() { if (st.tween) { st.tween.kill(); st.tween = null; } }
    function setAuto(on) {
      st.auto = on;
      if (ui.auto) { ui.auto.setAttribute('aria-pressed', String(on)); ui.auto.querySelector('span').textContent = on ? '멈추기' : '계속 돌리기'; }
    }
    function goDeg(deg) {
      setAuto(false); stopTween();
      const cur = st.th, base = cur - (((cur % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI));
      let target = base + deg * Math.PI / 180;
      if (target < cur - 1e-6) target += 2 * Math.PI;
      if (ui.cap) ui.cap.textContent = CAPTION[deg] || '';
      ui.steps.forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.deg) === deg)));
      if (!window.gsap || reduce) { st.th = target; st.w = 0; return; }
      const proxy = { th: cur };
      let prevT = performance.now();
      st.tween = gsap.to(proxy, {
        th: target, duration: 1.1, ease: 'power1.inOut',
        onUpdate() { const t = performance.now(), dt = Math.max((t - prevT) / 1000, 1 / 120); st.w = (proxy.th - st.th) / dt; st.th = proxy.th; prevT = t; },
        onComplete() { st.tween = null; st.w = 0; },
      });
    }
    ui.steps.forEach((b) => b.addEventListener('click', () => goDeg(Number(b.dataset.deg))));
    if (ui.auto) ui.auto.addEventListener('click', () => { stopTween(); setAuto(!st.auto); if (st.auto && ui.cap) ui.cap.textContent = '한 바퀴 도는 동안 자기력선 수가 늘었다 줄었다 하고, 유도 전류의 방향이 두 번 바뀐다.'; });
    S.fit(); updateUI();
    return { setActive(on) { S.setActive(on); if (!on) setAuto(false); }, fit: S.fit, goDeg };
  }

  window.MiniGen = { mountSimple, mountRot, lineChart, colors };
})();
