/* 3-3 3차시 체험 «분자는 어디로 갈까?»(교과서 151쪽 그림 Ⅲ-35 + 참고서 확산 두 방식 표·확산 속도 그래프·문제 유형).
   왼쪽: 세포막 단면(위 세포 밖, 아래 세포 안). 분자 받침의 병을 끌어 한쪽에 쏟으면 분자가 스스로 움직여 농도가 낮은 쪽으로 넘어간다.
     산소·이산화 탄소는 인지질 2중층 사이로, 포도당·Na⁺는 자기 막단백질 통로로만(통로마다 한 번에 하나, 잠깐 바쁨), 단백질(고분자)은 못 지난다.
     막단백질 조각을 끌어 막에 꽂으면 통로가 늘어난다. 위 오른쪽 표지를 누르면 허파꽈리–모세혈관(산소↓ 이산화 탄소↑)으로 바뀐다.
   오른쪽: 넘어간 수 계기(세포의 에너지 사용 0)와 «농도 차 → 이동 속도» 그래프. 손잡이를 끌면 두 방식의 점이 찍힌다(촉진확산은 통로가 다 바쁘면 평평).
   ① 산소를 쏟아 확산을 본다 ② 포도당이 통로로만 지나감을 본다 ③ 농도 차를 바꿔 두 그래프를 비교한다.
   Diffuse.mount(root) → { fit, setActive } · 시험용: root._df.state() · geo() · pour(종류, 'out'|'in') · addCh('glu'|'na', x) · setD(농도 차) · lung() · tick(초) */
