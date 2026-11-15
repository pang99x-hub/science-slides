/* 2-1-1·2-1-2 늘린 장 공용(2026-11-13 차시 늘리기). XK(전역 XA) = 그림 도구(명암 공·빛 번짐·손가락 안내…), Xpa = 늘린 장의 손 조작 틀.
   예측 단추(.xp-opts)를 먼저 고르고 해 본 뒤, 종류가 api.reveal()을 부르면 정답 단추에 테가 생기고 맞았는지 알려 준다.
   Xpa.mount(root, 종류) → { fit, setActive } · 오른쪽 칸 .u-steps가 있으면 단계·알게 된 것을 맞춘다.
   시험용: root._xp.st(상태) · root._xp.test(…)(종류마다 다름) */
(function () {
  'use strict';
  const TAU = Math.PI * 2, FONT = '"IBM Plex Sans KR", sans-serif';
  const lerp = (a, b, k) => a + (b - a) * k, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), ease = (k) => k * k * (3 - 2 * k);
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const XK = {
    TAU, lerp, clamp, ease, FONT,
    pow: (n) => '10' + (n < 0 ? '⁻' : '') + String(Math.abs(n)).split('').map((d) => SUP[+d]).join(''),
    rnd(seed) { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); },
    txt(c, t, x, y, col = '#1d2433', f = '700 20px', al = 'center') { c.fillStyle = col; c.font = `${f} ${FONT}`; c.textAlign = al; c.textBaseline = 'alphabetic'; c.fillText(t, x, y); },
    pill(c, x, y, t, bg = '#1d2433', fg = '#fff', f = '700 18px') {
      c.font = `${f} ${FONT}`; const w = c.measureText(t).width + 22;
      c.fillStyle = bg; c.beginPath(); c.roundRect(x - w / 2, y - 16, w, 32, 16); c.fill(); XK.txt(c, t, x, y + 6, fg, f); return w;
    },
    rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); },
    vgrad(c, x, y, w, h, stops) { const g = c.createLinearGradient(0, y, 0, y + h); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); c.fillStyle = g; c.fillRect(x, y, w, h); },
    hgrad(c, x0, x1, stops) { const g = c.createLinearGradient(x0, 0, x1, 0); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); return g; },
    ball(c, x, y, r, col, dark, hi = '#fff') {
      const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r); g.addColorStop(0, hi); g.addColorStop(0.3, col); g.addColorStop(1, dark);
      c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    },
    glow(c, x, y, r, inner, outer = 'rgba(0,0,0,0)') { if (r <= 0) return; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, inner); g.addColorStop(1, outer); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); },
    line(c, x1, y1, x2, y2, col, w = 2, dash) { c.strokeStyle = col; c.lineWidth = w; if (dash) c.setLineDash(dash); c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); if (dash) c.setLineDash([]); },
    arrow(c, x1, y1, x2, y2, col, w = 3, hd = 12) {
      const a = Math.atan2(y2 - y1, x2 - x1); XK.line(c, x1, y1, x2 - Math.cos(a) * hd * 0.6, y2 - Math.sin(a) * hd * 0.6, col, w);
      c.fillStyle = col; c.beginPath(); c.moveTo(x2, y2); c.lineTo(x2 - Math.cos(a - 0.45) * hd, y2 - Math.sin(a - 0.45) * hd); c.lineTo(x2 - Math.cos(a + 0.45) * hd, y2 - Math.sin(a + 0.45) * hd); c.closePath(); c.fill();
    },
    shadow(c, x, y, rx, ry, a = 0.25) { c.fillStyle = `rgba(10,14,24,${a})`; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fill(); },
    stars(c, W, H, t, n = 90, seed = 7, a = 1) {
      const R = XK.rnd(seed);
      for (let i = 0; i < n; i++) { const x = R() * W, y = R() * H, s = R(), tw = 0.55 + 0.45 * Math.sin(t * (1 + s * 2) + i); c.fillStyle = `rgba(230,236,255,${(0.25 + 0.6 * s) * tw * a})`; c.beginPath(); c.arc(x, y, 0.6 + s * 1.4, 0, TAU); c.fill(); }
    },
    grid(c, x, y, w, h, step, col) { c.strokeStyle = col; c.lineWidth = 1; c.beginPath(); for (let u = x; u <= x + w + 0.5; u += step) { c.moveTo(u, y); c.lineTo(u, y + h); } for (let v = y; v <= y + h + 0.5; v += step) { c.moveTo(x, v); c.lineTo(x + w, v); } c.stroke(); },
    // 빛의 파장(nm) → 화면 색 [r, g, b] (380~780 nm, 끝은 어둡게)
    wl(n) {
      let r = 0, g = 0, b = 0;
      if (n < 440) { r = (440 - n) / 60; b = 1; } else if (n < 490) { g = (n - 440) / 50; b = 1; } else if (n < 510) { g = 1; b = (510 - n) / 20; }
      else if (n < 580) { r = (n - 510) / 70; g = 1; } else if (n < 645) { r = 1; g = (645 - n) / 65; } else r = 1;
      const f = n < 420 ? 0.3 + 0.7 * (n - 380) / 40 : n > 700 ? 0.3 + 0.7 * (780 - n) / 80 : 1;
      return [r, g, b].map((x) => Math.round(255 * Math.pow(Math.max(0, x) * Math.max(0.15, f), 0.8)));
    },
    rgba: (a, al = 1) => `rgba(${a[0]},${a[1]},${a[2]},${al})`,
    // 손가락(끝이 x, y): 처음 화면에서 끄는 방향을 알린다
    hand(c, x, y, s = 1, a = 1) {
      c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s); c.rotate(-0.25);
      c.fillStyle = '#fff'; c.strokeStyle = '#1d2433'; c.lineWidth = 2.4; c.lineJoin = 'round';
      const part = (px, py, w, h, r) => { c.beginPath(); c.roundRect(px, py, w, h, r); c.fill(); c.stroke(); };
      part(-13, 22, 36, 34, 11); part(-23, 30, 13, 22, 6.5); part(3, 18, 11, 18, 5.5); part(12, 21, 11, 16, 5.5); part(-6, 0, 12, 36, 6);
      c.strokeStyle = 'rgba(29,36,51,.35)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-3, 6); c.lineTo(3, 6); c.stroke();
      c.restore();
    },
    // 끄는 안내: (x, y)에서 (dx, dy) 쪽으로 손가락이 미끄러지고 화살표가 따라간다
    hint(c, x, y, t, dx = 1, dy = 0, label, dist = 90) {
      const k = (t * 0.7) % 1, m = ease(clamp((k - 0.15) / 0.6, 0, 1)), a = k < 0.1 ? k / 0.1 : k > 0.85 ? (1 - k) / 0.15 : 1;
      const L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L, ex = x + ux * dist, ey = y + uy * dist;
      c.save(); c.globalAlpha = 0.85 * a; XK.arrow(c, x, y, ex, ey, '#ffd84d', 5, 18); c.restore();
      if (k < 0.25) { c.strokeStyle = `rgba(255,216,77,${0.8 * (1 - k / 0.25)})`; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 10 + k * 90, 0, TAU); c.stroke(); }
      XK.hand(c, x + ux * dist * m, y + uy * dist * m, 1.1, a);
      if (label) XK.pill(c, x + ux * dist / 2, y + uy * dist / 2 - 40, label, 'rgba(29,36,51,.85)', '#ffd84d', '700 17px');
    },
    // 탭 안내: 손가락이 톡톡 누른다
    tap(c, x, y, t, label) {
      const k = (t * 1.1) % 1, press = k < 0.2 ? k / 0.2 : k < 0.4 ? 1 - (k - 0.2) / 0.2 : 0;
      if (k > 0.2 && k < 0.7) { c.strokeStyle = `rgba(255,216,77,${0.9 * (1 - (k - 0.2) / 0.5)})`; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 8 + (k - 0.2) * 80, 0, TAU); c.stroke(); }
      XK.hand(c, x + 4, y + 6 - press * 6, 1.05, 0.95);
      if (label) XK.pill(c, x, y - 34, label, 'rgba(29,36,51,.85)', '#ffd84d', '700 17px');
    },
  };
  window.XA = XK;
  const KINDS = {
    // ── 2-1-1 1차시 «불꽃놀이 색의 비밀»: 백금선 고리에 시료를 묻혀 불꽃에 넣고 분광기로 선을 찍는다(생활 속 예, 교과서 48~49쪽과 잇기) ──
    // 선의 위치(nm)·세기는 대략(이해를 돕기 위한 예). 불꽃놀이 빛 = 스트론튬 + 구리
    flame: {
      EL: [
        { n: '리튬', f: '염화 리튬', col: [232, 32, 58], L: [[670.8, 1], [610.4, 0.3], [460.3, 0.18]] },
        { n: '스트론튬', f: '염화 스트론튬', col: [255, 52, 26], L: [[606, 0.65], [640.8, 0.55], [662, 0.85], [682, 0.7], [460.7, 0.5]] },
        { n: '나트륨', f: '염화 나트륨', col: [255, 176, 32], L: [[589.0, 1], [589.6, 0.9]] },
        { n: '칼륨', f: '염화 칼륨', col: [197, 140, 255], L: [[766.5, 1], [769.9, 0.8], [404.4, 0.45]] },
        { n: '구리', f: '염화 구리(Ⅱ)', col: [47, 214, 160], L: [[510.5, 0.7], [515.3, 0.8], [521.8, 0.95], [465, 0.3]] },
      ],
      MYST: [1, 4],
      init(st, api) {
        st.tip = null; st.load = -1; st.burn = -1; st.burnT = 0; st.rec = []; st.pick = []; st.drag = false; st.trail = []; st.fw = [];
        api.say('예측을 고른 뒤, 고리를 끌어 <b>시료 접시</b>에 대었다가 <b>불꽃</b> 속에 넣어 보자.'); api.chip('고리를 끌어 시료를 묻히자');
      },
      geo(W, H) {
        const bx = W * 0.22, by = H * 0.79, fy = H * 0.44;
        return { bx, by, fy, x0: W * 0.52, x1: W - 22, dish: (i) => [W * 0.06 + i * W * 0.088, H * 0.925], rest: [W * 0.33, H * 0.6] };
      },
      draw(c, W, H, dt, st, api, X) {
        const g = this.geo(W, H), t = st.t; if (!st.tip) st.tip = g.rest.slice();
        // 실험실 벽(타일)과 실험대
        X.vgrad(c, 0, 0, W, H, ['#2b3346', '#232a3b', '#1c2231']);
        c.strokeStyle = 'rgba(255,255,255,.035)'; c.lineWidth = 1; for (let y = 0; y < H * 0.8; y += 44) { c.beginPath(); c.moveTo(0, y); c.lineTo(W * 0.5, y); c.stroke(); for (let x = (y / 44) % 2 ? 0 : 44; x < W * 0.5; x += 88) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 44); c.stroke(); } }
        const bench = H * 0.8; X.vgrad(c, 0, bench, W * 0.5, H - bench, ['#8a6440', '#6d4c2f', '#523822']);
        c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(0, bench, W * 0.5, 3);
        for (let i = 0; i < 6; i++) { c.strokeStyle = 'rgba(40,25,10,.25)'; c.beginPath(); c.moveTo(0, bench + 14 + i * 22); c.bezierCurveTo(W * 0.15, bench + 10 + i * 22, W * 0.3, bench + 20 + i * 22, W * 0.5, bench + 12 + i * 22); c.stroke(); }
        // 가스관
        c.strokeStyle = '#c4572d'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(-10, bench + 30); c.bezierCurveTo(W * 0.08, bench + 40, W * 0.12, g.by - 6, g.bx - 28, g.by - 14); c.stroke();
        // 분젠 버너: 받침·몸통·공기 구멍
        X.shadow(c, g.bx, g.by + 4, 62, 10, 0.4);
        c.fillStyle = X.hgrad(c, g.bx - 52, g.bx + 52, ['#5b6270', '#c9ced8', '#7d8492', '#3e4450']); X.rr(c, g.bx - 52, g.by - 16, 104, 18, 6); c.fill();
        c.fillStyle = X.hgrad(c, g.bx - 15, g.bx + 15, ['#6a717f', '#e3e7ee', '#9aa1ae', '#4a505c']); c.fillRect(g.bx - 15, g.fy + H * 0.13, 30, g.by - 16 - g.fy - H * 0.13);
        c.fillStyle = X.hgrad(c, g.bx - 19, g.bx + 19, ['#575e6b', '#d5dae2', '#848b98', '#3b404b']); X.rr(c, g.bx - 19, g.by - 64, 38, 22, 4); c.fill();
        c.fillStyle = '#1b1f27'; X.rr(c, g.bx - 7, g.by - 58, 14, 10, 3); c.fill();
        // 불꽃: 안쪽 파란 뿔 + 바깥 불꽃(시료 색)
        const top = g.fy + H * 0.13, on = st.burn >= 0, col = on ? this.EL[st.burn].col : [120, 170, 255], k = on ? Math.min(1, st.burnT * 2) : 0;
        c.save(); c.globalCompositeOperation = 'lighter';
        X.glow(c, g.bx, top - 70, 120 + 30 * k, X.rgba(col, 0.18 + 0.25 * k));
        for (let i = 0; i < 4; i++) {
          const h = (150 + 30 * Math.sin(t * 7 + i * 1.7)) * (1 - i * 0.12), w = 26 - i * 3, sw = Math.sin(t * 9 + i * 2) * 6;
          const gr = c.createLinearGradient(0, top, 0, top - h); gr.addColorStop(0, X.rgba(on ? col : [90, 140, 255], 0.55)); gr.addColorStop(0.6, X.rgba(on ? col : [140, 180, 255], 0.35 * (on ? 1 : 0.6))); gr.addColorStop(1, 'rgba(0,0,0,0)');
          c.fillStyle = gr; c.beginPath(); c.moveTo(g.bx - w, top); c.bezierCurveTo(g.bx - w * 1.2, top - h * 0.5, g.bx + sw - 6, top - h * 0.8, g.bx + sw, top - h); c.bezierCurveTo(g.bx + sw + 6, top - h * 0.8, g.bx + w * 1.2, top - h * 0.5, g.bx + w, top); c.closePath(); c.fill();
        }
        const ig = c.createLinearGradient(0, top, 0, top - 60); ig.addColorStop(0, 'rgba(70,120,255,.9)'); ig.addColorStop(1, 'rgba(120,200,255,.1)'); c.fillStyle = ig;
        c.beginPath(); c.moveTo(g.bx - 11, top); c.quadraticCurveTo(g.bx, top - 80, g.bx + 11, top); c.closePath(); c.fill();
        if (on) for (let i = 0; i < 14; i++) { const q = (t * 0.9 + i / 14) % 1; X.glow(c, g.bx + Math.sin(i * 7 + t * 3) * 22 * (1 - q), top - 30 - q * 150, 5 * (1 - q) + 1, X.rgba(col, 0.9 * (1 - q))); }
        c.restore();
        // 시료 접시(시계 접시 + 가루) 다섯
        this.EL.forEach((e, i) => {
          const [x, y] = g.dish(i), sel = st.load === i;
          X.shadow(c, x, y + 8, 38, 7, 0.35);
          c.fillStyle = 'rgba(220,235,255,.35)'; c.beginPath(); c.ellipse(x, y, 38, 12, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.5; c.stroke();
          const pw = i === 4 ? '#5fae9a' : '#eef0f2'; c.fillStyle = pw; c.beginPath(); c.ellipse(x, y - 2, 22, 6, 0, 0, Math.PI * 2); c.fill();
          for (let j = 0; j < 8; j++) { c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(x - 16 + j * 4.5, y - 4 + (j % 3), 2, 2); }
          if (sel) { c.strokeStyle = '#ffd84d'; c.lineWidth = 3; c.beginPath(); c.ellipse(x, y, 44, 16, 0, 0, Math.PI * 2); c.stroke(); }
          X.txt(c, e.n, x, y + 30, st.rec.includes(i) ? '#ffd84d' : '#fbfcf9', '700 16px');
        });
        const [tx, ty] = st.tip;
        // 고리가 불꽃 속에 있나
        const inF = Math.abs(tx - g.bx) < 46 && ty < top - 10 && ty > top - 170;
        if (inF && st.load >= 0) { if (st.burn !== st.load) { st.burn = st.load; st.burnT = 0; } st.burnT += dt; if (st.burnT > 0.8 && !st.rec.includes(st.burn)) this.record(st, api, st.burn); }
        else if (!inF) { st.burn = -1; st.burnT = 0; }
        this.scope(c, W, H, g, st, X);
        this.sky(c, W, H, g, st, X, dt);
        // 백금선 고리(손잡이 + 선 + 고리), 끝이 tip
        const hx = tx + 85, hy = ty + 68;
        X.line(c, tx, ty, hx, hy, '#d9dde4', 3);
        c.save(); c.translate(hx, hy); c.rotate(Math.atan2(96, 120)); { const hg = c.createLinearGradient(0, -9, 0, 9); hg.addColorStop(0, '#d79f63'); hg.addColorStop(0.45, '#b98048'); hg.addColorStop(1, '#6e4524'); c.fillStyle = hg; } X.rr(c, 0, -9, 92, 18, 8); c.fill(); c.fillStyle = '#c2c7cf'; c.fillRect(-4, -6, 14, 12); c.restore();
        c.strokeStyle = st.load >= 0 ? X.rgba(this.EL[st.load].col, 1) : '#e8ebf0'; c.lineWidth = 3; c.beginPath(); c.arc(tx, ty, 8, 0, Math.PI * 2); c.stroke();
        if (st.load >= 0) { c.fillStyle = st.load === 4 ? '#5fae9a' : '#f4f5f7'; c.beginPath(); c.arc(tx, ty + 3, 5, 0, Math.PI * 2); c.fill(); }
      },
      record(st, api, i) {
        st.rec.push(i); const e = this.EL[i];
        api.ok(1);
        const red = [0, 1].every((k) => st.rec.includes(k));
        if (red && !api.has(2)) { api.ok(2); api.reveal(); api.say('리튬과 스트론튬, 불꽃은 둘 다 <b>빨강</b>이지만 선의 <b>위치가 다르다</b> → 분광기로는 구별된다. 이제 아래 <b>불꽃놀이 빛</b>에 든 원소 둘을 눌러 골라 보자.'); api.chip('불꽃놀이 원소 둘을 고르자'); }
        else if (!red) api.say(`<b>${e.n}</b>(${e.f}) — 불꽃 색과 함께 분광기 표에 선이 찍혔다. ${st.rec.length < 2 ? '다른 시료도 넣어 보자.' : '빨간 불꽃을 내는 리튬과 스트론튬을 견주어 보자.'}`);
      },
      X0(g) { return g.x0 + 92; },
      nmX(g, n) { const a = this.X0(g); return a + (g.x1 - a) * (n - 390) / 400; },
      strip(c, g, y, h, lines, a, X, lab, live) {
        const a0 = this.X0(g); c.fillStyle = '#05070c'; c.fillRect(a0, y, g.x1 - a0, h);
        // 아주 옅은 바탕 무지개
        for (let n = 400; n <= 760; n += 4) { c.fillStyle = X.rgba(X.wl(n), 0.06); c.fillRect(this.nmX(g, n), y, (g.x1 - a0) / 100 + 1, h); }
        lines.forEach(([n, s]) => { const x = this.nmX(g, n), w = 3; c.save(); c.globalCompositeOperation = 'lighter'; X.glow(c, x, y + h / 2, h * 0.9 * s * a, X.rgba(X.wl(n), 0.35 * a)); c.restore(); c.fillStyle = X.rgba(X.wl(n), Math.min(1, (0.35 + 0.75 * s) * a)); c.fillRect(x - w / 2, y + 1, w, h - 2); });
        c.strokeStyle = live ? '#ffd84d' : 'rgba(255,255,255,.25)'; c.lineWidth = live ? 2.5 : 1; c.strokeRect(a0, y, g.x1 - a0, h);
        if (lab) X.txt(c, lab, a0 - 10, y + h / 2 + 6, live ? '#ffd84d' : '#fbfcf9', '700 16px', 'right');
      },
      scope(c, W, H, g, st, X) {
        // 분광기 표: 찍은 선이 원소마다 한 줄씩 쌓인다
        const y0 = 16, a0 = this.X0(g);
        X.vgrad(c, g.x0 - 14, 0, W - g.x0 + 14, H, ['#141a2a', '#10151f']);
        X.txt(c, '분광기로 본 선', g.x0, y0 + 22, '#fbfcf9', '800 19px', 'left'); X.txt(c, '파장(nm) · 선 위치는 대략', g.x1, y0 + 22, '#aab4cf', '600 14px', 'right');
        [400, 500, 600, 700].forEach((n) => { const x = this.nmX(g, n); X.line(c, x, y0 + 34, x, y0 + 40, '#aab4cf', 1.5); X.txt(c, String(n), x, y0 + 56, '#aab4cf', '600 13px'); });
        const rh = 34, gap = 12;
        this.EL.forEach((e, i) => {
          const y = y0 + 66 + i * (rh + gap), live = st.burn === i && st.burnT > 0.15, has = st.rec.includes(i) || live;
          if (has) this.strip(c, g, y, rh, e.L, live ? 0.7 + 0.3 * Math.sin(st.t * 20) ** 2 : 1, X, e.n, live);
          else { c.fillStyle = 'rgba(255,255,255,.05)'; c.fillRect(a0, y, g.x1 - a0, rh); c.strokeStyle = 'rgba(255,255,255,.12)'; c.setLineDash([5, 5]); c.strokeRect(a0, y, g.x1 - a0, rh); c.setLineDash([]); X.txt(c, e.n, a0 - 10, y + rh / 2 + 6, 'rgba(251,252,249,.45)', '600 16px', 'right'); }
        });
        if (st.rec.includes(0) && st.rec.includes(1)) { // 빨간 두 불꽃 견주기 표시
          const y = y0 + 66; X.line(c, this.nmX(g, 670.8), y + rh + 2, this.nmX(g, 670.8), y + rh + gap - 2, '#ffd84d', 2, [3, 3]);
          c.strokeStyle = '#ffd84d'; c.lineWidth = 2; c.beginPath(); c.moveTo(a0 - 76, y + 6); c.lineTo(a0 - 84, y + 6); c.lineTo(a0 - 84, y + rh * 2 + gap - 6); c.lineTo(a0 - 76, y + rh * 2 + gap - 6); c.stroke();
          XK.pill(c, (g.x0 + g.x1) / 2, y0 + 66 + 5 * (rh + gap) + 10, '리튬·스트론튬: 둘 다 빨간 불꽃인데 선 위치는 다르다', 'rgba(29,36,51,.92)', '#ffd84d', '700 15px');
        }
      },
      sky(c, W, H, g, st, X, dt) {
        const y0 = H * 0.49, y1 = H * 0.8, open = st.rec.includes(0) && st.rec.includes(1);
        const sg = c.createLinearGradient(0, y0, 0, y1); sg.addColorStop(0, '#060a1c'); sg.addColorStop(1, '#1b2347'); c.fillStyle = sg; X.rr(c, g.x0, y0, g.x1 - g.x0, y1 - y0, 12); c.fill();
        c.save(); X.rr(c, g.x0, y0, g.x1 - g.x0, y1 - y0, 12); c.clip();
        X.stars(c, W, H, st.t, 50, 3, 0.6);
        // 불꽃놀이: 스트론튬(빨강)·구리(청록) 불꽃이 번갈아 터진다
        if (open) {
          if (!st.fw.length || st.fw[st.fw.length - 1].t > 1.1) st.fw.push({ t: 0, x: g.x0 + 60 + Math.random() * (g.x1 - g.x0 - 120), y: y0 + 40 + Math.random() * 40, col: st.fw.length % 2 ? [47, 214, 160] : [255, 52, 26] });
          st.fw = st.fw.filter((f) => (f.t += dt) < 2.2);
          st.fw.forEach((f) => { const k = Math.min(1, f.t / 0.9), a = Math.max(0, 1 - (f.t - 0.6) / 1.6); for (let i = 0; i < 36; i++) { const an = i / 36 * Math.PI * 2, r = 70 * Math.sqrt(k), px = f.x + Math.cos(an) * r, py = f.y + Math.sin(an) * r + f.t * f.t * 14; c.strokeStyle = X.rgba(f.col, 0.6 * a); c.lineWidth = 2.5; c.beginPath(); c.moveTo(f.x + Math.cos(an) * r * 0.6, f.y + Math.sin(an) * r * 0.6 + f.t * f.t * 9); c.lineTo(px, py); c.stroke(); X.glow(c, px, py, 7, X.rgba(f.col, a)); X.glow(c, px, py, 2.5, `rgba(255,255,255,${a})`); } });
        }
        // 도시 실루엣
        c.fillStyle = '#0a0d18'; let x = g.x0; const R = X.rnd(12); while (x < g.x1) { const w = 26 + R() * 40, h = 20 + R() * 46; c.fillRect(x, y1 - h, w - 3, h); x += w; }
        c.restore();
        if (!open) { XK.pill(c, (g.x0 + g.x1) / 2, (y0 + y1) / 2, '리튬과 스트론튬을 모두 찍으면 열린다', 'rgba(29,36,51,.9)', '#fbfcf9', '700 16px'); return; }
        X.txt(c, '불꽃놀이 빛', g.x0 + 12, y0 + 24, '#fbfcf9', '800 17px', 'left');
        const ly = y1 + 10; this.strip(c, g, ly, 30, this.MYST.flatMap((i) => this.EL[i].L), 1, X, '불꽃놀이', false);
        // 고를 원소 칩
        const cw = (g.x1 - g.x0) / 5;
        this.EL.forEach((e, i) => { const cx = g.x0 + cw * (i + 0.5), cy = H - 26, on = st.pick.includes(i), done = api_done(st); c.fillStyle = on ? (done ? '#2f9e62' : '#ffd84d') : 'rgba(255,255,255,.1)'; X.rr(c, cx - cw / 2 + 5, cy - 18, cw - 10, 36, 18); c.fill(); X.txt(c, e.n, cx, cy + 6, on ? '#1d2433' : '#fbfcf9', '700 16px'); });
        function api_done(s) { return s.pick.length === 2 && [1, 4].every((k) => s.pick.includes(k)); }
      },
      hint(st) { if (!st.W) return null; const g = this.geo(st.W, st.H), d = g.dish(1); return { x: g.rest[0], y: g.rest[1], dx: d[0] - g.rest[0], dy: d[1] - 14 - g.rest[1], dist: Math.hypot(d[0] - g.rest[0], d[1] - 14 - g.rest[1]), label: '고리를 시료에' }; },
      down(p, st, api) {
        const g = this.geo(st.W, st.H);
        if (st.rec.includes(0) && st.rec.includes(1) && p.y > st.H - 46 && p.x > g.x0) { this.tapChip(st, api, Math.floor((p.x - g.x0) / ((g.x1 - g.x0) / 5))); return; }
        if (Math.hypot(p.x - st.tip[0], p.y - st.tip[1]) < 70 || (p.x > st.tip[0] && p.x < st.tip[0] + 180 && Math.abs((p.y - st.tip[1]) - (p.x - st.tip[0]) * 0.8) < 40)) { st.drag = true; st.off = [st.tip[0] - p.x, st.tip[1] - p.y]; }
      },
      move(p, st, api, held) {
        if (!held || !st.drag) return; const g = this.geo(st.W, st.H);
        st.tip = [XK.clamp(p.x + st.off[0], 20, g.x0 - 30), XK.clamp(p.y + st.off[1], 40, st.H - 40)];
        this.EL.forEach((e, i) => { const [x, y] = g.dish(i); if (Math.hypot(st.tip[0] - x, st.tip[1] - y) < 34 && st.load !== i) { st.load = i; api.say(`고리에 <b>${e.f}</b>을 묻혔다. 이제 <b>불꽃</b> 속에 넣어 보자.`); api.chip('불꽃 속에 넣자'); } });
      },
      up(p, st) { st.drag = false; },
      tapChip(st, api, i) {
        if (i < 0 || i > 4) return; const k = st.pick.indexOf(i); if (k >= 0) st.pick.splice(k, 1); else { st.pick.push(i); if (st.pick.length > 2) st.pick.shift(); }
        const ok = st.pick.length === 2 && this.MYST.every((m) => st.pick.includes(m));
        if (ok) { api.ok(3); api.say('정답! 불꽃놀이 빛의 선은 <b>스트론튬</b>(빨강)과 <b>구리</b>(청록)의 선을 합친 것과 같다. 별빛도 이렇게 선을 맞춰 보면 무엇으로 되어 있는지 안다.'); api.chip('원소를 찾았다', true); }
        else if (st.pick.length === 2) api.say('선 몇 개가 맞지 않는다. 위 표의 선과 <b>자리</b>를 하나씩 맞춰 보자.');
        else api.say('불꽃놀이 띠의 선과 같은 자리에 선이 있는 원소를 <b>둘</b> 고르자.');
      },
      key(k, st, api) {
        const i = '12345'.indexOf(k); if (i < 0) return false; const g = this.geo(st.W, st.H);
        if (api.has(2)) { this.tapChip(st, api, i); return true; }
        st.load = i; st.tip = [g.bx, g.fy + st.H * 0.13 - 90]; return true;
      },
      test(st, api, a, b) { const g = this.geo(st.W, st.H); if (a === 'pick') { this.tapChip(st, api, b); return; } st.load = a; st.tip = [g.bx, g.fy + st.H * 0.13 - 90]; st.burn = a; st.burnT = 0.5; if (b) { this.record(st, api, a); } },
    },
    // ── 2-1-1 2차시 «우주를 키워 식히기»: 상자(우주)를 끌어 키우면 온도가 내려가며 쿼크 → 양성자·중성자 → 헬륨 원자핵 → 원자 (교과서 51~53쪽) ──
    // 크기·온도 눈금은 모양만(이해를 돕기 위한 예). 양성자 14 + 중성자 2 → 수소 원자핵 12 + 헬륨 원자핵 1(질량비 3 : 1, 앞 장과 같음)
    cool: {
      init(st, api) {
        const R = XK.rnd(21);
        st.s = 1; st.trace = []; st.N = [];
        for (let i = 0; i < 16; i++) st.N.push({ p: i < 2 ? i : i >= 4 ? 1 : 0, x: R() * 1.8 - 0.9, y: R() * 1.8 - 0.9, vx: R() - 0.5, vy: R() - 0.5, ph: R() * 6 });
        // 0,1 = 양성자, 2,3 = 중성자 → 헬륨 원자핵. 나머지 12 = 양성자
        st.N[0].p = 1; st.N[1].p = 1; st.N[2].p = 0; st.N[3].p = 0;
        st.E = Array.from({ length: 14 }, (_, i) => ({ x: R() * 1.8 - 0.9, y: R() * 1.8 - 0.9, vx: R() - 0.5, vy: R() - 0.5, to: i < 12 ? i + 4 : -1 }));
        st.L = Array.from({ length: 18 }, () => ({ x: R() * 1.8 - 0.9, y: R() * 1.8 - 0.9, a: R() * 6.28, tr: [] }));
        api.say('예측을 고른 뒤, 상자 오른쪽을 끌어 <b>우주를 키워</b> 보자. 온도계와 아래 그래프를 함께 보자.'); api.chip('끌어서 우주 키우기');
      },
      geo(W, H, s) { const cx = W * 0.36, cy = H * 0.39, hs = XK.lerp(H * 0.16, H * 0.3, (s - 1) / 3); return { cx, cy, hs }; },
      k(s) { return { q: XK.clamp((s - 1.35) / 0.35, 0, 1), he: XK.clamp((s - 2.2) / 0.35, 0, 1), at: XK.clamp((s - 3.25) / 0.4, 0, 1) }; },
      T(s) { return 1 / s; },
      draw(c, W, H, dt, st, api, X) {
        const s = st.s, g = this.geo(W, H, s), K = this.k(s), T = this.T(s), sp = 0.12 + 0.9 * T, t = st.t;
        // 배경: 온도에 따라 하얗게 → 주황 → 어두운 우주
        X.vgrad(c, 0, 0, W, H, ['#0b0f1e', '#0e1326', '#121831']);
        X.stars(c, W, H, t, 70, 9, K.at);
        // 우주 상자: 온도 색으로 빛나는 공간
        const hot = Math.min(1, T * T * 1.1), col = [255, Math.round(XK.lerp(120, 245, hot)), Math.round(XK.lerp(40, 225, hot))];
        X.glow(c, g.cx, g.cy, g.hs * 1.9, X.rgba(col, 0.25 * (1 - K.at * 0.8)));
        c.save(); X.rr(c, g.cx - g.hs, g.cy - g.hs, g.hs * 2, g.hs * 2, 18); c.clip();
        const bg = c.createRadialGradient(g.cx, g.cy, 0, g.cx, g.cy, g.hs * 1.5); bg.addColorStop(0, X.rgba(col, 0.55 * (1 - K.at) + 0.05)); bg.addColorStop(1, X.rgba([col[0] * 0.5, col[1] * 0.35, col[2] * 0.4], 0.35 * (1 - K.at) + 0.04)); c.fillStyle = bg; c.fillRect(g.cx - g.hs, g.cy - g.hs, g.hs * 2, g.hs * 2);
        X.grid(c, g.cx - g.hs, g.cy - g.hs, g.hs * 2, g.hs * 2, g.hs / 3, 'rgba(255,255,255,.07)');
        const P = (o) => [g.cx + o.x * g.hs, g.cy + o.y * g.hs], mv = (o) => { o.x += o.vx * dt * sp * 1.4; o.y += o.vy * dt * sp * 1.4; if (Math.abs(o.x) > 0.92) { o.vx *= -1; o.x = Math.sign(o.x) * 0.92; } if (Math.abs(o.y) > 0.92) { o.vy *= -1; o.y = Math.sign(o.y) * 0.92; } };
        // 빛 알갱이: 원자가 생기기 전엔 자주 꺾이고, 생긴 뒤엔 곧게
        st.L.forEach((l, i) => {
          if (K.at < 1 && Math.random() < dt * 6 * (1 - K.at)) l.a += (Math.random() - 0.5) * 3;
          const v = 0.9 * dt; l.x += Math.cos(l.a) * v; l.y += Math.sin(l.a) * v;
          if (Math.abs(l.x) > 0.95 || Math.abs(l.y) > 0.95) { if (K.at >= 1) { if (Math.abs(l.x) > 0.95) l.x = -Math.sign(l.x) * 0.94; if (Math.abs(l.y) > 0.95) l.y = -Math.sign(l.y) * 0.94; l.tr = []; } else { l.a += Math.PI; l.x = XK.clamp(l.x, -0.95, 0.95); l.y = XK.clamp(l.y, -0.95, 0.95); } }
          l.tr.push([l.x, l.y]); if (l.tr.length > 26) l.tr.shift();
          c.strokeStyle = 'rgba(255,224,110,.45)'; c.lineWidth = 2; c.beginPath(); l.tr.forEach(([x, y], k) => (k ? c.lineTo : c.moveTo).call(c, g.cx + x * g.hs, g.cy + y * g.hs)); c.stroke();
          const [x, y] = P(l); X.glow(c, x, y, 9, 'rgba(255,230,120,.9)');
        });
        // 원자핵 무리: 0~3은 헬륨 원자핵 자리로 모인다
        const hc = { x: -0.25, y: 0.15 };
        st.N.forEach((n, i) => {
          mv(n);
          if (i < 4 && K.he > 0) { const off = [[-1, -1], [1, -1], [-1, 1], [1, 1]][i], d = 0.055; n.x = XK.lerp(n.x, hc.x + off[0] * d, K.he * 0.25 + 0.02); n.y = XK.lerp(n.y, hc.y + off[1] * d, K.he * 0.25 + 0.02); if (K.he >= 1) { n.x = hc.x + off[0] * d + Math.sin(t * 3 + i) * 0.004; n.y = hc.y + off[1] * d; } }
          const [x, y] = P(n), r = 9 + 4 * (s / 4);
          if (K.q < 1) { // 따로 노는 쿼크 셋(빨강·초록·파랑)
            const spr = (1 - K.q) * (26 + 10 * Math.sin(t * 2 + i));
            ['#ff5a5a', '#5ad17a', '#5a8dff'].forEach((qc, j) => { const a = n.ph + j * 2.09 + t * 2 * sp; X.ball(c, x + Math.cos(a) * spr, y + Math.sin(a) * spr, 4.2, qc, '#222'); });
          }
          if (K.q > 0) { c.globalAlpha = K.q; X.ball(c, x, y, r, n.p ? '#e4572e' : '#9aa3b5', n.p ? '#7a1f12' : '#454c5c', n.p ? '#ffd2c2' : '#f2f4f8'); c.globalAlpha = 1; if (r > 10 && n.p) X.txt(c, '+', x, y + 5, 'rgba(255,255,255,.85)', '800 13px'); }
        });
        if (K.he >= 1) { const [x, y] = P(hc); c.strokeStyle = 'rgba(167,199,255,.85)'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 30, 0, Math.PI * 2); c.stroke(); X.pill(c, x, y - 44, '헬륨 원자핵', 'rgba(29,36,51,.88)', '#a7c7ff', '700 14px'); }
        // 전자: 원자가 생기면 원자핵 둘레를 돈다
        st.E.forEach((e, i) => {
          mv(e); let [x, y] = P(e);
          if (K.at > 0) { const tgt = e.to >= 0 ? st.N[e.to] : hc, [nx, ny] = P(tgt), rr = e.to >= 0 ? 20 : 34, a = t * 2.5 + i; const ox = nx + Math.cos(a) * rr, oy = ny + Math.sin(a) * rr; x = XK.lerp(x, ox, K.at); y = XK.lerp(y, oy, K.at); if (K.at >= 1) { c.strokeStyle = 'rgba(160,190,255,.25)'; c.lineWidth = 1; c.beginPath(); c.arc(nx, ny, rr, 0, Math.PI * 2); c.stroke(); } }
          X.glow(c, x, y, 9, 'rgba(90,160,255,.5)'); X.ball(c, x, y, 4, '#6fb0ff', '#1d4e86');
        });
        c.restore();
        c.strokeStyle = 'rgba(220,226,240,.75)'; c.lineWidth = 2.5; X.rr(c, g.cx - g.hs, g.cy - g.hs, g.hs * 2, g.hs * 2, 18); c.stroke();
        // 끄는 손잡이
        const hx = g.cx + g.hs, hy = g.cy; X.ball(c, hx, hy, 13, '#ffd84d', '#b88a00'); X.arrow(c, hx + 16, hy, hx + 40, hy, '#ffd84d', 3, 10);
        X.pill(c, g.cx, g.cy - g.hs - 18, ['쿼크·전자가 마구 날아다닌다', '쿼크가 모여 양성자·중성자', '양성자·중성자 → 헬륨 원자핵', '원자핵 + 전자 → 원자'][K.at > 0.5 ? 3 : K.he > 0.5 ? 2 : K.q > 0.5 ? 1 : 0], 'rgba(29,36,51,.9)', '#fbfcf9', '700 16px');
        // 오른쪽 온도계(위 = 뜨겁다)
        const tx = W * 0.79, ty0 = 40, ty1 = H * 0.66, frac = XK.clamp(Math.log(s) / Math.log(4), 0, 1), my = XK.lerp(ty0, ty1, frac);
        X.txt(c, '우주의 온도', tx, ty0 - 14, '#fbfcf9', '800 17px');
        c.fillStyle = 'rgba(255,255,255,.12)'; X.rr(c, tx - 11, ty0, 22, ty1 - ty0, 11); c.fill();
        const tg = c.createLinearGradient(0, ty0, 0, ty1); tg.addColorStop(0, '#fff3c4'); tg.addColorStop(0.5, '#ff8a3d'); tg.addColorStop(1, '#b8321c'); c.fillStyle = tg; X.rr(c, tx - 7, my, 14, ty1 - my + 10, 7); c.fill();
        X.ball(c, tx, ty1 + 14, 17, '#e4572e', '#7a1f12');
        [[1.35, '쿼크 → 양성자·중성자'], [2.2, '헬륨 원자핵 · 약 3분'], [3.25, '원자 · 약 38만 년 · 약 3000 K']].forEach(([sv, lab], i) => {
          const y = XK.lerp(ty0, ty1, XK.clamp(Math.log(sv) / Math.log(4), 0, 1)), done = s >= sv;
          X.line(c, tx + 13, y, tx + 26, y, done ? '#ffd84d' : 'rgba(255,255,255,.4)', 2); X.txt(c, lab, tx + 32, y + 5, done ? '#ffd84d' : '#aab4cf', i === 2 ? '800 15px' : '700 14px', 'left');
        });
        X.txt(c, '뜨겁다', tx - 18, ty0 + 14, '#aab4cf', '600 13px', 'right'); X.txt(c, '식었다', tx - 18, ty1, '#aab4cf', '600 13px', 'right');
        // 아래: 크기-온도 그래프 + 질량·밀도
        const gx = 70, gy = H - 30, gw = W * 0.5, gh = H * 0.17;
        c.fillStyle = 'rgba(255,255,255,.05)'; X.rr(c, gx - 50, gy - gh - 30, gw + 70, gh + 52, 10); c.fill();
        X.line(c, gx, gy, gx + gw, gy, '#aab4cf', 2); X.line(c, gx, gy, gx, gy - gh, '#aab4cf', 2);
        X.txt(c, '온도', gx - 8, gy - gh + 6, '#aab4cf', '700 13px', 'right'); X.txt(c, '우주의 크기 →', gx + gw, gy + 18, '#aab4cf', '700 13px', 'right');
        const GX = (sv) => gx + (sv - 1) / 3 * gw, GY = (sv) => gy - gh * this.T(sv);
        c.strokeStyle = 'rgba(170,180,210,.3)'; c.setLineDash([4, 5]); c.lineWidth = 1.5; c.beginPath(); for (let sv = 1; sv <= 4.001; sv += 0.05) (sv === 1 ? c.moveTo : c.lineTo).call(c, GX(sv), GY(sv)); c.stroke(); c.setLineDash([]);
        if (!st.trace.length || Math.abs(st.trace[st.trace.length - 1] - s) > 0.02) st.trace.push(s);
        c.strokeStyle = '#ffd84d'; c.lineWidth = 3; c.beginPath(); st.trace.slice().sort((a, b) => a - b).forEach((sv, k) => (k ? c.lineTo : c.moveTo).call(c, GX(sv), GY(sv))); c.stroke();
        X.ball(c, GX(s), GY(s), 7, '#ffd84d', '#b88a00');
        const bx = W * 0.6, by = H - 30;
        X.txt(c, '전체 질량', bx, by - gh + 2, '#aab4cf', '700 13px', 'left'); c.fillStyle = '#7fe3a0'; c.fillRect(bx, by - gh + 10, 120, 14); X.txt(c, '그대로', bx + 128, by - gh + 22, '#7fe3a0', '700 13px', 'left');
        X.txt(c, '밀도', bx, by - gh / 2 + 6, '#aab4cf', '700 13px', 'left'); c.fillStyle = '#ff9f6b'; c.fillRect(bx, by - gh / 2 + 14, 120 / (s * s * s) + 2, 14); X.txt(c, s > 1.5 ? '줄어든다' : '아주 크다', bx + 128, by - gh / 2 + 26, '#ff9f6b', '700 13px', 'left');
        // 단계
        if (K.q >= 1 && !api.has(1)) { api.ok(1); api.say('식으면서 쿼크가 <b>셋씩</b> 모여 양성자(+)와 중성자가 되었다. 더 키워 보자.'); }
        if (K.he >= 1 && !api.has(2)) { api.ok(2); api.say('양성자 2개와 중성자 2개가 뭉쳐 <b>헬륨 원자핵</b>이 되었다(빅뱅 후 약 3분 안에). 남은 양성자는 수소 원자핵. 더 키워 보자.'); }
        if (K.at >= 1 && !api.has(3)) { api.ok(3); api.reveal(); api.say('약 <b>3000 K</b>까지 식자 원자핵이 전자를 붙잡아 <b>원자</b>가 되고, 빛이 곧게 퍼진다. 상자가 커져도 원자핵 수(질량)는 <b>그대로</b>, 온도와 밀도만 내려갔다.'); api.chip('원자가 생겼다', true); }
      },
      hint(st) { if (!st.W) return null; const g = this.geo(st.W, st.H, st.s); return { x: g.cx + g.hs, y: g.cy + 40, dx: 1, dy: 0, dist: 150, label: '오른쪽으로 끌기' }; },
      down(p, st) { st.x0 = p.x; st.s0 = st.s; },
      move(p, st, api, held) { if (held) st.s = XK.clamp(st.s0 + (p.x - st.x0) / st.W * 6, 1, 4); },
      key(k, st) { const d = { ArrowRight: 0.15, ArrowLeft: -0.15 }[k]; if (!d) return false; st.s = XK.clamp(st.s + d, 1, 4); return true; },
      test(st, api, s) { st.s = s; },
    },
    // ── 2-1-1 3차시 «온도가 정하는 빛의 색»: 온도 손잡이를 끌어 전구 필라멘트와 38만 년 무렵 우주를 함께 달구고 식힌다 ──
    // 가장 센 빛의 파장 ≈ 2 898 000 nm·K ÷ 온도(빈의 법칙). 3000 K → 약 970 nm(근적외선) · 2.7 K → 약 1 mm(마이크로파). 곡선은 모양만
    glow: {
      init(st, api) { st.T = 300; st.max = 300; st.min = 1e9; st.trace = []; api.say('예측을 고른 뒤, 오른쪽 <b>온도 손잡이</b>를 위로 끌어 3000 K까지 올려 보자.'); api.chip('손잡이를 위로 끌자'); },
      lT: (T) => Math.log10(T), // 2.7 ~ 3000 K
      ty(H, T) { const a = Math.log10(2.7), b = Math.log10(3000); return 50 + (H * 0.56 - 50) * (1 - (Math.log10(T) - a) / (b - a)); },
      // 흑체 색(눈에 보이는 색, 대략)
      bb(T) { if (T < 700) return [0, 0, 0, 0]; const k = XK.clamp((T - 700) / 2300, 0, 1); return [255, Math.round(XK.lerp(40, 205, Math.pow(k, 0.8))), Math.round(XK.lerp(0, 150, Math.pow(k, 1.6))), XK.clamp((T - 700) / 600, 0, 1)]; },
      planck(lnm, T) { const x = 1.4388e7 / (lnm * T); return x > 80 ? 0 : 1 / (Math.pow(lnm, 5) * (Math.exp(x) - 1)); },
      peak: (T) => 2.898e6 / T,
      fmt(nm) { return nm < 1000 ? `약 ${Math.round(nm / 10) * 10} nm` : nm < 1e6 ? `약 ${(nm / 1000).toFixed(nm < 1e4 ? 1 : 0)} μm` : `약 ${(nm / 1e6).toFixed(1)} mm`; },
      draw(c, W, H, dt, st, api, X) {
        const t = st.t, T = st.T, col = this.bb(T), top = H * 0.6;
        X.vgrad(c, 0, 0, W, top, ['#1b2033', '#141826']);
        // 왼쪽: 전구(유리·필라멘트·소켓)
        const bx = W * 0.2, by = top * 0.48, br = Math.min(W * 0.11, top * 0.3);
        if (col[3] > 0) { c.save(); c.globalCompositeOperation = 'lighter'; X.glow(c, bx, by, br * (2.2 + col[3]), X.rgba(col, 0.28 * col[3])); c.restore(); }
        const gl = c.createRadialGradient(bx - br * 0.3, by - br * 0.35, br * 0.1, bx, by, br); gl.addColorStop(0, 'rgba(255,255,255,.35)'); gl.addColorStop(0.7, col[3] > 0 ? X.rgba(col, 0.12 * col[3]) : 'rgba(200,215,240,.08)'); gl.addColorStop(1, 'rgba(200,215,240,.22)');
        c.fillStyle = gl; c.beginPath(); c.arc(bx, by, br, Math.PI * 0.72, Math.PI * 2.28); c.lineTo(bx + br * 0.42, by + br * 1.15); c.lineTo(bx - br * 0.42, by + br * 1.15); c.closePath(); c.fill(); c.strokeStyle = 'rgba(220,230,250,.55)'; c.lineWidth = 2; c.stroke();
        X.line(c, bx - 10, by + br * 1.1, bx - 14, by + 6, '#8a8f99', 2); X.line(c, bx + 10, by + br * 1.1, bx + 14, by + 6, '#8a8f99', 2);
        c.strokeStyle = col[3] > 0 ? X.rgba([255, Math.min(255, col[1] + 60), Math.min(255, col[2] + 80)], 1) : '#5b5f68'; c.lineWidth = col[3] > 0 ? 3 : 2; c.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 40; (i ? c.lineTo : c.moveTo).call(c, bx - 14 + u * 28, by + 6 + Math.sin(u * Math.PI * 8) * 5); } c.stroke();
        if (col[3] > 0) { c.save(); c.globalCompositeOperation = 'lighter'; X.glow(c, bx, by + 6, 30 + 30 * col[3], X.rgba(col, 0.8 * col[3])); c.restore(); }
        for (let i = 0; i < 5; i++) { c.fillStyle = i % 2 ? '#9aa1ad' : '#c6cbd4'; X.rr(c, bx - br * 0.42 + i * 1.5, by + br * 1.15 + i * 9, br * 0.84 - i * 3, 9, 3); c.fill(); }
        c.fillStyle = '#3b3f48'; X.rr(c, bx - br * 0.3, by + br * 1.15 + 45, br * 0.6, 12, 5); c.fill();
        X.txt(c, '전구 필라멘트', bx, top - 14, '#fbfcf9', '700 16px');
        // 가운데: 같은 온도의 초기 우주(사방에서 오는 빛)
        const ux = W * 0.5, uy = top * 0.48, ur = Math.min(W * 0.13, top * 0.38);
        c.save(); c.beginPath(); c.arc(ux, uy, ur, 0, 6.29); c.clip();
        const R = X.rnd(14); c.fillStyle = '#05060c'; c.fillRect(ux - ur, uy - ur, ur * 2, ur * 2);
        if (col[3] > 0) { const ug = c.createRadialGradient(ux, uy, 0, ux, uy, ur); ug.addColorStop(0, X.rgba([255, Math.min(255, col[1] + 40), Math.min(255, col[2] + 70)], 0.95 * col[3])); ug.addColorStop(0.6, X.rgba([255, Math.max(0, col[1] - 20), Math.max(0, col[2] - 50)], 0.9 * col[3])); ug.addColorStop(1, X.rgba([255, Math.max(0, col[1] - 60), Math.max(0, col[2] - 100)], 0.8 * col[3])); c.fillStyle = ug; c.fillRect(ux - ur, uy - ur, ur * 2, ur * 2); }
        for (let i = 0; i < 140; i++) { const a = R() * 6.29, d = Math.sqrt(R()) * ur, f = 0.75 + 0.25 * Math.sin(t * 1.5 + i); c.fillStyle = col[3] > 0 ? X.rgba([255, 250, 235], 0.12 * col[3] * f) : 'rgba(80,90,120,.05)'; c.beginPath(); c.arc(ux + Math.cos(a) * d, uy + Math.sin(a) * d, 8 + R() * 14, 0, 6.29); c.fill(); }
        if (T < 600) { X.txt(c, '눈에는 깜깜', ux, uy - 8, '#7f8aa8', '700 16px'); X.txt(c, T < 10 ? '전파 망원경에는 잡힌다' : '적외선·전파로 나온다', ux, uy + 16, T < 10 ? '#7fe3a0' : '#7f8aa8', '700 14px'); }
        c.restore(); c.strokeStyle = 'rgba(220,226,240,.6)'; c.lineWidth = 2; c.beginPath(); c.arc(ux, uy, ur, 0, 6.29); c.stroke();
        X.txt(c, T > 2000 ? '같은 온도의 우주(약 38만 년 무렵)' : T < 10 ? '지금 우주(약 2.7 K)' : '같은 온도의 우주', ux, top - 14, '#fbfcf9', '700 16px');
        // 오른쪽: 온도 손잡이(로그 눈금)
        const sx = W * 0.75, y0 = this.ty(H, 3000), y1 = this.ty(H, 2.7), ky = this.ty(H, T);
        c.fillStyle = 'rgba(255,255,255,.12)'; X.rr(c, sx - 8, y0 - 8, 16, y1 - y0 + 16, 8); c.fill();
        const tg = c.createLinearGradient(0, y0, 0, y1); tg.addColorStop(0, '#ffd9a0'); tg.addColorStop(0.35, '#ff6b2b'); tg.addColorStop(0.7, '#5a3a8c'); tg.addColorStop(1, '#2b4b9a'); c.fillStyle = tg; X.rr(c, sx - 5, ky, 10, y1 - ky + 4, 5); c.fill();
        [[3000, '3000 K'], [1000, '1000 K'], [300, '300 K · 방 온도'], [30, '30 K'], [2.7, '2.7 K · 지금 우주']].forEach(([v, s]) => { const y = this.ty(H, v); X.line(c, sx + 10, y, sx + 20, y, '#aab4cf', 2); X.txt(c, s, sx + 26, y + 5, '#aab4cf', '600 14px', 'left'); });
        X.ball(c, sx, ky, 15, '#ffd84d', '#b88a00'); X.txt(c, `${T < 10 ? T.toFixed(1) : Math.round(T)} K`, sx - 22, ky + 6, '#ffd84d', '800 20px', 'right');
        // 아래: 빛의 세기 곡선(파장 로그 눈금 100 nm ~ 10 mm) — 가장 센 빛을 1로 맞춘 모양
        X.vgrad(c, 0, top, W, H - top, ['#f6f3ea', '#ece7da']);
        const gx = 70, gw = W - 110, gy = H - 54, gh = H - top - 92, L0 = 2, L1 = 7, GX = (lnm) => gx + (Math.log10(lnm) - L0) / (L1 - L0) * gw;
        for (let n = 380; n <= 780; n += 5) { c.fillStyle = X.rgba(X.wl(n), 0.45); c.fillRect(GX(n), gy - gh, GX(n + 5) - GX(n) + 0.5, gh); }
        X.pill(c, GX(540), gy - 14, '눈에 보이는 빛', 'rgba(29,36,51,.85)', '#fff', '700 13px');
        [[100, '100 nm'], [1000, '1 μm'], [1e4, '10 μm'], [1e5, '0.1 mm'], [1e6, '1 mm'], [1e7, '10 mm']].forEach(([v, s]) => { X.line(c, GX(v), gy, GX(v), gy + 6, '#5b6478', 1.5); X.txt(c, s, GX(v), gy + 22, '#5b6478', '600 13px'); });
        X.txt(c, '적외선', GX(2e4), gy + 40, '#8a5a3a', '700 14px'); X.txt(c, '전파(마이크로파)', GX(2.4e6), gy + 40, '#2b4b9a', '700 14px'); X.txt(c, '자외선', GX(180), gy + 40, '#6b4bb0', '700 14px');
        X.line(c, gx, gy, gx + gw, gy, '#1d2433', 2); X.txt(c, '빛의 세기(가장 센 빛 = 1)', gx - 50, gy - gh - 10, '#1d2433', '700 13px', 'left'); X.txt(c, '파장 →', gx + gw, gy - 8, '#1d2433', '700 13px', 'right');
        const pk = this.peak(T), pmax = this.planck(pk, T);
        // 지나온 온도의 곡선(흐리게)
        st.trace.forEach((Tv) => { const pv = this.planck(this.peak(Tv), Tv); c.strokeStyle = 'rgba(29,36,51,.12)'; c.lineWidth = 1.5; c.beginPath(); for (let i = 0; i <= 160; i++) { const l = Math.pow(10, L0 + (L1 - L0) * i / 160); (i ? c.lineTo : c.moveTo).call(c, GX(l), gy - gh * 0.92 * this.planck(l, Tv) / pv); } c.stroke(); });
        c.strokeStyle = '#e4572e'; c.lineWidth = 3.5; c.beginPath(); for (let i = 0; i <= 220; i++) { const l = Math.pow(10, L0 + (L1 - L0) * i / 220); (i ? c.lineTo : c.moveTo).call(c, GX(l), gy - gh * 0.92 * this.planck(l, T) / pmax); } c.stroke();
        const px = GX(pk); X.line(c, px, gy, px, gy - gh * 0.92, 'rgba(228,87,46,.5)', 1.5, [4, 4]); X.ball(c, px, gy - gh * 0.92, 7, '#e4572e', '#7a1f12');
        X.pill(c, XK.clamp(px, gx + 120, gx + gw - 120), gy - gh * 0.92 - 22, `가장 센 빛 ${this.fmt(pk)}`, 'rgba(29,36,51,.9)', '#ffd84d', '700 15px');
        // 단계
        if (!st.trace.length || Math.abs(Math.log10(st.trace[st.trace.length - 1] / T)) > 0.35) { st.trace.push(T); if (st.trace.length > 12) st.trace.shift(); }
        if (st.max >= 2900 && !api.has(1)) { api.ok(1); api.say('3000 K — 필라멘트도, 38만 년 무렵 우주도 <b>밝은 주황빛</b>으로 빛난다. 가장 센 빛은 눈에 보이는 빛 바로 바깥(적외선) 쪽. 이제 손잡이를 아래로 끌어 <b>식혀</b> 보자.'); api.chip('아래로 끌어 식히자'); }
        if (api.has(1) && st.min <= 900 && !api.has(2)) { api.ok(2); api.say('식을수록 빛이 <b>붉어지고 어두워지며</b>, 가장 센 빛이 <b>긴 파장</b> 쪽으로 옮겨 간다. 지금 우주 온도(약 2.7 K)까지 내려 보자.'); }
        if (api.has(2) && st.min <= 2.8 && !api.has(3)) { api.ok(3); api.reveal(); api.say('2.7 K에서 가장 센 빛은 <b>약 1 mm</b> — 눈에 안 보이는 <b>마이크로파</b>다. 그래서 우주 배경 복사는 전파 망원경으로만 잡힌다.'); api.chip('지금 우주의 빛', true); }
      },
      hint(st) { if (!st.W) return null; return { x: st.W * 0.75, y: this.ty(st.H, st.T), dx: 0, dy: -1, dist: 120, label: '위로 끌어 달구기' }; },
      down(p, st) { st.y0 = p.y; st.l0 = Math.log10(st.T); },
      move(p, st, api, held) { if (!held) return; const a = Math.log10(2.7), b = Math.log10(3000), span = (st.H * 0.56 - 50); this.setT(st, Math.pow(10, XK.clamp(st.l0 - (p.y - st.y0) / span * (b - a), a, b))); },
      setT(st, T) { st.T = T; st.max = Math.max(st.max, T); if (st.max >= 2900) st.min = Math.min(st.min, T); },
      key(k, st) { const d = { ArrowUp: 0.12, ArrowDown: -0.12 }[k]; if (!d) return false; this.setT(st, Math.pow(10, XK.clamp(Math.log10(st.T) + d, Math.log10(2.7), Math.log10(3000)))); return true; },
      test(st, api, T) { this.setT(st, T); },
    },
    // ── 2-1-1 3차시 «멀리 볼수록 옛날 빛»: 망원경을 점점 먼 천체로 돌리면 빛이 떠난 때가 쌓인다. 가장 먼 빛 = 우주 배경 복사 ──
    // 달 약 1.3초, 태양 약 8분, 시리우스 약 8.6년, 안드로메다 은하 약 250만 년, 먼 은하 약 100억 년(예), 우주 배경 복사 약 138억 년(빅뱅 후 약 38만 년에 나온 빛)
    lookback: {
      OB: [
        { n: '달', d: '약 1.3초 전', x: 0.05, k: 'moon' },
        { n: '태양', d: '약 8분 전', x: 0.2, k: 'sun' },
        { n: '시리우스(별)', d: '약 8.6년 전', x: 0.38, k: 'star' },
        { n: '안드로메다 은하', d: '약 250만 년 전', x: 0.58, k: 'gal' },
        { n: '아주 먼 은하', d: '약 100억 년 전(예)', x: 0.78, k: 'far' },
        { n: '우주 배경 복사', d: '약 138억 년 전 · 빅뱅 후 약 38만 년', x: 0.96, k: 'cmb' },
      ],
      init(st, api) { st.a = 0; st.rec = []; st.stay = 0; st.fly = null; api.say('예측을 고른 뒤, 화면을 오른쪽으로 끌어 망원경을 <b>점점 먼 곳</b>으로 돌려 보자.'); api.chip('끌어서 더 먼 곳 보기'); },
      icon(c, k, x, y, s, t, X) {
        if (k === 'moon') { X.ball(c, x, y, 14 * s, '#d8d8d2', '#77776f', '#fff'); [[-4, -3, 3], [5, 4, 2.5], [2, -6, 2]].forEach(([u, v, r]) => { c.fillStyle = 'rgba(90,90,85,.45)'; c.beginPath(); c.arc(x + u * s, y + v * s, r * s, 0, 6.29); c.fill(); }); }
        else if (k === 'sun') { X.glow(c, x, y, 40 * s, 'rgba(255,200,80,.6)'); X.ball(c, x, y, 15 * s, '#ffd84d', '#f08a1c', '#fffbe0'); }
        else if (k === 'star') { X.glow(c, x, y, 26 * s, 'rgba(190,215,255,.7)'); const L = (18 + 4 * Math.sin(t * 4)) * s; X.line(c, x - L, y, x + L, y, 'rgba(220,235,255,.8)', 1.5); X.line(c, x, y - L, x, y + L, 'rgba(220,235,255,.8)', 1.5); X.ball(c, x, y, 5 * s, '#f4f8ff', '#9fb8ff'); }
        else if (k === 'gal' || k === 'far') {
          const R = (k === 'gal' ? 22 : 11) * s, tint = k === 'gal' ? [200, 210, 255] : [255, 170, 130];
          X.glow(c, x, y, R * 1.6, X.rgba(tint, 0.35)); c.save(); c.translate(x, y); c.rotate(-0.5); c.scale(1, 0.45);
          for (let i = 0; i < 70; i++) { const arm = i % 2, r = (i >> 1) / 35 * R, a = arm * Math.PI + r / R * 4 + t * 0.1; c.fillStyle = X.rgba(tint, 0.85 - r / R * 0.6); c.beginPath(); c.arc(Math.cos(a) * r, Math.sin(a) * r, 1.6 * s, 0, 6.29); c.fill(); }
          c.restore(); X.glow(c, x, y, R * 0.45, 'rgba(255,240,210,.9)');
        } else if (k === 'cmb') { const R = X.rnd(5); for (let i = 0; i < 60; i++) { const u = R(), v = R(); c.fillStyle = R() > 0.5 ? 'rgba(255,150,70,.5)' : 'rgba(90,140,255,.45)'; c.beginPath(); c.arc(x + (u - 0.5) * 30 * s, y + (v - 0.5) * 120 * s, (3 + R() * 5) * s, 0, 6.29); c.fill(); } }
      },
      draw(c, W, H, dt, st, api, X) {
        const t = st.t, top = H * 0.4;
        // 위: 밤하늘 길(왼쪽 지구 → 오른쪽 우주 배경 복사), 가로는 거리(비례 아님)
        X.vgrad(c, 0, 0, W, top, ['#050816', '#0b1230', '#18224a']); X.stars(c, W, top, t, 110, 2);
        const px = (u) => 150 + u * (W - 210), py = top * 0.46;
        X.line(c, 150, py, W - 40, py, 'rgba(255,255,255,.18)', 2, [6, 8]);
        // 지구 언덕과 망원경, 사람
        c.fillStyle = '#0f1d18'; c.beginPath(); c.moveTo(0, top); c.quadraticCurveTo(70, top - 70, 170, top); c.fill();
        const ax = px(XK.lerp(this.OB[0].x, this.OB[5].x, st.a / 5)), ang = Math.atan2(py - (top - 58), ax - 80);
        c.save(); c.translate(80, top - 52); c.rotate(ang); c.fillStyle = X.hgrad(c, -10, 60, ['#8b95a8', '#e1e5ec', '#6b7385']); X.rr(c, -12, -7, 66, 14, 5); c.fill(); c.fillStyle = '#2b3243'; c.fillRect(48, -9, 8, 18); c.restore();
        X.line(c, 72, top - 50, 64, top - 30, '#2b3243', 3); X.line(c, 88, top - 50, 96, top - 30, '#2b3243', 3);
        c.fillStyle = '#1c2a24'; X.rr(c, 36, top - 66, 16, 34, 7); c.fill(); c.beginPath(); c.arc(44, top - 74, 8, 0, 6.29); c.fill();
        X.txt(c, '지구', 70, top - 6, '#9fd3b4', '700 14px');
        if (st.a > 4.5) { const dx = 130, dy = top - 40; c.fillStyle = '#c9d0de'; c.beginPath(); c.ellipse(dx, dy - 20, 24, 12, -0.6, 0, 6.283); c.fill(); c.strokeStyle = '#7f889a'; c.lineWidth = 2; c.stroke(); X.line(c, dx, dy - 20, dx + 12, dy - 34, '#7f889a', 2); X.line(c, dx, dy - 12, dx, dy + 8, '#7f889a', 4); X.txt(c, '전파 망원경', dx + 30, dy + 4, '#7fe3a0', '700 12px', 'left'); }
        // 시선(망원경이 보는 쪽)
        c.strokeStyle = 'rgba(255,216,77,.35)'; c.lineWidth = 10; c.beginPath(); c.moveTo(110, top - 60); c.lineTo(ax, py); c.stroke();
        this.OB.forEach((o, i) => { const x = px(o.x), on = Math.round(st.a) === i; this.icon(c, o.k, x, py, on ? 1.1 : 0.85, t, X); X.txt(c, o.n, x, py + (o.k === 'cmb' ? 76 : 44), on ? '#ffd84d' : '#aab4cf', on ? '800 15px' : '600 14px'); });
        X.txt(c, '가까이', 150, top - 10, '#7f8aa8', '600 13px', 'left'); X.txt(c, '아주 멀리 →', W - 40, top - 10, '#7f8aa8', '600 13px', 'right');
        // 날아오는 빛: 천체 → 지구
        if (st.fly) { st.fly.k += dt / 1.3; const o = this.OB[st.fly.i], k = Math.min(1, st.fly.k), x = XK.lerp(px(o.x), 120, k), y = XK.lerp(py, top - 58, k); for (let j = 0; j < 8; j++) { const q = Math.max(0, k - j * 0.02); X.glow(c, XK.lerp(px(o.x), 120, q), XK.lerp(py, top - 58, q), 9 - j, `rgba(255,236,150,${0.8 - j * 0.09})`); } X.glow(c, x, y, 16, 'rgba(255,240,170,.95)'); if (k >= 1) st.fly = null; }
        // 가운데: 망원경 속 모습(접안렌즈)
        X.vgrad(c, 0, top, W, H - top, ['#1a2034', '#151a2b']);
        const i = Math.round(st.a), o = this.OB[i], ex = W * 0.22, ey = top + (H - top) * 0.4, er = Math.min(W * 0.17, (H - top) * 0.36);
        X.glow(c, ex, ey, er * 1.25, 'rgba(0,0,0,.6)'); c.save(); c.beginPath(); c.arc(ex, ey, er, 0, 6.29); c.clip();
        X.vgrad(c, ex - er, ey - er, er * 2, er * 2, o.k === 'cmb' ? ['#2a1a28', '#1d1630'] : ['#03050d', '#0b1024']); if (o.k !== 'cmb') X.stars(c, W, H, t, 160, 4 + i, 0.8);
        if (o.k === 'cmb') { const R = X.rnd(9); c.save(); c.beginPath(); c.rect(ex, ey - er, er, er * 2); c.clip(); for (let j = 0; j < 260; j++) { const u = R(), v = R(); c.fillStyle = R() > 0.5 ? `rgba(255,${120 + R() * 60},60,${0.25 + R() * 0.3})` : `rgba(70,${110 + R() * 60},255,${0.25 + R() * 0.3})`; c.beginPath(); c.arc(ex + (u - 0.5) * er * 2, ey + (v - 0.5) * er * 2, 6 + R() * 16, 0, 6.29); c.fill(); } c.restore(); c.fillStyle = '#020309'; c.fillRect(ex - er, ey - er, er, er * 2); X.line(c, ex, ey - er, ex, ey + er, 'rgba(255,255,255,.5)', 2); X.txt(c, '눈·광학 망원경', ex - er * 0.5, ey - 10, '#aab4cf', '700 14px'); X.txt(c, '깜깜하다', ex - er * 0.5, ey + 14, '#7f8aa8', '700 14px'); X.pill(c, ex + er * 0.5, ey - er * 0.55, '전파 망원경', 'rgba(29,36,51,.85)', '#7fe3a0', '700 13px'); }
        else this.icon(c, o.k, ex, ey, o.k === 'moon' ? 6 : o.k === 'sun' ? 3.6 : o.k === 'star' ? 3 : o.k === 'gal' ? 4.2 : 7, t, X);
        c.restore(); c.strokeStyle = '#3a4258'; c.lineWidth = 10; c.beginPath(); c.arc(ex, ey, er + 5, 0, 6.29); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 1; X.line(c, ex - er, ey, ex + er, ey, 'rgba(255,255,255,.12)', 1); X.line(c, ex, ey - er, ex, ey + er, 'rgba(255,255,255,.12)', 1);
        if (o.k === 'cmb') { X.txt(c, '창 오른쪽: 전파로 잰 아주 작은 온도 차에', W * 0.44, top + 214, '#7fe3a0', '700 16px', 'left'); X.txt(c, '색을 입힌 지도(눈에 보이는 색이 아니다)', W * 0.44, top + 238, '#7fe3a0', '700 16px', 'left'); } else X.txt(c, '망원경 속', ex, ey + er + 30, '#aab4cf', '700 14px');
        // 오른쪽 글: 지금 보는 빛이 떠난 때
        const tx = W * 0.44;
        X.txt(c, o.n, tx, top + 52, '#fbfcf9', '800 28px', 'left');
        X.txt(c, '지금 보는 빛이 떠난 때', tx, top + 92, '#aab4cf', '700 17px', 'left');
        X.txt(c, o.d.split(' · ')[0], tx, top + 140, '#ffd84d', '800 38px', 'left');
        if (o.d.includes(' · ')) X.txt(c, o.d.split(' · ')[1] + '에 나온 빛 — 이보다 먼 옛 빛은 없다', tx, top + 174, '#ff9f6b', '700 17px', 'left');
        else X.txt(c, i === 0 ? '달빛도 아주 조금 옛날 모습이다' : i === 3 ? '우리가 보는 것은 250만 년 전 모습' : '빛은 1초에 약 30만 km를 간다', tx, top + 174, '#aab4cf', '600 16px', 'left');
        // 아래: 빛이 떠난 때 기록(쌓인다)
        const ry = H - 64, cw = (W - 40) / 6;
        X.txt(c, '빛이 떠난 때 기록', 20, ry - 18, '#fbfcf9', '800 16px', 'left');
        this.OB.forEach((q, j) => { const x = 20 + j * cw, has = st.rec.includes(j); c.fillStyle = has ? (j === 5 ? 'rgba(255,159,107,.25)' : 'rgba(255,216,77,.16)') : 'rgba(255,255,255,.05)'; X.rr(c, x + 3, ry, cw - 6, 50, 10); c.fill(); c.strokeStyle = has ? (j === 5 ? '#ff9f6b' : '#ffd84d') : 'rgba(255,255,255,.15)'; c.lineWidth = 1.5; c.stroke(); X.txt(c, q.n, x + cw / 2, ry + 20, has ? '#fbfcf9' : '#6f7893', '700 14px'); X.txt(c, has ? q.d.split(' · ')[0].replace('(예)', '') : '?', x + cw / 2, ry + 40, has ? '#ffd84d' : '#6f7893', '700 14px'); if (j < 5) X.txt(c, '→', x + cw, ry + 31, '#6f7893', '700 14px'); });
        // 한 곳에 0.6초 머물면 빛이 날아오고 기록된다
        if (st.touched && !st.held && Math.abs(st.a - i) < 0.01) { st.stay += dt; if (st.stay > 0.35 && !st.rec.includes(i)) this.rec(st, api, i); } else st.stay = 0;
      },
      rec(st, api, i) {
        st.rec.push(i); st.fly = { i, k: 0 };
        if (st.rec.length >= 2) api.ok(1);
        if (st.rec.includes(3)) api.ok(2);
        const o = this.OB[i];
        if (i === 5) { api.ok(3); api.reveal(); api.say('가장 먼 곳에서 오는 빛은 <b>우주 배경 복사</b> — 빅뱅 후 약 38만 년, 원자가 생기며 퍼져 나온 빛이다. 멀리 볼수록 <b>더 옛날</b>의 우주를 본다.'); api.chip('가장 오래된 빛', true); }
        else api.say(`<b>${o.n}</b>의 빛은 <b>${o.d}</b>에 떠났다. ${i < 3 ? '더 먼 곳도 보자.' : '더 끌어 가장 먼 빛까지 가 보자.'}`);
      },
      hint(st) { if (!st.W) return null; return { x: 170, y: st.H * 0.4 * 0.46 + 44, dx: 1, dy: 0, dist: 200, label: '오른쪽으로 끌기' }; },
      // 지금 보고 있던 칸(처음엔 달)에서 끌기 시작하면 그 칸도 기록한다: 달에서 바로 오른쪽으로 끌어도 달 칸이 비지 않게
      down(p, st, api) { const i = Math.round(st.a); if (Math.abs(st.a - i) < 0.01 && !st.rec.includes(i)) this.rec(st, api, i); st.held = true; st.x0 = p.x; st.a0 = st.a; },
      move(p, st, api, held) { if (held) st.a = XK.clamp(st.a0 + (p.x - st.x0) / st.W * 7, 0, 5); },
      up(p, st) { st.held = false; st.a = Math.round(st.a); },
      key(k, st) { const d = { ArrowRight: 1, ArrowLeft: -1 }[k]; if (!d) return false; st.a = XK.clamp(Math.round(st.a) + d, 0, 5); return true; },
      test(st, api, i) { st.a = i; if (!st.rec.includes(i)) this.rec(st, api, i); },
    },
    // ── 2-1-1 3차시 «어디를 보아도 3 : 1»: 조준경을 천체에 대고 있으면 빛을 분석해 수소 : 헬륨 질량비가 나온다. 빅뱅 예측(약 3 : 1)과 견준다 ──
    // 천체마다 값은 이해를 돕기 위한 예(수소 약 72~75 %, 헬륨 약 24~27 %, 나머지 무거운 원소)
    ratio: {
      OB: [
        { n: '가까운 별', h: 73, he: 25, x: 0.14, y: 0.3, k: 'star' },
        { n: '오리온자리 성운', h: 74, he: 25, x: 0.33, y: 0.62, k: 'neb' },
        { n: '공 모양 별 무리', h: 75, he: 24.5, x: 0.52, y: 0.25, k: 'clu' },
        { n: '이웃 은하', h: 74, he: 25, x: 0.72, y: 0.58, k: 'gal' },
        { n: '먼 은하 사이 기체', h: 75, he: 24.8, x: 0.88, y: 0.28, k: 'gas' },
      ],
      init(st, api) { st.rx = 0.5; st.ry = 0.85; st.m = [-1, 0]; st.res = []; api.say('예측을 고른 뒤, 노란 <b>조준경</b>을 끌어 천체 위에 대고 잠깐 기다리자. 빛을 나누어 수소와 헬륨의 양을 잰다.'); api.chip('조준경을 천체에 대자'); },
      sky(W, H) { return H * 0.56; },
      obj(c, o, x, y, s, t, X) {
        if (o.k === 'star') { X.glow(c, x, y, 34 * s, 'rgba(255,220,170,.55)'); for (let a = 0; a < 4; a++) { const L = 30 * s * (1 + 0.1 * Math.sin(t * 3)); X.line(c, x - Math.cos(a * 0.785) * L, y - Math.sin(a * 0.785) * L, x + Math.cos(a * 0.785) * L, y + Math.sin(a * 0.785) * L, 'rgba(255,235,200,.55)', a % 2 ? 1 : 2); } X.ball(c, x, y, 7 * s, '#fff6e0', '#ffb070'); }
        else if (o.k === 'neb') { [['rgba(230,90,140,.35)', -12, -6, 46], ['rgba(110,150,255,.3)', 14, 8, 40], ['rgba(255,170,90,.3)', 0, 0, 30]].forEach(([col, u, v, r]) => X.glow(c, x + u * s, y + v * s, r * s, col)); const R = X.rnd(3); for (let i = 0; i < 12; i++) X.glow(c, x + (R() - 0.5) * 60 * s, y + (R() - 0.5) * 40 * s, 3, 'rgba(255,255,255,.9)'); }
        else if (o.k === 'clu') { X.glow(c, x, y, 30 * s, 'rgba(255,240,200,.4)'); const R = X.rnd(8); for (let i = 0; i < 80; i++) { const a = R() * 6.29, d = Math.pow(R(), 1.8) * 30 * s; c.fillStyle = 'rgba(255,245,220,.85)'; c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 1.1 + R(), 0, 6.29); c.fill(); } }
        else if (o.k === 'gal') { X.glow(c, x, y, 44 * s, 'rgba(180,200,255,.3)'); c.save(); c.translate(x, y); c.rotate(0.4); c.scale(1, 0.42); for (let i = 0; i < 90; i++) { const arm = i % 2, r = (i >> 1) / 45 * 40 * s, a = arm * Math.PI + r / (40 * s) * 4.5 + t * 0.08; c.fillStyle = `rgba(210,220,255,${0.9 - r / (40 * s) * 0.6})`; c.beginPath(); c.arc(Math.cos(a) * r, Math.sin(a) * r, 1.8, 0, 6.29); c.fill(); } c.restore(); X.glow(c, x, y, 12 * s, 'rgba(255,240,210,.95)'); }
        else { X.glow(c, x, y, 40 * s, 'rgba(120,200,190,.25)'); [[-10, 4, 26], [12, -6, 22], [2, 8, 18]].forEach(([u, v, r]) => X.glow(c, x + u * s, y + v * s, r * s, 'rgba(140,220,210,.3)')); X.glow(c, x + 60 * s, y - 20 * s, 5, 'rgba(255,255,255,.9)'); X.txt(c, '(뒤쪽 밝은 천체의 빛으로 본다)', x, y + 50 * s, '#7f8aa8', '600 12px'); }
      },
      draw(c, W, H, dt, st, api, X) {
        const t = st.t, sh = this.sky(W, H);
        X.vgrad(c, 0, 0, W, sh, ['#03040c', '#0a1029', '#141c40']); X.stars(c, W, sh, t, 160, 6);
        c.save(); c.globalAlpha = 0.5; const mw = c.createLinearGradient(0, sh, W, 0); mw.addColorStop(0, 'rgba(0,0,0,0)'); mw.addColorStop(0.5, 'rgba(160,170,220,.18)'); mw.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = mw; c.beginPath(); c.moveTo(0, sh * 0.95); c.lineTo(W * 0.2, sh); c.lineTo(W, sh * 0.1); c.lineTo(W, 0); c.lineTo(W * 0.85, 0); c.closePath(); c.fill(); c.restore();
        this.OB.forEach((o, i) => { const x = o.x * W, y = o.y * sh, done = st.res.includes(i); this.obj(c, o, x, y, 1.6, t, X); X.pill(c, x, y - 78, o.n + (done ? ' ✓' : ''), done ? 'rgba(47,158,98,.9)' : 'rgba(29,36,51,.8)', '#fbfcf9', '700 14px'); });
        // 조준경
        const rx = st.rx * W, ry = st.ry * sh; c.strokeStyle = '#ffd84d'; c.lineWidth = 3; c.beginPath(); c.arc(rx, ry, 30, 0, 6.29); c.stroke(); [[0, -1], [0, 1], [-1, 0], [1, 0]].forEach(([u, v]) => X.line(c, rx + u * 18, ry + v * 18, rx + u * 40, ry + v * 40, '#ffd84d', 2.5));
        if (st.m[0] >= 0 && !st.res.includes(st.m[0])) { c.strokeStyle = '#7fe3a0'; c.lineWidth = 5; c.beginPath(); c.arc(rx, ry, 36, -Math.PI / 2, -Math.PI / 2 + st.m[1] * 6.283); c.stroke(); }
        // 겨누고 있는 천체 찾기 → 1.2초 머물면 잰다
        const near = this.OB.findIndex((o) => Math.hypot(o.x * W - rx, o.y * sh - ry) < 46);
        if (near >= 0 && !st.res.includes(near)) { if (st.m[0] !== near) st.m = [near, 0]; st.m[1] += dt / 1.2; if (st.m[1] >= 1) this.meas(st, api, near); } else if (near < 0) st.m = [-1, 0];
        // 아래: 결과(띠 그래프) + 빅뱅 예측
        X.vgrad(c, 0, sh, W, H - sh, ['#f6f3ea', '#ece7da']);
        c.fillStyle = 'rgba(29,36,51,.12)'; c.fillRect(0, sh, W, 3);
        const bx = 230, bw = W - bx - 120, rh = 36, top = sh + 48;
        X.txt(c, '빛으로 잰 질량 비율', 20, sh + 28, '#1d2433', '800 17px', 'left');
        [0, 25, 50, 75, 100].forEach((v) => { const x = bx + bw * v / 100; X.line(c, x, top - 8, x, top + 5 * (rh + 8), 'rgba(29,36,51,.12)', 1); X.txt(c, v + '%', x, top - 12, '#5b6478', '600 12px'); });
        const pred = bx + bw * 0.75; c.fillStyle = 'rgba(228,87,46,.14)'; c.fillRect(pred - 10, top - 6, 20, 5 * (rh + 8) + 2); X.line(c, pred, top - 8, pred, top + 5 * (rh + 8), '#e4572e', 2.5, [6, 4]);
        this.OB.forEach((o, i) => {
          const y = top + i * (rh + 8), has = st.res.includes(i);
          X.txt(c, o.n, bx - 12, y + rh / 2 + 6, has ? '#1d2433' : '#9aa0ad', '700 15px', 'right');
          if (!has) { c.strokeStyle = 'rgba(29,36,51,.2)'; c.setLineDash([5, 5]); c.strokeRect(bx, y, bw, rh); c.setLineDash([]); return; }
          const k = Math.min(1, (t - (st['t' + i] || 0)) / 0.8), hw = bw * o.h / 100 * k, ew = bw * o.he / 100 * k;
          c.fillStyle = '#3d7fd9'; c.fillRect(bx, y, hw, rh); c.fillStyle = '#f2b632'; c.fillRect(bx + hw, y, ew, rh); c.fillStyle = '#9aa0ad'; c.fillRect(bx + hw + ew, y, bw * (100 - o.h - o.he) / 100 * k, rh);
          if (k > 0.9) { X.txt(c, `수소 ${o.h} %`, bx + 10, y + rh / 2 + 6, '#fff', '700 14px', 'left'); X.txt(c, `헬륨 ${o.he} %`, bx + hw + ew - 8, y + rh / 2 + 6, '#3b2c00', '700 14px', 'right'); X.txt(c, `≈ ${(o.h / o.he).toFixed(1)} : 1`, bx + bw + 10, y + rh / 2 + 6, '#1d2433', '800 15px', 'left'); }
        });
        X.pill(c, pred, H - 18, '빅뱅 우주론의 예측: 수소 약 75 % (3 : 1)', 'rgba(228,87,46,.92)', '#fff', '700 14px');
      },
      meas(st, api, i) {
        st.res.push(i); st['t' + i] = st.t; st.m = [-1, 0];
        const n = st.res.length; if (n >= 1) api.ok(1); if (n >= 3) api.ok(2);
        if (n >= 5) { api.ok(3); api.reveal(); api.say('다섯 곳 모두 수소 : 헬륨 ≈ <b>3 : 1</b>. 빅뱅 직후 만들어진 비율이 지금 우주 <b>어디서나</b> 그대로 보인다 → 빅뱅 우주론의 증거.'); api.chip('다섯 곳 모두 쟀다', true); }
        else api.say(`<b>${this.OB[i].n}</b>: 수소 ${this.OB[i].h} %, 헬륨 ${this.OB[i].he} % → 약 ${(this.OB[i].h / this.OB[i].he).toFixed(1)} : 1. ${n < 3 ? '다른 천체도 재어 보자.' : '남은 천체도 마저 재어 보자.'}`);
      },
      hint(st) { if (!st.W) return null; const sh = this.sky(st.W, st.H); return { x: st.rx * st.W, y: st.ry * sh, dx: this.OB[1].x * st.W - st.rx * st.W, dy: this.OB[1].y * sh - st.ry * sh, dist: Math.hypot(this.OB[1].x * st.W - st.rx * st.W, this.OB[1].y * sh - st.ry * sh), label: '조준경을 천체에' }; },
      down(p, st) { const sh = this.sky(st.W, st.H); st.drag = p.y < sh + 20; if (st.drag) { st.off = [st.rx * st.W - p.x, st.ry * sh - p.y]; if (Math.hypot(st.off[0], st.off[1]) > 60) st.off = [0, 0]; } },
      move(p, st, api, held) { if (!held || !st.drag) return; const sh = this.sky(st.W, st.H); st.rx = XK.clamp((p.x + st.off[0]) / st.W, 0.03, 0.97); st.ry = XK.clamp((p.y + st.off[1]) / sh, 0.05, 0.95); },
      key(k, st, api) { const i = '12345'.indexOf(k); if (i < 0) return false; st.rx = this.OB[i].x; st.ry = this.OB[i].y; return true; },
      test(st, api, i) { st.rx = this.OB[i].x; st.ry = this.OB[i].y; this.meas(st, api, i); st['t' + i] = st.t - 1; },
    },
    // ── 2-1-2 1차시 «무거운 별은 짧게 산다»: 비교 별의 질량을 정하고 세월을 흘려, 어느 별의 중심 수소가 먼저 바닥나는지 본다 (교과서 55쪽 «수백만 년~수백억 년») ──
    // 수소 핵융합 기간 ≈ 100억 년 × (질량)^-2.5, 밝기 ≈ (질량)^3.5 — 모두 이해를 돕기 위한 어림
    life: {
      init(st, api) { st.m = 1; st.y = 6; st.pts = []; st.mode = 'm'; api.say('예측을 고른 뒤, 오른쪽 <b>비교 별</b>의 가장자리를 위아래로 끌어 질량을 정하자. 그다음 아래 <b>세월 눈금</b>을 끈다.'); api.chip('비교 별의 질량 정하기'); },
      L: (m) => 1e10 * Math.pow(m, -2.5),
      col(m) { return m > 8 ? [150, 185, 255] : m > 2 ? [215, 228, 255] : m > 0.9 ? [255, 236, 170] : [255, 170, 110]; },
      fL(L) { return L >= 1e10 ? '약 ' + Math.round(L / 1e9) * 10 + '억 년' : L >= 1e8 ? '약 ' + Math.round(L / 1e8) + '억 년' : '약 ' + Math.round(L / 1e6) * 100 + '만 년'; },
      yrs(y) { return y < 1e8 ? `${Math.round(y / 1e4).toLocaleString('ko-KR')}만 년` : `${(y / 1e8).toFixed(y < 1e9 ? 1 : 0)}억 년`; },
      geo(W, H) { return { ax: W * 0.22, bx: W * 0.56, sy: H * 0.33, tl: 60, tr: W - 60, ty: H * 0.77 }; },
      star(c, x, y, m, frac, t, X, H) {
        // frac: 중심 수소 남은 몫(0이면 적색 거성으로 부푼다). 별 = 테두리가 어두운 공 + 쌀알 무늬 + 빛 번짐, 가운데 창 = 중심부(빨강 수소, 파랑 헬륨이 가운데부터 차오른다)
        const dead = frac <= 0, r0 = Math.min(H * 0.15, 44 * Math.pow(m, 0.6)), r = dead ? Math.min(r0 * 2.2, H * 0.2) : r0, col = dead ? [255, 120, 70] : this.col(m);
        const lum = Math.min(2.2, 0.6 + Math.log10(1 + Math.pow(m, 3.5)) * 0.35);
        c.save(); c.globalCompositeOperation = 'lighter'; X.glow(c, x, y, r * (2 + lum), X.rgba(col, 0.28)); X.glow(c, x, y, r * 1.35, X.rgba(col, 0.35));
        for (let k = 0; k < 8; k++) { const a = k / 8 * 6.283 + t * 0.05, L = r * (1.5 + 0.25 * Math.sin(t * 1.7 + k)) * (0.7 + lum * 0.25); c.strokeStyle = X.rgba(col, 0.12); c.lineWidth = 3; c.beginPath(); c.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); c.lineTo(x + Math.cos(a) * L, y + Math.sin(a) * L); c.stroke(); }
        c.restore();
        const gr = c.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, '#fffdf4'); gr.addColorStop(0.55, X.rgba(col)); gr.addColorStop(1, X.rgba(col.map((v) => v * 0.55))); c.fillStyle = gr; c.beginPath(); c.arc(x, y, r, 0, 6.283); c.fill();
        c.save(); c.beginPath(); c.arc(x, y, r, 0, 6.283); c.clip(); const R = X.rnd(Math.round(m * 10) + 3);
        for (let i = 0; i < 60; i++) { const px = x + (R() - 0.5) * 2 * r, py = y + (R() - 0.5) * 2 * r; c.fillStyle = `rgba(255,255,255,${0.05 + 0.05 * Math.sin(t * 2 + i)})`; c.beginPath(); c.arc(px, py, r * (0.06 + R() * 0.06), 0, 6.283); c.fill(); c.strokeStyle = 'rgba(0,0,0,.05)'; c.lineWidth = 1; c.stroke(); }
        // 흑점(태양 정도까지의 별) · 가장자리 어둡게 · 홍염 고리: 공이 아니라 타오르는 별로 보이게
        if (!dead && m <= 2.5) [[-0.55, -0.42, 0.09], [-0.38, -0.5, 0.06], [0.5, 0.48, 0.07]].forEach(([u, v, s2]) => { const px = x + u * r + Math.sin(t * 0.08) * r * 0.05, py = y + v * r; c.fillStyle = 'rgba(70,30,10,.55)'; c.beginPath(); c.arc(px, py, r * s2 * 1.6, 0, 6.283); c.fill(); c.fillStyle = 'rgba(40,15,5,.8)'; c.beginPath(); c.arc(px, py, r * s2, 0, 6.283); c.fill(); });
        const lg = c.createRadialGradient(x, y, r * 0.7, x, y, r); lg.addColorStop(0, 'rgba(0,0,0,0)'); lg.addColorStop(1, 'rgba(60,20,0,.35)'); c.fillStyle = lg; c.fillRect(x - r, y - r, 2 * r, 2 * r);
        c.restore();
        if (!dead && m <= 2.5) for (let k = 0; k < 4; k++) { const a = k * 1.7 + 0.4 + Math.sin(t * 0.3 + k) * 0.08, h = r * (0.22 + 0.08 * Math.sin(t * 1.1 + k * 2)), w = 0.16, p1 = [x + Math.cos(a - w) * r, y + Math.sin(a - w) * r], p2 = [x + Math.cos(a + w) * r, y + Math.sin(a + w) * r], q = [x + Math.cos(a) * (r + h * 2), y + Math.sin(a) * (r + h * 2)];
          c.strokeStyle = X.rgba([255, 120, 70], 0.55); c.lineWidth = Math.max(2, r * 0.05); c.lineCap = 'round'; c.beginPath(); c.moveTo(...p1); c.quadraticCurveTo(...q, ...p2); c.stroke(); }
        if (!dead) {
          const cr = r * 0.45; c.fillStyle = 'rgba(20,14,10,.55)'; c.beginPath(); c.arc(x, y, cr + 4, 0, 6.283); c.fill();
          c.fillStyle = '#e4572e'; c.beginPath(); c.arc(x, y, cr, 0, 6.283); c.fill();
          const hr = cr * Math.sqrt(1 - frac); if (hr > 0.5) { X.ball(c, x, y, hr, '#7ea6e8', '#3a5a9a', '#dfeaff'); }
          c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.5; c.setLineDash([3, 3]); c.beginPath(); c.arc(x, y, cr + 4, 0, 6.283); c.stroke(); c.setLineDash([]);
        }
      },
      draw(c, W, H, dt, st, api, X) {
        const g = this.geo(W, H), t = st.t, now = Math.pow(10, st.y);
        X.vgrad(c, 0, 0, W, H, ['#060917', '#0b1127', '#0e1430']);
        // 은하수 띠와 성운 빛(위쪽 빈 하늘을 채운다)
        { const R = X.rnd(21); for (let i = 0; i < 70; i++) { const u = R(), bx = u * W, by = H * (0.04 + 0.42 * u) + (R() - 0.5) * H * 0.16; X.glow(c, bx, by, 18 + R() * 40, `rgba(${150 + R() * 60},${150 + R() * 50},255,${0.06 + R() * 0.07})`); }
          X.glow(c, W * 0.12, H * 0.1, H * 0.28, 'rgba(160,80,200,.10)'); X.glow(c, W * 0.7, H * 0.06, H * 0.3, 'rgba(70,140,220,.10)'); }
        X.stars(c, W, H * 0.6, t, 90, 4);
        const L1 = this.L(1), Lm = this.L(st.m), f1 = 1 - now / L1, fm = 1 - now / Lm;
        // 두 별
        this.star(c, g.ax, g.sy, 1, f1, t, X, H); this.star(c, g.bx, g.sy, st.m, fm, t, X, H);
        X.txt(c, '태양 (질량 1배)', g.ax, H * 0.57, '#fbfcf9', '800 18px');
        X.txt(c, `비교 별 (질량 ${st.m < 1 ? st.m.toFixed(1) : Math.round(st.m)}배)`, g.bx, H * 0.57, '#ffd84d', '800 18px');
        [[g.ax, 1, f1], [g.bx, st.m, fm]].forEach(([x, m, f]) => X.pill(c, x, H * 0.57 + 28, f > 0 ? `중심 수소 ${Math.round(f * 100)} % 남음` : '중심 수소 바닥 → 부풀기 시작', f > 0 ? 'rgba(29,36,51,.85)' : 'rgba(180,60,30,.9)', '#fbfcf9', '700 14px'));
        X.txt(c, '빨강 = 중심의 수소 · 파랑 = 쌓인 헬륨', W * 0.42, 30, '#aab4cf', '600 14px');
        // 질량 손잡이 안내(비교 별 오른쪽 세로 막대)
        const mx = W * 0.87, my0 = H * 0.12, my1 = H * 0.52, mk = (Math.log10(st.m) + 0.301) / 1.602, myy = XK.lerp(my1, my0, mk);
        c.fillStyle = 'rgba(255,255,255,.12)'; X.rr(c, mx - 6, my0, 12, my1 - my0, 6); c.fill();
        [[0.5, '0.5배'], [1, '1배'], [5, '5배'], [20, '20배']].forEach(([m, s]) => { const yy = XK.lerp(my1, my0, (Math.log10(m) + 0.301) / 1.602); X.line(c, mx + 9, yy, mx + 17, yy, '#aab4cf', 2); X.txt(c, s, mx + 22, yy + 5, '#aab4cf', '600 13px', 'left'); });
        X.ball(c, mx, myy, 12, '#ffd84d', '#b88a00'); X.txt(c, '질량', mx, my0 - 10, '#ffd84d', '700 14px');
        // 세월 눈금(로그 100만 년 ~ 1000억 년)
        const X0 = (y) => g.tl + (y - 6) / 5 * (g.tr - g.tl);
        c.fillStyle = 'rgba(255,255,255,.06)'; X.rr(c, g.tl - 20, g.ty - 44, g.tr - g.tl + 40, 96, 14); c.fill();
        X.line(c, g.tl, g.ty, g.tr, g.ty, 'rgba(220,226,240,.5)', 3); X.line(c, g.tl, g.ty, X0(st.y), g.ty, '#ffd84d', 5);
        [[6, '100만 년'], [7, '1000만 년'], [8, '1억 년'], [9, '10억 년'], [10, '100억 년'], [11, '1000억 년']].forEach(([y, s]) => { X.line(c, X0(y), g.ty - 7, X0(y), g.ty + 7, '#aab4cf', 2); X.txt(c, s, X0(y), g.ty + 28, '#aab4cf', '600 13px'); });
        const age = X0(Math.log10(1.38e10)); X.line(c, age, g.ty - 16, age, g.ty + 10, '#7fe3a0', 2.5); X.txt(c, '우주의 나이', age, g.ty - 22, '#7fe3a0', '700 13px');
        [[1, '#ffecaa'], [st.m, '#ffd84d']].forEach(([m, col]) => { const lx = X0(Math.log10(this.L(m))); if (lx < g.tr + 2) { c.fillStyle = col; c.beginPath(); c.moveTo(lx, g.ty - 6); c.lineTo(lx - 7, g.ty - 18); c.lineTo(lx + 7, g.ty - 18); c.fill(); } });
        X.ball(c, X0(st.y), g.ty, 11, '#ffd84d', '#b88a00'); X.pill(c, X0(st.y), g.ty - 50 < g.ty - 44 ? g.ty - 32 : g.ty - 32, this.yrs(now) + ' 뒤', 'rgba(29,36,51,.9)', '#ffd84d', '700 14px');
        // 아래: 질량 - 수명 기록(쌓인다)
        const by = H - 26; X.txt(c, '기록', 20, by + 5, '#fbfcf9', '800 15px', 'left');
        st.pts.forEach((p, i) => X.pill(c, 160 + i * 180, by, `${p.m < 1 ? p.m.toFixed(1) : Math.round(p.m)}배 → ${this.fL(p.L)}`, 'rgba(255,216,77,.16)', '#ffd84d', '700 14px'));
        if (!st.pts.length) X.txt(c, '비교 별의 수소가 바닥나면 여기에 쌓인다', 70, by + 5, '#6f7893', '600 14px', 'left');
        // 비교 별이 바닥났을 때 기록
        if (fm <= 0 && !st.pts.some((p) => Math.abs(p.m - st.m) < 0.05)) {
          st.pts.push({ m: st.m, L: Lm }); if (st.pts.length > 5) st.pts.shift();
          api.ok(1); api.ok(2);
          const n = new Set(st.pts.map((p) => Math.round(p.m * 10))).size;
          if (n >= 3) { api.ok(3); api.reveal(); api.say('질량이 클수록 연료(수소)는 많지만 훨씬 <b>세게 태워</b> 더 빨리 바닥난다 → 무거운 별은 <b>짧게</b>(수백만 년), 가벼운 별은 <b>길게</b>(수백억 년) 산다.'); api.chip('질량과 수명', true); }
          else api.say(`질량 ${st.m < 1 ? st.m.toFixed(1) : Math.round(st.m)}배인 별은 <b>${this.fL(Lm)}</b> 만에 중심 수소가 바닥났다. 세월을 되돌리고 질량을 바꿔 다시 견주어 보자(세 번).`);
        }
      },
      hint(st) { if (!st.W) return null; const g = this.geo(st.W, st.H); return st.mode === 'm' ? { x: st.W * 0.87, y: st.H * 0.4, dx: 0, dy: -1, dist: 110, label: '위로 끌어 무겁게' } : null; },
      down(p, st) { const g = this.geo(st.W, st.H); st.mode = p.y > g.ty - 60 ? 'y' : 'm'; st.p0 = p; st.m0 = st.m; st.y0 = st.y; },
      move(p, st, api, held) {
        if (!held) return; const g = this.geo(st.W, st.H);
        if (st.mode === 'm') { st.m = Math.pow(10, XK.clamp(Math.log10(st.m0) - (p.y - st.p0.y) / (st.H * 0.4) * 1.602, -0.301, 1.301)); st.y = 6; }
        else st.y = XK.clamp(6 + (p.x - g.tl) / (g.tr - g.tl) * 5, 6, 11);
      },
      up(p, st, api) { if (st.mode === 'm') this.setM(st, api, st.m); },
      setM(st, api, m) { st.m = m; st.y = 6; if (Math.abs(m - 1) > 0.15 && !api.has(1)) { api.ok(1); api.say(`비교 별의 질량을 <b>${m < 1 ? m.toFixed(1) : Math.round(m)}배</b>로 정했다. 크기·색·밝기를 태양과 견주어 보고, 이제 아래 <b>세월 눈금</b>을 오른쪽으로 끌자.`); api.chip('세월 눈금을 끌자'); } },
      key(k, st, api) { const d = { ArrowUp: ['m', 0.1], ArrowDown: ['m', -0.1], ArrowRight: ['y', 0.1], ArrowLeft: ['y', -0.1] }[k]; if (!d) return false; if (d[0] === 'm') this.setM(st, api, Math.pow(10, XK.clamp(Math.log10(st.m) + d[1], -0.301, 1.301))); else st.y = XK.clamp(st.y + d[1], 6, 11); return true; },
      test(st, api, m, y) { this.setM(st, api, m); st.y = y; },
    },
    // ── 2-1-2 1차시 «수소 원자핵 넷으로 헬륨 만들기»: 태양 중심부에서 수소 원자핵(양성자)을 끌어 핵융합 자리에 넣는다 (교과서 55쪽 그림 Ⅱ-9) ──
    // 원자 질량 단위(u): 양성자 1.00728 u × 4 = 4.029 u, 헬륨 원자핵(알파 입자) 4.00151 u → 약 0.7 % 줄어 에너지. 실제 반응은 여러 단계(화면은 한 번에 줄임)
    pp: {
      init(st, api) {
        const R = XK.rnd(7); st.P = []; for (let i = 0; i < 22; i++) this.spawn(st, R);
        st.inZ = []; st.fx = null; st.made = 0; st.ph = []; st.scale = 0; st.drag = null; st.R = R;
        api.say('예측을 고른 뒤, 빨간 <b>수소 원자핵</b>을 하나씩 끌어 가운데 <b>핵융합 자리</b>에 넣자. 넷이 모이면?'); api.chip('수소 원자핵을 가운데로');
      },
      spawn(st, R) { const a = R() * 6.283, d = 0.45 + R() * 0.5; st.P.push({ a, d, w: (0.25 + R() * 0.35) * (R() > 0.5 ? 1 : -1), j: R() * 6, x: 0, y: 0 }); },
      geo(W, H) { const cx = W * 0.32, cy = H * 0.5, R = Math.min(W * 0.3, H * 0.45); return { cx, cy, R, zr: R * 0.2 }; },
      draw(c, W, H, dt, st, api, X) {
        const g = this.geo(W, H), t = st.t;
        X.vgrad(c, 0, 0, W, H, ['#120b0a', '#1c0f0c', '#120b0a']);
        // 태양 중심부 단면: 겹겹의 플라스마
        X.glow(c, g.cx, g.cy, g.R * 1.35, 'rgba(255,120,40,.35)');
        const pg = c.createRadialGradient(g.cx, g.cy, 0, g.cx, g.cy, g.R); pg.addColorStop(0, '#fff2b8'); pg.addColorStop(0.35, '#ffb347'); pg.addColorStop(0.8, '#e2571c'); pg.addColorStop(1, '#8c2a0c'); c.fillStyle = pg; c.beginPath(); c.arc(g.cx, g.cy, g.R, 0, 6.283); c.fill();
        c.save(); c.beginPath(); c.arc(g.cx, g.cy, g.R, 0, 6.283); c.clip();
        for (let i = 0; i < 40; i++) { const a = i * 2.4 + t * 0.15 * (i % 2 ? 1 : -1), d = g.R * (0.2 + (i * 37 % 80) / 100); X.glow(c, g.cx + Math.cos(a) * d, g.cy + Math.sin(a) * d, 30 + (i % 4) * 10, 'rgba(255,220,140,.12)'); }
        // 헬륨이 쌓인 가운데(만든 수만큼 커진다)
        if (st.made) { X.glow(c, g.cx, g.cy, g.zr * (0.5 + st.made * 0.15), 'rgba(160,200,255,.35)'); }
        c.restore();
        // 핵융합 자리
        c.strokeStyle = `rgba(255,255,255,${0.55 + 0.25 * Math.sin(t * 3)})`; c.lineWidth = 2.5; c.setLineDash([8, 6]); c.beginPath(); c.arc(g.cx, g.cy, g.zr, 0, 6.283); c.stroke(); c.setLineDash([]);
        X.pill(c, g.cx, g.cy - g.zr - 16, `핵융합 자리 · ${st.inZ.length}/4`, 'rgba(60,20,8,.85)', '#ffd84d', '700 15px');
        // 떠도는 수소 원자핵(빠르게 움직인다 = 뜨겁다)
        st.P.forEach((p, i) => {
          if (st.drag === p) return;
          if (!p.z) { p.a += p.w * dt * 1.6; p.x = g.cx + Math.cos(p.a) * p.d * g.R + Math.sin(t * 9 + p.j) * 4; p.y = g.cy + Math.sin(p.a) * p.d * g.R + Math.cos(t * 8 + p.j) * 4; }
          else { const k = st.inZ.indexOf(p), a = k / 4 * 6.283 + t * 2; p.x = g.cx + Math.cos(a) * g.zr * 0.45; p.y = g.cy + Math.sin(a) * g.zr * 0.45; }
          this.proton(c, p.x, p.y, X, p.z ? 1.1 : 1);
        });
        if (st.drag) this.proton(c, st.drag.x, st.drag.y, X, 1.2);
        // 핵융합 번쩍 + 헬륨 원자핵 + 빛 알갱이
        if (st.fx) {
          st.fx.k += dt; const k = st.fx.k;
          if (k < 0.5) X.glow(c, g.cx, g.cy, g.zr * (1 + k * 4), `rgba(255,255,230,${0.9 - k * 1.6})`);
          this.he(c, g.cx, g.cy, X, Math.min(1, k * 2));
          if (k > 1.6) st.fx = null;
        }
        st.ph = st.ph.filter((q) => (q.k += dt * 0.55) < 1);
        st.ph.forEach((q) => { const d = g.zr + q.k * (g.R * 1.3 - g.zr), x = g.cx + Math.cos(q.a) * d, y = g.cy + Math.sin(q.a) * d; c.strokeStyle = `rgba(255,240,150,${1 - q.k})`; c.lineWidth = 2.5; c.beginPath(); for (let s = 0; s < 18; s++) { const dd = d - s * 3, w = Math.sin(s * 1.4 + t * 20) * 4; (s ? c.lineTo : c.moveTo).call(c, g.cx + Math.cos(q.a) * dd - Math.sin(q.a) * w, g.cy + Math.sin(q.a) * dd + Math.cos(q.a) * w); } c.stroke(); });
        X.txt(c, '태양 중심부 · 약 1000만 K 이상', g.cx, g.cy + g.R + 30, '#ffcf8a', '700 16px');
        // 오른쪽 위: 저울(반응 전 수소 원자핵 4개 ↔ 반응 뒤 헬륨 원자핵 1개)
        const sx = W * 0.79, sy = H * 0.3, on = st.made > 0, tilt = on ? -0.09 * Math.min(1, st.scale) : 0;
        X.txt(c, '반응 전과 뒤의 질량', sx, 34, '#fbfcf9', '800 18px');
        c.fillStyle = '#6b5a4a'; X.rr(c, sx - 60, sy + 120, 120, 16, 6); c.fill(); c.fillStyle = X.hgrad(c, sx - 8, sx + 8, ['#8f7b66', '#d8c3a5', '#8f7b66']); c.fillRect(sx - 7, sy, 14, 122);
        c.save(); c.translate(sx, sy); c.rotate(tilt);
        c.fillStyle = X.hgrad(c, -150, 150, ['#9a8a74', '#e9dcc4', '#9a8a74']); X.rr(c, -150, -6, 300, 12, 6); c.fill();
        [[-130, 1], [130, -1]].forEach(([px, sgn]) => {
          const yy = 70 + 0 * sgn; X.line(c, px, 0, px - 34, yy, '#bba98f', 1.5); X.line(c, px, 0, px + 34, yy, '#bba98f', 1.5);
          c.fillStyle = '#d9c9ad'; c.beginPath(); c.ellipse(px, yy, 46, 10, 0, 0, 6.283); c.fill();
          if (on) { if (px < 0) [[-22, -8], [-7, -12], [8, -8], [22, -12]].forEach(([u, v]) => this.proton(c, px + u, yy + v, X, 0.75)); else this.he(c, px, yy - 14, X, 0.8); }
        });
        c.restore();
        X.ball(c, sx, sy, 9, '#e7d3b1', '#8a7350');
        if (on) {
          X.txt(c, '수소 원자핵 4개', sx - 130, sy + 112, '#fbfcf9', '700 15px'); X.txt(c, '4.029', sx - 130, sy + 134 - 160 + 190, '#ffd84d', '800 20px');
          X.txt(c, '헬륨 원자핵 1개', sx + 130, sy + 112, '#fbfcf9', '700 15px'); X.txt(c, '4.002', sx + 130, sy + 164, '#a7c7ff', '800 20px');
          if (st.scale > 0.6) X.pill(c, sx, sy + 214, '질량이 약 0.7 % 줄었다 → 그만큼 빛 에너지', 'rgba(255,216,77,.95)', '#1d2433', '800 15px');
          else XK.tap(c, sx, sy + 40, t, '저울을 눌러 보자');
          st.scale += st.scale > 0 ? dt * 1.5 : 0;
        } else X.txt(c, '헬륨을 만들면 저울에 올라간다', sx, sy + 170, '#8e7f72', '600 15px');
        X.txt(c, '(단위: u, 원자 질량 단위)', sx, sy + 182, '#8e7f72', '600 13px');
        // 오른쪽 아래: 중심부 구성 막대
        const bx = W * 0.6, by = H - 84, bw = W * 0.37;
        X.txt(c, `만든 헬륨 원자핵 ${st.made}개 · 중심부 구성`, bx, by - 12, '#fbfcf9', '700 15px', 'left');
        const he = Math.min(0.6, 0.02 + st.made * 0.06); c.fillStyle = '#e4572e'; X.rr(c, bx, by, bw * (1 - he), 26, 6); c.fill(); c.fillStyle = '#7ea6e8'; c.fillRect(bx + bw * (1 - he), by, bw * he, 26);
        X.txt(c, '수소', bx + 10, by + 19, '#fff', '700 14px', 'left'); X.txt(c, '헬륨', bx + bw - 10, by + 19, '#10203d', '700 14px', 'right');
        X.txt(c, '헬륨이 쌓일수록 수소 연료는 줄어든다', bx, by + 50, '#ffcf8a', '600 14px', 'left');
      },
      proton(c, x, y, X, s = 1) { X.glow(c, x, y, 16 * s, 'rgba(255,120,90,.45)'); X.ball(c, x, y, 10 * s, '#e4572e', '#7a1f12', '#ffd2c2'); X.txt(c, '+', x, y + 5 * s, 'rgba(255,255,255,.9)', `800 ${Math.round(12 * s)}px`); },
      he(c, x, y, X, s = 1) { X.glow(c, x, y, 34 * s, 'rgba(160,200,255,.6)'); [[-1, -1, 1], [1, 1, 1], [1, -1, 0], [-1, 1, 0]].forEach(([u, v, p]) => X.ball(c, x + u * 8 * s, y + v * 8 * s, 10 * s, p ? '#e4572e' : '#9aa3b5', p ? '#7a1f12' : '#454c5c', p ? '#ffd2c2' : '#f2f4f8')); },
      put(st, api, p) {
        if (st.fx || st.inZ.length >= 4) return; p.z = true; st.inZ.push(p);
        if (st.inZ.length < 4) { api.say(`핵융합 자리에 수소 원자핵 <b>${st.inZ.length}</b>개. ${4 - st.inZ.length}개 더!`); return; }
        // 넷이 모이면 핵융합
        setTimeout(() => this.fuse(st, api), 450);
      },
      fuse(st, api) {
        st.P = st.P.filter((p) => !st.inZ.includes(p)); st.inZ = []; st.fx = { k: 0 }; st.made++;
        for (let i = 0; i < 4; i++) this.spawn(st, st.R);
        for (let i = 0; i < 10; i++) st.ph.push({ a: Math.random() * 6.283, k: -i * 0.05 });
        if (st.made === 1) { api.ok(1); api.say('번쩍! 수소 원자핵 4개가 합쳐져 <b>헬륨 원자핵 1개</b>가 되었다(양성자 2개는 중성자로 바뀐다). 에너지가 빛으로 나온다. 오른쪽 <b>저울</b>을 눌러 보자.'); api.chip('저울을 누르자'); }
        if (st.made >= 3 && api.has(2)) { api.ok(3); api.say(`헬륨 원자핵 <b>${st.made}</b>개 — 중심에 헬륨이 쌓이고 수소 연료가 줄어든다. 태양은 이렇게 약 46억 년째 빛나고 있다.`); api.chip('태양이 빛나는 까닭', true); }
        else if (st.made > 1) api.say(`헬륨 원자핵 ${st.made}개째. ${api.has(2) ? '세 개까지 만들어 보자.' : '저울도 눌러 보자.'}`);
      },
      weigh(st, api) { if (!st.made || st.scale > 0) return; st.scale = 0.01; api.ok(2); api.reveal(); api.say('반응 뒤 헬륨 원자핵(4.002)이 수소 원자핵 4개(4.029)보다 <b>조금 가볍다</b>. 줄어든 질량이 <b>에너지</b>로 바뀌어 별이 빛난다. 헬륨을 세 개까지 만들어 보자.'); },
      hint(st) { if (!st.W) return null; const g = this.geo(st.W, st.H), p = st.P[0]; return { x: p.x || g.cx + g.R * 0.7, y: p.y || g.cy, dx: g.cx - (p.x || g.cx + g.R * 0.7), dy: g.cy - (p.y || g.cy), dist: Math.max(40, Math.hypot(g.cx - (p.x || g.cx), g.cy - (p.y || g.cy)) - g.zr * 0.6), label: '가운데로' }; },
      down(p, st, api) {
        const g = this.geo(st.W, st.H);
        if (p.x > st.W * 0.6 && p.y < st.H * 0.62) { this.weigh(st, api); return; }
        let best = null, bd = 34; st.P.forEach((q) => { if (q.z) return; const d = Math.hypot(q.x - p.x, q.y - p.y); if (d < bd) { bd = d; best = q; } });
        if (best) { st.drag = best; best.x = p.x; best.y = p.y; }
      },
      move(p, st, api, held) { if (held && st.drag) { st.drag.x = p.x; st.drag.y = p.y; } },
      up(p, st, api) {
        const q = st.drag; st.drag = null; if (!q) return; const g = this.geo(st.W, st.H);
        if (Math.hypot(p.x - g.cx, p.y - g.cy) < g.zr * 1.2) this.put(st, api, q);
        else { q.a = Math.atan2(p.y - g.cy, p.x - g.cx); q.d = XK.clamp(Math.hypot(p.x - g.cx, p.y - g.cy) / g.R, 0.35, 0.95); }
      },
      key(k, st, api) { if (k === 'Enter') { const q = st.P.find((x) => !x.z); if (q) this.put(st, api, q); return true; } if (k === ' ' || k === 'w') { this.weigh(st, api); return true; } return false; },
      test(st, api, a) { if (a === 'scale') { this.weigh(st, api); st.scale = 1; return; } if (a === 'fuse') { while (st.inZ.length < 4) { const q = st.P.find((x) => !x.z); q.z = true; st.inZ.push(q); } this.fuse(st, api); return; } const q = st.P.find((x) => !x.z); if (q) { q.z = true; st.inZ.push(q); } },
    },
    // ── 2-1-2 1차시 생활 속 예 «지구에서 만드는 작은 태양»: 도넛 모양 핵융합 장치. 자기장으로 플라스마를 띄우고 가열해 핵융합 온도에 이른다 ──
    // 태양 중심 약 1500만 K(교과서: 1000만 K 이상이면 수소 핵융합), 장치는 약 1억 ℃ 이상 — 이해를 돕기 위한 어림. 실제 장치의 연료는 중수소·삼중수소
    sunlab: {
      init(st, api) { st.B = 0; st.T = 0; st.hit = 0; st.fz = 0; st.sp = []; api.say('예측을 고른 뒤, 왼쪽 <b>자기장</b> 손잡이를 올려 플라스마를 가운데에 띄우고, 오른쪽 <b>가열</b> 손잡이를 올려 보자.'); api.chip('자기장부터 켜자'); },
      geo(W, H) { return { cx: W * 0.5, cy: H * 0.42, R: Math.min(W * 0.3, H * 0.36), lx: 54, rx: W - 54, y0: H * 0.12, y1: H * 0.7 }; },
      draw(c, W, H, dt, st, api, X) {
        const g = this.geo(W, H), t = st.t, T = st.T * 2e8; // 0 ~ 2억 ℃
        X.vgrad(c, 0, 0, W, H, ['#1d2230', '#161a25', '#11141c']);
        // 바닥과 받침
        X.vgrad(c, 0, H * 0.8, W, H * 0.2, ['#2a2f3b', '#1f232c']); X.shadow(c, g.cx, H * 0.8, g.R * 1.3, 18, 0.45);
        // 도넛 모양 장치(토카막): 관을 따라 둥근 단면을 앞뒤 순서로 겹쳐 그린다. 용기는 속이 보이게 반투명
        const ry = 0.38, Rm = g.R * 0.66, A = g.R * 0.27, P = (ang, rad, up) => [g.cx + Math.cos(ang) * rad, g.cy + Math.sin(ang) * rad * ry - up];
        const off = (1 - st.B) * A * 0.55 * Math.sin(t * 3.2); // 자기장이 약하면 플라스마가 출렁여 벽에 닿는다
        const pc = T < 1e6 ? [110, 120, 170] : T < 5e7 ? [255, 120, 200] : [255, 205, 240], pa = Math.min(1, 0.25 + T / 1e8);
        // 받침 기둥
        [[-0.75, 0.9], [0.75, 0.9], [-0.35, 1.25], [0.35, 1.25]].forEach(([u, v]) => { const x = g.cx + u * Rm, y = g.cy + v * A + A * 0.4; c.fillStyle = X.hgrad(c, x - 9, x + 9, ['#3a404c', '#7d8594', '#2e333d']); c.fillRect(x - 9, y, 18, H * 0.8 - y); });
        // 가운데 기둥 자석(중심 코일)
        c.fillStyle = X.hgrad(c, g.cx - A * 0.45, g.cx + A * 0.45, ['#7a4a1c', '#e0a060', '#b0702e', '#6a3e16']); c.fillRect(g.cx - A * 0.45, g.cy - A * 1.5, A * 0.9, A * 3);
        c.fillStyle = '#e8b072'; c.beginPath(); c.ellipse(g.cx, g.cy - A * 1.5, A * 0.45, A * 0.45 * ry, 0, 0, 6.283); c.fill();
        for (let k = 0; k < 7; k++) X.line(c, g.cx - A * 0.45, g.cy - A * 1.3 + k * A * 0.4, g.cx + A * 0.45, g.cy - A * 1.2 + k * A * 0.4, 'rgba(90,50,15,.5)', 1.5);
        const N = 48, seg = [];
        for (let k = 0; k < N; k++) { const ang = k / N * 6.283; seg.push({ ang, z: Math.sin(ang), coil: k % 4 === 0 }); }
        const tube = (sg) => {
          const [x, y] = P(sg.ang, Rm, 0), gr = c.createRadialGradient(x - A * 0.3, y - A * 0.45, A * 0.1, x, y, A * 1.05);
          gr.addColorStop(0, 'rgba(235,240,250,.22)'); gr.addColorStop(0.6, 'rgba(150,160,180,.08)'); gr.addColorStop(0.92, 'rgba(120,130,150,.22)'); gr.addColorStop(1, 'rgba(200,210,225,.35)');
          c.fillStyle = gr; c.beginPath(); c.ellipse(x, y, A, A * 1.02, 0, 0, 6.283); c.fill();
        };
        const coil = (sg) => { // 관을 감싼 D자 고리
          const ca = Math.cos(sg.ang), sa = Math.sin(sg.ang), front = sa > 0;
          c.beginPath(); for (let q = 0; q <= 40; q++) { const th = q / 40 * 6.283, rr = Rm + Math.cos(th) * A * 1.25, up = Math.sin(th) * A * 1.4; const x = g.cx + ca * rr, y = g.cy + sa * rr * ry - up; (q ? c.lineTo : c.moveTo).call(c, x, y); }
          c.closePath(); c.lineWidth = 9; c.strokeStyle = front ? '#c47a32' : '#7d4a1d'; c.stroke(); c.lineWidth = 3; c.strokeStyle = front ? '#f0bf86' : '#a06a34'; c.stroke();
          if (st.B > 0.05) { c.lineWidth = 12; c.strokeStyle = `rgba(110,195,255,${0.32 * st.B})`; c.stroke(); }
        };
        const plasma = (from, to) => {
          c.save(); c.globalCompositeOperation = 'lighter';
          for (let w = 0; w < 3; w++) { c.strokeStyle = X.rgba(pc, (0.28 - w * 0.07) * pa); c.lineWidth = A * (0.25 + w * 0.22) * (0.55 + st.B * 0.45); c.beginPath(); for (let q = 0; q <= 36; q++) { const ang = from + (to - from) * q / 36, [x, y] = P(ang, Rm + off * Math.cos(ang * 3), 0); (q ? c.lineTo : c.moveTo).call(c, x, y); } c.stroke(); }
          for (let q = 0; q < 24; q++) { const ang = from + ((q / 24 + t * (0.08 + T / 6e8)) % 1) * (to - from), [x, y] = P(ang, Rm + off * Math.cos(ang * 3) + Math.sin(q * 3.7 + t * 6) * A * 0.12, Math.cos(q * 2.1 + t * 5) * A * 0.12); X.glow(c, x, y, 5, X.rgba(pc, 0.8 * pa)); }
          c.restore();
        };
        const rim = (rad, upk, col, w) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); for (let q = 0; q <= 72; q++) { const [x, y] = P(q / 72 * 6.283, rad, upk); (q ? c.lineTo : c.moveTo).call(c, x, y); } c.stroke(); };
        rim(Rm + A, 0, 'rgba(200,210,230,.45)', 2); rim(Rm - A, 0, 'rgba(200,210,230,.3)', 1.5); rim(Rm, A, 'rgba(230,236,248,.5)', 2); rim(Rm, -A, 'rgba(120,130,150,.35)', 1.5);
        seg.filter((sg) => sg.z <= 0).sort((p1, p2) => p1.z - p2.z).forEach((sg) => { tube(sg); if (sg.coil) coil(sg); });
        plasma(Math.PI, 2 * Math.PI);
        plasma(0, Math.PI);
        seg.filter((sg) => sg.z > 0).sort((p1, p2) => p1.z - p2.z).forEach((sg) => { tube(sg); if (sg.coil) coil(sg); });
        // 핵융합 번쩍(1억 ℃ 이상 + 자기장 충분)
        if (T >= 1e8 && st.B > 0.7) { st.fz += dt; if (Math.random() < dt * 14) st.sp.push({ a: Math.random() * 6.283, k: 0 }); }
        st.sp = st.sp.filter((sp) => (sp.k += dt * 2) < 1); c.save(); c.globalCompositeOperation = 'lighter'; st.sp.forEach((sp) => { const [x, y] = P(sp.a, Rm, 0); X.glow(c, x, y, 10 + sp.k * 34, `rgba(255,255,200,${1 - sp.k})`); }); c.restore();
        // 이름표
        const lab = (x1, y1, x2, y2, s2, col) => { X.line(c, x1, y1, x2, y2, 'rgba(255,255,255,.55)', 1.5); X.pill(c, x2, y2, s2, 'rgba(29,36,51,.9)', col, '700 14px'); };
        const [kx, ky] = P(-0.5, Rm + A * 1.3, A * 0.6); lab(kx, ky, kx - 70, g.cy - A * 2.4, '자석 코일', '#f0bf86');
        const [vx, vy] = P(0.35, Rm + A, 0); lab(vx, vy, Math.min(W - 160, vx + 70), g.cy + A * 1.9, '진공 용기(속이 보이게)', '#c9d0de');
        const [qx, qy] = P(2.2, Rm, 0); lab(qx, qy, qx - 40, g.cy + A * 2.7, '플라스마', X.rgba(pc));
        lab(g.cx, g.cy - A * 1.5, g.cx + 10, g.cy - A * 3.0, '중심 기둥 자석', '#e8b072');
        // 시도 기록(쌓인다)
        st.log = st.log || [];
        X.txt(c, '시도 기록', W * 0.18, 30, '#aab4cf', '700 14px', 'left');
        st.log.forEach((r, k) => X.pill(c, W * 0.18 + 120 + k * 150, 25, r, r.startsWith('성공') ? 'rgba(47,158,98,.9)' : 'rgba(200,60,40,.85)', '#fff', '700 13px'));
        // 벽에 닿음(자기장 약할 때 뜨거우면)
        if (st.B < 0.5 && T > 2e7) { if (st.hit < 0.5 && st.log.length < 4) st.log.push(`벽에 닿음 · ${Math.round(T / 1e6) * 100}만 ℃`); st.T = Math.max(0, st.T - dt * 0.35); st.hit = 1; } st.hit = Math.max(0, st.hit - dt);
        if (st.hit > 0.3) X.pill(c, g.cx, g.cy - g.R * 0.62, '플라스마가 벽에 닿아 식는다!', 'rgba(200,60,40,.92)', '#fff', '700 16px');
        // 왼쪽: 자기장 손잡이, 오른쪽: 가열 손잡이
        [[g.lx, st.B, '자기장', '#6fc3ff'], [g.rx, st.T, '가열', '#ff8a5a']].forEach(([x, v, lab, col]) => {
          c.fillStyle = 'rgba(255,255,255,.1)'; X.rr(c, x - 9, g.y0, 18, g.y1 - g.y0, 9); c.fill();
          c.fillStyle = col; X.rr(c, x - 6, XK.lerp(g.y1, g.y0, v), 12, (g.y1 - g.y0) * v + 2, 6); c.fill();
          X.ball(c, x, XK.lerp(g.y1, g.y0, v), 15, col, '#333'); X.txt(c, lab, x, g.y0 - 14, col, '800 16px');
        });
        X.txt(c, `${Math.round(st.B * 100)} %`, g.lx, g.y1 + 26, '#6fc3ff', '700 15px');
        // 온도 막대(가로): 0 ~ 2억 ℃, 태양 중심과 견주기
        const bx = 120, bw = W - 240, by = H * 0.86, X0 = (v) => bx + v / 2e8 * bw;
        X.txt(c, '플라스마 온도', bx, by - 22, '#fbfcf9', '700 15px', 'left');
        c.fillStyle = 'rgba(255,255,255,.1)'; X.rr(c, bx, by - 10, bw, 20, 10); c.fill();
        const tg = c.createLinearGradient(bx, 0, bx + bw, 0); tg.addColorStop(0, '#6a5acd'); tg.addColorStop(0.5, '#ff6aa0'); tg.addColorStop(1, '#fff0f8'); c.fillStyle = tg; X.rr(c, bx, by - 10, Math.max(20, X0(T) - bx), 20, 10); c.fill();
        const sun = X0(1.5e7); X.line(c, sun, by - 16, sun, by + 16, '#ffd84d', 3); X.txt(c, '태양 중심 약 1500만 K', sun, by + 34, '#ffd84d', '700 14px');
        const goal = X0(1e8); X.line(c, goal, by - 16, goal, by + 16, '#ff9fd0', 3); X.txt(c, '장치 핵융합 약 1억 ℃', goal, by + 34, '#ff9fd0', '700 14px');
        X.txt(c, T < 1e4 ? '차갑다' : `약 ${(T / 1e4 >= 10000 ? (T / 1e8).toFixed(1) + '억' : Math.round(T / 1e4).toLocaleString('ko-KR') + '만')} ℃`, W - 120, by - 22, '#fbfcf9', '800 17px', 'right');
        // 단계
        if (st.B > 0.7 && !api.has(1)) { api.ok(1); api.say('자기장이 세지자 플라스마 고리가 벽에 닿지 않고 <b>가운데에 떠</b> 돈다. 이제 오른쪽 손잡이로 <b>가열</b>하자.'); api.chip('가열하자'); }
        if (api.has(1) && T > 1.5e7 && !api.has(2) && st.B > 0.7) { api.ok(2); api.say('태양 중심 온도(약 1500만 K)를 넘었다. 그런데 아직 핵융합이 잘 일어나지 않는다 — 더 올려 보자.'); }
        if (st.fz > 1 && !api.has(3)) { if (st.log.length > 3) st.log.shift(); st.log.push(`성공 · 약 ${(T / 1e8).toFixed(1)}억 ℃`); api.ok(3); api.reveal(); api.say('약 <b>1억 ℃</b>를 넘기자 번쩍번쩍 핵융합! 태양 중심은 엄청난 <b>중력</b>으로 눌려 있어 1000만 K대에서도 되지만, 지구에서는 그만큼 누를 수 없어 <b>훨씬 더 뜨겁게</b> 해야 한다.'); api.chip('작은 태양이 켜졌다', true); }
      },
      hint(st) { if (!st.W) return null; const g = this.geo(st.W, st.H); return { x: g.lx, y: g.y1 - 10, dx: 0, dy: -1, dist: 140, label: '' }; },
      down(p, st) { const g = this.geo(st.W, st.H); st.which = p.x < st.W / 2 ? 'B' : 'T'; st.yy = p.y; st.v0 = st[st.which]; },
      move(p, st, api, held) { if (!held) return; const g = this.geo(st.W, st.H); st[st.which] = XK.clamp(st.v0 - (p.y - st.yy) / (g.y1 - g.y0), 0, 1); },
      key(k, st) { const d = { ArrowUp: ['T', 0.05], ArrowDown: ['T', -0.05], ArrowRight: ['B', 0.1], ArrowLeft: ['B', -0.1] }[k]; if (!d) return false; st[d[0]] = XK.clamp(st[d[0]] + d[1], 0, 1); return true; },
      test(st, api, B, T, fz) { st.B = B; st.T = T; if (fz) st.fz = fz; },
    },
    // ── 2-1-2 2차시 «반지 속 금의 고향 찾기»: 반지(또는 연필심)를 끌어 시간을 거슬러 가며 그 원자가 처음 생긴 곳을 찾는다 (교과서 55~58쪽) ──
    // 금: 초신성 폭발에서(교과서) · 탄소: 별 중심 헬륨 핵융합(1억 K 이상). 금광 생성 시기 등은 대략
    gold: {
      T: {
        gold: { n: '금반지', born: 4, S: [['지금', '손가락의 금반지'], ['수억 년 전', '땅속 바위의 금 광맥'], ['약 46억 년 전', '미행성체가 부딪쳐 커지는 원시 지구'], ['약 50억 년 전', '태양계 성운 속 티끌'], ['그보다 전', '무거운 별의 초신성 폭발'], ['더 전', '무거운 별의 중심(철까지)']] },
        carbon: { n: '연필심', born: 5, S: [['지금', '연필심의 흑연(탄소)'], ['수억 년 전', '땅속의 흑연 광맥'], ['약 46억 년 전', '미행성체가 부딪쳐 커지는 원시 지구'], ['약 50억 년 전', '태양계 성운 속 티끌'], ['그보다 전', '늙은 별이 내뿜은 기체'], ['더 전', '별 중심의 헬륨 핵융합(1억 K)']] },
      },
      init(st, api) { st.tok = 'gold'; st.a = 0; st.seen = { gold: [0], carbon: [0] }; st.burst = 0; api.say('예측을 고른 뒤, 아래 시간 줄의 <b>반지</b>를 왼쪽으로 끌어 시간을 거슬러 가 보자.'); api.chip('반지를 왼쪽으로 끌자'); },
      geo(W, H) { return { x0: W - 70, x1: 70, ty: H - 70, wy: 20, wh: H - 140 }; },
      sx(g, i) { return XK.lerp(g.x0, g.x1, i / 5); },
      scene(c, k, tok, x, y, w, h, t, X, st) {
        c.save(); X.rr(c, x, y, w, h, 16); c.clip();
        const cx = x + w / 2, cy = y + h / 2, gold = tok === 'gold';
        if (k === 0) { // 지금: 반지 또는 연필
          X.vgrad(c, x, y, w, h, ['#3a2030', '#24131d']); X.glow(c, cx, cy, h * 0.6, 'rgba(255,220,180,.18)');
          if (gold) { X.shadow(c, cx, cy + h * 0.2, 150, 22, 0.45); c.lineWidth = 34; const gr = c.createLinearGradient(cx - 120, cy - 60, cx + 120, cy + 60); gr.addColorStop(0, '#7a5410'); gr.addColorStop(0.3, '#ffe28a'); gr.addColorStop(0.55, '#d79a1e'); gr.addColorStop(0.8, '#fff2c0'); gr.addColorStop(1, '#8a5d12'); c.strokeStyle = gr; c.beginPath(); c.ellipse(cx, cy, 120, 52, 0, 0, 6.283); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 4; c.beginPath(); c.ellipse(cx, cy - 6, 116, 46, 0, Math.PI * 1.1, Math.PI * 1.6); c.stroke(); for (let i = 0; i < 3; i++) { const a = t * 1.3 + i * 2.1; X.glow(c, cx + Math.cos(a) * 120, cy + Math.sin(a) * 52, 14, 'rgba(255,255,255,.8)'); } }
          else { c.save(); c.translate(cx, cy); c.rotate(-0.25); c.fillStyle = '#f2c230'; c.fillRect(-180, -20, 300, 40); c.fillStyle = '#e0a91a'; c.fillRect(-180, 6, 300, 14); c.fillStyle = '#c7a37a'; c.beginPath(); c.moveTo(120, -20); c.lineTo(190, 0); c.lineTo(120, 20); c.fill(); c.fillStyle = '#2b2b30'; c.beginPath(); c.moveTo(170, -6); c.lineTo(190, 0); c.lineTo(170, 6); c.fill(); c.fillStyle = '#e88a9a'; c.fillRect(-220, -20, 40, 40); c.fillStyle = '#b9bcc4'; c.fillRect(-190, -21, 14, 42); c.restore(); X.txt(c, '연필심 = 흑연(탄소)', cx + 60, cy + 90, '#e8d9c4', '700 18px'); }
        } else if (k === 1) { // 땅속 광맥
          X.vgrad(c, x, y, w, h, ['#5a4636', '#3d2f24', '#2b2119']); const R = X.rnd(3);
          for (let i = 0; i < 70; i++) { c.fillStyle = `rgba(${90 + R() * 60},${70 + R() * 40},${50 + R() * 30},.6)`; c.beginPath(); c.ellipse(x + R() * w, y + R() * h, 14 + R() * 30, 8 + R() * 16, R() * 3, 0, 6.283); c.fill(); }
          c.strokeStyle = gold ? '#ffd24a' : '#3a3d45'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + w * 0.1, y + h * 0.7); c.bezierCurveTo(x + w * 0.3, y + h * 0.4, x + w * 0.55, y + h * 0.8, x + w * 0.9, y + h * 0.3); c.stroke();
          if (gold) for (let i = 0; i < 8; i++) X.glow(c, x + w * (0.15 + i * 0.1), y + h * (0.6 - 0.3 * Math.sin(i)), 10 + 4 * Math.sin(t * 3 + i), 'rgba(255,230,120,.7)');
        } else if (k === 2) { // 원시 지구
          X.vgrad(c, x, y, w, h, ['#05060f', '#0d1020']); X.stars(c, w, h, t, 60, 5);
          X.glow(c, cx, cy, 170, 'rgba(255,90,30,.35)'); X.ball(c, cx, cy, 110, '#e8541c', '#5a1405', '#ffd27a');
          c.save(); c.beginPath(); c.arc(cx, cy, 110, 0, 6.283); c.clip(); for (let i = 0; i < 9; i++) { c.strokeStyle = 'rgba(40,10,5,.55)'; c.lineWidth = 6; c.beginPath(); c.arc(cx + Math.sin(i * 2) * 60, cy + Math.cos(i * 3) * 60, 30 + i * 4, i, i + 1.6); c.stroke(); } c.restore();
          for (let i = 0; i < 4; i++) { const k2 = (t * 0.3 + i / 4) % 1, a = i * 1.7, d = 300 - k2 * 190; X.ball(c, cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.7, 12, '#8d8070', '#3a3028'); if (k2 > 0.95) X.glow(c, cx + Math.cos(a) * 110, cy + Math.sin(a) * 77, 40, 'rgba(255,220,120,.8)'); }
        } else if (k === 3) { // 태양계 성운
          X.vgrad(c, x, y, w, h, ['#070814', '#120e26']); X.stars(c, w, h, t, 60, 6);
          X.glow(c, cx, cy, 70, 'rgba(255,214,110,.8)');
          for (let i = 0; i < 160; i++) { const d = 40 + (i * 37 % 200), a = i * 2.4 + t * 60 / d; X.glow(c, cx + Math.cos(a) * d * 1.4, cy + Math.sin(a) * d * 0.35, 3 + (i % 3), i % 23 === 0 ? (gold ? 'rgba(255,215,80,1)' : 'rgba(220,220,230,1)') : 'rgba(200,190,240,.55)'); }
        } else if (k === 4) { // 초신성 폭발 또는 늙은 별의 기체 껍질
          X.vgrad(c, x, y, w, h, ['#03040a', '#0b0a18']); X.stars(c, w, h, t, 50, 7);
          if (gold) { const p = (t * 0.35) % 1; X.glow(c, cx, cy, 60 + p * 260, `rgba(255,255,230,${0.9 - p * 0.8})`); for (let k2 = 0; k2 < 2; k2++) { c.strokeStyle = `rgba(${k2 ? '120,180,255' : '255,140,80'},${0.6 * (1 - p)})`; c.lineWidth = 10 - k2 * 4; c.beginPath(); c.ellipse(cx, cy, (60 + p * 240) * (1 + k2 * 0.12), (60 + p * 240) * 0.8 * (1 + k2 * 0.12), 0, 0, 6.283); c.stroke(); } X.ball(c, cx, cy, 8, '#fff', '#9fb8ff'); for (let i = 0; i < 60; i++) { const a = i / 60 * 6.283 + Math.sin(i) * 0.1, d = 30 + p * (200 + (i % 7) * 20); const el = ['Au', 'Ag', 'U', 'Fe', 'Si', 'O'][i % 6], show = st && st.found; X.glow(c, cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.8, 6, el === 'Au' && show ? 'rgba(255,210,60,1)' : 'rgba(180,200,255,.9)'); if (show && i % 6 === 0 && p > 0.25) X.txt(c, '금', cx + Math.cos(a) * d + 10, cy + Math.sin(a) * d * 0.8 - 8, '#ffd84d', '800 13px', 'left'); } }
          else { for (let k2 = 0; k2 < 3; k2++) { c.strokeStyle = ['rgba(90,200,190,.5)', 'rgba(230,110,140,.45)', 'rgba(255,200,120,.4)'][k2]; c.lineWidth = 22 - k2 * 5; c.beginPath(); c.ellipse(cx, cy, 120 + k2 * 30 + Math.sin(t) * 4, 90 + k2 * 24, 0.3, 0, 6.283); c.stroke(); } X.ball(c, cx, cy, 10, '#ffffff', '#9fb8ff'); for (let i = 0; i < 24; i++) { const a = i * 0.26 + t * 0.2, d = 150 + (i % 4) * 22; X.glow(c, cx + Math.cos(a) * d, cy + Math.sin(a) * d * 0.75, 4, 'rgba(230,230,240,.9)'); } X.txt(c, '탄소가 우주로 흩어진다', cx, y + h - 20, '#e0e6f5', '700 15px'); }
        } else { // 별 중심
          X.vgrad(c, x, y, w, h, ['#140808', '#200c0a']);
          const layers = gold ? [['수소', '#ff8a4a'], ['헬륨', '#ffb35a'], ['탄소', '#ffd27a'], ['산소·네온', '#f6e08a'], ['규소·황', '#c9e08a'], ['철', '#8a8f9a']] : [['수소', '#ff8a4a'], ['헬륨', '#ffc46a'], ['탄소', '#fff0b0']];
          const R0 = Math.min(w, h) * 0.46; layers.forEach(([n, col], i) => { const r = R0 * (1 - i / layers.length); X.ball(c, cx, cy, r, col, col, '#fff'); X.txt(c, n, cx + r - (R0 / layers.length) / 2, cy + 5 + (layers.length > 3 ? (i % 2 ? -14 : 14) : 0), '#2b1a10', '700 14px'); });   // 껍질이 얇으면 이름을 위아래로 엇갈려 붙지 않게
          const core = R0 / layers.length; X.glow(c, cx, cy, core * 1.6 + 6 * Math.sin(t * 6), gold ? 'rgba(140,150,170,.5)' : 'rgba(255,255,220,.8)');
          if (gold) X.pill(c, cx, y + 32, '핵융합은 철에서 멈춘다 — 금은 아직 없다', 'rgba(29,36,51,.9)', '#ff9f6b', '700 15px'); else X.pill(c, cx, y + 32, '중심 1억 K 이상: 헬륨 핵융합 → 탄소', 'rgba(29,36,51,.9)', '#ffd84d', '700 15px');
        }
        c.restore();
      },
      draw(c, W, H, dt, st, api, X) {
        const g = this.geo(W, H), t = st.t, T = this.T[st.tok], k = Math.round(st.a), sw = W - 40;
        X.vgrad(c, 0, 0, W, H, ['#151a28', '#10141f']);
        // 위 장면 창(가까운 두 단계를 겹쳐 보여 준다)
        const k0 = Math.floor(st.a), k1 = Math.min(5, k0 + 1), f = st.a - k0;
        this.scene(c, k0, st.tok, 20, g.wy, sw, g.wh - 60, t, X, st);
        if (f > 0.01) { c.save(); c.globalAlpha = f; this.scene(c, k1, st.tok, 20, g.wy, sw, g.wh - 60, t, X, st); c.restore(); }
        c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 2; X.rr(c, 20, g.wy, sw, g.wh - 60, 16); c.stroke();
        const [when, what] = T.S[k]; X.pill(c, 20 + sw / 2, g.wy + g.wh - 32, `${when} · ${what}`, 'rgba(29,36,51,.95)', '#fbfcf9', '800 18px');
        if (k === T.born && (st.tok === 'carbon' || st.found)) { st.burst += dt; const p = Math.min(1, st.burst * 2); X.pill(c, W - 150, g.wy + 40, `${st.tok === 'gold' ? '금이' : '탄소가'} 여기서 생겼다!`, `rgba(255,216,77,${0.95 * p})`, '#1d2433', '800 18px'); } else st.burst = 0;
        // 토큰 바꾸기 칩(왼쪽 위)
        [['gold', '금반지'], ['carbon', '연필심']].forEach(([id, n], i) => { const x = 40 + i * 110, y = g.wy + 26, on = st.tok === id; c.fillStyle = on ? '#ffd84d' : 'rgba(29,36,51,.8)'; X.rr(c, x, y - 17, 100, 34, 17); c.fill(); X.txt(c, n, x + 50, y + 6, on ? '#1d2433' : '#fbfcf9', '700 16px'); });
        // 아래 시간 줄(오른쪽 = 지금, 왼쪽 = 옛날)
        X.line(c, g.x1, g.ty, g.x0, g.ty, 'rgba(220,226,240,.35)', 4); X.line(c, this.sx(g, st.a), g.ty, g.x0, g.ty, '#ffd84d', 4);
        T.S.forEach(([w2], i) => { const x = this.sx(g, i), seen = st.seen[st.tok].includes(i); const hit = i === T.born && seen && (st.tok === 'carbon' || st.found); X.ball(c, x, g.ty, hit ? 11 : 8, seen ? (hit ? '#ffd84d' : '#fbfcf9') : '#5b6478', '#333'); X.txt(c, w2, x, g.ty + 32, seen ? '#fbfcf9' : '#6f7893', '700 14px'); });
        X.txt(c, '← 옛날', g.x1 - 10, g.ty - 18, '#aab4cf', '700 14px', 'left'); X.txt(c, '지금', g.x0, g.ty - 18, '#aab4cf', '700 14px');
        // 손잡이: 반지 또는 연필 아이콘
        const hx = this.sx(g, st.a); X.glow(c, hx, g.ty, 30, 'rgba(255,216,77,.35)');
        if (st.tok === 'gold') { c.strokeStyle = '#ffd24a'; c.lineWidth = 7; c.beginPath(); c.ellipse(hx, g.ty, 16, 9, 0, 0, 6.283); c.stroke(); } else { c.save(); c.translate(hx, g.ty); c.rotate(-0.6); c.fillStyle = '#f2c230'; c.fillRect(-18, -5, 30, 10); c.fillStyle = '#2b2b30'; c.beginPath(); c.moveTo(12, -5); c.lineTo(22, 0); c.lineTo(12, 5); c.fill(); c.restore(); }
        // 단계 기록: 손을 떼고 멈춘 칸이 바뀔 때마다 한 번
        if (st.touched && !st.held && Math.abs(st.a - k) < 0.02 && st.last !== st.tok + k) {
          st.last = st.tok + k; if (!st.seen[st.tok].includes(k)) st.seen[st.tok].push(k);
          if (st.tok === 'gold' && st.seen.gold.length >= 3) api.ok(1);
          if (st.tok === 'gold' && k === 4 && !st.found && !st.seen.gold.includes(5)) api.say('초신성 폭발 — 별이 터지며 여러 원소가 우주로 흩어진다. 이 원소들은 터지기 <b>전에</b> 이미 별 속에 있었을까? 한 칸 더 거슬러 가 이 별의 <b>중심</b>을 보자.');
          else if (st.tok === 'gold' && k === 4 && !st.found) { st.found = true; api.ok(1); api.ok(2); api.reveal(); api.say('중심의 핵융합은 <b>철</b>에서 멈췄으니, 금은 바로 이 <b>초신성 폭발</b> 때 생겼다! 철보다 무거운 금·은·우라늄은 폭발의 엄청난 에너지로 만들어진다. 이제 왼쪽 위 <b>연필심</b>을 눌러 탄소도 따라가 보자.'); api.chip('연필심을 눌러 보자'); }
          else if (st.tok === 'gold' && k === 5) api.say(st.found ? '무거운 별의 중심 — 핵융합은 철까지만. 금은 그다음 초신성 폭발에서 생겼다.' : '무거운 별의 중심 — 핵융합은 <b>철</b>까지만 일어난다. 여기에는 아직 <b>금이 없다</b>. 그렇다면 금은 언제 생겼을까? 한 칸 오른쪽으로 돌아가 보자.');
          else if (st.tok === 'carbon' && k === 5) { api.ok(3); api.say('탄소는 별 중심이 1억 K 이상일 때 <b>헬륨 핵융합</b>으로 생긴다(태양 정도 별에서도). 내 몸의 탄소도, 반지의 금도 <b>별에서 온 원소</b>다.'); api.chip('원소의 고향을 찾았다', true); }
          else api.say(`<b>${T.S[k][0]}</b>: ${T.S[k][1]}. ${k < 4 ? '더 거슬러 가 보자.' : ''}`);
        }
      },
      hint(st) { if (!st.W) return null; const g = this.geo(st.W, st.H); return { x: g.x0, y: g.ty, dx: -1, dy: 0, dist: 180, label: '왼쪽으로 = 옛날로' }; },
      down(p, st, api) {
        const g = this.geo(st.W, st.H);
        if (p.y < g.wy + 46 && p.x < 260) { const tok = p.x < 145 ? 'gold' : 'carbon'; if (tok !== st.tok) { st.tok = tok; st.a = 0; api.say(tok === 'carbon' ? '연필심의 탄소는 어디서 왔을까? 다시 왼쪽으로 끌어 보자.' : '금반지로 돌아왔다.'); api.chip(tok === 'carbon' ? '연필심을 왼쪽으로 끌자' : '반지를 왼쪽으로 끌자'); } return; }
        st.held = true; st.x0 = p.x; st.a0 = st.a;
      },
      move(p, st, api, held) { if (held && st.held) { const g = this.geo(st.W, st.H); st.a = XK.clamp(st.a0 - (p.x - st.x0) / (g.x0 - g.x1) * 5, 0, 5); } },
      up(p, st) { st.held = false; st.a = Math.round(st.a); },
      key(k, st, api) { const d = { ArrowLeft: 1, ArrowRight: -1 }[k]; if (d) { st.a = XK.clamp(Math.round(st.a) + d, 0, 5); return true; } if (k === 'c') { this.down({ x: 200, y: 20 }, st, api); return true; } return false; },
      test(st, api, tok, a) { if (tok !== st.tok) this.down({ x: tok === 'gold' ? 60 : 200, y: 30 }, st, api); st.a = a; },
    },
    // ── 2-1-2 3차시 «우주 달력»: 138억 년을 1년으로 줄인 달력에서 날짜 손잡이를 끌어 우주·지구·생명의 사건을 찾는다 (교과서 58쪽: 지구와 생명의 역사는 우주 역사의 일부) ──
    // 날짜 = (138억 년 − 몇 년 전) ÷ 138억 년 × 365일. 사건 시기는 어림
    cosmocal: {
      EV: [
        { ago: 13.8e9, n: '빅뱅', c: '#ffd84d', k: 'bang' },
        { ago: 13.8e9 - 3.8e5, n: '원자 · 우주 배경 복사', c: '#ff9f6b', k: 'cmb' },
        { ago: 13.6e9, n: '첫 별과 은하', c: '#a7c7ff', k: 'star' },
        { ago: 4.6e9, n: '태양계와 지구', c: '#ffb347', k: 'sun' },
        { ago: 3.8e9, n: '바다에서 첫 생명', c: '#7fe3a0', k: 'life' },
        { ago: 6.6e7, n: '공룡이 사라짐', c: '#c9a27a', k: 'dino' },
        { ago: 3e5, n: '지금의 사람(현생 인류)', c: '#ff8ab0', k: 'human' },
      ],
      day(ago) { return (13.8e9 - ago) / 13.8e9 * 365; },
      ds(d) { const M = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; let m = 0, x = d; while (m < 11 && x >= M[m]) { x -= M[m]; m++; } const dd = Math.floor(x) + 1, h = (x - Math.floor(x)) * 24; return { m: m + 1, d: Math.min(dd, M[m]), h: Math.floor(h), mi: Math.floor((h - Math.floor(h)) * 60) }; },
      init(st, api) { st.d = 0; st.got = [0]; st.zoom = 0; api.say('예측을 고른 뒤, 달력 아래 <b>날짜 손잡이</b>를 오른쪽으로 끌어 1월 1일(빅뱅)부터 날짜를 넘겨 보자.'); api.chip('손잡이를 오른쪽으로'); },
      geo(W, H) { return { x0: 40, x1: W - 40, gy: 46, gh: H * 0.47, by: H * 0.47 + 84 }; },
      icon(c, k, x, y, s, t, X) {
        if (k === 'bang') { X.glow(c, x, y, 30 * s, 'rgba(255,240,180,.9)'); for (let i = 0; i < 10; i++) { const a = i * 0.628 + t; X.line(c, x, y, x + Math.cos(a) * 26 * s, y + Math.sin(a) * 26 * s, 'rgba(255,216,77,.8)', 2); } }
        else if (k === 'cmb') { const R = X.rnd(4); for (let i = 0; i < 20; i++) { c.fillStyle = R() > 0.5 ? 'rgba(255,140,70,.6)' : 'rgba(90,140,255,.6)'; c.beginPath(); c.arc(x + (R() - 0.5) * 40 * s, y + (R() - 0.5) * 30 * s, 5 * s, 0, 6.283); c.fill(); } }
        else if (k === 'star') { X.glow(c, x, y, 26 * s, 'rgba(180,200,255,.5)'); c.save(); c.translate(x, y); c.scale(1, 0.45); for (let i = 0; i < 40; i++) { const r = i / 40 * 22 * s, a = (i % 2) * Math.PI + r * 0.25 + t * 0.2; c.fillStyle = 'rgba(220,230,255,.9)'; c.beginPath(); c.arc(Math.cos(a) * r, Math.sin(a) * r, 1.6 * s, 0, 6.283); c.fill(); } c.restore(); }
        else if (k === 'sun') { X.glow(c, x - 10 * s, y, 22 * s, 'rgba(255,200,80,.7)'); X.ball(c, x - 10 * s, y, 10 * s, '#ffd84d', '#f08a1c'); X.ball(c, x + 18 * s, y + 4 * s, 6 * s, '#3b82c4', '#123a66', '#cfe8ff'); }
        else if (k === 'life') { c.fillStyle = 'rgba(60,140,200,.6)'; c.beginPath(); c.ellipse(x, y + 6 * s, 28 * s, 10 * s, 0, 0, 6.283); c.fill(); for (let i = 0; i < 5; i++) { X.ball(c, x - 16 * s + i * 8 * s, y + Math.sin(t * 3 + i) * 3 * s, 4 * s, '#7fe3a0', '#2f7a50'); } }
        else if (k === 'dino') { c.fillStyle = '#8d6e4a'; c.beginPath(); c.ellipse(x, y, 16 * s, 9 * s, 0, 0, 6.283); c.fill(); c.lineWidth = 5 * s; c.strokeStyle = '#8d6e4a'; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + 12 * s, y - 4 * s); c.quadraticCurveTo(x + 22 * s, y - 22 * s, x + 26 * s, y - 20 * s); c.stroke(); c.beginPath(); c.moveTo(x - 14 * s, y); c.lineTo(x - 28 * s, y + 4 * s); c.stroke(); X.line(c, x - 6 * s, y + 6 * s, x - 6 * s, y + 16 * s, '#8d6e4a', 4 * s); X.line(c, x + 6 * s, y + 6 * s, x + 6 * s, y + 16 * s, '#8d6e4a', 4 * s); }
        else { c.fillStyle = '#ff8ab0'; c.beginPath(); c.arc(x, y - 12 * s, 6 * s, 0, 6.283); c.fill(); X.line(c, x, y - 6 * s, x, y + 8 * s, '#ff8ab0', 4 * s); X.line(c, x, y + 8 * s, x - 6 * s, y + 18 * s, '#ff8ab0', 3.5 * s); X.line(c, x, y + 8 * s, x + 6 * s, y + 18 * s, '#ff8ab0', 3.5 * s); X.line(c, x - 8 * s, y, x + 8 * s, y - 2 * s, '#ff8ab0', 3 * s); }
      },
      draw(c, W, H, dt, st, api, X) {
        const g = this.geo(W, H), t = st.t, MN = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'], ML = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        X.vgrad(c, 0, 0, W, H, ['#f8f5ec', '#efe9da']);
        // 달력 판(종이 느낌): 12달 칸
        c.fillStyle = '#fffdf6'; X.shadow(c, W / 2, g.gy + g.gh + 6, W * 0.46, 10, 0.12); X.rr(c, g.x0 - 10, g.gy - 30, g.x1 - g.x0 + 20, g.gh + 40, 14); c.fill(); c.strokeStyle = '#d8cfb8'; c.lineWidth = 2; c.stroke();
        for (let i = 0; i < 6; i++) { c.fillStyle = '#b9b0a0'; c.beginPath(); c.arc(g.x0 + 40 + i * (g.x1 - g.x0 - 80) / 5, g.gy - 30, 6, 0, 6.283); c.fill(); }
        X.txt(c, '우주 달력 · 138억 년 = 1년', g.x0 + 6, g.gy - 6, '#1d2433', '800 18px', 'left');
        const cw = (g.x1 - g.x0) / 6, ch = (g.gh - 20) / 2;
        let acc = 0; MN.forEach((m, i) => {
          const x = g.x0 + (i % 6) * cw, y = g.gy + 6 + Math.floor(i / 6) * ch, cur = st.d >= acc && st.d < acc + ML[i];
          c.fillStyle = cur ? 'rgba(255,216,77,.25)' : 'rgba(29,36,51,.03)'; X.rr(c, x + 4, y + 4, cw - 8, ch - 8, 8); c.fill(); c.strokeStyle = cur ? '#e0a91a' : '#e4dccb'; c.lineWidth = cur ? 2.5 : 1; c.stroke();
          X.txt(c, m, x + 14, y + 26, i === 11 ? '#c2185b' : '#5b6478', '800 16px', 'left');
          // 그 달의 사건 아이콘
          this.EV.forEach((e, j) => { const dd = this.day(e.ago); if (dd >= acc && dd < acc + ML[i] && st.got.includes(j)) { const k = this.EV.filter((q, jj) => jj < j && this.day(q.ago) >= acc && this.day(q.ago) < acc + ML[i] && st.got.includes(jj)).length; const n = this.EV.filter((q, jj) => this.day(q.ago) >= acc && this.day(q.ago) < acc + ML[i] && st.got.includes(jj)).length; this.icon(c, e.k, x + cw / 2 + (k - (n - 1) / 2) * Math.min(52, (cw - 20) / n), y + ch / 2 + 10 + (n > 2 ? (k % 2 ? 14 : -10) : 0), n > 2 ? 0.7 : 0.95, t, X); } });
          acc += ML[i];
        });
        // 날짜 손잡이 줄
        const bx = (d) => g.x0 + d / 365 * (g.x1 - g.x0), by = g.by;
        X.line(c, g.x0, by, g.x1, by, '#cfc6b2', 6); X.line(c, g.x0, by, bx(st.d), by, '#e0a91a', 6);
        this.EV.forEach((e, j) => { const x = bx(this.day(e.ago)); c.fillStyle = st.got.includes(j) ? e.c : '#cfc6b2'; c.beginPath(); c.arc(x, by, 6, 0, 6.283); c.fill(); });
        X.ball(c, bx(st.d), by, 14, '#ffd84d', '#b88a00');
        const D = this.ds(st.d); X.pill(c, XK.clamp(bx(st.d), 90, W - 90), by - 30, st.d >= 364.999 ? '12월 31일 밤 12시 = 지금' : `${D.m}월 ${D.d}일`, 'rgba(29,36,51,.92)', '#ffd84d', '800 16px');
        // 아래: 사건 카드(찾은 것이 쌓인다)
        const ky = by + 44, kw = (W - 40) / 4, kh = 86;
        this.EV.forEach((e, j) => {
          const col = j % 4, row = Math.floor(j / 4), x = 20 + col * kw, y = ky + row * (kh + 10), has = st.got.includes(j);
          c.fillStyle = has ? '#fff' : 'rgba(29,36,51,.04)'; X.rr(c, x + 4, y, kw - 8, kh, 10); c.fill(); c.strokeStyle = has ? e.c : '#ddd3bf'; c.lineWidth = has ? 3 : 1; c.stroke();
          if (!has) { X.txt(c, '?', x + kw / 2, y + kh / 2 + 8, '#b9b0a0', '800 22px'); return; }
          const q = this.ds(this.day(e.ago)); this.icon(c, e.k, x + 34, y + kh / 2, 0.7, t, X);
          X.txt(c, e.n, x + 64, y + 30, '#1d2433', '800 15px', 'left');
          X.txt(c, j === 0 ? '1월 1일 0시' : q.m === 12 && q.d === 31 ? `12월 31일 ${q.h}시 ${q.mi}분` : j === 1 ? `1월 1일 0시 ${q.mi}분` : `${q.m}월 ${q.d}일 무렵`, x + 64, y + 56, '#c2185b', '700 15px', 'left');
        });
        // 12월 31일 확대(마지막 하루 24시간)
        if (st.d > 364) {
          const zx = 20 + 3 * kw + 4, zy = ky + kh + 10, zw = kw - 8, zh = kh;
          c.fillStyle = '#1d2433'; X.rr(c, zx, zy, zw, zh, 10); c.fill();
          X.txt(c, '12월 31일 하루', zx + 10, zy + 18, '#ffd84d', '700 13px', 'left');
          const hx = (h) => zx + 10 + h / 24 * (zw - 20); X.line(c, hx(0), zy + 46, hx(24), zy + 46, '#5b6478', 3); X.line(c, hx(0), zy + 46, hx(XK.clamp((st.d - 364) * 24, 0, 24)), zy + 46, '#ffd84d', 3);
          [0, 12, 24].forEach((h) => X.txt(c, h + '시', hx(h), zy + 66, '#aab4cf', '600 11px'));
          const hu = 24 - 3e5 / 13.8e9 * 365 * 24; X.ball(c, hx(hu), zy + 46, 6, '#ff8ab0', '#8a2850'); X.txt(c, '사람', hx(hu) - 8, zy + 36, '#ff8ab0', '700 12px', 'right');
        }
        // 사건 지나가면 얻기
        this.EV.forEach((e, j) => { if (!st.got.includes(j) && st.d >= this.day(e.ago)) { st.got.push(j); const q = this.ds(this.day(e.ago)); api.say(`<b>${e.n}</b> — 달력으로 <b>${q.m}월 ${q.d}일</b>${q.m === 12 && q.d === 31 ? ` ${q.h}시 ${q.mi}분` : ''}.`); } });
        if (st.got.includes(3) && !api.has(1)) { api.ok(1); api.say('태양계와 지구는 <b>9월 초</b>에야 생겼다! 1년 중 여덟 달 동안 우주는 별을 만들고 터뜨리며 무거운 원소를 쌓았다. 계속 넘겨 보자.'); }
        if (st.got.includes(4) && api.has(1) && !api.has(2)) { api.ok(2); api.reveal(); }
        if (st.d >= 364.999 && api.has(2) && !api.has(3)) { api.ok(3); api.say('지금의 사람은 <b>12월 31일 밤 11시 48분</b> 무렵에야 나타났다. 지구와 생명의 역사는 빅뱅에서 시작된 <b>우주 역사의 끝자락 일부</b>다.'); api.chip('달력 끝까지 왔다', true); }
      },
      hint(st) { if (!st.W) return null; const g = this.geo(st.W, st.H); return { x: g.x0, y: g.by, dx: 1, dy: 0, dist: 200, label: '날짜 넘기기' }; },
      down(p, st) { st.held = true; st.x0 = p.x; st.d0 = st.d; },
      move(p, st, api, held) { if (!held) return; const g = this.geo(st.W, st.H); st.d = XK.clamp(st.d0 + (p.x - st.x0) / (g.x1 - g.x0) * 365, 0, 365); },
      up(p, st) { st.held = false; },
      key(k, st) { const d = { ArrowRight: 5, ArrowLeft: -5, End: 400 }[k]; if (!d) return false; st.d = XK.clamp(st.d + d, 0, 365); return true; },
      test(st, api, d) { st.d = d; },
    },
    // ── 2-1-2 3차시 생활 속 예 «팔을 오므리는 피겨 선수와 성운»: 팔(반지름)을 줄이면 빨리 돈다 → 수축하는 태양계 성운도 빨리 돌며 납작해진다 (교과서 57쪽) ──
    // 회전 빠르기 = 처음 빠르기 × (펼친 팔 + 몸) ÷ (지금 팔 + 몸) 어림. 바퀴 수는 이해를 돕기 위한 예
    skater: {
      init(st, api) { st.r = 1; st.ang = 0; st.na = 0; st.pts = []; st.min = 1; st.back = false; st.tr = []; api.say('예측을 고른 뒤, 선수의 <b>손</b>을 몸 쪽으로 끌어 팔을 오므려 보자.'); api.chip('손을 몸 쪽으로 끌자'); },
      w(r) { const I0 = 1 + 0.35, I = r * r + 0.35; return I0 / I; }, // 팔 1일 때 1바퀴/초 기준
      geo(W, H) { return { cx: W * 0.28, cy: H * 0.45, L: Math.min(W * 0.24, H * 0.32), nx: W * 0.76, ny: H * 0.36 }; },
      draw(c, W, H, dt, st, api, X) {
        const g = this.geo(W, H), t = st.t, w = this.w(st.r), rps = w * 1.2;
        st.ang += dt * rps * 6.283 * 0.5; // 화면은 실제의 절반 빠르기로
        // 옆에서 본 아이스링크: 관중석 · 펜스 · 빙판(반사)
        const LW = W * 0.56, fy = H * 0.74, sh = H * 0.36; // 바닥선, 어깨 높이
        X.vgrad(c, 0, 0, LW, fy, ['#2a3550', '#3b4a6b', '#5a6f96']);
        const Rr = X.rnd(5); for (let k = 0; k < 160; k++) { c.fillStyle = `hsla(${Rr() * 360},40%,${45 + Rr() * 25}%,.55)`; c.beginPath(); c.arc(Rr() * LW, fy * 0.12 + Rr() * fy * 0.42, 3 + Rr() * 3, 0, 6.283); c.fill(); }
        X.vgrad(c, 0, fy * 0.6, LW, fy * 0.4, ['#e9eef6', '#c9d4e4']); c.fillStyle = '#1d5fa8'; c.fillRect(0, fy * 0.6, LW, 8); c.fillStyle = '#c62828'; c.fillRect(0, fy - 6, LW, 6);
        X.vgrad(c, 0, fy, LW, H - fy, ['#f4faff', '#dbe9f5']);
        c.strokeStyle = 'rgba(120,150,190,.35)'; c.lineWidth = 1.2; for (let k = 0; k < 9; k++) { c.beginPath(); c.ellipse(g.cx, fy + 34, 40 + k * 26, 8 + k * 5, 0, 0, 6.283); c.stroke(); }
        const x0 = g.cx, arm = g.L * st.r, ca = Math.cos(st.ang), sa = Math.sin(st.ang), flare = Math.min(1, rps / 3.5);
        // 손끝이 그리는 궤도(빠를수록 꼬리가 길다)
        const orx = arm, ory = arm * 0.2, tail = Math.min(2.8, 0.3 + rps * 0.45);
        [0, Math.PI].forEach((ph) => { c.strokeStyle = 'rgba(70,130,230,.5)'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.ellipse(x0, sh, orx, ory, 0, st.ang + ph - tail, st.ang + ph); c.stroke(); });
        // 빙판 반사와 그림자
        X.shadow(c, x0, fy + 30, 46, 9, 0.25);
        const handP = (sg) => [x0 + sg * arm * ca, sh + sg * ory * sa];
        const drawArm = (sg) => { const [hx2, hy2] = handP(sg), shx = x0 + sg * 16 * ca; c.strokeStyle = '#f0c8a0'; c.lineWidth = 11; c.lineCap = 'round'; c.beginPath(); c.moveTo(shx, sh + 4); c.lineTo(hx2, hy2); c.stroke(); c.strokeStyle = '#ad1457'; c.lineWidth = 13; c.beginPath(); c.moveTo(shx, sh + 4); c.lineTo(XK.lerp(shx, hx2, 0.35), XK.lerp(sh + 4, hy2, 0.35)); c.stroke(); X.ball(c, hx2, hy2, 8, '#f6d2ae', '#b0805a'); };
        const backSide = sa < 0 ? 1 : -1; drawArm(backSide);
        // 다리(받치는 다리 + 구부린 다리) · 스케이트
        c.strokeStyle = '#f2d4bf'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0 - 4, sh + 120); c.lineTo(x0 - 2, fy + 8); c.stroke();
        c.beginPath(); c.moveTo(x0 + 6, sh + 120); c.quadraticCurveTo(x0 + 26, sh + 165, x0 + 8, sh + 190); c.stroke();
        c.fillStyle = '#f7f7f7'; X.rr(c, x0 - 16, fy + 2, 26, 16, 6); c.fill(); X.line(c, x0 - 22, fy + 22, x0 + 16, fy + 22, '#9aa3b5', 3);
        c.fillStyle = '#f7f7f7'; X.rr(c, x0 - 2, sh + 182, 22, 13, 5); c.fill();
        for (let k = 0; k < 6; k++) { const q = (t * 2 + k / 6) % 1; X.glow(c, x0 + (q - 0.5) * 60 * flare, fy + 18 - q * 12, 3, `rgba(255,255,255,${(1 - q) * flare})`); }
        // 치마: 빨리 돌수록 넓게 퍼진다
        c.fillStyle = '#c2185b'; c.beginPath(); c.moveTo(x0 - 18, sh + 70); c.lineTo(x0 + 18, sh + 70); c.lineTo(x0 + 26 + 34 * flare, sh + 122 - 18 * flare); c.quadraticCurveTo(x0, sh + 132 - 10 * flare, x0 - 26 - 34 * flare, sh + 122 - 18 * flare); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 2; for (let k = -2; k <= 2; k++) X.line(c, x0 + k * 5, sh + 74, x0 + k * (12 + 12 * flare), sh + 120 - 14 * flare, 'rgba(255,255,255,.22)', 2);
        // 몸통 · 목 · 머리(올림머리)
        c.fillStyle = '#ad1457'; c.beginPath(); c.moveTo(x0 - 20, sh); c.quadraticCurveTo(x0 - 24, sh + 40, x0 - 15, sh + 72); c.lineTo(x0 + 15, sh + 72); c.quadraticCurveTo(x0 + 24, sh + 40, x0 + 20, sh); c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(x0 + 8 * ca, sh + 26, 6, 22, 0, 0, 6.283); c.fill();
        c.fillStyle = '#f0c8a0'; c.fillRect(x0 - 5, sh - 14, 10, 16);
        X.ball(c, x0, sh - 30, 17, '#f6d2ae', '#c08a62', '#fff1e0');
        c.fillStyle = '#3a2414'; c.beginPath(); c.arc(x0, sh - 34, 17, Math.PI * 1.02, Math.PI * 1.98); c.fill(); X.ball(c, x0 - 10 * ca, sh - 50, 8, '#5a3a24', '#2a170c');
        drawArm(-backSide);
        const [hx0, hy0] = handP(1); X.glow(c, hx0, hy0, 18, 'rgba(255,216,77,.45)');
        X.txt(c, '옆에서 본 선수', x0, H - 18, '#46607a', '700 15px');
        // 오른쪽: 같은 일이 성운에서 — 반지름과 납작함이 팔과 같이 변한다
        X.vgrad(c, W * 0.56, 0, W * 0.44, H, ['#070a18', '#10163a']); X.stars(c, W, H, t, 70, 3, 0.8);
        st.na += dt * rps * 2.2;
        const nr = Math.min(W * 0.17, H * 0.26) * (0.45 + 0.55 * st.r), fl = 0.25 + 0.75 * Math.pow(st.r, 1.3);
        X.glow(c, g.nx, g.ny, 20 + 60 * (1 - st.r), `rgba(255,214,110,${0.3 + 0.6 * (1 - st.r)})`);
        for (let i = 0; i < 120; i++) { const d = (0.15 + ((i * 37) % 85) / 100) * nr, a = i * 2.4 + st.na * (0.6 + 0.4 * nr / Math.max(d, 10)); const tail = Math.min(1, 0.05 + rps * 0.08); c.strokeStyle = `rgba(210,220,255,${0.3 + (i % 4) * 0.15})`; c.lineWidth = 1.5; c.beginPath(); c.ellipse(g.nx, g.ny, d, d * fl, 0, a - tail, a); c.stroke(); }
        X.txt(c, '태양계 성운', g.nx, g.ny + nr + 40, '#fbfcf9', '800 17px'); X.txt(c, st.r < 0.5 ? '빨리 돌며 납작한 원반' : '천천히 도는 둥근 구름', g.nx, g.ny + nr + 62, '#aab4cf', '700 14px');
        // 회전 빠르기 기록 그래프(팔 길이 → 바퀴/초)
        const gx = W * 0.62, gy = H - 52, gw = W * 0.32, gh = H * 0.2;
        c.fillStyle = 'rgba(255,255,255,.06)'; X.rr(c, gx - 40, gy - gh - 30, gw + 60, gh + 56, 10); c.fill();
        X.line(c, gx, gy, gx + gw, gy, '#aab4cf', 2); X.line(c, gx, gy, gx, gy - gh, '#aab4cf', 2);
        X.txt(c, '1초에 도는 바퀴', gx - 30, gy - gh - 12, '#aab4cf', '700 13px', 'left'); X.txt(c, '← 오므림   팔 길이(펼친 팔 = 100%)   펼침 →', gx + gw / 2, gy + 32, '#aab4cf', '600 12px');
        const PX = (r) => gx + (r - 0.3) / 0.7 * gw, PY = (v) => gy - v / 5 * gh;
        [0, 1, 2, 3, 4].forEach((v) => { X.line(c, gx - 5, PY(v), gx, PY(v), '#aab4cf', 1.5); X.txt(c, String(v), gx - 8, PY(v) + 4, '#aab4cf', '600 12px', 'right'); });
        [0.3, 0.5, 0.7, 1].forEach((r) => { X.line(c, PX(r), gy, PX(r), gy + 5, '#aab4cf', 1.5); X.txt(c, Math.round(r * 100) + '%', PX(r), gy + 16, '#aab4cf', '600 11px'); });
        c.strokeStyle = 'rgba(255,216,77,.35)'; c.setLineDash([4, 4]); c.lineWidth = 1.5; c.beginPath(); for (let r = 0.3; r <= 1.001; r += 0.02) (r === 0.3 ? c.moveTo : c.lineTo).call(c, PX(r), PY(this.w(r) * 1.2)); c.stroke(); c.setLineDash([]);
        if (!st.pts.length || Math.abs(st.pts[st.pts.length - 1] - st.r) > 0.05) { st.pts.push(st.r); if (st.pts.length > 60) st.pts.shift(); }
        st.pts.forEach((r) => X.glow(c, PX(r), PY(this.w(r) * 1.2), 4, 'rgba(255,216,77,.8)'));
        X.ball(c, PX(st.r), PY(rps), 7, '#ffd84d', '#b88a00');
        X.pill(c, g.cx, 26, `1초에 약 ${rps.toFixed(1)}바퀴`, 'rgba(29,36,51,.9)', '#ffd84d', '800 18px');
        // 단계
        st.min = Math.min(st.min, st.r);
        if (st.r < 0.45 && !api.has(1)) { api.ok(1); api.say(`팔을 오므리니 1초에 약 <b>${rps.toFixed(1)}바퀴</b> — 처음보다 훨씬 <b>빨라졌다</b>. 이제 팔을 다시 펴 보자.`); api.chip('팔을 다시 펴자'); }
        if (api.has(1) && st.r > 0.9 && !api.has(2)) { api.ok(2); api.say('팔을 펴니 다시 <b>느려졌다</b>. 오른쪽 성운도 함께 커지고 느려진다. 한 번 더 오므려 성운을 수축시켜 보자.'); api.chip('한 번 더 오므리자'); }
        if (api.has(2) && st.r < 0.4 && !api.has(3)) { api.ok(3); api.reveal(); api.say('성운도 수축하면 피겨 선수처럼 <b>빨리 돌고</b>, 회전 때문에 <b>납작한 원반</b>이 된다. 원반이 한 방향으로 돌았으니 그 안에서 생긴 행성들도 <b>같은 방향</b>으로 돈다.'); api.chip('성운도 빨라졌다', true); }
      },
      hint(st) { if (!st.W) return null; const g = this.geo(st.W, st.H); return { x: g.cx + g.L, y: st.H * 0.36 + 30, dx: -1, dy: 0, dist: g.L * 0.55, label: '손을 몸 쪽으로' }; },
      down(p, st) { st.held = true; },
      move(p, st, api, held) { if (!held) return; const g = this.geo(st.W, st.H); st.r = XK.clamp(Math.abs(p.x - g.cx) / g.L, 0.3, 1); },
      up(p, st) { st.held = false; },
      key(k, st) { const d = { ArrowLeft: -0.1, ArrowRight: 0.1 }[k]; if (!d) return false; st.r = XK.clamp(st.r + d, 0.3, 1); return true; },
      test(st, api, r) { st.r = r; },
    },
  };
  function mount(root, kind) {
    const K = KINDS[kind], P = window.Play;
    const stage = root.querySelector('.xp-stage'), out = root.querySelector('.xp-out'), chip = root.querySelector('.xp-now');
    const nSteps = root.querySelectorAll('.u-steps li').length;
    const st = { t: 0, W: 0, H: 0, touched: false, ok: [], msg: '', chip: '' };
    const api = {
      say(h) { if (h !== st.msg) { st.msg = h; if (out) out.innerHTML = h; } },
      chip(s, done) { if (chip && s !== st.chip) { st.chip = s; chip.textContent = s; } if (chip) chip.classList.toggle('done', !!done); },
      ok(n) {
        if (!st.ok.includes(n)) st.ok.push(n);
        if (!nSteps || !window.L1) return;
        const cur = Array.from({ length: nSteps }, (_, i) => i + 1).find((k) => !st.ok.includes(k)) || 0;
        window.L1.steps(root, cur, st.ok); window.L1.done(root, cur === 0);
      },
      has: (n) => st.ok.includes(n),
      // 해 본 뒤 정답 단추에 테 + 예측이 맞았는지
      reveal() { st.revealed = true; verdict(); },
    };
    const opts = [...root.querySelectorAll('.xp-opts button')], vd = root.querySelector('.xp-verdict');
    st.pred = null; st.revealed = false;
    function verdict() {
      if (!st.revealed) return;
      opts.forEach((b) => b.classList.toggle('answer', b.dataset.ans === '1'));
      if (!vd) return;
      const a = opts.findIndex((b) => b.dataset.ans === '1');
      vd.textContent = st.pred == null ? '테를 두른 것이 답이다. 처음 생각과 맞춰 보자.' : st.pred === a ? '예측이 맞았다!' : '예측과 달랐다 — 테를 두른 답과 까닭을 다시 보자.';
      vd.classList.toggle('miss', st.pred != null && st.pred !== a);
    }
    opts.forEach((b) => b.addEventListener('click', () => { opts.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); st.pred = +b.dataset.k; verdict(); }));
    if (nSteps && window.L1) window.L1.steps(root, 1, []);
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        st.t += dt; st.W = W; st.H = H; c.clearRect(0, 0, W, H);
        K.draw(c, W, H, dt, st, api, XK);
        if (!st.touched && K.hint) { const h = K.hint(st); if (h) (h.tap ? XK.tap(c, h.x, h.y, st.t, h.label) : XK.hint(c, h.x, h.y, st.t, h.dx, h.dy, h.label, h.dist)); }
      },
      down(p) { st.touched = true; if (K.down) K.down(p, st, api); },
      move(p, e, held) { if (K.move) K.move(p, st, api, held); },
      up(p) { if (K.up) K.up(p, st, api); },
      key(e) { if (!K.key) return false; const r = K.key(e.key, st, api); if (r) st.touched = true; return r; },
    });
    st.S = S;
    if (K.init) K.init(st, api);
    root._xp = { st, test: (...a) => { st.touched = true; const r = K.test && K.test(st, api, ...a); S.redraw(); return r; } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Xpa = { mount };
})();
