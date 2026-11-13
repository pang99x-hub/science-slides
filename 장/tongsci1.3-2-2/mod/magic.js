/* 3-2 3차시 체험 «관성 마술»(참고서 170쪽 관성에 의한 현상 표).
   위쪽 실험대 그림 셋을 눌러 고른다. (가) 컵 위 카드와 동전: 카드를 끌어 튕긴다 — 빠르면 카드만 날아가고 동전은 컵 속, 느리면 동전이 카드에 실려 간다.
   (나) 두루마리 휴지: 늘어진 끝을 아래로 끈다 — 빠르면 절취선에서 끊어지고 느리면 두루마리가 따라 돌며 풀린다.
   (다) 깔개 털기: 깔개를 위아래로 흔든다 — 깔개의 가속도가 중력 가속도보다 크면 먼지가 떨어져 나간다(느리면 먼지가 그대로 실려 있다).
   오른쪽 위 작은 자전거: 누르면 페달이 멈추고 바퀴는 계속 돈다(한 번 더 누르면 다시 밟는다).
   동전·카드의 마찰(최대 2200 px/s²), 휴지가 버티는 늘어남(34 px), 깔개의 g(2000 px/s²)는 화면용 값.
   Magic.mount(root) → { fit, setActive } · 시험용: root._mg.pick(0~2) · auto('fast'|'slow') · bike() · state() · geo() */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const G = 2400, CMAX = 2200;            // 떨어지는 가속도 · 카드가 동전을 끌 수 있는 최대 가속도
  const PAR = 2500, PFR = 900, PTEAR = 34, SH = 92; // 휴지: 두루마리가 따라 도는 최대 가속도 · 굴대 마찰 · 버티는 늘어남 · 한 칸 길이
  const RG = 2000, RW = 16;               // 깔개: 중력 가속도 · 깔개가 손을 따라가는 빠르기
  // 자체 확인: 카드를 1200 px/s로 휙 빼면 동전은 30 px 안쪽만 끌려가고, 300 px/s로 끌면 동전이 따라붙는다
  (function () {
    const slip = (v) => { let k = 0, c = 0, cv = 0; const dt = 1 / 240; for (let i = 0; i < 2400 && k - c < 160; i++) { k += v * dt; cv += clamp(v - cv, -CMAX * dt, CMAX * dt); c += cv * dt; } return { c, off: k - c >= 160 }; };
    const f = slip(1200), s = slip(300);
    console.assert(f.off && f.c < 30 && !s.off, 'magic: 동전 마찰');
  })();
  const NAMES = ['(가) 동전과 컵', '(나) 두루마리 휴지', '(다) 깔개 털기'];
  const WHO = ['동전', '두루마리', '먼지'];

  function mount(root) {
    const stage = root.querySelector('.mg-stage'), now = root.querySelector('.mg-now'), out = root.querySelector('.mg-out');
    const P = window.Play;
    let sc, ok, msg, t, mode, prev, auto, peak, peakT, banner, bike, tries;
    let card, coin, paper, piece, rug, dust, gone, lastNow = 0;

    function reset() {
      sc = 0; ok = new Set(); msg = ''; t = 0; mode = null; prev = null; auto = null; peak = 0; peakT = 0; banner = null; tries = [0, 0, 0];
      bike = { on: true, crank: 0, wheel: 0, w: 7, note: 0 };
      setup(0); setup(1); setup(2);
      say('위쪽 <b>실험대 그림</b>을 눌러 고른다. 먼저 (가) — 컵 위 <b>카드</b>를 잡고 옆으로 <b>휙</b> 튕기듯 끌었다 놓아 보자');
      steps();
    }
    function setup(i) {
      if (i === 0) { card = { x: 0, y: 0, vx: 0, vy: 0, fall: false, land: false, ang: 0 }; coin = { dx: 0, vx: 0, st: 'card', x: 0, y: 0, vy: 0, done: false }; }
      if (i === 1) { paper = { L: 150, u: 0, pe: SH * 2 - 150, vr: 0, hand: null, torn: 0, maxS: 0 }; piece = null; }
      if (i === 2) {
        rug = { Y: 0, V: 0, tgt: 0, grabY: 0, Y0: 0, prevRy: null };
        let sd = 7; const rnd = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
        dust = Array.from({ length: 46 }, () => ({ f: 0.06 + rnd() * 0.88, r: 2 + rnd() * 3.6, col: rnd() < 0.5 ? '#7a6248' : rnd() < 0.5 ? '#9a9389' : '#5b4a3a', y: 0, vy: 0, vx: 0, on: true, gone: false, a: 1, x: 0 }));
        gone = 0;
      }
      if (i === sc) banner = null;
    }
    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };

    // ── 자리 ──
    const L = () => {
      const W = S.W, H = S.H, TW = Math.min(196, (W - 380) / 3), TH = 112;
      return {
        W, H, TW, TH, tabs: [0, 1, 2].map((i) => ({ x: 16 + i * (TW + 12), y: 12, w: TW, h: TH })),
        bk: { x: W - 332, y: 12, w: 316, h: 140 }, top: 140,
        cupX: W * 0.42, tableY: H - 96, cupH: 196,
        rollX: W * 0.42, rollY: 252, rollW: 230,
        rx0: W * 0.16, rx1: W * 0.76, rugY: H * 0.6,
        gauge: { x: W - 290, y: 204, w: 260 },
      };
    };
    const cardBox = (l) => ({ x: l.cupX + card.x, y: l.tableY - l.cupH - 7 + card.y, w: 330, h: 7 });

    // ── 그림 조각 ──
    function bgRoom(c, l, i) {
      const { W, H } = l;
      if (i === 0) {
        const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#efe6d4'); g.addColorStop(1, '#d9cbb0'); c.fillStyle = g; c.fillRect(0, 0, W, H);
        const tg = c.createLinearGradient(0, l.tableY, 0, H); tg.addColorStop(0, '#a8703f'); tg.addColorStop(0.12, '#8a5629'); tg.addColorStop(1, '#5e3817');
        c.fillStyle = tg; c.fillRect(0, l.tableY, W, H - l.tableY);
        c.strokeStyle = 'rgba(60,30,10,.35)'; c.lineWidth = 1.5; for (let k = 0; k < 7; k++) { c.beginPath(); c.moveTo(0, l.tableY + 16 + k * 11); c.bezierCurveTo(W * 0.3, l.tableY + 10 + k * 12, W * 0.6, l.tableY + 22 + k * 10, W, l.tableY + 14 + k * 11); c.stroke(); }
        c.fillStyle = 'rgba(255,240,210,.5)'; c.fillRect(0, l.tableY, W, 3);
      } else if (i === 1) {
        c.fillStyle = '#e4ecef'; c.fillRect(0, 0, W, H);
        c.strokeStyle = '#c3d0d6'; c.lineWidth = 2; for (let x = 0; x < W; x += 64) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = 0; y < H; y += 64) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
        const g = c.createLinearGradient(0, H - 70, 0, H); g.addColorStop(0, '#9aa8ae'); g.addColorStop(1, '#6f7c82'); c.fillStyle = g; c.fillRect(0, H - 60, W, 60);
      } else {
        const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#9fd0f2'); g.addColorStop(0.7, '#dcefd9'); g.addColorStop(1, '#9cc58a'); c.fillStyle = g; c.fillRect(0, 0, W, H);
        c.fillStyle = 'rgba(255,255,255,.75)'; [[0.62, 0.36, 60], [0.7, 0.34, 44], [0.2, 0.42, 50]].forEach(([x, y, r]) => { c.beginPath(); c.ellipse(W * x, H * y, r * 1.8, r * 0.7, 0, 0, TAU); c.fill(); });
        c.fillStyle = '#7fae6a'; c.fillRect(0, H - 50, W, 50);
      }
    }
    function cup(c, x, yb, h, front) {
      const tw = 66, bw = 54;
      if (!front) {
        c.fillStyle = 'rgba(60,40,20,.22)'; c.beginPath(); c.ellipse(x + 10, yb + 2, bw + 22, 10, 0, 0, TAU); c.fill();
        const g = c.createLinearGradient(x - tw, 0, x + tw, 0); g.addColorStop(0, 'rgba(170,210,230,.55)'); g.addColorStop(0.25, 'rgba(235,248,255,.25)'); g.addColorStop(0.7, 'rgba(190,225,240,.25)'); g.addColorStop(1, 'rgba(140,185,210,.6)');
        c.fillStyle = g; c.beginPath(); c.moveTo(x - tw, yb - h); c.lineTo(x - bw, yb); c.lineTo(x + bw, yb); c.lineTo(x + tw, yb - h); c.closePath(); c.fill();
        c.fillStyle = 'rgba(120,160,180,.35)'; c.beginPath(); c.ellipse(x, yb - 8, bw - 2, 7, 0, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(80,120,140,.5)'; c.lineWidth = 2; c.beginPath(); c.ellipse(x, yb - h, tw, 9, 0, Math.PI, TAU); c.stroke();
        return;
      }
      c.strokeStyle = 'rgba(60,100,125,.85)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - tw, yb - h); c.lineTo(x - bw, yb); c.moveTo(x + tw, yb - h); c.lineTo(x + bw, yb); c.stroke();
      c.beginPath(); c.ellipse(x, yb, bw, 7, 0, 0, Math.PI); c.stroke(); c.beginPath(); c.ellipse(x, yb - h, tw, 9, 0, 0, Math.PI); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.moveTo(x - tw + 12, yb - h + 14); c.lineTo(x - bw + 10, yb - 16); c.lineTo(x - bw + 18, yb - 16); c.lineTo(x - tw + 22, yb - h + 14); c.closePath(); c.fill();
    }
    function coinAt(c, x, y, a = 0) {
      c.save(); c.translate(x, y); c.rotate(a);
      c.fillStyle = '#8c6a1c'; c.beginPath(); c.ellipse(0, 0, 24, 7, 0, 0, Math.PI); c.lineTo(-24, -5); c.ellipse(0, -5, 24, 7, 0, Math.PI, 0, true); c.closePath(); c.fill();
      const g = c.createLinearGradient(-24, 0, 24, 0); g.addColorStop(0, '#f6dc7a'); g.addColorStop(0.5, '#d9a93a'); g.addColorStop(1, '#a87a1c');
      c.fillStyle = g; c.strokeStyle = '#6b4c10'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(0, -5, 24, 7, 0, 0, TAU); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(255,240,180,.8)'; c.beginPath(); c.ellipse(0, -5, 15, 4, 0, 0, TAU); c.stroke();
      c.restore();
    }
    function cardAt(c, x, y, a) {
      c.save(); c.translate(x, y); c.rotate(a);
      c.fillStyle = 'rgba(0,0,0,.15)'; c.fillRect(-163, 6, 330, 4);
      c.fillStyle = '#fbfbf7'; c.strokeStyle = '#2b3a5c'; c.lineWidth = 2; c.beginPath(); c.roundRect(-165, -1, 330, 8, 2); c.fill(); c.stroke();
      c.fillStyle = '#c0392b'; c.fillRect(-150, 1, 300, 3);
      c.restore();
    }
    function hand(c, x, y, a, s = 1, pinch = true) {
      c.save(); c.translate(x, y); c.rotate(a); c.scale(s, s);
      const sk = c.createRadialGradient(-6, -8, 4, 0, 0, 34); sk.addColorStop(0, '#ffe0bd'); sk.addColorStop(1, '#d59c6c');
      c.fillStyle = '#3d6fb8'; c.strokeStyle = '#1d3560'; c.lineWidth = 2; c.beginPath(); c.roundRect(-20, 26, 40, 60, 8); c.fill(); c.stroke();
      c.fillStyle = sk; c.strokeStyle = '#7a4e2c'; c.lineWidth = 2;
      c.beginPath(); c.ellipse(0, 10, 26, 24, 0, 0, TAU); c.fill(); c.stroke();
      c.beginPath(); c.ellipse(pinch ? -14 : -22, -10, 8, 15, pinch ? 0.4 : 0.9, 0, TAU); c.fill(); c.stroke();
      c.beginPath(); c.ellipse(8, -12, 9, 14, -0.2, 0, TAU); c.fill(); c.stroke();
      c.restore();
    }
    function chip(c, x, y, s, bg, fg, f = '800 21px') {
      c.font = `${f} "IBM Plex Sans KR", sans-serif`; const tw = c.measureText(s).width;
      c.fillStyle = bg; c.strokeStyle = fg; c.lineWidth = 2.5; c.beginPath(); c.roundRect(x - tw / 2 - 12, y - 19, tw + 24, 38, 19); c.fill(); c.stroke();
      P.txt(c, s, x, y + 8, fg, f);
    }

    // ── 위쪽 표지(실험대 그림) ──
    function tabs(c, l) {
      l.tabs.forEach((b, i) => {
        const on = i === sc;
        c.save(); c.fillStyle = on ? '#fff6c8' : 'rgba(255,255,255,.88)'; c.strokeStyle = on ? '#1d2433' : 'rgba(29,36,51,.45)'; c.lineWidth = on ? 4 : 2;
        c.beginPath(); c.roundRect(b.x, b.y, b.w, b.h, 12); c.fill(); c.stroke(); c.clip();
        const mx = b.x + b.w / 2, my = b.y + 50;
        if (i === 0) {
          c.fillStyle = '#9a6332'; c.fillRect(b.x, my + 26, b.w, 20);
          c.save(); c.translate(mx, my + 26); c.scale(0.32, 0.32); cup(c, 0, 0, 196, false); cup(c, 0, 0, 196, true); c.restore();
          c.save(); c.translate(mx + (on ? Math.sin(t * 2) * 6 : 0), my - 38); c.scale(0.32, 0.32); cardAt(c, 0, 0, 0); c.restore();
          c.save(); c.translate(mx, my - 38); c.scale(0.5, 0.5); coinAt(c, 0, -1); c.restore();
        } else if (i === 1) {
          c.fillStyle = '#9aa7ad'; c.fillRect(mx - 52, my - 34, 104, 6);
          const g = c.createLinearGradient(0, my - 30, 0, my + 6); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#cfd6da'); c.fillStyle = g; c.strokeStyle = '#7b878d'; c.lineWidth = 1.5;
          c.beginPath(); c.roundRect(mx - 40, my - 28, 80, 36, 8); c.fill(); c.stroke();
          c.fillStyle = '#fbfbfb'; c.fillRect(mx - 34, my + 4, 68, 30 + (on ? Math.sin(t * 2) * 3 : 0)); c.strokeRect(mx - 34, my + 4, 68, 30);
          c.setLineDash([3, 3]); c.beginPath(); c.moveTo(mx - 34, my + 22); c.lineTo(mx + 34, my + 22); c.stroke(); c.setLineDash([]);
        } else {
          const w = on ? Math.sin(t * 4) * 5 : 0;
          c.strokeStyle = '#7d2f22'; c.lineWidth = 12; c.lineCap = 'butt'; c.beginPath(); c.moveTo(mx - 60, my + 4); c.quadraticCurveTo(mx, my + 4 + w * 2, mx + 60, my + 4); c.stroke();
          c.strokeStyle = '#e2b54a'; c.lineWidth = 3; c.setLineDash([6, 5]); c.stroke(); c.setLineDash([]);
          c.fillStyle = '#6b5a48'; for (let k = 0; k < 9; k++) c.fillRect(mx - 50 + k * 12, my - 8 - (k % 3) * 6 - Math.abs(w) * (k % 2), 3, 3);
        }
        c.restore();
        P.txt(c, NAMES[i], mx, b.y + b.h - 10, '#1d2433', on ? '800 18px' : '700 17px');
        if (ok.has(i + 1)) { c.fillStyle = '#2f8a4a'; c.strokeStyle = '#fff'; c.lineWidth = 2.5; c.beginPath(); c.arc(b.x + b.w - 16, b.y + 16, 13, 0, TAU); c.fill(); c.stroke(); P.txt(c, '✓', b.x + b.w - 16, b.y + 23, '#fff', '800 18px'); }
      });
    }
    // ── 자전거 바퀴(작게) ──
    function drawBike(c, l, dt) {
      const b = l.bk; bike.wheel += bike.w * dt; if (bike.on) bike.crank += bike.w * 0.45 * dt; else bike.w = Math.max(2.5, bike.w - 0.08 * dt);
      if (bike.on && bike.w < 7) bike.w = Math.min(7, bike.w + 3 * dt);
      bike.note = Math.max(0, bike.note - dt);
      c.save(); c.fillStyle = 'rgba(255,255,255,.9)'; c.strokeStyle = 'rgba(29,36,51,.5)'; c.lineWidth = 2; c.beginPath(); c.roundRect(b.x, b.y, b.w, b.h, 12); c.fill(); c.stroke();
      const wx = b.x + 66, wy = b.y + 70, R = 52, cx = b.x + 162, cy = b.y + 82;
      // 틀
      c.strokeStyle = '#2a5d9a'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(wx, wy); c.lineTo(cx, cy); c.lineTo(cx - 6, wy - 46); c.lineTo(wx, wy); c.moveTo(cx - 6, wy - 46); c.lineTo(cx - 12, wy - 58); c.stroke();
      c.fillStyle = '#222'; c.beginPath(); c.roundRect(cx - 30, wy - 64, 36, 9, 4); c.fill();
      // 바퀴
      c.strokeStyle = '#1b1b1b'; c.lineWidth = 7; c.beginPath(); c.arc(wx, wy, R, 0, TAU); c.stroke();
      c.strokeStyle = '#c9ced6'; c.lineWidth = 2.5; c.beginPath(); c.arc(wx, wy, R - 5, 0, TAU); c.stroke();
      c.strokeStyle = '#8d96a3'; c.lineWidth = 1.2; for (let k = 0; k < 16; k++) { const a = bike.wheel + k * TAU / 16; c.beginPath(); c.moveTo(wx, wy); c.lineTo(wx + Math.cos(a) * (R - 6), wy + Math.sin(a) * (R - 6)); c.stroke(); }
      c.fillStyle = '#e8483a'; const va = bike.wheel; c.beginPath(); c.arc(wx + Math.cos(va) * (R - 12), wy + Math.sin(va) * (R - 12), 5, 0, TAU); c.fill();
      // 체인·톱니·페달
      c.strokeStyle = '#555'; c.lineWidth = 2; c.beginPath(); c.moveTo(wx, wy - 8); c.lineTo(cx, cy - 16); c.moveTo(wx, wy + 8); c.lineTo(cx, cy + 16); c.stroke();
      c.fillStyle = '#9aa1ab'; c.beginPath(); c.arc(cx, cy, 16, 0, TAU); c.fill(); c.fillStyle = '#666'; c.beginPath(); c.arc(wx, wy, 8, 0, TAU); c.fill();
      const ca = bike.crank, px = cx + Math.cos(ca) * 26, py = cy + Math.sin(ca) * 26;
      c.strokeStyle = '#333'; c.lineWidth = 5; c.beginPath(); c.moveTo(cx, cy); c.lineTo(px, py); c.stroke();
      c.fillStyle = bike.on ? '#333' : '#e8483a'; c.fillRect(px - 9, py - 3, 18, 6);
      P.txt(c, '자전거 바퀴', b.x + 258, b.y + 30, '#1d2433', '800 17px');
      P.txt(c, bike.on ? '페달 밟는 중' : '페달 멈춤', b.x + 258, b.y + 58, bike.on ? '#2a5d9a' : '#c0321f', '800 16px');
      P.txt(c, bike.on ? '누르면 멈춤' : '바퀴는 돈다', b.x + 258, b.y + 84, '#1d2433', '700 15px');
      if (!bike.on) P.txt(c, '다시 누르면 밟기', b.x + 258, b.y + 106, '#5c6476', '600 13px');
      c.restore();
    }
    // ── 빠르기 눈금 ──
    function gauge(c, l, dt) {
      if (peakT > 0) peakT -= dt; else peak = Math.max(0, peak - dt * 0.6);
      const g = l.gauge, v = clamp(peak, 0, 2), x = g.x, y = g.y, w = g.w;
      const lab = sc === 0 ? '카드를 빼는 빠르기' : sc === 1 ? '휴지를 당기는 빠르기' : '깔개를 흔드는 세기';
      c.save(); c.fillStyle = 'rgba(255,255,255,.88)'; c.strokeStyle = 'rgba(29,36,51,.5)'; c.lineWidth = 2; c.beginPath(); c.roundRect(x - 10, y - 30, w + 20, 76, 10); c.fill(); c.stroke();
      P.txt(c, lab, x + w / 2, y - 8, '#1d2433', '800 17px');
      c.fillStyle = '#d7e6f5'; c.fillRect(x, y + 4, w / 2, 16); c.fillStyle = '#ffd6c8'; c.fillRect(x + w / 2, y + 4, w / 2, 16);
      c.fillStyle = v < 1 ? '#2a73b8' : '#d9483b'; c.fillRect(x, y + 4, w * v / 2, 16);
      c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; c.strokeRect(x, y + 4, w, 16); c.setLineDash([4, 3]); c.beginPath(); c.moveTo(x + w / 2, y); c.lineTo(x + w / 2, y + 24); c.stroke(); c.setLineDash([]);
      P.txt(c, '느림', x + w / 4, y + 39, '#2a73b8', '700 14px'); P.txt(c, '빠름', x + w * 0.75, y + 39, '#d9483b', '700 14px');
      c.restore();
    }
    const feel = (r) => { peak = Math.max(peak, r); peakT = 1.6; };

    // ── (가) 동전과 컵 ──
    function stepCoin(l, dt) {
      const prevX = card.px ?? card.x; // 손이 move에서 옮긴 것까지 지난 장면과 견준다
      const held = mode === 'card';
      if (!held) {
        if (auto && sc === 0) { card.x += auto.v * dt; auto.t -= dt; if (auto.t <= 0) { card.vx = auto.v; auto = null; } }
        else if (card.land) { card.vx *= Math.exp(-4 * dt); card.x += card.vx * dt; }
        else { if (!card.fall) { const d = 900 * dt; card.vx = Math.abs(card.vx) <= d ? 0 : card.vx - Math.sign(card.vx) * d; } card.x += card.vx * dt; }
      }
      if (card.fall && !card.land) { card.vy += G * dt; card.y += card.vy * dt; card.ang += card.vx * 0.00006; if (card.y >= l.cupH - 2) { card.y = l.cupH - 2; card.land = true; card.vx *= 0.3; card.ang = 0; } }
      const kv = dt ? (card.x - prevX) / dt : 0; card.px = card.x;
      if (mode === 'card' || auto) card.vx = kv;
      if (!card.fall && Math.abs(card.x) > 66) { card.fall = true; card.vy = 0; }
      if (Math.abs(kv) > 20 && coin.st === 'card') feel(Math.abs(kv) / 820);
      // 동전
      if (coin.st === 'card') {
        coin.vx += clamp(kv - coin.vx, -CMAX * dt, CMAX * dt); coin.x += coin.vx * dt;
        if (Math.abs(coin.x - card.x) > 165) { coin.st = 'fall'; coin.vy = card.fall ? card.vy : 0; coin.y = card.y; }
        else coin.y = card.y;
        if (card.land && !held && !auto && Math.abs(card.vx) < 5 && !coin.done) result('carried');
      } else if (coin.st === 'fall') {
        coin.vy += G * dt; coin.y += coin.vy * dt; coin.x += coin.vx * dt * 0.6; coin.vx *= Math.exp(-2 * dt);
        const ins = Math.abs(coin.x) < 62 - 14;
        if (ins && coin.y > 4) { coin.x = clamp(coin.x, -40, 40); if (coin.y >= l.cupH - 14) { coin.y = l.cupH - 14; coin.st = 'cup'; result('cup'); } }
        else if (!ins && coin.y > 4 && Math.abs(coin.x) < 72) { coin.x = Math.sign(coin.x || 1) * 74; coin.vx = Math.sign(coin.x) * 60; }
        if (!ins && coin.y >= l.cupH - 2) { coin.y = l.cupH - 2; coin.st = 'table'; result('table'); }
      }
    }
    function drawCoin(c, l) {
      const base = l.tableY - l.cupH, b = cardBox(l);
      cup(c, l.cupX, l.tableY, l.cupH, false);
      if (coin.st === 'cup' || (coin.st === 'fall' && Math.abs(coin.x) < 62 && coin.y > 4)) coinAt(c, l.cupX + coin.x, base + coin.y - 2);
      cup(c, l.cupX, l.tableY, l.cupH, true);
      cardAt(c, b.x, b.y, card.ang);
      if (coin.st === 'card' || coin.st === 'table' || (coin.st === 'fall' && !(Math.abs(coin.x) < 62 && coin.y > 4))) coinAt(c, l.cupX + coin.x, base + coin.y - (coin.st === 'card' ? 15 : 9));
      // 손가락(잡았을 때)
      if (mode === 'card') hand(c, b.x + (prev && prev.side > 0 ? 175 : -175), b.y + 20, prev && prev.side > 0 ? 1.4 : -1.4, 0.9);
      else if (coin.st === 'card' && !card.fall && Math.abs(card.vx) < 1) {
        const k = 0.5 + 0.5 * Math.sin(t * 4); c.strokeStyle = `rgba(217,72,59,${0.4 + k * 0.5})`; c.lineWidth = 3; c.setLineDash([8, 6]);
        c.beginPath(); c.moveTo(b.x + 180, b.y + 3); c.lineTo(b.x + 250 + k * 20, b.y + 3); c.stroke(); c.setLineDash([]);
        c.fillStyle = `rgba(217,72,59,${0.4 + k * 0.5})`; c.beginPath(); c.moveTo(b.x + 276 + k * 20, b.y + 3); c.lineTo(b.x + 258 + k * 20, b.y - 7); c.lineTo(b.x + 258 + k * 20, b.y + 13); c.closePath(); c.fill();
      }
    }

    // ── (나) 두루마리 휴지 ──
    const rollR = () => Math.max(46, Math.sqrt(78 * 78 - paper.u * 3));
    function stepPaper(l, dt) {
      const yb = l.rollY + rollR(), maxL = l.H - 76 - yb;
      if (auto && sc === 1) { paper.hand = (paper.hand == null ? yb + paper.L : paper.hand) + auto.v * dt; auto.t -= dt; if (auto.t <= 0) { auto = null; paper.hand = null; } }
      const held = paper.hand != null && !piece?.inHand;
      let s = 0;
      if (held) {
        paper.hand = clamp(paper.hand, yb + 20, l.H - 60);
        s = paper.hand - yb - paper.L;
        if (s > 0) paper.vr += PAR * dt; else paper.vr = Math.max(0, paper.vr - PFR * dt);
        if (s > PTEAR) tear(l, yb);
      } else paper.vr = Math.max(0, paper.vr - PFR * dt);
      const d = Math.min(paper.vr * dt, Math.max(0, maxL - paper.L)); paper.L += d; paper.u += d; if (paper.L >= maxL) paper.vr = 0;
      paper.s = s; if (held && s > 2) feel(Math.sqrt(2 * PAR * Math.max(0, s)) / Math.sqrt(2 * PAR * PTEAR));
      if (held && paper.u > SH * 1.6 && !paper.torn && !paper.slowSaid) { paper.slowSaid = true; say('천천히 당기니 <b>두루마리가 따라 돌며</b> 풀린다. 끊어지지 않는다. 이번에는 끝을 잡고 아래로 <b>휙</b> 잡아당겨 보자'); }
      if (piece) { if (piece.inHand && paper.hand == null) piece.inHand = false; if (!piece.inHand) { piece.vy += G * 0.4 * dt; piece.y += piece.vy * dt; piece.a += dt * 1.5; if (piece.y > l.H + 300) piece = null; } }
    }
    function tear(l, yb) {
      const end = paper.pe + paper.L;
      let p = Math.floor((end - 10) / SH) * SH; if (p <= paper.pe + 8) p = end - 4;
      const len = p - paper.pe;
      piece = { y: yb + (end - p), len, vy: 0, a: 0, inHand: true };
      paper.L = end - p; paper.pe = p; paper.vr *= 0.2; paper.torn++;
      ok.add(2); steps(); tries[1]++;
      banner = { s: '휙! 절취선에서 끊어졌다', t: 2.4, col: '#d9483b' };
      say(`휴지를 <b>빠르게</b> 잡아당기자 두루마리가 미처 따라 돌지 못하고 <b>절취선에서 끊어졌다</b>. 정지해 있던 <b>${WHO[1]}</b>는 하던 대로 가만히 머물려 하고(관성), 얇은 종이는 그 버팀을 견디지 못한다. 천천히 당기면 두루마리가 같이 돌며 풀린다.`);
    }
    function drawPaper(c, l) {
      const R = rollR(), x = l.rollX, y = l.rollY, w = l.rollW, yb = y + R, endY = yb + paper.L, ang = paper.u / R;
      // 걸이
      c.fillStyle = '#b8c2c7'; c.strokeStyle = '#6a777d'; c.lineWidth = 2;
      [-1, 1].forEach((sd) => { c.beginPath(); c.roundRect(x + sd * (w / 2 + 14) - 9, y - 96, 18, 104, 6); c.fill(); c.stroke(); });
      c.beginPath(); c.roundRect(x - w / 2 - 30, y - 104, w + 60, 18, 6); c.fill(); c.stroke();
      // 두루마리
      const g = c.createLinearGradient(0, y - R, 0, y + R); g.addColorStop(0, '#ffffff'); g.addColorStop(0.55, '#eef1f2'); g.addColorStop(1, '#bfc8cc');
      c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.roundRect(x - w / 2 + 8, y - R + 10, w, 2 * R, R * 0.4); c.fill();
      c.fillStyle = g; c.strokeStyle = '#8f9ca2'; c.lineWidth = 2; c.beginPath(); c.roundRect(x - w / 2, y - R, w, 2 * R, R * 0.35); c.fill(); c.stroke();
      // 도는 무늬(누빔 점)
      c.save(); c.beginPath(); c.roundRect(x - w / 2, y - R, w, 2 * R, R * 0.35); c.clip();
      for (let k = 0; k < 10; k++) { const a = ang + k * TAU / 10, cy = y - Math.cos(a) * R * 0.92, vis = Math.sin(a) > -0.2; if (!vis) continue; c.fillStyle = `rgba(150,165,172,${0.25 + 0.4 * Math.max(0, Math.sin(a))})`; for (let j = 0; j < 7; j++) { c.beginPath(); c.ellipse(x - w / 2 + 22 + j * 31, cy, 5, 2.5 * Math.max(0.2, Math.sin(a)), 0, 0, TAU); c.fill(); } }
      c.restore();
      [-1, 1].forEach((sd) => { c.fillStyle = '#dfe5e8'; c.strokeStyle = '#8f9ca2'; c.beginPath(); c.ellipse(x + sd * w / 2, y, 10, R, 0, 0, TAU); c.fill(); c.stroke(); c.fillStyle = '#b48a5a'; c.beginPath(); c.ellipse(x + sd * w / 2, y, 5, 22, 0, 0, TAU); c.fill(); });
      // 늘어진 종이
      const pw = w - 30, slack = paper.hand != null && !piece?.inHand && paper.s < -6;
      c.fillStyle = '#fdfdfb'; c.strokeStyle = '#a3afb4'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(x - pw / 2, y + R * 0.3); c.lineTo(x + pw / 2, y + R * 0.3); c.lineTo(x + pw / 2, endY);
      if (slack) c.quadraticCurveTo(x, endY - paper.s * 0.6, x - pw / 2, endY); else c.lineTo(x - pw / 2, endY);
      c.closePath(); c.fill(); c.stroke();
      if (paper.s > 4) { c.strokeStyle = `rgba(217,72,59,${clamp(paper.s / PTEAR, 0, 1)})`; c.lineWidth = 3; c.beginPath(); c.moveTo(x - pw / 2, y + R * 0.3); c.lineTo(x - pw / 2, endY); c.moveTo(x + pw / 2, y + R * 0.3); c.lineTo(x + pw / 2, endY); c.stroke(); }
      c.fillStyle = 'rgba(170,180,186,.45)'; for (let yy = yb + 10; yy < endY - 6; yy += 14) for (let j = 0; j < 6; j++) { c.beginPath(); c.arc(x - pw / 2 + 18 + j * (pw - 36) / 5 + ((yy / 14) % 2) * 8, yy, 1.8, 0, TAU); c.fill(); }
      c.strokeStyle = '#8b989e'; c.lineWidth = 2; c.setLineDash([5, 5]);
      for (let n = Math.ceil(paper.pe / SH); n * SH < paper.pe + paper.L; n++) { const yy = endY - (n * SH - paper.pe); if (yy > yb + 2 && yy < endY - 2) { c.beginPath(); c.moveTo(x - pw / 2, yy); c.lineTo(x + pw / 2, yy); c.stroke(); } }
      c.setLineDash([]);
      // 끊어진 조각
      if (piece) {
        const py = piece.inHand ? (paper.hand ?? piece.y + piece.len) - piece.len : piece.y;
        c.save(); c.translate(x, py + piece.len / 2); c.rotate(piece.inHand ? 0.05 : piece.a * 0.3); c.fillStyle = '#fdfdfb'; c.strokeStyle = '#a3afb4';
        c.beginPath(); c.moveTo(-pw / 2, -piece.len / 2); for (let k = 0; k <= 12; k++) c.lineTo(-pw / 2 + k * pw / 12, -piece.len / 2 + (k % 2) * 4); c.lineTo(pw / 2, piece.len / 2); c.lineTo(-pw / 2, piece.len / 2); c.closePath(); c.fill(); c.stroke(); c.restore();
      }
      const hy = paper.hand != null ? paper.hand : null;
      if (hy != null) hand(c, x + 10, hy + 26, 0, 1.1);
      else { const k = 0.5 + 0.5 * Math.sin(t * 4); c.fillStyle = `rgba(217,72,59,${0.45 + k * 0.5})`; c.beginPath(); c.moveTo(x, endY + 30 + k * 16); c.lineTo(x - 14, endY + 12 + k * 16); c.lineTo(x + 14, endY + 12 + k * 16); c.closePath(); c.fill(); P.txt(c, '끝을 잡고 아래로', x, endY + 64 + k * 6, '#c0321f', '800 18px'); }
      if (paper.vr > 30) P.txt(c, '두루마리가 따라 돈다', x + w / 2 + 120, y + 8, '#2a73b8', '800 18px');
    }

    // ── (다) 깔개 털기 ──
    const rugAt = (l, f) => l.rugY + rug.Y - rug.V * 0.025 * Math.sin(Math.PI * f);
    function stepRug(l, dt) {
      if (!dt) return;
      if (auto && sc === 2) { auto.t -= dt; rug.tgt = Math.sin((auto.T - auto.t) * TAU * auto.hz) * auto.amp; if (auto.t <= 0) { rug.tgt = 0; auto = null; } }
      const a = RW * RW * (rug.tgt - rug.Y) - 2 * RW * rug.V; rug.V += a * dt; rug.Y += rug.V * dt;
      if (Math.abs(a) > 300) feel(Math.abs(a) / RG);
      const w = l.rx1 - l.rx0;
      dust.forEach((p) => {
        p.x = l.rx0 + p.f * w;
        const ry = rugAt(l, p.f) - 11;
        if (p.gone) { p.vy += RG * 0.12 * dt; p.vy *= Math.exp(-1.5 * dt); p.y += p.vy * dt; p.dx = (p.dx || 0) + p.vx * dt; p.a = Math.max(0, p.a - dt * 0.45); return; }
        if (p.y === 0 && p.vy === 0 && p.on) p.y = ry;
        if (p.on) {
          const pr = p.py != null ? p.py : ry, rv = (ry - pr) / dt, fv = p.vy + RG * dt;
          if (rv > fv + 1) { p.on = false; p.vy = fv; p.y += fv * dt; } else { p.y = ry; p.vy = rv; }
        } else {
          p.vy += RG * dt; p.y += p.vy * dt;
          if (ry - p.y > 18) { p.gone = true; gone++; p.vx = (p.f < 0.5 ? -1 : 1) * (40 + 90 * ((p.f * 97) % 1)); p.vy *= 0.3; }
          else if (p.y >= ry) { p.on = true; p.y = ry; p.vy = 0; }
        }
        p.py = ry;
      });
      if (gone >= dust.length * 0.7 && !ok.has(3)) {
        ok.add(3); steps(); banner = { s: '먼지가 떨어져 나갔다', t: 2.4, col: '#d9483b' };
        say(`깔개를 <b>빠르게</b> 흔들면 깔개만 움직이고 정지해 있던 <b>${WHO[2]}</b>는 그 자리에 머물려 한다(관성). 깔개가 갑자기 내려가면 먼지가 따라 내려오지 못하고, 갑자기 멈추면 먼지는 하던 대로 계속 올라가 깔개에서 떨어진다.`);
      }
    }
    function drawRug(c, l) {
      const N = 40, pts = []; for (let k = 0; k <= N; k++) { const f = k / N; pts.push({ x: l.rx0 + f * (l.rx1 - l.rx0), y: rugAt(l, f) }); }
      // 그림자
      c.fillStyle = 'rgba(40,60,30,.18)'; c.beginPath(); c.ellipse((l.rx0 + l.rx1) / 2, l.H - 40, (l.rx1 - l.rx0) / 2, 10, 0, 0, TAU); c.fill();
      // 깔개 몸
      const thick = 22; c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p.x, p.y - thick / 2) : c.moveTo(p.x, p.y - thick / 2))); for (let i = N; i >= 0; i--) c.lineTo(pts[i].x, pts[i].y + thick / 2); c.closePath();
      const g = c.createLinearGradient(0, l.rugY - 30, 0, l.rugY + 30); g.addColorStop(0, '#a8402e'); g.addColorStop(0.5, '#8c2f22'); g.addColorStop(1, '#5e1d15'); c.fillStyle = g; c.fill(); c.strokeStyle = '#3d120c'; c.lineWidth = 2; c.stroke();
      c.strokeStyle = '#e2b54a'; c.lineWidth = 3; c.setLineDash([10, 7]); c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p.x, p.y - 3) : c.moveTo(p.x, p.y - 3))); c.stroke(); c.setLineDash([]);
      c.strokeStyle = '#2f5c8a'; c.lineWidth = 2; c.beginPath(); pts.forEach((p, i) => (i ? c.lineTo(p.x, p.y + 6) : c.moveTo(p.x, p.y + 6))); c.stroke();
      // 술 장식
      [pts[0], pts[N]].forEach((p, i) => { c.strokeStyle = '#efe0b8'; c.lineWidth = 2; for (let k = -4; k <= 4; k++) { c.beginPath(); c.moveTo(p.x, p.y + k * 2.4); c.lineTo(p.x + (i ? 18 : -18), p.y + k * 2.4 + Math.sin(t * 6 + k) * 3); c.stroke(); } });
      // 먼지
      dust.forEach((p) => { if (p.a <= 0) return; c.globalAlpha = p.a; c.fillStyle = p.col; c.beginPath(); c.arc(p.x + (p.dx || 0), p.y - p.r * 0.6, p.r, 0, TAU); c.fill(); if (p.gone) { c.fillStyle = 'rgba(150,140,125,.25)'; c.beginPath(); c.arc(p.x + (p.dx || 0), p.y, p.r * 3, 0, TAU); c.fill(); } c.globalAlpha = 1; });
      // 손
      hand(c, pts[0].x - 8, pts[0].y + 26, -0.3, 1); hand(c, pts[N].x + 8, pts[N].y + 26, 0.3, 1);
      const left = dust.length - gone;
      chip(c, (l.rx0 + l.rx1) / 2, l.H - 92, `깔개에 남은 먼지 ${left}개 / ${dust.length}개`, 'rgba(255,255,255,.92)', '#5e1d15', '800 19px');
      if (mode !== 'rug' && !auto && !ok.has(3)) { const k = 0.5 + 0.5 * Math.sin(t * 4); c.fillStyle = `rgba(29,36,51,${0.4 + k * 0.5})`; P.txt(c, '↕ 깔개를 잡고 위아래로 흔들기', (l.rx0 + l.rx1) / 2, l.rugY - 70 - k * 6, `rgba(29,36,51,${0.5 + k * 0.5})`, '800 20px'); }
    }

    // ── 결과 풀이 ──
    function result(kind) {
      if (coin.done) return; coin.done = true; tries[0]++;
      if (kind === 'cup') {
        ok.add(1); steps(); banner = { s: '동전이 컵 속으로 쏙!', t: 2.4, col: '#2f8a4a' };
        say(`카드를 <b>빠르게</b> 튕기자 카드만 날아가고 동전은 <b>컵 속</b>으로 떨어졌다. 카드가 동전을 끌 틈이 거의 없었고, 정지해 있던 <b>${WHO[0]}</b>은 그 자리에 머물려 했기 때문(관성). 이번엔 <b>천천히</b> 끌어 보면 어떻게 될까? 그림을 누르면 다시 차린다.`);
      } else {
        banner = { s: '동전이 카드와 함께 끌려갔다', t: 2.4, col: '#2a73b8' };
        say(`<b>천천히</b> 끌면 카드와 동전 사이의 마찰이 동전을 같이 끌고 가서 ${kind === 'carried' ? '동전이 카드에 실려 간다' : '동전이 컵 밖에 떨어진다'}. 같은 실험이라도 <b>끄는 빠르기</b>에 따라 결과가 다르다. 그림을 누르면 다시 차린다 — 이번엔 <b>휙</b> 튕겨 보자.`);
      }
    }
    function steps() {
      const st = [1, 2, 3].find((q) => !ok.has(q)) || 0;
      window.L1.steps(root, st, [...ok]); window.L1.done(root, st === 0);
      const nt = sc === 0 ? '카드를 잡고 옆으로 휙 튕기기' : sc === 1 ? '휴지 끝을 잡고 아래로 당기기' : '깔개를 잡고 위아래로 흔들기';
      const txt = st === 0 ? '빠를수록 관성이 잘 드러난다' : nt;
      if (now.textContent !== txt) { now.textContent = txt; now.classList.toggle('done', st === 0); }
    }
    function pick(i) {
      if (i !== sc) { sc = i; auto = null; mode = null; banner = null; peak = 0; }
      setup(i); steps();
      say([
        '컵 위에 <b>카드</b>, 그 위에 <b>동전</b>. 카드 끝을 잡고 옆으로 <b>휙</b> 튕기듯 끌었다 놓아 보자. 천천히도 끌어 보자',
        '두루마리 휴지의 늘어진 <b>끝</b>을 잡고 아래로 당긴다. <b>천천히</b> 한 번, <b>휙</b> 빠르게 한 번',
        '먼지 앉은 <b>깔개</b>를 잡고 위아래로 흔든다. 천천히 흔들 때와 <b>빠르게</b> 흔들 때 먼지를 비교하자',
      ][i]);
    }
    function tapBike() {
      bike.on = !bike.on;
      say(bike.on ? '다시 페달을 밟는다' : '페달을 멈춰도 뒷바퀴는 <b>계속 돈다</b>. 바퀴를 돌리던 힘은 끊겼지만 바퀴는 돌던 그대로 계속 돌려 한다 — 운동하던 물체의 관성. (바퀴는 굴대의 작은 마찰로 아주 천천히 느려진다)');
    }

    // ── 매 장면 ──
    function draw(c, W, H, dt) {
      if (!W) return;
      t += dt; const l = L();
      // 조작 물리는 실제 흐른 시간으로(느린 기기에서 프레임이 늘어져도 손 빠르기를 그대로 잰다)
      const nt = performance.now(), rdt = dt ? clamp((nt - (lastNow || nt - dt * 1000)) / 1000, 0, 0.1) : 0; lastNow = nt;
      if (sc === 0) stepCoin(l, rdt); else if (sc === 1) stepPaper(l, rdt); else stepRug(l, rdt);
      bgRoom(c, l, sc);
      if (sc === 0) drawCoin(c, l); else if (sc === 1) drawPaper(c, l); else drawRug(c, l);
      tabs(c, l); drawBike(c, l, dt); gauge(c, l, dt);
      if (banner) { banner.t -= dt; if (banner.t <= 0) banner = null; else { c.globalAlpha = Math.min(1, banner.t * 2); chip(c, sc === 2 ? W / 2 - 40 : sc === 1 ? W * 0.78 : l.cupX, sc === 1 ? 300 : 192, banner.s, '#fffbe6', banner.col, '800 24px'); c.globalAlpha = 1; } }
    }
    const inBox = (p, b) => p.x >= b.x && p.x <= b.x + b.w && p.y >= b.y && p.y <= b.y + b.h;
    const S = P.make(stage, {
      draw,
      down(p) {
        const l = L(); prev = { x: p.x, y: p.y, moved: 0 }; mode = null;
        const ti = l.tabs.findIndex((b) => inBox(p, b)); if (ti >= 0) { mode = 'tab'; prev.ti = ti; return; }
        if (inBox(p, l.bk)) { mode = 'bike'; return; }
        if (sc === 0) {
          const b = cardBox(l);
          if (!card.fall && coin.st === 'card' && !coin.done && Math.abs(p.x - b.x) < 185 && Math.abs(p.y - b.y) < 40) { mode = 'card'; prev.off = p.x - card.x; prev.side = p.x < b.x ? -1 : 1; auto = null; }
          else mode = 'scene';
        } else if (sc === 1) {
          const endY = l.rollY + rollR() + paper.L;
          if (Math.abs(p.x - l.rollX) < l.rollW / 2 + 20 && p.y > endY - 70 && p.y < endY + 90 && !piece?.inHand) { mode = 'paper'; paper.hand = endY; prev.dy = p.y - endY; auto = null; }
          else mode = 'scene';
        } else if (p.x > l.rx0 - 60 && p.x < l.rx1 + 60 && Math.abs(p.y - (l.rugY + rug.Y)) < 90) { mode = 'rug'; rug.grabY = p.y; rug.Y0 = rug.tgt; auto = null; }
        else mode = 'scene';
      },
      move(p, e, held) {
        if (!held || !mode || !prev) return;
        prev.moved += Math.hypot(p.x - prev.x, p.y - prev.y); prev.x = p.x; prev.y = p.y;
        if (mode === 'card') card.x = clamp(p.x - prev.off, -S.W, S.W);
        else if (mode === 'paper') paper.hand = p.y - prev.dy;
        else if (mode === 'rug') rug.tgt = clamp(rug.Y0 + p.y - rug.grabY, -170, 150);
      },
      up() {
        if (mode === 'tab' && prev.moved < 14) pick(prev.ti);
        else if (mode === 'bike' && prev.moved < 14) tapBike();
        else if (mode === 'scene' && prev.moved < 14) {
          if ((sc === 0 && coin.done) || (sc === 1 && !piece && (paper.torn || paper.L > 260)) || (sc === 2 && gone > 0 && !auto)) pick(sc);
          else if (sc === 2) say('<b>깔개</b>를 잡고 위아래로 흔들어 보자');
        } else if (mode === 'paper') { paper.hand = null; if (piece) piece.inHand = false; }
        mode = null;
      },
      key(e) {
        const k = e.key;
        if (k === '1' || k === '2' || k === '3') { pick(+k - 1); return true; }
        if (k === 'b' || k === 'B') { tapBike(); return true; }
        if (k === ' ' || k === 'Enter' || k === 'ArrowRight' || k === 'ArrowDown') { go('fast'); return true; }
        if (k === 's' || k === 'S' || k === 'ArrowLeft') { go('slow'); return true; }
        if (k === 'r' || k === 'R') { pick(sc); return true; }
        if (k === '0') { reset(); return true; }
        return false;
      },
    });
    // 키보드·시험용 자동 조작: 빠르게 / 천천히
    function go(kind) {
      const f = kind === 'fast';
      if (sc === 0) { if (coin.done || card.fall) pick(0); auto = f ? { v: 2400, t: 0.16 } : { v: 260, t: 1.2 }; }
      else if (sc === 1) { if (piece) piece = null; paper.hand = null; auto = f ? { v: 1500, t: 0.14 } : { v: 170, t: 1.4 }; }
      else auto = f ? { amp: 90, hz: 3, t: 1.6, T: 1.6 } : { amp: 60, hz: 0.45, t: 2.2, T: 2.2 };
    }
    root.querySelector('.mg-reset').addEventListener('click', () => { reset(); S.kick(); });
    reset();
    root._mg = {
      pick: (i) => { pick(i); S.kick(); }, auto: (k) => { go(k); S.kick(); }, bike: tapBike,
      geo() { const l = L(); return { W: S.W, H: S.H, tabs: l.tabs, bk: l.bk, card: cardBox(l), endY: l.rollY + rollR() + paper.L, rollX: l.rollX, rugY: l.rugY + rug.Y, rx0: l.rx0, rx1: l.rx1 }; },
      state: () => ({ sc, ok: [...ok], coin: coin.st, coinX: Math.round(coin.x), card: Math.round(card.x), torn: paper.torn, L: Math.round(paper.L), u: Math.round(paper.u), gone, n: dust.length, bike: bike.on, done: root.classList.contains('u-done') }),
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Magic = { mount };
})();
