/* 1-2-2 설명 장 3D 입자 모형(1-2-1 mol3d.js를 가져와 이온 종류를 더함)(Three.js, orbit3d.js 위에): 원자·이온·전자가 단계 막대를 따라 «같은 입자가 이어서» 움직인다.
   RxMol.mount(root, cfg)
     root 안: .m3-stage(canvas) · .st-range(단계 막대 0~N-1) · .st-pills 단추 · 지금 단계 카드(.st-tag .st-name .st-d) · 숨은 풀이 .st-text li(h4·p)
     cfg = { view, min, max, pmin, pmax, steps: N,
             atoms: [{ el, p: 단계별 [x,y,z], show: 단계별 0~1, col: 단계별 색, lab: 단계별 이름표(없으면 null), info: 단계별 누르면 나오는 풀이, r }],
             bonds: [[원자 i, 원자 j, 단계별 0~1]],
             electrons: [{ p: 단계별 [x,y,z], show: 단계별 0~1, arc: 건너갈 때 솟는 높이 }],
             build(s, T) → (t, dt) => {}   바탕(판·용액·불꽃)과 매 장면 바뀌는 것
             jitter(t) → 원자 떨림 크기 · events: [{ at, fn(stage) }] 막대가 at을 앞으로 넘을 때 한 번(사건 순간 흔들림)
             onStep(k) }
   단계 배열은 RxMol.K(N, {0: 값, 2: 값}) 처럼 쓰면 빈 단계는 앞 값을 이어 쓴다.
   조작: 끌기 돌리기 · 바퀴·두 손가락 확대 · 오른쪽 끌기·두 손가락 옮기기 · «처음 시점» · 원자를 누르면 이름과 지금 상태.
   시험용: root._m3.set(k) · root._m3.t */
