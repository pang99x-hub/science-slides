/* 1차시 이론 장 «태양의 속과 수소 핵융합»(교과서 99쪽 그림 Ⅱ-17을 입체로): 4분의 1을 잘라 낸 태양을 끌어 돌리고 확대한다(orbit3d.js).
   잘린 면에 핵·복사층·대류층이 고리로 보이고, 겉은 표면. 핵 안에서는 수소 핵융합의 번쩍임이 깜빡인다.
   층이나 이름표를 누르면 그 층이 밝아지고 아래 한 줄 풀이가 바뀌며, 왼쪽 정의 상자 가운데 맞는 것이 밝아진다.
   층 두께·번쩍임 수는 이해를 돕기 위한 그림(온도는 교과서 두 값만). 시험용: root._s3.pick(k) */
(function () {
  'use strict';
  const R = 3.2, RC = 0.82, RR = 2.2;            // 겉 반지름, 핵·복사층 바깥 반지름(그림용 비율)
  const IT = {
    core: ['핵(중심부)', '가장 뜨거운 중심, 약 1500만 K. 온도·압력이 아주 높아 <b>수소 핵융합 반응</b>이 일어나는 곳'],
    rad: ['복사층', '핵에서 만든 에너지가 빛의 형태로 아주 오랜 시간 이리저리 부딪히며 바깥으로 전해지는 층'],
    conv: ['대류층', '뜨거운 기체가 올라가고 식은 기체가 내려오며 에너지를 표면까지 실어 나르는 층'],
    surf: ['표면', '약 6000 K. 에너지가 빛이 되어 <b>사방으로 퍼져 나가는</b> 곳 — 그 일부가 지구에 닿는다'],
  };

  function mount(root) {
    const stage = root.querySelector('.s3-stage'), canvas = stage.querySelector('canvas');
    const cap = root.querySelector('.s3-cap'), defs = [...root.querySelectorAll('.s3-def')];
    const s = window.Orbit.make(stage, canvas, {
      view: { yaw: -0.78, pitch: 0.32, dist: 13.5, target: [0, 0, 0] }, min: 7, max: 26, fov: 36,
      click: (e) => clickAt(e), onFrame: (dt) => tick(dt),
    });
    window.Orbit.chrome(stage, s);
    function say(k) {
      const it = IT[k];
      cap.innerHTML = `<b class="s3-nm">${it[0]}</b><span>${it[1]}</span>`;
      defs.forEach((d) => d.classList.toggle('on', (d.dataset.k || '').split(' ').includes(k)));
    }
    if (!s.ok) { root._s3 = { pick: say }; say('core'); return { setActive() {} }; }
    const { T, scene } = s;
    s.renderer.setClearColor(new T.Color('#141a2b'), 1);
    scene.children.filter((o) => o.isLight).forEach((l) => { l.intensity *= 0.9; });
    const groups = {};
    const COL = { core: '#fff3b0', rad: '#ffc552', conv: '#f28f34', surf: '#e9702a' };
    const glowMat = (c, em = 0.55) => new T.MeshStandardMaterial({ color: new T.Color(c), emissive: new T.Color(c), emissiveIntensity: em, roughness: 0.7, side: T.DoubleSide });
    // 겉: 쌀알 무늬(대류의 흔적) 그림을 입힌 껍질, 4분의 1을 잘라 냄(x<0, z>0 쪽)
    const tex = (() => {
      const cv = document.createElement('canvas'); cv.width = 512; cv.height = 256; const g = cv.getContext('2d');
      g.fillStyle = '#e9702a'; g.fillRect(0, 0, 512, 256);
      for (let i = 0; i < 2600; i++) { const x = Math.random() * 512, y = Math.random() * 256, r = 2 + Math.random() * 5; g.fillStyle = `rgba(255,${190 + Math.random() * 50 | 0},90,${0.25 + Math.random() * 0.35})`; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
      const t = new T.CanvasTexture(cv); t.colorSpace = T.SRGBColorSpace; return t;
    })();
    const shell = (r, c, map) => new T.Mesh(new T.SphereGeometry(r, 64, 48, Math.PI / 2, Math.PI * 1.5),
      map ? new T.MeshStandardMaterial({ map, emissive: new T.Color('#ff7a1a'), emissiveIntensity: 0.55, roughness: 0.8, side: T.DoubleSide }) : glowMat(c, 0.4));
    const ring = (r0, r1, c, plane) => {
      const geo = new T.RingGeometry(r0, r1, 64, 1, plane ? -Math.PI / 2 : Math.PI / 2, Math.PI);
      const m = new T.Mesh(geo, glowMat(c, 0.75));
      if (plane) m.rotation.y = -Math.PI / 2;
      return m;
    };
    const layer = (k, r0, r1, sh) => {
      const g = new T.Group(); g.add(ring(r0, r1, COL[k], 0), ring(r0, r1, COL[k], 1)); if (sh) g.add(sh);
      g.traverse((o) => { o.userData.k = k; }); scene.add(g); groups[k] = g; return g;
    };
    layer('core', 0.001, RC, null);
    layer('rad', RC, RR, null);
    layer('conv', RR, R - 0.02, null);
    const surf = shell(R, null, tex); surf.userData.k = 'surf'; scene.add(surf); groups.surf = surf;
    // 대류층 고리 위 소용돌이(올라가고 내려오는 흐름) — 잘린 면에 작은 고리 화살표
    const loops = new T.Group();
    for (let i = 0; i < 7; i++) {
      const a = Math.PI / 2 + (i + 0.5) * Math.PI / 7, rm = (RR + R) / 2;
      const c = new T.Mesh(new T.TorusGeometry(0.34, 0.035, 8, 40, Math.PI * 1.6), new T.MeshBasicMaterial({ color: '#8a3a0c' }));
      c.position.set(rm * Math.cos(a), rm * Math.sin(a), 0.03); c.rotation.z = a; loops.add(c);
    }
    loops.traverse((o) => { o.userData.k = 'conv'; }); scene.add(loops);
    // 복사층: 빛 알갱이가 갈지자로 나간다
    const zig = new T.Group();
    for (let j = 0; j < 3; j++) {
      const pts = []; let r = RC + 0.1, a = Math.PI * (0.62 + j * 0.28);
      while (r < RR - 0.05) { pts.push(new T.Vector3(r * Math.cos(a), r * Math.sin(a), 0.03)); r += 0.16 + Math.random() * 0.1; a += (Math.random() - 0.5) * 0.5; }
      zig.add(new T.Line(new T.BufferGeometry().setFromPoints(pts), new T.LineBasicMaterial({ color: '#9a5a00' })));
    }
    zig.traverse((o) => { o.userData.k = 'rad'; }); scene.add(zig);
    // 핵 안 번쩍임(수소 핵융합)
    const flashes = [];
    for (let i = 0; i < 14; i++) {
      const m = new T.Mesh(new T.SphereGeometry(0.07, 10, 8), new T.MeshBasicMaterial({ color: '#ffffff', transparent: true }));
      const a = Math.PI / 2 + Math.random() * Math.PI, r = Math.random() * (RC - 0.12);
      m.position.set(r * Math.cos(a), r * Math.sin(a), 0.05); m.userData = { k: 'core', ph: Math.random() * 6 }; scene.add(m); flashes.push(m);
    }
    // 바깥 빛무리
    const halo = new T.Mesh(new T.SphereGeometry(R * 1.12, 48, 32), new T.MeshBasicMaterial({ color: '#ffb347', transparent: true, opacity: 0.12, side: T.BackSide }));
    scene.add(halo);
    // 이름표
    const mk = (k, txt) => { const el = document.createElement('button'); el.type = 'button'; el.className = 'o3-lab s3-lab'; el.textContent = txt; el.dataset.k = k; stage.appendChild(el); el.addEventListener('click', () => pick(k)); return el; };
    const lab = {
      core: mk('core', '핵'), rad: mk('rad', '복사층'), conv: mk('conv', '대류층'), surf: mk('surf', '표면'),
    };
    s.label(lab.core, new T.Vector3(-0.15, -0.35, 0.05));
    s.label(lab.rad, new T.Vector3(-1.5, -0.25, 0.05));
    s.label(lab.conv, new T.Vector3(-2.7, -0.9, 0.05));
    s.label(lab.surf, new T.Vector3(1.4, 2.6, 1.3));
    let cur = null, t = 0;
    function pick(k) {
      cur = k; say(k);
      Object.entries(lab).forEach(([kk, el]) => el.classList.toggle('o3-pick', kk === k));
      Object.entries(groups).forEach(([kk, g]) => g.traverse((o) => { if (o.material && o.material.emissiveIntensity != null) o.material.emissiveIntensity = kk === k ? 1.15 : (kk === 'surf' ? 0.55 : 0.6); }));
      s.render();
    }
    function clickAt(e) {
      const hit = s.pick(e, [...Object.values(groups), loops, zig]);
      if (hit && hit.object.userData.k) pick(hit.object.userData.k);
    }
    function tick(dt) {
      t += dt;
      flashes.forEach((m) => { const v = Math.max(0, Math.sin(t * 5 + m.userData.ph * 3)); m.material.opacity = v; m.scale.setScalar(0.6 + v * 1.4); });
      loops.rotation.z = 0; loops.children.forEach((c, i) => { c.rotation.z += dt * 0.8 * (i % 2 ? 1 : -1); });
    }
    pick('core');
    root._s3 = { pick, s };
    return { setActive: (on) => s.setActive(on), fit: () => s.fit() };
  }
  window.Sun3D = { mount };
})();
