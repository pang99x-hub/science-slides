/* 2-1-4 늘린 체험 장(작업-4, 2026-11-13). more-34.js 의 M34.def 로 등록한다.
   burn11 나트륨과 염소 기체의 만남 · pull11 이온 사이 끌림 재기 · salt11 염전에서 소금 얻기 (1차시)
   count12 원자마다 바깥 전자 세기 · butane12 휴대용 가스 분자 조립 · zoom12 물방울 속으로 확대 (2차시)
   blue4 파란 이온이 움직이는 길 · dose4 소금을 한 숟가락씩 (3차시) */
(function () {
  'use strict';
  const { def, D } = window.M34;
  const { TAU, lerp, clamp, ease, hash } = D;
  const E = (c, x, y, r = 7) => D.ball(c, x, y, r, '#4aa0f0', '#174a8a', '#e0f0ff');           // 전자
  const NA = (c, x, y, r = 9) => { D.ball(c, x, y, r, '#b48be8', '#5d3a9a', '#f3eaff'); D.txt(c, '+', x, y + r * 0.42, '#fff', `800 ${Math.round(r * 1.2)}px`); };
  const CL = (c, x, y, r = 13) => { D.ball(c, x, y, r, '#7fcf6a', '#2f7a2a', '#e8ffe0'); D.txt(c, '−', x, y + r * 0.35, '#fff', `800 ${Math.round(r * 1.1)}px`); };

  // ───────────────────────── burn11 나트륨과 염소 기체의 만남(교사 시범) ─────────────────────────
  {
    const LAMP = { x: 230, y: 560 },   // 달구는 자리는 불꽃 끝(LAMP.y - 208): 숟가락이 불꽃을 가리지 않게
          JAR = { x: 520, bot: 560, hw: 92, h: 330 }, Z = { x: 878, y: 180, r: 116 }, CHT = { x: 726, y: 384, w: 316, h: 230 };
    const HOME = { x: 120, y: 470 };
    def('burn11', {
      init(st, api) { st.cup = { ...HOME }; st.drag = false; st.heat = 0; st.p = -1; st.log = []; st.smoke = []; st.told = {}; api.say('숟가락 위 <b>나트륨</b>을 먼저 알코올램프 불꽃에 달군 뒤, 염소 기체가 든 병에 넣어 보자(선생님 시범 장면).'); },
      draw(c, st, api) {
        const t = st.t, W = 1060, H = 700, cup = st.cup;
        // 흄 후드: 뒷벽 타일 · 테두리 · 유리 미닫이
        c.fillStyle = D.lin(c, 0, 0, 0, 560, ['#e9edf0', '#d5dce2']); c.fillRect(0, 0, W, 560);
        c.strokeStyle = 'rgba(120,135,150,.18)'; c.lineWidth = 1; for (let y = 40; y < 560; y += 40) D.line(c, 0, y, 700, y, 'rgba(120,135,150,.18)', 1); for (let x = 0; x < 700; x += 60) D.line(c, x, 0, x, 560, 'rgba(120,135,150,.12)', 1);
        c.fillStyle = D.lin(c, 0, 0, 0, 60, ['#5b6475', '#3b4254']); c.fillRect(0, 0, 700, 34); c.fillStyle = 'rgba(200,225,240,.18)'; c.fillRect(0, 34, 700, 70); D.line(c, 0, 104, 700, 104, 'rgba(90,100,115,.6)', 3);
        c.fillStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.moveTo(40, 34); c.lineTo(90, 34); c.lineTo(60, 104); c.lineTo(10, 104); c.fill();
        D.txt(c, '흄 후드', 30, 24, '#e8edf5', '800 15px', 'left');
        D.tag(c, '⚠ 선생님 시범도 흄 후드 안에서만 · 학생 실험 금지', 470, 18, { f: '800 14px', bg: '#b0412e', col: '#fff' });
        D.lab(c, W, H, 560, { depth: 26, w0: 'rgba(0,0,0,0)', w1: 'rgba(0,0,0,0)' });
        c.fillStyle = '#3b4254'; c.fillRect(700, 0, 14, 560);
        // 알코올램프
        D.shadow(c, LAMP.x, LAMP.y + 4, 60, 8);
        c.fillStyle = D.lin(c, LAMP.x - 50, 0, LAMP.x + 50, 0, ['rgba(200,220,235,.6)', 'rgba(240,248,252,.85)', 'rgba(200,220,235,.6)']); c.beginPath(); c.moveTo(LAMP.x - 50, LAMP.y); c.quadraticCurveTo(LAMP.x - 58, LAMP.y - 70, LAMP.x - 16, LAMP.y - 84); c.lineTo(LAMP.x + 16, LAMP.y - 84); c.quadraticCurveTo(LAMP.x + 58, LAMP.y - 70, LAMP.x + 50, LAMP.y); c.closePath(); c.fill(); c.strokeStyle = 'rgba(70,95,115,.7)'; c.lineWidth = 2; c.stroke();
        c.fillStyle = 'rgba(120,170,220,.45)'; c.beginPath(); c.moveTo(LAMP.x - 48, LAMP.y - 4); c.quadraticCurveTo(LAMP.x - 52, LAMP.y - 40, LAMP.x - 40, LAMP.y - 44); c.lineTo(LAMP.x + 40, LAMP.y - 44); c.quadraticCurveTo(LAMP.x + 52, LAMP.y - 40, LAMP.x + 48, LAMP.y - 4); c.fill();
        c.fillStyle = '#c9ced5'; c.fillRect(LAMP.x - 12, LAMP.y - 98, 24, 16); c.fillStyle = '#f2ecd8'; c.fillRect(LAMP.x - 3, LAMP.y - 112, 6, 16);
        D.txt(c, '알코올램프', LAMP.x, LAMP.y + 24, '#fbf3e3', '700 13px');
        // 가스 병(염소)
        const p = st.p, cl = p < 0 ? 1 : 1 - ease(clamp(p, 0, 1)), j = JAR, top = j.bot - j.h;
        D.shadow(c, j.x, j.bot + 4, j.hw * 1.2, 10);
        c.fillStyle = `rgba(200,225,110,${0.12 + 0.5 * cl})`; D.rr(c, j.x - j.hw, top, j.hw * 2, j.h, [4, 4, 10, 10]); c.fill();
        for (let k = 0; k < 14; k++) { const yy = top + 20 + ((k * 23 + t * 8) % (j.h - 30)), xx = j.x - j.hw + 14 + hash(k) * (j.hw * 2 - 28); c.fillStyle = `rgba(170,200,60,${0.25 * cl})`; c.beginPath(); c.arc(xx, yy, 12 + hash(k, 2) * 10, 0, TAU); c.fill(); }
        if (p > 0) { const wf = ease(clamp(p, 0, 1)); c.fillStyle = `rgba(250,250,245,${0.85 * wf})`; c.fillRect(j.x - j.hw + 4, j.bot - 6 - 22 * wf, j.hw * 2 - 8, 22 * wf); for (let k = 0; k < 30; k++) { c.fillStyle = `rgba(255,255,255,${0.55 * wf})`; c.fillRect(j.x - j.hw + 6 + hash(k, 4) * (j.hw * 2 - 12), top + 20 + hash(k, 6) * (j.h - 60), 3, 3); } }
        st.smoke = st.smoke.filter((s) => { s.y -= st.dt * 40; s.r += st.dt * 8; s.a -= st.dt * 0.25; if (s.a <= 0 || s.y < top + 10) return false; c.fillStyle = `rgba(250,250,248,${s.a})`; c.beginPath(); c.arc(s.x, s.y, s.r, 0, TAU); c.fill(); return true; });
        c.strokeStyle = 'rgba(70,95,115,.8)'; c.lineWidth = 3; D.rr(c, j.x - j.hw, top, j.hw * 2, j.h, [4, 4, 10, 10]); c.stroke();
        c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(j.x - j.hw + 10, top + 14, 7, j.h - 40);
        c.fillStyle = 'rgba(210,225,235,.85)'; D.rr(c, j.x - j.hw - 10, top - 10, j.hw * 2 + 20, 12, 4); c.fill(); c.strokeStyle = 'rgba(70,95,115,.7)'; c.lineWidth = 2; c.stroke();
        D.tag(c, p < 0 ? '염소 기체(황록색)' : p < 1 ? '반응 중 · 노란 불꽃' : '흰 가루가 생겼다', j.x, j.bot + 24, { f: '700 14px' });
        // 숟가락(연소 숟가락)과 나트륨
        const inJar = Math.abs(cup.x - j.x) < j.hw - 10 && cup.y > top + 20 && cup.y < j.bot - 20;
        const hx = cup.x - 70, hy = cup.y - 260;
        c.lineCap = 'round'; c.strokeStyle = '#7d848e'; c.lineWidth = 5; c.beginPath(); c.moveTo(cup.x, cup.y - 8); c.lineTo(hx, hy); c.stroke(); c.lineCap = 'butt';
        c.fillStyle = '#3b2a1c'; D.rr(c, hx - 12, hy - 44, 24, 50, 8); c.fill();
        c.fillStyle = D.lin(c, 0, cup.y - 10, 0, cup.y + 10, ['#e3e6ea', '#7d848e']); c.beginPath(); c.ellipse(cup.x, cup.y, 22, 9, 0, 0, Math.PI); c.fill(); c.strokeStyle = '#5b626d'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(cup.x, cup.y, 22, 6, 0, 0, TAU); c.stroke();
        const hot = st.heat, naLeft = p < 0 ? 1 : 1 - clamp(p, 0, 1);
        if (naLeft > 0.02) { if (hot > 0.3) D.glow(c, cup.x, cup.y - 4, 30 * hot, `rgba(255,170,60,${0.6 * hot})`); c.fillStyle = hot > 0.6 ? `rgb(255,${Math.round(200 - 60 * hot)},120)` : D.lin(c, cup.x - 12, 0, cup.x + 12, 0, ['#f6f7f9', '#a4abb5']); c.beginPath(); c.ellipse(cup.x, cup.y - 4, 14 * naLeft + 2, 7 * naLeft + 1, 0, 0, TAU); c.fill(); }
        { c.save(); c.globalAlpha = 0.88;
        const fl = 1 + 0.08 * Math.sin(t * 13) + 0.05 * Math.sin(t * 7);
        D.glow(c, LAMP.x, LAMP.y - 150, 70, 'rgba(255,190,90,.35)');
        c.fillStyle = D.lin(c, 0, LAMP.y - 200 * fl, 0, LAMP.y - 110, ['rgba(255,240,180,.1)', 'rgba(255,170,60,.85)', 'rgba(80,120,255,.8)']); c.beginPath(); c.moveTo(LAMP.x - 14, LAMP.y - 112); c.quadraticCurveTo(LAMP.x - 20, LAMP.y - 160, LAMP.x + Math.sin(t * 5) * 3, LAMP.y - 112 - 90 * fl); c.quadraticCurveTo(LAMP.x + 20, LAMP.y - 160, LAMP.x + 14, LAMP.y - 112); c.fill();
        c.restore(); }
        if (p >= 0 && p < 1) { const k = 0.8 + 0.2 * Math.sin(t * 25); D.glow(c, cup.x, cup.y - 10, 110 * k, 'rgba(255,214,60,.75)'); D.glow(c, cup.x, cup.y - 10, 40, 'rgba(255,255,230,.95)'); if (Math.random() < 0.6) st.smoke.push({ x: cup.x + (Math.random() - 0.5) * 40, y: cup.y - 10, r: 6, a: 0.7 }); }
        if (!inJar && Math.hypot(cup.x - LAMP.x, cup.y - (LAMP.y - 208)) < 46 && p < 0) { st.heat = clamp(st.heat + st.dt / 1.8, 0, 1); if (st.heat >= 1 && !st.told.hot) { st.told.hot = 1; api.ok(2); api.row(0, ['은백색의 무른 금속 → 달구면 녹아 빛남', '물·공기와 격렬히 반응']); api.say('나트륨이 녹아 빛난다. 이제 숟가락을 <b>염소 기체 병</b> 속으로 옮기자.'); } }
        else if (p < 0) st.heat = Math.max(0, st.heat - st.dt * 0.08);
        if (inJar && p < 0) { if (st.heat > 0.8) { st.p = 0; api.row(1, ['황록색 기체', '독성이 강하다']); api.say('노란 불꽃을 내며 격렬하게 반응한다! 병 속 기체 색과 오른쪽 확대 그림을 보자.'); } else if (!st.told.cold) { st.told.cold = 1; api.say('나트륨을 먼저 <b>알코올램프 불꽃</b>에 달궈야 반응이 시작된다.'); } }
        if (p >= 0 && p < 1) { st.p = Math.min(1, p + st.dt / 6); const L = st.log; if (!L.length || st.p * 10 - L[L.length - 1][0] > 0.15) L.push([st.p * 10, 100 * (1 - ease(st.p))]); if (st.p >= 1) this.end(st, api); }
        // 확대 원: 입자
        D.card(c, Z.x - Z.r - 14, Z.y - Z.r - 40, 2 * Z.r + 28, 2 * Z.r + 72, { bg: '#fbfcf9', title: '입자로 확대' });
        c.save(); c.beginPath(); c.arc(Z.x, Z.y, Z.r, 0, TAU); c.fillStyle = '#1b2440'; c.fill(); c.clip();
        const q = clamp(p, 0, 1), nA = Math.round(8 * (1 - q));
        for (let i = 0; i < 4; i++) { const a = t * 0.5 + i * 1.57, rr = 58 + (i % 2) * 22, x = Z.x + Math.cos(a) * rr, y = Z.y - 30 + Math.sin(a * 1.3) * 46; if (i < Math.round(4 * (1 - q))) { const ox = Math.cos(a * 2) * 9, oy = Math.sin(a * 2) * 9; D.ball(c, x - ox, y - oy, 9, '#9be07f', '#3a8a2a', '#f0ffe8'); D.ball(c, x + ox, y + oy, 9, '#9be07f', '#3a8a2a', '#f0ffe8'); } }
        for (let i = 0; i < nA; i++) { const x = Z.x - 34 + (i % 4) * 22, y = Z.y + 62 + Math.floor(i / 4) * 20; D.ball(c, x, y, 10, '#c9ced5', '#6c727c', '#ffffff'); }
        const nI = Math.round(16 * q); for (let i = 0; i < nI; i++) { const gx = i % 4, gy = Math.floor(i / 4), x = Z.x - 39 + gx * 26, y = Z.y - 24 + gy * 24; ((gx + gy) % 2 ? NA : CL)(c, x, y, (gx + gy) % 2 ? 8 : 11); }
        if (p >= 0 && p < 1) { const k = (t * 1.5) % 1, x0 = Z.x - 60, y0 = Z.y + 60, x1 = Z.x + 20, y1 = Z.y - 20; E(c, lerp(x0, x1, k), lerp(y0, y1, k) - Math.sin(k * Math.PI) * 30, 5); }
        c.restore(); c.strokeStyle = '#1d2433'; c.lineWidth = 3; c.beginPath(); c.arc(Z.x, Z.y, Z.r, 0, TAU); c.stroke();
        D.txt(c, p < 0 ? '나트륨 원자 8 · 염소 분자 4(원자 8)' : p < 1 ? '나트륨이 전자 1개를 염소에게' : 'Na⁺(보라)와 Cl⁻(초록)가 1 : 1로', Z.x, Z.y + Z.r + 22, '#1d2433', '700 13px');
        // 그래프
        D.card(c, CHT.x, CHT.y, CHT.w, CHT.h, { bg: '#fbfcf9', title: '병 속 염소 기체' });
        const g = D.axes(c, CHT.x + 54, CHT.y + 60, CHT.w - 76, CHT.h - 108, { x0: 0, x1: 10, y0: 0, y1: 100, xt: [0, 2, 4, 6, 8, 10], yt: [0, 50, 100], xl: '반응 시간(s)', yl: '남은 양(%)', fs: 11 });
        if (st.log.length > 1) { c.strokeStyle = '#7ba62a'; c.lineWidth = 3; c.beginPath(); st.log.forEach(([x, y], i) => (i ? c.lineTo(g.X(x), g.Y(y)) : c.moveTo(g.X(x), g.Y(y)))); c.stroke(); const [lx, ly] = st.log[st.log.length - 1]; D.ball(c, g.X(lx), g.Y(ly), 5, '#7ba62a', '#3a5a10'); }
        if (st.drag) { c.strokeStyle = 'rgba(242,183,5,.7)'; c.setLineDash([6, 5]); c.lineWidth = 2.5; c.beginPath(); c.arc(LAMP.x, LAMP.y - 208, 46, 0, TAU); c.stroke(); c.setLineDash([]); }
      },
      end(st, api) { if (st.told.end) return; st.told.end = 1; api.ok(3); api.row(2, ['흰 고체(가루)', '먹는 소금의 주성분 — 염소 기체와 달리 먹을 수 있다']); api.judge('NaCl', '나트륨 이온과 염화 이온이 1 : 1로 결합한 염화 나트륨이다.');
        api.say('반응이 끝났다. 황록색 염소가 사라지고 <b>흰 가루(염화 나트륨)</b>가 생겼다. 나트륨은 전자를 잃어 Na⁺, 염소는 전자를 얻어 Cl⁻가 되어 결합했다.'); },
      hint(st) { return st.heat < 1 ? { x: HOME.x, y: HOME.y - 6, dx: LAMP.x - HOME.x, dy: LAMP.y - 208 - HOME.y, dist: Math.hypot(LAMP.x - HOME.x, LAMP.y - 208 - HOME.y), label: '숟가락을 끌어 불꽃에 대기' } : null; },
      down(p, st) { const cup = st.cup, hx = cup.x - 70, hy = cup.y - 260; if (Math.hypot(p.x - cup.x, p.y - cup.y) < 40 || Math.hypot(p.x - hx, p.y - hy + 20) < 40 || (p.x > Math.min(cup.x, hx) - 14 && p.x < Math.max(cup.x, hx) + 14 && p.y > hy - 40 && p.y < cup.y)) { st.drag = { ox: p.x - cup.x, oy: p.y - cup.y }; } },
      move(p, st) { if (!st.drag) return; st.cup.x = clamp(p.x - st.drag.ox, 60, 680); st.cup.y = clamp(p.y - st.drag.oy, 300, 540); },
      up(p, st) { st.drag = false; },
      key(k, st, api) { if (k === 'Enter') { if (st.heat < 1) { st.cup = { x: LAMP.x, y: LAMP.y - 208 }; st.heat = 0.99; } else st.cup = { x: JAR.x, y: 420 }; return true; } return false; },
      test(st, api, step = 2) { st.cup = { x: LAMP.x, y: LAMP.y - 208 }; st.heat = 0.999; if (step > 1) { api.ok(2); st.cup = { x: JAR.x, y: 420 }; } },
    });
  }

  // ───────────────────────── pull11 이온 사이 끌림 재기 ─────────────────────────
  {
    const X0 = 190, PXN = 640, Y = 420;                 // 0 nm 자리, 1 nm = 640, 레일 높이
    const R = { Cl: 0.181, Na: 0.102, Mg: 0.072 };       // 이온 반지름(nm)
    const ION = { Na: { q: 1, name: '나트륨 이온', s: 'Na⁺', col: ['#b48be8', '#5d3a9a', '#f3eaff'] }, Mg: { q: 2, name: '마그네슘 이온', s: 'Mg²⁺', col: ['#f2a65a', '#9a5410', '#fff0de'] }, Cl: { q: -1, name: '염화 이온', s: 'Cl⁻', col: ['#7fcf6a', '#2f7a2a', '#e8ffe0'] } };
    const F = (k, r) => 0.2307 * Math.abs(ION[k].q) / (r * r);   // nN(진공에서 계산), 고정 이온 Cl⁻
    const rmin = (k) => R.Cl + R[k];
    const CHIP = [['Na', 620], ['Mg', 760], ['Cl', 900]];
    def('pull11', {
      init(st, api) { st.k = 'Na'; st.r = 0.9; st.drag = false; st.pts = { Na: [], Mg: [], Cl: [] }; st.at5 = {}; st.span = [9, 0]; api.say('오른쪽 <b>나트륨 이온(Na⁺)</b>을 끌어 염화 이온(Cl⁻) 쪽으로 가까이, 멀리 옮겨 보자. 힘 센서 숫자와 그래프를 본다.'); },
      draw(c, st, api) {
        const t = st.t, W = 1060, H = 700, k = st.k, I = ION[k], r = st.r, f = F(k, r), att = I.q > 0;
        c.fillStyle = D.lin(c, 0, 0, 0, H, ['#eef2f6', '#dde4ec']); c.fillRect(0, 0, W, H);
        // 레일 + nm 눈금 자
        D.shadow(c, 600, Y + 130, 460, 14, 0.2);
        c.fillStyle = D.lin(c, 0, Y + 92, 0, Y + 118, ['#e3e6ea', '#8e959e']); D.rr(c, 40, Y + 92, 990, 26, 6); c.fill();
        c.fillStyle = '#fbf6e6'; D.rr(c, X0 - 10, Y + 124, 860, 46, 4); c.fill(); c.strokeStyle = 'rgba(29,36,51,.5)'; c.lineWidth = 1.5; c.stroke();
        for (let v = 0; v <= 1.3001; v += 0.05) { const x = X0 + v * PXN, big = Math.abs(v * 10 - Math.round(v * 10)) < 1e-6; D.line(c, x, Y + 124, x, Y + 124 + (big ? 16 : 8), '#1d2433', big ? 1.6 : 1); if (big) D.txt(c, (Math.round(v * 10) / 10).toFixed(1), x, Y + 156, '#1d2433', '600 12px'); }
        D.txt(c, 'nm', X0 + 1.3 * PXN + 26, Y + 156, '#1d2433', '700 12px');
        const x5 = X0 + 0.5 * PXN; c.fillStyle = 'rgba(242,183,5,.35)'; c.fillRect(x5 - 4, Y + 124, 8, 46); D.txt(c, '0.5 nm', x5, Y + 190, '#b07a00', '800 12px');
        // 전기력선(옅게)
        const xm = X0 + r * PXN;
        for (let j = -2; j <= 2; j++) { c.strokeStyle = `rgba(90,110,160,${0.12 + (att ? 0.05 : 0)})`; c.lineWidth = 1.5; c.beginPath(); c.moveTo(X0, Y + j * 18); if (att) c.bezierCurveTo((X0 + xm) / 2, Y + j * 60, (X0 + xm) / 2, Y + j * 60, xm, Y + j * 18); else { c.bezierCurveTo(X0 + 60, Y + j * 70, X0 + 90, Y + j * 120, X0 + 40, Y + j * 160); c.moveTo(xm, Y + j * 18); c.bezierCurveTo(xm - 60, Y + j * 70, xm - 90, Y + j * 120, xm - 40, Y + j * 160); } c.stroke(); }
        // 고정된 염화 이온 + 받침(힘 센서)
        const jig = (s) => Math.sin(t * 6 + s) * 1.2;
        c.fillStyle = D.lin(c, X0 - 30, 0, X0 + 30, 0, ['#4b5466', '#2b3242']); D.rr(c, X0 - 26, Y + 40, 52, 56, 6); c.fill();
        c.fillStyle = D.lin(c, 0, Y - 276, 0, Y - 186, ['#4b5466', '#2b3242']); D.rr(c, X0 - 84, Y - 278, 168, 92, 10); c.fill();
        D.lcd(c, X0 - 70, Y - 240, 140, 40, f.toFixed(2), 'nN', { label: '힘 센서' });
        D.line(c, X0, Y - 186, X0, Y - R.Cl * PXN, '#5b626d', 4);
        D.glow(c, X0, Y + jig(1), R.Cl * PXN * 1.5, 'rgba(120,220,100,.25)'); D.ball(c, X0, Y + jig(1), R.Cl * PXN, ...ION.Cl.col); D.txt(c, 'Cl⁻', X0, Y + 12 + jig(1), '#fff', '800 34px');
        // 움직이는 이온
        const rr = R[k] * PXN; D.glow(c, xm, Y, rr * 1.6, `rgba(${k === 'Mg' ? '250,170,90' : k === 'Na' ? '190,150,240' : '120,220,100'},.3)`); D.ball(c, xm, Y + jig(2), rr, ...I.col); D.txt(c, I.s, xm, Y + rr * 0.3 + jig(2), '#fff', `800 ${Math.round(rr * 0.6)}px`);
        D.shadow(c, xm, Y + 100, rr, 6);
        // 힘 화살표(크기 ∝ 힘)
        // 힘 화살표: 각 이온이 받는 힘을 그 이온에서 그린다(작용·반작용 한 쌍, 크기 같고 방향 반대)
        const col = att ? '#c0392b' : '#1f6fb0', d = xm - X0, Lmax = att ? d / 2 - 8 : 260, L = clamp(26 + f * 34, 26, Lmax);
        // 화살표는 이온 기호 아래쪽(공 아랫부분)에 그려 기호를 덮지 않게 한다
        const farrow = (x0, ay, dir) => { const x1 = x0 + dir * L; c.save(); D.arrow(c, x0, ay, x1, ay, 'rgba(255,255,255,.95)', 12, 24); D.arrow(c, x0, ay, x1, ay, col, 6, 18); c.restore(); D.ball(c, x0, ay, 5, '#fff', col); };
        farrow(xm, Y + rr * 0.64, att ? -1 : 1); farrow(X0, Y + R.Cl * PXN * 0.68, att ? 1 : -1);
        D.tag(c, `${I.s}가 받는 힘`, xm + (att ? -L / 2 : L / 2), Y + rr * 0.64 + 26, { f: '700 13px', col, line: col });
        D.tag(c, 'Cl⁻가 받는 힘', Math.max(70, X0 + (att ? L / 2 : -L / 2)), Y + R.Cl * PXN * 0.68 + 26, { f: '700 13px', col, line: col });
        D.tag(c, att ? `서로 끌어당긴다 · ${f.toFixed(2)} nN` : `서로 밀어낸다 · ${f.toFixed(2)} nN`, clamp((X0 + xm) / 2, 430, 900), Y - 165, { f: '800 16px', bg: att ? '#fde7e3' : '#e3effa', line: col, col });
        D.lcd(c, xm - 60, Y + 222, 120, 34, r.toFixed(2), 'nm', { label: '두 이온 중심 사이 거리', lcol: '#1d2433' });
        if (Math.abs(r - rmin(k)) < 0.004) D.tag(c, '더 가까이 가지 않는다(전자 껍질끼리 밀어냄)', xm + 120, Y + 70, { f: '700 13px', bg: 'rgba(29,36,51,.85)', col: '#fff' });
        // 이온 고르기
        CHIP.forEach(([kk, x]) => { const on = kk === k, J = ION[kk]; c.fillStyle = on ? '#ffe27a' : '#fbfcf9'; D.rr(c, x - 64, 26, 128, 44, 22); c.fill(); c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.stroke(); D.ball(c, x - 40, 48, 13, ...J.col); D.txt(c, J.s, x + 10, 55, '#1d2433', '800 17px'); if (st.at5[kk]) D.txt(c, '✓', x + 50, 54, '#1f8a4c', '800 16px'); });
        D.txt(c, '움직일 이온 고르기 →', 548, 54, '#4a5366', '700 14px', 'right');
        // 그래프(오른쪽 위)
        const GX = 620, GY = 96, GW = 400, GH = 180;
        D.card(c, GX - 50, GY - 6, GW + 70, GH + 70, { bg: '#fbfcf9' });
        const g = D.axes(c, GX, GY + 26, GW - 10, GH - 30, { x0: 0.2, x1: 1.3, y0: 0, y1: 8, xt: [0.2, 0.4, 0.6, 0.8, 1.0, 1.2], yt: [0, 2, 4, 6, 8], xl: '거리(nm)', yl: '힘(nN)', fs: 11 });
        Object.entries(st.pts).forEach(([kk, P]) => { const cc = ION[kk].col[1]; P.forEach(([x, y]) => { if (y <= 8.2) D.ball(c, g.X(x), g.Y(y), 4, ION[kk].col[0], cc); }); });
        if (st.ok.includes(2)) { ['Na', 'Mg'].forEach((kk) => { c.strokeStyle = ION[kk].col[1]; c.globalAlpha = 0.5; c.lineWidth = 2; c.setLineDash([5, 4]); c.beginPath(); for (let x = rmin(kk); x <= 1.3; x += 0.01) { const y = F(kk, x); if (y > 8) continue; c.lineTo(g.X(x), g.Y(y)); } c.stroke(); c.setLineDash([]); c.globalAlpha = 1; }); }
        D.ball(c, g.X(r), g.Y(Math.min(8, f)), 7, '#ffe27a', '#b07a00');
      },
      setR(r, st, api) {
        const k = st.k; st.r = clamp(r, rmin(k), 1.3); const f = F(k, st.r);
        const P = st.pts[k]; if (!P.length || Math.abs(P[P.length - 1][0] - st.r) > 0.03) P.push([st.r, f]);
        if (k === 'Na') { st.span[0] = Math.min(st.span[0], st.r); st.span[1] = Math.max(st.span[1], st.r); if (st.span[1] - st.span[0] > 0.4 && P.length >= 5 && !st.ok.includes(2)) { api.ok(2); api.judge('up', '거리가 가까울수록 정전기적 인력이 세진다.'); api.say('가까울수록 힘이 세다! 거리가 절반이 되면 힘은 약 <b>4배</b>. 이제 위에서 <b>마그네슘 이온</b>, <b>염화 이온</b>으로 바꿔 0.5 nm에서 재 보자.'); } }
        if (Math.abs(st.r - 0.5) < 0.02 && !st.at5[k]) { st.at5[k] = 1; const row = { Na: 0, Mg: 1, Cl: 2 }[k]; api.row(row, [`${F(k, 0.5).toFixed(2)} nN`, ION[k].q > 0 ? '끌어당김' : '<b style="color:#1f6fb0">밀어냄</b>']); api.ring(X0 + 0.5 * PXN, Y, ION[k].q > 0 ? 'rgba(192,57,43,.8)' : 'rgba(31,111,176,.8)', 70);
          if (k === 'Mg') api.say('전하가 +2인 마그네슘 이온은 같은 거리에서 힘이 <b>2배</b>다. 전하가 클수록 끌어당기는 힘이 세다.');
          if (k === 'Cl') api.say('같은 음이온끼리는 <b>밀어낸다</b>. 그래서 결정 속에서는 양이온과 음이온이 번갈아 놓인다.');
          if (st.at5.Mg && st.at5.Cl) api.ok(3); }
      },
      hint(st) { const x = X0 + st.r * PXN; return { x, y: Y, dx: -1, dy: 0, dist: 260, label: '이온을 끌어 가까이' }; },
      down(p, st, api) {
        const ch = CHIP.find(([kk, x]) => Math.abs(p.x - x) < 64 && Math.abs(p.y - 48) < 24); if (ch) { st.k = ch[0]; st.r = Math.max(st.r, rmin(st.k)); api.say(`<b>${ION[st.k].name}(${ION[st.k].s})</b>을 골랐다. 끌어서 0.5 nm 표시에 맞춰 보자.`); return; }
        const xm = X0 + st.r * PXN; if (Math.abs(p.x - xm) < R[st.k] * PXN + 30 && Math.abs(p.y - Y) < 120) st.drag = { ox: p.x - xm };
      },
      move(p, st, api) { if (!st.drag) return; this.setR((p.x - st.drag.ox - X0) / PXN, st, api); },
      up(p, st) { st.drag = false; },
      key(k, st, api) { if (k === 'ArrowLeft') { this.setR(st.r - 0.05, st, api); return true; } if (k === 'ArrowRight') { this.setR(st.r + 0.05, st, api); return true; } const m = { 1: 'Na', 2: 'Mg', 3: 'Cl' }[k]; if (m) { st.k = m; st.r = Math.max(st.r, rmin(m)); return true; } return false; },
      test(st, api, step = 2) { st.k = 'Na'; [1.2, 1.0, 0.8, 0.6, 0.5, 0.4, 0.3].forEach((r) => this.setR(r, st, api)); if (step > 2) { st.k = 'Mg'; this.setR(0.5, st, api); st.k = 'Cl'; this.setR(0.5, st, api); } },
    });
  }

  // ───────────────────────── salt11 염전에서 소금 얻기 ─────────────────────────
  {
    const PAN = { x0: 70, x1: 640, y0: 420, y1: 600 }, SUN = { x0: 120, x1: 600, y: 150 }, ZM = { x: 860, y: 184, r: 124 }, CHT = { x: 700, y: 384, w: 340, h: 230 };
    const RAKE0 = { x: 160, y: 380 };
    def('salt11', {
      init(st, api) { st.p = 0; st.drag = null; st.rake = { ...RAKE0 }; st.pile = 0; st.log = [[0, 100]]; st.rowd = {}; st.W = []; for (let i = 0; i < 26; i++) st.W.push({ a: Math.random() * TAU, d: 20 + Math.random() * (ZM.r - 34), rot: Math.random() * TAU, vy: 0 }); api.say('하늘의 <b>해</b>를 오른쪽으로 끌어 날짜를 보내자. 염전의 물이 증발하면 바닷물 속 이온은 어떻게 될까?'); },
      draw(c, st, api) {
        const t = st.t, W = 1060, H = 700, p = st.p, day = Math.round(p * 20);
        c.fillStyle = D.lin(c, 0, 0, 0, 380, ['#8fc8ee', '#e3f2fb']); c.fillRect(0, 0, 700, 380);
        c.fillStyle = '#8aa6b8'; c.beginPath(); c.moveTo(0, 330); c.lineTo(120, 280); c.lineTo(230, 310); c.lineTo(330, 270); c.lineTo(470, 320); c.lineTo(560, 290); c.lineTo(700, 320); c.lineTo(700, 360); c.lineTo(0, 360); c.fill();
        c.fillStyle = D.lin(c, 0, 340, 0, 380, ['#4d93c4', '#3a7fb0']); c.fillRect(0, 344, 700, 36); c.strokeStyle = 'rgba(255,255,255,.4)'; for (let k = 0; k < 3; k++) { c.beginPath(); for (let x = 0; x < 700; x += 12) c.lineTo(x, 352 + k * 9 + Math.sin(x * 0.05 + t * 2 + k) * 1.5); c.stroke(); }
        // 해(끌기): 위치 = 날짜
        const sx = lerp(SUN.x0, SUN.x1, p), sy = SUN.y - Math.sin(p * Math.PI) * 70;
        c.strokeStyle = 'rgba(255,200,80,.5)'; c.setLineDash([6, 6]); c.lineWidth = 2; c.beginPath(); for (let k = 0; k <= 30; k++) { const q = k / 30; c.lineTo(lerp(SUN.x0, SUN.x1, q), SUN.y - Math.sin(q * Math.PI) * 70); } c.stroke(); c.setLineDash([]);
        D.glow(c, sx, sy, 110, 'rgba(255,230,140,.6)'); for (let k = 0; k < 12; k++) { const a = k / 12 * TAU + t * 0.4; D.line(c, sx + Math.cos(a) * 48, sy + Math.sin(a) * 48, sx + Math.cos(a) * 64, sy + Math.sin(a) * 64, 'rgba(255,190,60,.8)', 3); }
        D.ball(c, sx, sy, 38, '#fff2a8', '#f2a20a', '#fffbe6');
        D.tag(c, `${day}일째`, sx, sy + 66, { f: '800 15px', bg: 'rgba(29,36,51,.85)', col: '#ffe9a0' });
        // 땅·염전 판(원근)
        c.fillStyle = D.lin(c, 0, 380, 0, H, ['#c7b28d', '#a8916b']); c.fillRect(0, 380, 700, H - 380);
        const P = PAN; c.fillStyle = '#7d6a4a'; c.beginPath(); c.moveTo(P.x0 + 60, P.y0 - 6); c.lineTo(P.x1 - 60, P.y0 - 6); c.lineTo(P.x1 + 6, P.y1 + 6); c.lineTo(P.x0 - 6, P.y1 + 6); c.closePath(); c.fill();
        c.fillStyle = D.lin(c, 0, P.y0, 0, P.y1, ['#9a9183', '#7f776a']); c.beginPath(); c.moveTo(P.x0 + 60, P.y0); c.lineTo(P.x1 - 60, P.y0); c.lineTo(P.x1, P.y1); c.lineTo(P.x0, P.y1); c.closePath(); c.fill();
        const wl = 1 - ease(clamp(p / 0.9, 0, 1));
        if (wl > 0.01) { c.fillStyle = `rgba(110,170,210,${0.35 + 0.45 * wl})`; c.beginPath(); c.moveTo(P.x0 + 60, P.y0); c.lineTo(P.x1 - 60, P.y0); c.lineTo(P.x1, P.y1); c.lineTo(P.x0, P.y1); c.closePath(); c.fill(); c.fillStyle = `rgba(255,255,255,${0.35 * wl})`; for (let k = 0; k < 8; k++) { const yy = P.y0 + 18 + k * 21, sh = (Math.sin(t * 1.5 + k) * 0.5 + 0.5); c.fillRect(P.x0 + 70 + k * 6 + sh * 40, yy, 120, 2); } }
        const cry = clamp((0.11 - wl) / 0.11, 0, 1);   // 물이 처음의 약 1/10 아래로 줄어야 소금 결정이 생긴다
        for (let k = 0; k < Math.round(160 * cry); k++) { const u = hash(k, 1), v = hash(k, 2), y = lerp(P.y0 + 6, P.y1 - 6, v), half = lerp((P.x1 - P.x0) / 2 - 60, (P.x1 - P.x0) / 2, v), cx = (P.x0 + P.x1) / 2 + (u - 0.5) * 2 * half * 0.95; if (st.pile && cx < st.rake.x + 20 && st.pile > 0.98) continue; const s = 3 + hash(k, 3) * 4; c.fillStyle = `rgba(255,255,255,${0.75})`; c.fillRect(cx - s / 2, y - s / 2, s, s); c.strokeStyle = 'rgba(150,160,170,.6)'; c.lineWidth = 0.8; c.strokeRect(cx - s / 2, y - s / 2, s, s); }
        // 수증기
        if (p > 0 && p < 0.92) for (let k = 0; k < 10; k++) { const ph = (t * 0.4 + k / 10) % 1, x = P.x0 + 90 + hash(k) * 420 + Math.sin(t + k) * 8, y = P.y0 - ph * 140; c.strokeStyle = `rgba(255,255,255,${0.5 * (1 - ph)})`; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x, y); c.quadraticCurveTo(x + 8, y - 12, x, y - 24); c.stroke(); }
        // 소금 더미 + 고무래
        if (st.pile > 0) { const hh = 70 * st.pile; c.fillStyle = D.lin(c, 0, 620 - hh, 0, 620, ['#ffffff', '#dfe4ea']); c.beginPath(); c.moveTo(560, 640); c.quadraticCurveTo(610, 640 - hh * 2, 660, 640); c.fill(); for (let k = 0; k < 20; k++) { c.fillStyle = 'rgba(160,170,180,.5)'; c.fillRect(570 + hash(k, 8) * 80, 640 - hash(k, 9) * hh, 3, 3); } D.tag(c, '모은 소금', 610, 666, { f: '700 13px' }); }
        const rk = st.rake; c.lineCap = 'round'; c.strokeStyle = '#7a5434'; c.lineWidth = 7; c.beginPath(); c.moveTo(rk.x, rk.y); c.lineTo(rk.x - 90, rk.y - 120); c.stroke(); c.lineCap = 'butt';
        c.fillStyle = D.lin(c, 0, rk.y - 8, 0, rk.y + 14, ['#a87c50', '#6e4a2a']); D.rr(c, rk.x - 46, rk.y - 4, 92, 18, 4); c.fill();
        D.txt(c, '고무래', rk.x - 100, rk.y - 128, '#3b2a1c', '700 13px');
        D.tag(c, '염전(바닷물을 가둔 판)', (P.x0 + P.x1) / 2, P.y1 + 30, { f: '700 14px' });
        // 확대 원
        D.card(c, ZM.x - ZM.r - 14, ZM.y - ZM.r - 40, 2 * ZM.r + 28, 2 * ZM.r + 90, { bg: '#fbfcf9', title: '바닷물 확대' });
        c.save(); c.beginPath(); c.arc(ZM.x, ZM.y, ZM.r, 0, TAU); c.fillStyle = `rgb(${lerp(205, 236, 1 - wl)},${lerp(230, 238, 1 - wl)},${lerp(246, 240, 1 - wl)})`; c.fill(); c.clip();
        const nW = Math.round(26 * wl);
        st.W.forEach((w, i) => { if (i >= nW) return; w.rot += st.dt * 0.8; const x = ZM.x + Math.cos(w.a + t * 0.15) * w.d, y = ZM.y + Math.sin(w.a + t * 0.15) * w.d; [-0.91, 0.91].forEach((b) => D.ball(c, x + Math.cos(w.rot + b) * 9, y + Math.sin(w.rot + b) * 9, 4.5, '#ffffff', '#a9b3c2', '#ffffff')); D.ball(c, x, y, 7, '#ef6a55', '#9a2414', '#ffe0d8'); });
        const lock = ease(cry), N = 16;
        for (let i = 0; i < N; i++) { const gx = i % 4, gy = Math.floor(i / 4), lx = ZM.x - 39 + gx * 26, ly = ZM.y - 39 + gy * 26, fa = i * 2.4 + t * 0.5, fx = ZM.x + Math.cos(fa) * (40 + (i % 3) * 25), fy = ZM.y + Math.sin(fa * 1.2) * (40 + (i % 3) * 22), x = lerp(fx, lx, lock), y = lerp(fy, ly, lock); ((gx + gy) % 2 ? NA : CL)(c, x, y, (gx + gy) % 2 ? 8 : 11.5); }
        if (lock > 0.95) { c.strokeStyle = 'rgba(242,183,5,.8)'; c.lineWidth = 2; c.strokeRect(ZM.x - 54, ZM.y - 54, 108, 108); }
        c.restore(); c.strokeStyle = '#1d2433'; c.lineWidth = 3; c.beginPath(); c.arc(ZM.x, ZM.y, ZM.r, 0, TAU); c.stroke();
        D.txt(c, '입자 수는 이해를 돕기 위한 예', ZM.x, ZM.y + ZM.r + 40, '#7a8496', '600 11px'); D.txt(c, lock > 0.95 ? 'Na⁺ 8개 : Cl⁻ 8개 = 1 : 1' : nW > 6 ? '물 분자 사이에 Na⁺(보라) · Cl⁻(초록)' : '물이 줄자 이온끼리 모인다', ZM.x, ZM.y + ZM.r + 22, '#1d2433', '700 13px');
        // 그래프
        D.card(c, CHT.x, CHT.y, CHT.w, CHT.h, { bg: '#fbfcf9', title: '염전에 남은 물' });
        const g = D.axes(c, CHT.x + 54, CHT.y + 60, CHT.w - 80, CHT.h - 108, { x0: 0, x1: 20, y0: 0, y1: 100, xt: [0, 5, 10, 15, 20], yt: [0, 50, 100], xl: '날짜(일)', yl: '남은 물(%)', fs: 11 });
        c.strokeStyle = '#2f74c8'; c.lineWidth = 3; c.beginPath(); st.log.forEach(([x, y], i) => (i ? c.lineTo(g.X(x), g.Y(y)) : c.moveTo(g.X(x), g.Y(y)))); c.stroke();
        D.ball(c, g.X(p * 20), g.Y(100 * wl), 6, '#7cc0ff', '#174a8a');
        if (cry > 0) D.txt(c, `소금 결정 ${cry > 0.99 ? '가득' : '생기는 중'}`, CHT.x + CHT.w - 16, CHT.y + 24, '#b07a00', '800 13px', 'right');
      },
      setP(v, st, api) {
        st.p = clamp(v, 0, 1); const d = st.p * 20, L = st.log, wl = 1 - ease(clamp(st.p / 0.9, 0, 1)); if (d > L[L.length - 1][0] + 0.4) L.push([d, 100 * wl]);
        const fill = (r, txt) => { if (!st.rowd[r]) { st.rowd[r] = 1; api.row(r, txt); } };
        if (st.p > 0.02) fill(0, ['0일', '물 분자 사이를 이온이 따로따로 돌아다님']);
        if (wl < 0.6 && wl > 0.11 && !st.half) { st.half = 1; api.say('물이 절반 가까이 줄었지만 아직 결정은 생기지 않는다. 녹아 있는 소금이 물이 녹일 수 있는 양보다 훨씬 적기 때문이다. 계속 끌어 보자.'); }
        if (wl <= 0.11) { fill(1, [`약 ${Math.round(d)}일째`, '이온이 모여 하얀 소금 결정이 생기기 시작']); api.ok(2); }
        if (st.p >= 0.98) { fill(2, ['20일째', 'Na⁺와 Cl⁻가 1 : 1로 규칙적으로 쌓인 결정']); if (!st.judged) { api.judge('stay', '물만 증발하고 이온은 남아 1 : 1로 규칙적으로 쌓인다.'); api.say('물만 날아가고 <b>이온은 남아</b> 나트륨 이온과 염화 이온이 <b>1 : 1</b>로 규칙적으로 쌓여 소금 결정이 되었다. 이제 <b>고무래</b>로 소금을 모아 보자.'); } }
        else if (wl <= 0.11 && !st.cryTold) { st.cryTold = 1; api.say('바닷물이 처음의 <b>약 10분의 1</b>로 줄자 드디어 하얀 결정이 생긴다. 확대 원에서 이온이 모여 격자를 만든다.'); }
      },
      hint(st) { if (st.p < 0.98) { const sx = lerp(SUN.x0, SUN.x1, st.p), sy = SUN.y - Math.sin(st.p * Math.PI) * 70; return { x: sx, y: sy, dx: 1, dy: 0, dist: 200, label: '해를 끌어 날짜 보내기' }; } return null; },
      down(p, st, api) {
        const sx = lerp(SUN.x0, SUN.x1, st.p), sy = SUN.y - Math.sin(st.p * Math.PI) * 70; if (Math.hypot(p.x - sx, p.y - sy) < 60) { st.drag = 'sun'; return; }
        const rk = st.rake; if (p.x > rk.x - 110 && p.x < rk.x + 50 && p.y > rk.y - 130 && p.y < rk.y + 20) { if (st.p < 0.98) { api.say('소금은 물이 다 증발한 뒤에 모은다. 먼저 해를 끝까지 끌자.'); return; } st.drag = 'rake'; st.ro = { x: p.x - rk.x, y: p.y - rk.y }; }
      },
      move(p, st, api) {
        if (st.drag === 'sun') this.setP((p.x - SUN.x0) / (SUN.x1 - SUN.x0), st, api);
        if (st.drag === 'rake') { st.rake.x = clamp(p.x - st.ro.x, 120, 640); st.rake.y = clamp(p.y - st.ro.y, 380, 600); const k = clamp((st.rake.x - 160) / 400, 0, 1); if (k > st.pile) st.pile = k; if (st.pile > 0.95 && !st.told) { st.told = 1; api.ok(3); api.say('소금을 모았다. 바닷물 1 L에는 소금(염화 나트륨)이 약 27 g 녹아 있다(이해를 돕기 위한 예). 소금은 인류의 생존에 꼭 필요하다.'); } }
      },
      up(p, st) { st.drag = null; },
      key(k, st, api) { if (k === 'ArrowRight') { this.setP(st.p + 0.05, st, api); return true; } if (k === 'ArrowLeft') { this.setP(st.p - 0.05, st, api); return true; } if (k === 'Enter') { st.pile = 1; st.rake.x = 600; if (!st.told) { st.told = 1; api.ok(3); } return true; } return false; },
      test(st, api, v = 1, rake = 0) { for (let x = 0; x <= v + 1e-9; x += 0.05) this.setP(x, st, api); if (rake) { st.rake.x = 600; st.pile = 1; st.told = 1; api.ok(3); } },
    });
  }
  // ───────────────────────── count12 원자마다 바깥 전자 세기 ─────────────────────────
  {
    const C0 = { x: 400, y: 392 }, R2 = 106, RH = 62, d1 = R2 + RH - 46, dOO = 2 * R2 - 52;
    const pol = (a, r) => [Math.cos(a * Math.PI / 180) * r, Math.sin(a * Math.PI / 180) * r];
    const MOL = [
      { k: 'H2O', name: '물', f: 'H₂O', at: [{ s: 'O', z: 8, p: [0, -20], lone: [235, 305] }, { s: 'H', z: 1, p: pol(142, d1).map((v, i) => v + [0, -20][i]) }, { s: 'H', z: 1, p: pol(38, d1).map((v, i) => v + [0, -20][i]) }], b: [[0, 1, 1], [0, 2, 1]] },
      { k: 'O2', name: '산소', f: 'O₂', at: [{ s: 'O', z: 8, p: [-dOO / 2, 0], lone: [140, 220] }, { s: 'O', z: 8, p: [dOO / 2, 0], lone: [40, -40] }], b: [[0, 1, 2]] },
      { k: 'NH3', name: '암모니아', f: 'NH₃', at: [{ s: 'N', z: 7, p: [0, -24], lone: [270] }, { s: 'H', z: 1, p: pol(160, d1).map((v, i) => v + [0, -24][i]) }, { s: 'H', z: 1, p: pol(20, d1).map((v, i) => v + [0, -24][i]) }, { s: 'H', z: 1, p: pol(90, d1).map((v, i) => v + [0, -24][i]) }], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1]] },
      { k: 'CH4', name: '메테인', f: 'CH₄', at: [{ s: 'C', z: 6, p: [0, 0], lone: [] }, { s: 'H', z: 1, p: [d1, 0] }, { s: 'H', z: 1, p: [-d1, 0] }, { s: 'H', z: 1, p: [0, d1] }, { s: 'H', z: 1, p: [0, -d1] }], b: [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]] },
    ];
    const NOB = { 2: '헬륨', 8: '네온' }, RING0 = { x: 930, y: 610 };
    const ax = (m, i) => C0.x + MOL[m].at[i].p[0], ay = (m, i) => C0.y + MOL[m].at[i].p[1];
    const RR = (s) => (s === 'H' ? RH : R2);
    // 분자 속 전자 자리: [{x, y, owners:[원자…]}]
    function electrons(m) {
      const M = MOL[m], out = [];
      M.b.forEach(([i, j, p]) => {
        const xa = ax(m, i), ya = ay(m, i), xb = ax(m, j), yb = ay(m, j), d = Math.hypot(xb - xa, yb - ya), ux = (xb - xa) / d, uy = (yb - ya) / d, nx = -uy, ny = ux;
        const mid = (d - RR(M.at[j].s) + RR(M.at[i].s)) / 2, cx = xa + ux * mid, cy = ya + uy * mid;
        for (let q = 0; q < p; q++) { const off = p === 1 ? 0 : (q ? 15 : -15); [-1, 1].forEach((sg) => out.push({ x: cx + nx * off + (p === 1 ? nx * 8 * sg : ux * 7 * sg), y: cy + ny * off + (p === 1 ? ny * 8 * sg : uy * 7 * sg), own: [i, j], shared: true })); }
      });
      M.at.forEach((a, i) => (a.lone || []).forEach((deg) => { const r = RR(a.s), t = deg * Math.PI / 180, cx = ax(m, i) + Math.cos(t) * r, cy = ay(m, i) + Math.sin(t) * r; [-1, 1].forEach((sg) => out.push({ x: cx - Math.sin(t) * 8 * sg, y: cy + Math.cos(t) * 8 * sg, own: [i], shared: false })); }));
      return out;
    }
    def('count12', {
      init(st, api) { st.m = 0; st.done = MOL.map((M) => M.at.map(() => false)); st.cnt = null; st.ring = { ...RING0 }; st.drag = false; st.full = {}; api.say('오른쪽 아래 <b>세기 고리</b>를 끌어 원자 위에 놓자(원자를 눌러도 된다). 그 원자의 바깥 껍질에 들어 있는 전자를 하나씩 센다.'); },
      draw(c, st, api) {
        const t = st.t, W = 1060, H = 700, m = st.m, M = MOL[m];
        c.fillStyle = D.lin(c, 0, 0, W, H, ['#f6f8fb', '#e3e9f1']); c.fillRect(0, 0, W, H);
        c.strokeStyle = 'rgba(80,110,150,.07)'; c.lineWidth = 1; for (let x = 0; x < W; x += 30) D.line(c, x, 0, x, H, 'rgba(80,110,150,.07)', 1); for (let y = 0; y < H; y += 30) D.line(c, 0, y, W, y, 'rgba(80,110,150,.07)', 1);
        D.card(c, 30, 88, 740, 590, { bg: 'rgba(255,255,255,.72)', r: 18 });
        c.save(); c.globalAlpha = 0.07; D.txt(c, M.f, 400, 640, '#1f4f9a', '800 150px'); c.restore();
        D.txt(c, `${M.name} 분자 모형`, 50, 120, '#1f5f4a', '800 18px', 'left');
        [['원자핵(+)', '#e2553f', '#8f2414'], ['전자', '#4aa0f0', '#174a8a']].forEach(([nm, c1, c2], i) => { D.ball(c, 60 + i * 110, 660, 8, c1, c2); D.txt(c, nm, 74 + i * 110, 665, '#4a5366', '600 13px', 'left'); });
        c.fillStyle = 'rgba(255,216,77,.35)'; c.beginPath(); c.arc(286, 660, 10, 0, TAU); c.fill(); D.txt(c, '공유 전자쌍(두 원자가 함께 셈)', 302, 665, '#4a5366', '600 13px', 'left');
        // 분자 고르기
        MOL.forEach((Q, i) => { const x = 110 + i * 170, on = i === m, all = st.done[i].every(Boolean); c.fillStyle = on ? '#ffe27a' : '#fbfcf9'; D.rr(c, x - 74, 22, 148, 46, 23); c.fill(); c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.stroke(); D.txt(c, `${Q.name} ${Q.f}`, x - (all ? 8 : 0), 52, '#1d2433', '800 17px'); if (all) D.txt(c, '✓', x + 56, 52, '#1f8a4c', '800 17px'); });
        // 껍질(겹친 바깥 껍질)
        M.at.forEach((a, i) => { const x = ax(m, i), y = ay(m, i), r = RR(a.s), on = st.cnt && st.cnt.i === i, ok = st.done[m][i];
          c.fillStyle = a.s === 'H' ? 'rgba(200,215,235,.32)' : 'rgba(160,190,235,.25)'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
          c.strokeStyle = on ? '#f2b705' : ok ? 'rgba(31,138,76,.8)' : 'rgba(90,120,170,.7)'; c.lineWidth = on ? 5 : 2.5; c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke(); });
        M.at.forEach((a, i) => { const x = ax(m, i), y = ay(m, i);
          if (a.z > 2) { c.strokeStyle = 'rgba(90,120,170,.6)'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 34, 0, TAU); c.stroke(); [0, Math.PI].forEach((q) => E(c, x + Math.cos(q + t * 0.6) * 34, y + Math.sin(q + t * 0.6) * 34, 5.5)); }
          D.glow(c, x, y, 30, 'rgba(240,110,90,.3)'); D.ball(c, x, y, a.s === 'H' ? 15 : 19, a.s === 'H' ? '#f08c7a' : '#e2553f', '#8f2414', '#ffd6c8'); D.txt(c, `${a.z}+`, x, y + 5, '#fff', '800 13px');
          let lx = x - C0.x, ly = y - C0.y; const ll = Math.hypot(lx, ly); if (ll < 30) { lx = 0; ly = 1; } else { lx /= ll; ly /= ll; } const far = RR(a.s) + 18; D.tag(c, a.s, x + lx * far, y + ly * far + 6, { f: '800 17px', bg: 'rgba(251,252,249,.95)', line: 'rgba(29,36,51,.3)' }); });
        // 전자
        const EL = electrons(m), cnt = st.cnt;
        EL.forEach((e, j) => { const w = Math.sin(t * 2 + j) * 0.8; if (e.shared) { c.fillStyle = 'rgba(255,216,77,.22)'; c.beginPath(); c.arc(e.x, e.y, 13, 0, TAU); c.fill(); } E(c, e.x + w, e.y, 7); });
        if (cnt) { cnt.k += st.dt * 6; const mine = EL.filter((e) => e.own.includes(cnt.i)), n = Math.min(mine.length, Math.floor(cnt.k));
          const ox = ax(m, cnt.i), oy = ay(m, cnt.i); mine.slice(0, n).forEach((e, q) => { c.strokeStyle = '#f2b705'; c.lineWidth = 3; c.beginPath(); c.arc(e.x, e.y, 11, 0, TAU); c.stroke(); });
          mine.slice(0, n).forEach((e, q) => { let dx = e.x - ox, dy = e.y - oy; const L0 = Math.hypot(dx, dy) || 1; dx /= L0; dy /= L0; const sib = mine.find((f, j) => j !== q && Math.hypot(f.x - e.x, f.y - e.y) < 20); let tx = dx, ty = dy; if (sib) { const sx = e.x - sib.x, sy = e.y - sib.y, sl = Math.hypot(sx, sy) || 1; tx = dx * 0.6 + sx / sl * 0.8; ty = dy * 0.6 + sy / sl * 0.8; const tl = Math.hypot(tx, ty); tx /= tl; ty /= tl; } D.tag(c, String(q + 1), e.x + tx * 24, e.y + ty * 24, { f: '800 12px', bg: '#1d2433', col: '#ffe27a', h: 20, pad: 5 }); });
          if (n === mine.length && !cnt.fin) { cnt.fin = true; this.counted(st, api, cnt.i, mine.length); } }
        // 고리
        const rg = st.ring; c.strokeStyle = '#f2b705'; c.lineWidth = 8; c.beginPath(); c.arc(rg.x, rg.y, 34, 0, TAU); c.stroke(); c.strokeStyle = '#b07a00'; c.lineWidth = 2; c.beginPath(); c.arc(rg.x, rg.y, 39, 0, TAU); c.stroke();
        c.lineCap = 'round'; c.strokeStyle = '#7a5434'; c.lineWidth = 10; c.beginPath(); c.moveTo(rg.x + 30, rg.y + 22); c.lineTo(rg.x + 62, rg.y + 50); c.stroke(); c.lineCap = 'butt';
        if (!st.drag && rg.x === RING0.x) D.txt(c, '세기 고리', rg.x, rg.y + 66, '#1d2433', '700 14px');
        // 결과 카드
        D.card(c, 790, 96, 250, 400, { bg: '#fbfcf9', title: `${M.name} 분자 ${M.f} · 세어 본 결과` });
        const pairs = M.b.reduce((s, b) => s + b[2], 0);
        D.txt(c, `공유 전자쌍 ${pairs}개`, 806, 150, '#b07a00', '800 18px', 'left');
        M.at.forEach((a, i) => { const y = 196 + i * 58, ok = st.done[m][i], n = EL.filter((e) => e.own.includes(i)).length;
          D.ball(c, 824, y, 14, a.s === 'H' ? '#f08c7a' : '#e2553f', '#8f2414', '#ffd6c8'); D.txt(c, a.s, 824, y + 5, '#fff', '800 13px');
          D.txt(c, ok ? `바깥 전자 ${n}개` : '아직 세지 않음', 848, y - 2, ok ? '#1d2433' : '#9aa3b2', '700 16px', 'left');
          if (ok) D.txt(c, `→ ${NOB[n]}과 같은 배치`, 848, y + 20, '#1f8a4c', '700 14px', 'left'); });
      },
      counted(st, api, i, n) {
        const m = st.m, M = MOL[m], a = M.at[i]; st.done[m][i] = true;
        api.say(`<b>${a.s === 'H' ? '수소' : a.s === 'O' ? '산소' : a.s === 'N' ? '질소' : '탄소'}</b>의 바깥 껍질 전자: <b>${n}개</b> → ${NOB[n]}과 같은 전자 배치. 공유한 전자쌍은 두 원자가 <b>함께</b> 센다.`);
        if (m === 0 && a.s === 'O') api.judge('8', '자기 전자 6개 중 2개를 수소와 함께 쓰고, 수소에게서 온 2개도 함께 세어 8개.');
        if (st.done[m].every(Boolean) && !st.full[m]) { st.full[m] = 1; const pairs = M.b.reduce((s, b) => s + b[2], 0); const per = [...new Set(M.at.map((q) => q.s))].map((s) => `${s} ${s === 'H' ? 2 : 8}`).join(' · ');
          api.row(m, [`${pairs}개`, per]); if (m === 0) api.ok(2); if (Object.keys(st.full).filter((k) => +k !== 0).length >= 2) api.ok(3);
          api.say(`<b>${M.name} 분자</b>의 모든 원자가 18족과 같은 전자 배치가 되었다. ${m === 0 ? '위에서 다른 분자를 골라 더 세어 보자.' : ''}`); }
      },
      start(i, st, api) { if (st.cnt && !st.cnt.fin) return; st.cnt = { i, k: 0 }; },
      hint(st) { const i = 0; return { x: RING0.x, y: RING0.y, dx: ax(st.m, i) - RING0.x, dy: ay(st.m, i) - RING0.y, dist: Math.hypot(ax(st.m, i) - RING0.x, ay(st.m, i) - RING0.y) - 20, label: '고리를 끌어 산소 위에 놓기' }; },
      down(p, st, api) {
        const tab = MOL.findIndex((Q, i) => Math.abs(p.x - (110 + i * 170)) < 74 && Math.abs(p.y - 45) < 24); if (tab >= 0) { st.m = tab; st.cnt = null; st.ring = { ...RING0 }; api.say(`<b>${MOL[tab].name} 분자</b>. 원자마다 바깥 껍질 전자를 세어 보자.`); return; }
        if (Math.hypot(p.x - st.ring.x, p.y - st.ring.y) < 56) { st.drag = true; return; }
        const i = MOL[st.m].at.findIndex((a, j) => Math.hypot(p.x - ax(st.m, j), p.y - ay(st.m, j)) < 26); if (i >= 0) { st.ring = { x: ax(st.m, i), y: ay(st.m, i) }; this.start(i, st, api); }
      },
      move(p, st) { if (st.drag) st.ring = { x: p.x, y: p.y }; },
      up(p, st, api) { if (!st.drag) return; st.drag = false; const M = MOL[st.m]; let best = -1, bd = 70; M.at.forEach((a, j) => { const d = Math.hypot(p.x - ax(st.m, j), p.y - ay(st.m, j)); if (d < bd) { bd = d; best = j; } }); if (best >= 0) { st.ring = { x: ax(st.m, best), y: ay(st.m, best) }; this.start(best, st, api); } else st.ring = { ...RING0 }; },
      key(k, st, api) { const n = +k; if (n >= 1 && n <= MOL[st.m].at.length) { st.ring = { x: ax(st.m, n - 1), y: ay(st.m, n - 1) }; this.start(n - 1, st, api); return true; } if (k === 'Tab') { st.m = (st.m + 1) % MOL.length; st.cnt = null; return true; } return false; },
      test(st, api, m = 0, upto = 99) { st.m = m; MOL[m].at.forEach((a, i) => { if (i >= upto) return; const n = electrons(m).filter((e) => e.own.includes(i)).length; st.cnt = { i, k: 99, fin: true }; this.counted(st, api, i, n); }); st.cnt = { i: 0, k: 0 }; },
    });
  }

  // ───────────────────────── butane12 휴대용 가스 분자 조립 ─────────────────────────
  {
    const CY = 360, CX = [250, 390, 530, 670], DH = 116, BIN = { C: { x: 150, y: 625 }, H: { x: 330, y: 625 } };
    const NAME = ['메테인', '에테인', '프로페인', '뷰테인'], USE = ['도시가스(액화 천연가스)의 주성분', '천연가스에 조금 들어 있다', '액화 석유 가스(LPG)의 주성분', '휴대용 가스레인지 연료'];
    const SUBH = (n) => `<sub>${n}</sub>`;
    // 화학식을 한 글꼴로: 원소 기호는 크게, 개수는 작게 내려 쓴다
    function fml(c, parts, x, y, size, col) { c.font = `800 ${size}px ${D.FONT}`; const sub = Math.round(size * 0.62); let w = 0; parts.forEach(([s, k]) => { c.font = `800 ${size}px ${D.FONT}`; w += c.measureText(s).width; if (k > 1) { c.font = `800 ${sub}px ${D.FONT}`; w += c.measureText(String(k)).width + 1; } }); let cx = x - w / 2; parts.forEach(([s, k]) => { D.txt(c, s, cx, y, col, `800 ${size}px`, 'left'); c.font = `800 ${size}px ${D.FONT}`; cx += c.measureText(s).width; if (k > 1) { D.txt(c, String(k), cx + 1, y + size * 0.28, col, `800 ${sub}px`, 'left'); c.font = `800 ${sub}px ${D.FONT}`; cx += c.measureText(String(k)).width + 1; } }); }
    // 빈 수소 자리 목록
    function hslots(n) { const s = []; for (let i = 0; i < n; i++) { s.push(`u${i}`, `d${i}`); } if (n) { s.push('L', 'R'); } return s; }
    const hxy = (k, n) => { if (k === 'L') return [CX[0] - DH, CY]; if (k === 'R') return [CX[n - 1] + DH, CY]; const i = +k.slice(1); return [CX[i], CY + (k[0] === 'u' ? -DH : DH)]; };
    def('butane12', {
      init(st, api) { st.n = 0; st.h = new Set(); st.drag = null; st.made = {}; st.fire = 0; api.say('아래 <b>탄소(C)</b> 통에서 탄소를 끌어 첫 자리에 놓고, <b>수소(H)</b>를 끌어 빈 자리를 채우자. 막대 하나 = 공유 전자쌍 하나.'); },
      bonds(st) { return Math.max(0, st.n - 1) + st.h.size; },
      draw(c, st, api) {
        const t = st.t, W = 1060, H = 700, n = st.n;
        c.fillStyle = D.lin(c, 0, 0, 0, H, ['#f4f1e8', '#e6e0d0']); c.fillRect(0, 0, W, H);
        // 조립판
        D.card(c, 30, 130, 830, 460, { bg: '#fbfcf9', title: '분자 조립판' });
        c.strokeStyle = 'rgba(80,110,150,.08)'; c.lineWidth = 1; for (let x = 50; x < 850; x += 28) D.line(c, x, 160, x, 580, 'rgba(80,110,150,.08)', 1); for (let y = 160; y < 580; y += 28) D.line(c, 40, y, 850, y, 'rgba(80,110,150,.08)', 1);
        // 빈 자리(유령)
        const dragC = st.drag && st.drag.s === 'C', dragH = st.drag && st.drag.s === 'H';
        if (n < 4 && !dragH) { const x = CX[n]; c.strokeStyle = dragC ? '#f2b705' : 'rgba(29,36,51,.25)'; c.setLineDash([6, 5]); c.lineWidth = dragC ? 3.5 : 2; c.beginPath(); c.arc(x, CY, 30, 0, TAU); c.stroke(); c.setLineDash([]); if (!n) D.txt(c, '탄소 자리', x, CY + 52, '#7a8496', '600 13px'); }
        hslots(n).forEach((k) => { if (st.h.has(k)) return; if (k === 'R' && n < 4 && !dragH) return; if (k === 'R' && dragC) return; const [x, y] = hxy(k, n); c.strokeStyle = dragH ? '#f2b705' : 'rgba(29,36,51,.22)'; c.setLineDash([5, 5]); c.lineWidth = dragH ? 3 : 1.8; c.beginPath(); c.arc(x, y, 19, 0, TAU); c.stroke(); c.setLineDash([]); });
        // 결합(막대 + 공유 전자쌍)
        const bond = (x1, y1, x2, y2) => { const d = Math.hypot(x2 - x1, y2 - y1), ux = (x2 - x1) / d, uy = (y2 - y1) / d; c.strokeStyle = '#c9ced5'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); c.strokeStyle = '#eef1f4'; c.lineWidth = 4; c.beginPath(); c.moveTo(x1, y1 - 2); c.lineTo(x2, y2 - 2); c.stroke(); c.lineCap = 'butt'; const mx = (x1 + x2) / 2, my = (y1 + y2) / 2; c.fillStyle = 'rgba(255,216,77,.35)'; c.beginPath(); c.ellipse(mx, my, 16, 16, 0, 0, TAU); c.fill(); E(c, mx - uy * 7, my + ux * 7, 6); E(c, mx + uy * 7, my - ux * 7, 6); };
        for (let i = 1; i < n; i++) bond(CX[i - 1] + 26, CY, CX[i] - 26, CY);
        st.h.forEach((k) => { const [x, y] = hxy(k, n), i = k === 'L' ? 0 : k === 'R' ? n - 1 : +k.slice(1), cx = CX[i], d = Math.hypot(x - cx, y - CY); bond(cx + (x - cx) / d * 26, CY + (y - CY) / d * 26, x - (x - cx) / d * 16, y - (y - CY) / d * 16); });
        for (let i = 0; i < n; i++) { D.shadow(c, CX[i] + 4, CY + 30, 30, 6); D.ball(c, CX[i], CY, 28, '#5b626d', '#1d2026', '#c9ced5'); D.txt(c, 'C', CX[i], CY + 8, '#fff', '800 22px'); }
        st.h.forEach((k) => { const [x, y] = hxy(k, n); D.ball(c, x, y, 18, '#ffffff', '#a9b3c2', '#ffffff'); D.txt(c, 'H', x, y + 6, '#1d2433', '800 16px'); });
        // 통
        Object.entries(BIN).forEach(([s, b]) => { c.fillStyle = D.lin(c, 0, b.y - 40, 0, b.y + 40, ['#d9b47c', '#a7834d']); D.rr(c, b.x - 70, b.y - 34, 140, 68, 10); c.fill(); c.strokeStyle = '#6e4a22'; c.lineWidth = 2; c.stroke();
          for (let k = 0; k < 5; k++) { const x = b.x - 46 + k * 23, y = b.y - 4 + (k % 2) * 8; if (s === 'C') D.ball(c, x, y, 14, '#5b626d', '#1d2026', '#c9ced5'); else D.ball(c, x, y, 11, '#ffffff', '#a9b3c2', '#ffffff'); }
          D.txt(c, s === 'C' ? '탄소 C · 전자쌍 4개를 공유' : '수소 H · 전자쌍 1개를 공유', b.x, b.y + 56, '#3b2a1c', '700 13px'); });
        if (st.drag) { const s = st.drag.s; if (s === 'C') D.ball(c, st.drag.x, st.drag.y, 28, '#5b626d', '#1d2026', '#c9ced5'); else D.ball(c, st.drag.x, st.drag.y, 18, '#ffffff', '#a9b3c2', '#ffffff'); D.txt(c, s, st.drag.x, st.drag.y + 7, s === 'C' ? '#fff' : '#1d2433', '800 18px'); }
        // 세기 카드
        D.card(c, 880, 30, 160, 250, { bg: '#fbfcf9', title: '세어 보기' });
        const full = n > 0 && st.h.size === 2 * n + 2;
        [['탄소', `${n}개`], ['수소', `${st.h.size}개`], ['공유 전자쌍', `${this.bonds(st)}개`]].forEach(([a, b], i) => { D.txt(c, a, 896, 84 + i * 50, '#4a5366', '700 14px', 'left'); D.txt(c, b, 1024, 84 + i * 50, '#1d2433', '800 22px', 'right'); });
        if (n) fml(c, st.h.size ? [['C', n], ['H', st.h.size]] : [['C', n]], 960, 246, 26, full ? '#1f8a4c' : '#1d2433'); else D.txt(c, '—', 960, 246, '#1d2433', '800 26px'); if (full) D.txt(c, NAME[n - 1], 960, 270, '#1f8a4c', '800 15px');
        // 휴대용 가스레인지
        const sx = 960, sy = 470; D.shadow(c, sx, sy + 120, 90, 10);
        c.fillStyle = D.lin(c, 0, sy + 20, 0, sy + 116, ['#4b5466', '#2b3242']); D.rr(c, sx - 80, sy + 30, 160, 86, 10); c.fill(); c.fillStyle = '#9aa1ab'; c.fillRect(sx - 70, sy + 22, 140, 10);
        c.fillStyle = D.lin(c, sx - 76, 0, sx - 30, 0, ['#e05a3f', '#f6a28f', '#c0392b']); D.rr(c, sx - 78, sy + 40, 46, 70, 6); c.fill(); D.txt(c, '가스', sx - 55, sy + 80, '#fff', '800 12px');
        c.fillStyle = '#1d2433'; c.beginPath(); c.ellipse(sx + 18, sy + 18, 44, 10, 0, 0, TAU); c.fill(); c.strokeStyle = '#5b626d'; c.lineWidth = 3; c.beginPath(); c.ellipse(sx + 18, sy + 12, 52, 12, 0, 0, TAU); c.stroke();
        if (st.fire > 0) { st.fire = Math.min(1, st.fire + st.dt); for (let k = 0; k < 9; k++) { const fx = sx + 18 + Math.cos(k / 9 * TAU) * 34, fh = (26 + 10 * Math.sin(t * 14 + k)) * st.fire; c.fillStyle = D.lin(c, 0, sy + 10 - fh, 0, sy + 14, ['rgba(140,170,255,.1)', 'rgba(80,120,255,.9)']); c.beginPath(); c.moveTo(fx - 5, sy + 14); c.quadraticCurveTo(fx, sy + 14 - fh * 1.6, fx + 5, sy + 14); c.fill(); } D.glow(c, sx + 18, sy, 60 * st.fire, 'rgba(120,150,255,.3)'); }
        D.txt(c, '휴대용 가스레인지', sx, sy + 140, '#3b2a1c', '700 13px');
      },
      check(st, api) {
        const n = st.n; if (!n || st.h.size !== 2 * n + 2) return;
        const name = NAME[n - 1]; if (!st.made[n]) { st.made[n] = 1; api.row(n - 1, [`${n} · ${2 * n + 2}`, `${this.bonds(st)}개`]); api.spark(CX[Math.floor((n - 1) / 2)], CY, '#ffd84d', 22); }
        if (n === 1) api.ok(2);
        if (n === 4) { api.ok(3); st.fire = 0.01; api.judge('13', '탄소끼리 3개 + 탄소와 수소 사이 10개 = 공유 전자쌍 13개.'); }
        api.say(`<b>${name}(C${n > 1 ? SUBH(n) : ''}H${SUBH(2 * n + 2)})</b> 완성! 공유 전자쌍 <b>${this.bonds(st)}개</b> — ${USE[n - 1]}. ${n < 4 ? '탄소를 더 이어 붙여 보자(끝의 수소는 자동으로 떼어진다).' : '탄소는 전자쌍 4개, 수소는 1개를 공유해 모두 18족과 같은 전자 배치다.'}`);
      },
      addC(st, api) { if (st.n >= 4) { api.say('이 판에서는 탄소 4개(뷰테인)까지 만든다.'); return; } if (st.h.has('R')) { st.h.delete('R'); api.say('오른쪽 끝 수소를 떼고 탄소를 이었다.'); } st.n += 1; api.spark(CX[st.n - 1], CY, '#c9ced5', 10); if (st.n > 1 && st.h.size === 0) api.say('탄소끼리도 전자쌍 하나를 함께 쓴다. 이제 수소를 채워 보자.'); this.check(st, api); },
      addH(st, api, k) { if (!st.n) { api.say('먼저 탄소를 놓자.'); return; } const free = hslots(st.n).filter((q) => !st.h.has(q)); if (!k) k = free[0]; if (!k) return; st.h.add(k); this.check(st, api); },
      hint(st) { if (!st.n) return { x: BIN.C.x, y: BIN.C.y - 10, dx: CX[0] - BIN.C.x, dy: CY - BIN.C.y + 10, dist: Math.hypot(CX[0] - BIN.C.x, CY - BIN.C.y + 10) - 30, label: '탄소를 끌어 자리에 놓기' }; return null; },
      down(p, st, api) {
        for (const [s, b] of Object.entries(BIN)) if (Math.abs(p.x - b.x) < 72 && Math.abs(p.y - b.y) < 38) { st.drag = { s, x: p.x, y: p.y }; return; }
        const hk = [...st.h].find((k) => { const [x, y] = hxy(k, st.n); return Math.hypot(p.x - x, p.y - y) < 20; }); if (hk) { st.h.delete(hk); st.made = { ...st.made }; api.say('수소를 하나 뗐다.'); return; }
        if (st.n && Math.hypot(p.x - CX[st.n - 1], p.y - CY) < 30) { const i = st.n - 1; ['u', 'd'].forEach((q) => st.h.delete(q + i)); st.h.delete('R'); if (i === 0) st.h.delete('L'); st.n -= 1; api.say('마지막 탄소를 뗐다.'); }
      },
      move(p, st) { if (st.drag) { st.drag.x = p.x; st.drag.y = p.y; } },
      up(p, st, api) {
        const d = st.drag; if (!d) return; st.drag = null;
        if (d.s === 'C') { if (st.n < 4 && Math.hypot(p.x - CX[st.n], p.y - CY) < 60) this.addC(st, api); else if (st.n < 4) api.say('탄소는 점선 원(다음 탄소 자리)에 놓자.'); return; }
        const k = hslots(st.n).filter((q) => !st.h.has(q)).find((q) => { const [x, y] = hxy(q, st.n); return Math.hypot(p.x - x, p.y - y) < 40; }); if (k) this.addH(st, api, k); else api.say('수소는 탄소 둘레의 점선 원에 놓자.');
      },
      key(k, st, api) { if (k === 'c' || k === 'C') { this.addC(st, api); return true; } if (k === 'h' || k === 'H') { this.addH(st, api); return true; } return false; },
      test(st, api, n = 4) { while (st.n < n) { this.addC(st, api); } hslots(st.n).forEach((q) => { if (!st.h.has(q)) st.h.add(q); }); this.check(st, api); },
    });
  }

  // ───────────────────────── zoom12 물방울 속으로 확대 ─────────────────────────
  {
    const TR = { x0: 150, x1: 900, y: 650 }, W0 = 20, DEC = 7.52;          // 화면 가로 W0 mm → 10^-DEC 배
    const wmm = (z) => W0 * Math.pow(10, -DEC * z);
    const fmt = (mm) => { const u = [[1, 'mm'], [1e-3, 'μm'], [1e-6, 'nm'], [1e-9, 'pm']].find(([v]) => mm >= v * 0.999) || [1e-9, 'pm']; return [mm / u[0], u[1]]; };
    const OH = 0.0958, ANG = 104.5;                                     // nm, 도
    // 물 분자 자리(nm 단위, 화면 가운데 기준) — 고정 씨앗
    const MOLS = []; { let s = 7; const R = () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); for (let i = 0; i < 900; i++) MOLS.push({ x: (R() - 0.5) * 12, y: (R() - 0.5) * 8, a: R() * TAU, ph: R() * TAU }); }
    def('zoom12', {
      chipY: 536,
      init(st, api) { st.z = 0; st.drag = false; st.tap = [false, false]; st.rowd = {}; api.say('아래 <b>확대 손잡이</b>를 오른쪽으로 끌어 잎 위 물방울 속으로 들어가 보자. 화면 아래 눈금 막대로 크기를 잰다.'); },
      draw(c, st, api) {
        const t = st.t, W = 1060, H = 700, z = st.z, w = wmm(z), pxmm = W / w, cx = 530, cy = 320;
        c.fillStyle = '#0f1a2c'; c.fillRect(0, 0, W, H);
        // ① 잎 위 물방울(실제 크기 비율)
        const aLeaf = clamp(1 - (Math.log10(20 / w) - 0.6) / 0.5, 0, 1);
        if (aLeaf > 0) { c.save(); c.globalAlpha = aLeaf;
          const s = pxmm; c.fillStyle = D.lin(c, 0, 0, W, H, ['#4f9a3c', '#2f6f28', '#3f8a33']); c.fillRect(0, 0, W, H);
          c.strokeStyle = 'rgba(200,240,160,.35)'; c.lineWidth = Math.max(1, s * 0.25); c.beginPath(); c.moveTo(cx - 16 * s, cy + 9 * s); c.quadraticCurveTo(cx, cy + 1 * s, cx + 16 * s, cy - 9 * s); c.stroke();
          for (let k = -6; k <= 6; k++) { c.lineWidth = Math.max(0.6, s * 0.1); c.beginPath(); c.moveTo(cx + k * 2.4 * s, cy + (1 - k * 0.55) * s); c.quadraticCurveTo(cx + k * 2.4 * s + 2 * s, cy - 3 * s - k * 0.6 * s, cx + k * 2.4 * s + 3 * s, cy - 6 * s - k * 0.6 * s); c.stroke(); }
          const r = 1 * s; D.shadow(c, cx + r * 0.25, cy + r * 0.85, r * 1.1, r * 0.25, 0.35);
          const g = c.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.05, cx, cy, r); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(0.25, 'rgba(190,235,210,.55)'); g.addColorStop(0.85, 'rgba(60,140,80,.55)'); g.addColorStop(1, 'rgba(20,70,30,.8)'); c.fillStyle = g; c.beginPath(); c.ellipse(cx, cy, r, r * 0.9, 0, 0, TAU); c.fill();
          c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.ellipse(cx - r * 0.38, cy - r * 0.42, r * 0.18, r * 0.1, -0.6, 0, TAU); c.fill(); c.strokeStyle = 'rgba(230,255,240,.5)'; c.lineWidth = Math.max(1, r * 0.04); c.beginPath(); c.arc(cx, cy + r * 0.05, r * 0.82, 0.3, 1.2); c.stroke();
          D.tag(c, '잎 위의 물방울', cx + r + 70, cy - r * 0.6, { f: '800 15px', bg: 'rgba(29,36,51,.8)', col: '#fff' });
          c.restore(); }
        // ② 물 속(빛으로 보는 한계)
        const aIn = clamp((Math.log10(20 / w) - 0.6) / 0.5, 0, 1) * clamp(1 - (Math.log10(20 / w) - 5.6) / 0.6, 0, 1);
        if (aIn > 0) { c.save(); c.globalAlpha = aIn; c.fillStyle = D.lin(c, 0, 0, 0, H, ['#bfe4f6', '#7cc0e6']); c.fillRect(0, 0, W, H);
          for (let k = 0; k < 18; k++) { c.strokeStyle = `rgba(255,255,255,${0.18 + 0.1 * Math.sin(t + k)})`; c.lineWidth = 2; c.beginPath(); for (let x = 0; x <= W; x += 20) c.lineTo(x, (k * 47 + Math.sin(x * 0.01 + t * 0.8 + k) * 14) % H); c.stroke(); }
          const lim = w < 0.003; D.tag(c, lim ? '빛으로 보는 현미경은 여기까지(약 0.2 μm) — 더 들어가는 것은 상상 확대' : '물방울 속 — 아직 매끈해 보인다', 530, 90, { f: '800 16px', bg: 'rgba(29,36,51,.85)', col: '#fff' }); c.restore(); }
        // ③ 물 분자 무리
        const wn = w * 1e6, aMol = clamp((Math.log10(20 / w) - 5.6) / 0.6, 0, 1) * clamp(1 - (Math.log10(20 / w) - 7.0) / 0.25, 0, 1);
        const pxnm = W / wn;
        if (aMol > 0) { c.save(); c.globalAlpha = aMol; c.fillStyle = '#cfe8f6'; c.fillRect(0, 0, W, H);
          MOLS.forEach((m, i) => { const mx = cx + m.x * pxnm + Math.sin(t * 2 + m.ph) * 0.03 * pxnm, my = cy + m.y * pxnm + Math.cos(t * 1.7 + m.ph) * 0.03 * pxnm; if (mx < -40 || mx > W + 40 || my < -40 || my > H + 40) return; const a = m.a + Math.sin(t + m.ph) * 0.3, rO = 0.076 * pxnm, rH = 0.055 * pxnm, oh = OH * pxnm, h = ANG / 2 * Math.PI / 180;
            if (rO < 3) { c.fillStyle = '#e2553f'; c.fillRect(mx - 1, my - 1, 2, 2); return; }
            [-h, h].forEach((b) => D.ball(c, mx + Math.cos(a + b) * oh, my + Math.sin(a + b) * oh, rH, '#ffffff', '#a9b3c2', '#ffffff')); D.ball(c, mx, my, rO, '#ef6a55', '#9a2414', '#ffe0d8'); });
          D.tag(c, '물 분자들이 서로 자리를 바꾸며 움직인다', 530, 60, { f: '800 16px', bg: 'rgba(29,36,51,.85)', col: '#fff' }); c.restore(); }
        // ④ 물 분자 하나(모형)
        const aOne = clamp((Math.log10(20 / w) - 7.0) / 0.25, 0, 1);
        if (aOne > 0) { c.save(); c.globalAlpha = aOne; c.fillStyle = D.lin(c, 0, 0, 0, H, ['#e9f3fa', '#d3e6f3']); c.fillRect(0, 0, W, H);
          const oh = clamp(OH * pxnm, 60, 200), h = ANG / 2 * Math.PI / 180, ox = cx, oy = cy - 60, Hs = [-1, 1].map((sg) => [ox + Math.sin(h) * oh * sg, oy + Math.cos(h) * oh]), RO = oh * 0.72, RHh = oh * 0.48;
          [[ox, oy, RO], ...Hs.map(([x, y]) => [x, y, RHh])].forEach(([x, y, r]) => { c.fillStyle = 'rgba(150,185,230,.22)'; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.strokeStyle = 'rgba(80,110,170,.7)'; c.lineWidth = 2.5; c.stroke(); });
          c.strokeStyle = 'rgba(80,110,170,.5)'; c.lineWidth = 2; c.beginPath(); c.arc(ox, oy, RO * 0.4, 0, TAU); c.stroke(); [0, Math.PI].forEach((q) => E(c, ox + Math.cos(q + t * 0.7) * RO * 0.4, oy + Math.sin(q + t * 0.7) * RO * 0.4, 6));
          D.ball(c, ox, oy, 22, '#e2553f', '#8f2414', '#ffd6c8'); D.txt(c, '8+', ox, oy + 6, '#fff', '800 15px'); Hs.forEach(([x, y]) => { D.ball(c, x, y, 16, '#f08c7a', '#8f2414', '#ffd6c8'); D.txt(c, '1+', x, y + 5, '#fff', '800 12px'); });
          st.pp = Hs.map(([x, y], i) => { const mx = lerp(ox, x, (oh - RHh + RO) / 2 / oh), my = lerp(oy, y, (oh - RHh + RO) / 2 / oh); return [mx, my]; });
          st.pp.forEach(([mx, my], i) => { const on = st.tap[i]; c.fillStyle = on ? 'rgba(255,216,77,.55)' : 'rgba(255,216,77,.2)'; c.beginPath(); c.arc(mx, my, 22, 0, TAU); c.fill(); if (on) { c.strokeStyle = '#f2b705'; c.lineWidth = 3; c.stroke(); } const dx = Hs[i][0] - ox, dy = Hs[i][1] - oy, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L; E(c, mx + nx * 8, my + ny * 8, 7); E(c, mx - nx * 8, my - ny * 8, 7); });
          [-125, -55].forEach((deg) => { const a = deg * Math.PI / 180, x = ox + Math.cos(a) * RO, y = oy + Math.sin(a) * RO, tx = -Math.sin(a), ty = Math.cos(a); E(c, x + tx * 8, y + ty * 8, 7); E(c, x - tx * 8, y - ty * 8, 7); });
          D.line(c, ox, oy, Hs[1][0], Hs[1][1], 'rgba(29,36,51,.35)', 1.5, [4, 4]); D.tag(c, 'O–H 약 96 pm', (ox + Hs[1][0]) / 2 + 70, (oy + Hs[1][1]) / 2 - 10, { f: '700 14px' });
          c.strokeStyle = 'rgba(29,36,51,.5)'; c.lineWidth = 1.5; c.beginPath(); c.arc(ox, oy, 46, Math.PI / 2 - h, Math.PI / 2 + h); c.stroke(); D.txt(c, '104.5°', ox, oy + 66, '#1d2433', '700 14px');
          D.tag(c, st.tap[0] && st.tap[1] ? '공유 전자쌍 2개 — 물 분자는 공유 결합으로 이루어진다' : '노란 곳(공유 전자쌍)을 눌러 세어 보자', 530, 50, { f: '800 16px', bg: 'rgba(29,36,51,.85)', col: '#ffe9a0' });
          D.txt(c, '원자 껍질은 모형(크기는 실제 비율이 아님)', 1040, 600, '#4a5366', '600 12px', 'right'); c.restore(); }
        // 눈금 막대
        const target = w * 0.22, p10 = Math.pow(10, Math.floor(Math.log10(target))), nice = [1, 2, 5].map((k) => k * p10).filter((v) => v <= target).pop() || p10, [val, unit] = fmt(nice), bl = nice * pxmm;
        c.fillStyle = 'rgba(15,26,44,.75)'; D.rr(c, 30, 560, bl + 120, 44, 8); c.fill(); c.fillStyle = '#fff'; c.fillRect(46, 586, bl, 6); D.line(c, 46, 578, 46, 598, '#fff', 2); D.line(c, 46 + bl, 578, 46 + bl, 598, '#fff', 2);
        D.txt(c, `${+val.toPrecision(3)} ${unit}`, 56 + bl, 594, '#fff', '800 15px', 'left');
        // 확대 손잡이
        c.fillStyle = 'rgba(15,26,44,.82)'; D.rr(c, 20, 618, 1020, 70, 12); c.fill();
        c.fillStyle = D.lin(c, TR.x0, 0, TR.x1, 0, ['#4f9a3c', '#7cc0e6', '#ef6a55']); D.rr(c, TR.x0, TR.y - 5, TR.x1 - TR.x0, 10, 5); c.fill();
        [['물방울', 0], ['물 속', 0.35], ['분자 무리', 0.82], ['분자 하나', 1]].forEach(([s, k]) => { const x = lerp(TR.x0, TR.x1, k); D.line(c, x, TR.y - 12, x, TR.y + 12, 'rgba(255,255,255,.6)', 2); D.txt(c, s, x, TR.y + 30, '#cfd7ef', '700 13px'); });
        const kx = lerp(TR.x0, TR.x1, z); D.ball(c, kx, TR.y, 17, '#ffe27a', '#b07a00', '#fffbe6'); D.txt(c, '확대', 80, TR.y + 6, '#fff', '800 16px');
        const [wv, wu] = fmt(w); D.txt(c, `화면 가로 약 ${+wv.toPrecision(2)} ${wu}`, 1030, TR.y - 14, '#cfd7ef', '700 13px', 'right');
      },
      setZ(v, st, api) {
        st.z = clamp(v, 0, 1); const w = wmm(st.z);
        const fill = (r, cells) => { if (!st.rowd[r]) { st.rowd[r] = 1; api.row(r, cells); } };
        if (st.z > 0.02) fill(0, ['지름 약 2 mm', '수많은 물 분자가 모여 있다']);
        if (w < 1.2e-5) { fill(1, ['분자 하나 약 0.3 nm', '분자들이 서로 자리를 바꾸며 움직인다']); api.judge('mol', '물은 물 분자가 모여 이루어진 공유 결합 물질이다.'); }
        if (st.z >= 0.99) { api.ok(2); if (!st.told) { st.told = 1; api.say('물 분자 하나까지 왔다. 산소 원자 1개와 수소 원자 2개 — 노란 곳의 <b>공유 전자쌍</b>을 눌러 세어 보자.'); } }
        else if (w < 1.2e-5 && !st.told2) { st.told2 = 1; api.say('물 분자가 보인다! 물방울은 따로따로 움직이는 <b>물 분자</b>가 수없이 모인 것이다. 끝까지 더 끌어 보자.'); }
      },
      hint(st) { const x = lerp(TR.x0, TR.x1, st.z); return { x, y: TR.y, dx: 1, dy: 0, dist: 260, label: '손잡이를 끌어 확대하기' }; },
      down(p, st, api) {
        if (st.z >= 0.99 && st.pp) { const i = st.pp.findIndex(([x, y]) => Math.hypot(p.x - x, p.y - y) < 30); if (i >= 0) { this.tapPair(i, st, api); return; } }
        if (p.y > 620) { st.drag = true; this.setZ((p.x - TR.x0) / (TR.x1 - TR.x0), st, api); }
      },
      tapPair(i, st, api) { st.tap[i] = true; api.spark(st.pp[i][0], st.pp[i][1], '#ffd84d', 12); if (st.tap[0] && st.tap[1] && !st.rowd[2]) { st.rowd[2] = 1; api.row(2, ['O–H 약 96 pm', '공유 전자쌍 2개(공유 결합)']); api.ok(3); api.say('공유 전자쌍 <b>2개</b>. 산소는 수소 2개와 전자쌍을 하나씩 함께 써서 네온과, 수소는 헬륨과 같은 전자 배치가 된다.'); } },
      move(p, st, api) { if (st.drag) this.setZ((p.x - TR.x0) / (TR.x1 - TR.x0), st, api); },
      up(p, st) { st.drag = false; },
      key(k, st, api) { if (k === 'ArrowRight') { this.setZ(st.z + 0.04, st, api); return true; } if (k === 'ArrowLeft') { this.setZ(st.z - 0.04, st, api); return true; } if (k === 'Enter' && st.z >= 0.99) { this.tapPair(st.tap[0] ? 1 : 0, st, api); return true; } return false; },
      test(st, api, z = 1, taps = 0) { for (let v = 0; v <= z + 1e-9; v += 0.02) this.setZ(v, st, api); this.setZ(z, st, api); if (taps) { st.pp = st.pp || [[0, 0], [0, 0]]; this.tapPair(0, st, api); this.tapPair(1, st, api); } },
    });
  }

  // ───────────────────────── blue4 파란 이온이 움직이는 길 ─────────────────────────
  {
    const PAP = { x0: 130, x1: 890, y0: 262, y1: 428 }, MID = 510, PXMM = 8, LANE = { b: 318, v: 378 };
    const BOT = { b: { x: 190, name: '황산 구리(Ⅱ) 수용액', col: ['#5fa8f0', '#1f5fae'] }, v: { x: 400, name: '과망가니즈산 칼륨 수용액', col: ['#b06ad8', '#5a1f8a'] } };
    const PS = { x: 70, y: 30, w: 270, h: 140 }, GC = { x: 640, y: 18, w: 400, h: 200 }, ZI = { x: 950, y: 580, r: 82 };
    const V = { b: 2.0, v: 2.4 };   // mm/분(이해를 돕기 위한 예)
    def('blue4', {
      init(st, api) { st.spot = { b: null, v: null }; st.on = false; st.pol = 1; st.min = 0; st.drag = null; st.swapped = false; st.log = { b: [], v: [] }; st.rowd = {}; api.say('아래 <b>파란 용액</b>의 스포이트를 끌어 거름종이 가운데에 한 방울 떨어뜨리고, 왼쪽 위 <b>전원</b>을 켜 보자.'); },
      draw(c, st, api) {
        const t = st.t, W = 1060, H = 700;
        c.fillStyle = D.lin(c, 0, 0, W, H, ['#a77a4b', '#8c6239', '#9b7044']); c.fillRect(0, 0, W, H);
        c.strokeStyle = 'rgba(70,40,15,.18)'; c.lineWidth = 1.5; for (let i = 0; i < 16; i++) { c.beginPath(); for (let x = 0; x <= W; x += 30) c.lineTo(x, 20 + i * 45 + Math.sin(x * 0.01 + i) * 6); c.stroke(); }
        // 유리판 + 거름종이 + 자
        c.save(); c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 16; c.shadowOffsetY = 5; c.fillStyle = 'rgba(225,240,248,.9)'; D.rr(c, 90, 228, 840, 270, 10); c.fill(); c.restore();
        c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(100, 236, 820, 6);
        c.fillStyle = D.lin(c, 0, PAP.y0, 0, PAP.y1, ['#eef2f4', '#dfe7ec']); c.fillRect(PAP.x0, PAP.y0, PAP.x1 - PAP.x0, PAP.y1 - PAP.y0);
        for (let k = 0; k < 220; k++) { c.fillStyle = 'rgba(150,170,185,.18)'; c.fillRect(PAP.x0 + hash(k) * (PAP.x1 - PAP.x0), PAP.y0 + hash(k, 3) * (PAP.y1 - PAP.y0), 2, 2); }
        D.txt(c, '질산 칼륨 수용액을 적신 거름종이', MID, PAP.y0 - 10, '#1d2433', '700 13px');
        c.fillStyle = '#fbf6e6'; c.fillRect(PAP.x0, 444, PAP.x1 - PAP.x0, 40); c.strokeStyle = 'rgba(29,36,51,.5)'; c.strokeRect(PAP.x0, 444, PAP.x1 - PAP.x0, 40);
        for (let mm = -45; mm <= 45; mm++) { const x = MID + mm * PXMM; if (x < PAP.x0 || x > PAP.x1) continue; const big = mm % 10 === 0, mid5 = mm % 5 === 0; D.line(c, x, 444, x, 444 + (big ? 16 : mid5 ? 11 : 6), '#1d2433', big ? 1.6 : 1); if (big) D.txt(c, `${mm}`, x, 478, '#1d2433', '600 11px'); }
        D.txt(c, 'mm', PAP.x1 - 14, 478, '#1d2433', '700 11px');
        // 전극(집게): 왼쪽 극성 = pol
        const sgn = (left) => (left ? st.pol : -st.pol) > 0 ? '+' : '−';
        [[PAP.x0 + 14, true], [PAP.x1 - 14, false]].forEach(([x, left]) => { D.clip(c, x, 345, left ? Math.PI : 0, sgn(left) === '+' ? '#c0392b' : '#2b3242'); D.tag(c, `(${sgn(left)})극`, x + (left ? -10 : 10), 300, { f: '800 16px', bg: sgn(left) === '+' ? '#fde7e3' : '#e3effa', line: sgn(left) === '+' ? '#c0392b' : '#2b3242', col: sgn(left) === '+' ? '#c0392b' : '#1f4f9a' }); });
        // 전원 장치
        c.fillStyle = D.lin(c, 0, PS.y, 0, PS.y + PS.h, ['#e9ece4', '#c9cec4']); D.rr(c, PS.x, PS.y, PS.w, PS.h, 12); c.fill(); c.strokeStyle = '#2b3242'; c.lineWidth = 3; c.stroke();
        D.txt(c, '전원 장치', PS.x + 16, PS.y + 26, '#1d2433', '800 15px', 'left');
        D.lcd(c, PS.x + 18, PS.y + 44, 110, 40, st.on ? '9.0' : '0.0', 'V', { on: st.on });
        c.fillStyle = st.on ? '#2f9a5a' : '#8a929d'; D.rr(c, PS.x + 150, PS.y + 40, 100, 44, 22); c.fill(); D.ball(c, st.on ? PS.x + 228 : PS.x + 172, PS.y + 62, 18, '#fbfcf9', '#9aa1ab'); D.txt(c, st.on ? '켜짐' : '꺼짐', PS.x + 200, PS.y + 104, st.on ? '#1f8a4c' : '#4a5366', '800 14px');
        c.fillStyle = '#fbfcf9'; D.rr(c, PS.x + 18, PS.y + 96, 110, 32, 8); c.fill(); c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.stroke(); D.txt(c, '⇄ 극 바꾸기', PS.x + 73, PS.y + 118, '#1d2433', '800 14px');
        D.wire(c, [[PS.x + 60, PS.y + PS.h], [PS.x + 60, 200], [80, 200], [80, 345], [PAP.x0 - 36, 345]], st.pol > 0 ? '#c0392b' : '#2b3242', 5);
        D.wire(c, [[PS.x + 230, PS.y + PS.h], [PS.x + 230, 200], [950, 200], [950, 345], [PAP.x1 + 36, 345]], st.pol > 0 ? '#2b3242' : '#c0392b', 5);
        // 시간 흐름 · 무늬 움직임
        if (st.on) { st.min += st.dt; ['b', 'v'].forEach((k) => { const s = st.spot[k]; if (!s) return; const q = k === 'b' ? 2 : -1, dir = st.pol * Math.sign(q); /* pol 1: 왼쪽 (+)극·오른쪽 (−)극 → 양이온은 오른쪽 (−)극으로 */ s.x = clamp(s.x + dir * V[k] * st.dt * PXMM, PAP.x0 + 30, PAP.x1 - 30); s.trail = Math.min(60, s.trail + st.dt * 6); s.d = s.x - s.x0; const L = st.log[k]; if (!L.length || st.min - L[L.length - 1][0] > 0.2) L.push([st.min, (s.x - MID) / PXMM]); }); this.check(st, api); }
        ['b', 'v'].forEach((k) => { const s = st.spot[k]; if (!s) return; const col = k === 'b' ? [70, 140, 230] : [150, 60, 190]; const back = Math.sign(s.x0 - s.x) || 1;
          for (let j = 6; j >= 0; j--) { const tx = s.x + back * j * s.trail / 6, a = 0.08 + 0.05 * (6 - j); c.fillStyle = `rgba(${col},${a})`; c.beginPath(); c.ellipse(tx, LANE[k], 22 - j, 18 - j * 0.8, 0, 0, TAU); c.fill(); }
          const g = c.createRadialGradient(s.x, LANE[k], 2, s.x, LANE[k], 24); g.addColorStop(0, `rgba(${col},.95)`); g.addColorStop(0.7, `rgba(${col},.6)`); g.addColorStop(1, `rgba(${col},0)`); c.fillStyle = g; c.beginPath(); c.ellipse(s.x, LANE[k], 26, 22, 0, 0, TAU); c.fill(); });
        // 병과 스포이트
        Object.entries(BOT).forEach(([k, b]) => { const y = 600; D.shadow(c, b.x, y + 62, 46, 8);
          c.fillStyle = D.lin(c, b.x - 40, 0, b.x + 40, 0, ['rgba(210,225,235,.6)', 'rgba(245,250,252,.85)', 'rgba(210,225,235,.6)']); D.rr(c, b.x - 40, y - 40, 80, 100, 10); c.fill(); c.fillStyle = D.lin(c, 0, y - 10, 0, y + 58, [b.col[0], b.col[1]]); D.rr(c, b.x - 36, y - 6, 72, 62, [2, 2, 8, 8]); c.fill(); c.strokeStyle = 'rgba(70,95,115,.7)'; c.lineWidth = 2; D.rr(c, b.x - 40, y - 40, 80, 100, 10); c.stroke();
          const used = st.spot[k] || (st.drag && st.drag.k === k); if (!used) { c.fillStyle = '#3b4254'; D.rr(c, b.x - 12, y - 92, 24, 36, 8); c.fill(); c.fillStyle = 'rgba(230,240,248,.85)'; c.fillRect(b.x - 5, y - 58, 10, 50); c.fillStyle = `rgba(${k === 'b' ? '70,140,230' : '150,60,190'},.85)`; c.fillRect(b.x - 4, y - 30, 8, 22); }
          D.txt(c, b.name, b.x, y + 84, '#fbf3e3', '700 13px'); });
        if (st.drag) { const k = st.drag.k, x = st.drag.x, y = st.drag.y; c.fillStyle = '#3b4254'; D.rr(c, x - 12, y - 92, 24, 36, 8); c.fill(); c.fillStyle = 'rgba(230,240,248,.9)'; c.fillRect(x - 5, y - 58, 10, 54); c.fillStyle = `rgba(${k === 'b' ? '70,140,230' : '150,60,190'},.9)`; c.fillRect(x - 4, y - 30, 8, 24); D.ball(c, x, y + 4, 5, k === 'b' ? '#5fa8f0' : '#b06ad8', '#1d2433'); }
        // 그래프
        D.card(c, GC.x, GC.y, GC.w, GC.h, { bg: '#fbfcf9', title: '무늬의 자리' });
        const g = D.axes(c, GC.x + 54, GC.y + 54, GC.w - 80, GC.h - 100, { x0: 0, x1: 20, y0: -40, y1: 40, xt: [0, 5, 10, 15, 20], yt: [-40, 0, 40], xl: '시간(분)', yl: '가운데에서(mm)', fs: 11 });
        [['b', '#2f74c8'], ['v', '#8a3fb8']].forEach(([k, col]) => { const L = st.log[k]; if (L.length < 2) return; c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); L.forEach(([x, y], i) => { if (x > 20) return; i ? c.lineTo(g.X(x), g.Y(y)) : c.moveTo(g.X(x), g.Y(y)); }); c.stroke(); });
        D.txt(c, `지난 시간 ${st.min.toFixed(1)}분`, GC.x + GC.w - 14, GC.y + 24, '#1d2433', '700 13px', 'right');
        // 확대 원
        c.save(); c.beginPath(); c.arc(ZI.x, ZI.y, ZI.r, 0, TAU); c.fillStyle = '#e3eef6'; c.fill(); c.clip();
        for (let k = 0; k < 6; k++) { const ph = (t * (st.on ? 0.25 : 0.05) + k / 6) % 1, dir = st.on ? st.pol : 0, x = ZI.x + (k % 2 ? 1 : -1) * 10 + dir * (ph - 0.5) * 120, y = ZI.y - 50 + k * 20; if (!st.spot.b) continue; D.ball(c, x, y, 9, '#5fa8f0', '#1f5fae', '#e0f0ff'); D.txt(c, '2+', x, y + 4, '#fff', '800 9px'); const x2 = ZI.x - dir * (ph - 0.5) * 120 + (k % 2 ? -14 : 14); D.ball(c, x2, y + 8, 10, '#e8ecf0', '#8a929d', '#ffffff'); D.txt(c, '2−', x2, y + 12, '#4a5366', '800 9px'); }
        c.restore(); c.strokeStyle = '#1d2433'; c.lineWidth = 3; c.beginPath(); c.arc(ZI.x, ZI.y, ZI.r, 0, TAU); c.stroke();
        D.tag(c, '파란 Cu²⁺ · 색 없는 SO₄²⁻', ZI.x, ZI.y + ZI.r + 14, { f: '700 12px' });   // 원 아래: 위에 두면 자의 mm 를 가린다
      },
      check(st, api) {
        const b = st.spot.b, v = st.spot.v;
        if (b && Math.abs(b.d) > 6 * PXMM && !st.rowd.b) { st.rowd.b = 1; api.row(0, ['구리 이온 Cu²⁺(파랑)', '(−)극 쪽']); api.ok(2); api.judge('minus', '구리 이온은 (+)전하를 띠어 (−)극으로 끌려간다.'); api.say('파란 무늬가 <b>(−)극</b> 쪽으로 움직였다. 파란색을 띤 <b>구리 이온(Cu²⁺)</b>이 양이온이기 때문이다. 이제 보라 용액도 떨어뜨리고 극을 바꿔 보자.'); }
        if (v && Math.abs(v.d) > 6 * PXMM && !st.rowd.v) { st.rowd.v = 1; api.row(1, ['과망가니즈산 이온 MnO₄⁻(보라)', '(+)극 쪽']); api.say('보라 무늬는 <b>(+)극</b> 쪽으로 — 보라색을 띤 이온은 음이온이다.'); }
        // ③은 극을 바꾼 뒤 파란 무늬가 실제로 반대로 4 mm 넘게 움직였을 때
        if (b && st.rowd.b && st.rowd.v && st.swapX != null && !st.ok.includes(3) && (b.x - st.swapX) * st.pol > 4 * PXMM) { api.ok(3); api.say('극을 바꾸니 파란 무늬가 <b>반대쪽</b>으로 돌아간다 — 이온은 전하의 부호에 따라 끌려가는 쪽이 정해진다.'); }
      },
      hint(st) { if (!st.spot.b) return { x: BOT.b.x, y: 520, dx: MID - BOT.b.x, dy: LANE.b - 520, dist: Math.hypot(MID - BOT.b.x, LANE.b - 520) - 20, label: '스포이트를 끌어 한 방울' }; if (!st.on) return { tap: true, x: PS.x + 200, y: PS.y + 62, label: '전원 켜기' }; return null; },
      down(p, st, api) {
        if (Math.abs(p.x - (PS.x + 200)) < 56 && Math.abs(p.y - (PS.y + 62)) < 30) { this.power(st, api); return; }
        if (Math.abs(p.x - (PS.x + 73)) < 60 && Math.abs(p.y - (PS.y + 112)) < 20) { this.swap(st, api); return; }
        const k = Object.keys(BOT).find((q) => !st.spot[q] && Math.abs(p.x - BOT[q].x) < 44 && p.y > 500 && p.y < 670); if (k) st.drag = { k, x: p.x, y: p.y };
      },
      move(p, st) { if (st.drag) { st.drag.x = p.x; st.drag.y = p.y; } },
      up(p, st, api) { const d = st.drag; if (!d) return; st.drag = null; if (p.x > PAP.x0 + 40 && p.x < PAP.x1 - 40 && p.y > PAP.y0 - 30 && p.y < PAP.y1 + 30) this.drop(d.k, p.x, st, api); },
      drop(k, x, st, api) { const xx = clamp(x, MID - 60, MID + 60); st.spot[k] = { x0: xx, x: xx, trail: 0, d: 0 }; api.spark(xx, LANE[k], k === 'b' ? '#7cc0ff' : '#c48be8', 12); api.say(k === 'b' ? '파란 방울이 번졌다. 왼쪽 위 <b>전원</b>을 눌러 켜자.' : '보라 방울도 떨어뜨렸다. 전원이 켜져 있으면 곧 움직인다.'); },
      power(st, api) { st.on = !st.on; api.say(st.on ? '전원을 켰다. 무늬가 어느 쪽으로 움직이는지 지켜보자.' : '전원을 껐다. 무늬가 멈춘다.'); },
      swap(st, api) { st.pol *= -1; st.swapped = true; st.swapX = st.spot.b ? st.spot.b.x : null; api.say(st.on ? '극을 바꿨다! 이제 무늬가 어느 쪽으로 움직이는지 지켜보자.' : '극을 바꿨다. 전원을 켜고 무늬가 어느 쪽으로 움직이는지 지켜보자.'); this.check(st, api); },
      key(k, st, api) { if (k === '1' && !st.spot.b) { this.drop('b', MID, st, api); return true; } if (k === '2' && !st.spot.v) { this.drop('v', MID, st, api); return true; } if (k === ' ' || k === 'Enter') { this.power(st, api); return true; } if (k === 's' || k === 'S') { this.swap(st, api); return true; } return false; },
      test(st, api, step = 2) { this.drop('b', MID, st, api); st.on = true; if (step > 2) this.drop('v', MID, st, api); },
    });
  }

  // ───────────────────────── dose4 소금을 한 숟가락씩 ─────────────────────────
  {
    const BK = { salt: { x: 380, name: '소금물' }, sug: { x: 640, name: '설탕물' } }, BOT = 560, HW = 92, BH = 190;
    const JAR = { salt: { x: 90, name: '소금(염화 나트륨)' }, sug: { x: 200, name: '설탕' } };
    const Isalt = (m) => 8.5 * m * (1 - 0.04 * m);        // mA, 이해를 돕기 위한 예
    const GC = { x: 760, y: 30, w: 280, h: 250 }, ROWM = [0, 1, 3, 5];
    def('dose4', {
      init(st, api) { st.m = { salt: 0, sug: 0 }; st.I = { salt: 0, sug: 0 }; st.drag = null; st.fall = []; st.pts = { salt: [[0, 0]], sug: [[0, 0]] }; st.rowd = {}; api.say('왼쪽 <b>소금 통</b>에서 숟가락을 끌어 <b>소금물</b> 비커에 한 숟가락(1 g)씩 넣어 보자. 위 전류계의 바늘을 본다.'); },
      draw(c, st, api) {
        const t = st.t, W = 1060, H = 700;
        D.lab(c, W, H, BOT, { depth: 30 });
        // 전지
        const bx = 890, by = 470; c.fillStyle = D.lin(c, bx - 60, 0, bx + 60, 0, ['#2b3242', '#4b5466', '#2b3242']); D.rr(c, bx - 60, by, 120, 80, 8); c.fill(); c.fillStyle = '#f2b705'; c.fillRect(bx - 46, by + 14, 92, 52); D.txt(c, '전지 6 V', bx, by + 46, '#1d2433', '800 16px'); D.txt(c, '+', 850, by - 6, '#c0392b', '800 16px'); D.txt(c, '−', 930, by - 6, '#1d2433', '800 16px');
        // 비커 · 전극 · 전류계
        Object.entries(BK).forEach(([k, b]) => {
          const m = st.m[k]; st.I[k] = lerp(st.I[k], k === 'salt' ? Isalt(m) : 0, clamp(st.dt * 3, 0, 1));
          D.beaker(c, b.x, BOT, HW, BH, { level: 0.62, liq: ['rgba(205,228,244,.6)', 'rgba(170,205,230,.75)'] });
          // 눈금은 왼쪽 벽에(오른쪽에는 확대 원이 붙는다)
          [[0.31, '50'], [0.62, '100']].forEach(([q, s2]) => { const yy = BOT - BH * q * 0.92; D.line(c, b.x - HW + 6, yy, b.x - HW + 22, yy, 'rgba(60,80,100,.7)', 1.5); D.txt(c, s2, b.x - HW + 25, yy + 5, 'rgba(50,70,90,.85)', '600 12px', 'left'); });
          D.txt(c, 'mL', b.x - HW + 24, BOT - BH + 22, 'rgba(50,70,90,.8)', '600 12px', 'left');
          // 녹는 중 소용돌이
          const sw = st.fall.filter((f) => f.k === k && f.y > BOT - BH * 0.57); sw.forEach((f) => { const a = clamp(1 - (f.y - (BOT - BH * 0.57)) / 120, 0, 1); c.strokeStyle = `rgba(255,255,255,${0.6 * a})`; c.lineWidth = 2; c.beginPath(); c.ellipse(b.x, BOT - 50, 40 * (1 - a) + 10, 8, 0, 0, TAU); c.stroke(); });
          // 전극(흑연 막대)
          [-26, 26].forEach((dx) => { c.fillStyle = D.lin(c, b.x + dx - 6, 0, b.x + dx + 6, 0, ['#2f333a', '#6c727c', '#2f333a']); D.rr(c, b.x + dx - 6, BOT - BH - 40, 12, BH - 10, 4); c.fill(); });
          c.fillStyle = '#7a5434'; D.rr(c, b.x - 60, BOT - BH - 52, 120, 16, 5); c.fill();
          // 닫힌 회로: 전지 (+) → 전류계 → 왼쪽 전극 → 용액 → 오른쪽 전극 → 전지 (−)
          const plusX = k === 'salt' ? 862 : 872, minusX = k === 'salt' ? 918 : 908, busR = k === 'salt' ? 258 : 268, busB = k === 'salt' ? 290 : 300, by = 470;
          D.gauge(c, b.x, 150, 70, st.I[k] / 40, [0, 10, 20, 30, 40], 'mA', { label: `${b.name} 전류계` });
          D.wire(c, [[plusX, by], [plusX, busR], [b.x + 54, busR], [b.x + 54, 200]], '#c0392b', 4);
          D.wire(c, [[b.x - 54, 200], [b.x - 54, 236], [b.x - 26, 236], [b.x - 26, BOT - BH - 40]], '#c0392b', 4);
          D.wire(c, [[b.x + 26, BOT - BH - 40], [b.x + 26, busB], [minusX, busB], [minusX, by]], '#2b3242', 4);
          [[b.x - 54, 200], [b.x + 54, 200]].forEach(([x, y]) => D.ball(c, x, y, 5, '#e3e6ea', '#5b626d'));
          if (st.I[k] > 0.5) for (let q = 0; q < 3; q++) { const f = (t * 0.25 * st.I[k] / 10 + q / 3) % 1; D.glow(c, lerp(plusX, b.x + 54, f), busR, 8, 'rgba(255,220,90,.85)'); }
          D.tag(c, `${b.name} · ${m} g`, b.x, BOT + 24, { f: '800 15px' });
        });
        // 입자 확대(크게): 이온은 하나하나 떨어져 물 분자에 둘러싸여 움직이고, 설탕은 분자 그대로 흩어진다
        Object.entries(BK).forEach(([k, b]) => {
          const m = st.m[k], zx = k === 'salt' ? 480 : 748, zy = 448, zr = 80;
          D.line(c, b.x + 30, BOT - 60, zx - zr * 0.7, zy + zr * 0.5, 'rgba(29,36,51,.45)', 1.5, [4, 3]);
          c.save(); c.beginPath(); c.arc(zx, zy, zr, 0, TAU); c.fillStyle = '#e8f4fb'; c.fill(); c.clip();
          const sc = zr / 62;   // 확대 원 크기에 맞춰 입자 자리·크기를 늘린다
          for (let i = 0; i < 22; i++) { const a = i * 2.39 + t * 0.4, rr = (12 + (i * 37) % 48) * sc, wx = zx + Math.cos(a) * rr, wy = zy + Math.sin(a * 1.1) * rr * 0.9, ro = t * 0.8 + i; [-0.91, 0.91].forEach((q) => D.ball(c, wx + Math.cos(ro + q) * 7, wy + Math.sin(ro + q) * 7, 3.6, '#ffffff', '#a9b3c2', '#ffffff')); D.ball(c, wx, wy, 5.4, '#ef6a55', '#9a2414', '#ffe0d8'); }
          const n = Math.min(10, m * 2);
          for (let i = 0; i < n; i++) {
            const a = i * 2.4 + t * (0.5 + (i % 3) * 0.15), rr = (14 + ((i * 29) % 40)) * sc, x = zx + Math.cos(a) * rr, y = zy + Math.sin(a * 1.3 + i) * rr * 0.85;
            if (k === 'salt') { const na = i % 2 === 0; c.strokeStyle = 'rgba(70,120,190,.35)'; c.lineWidth = 1; c.beginPath(); c.arc(x, y, na ? 15 : 18, 0, TAU); c.stroke(); (na ? NA : CL)(c, x, y, na ? 8.5 : 11); }
            else { c.fillStyle = '#f6d27a'; c.strokeStyle = '#b07a00'; c.lineWidth = 1.2; c.beginPath(); for (let q = 0; q < 6; q++) { const aa = q / 6 * TAU + a; c.lineTo(x + Math.cos(aa) * 10, y + Math.sin(aa) * 10); } c.closePath(); c.fill(); c.stroke(); }
          }
          c.restore(); c.strokeStyle = '#1d2433'; c.lineWidth = 2.5; c.beginPath(); c.arc(zx, zy, zr, 0, TAU); c.stroke();
          D.tag(c, k === 'salt' ? 'Na⁺·Cl⁻가 따로따로' : '설탕 분자 그대로', zx, zy - zr - 10, { f: '700 13px' });
        });
        // 통 · 숟가락
        Object.entries(JAR).forEach(([k, j]) => { const y = BOT; D.shadow(c, j.x, y + 4, 44, 8);
          c.fillStyle = D.lin(c, j.x - 40, 0, j.x + 40, 0, ['rgba(210,225,235,.6)', 'rgba(250,252,253,.9)', 'rgba(210,225,235,.6)']); D.rr(c, j.x - 40, y - 110, 80, 110, 10); c.fill();
          c.fillStyle = '#fbfcf9'; D.rr(c, j.x - 36, y - 70, 72, 66, [2, 2, 8, 8]); c.fill(); for (let q = 0; q < 30; q++) { const s = k === 'salt' ? 4 : 3; c.fillStyle = 'rgba(170,180,190,.6)'; c.fillRect(j.x - 32 + hash(q, k.length) * 64, y - 66 + hash(q, 5) * 58, s, s); }
          c.strokeStyle = 'rgba(70,95,115,.7)'; c.lineWidth = 2; D.rr(c, j.x - 40, y - 110, 80, 110, 10); c.stroke(); c.fillStyle = k === 'salt' ? '#2f74c8' : '#e0a500'; D.rr(c, j.x - 42, y - 124, 84, 18, 5); c.fill();
          D.txt(c, j.name, j.x, y + 26, '#fbf3e3', '700 12px');
          if (!st.drag || st.drag.k !== k) { c.strokeStyle = '#9aa1ab'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(j.x + 10, y - 72); c.lineTo(j.x + 34, y - 150); c.stroke(); c.lineCap = 'butt'; } });
        if (st.drag) { const { x, y, k } = st.drag; c.strokeStyle = '#9aa1ab'; c.lineWidth = 5; c.lineCap = 'round'; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 30, y - 80); c.stroke(); c.lineCap = 'butt'; c.fillStyle = D.lin(c, 0, y - 8, 0, y + 8, ['#e3e6ea', '#8e959e']); c.beginPath(); c.ellipse(x, y, 20, 9, 0, 0, TAU); c.fill(); for (let q = 0; q < 7; q++) { c.fillStyle = '#ffffff'; c.fillRect(x - 12 + q * 3.5, y - 7 - (q % 3) * 2, 4, 4); } }
        st.fall = st.fall.filter((f) => { f.y += st.dt * 260; const b = BK[f.k]; if (f.y > BOT - 20) return false; const a = f.y > BOT - BH * 0.57 ? clamp(1 - (f.y - (BOT - BH * 0.57)) / 60, 0, 1) : 1; c.fillStyle = `rgba(255,255,255,${a})`; c.fillRect(f.x - 2, f.y - 2, 4, 4); return true; });
        // 그래프
        D.card(c, GC.x, GC.y, GC.w, GC.h, { bg: '#fbfcf9', title: '넣은 양과 전류' });
        const g = D.axes(c, GC.x + 50, GC.y + 60, GC.w - 74, GC.h - 110, { x0: 0, x1: 5, y0: 0, y1: 40, xt: [0, 1, 2, 3, 4, 5], yt: [0, 10, 20, 30, 40], xl: '넣은 양(g)', yl: '전류(mA)', fs: 11 });
        [['salt', '#2f74c8'], ['sug', '#e0a500']].forEach(([k, col]) => { const P = st.pts[k]; c.strokeStyle = col; c.lineWidth = 2.5; c.beginPath(); P.forEach(([x, y], i) => (i ? c.lineTo(g.X(x), g.Y(y)) : c.moveTo(g.X(x), g.Y(y)))); c.stroke(); P.forEach(([x, y]) => D.ball(c, g.X(x), g.Y(y), 5, col, '#1d2433')); });
        D.ball(c, GC.x + 150, GC.y + 26, 5, '#2f74c8', '#1d2433'); D.txt(c, '소금물', GC.x + 160, GC.y + 31, '#1d2433', '700 12px', 'left'); D.ball(c, GC.x + 215, GC.y + 26, 5, '#e0a500', '#1d2433'); D.txt(c, '설탕물', GC.x + 225, GC.y + 31, '#1d2433', '700 12px', 'left');
      },
      add(k, st, api) {
        if (st.m[k] >= 5) { api.say('5 g까지만 넣는다.'); return; }
        st.m[k] += 1; const m = st.m[k]; for (let q = 0; q < 18; q++) st.fall.push({ k, x: BK[k].x + (Math.random() - 0.5) * 40, y: BOT - BH - 30 - Math.random() * 30 });
        const I = k === 'salt' ? Isalt(m) : 0; st.pts[k].push([m, I]);
        if (!st.rowd.r0) { st.rowd.r0 = 1; api.row(0, ['0.0 mA', '0.0 mA']); }
        const ri = ROWM.indexOf(m); if (ri > 0) api.cell(ri, k === 'salt' ? 1 : 2, `${I.toFixed(1)} mA`);
        if (k === 'salt') { if (m >= 3) api.judge('up', '녹은 이온이 많을수록 전하를 옮기는 입자가 많아 전류가 커진다.'); if (m >= 5) api.ok(2);
          api.say(`소금 <b>${m} g</b> → 전류 약 <b>${I.toFixed(1)} mA</b>. ${m < 5 ? '한 숟가락 더!' : '이제 <b>설탕</b>도 설탕물 비커에 넣어 비교하자.'}`); }
        else { if (m >= 3) api.ok(3); api.say(`설탕 <b>${m} g</b> → 전류 <b>0 mA</b>. 설탕은 물에 녹아도 <b>분자</b> 그대로 흩어질 뿐 이온이 생기지 않는다.`); }
      },
      hint(st) { return st.m.salt === 0 ? { x: JAR.salt.x + 30, y: BOT - 140, dx: BK.salt.x - JAR.salt.x - 30, dy: -40, dist: BK.salt.x - JAR.salt.x - 20, label: '숟가락을 끌어 비커에 넣기' } : null; },
      down(p, st) { const k = Object.keys(JAR).find((q) => Math.abs(p.x - JAR[q].x - 10) < 50 && p.y > BOT - 170 && p.y < BOT); if (k) st.drag = { k, x: p.x, y: p.y }; },
      move(p, st) { if (st.drag) { st.drag.x = p.x; st.drag.y = p.y; } },
      up(p, st, api) { const d = st.drag; if (!d) return; st.drag = null; const k = Object.keys(BK).find((q) => Math.abs(p.x - BK[q].x) < HW + 20 && p.y > BOT - BH - 120 && p.y < BOT); if (!k) return; if (k !== d.k) { api.say(`${d.k === 'salt' ? '소금' : '설탕'}은 <b>${d.k === 'salt' ? '소금물' : '설탕물'}</b> 비커에 넣자(두 물질을 따로 비교).`); return; } this.add(k, st, api); },
      key(k, st, api) { if (k === 's' || k === 'S' || k === '1') { this.add('salt', st, api); return true; } if (k === 'u' || k === 'U' || k === '2') { this.add('sug', st, api); return true; } return false; },
      test(st, api, s = 5, u = 0) { for (let i = 0; i < s; i++) this.add('salt', st, api); for (let i = 0; i < u; i++) this.add('sug', st, api); st.I.salt = Isalt(st.m.salt); },
    });
  }
})();
