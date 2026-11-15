/* 3-3 3차시 표지 «김치를 담글 때 배추를 소금에 절이면 왜 숨이 죽을까?»(사건 파일 23 · 교과서 150쪽 도입 + 참고서 삼투의 예).
   왼쪽: 도마 위 배추 밑동에서 잎 두 장이 뻗어 있다. 오른쪽 위 소금 그릇에서 굵은 소금을 집어(끌기) 잎 위에서 문지르면 알갱이가 떨어져 붙는다.
        시간이 지나면 소금 친 잎에 물방울이 맺혀 흘러내리고, 잎이 축 처진다. 소금을 치지 않은 잎은 그대로 살짝 흔들린다.
   오른쪽: 잎을 누르면 둥근 확대 창. 잎 세포 하나(세포벽 · 세포막 · 액포)와 겉의 진한 소금물(Na⁺·Cl⁻).
        물 분자는 세포막을 드나들지만 이온은 막에 막힌다. 소금 친 잎에서는 나가는 물이 더 많아 세포막이 세포벽에서 떨어진다(원형질분리 미리 보기).
   절인 시간·빠르기·분자 크기는 이해를 돕기 위한 예.
   키보드: 1 왼쪽 잎에 소금(오른쪽 잎은 비닐을 씌운 비교용), 스페이스 확대(소금 친 잎 먼저), 0 처음부터.
   Salt.mount(root) → { fit, setActive } · 시험용: root._sl.salt(잎 0|1, 알갱이 수) · zoom(잎) · run(초) · state() · geo() · leafAt(잎, s, u) */
