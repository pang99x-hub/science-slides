/* 3-3 4차시 표지 «사람 유전자를 넣은 세균이 왜 사람 인슐린을 만들까?»(사건 파일 24 · 교과서 154쪽 도입 + 157쪽 사고력 + 참고서 유전부호 체계의 공통성과 활용).
   왼쪽: 사람 세포 핵 속 DNA 이중나선, 그 가운데 금색 띠가 인슐린 유전자. 위의 가위를 끌어 금색 띠에 대면 싹둑 잘린다.
   잘린 유전자 조각을 끌어 오른쪽 세균(대장균)의 작은 고리 DNA(플라스미드)에 놓으면 끼워진다(재조합 DNA).
   그 뒤 세균이 둘로, 넷으로… 분열해 늘어나고, 저마다 인슐린 알갱이를 내보내 아래 통에 쌓인다.
   왼쪽 아래 고양이 두 마리(털색·무늬가 다름)는 도입 질문을 떠올리게 하는 장식.
   크기·분열 빠르기·알갱이 수는 이해를 돕기 위한 예.
   키보드: 1 자르기, 2 끼우기, 0 처음부터.
   Insulin.mount(root) → { fit, setActive } · 시험용: root._in.cut() · insert() · run(초) · state() · geo() */
(function () {
  'use strict';
  const TAU = Math.PI * 2, MAXC = 16;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const F = (w, s) => `${w} ${s}px "IBM Plex Sans KR", sans-serif`;
  function txt(c, s, x, y, col, font, al = 'center') { c.fillStyle = col; c.font = font; c.textAlign = al; c.fillText(s, x, y); }
  function tag(c, s, x, y, col, fs = 14, al = 'center') {
    c.font = F(800, fs); const w = c.measureText(s).width + 12, bx = al === 'left' ? x - 6 : al === 'right' ? x - w + 6 : x - w / 2;
    c.fillStyle = 'rgba(255,255,255,.88)'; c.beginPath(); c.roundRect(bx, y - fs - 1, w, fs + 8, 6); c.fill(); txt(c, s, x, y, col, F(800, fs), al);
  }
  // 이중나선 한 토막: x0~x1, 가운데 y, 진폭 a. gold=[u0,u1] 구간은 금색(유전자)
  function helix(c, x0, x1, y, a, ph, gold, lw = 3, alpha = 1) {
    const n = Math.max(8, Math.round((x1 - x0) / 4)), P = 46;
    const at = (i, s) => { const x = lerp(x0, x1, i / n); return { x, y: y + s * a * Math.sin((x - x0) / P * TAU + ph) }; };
    c.save(); c.globalAlpha = alpha;
    for (let i = 0; i <= n; i += 3) { // 염기쌍 가로대
      const p = at(i, 1), q = at(i, -1), u = i / n, g = gold && u >= gold[0] && u <= gold[1];
      c.strokeStyle = g ? 'rgba(214,160,30,.9)' : 'rgba(120,140,190,.75)'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); c.stroke();
    }
    [1, -1].forEach((s) => {
      for (let i = 0; i < n; i++) {
        const p = at(i, s), q = at(i + 1, s), u = (i + 0.5) / n, g = gold && u >= gold[0] && u <= gold[1];
        const front = Math.cos((p.x - x0) / P * TAU + ph) * s > 0;
        c.strokeStyle = g ? (front ? '#f2c230' : '#b98a14') : (front ? '#5a6fc4' : '#3a4688'); c.lineWidth = front ? lw : lw * 0.75;
        c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(q.x, q.y); c.stroke();
      }
    });
    c.restore();
  }
  // 대장균: 둥근 막대, 편모, 큰 고리 염색체, 작은 고리 DNA(플라스미드)
  function bacterium(c, x, y, a, s, t, rec, pinch = 0) {
    c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s);
    const L = 84, R = 34;
    c.strokeStyle = 'rgba(90,70,40,.55)'; c.lineWidth = 1.4;
    for (let k = 0; k < 4; k++) { c.beginPath(); const sx = -L / 2 - R + 6, sy = (k - 1.5) * 12; c.moveTo(sx, sy); for (let i = 1; i <= 12; i++) c.lineTo(sx - i * 6, sy + Math.sin(t * 9 + i * 0.9 + k) * 4 + (k - 1.5) * i * 0.9); c.stroke(); }
    const body = () => {
      c.beginPath();
      if (pinch > 0) { const w = R * (1 - 0.85 * pinch); c.moveTo(-L / 2, -R); c.lineTo(-4, -R); c.quadraticCurveTo(0, -w, 4, -R); c.lineTo(L / 2, -R); c.arc(L / 2, 0, R, -Math.PI / 2, Math.PI / 2); c.lineTo(4, R); c.quadraticCurveTo(0, w, -4, R); c.lineTo(-L / 2, R); c.arc(-L / 2, 0, R, Math.PI / 2, Math.PI * 1.5); }
      else c.roundRect(-L / 2 - R, -R, L + 2 * R, 2 * R, R);
    };
    const g = c.createLinearGradient(0, -R, 0, R); g.addColorStop(0, '#c9e3a6'); g.addColorStop(0.5, '#a7cf7c'); g.addColorStop(1, '#6f9c4c');
    body(); c.fillStyle = g; c.fill(); c.lineWidth = 3; c.strokeStyle = '#4b6e2e'; c.stroke();
    body(); c.save(); c.clip(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-6, -R * 0.55, L * 0.55, R * 0.22, 0, 0, TAU); c.fill();
    for (let i = 0; i < 18; i++) { c.fillStyle = 'rgba(70,100,40,.35)'; c.beginPath(); c.arc(((i * 37) % (L + 40)) - L / 2 - 20, ((i * 23) % 50) - 25, 2, 0, TAU); c.fill(); }
    c.restore();
    // 큰 고리 염색체(엉킨 실)
    c.strokeStyle = '#4a5aa8'; c.lineWidth = 1.6; c.beginPath();
    for (let i = 0; i <= 60; i++) { const th = i / 60 * TAU, r = 16 + 5 * Math.sin(th * 5 + t * 0.6); c.lineTo(-20 + Math.cos(th) * r * 1.5, Math.sin(th) * r * 0.9); } c.closePath(); c.stroke();
    // 플라스미드
    const px = 40, py = 2, pr = 14;
    c.lineWidth = 3.4; c.strokeStyle = '#5a6fc4'; c.beginPath(); c.arc(px, py, pr, 0, TAU); c.stroke();
    if (rec) { c.strokeStyle = '#f2c230'; c.lineWidth = 4.6; c.beginPath(); c.arc(px, py, pr, -2.2, -0.9); c.stroke(); }
    c.restore();
    return { x: x + Math.cos(a) * 40 * s - Math.sin(a) * 2 * s, y: y + Math.sin(a) * 40 * s + Math.cos(a) * 2 * s };
  }
  // 인슐린 알갱이(작은 구슬 셋)
  function grain(c, x, y, r) {
    [[0, -0.6], [-0.55, 0.35], [0.55, 0.35]].forEach(([dx, dy]) => {
      const gx = x + dx * r, gy = y + dy * r, gr = c.createRadialGradient(gx - r * 0.2, gy - r * 0.25, 0.5, gx, gy, r * 0.7);
      gr.addColorStop(0, '#e6fbff'); gr.addColorStop(0.4, '#39b6c9'); gr.addColorStop(1, '#126b7c'); c.fillStyle = gr; c.beginPath(); c.arc(gx, gy, r * 0.62, 0, TAU); c.fill();
    });
  }
  // 앉은 고양이(옆모습 가까운 정면). kind 0: 은빛 줄무늬, 1: 회청색 단색
  function cat(c, x, y, s, t, kind) {
    c.save(); c.translate(x, y); c.scale(s, s);
    const fur = kind ? '#7f8a99' : '#b8ab95', dark = kind ? '#5d6775' : '#5b4c3a', belly = kind ? '#929dab' : '#e2d8c4';
    // 꼬리
    const sw = Math.sin(t * 1.6 + kind * 2);
    c.strokeStyle = dark; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(16, -6); c.bezierCurveTo(40, -2, 44 + sw * 4, -30, 34 + sw * 10, -46); c.stroke();
    c.strokeStyle = fur; c.lineWidth = 6.5; c.stroke();
    if (!kind) { c.strokeStyle = dark; c.lineWidth = 2.5; [0.3, 0.55, 0.8].forEach((u) => { const bx = lerp(30, 34 + sw * 10, u), by = lerp(-8, -46, u); c.beginPath(); c.moveTo(bx - 4, by - 2); c.lineTo(bx + 4, by + 2); c.stroke(); }); }
    // 몸
    let g = c.createRadialGradient(-6, -30, 4, 0, -24, 34); g.addColorStop(0, belly); g.addColorStop(0.6, fur); g.addColorStop(1, dark);
    c.fillStyle = g; c.beginPath(); c.moveTo(-22, 0); c.bezierCurveTo(-26, -30, -14, -50, 0, -50); c.bezierCurveTo(14, -50, 26, -30, 22, 0); c.closePath(); c.fill();
    if (!kind) { c.strokeStyle = 'rgba(60,48,34,.75)'; c.lineWidth = 2.6; for (let i = 0; i < 4; i++) { const yy = -40 + i * 10; c.beginPath(); c.moveTo(-20 + i, yy + 3); c.quadraticCurveTo(-12, yy - 2, -8, yy + 4); c.stroke(); c.beginPath(); c.moveTo(20 - i, yy + 3); c.quadraticCurveTo(12, yy - 2, 8, yy + 4); c.stroke(); } }
    c.fillStyle = belly; c.beginPath(); c.ellipse(-8, -2, 6, 4, 0, 0, TAU); c.ellipse(8, -2, 6, 4, 0, 0, TAU); c.fill();
    // 머리
    const hy = -62, nod = Math.sin(t * 0.9 + kind) * 1.5;
    c.save(); c.translate(0, hy + nod);
    c.fillStyle = dark; [[-1], [1]].forEach(([k]) => { c.beginPath(); c.moveTo(k * 15, -6); c.lineTo(k * 13, -24); c.lineTo(k * 3, -13); c.closePath(); c.fill(); });
    c.fillStyle = '#e9a7a2'; [[-1], [1]].forEach(([k]) => { c.beginPath(); c.moveTo(k * 12, -9); c.lineTo(k * 12, -19); c.lineTo(k * 6, -13); c.closePath(); c.fill(); });
    g = c.createRadialGradient(-4, -6, 2, 0, 0, 19); g.addColorStop(0, belly); g.addColorStop(0.55, fur); g.addColorStop(1, dark);
    c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, 18, 15, 0, 0, TAU); c.fill();
    if (!kind) { c.strokeStyle = 'rgba(60,48,34,.8)'; c.lineWidth = 2; [[-5, -14, -3, -7], [0, -15, 0, -8], [5, -14, 3, -7]].forEach(([a, b, d, e]) => { c.beginPath(); c.moveTo(a, b); c.lineTo(d, e); c.stroke(); }); }
    const blink = (t % 4.3) < 0.14 ? 0.15 : 1;
    [[-7], [7]].forEach(([ex]) => { c.fillStyle = kind ? '#e3b52f' : '#7bab3c'; c.beginPath(); c.ellipse(ex, -1, 3.6, 3.2 * blink, 0, 0, TAU); c.fill(); c.fillStyle = '#111'; c.beginPath(); c.ellipse(ex, -1, 1, 2.6 * blink, 0, 0, TAU); c.fill(); });
    c.fillStyle = '#c9706b'; c.beginPath(); c.moveTo(-2, 5); c.lineTo(2, 5); c.lineTo(0, 7.5); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 0.8; [[-1, 1], [1, 1], [-1, -1], [1, -1]].forEach(([k, m]) => { c.beginPath(); c.moveTo(k * 6, 7); c.lineTo(k * 20, 6 + m * 3); c.stroke(); });
    c.restore(); c.restore();
  }

  function mount(root) {
    const stage = root.querySelector('.in-stage'), chip = root.querySelector('.in-now');
    let t, cut, frag, scis, ins, tIns, cells, grains, inTank, snip, msg, bounce;
    function reset() {
      t = 0; cut = false; ins = false; tIns = -1; cells = []; grains = []; inTank = 0; snip = 0; msg = ''; bounce = 0;
      frag = { x: 0, y: 0, drag: false, home: null, a: 0 }; scis = { x: 0, y: 0, drag: false, home: true, close: 0 };
    }
    reset();
    const say = (h) => { if (h !== msg) { msg = h; chip.innerHTML = h; } };

    function geo(W, H) {
      const cx = W * 0.2, cy = H * 0.5, cr = H * 0.31, nr = cr * 0.66, x0 = cx - nr * 0.86, x1 = cx + nr * 0.86;
      return { W, H, cell: { x: cx, y: cy, r: cr }, nuc: { x: cx, y: cy + 6, r: nr }, dna: { x0, x1, y: cy + 6, u0: 0.45, u1: 0.8 },
        gene: { x: lerp(x0, x1, 0.625), y: cy + 6 }, sHome: { x: cx + cr * 0.85, y: cy - cr * 0.95 },
        fHome: { x: cx + cr * 0.7, y: cy + cr * 0.62 }, bac: { x: W * 0.72, y: H * 0.4 }, box: { x0: W * 0.47, x1: W * 0.985, y0: H * 0.17, y1: H * 0.68 },
        tank: { x0: W * 0.58, x1: W * 0.93, y0: H * 0.72, y1: H * 0.975 } };
    }
    const scisPos = (g) => (scis.home ? { x: g.sHome.x, y: g.sHome.y + Math.sin(t * 2) * 3 } : scis);
    const fragPos = (g) => {
      if (frag.drag) return frag;
      if (!cut) return g.gene;
      const h = frag.home || g.fHome; return { x: h.x, y: h.y + Math.sin(t * 1.8) * 4 };
    };

    function doCut(g) {
      if (cut) return; cut = true; snip = 1; scis.home = true; scis.drag = false;
      frag.home = { x: g.fHome.x, y: g.fHome.y };
    }
    function doInsert(g) {
      if (ins) return; if (!cut) doCut(g);
      ins = true; tIns = t; frag.drag = false; cells[0].rec = true; cells[0].age = -0.8;
    }
    function step(dt, g) {
      t += dt; snip = Math.max(0, snip - dt * 1.6); bounce = Math.max(0, bounce - dt);
      if (!cells.length) cells.push({ x: g.bac.x, y: g.bac.y, a: -0.12, vx: 0, vy: 0, age: 0, rec: false, emit: 1 });
      const n = cells.length, s = clamp(1.25 / Math.sqrt(n), 0.34, 1.25), B = g.box;
      // 분열: 고리 DNA에 사람 유전자가 들어간 뒤부터(나이 3.4초마다 둘로)
      if (ins) for (let i = cells.length - 1; i >= 0; i--) {
        const o = cells[i]; o.age += dt;
        if (o.age > 3.4 && cells.length < MAXC) {
          const d = 40 * s, ca = Math.cos(o.a), sa = Math.sin(o.a);
          cells.push({ x: o.x + ca * d, y: o.y + sa * d, a: o.a + (Math.random() - 0.5) * 0.9, vx: ca * 30, vy: sa * 30, age: Math.random() * 0.6, rec: true, emit: Math.random() });
          o.x -= ca * d; o.y -= sa * d; o.vx = -ca * 30; o.vy = -sa * 30; o.age = Math.random() * 0.6; o.a += (Math.random() - 0.5) * 0.9;
        }
      }
      // 서로 밀어 내고 상자 안에 머문다 · 살짝 헤엄친다
      const rr = 92 * s;
      cells.forEach((o, i) => {
        for (let j = i + 1; j < cells.length; j++) { const p = cells[j], dx = p.x - o.x, dy = p.y - o.y, d = Math.hypot(dx, dy) || 1; if (d < rr) { const f = (rr - d) * 2.2; o.vx -= dx / d * f * dt * 8; o.vy -= dy / d * f * dt * 8; p.vx += dx / d * f * dt * 8; p.vy += dy / d * f * dt * 8; } }
        o.vx += Math.cos(t * 0.7 + i * 1.7) * 6 * dt; o.vy += Math.sin(t * 0.9 + i * 2.3) * 6 * dt;
        o.vx *= 0.9; o.vy *= 0.9; o.x += o.vx * dt; o.y += o.vy * dt; o.a += Math.sin(t * 0.5 + i) * 0.08 * dt;
        const m = 64 * s; o.x = clamp(o.x, B.x0 + m, B.x1 - m); o.y = clamp(o.y, B.y0 + m * 0.6, B.y1 - m * 0.6);
        if (o.rec && t - tIns > 1.2) { o.emit += dt * (0.55 + 0.2 * Math.sin(i)); if (o.emit > 1) { o.emit -= 1; grains.push({ x: o.x, y: o.y + 20 * s, vx: (Math.random() - 0.5) * 30, vy: 10, r: 4 + Math.random() * 1.5, sw: Math.random() * TAU }); } }
      });
      const T = g.tank, tx = (T.x0 + T.x1) / 2;
      for (let i = grains.length - 1; i >= 0; i--) {
        const p = grains[i]; p.vy = Math.min(70, p.vy + 40 * dt); p.vx += ((tx - p.x) * 0.9 - p.vx) * dt; p.x += (p.vx + Math.sin(t * 3 + p.sw) * 10) * dt; p.y += p.vy * dt;
        if (p.y > lerp(T.y1, T.y0 + 8, Math.min(1, inTank / 160)) - 4) { grains.splice(i, 1); inTank++; }
      }
      if (grains.length > 200) grains.splice(0, grains.length - 200);
    }

    function drawScene(c, g) {
      const { W, H } = g;
      let gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2c3448'); gr.addColorStop(1, '#232a3a'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
      // 사람 세포
      const C = g.cell, N = g.nuc;
      gr = c.createRadialGradient(C.x - C.r * 0.3, C.y - C.r * 0.3, C.r * 0.2, C.x, C.y, C.r); gr.addColorStop(0, '#f7dfe0'); gr.addColorStop(0.75, '#efc2c4'); gr.addColorStop(1, '#d99598');
      c.fillStyle = gr; c.beginPath(); for (let i = 0; i <= 80; i++) { const th = i / 80 * TAU, r = C.r * (1 + 0.025 * Math.sin(th * 5 + t * 0.8)); c.lineTo(C.x + Math.cos(th) * r, C.y + Math.sin(th) * r); } c.closePath(); c.fill();
      c.strokeStyle = '#a95a62'; c.lineWidth = 3; c.stroke();
      for (let i = 0; i < 14; i++) { const th = i * 2.4 + t * 0.05, r = C.r * (0.75 + 0.15 * Math.sin(i * 3.1)); c.fillStyle = i % 3 ? 'rgba(200,110,120,.45)' : 'rgba(225,150,80,.6)'; c.beginPath(); c.ellipse(C.x + Math.cos(th) * r, C.y + Math.sin(th) * r, 6, 3.5, th, 0, TAU); c.fill(); }
      gr = c.createRadialGradient(N.x - N.r * 0.3, N.y - N.r * 0.3, 4, N.x, N.y, N.r); gr.addColorStop(0, '#efe4f7'); gr.addColorStop(1, '#c8b2dc');
      c.fillStyle = gr; c.beginPath(); c.arc(N.x, N.y, N.r, 0, TAU); c.fill(); c.strokeStyle = '#7a5f99'; c.lineWidth = 2.5; c.stroke();
      // DNA: 자르기 전엔 한 줄, 자른 뒤엔 금색 자리가 비고 양쪽 끝이 벌어진다
      const D = g.dna, ph = t * 1.4;
      if (!cut) helix(c, D.x0, D.x1, D.y, 11, ph, [D.u0, D.u1]);
      else { helix(c, D.x0, lerp(D.x0, D.x1, D.u0) - 4, D.y, 11, ph, null); helix(c, lerp(D.x0, D.x1, D.u1) + 4, D.x1, D.y, 11, ph, null); }
      tag(c, '사람 세포', C.x, C.y - C.r * 0.74, '#7a2f3a', 15);
      tag(c, '핵 속 DNA', N.x - N.r * 0.3, N.y - N.r * 0.4, '#4a3a6a', 13);
      if (!cut) tag(c, '인슐린 유전자', g.gene.x, D.y + 36, '#8a6206', 13);
      // 고양이 두 마리(장식)
      const cs = H / 440;
      cat(c, W * 0.07, H * 0.985, 0.95 * cs, t, 0); cat(c, W * 0.22, H * 0.985, 1.0 * cs, t, 1);
      // 세균
      const B = g.box; c.fillStyle = 'rgba(255,255,255,.04)'; c.beginPath(); c.roundRect(B.x0, B.y0, B.x1 - B.x0, B.y1 - B.y0, 16); c.fill();
      c.setLineDash([6, 6]); c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1.5; c.stroke(); c.setLineDash([]);
      const n = cells.length, s = clamp(1.25 / Math.sqrt(n), 0.34, 1.25);
      let pl = null;
      cells.forEach((o, i) => { const pin = ins && n < MAXC ? clamp((o.age - 2.6) / 0.8, 0, 1) : 0; const p = bacterium(c, o.x, o.y, o.a, s * (1 + 0.25 * pin), t + i, o.rec, pin); if (i === 0) pl = p; });
      root._pl = pl;
      tag(c, n > 1 ? `대장균 ${n}마리` : '대장균(세균)', B.x0 + 12, B.y0 + 22, '#2f5418', 14, 'left');
      if (pl && n === 1) {
        tag(c, ins ? '재조합 DNA' : '고리 DNA(플라스미드)', pl.x, pl.y + 46 * s, ins ? '#8a6206' : '#2f3f88', 13);
        if (cut && !ins) { const k = 0.5 + 0.5 * Math.sin(t * 5); c.strokeStyle = `rgba(255,216,77,${0.4 + 0.5 * k})`; c.lineWidth = 3; c.beginPath(); c.arc(pl.x, pl.y, 24 + 6 * k, 0, TAU); c.stroke(); }
      }
      // 인슐린 통
      const T = g.tank, lvl = Math.min(1, inTank / 160), ly = lerp(T.y1, T.y0 + 8, lvl);
      c.fillStyle = 'rgba(200,230,240,.12)'; c.beginPath(); c.roundRect(T.x0, T.y0, T.x1 - T.x0, T.y1 - T.y0, [2, 2, 14, 14]); c.fill();
      if (inTank) { c.save(); c.beginPath(); c.roundRect(T.x0, T.y0, T.x1 - T.x0, T.y1 - T.y0, [2, 2, 14, 14]); c.clip();
        gr = c.createLinearGradient(0, ly, 0, T.y1); gr.addColorStop(0, '#5fd0de'); gr.addColorStop(1, '#1e7f93'); c.fillStyle = gr;
        c.beginPath(); c.moveTo(T.x0, T.y1); for (let x = T.x0; x <= T.x1; x += 6) c.lineTo(x, ly + Math.sin(x * 0.08 + t * 3) * 1.6); c.lineTo(T.x1, T.y1); c.fill();
        for (let i = 0; i < Math.min(60, inTank); i++) grain(c, lerp(T.x0 + 10, T.x1 - 10, (i * 0.618) % 1), lerp(T.y1 - 8, ly + 6, ((i * 0.37) % 1)), 3);
        c.restore(); }
      c.strokeStyle = 'rgba(220,240,250,.75)'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(T.x0 - 6, T.y0); c.lineTo(T.x0, T.y0); c.lineTo(T.x0, T.y1 - 14); c.quadraticCurveTo(T.x0, T.y1, T.x0 + 14, T.y1); c.lineTo(T.x1 - 14, T.y1); c.quadraticCurveTo(T.x1, T.y1, T.x1, T.y1 - 14); c.lineTo(T.x1, T.y0); c.lineTo(T.x1 + 6, T.y0); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 4; c.beginPath(); c.moveTo(T.x0 + 8, T.y0 + 8); c.lineTo(T.x0 + 8, T.y1 - 18); c.stroke();
      txt(c, inTank ? `모은 인슐린 ${inTank}` : '인슐린 통', (T.x0 + T.x1) / 2, T.y0 - 6, '#ffd84d', F(800, 15));
      grains.forEach((p) => grain(c, p.x, p.y, p.r));
      // 잘라 낸 유전자 조각
      if (cut && !ins) {
        const f = fragPos(g), L = (D.x1 - D.x0) * (D.u1 - D.u0);
        c.save(); c.translate(f.x, f.y); c.rotate(frag.drag ? Math.sin(t * 6) * 0.06 : Math.sin(t * 1.3) * 0.15);
        if (frag.drag) { c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 12; c.shadowOffsetY = 6; }
        helix(c, -L / 2, L / 2, 0, 10, ph, [0, 1], 3.4); c.restore();
        if (!frag.drag) tag(c, '인슐린 유전자', f.x, f.y + 30, '#8a6206', 13);
      }
      // 가위
      if (!ins) { const p = scisPos(g); scissors(c, p.x, p.y, Math.max(snip, scis.close), cut && scis.home ? 0.35 : 1); }
    }
    function scissors(c, x, y, close, alpha) {
      c.save(); c.globalAlpha = alpha; c.translate(x, y); c.rotate(0.6);
      const op = 0.42 * (1 - close);
      [1, -1].forEach((k) => {
        c.save(); c.rotate(k * op);
        const g = c.createLinearGradient(0, -4, 0, 4); g.addColorStop(0, '#f3f6fa'); g.addColorStop(1, '#8d97a6');
        c.fillStyle = g; c.strokeStyle = '#4b5361'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, 0); c.lineTo(34, -k * 2); c.lineTo(36, 0); c.lineTo(0, k * 4); c.closePath(); c.fill(); c.stroke();
        c.strokeStyle = k > 0 ? '#d9483b' : '#2a73b8'; c.lineWidth = 5; c.beginPath(); c.ellipse(-16, k * 7, 9, 6, 0, 0, TAU); c.stroke();
        c.restore();
      });
      c.fillStyle = '#4b5361'; c.beginPath(); c.arc(0, 0, 2.6, 0, TAU); c.fill();
      c.restore();
      if (alpha === 1 && !scis.drag && !cut) txt(c, '가위', x - 4, y + 34, '#ffd84d', F(800, 14));
    }

    function draw(c, W, H, dt) {
      const g = geo(W, H);
      step(dt, g); c.clearRect(0, 0, W, H); drawScene(c, g);
      const n = cells.length;
      if (bounce > 0) say('먼저 <b>가위</b>로 인슐린 유전자를 잘라 내자');
      else if (!cut) say('<b>가위</b>를 끌어 사람 DNA의 <b>금색 띠</b>(인슐린 유전자)에 대 보자');
      else if (!ins) say('잘라 낸 유전자를 끌어 세균의 <b>작은 고리 DNA</b>에 놓자');
      else if (n < 4 && inTank < 3) say('세균이 사람 유전자를 <b>읽기</b> 시작했다…');
      else if (inTank < 40) say(`세균이 <b>분열</b>해 늘어나며 <b>인슐린</b>을 내보낸다 — 사람 몸에서 만드는 것과 <b>같은</b> 단백질`);
      else say('세균은 사람의 유전자를 <b>사람과 같은 규칙</b>으로 읽었다 — 왜 그럴까?');
    }

    const near = (p, q, r) => Math.hypot(p.x - q.x, p.y - q.y) < r;
    const S = window.Play.make(stage, {
      draw,
      down(p) {
        const g = geo(S.W, S.H);
        if (!ins && !cut && near(p, scisPos(g), 38)) { scis.home = false; scis.drag = true; scis.x = p.x; scis.y = p.y; return; }
        if (cut && !ins && near(p, fragPos(g), 44)) { frag.drag = true; frag.x = p.x; frag.y = p.y; return; }
        if (!cut && near(p, g.gene, 40)) bounce = 2;
      },
      move(p) {
        const g = geo(S.W, S.H);
        if (scis.drag) { scis.x = clamp(p.x, 10, S.W - 10); scis.y = clamp(p.y, 10, S.H - 10); scis.close = near(scis, g.gene, 60) ? 0.6 : 0; if (near(scis, g.gene, 30)) doCut(g); }
        if (frag.drag) { frag.x = clamp(p.x, 10, S.W - 10); frag.y = clamp(p.y, 10, S.H - 10); }
      },
      up() {
        const g = geo(S.W, S.H);
        if (scis.drag) { scis.drag = false; scis.home = true; scis.close = 0; }
        if (frag.drag) { frag.drag = false; if (root._pl && near(frag, root._pl, 60)) doInsert(g); else frag.home = { x: clamp(frag.x, 20, S.W * 0.5), y: clamp(frag.y, 20, S.H - 20) }; }
      },
      key(e) {
        const g = geo(S.W, S.H), k = e.key;
        if (k === '1') { doCut(g); return true; }
        if (k === '2') { doInsert(g); return true; }
        if (k === '0') { reset(); return true; }
        return false;
      },
    });
    const state = () => ({ cut, ins, cells: cells.length, rec: cells.filter((o) => o.rec).length, inTank, grains: grains.length, msg });
    root._in = {
      cut: () => { doCut(geo(S.W, S.H)); S.kick(); return state(); },
      insert: () => { doInsert(geo(S.W, S.H)); S.kick(); return state(); },
      run: (sec) => { const g = geo(S.W, S.H); for (let i = 0; i < sec * 60; i++) step(1 / 60, g); S.kick(); return state(); },
      geo: () => { const g = geo(S.W, S.H); return { gene: g.gene, sHome: g.sHome, fHome: g.fHome, pl: root._pl, W: S.W, H: S.H }; },
      state, reset: () => { reset(); S.kick(); },
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Insulin = { mount };
})();
