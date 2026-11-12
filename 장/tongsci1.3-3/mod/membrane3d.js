/* 3-3 3차시 체험 «3D 세포막»(교과서 150~151쪽 그림 Ⅲ-34 · 인지질 성분·막단백질 종류와 하는 일·유동성·당 사슬은 참고서·다른 교과서 내용).
   세포막 한 조각: 인지질 수백 개(머리 구 + 꼬리 두 가닥)가 2중층을 이루고, 위는 세포 밖·아래는 세포 안 물(떠도는 물 분자).
   막단백질 넷(통로 단백질 — 가운데 구멍, 관통 단백질 + 당 사슬, 한 층에 파묻힌 단백질, 안쪽 표면 단백질)이 천천히 옆으로 미끄러진다(유동성).
   인지질은 늘 살짝 흔들린다. 인지질을 누르면 그 하나가 밝아지고 오른쪽에 확대 카드(머리: 인산·친수성 / 꼬리: 지방산·소수성).
   아래 분자 받침에서 산소·이산화 탄소·포도당·Na⁺를 끌어 막 위에 놓으면: 작은 기체는 2중층 사이로 스며 내려가고,
   포도당·Na⁺는 머리 층에서 튕겨 떠 있다가 — 떠 있는 분자를 끌어 통로 단백질 입구에 놓으면 통로로 내려간다(촉진확산 미리 보기).
   Membrane3D.mount(root) → { fit, setActive } · 시험용: root._mb.state() · choose(k) · pick(i) · drop(k, x, z) · run(초) · screen(k) · chan() */
