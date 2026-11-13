/* 2-2 2차시 체험 «3D 헤모글로빈과 케라틴»(교과서 83쪽 해 보기: 다양한 단백질이 형성될 수 있는 까닭). 단순화한 모형.
   짝 단추로 헤모글로빈(공 모양으로 뭉친 사슬 넷 + 사슬마다 헴 원반) ↔ 케라틴(두 나선이 꼬인 섬유 여러 가닥)을 바꾼다.
   빈 곳을 끌면 둘러보고 바퀴로 다가간다. 헤모글로빈: 빨간 산소 공을 끌어 원반에 놓으면 붙는다(넷).
   케라틴: 위 끝 손잡이를 잡아 위로 당기면 늘어났다가 놓으면 돌아온다. 사슬을 누르면 «아미노산 구슬이 이어진 사슬» 확대 띠.
   Hemo3D.mount(root) → { setActive, fit } · 시험용: root._hk.show('hemo'|'kera') · o2(n) · pull() */
(function () {
  'use strict';
  const CH = [0xef5b4c, 0x5aa9f0, 0xf2a03d, 0x5cc77a];
  function mount(root) {
    const stage = root.querySelector('.hk-stage'), cv = stage.querySelector('canvas'), out = root.querySelector('.hk-out'), now = root.querySelector('.hk-now');
    const btns = [...root.querySelectorAll('.hk-kind button')], zoom = root.querySelector('.hk-zoom');
    const V0 = { yaw: 0.5, pitch: 0.25, dist: 16, target: [0, 0, 0] };
    const spun = { hemo: 0, kera: 0 };
    let kind = 'hemo', filled = 0, stretch = 0, holding = false, pulled = false, ly = V0.yaw, lp = V0.pitch;
    const s = window.Scene3D.make(stage, cv, {
      view: V0, min: 7, max: 30, pmin: -1.3, pmax: 1.3,
      onFrame(dt) {
        if (!holding && stretch > 0) { stretch = Math.max(0, stretch - dt * 1.8); fiber.scale.y = 1 + stretch; }
        if (back) { o2.position.lerp(home, Math.min(1, dt * 8)); if (o2.position.distanceTo(home) < 0.02) back = false; }
      },
      onRender() { spun[kind] += Math.abs(s.view.yaw - ly) + Math.abs(s.view.pitch - lp); ly = s.view.yaw; lp = s.view.pitch; if (spun.hemo > 1.5 && spun.kera > 1.5 && !did1) { did1 = true; steps(); } },
      click(e) { if (s.pick(e, kind === 'hemo' ? chains : ropes)) chainTap(); },
    });
    let did1 = false, back = false;
    if (!s.ok) return { setActive() {}, fit() {} };
    const { T, scene, camera } = s;
    // 바탕 그러데이션 + 뒤쪽 테두리 빛 + 바닥에 드리운 옅은 그림자(삽화 느낌)
    const cvs = document.createElement('canvas'); cvs.width = 4; cvs.height = 256; { const g = cvs.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#26335f'); gr.addColorStop(1, '#090e1f'); g.fillStyle = gr; g.fillRect(0, 0, 4, 256); }
    scene.background = new T.CanvasTexture(cvs); scene.background.colorSpace = T.SRGBColorSpace;
    const rim = new T.DirectionalLight(0x9fc4ff, 0.9); rim.position.set(-6, 3, -8); scene.add(rim);
    const shadowDisc = (r, y) => { const c2 = document.createElement('canvas'); c2.width = c2.height = 128; const g = c2.getContext('2d'), gr = g.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const m = new T.Mesh(new T.PlaneGeometry(r * 2, r * 2), new T.MeshBasicMaterial({ map: new T.CanvasTexture(c2), transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = y; scene.add(m); return m; };
    scene.add(new T.HemisphereLight(0xffffff, 0x404660, 1.1));
    const key = new T.DirectionalLight(0xffffff, 1.3); key.position.set(6, 9, 8); scene.add(key); s.fill();
    const mat = (c, e = 0.06) => new T.MeshPhysicalMaterial({ color: c, roughness: 0.32, clearcoat: 0.5, clearcoatRoughness: 0.3, emissive: c, emissiveIntensity: e });
    // 케라틴 밧줄 결: 비스듬한 줄무늬 무늬 결(반복 텍스처)
    const grain = (() => { const c2 = document.createElement('canvas'); c2.width = 64; c2.height = 16; const g = c2.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, 64, 16); g.strokeStyle = 'rgba(80,50,20,.45)'; g.lineWidth = 3; for (let x = -16; x < 80; x += 8) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 8, 16); g.stroke(); } const tx = new T.CanvasTexture(c2); tx.wrapS = tx.wrapT = T.RepeatWrapping; tx.repeat.set(40, 2); return tx; })();

    // 헤모글로빈: 네 사슬이 구 둘레 사분면에 뭉친다(난수 고정)
    const hemo = new T.Group(); scene.add(hemo);
    let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const chains = [], hemes = [];
    [[1, 1, 1], [-1, 1, -1], [1, -1, -1], [-1, -1, 1]].forEach((q, i) => {
      const c = new T.Vector3(...q).multiplyScalar(1.05);
      // 단백질 리본(11/10): 나선 구간 = 꼬인 납작한 띠, 사이 = 가는 관. 사슬마다 나선 셋이 제 사분면에 뭉친다
      const m = new T.Group(), cm = mat(CH[i]); cm.side = T.DoubleSide;
      let prev = null;
      for (let h = 0; h < 3; h++) {
        const ax = new T.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).normalize(), o = c.clone().add(new T.Vector3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(1.4));
        const u = new T.Vector3().crossVectors(ax, Math.abs(ax.y) < 0.9 ? new T.Vector3(0, 1, 0) : new T.Vector3(1, 0, 0)).normalize(), v = new T.Vector3().crossVectors(ax, u);
        const n = 64, turns = 2.5, len = 1.6, r = 0.38, w = 0.22, pos = [];
        let first = null, last = null;
        for (let k = 0; k <= n; k++) {
          const t = k / n, a = t * turns * Math.PI * 2, P = o.clone().addScaledVector(ax, (t - 0.5) * len).addScaledVector(u, Math.cos(a) * r).addScaledVector(v, Math.sin(a) * r);
          pos.push(...P.clone().addScaledVector(ax, -w).toArray(), ...P.clone().addScaledVector(ax, w).toArray());
          if (!k) first = P; last = P;
        }
        const idx = []; for (let k = 0; k < n; k++) idx.push(2 * k, 2 * k + 1, 2 * k + 2, 2 * k + 1, 2 * k + 3, 2 * k + 2);
        const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
        m.add(new T.Mesh(geo, cm));
        if (prev) { const mid = prev.clone().add(first).multiplyScalar(0.5).lerp(c, -0.35); m.add(new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3([prev, mid, first]), 24, 0.09, 8, false), cm)); }
        prev = last;
      }
      hemo.add(m); chains.push(m);
      const hp = c.clone().multiplyScalar(1.75);
      const disc = new T.Mesh(new T.CylinderGeometry(0.55, 0.55, 0.14, 24), new T.MeshPhysicalMaterial({ color: 0xb3202f, roughness: 0.15, clearcoat: 1, emissive: 0x5a0a12, emissiveIntensity: 0.6 }));
      disc.position.copy(hp); disc.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), hp.clone().normalize());
      const fe = new T.Mesh(new T.SphereGeometry(0.18, 14, 10), mat(0xf2a03d, 0.4)); fe.position.copy(hp);
      hemo.add(disc, fe); hemes.push({ p: hp, full: false });
    });
    hemo.add(shadowDisc(3.6, -3.2));
    const home = new T.Vector3(4.6, 2.6, 0);
    const o2 = new T.Mesh(new T.SphereGeometry(0.42, 22, 14), mat(0xff3b30, 0.35)); o2.position.copy(home); hemo.add(o2);
    const bound = [];

    // 케라틴: 두 나선이 꼬인 밧줄 세 가닥
    const fiber = new T.Group(); scene.add(fiber);
    const ropes = [];
    [-1.6, 0, 1.6].forEach((x, r) => [0, Math.PI].forEach((ph, k) => {
      const pts = []; for (let t = 0; t <= 1.0001; t += 0.01) { const a = t * Math.PI * 10 + ph; pts.push(new T.Vector3(x + Math.cos(a) * 0.32, (t - 0.5) * 8, Math.sin(a) * 0.32 + (r - 1) * 0.3)); }
      const rm = new T.MeshStandardMaterial({ color: k ? 0xc89b6d : 0x8d6a4a, roughness: 0.75, map: grain }); const m = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 200, 0.2, 8, false), rm); fiber.add(m); ropes.push(m);
    }));
    const knob = new T.Mesh(new T.SphereGeometry(0.4, 18, 12), mat(0xffd84d, 0.4)); knob.position.set(0, 4.3, 0); fiber.add(knob);

    function steps() {
      const ok = []; if (did1) ok.push(1); if (filled >= 4) ok.push(2); if (pulled) ok.push(3);
      const st = [1, 2, 3].find((q) => !ok.includes(q)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? `① ${spun.hemo > 1.5 ? '케라틴으로 바꿔' : '빈 곳을 끌어'} 돌려 보자` : st === 2 ? '② 빨간 산소를 끌어 원반에 붙이자' : st === 3 ? '③ 케라틴 위 노란 손잡이를 위로 당기자' : '같은 아미노산, 다른 배열 → 다른 구조·기능';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    function chainTap() {
      zoom.hidden = false;
      out.innerHTML = '사슬을 확대하면 <b>아미노산 구슬</b>이 <b>펩타이드 결합</b>으로 줄줄이 이어져 있다 — 헤모글로빈도 케라틴도 같다(공통점)';
    }
    function show(k) {
      kind = k; hemo.visible = k === 'hemo'; fiber.visible = k === 'kera';
      btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === k)));
      out.innerHTML = k === 'hemo' ? '<b>헤모글로빈</b> 적혈구 속 공 모양 단백질 — 사슬 넷이 뭉치고 사슬마다 철이 든 원반(헴)이 있어 <b>산소</b>를 붙잡아 나른다'
        : '<b>케라틴</b> 머리카락·손톱의 단백질 — 나선 사슬이 밧줄처럼 꼬여 <b>질기고 잘 끊어지지 않는</b> 섬유가 된다';
      steps(); s.render();
    }
    function attach(i) {
      const h = hemes[i]; h.full = true; filled += 1;
      const b = o2.clone(); b.position.copy(h.p.clone().multiplyScalar(1.12)); hemo.add(b); bound.push(b);
      o2.position.copy(home); o2.visible = filled < 4;
      out.innerHTML = filled < 4 ? `산소 ${filled}개 붙음 — 원반 속 <b>철</b>이 산소를 붙잡는다` : '산소 <b>넷</b> 모두 붙었다 — 폐에서 산소를 싣고 온몸의 조직으로 나른다';
      steps();
    }
    // 끌 물체용 광선(화면 좌표 → 카메라를 향한 평면 위 점)
    const ray = new T.Raycaster(), ndc = new T.Vector2();
    function onPlane(e, through) {
      const r = cv.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const n = camera.getWorldDirection(new T.Vector3()).negate();
      return ray.ray.intersectPlane(new T.Plane().setFromNormalAndCoplanarPoint(n, through), new T.Vector3());
    }
    s.grab((e) => kind === 'hemo' && o2.visible && !!s.pick(e, [o2]), () => ({
      move(e) { const p = onPlane(e, o2.position); if (p) o2.position.copy(p); },
      up() { const i = hemes.findIndex((h) => !h.full && h.p.distanceTo(o2.position) < 1.3); if (i >= 0) attach(i); else back = true; },
    }));
    s.grab((e) => kind === 'kera' && !!s.pick(e, [knob]), (e) => {
      holding = true; const y0 = e.clientY;
      return {
        move(ev) { stretch = Math.max(0, Math.min(0.6, (y0 - ev.clientY) / 300)); fiber.scale.y = 1 + stretch; if (stretch > 0.25 && !pulled) { pulled = true; out.innerHTML = '당기면 꼬인 나선이 <b>늘어났다가</b> 놓으면 돌아온다 — 끊어지지 않는 질긴 섬유'; steps(); } },
        up() { holding = false; },
      };
    });
    btns.forEach((b) => b.addEventListener('click', () => show(b.dataset.k)));
    root.querySelector('.hk-home').addEventListener('click', () => s.look(V0));
    show('hemo');
    root._hk = {
      show, o2(n) { for (let k = 0; k < n; k++) { const i = hemes.findIndex((h) => !h.full); if (i >= 0) attach(i); } s.render(); },
      pull() { show('kera'); stretch = 0.5; fiber.scale.y = 1.5; pulled = true; steps(); s.render(); },
      spin() { spun.hemo = spun.kera = 2; did1 = true; steps(); },
    };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.Hemo3D = { mount };
})();
