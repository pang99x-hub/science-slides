/* 3-1 4차시 체험 «흔들려도 버티는 건물»(교과서 117쪽 지진의 피해 · 참고서 144쪽 지진 피해를 줄이는 노력).
   아래: 같은 땅 위 보통 건물과 내진 건물(면진 받침 + 가새). 땅을 좌우로 빠르게 문지를수록 진동이 세지고,
   보통 건물은 금이 가다 무너지며 내진 건물은 받침이 흔들림을 흡수해 버틴다.
   위: 진원 → 관측소 → 열차 지도. 진원을 누르면 빠르고 약한 P파가 먼저 관측소에 닿아 경보가 울리고,
   느리고 강한 S파가 뒤따른다. 경보 뒤 열차를 멈춤 구역으로 끌면 강한 흔들림 전에 선다.
   세기·속도는 이해를 돕기 위한 예. Shake.mount(root) → { fit, setActive } · 시험용: root._sh.shake(초, 세기) · warn() · state() */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const MAP = 0.3, EPI = [0.07, 0.15], STA = [0.28, 0.12], TRACK = 0.22, T0 = 0.42, T1 = 0.98, Z0 = 0.62, Z1 = 0.76, VP = 0.16, VS = 0.065, BASE = 0.86;
  const dist = (a, b, W, H) => Math.hypot((a[0] - b[0]) * W, (a[1] - b[1]) * H) / W; // 화면 폭 단위
  // 자체 확인: P파가 S파보다 먼저 관측소에 닿는다
  console.assert(dist(EPI, STA, 1000, 400) / VP < dist(EPI, STA, 1000, 400) / VS, 'shake: P파가 먼저');

  function mount(root) {
    const stage = root.querySelector('.sh-stage'), now = root.querySelector('.sh-now'), out = root.querySelector('.sh-out');
    const P = window.Play;
    let amp, t, crack, fell, fallT, shookT, drag, lastX, lastT, quake, qT, warned, train, stopped, braking, hitS, saved, dust, msg, bg = null, bgKey = '', uiT = 0;
    function reset() {
      amp = 0; t = 0; crack = 0; fell = false; fallT = 0; shookT = 0; drag = null; quake = false; qT = 0; warned = false; train = 0.46; stopped = false; braking = false; hitS = false; saved = false; dust = []; msg = '';
    }
    reset();
    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };
    const X = (u) => u * S.W, Y = (v) => v * S.H;

    function paint(W, H) {
      const k = Math.max(1, Math.min(2, window.devicePixelRatio || 1)), cv = document.createElement('canvas'); cv.width = W * k; cv.height = H * k;
      const c = cv.getContext('2d'); c.setTransform(k, 0, 0, k, 0, 0);
      // 위 지도 띠
      const m = c.createLinearGradient(0, 0, 0, H * MAP); m.addColorStop(0, '#dcebc9'); m.addColorStop(1, '#c6dcae'); c.fillStyle = m; c.fillRect(0, 0, W, H * MAP);
      for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(80,120,60,${0.06 + (i % 3) * 0.03})`; c.beginPath(); c.arc(((i * 211) % 997) / 997 * W, ((i * 73) % 100) / 100 * H * MAP, 2 + (i % 4), 0, TAU); c.fill(); }
      c.fillStyle = '#7fb0d6'; c.beginPath(); c.moveTo(0, 0); c.lineTo(W * 0.16, 0); c.quadraticCurveTo(W * 0.12, H * 0.12, W * 0.17, H * MAP); c.lineTo(0, H * MAP); c.fill(); // 바다 쪽
      c.strokeStyle = '#5b4a3a'; c.lineWidth = 4; c.beginPath(); c.moveTo(W * T0, H * TRACK); c.lineTo(W * T1, H * TRACK); c.stroke();
      c.strokeStyle = '#b9a58a'; c.lineWidth = 2; for (let x = W * T0; x < W * T1; x += 9) { c.beginPath(); c.moveTo(x, H * TRACK - 5); c.lineTo(x, H * TRACK + 5); c.stroke(); }
      c.fillStyle = 'rgba(47,125,74,.22)'; c.strokeStyle = '#2f7d4a'; c.lineWidth = 2; c.setLineDash([6, 4]); c.beginPath(); c.roundRect(W * Z0, H * TRACK - 16, W * (Z1 - Z0), 32, 6); c.fill(); c.stroke(); c.setLineDash([]);
      P.txt(c, '멈춤 구역', W * (Z0 + Z1) / 2, H * TRACK + 30, '#1f5a34', '800 12px');
      // 관측소
      const sx = W * STA[0], sy = H * STA[1];
      c.fillStyle = '#eef1f4'; c.fillRect(sx - 14, sy - 8, 28, 18); c.strokeStyle = '#4a5562'; c.lineWidth = 1.5; c.strokeRect(sx - 14, sy - 8, 28, 18);
      c.beginPath(); c.moveTo(sx, sy - 8); c.lineTo(sx, sy - 24); c.stroke(); c.beginPath(); c.arc(sx, sy - 26, 4, 0, TAU); c.stroke();
      P.txt(c, '지진 관측소', sx, sy + 24, '#1d2433', '800 12px');
      c.strokeStyle = 'rgba(29,36,51,.5)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, H * MAP); c.lineTo(W, H * MAP); c.stroke();
      // 아래 하늘과 도시
      const sky = c.createLinearGradient(0, H * MAP, 0, H * BASE); sky.addColorStop(0, '#bcdcf0'); sky.addColorStop(1, '#eef6fb'); c.fillStyle = sky; c.fillRect(0, H * MAP, W, H * (BASE - MAP));
      c.fillStyle = 'rgba(120,140,160,.25)'; [[0.05, 0.12], [0.12, 0.2], [0.47, 0.16], [0.53, 0.1], [0.88, 0.18], [0.94, 0.11]].forEach(([x, h]) => c.fillRect(W * x, H * (BASE - h), W * 0.05, H * h));
      return cv;
    }
    function ground(c, W, H, gx) {
      const g = c.createLinearGradient(0, H * BASE, 0, H); g.addColorStop(0, '#8a6e4e'); g.addColorStop(1, '#5c4632'); c.fillStyle = g; c.fillRect(0, H * BASE, W, H * (1 - BASE));
      c.fillStyle = '#6aa84f'; c.fillRect(0, H * BASE - 3, W, 5);
      c.fillStyle = 'rgba(40,28,18,.3)'; for (let i = 0; i < 70; i++) c.fillRect(((i * 97) % W) + gx, H * BASE + 8 + ((i * 37) % Math.max(1, H * (1 - BASE) - 12)), 4, 2);
    }
    // 건물: 층마다 sway를 높이 비율만큼 밀어 휘어 보인다
    function building(c, cx, by, w, h, sway, col, opts) {
      const n = 6, fh = h / n;
      for (let i = 0; i < n; i++) {
        const k0 = i / n, k1 = (i + 1) / n, x0 = cx + sway * k0 * k0, x1 = cx + sway * k1 * k1, y0 = by - fh * i, y1 = by - fh * (i + 1);
        c.fillStyle = col[i % 2]; c.beginPath(); c.moveTo(x0 - w / 2, y0); c.lineTo(x0 + w / 2, y0); c.lineTo(x1 + w / 2, y1); c.lineTo(x1 - w / 2, y1); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(30,40,50,.35)'; c.lineWidth = 1; c.stroke();
        for (let j = 0; j < 3; j++) { const fx = (x0 + x1) / 2 - w / 2 + w * (0.18 + j * 0.27); c.fillStyle = '#9cc4de'; c.fillRect(fx, y1 + fh * 0.25, w * 0.16, fh * 0.45); }
        if (opts.brace) { c.strokeStyle = 'rgba(200,70,40,.85)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x0 - w / 2 + 2, y0); c.lineTo(x1 + w / 2 - 2, y1); c.moveTo(x0 + w / 2 - 2, y0); c.lineTo(x1 - w / 2 + 2, y1); c.stroke(); }
      }
      c.fillStyle = '#5b6470'; c.fillRect(cx + sway - w / 2 - 3, by - h - 5, w + 6, 6);
      if (opts.crack > 0.15) {
        c.strokeStyle = '#2a1d14'; c.lineWidth = 2;
        const cr = [[0.2, 0.25], [0.6, 0.15], [0.35, 0.55], [0.75, 0.4], [0.5, 0.75]];
        cr.slice(0, Math.ceil(opts.crack * cr.length)).forEach(([u, v], i) => { const y = by - h * v, x = cx - w / 2 + w * u + sway * v * v; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 6, y + 7); c.lineTo(x + 2, y + 12); c.lineTo(x + 9, y + 20 + i); c.stroke(); });
      }
    }
    function startQuake() { if (quake) return false; quake = true; qT = 0; steps(); S.kick(); return true; }
    function stopTrain() {
      if (!quake || !warned) { say(!quake ? '아직 지진이 없다 — 열차는 그대로 달린다. 먼저 진원을 눌러 보자.' : '아직 경보가 없다 — 관측소에 P파가 닿을 때까지 기다리자.'); return false; }
      if (hitS) return false;
      train = Math.max(Z0 + 0.03, Math.min(Z1 - 0.03, train)); braking = true; steps(); S.kick(); return true;
    }
    function step(dt) {
      t += dt;
      // 진동: 문지르기를 멈추면 서서히 잦아든다
      if (!drag) amp = Math.max(0, amp - dt * 0.7);
      if (amp > 0.25) shookT += dt;
      if (!fell && amp > 0.45) { crack += (amp - 0.45) * dt * 0.35; if (crack >= 1) { crack = 1; fell = true; fallT = 0; dust = Array.from({ length: 40 }, () => ({ x: (Math.random() - 0.5) * 0.18, y: Math.random() * 0.05, vx: (Math.random() - 0.5) * 0.06, vy: -0.02 - Math.random() * 0.05, a: 1 })); } }
      if (fell) { fallT += dt; dust.forEach((d) => { d.x += d.vx * dt; d.y += d.vy * dt; d.a = Math.max(0, d.a - dt * 0.25); }); }
      // 열차: 멈춤 구역에서 경보 뒤에만 선다
      if (braking) { if (Math.abs(train - (Z0 + Z1) / 2) > 0.004) train += Math.sign((Z0 + Z1) / 2 - train) * Math.min(0.02 * dt, Math.abs((Z0 + Z1) / 2 - train)); stopped = true; }
      else if (!hitS && drag?.k !== 'train') { train += 0.016 * dt; if (train > T1 - 0.02) train = T0 + 0.02; }
      if (quake) {
        qT += dt;
        const W = S.W || 1000, H = S.H || 400;
        if (!warned && qT * VP >= dist(EPI, STA, W, H)) warned = true;
        if (!hitS && qT * VS >= dist(EPI, [train, TRACK], W, H)) { hitS = true; saved = stopped; }
      }
    }
    function steps() {
      const ok = []; if (shookT > 1.5) ok.push(1); if (fell) ok.push(2); if (saved) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 땅을 좌우로 빠르게 문지르자' : st === 2 ? '② 보통 건물이 무너질 만큼 세게!' : st === 3 ? (hitS && !saved ? '처음부터 다시 — 경보 뒤 열차를 멈춤 구역에' : '③ 진원을 누르고, 경보가 울리면 열차를 멈춤 구역으로') : '경보가 열차를 세웠다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
      if (quake && !hitS) say(warned ? '<b>경보!</b> 빠르지만 약한 <b>P파</b>가 먼저 관측소에 닿았다. 강한 <b>S파</b>가 오기 전에 열차를 멈춤 구역으로 끌자.' : '진원에서 지진파가 퍼진다 — 빠른 P파가 앞서고 느린 S파가 뒤따른다.');
      else if (hitS) say(saved ? '강한 S파가 닿았을 때 열차는 이미 서 있었다 — 몇 초 먼저 온 <b>경보</b>가 큰 사고를 막는다.' : '열차가 달리는 중에 강한 S파가 닿았다 — 탈선 위험! <b>처음부터</b> 다시 해 보자.');
      else if (fell) say('보통 건물은 흔들림을 그대로 받아 금이 가다 <b>무너졌다</b>. 내진 건물은 바닥의 <b>면진 받침</b>이 흔들림을 흡수하고 <b>가새</b>가 뼈대를 잡아 버텼다.');
      else if (amp > 0.05) say(`진동 세기 ${Math.round(amp * 100)} — 보통 건물은 위층일수록 크게 휘청이고, 내진 건물은 받침만 움직이고 건물은 거의 그대로다.`);
      else say('아래 땅을 잡고 <b>좌우로 빠르게</b> 문질러 지진을 일으키자. 빠를수록 세게 흔들린다.');
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        if (dt) step(Math.min(dt, 0.05));
        const key = `${W}x${H}`; if (key !== bgKey) { bg = paint(W, H); bgKey = key; }
        c.drawImage(bg, 0, 0, W, H);
        // 위 지도: 진원·지진파·열차
        const ex = X(EPI[0]), ey = Y(EPI[1]);
        if (quake) {
          const rp = qT * VP * W, rs = qT * VS * W;
          c.save(); c.beginPath(); c.rect(0, 0, W, Y(MAP)); c.clip();
          c.strokeStyle = 'rgba(60,120,220,.8)'; c.lineWidth = 2; c.beginPath(); c.arc(ex, ey, rp, 0, TAU); c.stroke();
          c.strokeStyle = 'rgba(220,60,40,.9)'; c.lineWidth = 5; c.beginPath(); c.arc(ex, ey, rs, 0, TAU); c.stroke();
          if (rp < W) P.txt(c, 'P파', ex + rp * 0.72, ey - rp * 0.5, '#2a5bb0', '800 12px'); if (rs < W) P.txt(c, 'S파', ex + rs * 0.72, ey + rs * 0.5 + 4, '#c0392b', '800 12px');
          c.restore();
        }
        const pj = 0.5 + 0.5 * Math.sin(t * 5);
        c.fillStyle = quake ? '#c0392b' : `rgba(255,${180 + pj * 40},60,1)`; c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 6 : 14, a = -Math.PI / 2 + i * Math.PI / 5; c.lineTo(ex + r * Math.cos(a), ey + r * Math.sin(a)); } c.fill();
        P.txt(c, quake ? '진원' : '진원 누르기', ex, ey + 28, '#1d2433', '800 12px');
        if (warned) { const sx = X(STA[0]), sy = Y(STA[1]); c.fillStyle = `rgba(255,74,58,${0.5 + 0.5 * Math.sin(t * 12)})`; c.beginPath(); c.roundRect(sx + 18, sy - 22, 46, 20, 6); c.fill(); P.txt(c, '경보!', sx + 41, sy - 7, '#fff', '900 12px'); }
        // 열차
        const tx = X(train) + (hitS && !saved ? Math.sin(t * 40) * 3 : 0), ty = Y(TRACK);
        c.fillStyle = '#e9edf0'; c.strokeStyle = '#2b3a4a'; c.lineWidth = 1.5;
        for (let i = 0; i < 3; i++) { c.beginPath(); c.roundRect(tx - 40 + i * 27, ty - 9, 25, 14, i === 2 ? [3, 8, 3, 3] : 3); c.fill(); c.stroke(); c.fillStyle = '#3f6f9a'; c.fillRect(tx - 37 + i * 27, ty - 6, 19, 4); c.fillStyle = '#e9edf0'; }
        if (warned && !braking && !hitS) { c.strokeStyle = `rgba(255,216,77,${pj})`; c.lineWidth = 3; c.setLineDash([5, 5]); c.beginPath(); c.roundRect(tx - 46, ty - 15, 88, 26, 8); c.stroke(); c.setLineDash([]); P.txt(c, '끌어서 멈춤 구역으로', tx, ty - 22, '#1d2433', '800 12px'); }
        if (hitS) P.txt(c, saved ? '정지 — 안전' : '탈선 위험!', tx, ty - 20, saved ? '#1f5a34' : '#c0392b', '900 13px');
        // 아래: 땅과 두 건물
        const gx = amp * 16 * Math.sin(t * 22);
        ground(c, W, H, gx);
        const by = Y(BASE) - 1, bw = W * 0.15, bh = H * 0.44;
        const sw = amp * 34 * Math.sin(t * 22 - 0.7) * (1 + crack * 0.6);
        if (!fell) building(c, X(0.3) + gx, by, bw, bh, sw, ['#e3d6c3', '#d8c9b2'], { crack });
        else {
          const k = Math.min(1, fallT / 0.8), hh = bh * (1 - 0.78 * k);
          c.fillStyle = '#b8a68e'; c.beginPath(); c.moveTo(X(0.3) - bw * 0.7 + gx, by); for (let i = 0; i <= 12; i++) c.lineTo(X(0.3) - bw * 0.7 + gx + bw * 1.4 * i / 12, by - hh * (0.55 + 0.45 * Math.sin(i * 1.7) ** 2) * Math.sin(Math.PI * i / 12)); c.lineTo(X(0.3) + bw * 0.7 + gx, by); c.fill();
          c.fillStyle = '#8c7a62'; for (let i = 0; i < 14; i++) c.fillRect(X(0.3) - bw * 0.6 + ((i * 37) % bw * 1.2) + gx, by - 8 - (i % 4) * 6, 8, 5);
          dust.forEach((d) => { c.fillStyle = `rgba(170,150,120,${d.a * 0.5})`; c.beginPath(); c.arc(X(0.3 + d.x), by - H * 0.05 + H * d.y, 10, 0, TAU); c.fill(); });
          P.txt(c, '무너짐', X(0.3), by - bh * 0.35, '#c0392b', '900 16px');
        }
        // 내진 건물: 받침이 땅과 함께 밀리고 건물은 거의 그대로
        const isoX = X(0.7), padH = 12, bodyX = isoX + gx * 0.12;
        for (let i = -1; i <= 1; i++) { const x0 = isoX + gx + i * bw * 0.33, x1 = bodyX + i * bw * 0.33; c.fillStyle = '#3d3d3d'; c.beginPath(); c.moveTo(x0 - 9, by); c.lineTo(x0 + 9, by); c.lineTo(x1 + 9, by - padH); c.lineTo(x1 - 9, by - padH); c.fill(); c.strokeStyle = '#d9a441'; c.lineWidth = 1.5; for (let j = 1; j < 3; j++) { const yy = by - padH * j / 3, xx = x0 + (x1 - x0) * j / 3; c.beginPath(); c.moveTo(xx - 9, yy); c.lineTo(xx + 9, yy); c.stroke(); } }
        building(c, bodyX, by - padH, bw, bh - padH, amp * 5 * Math.sin(t * 22 - 0.7), ['#d6e4ee', '#c8d9e6'], { brace: true, crack: 0 });
        P.txt(c, '보통 건물', X(0.3), Y(0.97), '#fff', '800 14px'); P.txt(c, '내진 건물(면진 받침 + 가새)', X(0.7), Y(0.97), '#fff', '800 14px');
        P.txt(c, '면진 받침', X(0.7) + bw * 0.62, by - 2, '#1d2433', '800 11px', 'left');
        // 진동 세기 계기
        const mx = X(0.43), mw = W * 0.14, my = Y(MAP) + 18;
        c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.roundRect(mx - 8, my - 14, mw + 16, 36, 8); c.fill();
        P.txt(c, '진동 세기', mx, my, '#1d2433', '800 12px', 'left');
        c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(mx, my + 6, mw, 8); const mg = c.createLinearGradient(mx, 0, mx + mw, 0); mg.addColorStop(0, '#f3c64a'); mg.addColorStop(1, '#d63a26'); c.fillStyle = mg; c.fillRect(mx, my + 6, mw * amp, 8);
        if (!drag && shookT < 0.3) { const p = 0.5 + 0.5 * Math.sin(t * 4); P.txt(c, '← 땅을 좌우로 문지르기 →', X(0.5), Y(0.93), `rgba(255,255,255,${0.6 + 0.4 * p})`, '800 14px'); }
        uiT += dt; if (uiT > 0.2 || !dt) { uiT = 0; steps(); }
      },
      down(p) {
        if (p.y < Y(MAP)) {
          if (Math.hypot(p.x - X(EPI[0]), p.y - Y(EPI[1])) < 34) { startQuake(); return; }
          if (Math.abs(p.x - X(train)) < 52 && Math.abs(p.y - Y(TRACK)) < 26) { drag = { k: 'train', x0: p.x, u0: train }; return; }
          return;
        }
        drag = { k: 'g' }; lastX = p.x; lastT = performance.now();
      },
      move(p, e, held) {
        if (!held || !drag) return;
        if (drag.k === 'train') { if (!braking && !hitS) train = Math.max(T0 + 0.02, Math.min(T1 - 0.02, drag.u0 + (p.x - drag.x0) / S.W)); return; }
        const nowT = performance.now(), dtm = Math.max(8, nowT - lastT), v = Math.abs(p.x - lastX) / dtm * 1000; // px/초
        const target = Math.min(1, v / (S.W * 1.4));
        amp += (target - amp) * (target > amp ? 0.35 : 0.08); lastX = p.x; lastT = nowT;
      },
      up(p) {
        if (drag && drag.k === 'train') { const u = train; drag = null; if (u > Z0 && u < Z1) stopTrain(); else if (warned && !hitS) say('멈춤 구역 안에 열차를 놓아야 선다.'); return; }
        drag = null;
      },
      key(e) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { amp = Math.min(1, amp + 0.22); return true; }
        if (e.key === 'Enter' || e.key === 'e' || e.key === 'E') { startQuake(); return true; }
        if (e.key === 's' || e.key === 'S') { stopTrain(); return true; }
        if (e.key === '0') { reset(); steps(); return true; } return false;
      },
    });
    root.querySelector('.sh-reset').addEventListener('click', () => { reset(); steps(); S.kick(); });
    steps();
    const go = (sec, hold) => { for (let k = 0; k < sec * 30; k++) { if (hold != null) amp = hold; step(1 / 30); } steps(); S.kick(); };
    root._sh = {
      shake: (sec, a) => { go(sec, Math.max(0, Math.min(1, a == null ? 0.8 : a))); return root._sh.state(); },
      warn: () => { startQuake(); let n = 0; while (!warned && n++ < 600) step(1 / 30); stopTrain(); n = 0; while (!hitS && n++ < 900) step(1 / 30); steps(); S.kick(); return root._sh.state(); },
      state: () => ({ amp: +amp.toFixed(2), crack: +crack.toFixed(2), fell, shook: +shookT.toFixed(1), quake, warned, train: +train.toFixed(3), stopped, hitS, saved }),
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Shake = { mount };
})();
