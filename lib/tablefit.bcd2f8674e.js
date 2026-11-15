/* 2-1 3차시 체험 «원자 모형을 주기율표에 붙이기»(교과서 64쪽 해 보기 과정 4). 아래에 이름 없는 원자 모형 카드 열 장.
   카드를 끌어 위 주기율표(1~4주기 × 1·2·13~18족)의 칸에 놓는다. 맞는 칸이면 딱 붙고 원소 기호가 드러난다.
   틀리면 튕겨 나오며 «껍질 n개 → n주기, 바깥 전자 m개 → 족» 힌트. 다 붙이면 같은 세로줄의 바깥 전자 수가 같다는 것이 보인다.
   TableFit.mount(root) → { fit, setActive } · 시험용: root._tf.place(z) */
(function () {
  'use strict';
  const Z = [3, 6, 8, 10, 11, 12, 15, 17, 19, 2];
  const COLS = [1, 2, 13, 14, 15, 16, 17, 18];
  function mount(root) {
    const stage = root.querySelector('.tf-stage'), now = root.querySelector('.tf-now'), out = root.querySelector('.tf-out');
    const P = window.Play, E = () => window.Elem;
    const cards = Z.map((z, i) => ({ z, i, placed: false, x: 0, y: 0, bad: 0 }));
    let drag = null;
    const G = (W, H) => { const cw = Math.min(88, (W - 80) / 8), ch = Math.min(82, H * 0.13); return { cw, ch, x0: (W - cw * 8) / 2, y0: 40, home: (i) => [W * (0.14 + (i % 5) * 0.18), H * (0.75 + Math.floor(i / 5) * 0.15)] }; };
    const cellOf = (g, z) => { const e = E().get(z); return [g.x0 + COLS.indexOf(e.g) * g.cw, g.y0 + (e.p - 1) * g.ch]; };
    function mini(c, x, y, z, R) {
      const sh = E().shells(z);
      c.fillStyle = '#e0503f'; c.beginPath(); c.arc(x, y, R * 0.18, 0, Math.PI * 2); c.fill();
      sh.forEach((m, i) => { const r = R * (0.32 + i * 0.22); c.strokeStyle = 'rgba(29,36,51,.5)'; c.lineWidth = 1; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.stroke(); for (let k = 0; k < m; k++) { const a = k / m * Math.PI * 2 - Math.PI / 2; c.fillStyle = i === sh.length - 1 ? '#2a73b8' : '#7fa9d6'; c.beginPath(); c.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, Math.max(2.5, R * 0.06), 0, Math.PI * 2); c.fill(); } });
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        const g = G(W, H);
        c.fillStyle = '#fbfaf5'; c.fillRect(0, 0, W, H);
        COLS.forEach((col, i) => P.txt(c, `${col}족`, g.x0 + (i + 0.5) * g.cw, g.y0 - 8, '#4a5468', '700 15px'));
        for (let p = 1; p <= 4; p++) { P.txt(c, `${p}주기`, g.x0 - 8, g.y0 + (p - 0.45) * g.ch, '#4a5468', '700 15px', 'right'); for (let i = 0; i < 8; i++) { c.strokeStyle = '#c3cbd3'; c.lineWidth = 1.5; c.strokeRect(g.x0 + i * g.cw, g.y0 + (p - 1) * g.ch, g.cw, g.ch); } }
        cards.forEach((k) => {
          let x, y;
          if (k === drag) { x = drag.x; y = drag.y; } else if (k.placed) { const [cx, cy] = cellOf(g, k.z); x = cx + g.cw / 2; y = cy + g.ch / 2; } else { [x, y] = g.home(k.i); if (k.bad > 0) { x += Math.sin(k.bad * 40) * 8; k.bad -= dt; } }
          const R = Math.min(g.cw, g.ch) * 0.48;
          c.fillStyle = k.placed ? '#fff7d6' : '#fff'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.roundRect(x - g.cw / 2 + 3, y - g.ch / 2 + 3, g.cw - 6, g.ch - 6, 8); c.fill(); c.stroke();
          mini(c, x, y, k.z, R);
          if (k.placed) P.txt(c, E().get(k.z).s, x + g.cw / 2 - 8, y - g.ch / 2 + 20, '#c0392b', '800 18px', 'right');
        });
        const left = cards.filter((k) => !k.placed).length;
        const nt = left ? `원자 모형 카드를 끌어 알맞은 칸에 붙이자(남은 ${left}장)` : '같은 세로줄 = 바깥 전자 수가 같다!';
        if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', !left); }
        const ok = []; if (cards.some((k) => k.placed)) ok.push(1); if (cards.filter((k) => k.placed).length >= 5) ok.push(2); if (!left) ok.push(3);
        const st = [1, 2, 3].find((q) => !ok.includes(q)) || 0; window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      },
      down(p) { const g = G(S.W, S.H); drag = cards.find((k) => { if (k.placed) return false; const [x, y] = g.home(k.i); return Math.abs(p.x - x) < g.cw / 2 && Math.abs(p.y - y) < g.ch / 2; }) || null; if (drag) { drag.x = p.x; drag.y = p.y; } },
      move(p, e, held) { if (held && drag) { drag.x = p.x; drag.y = p.y; } },
      up(p) {
        if (!drag) return; const g = G(S.W, S.H), k = drag; drag = null;
        const col = Math.floor((p.x - g.x0) / g.cw), row = Math.floor((p.y - g.y0) / g.ch);
        if (col < 0 || col > 7 || row < 0 || row > 3) return;
        const e = E().get(k.z), sh = E().shells(k.z);
        if (COLS[col] === e.g && row + 1 === e.p) { k.placed = true; window.RxT.jolt(stage, 1); out.innerHTML = `<b>${e.n}(${e.s})</b> 껍질 ${sh.length}개 → <b>${e.p}주기</b>, 바깥 전자 ${sh[sh.length - 1]}개 → <b>${e.g}족</b>${e.g === 18 ? ' (18족은 바깥 껍질이 꽉 차 원자가 전자 0)' : ''}`; }
        else { k.bad = 0.5; out.innerHTML = `튕겼다 — 힌트: 전자가 든 <b>껍질 수 = 주기</b>, <b>바깥 껍질 전자 수 = 족</b>(1·2족은 그대로, 3개 이상이면 10을 더해 13~17족, 꽉 차면 18족)`; }
      },
    });
    root._tf = { place: (z) => { const k = cards.find((q) => q.z === z); k.placed = true; S.kick(); } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.TableFit = { mount };
})();
