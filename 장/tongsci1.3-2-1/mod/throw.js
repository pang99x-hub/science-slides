/* 3-2 2차시 체험 «세게 던지면?»(교과서 129쪽 해 보기 · 그림 Ⅲ-17 · 128쪽 사고력 «중력 가속도가 2배인 곳»).
   가상 실험 화면: 높이 4.9 m 받침대 위 새총 발사대에 빨강·초록·파랑 공, 바닥에 0~10 m 거리 눈금, 위쪽에 행성 표지판(지구 · 중력 2배 행성 · 달).
   ① 공을 하나씩 뒤로 끌어 당겨 두면(당긴 길이 = 수평 속력, 0~4 m/s) 걸쇠에 걸려 있고, 왼쪽 발사 손잡이를 아래로 끌면 세 공이 동시에 날아간다.
      0.2초마다 잔상과 수평 점선(같은 순간의 세 공 높이), 바닥 눈금에 착지점·착지 시간(느린 화면 ×1/2).
   ② 오른쪽 표를 누르면 착지 시간(같음)과 수평 거리(속력에 비례)를 견준다.
   ③ 표지판을 눌러 중력 2배 행성(또는 달)에서 같은 속력으로 다시 던진다 → 더 빨리, 덜 멀리(달은 더 늦게, 더 멀리).
   높이·속력·달의 중력(지구의 1/6)은 이해를 돕기 위한 예. 공기 저항은 없다고 본다.
   Throw.mount(root) → { fit, setActive } · 시험용: root._tw.set([v,v,v]) · fire() · land() · planet(0~2) · cmp() · state() · geo() */
