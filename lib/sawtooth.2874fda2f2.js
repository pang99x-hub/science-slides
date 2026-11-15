/* 2-1 3차시 이론 «원자가 전자와 주기성»(교과서 65쪽 + 참고서 69쪽). 펜을 끌어 원자 번호 축을 따라 오른쪽으로 가면
   지나는 원자의 원자가 전자 수가 점으로 찍히며 그래프가 그려진다(18족은 0). 펜 위에는 그 원자의 전자 배치가 보인다.
   1→2, 3→10, 11→18 마다 톱니처럼 되풀이 = 주기성. 같은 높이의 점(같은 족)은 성질이 비슷하다.
   Sawtooth.mount(root) → { fit, setActive } · 시험용: root._sw.to(z) */
(function () {
  'use strict';
  function mount(root) {
    const stage = root.querySelector('.sw-stage'), now = root.querySelector('.sw-now'), out = root.querySelector('.sw-out');
    const P = window.Play, E = () => window.Elem;
    let z = 1, maxZ = 1, drag = false, msg = '';
    const G = (W, H) => ({ x0: 70, x1: W - 30, y0: H - 60, y1: H * 0.36 });
    const X = (g, k) => g.x0 + (k - 1) / 19 * (g.x1 - g.x0), Y = (g, v) => g.y0 - v / 8 * (g.y0 - g.y1);
    const S = P.make(stage, {
      draw(c, W, H) {
        const g = G(W, H);
        c.fillStyle = '#fbfaf5'; c.fillRect(0, 0, W, H);
        [[1, 2, '1주기'], [3, 10, '2주기'], [11, 18, '3주기'], [19, 20, '4주기']].forEach(([a, b, n], i) => { c.fillStyle = i % 2 ? 'rgba(90,169,240,.08)' : 'rgba(242,178,28,.08)'; c.fillRect(X(g, a) - 12, g.y1 - 20, X(g, b) - X(g, a) + 24, g.y0 - g.y1 + 20); P.txt(c, n, (X(g, a) + X(g, b)) / 2, g.y0 + 46, '#4a5468', '700 15px'); });
        c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.moveTo(g.x0 - 20, g.y0); c.lineTo(g.x1 + 10, g.y0); c.moveTo(g.x0 - 20, g.y0); c.lineTo(g.x0 - 20, g.y1 - 20); c.stroke();
        for (let v = 0; v <= 8; v += 2) { P.txt(c, String(v), g.x0 - 30, Y(g, v) + 5, '#4a5468', '600 14px', 'right'); }
        P.txt(c, '원자가 전자 수', g.x0 - 20, g.y1 - 30, '#1d2433', '700 15px', 'left');
        for (let k = 1; k <= 20; k++) P.txt(c, String(k), X(g, k), g.y0 + 20, k <= maxZ ? '#1d2433' : '#c3cbd3', '600 13px');
        c.strokeStyle = '#2a73b8'; c.lineWidth = 3; c.beginPath();
        for (let k = 1; k <= maxZ; k++) { const x = X(g, k), y = Y(g, E().valence(k)); k === 1 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke();
        for (let k = 1; k <= maxZ; k++) { const e = E().get(k), x = X(g, k), y = Y(g, E().valence(k)); c.fillStyle = e.g === 1 && k > 1 ? '#ef5b4c' : e.g === 17 ? '#5cc77a' : e.g === 18 ? '#5aa9f0' : '#2a73b8'; c.beginPath(); c.arc(x, y, 7, 0, Math.PI * 2); c.fill(); P.txt(c, e.s, x, y - 12, '#1d2433', '700 13px'); }
        // 펜과 원자 모형
        const px = X(g, z), py = Y(g, E().valence(z));
        c.fillStyle = '#ffd84d'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.moveTo(px, py); c.lineTo(px + 12, py - 30); c.lineTo(px + 22, py - 26); c.closePath(); c.fill(); c.stroke();
        const ax = Math.min(W - 90, Math.max(90, px)), ay = g.y1 * 0.5, sh = E().shells(z);
        c.fillStyle = '#e0503f'; c.beginPath(); c.arc(ax, ay, 9, 0, Math.PI * 2); c.fill();
        sh.forEach((m, i) => { const r = 18 + i * 14; c.strokeStyle = 'rgba(29,36,51,.4)'; c.lineWidth = 1; c.beginPath(); c.arc(ax, ay, r, 0, Math.PI * 2); c.stroke(); for (let k = 0; k < m; k++) { const a = k / m * Math.PI * 2; c.fillStyle = i === sh.length - 1 && E().valence(z) ? '#f2b21c' : '#2a73b8'; c.beginPath(); c.arc(ax + Math.cos(a) * r, ay + Math.sin(a) * r, 4, 0, Math.PI * 2); c.fill(); } });
        const e = E().get(z), h = `<b>${z} ${e.n}</b> · 원자가 전자 <b>${E().valence(z)}</b>${e.g === 18 ? '(18족 → 0)' : ''} · ${e.p}주기 ${e.g}족`;
        if (h !== msg) { msg = h; out.innerHTML = h; }
        const ok = []; if (maxZ >= 10) ok.push(1); if (maxZ >= 20) ok.push(2); if (maxZ >= 20) ok.push(3);
        const st = [1, 2, 3].find((q) => !ok.includes(q)) || 0; window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
        const nt = maxZ < 20 ? '노란 펜을 끌어 오른쪽으로 그래프를 그리자' : '톱니처럼 되풀이 = 주기성! 같은 높이 = 같은 족';
        if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', maxZ >= 20); }
      },
      down(p) { drag = true; this.move(p, null, true); },
      move(p, e, held) { if (!held || !drag) return; const g = G(S.W, S.H); z = Math.max(1, Math.min(20, Math.round((p.x - g.x0) / (g.x1 - g.x0) * 19) + 1)); maxZ = Math.max(maxZ, z); },
      up() { drag = false; },
      key(e) { if (e.key === 'ArrowRight') { z = Math.min(20, z + 1); maxZ = Math.max(maxZ, z); return true; } if (e.key === 'ArrowLeft') { z = Math.max(1, z - 1); return true; } return false; },
    });
    root._sw = { to: (k) => { z = k; maxZ = Math.max(maxZ, k); S.kick(); } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Sawtooth = { mount };
})();
