/* 3-2 4차시 체험 «자동차 충돌 시험»(교과서 135쪽 그림 Ⅲ-27 + 참고서 내용: 에어백·범퍼·안전띠, 관성과 안전띠).
   왼쪽: 옆에서 본 충돌 시험장. 차를 잡고 뒤(왼쪽)로 끌었다 놓으면 끈 만큼 빠르기(20~60 km/h)가 정해져 오른쪽 벽으로 달려가 부딪친다.
   위 표지판 셋(에어백 · 범퍼(찌그러지는 앞부분) · 안전띠)을 누르면 켜고 끈다. 충돌 순간부터는 느린 화면.
     범퍼 끔: 앞부분이 단단해 0.12 m만 찌그러지고 차가 순식간에 선다 · 켬: 0.6 m 찌그러지며 차가 멈추는 시간이 길어진다.
     안전띠 끔: 차가 서도 인형은 관성으로 계속 나아가 운전대·앞 유리에 부딪친다 · 켬: 띠가 몸을 붙잡아 차와 함께 멈춘다.
     에어백 켬: 충돌 직후 부풀어 머리를 천천히 받아 낸다(안전띠를 맸으면 약하게 부푼다).
   오른쪽: 인형 머리(5 kg)가 받은 힘–시간 그래프. 이번(빨강)과 지난번(회색 점선)을 겹쳐 그린다. 같은 빠르기면 넓이(충격량 = 머리 질량 × 처음 속도)가 같고 높이(가장 큰 힘)가 다르다.
   모형: 차는 찌그러지는 길이 d 동안 일정하게 감속(v²/2d), 머리는 차 안에서 안전띠·에어백·운전대에 닿으면 용수철·감쇠 힘을 받고, 차 안에서 멈추면 차와 함께 움직인다. 수치는 이해를 돕기 위한 예.
   키보드: 스페이스·엔터 출발, 위·아래 화살표 빠르기, 1 에어백, 2 범퍼, 3 안전띠, 0 처음부터.
   Crash.mount(root) → { fit, setActive } · 시험용: root._cr.set({bag,bump,belt}) · launch(kmh) · finish() · state() */
