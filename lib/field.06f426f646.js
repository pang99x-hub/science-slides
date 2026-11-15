/* 자기장 복습: 나침반 격자 사이의 막대자석·코일.
   나침반 바늘의 N극(빨강)은 그곳의 자기장 방향을 가리킨다.
   막대자석과 코일 바깥은 실험실과 같은 «두 극 모형»으로 계산하고,
   코일 속은 코일 축을 따라 N극 쪽을 향하는 균일한 자기장으로 둔다. */
(function () {
  'use strict';
  const DW = 1056, DH = 780;
  const ML = 280, MH = 66, INSET = 18;                 // 가로로 놓인 막대자석
  const COIL = { cx: 528, cy: 330, len: 380, r: 92, rx: 18 };
  const BAT_Y = 640;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function H(x, y, poles) {
    let hx = 0, hy = 0;
    for (const p of poles) {
      const dx = x - p.x, dy = y - p.y, r = Math.max(Math.hypot(dx, dy), 4);
      hx += p.q * dx / r ** 3; hy += p.q * dy / r ** 3;
    }
    return [hx, hy];
  }

  // N극(왼쪽, 원점 기준 -a)에서 S극(+a)으로 가는 자기력선. 같은 선속마다 한 줄, 위아래 대칭.
  // 화면 밖으로 빠져나간 선은 S극으로 되돌아 들어오는 쪽(좌우를 뒤집고 방향을 거꾸로 한 선)도 넣어,
  // N극에서 나가는 줄 수와 S극으로 들어가는 줄 수가 같게 한다. fromN = N극에서 나가는 줄 수.
  function traceLines(a, perSide, skip) {
    const poles = [{ x: -a, y: 0, q: 1 }, { x: a, y: 0, q: -1 }];
    const lines = [];
    for (let i = 1; i <= perSide; i++) {
      const th = Math.acos(1 - 2 * (i - 0.5) / perSide);      // -x축에서 잰 각
      for (const side of [-1, 1]) {
        let x = -a - 10 * Math.cos(th), y = side * 10 * Math.sin(th);
        const pts = [x, y];
        let ok = true;
        for (let k = 0; k < 1600; k++) {
          let [hx, hy] = H(x, y, poles); let n = Math.hypot(hx, hy); if (n < 1e-12) break;
          const mx = x + 2 * hx / n, my = y + 2 * hy / n;
          [hx, hy] = H(mx, my, poles); n = Math.hypot(hx, hy);
          x += 4 * hx / n; y += 4 * hy / n;
          if (skip && skip(x, y)) { ok = false; break; }
          pts.push(x, y);
          if (Math.hypot(x - a, y) < 10 || Math.abs(x) > 1700 || Math.abs(y) > 1300) break;
        }
        if (!ok) continue;
        const line = Float32Array.from(pts);
        lines.push(line);
        if (Math.hypot(x - a, y) >= 10) {
          const back = new Float32Array(pts.length);
          for (let j = 0; j < pts.length; j += 2) { const k = pts.length - 2 - j; back[j] = -pts[k]; back[j + 1] = pts[k + 1]; }
          line.esc = true; back.back = true; lines.push(back);
        }
      }
    }
    lines.fromN = lines.filter((l) => !l.back).length;
    return lines;
  }

  function mount(root) {
    const stage = root.querySelector('.stage');
    const canvas = stage.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    const hint = stage.querySelector('.hint');
    const q = (s) => root.querySelector(s);
    const tabBtns = [...root.querySelectorAll('.seg button[data-tab]')];
    const panes = [...root.querySelectorAll('.ftab')];
    const css = getComputedStyle(document.documentElement);
    const C = {};
    for (const k of ['ink', 'ink-2', 'ink-3', 'paper-2', 'rule', 'grid', 'n', 's', 'field', 'current', 'copper-f', 'copper-b'])
      C[k] = css.getPropertyValue('--' + k).trim();
    const FONT = css.getPropertyValue('--f-body').trim();

    const st = { tab: 'magnet', mx: 528, my: 400, pol: 1, lines: true, dir: 1, cur: 1, dens: 1, drag: null, active: false, flow: 0 };
    const magnetLines = traceLines(ML / 2 - INSET, 9);
    const coilCache = {};
    const comps = [];
    for (let y = 64; y <= DH - 50; y += 88) for (let x = 60; x <= DW - 40; x += 88) comps.push({ x, y, a: -Math.PI / 2, init: false });

    let scale = 1, dpr = 1, raf = 0, last = 0;

    // ---------- 자기장 ----------
    const strength = () => st.cur * st.dens;                       // 1, 2, 4
    const inCoil = (x, y) => Math.abs(x - COIL.cx) < COIL.len / 2 && Math.abs(y - COIL.cy) < COIL.r;
    function magnetPoles() {
      const a = ML / 2 - INSET;
      return [{ x: st.mx - st.pol * a, y: st.my, q: 1 }, { x: st.mx + st.pol * a, y: st.my, q: -1 }];
    }
    function coilPoles() {
      const a = COIL.len / 2 - 8;
      return [{ x: COIL.cx + st.dir * a, y: COIL.cy, q: 1 }, { x: COIL.cx - st.dir * a, y: COIL.cy, q: -1 }];
    }
    function fieldDir(x, y) {
      if (st.tab === 'coil') {
        if (inCoil(x, y)) return [st.dir, 0];
        return H(x, y, coilPoles());
      }
      return H(x, y, magnetPoles());
    }
    function coilLines() {
      const per = { 1: 3, 2: 5, 4: 7 }[strength()];
      if (!coilCache[per]) {
        const a = COIL.len / 2 - 8;
        // N극(이 계산에서는 -a 쪽)에서 나가 코일 속으로 되돌아 들어가는 선은 버린다. 코일 속은 따로 곧은 선으로 그린다.
        coilCache[per] = traceLines(a, per, (x, y) => Math.abs(x) < COIL.len / 2 - 14 && Math.abs(y) < COIL.r - 6);
      }
      return { outer: coilCache[per], inner: coilCache[per].fromN };   // 코일 속 줄 수 = N극에서 나가는 줄 수 = S극으로 들어가는 줄 수
    }

    // ---------- 크기 ----------
    function fit() {
      const w = stage.offsetWidth, h = stage.offsetHeight;
      scale = Math.min(w / DW, h / DH) || 1;
      const rs = (window.Reveal && Reveal.getScale) ? Reveal.getScale() : 1;
      dpr = clamp((window.devicePixelRatio || 1) * rs, 1, 3);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      draw();
    }

    // ---------- 그리기 ----------
    function draw() {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.translate((stage.offsetWidth - DW * scale) / 2, (stage.offsetHeight - DH * scale) / 2);
      ctx.scale(scale, scale);
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.strokeStyle = C.grid; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= DW; x += 40) { ctx.moveTo(x + .5, 0); ctx.lineTo(x + .5, DH); }
      for (let y = 0; y <= DH; y += 40) { ctx.moveTo(0, y + .5); ctx.lineTo(DW, y + .5); }
      ctx.stroke();
      if (st.tab === 'magnet') drawMagnetScene(); else drawCoilScene();
    }

    function strokeLines(lines, tx) {
      ctx.strokeStyle = C.field; ctx.lineWidth = 2.4; ctx.globalAlpha = 0.6;
      for (const arr of lines) {
        ctx.beginPath();
        for (let j = 0; j < arr.length; j += 4) { const [x, y] = tx(arr[j], arr[j + 1]); if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y); }
        ctx.stroke();
      }
      ctx.globalAlpha = 0.8; ctx.fillStyle = C.field;
      for (const arr of lines) {
        // 화면 밖으로 나가는 선은 극에서 160쯤 떨어진 곳에 화살표를 둔다(가운데는 화면 밖)
        const j = arr.back ? arr.length - 84 : arr.esc ? 80 : Math.floor(arr.length / 4) * 2;
        if (j < 0 || j + 4 >= arr.length) continue;
        const [x0, y0] = tx(arr[j], arr[j + 1]), [x1, y1] = tx(arr[j + 4], arr[j + 5]);
        if (x0 < 0 || x0 > DW || y0 < 0 || y0 > DH) continue;
        arrow(x0, y0, Math.atan2(y1 - y0, x1 - x0), 8);
      }
      ctx.globalAlpha = 1;
    }
    function arrow(x, y, ang, s) {
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang);
      ctx.beginPath(); ctx.moveTo(s, 0); ctx.lineTo(-s * 0.8, -s * 0.7); ctx.lineTo(-s * 0.8, s * 0.7); ctx.closePath(); ctx.fill();
      ctx.restore();
    }

    function drawCompasses(hide) {
      for (const c of comps) {
        if (hide(c.x, c.y)) continue;
        ctx.fillStyle = C['paper-2']; ctx.strokeStyle = C.rule; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(c.x, c.y, 21, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        const dx = Math.cos(c.a), dy = Math.sin(c.a), L = 17, w = 5;
        ctx.fillStyle = C.n;
        ctx.beginPath(); ctx.moveTo(c.x + dx * L, c.y + dy * L); ctx.lineTo(c.x - dy * w, c.y + dx * w); ctx.lineTo(c.x + dy * w, c.y - dx * w); ctx.closePath(); ctx.fill();
        ctx.fillStyle = C['ink-3'];
        ctx.beginPath(); ctx.moveTo(c.x - dx * L, c.y - dy * L); ctx.lineTo(c.x - dy * w, c.y + dx * w); ctx.lineTo(c.x + dy * w, c.y - dx * w); ctx.closePath(); ctx.fill();
        ctx.fillStyle = C.ink; ctx.beginPath(); ctx.arc(c.x, c.y, 3, 0, Math.PI * 2); ctx.fill();
      }
    }

    function drawMagnetScene() {
      const tx = (x, y) => [st.mx + st.pol * x, st.my + y];
      if (st.lines) strokeLines(magnetLines, tx);
      const under = (x, y) => Math.abs(x - st.mx) < ML / 2 + 24 && Math.abs(y - st.my) < MH / 2 + 24;
      drawCompasses(under);
      const x0 = st.mx - ML / 2, y0 = st.my - MH / 2;
      const left = st.pol === 1 ? ['N', C.n] : ['S', C.s], right = st.pol === 1 ? ['S', C.s] : ['N', C.n];
      ctx.fillStyle = left[1]; ctx.fillRect(x0, y0, ML / 2, MH);
      ctx.fillStyle = right[1]; ctx.fillRect(x0 + ML / 2, y0, ML / 2, MH);
      ctx.strokeStyle = C.ink; ctx.lineWidth = 3; ctx.strokeRect(x0, y0, ML, MH);
      ctx.beginPath(); ctx.moveTo(st.mx, y0); ctx.lineTo(st.mx, y0 + MH); ctx.stroke();
      ctx.fillStyle = C['paper-2']; ctx.font = `700 38px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText(left[0], st.mx - ML / 4, st.my + 1); ctx.fillText(right[0], st.mx + ML / 4, st.my + 1);
    }

    // 코일: 도선 한 가닥이 왼쪽 끝 아래(a)에서 감겨 오른쪽 끝 아래(b)로 나온다. φ가 늘수록 앞줄(오른쪽 반쪽)을 위에서 아래로 지난다.
    // dir 1이면 전류가 a→b(φ가 느는 쪽)로 흘러 앞줄에서 아래로 → 오른손 엄지(N극)는 오른쪽. dir -1이면 같은 코일에 거꾸로
    function helix() {
      const n = st.dens === 1 ? 9 : 17, a = COIL.cx - COIL.len / 2 + 12, b = COIL.cx + COIL.len / 2 - 12, K = 32, N = n * K;
      const pts = [];
      for (let k = 0; k <= N; k++) { const ph = Math.PI + 2 * Math.PI * k / K; pts.push([a + (b - a) * k / N + COIL.rx * Math.sin(ph), COIL.cy - COIL.r * Math.cos(ph), ph]); }
      return { pts, n, a, b, N, K };
    }
    function circuitPath() {
      // 전지 +극에서 나가 왼쪽 끝으로 들어가고(dir 1), 오른쪽 끝에서 나와 전지 -극으로
      const L = COIL.cx - COIL.len / 2 + 12, Rr = COIL.cx + COIL.len / 2 - 12, yb = COIL.cy + COIL.r;
      const plus = [COIL.cx - 16, BAT_Y], minus = [COIL.cx + 16, BAT_Y];
      const path = [[plus[0] - 4, BAT_Y], [L, BAT_Y], [L, yb], null, [Rr, yb], [Rr, BAT_Y], [minus[0] + 4, BAT_Y]];
      return st.dir === 1 ? path : path.map((p) => (p ? [2 * COIL.cx - p[0], p[1]] : p));
    }
    function drawCoilScene() {
      const H = helix(), { cy, r } = COIL;
      const front = (ph) => Math.sin(ph) > 0;
      const strand = (isFront) => {
        ctx.beginPath(); let pen = false;
        for (let i = 1; i < H.pts.length; i++) {
          if (front((H.pts[i - 1][2] + H.pts[i][2]) / 2) === isFront) { if (!pen) { ctx.moveTo(H.pts[i - 1][0], H.pts[i - 1][1]); pen = true; } ctx.lineTo(H.pts[i][0], H.pts[i][1]); }
          else pen = false;
        }
        ctx.stroke();
      };
      // 회로와 전지
      const P = circuitPath();
      ctx.strokeStyle = C.ink; ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(P[0][0], P[0][1]); ctx.lineTo(P[1][0], P[1][1]); ctx.lineTo(P[2][0], P[2][1]);
      ctx.moveTo(P[4][0], P[4][1]); ctx.lineTo(P[5][0], P[5][1]); ctx.lineTo(P[6][0], P[6][1]); ctx.stroke();
      const longX = st.dir === 1 ? COIL.cx - 12 : COIL.cx + 12, shortX = st.dir === 1 ? COIL.cx + 12 : COIL.cx - 12;
      ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(longX, BAT_Y - 34); ctx.lineTo(longX, BAT_Y + 34); ctx.stroke();
      ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(shortX, BAT_Y - 18); ctx.lineTo(shortX, BAT_Y + 18); ctx.stroke();
      ctx.fillStyle = C.ink; ctx.font = `700 28px ${FONT}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('+', longX + (st.dir === 1 ? -26 : 26), BAT_Y - 44); ctx.fillText('−', shortX + (st.dir === 1 ? 26 : -26), BAT_Y - 44);
      ctx.font = `600 24px ${FONT}`; ctx.fillText('전지', COIL.cx, BAT_Y + 62);
      // 전류 점: 전지 +극 → 전선 → 코일 도선(감은 대로) → 전선 → 전지 -극. 뒷줄의 점은 흐리게
      const hp = st.dir === 1 ? H.pts : H.pts.slice().reverse();
      const loop = [[P[0], 'wire'], [P[1], 'wire'], [P[2], 'wire'], ...hp.map((p) => [p, 'coil']), [P[4], 'wire'], [P[5], 'wire'], [P[6], 'wire']];
      const dots = [];
      { let total = 0; const segs = [];
        for (let i = 0; i < loop.length - 1; i++) { const p0 = loop[i][0], p1 = loop[i + 1][0], L = Math.hypot(p1[0] - p0[0], p1[1] - p0[1]); if (!L) continue;
          const layer = loop[i][1] === 'coil' && loop[i + 1][1] === 'coil' ? (front((p0[2] + p1[2]) / 2) ? 'front' : 'back') : 'wire';
          segs.push({ p0, p1, L, start: total, layer }); total += L; }
        let j = 0;
        for (let sd = (st.flow * 40) % 34; sd < total; sd += 34) {
          while (j < segs.length - 1 && sd >= segs[j].start + segs[j].L) j++;
          const g = segs[j], t = (sd - g.start) / g.L;
          dots.push({ x: g.p0[0] + (g.p1[0] - g.p0[0]) * t, y: g.p0[1] + (g.p1[1] - g.p0[1]) * t, layer: g.layer });
        } }
      const dotsOf = (layer, alpha, rad) => { ctx.fillStyle = C.current; ctx.globalAlpha = alpha; for (const d of dots) if (d.layer === layer) { ctx.beginPath(); ctx.arc(d.x, d.y, rad, 0, Math.PI * 2); ctx.fill(); } ctx.globalAlpha = 1; };
      // 뒷줄
      ctx.strokeStyle = C['copper-b']; ctx.lineWidth = 4;
      strand(false);
      dotsOf('back', 0.4, 4);
      // 자기력선
      if (st.lines) {
        const { outer, inner } = coilLines();
        strokeLines(outer, (x, y) => [COIL.cx - st.dir * x, cy + y]);
        ctx.strokeStyle = C.field; ctx.lineWidth = 2.6; ctx.globalAlpha = 0.85; ctx.fillStyle = C.field;
        const a = COIL.len / 2 - 8;
        for (let i = 0; i < inner; i++) {
          const y = cy + (i - (inner - 1) / 2) * (2 * (r - 18) / Math.max(inner - 1, 1));
          ctx.beginPath(); ctx.moveTo(COIL.cx - st.dir * a, y); ctx.lineTo(COIL.cx + st.dir * a, y); ctx.stroke();
          arrow(COIL.cx + st.dir * 40, y, st.dir === 1 ? 0 : Math.PI, 8);
        }
        ctx.globalAlpha = 1;
      }
      // 전지 자리, 코일 벽에 걸친 자리(감은 선에 가려 방향을 읽기 어렵다), N·S 글자 자리의 나침반은 뺀다
      drawCompasses((x, y) => (Math.abs(y - BAT_Y) < 50 && Math.abs(x - COIL.cx) < 80)
        || (Math.abs(x - COIL.cx) < COIL.len / 2 + 24 && Math.abs(Math.abs(y - COIL.cy) - COIL.r) < 26)
        || (Math.abs(y - COIL.cy) < 30 && Math.abs(Math.abs(x - COIL.cx) - (COIL.len / 2 + 46)) < 44));
      // 앞줄과 전류 점, 앞줄의 전류 방향 화살표(dir 1이면 아래로)
      ctx.strokeStyle = C['copper-f']; ctx.lineWidth = 6;
      strand(true);
      dotsOf('front', 1, 4.5); dotsOf('wire', 1, 5);
      ctx.fillStyle = C.current; ctx.strokeStyle = C['paper-2']; ctx.lineWidth = 2.5;
      for (let m = 1; m <= H.n; m += H.n > 9 ? 3 : 2) {
        const k = H.K * (m - 0.25), x = H.a + (H.b - H.a) * k / H.N + COIL.rx;
        ctx.save(); ctx.translate(x, cy); ctx.rotate(st.dir === 1 ? Math.PI / 2 : -Math.PI / 2);
        ctx.beginPath(); ctx.moveTo(14, 0); ctx.lineTo(-9, -10); ctx.lineTo(-4, 0); ctx.lineTo(-9, 10); ctx.closePath(); ctx.stroke(); ctx.fill(); ctx.restore();
      }
      // 코일 양 끝의 극
      ctx.font = `800 46px ${FONT}`;
      ctx.fillStyle = C.n; ctx.fillText('N', COIL.cx + st.dir * (COIL.len / 2 + 46), cy);
      ctx.fillStyle = C.s; ctx.fillText('S', COIL.cx - st.dir * (COIL.len / 2 + 46), cy);
    }

    // ---------- 반복 ----------
    function step(dt) {
      const k = reduce ? 1 : 1 - Math.exp(-dt / 0.09);
      for (const c of comps) {
        const [hx, hy] = fieldDir(c.x, c.y);
        const t = Math.atan2(hy, hx);
        if (!c.init) { c.a = t; c.init = true; continue; }
        let d = t - c.a; d = Math.atan2(Math.sin(d), Math.cos(d));
        c.a += d * k;
      }
      st.flow += dt * 0.5 * st.cur;
    }
    function frame(t) {
      raf = 0; if (!st.active) return;
      const dt = clamp((t - last) / 1000 || 1 / 60, 1 / 240, 0.05); last = t;
      step(dt); draw();
      raf = requestAnimationFrame(frame);
    }
    function setActive(on) {
      st.active = on;
      if (on && !raf) { last = performance.now(); fit(); raf = requestAnimationFrame(frame); }
      if (!on && raf) { cancelAnimationFrame(raf); raf = 0; }
    }

    // ---------- 조작 ----------
    function toLocal(e) {
      const r = canvas.getBoundingClientRect();
      const ox = (stage.offsetWidth - DW * scale) / 2, oy = (stage.offsetHeight - DH * scale) / 2;
      const px = (e.clientX - r.left) / r.width * stage.offsetWidth, py = (e.clientY - r.top) / r.height * stage.offsetHeight;
      return { x: (px - ox) / scale, y: (py - oy) / scale };
    }
    canvas.addEventListener('pointerdown', (e) => {
      if (st.tab !== 'magnet') return;
      canvas.setPointerCapture(e.pointerId);
      const p = toLocal(e);
      st.drag = { id: e.pointerId, x: p.x, y: p.y };
      canvas.classList.add('dragging'); hint.classList.add('gone');
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!st.drag || e.pointerId !== st.drag.id) return;
      const p = toLocal(e);
      st.mx = clamp(st.mx + p.x - st.drag.x, ML / 2 + 10, DW - ML / 2 - 10);
      st.my = clamp(st.my + p.y - st.drag.y, MH / 2 + 10, DH - MH / 2 - 10);
      st.drag.x = p.x; st.drag.y = p.y;
    });
    const end = (e) => { if (st.drag && e.pointerId === st.drag.id) { st.drag = null; canvas.classList.remove('dragging'); } };
    canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);

    const press = (btns, pick) => btns.forEach((b) => b.setAttribute('aria-pressed', String(b === pick)));
    tabBtns.forEach((b) => b.addEventListener('click', () => {
      st.tab = b.dataset.tab; press(tabBtns, b);
      panes.forEach((p) => { p.hidden = p.dataset.tab !== st.tab; });
      hint.classList.toggle('gone', st.tab !== 'magnet');
      canvas.style.cursor = st.tab === 'magnet' ? '' : 'default';
      draw();
    }));
    q('#field-flip').addEventListener('click', () => { st.pol *= -1; });
    q('#field-lines').addEventListener('click', (e) => { st.lines = !st.lines; e.currentTarget.setAttribute('aria-pressed', String(st.lines)); });
    q('#coil-dir').addEventListener('click', () => { st.dir *= -1; setHand(); });
    const iBtns = [...root.querySelectorAll('[data-i]')], nBtns = [...root.querySelectorAll('[data-n]')];
    iBtns.forEach((b) => b.addEventListener('click', () => { st.cur = Number(b.dataset.i); press(iBtns, b); }));
    nBtns.forEach((b) => b.addEventListener('click', () => { st.dens = Number(b.dataset.n); press(nBtns, b); }));

    // 오른손 그림: 앞쪽(오른쪽) 반원에서 전류가 내려가면 엄지(N극)는 오른쪽
    function setHand() {
      const right = st.dir === 1;
      q('.hand-tip').setAttribute('d', right ? 'M146 76 l-9 -16 l18 0 z' : 'M146 64 l-9 16 l18 0 z');
      q('.hand-thumb').setAttribute('d', right ? 'M120 82 H222' : 'M120 82 H18');
      q('.hand-thumb-tip').setAttribute('d', right ? 'M230 82 l-16 -10 v20 z' : 'M10 82 l16 -10 v20 z');
      q('.hand-t2').setAttribute('x', right ? '190' : '50');
    }
    setHand();
    fit();
    return { setActive, fit, state: st };
  }

  window.FieldReview = { mount };
})();