(function () {
  'use strict';
  const TAU = Math.PI * 2, FONT = '"IBM Plex Sans KR", sans-serif';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k;
  const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(TAU * v); };
  // 분자 종류: 지나는 길(lipid 인지질 2중층, glu·na 그 막단백질, none 못 지남)
  const K = {
    o2: { name: '산소', f: 'O₂', r: 8, sp: 95, way: 'lipid', n: 26, col: '#d9483b' },
    co2: { name: '이산화 탄소', f: 'CO₂', r: 9, sp: 85, way: 'lipid', n: 26, col: '#3a3f48' },
    glu: { name: '포도당', f: 'C₆H₁₂O₆', r: 10, sp: 70, way: 'glu', n: 22, col: '#2f6fc4' },
    na: { name: 'Na⁺', f: '나트륨 이온', r: 7, sp: 85, way: 'na', n: 22, col: '#8a4fc0' },
    pro: { name: '단백질', f: '큰 분자', r: 17, sp: 32, way: 'none', n: 7, col: '#3fae6a' },
  };
  const KEYS = ['o2', 'co2', 'glu', 'na', 'pro'];
  const CH = { glu: { name: '포도당 통로', a: '#ffcf8a', b: '#e8893a', c: '#9a4d10' }, na: { name: 'Na⁺ 통로', a: '#ffc2cf', b: '#e0607e', c: '#8f2440' } };
  const D_MAX = 10, simple = (d) => 0.9 * d, vmax = (n) => 1.3 * n, fac = (d, n) => (n ? vmax(n) * Math.tanh(1.6 * d / vmax(n)) : 0);
  const txt = (c, t, x, y, col = '#1d2433', f = '700 20px', al = 'center') => { c.fillStyle = col; c.font = `${f} ${FONT}`; c.textAlign = al; c.fillText(t, x, y); };
  function pill(c, x, y, t, bg, fg = '#fff', f = '700 18px', al = 'center') {
    c.font = `${f} ${FONT}`; const w = c.measureText(t).width + 22, x0 = al === 'left' ? x : al === 'right' ? x - w : x - w / 2;
    c.fillStyle = bg; c.beginPath(); c.roundRect(x0, y - 16, w, 30, 15); c.fill(); txt(c, t, x0 + w / 2, y + 6, fg, f);
  }
  function ball(c, x, y, r, col, hi = '#fff') {
    const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, 1, x, y, r); g.addColorStop(0, hi); g.addColorStop(0.4, col); g.addColorStop(1, shade(col));
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1; c.stroke();
  }
  function shade(hex) { const n = parseInt(hex.slice(1), 16); return `rgb(${(n >> 16) * 0.45 | 0},${(n >> 8 & 255) * 0.45 | 0},${(n & 255) * 0.45 | 0})`; }
  // 분자 그림(교과서 그림처럼 원자 공 모양)
  function mol(c, k, x, y, a, s = 1) {
    const d = K[k]; c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s);
    if (k === 'o2') { ball(c, -5, 0, 7, '#e2503f'); ball(c, 5, 0, 7, '#e2503f'); }
    else if (k === 'co2') { ball(c, -9, 0, 6.5, '#e2503f'); ball(c, 9, 0, 6.5, '#e2503f'); ball(c, 0, 0, 7.5, '#4a505a', '#c9ced6'); }
    else if (k === 'glu') {
      c.beginPath(); for (let i = 0; i < 6; i++) { const t = i / 6 * TAU + Math.PI / 6; c.lineTo(Math.cos(t) * d.r, Math.sin(t) * d.r); } c.closePath();
      const g = c.createRadialGradient(-3, -4, 1, 0, 0, d.r); g.addColorStop(0, '#bcd6ff'); g.addColorStop(0.5, '#3c82e0'); g.addColorStop(1, '#1d4a8c'); c.fillStyle = g; c.fill(); c.strokeStyle = '#14325e'; c.lineWidth = 1.5; c.stroke();
    } else if (k === 'na') { ball(c, 0, 0, 7.5, '#9d63d6', '#ead8ff'); c.rotate(-a); txt(c, '+', 0, 5, '#fff', '800 13px'); }
    else {
      c.beginPath(); for (let i = 0; i <= 40; i++) { const t = i / 40 * TAU, r = d.r * (1 + 0.12 * Math.sin(3 * t + 1) + 0.08 * Math.sin(5 * t)); c.lineTo(Math.cos(t) * r, Math.sin(t) * r); } c.closePath();
      const g = c.createRadialGradient(-5, -6, 2, 0, 0, d.r * 1.1); g.addColorStop(0, '#c9efd5'); g.addColorStop(0.55, '#3fae6a'); g.addColorStop(1, '#1d6b3a'); c.fillStyle = g; c.fill(); c.strokeStyle = '#1d6b3a'; c.lineWidth = 1.5; c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 2; c.beginPath(); c.arc(-3, -2, d.r * 0.5, 0.4, 2.6); c.stroke();
    }
    c.restore();
  }
  // 막단백질(교과서 그림의 통로 단백질: 두 덩이 사이 구멍)
  function channel(c, x, y0, y1, type, busy, t) {
    const p = CH[type], h = y1 - y0, w = 25;
    [-1, 1].forEach((sd) => {
      const cx = x + sd * (w * 0.62);
      c.beginPath(); c.ellipse(cx, (y0 + y1) / 2, w * 0.6, h / 2 + 16, 0, 0, TAU);
      const g = c.createLinearGradient(cx - w * 0.6, 0, cx + w * 0.6, 0); g.addColorStop(0, sd < 0 ? p.b : p.a); g.addColorStop(0.5, p.a); g.addColorStop(1, sd < 0 ? p.a : p.b);
      c.fillStyle = g; c.fill(); c.strokeStyle = p.c; c.lineWidth = 2; c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2; for (let i = -2; i <= 2; i++) { c.beginPath(); c.ellipse(cx, (y0 + y1) / 2 + i * h / 6, w * 0.5, 4, 0, 0.2, Math.PI - 0.2); c.stroke(); }
    });
    if (busy > 0) { c.fillStyle = `rgba(255,226,122,${0.35 + 0.25 * Math.sin(t * 12)})`; c.fillRect(x - 6, y0 - 12, 12, h + 24); }
  }

  function mount(root) {
    const stage = root.querySelector('.df-stage'), chip = root.querySelector('.df-now'), out = root.querySelector('.df-out');
    let P, chans = [], clock, drag, msg, ok, cross, seen, lungOn, dots, D, energy, flash;

    function reset(lung = false, full = false) {
      if (full || !ok) { ok = new Set(); seen = {}; dots = []; D = 0; chans = []; }
      P = []; clock = 0; drag = null; lungOn = lung; flash = [];
      cross = Object.fromEntries(KEYS.map((k) => [k, { down: 0, up: 0, ch: 0 }]));
      if (lung) { spawn('o2', 'out', null, 34); spawn('o2', 'in', null, 4); spawn('co2', 'in', null, 34); spawn('co2', 'out', null, 4); }
      say(lung ? '<b>허파꽈리</b>로 바꿨다. 들이마신 공기는 산소가 많고, 온몸을 돌고 온 혈액은 이산화 탄소가 많다. 두 기체가 <b>서로 반대 방향</b>으로 넘어가는지 보자.'
        : '위 분자 받침에서 <b>산소</b> 병을 끌어 <b>세포 밖</b>(위)에 쏟아 보자. 분자가 스스로 움직이며 어디로 가는지 본다.');
      steps();
    }
    function ensureCh() { if (!chans.length && S.W) { const g = geo(); chans = [{ type: 'glu', x: g.x0 + g.w * 0.3, busy: 0 }, { type: 'na', x: g.x0 + g.w * 0.72, busy: 0 }]; } }
    const say = (t) => { if (t !== msg) { msg = t; out.innerHTML = t; } };

    function geo() {
      const W = S.W, H = S.H, x0 = 12, x1 = Math.round(W * 0.63), gx = x1 + 22;
      const trayY = 12, trayH = 92, top = trayY + trayH + 12, bot = H - 12, my = Math.round((top + bot) / 2 + 8), half = 34;
      const items = [...KEYS, 'chglu', 'chna'], iw = (x1 - x0) / items.length;
      return { W, H, x0, x1, w: x1 - x0, gx, top, bot, my, mt: my - half, mb: my + half,
        tray: items.map((k, i) => ({ k, x: x0 + iw * (i + 0.5), y: trayY + trayH / 2, w: iw - 8, h: trayH })), trayY, trayH,
        card: { x: gx, y: trayY, w: W - gx - 12, h: trayH },
        cnt: { x: gx, y: top, w: W - gx - 12, h: 168 },
        gr: { x: gx + 54, y: top + 214, w: W - gx - 80, h: bot - top - 214 - 70 } };
    }

    // ── 분자 ──
    function spawn(k, side, at, n) {
      const g = geo(), d = K[k]; n = n || d.n;
      for (let i = 0; i < n && P.length < 320; i++) {
        const y0 = side === 'out' ? g.top + d.r + 4 : g.mb + d.r + 4, y1 = side === 'out' ? g.mt - d.r - 4 : g.bot - d.r - 4;
        const x = at ? clamp(at.x + gauss() * 26, g.x0 + d.r, g.x1 - d.r) : g.x0 + d.r + Math.random() * (g.w - 2 * d.r);
        const y = at ? clamp(at.y + gauss() * 18, y0, y1) : lerp(y0, y1, Math.random());
        P.push({ k, x, y, vx: gauss() * d.sp, vy: gauss() * d.sp, side, a: Math.random() * TAU, va: gauss() * 2, tr: null });
      }
    }
    function pour(k, side, at) {
      const before = P.filter((p) => p.k === k && p.side === side).length;
      spawn(k, side, at);
      seen.pour = (seen.pour || 0) + 1; if (k === 'glu') seen.gluPour = true; if (k === 'o2') seen.o2Pour = true;
      const d = K[k], where = side === 'out' ? '세포 밖' : '세포 안';
      const tail = { lipid: '크기가 작고 전하가 없는 기체라 <b>인지질 2중층</b> 사이로 곧장 스며들 수 있다.', glu: '크고 물에 잘 녹는(수용성) 분자라 인지질의 소수성 꼬리층을 지나기 어렵다. <b>포도당 통로</b>(주황 막단백질)를 찾아야 한다.',
        na: '전하를 띤 이온이라 인지질 사이로는 못 지난다. <b>Na⁺ 통로</b>(분홍 막단백질)로만 지난다.', none: '아주 큰 분자(고분자)다. 막을 지날 수 있을까?' }[d.way];
      say(`${where}에 <b>${d.name}</b> ${P.filter((p) => p.k === k && p.side === side).length - before}개를 쏟았다. ${tail}`);
      steps();
    }
    function addCh(type, x) {
      const g = geo(); if (chans.length >= 9) { say('막단백질은 이만하면 충분하다(최대 9개).'); return false; }
      x = clamp(x, g.x0 + 30, g.x1 - 30);
      for (let k = 0; k < 20 && chans.some((q) => Math.abs(q.x - x) < 58); k++) x = clamp(x + (x > g.x0 + g.w / 2 ? -58 : 58), g.x0 + 30, g.x1 - 30);
      chans.push({ type, x, busy: 0, born: clock });
      const n = chans.filter((q) => q.type === type).length;
      say(`<b>${CH[type].name}</b>를 막에 꽂았다(지금 ${n}개). 통로가 많을수록 한꺼번에 지날 수 있는 수가 늘어 <b>촉진확산의 최대 속도</b>가 커진다 — 오른쪽 그래프의 평평한 높이를 보자.`);
      steps(); return true;
    }
    const nCh = (type) => chans.filter((q) => q.type === type).length;

    function stepP(dt) {
      const g = geo();
      chans.forEach((q) => { q.busy = Math.max(0, q.busy - dt); });
      P.forEach((p) => {
        const d = K[p.k];
        p.a += p.va * dt;
        if (p.tr) { // 막을 지나는 중
          const tr = p.tr; tr.t += dt / tr.T; const u = clamp(tr.t, 0, 1), m = Math.sin(Math.PI * u);
          p.x = lerp(tr.x0, tr.x1, u) + (tr.cx != null ? (tr.cx - lerp(tr.x0, tr.x1, u)) * Math.min(1, m * 2) : 0);
          p.y = lerp(tr.y0, tr.y1, u);
          if (u >= 1) { p.side = tr.to; p.tr = null; p.vy = (tr.to === 'in' ? 1 : -1) * d.sp * 0.8; cross[p.k][tr.to === 'in' ? 'down' : 'up']++; if (tr.cx != null) cross[p.k].ch++; firstCross(p.k, !!tr.cx); }
          return;
        }
        const s = d.sp * 2.2 * Math.sqrt(dt);
        p.vx += -p.vx * 2 * dt + gauss() * s * 1.4; p.vy += -p.vy * 2 * dt + gauss() * s * 1.4;
        // 통로를 쓰는 분자는 막 가까이에서 맞는 통로 쪽으로 조금 쏠린다(통로와 결합하는 모습을 줄여 그림)
        if (d.way === 'glu' || d.way === 'na') {
          const near = p.side === 'out' ? g.mt - p.y : p.y - g.mb;
          if (near < 46) { const q = chans.filter((c) => c.type === d.way).sort((a, b) => Math.abs(a.x - p.x) - Math.abs(b.x - p.x))[0]; if (q && Math.abs(q.x - p.x) < 80) p.vx += Math.sign(q.x - p.x) * 160 * dt; }
        }
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.x < g.x0 + d.r) { p.x = g.x0 + d.r; p.vx = Math.abs(p.vx); } else if (p.x > g.x1 - d.r) { p.x = g.x1 - d.r; p.vx = -Math.abs(p.vx); }
        const outer = p.side === 'out' ? g.top + d.r : g.bot - d.r;
        if (p.side === 'out' && p.y < outer) { p.y = outer; p.vy = Math.abs(p.vy); }
        if (p.side === 'in' && p.y > outer) { p.y = outer; p.vy = -Math.abs(p.vy); }
        const hit = p.side === 'out' ? p.y > g.mt - d.r : p.y < g.mb + d.r;
        if (!hit) return;
        const to = p.side === 'out' ? 'in' : 'out', yA = p.side === 'out' ? g.mt - d.r : g.mb + d.r, yB = p.side === 'out' ? g.mb + d.r : g.mt - d.r;
        if (d.way === 'lipid') {
          if (!chans.some((q) => Math.abs(q.x - p.x) < 34) && Math.random() < 0.5) { p.tr = { t: 0, T: 0.55, x0: p.x, x1: p.x + gauss() * 6, y0: yA, y1: yB, to }; return; }
        } else if (d.way !== 'none') {
          const q = chans.find((c) => c.type === d.way && Math.abs(c.x - p.x) < 18 && c.busy <= 0);
          if (q) { q.busy = 0.5; p.tr = { t: 0, T: 0.45, x0: p.x, x1: q.x + gauss() * 3, cx: q.x, y0: yA, y1: yB, to }; return; }
          if (!chans.some((c) => Math.abs(c.x - p.x) < 34)) bounceMsg(p, g);
        } else bounceMsg(p, g);
        p.y = yA; p.vy = (p.side === 'out' ? -1 : 1) * Math.abs(p.vy);
      });
    }
    function firstCross(k, viaCh) {
      if (seen['x' + k]) { steps(); return; } seen['x' + k] = true;
      if (k === 'o2' || k === 'co2') say(`<b>${K[k].name}</b>가 인지질 2중층을 그대로 뚫고 넘어갔다 — <b>인지질 2중층 사이로 일어나는 확산(단순확산)</b>. 많은 쪽에서 적은 쪽으로 넘어가는 수가 더 많다.`);
      else if (viaCh) say(`<b>${K[k].name}</b>가 ${k === 'glu' ? '주황 포도당 통로' : '분홍 Na⁺ 통로'}로만 넘어갔다 — <b>막단백질로 일어나는 확산(촉진확산)</b>. 막단백질마다 옮기는 물질이 정해져 있다(다른 통로로는 못 지난다).`);
      steps();
    }
    function bounceMsg(p, g) {
      const k = p.k;
      if (k === 'pro' && !seen.proHit) { seen.proHit = true; say('<b>단백질</b>은 너무 커서 인지질 사이로도, 통로로도 지나지 못하고 튕겨 나온다. 이런 <b>고분자</b>는 확산으로 세포막을 지나지 못하고, 막으로 싸서 옮긴다.'); }
      if ((k === 'glu' || k === 'na') && !seen['hit' + k] && P.filter((q) => q.k === k).length) { seen['hit' + k] = true; if (!seen['x' + k]) say(`<b>${K[k].name}</b>가 인지질 부분에 부딪혀 튕겨 나왔다. 가운데 소수성 꼬리층이 ${k === 'glu' ? '물에 잘 녹는 포도당' : '전하를 띤 이온'}을 막는다. 맞는 통로 앞에서만 지나간다.`); }
      flash.push({ x: p.x, y: p.side === 'out' ? g.mt : g.mb, t: 0 });
    }

    // ── 표·단계 ──
    const count = (k, side) => P.filter((p) => p.k === k && p.side === side && !p.tr).length;
    function steps() {
      if (cross.o2.down + cross.o2.up >= 8) ok.add(1);
      if (cross.glu.ch >= 3) ok.add(2);
      const ds = new Set(dots.map((q) => q.d)); if (ds.size >= 4 && Math.max(0, ...ds) >= 7 && Math.min(10, ...ds) <= 3) ok.add(3);
      const n = [1, 2, 3].find((k) => !ok.has(k)) || 0;
      window.L1.steps(root, n, [...ok]); window.L1.done(root, n === 0);
      chip.textContent = n === 1 ? '① 산소 병을 끌어 세포 밖에 쏟기' : n === 2 ? '② 포도당 병을 끌어 쏟기 — 어디로 지나갈까?' : n === 3 ? '③ 그래프 아래 손잡이를 오른쪽 끝까지 끌기' : '✓ 확산: 많은 쪽 → 적은 쪽, 에너지 0';
      chip.classList.toggle('done', n === 0);
    }
    function setD(v) {
      D = clamp(Math.round(v * 2) / 2, 0, D_MAX); const n = nCh('glu');
      if (!dots.some((q) => q.d === D && q.n === n)) dots.push({ d: D, n, s: simple(D), f: fac(D, n), t: clock });
      const busy = n ? fac(D, n) / vmax(n) : 0;
      if (D > 0) say(busy > 0.93 ? `농도 차 <b>${D}</b>: 단순확산은 계속 빨라지는데, 촉진확산은 <b>포도당 통로 ${n}개가 모두 바빠</b> 더 빨라지지 않는다(평평). 통로를 더 꽂으면 평평한 높이가 올라간다.`
        : `농도 차 <b>${D}</b>: 농도 차가 클수록 두 방식 모두 이동 속도가 빨라진다. 촉진확산은 통로 ${n}개 중 ${Math.round(busy * n * 10) / 10}개쯤이 바쁘다.`);
      steps();
    }

    // ── 그리기 ──
    function draw(c, W, H, dt) {
      ensureCh(); clock += dt; const g = geo(), t = clock;
      if (dt) stepP(dt);
      c.fillStyle = '#f5f2ea'; c.fillRect(0, 0, W, H);
      drawCells(c, g, t);
      drawMem(c, g, t);
      P.forEach((p) => mol(c, p.k, p.x, p.y, p.a)); drawLabels(c, g);
      flash = flash.filter((f) => (f.t += dt) < 0.4); flash.forEach((f) => { c.strokeStyle = `rgba(217,72,59,${1 - f.t / 0.4})`; c.lineWidth = 2; c.beginPath(); c.arc(f.x, f.y, 6 + f.t * 30, 0, TAU); c.stroke(); });
      drawTray(c, g, t); drawCard(c, g, t); drawCount(c, g); drawGraph(c, g, t);
      if (drag) {
        if (drag.k) { drawJar(c, drag.x, drag.y, 78, 84, drag.k, t, true); txt(c, '세포 밖이나 안에 놓기', drag.x, drag.y + 62, '#1d2433', '700 16px'); }
        if (drag.ch) { channel(c, drag.x, drag.y - 34, drag.y + 34, drag.ch, 0, t); txt(c, '막에 꽂기', drag.x, drag.y + 70, '#1d2433', '700 16px'); }
      }
    }
    function drawCells(c, g, t) {
      const og = c.createLinearGradient(0, g.top, 0, g.mt); og.addColorStop(0, lungOn ? '#eef6fb' : '#dceff9'); og.addColorStop(1, lungOn ? '#dfeef7' : '#c6e4f4');
      c.fillStyle = og; c.beginPath(); c.roundRect(g.x0, g.top, g.w, g.mt - g.top, [12, 12, 0, 0]); c.fill();
      const ig = c.createLinearGradient(0, g.mb, 0, g.bot); ig.addColorStop(0, lungOn ? '#f6d4cf' : '#fbecc9'); ig.addColorStop(1, lungOn ? '#efc0b8' : '#f4dfb0');
      c.fillStyle = ig; c.beginPath(); c.roundRect(g.x0, g.mb, g.w, g.bot - g.mb, [0, 0, 12, 12]); c.fill();
      // 물결·세포질 알갱이(배경이 살아 있게)
      c.strokeStyle = 'rgba(40,110,160,.13)'; c.lineWidth = 2;
      for (let k = 0; k < 4; k++) { const y = g.top + 30 + k * (g.mt - g.top - 40) / 4; c.beginPath(); for (let x = g.x0; x <= g.x1; x += 16) c.lineTo(x, y + Math.sin(x / 40 + t * 1.2 + k) * 4); c.stroke(); }
      if (lungOn) { // 모세혈관 속 적혈구
        for (let i = 0; i < 6; i++) { const x = g.x0 + ((i * 131 + t * 24) % (g.w + 80)) - 40, y = g.mb + 40 + (i % 3) * (g.bot - g.mb - 70) / 2; c.save(); c.translate(x, y); c.rotate(0.3 * i); const rg = c.createRadialGradient(0, 0, 4, 0, 0, 24); rg.addColorStop(0, '#e9a0a0'); rg.addColorStop(0.55, '#c8423e'); rg.addColorStop(1, '#8c1f1f'); c.globalAlpha = 0.5; c.fillStyle = rg; c.beginPath(); c.ellipse(0, 0, 26, 18, 0, 0, TAU); c.fill(); c.globalAlpha = 1; c.restore(); }
      } else { c.fillStyle = 'rgba(160,120,50,.16)'; for (let k = 0; k < 40; k++) { const x = g.x0 + (k * 97.3) % g.w, y = g.mb + 10 + (k * 53.7) % (g.bot - g.mb - 20); c.beginPath(); c.arc(x + Math.sin(t + k) * 2, y, 3 + (k % 3), 0, TAU); c.fill(); } }
    }
    function drawLabels(c, g) {
      pill(c, g.x0 + 12, g.top + 22, lungOn ? '허파꽈리 속 공기' : '세포 밖', '#2a6f97', '#fff', '800 19px', 'left');
      pill(c, g.x0 + 12, g.bot - 24, lungOn ? '모세혈관 속 혈액' : '세포 안', lungOn ? '#a3302b' : '#9a6a12', '#fff', '800 19px', 'left');
      // 칸마다 분자 수(농도)
      [['out', g.top + 22], ['in', g.bot - 24]].forEach(([side, y]) => {
        let x = g.x1 - 10;
        KEYS.slice().reverse().forEach((k) => { const n = count(k, side); if (!n) return; c.font = `700 16px ${FONT}`; const s = `${K[k].name} ${n}`, w = c.measureText(s).width + 40; x -= w; c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.roundRect(x, y - 14, w - 6, 27, 13); c.fill(); mol(c, k, x + 14, y, 0, k === 'pro' ? 0.55 : 0.8); txt(c, s, x + 28, y + 6, '#1d2433', '700 16px', 'left'); x -= 4; });
      });
    }
    function drawMem(c, g, t) {
      const y0 = g.mt, y1 = g.mb, hr = 6.5, sp = 15;
      const band = c.createLinearGradient(0, y0, 0, y1); band.addColorStop(0, '#f3e6b5'); band.addColorStop(0.5, '#e9d38a'); band.addColorStop(1, '#f3e6b5');
      c.fillStyle = band; c.fillRect(g.x0, y0, g.w, y1 - y0);
      const gap = (x) => chans.some((q) => Math.abs(q.x - x) < 30);
      for (let x = g.x0 + 8; x < g.x1; x += sp) {
        if (gap(x)) continue;
        const w = Math.sin(x / 33 + t * 1.5) * 1.5; // 인지질은 조금씩 흔들린다(유동성)
        c.strokeStyle = '#b08a3a'; c.lineWidth = 1.6;
        [[y0 + hr, 1], [y1 - hr, -1]].forEach(([hy, d]) => { [-2.5, 2.5].forEach((o) => { c.beginPath(); for (let k = 0; k <= 8; k++) { const yy = hy + d * (hr + k * ((y1 - y0) / 2 - hr - 3) / 8); c.lineTo(x + o + w + Math.sin(k * 1.4 + x) * 1.6, yy); } c.stroke(); }); });
        [[y0 + hr], [y1 - hr]].forEach(([hy]) => { const gr = c.createRadialGradient(x + w - 2, hy - 2, 1, x + w, hy, hr); gr.addColorStop(0, '#fff6d6'); gr.addColorStop(0.5, '#f2c14e'); gr.addColorStop(1, '#b07a12'); c.fillStyle = gr; c.beginPath(); c.arc(x + w, hy, hr, 0, TAU); c.fill(); });
      }
      chans.forEach((q) => channel(c, q.x, y0, y1, q.type, q.busy, t));
      chans.forEach((q) => { if (clock - (q.born || -9) < 1.2) { c.strokeStyle = `rgba(255,210,58,${1 - (clock - q.born) / 1.2})`; c.lineWidth = 4; c.beginPath(); c.arc(q.x, (y0 + y1) / 2, 50, 0, TAU); c.stroke(); } });
      // 이름표
      const ml = lungOn ? '허파꽈리 벽·모세혈관 벽' : '인지질 2중층'; c.font = `700 15px ${FONT}`; const mw = c.measureText(ml).width + 20;
      const lx = g.x1 - 6; c.fillStyle = 'rgba(255,255,255,.88)'; c.beginPath(); c.roundRect(lx - mw, y0 - 30, mw, 24, 8); c.fill(); txt(c, ml, lx - mw / 2, y0 - 12, '#7a5a10', '700 15px');
      txt(c, '친수성 머리', g.x0 + 6, y1 + 22, '#7a5a10', '600 14px', 'left');
    }
    function drawJar(c, x, y, w, h, k, t, lifted) {
      const d = K[k];
      c.save(); c.translate(x, y); if (lifted) c.rotate(Math.sin(t * 6) * 0.08 + 0.35);
      c.shadowColor = 'rgba(0,0,0,.2)'; c.shadowBlur = lifted ? 14 : 5; c.shadowOffsetY = lifted ? 8 : 3;
      const bw = Math.min(w - 14, 64), bh = h - 32;
      const gl = c.createLinearGradient(-bw / 2, 0, bw / 2, 0); gl.addColorStop(0, 'rgba(255,255,255,.95)'); gl.addColorStop(0.3, 'rgba(225,238,245,.9)'); gl.addColorStop(1, 'rgba(190,210,222,.95)');
      c.fillStyle = gl; c.beginPath(); c.roundRect(-bw / 2, -bh / 2 - 6, bw, bh, 10); c.fill(); c.shadowColor = 'transparent'; c.strokeStyle = '#5b6474'; c.lineWidth = 1.6; c.stroke();
      c.fillStyle = '#5b6474'; c.beginPath(); c.roundRect(-bw / 2 + 8, -bh / 2 - 13, bw - 16, 9, 3); c.fill();
      const pos = k === 'pro' ? [[0, 0]] : [[-12, 4], [10, 6], [-2, -8], [13, -10], [-14, -12]];
      pos.forEach(([u, v], i) => mol(c, k, u, v - 4, i + t * 0.6 * (i % 2 ? 1 : -1), k === 'pro' ? 0.7 : 0.62));
      c.restore();
      if (!lifted) txt(c, d.name, x, y + h / 2 - 2, '#1d2433', '800 16px');
    }
    function drawTray(c, g, t) {
      c.fillStyle = 'rgba(255,255,255,.75)'; c.strokeStyle = 'rgba(29,36,51,.35)'; c.lineWidth = 2; c.setLineDash([7, 5]); c.beginPath(); c.roundRect(g.x0, g.trayY, g.w, g.trayH, 12); c.fill(); c.stroke(); c.setLineDash([]);
      g.tray.forEach((it) => {
        if (drag && (drag.k === it.k || drag.ch === it.k.slice(2))) { c.globalAlpha = 0.3; }
        if (KEYS.includes(it.k)) drawJar(c, it.x, it.y, it.w, it.h, it.k, t, false);
        else { const ty = it.k.slice(2); c.save(); c.translate(it.x, it.y - 10); c.scale(0.62, 0.62); channel(c, 0, -30, 30, ty, 0, t); c.restore(); txt(c, CH[ty].name, it.x, it.y + it.h / 2 - 2, CH[ty].c, '800 15px'); }
        c.globalAlpha = 1;
      });
      const sx = g.tray[5].x - g.tray[5].w / 2 - 4; c.strokeStyle = 'rgba(29,36,51,.3)'; c.lineWidth = 2; c.beginPath(); c.moveTo(sx, g.trayY + 12); c.lineTo(sx, g.trayY + g.trayH - 12); c.stroke();
    }
    function drawCard(c, g, t) { // 허파꽈리 표지
      const q = g.card, on = lungOn;
      c.save(); c.translate(0, Math.sin(t * 1.6) * 1.5);
      c.shadowColor = 'rgba(0,0,0,.18)'; c.shadowBlur = 6; c.shadowOffsetY = 3; c.fillStyle = on ? '#fbe3df' : '#fff8ec'; c.beginPath(); c.roundRect(q.x, q.y, q.w, q.h, 12); c.fill(); c.shadowColor = 'transparent';
      c.strokeStyle = on ? '#a3302b' : '#b8874a'; c.lineWidth = 2.5; c.stroke();
      // 허파꽈리 송이와 모세혈관 그림
      const ax = q.x + 46, ay = q.y + q.h / 2;
      [[-14, -12], [8, -18], [16, 4], [-6, 10], [-20, 8]].forEach(([u, v]) => { const gg = c.createRadialGradient(ax + u - 4, ay + v - 4, 2, ax + u, ay + v, 15); gg.addColorStop(0, '#ffe3e3'); gg.addColorStop(1, '#e58a8a'); c.fillStyle = gg; c.beginPath(); c.arc(ax + u, ay + v, 14, 0, TAU); c.fill(); c.strokeStyle = '#a9504f'; c.lineWidth = 1.2; c.stroke(); });
      c.strokeStyle = '#c0392b'; c.lineWidth = 3; c.beginPath(); for (let i = 0; i <= 20; i++) c.lineTo(ax - 32 + i * 3.2, ay + 22 + Math.sin(i * 0.8) * 6); c.stroke();
      c.strokeStyle = '#3a6fb0'; c.beginPath(); for (let i = 0; i <= 20; i++) c.lineTo(ax - 32 + i * 3.2, ay - 26 + Math.sin(i * 0.8 + 1) * 5); c.stroke();
      txt(c, on ? '허파꽈리 ⇄ 모세혈관' : '실제 예: 허파꽈리', q.x + 92, q.y + 36, '#1d2433', '800 19px', 'left');
      txt(c, on ? '누르면 세포막으로 돌아가기' : '누르면 바꿔 보기 · 산소와 이산화 탄소', q.x + 92, q.y + 64, '#5b6474', '700 15px', 'left');
      c.restore();
    }
    function drawCount(c, g) {
      const q = g.cnt; c.fillStyle = 'rgba(255,255,255,.92)'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.roundRect(q.x, q.y, q.w, q.h, 12); c.fill(); c.stroke();
      txt(c, '막을 넘어간 수', q.x + 14, q.y + 28, '#1d2433', '800 19px', 'left');
      txt(c, '↓ 밖→안   ↑ 안→밖', q.x + q.w - 12, q.y + 28, '#5b6474', '700 14px', 'right');
      const rows = KEYS.filter((k) => cross[k].down + cross[k].up > 0 || P.some((p) => p.k === k)).slice(0, 4);
      if (!rows.length) txt(c, '분자를 쏟으면 여기에 센다', q.x + q.w / 2, q.y + 76, '#8a93a3', '600 16px');
      rows.forEach((k, i) => { const y = q.y + 56 + i * 24; mol(c, k, q.x + 22, y - 5, 0, k === 'pro' ? 0.5 : 0.7); txt(c, K[k].name, q.x + 40, y, '#1d2433', '700 16px', 'left'); txt(c, k === 'pro' ? '못 지남 0' : `↓${cross[k].down}  ↑${cross[k].up}`, q.x + q.w - 12, y, k === 'pro' ? '#b2362b' : '#1d2433', '700 16px', 'right'); });
      // 에너지 계기
      const ey = q.y + q.h - 22; c.fillStyle = '#e8f5ec'; c.beginPath(); c.roundRect(q.x + 10, ey - 18, q.w - 20, 30, 10); c.fill();
      txt(c, '세포의 에너지 사용', q.x + 20, ey + 3, '#1d6b3a', '800 16px', 'left'); txt(c, '0', q.x + q.w - 22, ey + 5, '#1d6b3a', '800 22px', 'right');
    }
    function drawGraph(c, g, t) {
      const q = g.gr, X = (d) => q.x + d / D_MAX * q.w, Y = (v) => q.y + q.h - v / 9.5 * q.h, n = nCh('glu');
      txt(c, '농도 차에 따른 이동 속도', q.x - 40, q.y - 22, '#1d2433', '800 18px', 'left');
      c.strokeStyle = '#1d2433'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(q.x, q.y - 4); c.lineTo(q.x, q.y + q.h); c.lineTo(q.x + q.w + 4, q.y + q.h); c.stroke();
      c.save(); c.translate(q.x - 14, q.y + q.h / 2); c.rotate(-Math.PI / 2); txt(c, '물질의 이동 속도', 0, 0, '#1d2433', '700 15px'); c.restore();
      txt(c, '세포 안팎의 농도 차 →', q.x + q.w, q.y + q.h + 22, '#1d2433', '700 15px', 'right'); txt(c, 'O', q.x - 8, q.y + q.h + 16, '#1d2433', '700 14px', 'right');
      // 점(단순확산 파랑 동그라미, 촉진확산 주황 네모: 통로 수가 지금과 같은 점만 진하게)
      const ss = dots.slice().sort((a, b) => a.d - b.d), fs = ss.filter((p) => p.n === n);
      if (ss.length > 1) { c.strokeStyle = 'rgba(42,111,151,.55)'; c.lineWidth = 2; c.beginPath(); ss.forEach((p) => c.lineTo(X(p.d), Y(p.s))); c.stroke(); }
      if (fs.length > 1) { c.strokeStyle = 'rgba(232,137,58,.7)'; c.lineWidth = 2; c.beginPath(); fs.forEach((p) => c.lineTo(X(p.d), Y(p.f))); c.stroke(); }
      dots.forEach((p) => { const old = p.n !== n; c.globalAlpha = old ? 0.3 : 1; c.fillStyle = '#e8893a'; c.fillRect(X(p.d) - 5, Y(p.f) - 5, 10, 10); c.globalAlpha = 1; c.fillStyle = '#2a6f97'; c.beginPath(); c.arc(X(p.d), Y(p.s), 5.5, 0, TAU); c.fill(); });
      if (ss.length) { const l = ss[ss.length - 1]; txt(c, '단순확산', Math.min(X(l.d) + 6, q.x + q.w - 60), Y(l.s) - 10, '#2a6f97', '800 15px', 'left'); }
      if (fs.length) { const l = fs[fs.length - 1]; txt(c, `촉진확산(통로 ${n})`, Math.min(X(l.d), q.x + q.w - 10), Y(l.f) + 22, '#b4611c', '800 15px', 'right'); }
      // 손잡이
      const kx = X(D), ky = q.y + q.h + 46, hot = drag && drag.knob;
      c.strokeStyle = '#c9ccd3'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(q.x, ky); c.lineTo(q.x + q.w, ky); c.stroke(); c.lineCap = 'butt';
      if (D > 0) { c.setLineDash([4, 4]); c.strokeStyle = 'rgba(29,36,51,.35)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(kx, ky - 14); c.lineTo(kx, Y(Math.max(simple(D), fac(D, n)))); c.stroke(); c.setLineDash([]); }
      c.shadowColor = 'rgba(0,0,0,.25)'; c.shadowBlur = 6; c.shadowOffsetY = 3; c.fillStyle = hot ? '#ffe27a' : '#fff'; c.beginPath(); c.arc(kx, ky, 15 + (D ? 0 : Math.sin(t * 4) * 2), 0, TAU); c.fill(); c.shadowColor = 'transparent'; c.strokeStyle = '#1d2433'; c.lineWidth = 2.5; c.stroke();
      txt(c, '↔', kx, ky + 6, '#1d2433', '800 16px');
      const right = kx < q.x + q.w / 2; pill(c, right ? kx + 22 : kx - 22, ky, D ? `농도 차 ${D}` : '끌어 농도 차 바꾸기', '#1d2433', '#fff', '700 14px', right ? 'left' : 'right');
      // 통로가 바쁜 정도
      const busy = n && D ? fac(D, n) / vmax(n) : 0;
      if (busy > 0.93) pill(c, q.x + q.w / 2, q.y + 8, `포도당 통로 ${n}개 모두 바쁨`, '#b4611c', '#fff', '700 15px');
    }

    // ── 손 조작 ──
    const inTray = (g, p) => g.tray.find((it) => Math.abs(p.x - it.x) < it.w / 2 && Math.abs(p.y - it.y) < it.h / 2);
    const S = window.Play.make(stage, {
      draw,
      down(p) {
        const g = geo(), q = g.card, gr = g.gr;
        if (p.x > q.x && p.x < q.x + q.w && p.y > q.y && p.y < q.y + q.h) { reset(!lungOn); return; }
        const it = inTray(g, p);
        if (it) { drag = KEYS.includes(it.k) ? { k: it.k, x: p.x, y: p.y } : { ch: it.k.slice(2), x: p.x, y: p.y }; return; }
        if (p.x > gr.x - 30 && p.x < gr.x + gr.w + 30 && p.y > gr.y + gr.h + 20 && p.y < gr.y + gr.h + 72) { drag = { knob: true }; setD((p.x - gr.x) / gr.w * D_MAX); return; }
        const ch = chans.find((c) => Math.abs(c.x - p.x) < 26 && Math.abs(p.y - g.my) < 50);
        if (ch) say(`${CH[ch.type].name}: ${ch.type === 'glu' ? '포도당' : 'Na⁺'}만 지나는 막단백질. 한 번에 하나씩 지나서 잠깐 노랗게 바쁘다. 받침에서 하나 더 끌어 꽂을 수 있다.`);
      },
      move(p) {
        if (!drag) return; drag.x = p.x; drag.y = p.y;
        if (drag.knob) { const gr = geo().gr; setD((p.x - gr.x) / gr.w * D_MAX); }
      },
      up(p) {
        const d = drag; drag = null; if (!d) return; const g = geo();
        if (d.k) {
          if (p.x > g.x0 && p.x < g.x1 && p.y > g.top && p.y < g.mt) pour(d.k, 'out', p);
          else if (p.x > g.x0 && p.x < g.x1 && p.y > g.mb && p.y < g.bot) pour(d.k, 'in', p);
          else say('병은 <b>세포 밖</b>(위 파란 칸)이나 <b>세포 안</b>(아래 칸)에 놓아야 쏟아진다.');
        }
        if (d.ch) { if (p.x > g.x0 && p.x < g.x1 && Math.abs(p.y - g.my) < 70) addCh(d.ch, p.x); else say('막단백질은 가운데 <b>세포막</b> 위에 놓아야 꽂힌다.'); }
      },
      key(e) {
        const g = geo(), mid = { x: g.x0 + g.w / 2, y: (g.top + g.mt) / 2 };
        const m = { 1: 'o2', 2: 'glu', 3: 'na', 4: 'co2', 5: 'pro' }[e.key];
        if (m) { pour(m, 'out', mid); return true; }
        if (e.key === 'p' || e.key === 'P') { addCh('glu', g.x0 + Math.random() * g.w); return true; }
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { setD(D + (e.key === 'ArrowRight' ? 1 : -1)); return true; }
        if (e.key === 'a' || e.key === 'A') { reset(!lungOn); return true; }
        if (e.key === '0') { reset(false, true); return true; }
        return false;
      },
    });
    root.querySelector('.df-reset').addEventListener('click', () => { reset(false, true); S.kick(); });
    reset(false, true);

    root._df = {
      state: () => ({ n: P.length, cross: JSON.parse(JSON.stringify(cross)), chans: chans.map((q) => q.type), D, dots: dots.length, lung: lungOn, ok: [...ok], fin: root.classList.contains('u-done'), out: out.textContent, chip: chip.textContent,
        cnt: Object.fromEntries(KEYS.map((k) => [k, [count(k, 'out'), count(k, 'in')]])) }),
      geo: () => { const g = geo(); return { W: g.W, H: g.H, tray: g.tray.map((i) => [i.k, Math.round(i.x), Math.round(i.y)]), out: [g.x0 + g.w / 2, (g.top + g.mt) / 2], inn: [g.x0 + g.w / 2, (g.mb + g.bot) / 2], mem: [g.x0 + g.w * 0.5, g.my], card: [g.card.x + g.card.w / 2, g.card.y + g.card.h / 2], knob: [g.gr.x, g.gr.y + g.gr.h + 46], knobEnd: [g.gr.x + g.gr.w, g.gr.y + g.gr.h + 46] }; },
      pour: (k, side) => { const g = geo(); pour(k, side, { x: g.x0 + g.w / 2, y: side === 'out' ? (g.top + g.mt) / 2 : (g.mb + g.bot) / 2 }); return root._df.state(); },
      addCh: (ty, x) => { addCh(ty, x); return root._df.state(); },
      setD: (v) => { setD(v); return root._df.state(); },
      lung: () => { reset(!lungOn); return root._df.state(); },
      tick: (sec) => { for (let i = 0; i < sec * 60; i++) draw(S.c, S.W, S.H, 1 / 60); steps(); return root._df.state(); },
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Diffuse = { mount };
})();
