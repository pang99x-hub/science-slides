/* 1-2-1 3D 입자 장면 넷(RxMol.mount에 넘기는 설정). 원자 수·배치·움직임은 이해를 돕기 위한 예.
   RxScenes.cu   1차시 «구리 표면의 산소»: 2Cu + O₂ → 2CuO, CuO + CO → Cu + CO₂ (5단계)
   RxScenes.cuo  1차시 «산화 구리(Ⅱ)와 탄소»: 2CuO + C → 2Cu + CO₂ (4단계)
   RxScenes.zn   2차시 «아연판 + 황산 구리(Ⅱ) 수용액»: Zn + Cu²⁺ → Zn²⁺ + Cu (5단계)
   RxScenes.mg   2차시 «마그네슘의 연소»: 2Mg + O₂ → 2MgO (4단계, 불이 붙는 순간 흔들림·진동) */
(function () {
  'use strict';
  const K = (n, o) => window.RxMol.K(n, o);
  const CU = '#c8743a', CUO = '#2b2622';
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  // 금속 겉면: 위층 nx×nz, 아래층은 반 칸 어긋나게
  function lattice(el, nx, nz, skip, info) {
    const top = [], all = [];
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      const p = [-(nx - 1) / 2 + i, 0, -(nz - 1) / 2 + j], key = i + ',' + j;
      if (skip && skip.includes(key)) continue;
      const a = { el, p, info }; top.push(a); all.push(a);
    }
    for (let i = 0; i < nx - 1; i++) for (let j = 0; j < nz - 1; j++) all.push({ el, p: [-(nx - 2) / 2 + i, -0.72, -(nz - 2) / 2 + j], info });
    return all;
  }
  const jolt = (st, k) => { if (window.RxT && window.RxT.jolt) window.RxT.jolt(st, k); };

  // ---------- 1차시: 구리 표면에서 산소가 오간다 ----------
  function cu() {
    const N = 5, atoms = [], bonds = [];
    const base = lattice('Cu', 6, 5, ['1,1', '1,3', '4,1', '4,3'], '구리 원자 Cu: 붉은 구리판의 겉면');
    atoms.push(...base);
    const T = [[-1.5, -1], [-1.5, 1], [1.5, -1], [1.5, 1]];
    const tIdx = T.map(([x, z], k) => atoms.push({
      el: 'Cu', p: [x, 0, z], col: K(N, { 0: CU, 2: CUO, 4: CU }),
      lab: k === 0 ? K(N, { 0: 'Cu', 2: 'CuO', 4: 'Cu' }) : null,
      info: K(N, { 0: '구리 원자 Cu: 붉은 구리판의 겉면', 2: '산소를 얻은 구리 → 검은 <b>산화 구리(Ⅱ) CuO</b> (산화)', 4: '산소를 잃고 다시 붉은 <b>구리 Cu</b> (환원)' }),
    }) - 1);
    // 산소 분자 둘 → 원자 넷
    const O2 = [[-1.5, 3.2], [1.5, 3.7]];
    const oIdx = [];
    O2.forEach(([x, y], m) => {
      [-1, 1].forEach((sg, h) => {
        const k = m * 2 + h, [tx, tz] = T[k];
        oIdx.push(atoms.push({
          el: 'O', p: K(N, { 0: [x, y, sg * 0.36], 1: [x, 1.65 + m * 0.15, sg * 0.36], 2: [tx, 0.7, tz], 4: [tx + 0.7, 2.6, tz] }),
          lab: h === 0 ? K(N, { 0: 'O<sub>2</sub>', 2: null }) : null,
          info: K(N, { 0: '공기 속 <b>산소 분자 O₂</b>의 산소 원자', 2: '구리와 결합한 산소 원자(CuO 속)', 4: 'CO로 옮겨 간 산소 원자(CO₂ 속)' }),
        }) - 1);
      });
      bonds.push([oIdx[m * 2], oIdx[m * 2 + 1], K(N, { 0: 1, 2: 0 })]);
    });
    T.forEach((_, k) => bonds.push([tIdx[k], oIdx[k], K(N, { 0: 0, 2: 1, 4: 0 })]));
    // 일산화 탄소 넷: 속불꽃 단계에 위에서 내려온다
    T.forEach(([x, z], k) => {
      const c = atoms.push({
        el: 'C', show: K(N, { 0: 0, 3: 1 }), p: K(N, { 0: [x + 0.4, 4.4, z], 3: [x + 0.4, 1.85, z], 4: [x + 0.7, 3.35, z] }),
        lab: k === 0 ? K(N, { 0: null, 3: 'CO', 4: 'CO<sub>2</sub>' }) : null, lo: [0.75, 0.55, 0],
        info: K(N, { 0: '', 3: '<b>일산화 탄소 CO</b>의 탄소 원자: 산소를 더 얻으려 한다', 4: '산소를 하나 더 얻은 탄소 → <b>이산화 탄소 CO₂</b> (산화)' }),
      }) - 1;
      const o = atoms.push({ el: 'O', show: K(N, { 0: 0, 3: 1 }), p: K(N, { 0: [x + 0.4, 5.15, z], 3: [x + 0.4, 2.6, z], 4: [x + 0.7, 4.1, z] }), info: '일산화 탄소에 처음부터 있던 산소 원자' }) - 1;
      bonds.push([c, o, 1], [c, oIdx[k], K(N, { 0: 0, 4: 1 })]);
    });
    return {
      steps: N, atoms, bonds,
      view: { yaw: 0.55, pitch: 0.42, dist: 12.5, target: [0, 1.2, 0] }, orbit: { min: 5, max: 26 },
      build(s, T3) {
        // 구리판 몸통(겉면 아래)
        const slab = new T3.Mesh(new T3.BoxGeometry(6.4, 0.7, 5.4), s.mat('#a85a2a', { metalness: 0.4, roughness: 0.4 }));
        slab.position.set(0, -1.35, 0); s.scene.add(slab);
        return null;
      },
    };
  }

  // ---------- 1차시: 산화 구리(Ⅱ)와 탄소 가루 ----------
  function cuo() {
    const N = 4, atoms = [], bonds = [];
    [-1.7, 1.7].forEach((x0, g) => {
      const c = atoms.push({
        el: 'C', p: K(N, { 0: [x0, 0.42, 0], 2: [x0, 0.6, 0], 3: [x0 + 0.5, 3.4, 0] }),
        lab: g === 0 ? K(N, { 0: 'C', 2: null, 3: 'CO<sub>2</sub>' }) : null, lo: [0, 1.2, 0],
        info: K(N, { 0: '<b>탄소</b> 가루의 탄소 원자', 2: '산소 원자 둘을 끌어온 탄소', 3: '산소 둘과 결합해 <b>CO₂</b>가 된 탄소 (산화) → 석회수를 뿌옇게' }),
      }) - 1;
      [-1, 1].forEach((sg, h) => {
        const cuI = atoms.push({
          el: 'Cu', col: K(N, { 0: CUO, 3: CU }), p: K(N, { 0: [x0, 0.47, sg * 1.75], 3: [x0, 0.47, sg * 0.5] }),
          lab: g === 0 && h === 0 ? K(N, { 0: 'CuO', 3: 'Cu' }) : null,
          info: K(N, { 0: '<b>산화 구리(Ⅱ) CuO</b>의 구리(검은 가루)', 3: '산소를 잃고 남은 붉은 <b>구리 Cu</b> (환원)' }),
        }) - 1;
        const o = atoms.push({
          el: 'O', p: K(N, { 0: [x0, 0.42, sg * 1.0], 2: [x0, 0.6, sg * 0.66], 3: [x0 + 0.5, 3.4, sg * 0.66] }),
          info: K(N, { 0: '산화 구리(Ⅱ) 속 산소 원자', 2: '탄소 쪽으로 옮겨 가는 산소 원자', 3: '이산화 탄소 속 산소 원자' }),
        }) - 1;
        bonds.push([cuI, o, K(N, { 0: 1, 2: 0 })], [c, o, K(N, { 0: 0, 2: 1 })]);
      });
    });
    let glow = null, tray = null, lime = null;
    return {
      steps: N, atoms, bonds,
      view: { yaw: 0.75, pitch: 0.5, dist: 11, target: [0, 1.2, 0] }, orbit: { min: 5, max: 24 },
      jitter: (t) => 0.06 * Math.max(0, 1 - Math.abs(t - 1.3) / 0.9),
      build(s, T3, a) {
        api = a;
        tray = new T3.Mesh(new T3.CylinderGeometry(3.6, 3.6, 0.16, 48), s.mat('#d9dee4', { roughness: 0.3, transparent: true, opacity: 0.85 }));
        tray.position.set(0, -0.1, 0); s.scene.add(tray);
        glow = new T3.PointLight('#ff7a1a', 0, 14); glow.position.set(0, -1.6, 0); s.scene.add(glow);
        const st = s.renderer.domElement.parentElement;
        lime = document.createElement('span'); lime.className = 'o3-lab m3-note'; lime.innerHTML = '석회수 쪽으로 ↑'; st.appendChild(lime);
        s.label(lime, () => (api.t > 2.5 ? new T3.Vector3(0, 4.6, 0) : null));
        const heat = document.createElement('span'); heat.className = 'o3-lab m3-heat'; heat.textContent = '가열'; st.appendChild(heat);
        s.label(heat, () => (api.t > 0.5 && api.t < 2.6 ? new T3.Vector3(0, -0.7, 2.9) : null));
        return (t) => {
          const h = Math.max(0, Math.min(1, t - 0.3)) * (t > 2.4 ? Math.max(0, 3.4 - t) : 1);
          glow.intensity = 26 * h; tray.material.color.set(h > 0.05 ? '#f0c9a0' : '#d9dee4');
        };
      },
    };
    var api; // build에서 api.t를 읽는다(mount가 넘겨 준 api를 받아 둔다)
  }

  // ---------- 2차시: 황산 구리(Ⅱ) 수용액 속 아연판 ----------
  function zn() {
    const N = 5, atoms = [], bonds = [], electrons = [];
    const L = [[-1.5, -1], [0.5, 1], [1.5, -1]];
    atoms.push(...lattice('Zn', 6, 5, ['1,1', '3,3', '4,1'], '아연 원자 Zn: 아연판의 겉면'));
    const cuStart = [[-1.0, 3.2, 0.3], [0.9, 3.6, 2.0], [2.3, 3.0, -1.9]];
    L.forEach(([x, z], k) => {
      atoms.push({
        el: 'Zn', p: K(N, { 0: [x, 0, z], 3: [x - 0.7, 2.6, z - 0.4], 4: [x - 1.1, 3.5, z - 0.6] }),
        lab: K(N, { 0: 'Zn', 2: 'Zn<sup>2+</sup>' }),
        info: K(N, { 0: '아연 원자 Zn: 곧 전자 2개를 내줄 원자', 2: '전자 2개를 잃은 <b>아연 이온 Zn²⁺</b> (산화)', 3: '수용액으로 녹아 나가는 아연 이온 Zn²⁺' }),
      });
      const near = [x + 0.78, 0.78, z];
      atoms.push({
        el: 'Cu', col: K(N, { 0: '#c8743a' }), p: K(N, { 0: cuStart[k], 1: near, 3: [x, 0, z] }),
        lab: K(N, { 0: 'Cu<sup>2+</sup>', 2: 'Cu' }),
        info: K(N, { 0: '수용액 속 <b>구리 이온 Cu²⁺</b>: 수용액이 푸른 까닭', 2: '전자 2개를 얻은 <b>구리 원자 Cu</b> (환원)', 3: '아연판 겉면에 붙은(석출된) 붉은 구리' }),
      });
      [-1, 1].forEach((sg, h) => electrons.push({
        p: K(N, { 0: [x + sg * 0.22, 0.55, z], 2: [near[0] + sg * 0.2, near[1] + 0.5, near[2]], 3: [x + sg * 0.15, 0.3, z] }),
        show: K(N, { 0: 0, 1: 1, 3: 0 }), arc: 1.1, lab: k === 0 && h === 0,
      }));
    });
    // 황산 이온(구경꾼): 황 하나 + 산소 넷, 둥둥 떠 있을 뿐 반응하지 않는다
    const SO = [[-2.3, 3.7, 1.7], [0.6, 4.4, -1.4], [2.6, 3.6, 1.8]];
    const tet = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]].map((v) => v.map((c) => c * 0.27));
    SO.forEach((c, k) => {
      const bob = (d) => K(N, { 0: c, 1: add(c, [0.1, 0.12, 0]), 2: add(c, [0.05, -0.08, 0.1]), 3: add(c, [-0.08, 0.1, 0.05]), 4: add(c, [0, -0.05, -0.1]) }).map((p) => add(p, d));
      const sI = atoms.push({ el: 'S', p: bob([0, 0, 0]), lab: k === 1 ? 'SO<sub>4</sub><sup>2−</sup>' : null, lo: [0, 0.75, 0], info: '<b>황산 이온 SO₄²⁻</b>: 반응하지 않고 그대로 남는 이온' }) - 1;
      tet.forEach((d) => { const o = atoms.push({ el: 'O', r: 0.22, p: bob(d), info: '황산 이온 속 산소 원자(반응하지 않음)' }) - 1; bonds.push([sI, o, 1]); });
    });
    let water = null;
    return {
      steps: N, atoms, bonds, electrons,
      view: { yaw: 0.5, pitch: 0.38, dist: 13.5, target: [0, 1.5, 0] }, orbit: { min: 5, max: 28 },
      build(s, T3) {
        const slab = new T3.Mesh(new T3.BoxGeometry(6.4, 0.7, 5.4), s.mat('#8d98a6', { metalness: 0.5, roughness: 0.4 }));
        slab.position.set(0, -1.35, 0); s.scene.add(slab);
        water = new T3.Mesh(new T3.BoxGeometry(7.2, 5.0, 6.2), new T3.MeshStandardMaterial({ color: new T3.Color('#3f86d8'), transparent: true, opacity: 0.16, depthWrite: false, roughness: 0.1 }));
        water.position.set(0, 2.3, 0); s.scene.add(water);
        const pale = new T3.Color('#bcd2e4'), blue = new T3.Color('#3f86d8');
        return (t) => { const u = Math.max(0, Math.min(1, (t - 2.6) / 1.4)); water.material.color.copy(blue.clone().lerp(pale, u)); water.material.opacity = 0.16 - 0.07 * u; };
      },
    };
  }

  // ---------- 2차시: 마그네슘의 연소 ----------
  function mg() {
    const N = 4, atoms = [], bonds = [], electrons = [];
    const flat = [[-0.5, 0, -0.5], [0.5, 0, 0.5], [0.5, 0, -0.5], [-0.5, 0, 0.5]];
    const q = 0.5, y0 = 0.9;
    const cubeMg = [[q, y0 + q, q], [q, y0 - q, -q], [-q, y0 + q, -q], [-q, y0 - q, q]];
    const cubeO = [[-q, y0 - q, -q], [-q, y0 + q, q], [q, y0 - q, q], [q, y0 + q, -q]];
    const mgI = flat.map((p, k) => atoms.push({
      el: 'Mg', p: K(N, { 0: p, 3: cubeMg[k] }), lab: k === 0 ? K(N, { 0: 'Mg', 2: 'Mg<sup>2+</sup>' }) : null,
      info: K(N, { 0: '마그네슘 리본의 <b>마그네슘 원자 Mg</b>', 2: '전자 2개를 잃은 <b>마그네슘 이온 Mg²⁺</b> (산화)', 3: '산화 마그네슘 속 Mg²⁺' }),
    }) - 1);
    const O2 = [[-1.0, 2.9, 0.0], [1.2, 3.2, 0.2]];
    const oI = [];
    O2.forEach(([x, y, z], m) => [-1, 1].forEach((sg, h) => {
      const k = m * 2 + h, top = add(flat[k], [0, 0.82, 0]);
      oI.push(atoms.push({
        el: 'O', p: K(N, { 0: [x + sg * 0.36, y, z], 1: [x + sg * 0.36, y - 0.6, z], 2: top, 3: cubeO[k] }),
        lab: h === 0 ? K(N, { 0: 'O<sub>2</sub>', 2: 'O<sup>2−</sup>' }) : null,
        info: K(N, { 0: '공기 속 <b>산소 분자 O₂</b>의 산소 원자', 2: '전자 2개를 얻은 <b>산화 이온 O²⁻</b> (환원)', 3: '산화 마그네슘 속 O²⁻' }),
      }) - 1);
      if (h) bonds.push([oI[k - 1], oI[k], K(N, { 0: 1, 2: 0 })]);
    }));
    flat.forEach((p, k) => [-1, 1].forEach((sg, h) => electrons.push({
      p: K(N, { 0: add(p, [sg * 0.24, 0.5, 0]), 2: add(add(flat[k], [0, 0.82, 0]), [sg * 0.2, 0.42, 0]) }),
      show: K(N, { 0: 0, 1: 1, 3: 0 }), arc: 0.9, lab: k === 0 && h === 0,
    })));
    let fl = null, halo = null, lab = null;
    return {
      steps: N, atoms, bonds, electrons,
      view: { yaw: 0.6, pitch: 0.45, dist: 10.5, target: [0, 1.1, 0] }, orbit: { min: 4, max: 22 },
      jitter: (t) => 0.05 * Math.max(0, 1 - Math.abs(t - 1.2) / 0.8),
      events: [{ at: 0.6, fn: (st) => jolt(st, 3) }],
      build(s, T3, a) {
        api = a;
        fl = new T3.PointLight('#ffffff', 0, 16); fl.position.set(0, 1.2, 0); s.scene.add(fl);
        halo = new T3.Mesh(new T3.SphereGeometry(1, 32, 24), new T3.MeshBasicMaterial({ color: new T3.Color('#fff7d6'), transparent: true, opacity: 0, depthWrite: false }));
        halo.position.set(0, 0.6, 0); s.scene.add(halo);
        const st = s.renderer.domElement.parentElement;
        lab = document.createElement('span'); lab.className = 'o3-lab m3-note'; lab.innerHTML = '산화 마그네슘 MgO(흰 가루)'; st.appendChild(lab);
        s.label(lab, () => (api.t > 2.6 ? new T3.Vector3(0, 3.0, 0) : null));
        return (t, time) => {
          const f = Math.max(0, 1 - Math.abs(t - 1.1) / 0.9);
          fl.intensity = 40 * f * (0.85 + 0.15 * Math.sin(time * 30));
          halo.material.opacity = 0.55 * f; halo.scale.setScalar(1.6 + 1.2 * f + 0.1 * Math.sin(time * 17));
        };
      },
    };
    var api;
  }

  // mount가 api를 만든 뒤 build에 넘겨 주므로, 설정마다 api를 받아 쓰게 감싼다
  const wrap = (make) => () => {
    const c = make();
    const b = c.build;
    c.build = (s, T3, api) => { c._api = api; return b ? b.call(c, s, T3, api) : null; };
    return c;
  };
  window.RxScenes = { cu: wrap(cu), cuo: wrap(cuo), zn: wrap(zn), mg: wrap(mg) };
})();
