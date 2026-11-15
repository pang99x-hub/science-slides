/* 1-2-3 3D 입자 장면 둘(RxMol.mount에 넘기는 설정). 입자 수·배치·움직임·온도계 높이는 이해를 돕기 위한 예.
   색 약속: 빨강·주황 = 나가는 열(방출), 파랑 = 들어오는 열(흡수).
   EAScenes.chem  1차시 «화학 변화와 에너지»: 왼쪽 메테인의 연소(방출) / 오른쪽 질산 암모늄이 물에 녹음(흡수) (4단계)
   EAScenes.lime  3차시 «산화 칼슘과 물»: 주머니 속 산화 칼슘 + 물 → 수산화 칼슘, 열이 조리 용기로 (4단계) */
(function () {
  'use strict';
  const M = window.RxMol, K = (n, o) => M.K(n, o);
  Object.assign(M.EL, {
    Ca: { c: '#d5dbe2', r: 0.5, m: 0.1, name: '칼슘' },
    Ow: { c: '#7fc3ea', r: 0.34, m: 0, name: '물 분자의 산소' }, Hw: { c: '#ffffff', r: 0.2, m: 0, name: '수소' },
  });
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const sm = (u) => { u = Math.max(0, Math.min(1, u)); return u * u * (3 - 2 * u); };
  const st = (N, p) => Array.from({ length: N }, () => p.slice());
  function tag(s, html, cls, at) {
    const stg = s.renderer.domElement.parentElement, el = document.createElement('span');
    el.className = 'o3-lab ' + (cls || 'm3-note'); el.innerHTML = html; stg.appendChild(el); s.label(el, at);
    return el;
  }
  function beaker(s, T3, cx, r, h, water, tint) {
    const g = new T3.Group();
    const glass = new T3.Mesh(new T3.CylinderGeometry(r, r * 0.97, h, 56, 1, true), new T3.MeshStandardMaterial({ color: '#dfeaf2', transparent: true, opacity: 0.16, roughness: 0.1, side: T3.DoubleSide, depthWrite: false }));
    glass.position.set(cx, h / 2, 0); g.add(glass);
    const rim = new T3.Mesh(new T3.TorusGeometry(r, 0.05, 8, 64), s.mat('#b9c7d2', { roughness: 0.3 })); rim.rotation.x = Math.PI / 2; rim.position.set(cx, h, 0); g.add(rim);
    const base = new T3.Mesh(new T3.CylinderGeometry(r * 0.97, r * 0.97, 0.08, 56), new T3.MeshStandardMaterial({ color: '#cfdde8', transparent: true, opacity: 0.5, roughness: 0.2 }));
    base.position.set(cx, 0.04, 0); g.add(base);
    const liq = new T3.Mesh(new T3.CylinderGeometry(r * 0.95, r * 0.93, water, 56), new T3.MeshStandardMaterial({ color: tint || '#9fd0ee', transparent: true, opacity: 0.17, roughness: 0.2, depthWrite: false }));
    liq.position.set(cx, water / 2 + 0.08, 0); g.add(liq);
    s.scene.add(g);
    return { g, glass, liq };
  }
  // 막대 온도계: 유리관 + 액체 기둥(높이 0~1을 바꿈)
  function thermo(s, T3, at, len) {
    const g = new T3.Group(); g.position.set(...at);
    const tube = new T3.Mesh(new T3.CylinderGeometry(0.17, 0.17, len, 20), new T3.MeshStandardMaterial({ color: '#eef3f6', transparent: true, opacity: 0.5, roughness: 0.1, depthWrite: false }));
    tube.position.y = len / 2; g.add(tube);
    const bulb = new T3.Mesh(new T3.SphereGeometry(0.28, 20, 14), s.mat('#d6402e', { roughness: 0.35 })); g.add(bulb);
    const col = new T3.Mesh(new T3.CylinderGeometry(0.09, 0.09, 1, 14), s.mat('#d6402e', { roughness: 0.35 })); g.add(col);
    for (let k = 1; k < 6; k++) { const tk = new T3.Mesh(new T3.BoxGeometry(0.22, 0.03, 0.03), s.mat('#4a5468')); tk.position.set(0.2, (len * k) / 6, 0); g.add(tk); }
    s.scene.add(g);
    return { g, set(f) { const h = Math.max(0.05, f * (len - 0.3)); col.scale.y = h; col.position.y = h / 2; } };
  }
  // 열 화살표(원뿔 + 막대): 밖으로(방출, 빨강) 또는 안으로(흡수, 파랑) 흘러가며 되풀이
  function arrows(s, T3, center, n, rIn, rOut, color, inward, y0, y1) {
    const g = new T3.Group(); s.scene.add(g);
    const mat = new T3.MeshStandardMaterial({ color: new T3.Color(color), emissive: new T3.Color(color), emissiveIntensity: 0.45, transparent: true, opacity: 0.9 });
    const list = [];
    for (let k = 0; k < n; k++) {
      const a = (k / n) * Math.PI * 2 + 0.3, y = y0 + ((k * 0.37) % 1) * (y1 - y0);
      const one = new T3.Group();
      const shaft = new T3.Mesh(new T3.CylinderGeometry(0.06, 0.06, 0.6, 10), mat); shaft.position.y = -0.3; one.add(shaft);
      const tip = new T3.Mesh(new T3.ConeGeometry(0.17, 0.34, 14), mat); tip.position.y = 0.12; one.add(tip);
      const dir = new T3.Vector3(Math.cos(a), 0, Math.sin(a)); if (inward) dir.negate();
      one.quaternion.setFromUnitVectors(new T3.Vector3(0, 1, 0), dir);
      g.add(one); list.push({ one, a, y, ph: k / n });
    }
    return {
      g, mat,
      upd(time, vis) {
        g.visible = vis > 0.02; mat.opacity = 0.9 * vis;
        list.forEach((o) => {
          const u = (time * 0.45 + o.ph) % 1, r = inward ? rOut - (rOut - rIn) * u : rIn + (rOut - rIn) * u;
          o.one.position.set(center[0] + Math.cos(o.a) * r, o.y, center[2] + Math.sin(o.a) * r);
          o.one.scale.setScalar(0.6 + 0.6 * Math.sin(Math.PI * u));
        });
      },
    };
  }
  function water(atoms, bonds, N, cs, info) {
    const i0 = atoms.length;
    atoms.push({ el: 'Ow', p: cs, info: info || '물 분자 H<sub>2</sub>O의 산소' });
    atoms.push({ el: 'Hw', p: cs.map((c) => add(c, [0.3, 0.3, 0.05])), info: '물 분자 속 수소' });
    atoms.push({ el: 'Hw', p: cs.map((c) => add(c, [-0.3, 0.3, -0.05])), info: '물 분자 속 수소' });
    bonds.push([i0, i0 + 1, 1], [i0, i0 + 2, 1]);
  }

  // ---------- 1차시: 화학 변화와 에너지 ----------
  function chem() {
    const N = 4, atoms = [], bonds = [], XL = -4.6, XR = 4.6;
    const J = (s) => window.RxT && window.RxT.jolt(s, 2);
    // 왼쪽: CH₄ + 2O₂ → CO₂ + 2H₂O
    const cA = [XL - 1.2, 2.4, 0], cB = [XL - 0.55, 2.4, 0];
    const hOff = [[0.4, 0.4, 0.4], [-0.4, -0.4, 0.4], [-0.4, 0.4, -0.4], [0.4, -0.4, -0.4]];
    const co2 = [XL, 3.3, 0], w1 = [XL - 1.1, 1.55, 0.3], w2 = [XL + 1.1, 1.55, -0.3];
    const c = atoms.push({ el: 'C', p: K(N, { 0: cA, 1: cB, 2: co2 }), lab: K(N, { 0: 'CH<sub>4</sub>', 2: 'CO<sub>2</sub>' }), lo: [0, 0.95, 0],
      info: K(N, { 0: '<b>메테인 CH<sub>4</sub></b>의 탄소: 수소 넷과 결합해 있다', 1: '불꽃의 열로 반응이 시작된다', 2: '탄소가 산소 둘과 새로 결합 → <b>이산화 탄소 CO<sub>2</sub></b>' }) }) - 1;
    const wH = [[w1, [0.32, 0.3, 0]], [w1, [-0.32, 0.3, 0]], [w2, [0.32, 0.3, 0]], [w2, [-0.32, 0.3, 0]]];
    hOff.forEach((o, k) => {
      const h = atoms.push({ el: 'H', p: K(N, { 0: add(cA, o), 1: add(cB, o), 2: add(wH[k][0], wH[k][1]) }), info: K(N, { 0: '메테인 속 수소 원자', 2: '수소가 산소와 새로 결합 → <b>물 H<sub>2</sub>O</b>' }) }) - 1;
      bonds.push([c, h, [1, 1, 0, 0]]);
    });
    const oA = [[XL + 1.0, 3.0, 0.4], [XL + 1.0, 1.6, -0.4]], oB = [[XL + 0.35, 3.0, 0.3], [XL + 0.35, 1.7, -0.3]];
    const oEnd = [add(co2, [-0.62, 0, 0]), add(co2, [0.62, 0, 0]), w1, w2];
    const os = [];
    [0, 1].forEach((m) => [-0.33, 0.33].forEach((dx, j) => {
      const k = m * 2 + j;
      os.push(atoms.push({ el: 'O', p: K(N, { 0: add(oA[m], [dx, 0, 0]), 1: add(oB[m], [dx, 0, 0]), 2: oEnd[k] }), lab: K(N, { 0: j === 0 ? 'O<sub>2</sub>' : null, 2: k === 2 ? 'H<sub>2</sub>O' : null }), lo: [0, 0.75, 0],
        info: K(N, { 0: '<b>산소 분자 O<sub>2</sub></b>의 산소 원자', 2: k < 2 ? '이산화 탄소 속 산소' : '물 분자 속 산소' }) }) - 1);
    }));
    bonds.push([os[0], os[1], [1, 1, 0, 0]], [os[2], os[3], [1, 1, 0, 0]]);
    bonds.push([c, os[0], [0, 0, 1, 1]], [c, os[1], [0, 0, 1, 1]]);
    [[os[2], c + 1], [os[2], c + 2], [os[3], c + 3], [os[3], c + 4]].forEach(([o, h]) => bonds.push([o, h, [0, 0, 1, 1]]));
    // 오른쪽: 질산 암모늄 → 물속 NH₄⁺ + NO₃⁻
    const ion = (kind, ps, labK, info) => {
      const center = atoms.push({ el: 'N', p: ps, lab: labK, lo: [0, 0.9, 0], info }) - 1;
      const offs = kind === 'nh4' ? hOff.map((o) => o.map((x) => x * 0.85)) : [0, 1, 2].map((q) => [Math.cos(q * 2.094) * 0.5, Math.sin(q * 2.094) * 0.5, 0]);
      offs.forEach((o) => { const i = atoms.push({ el: kind === 'nh4' ? 'H' : 'O', p: ps.map((pp) => add(pp, o)), info: kind === 'nh4' ? '암모늄 이온 속 수소' : '질산 이온 속 산소' }) - 1; bonds.push([center, i, 1]); });
    };
    const lat = [[XR - 0.45, 0.6, -0.4], [XR + 0.45, 0.6, -0.4], [XR - 0.45, 0.6, 0.45], [XR + 0.45, 0.6, 0.45]];
    const mid = [[XR - 0.9, 1.3, -0.6], [XR + 0.9, 1.5, -0.5], [XR - 0.8, 1.6, 0.7], [XR + 0.9, 1.1, 0.6]];
    const far = [[XR - 1.15, 1.2, -0.7], [XR + 1.1, 2.1, -0.6], [XR - 0.6, 2.3, 0.8], [XR + 0.9, 1.0, 0.8]];
    const kinds = ['nh4', 'no3', 'no3', 'nh4'];
    lat.forEach((p0, k) => {
      const nh = kinds[k] === 'nh4';
      const lab = K(N, { 0: k === 0 ? 'NH<sub>4</sub>NO<sub>3</sub> 고체' : null, 1: k === 0 ? 'NH<sub>4</sub><sup>+</sup>' : k === 1 ? 'NO<sub>3</sub><sup>−</sup>' : null });
      ion(kinds[k], K(N, { 0: p0, 1: mid[k], 2: far[k] }), lab,
        K(N, { 0: '<b>질산 암모늄 NH<sub>4</sub>NO<sub>3</sub></b> 고체 알갱이 속 ' + (nh ? '암모늄 이온' : '질산 이온'), 1: nh ? '<b>암모늄 이온 NH<sub>4</sub><sup>+</sup></b>: 고체에서 떨어져 나와 물속으로' : '<b>질산 이온 NO<sub>3</sub><sup>−</sup></b>: 고체에서 떨어져 나와 물속으로', 2: '물 분자에 둘러싸여 흩어진다. 떨어져 나오는 데 주변의 열을 가져간다' }));
    });
    const wA = [[XR - 1.3, 2.5, 0.4], [XR + 1.2, 2.6, 0.2], [XR, 2.8, -0.9], [XR - 1.2, 0.7, 0.9], [XR + 1.3, 0.7, -0.9], [XR, 2.2, 1.0]];
    const wC = [[XR - 1.2, 1.75, -0.3], [XR + 1.2, 2.7, -0.2], [XR - 0.1, 2.6, 1.0], [XR - 1.0, 0.75, 0.9], [XR + 1.15, 0.65, 1.15], [XR + 0.25, 1.55, 0.0]];
    wA.forEach((p0, k) => water(atoms, bonds, N, K(N, { 0: p0, 2: wC[k] })));
    return {
      steps: N, atoms, bonds,
      view: { yaw: 0.0, pitch: 0.26, dist: 18.5, target: [0, 2.1, 0] }, orbit: { min: 6, max: 34 },
      jitter: (t) => 0.02 + 0.05 * sm(t - 2),
      events: [{ at: 0.6, fn: (stg) => J(stg) }],
      build(s, T3) {
        // 왼쪽: 가스 노즐과 불꽃
        const noz = new T3.Mesh(new T3.CylinderGeometry(0.28, 0.4, 1.1, 24), s.mat('#7d8591', { metalness: 0.5, roughness: 0.35 })); noz.position.set(XL, 0.55, 0); s.scene.add(noz);
        const plate = new T3.Mesh(new T3.CylinderGeometry(1.6, 1.6, 0.12, 40), s.mat('#c9c2b2')); plate.position.set(XL, 0.03, 0); s.scene.add(plate);
        const flameM = new T3.MeshStandardMaterial({ color: '#ff9b2e', emissive: '#ff7a1a', emissiveIntensity: 1.2, transparent: true, opacity: 0.85, depthWrite: false });
        const flame = new T3.Mesh(new T3.ConeGeometry(0.42, 1.3, 24, 1, true), flameM); flame.position.set(XL, 1.75, 0); s.scene.add(flame);
        const blue = new T3.Mesh(new T3.ConeGeometry(0.22, 0.6, 20, 1, true), new T3.MeshStandardMaterial({ color: '#4f7df0', emissive: '#3a5fe0', emissiveIntensity: 1, transparent: true, opacity: 0.8, depthWrite: false })); blue.position.set(XL, 1.4, 0); s.scene.add(blue);
        const glowM = new T3.MeshBasicMaterial({ color: '#ff8a3a', transparent: true, opacity: 0, depthWrite: false });
        const glow = new T3.Mesh(new T3.SphereGeometry(1.7, 32, 20), glowM); glow.position.set(XL, 2.0, 0); s.scene.add(glow);
        const thL = thermo(s, T3, [XL - 2.4, 0.3, 1.0], 3.6);
        const outA = arrows(s, T3, [XL, 0, 0], 8, 2.2, 3.3, '#e2622b', false, 1.4, 3.6);
        // 오른쪽: 비커, 서리
        const bk = beaker(s, T3, XR, 2.0, 3.6, 3.0);
        const frost = new T3.Mesh(new T3.CylinderGeometry(2.06, 2.03, 3.2, 56, 1, true), new T3.MeshStandardMaterial({ color: '#e9f6ff', transparent: true, opacity: 0, roughness: 0.9, side: T3.DoubleSide, depthWrite: false }));
        frost.position.set(XR, 1.6, 0); s.scene.add(frost);
        const thR = thermo(s, T3, [XR + 1.25, 0.35, 0.9], 3.9);
        const inA = arrows(s, T3, [XR, 0, 0], 8, 2.3, 3.4, '#2a8fb8', true, 0.8, 3.0);
        tag(s, '메테인의 연소', 'm3-name', new T3.Vector3(XL, -0.55, 1.8));
        tag(s, '질산 암모늄이 물에 녹음', 'm3-name', new T3.Vector3(XR, -0.55, 1.8));
        const tl = tag(s, '주변 온도', 'm3-note ea-th-lab', new T3.Vector3(XL - 2.4, 4.4, 1.0));
        const tr = tag(s, '물의 온도', 'm3-note ea-th-lab', new T3.Vector3(XR + 1.25, 4.7, 0.9));
        return (t, time) => {
          const on = sm((t - 0.3) / 0.7), heat = sm((t - 2) / 0.8), cold = sm((t - 1.6) / 1.2);
          flame.visible = blue.visible = on > 0.02;
          flame.scale.set(on * (1 + 0.08 * Math.sin(time * 13)), on * (1 + 0.12 * Math.sin(time * 9)), on);
          blue.scale.setScalar(on);
          glowM.opacity = 0.07 * heat * (0.85 + 0.15 * Math.sin(time * 5));
          outA.upd(time, heat); inA.upd(time, cold);
          thL.set(0.35 + 0.5 * heat); thR.set(0.55 - 0.35 * cold);
          frost.material.opacity = 0.42 * cold;
          tl.innerHTML = heat > 0.5 ? '주변 온도 <b class="ea-up">↑ 높아짐</b>' : '주변 온도';
          tr.innerHTML = cold > 0.5 ? '물의 온도 <b class="ea-dn">↓ 낮아짐</b>' : '물의 온도';
          bk.liq.material.color.set(cold > 0.5 ? '#bfe6fb' : '#9fd0ee');
        };
      },
    };
  }

  // ---------- 3차시: 산화 칼슘과 물 ----------
  function lime() {
    const N = 4, atoms = [], bonds = [];
    const J = (s) => window.RxT && window.RxT.jolt(s, 3);
    const cells = [[-1.3, -0.45], [-0.45, 0.45], [0.45, -0.45], [1.3, 0.45]];
    cells.forEach(([x, z], k) => {
      const ca0 = [x, 0.42, z], ca2 = [x, 0.62, z];
      const ca = atoms.push({ el: 'Ca', p: K(N, { 0: ca0, 2: ca2 }), lab: K(N, { 0: k === 0 ? 'CaO' : null, 2: k === 0 ? 'Ca(OH)<sub>2</sub>' : null }), lo: [0, 1.15, 0],
        info: K(N, { 0: '<b>산화 칼슘 CaO</b>의 칼슘: 산소와 결합해 있다', 1: '물 분자가 산화 칼슘에 닿는다', 2: '<b>수산화 칼슘 Ca(OH)<sub>2</sub></b>: 칼슘에 OH가 둘 붙었다. 이때 열을 많이 내놓는다' }) }) - 1;
      const o1 = atoms.push({ el: 'O', p: K(N, { 0: [x + 0.62, 0.42, z], 2: [x + 0.62, 0.95, z] }), info: K(N, { 0: '산화 칼슘 속 산소', 2: '수산화 칼슘 속 OH의 산소' }) }) - 1;
      const w0 = [x + (k % 2 ? 0.3 : -0.3), 4.6 + k * 0.35, z * 0.6], w1 = [x - 0.25, 1.35, z + 0.15], w2 = [x - 0.62, 0.95, z];
      const o2 = atoms.push({ el: 'Ow', p: K(N, { 0: w0, 1: w1, 2: w2 }), show: K(N, { 0: 0, 1: 1 }), lab: K(N, { 1: k === 1 ? 'H<sub>2</sub>O' : null, 2: null }), lo: [0, 0.8, 0],
        info: K(N, { 0: '부을 물', 1: '<b>물 분자 H<sub>2</sub>O</b>: 주머니 속으로 스며든다', 2: '물 분자가 갈라져 칼슘에 OH로 붙었다' }) }) - 1;
      const hA = atoms.push({ el: 'Hw', p: K(N, { 0: add(w0, [0.3, 0.3, 0]), 1: add(w1, [0.3, 0.3, 0]), 2: [x + 0.95, 1.25, z] }), show: K(N, { 0: 0, 1: 1 }), info: '수소 원자' }) - 1;
      const hB = atoms.push({ el: 'Hw', p: K(N, { 0: add(w0, [-0.3, 0.3, 0]), 1: add(w1, [-0.3, 0.3, 0]), 2: [x - 0.95, 1.25, z] }), show: K(N, { 0: 0, 1: 1 }), info: '수소 원자' }) - 1;
      bonds.push([ca, o1, 1], [o2, hA, [1, 1, 0, 0]], [o2, hB, 1], [o1, hA, [0, 0, 1, 1]], [ca, o2, [0, 0, 1, 1]]);
    });
    return {
      steps: N, atoms, bonds,
      view: { yaw: 0.55, pitch: 0.4, dist: 10.5, target: [0, 2.0, 0] }, orbit: { min: 5, max: 30 },
      jitter: (t) => 0.015 + 0.05 * sm(t - 1.6),
      events: [{ at: 1.6, fn: (stg) => J(stg) }],
      build(s, T3) {
        // 반응 용기(투명 상자)
        const W = 4.6, D = 3.0, H = 2.3;
        const glass = new T3.MeshStandardMaterial({ color: '#dfeaf2', transparent: true, opacity: 0.18, roughness: 0.1, side: T3.DoubleSide, depthWrite: false });
        const box = new T3.Mesh(new T3.BoxGeometry(W, H, D), glass); box.position.set(0, H / 2, 0); s.scene.add(box);
        const edges = new T3.LineSegments(new T3.EdgesGeometry(new T3.BoxGeometry(W, H, D)), new T3.LineBasicMaterial({ color: '#8fa3b3' })); edges.position.copy(box.position); s.scene.add(edges);
        // 부직포 주머니
        const pouch = new T3.Mesh(new T3.BoxGeometry(3.6, 0.55, 1.9), new T3.MeshStandardMaterial({ color: '#f3efe2', transparent: true, opacity: 0.45, roughness: 0.95, depthWrite: false }));
        pouch.position.set(0, 0.42, 0); s.scene.add(pouch);
        // 물(반응 용기 바닥에 차오름)
        const wM = new T3.MeshStandardMaterial({ color: '#9fd0ee', transparent: true, opacity: 0.2, depthWrite: false });
        const wat = new T3.Mesh(new T3.BoxGeometry(W - 0.1, 1, D - 0.1), wM); s.scene.add(wat);
        // 붓는 비커(1단계에서 기울어 물을 붓고 사라짐)
        const pour = new T3.Group(); s.scene.add(pour);
        const pg = new T3.Mesh(new T3.CylinderGeometry(0.75, 0.7, 1.6, 32, 1, true), glass); pour.add(pg);
        const pw = new T3.Mesh(new T3.CylinderGeometry(0.68, 0.66, 0.9, 32), wM); pw.position.y = -0.3; pour.add(pw);
        const stream = new T3.Mesh(new T3.CylinderGeometry(0.08, 0.08, 2.4, 10), new T3.MeshStandardMaterial({ color: '#7fc3ea', transparent: true, opacity: 0.6 })); s.scene.add(stream);
        // 김(하얀 덩이가 솟음)
        const steamM = new T3.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0, roughness: 1, depthWrite: false });
        const puffs = Array.from({ length: 9 }, (_, k) => { const m = new T3.Mesh(new T3.SphereGeometry(0.35 + (k % 3) * 0.1, 14, 10), steamM); s.scene.add(m); return { m, ph: k / 9, x: (k % 3 - 1) * 1.4, z: ((k * 5) % 3 - 1) * 0.8 }; });
        const glowM = new T3.MeshBasicMaterial({ color: '#ff8a3a', transparent: true, opacity: 0, depthWrite: false });
        const glow = new T3.Mesh(new T3.BoxGeometry(W - 0.3, 1.4, D - 0.3), glowM); glow.position.set(0, 0.8, 0); s.scene.add(glow);
        // 조리 용기(금속, 물 300 mL) — 3단계에서 내려와 얹힌다
        const cook = new T3.Group(); s.scene.add(cook);
        const pan = new T3.Mesh(new T3.BoxGeometry(W - 0.4, 1.5, D - 0.4), new T3.MeshStandardMaterial({ color: '#b9c0c8', metalness: 0.6, roughness: 0.35, transparent: true, opacity: 0.55, depthWrite: false }));
        cook.add(pan);
        const cwM = new T3.MeshStandardMaterial({ color: '#7fb9e0', transparent: true, opacity: 0.55, depthWrite: false });
        const cw = new T3.Mesh(new T3.BoxGeometry(W - 0.6, 1.05, D - 0.6), cwM); cw.position.y = -0.15; cook.add(cw);
        const th = thermo(s, T3, [1.3, 0, 0], 2.8); cook.add(th.g); th.g.position.set(1.3, -0.5, 0.4);
        const upA = arrows(s, T3, [0, 0, 0], 6, 0.4, 1.2, '#e2622b', false, 1.9, 2.2);
        upA.g.children.forEach((o) => o.quaternion.setFromUnitVectors(new T3.Vector3(0, 1, 0), new T3.Vector3(0, 1, 0)));
        tag(s, '반응 용기 · 산화 칼슘 주머니 + 물', 'm3-name', new T3.Vector3(0, -0.5, 1.9));
        const ctag = tag(s, '조리 용기 · 물', 'm3-name', new T3.Vector3(0, 4.6, 0));
        const hot = new T3.Color('#f08a4b'), cool = new T3.Color('#7fb9e0');
        return (t, time) => {
          const fill = sm(t - 0.2), pourOn = Math.sin(Math.PI * sm((t - 0.05) / 0.95)), rx = sm(t - 1.4), lid = sm(t - 2), warm = sm((t - 2.2) / 0.8);
          wat.scale.y = 0.05 + 0.9 * fill; wat.position.set(0, (0.05 + 0.9 * fill) / 2 + 0.02, 0);
          pour.visible = stream.visible = pourOn > 0.05;
          pour.position.set(-1.5, 4.3, 0); pour.rotation.z = -1.1 * pourOn;
          stream.position.set(-0.8, 2.8, 0); stream.scale.y = pourOn;
          steamM.opacity = 0.6 * rx * (1 - 0.6 * lid);
          puffs.forEach((p) => { const u = (time * 0.35 + p.ph) % 1; p.m.position.set(p.x + Math.sin(time + p.ph * 6) * 0.2, 1.4 + u * 3.2, p.z); p.m.scale.setScalar(0.6 + u); });
          glowM.opacity = 0.22 * rx * (0.85 + 0.15 * Math.sin(time * 4));
          cook.visible = lid > 0.02; ctag.style.opacity = String(lid);
          cook.position.set(0, 2.35 + 0.75 + (1 - lid) * 2.6, 0);
          cwM.color.copy(cool).lerp(hot, warm); th.set(0.2 + 0.65 * warm);
          upA.upd(time, warm);
          upA.g.position.y = 0;
        };
      },
    };
  }

  window.EAScenes = { chem, lime };
})();
