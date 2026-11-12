/* 3-3 4차시 체험 «3D 핵에서 라이보솜까지»(교과서 156~157쪽 그림 Ⅲ-38 세포 내 유전정보의 흐름 · 그림 Ⅲ-39 전사와 번역
   + 참고서 내용: 전사는 핵 속·번역은 세포질 라이보솜, 이중 나선이 풀린 뒤 한 가닥에 상보적인 RNA 뉴클레오타이드가 차례로 짝지음,
   RNA 합성효소, DNA는 핵에 남는 원본, 핵공으로 나가는 RNA, 개시코돈·종결코돈, 펩타이드결합, 폴리펩타이드가 접혀 입체 구조).
   왼쪽: 반투명 2겹 핵막(핵공 여럿)에 싸인 핵, 그 안에 DNA 이중 나선 한 부분(가운데 노란 띠가 유전자)과 염색사·인.
   오른쪽: 세포질의 라이보솜(큰·작은 단위체), 떠다니는 아미노산·라이보솜.
   ① 유전자를 누르면 이중 나선이 풀리고, RNA 합성효소가 지나가며 전사에 쓰이는 가닥을 따라 RNA 뉴클레오타이드가 짝지어 붙는다.
      다 만들어지면 RNA가 떨어져 나오고 DNA는 다시 감긴다(DNA를 끌면 «핵 밖으로 나가지 않는다»).
   ② RNA를 끌어 핵공에 대면 구멍을 지나 세포질로 빠져나간다.
   ③ RNA를 라이보솜에 놓으면 라이보솜이 코돈(3염기)씩 미끄러지며 아미노산을 하나씩 잇고, 종결코돈에서 떨어진 사슬이 접혀 단백질이 된다.
   Tx3D.mount(root) → { fit, setActive } · 시험용: root._tx.state() · gene() · toPore() · toRibo() · run(초) · screen(k) */
