/* 2-2 1차시 체험 «사면체 이어 붙이기»(교과서 80쪽 해 보기 · 규산염 사면체의 결합 구조 모형 만들기).
   위에서 내려다본 규산염 사면체 = 꼭짓점 셋이 산소인 삼각형 + 가운데 규소(맨 위 산소 하나가 규소 위에 겹쳐 보임).
   아래 받침에서 ▲·▼ 사면체를 끌어 판에 놓으면 꼭짓점 자리에 맞춰 딱 붙는다(산소를 함께 씀). 붙은 묶음은 끌면 함께 움직인다.
   튕기는 경우: 같은 자리(규소끼리 겹침) · 산소 하나를 셋이 나누려 할 때 · 모서리(산소 둘)를 나누려 할 때 — 실제 규산염의 규칙.
   사면체 수·함께 쓰는 산소 수·규소:산소 비가 바로 바뀌고, 가장 큰 묶음이 한 줄(단사슬)·두 줄(복사슬)·세 줄 이상(판상)이면 이름이 뜬다.
   자리: 꼭짓점은 삼각 격자 v(i, j) = (ox + i·s + j·s/2, oy − j·h). ▲(i, j) = v(i,j)·v(i+1,j)·v(i,j+1), ▼(i, j) = v(i+1,j)·v(i,j+1)·v(i+1,j+1).
   줄(band) = 삼각형 아래쪽 꼭짓점의 j. Link.mount(root) → { fit, setActive } · 시험용: root._lk.build('chain'|'double'|'sheet') · info() */
