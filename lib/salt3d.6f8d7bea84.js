/* 2-1 4차시 체험 «3D 염화 나트륨 결정»(교과서 69쪽 그림 Ⅱ-21). 나트륨 이온(작은 노랑)과 염화 이온(큰 초록)이 번갈아 놓인 5×5×5 결정.
   빈 곳을 끌면 둘러보고 바퀴로 다가간다. 이온을 누르면 그 이온과 바로 옆 반대 전하 이온(결정 속이면 6개)이 빛나며 막대로 이어진다.
   이온을 잡고 위로 끌면 그 층부터 위쪽이 들어 올려져 결정 속이 보인다(옆으로 끌면 돌아간다).
   Salt3D.mount(root) → { setActive, fit } · 시험용: root._n3.tap(i) · lift(k) · center() → 한가운데 이온 번호 */
(function () {
  'use strict';
  const N = 5, A = 1.1, RNA = 0.27, RCL = 0.43;
  function mount(root) {
    const stage = root.querySelector('.n3-stage'), cv = stage.querySelector('canvas'), out = root.querySelector('.n3-out'), now = root.querySelector('.n3-now');
    const V0 = { yaw: 0.7, pitch: 0.45, dist: 17, target: [0, 0, 0] };
    const s = window.Scene3D.make(stage, cv, {
      view: V0, min: 5, max: 32, pmin: -1.2, pmax: 1.3,
      onFrame(dt) { gap += (want - gap) * Math.min(1, dt * 10); place(); },
    });
    if (!s.ok) return { setActive() {}, fit() {} };
    const { T, scene } = s;
    s.renderer.setClearColor(new T.Color('#0b1026'), 1);
    scene.add(new T.HemisphereLight(0xffffff, 0x404660, 1.1));
    const key = new T.DirectionalLight(0xffffff, 1.4); key.position.set(6, 9, 8); scene.add(key);
    const g = new T.Group(); scene.add(g);
    const sticks = new T.Group(); scene.add(sticks);
    const ions = [], C = (k) => (k - (N - 1) / 2) * A;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) for (let k = 0; k < N; k++) {
      const na = (i + j + k) % 2 === 0;
      const m = new T.Mesh(new T.SphereGeometry(na ? RNA : RCL, 24, 16), new T.MeshStandardMaterial({ color: na ? 0xf2c230 : 0x4fb84a, roughness: 0.45, transparent: true, opacity: 1, emissive: na ? 0xf2c230 : 0x4fb84a, emissiveIntensity: 0.05 }));
      m.userData = { i, j, k, na, n: ions.length }; ions.push(m); g.add(m);
    }
    let cut = 3, gap = 0, want = 0, sel = null; const seen = { na: false, cl: false };
    function place() { ions.forEach((m) => { const { i, j, k } = m.userData; m.position.set(C(i), C(j) + (j >= cut ? gap : 0), C(k)); }); if (sel) link(); }
    const at = (i, j, k) => ions.find((m) => m.userData.i === i && m.userData.j === j && m.userData.k === k);
    const nbrs = (m) => { const { i, j, k } = m.userData; return [[1, 0, 0], [-1, 0, 0], [0, 1, 0], [0, -1, 0], [0, 0, 1], [0, 0, -1]].map(([a, b, c]) => at(i + a, j + b, k + c)).filter(Boolean); };
    const stickMat = new T.MeshBasicMaterial({ color: 0xffd84d });
    function link() {
      sticks.clear(); nbrs(sel).forEach((q) => {
        const a = sel.position, b = q.position, d = a.distanceTo(b);
        const c = new T.Mesh(new T.CylinderGeometry(0.06, 0.06, d, 8), stickMat);
        c.position.copy(a).add(b).multiplyScalar(0.5); c.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), b.clone().sub(a).normalize()); sticks.add(c);
      });
    }
    // 이름표
    const lab = (txt, f) => { const e = document.createElement('span'); e.className = 'g3-label s3-lab'; e.textContent = txt; stage.appendChild(e); s.label(e, f); };
    lab('나트륨 이온(Na⁺)', () => at(N - 1, N - 1, N - 1).position.clone().add(new T.Vector3(0.6, 0.6, 0.6)));
    lab('염화 이온(Cl⁻)', () => at(N - 1, N - 1, N - 2).position.clone().add(new T.Vector3(0.9, 0.7, 0)));
    function steps() {
      const ok = []; if (sel) ok.push(1); if (seen.na && seen.cl) ok.push(2); if (want > 1.2) ok.push(3);
      const st = [1, 2, 3].find((q) => !ok.includes(q)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 이온 하나를 눌러 보자' : st === 2 ? '② 반대 전하 이온도 눌러 보자' : st === 3 ? '③ 이온을 잡고 위로 끌어 층을 들어 올리자' : '양이온과 음이온이 번갈아 쌓인 규칙적인 입체 배열';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    function tap(n) {
      sel = ions[n]; const ns = nbrs(sel), na = sel.userData.na; seen[na ? 'na' : 'cl'] = true;
      ions.forEach((m) => { const on = m === sel || ns.includes(m); m.material.opacity = on ? 1 : 0.18; m.material.emissiveIntensity = m === sel ? 0.7 : on ? 0.4 : 0.05; });
      link();
      const me = na ? 'Na⁺' : 'Cl⁻', you = na ? 'Cl⁻' : 'Na⁺';
      out.innerHTML = ns.length === 6
        ? `<b>${me}</b> 하나를 <b>${you} 6개</b>가 위·아래·앞·뒤·좌·우에서 둘러싼다 — 어느 이온이나 마찬가지라 개수비 <b>1 : 1</b>`
        : `<b>${me}</b> 가장자리라 이웃 ${you}이 ${ns.length}개 — 층을 들어 올려 결정 속 이온을 눌러 보면 <b>6개</b>`;
      steps(); s.render();
    }
    function lift(k, v) { cut = Math.max(1, Math.min(N - 1, k)); want = v ?? 2.4; if (!s.active) { gap = want; place(); s.render(); } steps(); }
    // 이온을 잡고: 위아래로 끌면 층 들어 올리기, 옆으로 끌면 돌리기, 그냥 떼면 누르기
    s.grab((e) => !!s.pick(e, ions), (e) => {
      const h = s.pick(e, ions), m = h.object, x0 = e.clientX, y0 = e.clientY, w0 = want; let mode = null;
      return {
        move(ev) {
          const dx = ev.clientX - x0, dy = ev.clientY - y0;
          if (!mode && Math.hypot(dx, dy) > 8) mode = Math.abs(dy) > Math.abs(dx) && m.userData.j >= 1 ? 'lift' : 'turn';
          if (mode === 'lift') { cut = m.userData.j; want = Math.max(0, Math.min(3.5, w0 - dy * 0.02)); if (!s.active) { gap = want; place(); } steps(); }
          if (mode === 'turn') { s.view.yaw -= (ev.clientX - (this.lx ?? x0)) * 0.006; this.lx = ev.clientX; }
        },
        up(ev) { if (!mode && Math.hypot(ev.clientX - x0, ev.clientY - y0) < 8) tap(m.userData.n); },
      };
    });
    root.querySelector('.n3-home').addEventListener('click', () => { s.look(V0); want = 0; sel = null; sticks.clear(); ions.forEach((m) => { m.material.opacity = 1; m.material.emissiveIntensity = 0.05; }); if (!s.active) { gap = 0; place(); s.render(); } out.innerHTML = '소금 알갱이 하나를 아주 크게 키운 모습 — 이온을 눌러 보자'; steps(); });
    place(); out.innerHTML = '소금 알갱이 하나를 아주 크게 키운 모습 — 이온을 눌러 보자'; steps();
    root._n3 = { tap, lift, center: () => at(2, 2, 2).userData.n };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.Salt3D = { mount };
})();
