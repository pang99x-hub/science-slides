/* 3-2 4차시 체험 «달걀을 지켜라»(교과서 135쪽 달걀과 나무판·방석, 그림 Ⅲ-26 + 참고서 탐구 자료창 · 달걀·유리컵·물풍선 문제).
   실험대 아래 받침에서 바닥 재료(나무판·방석·스펀지·물 담은 대야)를 끌어 실험대에 깔고, 달걀 받침의 달걀을 끌어 올려 높이(0.1~1.0 m 눈금)를 정한 뒤 놓으면 떨어진다.
   닿는 순간 느린 화면: 바닥이 눌리는 깊이만큼 멈추는 시간이 다르다(나무판 2 ms · 스펀지 9 ms · 방석 20 ms · 물 40 ms).
   오른쪽 힘–시간 그래프(반 사인 모양): 넓이 = 충격량 = 닿기 직전 운동량(높이가 같으면 같다) · 최대 힘 = π·충격량 ÷ (2 × 시간).
   최대 힘이 깨지는 힘(40 N)을 넘으면 깨진다. 지난 결과 둘을 겹쳐 비교. 바닥도 같은 크기의 충격량을 받는다(반대 방향 화살표).
   ① 나무판에 떨어뜨린다 ② 방석에 같은 높이로 ③ 깨지지 않는 바닥을 하나 더 찾는다(스펀지·물).
   달걀 60 g · 멈추는 시간 · 깨지는 힘은 이해를 돕기 위한 예. 공기 저항 무시.
   Egg.mount(root) → { fit, setActive } · 시험용: root._eg.drop(재료, 높이) · lay(재료) · state() · geo() */
