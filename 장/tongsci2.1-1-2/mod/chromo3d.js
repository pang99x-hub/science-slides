/* 1차시 3장 «유성생식과 변이»: 세포 속 염색체 두 쌍(3D). 단계 막대(EvT.stepper가 보내는 st-step)에 따라
   0 체세포(흩어진 두 쌍) → 1 같은 모양끼리 짝 → 2 가운데 줄 서기(줄 서는 방법 두 가지) → 3 양쪽으로 나뉨 → 4 생식세포 네 종류.
   염색체를 누르면 강조 + 풀이. 아래 막대로 염색체 쌍 수를 바꾸면 생식세포 조합 2ⁿ·자손 조합이 바뀐다.
   색: 파랑 = 아빠에게서 받은 것, 빨강 = 엄마에게서 받은 것(이해를 돕기 위한 단순한 모형, 교차는 뺐다).
   시험용: root._ch.step(k) · root._ch.flip() · root._ch.n(v) · root._ch.pick(i) */
(function () {
  'use strict';
  const PA = '#4f7fd9', MA = '#dd5d73';
  const fmt = (n) => n.toLocaleString('ko-KR');
  function mount(root) {
    const stage = root.querySelector('.o3-stage'), canvas = stage.querySelector('canvas');
    const info = root.querySelector('.ch-info'), flipB = root.querySelector('.ch-flip');
    let step = 0, arrB = false, sel = -1;
    const s = window.Orbit.make(stage, canvas, {
      view: { yaw: 0.0, pitch: 0.18, dist: 13, target: [0, 0, 0] }, min: 5, max: 26, spin: 0, bounds: 6,
      onFrame: (dt) => tick(dt), click: (e) => clickAt(e),
    });
    window.Orbit.chrome(stage, s);
    if (!s.ok) return { setActive() {} };
    const { T, scene } = s;
    // 세포막
    const cell = new T.Group(); scene.add(cell);
    const mem = new T.Mesh(new T.SphereGeometry(4.3, 48, 32), s.mat('#fff3c9', { transparent: true, opacity: 0.16, depthWrite: false, side: T.DoubleSide }));
    const rim = new T.Mesh(new T.SphereGeometry(4.32, 48, 32), new T.MeshBasicMaterial({ color: 0xc9a43a, wireframe: true, transparent: true, opacity: 0.12 }));
    cell.add(mem, rim);
    // 염색체: 두 염색분체가 가운데(동원체)에서 붙은 X 모양
    function chromo(color, L) {
      const g = new T.Group(), m = s.mat(color, { roughness: 0.45 });
      const geo = new T.CapsuleGeometry(0.26, L, 8, 20);
      [-1, 1].forEach((k) => { const c = new T.Mesh(geo, m); c.rotation.z = k * 0.16; c.position.x = k * 0.2; g.add(c); });
      const cen = new T.Mesh(new T.SphereGeometry(0.24, 20, 14), s.mat('#2a2f3c')); g.add(cen);
      // 유전자 자리 띠(같은 쌍은 같은 높이에)
      const band = new T.Mesh(new T.TorusGeometry(0.3, 0.07, 8, 24), s.mat('#ffd84d', { emissive: '#6b5200', emissiveIntensity: 0.2 }));
      band.rotation.x = Math.PI / 2; band.position.y = L * 0.28; band.scale.set(1.9, 1, 1); g.add(band);
      g.userData = { mat: m, color };
      scene.add(g); return g;
    }
    // 0 아빠 긴 · 1 엄마 긴 · 2 아빠 짧은 · 3 엄마 짧은
    const C = [chromo(PA, 2.4), chromo(MA, 2.4), chromo(PA, 1.25), chromo(MA, 1.25)];
    const NAME = ['아빠에게서 받은 긴 염색체', '엄마에게서 받은 긴 염색체', '아빠에게서 받은 짧은 염색체', '엄마에게서 받은 짧은 염색체'];
    // 단계마다 자리 [x, y, z, 기울기]
    const LAY = {
      0: [[-1.9, 1.1, 0.6, 0.5], [1.6, -0.9, -0.7, -0.8], [0.9, 1.9, -0.4, 1.3], [-1.2, -1.7, 0.5, 0.25]],
      1: [[-1.75, 0.2, 0, 0], [-1.05, 0.2, 0, 0], [1.05, 0.0, 0, 0], [1.75, 0.0, 0, 0]],
      2: [[-0.42, 1.45, 0, 0], [0.42, 1.45, 0, 0], [-0.42, -1.45, 0, 0], [0.42, -1.45, 0, 0]],
      3: [[-2.7, 1.3, 0, 0], [2.7, 1.3, 0, 0], [-2.7, -1.3, 0, 0], [2.7, -1.3, 0, 0]],
    };
    C.forEach((c, i) => { const p = LAY[0][i]; c.position.set(p[0], p[1], p[2]); c.rotation.z = p[3]; c.userData.to = p; });
    // 방추사(나뉠 때)
    const spindle = new T.Group(); scene.add(spindle);
    const lineMat = new T.LineBasicMaterial({ color: 0x8a93a6, transparent: true, opacity: 0.0 });
    const lines = C.map(() => { const g = new T.BufferGeometry().setFromPoints([new T.Vector3(), new T.Vector3()]); const l = new T.Line(g, lineMat); spindle.add(l); return l; });
    const poles = [-4.0, 4.0].map((x) => { const m = new T.Mesh(new T.SphereGeometry(0.18, 12, 10), s.mat('#8a93a6')); m.position.set(x, 0, 0); m.visible = false; scene.add(m); return m; });
    // 생식세포 네 개(4단계): 3단계에서 양쪽으로 간 염색체가 한 번 더 갈라져(염색분체가 나뉨) 이어서 들어간다
    const GX = [-4.3, -1.45, 1.45, 4.3];
    const gam = new T.Group(); scene.add(gam);
    const gCells = GX.map((x) => {
      const m = new T.Mesh(new T.SphereGeometry(1.3, 32, 24), s.mat('#ffe17a', { transparent: true, opacity: 0.32, depthWrite: false }));
      m.position.set(x, 0, 0); m.scale.setScalar(0.01); gam.add(m); return m;
    });
    // 염색분체 여덟 개: 염색체 i의 k번째 가닥
    const halves = [];
    C.forEach((c, i) => [0, 1].forEach((k) => {
      const L = i < 2 ? 2.4 : 1.25;
      const h = new T.Mesh(new T.CapsuleGeometry(0.26, L, 8, 20), s.mat(c.userData.color, { roughness: 0.45 }));
      h.visible = false; h.userData = { i, k, to: [0, 0, 0, 0] }; scene.add(h); halves.push(h);
    }));
    // 이름표
    const lab = (cls, txt) => { const el = document.createElement('span'); el.className = 'o3-lab ' + cls; el.textContent = txt; stage.appendChild(el); return el; };
    const lLong = lab('ch-l', '긴 염색체 쌍'), lShort = lab('ch-l', '짧은 염색체 쌍'), lPick = lab('o3-pick', '');
    const mid = (a, b, dy) => () => (step === 4 ? null : C[a].position.clone().add(C[b].position).multiplyScalar(0.5).add(new T.Vector3(0, dy, 0)));
    s.label(lLong, mid(0, 1, 2.05)); s.label(lShort, mid(2, 3, -1.55));
    s.label(lPick, () => (sel >= 0 && step < 4 ? C[sel].position.clone().add(new T.Vector3(0, 1.6, 0)) : null));
    const gLab = GX.map(() => lab('ch-g', ''));
    gLab.forEach((el, i) => s.label(el, () => (step === 4 ? gCells[i].position.clone().add(new T.Vector3(0, -1.7, 0)) : null)));
    const who = (i) => (i % 2 ? '엄마' : '아빠');

    function targets() {
      const L = LAY[Math.min(step, 3)].map((p) => p.slice());
      if (arrB && step >= 2) { const a = L[2], b = L[3]; L[2] = [b[0], a[1], a[2], a[3]]; L[3] = [a[0], b[1], b[2], b[3]]; }
      C.forEach((c, i) => { c.userData.to = L[i]; });
      // 3단계 자리에서 왼쪽에 간 염색체 → 생식세포 0·1, 오른쪽 → 2·3. 가닥 k가 k번째 세포로
      halves.forEach((h) => {
        const p = L[h.userData.i], side = p[0] < 0 ? 0 : 2, g = side + h.userData.k, long = h.userData.i < 2;
        h.userData.to = [GX[g] + (long ? -0.25 : 0.25), long ? 0.12 : -0.18, 0, 0];
        h.userData.from = [p[0] + (h.userData.k ? 0.2 : -0.2), p[1], p[2], (h.userData.k ? 1 : -1) * 0.16];
      });
      gLab.forEach((el, g) => {
        const inG = halves.filter((h) => L[h.userData.i][0] < 0 === g < 2);
        const lg = inG.find((h) => h.userData.i < 2), sh = inG.find((h) => h.userData.i >= 2);
        el.textContent = '긴 것 ' + who(lg.userData.i) + ' · 짧은 것 ' + who(sh.userData.i);
      });
    }
    function tick(dt) {
      const k = dt >= 1 ? 1 : 1 - Math.exp(-dt * 5);
      C.forEach((c) => { const p = c.userData.to; c.position.x += (p[0] - c.position.x) * k; c.position.y += (p[1] - c.position.y) * k; c.position.z += (p[2] - c.position.z) * k; c.rotation.z += (p[3] - c.rotation.z) * k; });
      const sx = step === 3 ? 1.32 : 1;
      cell.scale.x += (sx - cell.scale.x) * k;
      lineMat.opacity += ((step === 3 ? 0.8 : 0) - lineMat.opacity) * k;
      C.forEach((c, i) => { const pa = lines[i].geometry.attributes.position; const pole = c.userData.to[0] < 0 ? -4 : 4; pa.setXYZ(0, pole, 0, 0); pa.setXYZ(1, c.position.x, c.position.y, c.position.z); pa.needsUpdate = true; });
      const glow = 0.25 + 0.2 * Math.sin(performance.now() / 260);
      C.forEach((c, i) => { c.userData.mat.emissive = new T.Color(i === sel ? '#ffd84d' : '#000000'); c.userData.mat.emissiveIntensity = i === sel ? glow : 0; });
      gCells.forEach((g) => { g.scale.setScalar(g.scale.x + ((step === 4 ? 1 : 0.01) - g.scale.x) * k); });
      halves.forEach((h) => { const p = h.userData.to; h.position.x += (p[0] - h.position.x) * k; h.position.y += (p[1] - h.position.y) * k; h.position.z += (p[2] - h.position.z) * k; h.rotation.z += (p[3] - h.rotation.z) * k; h.scale.setScalar(h.scale.x + (0.55 - h.scale.x) * k); });
    }
    function arrTxt() { return `지금 줄 선 방법: <b>${arrB ? '짧은 쌍이 엇갈림' : '같은 색끼리 같은 쪽'}</b>. 단추를 눌러 바꿔 보자.`; }
    const TXT = {
      0: '염색체를 누르면 누구에게서 받은 것인지 알려 준다.',
      1: '긴 쌍·짧은 쌍마다 파랑 하나, 빨강 하나가 짝이다.',
      2: arrTxt, 3: arrTxt,
      4: () => `양쪽으로 간 염색체가 한 번 더 갈라져 생식세포 <b>네 개</b>가 된다. 이 줄 선 방법에서는 두 종류가 둘씩 생긴다. 줄 서는 방법을 바꾸면 나머지 두 종류가 나온다 → 모두 <b>2² = 4가지</b>.`,
    };
    function show() {
      const enter4 = step === 4 && !halves[0].visible;
      C.forEach((c) => { c.visible = step < 4; }); cell.visible = step < 4; poles.forEach((p) => { p.visible = step === 3; }); spindle.visible = step === 3;
      halves.forEach((h) => { h.visible = step === 4; });
      flipB.disabled = step < 2;
      if (sel < 0 || step === 4) info.innerHTML = typeof TXT[step] === 'function' ? TXT[step]() : TXT[step];
      targets();
      if (enter4 || (step === 4 && flipping)) halves.forEach((h) => { const f = h.userData.from; h.position.set(f[0], f[1], f[2]); h.rotation.z = f[3]; h.scale.setScalar(1); });
      if (enter4) gCells.forEach((g) => g.scale.setScalar(0.01));
      flipping = false;
      if (!s.active) { tick(1); s.render(); }
    }
    function setStep(k) { step = k; if (step === 4) sel = -1; show(); }
    let flipping = false;
    function flip() { flipping = true; arrB = !arrB; flipB.setAttribute('aria-pressed', String(arrB)); sel = -1; show(); }
    function pickI(i) {
      sel = i; lPick.textContent = i < 0 ? '' : (i % 2 ? '엄마에게서' : '아빠에게서');
      if (i >= 0) info.innerHTML = `<b>${NAME[i]}</b>. 짝은 ${i % 2 ? '아빠' : '엄마'}에게서 받은 같은 크기의 염색체다(상동 염색체). 같은 자리에 같은 형질을 정하는 유전자(노란 띠)가 있다.`;
      else show();
      if (!s.active) { tick(1); s.render(); }
    }
    function clickAt(e) {
      if (step === 4) return;
      const hit = s.pick(e, C);
      if (!hit) { pickI(-1); return; }
      let o = hit.object; while (o && !C.includes(o)) o = o.parent;
      pickI(C.indexOf(o));
    }
    root.addEventListener('st-step', (e) => setStep(e.detail));
    flipB.addEventListener('click', flip);
    // 쌍 수 막대 → 2ⁿ
    const nIn = root.querySelector('.ch-n'), nOut = root.querySelector('.ch-nv'), g1 = root.querySelector('.ch-g1'), g2 = root.querySelector('.ch-g2');
    function nset() {
      const n = +nIn.value; nOut.textContent = n + '쌍';
      const a = Math.pow(2, n);
      g1.innerHTML = `생식세포 <b>2<sup>${n}</sup> = ${fmt(a)}</b>가지`;
      g2.innerHTML = n === 23 ? '사람(23쌍): 한 사람의 생식세포 약 <b>800만</b> 가지, 두 사람이 만나 생길 자손의 조합 약 <b>70조</b> 가지' : `두 부모가 만나면 자손의 조합 ${fmt(a)} × ${fmt(a)} = <b>${a * a >= 1e8 ? '약 ' + fmt(Math.round(a * a / 1e8)) + '억' : fmt(a * a)}</b>가지`;
    }
    nIn.addEventListener('input', nset); nIn.addEventListener('keydown', (e) => e.stopPropagation());
    nset(); show();
    root._ch = { step: setStep, flip, n: (v) => { nIn.value = String(v); nset(); }, pick: pickI };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.EvChromo = { mount };
})();
