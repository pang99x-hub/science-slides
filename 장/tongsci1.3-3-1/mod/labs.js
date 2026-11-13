/* 3-3 늘린 장(2026-11-13)의 손 조작 그림 모음. 장마다 캔버스 하나 + 아래 단추 줄(data-act) + 오른쪽 해 볼 일 ①②③.
   Labs.mount(root, 종류) → { fit, setActive } · 단추: [data-act] 누르기, 숫자 키 1~9 = 단추 차례, 0 = 처음부터
   종류: temp(온도와 효소) ph(효소와 pH) chew(밥 오래 씹기) fair(공정한 실험 설계) ink(찬물·더운물 확산) kidney(인공 신장)
         potato(감자 조각과 설탕물) zoom(세포 속 유전자) genes(DNA에서 유전자 찾기) fold(아미노산 순서와 모양) sickle(헤모글로빈 유전자)
         dnarna(DNA와 RNA) copies(전사로 늘리는 정보) cells(같은 DNA 다른 세포) frame(읽는 틀) wheel(코돈표 바퀴) glow(해파리 빛 유전자)
   시험용: root._lab.set({ 상태… , run: 틱 수 }) · root._lab.act('이름') · 수치는 이해를 돕기 위한 예 */
(function () {
  'use strict';
  const TAU = Math.PI * 2, INK = '#1d2433', YEL = '#ffd84d', DIM = '#5d6577', RED = '#ff7a5c', BLU = '#5aa9f0', GRN = '#7fd66b', PUR = '#b48cf0', FONT = '"IBM Plex Sans KR", sans-serif';
  const THEME = { dark: false }, ADAPT = new Map();
  // 밝은 바탕용 색 바꾸기: 밝은 글자·선 색은 같은 색조의 어두운 색으로(흰색 '#fff'은 그대로, 어두운 바탕 그림에서는 THEME.dark = true)
  function adapt(col) {
    if (THEME.dark || typeof col !== 'string' || col === '#fff' || col === '#ffffff') return col;
    if (ADAPT.has(col)) return ADAPT.get(col);
    let r, g, b, a = 1, m;
    if ((m = col.match(/^#([0-9a-f]{3})$/i))) [r, g, b] = [...m[1]].map((h) => parseInt(h + h, 16));
    else if ((m = col.match(/^#([0-9a-f]{6})([0-9a-f]{2})?$/i))) { [r, g, b] = [0, 2, 4].map((k) => parseInt(m[1].slice(k, k + 2), 16)); if (m[2]) a = parseInt(m[2], 16) / 255; }
    else if ((m = col.match(/^rgba?\(([^)]+)\)$/))) { const q = m[1].split(',').map(Number); [r, g, b] = q; if (q.length > 3) a = q[3]; }
    else { ADAPT.set(col, col); return col; }
    const L = (0.299 * r + 0.587 * g + 0.114 * b) / 255; let out = col;
    if (L > 0.6) { const k = 0.42; out = a < 0.3 ? `rgba(70,64,52,${(a * 1.6).toFixed(2)})` : `rgba(${Math.round(r * k)},${Math.round(g * k)},${Math.round(b * k)},${Math.max(a, 0.6).toFixed(2)})`; }
    ADAPT.set(col, out); return out;
  }
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), ease = (u) => u * u * (3 - 2 * u), lerp = (a, b, u) => a + (b - a) * u;
  const line = (c, x0, y0, x1, y1, col, w, dash) => { c.strokeStyle = adapt(col); c.lineWidth = w; c.setLineDash(dash || []); c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.setLineDash([]); };
  const rr = (c, x, y, w, h, r, fill, stroke, lw) => { c.beginPath(); c.roundRect(x, y, w, h, r); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = adapt(stroke); c.lineWidth = lw || 1.5; c.stroke(); } };
  const circ = (c, x, y, r, fill, stroke, lw) => { c.beginPath(); c.arc(x, y, Math.max(0.1, r), 0, TAU); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = adapt(stroke); c.lineWidth = lw || 1.5; c.stroke(); } };
  const lin = (c, x0, y0, x1, y1, stops) => { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); return g; };
  const rad = (c, x, y, r, stops) => { const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.06, x, y, r * 1.05); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); return g; };
  const txt = (c, t, x, y, col = INK, f = '700 16px', al = 'center') => { c.font = `${f} ${FONT}`; c.fillStyle = adapt(col); c.textAlign = al; c.fillText(t, x, y); };
  function pill(c, x, y, t, bg, fg = '#1d2433', f = '700 15px') { c.font = `${f} ${FONT}`; const w = c.measureText(t).width + 20; rr(c, x - w / 2, y - 14, w, 28, 14, bg); c.fillStyle = fg; c.textAlign = 'center'; c.fillText(t, x, y + 5.5); return w; }
  function arrow(c, x0, y0, x1, y1, col, w = 3) { const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0); if (L < 2) return; line(c, x0, y0, x1 - Math.cos(a) * w * 2, y1 - Math.sin(a) * w * 2, col, w); c.fillStyle = col; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - Math.cos(a - 0.45) * w * 4, y1 - Math.sin(a - 0.45) * w * 4); c.lineTo(x1 - Math.cos(a + 0.45) * w * 4, y1 - Math.sin(a + 0.45) * w * 4); c.fill(); }
  const ball = (c, x, y, r, hue, a = 1) => { c.globalAlpha = a; circ(c, x, y, r, rad(c, x, y, r, [`hsl(${hue},90%,82%)`, `hsl(${hue},70%,55%)`, `hsl(${hue},70%,28%)`])); c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(x - r * 0.35, y - r * 0.42, r * 0.25, r * 0.15, -0.6, 0, TAU); c.fill(); c.globalAlpha = 1; };
  function bg(c, W, H, tint = 'rgba(90,120,200,.16)') {
    // 기존 3-3 체험 장과 같은 밝은 교과서풍 바탕: 미색 종이 + 옅은 모눈 + 옅은 색 번짐
    THEME.dark = false; c.fillStyle = lin(c, 0, 0, 0, H, ['#fbf8f0', '#f5efe2', '#efe7d6']); c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(120,110,90,.07)'; c.lineWidth = 1; c.beginPath(); for (let x = 0; x < W; x += 24) { c.moveTo(x, 0); c.lineTo(x, H); } for (let y = 0; y < H; y += 24) { c.moveTo(0, y); c.lineTo(W, y); } c.stroke();
    const g = c.createRadialGradient(W * 0.5, H * 0.4, 10, W * 0.5, H * 0.4, W * 0.75); g.addColorStop(0, tint.replace(/,[.\d]+\)$/, ',.10)')); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  }
  // 그래프 틀: 축·눈금·이름. 돌려주는 함수로 값 → 화면 좌표
  function graph(c, x, y, w, h, xr, yr, xl, yl, ticks) {
    rr(c, x - 52, y - 30, w + 70, h + 72, 12, 'rgba(255,255,255,.75)', 'rgba(90,100,120,.3)', 1);
    const X = (v) => x + (v - xr[0]) / (xr[1] - xr[0]) * w, Y = (v) => y + h - (v - yr[0]) / (yr[1] - yr[0]) * h;
    (ticks || []).forEach((v) => { line(c, X(v), y, X(v), y + h, 'rgba(185,194,216,.12)', 1); txt(c, String(v), X(v), y + h + 18, DIM, '600 12px'); });
    line(c, x, y + h, x + w, y + h, DIM, 2); line(c, x, y, x, y + h, DIM, 2);
    txt(c, xl, x + w, y + h + 36, INK, '700 13px', 'right'); c.save(); c.translate(x - 30, y + h / 2); c.rotate(-Math.PI / 2); txt(c, yl, 0, 0, INK, '700 13px'); c.restore();
    return { X, Y };
  }
  // 효소(오목한 자리가 있는 단백질). un: 0 정상 → 1 흐트러짐(변성)
  function enzyme(c, x, y, r, rot, un, col = '#7fc4ff') {
    c.save(); c.translate(x, y); c.rotate(rot); c.beginPath();
    for (let i = 0; i <= 40; i++) { const a = i / 40 * TAU, notch = un < 0.5 && Math.cos(a) > 0.82 ? (1 - un * 2) * 0.45 * (Math.cos(a) - 0.82) / 0.18 : 0, wob = un * 0.28 * Math.sin(a * 5 + rot * 3), R = r * (1 - notch + wob); c.lineTo(Math.cos(a) * R, Math.sin(a) * R * 0.86); }
    c.closePath(); c.fillStyle = rad(c, 0, 0, r, ['#e9f5ff', col, '#1f4f86']); c.fill(); c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1.5; c.stroke(); c.restore();
  }
  // 유리 비커
  function beaker(c, x, y, w, h, fill, lv = 0.75) {
    c.save(); c.beginPath(); c.roundRect(x, y, w, h, [2, 2, 10, 10]); c.clip();
    c.fillStyle = fill; c.fillRect(x, y + h * (1 - lv), w, h * lv); line(c, x, y + h * (1 - lv), x + w, y + h * (1 - lv), 'rgba(255,255,255,.45)', 1.5); c.restore();
    c.beginPath(); c.moveTo(x - 4, y); c.lineTo(x, y + 4); c.lineTo(x, y + h - 10); c.quadraticCurveTo(x, y + h, x + 10, y + h); c.lineTo(x + w - 10, y + h); c.quadraticCurveTo(x + w, y + h, x + w, y + h - 10); c.lineTo(x + w, y + 4); c.lineTo(x + w + 4, y);
    c.strokeStyle = 'rgba(220,232,255,.85)'; c.lineWidth = 2.2; c.stroke(); rr(c, x + 6, y + 10, 4, h - 26, 2, 'rgba(255,255,255,.22)');
  }
  const shadow = (c, x, y, w, a = 0.35) => { c.fillStyle = `rgba(0,0,0,${a})`; c.beginPath(); c.ellipse(x, y, w, w * 0.18, 0, 0, TAU); c.fill(); };
  const BASE = { A: '#f2a541', T: '#ef6f5b', U: '#e86a8a', G: '#5fbf6a', C: '#4f9be0' };
  const PAIR = { A: 'T', T: 'A', G: 'C', C: 'G' };
  function baseBox(c, x, y, s, ch, al = 1) { c.globalAlpha = al; rr(c, x, y, s - 3, s - 3, 5, lin(c, 0, y, 0, y + s, [BASE[ch], BASE[ch] + 'aa'])); txt(c, ch, x + (s - 3) / 2, y + s * 0.66, '#14182a', `800 ${Math.round(s * 0.5)}px`); c.globalAlpha = 1; }
  // 표준 유전부호(첫째·둘째·셋째 염기 U C A G 차례)
  const AA1 = 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';
  const AAK = { F: '페닐알라닌', L: '류신', S: '세린', Y: '타이로신', C: '시스테인', W: '트립토판', P: '프롤린', H: '히스티딘', Q: '글루타민', R: '아르지닌', I: '아이소류신', M: '메싸이오닌', T: '트레오닌', N: '아스파라진', K: '라이신', V: '발린', A: '알라닌', D: '아스파트산', E: '글루탐산', G: '글라이신', '*': '종결' };
  const code = (cd) => AA1['UCAG'.indexOf(cd[0]) * 16 + 'UCAG'.indexOf(cd[1]) * 4 + 'UCAG'.indexOf(cd[2])];
  const hueOf = (a) => ('FLSYCWPHQRIMTNKVADEG'.indexOf(a) * 18 + 10) % 360;
  const hit = (p, x, y, w, h) => p.x >= x && p.x <= x + w && p.y >= y && p.y <= y + h;
  const rnd = (s) => { let z = s; return () => { z = (z * 16807) % 2147483647; return z / 2147483647; }; };


  // 세포 그림 넷: 0 근육세포(가로무늬·핵 여럿) 1 이자 세포(인슐린 알갱이가 밖으로) 2 적혈구가 될 세포(헤모글로빈이 차오름) 3 피부 세포(겹겹이 쌓인 층)
  function cellArt(c, k, R, t) {
    const nuc = (x, y, r, rx) => { c.fillStyle = rad(c, x, y, r, ['#d4b8ff', '#8a5fd0', '#4d2f8a']); c.beginPath(); c.ellipse(x, y, rx || r, r, 0, 0, TAU); c.fill(); c.strokeStyle = '#e4d4ff'; c.lineWidth = 1.5; c.stroke(); circ(c, x + r * 0.2, y - r * 0.15, r * 0.28, 'rgba(50,25,95,.75)'); };
    if (k === 0) {
      const sq = 1 - 0.05 * (0.5 + 0.5 * Math.sin(t * 2.4)), L = R * 1.75 * sq, T = R * 0.42 / Math.sqrt(sq);
      c.save(); c.beginPath(); c.roundRect(-L, -T, L * 2, T * 2, T * 0.9);
      c.fillStyle = lin(c, 0, -T, 0, T, ['#f2a3a3', '#d76565', '#9a3a3a']); c.fill(); c.strokeStyle = '#ffd0d0'; c.lineWidth = 2; c.stroke(); c.clip();
      for (let x = -L; x < L; x += R * 0.11) { c.fillStyle = 'rgba(110,25,35,.42)'; c.fillRect(x, -T, R * 0.05, T * 2); c.fillStyle = 'rgba(255,220,220,.18)'; c.fillRect(x + R * 0.065, -T, R * 0.02, T * 2); }
      c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(0, -T * 0.55, L * 0.7, T * 0.16, 0, 0, TAU); c.fill(); c.restore();
      [-0.75, -0.25, 0.25, 0.75].forEach((u, i) => nuc(u * L, (i % 2 ? 1 : -1) * T * 0.62, R * 0.06, R * 0.15));
      arrow(c, -L - 30, 0, -L - 6, 0, 'rgba(255,216,77,.8)', 2.5); arrow(c, L + 30, 0, L + 6, 0, 'rgba(255,216,77,.8)', 2.5);
    } else if (k === 1) {
      c.beginPath(); for (let i = 0; i <= 7; i++) { const a = i / 7 * TAU + 0.3, r = R * (0.92 + (i % 2) * 0.06); c.lineTo(Math.cos(a) * r, Math.sin(a) * r * 0.9); } c.closePath();
      c.fillStyle = rad(c, 0, 0, R, ['#fff2cc', '#f2c26b', '#b98a2a']); c.fill(); c.strokeStyle = '#fff0c0'; c.lineWidth = 2.5; c.stroke();
      for (let j = 0; j < 3; j++) { c.strokeStyle = 'rgba(120,170,230,.55)'; c.lineWidth = 2.5; c.beginPath(); c.arc(-R * 0.15, R * 0.15, R * (0.36 + j * 0.08), 1.9, 3.6); c.stroke(); }
      for (let i = 0; i < 18; i++) { const a = i * 2.39 + 0.2, r = R * (0.42 + (i % 4) * 0.11); circ(c, Math.cos(a) * r + R * 0.1, Math.sin(a) * r * 0.75 - R * 0.12, 5.5, 'rgba(255,250,230,.75)'); circ(c, Math.cos(a) * r + R * 0.1, Math.sin(a) * r * 0.75 - R * 0.12, 2.6, '#a8742a'); }
      for (let i = 0; i < 4; i++) { const u = (t * 0.3 + i / 4) % 1, a = -0.6 + i * 0.35; c.globalAlpha = 1 - u; circ(c, Math.cos(a) * R * (0.95 + u * 0.6), Math.sin(a) * R * (0.95 + u * 0.6) * 0.9, 4.5, '#fff6d8', '#a8742a', 1); c.globalAlpha = 1; }
      nuc(-R * 0.18, R * 0.18, R * 0.24);
      txt(c, '인슐린 알갱이', R * 0.95, -R * 0.95, '#ffe7a8', '700 13px');
    } else if (k === 2) {
      const fill = 0.55 + 0.25 * Math.sin(t * 0.8);
      circ(c, 0, 0, R * 0.82, rad(c, 0, 0, R * 0.82, ['#ffd4d4', '#ef8a8a', '#b84a4a']), '#ffe0e0', 2.5);
      const Rn = rnd(11); for (let i = 0; i < 60; i++) { const a = Rn() * TAU, r = Math.sqrt(Rn()) * R * 0.72; if (Rn() < fill) circ(c, Math.cos(a) * r, Math.sin(a) * r, 3.4, '#b81c2c'); }
      nuc(R * 0.18, -R * 0.1, R * 0.22);
      txt(c, '헤모글로빈이 차오른다', 0, R + 22, '#ffb3b3', '700 13px');
    } else {
      const w = R * 2.6, h = R * 1.5, x0 = -w / 2, y0 = -h / 2;
      c.save(); c.beginPath(); c.roundRect(x0, y0, w, h, 12); c.clip(); c.fillStyle = '#5a3a2a'; c.fillRect(x0, y0, w, h);
      const rows = [[6, 0.13, '#d8b896', 0], [6, 0.16, '#e2c4a2', 0], [5, 0.22, '#ecd2b0', 1], [5, 0.24, '#f3dcc0', 1], [7, 0.25, '#e8c8a4', 1]];
      let y = y0; rows.forEach(([n, fh, col, hasN], r) => { const rhh = h * fh, off = (r % 2) * w / n / 2; for (let i = -1; i < n + 1; i++) { const x = x0 + i * w / n + off; rr(c, x + 2, y + 2, w / n - 4, rhh - 4, r < 2 ? 3 : 8, lin(c, 0, y, 0, y + rhh, [col, '#b88a64']), 'rgba(90,60,40,.6)', 1.5); if (hasN) nuc(x + w / n / 2, y + rhh / 2, rhh * 0.18); else for (let q = 0; q < 3; q++) line(c, x + 8, y + 5 + q * 4, x + w / n - 10, y + 6 + q * 4, 'rgba(150,110,70,.55)', 1.2); } y += rhh; });
      c.restore(); rr(c, x0, y0, w, h, 12, null, '#f3dcc0', 2);
      txt(c, '겉: 케라틴이 찬 납작한 세포', 0, y0 - 10, '#ffe7c8', '700 13px');
    }
  }

  const KINDS = {
    /* ── 3-3-1 · 2 효소의 작용: 온도를 바꾸며 효소의 빠르기 재기 ── */
    temp: {
      init: () => ({ T: 20, cooked: false, pts: {}, cool: false, sub: [], prod: [], ph: [0, 0.33, 0.66], dragT: false }),
      rate(s) { if (s.cooked) return 0; const T = s.T; const up = Math.pow(Math.max(0, T) / 37, 1.7), down = T <= 40 ? 1 : Math.max(0, 1 - (T - 40) / 18); return clamp(up * down, 0, 1.15); },
      tick(s, dt) {
        if (s.Tt != null) { const d = s.Tt - s.T; s.T += clamp(d, -dt * 24, dt * 24); if (Math.abs(d) < 0.3) { s.T = s.Tt; s.Tt = null; } }
        if (s.T >= 58) s.cooked = true;
        if (s.cooked && s.T < 40) s.cool = true;
        s.acc = (s.acc || 0) + dt; if (s.acc > 0.35) { s.acc = 0; s.pts[Math.round(s.T / 2) * 2] = { r: this.rate(s), dead: s.cooked }; }
        const r = this.rate(s); s.ph = s.ph.map((p, i) => { p += dt * r * 1.1; if (p >= 1) { p -= 1; s.prod.push({ i, a: 0 }); } return p; });
        s.prod.forEach((q) => { q.a += dt; }); s.prod = s.prod.filter((q) => q.a < 1.6);
      },
      down(s, p) { if (p.x < s.W * 0.47) { s.dragT = true; s.Tt = null; s.y0 = p.y; s.T0 = s.T; } },
      move(s, p, held) { if (held && s.dragT) s.T = clamp(s.T0 - (p.y - s.y0) * 0.16, 0, 72); },
      up(s) { s.dragT = false; },
      key(s, e) { const d = { ArrowUp: 2, ArrowDown: -2 }[e.key]; if (!d) return false; s.T = clamp(s.T + d, 0, 72); return true; },
      act(s, a) { if (a === 'fresh') { s.cooked = false; s.cool = false; } else s.Tt = +a.slice(1); },
      on: (s, a) => (a === 'fresh' ? false : +a.slice(1) === (s.Tt ?? Math.round(s.T))),
      steps: [(s) => Object.keys(s.pts).some((k) => +k <= 10 && !s.pts[k].dead), (s) => Object.keys(s.pts).some((k) => +k >= 34 && +k <= 40 && !s.pts[k].dead), (s) => s.cool],
      draw(c, W, H, s, t) {
        bg(c, W, H, s.T > 45 ? 'rgba(220,110,60,.18)' : s.T < 12 ? 'rgba(90,170,240,.2)' : 'rgba(90,120,200,.16)');
        const r = this.rate(s), hot = clamp((s.T - 20) / 50, 0, 1), cold = clamp((20 - s.T) / 20, 0, 1);
        // 물중탕 비커 + 온도계
        const bx = W * 0.05, by = H * 0.2, bw = W * 0.24, bh = H * 0.6;
        shadow(c, bx + bw / 2, by + bh + 8, bw * 0.55);
        beaker(c, bx, by, bw, bh, `rgba(${Math.round(lerp(90, 235, hot))},${Math.round(lerp(160, 140, hot))},${Math.round(lerp(240, 90, hot))},.42)`, 0.72);
        if (cold > 0.3) for (let i = 0; i < 3; i++) rr(c, bx + 16 + i * bw * 0.28, by + bh * 0.3 + Math.sin(t + i) * 3, bw * 0.2, bw * 0.17, 5, 'rgba(230,245,255,.7)', '#fff', 1);
        if (hot > 0.45) for (let i = 0; i < 5; i++) { const u = (t * 0.5 + i / 5) % 1; c.strokeStyle = `rgba(255,255,255,${0.35 * (1 - u)})`; c.lineWidth = 3; c.beginPath(); const x = bx + bw * (0.2 + i * 0.15); c.moveTo(x, by + bh * 0.25 - u * 60); c.bezierCurveTo(x - 10, by + bh * 0.2 - u * 60, x + 10, by + bh * 0.1 - u * 60, x, by - u * 60); c.stroke(); }
        // 시험관(효소 + 기질)
        c.save(); c.beginPath(); c.roundRect(bx + bw * 0.38, by - 20, bw * 0.24, bh * 0.85, [3, 3, 14, 14]); c.clip(); c.fillStyle = lin(c, 0, by + bh * 0.2, 0, by + bh, [s.cooked ? 'rgba(220,200,170,.55)' : 'rgba(255,236,170,.5)', s.cooked ? 'rgba(170,140,110,.6)' : 'rgba(240,200,110,.6)']); c.fillRect(bx + bw * 0.38, by + bh * 0.2, bw * 0.24, bh); line(c, bx + bw * 0.38, by + bh * 0.2, bx + bw * 0.62, by + bh * 0.2, 'rgba(255,255,255,.6)', 1.5); c.restore();
        rr(c, bx + bw * 0.38, by - 20, bw * 0.24, bh * 0.85, [3, 3, 14, 14], 'rgba(200,225,255,.12)', 'rgba(230,240,255,.85)', 2); rr(c, bx + bw * 0.42, by - 12, 4, bh * 0.7, 2, 'rgba(255,255,255,.3)');
        txt(c, '효소 + 기질 용액', bx + bw * 0.5, by - 30, '#ffe7a8', '700 13px');
        for (let i = 0; i < Math.round(r * 9); i++) { const u = (t * 0.6 + i * 0.13) % 1; circ(c, bx + bw * 0.5 + Math.sin(i * 3 + t) * 6, by + bh * 0.7 - u * bh * 0.5, 2.5, null, 'rgba(255,255,255,.8)', 1); }
        const tx = bx + bw + 26, ty = by - 10, th = bh + 10, fr = s.T / 72;
        rr(c, tx - 7, ty, 14, th, 7, '#e8edf7', '#9aa6c4', 1.5); circ(c, tx, ty + th + 6, 12, '#e8402e', '#9aa6c4', 1.5); rr(c, tx - 3, ty + th * (1 - fr), 6, th * fr + 4, 3, '#e8402e');
        for (let k = 0; k <= 70; k += 10) { const yy = ty + th * (1 - k / 72); line(c, tx + 8, yy, tx + 15, yy, DIM, 1.5); txt(c, String(k), tx + 18, yy + 4, DIM, '600 12px', 'left'); }
        pill(c, tx, ty - 22, `${Math.round(s.T)} °C`, s.T > 45 ? RED : s.T < 12 ? BLU : YEL, '#1d2433', '800 16px');
        txt(c, '위아래로 끌어 온도 바꾸기', bx + bw / 2, by + bh + 34, DIM, '600 13px');
        // 확대 원: 효소가 기질을 받아 생성물로
        const cx = W * 0.47, cy = H * 0.56, R = Math.min(W * 0.13, H * 0.3);
        c.save(); c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.clip(); c.fillStyle = rad(c, cx, cy, R, ['#ffffff', '#eaf3fc', '#d4e4f4']); c.fillRect(cx - R, cy - R, R * 2, R * 2);
        const jig = 0.5 + s.T / 30;
        for (let i = 0; i < 14; i++) { const a = i * 2.4 + t * 0.3 * jig, rr0 = R * (0.3 + (i % 5) * 0.14); c.save(); c.translate(cx + Math.cos(a) * rr0 + Math.sin(t * 3 * jig + i) * 2 * jig, cy + Math.sin(a * 1.3) * rr0 * 0.8); c.rotate(a); rr(c, -5, -4, 10, 8, 2, '#ffd36b'); c.restore(); }
        const E = [[cx - R * 0.35, cy - R * 0.25], [cx + R * 0.32, cy - R * 0.05], [cx - R * 0.05, cy + R * 0.42]];
        E.forEach(([x, y], i) => { enzyme(c, x, y, R * 0.22, i * 2 + Math.sin(t * jig + i) * 0.15, s.cooked ? 1 : clamp((s.T - 45) / 15, 0, 1)); if (!s.cooked && s.ph[i] > 0.6) { c.save(); c.translate(x + R * 0.2, y); rr(c, -5, -4, 10, 8, 2, '#ffd36b'); c.restore(); } });
        s.prod.forEach((q) => { const [x, y] = E[q.i], u = q.a / 1.6; c.globalAlpha = 1 - u; circ(c, x + R * 0.25 + u * 40, y - u * 30, 4, '#9ef08a'); circ(c, x + R * 0.25 + u * 50, y + u * 26, 4, '#9ef08a'); c.globalAlpha = 1; });
        c.restore(); circ(c, cx, cy, R, null, '#d9dfef', 4);
        txt(c, s.cooked ? '효소 모양이 흐트러졌다(변성)' : '효소', cx, cy - R - 12, s.cooked ? RED : '#bfe1ff', '700 14px');
        txt(c, '● 기질  ● 생성물', cx, cy + R + 22, DIM, '600 12px');
        // 그래프
        const G = graph(c, W * 0.66, H * 0.2, W * 0.3, H * 0.56, [0, 70], [0, 1.2], '온도(°C)', '반응 빠르기(상댓값)', [0, 10, 20, 30, 40, 50, 60, 70]); [0, 0.5, 1].forEach((v) => txt(c, String(v * 100), W * 0.66 - 6, G.Y(v) + 4, DIM, '600 11px', 'right'));
        Object.keys(s.pts).forEach((k) => { const q = s.pts[k], x = G.X(+k), y = G.Y(q.r); if (q.dead) { line(c, x - 5, y - 5, x + 5, y + 5, RED, 2.5); line(c, x - 5, y + 5, x + 5, y - 5, RED, 2.5); } else ball(c, x, y, 5, 50); });
        const xT = G.X(s.T); line(c, xT, H * 0.2, xT, H * 0.76, 'rgba(255,216,77,.55)', 1.5, [4, 4]);
        txt(c, '사람 체온', G.X(37), H * 0.2 - 8, '#ffb49a', '700 12px');
      },
      say(s, cur) {
        const r = this.rate(s);
        const o = s.cooked ? (s.T < 40 ? `<b>${Math.round(s.T)} °C</b>로 식혔는데도 빠르기 0 — 한 번 흐트러진 효소는 되돌아오지 않는다` : `<b>${Math.round(s.T)} °C</b> — 효소의 입체 구조가 <b>흐트러져</b>(변성) 기질과 결합하지 못한다`)
          : s.T < 15 ? `<b>${Math.round(s.T)} °C</b> — 분자 움직임이 느려 반응이 <b>느리다</b>` : s.T <= 41 ? `<b>${Math.round(s.T)} °C</b> — 온도가 오를수록 빨라진다(빠르기 ${(r * 100).toFixed(0)})` : `<b>${Math.round(s.T)} °C</b> — 오히려 <b>느려진다</b>. 효소 모양이 흐트러지기 시작한다`;
        return [['', '① 얼음물(10 °C 아래)에서 재 보자', '② 체온(35~40 °C) 부근에서 재 보자', '③ 60 °C 넘게 데웠다가 다시 식혀 보자'][cur] || '효소는 알맞은 온도에서 가장 빠르다', o];
      },
    },
    /* ── 3-3-1 · 3 효소 실험과 활용: 효소마다 알맞은 pH ── */
    ph: {
      E: [['침 속 아밀레이스', 7, 1.3, '입', 200], ['위액의 펩신', 2, 1.0, '위', 20], ['이자액의 트립신', 8, 1.1, '작은창자', 130]],
      init: () => ({ pH: 7, e: 0, seen: [{}, {}, {}], drag: false }),
      act_(e, pH) { const [, o, sg] = this.E[e]; return Math.exp(-((pH - o) ** 2) / (2 * sg * sg)); },
      tick(s) { s.seen[s.e][Math.round(s.pH * 2) / 2] = 1; },
      down(s, p) { s.drag = true; this.move(s, p, true); },
      move(s, p, held) { if (held && s.drag && p.y > s.H * 0.18) { const x0 = s.W * 0.06, w = s.W * 0.88; if (p.y > s.H * 0.8) s.pH = clamp((p.x - x0) / w * 14, 0, 14); else if (p.x > s.W * 0.56) s.pH = clamp((p.x - s.W * 0.6) / (s.W * 0.34) * 14, 0, 14); } },
      up(s) { s.drag = false; },
      key(s, e) { const d = { ArrowRight: 0.5, ArrowLeft: -0.5 }[e.key]; if (!d) return false; s.pH = clamp(s.pH + d, 0, 14); return true; },
      act(s, a) { s.e = +a.slice(1); },
      on: (s, a) => +a.slice(1) === s.e,
      cov(s, e) { let n = 0; for (let k = 1; k <= 11; k += 0.5) if (s.seen[e][k]) n++; return n / 21; },
      steps: [(s) => KINDS.ph.cov(s, 0) > 0.7, (s) => KINDS.ph.cov(s, 1) > 0.7, (s) => KINDS.ph.cov(s, 2) > 0.7],
      draw(c, W, H, s, t) {
        bg(c, W, H);
        // 몸 실루엣과 기관
        const mx = W * 0.15, my = H * 0.17;
        c.fillStyle = lin(c, 0, my, 0, my + H * 0.6, ['#3a4670', '#27304f']);
        c.beginPath(); c.ellipse(mx, my + 32, 27, 32, 0, 0, TAU); c.fill(); const yb = my + H * 0.58;
        c.beginPath(); c.moveTo(mx - 12, my + 58); c.lineTo(mx - 13, my + 72); c.quadraticCurveTo(mx - 64, my + 74, mx - 72, my + 104); c.lineTo(mx - 84, yb - 34); c.quadraticCurveTo(mx - 84, yb - 18, mx - 72, yb - 22); c.lineTo(mx - 64, my + 134); c.lineTo(mx - 60, yb); c.quadraticCurveTo(mx, yb + 10, mx + 60, yb); c.lineTo(mx + 64, my + 134); c.lineTo(mx + 72, yb - 22); c.quadraticCurveTo(mx + 84, yb - 18, mx + 84, yb - 34); c.lineTo(mx + 72, my + 104); c.quadraticCurveTo(mx + 64, my + 74, mx + 13, my + 72); c.lineTo(mx + 12, my + 58); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(160,175,220,.35)'; c.lineWidth = 2; c.stroke(); c.fillStyle = 'rgba(255,255,255,.07)'; c.beginPath(); c.ellipse(mx - 30, my + 120, 18, 50, 0.1, 0, TAU); c.fill();
        const org = [[mx + 16, my + 46, 9], [mx + 14, my + 140, 26], [mx - 4, my + 220, 34]], [, , , on] = this.E[s.e];
        c.strokeStyle = 'rgba(255,190,160,.5)'; c.lineWidth = 6; c.beginPath(); c.moveTo(mx + 10, my + 50); c.lineTo(mx + 6, my + 118); c.stroke();
        c.fillStyle = s.e === 1 ? '#ff9e7a' : '#8d5a55'; c.beginPath(); c.ellipse(mx + 16, my + 140, 30, 20, 0.4, 0, TAU); c.fill();
        c.strokeStyle = s.e === 2 ? '#ffcf7a' : '#7d6650'; c.lineWidth = 8; c.beginPath(); for (let i = 0; i < 40; i++) { const a = i / 40 * TAU * 3; c.lineTo(mx - 4 + Math.cos(a) * (14 + i * 0.5), my + 220 + Math.sin(a) * (10 + i * 0.3)); } c.stroke();
        circ(c, mx + 16, my + 46, 9, s.e === 0 ? '#ff9e9e' : '#8d5a55');
        org.forEach(([x, y, r], i) => { if (i === s.e) { circ(c, x, y, r + 8 + Math.sin(t * 4) * 2, null, YEL, 2.5); } });
        pill(c, mx, my + H * 0.58 - 14, `${on}에서 일한다`, YEL, '#1d2433', '800 14px');
        // 시험관: 지금 pH 색 + 반응 거품
        const pc = (pH) => `hsl(${lerp(0, 270, pH / 14)},75%,55%)`, a = this.act_(s.e, s.pH);
        const tx = W * 0.36, ty = H * 0.2, tw = 56, th = H * 0.46;
        c.save(); c.beginPath(); c.roundRect(tx, ty, tw, th, [3, 3, 28, 28]); c.clip(); c.fillStyle = pc(s.pH); c.globalAlpha = 0.6; c.fillRect(tx, ty + th * 0.3, tw, th); c.globalAlpha = 1;
        for (let i = 0; i < Math.round(a * 14); i++) { const u = (t * 0.7 + i * 0.11) % 1; circ(c, tx + tw / 2 + Math.sin(i * 2.3 + t * 2) * 14, ty + th - 12 - u * th * 0.6, 3, 'rgba(255,255,255,.75)'); }
        c.restore(); rr(c, tx, ty, tw, th, [3, 3, 28, 28], null, 'rgba(230,240,255,.85)', 2);
        txt(c, `반응 빠르기 ${(a * 100).toFixed(0)}`, tx + tw / 2, ty + th + 24, INK, '800 15px');
        txt(c, this.E[s.e][0], tx + tw / 2, ty - 14, YEL, '700 14px');
        // pH 띠(아래)
        const x0 = W * 0.06, w = W * 0.88, y0 = H * 0.86;
        for (let i = 0; i < 70; i++) { c.fillStyle = pc(i / 5); c.fillRect(x0 + i * w / 70, y0, w / 70 + 1, 18); }
        rr(c, x0, y0, w, 18, 4, null, DIM, 1.5);
        for (let k = 0; k <= 14; k += 2) txt(c, String(k), x0 + k / 14 * w, y0 + 34, DIM, '600 12px');
        txt(c, '산성', x0, y0 - 8, '#ff9e7a', '700 12px', 'left'); txt(c, '중성', x0 + w / 2, y0 - 8, '#c8f0a0', '700 12px'); txt(c, '염기성', x0 + w, y0 - 8, '#b9a0ff', '700 12px', 'right');
        const px = x0 + s.pH / 14 * w; c.fillStyle = '#fff'; c.beginPath(); c.moveTo(px, y0 - 2); c.lineTo(px - 8, y0 - 14); c.lineTo(px + 8, y0 - 14); c.fill(); pill(c, px, y0 - 30, `pH ${s.pH.toFixed(1)}`, '#fff', '#1d2433', '800 14px');
        // 그래프
        const G = graph(c, W * 0.6, H * 0.12, W * 0.34, H * 0.5, [0, 14], [0, 1.1], 'pH', '반응 빠르기', [0, 2, 4, 6, 8, 10, 12, 14]);
        [0, 1, 2].forEach((e) => { const hue = [45, 10, 200][e]; c.strokeStyle = `hsl(${hue},85%,62%)`; c.lineWidth = e === s.e ? 4 : 2.5; c.beginPath(); let pen = false; for (let k = 0; k <= 14; k += 0.5) { if (s.seen[e][k]) { const X = G.X(k), Y = G.Y(this.act_(e, k)); if (pen) c.lineTo(X, Y); else { c.moveTo(X, Y); pen = true; } } else pen = false; } c.stroke();
          if (KINDS.ph.cov(s, e) > 0.7) txt(c, ['아밀레이스', '펩신', '트립신'][e], G.X(this.E[e][1]) + [-34, 0, 34][e], G.Y(1.02) - [6, 6, 22][e], `hsl(${hue},85%,70%)`, '700 12px'); });
        const xp = G.X(s.pH); line(c, xp, H * 0.12, xp, H * 0.62, 'rgba(255,216,77,.6)', 1.5, [4, 4]); ball(c, xp, G.Y(a), 6, [45, 10, 200][s.e]);
      },
      say(s, cur) { const [nm, o, , on] = this.E[s.e], a = this.act_(s.e, s.pH); return [['', '① 아밀레이스로 pH를 처음부터 끝까지 바꿔 보자', '② 펩신으로 바꿔 같은 일을 해 보자', '③ 트립신도 재 보자'][cur] || '효소마다 가장 빠른 pH가 다르다', `${nm} · pH ${s.pH.toFixed(1)} → 빠르기 <b>${(a * 100).toFixed(0)}</b>${Math.abs(s.pH - o) < 0.6 ? ` — <b>${on}</b>의 pH와 비슷할 때 가장 빠르다` : ''}`]; },
    },
    /* ── 3-3-1 · 3 생활 속 효소: 밥을 오래 씹으면 단맛이 나는 까닭 ── */
    chew: {
      init: () => ({ n: 0, starch: 1, jaw: 0, iod: null, cuts: [], hist: [[0, 100]], drop: 0 }),
      tick(s, dt) { s.jaw = Math.max(0, s.jaw - dt * 3); s.cuts.forEach((q) => { q.a += dt; }); s.cuts = s.cuts.filter((q) => q.a < 1); if (s.drop > 0) s.drop = Math.max(0, s.drop - dt); },
      chew(s) { s.n++; s.jaw = 1; s.starch = Math.max(0.02, s.starch * 0.9); s.cuts.push({ a: 0, k: s.n % 6 }); s.hist.push([s.n, Math.round(s.starch * 100)]); if (s.hist.length > 60) s.hist.shift(); },
      mouth(s) { return [s.W * 0.2, s.H * 0.36, Math.min(s.W * 0.125, s.H * 0.21)]; },
      down(s, p) { const [mx, my, R] = this.mouth(s); if (Math.hypot(p.x - mx, p.y - my) < R * 1.3) this.chew(s); },
      key(s, e) { if (e.key === ' ' || e.key === 'Enter') { this.chew(s); return true; } return false; },
      act(s, a) { if (a === 'chew') this.chew(s); if (a === 'iod') { s.iod = s.starch; s.drop = 1.2; } },
      steps: [(s) => s.n >= 10, (s) => s.n >= 30, (s) => s.iod != null && s.iod < 0.1],
      draw(c, W, H, s, t) {
        bg(c, W, H, 'rgba(240,160,120,.12)');
        // 입 앞모습: 입술 · 윗니와 아랫니(앞니·송곳니·어금니) · 혀 · 밥알 · 침
        const [mx, my, R] = this.mouth(s), open = (0.55 - s.jaw * 0.4) * R + Math.sin(t * 2) * 1.5;
        c.save(); c.translate(mx, my);
        c.fillStyle = lin(c, 0, -R, 0, R, ['#f3b9a4', '#e79c86', '#d98a74']); c.beginPath(); c.ellipse(0, 0, R * 1.32, R * 0.98, 0, 0, TAU); c.fill(); // 얼굴 아래쪽 살
        const lipU = -open * 0.55, lipD = open * 0.55;
        c.fillStyle = '#5a1620'; c.beginPath(); c.moveTo(-R, 0); c.bezierCurveTo(-R * 0.6, lipU - R * 0.12, R * 0.6, lipU - R * 0.12, R, 0); c.bezierCurveTo(R * 0.6, lipD + R * 0.12, -R * 0.6, lipD + R * 0.12, -R, 0); c.fill(); // 입 안
        c.fillStyle = lin(c, 0, 0, 0, lipD, ['#c2505a', '#e07a80']); c.beginPath(); c.ellipse(0, lipD * 0.7, R * 0.62, lipD * 0.5 + 4, 0, 0, Math.PI); c.fill(); line(c, 0, lipD * 0.35, 0, lipD * 0.95, 'rgba(120,30,40,.45)', 2); // 혀
        const tooth = (x, y, w, h, up, k) => { const g = lin(c, 0, y, 0, y + (up ? h : -h), ['#ffffff', '#f2eee2', '#d9d2bd']); c.fillStyle = g; c.beginPath(); if (up) c.roundRect(x - w / 2, y, w, h, [2, 2, w * 0.45, w * 0.45]); else c.roundRect(x - w / 2, y - h, w, h, [w * 0.45, w * 0.45, 2, 2]); c.fill(); c.strokeStyle = 'rgba(150,140,120,.6)'; c.lineWidth = 1; c.stroke(); if (k > 2) line(c, x, up ? y + h * 0.5 : y - h * 0.5, x, up ? y + h * 0.85 : y - h * 0.85, 'rgba(150,140,120,.5)', 1); };
        [[-0.78, 0.15, 4], [-0.56, 0.17, 3], [-0.35, 0.16, 2], [-0.12, 0.14, 1], [0.12, 0.14, 1], [0.35, 0.16, 2], [0.56, 0.17, 3], [0.78, 0.15, 4]].forEach(([u, w, k]) => { const yy = Math.abs(u) * Math.abs(u) * R * 0.12; tooth(u * R, lipU - R * 0.05 + yy, w * R, R * 0.2 - k * 2, true, k); tooth(u * R, lipD + R * 0.05 - yy, w * R, R * 0.18 - k * 2, false, k); });
        // 밥알(길쭉한 낟알, 씹을수록 작게 부서짐)
        const grains = Math.max(4, Math.round(16 * (0.3 + s.starch * 0.7))), Rg = rnd(9);
        for (let i = 0; i < grains; i++) { const gx = (Rg() - 0.5) * R * 1.1, gy = (Rg() - 0.5) * open * 0.6, sz = 1 - (1 - s.starch) * 0.55; c.save(); c.translate(gx, gy); c.rotate(Rg() * TAU); c.fillStyle = lin(c, -6, -3, 6, 3, ['#ffffff', '#f6f1e2', '#e3dac2']); c.beginPath(); c.ellipse(0, 0, 7 * sz, 3.4 * sz, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(160,150,120,.6)'; c.lineWidth = 0.8; c.stroke(); c.restore(); }
        for (let i = 0; i < 5; i++) { const u = (t * 0.5 + i / 5) % 1; circ(c, -R * 0.5 + i * R * 0.25, lipD * 0.8 - u * open * 0.5, 2.6, `rgba(170,215,255,${0.85 * (1 - u)})`); }
        c.restore();
        txt(c, '침', mx - R * 0.82, my + R * 0.55, '#3d7fc4', '800 13px'); pill(c, mx, my + R + 22, `씹은 횟수 ${s.n}`, YEL, '#1d2433', '800 15px');
        // 확대 원: 녹말 사슬(포도당이 길게 이어짐)이 아밀레이스에 잘려 엿당(포도당 2개)으로
        const cx = W * 0.53, cy = H * 0.36, Rz = Math.min(W * 0.15, H * 0.27);
        c.save(); c.beginPath(); c.arc(cx, cy, Rz, 0, TAU); c.clip(); c.fillStyle = rad(c, cx, cy, Rz, ['#fffdf6', '#f3ecda', '#e6dcc2']); c.fillRect(cx - Rz, cy - Rz, Rz * 2, Rz * 2);
        const L = Math.max(2, Math.round(2 + 9 * s.starch)), maltose = Math.round((1 - s.starch) * 16);
        const hexa = (x, y, r, fill, st) => { c.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + Math.PI / 6; c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } c.closePath(); c.fillStyle = fill; c.fill(); c.strokeStyle = st; c.lineWidth = 1.2; c.stroke(); };
        for (let k = 0; k < 6; k++) { const y = cy - Rz * 0.62 + k * Rz * 0.24, x0 = cx - Rz * 0.78 + (k % 2) * 12; let px, py; for (let i = 0; i < L; i++) { const x = x0 + i * 14, yy = y + Math.sin(i * 0.9 + t + k) * 3; if (i) line(c, px + 5, py, x - 5, yy, '#9a8650', 2); hexa(x, yy, 6, '#f4e7b8', '#9a8650'); px = x; py = yy; } }
        for (let i = 0; i < maltose; i++) { const a = i * 2.1 + t * 0.4, r0 = Rz * (0.45 + (i % 4) * 0.12), x = cx + Math.cos(a) * r0, y = cy + Math.sin(a) * r0 * 0.8; line(c, x - 3, y, x + 3, y, '#c8608c', 2); hexa(x - 6, y, 5.5, '#ffd0e4', '#c8608c'); hexa(x + 6, y, 5.5, '#ffd0e4', '#c8608c'); }
        [[cx + Rz * 0.45, cy - Rz * 0.3], [cx + Rz * 0.1, cy + Rz * 0.55]].forEach(([x, y], i) => enzyme(c, x + Math.sin(t + i) * 5, y, Rz * 0.17, Math.PI + Math.sin(t * 1.3 + i) * 0.2, 0, '#7fd08a'));
        s.cuts.forEach((q) => { c.globalAlpha = 1 - q.a; txt(c, '싹둑', cx - Rz * 0.2 + q.k * 12, cy - Rz * 0.5 + q.k * 20, '#b8860b', '800 16px'); c.globalAlpha = 1; });
        c.restore(); circ(c, cx, cy, Rz, null, '#5d6577', 3); line(c, mx + R * 0.9, my - R * 0.2, cx - Rz, cy, 'rgba(93,101,119,.5)', 1.5, [5, 5]);
        txt(c, '녹말(포도당 사슬)', cx - Rz * 0.5, cy - Rz - 10, '#7a6420', '800 13px'); txt(c, '엿당', cx + Rz * 0.55, cy - Rz - 10, '#a8406c', '800 13px'); txt(c, '아밀레이스', cx + Rz * 0.6, cy + Rz + 18, '#2f7a3a', '800 13px');
        // 오른쪽: 단맛 막대 · 아이오딘 반응 시험관(스포이트가 떨어뜨림)
        const gx = W * 0.79, gy = H * 0.12, gh = H * 0.44, sw = 1 - s.starch;
        rr(c, gx - 18, gy, 36, gh, 10, 'rgba(255,255,255,.8)', '#5d6577', 1.5); rr(c, gx - 14, gy + gh * (1 - sw) + 4, 28, Math.max(0.01, gh * sw - 8), 8, lin(c, 0, gy, 0, gy + gh, ['#ffb3d1', '#e05a96']));
        txt(c, '단맛', gx, gy - 8, '#a8406c', '800 14px');
        const ix = W * 0.92, iy = gy + 26, col = s.iod == null ? 'rgba(235,225,200,.9)' : `rgb(${Math.round(lerp(235, 40, s.iod))},${Math.round(lerp(200, 40, s.iod))},${Math.round(lerp(140, 120, s.iod))})`;
        c.save(); c.beginPath(); c.roundRect(ix - 15, iy, 30, gh - 26, [3, 3, 15, 15]); c.clip(); c.fillStyle = col; c.fillRect(ix - 15, iy + (gh - 26) * 0.35, 30, gh); c.restore(); rr(c, ix - 15, iy, 30, gh - 26, [3, 3, 15, 15], null, '#5d6577', 2); rr(c, ix - 10, iy + 8, 4, gh - 50, 2, 'rgba(255,255,255,.7)');
        if (s.drop > 0) { const u = 1 - s.drop / 1.2; rr(c, ix - 5, iy - 44, 10, 26, [5, 5, 2, 2], '#3a3f58'); rr(c, ix - 3, iy - 20, 6, 14, 2, 'rgba(120,70,20,.8)'); circ(c, ix, iy - 4 + u * (gh * 0.35), 3.5, '#8a4a10'); }
        txt(c, '아이오딘 반응', ix, iy + gh - 4, INK, '700 12px');
        if (s.iod != null) txt(c, s.iod > 0.4 ? '청람색' : s.iod > 0.1 ? '옅은 보라' : '색 거의 그대로', ix, iy + gh + 14, s.iod > 0.1 ? '#3a3aa0' : '#8a5a10', '800 12px');
        // 아래: 씹은 횟수–남은 녹말 그래프(점이 쌓인다)
        const G = graph(c, W * 0.12, H * 0.7, W * 0.8, H * 0.17, [0, 40], [0, 100], '씹은 횟수(번)', '남은 녹말(%)', [0, 10, 20, 30, 40]);
        [0, 50, 100].forEach((v) => txt(c, String(v), W * 0.12 - 6, G.Y(v) + 4, DIM, '600 11px', 'right'));
        c.strokeStyle = '#c8608c'; c.lineWidth = 2; c.beginPath(); s.hist.forEach(([n, v], i) => (i ? c.lineTo(G.X(Math.min(40, n)), G.Y(v)) : c.moveTo(G.X(n), G.Y(v)))); c.stroke();
        s.hist.forEach(([n, v]) => { if (n <= 40) circ(c, G.X(n), G.Y(v), 3, '#e05a96'); });
      },
      say(s, cur) { return [['', '① 입을 눌러 10번 씹어 보자', '② 30번까지 오래 씹어 보자', '③ 아이오딘 용액을 떨어뜨려 녹말이 남았는지 보자'][cur] || '오래 씹을수록 녹말이 엿당으로 분해된다', `씹은 횟수 <b>${s.n}</b> · 남은 녹말 <b>${Math.round(s.starch * 100)} %</b> — 침 속 <b>아밀레이스</b>가 녹말을 단맛이 나는 <b>엿당</b>으로 자른다`]; },
    },

    /* ── 3-3-1 · 3 탐구: 공정한 실험 설계(삶으면 효소가 일을 못 할까?) ── */
    fair: {
      B: [['raw', '생감자즙 2 mL', '#efe2a6'], ['boil', '삶은 감자즙 2 mL', '#c99a52'], ['water', '증류수 2 mL', '#bfe3ff'], ['raw5', '생감자즙 5 mL', '#efe2a6']],
      init: () => ({ tube: [null, null, null], ran: 0, drag: null, fairRun: false }),
      foam: { raw: 1, raw5: 1.6, boil: 0.04, water: 0 },
      tick(s, dt) { if (s.ran) s.ran = Math.min(1, s.ran + dt * 0.35); },
      geo(s) { const W = s.W, H = s.H; return { bot: this.B.map((_, i) => [W * 0.05 + i * W * 0.14, H * 0.14, W * 0.125, H * 0.22]), tube: [0, 1, 2].map((i) => [W * 0.12 + i * W * 0.16, H * 0.46, W * 0.07, H * 0.42]) }; },
      verdict(s) {
        const k = s.tube; if (k.some((x) => !x)) return null;
        const has = (x) => k.includes(x), dup = new Set(k).size < 3;
        if (has('raw') && has('boil') && has('water')) return ['ok', '생감자즙과 삶은 감자즙은 <b>삶았는지만</b> 다르고, 증류수 시험관이 <b>대조군</b>이다 — 공정한 설계'];
        if (!has('boil')) return ['bad', '<b>삶은 감자즙</b> 시험관이 없다 — 알아보려는 것(삶은 효과)을 견줄 수 없다'];
        if (!has('raw') && !has('raw5')) return ['bad', '<b>생감자즙</b> 시험관이 없다 — 삶지 않았을 때와 견줄 수 없다'];
        if (has('raw5') && !has('raw')) return ['bad', '생감자즙 <b>5 mL</b>와 삶은 감자즙 <b>2 mL</b> — 삶았는지와 <b>양</b>이 함께 달라 무엇 때문인지 가릴 수 없다'];
        if (!has('water')) return ['half', `비교는 공정하다. 그런데 감자즙 없이 거품이 나는지 볼 <b>대조군</b>(증류수)이 없다${dup ? '(같은 시험관이 두 개다)' : ''}`];
        return ['bad', '조건이 둘 이상 섞였다 — 삶았는지 하나만 다르게 하자'];
      },
      down(s, p) { const g = this.geo(s); g.bot.forEach(([x, y, w, h], i) => { if (hit(p, x, y, w, h)) s.drag = { i, x: p.x, y: p.y }; }); },
      move(s, p, held) { if (held && s.drag) { s.drag.x = p.x; s.drag.y = p.y; } },
      up(s, p) { if (!s.drag) return; const g = this.geo(s); g.tube.forEach(([x, y, w, h], j) => { if (hit(p, x - 20, y - 60, w + 40, h + 60)) { s.tube[j] = this.B[s.drag.i][0]; s.ran = 0; } }); s.drag = null; },
      act(s, a) { if (a === 'run' && s.tube.every(Boolean)) { s.ran = 0.01; const v = this.verdict(s); if (v && v[0] === 'ok') s.fairRun = true; } if (a === 'auto') { s.tube = ['raw', 'boil', 'water']; s.ran = 0; } },
      steps: [(s) => s.tube.every(Boolean), (s) => s.ran > 0.5, (s) => s.fairRun && s.ran > 0.5],
      draw(c, W, H, s, t) {
        bg(c, W, H);
        const g = this.geo(s);
        c.fillStyle = lin(c, 0, H * 0.9, 0, H, ['#5a3d22', '#2a1c10']); c.fillRect(0, H * 0.9, W, H * 0.1);
        rr(c, W * 0.04, H * 0.38, W * 0.56, 8, 3, '#8a5f31');
        txt(c, '병을 끌어 시험관에 붓기', W * 0.31, H * 0.11, DIM, '600 13px');
        g.bot.forEach(([x, y, w, h], i) => { const [, nm, col] = this.B[i], dragging = s.drag && s.drag.i === i, X = dragging ? s.drag.x - w / 2 : x, Y = dragging ? s.drag.y - h / 2 : y;
          if (dragging) shadow(c, X + w / 2, Y + h + 10, w * 0.4);
          rr(c, X + w * 0.32, Y, w * 0.36, h * 0.18, 3, '#6d7896'); rr(c, X + w * 0.1, Y + h * 0.16, w * 0.8, h * 0.84, 10, 'rgba(220,235,255,.18)', 'rgba(230,240,255,.85)', 2);
          rr(c, X + w * 0.14, Y + h * 0.45, w * 0.72, h * 0.5, 7, col); rr(c, X + w * 0.08, Y + h * 0.25, w * 0.84, h * 0.18, 4, '#fbf8ee'); txt(c, nm.replace(/ \d mL$/, ''), X + w / 2, Y + h * 0.38, '#1d2433', '800 12px'); txt(c, nm.match(/\d mL$/)[0], X + w / 2, Y + h + 17, INK, '800 14px');
          for (let k = 0; k < 3; k++) line(c, X + w * 0.86, Y + h * (0.5 + k * 0.13), X + w * 0.9, Y + h * (0.5 + k * 0.13), 'rgba(29,36,51,.5)', 1.5); rr(c, X + w * 0.16, Y + h * 0.48, 4, h * 0.42, 2, 'rgba(255,255,255,.45)'); });
        const v = this.verdict(s);
        g.tube.forEach(([x, y, w, h], j) => { const k = s.tube[j], f = k ? this.foam[k] * s.ran : 0;
          shadow(c, x + w / 2, y + h + 6, w * 0.7);
          c.save(); c.beginPath(); c.roundRect(x, y, w, h, [2, 2, w / 2, w / 2]); c.clip();
          c.fillStyle = 'rgba(150,200,240,.32)'; c.fillRect(x, y + h * 0.45, w, h); if (k) { c.fillStyle = this.B.find((b) => b[0] === k)[2]; c.globalAlpha = 0.45; c.fillRect(x, y + h * 0.62, w, h); c.globalAlpha = 1; }
          for (let i = 0; i < Math.round(f * 12); i++) { const u = (t * 0.7 + i * 0.13) % 1; circ(c, x + w / 2 + Math.sin(i * 2 + t) * w * 0.3, y + h - 12 - u * h * 0.5, 1.6 + (i % 3) * 0.8, 'rgba(255,255,255,.35)', '#7d8aa8', 1); }
          const fh = Math.min(h * 0.5, f * h * 0.32), Rb = rnd(11 + j); for (let i = 0; i < Math.round(fh * 0.9); i++) { const bx2 = x + 4 + Rb() * (w - 8), by2 = y + h * 0.45 - Math.pow(Rb(), 0.7) * fh, r2 = 2 + Rb() * 4 + Math.sin(t * 3 + i) * 0.4; circ(c, bx2, by2, r2, 'rgba(255,255,255,.88)', 'rgba(150,165,190,.75)', 0.8); }
          c.restore(); rr(c, x, y, w, h, [2, 2, w / 2, w / 2], null, 'rgba(230,240,255,.85)', 2);
          txt(c, 'ABC'[j], x + w / 2, y - 12, YEL, '800 16px'); pill(c, x + w / 2, y + h + 24, k ? this.B.find((b) => b[0] === k)[1] : '과산화 수소수만', '#fbf8ee', k ? '#1d2433' : '#4a5468', '800 13px'); // 어두운 바닥 띠 위라 밝은 바탕을 깐다
          if (s.ran > 0.7 && k && this.foam[k] > 0.5) { const fx = x + w / 2, fy = y - 34; line(c, fx - 18, fy + 14, fx + 6, fy - 2, '#a77b4a', 4); circ(c, fx + 8, fy - 4, 6 + Math.sin(t * 9) * 1.5, 'rgba(255,170,60,.95)'); circ(c, fx + 8, fy - 6, 3, '#fff3b0'); }
        });
        // 판정 칸
        const px = W * 0.64, py = H * 0.12, pw = W * 0.33;
        rr(c, px, py, pw, H * 0.74, 12, 'rgba(255,255,255,.05)', 'rgba(185,194,216,.3)', 1.5);
        txt(c, '알아볼 물음', px + 16, py + 28, YEL, '800 15px', 'left');
        ['삶은 감자의 효소는', '과산화 수소를 분해할까?'].forEach((l, i) => txt(c, l, px + 16, py + 52 + i * 22, INK, '700 15px', 'left'));
        [['같게 할 것', '과산화 수소수 5 mL, 넣는 즙의 양, 온도'], ['다르게 할 것', '감자를 삶았는지'], ['대조군', '감자즙 대신 증류수']].forEach(([a, b], i) => { const yy = py + 120 + i * 58; txt(c, a, px + 16, yy, ['#9be0a0', '#ffb49a', '#9cc8ff'][i], '800 14px', 'left'); txt(c, b, px + 16, yy + 22, DIM, '600 13px', 'left'); });
        if (v) { const ok = v[0] === 'ok'; rr(c, px + 12, py + H * 0.52, pw - 24, H * 0.18, 10, ok ? 'rgba(127,214,107,.18)' : v[0] === 'half' ? 'rgba(255,216,77,.15)' : 'rgba(255,122,92,.16)', ok ? GRN : v[0] === 'half' ? YEL : RED, 2); txt(c, ok ? '공정한 설계' : v[0] === 'half' ? '대조군이 빠졌다' : '다시 설계해 보자', px + pw / 2, py + H * 0.52 + 30, ok ? GRN : v[0] === 'half' ? YEL : RED, '800 16px'); }
      },
      say(s, cur) { const v = this.verdict(s); return [['', '① 병 셋을 끌어 시험관 A·B·C를 채우자', '② ‘실험하기’를 눌러 거품을 보자', '③ 공정한 설계로 다시 실험해 보자'][cur] || '하나만 다르게, 대조군과 함께', v ? v[1] : '시험관 A·B·C에는 3 % 과산화 수소수가 5 mL씩 들어 있다'] ; },
    },
    /* ── 3-3-2 · 1 세포막과 확산: 찬물과 더운물에 잉크 떨어뜨리기 ── */
    ink: {
      // 퍼지는 빠르기는 시간(dt)에 비례: 더운물은 찬물보다 확산 계수가 4배(이해를 돕기 위한 예)
      init: () => ({ b: [{ T: 10, ps: [], time: 0, hist: [] }, { T: 60, ps: [], time: 0, hist: [] }], drag: null }),
      box(s, i) { const W = s.W, H = s.H; return [W * (0.05 + i * 0.3), H * 0.28, W * 0.24, H * 0.5]; },
      drop(s, i) { const B = s.b[i], [x, y, w] = this.box(s, i); B.ps = []; B.time = 0.001; B.hist = []; const R = rnd(7 + i); for (let k = 0; k < 260; k++) B.ps.push([x + w / 2 + (R() - 0.5) * 12, y + 30 + R() * 10]); },
      spread(s, i) { const B = s.b[i]; if (!B.ps.length) return 0; const [x, y, w, h] = this.box(s, i), n = B.ps.length; let sx = 0, sy = 0, sxx = 0, syy = 0; B.ps.forEach(([a, b2]) => { sx += a; sy += b2; sxx += a * a; syy += b2 * b2; }); const vx = sxx / n - (sx / n) ** 2, vy = syy / n - (sy / n) ** 2, ww = w - 10, hh = h - 22; return clamp(Math.min(1, Math.sqrt(vx / (ww * ww / 12))) * Math.min(1, Math.sqrt(vy / (hh * hh / 12))), 0, 1); },
      tick(s, dt) {
        s.b.forEach((B, i) => { if (!B.ps.length) return; B.time += dt; const [x, y, w, h] = this.box(s, i), D = i ? 4 : 1, sd = Math.sqrt(2 * D * dt) * 30 * Math.min(1, w / 180); const R = Math.random;
          B.ps.forEach((q) => { q[0] += (R() + R() + R() - 1.5) * sd * 1.15; q[1] += (R() + R() + R() - 1.5) * sd * 1.15; if (q[0] < x + 5) q[0] = 2 * (x + 5) - q[0]; if (q[0] > x + w - 5) q[0] = 2 * (x + w - 5) - q[0]; if (q[1] < y + 16) q[1] = 2 * (y + 16) - q[1]; if (q[1] > y + h - 6) q[1] = 2 * (y + h - 6) - q[1]; });
          B.acc = (B.acc || 0) + dt; if (B.acc > 0.5) { B.acc = 0; B.hist.push([B.time, this.spread(s, i)]); } });
      },
      down(s, p) { const dx = s.dx ?? s.W * 0.32, dy = s.dy ?? s.H * 0.22; if (Math.hypot(p.x - dx, p.y - dy) < 60) s.drag = true; },
      move(s, p, held) { if (held && s.drag) { s.dx = p.x; s.dy = Math.min(p.y, s.H * 0.24); } },
      up(s) { if (!s.drag) return; s.drag = false; [0, 1].forEach((i) => { const [x, , w] = this.box(s, i); if (s.dx > x && s.dx < x + w) this.drop(s, i); }); s.dx = s.W * 0.32; s.dy = s.H * 0.22; },
      act(s, a) { this.drop(s, +a.slice(1)); },
      steps: [(s) => s.b[0].ps.length > 0, (s) => s.b[1].ps.length > 0, (s) => KINDS.ink.spread(s, 1) > 0.8],
      draw(c, W, H, s, t) {
        bg(c, W, H, 'rgba(120,170,230,.16)');
        c.fillStyle = lin(c, 0, H * 0.86, 0, H, ['#c9a77a', '#a6835a']); c.fillRect(0, H * 0.86, W * 0.64, H * 0.14); line(c, 0, H * 0.86, W * 0.64, H * 0.86, '#8a6a44', 2);
        s.b.forEach((B, i) => {
          const [x, y, w, h] = this.box(s, i), sp = this.spread(s, i);
          // 받침: 찬물은 얼음 그릇, 더운물은 전열기
          if (i) { rr(c, x - 6, y + h + 2, w + 12, H * 0.86 - y - h - 2, 4, lin(c, 0, y + h, 0, H * 0.86, ['#5d6577', '#3a4058'])); for (let k = 0; k < 5; k++) line(c, x + 14 + k * (w - 28) / 4, y + h + 6, x + 14 + k * (w - 28) / 4, y + h + 10, `rgba(255,${90 + Math.sin(t * 6 + k) * 40},40,.95)`, 3); }
          else { rr(c, x - 6, y + h + 2, w + 12, H * 0.86 - y - h - 2, 4, lin(c, 0, y + h, 0, H * 0.86, ['#dfe9f5', '#b9c9de'])); }
          shadow(c, x + w / 2, y + h + 4, w * 0.5, 0.18);
          beaker(c, x, y, w, h, i ? 'rgba(170,205,240,.45)' : 'rgba(150,200,245,.5)', 0.94);
          if (!i) for (let k = 0; k < 3; k++) { const ix = x + 14 + k * w * 0.3, iy = y + h * 0.06 + Math.sin(t * 1.2 + k) * 2; rr(c, ix, iy, w * 0.18, w * 0.13, 4, 'rgba(240,250,255,.85)', 'rgba(120,160,200,.8)', 1.2); }
          if (i) for (let k = 0; k < 4; k++) { const u = (t * 0.4 + k / 4) % 1; c.strokeStyle = `rgba(140,140,150,${0.4 * (1 - u)})`; c.lineWidth = 3; c.beginPath(); const sx = x + w * (0.25 + k * 0.17); c.moveTo(sx, y - u * 50); c.bezierCurveTo(sx - 8, y - 15 - u * 50, sx + 8, y - 30 - u * 50, sx, y - 45 - u * 50); c.stroke(); }
          // 잉크 구름: 흐리게 번진 덩어리 + 작은 알갱이
          c.save(); c.beginPath(); c.rect(x + 2, y + h * 0.06, w - 4, h * 0.94 - 4); c.clip();
          c.filter = 'blur(6px)'; B.ps.forEach(([a, b2], k) => { if (k % 2 === 0) circ(c, a, b2, 8, 'rgba(110,40,170,.22)'); }); c.filter = 'none';
          B.ps.forEach(([a, b2], k) => { if (k % 4 === 0) circ(c, a, b2, 1.3, 'rgba(90,30,140,.55)'); });
          c.restore();
          // 온도계
          const tx = x + w - 16; rr(c, tx - 4, y - 30, 8, h * 0.7, 4, '#ffffff', '#5d6577', 1.2); circ(c, tx, y - 30 + h * 0.7 + 4, 7, '#d8322a', '#5d6577', 1.2); rr(c, tx - 2, y - 30 + h * 0.7 * (1 - (i ? 0.72 : 0.22)), 4, h * 0.7 * (i ? 0.72 : 0.22) + 2, 2, '#d8322a');
          pill(c, x + w / 2 - 10, y - 24, i ? '더운물 60 °C' : '찬물 10 °C', i ? '#ffb48a' : '#a8d4ff', '#1d2433', '800 15px');
          txt(c, B.ps.length ? `${B.time.toFixed(1)}초 · 고르게 퍼진 정도 ${Math.round(sp * 100)}` : '아직 잉크 없음', x + w / 2, H * 0.94, INK, '800 13px');
        });
        // 스포이트(유리관 · 고무 꼭지 · 잉크)
        const dx = s.dx ?? W * 0.32, dy = s.dy ?? H * 0.22;
        rr(c, dx - 10, dy - 54, 20, 26, [10, 10, 4, 4], lin(c, dx - 10, 0, dx + 10, 0, ['#e05a5a', '#b02a2a'])); rr(c, dx - 6, dy - 30, 12, 34, [2, 2, 6, 6], 'rgba(230,240,255,.7)', '#5d6577', 1.5); rr(c, dx - 4, dy - 8, 8, 12, [1, 1, 4, 4], '#7a30b0');
        if (!s.drag && !s.b[0].ps.length && !s.b[1].ps.length) txt(c, '스포이트', dx, dy - 62, INK, '700 12px');
        // 오른쪽: 시간–고르게 퍼진 정도 그래프(두 비커 함께)
        const G = graph(c, W * 0.72, H * 0.16, W * 0.24, H * 0.5, [0, 30], [0, 1], '시간(초)', '고르게 퍼진 정도', [0, 10, 20, 30]);
        [0, 0.5, 1].forEach((v) => txt(c, String(v * 100), W * 0.72 - 6, G.Y(v) + 4, DIM, '600 11px', 'right'));
        s.b.forEach((B, i) => { c.strokeStyle = i ? '#e06a2a' : '#2a7fc0'; c.lineWidth = 3; c.beginPath(); B.hist.forEach(([tt, v], k) => (k ? c.lineTo(G.X(Math.min(30, tt)), G.Y(v)) : c.moveTo(G.X(tt), G.Y(v)))); c.stroke(); if (B.hist.length) { const [tt, v] = B.hist[B.hist.length - 1]; circ(c, G.X(Math.min(30, tt)), G.Y(v), 4, i ? '#e06a2a' : '#2a7fc0'); } });
        txt(c, '— 더운물', W * 0.73, H * 0.76, '#c0561e', '800 13px', 'left'); txt(c, '— 찬물', W * 0.85, H * 0.76, '#1f6aa8', '800 13px', 'left');
      },
      say(s, cur) { const a = this.spread(s, 0), b = this.spread(s, 1); return [['', '① 스포이트를 끌어 찬물에 잉크를 떨어뜨리자', '② 더운물에도 떨어뜨리자', '③ 더운물이 고르게 퍼질 때까지 지켜보자'][cur] || '더운물에서 훨씬 빨리 고르게 퍼진다', s.b[0].ps.length || s.b[1].ps.length ? `고르게 퍼진 정도 — 찬물 <b>${Math.round(a * 100)}</b> · 더운물 <b>${Math.round(b * 100)}</b>. 저어 주지 않아도 퍼진다` : '두 비커의 물은 양이 같고 온도만 다르다']; },
    },

    /* ── 3-3-2 · 1 생활 속 확산: 인공 신장(혈액 투석) ── */
    kidney: {
      init() { const R = rnd(3), ps = []; for (let k = 0; k < 70; k++) ps.push({ x: R() * 0.45, y: R(), k: 'u' }); for (let k = 0; k < 7; k++) ps.push({ x: 0.08 + R() * 0.3, y: R(), k: 'r' }); for (let k = 0; k < 6; k++) ps.push({ x: 0.08 + R() * 0.3, y: R(), k: 'p' }); return { ps, pump: false, flow: false, out: 0, eq: false, t0: 0 }; },
      tick(s, dt) {
        const R = Math.random; let L = 0, Rt = 0;
        s.ps.forEach((q) => {
          const sd = (q.k === 'u' ? 0.045 : 0.006) * Math.sqrt(dt / 0.0167); q.x += (R() - 0.5) * sd * 2; q.y += (R() - 0.5) * sd * 2;
          if (s.pump && q.x < 0.5) q.y += dt * 0.22; if (s.flow && q.x > 0.5) q.y -= dt * 0.25;
          if (q.y > 1) q.y -= 1; if (q.y < 0) { if (q.x > 0.5 && s.flow) { q.dead = true; s.out++; } else q.y += 1; }
          const lim = q.k === 'u' ? 0.96 : 0.46; if (q.k !== 'u' && q.x > 0.46) q.x = 0.46 - (q.x - 0.46); q.x = clamp(q.x, 0.03, lim);
          if (q.k === 'u') { if (q.x < 0.5) L++; else Rt++; }
        });
        s.ps = s.ps.filter((q) => !q.dead); s.L = L; s.Rt = Rt;
        // 알갱이 수가 출렁이므로 1초 남짓 고른 차이(dA)로 보고, 거의 같은 상태가 2.5초 이어져야 평형으로 판정
        s.dA = s.dA == null ? L - Rt : s.dA + (L - Rt - s.dA) * Math.min(1, dt / 1.2);
        if (s.pump && !s.flow && !s.eq) { s.hold = Math.abs(s.dA) <= 4 ? (s.hold || 0) + dt : Math.max(0, (s.hold || 0) - dt * 0.5); if (s.hold >= 2.5) s.eq = true; }
      },
      act(s, a) { if (a === 'pump') s.pump = !s.pump; if (a === 'flow') { if (!s.eq && !s.flow) { s.warn = 2.5; return; } s.flow = !s.flow; s.flowed = true; } },
      on: (s, a) => (a === 'pump' ? s.pump : a === 'flow' ? s.flow : false),
      steps: [(s) => s.pump, (s) => s.eq, (s) => (s.L ?? 70) <= 21],
      draw(c, W, H, s, t) {
        bg(c, W, H);
        // 왼쪽: 투석기 개요(팔 → 펌프 → 투석기 → 팔)
        const ox = W * 0.05, oy = H * 0.2, cx = W * 0.27, cy = H * 0.3, ch = H * 0.46, pw = [W * 0.11, H * 0.47];
        // 팔: 위팔에서 팔꿈치를 지나 손까지, 아래팔 안쪽에 바늘 두 개를 반창고로 붙였다
        const ay = H * 0.86; c.fillStyle = lin(c, 0, ay - 22, 0, ay + 22, ['#f6d2b4', '#e2a882', '#b97a56']);
        c.beginPath(); c.moveTo(W * 0.27, ay - 24); c.quadraticCurveTo(W * 0.15, ay - 20, W * 0.085, ay - 13); c.lineTo(W * 0.085, ay + 13); c.quadraticCurveTo(W * 0.15, ay + 18, W * 0.27, ay + 26); c.closePath(); c.fill(); c.strokeStyle = '#a8704f'; c.lineWidth = 1.5; c.stroke();
        c.beginPath(); c.ellipse(W * 0.06, ay + 2, 24, 17, -0.15, 0, TAU); c.fill(); c.stroke(); for (let k = 0; k < 4; k++) { c.beginPath(); c.roundRect(W * 0.06 - 40, ay - 13 + k * 7.5, 22, 7, 3.5); c.fill(); c.stroke(); } c.beginPath(); c.ellipse(W * 0.06 + 2, ay - 15, 12, 5, -0.5, 0, TAU); c.fill(); c.stroke();
        line(c, W * 0.1, ay - 4, W * 0.26, ay - 8, 'rgba(90,70,150,.45)', 2.5); line(c, W * 0.13, ay + 4, W * 0.24, ay + 2, 'rgba(90,70,150,.35)', 2);
        [[W * 0.2, ay - 12], [W * 0.225, ay - 12]].forEach(([nx2, ny2]) => { rr(c, nx2 - 9, ny2 - 4, 18, 10, 2, 'rgba(255,255,255,.92)', '#c3c9d6', 1); line(c, nx2, ny2 + 2, nx2 + 6, ny2 + 8, '#9aa3be', 2); });
        txt(c, '팔(바늘 두 개)', W * 0.17, ay + 40, INK, '700 13px');
        // 관: 동맥 쪽(나가는 피) · 정맥 쪽(돌아오는 피) · 투석액 관
        const tube = (pts, col, w, flow) => { c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = w + 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(...pts[0]); c.bezierCurveTo(...pts[1], ...pts[2], ...pts[3]); c.stroke(); c.strokeStyle = col; c.lineWidth = w; c.stroke(); c.lineCap = 'butt';
          if (flow) for (let k = 0; k < 7; k++) { const u = (t * 0.35 + k / 7) % 1, q = 1 - u, bx = q * q * q * pts[0][0] + 3 * q * q * u * pts[1][0] + 3 * q * u * u * pts[2][0] + u * u * u * pts[3][0], by2 = q * q * q * pts[0][1] + 3 * q * q * u * pts[1][1] + 3 * q * u * u * pts[2][1] + u * u * u * pts[3][1]; circ(c, bx, by2, 2.6, 'rgba(255,220,220,.95)'); } };
        tube([[W * 0.2, ay - 12], [W * 0.2, H * 0.62], [pw[0] + 8, H * 0.66], [pw[0], pw[1] + 22]], '#d84545', 6, s.pump);
        tube([[pw[0], pw[1] - 22], [pw[0], H * 0.2], [cx, H * 0.14], [cx, cy - 6]], '#d84545', 6, s.pump);
        tube([[cx, cy + ch + 6], [cx, H * 0.9], [W * 0.24, ay - 30], [W * 0.225, ay - 12]], '#9c2a3a', 6, s.pump);
        tube([[cx + 30, cy + ch - 26], [cx + 44, cy + ch - 26], [cx + 52, cy + ch - 26], [W * 0.35, cy + ch - 26]], '#5aa9f0', 5, s.flow);
        tube([[cx + 30, cy + 26], [cx + 44, cy + 26], [cx + 52, cy + 26], [W * 0.35, cy + 26]], '#5aa9f0', 5, s.flow);
        // 투석기: 투명한 원통 속 가는 관(속빈 섬유) 다발
        c.fillStyle = lin(c, cx - 28, 0, cx + 28, 0, ['rgba(160,190,230,.25)', 'rgba(220,235,255,.12)', 'rgba(140,170,220,.3)']); c.beginPath(); c.roundRect(cx - 28, cy, 56, ch, 14); c.fill();
        for (let i = 0; i < 9; i++) { const x = cx - 20 + i * 5; line(c, x, cy + 12, x, cy + ch - 12, s.pump ? 'rgba(235,90,95,.85)' : 'rgba(200,90,95,.6)', 2.2); }
        rr(c, cx - 28, cy, 56, ch, 14, null, 'rgba(230,240,255,.85)', 2); rr(c, cx - 31, cy - 6, 62, 14, 6, lin(c, 0, cy - 6, 0, cy + 8, ['#c9d2e8', '#7d88a6'])); rr(c, cx - 31, cy + ch - 8, 62, 14, 6, lin(c, 0, cy + ch - 8, 0, cy + ch + 6, ['#c9d2e8', '#7d88a6']));
        rr(c, cx - 20, cy + 14, 5, ch - 28, 2, 'rgba(255,255,255,.25)');
        txt(c, '투석기', cx, cy - 16, INK, '800 14px'); txt(c, '새 투석액', W * 0.335, cy + ch - 34, '#9cc8ff', '700 12px'); txt(c, '버림', W * 0.335, cy + 18, '#9cc8ff', '700 12px');
        // 펌프: 둥근 몸통 속 롤러가 돌며 관을 눌러 피를 밀어낸다
        circ(c, pw[0], pw[1], 24, rad(c, pw[0], pw[1], 24, ['#58628a', '#343c5c', '#1d2238']), '#9aa6c4', 2.5);
        const ang = s.pump ? t * 3 : 0.4; for (let k = 0; k < 3; k++) { const a = ang + k / 3 * TAU; line(c, pw[0], pw[1], pw[0] + Math.cos(a) * 15, pw[1] + Math.sin(a) * 15, '#cfd6ea', 3); circ(c, pw[0] + Math.cos(a) * 15, pw[1] + Math.sin(a) * 15, 4.5, '#e8edf7', '#5a6488', 1); }
        circ(c, pw[0], pw[1], 4, '#e8edf7'); txt(c, s.pump ? '펌프 돎' : '펌프', pw[0] - 30, pw[1] + 5, s.pump ? GRN : DIM, '800 13px', 'right');
        // 확대 칸: 가운데 막(구멍), 왼쪽 혈액(아래로), 오른쪽 투석액(위로)
        const zx = W * 0.36, zy = H * 0.13, zw = W * 0.4, zh = H * 0.66, X = (u) => zx + u * zw, Y = (u) => zy + u * zh;
        line(c, cx + 28, cy + ch / 2, zx, zy + zh / 2, 'rgba(255,216,77,.5)', 1.5, [5, 5]); circ(c, cx, cy + ch / 2, 12, null, 'rgba(255,216,77,.8)', 2);
        c.save(); c.beginPath(); c.roundRect(zx, zy, zw, zh, 12); c.clip();
        c.fillStyle = lin(c, zx, 0, X(0.5), 0, ['rgba(160,40,50,.55)', 'rgba(190,70,80,.45)']); c.fillRect(zx, zy, zw / 2, zh);
        c.fillStyle = s.flow ? 'rgba(70,140,220,.35)' : 'rgba(70,120,190,.28)'; c.fillRect(X(0.5), zy, zw / 2, zh);
        for (let i = 0; i < 6; i++) { const u = ((s.pump ? t * 0.22 : 0) + i / 6) % 1; arrow(c, X(0.24), Y(u) - 14, X(0.24), Y(u) + 10, 'rgba(255,200,200,.25)', 2); const w2 = ((s.flow ? -t * 0.25 : 0) + i / 6 + 10) % 1; arrow(c, X(0.76), Y(w2) + 10, X(0.76), Y(w2) - 14, 'rgba(200,225,255,.25)', 2); }
        s.ps.forEach((q) => { const x = X(q.x), y = Y(q.y); if (q.k === 'u') circ(c, x, y, 4, '#ffe066', '#a88a10', 1); else if (q.k === 'r') { c.save(); c.translate(x, y); c.scale(1, 0.55); circ(c, 0, 0, 13, rad(c, 0, 0, 13, ['#ff9a9a', '#d0303a', '#7a1018'])); circ(c, 0, 0, 5, 'rgba(120,10,20,.5)'); c.restore(); } else { c.fillStyle = '#b48cf0'; c.beginPath(); for (let k = 0; k < 7; k++) { const a = k / 7 * TAU, r2 = 9 + (k % 2) * 3; c.lineTo(x + Math.cos(a) * r2, y + Math.sin(a) * r2); } c.fill(); } });
        c.restore();
        for (let i = 0; i < 22; i++) { const y = zy + i * zh / 22; rr(c, X(0.5) - 4, y + 4, 8, zh / 22 - 9, 3, '#e8edf7'); }
        rr(c, zx, zy, zw, zh, 12, null, '#d9dfef', 2.5);
        pill(c, X(0.24), zy + 22, '혈액', '#ffffff', '#9c2a3a', '800 15px'); pill(c, X(0.76), zy + 22, '투석액', '#ffffff', '#1f5f9a', '800 15px'); txt(c, '막(작은 구멍)', X(0.5), zy + zh + 20, INK, '700 13px');
        // 계기
        // 양쪽 농도 차 막대(기다리는 동안 줄어드는 것이 보이게) · 경고
        if (s.warn) { s.warn = Math.max(0, s.warn - 0.016); pill(c, X(0.5), zy + zh * 0.5, '먼저 투석액을 그대로 두고 양쪽이 비슷해질 때까지 기다려 보자', '#fff1b8', '#1d2433', '800 13px'); }
        if (s.pump && !s.eq) { const d = Math.round(Math.abs(s.dA ?? 70)), near = d <= 4; pill(c, X(0.5), zy + zh + 42, near ? `차이 약 ${d}개 — 거의 같아졌다. 그대로 유지되는지 지켜보는 중` : `혈액 쪽이 약 ${d}개 더 많다 — 차이가 거의 없어질 때까지 기다리는 중`, near ? '#e6f7df' : '#ffffff', '#1d2433', '700 12px'); rr(c, X(0.12), zy + zh + 56, zw * 0.76, 8, 4, '#e2e6ee'); rr(c, X(0.12), zy + zh + 56, zw * 0.76 * clamp(1 - d / 70, 0, 1), 8, 4, '#2f7a3a'); if (near) rr(c, X(0.12), zy + zh + 66, zw * 0.76 * clamp((s.hold || 0) / 2.5, 0, 1), 4, 2, '#7fbf6a'); }
        else if (s.eq && !s.flow) { if (s.flowed) { pill(c, X(0.5), zy + zh + 42, '투석액이 멈췄다 — 다시 누르면 새 투석액이 흐른다', '#fff1b8', '#1d2433', '800 12px'); } else pill(c, X(0.5), zy + zh + 42, '양쪽 요소 수가 거의 같아졌다 — 이제 새 투석액을 흘려 보자', '#b9efb0', '#1d2433', '800 12px'); }
        else if (s.flow) pill(c, X(0.5), zy + zh + 42, '새 투석액이 흐르는 중 — 단추를 한 번 더 누르면 멈춘다', '#dcecff', '#1d2433', '700 12px');
        const gx = W * 0.8, L = s.L ?? 70;
        txt(c, '혈액 속 요소', gx + W * 0.08, H * 0.2, INK, '700 14px');
        rr(c, gx + W * 0.06, H * 0.24, 40, H * 0.4, 8, 'rgba(255,255,255,.08)', DIM, 1.5); rr(c, gx + W * 0.06 + 4, H * 0.24 + H * 0.4 * (1 - L / 70) + 4, 32, H * 0.4 * L / 70 - 8 + 0.01, 6, '#ffe066');
        txt(c, `${Math.round(L / 70 * 100)} %`, gx + W * 0.08 + 8, H * 0.7, YEL, '800 17px');
        [['#ffe066', '요소(작다)'], ['#d0303a', '적혈구'], ['#b48cf0', '단백질']].forEach(([col, nm], i) => { circ(c, gx + 8, H * 0.78 + i * 22, 6, col); txt(c, nm, gx + 20, H * 0.78 + i * 22 + 5, DIM, '600 13px', 'left'); });
      },
      say(s, cur) { const L = s.L ?? 70, T = L + (s.Rt ?? 0), Ls = s.flow || s.dA == null ? L : Math.round((T + s.dA) / 2); return [['', '① ‘펌프’를 눌러 혈액을 흘려보내자', '② 투석액을 그대로 두고 양쪽 요소 수가 비슷해질 때까지 기다리자', '③ ‘새 투석액 흘리기’로 혈액 속 요소를 30 % 아래로'][cur] || '농도 차가 있어야 요소가 계속 빠져나간다', `요소 알갱이 — 혈액 쪽 <b>${Ls}</b>개 · 투석액 쪽 <b>${T - Ls}</b>개 (혈액 속 요소 <b>${Math.round(Ls / 70 * 100)} %</b>). 작은 요소는 막을 지나고 적혈구·단백질은 남는다${s.flow ? '. 새 투석액이 요소를 씻어 가 농도 차가 다시 생긴다' : s.flowed ? '. 투석액이 멈추면 양쪽이 다시 같아질 때까지만 빠진다' : s.eq ? '. 양쪽 농도가 같아져 오가는 양이 같으니 더 줄지 않는다' : ''}`]; },
    },
    /* ── 3-3-2 · 2 탐구: 감자 조각으로 세포 속 진하기 어림하기 ── */
    potato: {
      C: [0, 0.1, 0.2, 0.3, 0.4, 0.5],
      init: () => ({ soak: [0, 0, 0, 0, 0, 0], min: 0, run: false, mark: null }),
      dm(cn, m) { return 16 * (0.25 - cn) / 0.25 * (1 - Math.exp(-m / 10)); },
      tick(s, dt) { if (s.run) { s.min = Math.min(30, s.min + dt * 6); if (s.min >= 30) s.run = false; } },
      bx(s, i) { return [s.W * 0.045 + i * s.W * 0.097, s.H * 0.13, s.W * 0.078, s.H * 0.29]; },
      gr(s) { return [s.W * 0.715, s.H * 0.13, s.W * 0.245, s.H * 0.52]; },
      down(s, p) { for (let i = 0; i < 6; i++) { const [x, y, w, h] = this.bx(s, i); if (hit(p, x, y - 20, w, h + 40) && !s.soak[i]) { s.soak[i] = 1; if (s.min) s.min = 0; } } const [gx, gy, gw, gh] = this.gr(s); if (hit(p, gx, gy, gw, gh)) { s.gdrag = true; s.mark = clamp((p.x - gx) / gw * 0.6, 0, 0.6); } },
      move(s, p, held) { if (held && s.gdrag) { const [gx, , gw] = this.gr(s); s.mark = clamp((p.x - gx) / gw * 0.6, 0, 0.6); } },
      up(s) { s.gdrag = false; },
      act(s, a) { if (a === 'wait') { s.run = true; s.min = 0; } if (a === 'all') s.soak = [1, 1, 1, 1, 1, 1]; },
      steps: [(s) => s.soak.filter(Boolean).length >= 4, (s) => s.min >= 30, (s) => s.mark != null && Math.abs(s.mark - 0.25) < 0.035 && s.min >= 30],
      draw(c, W, H, s, t) {
        bg(c, W, H);
        // 실험대
        const ty = H * 0.42 + 2; c.fillStyle = lin(c, 0, ty, 0, ty + 14, ['#9a6c3e', '#6a4624']); c.fillRect(W * 0.02, ty, W * 0.6, 12); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(W * 0.02, ty + 12, W * 0.6, 5);
        this.C.forEach((cn, i) => { const [x, y, w, h] = this.bx(s, i), d = s.soak[i] ? this.dm(cn, s.min) : 0;
          shadow(c, x + w / 2, y + h + 4, w * 0.5, 0.3);
          beaker(c, x, y, w, h, `rgba(${Math.round(150 + cn * 160)},${Math.round(190 + cn * 60)},240,.32)`, 0.8);
          const R = rnd(i + 2); for (let k = 0; k < cn * 40; k++) circ(c, x + 6 + R() * (w - 12), y + h * 0.25 + R() * h * 0.7, 1.4, 'rgba(255,255,255,.7)');
          if (s.soak[i]) { const L = h * 0.5 * (1 + d / 100 * 2.2), Wd = 15 * (1 + d / 100 * 1.2); c.save(); c.translate(x + w / 2, y + h * 0.6); c.rotate(0.12 + Math.sin(t + i) * 0.02); rr(c, -Wd / 2, -L / 2, Wd, L, 3, lin(c, -Wd / 2, 0, Wd / 2, 0, d < -4 ? ['#cdb468', '#e0c983', '#a98f45'] : ['#f2e3a6', '#fdf5cf', '#d9c47c']), d < -4 ? '#8a7236' : '#9c8547', 1.2); for (let k = 0; k < 4; k++) circ(c, (k % 2 - 0.5) * Wd * 0.4, -L * 0.3 + k * L * 0.2, 1.2, 'rgba(150,120,60,.5)'); c.restore();
            if (d < -4) for (let k = 0; k < 3; k++) { const u = (t * 0.6 + k / 3) % 1; circ(c, x + w / 2 + 10 + u * 8, y + h * 0.6 - 10 + k * 10, 2, `rgba(150,210,255,${1 - u})`); } }
          else txt(c, '누르기', x + w / 2, y + h * 0.58 + Math.sin(t * 4 + i) * 3, YEL, '800 13px');
          txt(c, `${cn.toFixed(1)} M`, x + w / 2, y + h + 28, INK, '800 14px');
          if (s.soak[i] && s.min >= 5) txt(c, `${d >= 0 ? '+' : ''}${d.toFixed(1)} %`, x + w / 2, y - 8, d > 0.5 ? '#2f7a3a' : d < -0.5 ? '#c0392b' : '#8a6a10', '800 13px');
        });
        txt(c, '↑ 설탕물 농도', W * 0.045, H * 0.42 + 46, DIM, '700 12px', 'left');
        // 저울로 잰 기록표(처음 5.00 g은 예)
        const tx0 = W * 0.04, ty0 = H * 0.55, cw2 = [0.13, 0.14, 0.15, 0.13].map((f) => f * W), rh = H * 0.053, M0 = 5;
        rr(c, tx0 - 6, ty0 - 30, cw2.reduce((a, b) => a + b) + 12, rh * 7 + 38, 10, 'rgba(255,255,255,.05)', 'rgba(185,194,216,.3)');
        txt(c, '전자저울로 잰 감자 조각 질량', tx0, ty0 - 10, YEL, '800 14px', 'left');
        ['설탕물 농도', '처음 질량', `${Math.round(s.min)}분 뒤 질량`, '질량 변화'].forEach((h, k) => { const x = tx0 + cw2.slice(0, k).reduce((a, b) => a + b, 0); txt(c, h, x + cw2[k] / 2, ty0 + rh * 0.7, DIM, '700 13px'); });
        line(c, tx0, ty0 + rh, tx0 + cw2.reduce((a, b) => a + b), ty0 + rh, 'rgba(185,194,216,.4)', 1.5);
        this.C.forEach((cn, i) => { const y = ty0 + rh * (i + 1.7), d = this.dm(cn, s.min), on = s.soak[i], got = on && s.min >= 5;
          const cells = [`${cn.toFixed(1)} M`, on ? `${M0.toFixed(2)} g` : '—', got ? `${(M0 * (1 + d / 100)).toFixed(2)} g` : '—', got ? `${d >= 0 ? '+' : ''}${d.toFixed(1)} %` : '—'];
          cells.forEach((v, k) => { const x = tx0 + cw2.slice(0, k).reduce((a, b) => a + b, 0); txt(c, v, x + cw2[k] / 2, y, k === 3 && got ? (d > 0.5 ? GRN : d < -0.5 ? RED : YEL) : on ? INK : DIM, k === 3 ? '800 14px' : '700 13px'); }); });
        // 시계(지난 시간)
        const ccx = W * 0.75, ccy = H * 0.9; circ(c, ccx, ccy, 22, '#f4f1e6', '#1d2433', 2); for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; line(c, ccx + Math.cos(a) * 17, ccy + Math.sin(a) * 17, ccx + Math.cos(a) * 20, ccy + Math.sin(a) * 20, '#1d2433', 1.2); }
        line(c, ccx, ccy, ccx + Math.sin(s.min / 60 * TAU) * 16, ccy - Math.cos(s.min / 60 * TAU) * 16, '#c0392b', 2.5);
        txt(c, `담근 시간 ${Math.round(s.min)}분`, ccx + 32, ccy + 6, INK, '800 16px', 'left');
        // 그래프
        const [gx, gy, gw, gh] = this.gr(s), G = graph(c, gx, gy, gw, gh, [0, 0.6], [-20, 20], '설탕물 농도(M)', '질량 변화(%)', [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6]);
        line(c, gx, G.Y(0), gx + gw, G.Y(0), 'rgba(255,255,255,.35)', 1.5, [4, 4]); [-20, -10, 0, 10, 20].forEach((v) => txt(c, (v > 0 ? '+' : '') + v, gx - 8, G.Y(v) + 4, DIM, '600 12px', 'right'));
        const pts = this.C.map((cn, i) => (s.soak[i] && s.min >= 5 ? [G.X(cn), G.Y(this.dm(cn, s.min))] : null)).filter(Boolean);
        if (pts.length > 1) { c.strokeStyle = 'rgba(255,216,77,.6)'; c.lineWidth = 2; c.beginPath(); pts.forEach(([x, y], k) => (k ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke(); }
        pts.forEach(([x, y]) => ball(c, x, y, 6, 45));
        if (s.mark != null) { const x = G.X(s.mark); line(c, x, gy, x, gy + gh, GRN, 2.5); pill(c, x, gy - 14, `${s.mark.toFixed(2)} M`, GRN, '#1d2433', '800 13px'); }
        else if (s.min >= 30) txt(c, '그래프를 눌러 0이 되는 농도 찾기', gx + gw / 2 - 20, gy + gh + 52, YEL, '800 13px');
      },
      say(s, cur) { return [['', '① 비커를 눌러 감자 조각을 넷 이상 담그자', '② ‘30분 기다리기’를 누르자', '③ 그래프를 끌어 질량 변화가 0인 농도를 찾자'][cur] || '감자 세포 속 진하기는 약 0.25 M 설탕물과 비슷하다(예)', s.min < 5 ? '감자 조각의 처음 질량을 재고 설탕물에 담근다' : `${Math.round(s.min)}분 — 묽은 설탕물에서는 물이 들어와 <b>무거워지고</b>, 진한 설탕물에서는 물이 빠져 <b>가벼워진다</b>${s.mark != null ? ` · 고른 농도 ${s.mark.toFixed(2)} M` : ''}`]; },
    },
    /* ── 3-3-3 · 1 이론: 세포 속 유전자는 어디에 있을까 ── */
    zoom: {
      init: () => ({ v: 0 }),
      down(s, p) { s.x0 = p.x; s.v0 = s.v; },
      move(s, p, held) { if (held && s.x0 != null) s.v = clamp(s.v0 + (p.x - s.x0) / s.W * 1.2, 0, 1); },
      up(s) { s.x0 = null; },
      key(s, e) { const d = { ArrowRight: 0.05, ArrowLeft: -0.05 }[e.key]; if (!d) return false; s.v = clamp(s.v + d, 0, 1); return true; },
      act(s, a) { s.v = +a.slice(1) / 4; },
      on: (s, a) => Math.abs(s.v - +a.slice(1) / 4) < 0.07,
      steps: [(s) => s.v >= 0.24, (s) => s.v >= 0.74, (s) => s.v >= 0.98],
      lv(c, k, cx, cy, R, t) {
        if (k === 0) { // 세포: 세포막 · 소포체 · 골지체 · 마이토콘드리아 · 라이보솜 · 핵
          c.save(); c.beginPath(); for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU, r = R * (1 + Math.sin(a * 3 + t * 0.6) * 0.025 + Math.cos(a * 5) * 0.02); c.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.92); } c.closePath();
          c.fillStyle = rad(c, cx, cy, R, ['rgba(255,226,210,.55)', 'rgba(240,170,150,.38)', 'rgba(170,90,90,.45)']); c.fill(); c.strokeStyle = '#ffb49a'; c.lineWidth = 5; c.stroke(); c.strokeStyle = 'rgba(255,240,230,.5)'; c.lineWidth = 1.5; c.stroke(); c.clip();
          for (let j = 0; j < 4; j++) { c.strokeStyle = 'rgba(130,190,255,.55)'; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, R * (0.42 + j * 0.065), 2.6 + j * 0.15, 4.4 + j * 0.1); c.stroke(); }
          for (let j = 0; j < 4; j++) { c.strokeStyle = 'rgba(255,214,120,.8)'; c.lineWidth = 4; c.beginPath(); c.arc(cx + R * 0.52, cy + R * 0.5, R * (0.1 + j * 0.05), 3.6, 5.4); c.stroke(); }
          [[0.55, -0.45, 0.6], [-0.6, 0.35, 2.2], [0.1, 0.72, 0.2], [-0.35, -0.68, 2.8], [0.72, 0.1, 1.6]].forEach(([a, b, r0]) => { c.save(); c.translate(cx + a * R, cy + b * R); c.rotate(r0 + Math.sin(t * 0.7 + a) * 0.1); c.fillStyle = rad(c, 0, 0, R * 0.13, ['#ffd0a0', '#e8925a', '#a8582a']); c.beginPath(); c.ellipse(0, 0, R * 0.14, R * 0.07, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(120,50,20,.7)'; c.lineWidth = 1.5; c.beginPath(); for (let q = 0; q <= 8; q++) c.lineTo(-R * 0.11 + q * R * 0.0275, (q % 2 ? 1 : -1) * R * 0.035); c.stroke(); c.restore(); });
          const Rn = rnd(5); for (let i = 0; i < 40; i++) { const a = Rn() * TAU, r = R * (0.45 + Rn() * 0.45); circ(c, cx + Math.cos(a) * r, cy + Math.sin(a) * r, 2, 'rgba(90,60,140,.7)'); }
          c.restore();
          circ(c, cx, cy, R * 0.34, rad(c, cx, cy, R * 0.34, ['#c9a8ff', '#8a5fd0', '#4d2f8a']), '#d8c2ff', 3); circ(c, cx + R * 0.08, cy - R * 0.06, R * 0.09, 'rgba(60,30,110,.8)'); txt(c, '핵', cx - R * 0.1, cy + R * 0.16, '#fff', '800 18px');
          txt(c, '마이토콘드리아', cx + R * 0.55, cy - R * 0.62, '#ffd0a0', '700 13px'); txt(c, '세포막', cx - R * 0.78, cy - R * 0.86, '#ffb49a', '700 13px');
        } else if (k === 1) { // 핵
          circ(c, cx, cy, R, rad(c, cx, cy, R, ['#b694f2', '#6c47b0', '#35206a']), '#d8c2ff', 5); circ(c, cx, cy, R - 8, null, 'rgba(216,194,255,.5)', 2);
          for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; circ(c, cx + Math.cos(a) * (R - 4), cy + Math.sin(a) * (R - 4), 5, '#2a1850'); }
          c.strokeStyle = 'rgba(255,220,250,.75)'; c.lineWidth = 2.5; for (let j = 0; j < 7; j++) { c.beginPath(); for (let i = 0; i < 30; i++) { const u = i / 29, a = j * 0.9 + u * 3; c.lineTo(cx + Math.cos(a + Math.sin(t * 0.5 + j)) * R * 0.75 * u, cy + Math.sin(a * 1.3) * R * 0.7 * u); } c.stroke(); }
          circ(c, cx + R * 0.25, cy - R * 0.2, R * 0.16, 'rgba(60,30,110,.8)');
        } else if (k === 2) { // 염색체
          [-1, 1].forEach((sg) => { c.save(); c.translate(cx, cy); c.rotate(sg * 0.18); rr(c, -R * 0.16 + sg * R * 0.1, -R * 0.95, R * 0.24, R * 1.9, R * 0.12, lin(c, -R * 0.2, 0, R * 0.2, 0, ['#7a4fd0', '#c4a3ff', '#7a4fd0'])); for (let i = 0; i < 9; i++) { const y = -R * 0.85 + i * R * 0.2; rr(c, -R * 0.16 + sg * R * 0.1, y, R * 0.24, R * 0.06, 2, i === 2 ? YEL : 'rgba(40,20,80,.45)'); } c.restore(); });
          circ(c, cx, cy, R * 0.09, '#3a2470');
        } else if (k === 3) { // DNA 이중 나선
          const n = 26; for (let i = 0; i < n; i++) { const y = cy - R + i * R * 2 / n, ph = i * 0.5 + t * 0.8, a = Math.sin(ph) * R * 0.55, b = -a, gene = i >= 8 && i <= 15; line(c, cx + a, y, cx + b, y, gene ? YEL : 'rgba(200,210,240,.55)', gene ? 4 : 3); }
          [0, Math.PI].forEach((o) => { c.strokeStyle = o ? '#7fb8ff' : '#ff9ec7'; c.lineWidth = 7; c.beginPath(); for (let i = 0; i <= 60; i++) { const u = i / 60, y = cy - R + u * R * 2; c.lineTo(cx + Math.sin(u * 13 + o + t * 0.8) * R * 0.55, y); } c.stroke(); });
          rr(c, cx + R * 0.65, cy - R + 8 * R * 2 / 26 - 6, 8, 8 * R * 2 / 26, 4, YEL);
        } else { // 유전자: 위에 DNA 이중 나선 한 토막(유전자 구간 노랑) → 그 구간의 염기 서열 → 단백질(접힌 사슬) → 형질
          const hx0 = cx - R * 1.05, hw = R * 2.1, hy = cy - R * 0.78, n = 40;
          for (let i = 0; i < n; i++) { const x = hx0 + (i + 0.5) * hw / n, a = Math.sin(i * 0.5 + t * 0.8) * R * 0.12, g = i >= 14 && i < 26; line(c, x, hy + a, x, hy - a, g ? '#d8a000' : 'rgba(120,130,160,.7)', g ? 3.5 : 2.5); }
          [0, Math.PI].forEach((o) => { c.strokeStyle = o ? '#4f86c6' : '#d0608c'; c.lineWidth = 4; c.beginPath(); for (let i = 0; i <= 80; i++) { const u = i / 80; c.lineTo(hx0 + u * hw, hy + Math.sin(u * n * 0.5 + o + t * 0.8) * R * 0.12); } c.stroke(); });
          rr(c, hx0 + hw * 0.35, hy - R * 0.17, hw * 0.3, R * 0.34, 6, null, '#b8860b', 2.5); txt(c, '유전자', hx0 + hw * 0.5, hy - R * 0.22, '#8a6a10', '800 14px');
          const seq = 'TACGGTCAAGCT', s2 = [...seq].map((b) => PAIR[b]).join(''), bs = Math.min(R * 1.9 / seq.length, 30), x0 = cx - bs * seq.length / 2, sy = cy - R * 0.25;
          line(c, hx0 + hw * 0.35, hy + R * 0.17, x0 - 4, sy - 8, 'rgba(184,134,11,.6)', 1.5, [4, 4]); line(c, hx0 + hw * 0.65, hy + R * 0.17, x0 + bs * seq.length + 2, sy - 8, 'rgba(184,134,11,.6)', 1.5, [4, 4]);
          [...seq].forEach((b, i) => { baseBox(c, x0 + i * bs, sy, bs, b); baseBox(c, x0 + i * bs, sy + bs + 4, bs, s2[i]); });
          rr(c, x0 - 6, sy - 6, bs * seq.length + 8, bs * 2 + 16, 8, null, '#b8860b', 2.5);
          const py = sy + bs * 2 + 22; arrow(c, cx, py, cx, py + 26, '#8a6a10', 3); txt(c, '이 정보대로 아미노산을 이어', cx + 12, py + 18, INK, '700 13px', 'left');
          // 단백질(접힌 구슬 사슬)과 형질 예
          const qx = cx - R * 0.35, qy = py + 58; let px2, py2; for (let k = 0; k < 9; k++) { const a = k * 0.9 + t * 0.2, r = 14 + (k % 3) * 7, x = qx + Math.cos(a) * r, y = qy + Math.sin(a) * r * 0.7; if (k) line(c, px2, py2, x, y, '#9aa3be', 3); ball(c, x, y, 7, (k * 40) % 360); px2 = x; py2 = y; }
          txt(c, '단백질', qx, qy + 42, INK, '800 13px'); arrow(c, qx + 40, qy, qx + 78, qy, '#8a6a10', 3);
          c.fillStyle = lin(c, 0, qy - 20, 0, qy + 20, ['#6a4a2a', '#3a2414']); c.beginPath(); c.ellipse(qx + 118, qy, 30, 18, 0, 0, TAU); c.fill(); for (let k = 0; k < 9; k++) line(c, qx + 94 + k * 6, qy - 14, qx + 92 + k * 6, qy + 14, 'rgba(255,220,180,.35)', 1.2);
          txt(c, '형질(예: 털색)', qx + 118, qy + 42, INK, '800 13px');
        }
      },
      draw(c, W, H, s, t) {
        bg(c, W, H, 'rgba(150,110,230,.16)');
        const f = s.v * 4, k = Math.min(3, Math.floor(f)), u = ease(f - k), cx = W * 0.42, cy = H * 0.52, R = Math.min(W * 0.26, H * 0.36);
        if (f >= 3.999) this.lv(c, 4, cx, cy, R, t);
        else { c.save(); c.globalAlpha = 1 - u; c.translate(cx, cy); c.scale(1 + u * 2.5, 1 + u * 2.5); c.translate(-cx, -cy); this.lv(c, k, cx, cy, R, t); c.restore(); }
        if (f < 3.999) { c.save(); c.globalAlpha = u; c.translate(cx, cy); c.scale(0.4 + u * 0.6, 0.4 + u * 0.6); c.translate(-cx, -cy); this.lv(c, k + 1, cx, cy, R, t); c.restore(); }
        const L = ['세포', '핵', '염색체', 'DNA', '유전자'];
        L.forEach((nm, i) => { const x = W * 0.82, y = H * 0.16 + i * H * 0.15, on = Math.round(f) === i; rr(c, x - 70, y - 22, 140, 44, 22, on ? YEL : 'rgba(255,255,255,.06)', on ? null : 'rgba(185,194,216,.4)'); txt(c, nm, x, y + 6, on ? '#1d2433' : DIM, '800 17px'); if (i < 4) arrow(c, x, y + 24, x, y + H * 0.15 - 24, 'rgba(185,194,216,.5)', 2); });
        txt(c, '좌우로 끌어 확대', cx, H - 16, DIM, '600 13px');
      },
      say(s, cur) { const i = Math.round(s.v * 4), D = ['사람 몸은 수많은 <b>세포</b>로 이루어지고, 세포마다 <b>핵</b>이 있다', '핵 속에는 실처럼 가는 DNA가 단백질과 함께 뭉쳐 있다', '세포가 나뉠 때 DNA가 뭉쳐 <b>염색체</b>로 보인다', '<b>DNA</b>는 두 가닥이 꼬인 이중 나선이고, 안쪽에 염기 A·T·G·C가 짝지어 있다', 'DNA에서 단백질 하나의 정보를 가진 구간이 <b>유전자</b>다']; return [['', '① 오른쪽으로 끌어 핵까지 들어가 보자', '② DNA가 보일 때까지 더 끌자', '③ 끝까지 끌어 유전자를 보자'][cur] || '유전자는 DNA의 한 구간이다', D[i]]; },
    },
    /* ── 3-3-3 · 1 체험: DNA에서 유전자 찾기 ── */
    genes: {
      G: [[0.1, 0.07, '헤모글로빈', '적혈구에서 산소를 나른다', 0], [0.29, 0.05, '아밀레이스', '침 속에서 녹말을 분해한다', 140], [0.46, 0.06, '인슐린', '혈액 속 포도당의 양을 낮춘다', 50], [0.67, 0.08, '케라틴', '머리카락과 손톱을 이룬다', 30], [0.86, 0.06, '멜라닌 합성 효소', '피부와 털의 색소를 만든다', 280]],
      init: () => ({ x: 0.03, found: [] }),
      cur(s) { return this.G.findIndex(([a, w]) => Math.abs(s.x - a) < w / 2); },
      tick(s) { const i = this.cur(s); if (i >= 0 && !s.found.includes(i)) s.found.push(i); },
      down(s, p) { s.x0 = p.x; s.v0 = s.x; },
      move(s, p, held) { if (held && s.x0 != null) s.x = clamp(s.v0 - (p.x - s.x0) / (s.W * 4), 0, 1); },
      up(s) { s.x0 = null; },
      key(s, e) { const d = { ArrowRight: 0.01, ArrowLeft: -0.01 }[e.key]; if (!d) return false; s.x = clamp(s.x + d, 0, 1); return true; },
      act(s, a) { const i = s.found.length < 5 ? this.G.findIndex((_, k) => !s.found.includes(k)) : 0; if (a === 'next') s.x = this.G[i][0]; },
      steps: [(s) => s.found.length >= 1, (s) => s.found.length >= 3, (s) => s.found.length >= 5],
      draw(c, W, H, s, t) {
        bg(c, W, H, 'rgba(150,110,230,.14)');
        // 위: 전체 DNA(염색체) 지도
        const mx = W * 0.08, mw = W * 0.84, my = H * 0.17;
        rr(c, mx, my, mw, 16, 8, lin(c, 0, my, 0, my + 16, ['#c4a3ff', '#7a4fd0']));
        this.G.forEach(([a, w], i) => rr(c, mx + (a - w / 2) * mw, my, w * mw, 16, 3, s.found.includes(i) ? YEL : 'rgba(255,255,255,.25)'));
        rr(c, mx + (s.x - 0.04) * mw, my - 6, 0.08 * mw, 28, 6, null, '#fff', 2.5); txt(c, 'DNA 전체(일부를 줄여 그림)', mx, my - 12, DIM, '600 12px', 'left');
        // 가운데: 크게 본 DNA 띠(끌면 흘러간다)
        const cy = H * 0.48, sc = W * 4, off = s.x * sc - W / 2;
        c.save(); c.beginPath(); c.rect(0, cy - 70, W, 140); c.clip();
        this.G.forEach(([a, w], i) => { const x0 = a * sc - w * sc / 2 - off, x1 = x0 + w * sc; c.fillStyle = s.found.includes(i) ? 'rgba(255,216,77,.16)' : 'rgba(255,255,255,.06)'; c.fillRect(x0, cy - 62, x1 - x0, 124); line(c, x0, cy - 62, x0, cy + 62, 'rgba(255,216,77,.5)', 1.5, [5, 4]); line(c, x1, cy - 62, x1, cy + 62, 'rgba(255,216,77,.5)', 1.5, [5, 4]); });
        const step = 14, i0 = Math.floor(off / step) - 1;
        for (let i = i0; i < i0 + W / step + 3; i++) { const x = i * step - off, ph = i * 0.45; const a = Math.sin(ph) * 36; const b = (Math.abs(i) * 7) % 4; line(c, x, cy + a, x, cy - a, ['#f2a541', '#ef6f5b', '#5fbf6a', '#4f9be0'][b], 4); }
        [0, Math.PI].forEach((o) => { c.strokeStyle = o ? '#7fb8ff' : '#ff9ec7'; c.lineWidth = 6; c.beginPath(); for (let x = -10; x <= W + 10; x += 6) c.lineTo(x, cy + Math.sin((x + off) / step * 0.45 + o) * 36); c.stroke(); });
        c.restore();
        // 돋보기 창
        rr(c, W / 2 - 60, cy - 76, 120, 152, 14, null, '#fff', 3); line(c, W / 2, cy + 76, W / 2, cy + 96, '#fff', 3);
        const i = this.cur(s);
        if (i >= 0) { const [, , nm, job, hue] = this.G[i];
          rr(c, W * 0.2, H * 0.72, W * 0.6, H * 0.2, 14, 'rgba(255,216,77,.12)', YEL, 2);
          txt(c, `${nm} 유전자`, W * 0.5, H * 0.72 + 30, YEL, '800 19px');
          txt(c, `→ 단백질 ${nm}: ${job}`, W * 0.5, H * 0.72 + 60, INK, '700 16px');
          for (let k = 0; k < 7; k++) ball(c, W * 0.5 - 60 + k * 20, H * 0.72 + 86 + Math.sin(t * 2 + k) * 3, 8, (hue + k * 25) % 360);
        } else txt(c, '유전자가 아닌 구간 — 단백질 정보가 없다', W / 2, H * 0.8, DIM, '700 15px');
        pill(c, W - 70, H * 0.17 + 40, `찾은 유전자 ${s.found.length} / 5`, s.found.length === 5 ? GRN : 'rgba(255,255,255,.85)', '#1d2433', '800 13px');
        txt(c, '좌우로 끌어 DNA 훑기', W / 2, cy - 88, DIM, '600 13px');
      },
      say(s, cur) { const i = this.cur(s); return [['', '① DNA를 끌어 유전자 하나를 찾자', '② 유전자를 셋까지 찾자', '③ 다섯 유전자를 모두 찾자'][cur] || '유전자마다 만드는 단백질이 다르다', i >= 0 ? `<b>${this.G[i][2]} 유전자</b> — 이 구간의 염기 서열에 단백질 ${this.G[i][2]}의 정보가 들어 있다` : 'DNA에는 유전자 구간과 그 사이 구간이 있다']; },
    },
    /* ── 3-3-3 · 1 체험: 아미노산 순서가 단백질 모양을 정한다 ── */
    fold: {
      // 접힌 모양 규칙(이해를 돕기 위한 단순화): 사슬이 둘레를 따라 돌며, 물을 싫어하는 아미노산(노랑)은 물을 피해 안쪽으로, 나머지는 바깥으로 간다
      N: [1, 2, 0, 3, 0, 1, 0, 3, 2],
      init: () => ({ seq: [1, 2, 0, 3, 0, 1, 0, 3, 2], f: 0, folding: false, okNorm: false, okMut: false, okBack: false, drag: null }),
      isN(s) { return s.seq.every((x, i) => x === this.N[i]); },
      shape(seq, f, R) {
        const n = seq.length, ext = seq.map((_, i) => [(i - (n - 1) / 2) * R * 0.42, Math.sin(i * 1.3) * R * 0.08]);
        // 순서에 따라 사슬이 도는 각도가 달라진다: 물을 싫어하는 것이 나오면 안쪽으로 크게 꺾인다
        let a = -Math.PI * 0.9; const fold = seq.map((k, i) => { if (i) a += (k === 0 ? 0.62 : k === 3 ? 0.78 : 0.7); const r = k === 0 ? R * 0.34 : R * (0.9 + (k === 2 ? 0.08 : 0)); return [Math.cos(a) * r, Math.sin(a) * r * 0.85]; });
        return ext.map(([x, y], i) => [lerp(x, fold[i][0], f), lerp(y, fold[i][1], f)]);
      },
      tick(s, dt) { if (s.folding) { s.f = Math.min(1, s.f + dt * 0.7); if (s.f >= 1) { s.folding = false; if (this.isN(s)) { if (s.okMut) s.okBack = true; else s.okNorm = true; } else if (s.okNorm) s.okMut = true; } } },
      slot(s, i) { return [s.W * 0.1 + i * s.W * 0.06, s.H * 0.88]; },
      down(s, p) { s.seq.forEach((_, i) => { const [x, y] = this.slot(s, i); if (Math.hypot(p.x - x, p.y - y) < 22) s.drag = { i, x: p.x, y: p.y }; }); },
      move(s, p, held) { if (held && s.drag) { s.drag.x = p.x; s.drag.y = p.y; } },
      up(s, p) { if (!s.drag) return; let j = -1; s.seq.forEach((_, i) => { const [x, y] = this.slot(s, i); if (Math.hypot(p.x - x, p.y - y) < 26) j = i; }); if (j >= 0 && j !== s.drag.i) { const q = s.seq.slice(); [q[j], q[s.drag.i]] = [q[s.drag.i], q[j]]; s.seq = q; s.f = 0; } s.drag = null; },
      act(s, a) { if (a === 'fold') { s.f = 0; s.folding = true; } if (a === 'orig') { s.seq = this.N.slice(); s.f = 0; } if (a === 'swap') { const q = s.seq.slice(); [q[2], q[3]] = [q[3], q[2]]; s.seq = q; s.f = 0; } },
      steps: [(s) => s.okNorm, (s) => s.okMut, (s) => s.okBack],
      COL: [[45, '물을 싫어하는'], [200, '물을 좋아하는'], [0, '(+) 전하를 띤'], [130, '(−) 전하를 띤']],
      draw(c, W, H, s, t) {
        bg(c, W, H, 'rgba(120,180,230,.18)');
        const cx = W * 0.33, cy = H * 0.42, R = Math.min(W * 0.2, H * 0.3), e = ease(s.f), pts = this.shape(s.seq, e, R), norm = this.isN(s);
        // 둘러싼 물 분자(O 빨강 · H 흰색)가 천천히 떠다닌다
        const Rw = rnd(4); for (let k = 0; k < 26; k++) { const wx = W * 0.04 + Rw() * W * 0.6 + Math.sin(t * 0.6 + k) * 6, wy = H * 0.1 + Rw() * H * 0.62 + Math.cos(t * 0.5 + k) * 5; if (Math.hypot(wx - cx, (wy - cy) / 0.85) < R * 1.05 * Math.max(0.3, e)) continue; c.save(); c.translate(wx, wy); c.rotate(k + t * 0.3); circ(c, 0, 0, 4.5, '#e86a6a'); circ(c, 5, -3, 2.6, '#ffffff', '#b9c2d8', 0.8); circ(c, -5, -3, 2.6, '#ffffff', '#b9c2d8', 0.8); c.restore(); }
        // 안쪽(물이 없는 곳) 표시
        if (e > 0.6) { c.globalAlpha = (e - 0.6) / 0.4; c.fillStyle = norm ? 'rgba(255,214,90,.18)' : 'rgba(255,122,92,.12)'; c.beginPath(); c.ellipse(cx, cy, R * 0.5, R * 0.43, 0, 0, TAU); c.fill(); c.setLineDash([5, 5]); c.strokeStyle = '#b8860b'; c.lineWidth = 1.5; c.stroke(); c.setLineDash([]); c.globalAlpha = 1; }
        // 뼈대(굵은 관)와 구슬
        c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#5d6577'; c.lineWidth = 9; c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(cx + x, cy + y) : c.moveTo(cx + x, cy + y))); c.stroke(); c.strokeStyle = '#c9d0e6'; c.lineWidth = 4; c.stroke(); c.lineCap = 'butt';
        pts.forEach(([x, y], i) => ball(c, cx + x, cy + y + Math.sin(t * 2 + i) * 1.2, R * 0.13, this.COL[s.seq[i]][0]));
        if (e > 0.95) txt(c, '물을 싫어하는 아미노산은 안쪽으로', cx, cy + R * 0.98, '#8a6a10', '800 13px');
        // 기질: 원래 모양의 홈(첫째와 마지막 구슬 사이)에만 꼭 맞는다
        if (s.f >= 1) { const [ax, ay] = pts[0], [bx, by] = pts[pts.length - 1], mx = cx + (ax + bx) / 2, my = cy + (ay + by) / 2 - 6, ok = norm;
          const sx = ok ? mx : mx - R * 0.2 + Math.sin(t * 3) * 8, sy = ok ? my - 6 : my - R * 0.45; c.save(); c.translate(sx, sy); c.rotate(ok ? 0.6 : t * 1.5); rr(c, -14, -11, 28, 22, 6, lin(c, 0, -11, 0, 11, ['#ffe9a0', '#e0b030']), '#8a6a10', 2); c.restore();
          pill(c, W * 0.52, H * 0.075, ok ? '기질과 꼭 맞는다 — 단백질이 제 일을 한다' : '모양이 달라 기질이 맞지 않는다', ok ? '#b9efb0' : '#ffc8b8', '#1d2433', '800 15px'); }
        else if (s.folding) pill(c, W * 0.52, H * 0.075, '접히는 중…', '#ffffff', '#1d2433', '700 14px');
        // 아래: 아미노산 순서(끌어 바꾸기)
        txt(c, '아미노산 순서 — 구슬을 끌어 다른 구슬 위에 놓으면 자리가 바뀐다', W * 0.1 - 20, H * 0.88 - 34, INK, '700 13px', 'left');
        s.seq.forEach((k, i) => { const [x, y] = this.slot(s, i); circ(c, x, y, 21, 'rgba(255,255,255,.8)', '#9aa3be', 1.5); if (!(s.drag && s.drag.i === i)) ball(c, x, y, 16, this.COL[k][0]); txt(c, String(i + 1), x, y + 34, DIM, '700 12px'); if (k !== this.N[i]) circ(c, x, y, 23, null, '#d8322a', 2.5); if (i) line(c, x - W * 0.06 + 21, y, x - 21, y, '#9aa3be', 2); });
        if (s.drag) ball(c, s.drag.x, s.drag.y, 19, this.COL[s.seq[s.drag.i]][0]);
        // 범례와 흐름
        const lx = W * 0.7; this.COL.forEach(([h, nm], i) => { ball(c, lx, H * 0.14 + i * 30, 9, h); txt(c, nm + ' 아미노산', lx + 18, H * 0.14 + i * 30 + 5, INK, '700 13px', 'left'); });
        ['유전자의 염기 서열', '아미노산 순서', '입체 모양', '단백질의 기능'].forEach((l, i) => { const y = H * 0.5 + i * 42; rr(c, lx - 10, y - 16, W * 0.27, 32, 16, i === 2 ? '#fff1b8' : '#ffffff', '#9aa3be'); txt(c, l, lx + W * 0.125, y + 5, INK, '800 14px'); if (i < 3) arrow(c, lx + W * 0.125, y + 16, lx + W * 0.125, y + 26, DIM, 2); });
      },
      say(s, cur) { const n = this.isN(s); return [['', '① ‘접기’를 눌러 원래 순서 그대로 접어 보자', '② 구슬 둘의 자리를 바꾸고 다시 접어 보자', '③ ‘원래 순서’로 되돌려 다시 접자'][cur] || '아미노산 순서가 모양을, 모양이 기능을 정한다', n ? '아미노산 9개가 원래 순서다. 아미노산마다 성질이 달라 물을 싫어하는 것은 안쪽으로 모이며 정해진 모양으로 접힌다' : '순서가 바뀌었다(빨간 테) — 같은 아미노산이라도 <b>순서</b>가 다르면 다른 모양으로 접힌다']; },
    },

    /* ── 3-3-3 · 1 생활 속 예: 헤모글로빈 유전자 하나가 바뀌면 ── */
    sickle: {
      init: () => ({ mut: false, low: false, tn: 0, cells: Array.from({ length: 16 }, (_, i) => ({ x: i / 16, y: (i * 0.37) % 1, st: 0 })) }),
      tick(s, dt) { if (!s.mut) s.tn += dt; const sick = s.mut && s.low; s.cells.forEach((q, i) => { const zone = q.x > 0.55 && q.x < 0.7, sp = sick ? (zone ? 0.015 : 0.06) : 0.11; q.st = clamp(q.st + (sick ? dt * 1.2 : -dt * 2), 0, 1); q.x += dt * sp * (1 + (i % 3) * 0.1); if (q.x > 1.05) q.x -= 1.1; }); },
      act(s, a) { if (a === 'norm') s.mut = false; if (a === 'mut') s.mut = true; if (a === 'low') s.low = !s.low; },
      on: (s, a) => (a === 'norm' ? !s.mut : a === 'mut' ? s.mut : a === 'low' ? s.low : false),
      steps: [(s) => s.tn > 2, (s) => s.mut, (s) => s.mut && s.low && s.cells[0].st > 0.8],
      draw(c, W, H, s, t) {
        bg(c, W, H, 'rgba(220,80,90,.14)');
        // 위: 유전자 일부 → RNA 코돈 → 아미노산
        // 위: DNA 두 가닥(위 가닥 · 아래 주형 가닥) → 주형 가닥에 짝지어 전사된 RNA 코돈 → 아미노산
        const CD = ['CTG', 'ACT', 'CCT', s.mut ? 'GTG' : 'GAG', 'GAG', 'AAG'], bs = Math.min(24, W * 0.021), x0 = W * 0.2, y0 = H * 0.1, gap = 14;
        const rowY = [y0, y0 + bs * 1.05, y0 + bs * 2.5, y0 + bs * 3.9];
        txt(c, 'DNA 한 가닥', x0 - 10, rowY[0] + bs * 0.7, DIM, '700 12px', 'right'); txt(c, 'DNA 주형 가닥', x0 - 10, rowY[1] + bs * 0.7, '#5a3a9a', '800 12px', 'right'); txt(c, 'RNA 코돈', x0 - 10, rowY[2] + bs * 0.7, '#a8406c', '800 12px', 'right'); txt(c, '아미노산', x0 - 10, rowY[3] + bs * 0.7, DIM, '700 12px', 'right');
        CD.forEach((cd, i) => { const x = x0 + i * (bs * 3 + gap), hot = i === 3, tp = [...cd].map((b) => PAIR[b]).join(''), rn = cd.replace(/T/g, 'U');
          [...cd].forEach((b, j) => baseBox(c, x + j * bs, rowY[0], bs, b)); [...tp].forEach((b, j) => baseBox(c, x + j * bs, rowY[1], bs, b)); [...rn].forEach((b, j) => baseBox(c, x + j * bs, rowY[2], bs, b));
          for (let j = 0; j < 3; j++) arrow(c, x + j * bs + bs / 2 - 1.5, rowY[1] + bs + 1, x + j * bs + bs / 2 - 1.5, rowY[2] - 2, 'rgba(168,64,108,.55)', 1.5);
          const aa = AAK[code(rn)]; rr(c, x, rowY[3], bs * 3 - 3, bs, 6, hot ? (s.mut ? '#ffb4a0' : '#b9efb0') : '#ffffff', '#c3c9d6', 1); txt(c, aa, x + bs * 1.5 - 1.5, rowY[3] + bs * 0.7, INK, '700 12px');
          if (hot) rr(c, x - 4, y0 - 4, bs * 3 + 5, bs * 5.1, 8, null, '#b8860b', 2.5); });
        txt(c, 'RNA는 주형 가닥과 짝지어 만들어진다(A–U, T–A, G–C, C–G)', x0, rowY[3] + bs + 18, '#a8406c', '700 12px', 'left');
        // 아래: 모세혈관 속 적혈구 흐름
        const vy = H * 0.66, vh = H * 0.2, X = (u) => W * 0.04 + u * W * 0.92;
        c.fillStyle = 'rgba(240,170,160,.12)'; c.fillRect(0, vy - vh, W, vh * 2);
        c.fillStyle = lin(c, 0, vy - vh * 0.6, 0, vy + vh * 0.6, ['#5a1520', '#7a2230', '#5a1520']);
        c.beginPath(); c.moveTo(0, vy - vh * 0.6); for (let x = 0; x <= W; x += 10) { const u = x / W, nar = u > 0.55 && u < 0.72 ? 0.55 : 1; c.lineTo(x, vy - vh * 0.6 * nar); } for (let x = W; x >= 0; x -= 10) { const u = x / W, nar = u > 0.55 && u < 0.72 ? 0.55 : 1; c.lineTo(x, vy + vh * 0.6 * nar); } c.fill();
        s.cells.forEach((q, i) => { const x = X(q.x), y = vy + Math.sin(i * 2.1) * vh * 0.22 * (q.x > 0.55 && q.x < 0.72 ? 0.4 : 1), k = q.st; c.save(); c.translate(x, y); c.rotate(i);
          if (k < 0.3) { c.scale(1, 0.62); circ(c, 0, 0, 15, rad(c, 0, 0, 15, ['#ff9a9a', '#d0303a', '#7a1018'])); circ(c, 0, 0, 6, 'rgba(120,10,20,.5)'); }
          else { c.fillStyle = rad(c, 0, 0, 16, ['#ff9a9a', '#c0303a', '#6a1018']); c.beginPath(); c.arc(0, 0, 16, 0.3, Math.PI * 2 - 0.3); c.arc(8 * k, 0, 13, Math.PI * 2 - 0.5, 0.5, true); c.fill(); }
          c.restore(); });
        if (s.mut && s.low) pill(c, X(0.63), vy - vh - 8, '좁은 혈관에 걸려 흐름이 막힌다', RED, '#1d2433', '800 14px');
        txt(c, s.low ? '산소가 적은 곳' : '산소가 넉넉한 곳', W - 20, vy + vh + 4, s.low ? '#9cc8ff' : DIM, '700 13px', 'right');
        txt(c, '모세혈관', 20, vy + vh + 4, DIM, '700 13px', 'left');
      },
      say(s, cur) { return [['', '① 정상 적혈구가 흐르는 모습을 잠깐 보자', '② ‘바뀐 유전자’를 누르자', '③ ‘산소가 적은 곳’을 눌러 보자'][cur] || '염기 하나 → 아미노산 하나 → 모양 → 형질', s.mut ? `염기 하나(A → T)가 바뀌어 코돈 GAG가 <b>GUG</b>로, 아미노산 <b>글루탐산이 발린</b>으로 바뀌었다${s.low ? ' — 산소가 적으면 헤모글로빈이 뭉쳐 적혈구가 <b>낫 모양</b>이 된다' : ''}` : '헤모글로빈 유전자 앞부분: 여섯째 아미노산은 <b>글루탐산</b>(코돈 GAG)']; },
    },
    /* ── 3-3-3 · 2 이론: DNA와 RNA는 무엇이 다를까 ── */
    dnarna: {
      // 손 조작: RNA 중합 효소를 오른쪽으로 끌면 DNA가 그 자리에서 벌어지고, 아래 가닥(주형 가닥)에 짝지어 RNA가 만들어진다
      CODE: 'ATGGCTTACGGA',
      init: () => ({ sel: null, seen: [], u: 0, drag: false }),
      geo(s) { const n = 12, x0 = s.W * 0.05, bw = (s.W * 0.52) / n; return { n, x0, bw, y: s.H * 0.36 }; },
      down(s, p) { const { x0, bw, n, y } = this.geo(s), px = x0 + s.u * n * bw; if (Math.abs(p.y - y) < 80 && p.x < x0 + n * bw + 40) { s.drag = true; s.ox = p.x - px; } },
      move(s, p, held) { if (held && s.drag) { const { x0, bw, n } = this.geo(s); s.u = clamp(Math.max(s.u, (p.x - s.ox - x0) / (n * bw)), 0, 1); } },
      up(s) { s.drag = false; },
      act(s, a) { s.sel = a; if (!s.seen.includes(a)) s.seen.push(a); },
      on: (s, a) => s.sel === a,
      steps: [(s) => s.u >= 0.98, (s) => ['strand', 'sugar', 'base'].every((k) => s.seen.includes(k)), (s) => s.seen.includes('job')],
      draw(c, W, H, s, t) {
        bg(c, W, H, 'rgba(150,110,230,.14)');
        const { n, x0, bw, y } = this.geo(s), code = this.CODE, tmpl = [...code].map((b) => PAIR[b]).join(''), rna = code.replace(/T/g, 'U'), hl = (k) => s.sel === k, k0 = s.u * n;
        // RNA 중합 효소(끄는 손잡이) — 가닥 뒤에 반투명하게
        const ex = x0 + k0 * bw, bob = Math.sin(t * 3) * 2; c.fillStyle = rad(c, ex, y + 20, 60, ['#e6f8de', '#a6dc94', '#5fa44e']); c.globalAlpha = 0.75; c.beginPath(); c.ellipse(ex, y + 24 + bob, 40, 84, 0, 0, TAU); c.fill(); c.globalAlpha = 1; c.strokeStyle = '#2f6a2a'; c.lineWidth = 2; c.stroke();
        txt(c, 'RNA 중합 효소', ex, y - 84, '#2f6a2a', '800 16px'); if (s.u < 0.98) arrow(c, ex + 46, y + 24, ex + 80, y + 24, '#2f6a2a', 3);
        // DNA: 위 가닥(뼈대 파랑) · 아래 가닥 = 주형 가닥(뼈대 보라). 효소 자리 둘레만 벌어진다
        const open = (i) => clamp(1 - Math.abs(i + 0.5 - k0) / 2.2, 0, 1);
        const topY = (i) => y - 30 - open(i) * 30, botY = (i) => y + 30 + open(i) * 30;
        c.lineCap = 'round'; c.strokeStyle = hl('sugar') ? '#d8a000' : '#4f86c6'; c.lineWidth = hl('strand') ? 9 : 6; c.beginPath(); for (let i = 0; i <= n; i++) c.lineTo(x0 + i * bw, topY(Math.min(n - 1, i))); c.stroke();
        c.strokeStyle = hl('sugar') ? '#d8a000' : '#8a5fd0'; c.beginPath(); for (let i = 0; i <= n; i++) c.lineTo(x0 + i * bw, botY(Math.min(n - 1, i))); c.stroke(); c.lineCap = 'butt';
        for (let i = 0; i < n; i++) { const x = x0 + (i + 0.5) * bw, o = open(i), a = code[i], b = tmpl[i];
          rr(c, x - bw * 0.36, topY(i) + 2, bw * 0.72, 18 - o * 6, 3, BASE[a]); rr(c, x - bw * 0.36, botY(i) - 20 + o * 6, bw * 0.72, 18 - o * 6, 3, BASE[b]);
          if (o < 0.3) line(c, x, topY(i) + 20, x, botY(i) - 20, 'rgba(93,101,119,.5)', 1.5, [2, 3]);
          txt(c, a, x, topY(i) - 9, a === 'T' && hl('base') ? '#c0392b' : INK, '800 19px'); txt(c, b, x, botY(i) + 26, INK, '800 19px'); }
        txt(c, 'DNA 한 가닥', x0 - 4, y - 106, '#2f5f96', '800 17px', 'left'); txt(c, 'DNA 다른 가닥(주형 가닥)', x0 - 4, y + 112, '#5a3a9a', '800 17px', 'left');
        // 만들어진 RNA: 주형 가닥과 짝(A–U, T–A, G–C, C–G)
        const made = Math.floor(k0 + 0.001), ry = y + 160;
        if (made > 0) { c.strokeStyle = hl('sugar') ? '#d8a000' : '#e05a96'; c.lineWidth = hl('strand') ? 9 : 6; c.lineCap = 'round'; c.beginPath(); for (let i = 0; i <= made; i++) c.lineTo(x0 + i * bw, ry + Math.sin(i * 0.8 + t * 1.5) * 3); c.stroke(); c.lineCap = 'butt';
          for (let i = 0; i < made; i++) { const x = x0 + (i + 0.5) * bw, b = rna[i], yy = ry + Math.sin(i * 0.8 + t * 1.5) * 3; rr(c, x - bw * 0.36, yy - 22, bw * 0.72, 16, 3, BASE[b]); txt(c, b, x, yy + 26, b === 'U' ? '#c0392b' : INK, '800 19px'); }
          txt(c, 'RNA(한 가닥)', x0 - 4, ry + 54, '#a8406c', '800 17px', 'left'); }
        // 오른쪽 비교 표: 캔버스가 약 0.66배로 줄어 보이므로 20px 안팎으로 써야 화면에서 13px쯤 된다
        const px = W * 0.62, pw = W * 0.36, cA = px + pw * 0.42, cB = px + pw * 0.79, rows = [['strand', '가닥', '두 가닥(이중 나선)', '한 가닥'], ['sugar', '당', '디옥시라이보스', '라이보스'], ['base', '염기', 'A · T · G · C', 'A · U · G · C'], ['job', '있는 곳·하는 일', '핵 속에\n원본 보관', '정보를\n라이보솜으로']];
        txt(c, 'DNA', cA, H * 0.1, '#2f5f96', '800 22px'); txt(c, 'RNA', cB, H * 0.1, '#a8406c', '800 22px');
        rows.forEach(([k, nm, a, b], i) => { const yy = H * 0.14 + i * H * 0.17, rh = H * 0.15, on = hl(k), seen = s.seen.includes(k); rr(c, px, yy, pw, rh, 10, on ? '#fff1b8' : '#ffffff', on ? '#b8860b' : '#c3c9d6', on ? 2.5 : 1.2);
          txt(c, nm, px + 12, yy + 26, INK, '800 19px', 'left');
          const put = (v, x) => { const L = v.split('\n'); L.forEach((l, q) => txt(c, l, x, yy + rh * 0.7 + (q - (L.length - 1) / 2) * 24, INK, '800 20px')); };
          if (seen) { put(a, cA); put(b, cB); } else txt(c, '단추를 눌러 보기', px + pw * 0.6, yy + rh * 0.7, DIM, '700 18px'); });
        if (hl('job')) { const u = (t * 0.3) % 1; rr(c, px, H * 0.84, pw, 34, 17, '#ffffff', '#c3c9d6'); txt(c, '핵', px + 18, H * 0.84 + 24, '#5a3a9a', '800 17px'); txt(c, '라이보솜', px + pw - 12, H * 0.84 + 24, '#2f7a3a', '800 17px', 'right'); ball(c, px + 44 + u * (pw - 130), H * 0.84 + 17, 9, 330); }
      },
      say(s, cur) { const D = { strand: 'DNA는 <b>두 가닥</b>이 꼬인 이중 나선, RNA는 <b>한 가닥</b>이다', sugar: 'DNA의 당은 <b>디옥시라이보스</b>, RNA의 당은 <b>라이보스</b>다', base: 'DNA의 염기 <b>T</b> 자리에 RNA는 <b>U</b>(유라실)를 쓴다', job: 'DNA는 핵 속에 머물고, RNA가 정보를 베껴 <b>핵 밖</b> 라이보솜으로 나른다' }; return [['', '① 초록 효소를 오른쪽 끝까지 끌어 RNA를 만들자', '② ‘가닥’·‘당’·‘염기’를 눌러 견주자', '③ ‘있는 곳·하는 일’을 눌러 보자'][cur] || 'RNA는 DNA 정보를 옮기는 한 가닥 복사본', s.sel ? D[s.sel] : s.u > 0.05 ? `RNA 염기 <b>${Math.floor(s.u * 12 + 0.001)}</b>개 — 주형 가닥의 A에는 <b>U</b>, T에는 A, G에는 C, C에는 G가 짝지어 붙는다` : 'DNA와 RNA는 모두 뉴클레오타이드가 이어진 핵산이다']; },
    },

    /* ── 3-3-3 · 2 체험: 원본은 핵에, 복사본은 공장으로 ── */
    copies: {
      init: () => ({ rna: [], prot: [], made: 0, nprot: 0, shake: 0 }),
      make(s) { s.made++; s.rna.push({ a: 0, rib: 0, k: s.made }); },
      tick(s, dt) { s.shake = Math.max(0, s.shake - dt * 2); s.rna.forEach((r) => { r.a += dt * 0.35; if (r.a > 1) { r.rib += dt; if (r.rib > 0.9) { r.rib = 0; s.nprot++; if (s.prot.length < 70) s.prot.push({ x: Math.random(), y: Math.random(), a: Math.random() * TAU }); } } }); },
      down(s, p) { const nx = s.W * 0.22, ny = s.H * 0.52; if (Math.hypot(p.x - nx, p.y - ny) < s.H * 0.22) { s.grab = true; s.gx = p.x; } },
      move(s, p, held) { if (held && s.grab && Math.abs(p.x - s.gx) > 12) s.shake = 1; },
      up(s) { if (s.grab && s.shake < 0.5) this.make(s); s.grab = false; },
      act(s, a) { if (a === 'tx') this.make(s); if (a === 'tx5') for (let i = 0; i < 5; i++) this.make(s); },
      steps: [(s) => s.made >= 1, (s) => s.made >= 5, (s) => s.nprot >= 40],
      draw(c, W, H, s, t) {
        bg(c, W, H, 'rgba(120,200,160,.12)');
        // 세포(오른쪽으로 넓게)와 핵
        c.fillStyle = 'rgba(120,200,160,.10)'; c.strokeStyle = '#8fe0b0'; c.lineWidth = 4; c.beginPath(); c.roundRect(W * 0.03, H * 0.16, W * 0.94, H * 0.78, 120); c.fill(); c.stroke();
        const nx = W * 0.22 + Math.sin(t * 40) * 3 * s.shake, ny = H * 0.52, nR = H * 0.26;
        circ(c, nx, ny, nR, rad(c, nx, ny, nR, ['#b694f2', '#6c47b0', '#35206a']), '#d8c2ff', 4);
        const pores = [-0.6, 0, 0.6].map((a) => [nx + Math.cos(a) * nR, ny + Math.sin(a) * nR]); pores.forEach(([x, y]) => circ(c, x, y, 8, '#1d1240', '#d8c2ff', 2));
        // DNA(유전자 노랑)
        c.strokeStyle = '#ffcfe8'; c.lineWidth = 4; c.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 40; c.lineTo(nx - nR * 0.75 + u * nR * 1.3, ny + Math.sin(u * 14 + t) * 10); } c.stroke();
        rr(c, nx - nR * 0.2, ny - 14, nR * 0.42, 28, 8, null, YEL, 2.5); txt(c, '유전자', nx, ny - 22, YEL, '700 13px');
        txt(c, 'DNA(원본)', nx - nR * 0.4, ny + 42, '#ffcfe8', '700 13px');
        if (s.shake > 0.3) pill(c, nx, ny - nR - 20, 'DNA는 핵 밖으로 나가지 않는다', RED, '#1d2433', '800 13px');
        // RNA 복사본: 유전자 → 핵공 → 세포질
        s.rna.forEach((r, i) => { const [px, py] = pores[i % 3], ex = W * (0.45 + ((r.k * 0.137) % 0.45)), ey = H * (0.25 + ((r.k * 0.291) % 0.55)); let x, y;
          if (r.a < 0.5) { const u = r.a / 0.5; x = lerp(nx, px, u); y = lerp(ny, py, u); } else { const u = ease(Math.min(1, (r.a - 0.5) / 0.5)); x = lerp(px, ex, u); y = lerp(py, ey, u); }
          c.strokeStyle = '#ff8fc0'; c.lineWidth = 4; c.beginPath(); for (let k = 0; k <= 12; k++) c.lineTo(x - 30 + k * 5, y + Math.sin(k + t * 3 + i) * 3); c.stroke();
          if (r.a > 1) [-18, 4, 26].forEach((d, k) => { const bx = x + d - 6 + ((t * 10 + k * 8) % 16) - 8; c.fillStyle = 'rgba(156,224,160,.9)'; c.beginPath(); c.ellipse(bx, y - 6, 9, 7, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(bx, y + 5, 7, 4, 0, 0, TAU); c.fill(); }); });
        s.prot.forEach((q, i) => { const x = W * (0.45 + q.x * 0.48), y = H * (0.18 + q.y * 0.68); c.save(); c.translate(x + Math.sin(t + i) * 4, y + Math.cos(t * 0.8 + i) * 4); c.rotate(q.a + t * 0.2); c.fillStyle = '#ffd36b'; c.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU, r2 = 6 + (k % 2) * 3; c.lineTo(Math.cos(a) * r2, Math.sin(a) * r2); } c.fill(); c.restore(); });
        // 계기
        pill(c, W * 0.62, H * 0.075, `RNA ${s.made}개`, '#ff8fc0', '#1d2433', '800 14px'); pill(c, W * 0.8, H * 0.075, `단백질 ${s.nprot}개`, YEL, '#1d2433', '800 14px');
        txt(c, '핵을 눌러 전사', nx, ny + nR + 26, DIM, '600 13px');
        [['#ff8fc0', 'RNA'], ['rgba(156,224,160,.9)', '라이보솜'], ['#ffd36b', '단백질']].forEach(([col, nm], i) => txt(c, '● ' + nm, W * 0.62 + i * 100, H * 0.9, col, '700 13px', 'left'));
      },
      say(s, cur) { return [['', '① 핵을 눌러 RNA를 하나 만들어 보자', '② RNA를 다섯 개까지 만들자', '③ 단백질이 40개 넘게 쌓일 때까지 지켜보자'][cur] || '원본 하나로 복사본 여럿, 복사본 하나로 단백질 여럿', `유전자 하나에서 RNA <b>${s.made}</b>개 → 단백질 <b>${s.nprot}</b>개. RNA 하나에 라이보솜 여럿이 붙어 동시에 번역한다`]; },
    },
    /* ── 3-3-3 · 2 생활 속 예: 같은 DNA, 다른 세포 ── */
    cells: {
      GENE: [['마이오신', '근육을 수축시킨다', 10], ['인슐린', '혈당을 낮춘다', 50], ['헤모글로빈', '산소를 나른다', 0], ['케라틴', '피부 겉을 단단하게', 30]],
      CELL: [['근육세포', 0, '#e58a8a'], ['이자 세포', 1, '#f2c26b'], ['적혈구가 될 세포', 2, '#ff7a7a'], ['피부 세포', 3, '#d9b48c']],
      init: () => ({ cell: null, seen: [] }),
      act(s, a) { s.cell = +a.slice(1); if (!s.seen.includes(s.cell)) s.seen.push(s.cell); },
      on: (s, a) => s.cell === +a.slice(1),
      steps: [(s) => s.seen.length >= 1, (s) => s.seen.length >= 2, (s) => s.seen.length >= 4],
      draw(c, W, H, s, t) {
        bg(c, W, H, 'rgba(120,200,160,.12)');
        // 위: 모든 세포가 가진 같은 DNA(유전자 넷)
        const x0 = W * 0.1, w = W * 0.8, y0 = H * 0.15, act = s.cell == null ? -1 : this.CELL[s.cell][1];
        txt(c, '모든 세포의 핵에 들어 있는 같은 DNA', W / 2, y0 - 6, DIM, '700 13px');
        rr(c, x0, y0 + 8, w, 20, 10, lin(c, 0, y0 + 8, 0, y0 + 28, ['#c4a3ff', '#7a4fd0']));
        this.GENE.forEach(([nm], i) => { const gx = x0 + w * (0.08 + i * 0.24), on = i === act; rr(c, gx, y0 + 4, w * 0.14, 28, 6, on ? YEL : 'rgba(255,255,255,.22)', on ? '#fff' : null, 2); txt(c, nm, gx + w * 0.07, y0 + 50, on ? YEL : INK, '700 13px'); if (on) for (let k = 0; k < 3; k++) { const u = (t * 0.5 + k / 3) % 1; c.strokeStyle = `rgba(255,143,192,${1 - u})`; c.lineWidth = 3; c.beginPath(); for (let q = 0; q <= 8; q++) c.lineTo(gx + w * 0.02 + q * 6, y0 + 40 + u * 60 + Math.sin(q + t * 4) * 2); c.stroke(); } });
        // 아래: 처음에는 네 세포를 나란히, 고르면 그 세포를 크게
        if (s.cell == null) {
          this.CELL.forEach(([cn, , col], i) => { const x = W * (0.13 + i * 0.25), y = H * 0.6, R = H * 0.12; c.save(); c.translate(x, y); c.scale(i === 0 ? 0.62 : 0.85, i === 0 ? 0.62 : 0.85); cellArt(c, i, R, t + i); c.restore();
            pill(c, x, y + R * 1.25 + 16, cn, col, '#1d2433', '800 14px'); pill(c, x, y - R * 1.15 - 12, '어떤 유전자를 쓸까?', 'rgba(255,255,255,.12)', INK, '700 13px'); });
          txt(c, '네 세포 모두 핵 속에 위와 같은 DNA를 가진다', W / 2, H * 0.94, DIM, '700 14px'); return;
        }
        const [cn, , col] = this.CELL[s.cell], cx = W * 0.33, cy = H * 0.64, R = H * 0.2;
        c.save(); c.translate(cx, cy); cellArt(c, s.cell, R, t); c.restore();
        pill(c, cx, cy - R - 34, cn, col, '#1d2433', '800 15px');
        line(c, W * 0.1 + W * 0.8 * (0.08 + act * 0.24) + W * 0.056, H * 0.15 + 40, cx, cy - R - 48, 'rgba(255,143,192,.6)', 2, [5, 5]);
        const [gn, job] = this.GENE[act];
        rr(c, W * 0.66, H * 0.48, W * 0.31, H * 0.34, 12, 'rgba(255,216,77,.1)', YEL, 2);
        txt(c, `전사하는 유전자: ${gn}`, W * 0.81, H * 0.48 + 32, YEL, '800 15px'); txt(c, `만드는 단백질: ${gn}`, W * 0.81, H * 0.48 + 62, INK, '700 14px'); txt(c, job, W * 0.81, H * 0.48 + 90, INK, '700 14px');
        txt(c, '나머지 유전자는 갖고만 있다', W * 0.81, H * 0.48 + 122, DIM, '600 13px');
      },
      say(s, cur) { return [['', '① 세포 하나를 골라 어떤 유전자가 켜지는지 보자', '② 다른 세포와 견주어 보자', '③ 네 세포를 모두 보자'][cur] || 'DNA는 같아도 쓰는 유전자가 달라 세포가 다르다', s.cell == null ? '근육세포·이자 세포·피부 세포는 모두 수정란 하나에서 나와 <b>같은 DNA</b>를 가진다' : `${this.CELL[s.cell][0]}는 <b>${this.GENE[this.CELL[s.cell][1]][0]}</b> 유전자를 주로 전사·번역한다 — 이 세포의 모양과 일이 여기서 나온다`]; },
    },
    /* ── 3-3-3 · 3 탐구: 어디서부터 읽을까(읽는 틀) ── */
    frame: {
      SEQ: 'CGAUGGCUAAAGGCUGAAC',
      init: () => ({ off: 0, tried: [0], run: -1, done: false }),
      cods(off) { const r = []; for (let i = off; i + 3 <= this.SEQ.length; i += 3) r.push(this.SEQ.slice(i, i + 3)); return r; },
      tick(s, dt) { if (s.run >= 0) { s.run += dt * 1.2; const n = this.cods(s.off).findIndex((x) => code(x) === '*'); if (n >= 0 && s.run > n + 1) { s.run = n + 0.999; if (s.off === 2) s.done = true; } else if (s.run > this.cods(s.off).length) s.run = this.cods(s.off).length; } },
      bs(s) { return Math.min(42, s.W * 0.88 / this.SEQ.length); },
      down(s, p) { s.x0 = p.x; s.o0 = s.off; },
      move(s, p, held) { if (held && s.x0 != null) { const o = clamp(Math.round(s.o0 + (p.x - s.x0) / this.bs(s)), 0, 8); if (o !== s.off) { s.off = o; s.run = -1; if (!s.tried.includes(o)) s.tried.push(o); } } },
      up(s) { s.x0 = null; },
      key(s, e) { const d = { ArrowRight: 1, ArrowLeft: -1 }[e.key]; if (!d) return false; s.off = clamp(s.off + d, 0, 8); s.run = -1; if (!s.tried.includes(s.off)) s.tried.push(s.off); return true; },
      act(s, a) { if (a === 'go') s.run = 0; },
      steps: [(s) => s.tried.length >= 3, (s) => s.off === 2, (s) => s.done],
      draw(c, W, H, s, t) {
        bg(c, W, H, 'rgba(150,110,230,.14)');
        const bs = this.bs(s), x0 = W / 2 - bs * this.SEQ.length / 2, y = H * 0.3;
        txt(c, 'RNA', x0 - 10, y + bs * 0.65, DIM, '700 13px', 'right');
        [...this.SEQ].forEach((b, i) => baseBox(c, x0 + i * bs, y, bs, b, i < s.off ? 0.45 : 1));
        const cd = this.cods(s.off), ok = s.off === 2;
        const stopAt = cd.findIndex((q) => code(q) === '*');
        cd.forEach((x, k) => { if (stopAt >= 0 && k > stopAt) return; const bx = x0 + (s.off + k * 3) * bs, a = code(x), on = s.run >= 0 && s.run > k;
          c.strokeStyle = k === 0 && x === 'AUG' ? GRN : a === '*' ? RED : YEL; c.lineWidth = 3; c.beginPath(); c.moveTo(bx + 2, y + bs + 4); c.lineTo(bx + 2, y + bs + 12); c.lineTo(bx + bs * 3 - 5, y + bs + 12); c.lineTo(bx + bs * 3 - 5, y + bs + 4); c.stroke();
          const ax = bx + bs * 1.5 - 2, ay = H * 0.58;
          if (a === '*') pill(c, ax, ay, '종결', on ? RED : 'rgba(255,122,92,.35)', '#1d2433', '800 13px');
          else { ball(c, ax, ay + (on ? Math.sin(t * 3 + k) * 2 : 0), Math.min(20, bs * 0.7), hueOf(a), on || s.run < 0 ? (ok ? 1 : 0.55) : 0.3); txt(c, AAK[a], ax, ay + 38, ok ? INK : DIM, '700 12px'); if (k && on) line(c, ax - bs * 3 + 18, ay, ax - 18, ay, INK, 2.5); }
          if (a === '*') { for (let q = k + 1; q < cd.length; q++) { const bx2 = x0 + (s.off + q * 3) * bs; c.fillStyle = 'rgba(245,239,226,.75)'; c.fillRect(bx2, y - 2, bs * 3, bs + 16); } if (k + 1 < cd.length) txt(c, '여기부터는 읽지 않는다', x0 + (s.off + (k + 1) * 3) * bs + bs * 1.5, y + bs + 30, DIM, '700 12px'); }
        });
        if (s.run >= 0) { const k = Math.min(cd.length - 1, Math.floor(s.run)), rx = x0 + (s.off + k * 3) * bs + bs * 1.5; c.fillStyle = 'rgba(166,138,232,.55)'; c.beginPath(); c.ellipse(rx, y + bs / 2 - 26, bs * 1.8, 22, 0, 0, TAU); c.fill(); c.beginPath(); c.ellipse(rx, y + bs + 18, bs * 1.6, 12, 0, 0, TAU); c.fill(); }
        pill(c, W / 2, H * 0.82, ok ? '개시코돈 AUG에서 시작 — 세포가 실제로 읽는 틀' : `${['첫째', '둘째', '셋째', '넷째', '다섯째', '여섯째', '일곱째', '여덟째', '아홉째'][s.off]} 칸부터 읽은 틀 — 개시코돈에서 시작하지 않았다`, ok ? GRN : 'rgba(255,255,255,.85)', '#1d2433', '800 15px');
        txt(c, '좌우로 끌어 읽기 시작점 옮기기', W / 2, y - 64, DIM, '700 13px');
      },
      say(s, cur) { return [['', '① 시작점을 좌우로 끌어 세 군데 이상 읽어 보자', '② 시작점을 개시코돈 AUG에 맞추자', '③ ‘번역 시작’을 눌러 종결코돈까지 읽자'][cur] || '번역은 AUG에서 시작해 종결코돈에서 멈춘다', `같은 RNA라도 <b>어디서부터 세 개씩 묶느냐</b>에 따라 아미노산이 완전히 달라진다${s.off === 2 ? ' — 개시코돈 AUG가 시작점을 정한다' : ''}`]; },
    },
    /* ── 3-3-3 · 3 자료 해석: 코돈표 바퀴로 아미노산 찾기 ── */
    wheel: {
      Q: ['AUG', 'GCA', 'UAA'],
      init: () => ({ pick: '', found: [] }),
      geo(s) { return [s.W * 0.36, s.H * 0.52, Math.min(s.W * 0.3, s.H * 0.44)]; },
      down(s, p) { const [cx, cy, R] = this.geo(s), d = Math.hypot(p.x - cx, p.y - cy) / R; let a = Math.atan2(p.y - cy, p.x - cx) + Math.PI / 2; if (a < 0) a += TAU; const f = a / TAU;
        if (d < 0.12 || d > 0.82) return; const B = 'UCAG'; if (d < 0.32) s.pick = B[Math.floor(f * 4)]; else if (d < 0.52) { const k = Math.floor(f * 16); s.pick = B[k >> 2] + B[k & 3]; } else { const k = Math.floor(f * 64); s.pick = B[k >> 4] + B[(k >> 2) & 3] + B[k & 3]; }
        if (s.pick.length === 3 && this.Q.includes(s.pick) && !s.found.includes(s.pick)) s.found.push(s.pick); },
      act(s, a) { if (a === 'clear') s.pick = ''; if (a === 'hint') s.hintT = 3.5; },
      tick(s, dt) { if (s.hintT) s.hintT = Math.max(0, s.hintT - dt); },
      steps: [(s) => s.found.includes('AUG'), (s) => s.found.includes('GCA'), (s) => s.found.includes('UAA')],
      draw(c, W, H, s, t) {
        bg(c, W, H, 'rgba(150,110,230,.12)');
        const [cx, cy, R] = this.geo(s), B = 'UCAG', r1 = R * 0.12, r2 = R * 0.32, r3 = R * 0.52, r4 = R * 0.82, P = s.pick;
        const sec = (ra, rb, a0, a1, fill, st) => { c.beginPath(); c.arc(cx, cy, rb, a0 - Math.PI / 2, a1 - Math.PI / 2); c.arc(cx, cy, ra, a1 - Math.PI / 2, a0 - Math.PI / 2, true); c.closePath(); c.fillStyle = fill; c.fill(); c.strokeStyle = st || 'rgba(10,13,24,.8)'; c.lineWidth = 1.5; c.stroke(); };
        const lab = (r, a, tx, col, f) => { txt(c, tx, cx + Math.cos(a - Math.PI / 2) * r, cy + Math.sin(a - Math.PI / 2) * r + 5, col, f); };
        for (let i = 0; i < 4; i++) { const on = P[0] === B[i]; sec(r1, r2, i / 4 * TAU, (i + 1) / 4 * TAU, on ? BASE[B[i]] : BASE[B[i]] + '88'); lab((r1 + r2) / 2, (i + 0.5) / 4 * TAU, B[i], '#14182a', '800 20px'); }
        for (let k = 0; k < 16; k++) { const b = B[k & 3], on = P.length >= 2 && P.slice(0, 2) === B[k >> 2] + b; sec(r2, r3, k / 16 * TAU, (k + 1) / 16 * TAU, on ? BASE[b] : BASE[b] + '66'); lab((r2 + r3) / 2, (k + 0.5) / 16 * TAU, b, '#14182a', '800 14px'); }
        for (let k = 0; k < 64; k++) { const b = B[k & 3], cd = B[k >> 4] + B[(k >> 2) & 3] + b, on = P === cd, a = AA1[k]; sec(r3, r4, k / 64 * TAU, (k + 1) / 64 * TAU, on ? '#fff' : a === '*' ? 'rgba(255,122,92,.55)' : a === 'M' ? 'rgba(127,214,107,.6)' : `hsla(${hueOf(a)},55%,45%,.55)`); lab(r3 + (r4 - r3) * 0.22, (k + 0.5) / 64 * TAU, b, on ? '#14182a' : 'rgba(255,255,255,.75)', '700 10px'); }
        // 바깥 아미노산 이름: 같은 아미노산이 이어진 묶음마다
        let k = 0; while (k < 64) { let e = k; while (e + 1 < 64 && AA1[e + 1] === AA1[k] && (e + 1) % 4 !== 0) e++; const a = ((k + e + 1) / 2) / 64 * TAU, nm = AAK[AA1[k]];
          c.save(); c.translate(cx + Math.cos(a - Math.PI / 2) * (r4 + 6), cy + Math.sin(a - Math.PI / 2) * (r4 + 6)); let rot = a - Math.PI / 2; const flip = Math.cos(rot) < 0; c.rotate(flip ? rot + Math.PI : rot); txt(c, nm, 0, 4, AA1[k] === '*' ? RED : AA1[k] === 'M' ? GRN : INK, '700 12px', flip ? 'right' : 'left'); c.restore(); k = e + 1; }
        if (s.hintT) { const tg = this.Q.find((q) => !s.found.includes(q)); if (tg) { const nx = P && tg.startsWith(P) ? P.length : 0, b = [...tg].map((ch) => B.indexOf(ch)), k = nx === 0 ? b[0] : nx === 1 ? b[0] * 4 + b[1] : b[0] * 16 + b[1] * 4 + b[2], m = [4, 16, 64][Math.min(2, nx)], ra = [r1, r2, r3][Math.min(2, nx)], rb = [r2, r3, r4][Math.min(2, nx)];
          c.save(); c.globalAlpha = 0.5 + 0.5 * Math.sin(t * 8); c.beginPath(); c.arc(cx, cy, rb, k / m * TAU - Math.PI / 2, (k + 1) / m * TAU - Math.PI / 2); c.arc(cx, cy, ra, (k + 1) / m * TAU - Math.PI / 2, k / m * TAU - Math.PI / 2, true); c.closePath(); c.strokeStyle = '#d8322a'; c.lineWidth = 4; c.stroke(); c.restore(); } }
        circ(c, cx, cy, r1, '#1d2433', DIM, 1.5); txt(c, '첫째', cx, cy - 2, DIM, '700 12px'); txt(c, '→셋째', cx, cy + 11, DIM, '700 12px');
        // 오른쪽: 고른 코돈과 찾을 코돈
        const px = W * 0.74; rr(c, px, H * 0.16, W * 0.23, H * 0.3, 12, 'rgba(255,255,255,.05)', 'rgba(185,194,216,.3)');
        txt(c, '고른 코돈', px + W * 0.115, H * 0.16 + 28, DIM, '700 13px');
        [...P.padEnd(3, '·')].forEach((b, i) => { if (b === '·') rr(c, px + W * 0.04 + i * 44, H * 0.16 + 44, 38, 38, 6, 'rgba(255,255,255,.08)'); else baseBox(c, px + W * 0.04 + i * 44, H * 0.16 + 44, 41, b); });
        if (P.length === 3) { const a = code(P); pill(c, px + W * 0.115, H * 0.16 + 118, a === '*' ? '종결코돈 — 아미노산 없음' : `→ ${AAK[a]}${a === 'M' ? '(개시코돈)' : ''}`, a === '*' ? RED : YEL, '#1d2433', '800 14px'); }
        txt(c, '찾을 코돈', px + W * 0.115, H * 0.52, DIM, '700 13px');
        this.Q.forEach((q, i) => { const y = H * 0.56 + i * 40, f = s.found.includes(q); rr(c, px, y, W * 0.23, 32, 16, f ? 'rgba(127,214,107,.2)' : 'rgba(255,255,255,.05)', f ? GRN : 'rgba(185,194,216,.3)'); txt(c, `${q}${f ? '  → ' + AAK[code(q)] : ''}`, px + W * 0.115, y + 21, f ? GRN : INK, '800 14px'); });
      },
      say(s, cur) { return [['', '① 안쪽 고리부터 A → U → G 칸을 차례로 눌러 AUG를 찾자', '② GCA를 찾자', '③ UAA를 찾자'][cur] || '64코돈 가운데 61개는 아미노산, 3개는 종결', s.pick.length === 3 ? `<b>${s.pick}</b> → ${code(s.pick) === '*' ? '<b>종결코돈</b>' : `<b>${AAK[code(s.pick)]}</b>`} · 바깥 둘레를 보면 아미노산 하나를 <b>여러 코돈</b>이 정하기도 한다` : '안쪽 고리 = 첫째 염기, 가운데 = 둘째, 바깥 = 셋째 염기']; },
    },
    /* ── 3-3-3 · 3 생활 속 예: 해파리의 빛 유전자 ── */
    glow: {
      O: [['대장균', 0.42], ['식물', 0.62], ['물고기', 0.82]],
      init: () => ({ put: [], light: false, drag: null }),
      card(s) { return [s.W * 0.09, s.H * 0.74, s.W * 0.18, 44]; },
      down(s, p) { const [x, y, w, h] = this.card(s); if (hit(p, x, y, w, h)) s.drag = { x: p.x, y: p.y }; },
      move(s, p, held) { if (held && s.drag) { s.drag.x = p.x; s.drag.y = p.y; } },
      up(s, p) { if (!s.drag) return; this.O.forEach(([, u], i) => { if (Math.abs(p.x - s.W * u) < s.W * 0.09 && !s.put.includes(i)) s.put.push(i); }); s.drag = null; },
      act(s, a) { if (a === 'light') s.light = !s.light; if (a === 'all') s.put = [0, 1, 2]; },
      on: (s, a) => (a === 'light' ? s.light : false),
      steps: [(s) => s.put.length >= 1, (s) => s.put.length >= 3, (s) => s.light && s.put.length >= 3],
      draw(c, W, H, s, t) {
        c.fillStyle = s.light ? '#05060f' : '#0e1326'; c.fillRect(0, 0, W, H); if (!s.light) bg(c, W, H, 'rgba(90,140,220,.16)'); else { THEME.dark = true; const g = c.createRadialGradient(W * 0.5, 0, 10, W * 0.5, 0, H); g.addColorStop(0, 'rgba(80,90,255,.28)'); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
        const glowG = (x, y, r, on) => { if (s.light && on) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(120,255,140,.65)'); g.addColorStop(1, 'rgba(120,255,140,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); } };
        // 해파리: 반투명 갓, 가장자리 무늬, 입다리와 촉수
        const jx = W * 0.17, jy = H * 0.3 + Math.sin(t * 1.2) * 6, pul = 1 + Math.sin(t * 2.4) * 0.05, gc = s.light ? [180, 255, 190] : [200, 220, 255];
        glowG(jx, jy, 120, true); c.save(); c.translate(jx, jy); c.scale(1.3, 1.3); c.translate(-jx, -jy);
        for (let k = 0; k < 9; k++) { c.strokeStyle = `rgba(${gc},.45)`; c.lineWidth = 1.5; c.beginPath(); const x = jx - 52 + k * 13; c.moveTo(x, jy + 6); for (let q = 1; q < 14; q++) c.lineTo(x + Math.sin(q * 0.7 + t * 2 + k) * 6, jy + 6 + q * 9); c.stroke(); }
        for (let k = 0; k < 4; k++) { c.strokeStyle = `rgba(${gc},.75)`; c.lineWidth = 6; c.beginPath(); const x = jx - 15 + k * 10; c.moveTo(x, jy + 8); for (let q = 1; q < 7; q++) c.lineTo(x + Math.sin(q * 0.9 + t * 1.6 + k) * 7, jy + 8 + q * 10); c.stroke(); }
        c.save(); c.translate(jx, jy); c.scale(pul, 1 / pul); const bg2 = c.createRadialGradient(0, -20, 4, 0, -6, 70); bg2.addColorStop(0, `rgba(${gc},.85)`); bg2.addColorStop(1, `rgba(${gc},.25)`); c.fillStyle = bg2;
        c.beginPath(); c.ellipse(0, 4, 62, 50, 0, Math.PI, 0); for (let k = 0; k < 8; k++) c.quadraticCurveTo(62 - k * 15.5 - 7.75, 16, 62 - (k + 1) * 15.5, 6); c.closePath(); c.fill();
        c.strokeStyle = `rgba(${gc},.9)`; c.lineWidth = 1.5; c.stroke();
        for (let k = 0; k < 4; k++) { c.strokeStyle = s.light ? 'rgba(120,255,140,.95)' : 'rgba(255,200,230,.7)'; c.lineWidth = 3; c.beginPath(); c.arc(-24 + k * 16, -16, 6, Math.PI * 0.1, Math.PI * 0.9, true); c.stroke(); }
        for (let k = 0; k < 10; k++) circ(c, -54 + k * 12, 4, 2.5, s.light ? '#d8ffd8' : '#cfdcff');
        c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-22, -30, 16, 7, -0.4, 0, TAU); c.fill(); c.restore();
        c.restore(); txt(c, '해파리(형광 단백질을 만든다)', jx, jy - 84, s.light ? '#e8ecf8' : INK, '800 14px'); // 어두운 방(푸른빛)에서는 밝은 글자
        // 유전자 카드
        const [cx0, cy0, cw, ch] = this.card(s), dx = s.drag ? s.drag.x - cw / 2 : cx0, dy = s.drag ? s.drag.y - ch / 2 : cy0;
        rr(c, dx, dy, cw, ch, 10, lin(c, 0, dy, 0, dy + ch, ['#9ef0a8', '#3aa860']), '#fff', 2); txt(c, '형광 단백질 유전자', dx + cw / 2, dy + 28, '#0d2a14', '800 13px');
        if (!s.drag && s.put.length < 3) { const u = (t % 1.6) / 1.6; arrow(c, cx0 + cw + 8, cy0 + 20, cx0 + cw + 8 + 50 * u, cy0 + 20 - 30 * u, 'rgba(255,216,77,.8)', 2.5); }
        // 세 생물
        this.O.forEach(([nm, u], i) => { const x = W * u, y = H * 0.46, on = s.put.includes(i), zk = Math.min(1.45, W / 640);
          glowG(x, y, 80 * zk, on); c.save(); c.translate(x, y); c.scale(zk, zk); c.translate(-x, -y);
          const lit = s.light && on;
          if (i === 0) { // 페트리 접시와 막대 모양 대장균 무리
            c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(x, y + 58, 66, 14, 0, 0, TAU); c.fill();
            c.fillStyle = lin(c, 0, y - 10, 0, y + 60, ['rgba(240,225,170,.55)', 'rgba(210,190,120,.5)']); c.beginPath(); c.ellipse(x, y + 22, 60, 36, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(235,242,255,.85)'; c.lineWidth = 2.5; c.stroke();
            c.strokeStyle = 'rgba(235,242,255,.5)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(x, y + 17, 62, 37, 0, Math.PI * 1.05, Math.PI * 1.95); c.stroke();
            [[-26, 10], [8, 28], [24, 4], [-6, -2]].forEach(([dx2, dy2], g) => { for (let k = 0; k < 9; k++) { const a = k * 2.4 + g, r = 3 + (k % 3) * 4; c.save(); c.translate(x + dx2 + Math.cos(a) * r, y + 18 + dy2 * 0.7 + Math.sin(a) * r * 0.6); c.rotate(a); rr(c, -5, -2, 10, 4, 2, lit ? '#a8ff9a' : '#efe6c4', lit ? null : 'rgba(150,130,80,.7)', 0.8); c.restore(); } });
            if (lit) glowG(x, y + 20, 70, true);
          } else if (i === 1) { // 화분의 어린 식물
            c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(x, y + 76, 38, 8, 0, 0, TAU); c.fill();
            c.fillStyle = lin(c, x - 30, 0, x + 30, 0, ['#8a4a2a', '#c27a4a', '#7a3f22']); c.beginPath(); c.moveTo(x - 32, y + 34); c.lineTo(x + 32, y + 34); c.lineTo(x + 24, y + 74); c.lineTo(x - 24, y + 74); c.closePath(); c.fill(); rr(c, x - 36, y + 28, 72, 12, 4, '#d08a58'); c.fillStyle = '#3a2416'; c.beginPath(); c.ellipse(x, y + 30, 30, 5, 0, 0, TAU); c.fill();
            c.strokeStyle = lit ? '#7dff8a' : '#4f8a3a'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, y + 30); c.quadraticCurveTo(x - 4 + Math.sin(t) * 2, y, x + Math.sin(t) * 3, y - 30); c.stroke();
            [[-1, 10, 0.5], [1, -4, -0.5], [-1, -22, 0.8], [1, -34, -0.7]].forEach(([sg, d, rot]) => { const lx = x + sg * 20 + Math.sin(t + d) * 1.5, ly = y + d; c.save(); c.translate(lx, ly); c.rotate(rot + Math.sin(t * 1.3 + d) * 0.05); c.fillStyle = lit ? lin(c, -22, 0, 22, 0, ['#b8ffb8', '#5dff7a']) : lin(c, -22, 0, 22, 0, ['#7cc96a', '#3f8f3a']); c.beginPath(); c.ellipse(0, 0, 22, 9, 0, 0, TAU); c.fill(); line(c, -18, 0, 18, 0, 'rgba(230,255,220,.6)', 1.2); c.restore(); });
            if (lit) glowG(x, y - 6, 70, true);
          } else { // 어항 속 줄무늬 물고기
            rr(c, x - 66, y - 34, 132, 96, 10, lin(c, 0, y - 34, 0, y + 62, ['rgba(120,180,240,.18)', 'rgba(60,120,200,.38)']), 'rgba(230,240,255,.75)', 2); line(c, x - 60, y - 22, x + 60, y - 22, 'rgba(200,230,255,.5)', 1.5);
            c.fillStyle = 'rgba(200,170,110,.6)'; c.fillRect(x - 64, y + 50, 128, 10);
            const fx = x + Math.sin(t * 0.8) * 26, fy = y + 12 + Math.sin(t * 1.7) * 4, dir = Math.cos(t * 0.8) >= 0 ? 1 : -1;
            c.save(); c.translate(fx, fy); c.scale(dir, 1);
            c.fillStyle = lit ? '#9dff9d' : '#e8d08a'; c.beginPath(); c.moveTo(-20, 0); c.lineTo(-34, -10 + Math.sin(t * 8) * 2); c.lineTo(-34, 10 + Math.sin(t * 8) * 2); c.closePath(); c.fill();
            c.fillStyle = lit ? lin(c, 0, -10, 0, 10, ['#d4ffd4', '#5dff7a']) : lin(c, 0, -10, 0, 10, ['#fff3c4', '#d9b45a']); c.beginPath(); c.ellipse(0, 0, 24, 9.5, 0, 0, TAU); c.fill();
            for (let k = 0; k < 4; k++) line(c, -16 + k * 2, -4 + k * 2.6, 18, -4 + k * 2.6, lit ? 'rgba(40,150,70,.8)' : 'rgba(60,90,170,.75)', 1.6);
            c.fillStyle = lit ? 'rgba(160,255,170,.8)' : 'rgba(230,200,120,.8)'; c.beginPath(); c.moveTo(-4, -8); c.lineTo(6, -15); c.lineTo(10, -8); c.fill(); circ(c, 15, -2, 2.4, '#111'); c.restore();
            for (let k = 0; k < 3; k++) { const u = (t * 0.4 + k / 3) % 1; circ(c, x + 40, y + 40 - u * 70, 2 + k, null, `rgba(220,240,255,${1 - u})`, 1); }
            if (lit) glowG(fx, fy, 60, true);
          }
          c.restore(); txt(c, nm, x, y + 100 * zk, s.light ? '#e8ecf8' : INK, '800 16px'); if (on) pill(c, x, y - 52 * zk, '유전자 넣음', '#9ef0a8', '#0d2a14', '800 13px');
        });
        if (s.light) txt(c, '푸른빛을 비추는 중', W - 16, 26, '#a0a8ff', '700 13px', 'right');
      },
      say(s, cur) { return [['', '① 유전자 카드를 끌어 생물 하나에 넣자', '② 세 생물 모두에 넣자', '③ ‘푸른빛 비추기’를 눌러 보자'][cur] || '모든 생물이 같은 유전부호로 단백질을 만든다', s.light && s.put.length ? '유전자를 넣은 생물이 해파리처럼 <b>초록빛</b>을 낸다 — 세균·식물·동물이 모두 같은 코돈을 같은 아미노산으로 읽기 때문이다' : '해파리의 형광 단백질 유전자를 다른 생물의 DNA에 넣어 본다']; },
    },
  };


  /* 장마다 조작 전 예측(물음·보기·답·까닭)과 손가락 안내(시작점 x,y와 미는 방향 dx,dy · 비율, 0이면 톡 누르기) */
  const EXTRA = {
    temp: { pred: ['효소가 든 시험관의 온도를 0 °C에서 70 °C까지 올리면 반응 빠르기는?', ['온도가 오를수록 계속 빨라진다', '어느 온도까지 빨라지다가 그 뒤로 느려진다', '온도와 관계없이 같다'], 1, '효소는 단백질이라 알맞은 온도를 넘으면 입체 구조가 흐트러진다'], hand: [0.17, 0.62, 0, -0.2, '비커를 위아래로 끌기'] },
    fair: { pred: ['삶은 감자의 효소가 일하는지 알아보려면 시험관 셋에 무엇을 넣어야 할까?', ['생감자즙 5 mL · 삶은 감자즙 2 mL · 증류수 2 mL', '생감자즙 2 mL · 삶은 감자즙 2 mL · 증류수 2 mL', '생감자즙 2 mL · 생감자즙 5 mL · 삶은 감자즙 2 mL'], 1, '삶았는지 하나만 다르게 하고, 증류수 시험관을 견줄 기준으로 둔다'], hand: [0.115, 0.25, 0.04, 0.33, '병을 시험관으로 끌기', [0.36, 0.93]] },
    ph: { pred: ['위액 속 펩신이 가장 빨리 일하는 pH는 어디쯤일까?', ['pH 2 근처(산성)', 'pH 7 근처(중성)', 'pH 8 근처(약한 염기성)'], 0, '위액은 강한 산성이고, 효소는 자기가 일하는 곳의 pH에서 가장 빠르다'], hand: [0.3, 0.88, 0.25, 0, 'pH 띠를 좌우로 끌기'] },
    chew: { pred: ['밥을 30번 넘게 씹은 뒤 아이오딘 용액을 떨어뜨리면 색은?', ['진한 청람색이 된다', '거의 변하지 않는다', '붉은색이 된다'], 1, '아밀레이스가 녹말을 엿당으로 분해해 녹말이 거의 남지 않는다'], hand: [0.2, 0.36, 0, 0, '입을 눌러 씹기'] },
    ink: { pred: ['같은 양의 잉크를 찬물(10 °C)과 더운물(60 °C)에 떨어뜨리면?', ['찬물에서 더 빨리 퍼진다', '더운물에서 더 빨리 퍼진다', '둘 다 같은 빠르기로 퍼진다'], 1, '온도가 높을수록 분자 운동이 활발해 확산이 빠르다'], hand: [0.32, 0.2, -0.15, 0.04, '스포이트를 비커 위로 끌기', [0.32, 0.42]] },
    kidney: { pred: ['투석액을 바꾸지 않고 오래 두면 혈액 속 요소는 어떻게 될까?', ['0이 될 때까지 계속 빠져나간다', '양쪽 농도가 비슷해지면 더 줄지 않는다', '투석액에서 혈액으로 되돌아와 늘어난다'], 1, '확산은 농도 차가 있을 때만 한쪽으로 더 많이 일어난다'] },
    potato: { pred: ['0.5 M 설탕물에 30분 담가 둔 감자 조각의 질량은?', ['늘어난다', '줄어든다', '그대로다'], 1, '감자 세포 안보다 진한 설탕물이면 물이 세포 밖으로 빠져나간다'], hand: [0.085, 0.3, 0, 0, '비커를 눌러 감자 담그기'] },
    zoom: { pred: ['사람 세포에서 유전자는 어디에 들어 있을까?', ['세포막에 박혀 있다', '핵 속 DNA의 한 구간이다', '세포질에 따로 떠다닌다'], 1, '유전정보는 핵 속 DNA에 있고, 그 가운데 단백질 하나의 정보를 가진 구간이 유전자다'], hand: [0.25, 0.86, 0.3, 0, '오른쪽으로 끌어 확대'] },
    genes: { pred: ['DNA 한 분자에는 유전자가 몇 개 들어 있을까?', ['딱 하나', '여러 개가 띄엄띄엄', 'DNA 전체가 유전자 하나'], 1, 'DNA 한 분자에 여러 유전자가 있고 그 사이에는 유전자가 아닌 구간도 있다'], hand: [0.62, 0.62, -0.25, 0, '왼쪽으로 끌어 DNA 훑기'] },
    fold: { pred: ['아미노산 아홉 개의 종류는 그대로 두고 두 개의 자리만 바꾸면 단백질 모양은?', ['그대로다', '달라진다', '사슬 길이만 짧아진다'], 1, '아미노산마다 성질이 달라, 순서가 바뀌면 접히는 모양이 달라진다'], hand: [0.22, 0.88, 0.06, 0, '구슬을 끌어 자리 바꾸기'] },
    sickle: { pred: ['헤모글로빈 유전자에서 염기 하나만 바뀌면 적혈구는 어떻게 될까?', ['아무 변화가 없다', '아미노산 하나가 바뀌어 적혈구 모양이 달라질 수 있다', '적혈구가 아예 만들어지지 않는다'], 1, '염기 하나 → 코돈 하나 → 아미노산 하나가 바뀌어 단백질의 성질이 달라진다'] },
    dnarna: { pred: ['RNA에는 있고 DNA에는 없는 염기는?', ['타이민(T)', '유라실(U)', '구아닌(G)'], 1, 'DNA의 타이민(T) 자리에 RNA는 유라실(U)을 쓴다'], hand: [0.05, 0.36, 0.25, 0, '초록 효소를 오른쪽으로 끌기'] },
    copies: { pred: ['유전자 하나로 짧은 시간에 단백질을 많이 만들 수 있는 까닭은?', ['DNA가 핵 밖으로 여러 번 나가서', 'RNA를 여러 개 만들고, RNA마다 라이보솜 여럿이 붙어서', '단백질이 스스로 복제해서'], 1, 'DNA는 핵에 두고 RNA 복사본을 여럿 만들어 동시에 번역한다'], hand: [0.22, 0.52, 0, 0, '핵을 눌러 전사'] },
    cells: { pred: ['한 사람의 근육세포와 이자 세포가 가진 DNA는?', ['서로 같다', '서로 다르다', '근육세포에만 DNA가 있다'], 0, '모든 세포는 수정란 하나에서 나와 같은 DNA를 가진다. 쓰는 유전자가 다를 뿐이다'] },
    wheel: { pred: ['코돈 64가지 가운데 아미노산을 정하지 않는(종결) 코돈은 몇 개일까?', ['없다', '3개', '44개'], 1, 'UAA·UAG·UGA 셋은 번역을 끝내라는 신호다'], hand: [0.4, 0.44, 0, 0, '안쪽 고리부터 칸을 눌러 코돈 고르기'] },
    frame: { pred: ['RNA를 읽기 시작하는 자리를 한 칸만 옮기면 아미노산 서열은?', ['아미노산 하나만 바뀐다', '뒤쪽이 거의 모두 바뀐다', '그대로다'], 1, '세 개씩 묶는 경계가 모두 밀려 코돈이 통째로 바뀐다'], hand: [0.4, 0.37, 0.12, 0, '좌우로 끌어 시작점 옮기기'] },
    glow: { pred: ['해파리의 형광 단백질 유전자를 넣은 대장균에 푸른빛을 비추면?', ['아무 빛도 내지 않는다', '해파리처럼 초록빛을 낸다', '대장균만의 붉은빛을 낸다'], 1, '대장균도 같은 유전부호로 그 유전자를 읽어 형광 단백질을 만든다'], hand: [0.18, 0.78, 0.22, -0.2, '유전자 카드를 생물로 끌기', [0.5, 0.9]] },
  };
  // 손 모양(검지로 가리킴): 손끝이 (x, y)
  function hand(c, x, y) {
    c.save(); c.translate(x, y); c.lineJoin = 'round';
    c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 10; c.shadowOffsetY = 4;
    c.fillStyle = '#fff'; c.beginPath(); c.roundRect(-10, 24, 38, 34, [8, 12, 16, 16]); c.fill();
    c.shadowColor = 'transparent'; c.strokeStyle = '#1d2433'; c.lineWidth = 2.2; c.stroke();
    [7, 17].forEach((k) => line(c, k, 25, k, 37, 'rgba(29,36,51,.45)', 1.6));
    c.fillStyle = '#fff'; c.beginPath(); c.ellipse(-12, 42, 6.5, 12, -0.55, 0, TAU); c.fill(); c.strokeStyle = '#1d2433'; c.lineWidth = 2.2; c.stroke();
    c.beginPath(); c.roundRect(-8, 0, 16, 36, 8); c.fill(); c.stroke();
    rr(c, -4.5, 3.5, 9, 8, 3.5, '#f3e6e6');
    c.restore();
  }
  // 손가락 안내: 점선을 따라 미끄러지거나(끌기) 제자리에서 톡톡(누르기). a = 남은 밝기
  function guide(c, W, H, t, g, a) {
    const [fx, fy, fdx, fdy, label] = g, x = fx * W, y = fy * H, dx = fdx * W, dy = fdy * H, tap = !dx && !dy;
    const u = (t % 2.1) / 2.1, e = ease(clamp(u / 0.7, 0, 1));
    c.save(); c.globalAlpha = a;
    if (!tap) { line(c, x, y, x + dx, y + dy, 'rgba(255,216,77,.9)', 3, [8, 6]); arrow(c, x + dx * 0.82, y + dy * 0.82, x + dx, y + dy, 'rgba(255,216,77,.95)', 3); }
    else for (let k = 0; k < 2; k++) { const v = (u + k * 0.5) % 1; c.strokeStyle = `rgba(255,216,77,${0.9 * (1 - v)})`; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 8 + v * 30, 0, TAU); c.stroke(); }
    const hx = tap ? x : x + dx * e, hy = tap ? y + Math.abs(Math.sin(u * TAU)) * -6 : y + dy * e;
    c.globalAlpha = a * (tap ? 1 : u > 0.88 ? 1 - (u - 0.88) / 0.12 : Math.min(1, u * 8)); hand(c, hx, hy); c.globalAlpha = a;
    if (label) { c.font = `800 15px ${FONT}`; const w = c.measureText(label).width + 26, lx = g[5] ? g[5][0] * W : clamp(x + dx / 2, w / 2 + 8, W - w / 2 - 8), ly = g[5] ? g[5][1] * H : clamp(Math.min(y, y + dy) - 30, 62, H - 20); rr(c, lx - w / 2, ly - 16, w, 32, 16, '#fff6c8', '#1d2433', 2); txt(c, label, lx, ly + 5.5, '#1d2433', '800 15px'); }
    c.restore();
  }

  function mount(root, kind) {
    const K = KINDS[kind], X = EXTRA[kind] || {}, P = window.Play, stage = root.querySelector('.lb-stage'), out = root.querySelector('.lb-out'), now = root.querySelector('.lb-now');
    const st = Object.assign({ W: 900, H: 560 }, K.init()), ok = new Set(), btns = [...root.querySelectorAll('[data-act]')];
    let acc = 0, lastO = '', lastN = '', touched = 0, fade = 1, mine = null;
    // 조작 전 예측 카드(그림 위). 고르거나 아래 단추를 누르면 닫힌다. 고른 것은 아래 단추 줄 끝에 남는다
    const PR = X.pred, card = PR && document.createElement('div'), badge = PR && document.createElement('p');
    if (PR) {
      card.className = 'lb-pred';
      card.innerHTML = `<div class="lb-pcard"><p class="lb-pk">먼저 예측해 보자</p><p class="lb-pq">${PR[0]}</p><div class="lb-po">${PR[1].map((o, i) => `<button type="button" data-p="${i}"><b>${'ABC'[i]}</b> ${o}</button>`).join('')}</div><button type="button" class="lb-pskip">예측 없이 해 보기</button></div>`;
      stage.appendChild(card);
      badge.className = 'lb-pbadge'; badge.hidden = true; (root.querySelector('.lb-tray .tray-end') || stage).prepend(badge);
      card.querySelectorAll('[data-p]').forEach((b) => b.addEventListener('click', () => pick(+b.dataset.p)));
      card.querySelector('.lb-pskip').addEventListener('click', () => pick(-1));
    }
    function pick(i) { if (!PR) return; mine = i; card.hidden = true; badge.hidden = i < 0; if (i >= 0) badge.textContent = `내 예측 ${'ABC'[i]}`; lastO = ''; upd(); }
    function upd() {
      K.steps.forEach((f, i) => { try { if (!ok.has(i + 1) && f(st)) ok.add(i + 1); } catch (e) { /* 그림 준비 전 */ } });
      const cur = K.steps.map((_, i) => i + 1).find((n) => !ok.has(n)) || 0;
      let [chip, o] = K.say(st, cur);
      if (PR && !card.hidden) chip = '먼저 결과를 예측해 보자';
      if (PR && cur === 0 && mine != null) {
        const hit = mine === PR[2];
        if (mine >= 0) { badge.textContent = hit ? `예측 ${'ABC'[mine]} — 맞았다` : `예측 ${'ABC'[mine]} — 답은 ${'ABC'[PR[2]]}`; badge.className = 'lb-pbadge ' + (hit ? 'ok' : 'no'); }
        o += `<span class="lb-pchk"><b>답 ${'ABC'[PR[2]]}</b> ${PR[1][PR[2]]} — ${PR[3]}</span>`;
      }
      if (chip !== lastN) now.textContent = lastN = chip; if (o !== lastO) out.innerHTML = lastO = o;
      now.classList.toggle('done', cur === 0); window.L1.steps(root, cur, [...ok]); window.L1.done(root, cur === 0);
      if (K.on) btns.forEach((b) => b.setAttribute('aria-pressed', String(!!K.on(st, b.dataset.act))));
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        st.W = W; st.H = H; if (dt && K.tick) K.tick.call(K, st, dt); K.draw.call(K, c, W, H, st, (st.t = (st.t || 0) + dt));
        if (touched) fade = Math.max(0, fade - (dt || 0) * 2.5);
        if (fade > 0 && !(PR && !card.hidden)) guide(c, W, H, st.t, X.hand || [0.24, 0.9, 0, 0, '아래 단추를 눌러 보자'], fade);
        acc += dt; if (acc > 0.25) { acc = 0; upd(); }
      },
      down(p) { touched = 1; if (K.down) K.down.call(K, st, p); upd(); },
      move(p, e, held) { if (K.move) K.move.call(K, st, p, held); },
      up(p) { if (K.up) K.up.call(K, st, p); upd(); },
      key(e) { const i = '123456789'.indexOf(e.key); if (i >= 0 && btns[i]) { act(btns[i].dataset.act); return true; } if (e.key === '0') { act('reset'); return true; } const r = K.key ? K.key.call(K, st, e) : false; if (r) { touched = 1; upd(); } return r; },
    });
    function act(a) { if (PR && !card.hidden) pick(-1); if (a !== 'reset') touched = 1; if (a === 'reset') Object.assign(st, K.init()); else if (K.act) K.act.call(K, st, a); upd(); S.redraw(); S.kick(); }
    btns.forEach((b) => b.addEventListener('click', () => act(b.dataset.act)));
    upd();
    root._lab = { st, act, pick, check: upd, set(o) { touched = 1; const n = o.run || 0; delete o.run; Object.assign(st, o); for (let i = 0; i < n; i++) K.tick && K.tick.call(K, st, 0.05); upd(); S.redraw(); } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Labs = { mount };
})();
