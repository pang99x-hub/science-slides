/* 3차시 7장 «부리 모양과 먹이»: 핀치 머리(3D). 네 부리(교과서 그림 Ⅰ-13)를 단추로 바꾸면 부리가 그 모양으로 변하고
   옆에 먹이가 놓인다. «넷 나란히»는 네 머리를 한 줄로 세워 견준다. 끌어 돌리기·확대·옮기기, 부리를 누르면 풀이.
   부리 크기·모양은 실제 비율을 단순하게 옮긴 이해를 돕기 위한 모형. 시험용: root._fh.set(i) · root._fh.all(켬) */
(function () {
  'use strict';
  const B = [
    { name: '크고 두꺼운 부리', len: 1.05, r: 0.78, w: 0.9, curve: 0.12, head: '#2f2b29', beak: '#c9a46a', food: 'seed', d: '밑동이 굵고 깊다. 큰 힘으로 <b>크고 단단한 씨앗</b>의 껍데기를 깨뜨린다.' },
    { name: '길고 뾰족한 부리', len: 1.55, r: 0.38, w: 0.8, curve: 0.16, head: '#2a2a2a', beak: '#d0b07a', food: 'cactus', d: '길고 끝이 뾰족하다. <b>선인장</b> 꽃과 열매 속 깊이 넣어 꿀·씨를 먹는다.' },
    { name: '뾰족하고 가느다란 부리', len: 1.35, r: 0.32, w: 0.75, curve: 0.04, head: '#7a6a4c', beak: '#d6bf8a', food: 'bark', d: '가늘고 곧다. 가시나 잔가지를 물고 <b>나무 구멍 속 곤충</b>을 꺼낸다(도구 사용).' },
    { name: '짧고 단단한 부리', len: 0.62, r: 0.44, w: 0.85, curve: 0.22, head: '#6e7472', beak: '#c0a070', food: 'insect', d: '짧고 단단하며 끝이 살짝 굽었다. 잎과 가지 위의 <b>곤충</b>을 집어 먹는다.' },
  ];
  function mount(root) {
    const stage = root.querySelector('.o3-stage'), canvas = stage.querySelector('canvas');
    const btns = [...root.querySelectorAll('.fh-pick button')], allB = root.querySelector('.fh-all');
    const nm = root.querySelector('.fh-name'), dd = root.querySelector('.fh-d');
    let cur = 0, many = false;
    const s = window.Orbit.make(stage, canvas, {
      view: { yaw: 1.0, pitch: 0.2, dist: 13, target: [0.9, -0.3, 0] }, min: 3, max: 26, bounds: 10, spin: 0.22,
      onFrame: () => tick(), click: (e) => clickAt(e),
    });
    window.Orbit.chrome(stage, s);
    if (!s.ok) { btns.forEach((b, i) => b.addEventListener('click', () => text(i))); text(0); return { setActive() {} }; }
    const { T, scene } = s;
    // 부리: 원뿔을 x축으로 눕히고 끝을 아래로 굽힌다(윗부리·아랫부리)
    function beakGeo(p, lower) {
      if (lower) { const g = new T.BoxGeometry(p.len * 0.8, 0.035, p.r * p.w * 1.6); g.translate(p.len * 0.4, -0.02 - p.curve * 0.15 * p.len, 0); return g; }
      const len = p.len, r = p.r;
      const g = new T.CylinderGeometry(r * 0.04, r, len, 32, 8, false); g.rotateZ(-Math.PI / 2); g.translate(len / 2, 0, 0);
      const pa = g.attributes.position;
      for (let i = 0; i < pa.count; i++) {
        let x = pa.getX(i), y = pa.getY(i), z = pa.getZ(i); const u = x / len;
        y *= 0.78;
        y -= p.curve * u * u * (lower ? 0.6 : 1) * len;
        pa.setXYZ(i, x, y, z * p.w);
      }
      g.computeVertexNormals(); return g;
    }
    function head(p) {
      const g = new T.Group();
      const skull = new T.Mesh(new T.SphereGeometry(1, 40, 28), s.mat(p.head, { roughness: 0.85 })); skull.scale.set(1.05, 0.95, 0.9);
      const neck = new T.Mesh(new T.SphereGeometry(1.25, 36, 24), s.mat(p.head, { roughness: 0.9 })); neck.position.set(-0.95, -1.15, 0); neck.scale.set(1.1, 1.0, 0.95);
      const ped = new T.Mesh(new T.CylinderGeometry(1.3, 1.5, 0.5, 40), s.mat('#c9b48a')); ped.position.set(-0.8, -2.45, 0);
      const eyes = [-1, 1].map((k) => { const e = new T.Mesh(new T.SphereGeometry(0.15, 16, 12), s.mat('#111111', { roughness: 0.2 })); e.position.set(0.42, 0.3, k * 0.78); const h = new T.Mesh(new T.SphereGeometry(0.045, 8, 6), new T.MeshBasicMaterial({ color: 0xffffff })); h.position.set(0.06, 0.06, k * 0.08); e.add(h); return e; });
      const up = new T.Mesh(beakGeo(p, false), s.mat(p.beak, { roughness: 0.45 })), lo = new T.Mesh(beakGeo(p, true), s.mat('#120e0c', { roughness: 0.9 }));
      up.position.set(0.8, 0, 0); lo.position.set(0.8, 0, 0); up.userData.beak = lo.userData.beak = true;
      g.add(skull, neck, ped, ...eyes, up, lo); g.userData = { up, lo, skull, neck, p: Object.assign({}, p) };
      scene.add(g); return g;
    }
    // 먹이 모형
    function food(kind) {
      const g = new T.Group();
      if (kind === 'seed') {
        for (let i = 0; i < 6; i++) { const m = new T.Mesh(new T.SphereGeometry(0.32, 20, 14), s.mat('#7a4a26', { roughness: 0.7 })); m.scale.set(1.3, 0.85, 1); m.position.set((i % 3) * 0.6 - 0.6, 0.25 + (i > 2 ? 0.45 : 0), (i % 2) * 0.4 - 0.2); m.rotation.z = i; g.add(m); }
      } else if (kind === 'cactus') {
        const pad = new T.Mesh(new T.SphereGeometry(1, 28, 18), s.mat('#4f9a4a')); pad.scale.set(0.6, 1.0, 0.22); pad.position.y = 1.0; g.add(pad);
        const fl = new T.Mesh(new T.ConeGeometry(0.28, 0.5, 12, 1, true), s.mat('#f2c230', { side: T.DoubleSide })); fl.position.set(0.1, 2.05, 0); fl.rotation.z = Math.PI; g.add(fl);
        for (let i = 0; i < 14; i++) { const sp = new T.Mesh(new T.CylinderGeometry(0.012, 0.012, 0.25, 4), s.mat('#f4ecd0')); const a = i * 2.4; sp.position.set(Math.cos(a) * 0.45, 1 + Math.sin(a) * 0.7, 0.2); sp.rotation.x = Math.PI / 2; g.add(sp); }
      } else if (kind === 'bark') {
        const log = new T.Mesh(new T.CylinderGeometry(0.55, 0.6, 2.6, 24), s.mat('#7a5a3a', { roughness: 1 })); log.position.y = 1.2; g.add(log);
        const hole = new T.Mesh(new T.CircleGeometry(0.2, 18), s.mat('#1a120c')); hole.position.set(0.56, 1.3, 0); hole.rotation.y = Math.PI / 2; g.add(hole);
        const grub = new T.Mesh(new T.CapsuleGeometry(0.08, 0.22, 4, 8), s.mat('#f0e2b8')); grub.position.set(0.5, 1.3, 0); grub.rotation.z = Math.PI / 2; g.add(grub);
      } else {
        for (let i = 0; i < 3; i++) { const b = new T.Mesh(new T.CapsuleGeometry(0.12, 0.35, 4, 10), s.mat('#3d5a2a')); b.rotation.z = Math.PI / 2; b.position.set(i * 0.55 - 0.5, 0.3 + (i % 2) * 0.2, i * 0.3 - 0.3); g.add(b); }
        const leaf = new T.Mesh(new T.CircleGeometry(0.9, 24), s.mat('#7fb05a', { side: T.DoubleSide })); leaf.rotation.x = -Math.PI / 2; leaf.scale.set(1.4, 0.8, 1); leaf.position.y = 0.05; g.add(leaf);
      }
      g.position.set(2.9, -2.2, 0.3); scene.add(g); return g;
    }
    const tool = new T.Mesh(new T.CylinderGeometry(0.025, 0.02, 1.6, 6), s.mat('#d9c9a0')); tool.rotation.z = -1.35; tool.visible = false; scene.add(tool);
    const solo = head(B[0]);
    const foods = B.map((p) => { const f = food(p.food); f.visible = false; return f; }); foods[0].visible = true;
    const row = B.map((p, i) => { const h = head(p); h.position.set(0, 0, (i - 1.5) * 3.2); h.visible = false; return h; });
    const lab = (txt) => { const el = document.createElement('span'); el.className = 'o3-lab fh-lab'; el.textContent = txt; stage.appendChild(el); return el; };
    const lUp = lab('윗부리'), lLo = lab('아랫부리');
    s.label(lUp, () => (many ? null : solo.localToWorld(new T.Vector3(0.8 + solo.userData.p.len * 0.45, 0.45 + solo.userData.p.r * 0.6, 0))));
    s.label(lLo, () => (many ? null : solo.localToWorld(new T.Vector3(0.8 + solo.userData.p.len * 0.4, -0.35 - solo.userData.p.r * 0.6, 0))));
    const rowL = row.map((h, i) => { const el = lab(B[i].name); s.label(el, () => (many ? h.position.clone().add(new T.Vector3(0.3, 1.5, 0)) : null)); return el; });
    void rowL;
    function tick() {
      const u = solo.userData;
      tool.visible = !many && cur === 2 && Math.abs(u.p.len - B[2].len) < 0.05;
      tool.position.set(0.82 + u.p.len + 0.25, -0.05, 0.1);
    }
    function rebuild() { const u = solo.userData; u.up.geometry.dispose(); u.lo.geometry.dispose(); u.up.geometry = beakGeo(u.p, false); u.lo.geometry = beakGeo(u.p, true); if (!s.active) s.render(); }
    function text(i) { nm.textContent = B[i].name + ' 핀치'; dd.innerHTML = B[i].d; btns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i))); }
    function set(i) {
      cur = i; text(i); if (many) all(false);
      const u = solo.userData, to = B[i];
      foods.forEach((f, k) => { f.visible = k === i; });
      u.skull.material.color.set(to.head); u.neck.material.color.set(to.head); u.up.material.color.set(to.beak);
      if (window.gsap && !window.Deck.reduce) gsap.to(u.p, { len: to.len, r: to.r, w: to.w, curve: to.curve, duration: 0.8, ease: 'power2.inOut', onUpdate: rebuild });
      else { Object.assign(u.p, { len: to.len, r: to.r, w: to.w, curve: to.curve }); rebuild(); }
    }
    function all(on) {
      many = on; allB.setAttribute('aria-pressed', String(on));
      solo.visible = !on; foods.forEach((f, k) => { f.visible = !on && k === cur; }); row.forEach((h) => { h.visible = on; });
      if (on) { s.look({ yaw: 1.25, pitch: 0.25, dist: 17, target: [0.4, 0, 0] }, 1.0); nm.textContent = '네 부리 나란히'; dd.innerHTML = '돌려 가며 <b>두께·길이·끝 모양</b>을 견주어 보자. 먹이가 다르면 유리한 부리도 다르다.'; btns.forEach((b) => b.setAttribute('aria-pressed', 'false')); }
      else { s.reset(); text(cur); }
      if (!s.active) s.render();
    }
    function clickAt(e) {
      const objs = many ? row.flatMap((h) => [h.userData.up, h.userData.lo]) : [solo.userData.up, solo.userData.lo];
      const h = s.pick(e, objs); if (!h) return;
      if (many) { const i = row.findIndex((r) => r.userData.up === h.object || r.userData.lo === h.object); set(i); }
      else dd.innerHTML = B[cur].d + ' <b>' + (h.object === solo.userData.up ? '윗부리' : '아랫부리') + '</b>를 눌렀다.';
    }
    btns.forEach((b, i) => b.addEventListener('click', () => set(i)));
    allB.addEventListener('click', () => all(!many));
    text(0);
    root._fh = { set, all };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.EvFinch3D = { mount };
})();
