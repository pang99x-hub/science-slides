/* 3-2 2차시 체험 «동시 낙하 장치»(교과서 126~127쪽 탐구 · 참고서 161쪽 탐구 자료창 표).
   모눈 눈금판 앞 위쪽에 동시 낙하 장치(망치 · 고정대 · 공 A·B), 바닥에 받침 스펀지, 오른쪽에 삼각대 위 스마트 기기.
   ① 망치 머리를 끌어 들어 올렸다 놓으면 망치가 내려와 고정대를 때려 밀어내고, A는 받침이 빠져 그대로 떨어지고 B는 수평으로 튀어 나간다.
      동영상을 한 장으로 바꾼 사진처럼 0.1초마다 두 공의 잔상이 눈금판에 남고(느린 화면 ×1/5), 오른쪽 표가 칸마다 채워진다.
   ② 잔상을 누르면 그 순간 A와 B를 잇는 수평 점선 → 높이가 같다.
   ③ 표의 줄을 누르면 수평 구간 거리(일정)와 두 공의 연직 구간 거리(같음)를 견준다.
   숫자는 공기 저항을 뺀 계산값(B의 수평 속력 1.5 m/s, 낙하 높이 122.5 cm — 이해를 돕기 위한 예).
   Launcher.mount(root) → { fit, setActive } · 시험용: root._lc.launch() · pick(1~5) · cmp('h'|'v') · state() · geo() */
