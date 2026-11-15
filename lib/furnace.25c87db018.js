/* 2-1 2차시 표지 «연금술사의 실패»(교과서 54쪽 도입). 왼쪽 풀무 손잡이를 위아래로 끌어(또는 스페이스 키) 바람을 넣으면
   불꽃이 커지고 불똥이 튀며 화로 온도가 오른다. 가만두면 식는다. 납은 327 °C에서 녹아 출렁이고 1749 °C에서 끓어 김이 오르지만
   끝까지 납(Pb). 오른쪽 온도계 맨 위 «별 중심 1000만 K»은 화로로는 닿을 수 없다. Furnace.mount(root) → { fit, setActive } · 시험용: root._fn.heat(°C) */
(function () {
  'use strict';
  function mount(root) {
    const stage = root.querySelector('.fn-stage'), now = root.querySelector('.fn-now'), out = root.querySelector('.fn-out');
    let T = 20, maxT = 20, hy = 0, lastY = null, t = 0; const sparks = [], steam = [];
    const P = window.Play;
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; T = Math.max(20, T - dt * (T - 20) * 0.06); maxT = Math.max(maxT, T);
        const hot = Math.min(1, T / 1800);
        c.fillStyle = '#21160f'; c.fillRect(0, 0, W, H);
        // 풀무(왼쪽): 손잡이 위치 hy(0 위 ~ 1 아래)
        const bx = W * 0.05, by = H * 0.38, bw = W * 0.16, bh = H * 0.34 * (1 - hy * 0.55);
        c.fillStyle = '#7a4a2a'; c.beginPath(); c.moveTo(bx, by + H * 0.34); c.lineTo(bx + bw, by + H * 0.34); c.lineTo(bx + bw * 0.9, by + H * 0.34 - bh); c.lineTo(bx + bw * 0.1, by + H * 0.34 - bh); c.closePath(); c.fill();
        c.strokeStyle = '#3a2214'; c.lineWidth = 3; c.stroke();
        for (let i = 1; i < 4; i++) { const y = by + H * 0.34 - bh * i / 4; c.beginPath(); c.moveTo(bx + 6, y); c.lineTo(bx + bw - 6, y); c.stroke(); }
        const hx = bx + bw / 2, hyPx = by + H * 0.34 - bh - 30;
        c.fillStyle = '#c9a46a'; c.fillRect(hx - 40, hyPx, 80, 18); c.strokeRect(hx - 40, hyPx, 80, 18);
        P.txt(c, '↕ 끌어 바람 넣기', hx, hyPx - 12, '#ffd84d', '700 19px');
        c.fillStyle = '#5a3a26'; c.fillRect(bx + bw, by + H * 0.3, W * 0.1, 14);   // 바람 관
        // 화로
        const fx0 = W * 0.28, fw = W * 0.42, fy0 = H * 0.5;
        c.fillStyle = '#5a3a26'; c.fillRect(fx0, fy0, fw, H * 0.44);
        for (let r = 0; r < 6; r++) for (let k = 0; k < 7; k++) { c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 2; c.strokeRect(fx0 + (k + (r % 2) * 0.5) * fw / 7, fy0 + r * H * 0.44 / 6, fw / 7, H * 0.44 / 6); }
        const cx = fx0 + fw / 2, fy = H * 0.66;
        P.glow(c, cx, fy, 110 + hot * 120, `rgba(255,${140 + hot * 90},60,${0.25 + hot * 0.5})`);
        for (let i = 0; i < 11; i++) {
          const hgt = (40 + hot * 140) * (0.65 + 0.35 * Math.sin(t * 9 + i * 1.7));
          const g = c.createLinearGradient(0, fy, 0, fy - hgt); g.addColorStop(0, `rgba(255,${110 + hot * 120},40,.9)`); g.addColorStop(1, 'rgba(255,240,180,0)');
          c.fillStyle = g; const x = cx - 90 + i * 18; c.beginPath(); c.moveTo(x - 13, fy); c.quadraticCurveTo(x + Math.sin(t * 7 + i) * 6, fy - hgt, x + 13, fy); c.fill();
        }
        if (Math.random() < hot * 0.8) sparks.push({ x: cx + (Math.random() - 0.5) * 140, y: fy - 20, vx: (Math.random() - 0.5) * 80, vy: -120 - Math.random() * 200 * hot, life: 1 });
        for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; s.x += s.vx * dt; s.y += s.vy * dt; s.vy += 160 * dt; s.life -= dt * 1.2; if (s.life <= 0) { sparks.splice(i, 1); continue; } c.fillStyle = `rgba(255,${200 + 55 * s.life},120,${s.life})`; c.fillRect(s.x, s.y, 3, 3); }
        // 도가니와 납
        const ky = H * 0.4;
        c.fillStyle = '#8d8f94'; c.strokeStyle = '#1d2433'; c.lineWidth = 3;
        c.beginPath(); c.moveTo(cx - 85, ky - 50); c.lineTo(cx + 85, ky - 50); c.lineTo(cx + 58, ky + 60); c.lineTo(cx - 58, ky + 60); c.closePath(); c.fill(); c.stroke();
        if (T < 327) { c.fillStyle = '#7d8288'; c.fillRect(cx - 42, ky - 72, 84, 34); c.strokeRect(cx - 42, ky - 72, 84, 34); }
        else {
          c.fillStyle = `rgb(${160 + hot * 90},${150 + hot * 50},${150 - hot * 70})`; c.beginPath();
          for (let i = 0; i <= 20; i++) { const x = cx - 76 + i * 7.6, y = ky - 40 + Math.sin(t * 5 + i * 0.8) * (2 + hot * 4); i ? c.lineTo(x, y) : c.moveTo(x, y); }
          c.lineTo(cx + 70, ky - 24); c.lineTo(cx - 70, ky - 24); c.closePath(); c.fill();
        }
        if (T >= 1749 && Math.random() < 0.5) steam.push({ x: cx + (Math.random() - 0.5) * 120, y: ky - 50, r: 6, life: 1 });
        for (let i = steam.length - 1; i >= 0; i--) { const s = steam[i]; s.y -= 50 * dt; s.r += 14 * dt; s.life -= dt * 0.7; if (s.life <= 0) { steam.splice(i, 1); continue; } c.fillStyle = `rgba(220,220,220,${0.3 * s.life})`; c.beginPath(); c.arc(s.x, s.y, s.r, 0, Math.PI * 2); c.fill(); }
        P.txt(c, 'Pb 납', cx, ky + 30, '#fbfcf9', '800 26px');
        // 온도계(로그 눈금, 1000만 K까지)
        const gx = W * 0.86, gy0 = H * 0.12, gy1 = H * 0.86, lv = Math.log10(Math.max(20, T)) / 7;
        c.fillStyle = '#16203f'; c.fillRect(gx - 16, gy0, 32, gy1 - gy0);
        c.fillStyle = '#e8603c'; c.fillRect(gx - 12, gy1 - (gy1 - gy0) * lv, 24, (gy1 - gy0) * lv);
        [[327, '327 °C 녹음'], [1749, '1749 °C 끓음'], [1e7, '별 중심 1000만 K']].forEach(([v, n]) => { const y = gy1 - (gy1 - gy0) * Math.log10(v) / 7; c.strokeStyle = '#fbfcf9'; c.lineWidth = 2; c.beginPath(); c.moveTo(gx - 22, y); c.lineTo(gx + 22, y); c.stroke(); P.txt(c, n, gx - 28, y + 6, '#fbfcf9', '700 18px', 'right'); });
        P.txt(c, `${Math.round(T)} °C`, gx, gy1 + 30, '#ffd84d', '800 22px');
        const msg = T < 327 ? '단단한 납' : T < 1749 ? '녹았다 — 그래도 납' : '끓는다 — 여전히 납';
        if (out.textContent !== msg) out.textContent = msg;
        const fin = maxT >= 1749, nt = fin ? '아무리 달궈도 납은 납 — 금은 어디서?' : '풀무 손잡이를 위아래로 끌어 보자';
        if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', fin); }
      },
      down(p) { lastY = p.y; },
      move(p, e, held) { if (!held || lastY == null) return; const d = p.y - lastY; hy = Math.max(0, Math.min(1, hy + d / 140)); if (d > 0) T = Math.min(1800, T + d * (2.2 + T / 300)); lastY = p.y; },
      up() { lastY = null; hy = 0; },
      key(e) { if (e.key === ' ' || e.key === 'Enter') { T = Math.min(1800, T + 120 + T / 5); hy = hy ? 0 : 1; return true; } return false; },
    });
    root._fn = { heat: (v) => { T = v; maxT = Math.max(maxT, v); S.redraw(); } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Furnace = { mount };
})();
