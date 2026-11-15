/* 1차시 설명 장 «생태계다양성»(교과서 27쪽 그림 Ⅰ-17): 한 섬 안에 숲·초원·사막·갯벌·호수와 습지·강·바다가 붙어 있는 3D 섬.
   끌어 돌리고(궤도), 바퀴·두 손가락으로 확대, 오른쪽 끌기·두 손가락으로 옮긴다(orbit3d.js). 땅을 누르거나 위의 단추를 고르면
   그 생태계가 밝아지고(나머지는 흐려짐) 카메라가 다가가며, 오른쪽 카드에 환경·사는 생물·실제 사진이 나온다.
   섬의 배치와 생물 예는 이해를 돕기 위한 예. 시험용: root._eco.pick(k) · root._eco.zoneAt(x, z) */
(function () {
  'use strict';
  const N = 150, SIZE = 26, R = 12.4;
  const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const ZONES = {
    forest: { c: '#3f7f3c', at: [-3.4, 1.6, -3.0], look: { yaw: 0.2, pitch: 0.62, dist: 15 } },
    grass: { c: '#a9c463', at: [-0.6, 0.45, 2.2], look: { yaw: 0.0, pitch: 0.7, dist: 15 } },
    desert: { c: '#e2c98a', at: [5.6, 0.55, 1.4], look: { yaw: 0.9, pitch: 0.7, dist: 15 } },
    flat: { c: '#8f7d64', at: [2.4, 0.12, 7.6], look: { yaw: 0.25, pitch: 0.75, dist: 14 } },
    wet: { c: '#6d9a5f', at: [4.4, 0.25, -4.2], look: { yaw: 0.55, pitch: 0.75, dist: 14 } },
    river: { c: '#5b97c9', at: [-1.6, 0.2, 3.6], look: { yaw: -0.3, pitch: 0.8, dist: 15 } },
    sea: { c: '#2f6fa8', at: [-8.6, 0.1, 6.6], look: { yaw: -0.6, pitch: 0.55, dist: 18 } },
  };
  // 강 물길: 산에서 남쪽 바다로
  const RIVER = [[-2.8, -1.2], [-2.0, 0.6], [-1.3, 2.4], [-1.9, 4.2], [-1.2, 6.0], [-0.6, 8.6], [-0.4, 10.5]];
  function riverD(x, z) {
    let best = 99;
    for (let i = 0; i < RIVER.length - 1; i++) {
      const [ax, az] = RIVER[i], [bx, bz] = RIVER[i + 1], dx = bx - ax, dz = bz - az;
      const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / (dx * dx + dz * dz)));
      best = Math.min(best, Math.hypot(x - ax - t * dx, z - az - t * dz));
    }
    return best;
  }
  const shoreR = (x, z) => { const a = Math.atan2(z, x); return 8.9 + 0.7 * Math.sin(3 * a + 0.4) + 0.45 * Math.cos(5 * a + 1.2) + 0.25 * Math.sin(9 * a); };
  function height(x, z) {
    const r = Math.hypot(x, z);
    if (r > R) return -2.6;
    const s = shoreR(x, z), land = 1 - sm(s - 1.2, s + 0.6, r);
    let h = -1.3 + 1.6 * land;                                    // 바다 바닥 -1.3, 땅 0.3
    const dm = Math.hypot(x + 3.4, z + 3.0); h += 3.4 * Math.exp(-(dm * dm) / 7.5) * land; // 산
    h += 0.5 * Math.exp(-((x + 5.5) ** 2 + (z + 0.5) ** 2) / 5) * land;
    const dl = Math.hypot(x - 4.2, z + 3.9); h -= 1.15 * Math.exp(-(dl * dl) / 2.6);       // 호수
    if (x > 2.6 && z > -1.5 && z < 5) h += 0.18 * Math.sin(x * 2.3 + z * 0.8) * land + 0.15 * land; // 모래 언덕
    if (z > 5.2 && x > -0.2 && r < s + 0.3) h = h * 0.25 + 0.03 * land;                    // 갯벌: 평평하고 낮다
    const dr = riverD(x, z); if (dr < 0.9 && land > 0.3) h = Math.min(h, h - 0.75 * (1 - dr / 0.9) * (1 - dr / 0.9) - 0.05);
    return h;
  }
  function zoneAt(x, z) {
    const h = height(x, z), r = Math.hypot(x, z), s = shoreR(x, z), dl = Math.hypot(x - 4.2, z + 3.9);
    if (r > s + 0.2 || (h < 0 && r > s - 1.2 && dl > 3)) return riverD(x, z) < 0.9 && z < 9 && r < s ? 'river' : 'sea';
    if (dl < 3.1) return 'wet';
    if (riverD(x, z) < 0.75) return 'river';
    if (z > 5.0 && x > -0.2) return 'flat';
    if (x > 2.6 && z > -1.5 && z < 5.2) return 'desert';
    if (h > 0.9 || (x < -1 && z < 0.5)) return 'forest';
    return 'grass';
  }

  function mount(root) {
    const stage = root.querySelector('.eco-stage'), canvas = stage.querySelector('canvas');
    const btns = [...root.querySelectorAll('.eco-pick button')];
    const card = root.querySelector('.eco-card'), store = root.querySelector('.eco-store');
    let sel = null, colors, base = [];
    const s = window.Orbit.make(stage, canvas, {
      view: { yaw: 0.35, pitch: 0.78, dist: 27, target: [0, 0, 0.8] }, min: 8, max: 42, pmin: 0.12, pmax: 1.35, bounds: 10, fov: 36,
      spin: 0.05, click: (e) => clickAt(e), onFrame: (dt) => tick(dt),
    });
    window.Orbit.chrome(stage, s);
    if (!s.ok) return { setActive() {} };
    const { T, scene } = s;
    s.renderer.setClearColor(new T.Color('#dceef6'), 1);
    // 땅
    const geo = new T.PlaneGeometry(SIZE, SIZE, N - 1, N - 1); geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position; colors = new Float32Array(pos.count * 3);
    const zone = new Array(pos.count), col = new T.Color(), tmp = new T.Color();
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i), z = pos.getZ(i), h = height(x, z); pos.setY(i, h);
      const k = zoneAt(x, z); zone[i] = k;
      col.set(ZONES[k].c);
      if (k === 'forest' && h > 2.7) col.lerp(tmp.set('#8a8f7a'), Math.min(1, (h - 2.7) / 0.8) * 0.6); // 산꼭대기 바위
      if (h < 0 && k !== 'flat') col.lerp(tmp.set('#c9b98f'), 0.5);                                      // 물 밑 바닥
      const n = 0.92 + 0.12 * Math.sin(x * 7.1 + z * 3.3) * Math.cos(z * 5.7 - x * 2.1);
      col.multiplyScalar(n);
      if (Math.hypot(x, z) > R) col.set('#7a634a');
      base.push(col.r, col.g, col.b);
    }
    colors.set(base);
    geo.setAttribute('color', new T.BufferAttribute(colors, 3));
    geo.computeVertexNormals();
    const land = new T.Mesh(geo, new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.92, metalness: 0, flatShading: false }));
    scene.add(land);
    // 받침(디오라마) + 물
    const slab = new T.Mesh(new T.CylinderGeometry(R, R, 2.6, 96, 1, true), s.mat('#7a634a', { side: T.DoubleSide })); slab.position.y = -1.3; scene.add(slab);
    const bottom = new T.Mesh(new T.CircleGeometry(R, 96), s.mat('#6a5540')); bottom.rotation.x = Math.PI / 2; bottom.position.y = -2.6; scene.add(bottom);
    const water = new T.Mesh(new T.CircleGeometry(R - 0.02, 96), new T.MeshStandardMaterial({ color: 0x3f86c4, transparent: true, opacity: 0.7, roughness: 0.25, metalness: 0.05 }));
    water.rotation.x = -Math.PI / 2; water.position.y = 0.0; scene.add(water);
    const waterSide = new T.Mesh(new T.CylinderGeometry(R + 0.01, R + 0.01, 1.3, 96, 1, true), new T.MeshStandardMaterial({ color: 0x3a7fbd, transparent: true, opacity: 0.55, side: T.DoubleSide }));
    waterSide.position.y = -0.65; scene.add(waterSide);
    // 꾸밈: 생태계마다 알아보게(나무·풀·선인장·갈대·바위)
    const rnd = (() => { let q = 7; return () => { q = (q * 16807) % 2147483647; return q / 2147483647; }; })();
    const deco = new T.Group(); scene.add(deco);
    const spots = (k, n, tries = 4000) => { const out = []; for (let t = 0; t < tries && out.length < n; t++) { const x = (rnd() - 0.5) * SIZE * 0.9, z = (rnd() - 0.5) * SIZE * 0.9; if (zoneAt(x, z) === k && height(x, z) > 0.05 && riverD(x, z) > 0.9) out.push([x, height(x, z), z]); } return out; };
    function inst(geom, mat, pts, f) {
      const m = new T.InstancedMesh(geom, mat, pts.length), o = new T.Object3D();
      pts.forEach((p, i) => { f(o, p, i); o.updateMatrix(); m.setMatrixAt(i, o.matrix); });
      deco.add(m); return m;
    }
    const trees = spots('forest', 230);
    inst(new T.CylinderGeometry(0.05, 0.07, 0.35, 6), s.mat('#6b4a2e'), trees, (o, p) => { o.position.set(p[0], p[1] + 0.17, p[2]); o.scale.setScalar(1); });
    inst(new T.ConeGeometry(0.26, 0.75, 8), s.mat('#2f6b34'), trees.filter((_, i) => i % 2 === 0), (o, p, i) => { o.position.set(p[0], p[1] + 0.62, p[2]); o.scale.setScalar(0.8 + ((i * 37) % 10) / 22); });
    inst(new T.IcosahedronGeometry(0.3, 0), s.mat('#4a8a3c', { flatShading: true }), trees.filter((_, i) => i % 2 === 1), (o, p, i) => { o.position.set(p[0], p[1] + 0.5, p[2]); o.scale.set(1, 1.15, 1).multiplyScalar(0.85 + ((i * 53) % 10) / 25); });
    const tufts = spots('grass', 160);
    inst(new T.ConeGeometry(0.06, 0.22, 5), s.mat('#7fa042'), tufts, (o, p, i) => { o.position.set(p[0], p[1] + 0.1, p[2]); o.rotation.z = ((i % 5) - 2) * 0.12; });
    const flowers = spots('grass', 40);
    inst(new T.SphereGeometry(0.06, 6, 5), s.mat('#f2d64b'), flowers, (o, p) => { o.position.set(p[0], p[1] + 0.12, p[2]); });
    const cacti = spots('desert', 16);
    inst(new T.CapsuleGeometry(0.08, 0.38, 4, 8), s.mat('#5d8f4a'), cacti, (o, p) => { o.position.set(p[0], p[1] + 0.27, p[2]); });
    inst(new T.CapsuleGeometry(0.05, 0.16, 4, 6), s.mat('#5d8f4a'), cacti, (o, p) => { o.position.set(p[0] + 0.12, p[1] + 0.32, p[2]); o.rotation.z = -0.5; });
    const reeds = spots('wet', 160).filter((p) => p[1] < 0.9);
    inst(new T.CylinderGeometry(0.012, 0.02, 0.42, 4), s.mat('#8a9a4a'), reeds, (o, p, i) => { o.position.set(p[0], p[1] + 0.2, p[2]); o.rotation.set(((i % 7) - 3) * 0.06, 0, ((i % 5) - 2) * 0.08); });
    inst(new T.CapsuleGeometry(0.025, 0.08, 3, 5), s.mat('#7a5232'), reeds.filter((_, i) => i % 3 === 0), (o, p) => { o.position.set(p[0], p[1] + 0.42, p[2]); });
    const holes = spots('flat', 60);
    inst(new T.CircleGeometry(0.05, 8), new T.MeshBasicMaterial({ color: 0x4e4234 }), holes, (o, p) => { o.position.set(p[0], p[1] + 0.012, p[2]); o.rotation.x = -Math.PI / 2; });
    const rocks = [];
    for (let i = 0; i < 26; i++) { const a = rnd() * Math.PI * 2, rr = shoreR(Math.cos(a), Math.sin(a)) - 0.1; const x = Math.cos(a) * rr, z = Math.sin(a) * rr; if (zoneAt(x, z) !== 'flat' && riverD(x, z) > 1.2) rocks.push([x, Math.max(0, height(x, z)), z]); }
    inst(new T.DodecahedronGeometry(0.22, 0), s.mat('#8f8a80', { flatShading: true }), rocks, (o, p, i) => { o.position.set(p[0], p[1] + 0.05, p[2]); o.rotation.set(i, i * 2, 0); o.scale.set(1, 0.6, 1); });
    // 바다의 작은 배와 해초(바다를 알아보게)
    const boat = new T.Group();
    const hull = new T.Mesh(new T.BoxGeometry(0.9, 0.22, 0.34), s.mat('#f4efe2')); hull.position.y = 0.1; boat.add(hull);
    const cab = new T.Mesh(new T.BoxGeometry(0.3, 0.22, 0.26), s.mat('#d8574a')); cab.position.set(-0.1, 0.3, 0); boat.add(cab);
    boat.position.set(-9.2, 0, 3.5); boat.rotation.y = 0.6; scene.add(boat);

    // 이름표
    const labs = {};
    Object.entries(ZONES).forEach(([k, z]) => {
      const el = document.createElement('span'); el.className = 'o3-lab eco-lab'; el.dataset.k = k;
      el.textContent = btns.find((b) => b.dataset.k === k).dataset.name; stage.appendChild(el);
      s.label(el, new T.Vector3(z.at[0], z.at[1] + 0.9, z.at[2])); labs[k] = el;
    });

    function paint() {
      for (let i = 0; i < zone.length; i++) {
        let r = base[i * 3], g = base[i * 3 + 1], b = base[i * 3 + 2];
        if (sel && zone[i] !== sel) { const m = (r + g + b) / 3; r = r * 0.45 + m * 0.4 + 0.08; g = g * 0.45 + m * 0.4 + 0.08; b = b * 0.45 + m * 0.4 + 0.08; }
        else if (sel) { r = Math.min(1, r * 1.12); g = Math.min(1, g * 1.12); b = Math.min(1, b * 1.12); }
        colors[i * 3] = r; colors[i * 3 + 1] = g; colors[i * 3 + 2] = b;
      }
      geo.attributes.color.needsUpdate = true;
      water.material.opacity = sel && !['sea', 'river', 'wet'].includes(sel) ? 0.45 : 0.7;
      Object.entries(labs).forEach(([k, el]) => el.classList.toggle('o3-pick', k === sel));
      if (!s.active) s.render();
    }
    function pick(k, fly = true) {
      sel = k;
      btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === k)));
      const b = btns.find((x) => x.dataset.k === k), im = store.querySelector(`img[data-k="${k}"]`);
      card.querySelector('.eco-name').textContent = b.dataset.name;
      card.querySelector('.eco-env').innerHTML = b.dataset.env;
      card.querySelector('.eco-life').innerHTML = b.dataset.life;
      const img = card.querySelector('.eco-img');
      if (im) { img.src = im.src; img.alt = im.alt; card.querySelector('.eco-cr').textContent = '사진: ' + im.dataset.cr; card.classList.remove('noimg'); }
      else card.classList.add('noimg');
      card.classList.remove('empty');
      root.querySelectorAll('.eco-seen').forEach((x) => x.classList.add('on'));
      seen.add(k); root.querySelector('.eco-n').textContent = `${seen.size} / 7`;
      paint();
      if (fly) { const z = ZONES[k]; s.look({ yaw: z.look.yaw, pitch: z.look.pitch, dist: z.look.dist, target: [z.at[0] * 0.8, 0.2, z.at[2] * 0.8] }, 1.1); }
    }
    const seen = new Set();
    function clickAt(e) {
      const hit = s.pick(e, [land, water]);
      if (!hit) return;
      pick(zoneAt(hit.point.x, hit.point.z), false);
    }
    btns.forEach((b) => b.addEventListener('click', () => pick(b.dataset.k)));
    let t = 0;
    function tick(dt) { t += dt; boat.position.y = Math.sin(t * 1.6) * 0.04; boat.rotation.z = Math.sin(t * 1.3) * 0.04; }
    const homeBtn = stage.querySelector('.o3-home');
    homeBtn.addEventListener('click', () => { sel = null; btns.forEach((b) => b.setAttribute('aria-pressed', 'false')); paint(); });
    paint();
    root._eco = { pick: (k) => pick(k), zoneAt, s };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.BdEco = { mount };
})();
