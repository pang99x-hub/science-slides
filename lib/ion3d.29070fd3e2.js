/* 1-2-2 3D 입자 장면 넷(RxMol.mount에 넘기는 설정). 입자 수·배치·움직임은 이해를 돕기 위한 예.
   색은 교과서 그림 Ⅰ-26과 같게: H⁺ 흰 회색 작은 공 · Cl⁻ 초록 · Na⁺ 노랑 · OH⁻ 주황 산소 + 흰 수소 · 물 분자 하늘색 산소 + 흰 수소 둘
   ABScenes.cond     1차시 «수용액에 전류가 흐르는 까닭»: 설탕물·염산·수산화 나트륨 수용액 세 비커, 전원을 켜면 이온이 극으로 (3단계)
   ABScenes.ionize   2차시 «물에 녹으면 나뉜다»: 염화 수소·수산화 나트륨이 물속에서 이온으로 나뉘고 물 분자가 둘러싼다 (4단계)
   ABScenes.migrate  2차시 «이온은 어느 극으로»: 질산 칼륨 수용액을 적신 리트머스 종이 두 장, 전류를 흘리면 색 띠가 번진다 (4단계)
   ABScenes.neut     4차시 «중화 반응 모형»: 염산 + 수산화 나트륨 수용액 → 물, 남는 Na⁺·Cl⁻, 물을 날리면 염 결정 (5단계) */
