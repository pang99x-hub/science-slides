/* 수소 핵융합 실험실(조각). 상자 속 수소 원자핵(+)이 서로 밀어내며 움직인다.
   온도 막대 = 빠르기, 빽빽함 막대 = 원자핵 수(압력). 아주 가까이(합쳐짐 거리) 다가가면 합쳐지고 빛 알갱이가 나온다.
   밀어내는 힘은 거리 제곱에 반비례(가까울수록 세게)해서, 느리면 가까이 가기 전에 휘어 튕겨 나간다.
   실제로는 여러 단계를 거치지만, 여기서는 합쳐짐 두 번 = 수소 원자핵 4개 → 헬륨 원자핵 1개로 줄여 보인다. */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tok = (k) => getComputedStyle(document.documentElement).getPropertyValue('--' + k).trim();

  function mount(root, opts = {}) {
    const cv = root.querySelector('.fz-cv');
    const tIn = root.querySelector('#fz-t'), dIn = root.querySelector('#fz-d');
    const heEl = root.querySelector('.fz-he'), rateEl = root.querySelector('.fz-rate'), verdict = root.querySelector('.fz-verdict');
    const lab = (inp) => root.querySelector(`.sld-v[data-for="${inp.id}"]`);
    let W = 1, H = 1, ctx = null, P = [], He = [], fx = [], made = 0, half = 0, events = [], clock = 0, raf = 0, last = 0, on = false;
    let K = 2.4e6;               // 밀어내는 힘의 세기(가속도 = K / r²)
    const RC = 170;              // 이 거리 밖에서는 힘을 무시(계산을 줄이려고)
    const RF = 11;               // 합쳐짐 거리
    const RAD = 13;              // 그리는 반지름

    function fit() {
      W = cv.clientWidth || 1; H = cv.clientHeight || 1;
      const s = Math.min(2, (window.devicePixelRatio || 1) * (window.Reveal && Reveal.getScale ? Reveal.getScale() : 1)) || 1;
      cv.width = Math.round(W * s); cv.height = Math.round(H * s);
      ctx = cv.getContext('2d'); ctx.setTransform(s, 0, 0, s, 0, 0);
    }
    const T = () => tIn.value / 100, D = () => dIn.value / 100;
    const vScale = () => 45 + 520 * T() * T();                  // 온도 → 대표 빠르기(px/s)
    const want = () => Math.round(10 + 40 * D());                // 빽빽함 → 원자핵 수
    // 2차원 열운동 빠르기(레일리 분포)
    const speed = () => vScale() * Math.sqrt(-Math.log(1 - Math.random() * 0.999)) * 0.85;
    function addP(edge) {
      const a = Math.random() * Math.PI * 2, v = speed();
      let x = RAD + Math.random() * (W - 2 * RAD), y = 60 + Math.random() * (H - 60 - RAD);
      if (edge) { if (Math.random() < 0.5) x = Math.random() < 0.5 ? RAD : W - RAD; else y = Math.random() < 0.5 ? 60 : H - RAD; }
      P.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v });
    }
    function reheat() {                                          // 온도를 바꾸면 빠르기를 다시 나눠 준다
      for (const p of P) { const a = Math.atan2(p.vy, p.vx), v = speed(); p.vx = Math.cos(a) * v; p.vy = Math.sin(a) * v; }
    }
    function fuse(i, j) {
      const a = P[i], b = P[j], x = (a.x + b.x) / 2, y = (a.y + b.y) / 2;
      P.splice(j, 1); P.splice(i, 1);
      events.push(clock);
      fx.push({ x, y, t: 0, rays: Array.from({ length: 10 }, (_, k) => k / 10 * Math.PI * 2 + Math.random() * 0.4) });
      half++;
      if (half % 2 === 0) { made++; He.push({ x, y, vx: (Math.random() - 0.5) * 80, vy: (Math.random() - 0.5) * 80, t: 0 }); if (He.length > 8) He.shift(); heEl.textContent = made; }
    }
    function physics(dt) {
      const n = P.length;
      for (let i = 0; i < n; i++) { P[i].ax = 0; P[i].ay = 0; }
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        const a = P[i], b = P[j], dx = b.x - a.x, dy = b.y - a.y, r2 = dx * dx + dy * dy;
        if (r2 > RC * RC) continue;
        const r = Math.sqrt(r2) || 0.01;
        if (r < RF) { fuse(i, j); return physics(dt); }         // 목록이 바뀌었으니 다시
        const f = K / r2, fx_ = f * dx / r, fy_ = f * dy / r;
        a.ax -= fx_; a.ay -= fy_; b.ax += fx_; b.ay += fy_;
      }
      for (const p of P) {
        p.vx += p.ax * dt; p.vy += p.ay * dt;
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (p.x < RAD) { p.x = RAD; p.vx = Math.abs(p.vx); } if (p.x > W - RAD) { p.x = W - RAD; p.vx = -Math.abs(p.vx); }
        if (p.y < 60) { p.y = 60; p.vy = Math.abs(p.vy); } if (p.y > H - RAD) { p.y = H - RAD; p.vy = -Math.abs(p.vy); }
      }
    }
    // 빠르기 되돌리기: 밀어내는 힘을 지나며 생긴 오차로 온도가 새지 않게
    function thermostat() {
      if (!P.length) return;
      const target = vScale() * 0.85 * Math.sqrt(Math.PI) / 2 * 1.0;
      const mean = P.reduce((s, p) => s + Math.hypot(p.vx, p.vy), 0) / P.length;
      const k = Math.max(0.9, Math.min(1.1, target / (mean || 1)));
      for (const p of P) { p.vx *= k; p.vy *= k; }
    }
    function step(dt) {
      clock += dt;
      const sub = 6;
      for (let s = 0; s < sub; s++) physics(dt / sub);
      thermostat();
      while (P.length < want()) addP(true);
      while (P.length > want()) P.pop();
      for (const h of He) { h.t += dt; h.x += h.vx * dt; h.y += h.vy * dt; if (h.x < 20 || h.x > W - 20) h.vx *= -1; if (h.y < 70 || h.y > H - 20) h.vy *= -1; }
      for (const f of fx) f.t += dt;
      fx = fx.filter((f) => f.t < 1.2);
      events = events.filter((t) => clock - t < 10);
      rateEl.textContent = events.length;
      draw();
    }
    function nucleus(x, y, r, color) {
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fillStyle = color; ctx.fill();
      ctx.lineWidth = 2; ctx.strokeStyle = tok('ink'); ctx.stroke();
    }
    function draw() {
      if (W < 60 || H < 60) return;                          // 숨은 장(크기 0)에서는 그리지 않는다
      ctx.clearRect(0, 0, W, H);
      const pc = tok('proton'), nc = tok('neutron'), light = tok('e-light'), lightInk = tok('e-light-ink'), paper = tok('paper-2');
      for (const f of fx) {                                     // 합쳐질 때 나오는 에너지
        const k = f.t / 1.2, rr = 14 + k * 120;
        ctx.globalAlpha = 1 - k;
        ctx.beginPath(); ctx.arc(f.x, f.y, rr * 0.5, 0, Math.PI * 2); ctx.fillStyle = light; ctx.fill();
        ctx.strokeStyle = lightInk; ctx.lineWidth = 3;
        for (const a of f.rays) { ctx.beginPath(); ctx.moveTo(f.x + Math.cos(a) * rr * 0.6, f.y + Math.sin(a) * rr * 0.6); ctx.lineTo(f.x + Math.cos(a) * rr, f.y + Math.sin(a) * rr); ctx.stroke(); }
        ctx.globalAlpha = 1;
      }
      for (const h of He) {                                     // 헬륨 원자핵: 양성자 2 + 중성자 2
        const o = 9;
        nucleus(h.x - o, h.y - o, 11, pc); nucleus(h.x + o, h.y + o, 11, pc); nucleus(h.x + o, h.y - o, 11, nc); nucleus(h.x - o, h.y + o, 11, nc);
      }
      for (const p of P) {
        nucleus(p.x, p.y, RAD, pc);
        ctx.strokeStyle = paper; ctx.lineWidth = 3; ctx.beginPath();
        ctx.moveTo(p.x - 6, p.y); ctx.lineTo(p.x + 6, p.y); ctx.moveTo(p.x, p.y - 6); ctx.lineTo(p.x, p.y + 6); ctx.stroke();
      }
    }
    function label() {
      const t = T(), d = D();
      lab(tIn).textContent = t < 0.34 ? '낮음' : t < 0.67 ? '중간' : '높음';
      lab(dIn).textContent = d < 0.34 ? '성김' : d < 0.67 ? '중간' : '빽빽';
      const rate = events.length;
      verdict.innerHTML = t < 0.45 ? '느려서 가까이 가기 전에 <b>밀어내는 힘</b>에 휘어 튕겨 나가요.'
        : d < 0.4 ? '빠르지만 원자핵이 드물어 <b>잘 만나지 못해요</b>.'
        : rate >= 6 ? '빠르고 자주 부딪혀 <b>합쳐지고, 에너지가 나와요</b> → 태양 중심부처럼!'
        : rate === 0 ? '아직 밀어내는 힘을 이기지 못해요. <b>온도를 더 올려</b> 보세요.'
        : '조금씩 합쳐져요. 온도와 빽빽함을 더 올려 보세요.';
    }
    tIn.addEventListener('input', () => { reheat(); label(); });
    dIn.addEventListener('input', label);
    const preset = (t, d) => {
      const from = { t: +tIn.value, d: +dIn.value };
      const apply = () => { tIn.value = from.t; dIn.value = from.d; reheat(); label(); };
      if (window.gsap && !reduce) gsap.to(from, { t, d, duration: 0.8, ease: 'power2.inOut', onUpdate: apply });
      else { from.t = t; from.d = d; apply(); }
    };
    root.querySelector('#fz-surf').addEventListener('click', () => preset(12, 20));
    root.querySelector('#fz-core').addEventListener('click', () => preset(96, 92));
    const tick = (now) => { if (!on) return; const dt = Math.min(0.033, last ? (now - last) / 1000 : 0.016); last = now; step(dt); if ((clock * 4 | 0) !== ((clock - dt) * 4 | 0)) label(); raf = requestAnimationFrame(tick); };
    fit();
    while (P.length < want()) addP(false);
    draw(); label();
    const api = {
      setActive(v) { on = v && !reduce; if (v) { fit(); draw(); } if (on) { last = 0; raf = requestAnimationFrame(tick); } else cancelAnimationFrame(raf); },
      fit() { fit(); draw(); },
      // 시험용: 지금 조건에서 sec초 동안 몇 번 합쳐지는지(화면 없이 계산)
      _setK(k) { K = k; },
      _bench(sec) { const before = half; for (let i = 0; i < sec * 60; i++) step(1 / 60); return half - before; },
    };
    if (opts.expose) root._fusion = api;
    return api;
  }

  window.FusionLab = { mount };
})();
