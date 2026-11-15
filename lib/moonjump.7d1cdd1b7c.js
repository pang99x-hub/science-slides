/* 3-2 2차시 체험 «달에서 뛰어 보자»(교과서 131쪽 해 보기 · 가상 현실로 달에서의 중력 체험하기).
   왼쪽 지구, 오른쪽 달 두 무대에 같은 우주인이 선다(두 무대 같은 축척, 1 m 눈금).
   우주인을 아래로 끌어 웅크렸다 놓으면 웅크린 만큼의 같은 빠르기로 뛰어오른다 — 달에서는 약 6배 높이, 약 6배 오래 떠 있다(체공 시간 표시).
   바닥의 공을 끌어 던지면(끌다 놓는 순간의 손 빠르기) 두 무대에서 같은 자리·같은 속도로 날아가 0.1초마다 자국을 남긴다.
   달 무대에는 지구 공의 길이 옅게 겹쳐 보인다. 화면 밖으로 나가면 가장자리에 거리 표시. 화면은 늘 움직인다(구름·별·하늘의 지구·숨 쉬는 우주인).
   키보드: 1 지구에서 뛰기, 2 달에서 뛰기, T 공 던지기(같은 속도), 0 처음부터.
   MoonJump.mount(root) → { fit, setActive } · 시험용: root._mj.jump('earth'|'moon', 웅크림 0~1) · throw(vx, vy) · run(초) · layout() · state() */
