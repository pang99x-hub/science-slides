/* 3-3 1차시 체험 «동화일까 이화일까»(교과서 145쪽 그림 Ⅲ-29·30 + 참고서 물질대사·동화·이화, 포도당의 연소와 세포호흡 비교).
   (가) 분자 작업대: 왼쪽 반응 카드(아미노산 잇기 · 녹말 쪼개기 · 단백질 쪼개기 · 광합성 · 세포호흡)를 눌러 작업대에 올린다.
        잇기: 아미노산 구슬을 끌어 사슬 끝에 붙이면 결합마다 물 한 분자가 빠지고 에너지가 들어온다(흡수, 동화).
        쪼개기: 고리·구슬을 잡아 끌어 떼거나, 사슬 위를 문지르면(소화 효소) 결합이 끊기며 에너지가 나온다(방출, 이화).
        광합성: 이산화 탄소·물 무리를 엽록체에 넣으면 빛에너지를 흡수해 포도당 + 산소. 세포호흡: 포도당·산소를 마이토콘드리아에 넣으면 에너지 방출 + 이산화 탄소·물.
        오른쪽 «물질이 가진 에너지» 막대와 그래프(반응물 → 생성물)가 함께 움직인다.
   (나) 아래: 접시의 포도당을 왼쪽 불꽃에 끌어 넣으면 고온에서 한꺼번에 큰 불꽃·열, 오른쪽 세포 속(마이토콘드리아) 계단 맨 위에 놓으면
        효소 계단을 한 칸씩 내려가며 에너지가 조금씩 나온다(37 ℃). 나온 에너지 합은 같다.
   ① 동화 작용을 해 본다 ② 이화 작용을 해 본다 ③ 연소와 세포호흡을 비교한다.
   Metab.mount(root) → { fit, setActive } · 시험용: root._mb.pick(반응) · act() · burn() · resp() · state() · geo() */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const MODES = ['link', 'starch', 'prot', 'photo', 'resp'];
  const M = {
    link: { name: '아미노산 잇기', sub: '단백질 합성', ana: true, R: '아미노산(작은 분자)', P: '단백질(큰 분자)' },
    starch: { name: '녹말 쪼개기', sub: '소화', ana: false, R: '녹말(큰 분자)', P: '포도당(작은 분자)' },
    prot: { name: '단백질 쪼개기', sub: '소화', ana: false, R: '단백질(큰 분자)', P: '아미노산(작은 분자)' },
    photo: { name: '광합성', sub: '엽록체', ana: true, R: '이산화 탄소 + 물', P: '포도당 + 산소' },
    resp: { name: '세포호흡', sub: '마이토콘드리아', ana: false, R: '포도당 + 산소', P: '이산화 탄소 + 물' },
  };
  const AA = ['#e4574a', '#f2a53a', '#4cae5b', '#3c8fd6', '#9a62c9', '#e05fa1'];
  const lerp = (a, b, k) => a + (b - a) * k, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const ease = (k) => 1 - (1 - k) * (1 - k);

  function mount(root) {
    const stage = root.querySelector('.mb-stage'), chip = root.querySelector('.mb-now'), out = root.querySelector('.mb-out');
    const tabA = root.querySelector('.mb-tab1 tbody'), tabB = root.querySelector('.mb-tab2 tbody');
    const P = window.Play;
    let mode, units, chain, bonds, rub, piles, react, prog, done, drag, parts, drops, clock, msg, glu, burnT, respT, respStep, burned, resped, eBurn, eResp, foldT;

    function reset() {
      mode = null; units = []; chain = []; bonds = []; rub = []; piles = []; react = 0; prog = 0; done = new Set(); drag = null; parts = []; drops = []; clock = 0;
      glu = { k: 1 }; burnT = -1; respT = -1; respStep = -1; burned = false; resped = false; eBurn = []; eResp = []; foldT = -1;
      say('위 작업대: 왼쪽 <b>반응 카드</b>를 눌러 올리자. 먼저 <b>아미노산 잇기</b>. 아래: 접시의 <b>포도당</b>을 불꽃이나 세포 속 계단으로 끌어 보자.');
      tables(); steps();
    }
    const say = (t) => { if (t !== msg) { msg = t; out.innerHTML = t; } };

    // ── 자리 잡기 ──
    function geo() {
      const W = S.W, H = S.H, yB = Math.round(H * 0.5), top = 62;
      const ch = Math.floor((yB - top) / 5) - 6;
      const cards = MODES.map((k, i) => ({ k, x: 12, y: top + i * (ch + 6), w: 158, h: ch }));
      const bx = 182, bw = W - 252 - bx, by = top, bh = yB - top;
      const ex = W - 240, ew = 228;
      const y2 = yB + 14, h2 = H - 12 - y2;
      const dish = { x: Math.round(W * 0.47), y: y2 + h2 - 46 };
      const fl = { x: Math.round(W * 0.2), y: y2 + h2 - 54, x0: 12, x1: Math.round(W * 0.38) };
      const st = { x0: Math.round(W * 0.56), x1: W - 12, y0: y2, y1: y2 + h2 };
      const sw = Math.round((st.x1 - st.x0 - 160) / 5), sh = Math.round((h2 - 130) / 5);
      const stairs = Array.from({ length: 6 }, (_, i) => ({ x: st.x0 + 46 + i * sw, y: st.y0 + 100 + i * sh, w: sw }));
      return { W, H, yB, top, cards, bx, bw, by, bh, ex, ew, y2, h2, dish, fl, st, stairs, sw, sh, org: { x: bx + bw * 0.66, y: by + bh * 0.56 } };
    }

    // ── 그림 도구 ──
    function hexa(c, x, y, r, col = '#f2c14e', a = 0) {
      c.save(); c.translate(x, y); c.rotate(a);
      const g = c.createRadialGradient(-r * 0.3, -r * 0.3, 1, 0, 0, r * 1.1); g.addColorStop(0, '#fff6d8'); g.addColorStop(1, col);
      c.fillStyle = g; c.strokeStyle = '#8a5a00'; c.lineWidth = 2; c.beginPath(); for (let i = 0; i < 6; i++) c.lineTo(Math.cos(i * TAU / 6 + Math.PI / 6) * r, Math.sin(i * TAU / 6 + Math.PI / 6) * r); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#c0392b'; c.beginPath(); c.arc(Math.cos(-Math.PI / 6) * r * 0.98, Math.sin(-Math.PI / 6) * r * 0.98, r * 0.16, 0, TAU); c.fill();
      c.restore();
    }
    function bead(c, x, y, r, col) {
      const g = c.createRadialGradient(x - r * 0.35, y - r * 0.35, 1, x, y, r); g.addColorStop(0, '#fff'); g.addColorStop(0.35, col); g.addColorStop(1, shade(col));
      c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1.2; c.stroke();
    }
    const shade = (h) => { const n = parseInt(h.slice(1), 16); return `rgb(${(n >> 16) * 0.55 | 0},${((n >> 8) & 255) * 0.55 | 0},${(n & 255) * 0.55 | 0})`; };
    function atom(c, x, y, r, col) { const g = c.createRadialGradient(x - r * 0.35, y - r * 0.35, 1, x, y, r); g.addColorStop(0, '#fff'); g.addColorStop(0.4, col); g.addColorStop(1, shade(col)); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 1; c.stroke(); }
    const co2 = (c, x, y, k = 1) => { atom(c, x - 13 * k, y, 8 * k, '#e2453a'); atom(c, x + 13 * k, y, 8 * k, '#e2453a'); atom(c, x, y, 9 * k, '#3a3f47'); };
    const h2o = (c, x, y, k = 1) => { atom(c, x - 9 * k, y + 7 * k, 5.5 * k, '#f4f6f8'); atom(c, x + 9 * k, y + 7 * k, 5.5 * k, '#f4f6f8'); atom(c, x, y, 9 * k, '#e2453a'); };
    const o2 = (c, x, y, k = 1) => { atom(c, x - 7 * k, y, 8 * k, '#e2453a'); atom(c, x + 7 * k, y, 8 * k, '#e2453a'); };
    function star(c, x, y, r, a, col = '#ffd23a') {
      c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = col; c.strokeStyle = '#c47a00'; c.lineWidth = 1; c.beginPath();
      for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.4 : r; c.lineTo(Math.cos(i * Math.PI / 4) * rr, Math.sin(i * Math.PI / 4) * rr); } c.closePath(); c.fill(); c.stroke(); c.restore();
    }
    function pill(c, x, y, t, bg, fg = '#fff', f = '700 15px') {
      c.font = `${f} "IBM Plex Sans KR", sans-serif`; const w = c.measureText(t).width + 16;
      c.fillStyle = bg; c.beginPath(); c.roundRect(x - w / 2, y - 14, w, 24, 12); c.fill(); P.txt(c, t, x, y + 3, fg, f);
    }
    function chloro(c, x, y, w, h, glow) {
      if (glow > 0) { c.globalAlpha = Math.min(1, glow); P.glow(c, x, y, w * 0.8, 'rgba(255,240,120,.6)'); c.globalAlpha = 1; }
      const g = c.createRadialGradient(x - w * 0.2, y - h * 0.3, 4, x, y, w * 0.6); g.addColorStop(0, '#b9e59a'); g.addColorStop(1, '#3f8f2f');
      c.fillStyle = g; c.beginPath(); c.ellipse(x, y, w / 2, h / 2, 0, 0, TAU); c.fill(); c.strokeStyle = '#1f5a17'; c.lineWidth = 2.5; c.stroke();
      c.strokeStyle = 'rgba(230,255,210,.7)'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(x, y, w / 2 - 5, h / 2 - 5, 0, 0, TAU); c.stroke();
      [[-0.28, 0.05], [0, -0.12], [0.27, 0.08], [-0.05, 0.22]].forEach(([a, b]) => { for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? '#2e7a22' : '#3f9a30'; c.strokeStyle = '#1a4d12'; c.lineWidth = 1; c.beginPath(); c.roundRect(x + a * w - 13, y + b * h - 12 + i * 6, 26, 6, 3); c.fill(); c.stroke(); } });
    }
    function mitoBody(c, x, y, L, Wd, glow) {
      if (glow > 0) { c.globalAlpha = Math.min(1, glow); P.glow(c, x, y, L * 0.75, 'rgba(255,200,80,.55)'); c.globalAlpha = 1; }
      const g = c.createLinearGradient(0, y - Wd / 2, 0, y + Wd / 2); g.addColorStop(0, '#ffb08f'); g.addColorStop(0.5, '#e46a48'); g.addColorStop(1, '#a8321c');
      c.fillStyle = g; c.beginPath(); c.roundRect(x - L / 2, y - Wd / 2, L, Wd, Wd / 2); c.fill(); c.strokeStyle = '#6e1c0e'; c.lineWidth = 2.5; c.stroke();
      c.fillStyle = '#f7b9a2'; c.beginPath(); c.roundRect(x - L / 2 + 6, y - Wd / 2 + 6, L - 12, Wd - 12, Wd / 2 - 6); c.fill();
      c.strokeStyle = '#b8432a'; c.lineWidth = 3; c.lineJoin = 'round'; c.beginPath(); const n = Math.round(L / 20), x0 = x - L / 2 + Wd * 0.4, x1 = x + L / 2 - Wd * 0.4;
      for (let i = 0; i <= n; i++) { const xx = lerp(x0, x1, i / n); c.lineTo(xx, y + (i % 2 ? 1 : -1) * (Wd / 2 - 8)); c.lineTo(xx + (x1 - x0) / n / 2, y); } c.stroke();
    }
    function enzyme(c, x, y, r, open, col = '#3fae6a') { // 효소(입 벌린 덩어리)
      const m = 0.15 + open * 0.55;
      const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r); g.addColorStop(0, '#c8f0d4'); g.addColorStop(1, col);
      c.fillStyle = g; c.beginPath(); c.moveTo(x, y); c.arc(x, y, r, -Math.PI / 2 + m, -Math.PI / 2 - m + TAU); c.closePath(); c.fill(); c.strokeStyle = '#1d6b3a'; c.lineWidth = 1.6; c.stroke();
    }
    function thermo(c, x, y, h, v, label) { // v 0..1
      c.fillStyle = '#fff'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.roundRect(x - 7, y - h, 14, h, 7); c.fill(); c.stroke();
      c.beginPath(); c.arc(x, y + 6, 12, 0, TAU); c.fillStyle = '#d9483b'; c.fill(); c.stroke();
      c.fillStyle = '#d9483b'; c.fillRect(x - 3.5, y - 4 - (h - 10) * v, 7, (h - 10) * v + 6);
      P.txt(c, label, x, y - h - 10, '#b2362b', '800 16px');
    }
    function flame(c, x, y, s, t) { // s: 크기 배율
      const fl = (k) => Math.sin(t * 13 + k) * 0.06 + Math.sin(t * 7.3 + k * 2) * 0.05;
      [[1, '#ff7a1a', 'rgba(255,60,0,0)'], [0.72, '#ffc23a', 'rgba(255,150,0,0)'], [0.42, '#fff3b0', 'rgba(255,255,200,0)']].forEach(([k, c1], i) => {
        const hh = 40 * s * k * (1 + fl(i)), ww = 18 * s * k * (1 + fl(i + 3) * 0.5) + 6;
        const g = c.createLinearGradient(0, y - hh, 0, y); g.addColorStop(0, 'rgba(255,200,80,0)'); g.addColorStop(0.35, c1); g.addColorStop(1, c1);
        c.fillStyle = g; c.beginPath(); c.moveTo(x, y - hh); c.bezierCurveTo(x + ww * 0.7, y - hh * 0.55, x + ww, y - hh * 0.1, x, y); c.bezierCurveTo(x - ww, y - hh * 0.1, x - ww * 0.7, y - hh * 0.55, x, y - hh); c.fill();
      });
      c.fillStyle = 'rgba(70,140,255,.75)'; c.beginPath(); c.ellipse(x, y - 3, 8 + s * 2, 5, 0, 0, TAU); c.fill();
    }

    // ── 작업대 반응 준비 ──
    function pick(k) {
      const g = geo(); mode = k; units = []; chain = []; bonds = []; rub = []; piles = []; react = 0; prog = 0; drag = null; foldT = -1;
      const cx = g.bx + g.bw / 2, cy = g.by + g.bh * 0.55;
      if (k === 'link') {
        units.push({ x: g.bx + 60, y: cy, c: AA[0], free: false });
        for (let i = 1; i < 6; i++) units.push({ x: g.bx + g.bw * (0.4 + (i % 3) * 0.2), y: g.by + g.bh * (i < 4 ? 0.36 : 0.78) + (i % 2) * 14, c: AA[i], free: true, ph: i });
        chain = [0];
        say('<b>아미노산</b> 구슬을 하나씩 끌어 왼쪽 사슬 <b>끝</b>에 붙이자. 작은 분자를 이어 큰 분자를 만든다.');
      } else if (k === 'starch' || k === 'prot') {
        const n = k === 'starch' ? 8 : 6, gap = k === 'starch' ? 50 : 56;
        for (let i = 0; i < n; i++) units.push({ x: cx - (n - 1) * gap / 2 + i * gap, y: cy + Math.sin(i * 1.3) * 10, c: AA[i % 6], free: false, hx: true });
        units.forEach((u) => { u.rx = u.x; u.ry = u.y; });
        bonds = Array(n - 1).fill(true); rub = Array(n - 1).fill(0);
        say(`큰 분자 <b>${k === 'starch' ? '녹말' : '단백질'}</b>이다. 고리를 잡아 <b>끌어 떼거나</b>, 사슬 위를 <b>문질러</b>(소화 효소) 결합을 끊자.`);
      } else if (k === 'photo') {
        piles = [{ k: 'co2', x: g.bx + 70, y: g.by + g.bh * 0.38, in: false }, { k: 'h2o', x: g.bx + 70, y: g.by + g.bh * 0.78, in: false }];
        say('<b>이산화 탄소</b>와 <b>물</b> 무리를 끌어 <b>엽록체</b>에 넣자. 햇빛의 에너지가 필요하다.');
      } else if (k === 'resp') {
        piles = [{ k: 'glu', x: g.bx + 70, y: g.by + g.bh * 0.38, in: false }, { k: 'o2', x: g.bx + 70, y: g.by + g.bh * 0.78, in: false }];
        say('<b>포도당</b>과 <b>산소</b>를 끌어 <b>마이토콘드리아</b>에 넣자.');
      }
      steps();
    }
    function bondFx(x, y, ana) {
      const g = geo();
      for (let i = 0; i < 9; i++) {
        if (ana) { const a = Math.random() * TAU; parts.push({ x: x + Math.cos(a) * 140, y: y + Math.sin(a) * 90, tx: x, ty: y, u: -Math.random() * 0.3, life: 0.8 }); }
        else { const a = Math.random() * TAU; parts.push({ x, y, tx: clamp(x + Math.cos(a) * 160, g.bx, g.bx + g.bw), ty: clamp(y + Math.sin(a) * 110, g.by, g.by + g.bh), u: -Math.random() * 0.2, life: 0.9 }); }
      }
    }
    function finishMode() {
      done.add(mode); const m = M[mode];
      const t = {
        link: '아미노산 여섯 개가 이어져 <b>단백질</b>이 되었다. 작은 분자 → 큰 분자, 에너지 <b>흡수</b> — <b>동화 작용</b>. 결합마다 물이 한 분자씩 빠졌다.',
        starch: '녹말이 <b>포도당</b>으로 다 쪼개졌다. 큰 분자 → 작은 분자, 에너지 <b>방출</b> — <b>이화 작용</b>(소화).',
        prot: '단백질이 <b>아미노산</b>으로 다 쪼개졌다. 큰 분자 → 작은 분자, 에너지 <b>방출</b> — <b>이화 작용</b>(소화).',
        photo: '빛에너지를 <b>흡수</b>해 이산화 탄소와 물로 <b>포도당</b>을 만들고 산소를 내보냈다 — 광합성은 <b>동화 작용</b>.',
        resp: '포도당을 산소로 분해해 이산화 탄소와 물이 되며 에너지를 <b>방출</b>했다 — 세포호흡은 <b>이화 작용</b>. 아래에서 불에 태울 때와 비교해 보자.',
      }[mode];
      say(t + (done.size < 2 ? ` 이제 ${m.ana ? '<b>쪼개는</b>' : '<b>잇는</b>'} 카드도 해 보자.` : ''));
      tables(); steps();
    }
    function addLink(i) {
      const u = units[i]; if (!u || !u.free) return;
      u.free = false; chain.push(i); const g = geo(), e = chainPos(chain.length - 1, g);
      bondFx(e[0] - 22, e[1], true); drops.push({ x: e[0] - 22, y: e[1] - 10, u: 0, k: 'h2o' });
      prog = (chain.length - 1) / 5;
      if (chain.length === 6) { foldT = 0; finishMode(); } else say(`결합 ${chain.length - 1}개 — 이을 때마다 <b>물</b> 한 분자가 빠지고, 에너지가 <b>들어와</b> 분자에 저장된다(물질이 가진 에너지 ↑).`);
    }
    function breakBond(i) {
      if (!bonds[i]) return; bonds[i] = false; const a = units[i], b = units[i + 1];
      bondFx((a.x + b.x) / 2, (a.y + b.y) / 2, false);
      // 끊긴 쪽이 조금 벌어진다
      units.forEach((u, j) => { if (!u.free) u.rx += (j <= i ? -6 : 6); });
      const br = bonds.filter((x) => !x).length; prog = br / bonds.length;
      if (br === bonds.length) { units.forEach((u) => { u.free = true; u.vx = (Math.random() - 0.5) * 30; u.vy = (Math.random() - 0.5) * 20; }); finishMode(); }
      else say(`결합 ${br}/${bonds.length}개를 끊었다 — 끊을 때마다 에너지가 <b>나온다</b>(물질이 가진 에너지 ↓).`);
    }
    function feed(j) {
      const p = piles[j]; if (!p || p.in) return; p.in = true;
      if (piles.every((q) => q.in)) { react = 0.0001; say(mode === 'photo' ? '빛에너지가 엽록체로 들어간다… <b>흡수</b>' : '마이토콘드리아 안에서 포도당이 분해된다… 에너지 <b>방출</b>'); }
      else say(`${{ co2: '이산화 탄소', h2o: '물', glu: '포도당', o2: '산소' }[p.k]}를 넣었다. 나머지 하나도 넣자.`);
    }
    function chainPos(i, g) {
      const x0 = g.bx + 60, y0 = g.by + g.bh * 0.55;
      if (foldT >= 0) { const k = ease(Math.min(1, foldT)), a = i * 1.15, r = 12 + i * 7; return [lerp(x0 + i * 46, x0 + 120 + Math.cos(a) * r, k), lerp(y0 + Math.sin(i * 0.9 + clock * 2) * 6, y0 + Math.sin(a) * r * 0.8, k)]; }
      return [x0 + i * 46, y0 + Math.sin(i * 0.9 + clock * 2) * 6];
    }

    // ── 아래: 연소 vs 세포호흡 ──
    function burn() {
      if (burnT >= 0 && burnT < 2.6) return; burnT = 0; eBurn = []; glu.k = 0;
      burned = true;
      say('포도당을 불꽃에 넣자 <b>한꺼번에</b> 큰 불꽃과 열이 난다. 온도가 <b>400 ℃ 넘게</b> 올라간다 — 효소 없이 높은 온도에서 일어나는 <b>연소</b>. 생성물은 이산화 탄소와 물.' + (resped ? '' : ' 이번엔 오른쪽 <b>세포 속 계단</b>에 넣어 보자.'));
      tables(); steps();
    }
    function respStart() {
      if (respStep >= 0 && respStep < 5) return; respStep = 0; respT = 0; eResp = []; glu.k = 0;
      say('세포 속에서는 포도당이 <b>효소</b>를 하나씩 만나 계단을 내려간다. 한 칸마다 에너지가 <b>조금씩</b> 나온다. 온도는 <b>체온(약 37 ℃)</b> 그대로.');
    }

    function draw(c, W, H, dt) {
      clock += dt; const g = geo(), t = clock;
      c.fillStyle = '#f5f2ea'; c.fillRect(0, 0, W, H);
      // ─ 위: 작업대 ─
      MODES.forEach((k, i) => { const cd = g.cards[i], on = mode === k; c.save(); c.shadowColor = 'rgba(29,36,51,.2)'; c.shadowBlur = on ? 0 : 4; c.shadowOffsetY = on ? 0 : 3; c.fillStyle = on ? '#fff3b0' : '#fffdf7'; c.beginPath(); c.roundRect(cd.x, cd.y, cd.w, cd.h, 10); c.fill(); c.restore(); c.strokeStyle = on ? '#c99a00' : '#1d2433'; c.lineWidth = on ? 3 : 2; c.beginPath(); c.roundRect(cd.x, cd.y, cd.w, cd.h, 10); c.stroke();
        c.fillStyle = M[k].ana ? '#2a8fb8' : '#d9483b'; c.beginPath(); c.roundRect(cd.x + 6, cd.y + 6, 6, cd.h - 12, 3); c.fill();
        P.txt(c, M[k].name, cd.x + 18, cd.y + cd.h / 2 - 2, '#1d2433', '800 17px', 'left'); P.txt(c, M[k].sub + (done.has(k) ? ' ✓' : ''), cd.x + 18, cd.y + cd.h / 2 + 18, done.has(k) ? '#2f9e5b' : '#5b6474', '600 14px', 'left'); });
      // 작업대 판
      const wg = c.createLinearGradient(0, g.by, 0, g.by + g.bh); wg.addColorStop(0, '#e9dcc4'); wg.addColorStop(1, '#d8c5a2');
      c.fillStyle = wg; c.beginPath(); c.roundRect(g.bx, g.by, g.bw, g.bh, 12); c.fill(); c.strokeStyle = '#7a6040'; c.lineWidth = 2; c.stroke();
      c.strokeStyle = 'rgba(120,90,50,.15)'; c.lineWidth = 1; for (let i = 1; i < 7; i++) { c.beginPath(); c.moveTo(g.bx + 8, g.by + i * g.bh / 7 + Math.sin(i) * 3); c.bezierCurveTo(g.bx + g.bw * 0.3, g.by + i * g.bh / 7 - 4, g.bx + g.bw * 0.7, g.by + i * g.bh / 7 + 5, g.bx + g.bw - 8, g.by + i * g.bh / 7); c.stroke(); }
      P.txt(c, '(가) 분자 작업대' + (mode ? ` · ${M[mode].name}` : ''), g.bx + 14, g.by + 24, '#5a4325', '800 17px', 'left');
      if (!mode) { P.txt(c, '← 반응 카드를 눌러 올리자', g.bx + g.bw / 2, g.by + g.bh / 2 + 8, 'rgba(90,67,37,.7)', '700 22px'); }
      drawBench(c, g, t, dt);
      drawEnergy(c, g, t);
      // ─ 아래: 연소 vs 세포호흡 ─
      drawCompare(c, g, t, dt);
      // 알갱이
      parts = parts.filter((q) => (q.u += dt / q.life) < 1);
      parts.forEach((q) => { if (q.u < 0) return; const e = ease(q.u); c.globalAlpha = q.u > 0.8 ? (1 - q.u) / 0.2 : 1; star(c, lerp(q.x, q.tx, e), lerp(q.y, q.ty, e), q.r || 6, t * 4 + q.x, q.col); c.globalAlpha = 1; });
      drops = drops.filter((q) => (q.u += dt * 0.6) < 1);
      drops.forEach((q) => { c.globalAlpha = q.u > 0.7 ? (1 - q.u) / 0.3 : 1; const y = q.y - q.u * 60; if (q.k === 'h2o') { h2o(c, q.x, y, 0.8); P.txt(c, '물', q.x + 20, y + 4, '#1f6fb8', '700 13px', 'left'); } else if (q.k === 'co2') co2(c, q.x, y, 0.8); else if (q.k === 'o2') o2(c, q.x, y, 0.8); c.globalAlpha = 1; });
      // 잡고 있는 것
      if (drag && drag.glu) { hexa(c, drag.x, drag.y, 22); }
      if (drag && drag.pile != null) { const p = piles[drag.pile]; drawPile(c, p.k, drag.x, drag.y, t); }
    }
    function drawPile(c, k, x, y, t) {
      c.fillStyle = 'rgba(255,255,255,.55)'; c.strokeStyle = 'rgba(90,67,37,.5)'; c.lineWidth = 1.5; c.setLineDash([5, 4]); c.beginPath(); c.arc(x, y, 38, 0, TAU); c.fill(); c.stroke(); c.setLineDash([]);
      const f = { co2, h2o, o2, glu: (cc, xx, yy, k2) => hexa(cc, xx, yy, 12 * k2) }[k];
      [[-14, -12], [14, -10], [0, 12]].forEach(([a, b], i) => f(c, x + a + Math.sin(t * 2 + i) * 2, y + b, 0.75));
      P.txt(c, { co2: '이산화 탄소', h2o: '물', glu: '포도당', o2: '산소' }[k], x, y + 56, '#3a2a14', '700 15px');
    }
    function drawBench(c, g, t, dt) {
      if (!mode) return;
      if (mode === 'link') {
        if (foldT >= 0) foldT += dt;
        for (let i = 1; i < chain.length; i++) { const a = chainPos(i - 1, g), b = chainPos(i, g); c.strokeStyle = '#4a3a2a'; c.lineWidth = 4; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); }
        chain.forEach((ui, i) => { const p = chainPos(i, g); bead(c, p[0], p[1], 17, units[ui].c); });
        if (chain.length < 6 && !(drag && drag.unit != null)) { const e = chainPos(chain.length, g); c.setLineDash([5, 5]); c.strokeStyle = 'rgba(29,36,51,.5)'; c.lineWidth = 2; c.beginPath(); c.arc(e[0], e[1], 17 + Math.sin(t * 4) * 2, 0, TAU); c.stroke(); c.setLineDash([]); }
        units.forEach((u, i) => { if (!u.free) return; const dragging = drag && drag.unit === i; const x = dragging ? drag.x : u.x, y = dragging ? drag.y : u.y + Math.sin(t * 1.8 + u.ph) * 5; bead(c, x, y, 17, u.c); P.txt(c, '아미노산', x, y + 34, '#5a4325', '600 13px'); });
        if (foldT >= 0) pill(c, g.bx + 180, g.by + g.bh - 22, '단백질(큰 분자)', '#2a8fb8');
      } else if (mode === 'starch' || mode === 'prot') {
        units.forEach((u, i) => {
          if (drag && drag.unit === i) return;
          if (u.free) { u.x = clamp(u.x + (u.vx || 0) * dt, g.bx + 24, g.bx + g.bw - 24); u.y = clamp(u.y + (u.vy || 0) * dt, g.by + 40, g.by + g.bh - 24); if (u.vx) { u.vx *= 0.97; u.vy *= 0.97; } }
          else { u.x = lerp(u.x, u.rx, 0.2); u.y = lerp(u.y, u.ry + Math.sin(t * 1.5 + i) * 3, 0.2); }
        });
        bonds.forEach((ok, i) => { if (!ok) return; const a = units[i], b = units[i + 1]; c.strokeStyle = '#5a4325'; c.lineWidth = 4; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); if (rub[i] > 0) { c.strokeStyle = `rgba(217,72,59,${Math.min(1, rub[i] / 140)})`; c.lineWidth = 6; c.stroke(); } });
        units.forEach((u, i) => { const x = drag && drag.unit === i ? drag.x : u.x, y = drag && drag.unit === i ? drag.y : u.y; if (mode === 'starch') hexa(c, x, y, 20, '#f2c14e', i * 0.2); else bead(c, x, y, 18, u.c); if (u.free) P.txt(c, mode === 'starch' ? '포도당' : '아미노산', x, y + 36, '#5a4325', '600 13px'); });
        if (drag && drag.rub) { enzyme(c, drag.x + 26, drag.y - 20, 18, 0.5 + 0.5 * Math.sin(t * 12)); pill(c, drag.x + 26, drag.y - 50, '소화 효소', '#1d6b3a'); }
        if (bonds.every((x) => !x)) pill(c, g.bx + g.bw / 2, g.by + g.bh - 22, mode === 'starch' ? '포도당(작은 분자) 여러 개' : '아미노산(작은 분자) 여러 개', '#d9483b');
      } else {
        const o = g.org, ph = mode === 'photo', gl = react > 0 && react < 1 ? 0.8 : 0.2;
        if (ph) { // 해와 빛
          const sx = g.bx + g.bw - 40, sy = g.by + 40; P.glow(c, sx, sy, 46, 'rgba(255,220,80,.9)'); c.fillStyle = '#ffcf33'; c.beginPath(); c.arc(sx, sy, 20, 0, TAU); c.fill();
          c.strokeStyle = `rgba(240,180,0,${react > 0 && react < 1 ? 0.9 : 0.4})`; c.lineWidth = 3; c.setLineDash([10, 8]); c.lineDashOffset = -t * 40; [[-0.4, 0], [0, 0], [0.4, 0]].forEach(([d]) => { c.beginPath(); c.moveTo(sx - 20, sy + 14); c.lineTo(o.x + 30 + d * 60, o.y - 30); c.stroke(); }); c.setLineDash([]); c.lineDashOffset = 0;
          chloro(c, o.x, o.y, 190, 104, gl); pill(c, o.x, o.y + 72, '엽록체', '#1f5a17');
        } else { mitoBody(c, o.x, o.y, 210, 92, gl); pill(c, o.x, o.y + 66, '마이토콘드리아', '#6e1c0e'); }
        piles.forEach((p, j) => { if (p.in || (drag && drag.pile === j)) return; drawPile(c, p.k, p.x, p.y + Math.sin(t * 1.6 + j) * 3, t); });
        if (react > 0 && react < 1) {
          react = Math.min(1, react + dt / 2.4); prog = react;
          if (Math.random() < dt * 14) { if (ph) { parts.push({ x: g.bx + g.bw - 40, y: g.by + 40, tx: o.x + (Math.random() - 0.5) * 80, ty: o.y, u: 0, life: 0.7 }); } else { const a = Math.random() * TAU; parts.push({ x: o.x, y: o.y, tx: o.x + Math.cos(a) * 170, ty: o.y + Math.sin(a) * 110, u: 0, life: 0.8 }); } }
          if (react >= 1) { for (let i = 0; i < 4; i++) drops.push({ x: o.x + 70 + i * 22, y: o.y - 10 + (i % 2) * 20, u: -i * 0.15, k: ph ? 'o2' : (i % 2 ? 'h2o' : 'co2') }); finishMode(); }
        }
        if (react >= 1) { if (ph) { hexa(c, o.x + 150, o.y + 4, 22); P.txt(c, '포도당', o.x + 150, o.y + 44, '#5a4325', '700 14px'); } else { co2(c, o.x + 140, o.y - 14); h2o(c, o.x + 150, o.y + 24); P.txt(c, '이산화 탄소 + 물', o.x + 145, o.y + 56, '#5a4325', '700 14px'); } }
      }
    }
    function drawEnergy(c, g, t) {
      const x0 = g.ex, y0 = g.by, w = g.ew, h = g.bh;
      c.fillStyle = '#fffdf7'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.roundRect(x0, y0, w, h, 12); c.fill(); c.stroke();
      P.txt(c, '물질이 가진 에너지', x0 + w / 2, y0 + 24, '#1d2433', '800 16px');
      if (!mode) { P.txt(c, '반응을 고르면', x0 + w / 2, y0 + h / 2, '#8a92a0', '600 15px'); P.txt(c, '그래프가 그려진다', x0 + w / 2, y0 + h / 2 + 22, '#8a92a0', '600 15px'); return; }
      const m = M[mode], R = m.ana ? 0.22 : 0.82, Pd = m.ana ? 0.82 : 0.22, lv = lerp(R, Pd, prog);
      const gt = y0 + 44, gb = y0 + h - 54, Y = (v) => lerp(gb, gt, v);
      // 막대
      const bx = x0 + 14; c.fillStyle = '#eef0f3'; c.fillRect(bx, gt, 22, gb - gt); c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; c.strokeRect(bx, gt, 22, gb - gt);
      const bg = c.createLinearGradient(0, gb, 0, gt); bg.addColorStop(0, '#ffd23a'); bg.addColorStop(1, '#ff8a1a'); c.fillStyle = bg; c.fillRect(bx + 2, Y(lv), 18, gb - Y(lv));
      // 그래프
      const gx0 = x0 + 50, gx1 = x0 + w - 12; c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(gx0, gt - 4); c.lineTo(gx0, gb); c.lineTo(gx1, gb); c.stroke();
      P.txt(c, '반응의 진행 →', (gx0 + gx1) / 2, gb + 16, '#5b6474', '600 13px');
      const pathAt = (k) => (k < 0.25 ? R : k > 0.75 ? Pd : lerp(R, Pd, (1 - Math.cos((k - 0.25) / 0.5 * Math.PI)) / 2));
      c.strokeStyle = 'rgba(29,36,51,.25)'; c.setLineDash([4, 4]); c.lineWidth = 2; c.beginPath(); for (let i = 0; i <= 40; i++) { const k = i / 40; const xx = lerp(gx0 + 6, gx1 - 4, k), yy = Y(pathAt(k)); i ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke(); c.setLineDash([]);
      c.strokeStyle = m.ana ? '#2a8fb8' : '#d9483b'; c.lineWidth = 3.5; c.beginPath(); const kk = 0.25 + prog * 0.5 + (prog >= 1 ? 0.25 : 0); for (let i = 0; i <= 40 * kk; i++) { const k = i / 40; const xx = lerp(gx0 + 6, gx1 - 4, k), yy = Y(pathAt(k)); i ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke();
      P.txt(c, '반응물', gx0 + 28, Y(R) + (m.ana ? 18 : -8), '#1d2433', '700 13px'); P.txt(c, '생성물', gx1 - 24, Y(Pd) + (m.ana ? -8 : 18), '#1d2433', '700 13px');
      if (prog > 0) { const ax = gx1 - 58, ya = Y(R), yb = Y(lv); c.strokeStyle = m.ana ? '#2a8fb8' : '#d9483b'; c.lineWidth = 3; c.beginPath(); c.moveTo(ax, ya); c.lineTo(ax, yb); c.stroke(); const d = Math.sign(yb - ya) || 1; c.fillStyle = c.strokeStyle; c.beginPath(); c.moveTo(ax - 7, yb - d * 10); c.lineTo(ax + 7, yb - d * 10); c.lineTo(ax, yb); c.fill(); P.txt(c, m.ana ? '흡수' : '방출', ax - 22, (ya + yb) / 2 + 5, m.ana ? '#2a8fb8' : '#d9483b', '800 15px'); }
      if (done.has(mode)) pill(c, x0 + w / 2, y0 + h - 14, m.ana ? '동화 작용 · 에너지 흡수' : '이화 작용 · 에너지 방출', m.ana ? '#2a8fb8' : '#d9483b', '#fff', '700 14px');
    }
    function drawCompare(c, g, t, dt) {
      const y2 = g.y2, h2 = g.h2;
      c.fillStyle = '#efe7d6'; c.beginPath(); c.roundRect(10, y2, g.W - 20, h2, 12); c.fill(); c.strokeStyle = '#7a6040'; c.lineWidth = 2; c.stroke();
      P.txt(c, '(나) 포도당을 불에 태우면? 세포 속에서는?', 24, y2 + 24, '#5a4325', '800 17px', 'left');
      // 불꽃 쪽
      const f = g.fl, burning = burnT >= 0 && burnT < 2.6;
      if (burnT >= 0) burnT += dt;
      const bs = burning ? (burnT < 0.25 ? lerp(1, 5, burnT / 0.25) : burnT < 1.4 ? 5 + Math.sin(t * 9) * 0.3 : lerp(5, 1, Math.min(1, (burnT - 1.4) / 1.2))) : 1;
      if (burning && burnT < 1.5) { c.globalAlpha = Math.min(1, (1.5 - burnT)); P.glow(c, f.x, f.y - 60, 170, 'rgba(255,170,40,.55)'); c.globalAlpha = 1; for (let i = 0; i < 5; i++) { c.strokeStyle = 'rgba(255,140,40,.35)'; c.lineWidth = 2; c.beginPath(); for (let k = 0; k < 20; k++) { const yy = f.y - 120 - k * 5; c.lineTo(f.x - 60 + i * 30 + Math.sin(k * 0.6 + t * 8 + i) * 6, yy); } c.stroke(); } }
      // 받침(접시·삼발이)
      c.strokeStyle = '#3a3f47'; c.lineWidth = 4; c.beginPath(); c.moveTo(f.x - 46, f.y + 34); c.lineTo(f.x - 34, f.y + 4); c.moveTo(f.x + 46, f.y + 34); c.lineTo(f.x + 34, f.y + 4); c.stroke();
      const dg = c.createLinearGradient(0, f.y, 0, f.y + 12); dg.addColorStop(0, '#c9ced6'); dg.addColorStop(1, '#6f7682'); c.fillStyle = dg; c.beginPath(); c.ellipse(f.x, f.y + 4, 44, 9, 0, 0, TAU); c.fill(); c.strokeStyle = '#3a3f47'; c.lineWidth = 1.5; c.stroke();
      flame(c, f.x, f.y, bs, t);
      if (burning && burnT < 0.5 && Math.random() < 0.9) for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (Math.random() - 0.5) * 2.6; parts.push({ x: f.x, y: f.y - 40, tx: f.x + Math.cos(a) * 170, ty: f.y - 40 + Math.sin(a) * 120, u: 0, life: 0.7, r: 7, col: '#ff8a1a' }); }
      if (burning && burnT > 0.2 && burnT < 1.2 && Math.random() < dt * 5) drops.push({ x: f.x + (Math.random() - 0.5) * 50, y: f.y - 100, u: 0, k: Math.random() < 0.5 ? 'co2' : 'h2o' });
      const tempB = burnT < 0 ? 0.08 : burning ? clamp(burnT / 0.4, 0, 1) * (burnT > 1.6 ? lerp(1, 0.5, (burnT - 1.6)) : 1) : 0.5;
      thermo(c, f.x - 120, f.y + 30, 150, burnT < 0 ? 0.08 : tempB, burnT < 0 ? '실온' : burning ? '400 ℃↑' : '최고 400 ℃↑');
      P.txt(c, '불꽃(연소)', f.x, f.y + 56, '#3a2a14', '800 16px');
      if (burnT >= 0 && burnT < 1.2 && !eBurn.length) eBurn = [[0.18, 1]];
      miniChart(c, f.x + 82, y2 + 56, 120, 84, eBurn, burnT >= 0 ? clamp(burnT / 0.6, 0, 1) : 0, '#ff8a1a');
      // 접시의 포도당
      const d = g.dish; c.fillStyle = '#fff'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.ellipse(d.x, d.y + 20, 52, 12, 0, 0, TAU); c.fill(); c.stroke();
      glu.k = Math.min(1, glu.k + dt * 1.5);
      if (!(drag && drag.glu)) { const k = glu.k; c.globalAlpha = k; hexa(c, d.x, d.y - 4 + Math.sin(t * 2) * 3, 22 * (0.6 + 0.4 * k)); c.globalAlpha = 1; c.strokeStyle = 'rgba(29,36,51,.55)'; c.setLineDash([4, 4]); c.lineWidth = 2; c.beginPath(); c.arc(d.x, d.y - 4, 32 + Math.sin(t * 4) * 2, 0, TAU); c.stroke(); c.setLineDash([]); }
      P.txt(c, '포도당', d.x, d.y + 48, '#3a2a14', '800 16px');
      P.txt(c, '← 끌기 →', d.x, d.y - 46, '#5b6474', '700 14px');
      // 세포 속 계단
      const st = g.st; c.save(); c.beginPath(); c.roundRect(st.x0, st.y0 + 34, st.x1 - st.x0 - 4, st.y1 - st.y0 - 40, 60); c.clip();
      const mg = c.createLinearGradient(0, st.y0, 0, st.y1); mg.addColorStop(0, '#fbd3c2'); mg.addColorStop(1, '#f2a98e'); c.fillStyle = mg; c.fillRect(st.x0, st.y0, st.x1 - st.x0, st.y1 - st.y0);
      c.strokeStyle = 'rgba(184,67,42,.25)'; c.lineWidth = 8; for (let i = 0; i < 9; i++) { const xx = st.x0 + 30 + i * 52; c.beginPath(); c.moveTo(xx, st.y1); c.quadraticCurveTo(xx + 20, st.y0 + 120, xx + 40, st.y1); c.stroke(); }
      c.restore(); c.strokeStyle = '#a8321c'; c.lineWidth = 3; c.beginPath(); c.roundRect(st.x0, st.y0 + 34, st.x1 - st.x0 - 4, st.y1 - st.y0 - 40, 60); c.stroke();
      P.txt(c, '세포 속 · 마이토콘드리아(세포호흡)', st.x0 + 20, st.y0 + 56, '#6e1c0e', '800 15px', 'left');
      g.stairs.forEach((s, i) => { if (i === 5) return; c.fillStyle = i % 2 ? '#e7d3c6' : '#f1e3d9'; c.strokeStyle = '#7a4b38'; c.lineWidth = 1.5; c.beginPath(); c.rect(s.x, s.y + 24, s.w, st.y1 - 10 - (s.y + 24)); c.fill(); c.stroke(); const on = respStep === i && respT >= 0; enzyme(c, s.x + s.w - 14, s.y + 8, 13, on ? 0.5 + 0.5 * Math.sin(t * 14) : 0.25); });
      const ej = g.stairs[5]; P.txt(c, '효소', g.stairs[1].x + g.sw - 14, g.stairs[1].y - 12, '#1d6b3a', '700 13px');
      if (respStep >= 0) {
        respT += dt; const per = 0.85;
        if (respStep < 5 && respT > per) { respT = 0; const s = g.stairs[respStep]; for (let i = 0; i < 3; i++) parts.push({ x: s.x + s.w / 2, y: s.y + 10, tx: st.x1 - 46, ty: st.y1 - 50, u: -i * 0.08, life: 0.8, r: 5 }); eResp.push([0.12 + respStep * 0.17, 0.22]); respStep++; if (respStep === 5) { drops.push({ x: ej.x, y: ej.y, u: 0, k: 'co2' }); drops.push({ x: ej.x + 26, y: ej.y + 10, u: -0.2, k: 'h2o' }); resped = true; tables(); steps(); say('다섯 계단을 내려오며 에너지가 <b>조금씩</b> 나와 세포가 쓸 수 있게 모였다. 끝에는 <b>이산화 탄소와 물</b> — 불에 태울 때와 같은 생성물, 나온 에너지 <b>합도 같다</b>.' + (burned ? '' : ' 이번엔 <b>불꽃</b>에 넣어 보자.')); } }
        if (respStep < 5) { const s = g.stairs[respStep], n = g.stairs[respStep + 1], k = ease(clamp(respT / 0.85, 0, 1)); hexa(c, lerp(s.x + s.w / 2 - 6, n.x + n.w / 2 - 6, k * k), lerp(s.y + 4, n.y + 4, k) - Math.sin(k * Math.PI) * 18, 18 * (1 - respStep * 0.12)); }
      } else { const s = g.stairs[0]; c.strokeStyle = 'rgba(29,36,51,.5)'; c.setLineDash([5, 5]); c.lineWidth = 2; c.beginPath(); c.arc(s.x + s.w / 2 - 6, s.y + 4, 22 + Math.sin(t * 4) * 2, 0, TAU); c.stroke(); c.setLineDash([]); P.txt(c, '여기에 놓기', s.x + s.w / 2 - 6, s.y - 28, '#6e1c0e', '700 13px'); }
      // 에너지 모으는 통(세포가 쓰는 에너지)
      const jx = st.x1 - 46, jy = st.y1 - 50, fill = clamp(eResp.length / 5, 0, 1); c.fillStyle = 'rgba(255,255,255,.7)'; c.strokeStyle = '#7a4b38'; c.lineWidth = 2; c.beginPath(); c.roundRect(jx - 20, jy - 40, 40, 70, 8); c.fill(); c.stroke();
      c.fillStyle = '#ffd23a'; c.fillRect(jx - 17, jy + 27 - 64 * fill, 34, 64 * fill); P.txt(c, '쓸 에너지', jx, jy - 48, '#6e1c0e', '700 13px');
      thermo(c, st.x0 + 22, st.y1 - 24, 100, 0.32, '37 ℃');
      miniChart(c, st.x1 - 182, st.y0 + 82, 120, 60, eResp, 1, '#e46a48');
    }
    function miniChart(c, x, y, w, h, bars, k, col) { // 시간에 따른 에너지 방출 + 오른쪽 합 막대
      c.fillStyle = 'rgba(255,255,255,.75)'; c.strokeStyle = '#7a6040'; c.lineWidth = 1.2; c.beginPath(); c.roundRect(x - 6, y - 18, w + 46, h + 34, 8); c.fill(); c.stroke();
      P.txt(c, '나오는 에너지', x + w / 2 - 6, y - 4, '#3a2a14', '700 12px');
      c.strokeStyle = '#3a2a14'; c.beginPath(); c.moveTo(x, y + 2); c.lineTo(x, y + h); c.lineTo(x + w - 10, y + h); c.stroke(); P.txt(c, '시간', x + w - 26, y + h + 13, '#5b6474', '600 11px');
      let sum = 0; bars.forEach(([px, v]) => { const hh = (h - 6) * v * k, xx = x + px * (w - 10); c.fillStyle = col; c.beginPath(); c.roundRect(xx - 5, y + h - hh, 10, hh, 3); c.fill(); sum += v * k; });
      const sx = x + w + 10, tot = Math.min(1, sum) * (h - 6); c.strokeStyle = '#3a2a14'; c.strokeRect(sx, y + 2, 16, h - 2); c.fillStyle = col; c.fillRect(sx + 1, y + h - tot, 14, tot); P.txt(c, '합', sx + 8, y + h + 13, '#3a2a14', '700 11px');
    }
    function tables() {
      const row = (lab, a, b) => `<tr><th>${lab}</th><td>${a}</td><td>${b}</td></tr>`;
      const ana = done.has('link') || done.has('photo'), cat = done.has('starch') || done.has('prot') || done.has('resp');
      const exA = ['link', 'photo'].filter((k) => done.has(k)).map((k) => M[k].sub === '엽록체' ? '광합성' : '단백질 합성').join(', '), exC = ['starch', 'prot', 'resp'].filter((k) => done.has(k)).map((k) => (k === 'resp' ? '세포호흡' : '소화')).filter((v, i, a) => a.indexOf(v) === i).join(', ');
      tabA.innerHTML = row('분자', ana ? '작은 → 큰(합성)' : '', cat ? '큰 → 작은(분해)' : '') + row('에너지', ana ? '<b>흡수</b>' : '', cat ? '<b>방출</b>' : '') + row('예', exA, exC);
      tabB.innerHTML = row('온도', burned ? '400 ℃ 이상(고온)' : '', resped ? '체온(약 37 ℃)' : '') + row('효소', burned ? '관여하지 않음' : '', resped ? '여러 효소가 단계마다' : '') + row('나오는 방식', burned ? '한꺼번에 많이' : '', resped ? '조금씩 단계적으로' : '') + row('생성물', burned ? '이산화 탄소 + 물' : '', resped ? '이산화 탄소 + 물' : '') + (burned && resped ? '<tr><th>에너지 합</th><td colspan="2"><b>같다</b> — 나오는 방식만 다르다</td></tr>' : '<tr><th>에너지 합</th><td></td><td></td></tr>');
    }
    function steps() {
      const ok = [];
      if (done.has('link') || done.has('photo')) ok.push(1);
      if (done.has('starch') || done.has('prot') || done.has('resp')) ok.push(2);
      if (burned && resped) ok.push(3);
      const n = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, n, ok); window.L1.done(root, n === 0);
      chip.textContent = n === 1 ? '① 잇는 반응(아미노산 잇기·광합성) 해 보기' : n === 2 ? '② 쪼개는 반응(녹말·단백질 쪼개기·세포호흡) 해 보기' : n === 3 ? `③ 포도당을 ${burned ? '세포 속 계단에' : resped ? '불꽃에' : '불꽃과 세포 속 계단에'} 넣기` : '✓ 합성은 흡수(동화) · 분해는 방출(이화)';
      chip.classList.toggle('done', n === 0);
    }
    function hitGlu(g, p) { const d = g.dish; return glu.k > 0.9 && Math.hypot(p.x - d.x, p.y - (d.y - 4)) < 36; }
    function nearBond(p) { // 손가락이 지나는 결합(선분까지 거리)
      let bi = -1, bd = 28;
      bonds.forEach((ok, i) => { if (!ok) return; const a = units[i], b = units[i + 1], vx = b.x - a.x, vy = b.y - a.y, L = vx * vx + vy * vy || 1, k = clamp(((p.x - a.x) * vx + (p.y - a.y) * vy) / L, 0, 1), d = Math.hypot(p.x - a.x - vx * k, p.y - a.y - vy * k); if (d < bd) { bd = d; bi = i; } });
      return bi;
    }

    const S = P.make(stage, {
      draw,
      down(p) {
        const g = geo();
        const cd = g.cards.find((q) => p.x > q.x && p.x < q.x + q.w && p.y > q.y && p.y < q.y + q.h); if (cd) { pick(cd.k); return; }
        if (hitGlu(g, p)) { drag = { glu: true, x: p.x, y: p.y }; say('포도당을 들었다. 왼쪽 <b>불꽃</b>이나 오른쪽 세포 속 <b>계단 맨 위</b>에 놓자.'); return; }
        if (!mode) return;
        if (mode === 'link') { const i = units.findIndex((u) => u.free && Math.hypot(p.x - u.x, p.y - u.y) < 26); if (i >= 0) { drag = { unit: i, x: p.x, y: p.y }; return; } }
        if (mode === 'starch' || mode === 'prot') {
          const i = units.findIndex((u) => Math.hypot(p.x - u.x, p.y - u.y) < 22);
          if (i >= 0) { drag = { unit: i, x: p.x, y: p.y, x0: units[i].x, y0: units[i].y }; return; }
          drag = { rub: true, x: p.x, y: p.y }; return;
        }
        if (mode === 'photo' || mode === 'resp') { const j = piles.findIndex((q) => !q.in && Math.hypot(p.x - q.x, p.y - q.y) < 42); if (j >= 0) { drag = { pile: j, x: p.x, y: p.y }; return; } }
      },
      move(p) {
        if (!drag) return;
        const dx = p.x - drag.x, dy = p.y - drag.y; drag.x = p.x; drag.y = p.y;
        if (drag.rub) { const i = nearBond(p); if (i >= 0) { rub[i] += Math.hypot(dx, dy); if (rub[i] >= 140) breakBond(i); } return; }
        if (drag.unit != null && (mode === 'starch' || mode === 'prot')) { const i = drag.unit; units[i].x = p.x; units[i].y = p.y; if (!units[i].free && Math.hypot(p.x - drag.x0, p.y - drag.y0) > 46) { units[i].free = true; if (bonds[i - 1]) breakBond(i - 1); if (bonds[i]) breakBond(i); } }
      },
      up(p) {
        const d = drag; drag = null; if (!d) return; const g = geo();
        if (d.glu) {
          if (p.x < g.fl.x1 && p.y > g.y2) burn();
          else if (p.x > g.st.x0 && p.y > g.y2) { const s = g.stairs[0]; if (Math.hypot(p.x - s.x - s.w / 2, p.y - s.y) < 90) respStart(); else say('세포 속에서는 계단 <b>맨 위</b>(왼쪽 위 칸)에 놓아야 효소가 차례로 일한다.'); }
          else say('포도당을 왼쪽 <b>불꽃</b>이나 오른쪽 <b>계단 맨 위</b>까지 끌어다 놓자.');
          return;
        }
        if (d.unit != null && mode === 'link') { const u = units[d.unit], e = chainPos(chain.length, g); if (Math.hypot(p.x - e[0], p.y - e[1]) < 50) addLink(d.unit); else { u.x = clamp(p.x, g.bx + 24, g.bx + g.bw - 24); u.y = clamp(p.y, g.by + 40, g.by + g.bh - 40); say('사슬 <b>끝의 점선 동그라미</b>에 닿게 놓아야 이어진다.'); } return; }
        if (d.unit != null) { const u = units[d.unit]; if (u.free) { u.x = clamp(p.x, g.bx + 24, g.bx + g.bw - 24); u.y = clamp(p.y, g.by + 40, g.by + g.bh - 30); u.vx = 0; u.vy = 0; } return; }
        if (d.pile != null) { const o = g.org; if (Math.hypot(p.x - o.x, p.y - o.y) < 110) feed(d.pile); else say(`${mode === 'photo' ? '<b>엽록체</b>' : '<b>마이토콘드리아</b>'} 위까지 끌어다 놓자.`); }
      },
      key(e) {
        const i = '12345'.indexOf(e.key); if (i >= 0) { pick(MODES[i]); return true; }
        if (e.key === 'Enter' || e.key === ' ') { act(); return true; }
        if (e.key === '6' || e.key === 'f' || e.key === 'F') { burn(); return true; }
        if (e.key === '7' || e.key === 'r' || e.key === 'R') { respStart(); return true; }
        if (e.key === '0') { reset(); return true; }
        return false;
      },
    });
    function act() {
      if (!mode) { pick('link'); return; }
      if (mode === 'link') { const i = units.findIndex((u) => u.free); if (i >= 0) addLink(i); }
      else if (mode === 'starch' || mode === 'prot') { const i = bonds.findIndex((x) => x); if (i >= 0) breakBond(i); }
      else { const j = piles.findIndex((q) => !q.in); if (j >= 0) feed(j); }
    }
    root.querySelector('.mb-reset').addEventListener('click', () => { reset(); S.kick(); });
    reset();

    root._mb = {
      pick: (k) => { pick(k); S.redraw(); return root._mb.state(); },
      act: () => { act(); S.redraw(); return root._mb.state(); },
      burn: () => { burn(); return root._mb.state(); },
      resp: () => { respStart(); return root._mb.state(); },
      state: () => ({ mode, prog: +prog.toFixed(2), done: [...done], chain: chain.length, bonds: bonds.filter((x) => x).length, piles: piles.map((q) => q.in), react: +react.toFixed(2), burned, resped, respStep, fin: root.classList.contains('u-done'), out: out.textContent, chip: chip.textContent }),
      geo: () => { const g = geo(); return { W: g.W, H: g.H, cards: g.cards, units: units.map((u) => [u.x, u.y, u.free]), chainEnd: mode === 'link' ? chainPos(chain.length, g) : null, piles: piles.map((q) => [q.x, q.y]), org: g.org, dish: g.dish, fl: g.fl, top: [g.stairs[0].x + g.stairs[0].w / 2 - 6, g.stairs[0].y + 4], bench: [g.bx, g.by, g.bw, g.bh] }; },
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Metab = { mount };
})();
