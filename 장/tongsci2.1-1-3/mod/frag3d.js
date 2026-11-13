/* 2차시 설명 장 «서식지 파괴와 단편화»: 1 km × 1 km 숲(3D, 1칸 = 100 m)을 돌려 보며 단계 막대(BdT.stepper가 보내는 st-step)로 넘긴다.
   0 넓은 숲 → 1 도로가 가운데를 십자로 지난다(나무가 베어지는 순간 흔들림·진동) → 2 가장자리 100 m와 중앙(깊은 숲)을 칠해 본다
   → 3 고립과 로드킬 → 4 생태통로를 놓으면 동물이 건너간다.
   계산(교과서 밖 자료, 선생님 학습지 자료 B와 같은 가정): 중앙 800 × 800 = 640 000 m² → 도로 폭 10 m 십자로 조각 넷의 중앙 295 × 295 × 4 ≒ 348 000 m² → 약 54 %.
   도로 폭은 잘 보이게 조금 넓게 그렸다. 동물 수·움직임은 이해를 돕기 위한 예. 시험용: root._fg.step(k) */
(function () {
  'use strict';
  const H = 5, EDGE = 1, ROAD = 0.1, RW = 0.22;   // 숲 반너비(500 m), 가장자리(100 m), 실제 도로 반폭… 그림 도로 반폭
  function mount(root) {
    const stage = root.querySelector('.fg-stage'), canvas = stage.querySelector('canvas');
    const readA = root.querySelector('.fg-area'), readB = root.querySelector('.fg-bar i'), readP = root.querySelector('.fg-pct'), readN = root.querySelector('.fg-n');
    let step = 0, shown = 0, t = 0;
    const s = window.Orbit.make(stage, canvas, {
      view: { yaw: 0.6, pitch: 0.82, dist: 17, target: [0, 0, 0] }, min: 6, max: 30, pmin: 0.2, pmax: 1.4, bounds: 5, spin: 0,
      onFrame: (dt) => tick(dt),
    });
    window.Orbit.chrome(stage, s);
    if (!s.ok) return { setActive() {} };
    const { T, scene } = s;
    s.renderer.setClearColor(new T.Color('#e4eef0'), 1);
    // 받침과 땅
    const slab = new T.Mesh(new T.BoxGeometry(2 * H + 0.6, 0.6, 2 * H + 0.6), s.mat('#7a634a')); slab.position.y = -0.32; scene.add(slab);
    const ground = new T.Mesh(new T.PlaneGeometry(2 * H, 2 * H), s.mat('#5d8a3e')); ground.rotation.x = -Math.PI / 2; scene.add(ground);
    const rim = new T.Mesh(new T.PlaneGeometry(2 * H + 0.6, 2 * H + 0.6), s.mat('#c9b98f')); rim.rotation.x = -Math.PI / 2; rim.position.y = -0.005; scene.add(rim);
    // 나무
    const rnd = (() => { let q = 3; return () => { q = (q * 16807) % 2147483647; return q / 2147483647; }; })();
    const trees = [];
    for (let x = -H + 0.18; x < H; x += 0.34) for (let z = -H + 0.18; z < H; z += 0.34) trees.push([x + (rnd() - 0.5) * 0.16, z + (rnd() - 0.5) * 0.16, 0.75 + rnd() * 0.5, rnd()]);
    const trunkM = new T.InstancedMesh(new T.CylinderGeometry(0.03, 0.045, 0.22, 5), s.mat('#6b4a2e'), trees.length);
    const leafMat = s.mat('#2f6b34', { transparent: true, opacity: 1 }), leafMat2 = s.mat('#4a8a3c', { transparent: true, opacity: 1, flatShading: true });
    const coneM = new T.InstancedMesh(new T.ConeGeometry(0.16, 0.5, 7), leafMat, trees.length);
    const ballM = new T.InstancedMesh(new T.IcosahedronGeometry(0.19, 0), leafMat2, trees.length);
    scene.add(trunkM, coneM, ballM);
    const o = new T.Object3D();
    const onRoad = (x, z) => Math.abs(x) < RW + 0.08 || Math.abs(z) < RW + 0.08;
    let cut = 0;   // 0~1: 도로 자리 나무가 쓰러져 사라짐
    function placeTrees() {
      trees.forEach(([x, z, sc, kind], i) => {
        const gone = onRoad(x, z) ? cut : 0, k = sc * (1 - gone);
        o.position.set(x, 0.11 * k, z); o.rotation.set(0, 0, gone * 1.2); o.scale.setScalar(Math.max(0.0001, k)); o.updateMatrix(); trunkM.setMatrixAt(i, o.matrix);
        o.position.set(x, (kind < 0.5 ? 0.42 : 0.38) * k, z); o.updateMatrix();
        const hide = new T.Matrix4().makeScale(0, 0, 0);
        coneM.setMatrixAt(i, kind < 0.5 ? o.matrix : hide); ballM.setMatrixAt(i, kind >= 0.5 ? o.matrix : hide);
      });
      trunkM.instanceMatrix.needsUpdate = coneM.instanceMatrix.needsUpdate = ballM.instanceMatrix.needsUpdate = true;
    }
    placeTrees();
    // 도로(십자) + 가운데 줄 + 자동차
    const roadG = new T.Group(); scene.add(roadG);
    const asphalt = s.mat('#4a4e55');
    [[2 * H, 2 * RW], [2 * RW, 2 * H]].forEach(([w, d]) => { const r = new T.Mesh(new T.BoxGeometry(w, 0.03, d), asphalt); r.position.y = 0.015; roadG.add(r); });
    for (let k = -H + 0.3; k < H; k += 0.6) { if (Math.abs(k) < RW + 0.1) continue; [[k, 0], [0, k]].forEach(([x, z]) => { const l = new T.Mesh(new T.BoxGeometry(x ? 0.3 : 0.04, 0.035, x ? 0.04 : 0.3), s.mat('#f4e27a')); l.position.set(x, 0.02, z); roadG.add(l); }); }
    const car = new T.Group(); const cb = new T.Mesh(new T.BoxGeometry(0.34, 0.12, 0.18), s.mat('#d8574a')); cb.position.y = 0.1; const ct = new T.Mesh(new T.BoxGeometry(0.18, 0.09, 0.15), s.mat('#f4efe2')); ct.position.set(-0.02, 0.2, 0); car.add(cb, ct); roadG.add(car);
    const car2 = car.clone(); car2.children[0].material = s.mat('#3a78c8'); roadG.add(car2);
    roadG.visible = false;
    // 가장자리·중앙 칠하기
    const zoneG = new T.Group(); scene.add(zoneG);
    const edgeMat = new T.MeshBasicMaterial({ color: 0xf2c94b, transparent: true, opacity: 0.62, depthWrite: false });
    const coreMat = new T.MeshBasicMaterial({ color: 0x1d5a2a, transparent: true, opacity: 0.62, depthWrite: false });
    function patch(x0, x1, z0, z1) {
      const e = new T.Mesh(new T.PlaneGeometry(x1 - x0, z1 - z0), edgeMat); e.rotation.x = -Math.PI / 2; e.position.set((x0 + x1) / 2, 0.9, (z0 + z1) / 2); zoneG.add(e);
      const c = new T.Mesh(new T.PlaneGeometry(x1 - x0 - 2 * EDGE, z1 - z0 - 2 * EDGE), coreMat); c.rotation.x = -Math.PI / 2; c.position.set((x0 + x1) / 2, 0.91, (z0 + z1) / 2); zoneG.add(c);
    }
    const a = RW, b = H;
    patch(-b, -a, -b, -a); patch(a, b, -b, -a); patch(-b, -a, a, b); patch(a, b, a, b);
    const old = new T.LineLoop(new T.BufferGeometry().setFromPoints([[-4, -4], [4, -4], [4, 4], [-4, 4]].map(([x, z]) => new T.Vector3(x, 0.93, z))), new T.LineDashedMaterial({ color: 0x1d2433, dashSize: 0.2, gapSize: 0.14 }));
    old.computeLineDistances(); zoneG.add(old);
    zoneG.visible = false;
    // 동물: 중앙에 사는 곰(넓은 깊은 숲이 필요) · 가장자리에 사는 토끼
    function bear() {
      const g = new T.Group(), m = s.mat('#2a2522');
      const body = new T.Mesh(new T.CapsuleGeometry(0.13, 0.22, 4, 10), m); body.rotation.z = Math.PI / 2; body.position.y = 0.2; g.add(body);
      const head = new T.Mesh(new T.SphereGeometry(0.11, 12, 10), m); head.position.set(0.24, 0.27, 0); g.add(head);
      const chest = new T.Mesh(new T.TorusGeometry(0.07, 0.018, 6, 12, Math.PI), s.mat('#f2ead6')); chest.position.set(0.2, 0.2, 0); chest.rotation.set(0, Math.PI / 2, Math.PI); g.add(chest);
      [[-0.1, 0.07], [-0.1, -0.07], [0.12, 0.07], [0.12, -0.07]].forEach(([x, z]) => { const l = new T.Mesh(new T.CylinderGeometry(0.035, 0.035, 0.12, 6), m); l.position.set(x, 0.06, z); g.add(l); });
      [[0.07], [-0.07]].forEach(([z]) => { const e = new T.Mesh(new T.SphereGeometry(0.035, 8, 6), m); e.position.set(0.24, 0.37, z); g.add(e); });
      return g;
    }
    function rabbit() {
      const g = new T.Group(), m = s.mat('#e9e2d4');
      const body = new T.Mesh(new T.SphereGeometry(0.08, 10, 8), m); body.scale.set(1.3, 1, 1); body.position.y = 0.08; g.add(body);
      const head = new T.Mesh(new T.SphereGeometry(0.05, 10, 8), m); head.position.set(0.09, 0.14, 0); g.add(head);
      [-0.02, 0.02].forEach((z) => { const e = new T.Mesh(new T.CapsuleGeometry(0.012, 0.07, 3, 6), m); e.position.set(0.08, 0.22, z); g.add(e); });
      return g;
    }
    // 동물마다 사는 조각(사분면)과 영역
    const animals = [];
    const Q = [[-1, -1], [1, -1], [-1, 1], [1, 1]];
    [[0, 'bear'], [1, 'bear'], [3, 'bear'], [2, 'rabbit'], [0, 'rabbit'], [1, 'rabbit'], [3, 'rabbit']].forEach(([q, kind], i) => {
      const g = kind === 'bear' ? bear() : rabbit(); g.scale.setScalar(kind === 'bear' ? 1.8 : 2.3); scene.add(g);
      const [sx, sz] = Q[q];
      animals.push({ g, kind, q, sx, sz, ph: i * 1.7, x: sx * 2.6, z: sz * 2.6 });
    });
    // 로드킬 표시
    const mark = new T.Group();
    const xm = s.mat('#d9483b', { emissive: '#7a1a12', emissiveIntensity: 0.4 });
    [-1, 1].forEach((k) => { const bar = new T.Mesh(new T.BoxGeometry(0.5, 0.05, 0.1), xm); bar.rotation.y = k * Math.PI / 4; mark.add(bar); });
    mark.scale.setScalar(2); mark.position.set(-2.4, 0.08, 0); mark.visible = false; scene.add(mark);
    // 생태통로(도로 위 흙다리): 왼쪽 위 조각 ↔ 오른쪽 위 조각
    const bridge = new T.Group();
    const deck = new T.Mesh(new T.BoxGeometry(1.2, 0.12, 0.9), s.mat('#7a6a48')); deck.position.y = 0.5; bridge.add(deck);
    const turf = new T.Mesh(new T.BoxGeometry(1.2, 0.04, 0.9), s.mat('#6a9a44')); turf.position.y = 0.58; bridge.add(turf);
    [[-0.45], [0.45]].forEach(([z]) => { const w = new T.Mesh(new T.BoxGeometry(0.12, 0.5, 0.12), s.mat('#9a948a')); w.position.set(0, 0.25, z); bridge.add(w); });
    for (let i = 0; i < 6; i++) { const tr = new T.Mesh(new T.ConeGeometry(0.1, 0.3, 6), s.mat('#3f7a3a')); tr.position.set(-0.4 + (i % 3) * 0.4, 0.75, i < 3 ? -0.3 : 0.3); bridge.add(tr); }
    bridge.scale.set(1.7, 1.6, 1.9); bridge.position.set(0, 0, -2.6); bridge.visible = false; scene.add(bridge);
    // 이름표
    const lab = (txt, at, cls = '') => { const e = document.createElement('span'); e.className = 'o3-lab fg-lab ' + cls; e.textContent = txt; stage.appendChild(e); s.label(e, at); return e; };
    const L = {
      forest: lab('숲 1 km × 1 km', new T.Vector3(-3.2, 1.2, 3.6)),
      road: lab('도로 폭 10 m', new T.Vector3(3.6, 0.5, 0.2), 'fg-road'),
      edge: lab('가장자리 100 m', new T.Vector3(4.55, 1.3, -2.6), 'fg-edge'),
      core: lab('중앙(깊은 숲)', new T.Vector3(-2.5, 1.3, -2.5), 'fg-core'),
      kill: lab('로드킬', new T.Vector3(-2.4, 0.6, 0), 'fg-kill'),
      eco: lab('생태통로', new T.Vector3(0, 2.0, -2.6), 'fg-eco'),
    };
    // 단계마다 숫자(계산값)
    const READ = [
      ['640 000 m²', 100, '1조각'], ['640 000 m²', 100, '도로가 지나는 중'], ['약 348 000 m²', 54.4, '4조각'], ['약 348 000 m²', 54.4, '4조각 · 서로 끊김'], ['약 348 000 m²', 54.4, '4조각 · 통로로 이어짐'],
    ];
    function show() {
      const k = step;
      roadG.visible = k >= 1; zoneG.visible = k === 2; mark.visible = k === 3; bridge.visible = k >= 4;
      leafMat.opacity = leafMat2.opacity = k === 2 ? 0.35 : k >= 3 ? 0.6 : 1;
      L.road.hidden = k < 1; L.edge.hidden = L.core.hidden = k !== 2; L.kill.hidden = k !== 3; L.eco.hidden = k < 4; L.forest.hidden = k > 0;
      const [area, pct, n] = READ[k];
      readA.textContent = area; readB.style.width = pct + '%'; readP.textContent = Math.round(pct) + ' %'; readN.textContent = n;
      root.classList.toggle('fg-cut', k >= 2);
      if (!s.active) s.render();
    }
    function setStep(k) {
      const was = step; step = k;
      if (k >= 1 && was < 1) { cut = 0; window.BdT.jolt(stage, 3); }
      if (k < 1) { cut = 0; placeTrees(); }
      if (k >= 1 && was >= 1) { cut = 1; placeTrees(); }
      if (k === 4 && was !== 4) s.look({ yaw: 0.25, pitch: 0.62, dist: 11, target: [0, 0.3, -2.4] }, 1.1);
      if (k === 3 && was !== 3) s.look({ yaw: 0.9, pitch: 0.7, dist: 12, target: [-1.8, 0, -0.6] }, 1.1);
      if (k <= 2 && was >= 3) s.reset();
      show();
    }
    function tick(dt) {
      t += dt;
      if (step >= 1 && cut < 1) { cut = Math.min(1, cut + dt * 1.6); placeTrees(); }
      if (roadG.visible) {
        const u = (t * 0.18) % 1, v = ((t * 0.14) + 0.5) % 1;
        car.position.set(-H + u * 2 * H, 0, 0.09); car.rotation.y = 0;
        car2.position.set(-0.09, 0, H - v * 2 * H); car2.rotation.y = Math.PI / 2;
      }
      animals.forEach((A, i) => {
        let x, z;
        const lim = step >= 1 ? [0.55, 4.6] : [-4.6, 4.6];
        if (step >= 4 && A.kind === 'bear' && i === 0) {   // 생태통로를 건너 오고 가는 곰
          const u = (Math.sin(t * 0.5) + 1) / 2;
          x = -2.4 + u * 4.8; z = -2.6 + Math.sin(t * 1.3) * 0.1;
          A.g.position.set(x, Math.max(0, Math.min(1, (1.6 - Math.abs(x)) / 0.6)) * 1.0, z); A.g.rotation.y = Math.cos(t * 0.5) > 0 ? 0 : Math.PI; return;
        }
        if (step === 3 && A.kind === 'rabbit' && A.q === 2) { const u = (t * 0.35) % 1; x = -2.4; z = 2.2 - u * 2.1; A.g.position.set(x, 0, z); A.g.rotation.y = Math.PI / 2; return; }
        const r = A.kind === 'bear' ? 1.1 : 1.5;
        const cx = step >= 1 ? A.sx * 2.6 : A.sx * (A.kind === 'bear' ? 1.2 : 3.6), cz = step >= 1 ? A.sz * 2.6 : A.sz * (A.kind === 'bear' ? 1.2 : 3.6);
        x = cx + Math.cos(t * 0.4 + A.ph) * r; z = cz + Math.sin(t * 0.33 + A.ph * 1.3) * r * 0.8;
        if (step >= 1) { x = A.sx * Math.min(lim[1], Math.max(lim[0], Math.abs(x) * 1)); z = A.sz * Math.min(lim[1], Math.max(lim[0], Math.abs(z))); }
        const dx = -Math.sin(t * 0.4 + A.ph) * r, dz = Math.cos(t * 0.33 + A.ph * 1.3) * r * 0.8;
        A.g.position.set(x, A.kind === 'rabbit' ? Math.abs(Math.sin(t * 6 + A.ph)) * 0.06 : 0, z); A.g.rotation.y = Math.atan2(-dz, dx);
      });
      if (mark.visible) mark.scale.setScalar(2 + Math.sin(t * 6) * 0.15);
    }
    root.addEventListener('st-step', (e) => setStep(e.detail));
    show();
    root._fg = { step: (k) => root._st.set(k) };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.BdFrag = { mount };
})();
