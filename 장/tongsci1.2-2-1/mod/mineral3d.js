/* 2-2 1차시 체험 «3D 규산염 광물 다섯 가지»(교과서 81쪽 그림 Ⅱ-28). 규산염 사면체 묶음을 다섯 가지 결합 방식으로 늘어놓는다.
   독립형(감람석, 사면체가 떨어져 있고 사이에 마그네슘·철 이온) · 단사슬(휘석) · 복사슬(각섬석) · 판상(흑운모) · 망상(석영, 다이아몬드꼴로 단순화).
   위 단추로 고르면 사면체들이 날아와 새 모양으로 모인다. 이웃과 함께 쓰는 산소는 노랑. 빈 곳을 끌면 둘러보고 바퀴로 다가간다.
   사면체를 잡아 끌어 내면 그 사면체가 이웃과 나눈 산소 수가 나오고, 놓으면 돌아간다. 풍화에 강한 정도는 참고서 내용.
   Mineral3D.mount(root) → { setActive, fit } · 시험용: root._m3.pick(0~4) · pull() */
(function () {
  'use strict';
  const S = [
    { k: 'oliv', col: '어두운 초록', form: '짧은 기둥 · 깨짐', n: '독립형 구조', m: '감람석', share: '0개', ratio: '1 : 4', w: 1, d: '사면체끼리 떨어져 있고, 사이의 마그네슘·철 이온이 붙잡아 준다' },
    { k: 'augi', col: '어두운색', form: '짧은 기둥 · 두 방향 쪼개짐', n: '단사슬 구조', m: '휘석', share: '2개', ratio: '1 : 3', w: 2, d: '양쪽 꼭짓점 산소를 이웃과 나눠 한 줄로 길게 이어진다' },
    { k: 'horn', col: '어두운색', form: '긴 기둥 · 두 방향 쪼개짐', n: '복사슬 구조', m: '각섬석', share: '2개·3개 번갈아', ratio: '4 : 11', w: 3, d: '한 줄 사슬 두 개가 나란히 손을 잡아 두 줄이 된다' },
    { k: 'biot', col: '검은색', form: '판 · 한 방향 쪼개짐', n: '판상 구조', m: '흑운모', share: '3개', ratio: '2 : 5', w: 4, d: '바닥 산소 셋을 모두 나눠 얇은 판으로 펼쳐진다' },
    { k: 'quar', col: '밝은색', form: '육각기둥 · 깨짐(석영)', n: '망상 구조', m: '석영·장석', share: '4개', ratio: '1 : 2', w: 5, d: '산소 넷을 모두 나눠 사방으로 이어진 입체 그물' },
  ];
  const A = 1.5, H = A * Math.sqrt(2 / 3), Z = A * Math.sqrt(3) / 2;
  function mount(root) {
    const stage = root.querySelector('.m3-stage'), cv = stage.querySelector('canvas'), out = root.querySelector('.m3-out'), now = root.querySelector('.m3-now'), info = root.querySelector('.m3-info');
    const btns = [...root.querySelectorAll('.m3-kind button')], photos = [...root.querySelectorAll('.m3-photo img')];
    const V0 = { yaw: 0.5, pitch: 0.75, dist: 17, target: [0, 0.4, 0] };
    let cur = 0, tets = [], held = null; const seen = new Set(), did = { pull: false, net: false };
    const s = window.Scene3D.make(stage, cv, {
      view: V0, min: 6, max: 34, pmin: -1.3, pmax: 1.45,
      onFrame(dt) { tets.forEach((t) => { t.p = Math.min(1, t.p + dt * 1.6); if (t !== held) t.off.multiplyScalar(Math.max(0, 1 - dt * 6)); pose(t); }); },
    });
    if (!s.ok) return { setActive() {}, fit() {} };
    const { T, scene } = s;
    s.renderer.setClearColor(0x000000, 0); stage.querySelector('canvas').style.background = 'radial-gradient(ellipse at 40% 35%, #2a3a6e 0%, #121a38 55%, #080c1c 100%)'; // 11/10: 깊이 있는 바탕
    scene.add(new T.HemisphereLight(0xffffff, 0x303656, 0.85));
    const rim = new T.DirectionalLight(0x9fc0ff, 0.9); rim.position.set(-6, 3, -8); scene.add(rim);
    const key = new T.DirectionalLight(0xffffff, 1.3); key.position.set(6, 10, 7); scene.add(key); s.fill();
    const world = new T.Group(); scene.add(world);
    const V = (x, y, z) => new T.Vector3(x, y, z);
    // 바닥 세 점(y=0)에서 꼭대기가 위인 사면체
    const fromBase = (a, b, c) => { const cen = a.clone().add(b).add(c).divideScalar(3); return { si: cen.clone().setY(H / 4), os: [a, b, c, cen.clone().setY(H)] }; };
    function layout(i) {
      const L = [], ions = [];
      if (i === 0) for (let x = -1; x <= 1; x++) for (let z = -1; z <= 1; z++) {
        const c = V(x * 3.2, 0, z * 3.2), f = (x + z) % 2 ? -1 : 1;
        L.push(fromBase(c.clone().add(V(-A / 2, 0, -f * Z / 3)), c.clone().add(V(A / 2, 0, -f * Z / 3)), c.clone().add(V(0, 0, f * Z * 2 / 3))));
        if (x < 1 && z < 1) ions.push(V(x * 3.2 + 1.6, 0.5, z * 3.2 + 1.6));
      }
      const chain = (z0, inward, n = 6) => { for (let k = 0; k < n; k++) { const x = (k - (n - 1) / 2) * A; L.push(fromBase(V(x - A / 2, 0, z0), V(x + A / 2, 0, z0), V(x, 0, z0 + inward(k) * Z))); } };
      if (i === 1) chain(0, (k) => (k % 2 ? -1 : 1));
      if (i === 2) { chain(-Z, (k) => (k % 2 ? -1 : 1)); chain(Z, (k) => (k % 2 ? 1 : -1)); }
      if (i === 3) for (let a = 0; a < 3; a++) for (let b = 0; b < 3; b++) {
        const P = V(a * 2 * A + b * A - 3 * A, 0, b * 2 * Z - 2 * Z);
        L.push(fromBase(P.clone(), P.clone().add(V(A, 0, 0)), P.clone().add(V(A / 2, 0, Z))));
        L.push(fromBase(P.clone().add(V(A, 0, 0)), P.clone().add(V(2 * A, 0, 0)), P.clone().add(V(1.5 * A, 0, -Z))));
      }
      if (i === 4) { // 다이아몬드꼴 그물: 규소 사이 한가운데에 산소
        const q = (A * Math.sqrt(6) / 4) / (Math.sqrt(3) / 2), D = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]];
        const add = (p, sg) => L.push({ si: V(...p).multiplyScalar(q), os: D.map((d) => V(p[0] + sg * d[0] / 2, p[1] + sg * d[1] / 2, p[2] + sg * d[2] / 2).multiplyScalar(q)) });
        for (const x of [0, 2, 4]) for (const y of [0, 2, 4]) for (const z of [0, 2, 4]) if ((x + y + z) % 4 === 0) add([x, y, z], 1);
        for (const x of [0, 2]) for (const y of [0, 2]) for (const z of [0, 2]) if ((x + y + z) % 4 === 0) add([x + 1, y + 1, z + 1], -1);
        L.forEach((t) => { [t.si, ...t.os].forEach((p) => p.sub(V(2.5 * q, 2.5 * q, 2.5 * q))); });
      }
      return { L, ions };
    }
    const kOf = (p) => `${p.x.toFixed(2)},${p.y.toFixed(2)},${p.z.toFixed(2)}`;
    const siMat = new T.MeshPhysicalMaterial({ color: 0x9fb2d0, roughness: 0.25, metalness: 0.2, clearcoat: 0.8 });
    const oMat = new T.MeshPhysicalMaterial({ color: 0xd9483b, roughness: 0.32, clearcoat: 0.7, clearcoatRoughness: 0.2 }), shMat = new T.MeshPhysicalMaterial({ color: 0xffc928, roughness: 0.25, clearcoat: 0.8, emissive: 0xffb000, emissiveIntensity: 0.55 });
    const ionMat = new T.MeshPhysicalMaterial({ color: 0x5cc77a, roughness: 0.3, clearcoat: 0.6 });
    // 가운데 사면체만 또렷하게, 나머지는 옅게(11/10: 망상 구조가 너무 복잡해 «산소 넷을 모두 나눈다»가 안 보임)
    const dim = (m) => { const d = m.clone(); d.transparent = true; d.opacity = 0.4; d.depthWrite = false; if (d.emissiveIntensity) d.emissiveIntensity *= 0.4; return d; };
    const siDim = dim(siMat), oDim = dim(oMat), shDim = dim(shMat);
    function pose(t) {
      const e = 1 - Math.pow(1 - Math.max(0, t.p), 3);
      t.g.position.copy(t.home).addScaledVector(t.from, 1 - e).add(t.off);
    }
    function build(i) {
      world.clear(); let { L, ions } = layout(i); const cnt = {};
      L.forEach((t) => t.os.forEach((p) => { cnt[kOf(p)] = (cnt[kOf(p)] || 0) + 1; }));
      const nShared = (t) => t.os.filter((p) => cnt[kOf(p)] > 1).length;
      const focus = L.reduce((b, t) => (nShared(t) > nShared(b) || (nShared(t) === nShared(b) && t.si.length() < b.si.length()) ? t : b));
      if (i === 4) { const fk = new Set(focus.os.map(kOf)); L = L.filter((t) => t === focus || t.os.some((p) => fk.has(kOf(p)))); } // 망상은 가운데 하나와 이웃 넷만
      tets = L.map((t, n) => { const on = t === focus;
        const g = new T.Group(); world.add(g); g.userData.t = n;
        const rel = (p) => p.clone().sub(t.si);
        const geo = new T.BufferGeometry().setFromPoints([0, 1, 2, 0, 1, 3, 1, 2, 3, 0, 2, 3].map((k) => rel(t.os[k])));
        g.add(new T.Mesh(geo, new T.MeshBasicMaterial({ color: on ? 0x9cc4ff : 0x8fbaff, transparent: true, opacity: on ? 0.38 : 0.1, side: T.DoubleSide, depthWrite: false })));
        g.add(new T.LineSegments(new T.EdgesGeometry(geo), new T.LineBasicMaterial({ color: on ? 0xffffff : 0xbfd4ff, transparent: !on, opacity: on ? 1 : 0.35 })));
        g.add(new T.Mesh(new T.SphereGeometry(on ? 0.26 : 0.2, 16, 10), on ? siMat : siDim));
        const shared = t.os.filter((p) => cnt[kOf(p)] > 1).length;
        t.os.forEach((p) => { const sh = cnt[kOf(p)] > 1, m = new T.Mesh(new T.SphereGeometry(on ? 0.38 : 0.32, 18, 12), on ? (sh ? shMat : oMat) : (sh ? shDim : oDim)); m.position.copy(rel(p)); g.add(m); });
        const from = V(Math.random() - 0.5, Math.random() * 0.8 + 0.2, Math.random() - 0.5).normalize().multiplyScalar(9);
        return { g, home: t.si.clone(), from, off: V(0, 0, 0), p: -n * 0.05, shared };
      });
      ions.forEach((p) => { const m = new T.Mesh(new T.SphereGeometry(0.34, 18, 12), ionMat); m.position.copy(p); world.add(m); });
      const ys = L.flatMap((t) => t.os.map((p) => p.y)), xs = L.flatMap((t) => t.os.map((p) => Math.hypot(p.x, p.z)));
      s.softShadow(Math.max(...xs) + 2.5, Math.min(...ys) - 0.8, 0.6, world);
      if (!s.active) tets.forEach((t) => { t.p = 1; pose(t); });
      else tets.forEach((t) => pose(t));
      s.render();
    }
    function steps() {
      const ok = []; if (seen.size === 5) ok.push(1); if (did.pull) ok.push(2); if (did.net) ok.push(3);
      const st = [1, 2, 3].find((q) => !ok.includes(q)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? `① 위 단추로 다섯 구조를 모두 보자(${seen.size}/5)` : st === 2 ? '② 사면체 하나를 잡아 끌어 내 보자' : st === 3 ? '③ 망상 구조에서 사면체를 끌어 내 보자' : '나누는 산소가 많을수록 단단하게 얽힌다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    function pick(i) {
      cur = i; seen.add(i); const d = S[i];
      btns.forEach((b, k) => b.setAttribute('aria-pressed', String(k === i)));
      photos.forEach((p) => { p.hidden = p.dataset.k !== d.k; });
      info.innerHTML = `<tr><th>대표 광물</th><td><b>${d.m}</b></td></tr><tr><th>이웃과 나누는 산소</th><td>${d.share}</td></tr><tr><th>규소 : 산소</th><td>${d.ratio}</td></tr>`
        + `<tr><th>색</th><td>${d.col}</td></tr><tr><th>결정 모양 · 부서짐</th><td>${d.form}</td></tr>`
        + `<tr><th>풍화에 강한 정도</th><td><span class="m3-bar"><i style="width:${d.w * 20}%"></i></span></td></tr>`;
      out.innerHTML = `<b>${d.n}</b>(${d.m}) — ${d.d}. 노란 산소 = 이웃 사면체와 함께 쓰는 산소`;
      build(i); steps();
    }
    function pulled(t) {
      did.pull = true; if (cur === 4 && t.shared === 4) did.net = true;
      out.innerHTML = `끌어 낸 사면체는 이웃과 산소 <b>${t.shared}개</b>를 함께 쓰고 있었다${t.shared === 4 ? ' — 네 꼭짓점 모두! 그래서 석영은 쉽게 부서지지 않는다' : t.shared === 0 ? ' — 하나도 안 나눠서 양이온이 대신 붙잡아 준다' : ''}`;
      steps();
    }
    const meshes = () => tets.flatMap((t) => t.g.children);
    const owner = (o) => { while (o && o.userData.t === undefined) o = o.parent; return o ? tets[o.userData.t] : null; };
    s.grab((e) => !!s.pick(e, meshes()), (e) => {
      const t = owner(s.pick(e, meshes()).object), x0 = e.clientX, y0 = e.clientY, o0 = t.off.clone();
      const right = V(1, 0, 0).applyQuaternion(s.camera.quaternion), upv = V(0, 1, 0).applyQuaternion(s.camera.quaternion), k = s.view.dist * 0.0022;
      held = t; let shown = false;
      return {
        move(ev) {
          t.off.copy(o0).addScaledVector(right, (ev.clientX - x0) * k).addScaledVector(upv, -(ev.clientY - y0) * k); pose(t);
          if (!shown && t.off.length() > 1) { shown = true; pulled(t); }
        },
        up() { held = null; if (!s.active) { t.off.set(0, 0, 0); pose(t); s.render(); } },
      };
    });
    btns.forEach((b, i) => b.addEventListener('click', () => pick(i)));
    root.querySelector('.m3-home').addEventListener('click', () => s.look(V0));
    pick(0);
    root._m3 = { pick, pull: () => { const t = tets.reduce((b, x) => (x.shared > b.shared ? x : b)); t.off.set(0, 2, 0); pose(t); pulled(t); s.render(); } };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.Mineral3D = { mount };
})();
