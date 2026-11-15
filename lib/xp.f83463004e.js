/* 꿈틀 늘린 장 공용(2026-11-13 차시 늘리기). XK = 그림 도구(명암 공·빛 번짐·손가락 안내…), Xp = 늘린 장의 손 조작 틀.
   Xp.mount(root, 종류) → { fit, setActive } · 오른쪽 칸 .u-steps가 있으면 단계·알게 된 것을 맞춘다.
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
  window.XK = XK;
  const KINDS = {
    // ── 1-2-1 1차시 이론 그림: 여러 번 재어 평균 내기. 연필 길이 14.6 cm 둘레로 흩어지는 값은 이해를 돕기 위한 예 ──
    avg: {
      init(st, api) { st.vals = [14.62, 14.61, 14.63]; st.R = XK.rnd(21); st.drop = null; st.flash = 0; this.say(st, api); },
      add(st) {
        const r = st.R, e = (r() + r() + r() - 1.5) * 0.04, v = Math.round((14.62 + e) * 100) / 100;
        if (st.drop) st.vals.push(st.drop.v);
        st.drop = { v, k: 0 }; st.flash = 1;
      },
      settle(st) { if (st.drop) { st.vals.push(st.drop.v); st.drop = null; } },
      say(st, api) {
        const all = st.vals.concat(st.drop ? [st.drop.v] : []), n = all.length, m = all.reduce((a, b) => a + b, 0) / n;
        if (n >= 10) api.ok(1);
        api.say(`${n}번째 값 <b>${all[n - 1].toFixed(2)} cm</b>(끝자리 ${Math.round(all[n - 1] * 100) % 10}은 눈으로 어림) · 지금까지 평균 <b>${m.toFixed(2)} cm</b>. ${n < 6 ? '몇 번 더 눌러 값을 모아 보자.' : '하나하나는 흔들려도 평균은 거의 움직이지 않는다.'}`);
      },
      geo(W, H) { const rx = W * 0.06, rw = W * 0.88, ry = H * 0.17, k = rw / 18; return { rx, rw, ry, k, lx: rx + 14.6 * k, ly: ry + 22, zx: W * 0.07, zw: W * 0.86, zy0: H * 0.47 }; },
      draw(c, W, H, dt, st) {
        const g = this.geo(W, H);
        // 책상(나뭇결)
        XK.vgrad(c, 0, 0, W, H * 0.44, ['#c99a64', '#b4824c']);
        const R = XK.rnd(5); c.strokeStyle = 'rgba(90,55,25,.22)'; c.lineWidth = 1.5;
        for (let i = 0; i < 9; i++) { const y = 8 + i * H * 0.05 + R() * 6; c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(W * 0.3, y + 6 * R(), W * 0.6, y - 6 * R(), W, y + 3); c.stroke(); }
        XK.vgrad(c, 0, H * 0.44, W, H * 0.56, ['#f7f4ec', '#ece6d8']);
        // 자
        XK.shadow(c, g.rx + g.rw / 2, g.ry + 50, g.rw / 2, 6, 0.25);
        const rg = c.createLinearGradient(0, g.ry, 0, g.ry + 46); rg.addColorStop(0, '#fff7cf'); rg.addColorStop(1, '#f1df95'); c.fillStyle = rg; c.strokeStyle = '#1d2433'; c.lineWidth = 2; XK.rr(c, g.rx, g.ry, g.rw, 46, 4); c.fill(); c.stroke();
        for (let mm = 0; mm <= 180; mm++) { const x = g.rx + mm * g.k / 10; XK.line(c, x, g.ry, x, g.ry + (mm % 10 ? (mm % 5 ? 8 : 13) : 19), '#1d2433', mm % 10 ? 0.8 : 1.6); if (!(mm % 10) && mm < 180) XK.txt(c, `${mm / 10}`, x + (mm ? 0 : 5), g.ry + 37, '#1d2433', '600 12px'); }
        XK.txt(c, 'cm', g.rx + g.rw - 16, g.ry + 37, '#1d2433', '700 12px');
        // 연필(14.6 cm)
        const pl = 14.62 * g.k, py = g.ry - 16;
        XK.shadow(c, g.rx + pl / 2, py + 14, pl / 2, 4, 0.25);
        const pg = c.createLinearGradient(0, py - 10, 0, py + 10); pg.addColorStop(0, '#ffe07a'); pg.addColorStop(0.5, '#f2b81d'); pg.addColorStop(1, '#b97f06'); c.fillStyle = pg; c.fillRect(g.rx + 21, py - 9, pl - 53, 18);
        XK.line(c, g.rx + 21, py - 3, g.rx + pl - 32, py - 3, 'rgba(255,255,255,.35)', 1.5); XK.line(c, g.rx + 21, py + 3, g.rx + pl - 32, py + 3, 'rgba(120,80,0,.3)', 1.5);
        c.fillStyle = '#f1d3b0'; c.beginPath(); c.moveTo(g.rx + pl - 32, py - 9); c.lineTo(g.rx + pl, py); c.lineTo(g.rx + pl - 32, py + 9); c.closePath(); c.fill();
        c.fillStyle = '#2b2b2b'; c.beginPath(); c.moveTo(g.rx + pl - 9, py - 2.6); c.lineTo(g.rx + pl, py); c.lineTo(g.rx + pl - 9, py + 2.6); c.closePath(); c.fill();
        c.fillStyle = '#c9ccd3'; c.fillRect(g.rx + 12, py - 9, 10, 18); c.fillStyle = '#e88aa0'; XK.rr(c, g.rx, py - 9, 14, 18, 4); c.fill();
        // 돋보기(14.1~15.1 cm)
        const lx = g.rx + 14.62 * g.k, ly = g.ry + 6, lr = g.k * 0.42;
        c.strokeStyle = 'rgba(29,36,51,.35)'; c.lineWidth = 1.5; c.setLineDash([5, 4]);
        c.beginPath(); c.moveTo(lx - lr, ly + 6); c.lineTo(g.zx, g.zy0); c.moveTo(lx + lr, ly + 6); c.lineTo(g.zx + g.zw, g.zy0); c.stroke(); c.setLineDash([]);
        c.save(); c.strokeStyle = '#5a3a1a'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(lx + lr * 0.72, ly + lr * 0.72); c.lineTo(lx + lr * 1.5, ly + lr * 1.6); c.stroke(); c.restore();
        XK.glow(c, lx, ly, lr, 'rgba(200,235,255,.35)', 'rgba(200,235,255,.15)');
        c.strokeStyle = '#3b4252'; c.lineWidth = 5; c.beginPath(); c.arc(lx, ly, lr, 0, XK.TAU); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 2.5; c.beginPath(); c.arc(lx, ly, lr - 6, 3.6 + Math.sin(st.t) * 0.1, 4.4 + Math.sin(st.t) * 0.1); c.stroke();
        // 확대한 눈금 카드
        const zx = g.zx, zw = g.zw, zy0 = g.zy0, zh = H - zy0 - 10, a = 14.5, b = 14.75, X = (v) => zx + 24 + (v - a) / (b - a) * (zw - 48), ay = zy0 + zh - 70;
        XK.shadow(c, zx + zw / 2, zy0 + zh + 2, zw / 2, 6, 0.15);
        c.fillStyle = '#fff'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; XK.rr(c, zx, zy0, zw, zh, 12); c.fill(); c.stroke();
        XK.txt(c, '돋보기로 본 14.5 ~ 14.7 cm · 1 mm 눈금 사이를 10칸으로 어림해 0.01 cm 자리까지 읽는다', zx + 14, zy0 + 22, '#5b6578', '700 13px', 'left');
        XK.line(c, X(a), ay, X(b), ay, '#1d2433', 3);
        for (let v = 1450; v <= 1475; v++) { const mmT = v % 10 === 0; XK.line(c, X(v / 100), ay - (mmT ? 9 : 4), X(v / 100), ay + (mmT ? 9 : 4), mmT ? '#1d2433' : 'rgba(29,36,51,.35)', mmT ? 2.5 : 1, mmT ? null : [2, 2]); if (mmT) XK.txt(c, (v / 100).toFixed(1), X(v / 100), ay + 26, '#1d2433', '700 15px'); else if (v % 5 === 0) XK.txt(c, (v / 100).toFixed(2), X(v / 100), ay + 22, '#8a93a6', '600 11px'); }
        XK.txt(c, '굵은 선 = mm 눈금 · 점선 = 눈으로 나눈 칸', zx + 14, ay + 46, '#5b6578', '600 12px', 'left');
        const cnt = {}, br = 8, top = (v) => { const key = v.toFixed(2); cnt[key] = (cnt[key] || 0) + 1; return ay - br - 2 - (cnt[key] - 1) * (br * 2 + 1); };
        st.vals.forEach((v, i) => { const y = top(v); XK.ball(c, X(v), y, br, '#4a90d9', '#1d4e86'); });
        if (st.drop) {
          st.drop.k = Math.min(1, st.drop.k + dt * 2.2); const ty = top(st.drop.v), e = XK.ease(st.drop.k), sx = g.rx + st.drop.v * g.k;
          const x = XK.lerp(sx, X(st.drop.v), e), y = XK.lerp(g.ry + 22, ty, e * e);
          XK.ball(c, x, y, br * (1 + 0.3 * (1 - st.drop.k)), '#e4572e', '#8f2a1a');
          XK.line(c, sx, g.ry - 2, sx, g.ry + 46, `rgba(228,87,46,${1 - st.drop.k * 0.5})`, 2.5);
          if (st.drop.k >= 1) { st.vals.push(st.drop.v); st.lastV = st.drop.v; st.drop = null; }
        } else if (st.lastV != null) { const key = st.lastV.toFixed(2); const y = ay - br - 2 - (cnt[key] - 1) * (br * 2 + 1); c.strokeStyle = '#e4572e'; c.lineWidth = 2.5; c.beginPath(); c.arc(X(st.lastV), y, br + 4 + Math.sin(st.t * 4), 0, XK.TAU); c.stroke(); }
        const all = st.vals, m = all.reduce((p, q) => p + q, 0) / all.length, mx = X(m);
        XK.line(c, mx, zy0 + 40, mx, ay + 4, '#2f9e5b', 3, [8, 5]); XK.pill(c, mx, zy0 + 46, `평균 ${m.toFixed(2)} cm`, '#2f9e5b', '#fff', '800 15px');
        const recent = all.slice(-7).map((v) => v.toFixed(2)).join(' · ');
        XK.txt(c, `잰 값(${all.length}번): ${recent}`, zx + zw - 14, zy0 + zh - 10, '#1d2433', '700 13px', 'right');
      },
      hint(st) { const g = this.geo(st.W, st.H); return { tap: true, x: g.lx - 70, y: g.ly + 6, label: '눌러서 한 번 더 재기' }; },
      down(p, st, api) { this.add(st); this.say(st, api); },
      key(k, st, api) { if (k !== 'Enter' && k !== ' ') return false; this.add(st); this.say(st, api); return true; },
      test(st, api, n) { for (let i = 0; i < n; i++) { this.add(st); this.settle(st); } this.say(st, api); },
    },

    // ── 1-2-1 1차시: 뼘으로 책상 재기. 책상 120 cm, 작은 손 16 cm·큰 손 21 cm는 이해를 돕기 위한 예 ──
    hands: {
      TOOLS: [['작은 손', 16, '#f6c29b', '#c98a5e'], ['큰 손', 21, '#dfa274', '#a96b3f'], ['30 cm 자', 30, '#ffd84d', '#b8860b']],
      init(st, api) { st.tool = 0; st.pos = 0; st.done = {}; st.drag = null; api.say('위에서 손을 고르고, 책상 왼쪽 끝에서 오른쪽으로 끌어 <b>한 뼘씩</b> 재 보자.'); },
      geo(W, H) { const dx = 46, dw = W - 92, dy = H * 0.36, dh = H * 0.22, k = dw / 120; return { dx, dw, dy, dh, k, my: dy + dh * 0.62 }; },
      // 위에서 내려다본 편 손: 엄지 끝(x0)에서 새끼손가락 끝(x0 + s)까지가 한 뼘
      hand(c, x0, y, s, col, dark, a = 1) {
        c.save(); c.globalAlpha = a; c.translate(x0, y); c.lineCap = 'round';
        const F = [[0.34, 0.66, 0.075, 0.5, 0.15], [0.42, 0.46, 0.3, 0.06, 0.12], [0.5, 0.42, 0.5, -0.02, 0.125], [0.58, 0.45, 0.69, 0.05, 0.12], [0.64, 0.55, 0.947, 0.3, 0.105]];
        const pass = (w, colr) => { F.forEach(([ax, ay, bx, by, fw]) => { c.strokeStyle = colr; c.lineWidth = fw * s + w; c.beginPath(); c.moveTo(ax * s, ay * s); c.lineTo(bx * s, by * s); c.stroke(); }); c.fillStyle = colr; c.beginPath(); c.ellipse(0.5 * s, 0.66 * s, 0.2 * s + w / 2, 0.21 * s + w / 2, 0, 0, XK.TAU); c.fill(); };
        pass(4, dark); pass(0, col);
        const pg = c.createRadialGradient(0.46 * s, 0.6 * s, 2, 0.5 * s, 0.66 * s, 0.24 * s); pg.addColorStop(0, 'rgba(255,255,255,.35)'); pg.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = pg; c.beginPath(); c.ellipse(0.5 * s, 0.66 * s, 0.2 * s, 0.21 * s, 0, 0, XK.TAU); c.fill();
        F.forEach(([ax, ay, bx, by]) => { const L = Math.hypot(bx - ax, by - ay), ux = (bx - ax) / L, uy = (by - ay) / L; c.fillStyle = 'rgba(255,240,230,.85)'; c.beginPath(); c.ellipse((bx - ux * 0.035) * s, (by - uy * 0.035) * s, 0.03 * s, 0.022 * s, Math.atan2(uy, ux), 0, XK.TAU); c.fill(); });
        c.strokeStyle = 'rgba(80,40,20,.35)'; c.lineWidth = 1.2; c.beginPath(); c.arc(0.5 * s, 0.7 * s, 0.11 * s, 3.6, 5.6); c.stroke();
        c.restore();
      },
      draw(c, W, H, dt, st, api) {
        const g = this.geo(W, H), T = this.TOOLS[st.tool], cm = T[1], span = cm * g.k;
        // 교실: 벽·창문·바닥
        XK.vgrad(c, 0, 0, W, H * 0.7, ['#eef1ea', '#dfe5dc']);
        const wx = W * 0.62, ww = W * 0.3; XK.vgrad(c, wx, 70, ww, H * 0.2, ['#8fc3ef', '#cfe7f8']); c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.ellipse(wx + ww * 0.3 + Math.sin(st.t * 0.2) * 10, 70 + H * 0.08, 34, 10, 0, 0, XK.TAU); c.fill();
        c.strokeStyle = '#8a7a66'; c.lineWidth = 6; c.strokeRect(wx, 70, ww, H * 0.2); XK.line(c, wx + ww / 2, 70, wx + ww / 2, 70 + H * 0.2, '#8a7a66', 4);
        XK.vgrad(c, 0, H * 0.7, W, H * 0.3, ['#c9b493', '#b39d79']); for (let x = -40; x < W; x += 70) XK.line(c, x, H * 0.7, x + 40, H, 'rgba(90,70,40,.18)', 2);
        this.TOOLS.forEach(([n], i) => { const w = (W - 60) / 3, x = 30 + i * w; c.fillStyle = i === st.tool ? '#ffd84d' : '#fff'; c.strokeStyle = '#1d2433'; c.lineWidth = 2.5; XK.rr(c, x + 6, 14, w - 12, 44, 22); c.fill(); c.stroke(); XK.txt(c, `${n}${st.done[i] ? ' ✓' : ''}`, x + w / 2, 43, '#1d2433', i === st.tool ? '800 19px' : '600 18px'); });
        // 책상(위판 + 앞면 + 다리)
        const bk = 26, fy = g.dy + g.dh;
        XK.shadow(c, g.dx + g.dw / 2, H * 0.86, g.dw * 0.52, 14, 0.18);
        [[g.dx + 14, 0], [g.dx + g.dw - 28, 0]].forEach(([lx]) => { const lg = c.createLinearGradient(lx, 0, lx + 14, 0); lg.addColorStop(0, '#6c6f78'); lg.addColorStop(0.5, '#b7bcc6'); lg.addColorStop(1, '#5b5f68'); c.fillStyle = lg; c.fillRect(lx, fy + 14, 14, H * 0.86 - fy - 14); });
        const top = c.createLinearGradient(0, g.dy, 0, fy); top.addColorStop(0, '#d8b07c'); top.addColorStop(1, '#c4935a'); c.fillStyle = top;
        c.beginPath(); c.moveTo(g.dx + bk, g.dy); c.lineTo(g.dx + g.dw - bk, g.dy); c.lineTo(g.dx + g.dw, fy); c.lineTo(g.dx, fy); c.closePath(); c.fill();
        c.save(); c.clip(); c.strokeStyle = 'rgba(110,70,30,.2)'; c.lineWidth = 1.5; for (let i = 1; i < 7; i++) { const y = g.dy + i * g.dh / 7; c.beginPath(); c.moveTo(g.dx, y); c.bezierCurveTo(g.dx + g.dw * 0.3, y + 4, g.dx + g.dw * 0.6, y - 4, g.dx + g.dw, y); c.stroke(); } c.restore();
        c.fillStyle = '#8f6236'; c.fillRect(g.dx, fy, g.dw, 14);
        // 책상 위 공책·필통
        c.save(); c.translate(g.dx + g.dw * 0.18, g.dy + 14); c.rotate(-0.06); c.fillStyle = '#3d7fb0'; XK.rr(c, 0, 0, 90, 24, 3); c.fill(); c.fillStyle = '#fff'; c.fillRect(6, 4, 30, 6); c.restore();
        c.save(); c.translate(g.dx + g.dw * 0.66, g.dy + 10); c.rotate(0.04); const pc = c.createLinearGradient(0, 0, 0, 18); pc.addColorStop(0, '#f38b8b'); pc.addColorStop(1, '#c95353'); c.fillStyle = pc; XK.rr(c, 0, 0, 110, 18, 9); c.fill(); XK.line(c, 6, 9, 104, 9, 'rgba(255,255,255,.6)', 1.5); c.restore();
        // 잰 자국
        const n = Math.floor(st.pos / cm + 1e-6);
        XK.line(c, g.dx, g.my - 46, g.dx, fy, '#1d2433', 2.5); XK.line(c, g.dx + g.dw, g.my - 46, g.dx + g.dw, fy, '#1d2433', 2.5);
        if (st.tool === 2) {
          for (let i = 0; i < n; i++) { const x = g.dx + i * span, rg = c.createLinearGradient(0, g.my - 14, 0, g.my + 14); rg.addColorStop(0, '#fff3b0'); rg.addColorStop(1, '#f2cf45'); c.fillStyle = rg; c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; c.fillRect(x, g.my - 14, span, 28); c.strokeRect(x, g.my - 14, span, 28); for (let q = 1; q < 30; q++) XK.line(c, x + q * span / 30, g.my - 14, x + q * span / 30, g.my - (q % 5 ? 8 : 3), '#1d2433', 1); XK.txt(c, `${(i + 1) * 30} cm`, x + span - 6, g.my + 10, '#1d2433', '700 12px', 'right'); }
        } else for (let i = 0; i < n; i++) { this.hand(c, g.dx + i * span, g.my - span * 0.62, span, T[2], T[3], 0.9); XK.line(c, g.dx + (i + 1) * span, g.my + 4, g.dx + (i + 1) * span, fy - 2, '#1d2433', 2); XK.txt(c, `${i + 1}`, g.dx + (i + 0.5) * span, fy - 4, '#5a3a1a', '800 14px'); }
        const hx = g.dx + st.pos * g.k;
        if (st.pos * g.k < g.dw - 2) { if (st.tool === 2) { c.fillStyle = 'rgba(255,216,77,.6)'; c.fillRect(hx, g.my - 14, Math.min(span, g.dx + g.dw - hx), 28); } else { c.save(); c.beginPath(); c.rect(0, 0, g.dx + g.dw + 2, H); c.clip(); this.hand(c, hx, g.my - span * 0.62 - 3 - Math.abs(Math.sin(st.t * 3)) * 3, span, T[2], T[3], 0.6); c.restore(); } }
        XK.txt(c, '왼쪽 끝', g.dx + 4, g.my - 52, '#1d2433', '700 14px', 'left'); XK.txt(c, '오른쪽 끝', g.dx + g.dw - 4, g.my - 52, '#1d2433', '700 14px', 'right');
        const val = st.tool === 2 ? `${Math.min(120, Math.round(st.pos))} cm` : `${(Math.min(120, st.pos) / cm).toFixed(1)}뼘`;
        XK.pill(c, W / 2, H * 0.69, `${T[0]}: ${val}`, '#1d2433', '#ffd84d', '800 20px');
        // 결과 표(막대)
        const bx = W * 0.2, bw = W * 0.5, by0 = H * 0.81;
        c.fillStyle = 'rgba(255,255,255,.92)'; c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; XK.rr(c, bx - 96, by0 - 22, bw + 240, 84, 10); c.fill(); c.stroke();
        this.TOOLS.forEach(([nm, l, cl, dk], i) => {
          const y = by0 + i * 26, r = st.done[i];
          XK.txt(c, nm, bx - 10, y + 6, '#1d2433', '700 14px', 'right');
          c.fillStyle = 'rgba(29,36,51,.1)'; c.fillRect(bx, y - 8, bw, 16);
          if (r) { const f = i === 2 ? 4 / 8 : 120 / l / 8; c.fillStyle = cl; c.fillRect(bx, y - 8, bw * f, 16); c.strokeStyle = dk; c.lineWidth = 1.5; c.strokeRect(bx, y - 8, bw * f, 16); XK.txt(c, i === 2 ? '120 cm(자 4번)' : r, bx + bw + 10, y + 6, '#1d2433', '800 15px', 'left'); }
          else XK.txt(c, '?', bx + bw + 10, y + 6, '#8a93a6', '800 15px', 'left');
        });
      },
      hint(st) { const g = this.geo(st.W, st.H); return { x: g.dx + 30, y: g.my - 10, dx: 1, dy: 0, label: '오른쪽으로 끌어 한 뼘씩', dist: 190 }; },
      down(p, st, api) { if (p.y < 64) { st.tool = XK.clamp(Math.floor((p.x - 30) / ((st.W - 60) / 3)), 0, 2); st.pos = 0; return; } st.drag = { x: p.x, pos: st.pos }; },
      move(p, st, api) { if (!st.drag) return; const g = this.geo(st.W, st.H); this.set(st, api, st.drag.pos + (p.x - st.drag.x) / g.k); },
      up(p, st) { st.drag = null; },
      set(st, api, pos) {
        const cm = this.TOOLS[st.tool][1]; st.pos = XK.clamp(pos, 0, 120);
        if (st.pos >= 120 && !st.done[st.tool]) {
          const r = st.tool === 2 ? '120 cm' : `약 ${(120 / cm).toFixed(1)}뼘`; st.done[st.tool] = r;
          const hands = [0, 1].filter((i) => st.done[i]).length;
          api.say(st.tool === 2 ? '자로 재면 누가 재도 <b>120 cm</b>. 모두가 같은 눈금(기준)을 쓰기 때문이다.' : `${this.TOOLS[st.tool][0]}으로 <b>${r}</b>. ${hands > 1 ? '같은 책상인데 손마다 <b>값이 다르다</b>. 이번엔 30 cm 자로 재 보자.' : '이번엔 다른 손으로 재 보자.'}`);
          api.ok(st.tool + 1);
        }
      },
      key(k, st, api) { if (k === 'ArrowRight' || k === 'ArrowLeft') { this.set(st, api, st.pos + (k === 'ArrowRight' ? 5 : -5)); return true; } const i = { 1: 0, 2: 1, 3: 2 }[k]; if (i == null) return false; st.tool = i; st.pos = 0; return true; },
      test(st, api, i, pos = 120) { st.tool = i; st.pos = 0; this.set(st, api, pos); },
    },

    // ── 1-2-2 1차시: 빛 센서로 가로등 켜기. 센서 값(0~1023)과 켜지는 기준 100은 이해를 돕기 위한 예 ──
    light: {
      init(st, api) { st.u = 0.32; st.drag = null; st.log = []; this.upd(st, api); },
      val: (u) => Math.round(1023 * Math.max(0, Math.sin(u * Math.PI)) ** 1.6),
      upd(st, api) {
        const v = this.val(st.u), on = v < 100; st.on = on;
        st.log.push([st.u, v]); if (st.log.length > 600) st.log.shift();
        api.say(`빛 센서 값 <b>${v}</b> ${on ? '— 기준 100보다 작다 → 가로등 <b>켜짐</b>' : '— 기준 100보다 크다 → 가로등 꺼짐'}`);
        if (st.u > 0.4) api.ok(1); if (on && st.u > 0.5) api.ok(2); if (api.has(2) && !on && st.u < 0.5) api.ok(3);
      },
      draw(c, W, H, dt, st) {
        const u = st.u, h = Math.max(0, Math.sin(u * Math.PI)), gy = H * 0.62, v = this.val(u), L = XK.lerp;
        const sky = `rgb(${Math.round(L(14, 80, h))},${Math.round(L(20, 150, h))},${Math.round(L(48, 225, h))})`, low = `rgb(${Math.round(L(40, 190, h))},${Math.round(L(40, 220, h))},${Math.round(L(80, 245, h))})`;
        XK.vgrad(c, 0, 0, W, gy, [sky, low]);
        const dusk = Math.max(0, 1 - Math.abs(h - 0.18) / 0.18) * (u > 0.5 ? 1 : 0.6);   // 노을
        if (dusk > 0) { const dg = c.createLinearGradient(0, gy * 0.35, 0, gy); dg.addColorStop(0, 'rgba(255,140,80,0)'); dg.addColorStop(1, `rgba(255,140,80,${0.6 * dusk})`); c.fillStyle = dg; c.fillRect(0, 0, W, gy); }
        XK.stars(c, W, gy * 0.8, st.t, 70, 2, Math.max(0, 1 - h * 4));
        const sx = W * (0.06 + 0.88 * u), sy = gy - Math.sin(u * Math.PI) * gy * 0.82;
        if (u > 0 && u < 1) { XK.glow(c, sx, sy, 90, `rgba(255,214,110,${0.3 + 0.4 * h})`); XK.ball(c, sx, sy, 24, h < 0.3 ? '#ffb347' : '#ffd84d', '#f29a1d', '#fffbe0'); }
        // 건물
        const R = XK.rnd(31); for (let i = 0; i < 9; i++) { const bw = W * (0.07 + R() * 0.05), bh = gy * (0.2 + R() * 0.35), bx = i * W * 0.11 - 10; const bg = c.createLinearGradient(bx, 0, bx + bw, 0); bg.addColorStop(0, `rgb(${Math.round(L(25, 120, h))},${Math.round(L(30, 130, h))},${Math.round(L(50, 150, h))})`); bg.addColorStop(1, `rgb(${Math.round(L(18, 95, h))},${Math.round(L(22, 105, h))},${Math.round(L(40, 125, h))})`); c.fillStyle = bg; c.fillRect(bx, gy - bh, bw, bh); for (let wy = gy - bh + 12; wy < gy - 10; wy += 22) for (let wx = bx + 8; wx < bx + bw - 10; wx += 18) { c.fillStyle = h < 0.25 && R() < 0.6 ? 'rgba(255,220,130,.85)' : 'rgba(255,255,255,.15)'; c.fillRect(wx, wy, 9, 12); } }
        // 인도·차도
        XK.vgrad(c, 0, gy, W, 26, ['#8d8f96', '#6d7078']); for (let x = 0; x < W; x += 40) XK.line(c, x, gy, x, gy + 26, 'rgba(0,0,0,.18)', 1);
        XK.vgrad(c, 0, gy + 26, W, H - gy - 26, ['#3a3f4a', '#23262e']); for (let x = 0; x < W; x += 60) { c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(x, gy + 70, 30, 5); }
        // 가로등
        const lx = W * 0.72, top = gy - H * 0.46, hx = lx + 60;
        if (st.on) {
          const lg = c.createLinearGradient(0, top + 24, 0, gy + 40); lg.addColorStop(0, 'rgba(255,225,140,.6)'); lg.addColorStop(1, 'rgba(255,225,140,.05)'); c.fillStyle = lg; c.beginPath(); c.moveTo(hx - 18, top + 26); c.lineTo(hx + 18, top + 26); c.lineTo(hx + 120, gy + 30); c.lineTo(hx - 120, gy + 30); c.closePath(); c.fill();
          c.fillStyle = 'rgba(255,225,140,.35)'; c.beginPath(); c.ellipse(hx, gy + 26, 130, 18, 0, 0, XK.TAU); c.fill();
        }
        const pg = c.createLinearGradient(lx - 6, 0, lx + 6, 0); pg.addColorStop(0, '#3a4252'); pg.addColorStop(0.5, '#8a93a6'); pg.addColorStop(1, '#3a4252'); c.fillStyle = pg; c.fillRect(lx - 6, top, 12, gy - top + 6);
        c.fillStyle = '#4b5263'; XK.rr(c, lx - 12, gy - 4, 24, 12, 3); c.fill();
        c.strokeStyle = '#5b6578'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(lx, top + 6); c.quadraticCurveTo(lx + 20, top - 12, hx, top + 10); c.stroke(); c.lineCap = 'butt';
        c.fillStyle = '#2b303b'; XK.rr(c, hx - 24, top + 6, 48, 18, 6); c.fill(); if (st.on) XK.glow(c, hx, top + 26, 40, 'rgba(255,230,150,.9)');
        c.fillStyle = st.on ? '#fff2c4' : '#5b6578'; c.beginPath(); c.ellipse(hx, top + 24, 18, 6, 0, 0, XK.TAU); c.fill();
        XK.ball(c, lx, top - 8, 9, '#7de0ff', '#1d5f7c'); XK.pill(c, lx - 66, top - 10, '빛 센서', 'rgba(16,20,32,.85)', '#7de0ff', '700 14px');
        // 판단 상자: 센서 → 전선 → 숫자 비교
        const bxx = lx + 14, byy = top + H * 0.17;
        c.strokeStyle = '#7de0ff'; c.lineWidth = 2; c.setLineDash([4, 4]); c.lineDashOffset = -st.t * 20; c.beginPath(); c.moveTo(lx + 6, top - 4); c.lineTo(lx + 10, byy); c.stroke(); c.setLineDash([]);
        c.fillStyle = 'rgba(16,20,32,.9)'; c.strokeStyle = '#7de0ff'; c.lineWidth = 2; XK.rr(c, bxx, byy - 4, 142, 54, 8); c.fill(); c.stroke();
        XK.txt(c, '판단 장치', bxx + 71, byy + 12, '#9fb0c8', '700 12px');
        XK.txt(c, `${v} ${v < 100 ? '<' : '≥'} 100`, bxx + 71, byy + 30, '#ffd84d', '800 16px');
        XK.txt(c, v < 100 ? '→ 켜기' : '→ 끄기', bxx + 71, byy + 46, st.on ? '#ffe28a' : '#9fb0c8', '800 13px');
        // 센서 값 그래프
        const gx = 16, gw = W * 0.5, gh = H * 0.27, gyy = H - gh - 12, px0 = gx + 46, pw = gw - 60;
        c.fillStyle = 'rgba(10,14,24,.82)'; XK.rr(c, gx, gyy, gw, gh, 10); c.fill();
        const Y = (val) => gyy + gh - 26 - val / 1023 * (gh - 50);
        [0, 500, 1000].forEach((q) => { XK.line(c, px0, Y(q), px0 + pw, Y(q), 'rgba(255,255,255,.12)', 1); XK.txt(c, `${q}`, px0 - 6, Y(q) + 4, '#9fb0c8', '600 11px', 'right'); });
        XK.line(c, px0, Y(100), px0 + pw, Y(100), 'rgba(255,120,90,.9)', 1.5, [5, 4]); c.fillStyle = 'rgba(10,14,24,.85)'; c.fillRect(px0 + 2, Y(100) - 16, 50, 13); XK.txt(c, '기준 100', px0 + 4, Y(100) - 5, '#ff9a80', '700 11px', 'left');
        [['아침', 0.1], ['낮', 0.5], ['저녁', 0.9]].forEach(([n, q]) => XK.txt(c, n, px0 + q * pw, gyy + gh - 8, '#9fb0c8', '600 11px'));
        c.strokeStyle = '#7de0ff'; c.lineWidth = 2.5; c.beginPath(); st.log.forEach(([q, val], i) => { const x = px0 + q * pw; if (!i) c.moveTo(x, Y(val)); else c.lineTo(x, Y(val)); }); c.stroke();
        XK.ball(c, px0 + u * pw, Y(v), 5, '#ffd84d', '#b8860b');
        XK.txt(c, `센서 값 ${v}`, gx + 12, gyy + 18, '#ffd84d', '800 14px', 'left'); XK.txt(c, '0 ~ 1023', gx + gw - 10, gyy + 18, '#9fb0c8', '600 11px', 'right');
      },
      hint(st) { const sx = st.W * (0.06 + 0.88 * st.u), sy = st.H * 0.62 - Math.sin(st.u * Math.PI) * st.H * 0.62 * 0.82; return { x: sx, y: sy, dx: 1, dy: 0.25, label: '해를 끌어 지게 하기', dist: 160 }; },
      down(p, st) { st.drag = { x: p.x, u: st.u }; },
      move(p, st, api) { if (!st.drag) return; st.u = XK.clamp(st.drag.u + (p.x - st.drag.x) / st.W / 0.88, 0, 1); this.upd(st, api); },
      up(p, st) { st.drag = null; },
      key(k, st, api) { const d = { ArrowLeft: -0.02, ArrowRight: 0.02 }[k]; if (!d) return false; st.u = XK.clamp(st.u + d, 0, 1); this.upd(st, api); return true; },
      test(st, api, u) { const s = u >= st.u ? 0.01 : -0.01; for (let q = st.u; s > 0 ? q <= u : q >= u; q += s) { st.u = q; this.upd(st, api); } },
    },

    // ── 1-2-1 2차시: 저울을 표준 분동으로 맞추기(교정). 처음 어긋남 +40 g, 사과 620 g은 이해를 돕기 위한 예 ──
    calib: {
      init(st, api) { st.off = 40; st.on = null; st.drag = null; st.knob = 0; st.rec = {}; api.say('이 가게 저울은 맞을까? 무게를 정확히 아는 <b>1 kg 표준 분동</b>을 끌어 저울 접시에 올려 보자.'); },
      geo(W, H) { const sx = W * 0.42, sy = H * 0.8 - 98; return { sx, sy, kn: { x: sx + 168, y: sy + 66 }, wt: { x: W * 0.1, y: H * 0.8 }, ap: { x: W * 0.86, y: H * 0.8 } }; },
      read(st) { return st.on === 'wt' ? 1000 + st.off : st.on === 'ap' ? Math.round(620 * (1 + st.off / 1000)) : 0; },
      weight(c, x, y, s = 1) {
        XK.shadow(c, x, y + 4, 36 * s, 7 * s, 0.3);
        const g = c.createLinearGradient(x - 34 * s, 0, x + 34 * s, 0); g.addColorStop(0, '#8a6a1c'); g.addColorStop(0.4, '#f6dd8f'); g.addColorStop(0.55, '#e2bb52'); g.addColorStop(1, '#6e500e');
        c.fillStyle = g; c.fillRect(x - 32 * s, y - 62 * s, 64 * s, 60 * s); c.beginPath(); c.ellipse(x, y - 2 * s, 32 * s, 8 * s, 0, 0, Math.PI); c.fill();
        c.fillStyle = '#f8e3a6'; c.beginPath(); c.ellipse(x, y - 62 * s, 32 * s, 8 * s, 0, 0, XK.TAU); c.fill();
        c.fillStyle = g; c.fillRect(x - 9 * s, y - 84 * s, 18 * s, 22 * s); c.beginPath(); c.ellipse(x, y - 86 * s, 15 * s, 11 * s, 0, 0, XK.TAU); c.fill();
        c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(x - 5 * s, y - 89 * s, 5 * s, 3 * s, -0.4, 0, XK.TAU); c.fill();
        XK.txt(c, '1 kg', x, y - 26 * s, '#3b2a06', `800 ${Math.round(17 * s)}px`);
      },
      apples(c, x, y) {
        XK.shadow(c, x, y + 4, 50, 8, 0.25);
        c.fillStyle = 'rgba(240,248,255,.6)'; c.strokeStyle = 'rgba(29,36,51,.45)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x - 50, y); c.lineTo(x - 42, y - 78); c.lineTo(x + 42, y - 78); c.lineTo(x + 50, y); c.closePath(); c.fill(); c.stroke();
        [[-22, -20], [20, -20], [0, -52], [-2, -18]].forEach(([dx, dy], i) => { if (i === 3) return; XK.ball(c, x + dx, y + dy, 20, '#e2403a', '#8f1a14', '#ffd0c8'); XK.line(c, x + dx, y + dy - 19, x + dx + 3, y + dy - 29, '#5a3a1a', 3); c.fillStyle = '#4f9a3e'; c.beginPath(); c.ellipse(x + dx + 9, y + dy - 26, 7, 3.5, -0.5, 0, XK.TAU); c.fill(); });
        c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 36, y - 70); c.lineTo(x - 40, y - 12); c.stroke();
      },
      draw(c, W, H, dt, st, api) {
        const g = this.geo(W, H), r = this.read(st), cy = H * 0.6;
        // 가게: 벽, 선반 위 과일 상자, 계산대
        XK.vgrad(c, 0, 0, W, cy, ['#fbf1de', '#efdcbc']);
        for (let x = 0; x < W; x += 34) XK.line(c, x, 0, x, cy, 'rgba(160,120,70,.08)', 10);
        { const wx = W * 0.05, wy = 16, ww = W * 0.26, wh = H * 0.13; XK.vgrad(c, wx, wy, ww, wh, ['#9cc9ef', '#d8ecfa']); c.fillStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.ellipse(wx + ww * 0.3 + Math.sin(st.t * 0.15) * 20, wy + wh * 0.35, 26, 7, 0, 0, XK.TAU); c.fill(); c.fillStyle = '#7dbb46'; c.fillRect(wx, wy + wh * 0.75, ww, wh * 0.25); c.strokeStyle = '#8f6236'; c.lineWidth = 5; c.strokeRect(wx, wy, ww, wh); XK.line(c, wx + ww / 2, wy, wx + ww / 2, wy + wh, '#8f6236', 3);
          const lg = c.createLinearGradient(wx, wy + wh, wx + ww * 0.8, cy); lg.addColorStop(0, 'rgba(255,250,220,.25)'); lg.addColorStop(1, 'rgba(255,250,220,0)'); c.fillStyle = lg; c.beginPath(); c.moveTo(wx, wy + wh); c.lineTo(wx + ww, wy + wh); c.lineTo(wx + ww * 1.6, cy); c.lineTo(wx + ww * 0.4, cy); c.closePath(); c.fill(); }
        { const sgx = W * 0.47, sw = Math.sin(st.t * 1.3) * 0.05; XK.line(c, sgx - 40, 0, sgx - 40, 22, '#5a3a1a', 2); XK.line(c, sgx + 40, 0, sgx + 40, 22, '#5a3a1a', 2); c.save(); c.translate(sgx, 22); c.rotate(sw); c.fillStyle = '#c95353'; XK.rr(c, -62, 0, 124, 34, 8); c.fill(); c.strokeStyle = '#7a2a2a'; c.lineWidth = 2; c.stroke(); XK.txt(c, '과일 가게', 0, 24, '#fff', '800 17px'); c.restore(); }
        const shy = H * 0.24; c.fillStyle = '#9c6f45'; c.fillRect(0, shy, W * 0.6, 10); XK.shadow(c, W * 0.3, shy + 14, W * 0.3, 4, 0.15);
        [['#e2403a', '#8f1a14'], ['#f39a2b', '#a85a0a'], ['#7dbb46', '#3f7a1e'], ['#e2403a', '#8f1a14']].forEach(([a, b], i) => { const bx = 18 + i * W * 0.145, bw = W * 0.12; const R = XK.rnd(i + 3); for (let k = 0; k < 7; k++) XK.ball(c, bx + 10 + R() * (bw - 20), shy - 10 - R() * 14, 9, a, b); c.fillStyle = '#c99a64'; c.fillRect(bx, shy - 16, bw, 16); c.strokeStyle = '#8f6236'; c.lineWidth = 1.5; c.strokeRect(bx, shy - 16, bw, 16); });
        XK.vgrad(c, 0, cy, W, H * 0.26, ['#d8b07c', '#c4935a']); c.strokeStyle = 'rgba(110,70,30,.18)'; c.lineWidth = 1.5; for (let i = 1; i < 6; i++) { const y = cy + i * H * 0.045; c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(W * 0.3, y + 3, W * 0.6, y - 3, W, y); c.stroke(); }
        XK.vgrad(c, 0, H * 0.86, W, H * 0.14, ['#8f6236', '#6e4a28']); c.fillStyle = 'rgba(255,255,255,.15)'; c.fillRect(0, H * 0.86, W, 3);
        // 기록판
        const bx = W * 0.64, by = 14, bw = W * 0.34, bh = 120;
        c.fillStyle = '#24402f'; c.strokeStyle = '#8f6236'; c.lineWidth = 6; XK.rr(c, bx, by, bw, bh, 6); c.fill(); c.stroke();
        XK.txt(c, '기록', bx + bw / 2, by + 22, '#e6efe8', '800 16px');
        const rows = [['분동 1 kg', st.rec.w0], ['맞춘 뒤 분동', st.rec.w1], ['사과(맞추기 전)', st.rec.a0], ['사과(맞춘 뒤)', st.rec.a1]];
        rows.forEach(([k, v], i) => { const y = by + 44 + i * 21; XK.txt(c, k, bx + 12, y, '#cfe0d4', '600 14px', 'left'); XK.txt(c, v == null ? '—' : `${v.toLocaleString('ko-KR')} g`, bx + bw - 12, y, v == null ? '#7f9a88' : '#ffe28a', '800 15px', 'right'); });
        // 저울
        const sx = g.sx, sy = g.sy;
        XK.shadow(c, sx, sy + 98, 200, 14, 0.3);
        const bg = c.createLinearGradient(0, sy, 0, sy + 96); bg.addColorStop(0, '#f1f4f8'); bg.addColorStop(1, '#9aa3b4'); c.fillStyle = bg; c.strokeStyle = '#1d2433'; c.lineWidth = 2.5; XK.rr(c, sx - 200, sy + 6, 400, 92, 16); c.fill(); c.stroke();
        c.fillStyle = '#0f1a12'; XK.rr(c, sx - 130, sy + 22, 220, 58, 8); c.fill(); c.strokeStyle = '#4b5263'; c.lineWidth = 2; c.stroke();
        XK.glow(c, sx - 20, sy + 51, 80, 'rgba(125,255,176,.12)');
        XK.txt(c, `${r.toLocaleString('ko-KR')} g`, sx - 20, sy + 64, '#7dffb0', '800 36px');
        XK.txt(c, '전자저울', sx - 186, sy + 88, '#5b6578', '700 12px', 'left');
        const pg = c.createLinearGradient(0, sy - 16, 0, sy + 8); pg.addColorStop(0, '#ffffff'); pg.addColorStop(1, '#a5aec0'); c.fillStyle = '#7d8696'; c.fillRect(sx - 20, sy, 40, 8); c.fillStyle = pg; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.ellipse(sx, sy, 170, 20, 0, 0, XK.TAU); c.fill(); c.stroke();
        // 조정 나사
        c.save(); c.translate(g.kn.x, g.kn.y); c.rotate(st.knob); XK.ball(c, 0, 0, 22, '#d7dbe3', '#5b6578'); XK.line(c, -15, 0, 15, 0, '#1d2433', 4); c.restore();
        XK.txt(c, '조정 나사', g.kn.x, g.kn.y + 46, '#3b2a06', '800 13px');
        if (st.on === 'wt' && st.off) { const a = 0.6 + 0.4 * Math.sin(st.t * 4); c.globalAlpha = a; XK.arrow(c, g.kn.x - 30, g.kn.y - 30, g.kn.x - 60, g.kn.y - 30, '#e4572e', 3, 10); XK.arrow(c, g.kn.x + 30, g.kn.y - 30, g.kn.x + 60, g.kn.y - 30, '#e4572e', 3, 10); c.globalAlpha = 1; }
        // 물건
        const at = (k, home) => (st.drag && st.drag.k === k ? st.drag : st.on === k ? { x: sx, y: sy - 6 } : home);
        const w = at('wt', g.wt), a = at('ap', g.ap);
        if (!(st.on === 'wt' || (st.drag && st.drag.k === 'wt'))) XK.txt(c, '표준 분동', g.wt.x, g.wt.y + 24, '#3b2a06', '800 14px');
        if (!(st.on === 'ap' || (st.drag && st.drag.k === 'ap'))) XK.txt(c, '사과 한 봉지', g.ap.x, g.ap.y + 24, '#3b2a06', '800 14px');
        this.weight(c, w.x, w.y, 1.05); this.apples(c, a.x, a.y);
        if (!st.off && st.rec.w1) { c.save(); c.translate(sx + 118, sy - 66); c.rotate(-0.18); c.strokeStyle = '#2f9e5b'; c.lineWidth = 3; XK.rr(c, -50, -16, 100, 32, 6); c.stroke(); XK.txt(c, '교정 완료', 0, 6, '#2f9e5b', '800 17px'); c.restore(); }
      },
      hint(st) { const g = this.geo(st.W, st.H); return { x: g.wt.x, y: g.wt.y - 50, dx: 1, dy: -0.15, label: '분동을 저울에', dist: 150 }; },
      down(p, st) {
        const g = this.geo(st.W, st.H);
        if (Math.hypot(p.x - g.kn.x, p.y - g.kn.y) < 44) { st.drag = { k: 'kn', x: p.x }; return; }
        const pos = (k, h) => st.on === k ? { x: g.sx, y: g.sy } : h;
        [['wt', g.wt], ['ap', g.ap]].forEach(([k, h]) => { const q = pos(k, h); if (!st.drag && Math.abs(p.x - q.x) < 56 && p.y > q.y - 110 && p.y < q.y + 24) { st.drag = { k, x: p.x, y: p.y }; if (st.on === k) st.on = null; } });
      },
      move(p, st, api) { if (!st.drag) return; if (st.drag.k === 'kn') { const d = (p.x - st.drag.x) / 4; st.drag.x = p.x; st.knob += d * 0.1; this.turn(st, api, -d); } else { st.drag.x = p.x; st.drag.y = p.y; } },
      up(p, st, api) { if (!st.drag) return; const k = st.drag.k; st.drag = null; if (k === 'kn') return; const g = this.geo(st.W, st.H); if (Math.abs(p.x - g.sx) < 170 && Math.abs(p.y - g.sy) < 130) this.place(st, api, k); },
      place(st, api, k) {
        st.on = k; const r = this.read(st);
        if (k === 'wt') { if (st.off) st.rec.w0 = r; else st.rec.w1 = r; api.ok(1); api.say(st.off ? `1 kg 분동인데 <b>${r.toLocaleString('ko-KR')} g</b>! 저울이 ${st.off > 0 ? st.off + ' g 더' : -st.off + ' g 덜'} 나온다. <b>조정 나사</b>를 좌우로 끌어 1000 g에 맞추자.` : '분동이 <b>1000 g</b>으로 읽힌다 — 표준과 맞다. 이제 사과를 올려 보자.'); }
        else {
          if (st.off) { st.rec.a0 = r; api.say(`사과 <b>${r} g</b>? 저울이 맞는지 아직 모른다. 먼저 <b>분동</b>으로 확인해 보자.`); }
          else { st.rec.a1 = r; api.ok(3); api.say(`사과 <b>${r} g</b>. ${st.rec.a0 ? `맞추기 전엔 ${st.rec.a0} g으로 ${st.rec.a0 - r} g 더 나왔다 — 손님이 그만큼 손해를 볼 뻔했다.` : '표준에 맞춘 저울이라 어느 가게에서 재도 같은 값이다.'}`); }
        }
      },
      turn(st, api, d) {
        if (st.on !== 'wt') { api.say('먼저 <b>분동</b>을 올려야 맞출 기준이 생긴다.'); return; }
        st.off = Math.round(XK.clamp(st.off + d, -60, 60));
        if (Math.abs(st.off) <= 1) { st.off = 0; st.rec.w1 = 1000; api.ok(2); api.say('<b>1000 g</b> — 표준 분동에 맞췄다(교정). 분동을 내리고 <b>사과</b>를 올려 보자.'); }
        else api.say(`분동 1 kg → 저울 <b>${(1000 + st.off).toLocaleString('ko-KR')} g</b>`);
      },
      key(k, st, api) { if (k === 'Enter') { this.place(st, api, st.on === 'wt' ? 'ap' : 'wt'); return true; } const d = { ArrowLeft: -2, ArrowRight: 2 }[k]; if (!d) return false; this.turn(st, api, d); return true; },
      test(st, api, step) { if (step >= 1) this.place(st, api, 'wt'); if (step >= 2) this.turn(st, api, -st.off); if (step >= 3) this.place(st, api, 'ap'); },
    },

    // ── 1-2-1 2차시 이론 그림: 측정 표준이 생활까지 오는 길(교정의 사슬) ──
    chain: {
      Q: [['질량', ['변하지 않는 값(플랑크 상수)으로 1 kg을 정한다', '나라의 질량 표준 — 정의를 실제로 구현한 장치', '기준 분동 — 나라의 표준에 맞춰 둔 분동', '가게 저울 — 기준 분동으로 정기적으로 검사', '사과 한 봉지 620 g — 어디서 사도 같은 양']],
          ['길이', ['빛이 진공에서 1/299,792,458초 동안 가는 거리 = 1 m', '나라의 길이 표준 — 빛(레이저)으로 길이를 재는 장치', '기준 자·게이지 — 나라의 표준에 맞춘다', '공장의 캘리퍼스 — 기준 게이지로 맞춘다', '신발 치수 240 mm — 신어 보지 않아도 맞는다']],
          ['시간', ['세슘 원자가 내는 빛이 9,192,631,770번 떨리는 시간 = 1초', '나라의 시간 표준 — 원자시계', '표준시 신호 — 원자시계에 맞춘 시각을 전파·인터넷으로 보낸다', '휴대 전화 시계 — 표준시 신호를 받아 저절로 맞춘다', '8시 정각 열차 — 모두 같은 시각에 모인다']]],
      NODES: ['단위의 정의', '나라의 표준', '기준기', '생활 측정기', '우리 생활'],
      init(st, api) { st.q = 0; st.sel = 4; st.seen = new Set([4]); this.say(st, api); },
      say(st, api) { st.seen.add(st.sel); if (st.seen.size >= 5) api.ok(1); const [n, L] = this.Q[st.q]; api.say(`<b>${n}</b> · ${this.NODES[st.sel]}: ${L[st.sel]}`); },
      pos(W, H, i) { return { x: W * (0.12 + 0.19 * i), y: H * (0.33 + (i % 2) * 0.33) }; },
      icon(c, i, x, y, t, q) {
        const gold = (x0, w, h) => { const g = c.createLinearGradient(x0, 0, x0 + w, 0); g.addColorStop(0, '#8a6a1c'); g.addColorStop(0.45, '#f6dd8f'); g.addColorStop(1, '#6e500e'); return g; };
        if (i === 0) {
          XK.glow(c, x, y, 44, 'rgba(120,200,255,.45)');
          if (q === 0) { XK.txt(c, 'h', x, y + 14, '#1d4e86', 'italic 800 40px'); }
          else if (q === 1) { c.strokeStyle = '#e4572e'; c.lineWidth = 3; c.beginPath(); for (let k = 0; k <= 60; k++) { const xx = x - 34 + k * 68 / 60, yy = y + Math.sin(k * 0.45 - t * 6) * 9; if (!k) c.moveTo(xx, yy); else c.lineTo(xx, yy); } c.stroke(); XK.arrow(c, x + 26, y + 20, x + 38, y + 20, '#e4572e', 2, 8); XK.txt(c, 'c', x - 26, y + 26, '#1d4e86', 'italic 800 18px'); }
          else { XK.ball(c, x, y, 11, '#e4572e', '#8f2a1a'); for (let k = 0; k < 3; k++) { c.strokeStyle = 'rgba(29,78,134,.8)'; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y, 30, 10, k * 1.05 + t * 0.8, 0, XK.TAU); c.stroke(); } XK.txt(c, 'Cs', x, y + 4, '#fff', '800 10px'); }
        } else if (i === 1) {
          if (q === 0) { c.fillStyle = '#5b6578'; c.fillRect(x - 32, y + 24, 64, 6); c.fillStyle = '#8a93a6'; c.fillRect(x - 3, y - 26, 6, 50); const tilt = Math.sin(t * 1.5) * 0.06; c.save(); c.translate(x, y - 26); c.rotate(tilt); c.fillStyle = '#c7ccd6'; c.fillRect(-30, -3, 60, 6); c.restore(); XK.ball(c, x, y - 26, 4, '#e4572e', '#8f2a1a'); const ly = Math.sin(tilt) * 30; XK.line(c, x - 28, y - 26 - ly, x - 28, y - 6 - ly, '#5b6578', 1.5); const cg = c.createLinearGradient(x - 38, 0, x - 18, 0); cg.addColorStop(0, '#a85a1a'); cg.addColorStop(0.5, '#f2a04a'); cg.addColorStop(1, '#7a3a0a'); c.fillStyle = cg; c.fillRect(x - 38, y - 6 - ly, 20, 16); for (let k = 0; k < 4; k++) XK.line(c, x - 38, y - 3 - ly + k * 4, x - 18, y - 3 - ly + k * 4, 'rgba(90,40,0,.6)', 1); XK.line(c, x + 28, y - 26 + ly, x + 28, y - 4 + ly, '#5b6578', 1.5); c.fillStyle = gold(x + 20, 16); c.fillRect(x + 20, y - 4 + ly, 16, 14); XK.txt(c, 'h', x + 14, y + 20, '#1d4e86', 'italic 800 15px'); }
          else if (q === 1) { c.fillStyle = '#3b4252'; XK.rr(c, x - 34, y - 8, 30, 22, 4); c.fill(); XK.ball(c, x - 2, y + 3, 4, '#ff6b5b', '#a01e10'); XK.glow(c, x + 2, y + 3, 10, 'rgba(255,80,60,.8)'); XK.line(c, x, y + 3, x + 34, y + 3, `rgba(255,70,50,${0.7 + 0.3 * Math.sin(t * 8)})`, 2.5); c.fillStyle = '#c7ccd6'; c.fillRect(x + 28, y - 10, 6, 26); }
          else { const cg = c.createLinearGradient(x - 22, 0, x + 22, 0); cg.addColorStop(0, '#5b6578'); cg.addColorStop(0.5, '#c7ccd6'); cg.addColorStop(1, '#5b6578'); c.fillStyle = cg; XK.rr(c, x - 22, y - 30, 44, 60, 5); c.fill(); for (let k = 0; k < 4; k++) XK.ball(c, x - 12 + (k % 2) * 24, y - 18 + Math.floor(k / 2) * 12, 3, (Math.floor(t * 2) + k) % 3 ? '#7dffb0' : '#1f5a35', '#1f5a35'); c.fillStyle = '#0f1a12'; XK.rr(c, x - 16, y + 4, 32, 16, 3); c.fill(); XK.txt(c, '1 s', x, y + 16, '#7dffb0', '700 10px'); }
        } else if (i === 2) {
          if (q === 0) { [[-16, 0.75], [4, 1], [24, 0.55]].forEach(([dx, s]) => { c.fillStyle = gold(x + dx - 10 * s, 20 * s); c.fillRect(x + dx - 10 * s, y + 20 - 30 * s, 20 * s, 30 * s); c.beginPath(); c.ellipse(x + dx, y + 20 - 34 * s, 6 * s, 5 * s, 0, 0, XK.TAU); c.fill(); }); c.fillStyle = '#5b6578'; c.fillRect(x - 32, y + 20, 64, 5); }
          else if (q === 1) { const mg = c.createLinearGradient(0, y - 8, 0, y + 8); mg.addColorStop(0, '#eef1f5'); mg.addColorStop(1, '#8a93a6'); c.fillStyle = mg; c.save(); c.translate(x, y); c.rotate(-0.25); c.fillRect(-36, -8, 72, 16); for (let k = 0; k <= 14; k++) XK.line(c, -34 + k * 68 / 14, -8, -34 + k * 68 / 14, k % 5 ? -3 : 1, '#1d2433', 1); c.restore(); [[-14, 16], [6, 18], [22, 14]].forEach(([dx, dy]) => { c.fillStyle = '#c7ccd6'; c.strokeStyle = '#5b6578'; c.lineWidth = 1; c.fillRect(x + dx - 6, y + dy - 4, 12, 9); c.strokeRect(x + dx - 6, y + dy - 4, 12, 9); }); }
          else { c.strokeStyle = '#5b6578'; c.lineWidth = 6; c.beginPath(); c.moveTo(x - 8, y + 26); c.lineTo(x - 8, y - 18); c.stroke(); c.fillStyle = '#7d8696'; c.fillRect(x - 16, y + 24, 16, 6); for (let k = 0; k < 3; k++) { const q2 = (t * 0.8 + k / 3) % 1; c.strokeStyle = `rgba(74,144,217,${1 - q2})`; c.lineWidth = 2.5; c.beginPath(); c.arc(x - 8, y - 18, 8 + q2 * 26, -0.9, 0.9); c.stroke(); } XK.ball(c, x - 8, y - 20, 5, '#e4572e', '#8f2a1a'); }
        } else if (i === 3) {
          if (q === 0) { c.fillStyle = '#c7ccd6'; XK.rr(c, x - 30, y, 60, 24, 6); c.fill(); c.fillStyle = '#0f1a12'; XK.rr(c, x - 20, y + 5, 40, 14, 3); c.fill(); XK.txt(c, '620 g', x, y + 16, '#7dffb0', '700 10px'); c.fillStyle = '#eef1f5'; c.beginPath(); c.ellipse(x, y - 4, 32, 7, 0, 0, XK.TAU); c.fill(); c.strokeStyle = '#5b6578'; c.lineWidth = 1; c.stroke(); }
          else if (q === 1) { c.fillStyle = '#b7bcc6'; c.strokeStyle = '#5b6578'; c.lineWidth = 1.5; c.fillRect(x - 34, y - 6, 68, 12); c.strokeRect(x - 34, y - 6, 68, 12); for (let k = 0; k <= 16; k++) XK.line(c, x - 32 + k * 4, y - 6, x - 32 + k * 4, y - (k % 5 ? 2 : 0), '#1d2433', 0.8); c.fillRect(x - 34, y - 6, 8, 30); c.strokeRect(x - 34, y - 6, 8, 30); const jx = x - 6 + Math.sin(t) * 6; c.fillRect(jx, y - 6, 10, 30); c.strokeRect(jx, y - 6, 10, 30); }
          else { c.fillStyle = '#1d2433'; XK.rr(c, x - 17, y - 30, 34, 60, 7); c.fill(); XK.vgrad(c, x - 14, y - 25, 28, 48, ['#2b4d86', '#16284a']); XK.txt(c, '08:00', x, y + 2, '#fff', '800 10px'); c.fillStyle = '#7dffb0'; c.beginPath(); c.arc(x + 8, y - 18, 2.5, 0, XK.TAU); c.fill(); }
        } else {
          if (q === 0) { XK.ball(c, x - 12, y + 8, 14, '#e2403a', '#8f1a14', '#ffd0c8'); XK.ball(c, x + 13, y + 6, 14, '#e2403a', '#8f1a14', '#ffd0c8'); XK.ball(c, x + 1, y - 15, 14, '#e2403a', '#8f1a14', '#ffd0c8'); XK.line(c, x + 1, y - 28, x + 4, y - 36, '#5a3a1a', 2.5); }
          else if (q === 1) { c.fillStyle = '#e4572e'; c.strokeStyle = '#8f2a1a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 30, y + 14); c.lineTo(x - 30, y - 10); c.quadraticCurveTo(x - 24, y - 16, x - 14, y - 12); c.quadraticCurveTo(x - 4, y + 2, x + 22, y + 2); c.quadraticCurveTo(x + 34, y + 4, x + 32, y + 14); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#f4f6f9'; c.fillRect(x - 32, y + 14, 66, 6); XK.line(c, x - 18, y - 8, x - 6, y - 2, '#fff', 2); }
          else { const tx = x + Math.sin(t * 0.8) * 3; XK.line(c, x - 40, y + 20, x + 40, y + 20, '#5b6578', 2); c.fillStyle = '#e9edf3'; c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(tx - 40, y + 14); c.lineTo(tx - 40, y - 14); c.lineTo(tx + 20, y - 14); c.quadraticCurveTo(tx + 40, y - 12, tx + 42, y + 14); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#2f7fc8'; c.fillRect(tx - 40, y + 2, 82, 5); c.fillStyle = '#1d4e86'; for (let k = 0; k < 4; k++) c.fillRect(tx - 36 + k * 13, y - 9, 9, 8); c.beginPath(); c.moveTo(tx + 22, y - 10); c.quadraticCurveTo(tx + 34, y - 9, tx + 37, y - 1); c.lineTo(tx + 22, y - 1); c.fill(); [-28, -14, 8, 22].forEach((d) => XK.ball(c, tx + d, y + 16, 3.5, '#5b6578', '#1d2433')); XK.txt(c, '8:00', x, y - 20, '#c0392b', '800 10px'); }
        }
      },
      draw(c, W, H, dt, st) {
        XK.vgrad(c, 0, 0, W, H, ['#f4f6f9', '#e2e7ef']);
        this.Q.forEach(([n], i) => { const w = (W - 40) / 3, x = 20 + i * w; c.fillStyle = i === st.q ? '#ffd84d' : '#fff'; c.strokeStyle = '#1d2433'; c.lineWidth = 2.5; XK.rr(c, x + 6, 12, w - 12, 40, 20); c.fill(); c.stroke(); XK.txt(c, n, x + w / 2, 39, '#1d2433', i === st.q ? '800 19px' : '600 18px'); });
        const P = this.NODES.map((_, i) => this.pos(W, H, i));
        for (let i = 0; i < 4; i++) { const a = P[i], b = P[i + 1]; c.strokeStyle = '#9aa5bb'; c.lineWidth = 6; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); const q = (st.t * 0.5 + i * 0.25) % 1; XK.glow(c, XK.lerp(a.x, b.x, q), XK.lerp(a.y, b.y, q), 16, 'rgba(255,216,77,.95)'); XK.pill(c, (a.x + b.x) / 2 + (i % 2 ? -14 : 14), (a.y + b.y) / 2, '교정', 'rgba(47,158,91,.9)', '#fff', '700 12px'); }
        P.forEach((p, i) => {
          const on = i === st.sel, r = 64 + (on ? 4 + Math.sin(st.t * 3) * 2 : 0);
          XK.shadow(c, p.x + 3, p.y + r + 2, r * 0.8, 5, 0.15);
          const bg = c.createRadialGradient(p.x - r * 0.3, p.y - r * 0.3, 4, p.x, p.y, r); bg.addColorStop(0, '#ffffff'); bg.addColorStop(1, on ? '#fff1c4' : '#e9edf3'); c.fillStyle = bg; c.strokeStyle = on ? '#e4572e' : '#1d2433'; c.lineWidth = on ? 4 : 2.5; c.beginPath(); c.arc(p.x, p.y, r, 0, XK.TAU); c.fill(); c.stroke();
          c.save(); c.translate(p.x, p.y); c.scale(1.45, 1.45); this.icon(c, i, 0, 0, st.t, st.q); c.restore(); XK.pill(c, p.x, p.y + r + 18, this.NODES[i], on ? '#e4572e' : '#1d2433', '#fff', '700 14px');
          if (st.seen.has(i)) { const bx = p.x + r * 0.78, by = p.y - r * 0.72; XK.ball(c, bx, by, 12, '#2f9e5b', '#1a6b3a'); c.strokeStyle = '#fff'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(bx - 5, by); c.lineTo(bx - 1, by + 4); c.lineTo(bx + 6, by - 4); c.stroke(); c.lineCap = 'butt'; }
        });
        XK.arrow(c, W * 0.06, H - 22, W * 0.94, H - 22, '#2f9e5b', 4, 16); XK.txt(c, '더 정확한 기준 → 한 단계씩 아래로 전해진다', W / 2, H - 32, '#2f9e5b', '700 14px');
      },
      hint(st) { const p = this.pos(st.W, st.H, 0); return { tap: true, x: p.x, y: p.y, label: '눌러서 보기' }; },
      down(p, st, api) { if (p.y < 58) { st.q = XK.clamp(Math.floor((p.x - 20) / ((st.W - 40) / 3)), 0, 2); this.say(st, api); return; } this.NODES.forEach((_, i) => { const q = this.pos(st.W, st.H, i); if (Math.hypot(p.x - q.x, p.y - q.y) < 70) { st.sel = i; this.say(st, api); } }); },
      key(k, st, api) { const d = { ArrowLeft: -1, ArrowRight: 1 }[k]; if (d) { st.sel = XK.clamp(st.sel + d, 0, 4); this.say(st, api); return true; } if (k === 'ArrowDown' || k === 'ArrowUp') { st.q = (st.q + (k === 'ArrowDown' ? 1 : 2)) % 3; this.say(st, api); return true; } return false; },
      test(st, api, q, sel) { st.q = q; st.sel = sel; this.say(st, api); },
    },

    // ── 1-2-1 2차시: 손으로 누른 기록과 전자 계시. 선수 기록·사람의 반응 시간은 이해를 돕기 위한 예 ──
    race: {
      init(st, api) { st.ph = 'ready'; st.tm = 0; st.T = 10.5; st.hand = null; st.n = 0; st.cross = null; st.runs = []; api.say('화면을 눌러 <b>출발</b>! 선수 가슴이 흰 결승선을 지나는 순간 다시 눌러 손 초시계를 멈추자.'); },
      runner(c, x, ty, ph, s, moving) {
        const bob = moving ? Math.abs(Math.sin(ph)) * 4 * s : 0, hip = [x, ty - 52 * s - bob], sh = [x + 9 * s, ty - 92 * s - bob];
        c.lineCap = 'round'; c.lineJoin = 'round';
        const limb = (o, a1, a2, l, w, col, shoe) => { const k = [o[0] + Math.sin(a1) * l, o[1] + Math.cos(a1) * l], e = [k[0] + Math.sin(a2) * l, k[1] + Math.cos(a2) * l]; c.strokeStyle = col; c.lineWidth = w; c.beginPath(); c.moveTo(o[0], o[1]); c.lineTo(k[0], k[1]); c.lineTo(e[0], e[1]); c.stroke(); if (shoe) { c.fillStyle = shoe; c.beginPath(); c.ellipse(e[0] + 5 * s, e[1] + 2 * s, 9 * s, 4.5 * s, Math.sin(a2) * 0.6, 0, XK.TAU); c.fill(); } };
        const A = moving ? 0.85 : 0.1, leg = (p) => [Math.sin(p) * A, Math.sin(p) * A - (moving ? 0.6 + 0.6 * Math.max(0, Math.cos(p)) : 0.1)], arm = (p) => [-Math.sin(p) * A, -Math.sin(p) * A + 1.5];
        const [b1, b2] = leg(ph + Math.PI), [f1, f2] = leg(ph), [ba1, ba2] = arm(ph + Math.PI), [fa1, fa2] = arm(ph);
        limb(hip, b1, b2, 27 * s, 10 * s, '#7a4b33', '#1d2433'); limb(sh, ba1, ba2, 18 * s, 7 * s, '#7a4b33');
        c.strokeStyle = '#1d2433'; c.lineWidth = 15 * s; c.beginPath(); c.moveTo(hip[0] - 2 * s, hip[1] + 6 * s); c.lineTo(hip[0] + 1 * s, hip[1] - 4 * s); c.stroke();
        c.strokeStyle = '#2f7fc8'; c.lineWidth = 19 * s; c.beginPath(); c.moveTo(hip[0], hip[1] - 4 * s); c.lineTo(sh[0], sh[1]); c.stroke();
        c.save(); c.translate((hip[0] + sh[0]) / 2, (hip[1] + sh[1]) / 2); c.rotate(Math.atan2(sh[0] - hip[0], hip[1] - sh[1])); c.fillStyle = '#fff'; c.fillRect(-7 * s, -8 * s, 14 * s, 12 * s); XK.txt(c, '7', 0, 2 * s, '#1d2433', `800 ${Math.round(10 * s)}px`); c.restore();
        limb(hip, f1, f2, 27 * s, 11 * s, '#8a573c', '#e4572e'); limb(sh, fa1, fa2, 18 * s, 8 * s, '#8a573c');
        XK.ball(c, sh[0] + 6 * s, sh[1] - 16 * s, 11 * s, '#c98f68', '#7a4b33', '#e8c0a0');
        c.fillStyle = '#1d2433'; c.beginPath(); c.arc(sh[0] + 4 * s, sh[1] - 19 * s, 10 * s, Math.PI * 0.95, Math.PI * 2.05); c.fill();
        c.lineCap = 'butt';
      },
      draw(c, W, H, dt, st, api) {
        if (st.ph === 'run') { st.tm += dt; if (st.tm >= st.T && !st.cross) st.cross = st.T; if (st.tm > st.T + 1.6) { st.ph = 'late'; this.stop(st, api, st.tm); } }
        else if (st.ph === 'done' || st.ph === 'late') st.tm = Math.min(st.tm + dt, st.T + 2.2);
        const x0 = W * 0.1, x1 = W * 0.84, ty = H * 0.72, over = Math.max(0, st.tm - st.T), x = (st.tm <= st.T ? x0 + (x1 - x0) * st.tm / st.T : x1 + 70 * (1 - Math.exp(-over * 1.2))) - 9 * 1.5;
        // 하늘·관중석
        XK.vgrad(c, 0, 0, W, H * 0.4, ['#3c6fb5', '#9cc7ef']);
        XK.vgrad(c, 0, H * 0.16, W, H * 0.26, ['#3b4252', '#262c3a']);
        const R = XK.rnd(4), cols = ['#e4572e', '#ffd84d', '#fbfcf9', '#4a90d9', '#7dbb46'];
        for (let row = 0; row < 4; row++) for (let i = 0; i < 26; i++) { const cx = (i + (row % 2) * 0.5) * W / 25, cy = H * 0.22 + row * H * 0.05, jump = (st.ph === 'run' ? Math.max(0, Math.sin(st.t * 7 + i * 1.7 + row)) * 4 : 0); c.fillStyle = cols[(i + row * 3) % 5]; XK.rr(c, cx - 7, cy - jump, 14, 14, 5); c.fill(); XK.ball(c, cx, cy - 8 - jump, 5, '#d9a77f', '#8a573c'); }
        XK.vgrad(c, 0, H * 0.42, W, H * 0.06, ['#4f8f45', '#3e7a37']); XK.vgrad(c, 0, H * 0.48, W, H * 0.52, ['#c4553a', '#a9432c']);
        for (let i = 0; i < 4; i++) XK.line(c, 0, H * 0.52 + i * H * 0.12, W, H * 0.52 + i * H * 0.12, 'rgba(255,255,255,.8)', 2);
        // 결승선(바둑판)과 전자 계시
        for (let k = 0; k < 20; k++) { c.fillStyle = k % 2 ? '#1d2433' : '#fff'; c.fillRect(x1 - 4, H * 0.48 + k * H * 0.025, 8, H * 0.025); }
        const cmx = x1 - 64, cmy = H * 0.36; c.fillStyle = '#4b5263'; c.fillRect(cmx - 3, cmy + 10, 6, H * 0.47 - cmy - 10); c.fillStyle = '#2b303b'; c.fillRect(cmx - 12, H * 0.465, 24, 6);
        c.save(); c.translate(cmx, cmy); c.rotate(0.35); c.fillStyle = '#1d2433'; XK.rr(c, -16, -10, 32, 20, 4); c.fill(); c.fillStyle = '#3b4252'; XK.rr(c, 14, -7, 10, 14, 2); c.fill(); XK.ball(c, 22, 0, 5, '#7de0ff', '#1d5f7c'); c.restore();
        XK.pill(c, cmx - 10, cmy - 24, '전자 계시 카메라', 'rgba(16,20,32,.88)', '#7dffb0', '700 12px');
        const flash = st.cross ? Math.max(0, 1 - (st.tm - st.cross) * 2) : 0;
        if (flash > 0) { XK.glow(c, x1, ty - 70, 90, `rgba(255,250,200,${0.8 * flash})`); XK.line(c, cmx + 22, cmy + 8, x1, ty - 70, `rgba(125,224,255,${flash})`, 3); }
        // 선수
        XK.shadow(c, x + 6, ty + 4, 26, 6, 0.3);
        this.runner(c, x, ty, st.tm <= st.T ? st.tm * 6.5 : st.T * 6.5 + (1 - Math.exp(-over * 1.2)) * 6, 1.5, st.ph !== 'ready' && over < 1.6);
        // 기록판
        c.fillStyle = 'rgba(16,20,32,.92)'; XK.rr(c, W * 0.05, 12, W * 0.9, 52, 12); c.fill();
        const hv = st.hand != null ? st.hand : st.ph === 'run' ? st.tm : 0;
        XK.txt(c, `손 초시계 ${hv.toFixed(2)} s`, W * 0.29, 46, '#ffd84d', '800 23px');
        XK.txt(c, `전자 계시 ${st.cross && (st.ph === 'done' || st.ph === 'late') ? st.T.toFixed(2) : '–.––'} s`, W * 0.71, 46, '#7dffb0', '800 23px');
        // 기록 표
        if (st.runs.length) {
          const tx = 14, tyy = H - 18 - st.runs.length * 22 - 26, tw = W * 0.5;
          c.fillStyle = 'rgba(255,255,255,.94)'; c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; XK.rr(c, tx, tyy, tw, st.runs.length * 22 + 32, 10); c.fill(); c.stroke();
          [['회', 0.08], ['손', 0.32], ['전자', 0.6], ['차이', 0.86]].forEach(([n, f]) => XK.txt(c, n, tx + tw * f, tyy + 20, '#5b6578', '700 13px'));
          st.runs.forEach(([hd, el], i) => { const y = tyy + 42 + i * 22, df = hd - el; XK.txt(c, `${st.n - st.runs.length + i + 1}`, tx + tw * 0.08, y, '#1d2433', '700 14px'); XK.txt(c, hd.toFixed(2), tx + tw * 0.32, y, '#a8740a', '800 14px'); XK.txt(c, el.toFixed(2), tx + tw * 0.6, y, '#1f7a46', '800 14px'); XK.txt(c, `${df >= 0 ? '+' : ''}${df.toFixed(2)}`, tx + tw * 0.86, y, Math.abs(df) < 0.05 ? '#1f7a46' : '#c0392b', '800 14px'); });
        }
        if (st.ph === 'ready') XK.pill(c, W * 0.66, H - 28, '화면을 눌러 출발', '#1d2433', '#ffd84d', '800 18px');
        else if (st.ph === 'done' || st.ph === 'late') XK.pill(c, W * 0.66, H - 28, '다시 누르면 새 경기', '#1d2433', '#fff', '700 16px');
      },
      stop(st, api, v) {
        st.hand = v; st.ph = st.ph === 'late' ? 'late' : 'done'; st.n++; st.runs.push([v, st.T]); if (st.runs.length > 4) st.runs.shift();
        api.ok(1); api.ok(2); if (st.n >= 2) api.ok(3);
        const diff = v - st.T;
        api.say(`손 초시계 <b>${v.toFixed(2)} s</b>, 전자 계시 <b>${st.T.toFixed(2)} s</b> → 차이 <b>${Math.abs(diff).toFixed(2)}초</b>. ${diff < 0 ? '결승선보다 먼저 눌렀다.' : '눈으로 보고 손을 누르기까지 시간이 걸렸다.'}${st.n < 2 ? ' 한 번 더 겨뤄 보자.' : ' 할 때마다 차이도 달라진다.'}`);
      },
      hint(st) { return st.ph === 'ready' ? { tap: true, x: st.W * 0.5, y: st.H * 0.62, label: '눌러서 출발' } : null; },
      down(p, st, api) {
        if (st.ph === 'ready' || st.ph === 'done' || st.ph === 'late') { st.ph = 'run'; st.tm = 0; st.cross = null; st.hand = null; st.T = Math.round((10.2 + Math.random() * 0.8) * 100) / 100; api.say('달린다! 가슴이 결승선을 지나는 순간 눌러라.'); return; }
        if (st.ph === 'run') this.stop(st, api, st.tm);
      },
      key(k, st, api) { if (k !== 'Enter' && k !== ' ') return false; this.down({}, st, api); return true; },
      test(st, api, late) { st.ph = 'run'; st.tm = st.T + late; st.cross = st.T; this.stop(st, api, st.tm); },
    },

    // ── 1-2-2 2차시: 사진을 점(화소)으로 쪼개기 ──
    pixel: {
      NS: [4, 8, 16, 32, 64, 128],
      init(st, api) { st.n = 16; st.drag = null; st.pick = null; st.seen = new Set([16]); this.say(st, api); },
      bytes: (n) => n * n * 3,
      fmt(b) { return b >= 1024 * 1024 ? (b / 1048576).toFixed(1) + ' MB' : b >= 1024 ? Math.round(b / 1024) + ' KB' : b + ' B'; },
      say(st, api) { const n = st.n; st.seen.add(n); api.say(`가로세로 <b>${n} × ${n} = ${(n * n).toLocaleString('ko-KR')}칸</b>. 칸마다 빨강·초록·파랑 세기(0~255)를 숫자 세 개로 적는다 → <b>${(n * n * 3).toLocaleString('ko-KR')}개</b>(약 ${this.fmt(this.bytes(n))}).`); if (n <= 4) api.ok(1); if (n >= 64) api.ok(2); },
      scene() {
        if (this._s) return this._s;
        const cv = document.createElement('canvas'); cv.width = 256; cv.height = 256; const m = cv.getContext('2d');
        const g = m.createLinearGradient(0, 0, 0, 256); g.addColorStop(0, '#ff9e6b'); g.addColorStop(0.55, '#ffd28a'); g.addColorStop(0.56, '#3d7fb0'); g.addColorStop(1, '#174a75'); m.fillStyle = g; m.fillRect(0, 0, 256, 256);
        const sg = m.createRadialGradient(170, 122, 4, 170, 122, 60); sg.addColorStop(0, 'rgba(255,250,220,1)'); sg.addColorStop(0.5, 'rgba(255,240,190,.9)'); sg.addColorStop(1, 'rgba(255,240,190,0)'); m.fillStyle = sg; m.beginPath(); m.arc(170, 122, 60, 0, XK.TAU); m.fill();
        m.fillStyle = '#5a3f6e'; m.beginPath(); m.moveTo(0, 145); m.lineTo(60, 80); m.lineTo(110, 130); m.lineTo(150, 100); m.lineTo(256, 150); m.lineTo(0, 145); m.fill();
        m.fillStyle = '#4a3360'; m.beginPath(); m.moveTo(60, 80); m.lineTo(72, 96); m.lineTo(64, 110); m.lineTo(80, 141); m.lineTo(40, 143); m.closePath(); m.fill();
        m.fillStyle = 'rgba(255,240,190,.6)'; for (let i = 0; i < 9; i++) m.fillRect(150 + Math.sin(i) * 20, 150 + i * 10, 40 - i * 3, 3);
        m.fillStyle = '#2b2440'; m.beginPath(); m.moveTo(40, 230); m.lineTo(92, 230); m.lineTo(82, 215); m.lineTo(48, 215); m.fill(); m.fillRect(64, 176, 3, 40); m.fillStyle = '#fff'; m.beginPath(); m.moveTo(67, 178); m.lineTo(67, 212); m.lineTo(90, 212); m.fill(); m.fillStyle = '#f2e6d0'; m.beginPath(); m.moveTo(63, 184); m.lineTo(63, 212); m.lineTo(46, 212); m.fill();
        m.fillStyle = '#2b2440'; [[200, 60], [214, 52], [226, 64]].forEach(([x, y]) => { m.beginPath(); m.moveTo(x - 7, y - 2); m.quadraticCurveTo(x - 3, y - 6, x, y); m.quadraticCurveTo(x + 3, y - 6, x + 7, y - 2); m.lineTo(x, y + 1); m.fill(); });
        this._s = cv; return cv;
      },
      draw(c, W, H, dt, st) {
        XK.vgrad(c, 0, 0, W, H, ['#1b2238', '#10162a']);
        const src = this.scene(), S = Math.min(W * 0.42, H - 200), ax = W * 0.06, bx = W * 0.94 - S, y = 24;
        c.imageSmoothingEnabled = true; c.drawImage(src, ax, y, S, S); XK.txt(c, '눈으로 보는 장면', ax + S / 2, y + S + 22, '#d6dbe6', '700 15px');
        const tmp = this._t || (this._t = document.createElement('canvas')); tmp.width = st.n; tmp.height = st.n; const tc = tmp.getContext('2d'); tc.imageSmoothingEnabled = true; tc.drawImage(src, 0, 0, st.n, st.n);
        c.imageSmoothingEnabled = false; c.drawImage(tmp, bx, y, S, S); c.imageSmoothingEnabled = true;
        if (st.n <= 32) XK.grid(c, bx, y, S, S, S / st.n, 'rgba(0,0,0,.35)');
        c.strokeStyle = '#fbfcf9'; c.lineWidth = 2; c.strokeRect(ax, y, S, S); c.strokeRect(bx, y, S, S);
        XK.txt(c, `디지털 사진 ${st.n} × ${st.n}`, bx + S / 2, y + S + 22, '#ffd84d', '800 16px');
        const sc = (st.t * 0.6) % 1; XK.arrow(c, ax + S + 10, y + S / 2, bx - 10, y + S / 2, '#ffd84d', 4, 14); XK.glow(c, XK.lerp(ax + S + 10, bx - 14, sc), y + S / 2, 10, 'rgba(255,216,77,.9)');
        if (st.n <= 8) { const cs = S / st.n; for (let j = 0; j < st.n; j++) for (let i = 0; i < st.n; i++) { const d = tc.getImageData(i, j, 1, 1).data; XK.txt(c, `${d[0]}`, bx + (i + 0.5) * cs, y + (j + 0.5) * cs - (st.n <= 4 ? 10 : 2), 'rgba(255,255,255,.9)', st.n <= 4 ? '700 13px' : '700 10px'); if (st.n <= 4) { XK.txt(c, `${d[1]}`, bx + (i + 0.5) * cs, y + (j + 0.5) * cs + 6, 'rgba(255,255,255,.9)', '700 13px'); XK.txt(c, `${d[2]}`, bx + (i + 0.5) * cs, y + (j + 0.5) * cs + 22, 'rgba(255,255,255,.9)', '700 13px'); } } }
        if (st.pick) { const [i, j] = st.pick; if (i < st.n && j < st.n) { const d = tc.getImageData(i, j, 1, 1).data, cs = S / st.n; c.strokeStyle = '#ffd84d'; c.lineWidth = 3; c.strokeRect(bx + i * cs, y + j * cs, cs, cs); XK.pill(c, bx + S / 2, y + S + 50, `이 칸 = 빨강 ${d[0]} · 초록 ${d[1]} · 파랑 ${d[2]}`, `rgb(${d[0]},${d[1]},${d[2]})`, d[0] + d[1] + d[2] > 380 ? '#1d2433' : '#fff', '800 15px'); } }
        // 적을 숫자의 양(막대) + 칸 수 손잡이
        const sx0 = W * 0.1, sx1 = W * 0.9, sy = H - 26, u = (Math.log2(st.n) - 2) / 5, base = sy - 30, mh = H - 30 - (y + S + 74) - 40, maxB = this.bytes(128);
        XK.txt(c, '적어야 할 숫자의 양', sx0 - 4, base - mh - 6, '#9fb0c8', '700 13px', 'left');
        this.NS.forEach((n, i) => {
          const x = sx0 + (sx1 - sx0) * i / 5, b = this.bytes(n), h = Math.max(3, b / maxB * mh), on = st.seen.has(n), cur = n === st.n;
          if (!on) { XK.txt(c, '?', x, base - 8, 'rgba(255,255,255,.35)', '800 16px'); return; }
          c.fillStyle = cur ? '#ffd84d' : 'rgba(255,216,77,.55)'; c.fillRect(x - 16, base - h, 32, h);
          if (on) XK.txt(c, this.fmt(b), x, base - h - 5, cur ? '#ffd84d' : '#d6dbe6', cur ? '800 13px' : '600 12px');
          if (on && i > 0 && st.seen.has(this.NS[i - 1])) XK.txt(c, '×4', x - (sx1 - sx0) / 10, base - 6, '#7dffb0', '800 12px');
        });
        XK.line(c, sx0 - 24, base, sx1 + 24, base, 'rgba(255,255,255,.35)', 1.5);
        XK.line(c, sx0, sy, sx1, sy, 'rgba(255,255,255,.35)', 6); XK.line(c, sx0, sy, sx0 + (sx1 - sx0) * u, sy, '#ffd84d', 6);
        this.NS.forEach((n, i) => XK.txt(c, `${n}×${n}`, sx0 + (sx1 - sx0) * i / 5, sy + 20, '#d6dbe6', '600 11px'));
        XK.ball(c, sx0 + (sx1 - sx0) * u, sy, 12, '#ffd84d', '#b8860b');
      },
      hint(st) { const u = (Math.log2(st.n) - 2) / 5; return { x: st.W * 0.1 + st.W * 0.8 * u, y: st.H - 26, dx: -1, dy: 0, label: '손잡이를 끌어 칸 수 바꾸기', dist: 110 }; },
      geoS(st) { const S = Math.min(st.W * 0.42, st.H - 200); return { S, bx: st.W * 0.94 - S, y: 24 }; },
      down(p, st, api) {
        const { S, bx, y } = this.geoS(st);
        if (p.x > bx && p.x < bx + S && p.y > y && p.y < y + S) { st.pick = [Math.floor((p.x - bx) / (S / st.n)), Math.floor((p.y - y) / (S / st.n))]; api.ok(3); return; }
        st.drag = true; this.move(p, st, api);
      },
      move(p, st, api) { if (!st.drag) return; const u = XK.clamp((p.x - st.W * 0.1) / (st.W * 0.8), 0, 1); const n = 2 ** (2 + Math.round(u * 5)); if (n !== st.n) { st.n = n; st.pick = null; this.say(st, api); } },
      up(p, st) { st.drag = false; },
      key(k, st, api) { const d = { ArrowLeft: 0.5, ArrowRight: 2 }[k]; if (!d) return false; st.n = XK.clamp(st.n * d, 4, 128); st.pick = null; this.say(st, api); return true; },
      test(st, api, n, i, j) { st.n = n; this.say(st, api); if (i != null) { st.pick = [i, j]; api.ok(3); } },
    },

    // ── 1-2-2 2차시: 빛을 깜빡여 0과 1 보내기(광섬유 통신의 원리). 다섯 자리로 0~31 ──
    send: {
      SL: 1.1,
      init(st, api) { st.slots = []; st.hold = false; st.clock = 0; st.run = false; st.target = 13; st.trace = []; st.best = null; api.say('손전등을 <b>누르고 있으면 빛(1)</b>, 떼면 어둠(0). 노란 칸이 지날 때마다 한 자리씩 간다. 먼저 <b>13</b>(01101)을 보내 보자.'); },
      bin: (v) => v.toString(2).padStart(5, '0'),
      house(c, x, gy, w, h, lit, t, side, sign) {
        const dep = 14 * side;
        XK.shadow(c, x + w / 2 + dep, gy + 3, w * 0.62, 6, 0.3);
        // 옆면(깊이)·지붕 윗면
        const ex = side > 0 ? x + w : x;
        c.fillStyle = '#2a3550'; c.beginPath(); c.moveTo(ex, gy); c.lineTo(ex + dep, gy - 9); c.lineTo(ex + dep, gy - h - 9); c.lineTo(ex, gy - h); c.closePath(); c.fill();
        c.fillStyle = '#4a5a7a'; c.beginPath(); c.moveTo(x, gy - h); c.lineTo(x + dep, gy - h - 9); c.lineTo(x + w + dep, gy - h - 9); c.lineTo(x + w, gy - h); c.closePath(); c.fill();
        // 앞면: 벽돌빛 그러데이션 + 층 띠
        const g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, side > 0 ? '#6a7a9c' : '#4e5d7e'); g.addColorStop(1, side > 0 ? '#4e5d7e' : '#6a7a9c'); c.fillStyle = g; c.fillRect(x, gy - h, w, h);
        const floors = 4, fh = (h - 34) / floors;
        for (let r = 0; r < floors; r++) {
          const y = gy - h + 8 + r * fh; c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(x, y + fh - 3, w, 2);
          for (let k = 0; k < 3; k++) { const wx = x + 8 + k * (w - 16) / 3, ww = (w - 16) / 3 - 8, on = lit && ((r * 3 + k * 5 + Math.floor(t * 0.15)) % 5) > 0;
            c.fillStyle = '#1d2433'; c.fillRect(wx - 1, y + 3, ww + 2, fh - 9); c.fillStyle = on ? '#ffe28a' : '#26304a'; c.fillRect(wx, y + 4, ww, fh - 11);
            if (on) { c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(wx, y + 4, ww * 0.35, fh - 11); } XK.line(c, wx + ww / 2, y + 4, wx + ww / 2, y + fh - 7, 'rgba(29,36,51,.5)', 1); }
        }
        // 옥상 물탱크·안테나
        const rx = x + w * (side > 0 ? 0.72 : 0.28); c.fillStyle = '#8a93a6'; c.fillRect(rx - 9, gy - h - 22, 18, 13); c.fillStyle = '#5b6578'; c.fillRect(rx - 10, gy - h - 9, 2, 9); c.fillRect(rx + 8, gy - h - 9, 2, 9);
        XK.line(c, x + w * 0.5, gy - h, x + w * 0.5, gy - h - 26, '#9aa3b4', 2); XK.ball(c, x + w * 0.5, gy - h - 27, 3, `rgba(255,${90 + 80 * Math.sin(t * 4)},80,1)`, '#a01e10');
        // 1층: 유리문 + 간판
        c.fillStyle = '#1d2433'; c.fillRect(x + w / 2 - 14, gy - 26, 28, 26); c.fillStyle = 'rgba(160,210,255,.55)'; c.fillRect(x + w / 2 - 12, gy - 24, 11, 24); c.fillRect(x + w / 2 + 1, gy - 24, 11, 24);
                c.fillStyle = 'rgba(16,20,32,.85)'; XK.rr(c, x + w / 2 - 34, gy - 44, 68, 16, 4); c.fill(); XK.txt(c, sign, x + w / 2, gy - 32, '#ffd84d', '800 11px');
      },
      fpath(W, H) { const gy = H * 0.36, cy = H * 0.465; return [[W * 0.24, gy - 26], [W * 0.27, gy - 26], [W * 0.27, cy], [W * 0.73, cy], [W * 0.73, gy - 26], [W * 0.76, gy - 26]]; },
      at(P, q) { const L = []; let tot = 0; for (let i = 1; i < P.length; i++) { const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); L.push(d); tot += d; } let r = q * tot; for (let i = 1; i < P.length; i++) { if (r <= L[i - 1]) { const k = r / L[i - 1]; return [XK.lerp(P[i - 1][0], P[i][0], k), XK.lerp(P[i - 1][1], P[i][1], k)]; } r -= L[i - 1]; } return P[P.length - 1]; },
      draw(c, W, H, dt, st, api) {
        const on = st.run && st.hold;
        if (st.run) { st.clock += dt; st.trace.push([st.slots.length + st.clock / this.SL, on ? 1 : 0]); if (st.clock >= this.SL) { st.clock -= this.SL; st.slots.push(st.hold ? 1 : 0); if (st.hold) api.ok(1); if (st.slots.length >= 5) this.end(st, api); } }
        const gy = H * 0.36, cyy = H * 0.465;
        // 저녁 하늘·땅속
        XK.vgrad(c, 0, 0, W, gy, ['#1a2448', '#4a5a8a']); XK.stars(c, W, gy * 0.7, st.t, 30, 9, 0.7);
        XK.vgrad(c, 0, gy, W, 12, ['#7a8090', '#5b6070']);
        XK.vgrad(c, 0, gy + 12, W, H * 0.52 - gy - 12, ['#6a5240', '#4e3b2e']); { const R = XK.rnd(12); c.fillStyle = 'rgba(0,0,0,.2)'; for (let i = 0; i < 120; i++) c.fillRect(R() * W, gy + 12 + R() * (H * 0.52 - gy - 14), 2.5, 2); }
        XK.vgrad(c, 0, H * 0.52, W, H * 0.48, ['#121a30', '#0b1020']);
        // 땅속 관(광섬유가 지나는 길)
        c.fillStyle = '#3a2c22'; c.fillRect(W * 0.25, cyy - 10, W * 0.5, 20); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1; c.strokeRect(W * 0.25, cyy - 10, W * 0.5, 20);
        XK.txt(c, '땅속에 묻은 광섬유', W / 2, cyy + 26, '#e6d6c4', '700 12px');
        this.house(c, 10, gy, W * 0.21, gy - 30, true, st.t, 1, '송신소'); this.house(c, W * 0.79 - 24, gy, W * 0.21, gy - 30, true, st.t, -1, '수신소');
        // 광섬유: 피복 + 유리 심
        const P = this.fpath(W, H);
        c.lineJoin = 'round'; c.beginPath(); P.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
        c.strokeStyle = '#2b2f3a'; c.lineWidth = 12; c.stroke(); c.strokeStyle = 'rgba(160,190,230,.45)'; c.lineWidth = 6; c.stroke(); c.strokeStyle = on ? 'rgba(255,240,170,.95)' : 'rgba(120,150,200,.3)'; c.lineWidth = 2.5; c.stroke();
        if (on) for (let i = 0; i < 8; i++) { const [x, y] = this.at(P, (st.t * 0.9 + i / 8) % 1); XK.glow(c, x, y, 12, 'rgba(255,240,170,.9)'); }
        // 보내는 쪽: 받침대 위 손전등
        const lx = W * 0.2, ly = gy - 26;
        c.fillStyle = '#8f6236'; c.fillRect(lx - 34, ly + 10, 76, 6); c.fillRect(lx - 30, ly + 16, 5, 10); c.fillRect(lx + 34, ly + 16, 5, 10);
        c.save(); c.translate(lx, ly); const fg = c.createLinearGradient(0, -12, 0, 12); fg.addColorStop(0, '#9aa3b4'); fg.addColorStop(0.5, '#eef1f5'); fg.addColorStop(1, '#5b6578'); c.fillStyle = fg; XK.rr(c, -32, -9, 44, 18, 5); c.fill(); c.beginPath(); c.moveTo(12, -9); c.lineTo(28, -15); c.lineTo(28, 15); c.lineTo(12, 9); c.fill(); c.fillStyle = on ? '#fff6c4' : '#3b4252'; c.beginPath(); c.ellipse(28, 0, 4, 15, 0, 0, XK.TAU); c.fill(); c.fillStyle = st.hold ? '#e4572e' : '#8f2a1a'; XK.rr(c, -12, -14, 14, 6, 3); c.fill(); c.restore();
        if (on) XK.glow(c, lx + 30, ly, 40, 'rgba(255,240,170,.85)');
        XK.pill(c, lx, gy - 66, '보내는 쪽 · 손전등', 'rgba(16,20,32,.85)', '#ffd84d', '700 12px');
        // 받는 쪽: 빛 센서 + 화면
        const rx = W * 0.8, ry = gy - 26;
        c.fillStyle = '#8f6236'; c.fillRect(rx - 40, ry + 10, 80, 6);
        XK.ball(c, rx - 26, ry, 9, on ? '#fff6c4' : '#4b5263', on ? '#d9b84a' : '#1d2433'); if (on) XK.glow(c, rx - 26, ry, 22, 'rgba(255,240,170,.7)');
        c.fillStyle = '#0f1a12'; XK.rr(c, rx - 12, ry - 14, 50, 24, 4); c.fill(); c.strokeStyle = '#4b5263'; c.lineWidth = 2; c.stroke();
        XK.txt(c, st.slots.length ? st.slots.join('') : '-----', rx + 13, ry + 3, '#7dffb0', '800 12px');
        XK.pill(c, rx, gy - 66, '받는 쪽 · 빛 센서', 'rgba(16,20,32,.85)', '#7de0ff', '700 12px');
        // 확대 원: 광섬유 속 빛의 반사
        const mx = W * 0.5, my = H * 0.17, mr = 40;
        c.save(); c.beginPath(); c.arc(mx, my, mr, 0, XK.TAU); c.fillStyle = '#0b1020'; c.fill(); c.clip();
        c.fillStyle = '#2b2f3a'; c.fillRect(mx - mr, my - 22, mr * 2, 44); c.fillStyle = 'rgba(160,190,230,.45)'; c.fillRect(mx - mr, my - 13, mr * 2, 26);
        c.strokeStyle = on ? '#fff1a8' : 'rgba(255,241,168,.25)'; c.lineWidth = 2.5; c.beginPath(); for (let k = -2; k <= 8; k++) { const xx = mx - mr + k * mr / 3 + ((st.t * 30) % (mr / 1.5)), yy = k % 2 ? my - 12 : my + 12; if (k === -2) c.moveTo(xx, yy); else c.lineTo(xx, yy); } c.stroke();
        c.restore(); c.strokeStyle = '#c8d4f0'; c.lineWidth = 2; c.beginPath(); c.arc(mx, my, mr, 0, XK.TAU); c.stroke();
        XK.txt(c, '광섬유 속', mx + mr + 8, my - 6, '#c8d4f0', '800 12px', 'left'); XK.txt(c, '빛이 안쪽 벽에서 반사(전반사)하며 나아간다', mx + mr + 8, my + 10, '#c8d4f0', '600 11px', 'left');
        // 칸
        const n = 5, sw = Math.min(70, W * 0.1), sx = W / 2 - n * sw / 2, sy = H * 0.57;
        const val = st.slots.reduce((a, b, i) => a + b * 2 ** (4 - i), 0);
        XK.pill(c, W / 2, sy - 20, st.slots.length >= 5 ? `받은 수 ${val}` : st.run ? '보내는 중…' : `보낼 수 ${st.target} = ${this.bin(st.target)}`, '#1d2433', '#ffd84d', '800 17px');
        for (let i = 0; i < n; i++) { const b = st.slots[i], cur = st.run && i === st.slots.length; c.fillStyle = b === 1 ? '#ffd84d' : b === 0 ? '#2b3550' : cur ? `rgba(255,216,77,${0.2 + 0.2 * Math.sin(st.t * 8)})` : 'rgba(255,255,255,.08)'; c.strokeStyle = cur ? '#ffd84d' : '#8a93a6'; c.lineWidth = cur ? 3 : 2; XK.rr(c, sx + i * sw + 4, sy, sw - 8, sw - 8, 10); c.fill(); c.stroke(); if (b != null) XK.txt(c, String(b), sx + i * sw + sw / 2, sy + sw / 2 + 4, b ? '#1d2433' : '#d6dbe6', '800 26px'); XK.txt(c, `${2 ** (4 - i)}의 자리`, sx + i * sw + sw / 2, sy + sw + 8, '#8a93a6', '600 11px'); if (cur) { c.fillStyle = '#ffd84d'; c.fillRect(sx + i * sw + 8, sy + sw - 18, (sw - 16) * st.clock / this.SL, 4); } }
        // 오른쪽: 받은 수 기록
        if (st.best != null) { XK.txt(c, '지금까지 받은 가장 큰 수', W * 0.88, sy + 8, '#c8d4f0', '700 12px'); XK.txt(c, `${st.best}`, W * 0.88, sy + 40, '#ffd84d', '800 26px'); XK.txt(c, `(${this.bin(st.best)})`, W * 0.88, sy + 58, '#8a93a6', '600 11px'); }
        // 빛 세기 기록(시간 그래프)
        const gx = sx - 40, gw = n * sw + 80, gyy = H * 0.79, gh = H * 0.15, X = (q) => gx + 40 + q / n * (gw - 80);
        c.fillStyle = 'rgba(255,255,255,.06)'; XK.rr(c, gx, gyy, gw, gh + 18, 8); c.fill();
        XK.txt(c, '빛', gx + 12, gyy + 16, '#ffd84d', '700 12px', 'left'); XK.txt(c, '어둠', gx + 8, gyy + gh - 2, '#8a93a6', '700 11px', 'left');
        for (let i = 0; i <= n; i++) XK.line(c, X(i), gyy + 6, X(i), gyy + gh, 'rgba(255,255,255,.15)', 1, [3, 3]);
        if (st.trace.length) { c.strokeStyle = '#ffd84d'; c.lineWidth = 3; c.beginPath(); st.trace.forEach(([q, v], i) => { const x = X(Math.min(q, n)), y = v ? gyy + 12 : gyy + gh - 8; if (!i) c.moveTo(x, y); else c.lineTo(x, y); }); c.stroke(); }
        XK.txt(c, '시간 →', gx + gw - 10, gyy + gh + 14, '#8a93a6', '600 11px', 'right');
        if (!st.run && !st.slots.length) XK.pill(c, W / 2, gyy + gh / 2 + 6, '화면을 누르고 있으면 손전등이 켜진다', 'rgba(255,255,255,.12)', '#d6dbe6', '700 14px');
      },
      end(st, api) {
        st.run = false; const val = st.slots.reduce((a, b, i) => a + b * 2 ** (4 - i), 0); st.best = Math.max(st.best || 0, val);
        if (val === st.target && st.target === 13) { api.ok(2); st.target = 31; api.say(`받은 0과 1 = <b>${st.slots.join('')}</b> → <b>13</b>. 빛을 켜고 끈 것만으로 수가 건너갔다. 이제 다섯 칸으로 보낼 수 있는 <b>가장 큰 수</b>를 보내 보자 — 칸을 모두 켜면 몇일까?`); }
        else if (val === 31) { api.ok(2); api.ok(3); api.say(`<b>11111</b> → 16 + 8 + 4 + 2 + 1 = <b>31</b>. 다섯 칸으로는 00000(0)부터 11111(31)까지 <b>32가지</b>를 보낼 수 있다. 칸을 하나 늘리면 두 배(64가지)가 된다.`); }
        else api.say(`받은 0과 1 = <b>${st.slots.join('')}</b> → <b>${val}</b>. ${st.target}(${this.bin(st.target)})과 다르다 — 노란 칸이 지나는 박자에 맞춰 다시 보내 보자.`);
      },
      hint(st) { return { tap: true, x: st.W * 0.2, y: st.H * 0.36 - 40, label: '누르고 있으면 빛' }; },
      start(st) { if (!st.run) { st.run = true; st.slots = []; st.clock = 0; st.trace = []; } },
      down(p, st) { this.start(st); st.hold = true; },
      up(p, st) { st.hold = false; },
      key(k, st) { if (k !== ' ' && k !== 'Enter') return false; this.start(st); st.hold = !st.hold; return true; },
      test(st, api, bits) { st.slots = bits.split('').map(Number); st.trace = []; st.slots.forEach((b, i) => { for (let k = 0; k <= 10; k++) st.trace.push([i + k / 10, b]); if (b) api.ok(1); }); this.end(st, api); },
    },
    // ── 1-2-2 2차시 이론 그림: 여러 번 옮겨도 그대로인 디지털(중계소마다 잡음이 섞인다) ──
    copy: {
      BITS: [1, 0, 1, 1, 0, 1],
      init(st, api) { st.noise = 0.3; st.drag = null; this.say(st, api); },
      say(st, api) { if (st.noise >= 0.8) api.ok(1); api.say(`잡음 세기 <b>${Math.round(st.noise * 100)}</b> — 아날로그는 중계소를 지날수록 잡음이 <b>쌓이고</b>, 디지털은 중계소에서 0인지 1인지 다시 읽어 <b>깨끗한 신호로 다시</b> 보낸다.`); },
      tower(c, x, y, h, t, on) {
        c.strokeStyle = '#5b6578'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x - 13, y); c.lineTo(x, y - h); c.lineTo(x + 13, y); c.stroke();
        c.lineWidth = 1.2; for (let k = 1; k < 5; k++) { const yy = y - h * k / 5, w = 13 * (1 - k / 5); c.beginPath(); c.moveTo(x - w, yy); c.lineTo(x + w, yy - h / 5); c.moveTo(x + w, yy); c.lineTo(x - w, yy - h / 5); c.stroke(); }
        c.fillStyle = '#3b4252'; XK.rr(c, x - 9, y - h * 0.62, 18, 14, 3); c.fill();
        const b = 0.5 + 0.5 * Math.sin(t * 5 + x); XK.glow(c, x, y - h - 3, 10, `rgba(255,90,60,${0.4 + 0.5 * b})`); XK.ball(c, x, y - h - 3, 3.5, '#ff6b5b', '#a01e10');
        if (on) { for (let k = 0; k < 2; k++) { const q = (t * 0.9 + k / 2) % 1; c.strokeStyle = `rgba(74,144,217,${0.8 * (1 - q)})`; c.lineWidth = 2; c.beginPath(); c.arc(x, y - h - 3, 6 + q * 16, -0.8, 0.8); c.stroke(); } }
      },
      draw(c, W, H, dt, st) {
        XK.vgrad(c, 0, 0, W, H, ['#eef3f8', '#dde5ee']);
        const n = 4, x0 = 30, x1 = W - 30, seg = (x1 - x0) / n, A = H * 0.1, amp = st.noise * 0.6, R = XK.rnd(Math.floor(st.t * 10) + 1);
        const sig = (u) => Math.sin(u * Math.PI * 2 * 1.5) * 0.55 + Math.sin(u * Math.PI * 2 * 3.5 + 1) * 0.25;
        const bit = (u) => (this.BITS[Math.min(5, Math.floor(u * 6))] ? 0.7 : -0.7);
        const rows = [['아날로그 신호', H * 0.28, '#3d8bd9'], ['디지털 신호', H * 0.69, '#e4572e']];
        rows.forEach(([name, cy, col], ri) => {
          XK.txt(c, name, x0, cy - A - 44, col, '800 18px', 'left');
          XK.txt(c, ri ? '중계소에서 0·1을 다시 읽어 깨끗하게 보낸다' : '중계소는 받은 신호를 그대로 키워 보낸다(잡음도 함께)', x1, cy - A - 44, col, '700 13px', 'right');
          // 전선(바닥 띠)
          c.fillStyle = 'rgba(29,36,51,.12)'; c.fillRect(x0, cy + A + 16, x1 - x0, 4);
          for (let s = 0; s < n; s++) {
            const sx = x0 + s * seg + 18, sw = seg - 36, bx = sx - 6, by = cy - A - 14, bw = sw + 12, bh = 2 * A + 28;
            c.fillStyle = '#fff'; c.strokeStyle = '#c9ccd3'; c.lineWidth = 1.5; XK.rr(c, bx, by, bw, bh, 8); c.fill(); c.stroke();
            c.save(); XK.rr(c, bx, by, bw, bh, 8); c.clip();
            // 처음 모양(점선)
            c.strokeStyle = 'rgba(29,36,51,.25)'; c.lineWidth = 1.5; c.setLineDash([4, 4]); c.beginPath();
            for (let i = 0; i <= 60; i++) { const u = i / 60, yy = cy - (ri ? bit(u) : sig(u)) * A; if (!i) c.moveTo(sx + u * sw, yy); else c.lineTo(sx + u * sw, yy); } c.stroke(); c.setLineDash([]);
            // 전선을 따라가며 잡음이 섞인다: 아날로그는 앞 구간 잡음을 이어받고, 디지털은 중계소마다 0에서 다시 시작
            c.strokeStyle = col; c.lineWidth = 2.6; c.beginPath();
            for (let i = 0; i <= 80; i++) {
              const u = i / 80, k = ri === 0 ? amp * (s + u) / 2 : amp * Math.max(0, (u - 0.5) / 0.5) * 0.9, base = ri ? bit(u) : sig(u), yy = cy - (base + (R() - 0.5) * 2 * k) * A;
              if (!i) c.moveTo(sx + u * sw, yy); else c.lineTo(sx + u * sw, yy);
            }
            c.stroke();
            if (ri === 1 && s > 0) { c.fillStyle = 'rgba(47,158,91,.12)'; c.fillRect(bx, by, bw * 0.42, bh); XK.txt(c, '다시 읽어 깨끗', bx + 6, by + 14, '#1f7a46', '800 11px', 'left'); }
            c.restore();
            // 아날로그: 구간 끝에서 처음 모양과 달라진 정도 / 디지털: 다시 읽은 0·1
            if (ri === 0) { const q = Math.min(1, amp * (s + 1) / 2 / 0.9); c.fillStyle = 'rgba(29,36,51,.1)'; c.fillRect(sx, cy + A + 26, sw, 7); c.fillStyle = `rgb(${Math.round(80 + 170 * q)},${Math.round(160 - 80 * q)},90)`; c.fillRect(sx, cy + A + 26, sw * q, 7); XK.txt(c, `달라진 정도`, sx, cy + A + 48, '#5b6578', '600 11px', 'left'); }
            else this.BITS.forEach((b, i) => XK.txt(c, String(b), sx + (i + 0.5) * sw / 6, cy + A + 38, '#c0392b', '800 14px'));
            // 신호 알갱이가 전선을 따라 이동
            const q = (st.t * 0.35 + s * 0.25) % 1; XK.glow(c, sx + q * sw, cy + A + 18, 9, ri ? 'rgba(228,87,46,.85)' : 'rgba(61,139,217,.85)');
            if (s < n - 1) { const tx = x0 + (s + 1) * seg; this.tower(c, tx, cy + A + 18, 2 * A + 26, st.t, true); }
          }
        });
        XK.txt(c, '보내는 곳', x0 + 4, H * 0.49, '#5b6578', '700 13px', 'left'); XK.txt(c, '→ 중계소 3곳 →', W / 2, H * 0.49, '#5b6578', '700 13px'); XK.txt(c, '받는 곳', x1 - 4, H * 0.49, '#5b6578', '700 13px', 'right');
        const sx0 = W * 0.22, sx1 = W * 0.82, sy = H - 18;
        XK.line(c, sx0, sy, sx1, sy, '#c9ccd3', 6); XK.line(c, sx0, sy, sx0 + (sx1 - sx0) * st.noise, sy, '#1d2433', 6); XK.ball(c, sx0 + (sx1 - sx0) * st.noise, sy, 12, '#ffd84d', '#b8860b'); XK.txt(c, '잡음 세기', sx0 - 14, sy + 5, '#1d2433', '700 14px', 'right');
      },
      hint(st) { return { x: st.W * 0.22 + st.W * 0.6 * st.noise, y: st.H - 18, dx: 1, dy: 0, label: '잡음을 키워 보기', dist: 120 }; },
      down(p, st, api) { st.drag = true; this.move(p, st, api); },
      move(p, st, api) { if (!st.drag) return; st.noise = XK.clamp((p.x - st.W * 0.22) / (st.W * 0.6), 0, 1); this.say(st, api); },
      up(p, st) { st.drag = false; },
      key(k, st, api) { const d = { ArrowLeft: -0.05, ArrowRight: 0.05 }[k]; if (!d) return false; st.noise = XK.clamp(st.noise + d, 0, 1); this.say(st, api); return true; },
      test(st, api, v) { st.noise = v; this.say(st, api); },
    },
  };
  function mount(root, kind) {
    const K = KINDS[kind], P = window.Play;
    const stage = root.querySelector('.xp-stage'), out = root.querySelector('.xp-out'), chip = root.querySelector('.xp-now');
    const nSteps = root.querySelectorAll('.u-steps li').length;
    const st = { t: 0, W: 0, H: 0, touched: false, ok: [], msg: '', chip: '', revealed: false };
    // 예측(고르기) → 해 보기 → 맞춰 보기: .xp-pred data-a(정답 번호) data-at(드러낼 단계, 없으면 마지막 단계) data-why
    const pred = root.querySelector('.xp-pred'), pBtns = pred ? [...pred.querySelectorAll('button')] : [];
    const pAt = pred ? +(pred.dataset.at || nSteps || 1) : 0;
    function verdict() {
      if (!pred) return;
      const v = pred.querySelector('.xp-verdict'), a = +pred.dataset.a, pick = pBtns.findIndex((b) => b.getAttribute('aria-pressed') === 'true');
      if (!st.revealed) { v.innerHTML = pick < 0 ? '하나 고른 뒤 해 보고 맞춰 보자.' : '골랐다. 이제 그림을 직접 움직여 확인해 보자.'; v.classList.remove('on', 'miss'); return; }
      pBtns.forEach((b, i) => b.classList.toggle('answer', i === a));
      v.classList.add('on'); v.classList.toggle('miss', pick >= 0 && pick !== a);
      v.innerHTML = (pick < 0 ? '<b>결과</b> ' : pick === a ? '<b>예측이 맞았다.</b> ' : '<b>예측과 달랐다.</b> ') + pred.dataset.why;
    }
    pBtns.forEach((b) => b.addEventListener('click', () => { pBtns.forEach((o) => o.setAttribute('aria-pressed', String(o === b))); verdict(); }));
    const api = {
      say(h) { if (h !== st.msg) { st.msg = h; if (out) out.innerHTML = h; } },
      chip(s, done) { if (chip && s !== st.chip) { st.chip = s; chip.textContent = s; } if (chip) chip.classList.toggle('done', !!done); },
      ok(n) {
        if (!st.ok.includes(n)) st.ok.push(n);
        if (pred && !st.revealed && st.ok.includes(pAt)) { st.revealed = true; verdict(); }
        if (!nSteps || !window.L1) return;
        const cur = Array.from({ length: nSteps }, (_, i) => i + 1).find((k) => !st.ok.includes(k)) || 0;
        window.L1.steps(root, cur, st.ok); window.L1.done(root, cur === 0);
      },
      has: (n) => st.ok.includes(n),
    };
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
    root._xp = { st, pick: (i) => { if (pBtns[i]) pBtns[i].click(); }, test: (...a) => { st.touched = true; const r = K.test && K.test(st, api, ...a); S.redraw(); return r; } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Xp = { mount };
})();
