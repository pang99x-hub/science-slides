/* 2-1 1차시 이론 «별빛으로 알아낸 우주의 원소»(교과서 49·52쪽 + 참고서 33쪽, 도플러 효과는 다른 교과서 내용).
   왼쪽 별의 대기 속을 수소(빨강)·헬륨(파랑) 원자가 떠다닌다. 아래 주머니에서 원자를 끌어 대기에 넣거나 대기에서 끌어내면
   오른쪽 흡수 스펙트럼의 수소·헬륨 선 굵기와 고리 그래프가 바로 바뀐다(선의 세기 → 질량비). 수소 약 74 %면 «실제 우주».
   별 몸통을 잡고 좌우로 흔들면 망원경(오른쪽)에서 멀어질 때 선이 빨강 쪽, 다가올 때 보라 쪽으로 밀린다(도플러 효과). 놓으면 제자리.
   선 굵기·밀림 크기는 이해를 돕기 위한 단순화. Abund.mount(root) → { fit, setActive } · 시험용: root._ab.set(수소 %) · move(속도) */
(function () {
  'use strict';
  function mount(root) {
    const stage = root.querySelector('.ab-stage'), out = root.querySelector('.ab-out'), now = root.querySelector('.ab-now');
    const P = window.Play, Sp = () => window.Spec;
    let atoms = [], carry = null, starDrag = null, sx = 0, vx = 0, lastX = 0, seenShift = false, hit74 = false, moved = false;
    const mk = (k) => ({ k, a: Math.random() * 6.28, r: 0.8 + Math.random() * 0.35, w: 0.3 + Math.random() * 0.5 });
    for (let i = 0; i < 20; i++) atoms.push(mk(i < 10 ? 'H' : 'He'));
    const frac = () => { const h = atoms.filter((a) => a.k === 'H').length; return Math.round(h / (atoms.length || 1) * 100); };
    const G = (W, H) => ({ cx: W * 0.22 + sx, cy: H * 0.4, R: Math.min(W * 0.13, H * 0.2), bx: W * 0.5, bw: W * 0.47, by: H * 0.1, pile: { H: [W * 0.1, H * 0.86], He: [W * 0.3, H * 0.86] } });
    function steps() {
      const ok = []; if (moved) ok.push(1); if (hit74) ok.push(2); if (seenShift) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 아래 주머니의 원자를 끌어 별 대기에 넣자' : st === 2 ? '② 수소를 74 % 쯤으로 맞춰 보자' : st === 3 ? '③ 별을 잡고 좌우로 흔들어 보자' : '선의 자리·세기·밀림이 별을 알려 준다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        if (!starDrag) { vx += (-sx * 20 - vx * 6) * dt; sx += vx * dt; }
        const g = G(W, H), h = frac(), he = 100 - h, shift = Math.max(-12, Math.min(12, -vx / 25));
        if (Math.abs(shift) > 4) seenShift = true; if (Math.abs(h - 74) <= 3 && moved) hit74 = true;
        c.fillStyle = '#0f1630'; c.fillRect(0, 0, W, H);
        c.fillStyle = '#cfd6e6'; c.beginPath(); c.moveTo(W * 0.38, g.cy - 14); c.lineTo(W * 0.41, g.cy - 26); c.lineTo(W * 0.41, g.cy + 26); c.lineTo(W * 0.38, g.cy + 14); c.closePath(); c.fill();
        P.txt(c, '망원경', W * 0.395, g.cy + 50, '#cfd6e6', '700 18px');
        P.glow(c, g.cx, g.cy, g.R * 1.5, 'rgba(160,200,255,.25)');
        c.fillStyle = '#ffd36a'; c.beginPath(); c.arc(g.cx, g.cy, g.R * 0.7, 0, Math.PI * 2); c.fill();
        c.strokeStyle = 'rgba(160,200,255,.4)'; c.lineWidth = 2; c.beginPath(); c.arc(g.cx, g.cy, g.R * 1.2, 0, Math.PI * 2); c.stroke();
        atoms.forEach((a) => { a.a += a.w * dt; const x = g.cx + Math.cos(a.a) * a.r * g.R, y = g.cy + Math.sin(a.a) * a.r * g.R; c.fillStyle = a.k === 'H' ? '#ef5b4c' : '#5aa9f0'; c.beginPath(); c.arc(x, y, 7, 0, Math.PI * 2); c.fill(); });
        P.txt(c, '별의 대기', g.cx, g.cy - g.R * 1.3, '#cfd6e6', '700 19px');
        if (Math.abs(vx) > 60) P.txt(c, vx < 0 ? '← 망원경에서 멀어진다' : '망원경으로 다가온다 →', g.cx, g.cy + g.R * 1.55, vx < 0 ? '#ff8a7a' : '#7fd1ff', '800 20px');
        [['H', '수소 원자'], ['He', '헬륨 원자']].forEach(([k, n]) => { const [x, y] = g.pile[k]; c.fillStyle = '#16203f'; c.strokeStyle = '#5a6a90'; c.lineWidth = 2; c.beginPath(); c.roundRect(x - 60, y - 34, 120, 68, 14); c.fill(); c.stroke(); for (let i = 0; i < 6; i++) { c.fillStyle = k === 'H' ? '#ef5b4c' : '#5aa9f0'; c.beginPath(); c.arc(x - 40 + i * 16, y - 6, 6, 0, Math.PI * 2); c.fill(); } P.txt(c, n, x, y + 24, '#fbfcf9', '700 18px'); });
        if (carry) { c.fillStyle = carry.k === 'H' ? '#ef5b4c' : '#5aa9f0'; for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(carry.x + i * 10 - 10, carry.y + (i % 2) * 8, 7, 0, Math.PI * 2); c.fill(); } }
        const wH = 1.5 + h / 9, wHe = 1.5 + he / 9, bh = H * 0.13;
        Sp().band(c, g.bx, g.by, g.bw, bh, { mode: 'cont', lines: [] });
        [...Sp().LINES.H.map(([nm]) => [nm, wH]), ...Sp().LINES.He.map(([nm]) => [nm, wHe])].forEach(([nm, wd]) => { const x = Sp().xOf(nm + shift, g.bx, g.bw); c.fillStyle = 'rgba(0,0,0,.92)'; c.fillRect(x - wd / 2, g.by, wd, bh); });
        c.strokeStyle = '#fbfcf9'; c.lineWidth = 2; c.strokeRect(g.bx, g.by, g.bw, bh); Sp().scale(c, g.bx, g.by + bh + 2, g.bw, '#b9c2d8');
        P.txt(c, '별빛의 흡수 스펙트럼', g.bx, g.by - 10, '#fbfcf9', '700 19px', 'left');
        [['H', '수소', H * 0.31], ['He', '헬륨', H * 0.39]].forEach(([k, n, y]) => { Sp().band(c, g.bx, y, g.bw, H * 0.06, { mode: 'emit', lines: Sp().LINES[k], glow: false }); P.txt(c, n, g.bx - 8, y + H * 0.045, '#fbfcf9', '700 18px', 'right'); });
        const dx = g.bx + g.bw * 0.35, dy = H * 0.72, dr = Math.min(W * 0.08, H * 0.16); let a0 = -Math.PI / 2;
        [[h, '#ef5b4c'], [he, '#5aa9f0']].forEach(([v, col]) => { const da = v / 100 * Math.PI * 2; c.fillStyle = col; c.beginPath(); c.moveTo(dx, dy); c.arc(dx, dy, dr, a0, a0 + da); c.closePath(); c.fill(); a0 += da; });
        c.fillStyle = '#0f1630'; c.beginPath(); c.arc(dx, dy, dr * 0.55, 0, Math.PI * 2); c.fill();
        P.txt(c, `수소 ${h}%`, dx, dy + 2, '#fbfcf9', '800 19px'); P.txt(c, `헬륨 ${he}%`, dx, dy + 24, '#9fd3ff', '700 16px');
        if (Math.abs(h - 74) <= 3) P.txt(c, '실제 우주와 비슷!', dx + dr + 14, dy, '#ffd84d', '800 21px', 'left');
        const msg = Math.abs(shift) > 4 ? `별이 ${shift > 0 ? '<b>멀어지면</b> 선이 빨강 쪽' : '<b>다가오면</b> 선이 보라 쪽'}으로 함께 밀린다 — <b>도플러 효과</b>` : Math.abs(h - 74) <= 3 ? '<b>실제 우주</b>: 수소 약 74 %, 헬륨 약 24 % → 질량비 약 <b>3 : 1</b>' : `수소 ${h} % — 많을수록 수소 흡수선이 <b>굵고 진하다</b>`;
        if (out.innerHTML !== msg) out.innerHTML = msg;
        steps();
      },
      down(p) {
        const g = G(S.W, S.H);
        for (const k of ['H', 'He']) { const [x, y] = g.pile[k]; if (Math.abs(p.x - x) < 60 && Math.abs(p.y - y) < 34) { carry = { k, x: p.x, y: p.y, from: 'pile' }; return; } }
        const i = atoms.findIndex((a) => Math.hypot(g.cx + Math.cos(a.a) * a.r * g.R - p.x, g.cy + Math.sin(a.a) * a.r * g.R - p.y) < 14);
        if (i >= 0) { const a = atoms.splice(i, 1)[0]; carry = { k: a.k, x: p.x, y: p.y, from: 'star' }; moved = true; return; }
        if (Math.hypot(p.x - g.cx, p.y - g.cy) < g.R * 0.8) { starDrag = true; lastX = p.x; }
      },
      move(p, e, held) {
        if (!held) return;
        if (carry) { carry.x = p.x; carry.y = p.y; }
        else if (starDrag) { const d = p.x - lastX; vx = d / 0.016; sx = Math.max(-S.W * 0.12, Math.min(S.W * 0.12, sx + d)); lastX = p.x; }
      },
      up(p) {
        const g = G(S.W, S.H);
        if (carry && carry.from === 'star' && Math.hypot(p.x - g.cx, p.y - g.cy) < g.R * 1.4) atoms.push(mk(carry.k));
        if (carry && carry.from === 'pile' && Math.hypot(p.x - g.cx, p.y - g.cy) < g.R * 1.4) { for (let i = 0; i < 3; i++) atoms.push(mk(carry.k)); moved = true; if (atoms.length > 90) atoms.splice(0, atoms.length - 90); }
        carry = null; starDrag = null;
      },
      key(e) { if (e.key === 'h') { atoms.push(mk('H')); moved = true; return true; } if (e.key === 'e') { atoms.push(mk('He')); moved = true; return true; } if (e.key === 'ArrowLeft') { vx = -500; return true; } if (e.key === 'ArrowRight') { vx = 500; return true; } return false; },
    });
    root._ab = { set: (h) => { atoms = []; for (let i = 0; i < 50; i++) atoms.push(mk(i < h / 2 ? 'H' : 'He')); moved = true; S.kick(); }, move: (v) => { vx = v; S.kick(); } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Abund = { mount };
})();
