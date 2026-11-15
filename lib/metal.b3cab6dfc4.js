/* 2-1 3차시 체험 «금속과 비금속 실험대»(교과서 61쪽 + 참고서 64쪽). 아래 시료(구리 선·철 못·알루미늄 포일·황 덩어리·흑연 연필심)를
   끌어 «전기 회로»의 집게 사이에 놓으면 전기가 통할 때 전구가 켜지고, «모루» 위에 놓은 뒤 망치를 끌어 내리치면
   금속은 납작하게 펴지고 황·흑연은 부서져 튄다(흔들림). 오른쪽 표에 결과가 채워진다. 흑연(탄소)은 비금속이지만 전기가 통한다(예외).
   Metal.mount(root) → { fit, setActive } · 시험용: root._mt.test(시료, 'c'|'h') */
(function () {
  'use strict';
  const SM = [['cu', '구리 선', '#d9874a', 1, 1], ['fe', '철 못', '#9aa3ad', 1, 1], ['al', '알루미늄 포일', '#d9dde3', 1, 1], ['s', '황 덩어리', '#f2d43c', 0, 0], ['c', '흑연 연필심', '#3d4250', 1, 0]];
  function mount(root) {
    const stage = root.querySelector('.mt-stage'), now = root.querySelector('.mt-now'), tbl = root.querySelector('.mt-table'), out = root.querySelector('.mt-out');
    const P = window.Play;
    const it = SM.map(([k, n, col, el, mall], i) => ({ k, n, col, el, mall, home: i, at: null, flat: 0, broken: false, x: 0, y: 0 }));
    let drag = null, hammer = null, hamY = 0, bits = [], res = {};
    const G = (W, H) => ({ circ: [W * 0.25, H * 0.42], anvil: [W * 0.72, H * 0.5], home: (i) => [W * (0.1 + i * 0.2), H * 0.86], hx: W * 0.72 });
    const pos = (g, o) => (o === drag ? [o.x, o.y] : o.at === 'c' ? g.circ : o.at === 'h' ? g.anvil : g.home(o.home));
    function record(o, t, v) {
      res[o.k] = res[o.k] || {}; res[o.k][t] = v;
      const td = tbl.querySelector(`tr[data-k="${o.k}"] td.${t}`); if (td) { td.textContent = v; td.className = t + (v.startsWith('통') || v.startsWith('펴') ? ' ok' : ' no'); }
      const done = Object.keys(res).length, both = Object.values(res).filter((r) => r.c && r.h).length;
      const ok = []; if (Object.values(res).some((r) => r.c)) ok.push(1); if (Object.values(res).some((r) => r.h)) ok.push(2); if (both >= 3 && res.c && res.c.c) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      void done;
    }
    function steps() {
      const st = !Object.values(res).some((r) => r.c) ? 1 : !Object.values(res).some((r) => r.h) ? 2 : 3;
      const nt = st === 1 ? '① 시료를 끌어 전기 회로 집게 사이에 놓자' : st === 2 ? '② 시료를 모루에 놓고 망치를 끌어 내리치자' : '흑연 연필심도 회로에 꼭 놓아 보자';
      if (now.textContent !== nt) now.textContent = nt;
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        const g = G(W, H);
        c.fillStyle = '#efe7d6'; c.fillRect(0, 0, W, H); c.fillStyle = '#d7c7a6'; c.fillRect(0, H * 0.74, W, H * 0.26);
        // 전기 회로: 전지, 전구, 집게
        const [cx, cy] = g.circ, onC = it.find((o) => o.at === 'c'), lit = onC && onC.el;
        c.strokeStyle = '#1d2433'; c.lineWidth = 4; c.beginPath(); c.moveTo(cx - 90, cy); c.lineTo(cx - 90, cy - 110); c.lineTo(cx + 90, cy - 110); c.lineTo(cx + 90, cy); c.stroke();
        c.fillStyle = '#5a6270'; c.fillRect(cx - 110, cy - 60, 40, 70); P.txt(c, '전지', cx - 90, cy + 32, '#1d2433', '700 18px');
        if (lit) P.glow(c, cx, cy - 110, 70, 'rgba(255,240,150,.95)');
        c.fillStyle = lit ? '#fff3a0' : '#e8ecf1'; c.strokeStyle = '#1d2433'; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy - 120, 22, 0, Math.PI * 2); c.fill(); c.stroke();
        P.txt(c, '전구', cx, cy - 150, '#1d2433', '700 18px');
        c.fillStyle = '#c0392b'; c.fillRect(cx - 50, cy - 8, 18, 16); c.fillStyle = '#1d2433'; c.fillRect(cx + 32, cy - 8, 18, 16);
        P.txt(c, '전기 회로 — 집게 사이에 놓기', cx, cy + 60, '#4a5468', '700 18px');
        // 모루와 망치
        const [ax, ay] = g.anvil;
        c.fillStyle = '#4a5468'; c.beginPath(); c.moveTo(ax - 70, ay + 20); c.lineTo(ax + 70, ay + 20); c.lineTo(ax + 50, ay + 60); c.lineTo(ax - 50, ay + 60); c.closePath(); c.fill(); c.fillRect(ax - 30, ay + 60, 60, 40);
        P.txt(c, '모루 — 놓고 망치로 내리치기', ax, ay + 124, '#4a5468', '700 18px');
        const hy = hammer ? hamY : ay - 150;
        c.fillStyle = '#7a4a2a'; c.fillRect(ax + 10, hy - 90, 12, 100); c.fillStyle = '#5a6270'; c.fillRect(ax - 30, hy, 70, 34);
        P.txt(c, '망치 ↕', ax + 70, hy + 22, '#1d2433', '800 18px', 'left');
        // 부서진 조각
        bits.forEach((b) => { b.x += b.vx * dt; b.y += b.vy * dt; b.vy += 600 * dt; b.life -= dt; c.fillStyle = b.col; c.fillRect(b.x, b.y, 5, 5); }); bits = bits.filter((b) => b.life > 0);
        // 시료
        it.forEach((o) => {
          if (o.broken && o.at === 'h') return;
          const [x, y] = pos(g, o), w = 70 * (1 + o.flat * 0.6), h = 22 * (1 - o.flat * 0.6);
          c.fillStyle = o.col; c.strokeStyle = '#1d2433'; c.lineWidth = 2;
          if (o.k === 's') { c.beginPath(); c.moveTo(x - 30, y + 10); c.lineTo(x - 18, y - 16); c.lineTo(x + 12, y - 18); c.lineTo(x + 30, y + 6); c.lineTo(x + 6, y + 16); c.closePath(); c.fill(); c.stroke(); }
          else { c.fillRect(x - w / 2, y - h / 2, w, h); c.strokeRect(x - w / 2, y - h / 2, w, h); if (o.k !== 'c' && o.k !== 's') { c.fillStyle = 'rgba(255,255,255,.6)'; c.fillRect(x - w / 2 + 4, y - h / 2 + 3, w * 0.5, 3); } }
          if (o.at == null || o === drag) P.txt(c, o.n, x, y + 34, '#1d2433', '700 17px');
        });
        steps();
      },
      down(p) {
        const g = G(S.W, S.H), [ax, ay] = g.anvil;
        if (Math.abs(p.x - ax) < 60 && p.y < ay - 20) { hammer = true; hamY = Math.min(ay - 40, p.y); return; }
        drag = it.find((o) => { const [x, y] = pos(g, o); return !o.broken && Math.abs(p.x - x) < 45 && Math.abs(p.y - y) < 30; }) || null;
        if (drag) { drag.x = p.x; drag.y = p.y; drag.at = null; }
      },
      move(p, e, held) {
        if (!held) return; const g = G(S.W, S.H), [ax, ay] = g.anvil;
        if (hammer) { hamY = Math.min(ay - 40, p.y); const o = it.find((q) => q.at === 'h'); if (o && hamY >= ay - 42 && !o.hit) { o.hit = true; window.RxT.jolt(stage, 2); if (o.mall) { o.flat = Math.min(1, o.flat + 0.5); record(o, 'h', '펴진다'); out.innerHTML = `<b>${o.n}</b>: 부서지지 않고 납작하게 <b>펴진다</b> — 금속`; } else { o.broken = true; for (let i = 0; i < 30; i++) bits.push({ x: ax, y: ay, vx: (Math.random() - 0.5) * 400, vy: -Math.random() * 300, col: o.col, life: 1 }); record(o, 'h', '부서진다'); out.innerHTML = `<b>${o.n}</b>: <b>부서져</b> 튄다 — 비금속`; } } if (hamY < ay - 80) it.forEach((q) => { q.hit = false; }); }
        else if (drag) { drag.x = p.x; drag.y = p.y; }
      },
      up(p) {
        const g = G(S.W, S.H);
        if (hammer) { hammer = null; return; }
        if (!drag) return;
        const near = (q) => Math.hypot(p.x - q[0], p.y - q[1]) < 80;
        if (near(g.circ)) { it.forEach((o) => { if (o.at === 'c') o.at = null; }); drag.at = 'c'; record(drag, 'c', drag.el ? '통한다' : '안 통한다'); out.innerHTML = drag.el ? `<b>${drag.n}</b>: 전구가 켜진다 — 전기가 <b>통한다</b>${drag.k === 'c' ? ' <small>탄소는 비금속인데 흑연은 예외!</small>' : ''}` : `<b>${drag.n}</b>: 전구가 꺼져 있다 — 전기가 <b>통하지 않는다</b>`; }
        else if (near(g.anvil)) { it.forEach((o) => { if (o.at === 'h') o.at = null; }); drag.at = 'h'; }
        drag = null;
      },
    });
    root.querySelector('.mt-reset').addEventListener('click', () => { it.forEach((o) => { o.at = null; o.flat = 0; o.broken = false; }); S.kick(); });
    root._mt = { test: (k, t) => { const o = it.find((q) => q.k === k); if (t === 'c') { it.forEach((q) => { if (q.at === 'c') q.at = null; }); o.at = 'c'; record(o, 'c', o.el ? '통한다' : '안 통한다'); } else { o.at = 'h'; if (o.mall) { o.flat = 1; record(o, 'h', '펴진다'); } else { o.broken = true; record(o, 'h', '부서진다'); } } S.kick(); } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Metal = { mount };
})();