(function () {
  'use strict';
  const TAU = Math.PI * 2, MH = 5, CARL = 4.4, FZ = 0.75, HARD = 0.40, TEND = 0.2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // ---------- 충돌 계산(충돌 순간 t = 0부터) ----------
  function simulate(v0, cfg) {
    const dc = cfg.bump ? 0.6 : 0.12, ac = v0 * v0 / (2 * dc), dt = 1e-5;
    let xc = 0, vc = v0, xh = 0, vh = v0, t = 0, lock = false, peak = 0, imp = 0, relMax = 0, tHit = null, k = 0;
    const S = [];
    while (t < TEND + 1e-9) {
      vc = Math.max(0, vc - ac * dt); xc += vc * dt;
      const vh0 = vh;
      if (lock) vh = vc;
      else {
        const rel = xh - xc, rv = vh - vc; let a = 0, eng = false;
        if (cfg.belt && rel > 0.03) { a += 600 * (rel - 0.03) + 30 * Math.max(rv, 0); eng = true; }
        if (cfg.bag && t > 0.012 && rel > 0.10) { a += (cfg.belt ? 0.4 : 1) * (1500 * (rel - 0.10) + 40 * Math.max(rv, 0)); eng = true; }
        if (rel > HARD) { a += 8e3 * (rel - HARD) + 150 * Math.max(rv, 0); eng = true; if (tHit == null) tHit = t; }
        vh -= a * dt; if (eng && vh - vc <= 0) { vh = vc; lock = true; }
      }
      xh += vh * dt; relMax = Math.max(relMax, xh - xc);
      const F = MH * Math.max(0, (vh0 - vh) / dt); peak = Math.max(peak, F); imp += F * dt;
      if (k % 50 === 0) S.push({ t, crush: xc, rel: xh - xc, F, vc });
      t += dt; k++;
    }
    // 머리가 멈추는 데 걸린 시간: 힘이 가장 큰 힘의 5 %를 넘는 처음부터 끝까지
    const on = S.filter((s) => s.F > peak * 0.05), dur = on.length ? on[on.length - 1].t - on[0].t : 0;
    return { v0, cfg: { ...cfg }, S, peak, imp, relMax, tHit, dur, crushMax: Math.min(xc, dc) };
  }
  (function () { // 자체 확인: 넓이(충격량)는 장치와 관계없이 m v로 같고, 장치를 켤수록 가장 큰 힘이 작아진다
    const v = 50 / 3.6, a = simulate(v, {}), b = simulate(v, { bag: 1, bump: 1 }), c = simulate(v, { bag: 1, bump: 1, belt: 1 });
    console.assert([a, b, c].every((r) => Math.abs(r.imp - MH * v) < 0.5), 'crash: 넓이 같음');
    console.assert(a.peak > 4 * b.peak && b.peak > c.peak && a.tHit != null && c.tHit == null, 'crash: 높이 다름');
  })();

  function mount(root) {
    const stage = root.querySelector('.cr-stage'), out = root.querySelector('.cr-out'), now = root.querySelector('.cr-now');
    const P = window.Play, txt = P.txt;
    let cfg, ph, pull, carM, run, last, tp, t, drag, msg, ok, hint;
    function reset() { cfg = { bag: false, bump: false, belt: false }; ph = 'ready'; pull = 0; carM = 0; run = null; last = null; tp = 0; t = 0; drag = null; ok = new Set(); hint = 0; out.innerHTML = '차를 잡고 <b>뒤로 끌었다 놓아</b> 벽에 부딪쳐 보자. 끈 만큼 빨라진다.'; steps(); }
    const kmhOf = (px) => Math.round((20 + 40 * clamp(px / 170, 0, 1)) / 5) * 5;
    const say = (h, d) => { if (h !== msg) { msg = h; now.innerHTML = h; now.classList.toggle('done', !!d); } };
    function steps() {
      const n = [1, 2, 3].find((k) => !ok.has(k)) || 0;
      window.L1.steps(root, n, [...ok]); window.L1.done(root, n === 0);
    }
    // ---------- 배치 ----------
    const lay = (W, H) => { const SW = Math.round(W * 0.6), floor = H - 64, ppm = Math.min(SW * 0.78 / CARL, (floor - 120) / 2.2), wallX = SW - 64;
      return { SW, floor, ppm, wallX, rest: wallX - 0.35 * ppm, gx: SW + 24, gy: 74, gw: W - SW - 44, gh: Math.min(H - 290, H * 0.58) }; };
    const signs = (W, H) => { const L = lay(W, H), w = (L.SW - 40) / 3; return [['bag', '에어백'], ['bump', '범퍼(앞부분)'], ['belt', '안전띠']].map(([k, tt], i) => ({ k, t: tt, x: 12 + i * (w + 8), y: 10, w, h: 46 })); };
    // 차의 앞끝(찌그러지기 전) 화면 x
    function noseX(L) {
      if (ph === 'ready' || ph === 'pull') return L.rest - pull;
      if (ph === 'go') return L.rest - carM;
      return L.wallX + sample().crush * L.ppm;
    }
    function sample() {
      if (!run) return { t: 0, crush: 0, rel: 0, F: 0, vc: 0 };
      const S = run.S, i = clamp(Math.floor(tp / (S[1].t - S[0].t)), 0, S.length - 1); return S[i];
    }
    function launch(kmh) {
      if (ph === 'go' || ph === 'hit') return;
      const v0 = kmh / 3.6; if (run) last = run;
      run = simulate(v0, cfg); run.kmh = kmh; tp = 0; ph = 'go'; carM = pull || 0; pull = 0;
      run.from = carM;
    }
    function finish() { // 충돌이 끝났을 때
      ph = 'done';
      const r = run, c = r.cfg, kN = (r.peak / 1000).toFixed(1);
      const a = !c.bag && !c.bump && !c.belt, b = c.bag && c.bump && !c.belt, d = c.bag && c.bump && c.belt;
      if (a) ok.add(1); if (b && ok.has(1)) ok.add(2); if (d && ok.has(2)) ok.add(3); steps();
      const lines = [`<b>${r.kmh} km/h</b> · 가장 큰 힘 <b>${kN} kN</b> · 머리가 멈추는 데 ${Math.round(r.dur * 1000)} ms`];
      lines.push(c.bump ? '범퍼(앞부분)가 길게 찌그러져 차가 <b>천천히</b> 섰다.' : '앞부분이 단단해 차가 순식간에 섰다.');
      lines.push(c.belt ? '안전띠가 몸을 붙잡아 앞으로 튀어 나가지 않았다.' : c.bag ? '안전띠가 없어 몸이 관성으로 튀어 나갔지만 에어백이 머리를 천천히 받았다.' : '안전띠가 없어 몸이 관성으로 튀어 나가 머리가 운전대·앞 유리에 부딪쳤다!');
      if (last && last.kmh === r.kmh) lines.push(`지난번과 넓이(충격량 ${Math.round(r.imp)} N·s)는 같고 높이가 ${last.peak > r.peak * 1.15 ? '낮아졌다' : last.peak * 1.15 < r.peak ? '높아졌다' : '비슷하다'}.`);
      else if (last) lines.push('빠르기가 달라 넓이도 다르다 — 같은 빠르기로 비교하자.');
      out.innerHTML = lines.join('<br>');
    }

    // ---------- 그림: 시험장 ----------
    function hall(c, L, H) {
      let g = c.createLinearGradient(0, 0, 0, L.floor); g.addColorStop(0, '#c9ced4'); g.addColorStop(1, '#e4e6e8'); c.fillStyle = g; c.fillRect(0, 0, L.SW, L.floor);
      c.strokeStyle = 'rgba(80,90,100,.12)'; c.lineWidth = 1; for (let x = 0; x < L.SW; x += 60) { c.beginPath(); c.moveTo(x, 64); c.lineTo(x, L.floor); c.stroke(); }
      // 벽의 기준 눈금(검정·흰 칸)
      for (let i = 0; i < 14; i++) { c.fillStyle = i % 2 ? '#1d2433' : '#fff'; c.fillRect(i * 40, L.floor - 2.45 * L.ppm, 40, 10); }
      // 조명
      for (let x = 70; x < L.SW - 80; x += 160) { P.glow(c, x, 72, 46, 'rgba(255,250,220,.6)'); c.fillStyle = '#f7f3dc'; c.fillRect(x - 22, 64, 44, 6); }
      // 바닥·끄는 줄 레일
      g = c.createLinearGradient(0, L.floor, 0, H); g.addColorStop(0, '#8d9096'); g.addColorStop(1, '#6a6d72'); c.fillStyle = g; c.fillRect(0, L.floor, L.SW, H - L.floor);
      c.fillStyle = '#3e4146'; c.fillRect(0, L.floor + 8, L.wallX, 4);
      for (let x = 20; x < L.wallX; x += 100) { c.fillStyle = '#f2c230'; c.fillRect(x, L.floor + 24, 50, 5); }
      // 벽(콘크리트 + 노랑·검정 줄)
      const wx = L.wallX, wt = L.floor - 2.0 * L.ppm;
      g = c.createLinearGradient(wx, 0, L.SW, 0); g.addColorStop(0, '#a3a7ac'); g.addColorStop(1, '#6e7378'); c.fillStyle = g; c.fillRect(wx, wt, L.SW - wx, L.floor - wt);
      c.save(); c.beginPath(); c.rect(wx, wt, 14, L.floor - wt); c.clip(); for (let y = wt - 20; y < L.floor; y += 24) { c.fillStyle = '#f2c230'; c.beginPath(); c.moveTo(wx, y); c.lineTo(wx + 14, y + 12); c.lineTo(wx + 14, y + 24); c.lineTo(wx, y + 12); c.fill(); c.fillStyle = '#1d2433'; c.beginPath(); c.moveTo(wx, y + 12); c.lineTo(wx + 14, y + 24); c.lineTo(wx + 14, y + 36); c.lineTo(wx, y + 24); c.fill(); } c.restore();
      c.fillStyle = 'rgba(0,0,0,.18)'; for (let y = wt + 30; y < L.floor; y += 44) c.fillRect(wx + 18, y, L.SW - wx - 18, 2);
      txt(c, '벽', wx + (L.SW - wx) / 2 + 6, wt - 10, '#1d2433', '800 20px');
      // 고속 카메라(천장에 매달림, 충돌 지점을 겨눔)
      const kx = L.SW * 0.5, ky = Math.max(130, L.floor - 3.1 * L.ppm);
      c.fillStyle = '#5d636a'; c.fillRect(kx - 3, 64, 6, ky - 64);
      c.save(); c.translate(kx, ky); c.rotate(0.35);
      g = c.createLinearGradient(0, -18, 0, 18); g.addColorStop(0, '#4a5058'); g.addColorStop(1, '#22262b'); c.fillStyle = g; c.beginPath(); c.roundRect(-34, -18, 62, 36, 6); c.fill();
      c.fillStyle = '#16181b'; c.beginPath(); c.roundRect(28, -12, 22, 24, 4); c.fill(); c.fillStyle = '#5b8fc9'; c.beginPath(); c.arc(50, 0, 9, 0, TAU); c.fill(); c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(47, -3, 3, 0, TAU); c.fill();
      c.fillStyle = '#d9483b'; c.beginPath(); c.arc(-24, -8, 4, 0, TAU); c.fill();
      c.restore();
      txt(c, '고속 카메라', kx - 40, ky - 26, '#4a5160', '700 15px', 'right');
    }
    // 과녁 무늬(충돌 시험 표지)
    function target(c, x, y, r) { c.fillStyle = '#f2c230'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.fillStyle = '#1d2433'; c.beginPath(); c.moveTo(x, y); c.arc(x, y, r, 0, Math.PI / 2); c.fill(); c.beginPath(); c.moveTo(x, y); c.arc(x, y, r, Math.PI, Math.PI * 1.5); c.fill(); }
    function car(c, L, s) {
      const ppm = L.ppm, nx = noseX(L), crush = ph === 'hit' || ph === 'done' ? s.crush : 0, frontX = nx - crush * ppm;
      // u: 앞끝에서 뒤로 잰 거리(m) → 화면 x. 앞부분 FZ m는 찌그러진 만큼 짧아진다
      const X = (u) => (u < FZ ? frontX - u / FZ * (FZ - crush) * ppm : nx - u * ppm), Y = (y) => L.floor - y * ppm;
      const sq = crush / FZ;
      // 그림자
      c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse((X(0) + X(CARL)) / 2, L.floor + 4, (X(0) - X(CARL)) / 2, 6, 0, 0, TAU); c.fill();
      // 차체
      let g = c.createLinearGradient(0, Y(1.45), 0, Y(0.2)); g.addColorStop(0, '#f4f6f8'); g.addColorStop(0.5, '#d9dde2'); g.addColorStop(1, '#9aa1a9'); c.fillStyle = g;
      c.beginPath(); c.moveTo(X(0), Y(0.32)); c.lineTo(X(0), Y(0.62)); c.quadraticCurveTo(X(0.05), Y(0.78), X(0.35), Y(0.82));
      // 보닛(찌그러지면 주름)
      const n = 6; for (let i = 1; i <= n; i++) { const u = 0.35 + (FZ + 0.4 - 0.35) * i / n; c.lineTo(X(u), Y(0.86 + 0.02 * i / n + (i % 2 ? 0.1 : -0.02) * sq * (u < FZ ? 1 : 0))); }
      c.lineTo(X(1.3), Y(0.92)); c.lineTo(X(2.0), Y(1.42)); c.lineTo(X(3.2), Y(1.45)); c.quadraticCurveTo(X(3.9), Y(1.42), X(4.25), Y(1.0)); c.lineTo(X(CARL), Y(0.95)); c.lineTo(X(CARL), Y(0.35)); c.lineTo(X(CARL - 0.1), Y(0.25)); c.lineTo(X(0.1), Y(0.25)); c.closePath(); c.fill();
      c.strokeStyle = '#59616b'; c.lineWidth = 2; c.stroke();
      // 앞부분(찌그러지는 구역) 표시
      if (s.cfgBump) { c.save(); c.globalAlpha = 0.5; c.fillStyle = '#f2c230'; c.beginPath(); c.moveTo(X(0.02), Y(0.3)); c.lineTo(X(0.02), Y(0.6)); c.lineTo(X(FZ), Y(0.84)); c.lineTo(X(FZ), Y(0.3)); c.fill(); c.restore();
        c.strokeStyle = '#8a6a10'; c.lineWidth = 1.5; for (let i = 1; i < 6; i++) { const u = FZ * i / 6; c.beginPath(); c.moveTo(X(u), Y(0.32)); c.lineTo(X(u) + (i % 2 ? 4 : -4) * (1 + 3 * sq), Y(0.55)); c.lineTo(X(u), Y(0.78)); c.stroke(); } }
      else { c.fillStyle = 'rgba(60,66,74,.55)'; c.fillRect(X(FZ), Y(0.6), X(0.04) - X(FZ), Y(0.32) - Y(0.6)); c.strokeStyle = '#2b3036'; c.lineWidth = 2; c.strokeRect(X(FZ), Y(0.6), X(0.04) - X(FZ), Y(0.32) - Y(0.6)); }
      // 범퍼
      c.fillStyle = s.cfgBump ? '#3d4450' : '#22262b'; c.beginPath(); c.roundRect(X(0) - 4, Y(0.62), 10 + (s.cfgBump ? 4 : 0), Y(0.3) - Y(0.62), 4); c.fill();
      // 실내(잘라 보기): 창 안
      c.save(); c.beginPath(); c.moveTo(X(1.38), Y(0.95)); c.lineTo(X(2.0), Y(1.37)); c.lineTo(X(3.15), Y(1.4)); c.quadraticCurveTo(X(3.8), Y(1.38), X(4.1), Y(1.0)); c.lineTo(X(4.1), Y(0.42)); c.lineTo(X(1.38), Y(0.42)); c.closePath(); c.clip();
      g = c.createLinearGradient(0, Y(1.4), 0, Y(0.4)); g.addColorStop(0, '#d5dbe2'); g.addColorStop(1, '#a9b0b8'); c.fillStyle = g; c.fillRect(X(4.2), Y(1.5), X(1.3) - X(4.2), Y(0.4) - Y(1.5));
      interior(c, L, X, Y, s);
      c.restore();
      // 앞 유리 테·기둥
      c.strokeStyle = '#4a525c'; c.lineWidth = 5; c.beginPath(); c.moveTo(X(1.38), Y(0.95)); c.lineTo(X(2.0), Y(1.4)); c.stroke();
      c.lineWidth = 6; c.beginPath(); c.moveTo(X(2.85), Y(1.42)); c.lineTo(X(2.85), Y(0.45)); c.stroke();
      if (s.crack) { const cx = X(1.75), cy = Y(1.18); c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 2; for (let k = 0; k < 8; k++) { const a = k * TAU / 8 + 0.3; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a) * 22, cy + Math.sin(a) * 22); c.stroke(); } c.beginPath(); c.arc(cx, cy, 10, 0, TAU); c.stroke(); }
      // 과녁 무늬·바퀴
      target(c, X(2.4), Y(1.32), 7); target(c, X(3.7), Y(1.25), 7);
      [0.85, 3.55].forEach((u) => { const wx = X(u), wy = Y(0.33), r = 0.33 * ppm, rot = (nx / r) % TAU; c.fillStyle = '#17191c'; c.beginPath(); c.arc(wx, wy, r, 0, TAU); c.fill(); c.fillStyle = '#b4bac1'; c.beginPath(); c.arc(wx, wy, r * 0.58, 0, TAU); c.fill(); c.strokeStyle = '#5a6068'; c.lineWidth = 3; for (let k = 0; k < 5; k++) { const a = rot + k * TAU / 5; c.beginPath(); c.moveTo(wx, wy); c.lineTo(wx + Math.cos(a) * r * 0.58, wy + Math.sin(a) * r * 0.58); c.stroke(); } target(c, wx, wy, r * 0.22); });
    }
    function interior(c, L, X, Y, s) {
      const ppm = L.ppm, rel = s.rel, belt = s.cfgBelt;
      // 계기판·운전대
      c.fillStyle = '#3a3f47'; c.beginPath(); c.moveTo(X(1.38), Y(0.95)); c.lineTo(X(1.62), Y(1.02)); c.lineTo(X(1.7), Y(0.7)); c.lineTo(X(1.38), Y(0.6)); c.fill();
      const wc = { x: X(1.78), y: Y(0.98) };
      c.strokeStyle = '#25282d'; c.lineWidth = 6; c.beginPath(); c.moveTo(X(1.6), Y(0.8)); c.lineTo(wc.x, wc.y); c.stroke();
      c.lineWidth = 7; c.beginPath(); c.ellipse(wc.x, wc.y, 5, 0.19 * ppm, -0.55, 0, TAU); c.stroke();
      // 의자
      const hip = { u: 2.45, y: 0.52 };
      c.fillStyle = '#2f343c'; c.beginPath(); c.roundRect(X(hip.u + 0.12), Y(1.22), 0.16 * ppm, 0.72 * ppm, 8); c.fill();
      c.beginPath(); c.roundRect(X(hip.u + 0.15), Y(0.55), 0.62 * ppm, 0.13 * ppm, 6); c.fill();
      // 인형: 몸이 앞으로 쏠린 만큼(머리 rel) — 안전띠를 맸으면 엉덩이는 거의 그대로
      const hipRel = belt ? Math.min(rel * 0.12, 0.03) : rel * 0.55, Lt = 0.58, s0 = Math.sin(-0.18);
      const sn = clamp(s0 + (rel - hipRel) / Lt, -0.9, 0.97), th = Math.asin(sn);
      const hx = X(hip.u - hipRel), hy = Y(hip.y), sx = hx + Math.sin(th) * Lt * 0.78 * ppm, sy = hy - Math.cos(th) * Lt * 0.78 * ppm, hdx = hx + Math.sin(th) * Lt * ppm, hdy = hy - Math.cos(th) * Lt * ppm - 0.1 * ppm;
      const skin = '#f0c43c', dark = '#3a3f47';
      c.lineCap = 'round';
      // 다리
      c.strokeStyle = '#d9a92a'; c.lineWidth = 0.15 * ppm; c.beginPath(); c.moveTo(hx, hy); c.lineTo(X(1.95 - hipRel * 0.4), Y(0.6)); c.lineTo(X(1.7 - hipRel * 0.2), Y(0.28)); c.stroke();
      // 몸통
      const tg = c.createLinearGradient(hx - 20, 0, hx + 20, 0); tg.addColorStop(0, '#d9a92a'); tg.addColorStop(1, skin); c.strokeStyle = tg; c.lineWidth = 0.26 * ppm; c.beginPath(); c.moveTo(hx, hy - 0.05 * ppm); c.lineTo(sx, sy); c.stroke();
      // 팔(운전대로)
      c.strokeStyle = '#d9a92a'; c.lineWidth = 0.09 * ppm; c.beginPath(); c.moveTo(sx, sy); c.lineTo((sx + wc.x) / 2, Math.max(sy, wc.y) + 0.06 * ppm); c.lineTo(wc.x + 4, wc.y - 0.05 * ppm); c.stroke();
      // 목·머리
      c.strokeStyle = dark; c.lineWidth = 0.07 * ppm; c.beginPath(); c.moveTo(sx, sy); c.lineTo(hdx, hdy + 0.06 * ppm); c.stroke();
      const hr = 0.115 * ppm, hg = c.createRadialGradient(hdx - hr * 0.3, hdy - hr * 0.3, 1, hdx, hdy, hr); hg.addColorStop(0, '#ffe58a'); hg.addColorStop(1, '#d9a92a'); c.fillStyle = hg; c.beginPath(); c.arc(hdx, hdy, hr, 0, TAU); c.fill();
      target(c, hdx - hr * 0.1, hdy - hr * 0.05, hr * 0.42);
      if (s.F > 200) P.glow(c, hdx, hdy, hr * (1.4 + Math.min(2, s.F / 4000)), `rgba(217,72,59,${Math.min(0.85, 0.25 + s.F / 8000)})`);
      // 안전띠
      if (belt) { c.strokeStyle = '#2b2f36'; c.lineWidth = 0.05 * ppm; c.beginPath(); c.moveTo(X(hip.u + 0.12), Y(1.1)); c.lineTo(sx + 2, sy + 4); c.lineTo(hx - 0.1 * ppm, hy - 0.04 * ppm); c.stroke(); c.beginPath(); c.moveTo(hx - 0.14 * ppm, hy - 0.04 * ppm); c.lineTo(hx + 0.18 * ppm, hy - 0.02 * ppm); c.stroke(); }
      // 에어백(운전대에서 부풂, 머리에 눌리면 납작)
      if (s.bagR > 0) { const r = s.bagR * 0.24 * ppm, press = Math.max(0, rel - 0.1) * ppm * 0.8, ax = wc.x - r * 0.9 + press * 0.3; const bg = c.createRadialGradient(ax - r * 0.3, wc.y - r * 0.3, 2, ax, wc.y, r); bg.addColorStop(0, '#ffffff'); bg.addColorStop(1, '#d6d9dd'); c.fillStyle = bg; c.beginPath(); c.ellipse(ax, wc.y - 0.04 * ppm, Math.max(r * 0.35, r - press * 0.5), r * 1.15, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(0,0,0,.25)'; c.lineWidth = 1.5; c.stroke(); }
    }
    // ---------- 그래프 ----------
    function graph(c, L, H) {
      const { gx, gy, gw, gh } = L, x0 = gx + 52, y0 = gy + gh, w = gw - 64, h = gh - 28;
      c.fillStyle = '#fbfaf5'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.roundRect(gx, gy - 46, gw, gh + 196, 12); c.fill(); c.stroke();
      txt(c, '인형 머리가 받은 힘', gx + 14, gy - 20, '#1d2433', '800 20px', 'left');
      const runs = [last, run].filter(Boolean), top = Math.max(1000, ...runs.map((r) => r.peak)) * 1.12;
      const step = top > 8000 ? 2000 : top > 3000 ? 1000 : 500;
      const X = (tt) => x0 + tt / TEND * w, Y = (F) => y0 - F / top * h;
      c.font = '600 14px "IBM Plex Mono", monospace'; c.textAlign = 'right';
      for (let F = 0; F <= top; F += step) { c.strokeStyle = 'rgba(29,36,51,.12)'; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, Y(F)); c.lineTo(x0 + w, Y(F)); c.stroke(); c.fillStyle = '#4a5160'; c.fillText((F / 1000).toFixed(F % 1000 ? 1 : 0), x0 - 6, Y(F) + 5); }
      c.textAlign = 'center'; for (let tt = 0; tt <= TEND + 1e-9; tt += 0.05) { c.fillStyle = '#4a5160'; c.fillText(String(Math.round(tt * 1000)), X(tt), y0 + 18); }
      c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, y0 - h - 6); c.lineTo(x0, y0); c.lineTo(x0 + w + 6, y0); c.stroke();
      txt(c, 'kN', x0 - 6, y0 - h - 10, '#4a5160', '700 14px', 'right'); txt(c, '충돌 뒤 시간(ms)', x0 + w, y0 + 38, '#4a5160', '700 14px', 'right');
      const curve = (r, until, col, fill, dash) => {
        const pts = r.S.filter((s) => s.t <= until); if (pts.length < 2) return;
        c.beginPath(); c.moveTo(X(0), Y(0)); pts.forEach((s) => c.lineTo(X(s.t), Y(s.F))); c.lineTo(X(pts[pts.length - 1].t), Y(0)); c.closePath(); c.fillStyle = fill; c.fill();
        c.setLineDash(dash || []); c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); pts.forEach((s, i) => (i ? c.lineTo(X(s.t), Y(s.F)) : c.moveTo(X(s.t), Y(s.F)))); c.stroke(); c.setLineDash([]);
      };
      if (last) curve(last, TEND, '#7d8591', 'rgba(125,133,145,.18)', [7, 5]);
      if (run && (ph === 'hit' || ph === 'done')) curve(run, ph === 'done' ? TEND : sample().t, '#d9483b', 'rgba(217,72,59,.22)');
      // 범례·수치
      let ly = y0 + 62;
      const row = (r, col, name, dash) => {
        c.strokeStyle = col; c.lineWidth = 3; c.setLineDash(dash || []); c.beginPath(); c.moveTo(gx + 14, ly - 6); c.lineTo(gx + 44, ly - 6); c.stroke(); c.setLineDash([]);
        const c3 = r.cfg, dev = [c3.bag && '에어백', c3.bump && '범퍼', c3.belt && '안전띠'].filter(Boolean).join(' · ') || '장치 없음';
        txt(c, `${name} ${r.kmh} km/h`, gx + 52, ly, '#1d2433', '800 16px', 'left');
        txt(c, `가장 큰 힘 ${(r.peak / 1000).toFixed(1)} kN`, gx + gw - 12, ly, col === '#d9483b' ? '#b0301f' : '#4a5160', '800 16px', 'right');
        txt(c, dev, gx + 52, ly + 20, '#4a5160', '600 15px', 'left');
        ly += 46;
      };
      if (run && ph === 'done') row(run, '#d9483b', '이번');
      if (last) row(last, '#7d8591', '지난번', [7, 5]);
      if (!run) txt(c, '넓이 = 충격량 · 높이 = 힘', gx + gw / 2, y0 - h / 2, '#7d8591', '700 17px');
    }
    // ---------- 표지판·끌기 안내 ----------
    function ui(c, L, W, H) {
      signs(W, H).forEach((sg) => { const on = cfg[sg.k], lock = ph === 'go' || ph === 'hit';
        c.fillStyle = on ? '#ffd84d' : '#f3ead7'; c.strokeStyle = '#1d2433'; c.lineWidth = on ? 3 : 2; c.globalAlpha = lock ? 0.6 : 1; c.beginPath(); c.roundRect(sg.x, sg.y, sg.w, sg.h, 10); c.fill(); c.stroke();
        c.fillStyle = on ? '#2f8a4a' : '#9aa0a8'; c.beginPath(); c.arc(sg.x + 22, sg.y + sg.h / 2, 9, 0, TAU); c.fill();
        txt(c, sg.t, sg.x + 38, sg.y + 30, '#1d2433', '800 19px', 'left'); txt(c, on ? '켬' : '끔', sg.x + sg.w - 12, sg.y + 30, on ? '#1f6a3d' : '#7d8591', '800 18px', 'right'); c.globalAlpha = 1; });
      const nx = noseX(L), cy = L.floor - 0.8 * L.ppm;
      if (ph === 'ready' || ph === 'pull' || ph === 'done') {
        const kmh = kmhOf(pull);
        if (ph === 'pull') { // 끄는 줄
          c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.setLineDash([6, 5]); c.beginPath(); c.moveTo(nx - CARL * L.ppm, L.floor - 0.4 * L.ppm); c.lineTo(8, L.floor - 0.4 * L.ppm); c.stroke(); c.setLineDash([]);
          c.fillStyle = 'rgba(29,36,51,.88)'; c.beginPath(); c.roundRect(nx - 2.6 * L.ppm, L.floor - 2.05 * L.ppm, 150, 38, 19); c.fill(); txt(c, `${kmh} km/h`, nx - 2.6 * L.ppm + 75, L.floor - 2.05 * L.ppm + 27, '#ffd84d', '800 22px');
        } else if (ph === 'ready') { const b = 6 * Math.sin(t * 4); c.strokeStyle = 'rgba(29,36,51,.85)'; c.lineWidth = 5; c.lineCap = 'round'; const ax = nx - 2.3 * L.ppm + b; c.beginPath(); c.moveTo(ax, cy - 1.0 * L.ppm); c.lineTo(ax - 50, cy - 1.0 * L.ppm); c.moveTo(ax - 38, cy - 1.0 * L.ppm - 12); c.lineTo(ax - 50, cy - 1.0 * L.ppm); c.lineTo(ax - 38, cy - 1.0 * L.ppm + 12); c.stroke(); txt(c, '끌었다 놓기', ax + 8, cy - 1.0 * L.ppm + 7, '#1d2433', '800 19px', 'left'); }
      }
      if (ph === 'hit') { c.fillStyle = 'rgba(255,251,230,.94)'; c.beginPath(); c.roundRect(L.SW - 200, 66, 186, 34, 17); c.fill(); txt(c, '느린 화면 1/25', L.SW - 107, 90, '#5a3a1a', '800 18px'); }
    }

    reset();
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const L = lay(W, H);
        if (ph === 'go') { carM -= run.v0 * L.ppm * dt * 0.35; if (L.rest - carM >= L.wallX) { ph = 'hit'; tp = 0; } }
        else if (ph === 'hit') { tp += dt / 25; if (tp >= TEND) { tp = TEND; finish(); } }
        const s0 = sample(), s = Object.assign({}, s0, { cfgBump: run && ph !== 'ready' && ph !== 'pull' ? run.cfg.bump : cfg.bump, cfgBelt: run && ph !== 'ready' && ph !== 'pull' ? run.cfg.belt : cfg.belt });
        if (ph === 'ready' || ph === 'pull' || ph === 'go') { s.rel = 0; s.F = 0; s.crush = 0; }
        const bagOn = run && (ph === 'hit' || ph === 'done') ? run.cfg.bag : false;
        s.bagR = bagOn ? clamp((s.t - 0.002) / 0.012, 0, 1) : 0;
        s.crack = run && (ph === 'hit' || ph === 'done') && run.tHit != null && s.t >= run.tHit;
        hall(c, L, H); car(c, L, s); ui(c, L, W, H);
        c.fillStyle = '#1d2433'; c.fillRect(L.SW, 0, W - L.SW, H); c.fillStyle = '#efe9dc'; c.fillRect(L.SW + 4, 0, W - L.SW - 4, H);
        graph(c, L, H);
        if (ph === 'hit') say(s.F > 100 ? '머리가 힘을 받는 중' : run.cfg.belt ? '안전띠가 몸을 붙잡는다' : '몸이 관성으로 앞으로!');
        else if (ph === 'go') say('벽으로 달려간다');
        else if (ph === 'done') say(ok.size === 3 ? '같은 충격량, 더 긴 시간 → <b>더 작은 힘</b>' : '표지판을 바꾸고 같은 빠르기로 다시', ok.size === 3);
        else say(ph === 'pull' ? '놓으면 출발' : '차를 뒤로 끌었다 놓자');
      },
      down(p) {
        const sg = signs(S.W, S.H).find((q) => p.x >= q.x && p.x <= q.x + q.w && p.y >= q.y && p.y <= q.y + q.h + 6);
        if (sg) { if (ph !== 'go' && ph !== 'hit') { cfg[sg.k] = !cfg[sg.k]; if (ph === 'done') { ph = 'ready'; pull = 0; } } return; }
        if (ph === 'go' || ph === 'hit') return;
        const L = lay(S.W, S.H), nx = noseX(L);
        if (p.x < L.SW && p.x > nx - CARL * L.ppm - 30 && p.x < nx + 30 && p.y > L.floor - 1.7 * L.ppm && p.y < L.floor + 20) { if (ph === 'done') { ph = 'ready'; pull = 0; } drag = { x0: p.x }; ph = 'pull'; }
        else if (ph === 'done' && p.x < L.SW) { ph = 'ready'; pull = 0; }
      },
      move(p) { if (drag) pull = clamp(drag.x0 - p.x, 0, 170); },
      up() { if (!drag) return; drag = null; if (pull > 12) launch(kmhOf(pull)); else { ph = 'ready'; pull = 0; } },
      key(e) {
        const k = e.key;
        if (k === ' ' || k === 'Enter') { if (ph !== 'go' && ph !== 'hit') launch(kmhOf(pull || 128)); return true; }
        if (k === 'ArrowUp' || k === 'ArrowDown') { if (ph === 'go' || ph === 'hit') return true; if (ph === 'done') ph = 'ready'; pull = clamp((pull || 128) + (k === 'ArrowUp' ? 21.25 : -21.25), 0, 170); ph = 'pull'; return true; }
        const m = { 1: 'bag', 2: 'bump', 3: 'belt' }[k]; if (m) { if (ph !== 'go' && ph !== 'hit') { cfg[m] = !cfg[m]; if (ph === 'done') ph = 'ready'; } return true; }
        if (k === '0') { reset(); return true; } return false;
      },
    });
    root.querySelector('.cr-reset').addEventListener('click', () => { reset(); S.kick(); });
    const state = () => ({ ph, cfg: { ...cfg }, ok: [...ok], run: run && { kmh: run.kmh, peak: Math.round(run.peak), imp: +run.imp.toFixed(1), dur: +run.dur.toFixed(3), relMax: +run.relMax.toFixed(2), hit: run.tHit != null }, last: last && { kmh: last.kmh, peak: Math.round(last.peak) }, done: root.classList.contains('u-done') });
    root._cr = {
      set: (o) => { Object.assign(cfg, o); if (ph === 'done') ph = 'ready'; S.kick(); return state(); },
      launch: (kmh = 50) => { launch(kmh); S.kick(); return state(); },
      finish: () => { if (ph === 'go') { ph = 'hit'; } if (ph === 'hit') { tp = TEND; finish(); } S.kick(); return state(); },
      lay: () => { const L = lay(S.W, S.H); return { ...L, nose: noseX(L) }; },
      state,
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Crash = { mount };
})();