(function () {
  'use strict';
  const TAU = Math.PI * 2, G = 980, DT = 0.1, N = 5, SLOW = 5, VB = 150, AX = 12, BX0 = 21, RC = 3, HL = 18;
  const ay = (t) => 0.5 * G * t * t;                             // 떨어진 거리(cm)
  const bx = (t) => BX0 + VB * t;                                // B의 수평 위치(cm)
  const LAND = ay(N * DT);                                       // 122.5 cm
  const f1 = (x) => (Math.round(x * 10) / 10).toFixed(1);
  const gapV = (i) => ay(i * DT) - ay((i - 1) * DT), gapH = () => VB * DT;
  // 자체 확인: 연직 4.9·14.7·24.5·34.3·44.1 cm, 수평 15.0 cm, 0.5초에 바닥
  console.assert([1, 2, 3, 4, 5].map((i) => f1(gapV(i))).join() === '4.9,14.7,24.5,34.3,44.1' && f1(gapH()) === '15.0' && f1(LAND) === '122.5', 'launcher: 구간 거리');

  function mount(root) {
    const stage = root.querySelector('.lc-stage'), now = root.querySelector('.lc-now'), out = root.querySelector('.lc-out');
    const tab = root.querySelector('.lc-tab'), rows = [...tab.querySelectorAll('tbody tr[data-k]')];
    const P = window.Play;
    let ph, th, om, bar, t, shots, picks, cmp, clock, msg, hint, bg = null, bgKey = '';

    function reset() {
      ph = 'idle'; th = 0; om = 0; bar = 0; t = 0; shots = 0; picks = []; cmp = new Set(); clock = 0; msg = ''; hint = 1;
      rows.forEach((r) => { r.classList.remove('on'); [...r.querySelectorAll('td')].forEach((td) => { td.textContent = ''; }); });
      say('동시 낙하 장치의 <b>망치</b> 머리를 왼쪽 위로 끌어 들어 올렸다가 <b>놓아</b> 보자.');
      steps();
    }
    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };

    // ── 자리 잡기: 눈금판 1 cm = k px ──
    const geo = () => {
      const W = S.W, H = S.H, k = Math.min((H - 30) / 160, (W - 330) / 106), Y0 = 27 * k + 8, X0 = 58;
      const X = (cm) => X0 + cm * k, Y = (cm) => Y0 + cm * k;
      const ix = X(100) + 46, iw = W - ix - 18, is = iw / 40, ins = { x: ix, y: 104, w: iw, h: is * 36 };
      const view = (ox, oy, s, big) => ({ ox, oy, s, big, piv: { x: ox + 4 * s, y: oy - HL * s } });
      const vm = view(X(0), Y(0), k, false), vi = view(ix + 13 * is, ins.y + 25.5 * is, is, true);
      return { W, H, k, X, Y, R: RC * k, piv: vm.piv, vm, vi, ins, PX: (X(100) + W) / 2 + 10, PY: ins.y + ins.h + 112 };
    };
    const head = (o, a) => ({ x: o.piv.x - Math.sin(a) * HL * o.s, y: o.piv.y + Math.cos(a) * HL * o.s });

    // ── 그림 ──
    const COL = { A: ['#d8ecff', '#4d93d9', '#1d5ea8', '#0d2f5c'], B: ['#ffe6cf', '#f08a3c', '#c4520f', '#6b2a05'] };
    function ball(c, x, y, R, who, a = 1) {
      const q = COL[who]; c.save(); c.globalAlpha = a;
      const g = c.createRadialGradient(x - R * 0.4, y - R * 0.45, R * 0.1, x, y, R);
      g.addColorStop(0, q[0]); g.addColorStop(0.4, q[1]); g.addColorStop(0.85, q[2]); g.addColorStop(1, q[3]);
      c.fillStyle = g; c.beginPath(); c.arc(x, y, R, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(20,25,35,.7)'; c.lineWidth = 1.2; c.stroke();
      c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(x - R * 0.38, y - R * 0.42, R * 0.3, R * 0.17, -0.6, 0, TAU); c.fill();
      c.restore();
    }
    function tag(c, x, y, s, col) {
      c.font = '700 17px "IBM Plex Sans KR", sans-serif'; const w = c.measureText(s).width + 14;
      c.fillStyle = col; c.beginPath(); c.roundRect(x - w / 2, y - 14, w, 24, 12); c.fill();
      P.txt(c, s, x, y + 4, '#fff', '700 17px');
    }

    function paintBg(g) {
      const { W, H, X, Y, k, PX } = g;
      const k2 = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const cv = document.createElement('canvas'); cv.width = W * k2; cv.height = H * k2;
      const c = cv.getContext('2d'); c.setTransform(k2, 0, 0, k2, 0, 0);
      // 과학실 벽(옅은 회청색 페인트 + 아래 걸레받이)
      const wall = c.createLinearGradient(0, 0, 0, H); wall.addColorStop(0, '#dfe5e8'); wall.addColorStop(1, '#c9d1d5'); c.fillStyle = wall; c.fillRect(0, 0, W, H);
      for (let i = 0; i < 1200; i++) { c.fillStyle = `rgba(80,90,100,${0.02 + (i % 4) * 0.008})`; c.fillRect(((i * 397) % 1009) / 1009 * W, ((i * 211) % 997) / 997 * H, 1.4, 1.4); }
      const fy = Y(131);
      const fl = c.createLinearGradient(0, fy, 0, H); fl.addColorStop(0, '#a98b67'); fl.addColorStop(1, '#7c6346'); c.fillStyle = fl; c.fillRect(0, fy, W, H - fy);
      c.strokeStyle = 'rgba(60,40,20,.35)'; for (let x = 10; x < W; x += 70) { c.beginPath(); c.moveTo(x, fy); c.lineTo(x - 18, H); c.stroke(); }
      // 눈금판(흰 판 + 모눈): 그림자 → 판 → 5 cm 칸 → 10 cm 굵은 선
      const L = X(-1), R = X(101), T = Y(-6), B = Y(131);
      c.fillStyle = 'rgba(0,0,0,.18)'; c.fillRect(L + 6, T + 6, R - L, B - T);
      c.fillStyle = '#fbfcfa'; c.fillRect(L, T, R - L, B - T);
      c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.strokeRect(L, T, R - L, B - T);
      for (let v = 0; v <= 130; v += 5) { c.strokeStyle = v % 10 ? 'rgba(29,36,51,.28)' : 'rgba(29,36,51,.6)'; c.lineWidth = v % 10 ? 0.8 : 1.3; c.beginPath(); c.moveTo(X(0), Y(v)); c.lineTo(X(100), Y(v)); c.stroke(); }
      for (let h = 0; h <= 100; h += 5) { c.strokeStyle = h % 10 ? 'rgba(29,36,51,.28)' : 'rgba(29,36,51,.6)'; c.lineWidth = h % 10 ? 0.8 : 1.3; c.beginPath(); c.moveTo(X(h), Y(0)); c.lineTo(X(h), Y(130)); c.stroke(); }
      for (let h = 30; h <= 100; h += 10) P.txt(c, String(h), X(h), Y(-1.6), '#1d2433', '700 15px');
      for (let v = 10; v <= 120; v += 10) P.txt(c, String(v), X(-1.8), Y(v) + 5, '#1d2433', '700 15px', 'right');
      P.txt(c, '눈금판 (cm)', X(100), Y(-3.6) - 10, '#1d2433', '700 17px', 'right');
      // 받침 스펀지
      const sy = Y(LAND + RC);
      const sp = c.createLinearGradient(0, sy, 0, B); sp.addColorStop(0, '#f2d35a'); sp.addColorStop(1, '#c79a1c');
      c.fillStyle = sp; c.beginPath(); c.roundRect(X(-0.5), sy, X(100.5) - X(-0.5), B - sy, 4); c.fill();
      for (let i = 0; i < 120; i++) { c.fillStyle = 'rgba(120,80,10,.25)'; c.beginPath(); c.arc(X(0) + ((i * 37) % 100) / 100 * (X(100) - X(0)), sy + 3 + ((i * 13) % 100) / 100 * Math.max(2, B - sy - 6), 1.3, 0, TAU); c.fill(); }
      P.txt(c, '받침 스펀지', X(50), B + 22, '#3a2a1d', '700 17px');
      // 삼각대 위 스마트 기기
      const tx = PX, ty = g.PY;
      c.strokeStyle = '#3a3f47'; c.lineWidth = 4; [-44, 0, 44].forEach((dx) => { c.beginPath(); c.moveTo(tx, ty + 70); c.lineTo(tx + dx, H - 8); c.stroke(); });
      c.fillStyle = '#2b2f36'; c.fillRect(tx - 7, ty + 60, 14, 22);
      c.fillStyle = '#16191f'; c.beginPath(); c.roundRect(tx - 58, ty - 74, 116, 148, 12); c.fill();
      c.strokeStyle = '#59606b'; c.lineWidth = 2; c.stroke();
      P.txt(c, '스마트 기기로 동영상 촬영', tx, ty - 86, '#1d2433', '700 17px');
      return cv;
    }

    function draw(c, W, H, dt) {
      if (!W) return;
      const g = geo(); clock += dt;
      const key = W + 'x' + H; if (key !== bgKey) { bg = paintBg(g); bgKey = key; }
      c.clearRect(0, 0, W, H); c.drawImage(bg, 0, 0, W, H);
      const { X, Y, R, PX } = g;
      // 망치 흔들기 → 고정대 치기
      if (ph === 'swing') {
        om -= 42 * Math.sin(th) * dt; th += om * dt;
        if (th <= 0) {
          if (strong) { th = 0; om = 0; hit(); }
          else { th = -th * 0.5; om = -om * 0.4; if (Math.abs(om) < 0.3) { th = 0; om = 0; ph = 'idle'; say('살짝 건드려서는 고정대가 밀리지 않는다. 망치를 <b>더 높이</b> 들어 올렸다 놓자.'); } }
        }
      }
      if (ph === 'fall') {
        bar = Math.min(6, bar + dt * 60);
        const t1 = Math.min(N * DT, t + dt / SLOW);
        for (let i = 1; i <= N; i++) if (t < i * DT - 1e-9 && t1 >= i * DT - 1e-9) stamp(i);
        t = t1;
        if (t >= N * DT) { ph = 'photo'; say('두 공이 <b>동시에</b> 스펀지에 닿았다. 잔상 하나를 눌러 그 순간 A와 B의 <b>높이</b>를 견주어 보자.'); steps(); }
      }
      // 잔상(사진으로 바꾼 장면)
      for (let i = 0; i < shots; i++) {
        const y = Y(ay(i * DT)), a = i === 0 ? 0.5 : 0.82 + 0.06 * Math.sin(clock * 2 + i);
        ball(c, X(AX), y, R, 'A', a); ball(c, X(bx(i * DT)), y, R, 'B', a);
        if (i) {
          c.font = '700 15px "IBM Plex Sans KR", sans-serif';
          const s = `${f1(i * DT)} s`, w = c.measureText(s).width + 10, lx = X(AX) - R - 4 - w;
          c.fillStyle = 'rgba(29,36,51,.86)'; c.beginPath(); c.roundRect(lx, y - 11, w, 22, 6); c.fill();
          P.txt(c, s, lx + w / 2, y + 5, '#fff', '700 15px');
        }
      }
      // 견준 높이: 수평 점선(누른 순간들)
      picks.forEach((i, n) => {
        const y = Y(ay(i * DT)), last = n === picks.length - 1, xa = X(AX), xb = X(bx(i * DT));
        c.save(); c.setLineDash([8, 6]); c.lineDashOffset = -clock * 16; c.strokeStyle = last ? '#d9483b' : 'rgba(217,72,59,.55)'; c.lineWidth = last ? 3 : 2;
        c.beginPath(); c.moveTo(X(0), y); c.lineTo(X(100), y); c.stroke(); c.restore();
        P.txt(c, `${f1(ay(i * DT))} cm`, xa + R + 6, y - 6, '#b8321f', '800 16px', 'left');
        if (last) { c.save(); c.globalAlpha = 0.9 + 0.1 * Math.sin(clock * 4); tag(c, (xa + xb) / 2, y - R - 16, 'A와 B 높이 같다', '#d9483b'); c.restore(); }
      });
      // 표에서 고른 비교를 눈금판에도
      if (cmp.has('h') && shots > N) {
        for (let i = 1; i <= N; i++) {
          const x0 = X(bx((i - 1) * DT)), x1 = X(bx(i * DT)), y = Y(LAND + RC) + 7;
          c.strokeStyle = '#c4520f'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x0 + 2, y); c.lineTo(x1 - 2, y); c.moveTo(x0 + 2, y - 5); c.lineTo(x0 + 2, y + 5); c.moveTo(x1 - 2, y - 5); c.lineTo(x1 - 2, y + 5); c.stroke();
          c.save(); c.setLineDash([3, 4]); c.strokeStyle = 'rgba(196,82,15,.5)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x1, Y(ay(i * DT)) + R); c.lineTo(x1, y - 5); c.stroke(); c.restore();
          P.txt(c, '15', (x0 + x1) / 2, y + 17, '#6b2a05', '800 14px');
        }
      }
      if (cmp.has('v') && shots > N) {
        for (let i = 1; i <= N; i++) { const y = Y(ay(i * DT)); c.save(); c.setLineDash([3, 4]); c.strokeStyle = 'rgba(29,94,168,.6)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(X(AX) + R, y); c.lineTo(X(bx(i * DT)) - R, y); c.stroke(); c.restore(); }
      }
      // 장치(눈금판 위 실제 크기) + 오른쪽 위 확대 창
      dev(c, g.vm, g);
      const iv = g.vi, I = g.ins;
      c.save(); c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.roundRect(I.x + 5, I.y + 5, I.w, I.h, 12); c.fill();
      c.fillStyle = '#eef2f4'; c.beginPath(); c.roundRect(I.x, I.y, I.w, I.h, 12); c.fill(); c.clip();
      for (let gx = I.x; gx < I.x + I.w; gx += iv.s * 5) { c.strokeStyle = 'rgba(29,36,51,.12)'; c.lineWidth = 1; c.beginPath(); c.moveTo(gx, I.y); c.lineTo(gx, I.y + I.h); c.stroke(); }
      dev(c, iv, g); c.restore();
      c.strokeStyle = '#1d2433'; c.lineWidth = 2.5; c.beginPath(); c.roundRect(I.x, I.y, I.w, I.h, 12); c.stroke();
      P.txt(c, '확대해 본 동시 낙하 장치', I.x + 10, I.y - 10, '#1d2433', '700 17px', 'left');
      if (ph === 'idle') {
        [g.vm, iv].forEach((o) => { const hd = head(o, th); c.save(); c.setLineDash([7, 6]); c.lineDashOffset = -clock * 18; c.strokeStyle = '#e0a400'; c.lineWidth = 3; c.beginPath(); c.arc(hd.x, hd.y, 4.4 * o.s + 4 + Math.sin(clock * 3) * 2, 0, TAU); c.stroke(); c.restore(); });
        const hd = head(iv, th), b = Math.abs(Math.sin(clock * 2.4)) * 10;
        if (hint) arrow(c, hd.x - 30 - b, hd.y - 34 - b);
      }
      if (ph === 'lift') { const hd = head(iv, th); P.txt(c, `${Math.round(th * 180 / Math.PI)}°`, hd.x + 3.4 * iv.s, hd.y - 2.6 * iv.s, th > 0.6 ? '#2f9e5b' : '#b8321f', '800 20px', 'left'); }
      // 스마트 기기 화면
      const tx = PX, ty = g.PY, rec = ph === 'fall';
      c.fillStyle = rec ? '#1f2b3d' : '#141922'; c.fillRect(tx - 50, ty - 66, 100, 132);
      const ms = 0.75;
      for (let i = 0; i < shots; i++) { const yy = ty - 56 + ay(i * DT) * ms * 0.85, xa = tx - 40 + AX * ms * 0.9, xb = tx - 40 + bx(i * DT) * ms * 0.9; c.fillStyle = '#4d93d9'; c.beginPath(); c.arc(xa, yy, 2.6, 0, TAU); c.fill(); c.fillStyle = '#f08a3c'; c.beginPath(); c.arc(xb, yy, 2.6, 0, TAU); c.fill(); }
      if (rec && Math.sin(clock * 8) > 0) { c.fillStyle = '#ff4b3e'; c.beginPath(); c.arc(tx + 38, ty - 54, 5, 0, TAU); c.fill(); }
      if (ph === 'photo') P.txt(c, '한 장으로', tx, ty + 60, '#cfd6e2', '700 13px');
    }

    // 동시 낙하 장치: o = { ox, oy, s(px/cm), big } 에 그린다(눈금판 위 · 확대 창 둘 다)
    function dev(c, o, g) {
      const p = (x, y) => [o.ox + x * o.s, o.oy + y * o.s], s = o.s;
      const [hx0, hy0] = p(-3, -HL - 5), [hx1, hy1] = p(27, -RC - 1.2);
      const mt = c.createLinearGradient(hx0, 0, hx1, 0); mt.addColorStop(0, '#2b2f36'); mt.addColorStop(0.5, '#4a515c'); mt.addColorStop(1, '#22262c');
      c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(hx0 + 4, hy0 + 4, hx1 - hx0, hy1 - hy0);
      c.fillStyle = mt; c.beginPath(); c.roundRect(hx0, hy0, hx1 - hx0, hy1 - hy0, Math.max(4, s)); c.fill();
      const sc = Math.max(2.5, s * 0.5); c.fillStyle = '#b9bec6'; [[hx0 + sc * 2.5, hy0 + sc * 2.5], [hx1 - sc * 2.5, hy0 + sc * 2.5], [hx0 + sc * 2.5, hy1 - sc * 2.5], [hx1 - sc * 2.5, hy1 - sc * 2.5]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, sc, 0, TAU); c.fill(); });
      c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 1;
      for (let d = 0; d <= 90; d += 15) { const a = d * Math.PI / 180; c.beginPath(); c.moveTo(o.piv.x - Math.sin(a) * HL * s * 0.8, o.piv.y + Math.cos(a) * HL * s * 0.8); c.lineTo(o.piv.x - Math.sin(a) * HL * s * 0.92, o.piv.y + Math.cos(a) * HL * s * 0.92); c.stroke(); }
      if (o.big) for (let d = 30; d <= 90; d += 30) { const a = d * Math.PI / 180; P.txt(c, `${d}°`, o.piv.x - Math.sin(a) * HL * s * 0.68, o.piv.y + Math.cos(a) * HL * s * 0.68 + 5, 'rgba(255,255,255,.6)', '600 13px'); }
      // B 받침 턱(고정) · 고정대(밀리는 막대)
      const [lx0, ly] = p(BX0 - RC, RC), [lx1] = p(BX0 + RC + 2, RC);
      c.fillStyle = '#6d737c'; c.fillRect(lx0, ly, lx1 - lx0, Math.max(3, s * 0.7));
      const [bl, by] = p(AX - 4 + bar, RC), [br] = p(BX0 - RC + bar, RC), bh = Math.max(5, s * 1.6);
      const bg2 = c.createLinearGradient(0, by, 0, by + bh); bg2.addColorStop(0, '#f1f3f6'); bg2.addColorStop(1, '#8d949e');
      c.fillStyle = bg2; c.beginPath(); c.roundRect(bl, by, br - bl, bh, 3); c.fill(); c.strokeStyle = '#3a3f47'; c.lineWidth = 1.2; c.stroke();
      // 공: 출발 전에는 장치 위, 떨어지는 중에는 확대 창에서만 빠져나가는 모습
      const R = RC * s;
      if (ph === 'idle' || ph === 'lift' || ph === 'swing') { ball(c, ...p(AX, 0), R, 'A'); ball(c, ...p(BX0, 0), R, 'B'); }
      else if (o.big && ph === 'fall') { ball(c, ...p(AX, ay(t)), R, 'A'); ball(c, ...p(bx(t), ay(t)), R, 'B'); }
      // 망치(막대 + 쇠머리)
      const hd = head(o, th);
      c.strokeStyle = '#c9ced5'; c.lineWidth = Math.max(4, s * 0.9); c.lineCap = 'round'; c.beginPath(); c.moveTo(o.piv.x, o.piv.y); c.lineTo(hd.x, hd.y); c.stroke(); c.lineCap = 'butt';
      c.save(); c.translate(hd.x, hd.y); c.rotate(th);
      const hw = 3.2 * s, hh = 2.4 * s, hg = c.createLinearGradient(0, -hh, 0, hh); hg.addColorStop(0, '#e9b04a'); hg.addColorStop(0.5, '#fbe3a4'); hg.addColorStop(1, '#a8741c');
      c.fillStyle = hg; c.beginPath(); c.roundRect(-hw, -hh, hw * 2, hh * 2, 4); c.fill(); c.strokeStyle = '#5a3d08'; c.lineWidth = 1.5; c.stroke(); c.restore();
      c.fillStyle = '#d9dde3'; c.beginPath(); c.arc(o.piv.x, o.piv.y, Math.max(5, s * 1.1), 0, TAU); c.fill(); c.strokeStyle = '#3a3f47'; c.lineWidth = 2; c.stroke();
      if (!o.big) { P.txt(c, '동시 낙하 장치', hx0, hy0 - 8, '#1d2433', '700 15px', 'left'); return; }
      // 확대 창 이름표
      if (ph === 'idle' || ph === 'lift' || ph === 'swing') {
        tag(c, ...p(AX, -RC - 6.5), 'A', '#1d5ea8'); tag(c, ...p(BX0, -RC - 6.5), 'B', '#c4520f');
      }
      const [gx, gy] = p(BX0 - RC + bar, RC + 1.6);
      P.txt(c, '고정대', gx - 2 * s, gy + 20, '#1d2433', '700 17px', 'right');
      P.txt(c, '망치', hd.x, hd.y + hh + 22, '#1d2433', '700 17px');
    }

    // 안내 화살표(끌 방향: 왼쪽 위)
    function arrow(c, x, y) {
      c.save(); c.translate(x, y); c.rotate(-Math.PI / 4); c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 5;
      c.beginPath(); c.moveTo(0, 0); c.lineTo(16, 20); c.lineTo(6, 20); c.lineTo(6, 44); c.lineTo(-6, 44); c.lineTo(-6, 20); c.lineTo(-16, 20); c.closePath();
      c.fillStyle = '#ffd84d'; c.fill(); c.shadowBlur = 0; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.stroke(); c.restore();
    }

    // ── 사진·표 ──
    let strong = false;
    function hit() {
      ph = 'fall'; t = 0; bar = 0; shots = 0; stamp(0); hint = 0;
      say('딱! 고정대가 밀리면서 <b>A</b>는 받침이 빠져 그대로, <b>B</b>는 옆으로 튀어 나간다. <small>(느린 화면 · 실제로는 0.5초)</small>');
      try { if (navigator.vibrate) navigator.vibrate(18); } catch { /* 지원 안 함 */ }
    }
    function stamp(i) {
      if (shots !== i) return; shots = i + 1; if (!i) return;
      const v = { a: f1(gapV(i)), h: f1(gapH()), b: f1(gapV(i)) };
      rows.forEach((r) => { const td = r.querySelectorAll('td')[i - 1]; if (td) td.textContent = r.dataset.k === 't' ? f1(i * DT) : r.dataset.k === 'd' ? f1(DT) : v[r.dataset.k]; });
    }
    function pick(i) {
      if (ph !== 'photo') { say('먼저 망치를 들었다 놓아 두 공의 <b>잔상</b>을 남기자.'); return; }
      picks = picks.filter((j) => j !== i).concat(i);
      const d = f1(ay(i * DT));
      say(`${f1(i * DT)}초: A도 B도 출발점에서 <b>${d} cm</b> 아래 — 높이가 <b>같다</b>.` + (new Set(picks).size < 2 ? '<br><small>다른 순간의 잔상도 하나 더 눌러 보자.</small>' : '<br>이제 오른쪽 <b>표의 줄</b>을 눌러 구간 거리를 견주자.'));
      steps();
    }
    function compare(w) {
      if (ph !== 'photo') { say('표는 공이 떨어지면서 채워진다. 먼저 망치를 들었다 놓자.'); return; }
      cmp.add(w);
      rows.forEach((r) => r.classList.toggle('on', w === 'h' ? r.dataset.k === 'h' : r.dataset.k === 'a' || r.dataset.k === 'b'));
      say(w === 'h' ? 'B의 <b>수평</b> 구간 거리는 칸마다 <b>15.0 cm</b>로 같다 → 같은 시간에 같은 거리, 수평으로는 <b>속력이 일정</b>하다.' + (cmp.has('v') ? '' : '<br><small>이번엔 연직 줄을 눌러 보자.</small>')
        : 'A와 B의 <b>연직</b> 구간 거리가 칸마다 <b>똑같다</b>(4.9 → 14.7 → 24.5 …). 둘 다 점점 더 많이 떨어진다 → 연직으로는 <b>똑같이 자유 낙하</b>.' + (cmp.has('h') ? '' : '<br><small>이번엔 B의 수평 줄을 눌러 보자.</small>'));
      steps();
    }

    function steps() {
      const ok = []; if (ph === 'photo') ok.push(1); if (new Set(picks).size >= 2) ok.push(2); if (cmp.size >= 2) ok.push(3);
      const st = [1, 2, 3].find((n) => !ok.includes(n)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      now.textContent = st === 1 ? '① 망치를 들었다 놓기' : st === 2 ? `② 잔상을 눌러 높이 견주기 (${new Set(picks).size}/2)` : st === 3 ? `③ 표의 수평 줄 · 연직 줄 누르기 (${cmp.size}/2)` : '✓ 수평은 일정 · 연직은 같다';
      now.classList.toggle('done', st === 0);
      tab.classList.toggle('ready', st === 3);
    }

    function launch(a = 1.4) { if (ph !== 'idle') return; th = a; om = 0; strong = th > 0.6; ph = 'swing'; }

    // ── 손 조작 ── 망치 머리는 눈금판 위에서도, 확대 창에서도 잡힌다
    let lv = 'i';
    const grab = (g, p) => { for (const [n, o] of [['i', g.vi], ['m', g.vm]]) { const h = head(o, th); if (Math.hypot(p.x - h.x, p.y - h.y) < 4.4 * o.s + 18) return n; } return null; };
    const S = P.make(stage, {
      draw,
      down(p) {
        const g = geo();
        if (ph === 'idle') { const o = grab(g, p); if (o) { ph = 'lift'; lv = o; say('왼쪽 위로 들어 올린 뒤 손을 <b>놓자</b>. 높이 들수록 세게 친다.'); } return; }
        if (ph === 'photo') {
          let best = 0, bd = 26;
          for (let i = 1; i < shots; i++) { const y = g.Y(ay(i * DT)); [g.X(AX), g.X(bx(i * DT))].forEach((x) => { const d = Math.hypot(p.x - x, p.y - y); if (d < bd) { bd = d; best = i; } }); }
          if (best) pick(best); else say('공의 <b>잔상</b>(파란 공 A나 주황 공 B) 위를 눌러 보자.');
          return;
        }
        if (ph === 'fall') say('찍는 중이다. 두 공이 같은 높이에 있는지 지켜보자.');
      },
      move(p) {
        const g = geo();
        if (ph !== 'lift') { if (ph === 'idle') S.cv.classList.toggle('can-grab', !!grab(g, p)); return; }
        const o = lv === 'm' ? g.vm : g.vi;
        th = Math.max(0, Math.min(1.75, Math.atan2(o.piv.x - p.x, p.y - o.piv.y)));
      },
      up() { if (ph !== 'lift') return; const a = th; ph = 'idle'; if (a < 0.08) { th = 0; say('망치 머리를 잡은 채 왼쪽 위로 <b>끌어</b> 올려야 한다.'); return; } launch(a); },
      key(e) {
        if (e.key === 'Enter' || e.key === ' ') { if (ph === 'idle') launch(); else if (ph === 'photo') say('숫자 키 <b>1~5</b>로 그 순간의 높이를, <b>H</b>·<b>V</b>로 표의 수평·연직 줄을 견준다.'); return true; }
        if (/^[1-5]$/.test(e.key)) { pick(+e.key); return true; }
        if (e.key === 'h' || e.key === 'H') { compare('h'); return true; }
        if (e.key === 'v' || e.key === 'V') { compare('v'); return true; }
        if (e.key === '0') { reset(); return true; }
        return false;
      },
    });

    rows.filter((r) => 'hab'.includes(r.dataset.k)).forEach((r) => {
      const go = () => { compare(r.dataset.k === 'h' ? 'h' : 'v'); S.kick(); };
      r.addEventListener('click', go);
      r.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); go(); } });
    });
    root.querySelector('.lc-reset').addEventListener('click', () => { reset(); S.kick(); });

    reset();
    root._lc = {
      launch: () => { th = 0; ph = 'photo'; shots = 0; for (let i = 0; i <= N; i++) stamp(i); t = N * DT; bar = 6; steps(); S.redraw(); return root._lc.state(); },
      pick: (i) => { pick(i); S.redraw(); return root._lc.state(); },
      cmp: (w) => { compare(w); S.redraw(); return root._lc.state(); },
      state: () => ({ ph, shots, picks: [...picks], cmp: [...cmp], th: +th.toFixed(2), done: root.classList.contains('u-done'), cells: rows.map((r) => [...r.querySelectorAll('td')].map((td) => td.textContent).join('|')), out: out.textContent }),
      geo: () => { const g = geo(); return { W: g.W, H: g.H, k: g.k, head: head(g.vi, 0), piv: g.vi.piv, headM: head(g.vm, 0), pivM: g.vm.piv, A: [1, 2, 3, 4, 5].map((i) => ({ x: g.X(AX), y: g.Y(ay(i * DT)) })), B: [1, 2, 3, 4, 5].map((i) => ({ x: g.X(bx(i * DT)), y: g.Y(ay(i * DT)) })) }; },
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Launcher = { mount };
})();
