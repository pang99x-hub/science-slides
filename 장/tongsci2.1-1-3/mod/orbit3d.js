/* 1-1-3 3D 설명 장(1-1-2 orbit3d.js를 가져옴) 공통 도구(Three.js, 엔진 vendor 0.169). 1-1-1 scene3d.js의 방식을 이어받아 «자세히 돌려 보기»를 더했다.
   Orbit.make(stage, canvas, o) → s
     o = { view: { yaw, pitch, dist, target: [x,y,z] }, min, max, pmin, pmax, fov, bg, spin(초당 라디안, 손대면 멈춤),
           onFrame(dt), onRender(), click(e) }
   조작: 한 손가락·왼쪽 끌기 = 둘레 돌기 · 바퀴·두 손가락 벌리기 = 확대·축소 · 두 손가락 끌기·오른쪽 끌기·Shift 끌기 = 옮기기
         화살표 = 돌기, +/− = 확대·축소, 0 = 처음 시점. s.reset()은 «처음 시점» 단추가 부른다.
   s.label(el, 점 또는 () => 점): 이름표가 대상에 붙어 따라다닌다(뒤로 가면 흐려짐).
   s.pick(e, 물체들) · s.look({yaw,pitch,dist,target}, 초) · s.toClient(점) · s.mat(색, 옵션) · s.T(=THREE)
   WebGL이 안 되면 stage에 no3d를 달고 ok=false. */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function make(stage, canvas, o = {}) {
    const T = window.THREE;
    let renderer = null;
    try { renderer = T && new T.WebGLRenderer({ canvas, antialias: true, alpha: !o.bg }); } catch (e) { renderer = null; }
    if (!renderer) { stage.classList.add('no3d'); return { ok: false, setActive() {}, fit() {}, reset() {}, label() {}, render() {} }; }
    if (o.bg) renderer.setClearColor(new T.Color(o.bg), 1);
    renderer.outputColorSpace = T.SRGBColorSpace;
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(o.fov || 36, 1, 0.05, 500);
    scene.add(new T.HemisphereLight(0xffffff, 0xb8b0a0, 1.5));
    const sun = new T.DirectionalLight(0xffffff, 1.9); sun.position.set(6, 10, 8); scene.add(sun);
    const fill = new T.DirectionalLight(0xdfe8ff, 0.6); fill.position.set(-8, 3, -6); scene.add(fill);
    const mat = (color, extra) => new T.MeshStandardMaterial(Object.assign({ color: new T.Color(color), roughness: 0.62, metalness: 0.02 }, extra || {}));
    const v0 = o.view || { yaw: 0.5, pitch: 0.35, dist: 12, target: [0, 0, 0] };
    const home = { yaw: v0.yaw, pitch: v0.pitch, dist: v0.dist, target: v0.target.slice() };
    const view = { yaw: v0.yaw, pitch: v0.pitch, dist: v0.dist, target: new T.Vector3(...v0.target) };
    const PMIN = o.pmin ?? -1.35, PMAX = o.pmax ?? 1.45;
    function place() {
      const { yaw, pitch, dist, target } = view;
      camera.position.set(target.x + dist * Math.cos(pitch) * Math.sin(yaw), target.y + dist * Math.sin(pitch), target.z + dist * Math.cos(pitch) * Math.cos(yaw));
      camera.lookAt(target);
    }
    const ray = new T.Raycaster(), ndc = new T.Vector2();
    function aim(e) { const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); return ray; }
    const pick = (e, objs) => aim(e).intersectObjects(objs, true)[0] || null;
    function toClient(p) { const r = canvas.getBoundingClientRect(), v = p.clone().project(camera); return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height, behind: v.z > 1 }; }
    let touched = false;
    const kick = () => { touched = true; if (!active) render(); };
    // 옮기기: 화면 방향으로 target을 민다(거리에 비례)
    function pan(dx, dy) {
      const h = canvas.getBoundingClientRect().height || 1, k = (2 * view.dist * Math.tan((camera.fov * Math.PI) / 360)) / h;
      const right = new T.Vector3().setFromMatrixColumn(camera.matrix, 0), up = new T.Vector3().setFromMatrixColumn(camera.matrix, 1);
      view.target.addScaledVector(right, -dx * k).addScaledVector(up, dy * k);
      if (o.bounds) { const b = o.bounds; view.target.set(clamp(view.target.x, -b, b), clamp(view.target.y, -b, b), clamp(view.target.z, -b, b)); }
    }
    const zoom = (f) => { view.dist = clamp(view.dist * f, o.min || 2, o.max || 60); };
    // 여러 손가락
    const pts = new Map();
    let mode = null, last = null, down0 = null;
    const mid = () => { const a = [...pts.values()]; return { x: (a[0].x + a[1].x) / 2, y: (a[0].y + a[1].y) / 2, d: Math.hypot(a[0].x - a[1].x, a[0].y - a[1].y) }; };
    canvas.addEventListener('pointerdown', (e) => {
      try { canvas.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ }
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pts.size === 1) { mode = (e.button === 2 || e.shiftKey || e.ctrlKey) ? 'pan' : 'rot'; last = { x: e.clientX, y: e.clientY }; down0 = { x: e.clientX, y: e.clientY, t: performance.now() }; }
      else if (pts.size === 2) { mode = 'two'; last = mid(); down0 = null; }
      canvas.classList.add('dragging'); e.preventDefault();
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!pts.has(e.pointerId)) return;
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (mode === 'two' && pts.size === 2) {
        const m = mid();
        if (last.d > 0 && m.d > 0) zoom(last.d / m.d);
        pan(m.x - last.x, m.y - last.y); last = m; kick(); return;
      }
      if (pts.size !== 1) return;
      const dx = e.clientX - last.x, dy = e.clientY - last.y; last = { x: e.clientX, y: e.clientY };
      if (mode === 'pan') pan(dx, dy);
      else { view.yaw -= dx * 0.0075; view.pitch = clamp(view.pitch + dy * 0.0055, PMIN, PMAX); }
      kick();
    });
    const end = (e) => {
      if (!pts.has(e.pointerId)) return;
      pts.delete(e.pointerId);
      if (down0 && o.click && Math.hypot(e.clientX - down0.x, e.clientY - down0.y) < 7) o.click(e);
      down0 = null;
      if (pts.size === 1) { const p = [...pts.values()][0]; mode = 'rot'; last = { x: p.x, y: p.y }; }
      if (!pts.size) { mode = null; canvas.classList.remove('dragging'); }
      if (!active) render();
    };
    canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
    canvas.addEventListener('wheel', (e) => { e.preventDefault(); zoom(1 + Math.sign(e.deltaY) * 0.09); kick(); }, { passive: false });
    canvas.tabIndex = 0;
    canvas.addEventListener('keydown', (e) => {
      const k = e.key; let used = true;
      if (k === 'ArrowLeft') view.yaw += 0.12; else if (k === 'ArrowRight') view.yaw -= 0.12;
      else if (k === 'ArrowUp') view.pitch = clamp(view.pitch + 0.1, PMIN, PMAX); else if (k === 'ArrowDown') view.pitch = clamp(view.pitch - 0.1, PMIN, PMAX);
      else if (k === '+' || k === '=') zoom(0.88); else if (k === '-') zoom(1.12); else if (k === '0') reset(); else used = false;
      if (used) { e.preventDefault(); e.stopPropagation(); kick(); }
    });
    // 이름표
    const labels = [];
    const label = (el, at) => { labels.push({ el, at }); };
    function render() {
      place(); renderer.render(scene, camera);
      const w = stage.offsetWidth, h = stage.offsetHeight;
      labels.forEach(({ el, at }) => {
        const p = typeof at === 'function' ? at() : at;
        if (!p) { el.style.visibility = 'hidden'; return; }
        const v = p.clone().project(camera);
        el.style.transform = `translate(${((v.x + 1) / 2 * w).toFixed(1)}px, ${((1 - v.y) / 2 * h).toFixed(1)}px) translate(-50%, -50%)`;
        el.style.visibility = v.z > 1 || Math.abs(v.x) > 1.05 || Math.abs(v.y) > 1.05 ? 'hidden' : '';
      });
      if (o.onRender) o.onRender();
    }
    function fit() {
      const w = stage.offsetWidth, h = stage.offsetHeight; if (!w || !h) return;
      const rs = (window.Reveal && Reveal.getScale) ? Reveal.getScale() : 1;
      renderer.setPixelRatio(clamp((window.devicePixelRatio || 1) * rs, 1, 2));
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); render();
    }
    let raf = 0, active = false, lastT = 0;
    function frame(t) {
      raf = 0; if (!active) return;
      const dt = clamp((t - lastT) / 1000 || 1 / 60, 1 / 240, 0.05); lastT = t;
      if (o.spin && !touched && !pts.size) view.yaw += o.spin * dt;
      if (o.onFrame) o.onFrame(dt);
      render(); raf = requestAnimationFrame(frame);
    }
    function setActive(on) {
      active = on && !reduce;
      if (on) fit();
      if (active && !raf) { lastT = performance.now(); raf = requestAnimationFrame(frame); }
      if (!active && raf) { cancelAnimationFrame(raf); raf = 0; }
      if (on && reduce && o.onFrame) { o.onFrame(1); render(); }
    }
    function look(v, d = 1.0) {
      touched = true;
      const to = { yaw: v.yaw ?? view.yaw, pitch: v.pitch ?? view.pitch, dist: v.dist ?? view.dist };
      if (window.gsap && !reduce) {
        gsap.to(view, Object.assign({ duration: d, ease: 'power2.inOut', onUpdate: () => { if (!active) render(); } }, to));
        if (v.target) gsap.to(view.target, { x: v.target[0], y: v.target[1], z: v.target[2], duration: d, ease: 'power2.inOut' });
      } else { Object.assign(view, to); if (v.target) view.target.set(...v.target); render(); }
    }
    function reset() { look(home, 0.9); }
    if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => fit()).observe(stage);
    return {
      ok: true, T, scene, camera, renderer, mat, fit, setActive, render, look, reset, view, label, toClient, pick, sun,
      get active() { return active; }, touch() { touched = true; },
    };
  }

  // 장 틀에 3D 조작 안내 줄과 «처음 시점» 단추를 붙인다
  function chrome(stage, s) {
    const bar = document.createElement('div'); bar.className = 'o3-bar';
    bar.innerHTML = '<span class="o3-hint"><b>끌기</b> 돌리기 · <b>바퀴·두 손가락</b> 확대 · <b>두 손가락·오른쪽 끌기</b> 옮기기</span><button type="button" class="o3-home">처음 시점</button>';
    stage.appendChild(bar);
    bar.querySelector('.o3-home').addEventListener('click', () => s.reset());
    const no = document.createElement('p'); no.className = 'o3-no'; no.textContent = '이 기기에서는 3D 그림을 열 수 없다. 옆의 풀이와 사진으로 살펴보자.';
    stage.appendChild(no);
    return bar;
  }

  window.Orbit = { make, chrome };
})();
