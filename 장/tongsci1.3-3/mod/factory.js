/* 3-3 1차시 체험 «세포 공장»(교과서 144쪽 그림 Ⅲ-28 + 참고서 세포소기관·단백질의 합성과 이동·소기관 맞히기 문제).
   (가) 오른쪽 소기관 카드(핵·라이보솜·소포체·골지체·마이토콘드리아·세포막)를 끌어 동물 세포 단면의 빈 자리(점선 윤곽 + 단서)에 놓는다.
        맞으면 그 자리가 살아 움직이고(핵에서 정보가 나감, 소포체 속 흐름, 골지체에서 소낭, 마이토콘드리아 반짝임, 세포막 흐름), 틀리면 까닭.
   (나) 다 놓으면 핵에서 «주문서»(DNA의 정보)가 라이보솜으로 가고, 단백질 «택배»가 생긴다. 택배를 끌어 정해진 길(라이보솜 → 소포체 → 골지체 → 세포막 → 밖)로 옮긴다.
        길에서 벗어나면 마지막으로 지난 곳으로 되돌아간다. 지나는 곳마다 합성 · 운반 · 포장 · 분비 한 줄.
   마이토콘드리아를 누르면 에너지가 공장 전체로 퍼진다(움직임이 빨라짐).
   ① 소기관을 제자리에 놓는다 ② 단백질을 세포 밖까지 배달한다 ③ 에너지를 공급한다.
   Factory.mount(root) → { fit, setActive } · 시험용: root._fc.place(카드, 자리) · carry(끝 비율) · energize() · state() · geo() */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const ORDER = ['nuc', 'ribo', 'er', 'golgi', 'mito', 'mem'];
  const ORG = {
    nuc: { name: '핵', clue: 'DNA 보관 · 생명활동 지휘', shape: '이중 막(핵막)에 싸인 가장 큰 공 모양', look: '핵막에 싸인 큰 공', job: 'DNA의 정보로 생명활동 조절', mem: '있음' },
    ribo: { name: '라이보솜', clue: '아미노산을 잇는 알갱이', shape: '막 없이 작은 알갱이로, 소포체에 붙거나 세포질에 떠 있다', look: '막 없는 작은 알갱이', job: '아미노산을 이어 단백질 합성', mem: '없음' },
    er: { name: '소포체', clue: '핵막에 이어진 통로', shape: '핵막에 이어진 납작한 주머니와 관', look: '납작한 주머니·관', job: '단백질을 골지체 등으로 운반', mem: '있음' },
    golgi: { name: '골지체', clue: '겹겹이 쌓인 납작 주머니', shape: '얇고 납작한 주머니 몇 장이 겹쳐 쌓인 모양', look: '납작 주머니가 겹겹이', job: '단백질을 막으로 싸서 분비', mem: '있음' },
    mito: { name: '마이토콘드리아', clue: '안쪽이 주름진 막대', shape: '둥근 막대 모양이고 안쪽 막이 주름져 있다', look: '안쪽이 주름진 둥근 막대', job: '세포호흡으로 에너지 생산', mem: '있음' },
    mem: { name: '세포막', clue: '세포 안팎의 경계', shape: '세포 전체를 감싼 얇은 막(인지질과 단백질)', look: '세포를 감싼 얇은 막', job: '안팎의 물질 출입 조절', mem: '막 자체' },
  };
  const jo = (w, a, b) => w + ((w.charCodeAt(w.length - 1) - 0xAC00) % 28 ? a : b);
  const lerp = (a, b, k) => a + (b - a) * k;
  let sd = 11; const rnd = () => ((sd = (sd * 9301 + 49297) % 233280) / 233280);
  const SPECK = Array.from({ length: 170 }, () => { const a = rnd() * TAU, r = Math.sqrt(rnd()) * 0.93; return [Math.cos(a) * r, Math.sin(a) * r, 0.8 + rnd() * 1.8, rnd()]; });
  const CHROM = Array.from({ length: 14 }, () => [rnd() * TAU, rnd() * 0.75, rnd() * TAU, 0.25 + rnd() * 0.3]);

  function mount(root) {
    const stage = root.querySelector('.fc-stage'), chip = root.querySelector('.fc-now'), out = root.querySelector('.fc-out'), tab = root.querySelector('.fc-tab tbody');
    const P = window.Play;
    let placed, drag, ph, s, cp, hold, delivered, energy, tapped, clock, msg, parts, glyphs, buds, flash, ordT, pkgT, gone, shake, hover;

    function reset() {
      placed = {}; drag = null; ph = 'place'; s = 0; cp = 0; hold = false; delivered = 0; energy = 0; tapped = false; clock = 0;
      parts = []; glyphs = []; buds = []; flash = {}; ordT = 0; pkgT = 0; gone = []; shake = null; hover = null;
      say('오른쪽 <b>소기관 카드</b>를 하나 끌어 세포 단면의 <b>빈 자리</b>(점선)에 놓자. 점선 모양과 단서를 보고 고른다.');
      table(); steps();
    }
    const say = (t) => { if (t !== msg) { msg = t; out.innerHTML = t; } };

    // ── 자리 잡기 ──
    function geo() {
      const W = S.W, H = S.H, cw = 200, colX = W - cw - 12, inner = W - cw - 36;
      const cx = Math.round(inner * 0.5) + 8, cy = Math.round(H * 0.55), rx = Math.round(inner * 0.47), ry = Math.round(H * 0.395);
      const nr = Math.round(ry * 0.33), nx = Math.round(cx - rx * 0.42), ny = Math.round(cy + ry * 0.03);
      const rb = { x: Math.round(nx + (nr + 70) * Math.cos(-0.98)), y: Math.round(ny + (nr + 70) * Math.sin(-0.98)) };
      const gx = Math.round(cx + rx * 0.33), gy = Math.round(cy - ry * 0.12), gw = Math.round(rx * 0.33), gh = Math.round(ry * 0.36);
      const mx = Math.round(cx + rx * 0.15), my = Math.round(cy + ry * 0.6), ml = Math.round(rx * 0.38), mw = Math.round(ry * 0.21);
      const ma = -0.12, ex = Math.round(cx + rx * Math.cos(ma)), ey = Math.round(cy + ry * Math.sin(ma));
      const slots = {
        nuc: { x: nx, y: ny, r: nr + 6 }, ribo: { x: rb.x, y: rb.y, r: 34 }, er: { x: Math.round(nx + (nr + 36) * Math.cos(0.15)), y: Math.round(ny + (nr + 36) * Math.sin(0.15)), r: 52 },
        golgi: { x: gx, y: gy, r: Math.max(gw, gh) * 0.62 }, mito: { x: mx, y: my, r: ml * 0.55 }, mem: { x: ex, y: ey, r: 40 },
      };
      const n = ORDER.length, ch = Math.floor((H - 70) / n) - 8;
      const cards = ORDER.map((k, i) => ({ k, x: colX, y: 58 + i * (ch + 8), w: cw, h: ch }));
      return { W, H, cx, cy, rx, ry, nx, ny, nr, gx, gy, gw, gh, mx, my, ml, mw, ex, ey, ma, slots, cards, colX };
    }
    // 단백질이 다니는 길(라이보솜 → 소포체 → 골지체 → 세포막 → 밖): 촘촘한 점 + 들르는 곳 번호
    let pathKey = '', path = null;
    function route(g) {
      const key = g.W + 'x' + g.H; if (key === pathKey) return path;
      const pts = [], mark = {};
      const seg = (x0, y0, x1, y1) => { const L = Math.hypot(x1 - x0, y1 - y0), n = Math.max(1, Math.round(L / 3)); for (let i = 1; i <= n; i++) pts.push([lerp(x0, x1, i / n), lerp(y0, y1, i / n)]); };
      const bez = (x0, y0, x1, y1, x2, y2, x3, y3) => { for (let i = 1; i <= 60; i++) { const t = i / 60, u = 1 - t; pts.push([u * u * u * x0 + 3 * u * u * t * x1 + 3 * u * t * t * x2 + t * t * t * x3, u * u * u * y0 + 3 * u * u * t * y1 + 3 * u * t * t * y2 + t * t * t * y3]); } };
      const R = g.nr + 34, a0 = -0.82, a1 = 0.62;
      pts.push([g.slots.ribo.x, g.slots.ribo.y]); mark.ribo = 0;
      seg(g.slots.ribo.x, g.slots.ribo.y, g.nx + R * Math.cos(a0), g.ny + R * Math.sin(a0)); mark.er = pts.length - 1;
      for (let a = a0; a <= a1; a += 0.02) pts.push([g.nx + R * Math.cos(a), g.ny + R * Math.sin(a)]);
      mark.erEnd = pts.length - 1;
      const e = pts[pts.length - 1], gi = [g.gx - g.gw * 0.62, g.gy + g.gh * 0.12];
      bez(e[0], e[1], e[0] + 60, e[1] + 10, gi[0] - 50, gi[1] + 30, gi[0], gi[1]); mark.golgi = pts.length - 1;
      seg(gi[0], gi[1], g.gx + g.gw * 0.62, g.gy - g.gh * 0.05); mark.golgiOut = pts.length - 1;
      const go = pts[pts.length - 1];
      bez(go[0], go[1], go[0] + 60, go[1] - 20, g.ex - 70, g.ey, g.ex, g.ey); mark.mem = pts.length - 1;
      seg(g.ex, g.ey, g.ex + 92, g.ey - 8); mark.out = pts.length - 1;
      pathKey = key; path = { pts, mark };
      return path;
    }
    const STOPS = ['ribo', 'er', 'golgi', 'golgiOut', 'mem', 'out'];

    // ── 그림 ──
    function nucleus(c, x, y, r, t, live) {
      const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
      g.addColorStop(0, '#d9c8f7'); g.addColorStop(0.55, '#9a7bd8'); g.addColorStop(1, '#5d3f9f');
      c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(60,35,110,.5)'; c.lineWidth = Math.max(1, r * 0.018);
      CHROM.forEach(([a, d, ph0, L]) => { const px = x + Math.cos(a) * d * r, py = y + Math.sin(a) * d * r; c.beginPath(); for (let i = 0; i <= 8; i++) { const q = ph0 + i * 0.5 + (live ? Math.sin(t * 0.8 + a) * 0.15 : 0); const xx = px + Math.cos(q) * L * r * 0.35 * (i / 8), yy = py + Math.sin(q * 1.3) * L * r * 0.3 * (i / 8); i ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke(); });
      const ng = c.createRadialGradient(x + r * 0.08, y + r * 0.05, 1, x + r * 0.12, y + r * 0.1, r * 0.32);
      ng.addColorStop(0, '#5a3a9c'); ng.addColorStop(1, '#2d1764'); c.fillStyle = ng; c.beginPath(); c.arc(x + r * 0.12, y + r * 0.1, r * 0.3 * (live ? 1 + Math.sin(t * 2) * 0.03 : 1), 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(x - r * 0.4, y - r * 0.45, r * 0.22, r * 0.12, -0.6, 0, TAU); c.fill();
      // 핵막 두 겹 + 핵공
      c.strokeStyle = '#3b2672'; c.lineWidth = Math.max(1.5, r * 0.04); c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke();
      c.strokeStyle = 'rgba(230,215,255,.7)'; c.lineWidth = Math.max(1, r * 0.015); c.beginPath(); c.arc(x, y, r * 0.93, 0, TAU); c.stroke();
      c.fillStyle = '#efe6ff'; for (let i = 0; i < 14; i++) { const a = i / 14 * TAU + 0.2; c.beginPath(); c.ellipse(x + Math.cos(a) * r * 0.965, y + Math.sin(a) * r * 0.965, r * 0.035, r * 0.018, a, 0, TAU); c.fill(); }
    }
    function erBands(c, nx, ny, nr, t, live, ribo, sp) {
      for (let k = 0; k < 3; k++) {
        const R = nr + 16 + k * 18, a0 = -1.12 + k * 0.05, a1 = 1.0 - k * 0.04;
        const arc = () => { c.beginPath(); for (let a = a0; a <= a1 + 1e-6; a += 0.03) { const rr = R + Math.sin(a * 11 + k * 1.7) * 2.6; const xx = nx + rr * Math.cos(a), yy = ny + rr * Math.sin(a); a === a0 ? c.moveTo(xx, yy) : c.lineTo(xx, yy); } };
        c.lineCap = 'round'; c.lineJoin = 'round';
        arc(); c.strokeStyle = '#2d6aa5'; c.lineWidth = 14; c.stroke();
        arc(); c.strokeStyle = '#9cc8ee'; c.lineWidth = 10; c.stroke();
        arc(); c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 2.5; c.stroke();
        if (live) { c.fillStyle = 'rgba(255,255,255,.9)'; for (let j = 0; j < 4; j++) { const a = a0 + (((t * 0.12 * sp + j / 4 + k * 0.13) % 1) * (a1 - a0)); c.beginPath(); c.arc(nx + R * Math.cos(a), ny + R * Math.sin(a), 2.2, 0, TAU); c.fill(); } }
        if (ribo) { c.fillStyle = '#26337a'; for (let a = a0 + 0.04; a <= a1; a += 0.085) { const rr = R + 7 + Math.sin(a * 11 + k * 1.7) * 2.6; c.beginPath(); c.arc(nx + rr * Math.cos(a), ny + rr * Math.sin(a), 2.4, 0, TAU); c.fill(); } }
      }
      c.lineCap = 'butt';
    }
    function ribosome(c, x, y, rr, t, live) {
      const j = live ? Math.sin(t * 6 + x) * 1.2 : 0;
      const g = c.createRadialGradient(x - rr * 0.3, y - rr * 0.3 + j, 1, x, y + j, rr); g.addColorStop(0, '#7f8fe0'); g.addColorStop(1, '#25317a');
      c.fillStyle = g; c.beginPath(); c.arc(x, y + j, rr, 0, TAU); c.fill();
      const g2 = c.createRadialGradient(x + rr * 0.4, y - rr * 0.7 + j, 1, x + rr * 0.5, y - rr * 0.6 + j, rr * 0.7); g2.addColorStop(0, '#a9b4f2'); g2.addColorStop(1, '#3a48a0');
      c.fillStyle = g2; c.beginPath(); c.arc(x + rr * 0.5, y - rr * 0.6 + j, rr * 0.68, 0, TAU); c.fill();
    }
    function riboCluster(c, x, y, t, live, k = 1) { [[0, 0], [-18, 10], [16, 12], [-6, -16], [20, -12], [-22, -8]].forEach(([a, b]) => ribosome(c, x + a * k, y + b * k, 6.5 * k, t, live)); }
    function golgi(c, x, y, w, h, t, live) {
      for (let i = 0; i < 5; i++) {
        const yy = y - h * 0.42 + i * h * 0.21, ww = w * (0.82 + i * 0.05) * (live ? 1 + Math.sin(t * 1.4 + i) * 0.015 : 1), bow = h * 0.22, th = h * 0.1;
        c.beginPath(); c.moveTo(x - ww / 2, yy); c.quadraticCurveTo(x, yy - bow, x + ww / 2, yy);
        c.arc(x + ww / 2, yy + th / 2, th / 2 + 1.5, -Math.PI / 2, Math.PI / 2); c.quadraticCurveTo(x, yy - bow + th, x - ww / 2, yy + th);
        c.arc(x - ww / 2, yy + th / 2, th / 2 + 1.5, Math.PI / 2, Math.PI * 1.5); c.closePath();
        const g = c.createLinearGradient(0, yy - bow, 0, yy + th); g.addColorStop(0, '#ffd98a'); g.addColorStop(1, '#e08b2b');
        c.fillStyle = g; c.fill(); c.strokeStyle = '#94500f'; c.lineWidth = 1.6; c.stroke();
      }
      c.fillStyle = '#f2b04e'; c.strokeStyle = '#94500f'; c.lineWidth = 1.2;
      [[-0.62, -0.5], [0.6, -0.42], [0.66, 0.38], [-0.58, 0.45]].forEach(([a, b], i) => { const bb = live ? Math.sin(t * 2 + i) * 2 : 0; c.beginPath(); c.arc(x + a * w + bb, y + b * h, h * 0.065, 0, TAU); c.fill(); c.stroke(); });
    }
    function mito(c, x, y, L, Wd, ang, t, glow) {
      c.save(); c.translate(x, y); c.rotate(ang);
      if (glow > 0) { c.globalAlpha = Math.min(1, glow); P.glow(c, 0, 0, L * 0.8, 'rgba(255,210,80,.55)'); c.globalAlpha = 1; }
      const g = c.createLinearGradient(0, -Wd / 2, 0, Wd / 2); g.addColorStop(0, '#ffb08f'); g.addColorStop(0.5, '#e46a48'); g.addColorStop(1, '#a8321c');
      c.fillStyle = g; c.beginPath(); c.roundRect(-L / 2, -Wd / 2, L, Wd, Wd / 2); c.fill(); c.strokeStyle = '#6e1c0e'; c.lineWidth = 2; c.stroke();
      c.fillStyle = '#f7b9a2'; c.beginPath(); c.roundRect(-L / 2 + 5, -Wd / 2 + 5, L - 10, Wd - 10, Wd / 2 - 5); c.fill();
      c.strokeStyle = '#b8432a'; c.lineWidth = 2.6; c.lineJoin = 'round'; c.beginPath();
      const n = Math.max(3, Math.round(L / 16)), x0 = -L / 2 + Wd * 0.45, x1 = L / 2 - Wd * 0.45;
      for (let i = 0; i <= n; i++) { const xx = lerp(x0, x1, i / n), up = i % 2 ? 1 : -1; c.lineTo(xx, up * (Wd / 2 - 6)); c.lineTo(xx + (x1 - x0) / n * 0.5, 0); }
      c.stroke();
      c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-L * 0.12, -Wd * 0.3, L * 0.26, Wd * 0.08, 0, 0, TAU); c.fill();
      c.restore();
    }
    function membrane(c, cx, cy, rx, ry, t, live, sp) {
      const per = TAU * Math.sqrt((rx * rx + ry * ry) / 2), n = Math.round(per / 9), off = live ? (t * 0.004 * sp) % (1 / n) : 0;
      c.strokeStyle = 'rgba(150,80,50,.55)'; c.lineWidth = 1.2;
      for (let i = 0; i < n; i++) { const a = (i / n + off) * TAU, ca = Math.cos(a), sa = Math.sin(a); c.beginPath(); c.moveTo(cx + (rx + 6) * ca, cy + (ry + 6) * sa); c.lineTo(cx + (rx + 1) * ca, cy + (ry + 1) * sa); c.moveTo(cx + (rx - 6) * ca, cy + (ry - 6) * sa); c.lineTo(cx + (rx - 1) * ca, cy + (ry - 1) * sa); c.stroke(); }
      c.fillStyle = '#d9785a';
      for (let i = 0; i < n; i++) { const a = (i / n + off) * TAU, ca = Math.cos(a), sa = Math.sin(a); c.beginPath(); c.arc(cx + (rx + 7) * ca, cy + (ry + 7) * sa, 2.6, 0, TAU); c.arc(cx + (rx - 7) * ca, cy + (ry - 7) * sa, 2.6, 0, TAU); c.fill(); }
      // 막단백질 몇 개
      c.fillStyle = '#7d5bb5'; [0.3, 1.4, 2.5, 3.6, 4.6, 5.6].forEach((a0) => { const a = a0 + off * TAU; c.save(); c.translate(cx + rx * Math.cos(a), cy + ry * Math.sin(a)); c.rotate(a); c.beginPath(); c.ellipse(0, 0, 11, 6, 0, 0, TAU); c.fill(); c.restore(); });
    }
    function scroll(c, x, y, k = 1) { // 주문서(정보)
      c.save(); c.translate(x, y); c.scale(k, k);
      c.fillStyle = '#fffaf0'; c.strokeStyle = '#5d3f9f'; c.lineWidth = 2; c.beginPath(); c.roundRect(-16, -11, 32, 22, 4); c.fill(); c.stroke();
      c.strokeStyle = '#9a7bd8'; c.lineWidth = 2; [-4, 1, 6].forEach((yy) => { c.beginPath(); c.moveTo(-10, yy); c.lineTo(10, yy); c.stroke(); });
      c.fillStyle = '#5d3f9f'; c.beginPath(); c.arc(-16, -11, 4, 0, TAU); c.arc(16, 11, 4, 0, TAU); c.fill(); c.restore();
    }
    const AA = ['#e4574a', '#f2a53a', '#4cae5b', '#3c8fd6', '#9a62c9', '#e05fa1'];
    function protein(c, x, y, t, k = 1, wrap = 0) {
      if (wrap > 0) { c.fillStyle = `rgba(255,224,170,${0.55 * wrap})`; c.strokeStyle = `rgba(148,80,15,${wrap})`; c.lineWidth = 2.4; c.beginPath(); c.arc(x, y, 26 * k, 0, TAU); c.fill(); c.stroke(); }
      for (let i = 0; i < 6; i++) { const a = i * 1.1 + Math.sin(t * 2) * 0.12, r = (4 + i * 2.2) * k; const px = x + Math.cos(a) * r - 4 * k, py = y + Math.sin(a) * r * 0.8; if (i) { const q = (i - 1) * 1.1 + Math.sin(t * 2) * 0.12, r2 = (4 + (i - 1) * 2.2) * k; c.strokeStyle = '#4a3a2a'; c.lineWidth = 2 * k; c.beginPath(); c.moveTo(x + Math.cos(q) * r2 - 4 * k, y + Math.sin(q) * r2 * 0.8); c.lineTo(px, py); c.stroke(); } c.fillStyle = AA[i]; c.beginPath(); c.arc(px, py, 5 * k, 0, TAU); c.fill(); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1; c.stroke(); }
    }
    function pill(c, x, y, t, bg, fg = '#fff', f = '700 16px') {
      c.font = `${f} "IBM Plex Sans KR", sans-serif`; const w = c.measureText(t).width + 18;
      const x0 = Math.max(4, Math.min(S.W - w - 4, x - w / 2));
      c.fillStyle = bg; c.beginPath(); c.roundRect(x0, y - 15, w, 26, 13); c.fill(); P.txt(c, t, x0 + w / 2, y + 4, fg, f);
    }
    const spd = () => 1 + energy * 1.6;

    function drawOrg(c, k, g, live) {
      const t = clock;
      if (k === 'nuc') nucleus(c, g.nx, g.ny, g.nr, t, live);
      else if (k === 'er') erBands(c, g.nx, g.ny, g.nr, t, live, !!placed.ribo, spd());
      else if (k === 'ribo') riboCluster(c, g.slots.ribo.x, g.slots.ribo.y, t * spd(), live);
      else if (k === 'golgi') golgi(c, g.gx, g.gy, g.gw, g.gh, t * spd(), live);
      else if (k === 'mito') { const gl = (flash.mito || 0) + energy * 0.6 + (0.25 + 0.25 * Math.sin(t * 3)); mito(c, g.mx, g.my, g.ml, g.mw, -0.25, t, gl); mito(c, g.cx - g.rx * 0.62, g.cy + g.ry * 0.55, g.ml * 0.72, g.mw * 0.85, 0.5, t, gl * 0.6); mito(c, g.cx + g.rx * 0.06, g.cy - g.ry * 0.7, g.ml * 0.62, g.mw * 0.8, -0.05, t, gl * 0.6); }
    }
    function emptySlot(c, k, g, hi) {
      const sl = g.slots[k];
      c.save(); c.setLineDash([9, 7]); c.lineWidth = 3; c.strokeStyle = hi ? '#c99a00' : 'rgba(70,80,95,.55)'; c.fillStyle = hi ? 'rgba(255,214,0,.25)' : 'rgba(255,255,255,.3)';
      if (k === 'nuc') { c.beginPath(); c.arc(g.nx, g.ny, g.nr, 0, TAU); c.fill(); c.stroke(); }
      else if (k === 'ribo') { c.beginPath(); c.arc(sl.x, sl.y, 26, 0, TAU); c.fill(); c.stroke(); c.setLineDash([]); c.fillStyle = 'rgba(70,80,95,.35)'; [[0, 0], [-12, 7], [11, 8], [-4, -11], [13, -8]].forEach(([a, b]) => { c.beginPath(); c.arc(sl.x + a, sl.y + b, 4, 0, TAU); c.fill(); }); }
      else if (k === 'er') { for (let j = 0; j < 3; j++) { const R = g.nr + 16 + j * 18; c.beginPath(); c.arc(g.nx, g.ny, R, -1.12, 1.0); c.stroke(); } if (hi) { c.beginPath(); c.arc(g.nx, g.ny, g.nr + 70, -1.12, 1.0); c.arc(g.nx, g.ny, g.nr + 8, 1.0, -1.12, true); c.fill(); } }
      else if (k === 'golgi') { for (let i = 0; i < 4; i++) { const yy = g.gy - g.gh * 0.36 + i * g.gh * 0.24, ww = g.gw * (0.82 + i * 0.05); c.beginPath(); c.moveTo(g.gx - ww / 2, yy); c.quadraticCurveTo(g.gx, yy - g.gh * 0.22, g.gx + ww / 2, yy); c.stroke(); } }
      else if (k === 'mito') { c.save(); c.translate(g.mx, g.my); c.rotate(-0.25); c.beginPath(); c.roundRect(-g.ml / 2, -g.mw / 2, g.ml, g.mw, g.mw / 2); c.fill(); c.stroke(); c.restore(); }
      else if (k === 'mem') { c.strokeStyle = hi ? '#c99a00' : 'rgba(70,80,95,.6)'; c.beginPath(); c.ellipse(g.cx, g.cy, g.rx, g.ry, 0, 0, TAU); c.stroke(); }
      c.restore();
      if (k !== 'mem') P.txt(c, '?', sl.x, sl.y + 10, hi ? '#8a6a00' : 'rgba(60,70,85,.6)', '800 28px');
    }
    const tagPos = (k, g) => ({ nuc: [g.nx - g.nr * 0.55, g.ny - g.nr - 16], ribo: [g.slots.ribo.x - 6, g.slots.ribo.y - 44], er: [g.nx + g.nr + 46, g.ny + g.nr + 34], golgi: [g.gx, g.gy - g.gh * 0.7], mito: [g.mx, g.my + g.mw + 12], mem: [g.cx + g.rx * 0.55, g.cy + g.ry * 0.98 + 16] })[k];

    function draw(c, W, H, dt) {
      clock += dt; const g = geo(), t = clock, sp = spd();
      energy = Math.max(0, energy - dt * 0.07); Object.keys(flash).forEach((k) => { flash[k] = Math.max(0, flash[k] - dt * 1.6); });
      // 바깥(세포 밖 액체)
      const bg = c.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#e6f1f2'); bg.addColorStop(1, '#d3e6e8'); c.fillStyle = bg; c.fillRect(0, 0, W, H);
      c.fillStyle = 'rgba(80,140,150,.12)'; for (let i = 0; i < 40; i++) { const xx = (i * 97.3 + t * 6) % W, yy = (i * 53.7 + Math.sin(t * 0.5 + i) * 6) % H; c.beginPath(); c.arc(xx, yy, 2 + (i % 3), 0, TAU); c.fill(); }
      // 세포질
      c.save(); c.beginPath(); c.ellipse(g.cx, g.cy, g.rx, g.ry, 0, 0, TAU); c.clip();
      const cg = c.createRadialGradient(g.cx - g.rx * 0.2, g.cy - g.ry * 0.25, 10, g.cx, g.cy, g.rx * 1.05);
      cg.addColorStop(0, energy > 0.02 ? `rgb(255,${238 - energy * 6 | 0},${214 - energy * 40 | 0})` : '#ffeedd'); cg.addColorStop(0.7, '#f8cdb5'); cg.addColorStop(1, '#eda98c');
      c.fillStyle = cg; c.fillRect(g.cx - g.rx, g.cy - g.ry, g.rx * 2, g.ry * 2);
      SPECK.forEach(([a, b, r, p]) => { c.fillStyle = `rgba(160,80,60,${0.12 + p * 0.12})`; c.beginPath(); c.arc(g.cx + a * g.rx + Math.sin(t * 0.6 * sp + p * 9) * 2, g.cy + b * g.ry + Math.cos(t * 0.5 * sp + p * 7) * 2, r, 0, TAU); c.fill(); });
      c.strokeStyle = 'rgba(170,100,80,.18)'; c.lineWidth = 1.2; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(g.cx - g.rx + i * g.rx * 0.25, g.cy - g.ry); c.bezierCurveTo(g.cx - g.rx * 0.5 + i * 30, g.cy - 40, g.cx + i * 20 - 100, g.cy + 60, g.cx - g.rx * 0.6 + i * g.rx * 0.22, g.cy + g.ry); c.stroke(); }
      c.restore();
      // 소기관(놓인 것은 살아 움직이고, 빈 자리는 점선)
      const dragK = drag && drag.card;
      ['er', 'nuc', 'golgi', 'mito', 'ribo'].forEach((k) => { if (placed[k]) drawOrg(c, k, g, true); else emptySlot(c, k, g, dragK && hover === k); });
      if (placed.mem) membrane(c, g.cx, g.cy, g.rx, g.ry, t, true, sp); else emptySlot(c, 'mem', g, dragK && hover === 'mem');
      // 맞힌 자리 반짝
      ORDER.forEach((k) => { if (flash[k] > 0 && k !== 'mito') { const sl = g.slots[k]; c.globalAlpha = Math.min(1, flash[k]); P.glow(c, sl.x, sl.y, sl.r * 1.5, 'rgba(255,230,90,.6)'); c.globalAlpha = 1; } });
      // 핵에서 나가는 정보, 골지체 소낭
      if (placed.nuc && Math.random() < dt * 0.7 * sp) { const a = -0.9 + Math.random() * 1.8; glyphs.push({ x: g.nx + g.nr * Math.cos(a), y: g.ny + g.nr * Math.sin(a), a, u: 0 }); }
      glyphs = glyphs.filter((q) => (q.u += dt * 0.5 * sp) < 1);
      glyphs.forEach((q) => { const tx = placed.ribo ? g.slots.ribo.x : g.nx + (g.nr + 90) * Math.cos(q.a), ty = placed.ribo ? g.slots.ribo.y : g.ny + (g.nr + 90) * Math.sin(q.a); c.globalAlpha = Math.sin(q.u * Math.PI); c.strokeStyle = '#7a52c7'; c.lineWidth = 2.4; c.beginPath(); const xx = lerp(q.x, tx, q.u), yy = lerp(q.y, ty, q.u); for (let i = 0; i < 6; i++) { const px = xx - 9 + i * 3.6, py = yy + Math.sin(i * 1.6 + t * 8) * 3; i ? c.lineTo(px, py) : c.moveTo(px, py); } c.stroke(); c.globalAlpha = 1; });
      if (placed.golgi && Math.random() < dt * 0.6 * sp) buds.push({ x: g.gx + g.gw * 0.6, y: g.gy + (Math.random() - 0.5) * g.gh * 0.6, u: 0 });
      buds = buds.filter((q) => (q.u += dt * 0.28 * sp) < 1);
      buds.forEach((q) => { const xx = lerp(q.x, g.ex - 8, q.u), yy = lerp(q.y, g.ey + (q.y - g.gy) * 1.5, q.u); c.globalAlpha = q.u > 0.85 ? (1 - q.u) / 0.15 : 1; c.fillStyle = '#ffd98a'; c.strokeStyle = '#94500f'; c.lineWidth = 1.4; c.beginPath(); c.arc(xx, yy, 6, 0, TAU); c.fill(); c.stroke(); c.globalAlpha = 1; });
      if (placed.mito && Math.random() < dt * 3 * (0.5 + energy)) parts.push({ x: g.mx + (Math.random() - 0.5) * g.ml * 0.8, y: g.my + (Math.random() - 0.5) * g.mw, tx: null, u: 0, life: 0.6 });
      // 이름표·단서
      ORDER.forEach((k) => { const [x, y] = tagPos(k, g); if (placed[k]) pill(c, x, y, ORG[k].name, 'rgba(29,36,51,.82)', '#fff', '700 16px'); else pill(c, x, y, ORG[k].clue, 'rgba(255,255,255,.92)', '#3a4250', '600 15px'); });
      // 주문서 → 라이보솜 → 택배
      if (ph === 'order') {
        ordT += dt / 1.5; const a = -0.98, x0 = g.nx + g.nr * Math.cos(a), y0 = g.ny + g.nr * Math.sin(a), k = Math.min(1, ordT);
        if (k < 1) scroll(c, lerp(x0, g.slots.ribo.x, k), lerp(y0, g.slots.ribo.y, k) - Math.sin(k * Math.PI) * 30, 1 + Math.sin(k * Math.PI) * 0.2);
        else { pkgT += dt / 1.0; const m = Math.min(1, pkgT); for (let i = 0; i < 6; i++) { const ang = i / 6 * TAU + t; c.fillStyle = AA[i]; c.beginPath(); c.arc(lerp(g.slots.ribo.x + Math.cos(ang) * 60, g.slots.ribo.x, m), lerp(g.slots.ribo.y + Math.sin(ang) * 60, g.slots.ribo.y, m), 5, 0, TAU); c.fill(); } if (m >= 1) { ph = 'carry'; s = 0; cp = 0; say(`라이보솜이 주문서대로 아미노산을 이어 단백질을 만들었다 — <b>합성</b>. ${delivered ? '새' : '이제'} <b>택배</b>(단백질)를 잡고 점선 길을 따라 끌자.${delivered && !tapped ? ' <b>마이토콘드리아를 눌러</b> 에너지도 보내 보자.' : ''}`); steps(); } }
      }
      if (ph === 'carry' || ph === 'out') {
        const R = route(g), pts = R.pts;
        c.save(); c.setLineDash([3, 9]); c.lineCap = 'round'; c.lineWidth = 5; c.strokeStyle = 'rgba(29,36,51,.35)'; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
        c.setLineDash([]); c.strokeStyle = 'rgba(47,158,91,.75)'; c.lineWidth = 6; c.beginPath(); for (let i = 0; i <= Math.min(s, pts.length - 1); i++) { const [x, y] = pts[i]; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.restore();
        // 들르는 곳 표시
        [['er', '운반'], ['golgi', '포장'], ['mem', '분비']].forEach(([k, w]) => { const [x, y] = pts[R.mark[k]]; c.fillStyle = s >= R.mark[k] ? '#2f9e5b' : '#fff'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 7, 0, TAU); c.fill(); c.stroke(); void w; });
        if (ph === 'carry') {
          const i = Math.min(Math.round(s), pts.length - 1), [x, y] = pts[i], wrap = Math.max(0, Math.min(1, (s - R.mark.golgi) / Math.max(1, R.mark.golgiOut - R.mark.golgi)));
          P.glow(c, x, y, 44, 'rgba(255,230,90,.55)');
          protein(c, x, y, t, 1.25, wrap);
          if (!hold) { c.strokeStyle = 'rgba(29,36,51,.55)'; c.lineWidth = 2; c.setLineDash([4, 4]); c.beginPath(); c.arc(x, y, 32 + Math.sin(t * 4) * 3, 0, TAU); c.stroke(); c.setLineDash([]); }
          if (shake) { shake.u += dt; if (shake.u > 0.5) shake = null; }
        }
      }
      // 세포 밖으로 나간 단백질
      gone = gone.filter((q) => (q.u += dt * 0.12) < 1);
      gone.forEach((q) => { c.globalAlpha = q.u > 0.7 ? (1 - q.u) / 0.3 : 1; protein(c, q.x + q.u * 60, q.y + Math.sin(q.u * 9) * 10 - q.u * 40, t, 1.05); c.globalAlpha = 1; });
      // 에너지 알갱이
      parts = parts.filter((q) => (q.u += dt / q.life) < 1);
      parts.forEach((q) => { let x = q.x, y = q.y; if (q.tx != null) { const e = 1 - (1 - q.u) * (1 - q.u); x = lerp(q.x, q.tx, e); y = lerp(q.y, q.ty, e) - Math.sin(q.u * Math.PI) * 20; } c.globalAlpha = q.tx != null ? 1 - q.u * 0.4 : Math.sin(q.u * Math.PI); star(c, x, y, q.tx != null ? 7 : 4, t * 5 + q.x); c.globalAlpha = 1; if (q.tx != null && q.u > 0.95 && q.k) flash[q.k] = Math.max(flash[q.k] || 0, 0.8); });
      // 오른쪽: 카드 칸 / 세포 밖
      if (ph === 'place') {
        P.txt(c, '소기관 카드', g.colX + 100, 42, '#1d2433', '800 19px');
        g.cards.forEach((cd) => { if (placed[cd.k] || (drag && drag.card === cd.k)) { c.save(); c.setLineDash([6, 6]); c.strokeStyle = 'rgba(29,36,51,.3)'; c.lineWidth = 2; c.beginPath(); c.roundRect(cd.x, cd.y, cd.w, cd.h, 10); c.stroke(); c.restore(); if (placed[cd.k]) P.txt(c, ORG[cd.k].name + ' ✓', cd.x + cd.w / 2, cd.y + cd.h / 2 + 7, '#2f9e5b', '700 17px'); return; } card(c, cd.k, cd.x, cd.y, cd.w, cd.h, shake && shake.k === cd.k ? Math.sin(shake.u * 40) * 6 * (1 - shake.u * 2) : 0); });
      } else { P.txt(c, '세포 밖', g.colX + 100, 42, '#2a6f7a', '800 22px'); P.txt(c, `배달한 단백질 ${delivered}개`, g.colX + 100, 70, '#2a6f7a', '600 16px'); }
      if (drag && drag.card) card(c, drag.card, drag.x - 100, drag.y - 34, 200, Math.min(76, g.cards[0].h), 0, true);
      if (shake && shake.k) { shake.u += dt; if (shake.u > 0.5) shake = null; }
    }
    function star(c, x, y, r, a) {
      c.save(); c.translate(x, y); c.rotate(a); c.fillStyle = '#ffd23a'; c.strokeStyle = '#c47a00'; c.lineWidth = 1; c.beginPath();
      for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * 0.4 : r; c.lineTo(Math.cos(i * Math.PI / 4) * rr, Math.sin(i * Math.PI / 4) * rr); } c.closePath(); c.fill(); c.stroke(); c.restore();
    }
    function card(c, k, x, y, w, h, dx = 0, lifted = false) {
      x += dx; c.save(); c.shadowColor = 'rgba(29,36,51,.28)'; c.shadowBlur = lifted ? 16 : 0; c.shadowOffsetY = lifted ? 8 : 0;
      c.fillStyle = '#fffdf7'; c.beginPath(); c.roundRect(x, y, w, h, 10); c.fill(); c.restore();
      c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.roundRect(x, y, w, h, 10); c.stroke();
      if (!lifted) { c.fillStyle = '#1d2433'; c.beginPath(); c.roundRect(x + 2, y + h - 2, w - 4, 4, 2); c.fill(); }
      const ix = x + 40, iy = y + h / 2, sc = Math.min(1, h / 74);
      c.save(); c.beginPath(); c.roundRect(x + 4, y + 4, 72, h - 8, 8); c.clip(); c.fillStyle = '#fbe3d4'; c.fillRect(x + 4, y + 4, 72, h - 8);
      if (k === 'nuc') nucleus(c, ix, iy, 26 * sc, clock, false);
      else if (k === 'ribo') riboCluster(c, ix, iy + 2, clock, false, 0.9 * sc);
      else if (k === 'er') erBands(c, ix - 46 * sc, iy, 14 * sc, clock, false, false, 1);
      else if (k === 'golgi') golgi(c, ix, iy + 4, 56 * sc, 44 * sc, clock, false);
      else if (k === 'mito') mito(c, ix, iy, 62 * sc, 28 * sc, -0.3, clock, 0);
      else if (k === 'mem') { c.save(); c.translate(ix - 40, iy - 90); membrane(c, 40, 90, 70, 78, 0, false, 1); c.restore(); }
      c.restore();
      const nm = ORG[k].name; P.txt(c, nm, x + 80 + (w - 84) / 2, iy + 7, '#1d2433', nm.length > 5 ? '800 16px' : '800 20px');
    }

    // ── 조작 ──
    function slotAt(g, p) {
      for (const k of ['ribo', 'golgi', 'mito', 'nuc']) { const sl = g.slots[k]; if (Math.hypot(p.x - sl.x, p.y - sl.y) < sl.r) return k; }
      const d = Math.hypot(p.x - g.nx, p.y - g.ny), a = Math.atan2(p.y - g.ny, p.x - g.nx);
      if (d > g.nr && d < g.nr + 76 && a > -1.2 && a < 1.1) return 'er';
      const e = Math.hypot((p.x - g.cx) / g.rx, (p.y - g.cy) / g.ry);
      if (Math.abs(e - 1) * Math.min(g.rx, g.ry) < 34) return 'mem';
      return null;
    }
    function place(k, at) {
      if (placed[k]) return true;
      if (at !== k) {
        const sl = ORG[at];
        say(`<b>${ORG[k].name}</b> 자리가 아니다. ${jo(ORG[k].name, '은', '는')} ${ORG[k].shape}. 이 자리는 «${sl.clue}» — 모양과 하는 일을 다시 보자.`);
        shake = { k, u: 0 }; return false;
      }
      placed[k] = true; flash[k] = 1.4;
      const lines = {
        nuc: '<b>핵</b> 자리! 핵막 안 DNA에 단백질을 만드는 정보가 들어 있다. 핵에서 정보가 흘러나가기 시작한다.',
        ribo: '<b>라이보솜</b> 자리! 막이 없는 알갱이로, 정보에 따라 아미노산을 이어 단백질을 만든다. 소포체 겉에도 붙는다.',
        er: '<b>소포체</b> 자리! 핵막과 이어진 납작한 주머니·관으로, 만든 단백질을 골지체 쪽으로 나르는 통로다.',
        golgi: '<b>골지체</b> 자리! 받은 단백질을 다듬고 막으로 싸서 작은 주머니(소낭)로 내보낸다.',
        mito: '<b>마이토콘드리아</b> 자리! 산소로 양분을 분해해 생명활동에 쓸 에너지를 만든다(세포호흡). 반짝임이 그 에너지다.',
        mem: '<b>세포막</b> 자리! 인지질과 단백질로 된 얇은 막이 세포를 감싸 안팎을 나누고 드나드는 물질을 고른다.',
      };
      say(lines[k]);
      if (ORDER.every((q) => placed[q])) {
        ph = 'order'; ordT = 0; pkgT = 0;
        say('공장이 다 갖춰졌다. 핵이 <b>주문서</b>(DNA에 담긴 단백질 정보)를 라이보솜으로 보낸다…');
      }
      table(); steps(); return true;
    }
    function advance(to) { // 택배를 길 위 to까지(검사점 통과 문장)
      const R = route(geo()), m = R.mark; const prev = s; s = Math.max(s, Math.min(to, R.pts.length - 1));
      const cross = (k) => prev < m[k] && s >= m[k];
      if (cross('er')) { cp = m.er; say('소포체로 들어왔다 — <b>운반</b>. 핵막과 이어진 통로를 따라 골지체 쪽으로 옮긴다.'); energyUse(); }
      if (cross('golgi')) { cp = m.golgi; say('골지체에 닿았다 — <b>포장</b>. 단백질을 다듬어 막으로 싼다. 골지체를 지나가 보자.'); energyUse(); }
      if (cross('golgiOut')) { cp = m.golgiOut; say('막에 싸인 작은 주머니(<b>소낭</b>)가 되었다. 세포막까지 끌고 가자.'); }
      if (cross('mem')) { cp = m.mem; say('소낭이 세포막과 합쳐진다 — <b>분비</b>. 한 번 더 끌어 세포 밖으로!'); energyUse(); }
      if (s >= m.out) {
        delivered++; const [x, y] = R.pts[m.out]; gone.push({ x, y, u: 0 });
        say(`세포 밖으로 <b>분비</b>했다(${delivered}개째). 핵의 정보 → 라이보솜 <b>합성</b> → 소포체 <b>운반</b> → 골지체 <b>포장</b> → 세포막 <b>분비</b>. ${tapped ? '' : '이번엔 <b>마이토콘드리아를 눌러</b> 에너지를 보내 보자.'}`);
        ph = 'order'; ordT = 1; pkgT = 0; s = 0; cp = 0; hold = false; drag = null;
        if (delivered === 1) { ph = 'order'; ordT = 0; }
        steps();
      }
    }
    function energyUse() { /* 지날 때마다 에너지가 쓰인다는 연출: 반짝이 하나 */ const g = geo(), R = route(g), [x, y] = R.pts[Math.min(Math.round(s), R.pts.length - 1)]; if (placed.mito) parts.push({ x: g.mx, y: g.my, tx: x, ty: y, u: 0, life: 0.7 }); }
    function snapBack() { s = cp; hold = false; drag = null; say('길에서 벗어나 <b>마지막으로 지난 곳</b>으로 되돌아갔다. 점선 길을 따라 천천히 끌자.'); }
    function energize() {
      if (!placed.mito) { say('먼저 <b>마이토콘드리아</b> 카드를 제자리에 놓자.'); return; }
      const g = geo(); tapped = true; energy = 1; flash.mito = 1.5;
      const tg = ORDER.filter((k) => k !== 'mito' && placed[k]).map((k) => [g.slots[k].x, g.slots[k].y, k]);
      for (let i = 0; i < 30; i++) { const [x, y, k] = i < tg.length * 3 ? tg[i % tg.length] : [g.cx + (Math.random() - 0.5) * g.rx * 1.5, g.cy + (Math.random() - 0.5) * g.ry * 1.4, null]; parts.push({ x: g.mx, y: g.my, tx: x + (Math.random() - 0.5) * 30, ty: y + (Math.random() - 0.5) * 30, u: -Math.random() * 0.6, life: 1.1, k }); }
      say('마이토콘드리아가 산소로 양분(포도당 등)을 분해해 <b>에너지</b>를 냈다(세포호흡). 에너지가 핵·라이보솜·소포체·골지체로 퍼져 공장이 빨라진다 — 단백질 합성·운반·분비에도 에너지가 든다.');
      steps();
    }
    function table() {
      tab.innerHTML = ORDER.map((k) => placed[k] ? `<tr class="ok"><td>${ORG[k].name}</td><td>${ORG[k].look}</td><td>${ORG[k].job}</td><td>${ORG[k].mem}</td></tr>` : `<tr><td>?</td><td></td><td>${ORG[k].clue}</td><td></td></tr>`).join('');
    }
    function steps() {
      const ok = [];
      if (ORDER.every((k) => placed[k])) ok.push(1);
      if (delivered > 0) ok.push(2);
      if (tapped) ok.push(3);
      const n = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, n, ok); window.L1.done(root, n === 0);
      const left = ORDER.filter((k) => !placed[k]).length;
      chip.textContent = n === 1 ? `① 카드를 끌어 빈 자리에 놓기 (${6 - left}/6)` : n === 2 ? (ph === 'carry' ? '② 택배를 끌어 점선 길 따라 세포 밖으로' : '② 핵의 주문서를 기다리는 중…') : n === 3 ? '③ 마이토콘드리아를 눌러 에너지 보내기' : '✓ 핵의 정보 → 합성 → 운반 → 포장 → 분비';
      chip.classList.toggle('done', n === 0);
    }

    const S = P.make(stage, {
      draw,
      down(p) {
        const g = geo();
        if (ph === 'place') { const cd = g.cards.find((q) => !placed[q.k] && p.x > q.x && p.x < q.x + q.w && p.y > q.y && p.y < q.y + q.h); if (cd) { drag = { card: cd.k, x: p.x, y: p.y, x0: p.x, y0: p.y }; return; } }
        if (ph === 'carry') { const R = route(g), [x, y] = R.pts[Math.min(Math.round(s), R.pts.length - 1)]; if (Math.hypot(p.x - x, p.y - y) < 42) { hold = true; drag = { pkg: true }; return; } }
        if (placed.mito && Math.hypot(p.x - g.mx, p.y - g.my) < g.ml * 0.6) { energize(); return; }
        if (ph === 'carry') say('반짝이는 <b>택배</b>(단백질)를 눌러 잡고 점선을 따라 끌자.');
        else if (ph === 'place') say('오른쪽 <b>카드</b>를 잡아 세포 속 빈 자리로 끌자.');
      },
      move(p) {
        if (!drag) return;
        const g = geo();
        if (drag.card) { drag.x = p.x; drag.y = p.y; hover = slotAt(g, p); return; }
        if (drag.pkg) {
          const R = route(g), pts = R.pts; let best = -1, bd = 1e9;
          for (let i = Math.max(0, Math.round(s) - 15); i < Math.min(pts.length, Math.round(s) + 40); i++) { const d = Math.hypot(pts[i][0] - p.x, pts[i][1] - p.y); if (d < bd) { bd = d; best = i; } }
          if (bd > 50) { snapBack(); return; }
          if (best > s) advance(best);
        }
      },
      up(p) {
        const d = drag; drag = null; hover = null; if (!d) return; const g = geo();
        if (d.card) { const moved = Math.hypot(p.x - d.x0, p.y - d.y0) > 12, at = slotAt(g, p); if (!moved) { say(`<b>${ORG[d.card].name}</b> 카드 — ${ORG[d.card].shape}. 끌어서 알맞은 빈 자리에 놓자.`); return; } if (at) place(d.card, at); else say('카드를 세포 안의 <b>점선 자리</b>까지 끌어다 놓자.'); return; }
        if (d.pkg) { hold = false; if (ph === 'carry' && s > cp) say(msg); }
      },
      key(e) {
        const i = '123456'.indexOf(e.key);
        if (i >= 0) { if (ph === 'place') place(ORDER[i], ORDER[i]); return true; }
        if (e.key === 'Enter' || e.key === 'ArrowRight' || e.key === ' ') { if (ph === 'carry') { const R = route(geo()), m = R.mark; const nx = STOPS.map((k) => m[k]).find((v) => v > s); advance(nx == null ? m.out : nx); } return true; }
        if (e.key === 'e' || e.key === 'E' || e.key === '7') { energize(); return true; }
        if (e.key === '0') { reset(); return true; }
        return false;
      },
    });
    root.querySelector('.fc-reset').addEventListener('click', () => { reset(); S.kick(); });
    reset();

    root._fc = {
      place: (k, at) => { const r = place(k, at || k); S.redraw(); return r; },
      finishOrder: () => { if (ph === 'order') { ordT = 1; pkgT = 1; S.redraw(); } return ph; },
      carry: (f = 1) => { if (ph !== 'carry') return ph; const R = route(geo()); advance(Math.round(f * R.mark.out)); S.redraw(); return root._fc.state(); },
      energize: () => { energize(); return root._fc.state(); },
      state: () => ({ placed: Object.keys(placed), ph, s, cp, delivered, tapped, done: root.classList.contains('u-done'), out: out.textContent, chip: chip.textContent }),
      geo: () => { const g = geo(), R = route(g); return { W: g.W, H: g.H, slots: g.slots, cards: g.cards, mito: { x: g.mx, y: g.my }, path: R.pts.filter((_, i) => i % 6 === 0 || i === R.pts.length - 1), mark: R.mark, pkg: R.pts[Math.min(Math.round(s), R.pts.length - 1)] }; },
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Factory = { mount };
})();
