/* 2-1-3 늘린 체험 장(작업-4, 2026-11-13). more-34.js 의 M34.def 로 등록한다.
   use3 책상 위 물건 속 원소 찾기 · pencil3 연필 선으로 회로 잇기 (1차시)
   ladder9 에너지 계단에 전자 놓기 · mystery9 수수께끼 원소 X · cycle9 되풀이 간격 재기 (2차시)
   lens10 돋보기로 본 공기·바다·모래 · bulb10 전구 속을 무엇으로 채울까 · pair10 두 원자 짝짓기 (3차시) */
(function () {
  'use strict';
  const { def, D } = window.M34;
  const { TAU, lerp, clamp, ease, hash } = D;

  // ───────────────────────── use3 책상 위 물건 속 원소 찾기 ─────────────────────────
  {
    const OBJ = [
      { z: 29, s: 'Cu', n: '구리', use: '전선', why: '전기가 잘 통하고 가늘게 늘어난다', hint: '전선에는 <b>전기가 잘 통하고</b> 잘 늘어나는 금속이 쓰인다', x: 125, y: 500, r: 70 },
      { z: 26, s: 'Fe', n: '철', use: '못·나사', why: '단단하고 힘을 주어도 부서지지 않는다', hint: '못은 망치로 쳐도 <b>부서지지 않아야</b> 한다', x: 290, y: 505, r: 66 },
      { z: 79, s: 'Au', n: '금', use: '반도체 칩 단자', why: '광택이 있고 전기가 잘 통하며 녹슬지 않는다', hint: '칩의 <b>금빛 단자</b>를 보자 — 녹슬지 않고 전기가 잘 통한다', x: 462, y: 498, r: 72 },
      { z: 6, s: 'C', n: '탄소', use: '연필심(흑연)', why: '비금속이지만 흑연은 전기가 통한다', hint: '연필심은 <b>흑연</b> — 다이아몬드를 이루는 원소와 같다', x: 630, y: 510, r: 70 },
      { z: 7, s: 'N', n: '질소', use: '과자 봉지 충전 기체', why: '잘 반응하지 않아 과자가 상하지 않는다', hint: '봉지 속은 <b>기체</b>다 — 공기의 대부분을 차지하는 기체', x: 800, y: 500, r: 72 },
      { z: 15, s: 'P', n: '인', use: '성냥', why: '마찰하면 쉽게 불이 붙는다', hint: '성냥갑 옆면을 <b>그으면 불이 붙는</b> 원소', x: 955, y: 508, r: 62 },
    ];
    const ORDER = [4, 2, 3, 0, 5, 1];            // 꽂이에 꽂힌 차례(섞어 둠)
    const slotX = (i) => 105 + i * 170, SLOT_Y = 612, CW = 92, CH = 74;
    const PT = { x: 618, y: 92, cw: 23, ch: 27 };  // 포스터 속 주기율표
    const KC = { m: ['#5b8fd9', '#cfe0fb'], n: ['#efb02e', '#fff0b8'], x: ['#4fae6a', '#cdeed6'], u: ['#b6bcc6', '#e6e8ec'] };
    const kindOf = (z) => window.Elem.all[z - 1].k;
    const cellXY = (e) => [PT.x + (e.g - 1) * PT.cw, PT.y + (e.p - 1) * PT.ch];

    function drawObj(c, i, st) {
      const o = OBJ[i], t = st.t, lit = st.placed[i] != null;
      if (lit) D.glow(c, o.x, o.y - 10, 95, 'rgba(255,226,120,.45)');
      if (st.hover === i) { c.strokeStyle = 'rgba(242,183,5,.9)'; c.lineWidth = 4; c.setLineDash([8, 6]); c.beginPath(); c.arc(o.x, o.y - 8, o.r, 0, TAU); c.stroke(); c.setLineDash([]); }
      const x = o.x, y = o.y;
      if (i === 0) { // 전선 묶음(빨간 피복) + 벗겨진 끝의 구리
        D.shadow(c, x, y + 42, 70, 10);
        c.fillStyle = D.lin(c, x - 50, 0, x + 50, 0, ['#7c5a3a', '#b58a5c', '#7c5a3a']); c.beginPath(); c.ellipse(x, y + 30, 52, 14, 0, 0, TAU); c.fill();
        for (let k = 0; k < 9; k++) { const yy = y + 22 - k * 6.5; c.fillStyle = D.lin(c, x - 44, 0, x + 44, 0, ['#8e1f16', '#e2513f', '#a8261a']); c.beginPath(); c.ellipse(x, yy, 44, 11, 0, 0, Math.PI); c.fill(); c.strokeStyle = 'rgba(70,10,5,.35)'; c.lineWidth = 1; c.stroke(); }
        c.fillStyle = D.lin(c, x - 50, 0, x + 50, 0, ['#8a6442', '#c99d6b', '#8a6442']); c.beginPath(); c.ellipse(x, y - 34, 52, 14, 0, 0, TAU); c.fill(); c.strokeStyle = '#5d3f24'; c.lineWidth = 1.5; c.stroke();
        c.fillStyle = '#4b3420'; c.beginPath(); c.ellipse(x, y - 34, 12, 4, 0, 0, TAU); c.fill();
        D.wire(c, [[x + 40, y + 6], [x + 62, y + 18], [x + 78, y + 34]], '#d2402f', 9);
        for (let k = 0; k < 5; k++) { c.strokeStyle = k % 2 ? '#f2b27a' : '#c86d2c'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x + 77, y + 34); c.lineTo(x + 98 + k * 1.5, y + 46 + (k - 2) * 2.5); c.stroke(); }
        D.glow(c, x + 92, y + 44, 12, 'rgba(255,190,120,.6)');
      } else if (i === 1) { // 못·나사 상자
        D.shadow(c, x, y + 40, 72, 11);
        c.fillStyle = D.lin(c, 0, y - 20, 0, y + 36, ['#d9b47c', '#b78f57']); c.beginPath(); c.moveTo(x - 58, y - 14); c.lineTo(x + 58, y - 14); c.lineTo(x + 52, y + 36); c.lineTo(x - 52, y + 36); c.closePath(); c.fill(); c.strokeStyle = '#7d5f35'; c.lineWidth = 2; c.stroke();
        for (let k = 0; k < 13; k++) { const nx = x - 46 + k * 7.6, a = -0.35 + hash(k, 3) * 0.7, L = 50 + hash(k, 5) * 12; const tx = nx + Math.sin(a) * L, ty = y - 14 - Math.cos(a) * L * 0.75;
          c.strokeStyle = D.lin(c, nx - 3, 0, nx + 3, 0, ['#6f7680', '#e3e6ea', '#7d848e']); c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(nx, y - 4); c.lineTo(tx, ty); c.stroke(); c.lineCap = 'butt';
          c.fillStyle = '#9aa1ab'; c.beginPath(); c.ellipse(tx, ty, 6, 2.6, a, 0, TAU); c.fill(); c.strokeStyle = '#5b626d'; c.lineWidth = 1; c.stroke(); }
        c.fillStyle = D.lin(c, 0, y - 14, 0, y + 36, ['#e8c58e', '#c49c62']); c.beginPath(); c.moveTo(x - 58, y + 2); c.lineTo(x + 58, y + 2); c.lineTo(x + 52, y + 36); c.lineTo(x - 52, y + 36); c.closePath(); c.fill(); c.strokeStyle = '#7d5f35'; c.stroke();
        D.txt(c, '못 · 나사', x, y + 25, '#5d4423', '700 13px');
        // 상자 밖 나사 하나
        const sx = x + 74, sy = y + 30; c.fillStyle = D.lin(c, 0, sy - 5, 0, sy + 5, ['#e3e6ea', '#7d848e']); D.rr(c, sx - 26, sy - 4, 40, 8, 3); c.fill();
        for (let k = 0; k < 7; k++) D.line(c, sx - 24 + k * 5.5, sy - 4, sx - 21 + k * 5.5, sy + 4, '#5b626d', 1.2);
        D.ball(c, sx + 16, sy, 7, '#c9ced5', '#6c727c');
      } else if (i === 2) { // 회로 기판 + 칩 + 금빛 단자
        D.shadow(c, x, y + 40, 82, 11);
        c.save(); c.translate(x, y); c.transform(1, 0, -0.18, 0.62, 0, 0);
        c.fillStyle = D.lin(c, -80, -60, 80, 60, ['#2f8a55', '#1d6a3e']); D.rr(c, -78, -62, 156, 124, 6); c.fill(); c.strokeStyle = '#124428'; c.lineWidth = 2; c.stroke();
        c.strokeStyle = 'rgba(160,230,170,.55)'; c.lineWidth = 2; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(-70, -48 + k * 18); c.lineTo(-40, -48 + k * 18); c.lineTo(-30, -38 + k * 14); c.lineTo(-22, -38 + k * 14); c.stroke(); }
        c.fillStyle = D.lin(c, -30, -30, 30, 30, ['#3a3f48', '#14171c']); D.rr(c, -22, -34, 64, 64, 4); c.fill();
        for (let k = 0; k < 6; k++) { c.fillStyle = '#c7ccd3'; c.fillRect(-28, -28 + k * 10, 6, 4); c.fillRect(42, -28 + k * 10, 6, 4); }
        D.txt(c, 'CHIP', 10, 6, 'rgba(255,255,255,.55)', '700 13px');
        for (let k = 0; k < 9; k++) { c.fillStyle = D.lin(c, 0, 48, 0, 62, ['#fff2b0', '#e2a91b', '#a87508']); c.fillRect(-70 + k * 16, 46, 10, 16); }
        c.restore();
        D.glow(c, x + 4 + Math.sin(t * 1.3) * 30, y + 30, 16, 'rgba(255,240,170,.55)');
      } else if (i === 3) { // 연필(노란 육각, 지우개, 깎은 나무, 흑연 심)
        D.shadow(c, x, y + 26, 90, 9);
        c.save(); c.translate(x, y + 6); c.rotate(-0.12);
        c.fillStyle = D.lin(c, 0, -11, 0, 11, ['#ffe27a', '#f2b705', '#c98d00']); c.fillRect(-80, -11, 130, 22);
        D.line(c, -80, -4, 50, -4, 'rgba(160,110,0,.5)', 1.2); D.line(c, -80, 4, 50, 4, 'rgba(160,110,0,.5)', 1.2);
        c.fillStyle = D.lin(c, 0, -11, 0, 11, ['#e8eaed', '#9aa1ab']); c.fillRect(-98, -11, 18, 22); c.fillStyle = D.lin(c, 0, -11, 0, 11, ['#f7b5b0', '#d9776f']); D.rr(c, -116, -11, 20, 22, [8, 0, 0, 8]); c.fill();
        c.fillStyle = D.lin(c, 50, 0, 84, 0, ['#e9c896', '#d4a96a']); c.beginPath(); c.moveTo(50, -11); c.lineTo(84, -3); c.lineTo(84, 3); c.lineTo(50, 11); c.closePath(); c.fill();
        c.fillStyle = D.lin(c, 0, -4, 0, 4, ['#8a8f99', '#2f333a']); c.beginPath(); c.moveTo(80, -4); c.lineTo(98, 0); c.lineTo(80, 4); c.closePath(); c.fill();
        D.txt(c, 'HB', -20, 5, '#5d4300', '800 12px');
        c.restore();
      } else if (i === 4) { // 과자 봉지(빵빵, 숨쉬는 듯)
        const k = 1 + 0.015 * Math.sin(t * 1.6);
        D.shadow(c, x, y + 46, 72, 10);
        c.save(); c.translate(x, y); c.scale(k, k);
        c.fillStyle = D.lin(c, -60, -60, 60, 60, ['#dfe9f5', '#8fb0d6', '#5a7fae', '#c5d6ec']); c.beginPath(); c.moveTo(-54, -58); c.quadraticCurveTo(-70, 0, -54, 56); c.lineTo(54, 56); c.quadraticCurveTo(70, 0, 54, -58); c.closePath(); c.fill(); c.strokeStyle = '#3d5a83'; c.lineWidth = 2; c.stroke();
        c.fillStyle = '#3d5a83'; for (let j = 0; j < 11; j++) { c.beginPath(); c.moveTo(-54 + j * 10.8, -58); c.lineTo(-48.6 + j * 10.8, -66); c.lineTo(-43.2 + j * 10.8, -58); c.fill(); c.beginPath(); c.moveTo(-54 + j * 10.8, 56); c.lineTo(-48.6 + j * 10.8, 64); c.lineTo(-43.2 + j * 10.8, 56); c.fill(); }
        c.fillStyle = '#fff7e0'; D.rr(c, -36, -24, 72, 44, 10); c.fill();
        for (let j = 0; j < 4; j++) D.ball(c, -18 + j * 12, 4 + (j % 2) * 5, 8, '#f2c46a', '#b77a1d', '#fff1c8');
        D.txt(c, '과자', 0, -6, '#b0412e', '800 16px');
        c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(-30, -30, 8, 20, 0.3, 0, TAU); c.fill();
        c.restore();
      } else { // 성냥갑
        D.shadow(c, x, y + 34, 66, 9);
        c.fillStyle = D.lin(c, 0, y - 10, 0, y + 30, ['#e05a3f', '#a8301e']); c.beginPath(); c.moveTo(x - 52, y - 4); c.lineTo(x + 40, y - 4); c.lineTo(x + 56, y - 18); c.lineTo(x - 36, y - 18); c.closePath(); c.fill();
        c.fillStyle = D.lin(c, 0, y - 4, 0, y + 30, ['#f6e3b0', '#d9bd7a']); c.fillRect(x - 52, y - 4, 92, 32);
        for (let k = 0; k < 6; k++) { const mx = x - 30 + k * 12; c.fillStyle = '#e9cf98'; c.fillRect(mx - 2, y - 40, 4, 38); D.ball(c, mx, y - 42, 5.5, '#d33a2a', '#7c160d', '#ff9a85'); }
        c.fillStyle = D.lin(c, 0, y - 4, 0, y + 30, ['#e05a3f', '#9c2a19']); c.fillRect(x - 52, y + 6, 92, 22);
        c.fillStyle = D.lin(c, x + 40, 0, x + 56, 0, ['#7a4b2c', '#4a2b17']); c.beginPath(); c.moveTo(x + 40, y - 4); c.lineTo(x + 56, y - 18); c.lineTo(x + 56, y + 14); c.lineTo(x + 40, y + 28); c.closePath(); c.fill();
        for (let k = 0; k < 18; k++) { c.fillStyle = 'rgba(255,220,180,.25)'; c.fillRect(x + 42 + hash(k) * 12, y - 10 + hash(k, 2) * 34, 1.6, 1.6); }
        D.txt(c, '성냥', x - 6, y + 22, '#fff4dc', '800 14px');
      }
      if (lit) { const j = st.placed[i]; D.cell(c, o.x - 44, o.y - o.r - 76, 88, 64, OBJ[j].s, OBJ[j].z, OBJ[j].n, { bg: D.lin(c, 0, 0, 0, 64, [KC[kindOf(OBJ[j].z)][1], '#fff']), line: KC[kindOf(OBJ[j].z)][0] });
        D.tag(c, o.use, o.x, o.y - o.r - 92, { f: '700 14px', bg: 'rgba(29,36,51,.85)', col: '#fff' }); }
    }

    def('use3', {
      init(st, api) { st.placed = OBJ.map(() => null); st.drag = null; st.hover = -1; st.reveal = -1; st.cards = ORDER.map((j, i) => ({ j, x: slotX(i), y: SLOT_Y, home: true })); api.say('카드를 끌어 그 원소로 만든 물건 위에 놓자. 맞으면 벽 포스터의 칸이 빛난다.'); },
      draw(c, st, api) {
        const W = 1060, H = 700, t = st.t;
        // 벽: 창문(하늘·건물·빛줄기) · 메모판 · 포스터
        D.lab(c, W, H, 430, { depth: 140, w0: '#f6efe1', w1: '#e6dcc6' });
        c.fillStyle = D.lin(c, 0, 50, 0, 300, ['#9fd0f2', '#d9eefb']); D.rr(c, 40, 48, 250, 232, 6); c.fill();
        c.fillStyle = 'rgba(255,255,255,.9)'; for (let k = 0; k < 3; k++) { const cx = 80 + ((k * 90 + t * 6) % 270), cy = 90 + k * 26; c.beginPath(); c.ellipse(cx, cy, 30, 10, 0, 0, TAU); c.ellipse(cx + 18, cy - 6, 20, 9, 0, 0, TAU); c.fill(); }
        c.fillStyle = '#b8c7d6'; [[50, 200, 40, 80], [92, 170, 46, 110], [142, 210, 34, 70], [178, 150, 50, 130], [232, 190, 50, 90]].forEach(([bx, by, bw, bh]) => { c.fillRect(bx, by, bw, bh); });
        c.fillStyle = 'rgba(255,255,255,.55)'; for (let k = 0; k < 24; k++) c.fillRect(56 + (k % 8) * 30, 180 + Math.floor(k / 8) * 22, 6, 8);
        c.strokeStyle = '#fbf8f1'; c.lineWidth = 12; D.rr(c, 40, 48, 250, 232, 6); c.stroke(); D.line(c, 165, 48, 165, 280, '#fbf8f1', 8); D.line(c, 40, 164, 290, 164, '#fbf8f1', 8);
        c.fillStyle = 'rgba(255,248,220,.18)'; c.beginPath(); c.moveTo(60, 280); c.lineTo(290, 280); c.lineTo(560, 430); c.lineTo(180, 430); c.closePath(); c.fill();
        for (let k = 0; k < 14; k++) { const px = 200 + ((hash(k) * 300 + t * (6 + k)) % 300), py = 300 + hash(k, 2) * 120 + Math.sin(t + k) * 6; c.fillStyle = 'rgba(255,250,230,.6)'; c.beginPath(); c.arc(px, py, 1.4, 0, TAU); c.fill(); }
        // 메모판
        c.fillStyle = D.lin(c, 0, 70, 0, 260, ['#c79b62', '#a97c45']); D.rr(c, 330, 70, 240, 190, 6); c.fill(); c.strokeStyle = '#6e4a22'; c.lineWidth = 6; c.stroke();
        for (let k = 0; k < 60; k++) { c.fillStyle = 'rgba(90,55,20,.25)'; c.fillRect(340 + hash(k) * 220, 80 + hash(k, 9) * 170, 2, 2); }
        c.save(); c.translate(450, 160); c.rotate(-0.04); c.fillStyle = '#fffbe6'; c.fillRect(-90, -62, 180, 124); c.fillStyle = 'rgba(0,0,0,.08)'; c.fillRect(-90, 58, 180, 4);
        D.txt(c, '오늘의 수사', 0, -30, '#b0412e', '800 17px'); D.txt(c, '이 물건들은', 0, -2, '#1d2433', '700 16px'); D.txt(c, '어떤 원소로', 0, 22, '#1d2433', '700 16px'); D.txt(c, '만들었을까?', 0, 46, '#1d2433', '700 16px');
        D.ball(c, 0, -56, 7, '#e2553f', '#8f2414'); c.restore();
        // 포스터: 주기율표
        D.card(c, PT.x - 20, PT.y - 52, 18 * PT.cw + 40, 7 * PT.ch + 118, { bg: '#fffdf6', r: 6 });
        D.txt(c, '주기율표', PT.x, PT.y - 24, '#1d2433', '800 18px', 'left');
        const all = window.Elem.all;
        all.forEach((e) => {
          if (!e.g) return; const [cx, cy] = cellXY(e), lit = OBJ.findIndex((o) => o.z === e.z), on = lit >= 0 && st.placed.includes(lit);
          let fill = '#eef1f4';
          if (st.reveal >= 0) { const k = clamp((st.reveal - e.g * 0.05) * 3, 0, 1); if (k > 0) fill = KC[e.k][1]; }
          if (on) fill = KC[e.k][0];
          c.fillStyle = fill; c.fillRect(cx + 1, cy + 1, PT.cw - 2, PT.ch - 2);
          if (on) { D.txt(c, e.s, cx + PT.cw / 2, cy + PT.ch * 0.68, '#fff', '800 12px'); D.glow(c, cx + PT.cw / 2, cy + PT.ch / 2, 22 + 4 * Math.sin(t * 4), 'rgba(255,230,120,.5)'); }
        });
        [6, 7].forEach((pp) => { const cx = PT.x + 2 * PT.cw, cy = PT.y + (pp - 1) * PT.ch; c.fillStyle = st.reveal >= 0 ? KC.m[1] : '#eef1f4'; c.fillRect(cx + 1, cy + 1, PT.cw - 2, PT.ch - 2); D.txt(c, '＊', cx + PT.cw / 2, cy + PT.ch * 0.68, '#4a5366', '700 12px'); c.strokeStyle = 'rgba(29,36,51,.25)'; c.lineWidth = 1; c.strokeRect(cx + 0.5, cy + 0.5, PT.cw - 1, PT.ch - 1); });
        c.strokeStyle = 'rgba(29,36,51,.25)'; c.lineWidth = 1; all.forEach((e) => { if (e.g) { const [cx, cy] = cellXY(e); c.strokeRect(cx + 0.5, cy + 0.5, PT.cw - 1, PT.ch - 1); } });
        for (let g = 1; g <= 18; g += (g === 1 ? 1 : g === 2 ? 11 : g === 13 ? 5 : 1)) { if ([1, 2, 13, 18].includes(g)) D.txt(c, `${g}족`, PT.x + (g - 0.5) * PT.cw, PT.y - 4, '#4a5366', '600 10px'); }
        for (let p = 1; p <= 7; p++) D.txt(c, `${p}`, PT.x - 8, PT.y + (p - 0.4) * PT.ch, '#4a5366', '600 11px', 'right');
        const ly = PT.y + 7 * PT.ch + 22;
        [['m', '금속'], ['n', '비금속'], ['x', '준금속']].forEach(([k, nm], i) => { const lx = PT.x + i * 100; c.fillStyle = st.reveal >= 0 ? KC[k][1] : KC[k][0]; c.fillRect(lx, ly - 11, 16, 14); c.strokeStyle = KC[k][0]; c.strokeRect(lx, ly - 11, 16, 14); D.txt(c, nm, lx + 22, ly + 1, '#1d2433', '600 13px', 'left'); });
        if (st.reveal < 0) D.txt(c, '찾은 원소만 빛난다', PT.x + 18 * PT.cw, ly + 1, '#4a5366', '600 12px', 'right');
        D.txt(c, '＊ 57~71번·89~103번 원소는 표 아래에 따로 놓는다', PT.x, ly + 20, '#4a5366', '600 12px', 'left');
        if (st.reveal >= 0) st.reveal += st.dt;
        c.fillStyle = 'rgba(70,40,15,.25)'; c.fillRect(0, 570, W, 6);
        OBJ.forEach((o, i) => drawObj(c, i, st));
        // 꽂이 + 카드
        c.fillStyle = D.lin(c, 0, 590, 0, 690, ['#6e4a2a', '#4d321b']); D.rr(c, 40, 652, 980, 26, 6); c.fill();
        st.cards.forEach((cd, i) => {
          if (cd.placed != null || cd === st.drag) return; const o = OBJ[cd.j];
          D.cell(c, cd.x - CW / 2, cd.y - CH / 2, CW, CH, o.s, o.z, o.n);
        });
        if (st.drag) { const o = OBJ[st.drag.j]; D.cell(c, st.drag.x - CW / 2, st.drag.y - CH / 2, CW, CH, o.s, o.z, o.n, { lift: true }); }
      },
      hint(st) { const i = st.cards.findIndex((cd) => cd.placed == null); if (i < 0) return null; const cd = st.cards[i], o = OBJ[cd.j]; return { x: cd.x, y: cd.y - 10, dx: o.x - cd.x, dy: o.y - cd.y, dist: Math.hypot(o.x - cd.x, o.y - 30 - cd.y), label: '카드를 끌어 물건에 놓기' }; },
      down(p, st) { const cd = st.cards.find((k) => k.placed == null && Math.abs(p.x - k.x) < CW / 2 && Math.abs(p.y - k.y) < CH / 2); if (cd) { st.drag = cd; cd.dx = p.x - cd.x; cd.dy = p.y - cd.y; } },
      move(p, st) { if (!st.drag) return; st.drag.x = p.x - st.drag.dx; st.drag.y = p.y - st.drag.dy; st.hover = OBJ.findIndex((o, i) => st.placed[i] == null && Math.hypot(p.x - o.x, p.y - o.y + 8) < o.r + 10); },
      up(p, st, api) { const cd = st.drag; if (!cd) return; st.drag = null; st.hover = -1; const i = OBJ.findIndex((o, k) => st.placed[k] == null && Math.hypot(p.x - o.x, p.y - o.y + 8) < o.r + 10); this.put(cd, i, st, api); },
      put(cd, i, st, api) {
        const home = () => { const s = st.cards.indexOf(cd); cd.x = slotX(s); cd.y = SLOT_Y; };
        if (i < 0) { home(); return; }
        if (i !== cd.j) { home(); api.jolt(); api.say(`${OBJ[cd.j].n}(${OBJ[cd.j].s})은 여기가 아니다. 힌트: ${OBJ[i].hint}`); return; }
        cd.placed = i; st.placed[i] = cd.j; const o = OBJ[i], k = kindOf(o.z);
        api.spark(o.x, o.y - 30, k === 'm' ? '#7fb2f0' : '#f6c64a', 18); api.ring(o.x, o.y - 20);
        api.row(i, [o.use, k === 'm' ? '<b style="color:#2f63ad">금속</b>' : '<b style="color:#b07a00">비금속</b>', o.why]);
        const n = st.placed.filter((v) => v != null).length;
        api.say(`<b>${o.n}(${o.s})</b> → ${o.use}. ${k === 'm' ? '금속' : '비금속'} 원소 — ${o.why}. (${n}/6)`);
        if (n >= 3) api.ok(2);
        if (n === 6) { st.reveal = 0; api.ok(3); const hit = api.judge('L', '철·구리·금은 가운데, 탄소·질소·인은 오른쪽에 있다.'); api.say(`포스터를 보자. 금속(파랑)은 <b>왼쪽과 가운데</b>, 비금속(노랑)은 대부분 <b>오른쪽</b>에 모여 있다. ${hit ? '예측대로다.' : '예측과 비교해 보자.'}`); }
      },
      key(k, st, api) { if (/^[1-6]$/.test(k)) { const cd = st.cards[+k - 1]; if (cd && cd.placed == null) this.put(cd, cd.j, st, api); return true; } return false; },
      test(st, api, n = 6) { st.cards.filter((cd) => cd.placed == null).slice(0, n).forEach((cd) => this.put(cd, cd.j, st, api)); },
    });
  }

  // ───────────────────────── pencil3 연필 선으로 회로 잇기 ─────────────────────────
  {
    const PAPER = { x: 40, y: 40, w: 690, h: 620 }, CM = 40;            // 1 cm = 40
    const A = { x: 150, y: 300 }, B = { x: 610, y: 300 }, PAD = 20;     // 두 집게 끝(11.5 cm 떨어짐)
    const PEN = { HB: { r: 4.0, w: 5, col: 'rgba(78,80,88,.82)', body: ['#ffe27a', '#f2b705', '#c98d00'] }, '4B': { r: 1.6, w: 9, col: 'rgba(38,39,44,.92)', body: ['#7fd39a', '#2f9a5a', '#1b6a3b'] } };  // r: 1 cm 당 kΩ(이해를 돕기 위한 예)
    const TOOLS = { HB: { x: 818, y: 430 }, '4B': { x: 912, y: 430 }, ER: { x: 1004, y: 440 } };
    const GR = { x: 816, y: 542, w: 206, h: 98 };
    const near = (p, q, d) => Math.hypot(p.x - q.x, p.y - q.y) < d;
    const lenOf = (s) => { let L = 0; for (let i = 1; i < s.pts.length; i++) L += Math.hypot(s.pts[i].x - s.pts[i - 1].x, s.pts[i].y - s.pts[i - 1].y); return L; };
    // 두 집게가 선으로 이어졌나 → 이어진 선들의 저항 합(kΩ)·길이(cm)
    function circuit(st) {
      const S = st.strokes, n = S.length; if (!n) return null;
      const touch = (s, q) => s.pts.some((p) => near(p, q, PAD));
      const link = (a, b) => { const d = (PEN[a.pen].w + PEN[b.pen].w) / 2 + 4; for (const p of a.pts) for (const q of b.pts) if (near(p, q, d)) return true; return false; };
      const seen = new Set(), q = []; S.forEach((s, i) => { if (touch(s, A)) { seen.add(i); q.push(i); } });
      while (q.length) { const i = q.shift(); S.forEach((s, j) => { if (!seen.has(j) && link(S[i], s)) { seen.add(j); q.push(j); } }); }
      if (![...seen].some((i) => touch(S[i], B))) return null;
      let R = 0, L = 0, pen = new Set(); seen.forEach((i) => { const l = lenOf(S[i]) / CM; L += l; R += l * PEN[S[i].pen].r; pen.add(S[i].pen); });
      return { R, L, I: 7 / Math.max(R, 1), pen: [...pen].join('·') };      // 전류(mA) = (9 V − 다이오드 2 V) / R(kΩ)
    }
    def('pencil3', {
      bg: '#7a5a3c',
      init(st, api) { st.strokes = []; st.cur = null; st.pen = 'HB'; st.rec = []; st.circ = null; st.erase = 0; st.lastRec = -9; api.say('오른쪽 아래에서 연필을 고르고, 종이 위를 끌어 <b>왼쪽 집게에서 오른쪽 집게까지</b> 선을 그어 보자.'); },
      draw(c, st, api) {
        const t = st.t, W = 1060, H = 700;
        // 책상(위에서 본 나무판)
        c.fillStyle = D.lin(c, 0, 0, W, H, ['#a77a4b', '#8c6239', '#9b7044']); c.fillRect(0, 0, W, H);
        c.strokeStyle = 'rgba(70,40,15,.18)'; c.lineWidth = 1.5; for (let i = 0; i < 16; i++) { c.beginPath(); for (let x = 0; x <= W; x += 30) c.lineTo(x, 20 + i * 45 + Math.sin(x * 0.01 + i) * 6); c.stroke(); }
        // 종이(1 cm 눈금)
        c.save(); c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 18; c.shadowOffsetY = 6; c.fillStyle = '#fdfdf8'; c.fillRect(PAPER.x, PAPER.y, PAPER.w, PAPER.h); c.restore();
        c.strokeStyle = 'rgba(80,140,200,.16)'; c.lineWidth = 1; c.beginPath();
        for (let x = PAPER.x + 10; x < PAPER.x + PAPER.w; x += CM) { c.moveTo(x, PAPER.y); c.lineTo(x, PAPER.y + PAPER.h); } for (let y = PAPER.y + 20; y < PAPER.y + PAPER.h; y += CM) { c.moveTo(PAPER.x, y); c.lineTo(PAPER.x + PAPER.w, y); } c.stroke();
        // 자(위쪽 가장자리)
        c.fillStyle = 'rgba(240,236,220,.95)'; c.fillRect(PAPER.x + 10, PAPER.y + 8, 480, 34); c.strokeStyle = 'rgba(29,36,51,.5)'; c.strokeRect(PAPER.x + 10, PAPER.y + 8, 480, 34);
        for (let k = 0; k <= 11; k++) { const x = PAPER.x + 10 + k * CM; D.line(c, x, PAPER.y + 8, x, PAPER.y + 22, '#1d2433', 1.5); if (k < 11) D.line(c, x + CM / 2, PAPER.y + 8, x + CM / 2, PAPER.y + 15, '#1d2433', 1); D.txt(c, String(k), x, PAPER.y + 36, '#1d2433', '600 11px'); }
        D.txt(c, 'cm', PAPER.x + 470, PAPER.y + 36, '#1d2433', '700 11px', 'left');
        // 연필 선
        const draw = (s) => { const pe = PEN[s.pen]; if (s.pts.length < 2) return; c.lineCap = 'round'; c.lineJoin = 'round';
          c.strokeStyle = pe.col; c.lineWidth = pe.w; c.beginPath(); s.pts.forEach((p, i) => (i ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.stroke();
          c.strokeStyle = 'rgba(200,205,215,.35)'; c.lineWidth = Math.max(1, pe.w * 0.25); c.beginPath(); s.pts.forEach((p, i) => (i ? c.lineTo(p.x + 0.8, p.y - 1) : c.moveTo(p.x + 0.8, p.y - 1))); c.stroke(); c.lineCap = 'butt'; };
        c.save(); if (st.erase > 0) c.globalAlpha = st.erase; st.strokes.forEach(draw); c.restore(); if (st.erase > 0) { st.erase -= st.dt * 2.5; if (st.erase <= 0) { st.strokes = []; st.erase = 0; } }
        if (st.cur) draw(st.cur);
        // 전류가 흐르면 선 위로 빛 알갱이가 흐른다
        const ci = st.circ;
        if (ci) st.strokes.forEach((s, si) => { const n = s.pts.length; for (let k = 0; k < 4; k++) { const f = ((t * 0.35 * Math.min(2, ci.I * 3) + k / 4 + si * 0.13) % 1), p = s.pts[Math.floor(f * (n - 1))]; D.glow(c, p.x, p.y, 10, 'rgba(255,220,90,.75)'); } });
        // 집게 패드
        [A, B].forEach((q, i) => { c.fillStyle = 'rgba(200,120,60,.18)'; c.beginPath(); c.arc(q.x, q.y, PAD, 0, TAU); c.fill(); c.strokeStyle = 'rgba(200,120,60,.7)'; c.setLineDash([4, 4]); c.lineWidth = 1.5; c.stroke(); c.setLineDash([]); D.clip(c, q.x, q.y, i ? 0 : Math.PI, i ? '#1d2433' : '#c0392b'); });
        D.tag(c, '집게 A', A.x - 30, A.y + 40, { f: '700 13px' }); D.tag(c, '집게 B', B.x + 30, B.y + 40, { f: '700 13px' });
        // 오른쪽 회로: 전지(+ 왼쪽, − 오른쪽) → 집게 A → 연필 선 → 집게 B → 전류계 → 발광 다이오드 → 전지
        D.card(c, 770, 40, 270, 345, { bg: 'rgba(250,250,244,.96)', title: '회로' });
        D.wire(c, [[A.x - 50, A.y], [A.x - 96, A.y], [A.x - 96, 120], [830, 120]], '#c0392b', 5);
        D.wire(c, [[B.x + 50, B.y], [745, B.y], [745, 330], [818, 330]], '#2b3242', 5);
        c.fillStyle = D.lin(c, 0, 92, 0, 148, ['#4b5466', '#2b3242', '#1d2433']); D.rr(c, 832, 92, 130, 56, 8); c.fill();
        c.fillStyle = D.lin(c, 0, 98, 0, 142, ['#ffd84d', '#e0a500']); c.fillRect(852, 99, 90, 42); D.txt(c, '9 V', 897, 129, '#1d2433', '800 22px');
        D.txt(c, '+', 842, 112, '#ff8a70', '800 16px'); D.txt(c, '−', 952, 112, '#e8edf5', '800 16px');
        D.wire(c, [[962, 120], [1008, 120], [1008, 215], [948, 215]], '#2b3242', 4);
        D.wire(c, [[962, 330], [992, 330], [992, 262], [850, 262], [850, 215], [866, 215]], '#2b3242', 4);
        const I = ci ? ci.I : 0, br = clamp(I / 0.6, 0, 1) * (0.92 + 0.08 * Math.sin(t * 9));
        if (br > 0.02) D.glow(c, 907, 205, 60 * br + 24, `rgba(255,70,50,${0.6 * br})`);
        c.fillStyle = '#bfc4cb'; c.fillRect(864, 213, 26, 4); c.fillRect(924, 213, 26, 4);
        c.fillStyle = br > 0.02 ? `rgb(255,${Math.round(90 + 120 * br)},${Math.round(80 + 100 * br)})` : '#9e2a22';
        c.beginPath(); c.arc(907, 200, 17, Math.PI, 0); c.lineTo(924, 222); c.lineTo(890, 222); c.closePath(); c.fill();
        c.fillStyle = '#7d1d16'; c.fillRect(888, 220, 38, 5);
        c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(900, 195, 4, 8, 0.3, 0, TAU); c.fill();
        D.txt(c, '발광 다이오드', 907, 246, '#1d2433', '700 13px');
        D.lcd(c, 824, 306, 132, 46, ci ? I.toFixed(2) : '0.00', 'mA');
        D.txt(c, '전류계', 890, 372, '#1d2433', '700 13px');
        // 도구: 연필 둘 · 지우개
        D.card(c, 770, 396, 270, 84, { bg: 'rgba(250,250,244,.96)' });
        Object.keys(PEN).forEach((k) => { const q = TOOLS[k], on = st.pen === k; if (on) { c.fillStyle = 'rgba(255,226,122,.85)'; D.rr(c, q.x - 34, q.y - 18, 110, 36, 10); c.fill(); c.strokeStyle = '#c98d00'; c.lineWidth = 2; c.stroke(); }
          c.save(); c.translate(q.x, q.y); c.fillStyle = D.lin(c, 0, -8, 0, 8, PEN[k].body); c.fillRect(-26, -8, 66, 16); c.fillStyle = '#e9c896'; c.beginPath(); c.moveTo(40, -8); c.lineTo(58, 0); c.lineTo(40, 8); c.fill(); c.fillStyle = '#2f333a'; c.beginPath(); c.moveTo(52, -3); c.lineTo(60, 0); c.lineTo(52, 3); c.fill(); D.txt(c, k, 6, 5, '#1d2433', '800 12px'); c.restore(); });
        D.txt(c, '연필을 눌러 고르기', 860, 473, '#4a5366', '600 11px');
        const e = TOOLS.ER; c.save(); c.translate(e.x, e.y); c.rotate(-0.2); c.fillStyle = D.lin(c, 0, -16, 0, 16, ['#ffd1cc', '#f08f84']); D.rr(c, -34, -16, 68, 32, 6); c.fill(); c.fillStyle = '#3d6fb6'; c.fillRect(-34, -16, 28, 32); D.txt(c, '지우개', 14, 5, '#7a2a20', '800 12px'); c.restore();
        // 그래프: 선 길이(cm) ↔ 전류(mA)
        D.card(c, 770, 490, 270, 196, { bg: 'rgba(250,250,244,.96)', title: '선 길이와 전류' });
        const g = D.axes(c, GR.x, GR.y, GR.w, GR.h, { x0: 0, x1: 30, y0: 0, y1: 0.6, xt: [0, 10, 20, 30], yt: [0, 0.2, 0.4, 0.6], xl: '선 길이(cm)', yl: '전류(mA)', fs: 11 });
        st.rec.forEach((r) => { D.ball(c, g.X(Math.min(30, r.L)), g.Y(Math.min(0.6, r.I)), 6.5, r.pen.includes('4B') ? '#3c8f5a' : '#f2b705', '#1d2433'); });
        D.ball(c, 960, 515, 5, '#f2b705', '#1d2433'); D.txt(c, 'HB', 970, 519, '#1d2433', '700 11px', 'left'); D.ball(c, 1000, 515, 5, '#3c8f5a', '#1d2433'); D.txt(c, '4B', 1010, 519, '#1d2433', '700 11px', 'left');
        // 선을 긋는 중이면 손끝에 연필
        if (st.cur && st.cur.pts.length) { const p = st.cur.pts[st.cur.pts.length - 1]; c.save(); c.translate(p.x, p.y); c.rotate(-0.9); c.fillStyle = '#2f333a'; c.beginPath(); c.moveTo(0, 0); c.lineTo(8, -4); c.lineTo(8, 4); c.fill(); c.fillStyle = '#e9c896'; c.beginPath(); c.moveTo(8, -4); c.lineTo(24, -9); c.lineTo(24, 9); c.lineTo(8, 4); c.fill(); c.fillStyle = D.lin(c, 0, -9, 0, 9, PEN[st.pen].body); c.fillRect(24, -9, 110, 18); c.restore(); }
        if (!ci && !st.cur && st.strokes.length && st.erase === 0) D.tag(c, '아직 두 집게가 이어지지 않았다', 380, 600, { f: '700 15px', bg: 'rgba(255,240,200,.95)', line: '#c98d00' });
      },
      hint(st) { return { x: A.x + 10, y: A.y - 70, dx: 1, dy: 0, dist: B.x - A.x - 20, label: '연필로 두 집게 사이를 이어 긋기' }; },
      down(p, st, api) {
        for (const k of Object.keys(PEN)) if (Math.abs(p.x - TOOLS[k].x - 16) < 48 && Math.abs(p.y - TOOLS[k].y) < 22) { st.pen = k; api.say(`<b>${k} 연필</b>을 골랐다. ${k === '4B' ? '진하고 굵은 선이 그어진다.' : '연하고 가는 선이 그어진다.'}`); return; }
        if (Math.hypot(p.x - TOOLS.ER.x, p.y - TOOLS.ER.y) < 36) { if (st.strokes.length) st.erase = 1; st.circ = null; api.say('선을 지웠다. 다른 길이나 다른 연필로 다시 그어 보자.'); return; }
        if (p.x > PAPER.x && p.x < PAPER.x + PAPER.w && p.y > PAPER.y + 44 && p.y < PAPER.y + PAPER.h) { if (st.erase > 0) { st.strokes = []; st.erase = 0; } st.cur = { pen: st.pen, pts: [p] }; }
      },
      move(p, st) { if (!st.cur) return; const q = st.cur.pts[st.cur.pts.length - 1]; if (Math.hypot(p.x - q.x, p.y - q.y) > 4) st.cur.pts.push({ x: clamp(p.x, PAPER.x, PAPER.x + PAPER.w), y: clamp(p.y, PAPER.y + 44, PAPER.y + PAPER.h) }); },
      up(p, st, api) { if (!st.cur) return; if (st.cur.pts.length > 2) st.strokes.push(st.cur); st.cur = null; this.measure(st, api); },
      measure(st, api) {
        const ci = circuit(st); st.circ = ci;
        if (!ci) { if (st.strokes.length) api.say('선이 <b>두 집게(점선 원)</b>에 모두 닿아야 회로가 이어진다.'); return; }
        api.spark(920, 206, '#ff8a70', 16);
        const hit = api.judge('on', '연필심의 흑연은 비금속인 탄소지만 전기가 통한다.');
        const same = st.rec.find((r) => Math.abs(r.L - ci.L) < 0.6 && r.pen === ci.pen);
        if (!same && st.rec.length < 3) { st.rec.push({ L: ci.L, I: ci.I, pen: ci.pen }); const n = st.rec.length - 1; api.row(n, [ci.pen, `${ci.L.toFixed(1)} cm`, `${ci.I.toFixed(2)} mA`]); }
        else if (!same) { st.rec.push({ L: ci.L, I: ci.I, pen: ci.pen }); }
        api.ok(2);
        const pens = new Set(st.rec.map((r) => r.pen)), Ls = st.rec.map((r) => r.L);
        if (st.rec.length >= 3 && (pens.size > 1 || Math.max(...Ls) - Math.min(...Ls) > 3)) api.ok(3);
        api.say(`불이 켜졌다! 선 길이 <b>${ci.L.toFixed(1)} cm</b>, 전류 <b>${ci.I.toFixed(2)} mA</b>. ${st.rec.length < 3 ? '지우개로 지우고 길이나 연필을 바꿔 다시 재 보자.' : '길수록 어둡고, 4B 선일수록 밝다.'} ${hit ? '' : ''}`);
      },
      key(k, st, api) {
        if (k === 'Enter') { const n = 24, pts = []; for (let i = 0; i <= n; i++) pts.push({ x: lerp(A.x, B.x, i / n), y: A.y + (st.strokes.length % 3) * 0 + Math.sin(i / n * Math.PI * (st.strokes.length + 1) * 2) * 30 * Math.min(1, st.strokes.length) }); st.strokes = [{ pen: st.pen, pts }]; this.measure(st, api); return true; }
        if (k === '4') { st.pen = st.pen === 'HB' ? '4B' : 'HB'; return true; }
        return false;
      },
      test(st, api, pen = 'HB', wig = 0) { st.pen = pen; const n = 40, pts = []; for (let i = 0; i <= n; i++) pts.push({ x: lerp(A.x, B.x, i / n), y: A.y + Math.sin(i / n * Math.PI * 2 * wig) * 60 * (wig ? 1 : 0) }); st.strokes = [{ pen, pts }]; this.measure(st, api); },
    });
  }
  // ───────────────────────── ladder9 에너지 계단에 전자 놓기 ─────────────────────────
  {
    const CAP = [2, 8, 8, 2], NM = ['', '수소', '헬륨', '리튬', '베릴륨', '붕소', '탄소', '질소', '산소', '플루오린', '네온', '나트륨', '마그네슘', '알루미늄', '규소', '인', '황', '염소', '아르곤', '칼륨', '칼슘'];
    const SY = ['', 'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca'];
    // 계단 칸: 아래(원자핵 쪽)일수록 에너지 낮음
    const LV = [{ y: 600, x0: 150, w: 110 }, { y: 470, x0: 178, w: 290 }, { y: 340, x0: 206, w: 290 }, { y: 210, x0: 236, w: 110 }];
    const HOP = { x: 470, y: 110 };
    const conf = (n) => { const o = []; let r = n; CAP.forEach((m) => { if (r > 0) { o.push(Math.min(m, r)); r -= m; } }); return o; };
    const slotXY = (lv, k) => { const L = LV[lv], m = CAP[lv]; return [L.x0 + (k + 0.5) * (L.w / m), L.y - 16]; };
    const ROW = { 2: 0, 3: 1, 10: 2, 11: 3 };
    def('ladder9', {
      init(st, api) { st.n = 0; st.fly = []; st.drag = null; st.flash = 0; st.seen = new Set(); api.say('위 <b>전자 상자</b>에서 전자를 끌어 계단 아무 칸에나 놓아 보자. 전자가 어디에 자리 잡는지 본다.'); },
      draw(c, st, api) {
        const t = st.t, W = 1060, H = 700;
        c.fillStyle = D.lin(c, 0, 0, 0, H, ['#1a2448', '#0f1630']); c.fillRect(0, 0, W, H);
        for (let i = 0; i < 70; i++) { const x = hash(i) * W, y = hash(i, 4) * H, a = 0.2 + 0.4 * (0.5 + 0.5 * Math.sin(t * (1 + hash(i, 2)) + i)); c.fillStyle = `rgba(210,225,255,${a})`; c.fillRect(x, y, 1.5, 1.5); }
        // 에너지 축
        D.arrow(c, 60, 650, 60, 120, '#9fb4e6', 3, 14); D.txt(c, '에너지', 60, 100, '#cfe0ff', '800 16px');
        D.txt(c, '높음', 52, 150, '#9fb4e6', '700 13px', 'right'); D.txt(c, '낮음', 52, 596, '#9fb4e6', '700 13px', 'right');
        // 원자핵(계단 아래)
        D.glow(c, 110, 655, 90, 'rgba(240,100,80,.45)'); D.ball(c, 110, 655, 30, '#e2553f', '#8f2414', '#ffd6c8'); D.txt(c, `${st.n}+`, 110, 663, '#fff', '800 20px'); D.txt(c, '원자핵', 168, 672, '#ffd6c8', '700 14px', 'left');
        // 계단(돌 계단: 윗면 + 앞면 그러데이션)
        LV.forEach((L, i) => {
          const full = conf(st.n)[i] === CAP[i], cnt = conf(st.n)[i] || 0;
          c.fillStyle = D.lin(c, 0, L.y, 0, L.y + 34, i % 2 ? ['#5b6a95', '#38446a'] : ['#61709c', '#3b4770']); D.rr(c, L.x0 - 12, L.y, L.w + 24, 34, 4); c.fill();
          c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(L.x0 - 12, L.y, L.w + 24, 4);
          c.strokeStyle = 'rgba(20,26,50,.45)'; c.lineWidth = 1.2; for (let bx = L.x0 - 12 + 46 * ((i % 2) + 0.5); bx < L.x0 + L.w + 12; bx += 46) { c.beginPath(); c.moveTo(bx, L.y + 5); c.lineTo(bx, L.y + 34); c.stroke(); }
          for (let q = 0; q < 26; q++) { c.fillStyle = `rgba(${q % 2 ? '255,255,255' : '10,14,30'},${0.08 + hash(q, i) * 0.1})`; c.fillRect(L.x0 - 8 + hash(q, i + 3) * (L.w + 16), L.y + 6 + hash(q, i + 7) * 26, 2 + hash(q, 9) * 3, 2); }
          c.fillStyle = 'rgba(10,14,30,.45)'; c.fillRect(L.x0 - 12, L.y + 34, L.w + 24, 640 - L.y - 34 > 0 ? 6 : 0);
          for (let k = 0; k < CAP[i]; k++) { const [sx, sy] = slotXY(i, k); c.strokeStyle = 'rgba(160,190,255,.45)'; c.setLineDash([3, 3]); c.lineWidth = 1.5; c.beginPath(); c.arc(sx, sy, 11, 0, TAU); c.stroke(); c.setLineDash([]); }
          D.txt(c, `${i + 1}번째 껍질`, L.x0 + L.w + 22, L.y + 14, full ? '#ffd84d' : '#cfe0ff', '800 15px', 'left');
          D.txt(c, i < 3 ? `${cnt} / 최대 ${CAP[i]}개` : `${cnt} / 20번까지 ${CAP[i]}개 들어감`, L.x0 + L.w + 22, L.y + 32, '#9fb4e6', '600 13px', 'left');
        });
        D.txt(c, '(원자 번호 20까지)', LV[3].x0 + LV[3].w + 22, LV[3].y + 50, '#7f92c4', '600 12px', 'left');
        // 자리 잡은 전자
        const sh = conf(st.n), last = sh.length - 1;
        sh.forEach((m, i) => { for (let k = 0; k < m; k++) { const [sx, sy] = slotXY(i, k), bob = Math.sin(t * 3 + k + i) * 1.5; if (i === last) { c.strokeStyle = '#ffd84d'; c.lineWidth = 2.5; c.beginPath(); c.arc(sx, sy + bob, 13, 0, TAU); c.stroke(); } D.ball(c, sx, sy + bob, 9, '#4aa0f0', '#174a8a', '#e0f0ff'); D.txt(c, '−', sx, sy + bob + 4, '#fff', '800 11px'); } });
        // 날아가는 전자(놓은 자리 → 가장 낮은 빈칸), 지나간 자리 흔적
        st.fly = st.fly.filter((f) => {
          f.k += st.dt / 0.9; const k = ease(clamp(f.k, 0, 1)), x = lerp(f.x0, f.x1, k), y = lerp(f.y0, f.y1, k) - Math.sin(k * Math.PI) * 40;
          f.tr.push([x, y]); if (f.tr.length > 18) f.tr.shift();
          f.tr.forEach(([tx, ty], j) => { c.fillStyle = `rgba(110,180,255,${j / f.tr.length * 0.5})`; c.beginPath(); c.arc(tx, ty, 5 * j / f.tr.length + 1, 0, TAU); c.fill(); });
          D.ball(c, x, y, 9, '#4aa0f0', '#174a8a', '#e0f0ff');
          if (f.k >= 1) { st.n += 1; api.spark(f.x1, f.y1, '#9fd0ff', 10, 90); if (f.drop > 1) { st.flash = 1; st.fx = f.x1; st.fy = f.y1; } this.after(st, api, f); return false; }
          return true;
        });
        if (st.flash > 0) { st.flash -= st.dt; const a = st.flash; c.strokeStyle = `rgba(255,236,140,${a})`; c.lineWidth = 3; c.beginPath(); for (let x = 0; x < 90; x += 3) c.lineTo(st.fx + 20 + x, st.fy - 30 - x * 0.5 + Math.sin(x * 0.4) * 6); c.stroke(); D.tag(c, '에너지를 내놓으며 내려간다', st.fx + 120, st.fy - 80, { f: '700 13px', bg: 'rgba(29,36,51,.85)', col: '#ffe9a0' }); }
        // 전자 상자
        c.fillStyle = D.lin(c, 0, HOP.y - 40, 0, HOP.y + 40, ['#3d4c7c', '#252f55']); D.rr(c, HOP.x - 70, HOP.y - 40, 140, 80, 12); c.fill(); c.strokeStyle = '#9fb4e6'; c.lineWidth = 2; c.stroke();
        for (let k = 0; k < 7; k++) D.ball(c, HOP.x - 45 + (k % 4) * 30 + (k > 3 ? 15 : 0), HOP.y - 12 + (k > 3 ? 22 : 0) + Math.sin(t * 2 + k) * 2, 8, '#4aa0f0', '#174a8a', '#e0f0ff');
        D.txt(c, '전자 상자', HOP.x, HOP.y + 60, '#cfe0ff', '800 15px');
        if (st.drag) { D.glow(c, st.drag.x, st.drag.y, 26, 'rgba(110,180,255,.45)'); D.ball(c, st.drag.x, st.drag.y, 10, '#4aa0f0', '#174a8a', '#e0f0ff'); }
        // 오른쪽: 같은 원자의 모형 + 막대
        D.card(c, 652, 40, 388, 400, { bg: 'rgba(20,28,58,.85)', line: '#6f86c4', title: '같은 원자를 위에서 본 모형', tcol: '#cfe0ff' });
        D.atom(c, 846, 250, { Z: st.n, sh, r0: 22, dr: 30, t, hl: true, rings: Math.max(1, sh.length), ring: 'rgba(170,200,255,.55)' });
        if (st.n) { D.txt(c, `${NM[st.n]} ${SY[st.n]}`, 846, 100, '#fbfcf9', '800 26px'); D.txt(c, `전자 배치 ${sh.join(', ')}`, 846, 418, '#ffd84d', '800 18px'); }
        else D.txt(c, '전자가 없다', 846, 100, '#9fb4e6', '700 20px');
        D.card(c, 652, 460, 388, 220, { bg: 'rgba(20,28,58,.85)', line: '#6f86c4', title: '껍질별 전자 수', tcol: '#cfe0ff' });
        CAP.forEach((m, i) => { const x = 700 + i * 88, y0 = 650, h = m * 16; c.strokeStyle = 'rgba(160,190,255,.6)'; c.setLineDash([4, 3]); c.strokeRect(x, y0 - h, 44, h); c.setLineDash([]);
          const v = sh[i] || 0; c.fillStyle = D.lin(c, 0, y0 - v * 16, 0, y0, ['#7cc0ff', '#2f74c8']); c.fillRect(x, y0 - v * 16, 44, v * 16);
          D.txt(c, `${v}개`, x + 22, y0 - v * 16 - 6, '#fbfcf9', '800 14px'); D.txt(c, `${i + 1}번째`, x + 22, y0 + 18, '#9fb4e6', '600 12px'); });
      },
      after(st, api, f) {
        if (!st.judged) api.judge('low', '전자는 에너지가 낮은 안쪽 껍질부터 채워진다.');
        const n = st.n, sh = conf(n);
        if (ROW[n] != null && !st.seen.has(n)) { st.seen.add(n); api.row(ROW[n], [`${n}`, sh.join(', '), `${n === 2 || n === 10 ? 0 : sh[sh.length - 1]}개`]); }
        if (n >= 3) api.ok(2); if (n >= 11) api.ok(3);
        api.say(f.drop > 0 ? `${f.drop + f.lv + 1}번째 칸에 놓았는데 <b>${f.lv + 1}번째 껍질</b>로 내려가 자리 잡았다. 지금 <b>${NM[n]}</b>(${sh.join(', ')}).` : `<b>${f.lv + 1}번째 껍질</b>에 자리 잡았다. 지금 <b>${NM[n]}</b>(전자 배치 ${sh.join(', ')}).`);
      },
      hint(st) { return { x: HOP.x, y: HOP.y + 10, dx: LV[3].x0 + 60 - HOP.x, dy: LV[3].y - 30 - HOP.y, dist: Math.hypot(LV[3].x0 + 60 - HOP.x, LV[3].y - 30 - HOP.y), label: '전자를 끌어 맨 위 칸에 놓기' }; },
      down(p, st, api) {
        if (Math.abs(p.x - HOP.x) < 75 && Math.abs(p.y - HOP.y) < 45) { if (st.n + st.fly.length >= 20) { api.say('원자 번호 20(칼슘)까지만 만든다.'); return; } st.drag = { x: p.x, y: p.y }; return; }
        // 가장 바깥 전자를 누르면 하나 뺀다
        const sh = conf(st.n), i = sh.length - 1; if (i < 0 || st.fly.length) return;
        const [sx, sy] = slotXY(i, sh[i] - 1); if (Math.hypot(p.x - sx, p.y - sy) < 16) { st.n -= 1; api.say(`가장 바깥 전자를 하나 뺐다. 지금 ${st.n ? NM[st.n] : '전자 없음'}.`); }
      },
      move(p, st) { if (st.drag) { st.drag.x = p.x; st.drag.y = p.y; } },
      up(p, st, api) { const d = st.drag; if (!d) return; st.drag = null; this.drop(p.x, p.y, st, api); },
      drop(x, y, st, api) {
        const n = st.n + st.fly.length; if (n >= 20) return; const sh = conf(n + 1), lv = sh.length - 1, k = sh[lv] - 1, [tx, ty] = slotXY(lv, k);
        let at = LV.findIndex((L) => Math.abs(y - (L.y - 16)) < 60 && x > L.x0 - 40 && x < L.x0 + L.w + 40); if (at < 0) at = y < 270 ? 3 : y < 400 ? 2 : y < 530 ? 1 : 0;
        st.fly.push({ x0: x, y0: y, x1: tx, y1: ty, k: 0, tr: [], lv, drop: Math.max(0, at - lv) });
      },
      key(k, st, api) { if (k === 'ArrowUp' || k === '+') { this.drop(LV[3].x0 + 40, LV[3].y - 20, st, api); return true; } if (k === 'ArrowDown' || k === '-') { if (st.n) st.n -= 1; return true; } return false; },
      test(st, api, n = 1) { for (let i = 0; i < n; i++) { st.n = Math.min(19, st.n); if (i < n - 1) { st.n += 1; this.after(st, api, { drop: 0, lv: conf(st.n).length - 1 }); } else this.drop(LV[3].x0 + 40, LV[3].y - 20, st, api); } },
    });
  }

  // ───────────────────────── mystery9 수수께끼 원소 X ─────────────────────────
  {
    const JAR = { x: 110, y: 440 };
    const ST = [ // 시험대
      { k: 'cut', name: '칼로 자르기', x: 320, y: 470, obs: '쉽게 잘리고 은빛 단면이 곧 흐려진다', like: '나트륨·칼륨', clue: '무르고, 공기 중 산소와 빨리 반응한다' },
      { k: 'water', name: '물에 넣기', x: 560, y: 470, obs: '물에 가라앉으며 폭발하듯 격렬히 반응하고 물이 붉어진다', like: '나트륨·칼륨', clue: '물과 아주 격렬히 반응하고 염기성이 된다' },
      { k: 'elec', name: '전기 회로', x: 800, y: 470, obs: '전구가 켜진다', like: '금속 원소', clue: '전기가 잘 통하는 금속이다' },
    ];
    const COLS = [1, 2, 13, 14, 15, 16, 17, 18], TB = { x: 640, y: 64, cw: 48, ch: 38 };
    const KNOWN = { 1: ['H', 'Li', 'Na', 'K'], 2: ['', 'Be', 'Mg', 'Ca'], 13: ['', 'B', 'Al', ''], 14: ['', 'C', 'Si', ''], 15: ['', 'N', 'P', ''], 16: ['', 'O', 'S', ''], 17: ['', 'F', 'Cl', ''], 18: ['He', 'Ne', 'Ar', 'Kr'] };
    const WRONG = { 2: '2족은 물과 반응하지만 1족보다 덜 격렬하다', 17: '17족(할로젠)은 비금속이라 전기가 통하지 않는다', 18: '18족은 다른 원소와 거의 반응하지 않는다' };
    def('mystery9', {
      init(st, api) { st.done = {}; st.drag = null; st.anim = {}; st.placed = false; st.x = { x: JAR.x, y: JAR.y - 120 }; st.shine = 0; api.say('기름병에서 <b>X 조각</b>을 끌어 시험대 세 곳에 차례로 놓아 단서를 모으자.'); },
      draw(c, st, api) {
        const t = st.t, W = 1060, H = 700;
        D.lab(c, W, H, 520, { depth: 34 });
        // 수사 노트(왼쪽 위)
        c.save(); c.translate(40, 40); c.fillStyle = '#7a5434'; D.rr(c, 0, 0, 300, 250, 10); c.fill(); c.fillStyle = '#fffdf3'; c.fillRect(12, 26, 276, 214); c.fillStyle = '#c9ced5'; D.rr(c, 110, -6, 80, 26, 6); c.fill();
        D.txt(c, '수사 노트 · 원소 X', 150, 54, '#b0412e', '800 17px');
        for (let i = 0; i < 6; i++) D.line(c, 24, 80 + i * 26, 276, 80 + i * 26, 'rgba(80,140,200,.25)', 1);
        let ly = 76; ST.forEach((s) => { if (st.done[s.k]) { D.txt(c, `✓ ${s.clue}`, 24, ly, '#1d2433', '600 14px', 'left'); ly += 26; } });
        if (!Object.keys(st.done).length) D.txt(c, '단서를 모으면 여기에 적힌다', 150, 120, '#9aa3b2', '600 14px');
        if (st.placed) { D.txt(c, 'X의 정체: 루비듐(Rb)', 150, 200, '#1f5f4a', '800 18px'); D.txt(c, '5주기 1족 · 원자가 전자 1개', 150, 224, '#1f5f4a', '700 14px'); }
        c.restore();
        // 주기율표 세로줄(오른쪽 위)
        D.card(c, TB.x - 52, TB.y - 40, COLS.length * TB.cw + 66, 5 * TB.ch + 74, { bg: '#fbfcf9', title: '어느 세로줄(족)에 붙일까?' });
        COLS.forEach((g, i) => { const x = TB.x + i * TB.cw; const hot = st.drag && st.drag.x > x && st.drag.x < x + TB.cw && st.drag.y > TB.y && st.drag.y < TB.y + 4 * TB.ch + 40 && Object.keys(st.done).length === 3;
          if (hot) { c.fillStyle = 'rgba(255,226,122,.6)'; c.fillRect(x, TB.y - 2, TB.cw, 4 * TB.ch + 44); }
          D.txt(c, `${g}족`, x + TB.cw / 2, TB.y + 12, '#4a5366', '700 12px');
          KNOWN[g].forEach((s, r) => { const y = TB.y + 18 + r * TB.ch; c.fillStyle = s ? (g === 1 && r > 0 ? '#dbe8fb' : '#f0f2f5') : 'rgba(0,0,0,0)'; c.fillRect(x + 2, y, TB.cw - 4, TB.ch - 4); if (s) { c.strokeStyle = 'rgba(29,36,51,.3)'; c.strokeRect(x + 2.5, y + .5, TB.cw - 5, TB.ch - 5); D.txt(c, s, x + TB.cw / 2, y + 25, '#1d2433', '700 15px'); } });
          if (g === 1) { const y = TB.y + 18 + 4 * TB.ch; c.strokeStyle = st.placed ? '#1f5f4a' : 'rgba(29,36,51,.35)'; c.setLineDash(st.placed ? [] : [4, 3]); c.strokeRect(x + 2.5, y + .5, TB.cw - 5, TB.ch - 5); c.setLineDash([]); if (st.placed) { c.fillStyle = '#ffe27a'; c.fillRect(x + 3, y + 1, TB.cw - 6, TB.ch - 6); D.txt(c, 'Rb', x + TB.cw / 2, y + 25, '#1d2433', '800 15px'); } }
        });
        D.txt(c, '5주기', TB.x - 4, TB.y + 18 + 4 * TB.ch + 24, '#4a5366', '600 11px', 'right');
        // 기름병(X 조각들)
        const j = JAR; D.shadow(c, j.x, j.y + 72, 70, 12);
        c.fillStyle = D.lin(c, 0, j.y - 60, 0, j.y + 70, ['rgba(240,200,110,.55)', 'rgba(200,150,60,.75)']); D.rr(c, j.x - 55, j.y - 40, 110, 108, 14); c.fill();
        for (let k = 0; k < 4; k++) { const cx = j.x - 30 + k * 20, cy = j.y + 40 + (k % 2) * 8; c.fillStyle = D.lin(c, cx - 10, cy - 8, cx + 10, cy + 8, ['#f2f4f6', '#9aa1ab', '#c5cad2']); D.rr(c, cx - 10, cy - 8, 22, 15, 5); c.fill(); }
        c.strokeStyle = 'rgba(120,90,40,.8)'; c.lineWidth = 3; D.rr(c, j.x - 55, j.y - 40, 110, 108, 14); c.stroke();
        c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(j.x - 46, j.y - 30, 6, 80);
        c.fillStyle = D.lin(c, 0, j.y - 62, 0, j.y - 40, ['#5b6a95', '#38446a']); D.rr(c, j.x - 46, j.y - 62, 92, 24, 5); c.fill();
        D.tag(c, '원소 X (기름 속 보관)', j.x, j.y + 98, { f: '700 13px' });
        // 시험대
        ST.forEach((s) => this.station(c, s, st, t));
        // X 조각(끌기)
        const xp = st.drag || st.x; if (!st.placed) { D.glow(c, xp.x, xp.y, 30, 'rgba(255,255,255,.35)'); c.fillStyle = D.lin(c, xp.x - 18, xp.y - 12, xp.x + 18, xp.y + 12, ['#f6f7f9', '#a4abb5', '#d7dbe1']); D.rr(c, xp.x - 18, xp.y - 12, 36, 24, 7); c.fill(); c.strokeStyle = '#5b626d'; c.lineWidth = 1.5; c.stroke(); D.txt(c, 'X', xp.x, xp.y + 6, '#1d2433', '800 16px'); }
        // 원자 모형(단서 셋 뒤)
        if (Object.keys(st.done).length === 3) {
          D.card(c, 360, 40, 210, 250, { bg: 'rgba(20,28,58,.92)', line: '#6f86c4', title: 'X의 원자 모형', tcol: '#cfe0ff' });
          const cx = 465, cy = 170; for (let i = 0; i < 4; i++) { c.strokeStyle = 'rgba(160,190,255,.25)'; c.lineWidth = 1.5; c.beginPath(); c.arc(cx, cy, 20 + i * 12.5, 0, TAU); c.stroke(); }
          c.fillStyle = 'rgba(80,120,190,.35)'; c.beginPath(); c.arc(cx, cy, 64, 0, TAU); c.fill();
          D.ball(c, cx, cy, 14, '#e2553f', '#8f2414', '#ffd6c8'); D.txt(c, '37+', cx, cy + 5, '#fff', '800 11px');
          c.strokeStyle = 'rgba(170,200,255,.8)'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, 76, 0, TAU); c.stroke();   // 바깥 궤도를 줄여 아래 글자와 안 겹치게
          if (st.placed) { const a = t * 0.6, ex = cx + Math.cos(a) * 76, ey = cy + Math.sin(a) * 76; c.strokeStyle = '#ffd84d'; c.lineWidth = 3; c.beginPath(); c.arc(ex, ey, 12, 0, TAU); c.stroke(); D.ball(c, ex, ey, 8, '#4aa0f0', '#174a8a', '#e0f0ff'); }
          D.txt(c, st.placed ? '바깥 껍질 전자 1개(노란 테)' : '바깥 껍질 전자는 몇 개?', cx, 281, '#ffd84d', '700 13px');
        }
      },
      station(c, s, st, t) {
        const on = st.done[s.k], a = st.anim[s.k] || 0; const x = s.x, y = s.y;
        if (st.drag && Math.hypot(st.drag.x - x, st.drag.y - y) < 90 && !on) { c.strokeStyle = 'rgba(242,183,5,.9)'; c.lineWidth = 4; c.setLineDash([8, 6]); c.beginPath(); c.arc(x, y - 10, 90, 0, TAU); c.stroke(); c.setLineDash([]); }
        if (s.k === 'cut') {
          D.shadow(c, x, y + 50, 90, 12); c.fillStyle = D.lin(c, 0, y + 20, 0, y + 50, ['#f4f6f8', '#c9ced5']); c.beginPath(); c.ellipse(x, y + 36, 90, 18, 0, 0, TAU); c.fill(); c.strokeStyle = '#8a929d'; c.lineWidth = 2; c.stroke();
          c.save(); c.translate(x + 50, y - 40); c.rotate(0.5 - (on ? 0 : 0.2) - Math.max(0, Math.sin(a * Math.PI)) * 0.5); c.fillStyle = '#3b2a1c'; D.rr(c, -70, -8, 50, 16, 5); c.fill(); c.fillStyle = D.lin(c, 0, -10, 0, 10, ['#f6f7f9', '#9aa1ab']); c.beginPath(); c.moveTo(-20, -8); c.lineTo(50, -6); c.lineTo(58, 4); c.lineTo(-20, 8); c.closePath(); c.fill(); c.restore();
          if (on) { const dull = clamp((t - on) / 4, 0, 1); [[-24, 0], [16, 4]].forEach(([dx, dy], i) => { const cx = x + dx, cy = y + 26 + dy; c.fillStyle = D.lin(c, cx - 16, 0, cx + 16, 0, ['#8e959e', '#b5bac2']); D.rr(c, cx - 16, cy - 9, 32, 18, 5); c.fill(); c.fillStyle = `rgba(${lerp(250, 175, dull)},${lerp(252, 178, dull)},${lerp(255, 182, dull)},1)`; c.fillRect(i ? cx - 16 : cx + 10, cy - 8, 6, 16); });
            D.tag(c, dull < 0.8 ? '단면이 반짝인다' : '단면이 흐려졌다', x, y - 30, { f: '700 13px', bg: 'rgba(29,36,51,.85)', col: '#ffe9a0' }); }
        } else if (s.k === 'water') {
          D.shadow(c, x, y + 52, 100, 12);
          const pink = on ? clamp((t - on) / 3, 0, 1) : 0;
          c.fillStyle = D.lin(c, 0, y - 20, 0, y + 50, [`rgba(${lerp(190, 245, pink)},${lerp(225, 150, pink)},${lerp(245, 195, pink)},.75)`, `rgba(${lerp(150, 230, pink)},${lerp(200, 90, pink)},${lerp(235, 150, pink)},.85)`]); D.rr(c, x - 92, y - 18, 184, 66, [2, 2, 10, 10]); c.fill();
          c.strokeStyle = 'rgba(70,95,115,.8)'; c.lineWidth = 2.5; D.rr(c, x - 96, y - 40, 192, 90, [3, 3, 12, 12]); c.stroke(); c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(x - 88, y - 34, 5, 70);
          if (on) { const k = t - on, sink = clamp(k / 0.6, 0, 1), px = x + Math.sin(k * 9) * 6, py = lerp(y - 18, y + 38, ease(sink)), fl = 0.6 + 0.4 * Math.sin(k * 30);
            D.glow(c, px, py, 40 * fl, 'rgba(255,170,220,.55)'); D.glow(c, px, py, 16, 'rgba(255,255,255,.9)');
            c.fillStyle = '#d7dbe1'; D.rr(c, px - 8, py - 5, 16, 9, 4); c.fill();
            for (let b = 0; b < 18; b++) { const bk = (k * 2.4 + b / 18) % 1, bx = px - 26 + hash(b) * 52 + Math.sin(k * 6 + b) * 4, by = py - bk * (py - (y - 18)); c.strokeStyle = `rgba(255,255,255,${0.9 * (1 - bk)})`; c.lineWidth = 1.6; c.beginPath(); c.arc(bx, by, 2 + bk * 4, 0, TAU); c.stroke(); }
            for (let b = 0; b < 6; b++) { const bk = (k * 1.8 + b / 6) % 1, sx2 = x - 40 + b * 16, sy2 = y - 20 - Math.sin(bk * Math.PI) * 34; c.fillStyle = `rgba(220,235,250,${0.8 * (1 - bk)})`; c.beginPath(); c.arc(sx2, sy2, 3, 0, TAU); c.fill(); }
            D.tag(c, '가라앉으며 폭발하듯 반응 · 붉게 변함', x, y - 58, { f: '700 13px', bg: 'rgba(29,36,51,.85)', col: '#ffe9a0' }); }
          D.txt(c, '페놀프탈레인을 넣은 물', x, y + 68, '#1d2433', '600 12px');
        } else {
          const lit = on ? 0.85 + 0.15 * Math.sin(t * 8) : 0;
          D.shadow(c, x, y + 50, 80, 11); c.fillStyle = D.lin(c, 0, y, 0, y + 46, ['#4b5466', '#2b3242']); D.rr(c, x - 70, y + 4, 140, 42, 8); c.fill();
          c.fillStyle = '#f2b705'; c.fillRect(x - 54, y + 14, 50, 22); D.txt(c, '전지', x - 29, y + 30, '#1d2433', '800 12px');
          if (lit) D.glow(c, x + 30, y - 50, 60, `rgba(255,220,100,${0.6 * lit})`);
          c.fillStyle = lit ? '#fff3b0' : 'rgba(220,230,240,.6)'; c.beginPath(); c.arc(x + 30, y - 50, 22, 0, TAU); c.fill(); c.strokeStyle = 'rgba(70,95,115,.8)'; c.lineWidth = 2; c.stroke();
          c.strokeStyle = lit ? '#ff9a2a' : '#6c727c'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 22, y - 40); for (let k = 0; k < 6; k++) c.lineTo(x + 24 + k * 3, y - 54 + (k % 2) * 6); c.lineTo(x + 38, y - 40); c.stroke();
          c.fillStyle = '#9aa1ab'; c.fillRect(x + 22, y - 30, 16, 14);
          D.wire(c, [[x + 30, y - 16], [x + 30, y + 4]], '#2b3242', 4); D.wire(c, [[x - 60, y + 10], [x - 90, y - 10], [x - 70, y - 30]], '#c0392b', 4); D.wire(c, [[x + 70, y + 10], [x + 96, y - 10], [x + 80, y - 30]], '#2b3242', 4);
          D.line(c, x - 70, y - 30, x - 64, y - 52, '#9aa1ab', 4); D.line(c, x + 80, y - 30, x + 74, y - 52, '#9aa1ab', 4);
          if (on) { c.fillStyle = '#d7dbe1'; D.rr(c, x - 64, y - 60, 140, 12, 4); c.fill(); }
        }
        D.txt(c, s.name, x, y + 96, on ? '#1f5f4a' : '#1d2433', '800 16px'); if (on) D.txt(c, '✓ 단서', x, y + 116, '#1f5f4a', '700 13px');
      },
      hint(st) { const s = ST.find((q) => !st.done[q.k]); if (!s) return { x: st.x.x, y: st.x.y, dx: TB.x + 26 - st.x.x, dy: TB.y + 200 - st.x.y, dist: Math.hypot(TB.x + 26 - st.x.x, TB.y + 200 - st.x.y), label: 'X를 알맞은 세로줄에 붙이기' }; return { x: st.x.x, y: st.x.y, dx: s.x - st.x.x, dy: s.y - st.x.y, dist: Math.hypot(s.x - st.x.x, s.y - st.x.y) - 30, label: 'X 조각을 시험대에 놓기' }; },
      down(p, st) { if (!st.placed && Math.hypot(p.x - st.x.x, p.y - st.x.y) < 40) st.drag = { x: p.x, y: p.y }; },
      move(p, st) { if (st.drag) { st.drag.x = p.x; st.drag.y = p.y; } },
      up(p, st, api) {
        if (!st.drag) return; st.drag = null;
        const s = ST.find((q) => Math.hypot(p.x - q.x, p.y - q.y) < 95); if (s) { this.test1(s, st, api); return; }
        const i = Math.floor((p.x - TB.x) / TB.cw); if (p.y > TB.y - 20 && p.y < TB.y + 4 * TB.ch + 60 && i >= 0 && i < COLS.length) this.put(COLS[i], st, api);
      },
      test1(s, st, api) {
        if (!st.done[s.k]) { st.done[s.k] = st.t; st.anim[s.k] = 0; api.spark(s.x, s.y - 20, '#ffe9a0', 14); api.row(ST.indexOf(s), [s.obs, s.like]); }
        const n = Object.keys(st.done).length; if (n === 3) api.ok(2);
        api.say(n < 3 ? `<b>${s.name}</b>: ${s.obs}. 단서 ${n}/3 — 다른 시험대에도 놓아 보자.` : '단서 셋이 모였다. 오른쪽 위 주기율표에서 X가 들어갈 <b>세로줄(족)</b>에 X 조각을 붙이자.');
      },
      put(g, st, api) {
        if (Object.keys(st.done).length < 3) { api.say('먼저 시험대 세 곳에서 단서를 모두 모으자.'); return; }
        if (g !== 1) { api.jolt(); api.say(`${g}족은 아니다. ${WRONG[g] || '나트륨·칼륨과 같은 방식으로 물과 반응했다는 단서를 떠올리자'}.`); return; }
        st.placed = true; api.ok(3); api.spark(TB.x + 26, TB.y + 200, '#ffd84d', 22); api.ring(465, 170, 'rgba(255,216,77,.9)', 90);
        const hit = api.judge('1', '같은 족 원소는 원자가 전자 수가 같다 — 1족은 1개.');
        api.say(`X는 <b>1족</b> — 나트륨·칼륨처럼 원자가 전자가 <b>1개</b>다. 정체는 루비듐(Rb, 원자 번호 37). ${hit ? '' : ''}`);
      },
      key(k, st, api) { if (/^[1-3]$/.test(k)) { this.test1(ST[+k - 1], st, api); return true; } if (k === 'Enter') { this.put(1, st, api); return true; } return false; },
      test(st, api, step = 3) { ST.slice(0, step).forEach((s) => this.test1(s, st, api)); if (step > 3) this.put(1, st, api); },
    });
  }

  // ───────────────────────── cycle9 되풀이 간격 재기 ─────────────────────────
  {
    const X0 = 150, X1 = 1000, VAL = [0, 1, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2, 3, 4, 5, 6, 7, 0, 1, 2];
    const SYM = ['', 'H', 'He', 'Li', 'Be', 'B', 'C', 'N', 'O', 'F', 'Ne', 'Na', 'Mg', 'Al', 'Si', 'P', 'S', 'Cl', 'Ar', 'K', 'Ca'];
    const STRIP = [
      { k: 'moon', name: '달의 모양', y: 40, h: 170, max: 60, unit: '일', per: 29.5, start: 0, tol: 1.6, ticks: [0, 10, 20, 30, 40, 50, 60], lab: '약 29.5일', why: '달이 지구 둘레를 돌며 햇빛 받는 쪽이 달리 보인다' },
      { k: 'tide', name: '바닷물 높이(밀물·썰물)', y: 240, h: 170, max: 48, unit: '시간', per: 12.42, start: 3, tol: 0.7, ticks: [0, 12, 24, 36, 48], lab: '약 12시간 25분', why: '달이 끌어당기는 힘과 지구의 자전' },
      { k: 'val', name: '원자가 전자 수', y: 440, h: 230, max: 21, min: 0, unit: '번', per: 8, start: 3, tol: 0.45, ticks: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19], lab: '원자 번호 8칸', why: '바깥 껍질이 차면 새 껍질이 시작된다' },
    ];
    const sx = (s, v) => X0 + (v - (s.min || 0)) / (s.max - (s.min || 0)) * (X1 - X0);
    const vx = (s, x) => (s.min || 0) + (x - X0) / (X1 - X0) * (s.max - (s.min || 0));
    const tideF = (h) => Math.cos((h - 3) / 12.42 * TAU);
    function moonIcon(c, x, y, r, ph) { // ph: 한 바퀴 중 위치(0 = 보름, 0.5 = 삭)
      const lit = '#f6edc4', dark = '#2a3354', k = Math.cos(ph * TAU), side = (ph % 1) < 0.5 ? -1 : 1;
      D.glow(c, x, y, r * 1.6, `rgba(255,245,200,${0.18 * (k + 1) / 2})`);
      c.fillStyle = dark; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
      c.fillStyle = lit; c.beginPath(); c.arc(x, y, r, -Math.PI / 2, Math.PI / 2, side < 0); c.fill();
      c.fillStyle = k > 0 ? lit : dark; c.beginPath(); c.ellipse(x, y, Math.abs(k) * r + 0.3, r, 0, 0, TAU); c.fill();
      c.fillStyle = 'rgba(160,150,110,.35)'; [[-0.3, -0.2, 0.18], [0.25, 0.3, 0.14], [0.1, -0.45, 0.1]].forEach(([dx, dy, rr]) => { c.beginPath(); c.arc(x + dx * r, y + dy * r, rr * r, 0, TAU); c.fill(); });
      c.strokeStyle = 'rgba(255,248,216,.35)'; c.lineWidth = 1; c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke();
    }
    def('cycle9', {
      bg: '#e9ede8',
      init(st, api) { st.w = STRIP.map((s) => s.per * 0.62); st.got = STRIP.map(() => false); st.drag = -1; api.say('띠마다 <b>빨간 손잡이</b>를 끌어 무늬가 처음과 똑같이 돌아오는 곳에 맞춰 보자. 반투명 겹친 무늬가 딱 맞으면 성공.'); },
      draw(c, st, api) {
        const t = st.t;
        STRIP.forEach((s, i) => {
          const y = s.y, h = s.h, w = st.w[i], a = sx(s, s.start), b = sx(s, s.start + w), ok = st.got[i];
          // 띠 바탕
          if (s.k === 'moon') { c.fillStyle = D.lin(c, 0, y, 0, y + h, ['#141c3a', '#26315e']); D.rr(c, 20, y, 1020, h, 12); c.fill(); for (let j = 0; j < 60; j++) { c.fillStyle = `rgba(230,236,255,${0.2 + 0.4 * (0.5 + 0.5 * Math.sin(t * 2 + j))})`; c.fillRect(30 + hash(j, i) * 1000, y + 8 + hash(j, 7) * (h - 16), 1.5, 1.5); } }
          else if (s.k === 'tide') { c.fillStyle = D.lin(c, 0, y, 0, y + h, ['#cfe9f7', '#9ccbe6']); D.rr(c, 20, y, 1020, h, 12); c.fill(); }
          else { c.fillStyle = '#ffffff'; D.rr(c, 20, y, 1020, h, 12); c.fill(); }
          c.strokeStyle = 'rgba(29,36,51,.6)'; c.lineWidth = 2; D.rr(c, 20, y, 1020, h, 12); c.stroke();
          D.txt(c, s.name, 34, y + 24, s.k === 'moon' ? '#e8edf5' : '#1d2433', '800 16px', 'left');
          const draw1 = (off, alpha) => {
            c.save(); c.globalAlpha = alpha;
            if (s.k === 'moon') { for (let d = 0; d <= 60; d += 3.6875) { const x = sx(s, d) + off; if (x < X0 - 5 || x > X1 + 5) continue; moonIcon(c, x, y + 92, 20, d / 29.5); } }
            else if (s.k === 'tide') { c.strokeStyle = '#1f6fb0'; c.lineWidth = 3; c.beginPath(); for (let hh = 0; hh <= 48; hh += 0.25) { const x = sx(s, hh) + off; if (x < X0 || x > X1) continue; const yy = y + 100 - tideF(hh) * 42; c.lineTo(x, yy); } c.stroke(); }
            else { for (let z = 1; z <= 20; z++) { const x = sx(s, z) + off; if (x < X0 - 10 || x > X1 + 10) continue; const v = VAL[z], bh = v * 20; c.fillStyle = D.lin(c, 0, y + 190 - bh, 0, y + 190, [v === 1 ? '#7cc0ff' : '#a9c3e8', v === 1 ? '#2f74c8' : '#6d8fc0']); c.fillRect(x - 12, y + 190 - bh, 24, bh); if (v === 0) { c.fillStyle = '#c9ced5'; c.fillRect(x - 12, y + 186, 24, 4); } } }
            c.restore();
          };
          draw1(0, 1);
          // 축 눈금
          const tc = s.k === 'moon' ? '#cfd7ef' : '#1d2433';
          s.ticks.forEach((v) => { const x = sx(s, v); D.line(c, x, y + h - 22, x, y + h - 16, tc, 1.5); D.txt(c, s.k === 'val' ? `${v}` : `${v}`, x, y + h - 4, tc, '600 12px'); });
          D.txt(c, s.k === 'val' ? '원자 번호' : s.unit, X1 + 30, y + h - 4, tc, '700 12px');
          if (s.k === 'val') { for (let z = 1; z <= 20; z++) D.txt(c, SYM[z], sx(s, z), y + 206, '#4a5366', '600 11px'); [0, 1, 4, 7].forEach((v) => D.txt(c, `${v}`, X0 - 22, y + 190 - v * 20 + 4, '#4a5366', '600 11px', 'right')); D.txt(c, '(개)', X0 - 22, y + 44, '#4a5366', '600 11px', 'right'); }
          if (s.k === 'tide') { D.txt(c, '높음', X0 - 30, y + 62, '#1d2433', '600 11px'); D.txt(c, '낮음', X0 - 30, y + 146, '#1d2433', '600 11px'); const bx = sx(s, (t * 2) % 48), by = y + 100 - tideF((t * 2) % 48) * 42; c.fillStyle = '#c0392b'; c.beginPath(); c.moveTo(bx - 14, by - 4); c.lineTo(bx + 14, by - 4); c.lineTo(bx + 9, by + 5); c.lineTo(bx - 9, by + 5); c.closePath(); c.fill(); D.line(c, bx, by - 4, bx, by - 22, '#3b2a1c', 2); c.fillStyle = '#fbfcf9'; c.beginPath(); c.moveTo(bx, by - 22); c.lineTo(bx + 11, by - 8); c.lineTo(bx, by - 8); c.fill(); }
          // 겹친 무늬(옮긴 만큼): 맞으면 겹친다
          c.save(); c.beginPath(); c.rect(b - 2, y, X1 - b + 14, h); c.clip(); draw1(b - a, 0.38); c.restore();
          // 집게(간격 자)
          const cy = y + 40, col = ok ? '#1f8a4c' : '#c0392b';
          c.fillStyle = ok ? 'rgba(31,138,76,.12)' : 'rgba(192,57,43,.08)'; c.fillRect(a, y + 32, b - a, h - 60);
          D.line(c, a, y + 30, a, y + h - 26, col, 3); D.line(c, b, y + 30, b, y + h - 26, col, 3); D.arrow(c, a + 6, cy, b - 4, cy, col, 2.5, 10); D.arrow(c, b - 6, cy, a + 4, cy, col, 2.5, 10);
          const val = s.k === 'tide' ? `${Math.floor(w)}시간 ${Math.round((w % 1) * 60)}분` : s.k === 'val' ? `${w.toFixed(1)}칸` : `${w.toFixed(1)}일`;
          D.tag(c, `간격 ${val}`, (a + b) / 2, cy - 2, { f: '800 14px', bg: ok ? '#e2f4e8' : '#fff', line: col, col });
          c.fillStyle = col; c.beginPath(); c.arc(b, cy, 14, 0, TAU); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke(); D.line(c, b - 4, cy - 6, b - 4, cy + 6, '#fff', 2); D.line(c, b + 4, cy - 6, b + 4, cy + 6, '#fff', 2);
          if (ok) D.tag(c, `되풀이 간격 찾음: ${s.lab}`, X1 - 120, y + 24, { f: '800 14px', bg: '#1f8a4c', col: '#fff' });
        });
      },
      hint(st) { const i = st.got.findIndex((g) => !g); if (i < 0) return null; const s = STRIP[i]; const b = sx(s, s.start + st.w[i]); return { x: b, y: s.y + 40, dx: 1, dy: 0, dist: sx(s, s.start + s.per) - b, label: '빨간 손잡이를 끌어 간격 맞추기' }; },
      down(p, st) { STRIP.forEach((s, i) => { const b = sx(s, s.start + st.w[i]); if (p.y > s.y && p.y < s.y + s.h && Math.abs(p.x - b) < 40) st.drag = i; }); },
      move(p, st, api) { if (st.drag < 0) return; const s = STRIP[st.drag]; st.w[st.drag] = clamp(vx(s, p.x) - s.start, s.per * 0.2, s.max - s.start); if (s.k === 'val') st.w[st.drag] = clamp(vx(s, p.x) - s.start, 1, 17); },
      up(p, st, api) { if (st.drag < 0) return; const i = st.drag; st.drag = -1; if (STRIP[i].k === 'val') st.w[i] = Math.round(st.w[i]); this.check(i, st, api); },
      check(i, st, api) {
        const s = STRIP[i], w = st.w[i];
        if (Math.abs(w - s.per) <= s.tol) {
          if (s.k === 'val') st.w[i] = 8; if (!st.got[i]) { st.got[i] = true; api.row(i, [s.lab, s.why]); api.spark(sx(s, s.start + s.per), s.y + 60, '#7fd39a', 18); }
          if (st.got[0] && st.got[1]) api.ok(2);
          if (s.k === 'val') { api.ok(3); api.judge('8', '3번 리튬에서 8칸 뒤 11번 나트륨, 또 8칸 뒤 19번 칼륨 — 모두 원자가 전자 1개.'); }
          api.say(s.k === 'val' ? '리튬(3) → 나트륨(11) → 칼륨(19): 원자 번호 <b>8칸</b>마다 원자가 전자 수가 되풀이된다. 그래서 성질도 되풀이된다.' : `<b>${s.name}</b>은 <b>${s.lab}</b>마다 되풀이된다. ${s.why}.`);
        } else if (s.k === 'val' && Math.abs(w - 16) < 0.5) api.say('16칸도 겹치지만 두 번 되풀이한 간격이다. <b>가장 짧은</b> 되풀이 간격을 찾자.');
        else if (s.k === 'val' && Math.abs(w - 2) < 0.5) api.say('1번 수소와 3번 리튬 사이는 2칸이지만, 3번부터는 겹치지 않는다. 더 끌어 보자.');
        else api.say(`아직 겹친 무늬가 어긋난다(${w < s.per ? '더 늘려' : '더 줄여'} 보자).`);
      },
      key(k, st, api) { if (/^[1-3]$/.test(k)) { const i = +k - 1; st.w[i] = STRIP[i].per; this.check(i, st, api); return true; } return false; },
      test(st, api, n = 3) { for (let i = 0; i < n; i++) { st.w[i] = STRIP[i].per; this.check(i, st, api); } },
    });
  }
  // ───────────────────────── lens10 돋보기로 본 공기·바다·모래 ─────────────────────────
  {
    const R = 112;
    const regionOf = (x, y) => (y < 330 ? 'air' : x < 560 + (y - 330) * 0.55 ? 'sea' : 'sand');
    const RN = { air: '하늘(공기)', sea: '바다(바닷물)', sand: '모래(석영)' }, RI = { air: 0, sea: 1, sand: 2 };
    const ROWS = { air: ['질소 N₂ · 산소 O₂ · 아르곤 Ar', '질소·산소는 원자 둘씩 결합, 아르곤만 혼자'], sea: ['물 H₂O · 나트륨 이온 · 염화 이온', '모두 결합한 상태(물 분자·이온)'], sand: ['규소 Si · 산소 O(1 : 2)', '규소 하나가 산소 넷과 이어진 그물'] };
    function seed(st) {
      const P = []; const add = (type, n) => { for (let i = 0; i < n; i++) { const a = Math.random() * TAU, d = Math.random() * (R - 26); P.push({ type, x: Math.cos(a) * d, y: Math.sin(a) * d, vx: (Math.random() - 0.5) * 120, vy: (Math.random() - 0.5) * 120, rot: Math.random() * TAU, vr: (Math.random() - 0.5) * 3 }); } };
      add('N2', 15); add('O2', 4); add('Ar', 1); st.air = P;
      const S = []; for (let i = 0; i < 15; i++) { const a = Math.random() * TAU, d = Math.random() * (R - 20); S.push({ type: 'W', x: Math.cos(a) * d, y: Math.sin(a) * d, rot: Math.random() * TAU }); }
      [[-40, -20, 'Na'], [36, 34, 'Cl'], [10, -58, 'Cl'], [-30, 52, 'Na']].forEach(([x, y, t]) => S.push({ type: t, x, y, rot: 0 })); st.sea = S;
    }
    def('lens10', {
      init(st, api) { st.L = { x: 840, y: 180 }; st.drag = null; st.seen = new Set(); st.found = false; st.foundT = 0; seed(st); api.say('<b>돋보기</b>를 끌어 하늘·바다·모래를 차례로 들여다보자. 돋보기 속에서는 입자가 크게 보인다.'); },
      draw(c, st, api) {
        const t = st.t, W = 1060, H = 700;
        // 풍경: 하늘 · 해 · 구름 · 바다 · 모래사장 · 바위
        c.fillStyle = D.lin(c, 0, 0, 0, 330, ['#7cc0ea', '#cfe9f7']); c.fillRect(0, 0, W, 330);
        D.glow(c, 170, 100, 140, 'rgba(255,240,180,.75)'); D.ball(c, 170, 100, 40, '#fff2a8', '#f6c64a', '#fffbe6');
        c.fillStyle = 'rgba(255,255,255,.92)'; for (let k = 0; k < 4; k++) { const cx = ((k * 300 + t * 10) % 1300) - 120, cy = 60 + (k % 2) * 70; c.beginPath(); c.ellipse(cx, cy, 60, 18, 0, 0, TAU); c.ellipse(cx + 34, cy - 12, 36, 18, 0, 0, TAU); c.ellipse(cx - 30, cy - 6, 30, 14, 0, 0, TAU); c.fill(); }
        for (let k = 0; k < 3; k++) { const gx = ((k * 220 + t * 30) % 1200) - 60, gy = 170 + k * 30 + Math.sin(t * 2 + k) * 6; c.strokeStyle = '#3b4254'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(gx - 10, gy); c.quadraticCurveTo(gx - 5, gy - 6 - 3 * Math.sin(t * 8 + k), gx, gy); c.quadraticCurveTo(gx + 5, gy - 6 - 3 * Math.sin(t * 8 + k), gx + 10, gy); c.stroke(); }
        c.fillStyle = D.lin(c, 0, 330, 0, H, ['#3b8fc4', '#1f5f8f']); c.beginPath(); c.moveTo(0, 330); c.lineTo(W, 330); c.lineTo(W, H); c.lineTo(0, H); c.fill();
        c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2; for (let r = 0; r < 9; r++) { const yy = 345 + r * 38; c.beginPath(); for (let x = 0; x < 760; x += 10) c.lineTo(x, yy + Math.sin(x * 0.03 + t * 1.5 + r) * 3); c.stroke(); }
        c.fillStyle = D.lin(c, 560, 330, 1060, 700, ['#f3e3c0', '#e2c992']); c.beginPath(); c.moveTo(560, 330); c.lineTo(W, 330); c.lineTo(W, H); c.lineTo(560 + 370 * 0.55, H); c.quadraticCurveTo(650, 520, 560, 330); c.fill();
        c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 4; c.beginPath(); for (let k = 0; k <= 30; k++) { const y = 330 + k * 12.3, x = 560 + (y - 330) * 0.55 - 6 + Math.sin(t * 2 + k * 0.6) * 4; c.lineTo(x, y); } c.stroke();
        for (let k = 0; k < 140; k++) { const x = 620 + hash(k) * 440, y = 340 + hash(k, 3) * 360; if (x < 560 + (y - 330) * 0.55 + 10) continue; c.fillStyle = `rgba(150,110,60,${0.25 + hash(k, 5) * 0.3})`; c.fillRect(x, y, 2, 2); }
        c.fillStyle = D.lin(c, 880, 240, 1060, 520, ['#9a8f84', '#6d645b']); c.beginPath(); c.moveTo(860, 520); c.lineTo(890, 360); c.lineTo(940, 290); c.lineTo(1010, 250); c.lineTo(1060, 260); c.lineTo(1060, 540); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(50,40,30,.3)'; c.lineWidth = 2; [[900, 380, 960, 330], [930, 440, 1010, 400], [960, 300, 1040, 290]].forEach(([a, b, x2, y2]) => { c.beginPath(); c.moveTo(a, b); c.lineTo(x2, y2); c.stroke(); });
        D.tag(c, '하늘(공기)', 470, 40, { f: '700 15px' }); D.tag(c, '바다', 300, 640, { f: '700 15px' }); D.tag(c, '모래사장', 820, 640, { f: '700 15px' });
        // 돋보기 속
        const L = st.drag || st.L, reg = regionOf(L.x, L.y);
        c.save(); c.beginPath(); c.arc(L.x, L.y, R, 0, TAU); c.clip();
        c.fillStyle = reg === 'air' ? '#eef7fd' : reg === 'sea' ? '#cfe8f6' : '#f6ead0'; c.fillRect(L.x - R, L.y - R, 2 * R, 2 * R);
        const dt = st.dt;
        if (reg === 'air') st.air.forEach((p) => {
          p.x += p.vx * dt * (p.type === 'Ar' ? 0.55 : 1); p.y += p.vy * dt * (p.type === 'Ar' ? 0.55 : 1); p.rot += p.vr * dt;
          const d = Math.hypot(p.x, p.y); if (d > R - 18) { const nx = p.x / d, ny = p.y / d, dot = p.vx * nx + p.vy * ny; p.vx -= 2 * dot * nx; p.vy -= 2 * dot * ny; p.x = nx * (R - 18); p.y = ny * (R - 18); }
          const x = L.x + p.x, y = L.y + p.y, ox = Math.cos(p.rot) * 7, oy = Math.sin(p.rot) * 7;
          if (p.type === 'Ar') { if (st.found) D.glow(c, x, y, 28, 'rgba(255,216,77,.7)'); D.ball(c, x, y, 10, '#a77be0', '#4f2a8a', '#f0e4ff'); D.txt(c, 'Ar', x, y + 4, '#fff', '800 9px'); }
          else { const col = p.type === 'N2' ? ['#5d93e0', '#1f4f9a', '#e0ecff'] : ['#ef6a55', '#9a2414', '#ffe0d8']; D.ball(c, x - ox, y - oy, 8.5, ...col); D.ball(c, x + ox, y + oy, 8.5, ...col); }
        });
        else if (reg === 'sea') st.sea.forEach((p, i) => {
          const jx = Math.sin(t * 3 + i * 1.7) * 3, jy = Math.cos(t * 2.6 + i) * 3, x = L.x + p.x + jx, y = L.y + p.y + jy;
          if (p.type === 'W') { p.rot += dt * 0.6; const a = p.rot; [-0.91, 0.91].forEach((b) => D.ball(c, x + Math.cos(a + b) * 11, y + Math.sin(a + b) * 11, 5.5, '#ffffff', '#a9b3c2', '#ffffff')); D.ball(c, x, y, 8.5, '#ef6a55', '#9a2414', '#ffe0d8'); }
          else if (p.type === 'Na') { D.ball(c, x, y, 8, '#b48be8', '#5d3a9a', '#f3eaff'); D.txt(c, '+', x, y + 4, '#fff', '800 11px'); }
          else { D.ball(c, x, y, 12, '#7fcf6a', '#2f7a2a', '#e8ffe0'); D.txt(c, '−', x, y + 4, '#fff', '800 12px'); }
        });
        else {
          // 석영(SiO₂): 규소 하나가 산소 넷과, 산소 하나는 규소 둘과 이어진다 → 개수비 1 : 2 (입체 그물을 평면에 눌러 그림)
          const G = 50, rot = 0.32, ca = Math.cos(rot), sa = Math.sin(rot), P = (i, j) => { const x = i * G + (hash(i * 7 + j, 1) - 0.5) * 8, y = j * G + (hash(i * 7 + j, 2) - 0.5) * 8; return [L.x + x * ca - y * sa, L.y + x * sa + y * ca]; };
          const J = (i, k) => Math.sin(t * 5 + i * 1.3 + k) * 1.4;
          for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) {
            const [x, y] = P(i, j);
            [[1, 0], [0, 1]].forEach(([di, dj]) => { const [x2, y2] = P(i + di, j + dj), bend = ((i + j) % 2 ? 1 : -1) * 9, mx = (x + x2) / 2 - (y2 - y) / G * bend, my = (y + y2) / 2 + (x2 - x) / G * bend;
              D.line(c, x, y, mx, my, 'rgba(120,90,60,.55)', 3); D.line(c, mx, my, x2, y2, 'rgba(120,90,60,.55)', 3); D.ball(c, mx + J(i * 3 + di, j), my + J(j, i), 7, '#ef6a55', '#9a2414', '#ffe0d8'); });
          }
          for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) { const [x, y] = P(i, j); D.ball(c, x + J(i, j), y + J(j, i), 10.5, '#d9c9a8', '#7d6a4a', '#fffaf0'); }
        }
        c.restore();
        // 테 · 손잡이 · 이름표
        c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.arc(L.x, L.y, R, 0, TAU); c.fill();
        D.lensRim(c, L.x, L.y, R, 0.85);
        const leg = reg === 'air' ? '파랑 N₂ 질소 · 빨강 O₂ 산소 · 보라 Ar 아르곤' : reg === 'sea' ? '물 분자 H₂O · 보라 나트륨 이온 · 초록 염화 이온' : '규소(베이지) 하나에 산소(빨강) 넷 · 1 : 2 그물';
        const ty = L.y - R - 22 < 18 ? L.y + R + 26 : L.y - R - 22;
        D.tag(c, `${RN[reg]} · ${leg}`, clamp(L.x, 230, W - 230), ty, { f: '700 14px', bg: 'rgba(29,36,51,.86)', col: '#fff' });
        if (st.found) D.tag(c, '혼자 다니는 원자 = 아르곤(18족)', 530, 300, { f: '800 16px', bg: '#1f8a4c', col: '#fff' });
      },
      hint(st) { return { x: st.L.x - 30, y: st.L.y + 30, dx: -1, dy: 0.62, dist: 380, label: '돋보기를 끌어 바다 들여다보기' }; },
      // 렌즈 안·테·손잡이 어디를 눌러도 끌면 돋보기가 움직인다. 거의 움직이지 않고 뗀 짧은 누름만 입자 고르기로 본다.
      down(p, st) {
        const L = st.L, hx = L.x + Math.cos(0.85) * (R + 50), hy = L.y + Math.sin(0.85) * (R + 50);
        if (Math.hypot(p.x - L.x, p.y - L.y) > R + 22 && Math.hypot(p.x - hx, p.y - hy) > 60) return;
        st.drag = { x: L.x, y: L.y, ox: p.x - L.x, oy: p.y - L.y, px: p.x, py: p.y, moved: false, t0: st.t };
      },
      move(p, st, api) {
        const d = st.drag; if (!d) return;
        if (!d.moved && Math.hypot(p.x - d.px, p.y - d.py) > 7) d.moved = true;
        if (!d.moved) return;
        d.x = clamp(p.x - d.ox, 60, 1000); d.y = clamp(p.y - d.oy, 60, 640);   // 기록은 손을 뗀 자리에서만(up)
      },
      up(p, st, api) {
        const d = st.drag; if (!d) return; st.drag = null;
        if (d.moved) { st.L = { x: d.x, y: d.y }; this.look(regionOf(d.x, d.y), st, api); return; }
        const L = st.L; if (Math.hypot(p.x - L.x, p.y - L.y) > R) return;
        if (regionOf(L.x, L.y) !== 'air') { api.say(regionOf(L.x, L.y) === 'sea' ? '바닷물 속 입자는 모두 결합한 상태다. 혼자 다니는 원자는 <b>하늘(공기)</b>에서 찾아보자.' : '모래 속 규소와 산소는 그물처럼 이어져 있다. 혼자 다니는 원자는 <b>하늘(공기)</b>에서 찾아보자.'); return; }
        const hit = st.air.map((q) => ({ q, d: Math.hypot(L.x + q.x - p.x, L.y + q.y - p.y) })).sort((a, b) => a.d - b.d)[0];
        if (hit && hit.d < 24) this.tapAir(hit.q, st, api); else api.say('돋보기 속 <b>입자 하나</b>를 정확히 눌러 보자. 돋보기를 옮기려면 누른 채로 끌면 된다.');
      },
      look(reg, st, api) {
        if (!st.seen.has(reg)) { st.seen.add(reg); api.row(RI[reg], ROWS[reg]); }
        if (!(reg === 'air' && st.found)) api.say(reg === 'air' ? '공기: 파란 <b>질소 분자(N₂)</b>, 빨간 <b>산소 분자(O₂)</b>는 원자 둘이 붙어 다닌다. 혼자 다니는 입자도 있을까? 돋보기 속 입자를 눌러 보자.' : reg === 'sea' ? '바닷물: <b>물 분자</b>(산소 1 + 수소 2)와 <b>나트륨 이온·염화 이온</b>. 모두 결합한 상태다.' : '모래(석영): <b>규소</b> 하나가 <b>산소</b> 넷과, 산소 하나는 규소 둘과 이어져 끝없는 그물을 이룬다(개수비 1 : 2).');
        if (st.seen.size === 3) api.ok(2);
      },
      tapAir(q, st, api) {
        if (q.type === 'Ar') { st.found = true; api.ok(3); api.spark(st.L.x + q.x, st.L.y + q.y, '#ffd84d', 18); api.judge('Ar', '아르곤은 18족 — 바깥 껍질이 꽉 차 결합하지 않고 원자 하나로 다닌다.'); api.say('찾았다! <b>아르곤(Ar)</b>은 원자 하나로 다닌다. 18족은 가장 바깥 껍질이 꽉 차 있어 다른 원자와 결합하지 않는다.'); }
        else api.say(q.type === 'N2' ? '이건 <b>질소 분자</b> — 질소 원자 2개가 결합해 있다. 혼자가 아니다.' : '이건 <b>산소 분자</b> — 산소 원자 2개가 결합해 있다. 혼자가 아니다.');
      },
      key(k, st, api) { const to = { 1: [300, 180], 2: [300, 500], 3: [820, 560] }[k]; if (to) { st.L = { x: to[0], y: to[1] }; this.look(regionOf(...to), st, api); return true; } if (k === 'Enter') { const q = st.air.find((a) => a.type === 'Ar'); if (regionOf(st.L.x, st.L.y) === 'air') this.tapAir(q, st, api); return true; } return false; },
      test(st, api, step = 3) { [[300, 500], [820, 560], [380, 170]].slice(0, step).forEach(([x, y]) => { st.L = { x, y }; this.look(regionOf(x, y), st, api); }); if (step > 3) this.tapAir(st.air.find((a) => a.type === 'Ar'), st, api); },
    });
  }

  // ───────────────────────── bulb10 전구 속을 무엇으로 채울까 ─────────────────────────
  {
    const BL = [{ x: 296, y: 250 }, { x: 548, y: 250 }], GR = 84, TOP = 560;
    const CAN = { air: { x: 80, name: '공기', col: ['#c9d6e6', '#7f97b8'], band: '#4f6d96' }, ar: { x: 175, name: '아르곤', col: ['#e0d2f5', '#9a7bc8'], band: '#5e3d93' } };
    const SW = { x: 900, y: 500 }, CH = { x: 770, y: 40, w: 270, h: 250 };
    const bright = (b, s) => { if (!b.gas || s < 0) return 0; const up = clamp(s / 0.5, 0, 1); if (b.gas === 'ar') return up; return s < 2.6 ? up : s < 3.4 ? lerp(1, 0.55, (s - 2.6) / 0.8) + 0.2 * Math.sin(s * 40) * (s > 3) : 0; };
    def('bulb10', {
      init(st, api) { st.b = BL.map(() => ({ gas: null, P: [] })); st.on = false; st.s = -1; st.drag = null; st.log = [[], []]; st.done = false; api.say('왼쪽 <b>기체 통</b>을 끌어 두 전구에 서로 다른 기체를 하나씩 채우자. 그다음 오른쪽 아래 <b>스위치</b>를 올린다.'); },
      fill(i, g, st, api) {
        if (st.on) return; const b = st.b[i]; b.gas = g; b.P = [];
        const n = g === 'ar' ? 26 : 24; for (let k = 0; k < n; k++) { const a = Math.random() * TAU, d = Math.random() * (GR - 18); b.P.push({ x: Math.cos(a) * d, y: Math.sin(a) * d, vx: (Math.random() - 0.5) * 90, vy: (Math.random() - 0.5) * 90, rot: Math.random() * TAU, t: g === 'ar' ? 'Ar' : (k % 5 === 0 ? 'O2' : 'N2') }); }
        api.spark(BL[i].x, BL[i].y, g === 'ar' ? '#c9a8f0' : '#a9c3e8', 14);
        const gs = st.b.map((q) => q.gas);
        if (gs[0] && gs[1] && gs[0] !== gs[1]) { api.ok(2); api.say('두 전구에 서로 다른 기체를 채웠다. 이제 오른쪽 아래 <b>스위치를 위로 끌어</b> 켜 보자.'); }
        else if (gs[0] && gs[1]) api.say('두 전구에 같은 기체를 채웠다. 비교하려면 <b>서로 다른 기체</b>를 채우자.');
        else api.say(`${i + 1}번 전구에 <b>${CAN[g].name}</b>를 채웠다. 다른 전구에는 다른 기체를 채우자.`);
      },
      draw(c, st, api) {
        const t = st.t, W = 1060, H = 700;
        D.lab(c, W, H, TOP, { depth: 30 });
        if (st.on && st.s < 10.5) { st.s += st.dt; st.b.forEach((b, i) => { const L = st.log[i], v = bright(b, st.s) * 100; if (!L.length || st.s - L[L.length - 1][0] > 0.08) L.push([st.s, v]); }); if (st.s >= 10 && !st.done) this.finish(st, api); }
        // 기체 통
        Object.entries(CAN).forEach(([k, g]) => { const x = g.x, y = TOP; D.shadow(c, x, y + 4, 40, 7);
          c.fillStyle = D.lin(c, x - 30, 0, x + 30, 0, [g.col[1], g.col[0], g.col[1]]); D.rr(c, x - 30, y - 210, 60, 210, [30, 30, 6, 6]); c.fill(); c.fillStyle = g.band; c.fillRect(x - 30, y - 150, 60, 34); D.txt(c, g.name, x, y - 127, '#fff', '800 15px');
          c.fillStyle = D.lin(c, 0, y - 240, 0, y - 206, ['#e3e6ea', '#7d848e']); c.fillRect(x - 10, y - 236, 20, 28); c.fillStyle = '#3b4254'; D.rr(c, x - 22, y - 246, 44, 12, 5); c.fill();
          c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(x - 20, y - 196, 6, 180); });
        D.txt(c, '끌어서 전구에 채우기', 128, TOP + 24, '#fbf3e3', '700 13px');
        // 전구 둘
        st.b.forEach((b, i) => {
          const { x, y } = BL[i], s = st.s, v = st.on ? bright(b, s) : 0, burnt = b.gas === 'air' && st.on && s > 3.4, film = b.gas === 'air' && st.on ? clamp((s - 2.4) / 1.2, 0, 1) : 0;
          if (v > 0.02) D.glow(c, x, y, GR * 2.4 * v, `rgba(255,214,120,${0.55 * v})`);
          D.shadow(c, x, TOP + 4, 70, 9);
          c.fillStyle = D.lin(c, 0, y + 90, 0, TOP, ['#5a4632', '#3b2a1c']); D.rr(c, x - 50, y + 150, 100, TOP - y - 150, 8); c.fill(); c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(x - 46, y + 154, 92, 6);
          c.fillStyle = D.lin(c, x - 30, 0, x + 30, 0, ['#8e959e', '#e3e6ea', '#8e959e']); D.rr(c, x - 30, y + 74, 60, 78, 6); c.fill(); for (let k = 0; k < 5; k++) D.line(c, x - 30, y + 84 + k * 13, x + 30, y + 90 + k * 13, 'rgba(60,65,75,.5)', 2);
          // 유리구
          c.fillStyle = `rgba(${lerp(225, 235, film)},${lerp(238, 225, film)},${lerp(248, 190, film)},${0.35 + 0.25 * film})`; c.beginPath(); c.arc(x, y, GR, Math.PI * 0.62, Math.PI * 2.38); c.lineTo(x + 26, y + 78); c.lineTo(x - 26, y + 78); c.closePath(); c.fill();
          // 기체 입자
          c.save(); c.beginPath(); c.arc(x, y, GR - 4, 0, TAU); c.clip();
          b.P.forEach((p) => { const sp = st.on ? 1 + v * 1.5 : 1; p.x += p.vx * st.dt * sp; p.y += p.vy * st.dt * sp; p.rot += st.dt * 2; const d = Math.hypot(p.x, p.y); if (d > GR - 12) { const nx = p.x / d, ny = p.y / d, dot = p.vx * nx + p.vy * ny; p.vx -= 2 * dot * nx; p.vy -= 2 * dot * ny; p.x = nx * (GR - 12); p.y = ny * (GR - 12); }
            if (burnt && p.t === 'O2') return; const px = x + p.x, py = y + p.y;
            if (p.t === 'Ar') D.ball(c, px, py, 4.5, '#a77be0', '#4f2a8a', '#f0e4ff'); else { const ox = Math.cos(p.rot) * 3.5, oy = Math.sin(p.rot) * 3.5, col = p.t === 'N2' ? ['#5d93e0', '#1f4f9a', '#e0ecff'] : ['#ef6a55', '#9a2414', '#ffe0d8']; D.ball(c, px - ox, py - oy, 4, ...col); D.ball(c, px + ox, py + oy, 4, ...col); } });
          if (film > 0) for (let k = 0; k < 16; k++) { const a = hash(k, i) * TAU, rr = 10 + ((t * 20 + k * 9) % 60); c.fillStyle = `rgba(250,245,225,${0.5 * (1 - rr / 70) * film})`; c.beginPath(); c.arc(x + Math.cos(a) * rr * 0.5, y - 20 - rr * 0.6, 6, 0, TAU); c.fill(); }
          c.restore();
          c.strokeStyle = 'rgba(70,95,115,.75)'; c.lineWidth = 2.5; c.beginPath(); c.arc(x, y, GR, Math.PI * 0.62, Math.PI * 2.38); c.lineTo(x + 26, y + 76); c.moveTo(x - 26, y + 76); c.lineTo(x + Math.cos(Math.PI * 0.62) * GR, y + Math.sin(Math.PI * 0.62) * GR); c.stroke();
          c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(x - 44, y - 30, 9, 26, 0.5, 0, TAU); c.fill();
          // 필라멘트
          D.line(c, x - 12, y + 76, x - 18, y + 10, '#9aa1ab', 2.5); D.line(c, x + 12, y + 76, x + 18, y + 10, '#9aa1ab', 2.5);
          const fc = v > 0.02 ? `rgb(255,${Math.round(180 + 70 * v)},${Math.round(90 + 120 * v)})` : burnt ? '#8a7a5a' : '#6c727c';
          c.strokeStyle = fc; c.lineWidth = v > 0.02 ? 3.2 : 2.2; c.beginPath(); c.moveTo(x - 18, y + 10);
          for (let k = 0; k <= 12; k++) { const fx = x - 18 + k * 3, fy = y + 10 + (k % 2 ? -6 : 6); if (burnt && k === 7) { c.stroke(); c.beginPath(); c.moveTo(fx + 2, fy + 6); continue; } c.lineTo(fx, fy); }
          c.lineTo(x + 18, y + 10); c.stroke();
          if (v > 0.02) D.glow(c, x, y + 10, 30, `rgba(255,250,220,${0.8 * v})`);
          if (burnt && s < 3.8) api.spark(x + 3, y + 8, '#ffd27a', 2, 60);
          D.tag(c, `${i + 1}번 전구 · ${b.gas ? CAN[b.gas].name : '빈 전구(진공)'}`, x, y - GR - 18, { f: '700 14px', bg: b.gas ? (b.gas === 'ar' ? '#efe6fb' : '#e6eef8') : 'rgba(251,252,249,.92)', line: '#1d2433' });
          if (burnt) D.tag(c, '필라멘트가 끊어졌다', x, y + 44, { f: '800 13px', bg: 'rgba(176,65,46,.9)', col: '#fff' });
          // 필라멘트 확대(켜졌을 때)
          if (st.on && b.gas) { const zx = x + 104, zy = y - 70, zr = 44; c.save(); c.beginPath(); c.arc(zx, zy, zr, 0, TAU); c.fillStyle = '#1d2433'; c.fill(); c.clip();
            for (let r = 0; r < 3; r++) for (let q = 0; q < 6; q++) { const ax = zx - 30 + q * 12, ay = zy + 14 + r * 11, ox = b.gas === 'air' && s > 1.5 && r === 0 && q % 2 === 0; D.ball(c, ax, ay, 5.5, ox ? '#f2c46a' : '#b8bec8', ox ? '#9a6a10' : '#5b626d', '#ffffff'); if (ox) D.ball(c, ax, ay - 8, 3.5, '#ef6a55', '#9a2414', '#ffe0d8'); }
            for (let k = 0; k < 4; k++) { const ph = (t * 0.8 + k / 4) % 1, gx = zx - 28 + k * 18, gy = zy - 36 + (ph < 0.5 ? ph : 1 - ph) * 80; if (b.gas === 'ar') D.ball(c, gx, gy, 4.5, '#a77be0', '#4f2a8a', '#f0e4ff'); else if (k % 2 === 0) { D.ball(c, gx - 3, gy, 3.5, '#ef6a55', '#9a2414', '#ffe0d8'); D.ball(c, gx + 3, gy, 3.5, '#ef6a55', '#9a2414', '#ffe0d8'); } else { D.ball(c, gx - 3, gy, 3.5, '#5d93e0', '#1f4f9a', '#e0ecff'); D.ball(c, gx + 3, gy, 3.5, '#5d93e0', '#1f4f9a', '#e0ecff'); } }
            c.restore(); c.strokeStyle = '#f2b705'; c.lineWidth = 3; c.beginPath(); c.arc(zx, zy, zr, 0, TAU); c.stroke(); D.line(c, x + 14, y + 4, zx - 30, zy + 32, 'rgba(242,183,5,.8)', 2, [4, 3]);
            D.tag(c, b.gas === 'ar' ? '아르곤: 부딪혀도 그대로' : '산소가 텅스텐과 반응', zx, zy + zr + 14, { f: '700 12px', bg: 'rgba(29,36,51,.85)', col: '#fff' }); }
        });
        // 그래프
        D.card(c, CH.x, CH.y, CH.w, CH.h, { bg: '#fbfcf9', title: '전구 밝기' });
        const g = D.axes(c, CH.x + 46, CH.y + 62, CH.w - 66, CH.h - 112, { x0: 0, x1: 10, y0: 0, y1: 100, xt: [0, 2, 4, 6, 8, 10], yt: [0, 50, 100], xl: '시간(s)', yl: '밝기(%)', fs: 11 });
        st.log.forEach((L, i) => { if (L.length < 2) return; c.strokeStyle = st.b[i].gas === 'ar' ? '#7a4fc0' : '#4f7fb8'; c.lineWidth = 3; c.beginPath(); L.forEach(([x, y], j) => (j ? c.lineTo(g.X(x), g.Y(y)) : c.moveTo(g.X(x), g.Y(y)))); c.stroke(); const [lx, ly] = L[L.length - 1]; D.ball(c, g.X(lx), g.Y(ly), 5, c.strokeStyle, '#1d2433'); });
        st.b.forEach((b, i) => { if (!b.gas) return; const col = b.gas === 'ar' ? '#7a4fc0' : '#4f7fb8', lx = CH.x + 120 + i * 0, ly = CH.y + 24 + i * 0; D.line(c, CH.x + 118, CH.y + 18 + i * 16, CH.x + 140, CH.y + 18 + i * 16, col, 3); D.txt(c, `${i + 1}번 전구(${CAN[b.gas].name})`, CH.x + 146, CH.y + 22 + i * 16, '#1d2433', '700 11px', 'left'); });
        if (st.on && st.s < 10) { D.line(c, g.X(st.s), CH.y + 62, g.X(st.s), CH.y + CH.h - 50, 'rgba(192,57,43,.6)', 1.5, [3, 3]); }
        // 스위치
        D.shadow(c, SW.x, TOP + 4, 80, 8); c.fillStyle = D.lin(c, 0, SW.y - 60, 0, TOP, ['#4b5466', '#2b3242']); D.rr(c, SW.x - 70, SW.y - 66, 140, TOP - SW.y + 66, 10); c.fill();
        c.fillStyle = '#1d2433'; D.rr(c, SW.x - 16, SW.y - 50, 32, 90, 8); c.fill();
        const ly = st.leverY != null ? st.leverY : st.on ? SW.y - 30 : SW.y + 22; c.fillStyle = D.lin(c, 0, ly - 18, 0, ly + 18, st.on ? ['#7fe0a0', '#2f9a5a'] : ['#ff9a85', '#c0392b']); D.rr(c, SW.x - 26, ly - 18, 52, 36, 8); c.fill();
        D.txt(c, '켜짐', SW.x + 46, SW.y - 26, st.on ? '#7fe0a0' : '#9aa3b2', '800 13px'); D.txt(c, '꺼짐', SW.x + 46, SW.y + 28, st.on ? '#9aa3b2' : '#ff9a85', '800 13px');
        D.txt(c, '스위치', SW.x, TOP + 22, '#fbf3e3', '800 14px');
        // 전원: 스위치 → 벽 콘센트(220 V)
        D.wire(c, [[SW.x + 70, SW.y - 10], [1010, SW.y - 10], [1010, 360]], '#2b3242', 5);
        c.fillStyle = D.lin(c, 0, 300, 0, 360, ['#f4f5f7', '#d5d9df']); D.rr(c, 984, 300, 56, 64, 8); c.fill(); c.strokeStyle = '#8a929d'; c.lineWidth = 2; c.stroke();
        c.fillStyle = '#3b4254'; c.beginPath(); c.arc(1002, 330, 4, 0, TAU); c.arc(1022, 330, 4, 0, TAU); c.fill(); c.fillStyle = '#1d2433'; D.rr(c, 998, 340, 28, 18, 4); c.fill();
        D.tag(c, '전원 220 V', 1012, 384, { f: '700 12px' });
        // 끄는 기체 통이 손을 따라온다
        if (st.drag) { const g = CAN[st.drag.g], x = st.drag.x, y = st.drag.y; c.save(); c.globalAlpha = 0.92; c.translate(x, y); c.rotate(-0.35); c.fillStyle = D.lin(c, -22, 0, 22, 0, [g.col[1], g.col[0], g.col[1]]); D.rr(c, -22, -60, 44, 120, [22, 22, 5, 5]); c.fill(); c.fillStyle = g.band; c.fillRect(-22, -20, 44, 24); D.txt(c, g.name, 0, -3, '#fff', '800 12px'); c.fillStyle = '#7d848e'; c.fillRect(-7, -78, 14, 20); c.restore();
          const near = BL.findIndex((b) => Math.hypot(x - b.x, y - b.y) < GR + 30); if (near >= 0) { c.strokeStyle = 'rgba(242,183,5,.9)'; c.lineWidth = 4; c.setLineDash([8, 6]); c.beginPath(); c.arc(BL[near].x, BL[near].y, GR + 10, 0, TAU); c.stroke(); c.setLineDash([]); } }
        D.wire(c, [[SW.x - 70, SW.y + 20], [700, SW.y + 20], [700, TOP - 30], [BL[1].x + 50, TOP - 30]], '#2b3242', 4);
        D.wire(c, [[BL[1].x - 50, TOP - 30], [BL[0].x + 50, TOP - 30]], '#2b3242', 4);
      },
      finish(st, api) {
        st.done = true; api.ok(3);
        st.b.forEach((b) => { if (!b.gas) return; const r = b.gas === 'air' ? 0 : 1; api.row(r, b.gas === 'air' ? ['약 3초 만에 끊어짐', '공기 속 산소가 뜨거운 텅스텐과 반응'] : ['10초 내내 밝게 빛남', '아르곤은 뜨거워도 반응하지 않음']); });
        api.judge('ar', '아르곤은 18족이라 뜨거운 필라멘트와도 반응하지 않는다.');
        api.say('공기 전구는 산소가 뜨거운 필라멘트(텅스텐)와 반응해 곧 끊어졌고, <b>아르곤</b> 전구는 계속 빛났다. 18족 원소는 바깥 껍질이 꽉 차 안정하므로 <b>뜨거운 금속을 만나도 반응하지 않는다</b>.');
      },
      hint(st) { const i = st.b.findIndex((b) => !b.gas); if (i >= 0) { const g = i === 0 ? CAN.air : CAN.ar; return { x: g.x, y: TOP - 150, dx: BL[i].x - g.x, dy: BL[i].y - TOP + 150, dist: Math.hypot(BL[i].x - g.x, BL[i].y - TOP + 150) - 40, label: '기체 통을 끌어 전구에 채우기' }; } return { x: SW.x, y: SW.y + 22, dx: 0, dy: -1, dist: 52, label: '스위치를 위로' }; },
      down(p, st, api) {
        for (const [k, g] of Object.entries(CAN)) if (Math.abs(p.x - g.x) < 34 && p.y > TOP - 250 && p.y < TOP) { if (st.on) { api.say('스위치를 켠 뒤에는 기체를 바꿀 수 없다. 처음부터 눌러 다시 하자.'); return; } st.drag = { g: k, x: p.x, y: p.y }; return; }
        if (Math.abs(p.x - SW.x) < 40 && Math.abs(p.y - SW.y) < 70 && !st.on) st.lever = true;
      },
      move(p, st) { if (st.drag) { st.drag.x = p.x; st.drag.y = p.y; } if (st.lever) st.leverY = clamp(p.y, SW.y - 30, SW.y + 22); },
      up(p, st, api) {
        if (st.drag) { const d = st.drag; st.drag = null; const i = BL.findIndex((b) => Math.hypot(p.x - b.x, p.y - b.y) < GR + 30); if (i >= 0) this.fill(i, d.g, st, api); return; }
        if (st.lever) { st.lever = false; const on = st.leverY < SW.y; st.leverY = null; if (on) this.turn(st, api); }
      },
      turn(st, api) {
        const gs = st.b.map((b) => b.gas); if (!gs[0] || !gs[1] || gs[0] === gs[1]) { api.say('먼저 두 전구에 <b>서로 다른 기체</b>(공기 하나, 아르곤 하나)를 채우자.'); return; }
        st.on = true; st.s = 0; api.say('켰다! 두 전구의 밝기를 10초 동안 지켜보자. 오른쪽 위 그래프에 밝기가 그려진다.');
      },
      key(k, st, api) { if (k === '1') { this.fill(0, 'air', st, api); return true; } if (k === '2') { this.fill(1, 'ar', st, api); return true; } if (k === 'Enter' || k === ' ') { this.turn(st, api); return true; } return false; },
      test(st, api, step = 3) { this.fill(0, 'air', st, api); this.fill(1, 'ar', st, api); if (step > 2) this.turn(st, api); },
    });
  }

  // ───────────────────────── pair10 두 원자 짝짓기 ─────────────────────────
  {
    const AT = {
      Na: { z: 11, sh: [2, 8, 1], k: 'm', v: 1, n: '나트륨' }, Mg: { z: 12, sh: [2, 8, 2], k: 'm', v: 2, n: '마그네슘' },
      H: { z: 1, sh: [1], k: 'n', need: 1, n: '수소' }, O: { z: 8, sh: [2, 6], k: 'n', need: 2, n: '산소' }, Cl: { z: 17, sh: [2, 8, 7], k: 'n', need: 1, n: '염소' }, Ne: { z: 10, sh: [2, 8], k: 'g', n: '네온' },
    };
    const KEYS = ['Na', 'Mg', 'H', 'O', 'Cl', 'Ne'], DK = [{ x: 300, y: 290 }, { x: 720, y: 290 }], RACK_Y = 610;
    const rackX = (i) => 120 + i * 164;
    const r0 = 20, dr = 27, outR = (s) => r0 + 12 + dr * (AT[s].sh.length - 1) + dr * 0.5;
    const SUP = { 1: '⁺', 2: '²⁺', '-1': '⁻', '-2': '²⁻' };
    function plan(a, b) {
      const A = AT[a], B = AT[b];
      if (A.k === 'g' || B.k === 'g') return { type: 'none', msg: `${A.k === 'g' ? A.n : B.n}은 가장 바깥 껍질이 꽉 차 있다(18족). 전자를 주지도, 받지도, 함께 쓰지도 않는다.` };
      if (A.k === 'm' && B.k === 'm') return { type: 'skip', msg: '금속 원소끼리의 결합은 이 단원에서 다루지 않는다. 비금속 원소와 짝지어 보자.' };
      if (A.k === 'm' || B.k === 'm') {
        const [m, n] = A.k === 'm' ? [a, b] : [b, a], M = AT[m], N = AT[n];
        if (n === 'H') return { type: 'skip', msg: '금속과 수소의 결합은 이 단원에서 다루지 않는다. 염소나 산소와 짝지어 보자.' };
        if (M.v !== N.need) return { type: 'skip', msg: M.v < N.need ? `${N.n}은 전자 ${N.need}개가 필요한데 ${M.n}은 ${M.v}개만 줄 수 있다 — ${M.n}이 하나 더 있어야 한다(${m}₂${n}).` : `${M.n}은 전자 ${M.v}개를 내놓아야 하는데 ${N.n}은 ${N.need}개만 받는다 — ${N.n}이 하나 더 있어야 한다(${m}${n}₂).` };
        return { type: 'give', m, n, k: M.v };
      }
      const p = Math.min(A.need, B.need); let msg = '';
      if (A.need !== B.need) { const [big, small] = A.need > B.need ? [a, b] : [b, a]; msg = ` ${AT[big].n}은 전자쌍이 하나 더 필요하다 — ${AT[small].n} 하나를 더 붙이면 ${big === 'O' && small === 'H' ? '물 분자(H₂O)' : '분자'}가 완성된다(다음 차시).`; }
      return { type: 'share', p, msg };
    }
    def('pair10', {
      bg: '#e9edf2',
      init(st, api) { st.dock = [null, null]; st.rx = null; st.drag = null; st.seen = {}; api.say('아래 원자를 끌어 두 받침에 하나씩 놓자. 두 원자가 만나면 전자가 어떻게 되는지 본다.'); },
      draw(c, st, api) {
        const t = st.t, W = 1060, H = 700;
        c.fillStyle = D.lin(c, 0, 0, 0, H, ['#f3f6f9', '#dfe6ee']); c.fillRect(0, 0, W, H);
        c.strokeStyle = 'rgba(80,110,150,.08)'; c.lineWidth = 1; for (let i = 0; i < 26; i++) for (let j = 0; j < 14; j++) { const x = i * 44 + (j % 2) * 22, y = j * 40; c.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + Math.PI / 6; c.lineTo(x + Math.cos(a) * 22, y + Math.sin(a) * 22); } c.closePath(); c.stroke(); }
        // 받침(유리판)
        D.shadow(c, 510, 470, 440, 26, 0.18); c.fillStyle = 'rgba(210,228,240,.35)'; c.beginPath(); c.ellipse(510, 450, 450, 60, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(70,95,115,.3)'; c.lineWidth = 2; c.stroke();
        const rx = st.rx; if (rx) rx.k += st.dt;
        const pos = [DK[0].x, DK[1].x];
        DK.forEach((d, i) => { if (!st.dock[i]) { c.strokeStyle = 'rgba(29,36,51,.35)'; c.setLineDash([8, 7]); c.lineWidth = 2.5; c.beginPath(); c.arc(d.x, d.y, 110, 0, TAU); c.stroke(); c.setLineDash([]); D.txt(c, i ? '두 번째 원자' : '첫 번째 원자', d.x, d.y + 6, '#7a8496', '700 16px'); } });
        if (st.dock[0] && st.dock[1]) {
          const a = st.dock[0], b = st.dock[1], P = rx.plan, k = rx.k;
          if (P.type === 'give') {
            const mi = a === P.m ? 0 : 1, ni = 1 - mi, fly = clamp((k - 0.6) / 1.2, 0, 1), close = ease(clamp((k - 2.2) / 1.0, 0, 1));
            const Mi = AT[P.m], Ni = AT[P.n], Rm = outR(P.m), Rn = outR(P.n);
            const lastM = Mi.sh.length - 1, shM = fly <= 0 ? Mi.sh : fly < 1 ? Mi.sh.slice(0, -1).concat([Mi.sh[lastM] - P.k]) : Mi.sh.slice(0, -1), shN = fly < 1 ? Ni.sh : Ni.sh.slice(0, -1).concat([Ni.sh[Ni.sh.length - 1] + P.k]);
            const gap = (DK[1].x - DK[0].x), want = (fly < 1 ? Rm : Rm - dr) + Rn + 92; const dx = (gap - want) * close / 2;
            pos[mi] += mi === 0 ? dx : -dx; pos[ni] += ni === 0 ? dx : -dx;
            const xm = pos[mi], xn = pos[ni], y = DK[0].y;
            if (close > 0.5) { c.strokeStyle = `rgba(242,183,5,${(close - 0.5) * 1.6})`; c.lineWidth = 3; for (let j = 0; j < 3; j++) { const yy = y - 20 + j * 20; D.arrow(c, xm + 40, yy, (xm + xn) / 2 - 4, yy, `rgba(242,183,5,${(close - 0.5) * 1.6})`, 2.5, 9); D.arrow(c, xn - 40, yy, (xm + xn) / 2 + 4, yy, `rgba(242,183,5,${(close - 0.5) * 1.6})`, 2.5, 9); } }
            D.atom(c, xm, y, { Z: Mi.z, sh: shM, r0, dr, t, rings: fly < 1 ? Mi.sh.length : Mi.sh.length - 1, hl: fly <= 0 });
            D.atom(c, xn, y, { Z: Ni.z, sh: shN, r0, dr, t, hl: fly >= 1 });
            if (fly > 0 && fly < 1) for (let e = 0; e < P.k; e++) { const sx = xm + (mi === 0 ? Rm : -Rm), ex = xn + (mi === 0 ? -Rn : Rn), ex2 = lerp(sx, ex, fly), ey = y - 70 - Math.sin(fly * Math.PI) * 60 + e * 20; D.glow(c, ex2, ey, 18, 'rgba(110,180,255,.55)'); D.ball(c, ex2, ey, 8, '#4aa0f0', '#174a8a', '#e0f0ff'); }
            if (fly >= 1) { [[xm, P.m, Mi.v, Rm - dr], [xn, P.n, -P.k, Rn]].forEach(([x, s, q, rr]) => { c.strokeStyle = '#1d2433'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x - rr - 6, y - rr); c.lineTo(x - rr - 14, y - rr); c.lineTo(x - rr - 14, y + rr); c.lineTo(x - rr - 6, y + rr); c.moveTo(x + rr + 6, y - rr); c.lineTo(x + rr + 14, y - rr); c.lineTo(x + rr + 14, y + rr); c.lineTo(x + rr + 6, y + rr); c.stroke(); D.txt(c, `${s}${SUP[q]}`, x + rr + 18, y - rr + 4, q > 0 ? '#c0392b' : '#1f4f9a', '800 20px', 'left'); }); }
            D.tag(c, fly < 1 ? `${Mi.n}이 바깥 전자 ${P.k}개를 ${Ni.n}에게 건넨다` : close < 1 ? '양이온과 음이온 — 서로 끌어당긴다' : `${P.m}${SUP[Mi.v]} 와 ${P.n}${SUP[-P.k]} : 정전기적 인력으로 결합(이온 결합)`, 510, 110, { f: '800 17px', bg: 'rgba(29,36,51,.88)', col: '#ffe9a0' });
          } else if (P.type === 'share') {
            const Ra = outR(a), Rb = outR(b), close = ease(clamp((k - 0.5) / 1.4, 0, 1)), gap = DK[1].x - DK[0].x, want = Ra + Rb - (a === 'H' || b === 'H' ? 22 : 30), dx = (gap - want) * close / 2;
            pos[0] += dx; pos[1] -= dx; const y = DK[0].y, A = AT[a], B = AT[b], p = P.p;
                        const outer = (x, S, side) => { const m = S.sh[S.sh.length - 1] - p, R = outR(S === A ? a : b); for (let q = 0; q < m; q++) { const ang = (side < 0 ? Math.PI : 0) + (m === 1 ? 0 : lerp(-1.75, 1.75, q / (m - 1))) * -side + Math.sin(t * 2 + q) * 0.03; D.ball(c, x + Math.cos(ang) * R, y + Math.sin(ang) * R, 7, '#3f8fe0', '#174a8a', '#d8ecff'); } };
            if (close >= 1) { const a0 = A.sh.slice(), b0 = B.sh.slice(); a0[a0.length - 1] = 0; b0[b0.length - 1] = 0; D.atom(c, pos[0], y, { Z: A.z, sh: a0, r0, dr, t: 0, rings: A.sh.length, spin: 0 }); D.atom(c, pos[1], y, { Z: B.z, sh: b0, r0, dr, t: 0, rings: B.sh.length, spin: 0 }); outer(pos[0], A, -1); outer(pos[1], B, 1); }
            else { D.atom(c, pos[0], y, { Z: A.z, sh: A.sh, r0, dr, t, rings: A.sh.length }); D.atom(c, pos[1], y, { Z: B.z, sh: B.sh, r0, dr, t, rings: B.sh.length }); }
            if (close >= 1) { const mx = (pos[0] + Ra + pos[1] - Rb) / 2; c.fillStyle = 'rgba(255,216,77,.25)'; c.strokeStyle = '#f2b705'; c.lineWidth = 2.5; c.beginPath(); c.ellipse(mx, y, 16, 18 + p * 18, 0, 0, TAU); c.fill(); c.stroke();
              for (let q = 0; q < p; q++) { const yy = y + (q - (p - 1) / 2) * 34; D.ball(c, mx - 7, yy, 7.5, '#4aa0f0', '#174a8a', '#e0f0ff'); D.ball(c, mx + 7, yy, 7.5, '#4aa0f0', '#174a8a', '#e0f0ff'); }
              D.tag(c, `공유 전자쌍 ${p}개`, mx, y + Math.max(Ra, Rb) + 26, { f: '800 15px', col: '#b07a00', line: '#f2b705' }); }
            D.tag(c, close < 1 ? '바깥 껍질이 다가가 겹친다' : `전자쌍을 함께 쓴다(공유 결합)${P.msg ? ' · 더 필요' : ''}`, 510, 110, { f: '800 17px', bg: 'rgba(29,36,51,.88)', col: '#ffe9a0' });
          } else {
            const push = k < 0.8 ? ease(k / 0.8) * 50 : k < 1.6 ? 50 * (1 - ease((k - 0.8) / 0.8)) : 0;
            pos[0] += push; pos[1] -= push; const y = DK[0].y;
            [a, b].forEach((s, i) => D.atom(c, pos[i], y, { Z: AT[s].z, sh: AT[s].sh, r0, dr, t, hl: false }));
            if (P.type === 'none') { const nx = a === 'Ne' ? pos[0] : pos[1]; D.glow(c, nx, y, 140, 'rgba(255,120,80,.12)'); D.tag(c, '아무 일도 일어나지 않는다', 510, 110, { f: '800 17px', bg: 'rgba(29,36,51,.88)', col: '#ffe9a0' }); }
            else D.tag(c, '이 짝은 이 화면에서 다루지 않는다', 510, 110, { f: '800 17px', bg: 'rgba(29,36,51,.88)', col: '#ffe9a0' });
          }
          [a, b].forEach((s, i) => D.txt(c, `${AT[s].n} ${s}`, pos[i], DK[0].y + 148, '#1d2433', '800 18px'));
        } else st.dock.forEach((s, i) => { if (s) { D.atom(c, DK[i].x, DK[i].y, { Z: AT[s].z, sh: AT[s].sh, r0, dr, t, hl: true }); D.txt(c, `${AT[s].n} ${s}`, DK[i].x, DK[i].y + 148, '#1d2433', '800 18px'); } });
        // 선반 + 원자 구슬
        c.fillStyle = D.lin(c, 0, 560, 0, 700, ['#c9a77c', '#9b7448']); D.rr(c, 30, 568, 1000, 112, 14); c.fill(); c.fillStyle = 'rgba(255,240,215,.35)'; c.fillRect(40, 572, 980, 4);
        KEYS.forEach((s, i) => { const x = rackX(i), y = RACK_Y, A = AT[s]; D.shadow(c, x, y + 42, 40, 7);
          c.strokeStyle = 'rgba(29,36,51,.25)'; c.lineWidth = 1.5; c.beginPath(); c.arc(x, y, 34, 0, TAU); c.stroke();
          D.ball(c, x, y, 26, A.k === 'm' ? '#9fc0ea' : A.k === 'g' ? '#d6c4f0' : '#f6d27a', A.k === 'm' ? '#3d6aa8' : A.k === 'g' ? '#6b4aa0' : '#b07a00', '#ffffff');
          D.txt(c, s, x, y + 8, '#1d2433', '800 22px'); D.txt(c, `${A.n} · 원자가 전자 ${A.k === 'g' ? 0 : A.sh[A.sh.length - 1]}`, x, y + 56, '#3b2a1c', '700 13px');
          const ea = t * 1.2 + i; D.ball(c, x + Math.cos(ea) * 34, y + Math.sin(ea) * 34, 5, '#4aa0f0', '#174a8a', '#e0f0ff'); });
        D.txt(c, '파랑 = 금속 · 노랑 = 비금속 · 보라 = 18족', 1020, 556, '#4a5366', '600 13px', 'right');
        if (st.drag) { const A = AT[st.drag.s]; D.ball(c, st.drag.x, st.drag.y, 30, A.k === 'm' ? '#9fc0ea' : A.k === 'g' ? '#d6c4f0' : '#f6d27a', '#5b626d', '#ffffff'); D.txt(c, st.drag.s, st.drag.x, st.drag.y + 8, '#1d2433', '800 22px'); }
        if (rx && !rx.told && rx.k > (rx.plan.type === 'give' ? 3.3 : rx.plan.type === 'share' ? 2 : 1)) { rx.told = true; this.result(st, api); }
      },
      result(st, api) {
        const [a, b] = st.dock, P = st.rx.plan;
        if (P.type === 'skip') { api.say(P.msg); return; }
        if (P.type === 'none') { st.seen.none = 1; api.row(2, [`${a} + ${b}`, '그대로(18족은 이미 안정)']); api.say(P.msg); }
        if (P.type === 'give') { st.seen.give = 1; api.row(0, [`${a} + ${b}`, `${AT[P.m].n} → ${AT[P.n].n}: 전자 ${P.k}개 이동 → ${P.m}${SUP[AT[P.m].v]}, ${P.n}${SUP[-P.k]}`]); const nob = (z) => (z <= 10 ? '헬륨' : z <= 18 ? '네온' : '아르곤'); api.say(`<b>${AT[P.m].n}</b>(금속)이 전자를 잃어 양이온, <b>${AT[P.n].n}</b>(비금속)이 전자를 얻어 음이온이 되었다. ${AT[P.m].n} 이온은 <b>${nob(AT[P.m].z)}</b>, ${AT[P.n].n === '산소' ? '산화' : '염화'} 이온은 <b>${nob(AT[P.n].z + 8)}</b>과 같은 전자 배치다.`);
          if (P.m === 'Na' && P.n === 'Cl') { api.ok(2); api.judge('NaCl', '금속인 나트륨이 바깥 전자 1개를 비금속인 염소에게 준다.'); } }
        if (P.type === 'share') { st.seen.share = 1; api.row(1, [`${a} + ${b}`, `전자쌍 ${P.p}개를 함께 씀`]); api.say(`비금속 원자끼리는 서로 전자를 얻으려 해서 <b>전자쌍을 함께 쓴다</b>.${P.msg}`); }
        if (st.seen.give && st.seen.share && st.seen.none) api.ok(3);
      },
      hint(st) { const i = st.dock[0] ? 4 : 0, d = DK[st.dock[0] ? 1 : 0]; return { x: rackX(i), y: RACK_Y - 20, dx: d.x - rackX(i), dy: d.y - RACK_Y + 20, dist: Math.hypot(d.x - rackX(i), d.y - RACK_Y + 20) - 40, label: '원자를 끌어 받침에 놓기' }; },
      down(p, st) { const i = KEYS.findIndex((s, j) => Math.hypot(p.x - rackX(j), p.y - RACK_Y) < 36); if (i >= 0) { st.drag = { s: KEYS[i], x: p.x, y: p.y }; return; } DK.forEach((d, j) => { if (st.dock[j] && Math.hypot(p.x - d.x, p.y - d.y) < 100 && !(st.dock[0] && st.dock[1])) st.dock[j] = null; }); },
      move(p, st) { if (st.drag) { st.drag.x = p.x; st.drag.y = p.y; } },
      up(p, st, api) {
        const d = st.drag; if (!d) return; st.drag = null;
        let j = DK.findIndex((q) => Math.hypot(p.x - q.x, p.y - q.y) < 160); if (j < 0) return;
        this.place(j, d.s, st, api);
      },
      place(j, s, st, api) {
        if (st.dock[0] && st.dock[1]) { st.dock = [null, null]; st.rx = null; }
        st.dock[j] = s; if (st.dock[0] && st.dock[1]) { st.rx = { plan: plan(st.dock[0], st.dock[1]), k: 0 }; api.say('두 원자가 만났다…'); }
        else api.say(`<b>${AT[s].n}</b>을 놓았다. 다른 받침에 짝이 될 원자를 놓자.`);
      },
      key(k, st, api) { const i = +k - 1; if (i >= 0 && i < KEYS.length) { this.place(st.dock[0] && !st.dock[1] ? 1 : 0, KEYS[i], st, api); return true; } return false; },
      test(st, api, a, b) { this.place(0, a, st, api); this.place(1, b, st, api); },
    });
  }
})();
