/* 3-2 3차시 체험 «버스 손잡이»(교과서 132쪽 그림 Ⅲ-22 · 참고서 170쪽 관성 예·관성의 크기·관성과 안전띠).
   버스 안 옆모습: 서 있는 어른·아이, 안전띠를 맨 좌석 승객과 운전사, 같은 고무줄로 기둥에 묶어 둔 장바구니(5 kg)·짐가방(20 kg).
   아래 운전 손잡이를 «가속 페달» 쪽으로 끌고 있으면 출발해 빨라지고, «브레이크» 쪽으로 끌면 느려지다 선다(놓으면 그 빠르기 그대로).
   출발: 서 있는 승객이 뒤로 쏠림 · 정지: 앞으로 쏠림(크게 쏠리면 한 발 내딛는다) · 짐은 고무줄을 늘이며 미끄러지고, 무거운 짐가방이 더 많이 밀린다.
   승객을 끌어 천장 고리 밑에 놓으면 고리를 잡아 덜 쏠린다(잡은 승객을 누르면 놓는다). 안전띠를 맨 사람은 거의 그대로.
   왼쪽 아래 작은 그림: 안전띠 감개 속 흔들이가 급정거 때 앞으로 쏠려 톱니를 걸어 띠를 잠근다. 창밖 풍경·속도계로 빠르기.
   크기·질량·빠르기는 이해를 돕기 위한 예. 그림 도우미는 bustoss.js의 window.BusArt.
   키보드: 오른쪽 화살표 가속, 왼쪽 화살표 브레이크(누르는 동안), G 어른·H 아이 고리 잡기/놓기, 0 처음부터.
   Bus.mount(root) → { fit, setActive } · 시험용: root._bs.lever(v, 초) · grip('adult'|'kid', 켬) · run(초) · state() */
