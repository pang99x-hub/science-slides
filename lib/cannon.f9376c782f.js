/* 3-2 2차시 체험 «3D 뉴턴의 대포»(교과서 130쪽 그림 Ⅲ-18 뉴턴의 사고 실험 · 약 8 km/s는 참고서·다른 교과서 내용).
   3D 지구(사진 겉면 + 그린 구름 + 명암) 위 한반도 자리에 과장해 높게 그린 산과 꼭대기 대포. 대포 옆 속력 손잡이를 끌어 2.0~9.5 km/s를 정하고
   대포를 누르면 수평으로 발사. 계산은 실제 지구 반지름·중력(공기 저항 없음, 발사 높이 약 167 km — 원 궤도 속력이 딱 7.8 km/s)으로, 화면은 시간을 빠르게 돌린다.
   느리면 가까이 떨어짐 → 빠를수록 멀리 → 7.8 km/s면 원 궤도(계속 돈다) → 더 빠르면 타원. 궤적(점)은 6개까지 남는다.
   날아가는 포탄에 중력 화살표(늘 지구 중심)와 운동 방향 화살표가 붙어 따라간다.
   높이 그리기: 화면 반지름 = Rv·r/R + 산 높이·min(1, 고도/발사 높이) — 땅에 닿는 순간과 산꼭대기는 그대로 맞고, 높은 곳은 비례대로.
   Cannon.mount(root) → { fit, setActive } · 시험용: root._cn.speed(v) · fire() · state() · run(초) */
