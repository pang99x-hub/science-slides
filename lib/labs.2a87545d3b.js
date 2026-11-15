/* 3-2 늘린 장(2026-11-13)의 손 조작 그림 모음. 장마다 캔버스 하나 + 아래 단추 줄(data-act) + 오른쪽 해 볼 일 ①②③ + 조작 전 예측 카드.
   Labs.mount(root, 종류) → { fit, setActive } · 단추: [data-act] 누르기, 숫자 키 1~9 = 단추 차례, 0 = 처음부터
   종류: strobe(섬광 사진 두 방향) height(높이 바꿔 던지기) airdrop(구호 상자 떨어뜨리기) fall(자이로드롭 속 저울)
         carts(빈 수레와 짐 실은 수레) shake(젖은 우산 털기) kick(힘–시간 그래프 넓이)
   시험용: root._lab.set({ 상태… , run: 틱 수 }) · root._lab.act('이름') · root._lab.pick(예측 번호) · 수치는 이해를 돕기 위한 예 */
(function () {
  'use strict';
  const TAU = Math.PI * 2, INK = '#fbfcf9', YEL = '#ffd84d', DIM = 'rgba(185,194,216,.75)', RED = '#ff7a5c', BLU = '#5aa9f0', GRN = '#7fd66b', PUR = '#b48cf0', FONT = '"IBM Plex Sans KR", sans-serif';
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), ease = (u) => u * u * (3 - 2 * u), lerp = (a, b, u) => a + (b - a) * u;
  const line = (c, x0, y0, x1, y1, col, w, dash) => { c.strokeStyle = col; c.lineWidth = w; c.setLineDash(dash || []); c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.setLineDash([]); };
  const rr = (c, x, y, w, h, r, fill, stroke, lw) => { c.beginPath(); c.roundRect(x, y, w, h, r); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1.5; c.stroke(); } };
  const circ = (c, x, y, r, fill, stroke, lw) => { c.beginPath(); c.arc(x, y, Math.max(0.1, r), 0, TAU); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1.5; c.stroke(); } };
  const lin = (c, x0, y0, x1, y1, stops) => { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); return g; };
  const rad = (c, x, y, r, stops) => { const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.06, x, y, r * 1.05); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); return g; };
  const txt = (c, t, x, y, col = INK, f = '700 16px', al = 'center') => { c.font = `${f} ${FONT}`; c.fillStyle = col; c.textAlign = al; c.fillText(t, x, y); };
  function pill(c, x, y, t, bg, fg = '#1d2433', f = '700 15px') { c.font = `${f} ${FONT}`; const w = c.measureText(t).width + 20; rr(c, x - w / 2, y - 14, w, 28, 14, bg); c.fillStyle = fg; c.textAlign = 'center'; c.fillText(t, x, y + 5.5); return w; }
  function arrow(c, x0, y0, x1, y1, col, w = 3) { const a = Math.atan2(y1 - y0, x1 - x0), L = Math.hypot(x1 - x0, y1 - y0); if (L < 2) return; line(c, x0, y0, x1 - Math.cos(a) * w * 2, y1 - Math.sin(a) * w * 2, col, w); c.fillStyle = col; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - Math.cos(a - 0.45) * w * 4, y1 - Math.sin(a - 0.45) * w * 4); c.lineTo(x1 - Math.cos(a + 0.45) * w * 4, y1 - Math.sin(a + 0.45) * w * 4); c.fill(); }
  const ball = (c, x, y, r, hue, a = 1) => { c.globalAlpha = a; circ(c, x, y, r, rad(c, x, y, r, [`hsl(${hue},90%,82%)`, `hsl(${hue},70%,55%)`, `hsl(${hue},70%,28%)`])); c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(x - r * 0.35, y - r * 0.42, r * 0.25, r * 0.15, -0.6, 0, TAU); c.fill(); c.globalAlpha = 1; };
  function bg(c, W, H, tint = 'rgba(90,120,200,.16)') {
    c.fillStyle = lin(c, 0, 0, 0, H, ['#17213e', '#0e1326', '#0a0d18']); c.fillRect(0, 0, W, H);
    const g = c.createRadialGradient(W * 0.5, H * 0.4, 10, W * 0.5, H * 0.4, W * 0.75); g.addColorStop(0, tint); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  }
  // 그래프 틀: 축·눈금·이름. 돌려주는 함수로 값 → 화면 좌표
  function graph(c, x, y, w, h, xr, yr, xl, yl, ticks) {
    rr(c, x - 52, y - 30, w + 70, h + 72, 12, 'rgba(255,255,255,.04)', 'rgba(185,194,216,.2)', 1);
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


  // 땅(풀·흙)과 하늘 배경
  function sky(c, W, H, gy) {
    c.fillStyle = lin(c, 0, 0, 0, gy, ['#1b2c55', '#2c4a86', '#5a7fb8']); c.fillRect(0, 0, W, gy);
    c.fillStyle = lin(c, 0, gy, 0, H, ['#4f7a3a', '#3a5c2a', '#26391c']); c.fillRect(0, gy, W, H - gy); line(c, 0, gy, W, gy, 'rgba(210,240,180,.55)', 2);
  }
  function cloud(c, x, y, s, a = 0.8) { c.fillStyle = `rgba(235,242,255,${a})`; [[0, 0, 22], [20, -8, 18], [40, 0, 20], [18, 6, 20]].forEach(([dx, dy, r]) => { c.beginPath(); c.arc(x + dx * s, y + dy * s, r * s, 0, TAU); c.fill(); }); }
  // 탁자 판 위 모눈(섬광 사진 배경)
  function grid(c, x0, y0, w, h, step, col) { for (let x = x0; x <= x0 + w + 0.5; x += step) line(c, x, y0, x, y0 + h, col, 1); for (let y = y0; y <= y0 + h + 0.5; y += step) line(c, x0, y, x0 + w, y, col, 1); }
  // 축구공(오각형 무늬) · 회전 a
  function soccer(c, x, y, r, a, sq = 0) {
    c.save(); c.translate(x, y); c.scale(1 - sq, 1 + sq * 0.6); c.rotate(a);
    circ(c, 0, 0, r, rad(c, 0, 0, r, ['#ffffff', '#e8ecf4', '#9aa3b8']), '#1d2433', 1.5);
    const pent = (px, py, s) => { c.beginPath(); for (let k = 0; k < 5; k++) { const q = k / 5 * TAU - Math.PI / 2; c.lineTo(px + Math.cos(q) * s, py + Math.sin(q) * s); } c.closePath(); c.fillStyle = '#1d2433'; c.fill(); };
    pent(0, 0, r * 0.32); for (let k = 0; k < 5; k++) { const q = k / 5 * TAU - Math.PI / 2; pent(Math.cos(q) * r * 0.82, Math.sin(q) * r * 0.82, r * 0.22); line(c, Math.cos(q) * r * 0.3, Math.sin(q) * r * 0.3, Math.cos(q) * r * 0.62, Math.sin(q) * r * 0.62, '#1d2433', 1.2); }
    c.restore(); c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(x - r * 0.35, y - r * 0.42, r * 0.22, r * 0.12, -0.6, 0, TAU); c.fill();
  }
  const G = 9.8;

  const KINDS = {
    /* ── 3-2-1 · 2 탐구: 섬광 사진으로 두 방향 나누어 읽기(0.1초 간격, 던진 빠르기 1 m/s · 예) ── */
    strobe: {
      init: () => ({ n: 0, mark: [], split: false, flash: 0, live: 0 }),
      geo(s) { const top = s.H * 0.2, sc = (s.H * 0.74) / 125; return { x0: s.W * 0.17, y0: top, sc }; },
      pos(k) { return [10 * k, 4.9 * k * k]; },
      tick(s, dt) { s.flash = Math.max(0, s.flash - dt * 3); s.live = (s.live + dt * 0.45) % 1.3; },
      snap(s) { if (s.n < 5) { s.n++; s.flash = 1; } },
      down(s, p) { const { x0, y0, sc } = this.geo(s); for (let k = 1; k <= s.n; k++) { const [x, y] = this.pos(k); if (Math.hypot(p.x - (x0 + x * sc), p.y - (y0 + y * sc)) < 16 && !s.mark.includes(k)) { s.mark.push(k); s.mark.sort(); return; } } if (p.x < s.W * 0.5) this.snap(s); },
      act(s, a) { if (a === 'snap') this.snap(s); if (a === 'split') s.split = !s.split; if (a === 'all') { s.n = 5; s.mark = [1, 2, 3, 4, 5]; } },
      on: (s, a) => (a === 'split' ? s.split : false),
      steps: [(s) => s.n >= 5, (s) => s.mark.length >= 5, (s) => s.split && s.mark.length >= 5],
      draw(c, W, H, s, t) {
        // 어두운 실험실: 벽 · 바닥 · 검은 촬영판(10 cm 모눈) · 경사 레일 · 삼각대 위 카메라와 섬광 장치
        c.fillStyle = lin(c, 0, 0, 0, H, ['#1a1f2e', '#121521']); c.fillRect(0, 0, W, H);
        c.fillStyle = lin(c, 0, H * 0.93, 0, H, ['#3a3226', '#211b14']); c.fillRect(0, H * 0.93, W, H * 0.07);
        const { x0, y0, sc } = this.geo(s), gw = 60 * sc, gh = 125 * sc;
        if (s.flash > 0) { const g = c.createRadialGradient(W * 0.6, H * 0.8, 10, W * 0.6, H * 0.8, W * 0.7); g.addColorStop(0, `rgba(255,255,240,${0.35 * s.flash})`); g.addColorStop(1, 'rgba(255,255,240,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
        rr(c, x0 - 10, y0 - 10, gw + 20, gh + 20, 6, lin(c, 0, y0, 0, y0 + gh, ['#07090f', '#0b0e16']), '#3a4058', 3); grid(c, x0, y0, gw, gh, 10 * sc, 'rgba(230,236,250,.22)'); grid(c, x0, y0, gw, gh, 50 * sc, 'rgba(230,236,250,.38)');
        [x0 - 10, x0 + gw + 6].forEach((lx) => rr(c, lx, y0 + gh + 10, 4, H * 0.93 - y0 - gh - 10, 1, '#4a5070'));
        for (let k = 0; k <= 12; k += 2) txt(c, String(k * 10), x0 - 12, y0 + k * 10 * sc + 4, DIM, '600 12px', 'right');
        for (let k = 0; k <= 6; k += 2) txt(c, String(k * 10), x0 + k * 10 * sc, y0 - 14, DIM, '600 12px');
        txt(c, '(cm)', x0 - 12, y0 - 14, DIM, '600 12px', 'right');
        // 공을 굴려 내보내는 받침(왼쪽 위)
        c.strokeStyle = '#c9d0e6'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0 - 64, y0 - 34); c.quadraticCurveTo(x0 - 40, y0 - 3, x0 - 4, y0 - 1); c.stroke(); c.strokeStyle = '#6a7290'; c.lineWidth = 2; c.stroke(); c.lineCap = 'butt';
        line(c, x0 - 62, y0 - 30, x0 - 62, H * 0.93, '#4a5070', 4); txt(c, '경사 레일', x0 - 62, y0 + 54, '#c9d0e6', '700 12px');
        // 카메라와 섬광 장치(오른쪽 아래)
        const cx = W * 0.6, cy = H * 0.85; [[-1, 1], [0, 1], [1, 1]].forEach(([k]) => line(c, cx, cy, cx + k * 26, H * 0.93, '#8a93ad', 3));
        rr(c, cx - 26, cy - 22, 52, 26, 5, lin(c, 0, cy - 22, 0, cy + 4, ['#4a5070', '#262b40']), '#9aa3be', 1.5); circ(c, cx - 30, cy - 9, 11, rad(c, cx - 30, cy - 9, 11, ['#9ab0ff', '#2a3a7a', '#0a1020']), '#c9d0e6', 2); rr(c, cx + 2, cy - 34, 22, 12, 3, s.flash > 0.2 ? '#fffbe0' : '#d9dfef', '#5a6488', 1.2);
        if (s.flash > 0.2) for (let k = 0; k < 8; k++) { const a = k / 8 * TAU; line(c, cx + 13 + Math.cos(a) * 10, cy - 28 + Math.sin(a) * 10, cx + 13 + Math.cos(a) * 22, cy - 28 + Math.sin(a) * 22, `rgba(255,250,200,${s.flash})`, 2); }
        txt(c, '카메라 · 섬광 장치', cx + 40, cy - 2, '#c9d0e6', '700 12px', 'left');
        // 지금 날아가는 공(되풀이) — 손을 대지 않아도 움직인다
        const u = Math.min(s.live, 1) * 0.5, lx = x0 + 100 * u * sc, ly = y0 + 490 * u * u * sc;
        if (s.live < 1) { c.globalAlpha = 0.35; ball(c, lx, ly - 7, 7, 20); c.globalAlpha = 1; }
        // 찍힌 사진 속 공
        for (let k = 0; k <= s.n; k++) { const [x, y] = this.pos(k), X = x0 + x * sc, Y = y0 + y * sc - 7; ball(c, X, Y, 7.5, 20, 0.95); if (s.mark.includes(k)) { circ(c, X, Y, 12, null, YEL, 2); txt(c, `${k}`, X + 14, Y - 8, YEL, '800 12px', 'left'); } }
        if (s.n && s.mark.length < s.n) { const k = [1, 2, 3, 4, 5].find((q) => q <= s.n && !s.mark.includes(q)); if (k) { const [x, y] = this.pos(k); circ(c, x0 + x * sc, y0 + y * sc - 7, 13 + Math.sin(t * 6) * 2, null, 'rgba(255,216,77,.6)', 2); } }
        // 두 방향으로 나누기: 위 눈금(수평)과 왼쪽 눈금(연직)에 그림자 공
        if (s.split) for (let k = 0; k <= s.n; k++) { const [x, y] = this.pos(k), X = x0 + x * sc, Y = y0 + y * sc - 7;
          line(c, X, Y, X, y0 - 2, 'rgba(110,200,255,.35)', 1.2, [3, 4]); line(c, X, Y, x0 - 2, Y, 'rgba(255,150,110,.35)', 1.2, [3, 4]);
          ball(c, X, y0 - 30, 5.5, 200, 0.95); ball(c, x0 - 34, Y, 5.5, 15, 0.95); }
        if (s.split) { txt(c, '← 수평: 간격이 같다', x0 + gw + 12, y0 - 26, '#9cd8ff', '800 13px', 'left'); c.save(); c.translate(x0 - 86, y0 + gh * 0.55); c.rotate(Math.PI / 2); txt(c, '연직: 간격이 점점 넓어진다 →', 0, 0, '#ffb49a', '800 13px'); c.restore(); }
        if (s.flash > 0) { c.fillStyle = `rgba(255,255,255,${s.flash * 0.35})`; c.fillRect(0, 0, W, H); }
        // 오른쪽 기록표
        const tx = W * 0.5, ty = H * 0.16, cw = [0.08, 0.1, 0.1, 0.1, 0.1].map((f) => f * W), rh = H * 0.075;
        rr(c, tx - 8, ty - 8, cw.reduce((a, b) => a + b) + 16, rh * 7 + 16, 10, 'rgba(255,255,255,.04)', 'rgba(185,194,216,.3)');
        ['시간(s)', '수평 위치', '연직 위치', '수평 간격', '연직 간격'].forEach((h, k) => txt(c, h, tx + cw.slice(0, k).reduce((a, b) => a + b, 0) + cw[k] / 2, ty + rh * 0.6, DIM, '700 13px'));
        line(c, tx, ty + rh, tx + cw.reduce((a, b) => a + b), ty + rh, 'rgba(185,194,216,.4)', 1.5);
        for (let k = 0; k <= 5; k++) { const y = ty + rh * (k + 1.65), on = k === 0 || s.mark.includes(k), [x, yy] = this.pos(k), [px, py] = this.pos(Math.max(0, k - 1));
          const v = [(k / 10).toFixed(1), on ? `${x.toFixed(0)} cm` : '?', on ? `${yy.toFixed(1)} cm` : '?', k && on ? `${(x - px).toFixed(0)} cm` : '', k && on ? `${(yy - py).toFixed(1)} cm` : ''];
          v.forEach((q, j) => txt(c, q, tx + cw.slice(0, j).reduce((a, b) => a + b, 0) + cw[j] / 2, y, j === 3 && q ? '#9cd8ff' : j === 4 && q ? '#ffb49a' : on ? INK : DIM, j >= 3 ? '800 14px' : '700 14px')); }
        txt(c, '섬광 간격 0.1초 · 모눈 한 칸 10 cm', tx, ty + rh * 7 + 34, DIM, '700 13px', 'left');
        if (s.mark.length >= 5) { const by = ty + rh * 7 + 56; pill(c, tx + W * 0.24, by, '연직 간격 4.9 : 14.7 : 24.5 … = 1 : 3 : 5 …', 'rgba(255,180,154,.2)', '#ffd0bf', '800 14px'); }
      },
      say(s, cur) { return [['', '① 섬광을 다섯 번 터뜨려 사진을 찍자', '② 사진 속 공을 차례로 눌러 표에 적자', '③ ‘두 방향으로 나누기’를 눌러 간격을 견주자'][cur] || '수평은 등속, 연직은 점점 빨라진다', s.mark.length >= 5 ? '수평 간격은 <b>10 cm로 늘 같다</b>(등속) — 연직 간격은 <b>점점 커진다</b>(중력 때문에 빨라짐)' : `찍은 사진 ${s.n}장 · 표에 적은 공 ${s.mark.length}개 — 섬광은 0.1초마다 터진다`]; },
    },

    /* ── 3-2-1 · 2 체험: 더 높은 곳에서 던지면(던진 빠르기 5 m/s · 예) ── */
    height: {
      init: () => ({ h: 5, fly: null, rec: [], drag: false }),
      geo(s) { const gy = s.H * 0.9, sc = (s.H * 0.78) / 21; return { gy, sc, tx: s.W * 0.1 }; },
      tick(s, dt) { if (s.fly) { s.fly.t += dt; const T = Math.sqrt(2 * s.fly.h / G); if (s.fly.t >= T) { s.fly.t = T; if (!s.fly.done) { s.fly.done = true; const r = s.rec.findIndex((q) => Math.abs(q.h - s.fly.h) < 0.01); const e = { h: s.fly.h, T, X: 5 * T }; if (r >= 0) s.rec[r] = e; else s.rec.push(e); } } } },
      down(s, p) { const { tx } = this.geo(s); if (p.x < tx + 60) { s.drag = true; s.fly = null; this.move(s, p, true); } else if (p.x < s.W * 0.62) this.go(s); },
      move(s, p, held) { if (held && s.drag) { const { gy, sc } = this.geo(s); s.h = clamp(Math.round((gy - p.y) / sc * 4) / 4, 1, 20); } },
      up(s) { s.drag = false; },
      go(s) { s.fly = { h: s.h, t: 0 }; },
      act(s, a) { if (a === 'go') this.go(s); else { s.h = +a.slice(1); s.fly = null; } },
      on: (s, a) => (a === 'go' ? false : Math.abs(+a.slice(1) - s.h) < 0.01),
      steps: [(s) => s.rec.some((q) => Math.abs(q.h - 5) < 0.3), (s) => s.rec.some((q) => q.h >= 19.9), (s) => s.rec.length >= 4],
      draw(c, W, H, s, t) {
        const { gy, sc, tx } = this.geo(s); sky(c, W, H, gy);
        cloud(c, (W * 0.3 + t * 6) % (W * 0.5) + W * 0.12, H * 0.3, 1, 0.3); cloud(c, (W * 0.05 + t * 4) % (W * 0.5) + W * 0.1, H * 0.45, 0.7, 0.22);
        // 수평 거리 눈금(0~12 m)
        for (let m = 0; m <= 12; m += 2) { const x = tx + 30 + m * sc; line(c, x, gy, x, gy + 7, 'rgba(255,255,255,.7)', 1.5); txt(c, `${m}`, x, gy + 22, INK, '600 12px'); }
        txt(c, '(m)', tx + 30 + 13 * sc, gy + 22, DIM, '600 12px');
        // 건물(창문)과 높이 자
        const top = gy - s.h * sc; c.fillStyle = lin(c, tx - 40, 0, tx + 30, 0, ['#6a7088', '#9aa1b8', '#5c6278']); c.fillRect(tx - 40, top, 70, gy - top);
        for (let y = top + 10; y < gy - 14; y += 18) for (let x = tx - 32; x < tx + 22; x += 18) rr(c, x, y, 10, 10, 1.5, (Math.floor(y + x) % 3) ? 'rgba(255,225,140,.65)' : 'rgba(40,50,80,.8)');
        rr(c, tx - 44, top - 6, 78, 8, 2, '#c9d0e6');
        for (let m = 0; m <= 20; m += 5) { const y = gy - m * sc; line(c, tx - 54, y, tx - 46, y, INK, 1.5); txt(c, `${m}`, tx - 58, y + 4, INK, '600 12px', 'right'); }
        txt(c, '높이(m)', tx - 58, gy - 20.8 * sc, DIM, '700 12px', 'right');
        // 손잡이: 위아래로 끌어 높이 바꾸기
        rr(c, tx - 20, top - 22, 40, 14, 7, s.drag ? YEL : 'rgba(255,216,77,.75)', '#1d2433', 1.5); line(c, tx - 8, top - 15, tx + 8, top - 15, '#1d2433', 1.5);
        pill(c, tx + 74, top - 12, `${s.h.toFixed(s.h % 1 ? 2 : 0)} m`, YEL, '#1d2433', '800 14px');
        // 지난 기록의 길(흐리게)
        s.rec.forEach((q) => { c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1.5; c.setLineDash([4, 5]); c.beginPath(); for (let k = 0; k <= 30; k++) { const tt = q.T * k / 30; c.lineTo(tx + 30 + 5 * tt * sc, gy - (q.h - 0.5 * G * tt * tt) * sc); } c.stroke(); c.setLineDash([]); });
        // 날아가는 공과 0.25초 간격 잔상
        const f = s.fly, T = f ? Math.sqrt(2 * f.h / G) : 0;
        if (f) { for (let tt = 0; tt < f.t; tt += 0.25) ball(c, tx + 30 + 5 * tt * sc, gy - (f.h - 0.5 * G * tt * tt) * sc - 6, 6, 20, 0.35);
          const bx = tx + 30 + 5 * f.t * sc, by = gy - (f.h - 0.5 * G * f.t * f.t) * sc - 7; shadow(c, bx, gy + 2, 8, 0.4); ball(c, bx, by, 8, 20);
          pill(c, W * 0.42, H * 0.08, `${f.t.toFixed(2)} s`, f.done ? GRN : '#fff', '#1d2433', '800 16px');
          if (f.done) { txt(c, `${(5 * T).toFixed(1)} m`, bx, gy - 16, YEL, '800 14px'); } }
        else { const by = top - 7 + Math.sin(t * 3) * 1.5; ball(c, tx + 30, by - 4, 8, 20); arrow(c, tx + 42, by - 4, tx + 70, by - 4, 'rgba(255,216,77,.8)', 2.5); txt(c, '5 m/s', tx + 56, by - 14, YEL, '700 12px'); }
        // 오른쪽 그래프: 높이–걸린 시간
        const Gp = graph(c, W * 0.72, H * 0.14, W * 0.24, H * 0.5, [0, 20], [0, 2.2], '높이(m)', '걸린 시간(s)', [0, 5, 10, 15, 20]);
        [0, 1, 2].forEach((v) => txt(c, String(v), W * 0.72 - 8, Gp.Y(v) + 4, DIM, '600 12px', 'right'));
        if (s.rec.length >= 3) { c.strokeStyle = 'rgba(255,216,77,.45)'; c.lineWidth = 2; c.beginPath(); for (let h = 0; h <= 20; h += 0.5) c.lineTo(Gp.X(h), Gp.Y(Math.sqrt(2 * h / G))); c.stroke(); }
        s.rec.forEach((q) => ball(c, Gp.X(q.h), Gp.Y(q.T), 6, 45));
        // 기록 표
        const ry = H * 0.8; txt(c, '높이 → 걸린 시간 · 간 거리', W * 0.64, ry - 6, DIM, '700 13px', 'left');
        s.rec.slice().sort((a, b) => a.h - b.h).slice(-4).forEach((q, i) => txt(c, `${q.h} m → ${q.T.toFixed(2)} s · ${q.X.toFixed(1)} m`, W * 0.64, ry + 18 + i * 19, INK, '700 13px', 'left'));
      },
      say(s, cur) { const f = s.rec.slice().sort((a, b) => a.h - b.h); const a5 = f.find((q) => Math.abs(q.h - 5) < 0.3), a20 = f.find((q) => q.h >= 19.9); return [['', '① 높이 5 m에서 던져 보자', '② 높이를 20 m로 올려 던져 보자', '③ 높이를 넷 이상 바꿔 기록하자'][cur] || '높이가 4배면 걸린 시간은 2배', a5 && a20 ? `5 m → <b>${a5.T.toFixed(2)} s</b>, 20 m → <b>${a20.T.toFixed(2)} s</b> — 높이가 <b>4배</b>여도 시간은 <b>2배</b>. 시간이 길수록 옆으로도 더 멀리 간다` : '같은 빠르기(5 m/s)로 수평으로 던지고, 높이만 바꾼다']; },
    },

    /* ── 3-2-1 · 2 생활 속 예: 구호 상자는 언제 떨어뜨려야 할까(높이 245 m · 빠르기 30 m/s · 예) ── */
    airdrop: {
      // 화면(카메라)은 상자가 떨어질 자리를 따라 오른쪽으로 옮겨 가서, 어디서 놓아도 떨어진 자리와 결과가 화면 안에 보인다
      T: Math.sqrt(2 * 245 / 9.8),
      init: () => ({ px: -60, box: null, tries: [], hit: false, side: false, cam: 0, busy: 0 }),
      geo(s) { const gy = s.H * 0.86, sc = (gy - s.H * 0.2) / 245; return { gy, sc, py: s.H * 0.2, gx: s.W * 0.5 }; },
      tick(s, dt) {
        const { sc } = this.geo(s), k = 1.6; s.busy = Math.max(0, s.busy - dt);
        if (!(s.box && !s.box.done)) { s.px += 30 * sc * dt * k; if (s.px > s.W + s.cam + 80) { s.px = s.cam - 80; } }
        else s.px += 30 * sc * dt * k;
        if (s.box && !s.box.done) { s.box.t += dt * k; if (s.box.t >= this.T) { s.box.t = this.T; s.box.done = true; const { gx } = this.geo(s), lx = s.box.x0 + 30 * this.T * sc, err = (lx - gx) / sc; s.tries.push(err); if (Math.abs(err) < 25) s.hit = true; if (s.tries.length >= 2) s.side = true; } }
        // 카메라: 떨어질 자리가 화면 오른쪽 70 px 안에 들어오게
        const want = s.box ? Math.max(0, s.box.x0 + 30 * this.T * sc - (s.W - 90)) : 0; s.cam += (want - s.cam) * Math.min(1, dt * 2.5);
      },
      drop(s) { if (s.box && !s.box.done) { s.busy = 1.2; return; } s.box = { x0: s.px, t: 0, done: false }; },
      down(s) { this.drop(s); },
      key(s, e) { if (e.key === ' ' || e.key === 'Enter') { this.drop(s); return true; } return false; },
      act(s, a) { if (a === 'drop') this.drop(s); },
      steps: [(s) => s.tries.length >= 1, (s) => s.hit, (s) => s.side],
      draw(c, W, H, s, t) {
        const { gy, sc, py, gx } = this.geo(s), cam = s.cam; sky(c, W, H, gy);
        for (let i = 0; i < 4; i++) cloud(c, ((i * 230 - t * 8 - cam * 0.3) % (W + 200) + W + 200) % (W + 200) - 100, H * (0.1 + (i % 2) * 0.12), 0.9, 0.5);
        c.save(); c.translate(-cam, 0);
        // 땅: 마을(지붕·창문·나무)과 과녁
        const h0 = Math.floor((cam - 40) / 64);
        for (let i = h0; i < h0 + Math.ceil(W / 64) + 3; i++) { const x = i * 64 + 6, hh = 12 + ((i * 7 + 3) % 3) * 6; if (Math.abs(x + 13 - gx) < 60) continue;
          if (i % 3 === 2) { line(c, x + 13, gy, x + 13, gy - 12, '#6a4a2a', 3); circ(c, x + 13, gy - 18, 9, '#3f7a3a'); circ(c, x + 9, gy - 22, 6, '#57964a'); continue; }
          rr(c, x, gy - hh, 26, hh, 2, lin(c, 0, gy - hh, 0, gy, ['#cdb79a', '#9a8264'])); c.fillStyle = '#a0442e'; c.beginPath(); c.moveTo(x - 3, gy - hh); c.lineTo(x + 13, gy - hh - 10); c.lineTo(x + 29, gy - hh); c.fill(); rr(c, x + 5, gy - hh + 4, 6, 5, 1, '#ffe7a0'); rr(c, x + 15, gy - hh + 4, 6, 5, 1, '#ffe7a0'); }
        c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.ellipse(gx, gy + 6, 34, 7, 0, 0, TAU); c.fill(); c.fillStyle = '#d23b2e'; c.beginPath(); c.ellipse(gx, gy + 6, 22, 4.5, 0, 0, TAU); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.ellipse(gx, gy + 6, 9, 2, 0, 0, TAU); c.fill();
        line(c, gx + 40, gy, gx + 40, gy - 38, '#ddd', 2); c.fillStyle = '#ffd84d'; c.beginPath(); c.moveTo(gx + 40, gy - 38); c.lineTo(gx + 40 + 18 + Math.sin(t * 4) * 3, gy - 32); c.lineTo(gx + 40, gy - 26); c.fill(); txt(c, '과녁', gx, gy + 28, INK, '800 13px');
        // 100 m 거리 눈금(과녁 기준)
        for (let m = -300; m <= 600; m += 100) { const x = gx + m * sc; line(c, x, gy + 34, x, gy + 40, 'rgba(255,255,255,.6)', 1.5); if (m) txt(c, `${m > 0 ? '+' : ''}${m} m`, x, gy + 52, 'rgba(235,242,255,.8)', '600 11px'); }
        // 떨어진 자리 기록
        s.tries.forEach((e, i) => { const x = gx + e * sc; line(c, x, gy - 4, x, gy + 8, i === s.tries.length - 1 ? YEL : 'rgba(255,216,77,.5)', 3); });
        // 상자: 비행기와 같은 빠르기로 앞으로 가며 떨어진다(1초 간격 잔상)
        if (s.box) { const b = s.box; for (let tt = 0; tt < b.t; tt += 1) { const x = b.x0 + 30 * tt * sc, y = py + 14 + 0.5 * G * tt * tt * sc; c.globalAlpha = 0.3; rr(c, x - 8, y - 8, 16, 16, 2, '#c8955a'); c.globalAlpha = 1; }
          const bx = b.x0 + 30 * b.t * sc, by = py + 14 + 0.5 * G * b.t * b.t * sc; rr(c, bx - 10, by - 10, 20, 20, 3, lin(c, 0, by - 10, 0, by + 10, ['#e8b878', '#a8743c']), '#5a3a18', 1.5); line(c, bx - 10, by, bx + 10, by, '#5a3a18', 2); line(c, bx, by - 10, bx, by + 10, '#5a3a18', 2);
          if (!b.done) { line(c, s.px, py + 12, bx, by - 12, 'rgba(255,216,77,.75)', 2, [5, 5]); pill(c, bx + 66, by, '비행기 바로 아래', 'rgba(255,216,77,.92)', '#1d2433', '800 13px'); } }
        // 수송기(동체·날개·꼬리·프로펠러)
        const x = s.px, y = py; c.save(); c.translate(x, y + Math.sin(t * 1.5) * 1.5);
        c.fillStyle = lin(c, 0, -12, 0, 12, ['#e8ecf6', '#a7b0c8', '#6c7592']); c.beginPath(); c.moveTo(-58, -4); c.quadraticCurveTo(-60, -12, -40, -12); c.lineTo(34, -10); c.quadraticCurveTo(54, -8, 56, 2); c.quadraticCurveTo(50, 10, 30, 10); c.lineTo(-44, 8); c.closePath(); c.fill();
        c.fillStyle = '#8a93ad'; c.beginPath(); c.moveTo(-48, -10); c.lineTo(-62, -30); c.lineTo(-52, -30); c.lineTo(-34, -10); c.fill(); c.beginPath(); c.moveTo(-6, -2); c.lineTo(-22, 22); c.lineTo(-8, 22); c.lineTo(14, -2); c.fill();
        for (let k = 0; k < 5; k++) circ(c, 18 - k * 9, -4, 2.4, '#3a4a72'); circ(c, 46, -3, 4, '#3a4a72');
        line(c, 57, -10 + Math.sin(t * 40) * 8, 57, 10 - Math.sin(t * 40) * 8, 'rgba(230,236,250,.7)', 2.5); c.restore();
        arrow(c, x + 62, y - 22, x + 92, y - 22, 'rgba(255,255,255,.75)', 2); txt(c, '30 m/s', x + 77, y - 30, INK, '700 12px');
        c.restore();
        // 결과는 화면에 고정해 보여 준다
        const e = s.tries[s.tries.length - 1];
        if (s.box && s.box.done && e != null) { const ok = Math.abs(e) < 25, lx = clamp(gx + e * sc - cam, 90, W - 90); pill(c, lx, gy - 34, ok ? '과녁에 닿았다!' : `과녁에서 ${Math.round(Math.abs(e))} m ${e > 0 ? '지나침' : '못 미침'}`, ok ? GRN : '#fff', '#1d2433', '800 15px'); }
        if (cam > 8) { pill(c, 70, gy - 70, '← 과녁 쪽', 'rgba(11,14,24,.75)', '#fff', '700 12px'); }
        line(c, 16, py, 16, gy, 'rgba(255,255,255,.45)', 1.5, [4, 4]); txt(c, '245 m', 22, (py + gy) / 2, INK, '700 12px', 'left');
        if (s.busy > 0) pill(c, W / 2, H * 0.42, '상자가 떨어지는 중 — 땅에 닿으면 다시 놓을 수 있다', 'rgba(11,14,24,.85)', '#fff', '700 13px');
        txt(c, '실제보다 1.6배 빠르게 보여 줌', W - 12, H - 10, DIM, '600 12px', 'right');
      },
      say(s, cur) { const e = s.tries[s.tries.length - 1]; return [['', '① 화면을 눌러 상자를 떨어뜨려 보자', '② 과녁에 맞혀 보자', '③ 한 번 더 떨어뜨려 비행기와 상자를 견주자'][cur] || '과녁보다 앞에서 떨어뜨려야 한다', e == null ? '상자는 떨어지는 순간 비행기와 같은 빠르기(30 m/s)로 앞으로도 간다' : `떨어지는 데 약 <b>7.1 s</b> — 그동안 상자도 앞으로 약 <b>210 m</b> 간다. 그래서 과녁보다 <b>그만큼 앞에서</b> 놓아야 한다`]; },
    },

    /* ── 3-2-1 · 3 체험: 떨어지는 자이로드롭 속 저울(탑 60 m · 사과 0.2 kg · 예) ── */
    fall: {
      init: () => ({ y: 0, v: 0, ph: 'ground', tt: 0, rec: [], lift: 0 }),
      tick(s, dt) {
        if (s.ph === 'up') { s.y = Math.min(60, s.y + dt * 12); if (s.y >= 60) { s.ph = 'top'; } }
        else if (s.ph === 'fall') { s.tt += dt; if (s.y > 20) { s.v += G * dt; s.y -= s.v * dt; s.a = 0; } else { const a = 2 * G; s.v = Math.max(0, s.v - a * dt); s.y = Math.max(0, s.y - s.v * dt); s.a = s.v > 0 ? -a : 0; if (s.v <= 0) { s.ph = 'ground'; s.done = true; } } if (s.rec.length < 400) s.rec.push([s.tt, this.read(s)]); }
      },
      read(s) { if (s.ph === 'fall') return s.y > 20 ? 0 : s.v > 0 ? 0.2 * (G + 2 * G) : 0.2 * G; return 0.2 * G; },
      act(s, a) { if (a === 'up' && s.ph === 'ground') { s.ph = 'up'; s.done = false; } if (a === 'drop' && s.ph === 'top') { s.ph = 'fall'; s.v = 0; s.tt = 0; s.rec = []; s.sawZero = false; } },
      down(s) { if (s.ph === 'ground') this.act(s, 'up'); else if (s.ph === 'top') this.act(s, 'drop'); },
      steps: [(s) => s.ph === 'top' || s.ph === 'fall' || s.done, (s) => s.rec.some((r) => r[1] === 0 && r[0] > 0.5), (s) => !!s.done],
      draw(c, W, H, s, t) {
        const gy = H * 0.92, sc = (H * 0.8) / 64, tx = W * 0.2; sky(c, W, H, gy);
        // 탑(격자 기둥과 불빛)
        c.fillStyle = lin(c, tx - 16, 0, tx + 16, 0, ['#5a6280', '#a9b0c8', '#4a5070']); c.fillRect(tx - 14, gy - 62 * sc, 28, 62 * sc);
        for (let m = 0; m < 62; m += 2) { const y = gy - m * sc; line(c, tx - 14, y, tx + 14, y - 2 * sc, 'rgba(30,36,60,.5)', 1); }
        for (let m = 4; m < 62; m += 8) circ(c, tx, gy - m * sc, 2.5, (Math.floor(t * 3 + m) % 2) ? '#ffd84d' : '#ff7a5c');
        rr(c, tx - 22, gy - 64 * sc, 44, 10, 4, '#c9d0e6'); c.fillStyle = 'rgba(255,122,92,.25)'; c.fillRect(tx + 16, gy - 20 * sc, 10, 20 * sc); txt(c, '브레이크 구간', tx + 30, gy - 10 * sc, '#ffb49a', '700 12px', 'left');
        for (let m = 0; m <= 60; m += 20) { line(c, tx - 30, gy - m * sc, tx - 20, gy - m * sc, INK, 1.5); txt(c, `${m} m`, tx - 34, gy - m * sc + 4, INK, '600 12px', 'right'); }
        // 둥근 좌석 고리와 탄 사람
        const cy = gy - s.y * sc - 18; rr(c, tx - 44, cy - 10, 88, 22, 8, lin(c, 0, cy - 10, 0, cy + 12, ['#ff9e5e', '#c8501e'])); for (let k = -1; k <= 1; k += 2) { const px = tx + k * 30; circ(c, px, cy - 26, 7, '#f1c7a0'); rr(c, px - 7, cy - 19, 14, 14, 4, k < 0 ? '#3d8bd9' : '#7fd66b'); line(c, px - 6, cy - 2, px - 8, cy + 18, '#33468a', 4); line(c, px + 6, cy - 2, px + 8, cy + 18, '#33468a', 4); if (s.ph === 'fall' && s.y > 20) { line(c, px - 7, cy - 16, px - 14, cy - 34, '#f1c7a0', 3.5); line(c, px + 7, cy - 16, px + 14, cy - 34, '#f1c7a0', 3.5); } }
        if (s.ph === 'fall' && s.y > 20) for (let k = 0; k < 4; k++) line(c, tx - 50 + k * 30, cy - 50 - ((t * 200 + k * 23) % 40), tx - 50 + k * 30, cy - 70 - ((t * 200 + k * 23) % 40), 'rgba(255,255,255,.35)', 2);
        line(c, tx + 44, cy, W * 0.36, H * 0.42, 'rgba(255,216,77,.45)', 1.5, [5, 5]);
        // 확대 원: 손에 든 용수철저울과 사과
        const zx = W * 0.47, zy = H * 0.42, R = H * 0.3, N = this.read(s), fl = s.ph === 'fall' && s.y > 20 ? Math.sin(t * 3) * 4 : 0;
        c.save(); c.beginPath(); c.arc(zx, zy, R, 0, TAU); c.clip(); c.fillStyle = lin(c, 0, zy - R, 0, zy + R, ['#6a86c8', '#3a5294']); c.fillRect(zx - R, zy - R, R * 2, R * 2);
        // 뒤: 탄 사람의 옷과 안전 바
        c.fillStyle = lin(c, zx - R, 0, zx + R, 0, ['#2f6fc0', '#3d8bd9', '#2a62ad']); c.beginPath(); c.ellipse(zx - R * 0.95, zy + R * 0.25, R * 0.42, R * 0.9, 0.15, 0, TAU); c.fill(); rr(c, zx - R, zy + R * 0.55, R * 2, R * 0.16, 6, lin(c, 0, zy + R * 0.55, 0, zy + R * 0.71, ['#ffb36b', '#c8501e']));
        // 저울 위 고리를 쥔 손(주먹과 손가락 마디)
        const top = zy - R * 0.78; c.strokeStyle = '#9aa3be'; c.lineWidth = 3; c.beginPath(); c.arc(zx, top + 6, 8, Math.PI, 0); c.stroke();
        c.fillStyle = lin(c, 0, top - 30, 0, top + 4, ['#ffd9bc', '#f1c7a0', '#cf9a74']); c.beginPath(); c.roundRect(zx - 30, top - 22, 54, 28, 10); c.fill(); c.strokeStyle = '#b98562'; c.lineWidth = 1.5; c.stroke();
        for (let k = 0; k < 4; k++) { c.beginPath(); c.roundRect(zx - 26 + k * 12, top - 2, 12, 12, 5); c.fillStyle = '#f6d2b0'; c.fill(); c.stroke(); }
        c.beginPath(); c.ellipse(zx + 26, top - 10, 9, 13, 0.5, 0, TAU); c.fillStyle = '#f1c7a0'; c.fill(); c.stroke(); rr(c, zx - 44, top - 24, 20, 30, 6, '#2f6fc0');
        // 용수철저울: 투명 몸통 · 0~6 N 눈금 · 늘어나는 용수철 · 빨간 바늘
        const bt = top + 12, bh = R * 0.95, ext = N / 6 * bh * 0.55;
        rr(c, zx - 16, bt, 32, bh, 8, lin(c, zx - 16, 0, zx + 16, 0, ['rgba(220,232,255,.55)', 'rgba(250,252,255,.8)', 'rgba(190,205,230,.55)']), '#5a6488', 1.5);
        for (let k = 0; k <= 6; k++) { const y = bt + 10 + k / 6 * bh * 0.55; line(c, zx + 8, y, zx + 16, y, '#1d2433', 1.4); txt(c, String(k), zx + 20, y + 4, '#fff', '700 11px', 'left'); }
        c.strokeStyle = '#7a849f'; c.lineWidth = 2; c.beginPath(); for (let k = 0; k <= 12; k++) c.lineTo(zx + (k % 2 ? 6 : -6), bt + 6 + k * (4 + ext / 12)); c.stroke();
        const py = bt + 10 + ext; line(c, zx - 4, py, zx + 14, py, '#e8402e', 3); txt(c, 'N', zx + 20, bt + bh - 4, '#fff', '700 11px', 'left');
        const hy = bt + bh + 4 + ext * 0.2 + fl; line(c, zx, py, zx, bt + bh, '#5a6488', 2); line(c, zx, bt + bh, zx, hy, '#9aa3be', 2.5); c.strokeStyle = '#9aa3be'; c.lineWidth = 2.5; c.beginPath(); c.arc(zx + 5, hy + 4, 5, Math.PI, Math.PI * 0.2, true); c.stroke();
        // 사과(꼭지·잎·반짝임)
        const ay = hy + 30; c.fillStyle = rad(c, zx, ay, 20, ['#ff9a8a', '#d8322a', '#7a1010']); c.beginPath(); c.moveTo(zx, ay - 14); c.bezierCurveTo(zx + 24, ay - 26, zx + 26, ay + 16, zx, ay + 19); c.bezierCurveTo(zx - 26, ay + 16, zx - 24, ay - 26, zx, ay - 14); c.fill();
        line(c, zx, ay - 14, zx + 2, ay - 22, '#5a3a18', 3); c.fillStyle = '#4caf50'; c.beginPath(); c.ellipse(zx + 10, ay - 20, 8, 3.5, -0.4, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.ellipse(zx - 8, ay - 6, 4, 7, 0.3, 0, TAU); c.fill();
        c.restore(); circ(c, zx, zy, R, null, '#d9dfef', 4);
        pill(c, zx, zy + R + 20, `저울 눈금 ${N.toFixed(1)} N`, N === 0 ? GRN : N > 2.5 ? RED : YEL, '#1d2433', '800 16px');
        // 그래프: 눈금–시간
        const Gp = graph(c, W * 0.76, H * 0.14, W * 0.2, H * 0.5, [0, 5], [0, 6], '시간(s)', '저울 눈금(N)', [0, 1, 2, 3, 4, 5]);
        [0, 2, 4, 6].forEach((v) => txt(c, String(v), W * 0.76 - 8, Gp.Y(v) + 4, DIM, '600 12px', 'right'));
        line(c, Gp.X(0), Gp.Y(1.96), Gp.X(5), Gp.Y(1.96), 'rgba(255,255,255,.3)', 1, [4, 4]); txt(c, '평소 2.0 N', Gp.X(5), Gp.Y(1.96) - 6, DIM, '600 12px', 'right');
        c.strokeStyle = YEL; c.lineWidth = 2.5; c.beginPath(); s.rec.forEach(([tt, n], i) => (i ? c.lineTo(Gp.X(Math.min(5, tt)), Gp.Y(n)) : c.moveTo(Gp.X(tt), Gp.Y(n)))); c.stroke();
        txt(c, s.ph === 'fall' ? (s.y > 20 ? '자유 낙하 중' : '브레이크') : s.ph === 'top' ? '꼭대기 60 m' : s.ph === 'up' ? '올라가는 중' : s.done ? '멈춤' : '출발 전', W * 0.86, H * 0.84, s.ph === 'fall' && s.y > 20 ? GRN : INK, '800 15px');
      },
      say(s, cur) { const N = this.read(s); return [['', '① ‘꼭대기로 올리기’를 누르자', '② ‘떨어뜨리기’를 눌러 저울 눈금을 보자', '③ 브레이크가 걸려 멈출 때까지 지켜보자'][cur] || '자유 낙하하면 무게를 느끼지 못한다', s.ph === 'fall' && s.y > 20 ? '저울 눈금 <b>0 N</b> — 사과와 저울, 사람이 <b>함께 같은 가속도로 떨어져</b> 저울을 당기지 않는다' : s.ph === 'fall' ? `브레이크 — 눈금 <b>${N.toFixed(1)} N</b>, 평소보다 무겁게 느낀다` : '사과(0.2 kg)를 단 용수철저울은 평소 약 <b>2.0 N</b>을 가리킨다']; },
    },

    /* ── 3-2-2 · 1 체험: 빈 수레와 짐 실은 수레(관성의 크기 · 같은 힘 40 N · 예) ── */
    carts: {
      M: [10, 40],
      init: () => ({ x: [0, 0], v: [0, 0], push: false, pt: 0, rec: [null, null], mode: 'push', stopT: [null, null], stopping: false }),
      tick(s, dt) {
        if (s.push && s.mode === 'push' && s.pt < 1) { s.pt = Math.min(1, s.pt + dt); [0, 1].forEach((i) => { s.v[i] += 40 / this.M[i] * dt; }); if (s.pt >= 1) { s.push = false; s.v = this.M.map((m) => 40 / m); s.rec = s.v.slice(); } }
        if (s.mode === 'stop' && s.stopping) [0, 1].forEach((i) => { if (s.v[i] > 0) { s.v[i] = Math.max(0, s.v[i] - 40 / this.M[i] * dt); s.st[i] += dt; if (s.v[i] === 0 && s.stopT[i] == null) s.stopT[i] = s.st[i]; } });
        [0, 1].forEach((i) => { s.x[i] += s.v[i] * dt; if (s.x[i] > 11) s.x[i] -= 11; });
      },
      down(s, p) { if (p.x < s.W * 0.68) { if (s.mode === 'push' && s.pt === 0) s.push = true; if (s.mode === 'stop' && !s.stopping && s.v[0] > 0) s.stopping = true; } },
      up(s) { if (s.mode === 'push' && s.push && s.pt < 1) { /* 1초를 다 채워야 한다 */ } },
      act(s, a) { if (a === 'push' && s.mode === 'push' && s.pt === 0) s.push = true; if (a === 'roll') { s.mode = 'stop'; s.v = [2, 2]; s.stopT = [null, null]; s.st = [0, 0]; s.stopping = false; } if (a === 'grab' && s.mode === 'stop') s.stopping = true; },
      steps: [(s) => s.rec[0] != null, (s) => s.mode === 'stop', (s) => s.stopT[0] != null && s.stopT[1] != null],
      draw(c, W, H, s, t) {
        c.fillStyle = lin(c, 0, 0, 0, H, ['#2a2f45', '#1c2034']); c.fillRect(0, 0, W, H);
        // 마트 바닥 타일과 진열대
        for (let i = 0; i < 6; i++) { rr(c, i * W / 5.2 - 10, H * 0.13, W / 6, H * 0.09, 4, 'rgba(255,255,255,.05)', 'rgba(185,194,216,.18)'); for (let k = 0; k < 4; k++) rr(c, i * W / 5.2 + k * 20, H * 0.145, 14, 18, 2, `hsla(${(i * 50 + k * 30) % 360},55%,55%,.5)`); }
        const lanes = [H * 0.5, H * 0.86], x0 = W * 0.2, sc = W * 0.5 / 12;
        lanes.forEach((ly, i) => {
          c.fillStyle = lin(c, 0, ly, 0, ly + 16, ['#5a6080', '#3a3f58']); c.fillRect(0, ly, W * 0.74, 16); for (let m = 0; m <= 12; m += 2) { const x = x0 + m * sc; line(c, x, ly, x, ly + 8, 'rgba(255,255,255,.4)', 1.5); txt(c, `${m} m`, x, ly + 30, DIM, '600 12px'); }
          const cx = x0 + s.x[i] * sc, cy = ly - 8;
          // 쇼핑 수레: 철망 바구니 · 손잡이 · 바퀴 · (짐)
          c.save(); c.translate(cx, cy); c.scale(1.3, 1.3);
          const sp = s.v[i]; for (let k = 0; k < 3; k++) if (sp > 0.3) line(c, -64 - k * 6, -40 + k * 12, -64 - k * 6 - sp * 8, -40 + k * 12, `rgba(255,255,255,${0.3 - k * 0.07})`, 2);
          c.strokeStyle = '#c9d0e6'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-56, -62); c.lineTo(48, -62); c.lineTo(38, -18); c.lineTo(-46, -18); c.closePath(); c.stroke();
          for (let k = 1; k < 8; k++) line(c, -56 + k * 13, -62, -46 + k * 12, -18, 'rgba(201,208,230,.6)', 1.2); for (let k = 1; k < 3; k++) line(c, -56 + k * 3.3, -62 + k * 14.6, 48 - k * 3.3, -62 + k * 14.6, 'rgba(201,208,230,.6)', 1.2);
          line(c, -56, -62, -70, -78, '#c9d0e6', 3); rr(c, -80, -84, 18, 8, 4, '#e4572e');
          line(c, -40, -18, -36, 0, '#9aa3be', 2.5); line(c, 32, -18, 30, 0, '#9aa3be', 2.5);
          [-36, 30].forEach((wx) => { circ(c, wx, 2, 7, '#1d2433', '#9aa3be', 2); line(c, wx, 2, wx + Math.cos(s.x[i] * 3) * 5, 2 + Math.sin(s.x[i] * 3) * 5, '#9aa3be', 1.5); });
          if (i === 1) [[-40, -40, '#c8955a'], [-8, -44, '#d9a86a'], [20, -40, '#b9844a'], [-24, -62, '#e2b77c'], [6, -66, '#c8955a']].forEach(([bx, by, col]) => { rr(c, bx, by, 28, 22, 2, lin(c, 0, by, 0, by + 22, [col, '#7a5327']), '#5a3a18', 1); line(c, bx + 14, by, bx + 14, by + 22, 'rgba(90,58,24,.5)', 1.5); });
          // 미는 손(누르는 동안)
          if ((s.push && s.mode === 'push') || (s.stopping && s.v[i] > 0)) { c.fillStyle = '#f1c7a0'; c.strokeStyle = '#b98562'; c.lineWidth = 1.5; const hx = s.mode === 'push' ? -88 : 58; c.beginPath(); c.ellipse(hx, -78, 12, 9, 0, 0, TAU); c.fill(); c.stroke(); rr(c, hx + (s.mode === 'push' ? -50 : 8), -86, 44, 16, 6, '#5b77c9'); arrow(c, s.mode === 'push' ? -120 : 110, -100, s.mode === 'push' ? -84 : 74, -100, YEL, 3); txt(c, '40 N', s.mode === 'push' ? -104 : 94, -108, YEL, '800 13px'); }
          c.restore();
          pill(c, W * 0.86, ly - 112, i ? '짐 실은 수레 40 kg' : '빈 수레 10 kg', i ? 'rgba(200,149,90,.95)' : 'rgba(201,208,230,.95)', '#1d2433', '800 14px');
          // 속력계
          const mx = W * 0.86, my = ly - 52; circ(c, mx, my, 34, '#f4f1e6', '#1d2433', 2.5); for (let k = 0; k <= 5; k++) { const a = Math.PI * (0.8 + k / 5 * 1.4); line(c, mx + Math.cos(a) * 26, my + Math.sin(a) * 26, mx + Math.cos(a) * 32, my + Math.sin(a) * 32, '#1d2433', 1.5); txt(c, String(k), mx + Math.cos(a) * 19, my + Math.sin(a) * 19 + 4, '#1d2433', '700 10px'); }
          const a = Math.PI * (0.8 + Math.min(5, sp) / 5 * 1.4); line(c, mx, my, mx + Math.cos(a) * 26, my + Math.sin(a) * 26, '#c0392b', 3); circ(c, mx, my, 3, '#1d2433');
          txt(c, `${sp.toFixed(1)} m/s`, mx, my + 54, INK, '800 15px');
          if (s.mode === 'stop' && s.stopT[i] != null) pill(c, mx - 96, my + 4, `멈추는 데 ${s.stopT[i].toFixed(1)} s`, YEL, '#1d2433', '800 13px');
        });
        txt(c, s.mode === 'push' ? (s.pt === 0 ? '두 수레를 같은 힘(40 N)으로 1초 동안 민다' : s.pt < 1 ? `미는 중 ${s.pt.toFixed(1)} s` : '1초 동안 밀었다') : (s.stopping ? '같은 힘(40 N)으로 붙잡는 중' : '두 수레가 같은 빠르기(2 m/s)로 굴러간다'), W * 0.4, H * 0.27, INK, '800 15px');
      },
      say(s, cur) { return [['', '① 화면을 눌러 두 수레를 1초 동안 밀자', '② ‘같은 빠르기로 굴리기’를 누르자', '③ ‘붙잡기’를 눌러 두 수레를 멈춰 보자'][cur] || '질량이 클수록 관성이 크다', s.mode === 'stop' && s.stopT[1] != null ? `같은 힘으로 붙잡아도 빈 수레는 <b>${s.stopT[0].toFixed(1)} s</b>, 짐 실은 수레는 <b>${s.stopT[1].toFixed(1)} s</b> — 무거울수록 멈추기 어렵다` : s.rec[0] != null ? `같은 힘으로 1초 밀었더니 빈 수레 <b>${s.rec[0].toFixed(1)} m/s</b>, 짐 실은 수레 <b>${s.rec[1].toFixed(1)} m/s</b> — 무거울수록 운동 상태가 덜 바뀐다` : '두 수레는 질량만 다르다(10 kg, 40 kg). 바퀴의 마찰은 무시한다']; },
    },

    /* ── 3-2-2 · 1 생활 속 예: 젖은 우산 털기 ── */
    shake: {
      init: () => { const R = rnd(4), d = []; for (let k = 0; k < 24; k++) d.push({ u: 0.15 + R() * 0.75, s: R() < 0.5 ? -1 : 1, on: true, y: 0, vy: 0, x: 0, grip: 0.7 + R() * 0.6 }); return { y: 0, vy: 0, d, drag: false, hist: [], off: 0, slowStop: false, fastStop: false, vmax: 0 }; },
      geo(s) { return { x: s.W * 0.32, y0: s.H * 0.16 }; },
      tick(s, dt) {
        if (s.drag && performance.now() - (s.pt || 0) > 45) s.vy = 0;
        const pv = s.vy0 || 0; s.vy0 = s.vy; const acc = (s.vy - pv) / Math.max(dt, 0.001);
        if (!s.drag) { s.vy = 0; if (s.y > 0) s.y = Math.max(0, s.y - dt * 60); }
        s.hist.push(s.vy); if (s.hist.length > 140) s.hist.shift();
        // 우산이 갑자기 멈추면(아래로 가다 큰 감속) 물방울은 하던 운동을 계속해 떨어져 나간다
        s.d.forEach((q) => { if (q.on) { if (acc < -600 && pv > 140 * q.grip * (0.8 + Math.random() * 0.5)) { q.on = false; q.vy = pv; q.vx = q.s * (20 + Math.random() * 40); const { x, y0 } = this.geo(s); const [px, py] = this.drop(s, q); q.x = px; q.y = py; s.off++; } } else { q.vy += 600 * dt; q.x += q.vx * dt; q.y += q.vy * dt; } });
        if (pv > 100 && acc < -600) { s.fastStop = true; } else if (pv > 15 && pv < 95 && Math.abs(s.vy) < 5) s.slowStop = true;
      },
      drop(s, q) { const { x, y0 } = this.geo(s), top = y0 + s.y, L = s.H * 0.5; const yy = top + 30 + q.u * L * 0.8, w = 12 + q.u * 24; return [x + q.s * w, yy]; },
      down(s, p) { s.drag = true; s.py = p.y; s.pt = performance.now(); },
      move(s, p, held) { if (held && s.drag) { const now = performance.now(), dtm = Math.max(1, now - s.pt) / 1000; const ny = clamp(s.y + (p.y - s.py), -40, s.H * 0.3); s.vy = (ny - s.y) / dtm * 0.6 + s.vy * 0.4; s.y = ny; s.py = p.y; s.pt = now; s.vmax = Math.max(s.vmax, s.vy); } },
      up(s) { s.drag = false; s.vy = 0; },
      act(s, a) { if (a === 'auto') { s.vy0 = 190; s.vy = 0; s.y = s.H * 0.12; } },
      steps: [(s) => s.slowStop || s.off === 0 && s.vmax > 30 && !s.drag, (s) => s.off >= 1, (s) => s.off >= 20],
      draw(c, W, H, s, t) {
        // 현관 앞: 벽 · 문 · 젖은 바닥
        c.fillStyle = lin(c, 0, 0, 0, H, ['#3a3448', '#2a2638']); c.fillRect(0, 0, W, H);
        rr(c, W * 0.56, H * 0.1, W * 0.18, H * 0.74, 6, lin(c, 0, 0, 0, H, ['#6a4a34', '#4a3424']), '#2a1c12', 2); circ(c, W * 0.58, H * 0.5, 4, '#e0c070'); rr(c, W * 0.58, H * 0.16, W * 0.14, H * 0.22, 4, 'rgba(160,200,255,.18)', 'rgba(220,235,255,.4)');
        c.fillStyle = lin(c, 0, H * 0.84, 0, H, ['#5a5468', '#3a3448']); c.fillRect(0, H * 0.84, W, H * 0.16); for (let k = 0; k < 6; k++) { c.fillStyle = 'rgba(150,200,255,.15)'; c.beginPath(); c.ellipse(W * (0.2 + k * 0.08), H * 0.9 + (k % 2) * 8, 30, 5, 0, 0, TAU); c.fill(); }
        const { x, y0 } = this.geo(s), top = y0 + s.y, L = H * 0.5;
        // 접은 우산: 손잡이 · 접힌 천(주름) · 끝 꼭지
        line(c, x, top - 30, x, top + L + 26, '#2a2a2a', 4); c.strokeStyle = '#8a5a34'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, top - 30); c.lineTo(x, top - 50); c.arc(x - 16, top - 50, 16, 0, Math.PI, true); c.stroke(); c.lineCap = 'butt';
        c.fillStyle = lin(c, x - 40, 0, x + 40, 0, ['#1b4f8a', '#3d8bd9', '#1f5aa0', '#2a6fb8', '#16457a']); c.beginPath(); c.moveTo(x - 6, top); c.quadraticCurveTo(x - 46, top + L * 0.55, x - 8, top + L); c.lineTo(x + 8, top + L); c.quadraticCurveTo(x + 46, top + L * 0.55, x + 6, top); c.closePath(); c.fill();
        for (let k = -2; k <= 2; k++) { c.strokeStyle = 'rgba(10,30,60,.55)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + k * 2, top + 6); c.quadraticCurveTo(x + k * 15, top + L * 0.55, x + k * 3, top + L - 4); c.stroke(); }
        rr(c, x - 10, top + L * 0.42, 20, 6, 3, '#e8e8e8');
        // 손(쥔 모양)
        c.fillStyle = '#f1c7a0'; c.strokeStyle = '#b98562'; c.lineWidth = 1.5; rr(c, x - 70, top - 46, 54, 22, 7, lin(c, 0, top - 46, 0, top - 24, ['#6f8ad8', '#3a4f96'])); rr(c, x - 22, top - 50, 30, 30, 10, '#f1c7a0', '#b98562'); for (let k = 0; k < 4; k++) rr(c, x - 2, top - 50 + k * 7.5, 12, 7, 3.5, '#f6d2b0', '#b98562', 1.2); c.beginPath(); c.ellipse(x - 14, top - 52, 10, 6, -0.3, 0, TAU); c.fill(); c.stroke();
        // 물방울
        s.d.forEach((q) => { const [px, py] = q.on ? this.drop(s, q) : [q.x, q.y]; if (py > H) return; c.save(); c.translate(px, py); c.rotate(q.on ? 0 : Math.atan2(q.vy, q.vx) - Math.PI / 2); c.fillStyle = 'rgba(170,215,255,.9)'; c.beginPath(); c.moveTo(0, -7); c.quadraticCurveTo(5, 0, 0, 5); c.quadraticCurveTo(-5, 0, 0, -7); c.fill(); circ(c, -1.5, 0, 1.3, '#fff'); c.restore(); });
        // 오른쪽: 우산의 빠르기 흔적과 떨어져 나간 물방울 수
        const gx = W * 0.78, gy = H * 0.14, gw = W * 0.19, gh = H * 0.3; rr(c, gx, gy, gw, gh, 8, 'rgba(255,255,255,.05)', 'rgba(185,194,216,.3)'); txt(c, '우산이 내려가는 빠르기', gx + gw / 2, gy - 8, DIM, '700 12px');
        line(c, gx, gy + gh * 0.7, gx + gw, gy + gh * 0.7, 'rgba(255,255,255,.35)', 1); // 세로 눈금: 그림 속 우산 길이(손잡이~꼭지)를 약 80 cm로 잡아 화면 빠르기(px/s)를 m/s로 어림한다(이해를 돕기 위한 예)
        const mps = 0.8 / (L + 76), Yv = (v) => gy + gh * 0.7 - clamp(v, -200, 900) / 900 * gh * 0.65;
        for (let m = 0; m * 1 / mps <= 900; m += 0.5) { const yy = Yv(m / mps), main = m % 1 === 0; line(c, gx - (main ? 5 : 3), yy, gx, yy, 'rgba(220,226,240,.6)', 1); if (main) { line(c, gx, yy, gx + gw, yy, 'rgba(255,255,255,.08)', 1); txt(c, String(m), gx - 7, yy + 4, DIM, '600 11px', 'right'); } }
        txt(c, '(m/s)', gx - 4, gy - 6, DIM, '700 11px', 'right');
        [[0, '지금'], [1, '1초 전'], [2, '2초 전']].forEach(([k, nm]) => { const xx = gx + gw * (140 - k * 60) / 140; line(c, xx, gy + gh, xx, gy + gh + 4, 'rgba(220,226,240,.6)', 1); txt(c, nm, xx, gy + gh + 15, DIM, '600 10px', k ? 'center' : 'right'); }); c.strokeStyle = '#5aa9f0'; c.lineWidth = 2; c.beginPath(); s.hist.forEach((v, i) => c.lineTo(gx + i / 140 * gw, gy + gh * 0.7 - clamp(v, -200, 900) / 900 * gh * 0.65)); c.stroke();
        pill(c, gx + gw / 2, gy + gh + 36, `떨어져 나간 물방울 ${s.off} / 24`, s.off >= 20 ? GRN : YEL, '#1d2433', '800 14px');
        if (s.fastStop) txt(c, '갑자기 멈춤 → 물방울은 계속 아래로', gx + gw / 2, gy + gh + 68, '#9cd8ff', '800 13px');
      },
      say(s, cur) { return [['', '① 우산을 천천히 내렸다 멈춰 보자', '② 빠르게 내리다가 탁 멈춰 보자', '③ 물방울을 20개 넘게 털어 내자'][cur] || '물방울은 하던 운동을 계속하려 한다', s.off ? `떨어져 나간 물방울 <b>${s.off}개</b> — 우산은 멈췄지만 물방울은 <b>관성</b> 때문에 아래로 내려가던 운동을 계속한다` : '우산을 위아래로 끌어 보자. 천천히 멈추면 물방울도 우산과 함께 멈춘다']; },
    },

    /* ── 3-2-2 · 2 탐구: 힘–시간 그래프의 넓이로 충격량 읽기(축구공 0.4 kg · 예) ── */
    kick: {
      init: () => ({ F: 600, T: 0.01, kick: null, rec: [], drag: false }),
      I(s) { return 2 * s.F * s.T / Math.PI; },
      gr(s) { return [s.W * 0.6, s.H * 0.16, s.W * 0.34, s.H * 0.48]; },
      tick(s, dt) { if (s.kick) { s.kick.t += dt; if (s.kick.t > 0.6 && !s.kick.done) { s.kick.done = true; const I = s.kick.I; s.rec.push({ F: s.kick.F, T: s.kick.T, I, v: I / 0.4 }); if (s.rec.length > 5) s.rec.shift(); } if (s.kick.t > 3.2) s.kick = null; } },
      down(s, p) { const [gx, gy, gw, gh] = this.gr(s); if (hit(p, gx - 10, gy - 20, gw + 30, gh + 30)) { s.drag = true; this.move(s, p, true); } else if (p.x < s.W * 0.52) this.go(s); },
      move(s, p, held) { if (held && s.drag) { const [gx, gy, gw, gh] = this.gr(s); s.T = clamp(Math.round((2 * (p.x - gx) / gw * 0.04) * 1000) / 1000, 0.004, 0.04); s.F = clamp(Math.round((gy + gh - p.y) / gh * 1200 / 50) * 50, 100, 1200); } },
      up(s) { s.drag = false; },
      go(s) { s.kick = { t: 0, F: s.F, T: s.T, I: this.I(s) }; },
      act(s, a) { if (a === 'go') this.go(s); if (a === 'long') { s.T = Math.min(0.04, s.T * 2); } if (a === 'soft') { s.F = 300; s.T = 0.02; } },
      steps: [(s) => s.rec.length >= 1, (s) => s.rec.some((r, i) => s.rec.some((q) => q !== r && q.F === r.F && Math.abs(q.T - 2 * r.T) < 0.0015)), (s) => s.rec.some((r) => s.rec.some((q) => q !== r && q.F !== r.F && Math.abs(q.I - r.I) / r.I < 0.06))],
      draw(c, W, H, s, t) {
        const gyl = H * 0.82; sky(c, W, H, gyl);
        for (let k = 0; k < 14; k++) line(c, k * W / 13, gyl, k * W / 13 - 30, H, 'rgba(255,255,255,.06)', 8);
        // 멀리 골대와 그물
        const nx = W * 0.4; rr(c, nx, gyl - 70, 4, 70, 1, '#eee'); rr(c, nx + 120, gyl - 70, 4, 70, 1, '#eee'); rr(c, nx, gyl - 72, 124, 4, 1, '#eee'); for (let k = 1; k < 10; k++) line(c, nx + k * 12.4, gyl - 68, nx + k * 12.4, gyl, 'rgba(255,255,255,.25)', 1); for (let k = 1; k < 6; k++) line(c, nx + 2, gyl - 70 + k * 12, nx + 122, gyl - 70 + k * 12, 'rgba(255,255,255,.25)', 1);
        // 차는 사람의 다리: 반바지 · 무릎 · 양말 · 축구화(찰 때 휘두르며 무릎이 펴진다)
        const k0 = s.kick, kt = k0 ? k0.t : 0, sw = k0 ? clamp(kt / 0.18, 0, 1) : 0.15 + Math.sin(t * 1.5) * 0.03, hx = W * 0.145, hy = gyl - 128;
        const th = -0.75 + sw * 1.05, kn = 0.9 * (1 - ease(sw)), kx = hx + Math.sin(th) * 62, ky = hy + Math.cos(th) * 62, fa = th - kn, fx = kx + Math.sin(fa) * 62, fy = ky + Math.cos(fa) * 62;
        c.lineCap = 'round';
        line(c, hx - 18, hy, hx - 30, gyl - 6, '#f1c7a0', 18); rr(c, hx - 44, gyl - 14, 34, 14, [6, 10, 4, 4], '#c8401a');
        line(c, hx, hy, kx, ky, '#f1c7a0', 20); line(c, kx, ky, fx, fy, '#f6f6f6', 17); for (let q = 0; q < 2; q++) { const u = 0.55 + q * 0.12; line(c, kx + (fx - kx) * u - 7, ky + (fy - ky) * u, kx + (fx - kx) * u + 7, ky + (fy - ky) * u, '#2a6fd0', 3); }
        circ(c, kx, ky, 10, '#f1c7a0'); c.lineCap = 'butt';
        rr(c, hx - 34, hy - 40, 60, 46, [10, 10, 14, 14], lin(c, 0, hy - 40, 0, hy + 6, ['#3d5fb8', '#22397a'])); rr(c, hx - 40, hy - 96, 70, 60, 14, lin(c, 0, hy - 96, 0, hy - 36, ['#e8574a', '#a8261c'])); line(c, hx - 30, hy - 84, hx - 52, hy - 46, '#f1c7a0', 12); line(c, hx + 22, hy - 84, hx + 44, hy - 58, '#f1c7a0', 12); circ(c, hx - 5, hy - 114, 19, rad(c, hx - 5, hy - 114, 19, ['#ffe0c4', '#f1c7a0', '#c8946e'])); c.fillStyle = '#2a1c14'; c.beginPath(); c.arc(hx - 5, hy - 118, 19, Math.PI * 1.05, Math.PI * 1.95); c.fill(); circ(c, hx + 7, hy - 114, 2.2, '#1d2433');
        c.save(); c.translate(fx, fy); c.rotate(-fa + Math.PI / 2 - 1.2); rr(c, -8, -9, 44, 18, [8, 14, 9, 6], lin(c, 0, -9, 0, 9, ['#ff8a4d', '#c8401a']), '#1d2433', 1.5); for (let q = 0; q < 4; q++) rr(c, -2 + q * 10, 8, 5, 4, 1, '#1d2433'); line(c, 6, -6, 26, -6, 'rgba(255,255,255,.6)', 1.5); c.restore();
        // 공: 닿는 동안 찌그러지고, 받은 충격량만큼 빨라져 날아간다
        const bx0 = W * 0.215, by0 = gyl - 22; let bx = bx0, by = by0, sq = 0, ba = 0;
        if (k0) { const v = k0.I / 0.4, tf = Math.max(0, kt - 0.18); if (kt > 0.15 && kt < 0.2) sq = 0.18; bx = bx0 + v * tf * 26; by = by0 - Math.max(0, v * 0.3 * tf * 26 - 9.8 * tf * tf * 26 * 0.5); ba = tf * v; if (by > by0) by = by0; }
        // 공은 골대 그물 안쪽 벽(그물)에 닿을 때까지 날아가고, 그물에 막히면 바닥으로 떨어진다
        const back = W * 0.4 + 112; if (bx > back) { const over = bx - back; bx = back - Math.min(10, over * 0.05); by = Math.min(by0, by + over * 0.6); }
        if (k0 && bx >= back - 10) { c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(back + 10, gyl - 70); c.quadraticCurveTo(back + 26, by, back + 10, gyl); c.stroke(); }
        shadow(c, bx, gyl + 3, 18, 0.35); soccer(c, bx, by, 20, ba, sq);
        if (k0 && kt > 0.2) pill(c, bx, by - 36, `${(k0.I / 0.4).toFixed(1)} m/s`, YEL, '#1d2433', '800 14px');
        // 힘–시간 그래프(끌어 모양 바꾸기) · 넓이 = 충격량
        const [gx, gy, gw, gh] = this.gr(s), Gp = graph(c, gx, gy, gw, gh, [0, 0.04], [0, 1200], '시간(s)', '힘(N)', [0, 0.01, 0.02, 0.03, 0.04]);
        [0, 400, 800, 1200].forEach((v) => txt(c, String(v), gx - 8, Gp.Y(v) + 4, DIM, '600 12px', 'right'));
        s.rec.forEach((r) => { c.strokeStyle = 'rgba(255,255,255,.22)'; c.lineWidth = 1.5; c.beginPath(); for (let k = 0; k <= 40; k++) { const tt = r.T * k / 40; c.lineTo(Gp.X(tt), Gp.Y(r.F * Math.sin(Math.PI * tt / r.T))); } c.stroke(); });
        c.beginPath(); c.moveTo(Gp.X(0), Gp.Y(0)); for (let k = 0; k <= 60; k++) { const tt = s.T * k / 60; c.lineTo(Gp.X(tt), Gp.Y(s.F * Math.sin(Math.PI * tt / s.T))); } c.closePath(); c.fillStyle = 'rgba(255,216,77,.35)'; c.fill(); c.strokeStyle = YEL; c.lineWidth = 3; c.stroke();
        const px = Gp.X(s.T / 2), py = Gp.Y(s.F); circ(c, px, py, 9, s.drag ? YEL : '#fff', '#1d2433', 2); pill(c, gx + gw - 92, gy + 16, `넓이 = 충격량 ${this.I(s).toFixed(2)} N·s`, 'rgba(255,216,77,.95)', '#1d2433', '800 13px');
        txt(c, `최대 힘 ${s.F} N · 닿은 시간 ${s.T.toFixed(3)} s`, gx + gw / 2, gy - 34, INK, '800 14px');
        // 기록표
        const ty = H * 0.86; txt(c, '최대 힘 · 닿은 시간 → 충격량 → 공의 속력', W * 0.56, ty - 8, DIM, '700 12px', 'left');
        s.rec.slice(-3).forEach((r, i) => txt(c, `${r.F} N · ${r.T.toFixed(3)} s → ${r.I.toFixed(2)} N·s → ${r.v.toFixed(1)} m/s`, W * 0.56, ty + 12 + i * 17, INK, '700 13px', 'left'));
      },
      say(s, cur) { const I = this.I(s); return [['', '① 왼쪽을 눌러 공을 차 보자', '② ‘닿는 시간 2배’를 누르고 다시 차자', '③ 힘은 작게, 시간은 길게 해서 같은 충격량을 만들어 차자'][cur] || '충격량이 같으면 공의 속력 변화도 같다', `지금 그래프의 넓이(충격량) <b>${I.toFixed(2)} N·s</b> → 0.4 kg 공의 속력 <b>${(I / 0.4).toFixed(1)} m/s</b> — 충격량 = 운동량의 변화`]; },
    },
  };

  /* 장마다 조작 전 예측(물음·보기·답·까닭)과 손가락 안내(시작점 x,y와 미는 방향 dx,dy · 비율, 0이면 톡 누르기 · 안내 글 자리) */
  const EXTRA = {
    strobe: { pred: ['수평으로 던진 공을 0.1초마다 찍은 사진에서, 공이 옆으로 간 간격은?', ['점점 넓어진다', '늘 같다', '점점 좁아진다'], 1, '옆으로 미는 힘이 없으니 손을 떠날 때의 빠르기 그대로 나아간다(등속 운동)'], hand: [0.3, 0.55, 0, 0, '왼쪽을 눌러 섬광 터뜨리기'] },
    height: { pred: ['같은 빠르기로 수평으로 던질 때, 던지는 높이를 4배로 하면 바닥까지 걸리는 시간은?', ['4배가 된다', '2배가 된다', '그대로다'], 1, '떨어진 거리는 시간의 제곱에 비례해, 높이가 4배면 시간은 2배다'], hand: [0.1, 0.72, 0, -0.3, '건물을 위아래로 끌어 높이 바꾸기', [0.32, 0.3]] },
    airdrop: { pred: ['과녁 바로 위를 지날 때 상자를 떨어뜨리면 상자는 어디에 떨어질까?', ['과녁보다 뒤쪽(못 미쳐서)', '과녁 한가운데', '과녁을 지나 앞쪽'], 2, '상자는 떨어지는 동안에도 비행기와 같은 빠르기로 앞으로 간다'], hand: [0.5, 0.55, 0, 0, '화면을 눌러 상자 떨어뜨리기'] },
    fall: { pred: ['자이로드롭이 자유 낙하하는 동안 손에 든 용수철저울(사과)의 눈금은?', ['평소와 같다', '0이 된다', '평소의 2배가 된다'], 1, '사과와 저울이 함께 같은 가속도로 떨어져 저울을 당기지 않는다'], hand: [0.2, 0.55, 0, 0, '눌러서 꼭대기로 올리기'] },
    carts: { pred: ['빈 수레(10 kg)와 짐 실은 수레(40 kg)를 같은 힘으로 1초 동안 밀면 더 빨라지는 것은?', ['빈 수레', '짐 실은 수레', '둘이 같다'], 0, '질량이 클수록 관성이 커서 운동 상태가 덜 바뀐다'], hand: [0.3, 0.6, 0, 0, '누르고 있으면 두 수레를 민다'] },
    shake: { pred: ['젖은 우산을 아래로 빠르게 내리다가 갑자기 멈추면 물방울은?', ['우산과 함께 멈춘다', '계속 아래로 움직여 떨어져 나간다', '위로 튀어 오른다'], 1, '물방울은 내려가던 운동을 계속하려는 관성이 있다'], hand: [0.32, 0.3, 0, 0.24, '우산을 아래로 빠르게 끌다가 멈추기', [0.32, 0.9]] },
    kick: { pred: ['공을 차는 힘의 크기는 같고 발이 공에 닿는 시간만 2배로 하면 공의 속력은?', ['같다', '2배가 된다', '4배가 된다'], 1, '충격량(힘 × 시간)이 2배가 되어 운동량 변화도 2배다'], hand: [0.77, 0.3, 0.08, 0, '그래프 꼭짓점을 끌어 모양 바꾸기', [0.77, 0.08]] },
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
    if (label) { c.font = `800 15px ${FONT}`; const w = c.measureText(label).width + 26, lx = g[5] ? g[5][0] * W : clamp(x + dx / 2, w / 2 + 8, W - w / 2 - 8), ly = g[5] ? g[5][1] * H : clamp(Math.min(y, y + dy) - 30, 62, H - 20); rr(c, lx - w / 2, ly - 16, w, 32, 16, 'rgba(11,14,24,.9)', 'rgba(255,216,77,.95)', 2); txt(c, label, lx, ly + 5.5, YEL, '800 15px'); }
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
