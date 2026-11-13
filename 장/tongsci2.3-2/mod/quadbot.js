/* 표지 3D 네발 로봇(교과서 144쪽 도입, 이해를 돕기 위한 그림): 무너진 공장 마당. 땅을 누르면 깃발이 꽂히고 로봇이 그곳으로 걸어간다.
   머리의 센서(파란 부채꼴)가 앞을 훑어 잔해를 찾으면 그 잔해가 밝아지고 «장애물 → 비켜 간다»를 스스로 판단해 돌아간다.
   걸음은 대각선 두 다리씩 함께 딛는 걸음(속보). 빈 곳을 끌면 둘러보고, 바퀴로 다가간다. */
(function () {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  const AX = 8.4, AZ = 5.2, SC = 1.25;                                     // 걸어 다닐 수 있는 마당 반 너비
  const DEBRIS = [[-3.2, 1.6, 1.0, 'blk'], [0.6, -1.2, 1.2, 'blk'], [3.4, 2.2, 0.8, 'barrel'], [-0.8, 3.6, 0.9, 'pipe'], [5.6, -2.6, 1.0, 'blk'], [-5.8, -2.2, 0.9, 'barrel'], [2.4, -4.6, 0.8, 'blk'], [7.4, 2.8, 0.9, 'pipe']];

  function mount(root) {
    const stage = root.querySelector('.qb-stage'), canvas = stage.querySelector('canvas');
    const say = stage.querySelector('.qb-say'), now = stage.querySelector('.qb-now');
    const s = window.Scene3D.make(stage, canvas, { view: { yaw: 0.5, pitch: 0.56, dist: 19, target: [0.4, 0.4, 0.4] }, fov: 34, min: 11, max: 32, pmax: 1.2, shadows: true, onFrame: step, click: tap });
    if (!s.ok) return { setActive() {}, fit() {} };
    const { T, scene, inked, mat, group } = s;
    scene.add(new T.HemisphereLight(0xffffff, 0xa9a08c, 1.15));
    const sun = new T.DirectionalLight(0xfff1d6, 1.9); sun.position.set(-8, 16, 10); sun.castShadow = true;
    Object.assign(sun.shadow.camera, { left: -16, right: 16, top: 12, bottom: -12, near: 1, far: 60 }); sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0006; scene.add(sun);
    s.renderer.setClearColor(new T.Color('#d9dde2'), 1);
    // 마당과 무너진 공장
    const ground = new T.Mesh(new T.PlaneGeometry(40, 30), mat('#d8d1c3')); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
    const cracks = new T.LineSegments(new T.BufferGeometry().setFromPoints([[-6, 4.5, -4, 6], [-4, 6, -2.5, 5.4], [3, -3, 5, -1.5], [5, -1.5, 6.5, -2], [-8, -4, -6.6, -5]].flatMap(([a, b, c, d]) => [new T.Vector3(a, 0.02, b), new T.Vector3(c, 0.02, d)])), new T.LineBasicMaterial({ color: 0x8a8273 }));
    scene.add(cracks);
    const wall = (x, z, w, h, ry, rz) => { const m = inked(new T.BoxGeometry(w, h, 0.6), '#c9c2b4'); m.position.set(x, h / 2, z); m.rotation.y = ry || 0; m.rotation.z = rz || 0; scene.add(m); return m; };
    wall(-8, -8.2, 5, 4.6); wall(-3.4, -8.4, 3.4, 2.6, 0, 0.12); wall(1.6, -8.2, 4, 5.4); wall(6.2, -8.6, 3, 1.8, 0, -0.2); wall(10.4, -6.6, 3.2, 3.4, 1.2);
    const slab = inked(new T.BoxGeometry(6, 0.4, 3), '#b9b2a4'); slab.position.set(-3.6, 1.2, -7); slab.rotation.set(0.35, 0.1, -0.18); scene.add(slab);
    const beam = inked(new T.BoxGeometry(7, 0.35, 0.35), '#8c6b4b'); beam.position.set(5.4, 1.4, -6.4); beam.rotation.set(0.1, 0.4, 0.32); scene.add(beam);
    const stripe = inked(new T.BoxGeometry(5, 0.6, 0.12), '#f2c230'); stripe.position.set(-9.4, 0.7, 4.8); stripe.rotation.y = 0.5; scene.add(stripe);
    // 불과 연기(뒤편)
    const fire = new T.Mesh(new T.ConeGeometry(0.7, 1.8, 10), new T.MeshBasicMaterial({ color: 0xff8a2a, transparent: true, opacity: 0.85 })); fire.position.set(2.6, 0.9, -7.2); scene.add(fire);
    const fire2 = new T.Mesh(new T.ConeGeometry(0.4, 1.1, 10), new T.MeshBasicMaterial({ color: 0xffd34a })); fire2.position.set(2.6, 0.6, -6.9); scene.add(fire2);
    const glow = new T.PointLight(0xff8a2a, 1.6, 9); glow.position.set(2.6, 1.6, -6.6); scene.add(glow);
    const smokeMat = new T.MeshLambertMaterial({ color: 0x77736c, transparent: true, opacity: 0.6, depthWrite: false });
    const puffs = Array.from({ length: 9 }, (_, i) => { const p = new T.Mesh(new T.SphereGeometry(1, 14, 10), smokeMat.clone()); p.userData.u = i / 9; scene.add(p); return p; });
    // 잔해(장애물)
    const obs = DEBRIS.map(([x, z, r, k], i) => {
      const m = k === 'barrel' ? mat('#e2622b') : k === 'pipe' ? mat('#9aa3ae') : mat('#b3ab9c');
      let mesh;
      if (k === 'barrel') { mesh = inked(new T.CylinderGeometry(r * 0.62, r * 0.62, 1.5, 18), m); mesh.position.set(x, 0.75, z); }
      else if (k === 'pipe') { mesh = inked(new T.CylinderGeometry(0.42, 0.42, r * 2.6, 16), m); mesh.rotation.set(0, i * 0.7, Math.PI / 2); mesh.position.set(x, 0.42, z); }
      else { mesh = inked(new T.BoxGeometry(r * 1.5, r * 0.9, r * 1.3), m); mesh.position.set(x, r * 0.45, z); mesh.rotation.y = i * 0.8; }
      scene.add(mesh);
      return { x, z, r: k === 'pipe' ? r * 1.15 : r, mesh, seen: 0 };
    });
    // 깃발
    const flag = group(); const pole = inked(new T.CylinderGeometry(0.05, 0.05, 1.8, 8), '#3a3f4b'); pole.position.y = 0.9; flag.add(pole);
    const cloth = new T.Mesh(new T.BufferGeometry().setFromPoints([new T.Vector3(0, 1.8, 0), new T.Vector3(0.9, 1.55, 0), new T.Vector3(0, 1.3, 0)]), new T.MeshBasicMaterial({ color: 0xd9483b, side: T.DoubleSide })); cloth.geometry.computeVertexNormals(); flag.add(cloth);
    const ring = new T.Mesh(new T.RingGeometry(0.45, 0.62, 28), new T.MeshBasicMaterial({ color: 0xd9483b, transparent: true, opacity: 0.8 })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.03; flag.add(ring);
    flag.visible = false;
    // 로봇: 몸통 앞(+x)에 머리 센서, 다리 넷(엉덩이 → 넓적다리 → 무릎 → 정강이)
    const bot = group(), body = group(bot); bot.scale.setScalar(SC);
    const yel = mat('#f2c230'), dark = mat('#3a3f4b');
    const torso = inked(new T.BoxGeometry(1.9, 0.5, 0.72), yel); body.add(torso);
    const back = inked(new T.BoxGeometry(1.1, 0.16, 0.5), dark); back.position.y = 0.33; body.add(back);
    const head = inked(new T.BoxGeometry(0.42, 0.34, 0.5), '#2b3242'); head.position.set(1.1, 0.1, 0); body.add(head);
    const lens = new T.Mesh(new T.CylinderGeometry(0.11, 0.11, 0.06, 16), new T.MeshBasicMaterial({ color: 0x5fd0f0 })); lens.rotation.z = Math.PI / 2; lens.position.set(1.33, 0.12, 0); body.add(lens);
    const lidar = inked(new T.CylinderGeometry(0.14, 0.14, 0.14, 14), '#2b3242'); lidar.position.set(1.05, 0.34, 0); body.add(lidar);
    const L1 = 0.62, L2 = 0.66;
    const legs = [[0.72, 0.4, 0], [0.72, -0.4, Math.PI], [-0.72, 0.4, Math.PI], [-0.72, -0.4, 0]].map(([x, z, off]) => {
      const hip = group(body); hip.position.set(x, -0.12, z);
      const th = inked(new T.BoxGeometry(0.16, L1, 0.16), dark); th.position.y = -L1 / 2; hip.add(th);
      const knee = group(hip); knee.position.y = -L1;
      const kb = new T.Mesh(new T.SphereGeometry(0.11, 12, 10), yel); knee.add(kb);
      const sh = inked(new T.BoxGeometry(0.13, L2, 0.13), dark); sh.position.y = -L2 / 2; knee.add(sh);
      const ft = new T.Mesh(new T.SphereGeometry(0.1, 10, 8), dark); ft.position.y = -L2; knee.add(ft);
      return { hip, knee, off };
    });
    // 센서 부채꼴(땅 높이)
    const FAN = 3.6, HALF = 0.55;
    const fan = new T.Mesh(new T.CircleGeometry(FAN, 28, -HALF, HALF * 2), new T.MeshBasicMaterial({ color: 0x2a8fb8, transparent: true, opacity: 0.2, depthWrite: false, side: T.DoubleSide }));
    fan.rotation.x = -Math.PI / 2; const fanG = group(bot); fanG.position.set(1.1, 0.04, 0); fanG.add(fan);
    s.label(say, () => new T.Vector3(p.x, 3.1, p.z));
    // 상태
    const p = { x: -6.8, z: 3.8 }; let h = 0.3, target = null, phase = 0, sweep = 0, tm = 0, mode = 'idle', started = false, holdSay = 0;
    bot.position.set(p.x, 0, p.z); bot.rotation.y = h;
    function setSay(t) { if (say.textContent !== t) say.textContent = t; say.classList.toggle('off', !t); }
    // 길 찾기: 0.5칸 격자에서 잔해(로봇 몸 너비만큼 부풀림)를 피하는 A* → 보이는 곳까지 잇기
    const G = 0.5, GX = Math.round((AX + 1) * 2 / G) + 1, GZ = Math.round((AZ + 1) * 2 / G) + 1;
    const gx = (x) => clamp(Math.round((x + AX + 1) / G), 0, GX - 1), gz = (z) => clamp(Math.round((z + AZ + 1) / G), 0, GZ - 1);
    const wx = (i) => i * G - AX - 1, wz = (j) => j * G - AZ - 1;
    const blocked = Array.from({ length: GX * GZ }, (_, k) => { const x = wx(k % GX), z = wz(Math.floor(k / GX)); return obs.some((o) => Math.hypot(x - o.x, z - o.z) < o.r + 0.8); });
    const free = (x, z) => !blocked[gz(z) * GX + gx(x)];
    const clear = (a, b) => { const n = Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 0.2); for (let i = 1; i <= n; i++) { const u = i / n; if (!free(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u)) return false; } return true; };
    function route(from, to) {
      const s0 = gz(from[1]) * GX + gx(from[0]), e = gz(to[1]) * GX + gx(to[0]);
      const cost = new Map([[s0, 0]]), came = new Map(), open = [[0, s0]];
      while (open.length) {
        open.sort((a, b) => a[0] - b[0]); const [, k] = open.shift();
        if (k === e) break;
        const i = k % GX, j = Math.floor(k / GX);
        for (let di = -1; di <= 1; di++) for (let dj = -1; dj <= 1; dj++) {
          const ni = i + di, nj = j + dj; if ((!di && !dj) || ni < 0 || nj < 0 || ni >= GX || nj >= GZ) continue;
          const nk = nj * GX + ni; if (blocked[nk] && nk !== e) continue;
          if (di && dj && (blocked[j * GX + ni] || blocked[nj * GX + i])) continue;
          const v = cost.get(k) + (di && dj ? 1.414 : 1);
          if (v < (cost.get(nk) ?? Infinity)) { cost.set(nk, v); came.set(nk, k); open.push([v + Math.hypot(ni - e % GX, nj - Math.floor(e / GX)), nk]); }
        }
      }
      if (!came.has(e)) return [to];
      const cells = [e]; let q = e; while (came.has(q)) { q = came.get(q); cells.unshift(q); }
      const pts = cells.map((k) => [wx(k % GX), wz(Math.floor(k / GX))]); pts[0] = from; pts[pts.length - 1] = to;
      const out = [pts[0]]; let i = 0;
      while (i < pts.length - 1) { let j = pts.length - 1; while (j > i + 1 && !clear(pts[i], pts[j])) j--; out.push(pts[j]); i = j; }
      return out.slice(1);
    }
    let way = [];
    function goTo(x, z) {
      x = clamp(x, -AX, AX); z = clamp(z, -4.4, AZ);   // 뒤쪽 무너진 벽·지붕판에는 들어가지 않는다
      if (!free(x, z)) { let best = null, bd = Infinity; for (let k = 0; k < blocked.length; k++) if (!blocked[k]) { const d = Math.hypot(wx(k % GX) - x, wz(Math.floor(k / GX)) - z); if (d < bd) { bd = d; best = k; } } if (best !== null) { x = wx(best % GX); z = wz(Math.floor(best / GX)); } }
      target = { x, z }; way = route([p.x, p.z], [x, z]); flag.position.set(x, 0, z); flag.visible = true; mode = 'walk';
      if (window.gsap && !window.Deck.reduce) gsap.fromTo(flag.position, { y: 2.4 }, { y: 0, duration: 0.45, ease: 'bounce.out' });
      now.classList.add('gone');
    }
    function tap(e) { const q = s.planeAt(e, 0); if (q) goTo(q.x, q.z); }
    function step(dt) {
      tm += dt; sweep = Math.sin(tm * 2.4) * 0.35; fan.rotation.z = sweep;
      fire.scale.set(1 + 0.12 * Math.sin(tm * 13), 1 + 0.2 * Math.sin(tm * 9), 1); glow.intensity = 1.4 + 0.4 * Math.sin(tm * 11);
      puffs.forEach((q) => { const u = (q.userData.u + tm * 0.07) % 1; q.position.set(2.2 + u * 2.6 + Math.sin(u * 7) * 0.4, 1.6 + u * 7, -7.6 - u * 1.4); q.scale.setScalar(0.5 + u * 1.6); q.material.opacity = 0.62 * (1 - u); });
      // 센서로 앞을 살핀다
      const fx = Math.cos(h), fz = -Math.sin(h);
      let seen = null;
      obs.forEach((o) => {
        const dx = o.x - (p.x + fx * 1.1 * SC), dz = o.z - (p.z + fz * 1.1 * SC), d = Math.hypot(dx, dz), a = Math.abs(wrap(Math.atan2(-dz, dx) - h - sweep));
        const hit = d < FAN * SC + o.r * 0.6 && a < HALF + o.r / Math.max(d, 0.5);
        o.seen = Math.max(0, hit ? 1 : o.seen - dt * 1.6);
        o.mesh.material.emissive.setRGB(0.06 * o.seen, 0.32 * o.seen, 0.46 * o.seen);
        if (hit && (!seen || d < seen.d)) seen = { o, d };
      });
      let speed = 0, avoiding = false;
      if (mode === 'walk' && target) {
        while (way.length > 1 && Math.hypot(way[0][0] - p.x, way[0][1] - p.z) < 0.45) way.shift();
        const wpt = way[0] || [target.x, target.z];
        const tx = wpt[0] - p.x, tz = wpt[1] - p.z, dist = Math.hypot(tx, tz), left = Math.hypot(target.x - p.x, target.z - p.z);
        avoiding = way.length > 1 && !!seen && seen.d < 3.2;   // 곧장 가지 않고 돌아가는 중
        if (left < 0.35) { mode = 'idle'; flag.visible = false; setSay('도착'); holdSay = 1.6; }
        else {
          const want = Math.atan2(-tz, tx), dh = wrap(want - h);
          h += clamp(dh, -3.6 * dt, 3.6 * dt);
          speed = 3.0 * clamp(left / 1.4, 0.35, 1) * (1 - 0.5 * Math.min(1, Math.abs(dh)));
          p.x += Math.cos(h) * speed * dt; p.z += -Math.sin(h) * speed * dt;
          obs.forEach((o) => { const dx = p.x - o.x, dz = p.z - o.z, d = Math.hypot(dx, dz) || 0.01, R = o.r + 0.62; if (d < R) { p.x = o.x + dx / d * R; p.z = o.z + dz / d * R; } });
          p.x = clamp(p.x, -AX - 1, AX + 1); p.z = clamp(p.z, -AZ - 1, AZ + 1);
        }
      }
      holdSay = Math.max(0, holdSay - dt);
      if (!holdSay) setSay(mode !== 'walk' ? '' : avoiding ? '센서: 앞에 잔해 → 비켜 간다' : seen ? '센서: 잔해 발견' : '');
      // 걸음
      phase += dt * (speed > 0.05 ? 3.4 + speed * 2.2 : 0);
      const gait = clamp(speed / 1.2, 0, 1);
      legs.forEach((l) => {
        const sw = Math.sin(phase + l.off), lift = Math.max(0, Math.cos(phase + l.off));
        l.hip.rotation.z = 0.42 + 0.38 * sw * gait;
        l.knee.rotation.z = -0.95 - 0.55 * lift * gait;
      });
      body.position.y = 1.3 + 0.035 * Math.sin(phase * 2) * gait;
      bot.position.set(p.x, 0, p.z); bot.rotation.y = h;
    }
    root._qb = { get mode() { return mode; }, get pos() { return [p.x.toFixed(1), p.z.toFixed(1)]; }, get info() { return JSON.stringify({ t: target && [target.x.toFixed(1), target.z.toFixed(1)], way: way.map((q) => q.map((v) => +v.toFixed(1))) }); }, goTo };
    return {
      setActive(on) { s.setActive(on); if (on && !started) { started = true; goTo(5.6, -1.2); now.classList.remove('gone'); } },
      fit: s.fit,
    };
  }
  window.QuadBot = { mount };
})();
