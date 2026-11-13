/* 신재생 에너지 기술(교과서 114쪽 그림을 3D로 다시 그림): 언덕의 풍력 발전기, 태양광 발전소, 지붕의 태양열 집열판,
   태양 전지 버스 정류장, 수소 충전소가 있는 마을.
   하늘의 해를 끌면 시각이 바뀌고 그림자가 따라 돈다. 구름을 끌어 해를 가리면 구름 그늘 아래의 발전이 준다(구름은 바람 따라 흐른다).
   왼쪽 아래 바람 화살표의 끝을 끌면 바람의 방향·세기가 바뀌고, 풍력 발전기는 천천히 바람 쪽으로 몸을 돌린다.
   오른쪽 그래프에는 시각별 태양광·풍력 발전량이 기록된다. 남는 전기는 수소로 저장된다. 값은 비교를 위한 그림. */
(function () {
  'use strict';
  const { tok } = window.Stage;
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  const smooth = (x) => x * x * (3 - 2 * x);
  const windOut = (w) => (w < 0.12 ? 0 : Math.min(1, ((w - 0.12) / 0.7) ** 2));
  const font = (px, w = 700) => `${w} ${px}px "IBM Plex Sans KR", sans-serif`;
  const DIRS = ['북', '북동', '동', '남동', '남', '남서', '서', '북서'];
  const VIEW = { yaw: 0.22, pitch: 0.42, dist: 48, target: [1, 3.5, 0] };
  const CY = 9;                                       // 구름 높이
  const FOCUS = {
    wd: { at: [-10.3, -4.8], r: 4.4, look: { target: [-10, 4, -4.5], dist: 25, yaw: 0.35 } },
    pv: { at: [-1.5, -0.5], r: 4.8, look: { target: [-1.5, 1, -0.5], dist: 22, yaw: 0.3 } },
    st: { at: [6.6, -1.6], r: 2.9, look: { target: [6.6, 2.4, -1.4], dist: 17, yaw: 0.4 } },
    bus: { at: [2.4, 5.6], r: 2.1, look: { target: [2.4, 1.4, 5.6], dist: 14, yaw: 0.5 } },
    h2: { at: [12.2, 2.4], r: 3.3, look: { target: [12, 1.6, 2.4], dist: 17, yaw: 0.6 } },
  };
  const fmt = (h) => { const mins = Math.round(h * 6) * 10, hh = Math.floor(mins / 60), m = mins % 60; const a = hh < 6 ? '새벽' : hh < 12 ? '오전' : hh === 12 ? '낮' : hh < 18 ? '오후' : '저녁'; return `${a} ${hh % 12 === 0 ? 12 : hh % 12}${m ? `:${String(m).padStart(2, '0')}` : '시'}`; };

  function mount(root) {
    const stage = root.querySelector('.tc-stage'), canvas = stage.querySelector('canvas'), chart = root.querySelector('.tc-chart');
    const cards = [...root.querySelectorAll('.tc-card')], play = root.querySelector('#tc-play'), clock = root.querySelector('.tc-clock');
    const bars = Object.fromEntries([...root.querySelectorAll('.tc-bar')].map((b) => [b.dataset.k, b.querySelector('i')]));
    const wsvg = root.querySelector('.tw-svg'), knob = wsvg.querySelector('.tw-knob'), shaft = wsvg.querySelector('.tw-arrow'), wsay = root.querySelector('.tw-say');
    const cmp = Object.fromEntries([...wsvg.querySelectorAll('.tw-cmp text')].map((t) => [t.dataset.d, t]));
    const s = window.Scene3D.make(stage, canvas, { view: VIEW, shadows: true, fov: 36, min: 12, max: 64, pmin: 0.2, pmax: 1.3, onFrame: step, onRender: dialView, click: onClick });
    if (!s.ok) return { setActive() {}, fit() {} };
    const { T, scene, inked, mat, group } = s;
    const flat = (m) => { m.castShadow = false; return m; };

    // 땅·길·언덕·나무
    const ground = flat(inked(new T.BoxGeometry(36, 0.6, 26), '#a8d39b')); ground.position.y = -0.3; scene.add(ground);
    const road = flat(inked(new T.BoxGeometry(36, 0.06, 2.4), '#c3cbd2')); road.position.set(0, 0.03, 8.6); scene.add(road);
    for (let x = -16; x <= 16; x += 3) { const d = new T.Mesh(new T.BoxGeometry(1.4, 0.07, 0.16), new T.MeshBasicMaterial({ color: 0xffffff })); d.position.set(x, 0.05, 8.6); scene.add(d); }
    const HILL = { x: -10.5, z: -5, r: 6.6, h: 2.8 };
    const hill = inked(new T.SphereGeometry(HILL.r, 40, 14, 0, TAU, 0, Math.PI / 2), '#93c785', null, true);
    hill.scale.y = HILL.h / HILL.r; hill.position.set(HILL.x, 0, HILL.z); hill.castShadow = false; scene.add(hill);
    const hillY = (x, z) => HILL.h * Math.sqrt(Math.max(0, 1 - ((x - HILL.x) ** 2 + (z - HILL.z) ** 2) / HILL.r ** 2));
    [[-3.8, -7.4], [1.2, -8], [9.8, -6.4], [15.2, -3], [-15.2, 4.2], [-6.2, 5.4], [16, 5.2]].forEach(([x, z]) => {
      const tr = group(); tr.position.set(x, 0, z);
      const trunk = inked(new T.CylinderGeometry(0.12, 0.16, 0.9, 8), '#9b7653', null, true); trunk.position.y = 0.45; tr.add(trunk);
      const top = inked(new T.ConeGeometry(0.85, 2.1, 10), '#5fa25a'); top.position.y = 1.9; tr.add(top);
    });

    // 풍력 발전기 둘: 탑 위 몸통(nacelle)이 바람 쪽으로 돌고, 날개가 돈다
    const bladeShape = new T.Shape(); bladeShape.moveTo(-0.15, 0); bladeShape.lineTo(0.2, 0.35); bladeShape.lineTo(0.07, 2.9); bladeShape.lineTo(-0.05, 2.9); bladeShape.closePath();
    const bladeGeo = new T.ExtrudeGeometry(bladeShape, { depth: 0.05, bevelEnabled: false });
    const wdG = group(); wdG.userData.k = 'wd'; wdG.add(hill);
    const turbines = [[-12, -6.2], [-8.4, -3.2]].map(([x, z]) => {
      const g = group(wdG); g.position.set(x, hillY(x, z) - 0.1, z);
      const tower = inked(new T.CylinderGeometry(0.13, 0.25, 6.4, 14), '#eef2f1'); tower.position.y = 3.2; g.add(tower);
      const yaw = group(g); yaw.position.y = 6.4;
      const nac = inked(new T.BoxGeometry(0.52, 0.52, 1.4), '#eef2f1'); nac.position.z = -0.2; yaw.add(nac);
      const rotor = group(yaw); rotor.position.z = 0.62;
      rotor.add(inked(new T.SphereGeometry(0.27, 16, 10), '#dfe5e8', null, true));
      for (let k = 0; k < 3; k++) { const arm = group(rotor); arm.rotation.z = k * TAU / 3; arm.add(inked(bladeGeo, '#f6f8f7')); }
      return { yaw, rotor, phi: 0 };
    });

    // 태양광 발전소: 남쪽(+z)으로 기운 패널 3줄 × 5
    const pvMat = mat('#24477f'); pvMat.emissive = new T.Color('#5d8fe0'); pvMat.emissiveIntensity = 0;
    const pvG = group(); pvG.position.set(-1.5, 0, -0.5); pvG.userData.k = 'pv';
    for (let r = 0; r < 3; r++) for (let c = 0; c < 5; c++) {
      const p = inked(new T.BoxGeometry(1.5, 0.07, 1.05), pvMat); p.position.set(-3.2 + c * 1.6, 0.9, -2 + r * 2); p.rotation.x = 0.55; pvG.add(p);
      const leg = inked(new T.CylinderGeometry(0.05, 0.05, 0.85, 6), '#8d96a3', null, true); leg.position.set(-3.2 + c * 1.6, 0.42, -2 + r * 2); pvG.add(leg);
    }

    // 집: 남쪽 지붕에 태양열 집열판, 용마루 위에 온수 탱크
    const stG = group(); stG.position.set(6.6, 0, -1.6); stG.userData.k = 'st';
    const body = inked(new T.BoxGeometry(3.6, 2.2, 3.0), '#f3f5f7'); body.position.y = 1.1; stG.add(body);
    const tri = new T.Shape(); tri.moveTo(-1.75, 0); tri.lineTo(1.75, 0); tri.lineTo(0, 1.05); tri.closePath();
    const roofGeo = new T.ExtrudeGeometry(tri, { depth: 3.9, bevelEnabled: false }); roofGeo.rotateY(-Math.PI / 2); roofGeo.translate(1.95, 2.2, 0);
    stG.add(inked(roofGeo, '#d9776b'));
    const stMat = mat('#2b3242'); stMat.emissive = new T.Color('#ff7a45'); stMat.emissiveIntensity = 0;
    const coll = inked(new T.BoxGeometry(1.6, 0.08, 1.05), stMat); coll.position.set(-0.75, 2.79, 0.86); coll.rotation.x = Math.atan(1.05 / 1.75); stG.add(coll);
    const tankMat = mat('#c9d6df');
    const tank = inked(new T.CylinderGeometry(0.32, 0.32, 1.3, 16).rotateZ(Math.PI / 2), tankMat); tank.position.set(0.95, 3.55, 0); stG.add(tank);
    const winMat = mat('#c9d6df'); winMat.emissive = new T.Color('#ffd36b'); winMat.emissiveIntensity = 0;
    [-1.1, 1.1].forEach((x) => { const w = inked(new T.BoxGeometry(0.8, 0.62, 0.06), winMat); w.position.set(x, 1.35, 1.52); stG.add(w); });
    const door = inked(new T.BoxGeometry(0.7, 1.3, 0.06), '#b7a48c'); door.position.set(0, 0.65, 1.52); stG.add(door);

    // 태양 전지 버스 정류장: 지붕이 태양 전지, 옆 기둥에서 휴대 전화 충전
    const busG = group(); busG.position.set(2.4, 0, 5.6); busG.userData.k = 'bus';
    [-1.2, 1.2].forEach((x) => { const p = inked(new T.CylinderGeometry(0.07, 0.07, 2.3, 8), '#7b8597', null, true); p.position.set(x, 1.15, -0.45); busG.add(p); });
    const bRoof = inked(new T.BoxGeometry(2.9, 0.1, 1.4), pvMat); bRoof.position.set(0, 2.35, -0.1); bRoof.rotation.x = 0.12; busG.add(bRoof);
    const glass = inked(new T.BoxGeometry(2.4, 1.4, 0.05), '#dfe9ef', { transparent: true, opacity: 0.55 }); glass.position.set(0, 1.0, -0.48); busG.add(glass);
    const bench = inked(new T.BoxGeometry(1.8, 0.12, 0.45), '#b7a48c'); bench.position.set(-0.2, 0.5, -0.15); busG.add(bench);
    const post = inked(new T.BoxGeometry(0.36, 1.15, 0.26), '#eef2f1'); post.position.set(1.0, 0.58, 0.25); busG.add(post);
    const screen = new T.Mesh(new T.BoxGeometry(0.24, 0.32, 0.02), new T.MeshBasicMaterial({ color: 0x4b566a })); screen.position.set(1.0, 0.85, 0.39); busG.add(screen);

    // 수소 충전소: 지붕, 충전기, 저장 탱크(차오름), 수소차
    const h2G = group(); h2G.position.set(11.4, 0, 3.0); h2G.userData.k = 'h2';
    const canopy = inked(new T.BoxGeometry(3.6, 0.18, 2.6), '#eef2f1'); canopy.position.y = 2.7; h2G.add(canopy);
    [-1.4, 1.4].forEach((x) => { const p = inked(new T.CylinderGeometry(0.09, 0.09, 2.6, 8), '#7b8597', null, true); p.position.set(x, 1.3, -0.9); h2G.add(p); });
    const disp = inked(new T.BoxGeometry(0.5, 1.2, 0.4), '#f3f5f7'); disp.position.set(0.2, 0.6, -0.4); h2G.add(disp);
    const shell = inked(new T.CylinderGeometry(0.66, 0.66, 3.2, 24), '#ffffff', { transparent: true, opacity: 0.28, depthWrite: false }); shell.position.set(3.0, 1.6, -1.4); shell.castShadow = false; h2G.add(shell);
    const fillGeo = new T.CylinderGeometry(0.58, 0.58, 3.0, 24); fillGeo.translate(0, 1.5, 0);
    const fill = new T.Mesh(fillGeo, mat('e-pot')); fill.position.set(3.0, 0.1, -1.4); h2G.add(fill);
    const car = group(h2G); car.position.set(-0.4, 0, 0.75);
    const cb = inked(new T.BoxGeometry(1.9, 0.5, 0.95), '#f2a3c3'); cb.position.y = 0.45; car.add(cb);
    const cab = inked(new T.BoxGeometry(1.0, 0.42, 0.85), '#f7c6da'); cab.position.set(-0.1, 0.9, 0); car.add(cab);
    [[-0.6, 0.48], [0.6, 0.48], [-0.6, -0.48], [0.6, -0.48]].forEach(([x, z]) => { const w = inked(new T.CylinderGeometry(0.2, 0.2, 0.14, 14).rotateX(Math.PI / 2), '#3a4150', null, true); w.position.set(x, 0.2, z); car.add(w); });

    // 구름 셋: 잡아 끌 수 있고, 바람을 따라 흐른다
    const cloudMat = new T.MeshLambertMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 });
    const puffs = [[0, 0, 0, 1.7], [1.5, 0.2, 0.3, 1.3], [-1.5, 0.1, -0.2, 1.3], [0.6, 0.6, -0.6, 1.2], [-0.5, 0.5, 0.7, 1.1]];
    const clouds = [[-12, -9], [7, -11], [16, 2]].map(([x, z]) => {
      const g = group(); g.position.set(x, CY, z); g.scale.set(0.85, 0.55, 0.85);
      puffs.forEach(([a, b, c, r]) => { const m = new T.Mesh(new T.SphereGeometry(r, 18, 12), cloudMat); m.position.set(a, b, c); m.castShadow = true; g.add(m); });
      return { g, held: false };
    });

    // 바람 줄무늬(흐르는 짧은 선)
    const NSTR = 30, sPos = new Float32Array(NSTR * 6);
    const streakGeo = new T.BufferGeometry(); streakGeo.setAttribute('position', new T.BufferAttribute(sPos, 3));
    const streakMat = new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.5 });
    const streak = new T.LineSegments(streakGeo, streakMat); streak.frustumCulled = false; scene.add(streak);
    const seeds = Array.from({ length: NSTR }, () => ({ x: (Math.random() - 0.5) * 34, y: 1 + Math.random() * 7, z: (Math.random() - 0.5) * 24 }));

    // 고른 시설 둘레 고리
    const ring = new T.Mesh(new T.RingGeometry(1, 1.1, 56), new T.MeshBasicMaterial({ color: new T.Color(s.col('hl')), transparent: true, opacity: 0.95, side: T.DoubleSide, depthTest: false }));
    ring.rotation.x = -Math.PI / 2; ring.visible = false; ring.renderOrder = 7; scene.add(ring);
    const LAB = { wd: [-10.2, 9.6, -4.7], pv: [-1.5, 2.8, -0.5], st: [6.6, 4.7, -1.6], bus: [2.4, -0.4, 7.4], h2: [12.4, 3.8, 2.4] };
    stage.querySelectorAll('.tc-lab').forEach((el) => s.label(el, new T.Vector3(...LAB[el.dataset.k])));

    // 상태
    let wTh = Math.atan2(0.55, 0.85), wv = 0.5, time = 0, h2 = 0.35, playing = false, focus = null, frameN = 0;   // 바람이 불어 가는 쪽(각) · 세기 0~1
    let O = { pv: 0, st: 0, bus: 0, wd: 0, g: 0 };
    const BN = 133, B0 = 5.4, binPV = new Array(BN).fill(null), binWD = new Array(BN).fill(null);
    const upwind = () => Math.atan2(-Math.cos(wTh), -Math.sin(wTh));   // 날개가 바라볼 쪽(nacelle 회전 y)
    turbines.forEach((tb) => { tb.phi = upwind(); tb.yaw.rotation.y = tb.phi; });

    const sunDir = new T.Vector3();
    const rig = window.Scene3D.sunRig(s, { R: 19, H: 0.85, south: 0.42, t0: 12, shadow: 23, onChange: (t) => { clock.textContent = fmt(t); } });
    const PV_PTS = [-4.6, -1.5, 1.6].flatMap((x) => [-2.4, 1.4].map((z) => new T.Vector3(x, 0.9, z)));
    const ST_PT = new T.Vector3(5.85, 2.8, -0.75), BUS_PT = new T.Vector3(2.4, 2.4, 5.5);
    function sky(p) {
      if (sunDir.y <= 0.03) return 0;
      let f = 1;
      clouds.forEach(({ g }) => { const k = (g.position.y - p.y) / sunDir.y, d = Math.hypot(p.x + sunDir.x * k - g.position.x, p.z + sunDir.z * k - g.position.z); f *= 1 - 0.8 * smooth(clamp((3.1 - d) / 1.5, 0, 1)); });
      return f;
    }
    function measure() {
      sunDir.copy(rig.ball.position).normalize();
      const L = Math.max(0, rig.el);
      const pv = L * PV_PTS.reduce((a, p) => a + sky(p), 0) / PV_PTS.length;
      const g = wv * (0.86 + 0.1 * Math.sin(time * 1.1) + 0.07 * Math.sin(time * 2.9 + 1));
      const wd = turbines.reduce((a, tb) => a + windOut(g) * Math.max(0, Math.cos(wrap(upwind() - tb.phi))) ** 3, 0) / turbines.length;
      O = { pv, st: 0.9 * L * sky(ST_PT), bus: L * sky(BUS_PT), wd, g, L };
    }
    function paint() {
      const night = 1 - clamp(rig.el * 3, 0, 1);
      pvMat.emissiveIntensity = 0.18 * O.pv; stMat.emissiveIntensity = 0.7 * O.st; winMat.emissiveIntensity = 0.9 * night;
      tankMat.color.set('#c9d6df').lerp(new T.Color('#ff9a6f'), O.st);
      screen.material.color.set(O.bus > 0.05 ? 0x3fbf6a : 0x4b566a);
      fill.scale.y = Math.max(0.02, h2);
      bars.pv.style.width = `${O.pv * 100}%`; bars.st.style.width = `${O.st * 100}%`; bars.wd.style.width = `${O.wd * 100}%`; bars.h2.style.width = `${h2 * 100}%`;
    }
    function record() {
      const i = Math.round((rig.t - B0) / 0.1); if (i < 0 || i >= BN) return;
      binPV[i] = O.pv; binWD[i] = O.wd;
    }
    function step(dt) {
      time += dt; frameN++;
      if (playing) { rig.set(rig.t + dt * 0.8); if (rig.t >= rig.T1) setPlay(false); }
      const ux = Math.cos(wTh), uz = Math.sin(wTh), gNow = O.g || wv;
      // 풍력 발전기: 바람 쪽으로 천천히 돌고(초당 약 0.5 rad), 맞바람이 될수록 많이 만든다
      turbines.forEach((tb) => { const d = wrap(upwind() - tb.phi); tb.phi += clamp(d, -0.5 * dt, 0.5 * dt); tb.yaw.rotation.y = tb.phi; });
      measure();
      turbines.forEach((tb) => { tb.rotor.rotation.z -= dt * ((O.g > 0.06 ? 0.3 : 0) + 8 * O.wd); });
      // 구름은 바람 따라 흐르고, 마을 밖으로 나가면 반대쪽에서 들어온다
      clouds.forEach((c) => {
        if (c.held) return; const p = c.g.position;
        p.x += ux * gNow * 0.9 * dt; p.z += uz * gNow * 0.9 * dt;
        if (p.x > 21) p.x = -21; if (p.x < -21) p.x = 21; if (p.z > 15) p.z = -15; if (p.z < -15) p.z = 15;
      });
      seeds.forEach((q, i) => {
        q.x += ux * gNow * 7 * dt; q.z += uz * gNow * 7 * dt;
        if (q.x > 17) q.x -= 34; if (q.x < -17) q.x += 34; if (q.z > 12) q.z -= 24; if (q.z < -12) q.z += 24;
        const L = 0.4 + 2.2 * gNow, o = i * 6; sPos.set([q.x, q.y, q.z, q.x + ux * L, q.y, q.z + uz * L], o);
      });
      streakGeo.attributes.position.needsUpdate = true; streakMat.opacity = clamp(gNow * 0.9, 0, 0.55);
      h2 = clamp(h2 + (O.pv + O.wd - 0.7) * dt * 0.07, 0, 1);
      record(); paint();
      if (frameN % 2 === 0 || !s.active) drawChart();
    }

    // 그래프: 해가 지나간 시각마다 태양광·풍력 발전량을 기록한다
    let cg = null;
    function drawChart() {
      if (!cg || cg.w < 50) return;
      const { ctx, w, h } = cg, x0 = 34, x1 = w - 8, y0 = 26, y1 = h - 26;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = tok('paper'); ctx.fillRect(x0, y0, x1 - x0, y1 - y0);
      ctx.strokeStyle = tok('rule'); ctx.lineWidth = 1.5; ctx.strokeRect(x0, y0, x1 - x0, y1 - y0);
      const X = (t) => x0 + (x1 - x0) * (t - B0) / (rig.T1 - B0), Y = (v) => y1 - (y1 - y0) * v;
      const line = (bins, color, dash) => {
        ctx.strokeStyle = color; ctx.lineWidth = 3.5; ctx.setLineDash(dash || []); ctx.beginPath(); let on = false;
        bins.forEach((v, i) => { if (v === null) { on = false; return; } const x = X(B0 + i * 0.1), y = Y(v); if (on) ctx.lineTo(x, y); else ctx.moveTo(x, y); on = true; });
        ctx.stroke(); ctx.setLineDash([]);
      };
      line(binPV, tok('e-light-ink')); line(binWD, tok('e-kin'), [8, 5]);
      ctx.strokeStyle = tok('ink'); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(X(rig.t), y0); ctx.lineTo(X(rig.t), y1); ctx.stroke();
      ctx.fillStyle = tok('ink-3'); ctx.font = font(13, 600); ctx.textAlign = 'center';
      [6, 9, 12, 15, 18].forEach((t) => ctx.fillText(`${t}시`, X(t), h - 8));
      ctx.textAlign = 'left'; ctx.fillStyle = tok('e-light-ink'); ctx.font = font(15); ctx.fillText('— 태양광', x0, 17);
      ctx.fillStyle = tok('e-kin'); ctx.fillText('- - 풍력', x0 + 84, 17);
      if (binPV.filter((v) => v !== null).length < 4) { ctx.fillStyle = tok('ink-3'); ctx.textAlign = 'center'; ctx.font = font(15, 600); ctx.fillText('해를 끌거나 «하루 돌려 보기»를 눌러 기록', (x0 + x1) / 2, (y0 + y1) / 2 + 6); }
    }

    // 구름 잡아 끌기(구름 높이의 평면 위에서)
    const cloudMeshes = clouds.flatMap((c) => c.g.children);
    const cloudOf = (hit) => clouds.find((c) => c.g === hit.object.parent);
    s.grab((e) => !!s.pick(e, cloudMeshes), (e) => {
      const c = cloudOf(s.pick(e, cloudMeshes)), p0 = s.planeAt(e, CY); if (!c || !p0) return null;
      const off = c.g.position.clone().sub(p0); c.held = true;
      return {
        move(ev) { const p = s.planeAt(ev, CY); if (!p) return; c.g.position.set(clamp(p.x + off.x, -20, 20), CY, clamp(p.z + off.z, -14, 14)); measure(); paint(); },
        up() { c.held = false; },
      };
    });

    // 바람 화살표: 위쪽이 지금 보는 방향. 끝을 끌면 방향, 가운데서 멀수록 세다
    const C = 110, RIN = 24, RSPAN = 56;
    function dialView() {
      const y = s.view.yaw, c = Math.cos(y), sn = Math.sin(y);
      const toDial = (wx, wz) => [wx * c - wz * sn, -wx * sn - wz * c];
      [['n', 0, -1], ['e', 1, 0], ['s', 0, 1], ['w', -1, 0]].forEach(([k, wx, wz]) => { const [dx, dy] = toDial(wx, wz); cmp[k].setAttribute('x', (C + 94 * dx).toFixed(1)); cmp[k].setAttribute('y', (C - 94 * dy).toFixed(1)); });
      const [dx, dy] = toDial(Math.cos(wTh), Math.sin(wTh)), r = RIN + RSPAN * wv, x = C + r * dx, yy = C - r * dy;
      shaft.setAttribute('x2', x.toFixed(1)); shaft.setAttribute('y2', yy.toFixed(1));
      knob.setAttribute('transform', `translate(${x.toFixed(1)} ${yy.toFixed(1)}) rotate(${(Math.atan2(-dy, dx) * 180 / Math.PI).toFixed(1)})`);
    }
    function windSay() {
      const fx = -Math.cos(wTh), fz = -Math.sin(wTh), b = (Math.atan2(fx, -fz) * 180 / Math.PI + 360) % 360;
      const word = wv < 0.12 ? '거의 없음' : wv < 0.4 ? '약함' : wv < 0.7 ? '보통' : '강함';
      wsay.textContent = wv < 0.12 ? '바람 거의 없음' : `${DIRS[Math.round(b / 45) % 8]}풍 · ${word}`;
      knob.setAttribute('aria-valuetext', wsay.textContent);
    }
    function setWind(th, v) { wTh = th; wv = clamp(v, 0, 1); windSay(); dialView(); if (!s.active) { measure(); paint(); s.render(); } }
    const svgPt = (ev) => { const p = wsvg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(wsvg.getScreenCTM().inverse()); };
    function fromDial(ev) {
      const q = svgPt(ev), dx = q.x - C, dy = C - q.y, len = Math.hypot(dx, dy); if (len < 4) return;
      const y = s.view.yaw, c = Math.cos(y), sn = Math.sin(y), wx = (dx * c - dy * sn) / len, wz = (-dx * sn - dy * c) / len;
      setWind(Math.atan2(wz, wx), (len - RIN) / RSPAN);
    }
    let wHold = false;
    wsvg.addEventListener('pointerdown', (e) => { wHold = true; try { wsvg.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ } wsvg.classList.add('drag'); fromDial(e); e.stopPropagation(); });
    wsvg.addEventListener('pointermove', (e) => { if (wHold) fromDial(e); });
    const wUp = () => { wHold = false; wsvg.classList.remove('drag'); };
    wsvg.addEventListener('pointerup', wUp); wsvg.addEventListener('pointercancel', wUp);
    knob.addEventListener('keydown', (e) => {
      const d = { ArrowLeft: [-Math.PI / 8, 0], ArrowRight: [Math.PI / 8, 0], ArrowUp: [0, 0.1], ArrowDown: [0, -0.1] }[e.key];
      if (d) { e.preventDefault(); e.stopPropagation(); setWind(wTh + d[0], wv + d[1]); }
    });

    // 시설 고르기: 카드나 3D 시설을 누르면 그쪽으로 다가가고 고리를 두른다
    const techs = [wdG, pvG, stG, busG, h2G];
    function choose(k) {
      focus = focus === k ? null : k;
      cards.forEach((c) => c.classList.toggle('on', c.dataset.k === focus));
      stage.querySelectorAll('.tc-lab').forEach((el) => el.classList.toggle('on', el.dataset.k === focus));
      if (focus) { const f = FOCUS[focus]; ring.position.set(f.at[0], focus === 'wd' ? HILL.h + 0.05 : 0.06, f.at[1]); ring.scale.setScalar(f.r); ring.visible = true; s.look(f.look); }
      else { ring.visible = false; s.look(VIEW); }
    }
    function onClick(e) { const hit = s.pick(e, techs); if (!hit) return; let o = hit.object; while (o && !o.userData.k) o = o.parent; if (o) choose(o.userData.k); }
    cards.forEach((c) => { c.setAttribute('tabindex', '0'); c.setAttribute('role', 'button'); c.addEventListener('click', () => choose(c.dataset.k)); c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); choose(c.dataset.k); } }); });

    // 하루 돌려 보기: 해 뜰 녘부터 해 질 녘까지(약 16초) 해를 옮기며 기록한다
    function setPlay(on) {
      playing = on; play.setAttribute('aria-pressed', String(on)); play.querySelector('span').textContent = on ? '멈추기' : '하루 돌려 보기';
      if (on) { binPV.fill(null); binWD.fill(null); rig.set(rig.T0); }
    }
    play.addEventListener('click', () => setPlay(!playing));
    canvas.addEventListener('keydown', (e) => { const d = { ArrowLeft: -0.25, ArrowRight: 0.25 }[e.key]; if (d) { e.preventDefault(); e.stopPropagation(); rig.set(rig.t + d); if (!s.active) { measure(); paint(); s.render(); } } });

    windSay(); measure(); paint();
    root._techs = { time: (t) => { rig.set(t); measure(); paint(); }, wind: (deg, v) => setWind(deg * Math.PI / 180, v), cloud: (i, x, z) => { clouds[i].g.position.set(x, CY, z); measure(); paint(); },
      shade: (k) => { const p = { pv: new T.Vector3(-1.5, 0.9, -0.5), st: ST_PT, bus: BUS_PT }[k], d = rig.ball.position.clone().normalize(), q = p.clone().addScaledVector(d, (CY - p.y) / d.y); clouds[0].g.position.set(q.x, CY, q.z); measure(); paint(); }, choose, play: setPlay, sunXY: () => s.toClient(rig.ball.position), get out() { return O; } };
    return {
      setActive(on) { if (on) cg = window.Stage.fit(chart); s.setActive(on); if (!on) setPlay(false); if (on) drawChart(); },
      fit() { s.fit(); cg = window.Stage.fit(chart); drawChart(); },
    };
  }
  window.RenewTech = { mount };
})();
