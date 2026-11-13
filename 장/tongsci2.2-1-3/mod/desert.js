/* 사막화(교과서 85쪽): 사막 가장자리 초원(캔버스, 칸 48 × 24). 왼쪽은 원래 사막, 오른쪽 끝은 마을.
   도구(방목·경작·벌채·나무 심기·되돌리기)를 고르고 땅을 손가락으로 칠한다. 해마다(약 0.6초) 비가 오고(가뭄 해 표시) 풀이 자라거나 줄어든다.
   풀 덮개 v < 0.12인 맨땅이 2년 이어지면 바람에 깎여 사막이 되고, 사막은 바람이 부는 쪽(동쪽)의 약한 땅(v < 0.45)으로 번진다.
   나무를 심은 칸은 번짐을 막고 천천히 되살아난다. 마른 맨땅에서 모래 먼지(황사)가 마을 쪽으로 날린다. 모든 값은 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const NX = 48, NY = 24, RAIN = [1, 1.05, 0.9, 1, 0.45, 0.5, 1, 0.95, 1.1, 0.85, 1, 0.4, 0.9, 1, 1.05, 0.55];   // 가뭄 해 = 0.6보다 작음
  const TOOLS = { graze: '방목', crop: '경작', cut: '벌채', tree: '나무 심기', none: '되돌리기' };

  function mount(root) {
    const stage = root.querySelector('.ds-stage'), cv = stage.querySelector('canvas');
    const now = stage.querySelector('.ds-now'), yrEl = stage.querySelector('.ds-yr');
    const meters = Object.fromEntries([...root.querySelectorAll('.ds-m')].map((m) => [m.dataset.k, m]));
    const tools = [...root.querySelectorAll('.ds-tool')];
    let g = window.Stage.fit(cv), tool = 'graze', year = 0, acc = 0, tm = 0, food = 0;
    let C = [];
    const dust = [];
    function reset() {
      C = [];
      for (let y = 0; y < NY; y++) for (let x = 0; x < NX; x++) {
        const edge = 7 + Math.round(Math.sin(y * 0.7) * 1.5 + Math.sin(y * 1.9) * 0.8);
        const desert = x < edge;
        C.push({ x, y, v: desert ? 0 : clamp(0.62 + 0.25 * Math.sin(x * 0.9 + y * 1.3) * 0.5 + (x - edge) * 0.012, 0.4, 0.92), d: desert, u: 'none', e: 0, tr: 0, wood: !desert && (x * 7 + y * 13) % 11 === 0 });
      }
      year = 0; acc = 0; food = 0; dust.length = 0;
      read();
    }
    const at = (x, y) => (x < 0 || y < 0 || x >= NX || y >= NY ? null : C[y * NX + x]);
    function yearStep() {
      const R = RAIN[year % RAIN.length];
      let fy = 0;
      C.forEach((c) => {
        if (c.d) { if (c.u === 'tree') { c.tr += 1; if (c.tr >= 4) { c.d = false; c.v = 0.25; c.e = 0; } } return; }
        const press = { graze: 0.62, crop: 0.48, cut: 0.3, tree: 0, none: 0 }[c.u] * (1.5 - 0.5 * R);
        if (c.u === 'cut' && c.wood) { c.wood = false; c.v = Math.min(c.v, 0.25); }
        const grow = 0.3 * R * (1 - c.v) * (c.v > 0.03 ? 1 : 0.2) + (c.u === 'tree' ? 0.08 : 0);
        const dry = R < 0.6 ? 0.1 : 0;
        c.v = clamp(c.v + grow - press * c.v * 1.4 - dry * c.v, 0, 1);
        if (c.u === 'graze') fy += 0.7 * c.v; if (c.u === 'crop') fy += 1.0 * c.v * R;
        if (c.v < 0.12 && c.u !== 'tree') c.e += 1; else c.e = Math.max(0, c.e - 1);
        if (c.e >= 2) { c.d = true; c.v = 0; c.wood = false; }
      });
      // 바람(서 → 동)에 모래가 번진다: 사막 바로 동쪽의 약한 땅
      const spread = [];
      C.forEach((c) => { if (!c.d) return; [[1, 0], [1, 1], [1, -1], [0, 1], [0, -1]].forEach(([dx, dy]) => { const n = at(c.x + dx, c.y + dy); if (n && !n.d && n.u !== 'tree' && n.v < 0.45 && (dx || Math.random() < 0.3)) spread.push(n); }); });
      spread.forEach((n) => { n.e += 1; if (n.e >= 2) { n.d = true; n.v = 0; n.wood = false; } });
      food = fy; year += 1; read();
    }
    function read() {
      const land = C.length;
      const veg = C.reduce((s, c) => s + (c.d ? 0 : c.v), 0) / land, des = C.filter((c) => c.d).length / land;
      const bare = C.filter((c) => c.d && c.x > 9).length / land;
      const set = (k, v, txt) => { const m = meters[k]; m.querySelector('i').style.backgroundSize = (clamp(v, 0, 1) * 100).toFixed(0) + '% 100%'; m.querySelector('b').textContent = txt; };
      set('veg', veg, `${Math.round(veg * 100)} %`);
      set('des', des, `${Math.round(des * 100)} %`);
      set('food', food / 120, food < 1 ? '—' : `${Math.round(food)}`);
      set('dust', bare * 4, bare < 0.02 ? '조금' : bare < 0.12 ? '늘어남' : '심함');
      const R = RAIN[(year + RAIN.length - 1) % RAIN.length];
      yrEl.textContent = year ? `${year}년째 · ${R < 0.6 ? '가뭄' : '비 보통'}` : '0년째';
      yrEl.classList.toggle('dry', year > 0 && R < 0.6);
      const used = C.some((c) => c.u !== 'none');
      now.textContent = !used ? `도구를 고르고 초원을 칠해 보자 (지금: ${TOOLS[tool]})`
        : des > 0.42 ? '사막이 마을 쪽으로 번졌다 · 나무를 심어 막아 보자'
        : `지금 도구: ${TOOLS[tool]}`;
      root._dsState = { veg, des, food,year,used:C.some(c=>['graze','crop','cut'].includes(c.u)),restoring:C.some(c=>c.u==='tree'&&c.tr>3) };
    }
    function paint(px, py) {
      const cw = g.w / NX, ch = g.h / NY, cx = px / cw, cy = py / ch;
      C.forEach((c) => {
        if (Math.hypot(c.x + 0.5 - cx, (c.y + 0.5 - cy) * 1.1) > 1.9) return;
        if (tool === 'tree') { c.u = 'tree'; c.tr = c.tr || 0; }
        else if (tool === 'none') c.u = 'none';
        else if (!c.d) c.u = tool;
      });
      read(); draw();
    }
    // 그리기
    function draw() {
      const c = g.ctx, cw = g.w / NX, ch = g.h / NY;
      c.clearRect(0, 0, g.w, g.h);
      C.forEach((k) => {
        const x = k.x * cw, y = k.y * ch;
        if (k.d) { c.fillStyle = (k.x + k.y) % 2 ? '#e8cf96' : '#e3c88c'; }
        else { const v = k.v; c.fillStyle = `rgb(${Math.round(214 - 120 * v)},${Math.round(196 - 20 * v)},${Math.round(130 - 60 * v)})`; }
        c.fillRect(x, y, cw + 0.6, ch + 0.6);
        if (k.d && (k.x * 3 + k.y) % 5 === 0) { c.strokeStyle = 'rgba(160,120,60,.5)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + 2, y + ch * 0.7); c.quadraticCurveTo(x + cw / 2, y + ch * 0.2, x + cw - 2, y + ch * 0.7); c.stroke(); }
        if (!k.d && k.wood) { c.fillStyle = '#4f8a4a'; c.beginPath(); c.arc(x + cw / 2, y + ch / 2, Math.min(cw, ch) * 0.42, 0, 7); c.fill(); }
        if (k.u === 'graze' && !k.d) { c.fillStyle = '#fff'; c.beginPath(); c.ellipse(x + cw * 0.5 + Math.sin(tm * 2 + k.x) * 2, y + ch * 0.55, cw * 0.28, ch * 0.2, 0, 0, 7); c.fill(); c.fillStyle = '#333'; c.fillRect(x + cw * 0.72, y + ch * 0.45, 3, 3); }
        if (k.u === 'crop' && !k.d) { c.strokeStyle = '#8a5a2c'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 2, y + ch * 0.3); c.lineTo(x + cw - 2, y + ch * 0.3); c.moveTo(x + 2, y + ch * 0.7); c.lineTo(x + cw - 2, y + ch * 0.7); c.stroke(); }
        if (k.u === 'cut' && !k.d) { c.fillStyle = '#8c6b4b'; c.beginPath(); c.arc(x + cw / 2, y + ch / 2, Math.min(cw, ch) * 0.18, 0, 7); c.fill(); }
        if (k.u === 'tree') { c.fillStyle = '#2f7d3a'; c.beginPath(); c.moveTo(x + cw / 2, y + 2); c.lineTo(x + cw - 2, y + ch - 3); c.lineTo(x + 2, y + ch - 3); c.closePath(); c.fill(); }
      });
      // 마을(오른쪽 끝)
      const vx = g.w - 46;
      for (let i = 0; i < 4; i++) { const yy = g.h * (0.2 + i * 0.2); c.fillStyle = '#f4efe6'; c.fillRect(vx, yy, 30, 22); c.fillStyle = '#c96f55'; c.beginPath(); c.moveTo(vx - 4, yy); c.lineTo(vx + 15, yy - 14); c.lineTo(vx + 34, yy); c.fill(); c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; c.strokeRect(vx, yy, 30, 22); }
      window.Stage.label(c, '마을', vx + 15, g.h * 0.12, '700 18px "IBM Plex Sans KR", sans-serif');
      window.Stage.label(c, '바람 →', 70, 26, '700 18px "IBM Plex Sans KR", sans-serif');
      // 먼지
      dust.forEach((p) => { c.fillStyle = `rgba(190,150,90,${(0.5 * (1 - p.t / 3)).toFixed(2)})`; c.beginPath(); c.arc(p.x, p.y, 6 + p.t * 6, 0, 7); c.fill(); });
    }
    function step(dt) {
      tm += dt; acc += dt;
      if (acc > 0.6) { acc = 0; yearStep(); }
      // 먼지: 마을 쪽으로 퍼지는 맨땅에서
      const cw = g.w / NX, ch = g.h / NY;
      const src = C.filter((k) => k.d && k.x > 9);
      if (src.length && Math.random() < Math.min(0.9, src.length / 80)) { const k = src[Math.floor(Math.random() * src.length)]; dust.push({ x: k.x * cw, y: k.y * ch, t: 0 }); }
      for (let i = dust.length - 1; i >= 0; i--) { const p = dust[i]; p.t += dt; p.x += 90 * dt; p.y -= 6 * dt; if (p.t > 3) dust.splice(i, 1); }
      draw();
    }
    // 칠하기
    const local = (e) => { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left) / r.width * g.w, (e.clientY - r.top) / r.height * g.h]; };
    let down = false;
    cv.addEventListener('pointerdown', (e) => { down = true; try { cv.setPointerCapture(e.pointerId); } catch { /* 합성 */ } paint(...local(e)); });
    cv.addEventListener('pointermove', (e) => { if (down) paint(...local(e)); });
    const up = () => { down = false; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); paint(g.w * (0.3 + Math.random() * 0.5), g.h * Math.random()); } });
    tools.forEach((b) => b.addEventListener('click', () => { tool = b.dataset.k; tools.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); read(); }));
    root.querySelector('.ds-reset').addEventListener('click', () => { reset(); draw(); });
    reset();
    const loop = window.Stage.loop(step);
    root._ds = {
      tool(k) { tool = k; tools.forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.k === k))); },
      paintRect(x0, y0, x1, y1) { C.forEach((c) => { if (c.x >= x0 && c.x <= x1 && c.y >= y0 && c.y <= y1) { if (tool === 'tree') c.u = 'tree'; else if (tool === 'none') c.u = 'none'; else if (!c.d) c.u = tool; } }); read(); draw(); },
      years(n) { for (let i = 0; i < n; i++) yearStep(); draw(); },
      reset() { reset(); draw(); },
    };
    return {
      setActive(on) { if (on) { g = window.Stage.fit(cv); draw(); if (!window.Stage.reduce) loop.start(); } else loop.stop(); },
      fit() { g = window.Stage.fit(cv); draw(); },
    };
  }
  window.Desert = { mount };
})();
