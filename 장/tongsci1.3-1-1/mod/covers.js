/* 3-1 새 차시 표지 두 가지: 화면을 좌우로 끌면(화살표 키) 값 v(0~1)가 바뀌고 그림이 따라 움직인다.
   Cov.mount(root, 종류) → { fit, setActive } · 종류:
   alt(높이 올라가며 기온 재 보기) — 땅(언덕·마을)에서 100 km 위 우주까지 하늘 기둥. 대류권 구름·비, 성층권 오존층이 자외선을 막음,
        중간권 유성, 열권 오로라. 기상 관측 기구가 올라가며 부풀고(높을수록 공기가 옅다) 성층권 위로는 관측 로켓으로 바뀐다.
        오른쪽 기온-높이 그래프에 지나온 만큼 선이 그려지고, 온도계가 오르내린다.
   quake(땅속 흔들림을 땅 위로 보내 보기) — 지층 단면 속 진원에서 지진파 고리가 잇달아 퍼져 땅 위 진앙·마을에 닿으면
        집이 흔들리고 먼지가 일며, 오른쪽 위 지진계 기록에 흔들림이 그려진다.
   끌기 전에는 손가락이 끌 방향을 보여 주고, 한 번 끌면 사라진다. 시험용: root._cv.set(0~1) · 크기·모양은 이해를 돕기 위한 예 */
