/* 3-1 4차시 체험 «화산이 터지면»(교과서 116~117쪽 그림 Ⅲ-13 · 참고서 143쪽 화산 분출물·피해·이용).
   화산과 주변(하늘·마을·숲·강·바다) 단면. 땅속 마그마 방의 손잡이를 위로 끌어 압력을 올리면 분출 —
   화산 가스·화산재·화산 쇄설물(화산탄)·용암이 나오고, 권역 영향이 잇따라 켜진다:
   기권(화산재 구름·햇빛 가림·항공기 결항) → 생물권(산성비에 숲이 시듦) → 수권(강에 화산재) → 지권(용암·산불·새 땅·산사태).
   아래 «분출 뒤 시간» 손잡이를 끌어 수백 년 뒤로 가면 기름진 농경지·온천·관광객. 크기·시간은 이해를 돕기 위한 그림.
   키보드: 위 화살표 압력, 오른쪽·왼쪽 화살표 시간, 0 처음부터.
   Volcano.mount(root) → { fit, setActive } · 시험용: root._vo.press(0~1) · time(0~1) · state() */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  // 분출 뒤 몇 초에 어떤 영향이 켜지는지(패널 목록 data-k와 같은 이름)
  const HARM = [['air', 1.2], ['acid', 2.6], ['river', 3.6], ['lava', 4.6]];
  const GOOD = [['soil', 0.45], ['spring', 0.65], ['tour', 0.85]];
  const seenAt = (er, tm) => [...HARM.filter(([, s]) => er >= s).map(([k]) => k), ...GOOD.filter(([, s]) => tm >= s).map(([k]) => k)];
  console.assert(seenAt(0, 0).length === 0 && seenAt(5, 0).length === 4 && seenAt(5, 1).length === 7, 'volcano: 영향 순서');

  function mount(root) {
    const stage = root.querySelector('.vo-stage'), now = root.querySelector('.vo-now'), out = root.querySelector('.vo-out');
    const items = [...root.querySelectorAll('.vo-list li')];
    const P = window.Play;
    let p, erupted, er, tm, t, drag, puffs, bombs, msg, uiT = 0, art = null, artKey = '';
    function reset() { p = 0; erupted = false; er = 0; tm = 0; t = 0; drag = null; puffs = []; bombs = []; msg = ''; }
    reset();
    const X = (u) => u * S.W, Y = (v) => v * S.H;
    const G = 0.62, VX = 0.45, TOP = 0.3, CH = 0.86; // 땅 높이 · 화산 x · 분화구 높이 · 마그마 방 높이(정규)
    const slope = (x) => { const d = Math.abs(x - VX); return d < 0.03 ? TOP : Math.min(G, TOP + (d - 0.03) * 1.6); }; // 화산 비탈 높이(정규)
    const slider = () => ({ x0: X(0.3), x1: X(0.78), y: S.H - 16 });

    // 바탕: 땅속 층·마그마 방·화산체·바다(크기가 바뀔 때만)
    function backdrop(W, H) {
      const key = W + 'x' + H; if (art && artKey === key) return art;
      art = document.createElement('canvas'); art.width = W; art.height = H; artKey = key; const c = art.getContext('2d');
      const x = (u) => u * W, y = (v) => v * H;
      let g = c.createLinearGradient(0, y(G), 0, H); g.addColorStop(0, '#7a5a3e'); g.addColorStop(1, '#3a281c'); c.fillStyle = g; c.fillRect(0, y(G), W, H - y(G));
      let s = 5; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
      c.strokeStyle = 'rgba(30,18,8,.25)'; c.lineWidth = 2; for (let k = 1; k < 4; k++) { c.beginPath(); for (let u = 0; u <= 1.01; u += 0.02) c.lineTo(x(u), y(G + k * 0.07) + Math.sin(u * 14 + k) * 3); c.stroke(); }
      for (let i = 0; i < 120; i++) { c.fillStyle = `rgba(${rnd() < 0.5 ? '255,235,210' : '20,10,5'},${0.06 + rnd() * 0.1})`; c.beginPath(); c.arc(rnd() * W, y(G) + rnd() * (H - y(G)), 1 + rnd() * 2.5, 0, TAU); c.fill(); }
      g = c.createRadialGradient(x(VX), y(CH), 4, x(VX), y(CH), 80); g.addColorStop(0, '#ffd25a'); g.addColorStop(0.5, '#f0702a'); g.addColorStop(1, '#8e2412'); c.fillStyle = g; c.beginPath(); c.ellipse(x(VX), y(CH), 80, 24, 0, 0, TAU); c.fill();
      // 바다(오른쪽 끝)
      g = c.createLinearGradient(0, y(G), 0, y(G + 0.16)); g.addColorStop(0, '#2f86cf'); g.addColorStop(1, '#0d3c78'); c.fillStyle = g;
      c.beginPath(); c.moveTo(x(0.84), y(G)); c.lineTo(W, y(G)); c.lineTo(W, y(G + 0.16)); c.lineTo(x(0.9), y(G + 0.16)); c.fill();
      // 화산체(명암 + 용암 층 줄무늬)
      g = c.createLinearGradient(x(VX - 0.28), 0, x(VX + 0.28), 0); g.addColorStop(0, '#8a7a66'); g.addColorStop(0.45, '#5f4f40'); g.addColorStop(1, '#2f261f'); c.fillStyle = g;
      c.beginPath(); for (let u = VX - 0.3; u <= VX + 0.3; u += 0.005) c.lineTo(x(u), y(slope(u))); c.lineTo(x(VX + 0.3), y(G) + 2); c.lineTo(x(VX - 0.3), y(G) + 2); c.fill();
      c.save(); c.clip(); c.strokeStyle = 'rgba(255,255,255,.1)'; c.lineWidth = 2; for (let k = 1; k < 5; k++) { c.beginPath(); for (let u = VX - 0.3; u <= VX + 0.3; u += 0.01) c.lineTo(x(u), y(slope(u)) + k * 12); c.stroke(); } c.restore();
      c.fillStyle = '#3a2a22'; c.fillRect(x(VX) - 5, y(TOP) + 2, 10, y(CH) - y(TOP) - 22);
      return art;
    }
    function tree(c, x, y, k, sick, burn) {
      c.fillStyle = '#4a3218'; c.fillRect(x - 1.5, y - 11 * k, 3, 11 * k);
      const g = c.createRadialGradient(x - 3, y - 17 * k, 2, x, y - 15 * k, 10 * k);
      if (burn) { g.addColorStop(0, '#3a3530'); g.addColorStop(1, '#1d1a18'); } else { const a = sick; g.addColorStop(0, `rgb(${111 + a * 90},${174 - a * 60},${69 - a * 30})`); g.addColorStop(1, `rgb(${45 + a * 90},${106 - a * 50},${42 - a * 20})`); }
      c.fillStyle = g; c.beginPath(); c.arc(x, y - 15 * k, 9 * k, 0, TAU); c.fill();
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; if (erupted) er += dt;
        const cy = Y(CH), ty = Y(TOP), vx = X(VX);
        const clear = erupted ? Math.min(1, tm / 0.3) : 1; // 시간이 지나면 화산재가 걷힌다
        const ashSky = erupted ? Math.min(1, er / 1.5) * (1 - clear * (tm > 0 ? 1 : 0)) : 0;
        // 하늘(화산재가 덮으면 어두워진다)
        let g = c.createLinearGradient(0, 0, 0, Y(G)); g.addColorStop(0, ashSky > 0 ? `rgb(${79 - ashSky * 20},${134 - ashSky * 60},${198 - ashSky * 110})` : '#4f86c6'); g.addColorStop(1, ashSky > 0 ? `rgb(${207 - ashSky * 60},${230 - ashSky * 90},${244 - ashSky * 120})` : '#cfe6f4'); c.fillStyle = g; c.fillRect(0, 0, W, Y(G));
        // 해(화산재에 가려 흐려진다)
        P.glow(c, X(0.9), Y(0.1), 46, `rgba(255,220,120,${0.85 - ashSky * 0.7})`); c.fillStyle = `rgba(255,242,176,${1 - ashSky * 0.75})`; c.beginPath(); c.arc(X(0.9), Y(0.1), 16, 0, TAU); c.fill();
        c.drawImage(backdrop(W, H), 0, 0);
        const lavaOn = erupted && er > 1 && tm < 0.6, lavaLen = erupted ? Math.min(1, (er - 1) / 3.6) : 0;
        // 용암 흐름(오른쪽 비탈 → 숲 아래로), 시간이 지나면 검은 새 땅 → 풀이 덮는다
        if (erupted && er > 1) {
          const u1 = VX + 0.03 + lavaLen * 0.2; c.lineWidth = 12; c.lineCap = 'round';
          c.strokeStyle = tm > 0.3 ? (tm > 0.7 ? '#4f6e33' : '#2b2724') : `rgba(255,${110 + Math.sin(t * 6) * 30},40,.95)`;
          c.beginPath(); for (let u = VX + 0.02; u <= u1; u += 0.005) c.lineTo(X(u), Y(slope(u)) - 3); c.stroke(); c.lineCap = 'butt';
          if (lavaOn) P.glow(c, X(u1), Y(slope(u1)) - 4, 16, 'rgba(255,140,50,.7)');
          if (lavaLen > 0.85) P.txt(c, tm > 0.3 ? '용암이 굳은 새 땅' : '용암', X(u1) + 4, Y(G) - 20, tm > 0.3 ? '#2b2724' : '#fff1d6', '800 13px', 'left');
        }
        // 마을(왼쪽) · 산사태 흙더미
        [0.03, 0.065, 0.1].forEach((u, i) => { const x = X(u), y = Y(G); c.fillStyle = '#efe2c8'; c.fillRect(x - 9, y - 14, 18, 14); c.fillStyle = i % 2 ? '#b3472e' : '#8a5a32'; c.beginPath(); c.moveTo(x - 12, y - 14); c.lineTo(x, y - 24); c.lineTo(x + 12, y - 14); c.fill(); });
        const slide = erupted && er > 4.2 && tm < 0.5 ? Math.min(1, (er - 4.2) / 1.2) : 0;
        if (slide > 0) { c.fillStyle = '#6e5a46'; c.beginPath(); c.moveTo(X(VX - 0.2), Y(slope(VX - 0.2))); c.quadraticCurveTo(X(VX - 0.24 - slide * 0.04), Y(G) - 14 * slide, X(VX - 0.3 - slide * 0.05), Y(G)); c.lineTo(X(VX - 0.16), Y(G)); c.fill(); if (slide > 0.9) P.txt(c, '산사태', X(VX - 0.26), Y(G) - 22, '#3a281c', '800 13px'); }
        // 농경지(왼쪽 들판): 시간이 지나 화산재가 기름진 흙이 되면
        if (tm >= 0.45) { const k = Math.min(1, (tm - 0.45) / 0.15); for (let i = 0; i < 9; i++) { const x = X(0.12 + i * 0.011); c.strokeStyle = `rgba(80,140,40,${k})`; c.lineWidth = 2; c.beginPath(); c.moveTo(x, Y(G)); c.lineTo(x, Y(G) - 8 - (i % 3) * 2); c.stroke(); } P.txt(c, '기름진 농경지', X(0.16), Y(G) + 18, '#fff3d6', '800 13px'); }
        // 숲(오른쪽 비탈 아래): 산성비에 시들고 용암에 탄다
        const acid = erupted && er > 2.6 && tm < 0.4 ? Math.min(1, (er - 2.6) / 1.2) : 0;
        for (let i = 0; i < 8; i++) { const u = VX + 0.11 + i * 0.016, y = Y(Math.min(G, slope(u))); tree(c, X(u), y, 0.8 + (i % 3) * 0.15, acid, lavaLen > 0.6 && i < 4 && tm < 0.4); }
        if (lavaLen > 0.6 && tm < 0.4) for (let i = 0; i < 3; i++) { const x = X(VX + 0.11 + i * 0.016), y = Y(slope(VX + 0.11 + i * 0.016)) - 26; P.glow(c, x, y - Math.abs(Math.sin(t * 7 + i)) * 6, 10, 'rgba(255,120,30,.8)'); }
        // 강(숲 사이 → 바다), 화산재가 흘러들면 잿빛
        const muddy = erupted && er > 3.6 && tm < 0.4 ? Math.min(1, (er - 3.6) / 1) : 0;
        c.strokeStyle = `rgb(${61 + muddy * 90},${155 - muddy * 30},${224 - muddy * 110})`; c.lineWidth = 5; c.beginPath(); c.moveTo(X(0.68), Y(G) - 1); c.lineTo(X(0.86), Y(G) - 1); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1.5; c.beginPath(); for (let u = 0.68; u < 0.86; u += 0.01) c.lineTo(X(u), Y(G) - 2 + Math.sin(u * 80 - t * 4) * 0.8); c.stroke();
        if (muddy > 0.5) P.txt(c, '화산재로 흐려진 강', X(0.77), Y(G) + 18, '#fff3d6', '800 13px');
        // 마그마: 손잡이(마그마 방)에서 화도로 차오른다
        const fill = erupted ? (tm > 0.3 ? 0.2 : 1) : p, my = cy - 20 - (cy - 20 - ty) * fill;
        c.fillStyle = `rgba(255,${140 + fill * 90},60,.95)`; c.fillRect(vx - 4, my, 8, cy - 20 - my);
        if (!erupted) {
          const ky = cy - (cy - ty) * p * 0.6; P.glow(c, vx, ky, 22, 'rgba(255,216,77,.6)'); c.fillStyle = '#ffd84d'; c.beginPath(); c.arc(vx, ky, 11, 0, TAU); c.fill(); c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.stroke();
          P.txt(c, '▲', vx, ky + 5, '#1d2433', '800 12px');
          if (!drag && p < 0.05) { const w = Math.sin(t * 4) * 5; P.txt(c, '마그마를 위로 끌기', vx + 60, ky + 5 - w, '#fff', '800 14px', 'left'); }
          if (p > 0.5) { const sh = (p - 0.5) * 3; c.save(); c.translate(Math.sin(t * 60) * sh, 0); P.glow(c, vx, ty, 14 + sh * 6, 'rgba(255,120,40,.6)'); c.restore(); }
          // 압력 게이지
          const gx = X(0.03), gy = Y(G) + 14, gw = X(0.18); c.fillStyle = 'rgba(10,16,32,.6)'; c.beginPath(); c.roundRect(gx, gy, gw, 14, 7); c.fill();
          c.fillStyle = p > 0.8 ? '#e2462a' : '#ffd84d'; c.beginPath(); c.roundRect(gx + 2, gy + 2, (gw - 4) * p, 10, 5); c.fill(); P.txt(c, `압력 ${Math.round(p * 100)}%`, gx + gw / 2, gy + 30, '#fff', '800 12px');
        }
        P.txt(c, '마그마 방', vx + 88, cy + 5, '#ffe2c0', '800 13px', 'left');
        // 분출: 가스·화산재 기둥, 화산탄, 이름표
        if (erupted && tm < 0.3) {
          const k = 1 - tm / 0.3;
          if (Math.random() < 0.6 * k) puffs.push({ x: vx + (Math.random() - 0.5) * 10, y: ty, r: 6, vy: 60 + Math.random() * 40, vx: (Math.random() - 0.3) * 30, a: 0.85, gas: Math.random() < 0.3 });
          if (er < 3 && Math.random() < 0.15 * k) bombs.push({ x: vx, y: ty, vx: (Math.random() - 0.5) * 160, vy: -140 - Math.random() * 80 });
          P.glow(c, vx, ty, 20, `rgba(255,120,40,${0.8 * k})`);
        }
        puffs.forEach((q) => { q.y -= q.vy * dt; q.x += q.vx * dt + (q.y < Y(0.12) ? 30 * dt : 0); q.r += dt * 9; q.a -= dt * 0.12; c.fillStyle = q.gas ? `rgba(240,240,236,${Math.max(0, q.a) * 0.7})` : `rgba(120,112,105,${Math.max(0, q.a)})`; c.beginPath(); c.arc(q.x, q.y, q.r, 0, TAU); c.fill(); });
        puffs = puffs.filter((q) => q.a > 0 && q.y > -40);
        bombs.forEach((b) => { b.vy += 260 * dt; b.x += b.vx * dt; b.y += b.vy * dt; c.fillStyle = '#2a211b'; c.beginPath(); c.arc(b.x, b.y, 4, 0, TAU); c.fill(); P.glow(c, b.x, b.y, 7, 'rgba(255,120,40,.4)'); });
        bombs = bombs.filter((b) => b.y < Y(G));
        if (erupted && er > 0.6 && tm < 0.3) {
          P.txt(c, '화산재', vx - 70, Y(0.12), '#fff', '800 14px'); P.txt(c, '화산 가스(대부분 수증기)', vx + 20, Y(0.2), '#fff', '800 13px', 'left');
          if (er < 3) P.txt(c, '화산탄(화산 쇄설물)', vx - 120, ty - 6, '#fff', '800 13px');
        }
        // 기권: 화산재 구름이 퍼지고 비행기가 못 뜬다
        if (erupted && er > 1.2 && tm < 0.3) {
          const k = Math.min(1, (er - 1.2) / 1) * (1 - tm / 0.3); c.fillStyle = `rgba(110,104,98,${0.55 * k})`; for (let i = 0; i < 9; i++) { c.beginPath(); c.arc(X(0.15 + i * 0.09), Y(0.07) + Math.sin(i * 2 + t) * 4, 30, 0, TAU); c.fill(); }
          const px = X(0.78), py = Y(0.24); c.fillStyle = '#f5f7fa'; c.beginPath(); c.ellipse(px, py, 18, 4, 0, 0, TAU); c.fill(); c.beginPath(); c.moveTo(px - 3, py); c.lineTo(px - 10, py - 10); c.lineTo(px + 3, py); c.fill();
          c.strokeStyle = '#e2462a'; c.lineWidth = 3; c.beginPath(); c.moveTo(px - 14, py - 12); c.lineTo(px + 14, py + 12); c.moveTo(px + 14, py - 12); c.lineTo(px - 14, py + 12); c.stroke(); P.txt(c, '항공기 결항', px, py + 26, '#fff', '800 13px');
        }
        // 생물권: 산성비
        if (acid > 0) { c.strokeStyle = `rgba(200,230,140,${0.6 * acid})`; c.lineWidth = 1.5; for (let i = 0; i < 26; i++) { const x = X(VX + 0.1) + ((i * 37) % (X(0.2))), y = Y(0.3) + ((t * 220 + i * 53) % Y(G - 0.32)); c.beginPath(); c.moveTo(x, y); c.lineTo(x - 2, y + 9); c.stroke(); } if (acid > 0.6) P.txt(c, '산성비', X(VX + 0.2), Y(0.3), '#e8ffd0', '800 13px'); }
        // 시간이 지난 뒤: 온천 김 · 관광객
        if (tm >= 0.65) { const x = X(VX - 0.2), y = Y(slope(VX - 0.2)) - 2; c.fillStyle = '#5ec2d8'; c.beginPath(); c.ellipse(x, y - 2, 18, 4, 0, 0, TAU); c.fill(); for (let i = 0; i < 3; i++) { const a = (t * 0.6 + i / 3) % 1; c.fillStyle = `rgba(255,255,255,${0.6 * (1 - a)})`; c.beginPath(); c.arc(x - 8 + i * 8, y - 8 - a * 26, 4 + a * 5, 0, TAU); c.fill(); } P.txt(c, '온천', x, y - 40, '#fff', '800 13px'); }
        if (tm >= 0.85) { [0, 1, 2].forEach((i) => { const x = X(VX - 0.06 + i * 0.025) + Math.sin(t * 2 + i) * 2, y = Y(slope(VX - 0.06 + i * 0.025)); c.fillStyle = ['#e2462a', '#2f6fd8', '#f0b52a'][i]; c.fillRect(x - 2, y - 10, 4, 7); c.fillStyle = '#f2c9a0'; c.beginPath(); c.arc(x, y - 13, 2.5, 0, TAU); c.fill(); }); P.txt(c, '관광객', X(VX - 0.03), Y(slope(VX - 0.03)) - 20, '#fff', '800 13px'); }
        // 시간 손잡이
        const sl = slider(); c.fillStyle = 'rgba(10,16,32,.55)'; c.beginPath(); c.roundRect(sl.x0 - 92, sl.y - 13, sl.x1 - sl.x0 + 180, 26, 13); c.fill();
        c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(sl.x0, sl.y - 2, sl.x1 - sl.x0, 4);
        const kx = sl.x0 + tm * (sl.x1 - sl.x0); c.fillStyle = erupted ? '#ffd84d' : '#8a93a3'; c.beginPath(); c.arc(kx, sl.y, 9, 0, TAU); c.fill();
        P.txt(c, '분출 뒤 시간', sl.x0 - 10, sl.y + 4, '#fff', '800 12px', 'right'); P.txt(c, tm < 0.02 ? '지금' : tm < 0.3 ? `약 ${Math.round(tm * 100)}년 뒤` : `약 ${Math.round(tm * 100) * 5}년 뒤`, sl.x1 + 12, sl.y + 4, '#fff', '800 12px', 'left');
        if (erupted && er > 5 && tm < 0.02 && !drag) { const w = Math.sin(t * 4) * 6; P.txt(c, '→ 끌어 보자', kx + 18 + w, sl.y - 16, '#ffd84d', '800 13px', 'left'); }
        uiT += dt; if (uiT > 0.2 || !dt) { uiT = 0; steps(); }
      },
      down(q) {
        const sl = slider();
        if (erupted && Math.abs(q.y - sl.y) < 24 && q.x > sl.x0 - 24 && q.x < sl.x1 + 24) { drag = 'time'; setTime((q.x - sl.x0) / (sl.x1 - sl.x0)); return; }
        if (!erupted && q.y > Y(TOP)) drag = { y0: q.y, p0: p };
      },
      move(q, e, held) {
        if (!held || !drag) return;
        if (drag === 'time') { const sl = slider(); setTime((q.x - sl.x0) / (sl.x1 - sl.x0)); return; }
        if (!erupted) setP(drag.p0 + (drag.y0 - q.y) / ((Y(CH) - Y(TOP)) * 0.6));
      },
      up() { drag = null; },
      key(e) {
        if (e.key === 'ArrowUp') { if (!erupted) setP(p + 0.2); return true; }
        if (e.key === 'ArrowRight') { setTime(tm + 0.1); return true; } if (e.key === 'ArrowLeft') { setTime(tm - 0.1); return true; }
        if (e.key === '0') { reset(); steps(); return true; } return false;
      },
    });
    function setP(v) { p = Math.max(0, Math.min(1, v)); if (p >= 1 && !erupted) { erupted = true; er = 0; drag = null; window.RxT.jolt(stage, 1); } S.kick(); }
    function setTime(v) { if (!erupted || er < 1) return; tm = Math.max(0, Math.min(1, v)); S.kick(); }
    function steps() {
      const seen = seenAt(er, tm), ok = [];
      if (erupted) ok.push(1); if (HARM.every(([k]) => seen.includes(k))) ok.push(2); if (GOOD.every(([k]) => seen.includes(k))) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      items.forEach((li) => li.classList.toggle('on', seen.includes(li.dataset.k)));
      const nt = st === 1 ? `① 마그마 방을 위로 끌어 압력을 올리자 (${Math.round(p * 100)}%)` : st === 2 ? '② 분출 — 네 권역에 영향이 번져 간다' : st === 3 ? '③ 아래 시간 손잡이를 끌어 수백 년 뒤로 가 보자' : '화산은 피해도 주지만 땅과 사람에게 주는 것도 있다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
      const h = !erupted ? '땅속 마그마에 압력이 쌓이면 화산이 터진다.' : st === 2 ? '분출물이 하늘·물·생물·땅으로 퍼진다 — 오른쪽 목록에 하나씩 켜진다.' : st === 3 ? '네 권역 모두 영향을 받았다. 시간이 흐르면 무엇이 달라질까?' : '화산재는 풍화되어 <b>기름진 흙</b>이 되고, 땅속 열은 <b>온천</b>을, 화산 지형은 <b>관광 자원</b>을 만든다.';
      if (msg !== h) { msg = h; out.innerHTML = h; }
    }
    root.querySelector('.vo-reset').addEventListener('click', () => { reset(); steps(); S.kick(); });
    steps();
    const state = () => ({ pressure: +p.toFixed(2), erupted, er: +er.toFixed(1), time: +tm.toFixed(2), seen: seenAt(er, tm) });
    root._vo = {
      press: (v) => { setP(v); if (erupted) er = Math.max(er, 6); steps(); return state(); },
      time: (v) => { if (erupted) { er = Math.max(er, 6); setTime(v); } steps(); return state(); },
      state,
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Volcano = { mount };
})();
