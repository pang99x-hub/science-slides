/* 3-2 4차시 체험 «공 받기와 공 차기»(교과서 134쪽 그림 Ⅲ-25 · 135쪽 그림 Ⅲ-27 + 참고서 두꺼운 글러브 · 맨손과 글러브 문제).
   위쪽 그림 표지 둘을 눌러 바꾼다.
   (가) 공 받기: 맨손/글러브 그림을 눌러 고르고, 공 기계를 누르면 야구공(150 g, 20 m/s, 느린 화면)이 날아온다.
     손을 잡은 채 공이 닿을 때 뒤로 끌면 공과 함께 빠지며 멈추는 거리(손 완충 + 끈 거리)가 길어진다. 멈추는 시간 = 2 × 거리 ÷ 처음 속력.
     충격량(운동량 변화 3.0 N·s)은 늘 같고, 평균 힘 = 충격량 ÷ 시간. 600 N을 넘으면 «아야!»(화면 흔들림).
   (나) 공 차기: 발을 잡아 뒤로 당긴 만큼 휘두르는 세기(평균 힘 200~1000 N), 앞으로 끌어 공에 닿은 뒤 더 밀수록 접촉 시간(2~12 ms).
     충격량 = 힘 × 시간 → 공(430 g)의 속력 → 30°로 차 올린 거리.
   ① 손을 대고 받는다 ② 뒤로 빼며 받는다 ③ 끝까지 차서 멀리 보낸다.
   공의 질량·속력·완충 거리·아픈 기준·차는 힘과 시간은 이해를 돕기 위한 예. 공기 저항 무시.
   Catch.mount(root) → { fit, setActive } · 시험용: root._ct.mode('catch'|'kick') · glove(on) · catchIt(끈 cm) · kick(F, ms) · state() · geo() */
