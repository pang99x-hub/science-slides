/* 3-3 2차시 체험 «효소가 일하는 빠르기»(참고서 반응 속도 그래프 읽기 — 기질 농도·효소 농도와 초기 반응 속도).
   왼쪽: 시험관 속을 크게 본 동그라미. 효소(오목한 자리가 있는 단백질)가 기질 알갱이를 붙잡아(효소·기질 복합체) 잠시 뒤 생성물 둘로 내보내고 다시 일한다.
   아래 손잡이: 기질 농도(끌기) · 효소 농도 a ↔ 2a(끌기). 바꿀 때마다 그 순간의 초기 반응 속도가 오른쪽 그래프에 점으로 찍혀 곡선이 된다.
   기질이 많아지면 빨라지다가 모든 효소가 결합하면(쉬는 효소 0) 더 빨라지지 않는다. 효소 2a → 속도·최대 속도 2배.
   효소 하나를 끌어 알코올램프 불꽃에 대면 변성되어 기질과 결합하지 못한다.
   ① 기질을 늘려 그래프를 그린다 ② 더 늘려도 빨라지지 않는 까닭을 본다 ③ 효소를 2배로 해 비교한다.
   Rate.mount(root) → { fit, setActive } · 시험용: root._rt.state() · geo() · setS(값) · setE(1|2) · burn() · tick(초) */
