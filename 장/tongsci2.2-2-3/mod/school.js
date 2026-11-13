/* 실행 «우리 학교에 설치해 보기»(교과서 116쪽)를 3D로. 교실동·체육관·급식실·운동장 햇빛 가림막·현관 계단이 있는 학교를 끌어 둘러보고,
   하늘의 해를 끌어 시각을 바꾸면 그림자가 돈다. 북쪽 교실 창가는 하루 종일 교실동 그늘이다.
   아래 장치(태양광 패널 둘·태양열 집열판·소형 풍력·소형 수력·압전 바닥)를 학교의 자리 핀에 끌어 놓으면 그 자리에 3D 장치가 생기고,
   오른쪽 카드에 원리·필요한 조건·이 자리의 평가가 뜬다. 햇빛 장치가 만드는 양은 하루 동안 그 자리에 해가 드는 정도(건물 그늘을 따져)로 셈한다.
   장치만으로는 학교가 쓰는 전기에 조금 모자라게 해 두었다 → 아끼기(발광 다이오드 조명·대기 전력 끄기)를 함께 해야 자가발전에 닿는다. 값은 비교를 위한 그림. */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const DEV = { pv: '태양광 패널', st: '태양열 집열판', wd: '소형 풍력', hy: '소형 수력', pz: '압전 바닥' };
  const INFO = {
    pv: { how: '빛에너지 → 전기 에너지', need: '그늘 없이 햇빛이 오래 드는 곳' },
    st: { how: '햇빛의 열로 물을 데운다', need: '햇빛이 강하게 오래 드는 곳' },
    wd: { how: '바람의 운동 에너지 → 전기 에너지', need: '바람이 세고 자주 부는 곳' },
    hy: { how: '떨어지는 물의 위치 에너지 → 전기 에너지', need: '높이 차가 있고 물이 흐르는 곳' },
    pz: { how: '누르는 힘 → 전기 에너지(압전 소자)', need: '사람이 많이 밟는 곳' },
  };
  const NEED = { pv: '햇빛', st: '햇빛', wd: '센 바람', hy: '떨어지는 물', pz: '밟는 사람' };
  // 자리: 장치가 놓일 점, 햇빛 장치의 크기(sun — 하루 동안 해가 드는 정도를 곱한다), 바람·물·사람 몫(out)
  const ZONES = [
    { k: 'roof', name: '옥상', yaw: -0.38, at: [-1, 6.95, -3], tag: '햇빛 · 바람 조금', sun: { pv: 3, st: 2 }, out: { wd: 1 } },
    { k: 'canopy', name: '운동장 햇빛 가림막', yaw: -0.5, at: [-9, 2.8, 3.7], tag: '햇빛', sun: { pv: 2, st: 1 }, out: {} },
    { k: 'passage', name: '체육관·급식실 사이 통로', yaw: 1.1, at: [10.5, 2.2, 0.3], tag: '센 바람이 지나는 길', sun: { pv: 0.5, st: 0.3 }, out: { wd: 2 } },
    { k: 'gutter', name: '급식실 빗물관', yaw: -0.2, at: [7.0, 0.7, 7.6], tag: '비 오면 떨어지는 빗물', sun: { pv: 0.3, st: 0.2 }, out: { hy: 1 } },
    { k: 'stairs', name: '현관 계단', yaw: 0.1, at: [-1, 0.6, -0.35], tag: '오가는 사람이 많다', sun: { pv: 0.4, st: 0.2 }, out: { pz: 1, wd: 0.1 } },
    { k: 'north', name: '북쪽 교실 창가', yaw: Math.PI - 0.45, at: [-4.5, 3.4, -5.5], tag: '교실동 북쪽 벽', sun: { pv: 1, st: 0.6 }, out: { wd: 0.3 } },
  ];
  const USE = 10, MAX = 10;
  const VIEW = { yaw: -0.38, pitch: 0.5, dist: 46, target: [1, 2.5, 0.5] };
  const jong = (w) => (w.charCodeAt(w.length - 1) - 0xac00) % 28;   // 받침
  const ig = (w) => (jong(w) ? '이' : '가'), eul = (w) => (jong(w) ? '을' : '를');
  const fmt = (h) => { const mins = Math.round(h * 6) * 10, hh = Math.floor(mins / 60), m = mins % 60; const a = hh < 6 ? '새벽' : hh < 12 ? '오전' : hh === 12 ? '낮' : hh < 18 ? '오후' : '저녁'; return `${a} ${hh % 12 === 0 ? 12 : hh % 12}${m ? `:${String(m).padStart(2, '0')}` : '시'}`; };

  function mount(root) {
    const stage = root.querySelector('.sc-stage'), canvas = stage.querySelector('canvas'), msg = root.querySelector('.sc-msg'), goal = root.querySelector('.sc-goal');
    const devs = [...root.querySelectorAll('.sc-dev')], uBar = root.querySelector('.sc-bar.use i'), mBar = root.querySelector('.sc-bar.make i');
    const led = root.querySelector('#sc-led'), idle = root.querySelector('#sc-idle'), clock = root.querySelector('.sc-clock');
    const card = { name: root.querySelector('.sc-cn'), body: root.querySelector('.sc-ci') };
    const s = window.Scene3D.make(stage, canvas, { view: VIEW, shadows: true, fov: 36, min: 14, max: 70, pmin: 0.15, pmax: 1.3, onFrame: step, onRender: pinView });
    if (!s.ok) return { setActive() {}, fit() {} };
    const { T, scene, inked, mat, group } = s;
    const solids = [];
    const box = (w, h, d, color, x, y, z, parent, solid = true) => { const m = inked(new T.BoxGeometry(w, h, d), color); m.position.set(x, y, z); (parent || scene).add(m); if (solid) solids.push(m); return m; };
    const flat = (m) => { m.castShadow = false; return m; };

    // 땅·운동장·길
    flat(box(42, 0.6, 32, '#b9d7a6', 0, -0.3, 0, null, false));
    flat(box(16, 0.04, 4.2, '#d8d3c8', -1, 0.02, 2.9, null, false));
    flat(box(9.5, 0.05, 7, '#d9b98a', -9, 0.03, 7.6, null, false));
    const lines = new T.LineSegments(new T.EdgesGeometry(new T.PlaneGeometry(7.5, 5).rotateX(-Math.PI / 2)), new T.LineBasicMaterial({ color: 0xffffff }));
    lines.position.set(-9, 0.07, 7.6); scene.add(lines);
    // 교실동(3층): 남쪽·북쪽 벽에 창
    box(14, 6.6, 4.5, '#f1ede4', -1, 3.3, -3);
    box(14.4, 0.3, 4.9, '#d6d0c4', -1, 6.75, -3);
    const winMat = mat('#bcd6ea');
    for (let f = 0; f < 3; f++) for (let i = 0; i < 7; i++) {
      if (!(f === 0 && i === 3)) box(1.1, 1.0, 0.06, winMat, -7 + i * 2, 1.3 + f * 2.1, -0.72, null, false);
      box(1.1, 1.0, 0.06, winMat, -7 + i * 2, 1.3 + f * 2.1, -5.28, null, false);
    }
    box(1.6, 1.7, 0.06, '#9b7653', -1, 0.85, -0.72, null, false);
    for (let k = 0; k < 3; k++) box(3.6, 0.18 * (k + 1), k === 2 ? 1.1 : 0.5, '#c9cfd3', -1, 0.09 * (k + 1), k === 2 ? -0.2 : 1.05 - k * 0.5);
    // 체육관(둥근 지붕)
    box(6, 4, 6, '#e7e1d3', 10.5, 2, -4.5);
    const vault = inked(new T.CylinderGeometry(3, 3, 6, 28, 1, false, Math.PI / 2, Math.PI).rotateX(Math.PI / 2), '#8fa9c4', { side: T.DoubleSide });
    vault.scale.set(1, 0.45, 1); vault.position.set(10.5, 4, -4.5); scene.add(vault); solids.push(vault);
    // 급식실(맞배지붕) · 빗물 홈통과 빗물관
    box(6, 3.2, 5, '#f1ede4', 10.5, 1.6, 4.5);
    const tri = new T.Shape(); tri.moveTo(-2.7, 0); tri.lineTo(2.7, 0); tri.lineTo(0, 1.3); tri.closePath();
    const roofGeo = new T.ExtrudeGeometry(tri, { depth: 6.4, bevelEnabled: false }); roofGeo.translate(0, 3.2, 0); roofGeo.rotateY(Math.PI / 2); roofGeo.translate(7.3, 0, 4.5);
    const croof = inked(roofGeo, '#c97a5e'); scene.add(croof); solids.push(croof);
    for (let i = 0; i < 3; i++) box(1.1, 0.9, 0.06, winMat, 8.6 + i * 1.9, 1.6, 7.03, null, false);
    box(6.4, 0.16, 0.22, '#8d96a3', 10.5, 3.15, 7.25, null, false);
    const pipe = inked(new T.CylinderGeometry(0.1, 0.1, 3.2, 10), '#8d96a3', null, true); pipe.position.set(7.4, 1.6, 7.25); scene.add(pipe);
    // 운동장 햇빛 가림막
    [[-11.3, 2.9], [-6.7, 2.9], [-11.3, 4.5], [-6.7, 4.5]].forEach(([x, z]) => { const p = inked(new T.CylinderGeometry(0.08, 0.08, 2.6, 8), '#7b8597', null, true); p.position.set(x, 1.3, z); scene.add(p); });
    box(5, 0.12, 2, '#e3e9ee', -9, 2.66, 3.7);
    // 나무
    [[-15, -6], [-16, 0], [4.5, -8.5], [16.5, -1], [16.5, 8.5], [2.5, 9.5], [-3, 10]].forEach(([x, z]) => {
      const tr = group(); tr.position.set(x, 0, z);
      const trunk = inked(new T.CylinderGeometry(0.14, 0.18, 1, 8), '#9b7653', null, true); trunk.position.y = 0.5; tr.add(trunk);
      const top = inked(new T.ConeGeometry(1, 2.4, 10), '#5fa25a'); top.position.y = 2.1; tr.add(top); solids.push(top);
    });
    // 계단을 오가는 사람
    const people = [0, 1, 2].map((i) => {
      const g = group(); const c = ['#e2622b', '#3a78c2', '#3fae6a'][i];
      const b = inked(new T.CylinderGeometry(0.2, 0.22, 0.75, 10), c, null, true); b.position.y = 0.42; g.add(b);
      const h = inked(new T.SphereGeometry(0.19, 12, 8), '#f2d2b3', null, true); h.position.y = 0.98; g.add(h);
      return { g, x: -2.1 + i * 1.1, ph: i * 0.37 };
    });
    // 통로를 지나는 바람(북 → 남)
    const NW = 16, wPos = new Float32Array(NW * 6), wGeo = new T.BufferGeometry(); wGeo.setAttribute('position', new T.BufferAttribute(wPos, 3));
    const wind = new T.LineSegments(wGeo, new T.LineBasicMaterial({ color: 0x3f7fb8, transparent: true, opacity: 0.75 })); wind.frustumCulled = false; scene.add(wind);
    const wSeeds = Array.from({ length: NW }, (_, i) => ({ x: 8.6 + Math.random() * 3.8, y: 0.6 + Math.random() * 3, z: -8 + (i / NW) * 17 }));

    // 해: 끌면 시각이 바뀌고 그림자가 돈다
    const rig = window.Scene3D.sunRig(s, { R: 19, H: 0.9, south: 0.45, t0: 10, shadow: 27, onChange: (t) => { if (clock) clock.textContent = fmt(t); } });
    const ray = new T.Raycaster();
    const lit = (p, d) => { ray.set(p, d); ray.far = 80; return ray.intersectObjects(solids, false).length === 0; };
    scene.updateMatrixWorld(true);
    const Z = ZONES.map((z) => {
      const p = new T.Vector3(...z.at);
      let a = 0, b = 0;
      for (let t = 6.25; t < 18; t += 0.5) { const d = rig.dirAt(t); if (d.y <= 0) continue; b += d.y; if (lit(p, d)) a += d.y; }
      const frac = b ? a / b : 0, val = {};
      Object.keys(DEV).forEach((d) => { val[d] = z.sun[d] ? +(z.sun[d] * Math.max(0.1, frac)).toFixed(2) : z.out[d] || 0; });
      return { ...z, p, frac, val, dev: null, btn: null, obj: null, now: true, pin: stage.querySelector(`.sc-pin[data-z="${z.k}"]`) };
    });
    const BEST = Object.fromEntries(Object.keys(DEV).map((d) => [d, Math.max(...Z.map((z) => z.val[d]))]));
    Z.forEach((z) => s.label(z.pin, z.p.clone().add(new T.Vector3(0, 1.5, 0))));

    // 장치 3D
    const pvMat = mat('#24477f'); pvMat.emissive = new T.Color('#5d8fe0');
    function build(d, z) {
      const g = group(); g.position.copy(z.p); const wall = z.k === 'north';
      if (d === 'pv' || d === 'st') {
        const n = z.k === 'roof' || z.k === 'canopy' ? 2 : 1;
        for (let i = 0; i < n; i++) {
          const m = d === 'pv' ? new T.MeshLambertMaterial({ color: pvMat.color, emissive: pvMat.emissive, emissiveIntensity: 0 }) : mat('#2b3242', { emissive: new T.Color('#ff7a45'), emissiveIntensity: 0 });
          const p = inked(new T.BoxGeometry(d === 'pv' ? 1.6 : 1.4, 0.08, 1.0), m); p.position.set((i - (n - 1) / 2) * 1.8, wall ? 0 : 0.35, 0);
          p.rotation.x = wall ? -1.25 : 0.5; g.add(p); g.userData.glow = (g.userData.glow || []).concat(m);
        }
        if (d === 'st') { const tk = inked(new T.CylinderGeometry(0.25, 0.25, 1.2, 12).rotateZ(Math.PI / 2), '#c9d6df'); tk.position.set(0, wall ? 0.75 : 0.95, wall ? 0.15 : -0.45); g.add(tk); }
      }
      if (d === 'wd') {
        const pole = inked(new T.CylinderGeometry(0.06, 0.08, 2.2, 8), '#eef2f1', null, true); pole.position.y = 1.1; g.add(pole);
        const rot = group(g); rot.position.set(0, 2.2, -0.2);
        for (let k = 0; k < 3; k++) { const arm = group(rot); arm.rotation.z = k * TAU / 3; const bl = inked(new T.BoxGeometry(0.16, 1.0, 0.04), '#f6f8f7'); bl.position.y = 0.52; arm.add(bl); }
        rot.add(inked(new T.SphereGeometry(0.12, 10, 8), '#dfe5e8', null, true));
        g.userData.spin = rot; g.userData.rate = 2 + 4 * (z.out.wd || 0);
      }
      if (d === 'hy') {
        const wheel = group(g); wheel.position.set(0.4, -0.2, -0.1); wheel.rotation.y = Math.PI / 2;
        wheel.add(inked(new T.TorusGeometry(0.42, 0.06, 6, 20), '#cfe3f2', null, true));
        for (let k = 0; k < 8; k++) { const pd = inked(new T.BoxGeometry(0.1, 0.36, 0.3), '#3a78c2', null, true); pd.position.set(0.42 * Math.cos(k * TAU / 8), 0.42 * Math.sin(k * TAU / 8), 0); pd.rotation.z = k * TAU / 8; wheel.add(pd); }
        g.userData.spin = wheel; g.userData.rate = z.k === 'gutter' ? 3 : 0;
      }
      if (d === 'pz') {
        const m = mat('#f2c230', { emissive: new T.Color('#ffd84a'), emissiveIntensity: 0 });
        const tile = inked(new T.BoxGeometry(2.6, 0.05, 0.9), m); tile.position.y = -0.04; g.add(tile); g.userData.pz = m;
      }
      if (window.gsap && !window.Deck.reduce) gsap.from(g.scale, { x: 0.2, y: 0.2, z: 0.2, duration: 0.4, ease: 'back.out(3)' });
      return g;
    }

    function rate(d, z) { const v = z.val[d], f = BEST[d] ? v / BEST[d] : 0; return { v, f, star: v <= 0.05 || f < 0.1 ? '✕ 거의 0' : f >= 0.99 ? '★★★ 알맞다' : f >= 0.5 ? '★★ 괜찮다' : '★ 조금' }; }
    function paint() {
      const make = Z.reduce((a, z) => a + (z.dev ? z.val[z.dev] : 0), 0);
      const use = USE - (led.getAttribute('aria-pressed') === 'true' ? 1.5 : 0) - (idle.getAttribute('aria-pressed') === 'true' ? 1 : 0);
      uBar.style.width = `${use / MAX * 100}%`; mBar.style.width = `${Math.min(100, make / MAX * 100)}%`;
      const ok = make >= use; root.classList.toggle('self', ok);
      goal.textContent = ok ? '자가발전 학교 완성! 만드는 전기가 쓰는 전기 이상' : make >= use - 1.2 && make > 0 ? '거의 다 왔다 — 아끼기도 함께 해 보자' : make > 0 ? '아직 모자란다 — 알맞은 자리를 찾아 보자' : '';
      Z.forEach((z) => { const r = z.dev ? rate(z.dev, z) : null; z.pin.classList.toggle('has', !!z.dev); z.pin.classList.toggle('bad', !!r && (r.v <= 0.05 || r.f < 0.1)); z.pin.querySelector('.sc-pr').textContent = r ? r.star : ''; });
    }
    function show(d, z) {
      const r = rate(d, z), why = z.sun[d] ? (z.frac < 0.2 ? '하루 내내 그늘이 진다' : z.frac < 0.8 ? '건물에 가려 그늘이 지는 때가 있다' : '하루 내내 햇빛이 잘 든다') : z.tag;
      card.name.textContent = DEV[d];
      card.body.innerHTML = `<span><i>원리</i>${INFO[d].how}</span><span><i>조건</i>${INFO[d].need}</span><span class="sc-verdict"><i>이 자리</i>${z.name}: ${why} → <b>${r.star}</b></span>`;
      msg.textContent = r.v <= 0.05 || r.f < 0.1 ? `${z.name}에는 ${NEED[d]}${ig(NEED[d])} 거의 없어 ${DEV[d]}${ig(DEV[d])} 에너지를 거의 못 만든다`
        : r.f >= 0.99 ? `${z.name} → ${DEV[d]}에 알맞다!` : `${z.name}에서도 ${DEV[d]}${ig(DEV[d])} 조금은 만든다. 더 알맞은 자리는?`;
    }
    function place(btn, z) {
      if (!z) { msg.textContent = '학교의 자리 핀(●) 위에 놓아 보자'; return; }
      if (z.btn) unplace(z, true);
      const d = btn.dataset.d; z.dev = d; z.btn = btn; btn.classList.add('used'); z.obj = build(d, z);
      show(d, z); paint();
      if (z.k === 'north') s.look({ yaw: z.yaw, pitch: 0.42, dist: 30, target: z.at });
      if (!s.active) s.render();
    }
    function unplace(z, quiet) {
      if (!z.dev) return; z.btn.classList.remove('used'); z.btn.setAttribute('aria-pressed', 'false'); scene.remove(z.obj);
      z.dev = null; z.btn = null; z.obj = null; if (!quiet) { paint(); if (!s.active) s.render(); }
    }
    const drag = window.Drag.cards(devs, {
      find: (x) => { const p = x.closest && x.closest('.sc-pin'); return p ? Z.find((z) => z.pin === p) : null; },
      hover: (t) => Z.forEach((z) => z.pin.classList.toggle('target', z === t)),
      drop: place,
      pick: (b) => { stage.classList.toggle('picking', !!b); if (b) msg.textContent = `${b.textContent}${eul(b.textContent)} 놓을 자리 핀을 눌러요`; },
    });
    Z.forEach((z) => z.pin.addEventListener('click', () => {
      if (drag.picked) { const b = drag.picked; drag.unpick(); place(b, z); return; }
      if (z.dev) { unplace(z); msg.textContent = `${z.name}의 장치를 뗐다`; return; }
      msg.textContent = `${z.name}: ${z.tag} — 아래 장치를 끌어다 놓아 보자`;
      s.look({ yaw: z.yaw, pitch: 0.45, dist: 30, target: z.at });
    }));
    stage.addEventListener('dragstart', (e) => e.preventDefault());
    root.querySelector('#sc-home').addEventListener('click', () => s.look(VIEW));

    // 매 장면: 자리 핀이 건물 뒤에 가리면 흐리게, 지금 햇빛이 드는지 표시
    const tmp = new T.Vector3();
    function pinView() {
      Z.forEach((z) => {
        const to = tmp.copy(z.p).sub(s.camera.position), dist = to.length(); ray.set(s.camera.position, to.normalize()); ray.far = dist - 0.4;
        z.pin.classList.toggle('far', ray.intersectObjects(solids, false).length > 0);
      });
    }
    let time = 0;
    function step(dt) {
      time += dt;
      const d = rig.ball.position.clone().normalize(), up = d.y > 0.03;
      Z.forEach((z) => {
        z.now = up && lit(z.p, d);
        const nowEl = z.pin.querySelector('.sc-now'); nowEl.textContent = !up ? '밤' : z.now ? '☀ 햇빛' : '그늘'; z.pin.classList.toggle('shade', !z.now);
        const u = z.obj && z.obj.userData; if (!u) return;
        if (u.glow) u.glow.forEach((m) => { m.emissiveIntensity = z.now ? 0.35 * Math.max(0, d.y) + 0.1 : 0; });
        if (u.spin) u.spin.rotation.z -= dt * u.rate;
        if (u.pz) u.pz.emissiveIntensity = 0;
      });
      // 계단 사람: 앞마당 ↔ 현관을 오간다
      people.forEach((pp) => {
        const k = (time * 0.12 + pp.ph) % 1, zz = 4 - 4.4 * (k < 0.5 ? k * 2 : 2 - k * 2);
        const y = Math.max(0, Math.min(1, (1.3 - zz) / 1.5)) * 0.54;
        pp.g.position.set(pp.x, y + Math.abs(Math.sin(time * 8 + pp.ph * 9)) * 0.05, zz); pp.g.rotation.y = k < 0.5 ? Math.PI : 0;
        const st = Z.find((z) => z.k === 'stairs');
        if (st.obj && st.obj.userData.pz && zz < 0.3) st.obj.userData.pz.emissiveIntensity = 0.8;
      });
      wSeeds.forEach((q, i) => { q.z += dt * 6; if (q.z > 9) q.z -= 17; wPos.set([q.x, q.y, q.z, q.x, q.y, q.z + 1.2], i * 6); });
      wGeo.attributes.position.needsUpdate = true;
    }

    [led, idle].forEach((b) => b.addEventListener('click', () => { b.setAttribute('aria-pressed', String(b.getAttribute('aria-pressed') !== 'true')); paint(); }));
    root.querySelector('#sc-clear').addEventListener('click', () => { Z.forEach((z) => unplace(z, true)); paint(); if (!s.active) s.render(); msg.textContent = '모두 뗐다. 다시 놓아 보자'; });
    canvas.addEventListener('keydown', (e) => { const dd = { ArrowLeft: -0.25, ArrowRight: 0.25 }[e.key]; if (dd) { e.preventDefault(); e.stopPropagation(); rig.set(rig.t + dd); if (!s.active) { step(0); s.render(); } } });
    root._school = {
      best() { Z.forEach((z) => unplace(z, true)); const plan = { roof: 'pv', canopy: 'pv', passage: 'wd', gutter: 'hy', stairs: 'pz', north: 'st' }; Z.forEach((z) => { const b = devs.find((x) => x.dataset.d === plan[z.k] && !x.classList.contains('used')); if (b) place(b, z); }); s.look(VIEW); },
      time: (t) => rig.set(t), view: () => s.look(VIEW), frac: () => Object.fromEntries(Z.map((z) => [z.k, +z.frac.toFixed(2)])),
    };
    paint(); step(0);
    return { setActive: s.setActive, fit: s.fit };
  }
  window.SchoolMap = { mount };
})();
