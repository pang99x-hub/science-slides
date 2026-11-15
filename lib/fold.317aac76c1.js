/* 2-2 2차시 체험 «사슬 접기와 변성»(교과서 82쪽 그림 Ⅱ-29 폴리펩타이드 → 단백질 + 참고서 95쪽 변성).
   구슬 18개짜리 폴리펩타이드 사슬(배열 셋 중 위 카드로 고름)을 펼쳐 둔다. 사슬 끝을 잡아 끌었다 놓으면 접히기 시작해
   배열 규칙(주황끼리 강하게, 빨강–파랑 서로 끌림)에 따라 고유한 덩어리로 자리 잡는다. 구슬 둘을 끌어 맞바꾸면 모양이 바뀐다.
   아래 «불꽃»을 꾹 누르고 있으면 사슬이 떨리다 풀려 늘어지고, 불을 꺼도 돌아오지 않는다(변성) — «처음부터»로만 복원.
   키보드: 1~3 배열 고르기, F 접기, S 구슬 둘 바꾸기, H 누르고 있기 = 불꽃, 0 처음부터.
   Fold.mount(root) → { fit, setActive } · 시험용: root._fd.fold() · swap() · heat(초) · state() */
(function () {
  'use strict';
  // h 주황(물을 싫어함) · p 하늘(물을 좋아함) · + 빨강 · - 파랑
  const SEQ = ['phhpphhpp+hhp-hhpp', 'pp+hphhhh-pphphhpp', 'hpphh+pphh-pphhpph'];
  const COL = { h: '#f2a03d', p: '#7fd1ff', '+': '#ef5b4c', '-': '#5a7cf0' };
  const pull = (a, b) => (a === 'h' && b === 'h' ? 220 : (a === '+' && b === '-') || (a === '-' && b === '+') ? 250 : 0);

  // 구슬(명암·반사광)은 색·크기별로 오프스크린에 한 번 그려 두고 찍는다
  const balls = new Map();
  function ball(c, col, x, y, r) {
    const key = col + '|' + Math.round(r * 2), R2 = Math.ceil(r * 1.3), sc = 2;
    let cv = balls.get(key);
    if (!cv) {
      cv = document.createElement('canvas'); cv.width = cv.height = R2 * 2 * sc; const g = cv.getContext('2d'); g.scale(sc, sc);
      g.fillStyle = col; g.beginPath(); g.arc(R2, R2, r, 0, Math.PI * 2); g.fill();
      const gr = g.createRadialGradient(R2 - r * 0.35, R2 - r * 0.4, r * 0.05, R2, R2, r);
      gr.addColorStop(0, 'rgba(255,255,255,.85)'); gr.addColorStop(0.25, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(0,0,0,.55)');
      g.fillStyle = gr; g.fill();
      balls.set(key, cv);
    }
    c.drawImage(cv, x - R2, y - R2, R2 * 2, R2 * 2);
  }
  function ribbon(c, pts, w, faded) { // 구슬 사이를 잇는 매끈한 관(가운데점 이차 곡선)
    if (pts.length < 2) return;
    const path = () => { c.beginPath(); c.moveTo(pts[0].x, pts[0].y); for (let i = 1; i < pts.length - 1; i++) { const m = { x: (pts[i].x + pts[i + 1].x) / 2, y: (pts[i].y + pts[i + 1].y) / 2 }; c.quadraticCurveTo(pts[i].x, pts[i].y, m.x, m.y); } const L = pts[pts.length - 1]; c.lineTo(L.x, L.y); };
    c.lineCap = 'round'; c.lineJoin = 'round';
    path(); c.strokeStyle = faded ? 'rgba(60,66,90,.8)' : '#3b4a7a'; c.lineWidth = w + 4; c.stroke();
    path(); c.strokeStyle = faded ? 'rgba(150,158,180,.6)' : '#8fa4d8'; c.lineWidth = w; c.stroke();
    path(); c.strokeStyle = faded ? 'rgba(220,226,240,.25)' : 'rgba(230,238,255,.7)'; c.lineWidth = Math.max(1, w * 0.3); c.stroke();
  }

  function mount(root) {
    const stage = root.querySelector('.fd-stage'), now = root.querySelector('.fd-now'), out = root.querySelector('.fd-out');
    const P = window.Play;
    let si = 0, lastW = 0, C = [], folded = false, dead = false, heat = 0, firing = false, drag = null, rg0 = 1, msg = '';
    const ok = new Set();
    const R = () => Math.min(S.W, S.H) * 0.032;
    const flame = () => [S.W - R() * 3.5, S.H - R() * 3.2];
    const cardX = (i) => S.W * (0.52 + i * 0.16);
    function reset(k = si) {
      si = k; folded = false; dead = false; heat = 0; firing = false;
      const W = S.W || 700, H = S.H || 460, n = SEQ[si].length, gap = W * 0.8 / (n - 1);
      C = [...SEQ[si]].map((t, i) => ({ t, x: W * 0.1 + i * gap, y: H * 0.5 + Math.sin(i * 0.9) * 6, vx: 0, vy: 0 }));
      rg0 = rg() || 1; say();
    }
    function rg() { const n = C.length; if (!n) return 0; const mx = C.reduce((s, b) => s + b.x, 0) / n, my = C.reduce((s, b) => s + b.y, 0) / n; return Math.sqrt(C.reduce((s, b) => s + (b.x - mx) ** 2 + (b.y - my) ** 2, 0) / n); }
    const compact = () => Math.max(0, Math.min(1, 1 - rg() / rg0));
    function say() {
      const pct = Math.round(compact() * 100);
      const h = dead ? `<b>변성</b> — 열로 접힌 구조가 풀렸다. 불을 꺼도 돌아오지 않는다 · 접힘 ${pct}%`
        : folded ? `접힘 <b>${pct}%</b> — 배열에 따라 정해진 모양으로 자리 잡는다. 모양이 바뀌면 하는 일도 바뀐다`
          : '펼쳐진 폴리펩타이드 — 끝을 잡아 끌었다 놓아 보자';
      if (h !== msg) { msg = h; out.innerHTML = h; }
    }
    function swapPair(i, j) { const t = C[i].t; C[i].t = C[j].t; C[j].t = t; if (folded && !dead) ok.add(2); }
    function step(dt) {
      const r = R(), L = r * 2.3, n = C.length;
      if (firing && !dead) { heat += dt; if (heat >= 1.5) { dead = true; ok.add(3); } }
      for (let s = 0; s < 3; s++) {
        const h = dt / 3;
        for (let i = 0; i < n; i++) {
          const a = C[i]; let fx = 0, fy = 0;
          for (let j = 0; j < n; j++) {
            if (j === i) continue;
            const b = C[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 0.01, ux = dx / d, uy = dy / d;
            if (Math.abs(i - j) === 1) { const f = (d - L) * 70; fx += ux * f; fy += uy * f; }
            if (d < r * 2.1) { const f = (r * 2.1 - d) * 140; fx -= ux * f; fy -= uy * f; }
            else if (folded && !dead && Math.abs(i - j) > 2 && d < r * 18) { const f = pull(a.t, b.t); fx += ux * f; fy += uy * f; }
          }
          if (dead) { // 풀린 사슬은 양 끝이 벌어져 늘어진다
            if (i === 0) fx -= 320; if (i === n - 1) fx += 320;
          }
          if (firing) { fx += (Math.random() - 0.5) * 900; fy += (Math.random() - 0.5) * 900; }
          a.vx = (a.vx + fx * h) * Math.pow(0.15, h); a.vy = (a.vy + fy * h) * Math.pow(0.15, h);
        }
        C.forEach((a) => { if (a !== drag?.b) { a.x += a.vx * h; a.y += a.vy * h; } a.x = Math.max(r, Math.min(S.W - r, a.x)); a.y = Math.max(r * 3.5, Math.min(S.H - r * 2, a.y)); });
      }
    }
    function steps() {
      const st = [1, 2, 3].find((k) => !ok.has(k)) || 0;
      window.L1.steps(root, st, [...ok]); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 사슬 끝을 잡아 끌었다 놓아 보자' : st === 2 ? '② 색이 다른 구슬 둘을 끌어 맞바꿔 보자' : st === 3 ? '③ 불꽃을 꾹 누르고 있어 보자' : '배열 → 입체 구조 → 기능, 열에 구조가 풀리면 끝';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        if (W !== lastW && !folded && !dead) { lastW = W; reset(); } // 펼친 사슬은 화면 크기에 맞춰 다시 늘어놓는다
        if (dt) step(dt);
        const r = R();
        const bg = c.createRadialGradient(W * 0.45, H * 0.4, 10, W * 0.5, H * 0.45, Math.max(W, H) * 0.8);
        bg.addColorStop(0, firing ? '#3a2238' : '#1f2b52'); bg.addColorStop(1, firing ? '#170d1c' : '#0b1124'); c.fillStyle = bg; c.fillRect(0, 0, W, H);
        SEQ.forEach((_, i) => { const x = cardX(i), on = i === si; c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.roundRect(x - 60, 17, 124, 34, 9); c.fill(); const cg = c.createLinearGradient(0, 14, 0, 48); cg.addColorStop(0, on ? '#ffe680' : '#34427a'); cg.addColorStop(1, on ? '#e8b92e' : '#212b55'); c.fillStyle = cg; c.beginPath(); c.roundRect(x - 62, 14, 124, 34, 9); c.fill(); P.txt(c, `배열 ${'가나다'[i]}`, x, 37, on ? '#1d2433' : '#fbfcf9', '800 16px'); });
        // 열 아지랑이(불꽃을 누르는 동안)
        if (firing) { c.strokeStyle = 'rgba(255,170,110,.18)'; c.lineWidth = 2; for (let k = 0; k < 7; k++) { const x0 = W * (0.15 + k * 0.11), tt = performance.now() / 600 + k; c.beginPath(); for (let yy = H - 40; yy > 60; yy -= 8) c.lineTo(x0 + Math.sin(yy / 22 + tt) * 6, yy); c.stroke(); } }
        ribbon(c, C, r * 0.55, dead);
        C.forEach((b, i) => { if (b === drag?.b) return; ball(c, COL[b.t], b.x, b.y, r); if (b.t === '+' || b.t === '-') P.txt(c, b.t === '+' ? '+' : '−', b.x, b.y + 5, '#fff', '800 15px'); if (i === 0 || i === C.length - 1) { c.strokeStyle = '#ffd84d'; c.lineWidth = 2.5; c.beginPath(); c.arc(b.x, b.y, r + 4, 0, Math.PI * 2); c.stroke(); } });
        if (drag?.b) { c.globalAlpha = 0.9; ball(c, COL[drag.b.t], drag.x, drag.y, r * 1.15); c.globalAlpha = 1; }
        // 불꽃: 버너 + 바깥 주황 · 안쪽 노랑 · 밑동 파랑
        const [fx, fy] = flame(), on = firing, fl = on ? 1 + Math.sin(performance.now() / 70) * 0.08 : 0.55;
        c.fillStyle = '#5a6278'; c.fillRect(fx - r * 0.7, fy + r * 0.9, r * 1.4, r * 1.2); c.fillStyle = '#8a93a8'; c.fillRect(fx - r * 0.9, fy + r * 0.8, r * 1.8, r * 0.3);
        const tongue = (sx, sy, col) => { c.beginPath(); c.moveTo(fx, fy - r * 2.4 * sy * fl); c.quadraticCurveTo(fx + r * 1.3 * sx, fy - r * 0.2, fx, fy + r * 0.85); c.quadraticCurveTo(fx - r * 1.3 * sx, fy - r * 0.2, fx, fy - r * 2.4 * sy * fl); c.fillStyle = col; c.fill(); };
        if (on) { P.glow(c, fx, fy - r * 0.6, r * 6, 'rgba(255,138,61,.35)'); const og = c.createLinearGradient(0, fy - r * 2.6, 0, fy + r); og.addColorStop(0, 'rgba(255,90,30,0)'); og.addColorStop(0.4, '#ff6a2a'); og.addColorStop(1, '#ffb347'); tongue(1, 1, og); tongue(0.6, 0.7, '#ffe27a'); tongue(0.35, 0.3, '#6fa8ff'); }
        else { tongue(0.8, 0.6, 'rgba(110,150,255,.55)'); }
        P.txt(c, '불꽃 — 꾹 누르기', fx, fy + r * 2.6, '#ffb27a', '700 14px');
        // 접힘 막대
        const k = compact(); c.fillStyle = '#16203f'; c.fillRect(16, H - 26, W * 0.4, 10); c.fillStyle = dead ? '#8a93a8' : '#5cc77a'; c.fillRect(16, H - 26, W * 0.4 * k, 10); P.txt(c, `접힘 ${Math.round(k * 100)}%`, 16 + W * 0.4 + 10, H - 17, '#c8d4f0', '700 13px', 'left');
        P.txt(c, '주황끼리·빨강↔파랑은 서로 끌린다', W * 0.5, H - 46, 'rgba(200,212,240,.7)', '600 13px');
        say(); steps();
      },
      down(p) {
        const r = R(), [fx, fy] = flame();
        const ci = SEQ.findIndex((_, i) => Math.abs(p.x - cardX(i)) < 62 && Math.abs(p.y - 31) < 18);
        if (ci >= 0) { reset(ci); return; }
        if (Math.hypot(p.x - fx, p.y - fy) < r * 2.6) { firing = true; return; }
        const b = C.find((q) => Math.hypot(p.x - q.x, p.y - q.y) < r * 1.4);
        if (b) drag = { b, x: p.x, y: p.y, end: b === C[0] || b === C[C.length - 1], moved: false };
      },
      move(p, e, held) { if (held && drag) { drag.x = p.x; drag.y = p.y; drag.moved = true; if (drag.end) { drag.b.x = p.x; drag.b.y = p.y; } } },
      up(p) {
        firing = false;
        if (!drag) return; const r = R(), b = drag.b;
        const j = C.findIndex((q) => q !== b && Math.hypot(p.x - q.x, p.y - q.y) < r * 1.6);
        if (j >= 0 && C[j].t !== b.t) swapPair(C.indexOf(b), j);
        else if (drag.end && drag.moved && !dead) { folded = true; ok.add(1); }
        drag = null;
      },
      key(e) {
        const k = '123'.indexOf(e.key); if (k >= 0) { reset(k); return true; }
        if (e.key === 'f' || e.key === 'F') { api.fold(); return true; }
        if (e.key === 's' || e.key === 'S') { api.swap(); return true; }
        if (e.key === 'h' || e.key === 'H') { firing = true; clearTimeout(api._t); api._t = setTimeout(() => { firing = false; }, 250); return true; }
        if (e.key === '0') { reset(); return true; }
        return false;
      },
    });
    const api = {
      fold() { if (!dead) { folded = true; ok.add(1); } S.kick(); },
      swap() { const i = C.findIndex((b) => b.t === 'h'), j = C.findIndex((b) => b.t === 'p'); if (i >= 0 && j >= 0) swapPair(i, j); S.kick(); },
      heat(sec) { firing = true; S.kick(); setTimeout(() => { firing = false; }, sec * 1000); },
      state: () => ({ folded, dead, compact: compact(), seq: C.map((b) => b.t).join('') }),
    };
    root._fd = api;
    root.querySelector('.fd-reset')?.addEventListener('click', () => { reset(); ok.clear(); });
    reset(0);
    console.assert(SEQ.every((s) => s.length === 18) && pull('h', 'h') > 0 && pull('+', '-') > 0 && pull('h', 'p') === 0, 'fold: 배열·끌림 규칙');
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Fold = { mount };
})();
