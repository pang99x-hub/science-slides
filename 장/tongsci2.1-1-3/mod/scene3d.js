/* 3D 장이 함께 쓰는 Three.js 도구(3-2 과학기술의 발전과 윤리/슬라이드/src/scene3d.js를 그대로 가져옴, 1-1-3에서는 섬 빚기·손잡이에 쓴다).
   Scene3D.make(stage, canvas, { view, shadows, fov, min, max, pmin, pmax, onFrame(dt), onRender(), click(e) })
     → { T, scene, camera, inked(geo, 색, 재질 옵션, 선 없음), mat(색), group(부모), fit, setActive, render, look(보기), view,
         label(el, 점), toClient(점), pick(e, 물체들), planeAt(e, 높이), grab(hit(e), start(e) → { move(e), up(e) }), ok }
   view = { yaw, pitch, dist, target: [x, y, z] } · 빈 곳을 끌면 둘러보고, 바퀴를 굴리면 다가간다(min~max).
   grab으로 올린 물체(해·구름 등)는 그 물체를 잡아 끈다. 끌지 않고 누르면 click(e).
   좌표: +x 동쪽, +z 남쪽, +y 위. WebGL이 안 되면 stage에 no3d를 달고 ok=false를 돌려준다. */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  function make(stage, canvas, o = {}) {
    const T = window.THREE;
    let renderer = null;
    try { renderer = T && new T.WebGLRenderer({ canvas, antialias: true, alpha: true }); } catch (e) { renderer = null; }
    if (!renderer) { stage.classList.add('no3d'); return { ok: false, setActive() {}, fit() {} }; }
    if (o.shadows) { renderer.shadowMap.enabled = true; renderer.shadowMap.type = T.PCFSoftShadowMap; }
    const css = getComputedStyle(document.documentElement);
    const col = (k) => (k[0] === '#' ? k : css.getPropertyValue('--' + k).trim());
    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(o.fov || 34, 1, 0.1, 400);
    const edgeMat = new T.LineBasicMaterial({ color: new T.Color(col('ink')) });
    const mat = (color, extra) => new T.MeshLambertMaterial(Object.assign({ color: new T.Color(col(color)) }, extra || {}));
    function inked(geo, color, extra, noEdge) {
      const m = new T.Mesh(geo, color && color.isMaterial ? color : mat(color, extra));
      if (o.shadows) { m.castShadow = true; m.receiveShadow = true; }
      if (!noEdge) m.add(new T.LineSegments(new T.EdgesGeometry(geo, 30), edgeMat));
      return m;
    }
    const group = (parent) => { const g = new T.Group(); (parent || scene).add(g); return g; };
    const v0 = o.view || { yaw: 0.5, pitch: 0.4, dist: 20, target: [0, 0, 0] };
    const view = { yaw: v0.yaw, pitch: v0.pitch, dist: v0.dist, target: new T.Vector3(...v0.target) };
    function place() {
      const { yaw, pitch, dist, target } = view;
      camera.position.set(target.x + dist * Math.cos(pitch) * Math.sin(yaw), target.y + dist * Math.sin(pitch), target.z + dist * Math.cos(pitch) * Math.cos(yaw));
      camera.lookAt(target);
    }
    // 화면 좌표(client) ↔ 장면
    const ray = new T.Raycaster(), ndc = new T.Vector2();
    function aim(e) { const r = canvas.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); return ray; }
    const pick = (e, objs) => aim(e).intersectObjects(objs, true)[0] || null;
    const planeAt = (e, y) => aim(e).ray.intersectPlane(new T.Plane(new T.Vector3(0, 1, 0), -y), new T.Vector3());
    function toClient(p) { const r = canvas.getBoundingClientRect(), v = p.clone().project(camera); return { x: r.left + (v.x + 1) / 2 * r.width, y: r.top + (1 - v.y) / 2 * r.height, behind: v.z > 1, k: r.width / (stage.offsetWidth || r.width) }; }
    // 잡을 물체가 있으면 그것을 끌고, 없으면 둘러보기
    const grabs = [];
    let drag = null;
    canvas.addEventListener('pointerdown', (e) => {
      const g = grabs.find((x) => x.hit(e)), h = g ? g.start(e) : null;
      try { canvas.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ }
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, x0: e.clientX, y0: e.clientY, h };
      canvas.classList.add(h ? 'holding' : 'dragging');
    });
    canvas.addEventListener('pointermove', (e) => {
      if (!drag) { canvas.classList.toggle('can-grab', grabs.some((x) => x.hit(e))); return; }
      if (drag.id !== e.pointerId) return;
      if (drag.h) drag.h.move(e);
      else { view.yaw -= (e.clientX - drag.x) * 0.006; view.pitch = clamp(view.pitch + (e.clientY - drag.y) * 0.004, o.pmin ?? 0.08, o.pmax ?? 1.25); }
      drag.x = e.clientX; drag.y = e.clientY; if (!active) render();
    });
    const end = (e) => {
      if (!drag || drag.id !== e.pointerId) return;
      const d = drag; drag = null; canvas.classList.remove('dragging', 'holding');
      if (d.h && d.h.up) d.h.up(e);
      if (!d.h && o.click && Math.hypot(e.clientX - d.x0, e.clientY - d.y0) < 6) o.click(e);
      if (!active) render();
    };
    canvas.addEventListener('pointerup', end); canvas.addEventListener('pointercancel', end);
    canvas.addEventListener('wheel', (e) => { e.preventDefault(); view.dist = clamp(view.dist * (1 + Math.sign(e.deltaY) * 0.08), o.min || 4, o.max || 80); if (!active) render(); }, { passive: false });
    const labels = [];
    const label = (el, at) => { labels.push({ el, at }); };
    function render() {
      place(); renderer.render(scene, camera);
      const w = stage.offsetWidth, h = stage.offsetHeight;
      labels.forEach(({ el, at }) => {
        const v = (typeof at === 'function' ? at() : at).clone().project(camera);
        el.style.transform = `translate(${((v.x + 1) / 2 * w).toFixed(1)}px, ${((1 - v.y) / 2 * h).toFixed(1)}px) translate(-50%, -50%)`; el.style.visibility = v.z > 1 ? 'hidden' : '';
      });
      if (o.onRender) o.onRender();
    }
    function fit() {
      const w = stage.offsetWidth, h = stage.offsetHeight; if (!w || !h) return;
      const rs = (window.Reveal && Reveal.getScale) ? Reveal.getScale() : 1;
      renderer.setPixelRatio(clamp((window.devicePixelRatio || 1) * rs, 1, 2));
      renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); render();
    }
    let raf = 0, active = false, last = 0;
    function frame(t) {
      raf = 0; if (!active) return;
      const dt = clamp((t - last) / 1000 || 1 / 60, 1 / 240, 0.05); last = t;
      if (o.onFrame) o.onFrame(dt);
      render(); raf = requestAnimationFrame(frame);
    }
    function setActive(on) {
      active = on && !reduce;
      if (on) fit();
      if (active && !raf) { last = performance.now(); raf = requestAnimationFrame(frame); }
      if (!active && raf) { cancelAnimationFrame(raf); raf = 0; }
      if (on && reduce && o.onFrame) { o.onFrame(0.016); render(); }
    }
    const look = (v, d = 1.1) => {
      const to = { yaw: v.yaw ?? view.yaw, pitch: v.pitch ?? view.pitch, dist: v.dist ?? view.dist };
      if (window.gsap && !reduce) {
        gsap.to(view, Object.assign({ duration: d, ease: 'power2.inOut', onUpdate: () => { if (!active) render(); } }, to));
        if (v.target) gsap.to(view.target, { x: v.target[0], y: v.target[1], z: v.target[2], duration: d, ease: 'power2.inOut' });
      } else { Object.assign(view, to); if (v.target) view.target.set(...v.target); render(); }
    };
    return {
      ok: true, T, scene, camera, renderer, inked, mat, group, fit, setActive, render, look, view, label, toClient, pick, planeAt, col,
      grab(hit, start) { grabs.push({ hit, start }); },
      get active() { return active; },
    };
  }

  // 장면 속 해: 동쪽(+x)에서 떠 남쪽(+z) 하늘을 지나 서쪽으로 진다. 해를 잡아 끌면 길을 따라 움직이며 시각이 바뀐다.
  //   sunRig(s, { R, H, south, t0, sky, shadow(그림자 범위), onChange(t, 고도 sin) }) → { set(t), t, el, light, ball, dirAt(t) → 해 쪽 단위 벡터 }
  function sunRig(s, o = {}) {
    const { T, scene } = s, R = o.R || 16, H = o.H ?? 0.8, S = o.south ?? 0.45, T0 = 5.4, T1 = 18.6;
    const hemi = new T.HemisphereLight(0xffffff, 0xb9c3b0, 1.2); scene.add(hemi);
    const light = new T.DirectionalLight(0xfff2d8, 1.8); scene.add(light); scene.add(light.target);
    if (o.shadow) {
      light.castShadow = true; const c = light.shadow.camera, a = o.shadow;
      Object.assign(c, { left: -a, right: a, top: a, bottom: -a, near: 1, far: 90 }); c.updateProjectionMatrix();
      light.shadow.mapSize.set(2048, 2048); light.shadow.bias = -0.0006; light.shadow.normalBias = 0.03;
    }
    const pos = (t, v = new T.Vector3()) => { const a = Math.PI * (t - 6) / 12; return v.set(R * Math.cos(a), R * H * Math.sin(a), R * S * Math.sin(a)); };
    // 해가 지나는 길(점선)
    const pts = []; for (let t = T0; t <= T1 + 1e-6; t += 0.2) pts.push(pos(t));
    const track = new T.Line(new T.BufferGeometry().setFromPoints(pts), new T.LineDashedMaterial({ color: 0xc98a12, dashSize: 0.6, gapSize: 0.45, transparent: true, opacity: 0.7, depthTest: false }));
    track.computeLineDistances(); track.renderOrder = 8; scene.add(track);
    const ball = new T.Mesh(new T.SphereGeometry(1.1, 28, 18), new T.MeshBasicMaterial({ color: 0xffcf3a, transparent: true, depthTest: false }));
    const halo = new T.Mesh(new T.SphereGeometry(1.9, 28, 18), new T.MeshBasicMaterial({ color: 0xffe9a0, transparent: true, opacity: 0.35, depthTest: false }));
    ball.renderOrder = 10; halo.renderOrder = 9; ball.add(halo); scene.add(ball);
    const DAY = new T.Color(o.sky || '#cfe7f3'), NIGHT = new T.Color('#1c2744'), skyC = new T.Color();
    let t = o.t0 ?? 12, el = 1;
    function set(v) {
      t = clamp(v, T0, T1); pos(t, ball.position);
      el = Math.sin(Math.PI * (t - 6) / 12);
      const day = clamp(el * 3, 0, 1);
      light.position.copy(ball.position).normalize().multiplyScalar(40); light.intensity = 2.5 * day;
      hemi.intensity = 0.5 + 0.55 * day;
      ball.material.color.set(day > 0 ? 0xffcf3a : 0xe0884a); ball.material.opacity = el < 0 ? 0.5 : 1; halo.visible = el > 0;
      s.renderer.setClearColor(skyC.copy(NIGHT).lerp(DAY, day), 1);
      if (o.onChange) o.onChange(t, el);
    }
    const near = (e) => { const p = s.toClient(ball.position); return Math.hypot(p.x - e.clientX, p.y - e.clientY) < 64 * p.k; };
    const tmp = new T.Vector3();
    s.grab(near, () => ({
      move(e) {
        let best = t, bd = Infinity;
        for (let u = T0; u <= T1 + 1e-6; u += 0.05) { const p = s.toClient(pos(u, tmp)), d = Math.hypot(p.x - e.clientX, p.y - e.clientY); if (d < bd) { bd = d; best = u; } }
        set(best);
      },
    }));
    set(t);
    return { set, get t() { return t; }, get el() { return el; }, light, ball, T0, T1, dirAt: (u) => pos(u).normalize() };
  }

  // 돌리는 손잡이(밸브·다이얼, SVG): 원을 그리며 끌면 0~max도 사이로 돈다. g 안의 .dl-spin이 돈다.
  //   dial(g, cx, cy, { max, v0, onChange(값 0~1) }) → { set(값), v }
  function dial(g, cx, cy, o) {
    const svg = g.ownerSVGElement, max = o.max || 300; let rot = (o.v0 ?? 0.5) * max, a0 = null;
    const ang = (ev) => { const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; const q = p.matrixTransform(svg.getScreenCTM().inverse()); return Math.atan2(q.y - cy, q.x - cx) * 180 / Math.PI; };
    const spin = g.querySelector('.dl-spin');
    const set = (r) => { rot = clamp(r, 0, max); if (spin) spin.setAttribute('transform', `rotate(${rot.toFixed(1)} ${cx} ${cy})`); o.onChange(rot / max); };
    g.addEventListener('pointerdown', (e) => { a0 = ang(e); try { g.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ } g.classList.add('drag'); e.stopPropagation(); });
    g.addEventListener('pointermove', (e) => { if (a0 === null) return; const a = ang(e); let d = a - a0; if (d > 180) d -= 360; if (d < -180) d += 360; a0 = a; set(rot + d); });
    const up = () => { a0 = null; g.classList.remove('drag'); };
    g.addEventListener('pointerup', up); g.addEventListener('pointercancel', up);
    g.addEventListener('keydown', (e) => { const d = { ArrowRight: 30, ArrowUp: 30, ArrowLeft: -30, ArrowDown: -30 }[e.key]; if (d) { e.preventDefault(); e.stopPropagation(); set(rot + d); } });
    set(rot);
    return { set: (v) => set(v * max), get v() { return rot / max; } };
  }

  window.Scene3D = { make, sunRig, dial };
})();
