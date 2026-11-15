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
    // ── 1-1-1 1차시: 현상을 시간·공간 규모 지도에 놓기(교과서 14~15쪽). 값은 크기 정도(이해를 돕기 위한 예) ──
    scalemap: {
      init(st, api) {
        st.ev = [['분자의 떨림', -13, -10, 'mol'], ['번개 한 번', -3.5, 3.5, 'bolt'], ['심장 한 번 뛰기', 0, -1, 'heart'], ['지구의 자전', 4.9, 7.1, 'earth'],
          ['사람의 일생', 9.4, 0.2, 'person'], ['산맥이 솟기', 14.5, 5.5, 'mount'], ['은하의 회전', 15.8, 21, 'galaxy']].map(([n, tx, ty, ic], i) => ({ n, tx, ty, ic, i, placed: false, x: 0, y: 0, hx: 0, hy: 0 }));
        st.drag = null; st.flash = null;
        api.say('카드를 끌어 지도 위 알맞은 자리에 놓자. 가로는 <b>걸리는 시간</b>, 세로는 <b>크기(공간)</b>의 규모다.'); api.chip('카드를 지도에 놓자');
      },
      geo(W, H) { const x0 = 104, y0 = 18, w = W - x0 - 22, h = H - 196; return { x0, y0, w, h, X: (lt) => x0 + (lt + 15) / 34 * w, Y: (ly) => y0 + h - (ly + 13) / 39 * h, LT: (x) => (x - x0) / w * 34 - 15, LY: (y) => (y0 + h - y) / h * 39 - 13 }; },
      icon(c, ic, x, y, s, t) {
        if (ic === 'mol') { const d = 9 * s + Math.sin(t * 30) * 2.5 * s; XK.line(c, x - d, y, x + d, y, '#c9d3ea', 3 * s); XK.ball(c, x - d, y, 7 * s, '#e4572e', '#7a1f12'); XK.ball(c, x + d, y, 7 * s, '#4a90d9', '#1d4e86'); }
        else if (ic === 'bolt') { const f = 0.6 + 0.4 * Math.abs(Math.sin(t * 9)); XK.glow(c, x, y, 22 * s, `rgba(255,230,120,${0.5 * f})`); c.fillStyle = '#ffd84d'; c.beginPath(); [[3, -16], [-7, 1], [0, 1], [-4, 16], [8, -3], [1, -3], [6, -16]].forEach(([u, v], k) => (k ? c.lineTo : c.moveTo).call(c, x + u * s, y + v * s)); c.closePath(); c.fill(); }
        else if (ic === 'heart') { const b = 1 + 0.12 * Math.max(0, Math.sin(t * 7.5)) ** 8; c.save(); c.translate(x, y); c.scale(s * b, s * b); c.fillStyle = '#e4405f'; c.beginPath(); c.moveTo(0, 12); c.bezierCurveTo(-18, 0, -12, -14, 0, -6); c.bezierCurveTo(12, -14, 18, 0, 0, 12); c.fill(); c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.arc(-6, -4, 3, 0, XK.TAU); c.fill(); c.restore(); }
        else if (ic === 'earth') { XK.ball(c, x, y, 13 * s, '#3b82c4', '#123a66', '#cfe8ff'); c.save(); c.beginPath(); c.arc(x, y, 13 * s, 0, XK.TAU); c.clip(); c.fillStyle = '#4caf6a'; for (let k = 0; k < 3; k++) { const u = ((t * 6 + k * 13) % 40) - 20; c.beginPath(); c.ellipse(x + u * s, y + (k - 1) * 6 * s, 5 * s, 3.5 * s, 0.4, 0, XK.TAU); c.fill(); } c.restore(); }
        else if (ic === 'person') { c.fillStyle = '#f2c79a'; c.beginPath(); c.arc(x, y - 9 * s, 5 * s, 0, XK.TAU); c.fill(); c.fillStyle = '#3d6fb6'; XK.rr(c, x - 6 * s, y - 3 * s, 12 * s, 12 * s, 4 * s); c.fill(); XK.line(c, x - 3 * s, y + 9 * s, x - 4 * s, y + 17 * s, '#2a3550', 3.5 * s); XK.line(c, x + 3 * s, y + 9 * s, x + 4 * s, y + 17 * s, '#2a3550', 3.5 * s); }
        else if (ic === 'mount') { [[-9, 15, 13], [5, 18, 16]].forEach(([u, w, h]) => { c.fillStyle = '#7d8a9c'; c.beginPath(); c.moveTo(x + (u - w) * s, y + 10 * s); c.lineTo(x + u * s, y + (10 - h * 1.6) * s); c.lineTo(x + (u + w) * s, y + 10 * s); c.fill(); c.fillStyle = '#f4f7fb'; c.beginPath(); c.moveTo(x + (u - w * 0.3) * s, y + (10 - h * 1.1) * s); c.lineTo(x + u * s, y + (10 - h * 1.6) * s); c.lineTo(x + (u + w * 0.3) * s, y + (10 - h * 1.1) * s); c.fill(); }); }
        else if (ic === 'galaxy') { XK.glow(c, x, y, 18 * s, 'rgba(255,236,190,.9)'); for (let k = 0; k < 46; k++) { const arm = k % 2, r = (3 + (k >> 1) * 0.7) * s, a = t * 0.6 + arm * Math.PI + r / s * 0.28; c.fillStyle = `rgba(190,205,255,${0.9 - k / 60})`; c.beginPath(); c.arc(x + Math.cos(a) * r, y + Math.sin(a) * r * 0.55, 1.4 * s, 0, XK.TAU); c.fill(); } }
      },
      draw(c, W, H, dt, st, api) {
        const g = this.geo(W, H);
        XK.vgrad(c, 0, 0, W, H, ['#0f1730', '#141d38', '#1b2440']);
        // 미시 세계(원자 수준) 띠와 맨몸 감각 범위
        const ym = g.Y(-8); c.fillStyle = 'rgba(80,140,255,.10)'; c.fillRect(g.x0, ym, g.w, g.y0 + g.h - ym);
        XK.txt(c, '미시 세계 · 원자 수준', g.x0 + g.w - 12, g.y0 + g.h - 10, '#8fb4ff', '700 16px', 'right');
        XK.txt(c, '거시 세계', g.x0 + 12, g.y0 + 22, '#ffcf8a', '700 16px', 'left');
        c.setLineDash([7, 6]); c.strokeStyle = 'rgba(255,216,77,.55)'; c.lineWidth = 2; XK.rr(c, g.X(-1), g.Y(4), g.X(9.5) - g.X(-1), g.Y(-4) - g.Y(4), 14); c.stroke(); c.setLineDash([]);
        XK.txt(c, '맨몸으로 느끼는 범위(대략)', g.X(9.5) - 8, g.Y(-4) - 10, 'rgba(255,216,77,.8)', '600 15px', 'right');
        XK.grid(c, g.x0, g.y0, g.w, g.h, g.w / 8, 'rgba(160,175,215,.10)');
        c.strokeStyle = '#8f9bbb'; c.lineWidth = 2; c.strokeRect(g.x0, g.y0, g.w, g.h);
        for (let lt = -12; lt <= 16; lt += 4) XK.txt(c, XK.pow(lt) + ' s', g.X(lt), g.y0 + g.h + 20, '#aab4cf', '600 14px');
        [['1초', 0], ['하루', 4.94], ['1년', 7.5], ['우주의 나이', 17.6]].forEach(([s, lt]) => { XK.line(c, g.X(lt), g.y0 + g.h, g.X(lt), g.y0 + g.h + 6, '#ffd84d', 2); XK.txt(c, s, g.X(lt), g.y0 + g.h + 38, '#ffd84d', '700 14px'); });
        for (let ly = -8; ly <= 24; ly += 4) XK.txt(c, XK.pow(ly) + ' m', g.x0 - 8, g.Y(ly) + 5, '#aab4cf', '600 14px', 'right');
        XK.txt(c, '크기 ↑', g.x0 - 8, g.y0 + 14, '#fbfcf9', '700 15px', 'right'); XK.txt(c, '걸리는 시간 →', g.x0, g.y0 + g.h + 38, '#fbfcf9', '700 15px', 'left');
        // 카드 자리
        const cw = (W - 40) / 4 - 8, ch = 50, ty = H - 118;
        st.ev.forEach((e, i) => { e.hx = 20 + (i % 4) * (cw + 10) + (i >= 4 ? cw / 2 : 0) + cw / 2; e.hy = ty + (i >= 4 ? 58 : 0) + ch / 2; e.cw = cw; });
        st.ev.forEach((e) => {
          if (e.placed) {
            const x = g.X(e.tx), y = g.Y(e.ty), pul = 1 + 0.06 * Math.sin(st.t * 3 + e.i);
            XK.glow(c, x, y, 34 * pul, 'rgba(255,216,77,.28)'); this.icon(c, e.ic, x, y, 1.2, st.t);
            XK.pill(c, x, y + (e.ty < -6 ? -34 : 36), e.n, 'rgba(255,255,255,.92)', '#1d2433', '700 15px');
          }
        });
        st.ev.forEach((e) => {
          if (e.placed) return;
          const dr = st.drag && st.drag.e === e, x = dr ? st.drag.x : e.hx, y = dr ? st.drag.y : e.hy;
          if (dr) XK.shadow(c, x + 6, y + 30, e.cw / 2, 8, 0.35);
          c.fillStyle = dr ? '#fff7d6' : '#f6f2e7'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; XK.rr(c, x - e.cw / 2, y - ch / 2, e.cw, ch, 10); c.fill(); c.stroke();
          c.fillStyle = '#1d2433'; XK.rr(c, x - e.cw / 2 + 6, y - ch / 2 + 6, 38, 38, 8); c.fill();
          this.icon(c, e.ic, x - e.cw / 2 + 25, y, 0.85, st.t); XK.txt(c, e.n, x - e.cw / 2 + 52, y + 7, '#1d2433', '700 18px', 'left');
        });
        if (st.flash) { st.flash.t -= dt; if (st.flash.t > 0) { c.strokeStyle = `rgba(255,216,77,${st.flash.t})`; c.lineWidth = 4; c.beginPath(); c.arc(st.flash.x, st.flash.y, 40 + (1 - st.flash.t) * 50, 0, XK.TAU); c.stroke(); } }
      },
      hint(st) { const e = st.ev && st.ev[1]; return e && e.hx ? { x: e.hx, y: e.hy - 20, dx: 0.2, dy: -1, label: '끌어서 지도에', dist: 150 } : null; },
      down(p, st) { const e = st.ev.find((q) => !q.placed && Math.abs(p.x - q.hx) < q.cw / 2 && Math.abs(p.y - q.hy) < 25); if (e) st.drag = { e, x: p.x, y: p.y }; },
      move(p, st) { if (st.drag) { st.drag.x = p.x; st.drag.y = p.y; } },
      up(p, st, api) { if (!st.drag) return; const e = st.drag.e; st.drag = null; this.drop(st, api, e, p.x, p.y); },
      drop(st, api, e, x, y) {
        const g = this.geo(st.W, st.H), lt = g.LT(x), ly = g.LY(y);
        if (y > g.y0 + g.h) return;
        if (Math.abs(lt - e.tx) < 3.2 && Math.abs(ly - e.ty) < 3.6) {
          e.placed = true; st.flash = { x: g.X(e.tx), y: g.Y(e.ty), t: 1 };
          const n = st.ev.filter((q) => q.placed).length;
          api.say(`<b>${e.n}</b> — 걸리는 시간 약 ${XK.pow(Math.round(e.tx))} s, 크기 약 ${XK.pow(Math.round(e.ty))} m. ${n < 7 ? `(${n}/7)` : '일곱 장 모두 놓았다. 지도 위 현상들이 <b>얼마나 넓게</b> 흩어져 있는지 보자.'}`);
          api.ok(1); if (n >= 4) api.ok(2); if (n >= 7) { api.ok(3); api.chip('규모가 다르면 재는 방법도 달라야 한다', true); } else api.chip(`${n}/7 놓음`);
        } else {
          const a = [];
          if (lt < e.tx - 3.2) a.push('더 <b>오래 걸리는</b> 일이다 → 오른쪽'); else if (lt > e.tx + 3.2) a.push('더 <b>짧은 순간</b>의 일이다 → 왼쪽');
          if (ly < e.ty - 3.6) a.push('더 <b>큰</b> 규모다 → 위쪽'); else if (ly > e.ty + 3.6) a.push('더 <b>작은</b> 규모다 → 아래쪽');
          api.say(`<b>${e.n}</b>: ${a.join(', ')}`);
        }
      },
      key(k, st, api) { if (k !== 'Enter' && k !== ' ') return false; const e = st.ev.find((q) => !q.placed); if (e) { const g = this.geo(st.W, st.H); this.drop(st, api, e, g.X(e.tx), g.Y(e.ty)); } return true; },
      test(st, api, i) { const e = st.ev[i], g = this.geo(st.W, st.H); this.drop(st, api, e, g.X(e.tx), g.Y(e.ty)); },
    },

    // ── 1-1-1 1차시 이론 그림: 맨눈의 한계와 측정 도구. 돋보기를 끌어 나뭇잎을 점점 크게(배율은 대략) ──
    senses: {
      init(st, api) { st.lx = 0.08; st.drag = false; this.say(st, api); },
      TOOLS: [['맨눈', '약 1 cm', '잎맥까지 보인다. 아주 작은 것은 눈으로 구별하지 못한다'], ['돋보기', '약 1 mm', '가는 잎맥과 표면의 무늬가 보인다'], ['광학 현미경', '약 10 μm', '<b>세포</b>와 그 안을 도는 초록 알갱이(엽록체)가 보인다'], ['특수 현미경', '약 1 nm', '<b>원자</b>가 줄지어 있다 — 여기부터 미시 세계']],
      lvl: (st) => st.lx * 3.2,
      say(st, api) { const k = Math.min(3, Math.round(this.lvl(st))), T = this.TOOLS[k]; api.say(`<b>${T[0]}</b> · 화면 한 칸 ${T[1]} — ${T[2]}`); api.chip(k === 3 ? '미시 세계까지 내려왔다' : '돋보기를 오른쪽으로 끌자', k === 3); },
      leaf(c, x, y, s, t) {
        c.save(); c.translate(x, y); c.rotate(-0.35 + Math.sin(t * 0.8) * 0.02);
        const g = c.createLinearGradient(-s, 0, s, 0); g.addColorStop(0, '#5fae4e'); g.addColorStop(1, '#2f7a33'); c.fillStyle = g;
        c.beginPath(); c.moveTo(-s, 0); c.bezierCurveTo(-s * 0.4, -s * 0.62, s * 0.5, -s * 0.55, s, 0); c.bezierCurveTo(s * 0.5, s * 0.55, -s * 0.4, s * 0.62, -s, 0); c.fill();
        c.strokeStyle = 'rgba(220,245,200,.75)'; c.lineWidth = s * 0.025; c.beginPath(); c.moveTo(-s * 1.15, 0); c.lineTo(s * 0.95, 0); c.stroke();
        c.lineWidth = s * 0.012; for (let i = -4; i <= 4; i++) { if (!i) continue; const u = i * s * 0.2; c.beginPath(); c.moveTo(u, 0); c.quadraticCurveTo(u + s * 0.12, Math.sign(i) * 0 + s * 0.18 * (i > 0 ? 1 : 1), u + s * 0.22, s * 0.36 * (1 - Math.abs(i) / 6)); c.moveTo(u, 0); c.quadraticCurveTo(u + s * 0.12, -s * 0.18, u + s * 0.22, -s * 0.36 * (1 - Math.abs(i) / 6)); c.stroke(); }
        c.restore();
      },
      zoom(c, k, x, y, R, t) {
        if (k === 0) { c.fillStyle = '#3f8f3c'; c.fillRect(x - R, y - R, 2 * R, 2 * R); this.leaf(c, x - R * 0.2, y + R * 0.1, R * 1.9, t); }
        else if (k === 1) {
          XK.vgrad(c, x - R, y - R, 2 * R, 2 * R, ['#4f9e45', '#357f35']);
          c.strokeStyle = 'rgba(225,248,205,.8)'; c.lineWidth = 9; c.beginPath(); c.moveTo(x - R, y + R * 0.2); c.bezierCurveTo(x - R * 0.2, y, x + R * 0.2, y + R * 0.1, x + R, y - R * 0.3); c.stroke();
          c.lineWidth = 3; for (let i = 0; i < 9; i++) { const a = x - R + i * R / 4; c.beginPath(); c.moveTo(a, y + R * 0.15 - i * 3); c.quadraticCurveTo(a + 18, y - R * 0.3, a + 30, y - R); c.moveTo(a, y + R * 0.15 - i * 3); c.quadraticCurveTo(a + 14, y + R * 0.5, a + 40, y + R); c.stroke(); }
          c.strokeStyle = 'rgba(20,60,20,.25)'; c.lineWidth = 1; for (let i = 0; i < 26; i++) for (let j = 0; j < 26; j++) { c.strokeRect(x - R + i * 9 + (j % 2) * 4, y - R + j * 9, 9, 9); }
        } else if (k === 2) {
          c.fillStyle = '#c9e7b5'; c.fillRect(x - R, y - R, 2 * R, 2 * R);
          const cw = 92, chh = 58;
          for (let j = -3; j <= 3; j++) for (let i = -3; i <= 3; i++) {
            const cx = x + i * cw + (j % 2) * cw / 2, cy = y + j * chh;
            c.fillStyle = '#e2f4d4'; c.strokeStyle = '#5f9a48'; c.lineWidth = 4; XK.rr(c, cx - cw / 2 + 3, cy - chh / 2 + 3, cw - 6, chh - 6, 12); c.fill(); c.stroke();
            for (let q = 0; q < 7; q++) { const a = t * 0.7 + q / 7 * XK.TAU + i + j, ex = cx + Math.cos(a) * (cw / 2 - 16), ey = cy + Math.sin(a) * (chh / 2 - 13); XK.ball(c, ex, ey, 6, '#3fae4a', '#1e6b25', '#bff0b0'); }
            XK.ball(c, cx - 10, cy + 2, 9, '#c6b6e6', '#7a62a8');
          }
        } else {
          XK.vgrad(c, x - R, y - R, 2 * R, 2 * R, ['#1a1f33', '#24304f']);
          const d = 34; for (let j = -6; j <= 6; j++) for (let i = -6; i <= 6; i++) { const ax = x + i * d + (j % 2) * d / 2 + Math.sin(t * 9 + i * 2 + j) * 1.6, ay = y + j * d * 0.87 + Math.cos(t * 8 + j * 3 + i) * 1.6; XK.glow(c, ax, ay, 20, 'rgba(120,170,255,.25)'); XK.ball(c, ax, ay, 12, '#8fb4ff', '#2c4f94', '#eef4ff'); }
        }
      },
      draw(c, W, H, dt, st) {
        XK.vgrad(c, 0, 0, W, H * 0.62, ['#eef3f7', '#dde6ee']);
        XK.vgrad(c, 0, H * 0.62, W, H * 0.38, ['#c79a6a', '#a87849']);
        c.strokeStyle = 'rgba(90,55,25,.25)'; c.lineWidth = 2; for (let i = 0; i < 7; i++) { c.beginPath(); c.moveTo(0, H * 0.66 + i * 18); c.bezierCurveTo(W * 0.3, H * 0.66 + i * 18 + 6, W * 0.7, H * 0.66 + i * 18 - 6, W, H * 0.66 + i * 18); c.stroke(); }
        XK.shadow(c, W * 0.5, H * 0.72, W * 0.4, 22, 0.18);
        this.leaf(c, W * 0.5, H * 0.56, Math.min(W * 0.42, H * 0.5), st.t);
        // 도구 눈금
        const ty = H - 24, x0 = 70, x1 = W - 70;
        XK.line(c, x0, ty, x1, ty, '#1d2433', 3);
        this.TOOLS.forEach((T, i) => { const x = x0 + (x1 - x0) * i / 3, on = Math.round(this.lvl(st)) === i; XK.ball(c, x, ty, on ? 10 : 7, on ? '#ffd84d' : '#9aa5bb', on ? '#b8860b' : '#5b6578'); XK.pill(c, x, ty - 22, T[0], on ? '#1d2433' : 'rgba(255,255,255,.85)', on ? '#ffd84d' : '#1d2433', on ? '800 18px' : '700 16px'); });
        // 돋보기
        const R = Math.min(W, H) * 0.27, lx = x0 + (x1 - x0) * st.lx, ly = H * 0.4, lv = this.lvl(st), k0 = Math.min(3, Math.floor(lv)), f = lv - k0;
        XK.shadow(c, lx + 14, ly + R + 30, R * 0.9, 14, 0.25);
        c.save(); c.translate(lx, ly); c.rotate(0.7); const hg = c.createLinearGradient(-9, 0, 9, 0); hg.addColorStop(0, '#2b2b33'); hg.addColorStop(0.5, '#6b6b78'); hg.addColorStop(1, '#2b2b33'); c.fillStyle = hg; XK.rr(c, -11, R + 4, 22, R * 0.9, 9); c.fill(); c.restore();
        c.save(); c.beginPath(); c.arc(lx, ly, R, 0, XK.TAU); c.clip();
        this.zoom(c, k0, lx, ly, R, st.t);
        if (k0 < 3 && f > 0.55) { c.globalAlpha = (f - 0.55) / 0.45; this.zoom(c, k0 + 1, lx, ly, R, st.t); c.globalAlpha = 1; }
        const sh = c.createRadialGradient(lx - R * 0.4, ly - R * 0.5, 0, lx, ly, R); sh.addColorStop(0, 'rgba(255,255,255,.35)'); sh.addColorStop(0.35, 'rgba(255,255,255,0)'); sh.addColorStop(1, 'rgba(0,0,0,.25)'); c.fillStyle = sh; c.fillRect(lx - R, ly - R, 2 * R, 2 * R);
        c.restore();
        c.strokeStyle = '#1d2433'; c.lineWidth = 9; c.beginPath(); c.arc(lx, ly, R, 0, XK.TAU); c.stroke(); c.strokeStyle = '#b9c2d6'; c.lineWidth = 3; c.beginPath(); c.arc(lx, ly, R - 4, 0, XK.TAU); c.stroke();
        const T = this.TOOLS[Math.min(3, Math.round(lv))]; XK.line(c, lx - 40, ly + R - 26, lx + 40, ly + R - 26, '#fff', 4); XK.pill(c, lx, ly + R - 46, `한 칸 ${T[1]}`, 'rgba(29,36,51,.8)', '#fff', '700 15px');
      },
      hint(st) { return { x: 60 + (st.W - 120) * st.lx + 40, y: st.H * 0.42, dx: 1, dy: 0, label: '돋보기를 오른쪽으로', dist: 160 }; },
      down(p, st) { const lx = 60 + (st.W - 120) * st.lx; if (Math.hypot(p.x - lx, p.y - st.H * 0.42) < Math.min(st.W, st.H) * 0.4) st.drag = { dx: p.x - lx }; },
      move(p, st, api) { if (!st.drag) return; st.lx = XK.clamp((p.x - st.drag.dx - 60) / (st.W - 120), 0, 1); this.say(st, api); },
      up(p, st) { st.drag = null; },
      key(k, st, api) { const d = { ArrowLeft: -0.05, ArrowRight: 0.05 }[k]; if (!d) return false; st.lx = XK.clamp(st.lx + d, 0, 1); this.say(st, api); return true; },
      test(st, api, v) { st.lx = v; this.say(st, api); },
    },

    // ── 1-1-1 1차시: 위성 세 개로 내 위치 찾기(시간을 재어 거리를 안다). 지도는 위에서 내려다본 평면, 거리 값은 이해를 돕기 위한 예 ──
    gps: {
      init(st, api) { st.pin = null; st.drag = false; st.won = 0; api.say('휴대 전화를 끌어 지도 위에 놓아 보자. 색 원은 위성 신호가 오는 데 걸린 <b>시간</b>으로 잰 거리다.'); api.chip('휴대 전화를 끌자'); },
      geo(W, H) { const T = { x: W * 0.6, y: H * 0.56 }, S = [[0.16, 0.2, '#e4572e', 'A'], [0.88, 0.16, '#3d8bd9', 'B'], [0.3, 0.92, '#2f9e5b', 'C']].map(([u, v, col, n]) => { const x = W * u, y = H * v; return { x, y, col, n, r: Math.hypot(T.x - x, T.y - y) }; }); return { T, S }; },
      map(c, W, H) {
        if (this._m && this._m.w === W && this._m.h === H) { c.drawImage(this._m.cv, 0, 0, W, H); return; }
        const cv = document.createElement('canvas'), k = 2; cv.width = W * k; cv.height = H * k; const m = cv.getContext('2d'); m.scale(k, k);
        m.fillStyle = '#e9efe4'; m.fillRect(0, 0, W, H);
        m.fillStyle = '#cfe6c4'; XK.rr(m, W * 0.66, H * 0.08, W * 0.24, H * 0.3, 18); m.fill();
        m.strokeStyle = '#9ccbe8'; m.lineWidth = 34; m.beginPath(); m.moveTo(-20, H * 0.7); m.bezierCurveTo(W * 0.3, H * 0.55, W * 0.45, H * 0.95, W + 20, H * 0.78); m.stroke();
        const R = XK.rnd(11), roads = [];
        for (let i = 1; i < 6; i++) roads.push(['v', W * i / 6]); for (let j = 1; j < 4; j++) roads.push(['h', H * j / 4]);
        for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) {
          const bx = W * i / 6 + 14, by = H * j / 4 + 14, bw = W / 6 - 28, bh = H / 4 - 28;
          for (let q = 0; q < 4; q++) { const w = bw * (0.3 + R() * 0.25), h = bh * (0.3 + R() * 0.3), x = bx + (q % 2) * (bw - w), y = by + (q >> 1) * (bh - h); if (R() < 0.15) continue; m.fillStyle = 'rgba(40,50,70,.18)'; m.fillRect(x + 4, y + 5, w, h); m.fillStyle = ['#f3efe6', '#e7e2f1', '#f6e4d6', '#e0ebf2'][q]; m.fillRect(x, y, w, h); m.strokeStyle = '#b9b3a6'; m.lineWidth = 1; m.strokeRect(x, y, w, h); }
        }
        roads.forEach(([d, u]) => { m.strokeStyle = '#c3c6cc'; m.lineWidth = 16; m.beginPath(); if (d === 'v') { m.moveTo(u, 0); m.lineTo(u, H); } else { m.moveTo(0, u); m.lineTo(W, u); } m.stroke(); m.strokeStyle = '#fff'; m.lineWidth = 11; m.stroke(); m.strokeStyle = '#f2c230'; m.lineWidth = 1.5; m.setLineDash([10, 10]); m.stroke(); m.setLineDash([]); });
        this._m = { w: W, h: H, cv }; c.drawImage(cv, 0, 0, W, H);
      },
      sat(c, x, y, col, t) {
        c.save(); c.translate(x, y); c.rotate(Math.sin(t * 0.8) * 0.08);
        [-1, 1].forEach((s) => { c.fillStyle = '#244a8f'; c.fillRect(s * 14 + (s < 0 ? -30 : 0), -8, 30, 16); c.strokeStyle = '#9fb6e8'; c.lineWidth = 1; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(s * 14 + (s < 0 ? -30 : 0) + i * 7.5, -8); c.lineTo(s * 14 + (s < 0 ? -30 : 0) + i * 7.5, 8); c.stroke(); } });
        XK.line(c, -14, 0, 14, 0, '#888', 3);
        const g = c.createLinearGradient(-12, -12, 12, 12); g.addColorStop(0, '#f1f3f7'); g.addColorStop(1, '#9aa3b4'); c.fillStyle = g; XK.rr(c, -12, -12, 24, 24, 4); c.fill(); c.strokeStyle = col; c.lineWidth = 3; c.stroke();
        c.restore();
      },
      phone(c, x, y, ok, t) {
        XK.shadow(c, x + 6, y + 30, 18, 6, 0.35);
        if (ok) { for (let k = 0; k < 2; k++) { const q = (t * 0.8 + k / 2) % 1; c.strokeStyle = `rgba(228,87,46,${1 - q})`; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 14 + q * 40, 0, XK.TAU); c.stroke(); } }
        c.fillStyle = '#1d2433'; XK.rr(c, x - 15, y - 26, 30, 52, 7); c.fill();
        const g = c.createLinearGradient(0, y - 22, 0, y + 20); g.addColorStop(0, ok ? '#ffe2d6' : '#cfe3ff'); g.addColorStop(1, ok ? '#ffb38f' : '#8fb4ff'); c.fillStyle = g; XK.rr(c, x - 12, y - 21, 24, 40, 4); c.fill();
        c.fillStyle = '#e4572e'; c.beginPath(); c.arc(x, y - 5, 6, Math.PI, 0); c.lineTo(x, y + 7); c.closePath(); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(x, y - 5, 2.4, 0, XK.TAU); c.fill();
      },
      on(st, g) { return st.pin ? g.S.map((s) => Math.abs(Math.hypot(st.pin.x - s.x, st.pin.y - s.y) - s.r) < 16) : [false, false, false]; },
      draw(c, W, H, dt, st, api) {
        this.map(c, W, H); const g = this.geo(W, H), on = this.on(st, g);
        g.S.forEach((s, i) => {
          for (let k = 0; k < 3; k++) { const q = (st.t * 0.35 + k / 3 + i * 0.2) % 1; c.strokeStyle = s.col; c.globalAlpha = 0.35 * (1 - q); c.lineWidth = 2; c.beginPath(); c.arc(s.x, s.y, s.r * q, 0, XK.TAU); c.stroke(); }
          c.globalAlpha = 1; c.strokeStyle = s.col; c.lineWidth = on[i] ? 6 : 3; c.setLineDash(on[i] ? [] : [12, 8]); c.beginPath(); c.arc(s.x, s.y, s.r, 0, XK.TAU); c.stroke(); c.setLineDash([]);
          XK.glow(c, s.x, s.y, 40, 'rgba(255,255,255,.7)'); this.sat(c, s.x, s.y, s.col, st.t + i);
          const km = Math.round(20000 + s.r * 8), sec = km / 300000;
          XK.pill(c, s.x, s.y + (s.y > H * 0.5 ? -36 : 38), `위성 ${s.n} · ${sec.toFixed(4)}초 → ${km.toLocaleString('ko-KR')} km`, s.col, '#fff', '700 15px');
        });
        const won = on.every(Boolean);
        if (st.pin) this.phone(c, st.pin.x, st.pin.y, won, st.t); else this.phone(c, W * 0.12, H * 0.5, false, st.t);
        XK.pill(c, W - 150, H - 22, '거리 = 빛의 속력 × 걸린 시간', 'rgba(29,36,51,.85)', '#ffd84d', '700 15px');
      },
      hint(st) { return { x: st.W * 0.12, y: st.H * 0.5 - 30, dx: 1, dy: 0.1, label: '전화를 끌어 옮기기', dist: 170 }; },
      down(p, st) { const q = st.pin || { x: st.W * 0.12, y: st.H * 0.5 }; if (Math.hypot(p.x - q.x, p.y - q.y) < 50) st.drag = true; },
      move(p, st, api) { if (!st.drag) return; st.pin = { x: XK.clamp(p.x, 20, st.W - 20), y: XK.clamp(p.y, 30, st.H - 30) }; this.judge(st, api); },
      up(p, st) { st.drag = false; },
      judge(st, api) {
        const g = this.geo(st.W, st.H), on = this.on(st, g), n = on.filter(Boolean).length;
        if (n === 3) { st.pin = { ...g.T }; api.ok(1); api.ok(2); api.ok(3); api.say('세 원이 모두 만나는 곳은 <b>한 점</b>뿐 — 여기가 내 위치다. 신호 시간이 100만분의 1초만 틀려도 거리는 <b>300 m</b>나 어긋난다.'); api.chip('위치를 찾았다', true); return; }
        if (n === 2) { api.ok(1); api.ok(2); api.say('두 원 위에 동시에 있다 — 두 원이 만나는 곳은 <b>두 군데</b>. 셋째 원까지 맞는 곳은?'); api.chip('셋째 원도 맞추자'); }
        else if (n === 1) { api.ok(1); const s = this.geo(st.W, st.H).S[on.indexOf(true)]; api.say(`위성 ${s.n}의 원 위 — 위성 ${s.n}까지의 거리는 맞지만, 원 위 <b>어디든</b> 될 수 있다.`); api.chip('다른 원과 만나는 곳으로'); }
      },
      key(k, st, api) { const d = { ArrowLeft: [-10, 0], ArrowRight: [10, 0], ArrowUp: [0, -10], ArrowDown: [0, 10] }[k]; if (!d) return false; const q = st.pin || { x: st.W * 0.12, y: st.H * 0.5 }; st.pin = { x: q.x + d[0], y: q.y + d[1] }; this.judge(st, api); return true; },
      test(st, api, u, v) { st.pin = { x: st.W * u, y: st.H * v }; this.judge(st, api); },
    },

    // ── 1-1-2 1차시: 온도의 기본 단위 K. 상자를 식히면 알갱이가 느려진다(알갱이 움직임은 단순화) ──
    kelvin: {
      init(st, api) { st.T = 20; st.drag = false; const R = XK.rnd(5); st.p = Array.from({ length: 38 }, () => ({ x: R(), y: R(), a: R() * XK.TAU, s: 0.7 + R() * 0.6 })); this.say(st, api); },
      say(st, api) {
        const T = Math.round(st.T), K = T + 273;
        api.say(T <= -272 ? '<b>−273 °C = 0 K</b> — 더 내려갈 수 없는 가장 낮은 온도. 알갱이 움직임이 가장 작아진다.' : `<b>${T} °C = ${K} K</b> · 켈빈 온도 = 섭씨온도 + 273. 눈금 한 칸의 크기는 같다.`);
        if (Math.abs(T) <= 2) api.ok(1); if (Math.abs(T - 100) <= 2) api.ok(2); if (T <= -272) api.ok(3);
        api.chip(T <= -272 ? '0 K에 닿았다' : '온도계 손잡이를 위아래로', T <= -272);
      },
      geo(W, H) { const tx = W * 0.8, top = 70, bot = H - 96; return { tx, top, bot, Y: (T) => bot - (T + 280) / 410 * (bot - top), T: (y) => (bot - y) / (bot - top) * 410 - 280 }; },
      draw(c, W, H, dt, st) {
        const g = this.geo(W, H), K = st.T + 273, hot = XK.clamp((st.T + 20) / 120, 0, 1), cold = XK.clamp(-st.T / 273, 0, 1);
        XK.vgrad(c, 0, 0, W, H, [`rgb(${236 - cold * 40},${240 - cold * 20},${246})`, `rgb(${222 - cold * 50},${228 - cold * 30},${238})`]);
        // 상자
        const bx = 36, by = 60, bw = W * 0.5, bh = H - 190;
        const plate = c.createLinearGradient(0, by + bh, 0, by + bh + 34); plate.addColorStop(0, hot > 0.5 ? `rgb(${200 + hot * 55},${90 - hot * 40},40)` : `rgb(${120 - cold * 40},${150},${190 + cold * 50})`); plate.addColorStop(1, '#3b4252');
        c.fillStyle = plate; XK.rr(c, bx - 14, by + bh + 4, bw + 28, 34, 8); c.fill();
        XK.txt(c, st.T >= 20 ? '가열판' : '냉각판', bx + bw / 2, by + bh + 28, '#fff', '700 16px');
        if (st.T > 40) for (let i = 0; i < 6; i++) { const x = bx + 30 + i * (bw - 60) / 5, q = (st.t * 1.2 + i * 0.3) % 1; c.strokeStyle = `rgba(255,120,60,${0.5 * (1 - q) * hot})`; c.lineWidth = 3; c.beginPath(); c.moveTo(x, by + bh - q * 50); c.quadraticCurveTo(x + 8, by + bh - q * 50 - 10, x, by + bh - q * 50 - 20); c.stroke(); }
        c.fillStyle = `rgba(${200 - cold * 60},${225 - cold * 30},255,.35)`; XK.rr(c, bx, by, bw, bh, 16); c.fill();
        const sp = Math.sqrt(Math.max(0, K) / 373) * 260;
        st.p.forEach((q) => {
          q.x += Math.cos(q.a) * sp * q.s * dt / bw; q.y += Math.sin(q.a) * sp * q.s * dt / bh;
          if (q.x < 0.03 || q.x > 0.97) { q.a = Math.PI - q.a; q.x = XK.clamp(q.x, 0.03, 0.97); } if (q.y < 0.04 || q.y > 0.96) { q.a = -q.a; q.y = XK.clamp(q.y, 0.04, 0.96); }
          const x = bx + q.x * bw, y = by + q.y * bh;
          if (sp > 30) { c.strokeStyle = `rgba(228,87,46,${0.25 * hot + 0.1})`; c.lineWidth = 6; c.beginPath(); c.moveTo(x, y); c.lineTo(x - Math.cos(q.a) * sp * q.s * 0.06, y - Math.sin(q.a) * sp * q.s * 0.06); c.stroke(); }
          XK.ball(c, x, y, 10, `rgb(${120 + hot * 120},${110 - hot * 20 + cold * 60},${200 - hot * 140 + cold * 50})`, '#26304a');
        });
        c.strokeStyle = '#1d2433'; c.lineWidth = 3; XK.rr(c, bx, by, bw, bh, 16); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 5; c.beginPath(); c.moveTo(bx + 18, by + 30); c.lineTo(bx + 18, by + bh * 0.4); c.stroke();
        if (cold > 0.1) { const R = XK.rnd(3); c.save(); XK.rr(c, bx, by, bw, bh, 16); c.clip(); c.strokeStyle = `rgba(255,255,255,${cold * 0.75})`; c.lineWidth = 26 * cold; XK.rr(c, bx, by, bw, bh, 16); c.stroke(); c.fillStyle = `rgba(255,255,255,${cold * 0.9})`; for (let i = 0; i < 60; i++) { const e = i % 4, u = R(), x = e < 2 ? bx + u * bw : e === 2 ? bx + 6 : bx + bw - 6, y = e < 2 ? (e ? by + 6 : by + bh - 6) : by + u * bh; c.beginPath(); c.arc(x, y, 3 + R() * 9 * cold, 0, XK.TAU); c.fill(); } c.restore(); }
        XK.txt(c, '공기 알갱이가 든 상자', bx + bw / 2, 40, '#1d2433', '700 18px');
        // 온도계
        const tx = g.tx, y0 = g.Y(st.T);
        c.fillStyle = 'rgba(255,255,255,.85)'; c.strokeStyle = '#1d2433'; c.lineWidth = 3; XK.rr(c, tx - 16, g.top - 20, 32, g.bot - g.top + 40, 16); c.fill(); c.stroke();
        XK.ball(c, tx, g.bot + 34, 26, '#e4572e', '#8f2a1a', '#ffd2c2'); c.strokeStyle = '#1d2433'; c.lineWidth = 3; c.beginPath(); c.arc(tx, g.bot + 34, 26, 0, XK.TAU); c.stroke();
        const lg = c.createLinearGradient(tx - 7, 0, tx + 7, 0); lg.addColorStop(0, '#b8321c'); lg.addColorStop(0.5, '#ff7a5c'); lg.addColorStop(1, '#b8321c'); c.fillStyle = lg; c.fillRect(tx - 7, y0, 14, g.bot + 14 - y0);
        for (let T = -250; T <= 100; T += 50) { const y = g.Y(T); XK.line(c, tx - 30, y, tx - 18, y, '#1d2433', 2); XK.txt(c, `${T}`, tx - 36, y + 6, '#1d2433', '600 15px', 'right'); }
        for (let K2 = 0; K2 <= 400; K2 += 50) { const y = g.Y(K2 - 273); XK.line(c, tx + 18, y, tx + 30, y, '#2a6fb0', 2); XK.txt(c, `${K2}`, tx + 36, y + 6, '#2a6fb0', '600 15px', 'left'); }
        XK.txt(c, '°C', tx - 44, g.top - 28, '#1d2433', '800 18px'); XK.txt(c, 'K', tx + 44, g.top - 28, '#2a6fb0', '800 18px');
        [[0, '물이 어는 온도'], [100, '물이 끓는 온도'], [-273, '0 K']].forEach(([T, s]) => { const y = g.Y(T); XK.line(c, tx - 110, y, tx - 64, y, 'rgba(29,36,51,.35)', 1.5, [4, 4]); XK.txt(c, s, tx - 112, y - 6, '#5b6578', '600 14px', 'right'); });
        c.fillStyle = '#ffd84d'; c.strokeStyle = '#1d2433'; c.lineWidth = 2.5; XK.rr(c, tx - 28, y0 - 11, 56, 22, 11); c.fill(); c.stroke();
        XK.pill(c, tx - 4, H - 18, `${Math.round(st.T)} °C = ${Math.round(K)} K`, '#1d2433', '#ffd84d', '800 19px');
      },
      hint(st) { const g = this.geo(st.W, st.H); return { x: g.tx, y: g.Y(st.T), dx: 0, dy: -1, label: '손잡이를 위아래로', dist: 100 }; },
      down(p, st) { const g = this.geo(st.W, st.H); if (Math.abs(p.x - g.tx) < 80) st.drag = true; },
      move(p, st, api) { if (!st.drag) return; const g = this.geo(st.W, st.H); st.T = XK.clamp(g.T(p.y), -273, 120); this.say(st, api); },
      up(p, st) { st.drag = false; },
      key(k, st, api) { const d = { ArrowUp: 1, ArrowDown: -1, ArrowRight: 10, ArrowLeft: -10 }[k]; if (!d) return false; st.T = XK.clamp(Math.round(st.T) + d, -273, 120); this.say(st, api); return true; },
      test(st, api, T) { st.T = T; this.say(st, api); },
    },

    // ── 1-1-2 1차시 이론 그림: 전류·물질량·광도(위 칸을 눌러 고르고, 좌우로 끌어 양을 바꾼다) ──
    three: {
      init(st, api) { st.tab = 0; st.a = 0.4; st.q = Array.from({ length: 40 }, (_, i) => i / 40); this.say(st, api); },
      TABS: ['전류 · A', '물질량 · mol', '광도 · cd'],
      say(st, api) {
        const a = st.a;
        api.say([`전선의 한 단면을 1초 동안 지나가는 전하가 많을수록 전류가 크다 — 지금 <b>${(a * 2).toFixed(1)} A</b>, 전구가 ${a > 0.6 ? '환하다' : a > 0.2 ? '켜졌다' : '거의 꺼졌다'}.`,
          `알갱이 <b>6.02×10²³개</b>를 한 묶음(1 mol)으로 센다. 물 ${(0.5 + a * 2.5).toFixed(1)} mol = 물 <b>${Math.round((0.5 + a * 2.5) * 18)} g</b>(물 1 mol은 약 18 g).`,
          `촛불 하나만큼의 밝기가 대략 1 cd에서 출발했다 — 지금 촛불 <b>${1 + Math.round(a * 4)}개</b>, 판이 그만큼 밝다.`][st.tab]);
        api.chip('위 칸을 누르고, 좌우로 끌어 양 바꾸기');
      },
      draw(c, W, H, dt, st) {
        const top = 64, a = st.a, t = st.t;
        if (st.tab === 2) XK.vgrad(c, 0, 0, W, H, ['#151a2b', '#232a40']); else XK.vgrad(c, 0, 0, W, H, ['#f4f6f9', '#e3e8ef']);
        this.TABS.forEach((s, i) => { const w = (W - 40) / 3, x = 20 + i * w; c.fillStyle = i === st.tab ? '#ffd84d' : 'rgba(255,255,255,.9)'; c.strokeStyle = '#1d2433'; c.lineWidth = 2.5; XK.rr(c, x + 4, 12, w - 8, 40, 20); c.fill(); c.stroke(); XK.txt(c, s, x + w / 2, 39, '#1d2433', i === st.tab ? '800 19px' : '600 18px'); });
        const cy = (H + top) / 2;
        if (st.tab === 0) {
          const x0 = 50, x1 = W - 190, r = 40;
          const cg = c.createLinearGradient(0, cy - r, 0, cy + r); cg.addColorStop(0, '#f1b27a'); cg.addColorStop(0.5, '#c8742f'); cg.addColorStop(1, '#7a3f12');
          c.fillStyle = '#3b4252'; XK.rr(c, x0 - 6, cy - r - 10, x1 - x0 + 12, 2 * r + 20, r); c.fill(); c.fillStyle = cg; XK.rr(c, x0, cy - r, x1 - x0, 2 * r, r); c.fill();
          c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(x0 + 10, cy - r + 8, x1 - x0 - 20, 10);
          const gx = (x0 + x1) / 2; c.strokeStyle = '#ffd84d'; c.lineWidth = 3; c.setLineDash([8, 6]); c.beginPath(); c.ellipse(gx, cy, 14, r + 14, 0, 0, XK.TAU); c.stroke(); c.setLineDash([]);
          XK.txt(c, '이 단면을 1초에 지나가는 전하', gx, cy - r - 24, '#1d2433', '700 17px');
          st.q.forEach((u, i) => { st.q[i] = (u + dt * a * 0.25) % 1; const x = x0 + 20 + st.q[i] * (x1 - x0 - 40), y = cy + Math.sin(i * 2.3) * (r - 14); XK.ball(c, x, y, 8, '#8fd3ff', '#1d5f7c'); XK.txt(c, '−', x, y + 5, '#0b2a3a', '800 13px'); });
          const bx = W - 110, by = cy - 30;
          XK.glow(c, bx, by, 40 + a * 120, `rgba(255,220,120,${0.15 + a * 0.6})`);
          c.fillStyle = `rgba(255,${230 - (1 - a) * 60},${150 - (1 - a) * 80},${0.35 + a * 0.6})`; c.beginPath(); c.arc(bx, by, 36, 0, XK.TAU); c.fill(); c.strokeStyle = '#1d2433'; c.lineWidth = 2.5; c.stroke();
          c.strokeStyle = `rgba(255,140,40,${0.4 + a * 0.6})`; c.lineWidth = 3; c.beginPath(); c.moveTo(bx - 12, by + 10); c.lineTo(bx - 6, by - 8); c.lineTo(bx, by + 6); c.lineTo(bx + 6, by - 8); c.lineTo(bx + 12, by + 10); c.stroke();
          c.fillStyle = '#9aa3b4'; c.fillRect(bx - 18, by + 34, 36, 26); XK.line(c, x1, cy, bx - 18, by + 48, '#7a3f12', 8);
          XK.pill(c, gx, H - 26, `전류 ${(a * 2).toFixed(1)} A`, '#1d2433', '#ffd84d', '800 20px');
        } else if (st.tab === 1) {
          const n = 0.5 + a * 2.5, m = n * 18, px = W * 0.17, qx = W * 0.47;
          XK.txt(c, '연필 12자루 = 1다스', px, top + 46, '#1d2433', '700 18px');
          for (let i = 0; i < 12; i++) { const x = px - 66 + i * 12, y = cy - 70; const pg = c.createLinearGradient(x, 0, x + 10, 0); pg.addColorStop(0, '#f2c230'); pg.addColorStop(1, '#c79a10'); c.fillStyle = pg; c.fillRect(x, y, 10, 150); c.fillStyle = '#f1d3b0'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 5, y - 16); c.lineTo(x + 10, y); c.fill(); c.fillStyle = '#e88aa0'; c.fillRect(x, y + 150, 10, 10); }
          c.strokeStyle = '#e4572e'; c.lineWidth = 6; c.beginPath(); c.moveTo(px - 70, cy + 10); c.lineTo(px + 76, cy + 10); c.stroke();
          XK.txt(c, '→', (px + qx) / 2, cy + 8, '#5b6578', '800 34px');
          XK.txt(c, '알갱이 6.02×10²³개 = 1 mol', qx, top + 46, '#1d2433', '700 18px');
          const bagg = c.createLinearGradient(qx - 90, 0, qx + 90, 0); bagg.addColorStop(0, '#d9c7a3'); bagg.addColorStop(0.5, '#f3e7cc'); bagg.addColorStop(1, '#c9b48a'); c.fillStyle = bagg; c.strokeStyle = '#1d2433'; c.lineWidth = 2.5;
          c.beginPath(); c.moveTo(qx - 70, cy - 70); c.quadraticCurveTo(qx - 100, cy + 40, qx - 80, cy + 110); c.lineTo(qx + 80, cy + 110); c.quadraticCurveTo(qx + 100, cy + 40, qx + 70, cy - 70); c.closePath(); c.fill(); c.stroke();
          c.save(); c.clip(); const R = XK.rnd(3); for (let i = 0; i < 140; i++) { const x = qx - 85 + R() * 170, y = cy - 40 + R() * 150 + Math.sin(t * 2 + i) * 2; XK.ball(c, x, y, 4.5, '#7fc4ff', '#1d5f7c'); } c.restore();
          c.fillStyle = '#e4572e'; XK.rr(c, qx - 46, cy - 92, 92, 30, 8); c.fill(); XK.txt(c, '1 mol', qx, cy - 70, '#fff', '800 19px');
          for (let i = 0; i < 6; i++) { const q = (t * 0.6 + i / 6) % 1; XK.ball(c, qx + Math.sin(i * 2.1) * 30, cy - 150 + q * 70, 4.5, '#7fc4ff', '#1d5f7c'); }
          const sx = W * 0.8, sy = H - 70, bw = 150, bh = 220, fill = XK.clamp(m / 60, 0.05, 1);
          c.fillStyle = '#3b4252'; XK.rr(c, sx - 110, sy, 220, 36, 8); c.fill(); c.fillStyle = '#9fe0a8'; XK.rr(c, sx - 60, sy + 7, 120, 22, 4); c.fill(); XK.txt(c, `${m.toFixed(0)} g`, sx, sy + 25, '#0b3d1a', '800 19px');
          const wg = c.createLinearGradient(0, sy - bh * fill, 0, sy); wg.addColorStop(0, 'rgba(120,190,255,.55)'); wg.addColorStop(1, 'rgba(40,120,220,.75)'); c.fillStyle = wg; c.fillRect(sx - bw / 2 + 4, sy - bh * fill, bw - 8, bh * fill - 2);
          c.strokeStyle = '#1d2433'; c.lineWidth = 3; c.beginPath(); c.moveTo(sx - bw / 2, sy - bh); c.lineTo(sx - bw / 2, sy); c.lineTo(sx + bw / 2, sy); c.lineTo(sx + bw / 2, sy - bh); c.stroke();
          c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 5; c.beginPath(); c.moveTo(sx - bw / 2 + 12, sy - bh + 20); c.lineTo(sx - bw / 2 + 12, sy - 20); c.stroke();
          XK.pill(c, sx, sy - bh - 26, `물 ${n.toFixed(1)} mol`, '#1d2433', '#ffd84d', '800 20px');
        } else {
          const n = 1 + Math.round(a * 4), cx = W * 0.3, sx = W * 0.78;
          XK.glow(c, cx, cy - 40, 120 + n * 40, `rgba(255,200,110,${0.12 + n * 0.06})`);
          const rays = c.createLinearGradient(cx, 0, sx, 0); rays.addColorStop(0, `rgba(255,214,120,${0.08 + n * 0.05})`); rays.addColorStop(1, 'rgba(255,214,120,0)'); c.fillStyle = rays; c.beginPath(); c.moveTo(cx, cy - 60); c.lineTo(sx, cy - 150); c.lineTo(sx, cy + 110); c.closePath(); c.fill();
          for (let i = 0; i < n; i++) { const x = cx + (i - (n - 1) / 2) * 44, y = cy + 40; const wg = c.createLinearGradient(x - 12, 0, x + 12, 0); wg.addColorStop(0, '#e9e1cf'); wg.addColorStop(0.5, '#fffaf0'); wg.addColorStop(1, '#d6ccb4'); c.fillStyle = wg; c.fillRect(x - 12, y - 60, 24, 100); XK.line(c, x, y - 60, x, y - 70, '#333', 2); const fl = 1 + 0.12 * Math.sin(t * 13 + i * 2); c.fillStyle = '#ffb347'; c.beginPath(); c.ellipse(x, y - 84, 8, 16 * fl, 0, 0, XK.TAU); c.fill(); c.fillStyle = '#fff3c4'; c.beginPath(); c.ellipse(x, y - 80, 4, 8 * fl, 0, 0, XK.TAU); c.fill(); }
          const lum = Math.min(1, n / 5); c.fillStyle = `rgb(${60 + lum * 180},${58 + lum * 170},${50 + lum * 120})`; c.strokeStyle = '#fbfcf9'; c.lineWidth = 2.5; XK.rr(c, sx - 50, cy - 150, 100, 260, 8); c.fill(); c.stroke();
          XK.txt(c, '밝기를 받는 판', sx, cy + 140, '#fbfcf9', '700 16px');
          XK.pill(c, cx, H - 26, `촛불 ${n}개 ≈ ${n} cd`, '#ffd84d', '#1d2433', '800 20px');
        }
      },
      hint(st) { return { tap: true, x: 20 + (st.W - 40) / 3 * 1.5, y: 32, label: '눌러서 고르기' }; },
      down(p, st, api) { if (p.y < 60) { st.tab = XK.clamp(Math.floor((p.x - 20) / ((st.W - 40) / 3)), 0, 2); this.say(st, api); } else st.drag = { x: p.x, a: st.a }; },
      move(p, st, api, held) { if (!held || !st.drag) return; st.a = XK.clamp(st.drag.a + (p.x - st.drag.x) / st.W * 1.4, 0, 1); this.say(st, api); },
      up(p, st) { st.drag = null; },
      key(k, st, api) { if (k === 'Tab') return false; const d = { ArrowLeft: -0.05, ArrowRight: 0.05 }[k]; if (d) { st.a = XK.clamp(st.a + d, 0, 1); this.say(st, api); return true; } if (k === 'ArrowDown' || k === 'ArrowUp') { st.tab = (st.tab + (k === 'ArrowDown' ? 1 : 2)) % 3; this.say(st, api); return true; } return false; },
      test(st, api, tab, a) { st.tab = tab; st.a = a; this.say(st, api); },
    },

    // ── 1-1-1 2차시: 진자 길이를 바꿔 1초 시계 만들기. 한 번 건너가는 시간 = π√(L/g), L ≈ 99 cm면 1초 ──
    pend: {
      init(st, api) { st.L = 0.5; st.th = 0; st.om = 0; st.drag = false; st.tr = []; st.last = null; st.half = null; st.lens = []; st.n = 0; api.say('추를 잡아 옆으로 당겼다 놓아 보자. 위아래로 끌면 <b>줄 길이</b>가 바뀐다.'); api.chip('추를 당겼다 놓자'); },
      geo(W, H) { const px = W * 0.45, py = 44, k = (H - 120) / 1.5; return { px, py, k }; },
      draw(c, W, H, dt, st, api) {
        const g = this.geo(W, H), gr = 9.8;
        if (!st.drag) { const n = 8, h = dt / n; for (let i = 0; i < n; i++) { const prev = st.th; st.om += -(gr / st.L) * Math.sin(st.th) * h; st.th += st.om * h; st.clock = (st.clock || 0) + h; if (Math.abs(st.om) > 0.02 && prev * st.th < 0) this.cross(st, api); } }
        XK.vgrad(c, 0, 0, W, H, ['#f7f1e6', '#ede3d0']);
        XK.vgrad(c, 0, H - 40, W, 40, ['#b98b5c', '#9c6f45']);
        const wg = c.createLinearGradient(0, 0, 0, 36); wg.addColorStop(0, '#8a5a32'); wg.addColorStop(1, '#5e3a1c'); c.fillStyle = wg; c.fillRect(0, 0, W, 36);
        c.strokeStyle = 'rgba(40,20,5,.3)'; c.lineWidth = 1.5; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(0, 8 + i * 10); c.bezierCurveTo(W * 0.3, 12 + i * 10, W * 0.6, 4 + i * 10, W, 9 + i * 10); c.stroke(); }
        // 자(줄 길이)
        const rx = g.px - 120; c.fillStyle = 'rgba(255,248,220,.95)'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.fillRect(rx - 26, g.py, 52, 1.5 * g.k + 4); c.strokeRect(rx - 26, g.py, 52, 1.5 * g.k + 4);
        for (let cm = 0; cm <= 150; cm += 5) { const y = g.py + cm / 100 * g.k; XK.line(c, rx + 26, y, rx + 26 - (cm % 50 ? (cm % 10 ? 6 : 12) : 20), y, '#1d2433', 1.5); if (!(cm % 50)) XK.txt(c, `${cm}`, rx - 4, y + 5, '#1d2433', '700 14px'); }
        XK.txt(c, 'cm', rx, g.py + 1.5 * g.k + 24, '#1d2433', '700 14px');
        XK.line(c, rx + 26, g.py + st.L * g.k, g.px, g.py + st.L * g.k, 'rgba(228,87,46,.45)', 1.5, [5, 5]);
        const bx = g.px + Math.sin(st.th) * st.L * g.k, by = g.py + Math.cos(st.th) * st.L * g.k;
        st.tr.push([bx, by]); if (st.tr.length > 40) st.tr.shift();
        st.tr.forEach(([x, y], i) => { c.fillStyle = `rgba(228,140,46,${i / 40 * 0.35})`; c.beginPath(); c.arc(x, y, 4 + i / 10, 0, XK.TAU); c.fill(); });
        XK.shadow(c, bx, H - 30, 26, 6, 0.2 + 0.2 * (by / H));
        XK.line(c, g.px, g.py, bx, by, '#3b3b3b', 2.5);
        c.fillStyle = '#444'; c.beginPath(); c.arc(g.px, g.py, 7, 0, XK.TAU); c.fill(); c.fillStyle = '#777'; c.fillRect(g.px - 20, 30, 40, 10);
        XK.ball(c, bx, by, 24, '#e2b04a', '#7a5410', '#fff6d6');
        XK.pill(c, bx + 70, by, `${Math.round(st.L * 100)} cm`, 'rgba(29,36,51,.85)', '#fff', '700 16px');
        // 초시계
        const sx = W - 120, sy = 150, sr = 78;
        XK.ball(c, sx, sy, sr + 10, '#d9dde6', '#7a8396'); c.fillStyle = '#fff'; c.beginPath(); c.arc(sx, sy, sr, 0, XK.TAU); c.fill();
        for (let i = 0; i < 60; i++) { const a = i / 60 * XK.TAU - Math.PI / 2; XK.line(c, sx + Math.cos(a) * sr * (i % 5 ? 0.9 : 0.8), sy + Math.sin(a) * sr * (i % 5 ? 0.9 : 0.8), sx + Math.cos(a) * sr * 0.97, sy + Math.sin(a) * sr * 0.97, '#1d2433', i % 5 ? 1 : 2.5); }
        const ha = ((st.clock || 0) % 60) / 60 * XK.TAU - Math.PI / 2; XK.line(c, sx, sy, sx + Math.cos(ha) * sr * 0.85, sy + Math.sin(ha) * sr * 0.85, '#e4572e', 3); c.fillStyle = '#1d2433'; c.beginPath(); c.arc(sx, sy, 5, 0, XK.TAU); c.fill();
        c.fillStyle = '#9aa3b4'; c.fillRect(sx - 9, sy - sr - 26, 18, 16);
        XK.txt(c, '진짜 1초씩 가는 초시계', sx, sy + sr + 34, '#1d2433', '700 15px');
        const hv = st.half; XK.pill(c, sx, sy + sr + 74, hv ? `한 번 건너가기 ${hv.toFixed(2)}초` : '아직 안 흔들었다', hv && Math.abs(hv - 1) < 0.03 ? '#2f9e5b' : '#1d2433', '#fff', '800 18px');
        XK.txt(c, `건너간 횟수 ${st.n}`, sx, sy + sr + 112, '#5b6578', '700 16px');
      },
      cross(st, api) {
        st.n++; const now = st.clock;
        if (st.last != null) {
          st.half = now - st.last; api.ok(1);
          if (!st.lens.some((l) => Math.abs(l - st.L) < 0.2)) st.lens.push(st.L); if (st.lens.length >= 2) api.ok(2);
          if (Math.abs(st.half - 1) < 0.03) { api.ok(1); api.ok(2); api.ok(3); api.say(`줄 <b>${Math.round(st.L * 100)} cm</b>에서 한 번 건너가는 데 <b>1초</b> — 옛 괘종시계의 추가 이렇게 1초를 셌다. 흔들림이 고르게 되풀이되기 때문이다.`); api.chip('1초 진자를 만들었다', true); }
          else api.say(`한 번 건너가는 데 <b>${st.half.toFixed(2)}초</b>. ${st.half < 1 ? '줄이 <b>길수록</b> 느리게 흔들린다 — 더 길게!' : '조금 <b>짧게</b> 해 보자.'}`);
        }
        st.last = now;
      },
      hint(st) { const g = this.geo(st.W, st.H); return { x: g.px, y: g.py + st.L * g.k, dx: 1, dy: -0.2, label: '당겼다 놓기', dist: 110 }; },
      down(p, st) { const g = this.geo(st.W, st.H), bx = g.px + Math.sin(st.th) * st.L * g.k, by = g.py + Math.cos(st.th) * st.L * g.k; if (Math.hypot(p.x - bx, p.y - by) < 60) { st.drag = true; st.om = 0; } },
      move(p, st, api) { if (!st.drag) return; const g = this.geo(st.W, st.H), dx = p.x - g.px, dy = Math.max(10, p.y - g.py); st.L = XK.clamp(Math.hypot(dx, dy) / g.k, 0.15, 1.45); st.th = XK.clamp(Math.atan2(dx, dy), -0.6, 0.6); st.last = null; st.half = null; st.n = 0; },
      up(p, st, api) { if (!st.drag) return; st.drag = false; st.om = 0; if (Math.abs(st.th) < 0.05) st.th = 0.25; api.say('흔들린다 — 오른쪽 초시계와 견주어 보자. 한 번 건너갈 때마다 시간을 잰다.'); api.chip('줄 길이를 바꿔 1초를 맞추자'); },
      key(k, st, api) { const d = { ArrowUp: -0.01, ArrowDown: 0.01 }[k]; if (k === 'Enter' || k === ' ') { st.th = 0.3; st.om = 0; st.last = null; st.n = 0; return true; } if (!d) return false; st.L = XK.clamp(st.L + d, 0.15, 1.45); st.last = null; st.half = null; return true; },
      test(st, api, L) { st.L = L; st.th = 0.3; st.om = 0; st.last = null; st.n = 0; },
    },

    // ── 1-1-2 2차시: 배터리 용량 = 전류 × 시간. 앱마다 쓰는 전류는 이해를 돕기 위한 예 ──
    battery: {
      APPS: [['게임', 1000, '#e4572e'], ['영상', 600, '#7b4bb0'], ['음악', 300, '#2f9e5b']],
      init(st, api) { st.app = -1; st.h = 0; st.runs = []; api.say('휴대 전화 아래 앱 하나를 눌러 실행하자. 배터리 <b>3000 mAh</b>가 다 닳을 때까지 몇 시간 쓸 수 있을까?'); api.chip('앱을 눌러 실행'); },
      draw(c, W, H, dt, st, api) {
        XK.vgrad(c, 0, 0, W, H, ['#eef2f7', '#dfe5ee']);
        if (st.app >= 0) { const I = this.APPS[st.app][1]; st.h += dt * 1.25; if (st.h * I >= 3000) { st.h = 3000 / I; this.finish(st, api); } }
        const used = st.app >= 0 ? st.h * this.APPS[st.app][1] : 0, left = XK.clamp(1 - used / 3000, 0, 1);
        // 휴대 전화
        const px = 40, py = 30, pw = W * 0.28, ph = H - 150;
        XK.shadow(c, px + pw / 2 + 10, py + ph + 14, pw * 0.45, 10, 0.2);
        c.fillStyle = '#1d2433'; XK.rr(c, px, py, pw, ph, 26); c.fill();
        const sx = px + 10, sy = py + 34, sw = pw - 20, sh = ph - 60;
        c.save(); XK.rr(c, sx, sy, sw, sh, 12); c.clip();
        if (st.app < 0) XK.vgrad(c, sx, sy, sw, sh, ['#2a3550', '#141b2e']);
        else if (st.app === 0) { XK.vgrad(c, sx, sy, sw, sh, ['#1b5e9e', '#57b0e6']); for (let i = 0; i < 6; i++) { const x = sx + ((st.t * 120 + i * 70) % (sw + 40)) - 20; c.fillStyle = '#fff'; c.beginPath(); c.arc(x, sy + 40 + i * 9, 14, 0, XK.TAU); c.fill(); } c.fillStyle = '#3a9a5c'; c.fillRect(sx, sy + sh - 50, sw, 50); const jy = sy + sh - 74 - Math.abs(Math.sin(st.t * 5)) * 60; XK.ball(c, sx + sw * 0.35, jy, 16, '#ffd84d', '#c79a10'); }
        else if (st.app === 1) { XK.vgrad(c, sx, sy, sw, sh, ['#ff9e6b', '#7b4bb0']); c.fillStyle = '#ffe08a'; c.beginPath(); c.arc(sx + sw * 0.6, sy + sh * 0.35 + Math.sin(st.t) * 6, 28, 0, XK.TAU); c.fill(); c.fillStyle = '#2b2440'; c.beginPath(); c.moveTo(sx, sy + sh); c.lineTo(sx + sw * 0.4, sy + sh * 0.55); c.lineTo(sx + sw * 0.8, sy + sh); c.fill(); c.fillStyle = 'rgba(0,0,0,.4)'; c.fillRect(sx, sy + sh - 18, sw, 18); c.fillStyle = '#e4572e'; c.fillRect(sx, sy + sh - 18, sw * (st.t * 0.05 % 1), 18); }
        else { XK.vgrad(c, sx, sy, sw, sh, ['#1f3d2b', '#0f2016']); for (let i = 0; i < 9; i++) { const h = 20 + Math.abs(Math.sin(st.t * 6 + i * 1.7)) * sh * 0.4; c.fillStyle = '#5be08a'; c.fillRect(sx + 14 + i * (sw - 28) / 9, sy + sh * 0.75 - h, (sw - 28) / 9 - 6, h); } }
        c.restore();
        // 배터리
        const bx = px + pw / 2 - 30, by = py + 12; c.strokeStyle = '#fff'; c.lineWidth = 2; c.strokeRect(bx, by, 52, 14); c.fillStyle = '#fff'; c.fillRect(bx + 52, by + 4, 4, 6);
        c.fillStyle = left > 0.3 ? '#5be08a' : '#ff6b5b'; c.fillRect(bx + 2, by + 2, 48 * left, 10);
        XK.txt(c, `${Math.round(left * 100)}%`, bx + 72, by + 13, '#fff', '700 13px', 'left');
        // 앱 단추
        this.APPS.forEach(([n, I, col], i) => { const x = px + (i + 0.5) * pw / 3, y = H - 58; c.fillStyle = col; c.strokeStyle = st.app === i ? '#ffd84d' : '#1d2433'; c.lineWidth = st.app === i ? 5 : 2; XK.rr(c, x - 44, y - 30, 88, 60, 14); c.fill(); c.stroke(); XK.txt(c, n, x, y - 2, '#fff', '800 19px'); XK.txt(c, `${I} mA`, x, y + 20, '#fff', '600 14px'); });
        // 그래프: 전류 × 시간 = 넓이
        const gx = W * 0.4, gy = 40, gw = W * 0.56, gh = H - 130, X = (h) => gx + h / 12 * gw, Y = (I) => gy + gh - I / 1100 * gh;
        c.fillStyle = '#fff'; c.fillRect(gx, gy, gw, gh); XK.grid(c, gx, gy, gw, gh, gw / 12, 'rgba(29,36,51,.08)');
        st.runs.forEach((r) => { const [, I, col] = this.APPS[r]; c.fillStyle = col + '33'; c.fillRect(X(0), Y(I), X(3000 / I) - X(0), Y(0) - Y(I)); c.strokeStyle = col; c.lineWidth = 2.5; c.strokeRect(X(0), Y(I), X(3000 / I) - X(0), Y(0) - Y(I)); XK.txt(c, `${3000 / I}시간`, X(3000 / I) - 6, Y(I) - 8, col, '800 16px', 'right'); });
        if (st.app >= 0) { const [, I, col] = this.APPS[st.app]; c.fillStyle = col + '88'; c.fillRect(X(0), Y(I), X(st.h) - X(0), Y(0) - Y(I)); XK.line(c, X(st.h), Y(I) - 10, X(st.h), Y(0), col, 3); }
        c.strokeStyle = '#1d2433'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(gx, gy); c.lineTo(gx, gy + gh); c.lineTo(gx + gw, gy + gh); c.stroke();
        for (let h = 0; h <= 12; h += 2) XK.txt(c, `${h}`, X(h), gy + gh + 22, '#1d2433', '600 15px');
        XK.txt(c, '사용 시간(시간)', gx + gw, gy + gh + 46, '#1d2433', '700 15px', 'right');
        for (let I = 0; I <= 1000; I += 250) XK.txt(c, `${I}`, gx - 8, Y(I) + 5, '#1d2433', '600 14px', 'right');
        XK.txt(c, '전류(mA)', gx + 6, gy - 12, '#1d2433', '700 15px', 'left');
        XK.pill(c, gx + gw / 2 + 60, gy + 24, `쓴 양 = 전류 × 시간 = ${Math.round(used).toLocaleString('ko-KR')} mAh`, '#1d2433', '#ffd84d', '800 17px');
      },
      finish(st, api) {
        const r = st.app; if (!st.runs.includes(r)) st.runs.push(r); const [n, I] = this.APPS[r];
        api.say(`<b>${n}</b>: ${I} mA × <b>${3000 / I}시간</b> = 3000 mAh. 전류가 작을수록 오래 쓴다 — 그래프의 <b>넓이</b>는 늘 같다.`);
        if (r === 0) api.ok(1); if (r === 2) api.ok(2); if (r === 1) api.ok(3);
        api.chip(st.runs.length === 3 ? '세 넓이가 모두 3000 mAh' : '다른 앱도 눌러 보자', st.runs.length === 3);
        st.app = -1; st.h = 0;
      },
      hint(st) { return { tap: true, x: 40 + st.W * 0.28 / 6, y: st.H - 58, label: '눌러 실행' }; },
      down(p, st, api) { const px = 40, pw = st.W * 0.28; if (p.y > st.H - 92 && p.x > px && p.x < px + pw) { st.app = XK.clamp(Math.floor((p.x - px) / (pw / 3)), 0, 2); st.h = 0; api.say(`<b>${this.APPS[st.app][0]}</b> 실행 중 — 1초에 <b>${this.APPS[st.app][1]} mA</b>씩 흐른다. 배터리가 닳는 것을 보자.`); } },
      key(k, st, api) { const i = { 1: 0, 2: 1, 3: 2 }[k]; if (i == null) return false; st.app = i; st.h = 0; return true; },
      test(st, api, i) { st.app = i; st.h = 3000 / this.APPS[i][1]; this.finish(st, api); },
    },

    // ── 1-1-2 2차시: 설탕물 농도 = 설탕 질량 ÷ 설탕물 질량 × 100 ──
    sugar: {
      init(st, api) { st.s = 0; st.w = 90; st.drag = null; st.fall = []; api.say('숟가락을 끌어 비커 위에서 놓으면 설탕 <b>5 g</b>이 들어간다. 물병을 끌어 놓으면 물 <b>50 g</b>.'); api.chip('숟가락을 비커로'); },
      geo(W, H) { return { bx: W * 0.5, by: H - 120, bw: W * 0.3, bh: H * 0.58, sp: { x: W * 0.15, y: H - 150 }, pt: { x: W * 0.85, y: H - 200 }, rs: { x: 76, y: 34 } }; },
      draw(c, W, H, dt, st, api) {
        const g = this.geo(W, H), tot = st.s + st.w, pc = tot ? st.s / tot * 100 : 0;
        XK.vgrad(c, 0, 0, W, H - 70, ['#f6f3ec', '#ebe5d8']); XK.grid(c, 0, 0, W, H - 70, 46, 'rgba(120,100,70,.10)'); XK.vgrad(c, 0, H - 70, W, 70, ['#d8cbb3', '#c4b496']);
        // 저울
        c.fillStyle = '#3b4252'; XK.rr(c, g.bx - 150, g.by, 300, 52, 10); c.fill(); c.fillStyle = '#9fe0a8'; XK.rr(c, g.bx - 70, g.by + 12, 140, 30, 5); c.fill();
        XK.txt(c, `${tot} g`, g.bx, g.by + 36, '#0b3d1a', '800 22px');
        // 비커와 물
        const fill = XK.clamp(tot / 300, 0.1, 0.95), top = g.by - g.bh * fill;
        const wg = c.createLinearGradient(0, top, 0, g.by); wg.addColorStop(0, `rgba(${200 + pc * 2},${225 - pc},${255 - pc * 4},.6)`); wg.addColorStop(1, `rgba(${150 + pc * 3},${190 - pc},${240 - pc * 5},.8)`);
        c.fillStyle = wg; c.fillRect(g.bx - g.bw / 2 + 4, top, g.bw - 8, g.by - top - 2);
        c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 2; c.beginPath(); for (let x = -g.bw / 2 + 6; x < g.bw / 2 - 6; x += 6) c.lineTo(g.bx + x, top + Math.sin(x * 0.1 + st.t * 3) * 2); c.stroke();
        st.fall = st.fall.filter((q) => (q.y += q.v * dt, q.v += 300 * dt, q.l -= dt) > 0);
        st.fall.forEach((q) => { const y = Math.min(q.y, g.by - 10); c.fillStyle = `rgba(255,255,255,${y > top ? q.l : 1})`; c.fillRect(q.x, y, 4, 4); });
        c.strokeStyle = '#1d2433'; c.lineWidth = 3; c.beginPath(); c.moveTo(g.bx - g.bw / 2 - 8, g.by - g.bh); c.lineTo(g.bx - g.bw / 2, g.by - g.bh + 8); c.lineTo(g.bx - g.bw / 2, g.by); c.lineTo(g.bx + g.bw / 2, g.by); c.lineTo(g.bx + g.bw / 2, g.by - g.bh); c.stroke();
        for (let i = 1; i < 6; i++) XK.line(c, g.bx + g.bw / 2 - 30, g.by - i * g.bh / 6, g.bx + g.bw / 2, g.by - i * g.bh / 6, 'rgba(29,36,51,.5)', 1.5);
        c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 6; c.beginPath(); c.moveTo(g.bx - g.bw / 2 + 14, g.by - g.bh + 26); c.lineTo(g.bx - g.bw / 2 + 14, g.by - 24); c.stroke();
        // 설탕 그릇과 숟가락(1.4배)
        const sp0 = st.drag && st.drag.k === 'sp' ? st.drag : g.sp; c.save(); c.translate(g.sp.x, g.sp.y); c.scale(1.4, 1.4); c.translate(-g.sp.x, -g.sp.y); const sp = { x: g.sp.x + (sp0.x - g.sp.x) / 1.4, y: g.sp.y + (sp0.y - g.sp.y) / 1.4 };
        c.fillStyle = '#d97b3d'; c.beginPath(); c.ellipse(g.sp.x, g.sp.y + 20, 70, 26, 0, 0, Math.PI); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.ellipse(g.sp.x, g.sp.y + 20, 66, 16, 0, Math.PI, XK.TAU); c.fill(); c.fillStyle = '#f2ead8'; c.beginPath(); c.ellipse(g.sp.x, g.sp.y + 18, 60, 12, 0, 0, XK.TAU); c.fill();
        XK.txt(c, '설탕', g.sp.x, g.sp.y + 70, '#1d2433', '700 15px');
        c.save(); c.translate(sp.x, sp.y - 10); c.rotate(-0.5); const mg = c.createLinearGradient(0, -6, 0, 6); mg.addColorStop(0, '#f2f4f8'); mg.addColorStop(1, '#8f97a8'); c.fillStyle = mg; XK.rr(c, 0, -5, 110, 10, 5); c.fill(); c.beginPath(); c.ellipse(-14, 0, 22, 14, 0, 0, XK.TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.ellipse(-14, -3, 16, 8, 0, 0, XK.TAU); c.fill(); c.restore(); c.restore();
        // 물병
        const pt = st.drag && st.drag.k === 'pt' ? st.drag : g.pt;
        c.save(); c.translate(pt.x, pt.y); c.scale(1.4, 1.4); if (st.drag && st.drag.k === 'pt') c.rotate(-0.5);
        const pg = c.createLinearGradient(-36, 0, 36, 0); pg.addColorStop(0, 'rgba(160,210,255,.7)'); pg.addColorStop(0.5, 'rgba(230,245,255,.9)'); pg.addColorStop(1, 'rgba(140,190,240,.7)'); c.fillStyle = pg; c.strokeStyle = '#1d2433'; c.lineWidth = 2.5;
        c.beginPath(); c.moveTo(-30, -60); c.lineTo(-40, -70); c.lineTo(30, -70); c.lineTo(34, 60); c.lineTo(-34, 60); c.closePath(); c.fill(); c.stroke(); c.fillStyle = 'rgba(60,140,230,.5)'; c.fillRect(-32, -10, 64, 68); c.restore();
        XK.txt(c, '물 50 g', g.pt.x, g.pt.y + 112, '#1d2433', '700 17px');
        // 처음부터
        c.fillStyle = '#fff'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; XK.rr(c, g.rs.x - 56, g.rs.y - 18, 112, 36, 18); c.fill(); c.stroke(); XK.txt(c, '처음부터', g.rs.x, g.rs.y + 6, '#1d2433', '700 16px');
        // 농도 식
        XK.pill(c, W / 2, 34, `설탕 ${st.s} g ÷ 설탕물 ${tot} g × 100 = ${pc.toFixed(1)} %`, '#1d2433', '#ffd84d', '800 20px');
      },
      hint(st) { const g = this.geo(st.W, st.H); return { x: g.sp.x + 30, y: g.sp.y - 20, dx: 1, dy: -0.4, label: '비커 위로 끌어 놓기', dist: 180 }; },
      down(p, st, api) {
        const g = this.geo(st.W, st.H);
        if (Math.hypot(p.x - g.rs.x, p.y - g.rs.y) < 50) { st.s = 0; st.w = 90; api.say('처음으로 — 물 90 g.'); return; }
        if (Math.hypot(p.x - g.sp.x, p.y - g.sp.y) < 80) st.drag = { k: 'sp', x: p.x, y: p.y };
        else if (Math.hypot(p.x - g.pt.x, p.y - g.pt.y) < 80) st.drag = { k: 'pt', x: p.x, y: p.y };
      },
      move(p, st) { if (st.drag) { st.drag.x = p.x; st.drag.y = p.y; } },
      up(p, st, api) { if (!st.drag) return; const k = st.drag.k; st.drag = null; const g = this.geo(st.W, st.H); if (Math.abs(p.x - g.bx) < g.bw && p.y < g.by) this.add(st, api, k); },
      add(st, api, k) {
        const g = this.geo(st.W, st.H);
        if (k === 'sp') { st.s += 5; for (let i = 0; i < 24; i++) st.fall.push({ x: g.bx - 30 + Math.random() * 60, y: g.by - g.bh - 20, v: Math.random() * 60, l: 1.6 }); } else st.w += 50;
        const tot = st.s + st.w, pc = st.s / tot * 100; api.ok(1);
        if (Math.abs(pc - 10) < 0.05 && st.w === 90) { api.ok(2); api.say('설탕 10 g + 물 90 g = 설탕물 100 g → <b>10 %</b>. 이제 물만 더 부어 <b>5 %</b>로 묽혀 보자.'); api.chip('물을 부어 5 %로'); }
        else if (Math.abs(pc - 5) < 0.05 && api.has(2)) { api.ok(3); api.say('설탕은 그대로 10 g인데 설탕물이 200 g → <b>5 %</b>. 농도는 <b>질량 ÷ 질량</b>으로 나타내는 양이다.'); api.chip('농도를 맞췄다', true); }
        else api.say(`설탕 <b>${st.s} g</b>, 설탕물 <b>${tot} g</b> → <b>${pc.toFixed(1)} %</b>.${pc > 10.05 && !api.has(2) ? ' 10 %를 넘었다 — 처음부터 다시 해 보자.' : ''}`);
      },
      key(k, st, api) { if (k === 's') { this.add(st, api, 'sp'); return true; } if (k === 'w') { this.add(st, api, 'pt'); return true; } return false; },
      test(st, api, k) { this.add(st, api, k); },
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
    root._xp = { st, test: (...a) => { st.touched = true; const r = K.test && K.test(st, api, ...a); S.redraw(); return r; } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Xp = { mount };
})();
