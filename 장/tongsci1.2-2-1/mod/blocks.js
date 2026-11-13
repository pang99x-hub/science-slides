/* 2-2 1차시 표지 «같은 블록, 다른 구조»(교과서 80쪽 도입: 같은 모양 블록을 규칙에 따라 이으면 여러 구조물).
   위에서 내려다본 사면체 블록(삼각형 + 꼭짓점 산소 + 가운데 규소) 여덟 개. 블록을 끌어 다른 블록 꼭짓점 가까이 놓으면
   꼭짓점이 딱 겹쳐 붙고(산소를 함께 씀) 살짝 출렁인다. 끌지 않고 누르면 위아래가 뒤집힌다.
   이은 모양에 따라 «따로따로» «한 줄» «두 줄» «판»이 떠오른다(가로줄 수로 가림).
   키보드: 1~8 블록 고르기, 화살표 옮기기, 스페이스 놓기(붙이기), F 뒤집기, 0 처음부터.
   Blocks.mount(root) → { fit, setActive } · 시험용: root._bk.shape('line'|'double'|'sheet') · state() */
(function () {
  'use strict';
  const N = 8;
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
  // 위에서 본 사면체: 가운데 꼭대기에서 세 모서리로 내려가는 세 면, 빛을 받는 면일수록 밝다
  function facets(c, x, y, cs, alpha, hi) {
    c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); cs.forEach(([px, py], i) => c[i ? 'lineTo' : 'moveTo'](px + 6, py + 8)); c.closePath(); c.fill();
    for (let i = 0; i < 3; i++) {
      const a = cs[i], b = cs[(i + 1) % 3], mx = (a[0] + b[0]) / 2 - x, my = (a[1] + b[1]) / 2 - y, lit = 0.5 + 0.5 * (-(mx + my) / Math.hypot(mx, my) / Math.SQRT2);
      const base = hi ? [255, 216, 77] : [70 + lit * 110, 120 + lit * 100, 200 + lit * 55];
      c.fillStyle = `rgba(${base.map(Math.round).join(',')},${(0.45 + lit * 0.3) * alpha})`;
      c.beginPath(); c.moveTo(x, y); c.lineTo(...a); c.lineTo(...b); c.closePath(); c.fill();
    }
    c.strokeStyle = `rgba(225,238,255,${0.9 * alpha})`; c.lineWidth = 2; c.beginPath(); cs.forEach((q, i) => c[i ? 'lineTo' : 'moveTo'](...q)); c.closePath(); c.stroke();
    c.strokeStyle = `rgba(225,238,255,${0.45 * alpha})`; c.lineWidth = 1.2; cs.forEach((q) => { c.beginPath(); c.moveTo(x, y); c.lineTo(...q); c.stroke(); });
  }
  function mount(root) {
    const stage = root.querySelector('.bk-stage'), now = root.querySelector('.bk-now');
    const P = window.Play;
    let B = [], drag = null, sel = 0, moved = false, label = '';
    const side = () => Math.min(S.W, S.H) * 0.17, hh = () => side() * Math.sqrt(3) / 2;
    // 무게중심 기준 꼭짓점: 위로 뾰족(up) 또는 아래로 뾰족
    const corners = (b) => { const s = side(), h = hh(), k = b.up ? 1 : -1; return [[b.x, b.y - k * h * 2 / 3], [b.x - s / 2, b.y + k * h / 3], [b.x + s / 2, b.y + k * h / 3]]; };
    function reset() {
      const W = S.W || 600, H = S.H || 430;
      B = Array.from({ length: N }, (_, i) => ({ x: W * (0.1 + (i % 4) * 0.12) + (i > 3 ? W * 0.06 : 0), y: H * (i < 4 ? 0.62 : 0.84), up: i % 2 === 0, wob: 0 }));
      label = ''; update();
    }
    const near = (p, q, d) => Math.hypot(p[0] - q[0], p[1] - q[1]) < d;
    // 붙은 블록끼리 묶음을 찾고, 가장 큰 묶음의 가로줄 수로 모양 이름을 정한다
    function update() {
      const links = B.map((b) => B.filter((o) => o !== b && corners(b).some((c) => corners(o).some((q) => near(c, q, 3)))));
      const seen = new Set(); let best = [];
      B.forEach((b) => { if (seen.has(b)) return; const comp = [], st = [b]; seen.add(b); while (st.length) { const x = st.pop(); comp.push(x); links[B.indexOf(x)].forEach((o) => { if (!seen.has(o)) { seen.add(o); st.push(o); } }); } if (comp.length > best.length) best = comp; });
      let name;
      if (best.length < 2) name = '따로따로 — 산소를 함께 쓰지 않는다';
      else {
        const ys = best.map((b) => b.y).sort((a, b) => a - b); let rows = 1;
        for (let i = 1; i < ys.length; i++) if (ys[i] - ys[i - 1] > hh() * 0.6) rows++;
        name = best.length < 3 ? `둘이 이어졌다 — 꼭짓점 산소 하나를 함께 쓴다` : rows === 1 ? `한 줄 사슬 (${best.length}개)` : rows === 2 ? `두 줄 사슬 (${best.length}개)` : `넓은 판 (${best.length}개)`;
      }
      label = name;
      const nt = best.length < 2 ? '블록을 끌어 꼭짓점끼리 붙여 보자' : '같은 블록인데 잇는 방법만 바꿔도 모양이 달라진다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', best.length >= 3); }
    }
    function snap(b) {
      let bestD = side() * 0.32, off = null;
      corners(b).forEach((c) => B.forEach((o) => { if (o === b) return; corners(o).forEach((q) => { const d = Math.hypot(c[0] - q[0], c[1] - q[1]); if (d < bestD) { bestD = d; off = [q[0] - c[0], q[1] - c[1]]; } }); }));
      if (!off) return false;
      const ox = b.x, oy = b.y; b.x += off[0]; b.y += off[1];
      // 다른 블록과 겹치면 붙이지 않는다
      if (B.some((o) => o !== b && Math.hypot(o.x - b.x, o.y - b.y) < side() * 0.5)) { b.x = ox; b.y = oy; return false; }
      b.wob = 1; window.RxT && window.RxT.jolt && window.RxT.jolt(stage, 1); return true;
    }
    function drawBlock(c, b, t, hi) {
      const w = b.wob > 0 ? Math.sin(t * 30) * b.wob * 4 : 0; const cs = corners(b).map(([x, y]) => [x + w, y]);
      facets(c, b.x + w, b.y, cs, 1, hi);
      const r = side() * 0.11;
      ball(c, b.x + w, b.y, r * 0.72, '#5aa9f0');
      cs.forEach((q) => { const sh = B.some((o) => o !== b && corners(o).some((p) => near([q[0] - w, q[1]], p, 3))); ball(c, q[0], q[1], r, sh ? '#ffcf3a' : '#e0503f'); });
    }
    let t = 0;
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; if (!B.length) reset();
        const bg = c.createRadialGradient(W * 0.45, H * 0.35, 20, W * 0.5, H * 0.5, Math.max(W, H) * 0.75); bg.addColorStop(0, '#22305e'); bg.addColorStop(1, '#0b1126');
        c.fillStyle = bg; c.fillRect(0, 0, W, H);
        c.strokeStyle = 'rgba(160,185,240,.06)'; c.lineWidth = 1; for (let gx = 0; gx < W; gx += 28) { c.beginPath(); c.moveTo(gx, 0); c.lineTo(gx, H); c.stroke(); } for (let gy = 0; gy < H; gy += 28) { c.beginPath(); c.moveTo(0, gy); c.lineTo(W, gy); c.stroke(); }
        B.forEach((b, i) => { if (b.wob > 0) b.wob = Math.max(0, b.wob - dt * 2.5); if (b !== drag?.b) drawBlock(c, b, t, i === sel && document.activeElement === S.cv); });
        if (drag) drawBlock(c, drag.b, t, true);
        P.txt(c, label, W * 0.5, 34, '#ffd84d', '800 22px');
        const r = side() * 0.1;
        ball(c, W - 150, H - 22, r, '#e0503f'); P.txt(c, '산소', W - 130, H - 16, '#fbfcf9', '600 15px', 'left');
        ball(c, W - 78, H - 22, r, '#ffcf3a'); P.txt(c, '함께 씀', W - 58, H - 16, '#fbfcf9', '600 15px', 'left');
      },
      down(p) {
        const i = B.map((b, k) => [k, Math.hypot(p.x - b.x, p.y - b.y)]).filter(([, d]) => d < side() * 0.45).sort((a, b) => a[1] - b[1])[0];
        if (!i) return; sel = i[0]; drag = { b: B[sel], dx: B[sel].x - p.x, dy: B[sel].y - p.y }; moved = false;
      },
      move(p, e, held) { if (held && drag) { drag.b.x = p.x + drag.dx; drag.b.y = p.y + drag.dy; moved = true; } },
      up() {
        if (!drag) return; const b = drag.b; drag = null;
        if (!moved) { b.up = !b.up; b.wob = 0.6; } else snap(b);
        update();
      },
      key(e) {
        const b = B[sel]; const d = 12;
        const i = '12345678'.indexOf(e.key); if (i >= 0) { sel = i; return true; }
        const mv = { ArrowLeft: [-d, 0], ArrowRight: [d, 0], ArrowUp: [0, -d], ArrowDown: [0, d] }[e.key];
        if (mv && b) { b.x += mv[0]; b.y += mv[1]; update(); return true; }
        if (e.key === ' ' && b) { snap(b); update(); return true; }
        if ((e.key === 'f' || e.key === 'F') && b) { b.up = !b.up; update(); return true; }
        if (e.key === '0') { reset(); return true; }
        return false;
      },
    });
    // 시험용: 미리 정한 배열로 놓는다(위로 뾰족한 블록 사이에 뒤집힌 블록을 끼우면 꼭짓점이 맞물린다)
    function shape(kind) {
      const s = side(), h = hh(), x0 = S.W * 0.22, y0 = S.H * 0.55;
      const at = (i, row) => ({ x: x0 + i * s / 2 + row * s / 2, y: y0 - row * h + (i % 2 ? -h / 3 : 0), up: i % 2 === 0 });
      const spots = kind === 'line' ? [0, 1, 2, 3, 4].map((i) => at(i, 0)) : kind === 'double' ? [0, 1, 2, 3, 4].map((i) => at(i, 0)).concat([0, 1, 2].map((i) => at(i, 1))) : [0, 1, 2].map((i) => at(i, 0)).concat([0, 1, 2].map((i) => at(i, 1)), [0, 1].map((i) => at(i, 2)));
      reset(); spots.forEach((sp, k) => Object.assign(B[k], sp, { wob: 1 })); update(); S.kick();
      return label;
    }
    root._bk = { shape, state: () => label };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Blocks = { mount };
})();