(function () {
  'use strict';
  const R = 6.371e6, GM = 9.8 * R * R, R0 = GM / 7.8e3 ** 2, H0 = R0 - R, VC = Math.sqrt(GM / R0); // 발사 높이 약 167 km — 원 궤도 속력이 딱 7.8 km/s
  const VMIN = 2, VMAX = 9.5, V0 = 3;
  const Rv = 3, HV = 0.62; // 화면 지구 반지름 · 산 높이(과장)
  const vis = (r) => Rv * r / R + HV * Math.min(1, Math.max(0, (r - R) / H0));
  // 수평 발사 결과(에너지·각운동량 보존): 반대편 끝 반지름
  const otherEnd = (v) => R0 * v * v / (2 * GM / R0 - v * v);
  function kindOf(vk) {
    const v = vk * 1000, re = otherEnd(v);
    if (v < VC && re < R) return 'fall';
    return re / R0 < 1.03 ? 'orbit' : 'ellipse';
  }
  // 한 걸음(속도 베를레, m·s)
  function step(s, dt) {
    let r = Math.hypot(s.x, s.y), k = -GM / (r * r * r);
    s.vx += k * s.x * dt / 2; s.vy += k * s.y * dt / 2;
    s.x += s.vx * dt; s.y += s.vy * dt;
    r = Math.hypot(s.x, s.y); k = -GM / (r * r * r);
    s.vx += k * s.x * dt / 2; s.vy += k * s.y * dt / 2;
  }
  {
    const s = { x: 0, y: R0, vx: VC, vy: 0 }, T = 2 * Math.PI * R0 / VC; let rmin = R0, rmax = R0;
    for (let t = 0; t < T; t += 2) { step(s, 2); const r = Math.hypot(s.x, s.y); rmin = Math.min(rmin, r); rmax = Math.max(rmax, r); }
    console.assert(rmax / rmin < 1.001 && Math.hypot(s.x, s.y - R0) < 30e3, 'cannon: 원 궤도 한 바퀴');
    console.assert(kindOf(3) === 'fall' && kindOf(7.7) === 'fall' && kindOf(7.8) === 'orbit' && kindOf(8.5) === 'ellipse', 'cannon: 궤도 종류');
  }
  const COLS = ['#ffd84d', '#ff8a3d', '#7ee081', '#6fc3ff', '#e48cff', '#ff6b8a'];
  const KN = { fall: '떨어짐', orbit: '원 궤도', ellipse: '타원 궤도' };
  // 화면 속 시간 빠르기(실제 1초에 몇 초): 느린 포탄도 눈에 보이게, 원 궤도 한 바퀴는 약 8초
  const pace = (vk) => 150 + 500 * Math.pow(vk * 1000 / VC, 4);

  // 구름: 겉면 각 점의 3차원 자리에서 잡음을 뽑아 이음매·찌그러짐이 없게(씨앗 고정)
  const hash = (i, j, k) => { const v = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453; return v - Math.floor(v); };
  function noise(x, y, z) {
    const i = Math.floor(x), j = Math.floor(y), k = Math.floor(z), u = x - i, v = y - j, w = z - k;
    const fu = u * u * (3 - 2 * u), fv = v * v * (3 - 2 * v), fw = w * w * (3 - 2 * w), L = (a, b, t) => a + (b - a) * t, c = (a, b, d) => hash(i + a, j + b, k + d);
    return L(L(L(c(0, 0, 0), c(1, 0, 0), fu), L(c(0, 1, 0), c(1, 1, 0), fu), fv), L(L(c(0, 0, 1), c(1, 0, 1), fu), L(c(0, 1, 1), c(1, 1, 1), fu), fv), fw);
  }
  const fbm = (x, y, z) => { let s = 0, a = 0.5, f = 1; for (let o = 0; o < 5; o++) { s += a * noise(x * f, y * f, z * f); a *= 0.5; f *= 2.1; } return s / 0.97; };
  function cloudTex(T) {
    const W = 512, H = 256, c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d'), im = g.createImageData(W, H);
    for (let py = 0; py < H; py++) {
      const la = Math.PI / 2 - (py + 0.5) / H * Math.PI, cy = Math.sin(la), cr = Math.cos(la), band = 0.9 + 0.12 * Math.cos(la * 6); // 적도·중위도에 조금 더
      for (let px = 0; px < W; px++) {
        const lo = (px + 0.5) / W * Math.PI * 2, x = cr * Math.cos(lo), z = cr * Math.sin(lo);
        const n = fbm(x * 2.6 + 7, cy * 4.2, z * 2.6 - 3) * band, a = Math.max(0, Math.min(1, (n - 0.5) / 0.2)), o = (py * W + px) * 4;
        im.data[o] = im.data[o + 1] = im.data[o + 2] = 255; im.data[o + 3] = 215 * a * a * (3 - 2 * a);
      }
    }
    g.putImageData(im, 0, 0);
    const t = new T.CanvasTexture(c); t.wrapS = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace; return t;
  }

  function mount(root) {
    const stage = root.querySelector('.cn-stage'), cv = stage.querySelector('canvas'), out = root.querySelector('.cn-out'), now = root.querySelector('.cn-now');
    const gauge = root.querySelector('.cn-gauge'), list = root.querySelector('.cn-list'), texImg = root.querySelector('.cn-tex');
    const handle = root.querySelector('.cn-handle'), track = handle.querySelector('.cn-track'), knob = handle.querySelector('.cn-knob');
    const VIEW0 = { yaw: 0, pitch: 0.12, dist: 9.5, target: [0, 2.1, 0] }, ORBIT = { yaw: 0, pitch: 0.15, dist: 17.5, target: [0, 0, 0] }, FAR = { yaw: 0, pitch: 0.15, dist: 31, target: [0, -3.2, 0] };
    let placeHandle = () => {}; // 손잡이 자리 잡기(아래에서 채운다)
    let v = V0, ball = null, shots = [], t = 0, smoke = 0, msg = '';
    const s = window.Scene3D.make(stage, cv, {
      view: VIEW0, min: 6, max: 40, pmin: -1.3, pmax: 1.3, onRender: () => placeHandle(),
      onFrame(dt) { t += dt; clouds.material.map.offset.x = (t * 0.005) % 1; fly(dt); puff(dt); },
    });
    if (!s.ok) return { setActive() {}, fit() {} };
    const { T, scene } = s;
    // 바탕: 우주 + 별
    const bgc = document.createElement('canvas'); bgc.width = 4; bgc.height = 256; const b2 = bgc.getContext('2d'), bgr = b2.createLinearGradient(0, 0, 0, 256);
    bgr.addColorStop(0, '#16224d'); bgr.addColorStop(1, '#04060f'); b2.fillStyle = bgr; b2.fillRect(0, 0, 4, 256);
    scene.background = new T.CanvasTexture(bgc); scene.background.colorSpace = T.SRGBColorSpace;
    const sp = []; let seed = 4; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let k = 0; k < 600; k++) { const u = rnd() * 2 - 1, a = rnd() * Math.PI * 2, r = 90, q = Math.sqrt(1 - u * u); sp.push(Math.cos(a) * q * r, u * r, Math.sin(a) * q * r); }
    const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.Float32BufferAttribute(sp, 3));
    scene.add(new T.Points(sg, new T.PointsMaterial({ color: 0xdfe8ff, size: 0.3, sizeAttenuation: true })));
    // 빛: 해는 왼쪽 앞 위 — 오른쪽 아래가 밤
    scene.add(new T.HemisphereLight(0xdfe8ff, 0x10142a, 0.55));
    const sun = new T.DirectionalLight(0xfff4e0, 2.4); sun.position.set(-7, 6, 9); scene.add(sun); s.fill(0.25);
    const rim = new T.DirectionalLight(0x7fb4ff, 0.8); rim.position.set(8, -2, -9); scene.add(rim);
    // 지구: 사진 겉면을 돌려 한반도(37.5°N, 127.5°E)가 꼭대기(+y)에 오게
    const earthMat = new T.MeshStandardMaterial({ color: 0x2a5d9a, roughness: 0.8, metalness: 0.02 });
    const earth = new T.Mesh(new T.SphereGeometry(Rv, 96, 64), earthMat); scene.add(earth);
    { const la = 37.5 * Math.PI / 180, ph = (127.5 + 180) * Math.PI / 180, d = new T.Vector3(-Math.cos(ph) * Math.cos(la), Math.sin(la), Math.sin(ph) * Math.cos(la));
      earth.quaternion.setFromUnitVectors(d, new T.Vector3(0, 1, 0)); }
    const useTex = () => { const tx = new T.Texture(texImg); tx.colorSpace = T.SRGBColorSpace; tx.anisotropy = 4; tx.needsUpdate = true; earthMat.map = tx; earthMat.color.set(0xffffff); earthMat.needsUpdate = true; s.render(); };
    if (texImg.complete && texImg.naturalWidth) useTex(); else texImg.addEventListener('load', useTex, { once: true });
    const clouds = new T.Mesh(new T.SphereGeometry(Rv * 1.012, 72, 48), new T.MeshStandardMaterial({ map: cloudTex(T), transparent: true, depthWrite: false, roughness: 1 }));
    clouds.quaternion.copy(earth.quaternion); scene.add(clouds);
    scene.add(new T.Mesh(new T.SphereGeometry(Rv * 1.05, 48, 32), new T.MeshBasicMaterial({ color: 0x6fb4ff, transparent: true, opacity: 0.13, side: T.BackSide, depthWrite: false })));
    // 산: 오목한 비탈의 뾰족한 봉우리(높이 과장), 바위색 → 꼭대기 눈
    const top = vis(R0) - 0.06;
    const prof = []; for (let i = 0; i <= 24; i++) { const f = i / 24; prof.push(new T.Vector2(Math.max(0.004, 0.24 * Math.pow(1 - f, 1.9)), Rv - 0.05 + (top - Rv + 0.05) * f)); }
    const mg = new T.LatheGeometry(prof, 40), mp = mg.attributes.position, mcol = [];
    for (let i = 0; i < mp.count; i++) {
      const x = mp.getX(i), y = mp.getY(i), z = mp.getZ(i), f = (y - Rv) / (top - Rv), a = Math.atan2(z, x);
      const n = 1 + 0.16 * Math.sin(a * 5 + y * 9) * Math.sin(a * 3 - y * 13) * (1 - Math.abs(f - 0.4));
      mp.setX(i, x * n); mp.setZ(i, z * n);
      const snow = f > 0.78 ? 1 : 0, g = 0.42 + 0.1 * Math.sin(a * 7 + y * 20);
      mcol.push(snow ? 0.93 : g * 0.95, snow ? 0.95 : g * 0.82, snow ? 0.98 : g * 0.66);
    }
    mg.setAttribute('color', new T.Float32BufferAttribute(mcol, 3)); mg.computeVertexNormals();
    const mountain = new T.Mesh(mg, new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.95, flatShading: true })); scene.add(mountain);
    // 대포: 바퀴 달린 포가 + +x(수평)로 향한 포신
    const cannon = new T.Group(); cannon.position.set(0, top, 0); cannon.scale.setScalar(1.5); scene.add(cannon);
    const iron = new T.MeshStandardMaterial({ color: 0x3a3f4a, metalness: 0.75, roughness: 0.35 }), wood = new T.MeshStandardMaterial({ color: 0x7a4a24, roughness: 0.8 });
    const barrel = new T.Mesh(new T.CylinderGeometry(0.035, 0.05, 0.3, 20), iron); barrel.rotation.z = -Math.PI / 2; barrel.position.set(0.05, 0.075, 0); cannon.add(barrel);
    const muzzle = new T.Mesh(new T.TorusGeometry(0.038, 0.011, 8, 20), iron); muzzle.rotation.y = Math.PI / 2; muzzle.position.set(0.2, 0.075, 0); cannon.add(muzzle);
    const carriage = new T.Mesh(new T.BoxGeometry(0.2, 0.05, 0.08), wood); carriage.position.set(-0.02, 0.035, 0); cannon.add(carriage);
    [-0.05, 0.05].forEach((z) => { const w = new T.Mesh(new T.TorusGeometry(0.035, 0.011, 8, 18), wood); w.position.set(-0.02, 0.035, z); cannon.add(w); });
    // 포탄 · 화살표
    const ballM = new T.Mesh(new T.SphereGeometry(0.075, 20, 14), new T.MeshStandardMaterial({ color: 0x2b2f38, metalness: 0.6, roughness: 0.3, emissive: 0x332200, emissiveIntensity: 0.6 }));
    ballM.visible = false; scene.add(ballM);
    function arrow(color) {
      const g = new T.Group(), m = new T.MeshBasicMaterial({ color, depthTest: false });
      const sh = new T.Mesh(new T.CylinderGeometry(0.022, 0.022, 1, 10), m), hd = new T.Mesh(new T.ConeGeometry(0.06, 0.16, 14), m);
      sh.renderOrder = hd.renderOrder = 20; g.add(sh, hd); g.visible = false; scene.add(g);
      const up = new T.Vector3(0, 1, 0);
      g.set = (o, d, len) => { g.position.copy(o); g.quaternion.setFromUnitVectors(up, d.clone().normalize()); sh.scale.y = Math.max(0.01, len - 0.16); sh.position.y = (len - 0.16) / 2; hd.position.y = len - 0.08; g.tip = o.clone().addScaledVector(d.clone().normalize(), len + 0.18); };
      return g;
    }
    const gArr = arrow(0xff4d4d), vArr = arrow(0x4dd2ff);
    // 궤적: 점을 촘촘히 찍는다(어느 쪽에서 봐도 보이게)
    const MAXD = 1100, dotG = new T.SphereGeometry(0.02, 8, 6);
    function newTrail(col) {
      const m = new T.InstancedMesh(dotG, new T.MeshBasicMaterial({ color: col }), MAXD); m.count = 0; scene.add(m);
      return { m, last: null, mat: new T.Matrix4() };
    }
    function dot(tr, p) {
      if (tr.last && tr.last.distanceTo(p) < 0.05) return;
      if (tr.m.count >= MAXD) return;
      tr.mat.makeTranslation(p.x, p.y, p.z); tr.m.setMatrixAt(tr.m.count++, tr.mat); tr.m.instanceMatrix.needsUpdate = true; tr.last = p.clone();
    }
    // 연기(발사할 때)
    const smokeM = new T.Mesh(new T.SphereGeometry(0.09, 14, 10), new T.MeshBasicMaterial({ color: 0xdddddd, transparent: true, opacity: 0, depthWrite: false })); scene.add(smokeM);
    function puff(dt) { if (smoke <= 0) { smokeM.material.opacity = 0; return; } smoke = Math.max(0, smoke - dt); const k = 1 - smoke; smokeM.position.set(0.24 + k * 0.25, top + 0.08 + k * 0.08, 0); smokeM.scale.setScalar(1 + k * 3); smokeM.material.opacity = 0.75 * smoke; }
    const P3 = (x, y) => { const r = Math.hypot(x, y), k = vis(r) / r; return new T.Vector3(x * k, y * k, 0); };
    // 이름표
    const tag = (txt, cls, at) => { const el = document.createElement('span'); el.className = 'g3-label cn-lab ' + (cls || ''); el.textContent = txt; stage.appendChild(el); s.label(el, at); return el; };
    tag('대포', '', () => new T.Vector3(0.3, top + 0.4, 0));
    tag('높게 그린 산', 'cn-small', () => new T.Vector3(-0.42, Rv + 0.12, 0.2));
    const gTag = tag('중력', 'cn-g', () => (gArr.tip || new T.Vector3()));
    const vTag = tag('운동 방향', 'cn-v', () => (vArr.tip || new T.Vector3()));
    const zero = new T.Vector3(), tagPool = COLS.map(() => { const el = tag('', 'cn-shot', () => el._at || zero); return el; });
    const showArrows = (on) => { gArr.visible = vArr.visible = on; gTag.style.display = vTag.style.display = on ? '' : 'none'; };
    showArrows(false); tagPool.forEach((el) => { el.style.display = 'none'; });
    // 속력 손잡이: 대포 왼쪽에 붙어 다닌다(HTML)
    // 손잡이는 대포 왼쪽을 따라가되 무대 밖으로 나가지 않게
    const cAt = new T.Vector3(0, top + 0.1, 0);
    placeHandle = () => {
      const w = stage.offsetWidth, h = stage.offsetHeight, q = cAt.clone().project(s.camera), hw = handle.offsetWidth, hh = handle.offsetHeight;
      const x = Math.max(hw / 2 + 10, Math.min(w - hw / 2 - 10, (q.x + 1) / 2 * w - 150)), y = Math.max(hh / 2 + 64, Math.min(h - hh / 2 - 10, (1 - q.y) / 2 * h + hh / 2 - 40));
      handle.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) translate(-50%, -50%)`;
    };
    function setV(x) {
      v = Math.round(Math.max(VMIN, Math.min(VMAX, x)) * 10) / 10;
      const f = (v - VMIN) / (VMAX - VMIN); knob.style.bottom = (f * 100).toFixed(1) + '%'; knob.textContent = v.toFixed(1);
      handle.setAttribute('aria-valuenow', v.toFixed(1)); handle.setAttribute('aria-valuetext', `초속 ${v.toFixed(1)} km`);
      if (!ball) gaugeShow();
    }
    let hdrag = null;
    const fromY = (e) => { const r = track.getBoundingClientRect(); setV(VMIN + (1 - (e.clientY - r.top) / r.height) * (VMAX - VMIN)); };
    handle.addEventListener('pointerdown', (e) => { hdrag = e.pointerId; try { handle.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ } handle.classList.add('drag'); fromY(e); e.preventDefault(); });
    handle.addEventListener('pointermove', (e) => { if (hdrag === e.pointerId) fromY(e); });
    const hup = (e) => { if (hdrag !== e.pointerId) return; hdrag = null; handle.classList.remove('drag'); say(`발사 속력 <b>${v.toFixed(1)} km/s</b> — 이제 <b>대포를 눌러</b> 쏘자`); };
    handle.addEventListener('pointerup', hup); handle.addEventListener('pointercancel', hup);
    handle.addEventListener('keydown', (e) => { const d = { ArrowUp: 0.1, ArrowRight: 0.1, ArrowDown: -0.1, ArrowLeft: -0.1, PageUp: 1, PageDown: -1 }[e.key]; if (d) { e.preventDefault(); e.stopPropagation(); setV(v + d); } else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); fire(); } });
    // 대포 누르기 = 발사(누른 자리에서 끌어도 화면이 돌지 않게 잡기로 받는다)
    const nearCannon = (e) => { const p = s.toClient(new T.Vector3(0.08, top + 0.1, 0)); return Math.hypot(p.x - e.clientX, p.y - e.clientY) < 70 * p.k; };
    s.grab(nearCannon, () => ({ move() {}, up(e) { if (nearCannon(e)) fire(); } }));
    cv.addEventListener('keydown', (e) => {
      const d = { ArrowUp: 0.1, ArrowDown: -0.1 }[e.key];
      if (d) { setV(v + d); } else if (e.key === 'Enter' || e.key === ' ') fire(); else if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { s.view.yaw += e.key === 'ArrowLeft' ? 0.15 : -0.15; } else if (e.key === '0') reset(); else return;
      e.preventDefault(); e.stopPropagation(); if (!s.active) s.render();
    });
    // 두 손가락 벌리기·오므리기 = 확대·축소
    const pts = new Map(); let pinch0 = 0, dist0 = 0;
    cv.addEventListener('pointerdown', (e) => { pts.set(e.pointerId, e); if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); dist0 = s.view.dist; } });
    cv.addEventListener('pointermove', (e) => { if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, e); if (pts.size === 2 && pinch0) { const [a, b] = [...pts.values()], d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); s.view.dist = Math.max(6, Math.min(40, dist0 * pinch0 / Math.max(20, d))); } });
    const pend = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch0 = 0; };
    cv.addEventListener('pointerup', pend); cv.addEventListener('pointercancel', pend);

    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };
    const km = (m) => Math.round(m / 1000).toLocaleString();
    function gaugeShow() {
      const b = ball, k = b ? b.kind : kindOf(v);
      const alt = b ? Math.max(0, Math.hypot(b.s.x, b.s.y) - R) : H0;
      const html = `<span>발사 속력</span><b>${(b ? b.v : v).toFixed(1)} km/s</b><span>높이 ${km(alt)} km · 비행 ${b ? Math.round(b.time / 60) : 0}분</span>${b ? `<span class="cn-k ${b.kind}">${b.done ? KN[b.kind] : b.kind === 'fall' ? '날아가는 중' : KN[k]}</span>` : ''}`;
      if (gauge.innerHTML !== html) gauge.innerHTML = html;
    }
    function fire() {
      if (ball && !ball.done && ball.kind === 'fall') return; // 떨어지는 중엔 기다린다
      const kind = kindOf(v);
      if (shots.length >= COLS.length) { const old = shots.shift(); scene.remove(old.tr.m); old.tag.style.display = 'none'; tagPool.push(old.tag); }
      const col = COLS.find((c) => !shots.some((x) => x.col === c)) || COLS[0];
      const shot = { v, kind, col, tr: newTrail(col), tag: tagPool.shift(), dist: 0, done: false, lap: false };
      shot.tag._at = null; shot.tag.textContent = `${v.toFixed(1)}`; shot.tag.style.setProperty('--c', col); shot.tag.style.display = 'none';
      shots.push(shot);
      ball = { v, kind, shot, s: { x: 0, y: R0, vx: v * 1000, vy: 0 }, time: 0, ang: 0, done: false };
      ballM.visible = true; showArrows(true); smoke = 1; barrel.position.x = 0.02;
      if (window.gsap) gsap.to(barrel.position, { x: 0.05, duration: 0.5, ease: 'elastic.out(1,0.4)' });
      s.look(kind === 'ellipse' ? FAR : v >= 5.5 ? ORBIT : VIEW0);
      say(kind === 'ellipse' ? `<b>${v.toFixed(1)} km/s</b> — 원보다 빠르다. 지구에서 멀어졌다가 돌아오는 길쭉한 길(<b>타원</b>)을 그린다` : `<b>${v.toFixed(1)} km/s</b>로 발사! 포탄은 옆으로 날아가면서 <b>지구 중심 쪽</b>으로 계속 끌린다`);
      renderList(); steps(); gaugeShow(); if (!s.active) s.render();
    }
    function fly(dt) {
      if (!ball || ball.done && ball.kind === 'fall') return;
      const b = ball, sim = dt * pace(b.v), n = Math.ceil(sim / 2), h = sim / n;
      for (let i = 0; i < n; i++) {
        const a0 = Math.atan2(b.s.x, b.s.y);
        step(b.s, h); b.time += h;
        let da = Math.atan2(b.s.x, b.s.y) - a0; if (da < -Math.PI) da += 2 * Math.PI; if (da > Math.PI) da -= 2 * Math.PI; b.ang += da;
        if (Math.hypot(b.s.x, b.s.y) <= R) { land(b); break; }
        if (!b.done && b.ang >= 2 * Math.PI) { b.done = true; b.shot.done = b.shot.lap = true; b.shot.dist = 2 * Math.PI * R; lapDone(b); }
        if (!b.shot.lap) dot(b.shot.tr, P3(b.s.x, b.s.y));
      }
      const p = P3(b.s.x, b.s.y); ballM.position.copy(p);
      if (!(b.done && b.kind === 'fall')) {
        const gd = p.clone().negate().normalize(); gArr.set(p.clone().addScaledVector(gd, 0.08), gd, 0.75);
        const vd = new T.Vector3(b.s.vx, b.s.vy, 0); vArr.set(p.clone().addScaledVector(vd.clone().normalize(), 0.08), vd, 0.12 * Math.hypot(b.s.vx, b.s.vy) / 1000);
      }
      gaugeShow();
    }
    function land(b) {
      const r = Math.hypot(b.s.x, b.s.y), k = R / r; b.s.x *= k; b.s.y *= k; b.done = b.shot.done = true;
      b.shot.dist = R * Math.abs(b.ang); dot(b.shot.tr, P3(b.s.x, b.s.y));
      const tg = b.shot.tag; tg._at = P3(b.s.x, b.s.y).multiplyScalar(1.07); tg.style.display = '';
      showArrows(false);
      const far = b.shot.dist / 1000, prev = shots.filter((x) => x !== b.shot && x.kind === 'fall');
      const cmp = prev.length ? (b.v > Math.max(...prev.map((x) => x.v)) ? ' 앞서 쏜 것보다 <b>더 멀리</b> 갔다.' : '') : '';
      say(`<b>${b.v.toFixed(1)} km/s</b> → 약 <b>${Math.round(far).toLocaleString()} km</b> 날아가 떨어졌다(${Math.round(b.time / 60)}분).${cmp} ${b.v < 7 ? '손잡이를 올려 더 빠르게 쏘아 보자' : '조금만 더 빠르면…'}`);
      renderList(); steps();
    }
    function lapDone(b) {
      const tg = b.shot.tag; tg.style.display = ''; tg._at = b.kind === 'orbit' ? P3(R0, 0).multiplyScalar(1.07) : P3(0, -otherEnd(b.v * 1000)).multiplyScalar(1.04);
      say(b.kind === 'orbit' ? `<b>${b.v.toFixed(1)} km/s</b> — 약 ${Math.round(b.time / 60)}분 만에 지구를 한 바퀴 돌아 <b>제자리</b>로! 땅으로 끌리는 만큼 지표도 둥글게 휘어 나가 <b>계속 돈다</b>`
        : `<b>${b.v.toFixed(1)} km/s</b> — 멀리 갔다가 약 ${Math.round(b.time / 60)}분 만에 대포 자리로 돌아온 <b>타원 궤도</b>. 가장 먼 곳에선 느려지고 가까울수록 빨라진다`);
      renderList(); steps();
    }
    function renderList() {
      const html = shots.map((x) => `<li style="--c:${x.col}"><i></i><b>${x.v.toFixed(1)} km/s</b><span>${x.done ? (x.kind === 'fall' ? `떨어짐 · 약 ${Math.round(x.dist / 1000).toLocaleString()} km` : x.kind === 'orbit' ? '한 바퀴 · 원 궤도' : '한 바퀴 · 타원 궤도') : '날아가는 중…'}</span></li>`).join('');
      if (list.innerHTML !== html) list.innerHTML = html;
    }
    let ok = new Set();
    function steps() {
      const falls = shots.filter((x) => x.kind === 'fall' && x.done);
      if (falls.length) ok.add(1);
      if (ok.has(1) && shots.some((x) => x.done && falls.some((f) => x.v > f.v + 0.05))) ok.add(2);
      if (shots.some((x) => x.kind === 'orbit' && x.lap)) ok.add(3);
      const st = [1, 2, 3].find((q) => !ok.has(q)) || 0;
      window.L1.steps(root, st, [...ok]); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 손잡이를 낮게 두고 대포를 눌러 보자' : st === 2 ? '② 손잡이를 올려 더 빠르게 쏴 보자' : st === 3 ? '③ 지구를 한 바퀴 도는 빠르기를 찾자' : '빠르기가 알맞으면 떨어지면서도 계속 돈다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    function reset() {
      shots.forEach((x) => { scene.remove(x.tr.m); x.tag.style.display = 'none'; tagPool.push(x.tag); });
      shots = []; ball = null; ok = new Set(); ballM.visible = false; showArrows(false); setV(V0); s.look(VIEW0);
      say('<b>속력 손잡이</b>를 위아래로 끌어 빠르기를 정하고, <b>대포</b>를 누르면 산꼭대기에서 수평으로 쏜다. 빈 곳을 끌면 지구가 돌아간다');
      renderList(); steps(); gaugeShow();
    }
    root.querySelector('.cn-home').addEventListener('click', () => s.look(VIEW0));
    root.querySelector('.cn-reset').addEventListener('click', reset);
    reset();
    root._cn = {
      speed(x) { setV(x); return v; }, fire() { fire(); return ball && ball.kind; },
      run(sec) { for (let i = 0; i < sec * 60; i++) fly(1 / 60); s.render(); return this.state(); },
      state: () => ({ v, shots: shots.map((x) => ({ v: x.v, kind: x.kind, done: x.done, km: Math.round(x.dist / 1000), dots: x.tr.m.count })), ok: [...ok], view: { yaw: +s.view.yaw.toFixed(2), dist: +s.view.dist.toFixed(1) }, alt: ball ? Math.round((Math.hypot(ball.s.x, ball.s.y) - R) / 1000) : null }),
    };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.Cannon = { mount };
})();
