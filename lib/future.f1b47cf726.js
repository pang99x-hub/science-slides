/* 미래 기술 두 가지.
   수소 연료 전지: 수소관·산소관의 밸브 바퀴를 돌려 연다(많이 열수록 기체가 많이 들어온다). 둘 다 들어와야 반응한다.
     (−)극에서 수소가 전자를 내놓고(e⁻는 바깥 전선으로, H⁺는 전해질로), (+)극에서 산소·수소 이온·전자가 만나 물이 생긴다.
     전자가 많이 흐를수록 전구가 밝다.
   토카막(KSTAR) 3D: 1/4을 잘라 낸 도넛 모양 진공 용기 안에 플라스마 고리가 있다. 손잡이로 코일 전류(자기장 세기)를 바꾼다.
     자기장이 세면 플라스마가 벽에 닿지 않고 밝게 유지되고, 약하면 흔들리다 벽에 닿아 불꽃이 튀며 식는다. 끌어서 둘러본다. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); p.appendChild(e); return e; };
  const openWord = (v) => (v < 0.03 ? '닫힘' : v < 0.4 ? '조금 열림' : v < 0.8 ? '열림' : '활짝 열림');

  function fuelCell(root) {
    const svg = root.querySelector('.fc-svg'), parts = svg.querySelector('.fc-parts'), glow = svg.querySelector('.fc-glow');
    const say = el('text', { class: 'fc-say', x: 390, y: 22 }, svg);
    const wire = svg.querySelector('.fc-wire'), WL = wire.getTotalLength();
    const vt = { h: svg.querySelector('.fc-vt[data-g="h"]'), o: svg.querySelector('.fc-vt[data-g="o"]') };
    let H = 0, O = 0, P = [], tH = 0, tO = 0, cur = 0;
    const mol = (x, y, kind) => { const g = el('g', { class: `fc-m ${kind}` }, parts); el('circle', { cx: -7, cy: 0, r: 9 }, g); el('circle', { cx: 7, cy: 0, r: 9 }, g); return { g, kind, x, y }; };
    const dot = (cls, txt) => { const g = el('g', { class: cls }, parts); el('circle', { r: 9 }, g); el('text', { y: 4 }, g).textContent = txt; return g; };
    const valves = {};
    svg.querySelectorAll('.fc-valve').forEach((g) => {
      const k = g.dataset.g, c = g.querySelector('.fc-hub');
      valves[k] = window.Scene3D.dial(g, Number(c.getAttribute('cx')), Number(c.getAttribute('cy')), {
        max: 300, v0: 0,
        onChange: (v) => { if (k === 'h') H = v; else O = v; vt[k].textContent = openWord(v); g.setAttribute('aria-valuetext', openWord(v)); },
      });
    });
    function step(dt) {
      tH += dt; tO += dt;
      if (H > 0.03 && tH > 0.55 / H) { tH = 0; P.push({ ...mol(40, 200 + Math.random() * 44, 'h'), vx: 120 }); }
      if (O > 0.03 && tO > 1.1 / O) { tO = 0; P.push({ ...mol(740, 200 + Math.random() * 44, 'o'), vx: -110 }); }
      const hOn = H > 0.03, oOn = O > 0.03;
      let flowing = 0;
      const born = [];                                        // 이번에 새로 생긴 알갱이(거르는 중에는 P에 넣지 않는다)
      P = P.filter((p) => {
        if (p.kind === 'h' || p.kind === 'o') {
          const stopX = p.kind === 'h' ? 248 : 532;
          if ((p.kind === 'h' && p.x < stopX) || (p.kind === 'o' && p.x > stopX)) p.x += p.vx * dt;
          else if (p.kind === 'h' && oOn) {                     // 쪼개진다: 수소 이온 2개(전해질로), 전자 2개(전선으로)
            p.g.remove();
            for (let k = 0; k < 2; k++) {
              born.push({ kind: 'ion', g: dot('fc-ion', '+'), x: 296, y: p.y - 12 + k * 24, vx: 70 + Math.random() * 30 });
              born.push({ kind: 'e', g: dot('fc-e', 'e⁻'), s: -k * 26 });
            }
            return false;
          } else if (p.kind === 'o' && hOn) { p.g.remove(); for (let k = 0; k < 2; k++) born.push({ kind: 'w', g: el('path', { class: 'fc-w', d: 'M0 -12 C 6 -2, 9 4, 0 10 C -9 4, -6 -2, 0 -12 Z' }, parts), x: 506 + (k - 0.5) * 16, y: 330, vy: 0 }); return false; }
          else { p.wait = (p.wait || 0) + dt; p.g.style.opacity = String(Math.max(0.25, 1 - p.wait / 3)); if (p.wait > 4) { p.g.remove(); return false; } }
          p.g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
          return true;
        }
        if (p.kind === 'ion') { p.x += p.vx * dt; if (p.x > 486) { p.g.remove(); return false; } p.g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`); return true; }
        if (p.kind === 'e') { p.s += dt * 260; flowing++; if (p.s >= WL) { p.g.remove(); return false; } if (p.s < 0) { p.g.style.opacity = '0'; return true; } p.g.style.opacity = '1'; const pt = wire.getPointAtLength(p.s); p.g.setAttribute('transform', `translate(${pt.x.toFixed(1)} ${pt.y.toFixed(1)})`); return true; }
        if (p.kind === 'w') { p.vy += 300 * dt; p.y += p.vy * dt; if (p.y > 398) { p.g.remove(); return false; } p.g.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`); return true; }
        return true;
      }).concat(born);
      cur += (clamp(flowing / 9, 0, 1) - cur) * Math.min(1, dt * 2.5);
      glow.style.opacity = String(cur); glow.setAttribute('r', (30 + 30 * cur).toFixed(1));
      svg.classList.toggle('on', cur > 0.15);
      say.textContent = hOn && oOn ? (cur > 0.6 ? '많이 열수록 전자가 많이 흘러 전구가 밝다 · 생기는 것은 물뿐' : '전자가 바깥 전선으로 흐른다 → 전구가 켜지고, 물이 생긴다')
        : hOn ? '산소가 없으면 반응하지 않는다' : oOn ? '수소가 없으면 반응하지 않는다' : '밸브를 돌려 수소와 산소를 넣어 보자';
    }
    return { step, set(h, o) { valves.h.set(h); valves.o.set(o); } };
  }

  function tokamak(root) {
    const stage = root.querySelector('.tk-stage'), canvas = stage.querySelector('canvas'), say = root.querySelector('.tk-say');
    const CAM = 0.62;                                           // 처음 보는 방향(yaw): 잘라 낸 쪽이 이쪽을 향한다
    const s = window.Scene3D.make(stage, canvas, { view: { yaw: CAM, pitch: 0.62, dist: 15.5, target: [0, -0.4, 0] }, fov: 34, min: 6, max: 22, onFrame: step });
    let B = 0.25, ready = false;
    const knob = window.Scene3D.dial(root.querySelector('.tk-dial'), 100, 80, { max: 270, v0: B, onChange: (v) => { B = v; if (ready && !s.active) { step(0.016); s.render(); } } });
    if (!s.ok) return { setActive() {}, fit() {}, knob };
    const { T, scene, inked, mat, group } = s;
    scene.add(new T.HemisphereLight(0xffffff, 0x8a93a0, 1.3));
    const sun = new T.DirectionalLight(0xffffff, 1.2); sun.position.set(4, 8, 6); scene.add(sun);
    const R = 2.6, r = 1.0;
    const camAng = Math.atan2(Math.cos(CAM), Math.sin(CAM)), CUT0 = 1.5 * Math.PI;   // xz 평면에서 카메라 쪽 각도
    const turn = -(camAng - (-Math.PI / 4));                                         // 잘라 낸 1/4의 가운데를 카메라 쪽으로
    // 진공 용기(1/4 잘라 냄)와 잘린 면
    const vGeo = new T.TorusGeometry(R, r, 28, 72, CUT0); vGeo.rotateX(Math.PI / 2); vGeo.rotateY(turn);
    const vessel = new T.Mesh(vGeo, mat('#c9d0d8', { transparent: true, opacity: 0.42, side: T.DoubleSide, depthWrite: false }));
    vessel.add(new T.LineSegments(new T.EdgesGeometry(vGeo, 40), new T.LineBasicMaterial({ color: new T.Color(s.col('ink')), transparent: true, opacity: 0.35 })));
    scene.add(vessel);
    [0, CUT0].forEach((u) => {
      const ring = inked(new T.RingGeometry(r * 0.9, r, 40), '#9aa3ae', { side: T.DoubleSide });
      const a = u - turn;   // 용기를 돌린 만큼 같이 돈 자리
      ring.position.set(R * Math.cos(a), 0, R * Math.sin(a)); ring.rotation.y = -a; scene.add(ring);
    });
    // 바깥 코일(12개, 잘라 낸 쪽은 뺀다)과 중심 코일
    const coilMat = mat('#c98a4a'); coilMat.emissive = new T.Color('#ff8a1f');
    for (let k = 0; k < 12; k++) {
      const u = (k + 0.5) / 12 * TAU; if (u > CUT0) continue;
      const a = u - turn, c = inked(new T.TorusGeometry(r + 0.22, 0.07, 8, 40), coilMat, null, true);
      c.scale.set(1, 1.2, 1); c.position.set(R * Math.cos(a), 0, R * Math.sin(a)); c.rotation.y = -a; scene.add(c);
    }
    const cs = inked(new T.CylinderGeometry(0.7, 0.7, 3.4, 32), '#9aa3ae'); scene.add(cs);
    for (let k = 0; k < 7; k++) { const w = inked(new T.TorusGeometry(0.73, 0.045, 6, 32).rotateX(Math.PI / 2), coilMat, null, true); w.position.y = -1.35 + k * 0.45; scene.add(w); }
    // 플라스마 고리(빛나는 바깥 + 밝은 속)
    const plasma = group();
    const pGlow = new T.Mesh(new T.TorusGeometry(R, 0.52, 20, 120).rotateX(Math.PI / 2), new T.MeshBasicMaterial({ color: 0xff6ad5, transparent: true, opacity: 0.55, blending: T.AdditiveBlending, depthWrite: false }));
    const pCore = new T.Mesh(new T.TorusGeometry(R, 0.2, 12, 120).rotateX(Math.PI / 2), new T.MeshBasicMaterial({ color: 0xffe2f6, transparent: true, opacity: 0.95 }));
    plasma.add(pGlow); plasma.add(pCore);
    // 자기력선: 플라스마를 감싸며 꼬여 도는 선 4가닥(자기장이 셀수록 진하다)
    const field = group(), fMat = new T.LineBasicMaterial({ color: 0x3aa0ff, transparent: true, opacity: 0.3 });
    for (let i = 0; i < 4; i++) {
      const pts = []; for (let k = 0; k <= 720; k++) { const f = k / 720 * TAU, th = 4 * f + i * TAU / 4, rho = 0.74 * r; pts.push(new T.Vector3((R + rho * Math.cos(th)) * Math.cos(f), rho * Math.sin(th), (R + rho * Math.cos(th)) * Math.sin(f))); }
      field.add(new T.Line(new T.BufferGeometry().setFromPoints(pts), fMat));
    }
    // 불꽃(플라스마가 벽에 닿은 자리)
    const sparkGeo = new T.SphereGeometry(0.13, 10, 8); let sparks = [];
    // 이름표
    const LAB = { vessel: new T.Vector3(R * Math.cos(Math.PI - turn) * 1.05, 1.25, R * Math.sin(Math.PI - turn) * 1.05), plasma: new T.Vector3(R * Math.cos(camAng), -0.85, R * Math.sin(camAng)), coil: new T.Vector3(R * Math.cos(camAng + 1.05), 1.75, R * Math.sin(camAng + 1.05)), cs: new T.Vector3(0, 2.05, 0) };
    stage.querySelectorAll('.tk-lab').forEach((e) => s.label(e, LAB[e.dataset.k]));
    let t = 0, heat = 0.6;
    const dim = new T.Color(0x6a4a8a), hot = new T.Color(0xff6ad5), cTmp = new T.Color();
    function step(dt) {
      t += dt;
      const A = (1 - B) * 0.62, dy = A * Math.sin(t * 5.3), sc = 1 + A * 0.16 * Math.sin(t * 3.9 + 1);
      plasma.position.y = dy; plasma.scale.set(sc, 1 + A * 0.3 * Math.sin(t * 4.4), sc);
      const dR = R * (sc - 1), edge = Math.hypot(dR, dy) + 0.5, touch = edge > 0.93 * r;
      heat += ((touch ? 0.12 : B > 0.6 ? 1 : 0.7) - heat) * Math.min(1, dt * (touch ? 4 : 1.2));
      pGlow.material.opacity = 0.15 + 0.5 * heat; pGlow.material.color.copy(cTmp.copy(dim).lerp(hot, heat)); pCore.material.opacity = 0.2 + 0.75 * heat;
      field.rotation.y += dt * (0.2 + 0.9 * B); fMat.opacity = 0.12 + 0.78 * B; coilMat.emissiveIntensity = 0.55 * B;
      if (touch && Math.random() < dt * 16) {
        const f = Math.random() * TAU, n = Math.hypot(dR, dy) || 1, rr = R + dR / n * r * 0.95, yy = dy / n * r * 0.95;
        const m = new T.Mesh(sparkGeo, new T.MeshBasicMaterial({ color: 0xfff3b0, transparent: true, blending: T.AdditiveBlending, depthWrite: false }));
        m.position.set(rr * Math.cos(f), yy, rr * Math.sin(f)); scene.add(m); sparks.push({ m, a: 1 });
      }
      sparks = sparks.filter((p) => { p.a -= dt * 3; if (p.a <= 0) { scene.remove(p.m); p.m.material.dispose(); return false; } p.m.material.opacity = p.a; p.m.scale.setScalar(1 + (1 - p.a) * 2.2); return true; });
      say.textContent = touch ? '자기장이 약하다 → 플라스마가 벽에 닿아 식는다'
        : B > 0.6 ? '자기장이 플라스마를 벽에 닿지 않게 가둔다 — 초고온 유지' : '조금 흔들린다. 자기장을 더 세게!';
    }
    ready = true;
    return { setActive: s.setActive, fit: s.fit, knob };
  }

  function mount(root) {
    const a = fuelCell(root), b = tokamak(root);
    const loop = window.Stage.loop((dt) => a.step(dt));
    root._future = { set: a.set, field: (v) => b.knob.set(v) };
    a.step(0);
    return {
      setActive(on) { b.setActive(on); if (on && !window.Stage.reduce) loop.start(); else { loop.stop(); a.step(0.016); } },
      fit() { b.fit(); },
    };
  }
  window.FutureTech = { mount };
})();
