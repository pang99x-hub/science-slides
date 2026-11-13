/* 2차시 5장 «대표 화석 돌려 보기»(교과서 16~17쪽 그림 I-3·I-5·I-7·I-9): 시대마다 대표 화석 표본을 3D로 돌리고 키워 본다.
   스트로마톨라이트(선캄브리아시대) · 삼엽충(고생대) · 암모나이트(중생대) · 화폐석(신생대).
   끌기 = 돌리기, 바퀴·두 손가락 = 확대·축소, 두 손가락·오른쪽 단추 끌기 = 옮기기, «처음 시점» 단추. 이름표나 표본의 부분을 누르면 그 부분이 빛나고 풀이가 바뀐다.
   암모나이트·화폐석은 «반으로 잘라 보기»로 속의 방을, 스트로마톨라이트는 «살아 있을 때»로 맨 위 남세균 막을 본다.
   모양·크기 비율은 특징을 살려 만든 모형(이해를 돕기 위한 예). 시험용: root._sp.pick(k) · part(p) · cut(on) · view(yaw, pitch, dist) */
(function () {
  'use strict';
  const SPEC = {
    strom: { n: '스트로마톨라이트', era: '선캄브리아시대', home: '햇빛이 드는 얕고 따뜻한 바다',
      d: '생물의 몸이 아니라 <b>남세균</b> 무리가 만든 <b>층 구조</b>다. 가장 오래된 생명의 흔적 가운데 하나다.', tog: '살아 있을 때', view: { yaw: 0.55, pitch: 0.42, dist: 9.5 },
      parts: { layers: ['얇은 층', '남세균 막에 모래·진흙 알갱이가 달라붙고, 그 위에 새 막이 자라기를 되풀이해 층이 겹겹이 쌓였다.', [-1.1, 0.1, 1.15]],
        dome: ['둥근 머리', '층이 위로 볼록하게 쌓여 기둥이나 버섯 모양이 된다. 위에서 보면 둥근 머리가 여럿 모여 있다.', [0.7, 1.75, 0.2]],
        mat: ['남세균 막', '맨 위에 사는 남세균이 광합성을 하며 <b>산소</b>를 내놓았다. 지금도 오스트레일리아 바닷가에서 자란다.', [-0.9, 1.95, -0.4]] } },
    trilo: { n: '삼엽충', era: '고생대', home: '얕은 바다의 바닥을 기어 다녔다',
      d: '몸이 세로로 <b>세 갈래</b>(가운데·양옆)로 나뉘어 붙은 이름이다. 단단한 껍데기라 화석이 잘 남았고, 고생대에만 살아 <b>고생대 표준 화석</b>이다.', view: { yaw: 0.35, pitch: 0.75, dist: 9 },
      parts: { head: ['머리', '반달 모양 머리 방패. 양 끝에 뒤로 뻗은 가시가 있다.', [-1.05, 0.95, -1.75]],
        eye: ['눈', '작은 알갱이 렌즈가 모인 겹눈. 화석으로 남은 가장 오래된 눈 가운데 하나다.', [0.62, 1.25, -1.35]],
        axis: ['가운데 엽', '몸 한가운데 볼록 솟은 줄. 이 줄과 양옆 두 줄을 합쳐 «세 엽»이다.', [0, 1.15, 0.2]],
        pleura: ['양옆 엽', '가슴 마디마다 양옆으로 뻗은 납작한 부분. 마디가 여럿이라 몸을 둥글게 말 수 있었다.', [1.15, 0.85, 0.4]],
        tail: ['꼬리', '마디들이 붙어 한 덩어리가 된 꼬리 방패.', [-0.45, 0.85, 1.75]] } },
    ammo: { n: '암모나이트', era: '중생대', home: '바닷속을 떠다니며 헤엄쳤다',
      d: '돌돌 말린 껍데기 속이 벽으로 나뉜 <b>여러 방</b>으로 되어 있다. 중생대 바다에서 번성하다 중생대 말에 사라진 <b>중생대 표준 화석</b>이다.', tog: '반으로 잘라 보기', view: { yaw: 0.25, pitch: 0.2, dist: 13, y: 2.1 },
      parts: { shell: ['껍데기 주름', '바깥을 빙 두른 굵은 주름. 얇은 껍데기를 튼튼하게 해 준다.', [1.25, 1.2, 0.55]],
        septa: ['방을 나누는 벽', '안쪽 방들은 얇은 벽으로 막혀 있다. 방 속 기체와 물의 양을 바꿔 뜨거나 가라앉았다.', [-0.55, -0.35, 0.05]],
        body: ['사는 방', '가장 바깥의 넓은 방에 몸이 들어 있었다. 입구로 다리(촉수)를 내밀었다.', [1.6, -0.6, 0.3]],
        center: ['감긴 중심', '어릴 때 만든 가장 작은 방. 자라면서 바깥쪽으로 방을 하나씩 늘려 갔다.', [0.08, 0.08, 0.35]] } },
    nummu: { n: '화폐석', era: '신생대', home: '따뜻하고 얕은 바다의 바닥',
      d: '동전처럼 납작하고 둥근 껍데기를 가진 <b>단세포 생물</b>이다. 신생대 바다에서 번성한 <b>신생대 표준 화석</b>으로, 이집트 피라미드를 쌓은 석회암에도 가득하다.', tog: '반으로 잘라 보기', view: { yaw: 0.3, pitch: 0.62, dist: 8.5 },
      parts: { disk: ['납작한 원반', '가운데가 살짝 볼록한 원반 모양. 몇 mm에서 몇 cm까지 자랐다.', [1.35, 0.32, 0.9]],
        spiral: ['나선으로 이어진 방', '잘라 보면 가운데부터 바깥으로 나선을 따라 작은 방이 수십 개 이어져 있다.', [-0.3, 0.06, -0.35]],
        line: ['겉면의 가는 줄', '안쪽 방을 나누는 벽이 겉으로 비쳐 보이는 자리다.', [-1.1, 0.25, 0.95]] } },
  };
  const ORDER = ['strom', 'trilo', 'ammo', 'nummu'];

  // 돌 질감(잡티 + 얼룩)
  function stoneTex(T, base, seed, n = 256) {
    const c = document.createElement('canvas'); c.width = c.height = n; const g = c.getContext('2d');
    let s = seed; const rnd = () => ((s = (s * 16807) % 2147483647) / 2147483647);
    g.fillStyle = base; g.fillRect(0, 0, n, n);
    for (let i = 0; i < 90; i++) { const r = 6 + rnd() * 30; g.fillStyle = `rgba(${rnd() > 0.5 ? '255,255,255' : '0,0,0'},${0.04 + rnd() * 0.06})`; g.beginPath(); g.arc(rnd() * n, rnd() * n, r, 0, 7); g.fill(); }
    for (let i = 0; i < 2600; i++) { g.fillStyle = `rgba(${rnd() > 0.5 ? '255,255,255' : '20,15,10'},${0.1 + rnd() * 0.2})`; g.fillRect(rnd() * n, rnd() * n, 1 + rnd() * 1.5, 1 + rnd() * 1.5); }
    const t = new T.CanvasTexture(c); t.wrapS = t.wrapT = T.RepeatWrapping; t.colorSpace = T.SRGBColorSpace; return t;
  }

  function mount(root) {
    const stage = root.querySelector('.sp-stage'), canvas = stage.querySelector('canvas');
    const btns = [...root.querySelectorAll('.sp-pick button')], tog = root.querySelector('.sp-tog'), homeB = root.querySelector('.sp-home');
    const info = { era: root.querySelector('.sp-era'), n: root.querySelector('.sp-name'), home: root.querySelector('.sp-where'), d: root.querySelector('.sp-d') };
    const part = { n: root.querySelector('.sp-pn'), d: root.querySelector('.sp-pd'), card: root.querySelector('.sp-part') };
    const photo = root.querySelector('.sp-photo img'), pcr = root.querySelector('.sp-photo .cr'), store = root.querySelector('.sp-store');
    const labBox = stage.querySelector('.sp-labs');
    let cur = 'trilo', cut = false, sel = null;
    const s = window.Scene3D.make(stage, canvas, { view: { yaw: 0.35, pitch: 0.75, dist: 9, target: [0, 0.3, 0] }, fov: 32, min: 3.2, max: 16, pmin: -0.3, pmax: 1.45, panLimit: 3, click: (e) => clickAt(e) });
    function texts() {
      const S = SPEC[cur];
      info.era.textContent = S.era; info.era.dataset.era = cur; info.n.textContent = S.n; info.home.textContent = S.home; info.d.innerHTML = S.d;
      btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === cur)));
      const im = store.querySelector(`img[data-k="${cur}"]`); photo.src = im.src; photo.alt = im.alt; pcr.textContent = '실제 화석 사진: ' + im.dataset.cr;
      tog.hidden = !S.tog; tog.textContent = S.tog || ''; tog.setAttribute('aria-pressed', String(cut));
      if (sel && S.parts[sel]) { part.n.textContent = S.parts[sel][0]; part.d.innerHTML = S.parts[sel][1]; part.card.classList.add('on'); }
      else { part.n.textContent = '이름표를 눌러 보자'; part.d.innerHTML = '표본의 부분이나 이름표를 누르면 그 부분이 빛나고 풀이가 나온다.'; part.card.classList.remove('on'); }
      labBox.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.p === sel));
    }
    if (!s.ok) {
      btns.forEach((b) => b.addEventListener('click', () => { cur = b.dataset.k; sel = null; texts(); }));
      texts(); root._sp = { pick(k) { cur = k; texts(); }, part() {}, cut() {}, view() {} };
      return { setActive() {}, fit() {} };
    }
    const { T, scene } = s;
    s.renderer.localClippingEnabled = true;
    s.renderer.setClearColor(new T.Color('#e9e4d8'), 1);
    s.renderer.outputColorSpace = T.SRGBColorSpace;
    scene.add(new T.HemisphereLight(0xfff8ee, 0x8a7a66, 1.6));
    const key = new T.DirectionalLight(0xffffff, 2.2); key.position.set(4, 7, 5); scene.add(key);
    const rim = new T.DirectionalLight(0xbcd2ff, 0.8); rim.position.set(-5, 3, -4); scene.add(rim);
    // 받침대
    const ped = new T.Mesh(new T.CylinderGeometry(3.6, 3.8, 0.35, 64), new T.MeshStandardMaterial({ color: 0x5b5148, roughness: 0.8 }));
    ped.position.y = -0.62; scene.add(ped);
    const clipY = new T.Plane(new T.Vector3(0, -1, 0), 0.0), clipZ = new T.Plane(new T.Vector3(0, 0, -1), 0.0);
    const groups = {};
    const meshes = [];
    function M(color, seed, extra) {
      const tex = stoneTex(T, color, seed);
      return new T.MeshStandardMaterial(Object.assign({ color: 0xffffff, map: tex, bumpMap: tex, bumpScale: 0.6, roughness: 0.85, metalness: 0 }, extra || {}));
    }
    function add(g, mesh, p) { mesh.userData.part = p; mesh.userData.spec = g.userData.k; g.add(mesh); meshes.push(mesh); return mesh; }

    // ---------- 삼엽충: 돌판 위 ----------
    {
      const g = new T.Group(); g.userData.k = 'trilo'; groups.trilo = g; scene.add(g);
      const slabG = new T.BoxGeometry(7.2, 0.7, 5.6, 72, 1, 56);
      const p = slabG.attributes.position;
      for (let i = 0; i < p.count; i++) if (p.getY(i) > 0) { const x = p.getX(i), z = p.getZ(i); p.setY(i, 0.35 + 0.05 * Math.sin(x * 2.1 + z * 1.3) + 0.03 * Math.sin(x * 5.3 - z * 4.1) - 0.04 * Math.exp(-(x * x + z * z) / 3)); }
      slabG.computeVertexNormals();
      const slab = new T.Mesh(slabG, M('#c9b48c', 3)); slab.position.y = -0.1; g.add(slab);
      const stone = (seed) => M('#5d4c3b', seed, { bumpScale: 0.8 });
      const mats = { head: stone(11), eye: M('#3a2f26', 12, { roughness: 0.35 }), axis: stone(13), pleura: stone(14), tail: stone(15) };
      const Y = 0.25;
      // 머리 방패(반원 돔) + 볼록한 가운데 + 가시
      // 반쪽 돔: 반구를 만든 뒤 뒤쪽(+z) 절반을 납작하게 눌러 반달 방패로
      const halfDome = (back) => { const q = new T.SphereGeometry(1, 48, 18, 0, Math.PI * 2, 0, Math.PI / 2), a = q.attributes.position; for (let i = 0; i < a.count; i++) if (a.getZ(i) * back > 0) a.setZ(i, a.getZ(i) * 0.12); q.computeVertexNormals(); return q; };
      const headG = halfDome(1);
      const head = add(g, new T.Mesh(headG, mats.head), 'head'); head.scale.set(1.55, 0.42, 1.05); head.position.set(0, Y, -1.05);
      const glab = add(g, new T.Mesh(new T.SphereGeometry(1, 32, 16), mats.axis), 'axis'); glab.scale.set(0.42, 0.36, 0.62); glab.position.set(0, Y + 0.12, -1.55);
      for (const sx of [-1, 1]) {
        const eye = add(g, new T.Mesh(new T.SphereGeometry(1, 20, 12), mats.eye), 'eye'); eye.scale.set(0.16, 0.14, 0.24); eye.position.set(sx * 0.62, Y + 0.3, -1.35);
        const spine = add(g, new T.Mesh(new T.ConeGeometry(0.12, 1.5, 12), mats.head), 'head'); spine.rotation.x = Math.PI / 2; spine.rotation.y = sx * 0.12; spine.position.set(sx * 1.45, Y + 0.02, -0.25);
        const rimT = add(g, new T.Mesh(new T.TorusGeometry(1, 0.05, 8, 40, Math.PI), mats.head), 'head'); rimT.rotation.x = -Math.PI / 2; rimT.scale.set(1.55, 1.05, 1); rimT.position.set(0, Y + 0.01, -1.05); if (sx > 0) rimT.visible = false;
      }
      // 가슴 마디
      const N = 10;
      for (let i = 0; i < N; i++) {
        const z = -0.9 + i * 0.235, w = 1 - i * 0.035;
        const ring = add(g, new T.Mesh(new T.SphereGeometry(1, 24, 12), mats.axis), 'axis'); ring.scale.set(0.36 * w, 0.27, 0.13); ring.position.set(0, Y + 0.14, z);
        for (const sx of [-1, 1]) {
          const pl = add(g, new T.Mesh(new T.CapsuleGeometry(0.1, 0.92 * w, 6, 12), mats.pleura), 'pleura');
          pl.rotation.z = Math.PI / 2 + sx * 0.28; pl.rotation.y = sx * -0.16; pl.scale.set(1.25, 1, 0.95);
          pl.position.set(sx * (0.36 * w + 0.5 * w), Y + 0.02, z + 0.04);
        }
      }
      const tailG = halfDome(-1);
      const tail = add(g, new T.Mesh(tailG, mats.tail), 'tail'); tail.scale.set(0.92, 0.32, 0.62); tail.position.set(0, Y, 1.42);
      const tAx = add(g, new T.Mesh(new T.SphereGeometry(1, 20, 10), mats.axis), 'axis'); tAx.scale.set(0.2, 0.22, 0.45); tAx.position.set(0, Y + 0.08, 1.55);
      g.userData.mats = mats;
    }

    // ---------- 암모나이트: 로그 나선 관 ----------
    {
      const g = new T.Group(); g.userData.k = 'ammo'; groups.ammo = g; scene.add(g);
      const b = Math.log(2.3) / (2 * Math.PI), th1 = 4.6 * 2 * Math.PI, th0 = 0.35 * 2 * Math.PI, a = 1.75 / Math.exp(b * th1);
      const R = (th) => a * Math.exp(b * th), rr = (th) => 0.52 * R(th);
      const NU = 720, NV = 40, pos = [], uv = [], idx = [];
      for (let i = 0; i <= NU; i++) {
        const th = th0 + (th1 - th0) * i / NU, r = R(th), cx = r * Math.cos(th), cy = r * Math.sin(th);
        const rib = 1 + 0.09 * Math.pow(Math.max(0, Math.sin(th * 9)), 6);
        for (let j = 0; j <= NV; j++) {
          const v = 2 * Math.PI * j / NV, q = rr(th) * rib;
          pos.push(cx + q * Math.cos(v) * Math.cos(th), cy + q * Math.cos(v) * Math.sin(th), q * Math.sin(v) * 0.72);
          uv.push(i / NU * 8, j / NV);
        }
      }
      for (let i = 0; i < NU; i++) for (let j = 0; j < NV; j++) { const A = i * (NV + 1) + j, B = A + NV + 1; idx.push(A, B, A + 1, B, B + 1, A + 1); }
      const geo = new T.BufferGeometry(); geo.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); geo.setAttribute('uv', new T.Float32BufferAttribute(uv, 2)); geo.setIndex(idx); geo.computeVertexNormals();
      const shellM = M('#b07a4a', 21, { side: T.DoubleSide, bumpScale: 0.5 });
      const body = add(g, new T.Mesh(geo, shellM), 'shell');
      // 속(사는 방의 안쪽 면은 밝게)
      const inner = new T.Mesh(geo, new T.MeshStandardMaterial({ color: 0xe9dcc2, side: T.BackSide, roughness: 0.9 })); g.add(inner); inner.userData.part = 'body'; meshes.push(inner);
      // 방을 나누는 벽(사는 방 = 마지막 0.8바퀴에는 벽이 없다)
      const septM = new T.MeshStandardMaterial({ color: 0xf2e6cc, roughness: 0.7, side: T.DoubleSide });
      const septa = [];
      for (let th = th1 - 0.8 * 2 * Math.PI; th > th0 + 0.3; th -= 0.38) {
        const r = R(th), disc = new T.Mesh(new T.CircleGeometry(rr(th) * 0.98, 28), septM);
        disc.position.set(r * Math.cos(th), r * Math.sin(th), 0);
        // 원판 면이 관의 단면과 겹치게: x = 나선 바깥 방향, y = 옆(두께) 방향
        const nx = new T.Vector3(Math.cos(th), Math.sin(th), 0), ez = new T.Vector3(0, 0, 1);
        disc.quaternion.setFromRotationMatrix(new T.Matrix4().makeBasis(nx, ez, nx.clone().cross(ez))); disc.scale.set(1, 0.72, 1);
        add(g, disc, 'septa'); septa.push(disc);
      }
      const cenM = new T.MeshStandardMaterial({ color: 0x8a5a32, roughness: 0.6 });
      const cen = add(g, new T.Mesh(new T.SphereGeometry(0.11, 16, 12), cenM), 'center'); cen.scale.set(1, 1, 0.8);
      g.position.set(0, 2.25, 0); g.rotation.x = -0.15;
      g.userData.mats = { shell: shellM, septa: septM, body: inner.material, center: cenM };
      g.userData.cutMats = [shellM, inner.material, septM];
      g.userData.cutPlane = clipZ;
    }

    // ---------- 스트로마톨라이트: 잘린 돌덩이 ----------
    {
      const g = new T.Group(); g.userData.k = 'strom'; groups.strom = g; scene.add(g);
      const lam = (seed) => {
        const n = 512, c = document.createElement('canvas'); c.width = n; c.height = 300; const x = c.getContext('2d');
        x.fillStyle = '#c2ab84'; x.fillRect(0, 0, n, 300);
        const cols = [[90, 70], [230, 85], [380, 75], [480, 60]];
        for (let k = 0; k < 46; k++) {
          const y0 = 300 - k * 6.2;
          x.beginPath(); x.moveTo(0, y0);
          for (let px = 0; px <= n; px += 4) { let dy = 0; cols.forEach(([cx, w]) => { dy += Math.exp(-(((px - cx) / w) ** 2)) * k * 1.1; }); x.lineTo(px, y0 - dy + Math.sin(px * 0.07 + k + seed) * 1.5); }
          x.lineWidth = 2.6; x.strokeStyle = k % 2 ? 'rgba(92,72,50,.75)' : 'rgba(236,222,196,.8)'; x.stroke();
        }
        const t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t;
      };
      const side = (t) => new T.MeshStandardMaterial({ map: t, roughness: 0.9, bumpMap: t, bumpScale: 0.8 });
      const plain = M('#a8916c', 31);
      const mats = [side(lam(2)), side(lam(5)), plain, plain, side(lam(1)), side(lam(3))];
      const box = new T.Mesh(new T.BoxGeometry(4.6, 2.6, 2.4), mats); box.position.y = 0.48;
      box.userData.part = 'layers'; g.add(box); meshes.push(box);
      // 위: 둥근 머리들
      const topG = new T.PlaneGeometry(4.6, 2.4, 92, 48); topG.rotateX(-Math.PI / 2);
      const tp = topG.attributes.position, heads = [[-1.5, -0.4, 0.75], [-0.2, 0.5, 0.9], [1.2, -0.2, 0.8], [0.6, -0.8, 0.55], [-1.0, 0.8, 0.55]];
      for (let i = 0; i < tp.count; i++) { const x = tp.getX(i), z = tp.getZ(i); let h = 0; heads.forEach(([hx, hz, r]) => { const d = Math.hypot(x - hx, z - hz); h = Math.max(h, d < r ? Math.sqrt(r * r - d * d) * 0.7 : 0); }); tp.setY(i, h + 0.02 * Math.sin(x * 9) * Math.cos(z * 7)); }
      topG.computeVertexNormals();
      const domeM = M('#b49c76', 33);
      const top = add(g, new T.Mesh(topG, domeM), 'dome'); top.position.y = 1.78;
      const matM = new T.MeshStandardMaterial({ color: 0x3f8f4a, roughness: 0.7, transparent: true, opacity: 0.85 });
      const mat = add(g, new T.Mesh(topG, matM), 'mat'); mat.position.y = 1.81; mat.visible = false;
      g.userData.mats = { layers: mats[4], dome: domeM, mat: matM };
      g.userData.mat = mat;
    }

    // ---------- 화폐석: 렌즈 모양 원반 ----------
    {
      const g = new T.Group(); g.userData.k = 'nummu'; groups.nummu = g; scene.add(g);
      const prof = []; for (let i = 0; i <= 40; i++) { const u = i / 40, r = 1.75 * Math.sin(u * Math.PI / 2); prof.push(new T.Vector2(Math.max(0.001, r), 0.42 * Math.cos(u * Math.PI / 2) ** 1.4)); }
      for (let i = 40; i >= 0; i--) { const u = i / 40, r = 1.75 * Math.sin(u * Math.PI / 2); prof.push(new T.Vector2(Math.max(0.001, r), -0.42 * Math.cos(u * Math.PI / 2) ** 1.4)); }
      const lathe = new T.LatheGeometry(prof, 96);
      // 겉면의 가는 줄(방 사이 벽이 비친 자리)
      const c = document.createElement('canvas'); c.width = 1024; c.height = 256; const x = c.getContext('2d');
      x.fillStyle = '#d8c7a0'; x.fillRect(0, 0, 1024, 256);
      for (let k = 0; k < 64; k++) { x.beginPath(); for (let v = 0; v <= 256; v += 4) { const px = k * 16 + 10 * Math.sin(v / 256 * Math.PI) ** 2; v ? x.lineTo(px, v) : x.moveTo(px, v); } x.strokeStyle = 'rgba(110,86,52,.55)'; x.lineWidth = 2; x.stroke(); }
      const tex = new T.CanvasTexture(c); tex.colorSpace = T.SRGBColorSpace;
      const skin = new T.MeshStandardMaterial({ map: tex, bumpMap: tex, bumpScale: 1.2, roughness: 0.8, side: T.DoubleSide });
      const disk = add(g, new T.Mesh(lathe, skin), 'disk');
      // 단면: 나선 방
      const sc = document.createElement('canvas'); sc.width = sc.height = 512; const y = sc.getContext('2d');
      y.fillStyle = '#efe3c6'; y.beginPath(); y.arc(256, 256, 254, 0, 7); y.fill();
      const bb = Math.log(1.6) / (2 * Math.PI), aa = 250 / Math.exp(bb * 9 * 2 * Math.PI) * 0.98;
      y.strokeStyle = '#7a5a36'; y.lineWidth = 3; y.beginPath();
      for (let th = 0.2; th <= 18 * Math.PI; th += 0.02) { const r = aa * Math.exp(bb * th) + 6; const px = 256 + r * Math.cos(th), py = 256 + r * Math.sin(th); th === 0.2 ? y.moveTo(px, py) : y.lineTo(px, py); }
      y.stroke(); y.lineWidth = 1.8;
      for (let th = 1; th <= 18 * Math.PI; th += 0.22) { const r1 = aa * Math.exp(bb * th) + 6, r0 = aa * Math.exp(bb * (th - 2 * Math.PI)) + 6; y.beginPath(); y.moveTo(256 + r0 * Math.cos(th), 256 + r0 * Math.sin(th)); y.lineTo(256 + r1 * Math.cos(th + 0.06), 256 + r1 * Math.sin(th + 0.06)); y.stroke(); }
      const stex = new T.CanvasTexture(sc); stex.colorSpace = T.SRGBColorSpace;
      const secM = new T.MeshStandardMaterial({ map: stex, roughness: 0.75, transparent: true });
      const sec = add(g, new T.Mesh(new T.CircleGeometry(1.74, 96), secM), 'spiral'); sec.rotation.x = -Math.PI / 2; sec.position.y = 0.002; sec.visible = false;
      g.position.y = 0.35; g.rotation.z = 0.08;
      g.userData.mats = { disk: skin, spiral: secM, line: skin };
      g.userData.cutMats = [skin]; g.userData.cutPlane = clipY; g.userData.sec = sec;
    }

    // 이름표(대상에 붙어 다닌다)
    const labs = {};
    ORDER.forEach((k) => {
      labs[k] = Object.entries(SPEC[k].parts).map(([p, [n, , at]]) => {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'g3-label sp-lab'; b.dataset.p = p; b.dataset.k = k; b.textContent = n;
        b.addEventListener('click', () => choose(p)); labBox.appendChild(b);
        const g = groups[k], v = new T.Vector3(...at);
        s.label(b, () => g.localToWorld(v.clone()));
        return b;
      });
    });
    function glow() {
      const g = groups[cur], mats = g.userData.mats;
      Object.entries(mats).forEach(([p, m]) => { if (m.emissive) { m.emissive.set(p === sel ? 0xffb21a : 0x000000); m.emissiveIntensity = p === sel ? 0.45 : 0; } });
    }
    function choose(p) {
      sel = sel === p ? null : p;
      if (sel === 'septa' || sel === 'spiral') setCut(true);
      if (sel === 'mat') setCut(true);
      glow(); texts(); if (!s.active) s.render();
    }
    function setCut(on) {
      cut = !!on;
      const g = groups[cur];
      if (g.userData.cutMats) { g.userData.cutMats.forEach((m) => { m.clippingPlanes = cut ? [g.userData.cutPlane] : []; m.needsUpdate = true; }); }
      if (g.userData.sec) g.userData.sec.visible = cut;
      if (g.userData.mat) g.userData.mat.visible = cut;
      texts(); if (!s.active) s.render();
    }
    function pick(k) {
      cur = k; sel = null; cut = false;
      ORDER.forEach((x) => { groups[x].visible = x === k; labs[x].forEach((b) => { b.hidden = x !== k; }); });
      setCut(false); glow();
      const v = SPEC[k].view; s.look({ yaw: v.yaw, pitch: v.pitch, dist: v.dist, target: [0, v.y ?? 0.4, 0] }, 0.7);
    }
    function clickAt(e) {
      const hit = s.pick(e, meshes.filter((m) => groups[m.userData.spec || cur] && groups[cur].children.includes(m) && m.visible));
      if (hit && hit.object.userData.part) choose(hit.object.userData.part);
    }
    // 화폐석 단면의 점 고르기: 안쪽 면 누르면 «사는 방»이 아니라 중심 판별
    btns.forEach((b) => b.addEventListener('click', () => pick(b.dataset.k)));
    tog.addEventListener('click', () => setCut(!cut));
    homeB.addEventListener('click', () => { const v = SPEC[cur].view; s.look({ yaw: v.yaw, pitch: v.pitch, dist: v.dist, target: [0, v.y ?? 0.4, 0] }, 0.8); });
    let spin = 0;
    pick('trilo');
    root._sp = { pick, part: (p) => { sel = null; choose(p); }, cut: setCut, view: (yaw, pitch, dist) => s.look({ yaw, pitch, dist }, 0.01) };
    return {
      setActive(on) { s.setActive(on); },
      fit() { s.fit(); },
    };
  }
  window.Fossil3D = { mount };
})();
