/* 3차시 6장 «갈라파고스 제도»: 섬 지도(3D). 끌어 돌리고 확대해 섬이 흩어진 모습·거리를 본다.
   섬 위 핀 넷(핀치 네 종, 교과서 그림 Ⅰ-13)을 누르면 그 섬으로 다가가고, 오른쪽 카드에 사진·부리·먹이가 나온다.
   섬 모양·크기는 실제 지도를 단순하게 따라 그린 것(1 칸 = 약 10 km). 핀치 자리는 이해를 돕기 위한 배치.
   시험용: root._gp.pick(i) · root._gp.home() */
(function () {
  'use strict';
  const K = 11;   // 위경도 1° ≈ 111 km → 11칸
  const O = [-90.6, -0.35];
  const P = (lon, lat) => [(lon - O[0]) * K, -(lat - O[1]) * K];   // x 동쪽, z 남쪽
  // 섬 윤곽(경도, 위도) — 큰 섬은 점 여러 개, 작은 섬은 [중심, 가로, 세로, 기울기]
  const BIG = {
    '이사벨라': [[-91.4, 0.16], [-91.2, 0.08], [-91.12, -0.12], [-91.02, -0.3], [-90.86, -0.55], [-90.82, -0.82], [-90.98, -1.0], [-91.22, -1.04], [-91.4, -0.95], [-91.3, -0.72], [-91.2, -0.55], [-91.38, -0.4], [-91.44, -0.18], [-91.5, 0.05]],
    '산타크루스': [[-90.55, -0.5], [-90.3, -0.48], [-90.16, -0.6], [-90.22, -0.75], [-90.45, -0.8], [-90.58, -0.68]],
    '산크리스토발': [[-89.66, -0.72], [-89.45, -0.8], [-89.26, -0.88], [-89.3, -0.96], [-89.52, -0.94], [-89.66, -0.84]],
    '산티아고': [[-90.88, -0.18], [-90.7, -0.13], [-90.6, -0.22], [-90.68, -0.33], [-90.84, -0.3]],
  };
  const SMALL = {
    '페르난디나': [-91.55, -0.37, 0.15, 0.15, 0], '플로레아나': [-90.44, -1.28, 0.09, 0.08, 0], '에스파뇰라': [-89.68, -1.37, 0.12, 0.05, -0.3],
    '핀타': [-90.75, 0.58, 0.05, 0.08, 0], '마르체나': [-90.48, 0.34, 0.07, 0.06, 0], '헤노베사': [-89.96, 0.32, 0.04, 0.035, 0],
    '산타페': [-90.06, -0.82, 0.05, 0.04, 0], '핀손': [-90.66, -0.61, 0.035, 0.035, 0], '라비다': [-90.71, -0.41, 0.03, 0.03, 0], '발트라': [-90.28, -0.44, 0.04, 0.03, 0],
  };
  const FINCH = [
    { isl: '산티아고', at: [-90.74, -0.22], col: '#3b3030', name: '크고 두꺼운 부리', img: 'FI_GROUND', food: '크고 단단한 씨앗', d: '크고 두꺼운 부리로 단단한 씨앗 껍데기를 깨 먹는다. 씨앗이 크고 단단한 곳에서 유리하다.', cr: 'Peter Wilton · CC BY 2.0' },
    { isl: '에스파뇰라', at: [-89.68, -1.37], col: '#3d6e3a', name: '길고 뾰족한 부리', img: 'FI_CACTUS', food: '선인장 꽃·열매', d: '길고 뾰족한 부리를 선인장 꽃과 열매 속에 깊이 넣어 꿀과 씨를 먹는다.', cr: 'Lip Kee · CC BY-SA 2.0' },
    { isl: '산타크루스', at: [-90.38, -0.63], col: '#8a6a3a', name: '뾰족하고 가느다란 부리', img: 'FI_WOOD', food: '나무 구멍 속 곤충', d: '가늘고 뾰족한 부리로 선인장 가시나 잔가지를 물고 나무 구멍 속 애벌레를 꺼낸다(도구 사용).', cr: 'Andrew Katsis · CC BY 4.0' },
    { isl: '이사벨라', at: [-91.08, -0.62], col: '#6b7f8c', name: '짧고 단단한 부리', img: 'FI_TREE', food: '곤충', d: '짧고 단단한 부리로 나뭇잎과 가지 위의 곤충을 집어 먹는다.', cr: 'Andrew Katsis · CC BY 4.0' },
  ];
  function mount(root) {
    const stage = root.querySelector('.o3-stage'), canvas = stage.querySelector('canvas');
    const card = root.querySelector('.gp-card'), store = root.querySelector('.gp-store');
    const btns = [...root.querySelectorAll('.gp-pick button')];
    let sel = -1, t = 0;
    const s = window.Orbit.make(stage, canvas, {
      view: { yaw: 0.0, pitch: 1.0, dist: 42, target: [1.5, 0, 2] }, min: 6, max: 60, pmin: 0.2, pmax: 1.5, bounds: 18,
      onFrame: (dt) => { t += dt; water.position.y = -0.05 + Math.sin(t * 0.8) * 0.02; pins.forEach((p, i) => { p.children[1].position.y = 3.0 + (i === sel ? 0.25 * Math.sin(t * 4) : 0); }); },
      click: (e) => { const h = s.pick(e, pins); if (h) { let o = h.object; while (o && !pins.includes(o)) o = o.parent; pick(pins.indexOf(o)); } },
    });
    window.Orbit.chrome(stage, s);
    if (!s.ok) { btns.forEach((b, i) => b.addEventListener('click', () => show(i))); show(0); return { setActive() {} }; }
    const { T, scene } = s;
    s.renderer.setClearColor(new T.Color('#cfe6f2'), 1);
    // 바다
    const water = new T.Mesh(new T.PlaneGeometry(90, 90, 1, 1), s.mat('#5ba4cf', { roughness: 0.35, metalness: 0.05 }));
    water.rotation.x = -Math.PI / 2; scene.add(water);
    const shelf = new T.Mesh(new T.CircleGeometry(19, 64), s.mat('#7cc0e0', { roughness: 0.4, transparent: true, opacity: 0.6 }));
    shelf.rotation.x = -Math.PI / 2; shelf.position.y = 0.01; scene.add(shelf);
    // 섬
    const top = s.mat('#b9a56a', { roughness: 0.95 }), green = s.mat('#7fa055', { roughness: 0.95 }), side = s.mat('#6b5a45', { roughness: 1 });
    const isl = {};
    function island(name, pts, h, lush) {
      const shape = new T.Shape(new T.SplineCurve(pts.map((p) => new T.Vector2(...P(...p)))).getPoints(80).map((v) => new T.Vector2(v.x, v.y)));
      const geo = new T.ExtrudeGeometry(shape, { depth: h, bevelEnabled: true, bevelThickness: h * 0.6, bevelSize: 0.35, bevelSegments: 3, curveSegments: 40 });
      const m = new T.Mesh(geo, [lush ? green : top, side]);
      m.rotation.x = Math.PI / 2; m.position.y = h + 0.1;
      scene.add(m); isl[name] = m; return m;
    }
    Object.entries(BIG).forEach(([n, pts], i) => island(n, pts.concat([pts[0]]), [0.9, 0.7, 0.55, 0.6][i], i < 2));
    Object.entries(SMALL).forEach(([n, [lon, lat, a, b, r]]) => {
      const pts = []; for (let k = 0; k <= 12; k++) { const u = (k / 12) * Math.PI * 2; pts.push([lon + a * Math.cos(u) * Math.cos(r) - b * Math.sin(u) * Math.sin(r), lat + a * Math.cos(u) * Math.sin(r) + b * Math.sin(u) * Math.cos(r)]); }
      island(n, pts, a > 0.1 ? 0.7 : 0.35, n === '페르난디나');
    });
    // 화산 봉우리
    [[-91.55, -0.37, 1.4], [-91.12, -0.42, 1.2], [-91.0, -0.85, 1.1], [-91.32, 0.02, 0.9], [-90.4, -0.65, 0.7], [-90.78, -0.23, 0.6]].forEach(([lon, lat, h]) => {
      const c = new T.Mesh(new T.ConeGeometry(h * 0.9, h, 24, 1, true), s.mat('#7a6650', { roughness: 1, side: T.DoubleSide }));
      const [x, z] = P(lon, lat); c.position.set(x, 1.0 + h / 2, z); scene.add(c);
      const cr = new T.Mesh(new T.CircleGeometry(h * 0.18, 16), s.mat('#3d3127')); cr.rotation.x = -Math.PI / 2; cr.position.set(x, 1.0 + h * 0.98, z); scene.add(cr);
    });
    // 적도
    const eqPts = [new T.Vector3(-20, 0.08, P(0, 0)[1]), new T.Vector3(20, 0.08, P(0, 0)[1])];
    const eq = new T.Line(new T.BufferGeometry().setFromPoints(eqPts), new T.LineDashedMaterial({ color: 0xc8402f, dashSize: 0.8, gapSize: 0.5 }));
    eq.computeLineDistances(); scene.add(eq);
    // 핀(핀치 네 종)
    const pins = FINCH.map((f) => {
      const g = new T.Group(); const [x, z] = P(...f.at);
      const stick = new T.Mesh(new T.CylinderGeometry(0.07, 0.07, 3, 8), s.mat('#1d2433')); stick.position.y = 1.5;
      const ball = new T.Mesh(new T.SphereGeometry(0.6, 24, 16), s.mat(f.col, { emissive: f.col, emissiveIntensity: 0.15 })); ball.position.y = 3.0;
      g.add(stick, ball); g.position.set(x, 0.8, z); scene.add(g); return g;
    });
    // 이름표
    const lab = (cls, txt) => { const el = document.createElement('span'); el.className = 'o3-lab ' + cls; el.textContent = txt; stage.appendChild(el); return el; };
    pins.forEach((p, i) => { const el = lab('gp-pin', FINCH[i].name); el.style.borderColor = FINCH[i].col; s.label(el, () => p.position.clone().add(new T.Vector3(0, 4.3, 0))); });
    [['이사벨라', -91.3, -0.95], ['산타크루스', -90.35, -0.86], ['산크리스토발', -89.45, -1.0], ['산티아고', -90.75, -0.06], ['페르난디나', -91.62, -0.18], ['에스파뇰라', -89.68, -1.47], ['플로레아나', -90.44, -1.4]].forEach(([n, lon, lat]) => {
      const [x, z] = P(lon, lat); s.label(lab('gp-isl', n), new T.Vector3(x, 1.4, z));
    });
    const eqL = lab('gp-eq', '적도'); s.label(eqL, new T.Vector3(-14, 0.3, P(0, 0)[1]));
    const toSA = lab('gp-sa', '남아메리카 대륙까지 약 1000 km →'); s.label(toSA, new T.Vector3(12.5, 0.4, 4));
    // 50 km 눈금
    const sb = new T.Mesh(new T.BoxGeometry(5.5, 0.12, 0.35), s.mat('#1d2433')); sb.position.set(-12, 0.12, 12); scene.add(sb);
    s.label(lab('gp-sb', '약 50 km'), new T.Vector3(-12, 0.5, 13.3));
    function show(i) {
      sel = i; const f = FINCH[i];
      btns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
      const im = store.querySelector(`img[data-k="${f.img}"]`);
      card.querySelector('.gp-img').src = im.src; card.querySelector('.gp-img').alt = im.alt;
      card.querySelector('.gp-name').textContent = f.name + ' 핀치';
      card.querySelector('.gp-food').textContent = '먹이: ' + f.food;
      card.querySelector('.gp-d').textContent = f.d;
      card.querySelector('.gp-cr').textContent = '사진: ' + f.cr + ' · 핀 자리: ' + f.isl + '(예)';
      card.style.setProperty('--fc', f.col);
    }
    function pick(i) {
      if (i < 0) return; show(i);
      const p = pins[i].position; s.look({ target: [p.x, 1, p.z], dist: 15, pitch: 0.75 }, 1.1);
    }
    btns.forEach((b, i) => b.addEventListener('click', () => pick(i)));
    show(0);
    root._gp = { pick, home: () => s.reset() };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.EvGala = { mount };
})();
