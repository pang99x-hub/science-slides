/* 2-2 새 차시 표지 두 가지: 화면을 좌우로 끌면(화살표 키) 값 v(0~1)가 바뀌고 그림이 따라 움직인다.
   Cov.mount(root, 종류) → { fit, setActive } · 종류:
   pair(맞은편 염기를 하나씩 붙여 보기) — 당(보라 오각형)·인산(빨간 구슬) 골격 두 줄, 퍼즐 조각 염기(A–T 세모, G–C 둥근 돌기),
        아래에 떠다니는 뉴클레오타이드가 차례로 올라와 짝을 짓고 수소 결합(A–T 2줄, G–C 3줄)이 빛난다. 색은 사다리 장과 같다.
   rect(다이오드를 끼워 충전해 보기) — 콘센트 → 충전기 → 스마트폰. 전선 속 전하 점이 앞뒤로 출렁이다가 다이오드를 끼우면
        한쪽으로만 흐르고, 위 측정 화면 두 개에 들어오는 전류·나가는 전류 물결, 휴대폰 전지가 찬다.
   끌기 전에는 손가락이 끌 방향을 보여 주고, 한 번 끌면 사라진다. 시험용: root._cv.set(0~1) · 크기·모양은 이해를 돕기 위한 예 */
(function () {
  'use strict';
  const TAU = Math.PI * 2, EL = '#ffd84d', DIM = '#b9c2d8';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), ease = (u) => u * u * (3 - 2 * u);
  const COL = { A: '#ffd84d', T: '#f2a03d', G: '#5cc77a', C: '#5aa9f0', S: '#9b6bd6', P: '#e0503f' };
  const TOP = 'GTACCATG', MATE = { A: 'T', T: 'A', G: 'C', C: 'G' };
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16); const f = (v) => Math.max(0, Math.min(255, Math.round(k > 0 ? v + (255 - v) * k : v * (1 + k)))); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };

  // ── 공용 그림 ──
  function ball(c, x, y, r, col) {
    c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(x + r * 0.15, y + r * 0.3, r, r * 0.9, 0, 0, TAU); c.fill();
    const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); g.addColorStop(0, shade(col, 0.55)); g.addColorStop(0.45, col); g.addColorStop(1, shade(col, -0.45));
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(x - r * 0.35, y - r * 0.45, r * 0.3, r * 0.18, -0.5, 0, TAU); c.fill();
  }
  function pent(c, x, y, r, col) {
    const path = (ox, oy, rr) => { c.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i / 5 * TAU; c[i ? 'lineTo' : 'moveTo'](ox + Math.cos(a) * rr, oy + Math.sin(a) * rr); } c.closePath(); };
    c.fillStyle = 'rgba(0,0,0,.3)'; path(x + 2, y + 3, r); c.fill();
    const g = c.createLinearGradient(x - r, y - r, x + r, y + r); g.addColorStop(0, shade(col, 0.4)); g.addColorStop(0.55, col); g.addColorStop(1, shade(col, -0.4));
    c.fillStyle = g; path(x, y, r); c.fill(); c.strokeStyle = shade(col, 0.55); c.lineWidth = 1.4; path(x, y, r * 0.9); c.stroke();
  }
  // 세로로 선 염기 조각: (x,y)에서 dir(+1 아래, −1 위)로 len만큼, 끝에 짝 모양(A 세모 돌기·T 세모 홈·G 둥근 돌기·C 둥근 홈)
  function base(c, x, y, len, w, k, dir, a = 1) {
    const col = COL[k], tip = w * 0.42, half = w / 2, e = y + dir * len, notch = k === 'T' || k === 'C', round = k === 'G' || k === 'C';
    const path = (ox, oy) => {
      c.beginPath(); c.moveTo(ox - half, oy); c.lineTo(ox - half, e + oy - y);
      const ee = e + oy - y;
      if (round) { c.lineTo(ox - tip, ee); c.arc(ox, ee, tip, Math.PI, 0, notch ? dir < 0 : dir > 0); }
      else { c.lineTo(ox - tip, ee); c.lineTo(ox, ee + dir * (notch ? -tip : tip)); c.lineTo(ox + tip, ee); }
      c.lineTo(ox + half, ee); c.lineTo(ox + half, oy); c.closePath();
    };
    c.save(); c.globalAlpha = a;
    c.fillStyle = 'rgba(0,0,0,.3)'; path(x + 2, y + 2); c.fill();
    const g = c.createLinearGradient(x - half, 0, x + half, 0); g.addColorStop(0, shade(col, 0.4)); g.addColorStop(0.5, col); g.addColorStop(1, shade(col, -0.35));
    c.fillStyle = g; path(x, y); c.fill(); c.strokeStyle = shade(col, -0.5); c.lineWidth = 1.2; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x - half + 2, Math.min(y, e) + 3, Math.max(1.5, w * 0.16), Math.abs(len) - 8);
    window.Play.txt(c, k, x, y + dir * len * 0.5 + 6, '#1d2433', `800 ${Math.round(w * 0.62)}px`);
    c.restore();
  }
  function tube(c, x0, y0, x1, y1, col, w) {
    c.save(); c.lineCap = 'round';
    c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = w + 3; c.beginPath(); c.moveTo(x0 + 1, y0 + 3); c.lineTo(x1 + 1, y1 + 3); c.stroke();
    c.strokeStyle = shade(col, -0.35); c.lineWidth = w; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
    c.strokeStyle = col; c.lineWidth = w * 0.55; c.stroke();
    c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = Math.max(1, w * 0.18); c.beginPath(); c.moveTo(x0, y0 - w * 0.2); c.lineTo(x1, y1 - w * 0.2); c.stroke();
    c.restore();
  }
  function hb(c, x, y0, y1, n, a) { // 세로 수소 결합 n줄
    c.save(); c.globalAlpha = a; c.strokeStyle = '#e8f6ff'; c.lineWidth = 1.8; c.setLineDash([3, 3]); c.shadowColor = '#7fd1ff'; c.shadowBlur = 8;
    for (let i = 0; i < n; i++) { const o = (i - (n - 1) / 2) * 6; c.beginPath(); c.moveTo(x + o, y0); c.lineTo(x + o, y1); c.stroke(); }
    c.restore();
  }
  function pill(c, x, y, t, bg, fg = '#1d2433', f = '800 16px', al = 'center') {
    c.font = `${f} "IBM Plex Sans KR", sans-serif`; const w = c.measureText(t).width + 22, x0 = al === 'left' ? x : al === 'right' ? x - w : x - w / 2;
    c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.roundRect(x0 + 1, y - 13, w, 28, 14); c.fill();
    c.fillStyle = bg; c.beginPath(); c.roundRect(x0, y - 15, w, 28, 14); c.fill(); window.Play.txt(c, t, x0 + w / 2, y + 5, fg, f);
  }
  // 끌기 안내 손: 손끝 (x,y)에서 dx만큼 오른쪽으로 미끄러지며, 앞에 점선 화살표
  function hand(c, x, y, dx, t) {
    const u = (t % 1.8) / 1.8, k = ease(clamp(u / 0.8, 0, 1)), a = u < 0.85 ? 1 : 1 - (u - 0.85) / 0.15, hx = x + dx * k;
    c.save(); c.globalAlpha = 0.9;
    c.strokeStyle = 'rgba(255,216,77,.85)'; c.lineWidth = 3; c.setLineDash([8, 7]); c.beginPath(); c.moveTo(x, y - 30); c.lineTo(x + dx, y - 30); c.stroke(); c.setLineDash([]);
    c.fillStyle = 'rgba(255,216,77,.95)'; c.beginPath(); c.moveTo(x + dx + 12, y - 30); c.lineTo(x + dx - 4, y - 39); c.lineTo(x + dx - 4, y - 21); c.closePath(); c.fill();
    c.globalAlpha = a; c.translate(hx, y);
    c.fillStyle = 'rgba(255,216,77,.35)'; c.beginPath(); c.arc(0, 0, 14 + 6 * Math.sin(t * 6), 0, TAU); c.fill();
    c.fillStyle = '#fff'; c.strokeStyle = '#1d2433'; c.lineWidth = 2.2; c.lineJoin = 'round';
    c.beginPath(); c.roundRect(-6, -2, 12, 30, 6); c.fill(); c.stroke();                 // 집게손가락
    c.beginPath(); c.roundRect(-8, 20, 30, 26, 9); c.fill(); c.stroke();                  // 손바닥
    [4, 12].forEach((ox) => { c.beginPath(); c.roundRect(ox - 1, 15, 9, 14, 4.5); c.fill(); c.stroke(); }); // 접은 손가락
    c.beginPath(); c.ellipse(-10, 30, 6, 10, -0.5, 0, TAU); c.fill(); c.stroke();         // 엄지
    c.restore();
  }

  const KINDS = {
    pair: {
      draw(c, P, W, H, v, t) {
        const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#17244d'); g.addColorStop(1, '#0a1027'); c.fillStyle = g; c.fillRect(0, 0, W, H);
        const vg = c.createRadialGradient(W / 2, H * 0.45, 30, W / 2, H * 0.45, W * 0.7); vg.addColorStop(0, 'rgba(110,150,255,.16)'); vg.addColorStop(1, 'rgba(0,0,0,.35)'); c.fillStyle = vg; c.fillRect(0, 0, W, H);
        // 바탕에 흐린 이중 나선 무늬(분위기)
        c.save(); c.globalAlpha = 0.12; c.strokeStyle = '#9fb6ff'; c.lineWidth = 2;
        [0, Math.PI].forEach((ph) => { c.beginPath(); for (let x = 0; x <= W; x += 6) { const y = H * 0.86 + Math.sin(x * 0.03 + t * 0.8 + ph) * 16; if (x) c.lineTo(x, y); else c.moveTo(x, y); } c.stroke(); });
        c.restore();
        const n = TOP.length, gap = Math.min(66, (W - 90) / n), x0 = W / 2 - gap * (n - 1) / 2 + 16, yT = H * 0.33, yB = H * 0.73, bw = gap * 0.5, len = (yB - yT) / 2 - 22;
        const k = v * n;
        // 위 가닥 골격(당-인산) + 염기
        tube(c, x0 - gap * 0.55, yT, x0 + gap * (n - 1) + gap * 0.3, yT, '#c9b8ff', 6);
        for (let i = 0; i < n; i++) {
          const x = x0 + i * gap, wob = Math.sin(t * 1.6 + i * 0.7) * 1.2;
          ball(c, x - gap * 0.5, yT + wob, 7, COL.P);
          base(c, x, yT + 10 + wob, len, bw, TOP[i], 1);
          pent(c, x, yT + wob, 11, COL.S);
        }
        // 아래 가닥: 붙은 만큼 골격이 자란다
        const got = Math.min(n, Math.floor(k + 1e-6));
        if (got > 0) tube(c, x0 - gap * 0.3, yB, x0 + gap * (got - 1) + gap * 0.55, yB, '#c9b8ff', 6);
        for (let i = 0; i < n; i++) {
          const x = x0 + i * gap, p = clamp(k - i, 0, 1), m = MATE[TOP[i]];
          if (p <= 0) continue;
          const e = ease(p), y = yB + (1 - e) * (H - yB + 30) * 0.55, a = 0.35 + 0.65 * e, wob = p < 1 ? Math.sin(t * 7 + i) * 3 : Math.sin(t * 1.6 + i * 0.7) * 1.2;
          c.save(); c.globalAlpha = a;
          if (p >= 1) ball(c, x + gap * 0.5, y + wob, 7, COL.P);
          base(c, x, y - 10 + wob, len, bw, m, -1);
          pent(c, x, y + wob, 11, COL.S); c.restore();
          if (p >= 1) {
            hb(c, x, yT + 10 + len + 4, yB - 10 - len - 4, 'AT'.includes(TOP[i]) ? 2 : 3, Math.min(1, (k - i - 1 + 1) * 1));
            const fl = clamp(1 - (k - i - 1) * 3, 0, 1);
            if (fl > 0) P.glow(c, x, (yT + yB) / 2, 34, `rgba(255,240,170,${0.55 * fl})`);
          }
        }
        // 아직 붙지 않은 떠다니는 뉴클레오타이드(아래쪽)
        const left = TOP.slice(got + (k - got > 0 ? 1 : 0)).split('').map((ch) => MATE[ch]);
        left.slice(0, 5).forEach((m, j) => {
          const fx = W * (0.1 + j * 0.15) + Math.sin(t * 0.7 + j * 2) * 14, fy = H * 0.9 + Math.cos(t * 0.9 + j) * 6;
          c.save(); c.globalAlpha = 0.55; c.translate(fx, fy); c.rotate(Math.sin(t * 0.6 + j) * 0.3);
          ball(c, -10, 0, 5, COL.P); pent(c, 0, 0, 8, COL.S); c.fillStyle = COL[m]; c.beginPath(); c.roundRect(8, -6, 22, 12, 4); c.fill();
          P.txt(c, m, 19, 4, '#1d2433', '800 10px'); c.restore();
        });
        P.txt(c, '한 가닥', x0 + gap * (n - 1) + gap * 0.3, yT - 18, DIM, '700 14px', 'right');
        if (got) P.txt(c, '맞은편 가닥', x0 - gap * 0.3, yB + 34, DIM, '700 14px', 'left');
        pill(c, W - 16, H - 26, `짝 ${got} / ${n}`, got >= n ? '#5cc77a' : EL, '#1d2433', '800 16px', 'right');
        if (got >= 2) P.txt(c, 'A–T 수소 결합 2줄 · G–C 3줄', W - 16, H - 52, '#cfe9ff', '700 13px', 'right');
      },
      hint: (W, H) => [W * 0.18, H * 0.5, W * 0.4],
      say(v, moved) {
        const n = Math.min(8, Math.floor(v * 8 + 1e-6)), ch = TOP[Math.max(0, n - 1)];
        return [n === 0 ? '염기 여덟 개가 늘어선 DNA <b>한 가닥</b> — 짝은 아래에 떠 있다' : n < 8 ? `${ch} 맞은편에는 <b>${MATE[ch]}</b>가 와서 붙었다 — 짝 ${n}개` : '맞은편 가닥 <b>CATGGTAC</b> — A는 T와, G는 C와만 짝을 지었다',
          moved ? (n < 8 ? '끝까지 끌어 맞은편 가닥을 채우자' : '붙는 짝이 늘 같았을까?') : '오른쪽으로 끌어 맞은편 염기를 붙이자', n >= 8];
      },
    },
    rect: {
      draw(c, P, W, H, v, t) {
        const on = v >= 0.9, k = ease(Math.min(1, v / 0.9));
        const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a2347'); g.addColorStop(1, '#0c1128'); c.fillStyle = g; c.fillRect(0, 0, W, H);
        // 책상 면
        const dy = H * 0.82, dg = c.createLinearGradient(0, dy, 0, H); dg.addColorStop(0, '#5a4433'); dg.addColorStop(1, '#2e2219'); c.fillStyle = dg; c.fillRect(0, dy, W, H - dy);
        c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(0, dy, W, 2);
        // 벽 콘센트(왼쪽)
        const ox = W * 0.1, oy = H * 0.68;
        c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.roundRect(ox - 34, oy - 44, 72, 92, 12); c.fill();
        const og = c.createLinearGradient(ox - 36, 0, ox + 36, 0); og.addColorStop(0, '#f4f2ea'); og.addColorStop(1, '#c9c5b8'); c.fillStyle = og; c.beginPath(); c.roundRect(ox - 36, oy - 46, 72, 92, 12); c.fill();
        c.fillStyle = '#d8d4c8'; c.beginPath(); c.arc(ox, oy, 26, 0, TAU); c.fill(); c.strokeStyle = '#a9a496'; c.lineWidth = 1.5; c.stroke();
        // 꽂힌 플러그
        c.fillStyle = '#2b2f3a'; c.beginPath(); c.arc(ox, oy, 20, 0, TAU); c.fill(); c.fillStyle = '#3d4352'; c.beginPath(); c.arc(ox - 4, oy - 5, 13, 0, TAU); c.fill();
        P.txt(c, '콘센트', ox, oy + 66, DIM, '700 14px');
        // 충전기(가운데, 투명한 몸통 안이 보인다)
        const cx = W * 0.47, cy = H * 0.68, cw = 120, ch = 74;
        // 전선 경로
        const wire = [[ox + 20, oy], [cx - cw / 2, cy]], wire2 = [[cx + cw / 2, cy], [W * 0.83, cy]];
        const cable = (a, b) => { c.strokeStyle = '#11131a'; c.lineWidth = 9; c.lineCap = 'round'; c.beginPath(); c.moveTo(a[0], a[1]); c.bezierCurveTo((a[0] + b[0]) / 2, a[1] + 26, (a[0] + b[0]) / 2, b[1] + 26, b[0], b[1]); c.stroke(); c.strokeStyle = '#3a3f4f'; c.lineWidth = 5; c.stroke(); };
        cable(...wire); cable(...wire2);
        const along = (a, b, u) => { const mx = (a[0] + b[0]) / 2, s = 1 - u; const x = s * s * s * a[0] + 3 * s * s * u * mx + 3 * s * u * u * mx + u * u * u * b[0]; const y = s * s * s * a[1] + 3 * s * s * u * (a[1] + 26) + 3 * s * u * u * (b[1] + 26) + u * u * u * b[1]; return [x, y]; };
        // 전하 점: 왼쪽은 늘 앞뒤로 출렁(교류). 오른쪽은 다이오드 전: 출렁 · 뒤: 반 주기만 앞으로
        const ph = t * 2.4, sw = Math.sin(ph), shift = 0.05 * sw;
        let fwd = 0; { const cyc = Math.floor(ph / TAU), fr = (ph / TAU) - cyc; fwd = cyc * 0.5 + (fr < 0.5 ? (1 - Math.cos(fr * 2 * Math.PI)) / 4 : 0.5); }
        for (let i = 0; i < 9; i++) {
          const u = ((i / 9 + shift) % 1 + 1) % 1, [x, y] = along(...wire, u); c.fillStyle = '#9fd0ff'; c.beginPath(); c.arc(x, y - 1, 3, 0, TAU); c.fill();
          const u2 = on ? ((i / 9 + fwd * 0.22) % 1 + 1) % 1 : ((i / 9 + shift) % 1 + 1) % 1, [x2, y2] = along(...wire2, u2);
          c.fillStyle = on ? EL : '#9fd0ff'; c.beginPath(); c.arc(x2, y2 - 1, 3, 0, TAU); c.fill();
        }
        c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.roundRect(cx - cw / 2 + 3, cy - ch / 2 + 5, cw, ch, 14); c.fill();
        const bg = c.createLinearGradient(0, cy - ch / 2, 0, cy + ch / 2); bg.addColorStop(0, 'rgba(240,244,255,.30)'); bg.addColorStop(1, 'rgba(160,175,210,.18)');
        c.fillStyle = bg; c.beginPath(); c.roundRect(cx - cw / 2, cy - ch / 2, cw, ch, 14); c.fill(); c.strokeStyle = 'rgba(230,236,255,.75)'; c.lineWidth = 2; c.stroke();
        c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.roundRect(cx - cw / 2 + 6, cy - ch / 2 + 5, cw - 12, 10, 5); c.fill();
        // 안쪽 기판과 다이오드 자리
        c.fillStyle = '#1f6b4a'; c.beginPath(); c.roundRect(cx - 44, cy - 20, 88, 40, 5); c.fill();
        c.strokeStyle = '#d9b75a'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx - 44, cy); c.lineTo(cx - 24, cy); c.moveTo(cx + 24, cy); c.lineTo(cx + 44, cy); c.stroke();
        c.strokeStyle = 'rgba(255,216,77,.6)'; c.setLineDash([4, 4]); c.strokeRect(cx - 24, cy - 12, 48, 24); c.setLineDash([]);
        P.txt(c, '충전기', cx, cy + ch / 2 + 22, DIM, '700 14px');
        // 다이오드: 위에서 내려와 자리에 끼워진다(검은 몸통 + 은색 띠 + 다리)
        const ddy = cy - (1 - k) * H * 0.3, sway = on ? 0 : Math.sin(t * 2.2) * 3 * (1 - k);
        if (k < 1) { c.strokeStyle = 'rgba(200,210,235,.35)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(cx + sway, 0); c.lineTo(cx + sway, ddy - 14); c.stroke(); }
        c.save(); c.translate(cx + sway, ddy);
        if (on) P.glow(c, 0, 0, 46, 'rgba(255,216,77,.45)');
        c.strokeStyle = '#c9ccd4'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-26, 0); c.lineTo(26, 0); c.stroke();
        const dg2 = c.createLinearGradient(0, -10, 0, 10); dg2.addColorStop(0, '#4a4f5c'); dg2.addColorStop(0.5, '#15171d'); dg2.addColorStop(1, '#2a2d36');
        c.fillStyle = dg2; c.beginPath(); c.roundRect(-17, -10, 34, 20, 6); c.fill();
        c.fillStyle = '#d8dbe3'; c.fillRect(8, -10, 5, 20); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(-14, -8, 26, 3);
        c.restore();
        P.txt(c, '다이오드', cx + sway, Math.min(ddy - 20, cy - ch / 2 - 8), '#fbfcf9', '700 14px');
        // 스마트폰(오른쪽) + 전지 표시
        const px = W * 0.88, py = H * 0.64, pw = 58, ph2 = 112;
        c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.roundRect(px - pw / 2 + 4, py - ph2 / 2 + 6, pw, ph2, 12); c.fill();
        c.fillStyle = '#20232c'; c.beginPath(); c.roundRect(px - pw / 2, py - ph2 / 2, pw, ph2, 12); c.fill(); c.strokeStyle = '#6b7183'; c.lineWidth = 2; c.stroke();
        const sg = c.createLinearGradient(0, py - ph2 / 2, 0, py + ph2 / 2); sg.addColorStop(0, '#26355f'); sg.addColorStop(1, '#101830'); c.fillStyle = sg; c.beginPath(); c.roundRect(px - pw / 2 + 5, py - ph2 / 2 + 10, pw - 10, ph2 - 20, 6); c.fill();
        const lvl = on ? clamp(0.2 + ((t * 0.12) % 0.8), 0, 1) : 0.2;
        c.strokeStyle = '#e8ecf6'; c.lineWidth = 2; c.strokeRect(px - 12, py - 22, 24, 40); c.fillStyle = '#e8ecf6'; c.fillRect(px - 5, py - 26, 10, 4);
        c.fillStyle = on ? '#5cc77a' : '#e4572e'; c.fillRect(px - 9, py + 15 - 34 * lvl, 18, 34 * lvl);
        if (on) { c.fillStyle = EL; c.beginPath(); c.moveTo(px + 2, py - 16); c.lineTo(px - 6, py + 1); c.lineTo(px, py + 1); c.lineTo(px - 2, py + 13); c.lineTo(px + 6, py - 4); c.lineTo(px, py - 4); c.closePath(); c.fill(); }
        P.txt(c, on ? '충전 중' : '충전 안 됨', px, py + ph2 / 2 + 20, on ? '#8de0a3' : DIM, '700 14px');
        // 측정 화면 두 개: 들어오는 전류 · 나가는 전류
        const scr = (sx, sy, sw2, sh, cut, lab, col) => {
          c.fillStyle = 'rgba(0,0,0,.4)'; c.beginPath(); c.roundRect(sx + 3, sy + 4, sw2, sh, 8); c.fill();
          c.fillStyle = '#07140f'; c.beginPath(); c.roundRect(sx, sy, sw2, sh, 8); c.fill(); c.strokeStyle = '#4c5a70'; c.lineWidth = 2; c.stroke();
          c.strokeStyle = 'rgba(120,255,180,.12)'; c.lineWidth = 1;
          for (let i = 1; i < 6; i++) { c.beginPath(); c.moveTo(sx + sw2 * i / 6, sy + 4); c.lineTo(sx + sw2 * i / 6, sy + sh - 4); c.stroke(); }
          c.beginPath(); c.moveTo(sx + 4, sy + sh / 2); c.lineTo(sx + sw2 - 4, sy + sh / 2); c.strokeStyle = 'rgba(120,255,180,.3)'; c.stroke();
          c.save(); c.shadowColor = col; c.shadowBlur = 8; c.strokeStyle = col; c.lineWidth = 2.5; c.beginPath();
          for (let x = 4; x <= sw2 - 4; x += 2) { let s = Math.sin(x * 0.075 - t * 3); if (cut) s = Math.max(0, s); const y = sy + sh / 2 - s * sh * 0.34; if (x === 4) c.moveTo(sx + x, y); else c.lineTo(sx + x, y); }
          c.stroke(); c.restore();
          P.txt(c, lab, sx + sw2 / 2, sy - 8, DIM, '700 13px');
        };
        scr(W * 0.06, H * 0.27, W * 0.27, H * 0.17, false, '들어오는 전류', '#7fb4ff');
        scr(W * 0.62, H * 0.27, W * 0.27, H * 0.17, on, '나가는 전류', on ? EL : '#7fb4ff');
        P.txt(c, '+ 쪽', W * 0.06 - 4, H * 0.27 + 14, 'rgba(185,194,216,.7)', '600 11px', 'right'); P.txt(c, '− 쪽', W * 0.06 - 4, H * 0.44 - 4, 'rgba(185,194,216,.7)', '600 11px', 'right');
      },
      hint: (W, H) => [W * 0.36, H * 0.5, W * 0.24],
      say(v, moved) {
        return [v < 0.9 ? '콘센트의 전류는 앞뒤로 출렁인다 — 방향이 <b>계속 바뀐다</b>' : '다이오드를 지나자 전류가 <b>한쪽 방향</b>으로만 흐르고 휴대폰이 충전된다',
          moved ? (v < 0.9 ? '다이오드를 끝까지 끼워 보자' : '오른쪽 화면에서 아래쪽 물결이 사라졌다') : '오른쪽으로 끌어 다이오드를 끼우자', v >= 0.9];
      },
    },
  };
  function mount(root, kind) {
    const K = Object.create(KINDS[kind]), P = window.Play;
    const stage = root.querySelector('.au-stage'), out = root.querySelector('.au-out'), now = root.querySelector('.au-now');
    let v = 0, v0 = 0, x0 = 0, t = 0, moved = false;
    function set(x) { v = Math.max(0, Math.min(1, x)); const [o, n, done] = K.say(v, moved); out.innerHTML = o; now.textContent = n; now.classList.toggle('done', !!done); }
    const S = P.make(stage, {
      draw(c, W, H, dt) { t += dt; c.fillStyle = '#0b0e18'; c.fillRect(0, 0, W, H); K.draw(c, P, W, H, v, t, dt); if (!moved && K.hint) { const [hx, hy, dx] = K.hint(W, H); hand(c, hx, hy, dx, t); } },
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
