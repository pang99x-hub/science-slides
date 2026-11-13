/* 표지 3D 병원체 모형(이해를 돕기 위한 그림): 공 모양 막 겉에 돌기 단백질이 박혀 있고, 속에 핵산 가닥이 감겨 있다.
   «껍질 열기» 막대를 밀면 막을 위에서부터 잘라 내 속의 핵산이 드러난다. 끌어서 돌려 보고, 가만두면 천천히 돈다. */
(function () {
  'use strict';
  const TAU = Math.PI * 2;

  function mount(root) {
    const stage = root.querySelector('.vi-stage'), canvas = stage.querySelector('canvas');
    const input = root.querySelector('#vi-open'), vEl = root.querySelector('.vi-v');
    const labs = Object.fromEntries([...stage.querySelectorAll('.vi-lab')].map((e) => [e.dataset.k, e]));
    let spin = 0;
    const s = window.Scene3D.make(stage, canvas, { view: { yaw: 0.6, pitch: 0.32, dist: 9.6, target: [0, 0, 0] }, fov: 32, min: 6, max: 15, onFrame: step });
    input.addEventListener('keydown', (e) => e.stopPropagation());
    if (!s.ok) return { setActive() {}, fit() {} };
    const { T, scene, mat, group } = s;
    s.renderer.localClippingEnabled = true;
    scene.add(new T.HemisphereLight(0xffffff, 0xb9b2c9, 1.25));
    const sun = new T.DirectionalLight(0xffffff, 1.35); sun.position.set(4, 6, 5); scene.add(sun);
    const body = group();
    const R = 2;
    const clip = new T.Plane(new T.Vector3(0, -1, 0), 9);            // y ≤ 상수인 쪽만 남긴다(껍질 열기)
    const shellMat = mat('#f3c4d3', { side: T.DoubleSide, clippingPlanes: [clip] });
    const innerMat = mat('#d98aa6', { side: T.BackSide, clippingPlanes: [clip] });
    body.add(new T.Mesh(new T.SphereGeometry(R, 56, 36), shellMat));
    body.add(new T.Mesh(new T.SphereGeometry(R * 0.985, 56, 36), innerMat));
    // 돌기 단백질: 공 위에 고르게(피보나치 배치)
    const spikeMat = mat('#e2622b', { clippingPlanes: [clip] }), stalkMat = mat('#c9542a', { clippingPlanes: [clip] });
    const stalkGeo = new T.CylinderGeometry(0.06, 0.08, 0.5, 8), headGeo = new T.SphereGeometry(0.17, 12, 10);
    const N = 54, up = new T.Vector3(0, 1, 0);
    for (let i = 0; i < N; i++) {
      const y = 1 - (i + 0.5) / N * 2, r = Math.sqrt(1 - y * y), a = i * Math.PI * (3 - Math.sqrt(5));
      const n = new T.Vector3(Math.cos(a) * r, y, Math.sin(a) * r);
      const g = group(body); g.quaternion.setFromUnitVectors(up, n); g.position.copy(n).multiplyScalar(R);
      const st = new T.Mesh(stalkGeo, stalkMat); st.position.y = 0.25; g.add(st);
      const hd = new T.Mesh(headGeo, spikeMat); hd.position.y = 0.55; hd.scale.set(1.15, 0.8, 1.15); g.add(hd);
    }
    // 속의 핵산: 감긴 가닥 하나
    const pts = [];
    for (let i = 0; i <= 220; i++) {
      const u = i / 220 * TAU * 3;
      pts.push(new T.Vector3(1.15 * Math.sin(u * 1.1) * Math.cos(u * 0.37), 0.95 * Math.sin(u * 0.53 + 0.4) * Math.cos(u * 0.21), 1.15 * Math.cos(u * 0.83) * Math.sin(u * 0.47 + 1)));
    }
    const core = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 600, 0.075, 8), mat('#3a78c2'));
    body.add(core);
    const tip = new T.Vector3(0, 0, 0);
    const spikeTip = () => tip.set(R + 0.7, 0.4, 0.3).applyMatrix4(body.matrixWorld);
    s.label(labs.spike, spikeTip);
    s.label(labs.core, new T.Vector3(0, -0.2, 0));
    function apply() {
      const v = Number(input.value) / 100;
      clip.constant = R + 0.9 - v * (R + 1.3);
      vEl.textContent = v < 0.05 ? '닫힘' : v < 0.6 ? '반쯤 열림' : '활짝 열림';
      labs.core.classList.toggle('off', v < 0.35);
      if (!s.active) s.render();
    }
    function step(dt) { spin += dt * 0.25; body.rotation.y = spin; }
    input.addEventListener('input', apply);
    apply();
    root._virus = { open: (v) => { input.value = String(v); apply(); } };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.VirusModel = { mount };
})();
