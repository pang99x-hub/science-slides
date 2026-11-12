/* 3-3 1차시 표지 «세포 하나뿐인 짚신벌레는 어떻게 먹고 자랄까?»(사건 파일 21 · 교과서 142~144쪽).
   왼쪽: 아래 띠의 돋보기를 오른쪽으로 끌면 사람(개체) → 소화계(기관계) → 위(기관) → 위벽(상피·근육 조직) → 상피세포(세포)
   → 세포 속(세포소기관)으로 단계마다 들어간다. 다음에 들어갈 곳은 그림 위 둥근 렌즈로 미리 보이고, 띠 위에 단계 이름·뜻이 뜬다.
   손을 놓으면 가까운 단계에 멈춘다. 그림마다 조금씩 움직인다(숨쉬기·위의 꿈틀 운동·근육 수축·소낭 분비·라이보솜).
   오른쪽: 현미경으로 본 물방울 속 짚신벌레가 섬모를 흔들며 헤엄친다. 물방울을 누르면 먹이(효모)가 떨어지고,
   짚신벌레가 다가가 입(세포 입)으로 삼키면 식포가 생겨 세포 안을 돌며 작아진다(분해). 넷을 분해하면 몸이 커져 둘로 나뉜다.
   크기 비율은 이해를 돕기 위한 예.
   키보드: 왼쪽·오른쪽 화살표 확대 단계, 스페이스 먹이 주기, 0 처음부터.
   Zoom.mount(root) → { fit, setActive } · 시험용: root._zm.zoom(z) · feed(x, y) · run(초) · state() */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sm = (a, b, x) => { const k = clamp((x - a) / (b - a), 0, 1); return k * k * (3 - 2 * k); };
  const hash = (i, k) => { const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); };
  const LV = [
    { n: '개체', name: '사람', d: '스스로 살아가는 생명체 하나', f: [1, -4], K: 5 },
    { n: '기관계', name: '소화계', d: '큰일 하나를 함께 맡는 기관들의 묶음 · 동물에만(식물은 조직계)', f: [16, -14], K: 3.2 },
    { n: '기관', name: '위', d: '몇 가지 조직이 모여 제 모양과 할 일을 갖춘 것', f: [24, 4], K: 6 },
    { n: '조직', name: '위벽의 상피 조직 · 근육 조직', d: '비슷한 모양·기능의 세포가 모인 무리', f: [3, -25], K: 4 },
    { n: '세포', name: '위의 상피세포', d: '생명 시스템을 이루는 기본 단위, 생명활동의 무대', f: [3, 4], K: 3.5 },
    { n: '세포소기관', name: '핵 · 라이보솜 · 소포체 · 골지체 · 마이토콘드리아', d: '세포 안에서 저마다 맡은 일을 하는 구조', f: [0, 0], K: 1 },
  ];
  const TOP = LV.length - 1, PANEL = 86, TOPBAR = 40; // 위 40px는 안내 칩 자리
  const NEED = 4; // 분해한 먹이가 이만큼이면 둘로 나뉜다(이해를 돕기 위한 예)

  // ---------- 그림 도우미(단위: 짧은 변 = 100) ----------
  function lab(c, S, t, ax, ay, lx, ly, al = 'left') {
    if (S.la <= 0.01) return;
    const px = S.px; c.save(); c.globalAlpha *= S.la;
    c.font = `700 ${15 * px}px "IBM Plex Sans KR", sans-serif`; const w = c.measureText(t).width, h = 21 * px;
    let bx = al === 'left' ? lx : al === 'right' ? lx - w - 10 * px : lx - w / 2 - 5 * px;
    bx = clamp(bx, -S.hw + 3 * px, S.hw - w - 13 * px); ly = clamp(ly, -S.hh + h / 2 + 3 * px, S.hh - h / 2 - 3 * px); // 화면 밖으로 나가지 않게
    const ex = ax < bx ? bx : bx + w + 10 * px;
    c.strokeStyle = 'rgba(29,36,51,.85)'; c.lineWidth = 1.5 * px; c.beginPath(); c.moveTo(ax, ay); c.lineTo(ax >= bx && ax <= bx + w + 10 * px ? bx + w / 2 : ex, ly); c.stroke();
    c.fillStyle = '#1d2433'; c.beginPath(); c.arc(ax, ay, 2.4 * px, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,.93)'; c.beginPath(); c.roundRect(bx, ly - h / 2, w + 10 * px, h, 5 * px); c.fill();
    c.fillStyle = '#1d2433'; c.textAlign = 'left'; c.textBaseline = 'middle'; c.fillText(t, bx + 5 * px, ly + 1 * px);
    c.restore();
  }
  const blob = (c, pts) => { // 닫힌 부드러운 곡선(중점 이차 곡선)
    const n = pts.length; c.beginPath();
    for (let i = 0; i <= n; i++) { const a = pts[i % n], b = pts[(i + 1) % n], mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2; if (i === 0) c.moveTo(mx, my); else c.quadraticCurveTo(a[0], a[1], mx, my); }
    c.closePath();
  };
  const rg = (c, x, y, r, a, b) => { const g = c.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
  function mito(c, x, y, l, w, ang, t) {
    c.save(); c.translate(x, y); c.rotate(ang + 0.05 * Math.sin(t * 1.3 + x));
    c.fillStyle = rg(c, 0, 0, l, '#ffc58a', '#d9762e'); c.strokeStyle = '#8a3f12'; c.lineWidth = w * 0.12;
    c.beginPath(); c.ellipse(0, 0, l, w, 0, 0, TAU); c.fill(); c.stroke();
    c.strokeStyle = '#a8501a'; c.lineWidth = w * 0.1; c.beginPath();
    for (let i = 0; i < 6; i++) { const u = -l * 0.75 + i * l * 0.3; c.moveTo(u, (i % 2 ? 1 : -1) * w * 0.82); c.quadraticCurveTo(u + l * 0.1, 0, u + l * 0.02, (i % 2 ? -1 : 1) * w * 0.2); }
    c.stroke(); c.restore();
  }
  function golgi(c, x, y, s, t) {
    c.save(); c.translate(x, y); c.lineCap = 'round';
    for (let i = 0; i < 5; i++) { const yy = i * s * 0.32, wid = s * (1.1 - Math.abs(i - 2) * 0.12); c.strokeStyle = i % 2 ? '#3f8fb8' : '#5aaed6'; c.lineWidth = s * 0.2; c.beginPath(); c.moveTo(-wid, yy + s * 0.25); c.quadraticCurveTo(0, yy - s * 0.3, wid, yy + s * 0.25); c.stroke(); }
    for (let k = 0; k < 3; k++) { const ph = (t * 0.35 + k / 3) % 1; c.fillStyle = `rgba(90,174,214,${1 - ph})`; c.beginPath(); c.arc(s * (1.15 + ph * 0.6) * (k % 2 ? 1 : -1), -s * (0.1 + ph * 0.9), s * 0.16, 0, TAU); c.fill(); }
    c.restore();
  }
  function rer(c, pts, w, t, dot) { // 거친면 소포체: 굵은 띠 + 라이보솜 알갱이
    c.lineCap = 'round'; c.lineJoin = 'round';
    c.strokeStyle = '#7d63b5'; c.lineWidth = w; c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.stroke();
    c.strokeStyle = '#b9a6e6'; c.lineWidth = w * 0.45; c.stroke();
    c.fillStyle = '#3a2a6e';
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], L = Math.hypot(x1 - x0, y1 - y0), nx = -(y1 - y0) / L, ny = (x1 - x0) / L, n = Math.floor(L / (dot * 3));
      for (let k = 0; k < n; k++) { const u = (k + 0.5) / n, j = 0.15 * Math.sin(t * 3 + i * 7 + k); [1, -1].forEach((sg) => { c.beginPath(); c.arc(x0 + (x1 - x0) * u + sg * nx * (w * 0.62 + j), y0 + (y1 - y0) * u + sg * ny * (w * 0.62 + j), dot, 0, TAU); c.fill(); }); }
    }
  }

  // ---------- 단계별 그림(원점 = 화면 가운데, 짧은 변 100) ----------
  function bg(c, a, b) { const g = c.createLinearGradient(0, -60, 0, 60); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(-120, -70, 240, 140); }
  function L0(c, S, t) { // 사람(개체): 배 속 소화계가 비쳐 보인다
    bg(c, '#dfeaf3', '#f5efe2');
    lab(c, S, '개체 = 사람 한 명', -14, -26, -40, -36, 'right');
    c.save(); c.scale(0.92, 0.92);
    c.fillStyle = 'rgba(0,0,0,.08)'; c.beginPath(); c.ellipse(0, 49, 16, 2.5, 0, 0, TAU); c.fill();
    const br = 1 + 0.012 * Math.sin(t * 1.6);
    c.save(); c.translate(0, -10); c.scale(br, 1); c.translate(0, 10);
    const skin = c.createLinearGradient(-15, 0, 15, 0); skin.addColorStop(0, '#d9a27a'); skin.addColorStop(0.45, '#f3c9a3'); skin.addColorStop(1, '#c98f68');
    c.fillStyle = skin; c.strokeStyle = '#8e5b3c'; c.lineWidth = 0.5;
    c.beginPath(); // 몸통·팔·다리 한 덩어리
    c.moveTo(-3, -32); c.quadraticCurveTo(-4, -29, -12, -28); c.quadraticCurveTo(-16, -27, -17, -22); c.lineTo(-20, 4); c.quadraticCurveTo(-20.5, 8, -18, 8); c.lineTo(-15.5, -16); c.lineTo(-12, -8);
    c.quadraticCurveTo(-13, 2, -12, 8); c.lineTo(-9, 47); c.lineTo(-2.5, 47); c.lineTo(-1, 14); c.lineTo(1, 14); c.lineTo(2.5, 47); c.lineTo(9, 47); c.lineTo(12, 8);
    c.quadraticCurveTo(13, 2, 12, -8); c.lineTo(15.5, -16); c.lineTo(18, 8); c.quadraticCurveTo(20.5, 8, 20, 4); c.lineTo(17, -22); c.quadraticCurveTo(16, -27, 12, -28); c.quadraticCurveTo(4, -29, 3, -32); c.closePath(); c.fill(); c.stroke();
    c.fillStyle = '#4b6fa8'; c.beginPath(); c.moveTo(-12.4, 6); c.lineTo(12.4, 6); c.lineTo(12, 16); c.lineTo(1.2, 16); c.lineTo(0, 12); c.lineTo(-1.2, 16); c.lineTo(-12, 16); c.closePath(); c.fill(); // 반바지
    c.fillStyle = skin; c.beginPath(); c.ellipse(0, -40, 6.5, 8, 0, 0, TAU); c.fill(); c.stroke();
    c.fillStyle = '#2b1d14'; c.beginPath(); c.ellipse(0, -43.5, 6.9, 5, 0, Math.PI, TAU); c.fill();
    c.fillStyle = '#2b1d14'; [-2.3, 2.3].forEach((x) => { c.beginPath(); c.arc(x, -40, 0.7, 0, TAU); c.fill(); });
    c.strokeStyle = '#a0583e'; c.lineWidth = 0.5; c.beginPath(); c.arc(0, -37, 1.8, 0.2, Math.PI - 0.2); c.stroke();
    // 비쳐 보이는 소화계
    c.fillStyle = 'rgba(255,248,240,.55)'; c.beginPath(); c.ellipse(0, -6, 9.5, 13, 0, 0, TAU); c.fill();
    c.strokeStyle = '#d4787a'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, -33); c.lineTo(0.5, -16); c.stroke();
    c.fillStyle = '#8c3b2a'; c.beginPath(); c.moveTo(-9, -15); c.quadraticCurveTo(-1, -18, 3, -14); c.quadraticCurveTo(-3, -9, -8, -9); c.closePath(); c.fill();
    c.fillStyle = '#e88f8a'; c.beginPath(); c.moveTo(0.5, -16); c.quadraticCurveTo(7, -18, 6.5, -11); c.quadraticCurveTo(5, -7, 0, -8.5); c.quadraticCurveTo(3, -11, 0.5, -16); c.fill();
    c.strokeStyle = '#c96b5e'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(-6, -6); c.lineTo(-6, 4); c.lineTo(6, 4); c.lineTo(6, -6); c.lineTo(-6, -6); c.stroke();
    c.strokeStyle = '#f0a99a'; c.lineWidth = 1; c.beginPath(); for (let i = 0; i < 5; i++) { c.moveTo(-4, -4 + i * 1.8); c.quadraticCurveTo(0, -2.6 + i * 1.8 + 0.6 * Math.sin(t * 2 + i), 4, -4 + i * 1.8); } c.stroke();
    c.restore();
    c.restore();
  }
  function L1(c, S, t) { // 소화계(기관계)
    bg(c, '#f6e6da', '#efd6c6');
    c.fillStyle = 'rgba(214,160,130,.35)'; c.beginPath(); c.moveTo(-50, -60); c.quadraticCurveTo(-46, 10, -38, 60); c.lineTo(38, 60); c.quadraticCurveTo(46, 10, 50, -60); c.fill();
    const w = 0.5 * Math.sin(t * 2);
    // 식도
    c.strokeStyle = '#d4787a'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(-2, -60); c.quadraticCurveTo(0, -40, 6, -25); c.stroke();
    // 간
    c.fillStyle = rg(c, -14, -30, 26, '#b4553a', '#6e2a1c'); c.beginPath(); c.moveTo(-40, -26); c.quadraticCurveTo(-30, -44, 0, -38); c.quadraticCurveTo(14, -36, 12, -30); c.quadraticCurveTo(-6, -18, -36, -12); c.quadraticCurveTo(-44, -16, -40, -26); c.fill();
    c.fillStyle = '#5e8a3a'; c.beginPath(); c.ellipse(-16, -16, 3.2, 4.5, 0.4, 0, TAU); c.fill(); // 쓸개
    // 위
    c.fillStyle = rg(c, 16, -18, 20, '#f6b3a8', '#d3726a'); c.strokeStyle = '#a24e48'; c.lineWidth = 0.8;
    c.beginPath(); c.moveTo(6, -26); c.quadraticCurveTo(14, -34, 24, -28); c.quadraticCurveTo(32 + w, -18, 26, -6); c.quadraticCurveTo(18, 2, 4, -2); c.quadraticCurveTo(-2, -4, -6, -2); c.lineTo(-6, -6); c.quadraticCurveTo(2, -8, 10, -10); c.quadraticCurveTo(14, -16, 6, -26); c.fill(); c.stroke();
    // 이자
    c.fillStyle = '#e9c27a'; c.beginPath(); c.ellipse(4, 2, 14, 2.6, -0.15, 0, TAU); c.fill();
    // 큰창자(테두리)
    c.strokeStyle = '#c98a62'; c.lineWidth = 7; c.lineJoin = 'round'; c.beginPath(); c.moveTo(-28, 40); c.lineTo(-30, 8); c.quadraticCurveTo(-30, 4, -24, 5); c.lineTo(26, 6); c.quadraticCurveTo(32, 6, 31, 12); c.lineTo(30, 38); c.quadraticCurveTo(24, 48, 6, 48); c.lineTo(4, 58); c.stroke();
    c.strokeStyle = '#a96c48'; c.lineWidth = 0.6; for (let y = 12; y < 40; y += 4) { c.beginPath(); c.moveTo(-33, y); c.lineTo(-26, y + 0.5); c.moveTo(27, y); c.lineTo(34, y + 0.5); c.stroke(); }
    // 작은창자(구불구불)
    c.strokeStyle = '#ef9f92'; c.lineWidth = 3.2; c.beginPath();
    for (let r = 0; r < 6; r++) { const y = 13 + r * 5; for (let x = -22; x <= 22; x += 2) { const xx = r % 2 ? -x : x, yy = y + 2.2 * Math.sin(x * 0.55 + t * 2 + r); if (x === -22 && r === 0) c.moveTo(xx, yy); else c.lineTo(xx, yy); } }
    c.stroke(); c.strokeStyle = 'rgba(160,70,60,.35)'; c.lineWidth = 0.5; c.stroke();
    lab(c, S, '식도', 1, -48, 14, -52); lab(c, S, '간', -30, -26, -42, -40, 'right'); lab(c, S, '위', 24, -16, 38, -26); lab(c, S, '이자', 14, 2, 38, 0);
    lab(c, S, '작은창자', -10, 24, -40, 52, 'right'); lab(c, S, '큰창자', 30, 30, 40, 44);
  }
  function stomachPath(c, w) {
    c.beginPath(); c.moveTo(-14, -30); c.quadraticCurveTo(-2, -48, 20, -40); c.quadraticCurveTo(40 + w, -26, 36, 2); c.quadraticCurveTo(32, 30, 4, 34); c.quadraticCurveTo(-18, 36, -30, 24);
    c.lineTo(-44, 26); c.lineTo(-46, 16); c.lineTo(-30, 14); c.quadraticCurveTo(-16, 18, -6, 12); c.quadraticCurveTo(4, 4, -2, -10); c.quadraticCurveTo(-6, -20, -14, -30); c.closePath();
  }
  function L2(c, S, t) { // 위(기관)
    bg(c, '#f4e3d8', '#e8cfc0');
    const w = 2 * Math.sin(t * 1.4);
    c.strokeStyle = '#d4787a'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(-26, -62); c.quadraticCurveTo(-20, -44, -12, -32); c.stroke(); // 식도
    c.strokeStyle = '#e9a395'; c.lineWidth = 9; c.beginPath(); c.moveTo(-40, 20); c.quadraticCurveTo(-52, 22, -56, 40); c.stroke(); // 샘창자
    c.fillStyle = rg(c, 10, -10, 50, '#f7bdb2', '#cd6a62'); stomachPath(c, w); c.fill();
    c.save(); stomachPath(c, w); c.clip();
    c.strokeStyle = 'rgba(160,60,55,.35)'; c.lineWidth = 0.7; for (let i = -6; i < 12; i++) { c.beginPath(); c.moveTo(-50, -40 + i * 7); c.bezierCurveTo(-10, -50 + i * 7, 20, -10 + i * 7, 50, -30 + i * 7); c.stroke(); }
    const ph = (t * 0.25) % 1; // 꿈틀 운동 띠(위 위쪽에서 아래로)
    for (let k = 0; k < 2; k++) { const u = (ph + k * 0.5) % 1, x = 32 - u * 52, y = -30 + u * 58; c.strokeStyle = `rgba(150,40,40,${0.3 * Math.sin(u * Math.PI)})`; c.lineWidth = 6; c.beginPath(); c.moveTo(x - 20, y - 14); c.lineTo(x + 18, y + 12); c.stroke(); }
    c.restore();
    c.strokeStyle = '#9e4a44'; c.lineWidth = 0.9; stomachPath(c, w); c.stroke();
    // 잘라 본 창: 위벽의 층
    const fx = 24, fy = 4; c.save(); c.translate(fx, fy); c.rotate(-0.35);
    const lay = [['#fbe7d6', 2], ['#e38a96', 3], ['#f2d6c8', 2], ['#c8504a', 4], ['#e6a090', 1.2]]; let y = -6;
    lay.forEach(([col, h]) => { c.fillStyle = col; c.fillRect(-7, y, 14, h); y += h; });
    c.strokeStyle = '#7a2e2a'; c.lineWidth = 0.5; c.strokeRect(-7, -6, 14, y + 6);
    c.restore();
    lab(c, S, '식도', -22, -48, -36, -54, 'right'); lab(c, S, '샘창자', -50, 28, -36, 46);
    lab(c, S, '잘라 본 위벽', 30, -2, 40, -40);
  }
  function L3(c, S, t) { // 위벽 조직: 위쪽 상피 조직, 아래 결합 조직·근육 조직
    bg(c, '#fff6df', '#f3e0cf');
    c.fillStyle = 'rgba(255,240,200,.8)'; c.fillRect(-120, -70, 240, 32); // 위 속(점액)
    for (let i = 0; i < 9; i++) { c.fillStyle = 'rgba(240,215,160,.6)'; c.beginPath(); c.arc(-70 + i * 18 + 6 * Math.sin(t * 0.7 + i), -46 + 3 * Math.sin(t + i * 2), 2 + hash(i, 3) * 2, 0, TAU); c.fill(); }
    // 결합 조직
    c.fillStyle = '#f6dfd2'; c.fillRect(-120, -14, 240, 18);
    c.strokeStyle = 'rgba(200,140,120,.6)'; c.lineWidth = 0.5; for (let i = 0; i < 16; i++) { c.beginPath(); c.moveTo(-80 + i * 10, -12 + hash(i, 1) * 4); c.bezierCurveTo(-74 + i * 10, -4, -86 + i * 10, -6, -78 + i * 10, 2); c.stroke(); }
    c.strokeStyle = '#c9504a'; c.lineWidth = 3; c.beginPath(); c.moveTo(-80, -3); c.bezierCurveTo(-30, -9, 10, 4, 80, -4); c.stroke();
    for (let i = 0; i < 8; i++) { const u = ((t * 0.12 + i / 8) % 1); c.fillStyle = '#b8322c'; c.beginPath(); c.ellipse(-80 + u * 160, -3 + 3.5 * Math.sin((u * 160 - 80) * 0.04) - 1, 1.2, 0.8, 0, 0, TAU); c.fill(); }
    // 근육 조직: 방추형 세포
    c.fillStyle = '#e7a7a0'; c.fillRect(-120, 4, 240, 70);
    for (let r = 0; r < 8; r++) for (let k = -6; k < 7; k++) {
      const x = k * 13 + (r % 2) * 6.5, y = 9 + r * 6, sq = 1 + 0.12 * Math.sin(t * 2.2 - x * 0.06), len = 7 / sq, hh = 2.4 * sq;
      c.fillStyle = r % 2 ? '#d9736f' : '#cf6763'; c.strokeStyle = '#9b3f3c'; c.lineWidth = 0.3;
      c.beginPath(); c.moveTo(x - len, y); c.quadraticCurveTo(x, y - hh * 1.4, x + len, y); c.quadraticCurveTo(x, y + hh * 1.4, x - len, y); c.fill(); c.stroke();
      c.fillStyle = '#5a2346'; c.beginPath(); c.ellipse(x, y, 2.2 / sq, 0.7 * sq, 0, 0, TAU); c.fill();
    }
    // 상피 조직: 기둥 모양 세포가 한 줄로(4개마다 오목한 구멍)
    for (let k = -9; k <= 9; k++) {
      const x = k * 7.5 + 3, pit = ((k + 20) % 4) === 0, top = pit ? -26 : -38;
      c.fillStyle = pit ? '#efc7d5' : '#f3cfe0'; c.strokeStyle = '#a0577a'; c.lineWidth = 0.4;
      c.beginPath(); c.roundRect(x - 3.6, top, 7.2, -14 - top, [2, 2, 0.6, 0.6]); c.fill(); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.7)'; for (let g = 0; g < 3; g++) { c.beginPath(); c.arc(x - 1.6 + g * 1.6, top + 2.2 + (g % 2), 0.9, 0, TAU); c.fill(); }
      c.fillStyle = '#5d2a6e'; c.beginPath(); c.ellipse(x, -19, 1.8, 2.4, 0, 0, TAU); c.fill();
    }
    lab(c, S, '상피 조직', -20, -30, -46, -44, 'right'); lab(c, S, '결합 조직', 30, -8, 46, -24); lab(c, S, '근육 조직', 20, 30, 34, 44);
  }
  function L4(c, S, t) { // 상피세포 하나
    bg(c, '#fdf3e4', '#f4e2d4');
    const cell = (x, sc) => { c.beginPath(); c.roundRect(x - 22 * sc, -48, 44 * sc, 98, [12, 12, 4, 4]); };
    [-48, 48].forEach((x) => { c.fillStyle = '#f0d3e0'; c.strokeStyle = '#a0577a'; c.lineWidth = 0.8; cell(x, 1); c.fill(); c.stroke(); c.fillStyle = '#7c4a8e'; c.beginPath(); c.ellipse(x, 26, 14, 10, 0, 0, TAU); c.fill(); });
    const g = c.createLinearGradient(0, -48, 0, 50); g.addColorStop(0, '#fbe6ef'); g.addColorStop(1, '#f4d6e4'); c.fillStyle = g; c.strokeStyle = '#8e3f68'; c.lineWidth = 1.4; cell(0, 1); c.fill(); c.stroke();
    // 핵
    c.fillStyle = rg(c, 0, 26, 16, '#a985c9', '#6a3f8e'); c.beginPath(); c.ellipse(0, 26, 15, 11, 0, 0, TAU); c.fill(); c.strokeStyle = '#4b2766'; c.lineWidth = 0.8; c.stroke();
    c.fillStyle = '#3c1f57'; c.beginPath(); c.arc(4, 24, 3.4, 0, TAU); c.fill();
    c.fillStyle = 'rgba(70,35,95,.4)'; for (let i = 0; i < 12; i++) { c.beginPath(); c.arc(-10 + hash(i, 2) * 20, 19 + hash(i, 4) * 14, 0.9, 0, TAU); c.fill(); }
    rer(c, [[-18, 14], [-12, 10], [-4, 12], [4, 10], [12, 12], [18, 16]], 1.6, t, 0.45);
    rer(c, [[-17, 8], [-10, 4], [-2, 6], [6, 3], [16, 7]], 1.6, t, 0.45);
    golgi(c, 0, -8, 7, t);
    mito(c, -13, -18, 5, 2.2, 0.7, t); mito(c, 14, -2, 5, 2.2, -0.9, t); mito(c, -14, 40, 4.5, 2, 0.2, t); mito(c, 15, 42, 4.5, 2, -0.3, t);
    // 분비 소낭: 골지체에서 나와 위쪽 세포막으로 가서 터진다
    for (let k = 0; k < 5; k++) {
      const ph = (t * 0.22 + k / 5) % 1, x = -9 + k * 4.5 + 2 * Math.sin(k * 3 + ph * 6), y = -14 - ph * 32;
      c.fillStyle = `rgba(232,196,110,${ph > 0.9 ? (1 - ph) * 10 : 1})`; c.strokeStyle = '#b08436'; c.lineWidth = 0.4; c.beginPath(); c.arc(x, y, 2.2, 0, TAU); c.fill(); c.stroke();
    }
    lab(c, S, '핵', -8, 30, -36, 8, 'right'); lab(c, S, '세포막', 21, -30, 34, -44); lab(c, S, '세포질', 10, 0, 34, -14);
    lab(c, S, '마이토콘드리아', 15, 42, 30, 50); lab(c, S, '골지체', -5, -8, -36, -12, 'right'); lab(c, S, '분비 소낭', -6, -34, -36, -34, 'right');
  }
  function L5(c, S, t) { // 세포 속 소기관 가까이
    bg(c, '#fbeef2', '#f3dfe7');
    // 핵(왼쪽 아래) 2중 막·핵공
    c.fillStyle = rg(c, -44, 66, 56, '#a985c9', '#6a3f8e'); c.beginPath(); c.arc(-44, 66, 50, 0, TAU); c.fill();
    c.strokeStyle = '#4b2766'; c.lineWidth = 1.4; c.beginPath(); c.arc(-44, 66, 50, 0, TAU); c.stroke(); c.beginPath(); c.arc(-44, 66, 47.5, 0, TAU); c.stroke();
    c.strokeStyle = '#fbeef2'; c.lineWidth = 2.2; for (let a = -1.75; a < 0.2; a += 0.28) { c.beginPath(); c.arc(-44, 66, 48.7, a, a + 0.05); c.stroke(); }
    c.strokeStyle = 'rgba(60,30,90,.5)'; c.lineWidth = 0.6; for (let i = 0; i < 14; i++) { c.beginPath(); const x = -60 + hash(i, 1) * 30, y = 30 + hash(i, 2) * 20; c.moveTo(x, y); c.bezierCurveTo(x + 4, y - 3, x + 2, y + 5, x + 7, y + 2); c.stroke(); }
    // 거친면 소포체(핵막과 이어짐)
    for (let k = 0; k < 4; k++) { const y = -2 - k * 8; rer(c, [[-30 + k * 3, 20 - k * 6], [-20, y + 6], [-6, y], [8, y + 4], [18, y - 2]], 3.2, t, 0.9); }
    // 골지체 + 소낭
    golgi(c, 36, -20, 14, t);
    // 소포체 → 골지체로 가는 작은 소낭
    for (let k = 0; k < 3; k++) { const ph = (t * 0.3 + k / 3) % 1; c.fillStyle = '#9fd0ea'; c.strokeStyle = '#3f8fb8'; c.lineWidth = 0.6; c.beginPath(); c.arc(18 + ph * 14, -12 + Math.sin(ph * 3 + k) * 4, 2, 0, TAU); c.fill(); c.stroke(); }
    // 떠다니는 라이보솜
    c.fillStyle = '#3a2a6e'; for (let i = 0; i < 18; i++) { c.beginPath(); c.arc(-60 + hash(i, 5) * 120 + 1.2 * Math.sin(t + i), -46 + hash(i, 6) * 30 + 1.2 * Math.cos(t * 1.3 + i), 0.9, 0, TAU); c.fill(); }
    mito(c, 38, 28, 16, 7, -0.25, t);
    lab(c, S, '핵 — DNA, 생명활동 조절', -14, 34, 0, 44);
    lab(c, S, '라이보솜 — 단백질 합성', -20.5, 3.4, -50, -10);
    lab(c, S, '소포체 — 단백질 운반 통로', -6, -24, -50, -42);
    lab(c, S, '골지체 — 싸서 밖으로 분비', 40, -22, 50, -31, 'right');
    lab(c, S, '마이토콘드리아 — 세포호흡', 38, 22, 50, 6, 'right');
  }
  const DRAW = [L0, L1, L2, L3, L4, L5];

  // ---------- 짚신벌레 ----------
  function newPm(x, y, a, L) { return { x, y, a, L, grow: 1, vac: [], dig: 0, fis: null, ph: Math.random() * 6, cv: Math.random() }; }
  function outline(L, Wd, pinch) { // 몸 둘레 점: 앞(+x)은 둥글고 뒤는 조금 뾰족, 위쪽(−y)에 입으로 들어가는 고랑
    const pts = [];
    for (let i = 0; i <= 40; i++) {
      const s = 1 - (i / 40) * 2, hw = Wd * Math.pow(1 - s * s, 0.55) * (1 + 0.12 * s) * (1 - pinch * Math.exp(-s * s / 0.02));
      const groove = s > -0.15 && s < 0.65 ? 0.3 * Wd * Math.sin((s + 0.15) / 0.8 * Math.PI) : 0;
      pts.push([s * L / 2, -hw + groove]);
    }
    for (let i = 1; i < 40; i++) { const s = -1 + (i / 40) * 2, hw = Wd * Math.pow(1 - s * s, 0.55) * (1 + 0.12 * s) * (1 - pinch * Math.exp(-s * s / 0.02)); pts.push([s * L / 2, hw]); }
    return pts;
  }
  function drawPm(c, o, t) {
    const L = o.L * o.grow, Wd = L * 0.2, pin = o.fis ? sm(0.2, 1, o.fis.k) * 0.95 : 0;
    c.save(); c.translate(o.x, o.y); c.rotate(o.a);
    const pts = outline(L, Wd, pin);
    // 섬모: 둘레를 따라 물결처럼
    c.strokeStyle = 'rgba(70,90,80,.75)'; c.lineWidth = 0.9; c.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], q = pts[(i + 1) % pts.length], dx = q[0] - p[0], dy = q[1] - p[1], d = Math.hypot(dx, dy) || 1, nx = dy / d, ny = -dx / d;
      for (let k = 0; k < 2; k++) { const x = p[0] + dx * k / 2, y = p[1] + dy * k / 2, w = Math.sin(o.ph * 9 - (i * 2 + k) * 0.55); c.moveTo(x, y); c.lineTo(x + nx * 5 - dx / d * 2.4 * w, y + ny * 5 - dy / d * 2.4 * w); }
    }
    c.stroke();
    // 몸
    c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]))); c.closePath();
    const g = c.createLinearGradient(0, -Wd, 0, Wd); g.addColorStop(0, 'rgba(214,226,200,.92)'); g.addColorStop(0.5, 'rgba(236,240,222,.88)'); g.addColorStop(1, 'rgba(196,210,184,.92)');
    c.fillStyle = g; c.fill(); c.strokeStyle = '#4f6a58'; c.lineWidth = 1.3; c.stroke();
    c.save(); c.clip();
    c.fillStyle = 'rgba(110,130,100,.35)'; for (let i = 0; i < 40; i++) { c.beginPath(); c.arc((hash(i, 1) - 0.5) * L * 0.85, (hash(i, 2) - 0.5) * Wd * 1.5, 0.9, 0, TAU); c.fill(); }
    // 세포 입(고랑 끝)
    c.strokeStyle = '#5c7464'; c.lineWidth = 1; c.beginPath(); c.moveTo(L * 0.32, -Wd * 0.75); c.quadraticCurveTo(L * 0.12, -Wd * 0.2, -L * 0.02, Wd * 0.05); c.stroke();
    // 큰핵·작은핵(나뉠 때는 큰핵이 길어져 둘로)
    const nk = pin > 0.3 ? 1 : 0;
    [[-1, 1], [1, 1]].slice(0, 1 + nk).forEach(([sg], j) => { const cx = nk ? (j ? 1 : -1) * L * 0.22 : -L * 0.04; c.fillStyle = 'rgba(150,140,170,.75)'; c.beginPath(); c.ellipse(cx, Wd * 0.12, L * (nk ? 0.09 : 0.12 + pin * 0.1), Wd * 0.42, 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(90,80,120,.85)'; c.beginPath(); c.arc(cx + L * 0.07, Wd * 0.35, 1.6, 0, TAU); c.fill(); });
    // 수축포 두 개(물을 모았다 내보낸다)
    [-0.3, 0.3].forEach((u, k) => {
      const ph = (o.cv + t * 0.35 + k * 0.5) % 1, r = 1.5 + 4.5 * sm(0, 0.85, ph) * (ph < 0.9 ? 1 : 0), x = u * L, y = -Wd * 0.25;
      c.strokeStyle = 'rgba(120,170,200,.8)'; c.lineWidth = 0.8; for (let m = 0; m < 6; m++) { const a = m * TAU / 6; c.beginPath(); c.moveTo(x + Math.cos(a) * r, y + Math.sin(a) * r); c.lineTo(x + Math.cos(a) * (r + 4 - r * 0.4), y + Math.sin(a) * (r + 4 - r * 0.4)); c.stroke(); }
      c.fillStyle = 'rgba(200,232,248,.9)'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    });
    // 식포: 세포 안을 돌며 작아진다
    o.vac.forEach((v) => {
      const a = v.ang, x = Math.cos(a) * L * 0.3, y = Math.sin(a) * Wd * 0.55, r = v.r * (1 - 0.55 * v.d);
      c.fillStyle = `rgba(${200 - v.d * 60},${140 + v.d * 40},${90 + v.d * 60},.9)`; c.strokeStyle = 'rgba(90,60,40,.7)'; c.lineWidth = 0.7; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.stroke();
      c.fillStyle = 'rgba(120,70,40,.7)'; for (let k = 0; k < v.n; k++) { c.beginPath(); c.arc(x + Math.cos(k * 2.1) * r * 0.45, y + Math.sin(k * 2.1) * r * 0.45, r * 0.28 * (1 - v.d), 0, TAU); c.fill(); }
    });
    c.restore(); c.restore();
  }
  const mouthOf = (o) => { const L = o.L * o.grow, ca = Math.cos(o.a), sa = Math.sin(o.a), lx = L * 0.15, ly = -L * 0.2 * 0.4; return [o.x + ca * lx - sa * ly, o.y + sa * lx + ca * ly]; };

  function mount(root) {
    const stage = root.querySelector('.zm-stage'), now = root.querySelector('.zm-now'), P = window.Play, txt = P.txt;
    let t, z, zt, drag, pms, food, ev, msg, seen, ate, divided, fed;
    const geo = (W, H) => { const ZW = Math.round(W * 0.58); return { ZW, VH: H - PANEL, drop: { x: ZW + (W - ZW) / 2, y: H / 2 + 8, r: Math.min(W - ZW, H) / 2 - 16 } }; };
    function reset() {
      t = 0; z = 0; zt = 0; drag = false; ev = null; seen = new Set([0]); ate = 0; divided = 0; fed = 0; food = [];
      pms = null;
    }
    reset();
    const say = (h, ok) => { if (h !== msg) { msg = h; now.innerHTML = h; now.classList.toggle('done', !!ok); } };
    const event = (h, sec = 3.5) => { ev = { h, until: t + sec }; };

    function ensurePm(g) { if (!pms) pms = [newPm(g.drop.x - 20, g.drop.y + 10, -0.4, g.drop.r * 0.82)]; }
    function feed(x, y) {
      fed++;
      for (let i = 0; i < 6; i++) food.push({ x: x + (Math.random() - 0.5) * 22, y: y + (Math.random() - 0.5) * 22, vx: 0, vy: 0, a: Math.random() * 3 });
      if (food.length > 36) food.splice(0, food.length - 36);
      if (!ate) event('먹이(효모)를 떨어뜨렸다 — 짚신벌레가 다가간다');
    }
    function stepPm(dt, g) {
      ensurePm(g);
      const D = g.drop;
      food.forEach((f) => { f.vx += (Math.random() - 0.5) * 40 * dt; f.vy += (Math.random() - 0.5) * 40 * dt; f.vx *= 0.96; f.vy *= 0.96; f.x += f.vx * dt; f.y += f.vy * dt; f.a += dt; const d = Math.hypot(f.x - D.x, f.y - D.y); if (d > D.r - 4) { f.x = D.x + (f.x - D.x) * (D.r - 4) / d; f.y = D.y + (f.y - D.y) * (D.r - 4) / d; } });
      const born = [];
      pms.forEach((o) => {
        o.ph += dt; o.cv += dt * 0.05;
        if (o.fis) { o.fis.k += dt / 3; if (o.fis.k >= 1) { const L = o.L, ca = Math.cos(o.a), sa = Math.sin(o.a), d = L * o.grow * 0.27; born.push(newPm(o.x - ca * d, o.y - sa * d, o.a + Math.PI * 0.9, L)); Object.assign(o, newPm(o.x + ca * d, o.y + sa * d, o.a, L)); divided++; event('둘로 나뉘었다 — <b>세포 하나가 곧 한 개체</b>, 이렇게 수가 늘어난다', 5); } return; }
        // 가까운 먹이 쪽으로 방향을 튼다
        let tg = null, best = 1e9; food.forEach((f) => { const d = Math.hypot(f.x - o.x, f.y - o.y); if (d < best) { best = d; tg = f; } });
        let want = o.a + 0.6 * Math.sin(t * 0.7 + o.cv * 20) * dt * 3;
        if (tg) want = Math.atan2(tg.y - o.y, tg.x - o.x);
        const dc = Math.hypot(o.x - D.x, o.y - D.y), L = o.L * o.grow;
        if (dc > D.r - L * 0.55) want = Math.atan2(D.y - o.y, D.x - o.x);
        let da = ((want - o.a + Math.PI * 3) % TAU) - Math.PI; o.a += clamp(da, -2.2 * dt, 2.2 * dt);
        const sp = (tg ? 34 : 22) * (1 + 0.15 * Math.sin(o.ph * 5));
        o.x += Math.cos(o.a) * sp * dt; o.y += Math.sin(o.a) * sp * dt;
        if (dc > D.r - L * 0.4) { o.x = D.x + (o.x - D.x) * (D.r - L * 0.4) / dc; o.y = D.y + (o.y - D.y) * (D.r - L * 0.4) / dc; }
        // 입 가까이 온 먹이를 삼킨다 → 식포
        const [mx, my] = mouthOf(o);
        for (let i = food.length - 1; i >= 0; i--) {
          const f = food[i]; if (Math.hypot(f.x - mx, f.y - my) > L * 0.2 && Math.hypot(f.x - o.x, f.y - o.y) > L * 0.28) continue;
          food.splice(i, 1);
          const nv = o.vac.find((v) => v.age < 1.2 && v.n < 4);
          if (nv) { nv.n++; nv.r += 0.7; } else o.vac.push({ ang: -0.6, r: 3.8, n: 1, d: 0, age: 0 });
          if (!ate) event('먹이를 삼키자 세포 안에 <b>식포</b>가 생겼다 — 식포 속에서 분해(소화)한다', 5);
          ate++;
        }
        // 식포는 세포 안을 돌며 분해된다
        for (let i = o.vac.length - 1; i >= 0; i--) {
          const v = o.vac[i]; v.age += dt; v.ang += dt * 0.7; v.d = clamp((v.age - 1.5) / 6, 0, 1);
          if (v.d >= 1) { o.vac.splice(i, 1); o.dig += v.n; o.grow = Math.min(1.32, 1 + o.dig * 0.08); event(`분해해 얻은 물질과 에너지로 몸을 만든다 — 몸이 커진다 (${Math.min(o.dig, NEED)}/${NEED})`, 4); }
        }
        if (o.dig >= NEED && !o.fis && pms.length + born.length < 3) { o.fis = { k: 0 }; event('다 자라면 가운데가 잘록해지며 둘로 나뉜다', 4); }
      });
      pms.push(...born);
      for (let i = 0; i < pms.length; i++) for (let j = i + 1; j < pms.length; j++) { // 서로 겹치지 않게 살짝 밀어낸다
        const A = pms[i], B = pms[j], dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 1, m = A.L * 0.55;
        if (d < m && !A.fis && !B.fis) { const k = (m - d) * Math.min(1, dt * 3) / d; A.x -= dx * k; A.y -= dy * k; B.x += dx * k; B.y += dy * k; }
      }
    }

    // ---------- 그리기 ----------
    function drawZoom(c, g, W, H) {
      const w = g.ZW, h = g.VH, u = Math.min(w, h - TOPBAR) / 100, i = Math.min(Math.floor(z), TOP), f = i === TOP ? 0 : z - i;
      const L = LV[i], K = L.K, s = Math.pow(K, f), cx0 = w / 2, cy0 = TOPBAR + (h - TOPBAR) / 2, hw = w / 2 / u, hh = (h - TOPBAR) / 2 / u;
      const p = [cx0 + L.f[0] * u, cy0 + L.f[1] * u], e = sm(0, 1, f), q = [p[0] + (cx0 - p[0]) * e, p[1] + (cy0 - p[1]) * e];
      c.save(); c.beginPath(); c.rect(0, 0, w, h); c.clip();
      // 지금 단계
      c.save(); c.translate(q[0], q[1]); c.scale(s, s); c.translate(-p[0], -p[1]); c.translate(cx0, cy0); c.scale(u, u);
      DRAW[i](c, { px: 1 / (u * s), la: 1 - sm(0.02, 0.18, f), hw, hh }, t); c.restore();
      if (i < TOP) {
        // 다음 단계가 렌즈 안에서 커진다
        const sn = s / K, R = Math.hypot(w / 2, h / 2 + TOPBAR) * sn * 1.02, la = sm(0, 0.35, f);
        if (la > 0.001) {
          c.save(); c.beginPath(); c.arc(q[0], q[1], R, 0, TAU); c.clip(); c.globalAlpha = la;
          c.translate(q[0], q[1]); c.scale(sn, sn); c.translate(-cx0, -cy0); c.translate(cx0, cy0); c.scale(u, u);
          DRAW[i + 1](c, { px: 1 / (u * sn), la: sm(0.86, 1, f), hw, hh }, t); c.restore();
        }
        if (f < 0.98) { // 렌즈 테
          const pul = drag || f > 0.02 ? 0 : 0.12 * Math.sin(t * 4), rr = Math.max(R, 14) * (1 + pul);
          c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 5; c.beginPath(); c.arc(q[0], q[1], rr, 0, TAU); c.stroke();
          c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.setLineDash(f < 0.02 ? [6, 5] : []); c.beginPath(); c.arc(q[0], q[1], rr, 0, TAU); c.stroke(); c.setLineDash([]);
        }
      }
      c.restore();
    }
    function drawPanel(c, g, W, H) {
      const x0 = 0, y0 = g.VH, w = g.ZW;
      c.fillStyle = '#fbf8f0'; c.fillRect(x0, y0, w, PANEL); c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, y0); c.lineTo(w, y0); c.stroke();
      const r = Math.round(z), L = LV[r];
      txt(c, `${'①②③④⑤⑥'[r]} ${L.n}`, 12, y0 + 24, '#b0301f', '800 19px', 'left');
      c.font = '800 19px "IBM Plex Sans KR", sans-serif'; const nw = c.measureText(`${'①②③④⑤⑥'[r]} ${L.n}`).width;
      let nm = L.name; c.font = '700 16px "IBM Plex Sans KR", sans-serif'; while (c.measureText(nm).width > w - nw - 36 && nm.length > 4) nm = nm.slice(0, -2) + '…';
      txt(c, nm, 22 + nw, y0 + 24, '#1d2433', '700 16px', 'left');
      // 띠·눈금
      const tx0 = 44, tx1 = w - 30, ty = y0 + 50, X = (k) => tx0 + (tx1 - tx0) * k / TOP;
      c.strokeStyle = '#c9c2b0'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(tx0, ty); c.lineTo(tx1, ty); c.stroke();
      c.strokeStyle = '#d9483b'; c.beginPath(); c.moveTo(tx0, ty); c.lineTo(X(z), ty); c.stroke();
      LV.forEach((o, k) => { c.fillStyle = k <= z + 0.01 ? '#d9483b' : '#fff'; c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; c.beginPath(); c.arc(X(k), ty, 4.5, 0, TAU); c.fill(); c.stroke(); txt(c, o.n === '세포소기관' ? '소기관' : o.n, X(k), ty + 26, k === r ? '#1d2433' : '#6b7280', k === r ? '800 14px' : '600 13px'); });
      // 돋보기 손잡이
      const kx = X(z), bob = !drag && z < 0.05 ? 3 * Math.sin(t * 4) : 0;
      c.save(); c.translate(kx + bob, ty - 2);
      c.strokeStyle = '#6b4a2b'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(9, 9); c.lineTo(19, 19); c.stroke();
      c.fillStyle = 'rgba(200,230,255,.85)'; c.strokeStyle = '#1d2433'; c.lineWidth = 3.5; c.beginPath(); c.arc(0, 0, 13, 0, TAU); c.fill(); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.arc(-4, -4, 3.5, 0, TAU); c.fill();
      c.restore();
      if (z < 0.05 && !drag) { c.fillStyle = '#1d2433'; c.beginPath(); c.moveTo(kx + 28 + bob, ty - 6); c.lineTo(kx + 38 + bob, ty); c.lineTo(kx + 28 + bob, ty + 6); c.fill(); }
    }
    function drawDrop(c, g, W, H) {
      const D = g.drop, x0 = g.ZW;
      c.fillStyle = '#2a3142'; c.fillRect(x0, 0, W - x0, H);
      c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, 0); c.lineTo(x0, H); c.stroke();
      c.save(); c.beginPath(); c.arc(D.x, D.y, D.r, 0, TAU); c.clip();
      const gr = c.createRadialGradient(D.x - D.r * 0.2, D.y - D.r * 0.25, D.r * 0.1, D.x, D.y, D.r); gr.addColorStop(0, '#f6fbf4'); gr.addColorStop(0.75, '#dfece2'); gr.addColorStop(1, '#a9bfb2'); c.fillStyle = gr; c.fillRect(D.x - D.r, D.y - D.r, D.r * 2, D.r * 2);
      // 물속 부스러기·세균 점
      for (let i = 0; i < 26; i++) { const a = hash(i, 1) * TAU, rr = Math.sqrt(hash(i, 2)) * D.r * 0.95; c.fillStyle = i % 3 ? 'rgba(120,140,110,.35)' : 'rgba(150,120,80,.35)'; c.beginPath(); c.ellipse(D.x + Math.cos(a) * rr + Math.sin(t * 0.5 + i) * 2, D.y + Math.sin(a) * rr + Math.cos(t * 0.4 + i) * 2, 1.4 + hash(i, 3) * 2, 1 + hash(i, 4), i, 0, TAU); c.fill(); }
      food.forEach((f) => { c.fillStyle = '#e9c27a'; c.strokeStyle = '#9a6a2a'; c.lineWidth = 0.8; c.beginPath(); c.ellipse(f.x, f.y, 3.2, 2.4, f.a, 0, TAU); c.fill(); c.stroke(); });
      pms.forEach((o) => drawPm(c, o, t));
      c.restore();
      c.strokeStyle = '#11151f'; c.lineWidth = 6; c.beginPath(); c.arc(D.x, D.y, D.r + 3, 0, TAU); c.stroke();
      txt(c, '현미경 속 짚신벌레', D.x, 22, '#fbfcf9', '800 16px');
      txt(c, ate ? `먹은 먹이 ${ate} · 개체 수 ${pms.length}` : '물방울을 누르면 먹이', D.x, H - 10, '#ffd84d', '700 15px');
    }
    const zFromX = (x, g) => { const tx0 = 44, tx1 = g.ZW - 30; return clamp((x - tx0) / (tx1 - tx0) * TOP, 0, TOP); };

    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const g = geo(W, H);
        if (!drag) { zt = Math.round(zt); z += (zt - z) * Math.min(1, dt * 5); if (Math.abs(zt - z) < 0.002) z = zt; }
        seen.add(Math.round(z));
        for (let k = 0; k < 3; k++) stepPm(dt / 3, g);
        drawZoom(c, g, W, H); drawPanel(c, g, W, H); drawDrop(c, g, W, H);
        if (ev && t > ev.until) ev = null;
        const deep = seen.has(TOP);
        if (deep && divided) say('먹고 · 분해하고 · 자라고 · 나뉜다 → <b>세포 하나도 생명 시스템</b>', true);
        else if (ev) say(ev.h);
        else if (!deep && z < 0.3) say('아래 <b>돋보기</b>를 오른쪽으로 끌어 몸속으로 들어가 보자');
        else if (!deep) say(`${LV[Math.round(z)].n}: ${LV[Math.round(z)].d}`);
        else if (!ate) say('이번엔 오른쪽 물방울을 눌러 짚신벌레에게 먹이를 주자');
        else say(`${LV[Math.round(z)].n}: ${LV[Math.round(z)].d}`);
      },
      down(p) {
        const g = geo(S.W, S.H);
        if (p.x < g.ZW && p.y > g.VH - 4) { drag = true; zt = z = zFromX(p.x, g); return; }
        if (p.x < g.ZW) { drag = true; this.sy = p.y; this.sx = p.x; this.z0 = z; this.pic = true; return; } // 그림을 위아래로 끌어도 확대
        if (Math.hypot(p.x - g.drop.x, p.y - g.drop.y) < g.drop.r) feed(p.x, p.y);
      },
      move(p) {
        if (!drag) return; const g = geo(S.W, S.H);
        if (this.pic) { z = zt = clamp(this.z0 + ((p.x - this.sx) - (p.y - this.sy)) / 120, 0, TOP); return; }
        z = zt = zFromX(p.x, g);
      },
      up() { drag = false; this.pic = false; },
      key(e) {
        const k = e.key;
        if (k === 'ArrowRight' || k === 'ArrowUp') { zt = clamp(Math.round(zt) + 1, 0, TOP); return true; }
        if (k === 'ArrowLeft' || k === 'ArrowDown') { zt = clamp(Math.round(zt) - 1, 0, TOP); return true; }
        if (k === ' ' || k === 'Enter') { const g = geo(S.W, S.H); const a = Math.random() * TAU; feed(g.drop.x + Math.cos(a) * g.drop.r * 0.5, g.drop.y + Math.sin(a) * g.drop.r * 0.5); return true; }
        if (k === '0') { reset(); return true; } return false;
      },
    });
    const state = () => ({ z: +z.toFixed(2), level: LV[Math.round(z)].n, seen: [...seen].sort(), food: food.length, ate, divided, n: pms ? pms.length : 0, dig: pms ? pms.map((o) => o.dig) : [], msg });
    root._zm = {
      zoom: (v) => { z = zt = clamp(v, 0, TOP); seen.add(Math.round(z)); S.kick(); return state(); },
      feed: (x, y) => { const g = geo(S.W, S.H); ensurePm(g); feed(x == null ? g.drop.x : x, y == null ? g.drop.y : y); S.kick(); return state(); },
      run: (sec) => { const g = geo(S.W, S.H); for (let i = 0; i < sec * 60; i++) { t += 1 / 60; stepPm(1 / 60, g); } S.kick(); return state(); },
      geo: () => geo(S.W, S.H), state,
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Zoom = { mount };
})();
