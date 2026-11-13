/* 자연의 에너지 전환 두 장면(교과서 그림 Ⅱ-25를 움직이게 다시 그림). 오른쪽 막대는 양의 비교(눈금 없음).
   빗방울: 높이를 정해(막대 또는 빗방울을 위아래로 끌어) 떨어뜨리면 위치 → 운동, 물에 닿으면 운동 → 소리 등(물결·소리·열).
     떨어지는 동안 위치 + 운동의 합(점선)은 그대로다(공기 저항은 무시).
   모닥불: 장작을 넣으면(단추 또는 장작더미에서 끌어다) 장작의 화학 에너지가 빛과 열로 나온다. 다 타면 불이 사그라든다.
     빛:열 = 1:3은 그림을 위한 비율. «합» 막대는 넣은 장작의 처음 에너지와 늘 같다. */
(function () {
  'use strict';
  const { tok, label } = window.Stage;
  const TAU = Math.PI * 2;
  const font = (px, w = 700) => `${w} ${px}px "IBM Plex Sans KR", sans-serif`;

  // 오른쪽 막대 판: items [{ name, c, v } | { name, stack: [{ c, v }] }], total = 점선 높이, max = 맨 위 값
  function barPanel(ctx, g, items, total, max, cap) {
    const pw = 250, x0 = g.w - pw - 12, top = 58, bot = g.h - 70;
    ctx.fillStyle = 'rgba(251,252,249,.93)'; ctx.strokeStyle = tok('ink'); ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(x0, top - 44, pw, bot - top + 104, 12); ctx.fill(); ctx.stroke();
    ctx.font = font(18, 600); ctx.fillStyle = tok('ink-2'); ctx.textAlign = 'center'; ctx.fillText(cap, x0 + pw / 2, top - 18);
    const n = items.length, bw = 40, gap = (pw - 24 - bw * n) / (n - 1), H = bot - top;
    const yOf = (v) => bot - H * Math.max(0, v) / max;
    items.forEach((it, i) => {
      const x = x0 + 12 + i * (bw + gap);
      ctx.fillStyle = tok('grid'); ctx.fillRect(x, top, bw, H);
      if (it.stack) {
        let y = bot;
        it.stack.forEach((s) => { const hh = H * Math.max(0, s.v) / max; if (hh > 0.5) { ctx.fillStyle = tok(s.c); ctx.fillRect(x, y - hh, bw, hh); y -= hh; } });
        ctx.strokeStyle = tok('ink'); ctx.lineWidth = 2; ctx.strokeRect(x, y, bw, bot - y);
      } else {
        const y = yOf(it.v);
        ctx.fillStyle = tok(it.c); ctx.fillRect(x, y, bw, bot - y);
        ctx.strokeStyle = tok('ink'); ctx.lineWidth = 2; ctx.strokeRect(x, y, bw, bot - y);
      }
      ctx.fillStyle = tok('ink'); ctx.font = font(18); ctx.textAlign = 'center';
      it.name.split('\n').forEach((t, j) => ctx.fillText(t, x + bw / 2, bot + 24 + j * 20));
    });
    ctx.strokeStyle = tok('ink'); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x0 + 6, bot); ctx.lineTo(x0 + pw - 6, bot); ctx.stroke();
    const ty = yOf(total);
    ctx.setLineDash([8, 6]); ctx.strokeStyle = tok('stamp'); ctx.lineWidth = 2.5;
    ctx.beginPath(); ctx.moveTo(x0 + 6, ty); ctx.lineTo(x0 + pw - 6, ty); ctx.stroke(); ctx.setLineDash([]);
    return pw + 24;
  }

  // ---------- 빗방울 ----------
  function rain(root) {
    const cv = root.querySelector('.rain-cv'), input = root.querySelector('#rain-h'), btn = root.querySelector('#rain-drop');
    let g = window.Stage.fit(cv), st = 'ready', y = 0, v = 0, ts = 0, h = Number(input.value), moved = false, drag = false;
    const bg = Array.from({ length: 46 }, () => ({ x: Math.random(), y: Math.random(), s: 0.7 + Math.random() * 0.6 }));
    let ripples = [], splash = [];
    const geo = () => { const sw = g.w - 262, surf = g.h * 0.8; return { sw, surf, top: 128, x: sw * 0.6 }; };
    const y0 = (G) => G.surf - (h / 100) * (G.surf - G.top);
    const energy = (G) => {
      const E = h;
      if (st === 'ready') return { pot: E, kin: 0, snd: 0 };
      if (st === 'fall') { const f = Math.max(0, Math.min(1, (G.surf - 4 - y) / (G.surf - 4 - y0(G)))); return { pot: E * f, kin: E * (1 - f), snd: 0 }; }
      const f = Math.min(1, ts / 0.5); return { pot: 0, kin: E * (1 - f), snd: E * f };
    };
    function drop() { if (st !== 'ready') return; st = 'fall'; v = 0; y = y0(geo()); btn.disabled = true; }
    function step(dt) {
      const G = geo();
      bg.forEach((d) => { d.y += dt * 1.6 * d.s; if (d.y > 1) { d.y -= 1; d.x = Math.random(); } });
      if (st === 'fall') {
        v += 760 * dt; y += v * dt;
        if (y >= G.surf - 4) {
          y = G.surf - 4; st = 'splash'; ts = 0;
          ripples.push({ r: 4, a: 1 }, { r: -18, a: 1 }, { r: -40, a: 1 });
          splash = Array.from({ length: 7 }, (_, i) => ({ x: G.x, y: G.surf, vx: (i - 3) * 38 + (Math.random() - 0.5) * 20, vy: -150 - Math.random() * 120 }));
        }
      } else if (st === 'splash') {
        ts += dt;
        if (ts > 2.4) { st = 'ready'; btn.disabled = false; }
      }
      ripples.forEach((r) => { r.r += 70 * dt; r.a -= 0.45 * dt; }); ripples = ripples.filter((r) => r.a > 0);
      splash.forEach((s) => { s.vy += 700 * dt; s.x += s.vx * dt; s.y += s.vy * dt; }); splash = splash.filter((s) => s.y < G.surf + 4);
      draw();
    }
    function draw() {
      const { ctx, w, h: H } = g; if (w < 50) return;
      const G = geo();
      const sky = ctx.createLinearGradient(0, 0, 0, G.surf);
      sky.addColorStop(0, '#5d6f8f'); sky.addColorStop(1, '#b3c1d1');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, w, G.surf);
      // 구름
      ctx.fillStyle = '#7d8aa3';
      for (let i = 0; i < 9; i++) { ctx.beginPath(); ctx.arc(G.sw * (0.05 + i * 0.12), 52 + (i % 2) * 18, 46 + (i % 3) * 10, 0, TAU); ctx.fill(); }
      ctx.fillStyle = '#6a7792'; ctx.fillRect(0, 0, G.sw + 40, 40);
      // 배경 빗줄기
      ctx.strokeStyle = 'rgba(235,244,255,.45)'; ctx.lineWidth = 2;
      bg.forEach((d) => { const x = d.x * G.sw, yy = 70 + d.y * (G.surf - 70); ctx.beginPath(); ctx.moveTo(x, yy); ctx.lineTo(x - 3, yy + 18); ctx.stroke(); });
      // 물
      const wat = ctx.createLinearGradient(0, G.surf, 0, H);
      wat.addColorStop(0, '#4d7fa3'); wat.addColorStop(1, '#25465f');
      ctx.fillStyle = wat; ctx.fillRect(0, G.surf, w, H - G.surf);
      ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 2;
      for (let i = 0; i < 6; i++) { const yy = G.surf + 14 + i * 16; ctx.beginPath(); ctx.moveTo(20 + i * 40, yy); ctx.lineTo(120 + i * 70, yy); ctx.stroke(); }
      // 연잎·꽃
      const lx = G.sw * 0.2;
      ctx.fillStyle = '#4f9a54'; ctx.strokeStyle = tok('ink'); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.ellipse(lx, G.surf + 8, 78, 18, 0, 0.25, TAU - 0.05); ctx.lineTo(lx, G.surf + 8); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#f6c6d8';
      for (let i = 0; i < 6; i++) { const a = -Math.PI / 2 + (i - 2.5) * 0.42; ctx.beginPath(); ctx.ellipse(lx + 18 + Math.cos(a) * 14, G.surf - 6 + Math.sin(a) * 14, 7, 15, a + Math.PI / 2, 0, TAU); ctx.fill(); ctx.stroke(); }
      ctx.fillStyle = '#ffd84a'; ctx.beginPath(); ctx.arc(lx + 18, G.surf - 6, 6, 0, TAU); ctx.fill();
      // 높이 자
      ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(48, G.surf); ctx.lineTo(48, G.top); ctx.stroke();
      for (let k = 0; k <= 10; k++) { const yy = G.surf - (G.surf - G.top) * k / 10; ctx.beginPath(); ctx.moveTo(48, yy); ctx.lineTo(k % 5 ? 58 : 66, yy); ctx.stroke(); }
      label(ctx, '높이', 48, G.top - 14, font(20));
      // 물결
      ripples.forEach((r) => { if (r.r <= 0) return; ctx.strokeStyle = `rgba(255,255,255,${r.a})`; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(G.x, G.surf + 2, r.r, r.r * 0.22, 0, 0, TAU); ctx.stroke(); });
      splash.forEach((s) => { ctx.fillStyle = '#cfe9ff'; ctx.beginPath(); ctx.arc(s.x, s.y, 4, 0, TAU); ctx.fill(); });
      // 빗방울
      const dy = st === 'ready' ? y0(G) : y;
      if (st === 'ready') {
        ctx.setLineDash([6, 8]); ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(G.x, dy + 16); ctx.lineTo(G.x, G.surf); ctx.stroke(); ctx.setLineDash([]);
        ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.beginPath(); ctx.moveTo(48, dy); ctx.lineTo(G.x - 18, dy); ctx.setLineDash([3, 6]); ctx.stroke(); ctx.setLineDash([]);
        if (!moved) label(ctx, '↕ 끌어서 높이 바꾸기', G.x + 26, dy + 8, font(19, 600), 'left');
      }
      if (st !== 'splash') {
        const sc = st === 'fall' ? 1 + Math.min(0.5, v / 1600) : 1;
        ctx.save(); ctx.translate(G.x, dy); ctx.scale(1 / Math.sqrt(sc), sc);
        ctx.fillStyle = '#a9dcff'; ctx.strokeStyle = tok('ink'); ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.moveTo(0, -24); ctx.bezierCurveTo(8, -12, 14, -4, 14, 4); ctx.arc(0, 4, 14, 0, Math.PI); ctx.bezierCurveTo(-14, -4, -8, -12, 0, -24); ctx.fill(); ctx.stroke();
        ctx.fillStyle = 'rgba(255,255,255,.8)'; ctx.beginPath(); ctx.ellipse(-5, 2, 3, 6, -0.3, 0, TAU); ctx.fill();
        ctx.restore();
        if (st === 'fall') { ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 3; for (let k = 1; k <= 3; k++) { ctx.beginPath(); ctx.moveTo(G.x - 8 + k * 4, dy - 30 - k * 10); ctx.lineTo(G.x - 8 + k * 4, dy - 44 - k * 18 * Math.min(1, v / 600)); ctx.stroke(); } }
      } else {
        // 소리: 퍼지는 곡선과 «톡!»
        const a = Math.max(0, 1 - ts / 1.6);
        ctx.strokeStyle = `rgba(163,50,107,${a})`; ctx.lineWidth = 4;
        for (let k = 0; k < 3; k++) { const r = 30 + k * 26 + ts * 60; ctx.beginPath(); ctx.arc(G.x, G.surf - 6, r, -Math.PI * 0.85, -Math.PI * 0.15); ctx.stroke(); }
        ctx.globalAlpha = a; ctx.font = '400 54px "Nanum Pen Script", cursive'; ctx.textAlign = 'left';
        ctx.lineWidth = 7; ctx.strokeStyle = tok('paper-2'); ctx.strokeText('톡!', G.x + 46, G.surf - 70); ctx.fillStyle = tok('e-sound-ink'); ctx.fillText('톡!', G.x + 46, G.surf - 70);
        ctx.globalAlpha = 1;
      }
      const E = energy(G);
      barPanel(ctx, g, [
        { name: '위치', c: 'e-pot', v: E.pot }, { name: '운동', c: 'e-kin', v: E.kin }, { name: '소리\n등', c: 'e-sound', v: E.snd },
        { name: '합', stack: [{ c: 'e-pot', v: E.pot }, { c: 'e-kin', v: E.kin }, { c: 'e-sound', v: E.snd }] },
      ], h, 104, '점선 = 처음 에너지');
    }
    // 빗방울 끌기(높이 바꾸기)·누르면 떨어뜨리기
    const pt = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * g.w / r.width, y: (e.clientY - r.top) * g.h / r.height }; };
    let downAt = null;
    cv.addEventListener('pointerdown', (e) => {
      if (st !== 'ready') return;
      const G = geo(), p = pt(e);
      if (Math.abs(p.x - G.x) < 50 && Math.abs(p.y - y0(G)) < 50) { drag = true; downAt = p; cv.setPointerCapture(e.pointerId); cv.classList.add('dragging'); }
    });
    cv.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const G = geo(), p = pt(e);
      if (Math.abs(p.y - downAt.y) > 5) moved = true;
      h = Math.round(Math.max(20, Math.min(100, (G.surf - p.y) / (G.surf - G.top) * 100)));
      input.value = String(h); if (!loop.on) draw();
    });
    const up = () => { if (!drag) return; drag = false; cv.classList.remove('dragging'); if (!moved) drop(); };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', () => { drag = false; cv.classList.remove('dragging'); });
    input.addEventListener('input', () => { if (st === 'ready') { h = Number(input.value); moved = true; if (!loop.on) draw(); } });
    input.addEventListener('keydown', (e) => e.stopPropagation());
    btn.addEventListener('click', drop);
    const loop = window.Stage.loop(step);
    return {
      loop, fit() { g = window.Stage.fit(cv); draw(); },
      on(on) { if (on) { g = window.Stage.fit(cv); if (window.Stage.reduce) draw(); else loop.start(); } else loop.stop(); },
    };
  }

  // ---------- 모닥불 ----------
  function fire(root) {
    const cv = root.querySelector('.fire-cv'), btn = root.querySelector('#fire-add'), hint = root.querySelector('.nt-hint');
    let g = window.Stage.fit(cv), logs = [{ amt: 1, a: 0.32 }], light = 0, heat = 0, I = 0.4, flames = [], sparks = [], t = 0, held = null, spawn = 0;
    const stars = Array.from({ length: 22 }, () => ({ x: Math.random(), y: Math.random() * 0.45, r: 0.8 + Math.random() * 1.4 }));
    const geo = () => { const sw = g.w - 262, gr = g.h * 0.78; return { sw, gr, fx: sw * 0.42, pile: { x: sw * 0.84, y: gr } }; };
    const fuel = () => logs.reduce((s, l) => s + l.amt, 0);
    function add() {
      if (logs.length >= 6) return;
      logs.push({ amt: 1, a: (logs.length % 2 ? -1 : 1) * (0.25 + Math.random() * 0.25) });
      hint.classList.add('gone');
    }
    function step(dt) {
      const G = geo(); t += dt;
      const F = fuel(), rate = F > 0.01 ? 0.05 + 0.04 * F : 0, burn = Math.min(F, rate * dt);
      logs.forEach((l) => { l.amt -= F > 0 ? burn * l.amt / F : 0; });
      logs = logs.filter((l) => l.amt > 0.015);
      light += burn * 0.25; heat += burn * 0.75;
      I += ((F > 0.015 ? Math.min(1, rate / 0.2) : 0) - I) * Math.min(1, dt * 2);
      spawn += 110 * I * dt;
      for (; spawn >= 1; spawn--) flames.push({ x: G.fx + (Math.random() - 0.5) * 120 * (0.35 + I), y: G.gr - 18, vx: (Math.random() - 0.5) * 26, vy: -(90 + 140 * I) - Math.random() * 60, life: 0.5 + Math.random() * 0.5, age: 0 });
      if (Math.random() < I * dt * 6) sparks.push({ x: G.fx + (Math.random() - 0.5) * 60, y: G.gr - 60, vx: (Math.random() - 0.5) * 60, vy: -200 - Math.random() * 120, age: 0 });
      flames.forEach((f) => { f.age += dt; f.x += (f.vx + Math.sin(t * 7 + f.y * 0.05) * 18) * dt; f.y += f.vy * dt; });
      flames = flames.filter((f) => f.age < f.life);
      sparks.forEach((s) => { s.age += dt; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 60 * dt; });
      sparks = sparks.filter((s) => s.age < 1.6);
      draw();
    }
    function logShape(ctx, len, r, burnt) {
      ctx.fillStyle = burnt > 0.5 ? '#3a2a20' : '#7a4a2a'; ctx.strokeStyle = tok('ink'); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.roundRect(-len / 2, -r, len, r * 2, r); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#c99a6a'; ctx.beginPath(); ctx.ellipse(len / 2 - 4, 0, 6, r - 2, 0, 0, TAU); ctx.fill(); ctx.stroke();
    }
    function draw() {
      const { ctx, w, h: H } = g; if (w < 50) return;
      const G = geo();
      const sky = ctx.createLinearGradient(0, 0, 0, G.gr);
      sky.addColorStop(0, '#141a36'); sky.addColorStop(1, '#433553');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, w, G.gr);
      ctx.fillStyle = '#e9ecf7'; stars.forEach((s) => { ctx.globalAlpha = 0.5 + 0.5 * Math.sin(t * 2 + s.x * 20); ctx.beginPath(); ctx.arc(s.x * G.sw, s.y * H, s.r, 0, TAU); ctx.fill(); }); ctx.globalAlpha = 1;
      const gnd = ctx.createLinearGradient(0, G.gr, 0, H);
      gnd.addColorStop(0, '#4a3828'); gnd.addColorStop(1, '#2a1f18');
      ctx.fillStyle = gnd; ctx.fillRect(0, G.gr, w, H - G.gr);
      // 빛: 주변을 밝히는 둥근 빛과 빛살
      const R = 80 + 300 * I, glow = ctx.createRadialGradient(G.fx, G.gr - 40, 10, G.fx, G.gr - 40, R);
      glow.addColorStop(0, `rgba(255,214,120,${0.55 * I})`); glow.addColorStop(1, 'rgba(255,214,120,0)');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, w, H);
      ctx.strokeStyle = `rgba(245,207,58,${0.85 * I})`; ctx.lineWidth = 4; ctx.lineCap = 'round';
      for (let k = 0; k < 9; k++) { const a = Math.PI + k * Math.PI / 8, r0 = 150 + 30 * I, r1 = r0 + 30 + 20 * Math.sin(t * 3 + k); ctx.beginPath(); ctx.moveTo(G.fx + Math.cos(a) * r0, G.gr - 50 + Math.sin(a) * r0 * 0.8); ctx.lineTo(G.fx + Math.cos(a) * r1, G.gr - 50 + Math.sin(a) * r1 * 0.8); ctx.stroke(); }
      // 돌 둘레
      for (let k = 0; k < 11; k++) { const a = k / 11 * TAU; ctx.fillStyle = '#7d8290'; ctx.strokeStyle = tok('ink'); ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(G.fx + Math.cos(a) * 118, G.gr + 4 + Math.sin(a) * 26, 22, 13, 0, 0, TAU); ctx.fill(); ctx.stroke(); }
      // 장작(불 속)
      logs.forEach((l, i) => { ctx.save(); ctx.translate(G.fx + (i % 2 ? 10 : -10), G.gr - 10 - Math.floor(i / 2) * 14); ctx.rotate(l.a); logShape(ctx, 70 + 110 * l.amt, 13, 1 - l.amt); ctx.restore(); });
      if (!logs.length) { ctx.fillStyle = '#5b5550'; ctx.beginPath(); ctx.ellipse(G.fx, G.gr - 4, 70, 14, 0, 0, TAU); ctx.fill(); label(ctx, '재만 남았다 — 장작을 넣어 보자', G.fx, G.gr - 70, font(22)); }
      // 불꽃: 흔들리는 불길 셋 + 그 위로 오르는 불티
      if (I > 0.04) {
        const tongue = (bx, by, hgt, wdt, c0, c1, ph) => {
          const grd = ctx.createLinearGradient(0, by, 0, by - hgt);
          grd.addColorStop(0, c0); grd.addColorStop(0.5, c1); grd.addColorStop(1, 'rgba(255,243,176,0)');
          ctx.fillStyle = grd; ctx.beginPath(); ctx.moveTo(bx - wdt, by);
          ctx.quadraticCurveTo(bx - wdt * 0.9, by - hgt * 0.55, bx + Math.sin(t * 6 + ph) * 10, by - hgt);
          ctx.quadraticCurveTo(bx + wdt * 0.9, by - hgt * 0.55, bx + wdt, by); ctx.closePath(); ctx.fill();
        };
        for (const k of [-1, 1, 0]) {
          const hgt = (70 + 150 * I) * (k ? 0.72 : 1) * (1 + 0.1 * Math.sin(t * 9 + k * 2)), wdt = (26 + 30 * I) * (k ? 0.8 : 1);
          tongue(G.fx + k * 40 * (0.5 + I), G.gr - 12, hgt, wdt, '#e8501f', '#ffb02e', k);
        }
        tongue(G.fx, G.gr - 12, (40 + 80 * I) * (1 + 0.1 * Math.sin(t * 11)), 16 + 14 * I, '#ffd36b', '#fff3b0', 3);
      }
      ctx.globalCompositeOperation = 'lighter';
      flames.forEach((f) => {
        const k = f.age / f.life, r = (7 + 14 * I) * (1 - k * 0.7);
        ctx.fillStyle = k < 0.3 ? `rgba(255,243,176,${0.32 * (1 - k)})` : k < 0.6 ? `rgba(255,176,46,${0.3 * (1 - k)})` : `rgba(232,80,31,${0.28 * (1 - k)})`;
        ctx.beginPath(); ctx.arc(f.x, f.y, r, 0, TAU); ctx.fill();
      });
      sparks.forEach((s) => { ctx.fillStyle = `rgba(255,220,140,${1 - s.age / 1.6})`; ctx.beginPath(); ctx.arc(s.x, s.y, 2.4, 0, TAU); ctx.fill(); });
      ctx.globalCompositeOperation = 'source-over';
      // 열: 위로 오르는 아지랑이
      ctx.strokeStyle = `rgba(217,72,43,${0.9 * I})`; ctx.lineWidth = 5;
      for (let k = 0; k < 3; k++) {
        const ph = (t * 0.7 + k / 3) % 1, x = G.fx - 60 + k * 60, yb = G.gr - 190 - ph * 90;
        ctx.globalAlpha = Math.sin(Math.PI * ph);
        ctx.beginPath(); for (let j = 0; j <= 12; j++) { const yy = yb - j * 6; ctx.lineTo(x + Math.sin(j * 0.9 + t * 5) * 8, yy); } ctx.stroke();
      }
      ctx.globalAlpha = 1;
      if (I > 0.08) { label(ctx, '빛', G.fx - 205, G.gr - 120, font(24)); label(ctx, '열', G.fx + 96, G.gr - 255, font(24)); }
      // 장작더미
      const P = G.pile;
      [[0, 0], [44, 0], [88, 0], [22, -38], [66, -38], [44, -76]].forEach(([dx, dy]) => {
        ctx.fillStyle = '#8a5a34'; ctx.strokeStyle = tok('ink'); ctx.lineWidth = 2.5;
        ctx.beginPath(); ctx.arc(P.x - 44 + dx, P.y - 22 + dy, 21, 0, TAU); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = '#c99a6a'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(P.x - 44 + dx, P.y - 22 + dy, 11, 0, TAU); ctx.stroke();
      });
      label(ctx, '장작더미', P.x, P.y - 132, font(20));
      if (held) { ctx.save(); ctx.translate(held.x, held.y); ctx.rotate(-0.25); logShape(ctx, 170, 14, 0); ctx.restore(); }
      const F = fuel();
      barPanel(ctx, g, [
        { name: '화학\n(장작)', c: 'e-chem', v: F }, { name: '빛', c: 'e-light', v: light }, { name: '열', c: 'e-heat', v: heat },
        { name: '합', stack: [{ c: 'e-chem', v: F }, { c: 'e-light', v: light }, { c: 'e-heat', v: heat }] },
      ], F + light + heat, Math.max(2.2, (F + light + heat) * 1.08), '점선 = 넣은 장작의 에너지');
    }
    const pt = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) * g.w / r.width, y: (e.clientY - r.top) * g.h / r.height }; };
    cv.addEventListener('pointerdown', (e) => {
      const G = geo(), p = pt(e);
      if (Math.abs(p.x - G.pile.x) < 90 && p.y > G.pile.y - 120 && p.y < G.pile.y + 10) { held = p; cv.setPointerCapture(e.pointerId); cv.classList.add('dragging'); if (!loop.on) draw(); }
    });
    cv.addEventListener('pointermove', (e) => { if (held) { held = pt(e); if (!loop.on) draw(); } });
    cv.addEventListener('pointerup', () => {
      if (!held) return;
      const G = geo();
      if (Math.abs(held.x - G.fx) < 150 && held.y > G.gr - 220 && held.y < G.gr + 50) add();
      held = null; cv.classList.remove('dragging'); if (!loop.on) draw();
    });
    cv.addEventListener('pointercancel', () => { held = null; cv.classList.remove('dragging'); });
    btn.addEventListener('click', () => { add(); if (!loop.on) draw(); });
    const loop = window.Stage.loop(step);
    return {
      loop, fit() { g = window.Stage.fit(cv); draw(); },
      on(on) { if (on) { g = window.Stage.fit(cv); if (window.Stage.reduce) draw(); else loop.start(); } else loop.stop(); },
    };
  }

  function mount(root) {
    const a = rain(root), b = fire(root);
    return {
      setActive(on) { a.on(on); b.on(on); },
      fit() { a.fit(); b.fit(); },
    };
  }
  window.NatureScenes = { mount };
})();
