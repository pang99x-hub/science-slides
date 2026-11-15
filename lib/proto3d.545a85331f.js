/* 1-2 1차시 체험 «3D 미터원기와 킬로그램 원기»(교과서 29쪽 해 보기·측주). 단면이 X자인 미터원기(백금·이리듐)를 돌려 보고
   «끝 눈금 보기»로 다가가면 1 m를 가리키는 눈금선 셋이 보인다. 온도 막대를 올리면 막대가 늘어난다(1000배 과장, 실제 늘어난 길이는 μm로 표시).
   «킬로그램 원기»로 바꾸면 유리 덮개 둘 속 원기둥과 세월 막대(1889~2014년) — 사본들과 견준 질량 차가 약 50 μg까지 벌어진다.
   Proto3D.mount(root) → { setActive, fit } · 시험용: root._pr.temp(°C) · end() · kind('m'|'kg') · year(연도) */
(function () {
  'use strict';
  const ALPHA = 8.7e-6, EXAG = 1000; // 백금·이리듐 열팽창 계수(1/°C), 화면 과장 배율
  function mount(root) {
    const stage = root.querySelector('.pr-stage'), cv = stage.querySelector('canvas'), out = root.querySelector('.pr-out'), now = root.querySelector('.pr-now');
    const tR = root.querySelector('.pr-temp'), yR = root.querySelector('.pr-year'), kinds = [...root.querySelectorAll('.pr-kind button')], endB = root.querySelector('.pr-end');
    const tRow = root.querySelector('.pr-trow'), yRow = root.querySelector('.pr-yrow');
    const s = window.Scene3D.make(stage, cv, { view: { yaw: 0.5, pitch: 0.42, dist: 15, target: [0, 0.4, 0] }, min: 1.6, max: 30 });
    if (!s.ok) return { setActive() {}, fit() {} };
    const { T, scene } = s;
    scene.add(new T.HemisphereLight(0xffffff, 0x8c8f99, 1.0));
    const key = new T.DirectionalLight(0xffffff, 1.6); key.position.set(6, 10, 8); scene.add(key);
    const rim = new T.DirectionalLight(0xbfd8ff, 0.8); rim.position.set(-8, 4, -6); scene.add(rim);
    s.renderer.setClearColor(new T.Color('#e8ecf1'), 1);
    const metal = new T.MeshStandardMaterial({ color: 0xd4d7dc, metalness: 0.35, roughness: 0.35 });
    const cloth = new T.Mesh(new T.BoxGeometry(14, 0.2, 5), new T.MeshLambertMaterial({ color: 0x7a1f2a })); cloth.position.y = -0.9; scene.add(cloth);
    // 미터원기: X자 단면을 길게 늘인 막대(길이 10 = 1 m)
    const mG = new T.Group(); scene.add(mG);
    const sh = new T.Shape(); const P = [[-.5, .5], [-.3, .5], [0, .12], [.3, .5], [.5, .5], [.12, 0], [.5, -.5], [.3, -.5], [0, -.12], [-.3, -.5], [-.5, -.5], [-.12, 0]];
    sh.moveTo(...P[0]); P.slice(1).forEach((p) => sh.lineTo(...p)); sh.closePath();
    const barGeo = new T.ExtrudeGeometry(sh, { depth: 10.4, bevelEnabled: false }); barGeo.translate(0, 0, -5.2);
    const bar = new T.Mesh(barGeo, metal); bar.rotation.y = Math.PI / 2; bar.position.y = 0; mG.add(bar);
    // 눈금선(가운데 홈 바닥, 양 끝 근처에 셋씩)
    const ticks = new T.Group(); mG.add(ticks);
    const tickM = new T.MeshBasicMaterial({ color: 0xd9483b });
    const mkTicks = () => { ticks.clear(); [-5, 5].forEach((x0) => [-0.06, 0, 0.06].forEach((d) => { const m = new T.Mesh(new T.BoxGeometry(0.02, 0.012, 0.22), tickM); m.position.set(x0 + d, 0.125, 0); ticks.add(m); })); };
    mkTicks();
    // 킬로그램 원기: 원기둥 + 유리 덮개 둘
    const kG = new T.Group(); scene.add(kG); kG.visible = false;
    const cyl = new T.Mesh(new T.CylinderGeometry(0.78, 0.78, 1.56, 48), metal); cyl.position.y = 0.0; kG.add(cyl);
    const base = new T.Mesh(new T.CylinderGeometry(2.4, 2.6, 0.3, 48), new T.MeshStandardMaterial({ color: 0x2b2f38, metalness: 0.4, roughness: 0.5 })); base.position.y = -0.9; kG.add(base);
    const glass = (r, h) => { const g = new T.Group(); const m = new T.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.18, roughness: 0.05, metalness: 0, side: T.DoubleSide, depthWrite: false });
      const side = new T.Mesh(new T.CylinderGeometry(r, r, h, 48, 1, true), m); side.position.y = h / 2 - 0.75; g.add(side);
      const top = new T.Mesh(new T.SphereGeometry(r, 48, 16, 0, Math.PI * 2, 0, Math.PI / 2), m); top.position.y = h - 0.75; g.add(top);
      const knob = new T.Mesh(new T.SphereGeometry(0.18, 16, 12), m); knob.position.y = h - 0.75 + r + 0.1; g.add(knob); return g; };
    kG.add(glass(1.4, 2.6), glass(2.0, 3.4));
    // 이름표
    const lab = (txt, at) => { const e = document.createElement('span'); e.className = 'g3-label pr-lab'; e.textContent = txt; stage.appendChild(e); s.label(e, at); return e; };
    const lEnd = lab('눈금선 3개', () => new T.Vector3(5 * scaleX(), 0.75, 0));
    const lSec = lab('X자 단면: 가볍고 잘 휘지 않는다', new T.Vector3(-5.2, 1.2, 0));
    const lCyl = lab('백금·이리듐 원기둥(지름·높이 약 3.9 cm)', new T.Vector3(0, 2.0, 0));
    let temp = 0, yr = 1889, kind = 'm', sawEnd = false, heated = false, aged = false;
    function scaleX() { return 1 + ALPHA * temp * EXAG; }
    function update() {
      mG.visible = kind === 'm'; kG.visible = kind === 'kg';
      lEnd.style.display = lSec.style.display = kind === 'm' ? '' : 'none'; lCyl.style.display = kind === 'kg' ? '' : 'none';
      tRow.hidden = kind !== 'm'; yRow.hidden = kind !== 'kg'; endB.hidden = kind !== 'm';
      bar.scale.z = scaleX(); ticks.position.x = 0; ticks.children.forEach((m, i) => { const x0 = i < 3 ? -5 : 5; m.position.x = x0 * scaleX() + [-0.06, 0, 0.06][i % 3]; });
      metal.color.setHSL(0.05 * (temp / 40), 0.08 + temp / 120, 0.82 - temp / 400);
      if (kind === 'm') {
        const dl = 1 * ALPHA * temp * 1e6;
        out.innerHTML = `온도 <b>${temp} °C</b> → 1 m 막대가 <b>${dl.toFixed(0)} μm</b> 늘어남 <small>(화면은 1000배 과장 · 0 °C일 때의 두 눈금 사이 = 1 m로 정했다)</small>`;
      } else {
        const dm = (yr - 1889) / (2014 - 1889) * 50;
        out.innerHTML = `${yr}년 · 사본들과 견준 질량 차 약 <b>${dm.toFixed(0)} μg</b> <small>(1 μg = 100만분의 1 g · 지문 하나의 기름 정도)</small>`;
      }
      if (temp >= 30) heated = true; if (yr >= 2000) aged = true;
      const ok = []; if (sawEnd) ok.push(1); if (heated) ok.push(2); if (aged) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      now.textContent = st === 1 ? '① «끝 눈금 보기»로 1 m를 가리키는 선을 찾자' : st === 2 ? '② 온도 막대를 올려 보자' : st === 3 ? '③ «킬로그램 원기»로 바꿔 세월을 흘려 보자' : '물건으로 된 기준은 조금씩 변한다';
      now.classList.toggle('done', st === 0);
      s.render();
    }
    tR.addEventListener('input', () => { temp = +tR.value; update(); });
    yR.addEventListener('input', () => { yr = +yR.value; update(); });
    endB.addEventListener('click', () => { sawEnd = true; s.look({ yaw: 0.35, pitch: 0.95, dist: 3.2, target: [5 * scaleX(), 0.1, 0] }); update(); });
    kinds.forEach((b) => b.addEventListener('click', () => { kind = b.dataset.k; kinds.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); s.look(kind === 'm' ? { yaw: 0.5, pitch: 0.42, dist: 15, target: [0, 0.4, 0] } : { yaw: 0.4, pitch: 0.35, dist: 9, target: [0, 0.6, 0] }); update(); }));
    root.querySelector('.pr-home').addEventListener('click', () => s.look(kind === 'm' ? { yaw: 0.5, pitch: 0.42, dist: 15, target: [0, 0.4, 0] } : { yaw: 0.4, pitch: 0.35, dist: 9, target: [0, 0.6, 0] }));
    tR.value = '0'; yR.value = '1889'; update();
    root._pr = { temp: (v) => { tR.value = String(v); tR.dispatchEvent(new Event('input')); }, end: () => endB.click(), kind: (k) => kinds.find((b) => b.dataset.k === k).click(), year: (v) => { yR.value = String(v); yR.dispatchEvent(new Event('input')); } };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.Proto3D = { mount };
})();
