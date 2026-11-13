/* 2-1 4차시 표지 «젖은 손과 플러그»(교과서 68쪽 도입, 사건 파일 8). 위에 전지·전구 회로, 가운데 두 전극이 담긴 빈 받침.
   아래 방울 셋(증류수·수돗물·땀)을 끌어 받침에 떨어뜨리면 물이 차오르고, 녹아 있는 이온 알갱이가 흔들린다.
   증류수는 이온이 없어 전구가 꺼진 채, 수돗물은 희미하게, 땀은 밝게 켜지며 전선을 따라 전류 점이 흐른다. 숫자 1~3 키로도 떨어뜨린다.
   밝기 차이는 이해를 돕기 위한 예. Plug.mount(root) → { fit, setActive } · 시험용: root._pl.drop(0|1|2 또는 'pure'|'tap'|'sweat') */
(function () {
  'use strict';
  const D = [
    { k: 'pure', n: '증류수', ion: 0, lit: 0, col: '#cfe8ff', say: '증류수: 전구가 꺼진 채 — 녹아 있는 이온이 없다' },
    { k: 'tap', n: '수돗물', ion: 7, lit: 0.4, col: '#bfe0f5', say: '수돗물: 전구가 희미하게 켜진다 — 이온이 조금 녹아 있다' },
    { k: 'sweat', n: '땀', ion: 22, lit: 1, col: '#f3e6b8', say: '땀: 전구가 밝게 켜진다 — 염분(이온)이 많이 녹아 있다' },
  ];
  function mount(root) {
    const stage = root.querySelector('.pl-stage'), now = root.querySelector('.pl-now');
    const P = window.Play;
    let cur = -1, drag = null, fill = 0, flow = 0, lit = 0, t = 0; const tried = new Set();
    let ions = [];
    const G = (W, H) => {
      const dx = W * 0.5, dy = H * 0.6, dw = Math.min(W * 0.36, 260), dh = H * 0.2;
      const e1 = dx - dw * 0.22, e2 = dx + dw * 0.22, y0 = H * 0.24, y1 = H * 0.4;
      return { dx, dy, dw, dh, e1, e2, y0, y1, bx: W * 0.16, bulb: [W * 0.5, y0], drop: (i) => [W * (0.25 + i * 0.25), H * 0.84],
        path: [[e1, dy + dh * 0.1], [e1, y1], [W * 0.16, y1], [W * 0.16, y0], [W * 0.84, y0], [W * 0.84, y1], [e2, y1], [e2, dy + dh * 0.1]] };
    };
    function drop(i) {
      if (typeof i === 'string') i = D.findIndex((d) => d.k === i);
      cur = i; fill = 0; tried.add(i);
      ions = Array.from({ length: D[i].ion }, (_, k) => ({ q: k % 2 ? -1 : 1, u: Math.random(), v: Math.random(), p: Math.random() * 6 }));
      if (D[i].lit > 0.5 && window.RxT) window.RxT.jolt(stage, 1);
      S.kick();
    }
    function drawDrop(c, x, y, d, a) {
      c.save(); c.globalAlpha = a; c.fillStyle = d.col; c.strokeStyle = '#fbfcf9'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(x, y - 30); c.bezierCurveTo(x + 24, y - 2, x + 22, y + 22, x, y + 22); c.bezierCurveTo(x - 22, y + 22, x - 24, y - 2, x, y - 30); c.fill(); c.stroke();
      c.restore();
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const g = G(W, H), d = D[cur];
        fill = Math.min(1, fill + dt * 1.6);
        const want = d ? d.lit * fill : 0; lit += (want - lit) * Math.min(1, dt * 4); flow += dt * lit * 160;
        c.fillStyle = '#0f1630'; c.fillRect(0, 0, W, H);
        // 전선 + 전류 점
        c.strokeStyle = '#c9a25a'; c.lineWidth = 4; c.beginPath(); g.path.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
        if (lit > 0.05) {
          const seg = g.path.slice(1).map((p, i) => [g.path[i], p, Math.hypot(p[0] - g.path[i][0], p[1] - g.path[i][1])]); const L = seg.reduce((s, q) => s + q[2], 0);
          for (let s = flow % 36; s < L; s += 36) { let r = s; for (const [a, b, l] of seg) { if (r <= l) { const k = r / l; c.fillStyle = `rgba(255,216,77,${0.4 + lit * 0.6})`; c.beginPath(); c.arc(a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, 4, 0, Math.PI * 2); c.fill(); break; } r -= l; } }
        }
        // 전지
        c.fillStyle = '#16203f'; c.strokeStyle = '#fbfcf9'; c.lineWidth = 2; c.beginPath(); c.roundRect(g.bx - 18, (g.y0 + g.y1) / 2 - 26, 36, 52, 6); c.fill(); c.stroke();
        P.txt(c, '+', g.bx, (g.y0 + g.y1) / 2 - 6, '#ff8a7a', '800 18px'); P.txt(c, '−', g.bx, (g.y0 + g.y1) / 2 + 18, '#7fd1ff', '800 18px'); P.txt(c, '전지', g.bx - 34, (g.y0 + g.y1) / 2 + 6, '#fbfcf9', '700 15px', 'right');
        // 전구
        const [lx, ly] = g.bulb;
        if (lit > 0.02) P.glow(c, lx, ly, 30 + lit * 70, `rgba(255,216,77,${0.25 + lit * 0.6})`);
        c.fillStyle = lit > 0.02 ? `rgb(255,${200 + lit * 40},${80 + lit * 60})` : '#3a4468'; c.strokeStyle = '#fbfcf9'; c.beginPath(); c.arc(lx, ly, 18, 0, Math.PI * 2); c.fill(); c.stroke();
        P.txt(c, lit > 0.7 ? '밝게 켜짐' : lit > 0.1 ? '희미하게 켜짐' : '꺼짐', lx, ly + 42, lit > 0.1 ? '#ffd84d' : '#9aa6c8', '800 17px');
        // 받침과 물
        c.strokeStyle = '#fbfcf9'; c.lineWidth = 3; c.beginPath(); c.moveTo(g.dx - g.dw / 2, g.dy - g.dh / 2); c.lineTo(g.dx - g.dw / 2 + 14, g.dy + g.dh / 2); c.lineTo(g.dx + g.dw / 2 - 14, g.dy + g.dh / 2); c.lineTo(g.dx + g.dw / 2, g.dy - g.dh / 2); c.stroke();
        if (d) {
          const top = g.dy + g.dh / 2 - g.dh * 0.8 * fill; c.fillStyle = d.col + '99'; c.fillRect(g.dx - g.dw / 2 + 10, top, g.dw - 20, g.dy + g.dh / 2 - top - 2);
          ions.forEach((o) => { const x = g.dx - g.dw / 2 + 18 + o.u * (g.dw - 36) + Math.sin(t * 3 + o.p) * 4, y = top + 8 + o.v * Math.max(0, g.dy + g.dh / 2 - top - 16) + Math.cos(t * 2.6 + o.p) * 3; c.fillStyle = o.q > 0 ? '#ff8a7a' : '#7fd1ff'; c.beginPath(); c.arc(x, y, 6, 0, Math.PI * 2); c.fill(); P.txt(c, o.q > 0 ? '+' : '−', x, y + 4, '#0f1630', '800 11px'); });
          P.txt(c, d.n, g.dx, g.dy - g.dh / 2 - 12, '#fbfcf9', '800 18px');
        } else P.txt(c, '여기에 떨어뜨리기', g.dx, g.dy + 6, 'rgba(251,252,249,.6)', '600 15px');
        [g.e1, g.e2].forEach((x) => { c.fillStyle = '#a7adb5'; c.fillRect(x - 4, g.y1, 8, g.dy + g.dh * 0.1 - g.y1); });
        // 방울 셋
        D.forEach((q, i) => { const [x, y] = g.drop(i); drawDrop(c, x, y, q, drag && drag.i === i ? 0.3 : 1); P.txt(c, `${i + 1} ${q.n}`, x, y + 46, cur === i ? '#ffd84d' : '#fbfcf9', '800 17px'); });
        if (drag) drawDrop(c, drag.x, drag.y, D[drag.i], 1);
        const nt = cur < 0 ? '방울을 끌어 받침에 떨어뜨려 보자' : tried.size < 3 ? `${D[cur].say} · 다른 방울도` : D[cur].say;
        if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', tried.size === 3); }
      },
      down(p) { const g = G(S.W, S.H); const i = D.findIndex((_, k) => { const [x, y] = g.drop(k); return Math.hypot(p.x - x, p.y - y) < 36; }); if (i >= 0) drag = { i, x: p.x, y: p.y }; },
      move(p, e, held) { if (held && drag) { drag.x = p.x; drag.y = p.y; } },
      up(p) { if (!drag) return; const g = G(S.W, S.H), i = drag.i; drag = null; if (Math.abs(p.x - g.dx) < g.dw / 2 + 20 && Math.abs(p.y - g.dy) < g.dh / 2 + 50) drop(i); },
      key(e) { const i = '123'.indexOf(e.key); if (i >= 0) { drop(i); return true; } return false; },
    });
    root._pl = { drop };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Plug = { mount };
})();
