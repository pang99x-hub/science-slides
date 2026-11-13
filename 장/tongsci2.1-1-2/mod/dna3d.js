/* 1차시 5장 «돌연변이»: DNA 이중 나선(3D). 끌어 돌리고 확대해 두 가닥과 염기 짝을 살핀다.
   염기 짝(또는 아래 글자 띠)을 누르면 그 짝이 빛나고 풀이가 바뀐다. «한 자리 바꾸기»를 누르면 꽃 크기 유전자(예) 안의
   한 짝이 바뀌어(G–C → A–T) 빨간 고리로 표시되고, 오른쪽 달맞이꽃 → 큰달맞이꽃 그림이 켜진다. «되돌리기»로 처음으로.
   염기 배열·유전자 구간·바뀌는 자리는 이해를 돕기 위한 예. 시험용: root._dn.pick(i) · root._dn.mutate() · root._dn.undo() */
(function () {
  'use strict';
  const COL = { A: '#d8573f', T: '#3a78c2', G: '#2f9e5b', C: '#b08a1e' };
  const PAIR = { A: 'T', T: 'A', G: 'C', C: 'G' };
  const SEQ = 'ATGCGTACCAGTGGTCATCG'.split('');
  const GENE = [6, 13], MUT = 10;   // 유전자 구간(예)과 바뀌는 자리
  function mount(root) {
    const stage = root.querySelector('.o3-stage'), canvas = stage.querySelector('canvas');
    const info = root.querySelector('.dn-info'), strip = root.querySelector('.dn-strip'), mutB = root.querySelector('.dn-mut'), undoB = root.querySelector('.dn-undo');
    const N = SEQ.length, RISE = 0.5, TW = 0.62, R = 1.25, Y0 = -(N - 1) * RISE / 2;
    let sel = -1, mutated = false;
    const seq = SEQ.slice();
    const s = window.Orbit.make(stage, canvas, {
      view: { yaw: 0.3, pitch: 0.12, dist: 15, target: [0, 0, 0] }, min: 3.5, max: 28, spin: 0.28, bounds: 7,
      onFrame: (dt) => tick(dt), click: (e) => clickAt(e),
    });
    window.Orbit.chrome(stage, s);
    if (!s.ok) return { setActive() {} };
    const { T, scene } = s;
    const at = (i, side) => { const a = i * TW + (side ? 2.45 : 0); return new T.Vector3(R * Math.cos(a), Y0 + i * RISE, R * Math.sin(a)); };
    // 두 가닥(뼈대)
    [0, 1].forEach((side) => {
      const pts = []; for (let t = -0.6; t <= N - 0.4; t += 0.1) { const a = t * TW + (side ? 2.45 : 0); pts.push(new T.Vector3(R * Math.cos(a), Y0 + t * RISE, R * Math.sin(a))); }
      const tube = new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(pts), 260, 0.16, 12), s.mat(side ? '#9aa6b8' : '#7f8ea6', { roughness: 0.4 }));
      scene.add(tube);
      for (let i = 0; i < N; i++) { const b = new T.Mesh(new T.SphereGeometry(0.2, 14, 10), s.mat('#5d6a80')); b.position.copy(at(i, side)); scene.add(b); }
    });
    // 염기 짝: 가닥에서 가운데까지 막대 두 개
    const rungs = [];
    const up = new T.Vector3(0, 1, 0);
    function half(p, q, color) {
      const d = q.clone().sub(p), len = d.length();
      const m = new T.Mesh(new T.CylinderGeometry(0.15, 0.15, len, 14), s.mat(color, { roughness: 0.5 }));
      m.position.copy(p).add(q).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(up, d.normalize());
      scene.add(m); return m;
    }
    for (let i = 0; i < N; i++) {
      const p = at(i, 0), q = at(i, 1), c = p.clone().add(q).multiplyScalar(0.5);
      const a = half(p, c.clone().lerp(p, 0.02), COL[seq[i]]), b = half(q, c.clone().lerp(q, 0.02), COL[PAIR[seq[i]]]);
      a.userData.i = i; b.userData.i = i; rungs.push({ a, b, c });
    }
    // 유전자 구간(예): 반투명 원통
    const gl = (GENE[1] - GENE[0] + 1) * RISE;
    const gene = new T.Mesh(new T.CylinderGeometry(R + 0.55, R + 0.55, gl, 40, 1, true), s.mat('#ffd84d', { transparent: true, opacity: 0.16, side: T.DoubleSide, depthWrite: false }));
    gene.position.y = Y0 + (GENE[0] + GENE[1]) / 2 * RISE; scene.add(gene);
    const ring = new T.Mesh(new T.TorusGeometry(R + 0.35, 0.09, 10, 48), new T.MeshBasicMaterial({ color: 0xd9483b }));
    ring.rotation.x = Math.PI / 2; ring.position.y = Y0 + MUT * RISE; ring.visible = false; scene.add(ring);
    // 이름표
    const lab = (cls, txt) => { const el = document.createElement('span'); el.className = 'o3-lab ' + cls; el.textContent = txt; stage.appendChild(el); return el; };
    const lGene = lab('dn-gene', '꽃 크기 유전자(예)'), lA = lab('dn-s', '한 가닥'), lB = lab('dn-s', '짝 가닥'), lPick = lab('o3-pick', '');
    s.label(lGene, new T.Vector3(R + 0.9, Y0 + GENE[1] * RISE + 0.45, 0));
    s.label(lA, at(N - 1, 0).add(new T.Vector3(0, 0.75, 0))); s.label(lB, at(N - 1, 1).add(new T.Vector3(0, 0.75, 0)));
    s.label(lPick, () => (sel >= 0 ? rungs[sel].c.clone().add(new T.Vector3(0, 0.62, 0)) : null));
    // 글자 띠
    strip.innerHTML = '';
    const chips = seq.map((b, i) => {
      const k = document.createElement('button'); k.type = 'button'; k.className = 'dn-chip'; k.dataset.i = i;
      k.innerHTML = `<i class="ev-base" data-b="${b}">${b}</i><i class="ev-base" data-b="${PAIR[b]}">${PAIR[b]}</i>`;
      if (i >= GENE[0] && i <= GENE[1]) k.classList.add('in-gene');
      k.addEventListener('click', () => pick(i)); strip.appendChild(k); return k;
    });
    function paint(i) {
      const r = rungs[i];
      r.a.material.color.set(COL[seq[i]]); r.b.material.color.set(COL[PAIR[seq[i]]]);
      chips[i].innerHTML = `<i class="ev-base" data-b="${seq[i]}">${seq[i]}</i><i class="ev-base" data-b="${PAIR[seq[i]]}">${PAIR[seq[i]]}</i>`;
    }
    function tick() {
      const g = 0.35 + 0.3 * Math.sin(performance.now() / 240);
      rungs.forEach((r, i) => { [r.a, r.b].forEach((m) => { m.material.emissive = new T.Color(i === sel ? '#ffe680' : '#000000'); m.material.emissiveIntensity = i === sel ? g : 0; }); });
      ring.material.opacity = 1;
    }
    function say() {
      if (sel < 0) {
        info.innerHTML = mutated
          ? `<b>${MUT + 1}번째 짝이 G–C에서 A–T로</b> 바뀌었다. 꽃 크기 유전자의 <b>염기 배열</b>이 달라져 유전정보가 바뀌었다 → <b>돌연변이</b>. 이 DNA가 자손에게 전해지면 큰달맞이꽃이 이어진다.`
          : '두 가닥이 꼬인 사다리 모양이다. 사다리 가로대는 <b>염기 짝</b>(A–T, G–C)이고, 한 가닥의 <b>염기 배열 순서</b>가 유전정보다. 가로대를 눌러 보자.';
        return;
      }
      const b = seq[sel], inG = sel >= GENE[0] && sel <= GENE[1];
      info.innerHTML = `<b>${sel + 1}번째 짝: ${b}–${PAIR[b]}</b>. ${b === 'A' || b === 'T' ? 'A는 T와' : 'G는 C와'}만 짝을 짓는다. ${inG ? '이 자리는 꽃 크기 유전자(예) 안에 있다.' : '이 자리는 꽃 크기 유전자 밖이다.'}${mutated && sel === MUT ? ' <b>바뀐 자리</b>다!' : ''}`;
    }
    function pick(i) {
      sel = sel === i ? -1 : i; lPick.textContent = sel < 0 ? '' : `${seq[sel]}–${PAIR[seq[sel]]}`;
      chips.forEach((k, j) => k.setAttribute('aria-pressed', String(j === sel)));
      say(); if (!s.active) { tick(); s.render(); }
    }
    function clickAt(e) {
      const hit = s.pick(e, rungs.flatMap((r) => [r.a, r.b]));
      if (hit) pick(hit.object.userData.i); else if (sel >= 0) pick(sel);
    }
    function mutate() {
      if (mutated) return;
      mutated = true; seq[MUT] = 'A'; paint(MUT); ring.visible = true; chips[MUT].classList.add('mut');
      root.classList.add('dn-done'); mutB.disabled = true; undoB.disabled = false;
      s.look({ yaw: s.view.yaw, pitch: 0.1, dist: 9, target: [0, Y0 + MUT * RISE, 0] }, 1.0);
      sel = -1; pick(MUT);
    }
    function undo() {
      mutated = false; seq[MUT] = SEQ[MUT]; paint(MUT); ring.visible = false; chips[MUT].classList.remove('mut');
      root.classList.remove('dn-done'); mutB.disabled = false; undoB.disabled = true; sel = -1; lPick.textContent = '';
      chips.forEach((k) => k.setAttribute('aria-pressed', 'false')); say(); s.reset();
    }
    mutB.addEventListener('click', mutate); undoB.addEventListener('click', undo);
    undoB.disabled = true; say();
    root._dn = { pick, mutate, undo };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.EvDna = { mount };
})();
