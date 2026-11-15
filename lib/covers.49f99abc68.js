/* 3-2 새 차시 표지 두 가지: 화면을 좌우로 끌면(화살표 키) 값 v(0~1)가 바뀌고 그림이 따라 움직인다(2-1 covers.js와 같은 뼈대).
   Cov.mount(root, 종류) → { fit, setActive } · 종류: drop(놓은 공과 옆으로 친 공) push(볼링공과 탁구공)
   시험용: root._cv.set(0~1) · 높이·거리·빠르기는 이해를 돕기 위한 예
   그림은 위 44px(안내 띠 .au-now 자리)을 비우고 그린다. 처음에는 아래에 ‘끄는 방향’ 손가락 표시가 뜨고 한 번 끌면 사라진다. */
(function () {
  'use strict';
  const TAU = Math.PI * 2, INK = '#fbfcf9', YEL = '#ffd84d', FONT = '"IBM Plex Sans KR", sans-serif', TOP = 44;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), ease = (u) => u * u * (3 - 2 * u);
  const line = (c, x0, y0, x1, y1, col, w, dash) => { c.strokeStyle = col; c.lineWidth = w; c.setLineDash(dash || []); c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.setLineDash([]); };
  const rr = (c, x, y, w, h, r, fill, stroke, lw) => { c.beginPath(); c.roundRect(x, y, w, h, r); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1.5; c.stroke(); } };
  const lin = (c, x0, y0, x1, y1, stops) => { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); return g; };
  function pill(c, x, y, t, bg, fg, f = '700 16px') { // 이름표(가운데 맞춤)
    c.font = `${f} ${FONT}`; const w = c.measureText(t).width + 18;
    rr(c, x - w / 2, y - 13, w, 26, 13, bg); c.fillStyle = fg; c.textAlign = 'center'; c.fillText(t, x, y + 5.5);
  }
  // 빛을 받은 공: 밝은 색 → 본색 → 어두운 색, 위 왼쪽에 반짝임
  function ball(c, x, y, r, hi, mid, lo, a = 1) {
    c.globalAlpha = a; const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.08, x, y, r * 1.05);
    g.addColorStop(0, hi); g.addColorStop(0.45, mid); g.addColorStop(1, lo);
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(x - r * 0.38, y - r * 0.45, r * 0.22, r * 0.13, -0.6, 0, TAU); c.fill(); c.globalAlpha = 1;
  }
  const shadow = (c, x, y, w, a) => { c.fillStyle = `rgba(0,0,0,${a})`; c.beginPath(); c.ellipse(x, y, w, w * 0.22, 0, 0, TAU); c.fill(); };
  function backdrop(c, W, H) { // 교실 벽과 바닥 느낌의 어두운 배경
    c.fillStyle = lin(c, 0, 0, 0, H, ['#16203c', '#0d1224', '#0a0d18']); c.fillRect(0, 0, W, H);
    const g = c.createRadialGradient(W * 0.5, H * 0.35, 10, W * 0.5, H * 0.35, W * 0.7); g.addColorStop(0, 'rgba(90,120,200,.16)'); g.addColorStop(1, 'rgba(90,120,200,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
  }
  // 끄는 방향 안내: 큰 손가락이 점선 화살표를 따라 오른쪽으로 미끄러진다(한 번 끌면 사라짐)
  function hint(c, W, H, t, label, at) {
    const cxh = W * (at ? at[0] : 0.5), sp = Math.min(120, W * 0.2), y = at ? H * at[1] - 20 : H - 40, x0 = cxh - sp, x1 = cxh + sp, u = (t % 2.1) / 2.1, e = ease(clamp(u / 0.7, 0, 1)), a = u > 0.88 ? 1 - (u - 0.88) / 0.12 : Math.min(1, u * 8);
    c.font = `800 16px ${FONT}`; const w = c.measureText(label).width + 28;
    const lxh = Math.max(w / 2 + 6, Math.min(W - w / 2 - 6, cxh)); rr(c, lxh - w / 2, y - 60, w, 32, 16, 'rgba(11,14,24,.9)', 'rgba(255,216,77,.95)', 2); c.fillStyle = YEL; c.textAlign = 'center'; c.fillText(label, lxh, y - 38);
    line(c, x0, y, x1 - 10, y, 'rgba(255,216,77,.9)', 3, [8, 6]); c.fillStyle = YEL; c.beginPath(); c.moveTo(x1 + 4, y); c.lineTo(x1 - 12, y - 8); c.lineTo(x1 - 12, y + 8); c.closePath(); c.fill();
    const hx = x0 + (x1 - x0 - 20) * e, hy = y + 2; c.save(); c.globalAlpha = a; c.translate(hx, hy); c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 10; c.shadowOffsetY = 4;
    c.fillStyle = '#fff'; c.beginPath(); c.roundRect(-10, 24, 38, 34, [8, 12, 16, 16]); c.fill(); c.shadowColor = 'transparent'; c.strokeStyle = '#1d2433'; c.lineWidth = 2.2; c.stroke();
    c.beginPath(); c.ellipse(-12, 42, 6.5, 12, -0.55, 0, TAU); c.fill(); c.stroke(); c.beginPath(); c.roundRect(-8, 0, 16, 36, 8); c.fill(); c.stroke(); rr(c, -4.5, 3.5, 9, 8, 3.5, '#f3e6e6'); c.restore();
  }
  const SKIN = '#f1c7a0', SKIN_D = '#b98562';
  const finger = (c, x0, y0, x1, y1, w) => { c.lineCap = 'round'; line(c, x0, y0, x1, y1, SKIN_D, w + 2.5); line(c, x0, y0, x1, y1, SKIN, w); c.lineCap = 'butt'; };

  const KINDS = {
    drop: {
      hintAt: [0.72, 0.97],
      hint: '오른쪽으로 끌면 두 공이 떨어진다',
      draw(c, P, W, H, v, t) {
        const r = 15, yF = H * 0.8, y0 = H * 0.22, xa = W * 0.25, xb = W * 0.43, xe = W * 0.93;
        const at = (k) => [y0 + (yF - r - y0) * k * k, xb + (xe - xb) * k];
        // 벽의 높이 눈금과 바닥
        for (let i = 0; i <= 5; i++) { const y = y0 + r + (yF - y0 - r) * i / 5; line(c, 0, y, W, y, 'rgba(185,194,216,.09)', 1); }
        c.fillStyle = lin(c, 0, yF, 0, H, ['#3a4263', '#1c2138', '#11152a']); c.fillRect(0, yF, W, H - yF); line(c, 0, yF, W, yF, 'rgba(210,220,245,.75)', 2);
        for (let x = (W * 0.5) % 90; x < W; x += 90) line(c, x, yF + 2, x + (x - W / 2) * 0.35, H, 'rgba(0,0,0,.22)', 1.5);
        // 왼쪽 벽의 높이 눈금(1.25 m에서 떨어뜨림 · 예)과 지난 시간
        for (let i = 1; i <= 5; i++) { const y = y0 + (yF - y0) * i / 5, m = 1.25 - 0.25 * i; line(c, W * 0.1, y, W * 0.1 + 10, y, 'rgba(230,236,250,.8)', 1.5); P.txt(c, `${m.toFixed(2)}`, W * 0.1 - 4, y + 4, 'rgba(230,236,250,.85)', '600 12px', 'right'); }
        line(c, W * 0.1, y0 + (yF - y0) * 0.2, W * 0.1, yF, 'rgba(230,236,250,.6)', 1.5); P.txt(c, '높이(m)', W * 0.1 + 14, yF - 8, 'rgba(230,236,250,.85)', '700 12px', 'left');
        pill(c, W * 0.86, y0 - 36, `${(v * 0.5).toFixed(2)} s`, 'rgba(255,255,255,.9)', '#1d2433', '800 15px');
        // 받침대(기둥·판)와 그 위의 자
        const px0 = xa + r * 1.7, px1 = xb + r * 0.5, pm = (px0 + px1) / 2, pt = y0 + r;
        shadow(c, pm, yF + 5, 46, 0.35);
        c.fillStyle = lin(c, pm - 6, 0, pm + 6, 0, ['#7a84a6', '#c9d0e6', '#6b7494']); c.fillRect(pm - 6, pt + 8, 12, yF - pt - 14);
        rr(c, pm - 36, yF - 9, 72, 9, 3, lin(c, 0, yF - 9, 0, yF, ['#aab2cf', '#5d6585']));
        rr(c, px0, pt, px1 - px0, 9, 2, lin(c, 0, pt, 0, pt + 9, ['#d9a86a', '#8f6234']), '#5e3f1e', 1);
        const kick = Math.min(9, v * 110), rx0 = px0 + 4 + kick, rx1 = xb - r * 0.92 + kick;
        rr(c, rx0, pt - 6, rx1 - rx0, 6, 1.5, lin(c, 0, pt - 6, 0, pt, ['#ffe98a', '#e0b423']), '#8a6a10', 1);
        for (let x = rx0 + 5; x < rx1 - 2; x += 5) line(c, x, pt - 6, x, pt - (Math.round((x - rx0) / 5) % 2 ? 3 : 4), '#7a5c0c', 1);
        if (v > 0.005 && v < 0.12) { c.save(); c.translate(xb - r, y0 + 2); c.strokeStyle = `rgba(255,216,77,${1 - v / 0.12})`; c.lineWidth = 2.5; for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + 0.3; c.beginPath(); c.moveTo(Math.cos(a) * 7, Math.sin(a) * 7); c.lineTo(Math.cos(a) * 15, Math.sin(a) * 15); c.stroke(); } c.restore(); }
        // 지나온 자리(같은 시간 간격)와 길
        c.strokeStyle = 'rgba(110,170,240,.5)'; c.lineWidth = 2; c.setLineDash([3, 6]); c.beginPath(); for (let k = 0; k <= v + 1e-6; k += 0.02) { const [y, x] = at(k); c.lineTo(x, y); } c.stroke();
        c.strokeStyle = 'rgba(240,120,90,.5)'; c.beginPath(); c.moveTo(xa, y0); c.lineTo(xa, at(v)[0]); c.stroke(); c.setLineDash([]);
        for (let k = 0.125; k < v - 0.03; k += 0.125) { const [y, x] = at(k); line(c, xa + r, y, x - r, y, 'rgba(255,216,77,.28)', 1.5, [5, 6]); ball(c, xa, y, r, '#ffb49a', '#e4572e', '#8a2a12', 0.3); ball(c, x, y, r, '#a9d2ff', '#3d8bd9', '#1b4f8a', 0.3); }
        // 지금 두 공
        const bob = v < 0.005 ? Math.sin(t * 2.2) * 1.3 : 0, [y, x] = at(v), k2 = v * v;
        shadow(c, xa, yF + 4, r * (0.5 + k2 * 0.6), 0.12 + k2 * 0.4); shadow(c, x, yF + 4, r * (0.5 + k2 * 0.6), 0.12 + k2 * 0.4);
        if (v > 0.03) { line(c, xa + r + 3, y, x - r - 3, y, YEL, 2, [6, 6]); if (v < 0.97 && x - xa > 150) pill(c, (xa + x) / 2, y + 18, '같은 높이', 'rgba(255,216,77,.16)', YEL, '700 14px'); }
        // 놓는 손(소매·손바닥·두 손가락): 끌기 시작하면 손가락이 벌어진다
        const open = ease(clamp(v * 14, 0, 1)), hy = y0 + bob, hx = xa - r * 2.5;
        rr(c, -12, hy - 13, hx + 2, 26, 6, lin(c, 0, hy - 13, 0, hy + 13, ['#5b77c9', '#33468a'])); rr(c, hx - 16, hy - 15, 10, 30, 3, '#e9edf9');
        c.fillStyle = SKIN; c.strokeStyle = SKIN_D; c.lineWidth = 1.5; c.beginPath(); c.ellipse(hx + 6, hy, r * 1.25, r * 1.1, 0, 0, TAU); c.fill(); c.stroke();
        [-1, 1].forEach((sg) => { const a = sg * (0.42 + open * 0.55), L = r * 2.35; finger(c, hx + 12, hy + sg * r * 0.55, hx + 12 + Math.cos(a) * L, hy + sg * r * 0.55 + Math.sin(a) * L * 0.62 + sg * r * 0.42, 8); });
        ball(c, xa, y + bob, r, '#ffb49a', '#e4572e', '#8a2a12'); ball(c, x, y, r, '#a9d2ff', '#3d8bd9', '#1b4f8a');
        if (v >= 0.97) { // 동시에 닿는 순간
          const u = (t * 1.1) % 1; [xa, x].forEach((bx) => { c.strokeStyle = `rgba(255,216,77,${0.9 * (1 - u)})`; c.lineWidth = 2.5; c.beginPath(); c.ellipse(bx, yF + 1, r * (1 + u * 2.2), r * (0.3 + u * 0.5), 0, 0, TAU); c.stroke(); });
          pill(c, (xa + xe) / 2, yF - 44, '두 공이 동시에 바닥에!', YEL, '#1d2433', '800 17px');
        }
        pill(c, xa - r * 2.4, y0 - 36, '가만히 놓은 공', 'rgba(228,87,46,.9)', '#fff'); pill(c, xb + 62, y0 - 36, '옆으로 친 공', 'rgba(61,139,217,.95)', '#fff');
      },
      say(v, moved) { return [v < 0.05 ? '같은 높이, 같은 순간 — 빨간 공은 <b>놓고</b> 파란 공은 자로 <b>옆으로 친다</b>' : v < 0.97 ? '두 공을 잇는 점선이 늘 <b>수평</b>이다 — 높이가 매 순간 같다' : '두 공이 <b>동시에</b> 바닥에 닿았다 — 옆으로 간 거리만 다르다', moved ? (v < 0.97 ? '바닥에 닿을 때까지 더 끌어 보자' : '왜 동시에 닿을까?') : '예측을 고른 뒤 오른쪽으로 끌어 보자', v >= 0.97]; },
    },
    push: {
      ph: 0, hint: '오른쪽으로 끌면 두 공이 더 빨리 굴러온다',
      draw(c, P, W, H, v, t, dt) {
        const s = 1 + v * 7; this.ph = (this.ph + dt * (0.25 + s * 0.09)) % 1.5; const ph = this.ph, k = Math.min(1, ph), u = ease(clamp((ph - 1) / 0.14, 0, 1)), xp = W * 0.7, xw = W * 0.955;
        // 레인 둘: [바닥 높이, 공 반지름, 이름, 판이 밀리는 정도, 판 높이, 볼링공인가]
        // 용수철 판이 밀리는 깊이는 빠르기 × √질량에 비례한다(볼링공 6 kg, 탁구공 2.7 g → 약 47배 차이 · 깊이 값은 이해를 돕기 위한 예). 탁구공 판은 돋보기 안에서만 12배로 보인다
        [[H * 0.5, 36, '볼링공', s / 8, 78, 1], [H * 0.83, 11, '탁구공', s / 8 / 47, 40, 0]].forEach(([yf, r, name, dent, hp, big]) => {
          const d = dent * W * 0.2, px = xp + d * u, bx = W * 0.07 + (xp - r - W * 0.07) * k + d * u, by = yf - r, hit = k >= 1;
          // 나무 레인과 오른쪽 벽
          rr(c, W * 0.03, yf, W * 0.945, 11, 3, lin(c, 0, yf, 0, yf + 11, ['#e2b77c', '#b98549', '#7a5327'])); for (let x = W * 0.03 + 58; x < xw; x += 58) line(c, x, yf + 1, x, yf + 10, 'rgba(70,40,10,.45)', 1);
          line(c, W * 0.03, yf + 0.5, xw, yf + 0.5, 'rgba(255,240,210,.7)', 1);
          rr(c, xw, yf - hp - 10, 14, hp + 21, 3, lin(c, xw, 0, xw + 14, 0, ['#8d96b5', '#555d7c']));
          // 처음 자리 표시, 용수철, 멈추는 판
          line(c, xp, yf - hp - 6, xp, yf, 'rgba(255,255,255,.3)', 1.5, [4, 4]);
          const sy = yf - hp * 0.5, n = 9, sx0 = px + 9; c.strokeStyle = '#c9d0e6'; c.lineWidth = 2.2; c.lineJoin = 'round'; c.beginPath(); c.moveTo(sx0, sy);
          for (let i = 0; i <= n * 2; i++) c.lineTo(sx0 + 4 + (xw - sx0 - 8) * i / (n * 2), sy + (i % 2 ? -1 : 1) * hp * 0.2); c.lineTo(xw, sy); c.stroke();
          rr(c, px, yf - hp, 9, hp, 2, lin(c, px, 0, px + 9, 0, ['#ffe98a', '#e0a91c']), '#8a6a10', 1); rr(c, px - 4, yf - hp + 3, 4, hp - 6, 2, '#3b4260');
          if (u > 0.05 && d > 6) { const ay = yf - hp - 12; line(c, xp, ay, px, ay, YEL, 2.5); c.fillStyle = YEL; c.beginPath(); c.moveTo(px + 1, ay); c.lineTo(px - 7, ay - 5); c.lineTo(px - 7, ay + 5); c.fill(); }
          // 빠르기 줄무늬, 그림자, 공(굴러가며 돈다)
          if (!hit) for (let i = 0; i < 3; i++) line(c, bx - r - 6 - i * 3, by - r * 0.5 + i * r * 0.5, bx - r - 6 - i * 3 - s * (big ? 6 : 4), by - r * 0.5 + i * r * 0.5, `rgba(255,255,255,${0.32 - i * 0.07})`, big ? 3 : 2);
          shadow(c, bx, yf + 3, r * 0.95, 0.4);
          const ang = (bx - W * 0.07) / r;
          if (big) {
            ball(c, bx, by, r, '#8ea4ff', '#3d4f9f', '#141c4a');
            c.save(); c.beginPath(); c.arc(bx, by, r, 0, TAU); c.clip(); c.translate(bx, by); c.rotate(ang);
            c.strokeStyle = 'rgba(160,185,255,.35)'; c.lineWidth = 3; c.beginPath(); c.arc(r * 0.9, -r * 0.2, r * 1.1, 2.2, 3.9); c.stroke();
            [[-0.16, -0.5], [0.2, -0.46], [0.03, -0.14]].forEach(([dx, dy]) => { c.fillStyle = '#0a0e26'; c.beginPath(); c.arc(dx * r, dy * r, r * 0.13, 0, TAU); c.fill(); c.strokeStyle = 'rgba(170,190,255,.5)'; c.lineWidth = 1; c.stroke(); });
            c.restore();
          } else {
            ball(c, bx, by, r, '#ffe1b0', '#ff9f43', '#b8601a');
            c.save(); c.translate(bx, by); c.rotate(ang); c.strokeStyle = 'rgba(140,70,10,.55)'; c.lineWidth = 1.3; c.beginPath(); c.arc(0, -r * 1.2, r * 1.25, 0.6, Math.PI - 0.6); c.stroke(); c.restore();
          }
          if (hit && u < 0.9) { c.strokeStyle = `rgba(255,255,255,${0.9 * (1 - u)})`; c.lineWidth = 2; for (let i = 0; i < 5; i++) { const a = -1.2 + i * 0.6, R0 = r * 0.3 + 4, R1 = R0 + (big ? 8 + s * 1.5 : 5); c.beginPath(); c.moveTo(px - 3 + Math.cos(a) * -R0, by + Math.sin(a) * R0); c.lineTo(px - 3 + Math.cos(a) * -R1, by + Math.sin(a) * R1); c.stroke(); } }
          pill(c, W * 0.03 + 38, yf - Math.max(r * 2, 30) - 20, name, big ? 'rgba(61,79,159,.95)' : 'rgba(255,159,67,.95)', big ? '#fff' : '#1d2433');
          if (hit) P.txt(c, `판이 약 ${(dent * 40).toFixed(dent * 40 < 2 ? 1 : 0)} cm 밀렸다`, xw - 4, yf - hp - 22, YEL, '700 16px', 'right');
          if (!big) { // 탁구공 판은 1~2 px밖에 안 밀려 보이지 않으므로, 판 둘레에 가로(밀린 깊이)만 12배로 키운 돋보기를 씌운다
            const Z = 12, R = 38, cx = xp + 12, cy = yf - hp / 2, pz = xp + d * u * Z;
            c.save(); c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.fillStyle = 'rgba(8,11,24,.94)'; c.fill(); c.clip();
            rr(c, cx - R, yf, R * 2, 11, 0, lin(c, 0, yf, 0, yf + 11, ['#e2b77c', '#b98549', '#7a5327']));
            line(c, xp, yf - hp - 4, xp, yf, 'rgba(255,255,255,.45)', 1.2, [3, 3]);
            c.strokeStyle = '#c9d0e6'; c.lineWidth = 2; c.beginPath(); c.moveTo(pz + 9, cy); for (let i = 0; i <= 8; i++) c.lineTo(pz + 13 + (cx + R - pz - 13) * i / 8, cy + (i % 2 ? -1 : 1) * hp * 0.2); c.stroke();
            rr(c, pz, yf - hp, 9, hp, 2, lin(c, pz, 0, pz + 9, 0, ['#ffe98a', '#e0a91c']), '#8a6a10', 1);
            ball(c, hit ? pz - r : bx, by, r, '#ffe1b0', '#ff9f43', '#b8601a'); // 부딪히기 전에는 제자리, 부딪힌 뒤에는 확대된 판에 붙어 간다
            if (hit && d * u * Z > 5) { const ay = yf - hp + 6; line(c, xp, ay, pz - 1, ay, YEL, 2); }
            c.restore(); c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.strokeStyle = 'rgba(255,216,77,.9)'; c.lineWidth = 2; c.stroke();
            P.txt(c, '판 둘레 12배 확대', cx - R - 6, yf - hp - 2, YEL, '700 12px', 'right');
          }
        });
        pill(c, W * 0.8, 22, `두 공 모두 ${s.toFixed(0)} m/s`, YEL, '#1d2433', '800 18px');
      },
      say(v, moved) { const s = (1 + v * 7).toFixed(0); return [`볼링공과 탁구공이 둘 다 <b>${s} m/s</b>로 굴러와 용수철 달린 판에 부딪힌다`, moved ? (v > 0.9 ? '빠를수록, 무거울수록 판이 더 깊이 밀린다' : '끝까지 끌어 더 빠르게 굴려 보자') : '예측을 고른 뒤 오른쪽으로 끌어 보자', v > 0.9]; },
    },
  };
  function mount(root, kind) {
    const K = Object.create(KINDS[kind]), P = window.Play;
    const stage = root.querySelector('.au-stage'), out = root.querySelector('.au-out'), now = root.querySelector('.au-now');
    let v = 0, v0 = 0, x0 = 0, t = 0, moved = false;
    function set(x) { v = Math.max(0, Math.min(1, x)); const [o, n, done] = K.say(v, moved); out.innerHTML = o; now.textContent = n; now.classList.toggle('done', !!done); }
    const S = P.make(stage, {
      draw(c, W, H, dt) { t += dt; backdrop(c, W, H); c.save(); c.translate(0, TOP); K.draw(c, P, W, H - TOP, v, t, dt); c.restore(); if (!moved) hint(c, W, H, t, K.hint, K.hintAt); },
      down(p) { x0 = p.x; v0 = v; },
      move(p, e, held) { if (held) { moved = true; set(v0 + (p.x - x0) / S.W * 1.3); } },
      key(e) { const d = { ArrowLeft: -0.05, ArrowRight: 0.05 }[e.key]; if (!d) return false; moved = true; set(v + d); return true; },
    });
    set(0);
    root._cv = { set: (x) => { moved = true; set(x); S.redraw(); } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Cov = { mount };
})();
