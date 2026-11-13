/* 2-2 3차시 체험 «3D DNA와 RNA»(교과서 84쪽 그림 Ⅱ-30 핵산의 구조). 단순화한 모형(염기쌍 12개).
   DNA: 바깥 두 가닥은 당(보라)과 인산(빨강)이 번갈아 이은 골격, 안쪽은 염기쌍 막대(A 노랑·T 주황·G 초록·C 파랑),
   가운데 흰 점은 수소 결합(A–T 2개·G–C 3개 — 다른 자료 내용). 꼭대기 노란 손잡이를 아래로 끌면 위부터 지퍼처럼 풀리고,
   놓으면 짝이 정해져 있어 그대로 다시 맞물린다(상보 결합). 짝 단추로 RNA를 고르면 한 가닥만 남고 T가 U(분홍)로 바뀐다.
   부분을 누르면 그 종류 전체가 빛나고 풀이. DNA3D.mount(root) → { setActive, fit }
   시험용: root._d3.tap('sugar'|'phos'|'base'|'hb') · unzip(0~1) · show('dna'|'rna') */
(function () {
  'use strict';
  const SEQ = 'ATGCGTACCTAG', PAIR = { A: 'T', T: 'A', G: 'C', C: 'G' };
  const COL = { A: 0xffd84d, T: 0xf2a03d, G: 0x5cc77a, C: 0x5aa9f0, U: 0xf07ab4, sugar: 0x9b6fd6, phos: 0xe0503f };
  const NAME = { A: '아데닌(A)', T: '타이민(T)', G: '구아닌(G)', C: '사이토신(C)', U: '유라실(U)' };
  const N = SEQ.length, R = 2.2, DY = 0.85, TW = 0.6;
  function mount(root) {
    const stage = root.querySelector('.d3-stage'), cv = stage.querySelector('canvas'), out = root.querySelector('.d3-out'), now = root.querySelector('.d3-now');
    const btns = [...root.querySelectorAll('.d3-kind button')];
    const V0 = { yaw: 0.4, pitch: 0.15, dist: 19, target: [0, 0, 0] };
    const tapped = new Set();
    let kind = 'dna', open = 0, openT = 0, rnaT = 0, rna = 0, holding = false, zipped = false, sawRna = false, flashK = null, flash = 0;
    const s = window.Scene3D.make(stage, cv, {
      view: V0, min: 9, max: 34, pmin: -1.3, pmax: 1.3,
      onFrame(dt) {
        if (!holding) openT = 0; // 놓으면 다시 맞물린다
        open += (openT - open) * Math.min(1, dt * 6); rna += (rnaT - rna) * Math.min(1, dt * 4);
        if (flash > 0) flash = Math.max(0, flash - dt);
        pose();
      },
      click(e) { const h = s.pick(e, meshes); if (h) tap(h.object.userData.k, h.object.userData.b); },
    });
    if (!s.ok) return { setActive() {}, fit() {} };
    const { T, scene } = s;
    // 바탕 그러데이션(위 밝은 남색 → 아래 짙은 남색) + 광택 재질 + 뒤쪽 테두리 빛 + 바닥의 옅은 그림자
    const bgc = document.createElement('canvas'); bgc.width = 4; bgc.height = 256; const bg2 = bgc.getContext('2d'), bgr = bg2.createLinearGradient(0, 0, 0, 256);
    bgr.addColorStop(0, '#1d2c5c'); bgr.addColorStop(1, '#080d22'); bg2.fillStyle = bgr; bg2.fillRect(0, 0, 4, 256);
    scene.background = new T.CanvasTexture(bgc); scene.background.colorSpace = T.SRGBColorSpace;
    scene.add(new T.HemisphereLight(0xdfe8ff, 0x2a3060, 0.9));
    const key = new T.DirectionalLight(0xffffff, 1.6); key.position.set(6, 9, 8); scene.add(key); s.fill();
    const rim = new T.DirectionalLight(0x7fb4ff, 0.9); rim.position.set(-6, 3, -8); scene.add(rim);
    const mat = (c) => new T.MeshPhysicalMaterial({ color: c, roughness: 0.32, metalness: 0.05, clearcoat: 0.7, clearcoatRoughness: 0.25, emissive: c, emissiveIntensity: 0.06 });
    const meshes = [], pairs = [], y0 = -(N - 1) / 2 * DY;
    const add = (g, geo, c, k, b) => { const m = new T.Mesh(geo, mat(c)); m.userData = { k, b }; g.add(m); meshes.push(m); return m; };
    const sugarG = new T.SphereGeometry(0.42, 18, 12), phosG = new T.SphereGeometry(0.3, 14, 10), hbG = new T.SphereGeometry(0.07, 8, 6);
    const helix = new T.Group(); scene.add(helix);
    for (let i = 0; i < N; i++) {
      const a = i * TW, y = y0 + i * DY, b1 = SEQ[i], b2 = PAIR[b1];
      const halves = [0, 1].map((side) => {
        const g = new T.Group(), ang = a + side * Math.PI, ux = Math.cos(ang), uz = Math.sin(ang), b = side ? b2 : b1;
        g.userData.u = new T.Vector3(ux, 0, uz);
        add(g, sugarG, COL.sugar, 'sugar').position.set(ux * R, y, uz * R);
        if (i < N - 1) { const an = ang + TW / 2; add(g, phosG, COL.phos, 'phos').position.set(Math.cos(an) * R * 1.08, y + DY / 2, Math.sin(an) * R * 1.08); }
        const bar = add(g, new T.CapsuleGeometry(0.17, Math.max(0.02, R - 0.42 - 0.34), 6, 12), COL[b], 'base', b); // 끝이 둥근 막대
        bar.position.set(ux * (R + 0.08) / 2, y, uz * (R + 0.08) / 2); bar.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), new T.Vector3(ux, 0, uz));
        bar.userData.side = side; bar.userData.i = i;
        helix.add(g); return g;
      });
      const hb = new T.Group(), nh = b1 === 'A' || b1 === 'T' ? 2 : 3;
      for (let k = 0; k < nh; k++) { const m = add(hb, hbG, 0xdff4ff, 'hb'); m.userData.e = 0.7; m.position.set(0, y + (k - (nh - 1) / 2) * 0.16, 0); }
      helix.add(hb);
      pairs.push({ halves, hb, b1 });
    }
    const shc = document.createElement('canvas'); shc.width = shc.height = 128; const sh2 = shc.getContext('2d'), shg = sh2.createRadialGradient(64, 64, 4, 64, 64, 64);
    shg.addColorStop(0, 'rgba(0,0,0,.55)'); shg.addColorStop(1, 'rgba(0,0,0,0)'); sh2.fillStyle = shg; sh2.fillRect(0, 0, 128, 128);
    const floor = new T.Mesh(new T.PlaneGeometry(R * 5, R * 5), new T.MeshBasicMaterial({ map: new T.CanvasTexture(shc), transparent: true, depthWrite: false }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = y0 - 1.1; scene.add(floor);
    const knob = new T.Mesh(new T.SphereGeometry(0.38, 18, 12), mat(0xffd84d)); knob.material.emissiveIntensity = 0.45;
    knob.position.set(0, y0 + N * DY + 0.2, 0); helix.add(knob);
    const tBars = meshes.filter((m) => m.userData.k === 'base' && m.userData.side === 0 && m.userData.b === 'T');

    function pose() {
      const k = open * N;
      pairs.forEach((p, i) => {
        const o = Math.max(0, Math.min(1, k - (N - 1 - i))); // 위에서부터 풀린다
        p.halves.forEach((g, side) => { g.position.copy(g.userData.u).multiplyScalar(o * 1.6); if (side) g.scale.setScalar(1 - rna * 0.999); });
        p.hb.visible = o < 0.5 && rna < 0.5;
      });
      knob.visible = rna < 0.5;
      tBars.forEach((m) => { m.material.color.setHex(rna > 0.5 ? COL.U : COL.T); m.material.emissive.setHex(rna > 0.5 ? COL.U : COL.T); m.userData.b = rna > 0.5 ? 'U' : 'T'; });
      meshes.forEach((m) => { m.material.emissiveIntensity = flash > 0 && m.userData.k === flashK ? 0.25 + 0.35 * Math.sin(flash * 10) ** 2  : (m.userData.e || 0.06); });
    }
    function steps() {
      const ok = []; if (tapped.size >= 3) ok.push(1); if (zipped) ok.push(2); if (sawRna) ok.push(3);
      const st = [1, 2, 3].find((q) => !ok.includes(q)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? `① 당·인산·염기·흰 점을 눌러 보자 (${tapped.size}/3)` : st === 2 ? '② 꼭대기 노란 손잡이를 아래로 끝까지 끌자' : st === 3 ? '③ 위 단추로 RNA를 골라 보자' : '두 가닥은 염기 짝(A–T, G–C)으로 맞물린다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    function tap(k, b) {
      tapped.add(k); flashK = k; flash = 1.2;
      const dna = kind === 'dna';
      out.innerHTML = k === 'sugar' ? `<b>당(${dna ? '디옥시라이보스' : '라이보스'})</b> — 뉴클레오타이드의 가운데 조각. 인산과 번갈아 이어져 가닥의 바깥 뼈대가 된다`
        : k === 'phos' ? '<b>인산</b> — 앞 뉴클레오타이드의 인산과 뒤 뉴클레오타이드의 당이 공유 결합해 «당-인산 골격»을 이룬다'
        : k === 'hb' ? '<b>수소 결합</b> — 마주 본 두 염기를 붙잡는 약한 끈(A–T 2개, G–C 3개). 약해서 지퍼처럼 열고 닫을 수 있다'
        : `<b>${NAME[b]}</b> — 가닥 안쪽을 향한 염기. ${b === 'U' ? 'RNA에서 타이민 대신 쓰인다' : `맞은편 짝은 언제나 <b>${NAME[PAIR[b]]}</b>`}`;
      steps();
    }
    function show(k) {
      kind = k; rnaT = k === 'rna' ? 1 : 0; if (k === 'rna') { sawRna = true; openT = 0; }
      btns.forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.k === k)));
      out.innerHTML = k === 'dna' ? '<b>DNA</b> 두 가닥이 꼬인 <b>이중 나선</b> — 바깥은 당-인산 골격, 안쪽은 염기쌍'
        : '<b>RNA</b> 한 가닥 — 당은 라이보스, 타이민(T) 자리에 <b>유라실(U)</b>이 들어간다(분홍)';
      steps(); s.render();
    }
    s.grab((e) => kind === 'dna' && !!s.pick(e, [knob]), (e) => {
      holding = true; const yA = e.clientY;
      return {
        move(ev) {
          openT = Math.max(0, Math.min(1, (ev.clientY - yA) / 260));
          const n = Math.round(openT * N); out.innerHTML = `풀린 염기쌍 <b>${n}</b> / ${N} — 놓으면 짝끼리 다시 맞물린다`;
          if (openT >= 0.98 && !zipped) { zipped = true; steps(); }
        },
        up() { holding = false; if (zipped) out.innerHTML = '놓자 다시 닫혔다 — A는 T와, G는 C와만 맞물려 <b>짝이 정해져 있다</b>(상보 결합)'; },
      };
    });
    btns.forEach((x) => x.addEventListener('click', () => show(x.dataset.k)));
    root.querySelector('.d3-home').addEventListener('click', () => s.look(V0));
    show('dna');
    root._d3 = {
      tap(k) { tap(k, k === 'base' ? 'A' : undefined); s.render(); },
      unzip(v) { show('dna'); holding = v > 0; openT = v; open = v; if (v >= 0.98) zipped = true; pose(); steps(); s.render(); },
      show(k) { show(k); rna = rnaT; pose(); s.render(); },
    };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.DNA3D = { mount };
})();
