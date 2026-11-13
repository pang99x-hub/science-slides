/* 1차시 4장 생태계다양성(교과서 27쪽 그림 Ⅰ-17): 3D 섬을 손으로 빚는다.
   «올리기»로 땅을 쓸면 솟고(산), «파내기»로 쓸면 꺼진다(물이 차면 호수). «둘러보기»로 끌면 섬을 돌려 본다.
   칸마다 높이와 물에서 떨어진 거리로 생태계를 정한다: 물(가장자리와 이어지면 바다, 갇히면 호수), 물가의 낮은 땅(바닷가 갯벌·호숫가 습지),
   높은 곳 고산, 중간 높이 숲, 낮은 땅은 물에서 멀면 사막 아니면 초원. 생태계마다 대표 생물(이해를 돕기 위한 예)을 더해 종 수를 센다. */
(function () {
  'use strict';
  const N = 64, SIZE = 30, STEP = SIZE / (N - 1);
  const BIOME = {
    sea: { name: '바다', c: '#3b78b3', sp: ['고등어', '미역', '돌고래'] },
    flat: { name: '갯벌', c: '#8c7a5e', sp: ['칠게', '갯지렁이', '도요새'] },
    grass: { name: '초원', c: '#b8cf6a', sp: ['메뚜기', '들쥐', '종다리'] },
    forest: { name: '숲', c: '#3f8a4a', sp: ['다람쥐', '딱따구리', '참나무', '버섯'] },
    desert: { name: '사막', c: '#e2cd8c', sp: ['선인장', '도마뱀', '전갈'] },
    lake: { name: '호수', c: '#5aa6d6', sp: ['붕어', '연꽃', '잠자리'] },
    marsh: { name: '습지', c: '#6f9a6b', sp: ['개구리', '갈대', '왜가리'] },
    alpine: { name: '고산', c: '#c9c3b8', sp: ['눈잣나무', '산양', '바위종다리'] },
  };
  const ORDER = ['sea', 'flat', 'grass', 'forest', 'desert', 'lake', 'marsh', 'alpine'];
  const MIN = { sea: 5, lake: 4 };
  const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

  function mount(root) {
    const stage = root.querySelector('.il-stage'), canvas = stage.querySelector('canvas'), now = root.querySelector('.il-now');
    const tools = [...root.querySelectorAll('.il-tool')], cnt = root.querySelector('.il-count'), list = root.querySelector('.il-list');
    let tool = 'up';
    const s = window.Scene3D.make(stage, canvas, { view: { yaw: 0.55, pitch: 0.85, dist: 30, target: [0, -1, 1] }, min: 20, max: 70, pmin: 0.35, pmax: 1.35 });
    if (!s.ok) return {};
    const { T, scene } = s;
    s.renderer.setClearColor(new T.Color('#dcebf1'), 1);
    scene.add(new T.HemisphereLight(0xffffff, 0x8a9a80, 1.25));
    const sun = new T.DirectionalLight(0xffffff, 1.6); sun.position.set(-12, 22, 10); scene.add(sun);
    const geo = new T.PlaneGeometry(SIZE, SIZE, N - 1, N - 1); geo.rotateX(-Math.PI / 2);
    const pos = geo.attributes.position, colors = new Float32Array(N * N * 3);
    geo.setAttribute('color', new T.BufferAttribute(colors, 3));
    const land = new T.Mesh(geo, new T.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
    scene.add(land);
    const water = new T.Mesh(new T.PlaneGeometry(SIZE, SIZE), new T.MeshLambertMaterial({ color: 0x3f86c4, transparent: true, opacity: 0.62 }));
    water.rotation.x = -Math.PI / 2; water.position.y = 0; scene.add(water);
    const base = new T.Mesh(new T.BoxGeometry(SIZE, 1.6, SIZE), new T.MeshLambertMaterial({ color: 0x6b5a45 })); base.position.y = -2.3; scene.add(base);
    const ring = new T.Mesh(new T.RingGeometry(1.9, 2.3, 40), new T.MeshBasicMaterial({ color: 0x1d2433, transparent: true, opacity: 0.55, depthTest: false }));
    ring.rotation.x = -Math.PI / 2; ring.renderOrder = 5; ring.visible = false; scene.add(ring);

    const h = new Float32Array(N * N), biome = new Array(N * N).fill('sea');
    const xz = (i) => [pos.getX(i), pos.getZ(i)];
    function init() {
      for (let i = 0; i < N * N; i++) { const [x, z] = xz(i), r = Math.hypot(x, z * 1.12); h[i] = -1.05 + 1.5 * (1 - sm(5.6, 7.6, r)) + 0.04 * Math.sin(x * 1.3) * Math.cos(z * 1.1); }
      update();
    }
    const col = new T.Color();
    function classify() {
      const sea = new Uint8Array(N * N), dist = new Int16Array(N * N).fill(999), q = [];
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) { const i = r * N + c; if ((r === 0 || c === 0 || r === N - 1 || c === N - 1) && h[i] < 0) { sea[i] = 1; q.push(i); } }
      for (let k = 0; k < q.length; k++) { const i = q[k], r = (i / N) | 0, c = i % N; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const rr = r + a, cc = c + b; if (rr < 0 || cc < 0 || rr >= N || cc >= N) continue; const j = rr * N + cc; if (!sea[j] && h[j] < 0) { sea[j] = 1; q.push(j); } } }
      const q2 = []; for (let i = 0; i < N * N; i++) if (h[i] < 0) { dist[i] = 0; q2.push(i); }
      for (let k = 0; k < q2.length; k++) { const i = q2[k], r = (i / N) | 0, c = i % N; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const rr = r + a, cc = c + b; if (rr < 0 || cc < 0 || rr >= N || cc >= N) continue; const j = rr * N + cc; if (dist[j] > dist[i] + 1) { dist[j] = dist[i] + 1; q2.push(j); } } }
      for (let i = 0; i < N * N; i++) {
        if (h[i] < 0) { biome[i] = sea[i] ? 'sea' : 'lake'; continue; }
        const r = (i / N) | 0, c = i % N;
        if (h[i] < 0.24 && dist[i] <= 1) {
          let bySea = false; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const j = (r + a) * N + c + b; if (r + a >= 0 && r + a < N && c + b >= 0 && c + b < N && h[j] < 0 && sea[j]) bySea = true; }
          biome[i] = bySea ? 'flat' : 'marsh'; continue;
        }
        biome[i] = h[i] >= 1.75 ? 'alpine' : h[i] >= 0.78 ? 'forest' : dist[i] > 16 ? 'desert' : 'grass';
      }
    }
    // 생태계 이름표
    const labels = Object.fromEntries(ORDER.map((k) => {
      const e = document.createElement('span'); e.className = 'g3-label il-lab'; e.textContent = BIOME[k].name; stage.appendChild(e);
      const at = new T.Vector3(); s.label(e, () => at); return [k, { e, at }];
    }));
    // 오른쪽 목록
    list.innerHTML = ORDER.map((k) => `<li data-k="${k}"><i style="background:${BIOME[k].c}"></i><b>${BIOME[k].name}</b><span>${BIOME[k].sp.join(' · ')}</span></li>`).join('');
    const items = Object.fromEntries([...list.children].map((li) => [li.dataset.k, li]));
    let lastN = 0;
    function update() {
      for (let i = 0; i < N * N; i++) pos.setY(i, Math.max(h[i], -1.4) * 1.15);
      pos.needsUpdate = true; geo.computeVertexNormals();
      classify();
      const count = {}, sx = {}, sz = {};
      for (let i = 0; i < N * N; i++) {
        const b = biome[i]; count[b] = (count[b] || 0) + 1; const [x, z] = xz(i); sx[b] = (sx[b] || 0) + x; sz[b] = (sz[b] || 0) + z;
        col.set(b === 'sea' || b === 'lake' ? '#a89878' : BIOME[b].c);
        if (b === 'alpine' && h[i] > 2.2) col.set('#f4f6f2');
        colors[i * 3] = col.r; colors[i * 3 + 1] = col.g; colors[i * 3 + 2] = col.b;
      }
      geo.attributes.color.needsUpdate = true;
      const present = ORDER.filter((k) => (count[k] || 0) >= (MIN[k] || 6));
      ORDER.forEach((k) => {
        const L = labels[k], on = present.includes(k); L.e.hidden = !on; items[k].classList.toggle('on', on);
        if (!on) return;
        // 무게중심에 가장 가까운 그 생태계 칸
        const cx = k === 'sea' ? -12 : sx[k] / count[k], cz = k === 'sea' ? 12 : sz[k] / count[k]; let best = 0, bd = Infinity;
        for (let i = 0; i < N * N; i++) if (biome[i] === k) { const [x, z] = xz(i), d = (x - cx) ** 2 + (z - cz) ** 2; if (d < bd) { bd = d; best = i; } }
        const [x, z] = xz(best); L.at.set(x, Math.max(h[best] * 1.15, 0) + 0.9, z);
      });
      const sp = present.reduce((a, k) => a + BIOME[k].sp.length, 0);
      cnt.innerHTML = `생태계 <b>${present.length}</b>가지 · 사는 생물 <b>${sp}</b>종`;
      root.style.setProperty('--il-fill', (sp / 26 * 100).toFixed(0) + '%');
      if (present.length !== lastN) { lastN = present.length; now.textContent = present.length < 5 ? '산을 올리고, 호수를 파 보자' : present.length < 8 ? `생태계 ${present.length}가지 — 더 만들 수 있을까?` : '여덟 가지 생태계를 모두 만들었다!'; }
      s.render();
    }
    function brush(p, sign) {
      for (let i = 0; i < N * N; i++) {
        const [x, z] = xz(i), d2 = (x - p.x) ** 2 + (z - p.z) ** 2; if (d2 > 9) continue;
        const r = (i / N) | 0, c = i % N; const edge = r < 2 || c < 2 || r > N - 3 || c > N - 3;
        h[i] = Math.max(-1.5, Math.min(2.7, h[i] + sign * 0.16 * Math.exp(-d2 / 2.2)));
        if (edge) h[i] = Math.min(h[i], -0.6);
      }
      update();
    }
    const hitLand = (e) => s.pick(e, [land]);
    s.grab((e) => tool !== 'look' && !!hitLand(e), () => ({
      move(e) { const hit = hitLand(e); if (hit) { ring.position.set(hit.point.x, hit.point.y + 0.05, hit.point.z); brush(hit.point, tool === 'up' ? 1 : -1); } },
      up() {},
    }));
    canvas.addEventListener('pointermove', (e) => { if (tool === 'look') { ring.visible = false; return; } const hit = hitLand(e); ring.visible = !!hit; if (hit) ring.position.set(hit.point.x, hit.point.y + 0.08, hit.point.z); if (!s.active) s.render(); });
    canvas.addEventListener('pointerdown', (e) => { if (tool === 'look') return; const hit = hitLand(e); if (hit) brush(hit.point, tool === 'up' ? 1 : -1); });
    canvas.addEventListener('pointerleave', () => { ring.visible = false; if (!s.active) s.render(); });
    tools.forEach((b) => b.addEventListener('click', () => {
      if (b.dataset.t === 'reset') { init(); return; }
      tool = b.dataset.t; tools.forEach((x) => { if (x.dataset.t !== 'reset') x.setAttribute('aria-pressed', String(x === b)); });
      canvas.style.cursor = tool === 'look' ? 'grab' : 'crosshair';
    }));
    canvas.style.cursor = 'crosshair';
    init();
    // 시험·PDF용: 미리 빚어 둔 모양
    root._island = {
      sculpt() {
        const at = (x, z, sign, k) => { for (let j = 0; j < k; j++) brush({ x, z }, sign); };
        at(-2, -2, 1, 12); at(-1.5, -1, 1, 8); at(2.5, 1.5, -1, 10); at(3, 1.5, -1, 6);
        for (const [x, z] of [[-9, 5], [-8, 7], [-10, 3], [-7, 9], [-11, 6], [-9, 9]]) at(x, z, 1, 9);
      },
      tool(t) { tools.find((b) => b.dataset.t === t).click(); },
    };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.Island = { mount };
})();
