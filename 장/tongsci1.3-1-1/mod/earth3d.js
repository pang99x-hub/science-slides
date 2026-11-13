/* 3-1 1차시 체험 «3D 지구 속으로»(교과서 105~106쪽 지권의 층상 구조). 4분의 1을 잘라 낸 지구.
   겉: 캔버스로 그린 바다·대륙·구름·극지 얼음(대륙 모양은 단순화). 잘린 면 두 장: 지각(대륙 쪽 두껍게)·맨틀(대류 무늬가 천천히 돈다)·
   외핵(출렁이는 액체)·내핵(빛나는 고체). 지각 두께는 잘 보이게 부풀렸다. 층을 누르면 빛나고 풀이.
   잘린 면 위 노란 탐침 손잡이를 끌어 중심 쪽으로 넣으면 계기판에 깊이·온도(이해를 돕기 위한 예)·상태가 바뀌고 경계에서 이름이 번쩍.
   Earth3D.mount(root) → { setActive, fit } · 시험용: root._e3.tap('crust'|'mantle'|'outer'|'inner') · probe(0~1) */
(function () {
  'use strict';
  const R = 4, RM = 3.78, RO = 2.19, RI = 0.81; // 반지름: 겉·모호면(부풀림)·맨틀 아래(2900 km)·내핵(5100 km)
  const L = {
    crust: { n: '지각', d: '0 ~ 약 35 km', m: '규산염 암석(대륙: 화강암, 바다 밑: 현무암)', s: '고체', c: '#9a7a55' },
    mantle: { n: '맨틀', d: '약 35 ~ 2900 km', m: '규산염 암석(감람암)', s: '고체 — 아주 천천히 흐른다(대류)', c: '#d9602e' },
    outer: { n: '외핵', d: '2900 ~ 5100 km', m: '철·니켈', s: '액체', c: '#f2a03d' },
    inner: { n: '내핵', d: '5100 ~ 6400 km', m: '철·니켈', s: '고체 — 압력이 매우 커서', c: '#ffd84d' },
  };
  const layerAt = (r) => (r > RM ? 'crust' : r > RO ? 'mantle' : r > RI ? 'outer' : 'inner');
  // 반지름(장면 단위) → 깊이 km(층마다 따로 늘여 그렸으니 구간별로 바꾼다)
  function depthKm(r) {
    const seg = [[R, RM, 0, 35], [RM, RO, 35, 2900], [RO, RI, 2900, 5100], [RI, 0, 5100, 6400]];
    for (const [a, b, k0, k1] of seg) if (r >= b) return k0 + (a - r) / (a - b) * (k1 - k0);
    return 6400;
  }
  // 온도: 이해를 돕기 위한 예(깊이 km → °C, 직선으로 이음)
  const TK = [[0, 15], [35, 500], [100, 1300], [2900, 3700], [5100, 4800], [6400, 5500]];
  function tempC(k) { for (let i = 1; i < TK.length; i++) if (k <= TK[i][0]) { const [a, ta] = TK[i - 1], [b, tb] = TK[i]; return ta + (k - a) / (b - a) * (tb - ta); } return 5500; }
  console.assert(Math.abs(depthKm(RO) - 2900) < 1 && Math.abs(depthKm(0) - 6400) < 1 && layerAt(1.5) === 'outer', 'earth3d: 깊이 구간');

  // 지구 겉 그림(정거원통 1024×512, 씨앗 고정 — 같은 모양이 늘 나온다)
  function surfaceTex() {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const g = c.getContext('2d');
    let seed = 11; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    const sea = g.createLinearGradient(0, 0, 0, 512); sea.addColorStop(0, '#1d4f8a'); sea.addColorStop(0.5, '#2a78c0'); sea.addColorStop(1, '#1d4f8a');
    g.fillStyle = sea; g.fillRect(0, 0, 1024, 512);
    const blobs = [[170, 190, 120, 90], [250, 330, 70, 110], [520, 170, 150, 80], [560, 300, 80, 110], [780, 210, 170, 90], [860, 360, 70, 45]];
    blobs.forEach(([x, y, rx, ry]) => {
      g.beginPath(); for (let k = 0; k <= 28; k++) { const a = k / 28 * Math.PI * 2, f = 0.75 + rnd() * 0.45; g.lineTo(x + Math.cos(a) * rx * f, y + Math.sin(a) * ry * f); } g.closePath();
      const land = g.createRadialGradient(x, y, 4, x, y, Math.max(rx, ry)); land.addColorStop(0, '#b89a5e'); land.addColorStop(0.55, '#6f9a4a'); land.addColorStop(1, '#3f7a3a');
      g.fillStyle = land; g.fill(); g.strokeStyle = 'rgba(230,220,180,.5)'; g.lineWidth = 2; g.stroke();
    });
    g.fillStyle = '#eef6ff'; g.fillRect(0, 0, 1024, 34); g.fillRect(0, 478, 1024, 34); // 극지 얼음
    return new window.THREE.CanvasTexture(c);
  }
  function cloudTex() {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 512; const g = c.getContext('2d');
    let seed = 5; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let k = 0; k < 70; k++) {
      const x = rnd() * 1024, y = 60 + rnd() * 390, w = 40 + rnd() * 120;
      const gr = g.createRadialGradient(x, y, 2, x, y, w); gr.addColorStop(0, 'rgba(255,255,255,.75)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      g.fillStyle = gr; g.beginPath(); g.ellipse(x, y, w, w * 0.35, 0, 0, Math.PI * 2); g.fill();
    }
    const t = new window.THREE.CanvasTexture(c); t.wrapS = window.THREE.RepeatWrapping; return t;
  }

  function mount(root) {
    const stage = root.querySelector('.e3-stage'), cv = stage.querySelector('canvas'), out = root.querySelector('.e3-out'), now = root.querySelector('.e3-now');
    const gauge = root.querySelector('.e3-gauge');
    const V0 = { yaw: 0.78, pitch: 0.28, dist: 19, target: [0, -0.2, 0] };
    const tapped = new Set();
    let hot = null, flash = 0, t = 0, texT = 0, depthT = 0, depthNow = 0, deep = false, liquid = false, lastLayer = 'crust', bump = 0;
    const s = window.Scene3D.make(stage, cv, {
      view: V0, min: 7, max: 30, pmin: -1.2, pmax: 1.3,
      onFrame(dt) {
        t += dt; texT += dt; if (flash > 0) flash = Math.max(0, flash - dt); if (bump > 0) bump = Math.max(0, bump - dt * 1.5);
        if (texT > 0.08) { texT = 0; drawCut(); }
        clouds.material.map.offset.x = (t * 0.004) % 1;
        depthNow += (depthT - depthNow) * Math.min(1, dt * 8); placeProbe();
      },
      click(e) { const h = s.pick(e, [faceA, faceB, earth]); if (h) tap(h.object === earth ? 'crust' : layerAt(h.point.length())); },
    });
    if (!s.ok) return { setActive() {}, fit() {} };
    const { T, scene } = s;
    // 바탕: 우주 그러데이션 + 별
    const bgc = document.createElement('canvas'); bgc.width = 4; bgc.height = 256; const b2 = bgc.getContext('2d'), bgr = b2.createLinearGradient(0, 0, 0, 256);
    bgr.addColorStop(0, '#16224d'); bgr.addColorStop(1, '#04060f'); b2.fillStyle = bgr; b2.fillRect(0, 0, 4, 256);
    scene.background = new T.CanvasTexture(bgc); scene.background.colorSpace = T.SRGBColorSpace;
    const sp = []; let seed = 3; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
    for (let k = 0; k < 500; k++) { const u = rnd() * 2 - 1, a = rnd() * Math.PI * 2, r = 70, q = Math.sqrt(1 - u * u); sp.push(Math.cos(a) * q * r, u * r, Math.sin(a) * q * r); }
    const sg = new T.BufferGeometry(); sg.setAttribute('position', new T.Float32BufferAttribute(sp, 3));
    scene.add(new T.Points(sg, new T.PointsMaterial({ color: 0xdfe8ff, size: 0.25, sizeAttenuation: true })));
    // 세 점 조명 + 바닥 그림자
    scene.add(new T.HemisphereLight(0xdfe8ff, 0x1a1c30, 0.75));
    const key = new T.DirectionalLight(0xfff4e0, 1.7); key.position.set(8, 7, 9); scene.add(key); s.fill(0.5);
    const rim = new T.DirectionalLight(0x7fb4ff, 1.0); rim.position.set(-8, 3, -9); scene.add(rim);
    s.softShadow(R * 1.25, -R - 0.6, 0.5);
    // 겉(4분의 3 구) — 잘라 낸 쪽은 x≥0, z≥0
    const PH0 = Math.PI, PHL = Math.PI * 1.5;
    const earth = new T.Mesh(new T.SphereGeometry(R, 72, 48, PH0, PHL), new T.MeshStandardMaterial({ map: surfaceTex(), roughness: 0.65, metalness: 0.02 }));
    earth.material.map.colorSpace = T.SRGBColorSpace; scene.add(earth);
    const clouds = new T.Mesh(new T.SphereGeometry(R * 1.015, 72, 48, PH0, PHL), new T.MeshStandardMaterial({ map: cloudTex(), transparent: true, depthWrite: false, roughness: 1 }));
    scene.add(clouds);
    const air = new T.Mesh(new T.SphereGeometry(R * 1.06, 48, 32, PH0, PHL), new T.MeshBasicMaterial({ color: 0x6fb4ff, transparent: true, opacity: 0.12, side: T.BackSide, depthWrite: false }));
    scene.add(air);
    // 잘린 면 그림(512 원판): 층·대류 무늬·액체 출렁임 — 매번 다시 그려 움직인다
    const cc = document.createElement('canvas'); cc.width = cc.height = 512; const cg = cc.getContext('2d');
    const cutTex = new T.CanvasTexture(cc); cutTex.colorSpace = T.SRGBColorSpace;
    const px = (r) => r / R * 256;
    function ring(r1, r0, stops) { const gr = cg.createRadialGradient(256, 256, px(r0), 256, 256, px(r1)); stops.forEach(([o, c]) => gr.addColorStop(o, c)); cg.fillStyle = gr; cg.beginPath(); cg.arc(256, 256, px(r1), 0, Math.PI * 2); cg.arc(256, 256, Math.max(0.01, px(r0)), 0, Math.PI * 2, true); cg.fill(); }
    function drawCut() {
      cg.clearRect(0, 0, 512, 512);
      const glow = (k) => (hot === k && flash > 0 ? 0.35 + 0.35 * Math.sin(flash * 10) ** 2 : 0);
      ring(R, RM, [[0, '#7a5c3c'], [1, '#a8875c']]);
      // 대륙 쪽(위·오른쪽) 지각을 더 두껍게: 두꺼운 띠를 덧칠
      cg.fillStyle = '#8e6c45'; cg.beginPath(); cg.arc(256, 256, px(R), -1.9, -0.5); cg.arc(256, 256, px(RM - 0.14), -0.5, -1.9, true); cg.fill();
      ring(RM, RO, [[0, '#a9301e'], [0.55, '#d9602e'], [1, '#e98a3a']]);
      // 맨틀 대류: 천천히 도는 둥근 화살표 무늬
      cg.save(); cg.translate(256, 256); cg.strokeStyle = 'rgba(255,220,170,.55)'; cg.lineWidth = 3;
      for (let k = 0; k < 6; k++) {
        const a = k / 6 * Math.PI * 2 + t * 0.12, rm = px((RM + RO) / 2), cx = Math.cos(a) * rm, cy = Math.sin(a) * rm, rr = px((RM - RO) / 2) * 0.62, dir = k % 2 ? 1 : -1, sp0 = t * 0.8 * dir;
        cg.beginPath(); cg.arc(cx, cy, rr, sp0, sp0 + Math.PI * 1.5); cg.stroke();
        const ea = sp0 + Math.PI * 1.5, ex = cx + Math.cos(ea) * rr, ey = cy + Math.sin(ea) * rr, ta = ea + Math.PI / 2 * (dir > 0 ? 1 : 1);
        cg.fillStyle = 'rgba(255,220,170,.7)'; cg.beginPath(); cg.moveTo(ex + Math.cos(ta) * 9, ey + Math.sin(ta) * 9); cg.lineTo(ex + Math.cos(ta + 2.4) * 7, ey + Math.sin(ta + 2.4) * 7); cg.lineTo(ex + Math.cos(ta - 2.4) * 7, ey + Math.sin(ta - 2.4) * 7); cg.fill();
      }
      cg.restore();
      ring(RO, RI, [[0, '#ffcf5a'], [1, '#f08a2a']]);
      // 외핵: 출렁이는 액체 물결
      cg.strokeStyle = 'rgba(255,245,200,.45)'; cg.lineWidth = 2;
      for (let k = 0; k < 4; k++) { const rr = px(RI + (RO - RI) * (0.25 + k * 0.18)); cg.beginPath(); for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.05) { const w = rr + Math.sin(a * 7 + t * 2 + k) * 3; cg[a ? 'lineTo' : 'moveTo'](256 + Math.cos(a) * w, 256 + Math.sin(a) * w); } cg.stroke(); }
      ring(RI, 0, [[0, '#fffbe0'], [0.6, '#ffe36a'], [1, '#ffd84d']]);
      // 누른 층 빛내기 + 경계선
      ['crust', 'mantle', 'outer', 'inner'].forEach((k) => {
        const a = glow(k); if (!a) return; const r1 = { crust: R, mantle: RM, outer: RO, inner: RI }[k], r0 = { crust: RM, mantle: RO, outer: RI, inner: 0 }[k];
        cg.fillStyle = `rgba(255,255,255,${a})`; cg.beginPath(); cg.arc(256, 256, px(r1), 0, Math.PI * 2); cg.arc(256, 256, Math.max(0.01, px(r0)), 0, Math.PI * 2, true); cg.fill();
      });
      cg.strokeStyle = 'rgba(20,10,5,.55)'; cg.lineWidth = 2; [RM, RO, RI].forEach((r) => { cg.beginPath(); cg.arc(256, 256, px(r), 0, Math.PI * 2); cg.stroke(); });
      cutTex.needsUpdate = true;
    }
    const faceMat = new T.MeshStandardMaterial({ map: cutTex, side: T.DoubleSide, roughness: 0.8, emissive: 0x3a1a08, emissiveIntensity: 0.25 });
    const faceA = new T.Mesh(new T.CircleGeometry(R, 96, -Math.PI / 2, Math.PI), faceMat); scene.add(faceA); // z=0 면, x≥0
    const faceB = new T.Mesh(new T.CircleGeometry(R, 96, -Math.PI / 2, Math.PI), faceMat); faceB.rotation.y = -Math.PI / 2; scene.add(faceB); // x=0 면, z≥0
    drawCut();
    // 이름표(z=0 면 위)
    [['crust', (R + RM) / 2 + 0.25, 1.15], ['mantle', 3.0, -1.3], ['outer', 1.5, -0.7], ['inner', 0.2, 0.15]].forEach(([k, x, y]) => {
      const el = document.createElement('span'); el.className = 'g3-label e3-lab'; el.textContent = L[k].n; stage.appendChild(el);
      s.label(el, () => new T.Vector3(x, y, 0.05));
    });
    // 탐침: z=0 면 위, +x 반지름을 따라 겉에서 중심으로
    const pm = new T.MeshPhysicalMaterial({ color: 0xc9d2de, metalness: 0.7, roughness: 0.3 });
    const rod = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, 1, 12), pm); rod.rotation.z = Math.PI / 2; scene.add(rod);
    const tip = new T.Mesh(new T.ConeGeometry(0.11, 0.3, 14), pm); tip.rotation.z = Math.PI / 2; scene.add(tip);
    const knob = new T.Mesh(new T.SphereGeometry(0.28, 20, 14), new T.MeshPhysicalMaterial({ color: 0xffd84d, emissive: 0xffd84d, emissiveIntensity: 0.4, clearcoat: 0.8, roughness: 0.25 }));
    scene.add(knob);
    const Z = 0.12, LEN = R + 1.1; // 길이가 정해진 막대 — 끝이 들어간 만큼 손잡이도 따라 들어온다
    rod.scale.y = LEN;
    function placeProbe() {
      const x = R - depthNow * R; // 끝이 닿은 반지름
      tip.position.set(x - 0.1, 0, Z); rod.position.set(x + LEN / 2, 0, Z); knob.position.set(x + LEN + 0.15, 0, Z);
      gaugeShow(x);
    }
    function gaugeShow(x) {
      const k = depthKm(Math.max(0, x)), lay = layerAt(Math.max(0.001, x)), tc = tempC(k);
      if (lay !== lastLayer) { lastLayer = lay; bump = 1; }
      const st = L[lay].s.split(' — ')[0];
      const html = `<span class="e3-g-lay" style="--c:${L[lay].c};transform:scale(${(1 + bump * 0.5).toFixed(2)});text-shadow:0 0 ${Math.round(bump * 14)}px ${L[lay].c}">${L[lay].n}</span><b>${Math.round(k).toLocaleString()} km</b><span>약 ${Math.round(tc / 10) * 10}°C</span><span class="e3-g-st ${st === '액체' ? 'liq' : ''}">${st}</span>`;
      if (gauge.innerHTML !== html) gauge.innerHTML = html;
    }
    function steps() {
      const ok = []; if (tapped.size >= 3) ok.push(1); if (deep) ok.push(2); if (liquid) ok.push(3);
      const st = [1, 2, 3].find((q) => !ok.includes(q)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? `① 잘린 면의 층을 눌러 보자 (${tapped.size}/3)` : st === 2 ? '② 노란 손잡이를 끌어 탐침을 중심까지' : st === 3 ? '③ 탐침을 외핵 구간에서 멈춰 보자' : '겉에서 속으로: 지각 → 맨틀 → 외핵 → 내핵';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    function tap(k) {
      tapped.add(k); hot = k; flash = 1.4; drawCut();
      const l = L[k]; out.innerHTML = `<b>${l.n}</b> · 깊이 ${l.d} · ${l.m} · <b>${l.s}</b>`; steps(); s.render();
    }
    function setDepth(v, done) {
      depthT = Math.max(0, Math.min(1, v));
      if (depthT >= 0.985) deep = true;
      if (done) { const lay = layerAt(R - depthT * R); if (lay === 'outer') { liquid = true; out.innerHTML = '<b>외핵</b> — 지구 속에서 유일하게 <b>액체</b>인 층. 철·니켈이 녹아 흐르며 지구 자기장을 만드는 것으로 본다'; } }
      steps();
    }
    s.grab((e) => !!s.pick(e, [knob, rod]), () => {
      const a = s.toClient(new T.Vector3(R, 0, Z)), b = s.toClient(new T.Vector3(0, 0, Z));
      const dx = b.x - a.x, dy = b.y - a.y, L2 = dx * dx + dy * dy || 1;
      return {
        move(ev) { setDepth(((ev.clientX - a.x) * dx + (ev.clientY - a.y) * dy) / L2); },
        up() { setDepth(depthT, true); },
      };
    });
    root.querySelector('.e3-home').addEventListener('click', () => s.look(V0));
    out.innerHTML = '잘린 면을 누르면 그 층의 풀이가 나온다. 노란 손잡이를 중심 쪽으로 끌면 탐침이 들어간다';
    steps(); placeProbe();
    root._e3 = {
      tap(k) { tap(k); },
      probe(v) { setDepth(v, true); depthNow = depthT; placeProbe(); s.render(); return { km: Math.round(depthKm(R - depthT * R)), layer: layerAt(Math.max(0.001, R - depthT * R)) }; },
    };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.Earth3D = { mount };
})();
