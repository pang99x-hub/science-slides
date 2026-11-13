/* 엘니뇨(교과서 86쪽 그림 Ⅱ-13, 라니냐는 지도상의 유의점): 3D 적도 태평양 단면. 왼쪽(서) 동남아시아·오스트레일리아, 오른쪽(동) 남아메리카.
   바다를 동 → 서(오른쪽 → 왼쪽)로 쓸어 넘기는 빠르기가 무역풍 세기 W가 된다(빠르게 = 강하게, 천천히·반대로 = 약하게). ←·→ 키도 된다.
   해수는 늦게 따라온다: 기울기 τ'' = 3(W − τ) − 1.6τ' (출렁이며 맞춰 감). 따뜻한 해수층 두께 h(x) = 1.6 − 2.8τ·x/12(서쪽이 두껍다),
   동쪽은 얇아져 찬물이 솟는다(용승 ∝ W). 비구름은 따뜻한 물 위에서 생긴다: 평상시 서쪽, 무역풍이 약하면 동쪽으로 옮겨 간다.
   τ < 0.3 엘니뇨, τ > 0.78 라니냐. 모든 크기는 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const N = 48, X0 = -12, X1 = 12, ZD = 3;

  function mount(root) {
    const stage = root.querySelector('.en-stage'), canvas = stage.querySelector('canvas');
    const labs = Object.fromEntries([...stage.querySelectorAll('.en-lab')].map((e) => [e.dataset.k, e]));
    const now = stage.querySelector('.en-now'), state = stage.querySelector('.en-state');
    const windBar = root.querySelector('.en-wbar i'), windTxt = root.querySelector('.en-wtxt');
    const out = Object.fromEntries([...root.querySelectorAll('[data-o]')].map((e) => [e.dataset.o, e]));
    let W = 0.55, tau = 0.55, vel = 0, tm = 0, swiped = false, selected='';
    const EXPLAIN={west:'서태평양: 평상시 따뜻한 물이 두껍게 쌓인다.',east:'동태평양: 평상시 깊은 찬물이 올라온다.',warm:'따뜻한 층: 바람이 약해지면 동쪽으로 퍼진다.',cold:'찬 해수: 용승으로 표면에 다가오며 영양분도 나른다.',trade:'무역풍: 동쪽에서 서쪽으로 표층 해수를 민다.',up:'용승: 깊은 찬 바닷물이 위로 올라오는 흐름.',tc:'수온 약층: 깊이에 따라 수온이 급히 달라지는 경계.',rain:'비구름: 따뜻한 수면 위의 상승 기류와 연결한다.'};
    Object.values(labs).forEach(el=>el.addEventListener('click',()=>{selected=el.dataset.k;Object.values(labs).forEach(x=>x.classList.toggle('o3-pick',x===el));root.querySelector('.en-summary').textContent=EXPLAIN[selected];}));
    const s = window.Orbit.make(stage, canvas, { view: { yaw: 0.05, pitch: 0.21, dist: 57, target: [0, -0.2, 0] }, fov: 34, min: 40, max: 75, onFrame: frame });
    if (!s.ok) return { setActive() {}, fit() {} };
    const { T, scene, mat } = s; const group=()=>{const g=new T.Group();scene.add(g);return g;}; const inked=(geo,c)=>{const m=new T.Mesh(geo,mat(c));m.add(new T.LineSegments(new T.EdgesGeometry(geo,30),new T.LineBasicMaterial({color:'#1d2433'})));return m;};
    s.renderer.setClearColor(new T.Color('#cfe6f3'), 1);
    scene.add(new T.HemisphereLight(0xffffff, 0x8899aa, 1.7));
    const sun = new T.DirectionalLight(0xffffff, 1.1); sun.position.set(6, 20, 14); scene.add(sun);
    // 찬 바닷물
    const cold = inked(new T.BoxGeometry(24, 6, ZD * 2), '#4a86c4'); cold.position.set(0, -3.02, 0); scene.add(cold);
    // 따뜻한 해수 기둥들
    const cols = [], cw = (X1 - X0) / N, colGeo = new T.BoxGeometry(cw * 1.01, 1, ZD * 2 + 0.02);
    for (let i = 0; i < N; i++) { const m = new T.Mesh(colGeo, new T.MeshLambertMaterial({ color: 0xe8742c })); m.position.x = X0 + cw * (i + 0.5); scene.add(m); cols.push(m); }
    const warmC = new T.Color('#e5532d'), mildC = new T.Color('#f2a64a');
    // 수온 약층 선(앞면)
    const tcGeo = new T.BufferGeometry().setFromPoints(Array.from({ length: N + 1 }, () => new T.Vector3()));
    const tc = new T.Line(tcGeo, new T.LineBasicMaterial({ color: 0x1d2433 })); scene.add(tc);
    // 땅
    const west = inked(new T.BoxGeometry(4, 7.2, ZD * 2 + 1), '#8fb36a'); west.position.set(-14, -2.4, 0); scene.add(west);
    const east = inked(new T.BoxGeometry(4, 7.2, ZD * 2 + 1), '#b9a27a'); east.position.set(14, -2.4, 0); scene.add(east);
    [[-1.5, 2.6], [0.6, 3.4], [1.6, 2.2]].forEach(([z, h]) => { const c = inked(new T.ConeGeometry(1.2, h, 6), '#a08a66'); c.position.set(14.4, 1.2 + h / 2, z); scene.add(c); });
    [[-1.8], [0.4], [2]].forEach(([z]) => { const t = inked(new T.SphereGeometry(0.7, 10, 8), '#5f9a4c'); t.position.set(-14.2, 1.7, z); scene.add(t); });
    // 무역풍 화살표
    const winds = [-6, -1, 4, 9].map((x, i) => {
      const g = group(); g.position.set(x, 1.6, i % 2 ? -1.4 : 1.4);
      const body = new T.Mesh(new T.CylinderGeometry(0.16, 0.16, 1, 10), mat('#ffffff')); body.rotation.z = Math.PI / 2; g.add(body);
      const head = new T.Mesh(new T.ConeGeometry(0.45, 0.9, 12), mat('#ffffff')); head.rotation.z = Math.PI / 2; g.add(head);
      return { g, body, head, x };
    });
    // 비구름·비
    const cloud = group();
    [[0, 0, 0, 1.4], [1.3, -0.2, 0.3, 1.1], [-1.2, -0.2, -0.2, 1.1], [0.4, 0.5, -0.6, 1.0]].forEach(([x, y, z, r]) => { const m = new T.Mesh(new T.SphereGeometry(r, 16, 12), mat('#8d97a6')); m.position.set(x, y, z); cloud.add(m); });
    const drops = Array.from({ length: 26 }, (_, i) => { const d = new T.Mesh(new T.CylinderGeometry(0.04, 0.04, 0.6, 5), new T.MeshBasicMaterial({ color: 0x2a6fb0 })); d.userData = { x: (i % 6) * 0.6 - 1.5, z: ((i * 7) % 5) * 0.5 - 1, u: (i * 0.137) % 1 }; scene.add(d); return d; });
    // 하강 기류 화살표(구름이 없는 쪽)
    const sink = group();
    { const b = new T.Mesh(new T.CylinderGeometry(0.2, 0.2, 2.6, 10), mat('#c98a2c')); sink.add(b); const h = new T.Mesh(new T.ConeGeometry(0.55, 1, 12), mat('#c98a2c')); h.position.y = -1.7; h.rotation.x = Math.PI; sink.add(h); }
    // 용승 화살표
    const ups = [7.5, 9, 10.5].map((x) => { const g = group(); const b = new T.Mesh(new T.CylinderGeometry(0.16, 0.16, 3, 8), mat('#bfe3ff')); g.add(b); const h = new T.Mesh(new T.ConeGeometry(0.42, 0.8, 10), mat('#bfe3ff')); h.position.y = 1.9; g.add(h); g.position.set(x, -3.5, ZD + 0.05); return g; });
    // 물고기(용승으로 영양분이 많은 동쪽 바다)
    const fish = Array.from({ length: 12 }, (_, i) => { const f = new T.Mesh(new T.SphereGeometry(0.22, 8, 6), new T.MeshLambertMaterial({ color: 0xc9d3dc })); f.scale.set(1.8, 0.7, 0.7); f.userData = { x: 6.5 + (i % 4) * 1.1, z: ZD + 0.35 + (i % 2) * 0.3, y: -1.0 - (i % 3) * 0.7, p: i }; scene.add(f); return f; });
    s.label(labs.west, new T.Vector3(-12, 3.6, 0)); s.label(labs.east, new T.Vector3(11.5, 4.6, 0));
    s.label(labs.warm, () => new T.Vector3(-8, -0.9, ZD)); s.label(labs.cold, new T.Vector3(-2, -4.8, ZD));
    s.label(labs.trade, new T.Vector3(2, 2.8, 0)); s.label(labs.up, new T.Vector3(9, -5.2, ZD));
    s.label(labs.tc, () => new T.Vector3(1.5, -hAt(1.5) - 0.4, ZD));
    s.label(labs.rain, () => new T.Vector3(cloud.position.x, cloud.position.y + 2, 0));
    const hAt = (x) => clamp(1.6 - 2.8 * tau * (x / 12), 0, 5);
    const rainX = () => -9 + clamp((0.55 - tau) / 0.45, 0, 1) * 15;

    root.querySelectorAll('.en-choose button[data-w]').forEach(b=>b.addEventListener('click',()=>{setWind(+b.dataset.w);root.querySelectorAll('.en-choose button[data-w]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));}));
    root.querySelector('.en-home').addEventListener('click',()=>s.reset());
    function setWind(v) { W = clamp(v, 0.04, 1); swiped = true;selected='';Object.values(labs).forEach(x=>x.classList.remove('o3-pick'));if(window.Stage.reduce){tau=W;vel=0;frame(0);}read();s.render(); }
    function read() {
      windBar.style.width = (W * 100).toFixed(0) + '%';
      windTxt.textContent = W < 0.32 ? '약함' : W < 0.75 ? '보통' : '강함';
    }
    function frame(dt) {
      tm += dt;
      if (dt > 0) { const acc = 3 * (W - tau) - 1.6 * vel; vel += acc * dt; tau += vel * dt; }
      tau = clamp(tau, 0, 1.15);
      const p = tcGeo.attributes.position;
      for (let i = 0; i < N; i++) {
        const x = X0 + cw * (i + 0.5), h = hAt(x), eta = 0.35 * tau * (-x / 12);
        const c = cols[i]; c.visible = h > 0.05; c.scale.y = Math.max(0.01, h + eta); c.position.y = (eta - h) / 2;
        c.material.color.copy(mildC).lerp(warmC, clamp(h / 2.6, 0, 1));
      }
      for (let i = 0; i <= N; i++) { const x = X0 + cw * i; p.setXYZ(i, x, -hAt(x), ZD + 0.03); }
      p.needsUpdate = true;
      winds.forEach((w, i) => { const L = 0.4 + W * 4.2; w.body.scale.y = L; w.body.position.x = 0; w.head.position.x = -L / 2 - 0.4; w.g.position.x = w.x + Math.sin(tm * 2 + i) * 0.2 - ((tm * W * 3 + i) % 2); w.g.visible = W > 0.06; });
      const rx = rainX(); cloud.position.set(rx, 5.2, 0);
      drops.forEach((d) => { const u = d.userData; u.u = (u.u + dt * 1.6) % 1; d.position.set(rx + u.x, 4.4 - u.u * 4.2, u.z); });
      sink.position.set(rx > 0 ? -9 : 9, 4.2, 0);
      const upw = clamp((W - 0.18) / 0.6, 0, 1.3), eastH = hAt(10);
      ups.forEach((g, i) => { g.scale.setScalar(0.3 + 0.7 * Math.min(1, upw)); g.visible = upw > 0.05; g.position.y = -4.4 + ((tm * 0.8 + i * 0.33) % 1) * 1.2; });
      const nf = Math.round(12 * clamp(upw, 0, 1));
      fish.forEach((f, i) => { const u = f.userData; f.visible = i < nf; f.position.set(u.x + Math.sin(tm * 1.5 + u.p) * 0.8, u.y, u.z); f.rotation.y = Math.cos(tm * 1.5 + u.p) > 0 ? 0 : Math.PI; });
      labs.up.style.opacity = upw > 0.15 ? 1 : 0.35;
      labs.up.textContent = upw > 0.6 ? '용승 활발' : upw > 0.15 ? '용승' : '용승 약화';
      // 상태 읽기(4번에 한 번)
      if ((tm * 10 | 0) % 3 === 0) {
        const mode = tau < 0.3 ? 'nino' : tau > 0.78 ? 'nina' : 'normal';
        state.textContent = { nino: '엘니뇨', nina: '라니냐', normal: '평상시' }[mode]; state.className = 'en-state ' + mode; const summary=root.querySelector('.en-summary'); if(summary)summary.textContent=selected?EXPLAIN[selected]:mode==='nino'?'무역풍 약화 → 동쪽 용승 약화 → 동쪽 수온 상승':mode==='nina'?'무역풍 강화 → 동쪽 용승 강화 → 동쪽 수온 하강':'평상시: 따뜻한 층은 서쪽에 두껍고, 동쪽은 찬물이 올라온다.';
        const wH = hAt(-10);
        out.wh.textContent = wH > 3.4 ? '아주 두껍다' : wH > 2.6 ? '두껍다' : '얇아졌다';
        out.ww.textContent = rx < -4 ? '상승 기류 · 비가 많다' : '하강 기류 · 비가 줄어 가뭄';
        out.et.textContent = eastH < 0.15 ? '아주 낮다(찬물)' : eastH < 0.6 ? '낮다' : '평소보다 높다';
        out.eu.textContent = upw > 0.6 ? '활발' : upw > 0.15 ? '약해짐' : '거의 멈춤';
        out.ef.textContent = nf > 8 ? '많다' : nf > 3 ? '줄었다' : '크게 줄었다';
        out.ew.textContent = rx > 2 ? '상승 기류 · 큰비·홍수' : '하강 기류 · 맑고 건조';
        now.textContent = !swiped ? '위 단추로 상태를 고르고, 바다를 끌어 돌려 보자'
          : mode === 'nino' ? '무역풍이 약해 따뜻한 물이 동쪽으로 → 엘니뇨'
          : mode === 'nina' ? '무역풍이 아주 강하다 → 동쪽이 더 차가워지는 라니냐'
          : Math.abs(W - tau) > 0.1 ? '바닷물이 출렁이며 따라오는 중…' : '평상시 · 이번엔 천천히 쓸어 보자';
        now.classList.toggle('done', mode !== 'normal');
      }
    }
    read();
    root._nino = { wind: setWind, settle() { tau = W; vel = 0; frame(0); }, get tau() { return tau; } };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.Nino = { mount };
})();
