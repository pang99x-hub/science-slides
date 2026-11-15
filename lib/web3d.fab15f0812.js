/* 1차시 이론 장 «먹이 관계와 먹이그물»(교과서 76쪽 그림 Ⅱ-5를 3D로): 영양단계마다 한 층씩 계단처럼 쌓은 받침 위에 생물 열한 종이 서 있고,
   먹히는 생물 → 먹는 생물로 화살표(에너지가 가는 쪽)가 이어진다. 끌어 돌리고 바퀴·두 손가락으로 확대(orbit3d.js).
   생물(그림·이름표)을 누르면 그 생물의 먹이(들어오는 화살표, 주황)와 그 생물을 먹는 상대(나가는 화살표, 파랑)만 밝아지고 한 줄 풀이가 바뀐다.
   위 단추: «먹이그물 전체» · «먹이 사슬 하나»(벼 → 메뚜기 → 개구리 → 뱀 → 매) · «한 생물 빼 보기»(누른 생물이 사라지면 화살표로 이어진 생물이 어떻게 될까).
   생물 그림은 eco.js 그림을 둥근 패로 그려 3D 판에 세운다(늘 화면을 본다). 고리 색 = 영양단계, 두 색 고리 = 먹이에 따라 단계가 달라지는 생물.
   배치는 이해를 돕기 위한 예. 시험용: root._w3.pick(k) · root._w3.mode(m) · root._w3.s */
