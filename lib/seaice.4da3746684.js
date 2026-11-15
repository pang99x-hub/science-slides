/* 1차시 표지(교과서 69·71·82쪽 도입): 3D 북극 바다. 바다 얼음 조각 위에 북극곰, 얼음 사이 숨구멍 옆에 물범.
   바다(그림 어디든)를 누르고 있는 동안(스페이스·Enter를 누르고 있어도) «따뜻해진 정도» w가 오른다 → 얼음 조각이 가장자리부터
   작아지며 서로 벌어지고, 물범의 얼음이 사라지면 물범은 물속으로, 곰의 얼음은 마지막까지 줄어든다. 떼면 멈춘다.
   w와 녹는 순서는 이해를 돕기 위한 예(숫자는 보이지 않는다). */
(function () {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // 늘 같은 모양이 나오게 하는 난수
  function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }

  function mount(root) {
    const stage = root.querySelector('.ic-stage'), canvas = stage.querySelector('canvas');
    const labs = Object.fromEntries([...stage.querySelectorAll('.ic-lab')].map((e) => [e.dataset.k, e]));
    const now = stage.querySelector('.ic-now'), bar = stage.querySelector('.ic-warm em');
    let holding = false, w = 0, tm = 0;
    const s = window.Scene3D.make(stage, canvas, { view: { yaw: 0.55, pitch: 0.55, dist: 23, target: [0, 0, 0.5] }, fov: 34, min: 14, max: 40, onFrame: frame });
    if (!s.ok) return { setActive() {}, fit() {} };
    const { T, scene, inked, mat, group } = s;
    s.renderer.setClearColor(new T.Color('#cfe3ee'), 1);
    scene.add(new T.HemisphereLight(0xffffff, 0x9fb4c4, 2.1));
    const sun = new T.DirectionalLight(0xfff1d6, 1.6); sun.position.set(-20, 14, 10); scene.add(sun);
    // 바다
    const sea = new T.Mesh(new T.CircleGeometry(90, 64), new T.MeshLambertMaterial({ color: new T.Color('#2f6690') }));
    sea.rotation.x = -Math.PI / 2; scene.add(sea);
    const seaC0 = new T.Color('#2f6690'), seaC1 = new T.Color('#1f4e74');
    // 얼음 조각: 엇갈린 격자 위에 각진 원판. melt = 녹아 없어지는 따뜻함(가운데일수록 늦게)
    const R = rng(7), floes = [];
    for (let i = -6; i <= 6; i++) for (let j = -6; j <= 6; j++) {
      const x = i * 2.05 + (j % 2) * 1.0 + (R() - 0.5) * 0.5, z = j * 1.8 + (R() - 0.5) * 0.5, d = Math.hypot(x, z * 1.15);
      if (d > 12.5) continue;
      const r = 1.05 + R() * 0.35, sides = 6 + Math.floor(R() * 3);
      const geo = new T.CylinderGeometry(r, r * 0.92, 0.42, sides); geo.translate(0, 0.08, 0);
      const m = inked(geo, mat(R() > 0.5 ? '#ffffff' : '#eef6fb', { emissive: new T.Color(R() > 0.5 ? '#c9dbe6' : '#bcd2e0') }));
      m.position.set(x, 0, z); m.rotation.y = R() * 3;
      scene.add(m);
      floes.push({ m, x, z, melt: clamp(0.08 + (1 - d / 12.5) * 0.85 + (R() - 0.5) * 0.18, 0.06, 0.95) });
    }
    // 곰이 선 얼음은 가장 늦게, 물범 얼음은 중간쯤 녹는다
    const near = (x, z) => floes.reduce((a, f) => (Math.hypot(f.x - x, f.z - z) < Math.hypot(a.x - x, a.z - z) ? f : a));
    const bearF = near(0.4, 0.2); bearF.melt = 1.08;
    const sealF = near(-6.2, 3.6); sealF.melt = 0.42;
    // 북극곰(공과 원기둥으로)
    const bear = group(); const fur = mat('#f1ead8');
    const body = inked(new T.SphereGeometry(0.95, 18, 14), fur); body.scale.set(1.45, 0.82, 0.82); body.position.y = 1.15; bear.add(body);
    const head = inked(new T.SphereGeometry(0.5, 16, 12), fur); head.position.set(1.55, 1.42, 0); bear.add(head);
    const snout = inked(new T.SphereGeometry(0.24, 12, 10), fur); snout.position.set(2.0, 1.32, 0); bear.add(snout);
    const nose = new T.Mesh(new T.SphereGeometry(0.09, 8, 6), new T.MeshBasicMaterial({ color: 0x1d2433 })); nose.position.set(2.22, 1.36, 0); bear.add(nose);
    [[0.3, -0.45], [0.3, 0.45]].forEach(([y, z]) => { const e = inked(new T.SphereGeometry(0.13, 8, 6), fur); e.position.set(1.4, 1.82 + y * 0, z * 0.6); bear.add(e); });
    const legs = [[-0.8, -0.38], [-0.8, 0.38], [0.8, -0.38], [0.8, 0.38]].map(([x, z]) => { const l = inked(new T.CylinderGeometry(0.24, 0.26, 0.85, 10), fur); l.position.set(x, 0.55, z); bear.add(l); return l; });
    bear.position.set(bearF.x, 0.3, bearF.z); bear.rotation.y = -0.5; bear.scale.setScalar(1.15);
    // 물범
    const seal = group(); const sk = mat('#7f8a96');
    const sb = inked(new T.SphereGeometry(0.5, 14, 10), sk); sb.scale.set(1.7, 0.6, 0.75); sb.position.y = 0.45; seal.add(sb);
    const sh = inked(new T.SphereGeometry(0.3, 12, 9), sk); sh.position.set(0.8, 0.7, 0); seal.add(sh);
    seal.position.set(sealF.x, 0.3, sealF.z); seal.rotation.y = 0.8;
    // 숨구멍(물범 얼음 옆의 어두운 원)
    const hole = new T.Mesh(new T.CircleGeometry(0.45, 20), new T.MeshBasicMaterial({ color: 0x1d3e5c })); hole.rotation.x = -Math.PI / 2; hole.position.set(sealF.x + 1.1, 0.31, sealF.z - 0.4); scene.add(hole);
    s.label(labs.bear, () => new T.Vector3(bear.position.x, bear.position.y + 2.6, bear.position.z));
    s.label(labs.seal, () => new T.Vector3(seal.position.x, seal.position.y + 1.5, seal.position.z));

    // 누르고 있기: 그림 어디를 눌러도 잡힌다(둘러보기 대신)
    // 움직임 줄이기 설정이면 장면의 그리기 반복이 멈춰 있으므로, 누르는 동안만 따로 돌린다
    let own = 0, ownT = 0;
    function ownTick(t) { own = 0; if (!holding) return; frame(clamp((t - ownT) / 1000, 0, 0.05)); ownT = t; s.render(); own = requestAnimationFrame(ownTick); }
    function hold(on) {
      holding = on; stage.classList.toggle('ic-hot', on);
      if (on && !s.active && !own) { ownT = performance.now(); own = requestAnimationFrame(ownTick); }
    }
    s.grab(() => true, () => { hold(true); return { move() {}, up() { hold(false); } }; });
    canvas.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); if (!e.repeat) hold(true); } });
    canvas.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') hold(false); });
    canvas.addEventListener('blur', () => hold(false));
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    root.querySelector('.ic-reset').addEventListener('click', () => { w = 0; paint(); if (!s.active) s.render(); });

    function paint() {
      const spread = 1 + w * 0.22;
      floes.forEach((f) => {
        const k = clamp((f.melt - w) / 0.16, 0, 1);
        f.m.visible = k > 0.02;
        f.m.scale.set(0.25 + 0.75 * k, 1, 0.25 + 0.75 * k);
        f.m.position.set(f.x * spread, -0.3 * (1 - k), f.z * spread);
      });
      const bk = clamp((bearF.melt - w) / 0.16, 0, 1);
      bear.position.set(bearF.x * spread, 0.3 - 0.3 * (1 - bk), bearF.z * spread);
      const sk2 = clamp((sealF.melt - w) / 0.16, 0, 1);
      seal.visible = sk2 > 0.35; hole.visible = sk2 > 0.35;
      seal.position.set(sealF.x * spread, 0.3, sealF.z * spread); hole.position.set(sealF.x * spread + 1.1, 0.31, sealF.z * spread - 0.4);
      labs.seal.textContent = seal.visible ? '물범' : '물범은 떠났다';
      sea.material.color.copy(seaC0).lerp(seaC1, w);
      bar.style.width = (w * 100).toFixed(1) + '%';
      const left = floes.filter((f) => f.m.visible).length / floes.length;
      now.textContent = w < 0.02 ? '바다를 꾹 누르고 있어 보자'
        : left > 0.6 ? (holding ? '따뜻해지는 중… 얼음 가장자리가 녹는다' : '떼면 멈춘다 · 더 눌러 보자')
        : left > 0.25 ? '얼음이 쪼개지고 물범의 쉼터가 사라졌다'
        : '곰이 설 얼음만 겨우 남았다 · 사냥터가 없다';
      now.classList.toggle('done', left <= 0.25);
    }
    function frame(dt) {
      tm += dt;
      if (holding) w = clamp(w + dt * 0.11, 0, 1);
      // 물결에 얼음이 살짝 흔들린다
      floes.forEach((f, i) => { if (f.m.visible) f.m.rotation.z = Math.sin(tm * 1.2 + i) * 0.015; });
      legs.forEach((l, i) => { l.rotation.z = w > 0.9 ? Math.sin(tm * 6 + i) * 0.15 : 0; });
      paint();
    }
    paint();
    root._ice = { set(v) { w = clamp(v, 0, 1); paint(); s.render(); }, get w() { return w; }, hold }; 
    return { setActive: s.setActive, fit: s.fit };
  }
  window.SeaIce = { mount };
})();
