/* 2차시 설명 장 «용광로 속»(교과서 44쪽 철의 제련): 한쪽을 잘라 낸 3D 용광로. 높이마다 다른 반응이 일어나는 구역을 누르면
   그 구역이 밝아지고 오른쪽 카드에 반응식·풀이가 나온다. «쇳물 빼기»를 누르면 아래 구멍에서 쇳물이 흘러나온다(흔들림·진동).
   끌어 돌리기·확대·옮기기·처음 시점(orbit3d.js). 크기·비율·온도는 이해를 돕기 위한 예.
   시험용: root._fu3.pick(k) · root._fu3.tap() */
(function () {
  'use strict';
  const PHI0 = Math.PI * 0.15, PHI = Math.PI * 1.5;          // 앞쪽 4분의 1을 잘라 낸다
  // 바깥 벽 윤곽 [반지름, 높이]
  const SHELL = [[0.0, -0.3], [2.15, -0.3], [2.25, 0.2], [2.3, 1.2], [2.65, 2.4], [2.55, 3.6], [2.05, 5.4], [1.45, 6.4], [1.25, 6.9], [0.0, 6.9]];
  // 안쪽 구역: [키, 아래, 위, 반지름(아래), 반지름(위), 색, 빛]
  const ZONES = [
    ['iron', -0.1, 0.75, 1.9, 1.95, '#ff8c1a', 1.0],
    ['slag', 0.75, 1.15, 1.95, 2.0, '#d8c070', 0.25],
    ['burn', 1.15, 2.25, 2.0, 2.3, '#ff5a1f', 0.75],
    ['reduce', 2.25, 4.9, 2.3, 1.85, null, 0],
    ['top', 4.9, 6.2, 1.85, 1.15, null, 0],
  ];
  const INFO = {
    top: { n: '꼭대기: 원료를 넣는 곳', eq: '철광석 · 코크스 · 석회석', d: '철광석(산화 철(Ⅲ)이 든 돌), 코크스(석탄을 구워 만든 탄소 덩어리), 석회석을 차례로 층층이 넣는다. 원료는 천천히 아래로 내려간다.' },
    air: { n: '뜨거운 공기를 불어 넣는 관', eq: '산소 공급', d: '아래쪽 둘레의 관으로 아주 뜨거운 공기를 세게 불어 넣는다. 공기 속 산소가 코크스를 태운다.' },
    burn: { n: '코크스가 타는 곳', eq: '2C + O<sub>2</sub> → 2CO', ox: '0>2', d: '코크스의 탄소가 산소를 얻어 <b>일산화 탄소</b>가 된다.<br>이때 나는 열로 용광로 속이 아주 뜨거워진다.' },
    reduce: { n: '산화 철(Ⅲ)이 철로 바뀌는 곳', eq: 'Fe<sub>2</sub>O<sub>3</sub> + 3CO → 2Fe + 3CO<sub>2</sub>', ox: '1>3', red: '0>2', d: '위로 올라가는 CO가 광석의 산소를 빼앗는다.<br>산화 철(Ⅲ)은 <b>철</b>이 되고, CO는 CO<sub>2</sub>가 된다.' },
    slag: { n: '슬래그', eq: '석회석 + 불순물', d: '석회석이 광석 속 모래 같은 불순물과 만나 생긴 찌꺼기. 쇳물보다 가벼워 <b>쇳물 위에 뜬다</b>. 따로 빼내 시멘트 재료로 쓴다.' },
    iron: { n: '녹은 철(쇳물)', eq: '철', d: '환원된 철이 녹아 바닥에 고인다. 아래 구멍을 열어 빼낸다 → 다듬어 강철로 만든다.' },
    gas: { n: '꼭대기로 나가는 가스', eq: 'CO<sub>2</sub> (와 남은 CO)', d: '광석의 산소를 얻은 이산화 탄소가 빠져나간다. 남은 열과 일산화 탄소는 공기를 데우는 데 다시 쓴다.' },
  };
  const ORDER = ['top', 'air', 'burn', 'reduce', 'slag', 'iron', 'gas'];

  function mount(root) {
    const stage = root.querySelector('.fu3-stage'), canvas = stage.querySelector('canvas');
    const btns = [...root.querySelectorAll('.fu3-pick button')];
    const card = root.querySelector('.fu3-card'), nm = card.querySelector('.fu3-name'), eq = card.querySelector('.fu3-eq'), dd = card.querySelector('.fu3-d');
    const seenEl = root.querySelector('.fu3-n'), tapBtn = root.querySelector('.fu3-tap');
    const seen = new Set();
    let sel = null, tapT = -1, time = 0;
    const s = window.Orbit.make(stage, canvas, {
      view: { yaw: -0.52, pitch: 0.26, dist: 17, target: [0, 3.0, 0] }, min: 7, max: 30, pmin: -0.25, pmax: 1.2, bounds: 6, fov: 36,
      click: (e) => clickAt(e), onFrame: (dt) => tick(dt),
    });
    window.Orbit.chrome(stage, s);
    const api = { pick: (k) => pick(k), tap: () => tap() };
    root._fu3 = api;
    btns.forEach((b) => b.addEventListener('click', () => pick(b.dataset.k)));
    if (tapBtn) tapBtn.addEventListener('click', () => tap());
    if (!s.ok) return { setActive() {} };
    const { T, scene } = s;
    const parts = [];
    const add = (m, k) => { m.userData.k = k; scene.add(m); if (k) parts.push(m); return m; };
    // 땅
    const ground = new T.Mesh(new T.CylinderGeometry(7, 7, 0.3, 48), s.mat('#b9b3a6')); ground.position.y = -0.45; scene.add(ground);
    // 바깥 벽(벽돌 빛) + 안쪽 내화 벽돌
    const pts = SHELL.map(([r, y]) => new T.Vector2(r, y));
    add(new T.Mesh(new T.LatheGeometry(pts, 64, PHI0, PHI), s.mat('#6f7782', { metalness: 0.35, roughness: 0.55, side: T.DoubleSide })), null);
    // 잘린 면(벽 두께): 바깥 윤곽과 안쪽 구역 사이를 색으로 채운 판
    const cutShape = new T.Shape(); cutShape.moveTo(0, -0.3); SHELL.slice(1).forEach(([r, y]) => cutShape.lineTo(r, y));
    [PHI0, PHI0 + PHI].forEach((a) => {
      const g = new T.ShapeGeometry(cutShape); const m = new T.Mesh(g, s.mat('#a9563a', { side: T.DoubleSide, roughness: 0.9 }));
      m.rotation.y = a - Math.PI / 2; scene.add(m);
    });
    // 안쪽 구역(층마다 원기둥 조각 + 잘린 면). 환원 구역·꼭대기는 광석·코크스·석회석 층을 번갈아
    const layerMesh = (k, y0, y1, r0, r1, col, glow) => {
      const h = y1 - y0, g = new T.CylinderGeometry(r1, r0, h, 48, 1, false, PHI0, PHI);
      const mat = s.mat(col, { roughness: 0.85, side: T.DoubleSide });
      if (glow) { mat.emissive = new T.Color(col); mat.emissiveIntensity = glow; }
      const m = add(new T.Mesh(g, mat), k); m.position.y = (y0 + y1) / 2;
      // 잘린 두 면
      [PHI0, PHI0 + PHI].forEach((a) => {
        const sh = new T.Shape(); sh.moveTo(0, y0); sh.lineTo(r0, y0); sh.lineTo(r1, y1); sh.lineTo(0, y1);
        const f = add(new T.Mesh(new T.ShapeGeometry(sh), mat), k); f.rotation.y = a - Math.PI / 2;
        f.position.set(Math.sin(a) * 0.01, 0, Math.cos(a) * 0.01);
      });
      m.userData.base = mat.emissiveIntensity; m.userData.mat = mat;
      return m;
    };
    ZONES.forEach(([k, y0, y1, r0, r1, col, glow]) => {
      if (col) { layerMesh(k, y0, y1, r0 - 0.06, r1 - 0.06, col, glow); return; }
      const n = k === 'reduce' ? 6 : 4, cols = ['#8b4a32', '#2f2f33', '#8b4a32', '#e5dfcf'];
      for (let i = 0; i < n; i++) {
        const a = y0 + (y1 - y0) * i / n, b = y0 + (y1 - y0) * (i + 1) / n;
        const ra = r0 + (r1 - r0) * i / n, rb = r0 + (r1 - r0) * (i + 1) / n;
        layerMesh(k, a, b, ra - 0.06, rb - 0.06, cols[i % cols.length], k === 'reduce' ? 0.12 * (n - i) / n : 0);
      }
    });
    // 뜨거운 공기 고리 관과 바람구멍
    const hot = s.mat('#c0392b', { metalness: 0.3, roughness: 0.4 });
    const ring = add(new T.Mesh(new T.TorusGeometry(3.1, 0.18, 12, 64), hot), 'air'); ring.rotation.x = Math.PI / 2; ring.position.y = 2.0;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2; if (a > PHI0 + PHI - 0.3 || a < PHI0 - 0.1) { /* 잘린 쪽에도 하나쯤 보이게 */ }
      const p = add(new T.Mesh(new T.CylinderGeometry(0.08, 0.08, 1.0, 10), hot), 'air');
      p.position.set(Math.sin(a) * 2.6, 1.75, Math.cos(a) * 2.6); p.rotation.set(0, 0, 0); p.lookAt(0, 1.6, 0); p.rotateX(Math.PI / 2);
    }
    // 꼭대기 원료 통과 가스 관
    const hopper = add(new T.Mesh(new T.CylinderGeometry(0.9, 0.4, 0.8, 24, 1, true), s.mat('#5b6370', { side: T.DoubleSide, metalness: 0.4 })), 'top'); hopper.position.y = 7.3;
    const pipeM = s.mat('#7c8591', { metalness: 0.4 });
    const up1 = add(new T.Mesh(new T.CylinderGeometry(0.22, 0.22, 1.6, 14), pipeM), 'gas'); up1.position.set(-0.9, 7.6, -0.4);
    const up2 = add(new T.Mesh(new T.CylinderGeometry(0.22, 0.22, 2.2, 14), pipeM), 'gas'); up2.position.set(-2.0, 8.4, -0.9); up2.rotation.z = Math.PI / 2.6;
    // 쇳물 빼는 구멍·도랑·통
    const hole = add(new T.Mesh(new T.CylinderGeometry(0.16, 0.16, 0.9, 12), s.mat('#3b3f4a')), 'iron'); hole.rotation.z = Math.PI / 2; hole.position.set(2.5, 0.25, 0.5);
    const trough = new T.Mesh(new T.BoxGeometry(2.6, 0.18, 0.5), s.mat('#6b5e52')); trough.position.set(4.0, -0.15, 0.5); trough.rotation.z = -0.12; scene.add(trough);
    const ladle = new T.Mesh(new T.CylinderGeometry(0.85, 0.65, 1.0, 24, 1, true), s.mat('#4a4f58', { side: T.DoubleSide, metalness: 0.4 })); ladle.position.set(5.7, -0.1, 0.5); scene.add(ladle);
    const streamMat = new T.MeshStandardMaterial({ color: new T.Color('#ffb02e'), emissive: new T.Color('#ff7a10'), emissiveIntensity: 1.2 });
    const stream = new T.Mesh(new T.BoxGeometry(2.4, 0.1, 0.3), streamMat); stream.position.set(4.0, -0.03, 0.5); stream.rotation.z = -0.12; stream.visible = false; scene.add(stream);
    const fill = new T.Mesh(new T.CylinderGeometry(0.78, 0.78, 0.05, 24), streamMat); fill.position.set(5.7, -0.5, 0.5); fill.visible = false; scene.add(fill);
    const glowL = new T.PointLight('#ff8a2a', 8, 9); glowL.position.set(0.6, 1.2, 1.4); scene.add(glowL);
    // 위로 올라가는 기체 입자(CO 회색 → CO₂ 흰빛)
    const gasG = new T.SphereGeometry(0.09, 10, 8), gas = [];
    for (let i = 0; i < 46; i++) {
      const m = new T.Mesh(gasG, new T.MeshStandardMaterial({ color: new T.Color('#8a8f99') }));
      const a = PHI0 + PHI + Math.random() * (2 * Math.PI - PHI) - 0.05;           // 잘린 쪽(앞)에서 잘 보이게
      m.userData = { a, r: 0.3 + Math.random() * 1.5, y: 2.2 + Math.random() * 4.2, v: 0.5 + Math.random() * 0.6 };
      scene.add(m); gas.push(m);
    }
    // 이름표
    // 잘린 쪽(앞 왼쪽)을 바라보는 방향 d, 그 옆 방향 q: 이름표를 구역 안 잘린 면 위에 겹치지 않게 벌려 둔다
    const DA = PHI0 + PHI + (2 * Math.PI - PHI) / 2, d = [Math.sin(DA), Math.cos(DA)], q = [d[1], -d[0]];
    const at = (y, sd, r = 1.25) => [d[0] * r + q[0] * sd, y, d[1] * r + q[1] * sd];
    const LABS = { top: at(5.7, 0), air: [q[0] * 3.1, 2.0, q[1] * 3.1], burn: at(1.75, -0.95), reduce: at(3.6, 0), slag: at(1.0, 1.0), iron: at(0.3, -0.5), gas: [-2.4, 9.2, -1.0] };
    const NAMES = { top: '원료 넣기', air: '뜨거운 공기', burn: '코크스 연소', reduce: '철의 환원', slag: '슬래그', iron: '쇳물', gas: '배기가스' };
    Object.entries(LABS).forEach(([k, p]) => {
      const el = document.createElement('button'); el.type = 'button'; el.className = 'o3-lab fu3-lab'; el.dataset.k = k; el.textContent = NAMES[k];
      el.addEventListener('click', (e) => { e.stopPropagation(); pick(k); });
      stage.appendChild(el); s.label(el, new T.Vector3(...p));
    });
    function paint() {
      parts.forEach((m) => {
        const on = !sel || m.userData.k === sel, mat = m.userData.mat || m.material;
        if (!mat.userData) mat.userData = {};
        mat.transparent = !on; mat.opacity = on ? 1 : 0.28; mat.needsUpdate = true;
      });
      stage.querySelectorAll('.fu3-lab').forEach((el) => el.classList.toggle('on', el.dataset.k === sel));
    }
    function pick(k) {
      sel = sel === k ? null : k;
      btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === sel)));
      if (sel) {
        seen.add(sel); const I = INFO[sel];
        nm.innerHTML = I.n; eq.classList.toggle('bx', !!(I.ox || I.red)); eq.dataset.ox = I.ox || ''; eq.dataset.red = I.red || ''; eq.innerHTML = I.eq; dd.innerHTML = I.d; card.classList.remove('empty'); if (window.RX && RX.bx) RX.bx(eq);
      }
      if (seenEl) seenEl.textContent = `${seen.size} / ${ORDER.length}`;
      root.classList.toggle('fu3-all', seen.size === ORDER.length);
      paint(); if (!s.active) s.render();
    }
    function clickAt(e) { const h = s.pick(e, parts); if (h) pick(h.object.userData.k); }
    function tap() {
      tapT = 0; stream.visible = true; fill.visible = true;
      if (window.RxT && window.RxT.jolt) window.RxT.jolt(stage, 2);
      if (sel !== 'iron') pick('iron');
    }
    function tick(dt) {
      time += dt;
      gas.forEach((m) => {
        const u = m.userData; u.y += u.v * dt; if (u.y > 6.3) u.y = 2.2;
        const r = u.r * (u.y > 4.9 ? 0.75 : 1);
        m.position.set(Math.sin(u.a) * r, u.y, Math.cos(u.a) * r);
        m.material.color.set(u.y > 4.3 ? '#e9ecef' : '#7a808b');
        m.visible = !sel || sel === 'reduce' || sel === 'burn' || sel === 'gas';
      });
      glowL.intensity = 8 + 2 * Math.sin(time * 6);
      if (tapT >= 0) {
        tapT += dt;
        stream.scale.y = 1 + 0.25 * Math.sin(time * 20);
        fill.position.y = -0.5 + Math.min(0.75, tapT * 0.12);
        if (tapT > 7) { tapT = -1; stream.visible = false; }
      }
    }
    if (seenEl) seenEl.textContent = `0 / ${ORDER.length}`;
    return { setActive: s.setActive };
  }
  window.RxFurn3d = { mount, ORDER };
})();
