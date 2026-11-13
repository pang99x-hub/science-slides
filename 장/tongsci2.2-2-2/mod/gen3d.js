/* 발전소의 터빈과 발전기 3D (Three.js).
   교과서 107쪽 그림 Ⅱ-21: 터빈 → 회전축 → 회전하는 자석(회전자) / 바깥에 고정된 코일(고정자).
   잉크 선화 느낌을 내려고 면은 옅게 칠하고 모서리에 진한 선(EdgesGeometry)을 두른다.
   «분해하기»는 고정자를 위로 들고 터빈을 왼쪽으로 떼어 놓는다. 드래그하면 둘러볼 수 있다. */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function mount(root) {
    const stage = root.querySelector('.stage');
    const canvas = stage.querySelector('canvas');
    const labels = [...stage.querySelectorAll('.g3-label')];
    const bulb = root.querySelector('.g3-bulb i');
    const css = getComputedStyle(document.documentElement);
    const col = (k) => css.getPropertyValue('--' + k).trim();
    const T = window.THREE;
    let renderer = null;
    try { renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { renderer = null; }
    if (!renderer) {
      stage.classList.add('no3d');
      return { setActive() {}, fit() {} };
    }
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(32, 1, 0.1, 100);
    scene.add(new T.HemisphereLight(0xffffff, 0xcfd6d4, 1.6));
    const sun = new T.DirectionalLight(0xffffff, 1.4); sun.position.set(3, 5, 4); scene.add(sun);

    const INK = new T.Color(col('ink'));
    const edgeMat = new T.LineBasicMaterial({ color: INK });
    function inked(geo, color, opts) {
      const mat = new T.MeshLambertMaterial(Object.assign({ color: new T.Color(color) }, opts || {}));
      const mesh = new T.Mesh(geo, mat);
      mesh.add(new T.LineSegments(new T.EdgesGeometry(geo, 28), edgeMat));
      return mesh;
    }
    const alongX = (geo) => { geo.rotateZ(Math.PI / 2); return geo; };   // 원기둥 축을 x축으로

    // 터빈: 날개 14장과 허브, 테두리
    const turbine = new T.Group(); turbine.position.x = -2.5; scene.add(turbine);
    const turbineSpin = new T.Group(); turbine.add(turbineSpin);
    turbineSpin.add(inked(alongX(new T.CylinderGeometry(0.28, 0.28, 0.6, 24)), '#9aa3ab'));
    for (let i = 0; i < 14; i++) {
      const b = inked(new T.BoxGeometry(0.42, 0.95, 0.05), '#dfe5e8');
      const a = i / 14 * Math.PI * 2;
      b.position.set(0, Math.cos(a) * 0.72, Math.sin(a) * 0.72);
      b.rotation.x = a; b.rotateY(0.45);
      turbineSpin.add(b);
    }
    const casing = inked(alongX(new T.CylinderGeometry(1.3, 1.3, 0.75, 40, 1, true)), '#e6ece9', { transparent: true, opacity: 0.18, side: T.DoubleSide, depthWrite: false });
    turbine.add(casing);

    // 회전축
    const shaft = inked(alongX(new T.CylinderGeometry(0.09, 0.09, 5.6, 16)), '#b7bcc4');
    shaft.position.x = -0.4; scene.add(shaft);

    // 발전기: 회전자(자석)와 고정자(코일)
    const gen = new T.Group(); gen.position.x = 1.15; scene.add(gen);
    const rotor = new T.Group(); gen.add(rotor);
    const half = (start, color) => inked(alongX(new T.CylinderGeometry(0.62, 0.62, 1.35, 32, 1, false, start, Math.PI)), color);
    rotor.add(half(0, col('n')), half(Math.PI, col('s')));
    const stator = new T.Group(); gen.add(stator);
    const shell = inked(alongX(new T.CylinderGeometry(1.32, 1.32, 1.7, 48, 1, true)), '#e6ece9', { transparent: true, opacity: 0.2, side: T.DoubleSide, depthWrite: false });
    stator.add(shell);
    for (let i = 0; i < 8; i++) {
      const a = i / 8 * Math.PI * 2;
      const coil = new T.Group();
      coil.add(inked(new T.BoxGeometry(1.25, 0.22, 0.4), col('copper-f')));           // 감은 구리선 덩어리
      coil.add(inked(new T.BoxGeometry(1.4, 0.08, 0.2), '#80868e'));                // 철심
      coil.position.set(0, Math.cos(a) * 1.0, Math.sin(a) * 1.0);
      coil.rotation.x = a;
      stator.add(coil);
    }

    // 이름표가 따라갈 점
    const anchors = {
      turbine: () => new T.Vector3(0, 1.4, 0).add(turbine.position),
      shaft: () => new T.Vector3(-0.3, -0.18, 0),
      rotor: () => new T.Vector3(0.75, -0.7, 0.2).add(gen.position),
      stator: () => new T.Vector3(0, 1.45, 0).add(gen.position).add(stator.position),
    };

    // 카메라: 끌어서 둘러보기
    const view = { yaw: -0.62, pitch: 0.32, dist: 9.2, target: new T.Vector3(-0.4, 0, 0) };
    const OUT = { yaw: -0.62, pitch: 0.32, dist: 9.2, tx: -0.4, ty: 0 };
    const WIDE = { yaw: -0.62, pitch: 0.3, dist: 12.4, tx: -0.9, ty: 0.85 };   // 분해했을 때 다 보이게 물러선다
    const IN = { yaw: -1.0, pitch: 0.2, dist: 5.0, tx: 1.15, ty: 0 };
    function placeCamera() {
      const { yaw, pitch, dist, target } = view;
      camera.position.set(target.x + dist * Math.cos(pitch) * Math.sin(yaw), target.y + dist * Math.sin(pitch), target.z + dist * Math.cos(pitch) * Math.cos(yaw));
      camera.lookAt(target);
    }
    let drag = null;
    canvas.addEventListener('pointerdown', (e) => { canvas.setPointerCapture(e.pointerId); drag = { id: e.pointerId, x: e.clientX, y: e.clientY }; });
    canvas.addEventListener('pointermove', (e) => {
      if (!drag || drag.id !== e.pointerId) return;
      view.yaw -= (e.clientX - drag.x) * 0.006; view.pitch = clamp(view.pitch + (e.clientY - drag.y) * 0.004, -0.2, 1.1);
      drag.x = e.clientX; drag.y = e.clientY;
    });
    const end = (e) => { if (drag && drag.id === e.pointerId) drag = null; };
    canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);

    // 상태
    const st = { w: 0, target: 6, exploded: false, inside: false };
    let raf = 0, active = false, last = 0;
    function fit() {
      const w = stage.offsetWidth, h = stage.offsetHeight;
      if (!w || !h) return;
      const rs = (window.Reveal && Reveal.getScale) ? Reveal.getScale() : 1;
      renderer.setPixelRatio(clamp((window.devicePixelRatio || 1) * rs, 1, 2.5));
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
      render();
    }
    function render() {
      placeCamera();
      renderer.render(scene, camera);
      const w = stage.offsetWidth, h = stage.offsetHeight;
      labels.forEach((el) => {
        const p = anchors[el.dataset.part]().project(camera);
        el.style.transform = `translate(${(p.x + 1) / 2 * w}px, ${(1 - p.y) / 2 * h}px) translate(-50%, -50%)`;
      });
    }
    function frame(t) {
      raf = 0; if (!active) return;
      const dt = clamp((t - last) / 1000 || 1 / 60, 1 / 240, 0.05); last = t;
      st.w += (st.target - st.w) * (1 - Math.exp(-dt / 0.8));
      const a = st.w * dt;
      turbineSpin.rotation.x += a; rotor.rotation.x += a; shaft.rotation.x += a;
      if (bulb) bulb.style.opacity = String(clamp(st.w / 6, 0, 1));
      render();
      raf = requestAnimationFrame(frame);
    }
    function setActive(on) {
      active = on;
      if (on && !raf) { last = performance.now(); fit(); raf = requestAnimationFrame(frame); }
      if (!on && raf) { cancelAnimationFrame(raf); raf = 0; }
    }

    // 조작
    const btn = (id) => root.querySelector(id);
    const tw = (obj, props, d) => (window.gsap && !reduce ? gsap.to(obj, Object.assign({ duration: d, ease: 'power2.inOut' }, props)) : Object.assign(obj, props));
    const look = (v) => { tw(view, { yaw: v.yaw, pitch: v.pitch, dist: v.dist }, 1.2); tw(view.target, { x: v.tx, y: v.ty }, 1.2); };
    function setBtn(id, on, a, b) { const el = btn(id); el.setAttribute('aria-pressed', String(on)); el.querySelector('span').textContent = on ? a : b; }
    function explode(on) {
      st.exploded = on;
      if (on && st.inside) { st.inside = false; setBtn('#g3-inside', false, '밖에서 보기', '안으로 들어가기'); }
      tw(stator.position, { y: on ? 1.9 : 0 }, 0.9);
      tw(turbine.position, { x: on ? -3.3 : -2.5 }, 0.9);
      look(on ? WIDE : OUT);
      setBtn('#g3-explode', on, '조립하기', '분해하기');
    }
    function inside(on) {
      st.inside = on;
      if (on && st.exploded) explode(false);         // 안으로 들어갈 때는 조립된 모습으로
      look(on ? IN : OUT);
      setBtn('#g3-inside', on, '밖에서 보기', '안으로 들어가기');
    }
    function spin(on) {
      st.target = on ? 6 : 0;
      const b = btn('#g3-spin'); b.setAttribute('aria-pressed', String(on)); b.querySelector('span').textContent = on ? '터빈 멈추기' : '터빈 돌리기';
    }
    btn('#g3-explode').addEventListener('click', () => explode(!st.exploded));
    btn('#g3-inside').addEventListener('click', () => inside(!st.inside));
    btn('#g3-spin').addEventListener('click', () => spin(st.target === 0));
    // 부품 이름에 손을 대면 3D에서 그 부품을 밝힌다
    const parts = { turbine: [turbineSpin, casing], shaft: [shaft], rotor: [rotor], stator: [stator] };
    root.querySelectorAll('[data-hl]').forEach((li) => {
      const set = (on) => parts[li.dataset.hl].forEach((g) => g.traverse((o) => { if (o.material && o.material.emissive) o.material.emissive.setHex(on ? 0x3a3000 : 0x000000); }));
      li.addEventListener('pointerenter', () => set(true)); li.addEventListener('pointerleave', () => set(false));
      li.addEventListener('focus', () => set(true)); li.addEventListener('blur', () => set(false));
    });
    fit();
    return { setActive, fit, explode, inside, spin };
  }

  window.Gen3D = { mount };
})();