(function () {
  'use strict';
  const PROT = '막단백질은 아미노산들이 펩타이드결합으로 줄줄이 이어진 <b>단백질</b> — 라이보솜에서 만들어진다.';
  const INFO = {
    chan: { name: '통로 단백질', c: '#3f7fc8', job: '2중층을 위아래로 꿰뚫고, 가운데에 물질이 지나갈 구멍이 나 있다. 포도당·Na⁺처럼 2중층을 바로 건너기 어려운 물질이 이 길로 지나간다.', at: '관통 — 막의 바깥 면부터 안쪽 면까지', fn: '물질 이동', tip: '통로마다 지나가게 하는 물질이 정해져 있다. 물을 빠르게 지나가게 하는 통로 단백질도 따로 있다(물은 2중층도 지나지만 소수성 꼬리 때문에 느리다).' },
    trans: { name: '관통 단백질', c: '#5b9ee0', job: '막을 꿰뚫은 채 바깥쪽 끝에 당 사슬을 달고 있다. 밖에서 온 신호 물질을 붙잡아 세포 안에 알린다.', at: '관통 — 바깥 끝에 당 사슬', fn: '신호 전달 · 다른 세포 알아보기' },
    embed: { name: '파묻힌 단백질', c: '#6a8fd0', job: '인지질 한 층에 반쯤 박혀 있다. 막에서 일어나는 화학 반응을 돕는 효소로 일하는 것도 있다.', at: '바깥쪽 층에 반쯤 박힘', fn: '효소 작용 등' },
    surf: { name: '표면 단백질', c: '#7f8fd6', job: '2중층을 뚫지 않고 안쪽 면(세포 안 쪽)에 붙어 있다. 다른 막단백질을 붙잡아 주거나 효소로 일한다.', at: '표면 — 머리 층에 붙음', fn: '고정 · 효소 작용 등' },
    sugar: { name: '당 사슬', c: '#4f9a4a', job: '막단백질의 바깥쪽 끝에 붙은 짧은 당 사슬. 세포의 이름표처럼 다른 세포가 이 세포를 알아보는 데 쓰인다.', at: '세포 밖 쪽에만', fn: '다른 세포 알아보기(인식)', tip: '당 사슬은 세포 밖을 향한 면에만 있다 — 막의 안과 밖이 다르게 생겼다.' },
  };
  const MOL = {
    o2: { name: '산소', f: 'O₂', small: true, why: '작고 전하가 없어 지질과 잘 섞인다' },
    co2: { name: '이산화 탄소', f: 'CO₂', small: true, why: '작고 전하가 없는 기체' },
    glc: { name: '포도당', f: '포도당', small: false, why: '분자가 크고 물에 잘 녹아(지질과 안 섞임) 소수성 꼬리 층을 못 건넌다' },
    na: { name: 'Na⁺', f: 'Na⁺', small: false, why: '전하를 띠어 소수성 꼬리 층을 못 건넌다' },
  };
  const KEYS = ['o2', 'co2', 'glc', 'na'];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  // 막 치수: 머리 중심 y = ±HY, 꼬리는 머리 아래(위)로 TL만큼
  const HX = 7.6, HZ = 5.0, HY = 1.6, HR = 0.29, TL = 1.25, YTOP = 4.0, YSURF = 2.3, YIN = -2.7;
  // 큰 분자를 통로 입구에 놓았다고 보는 거리
  const CHAN_NEAR = 1.6;
  const nearChan = (x, z, c) => Math.hypot(x - c.x, z - c.z) < CHAN_NEAR;
  console.assert(nearChan(0, 0, { x: 1, z: 1 }) && !nearChan(0, 0, { x: 2, z: 0 }), 'membrane3d: 통로 입구 판정');

  function mount(root) {
    const stage = root.querySelector('.mb-stage'), cv = stage.querySelector('canvas'), now = root.querySelector('.mb-now');
    const out = root.querySelector('.mb-out'), card = root.querySelector('.mb-card'), tab = root.querySelector('.mb-tab');
    const chips = [...root.querySelectorAll('.mb-tray .tray-item')];
    const VIEW0 = { yaw: 0.5, pitch: 0.4, dist: 25, target: [0, -0.3, 0] };
    let t = 0, sel = null, lip = -1, yaw0 = VIEW0.yaw, pitch0 = VIEW0.pitch, rotated = false;
    let ok = new Set(), seen = new Set(), passed = {}, mols = [];
    const s = window.Scene3D.make(stage, cv, {
      view: VIEW0, min: 9, max: 36, pmin: -1.25, pmax: 1.4, fov: 34,
      onFrame(dt) { t += dt; tick(dt); },
      click(e) { pickAt(e); },
    });
    if (!s.ok) return { setActive() {}, fit() {} };
    const { T, scene } = s, V = (x, y, z) => new T.Vector3(x, y, z);
    scene.add(new T.HemisphereLight(0xffffff, 0x7d8ea3, 1.15));
    const key = new T.DirectionalLight(0xfff4e6, 2.0); key.position.set(5, 10, 7); scene.add(key); s.fill(0.55);
    const reg = [];
    const M = (k, o) => { const m = new T.MeshStandardMaterial(Object.assign({ roughness: 0.5, metalness: 0 }, o)); m.userData = { key: k }; reg.push(m); return m; };
    // 덩어리 단백질: 구를 늘이고 표면을 울퉁불퉁하게
    function blob(r, sc, amp, ph) {
      const g = new T.SphereGeometry(r, 48, 32), p = g.attributes.position, v = V(0, 0, 0);
      for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = v.clone().normalize(), k = 1 + amp * (Math.sin(n.x * 5 + ph) * Math.sin(n.y * 4 - ph) + 0.6 * Math.sin(n.z * 7 + n.y * 3 + ph * 2)); v.multiplyScalar(k).multiply(sc); p.setXYZ(i, v.x, v.y, v.z); }
      g.computeVertexNormals(); return g;
    }

    // ── 인지질: 머리(구)·꼬리(가닥 둘), 위층과 아래층 ──
    const L = [], D = 0.6;
    for (const sg of [1, -1]) {
      for (let r = 0, z = -HZ; z <= HZ + 1e-6; r++, z += D * 0.866) {
        for (let x = -HX + (r % 2 ? D / 2 : 0); x <= HX + 1e-6; x += D) L.push({ x: x + (rnd() - 0.5) * 0.08, z: z + (rnd() - 0.5) * 0.08, sg, ph: rnd() * 6.28, a: rnd() * 3.14, hide: 0 });
      }
    }
    const NL = L.length;
    const headM = new T.MeshStandardMaterial({ roughness: 0.35, metalness: 0.05 }), tailM = new T.MeshStandardMaterial({ roughness: 0.7 });
    const heads = new T.InstancedMesh(new T.SphereGeometry(HR, 14, 10), headM, NL);
    const tails = new T.InstancedMesh(new T.CylinderGeometry(0.075, 0.055, TL, 6, 1), tailM, NL * 2);
    heads.instanceMatrix.setUsage(T.DynamicDrawUsage); tails.instanceMatrix.setUsage(T.DynamicDrawUsage);
    const HC = new T.Color('#f0bf2a'), HC2 = new T.Color('#e2a919'), TC = new T.Color('#d38a3a'), SEL = new T.Color('#ff5a36'), SELT = new T.Color('#e8402a'), tmpC = new T.Color();
    const paint = () => {
      for (let i = 0; i < NL; i++) {
        heads.setColorAt(i, i === lip ? SEL : tmpC.copy(HC).lerp(HC2, (L[i].ph % 1)));
        tails.setColorAt(2 * i, i === lip ? SELT : TC); tails.setColorAt(2 * i + 1, i === lip ? SELT : TC);
      }
      heads.instanceColor.needsUpdate = true; tails.instanceColor.needsUpdate = true;
    };
    heads.userData.key = 'lipid'; tails.userData.key = 'lipid'; scene.add(heads, tails);

    // ── 막단백질 ──
    const prots = {};
    function prot(k, o) { const G = new T.Group(); scene.add(G); prots[k] = Object.assign({ G, k, x: o.x0, z: o.z0, meshes: [] }, o); return prots[k]; }
    const addM = (P, geo, mat, k = P.k) => { const m = new T.Mesh(geo, mat); m.userData.key = k; P.G.add(m); P.meshes.push(m); return m; };
    { // 통로 단백질: 다섯 기둥이 둘러선 고리, 가운데 구멍
      const P = prot('chan', { x0: -3.0, z0: -0.4, ax: 1.4, az: 0.9, wx: 0.11, wz: 0.083, R: 1.45, both: true }), mt = M('chan', { color: 0x3f7fc8, roughness: 0.45 });
      for (let i = 0; i < 5; i++) {
        const a = i / 5 * Math.PI * 2, m = addM(P, blob(1, V(0.46, 2.05, 0.46), 0.05, i), mt);
        m.position.set(0.78 * Math.cos(a), 0, 0.78 * Math.sin(a)); m.rotation.set(0.1 * Math.sin(a), 0, -0.1 * Math.cos(a));
      }
      const pore = addM(P, new T.CylinderGeometry(0.42, 0.42, 4.0, 24, 1, true), M('chan', { color: 0x16325e, roughness: 0.9, side: T.BackSide }));
      pore.position.y = 0;
      P.mouth = V(0, 2.25, 0);
    }
    { // 관통 단백질 + 당 사슬
      const P = prot('trans', { x0: 3.2, z0: 1.3, ax: 1.0, az: 0.8, wx: 0.09, wz: 0.07, R: 1.35, both: true });
      addM(P, blob(1, V(1.15, 2.2, 1.0), 0.07, 2), M('trans', { color: 0x5b9ee0 }));
      const sm = M('sugar', { color: 0x4f9a4a, roughness: 0.6 }), hex = new T.CylinderGeometry(0.2, 0.2, 0.1, 6);
      const pts = [[0, 2.35, 0], [0.12, 2.75, 0.05], [0.05, 3.15, 0.12], [-0.25, 3.5, 0.1], [0.4, 3.45, 0.0], [-0.5, 3.85, 0.15], [0.7, 3.8, -0.1]];
      pts.forEach(([x, y, z], i) => { const m = addM(P, hex, sm, 'sugar'); m.position.set(x, y, z); m.rotation.set(0.4 + i * 0.3, i, 0.2 * i); });
      [[0, 1], [1, 2], [2, 3], [2, 4], [3, 5], [4, 6]].forEach(([a, b]) => {
        const A = V(...pts[a]), B = V(...pts[b]), mid = A.clone().add(B).multiplyScalar(0.5), len = A.distanceTo(B);
        const m = addM(P, new T.CylinderGeometry(0.04, 0.04, len, 5), sm, 'sugar'); m.position.copy(mid); m.quaternion.setFromUnitVectors(V(0, 1, 0), B.clone().sub(A).normalize());
      });
    }
    { // 바깥 층에 파묻힌 단백질
      const P = prot('embed', { x0: 0.6, z0: -3.0, ax: 1.2, az: 0.5, wx: 0.07, wz: 0.1, R: 1.05, top: true });
      const m = addM(P, blob(1, V(0.95, 1.05, 0.85), 0.08, 4), M('embed', { color: 0x6a8fd0 })); m.position.y = 1.5;
    }
    { // 안쪽 면 표면 단백질
      const P = prot('surf', { x0: 0.0, z0: 2.4, ax: 1.3, az: 0.6, wx: 0.08, wz: 0.06, R: 0 });
      const m = addM(P, blob(1, V(1.05, 0.55, 0.85), 0.08, 1), M('surf', { color: 0x7f8fd6 })); m.position.y = -HY - HR - 0.42;
    }
    const PK = Object.keys(prots);
    function moveProt(P) { P.x = P.x0 + P.ax * Math.sin(t * P.wx * 2 + P.x0); P.z = P.z0 + P.az * Math.sin(t * P.wz * 2 + P.z0 + 1); P.G.position.set(P.x, 0, P.z); P.G.rotation.y = 0.15 * Math.sin(t * 0.05 + P.x0); }

    // ── 물(세포 밖·안): 옅은 물 층과 떠도는 물 분자 ──
    const slabM = new T.MeshBasicMaterial({ color: 0x8cc8e6, transparent: true, opacity: 0.1, depthWrite: false });
    [1, -1].forEach((sg) => { const m = new T.Mesh(new T.BoxGeometry(2 * HX + 1, 2.4, 2 * HZ + 1), slabM); m.position.y = sg * 3.35; scene.add(m); });
    const NW = 160, water = new T.InstancedMesh(new T.SphereGeometry(0.1, 8, 6), new T.MeshStandardMaterial({ color: 0x7cc0e8, roughness: 0.3 }), NW), W = [];
    for (let i = 0; i < NW; i++) { const sg = i % 2 ? 1 : -1; W.push({ x: (rnd() * 2 - 1) * HX, y: sg * (2.35 + rnd() * 2.1), z: (rnd() * 2 - 1) * HZ, ph: rnd() * 6.28 }); }
    scene.add(water);

    // ── 분자 ──
    function molMesh(k) {
      const G = new T.Group(), sp = (r, c, x = 0, y = 0, z = 0) => { const m = new T.Mesh(new T.SphereGeometry(r, 16, 12), new T.MeshStandardMaterial({ color: c, roughness: 0.3 })); m.position.set(x, y, z); G.add(m); return m; };
      if (k === 'o2') { sp(0.21, 0xe0322a, -0.15); sp(0.21, 0xe0322a, 0.15); }
      if (k === 'co2') { sp(0.2, 0x333333); sp(0.18, 0xe0322a, -0.3); sp(0.18, 0xe0322a, 0.3); }
      if (k === 'glc') {
        const ring = new T.Mesh(new T.CylinderGeometry(0.5, 0.5, 0.18, 6), new T.MeshStandardMaterial({ color: 0xf6efda, roughness: 0.4 })); G.add(ring);
        for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; sp(0.12, i === 0 ? 0xe0322a : 0x444444, 0.5 * Math.cos(a), 0, 0.5 * Math.sin(a)); if (i % 2) sp(0.1, 0xe0322a, 0.78 * Math.cos(a), 0.12, 0.78 * Math.sin(a)); }
      }
      if (k === 'na') { sp(0.3, 0x9a5ad0); }
      return G;
    }
    function spawn(k, x, z) {
      while (mols.length >= 8) kill(mols.find((m) => m.st === 'in') || mols[0]);
      const g = molMesh(k); scene.add(g);
      const tag = document.createElement('span'); tag.className = 'g3-label mb-mol'; tag.textContent = MOL[k].f; stage.appendChild(tag);
      const m = { k, g, tag, x: clamp(x, -HX + 0.5, HX - 0.5), z: clamp(z, -HZ + 0.5, HZ - 0.5), y: YTOP, st: 'fall', u: 0, op: 1 };
      s.label(tag, () => V(m.x, m.y + 0.65, m.z));
      mols.push(m); g.position.set(m.x, m.y, m.z); return m;
    }
    function kill(m) { scene.remove(m.g); m.tag.remove(); m.dead = true; mols = mols.filter((q) => q !== m); }
    const say = (h) => { if (out.innerHTML !== h) out.innerHTML = h; };
    function record(k, way) { passed[k] = Object.assign(passed[k] || {}, way); table(); steps(); }
    function land(m) {
      const M0 = MOL[m.k], c = prots.chan;
      if (M0.small) { m.st = 'pass'; m.u = 0; say(`<b>${M0.name}</b> — ${M0.why}. 인지질 사이로 스며 <b>2중층을 바로</b> 지나간다`); return; }
      if (nearChan(m.x, m.z, c)) { m.st = 'toChan'; m.u = 0; m.x0 = m.x; m.z0 = m.z; say(`<b>${M0.name}</b>이(가) <b>통로 단백질</b> 입구에 닿았다 — 구멍을 따라 세포 안으로 내려간다`); return; }
      m.st = 'bounce'; m.vy = 3.2; record(m.k, { bil: 'no' });
      say(`<b>${M0.name}</b>이(가) 머리 층에서 튕겼다 — ${M0.why}. 떠 있는 ${M0.name}을(를) 끌어 <b>통로 단백질</b> 입구에 놓아 보자`);
    }
    // 분자 움직임
    function stepMol(m, dt) {
      const c = prots.chan;
      if (m.st === 'fall') { m.y -= dt * 3; if (m.y <= YSURF) { m.y = YSURF; land(m); } }
      else if (m.st === 'bounce') { m.vy -= dt * 7; m.y += m.vy * dt; if (m.vy < 0 && m.y <= 3.3) { m.y = 3.3; m.st = 'hover'; } }
      else if (m.st === 'hover') { m.y = 3.3 + 0.12 * Math.sin(t * 2 + m.x); m.x += 0.15 * dt * Math.sin(t * 0.7 + m.z); }
      else if (m.st === 'pass') {
        m.u += dt / 3.6; m.y = YSURF + (YIN - YSURF) * m.u;
        m.x += dt * 0.5 * Math.sin(t * 5 + m.z * 3); m.z += dt * 0.5 * Math.cos(t * 4.3 + m.x * 3);
        if (m.u >= 1) { m.st = 'in'; m.u = 0; record(m.k, { bil: 'ok' }); say(`<b>${MOL[m.k].name}</b>이(가) 2중층을 지나 세포 안에 들어왔다 — 통로가 필요 없다`); }
      } else if (m.st === 'toChan') {
        m.u = Math.min(1, m.u + dt / 0.6); m.x = m.x0 + (c.x - m.x0) * m.u; m.z = m.z0 + (c.z - m.z0) * m.u; m.y = YSURF + 0.3 * Math.sin(m.u * Math.PI);
        if (m.u >= 1) { m.st = 'chan'; m.u = 0; }
      } else if (m.st === 'chan') {
        m.u += dt / 2.6; m.x = c.x; m.z = c.z; m.y = YSURF + (YIN - YSURF) * m.u;
        if (m.u >= 1) { m.st = 'in'; m.u = 0; record(m.k, { chan: 'ok' }); say(`<b>${MOL[m.k].name}</b>이(가) <b>통로 단백질</b>을 지나 세포 안에 들어왔다 — 막단백질을 거치는 확산(촉진확산)`); }
      } else if (m.st === 'in') {
        m.u += dt; m.y -= dt * 0.35; m.x += dt * 0.3 * Math.sin(t + m.z);
        if (m.u > 3.5) { m.op = Math.max(0, 1 - (m.u - 3.5) / 1.2); m.g.scale.setScalar(m.op); m.tag.style.opacity = m.op; if (m.op <= 0) { kill(m); return; } }
      }
      const spin = m.st === 'hover' || m.st === 'in' ? 0.6 : 1.4;
      m.g.position.set(m.x, m.y, m.z); m.g.rotation.y += dt * spin; m.g.rotation.x = 0.4 * Math.sin(t + m.z);
    }

    // ── 이름표 ──
    const AT = {
      chan: () => V(prots.chan.x, 2.85, prots.chan.z), trans: () => V(prots.trans.x + 1.35, 2.2, prots.trans.z + 0.3), embed: () => V(prots.embed.x, 2.9, prots.embed.z),
      surf: () => V(prots.surf.x, -3.15, prots.surf.z), sugar: () => V(prots.trans.x + 0.2, 4.35, prots.trans.z),
    };
    const tags = [];
    Object.entries(AT).forEach(([k, at]) => {
      const el = document.createElement('button'); el.type = 'button'; el.className = 'g3-label mb-tag'; el.textContent = INFO[k].name; el.dataset.k = k;
      el.addEventListener('click', () => choose(k, true)); stage.appendChild(el); s.label(el, at); tags.push(el);
    });
    // 인지질 이름표: 앞쪽 가장자리의 위층 인지질 하나
    let LIP0 = 0; { let bd = 1e9; L.forEach((q, i) => { const d = Math.abs(q.x + 4.6); if (q.sg > 0 && q.z > HZ - 0.9 && d < bd) { bd = d; LIP0 = i; } }); }
    { const el = document.createElement('button'); el.type = 'button'; el.className = 'g3-label mb-tag'; el.textContent = '인지질'; el.dataset.k = 'lipid'; el.addEventListener('click', () => pickLip(LIP0, true)); stage.appendChild(el); s.label(el, () => V(L[LIP0].x + 0.4, HY + 0.95, L[LIP0].z + 0.5)); tags.push(el); }
    [['세포 밖 · 물이 많다', 4.4, -HZ + 0.5], ['세포 안 · 물이 많다', -4.4, HZ]].forEach(([tx, y, z]) => { const el = document.createElement('span'); el.className = 'g3-label mb-side'; el.textContent = tx; stage.appendChild(el); s.label(el, V(-HX + 1.2, y, z)); });
    { const el = document.createElement('span'); el.className = 'g3-label mb-side mb-bi'; el.textContent = '인지질 2중층'; stage.appendChild(el); s.label(el, V(HX + 0.6, 0, HZ - 0.4)); }

    // ── 고르기 ──
    function pickAt(e) {
      const h = s.pick(e, [heads, tails, ...PK.flatMap((k) => prots[k].meshes)]);
      if (!h) { choose(null, true); return; }
      if (h.object === heads) pickLip(h.instanceId, true); else if (h.object === tails) pickLip(Math.floor(h.instanceId / 2), true);
      else choose(h.object.userData.key, true);
    }
    function focus(k) {
      reg.forEach((m) => { const on = k && m.userData.key === k; m.emissive.set(on ? m.color : 0x000000); m.emissiveIntensity = 0.3; });
      tags.forEach((el) => { el.classList.toggle('on', el.dataset.k === k); el.classList.toggle('dim', !!k && el.dataset.k !== k); });
    }
    function showCard(k) {
      if (!k) { card.innerHTML = '<p class="mb-empty">막단백질이나 이름표를 누르면 이름·자리·하는 일이, <b>인지질</b> 하나를 누르면 그 인지질의 확대 그림이 여기에 나온다.</p>'; return; }
      if (k === 'lipid') {
        const up = L[lip] && L[lip].sg > 0;
        card.innerHTML = `<h3 style="--c:#e8402a">인지질 하나 확대 <small>${up ? '바깥쪽 층(세포 밖 쪽)' : '안쪽 층(세포 안 쪽)'}</small></h3>${LIPSVG}`
          + '<p class="mb-tip">인지질은 지질에 <b>인산</b>이 붙은 물질. 머리는 물과 잘 어울려 <b>물이 많은 세포 안·밖</b>을 향하고, 꼬리는 물을 피해 <b>2중층 한가운데서 서로 마주 본다</b>.</p>';
        return;
      }
      const f = INFO[k];
      card.innerHTML = `<h3 style="--c:${f.c}">${f.name}</h3><p>${f.job}</p><dl><dt>자리</dt><dd>${f.at}</dd><dt>하는 일</dt><dd>${f.fn}</dd></dl>`
        + `<p class="mb-tip">${k === 'sugar' ? f.tip : PROT + ' 인지질 사이를 떠다니듯 자리를 옮긴다(<b>유동성</b>).'}${f.tip && k !== 'sugar' ? '<br>' + f.tip : ''}</p>`;
    }
    function choose(k, user) {
      sel = k || null; if (sel !== 'lipid') { lip = -1; paint(); }
      focus(sel === 'lipid' ? null : sel); showCard(sel);
      if (!sel) { if (user) say('빈 곳을 눌렀다 — 다시 모두 보인다. 끌면 막이 돌아간다'); steps(); return; }
      if (sel !== 'lipid' && sel !== 'sugar') seen.add(sel);
      if (user && sel !== 'lipid') say(`<b>${INFO[sel].name}</b> — ${INFO[sel].fn}. 막 속을 천천히 미끄러져 다닌다`);
      steps();
    }
    function pickLip(i, user) {
      lip = i; sel = 'lipid'; paint(); focus(null);
      tags.forEach((el) => el.classList.toggle('on', el.dataset.k === 'lipid'));
      showCard('lipid'); ok.add(2);
      if (user) say(`인지질 하나를 골랐다 — 동그란 <b>머리</b>(친수성)와 두 가닥 <b>꼬리</b>(소수성). ${L[i].sg > 0 ? '바깥쪽' : '안쪽'} 층이라 머리가 ${L[i].sg > 0 ? '위(세포 밖 물)' : '아래(세포 안 물)'}를 향한다`);
      steps();
    }

    // ── 받침에서 분자 끌어 놓기 ──
    const rs = () => ((window.Reveal && Reveal.getScale) ? Reveal.getScale() : 1) || 1;
    let glowChan = false;
    function planePt(e) { const p = s.planeAt(e, YSURF); return p && Math.abs(p.x) < HX + 1 && Math.abs(p.z) < HZ + 1 ? p : null; }
    function overCanvas(e) { const r = cv.getBoundingClientRect(); return e.clientX > r.left && e.clientX < r.right && e.clientY > r.top && e.clientY < r.bottom; }
    chips.forEach((b) => {
      let d = null;
      b.addEventListener('pointerdown', (e) => { d = { id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false }; try { b.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ } b.classList.add('drag'); e.preventDefault(); });
      b.addEventListener('pointermove', (e) => {
        if (!d || d.id !== e.pointerId) return; const k = rs();
        if (Math.hypot(e.clientX - d.x0, e.clientY - d.y0) > 6) d.moved = true;
        b.style.transform = `translate(${(e.clientX - d.x0) / k}px, ${(e.clientY - d.y0) / k}px)`;
        const p = overCanvas(e) && planePt(e); glowChan = !!(p && !MOL[b.dataset.m].small && nearChan(p.x, p.z, prots.chan));
      });
      const end = (e) => {
        if (!d || d.id !== e.pointerId) return; const moved = d.moved; d = null; b.classList.remove('drag'); b.style.transform = ''; glowChan = false;
        if (!moved) return; // 누르기만 하면 click(엔터와 같음)이 처리
        b._dragEnd = performance.now();
        const p = overCanvas(e) && planePt(e);
        if (!p) { say('분자를 <b>막 위</b>에 놓아야 한다 — 받침에서 끌어 세포막 조각 위에서 놓자'); return; }
        spawn(b.dataset.m, p.x, p.z);
      };
      b.addEventListener('pointerup', end); b.addEventListener('pointercancel', end);
      // 키보드·누르기: 막 위 빈 곳에 놓고, 큰 분자가 떠 있으면 통로 입구로 옮긴다
      b.addEventListener('click', () => {
        if (performance.now() - (b._dragEnd || 0) < 500) return;
        const k = b.dataset.m, h = mols.find((m) => m.k === k && m.st === 'hover');
        if (h) { h.x = prots.chan.x + 0.3; h.z = prots.chan.z; h.st = 'fall'; return; }
        const c = prots.chan; let x, z; do { x = (rnd() * 2 - 1) * (HX - 1.5); z = (rnd() * 2 - 1) * (HZ - 1.5); } while (Math.hypot(x - c.x, z - c.z) < 3);
        spawn(k, x, z);
      });
    });
    // 떠 있는 큰 분자는 막 위에서 끌어 옮긴다
    const hoverAt = (e) => { let best = null, bd = 48; mols.forEach((m) => { if (m.st !== 'hover') return; const q = s.toClient(V(m.x, m.y, m.z)), dd = Math.hypot(q.x - e.clientX, q.y - e.clientY) / (q.k || 1); if (dd < bd) { bd = dd; best = m; } }); return best; };
    s.grab((e) => !!hoverAt(e), (e) => {
      const m = hoverAt(e); m.st = 'held';
      return {
        move(ev) { const p = s.planeAt(ev, 3.3); if (p) { m.x = clamp(p.x, -HX + 0.5, HX - 0.5); m.z = clamp(p.z, -HZ + 0.5, HZ - 0.5); } glowChan = nearChan(m.x, m.z, prots.chan); },
        up() { glowChan = false; m.st = 'fall'; },
      };
    });

    function table() {
      tab.querySelectorAll('tbody tr').forEach((tr) => {
        const p = passed[tr.dataset.m] || {}, [a, b] = tr.querySelectorAll('td');
        a.className = p.bil || ''; a.textContent = p.bil === 'ok' ? '통과' : p.bil === 'no' ? '튕김' : '—';
        b.className = p.chan || ''; b.textContent = p.chan === 'ok' ? '통과' : '—';
      });
    }
    function steps() {
      if (rotated && seen.size >= 2) ok.add(1);
      const smallOk = KEYS.some((k) => MOL[k].small && passed[k] && passed[k].bil === 'ok'), bigOk = KEYS.some((k) => !MOL[k].small && passed[k] && passed[k].chan === 'ok');
      if (smallOk && bigOk) ok.add(3);
      const st = [1, 2, 3].find((q) => !ok.has(q)) || 0;
      window.L1.steps(root, st, [...ok]); window.L1.done(root, st === 0);
      chips.forEach((b) => b.classList.toggle('pulse', st === 3));
      const nt = st === 1 ? `① 빈 곳을 끌어 막을 돌려 보고, 막단백질 둘을 눌러 보자 (${Math.min(2, seen.size)}/2${rotated ? '' : ' · 아직 안 돌림'})`
        : st === 2 ? '② 노란 인지질 하나를 눌러 머리와 꼬리를 보자'
          : st === 3 ? `③ 받침의 분자를 막 위에 놓아 보자 — ${smallOk ? '작은 기체 ✓' : '작은 기체'} · ${bigOk ? '통로로 지난 분자 ✓' : '포도당·Na⁺를 통로로'}` : '작은 기체는 2중층을 바로, 포도당·이온은 막단백질로';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }

    // ── 매 프레임: 인지질 흔들림, 단백질 미끄러짐, 물 분자, 분자 이동 ──
    const o3 = new T.Object3D();
    function tick(dt) {
      if (!rotated && (Math.abs(s.view.yaw - yaw0) > 0.5 || Math.abs(s.view.pitch - pitch0) > 0.45)) { rotated = true; steps(); }
      PK.forEach((k) => moveProt(prots[k]));
      for (let i = 0; i < NL; i++) {
        const q = L[i], dx = 0.05 * Math.sin(t * 1.7 + q.ph), dz = 0.05 * Math.cos(t * 1.3 + q.ph * 1.7), dy = 0.04 * Math.sin(t * 2.1 + q.ph * 2);
        let vis = 1;
        for (const k of PK) { const P = prots[k]; if (!P.R || (P.top && q.sg < 0)) continue; const dd = Math.hypot(q.x - P.x, q.z - P.z); if (dd < P.R) { vis = 0; break; } if (dd < P.R + 0.25) vis = Math.min(vis, (dd - P.R) / 0.25); }
        const big = i === lip ? 1.18 : 1, sc = vis * big, hx = q.x + dx, hz = q.z + dz, hy = q.sg * (HY + (i === lip ? 0.12 : 0)) + dy;
        o3.position.set(hx, hy, hz); o3.rotation.set(0, 0, 0); o3.scale.setScalar(sc); o3.updateMatrix(); heads.setMatrixAt(i, o3.matrix);
        const ty = q.sg * (HY - HR - TL / 2 + 0.05) + dy, tx = 0.12 * Math.sin(t * 1.9 + q.ph), tz = 0.12 * Math.cos(t * 1.5 + q.ph);
        for (let j = 0; j < 2; j++) {
          const off = (j ? 0.1 : -0.1), ca = Math.cos(q.a) * off, sa = Math.sin(q.a) * off;
          o3.position.set(hx + ca, ty, hz + sa); o3.rotation.set(tx + (j ? 0.06 : -0.06), 0, tz); o3.scale.set(sc, sc * (j ? 1 : 0.92), sc); o3.updateMatrix(); tails.setMatrixAt(2 * i + j, o3.matrix);
        }
      }
      heads.instanceMatrix.needsUpdate = true; tails.instanceMatrix.needsUpdate = true;
      for (let i = 0; i < NW; i++) { const w = W[i]; o3.position.set(w.x + 0.25 * Math.sin(t * 0.8 + w.ph), w.y + 0.15 * Math.sin(t * 1.1 + w.ph * 2), w.z + 0.25 * Math.cos(t * 0.7 + w.ph)); o3.rotation.set(0, 0, 0); o3.scale.setScalar(1); o3.updateMatrix(); water.setMatrixAt(i, o3.matrix); }
      water.instanceMatrix.needsUpdate = true;
      mols.slice().forEach((m) => { if (!m.dead && m.st !== 'held') stepMol(m, dt); else if (m.st === 'held') m.g.position.set(m.x, 3.3, m.z); });
      const cm = prots.chan.meshes[0].material, glow = glowChan ? 0.35 + 0.25 * Math.sin(t * 8) : sel === 'chan' ? 0.3 : 0;
      cm.emissive.set(glow ? cm.color : 0x000000); cm.emissiveIntensity = glow;
      if (sel && sel !== 'lipid' && sel !== 'chan') reg.forEach((m) => { if (m.userData.key === sel) m.emissiveIntensity = 0.22 + 0.16 * Math.sin(t * 4); });
    }

    // 키보드 · 두 손가락 확대
    cv.addEventListener('keydown', (e) => {
      const v = s.view;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') v.yaw += e.key === 'ArrowLeft' ? 0.15 : -0.15;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') v.pitch = clamp(v.pitch + (e.key === 'ArrowUp' ? 0.1 : -0.1), -1.25, 1.4);
      else if (e.key === '+' || e.key === '=') v.dist = clamp(v.dist * 0.9, 9, 36);
      else if (e.key === '-') v.dist = clamp(v.dist * 1.1, 9, 36);
      else if (e.key === '0') s.look(VIEW0);
      else if (e.key === 'l' || e.key === 'L') pickLip(LIP0, true);
      else return;
      e.preventDefault(); e.stopPropagation(); if (!s.active) s.render();
    });
    const pts = new Map(); let pinch0 = 0, dist0 = 0;
    cv.addEventListener('pointerdown', (e) => { pts.set(e.pointerId, e); if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); dist0 = s.view.dist; } });
    cv.addEventListener('pointermove', (e) => { if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, e); if (pts.size === 2 && pinch0) { const [a, b] = [...pts.values()], d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); s.view.dist = clamp(dist0 * pinch0 / Math.max(20, d), 9, 36); } });
    const pend = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch0 = 0; };
    cv.addEventListener('pointerup', pend); cv.addEventListener('pointercancel', pend);

    function reset() {
      ok = new Set(); seen = new Set(); passed = {}; rotated = false; sel = null; lip = -1;
      mols.slice().forEach(kill); paint(); focus(null); showCard(null); table();
      s.look(VIEW0); yaw0 = VIEW0.yaw; pitch0 = VIEW0.pitch;
      say('빈 곳을 끌면 막이 돌아가고, 바퀴나 두 손가락으로 다가간다. 막단백질·인지질을 눌러 보자');
      steps();
    }
    root.querySelector('.mb-home').addEventListener('click', () => s.look(VIEW0));
    root.querySelector('.mb-reset').addEventListener('click', reset);
    tick(0); reset();
    root._mb = {
      state: () => ({ sel, lip, ok: [...ok], seen: [...seen], rotated, passed: JSON.parse(JSON.stringify(passed)), mols: mols.map((m) => m.k + ':' + m.st), yaw: +s.view.yaw.toFixed(2), NL }),
      choose(k) { choose(k, true); return sel; }, pick(i = LIP0) { pickLip(i, true); return lip; },
      drop(k, x, z) { spawn(k, x ?? 4, z ?? -2); return mols.length; },
      run(sec) { for (let i = 0; i < sec * 30; i++) { t += 1 / 30; tick(1 / 30); } s.render(); return this.state(); },
      chan: () => ({ x: prots.chan.x, z: prots.chan.z }),
      screen(k) { const p = k === 'chan' ? V(prots.chan.x, YSURF, prots.chan.z) : k === 'lipid' ? V(L[LIP0].x, HY, L[LIP0].z) : k.isVector3 ? k : V(prots[k].x, 0, prots[k].z), q = s.toClient(p); return { x: q.x, y: q.y }; },
      at(x, y, z) { const q = s.toClient(V(x, y, z)); return { x: q.x, y: q.y }; },
      hover: () => mols.filter((m) => m.st === 'hover').map((m) => { const q = s.toClient(V(m.x, m.y, m.z)); return { k: m.k, x: q.x, y: q.y }; }),
    };
    return { setActive: s.setActive, fit: s.fit };
  }

  // 인지질 하나 확대 그림(머리: 인산·글리세롤, 꼬리: 지방산 2개)
  const LIPSVG = `<svg class="mb-lip" viewBox="0 0 560 210" role="img" aria-label="인지질 하나 확대: 위의 둥근 머리에 인산이 든 부분과 글리세롤이 있고 친수성이다. 아래로 지방산 꼬리 두 가닥이 뻗어 있고 소수성이다">
  <defs><radialGradient id="mb-hg" cx=".38" cy=".35" r=".7"><stop offset="0" stop-color="#ffe9a6"/><stop offset=".6" stop-color="#f0bf2a"/><stop offset="1" stop-color="#b8820e"/></radialGradient></defs>
  <rect x="2" y="2" width="556" height="80" rx="10" fill="#e3f2fa"/><text x="14" y="24" font-size="17" font-weight="700" fill="#2a6f99">물</text>
  <path d="M92 92 q-8 18 0 34 t0 34 t0 34" stroke="#c97a2c" stroke-width="9" fill="none" stroke-linecap="round"/>
  <path d="M120 92 q8 18 0 34 q-10 14 4 30 t-4 38" stroke="#c97a2c" stroke-width="9" fill="none" stroke-linecap="round"/>
  <rect x="84" y="80" width="44" height="14" rx="6" fill="#e2b25a" stroke="#8a5a1a" stroke-width="2"/>
  <circle cx="106" cy="46" r="36" fill="url(#mb-hg)" stroke="#8a5a0a" stroke-width="2.5"/>
  <text x="106" y="44" font-size="15" font-weight="800" text-anchor="middle" fill="#5a3500">인산</text><text x="106" y="62" font-size="12" font-weight="700" text-anchor="middle" fill="#5a3500">든 부분</text>
  <text x="136" y="96" font-size="15" font-weight="700" fill="#6a4a1a">글리세롤</text>
  <path d="M168 12 h10 v68 h-10" stroke="#2a6f99" stroke-width="2.5" fill="none"/><path d="M168 96 h10 v108 h-10" stroke="#b5552a" stroke-width="2.5" fill="none"/>
  <text x="190" y="36" font-size="21" font-weight="800" fill="#1d2433">머리 · 친수성</text><text x="190" y="60" font-size="17" fill="#384255">물과 잘 어울린다 → 물 쪽을 향함</text>
  <text x="190" y="140" font-size="21" font-weight="800" fill="#1d2433">꼬리 · 소수성</text><text x="190" y="164" font-size="17" fill="#384255">지방산 두 가닥, 물을 피한다</text><text x="190" y="186" font-size="17" fill="#384255">→ 막 안쪽에서 꼬리끼리 마주 봄</text>
  <g transform="translate(468 18)"><circle cx="0" cy="12" r="11" fill="#f0bf2a" stroke="#8a5a0a"/><path d="M-4 23 v54 M4 23 v54" stroke="#c97a2c" stroke-width="4"/><path d="M-4 105 v54 M4 105 v54" stroke="#c97a2c" stroke-width="4"/><circle cx="0" cy="170" r="11" fill="#f0bf2a" stroke="#8a5a0a"/><text x="30" y="16" font-size="15" fill="#2a6f99">밖</text><text x="30" y="174" font-size="15" fill="#2a6f99">안</text><text x="-12" y="94" font-size="15" font-weight="700" fill="#b5552a" text-anchor="end">2중층</text></g>
</svg>`;
  window.Membrane3D = { mount };
})();
