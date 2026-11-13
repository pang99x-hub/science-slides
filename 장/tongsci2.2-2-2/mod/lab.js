/* 전자기 유도 실험실
   자석이나 코일을 위아래로 끌면 코일을 통과하는 자기장의 세기가 바뀌고, 그만큼 유도 전류가 흐른다.
   자기 모형은 manim/cover.py와 같은 «두 극 모형»(극의 세기 1로 규격화)을 쓴다.
   자기력선 18줄은 N극에서 같은 양의 자기장을 나눠 맡도록 뽑았다(중심축에 가까운 선부터 번호).
   «코일을 통과하는 자기력선 수» n은 코일의 감은 줄마다 지나는 자기장의 평균을 이 18줄 단위로 나타낸 값이고,
   화면에서는 중심축에 가까운 선부터 n줄만 코일 속 구간을 진하게 칠한다. 진한 선을 세면 n과 같다.
   유도 전류는 같은 양이 변하는 빠르기로 계산한다. stepped 옵션을 켜면 화면의 n(반올림)이 바뀐 뒤에만, 움직인 빠르기에
   맞춰 한 줄만큼 따라가는 양으로 계산해서, 보이는 줄 수가 그대로면 바늘도 멈춘다(한 줄마다 흐르는 전기의 양은 같다).
   전류 부호: +는 B→Ⓖ→A (N극을 가까이 할 때의 방향).
   코일은 도선 한 가닥이 A(위 오른쪽)에서 감겨 내려가 B(아래 오른쪽)로 나온다. 위에서 보면 시계 반대 방향으로 감는다
   (오른쪽 → 뒤 → 왼쪽 → 앞). 그래서 +전류는 코일 속에서 A→B로 흐르며 앞줄을 왼쪽에서 오른쪽으로 지나고,
   오른손을 감은 방향으로 쥐면 엄지가 위 → 코일 위쪽이 N극(다가오는 N극을 밀어낸다). 전류 점은 코일 도선을 따라서도 흐른다. */
