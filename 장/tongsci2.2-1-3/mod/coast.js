/* 3차시 표지(교과서 90쪽 «2100년에 지구는 어떻게 변해 있을까?»): 3D 바닷가 마을.
   그림 밑 갈림길 손잡이를 A(배출 매우 높음)·B(배출 낮음) 쪽으로 젖히면 2020 → 2100년이 흐르며 바닷물이 오른다.
   2100년 해수면 상승(1995~2014년 대비, 가능성이 높은 범위): A 0.63~1.01 m, B 0.32~0.62 m — IPCC 제6차 평가 보고서(제1실무그룹 요약본).
   마을의 높이는 m 단위(바닷가 땅은 완만하게 높아진다), 해마다 오르는 모양((연도−2020)/80)^1.4과 마을 모양은 이해를 돕기 위한 예.
   기온 변화량은 교과서 90쪽 그래프에서 읽은 값. */
(function () {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const SL = { A: [0.63, 1.01], B: [0.32, 0.62] };
  const TEMP = { A: [1.25, 1.42, 1.6, 1.78, 1.95, 2.15, 2.35, 2.57, 2.8, 3.02, 3.25, 3.5, 3.75, 4.0, 4.25, 4.5, 4.72], B: [1.25, 1.4, 1.5, 1.54, 1.56, 1.56, 1.56, 1.54, 1.52, 1.5, 1.47, 1.45, 1.42, 1.4, 1.37, 1.35, 1.32] };
  const tAt = (k, y) => { const u = (y - 2020) / 5, i = clamp(Math.floor(u), 0, 15), f = clamp(u - i, 0, 1); return TEMP[k][i] + (TEMP[k][i + 1] - TEMP[k][i]) * f; };

  function mount(root) {
    const stage = root.querySelector('.co-stage'), canvas = stage.querySelector('canvas');
    const now = stage.querySelector('.co-now'), yrEl = stage.querySelector('.co-yr'), rd = root.querySelector('.co-read');
    const labs = Object.fromEntries([...stage.querySelectorAll('.co-lab')].map((e) => [e.dataset.k, e]));
    const lever = root.querySelector('.co-lever'), knob = lever.querySelector('.co-knob');
    let path = null, year = 2020, tm = 0;
    const s = window.Scene3D.make(stage, canvas, { view: { yaw: -0.55, pitch: 0.42, dist: 30, target: [1, 1, 0] }, fov: 34, min: 18, max: 44, onFrame: frame });
    if (!s.ok) return { setActive() {}, fit() {} };
    const { T, scene, inked, mat, group } = s;
    s.renderer.setClearColor(new T.Color('#d6ebf5'), 1);
    scene.add(new T.HemisphereLight(0xffffff, 0x99a58a, 1.7));
    const sun = new T.DirectionalLight(0xfff1d6, 1.4); sun.position.set(-10, 20, 12); scene.add(sun);
    // 땅: x < 0 바다 쪽으로 낮아지는 해변(높이 m = 0.12·x), 위쪽은 마을
    const gw = 40, gd = 26, seg = 80;
    const gGeo = new T.PlaneGeometry(gw, gd, seg, 10); gGeo.rotateX(-Math.PI / 2);
    const hOf = (x) => (x < -6 ? (x + 6) * 0.3 : x < 10 ? (x + 6) * 0.1 : 1.6 + (x - 10) * 0.25);   // 바닷가 땅 높이(m), 해안선 x = −6
    const gp = gGeo.attributes.position;
    for (let i = 0; i < gp.count; i++) { const x = gp.getX(i) + 6; gp.setY(i, hOf(x)); }
    gGeo.computeVertexNormals();
    const ground = new T.Mesh(gGeo, mat('#d9c99a')); ground.position.x = 6; scene.add(ground);
    const Y = (m) => m;   // 장면 높이 1 = 1 m(집·땅 모양은 과장)
    // 집들(바닷가에서 가까운 것일수록 낮은 곳)
    const houses = [];
    [[-3.5, -6, '#f4efe6'], [-2.5, 0, '#e8d5c0'], [-3, 6, '#f4efe6'], [0.5, -8, '#dfe8f1'], [1.2, -2, '#f4efe6'], [0.8, 4.5, '#e8d5c0'], [4, -5, '#f4efe6'], [4.5, 1.5, '#dfe8f1'], [5, 8, '#f4efe6'], [8, -2, '#e8d5c0'], [8.5, 5, '#f4efe6']].forEach(([x, z, c]) => {
      const g = group(); const h0 = hOf(x);
      const body = inked(new T.BoxGeometry(2, 1.6, 2), c); body.position.y = 0.8; g.add(body);
      const roof = inked(new T.ConeGeometry(1.7, 1.1, 4), '#c96f55'); roof.position.y = 2.15; roof.rotation.y = Math.PI / 4; g.add(roof);
      g.position.set(x, h0, z); houses.push({ g, body, h: h0 });
    });
    // 방파제·배·나무
    const pier = inked(new T.BoxGeometry(8, 0.3, 1.2), '#9aa3ae'); pier.position.set(-10, 0.3, -9); scene.add(pier);
    const boat = group(); { const hull = inked(new T.BoxGeometry(2.4, 0.6, 1), '#3a78c2'); boat.add(hull); const cab = inked(new T.BoxGeometry(0.9, 0.7, 0.8), '#ffffff'); cab.position.set(0.3, 0.65, 0); boat.add(cab); }
    [[6, 9], [9, -8], [11, 2], [-1, 10]].forEach(([x, z]) => { const t = inked(new T.SphereGeometry(0.9, 12, 9), '#6fa45a'); t.position.set(x, hOf(x) + 1.6, z); scene.add(t); const tr = inked(new T.CylinderGeometry(0.15, 0.2, 1, 6), '#8c6b4b'); tr.position.set(x, hOf(x) + 0.5, z); scene.add(tr); });
    // 바다
    const sea = new T.Mesh(new T.PlaneGeometry(90, 60, 1, 1), new T.MeshLambertMaterial({ color: 0x3f86c4, transparent: true, opacity: 0.86 }));
    sea.rotation.x = -Math.PI / 2; sea.position.set(-30, 0, 0); scene.add(sea);
    // 조위계(눈금 기둥): 0·0.5·1.0 m
    const gauge = group(); gauge.position.set(-4.5, 0, -11);
    const pole = inked(new T.BoxGeometry(0.3, 1.6, 0.3), '#ffffff'); pole.position.y = 0.6; gauge.add(pole);
    [0, 0.5, 1].forEach((m) => { const b = new T.Mesh(new T.BoxGeometry(0.6, 0.05, 0.36), new T.MeshBasicMaterial({ color: 0x1d2433 })); b.position.y = m; gauge.add(b); });
    const band = new T.Mesh(new T.BoxGeometry(0.42, 1, 0.42), new T.MeshBasicMaterial({ color: 0xf2a516, transparent: true, opacity: 0.55 })); gauge.add(band);
    s.label(labs.gauge, new T.Vector3(-4.5, 2.1, -11));
    s.label(labs.town, new T.Vector3(4, 4.4, 0));
    function lev() { if (!path) return 0; const [a, b] = SL[path], mid = (a + b) / 2; return mid * Math.pow(clamp((year - 2020) / 80, 0, 1), 1.4); }
    function paint() {
      const L = lev();
      sea.position.y = Y(L);
      boat.position.set(-12, Y(L) + 0.2, -6); boat.rotation.z = Math.sin(tm * 1.5) * 0.04;
      let wet = 0;
      houses.forEach((h) => { const f = L > h.h + 0.02; h.body.material.color.set(f ? '#9cc3df' : h.body.material.userData.c || (h.body.material.userData.c = '#' + h.body.material.color.getHexString())); if (f) wet++; });
      if (path) { const [a, b] = SL[path]; band.visible = true; band.scale.y = b - a; band.position.y = (a + b) / 2; } else band.visible = false;
      yrEl.textContent = `${Math.round(year)}년`;
      if (!path) { rd.innerHTML = '손잡이를 A나 B로 젖히자'; now.textContent = '아래 손잡이를 A 또는 B로 젖혀 보자'; return; }
      const k = path;
      rd.innerHTML = `<b>${k === 'A' ? 'A 배출 매우 높음' : 'B 배출 낮음'}</b> · 기온 변화량 약 ${tAt(k, year).toFixed(1)} °C · 바닷물 +${L.toFixed(2)} m` + (year >= 2099.5 ? ` <span>(2100년 범위 ${SL[k][0]}~${SL[k][1]} m)</span>` : '');
      now.textContent = year < 2099.5 ? '시간이 흐르는 중…' : wet ? `2100년 · 바닷가 집 ${wet}채가 물에 잠겼다` : '2100년 · 바닷물은 올랐지만 집은 아직 괜찮다';
      now.classList.toggle('done', year >= 2099.5);
    }
    function frame(dt) {
      tm += dt;
      if (path && year < 2100) year = Math.min(2100, year + dt * 10);
      sea.material.color.setHSL(0.58, 0.5, 0.48 + Math.sin(tm * 0.8) * 0.01);
      paint();
    }
    // 손잡이 젖히기(SVG): 가운데 → 왼쪽 A, 오른쪽 B
    const svg = lever.querySelector('svg');
    let drag = false, kx = 0;
    const put = (x) => { kx = clamp(x, -80, 80); knob.setAttribute('transform', `translate(${(160 + kx).toFixed(1)} 0)`); knob.querySelector('.co-stick').setAttribute('x2', (-kx * 0.6).toFixed(1)); };
    function choose(k) {
      put(k === 'A' ? -80 : k === 'B' ? 80 : 0);
      if (k !== path) { path = k; year = 2020; }
      lever.querySelectorAll('.co-side').forEach((t) => t.classList.toggle('on', t.dataset.k === k));
      if (window.Stage.reduce) year = 2100;
      paint(); if (!s.active) s.render();
    }
    const sx = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()).x - 160; };
    knob.addEventListener('pointerdown', (e) => { drag = true; e.stopPropagation(); try { knob.setPointerCapture(e.pointerId); } catch { /* 합성 */ } });
    knob.addEventListener('pointermove', (e) => { if (drag) put(sx(e)); });
    const up = () => { if (!drag) return; drag = false; choose(kx < -30 ? 'A' : kx > 30 ? 'B' : path); };
    knob.addEventListener('pointerup', up); knob.addEventListener('pointercancel', up);
    knob.addEventListener('keydown', (e) => { const k = { ArrowLeft: 'A', ArrowRight: 'B' }[e.key]; if (k) { e.preventDefault(); e.stopPropagation(); choose(k); } });
    lever.querySelectorAll('.co-side').forEach((t) => t.addEventListener('click', () => choose(t.dataset.k)));
    put(0); paint();
    root._coast = { choose, end() { year = 2100; paint(); s.render(); } };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.Coast = { mount };
})();
