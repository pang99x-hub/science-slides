/* 3-1 3차시 체험 «3D 지구의 판»(교과서 114~115쪽 전 세계 판의 분포).
   겉: NASA 블루 마블(정거원통) 위에 판의 경계를 종류별 색으로(발산 빨강 · 수렴 파랑 · 보존 초록). 경계 좌표는 손으로 짚은 단순화(대략).
   판 이름과 이동 화살표(화살표 위로 작은 점이 계속 흐른다). 손대지 않으면 지구가 천천히 돈다.
   여섯 곳 핀(①히말라야 ②마리아나 해구 ③안데스 ④산안드레아스 ⑤동태평양 해령 ⑥동아프리카 열곡대): 누르면 그 자리로 돌아가 풀이,
   끌어서 오른쪽 «어느 경계?» 칸(발산·보존·수렴)에 놓는다. 키보드: 화살표 돌리기, 1~6 핀 고르기, 고른 뒤 칸 단추.
   Plate3D.mount(root) → { setActive, fit } · 시험용: root._p3.pin(1~6) · put(n, 'div'|'tf'|'conv') · state() */
(function () {
  'use strict';
  const R = 4;
  const D2R = Math.PI / 180;
  // 경계: [종류, [[경도, 위도], …]] — div 발산 · conv 수렴 · tf 보존
  const B = [
    ['div', [[-5, 72], [-18, 66], [-28, 58], [-32, 50], [-38, 40], [-45, 30], [-46, 20], [-40, 10], [-30, 2], [-14, -1], [-13, -10], [-14, -20], [-13, -30], [-15, -40], [-10, -50], [-1, -54]]], // 대서양 중앙 해령
    ['div', [[-108, 23], [-108, 15], [-104, 10], [-103, 0], [-110, -10], [-113, -20], [-112, -30], [-112, -40], [-115, -50], [-120, -56], [-140, -60], [-160, -63], [-180, -63]]], // 동태평양 해령 → 태평양–남극 해령
    ['div', [[180, -63], [170, -62], [160, -60], [140, -55], [120, -50], [100, -47], [88, -42], [78, -35], [70, -26]]], // 남동 인도양 해령
    ['div', [[-112, -36], [-95, -38], [-85, -42], [-75, -46]]], // 칠레 해령
    ['div', [[-103, 2], [-92, 1.5], [-84, 2]]], // 갈라파고스 해령
    ['div', [[58, 14], [60, 10], [66, 0], [68, -10], [70, -20], [70, -26], [62, -29], [55, -33], [40, -42], [25, -50], [10, -54], [-1, -54]]], // 인도양 해령
    ['div', [[33, 28], [38, 20], [42, 13], [45, 12], [52, 14], [58, 14]]], // 홍해·아덴만
    ['div', [[42, 12], [40, 8], [37, 3], [36, -3], [34, -8], [35, -14], [35, -20]]], // 동아프리카 열곡대
    ['div', [[-130, 50], [-128, 45], [-127, 41]]], // 후안데푸카 해령
    ['tf', [[-108, 23], [-114, 30], [-117, 34], [-122, 37.5], [-124.5, 40.3], [-127, 41]]], // 산안드레아스 단층
    ['tf', [[-88, 15.5], [-78, 19.5], [-68, 19]]], ['tf', [[-62, 10.5], [-72, 11], [-78, 9]]], // 카리브판 남북
    ['tf', [[-65, -55], [-45, -53], [-30, -55]]], ['tf', [[-60, -60], [-30, -60]]], // 스코샤판
    ['tf', [[35, 29], [36, 36]]], ['tf', [[167, -46], [172, -42]]], // 사해 단층 · 뉴질랜드 알파인 단층
    ['conv', [[-124, 48.5], [-124.5, 41]]], // 캐스케이디아
    ['conv', [[-135, 58], [-150, 59], [-160, 55], [-170, 52], [-180, 51]]], ['conv', [[180, 51], [170, 53], [162, 54], [158, 50], [152, 46], [146, 42], [142, 38], [141, 34], [142, 28], [143, 20], [146, 15], [144, 11], [138, 9], [135, 5]]], // 알류샨·쿠릴·일본·이즈–보닌·마리아나
    ['conv', [[138, 34], [131, 32], [128, 27], [123, 24], [121, 22], [120, 15], [124, 10], [127, 5], [127, 0]]], // 난카이·류큐·필리핀 해구
    ['conv', [[95, 15], [93, 6], [96, 2], [100, -4], [106, -8], [115, -11], [122, -11], [130, -9], [136, -5], [146, -6], [150, -5], [155, -7], [162, -11], [167, -15], [170, -21]]], // 순다·뉴기니·솔로몬·뉴헤브리디스
    ['conv', [[-173, -15], [-175, -20], [-177, -30], [-178, -37], [180, -39]]], ['conv', [[180, -39], [178, -41], [175, -43], [172, -42]]], // 통가–케르마데크
    ['conv', [[-10, 36], [0, 36], [12, 38], [20, 38], [28, 35], [35, 36], [44, 37], [50, 32], [58, 26], [66, 25], [70, 30], [75, 34], [82, 30], [90, 28], [95, 27], [97, 22], [95, 15]]], // 알프스–히말라야
    ['conv', [[-105, 19], [-100, 16], [-94, 14], [-88, 12], [-84, 8], [-80, 6], [-80, 2], [-81, -6], [-77, -14], [-71, -20], [-71, -30], [-74, -40], [-76, -46]]], // 중앙아메리카·페루–칠레 해구
    ['conv', [[-68, 19], [-62, 18.5], [-60, 15], [-61, 11], [-62, 10.5]]], ['conv', [[-30, -55], [-26, -58], [-30, -60]]], // 소앤틸리스·사우스샌드위치
  ];
  const KIND = { div: { n: '발산형', c: '#ff5a4a' }, conv: { n: '수렴형', c: '#4aa8ff' }, tf: { n: '보존형', c: '#4be08a' } };
  // 판 이름 자리와 움직이는 방위(북에서 시계 방향 °) · 화살표 길이(°, 빠를수록 길게 — 이해를 돕기 위한 그림)
  const PLATES = [
    ['태평양판', -150, 5, 300, 16], ['북아메리카판', -100, 48, 250, 9], ['남아메리카판', -55, -12, 275, 9], ['나스카판', -90, -22, 80, 12],
    ['코코스판', -98, 7, 40, 8], ['카리브판', -75, 14, 90, 5], ['유라시아판', 80, 55, 100, 5], ['아프리카판', 18, 2, 35, 7],
    ['아라비아판', 47, 22, 30, 6], ['인도–오스트레일리아판', 110, -25, 15, 13], ['필리핀판', 133, 17, 300, 8], ['남극판', 30, -76, 90, 4], ['스코샤판', -45, -57, 90, 4],
  ];
  const PINS = [
    { n: 1, k: 'conv', name: '히말라야산맥', lon: 84, lat: 29, two: '인도–오스트레일리아판 ↔ 유라시아판', d: '대륙판끼리 부딪쳐 땅이 접혀 솟은 <b>습곡 산맥</b>. 지진은 잦지만 화산은 거의 없다.' },
    { n: 2, k: 'conv', name: '마리아나 해구', lon: 145, lat: 14, two: '태평양판 → 필리핀판 밑으로', d: '해양판이 다른 해양판 밑으로 섭입하며 깊은 <b>해구</b>와 나란한 화산섬 줄(<b>호상열도</b>)이 생겼다.' },
    { n: 3, k: 'conv', name: '안데스산맥', lon: -69, lat: -20, two: '나스카판 → 남아메리카판 밑으로', d: '해양판이 대륙판 밑으로 섭입하며 화산이 줄지은 <b>습곡 산맥</b>과 앞바다의 <b>해구</b>가 생겼다.' },
    { n: 4, k: 'tf', name: '산안드레아스 단층', lon: -120, lat: 36, two: '태평양판 ⇅ 북아메리카판', d: '두 판이 비껴 지나가는 <b>변환 단층</b>이 땅 위로 드러난 곳. 지진은 잦고 화산은 거의 없다.' },
    { n: 5, k: 'div', name: '동태평양 해령', lon: -110, lat: -12, two: '태평양판 ↔ 나스카판', d: '해양판끼리 갈라지며 마그마가 솟아 새 바닥을 만드는 바다 밑 산맥, <b>해령</b>.' },
    { n: 6, k: 'div', name: '동아프리카 열곡대', lon: 36, lat: 0, two: '아프리카판이 둘로 갈라지는 중', d: '대륙이 벌어지며 생긴 길고 깊은 골짜기, <b>열곡대</b>. 먼 훗날 바다가 될 수 있다.' },
  ];
  const BIN = { div: '발산형', tf: '보존형', conv: '수렴형' };
  // 경도·위도 → 장면 좌표(SphereGeometry의 u=0이 경도 −180°)
  function xyz(lon, lat, r) { const ph = (lon + 180) * D2R, la = lat * D2R; return [-Math.cos(ph) * Math.cos(la) * r, Math.sin(la) * r, Math.sin(ph) * Math.cos(la) * r]; }
  const viewOf = (lon, lat) => { const [x, , z] = xyz(lon, lat, 1); return { yaw: Math.atan2(x, z), pitch: lat * D2R }; };
  // 위치에서 방위 hd(°)로 deg만큼 간 점(작은 거리라 평면 근사)
  const step = (lon, lat, hd, deg) => [lon + Math.sin(hd * D2R) * deg / Math.max(0.25, Math.cos(lat * D2R)), lat + Math.cos(hd * D2R) * deg];
  { const [x, y, z] = xyz(0, 0, 1), v = viewOf(90, 0); console.assert(Math.abs(x - 1) < 1e-9 && Math.abs(y) < 1e-9 && Math.abs(z) < 1e-9 && Math.abs(v.yaw + Math.PI / 2) < 1e-9, 'plate3d: 좌표 변환'); }

  function mount(root) {
    const stage = root.querySelector('.p3-stage'), cv = stage.querySelector('canvas'), out = root.querySelector('.p3-out'), now = root.querySelector('.p3-now');
    const texImg = root.querySelector('.p3-tex'), bins = [...root.querySelectorAll('.p3-bin')];
    const V0 = { yaw: viewOf(-150, 10).yaw, pitch: 0.25, dist: 15.5, target: [0, 0, 0] };
    const opened = new Set(), placed = {}; let turned = 0, hot = 0, sel = 0, idle = 0, t = 0, ovT = 0, flash = 0;
    let dragPin = 0, ghost = null, x0 = 0, y0 = 0, moved = false, ready = false; // 핀 끌기 · 이름표가 다 생기기 전엔 자리 잡기를 건너뜀
    const s = window.Scene3D.make(stage, cv, {
      view: V0, min: 6.5, max: 26, pmin: -1.35, pmax: 1.35,
      onFrame(dt) {
        t += dt; ovT += dt; idle += dt; if (flash > 0) flash = Math.max(0, flash - dt);
        if (idle > 4 && !dragPin) s.view.yaw += dt * 0.06; // 손대지 않으면 천천히 돈다
        if (ovT > 0.09) { ovT = 0; drawFlow(); }
      },
      onRender() { if (ready) placeTags(); },
    });
    if (!s.ok) return { setActive() {}, fit() {} };
    const { T, scene } = s;
    // 손으로 돌린 양 재기(① 단계) — 엔진 회전은 캔버스 끌기
    let lastYaw = s.view.yaw;
    cv.addEventListener('pointerdown', () => { idle = 0; lastYaw = s.view.yaw; });
    cv.addEventListener('pointerup', () => { turned += Math.abs(s.view.yaw - lastYaw); steps(); });
    cv.addEventListener('wheel', () => { idle = 0; }, { passive: true });
    // 바탕: 우주 + 별
    const bgc = document.createElement('canvas'); bgc.width = 4; bgc.height = 256; const b2 = bgc.getContext('2d'), bgr = b2.createLinearGradient(0, 0, 0, 256);
    bgr.addColorStop(0, '#16224d'); bgr.addColorStop(1, '#04060f'); b2.fillStyle = bgr; b2.fillRect(0, 0, 4, 256);
    scene.background = new T.CanvasTexture(bgc); scene.background.colorSpace = T.SRGBColorSpace;
    const sp = []; let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let k = 0; k < 500; k++) { const u = rnd() * 2 - 1, a = rnd() * Math.PI * 2, r = 70, q = Math.sqrt(1 - u * u); sp.push(Math.cos(a) * q * r, u * r, Math.sin(a) * q * r); }
    const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.Float32BufferAttribute(sp, 3));
    scene.add(new T.Points(sg, new T.PointsMaterial({ color: 0xdfe8ff, size: 0.25, sizeAttenuation: true })));
    // 세 점 조명 + 그림자
    scene.add(new T.HemisphereLight(0xe8f0ff, 0x2a3050, 1.35));
    // 주광은 카메라를 따라 다닌다 — 어느 쪽으로 돌려도 보이는 면이 밝다
    const key = new T.DirectionalLight(0xfff4e0, 2.0); key.position.set(5, 6, 2); scene.add(s.camera); s.camera.add(key); s.fill(0.6);
    const rim = new T.DirectionalLight(0x7fb4ff, 0.9); rim.position.set(-8, 3, -9); scene.add(rim);
    s.softShadow(R * 1.25, -R - 0.6, 0.5);
    // 지구: 사진 겉면(그림이 늦게 오면 바다색으로 먼저)
    const earthMat = new T.MeshStandardMaterial({ color: 0x2a5d9a, roughness: 0.75, metalness: 0.02 });
    const earth = new T.Mesh(new T.SphereGeometry(R, 96, 64), earthMat); scene.add(earth);
    const useTex = () => { const tx = new T.Texture(texImg); tx.colorSpace = T.SRGBColorSpace; tx.anisotropy = 4; tx.needsUpdate = true; earthMat.map = tx; earthMat.color.set(0xffffff); earthMat.needsUpdate = true; s.render(); };
    if (texImg.complete && texImg.naturalWidth) useTex(); else texImg.addEventListener('load', useTex, { once: true });
    scene.add(new T.Mesh(new T.SphereGeometry(R * 1.05, 48, 32), new T.MeshBasicMaterial({ color: 0x6fb4ff, transparent: true, opacity: 0.12, side: T.BackSide, depthWrite: false })));
    // 겉 그림 두 겹: 경계선(고른 핀의 경계는 굵게 빛남) · 판 이동 화살표(점이 흐름)
    const W = 2048, H = 1024, X = (lon) => (lon + 180) / 360 * W, Y = (lat) => (90 - lat) / 180 * H;
    const bc = document.createElement('canvas'); bc.width = W; bc.height = H; const bg = bc.getContext('2d');
    const bTex = new T.CanvasTexture(bc); bTex.colorSpace = T.SRGBColorSpace;
    function path(g, pts) { g.beginPath(); pts.forEach(([lo, la], i) => { const p = i && Math.abs(lo - pts[i - 1][0]) > 180; g[i && !p ? 'lineTo' : 'moveTo'](X(lo), Y(la)); }); }
    function drawBounds() {
      bg.clearRect(0, 0, W, H); bg.lineJoin = bg.lineCap = 'round';
      const hk = hot ? PINS[hot - 1].k : null;
      B.forEach(([k, pts]) => { path(bg, pts); bg.strokeStyle = 'rgba(8,12,28,.7)'; bg.lineWidth = 7; bg.stroke(); });
      B.forEach(([k, pts]) => {
        path(bg, pts); bg.strokeStyle = KIND[k].c; bg.lineWidth = hk === k ? 6 : 3.5; bg.stroke();
        if (k === 'conv') { // 수렴형: 톱니 표시 대신 짧은 가로 눈금
          bg.lineWidth = 2.5; for (let i = 1; i < pts.length; i++) { if (Math.abs(pts[i][0] - pts[i - 1][0]) > 180) continue; const x = (X(pts[i][0]) + X(pts[i - 1][0])) / 2, y = (Y(pts[i][1]) + Y(pts[i - 1][1])) / 2; const dx = X(pts[i][0]) - X(pts[i - 1][0]), dy = Y(pts[i][1]) - Y(pts[i - 1][1]), L = Math.hypot(dx, dy) || 1; bg.beginPath(); bg.moveTo(x, y); bg.lineTo(x - dy / L * 9, y + dx / L * 9); bg.stroke(); }
        }
      });
      bTex.needsUpdate = true;
    }
    const fc = document.createElement('canvas'); fc.width = W / 2; fc.height = H / 2; const fg = fc.getContext('2d');
    const fTex = new T.CanvasTexture(fc); fTex.colorSpace = T.SRGBColorSpace;
    function drawFlow() {
      fg.clearRect(0, 0, fc.width, fc.height); fg.lineCap = 'round';
      const x = (lo) => X(lo) / 2, y = (la) => Y(la) / 2;
      PLATES.forEach(([, lo, la, hd, len]) => {
        const [lo1, la1] = step(lo, la, hd, len), [lo0, la0] = step(lo, la, hd, -len * 0.2);
        fg.strokeStyle = 'rgba(10,14,30,.6)'; fg.lineWidth = 6; fg.beginPath(); fg.moveTo(x(lo0), y(la0)); fg.lineTo(x(lo1), y(la1)); fg.stroke();
        fg.strokeStyle = '#fff8d8'; fg.lineWidth = 3; fg.stroke();
        const ang = Math.atan2(y(la1) - y(la0), x(lo1) - x(lo0)); fg.fillStyle = '#fff8d8';
        fg.beginPath(); fg.moveTo(x(lo1) + Math.cos(ang) * 9, y(la1) + Math.sin(ang) * 9); fg.lineTo(x(lo1) + Math.cos(ang + 2.5) * 9, y(la1) + Math.sin(ang + 2.5) * 9); fg.lineTo(x(lo1) + Math.cos(ang - 2.5) * 9, y(la1) + Math.sin(ang - 2.5) * 9); fg.fill();
        for (let k = 0; k < 3; k++) { const f = ((t * 0.35 + k / 3) % 1), px = x(lo0) + (x(lo1) - x(lo0)) * f, py = y(la0) + (y(la1) - y(la0)) * f; fg.fillStyle = `rgba(255,216,77,${Math.sin(f * Math.PI)})`; fg.beginPath(); fg.arc(px, py, 3.2, 0, Math.PI * 2); fg.fill(); }
      });
      fTex.needsUpdate = true;
    }
    const lay = (tex, r) => { const m = new T.Mesh(new T.SphereGeometry(r, 96, 64), new T.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false })); scene.add(m); return m; };
    lay(bTex, R * 1.004); lay(fTex, R * 1.008);
    drawBounds(); drawFlow();
    // 판 이름표·핀(HTML) — 지구 뒤쪽에 간 것은 숨긴다
    const cam = s.camera, tmp = new T.Vector3(), nrm = new T.Vector3();
    const front = (p) => { nrm.copy(p).normalize(); tmp.copy(cam.position).sub(p); return nrm.dot(tmp.normalize()) > 0.12; };
    const tags = [];
    PLATES.forEach(([n, lo, la]) => { const el = document.createElement('span'); el.className = 'p3-plate'; el.textContent = n; stage.appendChild(el); tags.push({ el, p: new T.Vector3(...xyz(lo, la, R * 1.01)) }); });
    const pinEls = PINS.map((q) => {
      const el = document.createElement('button'); el.type = 'button'; el.className = 'p3-pin'; el.textContent = q.n; el.setAttribute('aria-label', `${q.n}번 ${q.name} — 누르면 풀이, 끌어서 경계 칸에 놓는다`);
      stage.appendChild(el); tags.push({ el, p: new T.Vector3(...xyz(q.lon, q.lat, R * 1.012)), pin: q.n }); return el;
    });
    ready = true;
    function placeTags() {
      const r = stage.getBoundingClientRect();
      tags.forEach(({ el, p, pin }) => {
        const c = s.toClient(p), vis = front(p) && !(pin && placed[pin] && dragPin !== pin);
        el.style.transform = `translate(${((c.x - r.left) / c.k).toFixed(1)}px, ${((c.y - r.top) / c.k).toFixed(1)}px) translate(-50%, -50%)`;
        el.classList.toggle('off', !vis);
        if (pin) { el.classList.toggle('hot', pin === hot && flash > 0); el.classList.toggle('sel', pin === sel); el.classList.toggle('done', !!placed[pin]); }
      });
    }
    // 핀 열기: 그 자리로 돌아가 풀이
    function pin(n) {
      const q = PINS[n - 1]; if (!q) return; idle = 0; hot = n; sel = n; flash = 2.2; opened.add(n); drawBounds();
      const v = viewOf(q.lon, q.lat); s.look({ yaw: v.yaw, pitch: v.pitch, dist: 12.5 });
      out.innerHTML = `<b>${q.n}. ${q.name}</b> · ${q.two}<br>${q.d}${placed[n] ? ` <span class="p3-ok">${BIN[q.k]} 경계 ✓</span>` : ' — 끌어서 오른쪽 칸에 넣어 보자'}`;
      steps(); s.render();
    }
    // 핀을 경계 칸에 넣기
    function put(n, k) {
      const q = PINS[n - 1]; if (!q || placed[n]) return !!placed[n];
      const bin = bins.find((b) => b.dataset.k === k);
      if (q.k === k) {
        placed[n] = k; const chip = document.createElement('span'); chip.className = 'p3-chip'; chip.textContent = `${q.n} ${q.name}`; bin.querySelector('.p3-got').appendChild(chip);
        bin.classList.remove('ok'); void bin.offsetWidth; bin.classList.add('ok');
        out.innerHTML = `<b>${q.name}</b> → <b>${BIN[k]} 경계</b> ✓ · ${q.two}<br>${q.d}`; sel = 0;
      } else {
        bin.classList.remove('no'); void bin.offsetWidth; bin.classList.add('no');
        const why = { div: '두 판이 서로 멀어지는 곳', tf: '두 판이 옆으로 비껴가는 곳', conv: '두 판이 가까워지는 곳' }[k];
        out.innerHTML = `<b>${q.name}</b>은(는) ${BIN[k]}이 아니다 — ${BIN[k]}은 ${why}. 핀을 눌러 두 판이 어떻게 움직이는지 다시 보자`;
      }
      steps(); s.render(); return q.k === k;
    }
    // 핀 끌기(누르기만 하면 열기)
    pinEls.forEach((el, i) => {
      const n = i + 1;
      el.addEventListener('pointerdown', (e) => {
        e.preventDefault(); e.stopPropagation(); idle = 0; dragPin = n; moved = false; x0 = e.clientX; y0 = e.clientY;
        try { el.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ }
      });
      el.addEventListener('pointermove', (e) => {
        if (dragPin !== n) return;
        if (!moved && Math.hypot(e.clientX - x0, e.clientY - y0) > 8) { moved = true; ghost = document.createElement('div'); ghost.className = 'p3-ghost'; ghost.textContent = `${n} ${PINS[n - 1].name}`; document.body.appendChild(ghost); }
        if (ghost) { ghost.style.left = e.clientX + 'px'; ghost.style.top = e.clientY + 'px'; const b = binAt(e.clientX, e.clientY); bins.forEach((x) => x.classList.toggle('over', x === b)); }
      });
      const up = (e) => {
        if (dragPin !== n) return;
        if (moved) { const b = binAt(e.clientX, e.clientY); if (b) put(n, b.dataset.k); else out.innerHTML = '오른쪽 «어느 경계?» 칸 위에 놓아 보자'; } else pin(n);
        if (ghost) ghost.remove(); ghost = null; dragPin = 0; bins.forEach((x) => x.classList.remove('over')); s.render();
      };
      el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    });
    // 칸은 넓게: 칸 둘레 40px 안이면 그 칸
    const binAt = (x, y) => { let best = null, bd = 40; bins.forEach((b) => { const r = b.getBoundingClientRect(), dx = Math.max(r.left - x, 0, x - r.right), dy = Math.max(r.top - y, 0, y - r.bottom), d = Math.hypot(dx, dy); if (d < bd) { bd = d; best = b; } }); return best; };
    bins.forEach((b) => b.addEventListener('click', () => { if (sel) put(sel, b.dataset.k); else out.innerHTML = '먼저 핀을 누르거나 숫자 1~6으로 고른 뒤 칸을 누르자'; }));
    // 키보드: 화살표 돌리기, 1~6 핀
    root.addEventListener('keydown', (e) => {
      if (e.target.closest && e.target.closest('input,textarea')) return;
      const d = { ArrowLeft: [-0.25, 0], ArrowRight: [0.25, 0], ArrowUp: [0, 0.18], ArrowDown: [0, -0.18] }[e.key];
      if (d && e.target === cv) { e.preventDefault(); e.stopPropagation(); idle = 0; s.view.yaw += d[0]; s.view.pitch = Math.max(-1.35, Math.min(1.35, s.view.pitch + d[1])); turned += Math.abs(d[0]); steps(); s.render(); return; }
      if (/^[1-6]$/.test(e.key) && (e.target === cv || e.target.closest('.p3-panel') || e.target.classList.contains('p3-pin'))) { e.preventDefault(); e.stopPropagation(); pin(+e.key); }
    });
    function steps() {
      const nPut = Object.keys(placed).length, ok = [];
      if (turned > 0.8) ok.push(1); if (opened.size >= 3) ok.push(2); if (nPut >= 6) ok.push(3);
      const st = [1, 2, 3].find((q) => !ok.includes(q)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 지구를 끌어 돌려 보자 — 빨강·파랑·초록 선이 판의 경계' : st === 2 ? `② 번호 핀을 눌러 보자 (${opened.size}/3)` : st === 3 ? `③ 핀을 끌어 오른쪽 경계 칸에 넣자 (${nPut}/6)` : '경계마다 지형이 다르다: 발산 — 해령·열곡대, 보존 — 변환 단층, 수렴 — 해구·습곡 산맥';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    function reset() {
      opened.clear(); Object.keys(placed).forEach((k) => delete placed[k]); turned = 0; hot = 0; sel = 0; idle = 0;
      root.querySelectorAll('.p3-got').forEach((g) => { g.innerHTML = ''; }); drawBounds(); s.look(V0);
      out.innerHTML = '선의 색: <b style="color:#d23a2c">빨강 발산형</b> · <b style="color:#1f7fd6">파랑 수렴형</b> · <b style="color:#1f9a58">초록 보존형</b>. 흰 화살표는 판이 움직이는 쪽'; steps();
    }
    root.querySelector('.p3-home').addEventListener('click', reset);
    reset();
    root._p3 = { pin(n) { pin(n); return PINS[n - 1].name; }, put(n, k) { return put(n, k); }, state: () => ({ opened: [...opened], placed: { ...placed }, turned: +turned.toFixed(2) }) };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.Plate3D = { mount };
})();
