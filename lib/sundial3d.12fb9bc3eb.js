/* 1-1 1차시 체험 «3D 앙부일구»(교과서 16쪽 그림 I-2). 솥처럼 오목한 그릇 안쪽에 시각선(세로)과 절기선(가로)이 있고,
   북극을 가리키는 영침 끝의 그림자가 시각과 절기를 함께 알려 준다. 위도 37.5°(서울)의 실제 해 위치로 계산한다.
   시간 막대(5~19시)·계절 단추(여름·봄가을·겨울)·구름 단추. 빈 곳을 끌면 돌려 보고, 바퀴·두 손가락으로 다가간다.
   Sundial.mount(root) → { setActive, fit } · 시험용: root._sd.set(시각) · season(적위°) · cloud(켜기) · read() */
(function () {
  'use strict';
  const D2R = Math.PI / 180, LAT = 37.5 * D2R, R = 4;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // 해 방향(단위 벡터): x 동쪽, y 위, z 남쪽
  function sunDir(T, h, dec) {
    const H = (h - 12) * 15 * D2R, d = dec * D2R;
    const east = -Math.cos(d) * Math.sin(H), north = Math.cos(LAT) * Math.sin(d) - Math.sin(LAT) * Math.cos(d) * Math.cos(H), up = Math.sin(LAT) * Math.sin(d) + Math.cos(LAT) * Math.cos(d) * Math.cos(H);
    return new T.Vector3(east, up, -north);
  }
  // 영침 끝(그릇 중심, 원점)에서 해 반대쪽으로 그릇 안쪽 면과 만나는 점
  const shadowAt = (T, dir) => dir.clone().multiplyScalar(-R * 0.995);
  const HOURS = ['', '', '', '', '', '', '묘', '묘', '진', '진', '사', '사', '오', '오', '미', '미', '신', '신', '유', '유'];

  function mount(root) {
    const stage = root.querySelector('.sd-stage'), cv = stage.querySelector('canvas');
    const range = root.querySelector('.sd-range'), clock = root.querySelector('.sd-clock'), now = root.querySelector('.sd-now');
    const read = root.querySelector('.sd-read'), cloudBtn = root.querySelector('.sd-cloud'), seasons = [...root.querySelectorAll('.sd-season button')];
    let h = 7.5, dec = 0, cloud = false;
    const s = window.Scene3D.make(stage, cv, { view: { yaw: 0.25, pitch: 0.6, dist: 21, target: [0, -0.6, 0] }, min: 7, max: 34, pmin: 0.15, pmax: 1.4 });
    if (!s.ok) return { setActive() {}, fit() {} };
    const { T, scene } = s;
    scene.add(new T.HemisphereLight(0xffffff, 0x9aa49a, 1.15));
    const light = new T.DirectionalLight(0xfff2d8, 1.6); scene.add(light); scene.add(light.target);
    // 받침과 다리
    const bronze = new T.MeshStandardMaterial({ color: 0xa8843f, metalness: 0.55, roughness: 0.45, side: T.DoubleSide });
    const inner = new T.MeshStandardMaterial({ color: 0xd8bf7a, metalness: 0.25, roughness: 0.7, side: T.BackSide });
    const bowlO = new T.Mesh(new T.SphereGeometry(R + 0.12, 64, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), bronze); scene.add(bowlO);
    const bowlI = new T.Mesh(new T.SphereGeometry(R, 64, 32, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), inner); scene.add(bowlI);
    const rim = new T.Mesh(new T.TorusGeometry(R + 0.06, 0.14, 12, 96), bronze); rim.rotation.x = Math.PI / 2; scene.add(rim);
    const plate = new T.Mesh(new T.BoxGeometry(7.4, 1.1, 7.4), new T.MeshStandardMaterial({ color: 0x9a968c, roughness: 0.95 }));
    plate.position.y = -R - 2.15; scene.add(plate);
    plate.add(new T.LineSegments(new T.EdgesGeometry(plate.geometry), new T.LineBasicMaterial({ color: 0x4a4740 })));
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + Math.PI / 4, leg = new T.Mesh(new T.CylinderGeometry(0.16, 0.24, 2.4, 10), bronze);
      leg.position.set(Math.cos(a) * 2.9, -R + 0.2 - 0.6, Math.sin(a) * 2.9); leg.rotation.z = Math.cos(a) * 0.35; leg.rotation.x = -Math.sin(a) * 0.35; scene.add(leg);
    }
    // 방위 글자(바닥)
    // 영침: 북쪽 테두리에서 그릇 중심까지, 하늘의 북극(고도 37.5°)을 가리킨다
    const pole = new T.Vector3(0, Math.sin(LAT), -Math.cos(LAT));
    const gBase = pole.clone().multiplyScalar(R * 0.98), gnomon = new T.Mesh(new T.CylinderGeometry(0.05, 0.07, R * 0.98, 10), new T.MeshStandardMaterial({ color: 0x3b3226, metalness: 0.3, roughness: 0.6 }));
    gnomon.position.copy(gBase.clone().multiplyScalar(0.5)); gnomon.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), pole); scene.add(gnomon);
    const tip = new T.Mesh(new T.SphereGeometry(0.1, 12, 8), new T.MeshBasicMaterial({ color: 0x3b3226 })); scene.add(tip);
    // 영침 받침: 북쪽 테두리에서 영침 끝 쪽으로
    const foot = new T.Vector3(0, 0.05, -R), arm = gBase.clone().sub(foot);
    const prop = new T.Mesh(new T.CylinderGeometry(0.07, 0.09, arm.length(), 8), bronze);
    prop.position.copy(foot.clone().add(arm.clone().multiplyScalar(0.5))); prop.quaternion.setFromUnitVectors(new T.Vector3(0, 1, 0), arm.clone().normalize()); scene.add(prop);
    // 그릇 안쪽 선: 시각선(5~19시, 절기 따라) · 절기선(하지·춘추분·동지)
    const lineMat = (c, o = 1) => new T.LineBasicMaterial({ color: c, transparent: o < 1, opacity: o });
    const curve = (pts, m) => { const l = new T.Line(new T.BufferGeometry().setFromPoints(pts), m); scene.add(l); return l; };
    const hourLines = [];
    for (let hr = 6; hr <= 18; hr++) {
      const pts = []; for (let d = -23.4; d <= 23.41; d += 1.17) { const v = sunDir(T, hr, d); if (v.y > -0.02) pts.push(shadowAt(T, v).multiplyScalar(0.985)); }
      if (pts.length > 1) hourLines.push({ hr, l: curve(pts, lineMat(0x3b2a12, 0.9)), end: pts[pts.length - 1] });
    }
    const decLines = [[23.4, '하지'], [0, '춘분·추분'], [-23.4, '동지']].map(([d, n]) => {
      const pts = []; for (let t = 4.5; t <= 19.5; t += 0.1) { const v = sunDir(T, t, d); if (v.y > 0) pts.push(shadowAt(T, v).multiplyScalar(0.985)); }
      return { d, n, l: curve(pts, lineMat(0x8a4a12, 0.75)), mid: pts[Math.floor(pts.length * 0.8)] };
    });
    // 그림자: 영침 몸의 그림자(굵은 선) + 끝 그림자 점
    const shMat = new T.MeshBasicMaterial({ color: 0x1a140c, transparent: true, opacity: 0.72 });
    let shLine = new T.Mesh(new T.BufferGeometry(), shMat); scene.add(shLine);
    const shPts = new Array(24).fill(0).map(() => new T.Vector3());
    const shDot = new T.Mesh(new T.SphereGeometry(0.17, 16, 10), new T.MeshBasicMaterial({ color: 0xd9483b })); scene.add(shDot);
    // 해와 구름
    const sun = new T.Mesh(new T.SphereGeometry(0.5, 24, 16), new T.MeshBasicMaterial({ color: 0xffcf3a })); scene.add(sun);
    const halo = new T.Mesh(new T.SphereGeometry(0.85, 24, 16), new T.MeshBasicMaterial({ color: 0xffe9a0, transparent: true, opacity: 0.35 })); sun.add(halo);
    const cloudG = new T.Group(); scene.add(cloudG);
    const cm = new T.MeshLambertMaterial({ color: 0xf4f6f8, transparent: true, opacity: 0.95 });
    [[0, 0, 0, 1.6], [1.5, -0.2, 0.3, 1.2], [-1.4, -0.3, 0.2, 1.1], [0.6, 0.6, -0.2, 1.1]].forEach(([x, y, z, r]) => { const b = new T.Mesh(new T.SphereGeometry(r, 18, 12), cm); b.position.set(x, y, z); cloudG.add(b); });
    // 이름표
    const lab = (cls, txt, at) => { const e = document.createElement('span'); e.className = 'g3-label sd-lab ' + cls; e.textContent = txt; stage.appendChild(e); s.label(e, at); return e; };
    lab('', '영침', gBase.clone().multiplyScalar(0.62).add(new T.Vector3(0.5, 0.4, 0)));
    const nLab = lab('dir', '북', new T.Vector3(0, 0.3, -R - 0.9)); lab('dir', '남', new T.Vector3(0, 0.3, R + 0.9)); lab('dir', '동', new T.Vector3(R + 0.9, 0.3, 0)); lab('dir', '서', new T.Vector3(-R - 0.9, 0.3, 0)); void nLab;
    hourLines.filter((x) => x.hr % 2 === 0).forEach((x) => lab('hr', `${x.hr}시`, x.end.clone().multiplyScalar(0.9).add(new T.Vector3(0, 0.3, 0))));
    decLines.forEach((x) => lab('dec', x.n, x.mid.clone().multiplyScalar(0.86)));
    const shLab = lab('sh', '그림자 끝', new T.Vector3());
    s.label(shLab, () => shDot.position.clone().multiplyScalar(0.8).add(new T.Vector3(0, 0.5, 0)));
    const done = new Set();
    function update() {
      const dir = sunDir(T, h, dec), up = dir.y > 0;
      sun.position.copy(dir).multiplyScalar(12.5); sun.visible = up;
      light.position.copy(dir).multiplyScalar(30); light.intensity = up ? (cloud ? 0.25 : 1.8) : 0;
      cloudG.position.copy(dir).multiplyScalar(11.6); cloudG.lookAt(0, 0, 0); cloudG.visible = cloud && up;
      const day = clamp(dir.y * 3, 0, 1) * (cloud ? 0.6 : 1);
      s.renderer.setClearColor(new T.Color('#1c2744').lerp(new T.Color(cloud ? '#c9d2da' : '#cfe7f3'), day), 1);
      const show = up && !cloud;
      shLine.visible = show; shDot.visible = show; shLab.style.display = show ? '' : 'none';
      if (show) {
        const n = shPts.length;
        for (let i = 0; i < n; i++) {
          const q = gBase.clone().multiplyScalar(i / (n - 1)); // 영침 위의 점 → 해 반대쪽으로 쏜 빛이 그릇 면과 만나는 곳
          const d = dir.clone().negate(), b = 2 * q.dot(d), c = q.lengthSq() - R * R, u = (-b + Math.sqrt(b * b - 4 * c)) / 2;
          shPts[i].copy(q.clone().add(d.multiplyScalar(u)).multiplyScalar(0.97));
        }
        // 그릇 테두리 위(허공)에 떨어지는 부분은 빼고 그릇 안쪽 면에 닿는 부분만 그린다
        const inBowl = shPts.filter((p) => p.y <= 0.02);
        shLine.visible = inBowl.length > 1;
        if (inBowl.length > 1) { shLine.geometry.dispose(); shLine.geometry = new T.TubeGeometry(new T.CatmullRomCurve3(inBowl), 40, 0.07, 6, false); } shDot.position.copy(shadowAt(T, dir).multiplyScalar(0.98));
      }
      const hh = Math.floor(h), mm = Math.round((h - hh) * 60 / 5) * 5;
      clock.textContent = `${hh < 12 ? '오전' : '오후'} ${hh > 12 ? hh - 12 : hh}시 ${mm % 60 ? mm % 60 + '분' : ''}`.trim();
      const sname = { 23.4: '여름(하지)', 0: '봄·가을(춘분·추분)', '-23.4': '겨울(동지)' }[dec];
      read.innerHTML = !up ? '<b>해가 졌다</b> — 그림자가 없어 시각을 읽을 수 없다'
        : cloud ? '<b>구름이 해를 가렸다</b> — 그림자가 사라져 시각을 읽을 수 없다'
          : `그림자 끝 → <b>${hh}시 줄</b>(옛 이름 «${HOURS[hh] || ''}시») 근처 · 절기선: <b>${sname}</b>`;
      if (up && !cloud && Math.abs(h - 12) < 0.26) done.add(1);
      if (done.has(1) && dec !== 0 && up && !cloud) done.add(2);
      if (done.has(2) && (cloud || !up)) done.add(3);
      const st = [1, 2, 3].find((k) => !done.has(k)) || 0;
      window.L1.steps(root, st, [...done]); window.L1.done(root, st === 0);
      now.textContent = st === 1 ? '① 시간 막대로 그림자 끝을 «12시» 줄에 맞추자' : st === 2 ? '② 계절 단추를 바꿔 그림자 끝이 어느 가로줄로 가는지 보자' : st === 3 ? '③ 구름을 띄우거나 해를 지게 해 보자' : '해시계는 해가 있어야 시각을 알려 준다';
      now.classList.toggle('done', st === 0);
      s.render();
    }
    range.addEventListener('input', () => { h = +range.value; update(); });
    seasons.forEach((b) => b.addEventListener('click', () => { dec = +b.dataset.d; seasons.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); update(); }));
    cloudBtn.addEventListener('click', () => { cloud = !cloud; cloudBtn.setAttribute('aria-pressed', String(cloud)); update(); });
    root.querySelector('.sd-home').addEventListener('click', () => s.look({ yaw: 0.25, pitch: 0.6, dist: 21, target: [0, -0.6, 0] }));
    range.value = String(h); update();
    root._sd = { set: (v) => { h = v; range.value = String(v); update(); }, season: (d) => seasons.find((b) => +b.dataset.d === d).click(), cloud: (on) => { if (cloud !== !!on) cloudBtn.click(); }, read: () => read.textContent };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.Sundial = { mount };
})();
