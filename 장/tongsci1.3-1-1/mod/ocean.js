/* 3-1 1차시 체험 «바다 속 수온 재기»(교과서 106쪽 그림 Ⅲ-5 해수의 층상 구조 + 참고서 125쪽).
   바다 단면(해수면 반짝임·햇빛 줄기, 깊을수록 어두운 파랑, 해저·물고기). 배에서 수온계(원통)를 끌어 내리면
   오른쪽 수온-깊이 그래프가 그려진다: 혼합층(일정) → 수온 약층(급감) → 심해층(낮고 일정).
   바람 손잡이를 끌면 물결이 커지고 혼합층이 두꺼워진다. 위도 카드로 표층 수온이 바뀌고 고위도는 층이 거의 없다.
   깊이 눈금은 비선형(위쪽을 넓게). 수온·두께는 대략값. Ocean.mount(root) → { fit, setActive }
   시험용: root._oc.depth(m) · wind(0~1) · lat('low'|'mid'|'high') */
(function () {
  'use strict';
  const MAXD = 4000;
  const DN = [[0, 0], [200, 0.3], [1000, 0.6], [4000, 1]];
  const frac = (m) => { for (let i = 1; i < DN.length; i++) if (m <= DN[i][0]) { const [a, fa] = DN[i - 1], [b, fb] = DN[i]; return fa + (m - a) / (b - a) * (fb - fa); } return 1; };
  const mOf = (f) => { for (let i = 1; i < DN.length; i++) if (f <= DN[i][1]) { const [a, fa] = DN[i - 1], [b, fb] = DN[i]; return a + (f - fa) / (fb - fa) * (b - a); } return MAXD; };
  const LAT = { low: { n: '저위도(적도 부근)', sst: 28 }, mid: { n: '중위도', sst: 18 }, high: { n: '고위도(극 부근)', sst: 2 } };
  // 혼합층 바닥(m): 바람이 셀수록 깊다 · 수온 약층 바닥 약 1000 m · 심해 약 2 ℃
  const mixBase = (w) => 40 + w * 140;
  function temp(m, lat, w) {
    const s = LAT[lat].sst, deep = 2;
    if (lat === 'high') return s - (s - 1.5) * Math.min(1, m / MAXD); // 고위도: 위아래가 거의 같다
    const mb = mixBase(w); if (m <= mb) return s;
    if (m <= 1000) { const u = (m - mb) / (1000 - mb); return deep + 2 + (s - deep - 2) * Math.pow(1 - u, 2.2); }
    return deep + 2 - 2 * Math.min(1, (m - 1000) / 3000);
  }
  console.assert(temp(10, 'low', 0) === 28 && temp(3999, 'low', 0) < 3 && Math.abs(temp(500, 'high', 0) - temp(10, 'high', 0)) < 1, 'ocean: 수온 모양');

  function mount(root) {
    const stage = root.querySelector('.oc-stage'), now = root.querySelector('.oc-now'), out = root.querySelector('.oc-out');
    const P = window.Play;
    let d = 0, maxD = 0, wind = 0.2, lat = 'mid', drag = null, t = 0, msg = '', did = { deep: false, wind: false, high: false }, w0 = 0.2;
    const G = (W, H) => { const sea = 92, bot = H - 30; return { sea, bot, yOf: (m) => sea + frac(m) * (bot - sea), sx: W * 0.33, gx0: W * 0.66, gx1: W - 22, wx0: W * 0.08, wx1: W * 0.5, wy: 30, card: (i) => [W * (0.66 + i * 0.112), 26] }; };
    const layerOf = (m) => (lat === 'high' ? '층 구분이 거의 없다' : m <= mixBase(wind) ? '혼합층' : m <= 1000 ? '수온 약층' : '심해층');
    function say(h) { if (h !== msg) { msg = h; out.innerHTML = h; } }
    function info() {
      const L = layerOf(d), tc = temp(d, lat, wind).toFixed(1), D = {
        혼합층: '햇빛을 받아 따뜻하고 바람에 뒤섞여 수온이 거의 같다',
        '수온 약층': '깊어질수록 수온이 빠르게 내려간다 — 아래가 무겁고 차가워 안정하므로 위아래 물이 잘 섞이지 않는다',
        심해층: '햇빛이 닿지 않아 차갑고 계절에 따른 변화도 거의 없다',
        '층 구분이 거의 없다': '표층부터 차가워 위아래 수온 차가 작다 — 층이 뚜렷하지 않다',
      };
      say(`<b>${LAT[lat].n}</b> · 깊이 약 ${Math.round(d)} m · 수온 약 ${tc} ℃ — <b>${L}</b>: ${D[L]}`);
      steps();
    }
    function steps() {
      const ok = []; if (did.deep) ok.push(1); if (did.wind) ok.push(2); if (did.high) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 수온계를 끌어 심해층까지 내려 보자' : st === 2 ? '② 바람 손잡이를 끌어 바람을 세게 해 보자' : st === 3 ? '③ 위 카드에서 고위도 바다를 골라 보자' : '깊이에 따른 수온으로 나눈 세 층';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    function setD(m) { d = Math.max(0, Math.min(MAXD, m)); if (d > maxD) maxD = d; if (d > 1200 && lat !== 'high') did.deep = true; info(); }
    function setW(v) { wind = Math.max(0, Math.min(1, v)); if (Math.abs(wind - w0) > 0.4) did.wind = true; info(); }
    function setLat(k) { lat = k; maxD = d; if (k === 'high') did.high = true; info(); }
    function ship(c, x, y) {
      c.save(); c.translate(x, y + Math.sin(t * 2) * 2 * (0.5 + wind)); c.rotate(Math.sin(t * 1.5) * 0.03 * (0.5 + wind * 2));
      const hull = c.createLinearGradient(0, -6, 0, 14); hull.addColorStop(0, '#e9503f'); hull.addColorStop(1, '#8a2a20');
      c.fillStyle = hull; c.beginPath(); c.moveTo(-58, -4); c.lineTo(58, -4); c.lineTo(44, 14); c.lineTo(-46, 14); c.fill();
      c.fillStyle = '#f4f1e6'; c.fillRect(-30, -24, 40, 20); c.fillStyle = '#5aa9f0'; [-24, -13, -2].forEach((u) => c.fillRect(u, -19, 7, 6));
      c.strokeStyle = '#3a3f4a'; c.lineWidth = 3; c.beginPath(); c.moveTo(30, -4); c.lineTo(42, -34); c.lineTo(52, -34); c.stroke(); c.restore();
    }
    function ctd(c, x, y) {
      const bd = c.createLinearGradient(x - 9, 0, x + 9, 0); bd.addColorStop(0, '#7d8794'); bd.addColorStop(0.45, '#eef2f6'); bd.addColorStop(1, '#5d6672');
      c.fillStyle = bd; c.beginPath(); c.roundRect(x - 9, y - 22, 18, 40, 6); c.fill();
      c.fillStyle = '#ffd84d'; c.fillRect(x - 9, y - 6, 18, 5); c.fillStyle = '#2a3560'; c.beginPath(); c.arc(x, y + 20, 4, 0, Math.PI * 2); c.fill();
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const g = G(W, H), x = g.sx;
        // 하늘과 바다(깊을수록 어두움), 햇빛 줄기
        const sk = c.createLinearGradient(0, 0, 0, g.sea); sk.addColorStop(0, lat === 'high' ? '#c9d8e6' : '#8fc8f0'); sk.addColorStop(1, lat === 'high' ? '#eaf1f6' : '#d6eefa'); c.fillStyle = sk; c.fillRect(0, 0, W * 0.6, g.sea);
        const sea = c.createLinearGradient(0, g.sea, 0, g.bot); sea.addColorStop(0, lat === 'low' ? '#2a9fd0' : lat === 'mid' ? '#2a7fb8' : '#3a6f8a'); sea.addColorStop(0.3, '#1a4f8a'); sea.addColorStop(0.6, '#0e2a5a'); sea.addColorStop(1, '#050d22');
        c.fillStyle = sea; c.fillRect(0, g.sea, W * 0.6, g.bot - g.sea);
        if (lat !== 'high') for (let i = 0; i < 5; i++) { const u = W * (0.08 + i * 0.11) + Math.sin(t * 0.4 + i) * 6; const rg = c.createLinearGradient(0, g.sea, 0, g.yOf(150)); rg.addColorStop(0, 'rgba(255,250,210,.28)'); rg.addColorStop(1, 'rgba(255,250,210,0)'); c.fillStyle = rg; c.beginPath(); c.moveTo(u, g.sea); c.lineTo(u + 14, g.sea); c.lineTo(u + 40, g.yOf(150)); c.lineTo(u + 22, g.yOf(150)); c.fill(); }
        if (lat === 'high') { c.fillStyle = '#f4f8fb'; [[0.06, 50], [0.42, 70]].forEach(([u, w]) => { c.beginPath(); c.moveTo(W * u, g.sea + 2); c.lineTo(W * u + w, g.sea + 2); c.lineTo(W * u + w - 8, g.sea - 14); c.lineTo(W * u + 10, g.sea - 18); c.fill(); }); }
        // 혼합층 표시(물결 띠)
        if (lat !== 'high') { const mb = g.yOf(mixBase(wind)); c.fillStyle = 'rgba(120,210,255,.13)'; c.fillRect(0, g.sea, W * 0.6, mb - g.sea); c.setLineDash([6, 6]); c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 1.5; [mb, g.yOf(1000)].forEach((y) => { c.beginPath(); c.moveTo(0, y); c.lineTo(W * 0.6, y); c.stroke(); }); c.setLineDash([]);
          P.txt(c, '혼합층', 40, (g.sea + mb) / 2 + 5, '#fff', '800 14px'); P.txt(c, '수온 약층', 46, (mb + g.yOf(1000)) / 2 + 5, '#fff', '800 14px'); P.txt(c, '심해층', 40, (g.yOf(1000) + g.bot) / 2 + 5, '#fff', '800 14px');
          for (let i = 0; i < 9; i++) { const yy = g.sea + 6 + ((i * 17 + t * 30 * (0.3 + wind)) % Math.max(10, mb - g.sea - 10)); const xx = W * 0.05 + ((i * 53 + t * 40 * (0.2 + wind)) % (W * 0.5)); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.5; c.beginPath(); c.arc(xx, yy, 6, 0.2, Math.PI * 1.4); c.stroke(); } }
        // 물결
        c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.moveTo(0, g.sea); for (let xx = 0; xx <= W * 0.6; xx += 6) c.lineTo(xx, g.sea + Math.sin(xx * 0.06 + t * (2 + wind * 4)) * (1.5 + wind * 6)); c.lineTo(W * 0.6, g.sea - 3); c.lineTo(0, g.sea - 3); c.fill();
        // 해저와 물고기
        c.fillStyle = '#2a2418'; c.beginPath(); c.moveTo(0, g.bot); [[0.1, -18], [0.25, -6], [0.4, -22], [0.6, -10]].forEach(([u, v]) => c.lineTo(W * u, g.bot + v)); c.lineTo(W * 0.6, H); c.lineTo(0, H); c.fill();
        [[0.12, 60, '#ffb35a'], [0.46, 140, '#7fd1ff'], [0.2, 1600, '#5a7090']].forEach(([u, m, col], i) => { const fx = W * u + Math.sin(t * 0.7 + i) * 20, fy = g.yOf(m); c.fillStyle = col; c.beginPath(); c.ellipse(fx, fy, 11, 5, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.moveTo(fx - 10, fy); c.lineTo(fx - 17, fy - 5); c.lineTo(fx - 17, fy + 5); c.fill(); });
        // 배·줄·수온계
        ship(c, x + 20, g.sea - 8); const py = g.yOf(d) + 20; c.strokeStyle = '#d8dde6'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x + 62, g.sea - 40); c.lineTo(x, Math.max(g.sea, py - 22)); c.stroke(); ctd(c, x, Math.max(g.sea + 14, py));
        if (!drag && d < 5) { const a = 0.5 + 0.5 * Math.sin(t * 4); c.strokeStyle = `rgba(255,216,77,${a})`; c.lineWidth = 3; c.beginPath(); c.arc(x, g.sea + 14, 28, 0, Math.PI * 2); c.stroke(); P.txt(c, '↓ 끌어 내리기', x + 34, g.sea + 40, '#ffd84d', '800 14px', 'left'); }
        // 바람 손잡이
        const wx = g.wx0 + wind * (g.wx1 - g.wx0); c.fillStyle = 'rgba(255,255,255,.7)'; c.fillRect(g.wx0, g.wy - 2, g.wx1 - g.wx0, 4);
        const kg = c.createRadialGradient(wx - 3, g.wy - 3, 1, wx, g.wy, 11); kg.addColorStop(0, '#fff7c8'); kg.addColorStop(1, '#e8a91a'); c.fillStyle = kg; c.beginPath(); c.arc(wx, g.wy, 11, 0, Math.PI * 2); c.fill();
        P.txt(c, `바람 ${wind < 0.34 ? '약함' : wind < 0.67 ? '보통' : '셈'}`, g.wx0, g.wy - 12, '#1d2433', '800 13px', 'left');
        for (let i = 0; i < 3; i++) { const yy = g.wy + 18 + i * 9, xx = (t * (60 + wind * 220) + i * 70) % (W * 0.55); c.strokeStyle = `rgba(255,255,255,${0.3 + wind * 0.6})`; c.lineWidth = 2; c.beginPath(); c.moveTo(xx, yy); c.lineTo(xx + 20 + wind * 30, yy); c.stroke(); }
        // 위도 카드
        ['low', 'mid', 'high'].forEach((k, i) => { const [cx, cy] = g.card(i); c.fillStyle = k === lat ? '#ffd84d' : '#2a3560'; c.beginPath(); c.roundRect(cx - 38, cy - 15, 76, 30, 9); c.fill(); P.txt(c, ['저위도', '중위도', '고위도'][i], cx, cy + 6, k === lat ? '#1d2433' : '#fbfcf9', '800 14px'); });
        // 그래프
        const gy0 = g.sea, gy1 = g.bot, xT = (tc) => g.gx0 + (tc + 2) / 32 * (g.gx1 - g.gx0);
        c.fillStyle = 'rgba(251,250,245,.97)'; c.beginPath(); c.roundRect(g.gx0 - 40, gy0 - 22, g.gx1 - g.gx0 + 52, gy1 - gy0 + 44, 12); c.fill();
        c.strokeStyle = '#c3cbd3'; c.lineWidth = 1; [0, 10, 20, 30].forEach((v) => { const xx = xT(v); c.beginPath(); c.moveTo(xx, gy0); c.lineTo(xx, gy1); c.stroke(); P.txt(c, `${v}`, xx, gy0 - 6, '#4a5468', '600 11px'); });
        [0, 200, 1000, 2000, 4000].forEach((m) => { const yy = g.yOf(m); P.txt(c, `${m}`, g.gx0 - 6, yy + 4, '#4a5468', '600 11px', 'right'); });
        P.txt(c, '수온(℃)', (g.gx0 + g.gx1) / 2, gy1 + 18, '#1d2433', '700 12px'); P.txt(c, '깊이(m)', g.gx0 - 6, gy0 - 6, '#1d2433', '700 11px', 'right');
        c.strokeStyle = 'rgba(29,36,51,.18)'; c.lineWidth = 3; c.beginPath(); for (let f = 0; f <= 1; f += 0.005) { const m = mOf(f), xx = xT(temp(m, lat, wind)), yy = g.yOf(m); f ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke();
        c.strokeStyle = '#2a73b8'; c.lineWidth = 3.5; c.beginPath(); for (let f = 0; f <= frac(maxD); f += 0.004) { const m = mOf(f), xx = xT(temp(m, lat, wind)), yy = g.yOf(m); f ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke();
        const px = xT(temp(d, lat, wind)), pyy = g.yOf(d); P.glow(c, px, pyy, 12, 'rgba(42,115,184,.6)'); c.fillStyle = '#2a73b8'; c.beginPath(); c.arc(px, pyy, 5, 0, Math.PI * 2); c.fill();
      },
      down(p) {
        const g = G(S.W, S.H);
        const ci = [0, 1, 2].find((i) => { const [cx, cy] = g.card(i); return Math.abs(p.x - cx) < 40 && Math.abs(p.y - cy) < 17; });
        if (ci != null) { setLat(['low', 'mid', 'high'][ci]); return; }
        if (Math.abs(p.y - g.wy) < 22 && p.x > g.wx0 - 20 && p.x < g.wx1 + 20) { drag = 'w'; w0 = wind; setW((p.x - g.wx0) / (g.wx1 - g.wx0)); return; }
        if (p.x < S.W * 0.6 && p.y > g.sea - 10) { drag = 'd'; setD(mOf((p.y - 20 - g.sea) / (g.bot - g.sea))); }
      },
      move(p, e, held) { if (!held || !drag) return; const g = G(S.W, S.H); if (drag === 'w') setW((p.x - g.wx0) / (g.wx1 - g.wx0)); else setD(mOf((p.y - 20 - g.sea) / (g.bot - g.sea))); },
      up() { drag = null; },
      key(e) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') { const f = frac(d) + (e.key === 'ArrowDown' ? 0.03 : -0.03); setD(mOf(Math.max(0, Math.min(1, f)))); return true; }
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { w0 = 0.2; setW(wind + (e.key === 'ArrowRight' ? 0.1 : -0.1)); return true; }
        const i = '123'.indexOf(e.key); if (i >= 0) { setLat(['low', 'mid', 'high'][i]); return true; } return false;
      },
    });
    root.querySelector('.oc-reset').addEventListener('click', () => { d = 0; maxD = 0; wind = 0.2; w0 = 0.2; lat = 'mid'; did = { deep: false, wind: false, high: false }; msg = ''; info(); S.kick(); });
    info();
    root._oc = { depth: (m) => { setD(m); S.kick(); return { d, t: +temp(d, lat, wind).toFixed(1), layer: layerOf(d) }; }, wind: (v) => { w0 = 0.2; setW(v); S.kick(); return mixBase(wind); }, lat: (k) => { setLat(k); S.kick(); return LAT[k].sst; } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Ocean = { mount };
})();