(function () {
  'use strict';
  const TAU = Math.PI * 2, VMAX = 11, ACC = 3, BRK = 6, KL = 0.07, KBAND = 300;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // 감쇠 진동 한 걸음: 목표 x0 쪽으로 (각진동수 w, 감쇠비 z)
  const osc = (o, x0, w, z, dt) => { o.v += (w * w * (x0 - o.x) - 2 * z * w * o.v) * dt; o.x += o.v * dt; };
  // 묶어 둔 짐: 버스 가속도 A일 때 버스 안에서 −A만큼 밀리고 고무줄이 되돌린다 → 멈춘 뒤 밀린 거리 ≈ m·A/k (질량에 비례)
  (function () {
    const run = (m) => { const o = { x: 0, v: 0 }, w = Math.sqrt(KBAND / m); for (let i = 0; i < 3000; i++) osc(o, -(-BRK) * m / KBAND, w, 0.35, 0.002); return o.x; };
    const l = run(5), h = run(20); console.assert(Math.abs(h / l - 4) < 0.05 && h > 0, 'bus: 짐 밀림');
  })();

  function mount(root) {
    const stage = root.querySelector('.bs-stage'), now = root.querySelector('.bs-now'), out = root.querySelector('.bs-out');
    const A = window.BusArt, P = window.Play;
    let t, V, dist, acc, lever, leverHold, drag, ok, msg, ev, braked, people, bags, straps, pend, evT, evMsg, cruiseT;
    const STRAPS = [1.45, 2.0, 2.55], XMIN = 1.35, XMAX = 2.5, GAP = 0.4;
    // 서 있는 승객끼리 겹치지 않게: 다른 승객과 GAP보다 가까우면 그 자리로 못 간다
    const free = (q, x) => !people.some((o) => o !== q && Math.abs(o.x - x) < GAP);
    function reset() {
      t = 0; V = 0; dist = 0; acc = 0; lever = 0; leverHold = 0; drag = null; ok = new Set(); ev = null; braked = 0; evT = 0; evMsg = ''; cruiseT = 0;
      people = [
        { k: 'adult', nm: '어른', x: 1.72, h: 1.72, shirt: '#3f6fb5', pants: '#2d3540', skin: '#f0c49c', hair: '#2a1d15', th: { x: 0, v: 0 }, grip: -1, step: 0 },
        { k: 'kid', nm: '아이', x: 2.28, h: 1.3, kid: true, shirt: '#e8823a', pants: '#3d5a8a', skin: '#f6d0ae', hair: '#4a2a14', long: true, th: { x: 0, v: 0 }, grip: -1, step: 0 },
      ];
      bags = [{ nm: '장바구니 5 kg', m: 5, x0: 0.4, d: { x: 0, v: 0 } }, { nm: '짐가방 20 kg', m: 20, x0: 0.95, d: { x: 0, v: 0 } }];
      straps = STRAPS.map(() => ({ x: 0, v: 0 })); pend = { x: 0, v: 0 };
      belt = { x: 0, v: 0 }; driver = { x: 0, v: 0 };
      say('아래 <b>운전 손잡이</b>를 <b>가속 페달</b> 쪽(오른쪽)으로 끌고 있으면 버스가 출발한다. 서 있는 승객을 잘 보자');
      steps();
    }
    let belt, driver;
    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };
    function steps() {
      const st = [1, 2, 3].find((q) => !ok.has(q)) || 0;
      window.L1.steps(root, st, [...ok]); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 손잡이를 가속 쪽으로 끌어 출발' : st === 2 ? '② 달리다가 브레이크 끝까지 — 급정거' : st === 3 ? '③ 승객을 고리 밑으로 끌고 다시' : '출발은 뒤로, 정지는 앞으로 — 관성';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    // 배치(m → px)
    const lay = (W, H) => {
      const strip = 108, floor = H - strip - 22, ppm = Math.min((floor - 10) / 2.35, W / 5.1), X = (m) => m * ppm;
      const frontX = W - 0.92 * ppm;
      return { strip, floor, ppm, X, ceil: floor - 2.3 * ppm, winTop: floor - 2.0 * ppm, winBot: floor - 1.08 * ppm, frontX, poles: [X(0.4), X(0.95)], seats: [X(3.2), frontX - 0.62 * ppm],
        track: { x0: W * 0.36, x1: W * 0.67, y: H - 46 }, gauge: { x: W - 78, y: H - 26, r: 56 }, lock: { x: 70, y: H - 56, r: 44 } };
    };
    const gripping = () => people.some((p) => p.grip >= 0);
    function physics(dt) {
      if (leverHold > 0) { leverHold -= dt; if (leverHold <= 0 && drag !== 'lever') lever = 0; }
      const was = V;
      acc = lever > 0 ? (V < VMAX ? lever * ACC : 0) : lever < 0 ? (V > 0 ? lever * BRK : 0) : 0;
      V = clamp(V + acc * dt, 0, VMAX); if (was > 0 && V === 0) acc = 0; dist += V * dt; t += dt;
      people.forEach((p) => {
        const g = p.grip >= 0; osc(p.th, -acc * KL * (g ? 0.25 : 1), g ? 9 : 5, g ? 0.7 : 0.35, dt);
        if (!g && Math.abs(p.th.x) > 0.42) { const sg = Math.sign(p.th.x), nx = clamp(p.x + sg * 0.16, XMIN, XMAX); if (free(p, nx)) p.x = nx; p.th.x -= sg * 0.14; p.th.v *= 0.4; p.step = 0.5; }
        if (p.step > 0) p.step -= dt;
      });
      osc(belt, -acc * KL * 0.08, 9, 0.8, dt); osc(driver, -acc * KL * 0.08, 9, 0.8, dt);
      bags.forEach((b) => { const w = Math.sqrt(KBAND / b.m); osc(b.d, -acc * b.m / KBAND, w, 0.35, dt); b.d.x = clamp(b.d.x, -0.45, 1.1); });
      straps.forEach((s) => osc(s, clamp(-acc * 0.09, -0.6, 0.6), 4.2, 0.12, dt));
      osc(pend, clamp(-acc * 0.07, -0.5, 0.5), 7, 0.3, dt);
      // 사건: 출발·급정거
      if (acc > 0.5 && was < 0.3) { ev = 'start'; evT = 0; evMsg = '출발! 버스는 앞으로 나가는데 서 있는 승객은 <b>정지 상태를 유지하려 해서</b> 몸이 <b>뒤로</b> 쏠린다.'; }
      if (acc < -3.4 && V > 1.5) braked = Math.max(braked, was);
      if (ev === 'start') { evT += dt; if (V > 3 && evT > 0.8) { ok.add(1); if (gripping()) ok.add(3); ev = 'cruise'; cruiseT = 0; steps(); } }
      if (was > 0 && V === 0) {
        if (braked > 3) {
          ok.add(2); if (gripping()) ok.add(3); steps();
          evMsg = '급정거! 버스는 멈추는데 승객은 <b>운동 상태를 유지하려 해서</b>(달리던 빠르기 그대로) 몸이 <b>앞으로</b> 쏠려 나간다. 무거운 짐가방이 장바구니보다 <b>더 많이</b> 밀리고, 안전띠를 맨 사람은 거의 그대로다.';
          if (gripping()) evMsg += ' 고리를 잡은 승객은 팔이 몸을 붙잡아 덜 쏠린다.';
        } else evMsg = '살살 멈추면 쏠림도 작다. 다시 출발해 달리다가 손잡이를 <b>브레이크 끝까지</b> 끌어 급정거해 보자.';
        braked = 0; ev = null;
      }
      if (ev === 'cruise' && acc === 0 && V > 1) { cruiseT += dt; if (cruiseT > 1.2) { evMsg = '같은 빠르기로 달리는 동안에는 쏠리지 않는다. 몸도 버스와 같은 빠르기로 <b>운동 상태를 이어 가는 중</b>이기 때문. 이제 브레이크 끝까지!'; ev = null; } }
    }
    // ---------- 그림 ----------
    function bag(c, L, b) {
      const { X, floor } = L, x = X(b.x0 + b.d.x), big = b.m > 10, w = X(big ? 0.42 : 0.34), h = X(big ? 0.62 : 0.4), y = floor - h - X(0.04);
      // 고무줄(기둥 → 손잡이)
      const px = X(b.x0) - X(0.02), py = floor - X(big ? 0.66 : 0.46), hx = x + w / 2, hy = y - X(big ? 0.08 : 0.05), st = Math.abs(hx - px) / X(0.3);
      c.strokeStyle = '#d14b2b'; c.lineWidth = Math.max(2, 6 / Math.max(1, st)); c.beginPath(); c.moveTo(px, py); c.quadraticCurveTo((px + hx) / 2, (py + hy) / 2 + Math.max(0, 14 - st * 8), hx, hy); c.stroke();
      c.fillStyle = '#9a2a16'; c.beginPath(); c.arc(px, py, 5, 0, TAU); c.fill();
      if (big) {
        let g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#5c3b8a'); g.addColorStop(0.5, '#7d57b3'); g.addColorStop(1, '#4a2e70'); c.fillStyle = g; c.beginPath(); c.roundRect(x, y, w, h, 10); c.fill();
        c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 2; for (let k = 1; k < 4; k++) { c.beginPath(); c.moveTo(x + w * k / 4, y + 6); c.lineTo(x + w * k / 4, y + h - 6); c.stroke(); }
        c.strokeStyle = '#2b2f36'; c.lineWidth = 5; c.beginPath(); c.moveTo(x + w * 0.35, y); c.lineTo(x + w * 0.35, y - X(0.08)); c.lineTo(x + w * 0.65, y - X(0.08)); c.lineTo(x + w * 0.65, y); c.stroke();
        const rot = (b.d.x / 0.04) % TAU; [x + 10, x + w - 10].forEach((wx) => { c.fillStyle = '#16181b'; c.beginPath(); c.arc(wx, floor - X(0.04), X(0.04), 0, TAU); c.fill(); c.strokeStyle = '#888'; c.lineWidth = 2; c.beginPath(); c.moveTo(wx, floor - X(0.04)); c.lineTo(wx + Math.cos(rot) * X(0.035), floor - X(0.04) + Math.sin(rot) * X(0.035)); c.stroke(); });
      } else {
        let g = c.createLinearGradient(x, 0, x + w, 0); g.addColorStop(0, '#2f8a6a'); g.addColorStop(1, '#4fb38c'); c.fillStyle = g; c.beginPath(); c.moveTo(x + 4, y + 8); c.lineTo(x + w - 4, y + 8); c.lineTo(x + w, y + h); c.lineTo(x, y + h); c.closePath(); c.fill();
        c.fillStyle = '#f2b13c'; c.beginPath(); c.arc(x + w * 0.3, y + 4, X(0.06), 0, TAU); c.fill(); c.fillStyle = '#7cc24a'; c.fillRect(x + w * 0.55, y - X(0.1), 6, X(0.12));
        c.strokeStyle = '#1f5c46'; c.lineWidth = 4; c.beginPath(); c.arc(x + w / 2, y + 8, w * 0.3, Math.PI, 0); c.stroke();
        [x + 8, x + w - 8].forEach((wx) => { c.fillStyle = '#16181b'; c.beginPath(); c.arc(wx, floor - X(0.03), X(0.03), 0, TAU); c.fill(); });
      }
      b.tag = [x + w / 2, y - X(big ? 0.2 : 0.18)];
    }
    function draw(c, W, H, dt) {
      for (let k = 0; k < 4; k++) physics(dt / 4);
      const L = lay(W, H), { X, floor, ppm } = L;
      A.interior(c, W, H, L, dist * ppm, t);
      // 고리
      const rings = STRAPS.map((sx, i) => {
        const p = people.find((q) => q.grip === i), ln = p ? Math.max(0.2, 2.13 - p.h * (p.kid ? 1.12 : 1.08) - 0.12) * ppm : 0.36 * ppm;
        return A.strap(c, X(sx), L.ceil + 0.17 * ppm, ln, p ? p.th.x * 0.6 : straps[i].x + 0.02 * Math.sin(t * 1.5 + i), ppm);
      });
      bags.forEach((b) => bag(c, L, b));
      // 안전띠 승객(좌석)
      const sx = X(3.2), hipX = sx + X(0.12), hipY = floor - X(0.5);
      const sitter = (x, hy, o, th) => {
        const hd = A.person(c, Object.assign({ x, y: floor, sit: hy, s: ppm, lean: th }, o));
        const Hh = o.h * ppm, Pp = (u, v) => ({ x: x + (u - 0.5 * Hh) * Math.sin(th) + v * Math.cos(th), y: hy - (u - 0.5 * Hh) * Math.cos(th) + v * Math.sin(th) });
        const a = Pp(0.82 * Hh, -0.06 * Hh), b = Pp(0.5 * Hh, 0.07 * Hh), d = Pp(0.5 * Hh, -0.07 * Hh);
        c.strokeStyle = '#1d1f24'; c.lineWidth = X(0.05); c.lineCap = 'butt'; c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.moveTo(d.x, d.y); c.lineTo(b.x, b.y); c.stroke();
        c.fillStyle = '#c9ccd2'; c.fillRect(b.x - 5, b.y - 5, 10, 10);
        return hd;
      };
      sitter(hipX, hipY, { h: 1.66, shirt: '#6aa34a', pants: '#4a4036', skin: '#e8b98f', hair: '#1b1410', grip: null }, belt.x);
      const dX = L.frontX - X(0.5);
      sitter(dX, floor - X(0.5), { h: 1.72, shirt: '#2e4a6b', pants: '#25303d', skin: '#efc39b', hair: '#222', cap: '#22364f', grip: { x: L.frontX + 0.42 * ppm, y: floor - 1.2 * ppm }, back: { x: L.frontX + 0.38 * ppm, y: floor - 0.85 * ppm } }, driver.x);
      // 서 있는 승객
      people.forEach((p) => {
        const r = p.grip >= 0 ? rings[p.grip] : null;
        A.person(c, { x: X(p.x), y: floor, s: ppm, h: p.h, kid: p.kid, long: p.long, shirt: p.shirt, pants: p.pants, skin: p.skin, hair: p.hair, lean: clamp(p.th.x, -0.5, 0.5), grip: r, back: null });
        A.tag(c, p.grip >= 0 ? `${p.nm} · 고리 잡음` : p.nm, X(p.x) + Math.sin(p.th.x) * p.h * ppm, floor - (p.h + 0.08) * ppm - 16, p.grip >= 0 ? 'rgba(31,122,58,.9)' : 'rgba(29,36,51,.82)', '#fff');
        if (drag && drag.p === p) { c.strokeStyle = '#ffd84d'; c.setLineDash([6, 5]); c.lineWidth = 3; STRAPS.forEach((sx2) => { c.beginPath(); c.moveTo(X(sx2), L.ceil + 0.3 * ppm); c.lineTo(X(sx2), floor); c.stroke(); }); c.setLineDash([]); }
      });
      bags.forEach((q) => A.tag(c, q.nm, q.tag[0], q.tag[1], 'rgba(29,36,51,.82)', '#fff'));
      A.tag(c, '안전띠', hipX + X(0.05), floor - 1.72 * ppm, 'rgba(31,122,58,.9)', '#fff');
      // 쏠림 화살표(가속도 반대쪽)
      if (Math.abs(acc) > 0.4) {
        const dir = -Math.sign(acc), y = Math.max(70, L.ceil - 30), x = W * 0.55, len = 50 + Math.abs(acc) * 16;
        c.strokeStyle = '#d9483b'; c.fillStyle = '#d9483b'; c.lineWidth = 8; c.beginPath(); c.moveTo(x - dir * len / 2, y); c.lineTo(x + dir * len / 2, y); c.stroke();
        c.beginPath(); c.moveTo(x + dir * (len / 2 + 18), y); c.lineTo(x + dir * len / 2, y - 14); c.lineTo(x + dir * len / 2, y + 14); c.fill();
        A.tag(c, dir < 0 ? '몸이 뒤로 쏠림' : '몸이 앞으로 쏠림', x - dir * (len / 2 + 30) - dir * 70, y, 'rgba(176,48,31,.92)', '#fff');
      }
      controls(c, W, H, L);
    }
    function controls(c, W, H, L) {
      const y0 = H - L.strip;
      let g = c.createLinearGradient(0, y0, 0, H); g.addColorStop(0, '#2c3038'); g.addColorStop(1, '#1b1e23'); c.fillStyle = g; c.fillRect(0, y0, W, L.strip);
      c.fillStyle = '#4a505b'; c.fillRect(0, y0, W, 3);
      // 운전 손잡이
      const T = L.track, xm = (T.x0 + T.x1) / 2, kx = xm + lever * (T.x1 - T.x0) / 2;
      P.txt(c, '운전 손잡이 — 끌고 있는 동안만', xm, y0 + 28, '#e9ecf1', '800 19px');
      g = c.createLinearGradient(T.x0, 0, T.x1, 0); g.addColorStop(0, '#d9483b'); g.addColorStop(0.5, '#6b717c'); g.addColorStop(1, '#2fa65a'); c.fillStyle = g; c.beginPath(); c.roundRect(T.x0, T.y - 7, T.x1 - T.x0, 14, 7); c.fill();
      c.fillStyle = '#e9ecf1'; c.fillRect(xm - 1.5, T.y - 14, 3, 28);
      P.txt(c, '◀ 브레이크', T.x0 - 32, T.y + 7, '#ff8f80', '800 20px', 'right'); P.txt(c, '가속 페달 ▶', T.x1 + 32, T.y + 7, '#7fe0a0', '800 20px', 'left');
      g = c.createLinearGradient(0, T.y - 26, 0, T.y + 26); g.addColorStop(0, '#ffe58a'); g.addColorStop(1, '#e0b52a'); c.fillStyle = g; c.strokeStyle = '#111'; c.lineWidth = 3; c.beginPath(); c.roundRect(kx - 26, T.y - 26, 52, 52, 12); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 2; for (let k = -1; k <= 1; k++) { c.beginPath(); c.moveTo(kx + k * 9, T.y - 13); c.lineTo(kx + k * 9, T.y + 13); c.stroke(); }
      if (!lever && V < 0.1 && !ok.has(1)) { const b = 8 * Math.sin(t * 4); P.txt(c, '끌기 →', kx + 34 + b, T.y - 34, '#ffd84d', '800 20px', 'left'); }
      // 속도계
      const G = L.gauge; c.strokeStyle = '#596170'; c.lineWidth = 10; c.beginPath(); c.arc(G.x, G.y, G.r, Math.PI, TAU); c.stroke();
      c.strokeStyle = '#4dd2ff'; c.beginPath(); c.arc(G.x, G.y, G.r, Math.PI, Math.PI + Math.PI * V / VMAX); c.stroke();
      const na = Math.PI + Math.PI * V / VMAX; c.strokeStyle = '#ffd84d'; c.lineWidth = 5; c.beginPath(); c.moveTo(G.x + Math.cos(na) * (G.r - 24), G.y + Math.sin(na) * (G.r - 24)); c.lineTo(G.x + Math.cos(na) * (G.r + 4), G.y + Math.sin(na) * (G.r + 4)); c.stroke();
      P.txt(c, `시속 ${Math.round(V * 3.6)} km`, G.x, G.y - 2, '#fff', '800 21px');
      // 안전띠 감개 속 흔들이
      const K = L.lock, ph = clamp(pend.x, -0.6, 0.6), locked = ph > 0.2;
      c.fillStyle = '#e8eaee'; c.beginPath(); c.arc(K.x, K.y, K.r, 0, TAU); c.fill(); c.strokeStyle = locked ? '#d9483b' : '#8a909a'; c.lineWidth = 3; c.stroke();
      const gx = K.x, gy = K.y - 12, gr = 17, rot = locked ? 0 : t * 0.5;
      c.fillStyle = '#7b818c'; c.beginPath(); for (let i = 0; i < 24; i++) { const a = rot + i * TAU / 24, r = i % 2 ? gr : gr + 5; c.lineTo(gx + Math.cos(a) * r, gy + Math.sin(a) * r); } c.closePath(); c.fill();
      c.fillStyle = '#1d2433'; c.beginPath(); c.arc(gx, gy, 5, 0, TAU); c.fill();
      const px = K.x + 6, py = K.y + 6, bx = px + Math.sin(ph) * 24, by = py + Math.cos(ph) * 24;
      c.strokeStyle = '#3d4350'; c.lineWidth = 3; c.beginPath(); c.moveTo(px, py); c.lineTo(bx, by); c.stroke(); c.fillStyle = '#c0392b'; c.beginPath(); c.arc(bx, by, 7, 0, TAU); c.fill();
      const tipY = locked ? gy + gr + 1 : gy + gr + 9; c.strokeStyle = locked ? '#d9483b' : '#3d4350'; c.lineWidth = 4; c.beginPath(); c.moveTo(px, py); c.lineTo(gx + 10, tipY); c.stroke();
      P.txt(c, locked ? '띠 잠김!' : '안전띠 감개', K.x + K.r + 10, K.y - 8, locked ? '#ff8f80' : '#e9ecf1', '800 19px', 'left');
      P.txt(c, '속 흔들이', K.x + K.r + 10, K.y + 18, '#c5cad3', '700 18px', 'left');
    }
    const personAt = (p, L) => people.find((q) => Math.abs(p.x - L.X(q.x)) < 0.28 * L.ppm && p.y > L.floor - q.h * L.ppm - 10 && p.y < L.floor + 6);
    function setGrip(q, on) {
      if (!on) { q.grip = -1; return; }
      let best = -1, bd = 9; STRAPS.forEach((sx, i) => { const d = Math.abs(sx - q.x); if (d < bd && !people.some((o) => o !== q && o.grip === i) && free(q, sx - 0.1)) { bd = d; best = i; } });
      if (best < 0 || bd > 0.7) return; q.grip = best; q.x = STRAPS[best] - 0.1; q.th.x *= 0.5;
      evMsg = `${q.nm}${q.k === 'adult' ? '이' : '가'} 고리를 잡았다. 이제 <b>출발</b>하거나 <b>급정거</b>해서 쏠림을 견주어 보자.`;
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) { draw(c, W, H, dt); if (evMsg) say(evMsg); },
      down(p) {
        const L = lay(S.W, S.H), T = L.track;
        if (p.y > S.H - L.strip && p.x > T.x0 - 60 && p.x < T.x1 + 60) { drag = 'lever'; lever = clamp((p.x - (T.x0 + T.x1) / 2) / ((T.x1 - T.x0) / 2), -1, 1); leverHold = 1e9; return; }
        const q = personAt(p, L); if (q) drag = { p: q, x0: p.x, dx: p.x - L.X(q.x), moved: 0, was: q.grip };
      },
      move(p) {
        const L = lay(S.W, S.H), T = L.track;
        if (drag === 'lever') { lever = clamp((p.x - (T.x0 + T.x1) / 2) / ((T.x1 - T.x0) / 2), -1, 1); if (Math.abs(lever) < 0.08) lever = 0; return; }
        if (drag && drag.p) { drag.moved = Math.max(drag.moved, Math.abs(p.x - drag.x0)); if (drag.moved > 8) { drag.p.grip = -1; const nx = clamp((p.x - drag.dx) / L.ppm, XMIN, XMAX); if (free(drag.p, nx)) drag.p.x = nx; } }
      },
      up() {
        if (drag === 'lever') { lever = 0; leverHold = 0; }
        else if (drag && drag.p) { const q = drag.p; if (drag.moved > 8) setGrip(q, true); else if (drag.was >= 0) { setGrip(q, false); evMsg = `${q.nm}${q.k === 'adult' ? '이' : '가'} 고리를 놓았다.`; } else setGrip(q, true); }
        drag = null;
      },
      key(e) {
        const k = e.key.toLowerCase();
        if (k === 'arrowright' || k === 'arrowleft') { lever = k === 'arrowright' ? 1 : -1; leverHold = 0.5; return true; }
        if (k === 'g' || k === 'h') { const q = people[k === 'g' ? 0 : 1]; setGrip(q, q.grip < 0); return true; }
        if (k === '0') { reset(); return true; } return false;
      },
    });
    root.querySelector('.bs-reset').addEventListener('click', () => { reset(); S.kick(); });
    reset();
    const state = () => ({ V: +V.toFixed(2), acc: +acc.toFixed(2), lever, ok: [...ok], lean: people.map((p) => +p.th.x.toFixed(3)), x: people.map((p) => +p.x.toFixed(2)), grip: people.map((p) => p.grip), bags: bags.map((b) => +b.d.x.toFixed(3)), belt: +belt.x.toFixed(3) });
    root._bs = {
      lever: (v, sec) => { lever = v; leverHold = sec; for (let i = 0; i < sec * 200; i++) physics(0.005); lever = 0; leverHold = 0; S.kick(); return state(); },
      grip: (who, on) => { setGrip(people[who === 'kid' ? 1 : 0], on); S.kick(); return state(); },
      run: (sec) => { for (let i = 0; i < sec * 200; i++) physics(0.005); S.kick(); return state(); },
      state,
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Bus = { mount };
})();
