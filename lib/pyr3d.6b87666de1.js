/* 1차시 이론 장 «영양단계와 생태피라미드»(교과서 77쪽 그림 Ⅱ-6을 3D 계단 피라미드로): 영양단계마다 네모 판 한 층, 판의 넓이가 그 단계의 양에 비례한다.
   위 단추로 «에너지»(교과서 값 kcal/m²·년) · «개체수»(교과서 값 개체수/m²) · «생물량»(값 없이 모양만, 이해를 돕기 위한 예)을 바꾸면 판이 늘고 준다.
   층(판·이름표)을 누르면 그 층이 밝아지고 아래 줄에 값과 한 줄 풀이. 끌어 돌리고 바퀴·두 손가락으로 확대(orbit3d.js).
   아주 작은 층(3차 소비자 개체수 1 등)은 보이도록 최소 크기를 두었다(범례에 적음). 층 위의 생물 패는 그 단계의 예(web3d.js 그림).
   시험용: root._p3d.show(m) · root._p3d.pick(i) · root._p3d.s */
(function () {
  'use strict';
  const LV = ['#8cc760', '#f2c84b', '#6fa8dc', '#f08aa6'];
  const NAME = ['생산자', '1차 소비자', '2차 소비자', '3차 소비자'];
  const KIND = [['rice', [0]], ['grasshopper', [1]], ['frog', [2]], ['snake', [3]]];
  const M = {
    energy: { v: [20810, 3368, 383, 21], unit: 'kcal/m²·년', tag: '에너지', src: '교과서 그림 Ⅱ-6 값' },
    count: { v: [1500000, 200000, 90000, 1], unit: '개체수/m²', tag: '개체수', src: '교과서 그림 Ⅱ-6 값' },
    mass: { v: [100, 30, 12, 5], unit: '', tag: '생물량', src: '이해를 돕기 위한 예(값 없이 모양만)' },
  };
  const SAY = {
    energy: ['빛에너지를 받아 만든 양분의 에너지 — 가장 많다', '생산자를 먹고 얻은 에너지. 생산자가 가진 것의 일부만 옮겨 왔다', '단계마다 일부는 생명 활동에 쓰이고 열로 빠져나가 더 줄었다', '가장 위 단계 — 전해진 에너지가 가장 적다'],
    count: ['풀처럼 작은 생산자가 아주 많다', '생산자보다 수가 적다', '더 줄어든다', '맨 위 단계는 수가 가장 적다(이 조사에서는 1)'],
    mass: ['한 지역 생산자의 몸무게를 모두 더한 양이 가장 크다', '이 예에서는 생산자 층보다 전체 몸무게가 작다', '위로 갈수록 더 준다', '가장 적다'],
  };
  const fmt = (n) => n.toLocaleString('ko-KR');
  const W0 = 6.2, MINW = 0.62, TH = 0.7;
  const side = (m, i) => Math.max(MINW, W0 * Math.sqrt(M[m].v[i] / M[m].v[0]));

  function mount(root) {
    const stage = root.querySelector('.p3d-stage'), canvas = stage.querySelector('canvas');
    const btns = [...root.querySelectorAll('.p3d-show button')], cap = root.querySelector('.p3d-cap');
    const s = window.Orbit.make(stage, canvas, {
      view: { yaw: 0.62, pitch: 0.42, dist: 15.5, target: [0, 1.25, 0] }, min: 7, max: 30, pmin: 0.05, pmax: 1.3, fov: 34,
      click: (e) => { const hit = s.pick(e, slabs); if (hit) pick(hit.object.userData.i); },
    });
    window.Orbit.chrome(stage, s);
    if (!s.ok) return { setActive() {} };
    const { T, scene } = s;
    s.renderer.setClearColor(new T.Color('#f3f1e6'), 1);
    const ground = new T.Mesh(new T.PlaneGeometry(14, 14), s.mat('#e6e1cf')); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.01; scene.add(ground);
    const grid = new T.GridHelper(14, 14, 0xcfc8b2, 0xd9d3bf); grid.position.y = 0; scene.add(grid);
    const slabs = [], edges = [], tokens = [], labs = [];
    for (let i = 0; i < 4; i++) {
      const g = new T.BoxGeometry(1, TH, 1);
      const m = s.mat(LV[i], { roughness: 0.55 });
      const b = new T.Mesh(g, m); b.position.y = TH / 2 + i * TH; b.userData.i = i; scene.add(b); slabs.push(b);
      const e = new T.LineSegments(new T.EdgesGeometry(g), new T.LineBasicMaterial({ color: 0x1d2433 })); b.add(e); edges.push(e);
      const tk = window.EcoWeb3D.token(KIND[i][0], KIND[i][1]);
      const tex = new T.CanvasTexture(tk.cv); tex.colorSpace = T.SRGBColorSpace; tk.ready.then(() => { tex.needsUpdate = true; if (!s.active) s.render(); });
      const sp = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false })); sp.scale.set(0.8, 0.8, 1); scene.add(sp); tokens.push(sp);
      const el = document.createElement('button'); el.type = 'button'; el.className = 'o3-lab p3d-lab'; el.style.borderColor = LV[i];
      el.innerHTML = `<b>${NAME[i]}</b><span class="p3d-v"></span>`; el.addEventListener('click', () => pick(i)); stage.appendChild(el); labs.push(el);
    }
    // 이름표: 판의 오른쪽 앞 모서리 바깥 — 판 크기와 상관없이 같은 줄에 서도록 x는 고정
    labs.forEach((el, i) => { s.label(el, () => new T.Vector3(Math.max(slabs[i].scale.x / 2, 0.4) + 1.6, slabs[i].position.y, 0.2)); });

    let md = 'energy', sel = -1;
    function place(now) {
      for (let i = 0; i < 4; i++) {
        const w = side(md, i), b = slabs[i];
        const to = { x: w, z: w };
        if (now || !window.gsap) { b.scale.x = w; b.scale.z = w; }
        else window.gsap.to(b.scale, Object.assign({ duration: 0.8, ease: 'power2.inOut', onUpdate: () => { if (!s.active) s.render(); } }, to));
        tokens[i].position.set(0, (i + 1) * TH + 0.42, 0);
        labs[i].querySelector('.p3d-v').textContent = M[md].unit ? `${fmt(M[md].v[i])} ${M[md].unit}` : '';
      }
      if (!s.active) s.render();
    }
    function paint() {
      slabs.forEach((b, i) => { b.material.emissive = new T.Color(i === sel ? '#5a4a00' : '#000000'); b.material.opacity = sel < 0 || i === sel ? 1 : 0.55; b.material.transparent = sel >= 0 && i !== sel; });
      labs.forEach((el, i) => el.classList.toggle('o3-pick', i === sel));
      btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === md)));
      if (!s.active) s.render();
    }
    function show(m) {
      md = m; sel = -1; place(false); paint();
      const R = M[m];
      cap.innerHTML = m === 'mass'
        ? '<span class="chip p3d-chip">생물량</span><span class="p3d-d">한 지역에 사는 생물의 몸무게를 모두 더한 양 — 대개 위 단계로 갈수록 준다. <em>층 크기는 이해를 돕기 위한 예</em></span>'
        : `<span class="chip p3d-chip">${R.tag} 피라미드</span><span class="p3d-d">이 교과서 자료는 위 단계일수록 ${R.tag === '에너지' ? '에너지양' : '개체수'}이 줄어든다. 층을 눌러 값을 보자.</span>`;
    }
    function pick(i) {
      sel = i; paint();
      const R = M[md];
      cap.innerHTML = `<span class="chip p3d-chip" style="border-color:${LV[i]}">${NAME[i]}</span>${R.unit ? `<b class="p3d-n">${fmt(R.v[i])}<small> ${R.unit}</small></b>` : ''}<span class="p3d-d">${SAY[md][i]}</span>`;
      root.dispatchEvent(new CustomEvent('p3d-pick', { detail: i }));
    }
    btns.forEach((b) => b.addEventListener('click', () => show(b.dataset.k)));
    place(true); show('energy');
    root._p3d = { show, pick, s, labs };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.EcoPyr3D = { mount };
})();
