/* 3-1 1차시 체험 «기상 관측 기구 띄우기»(교과서 105쪽 그림 Ⅲ-2 기권의 층상 구조 + 참고서 125쪽).
   왼쪽: 지면(마을·산)에서 우주까지 높이 기둥. 층 경계 점선과 이름, 층마다 현상 삽화(대류권 구름·비, 성층권 오존층이 자외선을 막음,
   중간권 유성, 열권 오로라). 기구(성층권 위로는 로켓 탐사체)를 끌어 올리면 오른쪽 기온-높이 그래프에 선이 그려진다.
   높이 눈금은 비선형(대류권을 넓게). 기온은 교과서 그래프에서 읽은 대략값.
   Balloon.mount(root) → { fit, setActive } · 시험용: root._bl.alt(km) */
(function () {
  'use strict';
  // 높이(km) ↔ 화면 비율(0=지면, 1=꼭대기): 대류권 30% · 성층권 25% · 중간권 20% · 열권 25%
  const KN = [[0, 0], [11, 0.3], [50, 0.55], [80, 0.75], [150, 1]];
  const frac = (km) => { for (let i = 1; i < KN.length; i++) if (km <= KN[i][0]) { const [a, fa] = KN[i - 1], [b, fb] = KN[i]; return fa + (km - a) / (b - a) * (fb - fa); } return 1; };
  const kmOf = (f) => { for (let i = 1; i < KN.length; i++) if (f <= KN[i][1]) { const [a, fa] = KN[i - 1], [b, fb] = KN[i]; return a + (f - fa) / (fb - fa) * (b - a); } return 150; };
  // 기온(℃) 대략값 — 교과서 그래프 모양: 11 km까지 하강, 50 km까지 상승, 80 km까지 하강, 위로 급상승
  const TP = [[0, 15], [11, -56], [20, -56], [50, -2], [80, -90], [100, -75], [120, -20], [150, 60]];
  const temp = (km) => { for (let i = 1; i < TP.length; i++) if (km <= TP[i][0]) { const [a, ta] = TP[i - 1], [b, tb] = TP[i]; return ta + (km - a) / (b - a) * (tb - ta); } return 60; };
  const LAY = [
    { n: '대류권', a: 0, b: 11, d: '높이 올라갈수록 기온이 내려간다 — 공기가 위아래로 뒤섞이고 구름·비 같은 <b>기상 현상</b>이 일어난다' },
    { n: '성층권', a: 11, b: 50, d: '높이 올라갈수록 기온이 오른다 — <b>오존층</b>(약 20~30 km)이 태양 자외선을 흡수해 데워진다. 공기가 섞이지 않아 안정하다' },
    { n: '중간권', a: 50, b: 80, d: '다시 기온이 내려간다 — 공기는 뒤섞이지만 수증기가 부족해 구름·비가 생기지 않는다. <b>유성</b>이 빛난다' },
    { n: '열권', a: 80, b: 150, d: '기온이 크게 오른다 — 태양 에너지를 직접 받는다. 공기가 매우 희박하고, 극지방 하늘에 <b>오로라</b>가 생긴다' },
  ];
  console.assert(Math.abs(kmOf(frac(30)) - 30) < 1e-6 && temp(11) === -56 && temp(80) === -90, 'balloon: 높이·기온 표');

  function mount(root) {
    const stage = root.querySelector('.bl-stage'), now = root.querySelector('.bl-now'), out = root.querySelector('.bl-out');
    const P = window.Play;
    let km = 0, maxKm = 0, drag = false, t = 0, msg = '', bg = null, bgKey = '';
    const G = (W, H) => { const top = 26, bot = H - 54, x0 = 70, x1 = W * 0.56; return { top, bot, x0, x1, yOf: (k) => bot - frac(k) * (bot - top), gx0: W * 0.64, gx1: W - 24 }; };
    const layOf = (k) => LAY.find((l) => k <= l.b) || LAY[3];
    function say(h) { if (h !== msg) { msg = h; out.innerHTML = h; } }
    function setKm(k) {
      km = Math.max(0, Math.min(150, k)); if (km > maxKm) maxKm = km;
      const l = layOf(km), tc = Math.round(temp(km));
      say(`<b>${l.n}</b> · 높이 약 ${Math.round(km)} km · 기온 약 ${tc} ℃ — ${l.d}`);
      steps();
    }
    function steps() {
      const ok = []; if (maxKm > 11) ok.push(1); if (maxKm > 30) ok.push(2); if (maxKm > 85) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 기구를 끌어 올려 대류권을 지나 보자' : st === 2 ? '② 오존층을 지나며 기온 그래프를 보자' : st === 3 ? '③ 로켓으로 열권까지 올라가 보자' : '기온 변화로 나눈 네 층';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    // 하늘 배경(지면·마을·산·층 색·별)은 크기가 바뀔 때만 오프스크린에 다시 그린다
    function sky(W, H, g) {
      const key = `${W}x${H}`; if (bg && bgKey === key) return bg;
      bgKey = key; bg = document.createElement('canvas'); bg.width = W * 2; bg.height = H * 2; const c = bg.getContext('2d'); c.scale(2, 2);
      const gr = c.createLinearGradient(0, g.bot, 0, g.top);
      gr.addColorStop(0, '#9fd3f5'); gr.addColorStop(0.3, '#4a8fd0'); gr.addColorStop(0.55, '#1d3f86'); gr.addColorStop(0.75, '#0d1a45'); gr.addColorStop(1, '#03040c');
      c.fillStyle = gr; c.fillRect(0, 0, W * 0.6, H);
      for (let i = 0; i < 70; i++) { const y = g.top + Math.random() * (g.yOf(60) - g.top), x = Math.random() * W * 0.58; c.fillStyle = `rgba(255,255,255,${0.3 + Math.random() * 0.6})`; c.fillRect(x, y, 1.6, 1.6); }
      // 산과 마을
      c.fillStyle = '#4f7a4a'; c.beginPath(); c.moveTo(0, g.bot); [[0.05, 0.86], [0.14, 0.8], [0.22, 0.88], [0.32, 0.79], [0.44, 0.9], [0.6, 0.84]].forEach(([u, v]) => c.lineTo(W * u, H * v)); c.lineTo(W * 0.6, g.bot); c.fill();
      c.fillStyle = '#6f9a5a'; c.fillRect(0, g.bot - 4, W * 0.6, H - g.bot + 4);
      [[0.3, '#e8d9c0', '#b84a3a'], [0.36, '#f2e6cf', '#3a5f8a'], [0.42, '#e1d2b8', '#a4573a'], [0.49, '#efe0c4', '#4a6b3a']].forEach(([u, wall, roof]) => {
        const x = W * u, y = g.bot - 4; c.fillStyle = wall; c.fillRect(x, y - 22, 26, 22); c.fillStyle = roof; c.beginPath(); c.moveTo(x - 4, y - 22); c.lineTo(x + 13, y - 34); c.lineTo(x + 30, y - 22); c.fill();
        c.fillStyle = '#5a7fa8'; c.fillRect(x + 5, y - 15, 6, 6); c.fillRect(x + 15, y - 15, 6, 6);
      });
      // 층 경계와 이름
      c.setLineDash([6, 6]); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.5;
      [11, 50, 80].forEach((k) => { const y = g.yOf(k); c.beginPath(); c.moveTo(0, y); c.lineTo(W * 0.6, y); c.stroke(); });
      c.setLineDash([]);
      LAY.forEach((l) => { const y = (g.yOf(l.a) + g.yOf(l.b)) / 2; c.fillStyle = 'rgba(8,12,30,.45)'; c.beginPath(); c.roundRect(6, y - 13, 60, 26, 8); c.fill(); P.txt(c, l.n, 36, y + 6, '#fff', '800 15px'); });
      // 높이 눈금
      [0, 11, 30, 50, 80, 100, 150].forEach((k) => { const y = g.yOf(k); P.txt(c, `${k} km`, W * 0.59, y + 4, 'rgba(255,255,255,.75)', '600 11px', 'right'); });
      // 오존층 띠
      const oy0 = g.yOf(30), oy1 = g.yOf(20); const og = c.createLinearGradient(0, oy0, 0, oy1); og.addColorStop(0, 'rgba(120,200,255,0)'); og.addColorStop(0.5, 'rgba(140,220,255,.35)'); og.addColorStop(1, 'rgba(120,200,255,0)');
      c.fillStyle = og; c.fillRect(70, oy0, W * 0.5, oy1 - oy0); P.txt(c, '오존층', W * 0.47, (oy0 + oy1) / 2 + 5, '#d8f3ff', '800 14px');
      return bg;
    }
    function cloud(c, x, y, s, dark) {
      const col = dark ? ['#8e98a8', '#5f6878'] : ['#ffffff', '#c9d6e6'];
      [[0, 0, 1], [-0.8, 0.25, 0.75], [0.85, 0.2, 0.8], [0.3, -0.45, 0.8]].forEach(([dx, dy, r]) => { const gr = c.createRadialGradient(x + dx * s - r * s * 0.3, y + dy * s - r * s * 0.4, 1, x + dx * s, y + dy * s, r * s); gr.addColorStop(0, col[0]); gr.addColorStop(1, col[1]); c.fillStyle = gr; c.beginPath(); c.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2); c.fill(); });
    }
    function balloonDraw(c, x, y) {
      if (km < 40) {
        c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y + 20); c.lineTo(x, y + 40); c.stroke();
        const gr = c.createRadialGradient(x - 7, y - 8, 2, x, y, 22); gr.addColorStop(0, '#ffffff'); gr.addColorStop(0.6, '#e9eef5'); gr.addColorStop(1, '#a9b4c4');
        c.fillStyle = gr; c.beginPath(); c.ellipse(x, y, 18 + km * 0.25, 21 + km * 0.25, 0, 0, Math.PI * 2); c.fill(); // 올라갈수록 기압이 낮아 부푼다
        c.fillStyle = '#e0503f'; c.fillRect(x - 6, y + 40, 12, 9); c.fillStyle = '#ffd84d'; c.fillRect(x - 6, y + 40, 12, 3);
      } else {
        c.save(); c.translate(x, y);
        const fl = c.createLinearGradient(0, 24, 0, 48 + Math.sin(t * 30) * 4); fl.addColorStop(0, '#fff3a0'); fl.addColorStop(0.5, '#ff9a3c'); fl.addColorStop(1, 'rgba(255,80,40,0)');
        c.fillStyle = fl; c.beginPath(); c.moveTo(-6, 22); c.lineTo(0, 50 + Math.sin(t * 30) * 4); c.lineTo(6, 22); c.fill();
        const bd = c.createLinearGradient(-9, 0, 9, 0); bd.addColorStop(0, '#9aa3b2'); bd.addColorStop(0.45, '#ffffff'); bd.addColorStop(1, '#7a8292');
        c.fillStyle = bd; c.beginPath(); c.moveTo(0, -26); c.quadraticCurveTo(10, -14, 9, 22); c.lineTo(-9, 22); c.quadraticCurveTo(-10, -14, 0, -26); c.fill();
        c.fillStyle = '#e0503f'; c.beginPath(); c.moveTo(-9, 10); c.lineTo(-16, 24); c.lineTo(-9, 22); c.fill(); c.beginPath(); c.moveTo(9, 10); c.lineTo(16, 24); c.lineTo(9, 22); c.fill();
        c.fillStyle = '#5aa9f0'; c.beginPath(); c.arc(0, -6, 3.5, 0, Math.PI * 2); c.fill(); c.restore();
      }
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const g = G(W, H), cx = W * 0.33;
        c.fillStyle = '#0f1630'; c.fillRect(0, 0, W, H);
        c.drawImage(sky(W, H, g), 0, 0, W, H);
        // 움직이는 현상: 대류권 구름·비, 성층권 자외선이 오존층에서 막힘, 중간권 유성, 열권 오로라
        const yt = g.yOf(5);
        cloud(c, W * 0.14 + Math.sin(t * 0.3) * 6, yt, 16, true); cloud(c, W * 0.45 + Math.cos(t * 0.25) * 8, g.yOf(3), 13, false);
        c.strokeStyle = 'rgba(180,210,255,.7)'; c.lineWidth = 1.4; for (let i = 0; i < 7; i++) { const x = W * 0.1 + i * 7, y = yt + 14 + ((t * 120 + i * 13) % 40); c.beginPath(); c.moveTo(x, y); c.lineTo(x - 2, y + 7); c.stroke(); }
        const oz = g.yOf(25);
        for (let i = 0; i < 3; i++) { const x = W * (0.12 + i * 0.16), p = (t * 0.6 + i * 0.33) % 1, y0 = g.top + 4, y = y0 + p * (oz - y0); c.strokeStyle = `rgba(200,120,255,${0.9 - p * 0.3})`; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x, y0); for (let k = 0; k <= 10; k++) c.lineTo(x + Math.sin(k * 1.6) * 4, y0 + (y - y0) * k / 10); c.stroke(); if (p > 0.92) P.glow(c, x, oz, 14, 'rgba(160,230,255,.8)'); }
        P.txt(c, '자외선', W * 0.12, g.top + 18, '#e3c4ff', '700 12px');
        const mp = (t * 0.5) % 1, my = g.yOf(70), mx = W * 0.5 - mp * W * 0.3; const mg = c.createLinearGradient(mx, my - mp * 12, mx + 40, my - mp * 12 - 16); mg.addColorStop(0, '#fff7c0'); mg.addColorStop(1, 'rgba(255,240,180,0)'); c.strokeStyle = mg; c.lineWidth = 2.5; c.beginPath(); c.moveTo(mx, my + mp * 12); c.lineTo(mx + 40, my + mp * 12 - 16); c.stroke();
        P.txt(c, '유성', W * 0.52, g.yOf(64), '#fff3c4', '700 12px');
        for (let i = 0; i < 16; i++) { const x = W * (0.1 + i * 0.028), a = 0.35 + 0.3 * Math.sin(t * 1.2 + i * 0.7), y0 = g.yOf(118 + Math.sin(t + i) * 6); const ag = c.createLinearGradient(0, y0, 0, y0 + 46); ag.addColorStop(0, `rgba(120,255,170,${a})`); ag.addColorStop(1, 'rgba(120,255,170,0)'); c.fillStyle = ag; c.fillRect(x, y0, 14, 46); }
        P.txt(c, '오로라', W * 0.5, g.yOf(130), '#c6ffd8', '700 12px');
        // 기구·로켓
        const by = g.yOf(km) - 10; if (km > 1) P.glow(c, cx, by, 36, 'rgba(255,216,77,.25)'); balloonDraw(c, cx, by);
        // 그래프
        const gx0 = g.gx0, gx1 = g.gx1, xT = (tc) => gx0 + (tc + 100) / 200 * (gx1 - gx0);
        c.fillStyle = 'rgba(251,250,245,.97)'; c.beginPath(); c.roundRect(gx0 - 38, g.top - 14, gx1 - gx0 + 52, g.bot - g.top + 50, 12); c.fill();
        c.strokeStyle = '#c3cbd3'; c.lineWidth = 1;
        [-100, -50, 0, 50, 100].forEach((v) => { const x = xT(v); c.beginPath(); c.moveTo(x, g.top); c.lineTo(x, g.bot); c.stroke(); P.txt(c, `${v}`, x, g.bot + 16, '#4a5468', '600 11px'); });
        [11, 50, 80].forEach((k) => { const y = g.yOf(k); c.setLineDash([4, 4]); c.beginPath(); c.moveTo(gx0, y); c.lineTo(gx1, y); c.stroke(); c.setLineDash([]); });
        LAY.forEach((l) => { const y = (g.yOf(l.a) + g.yOf(l.b)) / 2; P.txt(c, l.n, gx0 - 4, y + 4, layOf(km) === l ? '#c0392b' : '#4a5468', '800 12px', 'right'); });
        P.txt(c, '기온(℃)', (gx0 + gx1) / 2, g.bot + 32, '#1d2433', '700 12px');
        c.strokeStyle = 'rgba(29,36,51,.18)'; c.lineWidth = 3; c.beginPath(); for (let k = 0; k <= 150; k += 1) { const x = xT(temp(k)), y = g.yOf(k); k ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
        c.strokeStyle = '#e0503f'; c.lineWidth = 3.5; c.beginPath(); for (let k = 0; k <= maxKm; k += 0.5) { const x = xT(temp(k)), y = g.yOf(k); k ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
        const px = xT(temp(km)), py = g.yOf(km); P.glow(c, px, py, 12, 'rgba(224,80,63,.6)'); c.fillStyle = '#e0503f'; c.beginPath(); c.arc(px, py, 5, 0, Math.PI * 2); c.fill();
        P.txt(c, `${Math.round(km)} km · ${Math.round(temp(km))} ℃`, px + (px > (gx0 + gx1) / 2 ? -8 : 8), py - 10, '#1d2433', '800 13px', px > (gx0 + gx1) / 2 ? 'right' : 'left');
        if (!drag && km < 0.5) { const a = 0.5 + 0.5 * Math.sin(t * 4); c.strokeStyle = `rgba(255,216,77,${a})`; c.lineWidth = 3; c.beginPath(); c.arc(cx, by, 34, 0, Math.PI * 2); c.stroke(); P.txt(c, '↑ 끌어 올리기', cx + 44, by + 4, '#ffd84d', '800 14px', 'left'); }
      },
      down(p) { const g = G(S.W, S.H); if (p.x < S.W * 0.6) { drag = true; setKm(kmOf((g.bot - p.y) / (g.bot - g.top))); } },
      move(p, e, held) { if (!held || !drag) return; const g = G(S.W, S.H); setKm(kmOf((g.bot - p.y) / (g.bot - g.top))); },
      up() { drag = false; },
      key(e) { const d = { ArrowUp: 2, ArrowDown: -2 }[e.key]; if (!d) return false; setKm(km + (km > 50 ? d * 3 : d)); return true; },
    });
    root.querySelector('.bl-reset').addEventListener('click', () => { km = 0; maxKm = 0; msg = ''; setKm(0); S.kick(); });
    setKm(0);
    root._bl = { alt: (k) => { setKm(k); S.kick(); return { km, t: Math.round(temp(km)), layer: layOf(km).n } } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Balloon = { mount };
})();
