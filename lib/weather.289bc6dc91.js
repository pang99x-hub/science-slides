/* 2-2 1차시 체험 «망치와 비바람» — 쪼개짐·깨짐과 풍화(다른 교과서·참고서 내용).
   왼쪽 실험대: 감람석·휘석·흑운모·석영 덩어리. 망치를 끌어 덩어리 위에 놓으면 내리친다.
     흑운모 → 얇은 판이 한 방향으로 벗겨짐 · 휘석 → 두 방향 면을 따라 각진 조각 · 감람석·석영 → 불규칙하게 깨짐(조각이 튀어 떨어짐).
   오른쪽: 네 광물 알갱이가 섞인 바위. «비바람» 붓을 바위 위에서 문지르면 풍화가 진행되어 감람석 → 휘석 → 흑운모 순으로 부서져 쓸려 가고,
     석영 알갱이만 남아 아래로 굴러 모래로 쌓인다(사면체끼리 나누는 산소가 많을수록 풍화에 강함).
   Weather.mount(root) → { fit, setActive } · 시험용: root._wt.hit('biot'|'quar'|'oliv'|'augi') · weather(n) */
(function () {
  'use strict';
  const M = {
    oliv: { n: '감람석', col: '#8a9a3a', hi: '#b8c860', kind: 'break', res: 1, msg: '<b>감람석</b>: 불규칙하게 <b>깨진다</b> — 사면체가 따로 떨어져 있고 사이를 철·마그네슘 이온이 잇는다' },
    augi: { n: '휘석', col: '#2b2d33', hi: '#5a5f6b', kind: 'two', res: 2, msg: '<b>휘석</b>: 서로 거의 직각인 <b>두 방향</b>으로 쪼개진다 — 사슬과 나란한 면을 따라' },
    biot: { n: '흑운모', col: '#2a2420', hi: '#7a6a50', kind: 'sheet', res: 3, msg: '<b>흑운모</b>: <b>한 방향</b>으로 얇게 벗겨진다 — 판과 판 사이가 약하다' },
    quar: { n: '석영', col: '#e8eef2', hi: '#ffffff', kind: 'break', res: 99, msg: '<b>석영</b>: 쪼개지지 않고 유리처럼 <b>깨진다</b> — 사면체가 산소 넷을 모두 나눠 모든 방향으로 단단히 묶였다' },
  };
  const ORDER = ['oliv', 'augi', 'biot', 'quar'];
  // 그림 도우미(11/10 다시 그리기): 명암 구슬은 오프스크린에 한 번 그려 캐시, 면은 빛(왼쪽 위) 방향에 따라 밝기를 달리한다
  const SPR = new Map();
  const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16), m = (v) => Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f); return `rgb(${m(n >> 16)},${m((n >> 8) & 255)},${m(n & 255)})`; };
  function ball(c, x, y, r, col) {
    const k = col + Math.round(r * 2); let s = SPR.get(k);
    if (!s) {
      const d = Math.ceil(r * 2) + 6; s = document.createElement('canvas'); s.width = s.height = d * 2; const g = s.getContext('2d'); g.scale(2, 2);
      g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(d / 2 + r * 0.18, d / 2 + r * 0.22, r, r * 0.9, 0, 0, Math.PI * 2); g.fill();
      const gr = g.createRadialGradient(d / 2 - r * 0.35, d / 2 - r * 0.4, r * 0.06, d / 2, d / 2, r); gr.addColorStop(0, shade(col, 0.6)); gr.addColorStop(0.45, col); gr.addColorStop(1, shade(col, -0.5));
      g.fillStyle = gr; g.beginPath(); g.arc(d / 2, d / 2, r, 0, Math.PI * 2); g.fill(); SPR.set(k, s);
    }
    const h = s.width / 4; c.drawImage(s, x - h, y - h, h * 2, h * 2);
  }
  // 광물 덩어리: 실제 생김새에 가깝게(감람석 유리질 초록 알갱이, 휘석 검은 각기둥, 흑운모 층진 검은 판, 석영 투명 육각기둥)
  function mineral(c, m, x, y, r) {
    c.save(); c.translate(x, y);
    c.fillStyle = 'rgba(0,0,0,.22)'; c.beginPath(); c.ellipse(r * 0.1, r * 0.92, r * 1.05, r * 0.2, 0, 0, Math.PI * 2); c.fill();
    if (m === 'oliv') {
      [[-0.45, 0.3, 0.55], [0.35, 0.35, 0.6], [0, -0.15, 0.62], [-0.5, -0.35, 0.4], [0.5, -0.3, 0.42]].forEach(([dx, dy, k]) => {
        const rr = r * k, gr = c.createRadialGradient(dx * r - rr * 0.3, dy * r - rr * 0.35, rr * 0.1, dx * r, dy * r, rr);
        gr.addColorStop(0, '#e6f08a'); gr.addColorStop(0.5, '#8fa233'); gr.addColorStop(1, '#4a5a14');
        c.fillStyle = gr; c.beginPath(); for (let q = 0; q < 6; q++) { const a = q / 6 * Math.PI * 2 + k; c.lineTo(dx * r + Math.cos(a) * rr, dy * r + Math.sin(a) * rr * 0.9); } c.closePath(); c.fill();
        c.fillStyle = 'rgba(255,255,230,.7)'; c.beginPath(); c.ellipse(dx * r - rr * 0.3, dy * r - rr * 0.35, rr * 0.18, rr * 0.08, -0.6, 0, Math.PI * 2); c.fill();
      });
    } else if (m === 'augi') {
      const w = r * 0.55, h = r * 0.95, d = r * 0.35;
      c.fillStyle = '#4a4f5a'; c.beginPath(); c.moveTo(-w, -h); c.lineTo(-w + d, -h - d * 0.6); c.lineTo(w + d, -h - d * 0.6); c.lineTo(w, -h); c.closePath(); c.fill();
      let gr = c.createLinearGradient(-w, 0, w, 0); gr.addColorStop(0, '#3a3e47'); gr.addColorStop(0.5, '#1c1e24'); gr.addColorStop(1, '#2a2d34');
      c.fillStyle = gr; c.fillRect(-w, -h, w * 2, h * 1.9);
      gr = c.createLinearGradient(w, 0, w + d, 0); gr.addColorStop(0, '#15161a'); gr.addColorStop(1, '#0b0c0f');
      c.fillStyle = gr; c.beginPath(); c.moveTo(w, -h); c.lineTo(w + d, -h - d * 0.6); c.lineTo(w + d, h * 0.9 - d * 0.6); c.lineTo(w, h * 0.9); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(200,210,230,.35)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-w * 0.55, -h + 3); c.lineTo(-w * 0.55, h * 0.85); c.stroke();
    } else if (m === 'biot') {
      for (let n = 0; n < 9; n++) {
        const yy = r * 0.55 - n * r * 0.13, sk = r * 0.25;
        c.fillStyle = n % 2 ? '#2a2018' : '#3d2f22'; c.beginPath(); c.moveTo(-r * 0.85, yy); c.lineTo(r * 0.75, yy); c.lineTo(r * 0.75 + sk, yy - r * 0.12); c.lineTo(-r * 0.85 + sk, yy - r * 0.12); c.closePath(); c.fill();
        c.strokeStyle = n === 8 ? 'rgba(230,210,170,.75)' : 'rgba(200,170,120,.35)'; c.lineWidth = 1; c.beginPath(); c.moveTo(-r * 0.85, yy); c.lineTo(r * 0.75, yy); c.stroke();
      }
      c.fillStyle = 'rgba(255,240,200,.35)'; c.beginPath(); c.ellipse(r * 0.05, r * -0.55, r * 0.45, r * 0.06, 0, 0, Math.PI * 2); c.fill();
    } else {
      const w = r * 0.42, h = r * 0.75;
      const gr = c.createLinearGradient(-w, 0, w, 0); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(0.4, 'rgba(210,225,235,.75)'); gr.addColorStop(1, 'rgba(160,180,195,.85)');
      c.fillStyle = gr; c.strokeStyle = '#8fa4b4'; c.lineWidth = 1.5;
      c.beginPath(); c.moveTo(-w, h); c.lineTo(-w, -h * 0.4); c.lineTo(0, -h * 1.05); c.lineTo(w, -h * 0.4); c.lineTo(w, h); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(0, -h * 1.05); c.lineTo(0, h); c.moveTo(-w, -h * 0.4); c.lineTo(0, -h * 0.25); c.lineTo(w, -h * 0.4); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(-w * 0.75, -h * 0.25, w * 0.18, h * 1.1);
    }
    c.restore();
  }

  function mount(root) {
    const stage = root.querySelector('.wt-stage'), now = root.querySelector('.wt-now'), out = root.querySelector('.wt-out');
    const P = window.Play;
    let bgc = null;
    // 배경(벽·나무 실험대·하늘·땅)은 크기가 바뀔 때만 다시 그린다
    function backdrop(W, H, g) {
      const cv = document.createElement('canvas'); cv.width = W * 2; cv.height = H * 2; const c = cv.getContext('2d'); c.scale(2, 2);
      let gr = c.createLinearGradient(0, 0, 0, g.floor); gr.addColorStop(0, '#f3f1ea'); gr.addColorStop(1, '#dcd8cc'); c.fillStyle = gr; c.fillRect(0, 0, g.mid, g.floor);
      c.strokeStyle = 'rgba(120,110,90,.12)'; c.lineWidth = 1; for (let y = 24; y < g.floor; y += 34) { c.beginPath(); c.moveTo(0, y); c.lineTo(g.mid, y); c.stroke(); for (let x = (y / 34 % 2) * 30; x < g.mid; x += 60) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 34); c.stroke(); } }
      gr = c.createLinearGradient(0, g.floor, 0, H); gr.addColorStop(0, '#a5784c'); gr.addColorStop(1, '#6e4a2a'); c.fillStyle = gr; c.fillRect(0, g.floor, g.mid, H - g.floor);
      c.strokeStyle = 'rgba(60,35,15,.25)'; for (let k = 0; k < 9; k++) { const y = g.floor + 6 + k * (H - g.floor) / 9; c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(g.mid * 0.3, y + 3, g.mid * 0.6, y - 3, g.mid, y + 1); c.stroke(); }
      c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(0, g.floor, g.mid, 3);
      gr = c.createLinearGradient(0, 0, 0, g.floor); gr.addColorStop(0, '#8fa6bd'); gr.addColorStop(1, '#d6e2ea'); c.fillStyle = gr; c.fillRect(g.mid, 0, W - g.mid, g.floor);
      c.fillStyle = 'rgba(90,100,120,.2)'; [[0.62, 0.1, 60], [0.8, 0.07, 75], [0.95, 0.12, 50]].forEach(([u, v, r]) => { c.beginPath(); c.ellipse(W * u, H * v, r, r * 0.4, 0, 0, Math.PI * 2); c.fill(); });
      gr = c.createLinearGradient(0, g.floor, 0, H); gr.addColorStop(0, '#cbb084'); gr.addColorStop(1, '#a48a5e'); c.fillStyle = gr; c.fillRect(g.mid, g.floor, W - g.mid, H - g.floor);
      for (let k = 0; k < 500; k++) { c.fillStyle = `rgba(${k % 2 ? '90,70,40' : '255,245,220'},${0.15 + (k % 5) * 0.04})`; c.fillRect(g.mid + ((k * 97) % (W - g.mid)), g.floor + ((k * 53) % (H - g.floor)), 1.5, 1.5); }
      c.fillStyle = 'rgba(29,36,51,.25)'; c.fillRect(g.mid - 1, 0, 2, H);
      return { cv, w: W, h: H };
    }
    let t = 0, bits = [], hammer = null, swing = null, brush = null, grains = [], wear = 0, rain = [], msg = '';
    const hit = new Set(), ok = new Set();
    const G = (W, H) => ({ floor: H * 0.82, chunk: (k) => [W * (0.075 + k * 0.115), H * 0.82 - Math.min(W, H) * 0.074], r: Math.min(W, H) * 0.074, hHome: [W * 0.08, H * 0.2], bHome: [W * 0.6, H * 0.22], rock: [W * 0.76, H * 0.5], rr: Math.min(W, H) * 0.2, mid: W * 0.5 });
    const rnd = (a, b) => a + Math.random() * (b - a);
    function makeRock() { // 바위 속 알갱이: 석영 많이, 나머지 고루(이해를 돕기 위한 예)
      grains = []; wear = 0; const mix = ['quar', 'quar', 'quar', 'oliv', 'augi', 'biot', 'quar', 'oliv', 'augi', 'biot'];
      for (let k = 0; k < 46; k++) { const a = rnd(0, Math.PI * 2), d = Math.sqrt(Math.random()); grains.push({ m: mix[k % mix.length], ax: Math.cos(a) * d, ay: Math.sin(a) * d * 0.8, s: rnd(0.75, 1.2), life: 1, x: 0, y: 0, vy: 0, loose: false, rest: false }); }
    }
    makeRock();
    const chunks = ORDER.map((m) => ({ m, broken: false }));
    function say(h) { if (h !== msg) { msg = h; out.innerHTML = h; } }
    function steps() {
      if (hit.has('biot')) ok.add(1); if (hit.has('quar')) ok.add(2);
      const st = [1, 2, 3].find((k) => !ok.has(k)) || 0;
      window.L1.steps(root, st, [...ok]); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 망치를 끌어 흑운모 위에 놓아 내리치자' : st === 2 ? '② 석영도 내리쳐 보자' : st === 3 ? '③ 비바람 붓으로 바위를 문질러 모래를 만들자' : '나누는 산소가 많을수록 잘 깨지지 않고 오래 남는다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    function strike(k, g) {
      const ch = chunks[k]; if (ch.broken) { say(`${M[ch.m].n}은 이미 부서졌다 — «처음부터»로 새 덩어리를 놓자`); return; }
      ch.broken = true; hit.add(ch.m); const [cx, cy] = g.chunk(k), r = g.r, info = M[ch.m];
      if (info.kind === 'sheet') for (let n = 0; n < 7; n++) bits.push({ x: cx + rnd(-4, 4), y: cy - r * 0.5 + n * r * 0.16, w: r * 1.6, h: r * 0.1, vx: (n % 2 ? 1 : -1) * rnd(40, 120), vy: rnd(-260, -120), rot: 0, vr: rnd(-0.6, 0.6), col: n % 2 ? info.col : info.hi, shape: 'rect' });
      else if (info.kind === 'two') [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => bits.push({ x: cx + a * r * 0.4, y: cy + b * r * 0.35, w: r * 0.8, h: r * 0.7, vx: a * rnd(60, 140), vy: rnd(-260, -140), rot: 0, vr: 0, col: (a + b) % 4 ? info.col : info.hi, shape: 'rect' }));
      else for (let n = 0; n < 11; n++) { const pts = []; const m = 5 + (n % 3); for (let q = 0; q < m; q++) { const a = q / m * Math.PI * 2 + rnd(-0.3, 0.3); pts.push([Math.cos(a) * rnd(0.4, 1), Math.sin(a) * rnd(0.4, 1)]); } bits.push({ x: cx + rnd(-r * 0.4, r * 0.4), y: cy + rnd(-r * 0.4, r * 0.3), sz: r * rnd(0.22, 0.42), pts, vx: rnd(-200, 200), vy: rnd(-320, -120), rot: rnd(0, 6), vr: rnd(-6, 6), col: n % 3 ? info.col : info.hi, shape: 'poly', glassy: ch.m === 'quar' }); }
      window.RxT.jolt(stage, 2); say(info.msg); steps();
    }
    function weatherStep(amount, g) {
      wear += amount;
      grains.forEach((q) => { if (q.life > 0 && q.m !== 'quar' && wear > M[q.m].res * 1.2 * q.s) q.life -= amount * 0.9; });
      const soft = grains.filter((q) => q.m !== 'quar'), gone = soft.filter((q) => q.life <= 0).length / soft.length;
      if (gone > 0.85) grains.forEach((q) => { if (q.m === 'quar' && !q.loose) { q.loose = true; q.vy = rnd(-40, 20); } });
      if (gone >= 1 && !ok.has(3)) { ok.add(3); window.RxT.jolt(stage, 1); }
      say(gone >= 1 ? '바위가 다 풀리고 <b>석영 알갱이</b>만 남아 모래로 쌓였다 — 바닷가·강가 모래가 석영투성이인 까닭'
        : gone > 0 ? `풍화 진행 중 — 먼저 무너지는 것은 ${grains.some((q) => q.m === 'oliv' && q.life > 0) ? '<b>감람석</b>' : grains.some((q) => q.m === 'augi' && q.life > 0) ? '<b>휘석</b>' : '<b>흑운모</b>'} (나누는 산소가 적을수록 약하다)`
        : '비바람이 바위 겉을 두드린다 — 계속 문질러 보자');
      steps(); void g;
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const g = G(W, H);
        if (!bgc || bgc.w !== W || bgc.h !== H) bgc = backdrop(W, H, g);
        c.drawImage(bgc.cv, 0, 0, W, H);
        P.txt(c, '실험대 — 망치로 내리치기', g.mid / 2, 88, '#1d2433', '800 19px'); P.txt(c, '바위 — 비바람으로 문지르기', (g.mid + W) / 2, 30, '#1d2433', '800 19px');
        // 덩어리
        chunks.forEach((ch, k) => {
          const [x, y] = g.chunk(k), r = g.r, info = M[ch.m];
          if (!ch.broken) mineral(c, ch.m, x, y, r);
          P.txt(c, info.n, x, g.floor + 26, '#fbfcf9', '800 17px');
        });
        // 조각 물리
        bits.forEach((b) => {
          if (!b.rest) { b.vy += 900 * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.rot += b.vr * dt; if (b.y > g.floor - 4) { b.y = g.floor - 4; b.vy *= -0.3; b.vx *= 0.6; b.vr *= 0.5; if (Math.abs(b.vy) < 30) { b.rest = true; b.vy = 0; } } b.x = Math.max(4, Math.min(g.mid - 4, b.x)); }
          c.save(); c.translate(b.x, b.y); c.rotate(b.rot); c.fillStyle = b.col;
          if (b.shape === 'rect') { c.fillRect(-b.w / 2, -b.h / 2, b.w, b.h); c.fillStyle = 'rgba(255,240,210,.3)'; c.fillRect(-b.w / 2, -b.h / 2, b.w, Math.max(1, b.h * 0.25)); }
          else { c.beginPath(); b.pts.forEach(([px, py]) => c.lineTo(px * b.sz, py * b.sz)); c.closePath(); c.fill(); c.strokeStyle = b.glassy ? '#8fa4b4' : 'rgba(255,255,255,.25)'; c.lineWidth = 1.2; c.stroke(); }
          c.restore();
        });
        // 망치
        let [hx, hy] = hammer ? [hammer.x, hammer.y] : g.hHome; let ang = -0.5;
        if (swing) { swing.t += dt; const u = Math.min(1, swing.t / 0.18); ang = -1.2 + u * 1.5; [hx, hy] = [swing.x, swing.y - 30 * (1 - u)]; if (u >= 1 && !swing.done) { swing.done = true; strike(swing.k, g); } if (swing.t > 0.4) swing = null; }
        c.save(); c.translate(hx, hy); c.rotate(ang);
        let hg = c.createLinearGradient(-6, 0, 6, 0); hg.addColorStop(0, '#6e4422'); hg.addColorStop(0.5, '#c08a55'); hg.addColorStop(1, '#7a4c26'); c.fillStyle = hg; c.beginPath(); c.roundRect(-6, -10, 12, 74, 5); c.fill();
        c.strokeStyle = 'rgba(70,40,15,.45)'; c.lineWidth = 1; [-2, 2].forEach((u) => { c.beginPath(); c.moveTo(u, -6); c.quadraticCurveTo(u + 2, 26, u, 60); c.stroke(); });
        hg = c.createLinearGradient(0, -30, 0, -2); hg.addColorStop(0, '#c9d0da'); hg.addColorStop(0.45, '#7b8494'); hg.addColorStop(1, '#3e4552'); c.fillStyle = hg; c.beginPath(); c.roundRect(-26, -30, 52, 26, 4); c.fill();
        c.fillStyle = '#2c313b'; c.fillRect(22, -30, 6, 26); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(-24, -28, 46, 3); c.restore();
        if (!hammer && !swing) P.txt(c, '망치', g.hHome[0], g.hHome[1] + 78, '#1d2433', '700 15px');
        // 바위 알갱이
        const [rx, ry] = g.rock, rr = g.rr;
        const pile = new Map(), alive = grains.filter((q) => !q.loose && (q.life > 0 || q.m === 'quar')).length / grains.length;
        if (alive > 0.05) { // 알갱이를 붙잡고 있는 바위 바탕(풍화될수록 옅어짐)
          c.globalAlpha = Math.min(1, alive * 1.2); const rg = c.createRadialGradient(rx - rr * 0.3, ry - rr * 0.35, rr * 0.1, rx, ry, rr * 1.15); rg.addColorStop(0, '#b9b3a6'); rg.addColorStop(1, '#6d675c');
          c.fillStyle = rg; c.beginPath(); for (let q = 0; q < 14; q++) { const an = q / 14 * Math.PI * 2, k = 1.08 + Math.sin(q * 2.7) * 0.07; c.lineTo(rx + Math.cos(an) * rr * k, ry + Math.sin(an) * rr * 0.85 * k); } c.closePath(); c.fill(); c.globalAlpha = 1;
        }
        grains.forEach((q) => {
          if (!q.loose) { q.x = rx + q.ax * rr; q.y = ry + q.ay * rr; }
          else if (!q.rest) { q.vy += 700 * dt; q.y += q.vy * dt; const col = Math.round(q.x / 10); const top = g.floor - 7 - (pile.get(col) || 0); if (q.y >= top) { q.y = top; q.rest = true; } }
          if (q.rest) { const col = Math.round(q.x / 10); pile.set(col, (pile.get(col) || 0) + 6); }
          if (q.life <= 0 && q.m !== 'quar') return;
          const a = Math.max(0, q.life), sz = rr * 0.11 * q.s * (q.m === 'quar' ? 1 : 0.5 + a * 0.5);
          c.globalAlpha = q.m === 'quar' ? 1 : 0.35 + a * 0.65; ball(c, q.x, q.y, sz, q.m === 'quar' ? '#e4edf3' : M[q.m].col === '#2a2420' ? '#4a3a2c' : M[q.m].col);
          c.globalAlpha = 1;
        });
        // 비
        rain = rain.filter((d) => (d.y += 600 * dt) < g.floor); rain.forEach((d) => { c.strokeStyle = 'rgba(70,120,190,.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(d.x, d.y); c.lineTo(d.x - 4, d.y - 14); c.stroke(); });
        // 붓
        const [bx, by] = brush ? [brush.x, brush.y] : g.bHome;
        c.save(); c.translate(bx, by); c.rotate(0.5);
        let bgr = c.createLinearGradient(-5, 0, 5, 0); bgr.addColorStop(0, '#6e4422'); bgr.addColorStop(0.5, '#c08a55'); bgr.addColorStop(1, '#7a4c26'); c.fillStyle = bgr; c.beginPath(); c.roundRect(-5, -62, 10, 52, 4); c.fill();
        c.fillStyle = '#9aa3b0'; c.fillRect(-9, -14, 18, 8);
        bgr = c.createLinearGradient(0, -6, 0, 16); bgr.addColorStop(0, '#3d6aa8'); bgr.addColorStop(1, '#8fb4e0'); c.fillStyle = bgr; c.beginPath(); c.moveTo(-11, -6); c.lineTo(11, -6); c.lineTo(8, 16); c.lineTo(-8, 16); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1; for (let u = -7; u <= 7; u += 3.5) { c.beginPath(); c.moveTo(u, -4); c.lineTo(u * 0.8, 15); c.stroke(); } c.restore();
        P.txt(c, '비바람 붓', g.bHome[0] + 44, g.bHome[1] + 6, '#1d2433', '700 15px', 'left');
        // 풍화 막대
        const soft = grains.filter((q) => q.m !== 'quar'), gone = soft.filter((q) => q.life <= 0).length / soft.length;
        c.fillStyle = 'rgba(29,36,51,.15)'; c.fillRect(g.mid + 20, H - 26, W - g.mid - 40, 10); c.fillStyle = '#4a7ab8'; c.fillRect(g.mid + 20, H - 26, (W - g.mid - 40) * gone, 10);
        P.txt(c, '풍화 진행', g.mid + 20, H - 32, '#1d2433', '700 13px', 'left');
        // 범례(바위)
        ORDER.forEach((m, k) => { const x = g.mid + 24 + k * 84, y = 58; ball(c, x, y, 7, m === 'quar' ? '#e4edf3' : m === 'biot' ? '#4a3a2c' : M[m].col); P.txt(c, M[m].n, x + 12, y + 5, '#1d2433', '600 14px', 'left'); });
      },
      down(p) {
        const g = G(S.W, S.H);
        if (Math.hypot(p.x - g.hHome[0], p.y - (g.hHome[1] + 20)) < 50) { hammer = { x: p.x, y: p.y }; return; }
        if (Math.hypot(p.x - g.bHome[0], p.y - (g.bHome[1] - 20)) < 50) { brush = { x: p.x, y: p.y, lx: p.x, ly: p.y }; return; }
      },
      move(p, e, held) {
        if (!held) return; const g = G(S.W, S.H);
        if (hammer) { hammer.x = p.x; hammer.y = p.y; }
        if (brush) {
          const d = Math.hypot(p.x - brush.lx, p.y - brush.ly); brush.x = p.x; brush.y = p.y; brush.lx = p.x; brush.ly = p.y;
          if (Math.hypot(p.x - g.rock[0], p.y - g.rock[1]) < g.rr * 1.2) { weatherStep(d / 300, g); if (Math.random() < 0.6) rain.push({ x: p.x + rnd(-40, 40), y: p.y - rnd(60, 120) }); }
        }
      },
      up(p) {
        const g = G(S.W, S.H);
        if (hammer) { const k = chunks.findIndex((ch, i) => { const [x, y] = g.chunk(i); return Math.abs(p.x - x) < g.r * 1.1 && Math.abs(p.y - y) < g.r * 1.6; }); hammer = null; if (k >= 0) swing = { k, x: g.chunk(k)[0] + g.r * 0.2, y: g.chunk(k)[1] - g.r * 0.9, t: 0 }; else say('망치를 광물 덩어리 위에 놓으면 내리친다'); }
        brush = null;
      },
      key(e) { // 1~4 그 광물 내리치기 · W 비바람 한 번
        const i = '1234'.indexOf(e.key), g = G(S.W, S.H);
        if (i >= 0) { swing = { k: i, x: g.chunk(i)[0] + g.r * 0.2, y: g.chunk(i)[1] - g.r * 0.9, t: 0 }; return true; }
        if (e.key.toLowerCase() === 'w') { weatherStep(0.35, g); rain.push({ x: g.rock[0], y: g.rock[1] - 100 }); return true; }
        return false;
      },
    });
    root.querySelector('.wt-reset')?.addEventListener('click', () => { chunks.forEach((ch) => { ch.broken = false; }); bits = []; makeRock(); hit.clear(); ok.clear(); say('망치로 덩어리를 내리치거나, 비바람 붓으로 바위를 문질러 보자'); steps(); S.kick(); });
    say('망치로 덩어리를 내리치거나, 비바람 붓으로 바위를 문질러 보자'); steps();
    root._wt = { hit: (m) => { strike(ORDER.indexOf(m), G(S.W || 800, S.H || 460)); S.kick(); }, weather: (n = 1) => { for (let k = 0; k < n; k++) weatherStep(0.35, G(S.W || 800, S.H || 460)); S.kick(); } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Weather = { mount };
})();
