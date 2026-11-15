/* 2-1 2차시 체험 «3D 별의 속»(교과서 56쪽 그림 Ⅱ-10 + 참고서 45쪽). 핵융합이 끝난 별을 4분의 1 잘라 낸 단면.
   «태양 정도» ↔ «태양의 10배 이상»을 바꾸면 층이 바뀐다. 층을 누르면 그 층의 원소와 그것을 만든 핵융합 반응·온도.
   끌어 돌리고 바퀴로 다가간다. 층 두께·온도 외 값은 이해를 돕기 위한 예. Star3D.mount(root) → { setActive, fit } · 시험용: root._s3.kind('sun'|'big') · tap(i) */
(function () {
  'use strict';
  const L = {
    sun: [
      ['수소', 0xf6c445, '빅뱅 때 생긴 수소가 그대로 남은 바깥층'],
      ['헬륨', 0x9fd3ff, '수소 핵융합(중심 1000만 K 이상): 수소 원자핵 4개 → 헬륨 1개'],
      ['탄소·산소', 0x5cc77a, '헬륨 핵융합(1억 K 이상): 헬륨 3개 → 탄소, 탄소 + 헬륨 → 산소. 태양 정도 별은 여기서 끝'],
    ],
    big: [
      ['수소', 0xf6c445, '바깥층 — 빅뱅 때의 수소'],
      ['헬륨', 0x9fd3ff, '수소 핵융합 → 헬륨'],
      ['탄소·산소·질소', 0x5cc77a, '헬륨 핵융합 → 탄소·산소'],
      ['산소·네온·마그네슘', 0xc7a0f0, '탄소 핵융합 → 산소·네온·마그네슘'],
      ['규소·황', 0xf0a0b0, '산소 핵융합 → 규소·황'],
      ['철', 0xa7adb5, '규소 핵융합 → 철. 철은 아주 안정해 더 핵융합하지 않는다 → 초신성으로'],
    ],
  };
  function mount(root) {
    const stage = root.querySelector('.s3-stage'), cv = stage.querySelector('canvas'), out = root.querySelector('.s3-out'), now = root.querySelector('.s3-now');
    const btns = [...root.querySelectorAll('.s3-kind button')];
    let kind = 'sun'; const tapped = { sun: new Set(), big: new Set() };
    const s = window.Scene3D.make(stage, cv, {
      view: { yaw: 0.9, pitch: 0.35, dist: 15, target: [0, 0, 0] }, min: 6, max: 30, pmin: -1.2, pmax: 1.3,
      click(e) { const h = s.pick(e, group.children); if (h && h.object.userData.i != null) tap(h.object.userData.i); },
    });
    if (!s.ok) return { setActive() {}, fit() {} };
    const { T, scene } = s;
    s.renderer.setClearColor(new T.Color('#0b1026'), 1);
    scene.add(new T.HemisphereLight(0xffffff, 0x404660, 1.1));
    const key = new T.DirectionalLight(0xffffff, 1.4); key.position.set(6, 8, 9); scene.add(key);
    const group = new T.Group(); scene.add(group);
    const labs = [];
    function build() {
      group.clear(); labs.forEach((e) => e.remove()); labs.length = 0;
      const ls = L[kind], n = ls.length, R = 4.2;
      ls.forEach(([name, col], i) => {
        const r = R * (1 - i / n * 0.86);
        const m = new T.Mesh(new T.SphereGeometry(r, 48, 32, Math.PI, Math.PI * 1.5), new T.MeshStandardMaterial({ color: col, roughness: 0.6, side: T.DoubleSide, emissive: col, emissiveIntensity: tapped[kind].has(i) ? 0.35 : 0.08 }));
        m.userData.i = i; group.add(m);
        const e = document.createElement('span'); e.className = 'g3-label s3-lab'; e.textContent = name; stage.appendChild(e); labs.push(e);
        const rr = r - (R / n * 0.43);
        s.label(e, () => new T.Vector3(rr * 0.72, (i - (n - 1) / 2) * 0.35, rr * 0.72));
      });
      s.render();
    }
    function steps() {
      const ok = []; if (tapped.sun.size >= 2) ok.push(1); if (tapped.big.size >= 1) ok.push(2); if (tapped.big.has(L.big.length - 1)) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      now.textContent = st === 1 ? '① 태양 정도 별의 층을 눌러 보자' : st === 2 ? '② «태양의 10배 이상»으로 바꾸자' : st === 3 ? '③ 한가운데 철을 눌러 보자' : '질량이 클수록 더 무거운 원소까지';
      now.classList.toggle('done', st === 0);
    }
    function tap(i) {
      tapped[kind].add(i); const [n, , d] = L[kind][i];
      out.innerHTML = `<b>${n}</b> ${d}`;
      group.children.forEach((m) => { m.material.emissiveIntensity = tapped[kind].has(m.userData.i) ? (m.userData.i === i ? 0.5 : 0.25) : 0.08; });
      steps(); s.render();
    }
    function setKind(k) {
      kind = k; btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === k)));
      build();
      out.innerHTML = k === 'sun' ? '<b>태양 정도 별</b> 중심에 탄소·산소까지 — 중심 온도가 탄소 핵융합에는 못 미친다' : '<b>태양의 10배 이상</b> 중심이 더 뜨거워 핵융합이 이어져 철까지 — 양파 껍질 구조';
      steps();
    }
    btns.forEach((b) => b.addEventListener('click', () => setKind(b.dataset.k)));
    root.querySelector('.s3-home').addEventListener('click', () => s.look({ yaw: 0.9, pitch: 0.35, dist: 15, target: [0, 0, 0] }));
    setKind('sun');
    root._s3 = { kind: setKind, tap };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.Star3D = { mount };
})();
