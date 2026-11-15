/* 1차시 이론 장 «생물요소와 비생물요소»(교과서 73쪽 해 보기의 연못을 3D 디오라마로): 끌어 돌리고, 바퀴·두 손가락으로 확대(orbit3d.js).
   연못 둘레·물 위·물속·바닥에 생물 열 가지(수련·부레옥잠·부들·검정말·오리·개구리·붕어·다슬기·짚신벌레·버섯)와
   비생물 다섯 가지(빛·공기·온도·물·토양)가 있다. 이름표 테두리: 초록 = 생물요소, 파랑 = 비생물요소(그림 아래 범례).
   그림 위 단추(모두 · 생물요소 · 비생물요소)로 한 무리만 밝히고, 물체나 이름표를 누르면 그것이 강조되며 아래 한 줄 풀이가 바뀐다.
   생산자·소비자·분해자 나누기는 다음 장(정의)과 해 보기 장에서 한다 — 여기서는 «살아 있나, 둘레 환경인가»만.
   배치·크기는 이해를 돕기 위한 예. 시험용: root._p3.pick(k) · root._p3.show(무리) */
(function () {
  'use strict';
  const RX = 5.2, RZ = 3.3, R = 9.2;          // 연못 반지름(가로·세로), 받침 반지름
  const inPond = (x, z) => (x / RX) ** 2 + (z / RZ) ** 2;
  const sm = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };
  const ground = (x, z) => { const d = inPond(x, z); return -1.25 * (1 - sm(0.55, 1.05, d)) + 0.12 * Math.sin(x * 1.3) * Math.cos(z * 1.1) * sm(1.05, 1.6, d); };
  const WY = -0.18;                           // 물 높이
  // 이름표: [이름, 무리, 한 줄 풀이, 이름표 자리]
  const IT = {
    lily: ['수련', 'bio', '물 위에 둥근 잎을 띄우고 꽃을 피우는 식물 — 살아 있는 <b>생물요소</b>'],
    hyac: ['부레옥잠', 'bio', '잎자루가 공기주머니처럼 부풀어 물에 떠서 사는 식물 — <b>생물요소</b>'],
    cat: ['부들', 'bio', '물가 얕은 곳에 뿌리를 내리고 길게 자라는 식물 — <b>생물요소</b>'],
    weed: ['검정말', 'bio', '물속에 잠겨 자라는 식물 — 물 밖에서는 잘 안 보여도 <b>생물요소</b>'],
    duck: ['오리', 'bio', '물 위를 떠다니며 먹이를 찾는 새 — <b>생물요소</b>'],
    frog: ['개구리', 'bio', '물과 땅을 오가며 사는 동물 — <b>생물요소</b>'],
    fish: ['붕어', 'bio', '물속을 헤엄치는 물고기 — <b>생물요소</b>'],
    snail: ['다슬기', 'bio', '바닥의 돌에 붙어 기어 다니는 동물 — <b>생물요소</b>'],
    para: ['짚신벌레', 'bio', '현미경으로 봐야 보이는 아주 작은 생물(그림은 크게 키움) — 작아도 <b>생물요소</b>'],
    mush: ['버섯', 'bio', '물가의 썩은 나무 둥치에 돋은 버섯 — <b>생물요소</b>'],
    sun: ['빛', 'abio', '해에서 오는 빛 — 살아 있지 않은 둘레 환경, <b>비생물요소</b>'],
    air: ['공기', 'abio', '연못 위를 채운 공기(바람) — 모양은 없어도 <b>비생물요소</b>'],
    temp: ['온도', 'abio', '물과 공기의 따뜻하고 찬 정도 — 모양이 없는 <b>비생물요소</b>'],
    water: ['물', 'abio', '생물이 사는 터전인 연못물 — <b>비생물요소</b>'],
    soil: ['토양', 'abio', '연못 바닥과 둘레의 흙 — <b>비생물요소</b>'],
  };

  function mount(root) {
    const stage = root.querySelector('.p3-stage'), canvas = stage.querySelector('canvas');
    const btns = [...root.querySelectorAll('.p3-show button')], cap = root.querySelector('.p3-cap');
    const s = window.Orbit.make(stage, canvas, {
      view: { yaw: 0.0, pitch: 0.5, dist: 16.5, target: [0, 0.3, 0.3] }, min: 9, max: 34, pmin: 0.08, pmax: 1.35, fov: 36,
      click: (e) => clickAt(e), onFrame: (dt) => tick(dt),
    });
    window.Orbit.chrome(stage, s);
    if (!s.ok) return { setActive() {} };
    const { T, scene } = s;
    s.renderer.setClearColor(new T.Color('#e4f1f7'), 1);
    const mat = s.mat;
    const parts = {};                // 이름 → { g: 묶음, at: 이름표 자리 }
    const add = (k, g, at) => { scene.add(g); g.traverse((o) => { o.userData.k = k; }); parts[k] = { g, at }; return g; };

    // ---- 땅(디오라마 받침): 풀밭 위 + 흙 단면 옆 ----
    const N = 120, geo = new T.PlaneGeometry(2 * R, 2 * R, N - 1, N - 1); geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position, col = new Float32Array(pos.count * 3), c = new T.Color(), c2 = new T.Color();
    for (let i = 0; i < pos.count; i++) {
      let x = pos.getX(i), z = pos.getZ(i);
      const r = Math.hypot(x, z); if (r > R) { x *= R / r; z *= R / r; pos.setX(i, x); pos.setZ(i, z); }
      const h = ground(x, z); pos.setY(i, h);
      const d = inPond(x, z);
      c.set(d < 0.95 ? '#8a7356' : d < 1.25 ? '#a58f62' : '#79a64e');
      if (d >= 1.25) c.lerp(c2.set('#5e8f3e'), 0.35 + 0.35 * Math.sin(x * 3.1 + z * 2.3) * Math.cos(z * 4.2));
      c.multiplyScalar(0.94 + 0.08 * Math.sin(x * 9 + z * 7));
      col.set([c.r, c.g, c.b], i * 3);
    }
    geo.setAttribute('color', new T.BufferAttribute(col, 3)); geo.computeVertexNormals();
    const land = new T.Mesh(geo, new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.95 }));
    scene.add(land);
    const side = new T.Mesh(new T.CylinderGeometry(R, R, 2.2, 96, 1, true), mat('#7b5b3d', { side: T.DoubleSide })); side.position.y = -1.1; scene.add(side);
    const sideTop = new T.Mesh(new T.CylinderGeometry(R + 0.01, R + 0.01, 0.35, 96, 1, true), mat('#5c8a3c', { side: T.DoubleSide })); sideTop.position.y = -0.12; scene.add(sideTop);
    const bot = new T.Mesh(new T.CircleGeometry(R, 96), mat('#5f4630')); bot.rotation.x = Math.PI / 2; bot.position.y = -2.2; scene.add(bot);
    // 토양: 받침 옆의 흙 층 무늬(돌 알갱이) + 이름표는 앞쪽 흙 단면
    const pebbles = new T.InstancedMesh(new T.DodecahedronGeometry(0.09, 0), mat('#a08060', { flatShading: true }), 70), o3 = new T.Object3D();
    for (let i = 0; i < 70; i++) { const a = (i / 70) * Math.PI * 2 + i * 0.37; o3.position.set(Math.cos(a) * (R + 0.02), -0.5 - ((i * 37) % 15) / 9, Math.sin(a) * (R + 0.02)); o3.rotation.set(i, i * 2, 0); o3.updateMatrix(); pebbles.setMatrixAt(i, o3.matrix); }
    const soilG = new T.Group(); soilG.add(pebbles); add('soil', soilG, new T.Vector3(4.6, ground(4.6, 3.4) + 0.3, 3.4));

    // ---- 물 ----
    const water = new T.Mesh(new T.CircleGeometry(1, 72), new T.MeshStandardMaterial({ color: 0x4f9fcf, transparent: true, opacity: 0.55, roughness: 0.15, metalness: 0.05, depthWrite: false }));
    water.rotation.x = -Math.PI / 2; water.scale.set(RX * 0.99, RZ * 0.99, 1); water.position.y = WY;
    const waterG = new T.Group(); waterG.add(water); add('water', waterG, new T.Vector3(-1.9, WY + 0.05, 2.5));
    water.renderOrder = 2;

    // ---- 식물 ----
    const lilyG = new T.Group();
    [[-3.0, 0.9, 0.62], [-2.3, 1.7, 0.5], [-3.7, 1.7, 0.45], [-1.8, 0.5, 0.42]].forEach(([x, z, r], i) => {
      const pad = new T.Mesh(new T.CircleGeometry(r, 24, 0.35, Math.PI * 2 - 0.5), mat('#3f8f3a', { side: T.DoubleSide }));
      pad.rotation.x = -Math.PI / 2; pad.rotation.z = i * 1.3; pad.position.set(x, WY + 0.03, z); lilyG.add(pad);
    });
    const fl = new T.Group();
    for (let k = 0; k < 8; k++) { const p = new T.Mesh(new T.SphereGeometry(0.16, 10, 8), mat('#f4a6c4')); p.scale.set(0.55, 0.4, 1.3); p.position.set(Math.cos(k * 0.785) * 0.16, 0.08, Math.sin(k * 0.785) * 0.16); p.rotation.y = -k * 0.785; p.rotation.x = 0.5; fl.add(p); }
    const fc = new T.Mesh(new T.SphereGeometry(0.08, 10, 8), mat('#f2c230')); fc.position.set(0, 0.14, 0); fl.add(fc);
    fl.position.set(-2.3, WY + 0.04, 1.7); lilyG.add(fl);
    add('lily', lilyG, new T.Vector3(-2.7, WY + 0.8, 1.1));

    const hyG = new T.Group();
    for (let k = 0; k < 6; k++) { const lf = new T.Mesh(new T.SphereGeometry(0.22, 10, 8), mat('#4e9e3c')); lf.scale.set(0.7, 1.2, 0.35); const a = k * 1.05; lf.position.set(Math.cos(a) * 0.18, 0.28, Math.sin(a) * 0.18); lf.rotation.set(Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5); hyG.add(lf); }
    for (let k = 0; k < 5; k++) { const b = new T.Mesh(new T.SphereGeometry(0.075, 8, 6), mat('#9a6cd0')); b.position.set(Math.cos(k) * 0.05, 0.62 + k * 0.07, Math.sin(k) * 0.05); hyG.add(b); }
    hyG.position.set(2.4, WY, -1.7); add('hyac', hyG, new T.Vector3(2.4, WY + 1.35, -1.7));

    const catG = new T.Group();
    for (let k = 0; k < 9; k++) {
      const x = 4.2 + (k % 3) * 0.3 + Math.sin(k) * 0.12, z = 0.6 + Math.floor(k / 3) * 0.35, h = 1.6 + (k % 4) * 0.25;
      const st = new T.Mesh(new T.CylinderGeometry(0.025, 0.035, h, 5), mat('#7a9a46')); st.position.set(x, ground(x, z) + h / 2, z); st.rotation.z = (k % 3 - 1) * 0.06; catG.add(st);
      if (k % 2 === 0) { const sp = new T.Mesh(new T.CapsuleGeometry(0.07, 0.3, 4, 8), mat('#6b4126')); sp.position.set(x, ground(x, z) + h - 0.1, z); catG.add(sp); }
      const bl = new T.Mesh(new T.CylinderGeometry(0.01, 0.03, h * 0.9, 4), mat('#8fb057')); bl.position.set(x + 0.1, ground(x, z) + h * 0.45, z + 0.05); bl.rotation.z = -0.18; catG.add(bl);
    }
    add('cat', catG, new T.Vector3(4.55, 2.35, 0.95));

    const weedG = new T.Group();
    for (let k = 0; k < 7; k++) {
      const x = -1.9 + k * 0.3, z = -1.6 + Math.sin(k * 1.7) * 0.3, y0 = ground(x, z);
      for (let j = 0; j < 6; j++) { const w = new T.Mesh(new T.ConeGeometry(0.09, 0.22, 5), mat('#2f6b34')); w.position.set(x + Math.sin(j * 0.9 + k) * 0.05, y0 + 0.12 + j * 0.16, z); w.rotation.z = Math.PI + (j % 2 ? 0.5 : -0.5); weedG.add(w); }
    }
    add('weed', weedG, new T.Vector3(-1.5, -0.3, -1.7));

    // ---- 동물 ----
    const duck = new T.Group();
    const db = new T.Mesh(new T.SphereGeometry(0.42, 16, 12), mat('#f6f3ea')); db.scale.set(1.35, 0.75, 0.85); db.position.y = 0.2; duck.add(db);
    const dh = new T.Mesh(new T.SphereGeometry(0.2, 14, 10), mat('#2f7d55')); dh.position.set(0.5, 0.62, 0); duck.add(dh);
    const bill = new T.Mesh(new T.ConeGeometry(0.08, 0.26, 8), mat('#f08a24')); bill.rotation.z = -Math.PI / 2; bill.position.set(0.76, 0.58, 0); duck.add(bill);
    const tail = new T.Mesh(new T.ConeGeometry(0.14, 0.3, 6), mat('#e7e1d2')); tail.rotation.z = Math.PI / 2 + 0.5; tail.position.set(-0.6, 0.34, 0); duck.add(tail);
    duck.position.set(0.4, WY, 0.4); add('duck', duck, () => new T.Vector3(duck.position.x, WY + 1.3, duck.position.z));

    const frog = new T.Group();
    const fb = new T.Mesh(new T.SphereGeometry(0.22, 14, 10), mat('#5aa03c')); fb.scale.set(1.2, 0.7, 1); frog.add(fb);
    [-0.1, 0.1].forEach((z) => { const e = new T.Mesh(new T.SphereGeometry(0.06, 8, 6), mat('#e8f0c0')); e.position.set(0.16, 0.13, z); frog.add(e); });
    [-0.2, 0.2].forEach((z) => { const l = new T.Mesh(new T.CapsuleGeometry(0.05, 0.22, 3, 6), mat('#4b8a31')); l.rotation.x = Math.PI / 2; l.position.set(-0.15, -0.05, z * 1.3); frog.add(l); });
    frog.position.set(-4.9, ground(-4.9, -0.4) + 0.15, -0.4); frog.rotation.y = -0.6; add('frog', frog, new T.Vector3(-4.9, ground(-4.9, -0.4) + 0.95, -0.4));

    const fish = new T.Group();
    const fbd = new T.Mesh(new T.SphereGeometry(0.34, 14, 10), mat('#c99a3e')); fbd.scale.set(1.5, 0.75, 0.45); fish.add(fbd);
    const ft = new T.Mesh(new T.ConeGeometry(0.22, 0.34, 4), mat('#b5852f')); ft.rotation.z = Math.PI / 2; ft.position.x = -0.6; fish.add(ft);
    fish.position.set(1.8, -0.8, 0.8); add('fish', fish, () => new T.Vector3(fish.position.x, -0.3, fish.position.z));

    const snail = new T.Group();
    const sh = new T.Mesh(new T.ConeGeometry(0.13, 0.45, 10), mat('#5a4a3a')); sh.rotation.z = Math.PI / 2 - 0.25; snail.add(sh);
    const ring = new T.Mesh(new T.TorusGeometry(0.1, 0.02, 6, 12), mat('#8a7458')); ring.rotation.y = Math.PI / 2; ring.position.x = -0.05; snail.add(ring);
    const rock = new T.Mesh(new T.DodecahedronGeometry(0.4, 0), mat('#8c8678', { flatShading: true })); rock.scale.set(1, 0.5, 0.8); rock.position.set(0.1, -0.25, 0); snail.add(rock);
    snail.position.set(3.6, ground(3.6, 0.6) + 0.25, 0.6); add('snail', snail, new T.Vector3(3.7, ground(3.6, 0.6) + 0.95, 0.9));

    const para = new T.Group();
    const lens = new T.Mesh(new T.SphereGeometry(0.42, 18, 14), new T.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.22, roughness: 0.1 }));
    para.add(lens);
    const pb = new T.Mesh(new T.SphereGeometry(0.2, 14, 10), mat('#d8c9a8', { transparent: true, opacity: 0.95 })); pb.scale.set(1.6, 0.6, 0.6); para.add(pb);
    para.position.set(-0.6, -0.7, 2.0); add('para', para, new T.Vector3(-0.6, -0.05, 2.45));

    const mushG = new T.Group();
    const log = new T.Mesh(new T.CylinderGeometry(0.32, 0.36, 1.8, 12), mat('#6e4e33')); log.rotation.z = Math.PI / 2; log.rotation.y = 0.5; log.position.y = 0.3; mushG.add(log);
    [[-0.4, 0.62, 0.12, 0.26], [0.0, 0.66, 0.0, 0.32], [0.38, 0.6, -0.15, 0.22]].forEach(([x, y, z, r]) => {
      const st = new T.Mesh(new T.CylinderGeometry(r * 0.28, r * 0.34, r * 1.1, 8), mat('#efe6d2')); st.position.set(x, y, z); mushG.add(st);
      const cap = new T.Mesh(new T.SphereGeometry(r, 14, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat('#b0552f')); cap.position.set(x, y + r * 0.45, z); mushG.add(cap);
    });
    mushG.position.set(-5.9, ground(-5.9, -1.6), -1.6); add('mush', mushG, new T.Vector3(-5.9, 1.95, -1.6));

    // 둘레 나무(꾸밈, 이름표 없음)
    const deco = new T.Group(); scene.add(deco);
    [[-6.6, -4.4], [-3.4, -5.6], [5.8, -4.4], [7.0, -1.6], [2.2, -6.2]].forEach(([x, z], i) => {
      const y = ground(x, z), h = 1.4 + (i % 3) * 0.3;
      const tr = new T.Mesh(new T.CylinderGeometry(0.12, 0.18, h, 7), mat('#6b4a2e')); tr.position.set(x, y + h / 2, z); deco.add(tr);
      const cr = new T.Mesh(new T.IcosahedronGeometry(0.95 + (i % 2) * 0.25, 1), mat('#3f8a3c', { flatShading: true })); cr.position.set(x, y + h + 0.5, z); cr.scale.y = 1.15; deco.add(cr);
    });
    const grassI = new T.InstancedMesh(new T.ConeGeometry(0.05, 0.28, 4), mat('#6f9a3e'), 220), og = new T.Object3D();
    for (let i = 0, n = 0; n < 220 && i < 4000; i++) { const a = i * 2.399, r = 3 + (i * 0.618 % 1) * 6; const x = Math.cos(a) * r, z = Math.sin(a) * r; if (inPond(x, z) < 1.3 || Math.hypot(x, z) > R - 0.3) continue; og.position.set(x, ground(x, z) + 0.12, z); og.rotation.z = (i % 5 - 2) * 0.1; og.updateMatrix(); grassI.setMatrixAt(n++, og.matrix); }
    deco.add(grassI);

    // ---- 비생물: 빛(해) · 공기(바람 줄) · 온도(온도계) ----
    const sunG = new T.Group();
    const sunB = new T.Mesh(new T.SphereGeometry(0.62, 20, 14), new T.MeshBasicMaterial({ color: 0xf6c33b })); sunG.add(sunB);
    for (let k = 0; k < 10; k++) { const r = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 0.45, 5), new T.MeshBasicMaterial({ color: 0xf2b632 })); const a = k * Math.PI / 5; r.position.set(Math.cos(a) * 0.98, Math.sin(a) * 0.98, 0); r.rotation.z = a - Math.PI / 2; sunG.add(r); }
    sunG.position.set(4.8, 3.9, -3.6); add('sun', sunG, new T.Vector3(3.5, 3.5, -3.6));

    const airG = new T.Group();
    const airMat = new T.MeshBasicMaterial({ color: 0x8fb8d8, transparent: true, opacity: 0.85 });
    [0, 0.55, 1.1].forEach((dy, i) => {
      const curve = new T.CatmullRomCurve3([new T.Vector3(-1.4, dy, 0), new T.Vector3(-0.5, dy + 0.18, 0), new T.Vector3(0.4, dy - 0.1, 0), new T.Vector3(1.2 - i * 0.2, dy + 0.12, 0), new T.Vector3(1.5 - i * 0.2, dy + 0.4, 0)]);
      airG.add(new T.Mesh(new T.TubeGeometry(curve, 30, 0.04, 6, false), airMat));
    });
    airG.position.set(-2.6, 2.3, -3.0); add('air', airG, new T.Vector3(-2.6, 3.75, -3.0));

    const tempG = new T.Group();
    const tube = new T.Mesh(new T.CylinderGeometry(0.1, 0.1, 1.5, 12), new T.MeshStandardMaterial({ color: 0xffffff, transparent: true, opacity: 0.75 })); tube.position.y = 0.9; tempG.add(tube);
    const red = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 0.85, 8), mat('#d9483b')); red.position.y = 0.58; tempG.add(red);
    const bulb = new T.Mesh(new T.SphereGeometry(0.16, 12, 10), mat('#d9483b')); bulb.position.y = 0.16; tempG.add(bulb);
    const stake = new T.Mesh(new T.BoxGeometry(0.36, 1.8, 0.06), mat('#d8c7a4')); stake.position.set(0, 0.95, -0.08); tempG.add(stake);
    tempG.position.set(6.4, ground(6.4, 2.6), 2.6); add('temp', tempG, new T.Vector3(6.4, 2.45, 2.6));

    // ---- 이름표 ----
    const labs = {};
    Object.entries(IT).forEach(([k, [nm, grp]]) => {
      const el = document.createElement('button'); el.type = 'button'; el.className = `o3-lab p3-lab ${grp}`; el.dataset.k = k; el.textContent = nm;
      el.addEventListener('click', () => pick(k)); stage.appendChild(el);
      const at = parts[k].at; s.label(el, typeof at === 'function' ? at : () => at); labs[k] = el;
    });
    const meshes = Object.values(parts).map((p) => p.g);

    let filt = 'all', sel = null;
    const fade = (g, on) => g.traverse((o) => { if (o.material && !o.isInstancedMesh) { if (o.userData.op == null) { o.userData.op = o.material.opacity; o.userData.tr = o.material.transparent; } o.material.transparent = on ? o.userData.tr : true; o.material.opacity = on ? o.userData.op : Math.min(o.userData.op, 0.22); } });
    function paint() {
      Object.entries(IT).forEach(([k, [, grp]]) => {
        const on = filt === 'all' || filt === grp;
        labs[k].classList.toggle('dim', !on); labs[k].classList.toggle('o3-pick', k === sel);
        if (k !== 'water' && k !== 'soil') fade(parts[k].g, on);
      });
      water.material.opacity = filt === 'bio' ? 0.3 : 0.55;
      btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === filt)));
      if (!s.active) s.render();
    }
    function pick(k) {
      sel = k; const [nm, grp, d] = IT[k];
      cap.innerHTML = `<span class="chip ${grp === 'bio' ? 'p3-bio' : 'p3-abio'}">${grp === 'bio' ? '생물요소' : '비생물요소'}</span><b class="p3-nm">${nm}</b><span class="p3-d">${d}</span>`;
      if (filt !== 'all' && filt !== grp) filt = 'all';
      paint();
      root.dispatchEvent(new CustomEvent('p3-pick', { detail: k }));
    }
    function show(f) { filt = f; sel = null; cap.innerHTML = f === 'bio' ? '<span class="chip p3-bio">생물요소</span><span class="p3-d">연못에 사는 <b>모든 생물</b> — 물 위, 물속, 바닥, 물가까지 열 가지</span>'
      : f === 'abio' ? '<span class="chip p3-abio">비생물요소</span><span class="p3-d">생물을 둘러싼 <b>환경</b> — 빛·공기·온도·물·토양 다섯 가지</span>'
        : '<span class="p3-d">물체나 이름표를 눌러 보자. 살아 있는 것일까, 둘레 환경일까?</span>'; paint(); }
    btns.forEach((b) => b.addEventListener('click', () => show(b.dataset.k)));
    function clickAt(e) { const hit = s.pick(e, meshes); if (hit && hit.object.userData.k) pick(hit.object.userData.k); }
    let t = 0;
    function tick(dt) {
      t += dt;
      fish.position.x = 1.2 + Math.sin(t * 0.5) * 0.7; fish.position.z = 0.8 + Math.sin(t * 0.9) * 0.25; fish.rotation.y = Math.cos(t * 0.5) > 0 ? 0 : Math.PI;
      duck.position.x = 0.9 + Math.sin(t * 0.25) * 0.25; duck.position.y = WY + Math.sin(t * 2) * 0.02;
      airG.position.x = -2.6 + Math.sin(t * 0.8) * 0.15;
      para.rotation.y = t * 0.6; sunG.rotation.z = t * 0.1;
    }
    show('all');
    root._p3 = { pick, show, s, labs };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.EcoPond3D = { mount };
})();