(function () {
  'use strict';
  const TAU = Math.PI * 2, HM = 4.9, DTG = 0.2, SLOW = 2, VMAX = 4, XM = 10;
  const PL = [
    { name: '지구', g: 9.8, sub: '9.8 m/s²' },
    { name: '중력 2배 행성', g: 19.6, sub: '19.6 m/s²' },
    { name: '달', g: 9.8 / 6, sub: '지구의 1/6' },
  ];
  const BALL = [
    { name: '빨강', c: ['#ffd2cc', '#e8483a', '#a8221a', '#4f0b06'], ink: '#c0321f' },
    { name: '초록', c: ['#d6f5d2', '#43b04a', '#1f7a2a', '#0b3a12'], ink: '#1f7a2a' },
    { name: '파랑', c: ['#d4e6ff', '#3f86d8', '#1c55a0', '#0b2a55'], ink: '#1c55a0' },
  ];
  const tLand = (g) => Math.sqrt(2 * HM / g);
  const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1), f2 = (x) => (Math.round(x * 100) / 100).toFixed(2);
  // 자체 확인: 지구 1.00 s, 2배 0.71 s, 달 2.45 s → 3 m/s면 3.0 · 2.1 · 7.3 m
  console.assert(f2(tLand(9.8)) === '1.00' && f2(tLand(19.6)) === '0.71' && f2(tLand(9.8 / 6)) === '2.45' && f1(3 * tLand(9.8 / 6)) === '7.3', 'throw: 착지 시간');

  function mount(root) {
    const stage = root.querySelector('.tw-stage');
    const chip = root.querySelector('.tw-now'), out = root.querySelector('.tw-out'), tab = root.querySelector('.tw-tab');
    const P = window.Play;
    let pl, v, res, ph, t, drag, sel, lever, clock, msg, thrown, distinct, compared, twice, bg = null, bgKey = '';

    function reset() {
      pl = 0; v = [1, 2, 3]; res = [{}, {}, {}]; ph = 'idle'; t = 0; drag = null; sel = 0; lever = 0; clock = 0; msg = '';
      thrown = new Set(); distinct = false; compared = false; twice = false;
      say('공을 <b>뒤로 끌어</b> 당겨 두자(많이 당길수록 빠르다). 다 되면 왼쪽 <b>발사 손잡이</b>를 아래로 끌어 내리자.');
      table(); steps();
    }
    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };

    // ── 자리 잡기: 1 m = k px ──
    const geo = () => {
      const W = S.W, H = S.H, X0 = Math.min(200, W * 0.21), GY = H - 64;
      const k = Math.min((W - X0 - 34) / (XM + 0.4), (GY - 150) / HM), top = GY - HM * k, R = 11, PK = 24;
      return { W, H, X0, GY, k, top, R, PK, sx: X0, sy: top - R, X: (m) => X0 + m * k, Y: (m) => top - R + m * k, lev: { x: 34, y0: top - 92, y1: top - 26 } };
    };
    const rest = (g, i) => ({ x: g.X0 - 14 - v[i] * g.PK, y: g.sy });
    const fly = (g, i, tt) => ({ x: g.X(v[i] * tt), y: g.Y(0.5 * PL[pl].g * tt * tt) });
    const signs = (g) => PL.map((p, i) => { const w = 148, h = 50, x = g.W - 18 - (3 - i) * (w + 10); return { x, y: 14, w, h }; });

    // ── 그림 ──
    function ball(c, x, y, R, i, a = 1) {
      const q = BALL[i].c; c.save(); c.globalAlpha = a;
      const g = c.createRadialGradient(x - R * 0.4, y - R * 0.45, R * 0.1, x, y, R);
      g.addColorStop(0, q[0]); g.addColorStop(0.4, q[1]); g.addColorStop(0.85, q[2]); g.addColorStop(1, q[3]);
      c.fillStyle = g; c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(15,20,30,.6)'; c.lineWidth = 1.2; c.stroke();
      c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(x - R * 0.38, y - R * 0.42, R * 0.3, R * 0.17, -0.6, 0, TAU); c.fill();
      c.restore();
    }
    function pill(c, x, y, s, bgc, fg = '#fff', f = '700 16px', al = 'center') {
      c.font = `${f} "IBM Plex Sans KR", sans-serif`; const w = c.measureText(s).width + 14, x0 = al === 'left' ? x : al === 'right' ? x - w : x - w / 2;
      c.fillStyle = bgc; c.beginPath(); c.roundRect(x0, y - 15, w, 24, 12); c.fill();
      P.txt(c, s, x0 + w / 2, y + 3, fg, f);
    }

    function paintBg(g) {
      const { W, H, X0, GY, k, top, X } = g;
      const k2 = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const cv = document.createElement('canvas'); cv.width = W * k2; cv.height = H * k2;
      const c = cv.getContext('2d'); c.setTransform(k2, 0, 0, k2, 0, 0);
      const SKY = [['#7fc2ef', '#d9efff'], ['#4a2f5e', '#e59a6a'], ['#03050c', '#12151f']][pl];
      const sky = c.createLinearGradient(0, 0, 0, GY); sky.addColorStop(0, SKY[0]); sky.addColorStop(1, SKY[1]); c.fillStyle = sky; c.fillRect(0, 0, W, GY);
      if (pl === 0) {
        [[0.2, 0.18, 46], [0.55, 0.12, 34], [0.82, 0.24, 40]].forEach(([x, y, r]) => { c.fillStyle = 'rgba(255,255,255,.85)'; [0, 1, 2].forEach((j) => { c.beginPath(); c.arc(W * x + j * r * 0.8, H * y + (j === 1 ? -r * 0.3 : 0), r * 0.6, 0, TAU); c.fill(); }); });
        c.fillStyle = '#9cc58a'; c.beginPath(); c.moveTo(0, GY); for (let x = 0; x <= W; x += 20) c.lineTo(x, GY - 40 - 26 * Math.sin(x / 140) - 14 * Math.sin(x / 47)); c.lineTo(W, GY); c.fill();
      } else if (pl === 1) {
        P.glow(c, W * 0.62, GY - 120, 140, 'rgba(255,200,140,.55)'); c.fillStyle = '#ffd7a8'; c.beginPath(); c.arc(W * 0.62, GY - 120, 34, 0, TAU); c.fill();
        c.fillStyle = '#7a3c3a'; c.beginPath(); c.moveTo(0, GY); for (let x = 0; x <= W; x += 16) c.lineTo(x, GY - 30 - 50 * Math.abs(Math.sin(x / 110)) - 12 * Math.sin(x / 31)); c.lineTo(W, GY); c.fill();
      } else {
        for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(255,255,255,${0.3 + (i % 5) * 0.14})`; c.fillRect(((i * 397) % 1009) / 1009 * W, ((i * 211) % 997) / 997 * (GY - 20), i % 7 ? 1.3 : 2.2, i % 7 ? 1.3 : 2.2); }
        const ex = W * 0.6, ey = GY * 0.42, er = 30; const eg = c.createRadialGradient(ex - 10, ey - 10, 4, ex, ey, er); eg.addColorStop(0, '#bfe3ff'); eg.addColorStop(0.6, '#2f6fbf'); eg.addColorStop(1, '#0d2a55');
        c.fillStyle = eg; c.beginPath(); c.arc(ex, ey, er, 0, TAU); c.fill(); c.fillStyle = 'rgba(80,160,90,.8)'; c.beginPath(); c.ellipse(ex - 6, ey + 4, 9, 13, 0.4, 0, TAU); c.fill();
      }
      // 바닥
      const GC = [['#6fae4c', '#3f7a2c'], ['#9a4a33', '#5c2a1d'], ['#a3a6ab', '#6c7076']][pl];
      const gr = c.createLinearGradient(0, GY, 0, H); gr.addColorStop(0, GC[0]); gr.addColorStop(1, GC[1]); c.fillStyle = gr; c.fillRect(0, GY, W, H - GY);
      for (let i = 0; i < 300; i++) { c.fillStyle = `rgba(0,0,0,${0.06 + (i % 3) * 0.04})`; c.fillRect(((i * 397) % 1009) / 1009 * W, GY + ((i * 211) % 997) / 997 * (H - GY), 2, 1.5); }
      if (pl === 2) for (let i = 0; i < 9; i++) { const x = ((i * 233) % 977) / 977 * W, w = 18 + (i % 4) * 9; c.strokeStyle = 'rgba(40,42,46,.45)'; c.lineWidth = 2; c.beginPath(); c.ellipse(x, GY + 14 + (i % 3) * 12, w, w * 0.22, 0, 0, TAU); c.stroke(); }
      // 거리 눈금(0 = 받침대 앞면)
      c.fillStyle = 'rgba(255,255,255,.92)'; c.fillRect(X(0) - 4, GY + 2, X(XM) - X(0) + 8, 10);
      c.strokeStyle = '#1d2433'; c.lineWidth = 1.2;
      for (let m = 0; m <= XM * 2; m++) { const x = X(m / 2), L = m % 2 ? 6 : 12; c.beginPath(); c.moveTo(x, GY + 2); c.lineTo(x, GY + 2 + L); c.stroke(); if (m % 2 === 0) P.txt(c, String(m / 2), x, GY + 32, pl === 2 ? '#fbfcf9' : '#fbfcf9', '700 15px'); }
      P.txt(c, '거리(m)', X(XM), GY + 52, '#fbfcf9', '700 15px', 'right');
      // 받침대(돌 블록 탑)
      const tw = X0 - 6;
      const st = c.createLinearGradient(0, 0, tw, 0); st.addColorStop(0, '#6d6a66'); st.addColorStop(0.6, '#a8a49d'); st.addColorStop(1, '#7c7873');
      c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(6, top + 6, tw, GY - top);
      c.fillStyle = st; c.fillRect(0, top, X0, GY - top);
      c.strokeStyle = 'rgba(40,38,35,.45)'; c.lineWidth = 1.5;
      for (let r = 0, y = top; y < GY; r++, y += 30) { c.beginPath(); c.moveTo(0, y); c.lineTo(X0, y); c.stroke(); for (let x = (r % 2) * 40; x < X0; x += 80) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, Math.min(GY, y + 30)); c.stroke(); } }
      c.fillStyle = '#5b5752'; c.fillRect(0, top - 6, X0 + 4, 8);
      // 높이 표시
      c.strokeStyle = '#fbfcf9'; c.lineWidth = 2; c.beginPath(); c.moveTo(22, top + 4); c.lineTo(22, GY - 4); c.stroke();
      [top + 4, GY - 4].forEach((y) => { c.beginPath(); c.moveTo(16, y); c.lineTo(28, y); c.stroke(); });
      pill(c, 32, (top + GY) / 2 + 6, '높이 4.9 m', 'rgba(29,36,51,.85)', '#fff', '700 16px', 'left');
      // 새총 기둥
      const fx = X0 + 2, fy = top - 6;
      c.strokeStyle = '#6b4a2b'; c.lineWidth = 7; c.lineCap = 'round';
      c.beginPath(); c.moveTo(fx, fy); c.lineTo(fx, fy - 18); c.moveTo(fx, fy - 18); c.lineTo(fx - 6, fy - 36); c.moveTo(fx, fy - 18); c.lineTo(fx + 6, fy - 36); c.stroke(); c.lineCap = 'butt';
      // 발사 손잡이 홈
      const L = g.lev; c.fillStyle = '#2b2f36'; c.beginPath(); c.roundRect(L.x - 6, L.y0 - 4, 12, L.y1 - L.y0 + 8, 6); c.fill();
      c.fillStyle = '#3a3f47'; c.fillRect(L.x - 16, L.y1 + 6, 32, top - 6 - L.y1 - 6);
      pill(c, L.x + 16, (L.y0 + L.y1) / 2 + 4, '발사', 'rgba(29,36,51,.8)', '#fff', '700 15px', 'left');
      return cv;
    }

    function draw(c, W, H, dt) {
      if (!W) return;
      const g = geo(); clock += dt;
      const key = W + 'x' + H + ':' + pl; if (key !== bgKey) { bg = paintBg(g); bgKey = key; }
      c.clearRect(0, 0, W, H); c.drawImage(bg, 0, 0, W, H);
      const { X0, GY, R, top, X, Y, lev } = g, T = tLand(PL[pl].g);
      if (ph === 'fly') { t = Math.min(T, t + dt / SLOW); if (t >= T) land(); }
      if (ph === 'idle' && lever > 0 && !drag) lever = Math.max(0, lever - dt * 4);
      // 행성 표지판
      signs(g).forEach((s, i) => {
        const on = i === pl;
        c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.roundRect(s.x + 3, s.y + 4, s.w, s.h, 8); c.fill();
        const wd = c.createLinearGradient(0, s.y, 0, s.y + s.h); wd.addColorStop(0, on ? '#ffe27a' : '#d9b98a'); wd.addColorStop(1, on ? '#e8b923' : '#a9855a');
        c.fillStyle = wd; c.beginPath(); c.roundRect(s.x, s.y, s.w, s.h, 8); c.fill();
        c.strokeStyle = on ? '#1d2433' : 'rgba(60,40,20,.6)'; c.lineWidth = on ? 3 : 1.5; c.stroke();
        P.txt(c, PL[i].name, s.x + s.w / 2, s.y + 22, '#2a1d0e', '800 17px');
        P.txt(c, PL[i].sub, s.x + s.w / 2, s.y + 42, '#4a3720', '600 14px');
      });
      if (ph === 'idle' && thrown.size && !twice && thrown.has(0)) { const s = signs(g)[1]; c.save(); c.setLineDash([6, 5]); c.lineDashOffset = -clock * 16; c.strokeStyle = '#ffd84d'; c.lineWidth = 3; c.beginPath(); c.roundRect(s.x - 5, s.y - 5, s.w + 10, s.h + 10, 11); c.stroke(); c.restore(); }
      // 다른 행성에서 같은 속력으로 던진 착지점(흐리게)
      [0, 1, 2].forEach((p) => { if (p === pl) return; res.forEach((r, i) => { if (!r[p]) return; const x = X(r[p].d); c.save(); c.globalAlpha = 0.55; c.fillStyle = BALL[i].c[1]; c.beginPath(); c.moveTo(x, GY - 2); c.lineTo(x - 6, GY - 14); c.lineTo(x + 6, GY - 14); c.closePath(); c.fill(); P.txt(c, PL[p].name[0], x, GY - 18, '#fbfcf9', '700 12px'); c.restore(); }); });
      // 잔상과 같은 순간 수평 점선
      if (ph === 'fly' || ph === 'done') {
        for (let n = 1; n * DTG <= t + 1e-9; n++) {
          const tt = n * DTG, y = Y(0.5 * PL[pl].g * tt * tt), xs = [0, 1, 2].map((i) => X(v[i] * tt));
          c.save(); c.setLineDash([7, 6]); c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 2; c.beginPath(); c.moveTo(X0 + 2, y); c.lineTo(Math.max(...xs) + R + 10, y); c.stroke(); c.restore();
          [0, 1, 2].forEach((i) => ball(c, xs[i], y, R, i, 0.55 + 0.05 * Math.sin(clock * 2 + n)));
          pill(c, X0 - 6, y + 4, `${f1(tt)} s`, 'rgba(29,36,51,.85)', '#fff', '700 14px', 'right');
        }
        // 궤적 선
        [0, 1, 2].forEach((i) => { c.strokeStyle = BALL[i].c[1]; c.lineWidth = 2; c.globalAlpha = 0.7; c.beginPath(); for (let s = 0; s <= 40; s++) { const p = fly(g, i, t * s / 40); s ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y); } c.stroke(); c.globalAlpha = 1; });
      }
      // 새총 고무줄과 공
      const fx = X0 + 2, fy = top - 6 - 36;
      if (ph === 'idle') {
        [0, 1, 2].forEach((i) => { const b = rest(g, i); c.strokeStyle = BALL[i].c[2]; c.lineWidth = 2.5; c.beginPath(); c.moveTo(fx - 6, fy); c.lineTo(b.x, b.y); c.lineTo(fx + 6, fy); c.stroke(); });
        // 같은 속력이면 겹치니 이름표는 층을 나눠 단다
        [0, 1, 2].forEach((i) => { const b = rest(g, i); ball(c, b.x, b.y + (drag && drag.i === i ? 0 : Math.sin(clock * 3 + i) * 0.8), R, i); });
        [0, 1, 2].forEach((i) => { const b = rest(g, i); pill(c, b.x, b.y - R - 14 - i * 26, `${v[i]} m/s`, BALL[i].ink, '#fff', '700 15px'); });
        if (sel >= 0 && document.activeElement === S.cv) { const b = rest(g, sel); c.strokeStyle = '#ffd84d'; c.lineWidth = 3; c.beginPath(); c.arc(b.x, b.y, R + 5, 0, TAU); c.stroke(); }
      } else {
        [0, 1, 2].forEach((i) => { const p = ph === 'fly' ? fly(g, i, t) : fly(g, i, T); ball(c, p.x, ph === 'done' ? GY - R : p.y, R, i); });
        c.strokeStyle = '#3a2a1d'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(fx - 6, fy); c.lineTo(fx + 6, fy); c.stroke();
      }
      // 착지점과 시간
      if (ph === 'done') {
        const xs = [0, 1, 2].map((i) => X(v[i] * T)), order = [0, 1, 2].sort((a, b) => xs[a] - xs[b]);
        order.forEach((i, n) => { const x = xs[i]; c.fillStyle = BALL[i].c[1]; c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, GY + 2); c.lineTo(x - 8, GY + 16); c.lineTo(x + 8, GY + 16); c.closePath(); c.fill(); c.stroke();
          const near = n && xs[i] - xs[order[n - 1]] < 52; pill(c, x, GY - R * 2 - 12 - (near ? 26 * n : 0), `${f1(v[i] * T)} m`, BALL[i].ink, '#fff', '700 15px'); });
      }
      // 시계
      if (ph !== 'idle') { const tt = ph === 'done' ? T : t; pill(c, X0 + 20, 100, `t = ${f2(tt)} s` + (ph === 'done' ? ' · 셋 다 착지' : ''), ph === 'done' ? '#2f9e5b' : 'rgba(29,36,51,.88)', '#fff', '800 20px', 'left'); }
      // 발사 손잡이(손잡이 머리 = 빨간 구슬)
      const ly = lev.y0 + (lev.y1 - lev.y0) * lever;
      c.fillStyle = '#c9ced5'; c.fillRect(lev.x - 3, ly, 6, lev.y1 + 4 - ly);
      const kg = c.createRadialGradient(lev.x - 4, ly - 4, 2, lev.x, ly, 13); kg.addColorStop(0, '#ffb3a8'); kg.addColorStop(0.5, '#e0362a'); kg.addColorStop(1, '#7a120b');
      c.fillStyle = kg; c.beginPath(); c.arc(lev.x, ly, 13, 0, TAU); c.fill(); c.strokeStyle = '#3a0a06'; c.lineWidth = 1.5; c.stroke();
      if (ph === 'idle' && !drag) {
        const bob = Math.abs(Math.sin(clock * 2.4)) * 10;
        if (thrown.size === 0) hand(c, lev.x + 26, ly - 30 + bob);
        c.save(); c.setLineDash([6, 5]); c.lineDashOffset = -clock * 16; c.strokeStyle = '#ffd84d'; c.lineWidth = 2.5; c.beginPath(); c.arc(lev.x, ly, 19 + Math.sin(clock * 3) * 2, 0, TAU); c.stroke(); c.restore();
      }
    }
    // 안내 손가락 화살표(아래를 가리킴)
    function hand(c, x, y) {
      c.save(); c.translate(x, y); c.rotate(Math.PI); c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 5;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(14, 18); c.lineTo(5, 18); c.lineTo(5, 38); c.lineTo(-5, 38); c.lineTo(-5, 18); c.lineTo(-14, 18); c.closePath();
      c.fillStyle = '#ffd84d'; c.fill(); c.shadowBlur = 0; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.stroke(); c.restore();
    }

    // ── 던지기·기록 ──
    function fire() {
      if (ph !== 'idle') return;
      ph = 'fly'; t = 0; lever = 1;
      say(`<b>${PL[pl].name}</b>에서 세 공이 동시에 출발! 같은 순간의 잔상을 잇는 <b>흰 점선</b>을 보자. <small>(느린 화면 ×1/2)</small>`);
      try { if (navigator.vibrate) navigator.vibrate(15); } catch { /* 지원 안 함 */ }
    }
    function land() {
      const T = tLand(PL[pl].g); ph = 'done'; t = T; thrown.add(pl);
      v.forEach((s, i) => { res[i][pl] = { t: T, d: s * T }; });
      if (new Set(v).size === 3) distinct = true;
      if (pl === 1) twice = true;
      const e = thrown.has(0) && pl !== 0 ? ` 지구에서는 ${f2(tLand(9.8))} s였다 → ${pl === 1 ? '<b>더 빨리</b> 떨어져 <b>덜 멀리</b> 간다' : '<b>더 늦게</b> 떨어져 <b>더 멀리</b> 간다'}.` : '';
      say(`세 공 모두 <b>${f2(T)} s</b>에 동시에 닿았다. 거리는 ${v.map((s, i) => `${BALL[i].name} ${f1(s * T)} m`).join(' · ')}.${e}` + (pl === 0 && !compared ? '<br>오른쪽 <b>표</b>를 눌러 견주자.' : ''));
      table(); steps();
    }
    function again() { if (ph === 'done') { ph = 'idle'; t = 0; lever = 0; } }
    function setV(i, s) {
      s = Math.max(0, Math.min(VMAX, Math.round(s)));
      if (s === v[i]) return; again(); v[i] = s; res = [{}, {}, {}]; table();
    }
    function planet(i) {
      if (ph === 'fly') { say('공이 나는 중이다. 닿은 뒤에 바꾸자.'); return; }
      if (i === pl) return; pl = i; again();
      say(`<b>${PL[i].name}</b>(중력 가속도 ${PL[i].sub}). 속력은 그대로 두고 손잡이를 끌어 다시 던져 보자.` + (i === 1 ? ' 더 멀리 갈까, 덜 갈까?' : ''));
      steps();
    }
    function compare() {
      const r = res.every((x) => x[pl]);
      if (!r) { say('먼저 세 공을 던져 표를 채우자.'); return; }
      compared = true; tab.classList.add('cmp');
      const T = tLand(PL[pl].g);
      say(`착지 시간은 셋 다 <b>${f2(T)} s</b>로 같다 — 던진 속력과 상관없다. 수평 거리 = 속력 × ${f2(T)} s 이니 <b>빠를수록 멀리</b>, 속력이 2배면 거리도 2배.` + (twice ? '' : '<br>이번엔 위의 <b>중력 2배 행성</b> 표지판을 눌러 보자.'));
      steps();
    }
    function table() {
      tab.querySelectorAll('tbody tr').forEach((tr, i) => {
        tr.querySelector('.v').textContent = `${v[i]} m/s`;
        [0, 1, 2].forEach((p) => { const td = tr.querySelector(`[data-p="${p}"]`), r = res[i][p]; td.innerHTML = r ? `${f2(r.t)} s<br><b>${f1(r.d)} m</b>` : ''; });
      });
      if (!res.some((r) => r[pl])) tab.classList.remove('cmp');
    }
    function steps() {
      const ok = []; if (distinct) ok.push(1); if (compared) ok.push(2); if (twice) ok.push(3);
      const st = [1, 2, 3].find((n) => !ok.includes(n)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      chip.textContent = st === 1 ? '① 공을 당겨 두고 손잡이 끌어 내리기' : st === 2 ? '② 표를 눌러 시간·거리 견주기' : st === 3 ? '③ 중력 2배 행성에서 다시 던지기' : '✓ 시간은 같고, 빠를수록 멀리';
      chip.classList.toggle('done', st === 0);
      tab.classList.toggle('ready', st === 2);
    }

    // ── 손 조작 ──
    const S = P.make(stage, {
      draw,
      down(p) {
        const g = geo();
        const si = signs(g).findIndex((s) => p.x > s.x && p.x < s.x + s.w && p.y > s.y && p.y < s.y + s.h);
        if (si >= 0) { planet(si); return; }
        if (Math.hypot(p.x - g.lev.x, p.y - (g.lev.y0 + (g.lev.y1 - g.lev.y0) * lever)) < 30) {
          if (ph === 'done') again();
          if (ph === 'idle') { drag = { lev: true, dy: p.y - (g.lev.y0 + (g.lev.y1 - g.lev.y0) * lever) }; say('그대로 <b>아래로</b> 끝까지 끌어 내리자.'); }
          return;
        }
        if (ph === 'done' || ph === 'idle') {
          let best = -1, bd = g.R + 18;
          [0, 1, 2].forEach((i) => { const b = rest(g, i), d = Math.hypot(p.x - b.x, p.y - b.y); if (d <= bd) { bd = d; best = i; } });
          if (best >= 0) { again(); drag = { i: best }; sel = best; return; }
        }
        if (ph === 'fly') say('나는 중이다. 흰 점선에서 세 공의 높이가 어떤지 보자.');
      },
      move(p) {
        if (!drag) return;
        const g = geo();
        if (drag.lev) { lever = Math.max(0, Math.min(1, (p.y - drag.dy - g.lev.y0) / (g.lev.y1 - g.lev.y0))); if (lever >= 0.95) { drag = null; fire(); } return; }
        setV(drag.i, (g.X0 - 14 - p.x) / g.PK);
        say(`<b>${BALL[drag.i].name}</b> 공: 당긴 만큼 <b>${v[drag.i]} m/s</b>로 수평으로 나간다.`);
      },
      up() { if (drag && drag.lev && ph === 'idle') say('손잡이를 <b>끝까지</b> 끌어 내려야 걸쇠가 풀린다.'); drag = null; },
      key(e) {
        if (/^[1-3]$/.test(e.key)) { sel = +e.key - 1; again(); say(`<b>${BALL[sel].name}</b> 공을 골랐다. 왼쪽·오른쪽 화살표로 당기는 길이(속력)를 바꾼다.`); return true; }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { setV(sel, v[sel] + (e.key === 'ArrowLeft' ? 1 : -1)); say(`<b>${BALL[sel].name}</b> 공: <b>${v[sel]} m/s</b>`); return true; }
        if (e.key === 'Enter' || e.key === ' ') { again(); fire(); return true; }
        if (e.key === 'p' || e.key === 'P') { planet((pl + 1) % 3); return true; }
        if (e.key === 'c' || e.key === 'C') { compare(); return true; }
        if (e.key === '0') { reset(); return true; }
        return false;
      },
    });

    tab.addEventListener('click', () => { compare(); S.kick(); });
    tab.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); tab.click(); } });
    root.querySelector('.tw-reset').addEventListener('click', () => { reset(); S.kick(); });

    reset();
    root._tw = {
      set: (a) => { a.forEach((s, i) => setV(i, s)); S.redraw(); return root._tw.state(); },
      fire: () => { again(); fire(); return root._tw.state(); },
      land: () => { if (ph === 'fly') land(); S.redraw(); return root._tw.state(); },
      planet: (i) => { planet(i); S.redraw(); return root._tw.state(); },
      cmp: () => { compare(); return root._tw.state(); },
      state: () => ({ ph, pl, v: [...v], t: +t.toFixed(3), lever: +lever.toFixed(2), done: root.classList.contains('u-done'), ok: [distinct, compared, twice], cells: [...tab.querySelectorAll('tbody tr')].map((tr) => tr.textContent.trim()), out: out.textContent }),
      geo: () => { const g = geo(); return { W: g.W, H: g.H, k: g.k, lev: g.lev, balls: [0, 1, 2].map((i) => rest(g, i)), signs: signs(g), X0: g.X0, PK: g.PK }; },
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Throw = { mount };
})();