(function () {
  'use strict';
  const TAU = Math.PI * 2, HOLD = 1.2, SMAX = 10, K = 1.6;
  const lerp = (a, b, k) => a + (b - a) * k, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const FONT = '"IBM Plex Sans KR", sans-serif';
  const sat = (S) => 1 - Math.exp(-S / K); // 결합해 있는 효소의 비율(상댓값 모형)
  const txt = (c, t, x, y, col = '#1d2433', f = '700 20px', al = 'center') => { c.fillStyle = col; c.font = `${f} ${FONT}`; c.textAlign = al; c.fillText(t, x, y); };

  function protein(c, x, y, R, a, t, dead, close = 0) {
    c.save(); c.translate(x, y); c.rotate(a);
    c.beginPath();
    for (let i = 0; i <= 72; i++) {
      const th = i / 72 * TAU, d = Math.atan2(Math.sin(th), Math.cos(th));
      const notch = !dead && Math.abs(d) < 0.6 ? (0.5 - close * 0.25) * Math.cos(d / 0.6 * Math.PI / 2) : 0;
      const r = R * (1 + (dead ? 0.16 * Math.sin(7 * th + 2) + 0.1 * Math.sin(11 * th) : 0.07 * Math.sin(3 * th + 1.3) + 0.05 * Math.sin(5 * th + t * 0.8)) - notch);
      c.lineTo(Math.cos(th) * r, Math.sin(th) * r);
    }
    c.closePath();
    c.shadowColor = 'rgba(20,40,30,.3)'; c.shadowBlur = 6; c.shadowOffsetY = 3;
    const col = dead ? ['#e6d3c0', '#a38466', '#5e4630'] : ['#c9efd5', '#3fae6a', '#1d6b3a'];
    const g = c.createRadialGradient(-R * 0.35, -R * 0.4, 2, 0, 0, R * 1.1); g.addColorStop(0, col[0]); g.addColorStop(0.55, col[1]); g.addColorStop(1, col[2]);
    c.fillStyle = g; c.fill(); c.shadowColor = 'transparent'; c.strokeStyle = col[2]; c.lineWidth = 2; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.28)';
    [[-0.45, -0.3, 0.12], [-0.1, 0.45, 0.1], [-0.55, 0.25, 0.08], [0.15, -0.55, 0.09]].forEach(([u, v, r]) => { c.beginPath(); c.arc(u * R, v * R, r * R, 0, TAU); c.fill(); });
    c.restore();
  }
  function sub(c, x, y, a, r = 11) { // 기질: 효소의 오목한 자리에 맞는 쐐기 모양
    c.save(); c.translate(x, y); c.rotate(a);
    const g = c.createRadialGradient(-r * 0.3, -r * 0.3, 1, 0, 0, r * 1.4); g.addColorStop(0, '#fff1d6'); g.addColorStop(0.5, '#f2a53a'); g.addColorStop(1, '#a45d08');
    c.fillStyle = g; c.beginPath(); c.moveTo(-r * 1.1, 0); c.quadraticCurveTo(-r * 0.2, -r * 1.2, r * 0.9, -r * 0.55); c.quadraticCurveTo(r * 1.3, 0, r * 0.9, r * 0.55); c.quadraticCurveTo(-r * 0.2, r * 1.2, -r * 1.1, 0); c.fill();
    c.strokeStyle = '#7a4306'; c.lineWidth = 1.5; c.stroke(); c.restore();
  }
  function bead(c, x, y, r, c0, c1) { const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, 1, x, y, r); g.addColorStop(0, '#fff'); g.addColorStop(0.4, c0); g.addColorStop(1, c1); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.strokeStyle = 'rgba(0,0,0,.3)'; c.lineWidth = 1; c.stroke(); }
  function pill(c, x, y, t, bg, fg = '#fff', f = '700 18px') { c.font = `${f} ${FONT}`; const w = c.measureText(t).width + 20; c.fillStyle = bg; c.beginPath(); c.roundRect(x - w / 2, y - 16, w, 30, 15); c.fill(); txt(c, t, x, y + 6, fg, f); }
  const expo = (m) => -Math.log(Math.random() || 1e-3) * m;

  function mount(root) {
    const stage = root.querySelector('.rt-stage'), chip = root.querySelector('.rt-now'), out = root.querySelector('.rt-out');
    let S, eLv, enz, subs, prods, dots, clock, drag, msg, ok, hiT, lastBin, pulse;

    function reset() {
      S = 0; eLv = 1; clock = 0; drag = null; ok = new Set(); hiT = 0; lastBin = -1; pulse = 0;
      dots = { 1: {}, 2: {} }; subs = []; prods = []; makeEnz(); fillSubs();
      say('아래 <b>기질 농도</b> 손잡이를 오른쪽으로 조금씩 끌어 보자. 그때마다 그래프에 점이 찍힌다.');
      steps();
    }
    const say = (t) => { if (t !== msg) { msg = t; out.innerHTML = t; } };
    const nE = () => enz.filter((e) => !e.dead).length;
    const v = () => 0.125 * nE() * sat(S);

    function geo() {
      const W = S_.W || 1120, H = S_.H || 800, r = Math.min(232, (H - 270) / 2), cx = 36 + r, cy = 80 + r, bx = 610;
      return { W, H, r, cx, cy,
        sl: { x0: 80, x1: cx + r - 30, y: H - 128 }, sw: { x0: 200, x1: 340, y: H - 50 }, lamp: { x: 548, y: H - 22 },
        gx0: bx + 96, gx1: W - 36, gy0: 104, gy1: H - 250, box: { x: bx, y: H - 200, w: W - bx - 20, h: 178 } };
    }
    const inCircle = (g, x, y, m = 0) => Math.hypot(x - g.cx, y - g.cy) < g.r - m;
    const rndIn = (g, m) => { for (;;) { const x = g.cx + (Math.random() * 2 - 1) * g.r, y = g.cy + (Math.random() * 2 - 1) * g.r; if (inCircle(g, x, y, m)) return [x, y]; } };

    function makeEnz() {
      const g = geo(), n = eLv * 4;
      enz = Array.from({ length: n }, (_, i) => { const a = i / n * TAU + 0.4, rr = g.r * (n > 4 ? (i % 2 ? 0.6 : 0.32) : 0.45); return { x: g.cx + Math.cos(a) * rr, y: g.cy + Math.sin(a) * rr, a: Math.random() * TAU, va: (Math.random() - 0.5) * 0.6, st: 'idle', w: expo(1), s: null, h: 0, dead: false }; });
      subs.forEach((s) => { s.held = false; });
    }
    function fillSubs() {
      const g = geo(), want = Math.round(S * 4);
      const free = subs.filter((s) => !s.held);
      while (subs.length < want) { const [x, y] = rndIn(g, 14); const s = { x, y, a: Math.random() * TAU, vx: 0, vy: 0, held: false, k: 0 }; subs.push(s); free.push(s); }
      while (subs.length > want && free.length) { const s = free.pop(); subs.splice(subs.indexOf(s), 1); }
    }
    function setS(val) {
      const old = S; S = clamp(val, 0, SMAX); fillSubs();
      enz.forEach((e) => { if (e.st === 'idle' && S > old) e.w = Math.min(e.w, expo(waitMean())); });
      record();
      const f = sat(S);
      if (f > 0.97) say(`기질이 아주 많다. <b>모든 효소가 기질과 결합</b>해 있어(쉬는 효소 0) 기질을 더 넣어도 초기 반응 속도는 <b>${v().toFixed(2)}</b>에서 그대로다. 더 빠르게 하려면 <b>효소</b>를 더 넣어야 한다.`);
      else if (S > 0) say(`기질 농도 <b>${S.toFixed(1)}</b> → 초기 반응 속도 <b>${v().toFixed(2)}</b>. 기질이 많을수록 효소와 만나는 일이 잦아져 빨라진다. 쉬는 효소 <b>${idleN()}</b>개.`);
      steps();
    }
    function setE(lv) {
      if (lv === eLv && !enz.some((e) => e.dead)) return;
      eLv = lv; makeEnz(); record();
      say(lv === 2 ? '효소를 <b>2배(2a)</b>로 했다. 같은 기질 농도에서 초기 반응 속도가 <b>2배</b>, 최대 속도도 2배다. 기질 손잡이를 다시 끌어 새 곡선을 그려 보자.' : '효소 농도를 <b>a</b>로 되돌렸다.');
      steps();
    }
    const waitMean = () => { const f = sat(S); return f < 0.01 ? 1e9 : HOLD * (1 - f) / f; };
    const idleN = () => Math.round(nE() * (1 - sat(S)));
    function record() {
      if (enz.some((e) => e.dead)) return;
      const bin = Math.round(S * 2); dots[eLv][bin] = v(); pulse = 1; lastBin = bin;
    }
    function burn(e) {
      if (e.s) { e.s.held = false; e.s = null; }
      e.dead = true; e.st = 'dead';
      say(nE() ? `가열한 효소는 입체 구조가 바뀌어(<b>변성</b>) 기질과 결합하지 못한다. 일하는 효소가 줄어 초기 반응 속도가 <b>${v().toFixed(2)}</b>로 떨어졌다.` : '효소를 모두 가열했다. 변성된 효소는 기질과 결합하지 못해 <b>반응 속도 0</b>. (처음부터 또는 효소 손잡이를 다시 끌면 새 효소)');
    }
    function steps() {
      const a = Object.keys(dots[1]).map(Number), b = Object.keys(dots[2]).map(Number);
      if (a.length >= 6 && Math.max(...a) >= 8) ok.add(1);
      if (ok.has(1) && hiT > 1.2) ok.add(2);
      if (ok.has(2) && b.length >= 6) ok.add(3);
      const n = [1, 2, 3].find((k) => !ok.has(k)) || 0;
      window.L1.steps(root, n, [...ok]); window.L1.done(root, n === 0);
      chip.textContent = n === 1 ? '① 기질 손잡이를 끌어 점 찍기(오른쪽 끝까지)' : n === 2 ? '② 기질을 끝까지 늘리고 효소를 살펴보기' : n === 3 ? '③ 효소 손잡이를 2a로 → 기질을 다시 끌기' : '✓ 포화되면 효소가 모두 결합 · 효소 2배 → 속도 2배';
      chip.classList.toggle('done', n === 0);
    }

    // ── 움직임 ──
    function sim(dt, g) {
      enz.forEach((e) => {
        if (drag && drag.e === e) return;
        e.a += e.va * dt; e.x += Math.cos(clock * 0.7 + e.a * 3) * 8 * dt; e.y += Math.sin(clock * 0.6 + e.a * 2) * 8 * dt;
        const d = Math.hypot(e.x - g.cx, e.y - g.cy); if (d > g.r - 40) { e.x = g.cx + (e.x - g.cx) * (g.r - 40) / d; e.y = g.cy + (e.y - g.cy) * (g.r - 40) / d; }
        if (e.dead) return;
        const mx = e.x + Math.cos(e.a) * 18, my = e.y + Math.sin(e.a) * 18;
        if (e.st === 'idle') {
          e.w -= dt;
          if (e.w <= 0) { let best = null, bd = 1e9; subs.forEach((s) => { if (s.held) return; const dd = Math.hypot(s.x - mx, s.y - my); if (dd < bd) { bd = dd; best = s; } }); if (best) { best.held = true; e.s = best; e.st = 'grab'; e.h = 0; } else e.w = expo(waitMean()); }
        } else if (e.st === 'grab') {
          const s = e.s; s.x = lerp(s.x, mx, Math.min(1, dt * 9)); s.y = lerp(s.y, my, Math.min(1, dt * 9)); s.a = lerp(s.a, e.a + Math.PI, Math.min(1, dt * 9));
          if (Math.hypot(s.x - mx, s.y - my) < 3) { e.st = 'busy'; e.h = HOLD - 0.15; }
        } else if (e.st === 'busy') {
          const s = e.s; s.x = mx; s.y = my; s.a = e.a + Math.PI; e.h -= dt;
          if (e.h <= 0) { // 생성물 둘을 내보내고 다시 쉬는 효소로
            [-1, 1].forEach((k) => prods.push({ x: mx, y: my, vx: Math.cos(e.a + k * 0.5) * 60, vy: Math.sin(e.a + k * 0.5) * 60, u: 0, k }));
            subs.splice(subs.indexOf(s), 1); e.s = null; e.st = 'idle'; e.w = expo(waitMean());
            const [x, y] = rndIn(g, 14); const ang = Math.atan2(y - g.cy, x - g.cx); subs.push({ x: g.cx + Math.cos(ang) * (g.r - 14), y: g.cy + Math.sin(ang) * (g.r - 14), a: Math.random() * TAU, vx: 0, vy: 0, held: false, k: 0 });
          }
        }
      });
      subs.forEach((s) => { if (s.held) return; s.vx += (Math.random() - 0.5) * 300 * dt; s.vy += (Math.random() - 0.5) * 300 * dt; s.vx *= 0.96; s.vy *= 0.96; s.x += s.vx * dt; s.y += s.vy * dt; s.a += dt * 0.8; if (!inCircle(g, s.x, s.y, 14)) { s.vx = (g.cx - s.x) * 0.5; s.vy = (g.cy - s.y) * 0.5; s.x += s.vx * dt * 2; s.y += s.vy * dt * 2; } });
      prods = prods.filter((q) => (q.u += dt / 2.4) < 1);
      prods.forEach((q) => { q.x += q.vx * dt; q.y += q.vy * dt; q.vx *= 0.97; q.vy *= 0.97; });
      if (sat(S) > 0.97 && !enz.some((e) => e.dead)) hiT += dt; else hiT = 0;
      if (hiT > 1.2 && ok.has(1) && !ok.has(2)) steps();
    }

    // ── 그리기 ──
    function draw(c, W, H, dt) {
      clock += dt; pulse = Math.max(0, pulse - dt * 1.5);
      const g = geo(), t = clock;
      if (dt) sim(dt, g);
      c.fillStyle = '#f5f2ea'; c.fillRect(0, 0, W, H);
      // 시험관 속 확대
      c.save(); c.beginPath(); c.arc(g.cx, g.cy, g.r, 0, TAU); c.clip();
      const lg = c.createRadialGradient(g.cx - g.r * 0.3, g.cy - g.r * 0.4, 10, g.cx, g.cy, g.r); lg.addColorStop(0, '#f4fbff'); lg.addColorStop(1, '#cfe6f2'); c.fillStyle = lg; c.fillRect(g.cx - g.r, g.cy - g.r, g.r * 2, g.r * 2);
      c.strokeStyle = 'rgba(80,140,180,.12)'; c.lineWidth = 2; for (let k = 0; k < 9; k++) { c.beginPath(); for (let x = g.cx - g.r; x <= g.cx + g.r; x += 16) c.lineTo(x, g.cy - g.r + 30 + k * 52 + Math.sin(x / 40 + t + k) * 5); c.stroke(); }
      prods.forEach((q) => { c.globalAlpha = 1 - q.u; bead(c, q.x, q.y, 7, q.k < 0 ? '#ffd23a' : '#e4574a', q.k < 0 ? '#a07b00' : '#7a1d14'); c.globalAlpha = 1; });
      subs.forEach((s) => { if (!s.held) sub(c, s.x, s.y, s.a); });
      enz.forEach((e) => { if (drag && drag.e === e) return; drawEnz(c, e, t); });
      c.restore();
      c.strokeStyle = '#1d2433'; c.lineWidth = 4; c.beginPath(); c.arc(g.cx, g.cy, g.r, 0, TAU); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 6; c.beginPath(); c.arc(g.cx, g.cy, g.r - 10, Math.PI * 1.1, Math.PI * 1.35); c.stroke();
      pill(c, g.cx, g.cy + g.r - 22, '시험관 속을 크게 본 모습', 'rgba(29,36,51,.7)', '#fff', '700 16px');
      // 이름표(처음 한 번 짚어 줌)
      const e0 = enz.find((e) => !e.dead); if (e0) pill(c, e0.x, e0.y - 52, e0.st === 'busy' ? '효소·기질 복합체' : '효소', '#1d6b3a', '#fff', '700 16px');
      const s0 = subs.find((s) => !s.held && inCircle(g, s.x, s.y, 60)); if (s0) pill(c, s0.x, s0.y - 26, '기질', '#a45d08', '#fff', '700 15px');
      drawSlider(c, g, t); drawSwitch(c, g); drawLamp(c, g, t);
      if (drag && drag.e) { drawEnz(c, drag.e, t, drag.x, drag.y); }
      drawGraph(c, g, t); drawBox(c, g);
    }
    function drawEnz(c, e, t, x = e.x, y = e.y) {
      const shake = e.dead ? Math.sin(t * 20) * 0.5 : 0;
      protein(c, x + shake, y, 30, e.a, t + e.a, e.dead, e.st === 'busy' ? 1 : 0);
      if (e.s && (e.st === 'busy' || e.st === 'grab')) sub(c, e.s.x - e.x + x, e.s.y - e.y + y, e.s.a);
      if (e.st === 'busy') { c.strokeStyle = 'rgba(255,210,58,.8)'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 38, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - e.h / HOLD)); c.stroke(); }
      if (e.dead) txt(c, '변성', x, y + 6, '#fff', '800 15px');
    }
    function drawSlider(c, g, t) {
      const s = g.sl, x = lerp(s.x0, s.x1, S / SMAX);
      txt(c, '기질 농도', s.x0 - 8, s.y - 30, '#a45d08', '800 21px', 'left');
      txt(c, `${S.toFixed(1)} (상댓값)`, s.x1 + 8, s.y - 30, '#1d2433', '700 18px', 'right');
      const tg = c.createLinearGradient(s.x0, 0, s.x1, 0); tg.addColorStop(0, '#fff4e2'); tg.addColorStop(1, '#f2a53a'); c.fillStyle = tg; c.strokeStyle = '#7a4306'; c.lineWidth = 2; c.beginPath(); c.roundRect(s.x0, s.y - 9, s.x1 - s.x0, 18, 9); c.fill(); c.stroke();
      for (let i = 0; i <= SMAX; i += 2) { const xx = lerp(s.x0, s.x1, i / SMAX); txt(c, String(i), xx, s.y + 38, '#5b6474', '600 15px'); }
      c.save(); c.shadowColor = 'rgba(0,0,0,.3)'; c.shadowBlur = 8; c.shadowOffsetY = 3; c.fillStyle = '#fff'; c.beginPath(); c.arc(x, s.y, 25, 0, TAU); c.fill(); c.restore();
      c.strokeStyle = '#a45d08'; c.lineWidth = 3; c.beginPath(); c.arc(x, s.y, 25, 0, TAU); c.stroke(); sub(c, x, s.y, 0, 12);
      if (!ok.has(1) && !drag) { const k = (t % 2) / 2; c.globalAlpha = 1 - k; txt(c, '▶', x + 34 + k * 30, s.y + 8, '#a45d08', '800 24px'); c.globalAlpha = 1; }
    }
    function drawSwitch(c, g) {
      const s = g.sw, x = drag && drag.sw ? clamp(drag.x, s.x0, s.x1) : eLv === 1 ? s.x0 : s.x1;
      txt(c, '효소 농도', s.x0 - 50, s.y + 7, '#1d6b3a', '800 21px', 'right');
      c.fillStyle = '#e3f3e8'; c.strokeStyle = '#1d6b3a'; c.lineWidth = 2; c.beginPath(); c.roundRect(s.x0 - 34, s.y - 22, s.x1 - s.x0 + 68, 44, 22); c.fill(); c.stroke();
      txt(c, 'a', s.x0, s.y + 44, '#1d6b3a', '800 19px'); txt(c, '2a', s.x1, s.y + 44, '#1d6b3a', '800 19px');
      protein(c, x, s.y, 20, 0, 0, false);
    }
    function drawLamp(c, g, t) {
      const L = g.lamp, x = L.x, y = L.y;
      // 불꽃
      [[1, '#ff7a1a'], [0.7, '#ffc23a'], [0.4, '#fff3b0']].forEach(([k, col], i) => { const hh = 64 * k * (1 + Math.sin(t * 13 + i) * 0.06), ww = 20 * k + 4; const gg = c.createLinearGradient(0, y - 56 - hh, 0, y - 56); gg.addColorStop(0, 'rgba(255,200,80,0)'); gg.addColorStop(0.35, col); gg.addColorStop(1, col); c.fillStyle = gg; c.beginPath(); c.moveTo(x, y - 56 - hh); c.bezierCurveTo(x + ww * 0.7, y - 56 - hh * 0.55, x + ww, y - 56 - hh * 0.1, x, y - 56); c.bezierCurveTo(x - ww, y - 56 - hh * 0.1, x - ww * 0.7, y - 56 - hh * 0.55, x, y - 56 - hh); c.fill(); });
      // 램프 몸통
      c.fillStyle = '#6b6f78'; c.fillRect(x - 5, y - 60, 10, 10);
      const bg = c.createLinearGradient(x - 40, 0, x + 40, 0); bg.addColorStop(0, 'rgba(200,225,240,.9)'); bg.addColorStop(0.5, 'rgba(250,253,255,.95)'); bg.addColorStop(1, 'rgba(170,200,220,.9)');
      c.fillStyle = bg; c.strokeStyle = '#3a4a58'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 10, y - 52); c.lineTo(x - 40, y - 20); c.quadraticCurveTo(x - 46, y, x - 30, y); c.lineTo(x + 30, y); c.quadraticCurveTo(x + 46, y, x + 40, y - 20); c.lineTo(x + 10, y - 52); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = 'rgba(120,170,220,.35)'; c.fillRect(x - 36, y - 18, 72, 16);
      txt(c, '효소를 끌어', x, y - 176, '#b2362b', '700 17px'); txt(c, '불에 대 보기', x, y - 154, '#b2362b', '700 17px');
    }
    function drawGraph(c, g, t) {
      const X = (s) => lerp(g.gx0, g.gx1, s / SMAX), Y = (u) => lerp(g.gy1, g.gy0, u / 1.1);
      c.fillStyle = '#fffdf7'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.roundRect(g.gx0 - 96, g.gy0 - 60, g.gx1 - g.gx0 + 120, g.gy1 - g.gy0 + 120, 14); c.fill(); c.stroke();
      c.strokeStyle = '#e6e2d6'; c.lineWidth = 1; [0.25, 0.5, 0.75, 1].forEach((u) => { c.beginPath(); c.moveTo(X(0), Y(u)); c.lineTo(X(SMAX), Y(u)); c.stroke(); txt(c, String(u), X(0) - 10, Y(u) + 6, '#5b6474', '600 16px', 'right'); });
      c.strokeStyle = '#1d2433'; c.lineWidth = 3; c.beginPath(); c.moveTo(X(0), Y(1.1)); c.lineTo(X(0), Y(0)); c.lineTo(X(SMAX), Y(0)); c.stroke();
      txt(c, '0', X(0) - 10, Y(0) + 22, '#5b6474', '600 16px', 'right');
      txt(c, '기질 농도 →', X(SMAX), Y(0) + 34, '#a45d08', '800 19px', 'right');
      c.save(); c.translate(X(0) - 62, (g.gy0 + g.gy1) / 2); c.rotate(-Math.PI / 2); txt(c, '초기 반응 속도(상댓값)', 0, 0, '#1d2433', '800 19px'); c.restore();
      txt(c, '반응을 막 시작할 때의 빠르기', (g.gx0 + g.gx1) / 2, g.gy0 - 30, '#5b6474', '600 16px');
      [[1, '#3fae6a', '효소 a'], [2, '#2a6fc9', '효소 2a']].forEach(([lv, col, lab]) => {
        const pts = Object.keys(dots[lv]).map(Number).sort((a, b) => a - b).map((b) => [X(b / 2), Y(dots[lv][b])]);
        if (pts.length >= 3) { c.strokeStyle = col; c.lineWidth = 3; c.globalAlpha = 0.6; c.beginPath(); pts.forEach(([x, y]) => c.lineTo(x, y)); c.stroke(); c.globalAlpha = 1; }
        pts.forEach(([x, y]) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, 6, 0, TAU); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 1.5; c.stroke(); });
        if (pts.length >= 6) { const [x, y] = pts[pts.length - 1]; txt(c, lab, x - 4, y - 14, col, '800 18px', 'right'); }
      });
      // 지금 점
      const cx = X(S), cy = Y(v()), col = eLv === 1 ? '#3fae6a' : '#2a6fc9';
      c.setLineDash([5, 5]); c.strokeStyle = 'rgba(29,36,51,.35)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(cx, Y(0)); c.lineTo(cx, cy); c.stroke(); c.setLineDash([]);
      c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, 10 + pulse * 10 + Math.sin(t * 4) * 1.5, 0, TAU); c.stroke();
      if (sat(S) > 0.97 && nE()) pill(c, X(6.5), Y(v()) + 34, '더 넣어도 그대로 — 쉬는 효소 0', '#1d2433', '#fff', '700 16px');
      if (Object.keys(dots[2]).length >= 6 && Object.keys(dots[1]).length >= 6) {
        const x2 = X(2), ya = Y(0.5 * sat(2)), yb = Y(sat(2)); c.strokeStyle = '#2a6fc9'; c.fillStyle = '#2a6fc9'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x2, ya - 8); c.lineTo(x2, yb + 8); c.stroke();
        c.beginPath(); c.moveTo(x2, yb + 6); c.lineTo(x2 - 6, yb + 16); c.lineTo(x2 + 6, yb + 16); c.closePath(); c.fill();
        pill(c, X(4.6), Y(0.62), '같은 기질 농도에서 2배', '#2a6fc9', '#fff', '700 16px');
      }
    }
    function drawBox(c, g) {
      const b = g.box, busy = nE() - idleN(), dead = enz.filter((e) => e.dead).length;
      c.fillStyle = 'rgba(255,255,255,.9)'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.roundRect(b.x, b.y, b.w, b.h, 14); c.fill(); c.stroke();
      txt(c, '초기 반응 속도', b.x + 20, b.y + 40, '#1d2433', '800 21px', 'left'); txt(c, v().toFixed(2), b.x + b.w - 20, b.y + 42, eLv === 1 ? '#1d6b3a' : '#2a6fc9', '800 34px', 'right');
      txt(c, `결합한 효소 ${busy} · 쉬는 효소 ${idleN()}${dead ? ` · 변성 ${dead}` : ''}`, b.x + 20, b.y + 82, '#1d2433', '700 19px', 'left');
      const n = enz.length, w = Math.min(46, (b.w - 40) / n);
      const live = enz.filter((q) => !q.dead);
      enz.forEach((e, i) => { const x = b.x + 20 + w * (i + 0.5), y = b.y + 122; protein(c, x, y, w * 0.36, 0, 0, e.dead, 0); if (!e.dead && live.indexOf(e) < busy) sub(c, x + w * 0.2, y, Math.PI, w * 0.16); });
      txt(c, '활성화에너지는 농도와 관계없이 같다', b.x + 20, b.y + b.h - 14, '#5b6474', '700 17px', 'left');
    }

    // ── 손 조작 ──
    const S_ = window.Play.make(stage, {
      draw,
      down(p) {
        const g = geo(), s = g.sl, w = g.sw;
        if (Math.abs(p.y - s.y) < 34 && p.x > s.x0 - 30 && p.x < s.x1 + 30) { drag = { sl: true, x: p.x }; setS((p.x - s.x0) / (s.x1 - s.x0) * SMAX); return; }
        if (Math.abs(p.y - w.y) < 34 && p.x > w.x0 - 40 && p.x < w.x1 + 40) { drag = { sw: true, x: p.x }; return; }
        const e = enz.find((q) => Math.hypot(p.x - q.x, p.y - q.y) < 40); if (e && inCircle(g, p.x, p.y)) { drag = { e, x: p.x, y: p.y }; if (e.s) { e.s.held = false; e.s = null; } e.st = e.dead ? 'dead' : 'idle'; e.w = expo(waitMean()); }
      },
      move(p) {
        if (!drag) return; const g = geo();
        if (drag.sl) { const s = g.sl; setS((p.x - s.x0) / (s.x1 - s.x0) * SMAX); }
        drag.x = p.x; drag.y = p.y;
      },
      up(p) {
        const d = drag; drag = null; if (!d) return; const g = geo();
        if (d.sw) { const w = g.sw; setE(p.x > (w.x0 + w.x1) / 2 ? 2 : 1); return; }
        if (d.e) {
          const L = g.lamp;
          if (Math.hypot(p.x - L.x, p.y - (L.y - 100)) < 70 && !d.e.dead) { burn(d.e); d.e.x = g.cx + g.r * 0.5; d.e.y = g.cy + g.r * 0.5; return; }
          if (inCircle(g, p.x, p.y, 30)) { d.e.x = p.x; d.e.y = p.y; } else say('효소는 <b>알코올램프 불꽃</b> 위에 대야 가열된다. 그냥 놓으면 시험관 속으로 돌아간다.');
        }
      },
      key(e) {
        if (e.key === 'ArrowRight') { setS(S + 0.5); return true; }
        if (e.key === 'ArrowLeft') { setS(S - 0.5); return true; }
        if (e.key === 'ArrowUp') { setE(2); return true; }
        if (e.key === 'ArrowDown') { setE(1); return true; }
        if (e.key === 'h' || e.key === 'H') { const q = enz.find((x) => !x.dead); if (q) burn(q); return true; }
        if (e.key === '0') { reset(); return true; }
        return false;
      },
    });
    root.querySelector('.rt-reset').addEventListener('click', () => { reset(); S_.kick(); });
    reset();

    root._rt = {
      state: () => ({ S: +S.toFixed(2), eLv, v: +v().toFixed(3), nE: nE(), idle: idleN(), busySim: enz.filter((e) => e.st === 'busy').length, subs: subs.length, dots: { a: Object.keys(dots[1]).length, b: Object.keys(dots[2]).length }, ok: [...ok], hiT: +hiT.toFixed(2), fin: root.classList.contains('u-done'), out: out.textContent, chip: chip.textContent }),
      geo: () => { const g = geo(); const e = enz.find((q) => !q.dead); return { W: g.W, H: g.H, sl: g.sl, sw: g.sw, lamp: [g.lamp.x, g.lamp.y - 100], enz: e && [e.x, e.y], circle: [g.cx, g.cy, g.r] }; },
      setS: (x) => { setS(x); return root._rt.state(); },
      setE: (lv) => { setE(lv); return root._rt.state(); },
      burn: () => { const q = enz.find((x) => !x.dead); if (q) burn(q); return root._rt.state(); },
      tick: (sec) => { for (let i = 0; i < sec * 60; i++) draw(S_.c, S_.W, S_.H, 1 / 60); return root._rt.state(); },
    };
    return { fit: S_.fit, setActive: S_.setActive };
  }
  window.Rate = { mount };
})();
