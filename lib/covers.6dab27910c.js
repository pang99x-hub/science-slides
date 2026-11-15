/* 3-3 새 차시 표지 네 가지: 화면을 좌우로 끌면(화살표 키) 값 v(0~1)가 바뀌고 그림이 따라 움직인다(3-2 covers.js와 같은 뼈대).
   Cov.mount(root, 종류) → { fit, setActive } · 종류: potato(감자와 과산화 수소수) wilt(시든 잎과 맑은 물) triple(염기 묶음) stop(코돈 읽기)
   시험용: root._cv.set(0~1) · 크기·개수·빠르기·시간은 이해를 돕기 위한 예
   그림은 위 44px(안내 띠 .au-now 자리)을 비우고 그린다. 처음에는 아래에 끄는 방향 손가락 표시가 뜨고 한 번 끌면 사라진다. */
(function () {
  'use strict';
  const TAU = Math.PI * 2, INK = '#fbfcf9', YEL = '#ffd84d', DIM = 'rgba(185,194,216,.7)', FONT = '"IBM Plex Sans KR", sans-serif', TOP = 44;
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), ease = (u) => u * u * (3 - 2 * u);
  const line = (c, x0, y0, x1, y1, col, w, dash) => { c.strokeStyle = col; c.lineWidth = w; c.setLineDash(dash || []); c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke(); c.setLineDash([]); };
  const rr = (c, x, y, w, h, r, fill, stroke, lw) => { c.beginPath(); c.roundRect(x, y, w, h, r); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1.5; c.stroke(); } };
  const lin = (c, x0, y0, x1, y1, stops) => { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); return g; };
  const rad = (c, x, y, r, stops) => { const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.08, x, y, r * 1.05); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); return g; };
  const circ = (c, x, y, r, fill, stroke, lw) => { c.beginPath(); c.arc(x, y, r, 0, TAU); if (fill) { c.fillStyle = fill; c.fill(); } if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw || 1.5; c.stroke(); } };
  function pill(c, x, y, t, bg, fg, f = '700 15px') {
    c.font = `${f} ${FONT}`; const w = c.measureText(t).width + 18;
    rr(c, x - w / 2, y - 13, w, 26, 13, bg); c.fillStyle = fg; c.textAlign = 'center'; c.fillText(t, x, y + 5.5);
  }
  const txt = (c, t, x, y, col, f, al = 'center') => { c.font = `${f} ${FONT}`; c.fillStyle = col; c.textAlign = al; c.fillText(t, x, y); };
  const shadow = (c, x, y, w, a) => { c.fillStyle = `rgba(0,0,0,${a})`; c.beginPath(); c.ellipse(x, y, w, w * 0.22, 0, 0, TAU); c.fill(); };
  function backdrop(c, W, H, tint) {
    c.fillStyle = lin(c, 0, 0, 0, H, ['#16203c', '#0d1224', '#0a0d18']); c.fillRect(0, 0, W, H);
    const g = c.createRadialGradient(W * 0.5, H * 0.4, 10, W * 0.5, H * 0.4, W * 0.7); g.addColorStop(0, tint || 'rgba(90,120,200,.16)'); g.addColorStop(1, 'rgba(90,120,200,0)'); c.fillStyle = g; c.fillRect(0, 0, W, H);
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
  // 유리 시험관(둥근 바닥) 길: 안쪽 액체·조각을 그릴 때 잘라 쓰는 모양
  const tubePath = (c, x, top, bot, w) => { c.beginPath(); c.moveTo(x - w / 2, top); c.lineTo(x - w / 2, bot - w / 2); c.arc(x, bot - w / 2, w / 2, Math.PI, 0, true); c.lineTo(x + w / 2, top); };
  // 감자 조각: 날것은 옅은 노랑에 녹말 점, 삶은 것은 진하고 반투명
  function potato(c, x, y, w, h, boiled, rot) {
    c.save(); c.translate(x, y); c.rotate(rot); c.beginPath();
    c.moveTo(-w / 2, -h * 0.3); c.quadraticCurveTo(-w * 0.45, -h / 2, -w * 0.1, -h * 0.48); c.quadraticCurveTo(w * 0.4, -h * 0.55, w / 2, -h * 0.15); c.quadraticCurveTo(w * 0.52, h * 0.45, w * 0.1, h / 2); c.quadraticCurveTo(-w * 0.5, h * 0.5, -w / 2, -h * 0.3); c.closePath();
    c.fillStyle = boiled ? lin(c, 0, -h / 2, 0, h / 2, ['#e4c27a', '#c79a4b', '#9c7130']) : lin(c, 0, -h / 2, 0, h / 2, ['#fbf1c4', '#eedc96', '#cdb66a']); c.fill();
    c.strokeStyle = boiled ? '#7a5523' : '#a8924f'; c.lineWidth = 1.2; c.stroke();
    c.fillStyle = boiled ? 'rgba(255,240,200,.25)' : 'rgba(160,130,60,.35)'; [[-0.2, -0.1], [0.15, 0.1], [0.05, -0.25], [-0.1, 0.25]].forEach(([a, b]) => circ(c, a * w, b * h, 1.6));
    c.restore();
  }

  const KINDS = {
    potato: {
      hintAt: [0.5, 0.6],
      hint: '오른쪽으로 끌어 더 오래 담가 두기',
      draw(c, P, W, H, v, t) {
        // 나무 시험관대 위 시험관 셋: A 과산화 수소수만 · B 생감자 · C 삶은 감자. v = 지난 시간(0~5분, 예)
        const yb = H * 0.86, top = H * 0.17, tw = Math.min(54, W * 0.09), lv = H * 0.44;
        c.fillStyle = lin(c, 0, yb, 0, H, ['#5a3d22', '#3a2716', '#22170d']); c.fillRect(0, yb + 6, W, H - yb);
        line(c, 0, yb + 6, W, yb + 6, 'rgba(255,220,170,.35)', 1.5);
        rr(c, W * 0.1, yb - H * 0.2, W * 0.8, 12, 3, lin(c, 0, yb - H * 0.2, 0, yb - H * 0.2 + 12, ['#c89a5f', '#8a5f31']));
        rr(c, W * 0.1, yb - 6, W * 0.8, 12, 3, lin(c, 0, yb - 6, 0, yb + 6, ['#c89a5f', '#7a522a']));
        [W * 0.11, W * 0.88].forEach((x) => rr(c, x, yb - H * 0.2, 9, H * 0.2 + 6, 2, '#7a522a'));
        const mins = v * 5;
        [['A', '과산화 수소수만', 0, -1], ['B', '+ 생감자', 1, 0], ['C', '+ 삶은 감자', 0.05, 1]].forEach(([n, name, amt, pot], i) => {
          const x = W * (0.24 + i * 0.26), bot = yb - 2, foam = amt * ease(clamp(v * 1.2, 0, 1)) * (lv - top - 6);
          shadow(c, x, yb + 7, tw * 0.8, 0.35);
          c.save(); tubePath(c, x, top, bot, tw); c.clip();
          c.fillStyle = lin(c, x - tw / 2, 0, x + tw / 2, 0, ['rgba(140,190,240,.35)', 'rgba(170,215,255,.22)', 'rgba(110,160,220,.38)']); c.fillRect(x - tw / 2, lv, tw, bot - lv + 2);
          line(c, x - tw / 2, lv, x + tw / 2, lv + Math.sin(t * 2 + i) * 1.2, 'rgba(220,240,255,.7)', 1.5);
          if (pot >= 0) potato(c, x, bot - tw * 0.42, tw * 0.62, tw * 0.42, pot === 1, 0.25 - i * 0.2);
          const nb = Math.round(amt * Math.min(1, v * 3) * 30);
          for (let k = 0; k < nb; k++) { const ph = (t * (0.45 + (k % 5) * 0.08) + k * 0.137) % 1, by = bot - tw * 0.5 - ph * (bot - tw * 0.5 - lv + foam * 0.2); circ(c, x + Math.sin(k * 2.4 + t * 1.5) * tw * 0.3, by, 1.5 + (k % 3), 'rgba(255,255,255,.18)', 'rgba(255,255,255,.75)', 1); }
          if (foam > 1) {
            for (let k = 0; k < 18; k++) { const fx = x - tw / 2 + (k % 6 + 0.5) * tw / 6, fy = lv - (Math.floor(k / 6) + 0.5) * foam / 3 + Math.sin(t * 3 + k) * 1.2; circ(c, fx, fy, Math.max(2, foam / 5), 'rgba(250,252,255,.85)', 'rgba(190,205,230,.8)', 1); }
          }
          c.restore();
          // 넘쳐 오르는 거품(B만)
          if (amt > 0.5 && v > 0.75) { const k2 = (v - 0.75) / 0.25; for (let k = 0; k < 7; k++) circ(c, x - tw * 0.4 + k * tw * 0.13, top - 4 - Math.abs(Math.sin(k * 1.7)) * 10 * k2 + Math.sin(t * 3 + k) * 1.5, 5 + 3 * k2, 'rgba(250,252,255,.9)', 'rgba(190,205,230,.8)', 1); }
          // 유리 테두리와 빛 반사
          tubePath(c, x, top, bot, tw); c.strokeStyle = 'rgba(220,232,255,.85)'; c.lineWidth = 2; c.stroke();
          line(c, x - tw / 2 - 3, top, x + tw / 2 + 3, top, 'rgba(220,232,255,.85)', 3);
          rr(c, x - tw * 0.32, top + 8, 4, bot - top - tw * 0.8, 2, 'rgba(255,255,255,.28)');
          pill(c, x, top - 18, n, i === 1 ? YEL : 'rgba(185,194,216,.9)', '#1d2433', '800 15px');
          txt(c, name, x, yb + 30, INK, '700 15px');
          if (amt > 0.5 && v > 0.15) pill(c, x + tw * 1.25, lv - 20, '산소 기포', 'rgba(61,139,217,.95)', '#fff', '700 13px');
        });
        // 시계(지난 시간)
        const cx = W - 34, cy = 24; circ(c, cx, cy, 18, '#f4f1e6', '#1d2433', 2); line(c, cx, cy, cx + Math.sin(mins / 5 * TAU) * 13, cy - Math.cos(mins / 5 * TAU) * 13, '#c0392b', 2.5); line(c, cx, cy, cx, cy - 9, '#1d2433', 2.5);
        txt(c, `${mins.toFixed(1)}분`, cx - 26, cy + 6, INK, '700 15px', 'right');
      },
      say(v, moved) { return [v < 0.05 ? '시험관 셋에 같은 양의 <b>과산화 수소수</b> — B에는 생감자, C에는 삶은 감자를 넣었다' : v < 0.9 ? 'B에서만 <b>기포</b>가 줄줄이 올라온다 — A와 C는 조용하다' : 'B는 거품이 넘칠 듯하고 <b>삶은 감자</b>(C)에서는 거의 나지 않는다', moved ? (v < 0.9 ? '오른쪽 끝까지 끌어 감자를 더 오래 담가 두자' : '삶으면 무엇이 달라질까?') : '예측을 고른 뒤 오른쪽으로 끌어 보자', v >= 0.9]; },
    },
    wilt: {
      hint: '오른쪽으로 끌면 잎을 물에 오래 담가 둔다',
      draw(c, P, W, H, v, t) {
        // 왼쪽: 물그릇에 꽂은 상추 잎이 시들었다가 일어선다 · 오른쪽: 돋보기 속 잎 세포 하나(세포벽 안에서 액포·세포막이 부푼다)
        const e = ease(v), bx = W * 0.24, by = H * 0.78, gw = W * 0.34;
        // 유리그릇과 물
        c.save(); c.beginPath(); c.moveTo(bx - gw / 2, H * 0.56); c.lineTo(bx - gw * 0.42, by + 18); c.quadraticCurveTo(bx, by + 30, bx + gw * 0.42, by + 18); c.lineTo(bx + gw / 2, H * 0.56); c.closePath();
        c.clip(); c.fillStyle = lin(c, 0, H * 0.62, 0, by + 30, ['rgba(120,190,245,.45)', 'rgba(60,120,200,.55)']); c.fillRect(bx - gw, H * 0.62 + Math.sin(t * 1.5) * 1.5, gw * 2, H); c.restore();
        c.beginPath(); c.moveTo(bx - gw / 2, H * 0.56); c.lineTo(bx - gw * 0.42, by + 18); c.quadraticCurveTo(bx, by + 30, bx + gw * 0.42, by + 18); c.lineTo(bx + gw / 2, H * 0.56); c.strokeStyle = 'rgba(220,232,255,.8)'; c.lineWidth = 2; c.stroke();
        shadow(c, bx, by + 30, gw * 0.45, 0.4);
        // 잎 세 장: 시들면 처지고 주름, 싱싱하면 곧게
        [[-0.5, 0.95], [0.1, 1.1], [0.6, 0.9]].forEach(([s, L0], i) => {
          const sway = Math.sin(t * 1.2 + i) * 0.03, a = s * (0.35 + (1 - e) * 0.9) + sway, L = H * 0.48 * L0 * (0.85 + e * 0.15);
          const x0 = bx + s * 10, y0 = H * 0.66, tx = x0 + Math.sin(a) * L, ty = y0 - Math.cos(a) * L * (0.55 + e * 0.45) + (1 - e) * L * 0.25;
          const mx = (x0 + tx) / 2 + (1 - e) * s * 26, my = (y0 + ty) / 2 - 10;
          const g = lin(c, x0, y0, tx, ty, e > 0.5 ? ['#3f8f3a', '#6cc25a', '#9de07f'] : ['#5f7a35', '#8fa34f', '#b8b56a']);
          c.fillStyle = g; c.beginPath(); c.moveTo(x0, y0);
          const wob = (1 - e) * 6; c.bezierCurveTo(mx - 26 + Math.sin(t + i) * wob, my, tx - 18, ty + 10, tx, ty); c.bezierCurveTo(tx + 18, ty + 14, mx + 26 - Math.sin(t + i) * wob, my + 8, x0 + 3, y0); c.fill();
          c.strokeStyle = 'rgba(230,255,210,.65)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x0 + 1, y0); c.quadraticCurveTo(mx, my + 4, tx, ty); c.stroke();
          for (let k = 1; k < 4; k++) { const u = k / 4, px = x0 + (tx - x0) * u + (mx - (x0 + tx) / 2) * Math.sin(u * Math.PI), py = y0 + (ty - y0) * u + (my - (y0 + ty) / 2) * Math.sin(u * Math.PI); line(c, px, py, px - 5, py - 4, 'rgba(230,255,210,.4)', 1.2); line(c, px, py, px + 5, py - 3, 'rgba(230,255,210,.4)', 1.2); }
        });
        pill(c, bx, by + 2, e < 0.5 ? '시든 상추 잎' : '다시 싱싱해진 잎', e < 0.5 ? 'rgba(184,181,106,.95)' : 'rgba(108,194,90,.95)', '#1d2433');
        // 돋보기 연결선과 원
        const cx = W * 0.7, cy = H * 0.47, R = Math.min(W * 0.25, H * 0.42);
        c.fillStyle = 'rgba(255,216,77,.08)'; c.beginPath(); c.moveTo(bx + 14, H * 0.38); c.lineTo(cx - R * 0.7, cy - R * 0.7); c.lineTo(cx - R * 0.7, cy + R * 0.7); c.lineTo(bx + 14, H * 0.46); c.fill();
        circ(c, bx + 14, H * 0.42, 8, null, YEL, 2);
        c.save(); c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.clip();
        c.fillStyle = lin(c, 0, cy - R, 0, cy + R, ['#1b3a2a', '#12281d']); c.fillRect(cx - R, cy - R, R * 2, R * 2);
        // 이웃 세포 벽 무늬
        for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) if (i || j) rr(c, cx + i * R * 0.95 - R * 0.44, cy + j * R * 0.62 - R * 0.28, R * 0.88, R * 0.56, 8, 'rgba(110,190,90,.10)', 'rgba(140,210,110,.35)', 3);
        const cw = R * 0.88, ch = R * 0.56, k = 0.55 + e * 0.42;
        rr(c, cx - cw / 2, cy - ch / 2, cw, ch, 10, 'rgba(150,220,130,.12)', '#8fdc6f', 5);
        // 원형질(세포막 안): 시들면 오그라든다
        rr(c, cx - cw / 2 * k + 4, cy - ch / 2 * k + 4, cw * k - 8, ch * k - 8, 12 * k, 'rgba(130,200,110,.45)', YEL, 2.2);
        rr(c, cx - cw / 2 * k * 0.78, cy - ch / 2 * k * 0.6, cw * k * 0.78, ch * k * 0.6, 10, rad(c, cx, cy, cw * 0.3, ['rgba(200,235,255,.75)', 'rgba(120,190,240,.55)', 'rgba(80,140,210,.5)']));
        for (let q = 0; q < 7; q++) { const a = q / 7 * TAU + t * 0.15; c.fillStyle = '#2f8a32'; c.beginPath(); c.ellipse(cx + Math.cos(a) * cw * k * 0.43, cy + Math.sin(a) * ch * k * 0.36, 5, 3, a, 0, TAU); c.fill(); }
        circ(c, cx - cw * k * 0.32, cy - ch * k * 0.18, 7, '#5f6fb0', '#3a4680', 1.5);
        // 들어오는 물 알갱이(바깥 → 안)
        const rate = 0.25 + (1 - e) * 0.75;
        for (let q = 0; q < 12; q++) { const ph = (t * 0.35 * (0.6 + rate) + q / 12) % 1, a = q * 0.52 + 0.2, rx = R * (0.95 - ph * 0.6), px = cx + Math.cos(a) * rx, py = cy + Math.sin(a) * rx * 0.62; circ(c, px, py, 3.5, 'rgba(120,200,255,.95)'); c.globalAlpha = 0.5; line(c, px, py, px + Math.cos(a) * 9, py + Math.sin(a) * 6, 'rgba(120,200,255,.8)', 2); c.globalAlpha = 1; }
        c.restore();
        circ(c, cx, cy, R, null, '#d9dfef', 5); circ(c, cx, cy, R + 4, null, 'rgba(0,0,0,.4)', 2);
        txt(c, '세포벽', cx + cw / 2 - 2, cy - ch / 2 - 8, '#9be07b', '700 13px', 'right');
        txt(c, '세포막', cx - cw * k / 2 + 6, cy + ch * k / 2 + 16, YEL, '700 13px', 'left');
        txt(c, '액포', cx + 6, cy + 5, '#e6f4ff', '700 13px');
        pill(c, cx, H * 0.06, '잎 세포 하나(돋보기)', 'rgba(217,223,239,.9)', '#1d2433');
      },
      say(v, moved) { return [v < 0.05 ? '시든 잎을 <b>맑은 물</b>에 담갔다 — 세포 속 원형질이 세포벽에서 오그라들어 있다' : v < 0.9 ? '물 알갱이가 세포 <b>안으로</b> 들어가 액포가 커진다' : '세포막이 세포벽을 밀 만큼 <b>팽팽</b>해졌다 — 잎이 다시 선다', moved ? (v < 0.9 ? '오른쪽 끝까지 끌어 잎을 더 오래 담가 두자' : '물은 왜 안으로 들어갔을까?') : '예측을 고른 뒤 오른쪽으로 끌어 보자', v >= 0.9]; },
    },
    triple: {
      hint: '오른쪽으로 끌면 한 묶음이 길어진다',
      n(v) { return v < 0.34 ? 1 : v < 0.67 ? 2 : 3; },
      draw(c, P, W, H, v, t) {
        // 위: RNA 띠(염기가 계속 흘러감)에 n개씩 묶는 괄호 · 가운데: 묶음 가짓수만큼의 타일 · 오른쪽: 아미노산 20종류 구슬
        const n = this.n(v), cnt = 4 ** n, B = 'AUGC', COL = ['#f2a541', '#e86a8a', '#5fbf6a', '#4f9be0'];
        const y = H * 0.12, bw = 26, x0 = W * 0.06, shift = (t * 18) % (bw * 1);
        rr(c, x0 - 6, y - 6, W * 0.88, bw + 12, 8, 'rgba(255,255,255,.05)');
        c.save(); c.beginPath(); c.rect(x0, y - 8, W * 0.88 - 12, bw + 18); c.clip();
        line(c, x0 - bw, y + bw + 4, x0 + W, y + bw + 4, 'rgba(230,180,255,.6)', 3);
        const seq = 'AUGGCUUACGGAUCCAGUGCAUUGACGUAGCC';
        for (let i = -1; i < 26; i++) { const k = ((i + Math.floor(t * 18 / bw)) % seq.length + seq.length) % seq.length, ch = seq[k], bi = B.indexOf(ch), x = x0 + i * bw - shift + bw;
          rr(c, x + 2, y, bw - 4, bw, 5, lin(c, 0, y, 0, y + bw, [COL[bi], COL[bi] + 'aa'])); txt(c, ch, x + bw / 2, y + bw * 0.72, '#14182a', '800 15px'); }
        c.restore();
        [[x0 - 6, 1], [x0 + W * 0.88 - 40, -1]].forEach(([fx, d]) => { const g = c.createLinearGradient(fx + (d > 0 ? 0 : 34), 0, fx + (d > 0 ? 34 : 0), 0); g.addColorStop(0, 'rgba(13,18,36,1)'); g.addColorStop(1, 'rgba(13,18,36,0)'); c.fillStyle = g; c.fillRect(fx, y - 8, 34, bw + 18); });
        // 괄호(묶음)
        const gx = x0 + bw * 2; for (let g = 0; g < 4; g++) { const xa = gx + g * n * bw + 3, xb = xa + n * bw - 6; if (xb > x0 + W * 0.86) break; c.strokeStyle = g === 0 ? YEL : 'rgba(255,216,77,.45)'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(xa, y - 8); c.lineTo(xa, y - 12); c.lineTo(xb, y - 12); c.lineTo(xb, y - 8); c.stroke(); }
        // 타일 격자
        const cols = n === 1 ? 4 : n === 2 ? 8 : 16, rows = cnt / cols, area = W * 0.62, s = Math.min(area / cols, H * 0.46 / rows, 64), tx0 = W * 0.06, ty0 = H * 0.3;
        const scan = Math.floor((t * 22) % (cnt + 12));
        for (let i = 0; i < cnt; i++) {
          const cx = tx0 + (i % cols) * s, cy = ty0 + Math.floor(i / cols) * s, on = i < 20, lit = i === scan;
          rr(c, cx + 1.5, cy + 1.5, s - 3, s - 3, Math.min(8, s * 0.2), on ? lin(c, 0, cy, 0, cy + s, ['#ffe98a', '#e0b423']) : 'rgba(185,194,216,.22)', lit ? '#fff' : on ? '#8a6a10' : 'rgba(185,194,216,.45)', lit ? 2.5 : 1);
          let code = ''; for (let q = n - 1, m = i; q >= 0; q--) { code = B[m % 4] + code; m = Math.floor(m / 4); }
          if (s >= 20) txt(c, code, cx + s / 2, cy + s / 2 + (s > 40 ? 6 : 4), on ? '#3a2c05' : '#d4d9e8', `800 ${s > 40 ? 18 : s > 30 ? 12 : 9}px`);
        }
        txt(c, `염기 ${n}개 묶음 → ${Array(n).fill(4).join('×')}${n > 1 ? ` = ${cnt}` : ''}가지`, tx0, ty0 + rows * s + 26, INK, '800 18px', 'left');
        // 아미노산 20종류 구슬(오른쪽 4×5)
        const ax = W * 0.76, ay = H * 0.3, as = Math.min(W * 0.045, 24);
        txt(c, '아미노산 20종류', ax + as * 2, ay - 12, INK, '700 14px');
        for (let i = 0; i < 20; i++) { const px = ax + (i % 4) * as * 1.05 + as / 2, py = ay + Math.floor(i / 4) * as * 1.05 + as / 2, got = i < cnt; c.globalAlpha = got ? 1 : 0.28; circ(c, px, py + (got ? Math.sin(t * 2 + i) * 1.2 : 0), as * 0.42, rad(c, px, py, as * 0.42, [`hsl(${i * 18},85%,78%)`, `hsl(${i * 18},70%,52%)`, `hsl(${i * 18},70%,28%)`])); c.globalAlpha = 1; }
        const ok = cnt >= 20;
        pill(c, ax + as * 2.1, ay + as * 5.6 + 12, ok ? `20종류를 모두 정한다` : `${20 - cnt}종류는 정할 묶음이 없다`, ok ? YEL : 'rgba(255,139,107,.95)', '#1d2433', '800 14px');
      },
      say(v, moved) { const n = this.n(v), cnt = 4 ** n; return [`염기 <b>${n}개</b>를 한 묶음으로 읽으면 묶음은 <b>${cnt}가지</b> — 아미노산은 20종류`, moved ? (n < 3 ? '오른쪽으로 더 끌어 묶음을 늘려 보자' : '64가지면 20종류를 모두 정하고도 남는다') : '예측을 고른 뒤 오른쪽으로 끌어 보자', n === 3]; },
    },
    stop: {
      hint: '오른쪽으로 끌면 라이보솜이 한 칸씩 간다',
      draw(c, P, W, H, v, t) {
        // RNA 띠 위를 라이보솜(큰·작은 단위체)이 코돈 단위로 옮겨 가며 아미노산 사슬을 잇는다. 종결코돈 UAA에서 멈추고 사슬이 떨어진다
        const CD = ['AUG', 'GUU', 'AAA', 'UGG', 'UAA', 'GCA'], AA = ['메싸이오닌', '발린', '라이신', '트립토판'], ACOL = [['#ffb49a', '#e4572e', '#8a2a12'], ['#a9d2ff', '#3d8bd9', '#1b4f8a'], ['#b8f0a8', '#4fae4a', '#1f5e1d'], ['#e2c7ff', '#9a6ad8', '#4b2a80']];
        const BC = { A: '#f2a541', U: '#e86a8a', G: '#5fbf6a', C: '#4f9be0' };
        const cw = W * 0.145, x0 = W * 0.06, y = H * 0.72, bw = cw / 3, pos = Math.min(4, v * 4.4), k = Math.floor(pos + 0.001), end = pos >= 4, slide = ease(pos - Math.floor(pos));
        const rx = x0 + pos * cw + cw / 2, bob = Math.sin(t * 3) * 1.5;
        c.fillStyle = rad(c, rx, y + 30, cw * 0.62, ['#c9b6ff', '#8c72d8', '#4a3a8a']); c.beginPath(); c.ellipse(rx, y + 32, cw * 0.6, 16, 0, 0, TAU); c.fill();
        // RNA 뼈대와 염기
        c.strokeStyle = 'rgba(230,180,255,.75)'; c.lineWidth = 4; c.beginPath(); for (let x = x0 - 20; x <= x0 + 6 * cw + 10; x += 6) c.lineTo(x, y + 30 + Math.sin(x * 0.05 + t * 1.5) * 2); c.stroke();
        CD.forEach((s, i) => {
          [...s].forEach((ch, j) => { const bx = x0 + i * cw + j * bw; rr(c, bx + 3, y - 2, bw - 6, 30, 4, lin(c, 0, y, 0, y + 30, [BC[ch], BC[ch] + 'aa'])); txt(c, ch, bx + bw / 2, y + 19, '#14182a', '800 14px'); });
          if (i === 0 || i === 4) { rr(c, x0 + i * cw + 1, y - 5, cw - 2, 36, 7, null, i === 0 ? '#7fd66b' : '#ff8b6b', 2.5); }
        });
        txt(c, '개시코돈', x0 + cw / 2, y + 64, '#7fd66b', '700 13px'); txt(c, '종결코돈', x0 + 4.5 * cw, y + 64, '#ff8b6b', '700 13px'); txt(c, 'RNA', x0 - 4, y - 12, DIM, '700 13px', 'left');
        // 라이보솜
        c.fillStyle = rad(c, rx, y - 30, cw * 0.72, ['#e7dcff', '#a68ae8', '#5b44a0']); c.beginPath(); c.ellipse(rx, y - 30 + bob, cw * 0.64, 26, 0, 0, TAU); c.fill();
        c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(rx - cw * 0.25, y - 42 + bob, cw * 0.18, 7, -0.3, 0, TAU); c.fill();
        rr(c, rx - cw / 2 + 1, y - 5, cw - 2, 36, 7, null, YEL, 2.5);
        pill(c, rx, y - 70, '라이보솜', 'rgba(140,114,216,.95)', '#fff', '700 13px');
        // 아미노산 사슬(라이보솜에서 위로 이어짐)
        const nA = Math.min(4, k + 1), drift = end ? ease(clamp((v - 0.91) / 0.09, 0, 1)) : 0;
        let px = rx, py = y - 56;
        for (let i = nA - 1; i >= 0; i--) {
          const ax = rx - (nA - 1 - i) * 36 - 6 - drift * 40 + Math.sin(t * 1.6 + i) * 3, ay = H * 0.33 - (nA - 1 - i) * 10 - drift * H * 0.12 + Math.cos(t * 1.4 + i) * 3;
          if (i < nA - 1) line(c, px, py, ax, ay, INK, 3);
          circ(c, ax, ay, 15, rad(c, ax, ay, 15, ACOL[i])); c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(ax - 5, ay - 6, 4, 2.5, -0.6, 0, TAU); c.fill();
          if (i === nA - 1) { if (!end) line(c, ax, ay + 15, rx, y - 56, 'rgba(251,252,249,.6)', 2, [3, 3]); }
          txt(c, AA[i], ax, i % 2 ? ay + 31 : ay - 21, INK, '700 12px'); px = ax; py = ay;
        }
        if (end) { pill(c, W * 0.36, H * 0.5, '멈춤 — 사슬이 떨어져 나간다', 'rgba(255,139,107,.95)', '#1d2433', '800 14px'); for (let q = 0; q < 3; q++) { const u = (t * 0.8 + q / 3) % 1; c.strokeStyle = `rgba(255,139,107,${1 - u})`; c.lineWidth = 2; c.beginPath(); c.arc(rx, y + 10, 30 + u * 30, 0, TAU); c.stroke(); } }
      },
      say(v, moved) { const k = Math.min(4, Math.floor(v * 4.4 + 0.001)); return [k < 4 ? `라이보솜이 <b>${['AUG', 'GUU', 'AAA', 'UGG'][k]}</b>를 읽어 <b>${['메싸이오닌', '발린', '라이신', '트립토판'][k]}</b>을 잇는다` : '<b>UAA</b>에는 짝이 되는 아미노산이 없다 — 여기서 <b>멈춘다</b>', moved ? (k < 4 ? '오른쪽으로 끌어 다음 코돈을 읽자' : '뒤에 남은 염기는 읽지 않는다') : '예측을 고른 뒤 오른쪽으로 끌어 보자', k >= 4]; },
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
