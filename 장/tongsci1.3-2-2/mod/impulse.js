/* 3-2 3차시 체험 «공을 멀리 보내려면»(교과서 134쪽 그림 Ⅲ-25 · 측주 충격량의 크기 + 참고서 충격량을 크게 하는 방법 · 빨대 면봉 탐구 · 두 물체가 받는 충격량).
   위 칸(라켓): 라켓을 잡아 뒤로 당겼다(당긴 만큼 = 휘두르는 세기 = 평균 힘 100~600 N) 앞으로 끌면 공에 닿는 순간부터 공이 라켓 면에 붙어 함께 밀린다.
     공을 붙인 채 더 끌수록 접촉 시간이 길다(1~8 ms). 손을 떼면 힘–시간 그래프가 완성되고 넓이(충격량 = 평균 힘 × 시간)만큼 공의 운동량이 바뀐다.
     공은 높이 1 m에서 수평으로 나가 날아간 거리가 바닥 눈금에 남는다. 공 기계를 누르면 20 m/s로 날아오는 공을 받아친다(운동량 변화 = 나중 − 처음).
     맞는 동안 라켓 → 공, 공 → 라켓 충격량 화살표(크기 같고 방향 반대).
   아래 칸(빨대): 빨대 끝을 끌어 길이(10~30 cm)를 바꾸고, 면봉을 입구·출구 쪽으로 끌어 놓고, 입을 길게 누를수록 세게 분다(놓으면 발사).
     면봉이 빨대 안에서 힘을 받는 거리가 길수록 시간이 길어져 충격량이 크다 → 더 멀리.
   ① 세기를 바꿔 쳐 본다 ② 접촉 시간을 늘려 쳐 본다 ③ 빨대로 면봉을 날려 본다(힘을 받는 길이가 다른 두 번).
   공 60 g · 힘·시간 범위 · 면봉 0.3 g · 부는 힘은 이해를 돕기 위한 예. 공기 저항은 없다고 본다. 화면은 느린 화면.
   Impulse.mount(root) → { fit, setActive } · 시험용: root._ip.hit(F, ms) · machine(on) · blow(cm, 'in'|'out', 세기 0~1) · state() · geo() */
