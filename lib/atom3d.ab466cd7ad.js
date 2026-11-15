/* 2-1 1차시 체험 «3D 물질 속으로»(교과서 51쪽 그림 Ⅱ-4 물질을 이루고 있는 입자). 위 단추로 한 단계씩 들어간다:
   원자(탄소: 원자핵 + 전자 6개가 두 궤도를 돈다) → 원자핵(양성자 6 + 중성자 6) → 양성자·중성자(쿼크 3개).
   빈 곳을 끌면 돌려 보고 바퀴로 다가간다. 입자를 누르면 이름과 풀이. 크기는 실제 비율이 아니다(원자핵은 원자보다 약 10만 배 작다).
   Atom3D.mount(root) → { setActive, fit } · 시험용: root._at.level('atom'|'nuc'|'p'|'n') · tap(이름) */
(function () {
  'use strict';
  const INFO = {
    e: ['전자', '(−) 전기를 띠고 원자핵 둘레를 돈다. 빅뱅 직후 쿼크와 함께 가장 먼저 생겼다.'],
    nucleus: ['원자핵', '원자의 한가운데, (+) 전기. 양성자와 중성자로 되어 있고 원자 질량 거의 전부가 여기에.'],
    p: ['양성자', '(+) 전기를 띤다. 양성자 하나만 있으면 수소 원자핵. 양성자 수 = 원자 번호.'],
    n: ['중성자', '전기를 띠지 않는다. 양성자와 함께 원자핵을 이룬다.'],
    q: ['쿼크', '양성자·중성자를 이루는 기본 입자. 위 쿼크(+⅔)와 아래 쿼크(−⅓)가 셋씩 모인다(전자의 전하를 −1로 볼 때).'],
  };
  const LV = { atom: '원자(탄소)', nuc: '원자핵', p: '양성자', n: '중성자' };
  function mount(root) {
    const stage = root.querySelector('.at-stage'), cv = stage.querySelector('canvas'), out = root.querySelector('.at-out'), now = root.querySelector('.at-now');
    const btns = [...root.querySelectorAll('.at-lv button')];
    let lv = 'atom', t = 0; const seen = new Set(['atom']);
    const s = window.Scene3D.make(stage, cv, {
      view: { yaw: 0.6, pitch: 0.35, dist: 14, target: [0, 0, 0] }, min: 4, max: 30, pmin: -1.2, pmax: 1.3,
      onFrame(dt) { t += dt; spin(); },
      click(e) { const h = s.pick(e, pickables()); if (h) { let o = h.object; while (o && !o.userData.k) o = o.parent; if (o) { tapped = true; const k = o.userData.k; if (lv === 'atom' && k === 'nucleus') { level('nuc'); return; } if (lv === 'nuc' && (k === 'p' || k === 'n')) { level(k); return; } tap(k); steps(); } } },
    });
    if (!s.ok) return { setActive() {}, fit() {} };
    const { T, scene } = s;
    s.renderer.setClearColor(new T.Color('#0f1630'), 1);
    scene.add(new T.HemisphereLight(0xffffff, 0x3a4060, 1.2));
    const key = new T.DirectionalLight(0xffffff, 1.5); key.position.set(5, 8, 7); scene.add(key);
    const M = (c, o = {}) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.45, metalness: 0.05 }, o));
    const ball = (r, mat, k) => { const m = new T.Mesh(new T.SphereGeometry(r, 32, 20), mat); m.userData.k = k; return m; };
    const RED = M(0xe0503f), GREY = M(0xa7adb5), BLUE = M(0x4ea0f0, { emissive: 0x153a66 });
    // 원자핵 덩어리(양성자 6 · 중성자 6)
    function nucleus(r) {
      const g = new T.Group(); const pts = [];
      for (let i = 0; i < 12; i++) { const y = 1 - (i + 0.5) / 12 * 2, rr = Math.sqrt(1 - y * y), a = i * 2.39996; pts.push(new T.Vector3(Math.cos(a) * rr, y, Math.sin(a) * rr).multiplyScalar(r)); }
      pts.forEach((p, i) => { const m = ball(r * 0.62, i % 2 ? GREY : RED, i % 2 ? 'n' : 'p'); m.position.copy(p); g.add(m); });
      return g;
    }
    // 1) 원자
    const atom = new T.Group(); scene.add(atom);
    const core = nucleus(0.32); core.userData.k = 'nucleus'; core.children.forEach((m) => { m.userData.k = 'nucleus'; }); atom.add(core);
    const ringM = new T.LineBasicMaterial({ color: 0x8fa3c8, transparent: true, opacity: 0.6 });
    const rings = [2.4, 4.6].map((R, i) => { const g = new T.Group(); g.rotation.x = 1.25 + i * 0.25; g.rotation.y = i * 0.6; const pts = []; for (let k = 0; k <= 96; k++) { const a = k / 96 * Math.PI * 2; pts.push(new T.Vector3(Math.cos(a) * R, 0, Math.sin(a) * R)); } g.add(new T.Line(new T.BufferGeometry().setFromPoints(pts), ringM)); atom.add(g); return { g, R }; });
    const els = [[0, 0], [0, Math.PI], [1, 0], [1, Math.PI / 2], [1, Math.PI], [1, Math.PI * 1.5]].map(([ri, a0]) => { const m = ball(0.26, BLUE, 'e'); rings[ri].g.add(m); return { m, ri, a0 }; });
    // 2) 원자핵 크게
    const nuc = nucleus(1.6); scene.add(nuc);
    // 3) 양성자·중성자 속 쿼크
    const hadron = (kind) => {
      const g = new T.Group(); scene.add(g);
      const shell = ball(3.0, M(kind === 'p' ? 0xe0503f : 0xa7adb5, { transparent: true, opacity: 0.25, depthWrite: false }), kind); g.add(shell);
      const Q = kind === 'p' ? ['u', 'u', 'd'] : ['u', 'd', 'd'];   // 위 쿼크 u(+2/3) · 아래 쿼크 d(−1/3)
      const qs = Q.map((q) => { const c = q === 'u' ? 0xf2a03d : 0x5aa9f0; const m = ball(0.55, M(c, { emissive: c, emissiveIntensity: 0.25 }), 'q'); m.userData.q = q; g.add(m); return m; });
      g.userData.qs = qs; return g;
    };
    const pG = hadron('p'), nG = hadron('n');
    const groups = { atom, nuc, p: pG, n: nG };
    const lab = (txt, at) => { const e = document.createElement('span'); e.className = 'g3-label at-lab'; e.textContent = txt; stage.appendChild(e); s.label(e, at); return e; };
    const labs = {
      atom: [lab('원자핵', () => new T.Vector3(0, 0.9, 0)), lab('전자', () => els[2].m.getWorldPosition(new T.Vector3()).add(new T.Vector3(0, 0.7, 0)))],
      nuc: [lab('양성자(+)', () => nuc.children[0].getWorldPosition(new T.Vector3()).add(new T.Vector3(0, 1.3, 0))), lab('중성자', () => nuc.children[5].getWorldPosition(new T.Vector3()).add(new T.Vector3(0, -1.3, 0)))],
      p: [0, 1, 2].map((i) => lab(pG.userData.qs[i].userData.q === 'u' ? '위 +⅔' : '아래 −⅓', () => pG.userData.qs[i].getWorldPosition(new T.Vector3()).add(new T.Vector3(0, 1.0, 0)))),
      n: [0, 1, 2].map((i) => lab(nG.userData.qs[i].userData.q === 'u' ? '위 +⅔' : '아래 −⅓', () => nG.userData.qs[i].getWorldPosition(new T.Vector3()).add(new T.Vector3(0, 1.0, 0)))),
    };
    function spin() {
      els.forEach(({ m, ri, a0 }) => { const a = a0 + t * (ri ? 0.6 : 1.1); m.position.set(Math.cos(a) * rings[ri].R, 0, Math.sin(a) * rings[ri].R); });
      [pG, nG].forEach((g) => g.userData.qs.forEach((m, i) => { const a = t * 1.3 + i * 2.094; m.position.set(Math.cos(a) * 1.1, Math.sin(t * 2 + i) * 0.4, Math.sin(a) * 1.1); }));
      nuc.rotation.y = t * 0.2;
    }
    const pickables = () => groups[lv].children;
    function tap(k) { const [n, d] = INFO[k]; out.innerHTML = `<b>${n}</b> ${d}`; }
    let tapped = false;
    function steps() {
      const ok = []; if (tapped || seen.size > 1) ok.push(1); if (seen.has('nuc')) ok.push(2); if (seen.has('p') || seen.has('n')) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      now.textContent = st === 0 ? '물질 → 원자 → 원자핵 → 양성자·중성자 → 쿼크' : st === 1 ? '① 돌려 보고 전자나 원자핵을 눌러 보자' : st === 2 ? '② «원자핵»으로 들어가 보자' : '③ «양성자»를 눌러 쿼크를 보자';
      now.classList.toggle('done', st === 0);
    }
    function level(k) {
      lv = k; seen.add(k);
      Object.entries(groups).forEach(([n, g]) => { g.visible = n === k; });
      Object.entries(labs).forEach(([n, ls]) => ls.forEach((e) => { e.style.display = n === k ? '' : 'none'; }));
      btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === k)));
      const g = groups[k]; g.scale.setScalar(0.15);
      if (window.gsap && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) gsap.to(g.scale, { x: 1, y: 1, z: 1, duration: 0.9, ease: 'power2.out', onUpdate: () => { if (!s.active) s.render(); } }); else g.scale.setScalar(1);
      s.look({ yaw: 0.6, pitch: 0.35, dist: k === 'atom' ? 14 : 11, target: [0, 0, 0] });
      tap(k === 'atom' ? 'nucleus' : k === 'nuc' ? 'p' : k === 'p' ? 'q' : 'n');
      if (k === 'atom') out.innerHTML = `<b>${LV.atom}</b> 가운데 원자핵, 둘레에 전자 6개 — 전자 수 = 양성자 수라 전기적으로 중성 <small>실제 원자핵은 원자보다 약 10만 배 작다</small>`;
      if (k === 'p' || k === 'n') out.innerHTML = k === 'p' ? '<b>양성자</b> 위 쿼크 2 + 아래 쿼크 1 <small>(+⅔) × 2 + (−⅓) = <b>+1</b> → (+) 전기</small>' : '<b>중성자</b> 위 쿼크 1 + 아래 쿼크 2 <small>(+⅔) + (−⅓) × 2 = <b>0</b> → 전기를 띠지 않음</small>';
      steps(); s.render();
    }
    btns.forEach((b) => b.addEventListener('click', () => level(b.dataset.k)));
    root.querySelector('.at-home').addEventListener('click', () => s.look({ yaw: 0.6, pitch: 0.35, dist: lv === 'atom' ? 14 : 11, target: [0, 0, 0] }));
    spin(); level('atom');
    root._at = { level, tap };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.Atom3D = { mount };
})();
