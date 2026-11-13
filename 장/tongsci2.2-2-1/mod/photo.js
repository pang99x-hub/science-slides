/* 광합성 조각. 햇빛 세기 막대: 빛(노랑 빛줄기)이 잎에 닿으면 뿌리에서 올라온 물(파랑)·공기의 이산화 탄소(회색)와 함께
   포도당(화학 에너지, 보라 육각형)이 생겨 잎에 쌓이고 산소가 나간다. 빛이 약하면 느리게, 없으면 만들지 못한다.
   시간 막대(0~4): 지금 → 먹이로(토끼가 먹고 화학 에너지가 옮겨 감) → 묻힘(흙이 덮음) → 열·압력(눌리고 데워짐)
   → 석탄·석유(옛 햇빛이 저장된 화학 에너지). 단계(→)로 넘기면 시간이 끝까지 흐른다. */
(function () {
  'use strict';
  const { tok, label } = window.Stage;
  const TAU = Math.PI * 2;
  const LEAF = '#3f8f4a', LEAF_D = '#2d6b36', LEAF_L = '#6fb26a', WATER = '#3a8fd0', CO2 = '#8b93a3', BROWN = '#8a6a3a';
  const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
  const ease = (x) => x * x * (3 - 2 * x);

  function mount(root) {
    const cv = root.querySelector('.ph-cv');
    const lightIn = root.querySelector('#ph-light'), lvEl = root.querySelector('.ph-lv');
    const timeIn = root.querySelector('#ph-time'), nowBtn = root.querySelector('#ph-now');
    const nEl = root.querySelector('.ph-n'), stEl = root.querySelector('.ph-state'), rateEl = root.querySelector('.ph-rate i');
    let g = window.Stage.fit(cv), L = null, made = 0, store = { light: 0, co2: 0, w: 0 };
    let P = [], glu = [], fx = [], spawn = { l: 0, c: 0, w: 0 }, events = [], clock = 0, T = 0, Tto = 0, tween = null;
    const light = () => lightIn.value / 100;
    function layout(w, h) {
      const gy = h * 0.66, sx = w * 0.52;
      const leafPath = (bx, by, tx, ty, k) => {
        const p = new Path2D(), mx = (bx + tx) / 2, my = (by + ty) / 2, nx = -(ty - by), ny = tx - bx;
        p.moveTo(bx, by);
        p.bezierCurveTo(mx + nx * k, my + ny * k, tx - (tx - bx) * 0.12, ty + 30, tx, ty);
        p.bezierCurveTo(tx - (tx - bx) * 0.25, ty - 14, mx - nx * k, my - ny * k, bx, by);
        return p;
      };
      const main = { b: { x: sx + 6, y: h * 0.4 }, t: { x: w * 0.9, y: h * 0.13 } };
      return {
        w, h, gy, sx, sun: { x: 116, y: 150, r: 44 }, main, rabbitX: w * 0.82,
        leaves: [
          { p: leafPath(main.b.x, main.b.y, main.t.x, main.t.y, 0.34), ...main },
          { p: leafPath(sx, h * 0.5, w * 0.27, h * 0.36, 0.3), b: { x: sx, y: h * 0.5 }, t: { x: w * 0.27, y: h * 0.36 } },
          { p: leafPath(sx + 4, h * 0.26, w * 0.6, h * 0.1, 0.36), b: { x: sx + 4, y: h * 0.26 }, t: { x: w * 0.6, y: h * 0.1 } },
        ],
      };
    }
    const scale = () => cv.width / L.w;
    function leafPoint() {                                      // 큰 잎 안쪽의 아무 점
      const ctx = cv.getContext('2d'), lf = L.leaves[0];
      for (let i = 0; i < 40; i++) {
        const u = 0.15 + Math.random() * 0.75, x = lf.b.x + (lf.t.x - lf.b.x) * u + (Math.random() - 0.5) * 150, y = lf.b.y + (lf.t.y - lf.b.y) * u + (Math.random() - 0.5) * 150;
        if (ctx.isPointInPath(lf.p, x * scale(), y * scale())) return { x, y };
      }
      return { x: (lf.b.x + lf.t.x) / 2, y: (lf.b.y + lf.t.y) / 2 };
    }
    function add(kind) {
      const to = leafPoint();
      if (kind === 'light') P.push({ k: kind, x: L.sun.x, y: L.sun.y, to, v: 520 });
      else if (kind === 'co2') P.push({ k: kind, x: L.w + 12, y: L.h * (0.1 + Math.random() * 0.4), to, v: 70 });
      else P.push({ k: kind, x: L.sx + (Math.random() - 0.5) * 130, y: L.gy + 60 + Math.random() * 30, to, v: 120, up: true });
    }
    function react() {
      while (store.light > 0 && store.co2 > 0 && store.w > 0) {
        store.light--; store.co2--; store.w--; made++; nEl.textContent = made; events.push(clock);
        const p = leafPoint();
        glu.push({ x: p.x, y: p.y, a: Math.random() * Math.PI, t: 0 }); if (glu.length > 80) glu.shift();
        fx.push({ k: 'o2', x: p.x, y: p.y, vy: -60 - Math.random() * 40, vx: 30 + Math.random() * 40, t: 0 });
      }
    }
    function step(dt) {
      if (!L) return;
      clock += dt;
      const growing = T < 0.4, lt = light();
      if (growing) {
        spawn.l += dt * lt; spawn.c += dt; spawn.w += dt;
        while (spawn.l > 0.07) { spawn.l -= 0.07; add('light'); }
        while (spawn.c > 0.28) { spawn.c -= 0.28; if (P.filter((p) => p.k === 'co2').length < 14) add('co2'); }
        while (spawn.w > 0.28) { spawn.w -= 0.28; if (P.filter((p) => p.k === 'water').length < 14) add('water'); }
      }
      for (const p of P) {
        let tx = p.to.x, ty = p.to.y;
        if (p.up) { if (p.y > L.gy - 4) { tx = L.sx; ty = L.gy - 8; } else if (p.y > L.main.b.y + 6) { tx = L.sx + 3; ty = L.main.b.y; } }
        const dx = tx - p.x, dy = ty - p.y, d = Math.hypot(dx, dy);
        if (d < 7) {
          if (p.up && (tx !== p.to.x || ty !== p.to.y)) { p.x = tx; p.y = ty; continue; }
          p.done = true; store[p.k === 'water' ? 'w' : p.k]++;
          if (p.k === 'light') fx.push({ k: 'hit', x: p.x, y: p.y, t: 0 });
          continue;
        }
        const wob = p.k === 'co2' ? Math.sin((p.x + p.y) * 0.03) * 20 : 0;
        p.x += (dx / d) * p.v * dt; p.y += (dy / d) * p.v * dt + wob * dt;
      }
      P = P.filter((p) => !p.done && T < 0.4);
      store.light = Math.min(store.light, 6); store.co2 = Math.min(store.co2, 6); store.w = Math.min(store.w, 6);
      react();
      for (const q of glu) q.t += dt;
      for (const f of fx) { f.t += dt; if (f.k === 'o2') { f.x += f.vx * dt; f.y += f.vy * dt; } }
      fx = fx.filter((f) => (f.k === 'o2' ? f.t < 3 : f.t < 0.5));
      events = events.filter((e) => clock - e < 6);
      rateEl.style.width = Math.min(100, events.length / 18 * 100) + '%';
      stEl.textContent = T > 3.95 ? '석탄·석유가 되었어요' : T > 0.4 ? '시간이 흐르는 중…' : lt === 0 ? '빛이 없어 만들지 못해요' : lt < 0.35 ? '빛이 약해 느리게 만들어요' : '햇빛을 받아 만드는 중';
      draw();
    }
    // ---------- 그리기 ----------
    function hex(ctx, x, y, r, a, alpha = 1) {
      ctx.globalAlpha = alpha; ctx.beginPath();
      for (let i = 0; i < 6; i++) { const t = a + i * Math.PI / 3; ctx[i ? 'lineTo' : 'moveTo'](x + Math.cos(t) * r, y + Math.sin(t) * r); }
      ctx.closePath(); ctx.fillStyle = tok('e-chem'); ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = tok('ink'); ctx.stroke(); ctx.globalAlpha = 1;
    }
    function plant(ctx, k, eaten) {                              // k: 0 살아 있음 → 1 쓰러져 갈색
      const dead = clamp(k), fall = ease(clamp(k * 1.4));
      ctx.save();
      ctx.translate(L.sx, L.gy); ctx.rotate(fall * 1.45); ctx.translate(-L.sx, -L.gy);
      const tint = (c) => (dead > 0.05 ? (dead > 0.5 ? BROWN : '#8f8a3e') : c);
      ctx.strokeStyle = tint(LEAF_D); ctx.lineWidth = 13; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.moveTo(L.sx, L.gy); ctx.quadraticCurveTo(L.sx - 10, L.h * 0.45, L.sx + 4, L.h * 0.24); ctx.stroke();
      L.leaves.forEach((lf, i) => {
        const keep = i === 0 ? 1 - eaten * 0.7 : i === 1 ? 1 - eaten : 1;     // 토끼가 먹은 만큼 잎이 줄어든다
        if (keep <= 0.02) return;
        ctx.save(); ctx.translate(lf.b.x, lf.b.y); ctx.scale(keep, keep); ctx.translate(-lf.b.x, -lf.b.y);
        const gr = ctx.createLinearGradient(lf.b.x, lf.b.y, lf.t.x, lf.t.y);
        gr.addColorStop(0, tint(LEAF_D)); gr.addColorStop(0.5, tint(LEAF)); gr.addColorStop(1, tint(LEAF_L));
        ctx.fillStyle = gr; ctx.fill(lf.p); ctx.lineWidth = 3; ctx.strokeStyle = tint(LEAF_D); ctx.stroke(lf.p);
        ctx.strokeStyle = 'rgba(255,255,255,.5)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(lf.b.x, lf.b.y); ctx.quadraticCurveTo((lf.b.x + lf.t.x) / 2, (lf.b.y + lf.t.y) / 2 - 8, lf.t.x - (lf.t.x - lf.b.x) * 0.06, lf.t.y + 6); ctx.stroke();
        if (i === 0 && dead < 0.3) for (const q of glu) hex(ctx, q.x + Math.sin(q.t * 2 + q.a) * 2, q.y, 9, q.a, 1 - eaten);
        ctx.restore();
      });
      ctx.restore();
    }
    function rabbit(ctx, x, y, a, rot = 0, dark = 0) {
      ctx.save(); ctx.globalAlpha = a; ctx.translate(x, y); ctx.rotate(rot);
      const fur = dark > 0.5 ? BROWN : '#d9cbb5';
      ctx.fillStyle = fur; ctx.strokeStyle = tok('ink'); ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(0, -36, 56, 38, 0, 0, TAU); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.ellipse(-50, -64, 28, 24, 0, 0, TAU); ctx.fill(); ctx.stroke();
      for (const dx of [-62, -46]) { ctx.beginPath(); ctx.ellipse(dx, -112, 9, 30, dx === -62 ? -0.25 : 0.1, 0, TAU); ctx.fill(); ctx.stroke(); }
      ctx.beginPath(); ctx.arc(46, -44, 12, 0, TAU); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(-58, -68, 4, 0, TAU); ctx.fillStyle = tok('ink'); ctx.fill();
      ctx.restore();
    }
    function draw() {
      if (g.w < 60 || g.h < 60) return;                       // 숨은 장(크기 0)에서는 그리지 않는다
      const { ctx, w, h } = g, lt = light();
      ctx.clearRect(0, 0, w, h);
      const eat = ease(clamp(T - 0.4, 0, 1)), bury = ease(clamp(T - 1.6, 0, 1)), press = ease(clamp(T - 2.6, 0, 1)), coal = ease(clamp((T - 3.3) / 0.7));
      // 하늘(햇빛 세기만큼 밝다)
      const sky = ctx.createLinearGradient(0, 0, 0, L.gy);
      const b = 0.55 + 0.45 * lt;
      sky.addColorStop(0, `rgb(${(200 * b) | 0}, ${(226 * b) | 0}, ${(238 * b) | 0})`); sky.addColorStop(1, `rgb(${(236 * b) | 0}, ${(244 * b) | 0}, ${(246 * b) | 0})`);
      ctx.fillStyle = sky; ctx.fillRect(0, 0, w, L.gy);
      // 해
      if (lt > 0) { ctx.beginPath(); ctx.arc(L.sun.x, L.sun.y, L.sun.r + 30 * lt, 0, TAU); ctx.fillStyle = `rgba(245, 207, 58, ${(0.3 * lt).toFixed(2)})`; ctx.fill(); }
      ctx.save(); ctx.translate(L.sun.x, L.sun.y);
      for (let i = 0; i < 12; i++) { ctx.rotate(Math.PI / 6); ctx.beginPath(); ctx.moveTo(L.sun.r + 6, 0); ctx.lineTo(L.sun.r + 8 + 22 * lt, 0); ctx.lineWidth = 5; ctx.strokeStyle = tok('e-light-ink'); ctx.lineCap = 'round'; ctx.globalAlpha = lt ? 1 : 0; ctx.stroke(); }
      ctx.restore(); ctx.globalAlpha = 1;
      ctx.beginPath(); ctx.arc(L.sun.x, L.sun.y, L.sun.r, 0, TAU); ctx.fillStyle = lt ? tok('e-light') : '#d8d4c4'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = tok('ink'); ctx.stroke();
      // 땅
      const soil = ctx.createLinearGradient(0, L.gy, 0, h);
      soil.addColorStop(0, '#c9a77c'); soil.addColorStop(1, '#9c7f58');
      ctx.fillStyle = soil; ctx.fillRect(0, L.gy, w, h - L.gy);
      ctx.fillStyle = '#7fae5a'; ctx.fillRect(0, L.gy - 6, w, 10);
      // 뿌리
      if (T < 1.6) {
        ctx.strokeStyle = '#a98b63'; ctx.lineWidth = 5; ctx.lineCap = 'round';
        for (const a of [-0.9, -0.4, 0.2, 0.7]) { ctx.beginPath(); ctx.moveTo(L.sx, L.gy); ctx.quadraticCurveTo(L.sx + a * 60, L.gy + 50, L.sx + a * 110, L.gy + 110); ctx.stroke(); }
      }
      // 식물 · 토끼
      plant(ctx, bury, eat);
      if (T > 0.4) {
        const come = ease(clamp((T - 0.4) / 0.4)), rx = L.rabbitX + (1 - come) * 200;
        rabbit(ctx, rx - bury * 120, L.gy - bury * 4, Math.min(1, come * 2), bury * 1.5, bury);
        if (eat > 0 && eat < 1 && bury < 0.1) for (let i = 0; i < 6; i++) {   // 화학 에너지가 잎에서 토끼로
          const u = (clock * 0.8 + i / 6) % 1, sx = L.main.t.x - 120, sy = L.main.t.y + 120, ex = rx - 50, ey = L.gy - 64;
          hex(ctx, sx + (ex - sx) * u, sy + (ey - sy) * u - Math.sin(u * Math.PI) * 50, 8, u * 4);
        }
      }
      // 묻힘 → 열·압력 → 석탄층
      if (bury > 0) {                                           // 흙이 한 겹씩 덮는다(눌리면 얇아진다)
        const colors = ['#b9996e', '#a98b63', '#c4a678', '#9c7f58', '#b39368'], th = 48 - press * 12;
        ctx.strokeStyle = 'rgba(29,36,51,.3)'; ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
          const k = clamp(bury * 5 - i); if (k <= 0) continue;
          const yb = L.gy + 4 - i * th;
          ctx.fillStyle = colors[i]; ctx.fillRect(0, yb - th * k, w, th * k);
          ctx.beginPath(); ctx.moveTo(0, yb - th * k); ctx.lineTo(w, yb - th * k); ctx.stroke();
        }
      }
      if (press > 0) {
        // 눌림(위에서 화살표) · 데워짐(아래에서 붉게)
        ctx.globalAlpha = press * (1 - coal * 0.6);
        const heat = ctx.createLinearGradient(0, h, 0, L.gy);
        heat.addColorStop(0, 'rgba(217, 72, 43, .55)'); heat.addColorStop(1, 'rgba(217, 72, 43, 0)');
        ctx.fillStyle = heat; ctx.fillRect(0, L.gy, w, h - L.gy);
        ctx.strokeStyle = tok('ink'); ctx.fillStyle = tok('ink'); ctx.lineWidth = 5;
        for (const x of [w * 0.2, w * 0.4, w * 0.6, w * 0.8]) {
          const y0 = L.gy - 250 + Math.sin(clock * 3 + x) * 6;
          ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x, y0 + 60); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(x - 14, y0 + 50); ctx.lineTo(x, y0 + 72); ctx.lineTo(x + 14, y0 + 50); ctx.closePath(); ctx.fill();
        }
        ctx.globalAlpha = 1;
      }
      if (coal > 0) {
        const y = L.gy + 20, hh = 58;
        ctx.fillStyle = `rgba(32, 36, 46, ${(0.3 + 0.7 * coal).toFixed(2)})`; ctx.fillRect(0, y, w, hh);
        ctx.strokeStyle = `rgba(255,255,255,${(0.3 * coal).toFixed(2)})`; ctx.lineWidth = 3;
        for (let i = 0; i < 10; i++) { const x = (i * 113) % w; ctx.beginPath(); ctx.moveTo(x, y + 14 + (i % 3) * 12); ctx.lineTo(x + 30, y + 10 + (i % 3) * 12); ctx.stroke(); }
        for (let i = 0; i < 7; i++) {                             // 석유 방울(아래 바위 틈)
          const x = 60 + i * (w - 120) / 6, yy = y + hh + 50 + (i % 2) * 26;
          ctx.globalAlpha = coal; ctx.beginPath(); ctx.moveTo(x, yy - 14); ctx.quadraticCurveTo(x + 12, yy, x, yy + 10); ctx.quadraticCurveTo(x - 12, yy, x, yy - 14); ctx.fillStyle = '#3d2b1a'; ctx.fill(); ctx.globalAlpha = 1;
        }
        for (let i = 0; i < 5; i++) hex(ctx, w * (0.15 + i * 0.18), y + hh / 2, 10, clock + i, coal * (0.6 + 0.4 * Math.sin(clock * 3 + i)));
      }
      // 시간 단계 이름
      const stage = T < 0.4 ? null : T < 1.6 ? '먹이를 따라 화학 에너지가 동물로' : T < 2.6 ? '죽은 생물이 흙에 묻힌다' : T < 3.6 ? '열 · 압력 · 아주 오랜 세월' : '석탄·석유 = 옛 햇빛이 저장된 화학 에너지';
      if (stage) label(ctx, stage, w / 2, 120, '700 30px "IBM Plex Sans KR", sans-serif');
      if (T >= 0.4) return;
      // 광합성 알갱이
      for (const p of P) {
        if (p.k === 'light') {
          const d = Math.hypot(p.to.x - p.x, p.to.y - p.y) || 1, ux = (p.to.x - p.x) / d, uy = (p.to.y - p.y) / d;
          ctx.strokeStyle = tok('e-light-ink'); ctx.lineWidth = 5; ctx.lineCap = 'round';
          ctx.beginPath(); ctx.moveTo(p.x - ux * 26, p.y - uy * 26); ctx.lineTo(p.x, p.y); ctx.stroke();
          ctx.strokeStyle = tok('e-light'); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(p.x - ux * 24, p.y - uy * 24); ctx.lineTo(p.x, p.y); ctx.stroke();
        } else if (p.k === 'co2') {
          ctx.fillStyle = CO2; ctx.strokeStyle = tok('ink'); ctx.lineWidth = 1.2;
          for (const ox of [-8, 0, 8]) { ctx.beginPath(); ctx.arc(p.x + ox, p.y, ox ? 4 : 5, 0, TAU); ctx.fill(); ctx.stroke(); }
        } else { ctx.beginPath(); ctx.arc(p.x, p.y, 5, 0, TAU); ctx.fillStyle = WATER; ctx.fill(); ctx.lineWidth = 1.2; ctx.strokeStyle = tok('ink'); ctx.stroke(); }
      }
      for (const q of fx) {
        if (q.k === 'hit') { ctx.beginPath(); ctx.arc(q.x, q.y, 6 + q.t * 30, 0, TAU); ctx.strokeStyle = `rgba(138,106,0,${(1 - q.t / 0.5).toFixed(2)})`; ctx.lineWidth = 2; ctx.stroke(); }
        else { ctx.globalAlpha = Math.max(0, 1 - q.t / 3); ctx.beginPath(); ctx.arc(q.x, q.y, 10, 0, TAU); ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.lineWidth = 1.5; ctx.strokeStyle = tok('ink-2'); ctx.stroke(); ctx.fillStyle = tok('ink-2'); ctx.font = '700 11px "IBM Plex Sans KR", sans-serif'; ctx.textAlign = 'center'; ctx.fillText('O₂', q.x, q.y + 4); ctx.globalAlpha = 1; }
      }
      label(ctx, '물 ↑ 뿌리에서', L.sx + 110, L.gy + 50, '600 20px "IBM Plex Sans KR", sans-serif', 'left');
      label(ctx, '← 이산화 탄소(공기)', w - 20, L.h * 0.56, '600 20px "IBM Plex Sans KR", sans-serif', 'right');
    }
    // ---------- 조작 ----------
    const setT = (v, instant) => {
      if (tween) tween.kill();
      if (instant || !window.gsap || window.Stage.reduce) { T = v; timeIn.value = v; return; }
      const o = { T };
      tween = gsap.to(o, { T: v, duration: Math.abs(v - T) * 1.6, ease: 'power1.inOut', onUpdate: () => { T = o.T; timeIn.value = T; } });
    };
    lightIn.addEventListener('input', () => { const v = light(); lvEl.textContent = v === 0 ? '없음' : v < 0.35 ? '약함' : v < 0.7 ? '보통' : '강함'; });
    timeIn.addEventListener('input', () => { if (tween) tween.kill(); T = Number(timeIn.value); });
    nowBtn.addEventListener('click', () => setT(0));
    const l = window.Stage.loop(step);
    L = layout(g.w, g.h);
    const warm = () => { for (let i = 0; i < 300; i++) step(1 / 60); };
    return {
      setActive(on) { if (on) { g = window.Stage.fit(cv); L = layout(g.w, g.h); if (!made) warm(); if (window.Stage.reduce) draw(); else l.start(); } else l.stop(); },
      fit() { g = window.Stage.fit(cv); L = layout(g.w, g.h); draw(); },
      fragment(f, on) { if (f.dataset.anim === 'ftime') setT(on ? 4 : 0); },
      sync(slide) { const f = slide.querySelector('[data-anim="ftime"]'); setT(f.classList.contains('visible') ? 4 : 0, true); },
    };
  }

  window.Photosynthesis = { mount };
})();
