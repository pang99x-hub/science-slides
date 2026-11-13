/* 사막은 어디에?(교과서 85쪽 그림 Ⅱ-11 대기 대순환, Ⅱ-12 사막 분포): 3D 지구본.
   지구본에 걸린 노란 위도 고리를 위아래로 끌면(↑·↓ 키도) 그 위도에서 공기가 오르는지 내리는지(오른쪽 가장자리의 순환 고리),
   비가 많은지 적은지가 나오고, 그 위도 가까이(±7°)의 사막 표시가 빛난다. 빈 곳을 끌면 지구본을 둘러본다.
   순환: 0~30° 해들리, 30~60° 페렐, 60~90° 극 순환. 적도·60°는 상승, 30°·90°는 하강(교과서의 개략적인 경향). */
(function () {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const R = 5, D2R = Math.PI / 180;

  function texture(T) {
    const c = document.createElement('canvas'); c.width = 2048; c.height = 1024;
    const g = c.getContext('2d');
    g.fillStyle = '#5f97c6'; g.fillRect(0, 0, 2048, 1024);
    const P = (lo, la) => [(lo + 180) / 360 * 2048, (90 - la) / 180 * 1024];
    window.World.draw(g, P, { land: '#9cc27f', edge: 'rgba(29,36,51,.5)', lw: 2 });
    // 사막: 모래색 얼룩
    window.World.DESERTS.forEach(([, lo, la, cold]) => {
      const [x, y] = P(lo, la);
      g.fillStyle = cold ? 'rgba(206,182,140,.95)' : 'rgba(232,200,120,.95)';
      g.beginPath(); g.ellipse(x, y, lo === 10 ? 150 : 60, lo === 10 ? 50 : 34, 0, 0, 7); g.fill();
    });
    // 남극·그린란드는 하얗게
    g.fillStyle = '#f4f7fa'; g.fillRect(0, 1024 * (160 / 180), 2048, 1024);
    const t = new T.CanvasTexture(c); t.anisotropy = 4; if (T.SRGBColorSpace) t.colorSpace = T.SRGBColorSpace;
    return t;
  }
  const xyz = (T, lo, la, r = R) => new T.Vector3(r * Math.cos(la * D2R) * Math.sin(lo * D2R), r * Math.sin(la * D2R), r * Math.cos(la * D2R) * Math.cos(lo * D2R));
  // 위도 밴드별 공기·비
  function zone(lat) {
    const a = Math.abs(lat);
    if (a < 12) return { air: 'up', rain: 0.95, t: '상승 기류', w: '구름이 잘 생겨 비가 많다 → 열대 우림' };
    if (a < 20) return { air: 'mix', rain: 0.55, t: '상승 → 하강 사이', w: '비가 오는 철과 마른 철이 갈린다' };
    if (a < 36) return { air: 'down', rain: 0.1, t: '하강 기류', w: '구름이 잘 안 생겨 맑고 건조 → 사막이 많다' };
    if (a < 50) return { air: 'mix', rain: 0.5, t: '하강 → 상승 사이(편서풍)', w: '비가 고르게 오는 편' };
    if (a < 68) return { air: 'up', rain: 0.75, t: '상승 기류', w: '비·눈이 많은 편' };
    return { air: 'down', rain: 0.15, t: '하강 기류', w: '차갑고 건조하다' };
  }

  function mount(root) {
    const stage = root.querySelector('.gl-stage'), canvas = stage.querySelector('canvas');
    const now = stage.querySelector('.gl-now'), latLab = stage.querySelector('.gl-lat');
    const info = { t: root.querySelector('.gl-air'), w: root.querySelector('.gl-w'), rain: root.querySelector('.gl-rain i'), list: root.querySelector('.gl-list'), cold: root.querySelector('.gl-cold') };
    let lat = 0, tm = 0, spin = 0;
    const s = window.Scene3D.make(stage, canvas, { view: { yaw: 0, pitch: 0.12, dist: 21, target: [1.2, 0, 0] }, fov: 34, min: 14, max: 34, pmin: -0.9, pmax: 0.9, onFrame: frame });
    if (!s.ok) return { setActive() {}, fit() {} };
    const { T, scene, group } = s;
    s.renderer.setClearColor(new T.Color('#1c2744'), 1);
    scene.add(new T.HemisphereLight(0xffffff, 0x334466, 1.6));
    const dl = new T.DirectionalLight(0xffffff, 1.4); dl.position.set(8, 6, 14); scene.add(dl);
    const earth = group();
    earth.add(new T.Mesh(new T.SphereGeometry(R, 64, 48), new T.MeshLambertMaterial({ map: texture(T) })));
    // 위도선(30°마다)
    const latMat = new T.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.45 });
    [-60, -30, 0, 30, 60].forEach((la) => { const pts = []; for (let lo = 0; lo <= 360; lo += 6) pts.push(xyz(T, lo, la, R * 1.003)); earth.add(new T.Line(new T.BufferGeometry().setFromPoints(pts), latMat)); });
    // 사막 표시
    const marks = window.World.DESERTS.map(([name, lo, la, cold]) => {
      const m = new T.Mesh(new T.SphereGeometry(0.16, 12, 10), new T.MeshBasicMaterial({ color: cold ? 0xa98b5e : 0xe0a526 }));
      m.position.copy(xyz(T, lo, la, R * 1.02)); earth.add(m);
      const lab = document.createElement('span'); lab.className = 'g3-label gl-dl'; lab.textContent = name; stage.appendChild(lab);
      const w = new T.Vector3();
      s.label(lab, () => m.getWorldPosition(w));
      return { name, la, cold, m, lab, w };
    });
    // 위도 고리
    const ring = new T.Mesh(new T.TorusGeometry(1, 0.06, 10, 96), new T.MeshBasicMaterial({ color: 0xffd23a }));
    ring.rotation.x = Math.PI / 2; scene.add(ring);
    // 오른쪽 가장자리의 순환 고리(카메라 쪽 평면에 늘 보이게)
    const cells = group();
    const cellLines = [];
    void cellLines;
    const loopMat = (c) => new T.LineBasicMaterial({ color: c });
    const cellDef = [[0, 30, 1], [30, 60, -1], [60, 88, 1]];   // 위도 a→b, 방향(1이면 a에서 오름)
    const right = new T.Vector3(1, 0, 0), up = new T.Vector3(0, 1, 0);
    const P2 = (la, h) => right.clone().multiplyScalar((R + h) * Math.cos(la * D2R)).add(up.clone().multiplyScalar((R + h) * Math.sin(la * D2R)));
    const dots = [];
    function buildCells() {
      while (cells.children.length) cells.remove(cells.children[0]);
      cellLines.length = 0;
      [1, -1].forEach((hs) => cellDef.forEach(([a, b, dir], i) => {
        const pts = [];
        const ring2 = (u) => {   // 0..1 고리 한 바퀴: 지면(b→a) → 오름(a) → 위(a→b) → 내림(b)
          const lo = 0.35, hi = 1.5;
          if (u < 0.25) return [b + (a - b) * (u / 0.25), lo];
          if (u < 0.5) return [a, lo + (hi - lo) * ((u - 0.25) / 0.25)];
          if (u < 0.75) return [a + (b - a) * ((u - 0.5) / 0.25), hi];
          return [b, hi - (hi - lo) * ((u - 0.75) / 0.25)];
        };
        for (let k = 0; k <= 64; k++) { const [la, h] = ring2(k / 64); pts.push(P2(hs * la, h)); }
        const line = new T.Line(new T.BufferGeometry().setFromPoints(pts), loopMat(i === 1 ? 0x9fd0ff : 0xffb070));
        cells.add(line); cellLines.push(line);
        // 흐르는 점: 오르는 쪽이 a인 고리(해들리·극)와 b인 고리(페렐)를 방향으로 구분
        for (let q = 0; q < 6; q++) {
          const d = new T.Mesh(new T.SphereGeometry(0.09, 8, 6), new T.MeshBasicMaterial({ color: i === 1 ? 0x9fd0ff : 0xffb070 }));
          d.userData = { u: q / 6, f: ring2, hs, dir }; cells.add(d); dots.push(d);
        }
      }));
    }
    function frame(dt) {
      tm += dt; spin += dt * 0.08; earth.rotation.y = spin;
      // 순환 고리 평면(지역 x = 오른쪽)이 늘 카메라 오른쪽 가장자리에 보이도록 돌린다
      cells.rotation.y = s.view.yaw;
      dots.forEach((d) => {
        const u = d.userData; u.u = (u.u + dt * 0.12 * u.dir + 1) % 1;
        const [la, h] = u.f(u.u);
        d.position.set((R + h) * Math.cos(la * D2R), u.hs * (R + h) * Math.sin(la * D2R), 0);
      });
      const cam = s.camera.position.clone().normalize();
      marks.forEach((m) => { const on = Math.abs(m.la - lat) < 7; m.m.scale.setScalar(on ? 1.9 + Math.sin(tm * 6) * 0.3 : 1); m.m.getWorldPosition(m.w); m.lab.classList.toggle('back', m.w.clone().normalize().dot(cam) < 0.2); });
    }
    right.set(1, 0, 0); buildCells();
    function setLat(v) { root.dataset.latitude=String(v);
      lat = clamp(Math.round(v), -80, 80);
      const r = R * Math.cos(lat * D2R) * 1.02;
      ring.scale.setScalar(r); ring.position.y = R * Math.sin(lat * D2R);
      const z = zone(lat);
      latLab.textContent = `${lat === 0 ? '적도 0°' : `${lat > 0 ? '북위' : '남위'} ${Math.abs(lat)}°`}`;
      const a = Math.abs(lat), wind = a < 30 ? '무역풍' : a < 60 ? '편서풍' : '극동풍';
      info.t.textContent = z.t; info.w.textContent = z.w;
      root.querySelector('.gl-wind').textContent = `지상의 바람: ${wind}${lat >= 33 && lat <= 43 ? ' · 우리나라가 이 바람대에 있다' : ''}`; info.rain.style.width = (z.rain * 100) + '%';
      root.querySelector('.gl-arrow').className = 'gl-arrow ' + z.air;
      const near = marks.filter((m) => Math.abs(m.la - lat) < 7);
      marks.forEach((m) => m.lab.classList.toggle('on', near.includes(m)));
      info.list.textContent = near.length ? near.map((m) => m.name).join(' · ') : '이 위도 가까이에는 표시한 사막이 없다';
      info.cold.hidden = !near.some((m) => m.cold);
      now.textContent = Math.abs(Math.abs(lat) - 30) <= 6 ? '위도 30° 부근 · 하강 기류 → 사막이 몰려 있다' : '노란 고리를 위아래로 끌어 보자';
      now.classList.toggle('done', Math.abs(Math.abs(lat) - 30) <= 6);
      if (!s.active) s.render();
    }
    // 고리 잡기: 화면에서 고리와 가까우면 잡는다
    const tmp = new T.Vector3();
    const nearRing = (e) => {
      for (let lo = 0; lo < 360; lo += 10) {
        tmp.set(ring.scale.x * Math.sin(lo * D2R), ring.position.y, ring.scale.x * Math.cos(lo * D2R));
        const p = s.toClient(tmp); if (!p.behind && Math.hypot(p.x - e.clientX, p.y - e.clientY) < 34 * p.k) return true;
      }
      return false;
    };
    s.grab(nearRing, (e0) => {
      let y0 = e0.clientY, l0 = lat;
      stage.classList.add('gl-hold');
      return {
        move(e) {
          const hit = s.pick(e, [earth.children[0]]);
          if (hit) { const p = hit.point; setLat(Math.asin(clamp(p.y / R, -1, 1)) / D2R); }
          else { const k = s.toClient(new T.Vector3()).k || 1; setLat(l0 - (e.clientY - y0) / k * 0.25); }
        },
        up() { stage.classList.remove('gl-hold'); },
      };
    });
    canvas.addEventListener('keydown', (e) => { const d = { ArrowUp: 5, ArrowDown: -5 }[e.key]; if (d) { e.preventDefault(); e.stopPropagation(); setLat(lat + d); } });
    setLat(0);
    root._globe = { lat: setLat };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.Globe = { mount };
})();