(function () {
  'use strict';
  const TAU = Math.PI * 2, G = 9.8, M = 0.06, FB = 40, HMIN = 0.1, HMAX = 1.0;
  const MAT = {
    wood: { name: '나무판', T: 2, th: 18 },
    cushion: { name: '방석', T: 20, th: 36 },
    sponge: { name: '스펀지', T: 9, th: 40 },
    water: { name: '물 담은 대야', T: 40, th: 62 },
  };
  const ORDER = ['wood', 'cushion', 'sponge', 'water'];
  const COL = { wood: '#b0662a', cushion: '#c0392b', sponge: '#c9a300', water: '#1f6fb8' };
  const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1), f2 = (x) => (Math.round(x * 100) / 100).toFixed(2);
  const jo = (w, a, b) => w + ((w.charCodeAt(w.length - 1) - 0xAC00) % 28 ? a : b); // 받침 있으면 a
  const calc = (mat, h) => { const v = Math.sqrt(2 * G * h), p = M * v, T = MAT[mat].T / 1000; const pk = Math.PI * p / (2 * T); return { mat, h, v, p, I: p, T: MAT[mat].T, avg: p / T, pk, broke: pk > FB, d: v * T / 2 }; };
  // 자체 확인: 나무판은 10 cm에서도 깨지고, 방석·물은 1 m에서도 안 깨진다. 스펀지는 0.7 m까지 버티고 0.8 m부터 깨진다. 같은 높이면 충격량이 같다.
  console.assert(calc('wood', 0.1).broke && !calc('cushion', 1).broke && !calc('water', 1).broke && !calc('sponge', 0.7).broke && calc('sponge', 0.8).broke && calc('wood', 0.5).I === calc('cushion', 0.5).I, 'egg: 깨짐 기준');

  function mount(root) {
    const stage = root.querySelector('.eg-stage'), chip = root.querySelector('.eg-now'), out = root.querySelector('.eg-out'), tab = root.querySelector('.eg-tab tbody');
    const P = window.Play;
    let mat, ph, h, ht, t, u, cur, runs, drag, clock, msg, splat, rec, pores, bg = null, bgKey = '';

    function reset() {
      mat = null; ph = 'idle'; h = 0.5; ht = 0; t = 0; u = 0; cur = null; runs = []; drag = null; clock = 0; splat = null; rec = 0;
      say('아래 받침에서 <b>바닥 재료</b> 하나를 끌어 실험대에 깔자. 먼저 <b>나무판</b>부터.');
      table(); steps();
    }
    const say = (s) => { if (s !== msg) { msg = s; out.innerHTML = s; } };

    // ── 자리 잡기 ──
    const geo = () => {
      const W = S.W, H = S.H, LW = Math.round(W * 0.53), GY = H - 168, PX = Math.round(LW * 0.5) + 24, PW = 230;
      const th = mat ? MAT[mat].th : 0, SY = GY - th, TOPY = 92, ky = (SY - 26 - TOPY) / HMAX;
      const cw = (LW - 40) / 4;
      return { W, H, LW, GY, PX, PW, SY, ky, TOPY, cup: { x: PX + PW / 2 + 70, y: GY },
        cards: ORDER.map((k, i) => ({ k, x: 20 + i * cw, y: GY + 52, w: cw - 10, h: H - GY - 62 })),
        graph: { x: LW + 12, y: 14, w: W - LW - 26, h: Math.round(H * 0.64) }, info: { x: LW + 12, y: Math.round(H * 0.64) + 26, w: W - LW - 26, h: H - Math.round(H * 0.64) - 38 } };
    };
    const eggY = (g, hh) => g.SY - 22 - hh * g.ky; // 달걀 중심(아래 끝이 높이 hh)

    // ── 그림 도구 ──
    function eggPath(c, x, y, rx, ry) { // 위가 좁은 달걀 모양(중심 x,y)
      c.beginPath(); c.moveTo(x, y - ry);
      c.bezierCurveTo(x + rx * 0.78, y - ry, x + rx * 1.02, y - ry * 0.05, x + rx, y + ry * 0.22);
      c.bezierCurveTo(x + rx * 0.98, y + ry * 0.82, x + rx * 0.5, y + ry, x, y + ry);
      c.bezierCurveTo(x - rx * 0.5, y + ry, x - rx * 0.98, y + ry * 0.82, x - rx, y + ry * 0.22);
      c.bezierCurveTo(x - rx * 1.02, y - ry * 0.05, x - rx * 0.78, y - ry, x, y - ry); c.closePath();
    }
    function egg(c, x, y, sq = 0, crack = 0) {
      const rx = 17 * (1 + sq * 0.35), ry = 22 * (1 - sq * 0.3), yy = y + 22 * sq * 0.3;
      c.save(); c.shadowColor = 'rgba(0,0,0,.25)'; c.shadowBlur = 6; c.shadowOffsetY = 2;
      const gr = c.createRadialGradient(x - rx * 0.35, yy - ry * 0.4, 2, x, yy, ry * 1.2); gr.addColorStop(0, '#fffdf7'); gr.addColorStop(0.5, '#f4e6cf'); gr.addColorStop(1, '#b8946a');
      eggPath(c, x, yy, rx, ry); c.fillStyle = gr; c.fill(); c.restore();
      c.strokeStyle = 'rgba(120,84,50,.55)'; c.lineWidth = 1.2; eggPath(c, x, yy, rx, ry); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.ellipse(x - rx * 0.38, yy - ry * 0.42, rx * 0.18, ry * 0.26, -0.4, 0, TAU); c.fill();
      // 반점(질감)
      c.fillStyle = 'rgba(150,110,70,.18)'; [[0.3, 0.1], [-0.2, 0.4], [0.45, -0.35], [-0.5, -0.1], [0.1, 0.65]].forEach(([a, b]) => { c.beginPath(); c.arc(x + a * rx, yy + b * ry, 1.3, 0, TAU); c.fill(); });
      if (crack > 0) { c.strokeStyle = '#4a3420'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x - rx * 0.9, yy + ry * 0.3); [[-0.55, 0.1], [-0.3, 0.42], [0, 0.15], [0.25, 0.45], [0.55, 0.12], [0.9, 0.35]].slice(0, Math.ceil(crack * 6)).forEach(([a, b]) => c.lineTo(x + a * rx, yy + b * ry)); c.stroke(); }
    }
    function broken(c, x, y, k) { // 깨진 달걀: 흰자·노른자가 퍼지고 껍데기 두 조각
      const s = Math.min(1, k);
      c.fillStyle = 'rgba(255,253,235,.78)'; c.beginPath(); c.ellipse(x, y - 3, 22 + 34 * s, 5 + 3 * s, 0, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(200,190,150,.6)'; c.lineWidth = 1; c.stroke();
      const yg = c.createRadialGradient(x - 3, y - 7, 1, x, y - 5, 11); yg.addColorStop(0, '#ffd56a'); yg.addColorStop(1, '#e88a10'); c.fillStyle = yg; c.beginPath(); c.ellipse(x + 2, y - 6, 11, 7, 0, 0, TAU); c.fill();
      [[-1, -26 - 10 * s, 0.5], [1, 22 + 12 * s, -0.4]].forEach(([d, dx, rot]) => {
        c.save(); c.translate(x + dx, y - 9); c.rotate(rot * s); const gr = c.createLinearGradient(0, -12, 0, 8); gr.addColorStop(0, '#fbf3e4'); gr.addColorStop(1, '#c8a57c'); c.fillStyle = gr;
        c.beginPath(); c.moveTo(-15, 0); c.bezierCurveTo(-15, 12, 15, 12, 15, 0); [[10, -4], [5, 2], [0, -5], [-5, 1], [-10, -4]].forEach(([a, b]) => c.lineTo(a, b)); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(110,80,50,.6)'; c.lineWidth = 1; c.stroke(); c.restore();
      });
    }
    function pill(c, x, y, s, bgc, fg = '#fff', f = '700 15px', al = 'center') {
      c.font = `${f} "IBM Plex Sans KR", sans-serif`; const w = c.measureText(s).width + 16, x0 = al === 'left' ? x : al === 'right' ? x - w : x - w / 2;
      c.fillStyle = bgc; c.beginPath(); c.roundRect(x0, y - 16, w, 25, 12); c.fill();
      P.txt(c, s, x0 + w / 2, y + 2, fg, f);
    }
    function varrow(c, x, y0, y1, col, w = 7) { // 세로 화살표
      const d = Math.sign(y1 - y0) || 1, L = Math.abs(y1 - y0); if (L < 4) return; const hl = Math.min(14, L * 0.5);
      c.fillStyle = col; c.beginPath(); c.moveTo(x - w / 2, y0); c.lineTo(x - w / 2, y1 - d * hl); c.lineTo(x - w * 1.3, y1 - d * hl); c.lineTo(x, y1); c.lineTo(x + w * 1.3, y1 - d * hl); c.lineTo(x + w / 2, y1 - d * hl); c.lineTo(x + w / 2, y0); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1; c.stroke();
    }
    // 바닥 재료(윗면 y0, 가운데 x, 너비 w, 눌린 깊이 s px)
    function pad(c, k, x, y0, w, s, small) {
      const th = MAT[k].th * (small ? 0.62 : 1), x0 = x - w / 2, x1 = x + w / 2, top = (xx) => y0 + s * Math.exp(-(((xx - x) / (small ? 30 : 48)) ** 2));
      const surf = () => { c.moveTo(x0, top(x0)); for (let xx = x0; xx <= x1; xx += 4) c.lineTo(xx, top(xx)); };
      if (k === 'wood') {
        const gr = c.createLinearGradient(0, y0, 0, y0 + th); gr.addColorStop(0, '#d9a467'); gr.addColorStop(1, '#8c5a2a');
        c.fillStyle = gr; c.beginPath(); surf(); c.lineTo(x1, y0 + th); c.lineTo(x0, y0 + th); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(90,50,20,.35)'; c.lineWidth = 1; for (let j = 1; j < 4; j++) { c.beginPath(); for (let xx = x0; xx <= x1; xx += 6) { const yy = y0 + th * j / 4 + Math.sin(xx / 23 + j * 2) * 1.6; xx === x0 ? c.moveTo(xx, yy) : c.lineTo(xx, yy); } c.stroke(); }
        c.fillStyle = 'rgba(90,50,20,.45)'; c.beginPath(); c.ellipse(x0 + w * 0.72, y0 + th * 0.55, 6, 2.4, 0, 0, TAU); c.fill();
        c.strokeStyle = '#5a3615'; c.lineWidth = 1.5; c.strokeRect(x0, y0, w, th);
      } else if (k === 'cushion') {
        const gr = c.createLinearGradient(0, y0, 0, y0 + th); gr.addColorStop(0, '#e2685a'); gr.addColorStop(0.6, '#b8372b'); gr.addColorStop(1, '#7e2219');
        c.fillStyle = gr; c.beginPath(); c.moveTo(x0 + 10, y0 + th); c.quadraticCurveTo(x0 - 4, y0 + th / 2, x0 + 8, top(x0 + 8)); for (let xx = x0 + 8; xx <= x1 - 8; xx += 4) c.lineTo(xx, top(xx)); c.quadraticCurveTo(x1 + 4, y0 + th / 2, x1 - 10, y0 + th); c.closePath(); c.fill();
        c.strokeStyle = '#5e1810'; c.lineWidth = 1.5; c.stroke();
        c.strokeStyle = 'rgba(255,220,200,.55)'; c.setLineDash([4, 4]); c.beginPath(); for (let xx = x0 + 10; xx <= x1 - 10; xx += 4) { const yy = top(xx) + 5; xx === x0 + 10 ? c.moveTo(xx, yy) : c.lineTo(xx, yy); } c.stroke(); c.setLineDash([]);
        [0.25, 0.75].forEach((f) => { const bx = x0 + w * f; c.fillStyle = '#6e1a12'; c.beginPath(); c.arc(bx, top(bx) + th * 0.42, 3, 0, TAU); c.fill(); });
      } else if (k === 'sponge') {
        const gr = c.createLinearGradient(0, y0, 0, y0 + th); gr.addColorStop(0, '#ffe680'); gr.addColorStop(1, '#d4a514');
        c.fillStyle = gr; c.beginPath(); surf(); c.lineTo(x1, y0 + th); c.lineTo(x0, y0 + th); c.closePath(); c.fill();
        if (!pores) { pores = []; let sd = 7; const rnd = () => ((sd = (sd * 9301 + 49297) % 233280) / 233280); for (let i = 0; i < 70; i++) pores.push([rnd(), rnd(), 1 + rnd() * 2.4]); }
        c.fillStyle = 'rgba(150,110,0,.45)'; pores.forEach(([a, b, r]) => { const xx = x0 + 4 + a * (w - 8); c.beginPath(); c.arc(xx, top(xx) + 3 + b * (th - 7) * (1 - s / th * 0.4), r * (small ? 0.7 : 1), 0, TAU); c.fill(); });
        c.strokeStyle = '#9b7a08'; c.lineWidth = 1.5; c.beginPath(); surf(); c.lineTo(x1, y0 + th); c.lineTo(x0, y0 + th); c.closePath(); c.stroke();
      } else if (k === 'water') {
        // 대야(앞쪽은 waterFront에서 덧그림)
        const gr = c.createLinearGradient(x0, 0, x1, 0); gr.addColorStop(0, '#7d8794'); gr.addColorStop(0.45, '#dfe5ec'); gr.addColorStop(1, '#6f7a88');
        c.fillStyle = '#4c5563'; c.beginPath(); c.ellipse(x, y0 - 4, w / 2, 9, 0, 0, TAU); c.fill();
        c.fillStyle = gr; c.beginPath(); c.moveTo(x0, y0 - 4); c.lineTo(x0 + 16, y0 + th); c.lineTo(x1 - 16, y0 + th); c.lineTo(x1, y0 - 4); c.closePath(); c.fill(); c.strokeStyle = '#3f4754'; c.lineWidth = 1.5; c.stroke();
      }
    }
    function waterFront(c, x, y0, w, s, wob, small) { // 물(달걀 위로 덧그림)
      const th = MAT.water.th * (small ? 0.62 : 1), x0 = x - w / 2 + 6, x1 = x + w / 2 - 6, sy = y0 + 4;
      const top = (xx) => sy + s * Math.exp(-(((xx - x) / 36) ** 2)) + Math.sin(xx / 9 + clock * 6) * wob;
      const gr = c.createLinearGradient(0, sy, 0, y0 + th); gr.addColorStop(0, 'rgba(110,180,240,.62)'); gr.addColorStop(1, 'rgba(30,90,170,.8)');
      c.fillStyle = gr; c.beginPath(); c.moveTo(x0, top(x0)); for (let xx = x0; xx <= x1; xx += 3) c.lineTo(xx, top(xx)); c.lineTo(x1 - 12, y0 + th - 2); c.lineTo(x0 + 12, y0 + th - 2); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 1.5; c.beginPath(); for (let xx = x0; xx <= x1; xx += 3) xx === x0 ? c.moveTo(xx, top(xx)) : c.lineTo(xx, top(xx)); c.stroke();
      c.strokeStyle = '#3f4754'; c.lineWidth = 3; c.beginPath(); c.ellipse(x, y0 - 4, w / 2, 9, 0, 0.05, Math.PI - 0.05); c.stroke();
    }

    function paintBg(g) {
      const { W, H, LW, GY } = g;
      const k2 = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const cv = document.createElement('canvas'); cv.width = W * k2; cv.height = H * k2;
      const c = cv.getContext('2d'); c.setTransform(k2, 0, 0, k2, 0, 0);
      const wl = c.createLinearGradient(0, 0, 0, GY); wl.addColorStop(0, '#f6efe0'); wl.addColorStop(1, '#e7dcc4'); c.fillStyle = wl; c.fillRect(0, 0, W, GY);
      c.strokeStyle = 'rgba(120,100,70,.10)'; c.lineWidth = 1; for (let y = 40; y < GY; y += 40) { c.beginPath(); c.moveTo(0, y); c.lineTo(LW, y); c.stroke(); }
      // 실험대 윗판 + 서랍장
      const tp = c.createLinearGradient(0, GY - 6, 0, GY + 14); tp.addColorStop(0, '#59606d'); tp.addColorStop(1, '#2c313a'); c.fillStyle = tp; c.fillRect(0, GY - 2, LW + 4, 18);
      c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(0, GY - 2, LW + 4, 2);
      const fr = c.createLinearGradient(0, GY + 16, 0, H); fr.addColorStop(0, '#d8c39d'); fr.addColorStop(1, '#b89c6c'); c.fillStyle = fr; c.fillRect(0, GY + 16, LW + 4, H - GY - 16);
      P.txt(c, '받침: 바닥 재료를 끌어 실험대에 깔기', 20, GY + 40, '#4a3a20', '800 15px', 'left');
      // 오른쪽(그래프 칸) 바탕
      c.fillStyle = '#eef1f6'; c.fillRect(LW + 4, 0, W - LW - 4, H); c.fillStyle = '#1d2433'; c.fillRect(LW + 2, 0, 3, H);
      return cv;
    }

    // 힘–시간 그래프
    const XMS = 45;
    function shape(c, x0, y0, sx, sy, r, upto) { c.beginPath(); c.moveTo(x0, y0); const n = 48, end = Math.min(r.T, upto); for (let k = 0; k <= n; k++) { const tt = end * k / n; c.lineTo(x0 + tt * sx, y0 - r.pk * Math.sin(Math.PI * tt / r.T) * sy); } c.lineTo(x0 + end * sx, y0); c.closePath(); }
    function niceMax(v) { const st = [50, 100, 150, 200, 250, 300]; return st.find((s) => s >= v * 1.08) || 300; }
    function graph(c, g) {
      const B = g.graph, x0 = B.x + 52, y0 = B.y + B.h - 36, w = B.w - 70, hh = B.h - 100;
      c.fillStyle = '#fff'; c.beginPath(); c.roundRect(B.x, B.y, B.w, B.h, 10); c.fill(); c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.stroke();
      P.txt(c, '달걀이 받는 힘–시간 그래프', B.x + 12, B.y + 24, '#1d2433', '800 17px', 'left');
      const show = runs.slice(0, 3), Y = niceMax(Math.max(FB, ...show.map((r) => r.pk))), sx = w / XMS, sy = hh / Y;
      c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0, y0 - hh - 6); c.lineTo(x0, y0); c.lineTo(x0 + w + 6, y0); c.stroke();
      const stp = Y / 5; for (let n = stp; n <= Y + 0.1; n += stp) { c.strokeStyle = 'rgba(29,36,51,.10)'; c.beginPath(); c.moveTo(x0, y0 - n * sy); c.lineTo(x0 + w, y0 - n * sy); c.stroke(); P.txt(c, String(Math.round(n)), x0 - 5, y0 - n * sy + 4, '#59607a', '600 12px', 'right'); }
      for (let n = 10; n <= 40; n += 10) P.txt(c, String(n), x0 + n * sx, y0 + 16, '#59607a', '600 12px');
      P.txt(c, '힘(N)', x0 - 6, y0 - hh - 14, '#59607a', '700 13px', 'right'); P.txt(c, '시간(ms)', x0 + w, y0 + 30, '#59607a', '700 13px', 'right');
      // 깨지는 힘
      c.save(); c.setLineDash([7, 5]); c.strokeStyle = '#d0342c'; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, y0 - FB * sy); c.lineTo(x0 + w, y0 - FB * sy); c.stroke(); c.restore();
      P.txt(c, `깨지는 힘 ${FB} N`, x0 + w, y0 - FB * sy - 6, '#d0342c', '700 13px', 'right');
      // 지난 결과(흐리게) → 이번(진하게)
      const live = ph === 'hit' && cur;
      show.slice().reverse().forEach((r) => {
        const isNow = r === runs[0] && !live, upto = isNow ? 99 : 99;
        if (live && r === runs[0]) return;
        shape(c, x0, y0, sx, sy, r, upto); c.globalAlpha = isNow ? 1 : 0.55; c.fillStyle = COL[r.mat] + (isNow ? '55' : '22'); c.fill(); c.strokeStyle = COL[r.mat]; c.lineWidth = isNow ? 3 : 1.6; c.stroke(); c.globalAlpha = 1;
        const lx = x0 + r.T * sx / 2, ly = y0 - Math.min(r.pk, Y) * sy;
        pill(c, Math.min(x0 + w - 4, lx + 8), Math.max(B.y + 52, ly - 8), `${MAT[r.mat].name} ${f1(r.h)} m`, isNow ? COL[r.mat] : 'rgba(90,96,110,.7)', '#fff', '700 12px', 'left');
      });
      if (live) { shape(c, x0, y0, sx, sy, cur, cur.T * u); c.fillStyle = COL[cur.mat] + '55'; c.fill(); c.strokeStyle = COL[cur.mat]; c.lineWidth = 3; c.stroke(); }
      const r = live ? cur : runs[0];
      if (r) {
        const tx = x0 + w * 0.4, ty = y0 - hh + 18;
        P.txt(c, `넓이 = 충격량 ${f2(r.I)} N·s`, tx, ty, '#1d2433', '800 16px', 'left');
        P.txt(c, `최대 힘 ${Math.round(r.pk)} N · 평균 힘 ${f1(r.avg)} N`, tx, ty + 22, '#59607a', '700 14px', 'left');
        P.txt(c, `멈추는 시간 ${r.T} ms`, tx, ty + 42, '#59607a', '700 14px', 'left');
      } else P.txt(c, '떨어뜨리면 여기에 그래프가 그려진다', x0 + w / 2, y0 - hh / 2, '#8a90a2', '700 16px');
    }
    function info(c, g) {
      const B = g.info; c.fillStyle = '#fffbe6'; c.beginPath(); c.roundRect(B.x, B.y, B.w, B.h, 10); c.fill(); c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; c.stroke();
      const r = ph === 'hit' || ph === 'done' ? cur : null, hh = r ? r.h : h, v = Math.sqrt(2 * G * hh), p = M * v;
      P.txt(c, `높이 ${f1(hh)} m → 닿기 직전 속력 ${f1(v)} m/s`, B.x + 14, B.y + 28, '#1d2433', '700 16px', 'left');
      P.txt(c, `운동량 = 0.06 kg × ${f1(v)} m/s = ${f2(p)} kg·m/s`, B.x + 14, B.y + 54, '#1d2433', '700 16px', 'left');
      P.txt(c, `멈추면 운동량 0 → 충격량 = ${f2(p)} N·s`, B.x + 14, B.y + 80, '#7a1a10', '800 16px', 'left');
      // 높이에 따라 커지는 운동량 막대
      const bx = B.x + 14, by = B.y + B.h - 22, bw = B.w - 28;
      c.fillStyle = 'rgba(29,36,51,.12)'; c.fillRect(bx, by, bw, 10); c.fillStyle = '#e8483a'; c.fillRect(bx, by, bw * p / (M * Math.sqrt(2 * G * HMAX)), 10); c.strokeStyle = '#1d2433'; c.lineWidth = 1; c.strokeRect(bx, by, bw, 10);
      if (B.h > 112) P.txt(c, '높을수록 운동량·충격량이 크다', bx + bw, by - 6, '#59607a', '700 12px', 'right');
    }

    function draw(c, W, H, dt) {
      if (!W) return;
      const g = geo(); clock += dt;
      const key = W + 'x' + H; if (key !== bgKey) { bg = paintBg(g); bgKey = key; }
      c.clearRect(0, 0, W, H); c.drawImage(bg, 0, 0, W, H);
      step(g, dt);
      const { PX, PW, SY, GY } = g;
      // 높이 자(바닥 윗면이 0)
      const RX = PX - PW / 2 - 34;
      if (mat) {
        c.fillStyle = '#fbfaf5'; c.fillRect(RX - 14, eggY(g, HMAX) + 22 - 8, 28, SY - (eggY(g, HMAX) + 22) + 8); c.strokeStyle = '#1d2433'; c.lineWidth = 1.2; c.strokeRect(RX - 14, eggY(g, HMAX) + 22 - 8, 28, SY - (eggY(g, HMAX) + 22) + 8);
        for (let k = 0; k <= 10; k++) { const y = eggY(g, k / 10) + 22; c.beginPath(); c.moveTo(RX + 14, y); c.lineTo(RX + (k % 2 ? 4 : -2), y); c.stroke(); if (k % 2 === 0) P.txt(c, f1(k / 10), RX - 18, y + 5, '#1d2433', '700 13px', 'right'); }
        P.txt(c, '높이(m)', RX, eggY(g, HMAX) + 2, '#1d2433', '700 13px');
      }
      // 실험대 위 재료
      const sPx = ph === 'hit' && cur ? Math.min(62, cur.d * 1000 * 0.7) * Math.sin(Math.PI / 2 * Math.min(1, u * 1.6)) : rec;
      if (mat) pad(c, mat, PX, SY, PW, mat === 'water' ? 0 : sPx);
      // 달걀 받침
      const cp = g.cup; c.fillStyle = '#e9edf3'; c.beginPath(); c.moveTo(cp.x - 24, cp.y - 22); c.lineTo(cp.x + 24, cp.y - 22); c.lineTo(cp.x + 12, cp.y - 2); c.lineTo(cp.x - 12, cp.y - 2); c.closePath(); c.fill(); c.strokeStyle = '#59607a'; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = '#c5ccd8'; c.fillRect(cp.x - 16, cp.y - 4, 32, 4);
      // 달걀
      const restY = SY - 22 + (mat === 'water' ? 8 : 0), dip = cur ? Math.min(62, cur.d * 700) : 0;
      let ex = PX, ey = 0, sq = 0, crack = 0;
      if (ph === 'hold') ey = eggY(g, h);
      else if (ph === 'fall') ey = eggY(g, Math.max(0, cur.h - 0.5 * G * t * t));
      else if (ph === 'hit') { ey = SY - 22 + dip * Math.sin(Math.PI / 2 * Math.min(1, u * 1.6)); sq = Math.min(1, cur.pk / FB) * 0.5 * Math.sin(Math.PI * u); if (cur.broke) crack = Math.min(1, u * 2); }
      if (splat) broken(c, PX, SY + (mat === 'water' ? 6 : 0), splat.k);
      if (ph === 'hold' || ph === 'fall' || ph === 'hit' && !(cur.broke && u > 0.55)) egg(c, ex, ey, sq, crack);
      else if (cur && !cur.broke) egg(c, PX, restY + (mat === 'water' ? 0 : rec * 0.6));
      if (ph === 'idle' || ph === 'done') egg(c, cp.x, cp.y - 40);
      if (mat === 'water') waterFront(c, PX, SY, PW, ph === 'hit' ? Math.min(14, cur.d * 200) * Math.sin(Math.PI * u) : 0, ph === 'hit' ? 2 * (1 - u) : ph === 'done' ? 1.2 : 0.4);
      // 높이 표시(들고 있을 때)
      if (ph === 'hold') { c.save(); c.setLineDash([5, 4]); c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(RX + 14, ey + 22); c.lineTo(PX - 18, ey + 22); c.stroke(); c.restore(); pill(c, PX + 26, ey, `높이 ${f1(h)} m · 놓으면 떨어진다`, '#1d2433', '#fff', '800 14px', 'left'); }
      // 떨어지는 중 운동량
      if (ph === 'fall') { const vv = G * t; pill(c, PX + 28, ey, `속력 ${f1(vv)} m/s`, 'rgba(29,36,51,.8)', '#fff', '700 13px', 'left'); }
      // 닿는 동안·뒤: 서로 주고받는 충격량(크기 같고 방향 반대)
      if ((ph === 'hit' || ph === 'done') && cur) {
        const fr = ph === 'hit' ? (1 - Math.cos(Math.PI * Math.min(1, u))) / 2 : 1, L = (24 + cur.I * 150) * fr, ax = PX + 40;
        if (L > 6) {
          varrow(c, ax, SY - 6, SY - 6 - L, '#2f9e5b', 7); pill(c, ax + 14, SY - 18 - L * 0.6, `달걀 ↑ ${f2(cur.I * fr)} N·s`, '#2f9e5b', '#fff', '700 13px', 'left');
          varrow(c, ax + 26, SY + 4, SY + 4 + Math.min(L, GY - SY + 40), '#c0321f', 7); pill(c, ax + 40, SY + 30, `바닥 ↓ ${f2(cur.I * fr)} N·s(크기 같음)`, '#c0321f', '#fff', '700 13px', 'left');
        }
        if (ph === 'hit') pill(c, PX + 40, 130, `느린 화면 · 실제로는 ${cur.T / 1000} s 만에 멈춘다`, '#1d2433', '#fff', '800 14px');
      }
      if (ph === 'done' && cur) pill(c, PX + 40, 130, cur.broke ? `깨졌다! 최대 힘 ${Math.round(cur.pk)} N > ${FB} N` : `무사하다! 최대 힘 ${Math.round(cur.pk)} N < ${FB} N`, cur.broke ? '#c0321f' : '#2f9e5b', '#fff', '800 16px');
      // 받침의 재료 카드
      g.cards.forEach((cd) => {
        const on = cd.k === mat, dg = drag && drag.card === cd.k;
        c.fillStyle = on ? 'rgba(255,216,77,.55)' : 'rgba(255,255,255,.7)'; c.beginPath(); c.roundRect(cd.x, cd.y, cd.w, cd.h, 10); c.fill(); c.strokeStyle = on ? '#1d2433' : 'rgba(29,36,51,.5)'; c.lineWidth = on ? 2.5 : 1.5; c.stroke();
        if (!dg) pad(c, cd.k, cd.x + cd.w / 2, cd.y + cd.h * 0.5 - (cd.k === 'water' ? 16 : 8), cd.w - 24, 0, true);
        if (!dg && cd.k === 'water') waterFront(c, cd.x + cd.w / 2, cd.y + cd.h * 0.5 - 16, cd.w - 24, 0, 0.3, true);
        P.txt(c, MAT[cd.k].name, cd.x + cd.w / 2, cd.y + cd.h - 10, '#1d2433', '800 15px');
        if (on) P.txt(c, '깔림 ✓', cd.x + cd.w - 8, cd.y + 18, '#1d2433', '700 12px', 'right');
      });
      if (drag && drag.card) { const k = drag.card; c.globalAlpha = 0.9; pad(c, k, drag.x, drag.y, 200, 0); if (k === 'water') waterFront(c, drag.x, drag.y, 200, 0, 0.5); c.globalAlpha = 1; pill(c, drag.x, drag.y - 22, '실험대 위에 놓기', '#1d2433', '#fff', '700 13px'); }
      // 안내(움직이는 손)
      if (!mat && !drag) hand(c, g.cards[0].x + g.cards[0].w / 2, g.cards[0].y + 10 - Math.abs(Math.sin(clock * 2.6)) * 14);
      else if (mat && ph === 'idle' && !drag && !runs.length) { hand(c, cp.x + 30, cp.y - 46 - Math.abs(Math.sin(clock * 2.6)) * 18, -0.5); c.save(); c.setLineDash([6, 5]); c.lineDashOffset = -clock * 16; c.strokeStyle = '#e8483a'; c.lineWidth = 3; c.beginPath(); c.arc(cp.x, cp.y - 40, 30, 0, TAU); c.stroke(); c.restore(); }
      graph(c, g); info(c, g);
    }
    function hand(c, x, y, rot = 0) {
      c.save(); c.translate(x, y); c.rotate(rot); c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 5;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(14, 18); c.lineTo(5, 18); c.lineTo(5, 36); c.lineTo(-5, 36); c.lineTo(-5, 18); c.lineTo(-14, 18); c.closePath();
      c.fillStyle = '#ffd84d'; c.fill(); c.shadowBlur = 0; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.stroke(); c.restore();
    }

    // ── 움직임 ──
    const SLOWF = 1.7; // 떨어지는 동안 느리게
    function step(g, dt) {
      if (ph === 'fall') { t += dt / SLOWF; const tf = Math.sqrt(2 * cur.h / G); if (t >= tf) { t = tf; ph = 'hit'; u = 0; } }
      else if (ph === 'hit') { u += dt / (0.9 + cur.T * 0.03); if (cur.broke && !splat && u > 0.55) splat = { k: 0 }; if (u >= 1) { u = 1; finish(); } }
      else if (ph === 'done') { ht += dt; if (ht > 2.2) { ph = 'idle'; } }
      if (splat) splat.k = Math.min(1, splat.k + dt * 1.5);
      if (ph !== 'hit') rec += (0 - rec) * Math.min(1, dt * 2.5);
      if (ph === 'hit' && cur && mat !== 'water') rec = Math.min(62, cur.d * 1000 * 0.7);
    }
    function lay(k) {
      if (ph === 'fall' || ph === 'hit') return;
      mat = k; ph = 'idle'; splat = null; cur = null; rec = 0;
      const m = MAT[k];
      say(`실험대에 <b>${jo(m.name, '을', '를')}</b> 깔았다. 이제 받침의 <b>달걀</b>을 끌어 올려 높이를 정하고 놓자.`);
    }
    function drop(hh) {
      if (!mat || ph === 'fall' || ph === 'hit') return;
      h = Math.max(HMIN, Math.min(HMAX, Math.round(hh * 10) / 10)); splat = null; cur = calc(mat, h); t = 0; ph = 'fall';
      say(`${f1(h)} m에서 놓았다. 떨어질수록 빨라진다(운동량이 커진다)…`);
    }
    function finish() {
      ph = 'done'; ht = 0; runs.unshift(cur); if (runs.length > 8) runs.pop();
      const r = cur, nm = MAT[r.mat].name;
      let s = `${nm} · ${f1(r.h)} m: 닿기 직전 운동량 <b>${f2(r.p)} kg·m/s</b> → 멈추는 데 <b>${r.T} ms</b>, 최대 힘 <b>${Math.round(r.pk)} N</b> — ${r.broke ? '깨지는 힘을 넘어 <b>깨졌다</b>.' : '<b>깨지지 않았다</b>.'}`;
      const q = runs.slice(1).find((x) => x.h === r.h && x.mat !== r.mat), q2 = runs.slice(1).find((x) => x.mat === r.mat && x.h !== r.h);
      if (q) { const k = r.T / q.T; s += ` ${jo(MAT[q.mat].name, '과', '와')} 높이가 같아 <b>넓이(충격량)는 같고</b>, 시간이 ${q.T} → ${r.T} ms(${k > 1 ? f1(k) + '배' : '1/' + f1(1 / k)})가 되자 평균 힘은 ${k > 1 ? '1/' + f1(k) + '로 줄었다' : f1(1 / k) + '배로 커졌다'}.`; }
      else if (q2) s += ` 같은 ${jo(nm, '이라도', '라도')} ${f1(q2.h)} → ${f1(r.h)} m로 ${r.h > q2.h ? '높이면 운동량·충격량이 커져 힘도 커진다' : '낮추면 운동량·충격량이 작아져 힘도 작다'}.`;
      say(s); table(); steps();
      try { if (r.broke && navigator.vibrate) navigator.vibrate(30); } catch { /* 지원 안 함 */ }
    }
    function table() {
      tab.innerHTML = [0, 1, 2, 3].map((j) => { const r = runs[j]; return r ? `<tr${j ? '' : ' class="hl"'}><td>${MAT[r.mat].name}</td><td>${f1(r.h)} m</td><td><b>${f2(r.I)}</b></td><td>${r.T}</td><td>${Math.round(r.pk)}</td><td>${r.broke ? '깨짐' : '무사'}</td></tr>` : '<tr><td></td><td></td><td></td><td></td><td></td><td></td></tr>'; }).join('');
    }
    function steps() {
      const ok = [];
      if (runs.some((r) => r.mat === 'wood')) ok.push(1);
      if (runs.some((r) => r.mat === 'cushion' && runs.some((q) => q.mat === 'wood' && q.h === r.h))) ok.push(2);
      if (runs.some((r) => (r.mat === 'sponge' || r.mat === 'water') && !r.broke)) ok.push(3);
      const n = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, n, ok); window.L1.done(root, n === 0);
      chip.textContent = n === 1 ? '① 나무판을 깔고 달걀을 떨어뜨리기' : n === 2 ? '② 방석으로 바꿔 같은 높이에서' : n === 3 ? '③ 깨지지 않는 바닥 하나 더 찾기' : '✓ 충격량이 같아도 시간이 길면 힘이 작다';
      chip.classList.toggle('done', n === 0);
    }

    const hitPad = (g, p) => Math.abs(p.x - g.PX) < g.PW / 2 + 50 && p.y < g.GY + 30 && p.y > g.TOPY - 40;
    const S = P.make(stage, {
      draw,
      down(p) {
        const g = geo();
        const cd = g.cards.find((k) => p.x > k.x && p.x < k.x + k.w && p.y > k.y && p.y < k.y + k.h);
        if (cd) { if (ph === 'fall' || ph === 'hit') return; drag = { card: cd.k, x: p.x, y: p.y, x0: p.x, y0: p.y }; return; }
        if (!mat) { say('먼저 아래 받침에서 <b>바닥 재료</b>를 끌어 실험대에 깔자.'); return; }
        const cp = g.cup, onCup = Math.hypot(p.x - cp.x, p.y - (cp.y - 40)) < 40, onEgg = ph === 'idle' && (onCup || cur && !cur.broke && Math.hypot(p.x - g.PX, p.y - (g.SY - 22)) < 34);
        if (onEgg || ph === 'done' && onCup) { ph = 'hold'; splat = null; cur = null; drag = { egg: true }; h = Math.max(HMIN, Math.min(HMAX, Math.round((g.SY - 22 - p.y) / g.ky * 10) / 10)); say(`달걀을 들었다. 위아래로 끌어 <b>높이</b>를 정하고 놓자.`); return; }
        if (ph === 'idle' || ph === 'done') say('달걀 받침의 <b>달걀</b>을 잡아 위로 끌어 올리자.');
      },
      move(p) {
        if (!drag) return; const g = geo();
        if (drag.card) { drag.x = p.x; drag.y = p.y; return; }
        if (drag.egg) { h = Math.max(HMIN, Math.min(HMAX, Math.round((g.SY - 22 - p.y) / g.ky * 10) / 10)); }
      },
      up(p) {
        const d = drag; drag = null; if (!d) return; const g = geo();
        if (d.card) { const moved = Math.hypot(p.x - d.x0, p.y - d.y0) > 12; if (!moved || hitPad(g, p)) lay(d.card); else say('재료를 <b>실험대 위</b>(높이 자 옆)까지 끌어다 놓자.'); return; }
        if (d.egg) drop(h);
      },
      key(e) {
        const g = geo(); void g;
        const i = '1234'.indexOf(e.key); if (i >= 0) { lay(ORDER[i]); return true; }
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { if (ph === 'fall' || ph === 'hit') return true; h = Math.max(HMIN, Math.min(HMAX, Math.round((h + (e.key === 'ArrowUp' ? 0.1 : -0.1)) * 10) / 10)); say(`높이 <b>${f1(h)} m</b>. 엔터를 누르면 떨어뜨린다.`); return true; }
        if (e.key === 'Enter' || e.key === ' ') { if (!mat) lay('wood'); drop(h); return true; }
        if (e.key === '0') { reset(); return true; }
        return false;
      },
    });
    root.querySelector('.eg-reset').addEventListener('click', () => { reset(); S.kick(); });

    reset();
    const fin = () => { const g = geo(); if (ph === 'fall') { t = Math.sqrt(2 * cur.h / G); ph = 'hit'; u = 0; } if (ph === 'hit') { step(g, 0); u = 1; if (cur.broke) splat = { k: 1 }; finish(); } };
    root._eg = {
      lay: (k) => { lay(k); S.redraw(); return root._eg.state(); },
      drop: (k, hh) => { if (k && k !== mat) lay(k); drop(hh); fin(); S.redraw(); return root._eg.state(); },
      state: () => ({ mat, ph, h, runs: runs.map((r) => [r.mat, r.h, +r.I.toFixed(3), r.T, Math.round(r.pk), r.broke]), done: root.classList.contains('u-done'), out: out.textContent, chip: chip.textContent }),
      geo: () => { const g = geo(); return { W: g.W, H: g.H, PX: g.PX, SY: g.SY, ky: g.ky, cup: g.cup, cards: g.cards }; },
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Egg = { mount };
})();