(function () {
  'use strict';

  // 설계 좌표(px). 무대 크기가 달라도 이 좌표계를 맞춰 늘린다.
  const DW = 1056, DH = 780;
  const CX = 330;                       // 코일과 자석의 중심선
  const CL = 240, R = 80, RY = 17;      // 코일 길이, 반지름, 타원 높이의 절반
  const TURNS_DRAWN = 8, TURNS_CALC = 10;
  const TURN_DRAW = { 10: 8, 20: 13, 30: 18 };      // 감은 수에 따라 그림에 그리는 바퀴 수(나선이 비스듬히 내려가는 게 보이게 성기게)
  const MW = 62, ML = 230, INSET = 18;  // 자석 폭, 길이, 극이 면에서 들어간 거리
  const G = { x: 700, y: 300, r: 74 };  // 검류계
  const BULB = { x: 880, y: 560, r: 40 };
  const FULL = 2.2;                     // 바늘이 끝까지 가는 유도 전류(1/s)
  const E_BAR = 6;                      // 에너지 막대가 꽉 차는 전기 에너지(∫I²dt, 넣었다 빼기 열 번쯤)
  const LINES_PER_SIDE = 9;
  const COIL_END = 12, COIL_K = 28;     // 코일 나선의 위·아래 끝(코일 윗면·아랫면에서 안쪽으로), 한 바퀴를 나누는 점 수
  const HIST_SEC = 8, HIST_HZ = 30;

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // stepped: 보이는 줄 수가 바뀐 뒤, 자기장이 STEP_W줄 더 변하는 동안 한 줄을 따라간다(빠르게 움직일수록 빨리 → 전류가 세다).
  // 움직임을 멈춰도 STEP_MIN(줄/초)으로 마저 따라간다.
  const STEP_W = 0.5, STEP_MIN = 1;

  function fluxUp(z, zN, zS, a) {
    const pole = (zp, q) => { const s = z - zp; return q / 2 * Math.sign(s) * (1 - Math.abs(s) / Math.hypot(s, a)); };
    let f = pole(zN, 1) + pole(zS, -1);
    if (z > Math.min(zN, zS) && z < Math.max(zN, zS)) f += zN > zS ? 1 : -1;
    return f;
  }

  // 자기력선: 자석 아랫면을 높이 0, 위로 +h. N극이 아래인 자석 기준으로 한 번만 계산한다.
  function computeLines() {
    const hN = INSET, hS = ML - INSET;
    const H = (x, h) => {
      let vx = 0, vh = 0;
      for (const [ph, q] of [[hN, 1], [hS, -1]]) {
        const dx = x, dh = h - ph, r = Math.max(Math.hypot(dx, dh), 1e-3);
        vx += q * dx / r ** 3; vh += q * dh / r ** 3;
      }
      return [vx, vh];
    };
    const lines = [];
    for (let i = 1; i <= LINES_PER_SIDE; i++) {
      const th = Math.acos(1 - 2 * (i - 0.5) / LINES_PER_SIDE);  // 같은 선속마다 한 줄
      for (const side of [-1, 1]) {
        let x = side * 10 * Math.sin(th), h = hN - 10 * Math.cos(th);
        const pts = [x, h];
        for (let k = 0; k < 1400; k++) {
          let [vx, vh] = H(x, h); let n = Math.hypot(vx, vh); if (n < 1e-12) break;
          const mx = x + 2 * vx / n, mh = h + 2 * vh / n;
          [vx, vh] = H(mx, mh); n = Math.hypot(vx, vh);
          x += 4 * vx / n; h += 4 * vh / n;
          pts.push(x, h);
          if (Math.hypot(x, h - hS) < 10 || Math.abs(x) > 1500 || h < -1300 || h > 1500) break;
        }
        lines.push(Float32Array.from(pts));
      }
    }
    return lines;
  }

  // opts: full(바늘이 끝까지 가는 전류), induced(유도 자기장·극·척력/인력·전류 방향 표시),
  //       force(자석이 받는 힘 화살표), switchable(회로 스위치), turns(감은 수 10·20·30), onFrame(st),
  //       stepped(보이는 줄 수가 바뀔 때만 전류: 1차시 실험실)
  function mount(root, opts) {
    const o = Object.assign({ full: FULL, induced: false, force: false, switchable: false, turns: 10, onFrame: null, stepped: false }, opts);
    const FULL_I = o.full;
    const stage = root.querySelector('.stage');
    const canvas = stage.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const hint = stage.querySelector('.hint');
    const el = (s) => root.querySelector(s);
    const ui = {
      seg: [...root.querySelectorAll('.seg[data-role="mode"] button')],
      flip: el('.stage [data-act="flip"]'), demo: el('.stage [data-act="demo"]'), sw: el('[data-act="switch"]'), ereset: el('[data-act="ereset"]'),
      count: el('.readout .count b'), trend: el('.readout .trend'), verdict: el('.readout .verdict'),
      checks: Object.fromEntries([...root.querySelectorAll('.checks li')].map((li) => [li.dataset.mode, li])),
      chartFlux: el('canvas[data-chart="flux"]'), chartCur: el('canvas[data-chart="current"]'),
      eHand: el('.ebar[data-e="hand"] i'), eElec: el('.ebar[data-e="elec"] i'),
    };
    const css = getComputedStyle(document.documentElement);
    const C = {};
    for (const k of ['ink', 'ink-2', 'ink-3', 'paper-2', 'rule', 'grid', 'accent', 'n', 's', 'field', 'current', 'copper-f', 'copper-b', 'glow', 'induced', 'stamp'])
      C[k] = css.getPropertyValue('--' + k).trim();
    const FONT = css.getPropertyValue('--f-body').trim();

    const lines = computeLines();
    // 화면 밖으로 빠져나간 선이 S극으로 되돌아 들어오는 쪽(자석 가운데를 기준으로 위아래를 뒤집고 방향을 거꾸로 한 선).
    // 그림에만 더하고, 코일을 통과하는 줄 수(lines의 18줄)에는 넣지 않는다.
    const backLines = lines.filter((arr) => Math.hypot(arr[arr.length - 2], arr[arr.length - 1] - (ML - INSET)) >= 10).map((arr) => {
      const m = new Float32Array(arr.length);
      for (let j = 0; j < arr.length; j += 2) { const k = arr.length - 2 - j; m[j] = arr[k]; m[j + 1] = ML - arr[k + 1]; }
      return m;
    });
    const st = {
      mode: 'magnet', polarity: 1,           // 1: N극이 아래
      magY: 290, coilY: 430,                 // 자석 아랫면, 코일 윗면(화면 y)
      phi: 0, prevPhi: null, q: null, xPrev: 0, I: 0, dAbs: 0,
      turns: o.turns, mag: 1, open: false, Ie: 0, eElec: 0, hold: null,   // Ie: 감은 수와 스위치까지 따진 실제 전류
      needle: 0, needleV: 0, dotOff: 0,
      drag: null, active: false, demo: null,
      moved: { magnet: 0, coil: 0, both: 0 }, peak: { magnet: 0, coil: 0, both: 0 },
      results: {},
      hist: { flux: new Float32Array(HIST_SEC * HIST_HZ), cur: new Float32Array(HIST_SEC * HIST_HZ), n: 0, acc: 0 },
      hover: { flux: null, current: null },
    };
    let scale = 1, dpr = 1, raf = 0, last = 0, uiTick = 0;

    // ---------- 크기 ----------
    function fit() {
      const w = stage.offsetWidth, h = stage.offsetHeight;
      scale = Math.min(w / DW, h / DH);
      const revealScale = (window.Reveal && Reveal.getScale) ? Reveal.getScale() : 1;
      dpr = clamp((window.devicePixelRatio || 1) * revealScale, 1, 3);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      for (const c of [ui.chartFlux, ui.chartCur]) { if (c) { c.width = Math.round(c.offsetWidth * dpr); c.height = Math.round(c.offsetHeight * dpr); } }
      draw(); drawCharts();
    }

    // ---------- 물리 ----------
    const poleY = () => st.polarity === 1
      ? { yN: st.magY - INSET, yS: st.magY - ML + INSET }
      : { yN: st.magY - ML + INSET, yS: st.magY - INSET };
    function phiDown() {
      const { yN, yS } = poleY();
      let sum = 0;
      for (let i = 0; i < TURNS_CALC; i++) {
        const y = st.coilY + 10 + (CL - 20) * i / (TURNS_CALC - 1);
        sum += fluxUp(-y, -yN, -yS, R);
      }
      return -sum / TURNS_CALC * st.mag;              // 자석 두 개를 겹치면 자기장도 두 배
    }
    // 코일 속이면서 자석 몸통에 가려지지 않은 곳
    const inCoil = (x, y) => Math.abs(x - CX) < R - 2 && y > st.coilY && y < st.coilY + CL
      && !(Math.abs(x - CX) < MW / 2 && y > st.magY - ML && y < st.magY);
    // n = 코일을 통과하는 자기장의 양을 18줄 단위로. 중심축에 가까운 n줄(lines 앞쪽부터)을 진하게 칠한다.
    function crossings() {
      const n = clamp(Math.round(Math.abs(st.phi) * lines.length), 0, lines.length);
      const crossed = new Uint8Array(lines.length);
      for (let i = 0; i < n; i++) crossed[i] = 1;
      return { count: n, crossed };
    }
    const lineCount = () => st.cross.count;

    function moveBy(dy, mode) {
      const before = { m: st.magY, c: st.coilY };
      if (mode === 'magnet') st.magY = clamp(st.magY + dy, ML + 20, st.coilY + CL - 30);
      else if (mode === 'coil') st.coilY = clamp(st.coilY + dy, Math.max(300, st.magY - CL + 30), 500);
      else {
        const lo = Math.max(ML + 20 - st.magY, 300 - st.coilY), hi = Math.min(500 - st.coilY, DH - 10 - st.coilY - CL);
        const d = clamp(dy, lo, hi); st.magY += d; st.coilY += d;
      }
      st.moved[mode] += Math.abs(st.magY - before.m) + Math.abs(st.coilY - before.c);
    }

    function step(dt) {
      st.phi = phiDown();
      st.cross = crossings();
      let dPhi, dAbs;
      if (o.stepped) {
        const N = lines.length, xs = st.phi * N, n = Math.sign(xs) * Math.round(Math.abs(xs));
        if (st.q === null) { st.q = n; st.xPrev = xs; }
        const room = Math.max(Math.abs(xs - st.xPrev) / STEP_W, dt * STEP_MIN);
        st.xPrev = xs;
        const q = st.q + Math.sign(n - st.q) * Math.min(Math.abs(n - st.q), room);
        dPhi = (q - st.q) / N / dt; dAbs = (Math.abs(q) - Math.abs(st.q)) / N / dt;
        st.q = q;
      } else {
        if (st.prevPhi === null) st.prevPhi = st.phi;
        dPhi = (st.phi - st.prevPhi) / dt;
        dAbs = (Math.abs(st.phi) - Math.abs(st.prevPhi)) / dt;
        st.prevPhi = st.phi;
      }
      const k = 1 - Math.exp(-dt / 0.05);
      st.I += (dPhi - st.I) * k;
      st.dAbs += (dAbs - st.dAbs) * k;
      st.Ie = st.open ? 0 : st.I * st.turns / 10;                 // 감은 수에 비례, 회로가 끊기면 0
      const target = clamp(st.Ie / FULL_I, -1, 1);
      const acc = 150 * (target - st.needle) - 17 * st.needleV;     // 용수철처럼 따라가는 바늘
      st.needleV += acc * dt; st.needle += st.needleV * dt;
      st.dotOff += st.Ie * 150 * dt;
      st.eElec += st.Ie * st.Ie * dt;
      const p = Math.abs(target);
      if (p > st.peak[st.mode]) st.peak[st.mode] = p;
      if (p > 0.06) st.hold = { up: st.Ie > 0, rep: st.dAbs > 0, mag: p, until: performance.now() + 1400 };
      // 기록
      st.hist.acc += dt;
      while (st.hist.acc >= 1 / HIST_HZ) {
        st.hist.acc -= 1 / HIST_HZ;
        const N = st.hist.flux.length;
        st.hist.flux.copyWithin(0, 1); st.hist.cur.copyWithin(0, 1);
        st.hist.flux[N - 1] = Math.abs(st.phi) * lines.length;
        st.hist.cur[N - 1] = clamp(st.Ie / FULL_I, -1.15, 1.15);
        st.hist.n = Math.min(N, st.hist.n + 1);
      }
    }

    // ---------- 그리기 ----------
    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const ox = (stage.offsetWidth - DW * scale) / 2, oy = (stage.offsetHeight - DH * scale) / 2;
      ctx.translate(ox, oy); ctx.scale(scale, scale);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';

      // 모눈
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= DW; x += 40) { ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, DH); }
      for (let y = 0; y <= DH; y += 40) { ctx.moveTo(0, y + .5); ctx.lineTo(DW, y + .5); }
      ctx.stroke();

      drawWires();
      drawCoil('back');
      drawField();
      drawMagnet();
      drawCoil('front');
      drawFieldInside();
      drawGalvanometer();
      drawBulb();
      drawLabels();
      if (o.switchable) drawSwitch();
      const h = st.hold && performance.now() < st.hold.until ? st.hold : null;
      if (o.induced && h) drawInduced(h);
      if (o.force && h) drawForce(h);
    }

    // 회로 스위치: A쪽 전선 위
    function drawSwitch() {
      const y = st.coilY + 12, a = 452, b = 500;
      ctx.strokeStyle = C['paper-2']; ctx.lineWidth = 10;
      ctx.beginPath(); ctx.moveTo(a + 4, y); ctx.lineTo(b - 4, y); ctx.stroke();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.moveTo(a, y); ctx.lineTo(st.open ? a + 40 : b, st.open ? y - 30 : y); ctx.stroke();
      ctx.fillStyle = C.ink;
      for (const x of [a, b]) { ctx.beginPath(); ctx.arc(x, y, 6, 0, Math.PI * 2); ctx.fill(); }
      ctx.font = `600 22px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
      ctx.fillText(st.open ? '스위치 열림' : '스위치', (a + b) / 2, y - 34);
    }

    // 유도 자기장(초록 점선)과 코일 위쪽에 생긴 극, 자석과 코일 사이의 힘, 검류계를 지나는 전류 방향
    function drawInduced(h) {
      const top = st.coilY, bot = st.coilY + CL, up = h.up;
      ctx.save();
      ctx.strokeStyle = C.induced; ctx.fillStyle = C.induced; ctx.lineWidth = 5; ctx.setLineDash([12, 9]);
      for (const dx of [-46, 46]) {
        const x = CX + dx, y0 = up ? bot - 14 : top + 14, y1 = up ? top + 22 : bot - 22;
        ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y1); ctx.stroke();
        ctx.setLineDash([]); ctx.beginPath();
        if (up) { ctx.moveTo(x, y1 - 14); ctx.lineTo(x - 11, y1 + 6); ctx.lineTo(x + 11, y1 + 6); }
        else { ctx.moveTo(x, y1 + 14); ctx.lineTo(x - 11, y1 - 6); ctx.lineTo(x + 11, y1 - 6); }
        ctx.closePath(); ctx.fill(); ctx.setLineDash([12, 9]);
      }
      ctx.restore();
      // 코일 위쪽 극 표시
      const pole = up ? 'N' : 'S', pc = up ? C.n : C.s;
      const bx = CX - R - 70, by = top + 6;
      ctx.fillStyle = pc; ctx.beginPath(); ctx.arc(bx, by, 26, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = C['paper-2']; ctx.font = `800 30px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(pole, bx, by + 1);
      ctx.fillStyle = C.ink; ctx.font = `600 22px ${FONT}`; ctx.textAlign = 'right';
      ctx.fillText('코일 위쪽', bx - 34, by - 12); ctx.fillText(`${pole}극`, bx - 34, by + 16);
      // 척력·인력
      const gapMid = (st.magY + top) / 2;
      ctx.fillStyle = C.ink; ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
      const ax = CX + MW / 2 + 70, len = 26;
      const tri = (x, y, dir) => { ctx.beginPath(); ctx.moveTo(x, y + dir * 12); ctx.lineTo(x - 10, y - dir * 6); ctx.lineTo(x + 10, y - dir * 6); ctx.closePath(); ctx.fill(); };
      if (h.rep) {        // 서로 밀어냄: 위 화살표는 위로, 아래 화살표는 아래로
        ctx.beginPath(); ctx.moveTo(ax, gapMid - 8); ctx.lineTo(ax, gapMid - 8 - len); ctx.moveTo(ax, gapMid + 8); ctx.lineTo(ax, gapMid + 8 + len); ctx.stroke();
        tri(ax, gapMid - 8 - len - 6, -1); tri(ax, gapMid + 8 + len + 6, 1);
      } else {            // 서로 끌어당김
        ctx.beginPath(); ctx.moveTo(ax, gapMid - 8 - len - 14); ctx.lineTo(ax, gapMid - 14); ctx.moveTo(ax, gapMid + 8 + len + 14); ctx.lineTo(ax, gapMid + 14); ctx.stroke();
        tri(ax, gapMid - 8, 1); tri(ax, gapMid + 8, -1);
      }
      ctx.font = `700 26px ${FONT}`; ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
      ctx.fillText(h.rep ? '척력' : '인력', ax + 22, gapMid);
      // 전류 방향
      ctx.font = `700 28px ${FONT}`; ctx.textAlign = 'center'; ctx.fillStyle = C.current;
      ctx.fillText(up ? 'B → Ⓖ → A' : 'A → Ⓖ → B', G.x, G.y - G.r - 26);
    }

    // 자석이 받는 힘: 전류가 셀수록 크다. 손은 이 힘을 이기며 자석을 움직여야 한다.
    function drawForce(h) {
      const x = CX - MW / 2 - 60, y = st.magY - ML / 2, len = 30 + 110 * clamp(h.mag, 0, 1);
      const dir = h.rep ? -1 : 1;                    // 척력이면 위로(코일에서 멀어지게), 인력이면 아래로
      ctx.strokeStyle = C.stamp; ctx.fillStyle = C.stamp; ctx.lineWidth = 8;
      ctx.beginPath(); ctx.moveTo(x, y - dir * len / 2); ctx.lineTo(x, y + dir * len / 2); ctx.stroke();
      const ty = y + dir * len / 2;
      ctx.beginPath(); ctx.moveTo(x, ty + dir * 18); ctx.lineTo(x - 14, ty - dir * 4); ctx.lineTo(x + 14, ty - dir * 4); ctx.closePath(); ctx.fill();
      ctx.font = `700 26px ${FONT}`; ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
      ctx.fillText(h.rep ? '척력' : '인력', x - 22, y);
    }

    function wirePath() {
      const yA = st.coilY + COIL_END, yB = st.coilY + CL - COIL_END, x0 = CX + R;
      // B에서 A까지. 세 번째 값 true는 «바로 앞 점에서 여기까지는 전구·검류계 속»이라 선을 긋지 않는다는 뜻
      return [
        [x0, yB], [560, yB], [560, 700], [BULB.x, 700], [BULB.x, BULB.y + BULB.r], [BULB.x, BULB.y - BULB.r, true],
        [BULB.x, G.y], [G.x + G.r, G.y], [G.x - G.r, G.y, true], [520, G.y], [520, yA], [x0, yA],
      ];
    }
    // 코일 도선(나선): A에서 시작해 θ가 늘수록 오른쪽 → 뒤(화면 위쪽) → 왼쪽 → 앞(화면 아래쪽)으로 돌며 내려간다
    function coilPath() {
      const n = TURN_DRAW[st.turns] || TURNS_DRAWN, y0 = st.coilY + COIL_END, y1 = st.coilY + CL - COIL_END, N = n * COIL_K;
      const pts = [];
      for (let k = 0; k <= N; k++) { const th = 2 * Math.PI * k / COIL_K; pts.push([CX + R * Math.cos(th), y0 + (y1 - y0) * k / N - RY * Math.sin(th), th]); }
      return { pts, n, pitch: (y1 - y0) / n };
    }
    const frontAt = (th) => Math.sin(th) < 0;                       // 앞줄(보는 쪽): 화면에서 아래 반쪽
    // 전류 점: 바깥 전선(B→…→Ⓖ→A)과 코일 도선(A→B)을 이은 고리를 따라 흐른다. +전류면 이 순서대로 움직인다
    function currentDots() {
      const a = clamp(Math.abs(st.Ie) / (0.12 * FULL_I), 0, 1);
      if (a < 0.03) return null;
      const P = wirePath(), C2 = coilPath().pts, segs = [];
      let total = 0;
      for (let i = 0; i < P.length - 1; i++) { const L = Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]); segs.push({ p0: P[i], p1: P[i + 1], L, start: total, hidden: !!P[i + 1][2], layer: 'wire' }); total += L; }
      for (let i = 0; i < C2.length - 1; i++) { const L = Math.hypot(C2[i + 1][0] - C2[i][0], C2[i + 1][1] - C2[i][1]); segs.push({ p0: C2[i], p1: C2[i + 1], L, start: total, layer: frontAt((C2[i][2] + C2[i + 1][2]) / 2) ? 'front' : 'back' }); total += L; }
      const gap = 30, off = ((st.dotOff % gap) + gap) % gap, out = [];
      let j = 0;
      for (let s = off; s < total; s += gap) {
        while (j < segs.length - 1 && s >= segs[j].start + segs[j].L) j++;
        const sg = segs[j]; if (sg.hidden) continue;
        const t = (s - sg.start) / sg.L;
        out.push({ x: sg.p0[0] + (sg.p1[0] - sg.p0[0]) * t, y: sg.p0[1] + (sg.p1[1] - sg.p0[1]) * t, layer: sg.layer });
      }
      return { a, dots: out };
    }
    function drawDots(layer) {
      const d = st.dots; if (!d) return;
      ctx.fillStyle = C.current;
      for (const p of d.dots) {
        if (p.layer !== layer) continue;
        ctx.globalAlpha = d.a * (layer === 'back' ? 0.4 : 1);
        ctx.beginPath(); ctx.arc(p.x, p.y, layer === 'wire' ? 6 : 5, 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    function drawWires() {
      const P = wirePath();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]);
      for (let i = 1; i < P.length; i++) { if (P[i][2]) ctx.moveTo(P[i][0], P[i][1]); else ctx.lineTo(P[i][0], P[i][1]); }
      ctx.stroke();
      st.dots = currentDots();
      drawDots('wire');
    }

    // 코일: 뒷줄은 자석 뒤에(흐리게), 앞줄은 자석 앞에. 한 가닥으로 이어 그려 감은 방향이 보이게 한다
    function drawCoil(part) {
      const front = part === 'front', { pts, n, pitch } = coilPath();
      ctx.strokeStyle = front ? C['copper-f'] : C['copper-b'];
      ctx.lineWidth = front ? (n > 18 ? 5 : 7) : 4;
      ctx.beginPath();
      let pen = false;
      for (let i = 1; i < pts.length; i++) {
        if (frontAt((pts[i - 1][2] + pts[i][2]) / 2) === front) { if (!pen) { ctx.moveTo(pts[i - 1][0], pts[i - 1][1]); pen = true; } ctx.lineTo(pts[i][0], pts[i][1]); }
        else pen = false;
      }
      ctx.stroke();
      drawDots(part);
      // 전류가 흐르는 동안 앞줄에 방향 화살표(+전류면 왼쪽 → 오른쪽)
      if (front && st.dots) {
        const sgn = Math.sign(st.Ie), every = n > 18 ? 4 : 3;
        ctx.fillStyle = C.current; ctx.strokeStyle = C['paper-2']; ctx.lineWidth = 2.5; ctx.globalAlpha = st.dots.a;
        for (let t = 1; t < n; t += every) {
          const th = 2 * Math.PI * t + 1.5 * Math.PI, k = t * COIL_K + 0.75 * COIL_K;
          const x = CX + R * Math.cos(th), y = st.coilY + COIL_END + pitch * (k / COIL_K) - RY * Math.sin(th);
          const ang = Math.atan2(pitch / (2 * Math.PI) - RY * Math.cos(th), -R * Math.sin(th)) + (sgn < 0 ? Math.PI : 0);
          ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
          ctx.beginPath(); ctx.moveTo(13, 0); ctx.lineTo(-9, -10); ctx.lineTo(-4, 0); ctx.lineTo(-9, 10); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore();
        }
        ctx.globalAlpha = 1;
      }
      if (front && (st.mode === 'coil' || st.mode === 'both')) {
        ctx.save(); ctx.setLineDash([10, 9]); ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5;
        ctx.strokeRect(CX - R - 18, st.coilY - RY - 14, 2 * R + 36, CL + 2 * RY + 28); ctx.restore();
      }
    }

    function linePoint(arr, j) {
      const x = arr[j], h = st.polarity === 1 ? arr[j + 1] : ML - arr[j + 1];
      return [CX + x, st.magY - h];
    }
    function drawField() {
      ctx.strokeStyle = C.field; ctx.lineWidth = 2.2; ctx.globalAlpha = 0.5;
      for (const arr of lines.concat(backLines)) {
        ctx.beginPath();
        let [x, y] = linePoint(arr, 0); ctx.moveTo(x, y);
        for (let j = 2; j < arr.length; j += 4) { [x, y] = linePoint(arr, j); ctx.lineTo(x, y); }
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // 화살표: N에서 S로
      ctx.fillStyle = C.field;
      for (const arr of lines.concat(backLines)) {
        for (const at of (backLines.includes(arr) ? [0.5, 0.78] : [0.22, 0.5])) {
          const j = Math.floor(arr.length / 2 * at) * 2;
          if (j + 4 >= arr.length) continue;
          const [x0, y0] = linePoint(arr, j), [x1, y1] = linePoint(arr, j + 4);
          if (x0 < 0 || x0 > DW || y0 < 0 || y0 > DH) continue;
          const ang = Math.atan2(y1 - y0, x1 - x0);
          ctx.save(); ctx.translate(x0, y0); ctx.rotate(ang); ctx.globalAlpha = 0.7;
          ctx.beginPath(); ctx.moveTo(7, 0); ctx.lineTo(-6, -5); ctx.lineTo(-6, 5); ctx.closePath(); ctx.fill(); ctx.restore();
        }
      }
    }
    // 코일 속을 지나는 선만, 코일 속 구간을 진하게 칠한다 (코일 앞면 위에). 진한 선의 수 = 화면의 숫자
    function drawFieldInside() {
      ctx.strokeStyle = C.field; ctx.lineWidth = 4; ctx.globalAlpha = 0.95;
      ctx.beginPath();
      lines.forEach((arr, i) => {
        if (!st.cross.crossed[i]) return;
        let pen = false;
        for (let j = 0; j < arr.length; j += 2) {
          const [x, y] = linePoint(arr, j);
          if (inCoil(x, y)) { if (pen) ctx.lineTo(x, y); else { ctx.moveTo(x, y); pen = true; } } else pen = false;
        }
      });
      ctx.stroke(); ctx.globalAlpha = 1;
    }

    function drawMagnet() {
      const top = st.magY - ML;
      const topCol = st.polarity === 1 ? C.s : C.n, botCol = st.polarity === 1 ? C.n : C.s;
      const topTxt = st.polarity === 1 ? 'S' : 'N', botTxt = st.polarity === 1 ? 'N' : 'S';
      // 자석 두 개를 겹치면 나란히 붙여 그린다. 두 개라도 코일 속에 들어간다.
      const w = st.mag === 2 ? MW * 0.62 : MW, xs = st.mag === 2 ? [CX - w - 1, CX + 1] : [CX - MW / 2];
      for (const x of xs) {
        ctx.fillStyle = topCol; ctx.fillRect(x, top, w, ML / 2);
        ctx.fillStyle = botCol; ctx.fillRect(x, top + ML / 2, w, ML / 2);
        ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(x, top, w, ML);
        ctx.beginPath(); ctx.moveTo(x, top + ML / 2); ctx.lineTo(x + w, top + ML / 2); ctx.stroke();
        ctx.fillStyle = C['paper-2']; ctx.font = `700 ${st.mag === 2 ? 30 : 40}px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.fillText(topTxt, x + w / 2, top + ML / 4); ctx.fillText(botTxt, x + w / 2, top + 3 * ML / 4);
      }
      if (st.mode === 'magnet' || st.mode === 'both') {
        const x = CX - MW / 2;
        ctx.save(); ctx.setLineDash([10, 9]); ctx.strokeStyle = C.accent; ctx.lineWidth = 2.5;
        ctx.strokeRect(x - 12, top - 12, MW + 24, ML + 24); ctx.restore();
      }
    }

    function drawGalvanometer() {
      ctx.fillStyle = C['paper-2']; ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(G.x, G.y, G.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      const px = G.x, py = G.y + 22, maxA = 55 * Math.PI / 180;
      ctx.lineWidth = 2.5;
      for (let i = -5; i <= 5; i++) {
        const a = i / 5 * maxA, r0 = i === 0 ? 40 : 46, r1 = 56;
        ctx.beginPath(); ctx.moveTo(px + r0 * Math.sin(a), py - r0 * Math.cos(a)); ctx.lineTo(px + r1 * Math.sin(a), py - r1 * Math.cos(a)); ctx.stroke();
      }
      ctx.fillStyle = C.ink; ctx.font = `700 24px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('G', px, py + 26);
      const a = clamp(st.needle, -1.1, 1.1) * maxA;
      ctx.strokeStyle = C.n; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(px + 54 * Math.sin(a), py - 54 * Math.cos(a)); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(px, py, 6, 0, Math.PI * 2); ctx.fill();
    }

    function drawBulb() {
      const g = clamp(Math.abs(st.Ie) / FULL_I * 1.3, 0, 1);
      if (g > 0.02) {
        const grd = ctx.createRadialGradient(BULB.x, BULB.y, BULB.r * 0.4, BULB.x, BULB.y, BULB.r * 3.4);
        grd.addColorStop(0, hexA(C.glow, 0.85 * g)); grd.addColorStop(1, hexA(C.glow, 0));
        ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(BULB.x, BULB.y, BULB.r * 3.4, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = g > 0.02 ? mix('#ffffff', C.glow, 0.6 * g) : C['paper-2'];
      ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.arc(BULB.x, BULB.y, BULB.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = mix(C.ink, C.current, g); ctx.lineWidth = 3.5;
      ctx.beginPath();
      const fx = BULB.x - 18, fy = BULB.y + 6;
      ctx.moveTo(fx, fy); ctx.lineTo(fx + 6, fy - 14); ctx.lineTo(fx + 12, fy); ctx.lineTo(fx + 18, fy - 14); ctx.lineTo(fx + 24, fy); ctx.lineTo(fx + 30, fy - 14); ctx.lineTo(fx + 36, fy);
      ctx.stroke();
    }

    function drawLabels() {
      ctx.fillStyle = C.ink; ctx.textBaseline = 'middle';
      ctx.font = `700 28px ${FONT}`; ctx.textAlign = 'left';
      ctx.fillText('A', CX + R + 14, st.coilY - 10);
      ctx.fillText('B', CX + R + 14, st.coilY + CL + 12);
      ctx.font = `600 26px ${FONT}`; ctx.textAlign = 'right';
      ctx.fillText('코일', CX - R - 26, st.coilY + CL / 2);
      ctx.textAlign = 'center';
      ctx.fillText('검류계', G.x, G.y + G.r + 30);
      ctx.textAlign = 'left';
      ctx.fillText('전구', BULB.x + BULB.r + 16, BULB.y);
    }

    function hexA(hex, a) {
      const n = parseInt(hex.slice(1), 16);
      return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
    }
    function mix(h1, h2, t) {
      const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16);
      const c = (s) => Math.round(((a >> s) & 255) * (1 - t) + ((b >> s) & 255) * t);
      return `rgb(${c(16)},${c(8)},${c(0)})`;
    }

    // ---------- 그래프 ----------
    function drawCharts() {
      if (!ui.chartFlux || !ui.chartCur) return;
      drawChart(ui.chartFlux, st.hist.flux, 0, LINES_PER_SIDE * 2, C.field, 'flux');
      drawChart(ui.chartCur, st.hist.cur, -1.15, 1.15, C.current, 'current');
    }
    function drawChart(cv, data, lo, hi, color, key) {
      const c = cv.getContext('2d'), w = cv.offsetWidth, h = cv.offsetHeight;
      c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, h);
      const padL = 46, padR = 14, padT = 10, padB = 10;
      const X = (i) => padL + (w - padL - padR) * i / (data.length - 1);
      const Y = (v) => padT + (h - padT - padB) * (1 - (v - lo) / (hi - lo));
      c.font = `500 18px ${FONT}`; c.fillStyle = C['ink-3']; c.textAlign = 'right'; c.textBaseline = 'middle';
      const ticks = key === 'flux' ? [0, LINES_PER_SIDE, LINES_PER_SIDE * 2] : [-1, 0, 1];
      const tickLabel = key === 'flux' ? (v) => String(v) : (v) => (v === 0 ? '0' : v > 0 ? '+' : '−');
      for (const t of ticks) {
        c.strokeStyle = t === 0 && key === 'current' ? C['ink-3'] : C.rule;
        c.lineWidth = t === 0 && key === 'current' ? 1.5 : 1;
        c.beginPath(); c.moveTo(padL, Math.round(Y(t)) + .5); c.lineTo(w - padR, Math.round(Y(t)) + .5); c.stroke();
        c.fillText(tickLabel(t), padL - 10, Y(t));
      }
      const start = data.length - st.hist.n;
      if (st.hist.n > 1) {
        c.strokeStyle = color; c.lineWidth = 2.5; c.lineJoin = 'round';
        c.beginPath();
        for (let i = start; i < data.length; i++) { const x = X(i), y = Y(data[i]); if (i === start) c.moveTo(x, y); else c.lineTo(x, y); }
        c.stroke();
        const ex = X(data.length - 1), ey = Y(data[data.length - 1]);
        c.fillStyle = C['paper-2']; c.beginPath(); c.arc(ex, ey, 7, 0, Math.PI * 2); c.fill();
        c.fillStyle = color; c.beginPath(); c.arc(ex, ey, 5, 0, Math.PI * 2); c.fill();
      }
      const hv = st.hover[key];
      if (hv !== null && hv >= start) {
        const x = X(hv), v = data[hv];
        c.strokeStyle = C['ink-2']; c.lineWidth = 1; c.setLineDash([4, 4]);
        c.beginPath(); c.moveTo(x, padT); c.lineTo(x, h - padB); c.stroke(); c.setLineDash([]);
        const sec = ((data.length - 1 - hv) / HIST_HZ).toFixed(1);
        const txt = key === 'flux' ? `${Math.round(v)}개 · ${sec}초 전` : `${v === 0 ? '0' : (v > 0 ? '+' : '−') + Math.abs(v).toFixed(2)} · ${sec}초 전`;
        c.font = `600 18px ${FONT}`; c.textAlign = x > w - 220 ? 'right' : 'left'; c.fillStyle = C.ink;
        c.fillText(txt, x + (x > w - 220 ? -10 : 10), padT + 14);
      }
    }
    for (const [cv, key] of [[ui.chartFlux, 'flux'], [ui.chartCur, 'current']].filter(([c]) => c)) {
      cv.addEventListener('pointermove', (e) => {
        const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) / r.width * cv.offsetWidth;
        const N = st.hist.flux.length, i = Math.round((x - 46) / (cv.offsetWidth - 60) * (N - 1));
        st.hover[key] = clamp(i, 0, N - 1); drawCharts();
      });
      cv.addEventListener('pointerleave', () => { st.hover[key] = null; drawCharts(); });
    }

    // ---------- 글자 갱신 ----------
    const CHECK_TEXT = { magnet: '자석을 움직였다', coil: '코일을 움직였다', both: '함께 움직였다' };
    function updateUI() {
      if (ui.count) ui.count.textContent = lineCount();
      const d = st.dAbs * LINES_PER_SIDE * 2;
      const trend = d > 0.6 ? ['▲', '늘어나는 중'] : d < -0.6 ? ['▼', '줄어드는 중'] : ['―', '변하지 않음'];
      if (ui.trend) ui.trend.innerHTML = `<span class="chip">${trend[0]}</span>${trend[1]}`;
      const moving = Math.abs(clamp(st.Ie / FULL_I, -1, 1)) > 0.06;
      if (ui.verdict) ui.verdict.innerHTML = moving
        ? '<b>바늘이 움직인다</b> → 전류가 흐른다'
        : '<b>바늘이 멈춰 있다</b> → 전류가 없다';
      // 손이 한 일 = 만들어진 전기 에너지 (에너지 보존). 막대 끝까지가 E_BAR
      if (ui.eHand) { const w = Math.min(100, st.eElec / E_BAR * 100) + '%'; ui.eHand.style.width = w; ui.eElec.style.width = w; }
      for (const m of ['magnet', 'coil', 'both']) {
        const li = ui.checks[m]; if (!li) continue;
        const need = m === 'both' ? 160 : 80;
        if (!st.results[m] && st.moved[m] > need && !st.drag && !st.demo) {
          st.results[m] = st.peak[m] > 0.15 ? '바늘이 움직였다' : '바늘이 그대로';
        }
        if (st.results[m]) { li.classList.add('done'); li.querySelector('.box').textContent = '✓'; li.querySelector('.res').textContent = st.results[m]; }
      }
    }

    // ---------- 조작 ----------
    function toLocal(e) {
      const r = canvas.getBoundingClientRect();
      const ox = (stage.offsetWidth - DW * scale) / 2, oy = (stage.offsetHeight - DH * scale) / 2;
      const px = (e.clientX - r.left) / r.width * stage.offsetWidth, py = (e.clientY - r.top) / r.height * stage.offsetHeight;
      return { x: (px - ox) / scale, y: (py - oy) / scale };
    }
    canvas.addEventListener('pointerdown', (e) => {
      stopDemo();
      canvas.setPointerCapture(e.pointerId);
      st.drag = { id: e.pointerId, y: toLocal(e).y };
      canvas.classList.add('dragging'); if (hint) hint.classList.add('gone');
      st.peak[st.mode] = 0;
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!st.drag || e.pointerId !== st.drag.id) return;
      const y = toLocal(e).y; moveBy(y - st.drag.y, st.mode); st.drag.y = y;
    });
    const end = (e) => { if (st.drag && e.pointerId === st.drag.id) { st.drag = null; canvas.classList.remove('dragging'); } };
    canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);

    ui.seg.forEach((b) => b.addEventListener('click', () => {
      stopDemo();
      st.mode = b.dataset.mode; st.peak[st.mode] = 0;
      ui.seg.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      draw();
    }));
    if (ui.flip) ui.flip.addEventListener('click', () => { st.polarity *= -1; st.prevPhi = null; st.q = null; draw(); });
    if (ui.demo) ui.demo.addEventListener('click', () => (st.demo ? stopDemo() : startDemo()));
    if (ui.sw) ui.sw.addEventListener('click', () => {
      st.open = !st.open; ui.sw.setAttribute('aria-pressed', String(st.open));
      ui.sw.querySelector('span').textContent = st.open ? '회로 연결하기' : '회로 끊기';
    });
    if (ui.ereset) ui.ereset.addEventListener('click', () => { st.eElec = 0; updateUI(); });

    function startDemo() {
      if (!window.gsap) return;
      const m = st.mode, proxy = { y: m === 'coil' ? st.coilY : st.magY }, prev = { y: proxy.y };
      const far = m === 'coil' ? 480 : 290, near = m === 'coil' ? 300 : (m === 'both' ? 290 : st.coilY + CL - 60);
      if (m === 'both') { proxy.y = 0; prev.y = 0; }
      const a = m === 'both' ? 0 : far, b = m === 'both' ? 150 : near;
      st.peak[m] = 0;
      const tl = gsap.timeline({ repeat: -1, onUpdate() { moveBy(proxy.y - prev.y, m); prev.y = proxy.y; } });
      tl.to(proxy, { y: a, duration: 0.5, ease: 'sine.inOut' })
        .to(proxy, { y: b, duration: 0.9, ease: 'sine.inOut' }).to({}, { duration: 0.7 })
        .to(proxy, { y: a, duration: 0.9, ease: 'sine.inOut' }).to({}, { duration: 0.8 });
      st.demo = tl;
      if (ui.demo) { ui.demo.setAttribute('aria-pressed', 'true'); ui.demo.querySelector('span').textContent = '시연 멈추기'; }
      if (hint) hint.classList.add('gone');
    }
    function stopDemo() {
      if (!st.demo) return;
      st.demo.kill(); st.demo = null;
      if (ui.demo) { ui.demo.setAttribute('aria-pressed', 'false'); ui.demo.querySelector('span').textContent = '자동 시연'; }
    }

    // 정해진 움직임을 재생한다(다섯 경우·방향·세기 장에서). 끝나면 풀리는 약속을 돌려준다.
    function tween(to, duration, ease) {
      stopDemo();
      if (hint) hint.classList.add('gone');
      return new Promise((res) => {
        if (!window.gsap) { Object.assign(st, to); res(); return; }
        gsap.killTweensOf(st);
        gsap.to(st, Object.assign({}, to, { duration, ease: ease || 'sine.inOut', onComplete: res }));
      });
    }
    function set(p) {
      if ('turns' in p) st.turns = p.turns;
      if ('mag' in p) st.mag = p.mag;
      if ('polarity' in p) st.polarity = p.polarity;
      if ('magY' in p) st.magY = p.magY;
      if ('coilY' in p) st.coilY = p.coilY;
      if ('mode' in p) { st.mode = p.mode; ui.seg.forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.mode === p.mode))); }
      st.phi = phiDown(); st.prevPhi = st.phi; st.q = null; st.cross = crossings(); st.hold = null;
      draw();
    }

    // ---------- 반복 ----------
    function frame(t) {
      raf = 0;
      if (!st.active) return;
      const dt = clamp((t - last) / 1000 || 1 / 60, 1 / 240, 0.05); last = t;
      step(dt); draw();
      if (o.onFrame) o.onFrame(st);
      uiTick += dt;
      if (uiTick > 0.1) { uiTick = 0; updateUI(); drawCharts(); }
      raf = requestAnimationFrame(frame);
    }
    function setActive(on) {
      st.active = on;
      if (on && !raf) { last = performance.now(); fit(); raf = requestAnimationFrame(frame); }
      if (!on) { stopDemo(); if (raf) cancelAnimationFrame(raf); raf = 0; }
    }
    document.addEventListener('visibilitychange', () => { if (document.hidden) setActive(false); else if (root.classList.contains('present')) setActive(true); });

    st.phi = phiDown(); st.prevPhi = st.phi; st.cross = crossings();
    fit(); updateUI();
    return { setActive, fit, startDemo, stopDemo, tween, set, state: st, limits: { coilBottom: () => st.coilY + CL } };
  }

  // 자석(N극 아래)을 from에서 to까지 duration초 동안(sine.inOut) 넣을 때 유도 전류의 최댓값.
  // 화면 밖에서 같은 식으로 계산해 «세기» 장의 막대 눈금을 맞추는 데 쓴다.
  function simulatePeak({ from, to, duration, coilY = 430, turns = 10, mag = 1 }) {
    const phi = (magY) => {
      const yN = magY - INSET, yS = magY - ML + INSET;
      let sum = 0;
      for (let i = 0; i < TURNS_CALC; i++) sum += fluxUp(-(coilY + 10 + (CL - 20) * i / (TURNS_CALC - 1)), -yN, -yS, R);
      return -sum / TURNS_CALC * mag;
    };
    const dt = 1 / 60;
    let I = 0, prev = phi(from), peak = 0;
    for (let t = dt; t <= duration + 0.3; t += dt) {
      const u = Math.min(1, t / duration), p = phi(from + (to - from) * (1 - Math.cos(Math.PI * u)) / 2);
      I += ((p - prev) / dt - I) * (1 - Math.exp(-dt / 0.05)); prev = p;
      peak = Math.max(peak, Math.abs(I * turns / 10));
    }
    return peak;
  }

  window.InductionLab = { mount, simulatePeak };
})();
