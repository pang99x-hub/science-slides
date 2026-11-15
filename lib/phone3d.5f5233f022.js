/* 1-2 2차시 체험 «3D 스마트폰 속 센서»(교과서 33쪽 센서: 자연계의 신호를 전기 신호로 바꾸는 장치).
   기울기 막대로 폰을 옆으로 눕히면 가속도 센서가 알아채 화면이 가로로 돌고, 주변 밝기 막대를 바꾸면 조도(빛) 센서가 화면 밝기를 맞추며,
   «손 가까이»를 켜면 근접 센서가 화면을 끈다. 빈 곳을 끌면 돌려 보고 바퀴로 다가간다.
   Phone3D.mount(root) → { setActive, fit } · 시험용: root._ph.tilt(도) · light(0~100) · near(on) */
(function () {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function mount(root) {
    const stage = root.querySelector('.ph-stage'), cv = stage.querySelector('canvas'), now = root.querySelector('.ph-now'), out = root.querySelector('.ph-out');
    const tR = root.querySelector('.ph-tilt'), lR = root.querySelector('.ph-light'), nB = root.querySelector('.ph-near');
    const s = window.Scene3D.make(stage, cv, { view: { yaw: 0.35, pitch: 0.25, dist: 13, target: [0, 0, 0] }, min: 6, max: 26, pmin: -0.3 });
    if (!s.ok) return { setActive() {}, fit() {} };
    const { T, scene } = s;
    const hemi = new T.HemisphereLight(0xffffff, 0x9aa49a, 1.0); scene.add(hemi);
    const key = new T.DirectionalLight(0xffffff, 1.2); key.position.set(4, 8, 10); scene.add(key);
    // 화면 그림(캔버스 텍스처)
    const sc = document.createElement('canvas'); sc.width = 360; sc.height = 720; const g = sc.getContext('2d');
    const tex = new T.CanvasTexture(sc); tex.colorSpace = T.SRGBColorSpace;
    const phone = new T.Group(); scene.add(phone);
    const body = new T.Mesh(new T.BoxGeometry(3.2, 6.4, 0.32), new T.MeshStandardMaterial({ color: 0x2b3a4a, metalness: 0.3, roughness: 0.5 })); phone.add(body);
    const screen = new T.Mesh(new T.PlaneGeometry(2.9, 5.8), new T.MeshBasicMaterial({ map: tex })); screen.position.z = 0.165; phone.add(screen);
    const dot = (x, y, col, r = 0.07) => { const m = new T.Mesh(new T.CircleGeometry(r, 20), new T.MeshBasicMaterial({ color: col })); m.position.set(x, y, 0.168); phone.add(m); return m; };
    const cam = dot(0, 3.0, 0x0b0f16, 0.11), lightS = dot(-0.45, 3.02, 0x5a6a7a), proxS = dot(0.45, 3.02, 0x5a6a7a);
    const chip = new T.Mesh(new T.BoxGeometry(0.7, 0.7, 0.05), new T.MeshBasicMaterial({ color: 0x3f8f4a })); chip.position.set(0.6, -1.2, -0.18); phone.add(chip);
    void cam;
    const hand = new T.Mesh(new T.SphereGeometry(1.4, 24, 16), new T.MeshLambertMaterial({ color: 0xf2c9a0, transparent: true, opacity: 0.85 })); hand.scale.set(1.3, 0.8, 0.6); hand.position.set(0, 3.6, 1.6); hand.visible = false; phone.add(hand);
    const lab = (txt, obj, off) => { const e = document.createElement('span'); e.className = 'g3-label ph-lab'; e.textContent = txt; stage.appendChild(e); s.label(e, () => obj.getWorldPosition(new T.Vector3()).add(off)); return e; };
    lab('조도(빛) 센서', lightS, new T.Vector3(-1.3, 0.6, 0)); lab('근접 센서', proxS, new T.Vector3(1.3, 0.6, 0)); lab('가속도 센서(안쪽)', chip, new T.Vector3(1.6, -0.4, 0));
    let tilt = 0, amb = 60, near = false; const seen = { rot: false, lit: false, prox: false }; let lit0 = amb;
    function paint(land, bright) {
      g.save(); g.fillStyle = '#000'; g.fillRect(0, 0, 360, 720);
      if (!near) {
        g.globalAlpha = bright; g.fillStyle = '#eaf3fb'; g.fillRect(0, 0, 360, 720);
        g.translate(180, 360); if (land) g.rotate(-Math.PI / 2); g.translate(-180, -360);
        const w = land ? 640 : 320, h = land ? 300 : 640, x0 = 180 - w / 2, y0 = 360 - h / 2;
        g.fillStyle = '#2a73b8'; g.fillRect(x0, y0, w, 60); g.fillStyle = '#fff'; g.font = '700 30px sans-serif'; g.fillText(land ? '가로 화면' : '세로 화면', x0 + 18, y0 + 42);
        g.fillStyle = '#9fd1a8'; g.fillRect(x0 + 16, y0 + 80, w - 32, h * 0.45);
        g.fillStyle = '#1d2433'; g.font = '600 26px sans-serif'; g.fillText(`밝기 ${Math.round(bright * 100)}%`, x0 + 18, y0 + h - 30);
      }
      g.restore(); tex.needsUpdate = true;
    }
    function update() {
      phone.rotation.z = -tilt * Math.PI / 180;
      const land = Math.abs(tilt) > 45, bright = clamp(0.25 + amb / 100 * 0.75, 0.2, 1);
      hand.visible = near; paint(land, bright);
      s.renderer.setClearColor(new T.Color('#1c2744').lerp(new T.Color('#e8eef2'), amb / 100), 1);
      hemi.intensity = 0.3 + amb / 100; key.intensity = 0.3 + amb / 100;
      (lightS.material).color.set(amb > 70 ? 0xffd84d : 0x5a6a7a); (proxS.material).color.set(near ? 0xd9483b : 0x5a6a7a); (chip.material).color.set(land ? 0xffd84d : 0x3f8f4a);
      if (land) seen.rot = true; if (Math.abs(amb - lit0) >= 40) seen.lit = true; if (near) seen.prox = true;
      out.innerHTML = near ? '<b>근접 센서</b>: 귀(손)가 가까이 → 통화 중 화면이 꺼진다'
        : land ? '<b>가속도 센서</b>: 폰이 옆으로 누운 것을 알아채 화면을 가로로 돌렸다'
          : `<b>조도 센서</b>: 주변이 ${amb > 60 ? '밝아' : '어두워'} 화면 밝기를 ${Math.round(bright * 100)}%로 맞췄다`;
      const ok = []; if (seen.rot) ok.push(1); if (seen.lit) ok.push(2); if (seen.prox) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      now.textContent = st === 1 ? '① 기울기 막대로 폰을 옆으로 눕히자' : st === 2 ? '② 주변 밝기를 크게 바꿔 보자' : st === 3 ? '③ «손 가까이»를 눌러 보자' : '센서가 신호를 받아 폰이 알아서 반응한다';
      now.classList.toggle('done', st === 0);
      s.render();
    }
    tR.addEventListener('input', () => { tilt = +tR.value; update(); });
    lR.addEventListener('input', () => { amb = +lR.value; update(); });
    nB.addEventListener('click', () => { near = !near; nB.setAttribute('aria-pressed', String(near)); update(); });
    root.querySelector('.ph-home').addEventListener('click', () => s.look({ yaw: 0.35, pitch: 0.25, dist: 13, target: [0, 0, 0] }));
    tR.value = '0'; lR.value = String(amb); update();
    root._ph = { tilt: (v) => { tR.value = String(v); tR.dispatchEvent(new Event('input')); }, light: (v) => { lR.value = String(v); lR.dispatchEvent(new Event('input')); }, near: (on) => { if (near !== !!on) nB.click(); } };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.Phone3D = { mount };
})();
