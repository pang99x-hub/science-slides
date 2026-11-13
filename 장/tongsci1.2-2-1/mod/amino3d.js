/* 2-2 2차시 체험 «3D 아미노산»(교과서 82쪽: 단백질의 기본 단위체). 공-막대 모형: 가운데 탄소에 아미노기·카복실기·수소·곁사슬(R).
   빈 곳을 끌면 둘러보고 바퀴로 다가간다. 묶음을 누르면 빛나며 풀이. 아래 곁사슬 카드(글라이신·알라닌·세린·시스테인)를
   끌어 R 자리에 놓거나 누르면 곁사슬만 바뀌고 나머지 뼈대가 잠시 노랗게 빛난다 — «바뀌는 것은 곁사슬뿐».
   기 이름(아미노기·카복실기·곁사슬)은 다른 교과서·참고서 내용. Amino3D.mount(root) → { setActive, fit } · 시험용: root._aa.tap(k) · side(k) */
(function () {
  'use strict';
  const COL = { C: 0x3a3f4a, H: 0xf2f4f7, N: 0x4a7ef0, O: 0xe0503f, S: 0xf2c23a };
  const RAD = { C: 0.42, H: 0.26, N: 0.42, O: 0.42, S: 0.5 };
  // 곁사슬: 붙는 자리 기준 상대 좌표(단위: 결합 길이 방향 u, 옆 방향 v, w)
  const SIDES = {
    gly: { n: '글라이신', f: 'H', d: '곁사슬이 수소 하나 — 가장 작은 아미노산', atoms: [['H', 0.75, 0, 0]] },
    ala: { n: '알라닌', f: 'CH₃', d: '곁사슬이 메틸기(CH₃) — 작고 물을 싫어한다', atoms: [['C', 1.3, 0, 0], ['H', 1.75, 0.75, 0], ['H', 1.75, -0.4, 0.65], ['H', 1.75, -0.4, -0.65]] },
    ser: { n: '세린', f: 'CH₂OH', d: '곁사슬 끝에 −OH — 물과 잘 어울린다', atoms: [['C', 1.3, 0, 0], ['H', 1.6, 0.7, 0.5], ['H', 1.6, -0.7, 0.5], ['O', 2.45, 0, -0.4], ['H', 3.05, 0.45, -0.4]] },
    cys: { n: '시스테인', f: 'CH₂SH', d: '곁사슬에 황(S) — 단백질 속에서 다른 시스테인과 다리를 놓는다', atoms: [['C', 1.3, 0, 0], ['H', 1.6, 0.7, 0.5], ['H', 1.6, -0.7, 0.5], ['S', 2.55, 0, -0.45], ['H', 3.2, 0.5, -0.45]] },
  };
  const INFO = {
    amino: '<b>아미노기(−NH₂)</b> 질소 1 + 수소 2. 다음 아미노산의 카복실기와 만나 <b>펩타이드 결합</b>을 이루는 쪽',
    carboxyl: '<b>카복실기(−COOH)</b> 탄소 1 + 산소 2 + 수소 1. 이웃 아미노산과 이을 때 여기서 −OH가, 상대 아미노기에서 H가 빠져 <b>물</b>이 된다',
    H: '<b>수소 원자</b> 가운데 탄소에 붙은 수소 하나 — 모든 아미노산에 같다',
    C: '<b>가운데 탄소</b> 원자가 전자 4 → 네 묶음(아미노기·카복실기·수소·곁사슬)과 하나씩 결합',
  };
  function mount(root) {
    const stage = root.querySelector('.aa-stage'), cv = stage.querySelector('canvas'), out = root.querySelector('.aa-out'), now = root.querySelector('.aa-now');
    const cards = [...root.querySelectorAll('.aa-side button')];
    const V0 = { yaw: 0.5, pitch: 0.3, dist: 12, target: [0, 0, 0] };
    const tapped = new Set(), made = new Set(['gly']);
    let flash = 0, cur = 'gly', changed = false;
    const s = window.Scene3D.make(stage, cv, {
      view: V0, min: 6, max: 24, pmin: -1.3, pmax: 1.3,
      onFrame(dt) { if (flash > 0) { flash = Math.max(0, flash - dt); paint(); } },
      click(e) { const h = s.pick(e, all.children); if (h) { let o = h.object; while (o && !o.userData.k) o = o.parent; if (o) tap(o.userData.k); } },
    });
    if (!s.ok) return { setActive() {}, fit() {} };
    const { T, scene } = s;
    // 바탕 그러데이션 + 뒤쪽 테두리 빛 + 바닥에 드리운 옅은 그림자(삽화 느낌)
    const cvs = document.createElement('canvas'); cvs.width = 4; cvs.height = 256; { const g = cvs.getContext('2d'), gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, '#26335f'); gr.addColorStop(1, '#090e1f'); g.fillStyle = gr; g.fillRect(0, 0, 4, 256); }
    scene.background = new T.CanvasTexture(cvs); scene.background.colorSpace = T.SRGBColorSpace;
    const rim = new T.DirectionalLight(0x9fc4ff, 0.9); rim.position.set(-6, 3, -8); scene.add(rim);
    const shadowDisc = (r, y) => { const c2 = document.createElement('canvas'); c2.width = c2.height = 128; const g = c2.getContext('2d'), gr = g.createRadialGradient(64, 64, 4, 64, 64, 64); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); const m = new T.Mesh(new T.PlaneGeometry(r * 2, r * 2), new T.MeshBasicMaterial({ map: new T.CanvasTexture(c2), transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = y; scene.add(m); return m; };
    scene.add(new T.HemisphereLight(0xffffff, 0x404660, 1.15));
    const key = new T.DirectionalLight(0xffffff, 1.3); key.position.set(5, 8, 7); scene.add(key); s.fill();
    const all = new T.Group(); scene.add(all);
    const dirs = [[1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]].map((v) => new T.Vector3(...v).normalize());
    const [dA, dC, dH, dR] = dirs, up = new T.Vector3(0, 1, 0);
    const bondMat = new T.MeshStandardMaterial({ color: 0xdde3ee, roughness: 0.25, metalness: 0.2 });
    shadowDisc(3.2, -2.6);
    function atom(g, el, p) { const m = new T.Mesh(new T.SphereGeometry(RAD[el], 28, 18), new T.MeshPhysicalMaterial({ color: COL[el], roughness: 0.22, clearcoat: 0.6, clearcoatRoughness: 0.2, emissive: 0x000000 })); m.position.copy(p); g.add(m); return m; }
    function bond(g, a, b) { const d = b.clone().sub(a), c = new T.Mesh(new T.CylinderGeometry(0.08, 0.08, d.length(), 10), bondMat); c.position.copy(a).add(b).multiplyScalar(0.5); c.quaternion.setFromUnitVectors(up, d.normalize()); g.add(c); }
    const grp = (k) => { const g = new T.Group(); g.userData.k = k; all.add(g); return g; };
    // 바깥 방향 d에 대해 옆 방향 두 개
    const frame = (d) => { const v = new T.Vector3().crossVectors(d, Math.abs(d.y) > 0.9 ? new T.Vector3(1, 0, 0) : up).normalize(); return [v, new T.Vector3().crossVectors(d, v).normalize()]; };
    const at = (d, u, a, b) => { const [v, w] = frame(d); return d.clone().multiplyScalar(u).addScaledVector(v, a).addScaledVector(w, b); };
    const O0 = new T.Vector3();
    const gC = grp('C'); atom(gC, 'C', O0);
    const gA = grp('amino'), nP = at(dA, 1.5, 0, 0); atom(gA, 'N', nP); bond(gA, O0, nP);
    [[0.75, 0.6], [-0.75, 0.6]].forEach(([a, b]) => { const p = at(dA, 2.0, a, b); atom(gA, 'H', p); bond(gA, nP, p); });
    const gK = grp('carboxyl'), cP = at(dC, 1.5, 0, 0); atom(gK, 'C', cP); bond(gK, O0, cP);
    const o1 = at(dC, 2.1, 0.95, 0), o2 = at(dC, 2.1, -0.95, 0), hO = at(dC, 2.6, -1.6, 0);
    atom(gK, 'O', o1); bond(gK, cP, o1); bond(gK, cP, o1.clone().add(new T.Vector3(0.05, 0.05, 0.05)));
    atom(gK, 'O', o2); bond(gK, cP, o2); atom(gK, 'H', hO); bond(gK, o2, hO);
    const gH = grp('H'), hP = dH.clone().multiplyScalar(1.1); atom(gH, 'H', hP); bond(gH, O0, hP);
    let gR = null;
    function buildR(k) {
      if (gR) { all.remove(gR); gR.traverse((o) => { if (o.geometry) o.geometry.dispose(); }); }
      gR = grp('R'); const pts = SIDES[k].atoms.map(([el, u, a, b]) => [el, at(dR, u, a, b)]);
      pts.forEach(([el, p], i) => { const m = atom(gR, el, p); m.material.color.lerp(new T.Color(0x5cc77a), el === 'H' ? 0.25 : 0.35); bond(gR, i === 0 || el === 'C' ? O0 : (pts.findLast((q, j) => j < i && q[0] !== 'H') || [0, O0])[1], p); });
    }
    const groups = () => [gC, gA, gK, gH, gR];
    let sel = null;
    function paint() {
      groups().forEach((g) => g.traverse((o) => {
        if (!o.material || o.material === bondMat) return;
        const skel = g !== gR && flash > 0, on = g.userData.k === sel;
        o.material.emissive.setHex(skel ? 0xffd84d : on ? 0x7fd1ff : 0x000000);
        o.material.emissiveIntensity = skel ? 0.2 + 0.25 * Math.sin(flash * 9) ** 2 : on ? 0.45 : 0;
      }));
      ring.visible = false; // 테가 장면 중심에서 엇나가 보여(11/10 점검) 뼈대 원자의 빛만 남긴다
    }
    // 공통 뼈대를 두르는 노란 테
    const ring = new T.Mesh(new T.TorusGeometry(2.9, 0.05, 8, 64), new T.MeshBasicMaterial({ color: 0xffd84d }));
    ring.position.copy(dR.clone().multiplyScalar(-0.6)); ring.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), dR); ring.visible = false; scene.add(ring);
    const lab = (txt, f) => { const e = document.createElement('span'); e.className = 'g3-label s3-lab'; e.textContent = txt; stage.appendChild(e); s.label(e, f); return e; };
    lab('아미노기', () => at(dA, 2.6, 0, -0.9));
    lab('카복실기', () => at(dC, 3.1, 0, 0));
    lab('수소', () => dH.clone().multiplyScalar(1.75));
    const rLab = lab('곁사슬(R)', () => at(dR, 2.4, 0, 1.1));
    function steps() {
      const ok = []; if (tapped.size >= 3) ok.push(1); if (changed) ok.push(2); if (made.size >= 3) ok.push(3);
      const st = [1, 2, 3].find((q) => !ok.includes(q)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 묶음을 셋 이상 눌러 보자' : st === 2 ? '② 곁사슬 카드를 끌어 초록 R 자리에 놓자' : st === 3 ? '③ 다른 곁사슬로 한 번 더 바꿔 보자' : '뼈대는 같고 곁사슬만 다르다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    function tap(k) {
      sel = k; if (k !== 'C') tapped.add(k);
      out.innerHTML = k === 'R' ? `<b>곁사슬(R) — ${SIDES[cur].n}</b> ${SIDES[cur].f}: ${SIDES[cur].d}. 아미노산 약 20종류는 <b>곁사슬만</b> 서로 다르다` : INFO[k];
      paint(); steps(); s.render();
    }
    function side(k) {
      if (!SIDES[k]) return;
      if (k !== cur) changed = true;
      cur = k; made.add(k); buildR(k); flash = 1.6; sel = 'R';
      rLab.textContent = `곁사슬 ${SIDES[k].f}`;
      cards.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === k)));
      out.innerHTML = `<b>${SIDES[k].n}</b> 곁사슬 ${SIDES[k].f} — ${SIDES[k].d}.<br><small>노랗게 빛난 아미노기·카복실기·수소·가운데 탄소는 그대로 — <b>바뀐 것은 곁사슬뿐</b></small>`;
      paint(); steps(); s.render();
    }
    // 카드 끌어 R 자리에 놓기(누르기·키보드도 된다)
    cards.forEach((b) => {
      b.addEventListener('click', () => { if (!b._dragged) side(b.dataset.k); b._dragged = false; });
      b.addEventListener('pointerdown', (e) => {
        const ghost = document.createElement('span'); ghost.className = 'aa-ghost'; ghost.textContent = b.dataset.f; document.body.appendChild(ghost);
        const x0 = e.clientX, y0 = e.clientY;
        const mv = (ev) => { ghost.style.left = `${ev.clientX}px`; ghost.style.top = `${ev.clientY}px`; if (Math.hypot(ev.clientX - x0, ev.clientY - y0) > 8) b._dragged = true; };
        const done = (ev) => {
          window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', done); ghost.remove();
          const r = cv.getBoundingClientRect();
          if (b._dragged && ev.clientX > r.left && ev.clientX < r.right && ev.clientY > r.top && ev.clientY < r.bottom) side(b.dataset.k);
        };
        mv(e); window.addEventListener('pointermove', mv); window.addEventListener('pointerup', done);
      });
    });
    root.querySelector('.aa-home').addEventListener('click', () => s.look(V0));
    buildR('gly'); paint(); steps();
    out.innerHTML = '단백질을 이루는 «블록» 아미노산 — 묶음을 눌러 보자';
    root._aa = { tap, side };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.Amino3D = { mount };
})();