(function () {
  'use strict';
  const TAU = Math.PI * 2, EL = '#ffd84d', DIM = '#b9c2d8';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k, ease = (u) => u * u * (3 - 2 * u);
  const dot = (c, x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); };
  const LAYERS = [[0, '대류권', '올라갈수록 기온이 <b>내려간다</b> — 구름과 비가 여기에'], [11, '성층권', '올라갈수록 기온이 <b>올라간다</b> — 오존층이 여기에'], [50, '중간권', '올라갈수록 기온이 다시 <b>내려간다</b>'], [80, '열권', '올라갈수록 기온이 다시 <b>올라간다</b>']];
  // 높이 → 화면 비율(대류권을 넓게): 대류권 30% · 성층권 25% · 중간권 20% · 열권 25%
  const fh = (h) => (h < 11 ? h / 11 * 0.3 : h < 50 ? 0.3 + (h - 11) / 39 * 0.25 : h < 80 ? 0.55 + (h - 50) / 30 * 0.2 : 0.75 + (h - 80) / 20 * 0.25);
  const layerAt = (h) => LAYERS.reduce((r, L) => (h >= L[0] ? L : r), LAYERS[0]);
  // 기온 곡선 모양(0 = 가장 낮음 ~ 1 = 가장 높음, 단순하게 그린 것)
  // 기온(°C, 대략값): 땅 15 → 11 km −56 → 50 km −2 → 80 km −90 → 100 km −75(열권은 더 높이 올라갈수록 계속 오른다)
  const PROF = [[0, 15], [11, -56], [50, -2], [80, -90], [100, -75]];
  const tC = (h) => { for (let i = 1; i < PROF.length; i++) if (h <= PROF[i][0]) { const [a, ta] = PROF[i - 1], [b, tb] = PROF[i]; return ta + (tb - ta) * (h - a) / (b - a); } return -75; };
  const temp = (h) => (tC(h) + 100) / 130;
  function pill(c, x, y, t, bg, fg = '#1d2433', f = '800 15px', al = 'center') {
    c.font = `${f} "IBM Plex Sans KR", sans-serif`; const w = c.measureText(t).width + 20, x0 = al === 'left' ? x : al === 'right' ? x - w : x - w / 2;
    c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.roundRect(x0 + 1, y - 12, w, 26, 13); c.fill();
    c.fillStyle = bg; c.beginPath(); c.roundRect(x0, y - 14, w, 26, 13); c.fill(); window.Play.txt(c, t, x0 + w / 2, y + 5, fg, f);
  }
  function cloud(c, x, y, s, a = 1) {
    c.save(); c.globalAlpha = a;
    const g = c.createLinearGradient(0, y - s, 0, y + s * 0.5); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#b8c6dc');
    c.fillStyle = 'rgba(30,40,70,.25)'; c.beginPath(); c.ellipse(x + 3, y + s * 0.45, s * 1.5, s * 0.25, 0, 0, TAU); c.fill();
    c.fillStyle = g; c.beginPath();
    [[-0.9, 0.1, 0.5], [-0.35, -0.25, 0.7], [0.35, -0.15, 0.62], [0.95, 0.12, 0.45], [0, 0.2, 0.6]].forEach(([dx, dy, r]) => { c.moveTo(x + dx * s + r * s, y + dy * s); c.arc(x + dx * s, y + dy * s, r * s, 0, TAU); });
    c.fill(); c.restore();
  }
  function hand(c, x, y, dx, t) {
    const u = (t % 1.8) / 1.8, k = ease(clamp(u / 0.8, 0, 1)), a = u < 0.85 ? 1 : 1 - (u - 0.85) / 0.15, hx = x + dx * k;
    c.save(); c.globalAlpha = 0.9;
    c.strokeStyle = 'rgba(255,216,77,.85)'; c.lineWidth = 3; c.setLineDash([8, 7]); c.beginPath(); c.moveTo(x, y - 30); c.lineTo(x + dx, y - 30); c.stroke(); c.setLineDash([]);
    c.fillStyle = 'rgba(255,216,77,.95)'; c.beginPath(); c.moveTo(x + dx + 12, y - 30); c.lineTo(x + dx - 4, y - 39); c.lineTo(x + dx - 4, y - 21); c.closePath(); c.fill();
    c.globalAlpha = a; c.translate(hx, y);
    c.fillStyle = 'rgba(255,216,77,.35)'; c.beginPath(); c.arc(0, 0, 14 + 6 * Math.sin(t * 6), 0, TAU); c.fill();
    c.fillStyle = '#fff'; c.strokeStyle = '#1d2433'; c.lineWidth = 2.2; c.lineJoin = 'round';
    c.beginPath(); c.roundRect(-6, -2, 12, 30, 6); c.fill(); c.stroke();
    c.beginPath(); c.roundRect(-8, 20, 30, 26, 9); c.fill(); c.stroke();
    [4, 12].forEach((ox) => { c.beginPath(); c.roundRect(ox - 1, 15, 9, 14, 4.5); c.fill(); c.stroke(); });
    c.beginPath(); c.ellipse(-10, 30, 6, 10, -0.5, 0, TAU); c.fill(); c.stroke();
    c.restore();
  }
  function house(c, x, gy, w, h, roof, wall, sh, lit) {
    c.save(); c.translate(x + sh, gy);
    c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(-w / 2 + 3, -h + 3, w, h);
    const g = c.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, wall); g.addColorStop(1, '#8e8778'); c.fillStyle = g; c.fillRect(-w / 2, -h, w, h);
    c.fillStyle = roof; c.beginPath(); c.moveTo(-w / 2 - 6, -h); c.lineTo(0, -h - w * 0.45); c.lineTo(w / 2 + 6, -h); c.closePath(); c.fill();
    c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.moveTo(-w / 2 - 6, -h); c.lineTo(0, -h - w * 0.45); c.lineTo(0, -h - w * 0.38); c.lineTo(-w / 2, -h); c.fill();
    c.fillStyle = lit ? '#ffe27a' : '#3b4a66'; c.fillRect(-w / 2 + 5, -h + 7, w * 0.28, h * 0.3); c.fillRect(w / 2 - 5 - w * 0.28, -h + 7, w * 0.28, h * 0.3);
    c.fillStyle = '#5a3d2a'; c.fillRect(-w * 0.12, -h * 0.45, w * 0.24, h * 0.45);
    c.restore();
  }
  function tower(c, x, gy, w, h, sh, lit, t) {
    c.save(); c.translate(x + sh, gy); c.rotate(sh * 0.004);
    c.fillStyle = 'rgba(0,0,0,.3)'; c.fillRect(-w / 2 + 3, -h + 3, w, h);
    const g = c.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, '#b9c4d6'); g.addColorStop(1, '#6f7b90'); c.fillStyle = g; c.fillRect(-w / 2, -h, w, h);
    for (let r = 0; r < Math.floor(h / 14) - 1; r++) for (let q = 0; q < 3; q++) { c.fillStyle = lit && (r + q) % 3 ? '#ffe27a' : '#2c3a58'; c.fillRect(-w / 2 + 4 + q * (w - 8) / 3, -h + 6 + r * 14, (w - 8) / 3 - 3, 8); }
    c.restore();
  }
  function tree(c, x, gy, s, sw) {
    c.fillStyle = '#5a3d2a'; c.fillRect(x - 2, gy - s * 0.5, 4, s * 0.5);
    const g = c.createRadialGradient(x - s * 0.2 + sw, gy - s * 0.95, 2, x + sw, gy - s * 0.8, s * 0.6); g.addColorStop(0, '#6fcf7a'); g.addColorStop(1, '#2b7a3d');
    c.fillStyle = g; c.beginPath(); c.arc(x + sw, gy - s * 0.85, s * 0.48, 0, TAU); c.fill();
  }

  const KINDS = {
    alt: {
      draw(c, P, W, H, v, t) {
        const y0 = H * 0.86, y1 = H * 0.17, yh = (h) => y0 - fh(h) * (y0 - y1), hh = v * 100;
        // 하늘: 높을수록 어둡게(층마다 색을 조금씩 다르게)
        const sky = c.createLinearGradient(0, y0, 0, 0);
        sky.addColorStop(0, '#7fb6e6'); sky.addColorStop(0.12, '#4c84c4'); sky.addColorStop(0.42, '#22427e'); sky.addColorStop(0.7, '#141f48'); sky.addColorStop(0.85, '#0b1130'); sky.addColorStop(1, '#03050f');
        c.fillStyle = sky; c.fillRect(0, 0, W, y0);
        for (let i = 0; i < 40; i++) { const sx = (i * 97.3) % W, sy = (i * 53.7) % (y1 + 20); c.fillStyle = `rgba(255,255,255,${0.35 + 0.35 * Math.sin(t * 2 + i)})`; c.fillRect(sx, sy, 1.6, 1.6); }
        // 열권 오로라
        c.save(); c.globalCompositeOperation = 'lighter';
        for (let k = 0; k < 3; k++) {
          const g = c.createLinearGradient(0, yh(98), 0, yh(82)); g.addColorStop(0, 'rgba(160,90,255,0)'); g.addColorStop(0.4, 'rgba(120,255,170,.32)'); g.addColorStop(1, 'rgba(60,255,140,0)');
          c.fillStyle = g; c.beginPath(); c.moveTo(0, yh(82));
          for (let x = 0; x <= W; x += 8) c.lineTo(x, yh(90 + 6 * Math.sin(x * 0.012 + t * 0.6 + k * 1.7)) );
          for (let x = W; x >= 0; x -= 8) c.lineTo(x, yh(82 + 2 * Math.sin(x * 0.02 + t + k)));
          c.fill();
        }
        c.restore();
        // 중간권 유성
        for (let k = 0; k < 2; k++) {
          const u = ((t * 0.35 + k * 0.5) % 1), mx = W * (0.15 + 0.5 * k) + u * 90, my = yh(76 - u * 14);
          if (u < 0.5) { const g = c.createLinearGradient(mx - 40, my - 18, mx, my); g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(1, 'rgba(255,240,200,.9)'); c.strokeStyle = g; c.lineWidth = 2; c.beginPath(); c.moveTo(mx - 40, my - 18); c.lineTo(mx, my); c.stroke(); dot(c, mx, my, 2, '#fff'); }
        }
        // 성층권 오존층(20~30 km): 빛나는 띠 + 위에서 오는 자외선이 띠에서 멈춘다
        const oz = c.createLinearGradient(0, yh(31), 0, yh(19)); oz.addColorStop(0, 'rgba(255,190,90,0)'); oz.addColorStop(0.5, 'rgba(255,190,90,.38)'); oz.addColorStop(1, 'rgba(255,190,90,0)');
        c.fillStyle = oz; c.fillRect(0, yh(31), W, yh(19) - yh(31));
        for (let k = 0; k < 4; k++) {
          const ux = W * (0.08 + k * 0.12), u = (t * 0.6 + k * 0.27) % 1, ya = yh(46) + (yh(26) - yh(46)) * u;
          c.strokeStyle = `rgba(200,140,255,${0.8 - u * 0.6})`; c.lineWidth = 2; c.beginPath();
          for (let y = yh(46); y <= ya; y += 2) { const x = ux + Math.sin(y * 0.4) * 3; if (y === yh(46)) c.moveTo(x, y); else c.lineTo(x, y); } c.stroke();
        }
        P.txt(c, '오존층', W * 0.53, yh(25) + 5, '#ffd9a0', '700 13px', 'left');
        // 대류권 구름·비
        cloud(c, W * 0.14 + Math.sin(t * 0.2) * 8, yh(7), 15, 0.95);
        cloud(c, W * 0.47 + Math.sin(t * 0.25 + 1) * 10, yh(5), 13, 0.9);
        c.strokeStyle = 'rgba(190,220,255,.6)'; c.lineWidth = 1.2;
        for (let i = 0; i < 8; i++) { const rx = W * 0.47 - 14 + i * 4, ry = yh(5) + 10 + ((t * 60 + i * 9) % 18); c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx - 2, ry + 5); c.stroke(); }
        // 층 경계·이름
        LAYERS.forEach((L, i) => {
          const top = i < 3 ? LAYERS[i + 1][0] : 100;
          if (i) { c.strokeStyle = 'rgba(220,230,255,.35)'; c.setLineDash([6, 6]); c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, yh(L[0])); c.lineTo(W, yh(L[0])); c.stroke(); c.setLineDash([]); }
          const on = layerAt(hh)[1] === L[1];
          P.txt(c, L[1], 10, yh((L[0] + top) / 2) + 6, on ? EL : DIM, on ? '800 16px' : '700 14px', 'left');
        });
        // 땅: 언덕·마을·나무
        const gg = c.createLinearGradient(0, y0 - 20, 0, H); gg.addColorStop(0, '#4f8f4a'); gg.addColorStop(1, '#23452a');
        c.fillStyle = gg; c.beginPath(); c.moveTo(0, H); c.lineTo(0, y0 + 4);
        for (let x = 0; x <= W; x += 10) c.lineTo(x, y0 + 4 - 10 * Math.sin(x * 0.012) - 6 * Math.sin(x * 0.04));
        c.lineTo(W, H); c.fill();
        [[0.44, 22, 30], [0.49, 16, 44], [0.54, 20, 26]].forEach(([u, w, h]) => { c.fillStyle = '#2d3a55'; c.fillRect(W * u, y0 - h + 6, w, h); c.fillStyle = '#ffe27a'; for (let r = 0; r < h / 10 - 1; r++) c.fillRect(W * u + 4, y0 - h + 10 + r * 10, 4, 4); });
        [0.08, 0.14, 0.6].forEach((u) => tree(c, W * u, y0 + 4, 22, Math.sin(t * 1.5 + u * 9) * 1.2));
        // 기온 그래프(오른쪽 판)
        const gx0 = W * 0.64, gx1 = W * 0.95, tx = (h) => gx0 + 14 + (gx1 - gx0 - 28) * temp(h);
        c.fillStyle = 'rgba(8,12,30,.55)'; c.beginPath(); c.roundRect(gx0, yh(100) - 8, gx1 - gx0, yh(0) - yh(100) + 16, 10); c.fill();
        c.strokeStyle = 'rgba(200,212,240,.5)'; c.lineWidth = 1.5; c.strokeRect(gx0 + 8, yh(100), 0.1, yh(0) - yh(100));
        for (const h of [0, 11, 50, 80, 100]) { c.fillStyle = 'rgba(200,212,240,.6)'; c.fillRect(gx0 + 4, yh(h) - 0.75, 8, 1.5); P.txt(c, `${h}`, gx0 - 3, yh(h) + 4, 'rgba(200,212,240,.8)', '600 11px', 'right'); }
        P.txt(c, 'km', gx0 - 3, yh(100) - 12, 'rgba(200,212,240,.8)', '600 11px', 'right'); P.txt(c, '높이 간격은 비례 아님', gx1, yh(100) - 12, 'rgba(255,216,77,.85)', '700 9.5px', 'right');
        [-90, -60, -30, 0, 30].forEach((q) => { const x = gx0 + 14 + (gx1 - gx0 - 28) * (q + 100) / 130; c.fillStyle = 'rgba(200,212,240,.18)'; c.fillRect(x - 0.5, yh(100), 1, yh(0) - yh(100)); P.txt(c, `${q}`, x, yh(0) + 14, 'rgba(200,212,240,.85)', '600 10px'); });
        c.save(); c.shadowColor = EL; c.shadowBlur = 8; c.strokeStyle = EL; c.lineWidth = 4; c.beginPath(); for (let h = 0; h <= hh; h += 0.5) { if (h) c.lineTo(tx(h), yh(h)); else c.moveTo(tx(h), yh(h)); } c.stroke(); c.restore();
        P.glow(c, tx(hh), yh(hh), 16, 'rgba(255,216,77,.6)'); dot(c, tx(hh), yh(hh), 5, EL);
        P.txt(c, '기온(°C, 대략값)', (gx0 + gx1) / 2, H - 6, DIM, '700 12px');
        if (hh >= 98) { c.save(); c.globalAlpha = 0.6 + 0.4 * Math.sin(t * 4); c.strokeStyle = EL; c.lineWidth = 2.5; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(tx(100), yh(100)); c.lineTo(tx(100) + 26, yh(100) - 12); c.stroke(); c.restore(); }
        // 관측 기구(35 km 위로는 관측 로켓)
        const bx = W * 0.25, rB = 13 + hh * 0.35, by = yh(hh) - (hh < 35 ? rB + 34 : 22) + Math.sin(t * 2) * 2;
        c.strokeStyle = 'rgba(255,255,255,.18)'; c.setLineDash([3, 5]); c.lineWidth = 1.5; c.beginPath(); c.moveTo(bx, yh(0)); c.lineTo(bx, yh(hh)); c.stroke(); c.setLineDash([]);
        if (hh < 35) {
          const r = rB, sw = Math.sin(t * 1.7) * 4;
          c.strokeStyle = '#d7dbe6'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(bx, by + r); c.lineTo(bx + sw, by + r + 26); c.stroke();
          c.fillStyle = '#e4572e'; c.beginPath(); c.moveTo(bx - 7 + sw * 0.6, by + r + 12); c.quadraticCurveTo(bx + sw * 0.6, by + r + 4, bx + 7 + sw * 0.6, by + r + 12); c.fill();
          c.fillStyle = '#f2f0e6'; c.fillRect(bx - 6 + sw, by + r + 26, 12, 10); c.fillStyle = '#e4572e'; c.fillRect(bx - 6 + sw, by + r + 29, 12, 2);
          const g = c.createRadialGradient(bx - r * 0.35, by - r * 0.4, r * 0.1, bx, by, r); g.addColorStop(0, '#ffffff'); g.addColorStop(0.6, '#e9e6dc'); g.addColorStop(1, '#a7a294');
          c.fillStyle = g; c.beginPath(); c.ellipse(bx, by, r, r * 1.08, 0, 0, TAU); c.fill();
          c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(bx - r * 0.35, by - r * 0.45, r * 0.25, r * 0.15, -0.6, 0, TAU); c.fill();
        } else {
          c.save(); c.translate(bx, by + 6);
          const fl = 10 + Math.sin(t * 30) * 3; const fg = c.createLinearGradient(0, 18, 0, 18 + fl * 2); fg.addColorStop(0, '#fff3b0'); fg.addColorStop(1, 'rgba(255,120,40,0)');
          c.fillStyle = fg; c.beginPath(); c.moveTo(-5, 18); c.lineTo(0, 18 + fl * 2); c.lineTo(5, 18); c.fill();
          const rg = c.createLinearGradient(-7, 0, 7, 0); rg.addColorStop(0, '#f5f5f5'); rg.addColorStop(1, '#9aa2b2');
          c.fillStyle = rg; c.beginPath(); c.moveTo(0, -24); c.quadraticCurveTo(8, -12, 7, 18); c.lineTo(-7, 18); c.quadraticCurveTo(-8, -12, 0, -24); c.fill();
          c.fillStyle = '#e4572e'; c.beginPath(); c.moveTo(-7, 8); c.lineTo(-13, 20); c.lineTo(-7, 18); c.fill(); c.beginPath(); c.moveTo(7, 8); c.lineTo(13, 20); c.lineTo(7, 18); c.fill();
          c.restore();
        }
        // 온도계: 그래프 값만큼 수은이 오르내린다
        const thx = bx + 44, thy = Math.max(yh(hh) - 30, H * 0.3), lv = temp(hh);
        c.fillStyle = 'rgba(255,255,255,.9)'; c.beginPath(); c.roundRect(thx - 4, thy - 22, 8, 44, 4); c.fill(); dot(c, thx, thy + 24, 7, 'rgba(255,255,255,.9)');
        dot(c, thx, thy + 24, 5, '#e4572e'); c.fillStyle = '#e4572e'; c.fillRect(thx - 2, thy + 20 - 40 * lv, 4, 40 * lv + 4);
        pill(c, thx + 12, thy + 2, `${Math.round(hh)} km · ${Math.round(tC(hh))} °C`, 'rgba(251,252,249,.95)', '#1d2433', '800 14px', 'left');
      },
      hint: (W, H) => [W * 0.2, H * 0.62, W * 0.3],
      say(v, moved) {
        const h = Math.round(v * 100), L = layerAt(h);
        const bi = LAYERS.findIndex((Q, i) => i && Q[0] === h); // 11·50·80 km는 두 층의 경계
        return [bi > 0 ? `높이 ${h} km · <b>${LAYERS[bi - 1][1]}과 ${LAYERS[bi][1]}의 경계</b> — 여기서 기온 변화의 방향이 바뀐다` : `높이 ${h} km · <b>${L[1]}</b> — ${L[2]}`, moved ? (v < 0.98 ? '끝까지 끌어 100 km까지 올라가자' : '기온이 꺾인 곳이 몇 번이었을까?') : '오른쪽으로 끌어 높이 올라가 보자', v >= 0.98];
      },
    },
    quake: {
      draw(c, P, W, H, v, t) {
        const gy = H * 0.44, fx = W * 0.36, fy = H * 0.84, R = v * W * 0.82, dist = (x) => Math.hypot(x - fx, gy - fy), hit = (x) => dist(x) < R;
        // 하늘·먼 산
        const sky = c.createLinearGradient(0, 0, 0, gy); sky.addColorStop(0, '#2b4f86'); sky.addColorStop(1, '#9cc3e6'); c.fillStyle = sky; c.fillRect(0, 0, W, gy);
        c.fillStyle = 'rgba(70,100,140,.55)'; c.beginPath(); c.moveTo(0, gy); for (let x = 0; x <= W; x += 12) c.lineTo(x, gy - 22 - 14 * Math.sin(x * 0.015 + 1) - 8 * Math.sin(x * 0.05)); c.lineTo(W, gy); c.fill();
        cloud(c, W * 0.52 + Math.sin(t * 0.2) * 10, H * 0.2, 11, 0.85);
        // 땅속 지층(물결 모양 층 + 단층)
        const lay = [['#8a6a4a', '#6f5238'], ['#a3825a', '#80633f'], ['#6d5a4a', '#524336'], ['#5b4a52', '#3e3239'], ['#4a3a3a', '#2e2424']];
        const ly = (i, x) => gy + (H - gy) * (i / lay.length) + (i ? 6 * Math.sin(x * 0.02 + i) : 0);
        lay.forEach(([a, b], i) => {
          const g = c.createLinearGradient(0, ly(i, 0), 0, ly(i + 1, 0)); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g;
          const xs = Array.from({ length: 41 }, (_, j) => W * j / 40);
          c.beginPath(); xs.forEach((x, j) => c[j ? 'lineTo' : 'moveTo'](x, ly(i, x))); xs.reverse().forEach((x) => c.lineTo(x, i + 1 < lay.length ? ly(i + 1, x) : H)); c.closePath(); c.fill();
          c.fillStyle = 'rgba(255,255,255,.05)'; for (let k = 0; k < 14; k++) { const px = (k * 71 + i * 37) % W, py = ly(i, px) + 8 + (k * 13 % 20); c.fillRect(px, py, 3, 2); }
        });
        c.strokeStyle = 'rgba(20,10,10,.75)'; c.lineWidth = 3; c.beginPath(); c.moveTo(fx - 70, H); c.lineTo(fx + 8, fy - 6); c.lineTo(fx + 60, gy + 10); c.stroke();
        // 지진파 고리: 진원에서 잇달아 퍼지며 닿은 곳까지만
        c.save(); c.beginPath(); c.rect(0, gy, W, H - gy); c.clip();
        if (R > 4) {
          const inner = c.createRadialGradient(fx, fy, 0, fx, fy, R); inner.addColorStop(0, 'rgba(255,200,80,.18)'); inner.addColorStop(1, 'rgba(255,200,80,.04)'); c.fillStyle = inner; c.beginPath(); c.arc(fx, fy, R, 0, TAU); c.fill();
          for (let k = 0; k < 6; k++) { const r = ((t * 60 + k * (R / 6 + 8)) % (R + 1)); c.strokeStyle = `rgba(255,216,77,${0.15 + 0.5 * (1 - r / (R + 1))})`; c.lineWidth = 2; c.beginPath(); c.arc(fx, fy, r, 0, TAU); c.stroke(); }
          c.save(); c.shadowColor = EL; c.shadowBlur = 10; c.strokeStyle = EL; c.lineWidth = 3.5; c.beginPath(); c.arc(fx, fy, R, 0, TAU); c.stroke(); c.restore();
        }
        c.restore();
        // 진원·진앙
        const pulse = 1 + 0.25 * Math.sin(t * 8);
        P.glow(c, fx, fy, 30 * pulse, 'rgba(255,110,60,.7)'); dot(c, fx, fy, 7, '#ff5a36'); dot(c, fx - 2, fy - 2, 2.5, '#ffd0b0');
        P.txt(c, '진원(지진이 시작된 곳)', fx + 16, fy + 5, '#fbfcf9', '700 14px', 'left');
        c.strokeStyle = 'rgba(255,255,255,.5)'; c.setLineDash([4, 5]); c.lineWidth = 1.5; c.beginPath(); c.moveTo(fx, fy - 10); c.lineTo(fx, gy); c.stroke(); c.setLineDash([]);
        // 땅 위: 풀밭 띠 + 마을
        c.fillStyle = '#4f8f4a'; c.fillRect(0, gy - 4, W, 8); c.fillStyle = '#3c7038'; c.fillRect(0, gy + 3, W, 3);
        const shake = (x) => (hit(x) ? Math.sin(t * 34 + x) * 4 * clamp(1.3 - dist(x) / (W * 0.8), 0.3, 1) : 0);
        tree(c, W * 0.06, gy, 26, shake(W * 0.06));
        house(c, W * 0.17, gy, 40, 30, '#b5452f', '#e9dcc0', shake(W * 0.17), hit(W * 0.17));
        tower(c, W * 0.29, gy, 36, 70, shake(W * 0.29), hit(W * 0.29), t);
        house(c, W * 0.47, gy, 44, 32, '#3f6fa6', '#efe6d0', shake(W * 0.47), hit(W * 0.47));
        tree(c, W * 0.56, gy, 24, shake(W * 0.56));
        house(c, W * 0.66, gy, 38, 28, '#7a4a8f', '#e9dcc0', shake(W * 0.66), hit(W * 0.66));
        tree(c, W * 0.75, gy, 28, shake(W * 0.75));
        // 지진계(오른쪽 땅 위 관측소) + 기록 화면
        const sx = W * 0.88; c.fillStyle = '#d8dde8'; c.fillRect(sx - 16 + shake(sx) * 0.3, gy - 20, 32, 20); c.fillStyle = '#5a6a8a'; c.beginPath(); c.moveTo(sx - 20, gy - 20); c.lineTo(sx, gy - 32); c.lineTo(sx + 20, gy - 20); c.fill();
        P.txt(c, '지진계', sx, gy - 38, '#1d2433', '700 12px');
        const rx = W * 0.6, ry = H * 0.05, rw = W * 0.37, rh = H * 0.17;
        c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.roundRect(rx + 2, ry + 3, rw, rh, 8); c.fill();
        c.fillStyle = '#fbf8ef'; c.beginPath(); c.roundRect(rx, ry, rw, rh, 8); c.fill(); c.strokeStyle = '#5a6a8a'; c.lineWidth = 1.5; c.stroke();
        c.strokeStyle = 'rgba(90,106,138,.18)'; c.lineWidth = 1; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(rx + 4, ry + rh * i / 4); c.lineTo(rx + rw - 4, ry + rh * i / 4); c.stroke(); }
        const arrive = dist(sx) / (W * 0.82); // 지진파가 관측소에 닿는 v
        c.strokeStyle = '#c0392b'; c.lineWidth = 1.6; c.beginPath();
        for (let x = 0; x <= rw - 12; x += 1.5) {
          const vv = v - (rw - 12 - x) / (rw - 12) * 0.35, amp = vv > arrive ? Math.exp(-(vv - arrive) * 4) * rh * 0.4 : 0;
          const y = ry + rh / 2 + Math.sin(x * 0.9 + t * 20) * amp * Math.abs(Math.sin(x * 0.13)) + Math.sin(x * 2.1 + t * 9) * 0.6;
          if (x) c.lineTo(rx + 6 + x, y); else c.moveTo(rx + 6 + x, y);
        }
        c.stroke();
        P.txt(c, '지진계 기록', rx + rw - 8, ry + rh + 14, '#1d2433', '700 12px', 'right');
        P.txt(c, '땅속', 8, gy + 24, '#f0e2c8', '700 13px', 'left');
        pill(c, fx, gy + 22, '진앙', 'rgba(251,252,249,.92)', '#1d2433', '800 13px');
        // 흔들리는 곳 먼지
        if (R > dist(W * 0.17)) for (let i = 0; i < 10; i++) { const x = W * (0.12 + i * 0.07), u = (t * 0.8 + i * 0.13) % 1; if (hit(x)) { c.fillStyle = `rgba(200,180,150,${0.4 * (1 - u)})`; c.beginPath(); c.arc(x + Math.sin(i + t) * 6, gy - 4 - u * 18, 3 + u * 5, 0, TAU); c.fill(); } }
      },
      hint: (W, H) => [W * 0.42, H * 0.72, W * 0.3],
      say(v, moved) {
        return [v < 0.1 ? '땅속 깊은 곳에 힘이 쌓여 있다' : v < 0.72 ? '흔들림(지진파)이 진원에서 <b>사방으로</b> 퍼져 나간다' : '지진파가 땅 위에 닿아 집이 <b>흔들리고</b> 지진계에 기록된다',
          moved ? (v < 0.72 ? '끝까지 끌어 땅 위까지 보내자' : '진앙에 가까운 집부터 흔들렸다') : '오른쪽으로 끌어 흔들림을 퍼뜨리자', v >= 0.72];
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