(function () {
  'use strict';
  const LV = ['#8cc760', '#f2c84b', '#6fa8dc', '#f08aa6'];
  const LVN = ['생산자', '1차 소비자', '2차 소비자', '3차 이상'];
  const TY = [0, 1.7, 3.4, 5.1], TR = [5.4, 4.3, 3.2, 2.1];      // 층 높이·반지름
  // [이름, 그림, 층, 단계들, 각도(도), 반지름, 풀이]
  const SP = {
    rice: ['벼', 'rice', 0, [0], -48, 3.7, '빛에너지로 양분을 만드는 <b>생산자</b>. 메뚜기·참새·토끼의 먹이가 된다.'],
    foxtail: ['강아지풀', 'grass', 0, [0], 52, 3.7, '<b>생산자</b>. 메뚜기·토끼·쥐가 먹는다.'],
    hopper: ['메뚜기', 'grasshopper', 1, [1], 4, 3.0, '벼·강아지풀을 먹는 <b>1차 소비자</b>. 참새·개구리·두더지가 메뚜기를 먹는다.'],
    rabbit: ['토끼', 'rabbit', 1, [1], -78, 3.0, '풀을 먹는 <b>1차 소비자</b>. 매·올빼미에게 먹힌다.'],
    mouse: ['쥐', 'mouse', 1, [1], 84, 3.0, '강아지풀을 먹는 <b>1차 소비자</b>. 뱀·올빼미에게 먹힌다.'],
    sparrow: ['참새', 'sparrow', 2, [1, 2], -52, 2.2, '벼를 먹으면 <b>1차</b>, 메뚜기를 먹으면 <b>2차 소비자</b> — 먹이에 따라 영양단계가 다르다.'],
    frog: ['개구리', 'frog', 2, [2], 22, 2.2, '메뚜기를 먹는 <b>2차 소비자</b>. 뱀에게 먹힌다.'],
    mole: ['두더지', 'mole', 2, [2], 104, 2.2, '땅속에서 메뚜기 같은 곤충을 먹는 <b>2차 소비자</b>. 매에게 먹힌다.'],
    snake: ['뱀', 'snake', 3, [2, 3], -64, 1.2, '쥐를 먹으면 <b>2차</b>, 개구리·참새를 먹으면 <b>3차 소비자</b>.'],
    owl: ['올빼미', 'owl', 3, [2, 3], 70, 1.2, '토끼·쥐를 먹으면 <b>2차</b>, 뱀을 먹으면 그보다 높은 단계의 소비자.'],
    hawk: ['매', 'hawk', 3, [2, 3], 0, 0, '이 그물의 맨 위. 토끼를 먹으면 <b>2차</b>, 참새를 먹으면 <b>3차</b>, 뱀을 먹으면 더 높은 단계.'],
  };
  const LINKS = ['rice>hopper', 'rice>sparrow', 'rice>rabbit', 'foxtail>hopper', 'foxtail>rabbit', 'foxtail>mouse',
    'hopper>sparrow', 'hopper>frog', 'hopper>mole', 'sparrow>snake', 'sparrow>hawk', 'rabbit>hawk', 'rabbit>owl',
    'mouse>snake', 'mouse>owl', 'frog>snake', 'mole>hawk', 'snake>hawk', 'snake>owl'].map((s) => s.split('>'));
  const CHAIN = ['rice', 'hopper', 'frog', 'snake', 'hawk'];

  // eco.js 생물 그림 → 둥근 패(캔버스) : 흰 바탕 + 영양단계 고리
  function token(kind, lvs) {
    const NS = 'http://www.w3.org/2000/svg';
    const host = document.createElementNS(NS, 'svg');
    host.setAttribute('width', '200'); host.setAttribute('height', '200');
    host.style.cssText = 'position:absolute;left:-9999px;top:0;';
    document.body.appendChild(host);
    const g = window.Eco.org(host, kind, 0, 0, 1);
    g.querySelectorAll('*').forEach((e) => {
      const cs = getComputedStyle(e);
      e.setAttribute('style', `fill:${cs.fill};stroke:${cs.stroke};stroke-width:${cs.strokeWidth};stroke-linejoin:round;stroke-linecap:round;opacity:${cs.opacity}`);
    });
    const bb = g.getBBox();
    const pad = 6, side = Math.max(bb.width, bb.height) + pad * 2;
    host.setAttribute('viewBox', `${bb.x + bb.width / 2 - side / 2} ${bb.y + bb.height / 2 - side / 2} ${side} ${side}`);
    host.setAttribute('width', '256'); host.setAttribute('height', '256');
    const txt = new XMLSerializer().serializeToString(host);
    host.remove();
    const cv = document.createElement('canvas'); cv.width = cv.height = 256;
    const c = cv.getContext('2d');
    const paint = (img) => {
      c.clearRect(0, 0, 256, 256);
      c.beginPath(); c.arc(128, 128, 116, 0, Math.PI * 2); c.fillStyle = '#fffdf6'; c.fill();
      if (img) c.drawImage(img, 52, 52, 152, 152);
      c.lineWidth = 18;
      if (lvs.length === 1) { c.beginPath(); c.arc(128, 128, 116, 0, Math.PI * 2); c.strokeStyle = LV[lvs[0]]; c.stroke(); }
      else { c.beginPath(); c.arc(128, 128, 116, Math.PI / 2, Math.PI * 1.5); c.strokeStyle = LV[lvs[0]]; c.stroke(); c.beginPath(); c.arc(128, 128, 116, -Math.PI / 2, Math.PI / 2); c.strokeStyle = LV[lvs[1]]; c.stroke(); }
      c.lineWidth = 3; c.strokeStyle = '#1d2433'; c.beginPath(); c.arc(128, 128, 125, 0, Math.PI * 2); c.stroke();
    };
    paint(null);
    const img = new Image();
    const p = new Promise((res) => { img.onload = () => { paint(img); res(); }; img.onerror = () => res(); });
    img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(txt);
    return { cv, ready: p };
  }

  function mount(root) {
    const stage = root.querySelector('.w3-stage'), canvas = stage.querySelector('canvas');
    const btns = [...root.querySelectorAll('.w3-show button')], cap = root.querySelector('.w3-cap');
    const s = window.Orbit.make(stage, canvas, {
      view: { yaw: 0.0, pitch: 0.36, dist: 19.5, target: [0, 2.6, 0] }, min: 9, max: 34, pmin: 0.02, pmax: 1.3, fov: 34,
      click: (e) => clickAt(e), 
    });
    window.Orbit.chrome(stage, s);
    if (!s.ok) return { setActive() {} };
    const { T, scene } = s;
    s.renderer.setClearColor(new T.Color('#eef5e6'), 1);
    const mat = s.mat;

    // ---- 계단 받침: 층마다 영양단계 색 ----
    TY.forEach((y, i) => {
      const disc = new T.Mesh(new T.CylinderGeometry(TR[i], TR[i] + 0.08, 0.34, 64), mat(LV[i], { transparent: true, opacity: 0.78 }));
      disc.position.y = y - 0.17; scene.add(disc);
      const rim = new T.Mesh(new T.TorusGeometry(TR[i] + 0.04, 0.035, 6, 96), mat('#1d2433')); rim.rotation.x = Math.PI / 2; rim.position.y = y; scene.add(rim);
      if (i > 0) { const col = new T.Mesh(new T.CylinderGeometry(TR[i] - 0.3, TR[i] - 0.3, TY[i] - TY[i - 1] - 0.34, 48, 1, true), mat('#e9e3d2', { transparent: true, opacity: 0.35, side: T.DoubleSide })); col.position.y = (TY[i] + TY[i - 1]) / 2 - 0.17; scene.add(col); }
    });
    const ground = new T.Mesh(new T.CircleGeometry(9, 64), mat('#dfeccd')); ground.rotation.x = -Math.PI / 2; ground.position.y = -0.36; scene.add(ground);

    // ---- 생물 패 ----
    const pos = {}, sprites = {}, labs = {};
    const hold = new T.Group(); scene.add(hold);
    Object.entries(SP).forEach(([k, [nm, kind, tier, lvs, deg, rad]]) => {
      const a = deg * Math.PI / 180;
      const p = new T.Vector3(Math.sin(a) * rad, TY[tier] + 0.72, Math.cos(a) * rad);
      if (k === 'hawk') p.set(0, TY[3] + 1.35, 0);
      pos[k] = p;
      const tk = token(kind, lvs);
      const tex = new T.CanvasTexture(tk.cv); tex.colorSpace = T.SRGBColorSpace;
      tk.ready.then(() => { tex.needsUpdate = true; if (!s.active) s.render(); });
      const sp = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
      sp.scale.set(1.3, 1.3, 1); sp.position.copy(p); sp.userData.k = k; sp.renderOrder = 5;
      hold.add(sp); sprites[k] = sp;
      // 받침 기둥(패와 층을 잇는 짧은 막대)
      const st = new T.Mesh(new T.CylinderGeometry(0.05, 0.05, p.y - TY[tier] - 0.6, 6), mat('#6b5a44')); st.position.set(p.x, (p.y - 0.6 + TY[tier]) / 2, p.z); scene.add(st);
      const el = document.createElement('button'); el.type = 'button'; el.className = 'o3-lab w3-lab'; el.dataset.k = k; el.textContent = nm;
      el.addEventListener('click', () => pick(k)); stage.appendChild(el);
      s.label(el, () => new T.Vector3(p.x, p.y - 0.95, p.z)); labs[k] = el;
    });
    // 층 이름표(받침 앞 가장자리)
    TY.forEach((y, i) => {
      const el = document.createElement('span'); el.className = 'o3-lab w3-tier'; el.style.borderColor = LV[i]; el.textContent = LVN[i];
      stage.appendChild(el);
      const a = -1.32 + i * 0.03;
      s.label(el, new T.Vector3(Math.sin(a) * (TR[i] + 0.1), y - 0.05, Math.cos(a) * (TR[i] + 0.1)));
    });

    // ---- 화살표: 먹히는 생물 → 먹는 생물 ----
    const ARC = new T.Color('#c9962e'), IN = new T.Color('#e0701c'), OUT = new T.Color('#2a63c9'), CH = new T.Color('#d9483b');
    const arrows = LINKS.map(([a, b]) => {
      const A = pos[a], B = pos[b];
      const mid = A.clone().add(B).multiplyScalar(0.5);
      const out = new T.Vector3(mid.x, 0, mid.z); if (out.length() < 0.01) out.set(0, 0, 1); out.normalize();
      const ctrl = mid.clone().add(out.multiplyScalar(0.9)).add(new T.Vector3(0, 0.5, 0));
      const curve = new T.QuadraticBezierCurve3(A, ctrl, B);
      const pts = curve.getPoints(40).filter((q) => q.distanceTo(A) > 0.62 && q.distanceTo(B) > 0.78);
      const path = new T.CatmullRomCurve3(pts);
      const m = new T.MeshStandardMaterial({ color: ARC.clone(), roughness: 0.5, transparent: true, opacity: 0.95 });
      const tube = new T.Mesh(new T.TubeGeometry(path, 40, 0.045, 6, false), m);
      const end = pts[pts.length - 1], dir = end.clone().sub(pts[pts.length - 2]).normalize();
      const head = new T.Mesh(new T.ConeGeometry(0.14, 0.34, 10), m);
      head.position.copy(end); head.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), dir);
      const g = new T.Group(); g.add(tube, head); scene.add(g);
      return { a, b, m, g };
    });

    let sel = null, md = 'all', gone = null;
    const paintArrows = () => {
      arrows.forEach((r) => {
        let col = ARC, op = 0.95, w = 1;
        if (md === 'chain') { const i = CHAIN.indexOf(r.a); const on = i >= 0 && CHAIN[i + 1] === r.b; col = on ? CH : ARC; op = on ? 1 : 0.1; w = on ? 1.7 : 1; }
        else if (md === 'gone' && gone) { const on = r.a === gone || r.b === gone; col = on ? new T.Color('#9aa0aa') : ARC; op = on ? 0.18 : 0.95; }
        else if (sel) { const inn = r.b === sel, out = r.a === sel; col = inn ? IN : out ? OUT : ARC; op = inn || out ? 1 : 0.1; w = inn || out ? 1.6 : 1; }
        r.m.color.copy(col); r.m.opacity = op; r.g.scale.setScalar(1); r.g.children[0].scale.setScalar(1);
        r.g.visible = op > 0.05;
        r.g.children.forEach((c) => { c.material = r.m; });
        r.w = w;
      });
      Object.entries(sprites).forEach(([k, sp]) => {
        let on = true;
        if (md === 'chain') on = CHAIN.includes(k);
        else if (md === 'gone' && gone) on = k !== gone;
        else if (sel) on = k === sel || arrows.some((r) => (r.a === sel && r.b === k) || (r.b === sel && r.a === k));
        sp.material.opacity = on ? 1 : 0.25;
        labs[k].classList.toggle('dim', !on); labs[k].classList.toggle('o3-pick', k === sel || (md === 'gone' && k === gone));
      });
      btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === md)));
      if (!s.active) s.render();
    };
    const names = (arr) => arr.map((k) => SP[k][0]).join('·');
    function pick(k) {
      if (md === 'gone') { gone = gone === k ? null : k; sayGone(); paintArrows(); root.dispatchEvent(new CustomEvent('w3-pick', { detail: k })); return; }
      if (md === 'chain') md = 'all';
      sel = k;
      const [nm, , , lvs, , , d] = SP[k];
      const eats = arrows.filter((r) => r.b === k).map((r) => r.a), by = arrows.filter((r) => r.a === k).map((r) => r.b);
      cap.innerHTML = `<span class="chip w3-lv" style="border-color:${LV[lvs[lvs.length - 1]]}">${lvs.map((l) => LVN[l]).join(' · ')}</span><b class="w3-nm">${nm}</b><span class="w3-d">${d}</span>`
        + `<span class="w3-io">${eats.length ? `<i class="w3-in">먹는 것: ${names(eats)}</i>` : '<i class="w3-in">먹는 것: 없음(스스로 만든다)</i>'}${by.length ? `<i class="w3-out">먹히는 상대: ${names(by)}</i>` : '<i class="w3-out">이 그물에서 먹는 상대 없음</i>'}</span>`;
      paintArrows();
      root.dispatchEvent(new CustomEvent('w3-pick', { detail: k }));
    }
    function sayGone() {
      if (!gone) { cap.innerHTML = '<span class="w3-d">사라지게 할 생물을 눌러 보자. 그 생물과 이어진 화살표가 끊긴다.</span>'; return; }
      const nm = SP[gone][0];
      const preds = arrows.filter((r) => r.a === gone).map((r) => r.b), prey = arrows.filter((r) => r.b === gone).map((r) => r.a);
      const alone = preds.filter((p) => arrows.filter((r) => r.b === p && r.a !== gone).length === 0);
      const more = preds.filter((p) => !alone.includes(p));
      const row = (cls, who, say) => `<i class="${cls}"><b>${names(who)}</b> ${say}</i>`;
      cap.innerHTML = `<span class="chip w3-gone">사라짐</span><b class="w3-nm">${nm}</b><span class="w3-io">`
        + (prey.length ? row('w3-in', prey, '— 덜 먹혀 늘어날 수 있다') : '')
        + (more.length ? row('w3-out', more, '— 다른 먹이가 있어 버틴다') : '')
        + (alone.length ? row('w3-x', alone, '— 먹이가 없어져 위험하다') : '')
        + (!preds.length && !prey.length ? '<i>이어진 생물이 없다</i>' : '') + '</span>';
    }
    function mode(m) {
      md = m; sel = null; gone = null;
      if (m === 'chain') cap.innerHTML = '<span class="chip w3-chain">먹이 사슬</span><span class="w3-d">벼 → 메뚜기 → 개구리 → 뱀 → 매: 한 줄로 이어진 <b>먹이 사슬</b>. 실제 생태계에서는 이런 사슬 여러 개가 얽혀 <b>먹이그물</b>을 이룬다.</span>';
      else if (m === 'gone') sayGone();
      else cap.innerHTML = '<span class="w3-d">생물을 눌러 보자. <b class="w3-in">주황</b> = 그 생물이 먹는 것, <b class="w3-out">파랑</b> = 그 생물을 먹는 상대.</span>';
      paintArrows();
    }
    btns.forEach((b) => b.addEventListener('click', () => mode(b.dataset.k)));
    function clickAt(e) { const hit = s.pick(e, Object.values(sprites)); if (hit && hit.object.userData.k) pick(hit.object.userData.k); }
    let t = 0;
    function tick(dt) { t += dt; Object.values(sprites).forEach((sp, i) => { sp.position.y = pos[sp.userData.k].y + Math.sin(t * 1.4 + i) * 0.04; }); }
    mode('all');
    root._w3 = { pick, mode, s, labs };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.EcoWeb3D = { mount, token };
})();