(function () {
  'use strict';
  const TAU = Math.PI * 2, N = 24;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const hash = (i, k) => { const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); };
  const F = (w, s) => `${w} ${s}px "IBM Plex Sans KR", sans-serif`;
  const mix = (a, b, k) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; };
  // 확대 창 세포(렌즈 반지름 단위)
  const WALL = { x0: -0.86, x1: 0.86, y0: -0.3, y1: 0.8 };

  function mount(root) {
    const stage = root.querySelector('.sl-stage'), chip = root.querySelector('.sl-now');
    const P = window.Play;
    let t, leaves, falling, grains, beads, drips, puddle, pinch, press, zoomed, zl, zm, msg, tSalt;

    function reset() {
      t = 0; leaves = [-1, 1].map((side) => ({ side, salt: 0, w: 0, lost: 0, pts: null })); falling = []; grains = []; beads = []; drips = [];
      puddle = 0; pinch = null; press = null; zoomed = false; zl = 0; zm = null; msg = ''; tSalt = -1;
    }
    reset();
    const say = (h) => { if (h !== msg) { msg = h; chip.innerHTML = h; } };

    // ── 자리 ──
    function geo(W, H) {
      const SW = Math.round(W * 0.58), lw = W - SW, R = Math.min(lw / 2 - 14, H / 2 - 42), tableY = H * 0.8;
      return { W, H, SW, tableY, base: { x: SW * 0.45, y: tableY - 8 }, L: H * 0.52, bowl: { x: SW * 0.85, y: H * 0.3 }, lens: { x: SW + lw / 2, y: H / 2 + 14, r: R } };
    }
    // 잎 줄기(가운데맥) 점들: 소금을 칠수록(w) 끝이 아래로 휜다
    function spine(lf, g) {
      const L = g.L * (1 - 0.14 * lf.w), sway = 0.03 * Math.sin(t * 1.3 + lf.side * 2) * (1 - 0.6 * lf.w) + 0.012 * Math.sin(t * 3.1 + lf.side);
      const a0 = lf.side * (0.3 + 0.2 * lf.w) + sway, B = lf.side * (0.18 + 1.45 * Math.pow(lf.w, 1.1));
      const pts = []; let x = g.base.x + lf.side * 9, y = g.base.y;
      for (let i = 0; i <= N; i++) {
        const th = a0 + B * Math.pow(i / N, 1.7);
        pts.push({ x, y: Math.min(y, g.tableY - 5), th });
        x += Math.sin(th) * L / N; y -= Math.cos(th) * L / N;
      }
      lf.pts = pts; lf.L = L; return pts;
    }
    const halfW = (lf, s) => lf.L * (s < 0.16 ? lerp(0.05, 0.075, s / 0.16) : 0.075 + 0.14 * Math.pow(Math.sin(Math.PI * clamp(0.1 + (s - 0.16) * 0.8, 0, 1)), 0.8) * (s > 0.93 ? Math.sqrt(Math.max(0, (1 - s) / 0.07)) : 1));
    const ribW = (lf, s) => lf.L * (0.055 * (1 - s) + 0.012);
    function leafAt(lf, s, u) {
      const f = clamp(s, 0, 1) * N, i = Math.min(N - 1, Math.floor(f)), k = f - i, a = lf.pts[i], b = lf.pts[i + 1];
      const x = lerp(a.x, b.x, k), y = lerp(a.y, b.y, k), th = lerp(a.th, b.th, k), hw = halfW(lf, s);
      return { x: x + Math.cos(th) * u * hw, y: y + Math.sin(th) * u * hw, th };
    }
    function hitLeaf(x, y, only) {
      let best = null;
      leaves.forEach((lf, li) => {
        if (!lf.pts || (only != null && li !== only)) return;
        for (let i = 0; i <= N; i++) {
          const p = lf.pts[i], s = i / N, dx = x - p.x, dy = y - p.y, along = dx * Math.sin(p.th) - dy * Math.cos(p.th), across = dx * Math.cos(p.th) + dy * Math.sin(p.th);
          const hw = halfW(lf, s), seg = lf.L / N;
          if (Math.abs(along) <= seg * 0.6 && Math.abs(across) < hw * 1.05) { const d = Math.abs(across) / hw; if (!best || d < best.d) best = { li, s: clamp(s + along / lf.L, 0, 1), u: clamp(across / hw, -0.98, 0.98), d }; }
        }
      });
      return best;
    }

    // ── 움직임 ──
    function stickGrain(li, s, u) {
      const lf = leaves[li]; lf.salt++; if (tSalt < 0) tSalt = t;
      grains.push({ li, s, u, age: 0, r: 1.6 + Math.random() * 1.6, a: Math.random() * TAU });
      if (grains.length > 420) grains.splice(0, grains.length - 420);
    }
    function step(dt, g) {
      t += dt;
      leaves.forEach((lf) => spine(lf, g));
      // 떨어지는 소금 알갱이
      for (let i = falling.length - 1; i >= 0; i--) {
        const o = falling[i]; o.vy += 700 * dt; o.y += o.vy * dt; o.x += o.vx * dt;
        const h = hitLeaf(o.x, o.y);
        if (h && h.li === 0) { falling.splice(i, 1); stickGrain(h.li, h.s, h.u); continue; }
        if (h && !o.bounced) { o.bounced = true; o.vy = -60; o.vx = 50 + Math.random() * 30; } // 비닐에 튕긴다
        if (o.y > g.tableY + 6) falling.splice(i, 1);
      }
      grains.forEach((o) => { o.age += dt; });
      // 소금 친 잎: 세포 속 물이 빠져나와 잎이 처진다
      leaves.forEach((lf, li) => {
        if (!lf.salt) return;
        const eff = Math.min(1, lf.salt / 28), dw = dt * 0.13 * eff * (1 - lf.w);
        lf.w += dw; lf.lost += dw;
        if (Math.random() < dw * 60 + (lf.w > 0.08 && lf.w < 0.97 ? dt * 1.4 : 0)) beads.push({ li, s: 0.25 + Math.random() * 0.7, u: (Math.random() - 0.5) * 1.5, r: 0, rm: 2.4 + Math.random() * 2.6, v: 0 });
      });
      // 물방울: 잎 결을 따라 아래쪽으로 흘러 떨어진다
      for (let i = beads.length - 1; i >= 0; i--) {
        const o = beads[i], lf = leaves[o.li]; o.r = Math.min(o.rm, o.r + dt * 4);
        if (o.r >= o.rm * 0.9) {
          const th = leafAt(lf, o.s, 0).th, down = -Math.cos(th) < 0 ? -1 : 1; // 결을 따라 아래로 가는 쪽
          o.v = Math.min(0.35, o.v + dt * 0.12); o.s += down * o.v * dt;
        }
        if (o.s < 0.03 || o.s > 0.995) { const p = leafAt(lf, clamp(o.s, 0, 1), o.u); drips.push({ x: p.x, y: p.y + 2, vy: 30, r: o.r }); beads.splice(i, 1); }
      }
      for (let i = drips.length - 1; i >= 0; i--) { const d = drips[i]; d.vy += 800 * dt; d.y += d.vy * dt; if (d.y > g.tableY + 2) { drips.splice(i, 1); puddle = Math.min(1, puddle + 0.025); } }
      if (beads.length > 90) beads.splice(0, beads.length - 90);
      if (zoomed) stepZoom(dt);
    }

    // ── 확대 창: 잎 세포 하나 ──
    const memM = () => 0.03 + 0.3 * (zm ? leaves[zl].w : 0);
    function inMem(x, y, m = memM()) {
      const x0 = WALL.x0 + 0.07 + m, x1 = WALL.x1 - 0.07 - m, y0 = WALL.y0 + 0.07 + m, y1 = WALL.y1 - 0.07 - m * 0.55, r = 0.05 + m * 0.7;
      if (x < x0 || x > x1 || y < y0 || y > y1) return false;
      const cx = clamp(x, x0 + r, x1 - r), cy = clamp(y, y0 + r, y1 - r);
      return Math.hypot(x - cx, y - cy) <= r;
    }
    function initZoom() {
      const salty = leaves[zl].salt > 0;
      zm = { ws: [], ions: [], out: 0, in: 0, k: 0 };
      const put = (arr, n, inside, kind) => { let tries = 0; while (n > 0 && tries++ < 4000) { const x = (Math.random() - 0.5) * 1.9, y = (Math.random() - 0.5) * 1.9; if (Math.hypot(x, y) > 0.93) continue; if (inMem(x, y) !== inside) continue; if (!inside && y > WALL.y0 - 0.04) continue; arr.push({ x, y, vx: 0, vy: 0, rot: Math.random() * TAU, kind }); n--; } };
      put(zm.ws, 18, true, 'w'); put(zm.ws, salty ? 6 : 8, false, 'w');
      if (salty) { for (let i = 0; i < 6; i++) { put(zm.ions, 1, false, 'na'); put(zm.ions, 1, false, 'cl'); } }
    }
    function stepZoom(dt) {
      const Z = zm, lf = leaves[zl], salty = lf.salt > 0 && lf.w < 0.985;
      const pOut = salty ? 0.6 : 0.3, pIn = salty ? 0.12 : 0.3;
      const move = (p, ion) => {
        p.vx = (p.vx + (Math.random() - 0.5) * 7 * dt) * (1 - dt * 1.5); p.vy = (p.vy + (Math.random() - 0.5) * 7 * dt) * (1 - dt * 1.5);
        const sp = Math.hypot(p.vx, p.vy), mx = ion ? 0.22 : 0.32; if (sp > mx) { p.vx *= mx / sp; p.vy *= mx / sp; }
        const nx = p.x + p.vx * dt, ny = p.y + p.vy * dt;
        if (Math.hypot(nx, ny) > 0.94) { p.vx = -p.vx - p.x * 0.2; p.vy = -p.vy - p.y * 0.2; return; }
        const was = inMem(p.x, p.y), now = inMem(nx, ny);
        if (was !== now) {
          if (ion) { p.vx = -p.vx; p.vy = -p.vy; return; }
          if (Math.random() < (was ? pOut : pIn) * 0.5) { if (was) Z.out++; else Z.in++; p.pass = 0.6; }
          else { p.vx = -p.vx; p.vy = -p.vy; return; }
        }
        p.x = nx; p.y = ny; p.rot += dt * (ion ? 0.6 : 1.4); if (p.pass) p.pass = Math.max(0, p.pass - dt);
      };
      Z.ws.forEach((p) => move(p, false)); Z.ions.forEach((p) => move(p, true));
      // 막이 줄어들면 안쪽 분자 일부가 밖으로 남는다 — 남은 물 분자 수를 막 넓이에 맞춰 둔다(밖의 물은 렌즈 가장자리에서 흩어져 나감)
      const outside = Z.ws.filter((p) => !inMem(p.x, p.y));
      if (outside.length > 14) { const o = outside[0]; Z.ws.splice(Z.ws.indexOf(o), 1); }
    }

    // ── 그리기 도우미 ──
    function ball(c, x, y, r, col, dark) {
      const gr = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r);
      gr.addColorStop(0, '#fff'); gr.addColorStop(0.3, col); gr.addColorStop(1, dark);
      c.fillStyle = gr; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 0.8; c.stroke();
    }
    function h2o(c, x, y, s, rot) {
      c.save(); c.translate(x, y); c.rotate(rot);
      ball(c, -6.5 * s, 5 * s, 3.6 * s, '#f4f5f7', '#9aa1ad'); ball(c, 6.5 * s, 5 * s, 3.6 * s, '#f4f5f7', '#9aa1ad'); ball(c, 0, 0, 6 * s, '#4d9ad6', '#1f5f8a');
      c.restore();
    }
    function txt(c, s, x, y, col, font, al = 'center') { c.fillStyle = col; c.font = font; c.textAlign = al; c.fillText(s, x, y); }

    function leafPath(c, lf, wfn) {
      const pts = lf.pts; c.beginPath();
      for (let i = 0; i <= N; i++) { const p = pts[i], s = i / N, w = wfn(s, i); c.lineTo(p.x + Math.cos(p.th) * w, p.y + Math.sin(p.th) * w); }
      const tip = pts[N]; c.arc(tip.x, tip.y, Math.max(1, wfn(1, N)), tip.th, tip.th + Math.PI, lf.side < 0);
      for (let i = N; i >= 0; i--) { const p = pts[i], s = i / N, w = wfn(s, i); c.lineTo(p.x - Math.cos(p.th) * w, p.y - Math.sin(p.th) * w); }
      c.closePath();
    }
    function drawLeaf(c, lf, li) {
      const pts = lf.pts, w = lf.w, ruff = (s, i) => halfW(lf, s) * (s > 0.2 ? 1 + 0.07 * Math.sin(i * 2.7 + li * 3 + t * 0.6 * (1 - w)) : 1);
      const a = pts[0], b = pts[N];
      // 그림자
      c.save(); c.translate(4, 5); c.globalAlpha = 0.14; leafPath(c, lf, ruff); c.fillStyle = '#1d2433'; c.fill(); c.restore();
      const gr = c.createLinearGradient(a.x, a.y, b.x, b.y);
      gr.addColorStop(0, mix('#eef4d8', '#e2e0bf', w)); gr.addColorStop(0.3, mix('#b9dc7c', '#a8b878', w * 0.8)); gr.addColorStop(0.7, mix('#7fb544', '#8a9a55', w * 0.8)); gr.addColorStop(1, mix('#5a8f2c', '#6d7d3e', w * 0.8));
      leafPath(c, lf, ruff); c.fillStyle = gr; c.fill();
      c.strokeStyle = mix('#3f6b20', '#59632e', w); c.lineWidth = 1.6; c.stroke();
      // 잎맥·주름
      c.save(); leafPath(c, lf, ruff); c.clip();
      c.strokeStyle = `rgba(245,250,225,${0.55 - w * 0.2})`; c.lineWidth = 1.2;
      for (let i = 3; i < N; i += 2) { const p = pts[i], hw = halfW(lf, i / N); for (const sg of [-1, 1]) { c.beginPath(); c.moveTo(p.x, p.y); c.quadraticCurveTo(p.x + Math.cos(p.th) * hw * 0.5 * sg - Math.sin(p.th) * 6, p.y + Math.sin(p.th) * hw * 0.5 * sg + Math.cos(p.th) * 6, p.x + Math.cos(p.th) * hw * 0.95 * sg - Math.sin(p.th) * 14, p.y + Math.sin(p.th) * hw * 0.95 * sg + Math.cos(p.th) * 14); c.stroke(); } }
      for (let i = 0; i < 40; i++) { const p = leafAt(lf, 0.2 + hash(i, li + 1) * 0.78, (hash(i, li + 5) - 0.5) * 1.8); c.fillStyle = i % 2 ? 'rgba(60,100,30,.18)' : 'rgba(255,255,230,.25)'; c.beginPath(); c.ellipse(p.x, p.y, 4 + hash(i, 3) * 5, 2, p.th, 0, TAU); c.fill(); }
      if (w > 0.2) { c.fillStyle = `rgba(200,225,240,${(w - 0.2) * 0.35})`; c.fillRect(-9999, -9999, 1e5, 1e5); } // 젖은 윤기
      c.restore();
      // 흰 가운데맥(두꺼운 줄기)
      const rib = (s) => ribW(lf, s);
      c.beginPath(); for (let i = 0; i <= N; i++) { const p = pts[i], r = rib(i / N); c.lineTo(p.x + Math.cos(p.th) * r, p.y + Math.sin(p.th) * r); } for (let i = N; i >= 0; i--) { const p = pts[i], r = rib(i / N); c.lineTo(p.x - Math.cos(p.th) * r, p.y - Math.sin(p.th) * r); } c.closePath();
      const rg = c.createLinearGradient(a.x - 12, 0, a.x + 12, 0); rg.addColorStop(0, mix('#e9e6cf', '#d8d3b0', w)); rg.addColorStop(0.5, '#fbfaf0'); rg.addColorStop(1, mix('#dcd8b8', '#c9c39c', w));
      c.fillStyle = rg; c.fill(); c.strokeStyle = 'rgba(150,145,100,.6)'; c.lineWidth = 1; c.stroke();
    }

    function wrap(c, lf) { // 비교용 잎에 씌운 투명 비닐
      const pts = lf.pts, W2 = (s2, i) => halfW(lf, s2) * 1.13 + 4;
      leafPath(c, lf, W2); c.fillStyle = 'rgba(225,238,250,.28)'; c.fill(); c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1.4; c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 2.2;
      [0.35, 0.6, 0.82].forEach((s2) => { const a = leafAt(lf, s2, -0.5), b = leafAt(lf, s2 + 0.08, 0.3); c.beginPath(); c.moveTo(a.x, a.y); c.lineTo(b.x, b.y); c.stroke(); });
    }
    function drawScene(c, g) {
      const { SW, H } = g;
      c.save(); c.beginPath(); c.rect(0, 0, SW, H); c.clip();
      let gr = c.createLinearGradient(0, 0, 0, g.tableY); gr.addColorStop(0, '#f3efe6'); gr.addColorStop(1, '#e2dccd'); c.fillStyle = gr; c.fillRect(0, 0, SW, g.tableY);
      // 벽 타일 줄눈
      c.strokeStyle = 'rgba(150,140,120,.22)'; c.lineWidth = 1; for (let y = 30; y < g.tableY; y += 42) { c.beginPath(); c.moveTo(0, y); c.lineTo(SW, y); c.stroke(); } for (let y = 30, r = 0; y < g.tableY; y += 42, r++) for (let x = (r % 2) * 30; x < SW; x += 60) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 42); c.stroke(); }
      // 나무 도마
      gr = c.createLinearGradient(0, g.tableY, 0, H); gr.addColorStop(0, '#d9b07c'); gr.addColorStop(1, '#a87a48'); c.fillStyle = gr; c.fillRect(0, g.tableY, SW, H - g.tableY);
      c.strokeStyle = 'rgba(110,70,30,.25)'; c.lineWidth = 1.1; for (let i = 0; i < 6; i++) { const y = g.tableY + 8 + i * 13; c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= SW; x += 24) c.lineTo(x, y + Math.sin(x * 0.03 + i * 1.7) * 2); c.stroke(); }
      // 흘러나온 물 웅덩이
      if (puddle > 0) { const rx = 24 + puddle * SW * 0.32, ry = 5 + puddle * 9; c.fillStyle = `rgba(120,85,50,${0.25 + puddle * 0.2})`; c.beginPath(); c.ellipse(g.base.x - SW * 0.05, g.tableY + 12, rx, ry, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(g.base.x - SW * 0.05, g.tableY + 10, rx * 0.7, ry * 0.5, 0, Math.PI * 1.1, Math.PI * 1.5); c.stroke(); }
      // 잎(뒤 → 앞), 밑동
      leaves.forEach((lf, li) => drawLeaf(c, lf, li));
      wrap(c, leaves[1]);
      const bx = g.base.x, by = g.base.y;
      gr = c.createLinearGradient(bx - 30, 0, bx + 30, 0); gr.addColorStop(0, '#dcd6b4'); gr.addColorStop(0.5, '#fbf8ea'); gr.addColorStop(1, '#d2cba4');
      c.fillStyle = gr; c.beginPath(); c.moveTo(bx - 30, by - 22); c.quadraticCurveTo(bx, by - 34, bx + 30, by - 22); c.lineTo(bx + 24, by + 8); c.quadraticCurveTo(bx, by + 14, bx - 24, by + 8); c.closePath(); c.fill(); c.strokeStyle = '#a9a17a'; c.lineWidth = 1.4; c.stroke();
      c.strokeStyle = 'rgba(160,150,110,.5)'; for (let i = -2; i <= 2; i++) { c.beginPath(); c.moveTo(bx + i * 9, by - 26); c.lineTo(bx + i * 8, by + 8); c.stroke(); }
      // 소금 알갱이(붙은 것은 차츰 녹아 젖은 자국)
      grains.forEach((o) => {
        const lf = leaves[o.li]; if (!lf.pts) return; const p = leafAt(lf, o.s, o.u), a = clamp(1 - (o.age - 3) / 5, 0.28, 1);
        c.save(); c.translate(p.x, p.y); c.rotate(o.a); c.globalAlpha = a;
        c.fillStyle = '#ffffff'; c.strokeStyle = 'rgba(120,130,150,.7)'; c.lineWidth = 0.6; c.beginPath(); c.moveTo(-o.r, -o.r * 0.6); c.lineTo(o.r * 0.7, -o.r); c.lineTo(o.r, o.r * 0.7); c.lineTo(-o.r * 0.6, o.r); c.closePath(); c.fill(); c.stroke();
        c.restore();
      });
      // 물방울
      beads.forEach((o) => {
        const lf = leaves[o.li]; if (!lf.pts) return; const p = leafAt(lf, o.s, o.u), r = o.r;
        const bg = c.createRadialGradient(p.x - r * 0.3, p.y - r * 0.4, 0.3, p.x, p.y, r * 1.2); bg.addColorStop(0, 'rgba(255,255,255,.95)'); bg.addColorStop(0.5, 'rgba(210,235,248,.6)'); bg.addColorStop(1, 'rgba(90,130,150,.55)');
        c.fillStyle = bg; c.beginPath(); c.arc(p.x, p.y, r, 0, TAU); c.fill(); c.strokeStyle = 'rgba(60,100,120,.5)'; c.lineWidth = 0.7; c.stroke();
      });
      drips.forEach((d) => { c.fillStyle = 'rgba(200,230,245,.9)'; c.strokeStyle = 'rgba(70,110,130,.8)'; c.lineWidth = 0.8; c.beginPath(); c.moveTo(d.x, d.y - 6); c.quadraticCurveTo(d.x + 3.5, d.y, d.x, d.y + 3); c.quadraticCurveTo(d.x - 3.5, d.y, d.x, d.y - 6); c.fill(); c.stroke(); });
      falling.forEach((o) => { c.fillStyle = '#fff'; c.strokeStyle = 'rgba(120,130,150,.8)'; c.lineWidth = 0.6; c.fillRect(o.x - 1.6, o.y - 1.6, 3.2, 3.2); c.strokeRect(o.x - 1.6, o.y - 1.6, 3.2, 3.2); });
      // 이름표
      const lab = (lf, s) => { const p = lf.pts[0]; txt(c, s, p.x + lf.side * SW * 0.2, g.tableY + 28, lf.salt ? '#7a1f12' : '#384255', F(800, 15)); };
      lab(leaves[0], leaves[0].salt ? '소금 친 잎' : '소금 칠 잎'); lab(leaves[1], '비닐 씌운 잎(비교)');
      if (tSalt >= 0) { const hr = Math.min(6, (t - tSalt) * 0.3); txt(c, `절인 지 약 ${hr < 1 ? Math.round(hr * 60) + '분' : hr.toFixed(1) + '시간'}`, 10, H - 10, '#3b2a14', F(700, 14), 'left'); }
      drawBowl(c, g);
      if (pick()) { const p = pick(); c.strokeStyle = '#ffd84d'; c.lineWidth = 3; c.beginPath(); c.arc(p.x, p.y, 10 + Math.sin(t * 5) * 1.5, 0, TAU); c.stroke(); }
      c.restore();
    }
    const pick = () => { if (!zoomed || !leaves[zl].pts) return null; return leafAt(leaves[zl], 0.62, 0.35); };
    function drawBowl(c, g) {
      const { x, y } = g.bowl, rx = Math.min(54, g.SW * 0.12), ry = rx * 0.32;
      c.fillStyle = 'rgba(60,40,20,.16)'; c.beginPath(); c.ellipse(x + 4, y + rx * 0.72, rx * 0.9, ry * 0.5, 0, 0, TAU); c.fill();
      let gr = c.createLinearGradient(x - rx, 0, x + rx, 0); gr.addColorStop(0, '#5b6d8c'); gr.addColorStop(0.45, '#9fb2cf'); gr.addColorStop(1, '#3f4f6b');
      c.fillStyle = gr; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI); c.quadraticCurveTo(x - rx * 0.9, y + rx * 0.75, x, y + rx * 0.75); c.quadraticCurveTo(x + rx * 0.9, y + rx * 0.75, x + rx, y); c.fill();
      c.strokeStyle = '#2d3a52'; c.lineWidth = 1.5; c.stroke();
      // 소금 더미
      c.fillStyle = '#f7f8fa'; c.beginPath(); c.ellipse(x, y, rx * 0.94, ry * 0.9, 0, 0, TAU); c.fill(); c.strokeStyle = '#2d3a52'; c.stroke();
      gr = c.createRadialGradient(x - rx * 0.2, y - ry * 1.4, 2, x, y - ry * 0.4, rx * 0.8); gr.addColorStop(0, '#ffffff'); gr.addColorStop(1, '#d8dde6');
      c.fillStyle = gr; c.beginPath(); c.moveTo(x - rx * 0.85, y); c.quadraticCurveTo(x - rx * 0.2, y - ry * 2.6, x + rx * 0.8, y); c.closePath(); c.fill();
      for (let i = 0; i < 28; i++) { const px = x + (hash(i, 7) - 0.5) * rx * 1.5, py = y - hash(i, 8) * ry * 1.6 * (1 - Math.abs(px - x) / rx); c.fillStyle = i % 3 ? 'rgba(150,160,180,.55)' : '#fff'; c.fillRect(px - 1.3, py - 1.3, 2.6, 2.6); }
      txt(c, '굵은 소금', x, y + rx * 0.75 + 18, '#384255', F(800, 15));
      if (pinch) { // 집어 든 소금
        for (let i = 0; i < 9; i++) { const px = pinch.x + (hash(i, 2) - 0.5) * 12, py = pinch.y + (hash(i, 3) - 0.5) * 8; c.fillStyle = '#fff'; c.strokeStyle = 'rgba(80,90,110,.8)'; c.lineWidth = 0.6; c.fillRect(px - 2, py - 2, 4, 4); c.strokeRect(px - 2, py - 2, 4, 4); }
        c.strokeStyle = 'rgba(29,36,51,.35)'; c.setLineDash([3, 4]); c.beginPath(); c.moveTo(pinch.x, pinch.y + 8); c.lineTo(pinch.x, g.tableY); c.stroke(); c.setLineDash([]);
      } else if (!leaves[0].salt && !leaves[1].salt) { const bob = Math.sin(t * 4) * 3; c.fillStyle = '#1d2433'; c.beginPath(); c.moveTo(x - rx - 16, y - 4 + bob); c.lineTo(x - rx - 2, y - 10 + bob); c.lineTo(x - rx - 16, y - 16 + bob); c.fill(); }
    }

    function drawLens(c, g) {
      const L = g.lens, R = L.r;
      c.fillStyle = '#2a3142'; c.fillRect(g.SW, 0, g.W - g.SW, g.H);
      c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.moveTo(g.SW, 0); c.lineTo(g.SW, g.H); c.stroke();
      txt(c, '잎 세포 확대', L.x, 24, '#fbfcf9', F(800, 16));
      const pk = pick();
      if (pk) { c.strokeStyle = 'rgba(255,216,77,.55)'; c.lineWidth = 1.5; c.setLineDash([5, 5]); c.beginPath(); c.moveTo(pk.x + 10, pk.y - 4); c.lineTo(L.x - R * 0.7, L.y - R * 0.7); c.moveTo(pk.x + 10, pk.y + 4); c.lineTo(L.x - R * 0.7, L.y + R * 0.7); c.stroke(); c.setLineDash([]); }
      c.save(); c.beginPath(); c.arc(L.x, L.y, R, 0, TAU); c.clip();
      const X = (u) => L.x + u * R, Y = (v) => L.y + v * R, s = R / 115;
      if (!zoomed) {
        c.fillStyle = '#e6efd4'; c.fillRect(L.x - R, L.y - R, 2 * R, 2 * R);
        c.strokeStyle = 'rgba(110,140,70,.35)'; c.lineWidth = 3; for (let i = -3; i <= 3; i++) { c.strokeRect(X(-1.2 + (i % 2) * 0.4), Y(i * 0.34 - 0.1), R * 0.8, R * 0.34); c.strokeRect(X(-0.4 + (i % 2) * 0.4), Y(i * 0.34 - 0.1), R * 0.8, R * 0.34); }
        txt(c, '?', L.x, L.y + 22, 'rgba(60,90,30,.5)', F(800, 70));
      } else {
        const lf = leaves[zl], salty = lf.salt > 0, Z = zm, m = memM();
        // 바깥: 잎 겉의 용액(위)과 세포벽 사이
        c.fillStyle = salty ? '#dce9f2' : '#e9f2f6'; c.fillRect(L.x - R, L.y - R, 2 * R, 2 * R);
        // 이웃 세포(양옆·아래 조각)
        const wallBand = (x0, y0, x1, y1) => { const rr = 0.05 * R; c.beginPath(); c.roundRect(X(x0), Y(y0), (x1 - x0) * R, (y1 - y0) * R, rr); };
        c.fillStyle = '#d5e6b6'; [[-2.0, WALL.y0, -0.9, WALL.y1], [0.9, WALL.y0, 2.0, WALL.y1], [-1.2, WALL.y1 + 0.04, 0.2, 1.8], [0.24, WALL.y1 + 0.04, 1.6, 1.8]].forEach((b) => { wallBand(...b); c.fill(); c.strokeStyle = '#8fa65c'; c.lineWidth = 0.05 * R; c.stroke(); });
        // 가운데 세포: 세포벽(두꺼운 띠, 구멍이 숭숭)
        wallBand(WALL.x0, WALL.y0, WALL.x1, WALL.y1); c.fillStyle = salty && m > 0.08 ? '#e3eef3' : '#d5e6b6'; c.fill();
        c.strokeStyle = '#a9bf72'; c.lineWidth = 0.07 * R; c.stroke(); c.strokeStyle = '#6f8540'; c.lineWidth = 1.2; c.stroke();
        c.save(); c.setLineDash([2, 5]); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.2; c.stroke(); c.restore();
        // 원형질(세포막 안): 세포질 + 큰 액포 + 핵 + 엽록체
        const x0 = WALL.x0 + 0.07 + m, x1 = WALL.x1 - 0.07 - m, y0 = WALL.y0 + 0.07 + m, y1 = WALL.y1 - 0.07 - m * 0.55, rr = (0.05 + m * 0.7) * R;
        const memPath = (k = 0) => { c.beginPath(); c.roundRect(X(x0 + k), Y(y0 + k), (x1 - x0 - 2 * k) * R, (y1 - y0 - 2 * k) * R, Math.max(2, rr - k * R)); };
        memPath(); let gr = c.createLinearGradient(0, Y(y0), 0, Y(y1)); gr.addColorStop(0, '#eef7da'); gr.addColorStop(1, '#d9ebbd'); c.fillStyle = gr; c.fill();
        memPath(0.07); c.fillStyle = 'rgba(244,250,255,.85)'; c.fill(); c.strokeStyle = 'rgba(120,150,170,.45)'; c.lineWidth = 1; c.stroke();
        c.fillStyle = '#b9a3c8'; c.strokeStyle = '#6d5585'; c.lineWidth = 1; c.beginPath(); c.ellipse(X(x0 + 0.08), Y((y0 + y1) / 2 + 0.05), 0.07 * R, 0.1 * R, 0, 0, TAU); c.fill(); c.stroke();
        for (let i = 0; i < 7; i++) { const u = i / 7, px = lerp(x0 + 0.06, x1 - 0.06, u), py = i % 2 ? y0 + 0.035 : y1 - 0.035; c.fillStyle = '#5f9a37'; c.strokeStyle = '#2f5e18'; c.lineWidth = 0.8; c.beginPath(); c.ellipse(X(px), Y(py), 0.045 * R, 0.022 * R, 0, 0, TAU); c.fill(); c.stroke(); }
        memPath(); c.strokeStyle = '#e08a3c'; c.lineWidth = Math.max(2.5, 3.2 * s); c.stroke();
        // 분자
        Z.ions.forEach((p) => { if (p.kind === 'na') { ball(c, X(p.x), Y(p.y), 5.5 * s, '#a78bd6', '#55358f'); txt(c, '+', X(p.x), Y(p.y) + 4 * s, '#fff', F(800, 10 * s)); } else { ball(c, X(p.x), Y(p.y), 7.5 * s, '#7ccf72', '#2f7a2a'); txt(c, '−', X(p.x), Y(p.y) + 4 * s, '#fff', F(800, 11 * s)); } });
        Z.ws.forEach((p) => { if (p.pass) { c.fillStyle = `rgba(255,216,77,${p.pass})`; c.beginPath(); c.arc(X(p.x), Y(p.y), 11 * s, 0, TAU); c.fill(); } h2o(c, X(p.x), Y(p.y), s * 1.05, p.rot); });
        // 이름표
        const fs = Math.max(12, 14 * s);
        const tag = (str, x, y, col, al = 'center') => { c.font = F(800, fs); const w = c.measureText(str).width + 10; c.fillStyle = 'rgba(255,255,255,.85)'; const bx = al === 'left' ? X(x) - 5 : al === 'right' ? X(x) - w + 5 : X(x) - w / 2; c.fillRect(bx, Y(y) - fs, w, fs + 6); txt(c, str, X(x), Y(y), col, F(800, fs), al); };
        tag(salty ? '잎 겉의 진한 소금물' : '잎 겉의 물', 0, -0.62, salty ? '#1f5f8a' : '#384255');
        tag('세포벽', -0.62, WALL.y0 - 0.02, '#4f6a22');
        tag('세포막', x1 - 0.02, (y0 + y1) / 2 + 0.02, '#a8541a', 'right');
        tag('액포', 0.02, (y0 + y1) / 2 + 0.26, '#3b5a78');
      }
      c.restore();
      c.strokeStyle = '#11151f'; c.lineWidth = 7; c.beginPath(); c.arc(L.x, L.y, R + 3, 0, TAU); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 2; c.beginPath(); c.arc(L.x, L.y, R - 3, Math.PI * 1.1, Math.PI * 1.45); c.stroke();
      const foot = zoomed ? `나간 물 ${zm.out} · 들어온 물 ${zm.in}` : (leaves[0].w + leaves[1].w > 0.3 ? '처진 잎을 눌러 보자' : '잎을 누르면 확대');
      txt(c, foot, L.x, g.H - 10, '#ffd84d', F(700, 15));
    }

    function draw(c, W, H, dt) {
      const g = geo(W, H);
      for (let k = 0; k < 2; k++) step(dt / 2, g);
      c.clearRect(0, 0, W, H);
      drawScene(c, g); drawLens(c, g);
      const sl = leaves.find((l) => l.salt), w = sl ? sl.w : 0, other = leaves.find((l) => !l.salt);
      if (zoomed && leaves[zl].salt) say(leaves[zl].w > 0.35 ? '세포 속 <b>물</b>이 세포막을 지나 <b>진한 소금물 쪽</b>으로 더 많이 나간다 — 세포막이 세포벽에서 <b>떨어진다</b>' : '물 분자는 세포막을 드나들고, 소금 알갱이(이온)는 <b>막에 막힌다</b>');
      else if (zoomed) say('소금 없는 잎: 드나드는 물의 양이 <b>비슷해</b> 세포막이 세포벽에 붙어 팽팽하다');
      else if (!sl) say('굵은 소금을 집어 <b>왼쪽 잎</b> 위에서 문질러 뿌리자 · 오른쪽 잎은 비닐을 씌워 비교한다');
      else if (w < 0.15) say('소금을 뿌렸다 — 잎 표면을 잘 지켜보자');
      else if (w < 0.45) say('잎 겉에 <b>물방울</b>이 맺혀 흘러내린다. 이 물은 어디서 왔을까?');
      else say(`잎이 <b>축 처졌다</b>${other ? ' · 소금 없는 잎은 그대로' : ''} — 처진 잎을 <b>눌러</b> 세포를 확대하자`);
    }

    function zoomOn(li) { zoomed = true; if (zl !== li || !zm) { zl = li; initZoom(); } }
    const S = P.make(stage, {
      draw,
      down(p) {
        const g = geo(S.W, S.H), b = g.bowl;
        if (Math.abs(p.x - b.x) < 62 && Math.abs(p.y - b.y) < 46) { pinch = { x: p.x, y: p.y, lx: p.x, ly: p.y, acc: 0 }; return; }
        if (p.x < g.SW) { const h = hitLeaf(p.x, p.y); if (h) press = { x: p.x, y: p.y, li: h.li, moved: 0 }; }
      },
      move(p) {
        if (press) press.moved = Math.max(press.moved, Math.hypot(p.x - press.x, p.y - press.y));
        if (!pinch) return; const g = geo(S.W, S.H);
        pinch.x = clamp(p.x, 6, g.SW - 6); pinch.y = clamp(p.y, 10, g.tableY - 4);
        pinch.acc += Math.hypot(pinch.x - pinch.lx, pinch.y - pinch.ly); pinch.lx = pinch.x; pinch.ly = pinch.y;
        // 잎 위에서 문지를 때만 알갱이가 떨어진다(그릇에서 잎으로 옮기는 길에는 흘리지 않는다)
        const over = hitLeaf(pinch.x, pinch.y, 0) || hitLeaf(pinch.x, pinch.y + 24, 0);
        if (!over) pinch.acc = Math.min(pinch.acc, 5);
        while (over && pinch.acc > 5) { pinch.acc -= 5; falling.push({ x: pinch.x + (Math.random() - 0.5) * 12, y: pinch.y + 6, vx: (Math.random() - 0.5) * 20, vy: 20 + Math.random() * 30 }); }
      },
      up() { if (press && press.moved < 10) zoomOn(press.li); press = null; pinch = null; },
      key(e) {
        const k = e.key;
        if (k === '1') { saltLeaf(0, 30); return true; }
        if (k === ' ' || k === 'Enter') { const li = leaves.findIndex((l) => l.salt); zoomOn(li < 0 ? 0 : li); return true; }
        if (k === '0') { reset(); return true; } return false;
      },
    });
    function saltLeaf(li, n) { const g = geo(S.W, S.H); leaves.forEach((lf) => spine(lf, g)); for (let i = 0; i < n; i++) stickGrain(li, 0.25 + Math.random() * 0.7, (Math.random() - 0.5) * 1.6); }
    const state = () => ({ salt: leaves.map((l) => l.salt), wilt: leaves.map((l) => +l.w.toFixed(2)), beads: beads.length, puddle: +puddle.toFixed(2), zoomed, zl, out: zm ? zm.out : 0, in: zm ? zm.in : 0, mem: +memM().toFixed(2), msg });
    root._sl = {
      salt: (li, n = 30) => { saltLeaf(li, n); S.kick(); return state(); },
      zoom: (li) => { zoomOn(li); S.kick(); return state(); },
      run: (sec) => { const g = geo(S.W, S.H); for (let i = 0; i < sec * 60; i++) step(1 / 60, g); S.kick(); return state(); },
      leafAt: (li, s, u) => { const g = geo(S.W, S.H); spine(leaves[li], g); return leafAt(leaves[li], s, u); },
      geo: () => geo(S.W, S.H), state, reset: () => { reset(); S.kick(); },
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Salt = { mount };
})();