(function () {
  'use strict';
  const TAU = Math.PI * 2, G = 9.8, M = 0.06, VIN = -20, H1 = 1, XMAX = 40, FMIN = 100, FMAX = 600, TMAX = 8;
  const SM = 0.0003, SH = 0.8, LMIN = 10, LMAX = 30, SW = 4; // 면봉 질량 kg, 책상 높이 m, 빨대 길이 cm, 면봉 길이 cm
  const tFly = Math.sqrt(2 * H1 / G), tTab = Math.sqrt(2 * SH / G);
  const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1), f2 = (x) => (Math.round(x * 100) / 100).toFixed(2);
  const sForce = (s) => 0.02 + 0.06 * s; // 부는 세기 → 면봉이 받는 힘(N)
  const straw = (L, at, s) => { const d = Math.max(0.01, (at === 'in' ? L - SW - 1 : 2) / 100), F = sForce(s), a = F / SM, t = Math.sqrt(2 * d / a), v = a * t; return { d, F, t, I: F * t, v, x: v * tTab }; };
  // 자체 확인: 날아오는 20 m/s 공을 600 N × 7 ms로 쳐 내면 4.2 N·s → 반대로 50 m/s · 긴 빨대 입구가 짧은 빨대보다 멀리 · 출구에 넣으면 덜 멀리
  console.assert(f1(600 * 0.007) === '4.2' && f1(VIN + 4.2 / M) === '50.0' && straw(30, 'in', 0.5).x > straw(10, 'in', 0.5).x && straw(30, 'out', 0.5).x < straw(30, 'in', 0.5).x, 'impulse: 충격량');

  function mount(root) {
    const stage = root.querySelector('.ip-stage'), chip = root.querySelector('.ip-now'), out = root.querySelector('.ip-out'), tab = root.querySelector('.ip-tab tbody');
    const P = window.Play;
    let ph, rx, wind, F, cx0, dms, vi, vf, I, ft, mach, inT, drag, hits, last, clock, msg, sl, sat, sblow, sph, sx, st, sshots, sel, bg = null, bgKey = '';

    function reset() {
      ph = 'ready'; rx = null; wind = 0; F = 0; cx0 = 0; dms = 0; vi = 0; vf = 0; I = 0; ft = 0; mach = false; inT = 1; drag = null; hits = []; last = null; clock = 0; msg = '';
      sl = 20; sat = 'in'; sblow = -1; sph = 'idle'; sx = 0; st = 0; sshots = []; sel = 0;
      say('위: <b>라켓</b>을 잡아 뒤로 당겼다가 앞으로 끌어 공을 치자. 공에 닿은 뒤 <b>더 끌수록</b> 오래 밀어 준다.');
      table(); steps();
    }
    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };

    // ── 자리 잡기 ──
    const geo = () => {
      const W = S.W, H = S.H, TOP = Math.round(H * 0.58), GY = TOP - 34, HX = 250, HY = GY - 150, R0 = HX - 64;
      const kx = (W - 28 - HX) / XMAX, ky = (GY - HY) / H1;
      const SY = TOP + 104, SX0 = 120, CM = 9, FL = H - 26;
      return { W, H, TOP, GY, HX, HY, R0, kx, ky, SY, SX0, CM, FL, sk: (W - 30 - (SX0 + LMAX * CM)) / 6,
        graph: { x: W - 330, y: 58, w: 312, h: 176 }, mach: { x: W - 92, y: GY - 74, w: 78, h: 74 }, sg: { x: 16, y: SY + 46, w: 330, h: H - SY - 58 } };
    };
    const rest = (g) => g.R0;
    const faceX = (x) => x + 13;

    // ── 그림 도구 ──
    function ball(c, x, y, r = 11) {
      const g = c.createRadialGradient(x - r * 0.4, y - r * 0.4, 1, x, y, r); g.addColorStop(0, '#fbffb0'); g.addColorStop(0.55, '#d7ec2a'); g.addColorStop(1, '#8a9a0e');
      c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 1.6; c.beginPath(); c.arc(x - r * 1.05, y, r * 0.8, -0.9, 0.9); c.stroke(); c.beginPath(); c.arc(x + r * 1.05, y, r * 0.8, Math.PI - 0.9, Math.PI + 0.9); c.stroke();
    }
    function racket(c, x, y, squash) {
      // 손잡이
      c.save(); c.lineCap = 'round';
      c.strokeStyle = '#2b2f36'; c.lineWidth = 9; c.beginPath(); c.moveTo(x - 4, y + 54); c.lineTo(x - 30, y + 118); c.stroke();
      c.strokeStyle = '#d23a2a'; c.lineWidth = 13; c.beginPath(); c.moveTo(x - 24, y + 104); c.lineTo(x - 40, y + 142); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2; for (let k = 0; k < 5; k++) { const t = k / 5; c.beginPath(); c.moveTo(x - 30 - t * 16, y + 106 + t * 36); c.lineTo(x - 22 - t * 16, y + 108 + t * 36); c.stroke(); }
      // 손
      c.fillStyle = '#f1c7a0'; c.strokeStyle = '#a8764e'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(x - 33, y + 126, 13, 17, 0.4, 0, TAU); c.fill(); c.stroke();
      // 머리(옆에서 비스듬히 본 테 + 줄)
      const rx = 13 - squash * 3;
      c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.ellipse(x, y, rx, 54, 0, 0, TAU); c.fill();
      c.save(); c.beginPath(); c.ellipse(x, y, rx, 54, 0, 0, TAU); c.clip(); c.strokeStyle = 'rgba(240,240,240,.8)'; c.lineWidth = 1;
      for (let k = -50; k <= 50; k += 8) { c.beginPath(); c.moveTo(x - rx, y + k); c.lineTo(x + rx, y + k); c.stroke(); }
      for (let k = -rx; k <= rx; k += 5) { c.beginPath(); c.moveTo(x + k, y - 54); c.lineTo(x + k + squash * 6, y + 54); c.stroke(); }
      c.restore();
      c.strokeStyle = '#1f3f8a'; c.lineWidth = 6; c.beginPath(); c.ellipse(x, y, rx, 54, 0, 0, TAU); c.stroke();
      c.strokeStyle = '#7fa6ff'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(x - 1, y, rx - 1, 52, 0, Math.PI * 0.6, Math.PI * 1.3); c.stroke();
      c.restore();
    }
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

    function paintBg(g) {
      const { W, H, TOP, GY, HX, kx, SY, SX0, FL } = g;
      const k2 = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const cv = document.createElement('canvas'); cv.width = W * k2; cv.height = H * k2;
      const c = cv.getContext('2d'); c.setTransform(k2, 0, 0, k2, 0, 0);
      // 위 칸: 하늘 + 연습장 잔디
      const sky = c.createLinearGradient(0, 0, 0, GY); sky.addColorStop(0, '#79bfe9'); sky.addColorStop(1, '#d8eefb'); c.fillStyle = sky; c.fillRect(0, 0, W, GY);
      [[0.36, 0.2, 40], [0.62, 0.12, 30]].forEach(([x, y, r]) => { c.fillStyle = 'rgba(255,255,255,.85)'; [0, 1, 2].forEach((j) => { c.beginPath(); c.arc(W * x + j * r * 0.8, GY * y + (j === 1 ? -r * 0.3 : 0), r * 0.6, 0, TAU); c.fill(); }); });
      c.fillStyle = '#9cc58a'; c.beginPath(); c.moveTo(0, GY); for (let x = 0; x <= W; x += 20) c.lineTo(x, GY - 30 - 16 * Math.sin(x / 120) - 8 * Math.sin(x / 41)); c.lineTo(W, GY); c.fill();
      const gr = c.createLinearGradient(0, GY, 0, TOP); gr.addColorStop(0, '#4f9a45'); gr.addColorStop(1, '#2f6e2c'); c.fillStyle = gr; c.fillRect(0, GY, W, TOP - GY);
      for (let x = 0; x < W; x += 60) { c.fillStyle = 'rgba(255,255,255,.05)'; c.fillRect(x, GY, 30, TOP - GY); }
      // 거리 눈금
      c.fillStyle = 'rgba(255,255,255,.92)'; c.fillRect(HX - 4, GY + 2, XMAX * kx + 8, 8);
      c.strokeStyle = '#1d2433'; c.lineWidth = 1.2;
      for (let m = 0; m <= XMAX; m += 5) { const x = HX + m * kx; c.beginPath(); c.moveTo(x, GY + 2); c.lineTo(x, GY + (m % 10 ? 8 : 13)); c.stroke(); if (m % 10 === 0) P.txt(c, String(m), x, GY + 28, '#fbfcf9', '700 14px'); }
      P.txt(c, '날아간 거리(m)', HX - 14, GY + 28, '#fbfcf9', '700 13px', 'right');
      // 높이 1 m 표시
      c.strokeStyle = 'rgba(255,255,255,.8)'; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(HX + 28, g.HY); c.lineTo(HX + 28, GY); c.stroke(); c.setLineDash([]);
      P.txt(c, '1 m', HX + 34, (g.HY + GY) / 2 + 30, '#fbfcf9', '700 13px', 'left');
      // 아래 칸: 교실 벽 + 책상
      const wl = c.createLinearGradient(0, TOP, 0, H); wl.addColorStop(0, '#f3ead8'); wl.addColorStop(1, '#e6d9bd'); c.fillStyle = wl; c.fillRect(0, TOP, W, H - TOP);
      c.fillStyle = '#1d2433'; c.fillRect(0, TOP - 2, W, 4);
      const tb = c.createLinearGradient(0, SY + 14, 0, SY + 34); tb.addColorStop(0, '#b98549'); tb.addColorStop(1, '#7a5228'); c.fillStyle = tb; c.fillRect(0, SY + 16, SX0 + LMAX * g.CM + 30, 16);
      c.fillStyle = '#5e3e1c'; c.fillRect(SX0 + LMAX * g.CM + 6, SY + 32, 12, FL - SY - 32);
      c.fillStyle = '#9b9488'; c.fillRect(0, FL, W, H - FL); c.fillStyle = '#7e776b'; c.fillRect(0, FL, W, 3);
      const fx0 = SX0 + LMAX * g.CM + 30;
      for (let m = 0; m <= 6; m++) { const x = fx0 + m * g.sk; c.fillStyle = '#1d2433'; c.fillRect(x - 1, FL, 2, 9); P.txt(c, `${m}`, x, FL + 22, '#1d2433', '700 13px'); }
      P.txt(c, 'm', fx0 + 6 * g.sk + 14, FL + 22, '#1d2433', '700 13px', 'left');
      P.txt(c, '빨대로 면봉 날리기', W - 16, TOP + 24, '#1d2433', '800 17px', 'right');
      return cv;
    }

    // 힘–시간 그래프(위)
    function graph(c, g) {
      const B = g.graph, x0 = B.x + 46, y0 = B.y + B.h - 30, w = B.w - 62, h = B.h - 58, sx = w / 10, sy = h / 800;
      c.fillStyle = 'rgba(255,255,255,.95)'; c.beginPath(); c.roundRect(B.x, B.y, B.w, B.h, 10); c.fill(); c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.stroke();
      P.txt(c, '힘–시간 그래프', B.x + 12, B.y + 20, '#1d2433', '800 15px', 'left');
      c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0, y0 - h - 4); c.lineTo(x0, y0); c.lineTo(x0 + w + 4, y0); c.stroke();
      for (let n = 200; n <= 800; n += 200) { c.strokeStyle = 'rgba(29,36,51,.12)'; c.beginPath(); c.moveTo(x0, y0 - n * sy); c.lineTo(x0 + w, y0 - n * sy); c.stroke(); P.txt(c, String(n), x0 - 4, y0 - n * sy + 4, '#59607a', '600 11px', 'right'); }
      for (let n = 2; n <= 10; n += 2) P.txt(c, String(n), x0 + n * sx, y0 + 14, '#59607a', '600 11px');
      P.txt(c, '힘(N)', x0 + 6, y0 - h + 6, '#59607a', '700 12px', 'left'); P.txt(c, '시간(ms)', x0 + w, y0 + 26, '#59607a', '700 12px', 'right');
      const shape = (Fv, T, upto) => { c.beginPath(); c.moveTo(x0, y0); const n = 40; for (let k = 0; k <= n; k++) { const t = T * k / n; if (t > upto) break; const u = 2 * t / T - 1; c.lineTo(x0 + t * sx, y0 - Fv * 1.25 * (1 - u ** 4) * sy); } c.lineTo(x0 + Math.min(T, upto) * sx, y0); c.closePath(); };
      if (last && last !== 'live') {
        const L = last; shape(L.F, L.ms, 99); c.fillStyle = 'rgba(232,72,58,.28)'; c.fill(); c.strokeStyle = '#c0321f'; c.lineWidth = 2.5; c.stroke();
        c.save(); c.setLineDash([6, 4]); c.strokeStyle = '#1f4fa0'; c.lineWidth = 2; c.strokeRect(x0, y0 - L.F * sy, L.ms * sx, L.F * sy); c.restore();
        P.txt(c, `평균 힘 ${L.F} N`, x0 + L.ms * sx + 6, y0 - L.F * sy + 4, '#1f4fa0', '700 12px', 'left');
        if (L.ms * sx > 130) P.txt(c, `넓이 = 충격량 ${f1(L.I)} N·s`, x0 + L.ms * sx / 2, y0 - L.F * sy * 0.45, '#7a1a10', '800 13px'); else P.txt(c, `넓이 = 충격량 ${f1(L.I)} N·s`, x0 + L.ms * sx + 8, y0 - 14, '#7a1a10', '800 13px', 'left');
      }
      if (ph === 'contact') { c.fillStyle = 'rgba(232,72,58,.35)'; c.fillRect(x0, y0 - F * sy, dms * sx, F * sy); c.strokeStyle = '#c0321f'; c.lineWidth = 2; c.strokeRect(x0, y0 - F * sy, dms * sx, F * sy); P.txt(c, `${F} N × ${f1(dms)} ms`, x0 + 8, y0 - F * sy - 6, '#7a1a10', '800 13px', 'left'); }
      else if (!last && drag && wind > 6) { const Fp = force(); c.save(); c.setLineDash([5, 4]); c.strokeStyle = '#c0321f'; c.beginPath(); c.moveTo(x0, y0 - Fp * sy); c.lineTo(x0 + w, y0 - Fp * sy); c.stroke(); c.restore(); P.txt(c, `세기 ${Fp} N`, x0 + w, y0 - Fp * sy - 6, '#c0321f', '700 12px', 'right'); }
    }
    function machine(c, g) {
      const m = g.mach, on = mach;
      c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(m.x + m.w / 2, g.GY + 4, m.w / 2 + 6, 6, 0, 0, TAU); c.fill();
      const bd = c.createLinearGradient(m.x, 0, m.x + m.w, 0); bd.addColorStop(0, on ? '#2f6fd0' : '#6d7787'); bd.addColorStop(1, on ? '#163f86' : '#3f4756');
      c.fillStyle = bd; c.beginPath(); c.roundRect(m.x, m.y + 20, m.w, m.h - 20, 8); c.fill(); c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = '#2b2f36'; c.beginPath(); c.moveTo(m.x + 10, m.y + 22); c.lineTo(m.x + m.w - 10, m.y + 22); c.lineTo(m.x + m.w - 2, m.y); c.lineTo(m.x + 2, m.y); c.closePath(); c.fill();
      [0, 1, 2, 3].forEach((k) => ball(c, m.x + 14 + k * 16, m.y + 2, 7));
      c.fillStyle = '#111'; c.beginPath(); c.arc(m.x + 6, m.y + 46, 9, 0, TAU); c.fill();
      c.fillStyle = on ? '#7dff9a' : '#ff6b5a'; c.beginPath(); c.arc(m.x + m.w - 14, m.y + 34, 5, 0, TAU); c.fill();
      pill(c, m.x + m.w / 2, m.y - 16, on ? '공 기계 켜짐' : '공 기계 누르기', on ? '#1f4fa0' : 'rgba(29,36,51,.8)', '#fff', '700 13px');
    }

    function draw(c, W, H, dt) {
      if (!W) return;
      const g = geo(); clock += dt;
      const key = W + 'x' + H; if (key !== bgKey) { bg = paintBg(g); bgKey = key; }
      c.clearRect(0, 0, W, H); c.drawImage(bg, 0, 0, W, H);
      if (rx == null) rx = rest(g);
      step(g, dt);
      const { HX, HY, GY, kx, ky } = g;
      graph(c, g); machine(c, g);
      // 공
      let bxp = HX, byp = HY;
      if (ph === 'ready' && mach && inT < 1) { bxp = HX + (g.mach.x - HX) * (1 - inT); byp = HY + (g.mach.y + 46 - HY) * (1 - inT) * (1 - inT); }
      else if (ph === 'contact') bxp = faceX(rx) + 11;
      else if (ph === 'fly' || ph === 'done') { const tt = Math.min(ft, tFly); bxp = HX + vf * tt * kx; byp = HY + 0.5 * G * tt * tt * ky; if (ph === 'done') byp = GY - 11; }
      // 지난 착지점
      hits.slice(0, 4).forEach((h, j) => { if (h.d <= 0) return; const x = HX + Math.min(XMAX, h.d) * kx; c.globalAlpha = j ? 0.45 : 1; c.fillStyle = '#d7ec2a'; c.strokeStyle = '#1d2433'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, GY + 2); c.lineTo(x - 7, GY - 10); c.lineTo(x + 7, GY - 10); c.closePath(); c.fill(); c.stroke(); c.globalAlpha = 1; });
      if (ph === 'fly' || ph === 'done') { c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 2; c.setLineDash([5, 5]); c.beginPath(); for (let s = 0; s <= 30; s++) { const tt = Math.min(ft, tFly) * s / 30, x = HX + vf * tt * kx, y = HY + 0.5 * G * tt * tt * ky; s ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); c.setLineDash([]); }
      if (ph === 'done' && hits[0] && hits[0].d > 0) pill(c, Math.min(W - 70, HX + Math.min(XMAX, hits[0].d) * kx), GY - 26, `${hits[0].d > XMAX ? XMAX + ' m 넘게' : f1(hits[0].d) + ' m'} · ${f1(vf)} m/s`, '#1d2433', '#fff', '800 14px');
      // 날아오는 공 표시
      if (ph === 'ready' && mach) { if (inT >= 1) { arrow(c, HX + 70, HY - 30, HX + 14, '#1f4fa0', 6); pill(c, HX + 72, HY - 52, '날아오는 공 20 m/s (느린 화면 멈춤)', 'rgba(31,79,160,.92)', '#fff', '700 13px', 'left'); } }
      // 라켓 + 공
      const sq = ph === 'contact' ? Math.min(1, dms / 3) : 0;
      ball(c, bxp, byp);
      racket(c, rx, HY, sq);
      // 서로 주고받는 충격량(맞는 동안·맞은 뒤)
      if (ph === 'contact' || ((ph === 'fly' || ph === 'done') && last && last !== 'live')) {
        const Iv = ph === 'contact' ? F * dms / 1000 : last.I, L = 22 + Iv * 26, ax = ph === 'contact' ? faceX(rx) : HX;
        arrow(c, ax + 6, HY - 76, ax + 6 + L, '#2f9e5b', 7); pill(c, ax + 10, HY - 98, `라켓 → 공 ${f1(Iv)} N·s`, '#2f9e5b', '#fff', '700 13px', 'left');
        arrow(c, ax - 6, HY - 76, ax - 6 - L, '#c0321f', 7); pill(c, ax - 10, HY - 98, `공 → 라켓 ${f1(Iv)} N·s`, '#c0321f', '#fff', '700 13px', 'right');
        pill(c, ax, HY - 128, '서로 주고받는 충격량: 크기 같고 방향 반대', 'rgba(29,36,51,.85)', '#fff', '700 13px');
      }
      // 안내
      if (ph === 'ready' && !drag && !hits.length) { const bob = Math.abs(Math.sin(clock * 2.4)) * 14; hand(c, rx - 40 - bob, HY - 20, 0); c.save(); c.setLineDash([6, 5]); c.lineDashOffset = -clock * 16; c.strokeStyle = '#ffd84d'; c.lineWidth = 3; c.beginPath(); c.ellipse(rx, HY, 24, 64, 0, 0, TAU); c.stroke(); c.restore(); }
      if (drag && ph === 'ready') { const Fp = force(); pill(c, rx, HY - 76, wind > 6 ? `휘두르는 세기 ${Fp} N` : '뒤로 당기자', '#c0321f', '#fff', '800 14px'); }
      // 아래 칸: 빨대
      strawDraw(c, g);
    }
    function hand(c, x, y, rot) {
      c.save(); c.translate(x, y); c.rotate(rot + Math.PI / 2); c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 5;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(14, 18); c.lineTo(5, 18); c.lineTo(5, 36); c.lineTo(-5, 36); c.lineTo(-5, 18); c.lineTo(-14, 18); c.closePath();
      c.fillStyle = '#ffd84d'; c.fill(); c.shadowBlur = 0; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.stroke(); c.restore();
    }
    function swab(c, x, y) { // x = 면봉 왼쪽 끝(솜), 길이 SW cm
      const L = SW * 9; c.fillStyle = '#f4f1ea'; c.fillRect(x + 6, y - 2, L - 6, 4);
      const g2 = c.createRadialGradient(x + 4, y - 2, 1, x + 5, y, 8); g2.addColorStop(0, '#ffffff'); g2.addColorStop(1, '#d9d4c8'); c.fillStyle = g2; c.beginPath(); c.ellipse(x + 5, y, 7, 5, 0, 0, TAU); c.fill();
    }
    const swabX = (g) => sat === 'in' ? g.SX0 + 6 : g.SX0 + (sl - SW - 0.5) * g.CM;
    function strawDraw(c, g) {
      const { SY, SX0, CM, FL, sk } = g, ex = SX0 + sl * CM, fx0 = SX0 + LMAX * CM + 30;
      // 입(옆얼굴)
      c.fillStyle = '#f1c7a0'; c.strokeStyle = '#a8764e'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(18, SY - 70); c.quadraticCurveTo(90, SY - 74, 92, SY - 28); c.lineTo(104, SY - 14); c.lineTo(94, SY - 6); c.quadraticCurveTo(100, SY + 4, 94, SY + 10); c.quadraticCurveTo(90, SY + 40, 50, SY + 44); c.lineTo(18, SY + 44); c.closePath(); c.fill(); c.stroke();
      const puff = sblow >= 0 ? sblow : 0; c.fillStyle = '#c4544a'; c.beginPath(); c.ellipse(101, SY, 6 + puff * 2, 5, 0, 0, TAU); c.fill();
      c.fillStyle = '#3a2a1d'; c.beginPath(); c.arc(66, SY - 40, 3.2, 0, TAU); c.fill();
      if (sblow >= 0) { c.fillStyle = `rgba(241,199,160,${0.5 + puff * 0.5})`; c.beginPath(); c.ellipse(82, SY + 6, 10 + puff * 8, 8 + puff * 5, 0, 0, TAU); c.fill(); }
      // 세기 막대
      c.fillStyle = 'rgba(29,36,51,.15)'; c.fillRect(20, SY - 94, 90, 12); c.fillStyle = '#e8483a'; c.fillRect(20, SY - 94, 90 * Math.max(0, sblow), 12); c.strokeStyle = '#1d2433'; c.lineWidth = 1.2; c.strokeRect(20, SY - 94, 90, 12);
      P.txt(c, sblow >= 0 ? `부는 세기 ${Math.round(sblow * 100)}%` : '← 입을 길게 누르기', 118, SY - 84, '#1d2433', '700 14px', 'left');
      // 빨대(반투명 관)
      const sg = c.createLinearGradient(0, SY - 8, 0, SY + 8); sg.addColorStop(0, 'rgba(120,190,255,.55)'); sg.addColorStop(0.5, 'rgba(230,245,255,.35)'); sg.addColorStop(1, 'rgba(60,130,210,.6)');
      if (sph === 'idle' || sph === 'blow') swab(c, swabX(g), SY); // 면봉(빨대 안)
      else if (sph === 'push') swab(c, swabX(g) + st, SY);
      c.fillStyle = sg; c.fillRect(SX0, SY - 8, ex - SX0, 16); c.strokeStyle = 'rgba(30,90,160,.8)'; c.lineWidth = 1.5; c.strokeRect(SX0, SY - 8, ex - SX0, 16);
      for (let x = SX0 + 18; x < SX0 + 40; x += 4) { c.strokeStyle = 'rgba(30,90,160,.45)'; c.beginPath(); c.moveTo(x, SY - 8); c.lineTo(x, SY + 8); c.stroke(); }
      // 입구·출구 표시 · 길이 손잡이
      P.txt(c, '입구', SX0 + 14, SY + 26, '#1d2433', '700 13px'); P.txt(c, '출구', ex - 12, SY + 26, '#1d2433', '700 13px');
      c.fillStyle = '#ffd84d'; c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; c.beginPath(); c.roundRect(ex - 3, SY - 18, 10, 36, 4); c.fill(); c.stroke();
      pill(c, ex + 2, SY - 30, `${sl} cm`, '#1d2433', '#fff', '800 13px');
      // 날아가는 면봉과 착지점
      sshots.slice(0, 3).forEach((s, j) => { const x = fx0 + Math.min(6, s.x) * sk; c.globalAlpha = j ? 0.4 : 1; c.fillStyle = s.at === 'in' ? '#2f9e5b' : '#e8b923'; c.beginPath(); c.moveTo(x, FL - 1); c.lineTo(x - 6, FL - 12); c.lineTo(x + 6, FL - 12); c.closePath(); c.fill(); c.globalAlpha = 1; });
      if (sph === 'fly' || sph === 'done') {
        const s = sshots[0], tt = Math.min(st, tTab), x = ex + s.v * tt * sk, y = SY + (FL - 4 - SY) * (tt / tTab) ** 2;
        swab(c, x - SW * 4.5, Math.min(FL - 4, y));
        if (sph === 'done') pill(c, Math.min(g.W - 70, fx0 + Math.min(6, s.x) * sk), FL - 24, `${f1(s.x)} m`, '#1d2433', '#fff', '800 14px');
      }
      if (sph === 'idle' && !sshots.length) { c.save(); c.setLineDash([6, 5]); c.lineDashOffset = -clock * 16; c.strokeStyle = '#e8483a'; c.lineWidth = 3; c.beginPath(); c.arc(98, SY, 22 + Math.sin(clock * 3) * 2, 0, TAU); c.stroke(); c.restore(); }
      // 빨대 그래프(받은 힘 × 시간)
      const B = g.sg; c.fillStyle = 'rgba(255,255,255,.95)'; c.beginPath(); c.roundRect(B.x, B.y, B.w, B.h, 8); c.fill(); c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; c.stroke();
      const x0 = B.x + 32, y0 = B.y + B.h - 14, w = B.w - 46, h = B.h - 38, tx = w / 0.12, fy = h / 0.085;
      c.beginPath(); c.moveTo(x0, y0 - h); c.lineTo(x0, y0); c.lineTo(x0 + w, y0); c.stroke();
      P.txt(c, '면봉이 받은 힘', x0 + 4, B.y + 16, '#1d2433', '700 12px', 'left'); P.txt(c, '시간 →', x0 + w, y0 - 4, '#59607a', '700 11px', 'right');
      sshots.slice(0, 2).reverse().forEach((s, j, a) => { const top = j === a.length - 1; c.fillStyle = top ? 'rgba(47,158,91,.4)' : 'rgba(120,120,120,.22)'; c.strokeStyle = top ? '#1f7a2a' : '#888'; c.lineWidth = 2; c.fillRect(x0, y0 - s.F * fy, Math.min(w, s.t * tx), s.F * fy); c.strokeRect(x0, y0 - s.F * fy, Math.min(w, s.t * tx), s.F * fy); P.txt(c, top ? '이번' : '지난번', x0 + Math.min(w, s.t * tx) - 4, y0 - s.F * fy + 14, top ? '#1f7a2a' : '#666', '700 11px', 'right'); });
    }

    // ── 움직임 ──
    const force = () => Math.max(FMIN, Math.min(FMAX, Math.round((FMIN + wind / 120 * (FMAX - FMIN)) / 50) * 50));
    function step(g, dt) {
      if (ph === 'ready') { if (mach && inT < 1) inT = Math.min(1, inT + dt * 1.4); if (!drag) rx += (rest(g) - rx) * Math.min(1, dt * 8); }
      if (ph === 'fly') { ft += dt / 3; if (ft >= tFly || vf <= 0 && ft > 0.6) { ph = 'done'; ft = tFly; } if (!drag) rx += (rest(g) - rx) * Math.min(1, dt * 3); }
      if (ph === 'done') { ft += dt; rx += (rest(g) - rx) * Math.min(1, dt * 3); }
      if (sblow >= 0 && sph === 'blow') sblow = Math.min(1, sblow + dt / 1.2);
      if (sph === 'push') { const s = sshots[0]; st += dt * (g.CM * s.d * 100) / Math.max(0.25, s.t * 8); if (st >= s.d * 100 * g.CM) { sph = 'fly'; st = 0; } }
      else if (sph === 'fly') { st += dt / 3; if (st >= tTab) { sph = 'done'; st = tTab; } }
    }
    function startContact(g) { F = force(); cx0 = rx; dms = 0; ph = 'contact'; vi = mach && inT >= 1 ? VIN : 0; last = 'live'; say(`공이 라켓 면에 붙었다! 평균 힘 <b>${F} N</b>. 계속 끌수록 오래 밀어 준다.`); }
    function finish() {
      const ms = Math.max(1, Math.min(TMAX, Math.round(dms))); I = F * ms / 1000; vf = vi + I / M; ft = 0; ph = 'fly';
      const d = vf > 0 ? vf * tFly : 0, h = { F, ms, I, vi, vf, d }; hits.unshift(h); if (hits.length > 8) hits.pop(); last = h;
      const pi = M * vi, pf = M * vf;
      let s = `충격량 = 평균 힘 × 시간 = ${F} N × ${ms / 1000} s = <b>${f1(I)} N·s</b>. `;
      if (vi) s += `운동량의 변화량 = 나중 − 처음 = ${f2(pf)} − (${f2(pi)}) = <b>${f1(I)} kg·m/s</b>. ` + (vf > 0 ? `방향이 바뀌어 <b>${f1(vf)} m/s</b>로 되돌아간다.` : `충격량이 작아 공이 ${f1(-vf)} m/s로 계속 밀려 들어온다.`);
      else s += `정지한 공의 운동량 0 → <b>${f1(pf)} kg·m/s</b>, 속도 ${f1(vf)} m/s(질량 0.06 kg)로 ${d > XMAX ? XMAX + ' m 넘게' : f1(d) + ' m'} 날아간다.`;
      const p2 = hits[1];
      if (p2 && p2.ms === ms && p2.F !== F) s += ` 같은 시간, 힘이 ${p2.F} → ${F} N이면 충격량도 커진다.`;
      else if (p2 && p2.F === F && p2.ms !== ms) s += ` 같은 힘으로 ${p2.ms} → ${ms} ms 밀면 넓이(충격량)가 ${ms > p2.ms ? '커진다' : '작아진다'}.`;
      say(s); table(); steps();
      try { if (navigator.vibrate) navigator.vibrate(15); } catch { /* 지원 안 함 */ }
    }
    function again() { if (ph === 'done' || ph === 'fly') { ph = 'ready'; inT = mach ? 0 : 1; } }
    function setMach(on) { if (ph === 'contact') return; mach = on; again(); if (ph === 'ready') inT = on ? 0 : 1; say(on ? '공 기계가 <b>20 m/s</b>로 공을 보낸다(라켓 앞에서 잠깐 멈춤). 반대로 쳐 내면 운동량이 얼마나 바뀔까?' : '공 기계를 껐다. 멈춰 있는 공을 친다.'); }
    function fire(s) { if (sph === 'push' || sph === 'fly') return; const r = straw(sl, sat, s); sshots.unshift({ ...r, L: sl, at: sat, s }); if (sshots.length > 8) sshots.pop(); sph = 'push'; st = 0; sblow = -1;
      const p2 = sshots[1], dcm = Math.round(r.d * 100);
      let m = `${sl} cm 빨대 · 면봉 ${sat === 'in' ? '입구' : '출구'} 쪽 · 세기 ${Math.round(s * 100)}% → 빨대 안에서 <b>${dcm} cm</b> 동안 <b>${Math.round(r.t * 1000) / 1000} s</b> 힘을 받아 ${f1(r.v)} m/s, <b>${f1(r.x)} m</b>.`;
      if (p2) m += p2.d === r.d ? '' : ` 힘을 받는 길이가 ${Math.round(p2.d * 100)} → ${dcm} cm: 시간이 ${r.t > p2.t ? '길어져 충격량이 커지고 더 멀리' : '짧아져 충격량이 작고 덜 멀리'} 간다.`;
      say(m); steps(); }
    function table() {
      tab.innerHTML = [0, 1, 2, 3].map((j) => { const h = hits[j]; return h ? `<tr><td>${h.F} N</td><td>${h.ms} ms</td><td><b>${f1(h.I)}</b></td><td>${h.vi ? '−20 → ' : '0 → '}${f1(h.vf)}</td></tr>` : '<tr><td></td><td></td><td></td><td></td></tr>'; }).join('');
    }
    const any = (a, f) => a.some((x, i) => a.some((y, j) => j > i && f(x, y)));
    function steps() {
      const ok = []; if (any(hits, (a, b) => a.F !== b.F)) ok.push(1); if (any(hits, (a, b) => Math.abs(a.ms - b.ms) >= 2)) ok.push(2); if (any(sshots, (a, b) => Math.abs(a.d - b.d) >= 0.08)) ok.push(3);
      const n = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, n, ok); window.L1.done(root, n === 0);
      chip.textContent = n === 1 ? '① 세기를 바꿔 두 번 쳐 보기' : n === 2 ? '② 공을 붙인 채 더 길게 끌어 쳐 보기' : n === 3 ? '③ 빨대 길이·면봉 자리를 바꿔 두 번 불기' : '✓ 큰 힘을 오래 → 큰 충격량';
      chip.classList.toggle('done', n === 0);
    }

    const S = P.make(stage, {
      draw,
      down(p) {
        const g = geo();
        if (p.y < g.TOP) {
          const m = g.mach; if (p.x > m.x - 6 && p.x < m.x + m.w + 6 && p.y > m.y - 30 && p.y < m.y + m.h) { setMach(!mach); return; }
          if (Math.abs(p.x - rx) < 46 && Math.abs(p.y - g.HY - 30) < 110 && ph !== 'contact') { again(); if (ph === 'ready' && mach && inT < 1) inT = 1; drag = { r: true, off: p.x - rx }; wind = 0; last = null; return; }
          if (ph === 'fly') return;
          say('라켓(파란 테)을 잡아 <b>뒤로</b> 당겼다가 앞으로 끌자.');
          return;
        }
        const ex = g.SX0 + sl * g.CM;
        if (Math.abs(p.x - ex) < 22 && Math.abs(p.y - g.SY) < 30 && sph !== 'push' && sph !== 'fly') { drag = { len: true }; sph = 'idle'; return; }
        const sw = swabX(g); if (p.x > sw - 10 && p.x < sw + SW * 9 + 10 && Math.abs(p.y - g.SY) < 22 && sph !== 'push' && sph !== 'fly') { drag = { sw: true }; sph = 'idle'; return; }
        if (p.x < g.SX0 + 4 && Math.abs(p.y - g.SY) < 80 && sph !== 'push' && sph !== 'fly') { drag = { blow: true }; sblow = 0; sph = 'blow'; say('누르고 있는 동안 <b>점점 세게</b> 분다. 손을 떼면 면봉이 나간다.'); return; }
      },
      move(p) {
        if (!drag) return;
        const g = geo();
        if (drag.r) {
          const nx = Math.max(40, Math.min(g.HX + 220, p.x - drag.off));
          if (ph === 'ready') { rx = nx; wind = Math.max(wind, rest(g) - rx); if (faceX(rx) >= g.HX - 11) startContact(g); }
          else if (ph === 'contact') { rx = Math.max(rx, nx); dms = Math.max(0, (rx - cx0) / 22); if (dms >= TMAX) { dms = TMAX; drag = null; finish(); } }
          return;
        }
        if (drag.len) { sl = Math.max(LMIN, Math.min(LMAX, Math.round((p.x - g.SX0) / g.CM))); say(`빨대 길이 <b>${sl} cm</b>.`); return; }
        if (drag.sw) { sat = p.x < g.SX0 + sl * g.CM / 2 ? 'in' : 'out'; say(`면봉을 <b>${sat === 'in' ? '입구' : '출구'}</b> 쪽에 넣었다.`); }
      },
      up() {
        const d = drag; drag = null; if (!d) return;
        if (d.r) { if (ph === 'contact') finish(); else if (wind > 6) say('공에 닿을 때까지 <b>앞으로</b> 끌어야 한다.'); return; }
        if (d.blow && sph === 'blow') fire(Math.max(0.05, sblow));
      },
      key(e) {
        const g = geo();
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { wind = Math.max(0, Math.min(120, wind + (e.key === 'ArrowUp' ? 12 : -12))); again(); say(`휘두르는 세기 <b>${force()} N</b> · 접촉 시간 <b>${sel || 3} ms</b>. 엔터로 친다.`); return true; }
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { sel = Math.max(1, Math.min(TMAX, (sel || 3) + (e.key === 'ArrowRight' ? 1 : -1))); say(`휘두르는 세기 <b>${force()} N</b> · 접촉 시간 <b>${sel} ms</b>. 엔터로 친다.`); return true; }
        if (e.key === 'Enter') { again(); if (mach) inT = 1; startContact(g); dms = sel || 3; finish(); return true; }
        if (e.key === 'm' || e.key === 'M') { setMach(!mach); return true; }
        if (e.key === 'l' || e.key === 'L') { sl = sl > 20 ? LMIN : LMAX; sph = 'idle'; say(`빨대 길이 <b>${sl} cm</b>.`); return true; }
        if (e.key === 'i' || e.key === 'I') { sat = sat === 'in' ? 'out' : 'in'; sph = 'idle'; say(`면봉을 <b>${sat === 'in' ? '입구' : '출구'}</b> 쪽에 넣었다.`); return true; }
        if (e.key === 'b' || e.key === 'B' || e.key === ' ') { fire(0.6); return true; }
        if (e.key === '0') { reset(); return true; }
        return false;
      },
    });
    root.querySelector('.ip-reset').addEventListener('click', () => { reset(); S.kick(); });

    reset();
    root._ip = {
      hit: (f, ms) => { const g = geo(); again(); if (mach) inT = 1; wind = (f - FMIN) / (FMAX - FMIN) * 120; startContact(g); dms = ms; finish(); S.redraw(); return root._ip.state(); },
      machine: (on) => { setMach(on); inT = 1; S.redraw(); return root._ip.state(); },
      blow: (cm, at, s) => { sl = cm; sat = at; sph = 'idle'; fire(s); S.redraw(); return root._ip.state(); },
      state: () => ({ ph, mach, F, dms: +dms.toFixed(1), rx: rx == null ? null : +rx.toFixed(0), hits: hits.map((h) => [h.F, h.ms, +h.I.toFixed(2), h.vi, +h.vf.toFixed(1)]), sph, sl, sat, shots: sshots.map((s) => [s.L, s.at, +s.x.toFixed(2)]), done: root.classList.contains('u-done'), out: out.textContent, chip: chip.textContent }),
      geo: () => { const g = geo(); return { W: g.W, H: g.H, TOP: g.TOP, HX: g.HX, HY: g.HY, R0: g.R0, SY: g.SY, SX0: g.SX0, CM: g.CM, mach: g.mach, swabX: swabX(g), ex: g.SX0 + sl * g.CM }; },
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Impulse = { mount };
})();
