/* 3-1 3차시 체험 «지진과 화산은 어디서?»(교과서 112쪽 그림 Ⅲ-10 지진대와 화산대 + 참고서: 가장 활발한 곳은 태평양 가장자리,
   지진은 잦아도 화산은 드문 곳이 있다 — 보존형·충돌형 경계).
   태평양을 가운데 둔 세계 지도(대륙은 손으로 단순화한 경위도 다각형). 지진(빨강 점)·화산(세모)이 판 경계 근처에 깜빡이며 쌓인다
   (점 위치는 경계 근처에 흩뿌린 것 — 이해를 돕기 위한 예, 실제 분포 모양을 따름). 지도를 손가락으로 문지르면 그 아래 숨은
   판의 경계선이 드러나고, 드러난 경계마다 이름이 붙는다. 태평양 한가운데를 꾹 누르면 «불의 고리»가 빛난다.
   키보드: 엔터 다음 경계 드러내기, F 불의 고리, 0 처음부터. Quake.mount(root) → { fit, setActive } · 시험용: root._qk.reveal(0~1) · state() */
(function () {
  'use strict';
  const TAU = Math.PI * 2, LON0 = -25, LAT1 = 80, LAT0 = -66; // 지도 왼쪽 끝 경도(대서양) · 위아래 위도
  const LAND = [
    [[-168, 66], [-162, 70], [-140, 70], [-125, 70], [-95, 72], [-80, 73], [-65, 62], [-60, 55], [-55, 50], [-66, 45], [-70, 42], [-76, 35], [-81, 31], [-80, 25], [-84, 30], [-90, 29], [-97, 26], [-97, 21], [-95, 18], [-88, 15], [-83, 9], [-77, 8], [-80, 7], [-86, 12], [-92, 15], [-105, 20], [-110, 24], [-112, 30], [-115, 30], [-117, 33], [-121, 35], [-124, 40], [-124, 46], [-123, 49], [-130, 55], [-135, 58], [-145, 60], [-152, 58], [-158, 56], [-165, 54], [-160, 59], [-165, 62]],
    [[-73, 78], [-60, 82], [-30, 83], [-20, 80], [-20, 72], [-30, 68], [-40, 65], [-45, 60], [-50, 64], [-55, 70], [-65, 76]],
    [[-80, 9], [-75, 11], [-70, 12], [-62, 10], [-55, 6], [-50, 2], [-45, -2], [-35, -6], [-35, -9], [-39, -15], [-40, -22], [-48, -26], [-53, -34], [-58, -38], [-63, -41], [-65, -46], [-68, -51], [-70, -55], [-74, -52], [-73, -44], [-72, -35], [-71, -28], [-70, -18], [-76, -14], [-80, -6], [-81, -3], [-80, 1], [-78, 4]],
    [[-17, 15], [-17, 21], [-13, 28], [-9, 32], [-6, 36], [3, 37], [10, 37], [11, 33], [20, 31], [25, 32], [32, 31], [35, 28], [43, 12], [51, 12], [50, 8], [44, 0], [40, -5], [40, -15], [35, -24], [32, -29], [27, -34], [20, -35], [18, -32], [15, -27], [12, -18], [13, -10], [9, -1], [9, 4], [5, 6], [-3, 5], [-8, 4], [-13, 8], [-16, 12]],
    [[44, -25], [47, -25], [50, -15], [49, -12], [44, -17]],
    [[-9, 43], [-9, 37], [-5, 36], [3, 42], [8, 44], [12, 44], [16, 38], [18, 40], [13, 45], [19, 42], [22, 37], [26, 40], [29, 41], [36, 36], [35, 32], [43, 13], [52, 16], [58, 22], [56, 26], [50, 30], [57, 25], [66, 25], [72, 21], [77, 8], [80, 15], [88, 22], [92, 22], [98, 16], [98, 8], [104, 1], [104, 10], [109, 12], [108, 21], [117, 23], [122, 30], [121, 37], [126, 38], [129, 35], [129, 41], [141, 46], [140, 52], [136, 54], [143, 59], [156, 57], [162, 62], [156, 51], [163, 56], [172, 61], [180, 65], [188, 66], [180, 69], [170, 70], [160, 70], [140, 72], [130, 72], [115, 74], [105, 78], [95, 76], [80, 73], [70, 73], [60, 70], [50, 68], [44, 67], [40, 64], [30, 70], [20, 70], [14, 66], [5, 62], [6, 58], [10, 54], [8, 54], [5, 53], [2, 51], [-4, 48]],
    [[-6, 50], [1, 51], [-2, 56], [-3, 58], [-6, 58], [-5, 54]],
    [[-24, 64], [-14, 64], [-14, 66], [-22, 66]],
    [[130, 31], [135, 34], [140, 35], [141, 40], [142, 45], [145, 44], [141, 42], [140, 38], [137, 37], [133, 35]],
    [[95, 5], [98, 4], [106, -6], [104, -5]], [[109, 1], [117, 7], [119, 5], [117, -1], [114, -4], [110, -3]], [[105, -6], [114, -7], [114, -8.5], [106, -7.5]],
    [[131, -1], [141, -3], [150, -10], [143, -9], [138, -8], [132, -4]], [[120, 18], [122, 18], [126, 7], [122, 7]],
    [[114, -22], [122, -18], [130, -12], [137, -12], [136, -15], [141, -11], [146, -19], [153, -25], [151, -34], [146, -39], [140, -38], [135, -35], [129, -32], [115, -34], [113, -26]],
    [[172, -34], [178, -38], [174, -41], [167, -46], [171, -43]],
  ];
  // 판의 경계(단순화) — t: d 발산 · c 섭입(화산 많음) · k 충돌(화산 거의 없음) · s 보존(어긋남, 화산 없음)
  const B = [
    { k: 'mar', n: '대서양 중앙 해령', t: 'd', p: [[-15, -52], [-13, -35], [-14, -20], [-13, -5], [-18, 0], [-30, 1], [-38, 10], [-45, 20], [-42, 30], [-35, 40], [-28, 50], [-30, 55], [-25, 62], [-18, 66], [-10, 71], [0, 73], [8, 78]] },
    { k: 'epr', n: '동태평양 해령', t: 'd', p: [[-107, 23], [-104, 15], [-103, 10], [-104, 0], [-110, -10], [-112, -20], [-113, -30], [-112, -40], [-118, -50], [-130, -55], [-150, -60], [-170, -63], [-185, -62]] },
    { k: 'nw', n: '알류샨·일본·마리아나 해구', t: 'c', ring: 1, p: [[210, 58], [200, 54], [185, 51], [170, 52], [163, 55], [155, 48], [147, 43], [143, 38], [142, 33], [142, 25], [146, 18], [147, 12], [144, 10]] },
    { k: 'ph', n: '류큐·필리핀·자와 해구', t: 'c', ring: 1, p: [[142, 33], [138, 33], [132, 31], [128, 27], [122, 23], [121, 16], [125, 8], [127, 2], [128, -4], [120, -11], [112, -10], [103, -8], [97, -3], [93, 2], [95, 10]] },
    { k: 'sw', n: '통가·뉴질랜드', t: 'c', ring: 1, p: [[145, -4], [155, -6], [163, -12], [168, -18], [172, -22], [176, -24], [182, -18], [186, -22], [183, -30], [180, -37], [178, -40], [174, -42], [168, -46], [162, -55]] },
    { k: 'andes', n: '안데스(남아메리카 서쪽)', t: 'c', ring: 1, p: [[-105, 20], [-100, 16], [-92, 13], [-85, 10], [-80, 7], [-80, 2], [-82, -5], [-77, -15], [-71, -25], [-72, -35], [-75, -45], [-76, -53]] },
    { k: 'saf', n: '산안드레아스 단층', t: 's', ring: 1, p: [[-128, 50], [-125, 44], [-125, 41], [-122, 37], [-116, 33], [-110, 26], [-107, 23]] },
    { k: 'him', n: '알프스·히말라야', t: 'k', p: [[-10, 36], [0, 36], [10, 37], [20, 37], [28, 35], [35, 36], [45, 37], [55, 30], [62, 26], [67, 25], [70, 30], [75, 35], [85, 29], [92, 27], [96, 25], [95, 18], [94, 12], [95, 10]] },
    { k: 'eaf', n: '동아프리카 열곡대·홍해', t: 'd', p: [[33, 28], [38, 20], [42, 14], [44, 12], [40, 8], [37, 2], [36, -5], [34, -12], [35, -20]] },
    { k: 'ind', n: '인도양 해령', t: 'd', p: [[44, 12], [50, 13], [58, 15], [60, 10], [66, 0], [68, -10], [66, -20], [70, -27], [78, -33], [90, -40], [110, -48], [130, -52], [150, -58], [162, -60], [175, -62]] },
  ];
  const TYPE = { d: '멀어지는 경계', c: '가까워지는 경계(섭입)', k: '가까워지는 경계(충돌)', s: '어긋나는 경계' };
  const HOT = [[-155, 19], [-17, 64.5]]; // 하와이(판 안쪽)·아이슬란드
  function mount(root) {
    const stage = root.querySelector('.qk-stage'), now = root.querySelector('.qk-now'), out = root.querySelector('.qk-out');
    const P = window.Play;
    let t = 0, msg = '', ring = false, press = null, mask = null, base = null, lines = null, key = '', seen = 0, pts = [], qs = [], wise = false;
    const X = (lon, W) => ((((lon - LON0) % 360) + 360) % 360) / 360 * W, Y = (lat, H) => (LAT1 - lat) / (LAT1 - LAT0) * H;
    // 경계선 위 촘촘한 점(문지른 정도를 셈) · 지진·화산 점 미리 만들기(고정 씨앗)
    let s = 7; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    B.forEach((b, bi) => {
      for (let i = 0; i < b.p.length - 1; i++) {
        const [a1, o1] = b.p[i], [a2, o2] = b.p[i + 1], n = Math.max(2, Math.ceil(Math.hypot(a2 - a1, o2 - o1) / 2));
        for (let j = 0; j < n; j++) {
          const lon = a1 + (a2 - a1) * j / n, lat = o1 + (o2 - o1) * j / n; pts.push({ b: bi, lon, lat, on: false });
          const many = b.t === 'c' ? 3 : b.t === 'k' || b.t === 's' ? 2 : 1;
          for (let q = 0; q < many; q++) if (rnd() < 0.55) qs.push({ lon: lon + (rnd() - 0.5) * (b.t === 'd' ? 2 : 6), lat: lat + (rnd() - 0.5) * (b.t === 'd' ? 2 : 6), v: 0, at: rnd() * 9 + bi * 0.3 });
          if ((b.t === 'c' && rnd() < 0.35) || (b.k === 'eaf' && rnd() < 0.3)) qs.push({ lon: lon + (rnd() - 0.5) * 5, lat: lat + (rnd() - 0.5) * 5, v: 1, at: rnd() * 9 + 1 });
        }
      }
    });
    HOT.forEach(([lon, lat], i) => qs.push({ lon, lat, v: 1, at: 3 + i }));
    for (let i = 0; i < 18; i++) qs.push({ lon: -180 + rnd() * 360, lat: -50 + rnd() * 110, v: 0, at: rnd() * 9 }); // 판 안쪽에도 드물게
    const regionOn = (bi) => { const r = pts.filter((p) => p.b === bi); return r.filter((p) => p.on).length / r.length >= 0.4; };
    const regions = () => B.map((b, i) => (regionOn(i) ? b.k : null)).filter(Boolean);
    function say(h) { if (h !== msg) { msg = h; out.innerHTML = h; } }
    function steps() {
      const shown = t > 6, r = regions().length;
      const ok = []; if (shown) ok.push(1); if (r >= Math.ceil(B.length / 2)) ok.push(2); if (r === B.length) ok.push(3);
      const st = [1, 2, 3].find((q) => !ok.includes(q)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 지진·화산이 어디에 생기는지 지켜보자' : st === 2 ? `② 점이 몰린 띠를 손가락으로 문질러 보자 (${r}/${Math.ceil(B.length / 2)})` : st === 3 ? `③ 남은 띠도 문질러 보자 (${r}/${B.length})` : '모든 띠가 드러났다 — 태평양 한가운데를 꾹 누르면 불의 고리';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
      if (r >= 6 && !wise) { wise = true; say('<b>띠 = 판의 경계</b> — 지진과 화산은 판과 판이 만나는 곳에 몰려 있다.'); window.RxT.jolt(stage, 1); }
    }
    function layers(W, H) {
      if (key === `${W}x${H}`) return; key = `${W}x${H}`;
      base = document.createElement('canvas'); base.width = W; base.height = H; let c = base.getContext('2d');
      const sg = c.createLinearGradient(0, 0, 0, H); sg.addColorStop(0, '#9ccbe8'); sg.addColorStop(0.5, '#5f9fd1'); sg.addColorStop(1, '#3c78b4'); c.fillStyle = sg; c.fillRect(0, 0, W, H);
      c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1; for (let la = -60; la <= 75; la += 30) { c.beginPath(); c.moveTo(0, Y(la, H)); c.lineTo(W, Y(la, H)); c.stroke(); } for (let lo = 0; lo < 360; lo += 30) { c.beginPath(); c.moveTo(X(lo, W), 0); c.lineTo(X(lo, W), H); c.stroke(); }
      c.save(); c.shadowColor = 'rgba(0,30,60,.45)'; c.shadowBlur = 6; c.shadowOffsetY = 2;
      LAND.forEach((poly) => [-360, 0, 360].forEach((off) => {
        c.beginPath(); poly.forEach(([lo, la], i) => { const x = (lo - LON0 + off) / 360 * W, y = Y(la, H); c[i ? 'lineTo' : 'moveTo'](x, y); }); c.closePath();
        const lg = c.createLinearGradient(0, 0, 0, H); lg.addColorStop(0, '#e9e2c4'); lg.addColorStop(0.35, '#b9c98a'); lg.addColorStop(0.6, '#d8c48a'); lg.addColorStop(1, '#9fb070'); c.fillStyle = lg; c.fill();
      }));
      c.restore();
      c.fillStyle = '#eef4f8'; c.fillRect(0, Y(-68, H) - 4, W, H); // 남극
      lines = document.createElement('canvas'); lines.width = W; lines.height = H; c = lines.getContext('2d'); c.lineCap = 'round'; c.lineJoin = 'round';
      B.forEach((b) => [-360, 0, 360].forEach((off) => {
        const path = () => { c.beginPath(); b.p.forEach(([lo, la], i) => { const x = (lo - LON0 + off) / 360 * W; c[i ? 'lineTo' : 'moveTo'](x, Y(la, H)); }); };
        path(); c.strokeStyle = 'rgba(10,20,60,.55)'; c.lineWidth = 6; c.stroke();
        path(); c.strokeStyle = { d: '#ffd84d', c: '#ff8a3d', k: '#ff8a3d', s: '#b98cff' }[b.t]; c.lineWidth = 3; c.setLineDash(b.t === 's' ? [7, 5] : []); c.stroke(); c.setLineDash([]);
      }));
      mask = document.createElement('canvas'); mask.width = W; mask.height = H; pts.filter((p) => p.on).forEach((p) => rub(X(p.lon, W), Y(p.lat, H), true));
    }
    function rub(x, y, quiet) {
      if (!mask) layers(S.W, S.H);
      const R = 30, mc = mask.getContext('2d'), g = mc.createRadialGradient(x, y, 4, x, y, R); g.addColorStop(0, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)'); mc.fillStyle = g; mc.beginPath(); mc.arc(x, y, R, 0, TAU); mc.fill();
      if (quiet) return; let hit = false;
      pts.forEach((p) => { if (!p.on && Math.hypot(X(p.lon, S.W) - x, Y(p.lat, S.H) - y) < R) { p.on = true; hit = true; } });
      if (hit) { const r = regions().length; if (r !== seen) { const nb = B.find((b, i) => regionOn(i) && !rubbed.has(b.k)); if (nb) { rubbed.add(nb.k); say(`<b>${nb.n}</b> — ${TYPE[nb.t]}${nb.t === 'k' || nb.t === 's' ? ' · 지진은 잦지만 화산은 거의 없다' : nb.t === 'c' ? ' · 지진과 화산이 모두 활발' : ' · 마그마가 솟아 새 바닥이 생긴다'}`); } seen = r; } steps(); }
    }
    const rubbed = new Set();
    function revealRegion(bi) { const W = S.W, H = S.H; pts.filter((p) => p.b === bi).forEach((p) => { if (!p.on) rub(X(p.lon, W), Y(p.lat, H)); }); }
    function setRing(on) { ring = on; if (on) say('<b>불의 고리</b> — 태평양 가장자리를 따라 지진·화산이 가장 활발한 띠. 해양판이 다른 판 아래로 들어가는 곳이 많다.'); S.kick(); }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; layers(W, H);
        c.drawImage(base, 0, 0);
        // 숨은 경계: 문지른 자리만 보이게
        const tmp = S._tmp || (S._tmp = document.createElement('canvas')); if (tmp.width !== W || tmp.height !== H) { tmp.width = W; tmp.height = H; }
        const tc = tmp.getContext('2d'); tc.globalCompositeOperation = 'source-over'; tc.clearRect(0, 0, W, H); tc.drawImage(lines, 0, 0); tc.globalCompositeOperation = 'destination-in'; tc.drawImage(mask, 0, 0); c.drawImage(tmp, 0, 0);
        // 불의 고리
        if (ring) { const a = 0.45 + 0.25 * Math.sin(t * 3); c.save(); c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = `rgba(255,90,30,${a})`; c.lineWidth = 16; c.shadowColor = 'rgba(255,120,40,.9)'; c.shadowBlur = 18; B.filter((b) => b.ring).forEach((b) => [-360, 0, 360].forEach((off) => { c.beginPath(); b.p.forEach(([lo, la], i) => c[i ? 'lineTo' : 'moveTo']((lo - LON0 + off) / 360 * W, Y(la, H))); c.stroke(); })); c.restore(); P.txt(c, '불의 고리', X(-160, W), Y(-8, H), '#fff1d6', '800 18px'); }
        // 지진·화산(시간 따라 깜빡이며 쌓임)
        const tt = t * 1.4;
        qs.forEach((q) => {
          if (tt < q.at) return; const x = X(q.lon, W), y = Y(q.lat, H), age = tt - q.at;
          if (age < 1.2) { c.strokeStyle = `rgba(255,${q.v ? 140 : 60},40,${1 - age / 1.2})`; c.lineWidth = 2; c.beginPath(); c.arc(x, y, 3 + age * 14, 0, TAU); c.stroke(); }
          if (q.v) { c.fillStyle = '#ff5a2a'; c.strokeStyle = '#5a1500'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(x, y - 6); c.lineTo(x + 5, y + 4); c.lineTo(x - 5, y + 4); c.closePath(); c.fill(); c.stroke(); }
          else { c.fillStyle = 'rgba(200,20,30,.85)'; c.beginPath(); c.arc(x, y, 2.4, 0, TAU); c.fill(); }
        });
        // 드러난 경계 이름
        B.forEach((b) => { if (!rubbed.has(b.k)) return; const [lo, la] = b.p[Math.floor(b.p.length / 2)]; const x = X(lo, W), y = Y(la, H); c.font = '800 13px "IBM Plex Sans KR", sans-serif'; const tw = c.measureText(b.n).width + 14; const bx = Math.max(4, Math.min(W - tw - 4, x - tw / 2)); c.fillStyle = 'rgba(10,16,32,.75)'; c.beginPath(); c.roundRect(bx, y - 30, tw, 22, 7); c.fill(); P.txt(c, b.n, bx + tw / 2, y - 14, '#fff3d6', '800 13px'); });
        // 꾹 누르기 표시
        if (press && !press.moved) { const k = Math.min(1, (performance.now() - press.t0) / 700); c.strokeStyle = '#ffd84d'; c.lineWidth = 4; c.beginPath(); c.arc(press.x, press.y, 22, -Math.PI / 2, -Math.PI / 2 + k * TAU); c.stroke(); if (k >= 1 && !press.done) { press.done = true; setRing(!ring); } }
        // 범례
        c.fillStyle = 'rgba(255,255,255,.88)'; c.beginPath(); c.roundRect(8, H - 34, 268, 26, 8); c.fill();
        c.fillStyle = 'rgba(200,20,30,.85)'; c.beginPath(); c.arc(20, H - 21, 3, 0, TAU); c.fill(); P.txt(c, '지진', 28, H - 16, '#1d2433', '800 13px', 'left');
        c.fillStyle = '#ff5a2a'; c.beginPath(); c.moveTo(72, H - 27); c.lineTo(77, H - 17); c.lineTo(67, H - 17); c.fill(); P.txt(c, '화산', 82, H - 16, '#1d2433', '800 13px', 'left');
        c.strokeStyle = '#ff8a3d'; c.lineWidth = 3; c.beginPath(); c.moveTo(122, H - 21); c.lineTo(142, H - 21); c.stroke(); P.txt(c, '판의 경계(문지르면 보임)', 148, H - 16, '#1d2433', '800 13px', 'left');
      },
      down(p) { press = { x: p.x, y: p.y, t0: performance.now(), moved: false, inPac: p.x > X(130, S.W) && p.x < X(-100, S.W) && p.y > Y(40, S.H) && p.y < Y(-40, S.H) }; if (!press.inPac) press.moved = true; rub(p.x, p.y); },
      move(p, e, held) { if (!held || !press) return; if (Math.hypot(p.x - press.x, p.y - press.y) > 10) press.moved = true; rub(p.x, p.y); },
      up() { press = null; S.kick(); },
      key(e) {
        if (e.key === 'Enter' || e.key === ' ') { const i = B.findIndex((b, j) => !regionOn(j)); if (i >= 0) revealRegion(i); return true; }
        if (e.key === 'f' || e.key === 'F') { setRing(!ring); return true; }
        if (e.key === '0') { reset(); return true; } return false;
      },
    });
    function reset() { pts.forEach((p) => { p.on = false; }); rubbed.clear(); seen = 0; wise = false; ring = false; t = 0; key = ''; msg = ''; say('지진(점)과 화산(세모)이 어디에 몰리는지 보자. 점이 몰린 띠를 손가락으로 문지르면 그 아래 숨은 선이 드러난다.'); steps(); S.kick(); }
    root.querySelector('.qk-reset')?.addEventListener('click', reset);
    root._qk = {
      reveal: (v) => { t = Math.max(t, 7); B.forEach((b, i) => { const r = pts.filter((p) => p.b === i), n = Math.ceil(r.length * v); r.slice(0, n).forEach((p) => { if (!p.on) rub(X(p.lon, S.W), Y(p.lat, S.H)); }); }); steps(); S.kick(); return regions().length; },
      ring: (on) => setRing(on !== false),
      state: () => ({ regions: regions(), shown: qs.filter((q) => t * 1.4 >= q.at).length, total: qs.length, ring }),
    };
    setInterval(() => { if (S.active) steps(); }, 1000);
    reset();
    console.assert(Math.abs(X(155, 360) - 180) < 1e-9 && X(-25, 360) === 0 && Y(LAT1, 100) === 0, 'quake: 지도 좌표');
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Quake = { mount };
})();