(function () {
  'use strict';
  const M = window.RxMol, K = (n, o) => M.K(n, o);
  // 이온·분자 종류(교과서 그림 색). 이름은 누르면 나오는 풀이에 쓴다
  Object.assign(M.EL, {
    Hp: { c: '#f3f4f6', r: 0.24, m: 0, name: '수소 이온' }, Cl: { c: '#46a35a', r: 0.5, m: 0, name: '염화 이온' },
    Na: { c: '#f2cf3c', r: 0.42, m: 0, name: '나트륨 이온' }, Oh: { c: '#ec8a3a', r: 0.36, m: 0, name: '수산화 이온의 산소' },
    Ow: { c: '#7fc3ea', r: 0.34, m: 0, name: '물 분자의 산소' }, Hw: { c: '#ffffff', r: 0.2, m: 0, name: '수소' },
    K: { c: '#b58ad6', r: 0.46, m: 0, name: '칼륨 이온' }, N3: { c: '#8f9bb0', r: 0.44, m: 0, name: '질산 이온' },
    Su: { c: '#d8b98a', r: 0.5, m: 0, name: '설탕 분자' },
  });
  const OHC = '#ec8a3a', OWC = '#7fc3ea';
  const v = { add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], mul: (a, k) => [a[0] * k, a[1] * k, a[2] * k] };
  v.len = (a) => Math.hypot(a[0], a[1], a[2]) || 1; v.unit = (a) => v.mul(a, 1 / v.len(a));
  v.cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  // 같은 씨앗이면 늘 같은 배치(찍을 때마다 같은 그림)
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
  // 물 분자: 산소 중심 c, 수소 쪽 방향 d(단계별 배열) → 원자 셋. 굽은 모양(약 104°)
  function water(N, cs, ds, info, extra) {
    const A = 0.91, L = 0.44;
    const hpos = (sg) => cs.map((c, k) => {
      const d = v.unit(ds[k]); let q = v.cross(d, [0.3, 1, 0.2]); q = v.unit(q);
      return v.add(c, v.add(v.mul(d, L * Math.cos(A)), v.mul(q, sg * L * Math.sin(A))));
    });
    const o = Object.assign({ el: 'Ow', p: cs, info: info || '물 분자 H<sub>2</sub>O의 산소(하늘색)' }, extra || {});
    return [o, { el: 'Hw', p: hpos(1), info: '물 분자 속 수소 원자', show: o.show }, { el: 'Hw', p: hpos(-1), info: '물 분자 속 수소 원자', show: o.show }];
  }
  function pushWater(atoms, bonds, N, cs, ds, info, extra) {
    const w = water(N, cs, ds, info, extra), i0 = atoms.length;
    atoms.push(...w); bonds.push([i0, i0 + 1, 1], [i0, i0 + 2, 1]);
    return i0;
  }
  const stat = (N, p) => Array.from({ length: N }, () => p.slice());
  // 비커 안 아무 자리(반지름 r 안, 높이 y0~y1)
  function spot(R, cx, r, y0, y1) { const a = R() * Math.PI * 2, rr = Math.sqrt(R()) * r; return [cx + Math.cos(a) * rr, y0 + R() * (y1 - y0), Math.sin(a) * rr]; }
  function spread(R, n, cx, r, y0, y1, gap = 0.95, avoid = []) {
    const out = [];
    for (let k = 0; k < n; k++) {
      let p, tries = 0;
      do { p = spot(R, cx, r, y0, y1); tries++; } while (tries < 60 && [...out, ...avoid].some((q) => v.len(v.sub(p, q)) < gap));
      out.push(p);
    }
    return out;
  }
  const rdir = (R) => v.unit([R() - 0.5, R() - 0.5, R() - 0.5]);

  // ---------- 바탕 조각 ----------
  function beaker(s, T3, cx, r, h, water, tint) {
    const g = new T3.Group();
    const glass = new T3.Mesh(new T3.CylinderGeometry(r, r * 0.97, h, 56, 1, true), new T3.MeshStandardMaterial({ color: '#dfeaf2', transparent: true, opacity: 0.16, roughness: 0.1, side: T3.DoubleSide, depthWrite: false }));
    glass.position.set(cx, h / 2, 0); g.add(glass);
    const rim = new T3.Mesh(new T3.TorusGeometry(r, 0.05, 8, 64), s.mat('#b9c7d2', { roughness: 0.3 })); rim.rotation.x = Math.PI / 2; rim.position.set(cx, h, 0); g.add(rim);
    const base = new T3.Mesh(new T3.CylinderGeometry(r * 0.97, r * 0.97, 0.08, 56), new T3.MeshStandardMaterial({ color: '#cfdde8', transparent: true, opacity: 0.5, roughness: 0.2 }));
    base.position.set(cx, 0.04, 0); g.add(base);
    let liq = null;
    if (water) {
      liq = new T3.Mesh(new T3.CylinderGeometry(r * 0.95, r * 0.93, water, 56), new T3.MeshStandardMaterial({ color: tint || '#9fd0ee', transparent: true, opacity: 0.17, roughness: 0.2, depthWrite: false }));
      liq.position.set(cx, water / 2 + 0.08, 0); g.add(liq);
      const top = new T3.Mesh(new T3.CircleGeometry(r * 0.95, 56), new T3.MeshStandardMaterial({ color: tint || '#9fd0ee', transparent: true, opacity: 0.22, side: T3.DoubleSide, depthWrite: false }));
      top.rotation.x = -Math.PI / 2; top.position.set(cx, water + 0.08, 0); g.add(top);
      g.userData.top = top;
    }
    s.scene.add(g);
    g.userData.liq = liq;
    return g;
  }
  function rod(T3, a, b, r, mat) {
    const A = new T3.Vector3(...a), B = new T3.Vector3(...b), d = B.clone().sub(A);
    const m = new T3.Mesh(new T3.CylinderGeometry(r, r, d.length(), 16), mat);
    m.position.copy(A).add(B).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new T3.Vector3(0, 1, 0), d.normalize());
    return m;
  }
  function tag(s, html, cls, at) {
    const st = s.renderer.domElement.parentElement, el = document.createElement('span');
    el.className = 'o3-lab ' + (cls || 'm3-note'); el.innerHTML = html; st.appendChild(el); s.label(el, at);
    return el;
  }
  const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

  // ---------- 1차시: 수용액에 전류가 흐르는 까닭 ----------
  function cond() {
    const N = 3, atoms = [], bonds = [], X = [-5.4, 0, 5.4], R = rng(7);
    const lab0 = { su: 0, h: 0, cl: 0, na: 0, oh: 0 };
    X.forEach((cx, b) => {
      const ions = [];
      if (b === 0) {
        spread(R, 4, cx, 1.35, 0.6, 2.3, 1.15).forEach((p, k) => atoms.push({ el: 'Su', p: K(N, { 0: p, 2: v.add(p, [0.05, 0.05, 0]) }), lab: k === 0 ? '설탕 분자' : null,
          info: K(N, { 0: '<b>설탕 분자</b>: 물에 녹아도 이온으로 나뉘지 않고 분자 그대로 있다', 1: '설탕 분자는 전하가 없어 전원을 켜도 어느 극으로도 끌려가지 않는다' }) }));
      } else {
        const pos = spread(R, 8, cx, 1.4, 0.55, 2.35, 0.85);
        const cat = b === 1 ? 'Hp' : 'Na';
        pos.forEach((p, k) => {
          const isC = k % 2 === 0, toward = isC ? cx - 0.7 : cx + 0.7;
          const mid = [p[0] + (toward - p[0]) * 0.35, p[1], p[2] * 0.9];
          const end = [toward + (isC ? -0.1 : 0.1) * (k % 3), 0.7 + (k >> 1) * 0.42, (k % 4 - 1.5) * 0.35];
          if (isC) {
            const nm = cat === 'Hp' ? 'H<sup>+</sup>' : 'Na<sup>+</sup>';
            atoms.push({ el: cat, lo: [-0.45, 0.62, 0], p: K(N, { 0: p, 1: mid, 2: end }), lab: (cat === 'Hp' ? lab0.h++ : lab0.na++) === 0 ? nm : null,
              info: K(N, { 0: `<b>${cat === 'Hp' ? '수소 이온' : '나트륨 이온'} ${nm}</b>: (+)전하를 띤 양이온`, 1: `양이온 ${nm}은 <b>(−)극</b> 쪽으로 끌려간다` }) });
          } else if (b === 1) {
            atoms.push({ el: 'Cl', p: K(N, { 0: p, 1: mid, 2: end }), lab: lab0.cl++ === 0 ? 'Cl<sup>−</sup>' : null,
              info: K(N, { 0: '<b>염화 이온 Cl<sup>−</sup></b>: (−)전하를 띤 음이온', 1: '음이온 Cl<sup>−</sup>은 <b>(+)극</b> 쪽으로 끌려간다' }) });
          } else {
            const o = atoms.push({ el: 'Oh', p: K(N, { 0: p, 1: mid, 2: end }), lab: lab0.oh++ === 0 ? 'OH<sup>−</sup>' : null, lo: [0.5, 0.85, 0],
              info: K(N, { 0: '<b>수산화 이온 OH<sup>−</sup></b>의 산소: (−)전하를 띤 음이온', 1: '음이온 OH<sup>−</sup>은 <b>(+)극</b> 쪽으로 끌려간다' }) }) - 1;
            const hp = (q) => v.add(q, [0.18, 0.36, 0]);
            const h = atoms.push({ el: 'Hw', p: K(N, { 0: hp(p), 1: hp(mid), 2: hp(end) }), info: '수산화 이온 OH<sup>−</sup> 속 수소' }) - 1;
            bonds.push([o, h, 1]);
          }
          ions.push(p);
        });
      }
      // 물 분자
      const avoid = atoms.filter((a) => Math.abs(a.p[0][0] - cx) < 2.2).map((a) => a.p[0]);
      spread(R, 7, cx, 1.55, 0.45, 2.45, 0.8, avoid).forEach((c) => pushWater(atoms, bonds, N, stat(N, c), stat(N, rdir(R))));
    });
    const bulbs = [];
    return {
      steps: N, atoms, bonds,
      view: { yaw: 0.0, pitch: 0.3, dist: 16.5, target: [0, 2.6, 0] }, orbit: { min: 6, max: 34 },
      jitter: () => 0.03,
      build(s, T3) {
        const wire = s.mat('#3b3f4a', { roughness: 0.5 }), graph = s.mat('#2b2e35', { roughness: 0.8 });
        const names = ['설탕물', '염산', '수산화 나트륨 수용액'];
        X.forEach((cx, b) => {
          beaker(s, T3, cx, 2.0, 3.6, 2.9);
          // 전극 둘(왼쪽 (−), 오른쪽 (+))
          [[-1, '(−)극'], [1, '(+)극']].forEach(([sg, nm]) => {
            s.scene.add(rod(T3, [cx + sg * 1.0, 0.45, 0], [cx + sg * 1.0, 4.4, 0], 0.11, graph));
            tag(s, nm, 'm3-pole ' + (sg < 0 ? 'neg' : 'pos'), new T3.Vector3(cx + sg * 1.25, 3.55, 0.3));
          });
          // 전선과 전지·전구
          const top = 5.4;
          s.scene.add(rod(T3, [cx - 1, 4.4, 0], [cx - 1, top, 0], 0.045, wire), rod(T3, [cx + 1, 4.4, 0], [cx + 1, top, 0], 0.045, wire));
          s.scene.add(rod(T3, [cx - 1, top, 0], [cx - 0.75, top, 0], 0.045, wire), rod(T3, [cx - 0.05, top, 0], [cx + 0.2, top, 0], 0.045, wire), rod(T3, [cx + 0.75, top, 0], [cx + 1, top, 0], 0.045, wire));
          const bat = new T3.Mesh(new T3.BoxGeometry(0.7, 0.36, 0.36), s.mat('#3a6fb0', { roughness: 0.5 })); bat.position.set(cx - 0.4, top, 0); s.scene.add(bat);
          const cap = new T3.Mesh(new T3.BoxGeometry(0.12, 0.2, 0.2), s.mat('#c9ced6', { metalness: 0.5, roughness: 0.3 })); cap.position.set(cx - 0.0, top, 0); s.scene.add(cap);
          const glass = new T3.Mesh(new T3.SphereGeometry(0.34, 24, 16), new T3.MeshStandardMaterial({ color: '#f4f1e0', transparent: true, opacity: 0.75, emissive: new T3.Color('#ffd23f'), emissiveIntensity: 0, roughness: 0.2 }));
          glass.position.set(cx + 0.48, top + 0.42, 0); s.scene.add(glass);
          const sock = new T3.Mesh(new T3.CylinderGeometry(0.18, 0.18, 0.26, 16), s.mat('#a3a9b3', { metalness: 0.5, roughness: 0.35 })); sock.position.set(cx + 0.48, top + 0.08, 0); s.scene.add(sock);
          const light = new T3.PointLight('#ffd23f', 0, 6); light.position.copy(glass.position); s.scene.add(light);
          bulbs.push({ glass, light, on: b > 0 });
          tag(s, names[b], 'm3-name', new T3.Vector3(cx, -0.55, 1.9));
        });
        return (t, time) => {
          const p = clamp((t - 0.5) / 0.5, 0, 1);
          bulbs.forEach((bb) => { const k = bb.on ? p * (0.92 + 0.08 * Math.sin(time * 9)) : 0; bb.glass.material.emissiveIntensity = 1.6 * k; bb.light.intensity = 9 * k; });
        };
      },
    };
  }

  // ---------- 2차시: 물에 녹으면 이온으로 나뉜다 ----------
  function ionize() {
    const N = 4, atoms = [], bonds = [], R = rng(11), XL = -3.3, XR = 3.3;
    const usedW = [];
    // 왼쪽: 염화 수소 분자 셋(기체) → 물속 → H⁺ + Cl⁻ → 물 분자가 둘러쌈(H⁺은 물 분자에 붙어 H₃O⁺)
    const hcl = [[XL - 0.9, 5.0, -0.5], [XL + 0.5, 5.5, 0.4], [XL + 1.2, 4.7, -0.2]];
    const clIn = [[XL - 0.85, 1.7, -0.45], [XL + 0.55, 2.1, 0.55], [XL + 0.4, 0.9, -0.6]];
    const hIn = [[XL - 0.85, 1.7 + 0.62, -0.45], [XL + 0.55, 2.1 + 0.62, 0.55], [XL + 0.4, 0.9 + 0.62, -0.6]];
    const clSep = [[XL - 1.05, 1.5, -0.35], [XL + 0.95, 2.05, 0.5], [XL + 0.15, 0.85, -0.85]];
    const hSep = [[XL - 0.2, 2.5, 0.4], [XL - 0.2, 1.2, 0.95], [XL + 1.2, 1.2, -0.6]];
    hcl.forEach((g, k) => {
      const c = atoms.push({ el: 'Cl', p: K(N, { 0: g, 1: clIn[k], 2: clSep[k] }), lab: k === 0 ? K(N, { 0: 'HCl', 2: 'Cl<sup>−</sup>' }) : null, lo: [0, 0.95, 0],
        info: K(N, { 0: '<b>염화 수소 HCl</b> 분자의 염소: 기체로 떠 있다', 1: '물에 녹아 들어간 HCl 분자', 2: '<b>염화 이온 Cl<sup>−</sup></b>: 수소 이온을 내놓고 남은 음이온', 3: '물 분자가 수소 쪽을 돌려 Cl<sup>−</sup>을 둘러싼다' }) }) - 1;
      const hOff = (p) => v.add(p, [0, 0.62, 0]);
      const h = atoms.push({ el: 'Hp', p: K(N, { 0: hOff(g), 1: hIn[k], 2: hSep[k], 3: v.add(hSep[k], [0, 0, 0]) }), lab: k === 0 ? K(N, { 0: null, 2: 'H<sup>+</sup>', 3: 'H<sub>3</sub>O<sup>+</sup>' }) : null, lo: [0, 0.62, 0],
        info: K(N, { 0: 'HCl 분자 속 수소 원자', 1: 'HCl 분자 속 수소 원자', 2: '<b>수소 이온 H<sup>+</sup></b>: 염산을 산성으로 만드는 이온', 3: 'H<sup>+</sup>은 물 분자에 붙어 <b>H<sub>3</sub>O<sup>+</sup></b>로 있다. 교과서처럼 간단히 H<sup>+</sup>로 쓴다' }) }) - 1;
      bonds.push([c, h, K(N, { 0: 1, 2: 0 })]);
      // H⁺을 받는 물 분자(마지막 단계에 H⁺ 옆으로 와서 산소가 H⁺을 향한다)
      const w0 = spot(R, XL, 1.5, 0.5, 2.6), d0 = rdir(R), wEnd = v.add(hSep[k], [0.32, -0.25, 0]);
      pushWater(atoms, bonds, N, K(N, { 0: w0, 2: w0, 3: wEnd }), K(N, { 0: d0, 2: d0, 3: v.unit(v.sub(wEnd, hSep[k])) }), K(N, { 0: '물 분자 H<sub>2</sub>O의 산소', 3: '이 물 분자가 H<sup>+</sup>을 붙잡아 H<sub>3</sub>O<sup>+</sup>가 되었다' }));
      bonds.push([h, atoms.length - 3, K(N, { 0: 0, 3: 1 })]);
      // Cl⁻을 둘러싸는 물 분자 둘(수소 쪽이 Cl⁻을 향함)
      [[0.95, 0.2, 0.3], [-0.6, -0.5, -0.65]].forEach((off) => {
        const w = spot(R, XL, 1.5, 0.5, 2.6), d = rdir(R), e = v.add(clSep[k], off);
        pushWater(atoms, bonds, N, K(N, { 0: w, 2: w, 3: e }), K(N, { 0: d, 2: d, 3: v.unit(v.sub(clSep[k], e)) }), K(N, { 0: '물 분자 H<sub>2</sub>O의 산소', 3: '물 분자의 수소 쪽(+)이 Cl<sup>−</sup>을 향한다' }));
      });
    });
    // 오른쪽: 수산화 나트륨 알갱이(이온 셋 쌍) → 물속 → Na⁺ + OH⁻ → 물 분자가 둘러쌈
    const lump = [[XR - 0.45, 4.9, 0], [XR + 0.45, 4.9, 0], [XR, 4.9, 0.6]];
    const lumpIn = [[XR - 0.45, 1.3, 0], [XR + 0.45, 1.3, 0], [XR, 1.3, 0.6]];
    const naSep = [[XR - 1.0, 1.0, -0.6], [XR + 1.05, 1.7, -0.2], [XR - 0.1, 2.4, 0.9]];
    const ohSep = [[XR + 0.2, 1.0, -0.9], [XR + 0.6, 2.4, 0.7], [XR - 1.0, 2.2, 0.1]];
    lump.forEach((g, k) => {
      const na = atoms.push({ el: 'Na', p: K(N, { 0: g, 1: lumpIn[k], 2: naSep[k] }), lab: k === 0 ? K(N, { 0: 'NaOH', 2: 'Na<sup>+</sup>' }) : null, lo: [0, 0.9, 0],
        info: K(N, { 0: '<b>수산화 나트륨 NaOH</b> 알갱이 속 나트륨', 1: '물에 녹아 들어간 수산화 나트륨', 2: '<b>나트륨 이온 Na<sup>+</sup></b>: 양이온', 3: '물 분자가 산소 쪽(−)을 돌려 Na<sup>+</sup>을 둘러싼다' }) }) - 1;
      const oAt = (p) => v.add(p, [0, -0.62, 0]);
      const og = v.add(g, [0, 0, -0.62]), oin = v.add(lumpIn[k], [0, 0, -0.62]);
      const o = atoms.push({ el: 'Oh', p: K(N, { 0: og, 1: oin, 2: ohSep[k] }), lab: k === 0 ? K(N, { 0: null, 2: 'OH<sup>−</sup>' }) : null, lo: [0, 0.85, 0],
        info: K(N, { 0: '수산화 나트륨 속 수산화 이온의 산소', 1: '수산화 나트륨 속 수산화 이온의 산소', 2: '<b>수산화 이온 OH<sup>−</sup></b>: 수산화 나트륨 수용액을 염기성으로 만드는 이온', 3: '물 분자가 수소 쪽을 돌려 OH<sup>−</sup>을 둘러싼다' }) }) - 1;
      const hh = (p) => v.add(p, [0.2, 0.34, -0.1]);
      const h = atoms.push({ el: 'Hw', p: K(N, { 0: hh(og), 1: hh(oin), 2: hh(ohSep[k]) }), info: '수산화 이온 OH<sup>−</sup> 속 수소' }) - 1;
      bonds.push([na, o, K(N, { 0: 1, 2: 0 })], [o, h, 1]);
      void oAt;
      // Na⁺ 둘레 물 분자 둘(산소가 Na⁺을 향함), OH⁻ 둘레 하나
      [[0.85, 0.3, 0.2], [-0.4, -0.2, 0.75]].forEach((off) => {
        const w = spot(R, XR, 1.5, 0.5, 2.6), d = rdir(R), e = v.add(naSep[k], off);
        pushWater(atoms, bonds, N, K(N, { 0: w, 2: w, 3: e }), K(N, { 0: d, 2: d, 3: v.unit(v.sub(e, naSep[k])) }), K(N, { 0: '물 분자 H<sub>2</sub>O의 산소', 3: '물 분자의 산소 쪽(−)이 Na<sup>+</sup>을 향한다' }));
      });
      const w = spot(R, XR, 1.5, 0.5, 2.6), d = rdir(R), e = v.add(ohSep[k], [-0.4, 0.15, 0.75]);
      pushWater(atoms, bonds, N, K(N, { 0: w, 2: w, 3: e }), K(N, { 0: d, 2: d, 3: v.unit(v.sub(ohSep[k], e)) }));
    });
    void usedW;
    return {
      steps: N, atoms, bonds,
      view: { yaw: 0.0, pitch: 0.28, dist: 13.6, target: [0, 2.2, 0] }, orbit: { min: 5, max: 30 },
      jitter: (t) => 0.025 + 0.02 * clamp(t - 1, 0, 1),
      build(s, T3) {
        beaker(s, T3, XL, 2.05, 3.7, 3.0);
        beaker(s, T3, XR, 2.05, 3.7, 3.0);
        tag(s, '염화 수소 → 염산', 'm3-name', new T3.Vector3(XL, -0.55, 2));
        tag(s, '수산화 나트륨 → 수용액', 'm3-name', new T3.Vector3(XR, -0.55, 2));
        return null;
      },
    };
  }

  // ---------- 2차시: 리트머스 종이 위에서 이온은 어느 극으로 ----------
  function migrate() {
    const N = 4, atoms = [], bonds = [], Z = [-1.5, 1.5], L = 5.2; // 종이 길이 반(왼쪽 (−)극, 오른쪽 (+)극)
    const R = rng(23);
    const row = (z, kind) => {
      const acid = kind === 'a';
      // 거름종이 위 이온(가운데): 산 → H⁺·Cl⁻, 염기 → Na⁺·OH⁻
      [-0.25, 0.25].forEach((dz, k) => {
        const zz = z + dz;
        if (acid) {
          atoms.push({ el: 'Hp', p: K(N, { 0: [-0.12, 0.42, zz], 1: [-0.6, 0.32, zz], 2: [-1.7 - k * 0.6, 0.32, zz], 3: [-3.0 - k * 0.7, 0.32, zz] }),
            lab: k === 0 ? 'H<sup>+</sup>' : null, info: K(N, { 0: '염산 속 <b>수소 이온 H<sup>+</sup></b>(양이온)', 1: '양이온이라 <b>(−)극</b> 쪽으로 움직인다', 2: 'H<sup>+</sup>이 지나간 자리의 푸른 리트머스가 <b>붉게</b> 바뀐다' }) });
          atoms.push({ el: 'Cl', p: K(N, { 0: [0.15, 0.48, zz], 1: [0.6, 0.48, zz], 2: [1.5 + k * 0.5, 0.48, zz], 3: [2.6 + k * 0.6, 0.48, zz] }),
            lab: k === 0 ? 'Cl<sup>−</sup>' : null, info: K(N, { 0: '염산 속 <b>염화 이온 Cl<sup>−</sup></b>(음이온)', 1: '음이온이라 (+)극 쪽으로 움직인다', 2: 'Cl<sup>−</sup>이 지나간 자리는 색이 바뀌지 않는다 → 산성의 원인이 아니다' }) });
        } else {
          atoms.push({ el: 'Na', p: K(N, { 0: [-0.15, 0.46, zz], 1: [-0.6, 0.46, zz], 2: [-1.5 - k * 0.5, 0.46, zz], 3: [-2.6 - k * 0.6, 0.46, zz] }),
            lab: k === 0 ? 'Na<sup>+</sup>' : null, info: K(N, { 0: '수산화 나트륨 수용액 속 <b>나트륨 이온 Na<sup>+</sup></b>(양이온)', 1: '양이온이라 (−)극 쪽으로 움직인다', 2: 'Na<sup>+</sup>이 지나간 자리는 색이 바뀌지 않는다' }) });
          const op = (x) => [x, 0.42, zz];
          const o = atoms.push({ el: 'Oh', p: K(N, { 0: op(0.15), 1: op(0.6), 2: op(1.7 + k * 0.6), 3: op(3.0 + k * 0.7) }), lab: k === 0 ? 'OH<sup>−</sup>' : null, lo: [0, 0.8, 0],
            info: K(N, { 0: '<b>수산화 이온 OH<sup>−</sup></b>(음이온)의 산소', 1: '음이온이라 <b>(+)극</b> 쪽으로 움직인다', 2: 'OH<sup>−</sup>이 지나간 자리의 붉은 리트머스가 <b>푸르게</b> 바뀐다' }) }) - 1;
          const hp = (x) => [x + 0.2, 0.72, zz - 0.1];
          const h = atoms.push({ el: 'Hw', p: K(N, { 0: hp(0.15), 1: hp(0.6), 2: hp(1.7 + k * 0.6), 3: hp(3.0 + k * 0.7) }), info: '수산화 이온 속 수소' }) - 1;
          bonds.push([o, h, 1]);
        }
      });
      // 질산 칼륨 이온(종이 전체에 고루): K⁺ → (−)극, NO₃⁻ → (+)극, 색은 바꾸지 않음
      for (let k = 0; k < 5; k++) {
        const x = -4.4 + k * 2.1 + (R() - 0.5) * 0.5, dz = (R() - 0.5) * 0.7;
        if (Math.abs(x) < 0.7) continue;
        const kx = (s) => clamp(x - s, -L + 0.4, L - 0.4);
        atoms.push({ el: 'K', p: K(N, { 0: [x, 0.47, z + dz], 1: [kx(0.4), 0.47, z + dz], 2: [kx(1.2), 0.47, z + dz], 3: [kx(2.0), 0.47, z + dz] }), lab: k === 0 && acid ? 'K<sup>+</sup>' : null,
          info: '질산 칼륨의 <b>칼륨 이온 K<sup>+</sup></b>: (−)극으로 가지만 색을 바꾸지 않는다. 종이에 전류가 흐르게 돕는다' });
        const nx = x + 0.5, nxx = (s) => clamp(nx + s, -L + 0.4, L - 0.4);
        atoms.push({ el: 'N3', p: K(N, { 0: [nx, 0.47, z - dz], 1: [nxx(0.4), 0.47, z - dz], 2: [nxx(1.2), 0.47, z - dz], 3: [nxx(2.0), 0.47, z - dz] }), lab: k === 1 && acid ? 'NO<sub>3</sub><sup>−</sup>' : null,
          info: '질산 칼륨의 <b>질산 이온 NO<sub>3</sub><sup>−</sup></b>: (+)극으로 가지만 색을 바꾸지 않는다' });
      }
    };
    row(Z[0], 'a'); row(Z[1], 'b');
    let api;
    return {
      steps: N, atoms, bonds,
      view: { yaw: 0.0, pitch: 0.72, dist: 15, target: [0, 0, -0.4] }, orbit: { min: 5, max: 28, pmin: 0.15 },
      jitter: () => 0.02,
      build(s, T3, a) {
        api = a;
        const plate = new T3.Mesh(new T3.BoxGeometry(2 * L + 1.4, 0.16, 5.6), new T3.MeshStandardMaterial({ color: '#dceaf1', transparent: true, opacity: 0.55, roughness: 0.1 }));
        plate.position.set(0, 0.0, 0); s.scene.add(plate);
        const strips = Z.map((z, r) => {
          const segs = [];
          for (let i = 0; i < 52; i++) {
            const w = (2 * L) / 52, x = -L + w * (i + 0.5);
            const m = new T3.Mesh(new T3.BoxGeometry(w * 1.02, 0.05, 1.2), s.mat(r === 0 ? '#5c86cf' : '#d95560', { roughness: 0.9 }));
            m.position.set(x, 0.11, z); s.scene.add(m); segs.push({ m, x });
          }
          // 가운데 거름종이 조각
          const fp = new T3.Mesh(new T3.BoxGeometry(0.62, 0.06, 0.95), s.mat('#f6f1e2', { roughness: 0.95 })); fp.position.set(0, 0.17, z); s.scene.add(fp);
          return { segs, fp, base: new T3.Color(r === 0 ? '#5c86cf' : '#d95560'), to: new T3.Color(r === 0 ? '#d95560' : '#5c86cf'), dir: r === 0 ? -1 : 1 };
        });
        // 집게 전극(왼쪽 (−), 오른쪽 (+))과 전원 장치까지 전선
        const metal = s.mat('#9aa2ad', { metalness: 0.6, roughness: 0.3 }), wire = s.mat('#3b3f4a');
        [[-1, '#2a63c9', '(−)극'], [1, '#d9483b', '(+)극']].forEach(([sg, col, nm]) => {
          const clip = new T3.Mesh(new T3.BoxGeometry(0.55, 0.3, 4.4), metal); clip.position.set(sg * (L + 0.1), 0.3, 0); s.scene.add(clip);
          const cw = new T3.Mesh(new T3.BoxGeometry(0.3, 0.12, 4.0), s.mat(col)); cw.position.set(sg * (L + 0.1), 0.5, 0); s.scene.add(cw);
          s.scene.add(rod(T3, [sg * (L + 0.1), 0.5, -2.2], [sg * (L + 0.6), 0.5, -3.4], 0.06, wire));
          tag(s, nm, 'm3-pole ' + (sg < 0 ? 'neg' : 'pos'), new T3.Vector3(sg * (L + 0.1), 0.9, 2.6));
        });
        const box = new T3.Mesh(new T3.BoxGeometry(3.4, 1.2, 1.4), s.mat('#e7e2d6', { roughness: 0.7 })); box.position.set(0, 0.6, -4.3); s.scene.add(box);
        s.scene.add(rod(T3, [-(L + 0.6), 0.5, -3.4], [-1.7, 0.5, -4.3], 0.06, wire), rod(T3, [L + 0.6, 0.5, -3.4], [1.7, 0.5, -4.3], 0.06, wire));
        tag(s, '전원 장치', 'm3-small', new T3.Vector3(0, 1.45, -4.3));
        tag(s, '푸른색 리트머스 + 염산', 'm3-name', new T3.Vector3(0, 0.25, Z[0] - 0.95));
        tag(s, '붉은색 리트머스 + 수산화 나트륨 수용액', 'm3-name', new T3.Vector3(0, 0.25, Z[1] + 1.0));
        const ca = new T3.Color();
        return (t) => {
          // 색 띠: 가운데에서 H⁺(OH⁻)이 간 만큼 번진다
          const reach = t < 1 ? 0.3 : t < 2 ? 0.3 + (t - 1) * 1.6 : t < 3 ? 1.9 + (t - 2) * 1.35 : 3.25;
          strips.forEach((st) => st.segs.forEach(({ m, x }) => {
            const dx = x * st.dir, on = dx > -0.35 && dx < reach ? 1 : dx >= reach && dx < reach + 0.4 ? 1 - (dx - reach) / 0.4 : 0;
            m.material.color.copy(ca.copy(st.base).lerp(st.to, clamp(on, 0, 1)));
          }));
          void api;
        };
      },
    };
  }

  // ---------- 4차시: 중화 반응 모형 ----------
  function neut() {
    const N = 5, atoms = [], bonds = [], R = rng(31), cx = 0;
    const hP = [[-1.1, 1.1, -0.5], [0.9, 1.9, 0.6], [-0.3, 2.4, -0.9], [0.6, 0.8, -0.8]];
    const clP = [[-1.3, 2.0, 0.6], [1.3, 1.1, -0.1], [0.1, 1.4, 1.2], [-0.5, 0.6, 0.3]];
    const naIn = [[-0.6, 2.6, 0.9], [1.4, 2.4, -0.7], [-1.5, 1.6, -0.6], [0.4, 2.7, 0.0]];
    const ohIn = [[-0.4, 1.3, -0.45], [1.1, 1.55, 0.55], [-0.6, 2.25, -0.85], [0.75, 1.05, -0.6]];
    const lattice = [[-0.33, 0.45, -0.33], [0.33, 0.45, 0.33], [0.33, 0.45, -0.33], [-0.33, 0.45, 0.33], [-0.33, 1.11, 0.33], [0.33, 1.11, -0.33], [0.33, 1.11, 0.33], [-0.33, 1.11, -0.33]];
    // 4단계: 생긴 물 분자 자리(H⁺과 OH⁻이 만난 곳)
    hP.forEach((p, k) => {
      const meet = ohIn[k];
      const h = atoms.push({ el: 'Hp', p: K(N, { 0: p, 2: v.add(meet, [-0.3, 0.38, 0]), 3: v.add(meet, [-0.34, 0.22, 0.1]), 4: v.add(meet, [-0.34, 4.2, 0.1]) }), show: K(N, { 0: 1, 4: 0 }),
        lab: k === 0 ? K(N, { 0: 'H<sup>+</sup>', 3: null }) : null,
        info: K(N, { 0: '염산 속 <b>수소 이온 H<sup>+</sup></b>', 2: 'H<sup>+</sup>이 OH<sup>−</sup>을 만난다', 3: 'H<sup>+</sup>이 OH<sup>−</sup>과 결합해 <b>물</b>의 수소가 되었다' }) }) - 1;
      const o = atoms.push({ el: 'Oh', col: K(N, { 0: OHC, 3: OWC }), p: K(N, { 0: v.add(naIn[k], [0.1, 2.2, 0]), 1: ohIn[k], 3: ohIn[k], 4: v.add(ohIn[k], [0, 4.2, 0]) }), show: K(N, { 0: 0, 1: 1, 4: 0 }),
        lab: k === 0 ? K(N, { 0: 'OH<sup>−</sup>', 3: 'H<sub>2</sub>O' }) : null, lo: [0, 0.85, 0],
        info: K(N, { 0: '수산화 나트륨 수용액 속 <b>수산화 이온 OH<sup>−</sup></b>', 1: '염산 속으로 들어온 OH<sup>−</sup>', 3: 'OH<sup>−</sup>이 H<sup>+</sup>을 받아 <b>물 H<sub>2</sub>O</b>가 되었다(중화 반응)', 4: '물은 증발해 날아갔다' }) }) - 1;
      const hh = (q) => v.add(q, [0.32, 0.22, 0.12]);
      const h2 = atoms.push({ el: 'Hw', p: K(N, { 0: hh(v.add(naIn[k], [0.1, 2.2, 0])), 1: hh(ohIn[k]), 3: hh(ohIn[k]), 4: hh(v.add(ohIn[k], [0, 4.2, 0])) }), show: K(N, { 0: 0, 1: 1, 4: 0 }), info: '수산화 이온 속 수소' }) - 1;
      bonds.push([o, h2, 1], [o, h, K(N, { 0: 0, 3: 1 })]);
      atoms.push({ el: 'Cl', p: K(N, { 0: clP[k], 3: clP[k], 4: v.add(lattice[k * 2], [cx, 0, 0]) }), lab: k === 0 ? K(N, { 0: 'Cl<sup>−</sup>', 4: null }) : null,
        info: K(N, { 0: '염산 속 <b>염화 이온 Cl<sup>−</sup></b>', 2: 'Cl<sup>−</sup>은 반응하지 않고 그대로 있다', 4: 'Cl<sup>−</sup>이 Na<sup>+</sup>과 번갈아 쌓여 <b>염화 나트륨</b> 결정이 된다' }) });
      atoms.push({ el: 'Na', show: K(N, { 0: 0, 1: 1 }), p: K(N, { 0: v.add(naIn[k], [-0.2, 2.2, 0.1]), 1: naIn[k], 3: naIn[k], 4: v.add(lattice[k * 2 + 1], [cx, 0, 0]) }), lab: k === 0 ? K(N, { 0: 'Na<sup>+</sup>', 4: null }) : null,
        info: K(N, { 0: '수산화 나트륨 수용액 속 <b>나트륨 이온 Na<sup>+</sup></b>', 1: '염산 속으로 들어온 Na<sup>+</sup>', 2: 'Na<sup>+</sup>은 반응하지 않고 그대로 있다', 4: 'Na<sup>+</sup>과 Cl<sup>−</sup>이 결합한 <b>염(염화 나트륨)</b>' }) });
    });
    // 처음부터 있던 물 분자(4단계에서 증발해 날아감)
    const avoid = [...hP, ...clP, ...naIn, ...ohIn];
    spread(R, 8, cx, 1.55, 0.45, 2.7, 0.8, avoid).forEach((c) => {
      const d = rdir(R);
      pushWater(atoms, bonds, N, K(N, { 0: c, 4: v.add(c, [0, 4.4, 0]) }), stat(N, d), K(N, { 0: '처음부터 있던 물 분자', 4: '물은 증발해 날아갔다' }), { show: K(N, { 0: 1, 4: 0 }) });
    });
    let api, glow, heat, liq, top, salt;
    return {
      steps: N, atoms, bonds,
      view: { yaw: 0.4, pitch: 0.34, dist: 13.5, target: [0, 2.4, 0] }, orbit: { min: 4, max: 26 },
      jitter: (t) => 0.025 + 0.035 * clamp(1 - Math.abs(t - 3) / 0.8, 0, 1),
      build(s, T3, a) {
        api = a;
        const b = beaker(s, T3, cx, 2.1, 3.9, 3.1);
        liq = b.userData.liq; top = b.userData.top;
        glow = new T3.PointLight('#ff8a2a', 0, 9); glow.position.set(0, 1.6, 0); s.scene.add(glow);
        heat = tag(s, '열이 난다 = 중화열', 'm3-heat', () => (api.t > 2.6 && api.t < 3.6 ? new T3.Vector3(1.9, 3.6, 0.8) : null));
        tag(s, '수산화 나트륨 수용액을 붓는다 ↓', 'm3-note', () => (api.t > 0.3 && api.t < 1.4 ? new T3.Vector3(0, 5.2, 0) : null));
        salt = tag(s, '염화 나트륨 결정(염)', 'm3-note', () => (api.t > 3.6 ? new T3.Vector3(0, 1.9, 1.1) : null));
        tag(s, '물이 증발한다 ↑', 'm3-note', () => (api.t > 3.4 && api.t < 4.6 ? new T3.Vector3(-1.4, 4.6, 0) : null));
        return (t) => {
          const h = clamp(1 - Math.abs(t - 3) / 0.9, 0, 1);
          glow.intensity = 16 * h;
          const w = clamp(t - 3, 0, 1);
          liq.material.opacity = 0.17 * (1 - w); top.material.opacity = 0.22 * (1 - w);
          liq.material.color.set(h > 0.05 ? '#f6c8a2' : '#9fd0ee');
          void heat; void salt;
        };
      },
    };
  }

  window.ABScenes = { cond, ionize, migrate, neut };
})();
