/* 3-3 2차시 표지 «과산화 수소수를 상처에 바르면 왜 거품이 날까?»(사건 파일 22 · 교과서 146~147쪽 생활 «카탈레이스»).
   왼쪽: 탁자 위 팔. 갈색 소독약 병(3 % 과산화 수소수)을 끌어 들면 병이 기울며 방울이 떨어진다.
        긁힌 상처(피·세포가 드러남)에 떨어지면 하얀 거품이 부글부글 솟고, 상처 없는 피부나 유리 접시에서는 방울만 맺힌다.
   오른쪽: 거품을 누르면 둥근 확대 창이 열린다. 효소(카탈레이스) 하나가 과산화 수소 분자를 차례로 받아
        물과 산소로 나누고(2H₂O₂ → 2H₂O + O₂), 산소는 모여 기포가 된다. 가끔 다가오는 에탄올은 결합하지 못하고 튕겨 난다.
        «처리한 과산화 수소» 숫자가 계속 늘고 효소는 1개 그대로(재사용). 거품 양·분자 크기·빠르기는 이해를 돕기 위한 예.
   키보드: 1 상처에 · 2 피부에 · 3 접시에 떨어뜨리기, 스페이스 거품 확대, 0 처음부터.
   Wound.mount(root) → { fit, setActive } · 시험용: root._wd.drop('wound'|'skin'|'dish') · zoom() · run(초) · state() · geo() */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const hash = (i, k) => { const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); };
  const F = (w, s) => `${w} ${s}px "IBM Plex Sans KR", sans-serif`;
  const TILT = -2.15; // 병을 들면 이만큼 기운다(주둥이가 왼쪽 아래)

  function mount(root) {
    const stage = root.querySelector('.wd-stage'), chip = root.querySelector('.wd-now');
    const P = window.Play;
    let t, bottle, drops, beads, bubbles, pops, fuel, hit, zoomed, pick, zm, msg;

    function reset() {
      t = 0; bottle = { x: 0, y: 0, a: 0, held: false, home: true, last: 0 }; drops = []; beads = []; bubbles = []; pops = []; fuel = 0;
      hit = { wound: 0, skin: 0, dish: 0, table: 0 }; zoomed = false; pick = null;
      zm = { served: 0, held: false, ph: 'wait', k: 0, mol: null, eth: null, prods: [], o2: [], bub: 0, bubs: [], next: 0.4, n: 0 };
      msg = '';
    }
    reset();
    const say = (h) => { if (h !== msg) { msg = h; chip.innerHTML = h; } };

    // ── 자리 ──
    function geo(W, H) {
      const SW = Math.round(W * 0.58), armY0 = H * 0.5, armY1 = H * 0.72, topY = H * 0.565;
      const lw = W - SW, R = Math.min(lw / 2 - 14, H / 2 - 42);
      return {
        W, H, SW, armY0, armY1, topY, armX1: SW * 0.6, tableY: H * 0.8,
        wound: { x0: SW * 0.1, x1: SW * 0.32, cx: SW * 0.21 },
        skin: { x0: SW * 0.38, x1: SW * 0.56, cx: SW * 0.47 },
        dish: { cx: SW * 0.86, cy: H * 0.88, rx: SW * 0.11, ry: H * 0.045 },
        home: { x: SW * 0.84, y: H * 0.3 },
        lens: { x: SW + lw / 2, y: H / 2 + 14, r: R },
      };
    }
    const tipOf = (b) => [b.x + Math.sin(b.a) * 46, b.y - Math.cos(b.a) * 46];
    function surface(x, g) {
      if (x >= g.dish.cx - g.dish.rx * 0.85 && x <= g.dish.cx + g.dish.rx * 0.85) return { kind: 'dish', y: g.dish.cy };
      if (x > 4 && x < g.armX1 + 40) { const kind = x >= g.wound.x0 && x <= g.wound.x1 ? 'wound' : 'skin'; return { kind, y: g.topY + 4 * Math.sin(x * 0.02) }; }
      return { kind: 'table', y: g.tableY + 16 };
    }

    // ── 움직임 ──
    function land(d, g) {
      const s = surface(d.x, g); hit[s.kind]++;
      if (s.kind === 'wound') { fuel += 1; event('wound'); }
      else { beads.push({ x: d.x, y: s.y - 2, r: 4.5 + Math.random() * 1.5, age: 0, kind: s.kind, fz: 0 }); event(s.kind); }
    }
    let ev = null;
    function event(kind) {
      if (kind === 'wound' && hit.wound === 1) ev = { h: '상처에 닿자 <b>하얀 거품</b>이 부글부글! 피와 세포가 드러난 곳에서만 그럴까?', until: t + 5 };
      if (kind === 'skin' && hit.skin === 1) ev = { h: '상처 없는 피부: 방울만 맺히고 <b>거품이 거의 없다</b>', until: t + 4.5 };
      if (kind === 'dish' && hit.dish === 1) ev = { h: '유리 접시: 그대로 <b>맑은 방울</b> — 과산화 수소는 혼자서는 아주 느리게 분해된다', until: t + 5 };
    }
    function step(dt, g) {
      t += dt;
      // 병
      const b = bottle;
      if (!b.held) { b.x = lerp(b.x, g.home.x, Math.min(1, dt * 8)); b.y = lerp(b.y, g.home.y, Math.min(1, dt * 8)); b.a = lerp(b.a, 0, Math.min(1, dt * 7)); }
      else {
        b.a = lerp(b.a, TILT, Math.min(1, dt * 6));
        if (b.a < -1.7 && t - b.last > 0.24) { b.last = t; const [tx, ty] = tipOf(b); drops.push({ x: tx, y: ty + 3, vy: 40 }); }
      }
      // 떨어지는 방울
      for (let i = drops.length - 1; i >= 0; i--) {
        const d = drops[i]; d.vy += 900 * dt; d.y += d.vy * dt;
        if (d.y >= surface(d.x, g).y - 3) { drops.splice(i, 1); land(d, g); }
      }
      // 상처: 효소가 과산화 수소를 분해 → 산소 기포
      const use = Math.min(fuel, fuel * 0.42 * dt + 0.02 * dt); fuel -= use;
      let make = use * 46 + (fuel > 0.02 ? dt * 3 : 0);
      while (make > 0) {
        if (Math.random() < make) {
          const alive = bubbles.length, x = g.wound.cx + (Math.random() - 0.5) * (g.wound.x1 - g.wound.x0) * 0.8;
          const hgt = Math.min(48, alive * 0.42), y = g.topY - 2 - Math.random() * hgt * (0.4 + 0.6 * (1 - Math.abs(x - g.wound.cx) / ((g.wound.x1 - g.wound.x0) / 2)));
          bubbles.push({ x, y, r: 0, rm: 2.5 + Math.random() * 5.5, age: 0, life: 2.5 + Math.random() * 3.5, ph: Math.random() * TAU });
        }
        make -= 1;
      }
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const o = bubbles[i]; o.age += dt; o.r = o.rm * clamp(o.age / 0.35, 0, 1); o.y -= dt * 3;
        if (o.age > o.life) { bubbles.splice(i, 1); pops.push({ x: o.x, y: o.y, r: o.r, age: 0 }); }
      }
      for (let i = pops.length - 1; i >= 0; i--) { pops[i].age += dt; if (pops[i].age > 0.25) pops.splice(i, 1); }
      // 피부·접시 방울: 아주 가끔 작은 기포 하나
      for (let i = beads.length - 1; i >= 0; i--) { const o = beads[i]; o.age += dt; if (o.kind !== 'table' && Math.random() < dt * 0.04) o.fz = 1; o.fz = Math.max(0, o.fz - dt * 0.5); if (o.age > 14) beads.splice(i, 1); }
      if (zoomed) stepZoom(dt, g);
    }

    // ── 확대 창: 효소 하나의 일 ──
    const SITE = [0, -0.06]; // 활성 부위(렌즈 반지름 단위)
    const sp0 = 1 / 0.36;
    function stepZoom(dt) {
      const Z = zm; Z.k += dt;
      const sp = 1 / 0.36;
      if (Z.ph === 'wait' && Z.k > Z.next) {
        Z.n++; const ang = -Math.PI / 2 + (Math.random() - 0.5) * 2.2, eth = Z.n % 4 === 0;
        const m = { x: Math.cos(ang) * 1.1, y: Math.sin(ang) * 1.1, x0: Math.cos(ang) * 1.1, y0: Math.sin(ang) * 1.1, rot: Math.random() * TAU, eth };
        if (eth) { Z.eth = m; Z.ph = 'eth'; } else { Z.mol = m; Z.ph = 'in'; } Z.k = 0;
      }
      if (Z.ph === 'in') { const e = clamp(Z.k * sp / 1.4, 0, 1), q = e * e * (3 - 2 * e); Z.mol.x = lerp(Z.mol.x0, SITE[0], q); Z.mol.y = lerp(Z.mol.y0, SITE[1] - 0.02, q); Z.mol.rot = lerp(Z.mol.rot, 0, Math.min(1, dt * 4)); if (e >= 1) { Z.ph = 'bind'; Z.k = 0; } }
      else if (Z.ph === 'bind' && Z.k > 0.4) {
        Z.served++;
        Z.prods.push({ kind: 'w', x: SITE[0], y: SITE[1] - 0.05, vx: (Math.random() < 0.5 ? -1 : 1) * (0.22 + Math.random() * 0.1), vy: -0.12, age: 0, rot: Math.random() * TAU });
        if (Z.held) { Z.o2.push({ x: SITE[0], y: SITE[1] - 0.06, vx: (Math.random() - 0.5) * 0.08, vy: -0.32, age: 0 }); Z.held = false; } else Z.held = true;
        Z.mol = null; Z.ph = 'wait'; Z.k = 0; Z.next = 0.12 + Math.random() * 0.15;
      } else if (Z.ph === 'eth') {
        const m = Z.eth, e = Z.k * sp / 1.6;
        if (e < 0.6) { const q = e / 0.6; m.x = lerp(m.x0, SITE[0] * 0.6 + m.x0 * 0.1, q); m.y = lerp(m.y0, SITE[1] - 0.18, q); }
        else { m.x += (m.x0 > 0 ? 1 : -1) * dt * 0.8; m.y -= dt * 0.5; }
        if (e > 1.6) { Z.eth = null; Z.ph = 'wait'; Z.k = 0; Z.next = 0.2; }
      }
      Z.prods.forEach((p) => { p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.rot += dt; });
      Z.prods = Z.prods.filter((p) => p.age < 3.5);
      // 산소는 위로 떠올라 기포에 모인다
      Z.o2.forEach((p) => { p.age += dt; p.x += p.vx * dt; p.y += p.vy * dt; });
      for (let i = Z.o2.length - 1; i >= 0; i--) if (Z.o2[i].y < -0.7) { Z.o2.splice(i, 1); Z.bub++; }
      if (Z.bub >= 5) { Z.bubs.push({ x: (Math.random() - 0.5) * 0.4, y: -0.78, r: 0.11, age: 0 }); Z.bub = 0; }
      Z.bubs.forEach((p) => { p.age += dt; p.y -= dt * 0.25; });
      Z.bubs = Z.bubs.filter((p) => p.y > -1.25);
    }

    // ── 그리기 도우미 ──
    function ball(c, x, y, r, col, dark) {
      const gr = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
      gr.addColorStop(0, '#fff'); gr.addColorStop(0.25, col); gr.addColorStop(1, dark);
      c.fillStyle = gr; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1; c.stroke();
    }
    const O = (c, x, y, s) => ball(c, x, y, 9 * s, '#e0463a', '#8e1c14');
    const Hh = (c, x, y, s) => ball(c, x, y, 6 * s, '#f4f5f7', '#9aa1ad');
    const Cc = (c, x, y, s) => ball(c, x, y, 9 * s, '#5b6270', '#22262e');
    function h2o2(c, x, y, s, rot) {
      c.save(); c.translate(x, y); c.rotate(rot);
      Hh(c, -15 * s, -9 * s, s); Hh(c, 15 * s, 9 * s, s); O(c, -7 * s, 0, s); O(c, 7 * s, 0, s); c.restore();
    }
    function h2o(c, x, y, s, rot) { c.save(); c.translate(x, y); c.rotate(rot); Hh(c, -9 * s, 7 * s, s); Hh(c, 9 * s, 7 * s, s); O(c, 0, 0, s); c.restore(); }
    function o2(c, x, y, s) { O(c, x - 6.5 * s, y, s); O(c, x + 6.5 * s, y, s); }
    function eth(c, x, y, s) { Hh(c, x - 22 * s, y - 4 * s, s); Cc(c, x - 12 * s, y, s); Cc(c, x + 3 * s, y - 4 * s, s); O(c, x + 16 * s, y + 2 * s, s); Hh(c, x + 25 * s, y - 3 * s, s); }
    function enzyme(c, x, y, s, glow) {
      // 그림 Ⅲ-32처럼 위가 패인 효소(활성 부위에 과산화 수소가 꼭 맞는다)
      c.save(); c.translate(x, y);
      if (glow > 0) { const gg = c.createRadialGradient(0, -18 * s, 2, 0, -18 * s, 60 * s); gg.addColorStop(0, `rgba(255,236,120,${0.7 * glow})`); gg.addColorStop(1, 'rgba(255,236,120,0)'); c.fillStyle = gg; c.beginPath(); c.arc(0, -18 * s, 60 * s, 0, TAU); c.fill(); }
      const path = () => { c.beginPath(); c.moveTo(-62 * s, -26 * s); c.bezierCurveTo(-70 * s, 20 * s, -40 * s, 48 * s, 0, 48 * s); c.bezierCurveTo(40 * s, 48 * s, 70 * s, 20 * s, 62 * s, -26 * s); c.lineTo(30 * s, -26 * s); c.bezierCurveTo(26 * s, -2 * s, 16 * s, 4 * s, 12 * s, -6 * s); c.lineTo(-12 * s, -6 * s); c.bezierCurveTo(-16 * s, 4 * s, -26 * s, -2 * s, -30 * s, -26 * s); c.closePath(); };
      const gr = c.createLinearGradient(0, -30 * s, 0, 50 * s); gr.addColorStop(0, '#ffe58a'); gr.addColorStop(0.55, '#f2c440'); gr.addColorStop(1, '#c08a17');
      path(); c.fillStyle = gr; c.fill(); c.strokeStyle = '#7a5208'; c.lineWidth = 2.2; c.stroke();
      // 울퉁불퉁한 단백질 표면 결
      c.save(); path(); c.clip(); c.globalAlpha = 0.25; for (let i = 0; i < 26; i++) { c.fillStyle = i % 2 ? '#fff4c2' : '#a8770e'; c.beginPath(); c.arc((hash(i, 1) - 0.5) * 120 * s, (hash(i, 2) * 70 - 22) * s, (3 + hash(i, 3) * 6) * s, 0, TAU); c.fill(); } c.restore();
      c.restore();
    }

    function drawScene(c, g) {
      const { SW, H } = g;
      c.save(); c.beginPath(); c.rect(0, 0, SW, H); c.clip();
      let gr = c.createLinearGradient(0, 0, 0, g.tableY); gr.addColorStop(0, '#eef1f4'); gr.addColorStop(1, '#d9dee5'); c.fillStyle = gr; c.fillRect(0, 0, SW, g.tableY);
      gr = c.createLinearGradient(0, g.tableY, 0, H); gr.addColorStop(0, '#c99a66'); gr.addColorStop(1, '#9c6d3f'); c.fillStyle = gr; c.fillRect(0, g.tableY, SW, H - g.tableY);
      c.strokeStyle = 'rgba(90,55,25,.25)'; c.lineWidth = 1.2; for (let i = 0; i < 7; i++) { const y = g.tableY + 8 + i * 12; c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= SW; x += 30) c.lineTo(x, y + Math.sin(x * 0.02 + i) * 2); c.stroke(); }
      const ax1 = g.armX1;
      // 팔(아래팔): 윗면이 보이는 둥근 띠
      c.fillStyle = 'rgba(60,40,20,.18)'; c.beginPath(); c.ellipse(ax1 / 2, g.armY1 + 8, ax1 / 2 + 10, 9, 0, 0, TAU); c.fill();
      gr = c.createLinearGradient(0, g.armY0, 0, g.armY1); gr.addColorStop(0, '#f7d3b4'); gr.addColorStop(0.35, '#eebc94'); gr.addColorStop(0.75, '#d99d72'); gr.addColorStop(1, '#b97b52');
      c.fillStyle = gr; c.beginPath(); c.moveTo(-10, g.armY0 + 4); c.bezierCurveTo(ax1 * 0.4, g.armY0 - 6, ax1 * 0.8, g.armY0 - 4, ax1, g.armY0 + 2); c.quadraticCurveTo(ax1 + 18, (g.armY0 + g.armY1) / 2, ax1 - 2, g.armY1); c.bezierCurveTo(ax1 * 0.6, g.armY1 + 4, ax1 * 0.3, g.armY1 + 2, -10, g.armY1 - 2); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(120,70,40,.5)'; c.lineWidth = 1.5; c.stroke();
      // 살갗 결·털구멍
      for (let i = 0; i < 70; i++) { const x = hash(i, 4) * ax1, y = lerp(g.armY0 + 6, g.armY1 - 8, hash(i, 5)); c.fillStyle = 'rgba(150,90,55,.22)'; c.beginPath(); c.arc(x, y, 0.9, 0, TAU); c.fill(); if (i % 3 === 0) { c.strokeStyle = 'rgba(110,70,40,.28)'; c.lineWidth = 0.7; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 5, y - 1.5); c.stroke(); } }
      // 왼쪽 끝 소매, 오른쪽 끝 주먹
      gr = c.createLinearGradient(0, g.armY0 - 12, 0, g.armY1 + 12); gr.addColorStop(0, '#8ea2c2'); gr.addColorStop(1, '#4f6286');
      c.fillStyle = gr; c.beginPath(); c.moveTo(-10, g.armY0 - 12); c.lineTo(16, g.armY0 - 10); c.quadraticCurveTo(26, (g.armY0 + g.armY1) / 2, 18, g.armY1 + 10); c.lineTo(-10, g.armY1 + 12); c.closePath(); c.fill(); c.strokeStyle = '#3e4f6e'; c.lineWidth = 2; c.stroke();
      c.strokeStyle = 'rgba(40,55,85,.5)'; c.lineWidth = 1.2; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(2 + i * 5, g.armY0 - 8); c.quadraticCurveTo(10 + i * 5, (g.armY0 + g.armY1) / 2, 4 + i * 5, g.armY1 + 8); c.stroke(); }
      const fy0 = g.armY0 - 6, fy1 = g.armY1 + 4, fx0 = ax1 - 8, fx1 = ax1 + 40, fh = (fy1 - fy0) / 4;
      gr = c.createLinearGradient(0, fy0, 0, fy1); gr.addColorStop(0, '#f6d0b0'); gr.addColorStop(0.5, '#e7b189'); gr.addColorStop(1, '#bf8158');
      c.fillStyle = gr; c.beginPath(); c.moveTo(fx0, fy0 + 4); c.lineTo(fx1 - 10, fy0);
      for (let i = 0; i < 4; i++) c.arc(fx1 - 8, fy0 + fh * (i + 0.5), fh / 2 + 1, -Math.PI / 2, Math.PI / 2);
      c.lineTo(fx0, fy1 - 2); c.closePath(); c.fill(); c.strokeStyle = 'rgba(120,70,40,.6)'; c.lineWidth = 1.4; c.stroke();
      c.strokeStyle = 'rgba(120,70,40,.45)'; c.lineWidth = 1.1; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(fx1 - 22, fy0 + fh * i); c.lineTo(fx1 - 4, fy0 + fh * i); c.stroke(); }
      c.fillStyle = '#eab48c'; c.beginPath(); c.moveTo(fx0 + 4, fy0 + 6); c.quadraticCurveTo(fx1 - 4, fy0 - 6, fx1 - 6, fy0 + fh * 0.9); c.quadraticCurveTo(fx0 + 20, fy0 + fh * 0.6, fx0 + 4, fy0 + fh * 1.1); c.closePath(); c.fill(); c.stroke(); // 엄지
      // 긁힌 상처: 붉은 바탕 · 긁힌 결 · 핏방울 · 벗겨진 가장자리
      const w = g.wound, wy = g.topY + 3, wrx = (w.x1 - w.x0) / 2, wry = (g.armY1 - g.armY0) * 0.2;
      c.save(); c.beginPath(); for (let i = 0; i <= 28; i++) { const a = i / 28 * TAU, rr = 1 + 0.16 * Math.sin(a * 3 + 1) + 0.1 * Math.sin(a * 7); c.lineTo(w.cx + Math.cos(a) * wrx * rr, wy + Math.sin(a) * wry * rr); } c.closePath();
      c.fillStyle = '#f6e3d3'; c.save(); c.translate(0, 0); c.lineWidth = 5; c.strokeStyle = '#f9e6d6'; c.stroke(); c.restore();
      gr = c.createRadialGradient(w.cx, wy, 2, w.cx, wy, wrx); gr.addColorStop(0, '#c2312a'); gr.addColorStop(0.6, '#d9584a'); gr.addColorStop(1, '#e88f7a'); c.fillStyle = gr; c.fill(); c.clip();
      c.strokeStyle = 'rgba(130,20,20,.55)'; c.lineWidth = 1.3; for (let i = 0; i < 14; i++) { const y = wy - wry + hash(i, 6) * wry * 2; c.beginPath(); c.moveTo(w.x0 + hash(i, 7) * 20, y + 3); c.lineTo(w.x1 - hash(i, 8) * 20, y - 3); c.stroke(); }
      for (let i = 0; i < 18; i++) { const x = w.x0 + hash(i, 9) * wrx * 2, y = wy + (hash(i, 10) - 0.5) * wry * 1.6, r = 1.3 + hash(i, 11) * 2.2; ball(c, x, y, r, '#a3161a', '#5a0a0c'); }
      c.restore();
      txt(c, '긁힌 상처', w.cx, g.armY1 + 26, '#7a1f12', F(800, 15));
      txt(c, '상처 없는 피부', g.skin.cx, g.armY1 + 26, '#384255', F(700, 15));
      // 유리 접시
      const d = g.dish;
      c.fillStyle = 'rgba(40,30,20,.18)'; c.beginPath(); c.ellipse(d.cx + 4, d.cy + d.ry + 3, d.rx, d.ry * 0.6, 0, 0, TAU); c.fill();
      gr = c.createLinearGradient(d.cx - d.rx, 0, d.cx + d.rx, 0); gr.addColorStop(0, 'rgba(210,235,245,.75)'); gr.addColorStop(0.5, 'rgba(250,255,255,.55)'); gr.addColorStop(1, 'rgba(190,220,235,.75)');
      c.fillStyle = gr; c.beginPath(); c.ellipse(d.cx, d.cy + 5, d.rx, d.ry, 0, 0, Math.PI); c.lineTo(d.cx - d.rx, d.cy); c.ellipse(d.cx, d.cy, d.rx, d.ry, 0, Math.PI, 0, true); c.fill();
      c.strokeStyle = 'rgba(70,110,130,.8)'; c.lineWidth = 1.6; c.beginPath(); c.ellipse(d.cx, d.cy, d.rx, d.ry, 0, 0, TAU); c.stroke(); c.beginPath(); c.ellipse(d.cx, d.cy + 5, d.rx, d.ry, 0, 0, Math.PI); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 2; c.beginPath(); c.ellipse(d.cx, d.cy, d.rx * 0.8, d.ry * 0.6, 0, Math.PI * 1.1, Math.PI * 1.45); c.stroke();
      txt(c, '유리 접시', d.cx, d.cy - d.ry - 8, '#384255', F(700, 15));
      // 방울(피부·접시)
      beads.forEach((o) => {
        const a = Math.min(1, (14 - o.age) / 2);
        c.globalAlpha = a; gr = c.createRadialGradient(o.x - o.r * 0.3, o.y - o.r * 0.5, 0.5, o.x, o.y - o.r * 0.2, o.r * 1.4);
        gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(0.5, 'rgba(220,240,250,.55)'); gr.addColorStop(1, 'rgba(120,150,170,.45)');
        c.fillStyle = gr; c.beginPath(); c.ellipse(o.x, o.y - o.r * 0.35, o.r * 1.25, o.r * 0.75, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(80,110,130,.5)'; c.lineWidth = 0.8; c.stroke();
        if (o.fz > 0) { c.strokeStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.arc(o.x + 2, o.y - o.r - 2, 1.4, 0, TAU); c.stroke(); }
        c.globalAlpha = 1;
      });
      // 거품
      bubbles.forEach((o) => {
        const wob = 0.4 * Math.sin(t * 9 + o.ph), r = Math.max(0.5, o.r + wob);
        gr = c.createRadialGradient(o.x - r * 0.35, o.y - r * 0.4, 0.3, o.x, o.y, r);
        gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.7, 'rgba(246,248,250,.95)'); gr.addColorStop(1, 'rgba(190,200,210,.95)');
        c.fillStyle = gr; c.beginPath(); c.arc(o.x, o.y, r, 0, TAU); c.fill(); c.strokeStyle = 'rgba(140,150,165,.7)'; c.lineWidth = 0.7; c.stroke();
      });
      pops.forEach((o) => { c.strokeStyle = `rgba(255,255,255,${1 - o.age * 4})`; c.lineWidth = 1; c.beginPath(); c.arc(o.x, o.y, o.r + o.age * 20, 0, TAU); c.stroke(); });
      if (pick) { c.strokeStyle = '#ffd84d'; c.lineWidth = 3; c.beginPath(); c.arc(pick.x, pick.y, 9 + Math.sin(t * 5) * 1.5, 0, TAU); c.stroke(); }
      // 떨어지는 방울
      drops.forEach((d2) => { c.fillStyle = 'rgba(200,230,245,.9)'; c.strokeStyle = 'rgba(70,110,130,.8)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(d2.x, d2.y - 7); c.quadraticCurveTo(d2.x + 4, d2.y, d2.x, d2.y + 3); c.quadraticCurveTo(d2.x - 4, d2.y, d2.x, d2.y - 7); c.fill(); c.stroke(); });
      // 병을 든 동안: 방울이 떨어질 자리 안내선
      if (bottle.held) { const [tx, ty] = tipOf(bottle), s = surface(tx, g); c.strokeStyle = 'rgba(29,36,51,.35)'; c.setLineDash([4, 5]); c.lineWidth = 1.5; c.beginPath(); c.moveTo(tx, ty + 6); c.lineTo(tx, s.y - 4); c.stroke(); c.setLineDash([]); c.strokeStyle = 'rgba(29,36,51,.5)'; c.beginPath(); c.ellipse(tx, s.y - 2, 9, 3, 0, 0, TAU); c.stroke(); }
      drawBottle(c, bottle);
      if (!bottle.held && hit.wound + hit.skin + hit.dish === 0) { // 처음: 병이 살짝 들썩
        const bob = Math.sin(t * 4) * 3; c.fillStyle = '#1d2433'; c.beginPath(); c.moveTo(g.home.x - 48, g.home.y + 6 + bob); c.lineTo(g.home.x - 34, g.home.y + bob); c.lineTo(g.home.x - 48, g.home.y - 6 + bob); c.fill();
      }
      c.restore();
    }
    function drawBottle(c, b) {
      c.save(); c.translate(b.x, b.y + (b.held ? 0 : Math.sin(t * 2) * 1)); c.rotate(b.a);
      c.fillStyle = 'rgba(0,0,0,.15)'; if (!b.held) { c.beginPath(); c.ellipse(4, 38, 22, 5, 0, 0, TAU); c.fill(); }
      const gr = c.createLinearGradient(-20, 0, 20, 0); gr.addColorStop(0, '#4a2310'); gr.addColorStop(0.3, '#8a4a1c'); gr.addColorStop(0.55, '#b06a2c'); gr.addColorStop(1, '#3c1b0b');
      c.fillStyle = gr; c.beginPath(); c.moveTo(-19, 36); c.lineTo(-19, -10); c.quadraticCurveTo(-19, -22, -8, -25); c.lineTo(8, -25); c.quadraticCurveTo(19, -22, 19, -10); c.lineTo(19, 36); c.quadraticCurveTo(19, 40, 15, 40); c.lineTo(-15, 40); c.quadraticCurveTo(-19, 40, -19, 36); c.fill();
      c.strokeStyle = '#2a1206'; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-14, -14, 4, 44);
      // 흰 뚜껑·주둥이
      c.fillStyle = '#f4f4f2'; c.strokeStyle = '#8a8f99'; c.lineWidth = 1.2; c.beginPath(); c.rect(-10, -36, 20, 12); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(-5, -36); c.lineTo(-2, -46); c.lineTo(2, -46); c.lineTo(5, -36); c.closePath(); c.fill(); c.stroke();
      // 상표
      c.fillStyle = '#fbf6e6'; c.fillRect(-17, 0, 34, 26); c.strokeStyle = '#7a1f12'; c.lineWidth = 1; c.strokeRect(-17, 0, 34, 26);
      c.fillStyle = '#7a1f12'; c.font = F(800, 8.5); c.textAlign = 'center'; c.fillText('과산화', 0, 10); c.fillText('수소수', 0, 19.5); c.font = F(700, 7); c.fillStyle = '#384255'; c.fillText('3 %', 0, 25.5);
      c.restore();
    }
    function txt(c, s, x, y, col, font, al = 'center') { c.fillStyle = col; c.font = font; c.textAlign = al; c.fillText(s, x, y); }

    function drawLens(c, g) {
      const L = g.lens, R = L.r;
      c.fillStyle = '#2a3142'; c.fillRect(g.SW, 0, g.W - g.SW, g.H);
      c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.moveTo(g.SW, 0); c.lineTo(g.SW, g.H); c.stroke();
      txt(c, '거품 속 확대', L.x, 24, '#fbfcf9', F(800, 16));
      if (zoomed && pick) { // 고른 거품에서 렌즈로 잇는 선
        c.strokeStyle = 'rgba(255,216,77,.55)'; c.lineWidth = 1.5; c.setLineDash([5, 5]);
        c.beginPath(); c.moveTo(pick.x + 9, pick.y - 4); c.lineTo(L.x - R * 0.7, L.y - R * 0.7); c.moveTo(pick.x + 9, pick.y + 4); c.lineTo(L.x - R * 0.7, L.y + R * 0.7); c.stroke(); c.setLineDash([]);
      }
      c.save(); c.beginPath(); c.arc(L.x, L.y, R, 0, TAU); c.clip();
      const gr = c.createRadialGradient(L.x - R * 0.3, L.y - R * 0.3, R * 0.1, L.x, L.y, R); gr.addColorStop(0, '#fdeeee'); gr.addColorStop(1, '#ebc4c0'); c.fillStyle = gr; c.fillRect(L.x - R, L.y - R, 2 * R, 2 * R);
      if (!zoomed) {
        c.fillStyle = 'rgba(120,60,60,.18)'; for (let i = 0; i < 14; i++) { c.beginPath(); c.arc(L.x + (hash(i, 1) - 0.5) * R * 1.6, L.y + (hash(i, 2) - 0.5) * R * 1.6, 4 + hash(i, 3) * 8, 0, TAU); c.fill(); }
        txt(c, '?', L.x, L.y + 22, 'rgba(122,31,18,.55)', F(800, 70));
      } else {
        const Z = zm, s = R / 150, X = (u) => L.x + u * R, Y = (v) => L.y + v * R;
        // 붉은 혈구 그림자(배경)
        for (let i = 0; i < 4; i++) { const x = X((hash(i, 5) - 0.5) * 1.6), y = Y((hash(i, 6) - 0.5) * 1.6); c.fillStyle = 'rgba(200,70,60,.16)'; c.beginPath(); c.ellipse(x, y, 30 * s, 26 * s, i, 0, TAU); c.fill(); }
        Z.bubs.forEach((p) => { c.fillStyle = 'rgba(255,255,255,.55)'; c.strokeStyle = 'rgba(150,160,175,.8)'; c.lineWidth = 1.2; c.beginPath(); c.arc(X(p.x), Y(p.y), p.r * R, 0, TAU); c.fill(); c.stroke(); });
        const glow = Z.ph === 'bind' ? Math.sin(clamp(Z.k / 0.4, 0, 1) * Math.PI) : 0;
        enzyme(c, X(0), Y(0.32), s * 1.25, glow);
        if (Z.held) O(c, X(SITE[0]), Y(SITE[1] + 0.13), s * 0.95); // 활성 부위에 잠깐 붙들린 산소 원자
        if (Z.mol) h2o2(c, X(Z.mol.x), Y(Z.mol.y), s * 1.05, Z.mol.rot);
        if (Z.eth) { eth(c, X(Z.eth.x), Y(Z.eth.y), s); if (Z.k * sp0 / 1.6 > 0.55) txt(c, '✕ 결합 못 함', X(Z.eth.x), Y(Z.eth.y) - 18 * s, '#7a1f12', F(800, Math.max(12, 15 * s))); }
        Z.prods.forEach((p) => { c.globalAlpha = Math.min(1, (3.5 - p.age) / 0.6); h2o(c, X(p.x), Y(p.y), s, p.rot); c.globalAlpha = 1; });
        Z.o2.forEach((p) => o2(c, X(p.x), Y(p.y), s));
        // 이름표
        const fs = Math.max(12, 14 * s);
        txt(c, '카탈레이스(효소)', X(0), Y(0.82), '#7a5208', F(800, fs));
        if (Z.mol && Z.ph === 'in') txt(c, '과산화 수소', X(Z.mol.x), Y(Z.mol.y) - 20 * s, '#7a1f12', F(700, fs));
        const lp = Z.prods[Z.prods.length - 1]; if (lp && lp.age < 1.6) txt(c, '물', X(lp.x), Y(lp.y) + 26 * s, '#1f5f8a', F(700, fs));
        const lo = Z.o2[Z.o2.length - 1]; if (lo) txt(c, '산소', X(lo.x) + 26 * s, Y(lo.y) + 5, '#7a1f12', F(700, fs), 'left');
        if (Z.bubs.length) txt(c, '산소 기포', X(Z.bubs[0].x), Y(Z.bubs[0].y) - Z.bubs[0].r * R - 4, '#384255', F(700, fs));
      }
      c.restore();
      c.strokeStyle = '#11151f'; c.lineWidth = 7; c.beginPath(); c.arc(L.x, L.y, R + 3, 0, TAU); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 2; c.beginPath(); c.arc(L.x, L.y, R - 3, Math.PI * 1.1, Math.PI * 1.45); c.stroke();
      const foot = zoomed ? `효소 1개 · 받아 나눈 과산화 수소 ${zm.served}개` : (bubbles.length > 6 ? '왼쪽 거품을 눌러 보자' : '거품이 생기면 눌러 확대');
      txt(c, foot, L.x, g.H - 10, '#ffd84d', F(700, 15));
    }

    function draw(c, W, H, dt) {
      const g = geo(W, H);
      if (!bottle.x) { bottle.x = g.home.x; bottle.y = g.home.y; }
      for (let k = 0; k < 2; k++) step(dt / 2, g);
      c.clearRect(0, 0, W, H);
      drawScene(c, g); drawLens(c, g);
      if (ev && t > ev.until) ev = null;
      const tried = hit.skin + hit.dish > 0;
      if (zoomed && zm.served >= 4) say('효소 하나가 과산화 수소를 <b>물과 산소</b>로 계속 나눈다 — 효소는 <b>그대로</b>, 다시 쓰인다');
      else if (zoomed) say('효소(카탈레이스)가 과산화 수소와 <b>꼭 맞게 결합</b>해 나눈다 · 에탄올은 결합 못 함');
      else if (ev) say(ev.h);
      else if (!hit.wound) say('소독약 병을 끌어 들고 <b>긁힌 상처</b> 위에서 기울여 보자');
      else if (!tried) say('이번엔 <b>상처 없는 피부</b>나 <b>유리 접시</b>에도 떨어뜨려 비교하자');
      else if (bubbles.length > 4) say('하얀 <b>거품 하나</b>를 눌러 확대해 보자');
      else say('상처에 한 번 더 떨어뜨려 거품을 만들고, 거품을 눌러 보자');
    }

    const S = P.make(stage, {
      draw,
      down(p) {
        const g = geo(S.W, S.H), b = bottle;
        if (Math.hypot(p.x - b.x, p.y - b.y) < 46) { b.held = true; b.dx = b.x - p.x; b.dy = b.y - p.y; b.last = t; return; }
        if (p.x < g.SW) { // 거품 누르기
          let best = null, bd = 22; bubbles.forEach((o) => { const d = Math.hypot(o.x - p.x, o.y - p.y); if (d < bd) { bd = d; best = o; } });
          if (best) { pick = { x: best.x, y: best.y }; zoomed = true; }
        }
      },
      move(p) { const b = bottle; if (!b.held) return; const g = geo(S.W, S.H); b.x = clamp(p.x + b.dx, 30, g.SW - 30); b.y = clamp(p.y + b.dy, 50, g.armY0 - 40); },
      up() { bottle.held = false; },
      key(e) {
        const k = e.key, g = geo(S.W, S.H);
        const at = { 1: g.wound.cx, 2: g.skin.cx, 3: g.dish.cx }[k];
        if (at != null) { for (let i = 0; i < 3; i++) drops.push({ x: at + (i - 1) * 6, y: g.armY0 - 60 - i * 26, vy: 60 }); return true; }
        if (k === ' ' || k === 'Enter') { if (bubbles.length) { const o = bubbles[bubbles.length - 1]; pick = { x: o.x, y: o.y }; zoomed = true; } return true; }
        if (k === '0') { reset(); return true; } return false;
      },
    });
    const state = () => ({ hit: { ...hit }, foam: bubbles.length, fuel: +fuel.toFixed(2), zoomed, served: zm.served, beads: beads.length, msg });
    root._wd = {
      drop: (kind) => { const g = geo(S.W, S.H), x = { wound: g.wound.cx, skin: g.skin.cx, dish: g.dish.cx }[kind]; land({ x }, g); S.kick(); return state(); },
      zoom: () => { if (bubbles.length) { const o = bubbles[0]; pick = { x: o.x, y: o.y }; } zoomed = true; S.kick(); return state(); },
      run: (sec) => { const g = geo(S.W, S.H); for (let i = 0; i < sec * 60; i++) step(1 / 60, g); S.kick(); return state(); },
      bottle: () => ({ x: bottle.x, y: bottle.y, a: bottle.a, held: bottle.held }),
      geo: () => geo(S.W, S.H), state, reset: () => { reset(); S.kick(); },
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Wound = { mount };
})();
