/* 1-1 2차시 체험 «3D 기내 가방의 부피»(교과서 21쪽 그림 I-4 부피). 가로·세로·높이 막대로 가방이 바뀌고
   부피(cm³·L)가 계산된다. 10 cm 눈금 칸(1 L)이 가방 면에 그려진다. 점선 틀 = 기내 선반에 들어가는 크기(55×40×20 cm, 이해를 돕기 위한 예).
   빈 곳을 끌면 돌려 보고, 바퀴·두 손가락으로 다가간다. Bag3D.mount(root) → { setActive, fit } · 시험용: root._bag.set(가로, 세로, 높이) */
(function () {
  'use strict';
  const LIM = { w: 55, d: 40, h: 20 };
  const fmt = (v) => Math.round(v).toLocaleString('ko-KR');
  function mount(root) {
    const stage = root.querySelector('.bg-stage'), cv = stage.querySelector('canvas'), out = root.querySelector('.bg-out'), fit = root.querySelector('.bg-fit'), now = root.querySelector('.bg-now');
    const rs = { w: root.querySelector('.bg-w'), d: root.querySelector('.bg-d'), h: root.querySelector('.bg-h') };
    const vs = { w: root.querySelector('.bg-wv'), d: root.querySelector('.bg-dv'), h: root.querySelector('.bg-hv') };
    const s = window.Scene3D.make(stage, cv, { view: { yaw: 0.75, pitch: 0.45, dist: 17, target: [0, 1.6, 0] }, min: 8, max: 34 });
    if (!s.ok) return { setActive() {}, fit() {} };
    const { T, scene } = s;
    scene.add(new T.HemisphereLight(0xffffff, 0xb0b8b0, 1.3));
    const sun = new T.DirectionalLight(0xffffff, 1.3); sun.position.set(8, 14, 10); scene.add(sun);
    s.renderer.setClearColor(new T.Color('#eef1ea'), 1);
    const floor = new T.Mesh(new T.PlaneGeometry(30, 30), new T.MeshLambertMaterial({ color: 0xd8cdb4 })); floor.rotation.x = -Math.PI / 2; scene.add(floor);
    const grid = new T.GridHelper(30, 30, 0xb9ab8f, 0xc9bda3); grid.position.y = 0.01; scene.add(grid);
    // 선반 틀(점선)
    const limBox = new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(LIM.w / 10, LIM.h / 10, LIM.d / 10)), new T.LineDashedMaterial({ color: 0x2a73b8, dashSize: 0.25, gapSize: 0.18 }));
    limBox.computeLineDistances(); limBox.position.y = LIM.h / 20; scene.add(limBox);
    const bag = new T.Group(); scene.add(bag);
    const shell = new T.MeshLambertMaterial({ color: 0xd9631e });
    let box = null, lines = null, handle = null, wheels = [];
    const labs = {};
    ['w', 'd', 'h'].forEach((k) => { const e = document.createElement('span'); e.className = 'g3-label bg-lab ' + k; stage.appendChild(e); labs[k] = e; });
    const dims = { w: 50, d: 35, h: 25 };
    s.label(labs.w, () => new T.Vector3(0, -0.25, dims.d / 20 + 0.3));
    s.label(labs.d, () => new T.Vector3(dims.w / 20 + 0.5, -0.25, 0));
    s.label(labs.h, () => new T.Vector3(-dims.w / 20 - 0.5, dims.h / 20 + 0.2, dims.d / 20));
    const tried = new Set(); let best = 0;
    function build() {
      const W = dims.w / 10, D = dims.d / 10, H = dims.h / 10;
      [box, lines, handle, ...wheels].forEach((o) => { if (o) { bag.remove(o); o.geometry && o.geometry.dispose(); } }); wheels = [];
      box = new T.Mesh(new T.BoxGeometry(W, H, D), shell); box.position.y = H / 2 + 0.25; bag.add(box);
      // 10 cm(=1 L) 눈금 칸
      const pts = [], y0 = 0.25, add = (a, b) => pts.push(new T.Vector3(...a), new T.Vector3(...b)), e = 0.005;
      for (let x = -W / 2; x <= W / 2 + 1e-6; x += 1) { add([x, y0, D / 2 + e], [x, y0 + H, D / 2 + e]); add([x, y0 + H + e, -D / 2], [x, y0 + H + e, D / 2]); }
      for (let y = 0; y <= H + 1e-6; y += 1) { add([-W / 2, y0 + y, D / 2 + e], [W / 2, y0 + y, D / 2 + e]); add([W / 2 + e, y0 + y, -D / 2], [W / 2 + e, y0 + y, D / 2]); }
      for (let z = -D / 2; z <= D / 2 + 1e-6; z += 1) { add([-W / 2, y0 + H + e, z], [W / 2, y0 + H + e, z]); add([W / 2 + e, y0, z], [W / 2 + e, y0 + H, z]); }
      lines = new T.LineSegments(new T.BufferGeometry().setFromPoints(pts), new T.LineBasicMaterial({ color: 0x7a2f08, transparent: true, opacity: 0.55 })); bag.add(lines);
      handle = new T.Mesh(new T.TorusGeometry(0.45, 0.08, 8, 20, Math.PI), new T.MeshLambertMaterial({ color: 0x1d2433 })); handle.position.set(0, H + 0.25, 0); bag.add(handle);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => { const w = new T.Mesh(new T.CylinderGeometry(0.17, 0.17, 0.12, 14), new T.MeshLambertMaterial({ color: 0x1d2433 })); w.rotation.z = Math.PI / 2; w.position.set(a * (W / 2 - 0.3), 0.17, b * (D / 2 - 0.3)); bag.add(w); wheels.push(w); });
      const v = dims.w * dims.d * dims.h, okFit = dims.w <= LIM.w && dims.d <= LIM.d && dims.h <= LIM.h;
      shell.color.set(okFit ? 0xd9631e : 0xb53a2c);
      labs.w.textContent = `가로 ${dims.w} cm`; labs.d.textContent = `세로 ${dims.d} cm`; labs.h.textContent = `높이 ${dims.h} cm`;
      out.innerHTML = `${dims.w} cm × ${dims.d} cm × ${dims.h} cm = <b>${fmt(v)} cm³</b> <small>(= ${fmt(v / 1000)} L, 1 L = 1000 cm³)</small>`;
      fit.className = 'bg-fit ' + (okFit ? 'ok' : 'no');
      fit.textContent = okFit ? `선반에 들어간다 ✓ ${v >= 42000 ? '거의 가장 큰 가방!' : ''}` : `선반에 안 들어간다 — ${[dims.w > LIM.w && '가로', dims.d > LIM.d && '세로', dims.h > LIM.h && '높이'].filter(Boolean).join('·')}가 넘친다`;
      if (okFit) best = Math.max(best, v);
      ['w', 'd', 'h'].forEach((k) => { rs[k].value = String(dims[k]); vs[k].textContent = `${dims[k]} cm`; });
      steps(); s.render();
    }
    function steps() {
      const ok = []; if (tried.size >= 1) ok.push(1); if (tried.size >= 3) ok.push(2); if (best >= 42000) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      now.textContent = st === 1 ? '① 막대 하나를 움직여 부피가 어떻게 바뀌는지 보자' : st === 2 ? '② 가로·세로·높이를 모두 바꿔 보자' : st === 3 ? '③ 파란 점선 틀에 들어가는 가장 큰 가방을 만들자' : '길이 세 개를 곱하면 부피!';
      now.classList.toggle('done', st === 0);
    }
    ['w', 'd', 'h'].forEach((k) => rs[k].addEventListener('input', () => { dims[k] = +rs[k].value; tried.add(k); build(); }));
    root.querySelector('.bg-home').addEventListener('click', () => s.look({ yaw: 0.75, pitch: 0.45, dist: 17, target: [0, 1.6, 0] }));
    build();
    root._bag = { set: (w, d, h) => { Object.assign(dims, { w, d, h }); ['w', 'd', 'h'].forEach((k) => tried.add(k)); build(); } };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.Bag3D = { mount };
})();
