/* 3-1 2차시 체험 «물의 순환과 지형»(교과서 108~109쪽 해 보기 · 측주 «물의 순환과 지형» + 참고서 129~130쪽).
   풍경 단면(바다·해안 평야·산·강·지하수층·하늘·태양). 왼쪽 위 햇빛 손잡이를 끌어 세게 하면 바다에서 수증기 알갱이가 올라가
   (증발 — 에너지 흡수) 하늘에서 구름으로 모인다(응결 — 에너지 방출 반짝임). 구름을 끌어 산 위로 옮기면 비가 내리고,
   빗물이 강을 따라 흐르며 상류 V자 계곡이 깊어지고 산기슭에 선상지, 하구에 삼각주가 쌓인다. 일부는 땅속 지하수로 흐른다.
   구름이 물을 너무 많이 머금으면 바다 위에서도 비가 와서, 오래 돌리면 증발량과 강수량이 같아진다.
   양·속도는 이해를 돕기 위한 그림. WCycle.mount(root) → { fit, setActive } · 시험용: root._wc.sun(0~1) · rain(초) · state() */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  // 지표 높이(0~1, 위가 0): 바다(~0.37) → 해안 평야 → 산(꼭대기 0.79W) → 오른쪽 끝
  const SEA = 0.6;
  const groundY = (u) => (u < 0.37 ? 0.86 - 0.18 * Math.min(1, u / 0.3) : u < 0.52 ? 0.6 - (u - 0.37) * 0.15 : u < 0.79 ? 0.578 - (u - 0.52) / 0.27 * 0.36 : 0.218 + (u - 0.79) / 0.21 * 0.22);
  console.assert(groundY(0.79) < groundY(0.6) && groundY(0.45) < 0.62, 'wcycle: 산이 평야보다 높다');
  // 강줄기(정규 좌표): 꼭대기 근처 → 산비탈 → 산기슭 → 평야 → 하구
  const RIVER = [[0.76, 0.27], [0.7, 0.36], [0.63, 0.46], [0.55, 0.555], [0.47, 0.585], [0.4, 0.6], [0.365, 0.605]];

  function mount(root) {
    const stage = root.querySelector('.wc-stage'), now = root.querySelector('.wc-now'), out = root.querySelector('.wc-out');
    const bars = { ev: root.querySelector('.wc-ev i'), rn: root.querySelector('.wc-rn i'), ab: root.querySelector('.wc-ab i'), re: root.querySelector('.wc-re i') };
    const nums = { ev: root.querySelector('.wc-ev b'), rn: root.querySelector('.wc-rn b') };
    const P = window.Play;
    let sun = 0.25, cloud, vapor, drops, flow, seep, land, tot, t, drag, msg, did, bg = null, bgKey = '', meterT = 0, flashes;
    function reset() {
      cloud = { x: 0.2, w: 0.15 }; vapor = []; drops = []; flow = []; seep = []; flashes = [];
      land = { valley: 0, fan: 0, delta: 0 }; tot = { ev: 0, rn: 0, ab: 0, re: 0, mtn: 0 }; t = 0; drag = null; msg = ''; did = { cloud: false, rain: false };
      sun = 0.25;
    }
    reset();
    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };
    const X = (u) => u * S.W, Y = (v) => v * S.H;
    const sunPos = () => [X(0.09), Y(0.13)], slider = () => ({ x0: X(0.16), x1: X(0.36), y: 26 });

    function paintBg(W, H) {
      const k = Math.max(1, Math.min(2, window.devicePixelRatio || 1)), cv = document.createElement('canvas'); cv.width = W * k; cv.height = H * k;
      const c = cv.getContext('2d'); c.setTransform(k, 0, 0, k, 0, 0);
      const sk = c.createLinearGradient(0, 0, 0, H * 0.6); sk.addColorStop(0, '#5b9fd8'); sk.addColorStop(1, '#cfe7f6'); c.fillStyle = sk; c.fillRect(0, 0, W, H);
      // 바다
      const sea = c.createLinearGradient(0, H * SEA, 0, H); sea.addColorStop(0, '#2f8fcf'); sea.addColorStop(0.5, '#1b5f9c'); sea.addColorStop(1, '#0d2f5c');
      c.fillStyle = sea; c.fillRect(0, H * SEA, W * 0.4, H);
      // 땅 단면(지층 띠) — 지표선 아래 전부
      const surf = () => { c.beginPath(); c.moveTo(0, H); for (let u = 0; u <= 1.001; u += 0.005) c.lineTo(u * W, groundY(u) * H); c.lineTo(W, H); c.closePath(); };
      const soil = c.createLinearGradient(0, H * 0.25, 0, H); soil.addColorStop(0, '#8a6a44'); soil.addColorStop(0.5, '#6e5134'); soil.addColorStop(1, '#3f2d1d');
      c.fillStyle = soil; surf(); c.fill();
      c.save(); surf(); c.clip();
      for (let i = 0; i < 6; i++) { c.strokeStyle = `rgba(40,25,10,${0.18 + i * 0.03})`; c.lineWidth = 2; c.beginPath(); for (let u = 0; u <= 1; u += 0.01) { const y = H * (0.66 + i * 0.05) + Math.sin(u * 9 + i) * 4; u ? c.lineTo(u * W, y) : c.moveTo(0, y); } c.stroke(); }
      // 지하수층(물이 스며 있는 모래·자갈층)
      const gw = c.createLinearGradient(0, H * 0.8, 0, H * 0.9); gw.addColorStop(0, 'rgba(110,170,220,.55)'); gw.addColorStop(1, 'rgba(60,110,170,.65)');
      c.fillStyle = gw; c.fillRect(W * 0.3, H * 0.8, W * 0.7, H * 0.09);
      c.fillStyle = 'rgba(230,240,250,.35)'; for (let i = 0; i < 160; i++) { const x = W * 0.3 + ((i * 97) % 1000) / 1000 * W * 0.7, y = H * (0.805 + ((i * 53) % 100) / 100 * 0.08); c.beginPath(); c.arc(x, y, 1.6, 0, TAU); c.fill(); }
      c.restore();
      // 풀·산 표면(초록 → 바위 → 눈)
      c.save(); surf(); c.clip();
      const gr = c.createLinearGradient(0, H * 0.22, 0, H * 0.64); gr.addColorStop(0, '#f4f6f8'); gr.addColorStop(0.12, '#9aa3a8'); gr.addColorStop(0.35, '#4f8f4a'); gr.addColorStop(1, '#7cae55');
      c.fillStyle = gr; c.beginPath(); for (let u = 0.36; u <= 1.001; u += 0.005) { const y = groundY(u) * H; u > 0.36 ? c.lineTo(u * W, y) : c.moveTo(u * W, y); } for (let u = 1; u >= 0.36; u -= 0.005) c.lineTo(u * W, groundY(u) * H + 14); c.fill();
      c.restore();
      // 나무
      for (let i = 0; i < 9; i++) { const u = 0.42 + i * 0.035; if (u > 0.68) break; const gx = u * W, gy = groundY(u) * H; c.fillStyle = '#5a3e22'; c.fillRect(gx - 1.5, gy - 10, 3, 10); const cg = c.createRadialGradient(gx - 3, gy - 18, 1, gx, gy - 14, 10); cg.addColorStop(0, '#7fc46a'); cg.addColorStop(1, '#2f6a32'); c.fillStyle = cg; c.beginPath(); c.arc(gx, gy - 15, 8, 0, TAU); c.fill(); }
      // 이름
      P.txt(c, '바다', W * 0.14, H * 0.74, 'rgba(255,255,255,.8)', '800 16px'); P.txt(c, '지하수', W * 0.86, H * 0.86, 'rgba(255,255,255,.85)', '800 13px'); P.txt(c, '산', W * 0.8, H * 0.2, '#1d2433', '800 15px');
      return cv;
    }
    function riverPt(s) { const n = RIVER.length - 1, f = Math.min(n - 1e-6, Math.max(0, s * n)), i = Math.floor(f), r = f - i; return [RIVER[i][0] + (RIVER[i + 1][0] - RIVER[i][0]) * r, RIVER[i][1] + (RIVER[i + 1][1] - RIVER[i][1]) * r]; }
    function cloudShape(c, x, y, w, dark) {
      const r = 18 + w * 26, g = c.createRadialGradient(x - r * 0.3, y - r * 0.5, 2, x, y, r * 1.6);
      const top = dark ? '#b7c0cc' : '#ffffff', bot = dark ? '#6c7686' : '#d9e2ec'; g.addColorStop(0, top); g.addColorStop(1, bot);
      c.fillStyle = g; c.beginPath(); [[-1, 0.15, 0.7], [-0.4, -0.25, 0.9], [0.3, -0.15, 1], [0.95, 0.15, 0.7], [0, 0.25, 0.9]].forEach(([a, b, s]) => { c.moveTo(x + a * r + s * r, y + b * r); c.arc(x + a * r, y + b * r, s * r, 0, TAU); }); c.fill();
    }
    function step(dt) {
      t += dt;
      // 증발: 햇빛이 셀수록 많이
      if (Math.random() < sun * sun * dt * 22) { vapor.push({ x: 0.03 + Math.random() * 0.32, y: SEA, vy: 0.06 + Math.random() * 0.04 }); tot.ev += 1; tot.ab += 1; flashes.push({ x: vapor[vapor.length - 1].x, y: SEA - 0.01, t: 0.6, k: 'ab' }); }
      vapor.forEach((v) => { v.y -= v.vy * dt; v.x += (cloud.x - v.x) * dt * 0.5 + Math.sin(t * 2 + v.y * 30) * 0.004; if (v.y < 0.2) { v.dead = true; cloud.w = Math.min(1.6, cloud.w + 0.03); tot.re += 1; flashes.push({ x: v.x, y: 0.2, t: 0.5, k: 're' }); } });
      vapor = vapor.filter((v) => !v.dead);
      // 강수: 산 위면 비, 바다 위라도 너무 무거우면 비
      const overMtn = cloud.x > 0.5, raining = cloud.w > 0.2 && (overMtn || cloud.w > 1.2);
      if (raining && Math.random() < dt * 30) {
        const r = 18 + cloud.w * 26; drops.push({ x: cloud.x + (Math.random() - 0.5) * r * 2 / S.W, y: 0.22, m: overMtn });
        cloud.w = Math.max(0, cloud.w - 0.03); tot.rn += 1; if (overMtn) tot.mtn += 1;
      }
      drops.forEach((d) => { d.y += 0.55 * dt; const gy = d.x < 0.37 ? SEA : groundY(d.x); if (d.y >= gy) { d.dead = true; if (d.x > 0.37) { if (Math.random() < 0.7) flow.push({ s: Math.max(0, Math.min(0.4, (0.79 - Math.min(d.x, 0.79)) / 0.45)) }); else seep.push({ x: d.x, y: gy + 0.02 }); } } });
      drops = drops.filter((d) => !d.dead);
      flow.forEach((f) => { f.s += dt * 0.3; if (f.s >= 1) f.dead = true; if (f.s < 0.45) land.valley = Math.min(1, land.valley + dt * 0.02); else if (f.s < 0.62) land.fan = Math.min(1, land.fan + dt * 0.02); else if (f.s > 0.88) land.delta = Math.min(1, land.delta + dt * 0.03); });
      flow = flow.filter((f) => !f.dead);
      seep.forEach((s) => { if (s.y < 0.84) s.y += dt * 0.08; else s.x -= dt * 0.07; if (s.x < 0.3) s.dead = true; });
      seep = seep.filter((s) => !s.dead);
      flashes.forEach((f) => { f.t -= dt; }); flashes = flashes.filter((f) => f.t > 0);
      if (sun > 0.6 && cloud.w > 0.6) did.cloud = true;
      if (tot.mtn > 15) did.rain = true;
    }
    function steps() {
      const ok = []; if (did.cloud) ok.push(1); if (did.rain) ok.push(2); if (land.valley > 0.6 && land.fan > 0.6 && land.delta > 0.6) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 햇빛 손잡이를 끌어 햇빛을 세게 하자' : st === 2 ? '② 구름을 끌어 산 위로 옮기자' : st === 3 ? '③ 비가 계속 오게 해 계곡·선상지·삼각주를 키우자' : '물이 돌며 날씨와 땅 모양을 바꾼다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
      const overMtn = cloud.x > 0.5;
      say(st === 1 ? `햇빛 세기 ${Math.round(sun * 100)}% — 바닷물이 <b>태양 에너지를 흡수</b>해 수증기가 되어 올라간다` :
        overMtn && cloud.w > 0.2 ? '산 위 구름에서 <b>비</b>가 내린다 — 빗물은 강을 따라 흐르며 땅을 깎고 실어 나르고, 일부는 땅속으로 스며 <b>지하수</b>가 된다' :
        `수증기가 하늘에서 식어 <b>응결</b>하면 구름이 되며 에너지를 <b>내놓는다</b>(반짝임) — 구름 물 ${Math.round(cloud.w * 60)}`);
    }
    function meters() {
      const m = Math.max(40, tot.ev, tot.rn); bars.ev.style.width = `${tot.ev / m * 100}%`; bars.rn.style.width = `${tot.rn / m * 100}%`;
      const n = Math.max(40, tot.ab, tot.re); bars.ab.style.width = `${tot.ab / n * 100}%`; bars.re.style.width = `${tot.re / n * 100}%`;
      nums.ev.textContent = tot.ev; nums.rn.textContent = tot.rn;
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        if (dt) step(Math.min(dt, 0.05));
        const key = `${W}x${H}`; if (key !== bgKey) { bg = paintBg(W, H); bgKey = key; }
        c.drawImage(bg, 0, 0, W, H);
        // 햇빛 세기만큼 하늘 밝게
        c.fillStyle = `rgba(255,236,170,${sun * 0.18})`; c.fillRect(0, 0, W, H * SEA);
        const [sx, sy] = sunPos(); P.glow(c, sx, sy, 40 + sun * 70, `rgba(255,214,90,${0.5 + sun * 0.4})`); const sg = c.createRadialGradient(sx - 6, sy - 6, 2, sx, sy, 26); sg.addColorStop(0, '#fffbe0'); sg.addColorStop(1, '#f6b52a'); c.fillStyle = sg; c.beginPath(); c.arc(sx, sy, 24, 0, TAU); c.fill();
        // 햇빛 줄기(바다로)
        c.strokeStyle = `rgba(255,230,140,${0.15 + sun * 0.4})`; c.lineWidth = 2; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(sx + 20, sy + 18 + i * 4); c.lineTo(X(0.12 + i * 0.07), Y(SEA)); c.stroke(); }
        // 지형 변화: V자 계곡(상류를 깎음), 선상지(산기슭 부채꼴), 삼각주(하구)
        if (land.valley > 0.02) { const [u, v] = RIVER[1], gx = X(u), gy = Y(v), d = 6 + land.valley * 30; c.fillStyle = '#5b4128'; c.beginPath(); c.moveTo(gx - 16 - land.valley * 10, gy - 4); c.lineTo(gx, gy + d); c.lineTo(gx + 16 + land.valley * 10, gy + 4); c.fill(); c.strokeStyle = '#3f2d1d'; c.lineWidth = 1.5; c.stroke(); P.txt(c, 'V자 계곡', gx + 34, gy + 4, '#fff', '800 12px', 'left'); }
        if (land.fan > 0.02) { const [u, v] = RIVER[3], gx = X(u), gy = Y(v), r = 10 + land.fan * 42, fg = c.createRadialGradient(gx, gy, 2, gx, gy, r); fg.addColorStop(0, '#d9c08a'); fg.addColorStop(1, '#b49460'); c.fillStyle = fg; c.beginPath(); c.moveTo(gx, gy - 4); c.arc(gx, gy - 4, r, Math.PI * 0.55, Math.PI * 1.05); c.closePath(); c.fill(); P.txt(c, '선상지', gx - r * 0.5, gy + 18, '#fff', '800 12px'); }
        if (land.delta > 0.02) { const [u] = RIVER[6], gx = X(u), gy = Y(SEA), s = 8 + land.delta * 40, dg = c.createLinearGradient(gx, gy, gx - s, gy); dg.addColorStop(0, '#d8c48f'); dg.addColorStop(1, '#bfa26a'); c.fillStyle = dg; c.beginPath(); c.moveTo(gx + 4, gy - 3); c.lineTo(gx - s, gy + 2); c.lineTo(gx - s * 0.2, gy + s * 0.35); c.closePath(); c.fill(); P.txt(c, '삼각주', gx - s * 0.6, gy + s * 0.35 + 14, '#fff', '800 12px'); }
        // 강
        const strong = flow.length > 4; c.strokeStyle = strong ? '#3f9fe0' : 'rgba(80,150,210,.7)'; c.lineWidth = strong ? 5 : 3; c.lineCap = 'round'; c.beginPath(); RIVER.forEach(([u, v], i) => (i ? c.lineTo(X(u), Y(v)) : c.moveTo(X(u), Y(v)))); c.stroke();
        flow.forEach((f) => { const [u, v] = riverPt(f.s); c.fillStyle = '#d6efff'; c.beginPath(); c.arc(X(u), Y(v), 2.6, 0, TAU); c.fill(); });
        seep.forEach((s) => { c.fillStyle = 'rgba(140,200,255,.9)'; c.beginPath(); c.arc(X(s.x), Y(s.y), 2.4, 0, TAU); c.fill(); });
        // 바다 물결
        c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 2; c.beginPath(); for (let x = 0; x <= X(0.37); x += 6) { const y = Y(SEA) + Math.sin(x * 0.07 + t * 3) * 1.6; x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
        // 수증기(옅은 알갱이)·빗방울
        vapor.forEach((v) => { c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.arc(X(v.x), Y(v.y), 3, 0, TAU); c.fill(); });
        c.strokeStyle = 'rgba(70,130,210,.85)'; c.lineWidth = 2; drops.forEach((d) => { c.beginPath(); c.moveTo(X(d.x), Y(d.y)); c.lineTo(X(d.x) - 1.5, Y(d.y) + 8); c.stroke(); });
        // 에너지 흡수(+)·방출(*) 반짝임
        flashes.forEach((f) => { const a = Math.min(1, f.t * 2); if (f.k === 'ab') P.txt(c, '+열', X(f.x), Y(f.y) - (0.6 - f.t) * 30, `rgba(255,120,80,${a})`, '800 12px'); else P.glow(c, X(f.x), Y(f.y), 12, `rgba(255,240,150,${a})`); });
        // 구름
        const cx = X(cloud.x), cy = Y(0.17); cloudShape(c, cx, cy, Math.min(1.2, cloud.w), cloud.w > 0.8);
        if (!drag && !did.rain && cloud.w > 0.5) { const a = 0.5 + 0.5 * Math.sin(t * 4); c.strokeStyle = `rgba(255,216,77,${a})`; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, 30 + cloud.w * 30, 0, TAU); c.stroke(); P.txt(c, '끌어서 산으로 →', cx, cy + 50 + cloud.w * 20, '#1d2433', '800 13px'); }
        // 햇빛 손잡이
        const sl = slider(), kx = sl.x0 + sun * (sl.x1 - sl.x0); c.fillStyle = 'rgba(29,36,51,.35)'; c.beginPath(); c.roundRect(sl.x0, sl.y - 3, sl.x1 - sl.x0, 6, 3); c.fill();
        c.fillStyle = '#f6b52a'; c.beginPath(); c.roundRect(sl.x0, sl.y - 3, kx - sl.x0, 6, 3); c.fill();
        const kg = c.createRadialGradient(kx - 3, sl.y - 3, 1, kx, sl.y, 12); kg.addColorStop(0, '#fff7c8'); kg.addColorStop(1, '#e8a91a'); c.fillStyle = kg; c.beginPath(); c.arc(kx, sl.y, 12, 0, TAU); c.fill();
        P.txt(c, `햇빛 ${Math.round(sun * 100)}%`, sl.x1 + 10, sl.y + 5, '#1d2433', '800 13px', 'left');
        meterT += dt; if (meterT > 0.2 || !dt) { meterT = 0; meters(); steps(); }
      },
      down(p) {
        const sl = slider(); if (Math.abs(p.y - sl.y) < 22 && p.x > sl.x0 - 20 && p.x < sl.x1 + 20) { drag = 'sun'; sun = Math.max(0, Math.min(1, (p.x - sl.x0) / (sl.x1 - sl.x0))); return; }
        const cx = X(cloud.x), cy = Y(0.17); if (Math.hypot(p.x - cx, p.y - cy) < 50 + cloud.w * 30 || (p.y < Y(0.35) && Math.abs(p.x - cx) < 90)) { drag = 'cloud'; }
      },
      move(p, e, held) { if (!held || !drag) return; if (drag === 'sun') { const sl = slider(); sun = Math.max(0, Math.min(1, (p.x - sl.x0) / (sl.x1 - sl.x0))); } else cloud.x = Math.max(0.08, Math.min(0.92, p.x / S.W)); },
      up() { drag = null; },
      key(e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { sun = Math.max(0, Math.min(1, sun + (e.key === 'ArrowRight' ? 0.1 : -0.1))); return true; }
        if (e.key === ' ' || e.key === 'Enter') { cloud.x = cloud.x > 0.5 ? 0.2 : 0.72; return true; } return false;
      },
    });
    root.querySelector('.wc-reset').addEventListener('click', () => { reset(); msg = ''; meters(); steps(); S.kick(); });
    meters(); steps();
    // 시험용: 화면 없이 시간을 빨리 돌린다
    const run = (sec) => { for (let k = 0; k < sec * 30; k++) step(1 / 30); meters(); steps(); S.kick(); };
    root._wc = {
      sun: (v) => { sun = Math.max(0, Math.min(1, v)); run(3); return { sun, cloud: +cloud.w.toFixed(2) }; },
      rain: (sec) => { cloud.x = 0.72; cloud.w = Math.max(cloud.w, 0.9); sun = Math.max(sun, 0.8); run(sec); return root._wc.state(); },
      state: () => ({ sun, cloud: { x: +cloud.x.toFixed(2), w: +cloud.w.toFixed(2) }, ev: tot.ev, rn: tot.rn, valley: +land.valley.toFixed(2), fan: +land.fan.toFixed(2), delta: +land.delta.toFixed(2) }),
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.WCycle = { mount };
})();