(function () {
  'use strict';
  // 표준 유전부호(코돈 첫·둘째·셋째 염기 U C A G 순서) — 아미노산 한 글자 → 한국어 이름
  const CODE = 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG', B4 = 'UCAG';
  const aa = (c) => CODE[B4.indexOf(c[0]) * 16 + B4.indexOf(c[1]) * 4 + B4.indexOf(c[2])];
  const KO = { F: '페닐알라닌', L: '류신', S: '세린', Y: '타이로신', C: '시스테인', W: '트립토판', P: '프롤린', H: '히스티딘', Q: '글루타민', R: '아르지닌', I: '아이소류신', M: '메싸이오닌', T: '트레오닌', N: '아스파라진', K: '라이신', V: '발린', A: '알라닌', D: '아스파트산', E: '글루탐산', G: '글라이신', '*': '종결' };
  const AAC = { M: '#e8574a', F: '#e05fa1', G: '#4cae5b', W: '#8a5cc7', K: '#3c8fd6', A: '#f2a53a', H: '#2fa9a0' };
  // 이해를 돕기 위한 예: 짧게 줄인 유전자(코돈 8개 = 아미노산 7개 + 종결코돈)
  const RNA = 'AUGUUCGGAUGGAAGGCUCAUUAA', NG = RNA.length, NCOD = NG / 3;
  const TPL = { A: 'U', T: 'A', G: 'C', C: 'G' }, TO_T = { A: 'T', U: 'A', G: 'C', C: 'G' };
  const tmpl = [...RNA].map((b) => TO_T[b]).join(''); // 전사에 쓰이는 DNA 가닥
  const cods = RNA.match(/.../g), aas = cods.map(aa);
  console.assert(aas.join('') === 'MFGWKAH*' && [...tmpl].map((b) => TPL[b]).join('') === RNA && aa('UGG') === 'W' && aa('UAG') === '*' && aa('GCU') === 'A', 'tx3d: 유전부호');
  const FL = 4, ND = NG + 2 * FL; // 유전자 앞뒤의 DNA
  const PAIR = { A: 'T', T: 'A', G: 'C', C: 'G' };
  const tplAll = 'GACT' + tmpl + 'CGTA', codAll = [...tplAll].map((b) => PAIR[b]).join('');
  const BC = { A: 0xffd84d, T: 0xf2a03d, G: 0x5cc77a, C: 0x5aa9f0, U: 0xf07ab4 };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), ease = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k * k * (3 - 2 * k));
  let seed = 7; const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  // 치수: 핵 중심·반지름, DNA 축(x 방향), 염기 사이 간격, 라이보솜 처음 자리
  const NCX = -4.8, RN = 4.5, YC = 0.3, ZC = 0.4, DX = 0.24, HRAD = 0.5, TW = 0.6, RX0 = 2.4, RY = -0.4, RZ = 0.6;
  const near = (a, b, r) => a.distanceTo(b) < r;

  function mount(root) {
    const stage = root.querySelector('.tx-stage'), cv = stage.querySelector('canvas'), now = root.querySelector('.tx-now'), out = root.querySelector('.tx-out');
    const flow = [...root.querySelectorAll('.tx-flow [data-f]')], seqT = root.querySelector('.tx-seq');
    const VIEW0 = { yaw: 0.12, pitch: 0.2, dist: 22, target: [-0.2, 0.1, 0.3] };
    let t = 0;
    const s = window.Scene3D.make(stage, cv, { view: VIEW0, min: 8, max: 40, pmin: -1.2, pmax: 1.3, fov: 34, onFrame(dt) { t += dt; tick(dt); }, click(e) { pickAt(e); } });
    if (!s.ok) return { setActive() {}, fit() {} };
    const { T, scene, camera } = s, V = (x, y, z) => new T.Vector3(x, y, z), UP = V(0, 1, 0), NC = V(NCX, 0, 0);
    scene.add(new T.HemisphereLight(0xffffff, 0x8a83a6, 1.15));
    const key = new T.DirectionalLight(0xfff4e6, 2.0); key.position.set(4, 9, 8); scene.add(key); s.fill(0.55);
    const std = (c, o) => new T.MeshStandardMaterial(Object.assign({ color: c, roughness: 0.42, metalness: 0.02 }, o));
    function blob(r, sc, amp, ph) {
      const g = new T.SphereGeometry(r, 40, 28), p = g.attributes.position, v = V(0, 0, 0);
      for (let i = 0; i < p.count; i++) { v.fromBufferAttribute(p, i); const n = v.clone().normalize(), k = 1 + amp * (Math.sin(n.x * 5 + ph) * Math.sin(n.y * 4 - ph) + 0.6 * Math.sin(n.z * 7 + n.y * 3 + ph * 2)); v.multiplyScalar(k).multiply(sc); p.setXYZ(i, v.x, v.y, v.z); }
      g.computeVertexNormals(); return g;
    }

    // ── 핵: 2겹 핵막(반투명) + 핵질 + 핵공 + 인 + 염색사 ──
    const nucG = new T.Group(); nucG.position.copy(NC); scene.add(nucG);
    const envM = std(0x9a72d0, { transparent: true, opacity: 0.17, depthWrite: false, roughness: 0.25 });
    const envB = std(0xb79be0, { transparent: true, opacity: 0.1, depthWrite: false, side: T.BackSide });
    const env = new T.Mesh(new T.SphereGeometry(RN, 64, 40), envM), envIn = new T.Mesh(new T.SphereGeometry(RN - 0.16, 48, 32), envB);
    env.renderOrder = 3; envIn.renderOrder = 2; env.userData.key = 'nucleus'; nucG.add(env, envIn);
    const nplasm = new T.Mesh(new T.SphereGeometry(RN - 0.2, 40, 28), new T.MeshBasicMaterial({ color: 0xeee4fa, transparent: true, opacity: 0.22, depthWrite: false, side: T.BackSide })); nplasm.renderOrder = 1; nucG.add(nplasm);
    const poreM = std(0x5b3896, { roughness: 0.5 }), poreHot = std(0x7a4fc0, { roughness: 0.4, emissive: 0x000000 });
    const pores = [];
    function addPore(n, main) {
      const m = new T.Mesh(new T.TorusGeometry(main ? 0.4 : 0.24, main ? 0.11 : 0.06, 10, 28), main ? poreHot : poreM);
      m.position.copy(n).multiplyScalar(RN - 0.06); m.quaternion.setFromUnitVectors(V(0, 0, 1), n); m.userData.key = 'pore'; nucG.add(m);
      const hole = new T.Mesh(new T.CircleGeometry(main ? 0.32 : 0.2, 20), new T.MeshBasicMaterial({ color: 0x2c1950, transparent: true, opacity: 0.5, depthWrite: false })); hole.position.copy(m.position); hole.quaternion.copy(m.quaternion); hole.renderOrder = 4; nucG.add(hole);
      pores.push({ n: n.clone(), p: n.clone().multiplyScalar(RN).add(NC), m, main });
    }
    const N0 = V(0.86, 0.06, 0.5).normalize(); addPore(N0, true);
    for (let i = 0; i < 22; i++) { const y = 1 - (i + 0.5) / 22 * 2, r = Math.sqrt(1 - y * y), a = i * 2.39996; const n = V(r * Math.cos(a), y, r * Math.sin(a)); if (n.distanceTo(N0) > 0.55 && Math.abs(n.z) < 0.72) addPore(n, false); } // 앞뒤 한가운데는 비워 DNA가 가리지 않게
    const nucleolus = new T.Mesh(blob(0.85, V(1, 0.85, 0.9), 0.08, 3), std(0x5a2f94, { roughness: 0.6 })); nucleolus.position.set(-1.6, -2.3, -1.4); nucleolus.userData.key = 'nucleus'; nucG.add(nucleolus);
    // 염색사: DNA 두 끝에서 이어져 핵 속을 구불구불
    const chromM = std(0x7a55b8, { transparent: true, opacity: 0.38, roughness: 0.6, depthWrite: false });
    function walk(p0, d0, n) {
      const pts = [p0.clone()]; let p = p0.clone(), d = d0.clone();
      for (let i = 0; i < n; i++) { d.add(V(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(0.9)).normalize(); p = p.clone().addScaledVector(d, 0.55); if (p.length() > RN - 0.6) { p.multiplyScalar((RN - 0.6) / p.length()); d.multiplyScalar(-1); } pts.push(p); }
      return new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), n * 8, 0.07, 6), chromM);
    }
    const half = (ND - 1) / 2 * DX;
    nucG.add(walk(V(-half - 0.1, YC, ZC), V(-1, 0.2, 0), 26), walk(V(half + 0.1, YC, ZC), V(1, -0.3, -0.3), 22), walk(V(0.5, -2.6, 1.2), V(0, 0, -1), 20));

    // ── 뉴클레오타이드: 당 구 + 염기 막대(+ 인산) ──
    const sugG = new T.SphereGeometry(0.11, 14, 10), phG = new T.SphereGeometry(0.075, 10, 8), baseG = new T.CylinderGeometry(0.065, 0.065, 1, 10);
    const dSug = std(0x9b6fd6), gSug = std(0xb98ae8, { emissive: 0xffd84d, emissiveIntensity: 0 }), phM = std(0xe0503f), rSug = std(0x2a9d8f);
    const baseM = Object.fromEntries(Object.entries(BC).map(([k, c]) => [k, std(c, { roughness: 0.35 })]));
    const dnaG = new T.Group(); scene.add(dnaG); const dnaMeshes = [];
    function nt(group, b, sugM, list) { const o = { s: new T.Mesh(sugG, sugM), b: new T.Mesh(baseG, list ? std(BC[b], { roughness: 0.35 }) : baseM[b]), p: new T.Mesh(phG, phM) }; group.add(o.s, o.b, o.p); if (list) list.push(o.s, o.b, o.p); return o; }
    const tmpV = V(0, 0, 0);
    function place(o, S, E) { o.s.position.copy(S); tmpV.subVectors(E, S); const len = Math.max(0.02, tmpV.length()); o.b.position.copy(S).addScaledVector(tmpV, 0.5); o.b.scale.set(1, len, 1); o.b.quaternion.setFromUnitVectors(UP, tmpV.normalize()); }
    const xOf = (i) => NCX - half + i * DX;
    const D = []; // D[i] = { top(전사에 안 쓰이는 가닥), bot(전사에 쓰이는 가닥), gene }
    for (let i = 0; i < ND; i++) {
      const gene = i >= FL && i < FL + NG;
      const top = nt(dnaG, codAll[i], gene ? gSug : dSug), bot = nt(dnaG, tplAll[i], gene ? gSug : dSug);
      [top, bot].forEach((o) => { [o.s, o.b, o.p].forEach((m) => { m.userData = { key: gene ? 'gene' : 'dna' }; dnaMeshes.push(m); }); });
      D.push({ top, bot, gene, o: 0 });
    }
    const band = new T.Mesh(new T.CylinderGeometry(HRAD + 0.28, HRAD + 0.28, NG * DX, 32, 1, true), new T.MeshBasicMaterial({ color: 0xffd84d, transparent: true, opacity: 0.16, depthWrite: false, side: T.DoubleSide }));
    band.rotation.z = Math.PI / 2; band.position.set(NCX - half + (FL + NG / 2 - 0.5) * DX, YC, ZC); band.renderOrder = 5; scene.add(band);
    const pS = [V(0, 0, 0), V(0, 0, 0)], pE = [V(0, 0, 0), V(0, 0, 0)], hS = V(0, 0, 0), hE = V(0, 0, 0), lS = V(0, 0, 0), lE = V(0, 0, 0);
    function poseDNA() {
      const wob = 0.03 * Math.sin(t * 1.3);
      for (let i = 0; i < ND; i++) {
        const d = D[i], dd = d.gene ? 0 : i < FL ? FL - i : i - (FL + NG - 1); d.o = dOpen * Math.max(0, 1 - dd / 3); // 유전자 앞뒤는 조금만 벌어진다
        const o = ease(d.o), x = xOf(i);
        [d.top, d.bot].forEach((q, side) => {
          const a = i * TW + side * Math.PI + wob, uy = Math.cos(a), uz = Math.sin(a);
          hS.set(x, YC + uy * HRAD, ZC + uz * HRAD); hE.set(x, YC + uy * 0.05, ZC + uz * 0.05);
          if (side === 0) { lS.set(x, YC + 1.55, ZC + 0.15); lE.set(x, YC + 1.15, ZC + 0.15); } else { lS.set(x, YC - 0.5, ZC); lE.set(x, YC - 0.06, ZC); }
          pS[side].lerpVectors(hS, lS, o); pE[side].lerpVectors(hE, lE, o); place(q, pS[side], pE[side]);
        });
      }
      for (let i = 0; i < ND; i++) [D[i].top, D[i].bot].forEach((q, side) => {
        const nx = i < ND - 1 ? (side ? D[i + 1].bot : D[i + 1].top) : null; q.p.visible = !!nx;
        if (nx) q.p.position.addVectors(q.s.position, nx.s.position).multiplyScalar(0.5);
      });
      dnaG.position.x = shake > 0 ? 0.08 * Math.sin(shake * 40) * shake : 0;
    }

    // ── RNA: 뉴클레오타이드 NG개, 당은 라이보스(청록) ──
    const rnaG = new T.Group(); scene.add(rnaG); const rnaMeshes = [];
    const R = [...RNA].map((b) => { const o = nt(rnaG, b, rSug, rnaMeshes); o.k = b; return o; });
    rnaMeshes.forEach((m) => { m.userData.key = 'rna'; });
    const L0 = DX, pts = R.map(() => V(0, 0, 0)), from = R.map(() => V(0, 0, 0)); // 끈 모양 RNA의 당 자리
    const pol = new T.Mesh(blob(1, V(0.75, 0.6, 0.6), 0.1, 2), std(0x9ccf6a, { transparent: true, opacity: 0.55, roughness: 0.5, depthWrite: false })); pol.renderOrder = 6; scene.add(pol);

    // ── 세포질: 라이보솜(큰·작은 단위체), 떠다니는 아미노산·라이보솜 ──
    const rib = new T.Group(); scene.add(rib); const ribMeshes = [];
    const ribL = new T.Mesh(blob(1, V(1.2, 0.82, 1.0), 0.07, 1), std(0x4a4fa8, { roughness: 0.5 })), ribS = new T.Mesh(blob(1, V(1.0, 0.5, 0.82), 0.08, 4), std(0x7076cc, { roughness: 0.5 }));
    ribL.position.y = 0.62; ribS.position.y = -0.6; rib.add(ribL, ribS); [ribL, ribS].forEach((m) => { m.userData.key = 'ribo'; ribMeshes.push(m); });
    const freeRib = [];
    for (let i = 0; i < 9; i++) {
      const g = new T.Group(), a = new T.Mesh(blob(1, V(0.32, 0.22, 0.27), 0.08, i), ribL.material), b = new T.Mesh(blob(1, V(0.27, 0.14, 0.22), 0.08, i + 2), ribS.material);
      a.position.y = 0.16; b.position.y = -0.15; g.add(a, b); g.position.set(0.6 + rnd() * 9, -3.4 + rnd() * 6.8, -2.6 + rnd() * 4.4); g.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3); g.userData.ph = rnd() * 6; scene.add(g); freeRib.push(g);
    }
    const aaG = new T.SphereGeometry(0.27, 18, 12), poolG = new T.SphereGeometry(0.15, 14, 10), aaMat = Object.fromEntries(Object.entries(AAC).map(([k, c]) => [k, std(c, { roughness: 0.3 })]));
    const pool = [];
    for (let i = 0; i < 14; i++) { const k = 'MFGWKAH'[i % 7], m = new T.Mesh(poolG, aaMat[k]); m.userData.base = V(0.8 + rnd() * 9, -3.6 + rnd() * 7.2, -3.4 + rnd() * 2.2); // 떠다니는 아미노산은 작게, 뒤쪽에
      m.userData.ph = rnd() * 6; scene.add(m); pool.push(m); }
    const bondM = std(0xd8d3c6, { roughness: 0.6 }), bondG = new T.CylinderGeometry(0.06, 0.06, 1, 8);
    const prot = new T.Mesh(blob(1, V(1.0, 0.85, 0.9), 0.12, 5), std(0xc99be0, { transparent: true, opacity: 0.55, roughness: 0.3, depthWrite: false })); prot.renderOrder = 7; scene.add(prot);

    // ── 이름표 ──
    const tags = {};
    function tag(k, txt, at, btn, cls = '') {
      const el = document.createElement(btn ? 'button' : 'span'); if (btn) { el.type = 'button'; el.addEventListener('click', () => onTag(k)); }
      el.className = 'g3-label tx-tag ' + cls; el.textContent = txt; stage.appendChild(el); s.label(el, at); tags[k] = el; return el;
    }
    const midPt = V(0, 0, 0), ribAt = V(0, 0, 0);
    tag('nucleus', '핵', () => V(NCX - 2.4, 3.9, 1.4), true);
    tag('pore', '핵공', () => pores[0].p.clone().addScaledVector(pores[0].n, 0.75).add(V(0, 0.55, 0)), true);
    tag('dna', 'DNA', () => V(xOf(0) - 0.25, YC + 0.95, ZC), true);
    tag('gene', '유전자', () => V(NCX, YC + 0.95 + ease(D[FL + 2].o) * 1.15, ZC), true, 'tx-gene');
    tag('rna', 'RNA', () => midPt.copy(pts[NG >> 1]).add(V(0, 0.55, 0)), true, 'tx-rna');
    tag('ribo', '라이보솜', () => ribAt.copy(rib.position).add(V(0, -1.45, 0.3)), true);
    tag('cyto', '세포질', V(8.4, 3.3, -1.6), false, 'tx-side');
    tag('stay', 'DNA는 핵 안에 남는다', () => V(NCX + 1.6, YC - 1.35, ZC + 0.6), false, 'tx-stay');
    tag('pol', 'RNA 합성효소', () => pol.position.clone().add(V(0, -0.95, 0.4)), false, 'tx-side');
    tag('cod', '', () => rib.position.clone().add(V(0, 1.95 + chain.length * 0.02, 0.2)), false, 'tx-cod');
    tag('prot', '단백질', () => prot.position.clone().add(V(0, 1.35, 0)), false, 'tx-side tx-prot');

    // ── 상태 ──
    let st, dOpen, txI, txT, relT, thr, tl, chain, foldT, shake, msgT, inTry, ok, aaFly = null;
    const say = (h) => { if (out.innerHTML !== h) out.innerHTML = h; };
    function reset() {
      st = 'idle'; dOpen = 0; txI = 0; txT = 0; relT = 0; thr = null; tl = null; foldT = -1; shake = 0; msgT = 0; inTry = 0; ok = new Set();
      chain.forEach((c) => { scene.remove(c.m); if (c.bond) scene.remove(c.bond); }); chain = []; if (aaFly) scene.remove(aaFly.m); aaFly = null;
      D.forEach((d) => { d.o = 0; }); R.forEach((o) => { o.b.material.emissive.set(0); }); rnaG.visible = false; R.forEach((o) => { o.s.visible = o.b.visible = o.p.visible = false; });
      rib.position.set(RX0, RY, RZ); ribL.position.set(0, 0.62, 0); ribS.position.set(0, -0.6, 0); prot.visible = false; prot.scale.setScalar(0.01); pol.visible = false;
      s.look(VIEW0);
      say('빈 곳을 끌면 세포가 돌아가고, 바퀴나 두 손가락으로 다가간다. 핵 속 DNA의 <b>노란 띠(유전자)</b>를 눌러 보자');
      table(); steps();
    }
    chain = [];

    // ① 전사
    function startTx() {
      if (st !== 'idle') return false;
      st = 'open'; txT = 0; s.look({ yaw: 0.05, pitch: 0.12, dist: 10.5, target: [NCX, YC + 0.5, ZC] }, 1.4);
      say('유전자 부분의 <b>이중 나선이 풀린다</b> — 두 가닥 염기 사이의 수소결합이 끊어지며 염기가 드러난다'); steps(); return true;
    }
    const pairPos = (k, S, E) => { const x = xOf(FL + k); S.set(x, YC + 0.5, ZC); E.set(x, YC + 0.06, ZC); };
    const rS = V(0, 0, 0), rE = V(0, 0, 0), bdir = V(0, 0, 0);
    function poseRNA() {
      if (st === 'idle' || st === 'open') { rnaG.visible = false; return; }
      rnaG.visible = true;
      if (st === 'tx' || st === 'rel') {
        R.forEach((o, k) => {
          const on = k < txI || (k === txI && st === 'tx');
          o.s.visible = o.b.visible = on; o.p.visible = on && k < txI - 1 + (st === 'rel' ? 1 : 0) && k < NG - 1;
          if (!on) return;
          pairPos(k, rS, rE);
          if (st === 'tx' && k === txI) { const u = ease(txT / 0.32); rS.lerpVectors(from[k], rS, u); rE.copy(rS).add(V(0, -0.44, 0)); }
          if (st === 'rel') { const u = ease(relT / 1.4), off = V(0, 1.15 * u, 1.45 * u); rS.add(off); rE.add(off); }
          place(o, rS, rE); pts[k].copy(rS);
        });
        R.forEach((o, k) => { if (o.p.visible) o.p.position.addVectors(R[k].s.position, R[k + 1].s.position).multiplyScalar(0.5); });
        return;
      }
      // 끈 모양(핵 안·밖, 라이보솜 위): 염기는 끈과 수직으로 아래쪽
      R.forEach((o, k) => {
        o.s.visible = o.b.visible = true; o.p.visible = k < NG - 1;
        const a = pts[Math.max(0, k - 1)], b = pts[Math.min(NG - 1, k + 1)];
        tmpV.subVectors(b, a).normalize(); bdir.set(0, -1, 0).addScaledVector(tmpV, tmpV.y).normalize();
        const w = st === 'tl' || st === 'done' ? 0 : 0.035 * Math.sin(t * 2.2 + k * 0.7);
        rS.copy(pts[k]).add(V(0, w, w)); rE.copy(rS).addScaledVector(bdir, 0.42); place(o, rS, rE);
      });
      for (let k = 0; k < NG - 1; k++) R[k].p.position.addVectors(R[k].s.position, R[k + 1].s.position).multiplyScalar(0.5);
    }

    // ② RNA 끌기: 잡은 점을 따라 나머지가 줄줄이 따라온다. 핵 안에서는 핵막에 막히고, 핵공으로만 나간다
    function rope(i) {
      for (let j = i + 1; j < NG; j++) { tmpV.subVectors(pts[j], pts[j - 1]); const l = tmpV.length() || 1; pts[j].copy(pts[j - 1]).addScaledVector(tmpV, L0 / l); }
      for (let j = i - 1; j >= 0; j--) { tmpV.subVectors(pts[j], pts[j + 1]); const l = tmpV.length() || 1; pts[j].copy(pts[j + 1]).addScaledVector(tmpV, L0 / l); }
    }
    function keepIn(p, inside) {
      tmpV.subVectors(p, NC); const d = tmpV.length();
      if (inside && d > RN - 0.35) { p.copy(NC).addScaledVector(tmpV, (RN - 0.35) / d); return true; }
      if (!inside && d < RN + 0.4) { p.copy(NC).addScaledVector(tmpV, (RN + 0.4) / (d || 1)); return true; }
      return false;
    }
    const poreNear = (p, r) => pores.find((q) => near(p, q.p, r));
    function startThread(pore) {
      // 핵공에 가까운 끝을 앞으로 해서 끈을 길(끈 자신 → 핵공 → 밖)을 따라 미끄러뜨린다
      const order = pts[0].distanceTo(pore.p) < pts[NG - 1].distanceTo(pore.p) ? [...pts.keys()].reverse() : [...pts.keys()];
      const out1 = pore.p.clone().addScaledVector(pore.n, 0.5), dirOut = pore.n.clone().add(V(0.1, 0.95, 0.25)).normalize();
      const Q = order.map((k) => pts[k].clone()).concat([pore.p.clone().addScaledVector(pore.n, -0.3), out1, out1.clone().addScaledVector(dirOut, NG * L0 + 1.5)]);
      const cum = [0]; for (let i = 1; i < Q.length; i++) cum.push(cum[i - 1] + Q[i].distanceTo(Q[i - 1]));
      const sOut = cum[NG + 1] + 0.25;
      thr = { order, Q, cum, s0: order.map((_, j) => cum[j]), D: sOut, u: 0, pore };
      st = 'thread'; say('RNA가 <b>핵공</b>을 지나 세포질로 빠져나간다 — 핵막의 구멍이 드나드는 길'); steps();
    }
    function sampleQ(sv, outV) {
      const { Q, cum } = thr; let i = 1; while (i < cum.length - 1 && cum[i] < sv) i++;
      const a = cum[i - 1], b = cum[i], k = b > a ? clamp((sv - a) / (b - a), 0, 1) : 0; return outV.lerpVectors(Q[i - 1], Q[i], k);
    }
    // ③ 라이보솜에 놓기
    const lay = (k) => V(RX0 + (k - 1) * L0, RY - 0.02, RZ);
    function startTl() {
      st = 'snap'; tl = { u: 0, c: 0, ph: 'snap', tt: 0 }; pts.forEach((p, k) => from[k].copy(p));
      s.look({ yaw: 0.0, pitch: 0.18, dist: 12.5, target: [RX0 + 2.6, RY + 1.0, RZ] }, 1.4);
      say('RNA가 <b>라이보솜</b>에 결합했다 — 첫 코돈 AUG(<b>개시코돈</b>)부터 읽는다'); steps();
    }
    let lastLead = 0;
    function grabRNA(e) {
      if (st !== 'in' && st !== 'out') return null;
      let best = -1, bd = 46; pts.forEach((p, k) => { const q = s.toClient(p), d = Math.hypot(q.x - e.clientX, q.y - e.clientY) / (q.k || 1); if (d < bd) { bd = d; best = k; } });
      return best < 0 ? null : best;
    }
    const ray = new T.Raycaster(), ndc = new T.Vector2(), plane = new T.Plane(), camDir = V(0, 0, 0), hit = V(0, 0, 0);
    function rayPt(e, through) {
      const r = cv.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera);
      camera.getWorldDirection(camDir); plane.setFromNormalAndCoplanarPoint(camDir, through); return ray.ray.intersectPlane(plane, hit);
    }
    s.grab((e) => grabRNA(e) !== null, (e) => {
      const i = grabRNA(e), x0 = e.clientX, y0 = e.clientY; let moved = false; lastLead = i;
      return {
        move(ev) {
          if (st !== 'in' && st !== 'out') return;
          if (Math.hypot(ev.clientX - x0, ev.clientY - y0) > 6) moved = true;
          const p = rayPt(ev, pts[i]); if (!p) return;
          const inside = st === 'in';
          if (inside) { const pr = poreNear(p, 0.95); if (pr) { pts[i].copy(p); rope(i); startThread(pr); return; } }
          const blocked = keepIn(p, inside); pts[i].copy(p); rope(i); pts.forEach((q, k) => { if (k !== i) keepIn(q, inside); });
          if (inside && blocked && t - msgT > 2) { msgT = t; inTry++; say('<b>핵막</b>에 막혔다 — 핵막에 뚫린 <b>핵공</b>(보라 고리)으로 끌어 내보내자'); }
          if (!inside && near(pts[i], rib.position, 1.7)) startTl();
        },
        up() {
          if (!moved) { info('rna'); return; }
          if (st === 'in') { const pr = poreNear(pts[i], 1.5); if (pr) startThread(pr); }
          else if (st === 'out' && near(pts[i], rib.position, 2.4)) startTl();
        },
      };
    });
    // DNA를 끌면 핵 밖으로 나가지 않는다고 알린다(누르기만 하면 유전자 고르기)
    s.grab((e) => !!s.pick(e, dnaMeshes), (e) => {
      const h = s.pick(e, dnaMeshes), x0 = e.clientX, y0 = e.clientY; let moved = false;
      return {
        move(ev) { if (!moved && Math.hypot(ev.clientX - x0, ev.clientY - y0) > 10) { moved = true; shake = 1; tags.stay.classList.add('on'); say('<b>DNA는 핵 밖으로 나가지 않는다</b> — 유전정보의 원본이라 핵 속에 두고, 필요한 부분만 RNA로 옮겨 적어 내보낸다'); } },
        up() { tags.stay.classList.remove('on'); if (moved) return; if (h.object.userData.key === 'gene' && st === 'idle') startTx(); else info(h.object.userData.key); },
      };
    });

    // ── 누르기·이름표 ──
    const INFO = {
      nucleus: '<b>핵</b> — 2겹 <b>핵막</b>에 싸여 DNA를 품은 곳. 핵막 곳곳에 뚫린 <b>핵공</b>으로 물질이 드나든다. 전사는 DNA가 있는 이곳에서 일어난다',
      pore: '<b>핵공</b> — 핵막에 뚫린 구멍. 만들어진 RNA는 이 구멍을 지나 세포질로 나간다',
      dna: '<b>DNA</b> — 염기 A·T·G·C의 배열 순서로 유전정보를 담은 이중 나선. 실제로는 이 부분이 아주 긴 DNA의 일부다',
      gene: '<b>유전자</b> — DNA에서 단백질 하나의 아미노산 순서를 담은 부분. 눌러서 전사를 시작하자',
      rna: '<b>RNA</b> — 전사에 쓰인 DNA 가닥과 상보적인 한 가닥. 당은 <b>라이보스</b>(청록), 타이민 대신 <b>유라실(U, 분홍)</b>이 들어 있다',
      ribo: '<b>라이보솜</b> — 큰 단위체와 작은 단위체로 된 알갱이. RNA의 코돈을 읽어 아미노산을 잇는 <b>번역</b>이 여기서 일어난다',
    };
    function info(k) { if (INFO[k]) say(INFO[k]); }
    function next() {
      if (st === 'idle') return startTx();
      if (st === 'in') { const pr = pores[0]; pts.forEach((p, k) => { p.lerp(pr.p.clone().addScaledVector(pr.n, -0.6 - (NG - 1 - k) * 0.08), 0.6); }); rope(NG - 1); startThread(pr); return true; }
      if (st === 'out') { startTl(); return true; }
      return false;
    }
    function onTag(k) {
      if (k === 'gene' && st === 'idle') { startTx(); return; }
      if ((k === 'rna' || k === 'pore') && st === 'in') { next(); return; }
      if ((k === 'rna' || k === 'ribo') && st === 'out') { next(); return; }
      info(k);
    }
    function pickAt(e) {
      const h = s.pick(e, [...ribMeshes, ...pores.map((p) => p.m), nucleolus]) || s.pick(e, [env]);
      if (h) info(h.object.userData.key); else say('빈 곳을 눌렀다 — 끌면 돌아가고, 바퀴로 다가간다');
    }

    // ── 표·단계 ──
    function table() {
      const rnaN = st === 'idle' || st === 'open' ? 0 : st === 'tx' ? txI : NG, aaN = chain.length, stop = st === 'done' || (tl && tl.c >= NCOD - 1 && tl.ph !== 'snap');
      const cell = (i) => {
        const r = [...cods[i]].map((b, j) => (i * 3 + j < rnaN ? b : '·')).join('');
        const a = aas[i] === '*' ? (stop ? '<i>종결</i>' : '') : i < aaN ? `<i style="--c:${AAC[aas[i]]}">${KO[aas[i]]}</i>` : '';
        return [tmpl.slice(i * 3, i * 3 + 3), r, a];
      };
      const cs = cods.map((_, i) => cell(i)), on = tl && (st === 'tl') ? tl.c : -1;
      seqT.innerHTML = '<tbody>' + [['DNA<small>전사에 쓰인 가닥</small>', 0], ['RNA<small>코돈</small>', 1], ['아미노산', 2]].map(([h, r]) => `<tr class="r${r}"><th>${h}</th>${cs.map((c, i) => `<td class="${i === on ? 'cur' : ''}">${c[r]}</td>`).join('')}</tr>`).join('') + '</tbody>';
    }
    let lastFlow = '';
    function steps() {
      if (st === 'in' || st === 'thread' || st === 'out' || st === 'snap' || st === 'tl' || st === 'done') ok.add(1);
      if (st === 'out' || st === 'snap' || st === 'tl' || st === 'done') ok.add(2);
      if (st === 'done') ok.add(3);
      const n = [1, 2, 3].find((q) => !ok.has(q)) || 0;
      window.L1.steps(root, n, [...ok]); window.L1.done(root, n === 0);
      const nt = n === 1 ? (st === 'idle' ? '① 핵 속 DNA의 노란 띠(유전자)를 눌러 보자' : `① 전사 중 — RNA 뉴클레오타이드 ${Math.min(txI, NG)}/${NG}`)
        : n === 2 ? (st === 'thread' ? '② RNA가 핵공을 지나는 중' : '② RNA를 끌어 핵막의 핵공(보라 고리)에 대자')
          : n === 3 ? (st === 'out' ? '③ RNA를 끌어 오른쪽 라이보솜에 놓자' : `③ 번역 중 — 아미노산 ${chain.length}개`) : 'DNA → RNA → 단백질: 유전정보가 흐른다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', n === 0); }
      const f = st === 'done' ? 3 : ok.has(1) ? 2 : 1, run = st === 'open' || st === 'tx' || st === 'rel' ? 'tx' : (st === 'snap' || st === 'tl') ? 'tl' : '';
      const key2 = f + run; if (key2 !== lastFlow) { lastFlow = key2; flow.forEach((el, i) => { el.classList.toggle('on', i < f); }); root.querySelectorAll('.tx-flow i').forEach((el) => el.classList.toggle('run', el.dataset.r === run)); }
      Object.entries({ gene: st === 'idle', rna: st === 'in' || st === 'out', pore: st === 'in', ribo: st === 'out' }).forEach(([k, v]) => tags[k].classList.toggle('pulse', v));
      tags.rna.style.display = ['in', 'thread', 'out', 'snap', 'tl'].includes(st) ? '' : 'none';
      tags.pol.style.display = st === 'tx' ? '' : 'none'; tags.prot.style.display = st === 'done' ? '' : 'none'; tags.cod.style.display = st === 'tl' && tl && tl.ph !== 'snap' ? '' : 'none';
    }

    // ── 매 프레임 ──
    function tick(dt) {
      if (shake > 0) shake = Math.max(0, shake - dt * 1.6);
      // 띠·유전자 반짝임
      const pulse = st === 'idle' ? 0.25 + 0.2 * Math.sin(t * 4) : 0;
      gSug.emissiveIntensity = pulse; band.material.opacity = st === 'idle' ? 0.12 + 0.08 * Math.sin(t * 4) : Math.max(0, band.material.opacity - dt * 0.3);
      poreHot.emissive.set(st === 'in' || st === 'thread' ? 0xffd84d : 0x000000); poreHot.emissiveIntensity = 0.25 + 0.2 * Math.sin(t * 5);
      if (st === 'open') { dOpen = Math.min(1, dOpen + dt / 1.3); if (dOpen >= 1) { st = 'tx'; txI = 0; txT = 0; say('<b>RNA 합성효소</b>가 지나가며, 아래 가닥(전사에 쓰이는 가닥)의 염기와 짝이 맞는 <b>RNA 뉴클레오타이드</b>가 차례차례 달라붙는다'); newNt(); steps(); } }
      else if (st === 'tx') {
        txT += dt; if (txT >= 0.32) {
          const b = tmpl[txI]; txI++; txT = 0; table();
          if (txI % 3 === 0 || txI === 1) say(`DNA <b>${b}</b> ↔ RNA <b>${TPL[b]}</b> — A에는 U, G에는 C, C에는 G, T에는 A가 짝지어 붙는다 (${txI}/${NG})`);
          if (txI >= NG) { st = 'rel'; relT = 0; say('RNA가 다 만들어졌다 — DNA에서 떨어져 나오고, 풀렸던 DNA 두 가닥은 <b>다시 이중 나선</b>으로 감긴다'); } else newNt();
          steps();
        }
      } else if (st === 'rel') { relT += dt; dOpen = Math.max(0, 1 - relT / 1.6); if (relT >= 1.6) { st = 'in'; s.look({ yaw: 0.25, pitch: 0.22, dist: 18, target: [-2.2, 0.2, 0.6] }, 1.3); say('RNA 완성! 이제 RNA를 끌어 핵막의 <b>핵공</b>으로 내보내자. DNA는 끌어도 핵 밖으로 나가지 않는다'); steps(); } }
      else if (st === 'thread') {
        thr.u = Math.min(1, thr.u + dt / 2.2); const sh = thr.D * ease(thr.u);
        thr.order.forEach((k, j) => sampleQ(thr.s0[j] + sh, pts[k]));
        if (thr.u >= 1) { st = 'out'; thr = null; s.look({ yaw: 0.1, pitch: 0.2, dist: 20, target: [1.2, 0, 0.6] }, 1.2); say('RNA가 세포질에 나왔다. 끌어서 오른쪽 <b>라이보솜</b>에 놓아 보자'); steps(); }
      } else if (st === 'snap') {
        tl.u = Math.min(1, tl.u + dt / 0.9); pts.forEach((p, k) => p.lerpVectors(from[k], lay(k), ease(tl.u)));
        if (tl.u >= 1) { st = 'tl'; tl.ph = 'read'; tl.tt = 0; tl.c = 0; steps(); table(); }
      } else if (st === 'tl') stepTl(dt);
      else if (st === 'done' && foldT >= 0) {
        foldT = Math.min(1, foldT + dt / 2.0); const u = ease(foldT), F = rib.position.clone().add(V(-2.6, 2.3, 0.5));
        chain.forEach((c, j) => { c.pos.lerpVectors(c.from, F.clone().add(FOLD[j]), u); });
        prot.position.copy(F); prot.scale.setScalar(Math.max(0.01, ease((foldT - 0.45) / 0.55))); prot.visible = foldT > 0.45; prot.rotation.y += dt * 0.3;
        ribL.position.set(0.9 * u, 0.62 + 0.8 * u, 0); ribS.position.set(0.5 * u, -0.6 - 0.7 * u, 0); // 단위체가 떨어진다
      }
      poseDNA(); poseRNA(); poseChain();
      pol.visible = st === 'tx'; if (pol.visible) pol.position.set(xOf(FL + Math.min(txI, NG - 1)) + 0.15, YC + 0.25, ZC + 0.2 + 0.05 * Math.sin(t * 6));
      // 세포질 움직임
      freeRib.forEach((g) => { g.rotation.x += dt * 0.15; g.position.y += 0.002 * Math.sin(t + g.userData.ph); });
      pool.forEach((m) => { const b = m.userData.base, ph = m.userData.ph; m.position.set(b.x + 0.35 * Math.sin(t * 0.5 + ph), b.y + 0.3 * Math.sin(t * 0.7 + ph * 2), b.z + 0.3 * Math.cos(t * 0.6 + ph)); });
      if (st === 'idle' || st === 'in' || st === 'out') rib.position.y = RY + 0.05 * Math.sin(t * 1.4);
      // 코돈 반짝임
      R.forEach((o, k) => { const on = st === 'tl' && tl && Math.floor(k / 3) === tl.c; o.b.material.emissive.set(on ? o.b.material.color : 0); o.b.material.emissiveIntensity = on ? 0.35 + 0.2 * Math.sin(t * 6) : 0; });
    }
    function newNt() { const k = txI, x = xOf(FL + k); from[k].set(x + (rnd() - 0.5) * 1.6, YC + 1.0 + rnd() * 1.2, ZC + 1.2 + rnd() * 1.2); }
    // 번역: 읽기 → 아미노산 날아옴 → 펩타이드결합 → 한 코돈만큼 이동
    const FOLD = [V(0, 0, 0), V(0.42, 0.12, 0.18), V(0.28, 0.5, -0.24), V(-0.18, 0.44, 0.22), V(-0.44, 0.02, -0.18), V(-0.12, -0.38, 0.3), V(0.36, -0.32, -0.16)];
    const exitPt = () => rib.position.clone().add(V(-0.35, 1.3, 0.1));
    function stepTl(dt) {
      tl.tt += dt; const c = tl.c, A = aas[c];
      if (tl.ph === 'read') {
        tags.cod.innerHTML = A === '*' ? `<b>${cods[c]}</b> → 종결코돈 · 아미노산 없음` : `<b>${cods[c]}</b> → ${KO[A]}`;
        if (tl.tt > 0.45) {
          if (A === '*') { st = 'done'; foldT = 0; s.look({ yaw: 0.1, pitch: 0.2, dist: 11, target: [rib.position.x - 1.6, rib.position.y + 1.4, RZ] }, 1.6); chain.forEach((q) => q.from.copy(q.pos)); say('<b>종결코돈 UAA</b>에서 번역이 멈췄다 — 라이보솜이 떨어지고, 이어진 사슬(폴리펩타이드)이 구부러지고 접혀 <b>입체 구조의 단백질</b>이 된다'); table(); steps(); return; }
          const m = new T.Mesh(aaG, aaMat[A]); scene.add(m); const p = pool[Math.floor(rnd() * pool.length)].position.clone();
          aaFly = { m, from: p, u: 0 }; tl.ph = 'fly'; tl.tt = 0;
          say(c === 0 ? '<b>AUG</b>(개시코돈)가 가리키는 <b>메싸이오닌</b>이 라이보솜으로 온다 — 번역은 늘 개시코돈에서 시작한다' : `코돈 <b>${cods[c]}</b>가 가리키는 <b>${KO[A]}</b>이(가) 와서 앞 아미노산과 <b>펩타이드결합</b>으로 이어진다`);
        }
      } else if (tl.ph === 'fly') {
        aaFly.u = Math.min(1, aaFly.u + dt / 0.6); const to = exitPt(); aaFly.m.position.lerpVectors(aaFly.from, to, ease(aaFly.u)); aaFly.m.position.y += Math.sin(aaFly.u * Math.PI) * 0.8;
        if (aaFly.u >= 1) { const bond = chain.length ? new T.Mesh(bondG, bondM) : null; if (bond) scene.add(bond); chain.push({ m: aaFly.m, pos: to.clone(), from: V(0, 0, 0), bond, k: A }); aaFly = null; tl.ph = 'move'; tl.tt = 0; table(); steps(); }
      } else if (tl.ph === 'move') {
        const u = ease(tl.tt / 0.55); rib.position.x = RX0 + (c + u) * 3 * L0;
        if (tl.tt >= 0.55) { tl.c++; tl.ph = 'read'; tl.tt = 0; table(); }
      }
    }
    function poseChain() {
      if (st === 'tl') { const E = exitPt(), n = chain.length; chain.forEach((q, j) => { const r = n - 1 - j; q.pos.set(E.x - 0.3 * r, E.y + 0.32 * r, E.z + 0.18 * Math.sin(r * 1.4 + t * 1.5)); }); }
      chain.forEach((q, j) => {
        q.m.position.copy(q.pos);
        if (q.bond) { const a = chain[j - 1].pos; tmpV.subVectors(q.pos, a); const l = tmpV.length(); q.bond.position.copy(a).addScaledVector(tmpV, 0.5); q.bond.scale.set(1, l, 1); q.bond.quaternion.setFromUnitVectors(UP, tmpV.normalize()); }
      });
    }

    cv.addEventListener('keydown', (e) => {
      const v = s.view;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') v.yaw += e.key === 'ArrowLeft' ? 0.15 : -0.15;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') v.pitch = clamp(v.pitch + (e.key === 'ArrowUp' ? 0.1 : -0.1), -1.2, 1.3);
      else if (e.key === '+' || e.key === '=') v.dist = clamp(v.dist * 0.9, 8, 40);
      else if (e.key === '-') v.dist = clamp(v.dist * 1.1, 8, 40);
      else if (e.key === '0') s.look(VIEW0);
      else if (e.key === 'Enter' || e.key === ' ') next();
      else return;
      e.preventDefault(); e.stopPropagation(); if (!s.active) s.render();
    });
    const pinch = new Map(); let p0 = 0, d0 = 0;
    cv.addEventListener('pointerdown', (e) => { pinch.set(e.pointerId, e); if (pinch.size === 2) { const [a, b] = [...pinch.values()]; p0 = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); d0 = s.view.dist; } });
    cv.addEventListener('pointermove', (e) => { if (!pinch.has(e.pointerId)) return; pinch.set(e.pointerId, e); if (pinch.size === 2 && p0) { const [a, b] = [...pinch.values()], d = Math.hypot(a.clientX - b.clientX, a.clientY - b.clientY); s.view.dist = clamp(d0 * p0 / Math.max(20, d), 8, 40); } });
    const pend = (e) => { pinch.delete(e.pointerId); if (pinch.size < 2) p0 = 0; };
    cv.addEventListener('pointerup', pend); cv.addEventListener('pointercancel', pend);
    root.querySelector('.tx-home').addEventListener('click', () => s.look(VIEW0));
    root.querySelector('.tx-reset').addEventListener('click', reset);
    reset(); tick(0);
    root._tx = {
      state: () => ({ st, txI, chain: chain.map((q) => q.k).join(''), ok: [...ok], open: +dOpen.toFixed(2), head: pts[0].toArray().map((v) => +v.toFixed(2)), out: pts.every((p) => p.distanceTo(NC) > RN) }),
      gene: () => startTx(), toPore: () => next(), toRibo: () => next(),
      run(sec) { for (let i = 0; i < sec * 30; i++) { t += 1 / 30; tick(1 / 30); } s.render(); return this.state(); },
      screen(k) {
        const p = k === 'gene' ? V(xOf(FL + 6), YC - 0.4, ZC) : k === 'pore' ? pores[0].p : k === 'ribo' ? rib.position : k === 'mid' ? pts[NG >> 1] : k === 'dna' ? V(xOf(1), YC, ZC + HRAD) : pts[Number(k) || 0];
        const q = s.toClient(p.clone ? p.clone() : p); return { x: q.x, y: q.y };
      },
      pts: () => pts.map((p) => { const q = s.toClient(p.clone()); return { x: q.x, y: q.y }; }),
    };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.Tx3D = { mount };
})();