(function () {
  'use strict';
  const VS = (o, i, j) => (o === 'u' ? [[i, j], [i + 1, j], [i, j + 1]] : [[i + 1, j], [i, j + 1], [i + 1, j + 1]]);
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
  const fk = (o, i, j) => `${o}${i},${j}`, vk = (v) => `${v[0]},${v[1]}`;
  function mount(root) {
    const stage = root.querySelector('.lk-stage'), now = root.querySelector('.lk-now'), out = root.querySelector('.lk-out');
    const P = window.Play;
    let T = [], drag = null, flash = [], bounce = null, t = 0, msg = '', last = null;
    const ok = new Set();
    const G = (W, H) => { const s = Math.min(W, H) * 0.1, h = s * Math.sqrt(3) / 2; return { s, h, ox: W * 0.36, oy: H * 0.62, tray: [W * 0.5, H - 36], boardB: H - 76 }; };
    const vxy = (g, v) => [g.ox + v[0] * g.s + v[1] * g.s / 2, g.oy - v[1] * g.h];
    const cen = (g, o, i, j) => { const p = VS(o, i, j).map((v) => vxy(g, v)); return [(p[0][0] + p[1][0] + p[2][0]) / 3, (p[0][1] + p[1][1] + p[2][1]) / 3]; };
    function nearest(g, o, x, y) { // 그 모양(▲/▼) 칸 가운데 (x, y)에 가장 가까운 칸
      const j0 = Math.round((g.oy - y) / g.h), i0 = Math.round((x - g.ox - j0 * g.s / 2) / g.s); let best = null, bd = 1e9;
      for (let j = j0 - 2; j <= j0 + 2; j++) for (let i = i0 - 2; i <= i0 + 2; i++) { const [cx, cy] = cen(g, o, i, j), d = Math.hypot(cx - x, cy - y); if (d < bd) { bd = d; best = [i, j]; } }
      return best;
    }
    // 규칙 검사: 놓을 칸 목록(faces)과 그대로 있는 사면체(others)
    function legal(faces, others) {
      const occ = new Set(others.map((q) => fk(q.o, q.i, q.j))), vc = new Map(), ec = new Map();
      for (const f of faces) if (occ.has(fk(...f))) return 'same';
      for (const f of [...others.map((q) => [q.o, q.i, q.j]), ...faces]) {
        const v = VS(...f); v.forEach((p) => vc.set(vk(p), (vc.get(vk(p)) || 0) + 1));
        [[0, 1], [0, 2], [1, 2]].forEach(([a, b]) => { const k = [vk(v[a]), vk(v[b])].sort().join('|'); ec.set(k, (ec.get(k) || 0) + 1); });
      }
      if ([...vc.values()].some((n) => n > 2)) return 'three';
      if ([...ec.values()].some((n) => n > 1)) return 'edge';
      return '';
    }
    const vcount = () => { const m = new Map(); T.forEach((q) => VS(q.o, q.i, q.j).forEach((p) => m.set(vk(p), (m.get(vk(p)) || 0) + 1))); return m; };
    function comp(q0) {
      const seen = new Set([q0]), st = [q0];
      while (st.length) { const q = st.pop(), mine = new Set(VS(q.o, q.i, q.j).map(vk)); T.forEach((r) => { if (!seen.has(r) && VS(r.o, r.i, r.j).some((p) => mine.has(vk(p)))) { seen.add(r); st.push(r); } }); }
      return seen;
    }
    function stats() {
      const vc = vcount(), shared = [...vc.values()].filter((n) => n === 2).length, n = T.length, o = 4 * n - shared;
      let best = null; const seen = new Set();
      T.forEach((q) => { if (seen.has(q)) return; const c = comp(q); c.forEach((r) => seen.add(r)); if (!best || c.size > best.size) best = c; });
      let shape = '', name = '';
      if (best && best.size >= 2) {
        const arr = [...best], bands = [...new Set(arr.map((q) => q.j))], per = (b) => arr.filter((q) => q.j === b).length;
        if (bands.length === 1) { shape = best.size >= 4 ? 'chain' : 'pair'; name = best.size >= 4 ? '단사슬 구조 — 휘석처럼 한 줄' : '두 사면체가 산소 하나를 나눔'; }
        else if (bands.length === 2 && best.size >= 6 && bands.every((b) => per(b) >= 3)) { shape = 'double'; name = '복사슬 구조 — 각섬석처럼 두 줄'; }
        else if (bands.length >= 3 && best.size >= 7) { shape = 'sheet'; name = '판상 구조 — 흑운모처럼 넓은 판'; }
        else { shape = 'blob'; name = '여러 방향으로 이어진 묶음'; }
      }
      return { n, shared, o, shape, name };
    }
    function say(h) { if (h !== msg) { msg = h; out.innerHTML = h; } }
    function update() {
      const s = stats();
      if (s.shared >= 1) ok.add(1); if (s.shape === 'chain') ok.add(2); if (s.shape === 'double' || s.shape === 'sheet') ok.add(3);
      const st = [1, 2, 3].find((k) => !ok.has(k)) || 0;
      window.L1.steps(root, st, [...ok]); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 사면체를 끌어 다른 사면체의 꼭짓점 산소에 붙이자' : st === 2 ? '② ▲를 한 줄로 4개 이상 이어 사슬을 만들자' : st === 3 ? '③ ▼를 위에 이어 두 줄, 더 이어 판을 만들자' : '나누는 산소가 많을수록 구조가 넓어진다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
      if (!s.n) say('아래 받침에서 ▲·▼ 사면체를 끌어 판 위에 놓아 보자');
      else say(`${s.name ? `<b>${s.name}</b><br>` : ''}사면체 ${s.n}개 · 함께 쓰는 산소 <b>${s.shared}</b>개 · 규소 : 산소 = <b>${s.n} : ${s.o}</b> (1 : ${+(s.o / s.n).toFixed(2)})`);
      return s;
    }
    const BOUNCE = { same: ['규소끼리는 못 겹친다', '튕겨 나왔다 — 사면체는 <b>규소가 아니라 꼭짓점의 산소</b>를 함께 쓰며 이어진다'],
      three: ['산소 하나는 둘까지만', '튕겨 나왔다 — 산소 하나를 나누는 사면체는 <b>둘까지</b>다'],
      edge: ['모서리는 안 나눈다', '튕겨 나왔다 — 이웃한 사면체는 <b>꼭짓점 산소 하나</b>만 나눈다(모서리째 산소 둘은 나누지 않는다)'] };
    function place(o, i, j) { if (legal([[o, i, j]], T)) return null; const q = { o, i, j, x: null, y: null, born: t }; T.push(q); last = q; return q; }
    function drawTri(c, g, o, x, y, pop, alpha) { // (x, y) = 가운데
      const p = VS(o, 0, 0).map((v) => vxy(g, v)), [cx0, cy0] = cen(g, o, 0, 0), cs = p.map(([px, py]) => [px - cx0 + x, py - cy0 + y]);
      facets(c, x, y, cs, alpha, false);
      c.globalAlpha = alpha;
      ball(c, x, y, g.s * 0.1, '#7fd1ff');
      c.globalAlpha = 0.55 * alpha; ball(c, x, y, g.s * 0.15, '#e0503f'); c.globalAlpha = alpha; // 맨 위 산소(규소 위에 겹쳐 반투명)
      cs.forEach((q) => ball(c, q[0], q[1], g.s * 0.16 * (1 + pop * 0.3), '#e0503f'));
      c.globalAlpha = 1;
    }
    const trayPos = (g, o) => [g.tray[0] + (o === 'u' ? -70 : 10), g.tray[1] + 4];
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const g = G(W, H), k = Math.min(1, dt * 14 || 1);
        const bg = c.createRadialGradient(W * 0.4, H * 0.4, 20, W * 0.5, H * 0.5, Math.max(W, H) * 0.75); bg.addColorStop(0, '#22305e'); bg.addColorStop(1, '#0b1126');
        c.fillStyle = bg; c.fillRect(0, 0, W, H);
        c.fillStyle = 'rgba(190,210,255,.16)';
        for (let j = -5; j <= 7; j++) for (let i = -12; i <= 12; i++) { const [x, y] = vxy(g, [i, j]); if (x > 6 && x < W - 6 && y > 8 && y < g.boardB) { c.beginPath(); c.arc(x, y, 2, 0, Math.PI * 2); c.fill(); } }
        const s = stats(), vc = vcount();
        T.forEach((q) => {
          let tx, ty; if (drag && drag.set.has(q)) { tx = q.x0 + drag.dx; ty = q.y0 + drag.dy; } else [tx, ty] = cen(g, q.o, q.i, q.j);
          if (q.x === null) { q.x = tx; q.y = ty; } q.x += (tx - q.x) * k; q.y += (ty - q.y) * k;
          drawTri(c, g, q.o, q.x, q.y, Math.max(0, 1 - (t - q.born) * 4), drag && drag.set.has(q) ? 0.85 : 1);
        });
        vc.forEach((n, key) => { if (n !== 2) return; const [x, y] = vxy(g, key.split(',').map(Number)); P.glow(c, x, y, g.s * 0.42, `rgba(255,216,77,${0.35 + Math.sin(t * 4) * 0.15})`); ball(c, x, y, g.s * 0.18, '#ffcf3a'); });
        flash = flash.filter((f) => (f.a -= dt * 1.4) > 0); flash.forEach((f) => { c.strokeStyle = `rgba(255,216,77,${f.a})`; c.lineWidth = 3; c.beginPath(); c.arc(f.x, f.y, g.s * (0.3 + (1 - f.a)), 0, Math.PI * 2); c.stroke(); });
        if (bounce) { bounce.a -= dt * 1.2; if (bounce.a <= 0) bounce = null; else { c.strokeStyle = `rgba(239,91,76,${bounce.a})`; c.lineWidth = 4; c.beginPath(); c.arc(bounce.x, bounce.y, g.s * (0.5 + (1 - bounce.a)), 0, Math.PI * 2); c.stroke(); P.txt(c, bounce.t, bounce.x, bounce.y - g.s * 0.9, `rgba(255,170,160,${bounce.a})`, '800 17px'); } }
        // 받침: ▲와 ▼
        const [tx, ty] = g.tray; c.fillStyle = '#16203f'; c.strokeStyle = '#5a6a90'; c.lineWidth = 2; c.beginPath(); c.roundRect(tx - 130, ty - 32, 260, 64, 14); c.fill(); c.stroke();
        ['u', 'd'].forEach((o) => { const [x, y] = trayPos(g, o); drawTri(c, { ...g, s: 40, h: 34.6, ox: 0, oy: 0 }, o, x, y, 0, 1); });
        P.txt(c, '받침', tx + 90, ty + 6, '#fbfcf9', '700 16px');
        P.txt(c, `사면체 ${s.n}`, W - 18, 34, '#fbfcf9', '800 20px', 'right');
        P.txt(c, `함께 쓰는 산소 ${s.shared}`, W - 18, 62, '#ffd84d', '800 20px', 'right');
        P.txt(c, `규소 : 산소 = ${s.n} : ${s.o}`, W - 18, 90, '#7fd1ff', '800 20px', 'right');
        if (s.name) P.txt(c, s.name, W - 18, 118, '#ffd84d', '700 16px', 'right');
        P.txt(c, '빨강 산소 · 하늘색 규소(위 산소가 겹쳐 보임) · 금빛 = 함께 쓰는 산소', 16, g.boardB + 4, 'rgba(190,210,255,.7)', '600 13px', 'left');
      },
      down(p) {
        const g = G(S.W, S.H);
        for (const o of ['u', 'd']) { const [x, y] = trayPos(g, o); if (Math.hypot(p.x - x, p.y - y) < 30) { const q = { o, i: 0, j: 0, x: p.x, y: p.y, x0: p.x, y0: p.y, born: t }; T.push(q); drag = { set: new Set([q]), sx: p.x, sy: p.y, dx: 0, dy: 0, fresh: true, q }; return; } }
        let hit = null, hd = 1e9; T.forEach((q) => { const d = Math.hypot(p.x - q.x, p.y - q.y); if (d < g.s * 0.55 && d < hd) { hd = d; hit = q; } });
        if (!hit) return;
        const set = comp(hit); set.forEach((q) => { q.x0 = q.x; q.y0 = q.y; });
        drag = { set, sx: p.x, sy: p.y, dx: 0, dy: 0, q: hit };
      },
      move(p, e, held) { if (held && drag) { drag.dx = p.x - drag.sx; drag.dy = p.y - drag.sy; } },
      up(p) {
        if (!drag) return; const g = G(S.W, S.H), d = drag; drag = null;
        if (p.y > g.boardB) { T = T.filter((q) => !d.set.has(q)); update(); return; } // 받침 쪽에 놓으면 치운다
        const [ci, cj] = nearest(g, d.q.o, d.q.x0 + d.dx, d.q.y0 + d.dy), di = ci - (d.fresh ? 0 : d.q.i), dj = cj - (d.fresh ? 0 : d.q.j);
        const faces = [...d.set].map((q) => [q.o, (d.fresh ? 0 : q.i) + di, (d.fresh ? 0 : q.j) + dj]);
        const bad = legal(faces, T.filter((q) => !d.set.has(q)));
        if (bad) {
          bounce = { x: p.x, y: p.y, a: 1, t: BOUNCE[bad][0] }; window.RxT.jolt(stage, 1); say(BOUNCE[bad][1]);
          if (d.fresh) T = T.filter((q) => !d.set.has(q)); else d.set.forEach((q) => { q.x = q.x0; q.y = q.y0; });
          return;
        }
        d.set.forEach((q) => { if (d.fresh) { q.i = di; q.j = dj; } else { q.i += di; q.j += dj; } q.x = q.x0 + d.dx; q.y = q.y0 + d.dy; });
        last = d.q;
        const mine = new Set([...d.set].flatMap((q) => VS(q.o, q.i, q.j).map(vk)));
        if (T.some((r) => !d.set.has(r) && VS(r.o, r.i, r.j).some((v) => mine.has(vk(v))))) { const [x, y] = cen(g, d.q.o, d.q.i, d.q.j); flash.push({ x, y, a: 1 }); window.RxT.jolt(stage, 1); }
        update();
      },
      key(e) { // N ▲를 아래 줄 오른쪽에 잇기 · U ▼를 그 위에 잇기 · Backspace 마지막 하나 빼기
        const k = e.key.toLowerCase();
        if (k === 'n') { const ups = T.filter((q) => q.o === 'u' && q.j === 0); const i = ups.length ? Math.max(...ups.map((q) => q.i)) + 1 : 0; place('u', i, 0); update(); return true; }
        if (k === 'u') { for (let i = -6; i <= 8; i++) if (place('d', i, 1)) break; update(); return true; }
        if (e.key === 'Backspace' && T.length) { T.pop(); last = T[T.length - 1] || null; update(); return true; }
        return false;
      },
    });
    function build(kind) {
      T = []; last = null;
      for (let i = -2; i < 3; i++) place('u', i, 0); // 한 줄 ▲
      if (kind === 'double') for (let i = -2; i < 2; i++) place('d', i, 1); // ▼가 위 꼭짓점과 서로의 위 꼭짓점을 나눔
      if (kind === 'sheet') { T = []; for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) { place('u', 2 * a, 2 * b); place('d', 2 * a - 1, 2 * b + 1); } } // 벌집 고리(판)
      const s = update(); S.kick(); return s.shape;
    }
    root.querySelector('.lk-reset')?.addEventListener('click', () => { T = []; last = null; ok.clear(); update(); S.kick(); });
    update();
    root._lk = { build, info: stats };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Link = { mount };
})();
