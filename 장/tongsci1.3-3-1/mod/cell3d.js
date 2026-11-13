/* 3-3 1차시 체험 «3D 세포 속으로»(교과서 144쪽 그림 Ⅲ-28 · 막 구조·액포·세포벽·진핵세포·ATP는 참고서·다른 교과서 내용).
   4분의 1(x>0, z>0)을 잘라 낸 세포. 잘린 면(세포질·핵·액포·세포벽)은 뚜껑을 덮어 단면으로 보이고, 그 뒤 소기관이 비친다.
   동물 세포(둥근 막) ↔ 식물 세포(세포벽에 싸인 상자, 엽록체·큰 중앙 액포)는 위쪽 그림 표지로 바꾼다.
   부분(또는 이름표)을 누르면 그 부분만 밝고 나머지는 흐려지며, 오른쪽 칸에 이름·하는 일·막·있는 세포가 나온다.
   소낭이 소포체 → 골지체 → 세포막 쪽으로 늘 흘러간다. ③ 단백질 길을 차례로 누르면 노란 «단백질»이 그 길로 나간다.
   Cell3D.mount(root) → { fit, setActive } · 시험용: root._cl.state() · choose(key) · mode(m) · screen(key) → 화면 좌표 */
(function () {
  'use strict';
  const INFO = {
    nucleus: { name: '핵', c: '#8a5cc7', job: 'DNA(유전 물질)를 품고 있어, 세포가 어떤 단백질을 언제 만들지 정한다. 세포의 생명활동을 지휘하는 곳으로 소기관 가운데 가장 크다.', mem: [1, '있음 · 2겹 핵막, 군데군데 뚫린 핵공으로 물질이 드나든다'], who: [1, 1], tip: '핵막에 싸인 뚜렷한 핵이 있으면 진핵세포 — 동물·식물 세포 모두 진핵세포다. 세균처럼 핵막이 없으면 원핵세포.' },
    ribo: { name: '라이보솜', c: '#3b3f8c', job: '핵에서 온 정보대로 아미노산을 줄줄이 이어(펩타이드결합) 단백질을 만드는 작은 알갱이. 소포체 겉에 붙어 있거나 세포질에 떠 있다.', mem: [0, '없음 · 세포소기관 가운데 막이 없는 것은 라이보솜뿐'], who: [1, 1] },
    er: { name: '소포체', c: '#4f8fd6', job: '핵막에서 이어져 나온 납작한 주머니와 관의 그물. 라이보솜이 만든 단백질을 골지체 등 세포 곳곳으로 실어 나르는 통로다.', mem: [1, '있음 · 1겹 막으로 된 주머니'], who: [1, 1], tip: '겉에 라이보솜이 붙어 오돌토돌한 것이 거친면 소포체. 라이보솜이 없는 매끈면 소포체는 지방 같은 지질을 만든다.' },
    golgi: { name: '골지체', c: '#e8913a', job: '소포체에서 넘어온 단백질을 손보고(변형) 작은 막 주머니(소낭)에 담아 내보낸다. 그 소낭이 세포막에 붙어 하나가 되면 단백질이 세포 밖으로 나간다.', mem: [1, '있음 · 납작한 막 주머니가 여러 겹 포개진 모양'], who: [1, 1] },
    mito: { name: '마이토콘드리아', c: '#e4733a', job: '산소로 포도당 같은 유기물을 분해하는 세포호흡이 일어나는 곳. 거기서 나온 에너지를 세포가 바로 쓰는 ATP에 옮겨 담는다(산소 흡수, 이산화 탄소 방출).', mem: [1, '있음 · 2중막, 안쪽 막이 안으로 주름져 넓다'], who: [1, 1], tip: 'ATP는 아데닌·당(라이보스)·인산 3개가 이어진 에너지 저장 물질. 생물은 이것을 쪼개 얻은 에너지를 생명활동에 곧바로 쓴다.' },
    chloro: { name: '엽록체', c: '#3f9a3c', job: '빛에너지를 받아 이산화 탄소와 물로 포도당을 만드는 광합성 장소. 빛에너지를 포도당 속 화학 에너지로 바꾼다(이산화 탄소 흡수, 산소 방출).', mem: [1, '있음 · 2중막, 안에 원반 모양 주머니가 동전처럼 쌓여 있다'], who: [0, 1], tip: '엽록체가 포도당에 담은 에너지를 마이토콘드리아가 ATP로 옮긴다 — 둘 다 에너지를 바꾸는 소기관이다.' },
    vac: { name: '액포', c: '#7fb8d8', job: '물·색소·노폐물 따위를 담아 두는 막 주머니. 동물 세포의 액포는 작고 수도 적다.', jobP: '세포액이 가득 찬 커다란 막 주머니. 식물 세포가 자랄수록 커져 세포 안을 거의 채우고, 물을 머금어 세포의 삼투압(팽팽함)을 지킨다. 꽃잎 색소도 여기 들어 있다.', mem: [1, '있음 · 1겹 막(액포막)'], who: [1, 1], tip: '둘 다 있지만 다 자란 식물 세포일수록 훨씬 크다.' },
    membrane: { name: '세포막', c: '#e9a77a', job: '세포 전체를 감싸는 얇은 막. 안과 밖을 갈라 세포를 독립된 공간으로 만들고, 무엇이 드나들지 골라 조절한다.', mem: [1, '세포막 자체가 막 · 주성분은 인지질과 단백질'], who: [1, 1], tip: '골지체에서 온 소낭이 세포막과 합쳐지며 단백질이 밖으로 나간다.' },
    wall: { name: '세포벽', c: '#c9a46a', job: '세포막 바깥을 둘러싼 두껍고 단단한 벽. 세포를 보호하고 모양이 무너지지 않게 버텨 준다. 주성분은 셀룰로스.', mem: [-1, '막이 아니다 · 셀룰로스로 된 벽(세포막 바깥)'], who: [0, 1], tip: '물질 출입을 고르는 것은 세포막, 모양을 지키는 것은 세포벽 — 헷갈리지 말자.' },
    cyto: { name: '세포질', c: '#9fcbe6', job: '세포막 안에서 핵을 뺀 나머지 부분. 소기관이 그 속에 떠 있고, 물에 여러 물질이 녹아 있어 많은 화학 반응이 여기서 일어난다.', mem: [-1, '소기관이 아니다 · 막 안을 채운 바탕'], who: [1, 1] },
  };
  const PATH = ['ribo', 'er', 'golgi', 'membrane'], NEWP = ['wall', 'chloro', 'vac'];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  // 시험: 단백질 길 차례 판정
  function nextPath(i, k) { return k === PATH[i] ? i + 1 : k === PATH[0] ? 1 : i > 0 ? -1 : 0; }
  console.assert(nextPath(0, 'ribo') === 1 && nextPath(1, 'er') === 2 && nextPath(2, 'mito') === -1 && nextPath(0, 'golgi') === 0 && nextPath(3, 'membrane') === 4, 'cell3d: 단백질 길 차례');

  function mount(root) {
    const stage = root.querySelector('.cl-stage'), cv = stage.querySelector('canvas'), now = root.querySelector('.cl-now');
    const out = root.querySelector('.cl-out'), card = root.querySelector('.cl-card'), pathEl = root.querySelector('.cl-path');
    const tabs = [...root.querySelectorAll('.cl-tab')];
    const VIEW0 = { yaw: 0.78, pitch: 0.42, dist: 20, target: [0, -0.3, 0] };
    let mode = 'animal', sel = null, t = 0, yaw0 = VIEW0.yaw, rotated = false, pathI = 0, parcel = null;
    let ok = new Set(), seenA = new Set(), seenP = new Set();
    const s = window.Scene3D.make(stage, cv, {
      view: VIEW0, min: 8, max: 34, pmin: -1.2, pmax: 1.35, fov: 34,
      onFrame(dt) { t += dt; tick(dt); },
      click(e) { choose(pickAt(e), true); },
    });
    if (!s.ok) return { setActive() {}, fit() {} };
    const { T, scene } = s;
    s.renderer.localClippingEnabled = true;
    scene.add(new T.HemisphereLight(0xffffff, 0x8796a8, 1.1));
    const key = new T.DirectionalLight(0xfff4e6, 2.1); key.position.set(6, 10, 8); scene.add(key); s.fill(0.6);
    const V = (x, y, z) => new T.Vector3(x, y, z);
    const PL = (x, y, z) => new T.Plane(V(x, y, z), 0);
    const WEDGE = [PL(-1, 0, 0), PL(0, 0, -1)]; // x>0 이면서 z>0 인 곳만 잘라 낸다
    const KEEP = { x: [PL(0, 0, 1)], z: [PL(1, 0, 0)] }; // x=0 면 뚜껑은 z>0 쪽만, z=0 면 뚜껑은 x>0 쪽만
    const inWedge = (p) => p.x > 0.03 && p.z > 0.03;
    // 재질: 모두 등록해 두고 고른 것만 남기고 흐리게 한다
    const reg = [];
    function M(k, o, clip) {
      const m = new T.MeshStandardMaterial(Object.assign({ roughness: 0.55, metalness: 0 }, o, clip === 'w' ? { clippingPlanes: WEDGE, clipIntersection: true } : clip ? { clippingPlanes: KEEP[clip] } : {}));
      m.userData = { key: k, op: m.opacity, tr: m.transparent, dw: m.depthWrite }; reg.push(m); return m;
    }
    const mesh = (parent, geo, mat, k) => { const m = new T.Mesh(geo, mat); m.userData.key = k ?? mat.userData.key; parent.add(m); return m; };
    // 단면 뚜껑: x=0 면이면 (u, v) = (z, y), z=0 면이면 (x, y). off만큼 보는 쪽으로 띄운다
    function face(parent, plane, shape, mat, off = 0) {
      const g = new T.ShapeGeometry(shape, 48);
      if (plane === 'x') g.rotateY(-Math.PI / 2);
      const m = mesh(parent, g, mat); if (plane === 'x') m.position.x = off; else m.position.z = off; return m;
    }
    const ell = (cu, cv2, ru, rv) => { const sh = new T.Shape(); sh.absellipse(cu, cv2, ru, rv, 0, Math.PI * 2, false); return sh; };
    function rrect(cu, cv2, hu, hv, r, P = T.Shape) {
      const p = new P(), x0 = cu - hu, x1 = cu + hu, y0 = cv2 - hv, y1 = cv2 + hv;
      p.moveTo(x0 + r, y0); p.lineTo(x1 - r, y0); p.quadraticCurveTo(x1, y0, x1, y0 + r); p.lineTo(x1, y1 - r); p.quadraticCurveTo(x1, y1, x1 - r, y1);
      p.lineTo(x0 + r, y1); p.quadraticCurveTo(x0, y1, x0, y1 - r); p.lineTo(x0, y0 + r); p.quadraticCurveTo(x0, y0, x0 + r, y0); return p;
    }
    // 둥근 상자(식물 세포벽·액포): 상자 꼭짓점을 안쪽 상자에서 r만큼 밀어낸다. 법선도 그 방향
    function rbox(h, r, seg = 28) {
      const g = new T.BoxGeometry(2 * h.x, 2 * h.y, 2 * h.z, seg, seg, seg), p = g.attributes.position, n = g.attributes.normal, v = V(0, 0, 0), q = V(0, 0, 0);
      for (let i = 0; i < p.count; i++) {
        v.fromBufferAttribute(p, i); q.set(clamp(v.x, r - h.x, h.x - r), clamp(v.y, r - h.y, h.y - r), clamp(v.z, r - h.z, h.z - r));
        v.sub(q); const d = v.length() || 1; v.divideScalar(d); n.setXYZ(i, v.x, v.y, v.z); v.multiplyScalar(r).add(q); p.setXYZ(i, v.x, v.y, v.z);
      }
      return g;
    }
    // 반쪽 껍질(마이토콘드리아·엽록체): 긴 축 y, +x 쪽 반만 — 열린 면이 -x를 본다
    const halfLathe = (prof, sc) => new T.LatheGeometry(prof.map(([a, b]) => new T.Vector2(a * sc, b * sc)), 40, 0, Math.PI);
    const capsule = (L, r) => { const pts = []; for (let i = 0; i <= 12; i++) { const a = -Math.PI / 2 + i / 12 * Math.PI / 2; pts.push([Math.max(1e-3, r * Math.cos(a)), -L + r * Math.sin(a)]); } for (let i = 0; i <= 12; i++) { const a = i / 12 * Math.PI / 2; pts.push([Math.max(1e-3, r * Math.cos(a)), L + r * Math.sin(a)]); } return pts; };
    const lens = (L, r) => { const pts = []; for (let i = 0; i <= 24; i++) { const a = -Math.PI / 2 + i / 24 * Math.PI; pts.push([Math.max(1e-3, r * Math.pow(Math.cos(a), 0.8)), L * Math.sin(a)]); } return pts; };
    // 긴 축 A, 열린 면이 바라볼 쪽 D로 돌리기
    function orient(g, A, D) {
      const y = A.clone().normalize(), x = D.clone().sub(y.clone().multiplyScalar(D.dot(y))).normalize().negate(), z = V(0, 0, 0).crossVectors(x, y);
      g.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(x, y, z));
    }
    const CAM = V(Math.sin(VIEW0.yaw), 0.55, Math.cos(VIEW0.yaw)).normalize();

    // 공통 재질(두 세포가 함께 쓴다)
    const mt = {
      nuc: M('nucleus', { color: 0x8a5cc7, roughness: 0.45, side: T.DoubleSide }, 'w'),
      pore: M('nucleus', { color: 0x5b3896, roughness: 0.5 }),
      er: M('er', { color: 0x4f8fd6, roughness: 0.5, side: T.DoubleSide }, 'w'),
      ribo: M('ribo', { color: 0x2e3170, roughness: 0.4 }),
      golgi: M('golgi', { color: 0xe8913a, roughness: 0.4, side: T.DoubleSide }),
      ves: M('golgi', { color: 0xf0a85a, roughness: 0.35 }),
      mOut: M('mito', { color: 0xd8602e, roughness: 0.5, side: T.DoubleSide }),
      mIn: M('mito', { color: 0xf08a50, roughness: 0.5, side: T.DoubleSide }),
      mMat: M('mito', { color: 0xf7c9a0, roughness: 0.7, side: T.DoubleSide }),
      cOut: M('chloro', { color: 0x2f7d2c, roughness: 0.5, side: T.DoubleSide }),
      cStroma: M('chloro', { color: 0xa9d77a, roughness: 0.7, side: T.DoubleSide }),
      cGr: M('chloro', { color: 0x1f6a24, roughness: 0.45 }),
      vac: M('vac', { color: 0x9fd3ec, roughness: 0.2, transparent: true, opacity: 0.55, side: T.DoubleSide, depthWrite: false }),
    };
    // 핵 단면 뚜껑 재질(면마다 잘라 낼 쪽이 다르다)
    const capM = {}; ['x', 'z'].forEach((p) => {
      capM[p] = {
        env: M('nucleus', { color: 0x6c3fb0, roughness: 0.5, side: T.DoubleSide }, p),
        gap: M('nucleus', { color: 0xe5d6f7, roughness: 0.6, side: T.DoubleSide }, p),
        plasm: M('nucleus', { color: 0xdccbf2, roughness: 0.75, side: T.DoubleSide }, p),
        chrom: M('nucleus', { color: 0x5a2f94, roughness: 0.55, side: T.DoubleSide }, p),
        cyto: M('cyto', { color: 0xbfe0f2, roughness: 0.8, transparent: true, opacity: 0.3, side: T.DoubleSide, depthWrite: false }, p),
        vac: M('vac', { color: 0xb6dff2, roughness: 0.3, transparent: true, opacity: 0.45, side: T.DoubleSide, depthWrite: false }, p),
      };
    });
    const ribG = new T.SphereGeometry(0.07, 8, 6);
    function ribosomes(parent, pts) {
      const im = new T.InstancedMesh(ribG, mt.ribo, pts.length), m4 = new T.Matrix4();
      pts.forEach((p, i) => { m4.makeTranslation(p.x, p.y, p.z); im.setMatrixAt(i, m4); });
      im.userData.key = 'ribo'; parent.add(im); return im;
    }
    // 핵: 2겹 핵막(뚫린 핵공) + DNA 실 + 인. 잘린 면에는 겹 고리와 핵질 뚜껑
    function nucleus(G, c, R) {
      mesh(G, new T.SphereGeometry(R, 64, 40), mt.nuc).position.copy(c);
      mesh(G, new T.SphereGeometry(R * 0.94, 48, 32), mt.nuc).position.copy(c);
      const pts = []; const N = 70;
      for (let i = 0; i < N; i++) { const y = 1 - 2 * (i + 0.5) / N, r = Math.sqrt(1 - y * y), a = i * 2.39996; const d = V(r * Math.cos(a), y, r * Math.sin(a)); if (!inWedge(d.clone().multiplyScalar(R).add(c))) pts.push(d); }
      const pore = new T.InstancedMesh(new T.TorusGeometry(0.1, 0.035, 6, 14), mt.pore, pts.length), m4 = new T.Matrix4(), q = new T.Quaternion();
      pts.forEach((d, i) => { q.setFromUnitVectors(V(0, 0, 1), d); m4.compose(d.clone().multiplyScalar(R * 1.005).add(c), q, V(1, 1, 1)); pore.setMatrixAt(i, m4); });
      pore.userData.key = 'nucleus'; G.add(pore);
      // 뚜껑: 면과 핵 중심 사이 거리만큼 줄어든 원
      [['x', c.x, c.z], ['z', c.z, c.x]].forEach(([p, d]) => {
        if (Math.abs(d) >= R) return; const k = Math.sqrt(R * R - d * d), cu = p === 'x' ? c.z : c.x, m = capM[p];
        face(G, p, ell(cu, c.y, k, k), m.env, 0.012); face(G, p, ell(cu, c.y, k * 0.965, k * 0.965), m.gap, 0.016);
        face(G, p, ell(cu, c.y, k * 0.945, k * 0.945), m.env, 0.02); face(G, p, ell(cu, c.y, k * 0.91, k * 0.91), m.plasm, 0.024);
        face(G, p, ell(cu + k * 0.42, c.y - k * 0.2, k * 0.24, k * 0.2), m.chrom, 0.03); // 인
        // 잘린 면 위의 DNA 실(염색사): 핵질 안에서 구불구불
        const at = (u, v) => (p === 'x' ? V(0.034, v, u) : V(u, v, 0.034));
        for (let n = 0; n < 11; n++) {
          let u = cu + (rnd() - 0.3) * k * 0.9, v = c.y + (rnd() - 0.5) * k * 1.2, a = rnd() * 6; const ps = [];
          for (let j = 0; j < 16; j++) { const du = u - cu, dv = v - c.y, dd = Math.hypot(du, dv); if (dd > k * 0.8) { u = cu + du * 0.8 * k / dd; v = c.y + dv * 0.8 * k / dd; a += 2; } ps.push(at(u, v)); a += (rnd() - 0.5) * 2.2; u += Math.cos(a) * k * 0.13; v += Math.sin(a) * k * 0.13; }
          mesh(G, new T.TubeGeometry(new T.CatmullRomCurve3(ps), 60, 0.028, 5), m.chrom);
        }
      });
    }
    // 거친 소포체: 핵을 둘러싼 물결진 겹 주머니(두 장이 한 주머니) + 겉의 라이보솜
    function er(G, c, rs, ph0, phL, th0, thL, ribs) {
      rs.forEach((r, i) => {
        [0, 0.1].forEach((dr) => {
          const g = new T.SphereGeometry(1, 56, 22, ph0, phL, th0, thL), p = g.attributes.position, v = V(0, 0, 0);
          for (let j = 0; j < p.count; j++) {
            v.fromBufferAttribute(p, j); const ph = Math.atan2(v.z, -v.x), th = Math.acos(clamp(v.y, -1, 1));
            const rr = r + dr + 0.13 * Math.sin(ph * 7 + i * 1.7) * Math.sin(th * 5 + i) + (dr ? 0.03 * Math.sin(ph * 23) : 0);
            v.multiplyScalar(rr).add(c); p.setXYZ(j, v.x, v.y, v.z);
          }
          g.computeVertexNormals(); mesh(G, g, mt.er);
        });
        for (let j = 0; j < 90; j++) {
          const ph = ph0 + rnd() * phL, th = th0 + rnd() * thL, rr = r + 0.19 + 0.13 * Math.sin(ph * 7 + i * 1.7) * Math.sin(th * 5 + i);
          const d = V(-Math.cos(ph) * Math.sin(th), Math.cos(th), Math.sin(ph) * Math.sin(th)).multiplyScalar(rr).add(c);
          if (!inWedge(d)) ribs.push(d);
        }
      });
    }
    // 골지체: 휘어진 납작한 주머니 5장 + 가장자리에서 떨어지는 소낭. 쌓인 축(+y)을 dir로
    function golgi(G, pos, dir, sc) {
      const g = new T.Group(); g.position.copy(pos); g.quaternion.setFromUnitVectors(V(0, 1, 0), dir.clone().normalize()); g.scale.setScalar(sc); G.add(g);
      for (let i = 0; i < 5; i++) {
        const R = 1.05 - Math.abs(i - 2) * 0.12, prof = [];
        for (let j = 0; j <= 20; j++) { const a = -Math.PI / 2 + j / 20 * Math.PI, rim = Math.pow(Math.cos(a), 0.35); prof.push(new T.Vector2(Math.max(1e-3, R * rim), 0.06 * Math.sin(a) * (1 + 0.6 * Math.pow(rim, 8)))); }
        const geo = new T.LatheGeometry(prof, 40), p = geo.attributes.position, v = V(0, 0, 0);
        for (let j = 0; j < p.count; j++) { v.fromBufferAttribute(p, j); const rho = Math.hypot(v.x, v.z) / 1.05; p.setXYZ(j, v.x * 1.35, v.y + (i - 2) * 0.2 + 0.32 * rho * rho, v.z * 0.8); }
        geo.computeVertexNormals(); const m = mesh(g, geo, mt.golgi); m.userData.key = 'golgi';
      }
      const vg = new T.SphereGeometry(0.12, 14, 10);
      [[1.45, 0.4, 0.2], [-1.4, 0.55, -0.15], [1.3, 0.75, -0.45], [-1.2, 0.2, 0.5], [0.4, 0.95, 0.75], [-0.6, 0.85, -0.75]].forEach(([x, y, z]) => mesh(g, vg, mt.golgi).position.set(x, y, z));
      return g;
    }
    // 마이토콘드리아: 반으로 갈라 2중막과 안쪽 주름(크리스타)이 보이게
    function mito(G, pos, A, L = 0.55, r = 0.42) {
      const g = new T.Group(); g.position.copy(pos); orient(g, A, CAM); G.add(g);
      mesh(g, halfLathe(capsule(L, r), 1), mt.mOut); mesh(g, halfLathe(capsule(L, r), 0.86), mt.mIn);
      const plate = (k, col) => { const sh = rrect(0, 0, r * k, L + r * k, r * k * 0.98); return sh; };
      const f1 = face(g, 'x', plate(1), mt.mOut, -0.002), f2 = face(g, 'x', plate(0.93), mt.mMat, -0.012), f3 = face(g, 'x', plate(0.86), mt.mIn, -0.022), f4 = face(g, 'x', plate(0.8), mt.mMat, -0.03);
      [f1, f2, f3, f4].forEach((f) => { f.geometry.rotateY(Math.PI); }); // 열린 면(-x)에서 보이게 뒤집기
      for (let i = 0; i < 6; i++) {
        const y = -L - r * 0.45 + (i + 0.5) * (2 * L + r * 0.9) / 6, side = i % 2 ? 1 : -1;
        const cr = mesh(g, new T.BoxGeometry(r * 0.85, 0.07, r * 1.05), mt.mIn); cr.position.set(r * 0.425 - 0.05, y, side * r * 0.33);
      }
      g.userData.base = pos.clone(); g.userData.ph = rnd() * 6; return g;
    }
    // 엽록체: 렌즈 모양을 반으로 갈라 2중막 + 기질 + 동전처럼 쌓인 틸라코이드(그라나)
    function chloro(G, pos, A, D, L = 0.95, r = 0.55) {
      const g = new T.Group(); g.position.copy(pos); orient(g, A, D || CAM); G.add(g);
      const shell = mesh(g, halfLathe(lens(L, r), 1), mt.cOut); shell.scale.z = 0.55;
      const inner = mesh(g, halfLathe(lens(L, r), 0.92), mt.cOut); inner.scale.z = 0.55;
      const sh = (k) => ell(0, 0, r * 0.55 * k, L * k);
      const a = face(g, 'x', sh(1), mt.cOut, -0.002), b = face(g, 'x', sh(0.9), mt.cStroma, -0.012);
      [a, b].forEach((f) => f.geometry.rotateY(Math.PI));
      const coin = new T.CylinderGeometry(0.15, 0.15, 0.04, 18);
      for (let i = 0; i < 5; i++) {
        const y = -L * 0.62 + i * L * 0.31, n = i % 2 ? 4 : 5;
        for (let j = 0; j < n; j++) { const cn = mesh(g, coin, mt.cGr); cn.rotation.x = Math.PI / 2; cn.position.set(0.02, y, (j - (n - 1) / 2) * 0.062); }
        if (i < 4) { const lam = mesh(g, new T.BoxGeometry(0.02, L * 0.31, 0.025), mt.cGr); lam.position.set(-0.02, y + L * 0.155, (i % 2 ? 1 : -1) * 0.05); }
      }
      g.userData.base = pos.clone(); g.userData.ph = rnd() * 6; return g;
    }
    // 소낭 흐름: 소포체 → 골지체(들어감) → 골지체 반대쪽에서 → 세포막과 합쳐짐
    function flow(G, a0, a1, b0, b1) {
      const lift = (p, q, k) => p.clone().lerp(q, 0.5).add(V(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(k));
      const curves = [0, 1, 2].map(() => [new T.CatmullRomCurve3([a0.clone().add(V(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(0.5)), lift(a0, a1, 0.6), a1]),
        new T.CatmullRomCurve3([b0, lift(b0, b1, 0.9), b1.clone().add(V(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(0.8))])]);
      const vg = new T.SphereGeometry(0.15, 14, 10), list = [];
      for (let i = 0; i < 10; i++) { const m = new T.Mesh(vg, mt.ves); G.add(m); list.push({ m, c: curves[i % 3], ph: i % 2, u: (i * 0.37) % 1 }); }
      return { list, path: new T.CatmullRomCurve3([a0, lift(a0, a1, 0.3), a1, b0, lift(b0, b1, 0.3), b1]) };
    }

    // ── 동물 세포: 납작한 공 ──
    const A = { G: new T.Group(), pick: [], tags: [], at: {} }; scene.add(A.G);
    {
      const G = A.G, RA = V(5.2, 4.3, 5.2), c = V(-0.3, 0.35, -0.3), RN = 1.75;
      const memM = M('membrane', { color: 0xf0b48a, roughness: 0.4, transparent: true, opacity: 0.5, side: T.DoubleSide, depthWrite: false }, 'w');
      const memIn = M('membrane', { color: 0xf7d2b6, roughness: 0.6, transparent: true, opacity: 0.35, side: T.BackSide, depthWrite: false }, 'w');
      const ringM = { x: M('membrane', { color: 0xd98a5a, roughness: 0.5, side: T.DoubleSide }, 'x'), z: M('membrane', { color: 0xd98a5a, roughness: 0.5, side: T.DoubleSide }, 'z') };
      mesh(G, new T.SphereGeometry(1, 96, 64), memM).scale.copy(RA);
      mesh(G, new T.SphereGeometry(0.985, 96, 64), memIn).scale.copy(RA);
      ['x', 'z'].forEach((p) => {
        const ring = ell(0, 0, RA.z, RA.y); ring.holes.push(ell(0, 0, RA.z - 0.13, RA.y - 0.13));
        face(G, p, ring, ringM[p], 0.004);
        face(G, p, ell(0, 0, RA.z - 0.13, RA.y - 0.13), capM[p].cyto, 0);
      });
      nucleus(G, c, RN);
      const ribs = [];
      er(G, c, [2.15, 2.5, 2.85], 0, 3.5, Math.PI * 0.3, Math.PI * 0.32, ribs);
      er(G, c, [2.3, 2.7], 2.2, 3.0, Math.PI * 0.55, Math.PI * 0.3, ribs);
      const gp = V(-1.6, -1.05, 3.55), gd = gp.clone().sub(c).normalize();
      golgi(G, gp, gd, 1.05);
      const mitos = [mito(G, V(2.7, -1.5, -1.05), V(1, 0.25, 0.4)), mito(G, V(-1.3, 2.25, 2.7), V(0.3, 0.2, 1)), mito(G, V(2.3, 1.7, -2.3), V(1, -0.3, -0.6)), mito(G, V(-2.7, -2.0, 1.5), V(0.2, 0.6, 1)), mito(G, V(1.0, -2.9, -2.6), V(1, 0.1, -0.2))];
      mesh(G, new T.SphereGeometry(0.5, 24, 16), mt.vac).position.set(1.9, -2.3, -1.4);
      mesh(G, new T.SphereGeometry(0.38, 24, 16), mt.vac).position.set(-2.9, 0.9, 1.9);
      // 세포질에 떠 있는 라이보솜(한 군데는 몰려 있게)
      for (let i = 0; i < 230; i++) {
        const p = V(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1).multiply(RA).multiplyScalar(0.93);
        if (p.clone().divide(RA).length() > 0.93 || inWedge(p) || p.distanceTo(c) < 3.05) continue; ribs.push(p);
      }
      for (let i = 0; i < 26; i++) ribs.push(V(1.5 + Math.cos(i * 0.5) * 0.08 * i * 0.25, -1.2 + Math.sin(i * 0.9) * 0.35, -0.25 - (i % 5) * 0.06));
      ribosomes(G, ribs);
      A.flow = flow(G, c.clone().add(gd.clone().multiplyScalar(2.95)), gp.clone().sub(gd.clone().multiplyScalar(0.55)), gp.clone().add(gd.clone().multiplyScalar(0.55)).add(V(0.3, 0, 0)), V(-1.75, -1.25, 4.6));
      A.mitos = mitos;
      A.at = { nucleus: V(0.9, 1.3, 0.9), er: V(2.6, 1.0, 0.25), golgi: gp.clone().add(V(0.5, 1.15, 0.4)), mito: V(3.4, -0.55, -0.4), ribo: V(1.1, -1.95, 0.3), vac: V(1.6, -3.05, -0.9), membrane: V(-2.6, 3.55, 2.2), cyto: V(4.0, -2.2, 0.1) };
      A.hit = { nucleus: V(0.02, 0.6, 0.5), er: V(2.25, 0.6, 0.05), golgi: gp.clone(), mito: V(2.7, -1.5, -1.0), ribo: V(1.5, -1.2, -0.25), vac: V(1.9, -2.3, -1.4), membrane: V(-2.2, 3.4, 1.9), cyto: V(3.4, -2.2, 0.02) };
    }
    // ── 식물 세포: 세포벽에 싸인 둥근 상자, 큰 중앙 액포 ──
    const P = { G: new T.Group(), pick: [], tags: [], at: {} }; scene.add(P.G); P.G.visible = false;
    {
      const G = P.G, HW = V(5.85, 4.25, 4.85), RW = 0.9, HM = V(5.45, 3.85, 4.45), RM = 0.6;
      const wallM = M('wall', { color: 0xcfae74, roughness: 0.85 }, 'w');
      const wallCap = { x: M('wall', { color: 0xb38f55, roughness: 0.9, side: T.DoubleSide }, 'x'), z: M('wall', { color: 0xb38f55, roughness: 0.9, side: T.DoubleSide }, 'z') };
      const memM = M('membrane', { color: 0xf0c49a, roughness: 0.5, transparent: true, opacity: 0.4, side: T.BackSide, depthWrite: false }, 'w');
      const memCap = { x: M('membrane', { color: 0xd98a5a, roughness: 0.5, side: T.DoubleSide }, 'x'), z: M('membrane', { color: 0xd98a5a, roughness: 0.5, side: T.DoubleSide }, 'z') };
      // 세포벽 겉면: 섬유 결이 보이게 색을 조금씩 흔든다
      const wg = rbox(HW, RW), wp = wg.attributes.position, wc = [];
      for (let i = 0; i < wp.count; i++) { const x = wp.getX(i), y = wp.getY(i), z = wp.getZ(i), k = 0.9 + 0.07 * Math.sin(x * 3.1 + y * 5.3) * Math.sin(z * 4.7 - y * 2.2) + 0.03 * Math.sin((x + z) * 13); wc.push(k, k, k); }
      wg.setAttribute('color', new T.Float32BufferAttribute(wc, 3)); wallM.vertexColors = true;
      mesh(G, wg, wallM);
      mesh(G, rbox(HM, RM), memM);
      ['x', 'z'].forEach((p) => {
        const hu = p === 'x' ? HW.z : HW.x, hm = p === 'x' ? HM.z : HM.x;
        const w = rrect(0, 0, hu, HW.y, RW); w.holes.push(rrect(0, 0, hm, HM.y, RM, T.Path)); face(G, p, w, wallCap[p], 0.004);
        const m = rrect(0, 0, hm, HM.y, RM); m.holes.push(rrect(0, 0, hm - 0.1, HM.y - 0.1, RM - 0.08, T.Path)); face(G, p, m, memCap[p], 0.004);
        face(G, p, rrect(0, 0, hm - 0.1, HM.y - 0.1, RM - 0.08), capM[p].cyto, 0);
      });
      // 큰 중앙 액포(잘린 면에 뚜껑)
      const VC = V(0.9, -0.25, -0.95), VH = V(3.3, 2.65, 2.6), VR = 1.3;
      const vm = mesh(G, rbox(VH, VR, 24), M('vac', { color: 0x9fd3ec, roughness: 0.2, transparent: true, opacity: 0.4, side: T.DoubleSide, depthWrite: false }, 'w')); vm.position.copy(VC);
      face(G, 'x', rrect(VC.z, VC.y, VH.z, VH.y, VR), capM.x.vac, 0.008); face(G, 'z', rrect(VC.x, VC.y, VH.x, VH.y, VR), capM.z.vac, 0.008);
      const c = V(-0.45, 1.5, 3.0), RN = 1.15;
      nucleus(G, c, RN);
      const ribs = [];
      er(G, c, [1.45, 1.68], -0.6, Math.PI + 1.2, Math.PI * 0.58, Math.PI * 0.3, ribs);
      const gp = V(-1.25, -1.75, 2.55);
      golgi(G, gp, gp.clone().sub(c).normalize(), 0.8);
      const ch = [[2.3, 3.25, -1.6, 1, 0, 0.2], [3.7, -3.3, -1.3, 1, 0, -0.3], [4.75, 0.6, -1.2, 0, 1, 0.2], [-1.6, 3.2, 1.2, 1, 0, 0.6], [-1.4, -3.3, 1.3, 1, 0, 0.3], [1.3, -3.3, -2.6, 1, 0.05, -0.4], [-3.9, 1.6, 0.7, 0, 1, 0.3], [-4.6, -1.3, -1.6, 0.1, 1, -0.2], [0.6, 3.25, -3.5, 1, 0, -0.1], [4.7, -1.6, -3.3, 0.2, 1, 0], [-3.8, 3.0, -2.6, 1, 0.1, 0.4]];
      const chl = ch.map(([x, y, z, ax, ay, az]) => chloro(G, V(x, y, z), V(ax, ay, az)));
      const mitos = [mito(G, V(2.0, -3.25, -1.0), V(1, 0, 0.3), 0.4, 0.33), mito(G, V(-1.1, 2.75, 2.2), V(1, 0, -0.2), 0.4, 0.33), mito(G, V(4.65, 2.3, -2.6), V(0, 1, 0.3), 0.4, 0.33), mito(G, V(-4.5, -2.6, 1.8), V(0.3, 0.2, 1), 0.4, 0.33)];
      for (let i = 0; i < 400 && ribs.length < 330; i++) {
        const p = V(rnd() * 2 - 1, rnd() * 2 - 1, rnd() * 2 - 1).multiply(HM).multiplyScalar(0.94), q = p.clone().sub(VC);
        if (inWedge(p) || p.distanceTo(c) < 1.9 || (Math.abs(q.x) < VH.x + 0.15 && Math.abs(q.y) < VH.y + 0.15 && Math.abs(q.z) < VH.z + 0.15)) continue; ribs.push(p);
      }
      for (let i = 0; i < 22; i++) ribs.push(V(-0.25 - (i % 4) * 0.07, -3.0 + Math.sin(i * 0.9) * 0.3, 2.6 + Math.cos(i * 0.6) * 0.35));
      ribosomes(G, ribs);
      const gd2 = gp.clone().sub(c).normalize();
      P.flow = flow(G, c.clone().add(gd2.clone().multiplyScalar(1.75)), gp.clone().sub(gd2.clone().multiplyScalar(0.45)), gp.clone().add(gd2.clone().multiplyScalar(0.5)), V(-2.2, -3.6, 4.1));
      P.mitos = mitos.concat(chl);
      P.at = { nucleus: V(0.75, 2.6, 2.6), er: V(0.6, 0.55, 3.5), golgi: V(-1.0, -0.75, 3.4), mito: V(2.6, -2.45, -0.6), ribo: V(0.5, -2.6, 2.7), vac: V(2.5, 0.6, 0.6), membrane: V(5.35, 3.35, 0.5), cyto: V(2.6, -3.2, 0.06), wall: V(5.95, 1.6, 0.8), chloro: V(2.9, 3.85, -0.5) };
      P.hit = { nucleus: V(0.02, 1.6, 3.1), er: V(0.02, 0.15, 3.0), golgi: gp.clone(), mito: V(2.0, -3.25, -1.0), ribo: V(-0.3, -3.0, 2.6), vac: V(1.6, 0.4, 0.01), membrane: V(5.4, 2.0, 0.02), cyto: V(3.0, -3.45, 0.02), wall: V(5.7, 0.2, 0.02), chloro: V(-1.4, -3.3, 1.3) };
    }
    [A, P].forEach((C) => {
      C.G.traverse((o) => { if (o.isMesh && o.userData.key) C.pick.push(o); });
      Object.entries(C.at).forEach(([k, at]) => {
        const el = document.createElement('button'); el.type = 'button'; el.className = 'g3-label cl-tag'; el.textContent = INFO[k].name; el.dataset.k = k;
        el.addEventListener('click', () => choose(k, true)); stage.insertBefore(el, stage.querySelector('.cl-tabs')); s.label(el, at); C.tags.push(el);
      });
    });
    // 단백질(③을 마치면 길을 따라 나간다)
    const pm = new T.Mesh(new T.SphereGeometry(0.24, 18, 12), new T.MeshBasicMaterial({ color: 0xffd23a, depthTest: false })); pm.renderOrder = 30; pm.visible = false; scene.add(pm);
    const ptag = document.createElement('span'); ptag.className = 'g3-label cl-tag pv'; ptag.textContent = '단백질'; ptag.style.display = 'none'; stage.appendChild(ptag); s.label(ptag, () => pm.position.clone().add(V(0, 0.6, 0)));
    const cur = () => (mode === 'animal' ? A : P);

    // 누르기: 잘려 나간 자리의 맞음은 버리고, 세포질 뚜껑 너머에 소기관이 있으면 그것을
    const ray = new T.Raycaster(), ndc = new T.Vector2();
    function pickAt(e) {
      const r = cv.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, s.camera);
      let fb = null;
      for (const h of ray.intersectObjects(cur().pick, false)) {
        if (inWedge(h.point)) continue;
        const k = h.object.userData.key;
        if (k === 'cyto') { fb = fb || k; continue; }
        if ((k === 'membrane' || k === 'wall') && fb) return fb;
        return k;
      }
      return fb;
    }
    const say = (h) => { if (out.innerHTML !== h) out.innerHTML = h; };
    function showCard(k) {
      if (!k) { card.innerHTML = '<p class="cl-empty">세포 속 부분이나 이름표를 누르면 여기에 <b>이름 · 하는 일 · 막이 있는지 · 어느 세포에 있는지</b>가 나온다.</p>'; return; }
      const f = INFO[k], mm = f.mem[0] === 1 ? 'cl-yes">있음' : f.mem[0] === 0 ? 'cl-no">없음' : 'cl-na">해당 없음';
      const job = mode === 'plant' && f.jobP ? f.jobP : f.job;
      card.innerHTML = `<h3 style="--c:${f.c}">${f.name}</h3><p>${job}</p><dl><dt>막</dt><dd><span class="${mm}</span>${f.mem[1].replace(/^[^·]*· /, '')}</dd>`
        + `<dt>있는 세포</dt><dd><span class="cl-cell${f.who[0] ? ' on' : ''}">동물</span><span class="cl-cell${f.who[1] ? ' on' : ''}">식물</span>${k === 'vac' ? '식물에서 크다' : ''}</dd></dl>${f.tip ? `<p class="cl-tip">${f.tip}</p>` : ''}`;
    }
    function focus(k) {
      reg.forEach((m) => {
        const u = m.userData, on = !k || u.key === k;
        const tr = on ? u.tr : true, op = on ? u.op : u.op * (u.tr ? 0.3 : 0.14), dw = on ? u.dw : false;
        if (m.transparent !== tr) { m.transparent = tr; m.needsUpdate = true; }
        m.opacity = op; m.depthWrite = dw;
        m.emissive.set(k && u.key === k ? m.color : 0x000000); m.emissiveIntensity = 0.25;
      });
      [A, P].forEach((C) => C.tags.forEach((el) => { el.classList.toggle('on', el.dataset.k === k); el.classList.toggle('dim', !!k && el.dataset.k !== k); }));
    }
    function choose(k, user) {
      sel = k || null; focus(sel); showCard(sel);
      if (!sel) { if (user) say('빈 곳을 눌렀다 — 다시 모두 보인다. 끌면 세포가 돌아간다'); return; }
      if (mode === 'animal') seenA.add(sel); else if (NEWP.includes(sel)) seenP.add(sel);
      const r = nextPath(pathI, sel);
      if (r === -1) { pathI = 0; pathEl.classList.remove('bad'); void pathEl.offsetWidth; pathEl.classList.add('bad'); say(`단백질 길에서 <b>${INFO[sel].name}</b>은(는) 순서가 아니다 — <b>라이보솜</b>부터 다시`); }
      else {
        pathI = r;
        if (r === 4) { pathI = 0; ok.add(3); go(); say('단백질 길 완성! 노란 <b>단백질</b>이 소포체 → 골지체를 지나 소낭에 담겨 세포막 밖으로 나간다'); }
        else if (r > 1 || (r === 1 && ok.has(1) && ok.has(2))) say(`단백질 길 ${r}/4 — <b>${INFO[sel].name}</b> 다음은 <b>${INFO[PATH[r]].name}</b>`);
        else say(`<b>${INFO[sel].name}</b> — ${INFO[sel].who[0] ? (INFO[sel].who[1] ? '동물·식물 세포 모두에 있다' : '동물 세포에만') : '식물 세포에만 있다'}`);
      }
      pathEl.querySelectorAll('li').forEach((li, i) => li.classList.toggle('ok', i < pathI || (ok.has(3) && pathI === 0)));
      steps();
    }
    function go() { const C = cur(); parcel = { c: C.flow.path, u: 0 }; pm.visible = true; ptag.style.display = ''; }
    function setMode(m, user) {
      if (m === mode && user) return;
      mode = m; A.G.visible = m === 'animal'; P.G.visible = m === 'plant';
      A.tags.forEach((el) => { el.style.display = m === 'animal' ? '' : 'none'; }); P.tags.forEach((el) => { el.style.display = m === 'plant' ? '' : 'none'; });
      tabs.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.m === m)));
      parcel = null; pm.visible = false; ptag.style.display = 'none';
      const G = cur().G; if (window.gsap && user) { G.scale.setScalar(0.82); gsap.to(G.scale, { x: 1, y: 1, z: 1, duration: 0.6, ease: 'back.out(1.6)' }); }
      if (sel && !cur().at[sel]) sel = null; focus(sel); showCard(sel);
      if (user) say(m === 'plant' ? '<b>식물 세포</b> — 모양이 각지고 바깥에 두꺼운 벽이 생겼다. 새로 생긴 것 셋을 찾아 눌러 보자' : '<b>동물 세포</b> — 둥글고 세포벽·엽록체가 없다');
      steps(); if (!s.active) s.render();
    }
    tabs.forEach((b) => b.addEventListener('click', () => setMode(b.dataset.m, true)));
    function steps() {
      if (rotated && seenA.size >= 3) ok.add(1);
      if (NEWP.every((k) => seenP.has(k))) ok.add(2);
      const st = [1, 2, 3].find((q) => !ok.has(q)) || 0;
      window.L1.steps(root, st, [...ok]); window.L1.done(root, st === 0);
      tabs[1].classList.toggle('pulse', st === 2 && mode === 'animal');
      const nt = st === 1 ? `① 빈 곳을 끌어 돌려 보고, 소기관 셋을 눌러 보자 (${Math.min(3, seenA.size)}/3${rotated ? '' : ' · 아직 안 돌림'})`
        : st === 2 ? (mode === 'animal' ? '② 위쪽 «식물 세포» 그림을 눌러 바꿔 보자' : `② 동물 세포에 없던 것 셋을 찾아 누르자 (${seenP.size}/3)`)
          : st === 3 ? '③ 라이보솜 → 소포체 → 골지체 → 세포막을 차례로 누르자' : '세포는 소기관이 일을 나눠 맡는 작은 생명 시스템';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    // 움직임: 소낭 흐름, 소기관이 살짝 흔들림, 고른 것 깜박임, 단백질 이동
    function tick(dt) {
      if (!rotated && Math.abs(s.view.yaw - yaw0) > 0.5) { rotated = true; steps(); }
      const C = cur();
      C.flow.list.forEach((v) => {
        v.u += dt * (v.ph ? 0.32 : 0.42);
        if (v.u >= 1) { v.u = 0; v.ph = 1 - v.ph; }
        const c = v.c[v.ph]; v.m.position.copy(c.getPointAt(v.u));
        v.m.scale.setScalar(v.ph === 0 ? clamp(v.u * 6, 0.2, 1) : clamp((1 - v.u) * 6, 0.15, 1));
      });
      C.mitos.forEach((g) => { const b = g.userData.base, p = g.userData.ph; g.position.set(b.x + 0.04 * Math.sin(t * 0.7 + p), b.y + 0.05 * Math.sin(t * 0.9 + p * 2), b.z + 0.04 * Math.cos(t * 0.6 + p)); });
      if (sel) reg.forEach((m) => { if (m.userData.key === sel) m.emissiveIntensity = 0.22 + 0.16 * Math.sin(t * 4); });
      if (parcel) {
        parcel.u += dt / 4.2; pm.position.copy(parcel.c.getPointAt(Math.min(1, parcel.u))); pm.scale.setScalar(1 + 0.15 * Math.sin(t * 9));
        if (parcel.u >= 1.15) { parcel = null; pm.visible = false; ptag.style.display = 'none'; }
      }
    }
    // 키보드 · 두 손가락 확대
    cv.addEventListener('keydown', (e) => {
      const v = s.view;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') v.yaw += e.key === 'ArrowLeft' ? 0.15 : -0.15;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') v.pitch = clamp(v.pitch + (e.key === 'ArrowUp' ? 0.1 : -0.1), -1.2, 1.35);
      else if (e.key === '+' || e.key === '=') v.dist = clamp(v.dist * 0.9, 8, 34);
      else if (e.key === '-') v.dist = clamp(v.dist * 1.1, 8, 34);
      else if (e.key === '0') s.look(VIEW0);
      else return;
      e.preventDefault(); e.stopPropagation(); if (!s.active) s.render();
    });
    const pts = new Map(); let pinch0 = 0, dist0 = 0;
    cv.addEventListener('pointerdown', (e) => { pts.set(e.pointerId, e); if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch0 = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); dist0 = s.view.dist; } });
    cv.addEventListener('pointermove', (e) => { if (!pts.has(e.pointerId)) return; pts.set(e.pointerId, e); if (pts.size === 2 && pinch0) { const [a, b] = [...pts.values()], d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); s.view.dist = clamp(dist0 * pinch0 / Math.max(20, d), 8, 34); } });
    const pend = (e) => { pts.delete(e.pointerId); if (pts.size < 2) pinch0 = 0; };
    cv.addEventListener('pointerup', pend); cv.addEventListener('pointercancel', pend);
    function reset() {
      ok = new Set(); seenA = new Set(); seenP = new Set(); rotated = false; pathI = 0; sel = null;
      pathEl.querySelectorAll('li').forEach((li) => li.classList.remove('ok'));
      setMode('animal', false); s.look(VIEW0); yaw0 = VIEW0.yaw;
      say('빈 곳을 끌면 세포가 돌아가고, 잘린 면 속 부분을 누르면 그것만 밝아진다');
      steps();
    }
    root.querySelector('.cl-home').addEventListener('click', () => s.look(VIEW0));
    root.querySelector('.cl-reset').addEventListener('click', reset);
    reset();
    root._cl = {
      state: () => ({ mode, sel, ok: [...ok], seenA: [...seenA], seenP: [...seenP], rotated, pathI, parcel: !!parcel, yaw: +s.view.yaw.toFixed(2), dist: +s.view.dist.toFixed(1) }),
      choose(k) { choose(k, true); return sel; }, mode(m) { setMode(m, true); return mode; },
      screen(k) { const p = (cur().hit[k]), q = s.toClient(p); return { x: q.x, y: q.y }; },
      tag(k) { const el = cur().tags.find((x) => x.dataset.k === k), r = el.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height / 2 }; },
    };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.Cell3D = { mount };
})();