(function () {
  'use strict';
  const TAU = Math.PI * 2, G = 9.8, MB = 0.15, VB = 20, PB = MB * VB, PAD = { bare: 2, glove: 6 }, PULLMAX = 40, OUCH = 600;
  const MS = 0.43, FMIN = 200, FMAX = 1000, TMIN = 2, TMAX = 12, ANG = Math.PI / 6, XMAX = 70;
  const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1);
  const catchCalc = (glove, pull) => { const d = (glove ? PAD.glove : PAD.bare) + pull, T = 2 * d / 100 / VB * 1000, avg = PB / (T / 1000); return { glove, pull, d, T, I: PB, avg, pk: Math.PI / 2 * avg, ouch: avg > OUCH }; };
  const kickCalc = (F, ms) => { const I = F * ms / 1000, v = I / MS; return { F, T: ms, I, avg: F, pk: Math.PI / 2 * F, v, x: v * v * Math.sin(2 * ANG) / G }; };
  // 자체 확인: 맨손으로 대고 받으면 아프고(2 ms · 1500 N), 맨손이라도 20 cm 빼면 안 아프다. 글러브만 껴도 600 N 아래. 큰 힘을 오래 차면 더 멀리.
  console.assert(catchCalc(false, 0).ouch && Math.round(catchCalc(false, 0).avg) === 1500 && !catchCalc(false, 20).ouch && !catchCalc(true, 0).ouch && kickCalc(800, 10).x > kickCalc(800, 4).x && kickCalc(1000, 6).x > kickCalc(300, 6).x, 'catch: 계산');

  function mount(root) {
    const stage = root.querySelector('.ct-stage'), chip = root.querySelector('.ct-now'), out = root.querySelector('.ct-out');
    const cell = (k) => root.querySelector(`[data-ct="${k}"]`);
    const P = window.Play;
    let mode, glove, ph, bx, hx, hx0, grace, drag, cur, catches, kicks, clock, msg, shake, show, fx, wind, F, cx0, kms, ft, bg = null, bgKey = '';

    function reset() {
      mode = 'catch'; glove = false; ph = 'ready'; bx = 0; hx = null; hx0 = 0; grace = 0; drag = null; cur = null; catches = []; kicks = []; clock = 0; shake = 0; show = 1;
      fx = null; wind = 0; F = 0; cx0 = 0; kms = 0; ft = 0;
      say('(가) 공 받기: 오른쪽 <b>공 기계</b>를 눌러 공을 보내자. 먼저 손을 <b>그대로 대고</b> 받아 본다.');
      fill(); steps();
    }
    const say = (s) => { if (s !== msg) { msg = s; out.innerHTML = s; } };

    // ── 자리 잡기 ──
    const geo = () => {
      const W = S.W, H = S.H, TOP = 92, SW = Math.round(W * 0.6), GY = H - 70, HY = Math.round((TOP + GY) / 2) - 10, HX = 290, CM = 4;
      return { W, H, TOP, SW, GY, HY, HX, CM, tabs: [{ k: 'catch', x: 14, y: 10, w: 250, h: 72 }, { k: 'kick', x: 276, y: 10, w: 250, h: 72 }],
        mach: { x: SW - 108, y: HY - 40, w: 92, h: 86 }, picks: [{ k: false, x: 22, y: GY - 6, w: 118, h: 58 }, { k: true, x: 150, y: GY - 6, w: 118, h: 58 }],
        BX: 250, FY: GY - 6, kx: (SW - 40 - 250) / XMAX, graph: { x: SW + 12, y: TOP, w: W - SW - 26, h: H - TOP - 14 } };
    };
    const restFoot = (g) => g.BX - 70;

    // ── 그림 도구 ──
    function pill(c, x, y, s, bgc, fg = '#fff', f = '700 15px', al = 'center') {
      c.font = `${f} "IBM Plex Sans KR", sans-serif`; const w = c.measureText(s).width + 16, x0 = al === 'left' ? x : al === 'right' ? x - w : x - w / 2;
      c.fillStyle = bgc; c.beginPath(); c.roundRect(x0, y - 16, w, 25, 12); c.fill();
      P.txt(c, s, x0 + w / 2, y + 2, fg, f);
    }
    function arrow(c, x0, y, x1, col, w = 7) {
      const d = Math.sign(x1 - x0) || 1, L = Math.abs(x1 - x0); if (L < 4) return; const hl = Math.min(16, L * 0.5);
      c.fillStyle = col; c.beginPath(); c.moveTo(x0, y - w / 2); c.lineTo(x1 - d * hl, y - w / 2); c.lineTo(x1 - d * hl, y - w * 1.3); c.lineTo(x1, y); c.lineTo(x1 - d * hl, y + w * 1.3); c.lineTo(x1 - d * hl, y + w / 2); c.lineTo(x0, y + w / 2); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1; c.stroke();
    }
    function baseball(c, x, y, r = 12) {
      const g = c.createRadialGradient(x - r * 0.4, y - r * 0.4, 1, x, y, r); g.addColorStop(0, '#ffffff'); g.addColorStop(0.7, '#ece7dc'); g.addColorStop(1, '#a9a294');
      c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1; c.stroke();
      c.strokeStyle = '#c8322a'; c.lineWidth = 1.4; c.beginPath(); c.arc(x - r * 1.2, y, r * 0.95, -0.7, 0.7); c.stroke(); c.beginPath(); c.arc(x + r * 1.2, y, r * 0.95, Math.PI - 0.7, Math.PI + 0.7); c.stroke();
      for (let k = -2; k <= 2; k++) { const a = k * 0.28; [[x - r * 1.2, 1], [x + r * 1.2, -1]].forEach(([cx, d]) => { const px = cx + d * Math.cos(a) * r * 0.95, py = y + Math.sin(a) * r * 0.95; c.beginPath(); c.moveTo(px - 2, py - 1.5); c.lineTo(px + 2, py + 1.5); c.stroke(); }); }
    }
    function soccer(c, x, y, r = 18, rot = 0) {
      c.save(); c.translate(x, y); c.rotate(rot);
      const g = c.createRadialGradient(-r * 0.4, -r * 0.4, 1, 0, 0, r); g.addColorStop(0, '#ffffff'); g.addColorStop(0.75, '#e6e8ec'); g.addColorStop(1, '#9ca2ad');
      c.fillStyle = g; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.fill();
      c.save(); c.beginPath(); c.arc(0, 0, r, 0, TAU); c.clip();
      const pent = (px, py, s) => { c.beginPath(); for (let k = 0; k < 5; k++) { const a = -Math.PI / 2 + k * TAU / 5; c.lineTo(px + Math.cos(a) * s, py + Math.sin(a) * s); } c.closePath(); c.fillStyle = '#1d2433'; c.fill(); };
      pent(0, 0, r * 0.36); [0, 1, 2, 3, 4].forEach((k) => { const a = -Math.PI / 2 + k * TAU / 5; pent(Math.cos(a) * r * 0.98, Math.sin(a) * r * 0.98, r * 0.3); });
      c.strokeStyle = 'rgba(29,36,51,.5)'; c.lineWidth = 1; [0, 1, 2, 3, 4].forEach((k) => { const a = -Math.PI / 2 + k * TAU / 5; c.beginPath(); c.moveTo(Math.cos(a) * r * 0.36, Math.sin(a) * r * 0.36); c.lineTo(Math.cos(a) * r * 0.7, Math.sin(a) * r * 0.7); c.stroke(); });
      c.restore(); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1; c.beginPath(); c.arc(0, 0, r, 0, TAU); c.stroke(); c.restore();
    }
    function bareHand(c, x, y, k = 1, hurt = 0) { // 옆에서 본 손: 손바닥이 오른쪽(+x)을 향하고 손가락은 위로, x = 손바닥 면
      c.save(); c.translate(x, y); c.scale(k, k);
      c.fillStyle = '#2f5fa8'; c.beginPath(); c.roundRect(-150, -16, 112, 36, 10); c.fill(); c.fillStyle = '#244c88'; c.fillRect(-48, -18, 10, 40); // 소매
      const sk = hurt > 0 ? `rgb(241,${Math.round(199 - 80 * hurt)},${Math.round(160 - 80 * hurt)})` : '#f1c7a0';
      const gr = c.createLinearGradient(-36, 0, 0, 0); gr.addColorStop(0, '#d9a77d'); gr.addColorStop(1, sk);
      c.fillStyle = gr; c.strokeStyle = '#a8764e'; c.lineWidth = 1.6;
      c.beginPath(); c.roundRect(-40, -12, 14, 26, 6); c.fill(); // 손목
      c.beginPath(); c.roundRect(-34, -30, 34, 62, 12); c.fill(); c.stroke(); // 손바닥
      c.beginPath(); c.roundRect(-30, -80, 26, 58, 12); c.fill(); c.stroke(); // 모은 손가락
      c.strokeStyle = 'rgba(168,118,78,.6)'; c.lineWidth = 1.2; [-62, -44].forEach((yy) => { c.beginPath(); c.moveTo(-24, yy); c.quadraticCurveTo(-14, yy - 3, -6, yy); c.stroke(); });
      c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-12, -74, 4, 3, 0, 0, TAU); c.fill(); // 손톱
      c.fillStyle = gr; c.strokeStyle = '#a8764e'; c.lineWidth = 1.6; c.beginPath(); c.ellipse(-4, -20, 9, 20, 0.5, 0, TAU); c.fill(); c.stroke(); // 엄지
      c.strokeStyle = 'rgba(168,118,78,.5)'; c.beginPath(); c.moveTo(-6, 4); c.quadraticCurveTo(-14, 14, -8, 24); c.stroke();
      c.restore();
    }
    function body(c, hipX, hipY, FY) { // 차는 사람(몸통·디딤발·머리)
      c.save(); c.lineCap = 'round';
      c.strokeStyle = '#173266'; c.lineWidth = 32; c.beginPath(); c.moveTo(hipX - 16, hipY); c.lineTo(hipX - 36, hipY + 70); c.stroke();
      c.strokeStyle = '#e0ad84'; c.lineWidth = 22; c.beginPath(); c.moveTo(hipX - 36, hipY + 70); c.lineTo(hipX - 42, FY - 26); c.stroke();
      c.fillStyle = '#20242c'; c.beginPath(); c.ellipse(hipX - 34, FY - 14, 26, 11, 0, 0, TAU); c.fill();
      const jg = c.createLinearGradient(hipX - 40, 0, hipX + 30, 0); jg.addColorStop(0, '#2f5fa8'); jg.addColorStop(1, '#1e3f80');
      c.fillStyle = jg; c.beginPath(); c.roundRect(hipX - 44, hipY - 128, 70, 134, 20); c.fill();
      c.fillStyle = '#fff'; P.txt(c, '7', hipX - 9, hipY - 54, '#fff', '900 34px');
      c.strokeStyle = '#2f5fa8'; c.lineWidth = 18; c.beginPath(); c.moveTo(hipX + 14, hipY - 110); c.lineTo(hipX + 56, hipY - 70); c.stroke(); c.beginPath(); c.moveTo(hipX - 34, hipY - 110); c.lineTo(hipX - 70, hipY - 60); c.stroke();
      c.fillStyle = '#e0ad84'; c.beginPath(); c.arc(hipX + 62, hipY - 62, 9, 0, TAU); c.fill(); c.beginPath(); c.arc(hipX - 74, hipY - 54, 9, 0, TAU); c.fill();
      const hg = c.createRadialGradient(hipX - 14, hipY - 162, 4, hipX - 8, hipY - 154, 30); hg.addColorStop(0, '#f6cfa6'); hg.addColorStop(1, '#c98d62');
      c.fillStyle = hg; c.beginPath(); c.arc(hipX - 8, hipY - 156, 26, 0, TAU); c.fill();
      c.fillStyle = '#2b1d14'; c.beginPath(); c.arc(hipX - 8, hipY - 162, 27, Math.PI * 1.02, Math.PI * 2.05); c.fill();
      c.fillStyle = '#2b1d14'; c.beginPath(); c.arc(hipX + 6, hipY - 154, 2.6, 0, TAU); c.fill();
      c.restore();
    }
    function gloveDraw(c, x, y, k = 1, squash = 0, hurt = 0) { // 포수 글러브, x = 주머니 앞면
      c.save(); c.translate(x, y); c.scale(k, k);
      c.fillStyle = '#2f5fa8'; c.beginPath(); c.roundRect(-160, -16, 96, 34, 10); c.fill();
      const lg = c.createRadialGradient(-40, -14, 6, -34, 0, 64); lg.addColorStop(0, hurt > 0 ? '#c76a3a' : '#c98a4b'); lg.addColorStop(0.7, '#8e5424'); lg.addColorStop(1, '#5a3112');
      c.fillStyle = lg; c.strokeStyle = '#3d1f08'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(-70, -30); c.quadraticCurveTo(-40, -62, -6 + squash * 6, -46); c.quadraticCurveTo(10 - squash * 4, 0, -6 + squash * 6, 46); c.quadraticCurveTo(-40, 62, -70, 30); c.quadraticCurveTo(-82, 0, -70, -30); c.closePath(); c.fill(); c.stroke();
      // 주머니(오목)
      const pg = c.createRadialGradient(-18 + squash * 6, 0, 2, -18, 0, 30); pg.addColorStop(0, '#6e3a12'); pg.addColorStop(1, 'rgba(110,58,18,0)'); c.fillStyle = pg; c.beginPath(); c.ellipse(-16 + squash * 4, 0, 18 - squash * 4, 30, 0, 0, TAU); c.fill();
      // 끈·바느질
      c.strokeStyle = '#e8c18a'; c.lineWidth = 2; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(-64, -26); c.quadraticCurveTo(-38, -54, -10, -42); c.stroke(); c.beginPath(); c.moveTo(-64, 26); c.quadraticCurveTo(-38, 54, -10, 42); c.stroke(); c.setLineDash([]);
      c.strokeStyle = '#3d1f08'; c.lineWidth = 3; [-30, -10, 10, 30].forEach((yy) => { c.beginPath(); c.moveTo(-8 + squash * 6, yy); c.lineTo(2 - squash * 2, yy + 5); c.stroke(); });
      c.fillStyle = '#b77a3c'; c.beginPath(); c.roundRect(-82, -20, 16, 40, 6); c.fill(); c.strokeStyle = '#3d1f08'; c.lineWidth = 1.5; c.stroke();
      c.restore();
    }
    function leg(c, g, x) { // 엉덩이 고정, 발(축구화)이 x에 오도록 무릎을 굽힌다
      const hipX = g.BX - 100, hipY = g.FY - 150, fy = g.FY - 12, L1 = 110, L2 = 110;
      body(c, hipX, hipY, g.FY);
      const dx = x - hipX, dy = fy - hipY, D = Math.min(L1 + L2 - 1, Math.hypot(dx, dy)), a = Math.atan2(dy, dx), b = Math.acos((L1 * L1 + D * D - L2 * L2) / (2 * L1 * D));
      const kx = hipX + L1 * Math.cos(a - b), ky = hipY + L1 * Math.sin(a - b), fxp = hipX + D * Math.cos(a), fyp = hipY + D * Math.sin(a);
      c.save(); c.lineCap = 'round';
      c.strokeStyle = '#1e3f80'; c.lineWidth = 34; c.beginPath(); c.moveTo(hipX, hipY); c.lineTo(kx, ky); c.stroke(); // 반바지·허벅지
      c.strokeStyle = '#e9b88f'; c.lineWidth = 24; c.beginPath(); c.moveTo(kx, ky); c.lineTo((kx + fxp) / 2, (ky + fyp) / 2); c.stroke();
      c.strokeStyle = '#d23a2a'; c.lineWidth = 22; c.beginPath(); c.moveTo((kx + fxp) / 2, (ky + fyp) / 2); c.lineTo(fxp, fyp - 4); c.stroke(); // 양말
      c.strokeStyle = '#fff'; c.lineWidth = 3; c.beginPath(); c.moveTo((kx + fxp) / 2 - 10, (ky + fyp) / 2 + 2); c.lineTo((kx + fxp) / 2 + 10, (ky + fyp) / 2 + 2); c.stroke();
      c.restore();
      // 축구화
      c.fillStyle = '#20242c'; c.beginPath(); c.moveTo(fxp - 18, fyp - 14); c.lineTo(fxp + 26, fyp - 6); c.quadraticCurveTo(fxp + 36, fyp + 2, fxp + 26, fyp + 10); c.lineTo(fxp - 20, fyp + 10); c.closePath(); c.fill();
      c.strokeStyle = '#fff'; c.lineWidth = 2; [0, 8, 16].forEach((o) => { c.beginPath(); c.moveTo(fxp - 8 + o, fyp - 10); c.lineTo(fxp - 2 + o, fyp + 4); c.stroke(); });
      c.fillStyle = '#888'; [-12, 4, 18].forEach((o) => c.fillRect(fxp + o, fyp + 10, 4, 4));
      return { x: fxp + 30, y: fyp };
    }
    function hand(c, x, y, rot = 0) {
      c.save(); c.translate(x, y); c.rotate(rot); c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 5;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(14, 18); c.lineTo(5, 18); c.lineTo(5, 36); c.lineTo(-5, 36); c.lineTo(-5, 18); c.lineTo(-14, 18); c.closePath();
      c.fillStyle = '#ffd84d'; c.fill(); c.shadowBlur = 0; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.stroke(); c.restore();
    }

    function paintBg(g) {
      const { W, H, TOP, SW, GY } = g;
      const k2 = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const cv = document.createElement('canvas'); cv.width = W * k2; cv.height = H * k2;
      const c = cv.getContext('2d'); c.setTransform(k2, 0, 0, k2, 0, 0);
      c.fillStyle = '#eef1f6'; c.fillRect(0, 0, W, H);
      const sky = c.createLinearGradient(0, TOP, 0, GY); sky.addColorStop(0, '#7fc2ea'); sky.addColorStop(1, '#d9eefb'); c.fillStyle = sky; c.fillRect(0, TOP, SW, GY - TOP);
      [[0.3, 0.16, 34], [0.7, 0.1, 26]].forEach(([x, y, r]) => { c.fillStyle = 'rgba(255,255,255,.85)'; [0, 1, 2].forEach((j) => { c.beginPath(); c.arc(SW * x + j * r * 0.8, TOP + (GY - TOP) * y + (j === 1 ? -r * 0.3 : 0), r * 0.6, 0, TAU); c.fill(); }); });
      // 관중석 담장
      c.fillStyle = '#2f6b3a'; c.fillRect(0, GY - 120, SW, 22); c.fillStyle = 'rgba(255,255,255,.18)'; for (let x = 0; x < SW; x += 34) c.fillRect(x, GY - 120, 2, 22);
      const gr = c.createLinearGradient(0, GY - 98, 0, H); gr.addColorStop(0, '#5aa34d'); gr.addColorStop(1, '#2f6e2c'); c.fillStyle = gr; c.fillRect(0, GY - 98, SW, H - GY + 98);
      for (let x = 0; x < SW; x += 64) { c.fillStyle = 'rgba(255,255,255,.05)'; c.fillRect(x, GY - 98, 32, H - GY + 98); }
      c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.strokeRect(1, TOP, SW - 1, H - TOP - 1);
      c.fillStyle = '#1d2433'; c.fillRect(SW + 1, TOP, 3, H - TOP);
      return cv;
    }
    function bgKick(c, g) { // 차기 칸: 바닥 거리 눈금
      const { BX, FY, kx, SW } = g;
      c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(BX - 4, FY + 8, XMAX * kx + 8, 6);
      c.strokeStyle = '#1d2433'; c.lineWidth = 1.2;
      for (let m = 0; m <= XMAX; m += 5) { const x = BX + m * kx; c.beginPath(); c.moveTo(x, FY + 8); c.lineTo(x, FY + (m % 10 ? 14 : 20)); c.stroke(); if (m % 10 === 0) P.txt(c, String(m), x, FY + 36, '#fbfcf9', '700 14px'); }
      P.txt(c, '날아간 거리(m)', SW - 14, FY + 56, '#fbfcf9', '700 13px', 'right');
    }

    // 그래프(받기: 손이 받는 힘 / 차기: 공이 받는 힘)
    function niceMax(v) { const st = [200, 500, 1000, 1500, 2000, 2500]; return st.find((s) => s >= v * 1.05) || 2500; }
    function graph(c, g) {
      const B = g.graph, x0 = B.x + 54, y0 = B.y + B.h - 40, w = B.w - 72, hh = B.h - 150;
      c.fillStyle = '#fff'; c.beginPath(); c.roundRect(B.x, B.y, B.w, B.h, 10); c.fill(); c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.stroke();
      P.txt(c, mode === 'catch' ? '손이 받는 힘–시간 그래프' : '공이 받는 힘–시간 그래프', B.x + 12, B.y + 24, '#1d2433', '800 16px', 'left');
      const list = (mode === 'catch' ? catches : kicks).slice(0, 3), XM = mode === 'catch' ? 50 : 14;
      const Y = niceMax(Math.max(mode === 'catch' ? OUCH : 400, ...list.map((r) => r.pk))), sx = w / XM, sy = hh / Y;
      c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0, y0 - hh - 6); c.lineTo(x0, y0); c.lineTo(x0 + w + 6, y0); c.stroke();
      for (let n = Y / 5; n <= Y + 0.1; n += Y / 5) { c.strokeStyle = 'rgba(29,36,51,.10)'; c.beginPath(); c.moveTo(x0, y0 - n * sy); c.lineTo(x0 + w, y0 - n * sy); c.stroke(); P.txt(c, String(Math.round(n)), x0 - 5, y0 - n * sy + 4, '#59607a', '600 12px', 'right'); }
      const tst = mode === 'catch' ? 10 : 2; for (let n = tst; n <= XM; n += tst) P.txt(c, String(n), x0 + n * sx, y0 + 16, '#59607a', '600 12px');
      P.txt(c, '힘(N)', x0 + 6, y0 - hh - 10, '#59607a', '700 13px', 'left'); P.txt(c, '시간(ms)', x0 + w, y0 + 32, '#59607a', '700 13px', 'right');
      if (mode === 'catch') { c.save(); c.setLineDash([7, 5]); c.strokeStyle = '#d0342c'; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, y0 - OUCH * sy); c.lineTo(x0 + w, y0 - OUCH * sy); c.stroke(); c.restore(); P.txt(c, `평균 ${OUCH} N 넘으면 아야!`, x0 + w, y0 - OUCH * sy - 6, '#d0342c', '700 12px', 'right'); }
      list.slice().reverse().forEach((r) => {
        const top = r === list[0], upto = top ? r.T * show : r.T, col = mode === 'catch' ? (r.glove ? '#8e5424' : '#e07a3a') : '#1f6fb8';
        c.beginPath(); c.moveTo(x0, y0); for (let k = 0; k <= 48; k++) { const tt = upto * k / 48; c.lineTo(x0 + Math.min(XM, tt) * sx, y0 - r.pk * Math.sin(Math.PI * tt / r.T) * sy); } c.lineTo(x0 + Math.min(XM, upto) * sx, y0); c.closePath();
        c.globalAlpha = top ? 1 : 0.5; c.fillStyle = col + (top ? '55' : '22'); c.fill(); c.strokeStyle = col; c.lineWidth = top ? 3 : 1.5; c.stroke(); c.globalAlpha = 1;
        if (top && show >= 1) { c.save(); c.setLineDash([5, 4]); c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; c.strokeRect(x0, y0 - r.avg * sy, Math.min(XM, r.T) * sx, r.avg * sy); c.restore(); }
      });
      // 아래 글
      const r = list[0], ty = B.y + B.h - 104 + 14;
      void ty;
      const tx = B.x + 14, by = B.y + 54;
      if (r && show >= 1) {
        if (mode === 'catch') {
          P.txt(c, `${r.glove ? '글러브' : '맨손'} · ${r.pull >= 1 ? `뒤로 ${Math.round(r.pull)} cm 빼며` : '그대로 대고'} · 멈추는 거리 ${Math.round(r.d)} cm`, tx, by, '#1d2433', '700 15px', 'left');
          P.txt(c, `충격량 ${f1(r.I)} N·s ÷ ${f1(r.T)} ms = 평균 힘 ${Math.round(r.avg)} N`, tx, by + 22, r.ouch ? '#c0321f' : '#1f7a2a', '800 15px', 'left');
        } else {
          P.txt(c, `평균 힘 ${r.F} N × ${r.T} ms = 충격량 ${f1(r.I)} N·s`, tx, by, '#1d2433', '800 15px', 'left');
          P.txt(c, `공 속력 ${f1(r.v)} m/s → ${f1(Math.min(XMAX, r.x))}${r.x > XMAX ? ' m 넘게' : ' m'}`, tx, by + 22, '#1f4fa0', '800 15px', 'left');
        }
      } else P.txt(c, mode === 'catch' ? '공을 받으면 그래프가 그려진다' : '공을 차면 그래프가 그려진다', tx, by + 10, '#8a90a2', '700 15px', 'left');
    }
    function tabs(c, g) {
      g.tabs.forEach((t) => {
        const on = t.k === mode;
        c.fillStyle = on ? '#fff' : 'rgba(255,255,255,.55)'; c.beginPath(); c.roundRect(t.x, t.y, t.w, t.h, 12); c.fill(); c.strokeStyle = on ? '#1d2433' : 'rgba(29,36,51,.45)'; c.lineWidth = on ? 3 : 1.5; c.stroke();
        if (on) { c.fillStyle = '#ffd84d'; c.fillRect(t.x + 10, t.y + t.h - 7, t.w - 20, 4); }
        c.save(); c.beginPath(); c.roundRect(t.x + 6, t.y + 6, 92, t.h - 12, 8); c.clip(); c.fillStyle = '#7fc2ea'; c.fillRect(t.x + 6, t.y + 6, 92, t.h - 12); c.fillStyle = '#4f9a45'; c.fillRect(t.x + 6, t.y + t.h - 22, 92, 16);
        if (t.k === 'catch') { gloveDraw(c, t.x + 72, t.y + 36, 0.4); baseball(c, t.x + 86, t.y + 34, 7); } else { soccer(c, t.x + 74, t.y + t.h - 24, 11, 0.3); c.fillStyle = '#20242c'; c.beginPath(); c.ellipse(t.x + 52, t.y + t.h - 22, 14, 7, 0.2, 0, TAU); c.fill(); c.fillStyle = '#d23a2a'; c.fillRect(t.x + 34, t.y + 14, 10, 30); }
        c.restore();
        P.txt(c, t.k === 'catch' ? '(가) 공 받기' : '(나) 공 차기', t.x + 106, t.y + 32, '#1d2433', on ? '800 19px' : '700 18px', 'left');
        P.txt(c, t.k === 'catch' ? '시간↑ → 힘↓' : '힘×시간↑ → 멀리', t.x + 106, t.y + 56, '#59607a', '700 14px', 'left');
      });
    }

    function drawCatch(c, g) {
      const { HY, mach } = g, hurt = shake > 0 ? Math.min(1, shake * 2) : 0;
      // 공 기계
      c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(mach.x + mach.w / 2, mach.y + mach.h + 4, mach.w / 2 + 6, 6, 0, 0, TAU); c.fill();
      const bd = c.createLinearGradient(mach.x, 0, mach.x + mach.w, 0); bd.addColorStop(0, '#6d7787'); bd.addColorStop(1, '#3f4756');
      c.fillStyle = bd; c.beginPath(); c.roundRect(mach.x, mach.y + 20, mach.w, mach.h - 20, 8); c.fill(); c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = '#2b2f36'; c.beginPath(); c.roundRect(mach.x - 18, HY - 12, 30, 24, 6); c.fill();
      [0, 1, 2, 3].forEach((k) => baseball(c, mach.x + 16 + k * 20, mach.y + 12, 8));
      const spin = clock * 8; c.strokeStyle = '#c8ccd4'; c.lineWidth = 3; c.beginPath(); c.arc(mach.x + mach.w / 2, mach.y + 56, 14, spin, spin + 4); c.stroke();
      pill(c, mach.x + mach.w / 2, mach.y - 12, ph === 'fly' ? '20 m/s로 날아가는 중' : '공 기계 누르기', ph === 'fly' ? '#1f4fa0' : 'rgba(29,36,51,.85)', '#fff', '700 13px');
      // 손
      const hp = hx;
      const sq = ph === 'contact' ? 0.8 : 0;
      if (glove) gloveDraw(c, hp, HY, 1, sq, hurt); else bareHand(c, hp, HY, 1, hurt);
      // 공
      if (ph === 'fly') baseball(c, bx, HY);
      else if (ph === 'contact' || ph === 'held') baseball(c, hp + (glove ? -6 : 10), HY);
      // 뒤로 뺀 거리 자
      if (ph === 'contact' || ph === 'held') {
        const pull = ph === 'held' && cur ? cur.pull : Math.max(0, (hx0 - hp) / g.CM), h0 = hp + pull * g.CM;
        c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.moveTo(h0, HY + 70); c.lineTo(hp, HY + 70); c.stroke(); c.beginPath(); c.moveTo(h0, HY + 62); c.lineTo(h0, HY + 78); c.stroke();
        pill(c, (h0 + hp) / 2, HY + 98, `뒤로 뺀 거리 ${Math.round(pull)} cm`, '#1d2433', '#fff', '800 14px');
      }
      if (ph === 'contact') { pill(c, hp, HY - 82, drag && drag.hand ? '공과 함께 뒤로 끌기 → 놓으면 멈춤' : '손을 잡고 뒤로 끌면 같이 빠진다', '#c0321f', '#fff', '800 14px'); }
      if (ph === 'held' && cur) {
        // 서로 주고받는 충격량
        arrow(c, hp + 20, HY - 54, hp + 20 + 70, '#2f9e5b', 6); pill(c, hp + 24, HY - 74, `공이 받은 충격량 ${f1(cur.I)} N·s`, '#2f9e5b', '#fff', '700 12px', 'left');
        arrow(c, hp - 10, HY + 50, hp - 80, '#c0321f', 6); pill(c, hp - 14, HY + 40 + 34, `손도 같은 크기 ${f1(cur.I)} N·s`, '#c0321f', '#fff', '700 12px', 'right');
        if (cur.ouch && shake > 0) { c.save(); c.translate(hp + 40, HY - 120); c.rotate(-0.1); c.fillStyle = '#fff'; c.strokeStyle = '#c0321f'; c.lineWidth = 3; c.beginPath(); c.ellipse(0, 0, 66, 30, 0, 0, TAU); c.fill(); c.stroke(); P.txt(c, '아야!', 0, 10, '#c0321f', '900 30px'); c.restore(); }
      }
      if (ph === 'fly') pill(c, g.SW / 2, g.TOP + 24, '느린 화면 · 실제로는 0.1초 안에 도착', 'rgba(29,36,51,.8)', '#fff', '700 13px');
      // 맨손/글러브 그림 표지
      g.picks.forEach((p) => {
        const on = p.k === glove; c.fillStyle = on ? '#fff' : 'rgba(255,255,255,.6)'; c.beginPath(); c.roundRect(p.x, p.y, p.w, p.h, 10); c.fill(); c.strokeStyle = on ? '#1d2433' : 'rgba(29,36,51,.5)'; c.lineWidth = on ? 3 : 1.5; c.stroke();
        c.save(); c.beginPath(); c.roundRect(p.x + 4, p.y + 4, 50, p.h - 8, 6); c.clip(); if (p.k) gloveDraw(c, p.x + 48, p.y + p.h / 2, 0.36); else bareHand(c, p.x + 44, p.y + p.h / 2, 0.5); c.restore();
        P.txt(c, p.k ? '글러브' : '맨손', p.x + 86, p.y + p.h / 2 + 7, '#1d2433', on ? '800 17px' : '700 16px');
      });
      // 안내 손
      if (ph === 'ready' && !catches.length && !drag) { hand(c, mach.x + mach.w / 2, mach.y + mach.h - 10 - Math.abs(Math.sin(clock * 2.6)) * 14); }
      else if (ph === 'fly' && catches.length && !drag) { c.save(); c.setLineDash([6, 5]); c.lineDashOffset = -clock * 16; c.strokeStyle = '#ffd84d'; c.lineWidth = 3; c.beginPath(); c.ellipse(hx - 30, HY, 54, 64, 0, 0, TAU); c.stroke(); c.restore(); }
    }
    function drawKick(c, g) {
      bgKick(c, g);
      const { BX, FY, kx } = g, r0 = 18;
      if (fx == null) fx = restFoot(g);
      kicks.slice(0, 4).forEach((k, j) => { const x = BX + Math.min(XMAX, k.x) * kx; c.globalAlpha = j ? 0.45 : 1; c.fillStyle = '#fff'; c.strokeStyle = '#1d2433'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, FY + 8); c.lineTo(x - 7, FY - 4); c.lineTo(x + 7, FY - 4); c.closePath(); c.fill(); c.stroke(); c.globalAlpha = 1; });
      // 공
      let px = BX, py = FY - r0, rot = 0;
      const k0 = kicks[0], vx = k0 ? k0.v * Math.cos(ANG) : 0, vy = k0 ? k0.v * Math.sin(ANG) : 0, tf = k0 ? 2 * vy / G : 0;
      if (ph === 'kcontact') px = Math.max(BX, fx + 30 + r0 - 2);
      else if ((ph === 'kfly' || ph === 'kdone') && k0) { const tt = Math.min(ft, tf); px = BX + vx * tt * kx; py = FY - r0 - (vy * tt - 0.5 * G * tt * tt) * kx; rot = ft * 8; if (px > g.SW - 20) px = g.SW - 20; }
      if ((ph === 'kfly' || ph === 'kdone') && k0) { c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 2; c.setLineDash([5, 5]); c.beginPath(); for (let s = 0; s <= 30; s++) { const tt = Math.min(ft, tf) * s / 30, x = BX + vx * tt * kx, y = FY - r0 - (vy * tt - 0.5 * G * tt * tt) * kx; if (x > g.SW - 20) break; s ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.setLineDash([]); }
      if (ph === 'kdone' && k0) pill(c, Math.min(g.SW - 80, BX + Math.min(XMAX, k0.x) * kx), FY - 30, `${k0.x > XMAX ? XMAX + ' m 넘게' : f1(k0.x) + ' m'}`, '#1d2433', '#fff', '800 14px');
      c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(px, FY - 2, 16, 4, 0, 0, TAU); c.fill();
      soccer(c, px, py, r0, rot);
      leg(c, g, fx);
      // 서로 주고받는 충격량
      if (ph === 'kcontact' || (ph === 'kfly' && k0 && ft < 0.6)) {
        const Iv = ph === 'kcontact' ? F * kms / 1000 : k0.I, L = 18 + Iv * 6, ax = ph === 'kcontact' ? fx + 4 : BX;
        arrow(c, ax + 14, FY - 70, ax + 14 + L, '#2f9e5b', 6); pill(c, ax + 18, FY - 90, `발 → 공 ${f1(Iv)} N·s`, '#2f9e5b', '#fff', '700 12px', 'left');
        arrow(c, ax - 14, FY - 70, ax - 14 - L, '#c0321f', 6); pill(c, ax - 18, FY - 90, `공 → 발 ${f1(Iv)} N·s`, '#c0321f', '#fff', '700 12px', 'right');
      }
      if (ph === 'kcontact') pill(c, g.SW / 2, g.TOP + 28, `${F} N × ${f1(kms)} ms · 더 밀수록 오래`, '#c0321f', '#fff', '800 14px');
      else if (drag && drag.foot && ph === 'kready') pill(c, g.SW / 2, g.TOP + 28, wind > 6 ? `휘두르는 세기 ${force()} N` : '뒤로 당기자', '#c0321f', '#fff', '800 14px');
      if (ph === 'kready' && !drag && !kicks.length) { const bob = Math.abs(Math.sin(clock * 2.4)) * 14; hand(c, fx - 30 - bob, FY - 40, -Math.PI / 2); c.save(); c.setLineDash([6, 5]); c.lineDashOffset = -clock * 16; c.strokeStyle = '#ffd84d'; c.lineWidth = 3; c.beginPath(); c.arc(fx + 6, FY - 14, 30, 0, TAU); c.stroke(); c.restore(); }
    }

    function draw(c, W, H, dt) {
      if (!W) return;
      const g = geo(); clock += dt;
      const key = W + 'x' + H; if (key !== bgKey) { bg = paintBg(g); bgKey = key; }
      if (hx == null) hx = g.HX;
      step(g, dt);
      c.clearRect(0, 0, W, H); c.drawImage(bg, 0, 0, W, H);
      c.save(); if (shake > 0) c.translate(Math.sin(clock * 70) * 7 * shake, Math.cos(clock * 55) * 4 * shake);
      c.save(); c.beginPath(); c.rect(0, g.TOP, g.SW, H - g.TOP); c.clip();
      if (mode === 'catch') drawCatch(c, g); else drawKick(c, g);
      c.restore(); c.restore();
      tabs(c, g); graph(c, g);
    }

    // ── 움직임 ──
    const force = () => Math.max(FMIN, Math.min(FMAX, Math.round((FMIN + wind / 140 * (FMAX - FMIN)) / 100) * 100));
    function step(g, dt) {
      if (shake > 0) shake = Math.max(0, shake - dt * 1.2);
      if (show < 1) show = Math.min(1, show + dt * 1.4);
      if (mode === 'catch') {
        if (ph === 'fly') { bx -= dt * 260; const front = hx + (glove ? -6 : 10); if (bx <= front + 12) { ph = 'contact'; hx0 = hx; grace = 0; say('공이 손에 닿았다! 손을 잡고 <b>뒤로 끌면</b> 공과 함께 빠진다. 가만히 두면 그대로 멈춘다.'); } }
        else if (ph === 'contact') { grace += dt; if (!(drag && drag.hand) && grace > 0.7) finishCatch(g); }
        else if (ph === 'held') { if (!(drag && drag.hand)) hx += (g.HX - hx) * Math.min(1, dt * 1.5); }
        else if (ph === 'ready' && !(drag && drag.hand)) hx += (g.HX - hx) * Math.min(1, dt * 5);
      } else {
        if (ph === 'kready' && !(drag && drag.foot)) fx += (restFoot(g) - fx) * Math.min(1, dt * 8);
        if (ph === 'kfly') { ft += dt / 1.6; const k0 = kicks[0], tf = 2 * k0.v * Math.sin(ANG) / G; if (ft >= tf) { ft = tf; ph = 'kdone'; } if (!(drag && drag.foot)) fx += (restFoot(g) - fx) * Math.min(1, dt * 3); }
        if (ph === 'kdone' && !(drag && drag.foot)) fx += (restFoot(g) - fx) * Math.min(1, dt * 3);
      }
    }
    function launch(g) { if (mode !== 'catch' || ph === 'fly' || ph === 'contact') return; ph = 'fly'; bx = g.mach.x - 12; cur = null; say(`${glove ? '글러브' : '맨손'}으로 받는다. 공이 오면 손을 <b>그대로 둘지</b>, 잡고 <b>뒤로 끌지</b> 정하자.`); }
    function finishCatch(g) {
      const pull = Math.max(0, Math.min(PULLMAX, (hx0 - hx) / g.CM));
      cur = catchCalc(glove, Math.round(pull)); catches.unshift(cur); if (catches.length > 8) catches.pop(); ph = 'held'; show = 0;
      if (cur.ouch) { shake = 1; try { if (navigator.vibrate) navigator.vibrate([20, 30, 20]); } catch { /* 지원 안 함 */ } }
      const p2 = catches[1];
      let s = `${glove ? '글러브' : '맨손'} · ${cur.pull >= 1 ? `뒤로 <b>${cur.pull} cm</b> 빼며` : '<b>그대로 대고</b>'} 받았다: 멈추는 데 <b>${f1(cur.T)} ms</b> → 평균 힘 <b>${Math.round(cur.avg)} N</b>${cur.ouch ? ' — <b>아야!</b>' : ' — 아프지 않다.'} 충격량은 언제나 0.15 kg × 20 m/s = <b>3.0 N·s</b>.`;
      if (p2 && Math.abs(p2.T - cur.T) > 0.5) s += ` 시간이 ${f1(p2.T)} → ${f1(cur.T)} ms로 ${cur.T > p2.T ? '길어지자 힘이 ' + f1(cur.T / p2.T) + '분의 1로 줄었다' : '짧아지자 힘이 ' + f1(p2.T / cur.T) + '배로 커졌다'}.`;
      say(s); fill(); steps();
    }
    function startKick() { F = force(); cx0 = fx; kms = 0; ph = 'kcontact'; say(`발이 공에 닿았다! 평균 힘 <b>${F} N</b>. 계속 밀수록 오래 힘을 준다.`); }
    function finishKick() {
      const ms = Math.max(TMIN, Math.min(TMAX, Math.round(kms))); const k = kickCalc(F, ms); kicks.unshift(k); if (kicks.length > 8) kicks.pop(); ph = 'kfly'; ft = 0; show = 0;
      const p2 = kicks[1];
      let s = `충격량 = ${F} N × ${ms / 1000} s = <b>${f1(k.I)} N·s</b> → 공(0.43 kg) 속력 <b>${f1(k.v)} m/s</b>, 약 <b>${k.x > XMAX ? XMAX + ' m 넘게' : f1(k.x) + ' m'}</b>.`;
      if (p2 && p2.F === k.F && p2.T !== k.T) s += ` 같은 세기로 ${p2.T} → ${k.T} ms 밀자 충격량이 ${k.T > p2.T ? '커져 더 멀리' : '작아져 덜 멀리'} 갔다.`;
      else if (p2 && p2.T === k.T && p2.F !== k.F) s += ` 같은 시간에 힘이 ${p2.F} → ${k.F} N이면 충격량도 ${k.F > p2.F ? '커진다' : '작아진다'}.`;
      say(s); fill(); steps();
    }
    function setMode(m) {
      if (m === mode) return; mode = m; drag = null; shake = 0;
      if (m === 'catch') { ph = 'ready'; say('(가) 공 받기: <b>공 기계</b>를 누르자. 맨손·글러브 그림을 눌러 바꿀 수 있다.'); }
      else { ph = 'kready'; fx = null; say('(나) 공 차기: <b>발</b>을 잡아 뒤로 당겼다가 앞으로 끌어 공을 차자. 닿은 뒤 <b>더 밀수록</b> 오래 힘을 준다.'); }
      steps();
    }
    function setGlove(on) { if (ph === 'fly' || ph === 'contact') return; glove = on; ph = 'ready'; say(on ? '<b>두꺼운 글러브</b>를 꼈다. 완충재가 눌리는 만큼 멈추는 거리가 길다.' : '<b>맨손</b>으로 받는다.'); }
    function fill() {
      const c0 = catches[0], k0 = kicks[0];
      cell('c-now').innerHTML = c0 ? `3.0 N·s ÷ ${f1(c0.T)} ms<br>= <b>${Math.round(c0.avg)} N</b>` : '—';
      cell('k-now').innerHTML = k0 ? `${k0.F} N × ${k0.T} ms<br>= <b>${f1(k0.I)} N·s</b> → ${f1(Math.min(XMAX, k0.x))} m` : '—';
    }
    function steps() {
      const ok = [];
      if (catches.some((r) => r.pull < 3)) ok.push(1);
      if (catches.some((r) => r.pull >= 10)) ok.push(2);
      if (kicks.some((k) => k.T >= 8)) ok.push(3);
      const n = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, n, ok); window.L1.done(root, n === 0);
      chip.textContent = n === 1 ? '① 공 기계를 누르고 손을 그대로 대고 받기' : n === 2 ? '② 공이 닿을 때 손을 잡고 뒤로 끌며 받기' : n === 3 ? (mode === 'catch' ? '③ 위 (나) 공 차기 그림을 누르기' : '③ 공에 닿은 뒤 끝까지 밀어 차기') : '✓ 받을 땐 시간↑ 힘↓ · 찰 땐 큰 힘을 오래';
      chip.classList.toggle('done', n === 0);
    }

    const inR = (p, r) => p.x > r.x && p.x < r.x + r.w && p.y > r.y && p.y < r.y + r.h;
    const S = P.make(stage, {
      draw,
      down(p) {
        const g = geo();
        const t = g.tabs.find((r) => inR(p, r)); if (t) { setMode(t.k); return; }
        if (mode === 'catch') {
          const pk = g.picks.find((r) => inR(p, r)); if (pk) { setGlove(pk.k); return; }
          const m = g.mach; if (p.x > m.x - 20 && p.x < m.x + m.w + 6 && p.y > m.y - 30 && p.y < m.y + m.h) { launch(g); return; }
          if (ph === 'contact' || Math.abs(p.x - (hx - 40)) < 100 && Math.abs(p.y - g.HY) < 90) { drag = { hand: true, off: p.x - hx }; if (ph === 'held') ph = 'ready'; return; }
          if (ph === 'ready' || ph === 'held') say('오른쪽 <b>공 기계</b>를 눌러 공을 보내자.');
          return;
        }
        if (p.y > g.TOP && Math.abs(p.x - fx) < 60 && p.y > g.FY - 120 && ph !== 'kcontact') { if (ph === 'kfly' || ph === 'kdone') ph = 'kready'; drag = { foot: true, off: p.x - fx }; wind = 0; return; }
        say('<b>축구화</b>를 잡아 뒤로 당겼다가 앞으로 끌자.');
      },
      move(p) {
        if (!drag) return; const g = geo();
        if (drag.hand) { const nx = Math.max(g.HX - PULLMAX * g.CM, Math.min(g.HX + 10, p.x - drag.off)); if (ph === 'contact') { hx = Math.min(hx, nx); grace = 0; if (hx <= g.HX - PULLMAX * g.CM + 0.5) { drag = null; finishCatch(g); } } else hx = nx; return; }
        if (drag.foot) {
          const nx = Math.max(g.BX - 250, Math.min(g.BX + 64, p.x - drag.off));
          if (ph === 'kready') { fx = nx; wind = Math.max(wind, restFoot(g) - fx); if (fx + 30 >= g.BX - 16) startKick(); }
          else if (ph === 'kcontact') { fx = Math.max(fx, nx); kms = Math.max(0, (fx - cx0) / 9); if (kms >= TMAX) { kms = TMAX; drag = null; finishKick(); } }
        }
      },
      up() {
        const d = drag; drag = null; if (!d) return; const g = geo();
        if (d.hand && ph === 'contact') finishCatch(g);
        if (d.foot) { if (ph === 'kcontact') finishKick(); else if (wind > 6) say('공에 닿을 때까지 <b>앞으로</b> 끌어야 한다.'); }
      },
      key(e) {
        const g = geo();
        if (e.key === '1') { setMode('catch'); return true; }
        if (e.key === '2') { setMode('kick'); return true; }
        if (e.key === '0') { reset(); return true; }
        if (mode === 'catch') {
          if (e.key === 'g' || e.key === 'G') { setGlove(!glove); return true; }
          if (e.key === 'Enter' || e.key === ' ') { if (ph === 'contact') finishCatch(g); else launch(g); return true; }
          if (e.key === 'ArrowLeft' && ph === 'contact') { hx = Math.max(g.HX - PULLMAX * g.CM, hx - 5 * g.CM); grace = 0; return true; }
          return false;
        }
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { wind = Math.max(0, Math.min(140, wind + (e.key === 'ArrowUp' ? 14 : -14))); say(`휘두르는 세기 <b>${force()} N</b> · 미는 시간 <b>${kms || 6} ms</b>. 엔터로 찬다.`); return true; }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { kms = Math.max(TMIN, Math.min(TMAX, (kms || 6) + (e.key === 'ArrowRight' ? 1 : -1))); say(`휘두르는 세기 <b>${force()} N</b> · 미는 시간 <b>${kms} ms</b>. 엔터로 찬다.`); return true; }
        if (e.key === 'Enter' || e.key === ' ') { if (ph === 'kcontact') return true; const ms = kms || 6; ph = 'kready'; F = force(); kms = ms; finishKick(); return true; }
        return false;
      },
    });
    root.querySelector('.ct-reset').addEventListener('click', () => { reset(); S.kick(); });

    reset();
    root._ct = {
      mode: (m) => { setMode(m); S.redraw(); return root._ct.state(); },
      glove: (on) => { setGlove(on); S.redraw(); return root._ct.state(); },
      catchIt: (cm) => { const g = geo(); if (mode !== 'catch') setMode('catch'); hx = g.HX; hx0 = g.HX; ph = 'contact'; hx = g.HX - cm * g.CM; finishCatch(g); S.redraw(); return root._ct.state(); },
      kick: (f, ms) => { if (mode !== 'kick') setMode('kick'); wind = (f - FMIN) / (FMAX - FMIN) * 140; ph = 'kready'; F = force(); kms = ms; finishKick(); S.redraw(); return root._ct.state(); },
      state: () => ({ mode, glove, ph, hx: hx == null ? null : Math.round(hx), fx: fx == null ? null : Math.round(fx), catches: catches.map((r) => [r.glove, r.pull, +r.T.toFixed(1), Math.round(r.avg), r.ouch]), kicks: kicks.map((k) => [k.F, k.T, +k.I.toFixed(2), +k.x.toFixed(1)]), done: root.classList.contains('u-done'), out: out.textContent, chip: chip.textContent }),
      geo: () => { const g = geo(); return { W: g.W, H: g.H, HX: g.HX, HY: g.HY, CM: g.CM, mach: g.mach, tabs: g.tabs, picks: g.picks, BX: g.BX, FY: g.FY, fx, hx }; },
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Catch = { mount };
})();
