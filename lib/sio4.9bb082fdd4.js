/* 2-2 1차시 체험 «3D 규산염 사면체»(교과서 80쪽 그림 Ⅱ-27). 가운데 규소(작은 공), 네 꼭짓점에 산소(큰 빨간 공), 반투명 정사면체.
   빈 곳을 끌면 둘러보고 바퀴로 다가간다. 원자를 누르면 풀이. 산소를 잡아 바깥으로 끌면 그 결합의 공유 전자쌍(노란 점 둘)이 보이고,
   놓으면 용수철처럼 제자리로 돌아온다. 전하 −4(SiO₄⁴⁻)는 다른 교과서·참고서 내용.
   SiO4.mount(root) → { setActive, fit } · 시험용: root._s4.tap('Si'|'O') · pull() */
(function () {
  'use strict';
  const R = 2.2; // 규소–산소 거리
  function mount(root) {
    const stage = root.querySelector('.s4-stage'), cv = stage.querySelector('canvas'), out = root.querySelector('.s4-out'), now = root.querySelector('.s4-now');
    const V0 = { yaw: 0.6, pitch: 0.35, dist: 11, target: [0, 0, 0] };
    let ext = [0, 0, 0, 0], held = -1, turned = 0, lastYaw = V0.yaw, lastPitch = V0.pitch;
    const did = { si: false, pull: false };
    const s = window.Scene3D.make(stage, cv, {
      view: V0, min: 5, max: 24, pmin: -1.3, pmax: 1.3,
      onFrame(dt) { ext = ext.map((e, i) => (i === held ? e : e * Math.max(0, 1 - dt * 7))); place(); },
      onRender() { turned += Math.abs(s.view.yaw - lastYaw) + Math.abs(s.view.pitch - lastPitch); lastYaw = s.view.yaw; lastPitch = s.view.pitch; if (turned > 2.4 && !did.turn) { did.turn = true; steps(); } },
      click(e) { if (s.pick(e, [si])) tap('Si'); },
    });
    if (!s.ok) return { setActive() {}, fit() {} };
    const { T, scene } = s;
    s.renderer.setClearColor(0x000000, 0); stage.querySelector('canvas').style.background = 'radial-gradient(ellipse at 40% 35%, #2a3a6e 0%, #121a38 55%, #080c1c 100%)'; // 11/10: 깊이 있는 바탕
    scene.add(new T.HemisphereLight(0xffffff, 0x303656, 0.85));
    const rim = new T.DirectionalLight(0x9fc0ff, 0.9); rim.position.set(-6, 3, -8); scene.add(rim);
    const key = new T.DirectionalLight(0xffffff, 1.3); key.position.set(5, 8, 7); scene.add(key); s.fill(); s.softShadow(R * 1.7, -R - 0.9, 0.6);
    const geo = new T.TetrahedronGeometry(R);
    const dirs = [[1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]].map((v) => new T.Vector3(...v).normalize());
    const face = new T.Mesh(geo, new T.MeshPhysicalMaterial({ color: 0x8fbaff, transparent: true, opacity: 0.24, roughness: 0.1, side: T.DoubleSide, depthWrite: false }));
    const edges = new T.LineSegments(new T.EdgesGeometry(geo), new T.LineBasicMaterial({ color: 0xbfd4ff }));
    scene.add(face, edges);
    const si = new T.Mesh(new T.SphereGeometry(0.42, 32, 20), new T.MeshPhysicalMaterial({ color: 0x9fb2d0, roughness: 0.25, metalness: 0.2, clearcoat: 0.8, emissive: 0x9aa3b5, emissiveIntensity: 0.08 }));
    scene.add(si);
    const oMat = () => new T.MeshPhysicalMaterial({ color: 0xe0503f, roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.2, emissive: 0xe0503f, emissiveIntensity: 0.06 });
    const os = dirs.map((d, i) => { const m = new T.Mesh(new T.SphereGeometry(0.7, 32, 20), oMat()); m.userData.i = i; scene.add(m); return m; });
    const bondMat = new T.MeshStandardMaterial({ color: 0xd8dde8, roughness: 0.5 });
    const bonds = dirs.map(() => { const c = new T.Mesh(new T.CylinderGeometry(0.09, 0.09, 1, 10), bondMat); scene.add(c); return c; });
    const eMat = new T.MeshBasicMaterial({ color: 0xffd84d });
    const pairs = dirs.map(() => [0, 1].map(() => { const m = new T.Mesh(new T.SphereGeometry(0.14, 14, 10), eMat); m.visible = false; scene.add(m); return m; }));
    const up = new T.Vector3(0, 1, 0), side = new T.Vector3();
    function place() {
      os.forEach((m, i) => {
        const d = dirs[i], p = d.clone().multiplyScalar(R + ext[i]); m.position.copy(p);
        const b = bonds[i]; b.position.copy(p).multiplyScalar(0.5); b.scale.set(1, p.length(), 1); b.quaternion.setFromUnitVectors(up, d);
        side.crossVectors(d, Math.abs(d.y) > 0.9 ? new T.Vector3(1, 0, 0) : up).normalize().multiplyScalar(0.22);
        const mid = d.clone().multiplyScalar((R + ext[i]) * 0.5);
        pairs[i].forEach((e, k) => { e.position.copy(mid).addScaledVector(side, k ? 1 : -1); e.visible = ext[i] > 0.25; });
      });
    }
    const lab = (txt, f) => { const e = document.createElement('span'); e.className = 'g3-label s3-lab'; e.textContent = txt; stage.appendChild(e); s.label(e, f); };
    lab('규소(Si)', () => new T.Vector3(0, -0.85, 0));
    lab('산소(O)', () => os[0].position.clone().add(new T.Vector3(0.6, 0.9, 0.3)));
    function steps() {
      const ok = []; if (did.si) ok.push(1); if (did.pull) ok.push(2); if (did.turn) ok.push(3);
      const st = [1, 2, 3].find((q) => !ok.includes(q)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 가운데 규소를 눌러 보자' : st === 2 ? '② 산소 하나를 잡아 바깥으로 끌어 보자' : st === 3 ? '③ 빈 곳을 끌어 이리저리 돌려 보자' : '규소 1개 + 산소 4개 = 정사면체';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    function glow(m) { [si, ...os].forEach((x) => { x.material.emissiveIntensity = x === m ? 0.55 : 0.08; }); }
    function tap(k) {
      if (k === 'Si') {
        did.si = true; glow(si);
        out.innerHTML = '<b>규소(Si)</b> 14족, 바깥 껍질 전자(원자가 전자) <b>4개</b> → 둘레의 산소 넷과 전자쌍을 하나씩 나눠 가진다(공유 결합). 그래서 사면체 한가운데 자리';
      } else {
        glow(os[0]);
        out.innerHTML = '<b>산소(O)</b> 사면체의 네 꼭짓점. 꼭짓점 산소는 <b>이웃 사면체와 함께 쓸 수 있는 자리</b> — 여기서 사면체끼리 이어진다. 산소를 잡아 바깥으로 끌어 보자';
      }
      steps(); s.render();
    }
    function pulled(i) {
      did.pull = true;
      out.innerHTML = '산소를 떼어 내니 결합 사이의 <b>노란 전자 두 개</b>(공유 전자쌍)가 보인다 — 규소와 산소가 하나씩 내놓은 것. 놓으면 다시 붙는다.<br><small>사면체 하나는 SiO₄⁴⁻, 전체 전하 <b>−4</b> → 양이온과 붙거나 이웃 사면체와 산소를 함께 써서 중성에 가까워진다</small>';
      glow(os[i]); steps();
    }
    // 산소를 잡고 끌기: 화면에서 규소→산소 방향으로 끈 만큼 바깥으로
    s.grab((e) => !!s.pick(e, os), (e) => {
      const i = s.pick(e, os).object.userData.i, x0 = e.clientX, y0 = e.clientY;
      const p0 = s.toClient(new T.Vector3()), p1 = s.toClient(dirs[i].clone().multiplyScalar(R));
      const dx = p1.x - p0.x, dy = p1.y - p0.y, L = Math.hypot(dx, dy) || 1;
      held = i; let moved = false;
      return {
        move(ev) {
          const t = ((ev.clientX - x0) * dx + (ev.clientY - y0) * dy) / L;
          if (Math.hypot(ev.clientX - x0, ev.clientY - y0) > 6) moved = true;
          ext[i] = Math.max(0, Math.min(2.2, t / L * R)); place();
          if (ext[i] > 0.4 && !did.pull) pulled(i);
        },
        up() { held = -1; if (!moved) tap('O'); if (!s.active) { ext[i] = 0; place(); s.render(); } },
      };
    });
    root.querySelector('.s4-home').addEventListener('click', () => s.look(V0));
    place(); out.innerHTML = '모래·유리의 주성분 속 가장 작은 «블록» — 원자를 눌러 보자'; steps();
    root._s4 = { tap, pull: () => { ext[0] = 1.2; place(); pulled(0); s.render(); } };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.SiO4 = { mount };
})();
