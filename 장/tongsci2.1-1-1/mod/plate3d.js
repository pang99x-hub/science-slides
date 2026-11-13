/* 3차시 2장 «판과 판이 만나는 곳»: 땅 덩어리 단면(3D). 지층 다섯 겹(둘째 층 = 바다에서 쌓인 화석 층)과 판, 그 아래 맨틀.
   «모이는 곳»: 시간 막대를 밀면 지층이 휘고(습곡) 두꺼워지며 솟아 산맥이 되고, 진원에서 지진이 나고, 옆에 화산이 생긴다. 화석 층이 산꼭대기로 올라간다.
   «갈라지는 곳»: 가운데가 내려앉아 열곡이 생기고, 마그마가 올라 화산이 생기고, 바닷물이 들어 새 바다와 해령이 생긴다.
   끌기 = 돌리기, 바퀴·두 손가락 = 확대, 두 손가락·오른쪽 단추 끌기 = 옮기기, «처음 시점». 이름표(대상에 붙어 다님)를 누르면 강조 + 풀이.
   크기·빠르기·두께는 이해를 돕기 위한 예(실제로는 수백만 년 이상). 시험용: root._pb.mode('con'|'div') · t(0~1) · part(k) · view(yaw, pitch, dist) */
(function () {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sm = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const L = 6, D = 2.6, NX = 161;
  const BASE = [-2.6, -1.9, -1.35, -0.85, -0.4, 0.0];
  const COL = ['#8c7a66', '#b9926a', '#c9a77c', '#8fa9b4', '#d8c49a'];
  const PART = {
    plate: ['판', '지구 겉을 나눈 단단한 조각. 대륙도 판에 실려 아주 천천히(1년에 몇 cm쯤, 이해를 돕기 위한 예) 움직인다.'],
    mantle: ['맨틀', '판 아래의 뜨거운 층. 아주 느리게 흐르며 판을 실어 나른다.'],
    fold: ['습곡', '양옆에서 눌린 지층이 물결처럼 휜 것.'],
    mtn: ['산맥', '판이 부딪쳐 두꺼워진 땅이 솟은 것. 예: 히말라야산맥.'],
    quake: ['진원(지진)', '쌓인 힘이 한꺼번에 풀리며 땅의 흔들림이 시작된 곳.'],
    volc: ['화산', '땅속 마그마가 땅 위로 올라온 곳.'],
    fos: ['바다에서 쌓인 지층', '바다 생물 화석이 든 층. 솟아오르면 산에서 바다 생물 화석이 나온다.'],
    rift: ['열곡', '땅이 벌어지며 가운데가 내려앉은 긴 골짜기. 예: 동아프리카.'],
    magma: ['마그마', '얇아진 땅 틈으로 올라오는 녹은 암석.'],
    sea: ['새 바다', '벌어진 틈에 바닷물이 차서 생긴 바다. 예: 대서양.'],
    ridge: ['해령', '새 바다 한가운데 바다 밑 산줄기. 마그마가 굳어 새 바닥이 계속 생긴다.'],
  };
  const SAY = {
    con: [[0.15, '두 판이 서로를 향해 다가간다.'], [0.45, '부딪친 자리의 지층이 옆에서 눌려 물결처럼 <b>휜다</b>(습곡). 땅이 두꺼워진다.'],
      [0.75, '휜 지층이 위로 솟아 <b>산맥</b>이 된다. 쌓인 힘이 풀리며 <b>지진</b>이 잦고, 곁에 <b>화산</b>도 생긴다.'], [2, '높은 산맥이 되었다. 바다에서 쌓인 지층과 <b>화석</b>이 산꼭대기까지 올라왔다(히말라야).']],
    div: [[0.15, '두 판이 서로 멀어진다.'], [0.45, '땅이 늘어나며 가운데가 내려앉아 긴 골짜기(<b>열곡</b>)가 생긴다.'],
      [0.75, '얇아진 틈으로 <b>마그마</b>가 올라와 <b>화산</b>이 생긴다.'], [2, '골짜기에 바닷물이 들어 <b>새 바다</b>가 열렸다. 한가운데 <b>해령</b>에서 새 바닥이 생긴다(대서양).']],
  };

  function mount(root) {
    const stage = root.querySelector('.pb-stage'), canvas = stage.querySelector('canvas');
    const buzz = (pat) => { try { if (navigator.vibrate) navigator.vibrate(pat); } catch { /* 막힌 곳 */ } };
    const range = root.querySelector('.pb-range'), modes = [...root.querySelectorAll('.pb-mode button')];
    const say = root.querySelector('.pb-say'), tag = root.querySelector('.pb-tag'), pn = root.querySelector('.pb-pn'), pd = root.querySelector('.pb-pd'), pcard = root.querySelector('.pb-part');
    const labBox = stage.querySelector('.pb-labs');
    let mode = 'con', t = 0, sel = null;
    function texts() {
      modes.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.m === mode)));
      tag.textContent = mode === 'con' ? '판이 모이는 곳' : '판이 갈라지는 곳';
      say.innerHTML = SAY[mode].find(([a]) => t < a)[1];
      if (sel) { pn.textContent = PART[sel][0]; pd.textContent = PART[sel][1]; pcard.classList.add('on'); }
      else { pn.textContent = '이름표를 눌러 보자'; pd.textContent = '그림에 붙은 이름표를 누르면 그 부분이 빛나고 풀이가 나온다.'; pcard.classList.remove('on'); }
    }
    const s = window.Scene3D.make(stage, canvas, { view: { yaw: 0.62, pitch: 0.38, dist: 19, target: [0, -1.0, 0] }, fov: 32, min: 8, max: 30, pmin: -0.1, pmax: 1.3, panLimit: 5 });
    if (!s.ok) {
      const set = (v) => { t = v; texts(); };
      range.addEventListener('input', () => set(+range.value / 100));
      modes.forEach((b) => b.addEventListener('click', () => { mode = b.dataset.m; set(0); range.value = 0; }));
      texts(); root._pb = { mode: (m) => { mode = m; texts(); }, t: set, part() {}, view() {} };
      return { setActive() {}, fit() {} };
    }
    const { T, scene } = s;
    s.renderer.setClearColor(new T.Color('#dbe9f1'), 1);
    s.renderer.outputColorSpace = T.SRGBColorSpace;
    scene.add(new T.HemisphereLight(0xffffff, 0x7a6a58, 1.5));
    const sun = new T.DirectionalLight(0xffffff, 2.0); sun.position.set(6, 10, 8); scene.add(sun);
    const back = new T.DirectionalLight(0xc8d8ff, 0.6); back.position.set(-6, 4, -6); scene.add(back);
    // 지층 무늬(가로 결 + 점)
    function strataTex(hex, seed) {
      const c = document.createElement('canvas'); c.width = 256; c.height = 64; const g = c.getContext('2d');
      let q = seed; const r = () => ((q = (q * 16807) % 2147483647) / 2147483647);
      g.fillStyle = hex; g.fillRect(0, 0, 256, 64);
      for (let i = 0; i < 8; i++) { g.fillStyle = `rgba(0,0,0,${0.03 + r() * 0.05})`; g.fillRect(0, r() * 64, 256, 1 + r() * 3); }
      for (let i = 0; i < 400; i++) { g.fillStyle = `rgba(${r() > 0.5 ? '255,255,255' : '40,30,20'},${0.15 + r() * 0.2})`; g.fillRect(r() * 256, r() * 64, 1.5, 1.5); }
      if (seed === 4) for (let i = 0; i < 14; i++) { const x = r() * 250, y = 10 + r() * 44; g.strokeStyle = 'rgba(40,40,40,.7)'; g.lineWidth = 1.6; g.beginPath(); g.arc(x, y, 5, Math.PI, 0); g.lineTo(x - 5, y); g.stroke(); }
      const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace; return t;
    }
    // 층 하나 = 앞·뒤·양 끝 면(위아래 경계를 따라 다시 그린다)
    const xs = Array.from({ length: NX }, (_, i) => -L + 2 * L * i / (NX - 1));
    function slabGeo() {
      const g = new T.BufferGeometry(), n = NX * 2 * 2 + 8;
      g.setAttribute('position', new T.Float32BufferAttribute(new Float32Array(n * 3), 3));
      g.setAttribute('uv', new T.Float32BufferAttribute(new Float32Array(n * 2), 2));
      const idx = [];
      for (const side of [0, 1]) { const o = side * NX * 2; for (let i = 0; i < NX - 1; i++) { const a = o + i * 2, b = a + 2; if (side === 0) idx.push(a, b, a + 1, b, b + 1, a + 1); else idx.push(a, a + 1, b, b, a + 1, b + 1); } }
      const e = NX * 4; idx.push(e, e + 1, e + 2, e + 1, e + 3, e + 2, e + 4, e + 6, e + 5, e + 5, e + 6, e + 7);
      g.setIndex(idx); return g;
    }
    function fillSlab(g, bot, top) {
      const p = g.attributes.position, uv = g.attributes.uv;
      [D, -D].forEach((z, side) => xs.forEach((x, i) => { const k = side * NX * 2 + i * 2; p.setXYZ(k, x, bot[i], z); p.setXYZ(k + 1, x, top[i], z); uv.setXY(k, x / 3, bot[i] / 1.2); uv.setXY(k + 1, x / 3, top[i] / 1.2); }));
      const e = NX * 4, last = NX - 1;
      p.setXYZ(e, -L, bot[0], -D); p.setXYZ(e + 1, -L, bot[0], D); p.setXYZ(e + 2, -L, top[0], -D); p.setXYZ(e + 3, -L, top[0], D);
      p.setXYZ(e + 4, L, bot[last], -D); p.setXYZ(e + 5, L, bot[last], D); p.setXYZ(e + 6, L, top[last], -D); p.setXYZ(e + 7, L, top[last], D);
      for (let k = 0; k < 8; k++) uv.setXY(e + k, (k & 1) * 1.7, (k & 2 ? 1 : 0) * 0.6);
      p.needsUpdate = true; uv.needsUpdate = true; g.computeVertexNormals(); g.computeBoundingSphere();
    }
    const slabs = COL.map((c, i) => {
      const g = slabGeo(), m = new T.Mesh(g, new T.MeshStandardMaterial({ map: strataTex(c, i + 1), roughness: 0.95, side: T.DoubleSide }));
      m.userData.part = i === 3 ? 'fos' : 'plate'; scene.add(m); return m;
    });
    // 맨틀(아래 상자)
    const mantleM = new T.MeshStandardMaterial({ color: 0xd8642e, roughness: 0.7, emissive: 0x6a1a00, emissiveIntensity: 0.25 });
    const mantle = new T.Mesh(slabGeo(), mantleM); mantle.userData.part = 'mantle'; mantleM.side = T.DoubleSide; scene.add(mantle);
    const FLOOR = xs.map(() => -4.4);
    // 위 지표(꼭짓점 색: 낮은 땅 초록 → 바위 → 눈)
    const NZ = 30, topG = new T.PlaneGeometry(2 * L, 2 * D, NX - 1, NZ - 1); topG.rotateX(-Math.PI / 2);
    topG.setAttribute('color', new T.Float32BufferAttribute(new Float32Array(topG.attributes.position.count * 3), 3));
    const topM = new T.MeshStandardMaterial({ vertexColors: true, roughness: 0.9 });
    const top = new T.Mesh(topG, topM); top.userData.part = 'mtn'; scene.add(top);
    const nz = (x, z) => 0.5 * Math.sin(x * 4.1 + z * 2.3) * Math.sin(z * 3.7 - x * 1.3) + 0.3 * Math.sin(x * 9.1 - z * 6.2);
    // 바닷물·마그마·화산·진원·화살표
    const water = new T.Mesh(new T.BoxGeometry(1, 1, 2 * D - 0.06), new T.MeshStandardMaterial({ color: 0x2f7fc4, transparent: true, opacity: 0.62, roughness: 0.2 }));
    water.userData.part = 'sea'; scene.add(water);
    const magmaM = new T.MeshStandardMaterial({ color: 0xff6a1f, emissive: 0xff4a00, emissiveIntensity: 0.8, roughness: 0.5 });
    const dike = new T.Mesh(new T.BoxGeometry(1, 1, 2 * D - 0.08), magmaM); dike.userData.part = 'magma'; scene.add(dike);
    const ridgeM = new T.MeshStandardMaterial({ color: 0x3b3a3f, roughness: 0.8 });
    const rsh = new T.Shape(); rsh.moveTo(-0.8, 0); rsh.lineTo(-0.15, 0.95); rsh.lineTo(0, 1); rsh.lineTo(0.15, 0.95); rsh.lineTo(0.8, 0); rsh.lineTo(-0.8, 0);
    const rg = new T.ExtrudeGeometry(rsh, { depth: 2 * D - 0.12, bevelEnabled: false }); rg.translate(0, 0, -(D - 0.06));
    const ridge = new T.Mesh(rg, ridgeM); ridge.userData.part = 'ridge'; scene.add(ridge); // 앞뒤로 길게 이어진 바다 밑 산줄기
    const coneG = new T.ConeGeometry(0.75, 1.2, 28, 1, true);
    const volcM = new T.MeshStandardMaterial({ color: 0x6b5a4e, roughness: 0.9, side: T.DoubleSide });
    const volcs = [0, 1, 2].map(() => { const v = new T.Mesh(coneG, volcM); v.userData.part = 'volc'; const lava = new T.Mesh(new T.SphereGeometry(0.22, 16, 10), magmaM); lava.position.y = 0.55; lava.userData.part = 'volc'; v.add(lava); scene.add(v); return v; });
    const quake = new T.Group(); scene.add(quake);
    const qcore = new T.Mesh(new T.SphereGeometry(0.16, 16, 12), new T.MeshStandardMaterial({ color: 0xffd23a, emissive: 0xffaa00, emissiveIntensity: 0.9 })); qcore.userData.part = 'quake'; quake.add(qcore);
    const rings = [0, 1, 2].map(() => { const r = new T.Mesh(new T.TorusGeometry(1, 0.03, 8, 48), new T.MeshBasicMaterial({ color: 0xffb21a, transparent: true })); quake.add(r); return r; });
    const arrowM = new T.MeshStandardMaterial({ color: 0xd9483b, roughness: 0.5 });
    const arrows = [-1, 1].map(() => { const g = new T.Group(); const sh = new T.Mesh(new T.CylinderGeometry(0.13, 0.13, 1.4, 16), arrowM); sh.rotation.z = Math.PI / 2; g.add(sh); const hd = new T.Mesh(new T.ConeGeometry(0.32, 0.6, 20), arrowM); hd.rotation.z = -Math.PI / 2; hd.position.x = 0.95; g.add(hd); g.userData.part = 'plate'; sh.userData.part = 'plate'; hd.userData.part = 'plate'; scene.add(g); return g; });
    // 맨틀 흐름 화살(앞면에 그린 고리)
    const flowM = new T.MeshBasicMaterial({ color: 0xfff1d6 });
    const flows = [-1, 1].map((sx) => {
      const pts = []; for (let a = 0; a <= 300; a += 10) { const r = a * Math.PI / 180; pts.push(new T.Vector3(sx * (2.6 + 1.9 * Math.cos(r)), -3.7 + 0.55 * Math.sin(r), D + 0.03)); }
      const tube = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 60, 0.05, 8), flowM); const head = new T.Mesh(new T.ConeGeometry(0.14, 0.34, 12), flowM); tube.add(head); scene.add(tube); tube.userData = { sx, pts, head }; return tube;
    });
    const fold = new T.Vector3(), boundary = { top: [], bot: [] };
    let B = [];
    function shape() {
      const con = mode === 'con';
      const g = (x, w) => Math.exp(-((x / w) ** 2));
      B = BASE.map((b0, k) => xs.map((x) => {
        if (con) {
          const G = g(x, 2.0), U = t * 2.7 * G, R = t * 1.5 * G, f = k > 0 && k < 5 ? t * 0.38 * Math.sin(x * 3.1) * G : 0;
          return b0 + (k / 5) * U - (1 - k / 5) * R + f;
        }
        const G = g(x, 1.55), S = t * 1.9 * G, thin = t * 2.0 * G;
        return b0 + (1 - k / 5) * thin - (k / 5) * S;
      }));
      // 갈라지는 곳: 너무 얇아진 가운데는 지층이 끊긴다(위아래가 만나면 두께 0)
      if (!con) for (let i = 0; i < NX; i++) for (let k = 1; k < 6; k++) B[k][i] = Math.max(B[k][i], B[k - 1][i] + 0.0005);
      slabs.forEach((m, i) => fillSlab(m.geometry, B[i], B[i + 1]));
      // 지표
      const p = topG.attributes.position, c = topG.attributes.color, C = new T.Color(), green = new T.Color('#7fa65a'), rock = new T.Color('#8d7560'), snow = new T.Color('#f5f8fb'), sand = new T.Color('#d8c49a');
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i), z = p.getZ(i), xi = clamp(Math.round((x + L) / (2 * L) * (NX - 1)), 0, NX - 1);
        let y = B[5][xi];
        if (con) y += t * Math.exp(-((x / 2.0) ** 2)) * 0.45 * nz(x, z);
        p.setY(i, y + 0.002);
        const h = y;
        C.copy(green);
        if (con) { C.lerp(rock, sm(0.5, 1.4, h)); C.lerp(snow, sm(1.9, 2.5, h)); }
        else { C.lerp(sand, sm(-0.2, -0.9, h)); if (h < -1.2) C.copy(new T.Color('#4a4646')); }
        c.setXYZ(i, C.r, C.g, C.b);
      }
      p.needsUpdate = true; c.needsUpdate = true; topG.computeVertexNormals();
      fillSlab(mantle.geometry, FLOOR, B[0]);
      // 바닷물·마그마·해령
      const sea = -0.55; let xw = 0; for (let i = 0; i < NX; i++) if (B[5][i] < sea) xw = Math.max(xw, Math.abs(xs[i]));
      water.visible = !con && xw > 0.05; if (water.visible) { const yb = Math.min(...B[5]); water.scale.set(2 * xw, sea - yb, 1); water.position.set(0, (sea + yb) / 2, 0); }
      const mid = Math.floor(NX / 2);
      dike.visible = !con && t > 0.3; if (dike.visible) { const y0 = B[0][mid] - 0.2, y1 = B[5][mid] - 0.05; dike.scale.set(0.18 + 0.35 * t, Math.max(0.05, y1 - y0), 1); dike.position.set(0, (y0 + y1) / 2, 0); }
      ridge.visible = !con && t > 0.72; if (ridge.visible) { ridge.position.set(0, B[5][mid] - 0.05, 0); ridge.scale.set(1, 0.5 * sm(0.72, 1, t) + 0.01, 1); }
      // 화산
      const vOn = con ? [t > 0.55, false, false] : [t > 0.4 && t < 0.92, t > 0.4 && t < 0.92, false];
      const vx = con ? [-3.0, 0, 0] : [-1.75, 1.75, 0];
      volcs.forEach((v, i) => { v.visible = vOn[i]; if (!v.visible) return; const xi = clamp(Math.round((vx[i] + L) / (2 * L) * (NX - 1)), 0, NX - 1); const k = con ? sm(0.55, 0.9, t) : sm(0.4, 0.6, t) * (1 - sm(0.8, 0.92, t)); v.scale.setScalar(0.4 + 0.8 * k); v.position.set(vx[i], B[5][xi] + 0.5 * (0.4 + 0.8 * k), con ? 0.6 : -0.4); });
      quake.visible = con && t > 0.42; quake.position.set(0.9, B[2][mid] - 0.2, D - 0.35);

      // 화살표(판이 움직이는 방향)
      arrows.forEach((a, i) => { const sx = i ? 1 : -1; const xi = clamp(Math.round((sx * 4.3 + L) / (2 * L) * (NX - 1)), 0, NX - 1); a.position.set(sx * 4.3, B[5][xi] + 0.55, 1.2); a.rotation.y = (con ? (sx > 0 ? Math.PI : 0) : (sx > 0 ? 0 : Math.PI)); });
      // 맨틀 흐름 고리: 모일 때는 가운데로 내려가고, 갈라질 때는 가운데에서 올라온다
      flows.forEach((f) => { const { sx, pts, head } = f.userData; const dir = (con ? 1 : -1) * sx; const i0 = dir > 0 ? pts.length - 1 : 0, i1 = dir > 0 ? pts.length - 2 : 1; head.position.copy(pts[i0]); const d = pts[i0].clone().sub(pts[i1]).normalize(); head.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), d); });
      boundary.top = B[5];
    }
    // 이름표
    const yAt = (k, x) => B[k][clamp(Math.round((x + L) / (2 * L) * (NX - 1)), 0, NX - 1)];
    const LAB = {
      plate: () => [mode === 'con' ? -4.6 : -4.6, yAt(5, -4.6) - 1.2, D + 0.05],
      mantle: () => [-4.2, -3.6, D + 0.05],
      fold: () => [-1.3, (yAt(2, -1.3) + yAt(3, -1.3)) / 2, D + 0.05],
      mtn: () => [0.2, yAt(5, 0.2) + 0.9, 0],
      quake: () => [0.9, yAt(2, 0) - 0.2, D - 0.35],
      volc: () => (mode === 'con' ? [-3.0, yAt(5, -3) + 1.6, 0.6] : [1.75, yAt(5, 1.75) + 1.5, -0.4]),
      fos: () => [mode === 'con' ? 1.6 : 3.4, (yAt(3, mode === 'con' ? 1.6 : 3.4) + yAt(4, mode === 'con' ? 1.6 : 3.4)) / 2, D + 0.05],
      rift: () => [0.95, yAt(5, 0.95) + 0.5, 0.8],
      magma: () => [0, (yAt(0, 0) + yAt(5, 0)) / 2 - 0.4, D + 0.05],
      sea: () => [-0.9, -0.5, -0.6],
      ridge: () => [0, yAt(5, 0) + 0.25, -1.4],
    };
    const show = (k) => {
      const con = mode === 'con';
      return { plate: true, mantle: true, fos: true, fold: con && t > 0.2, mtn: con && t > 0.45, quake: con && t > 0.42, volc: con ? t > 0.55 : t > 0.4 && t < 0.92, rift: !con && t > 0.2 && t < 0.8, magma: !con && t > 0.3, sea: !con && water.visible, ridge: !con && t > 0.72 }[k];
    };
    const labs = Object.keys(PART).map((k) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'g3-label pb-lab'; b.dataset.p = k; b.textContent = PART[k][0];
      b.addEventListener('click', () => choose(k)); labBox.appendChild(b);
      s.label(b, () => new T.Vector3(...LAB[k]()));
      return b;
    });
    const glowMats = { plate: slabs.filter((m) => m.userData.part === 'plate').map((m) => m.material), fos: [slabs[3].material], mantle: [mantleM], mtn: [topM], volc: [volcM], magma: [magmaM], ridge: [ridgeM], sea: [water.material], quake: [qcore.material], fold: [slabs[1].material, slabs[2].material], rift: [topM] };
    function glow() {
      Object.values(glowMats).flat().forEach((m) => { if (m === magmaM || m === mantleM || m === qcore.material) return; m.emissive && m.emissive.set(0x000000); });
      (glowMats[sel] || []).forEach((m) => { if (m.emissive && m !== magmaM && m !== mantleM && m !== qcore.material) { m.emissive.set(0xffb21a); m.emissiveIntensity = 0.35; } });
      mantleM.emissive.set(sel === 'mantle' ? 0xffb21a : 0x6a1a00); mantleM.emissiveIntensity = sel === 'mantle' ? 0.5 : 0.25;
    }
    function choose(k) { sel = sel === k ? null : k; labs.forEach((b) => b.classList.toggle('on', b.dataset.p === sel)); glow(); texts(); if (!s.active) s.render(); }
    function vis() { labs.forEach((b) => { b.hidden = !show(b.dataset.p); }); if (sel && !show(sel)) choose(sel); }
    let tt = 0;
    // 사건 흔들림: 시간 막대를 앞으로 밀다가 사건이 일어나는 순간 화면이 흔들리고 휴대폰이 떨린다(세기 1~3)
    const EV = { con: [[0.2, 1], [0.42, 3], [0.55, 2]], div: [[0.2, 3], [0.3, 1], [0.4, 2], [0.72, 2]] };
    function jolt(k) { stage.classList.remove('pb-j1', 'pb-j2', 'pb-j3'); void stage.offsetWidth; stage.classList.add('pb-j' + k); buzz(k === 3 ? [140, 50, 220] : k === 2 ? [90, 40, 90] : [40]); }
    let lastRumble = 0;
    function setT(v) {
      const was = t; t = clamp(v, 0, 1);
      if (t > was) { const hit = EV[mode].filter(([x]) => was < x && t >= x).map(([, k]) => k); if (hit.length) jolt(Math.max(...hit)); else if (performance.now() - lastRumble > 160) { lastRumble = performance.now(); stage.classList.add('pb-rumble'); clearTimeout(setT.r); setT.r = setTimeout(() => stage.classList.remove('pb-rumble'), 180); } }
      range.value = String(Math.round(t * 100)); shape(); vis(); texts(); if (!s.active) s.render();
    }
    function setMode(m) { mode = m; sel = null; labs.forEach((b) => b.classList.remove('on')); glow(); setT(0); }
    range.addEventListener('input', () => setT(+range.value / 100));
    range.addEventListener('keydown', (e) => e.stopPropagation());
    modes.forEach((b) => b.addEventListener('click', () => setMode(b.dataset.m)));
    root.querySelector('.pb-home').addEventListener('click', () => s.home());
    // 지진 고리 퍼지기
    const s2 = s; const onFrame = (dt) => { tt += dt; rings.forEach((r, i) => { const u = ((tt * 0.6 + i / 3) % 1); r.scale.setScalar(0.2 + u * 1.6); r.material.opacity = 0.9 * (1 - u); r.lookAt(s2.camera.position); }); };
    setMode('con');
    root._pb = { mode: setMode, t: setT, part: (k) => { sel = null; choose(k); }, view: (yaw, pitch, dist) => s.look({ yaw, pitch, dist }, 0.01) };
    let raf = 0; const loop = (now) => { raf = requestAnimationFrame(loop); onFrame(1 / 60); };
    return {
      setActive(on) { s.setActive(on); if (on && !raf) raf = requestAnimationFrame(loop); if (!on && raf) { cancelAnimationFrame(raf); raf = 0; } },
      fit() { s.fit(); },
    };
  }
  window.Plate3D = { mount };
})();