(function () {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sm = (u) => u * u * (3 - 2 * u);
  const EL = {
    Cu: { c: '#c8743a', r: 0.46, m: 0.45, name: '구리' }, O: { c: '#e0463c', r: 0.33, m: 0.0, name: '산소' },
    C: { c: '#3b3f4a', r: 0.35, m: 0.0, name: '탄소' }, Zn: { c: '#a9b4c2', r: 0.47, m: 0.5, name: '아연' },
    Mg: { c: '#d7decb', r: 0.47, m: 0.35, name: '마그네슘' }, S: { c: '#e6c13a', r: 0.3, m: 0.0, name: '황' },
    H: { c: '#ffffff', r: 0.22, m: 0.0, name: '수소' }, Ag: { c: '#e4e8ee', r: 0.47, m: 0.6, name: '은' }, N: { c: '#6f8fd8', r: 0.3, m: 0, name: '질소' },
  };
  // 빈 단계는 앞 단계 값을 이어 쓴다
  function K(n, o) {
    const out = []; let v = o[0];
    for (let k = 0; k < n; k++) { if (k in o) v = o[k]; out.push(Array.isArray(v) ? v.slice() : v); }
    return out;
  }
  // 단계별 값: 길이 N 배열이면 그대로, 아니면 모든 단계에 같은 값
  const arr = (n, v) => (Array.isArray(v) && v.length === n ? v : Array.from({ length: n }, () => v));
  const parr = (n, p) => (typeof p[0] === 'number' ? Array.from({ length: n }, () => p) : p);

  function mount(root, cfg) {
    const stage = root.querySelector('.m3-stage'), canvas = stage.querySelector('canvas');
    const N = cfg.steps, range = root.querySelector('.st-range'), pills = [...root.querySelectorAll('.st-pills button')];
    const tag = root.querySelector('.st-tag'), nm = root.querySelector('.st-name'), d = root.querySelector('.st-d');
    const items = [...root.querySelectorAll('.st-text li')].map((li) => ({ n: li.querySelector('h4').innerHTML, d: li.querySelector('p').innerHTML }));
    const pickOut = root.querySelector('.m3-pick');
    let t = 0, cur = -1, tw = null, lastT = 0, time = 0;
    const s = window.Orbit.make(stage, canvas, Object.assign({
      view: { yaw: 0.6, pitch: 0.5, dist: 12, target: [0, 1, 0] }, min: 4, max: 30, pmin: -0.2, pmax: 1.4, bounds: 8, fov: 36,
      click: (e) => clickAt(e), onFrame: (dt) => frame(dt),
    }, cfg.orbit || {}, { view: cfg.view || { yaw: 0.6, pitch: 0.5, dist: 12, target: [0, 1, 0] } }));
    window.Orbit.chrome(stage, s);
    const api = { set: (k) => go(k), get t() { return t; }, s };
    root._m3 = api;
    if (!s.ok) { bindUi(); setT(0); return { setActive() {} }; }
    const { T, scene } = s;
    const sph = new T.SphereGeometry(1, 28, 20);
    const cyl = new T.CylinderGeometry(1, 1, 1, 14);
    // 원자
    const atoms = cfg.atoms.map((a, i) => {
      const e = EL[a.el] || { c: '#cccccc', r: 0.4, m: 0, name: a.el };
      const r = a.r || e.r;
      const m = new T.Mesh(sph, s.mat(e.c, { metalness: e.m, roughness: e.m ? 0.32 : 0.5 }));
      m.scale.setScalar(r); m.userData.i = i; scene.add(m);
      const o = { a, e, r, m, p: parr(N, a.p), show: arr(N, a.show ?? 1), col: a.col ? arr(N, a.col) : null, lab: a.lab ? arr(N, a.lab) : null, info: a.info ? arr(N, a.info) : null, el: null, ph: i * 1.7 };
      if (o.lab) { o.el = document.createElement('span'); o.el.className = 'o3-lab m3-lab'; stage.appendChild(o.el); const off = new T.Vector3(...(a.lo || [0, r + 0.42, 0])); s.label(o.el, () => (o.vis > 0.5 && o.txt ? o.m.position.clone().add(off) : null)); }
      return o;
    });
    const bonds = (cfg.bonds || []).map(([i, j, sh]) => {
      const m = new T.Mesh(cyl, s.mat('#8a8f99', { roughness: 0.5 })); scene.add(m);
      return { i, j, show: arr(N, sh ?? 1), m };
    });
    const eGeo = new T.SphereGeometry(0.15, 16, 12);
    const elec = (cfg.electrons || []).map((e) => {
      const m = new T.Mesh(eGeo, new T.MeshStandardMaterial({ color: new T.Color('#f2c230'), emissive: new T.Color('#f2a900'), emissiveIntensity: 0.9, roughness: 0.3 }));
      scene.add(m);
      const o = { m, p: parr(N, e.p), show: arr(N, e.show ?? 1), arc: e.arc ?? 0.8, el: null };
      if (e.lab) { o.el = document.createElement('span'); o.el.className = 'o3-lab m3-e'; o.el.innerHTML = 'e<sup>−</sup>'; stage.appendChild(o.el); s.label(o.el, () => (o.vis > 0.5 ? o.m.position.clone().add(new T.Vector3(0, 0.38, 0)) : null)); }
      return o;
    });
    const upd = cfg.build ? cfg.build(s, T, api) : null;
    const ca = new T.Color(), cb = new T.Color(), up = new T.Vector3(0, 1, 0), dir = new T.Vector3();
    let picked = null;
    function place() {
      const k = Math.min(N - 2, Math.floor(t)), u = N > 1 ? sm(clamp(t - k, 0, 1)) : 0, k2 = Math.min(N - 1, k + 1);
      const jit = cfg.jitter ? cfg.jitter(t) : 0;
      atoms.forEach((o) => {
        const A = o.p[k], B = o.p[k2];
        o.m.position.set(A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u, A[2] + (B[2] - A[2]) * u);
        if (jit) o.m.position.add(new T.Vector3(Math.sin(time * 23 + o.ph) * jit, Math.sin(time * 19 + o.ph * 2) * jit, Math.cos(time * 21 + o.ph) * jit));
        const v = o.show[k] + (o.show[k2] - o.show[k]) * u; o.vis = v;
        o.m.visible = v > 0.02; o.m.scale.setScalar(o.r * (0.35 + 0.65 * v) * (picked === o ? 1.12 : 1));
        if (o.col) { ca.set(o.col[k]); cb.set(o.col[k2]); o.m.material.color.copy(ca.lerp(cb, u)); }
        o.m.material.emissive.set(picked === o ? '#ffd23f' : '#000000'); o.m.material.emissiveIntensity = picked === o ? 0.35 : 0;
        if (o.lab) { const txt = o.lab[Math.round(t)]; if (txt !== o.txt) { o.txt = txt; o.el.innerHTML = txt || ''; } }
      });
      bonds.forEach((b) => {
        const v = b.show[k] + (b.show[k2] - b.show[k]) * u, A = atoms[b.i].m.position, B = atoms[b.j].m.position;
        b.m.visible = v > 0.05 && atoms[b.i].m.visible && atoms[b.j].m.visible;
        if (!b.m.visible) return;
        dir.subVectors(B, A); const len = dir.length();
        b.m.position.addVectors(A, B).multiplyScalar(0.5);
        b.m.scale.set(0.09 * v, len, 0.09 * v);
        b.m.quaternion.setFromUnitVectors(up, dir.normalize());
      });
      elec.forEach((e) => {
        const A = e.p[k], B = e.p[k2];
        const lift = Math.sin(Math.PI * u) * e.arc * (A[0] !== B[0] || A[2] !== B[2] || A[1] !== B[1] ? 1 : 0);
        e.m.position.set(A[0] + (B[0] - A[0]) * u, A[1] + (B[1] - A[1]) * u + lift, A[2] + (B[2] - A[2]) * u);
        const v = e.show[k] + (e.show[k2] - e.show[k]) * u; e.vis = v;
        e.m.visible = v > 0.05; e.m.scale.setScalar(0.4 + 0.6 * v + 0.12 * Math.sin(time * 8));
      });
      if (upd) upd(t, time);
    }
    function frame(dt) { time += dt; place(); }
    function clickAt(e) {
      const hit = s.pick(e, atoms.filter((o) => o.m.visible).map((o) => o.m));
      picked = hit ? atoms[hit.object.userData.i] : null;
      showPick();
      if (!s.active) { place(); s.render(); }
    }
    function showPick() {
      if (!pickOut) return;
      if (!picked) { pickOut.textContent = ''; return; }
      const k = Math.round(t), info = picked.info ? picked.info[k] : `${picked.e.name} 원자`;
      pickOut.innerHTML = info;
    }
    api.pickAt = (i) => { picked = atoms[i] || null; showPick(); place(); s.render(); };
    // 단계 막대
    function setT(v, fromUser) {
      const prev = t;
      t = clamp(v, 0, N - 1);
      if (range) range.value = String(t);
      if (cfg.events) cfg.events.forEach((ev) => { if (prev < ev.at && t >= ev.at) ev.fn(stage, api); });
      const k = Math.round(t);
      pills.forEach((b, i) => { b.setAttribute('aria-pressed', String(i === k)); b.classList.toggle('past', i < k); });
      if (k !== cur) {
        cur = k;
        if (tag) tag.textContent = `${k + 1}단계 / ${N}`;
        if (items[k]) { nm.innerHTML = items[k].n; d.innerHTML = items[k].d; }
        root.classList.forEach((c) => { if (/^m3-k\d$/.test(c)) root.classList.remove(c); }); root.classList.add('m3-k' + k);
        if (cfg.onStep) cfg.onStep(k, api);
        root.dispatchEvent(new CustomEvent('st-step', { detail: k }));
        showPick();
      }
      if (s.ok && !s.active) { place(); s.render(); }
      if (fromUser && tw) { tw.kill(); tw = null; }
    }
    function go(k) {
      k = clamp(Math.round(k), 0, N - 1);
      if (tw) tw.kill();
      if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches && Math.abs(k - t) > 0.01) {
        const o = { v: t };
        tw = gsap.to(o, { v: k, duration: 0.9 * Math.min(2, Math.abs(k - t)) + 0.2, ease: 'power1.inOut', onUpdate: () => setT(o.v), onComplete: () => { tw = null; } });
      } else setT(k);
    }
    function bindUi() {
      if (range) {
        range.max = String(N - 1);
        range.addEventListener('input', () => setT(+range.value, true));
        range.addEventListener('change', () => go(Math.round(+range.value)));
        range.addEventListener('keydown', (e) => {
          const m = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: 1, ArrowDown: -1 }[e.key];
          if (m) { e.preventDefault(); e.stopPropagation(); go(Math.round(t) + m); }
        });
      }
      pills.forEach((b, i) => b.addEventListener('click', () => go(i)));
    }
    bindUi();
    setT(0);
    return {
      setActive(on) { s.setActive(on); if (on) { place(); s.render(); } },
    };
  }

  window.RxMol = { mount, K, EL };
})();
