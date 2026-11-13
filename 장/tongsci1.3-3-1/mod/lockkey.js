/* 3-3 2차시 체험 «효소와 기질 맞추기»(교과서 146쪽 그림 Ⅲ-32 효소의 작용 + 참고서 효소의 작용 ❶❷❸·기질특이성·효소의 변성·A~D 고르기).
   작업대: 왼쪽 기질 받침(과산화 수소·녹말·단백질·에탄올·지방), 가운데 효소 셋(카탈레이스·아밀레이스·단백질 분해 효소, 오목한 자리 모양이 서로 다름),
   오른쪽 가열기(불꽃)·강한 산 병·A~D 그림 문제.
   기질을 끌어 효소 자리에 대면 모양이 맞을 때만 붙어 효소·기질 복합체 → 생성물로 쪼개져 떨어지고 효소는 그대로 남는다(일한 횟수 +1).
   안 맞으면 튕겨 나오며 까닭. 효소를 끌어 불꽃·강한 산에 대면 입체 구조가 흐트러져(변성) 어떤 기질도 붙지 않는다.
   ① 기질을 알맞은 효소에 붙인다 ② 같은 효소가 여러 번 일하는 것을 본다(재사용) ③ 효소를 가열해 본다(변성).
   LockKey.mount(root) → { fit, setActive } · 시험용: root._lk.put(기질, 효소번호) · heat(효소번호, 'heat'|'acid') · quiz(글자) · state() · geo() */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const lerp = (a, b, k) => a + (b - a) * k, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (k) => 1 - (1 - k) * (1 - k);
  const jo = (w, a, b) => { const c = w.charCodeAt(w.length - 1) - 0xac00; return w + (c >= 0 && c % 28 ? a : b); }; // 받침 따라 을/를·이/가
  // 효소: 자리 모양(tri 뾰족 · box 네모 · cup 둥근)
  const ENZ = [
    { k: 'cat', name: '카탈레이스', site: 'tri', sub: 'h2o2', col: '#4fae6e', dk: '#1d6b3a', lt: '#c9efd4', prod: '물 + 산소' },
    { k: 'amy', name: '아밀레이스', site: 'box', sub: 'starch', col: '#4b8fd1', dk: '#1d4f86', lt: '#cfe3f7', prod: '엿당' },
    { k: 'pro', name: '단백질 분해 효소', site: 'cup', sub: 'prot', col: '#a36cc9', dk: '#5b2d80', lt: '#ead8f6', prod: '아미노산' },
  ];
  // 기질: 아래쪽 돌기(key)가 자리 모양과 맞아야 한다
  const SUB = {
    h2o2: { name: '과산화 수소', key: 'tri', col: '#f7e7a6', ed: '#b08a12' },
    starch: { name: '녹말', key: 'box', col: '#f6dcc0', ed: '#a8682a' },
    prot: { name: '단백질', key: 'cup', col: '#f8d3dc', ed: '#b04a63' },
    eth: { name: '에탄올', key: 'zig', col: '#dfe9ee', ed: '#4f6b7a' },
    fat: { name: '지방', key: 'wide', col: '#fbefc8', ed: '#a78a2c' },
  };
  const SUBS = ['h2o2', 'starch', 'prot', 'eth', 'fat'];
  const AA = ['#e4574a', '#f2a53a', '#4cae5b', '#3c8fd6', '#9a62c9', '#e05fa1'];
  const QZ = [
    { q: '반응물(기질)은 어느 것? 그림에서 눌러 보자', a: ['A'] },
    { q: '효소는 어느 것?', a: ['B'] },
    { q: '생성물을 모두 눌러 보자', a: ['C', 'D'] },
    { q: '반응이 끝나도 양이 줄지 않는 것은?', a: ['B'] },
  ];
  const ROLE = { A: '반응물', B: '효소', C: '생성물', D: '생성물' };

  function mount(root) {
    const stage = root.querySelector('.lk-stage'), chip = root.querySelector('.lk-now'), out = root.querySelector('.lk-out');
    const tab = root.querySelector('.lk-tab tbody'), qBox = root.querySelector('.lk-quiz');
    const P = window.Play;
    let enz, flying, prods, bubbles, drag, clock, msg, qi, qGot, qBad, anyMatch, reuseDone, denDone, sel, lastBounce;

    function reset() {
      enz = ENZ.map((e) => ({ ...e, n: 0, busy: null, den: null, sq: 0, shake: 0, off: { x: 0, y: 0 }, back: 0 }));
      flying = []; prods = []; bubbles = []; drag = null; clock = 0; qi = 0; qGot = new Set(); qBad = 0;
      anyMatch = false; reuseDone = false; denDone = false; sel = 0; lastBounce = '';
      say('왼쪽 받침의 <b>기질</b>을 끌어 효소 위의 <b>오목한 자리</b>에 대 보자. 모양이 맞아야 붙는다.');
      table(); quiz(); steps();
    }
    const say = (t) => { if (t !== msg) { msg = t; out.innerHTML = t; } };

    // ── 자리 잡기 ──
    function geo() {
      const W = S.W, H = S.H, top = 64;
      const sh = { x: 12, w: 176, y: top, h: H - top - 12 }, sl = (sh.h - 34) / 5;
      const slots = SUBS.map((k, i) => ({ k, x: sh.x + sh.w / 2, y: sh.y + 34 + sl * i + sl * 0.5 - 8 }));
      const rx = W - 268, R = Math.round(clamp(H * 0.105, 60, 82));
      const cx0 = sh.x + sh.w + 20, cx1 = rx - 18, span = cx1 - cx0;
      const ey = Math.round(H * 0.4) + 6;
      const homes = ENZ.map((_, i) => ({ x: cx0 + span * (i + 0.5) / 3, y: ey }));
      const tray = { x0: cx0, x1: cx1, y0: Math.round(H * 0.68), y1: H - 12 };
      const fire = { x: rx + 128, y: top + 150 }, acid = { x: rx + 128, y: top + 300 };
      const qz = { x0: rx, x1: W - 12, y0: acid.y + 92, y1: H - 12 };
      return { W, H, top, sh, sl, slots, R, homes, tray, fire, acid, qz, rx, cx0, cx1 };
    }
    const epos = (e, i, g) => ({ x: g.homes[i].x + e.off.x, y: g.homes[i].y + e.off.y });
    const sitePt = (e, i, g) => { const p = epos(e, i, g); return { x: p.x, y: p.y - g.R * TOPK + 2 }; };

    // ── 그림 도구 ──
    function keyPath(c, kind, x, y, w, d, dir) { // 효소 위쪽의 오목한 자리(왼쪽 → 오른쪽으로 파 내려간다)
      const s = dir;
      if (kind === 'tri') { c.lineTo(x - w / 2, y); c.lineTo(x, y + d * s); c.lineTo(x + w / 2, y); }
      else if (kind === 'box') { c.lineTo(x - w / 2, y); c.lineTo(x - w / 2, y + d * s); c.lineTo(x + w / 2, y + d * s); c.lineTo(x + w / 2, y); }
      else if (kind === 'cup') { c.lineTo(x - w / 2, y); c.arc(x, y, w / 2, Math.PI, 0, true); }
    }
    const SW = 50, SD = 26; // 자리 너비·깊이
    const TOPK = 0.92 * (1 + 0.05 * Math.sin(-1.5 * Math.PI + 1.3) + 0.035 * Math.sin(-2.5 * Math.PI + 0.4)); // 윤곽 맨 위 높이(반지름 배)
    function enzymeShape(c, x, y, R, e, t) {
      // 단백질 덩어리 윤곽(살짝 울퉁불퉁) + 위쪽 가운데 오목한 자리
      const den = e.den ? clamp(e.den.t / 1.2, 0, 1) : 0, wob = Math.sin(t * 2 + x) * 0.015;
      const k66 = R / 66, sw = SW * k66, sd = SD * k66, pts = 54, open = Math.asin(Math.min(0.9, (sw / 2 + 6 * k66) / R));
      const r = (a) => R * (1 + 0.05 * Math.sin(3 * a + 1.3) + 0.035 * Math.sin(5 * a + 0.4) + wob + den * (0.09 * Math.sin(7 * a + 2) + 0.06 * Math.sin(11 * a)));
      c.beginPath();
      const a0 = -Math.PI / 2 + open, a1 = -Math.PI / 2 - open + TAU;
      for (let i = 0; i <= pts; i++) { const a = lerp(a0, a1, i / pts); c.lineTo(x + Math.cos(a) * r(a) * 1.12, y + Math.sin(a) * r(a) * 0.92); }
      const yt = y - R * TOPK + 2;
      if (den < 0.5) { c.lineTo(x - sw / 2 - 4 * k66, yt); keyPath(c, e.site, x, yt, sw * (1 - e.sq * 0.12), sd * (1 - e.sq * 0.15), 1); c.lineTo(x + sw / 2 + 4 * k66, yt); }
      else { const k = (den - 0.5) * 2; c.lineTo(x - sw / 2, yt + 6 * k); c.quadraticCurveTo(x - 8 * k66, yt - 14 * k, x + 4 * k66, yt + 10 * k); c.quadraticCurveTo(x + 14 * k66, yt + 18 * k, x + sw / 2, yt - 4 * k); }
      c.closePath();
    }
    function drawEnzyme(c, e, x, y, R, t) {
      const den = e.den ? clamp(e.den.t / 1.2, 0, 1) : 0;
      const col = den ? mix(e.col, '#9a8f84', den) : e.col, dk = den ? mix(e.dk, '#5d544b', den) : e.dk, lt = den ? mix(e.lt, '#e6e0d8', den) : e.lt;
      c.save(); c.shadowColor = 'rgba(29,36,51,.28)'; c.shadowBlur = 14; c.shadowOffsetY = 7;
      enzymeShape(c, x, y, R, e, t);
      const g = c.createRadialGradient(x - R * 0.35, y - R * 0.3, 4, x, y, R * 1.25); g.addColorStop(0, lt); g.addColorStop(0.55, col); g.addColorStop(1, dk);
      c.fillStyle = g; c.fill(); c.restore();
      c.save(); enzymeShape(c, x, y, R, e, t); c.clip();
      // 접힌 사슬 결(나선·주름) — 변성되면 흐트러진다
      c.lineCap = 'round';
      for (let j = 0; j < 5; j++) {
        c.strokeStyle = j % 2 ? 'rgba(255,255,255,.28)' : 'rgba(0,0,0,.13)'; c.lineWidth = 7 - j * 0.6; c.beginPath();
        for (let i = 0; i <= 28; i++) {
          const u = i / 28, xx = x - R * 1.1 + u * R * 2.2;
          const yy = y - R * 0.45 + j * R * 0.27 + Math.sin(u * 9 + j * 1.7 + (den ? t * 3 : 0)) * (6 + den * 16) + den * Math.sin(u * 23 + j) * 8;
          c.lineTo(xx, yy);
        }
        c.stroke();
      }
      c.restore();
      enzymeShape(c, x, y, R, e, t); c.strokeStyle = dk; c.lineWidth = 2.6; c.stroke();
      if (den >= 1) { P.txt(c, '변성', x + R * 0.55, y + R * 0.15, '#fff', '800 16px'); }
    }
    function mix(a, b, k) { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; }
    function atom(c, x, y, r, col) { const g = c.createRadialGradient(x - r * 0.35, y - r * 0.35, 1, x, y, r); g.addColorStop(0, '#fff'); g.addColorStop(0.4, col); g.addColorStop(1, shade(col)); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 1; c.stroke(); }
    const shade = (h) => { const n = parseInt(h.slice(1), 16); return `rgb(${(n >> 16) * 0.55 | 0},${((n >> 8) & 255) * 0.55 | 0},${(n & 255) * 0.55 | 0})`; };
    const bond = (c, x1, y1, x2, y2) => { c.strokeStyle = '#6b7280'; c.lineWidth = 3; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); };
    function hexa(c, x, y, r, col = '#f2c14e') {
      c.save(); const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r * 1.1); g.addColorStop(0, '#fff6d8'); g.addColorStop(1, col);
      c.fillStyle = g; c.strokeStyle = '#8a5a00'; c.lineWidth = 1.6; c.beginPath(); for (let i = 0; i < 6; i++) c.lineTo(x + Math.cos(i * TAU / 6 + Math.PI / 6) * r, y + Math.sin(i * TAU / 6 + Math.PI / 6) * r); c.closePath(); c.fill(); c.stroke(); c.restore();
    }
    function bead(c, x, y, r, col) { const g = c.createRadialGradient(x - r * 0.35, y - r * 0.35, 1, x, y, r); g.addColorStop(0, '#fff'); g.addColorStop(0.35, col); g.addColorStop(1, shade(col)); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1; c.stroke(); }
    // 기질 판: 위는 둥근 판, 아래 가운데에 돌기(key). (x, y) = 돌기 바로 위 가운데
    function drawSub(c, k, x, y, a = 1, sc = 1) {
      const s = SUB[k], w = 104 * sc, h = 50 * sc;
      c.save(); c.globalAlpha = a;
      c.beginPath(); c.moveTo(x + SW / 2 * sc, y); c.lineTo(x + w / 2 - 12, y); c.quadraticCurveTo(x + w / 2, y, x + w / 2, y - 12); c.lineTo(x + w / 2, y - h + 14); c.quadraticCurveTo(x + w / 2, y - h, x + w / 2 - 14, y - h); c.lineTo(x - w / 2 + 14, y - h); c.quadraticCurveTo(x - w / 2, y - h, x - w / 2, y - h + 14); c.lineTo(x - w / 2, y - 12); c.quadraticCurveTo(x - w / 2, y, x - w / 2 + 12, y);
      c.lineTo(x - (s.key === 'wide' ? SW * 0.75 : SW / 2) * sc, y);
      // 돌기: 왼쪽에서 오른쪽으로
      const kw = (SW - 8) * sc, kd = (SD - 4) * sc;
      if (s.key === 'tri') { c.lineTo(x - kw / 2, y); c.lineTo(x, y + kd); c.lineTo(x + kw / 2, y); }
      else if (s.key === 'box') { c.lineTo(x - kw / 2, y); c.lineTo(x - kw / 2, y + kd); c.lineTo(x + kw / 2, y + kd); c.lineTo(x + kw / 2, y); }
      else if (s.key === 'cup') { c.lineTo(x - kw / 2, y); c.arc(x, y, kw / 2, Math.PI, 0, true); }
      else if (s.key === 'zig') { const q = kw / 4; c.lineTo(x - kw / 2, y); c.lineTo(x - q, y + kd); c.lineTo(x, y + 2); c.lineTo(x + q, y + kd); c.lineTo(x + kw / 2, y); }
      else if (s.key === 'wide') { const ww = kw * 1.55; c.lineTo(x - ww / 2, y); c.lineTo(x - ww / 2 + 6, y + kd * 0.55); c.lineTo(x + ww / 2 - 6, y + kd * 0.55); c.lineTo(x + ww / 2, y); }
      c.closePath();
      const g = c.createLinearGradient(0, y - h, 0, y + kd); g.addColorStop(0, '#fff'); g.addColorStop(1, s.col);
      c.fillStyle = g; c.fill(); c.strokeStyle = s.ed; c.lineWidth = 2; c.stroke();
      // 분자 모형
      const my = y - h * 0.52;
      if (k === 'h2o2') { bond(c, x - 30 * sc, my + 8 * sc, x - 10 * sc, my); bond(c, x - 10 * sc, my, x + 10 * sc, my); bond(c, x + 10 * sc, my, x + 30 * sc, my - 8 * sc); atom(c, x - 10 * sc, my, 10 * sc, '#e2453a'); atom(c, x + 10 * sc, my, 10 * sc, '#e2453a'); atom(c, x - 30 * sc, my + 8 * sc, 6.5 * sc, '#f4f6f8'); atom(c, x + 30 * sc, my - 8 * sc, 6.5 * sc, '#f4f6f8'); }
      else if (k === 'starch') { for (let i = 0; i < 4; i++) hexa(c, x - 33 * sc + i * 22 * sc, my + (i % 2 ? -3 : 3) * sc, 10 * sc); }
      else if (k === 'prot') { for (let i = 0; i < 6; i++) bead(c, x - 38 * sc + i * 15.2 * sc, my + Math.sin(i * 1.4) * 5 * sc, 8 * sc, AA[i]); }
      else if (k === 'eth') { bond(c, x - 26 * sc, my, x + 22 * sc, my); atom(c, x - 26 * sc, my, 10 * sc, '#3a3f47'); atom(c, x - 2 * sc, my, 10 * sc, '#3a3f47'); atom(c, x + 20 * sc, my, 9 * sc, '#e2453a'); atom(c, x + 33 * sc, my - 7 * sc, 5.5 * sc, '#f4f6f8'); [[-36, -9], [-34, 9], [-4, -13], [-4, 13]].forEach(([a, b]) => atom(c, x + a * sc, my + b * sc, 5 * sc, '#f4f6f8')); }
      else if (k === 'fat') { c.strokeStyle = '#8a6d1d'; c.lineWidth = 2.4 * sc; c.fillStyle = '#e8c76a'; c.beginPath(); c.roundRect(x - 44 * sc, my - 15 * sc, 12 * sc, 30 * sc, 4); c.fill(); c.stroke(); for (let j = 0; j < 3; j++) { c.beginPath(); for (let i = 0; i <= 8; i++) c.lineTo(x - 30 * sc + i * 9 * sc, my - 10 * sc + j * 10 * sc + (i % 2 ? -3 : 3) * sc); c.stroke(); } }
      c.restore();
    }
    function water(c, x, y, k = 1) { atom(c, x - 8 * k, y + 6 * k, 5 * k, '#f4f6f8'); atom(c, x + 8 * k, y + 6 * k, 5 * k, '#f4f6f8'); atom(c, x, y, 8.5 * k, '#e2453a'); }
    function o2(c, x, y, k = 1) { atom(c, x - 6.5 * k, y, 7.5 * k, '#e2453a'); atom(c, x + 6.5 * k, y, 7.5 * k, '#e2453a'); }
    function drawProd(c, p, x, y) {
      if (p.k === 'h2o') water(c, x, y);
      else if (p.k === 'malt') { hexa(c, x - 10, y, 10); hexa(c, x + 10, y, 10); }
      else if (p.k === 'aa') { bead(c, x - 7, y, 8, p.c); bead(c, x + 7, y + 2, 8, p.c2); }
    }
    function flame(c, x, y, s, t) {
      const fl = (k) => Math.sin(t * 13 + k) * 0.06 + Math.sin(t * 7.3 + k * 2) * 0.05;
      [[1, '#ff7a1a'], [0.72, '#ffc23a'], [0.42, '#fff3b0']].forEach(([k, c1], i) => {
        const hh = 46 * s * k * (1 + fl(i)), ww = 18 * s * k * (1 + fl(i + 3) * 0.5) + 5;
        const g = c.createLinearGradient(0, y - hh, 0, y); g.addColorStop(0, 'rgba(255,200,80,0)'); g.addColorStop(0.35, c1); g.addColorStop(1, c1);
        c.fillStyle = g; c.beginPath(); c.moveTo(x, y - hh); c.bezierCurveTo(x + ww * 0.7, y - hh * 0.55, x + ww, y - hh * 0.1, x, y); c.bezierCurveTo(x - ww, y - hh * 0.1, x - ww * 0.7, y - hh * 0.55, x, y - hh); c.fill();
      });
      c.fillStyle = 'rgba(70,140,255,.75)'; c.beginPath(); c.ellipse(x, y - 3, 8 + s * 2, 5, 0, 0, TAU); c.fill();
    }
    function burner(c, x, y, t, hot) {
      // 받침 + 몸통 + 불꽃
      c.fillStyle = '#4a4f59'; c.beginPath(); c.ellipse(x, y + 66, 40, 10, 0, 0, TAU); c.fill();
      const g = c.createLinearGradient(x - 12, 0, x + 12, 0); g.addColorStop(0, '#6d737e'); g.addColorStop(0.5, '#c9ced6'); g.addColorStop(1, '#5a606b');
      c.fillStyle = g; c.fillRect(x - 10, y + 12, 20, 54); c.strokeStyle = '#2b2f36'; c.lineWidth = 1.5; c.strokeRect(x - 10, y + 12, 20, 54);
      c.fillStyle = '#2b2f36'; c.fillRect(x - 13, y + 8, 26, 6);
      if (hot) P.glow(c, x, y - 20, 80, 'rgba(255,140,40,.35)');
      flame(c, x, y + 8, hot ? 1.5 : 1.1, t);
      P.txt(c, '가열기(고온)', x, y + 96, '#7a2e10', '800 17px');
    }
    function bottle(c, x, y, t, hot) {
      if (hot) P.glow(c, x, y, 70, 'rgba(255,230,80,.35)');
      const g = c.createLinearGradient(x - 30, 0, x + 30, 0); g.addColorStop(0, 'rgba(200,220,235,.9)'); g.addColorStop(0.45, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(160,185,205,.9)');
      c.fillStyle = g; c.strokeStyle = '#3b4a57'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 10, y - 46); c.lineTo(x - 10, y - 30); c.quadraticCurveTo(x - 32, y - 22, x - 32, y); c.lineTo(x - 32, y + 34); c.quadraticCurveTo(x - 32, y + 42, x - 24, y + 42); c.lineTo(x + 24, y + 42); c.quadraticCurveTo(x + 32, y + 42, x + 32, y + 34); c.lineTo(x + 32, y); c.quadraticCurveTo(x + 32, y - 22, x + 10, y - 30); c.lineTo(x + 10, y - 46); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = 'rgba(240,215,90,.55)'; c.beginPath(); c.roundRect(x - 30, y + 2 + Math.sin(t * 2) * 1.5, 60, 38, 6); c.fill();
      c.fillStyle = '#3b4a57'; c.fillRect(x - 12, y - 54, 24, 10);
      c.fillStyle = '#fff'; c.strokeStyle = '#3b4a57'; c.lineWidth = 1.2; c.beginPath(); c.roundRect(x - 26, y - 14, 52, 22, 4); c.fill(); c.stroke();
      P.txt(c, '산', x, y + 3, '#b2362b', '800 15px');
      P.txt(c, '강한 산', x, y + 66, '#5a4a10', '800 17px');
    }

    // ── 반응 ──
    function tryBind(k, i, from) {
      const e = enz[i], s = SUB[k], g = geo();
      if (e.busy) { bounce(k, from, i, `<b>${e.name}</b>는 아직 앞의 기질을 처리하는 중이다. 잠깐 기다렸다 다시 대 보자.`); return; }
      if (e.den) {
        bounce(k, from, i, `<b>변성된 ${e.name}</b> — ${e.den.how === 'heat' ? '열' : '강한 산'} 때문에 입체 구조가 흐트러져 오목한 자리가 사라졌다. ${k === e.sub ? '원래 맞던 ' : ''}<b>${s.name}</b>도 붙지 못한다 → 기능을 잃었다. 삶은 감자즙을 넣으면 거품이 나지 않는 까닭이다.`);
        denDone = 'tried'; steps(); return;
      }
      if (k !== e.sub) {
        const why = k === 'eth' ? ' 에탄올을 분해하는 효소는 따로 있다(간의 알코올 분해 효소).' : k === 'fat' ? ' 지방은 <b>지방 분해 효소</b>라는 다른 효소가 맡는다.' : '';
        bounce(k, from, i, `튕겨 나왔다! <b>${e.name}</b>는 ${jo(s.name, '과', '와')} 결합하지 못한다 — 자리 모양이 <b>${SUB[e.sub].name}</b>에만 맞는다(<b>기질특이성</b>).${why}`);
        return;
      }
      const sp = sitePt(e, i, g);
      e.busy = { k, t: 0, x0: from.x, y0: from.y, sx: sp.x, sy: sp.y };
      say(`딱 맞게 붙었다 — <b>효소·기질 복합체</b>. 이 상태에서 반응의 <b>활성화에너지</b>가 낮아져 ${jo(s.name, '이', '가')} 빠르게 분해된다…`);
    }
    function bounce(k, from, i, t) {
      const g = geo(), e = enz[i], sp = sitePt(e, i, g);
      flying.push({ k, x: sp.x, y: sp.y - 30, vx: (from.x < sp.x ? -1 : 1) * 260 - (Math.random() - 0.5) * 80, vy: -320, t: 0 });
      e.shake = 0.5; lastBounce = k + '>' + e.k;
      say(t);
    }
    function finish(i) {
      const e = enz[i], g = geo(), sp = sitePt(e, i, g);
      e.busy = null; e.n += 1; e.sq = 0;
      const add = (k, extra) => { const n = prods.filter((q) => q.i === i).length; prods.push({ i, k, x: sp.x + (Math.random() - 0.5) * 20, y: sp.y, n, t: 0, ...extra }); };
      if (e.k === 'cat') { add('h2o'); add('h2o'); for (let j = 0; j < 3; j++) bubbles.push({ x: sp.x + (j - 1) * 14, y: sp.y - 10, r: 13 + j * 2, ph: Math.random() * 6, vy: 60 + j * 14 }); }
      else if (e.k === 'amy') { add('malt'); add('malt'); }
      else { add('aa', { c: AA[0], c2: AA[1] }); add('aa', { c: AA[2], c2: AA[3] }); add('aa', { c: AA[4], c2: AA[5] }); }
      // 쌓인 생성물이 많으면 오래된 것부터 치운다
      const mine = prods.filter((q) => q.i === i); if (mine.length > 9) { const drop = mine.slice(0, mine.length - 9); prods = prods.filter((q) => !drop.includes(q)); prods.filter((q) => q.i === i).forEach((q, j) => { q.n = j; }); }
      anyMatch = true;
      if (e.n >= 3) reuseDone = true;
      const rx = { cat: '과산화 수소 → <b>물 + 산소</b>(거품)', amy: '녹말 → <b>엿당</b>', pro: '단백질 → 작은 조각(<b>아미노산</b>)' }[e.k];
      say(e.n >= 3
        ? `${e.name}가 벌써 <b>${e.n}번</b> 일했다. 반응 뒤에도 구조와 성질이 그대로라 새 기질과 다시 결합한다 — <b>재사용</b>. 그래서 효소는 적은 양으로도 많은 반응을 돕는다.${denDone ? '' : ' 이제 효소를 끌어 <b>가열기</b>에 대 보자.'}`
        : `${rx}. 생성물과 떨어진 <b>${e.name}</b>는 반응 전 모양 그대로다(일한 횟수 ${e.n}). 같은 기질을 하나 더 대 보자.`);
      table(); steps();
    }
    function denature(i, how) {
      const e = enz[i]; if (e.den) { say(`${e.name}는 이미 변성되었다. 한 번 흐트러진 구조는 식혀도 돌아오지 않는다.`); return; }
      if (e.busy) { e.busy = null; }
      e.den = { how, t: 0 };
      say(`${how === 'heat' ? '높은 열' : '강한 산'}에 닿자 <b>${e.name}</b>의 주성분인 <b>단백질</b>의 입체 구조가 흐트러진다 — <b>변성</b>. 이제 ${jo(SUB[e.sub].name, '을', '를')} 다시 대 보자.`);
      denDone = denDone || 'den'; table(); steps();
    }

    // ── 그림 문제(A~D) ──
    function qzLayout(g) {
      const q = g.qz, w = q.x1 - q.x0, h = q.y1 - q.y0, s = Math.min(1, w / 256, h / 230);
      const cx = q.x0 + w / 2;
      return { s, A: { x: q.x0 + 50 * s, y: q.y0 + 100 * s }, E1: { x: cx + 54 * s, y: q.y0 + 104 * s }, B: { x: q.x0 + 64 * s, y: q.y0 + 204 * s }, C: { x: q.x0 + w - 100 * s, y: q.y0 + 200 * s }, D: { x: q.x0 + w - 34 * s, y: q.y0 + 200 * s } };
    }
    function drawQuiz(c, g, t) {
      const q = g.qz, L = qzLayout(g), s = L.s;
      c.fillStyle = '#fffdf6'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.roundRect(q.x0, q.y0, q.x1 - q.x0, q.y1 - q.y0, 12); c.fill(); c.stroke();
      P.txt(c, '그림 문제 · 효소의 작용', q.x0 + 12, q.y0 + 24, '#1d2433', '800 16px', 'left');
      const e0 = { ...ENZ[0], den: null, sq: 0.6 }, e1 = { ...ENZ[0], den: null, sq: 0 };
      // 1줄: A → (B+A 복합체)
      drawSub(c, 'h2o2', L.A.x, L.A.y + 10 * s, 1, 0.42 * s);
      arrow(c, L.A.x + 34 * s, L.A.y, L.E1.x - 46 * s, L.A.y);
      drawEnzyme(c, e0, L.E1.x, L.E1.y + 12 * s, 30 * s, t * 0.4);
      drawSub(c, 'h2o2', L.E1.x, L.E1.y + 12 * s - 30 * s * TOPK + 1, 1, 0.42 * s);
      // 2줄: → B + C + D
      arrow(c, L.E1.x - 34 * s, L.E1.y + 40 * s, L.B.x + 36 * s, L.B.y - 28 * s);
      drawEnzyme(c, e1, L.B.x, L.B.y + 6 * s, 30 * s, t * 0.4);
      P.txt(c, '+', (L.B.x + L.C.x) / 2 + 6 * s, L.C.y + 6, '#1d2433', '800 22px');
      water(c, L.C.x - 12 * s, L.C.y, 0.9 * s); water(c, L.C.x + 12 * s, L.C.y + 4 * s, 0.9 * s);
      P.txt(c, '+', (L.C.x + L.D.x) / 2 + 2 * s, L.C.y + 6, '#1d2433', '800 22px');
      c.strokeStyle = 'rgba(80,140,200,.7)'; c.lineWidth = 1.5; c.beginPath(); c.arc(L.D.x, L.D.y, 17 * s, 0, TAU); c.stroke(); o2(c, L.D.x, L.D.y, 0.85 * s);
      // 글자 단추(누르는 곳)
      const pos = drawQuizPos(g);
      Object.entries(pos).forEach(([k, [x, y]]) => {
        const got = qGot.has(k) || qi >= QZ.length, pulse = qi < QZ.length ? 1 + Math.sin(t * 4) * 0.06 : 1;
        c.fillStyle = got ? '#d7f0df' : '#fff3b0'; c.strokeStyle = got ? '#2f9e5b' : '#1d2433'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 14 * pulse, 0, TAU); c.fill(); c.stroke();
        P.txt(c, k, x, y + 6, '#1d2433', '800 17px');
      });
      return pos;
    }
    function arrow(c, x1, y1, x2, y2) {
      c.strokeStyle = '#5b6474'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke();
      const a = Math.atan2(y2 - y1, x2 - x1);
      c.fillStyle = '#5b6474'; c.beginPath(); c.moveTo(x2, y2); c.lineTo(x2 - Math.cos(a) * 10 - Math.sin(a) * 5, y2 - Math.sin(a) * 10 + Math.cos(a) * 5); c.lineTo(x2 - Math.cos(a) * 10 + Math.sin(a) * 5, y2 - Math.sin(a) * 10 - Math.cos(a) * 5); c.closePath(); c.fill();
    }
    function answer(L) {
      if (qi >= QZ.length) return;
      const Q = QZ[qi];
      if (Q.a.includes(L)) {
        qGot.add(L);
        if (Q.a.every((x) => qGot.has(x))) { qi++; qGot = new Set(); if (qi === QZ.length) say('그림 문제 끝! A 반응물(기질) · B 효소 · C·D 생성물. 반응이 진행되면 A는 줄고 C·D는 늘지만 <b>B(효소)의 양은 그대로</b>다.'); else say(`맞다 — <b>${L}</b>는 ${ROLE[L]}${qi === 3 ? '. 다음 물음' : ''}.`); }
        else say(`<b>${L}</b> 맞다. 생성물이 하나 더 있다.`);
      } else { qBad++; say(`<b>${L}</b>는 ${ROLE[L]}이다. 다시 골라 보자 — 효소는 반응 앞뒤에 모두 그려져 있다.`); }
      quiz();
    }
    function quiz() {
      const done = qi >= QZ.length, lab = (k) => (qi > (k === 'A' ? 0 : k === 'B' ? 1 : 2) || (qi === 2 && qGot.has(k)) || done ? ROLE[k] : '?');
      qBox.innerHTML = `<b class="lk-qh">그림 문제</b> <span class="lk-qq">${done ? '✓ 다 맞혔다' : (qi + 1) + '/4 ' + QZ[qi].q}</span><div class="lk-qa">${['A', 'B', 'C', 'D'].map((k) => `<span class="${lab(k) === '?' ? '' : 'ok'}">${k} <b>${lab(k)}</b></span>`).join('')}</div>`;
      qBox.classList.toggle('done', done);
    }

    function table() {
      tab.innerHTML = enz.map((e) => {
        const seen = e.n > 0;
        return `<tr class="${seen ? 'ok' : ''}${e.den ? ' den' : ''}"><td>${e.name}</td><td>${seen ? SUB[e.sub].name : ''}</td><td>${seen ? e.prod : ''}</td><td>${e.den ? '변성' : e.n ? e.n + '번' : ''}</td></tr>`;
      }).join('');
    }
    function steps() {
      const ok = [];
      if (anyMatch) ok.push(1);
      if (reuseDone) ok.push(2);
      if (denDone === 'tried') ok.push(3);
      const n = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, n, ok); window.L1.done(root, n === 0);
      chip.textContent = n === 1 ? '① 기질을 끌어 맞는 효소 자리에 대기' : n === 2 ? '② 같은 효소에 기질을 여러 번 대기' : n === 3 ? (denDone ? '③ 변성된 효소에 기질을 다시 대 보기' : '③ 효소를 끌어 가열기(불꽃)에 대기') : '✓ 맞는 기질만 · 여러 번 · 열에 약하다';
      chip.classList.toggle('done', n === 0);
    }

    // ── 그리기 ──
    function draw(c, W, H, dt) {
      clock += dt; const g = geo(), t = clock;
      const bg = c.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#f6f3ec'); bg.addColorStop(1, '#ece6d8'); c.fillStyle = bg; c.fillRect(0, 0, W, H);
      // 기질 받침(나무 선반)
      const sh = g.sh; c.fillStyle = 'rgba(255,255,255,.55)'; c.strokeStyle = '#7a6040'; c.lineWidth = 2; c.beginPath(); c.roundRect(sh.x, sh.y, sh.w, sh.h, 12); c.fill(); c.stroke();
      P.txt(c, '기질 받침', sh.x + sh.w / 2, sh.y + 24, '#5a4325', '800 18px');
      g.slots.forEach((s, i) => {
        const yb = s.y + 21;
        const wg = c.createLinearGradient(0, yb, 0, yb + 9); wg.addColorStop(0, '#c9a36b'); wg.addColorStop(1, '#8a6534'); c.fillStyle = wg; c.fillRect(sh.x + 10, yb, sh.w - 20, 9);
        const held = drag && drag.sub === s.k;
        if (!held) drawSub(c, s.k, s.x, s.y - Math.abs(Math.sin(t * 1.6 + i)) * 4, 1, 0.92);
        if (sel === i + 1) { c.strokeStyle = '#c99a00'; c.lineWidth = 3; c.setLineDash([6, 4]); c.beginPath(); c.roundRect(sh.x + 6, s.y - 56, sh.w - 12, 112, 10); c.stroke(); c.setLineDash([]); }
        P.txt(c, SUB[s.k].name, s.x, yb + 30, '#3a2a14', '800 17px');
      });
      // 가운데 작업대
      const tr = g.tray;
      P.txt(c, '효소', (g.cx0 + g.cx1) / 2, g.top + 14, 'rgba(58,42,20,.55)', '800 16px');
      c.fillStyle = 'rgba(255,255,255,.5)'; c.strokeStyle = 'rgba(122,96,64,.6)'; c.lineWidth = 1.5; c.setLineDash([6, 5]); c.beginPath(); c.roundRect(tr.x0, tr.y0, tr.x1 - tr.x0, tr.y1 - tr.y0, 12); c.fill(); c.stroke(); c.setLineDash([]);
      P.txt(c, '생성물', tr.x0 + 12, tr.y0 + 22, '#5a4325', '800 16px', 'left');
      enz.forEach((e, i) => {
        if (e.den && e.den.t < 2) e.den.t += dt;
        if (e.shake > 0) e.shake = Math.max(0, e.shake - dt);
        if (!(drag && drag.enz === i)) { e.off.x *= Math.pow(0.0005, dt); e.off.y *= Math.pow(0.0005, dt); }
        const p = epos(e, i, g), sx = Math.sin(e.shake * 40) * e.shake * 14;
        const x = p.x + sx, y = p.y + Math.sin(t * 1.8 + i * 2) * 3;
        // 받침 그림자·이름
        c.fillStyle = 'rgba(29,36,51,.12)'; c.beginPath(); c.ellipse(g.homes[i].x, g.homes[i].y + g.R * 0.98, g.R * 0.95, 10, 0, 0, TAU); c.fill();
        if (e.busy) { e.busy.t += dt; e.sq = Math.min(1, e.busy.t / 0.3); }
        drawEnzyme(c, e, x, y, g.R, t);
        // 자리 안내(점선)
        const sp = { x, y: y - g.R * TOPK + 2 };
        if (!e.den && !e.busy && drag && drag.sub) { c.strokeStyle = 'rgba(29,36,51,.55)'; c.setLineDash([5, 4]); c.lineWidth = 2; c.beginPath(); c.arc(sp.x, sp.y - 4, 40 + Math.sin(t * 5) * 3, 0, TAU); c.stroke(); c.setLineDash([]); }
        if (e.busy) {
          const b = e.busy, k = ease(clamp(b.t / 0.25, 0, 1));
          const bx = lerp(b.x0, sp.x, k), by = lerp(b.y0, sp.y + 1, k);
          drawSub(c, b.k, bx, by + Math.sin(b.t * 30) * (b.t > 0.3 ? 1.2 : 0), 1, lerp(0.92, 0.92 * g.R / 66, k));
          if (b.t > 0.3) { c.globalAlpha = clamp((b.t - 0.3) * 4, 0, 1); pillT(c, sp.x, sp.y - 70, '효소·기질 복합체', '#1d2433'); c.globalAlpha = 1; }
          if (b.t > 1.3) finish(i);
        }
        P.txt(c, e.name, g.homes[i].x, g.homes[i].y + g.R + 32, e.den ? '#6d655c' : e.dk, '800 19px');
        P.txt(c, e.den ? '변성 — 일하지 못함' : `일한 횟수 ${e.n}`, g.homes[i].x, g.homes[i].y + g.R + 56, e.den ? '#b2362b' : '#3a2a14', '700 16px');
      });
      // 생성물(작업대 아래 칸에 쌓인다)
      prods.forEach((q) => {
        q.t = Math.min(1, q.t + dt * 1.6);
        const cx = g.homes[q.i].x, col = q.n % 3, row = Math.floor(q.n / 3), tx = cx + (col - 1) * 42, ty = tr.y1 - 26 - row * 34;
        const k = ease(q.t); drawProd(c, q, lerp(q.x, tx, k), lerp(q.y, ty, k) - Math.sin(k * Math.PI) * 30);
      });
      enz.forEach((e, i) => { if (prods.some((q) => q.i === i)) P.txt(c, e.prod, g.homes[i].x, tr.y0 + 22, '#5a4325', '700 15px'); });
      // 산소 거품
      bubbles = bubbles.filter((b) => (b.y -= b.vy * dt) > 30);
      bubbles.forEach((b) => { const x = b.x + Math.sin(t * 3 + b.ph) * 6; c.fillStyle = 'rgba(190,225,250,.35)'; c.strokeStyle = 'rgba(70,130,190,.75)'; c.lineWidth = 1.5; c.beginPath(); c.arc(x, b.y, b.r, 0, TAU); c.fill(); c.stroke(); o2(c, x, b.y, 0.6); c.fillStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.arc(x - b.r * 0.4, b.y - b.r * 0.4, 2.5, 0, TAU); c.fill(); });
      if (bubbles.length) P.txt(c, '산소 거품', bubbles[0].x + 24, bubbles[0].y, '#1f5f8a', '700 14px', 'left');
      // 튕겨 나간 기질 → 받침으로 돌아간다
      flying = flying.filter((f) => (f.t += dt) < 1.1);
      flying.forEach((f) => { f.vy += 900 * dt; f.x += f.vx * dt; f.y += f.vy * dt; c.globalAlpha = f.t > 0.7 ? (1.1 - f.t) / 0.4 : 1; drawSub(c, f.k, f.x, f.y, 1, 0.92); c.globalAlpha = 1; });
      // 오른쪽: 가열기 · 강한 산 · 그림 문제
      c.fillStyle = 'rgba(255,255,255,.45)'; c.strokeStyle = 'rgba(122,96,64,.6)'; c.lineWidth = 1.5; c.beginPath(); c.roundRect(g.rx, g.top - 8, g.W - 12 - g.rx, g.qz.y0 - g.top - 4, 12); c.fill(); c.stroke();
      P.txt(c, '효소를 끌어 대 보기', g.rx + 12, g.top + 14, '#7a2e10', '800 15px', 'left');
      const ne = drag && drag.enz != null;
      burner(c, g.fire.x, g.fire.y - 20, t, ne && Math.hypot(drag.x - g.fire.x, drag.y - g.fire.y) < 95);
      bottle(c, g.acid.x, g.acid.y, t, ne && Math.hypot(drag.x - g.acid.x, drag.y - g.acid.y) < 80);
      drawQuiz(c, g, t);
      // 잡고 있는 기질
      if (drag && drag.sub) drawSub(c, drag.sub, drag.x, drag.y + 20, 1, 0.92);
    }
    function pillT(c, x, y, t, bg) { c.font = '700 15px "IBM Plex Sans KR", sans-serif'; const w = c.measureText(t).width + 18; c.fillStyle = bg; c.beginPath(); c.roundRect(x - w / 2, y - 15, w, 26, 13); c.fill(); P.txt(c, t, x, y + 3, '#fff', '700 15px'); }

    // ── 손 조작 ──
    function hitEnz(g, p) { return enz.findIndex((e, i) => { const q = epos(e, i, g); return Math.hypot(p.x - q.x, p.y - q.y) < g.R * 1.05; }); }
    function nearSite(g, p) { let bi = -1, bd = 70; enz.forEach((e, i) => { const s = sitePt(e, i, g), d = Math.hypot(p.x - s.x, p.y + 20 - s.y); if (d < bd) { bd = d; bi = i; } }); if (bi < 0) { const i = hitEnz(g, p); if (i >= 0) bi = i; } return bi; }
    function quizHit(g, p) { const pos = drawQuizPos(g); return Object.keys(pos).find((k) => Math.hypot(p.x - pos[k][0], p.y - pos[k][1]) < 24) || null; }
    function drawQuizPos(g) { const L = qzLayout(g), s = L.s; return { A: [L.A.x, L.A.y - 46 * s], B: [L.B.x - 40 * s, L.B.y - 30 * s], C: [L.C.x, L.C.y - 34 * s], D: [L.D.x, L.D.y - 34 * s] }; }
    function quizArea(g, p) { const q = g.qz; if (!(p.x > q.x0 && p.x < q.x1 && p.y > q.y0 && p.y < q.y1)) return null; const L = qzLayout(g); const near = [['A', L.A.x, L.A.y], ['B', L.B.x, L.B.y], ['C', L.C.x, L.C.y], ['D', L.D.x, L.D.y], ['B', L.E1.x, L.E1.y]].map(([k, x, y]) => [k, Math.hypot(p.x - x, p.y - y)]).sort((a, b) => a[1] - b[1])[0]; return near[1] < 46 ? near[0] : null; }

    const S = P.make(stage, {
      draw,
      down(p) {
        const g = geo();
        const qk = quizHit(g, p) || quizArea(g, p); if (qk) { answer(qk); return; }
        const si = g.slots.findIndex((s) => Math.abs(p.x - s.x) < 66 && p.y > s.y - 56 && p.y < s.y + 40);
        if (si >= 0) { drag = { sub: g.slots[si].k, x: p.x, y: p.y }; sel = si + 1; say(`<b>${jo(SUB[g.slots[si].k].name, '을', '를')}</b> 들었다. 아래 돌기 모양과 같은 <b>오목한 자리</b>를 찾아 효소 위에 놓자.`); return; }
        const ei = hitEnz(g, p); if (ei >= 0) { const q = epos(enz[ei], ei, g); drag = { enz: ei, x: p.x, y: p.y, dx: q.x - p.x, dy: q.y - p.y }; return; }
      },
      move(p) {
        if (!drag) return; drag.x = p.x; drag.y = p.y;
        if (drag.enz != null) { const g = geo(), e = enz[drag.enz], h = g.homes[drag.enz]; e.off.x = p.x + drag.dx - h.x; e.off.y = p.y + drag.dy - h.y; }
      },
      up(p) {
        const d = drag; drag = null; if (!d) return; const g = geo();
        if (d.sub) {
          const i = nearSite(g, { x: p.x, y: p.y }); if (i >= 0) tryBind(d.sub, i, { x: p.x, y: p.y + 20 });
          else say('효소 위 <b>오목한 자리</b>까지 끌어다 놓자. 놓친 기질은 받침으로 돌아간다.');
          return;
        }
        if (d.enz != null) {
          const e = enz[d.enz], q = epos(e, d.enz, g);
          if (Math.hypot(q.x - g.fire.x, q.y - g.fire.y) < 110) denature(d.enz, 'heat');
          else if (Math.hypot(q.x - g.acid.x, q.y - g.acid.y) < 95) denature(d.enz, 'acid');
          else say('효소를 오른쪽 <b>가열기</b>나 <b>강한 산</b> 병 위까지 끌어 보자. 놓으면 제자리로 돌아간다.');
        }
      },
      key(e) {
        const i = '12345'.indexOf(e.key); if (i >= 0) { sel = i + 1; say(`<b>${jo(SUB[SUBS[i]].name, '을', '를')}</b> 골랐다. Q·W·E로 효소에 대자.`); return true; }
        const j = 'qwe'.indexOf(e.key.toLowerCase()); if (j >= 0 && e.key.length === 1) { const g = geo(); const s = g.slots[(sel || 1) - 1]; tryBind(s.k, j, { x: s.x, y: s.y }); return true; }
        const h = 'jkl'.indexOf(e.key.toLowerCase()); if (h >= 0 && e.key.length === 1) { denature(h, e.shiftKey ? 'acid' : 'heat'); return true; }
        const a = '6789'.indexOf(e.key); if (a >= 0) { answer('ABCD'[a]); return true; }
        if (e.key === '0') { reset(); return true; }
        return false;
      },
    });
    root.querySelector('.lk-reset').addEventListener('click', () => { reset(); S.kick(); });
    reset();

    root._lk = {
      put: (k, i) => { const g = geo(), s = g.slots[SUBS.indexOf(k)]; tryBind(k, i, { x: s.x, y: s.y }); S.kick(); return root._lk.state(); },
      heat: (i, how = 'heat') => { denature(i, how); S.kick(); return root._lk.state(); },
      quiz: (L) => { answer(L); return root._lk.state(); },
      state: () => ({ n: enz.map((e) => e.n), busy: enz.map((e) => !!e.busy), den: enz.map((e) => (e.den ? e.den.how : null)), anyMatch, reuseDone, denDone, qi, qBad, lastBounce, fin: root.classList.contains('u-done'), out: out.textContent, chip: chip.textContent }),
      geo: () => { const g = geo(); return { W: g.W, H: g.H, slots: g.slots.map((s) => [s.k, s.x, s.y]), sites: enz.map((e, i) => { const s = sitePt(e, i, g); return [s.x, s.y]; }), enz: enz.map((e, i) => { const q = epos(e, i, g); return [q.x, q.y]; }), fire: [g.fire.x, g.fire.y], acid: [g.acid.x, g.acid.y], quiz: drawQuizPos(g) }; },
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.LockKey = { mount };
})();