(function () {
  'use strict';
  const TAU = Math.PI * 2, G = { earth: 9.8, moon: 1.62 }, KS = ['earth', 'moon'];
  const V0 = (cr) => 1 + 1.85 * cr; // 웅크림(0~1) → 뛰어오르는 빠르기(m/s)
  const AX = 0.75, BX = 1.45, HAND = 1.3, VMAX = 6.5; // 우주인·공 자리(m), 던지는 빠르기 상한
  // 자체 확인: 같은 빠르기로 뛰면 높이·시간 모두 g에 반비례(약 6배)
  (function () {
    const fly = (g) => { let y = 0, v = V0(1), t = 0, top = 0; do { v -= g * 0.0005; y += v * 0.0005; t += 0.0005; top = Math.max(top, y); } while (y > 0); return [top, t]; };
    const [he, te] = fly(G.earth), [hm, tm] = fly(G.moon);
    console.assert(Math.abs(hm / he - 6.05) < 0.1 && Math.abs(tm / te - 6.05) < 0.1 && he > 0.35 && he < 0.45, 'moonjump: 높이·시간');
  })();

  function mount(root) {
    const stage = root.querySelector('.mj-stage'), now = root.querySelector('.mj-now'), out = root.querySelector('.mj-out'), tab = root.querySelector('.mj-tab'), P = window.Play;
    let t = 0, A, B, drag = null, hist = [], seen, msg = '', art = {}, artKey = '';
    function reset() {
      A = {}; B = {}; KS.forEach((k) => { A[k] = { y: 0, vy: 0, air: false, cr: 0, ta: 0, top: 0, res: null, land: 0 }; B[k] = { x: BX, y: 0.11, vx: 0, vy: 0, fly: false, ta: 0, dots: [], res: null }; });
      drag = null; hist = []; seen = { earth: false, moon: false, ball: false }; msg = ''; fill();
    }
    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };
    const L = () => {
      const W = S.W, H = S.H, gap = 6, PW = (W - gap) / 2, ground = H - 58, ppm = Math.min((ground - 24) / 4.3, PW / 4.2);
      return { W, H, PW, gap, ground, ppm, ox: (k) => (k === 'earth' ? 0 : PW + gap) };
    };
    const X = (l, k, m) => l.ox(k) + 18 + m * l.ppm, Y = (l, m) => l.ground - m * l.ppm;
    const wx = (l, k, px) => (px - l.ox(k) - 18) / l.ppm, wy = (l, py) => (l.ground - py) / l.ppm;
    const which = (l, px) => (px < l.PW + l.gap / 2 ? 'earth' : 'moon');

    // ---------- 바탕(크기가 바뀔 때만) ----------
    function backdrop(l, k) {
      const key = l.W + 'x' + l.H; if (artKey !== key) { art = {}; artKey = key; } if (art[k]) return art[k];
      const cv = document.createElement('canvas'); cv.width = l.PW * 2; cv.height = l.H * 2; const c = cv.getContext('2d'); c.scale(2, 2);
      const W = l.PW, H = l.H, gr = l.ground; let s = k === 'moon' ? 11 : 5; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
      if (k === 'earth') {
        let g = c.createLinearGradient(0, 0, 0, gr); g.addColorStop(0, '#3d7cc9'); g.addColorStop(0.7, '#9cc9ec'); g.addColorStop(1, '#d9eef8'); c.fillStyle = g; c.fillRect(0, 0, W, gr);
        c.fillStyle = '#8fb3a0'; c.beginPath(); c.moveTo(0, gr); for (let x = 0; x <= W; x += 16) c.lineTo(x, gr - 40 - 20 * Math.sin(x * 0.013) - 9 * Math.sin(x * 0.041)); c.lineTo(W, gr); c.fill();
        c.fillStyle = '#6f9b62'; c.beginPath(); c.moveTo(0, gr); for (let x = 0; x <= W; x += 16) c.lineTo(x, gr - 14 - 8 * Math.sin(x * 0.022 + 1)); c.lineTo(W, gr); c.fill();
        g = c.createLinearGradient(0, gr, 0, H); g.addColorStop(0, '#5f9a3e'); g.addColorStop(1, '#3d6b28'); c.fillStyle = g; c.fillRect(0, gr, W, H - gr);
        for (let i = 0; i < 220; i++) { const x = rnd() * W, y = gr + rnd() * (H - gr); c.strokeStyle = `rgba(${rnd() < 0.5 ? '160,205,110' : '40,80,25'},.55)`; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y); c.lineTo(x + (rnd() - 0.5) * 4, y - 4 - rnd() * 5); c.stroke(); }
      } else {
        c.fillStyle = '#05070f'; c.fillRect(0, 0, W, gr);
        let g = c.createLinearGradient(0, gr - 20, 0, H); g.addColorStop(0, '#8e8c86'); g.addColorStop(1, '#4e4c48'); c.fillStyle = g;
        c.beginPath(); c.moveTo(0, gr - 4); for (let x = 0; x <= W; x += 14) c.lineTo(x, gr - 3 - 4 * Math.sin(x * 0.02) - 2 * Math.sin(x * 0.07)); c.lineTo(W, H); c.lineTo(0, H); c.fill();
        c.fillStyle = '#6d6b66'; c.beginPath(); c.moveTo(0, gr - 6); for (let x = 0; x <= W; x += 14) c.lineTo(x, gr - 18 - 14 * Math.sin(x * 0.009 + 2)); c.lineTo(W, gr - 4); c.lineTo(0, gr - 4); c.fill(); // 먼 구덩이 둔덕
        for (let i = 0; i < 10; i++) { const x = rnd() * W, y = gr + 8 + rnd() * (H - gr - 12), r = 4 + rnd() * 12; c.fillStyle = 'rgba(40,38,35,.35)'; c.beginPath(); c.ellipse(x, y, r, r * 0.32, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(220,218,210,.35)'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(x, y + 1, r, r * 0.32, 0, 0.1, Math.PI - 0.1); c.stroke(); }
        for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(${rnd() < 0.5 ? '230,228,220' : '30,28,25'},${0.12 + rnd() * 0.2})`; c.fillRect(rnd() * W, gr + rnd() * (H - gr), 1.4, 1.4); }
      }
      // 높이 눈금(왼쪽)과 바닥 1 m 눈금
      const ink = k === 'earth' ? '#1d2433' : '#e8e6df';
      c.strokeStyle = ink; c.fillStyle = ink; c.lineWidth = 1.5; c.font = '700 15px "IBM Plex Sans KR", sans-serif'; c.textAlign = 'left';
      for (let m = 1; m <= 4; m++) { const y = gr - m * l.ppm; if (y < 10) break; c.globalAlpha = 0.5; c.setLineDash([3, 6]); c.beginPath(); c.moveTo(12, y); c.lineTo(W, y); c.stroke(); c.setLineDash([]); c.globalAlpha = 1; c.fillText(`${m} m`, 4, y - 4); }
      art[k] = cv; return cv;
    }
    function sky(c, l, k) {
      const W = l.PW;
      if (k === 'earth') {
        [[0.15, 50, 0.9], [0.6, 30, 0.7], [0.9, 80, 1]].forEach(([u, y, s], i) => {
          const x = ((u * W + t * (8 + i * 4)) % (W + 140)) - 70; c.fillStyle = 'rgba(255,255,255,.85)';
          [[0, 0, 24], [20, 4, 18], [-20, 6, 16], [8, -9, 16]].forEach(([dx, dy, r]) => { c.beginPath(); c.arc(x + dx * s, y + dy * s, r * s, 0, TAU); c.fill(); });
        });
        P.glow(c, W - 50, 40, 46, 'rgba(255,240,170,.9)', 'rgba(255,240,170,0)'); c.fillStyle = '#fff6c8'; c.beginPath(); c.arc(W - 50, 40, 15, 0, TAU); c.fill();
      } else {
        let s = 3; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
        for (let i = 0; i < 60; i++) { const x = rnd() * W, y = rnd() * (l.ground - 30), ph = rnd() * TAU, a = 0.35 + 0.45 * (0.5 + 0.5 * Math.sin(t * (1 + rnd() * 2) + ph)); c.fillStyle = `rgba(255,255,255,${a})`; c.fillRect(x, y, 1.6, 1.6); }
        const ex = W - 60, ey = 52, er = 22, pul = 0.5 + 0.5 * Math.sin(t * 1.3);
        P.glow(c, ex, ey, er * (2 + pul * 0.4), `rgba(120,180,255,${0.35 + 0.15 * pul})`, 'rgba(120,180,255,0)');
        const g = c.createRadialGradient(ex - 7, ey - 7, 3, ex, ey, er); g.addColorStop(0, '#9fd2ff'); g.addColorStop(0.7, '#2c6fc0'); g.addColorStop(1, '#0d2f66'); c.fillStyle = g; c.beginPath(); c.arc(ex, ey, er, 0, TAU); c.fill();
        c.save(); c.beginPath(); c.arc(ex, ey, er, 0, TAU); c.clip(); c.fillStyle = 'rgba(110,170,80,.85)'; const r = (t * 4) % (er * 4);
        [[-0.4, -0.2, 0.4, 0.25], [0.3, 0.25, 0.3, 0.2]].forEach(([u, v, rw, rh]) => { c.beginPath(); c.ellipse(ex + u * er * 2 - r + er * 2, ey + v * er, rw * er, rh * er, 0.4, 0, TAU); c.fill(); });
        const sh = c.createLinearGradient(ex - er, 0, ex + er, 0); sh.addColorStop(0.45, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,10,.75)'); c.fillStyle = sh; c.fillRect(ex - er, ey - er, er * 2, er * 2); c.restore();
      }
    }
    // 우주인(흰 우주복·금빛 가리개·등짐). 발 높이 fy(m), 웅크림 cr(0~1), 공중이면 air
    function astronaut(c, l, k, a) {
      const p = l.ppm, x = X(l, k, AX), fy = a.y, cr = a.cr, Yb = (m) => Y(l, fy + m);
      const breath = a.air || cr ? 0 : 0.012 * Math.sin(t * 2.2 + (k === 'moon' ? 1 : 0));
      const rise = a.air ? Math.max(-1, Math.min(1, a.vy / V0(1))) : 0, tuck = a.air ? 0.12 * (1 - Math.abs(rise)) : 0;
      const hip = 0.92 - 0.38 * cr - tuck + breath, knee = 0.5 - 0.22 * cr - tuck * 0.5, kx = (0.08 + 0.2 * cr + tuck) * p;
      const suit = (x0, x1) => { const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, '#c9ccd0'); g.addColorStop(0.45, '#fbfbf9'); g.addColorStop(1, '#a9adb3'); return g; };
      // 그림자(높이 뛸수록 작고 옅게)
      const sh = Math.max(0.25, 1 - fy / 3); c.fillStyle = k === 'moon' ? `rgba(0,0,0,${0.45 * sh})` : `rgba(20,50,10,${0.3 * sh})`; c.beginPath(); c.ellipse(x + 8, l.ground + 4, 0.45 * p * sh, 6 * sh, 0, 0, TAU); c.fill();
      c.fillStyle = '#d7d9dc'; c.strokeStyle = '#7c8088'; c.lineWidth = 1.5; c.beginPath(); c.roundRect(x - 0.32 * p, Yb(hip + 0.7), 0.26 * p, 0.6 * p, 6); c.fill(); c.stroke(); // 등짐(왼쪽 뒤)
      // 다리: 엉덩이 → 무릎(앞으로) → 발
      [-1, 1].forEach((sd) => {
        const hx = x + sd * 0.07 * p, fx = x + sd * 0.12 * p;
        c.strokeStyle = suit(hx - 12, hx + 12); c.lineWidth = 0.16 * p; c.lineCap = 'round'; c.lineJoin = 'round';
        c.beginPath(); c.moveTo(hx, Yb(hip)); c.lineTo(hx + kx, Yb(knee)); c.lineTo(fx, Yb(0.1)); c.stroke();
        c.fillStyle = '#e9e7e1'; c.strokeStyle = '#6d6a63'; c.lineWidth = 1.5; c.beginPath(); c.roundRect(fx - 0.08 * p, Yb(0.12), 0.24 * p, 0.12 * p, 5); c.fill(); c.stroke();
      });
      // 몸통(웅크리면 앞으로 기운다)
      c.save(); c.translate(x, Yb(hip)); c.rotate(0.35 * cr + 0.1 * tuck);
      c.fillStyle = suit(-0.22 * p, 0.22 * p); c.beginPath(); c.roundRect(-0.22 * p, -0.6 * p, 0.44 * p, 0.62 * p, 12); c.fill(); c.strokeStyle = '#8a8e95'; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = '#9aa2ad'; c.beginPath(); c.roundRect(-0.12 * p, -0.44 * p, 0.24 * p, 0.14 * p, 4); c.fill();
      ['#d9483b', '#2a73b8', '#f0c43c'].forEach((col, i) => { c.fillStyle = col; c.beginPath(); c.arc(-0.06 * p + i * 0.06 * p, -0.37 * p, 2.6, 0, TAU); c.fill(); });
      c.fillStyle = '#c8392e'; c.fillRect(-0.22 * p, -0.08 * p, 0.44 * p, 3);
      const hy = -0.78 * p, hr = 0.16 * p; let g = c.createRadialGradient(-hr * 0.4, hy - hr * 0.4, 2, 0, hy, hr); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#b9bdc3'); c.fillStyle = g; c.beginPath(); c.arc(0, hy, hr, 0, TAU); c.fill(); c.strokeStyle = '#7c8088'; c.stroke();
      g = c.createLinearGradient(-hr, hy - hr, hr, hy + hr); g.addColorStop(0, '#ffe8a0'); g.addColorStop(0.4, '#d39b2a'); g.addColorStop(1, '#6b4310'); c.fillStyle = g; c.beginPath(); c.ellipse(hr * 0.15, hy + 2, hr * 0.72, hr * 0.58, 0, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(-hr * 0.2, hy - hr * 0.15, hr * 0.17, hr * 0.07, -0.5, 0, TAU); c.fill();
      // 팔: 웅크리면 뒤로, 뛰어오르면 위로
      const up = a.air ? 0.5 + 0.5 * Math.max(0, rise) : 0, back = cr;
      [-1, 1].forEach((sd) => {
        const sx = sd * 0.2 * p, sy = -0.52 * p, ang = Math.PI / 2 + back * 0.9 - up * 2.6 + sd * 0.08, len = 0.56 * p;
        const ex = sx + Math.cos(ang) * len * 0.5 + sd * 4, ey = sy + Math.sin(ang) * len * 0.5, hx = sx + Math.cos(ang) * len, hy2 = sy + Math.sin(ang) * len;
        c.strokeStyle = suit(Math.min(sx, hx) - 10, Math.max(sx, hx) + 10); c.lineWidth = 0.12 * p; c.lineCap = 'round';
        c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.lineTo(hx, hy2); c.stroke();
        c.fillStyle = '#5a5f66'; c.beginPath(); c.arc(hx, hy2, 0.055 * p, 0, TAU); c.fill();
      });
      c.restore();
    }
    function ball(c, x, y, r) {
      const g = c.createRadialGradient(x - r * 0.35, y - r * 0.35, 1, x, y, r); g.addColorStop(0, '#ffb27a'); g.addColorStop(0.6, '#e5541f'); g.addColorStop(1, '#8d2a08'); c.fillStyle = g;
      c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.strokeStyle = 'rgba(60,20,5,.6)'; c.lineWidth = 1.2; c.beginPath(); c.arc(x, y, r * 0.9, -0.6, 1.2); c.stroke();
    }
    const tag = (c, s, x, y, dark, al) => { c.font = '800 18px "IBM Plex Sans KR", sans-serif'; const w = c.measureText(s).width + 16, bx = al === 'right' ? x - w : al === 'left' ? x : x - w / 2; c.fillStyle = dark ? 'rgba(29,36,51,.88)' : 'rgba(255,255,255,.94)'; c.beginPath(); c.roundRect(bx, y - 22, w, 30, 8); c.fill(); P.txt(c, s, bx + w / 2, y, dark ? '#ffd84d' : '#1d2433', '800 18px'); };

    // ---------- 물리 ----------
    function jump(k, cr) { const a = A[k]; if (a.air) return; a.cr = 0; a.vy = V0(cr); a.v0 = a.vy; a.air = true; a.ta = 0; a.top = 0; a.res = null; }
    function throwBall(vx, vy) {
      const sp = Math.hypot(vx, vy); if (sp > VMAX) { vx *= VMAX / sp; vy *= VMAX / sp; }
      const from = B.earth; KS.forEach((k) => { const b = B[k]; b.x = from.x; b.y = from.y; b.vx = vx; b.vy = vy; b.fly = true; b.ta = 0; b.dots = [[b.x, b.y]]; b.res = null; b.v = Math.hypot(vx, vy); });
    }
    function step(dt) {
      KS.forEach((k) => {
        const a = A[k], g = G[k];
        if (a.air) { a.vy -= g * dt; a.y += a.vy * dt; a.ta += dt; a.top = Math.max(a.top, a.y); if (a.y <= 0) { a.y = 0; a.air = false; a.land = 1; a.res = { h: a.top, t: a.ta, v: a.v0 }; seen[k] = true; fill(); talk(k); } }
        if (a.land > 0) a.land = Math.max(0, a.land - dt * 3);
        const b = B[k];
        if (b.fly) { b.vy -= g * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.ta += dt; if (Math.floor(b.ta / 0.1) >= b.dots.length) b.dots.push([b.x, b.y]); if (b.y <= 0.11) { b.y = 0.11; b.fly = false; b.res = { x: b.x - (b.dots[0] ? b.dots[0][0] : BX), t: b.ta }; if (KS.every((q) => B[q].res)) { seen.ball = true; fill(); talk('ball'); } } }
      });
    }
    function fill() {
      const set = (r, i, s) => { const td = tab.querySelectorAll('tbody tr')[r].children[i]; if (td.textContent !== s) { td.textContent = s; td.parentElement.classList.remove('new'); void td.offsetWidth; if (s) td.parentElement.classList.add('new'); } };
      KS.forEach((k, i) => {
        set(0, i + 1, A[k].res ? `${A[k].res.h.toFixed(2)} m` : '');
        set(1, i + 1, A[k].res ? `${A[k].res.t.toFixed(2)}초` : '');
        set(2, i + 1, B[k].res && KS.every((q) => B[q].res) ? `${B[k].res.x.toFixed(1)} m` : '');
      });
      const ok = []; if (seen.earth) ok.push(1); if (seen.moon) ok.push(2); if (seen.ball) ok.push(3);
      const st = [1, 2, 3].find((n) => !ok.includes(n)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 지구 우주인을 아래로 끌었다 놓기' : st === 2 ? '② 달 우주인도 같은 만큼 웅크렸다 놓기' : st === 3 ? '③ 바닥의 공을 끌어 던지기' : '모두 해 봤다 — 웅크림·던지기를 바꿔 보자';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
      if (!msg) say('우주인을 <b>아래로 끌어</b> 웅크리게 한 뒤 놓아 보자. 많이 웅크릴수록 세게 뛴다.');
    }
    function talk(k) {
      const e = A.earth.res, m = A.moon.res;
      if (k === 'ball') { const be = B.earth.res, bm = B.moon.res; say(`같은 속도(${B.earth.v.toFixed(1)} m/s)로 던졌는데 지구 <b>${be.x.toFixed(1)} m · ${be.t.toFixed(2)}초</b>, 달 <b>${bm.x.toFixed(1)} m · ${bm.t.toFixed(2)}초</b>. 달에서는 천천히 떨어져 <b>더 오래, 더 멀리</b> 난다.`); return; }
      if (e && m && Math.abs(e.v - m.v) < 0.05) say(`같은 빠르기 ${e.v.toFixed(1)} m/s로 뛰었다: 높이 지구 ${e.h.toFixed(2)} m · 달 <b>${m.h.toFixed(2)} m</b>(약 ${(m.h / e.h).toFixed(1)}배), 떠 있는 시간도 약 <b>${(m.t / e.t).toFixed(1)}배</b>.`);
      else if (k === 'earth') say(`지구: ${e.v.toFixed(1)} m/s로 뛰어 <b>${e.h.toFixed(2)} m</b>, <b>${e.t.toFixed(2)}초</b> 떠 있었다.${m ? ' 달과 같은 만큼 웅크려야 공정한 비교!' : ' 이제 달에서도 같은 만큼 웅크려 보자.'}`);
      else say(`달: ${m.v.toFixed(1)} m/s로 뛰어 <b>${m.h.toFixed(2)} m</b>, <b>${m.t.toFixed(2)}초</b> 떠 있었다.${e ? ' 지구와 같은 만큼 웅크려야 공정한 비교!' : ' 지구에서도 같은 만큼 웅크려 보자.'}`);
    }

    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; for (let i = 0; i < 4; i++) step(dt / 4);
        const l = L();
        KS.forEach((k) => {
          const ox = l.ox(k), a = A[k], b = B[k], dark = k === 'moon';
          c.save(); c.beginPath(); c.rect(ox, 0, l.PW, H); c.clip(); c.translate(ox, 0);
          c.drawImage(backdrop(l, k), 0, 0, l.PW, H); sky(c, l, k); c.restore();
          c.save(); c.beginPath(); c.rect(ox, 0, l.PW, H); c.clip();
          // 최고 높이 점선
          const top = a.air ? a.top : a.res ? a.res.h : 0;
          if (top > 0.02) { const y = Y(l, top); c.strokeStyle = '#ffd84d'; c.setLineDash([7, 6]); c.lineWidth = 2.5; c.beginPath(); c.moveTo(X(l, k, AX) - 0.5 * l.ppm, y); c.lineTo(X(l, k, AX) + 0.6 * l.ppm, y); c.stroke(); c.setLineDash([]); tag(c, `최고 ${top.toFixed(2)} m`, X(l, k, AX) + 0.62 * l.ppm, y + 8, true, 'left'); }
          // 공의 0.1초 자국(달에는 지구 공 길도 옅게)
          if (k === 'moon') B.earth.dots.forEach(([x, y]) => { c.strokeStyle = 'rgba(160,210,255,.65)'; c.lineWidth = 2; c.beginPath(); c.arc(X(l, k, x), Y(l, y), 5, 0, TAU); c.stroke(); });
          b.dots.forEach(([x, y]) => { c.fillStyle = dark ? 'rgba(255,190,140,.75)' : 'rgba(229,84,31,.6)'; c.beginPath(); c.arc(X(l, k, x), Y(l, y), 5, 0, TAU); c.fill(); });
          astronaut(c, l, k, a);
          if (a.land > 0) { c.fillStyle = dark ? `rgba(200,196,186,${a.land * 0.6})` : `rgba(120,90,50,${a.land * 0.4})`; for (let i = 0; i < 8; i++) { c.beginPath(); c.arc(X(l, k, AX) + (i - 3.5) * 9, l.ground - (1 - a.land) * (dark ? 18 : 8) * (1 + (i % 3)), 2.4, 0, TAU); c.fill(); } }
          const bx = X(l, k, b.x), by = Y(l, b.y), edge = ox + l.PW - 14;
          if (bx < edge) ball(c, bx, by, 0.11 * l.ppm);
          else { const yy = Math.max(30, Math.min(l.ground - 10, by)); c.fillStyle = '#ffd84d'; c.beginPath(); c.moveTo(edge + 10, yy); c.lineTo(edge - 8, yy - 10); c.lineTo(edge - 8, yy + 10); c.fill(); }
          // 체공 시간·결과
          if (a.air) tag(c, `떠 있는 시간 ${a.ta.toFixed(2)}초`, X(l, k, AX) + 0.4 * l.ppm, Y(l, a.y + 0.9), true, 'left');
          else if (a.res) tag(c, `${a.res.t.toFixed(2)}초 떠 있었다`, X(l, k, AX) + 0.1 * l.ppm, l.ground + 32, !dark, 'left');
          if (b.res && KS.every((q) => B[q].res)) { const lx = Math.min(edge - 6, bx); tag(c, `공 ${b.res.x.toFixed(1)} m · ${b.res.t.toFixed(1)}초`, lx, l.ground - 0.45 * l.ppm, true, 'right'); }
          else if (b.fly && bx >= edge) tag(c, `→ ${(b.x - BX).toFixed(1)} m`, edge - 14, Math.max(52, Math.min(l.ground - 20, by)) - 14, true, 'right');
          // 이름표(바닥 띠)
          P.txt(c, k === 'earth' ? '지구 · 중력 가속도 약 9.8 m/s²' : '달 · 약 1.6 m/s²(약 1/6)', ox + l.PW - 12, H - 14, dark ? '#fff' : '#fff', '800 19px', 'right');
          // 처음 안내: 아래로 끌기 · 공 끌기
          if (!a.air && !a.res && !a.cr && !(drag && drag.k === 'a')) { const bb = 5 * Math.sin(t * 4), x = X(l, k, AX) - 0.55 * l.ppm, y = Y(l, 1.6) + bb; c.strokeStyle = 'rgba(255,216,77,.95)'; c.lineWidth = 4; c.beginPath(); c.moveTo(x, y - 24); c.lineTo(x, y + 8); c.moveTo(x - 9, y - 2); c.lineTo(x, y + 10); c.lineTo(x + 9, y - 2); c.stroke(); }
          if (seen.earth && seen.moon && !b.fly && !b.res && !drag) { const bb = 0.5 + 0.5 * Math.sin(t * 4); c.strokeStyle = `rgba(255,216,77,${0.5 + 0.5 * bb})`; c.lineWidth = 3; c.beginPath(); c.arc(bx, by, 0.11 * l.ppm + 6 + 4 * bb, 0, TAU); c.stroke(); }
          c.restore();
        });
        c.fillStyle = '#1d2433'; c.fillRect(l.PW, 0, l.gap, H); // 가운데 칸막이
      },
      down(p) {
        const l = L(), k = which(l, p.x), a = A[k], b = B[k], mx = wx(l, k, p.x), my = wy(l, p.y);
        if (!b.fly && Math.hypot(mx - b.x, my - b.y) < 0.35) { drag = { k: 'b', side: k }; hist = [[performance.now(), mx, my]]; return; }
        if (!a.air && Math.abs(mx - AX) < 0.45 && my > -0.3 && my < 2.0) { drag = { k: 'a', side: k, y0: p.y }; }
      },
      move(p) {
        if (!drag) return; const l = L(), k = drag.side;
        if (drag.k === 'a') { A[k].cr = Math.max(0, Math.min(1, (p.y - drag.y0) / (0.4 * l.ppm))); return; }
        const mx = Math.max(0.15, Math.min(2.4, wx(l, k, p.x))), my = Math.max(0.11, Math.min(2.6, wy(l, p.y)));
        KS.forEach((q) => { const b = B[q]; b.x = mx; b.y = my; b.dots = []; b.res = null; });
        hist.push([performance.now(), mx, my]); while (hist.length > 2 && hist[hist.length - 1][0] - hist[0][0] > 90) hist.shift();
      },
      up() {
        if (!drag) return; const d = drag; drag = null;
        if (d.k === 'a') { const cr = A[d.side].cr; if (cr > 0.12) jump(d.side, cr); else A[d.side].cr = 0; return; }
        const h0 = hist[0], h1 = hist[hist.length - 1], dt = Math.max(0.016, (h1[0] - h0[0]) / 1000);
        throwBall((h1[1] - h0[1]) / dt, (h1[2] - h0[2]) / dt);
      },
      key(e) {
        const k = e.key.toLowerCase();
        if (k === '1' || k === '2') { jump(k === '1' ? 'earth' : 'moon', 1); return true; }
        if (k === 't') { KS.forEach((q) => { B[q].x = BX; B[q].y = HAND; }); throwBall(3.6, 3.0); return true; }
        if (k === '0') { reset(); return true; } return false;
      },
    });
    root.querySelector('.mj-reset').addEventListener('click', () => { reset(); S.kick(); });
    reset();
    const state = () => ({ earth: A.earth.res, moon: A.moon.res, ballE: B.earth.res, ballM: B.moon.res, air: [A.earth.air, A.moon.air], seen: { ...seen }, done: root.classList.contains('u-done') });
    root._mj = {
      jump: (k, cr) => { jump(k, cr == null ? 1 : cr); S.kick(); return state(); },
      throw: (vx, vy) => { KS.forEach((q) => { B[q].x = BX; B[q].y = HAND; }); throwBall(vx, vy); S.kick(); return state(); },
      run: (sec) => { for (let i = 0; i < sec * 500; i++) step(0.002); S.kick(); return state(); },
      layout: () => { const l = L(); return { W: l.W, H: l.H, PW: l.PW, gap: l.gap, ground: l.ground, ppm: l.ppm, AX, BX, ax: KS.map((k) => X(l, k, AX)), bx: KS.map((k) => X(l, k, B[k].x)), by: Y(l, B.earth.y), feetY: l.ground }; },
      state,
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.MoonJump = { mount };
})();
