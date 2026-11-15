/* 사물 인터넷(교과서 145쪽 그림 Ⅲ-4): 3D 스마트 홈. 앞벽을 걷어 낸 집 안에 조명·냉방기·현관 잠금·온도와 밝기 센서·공유기가 있다.
   하늘의 해를 끌면(←·→ 키도) 시각이 바뀌고, 센서 값이 공유기를 거쳐 휴대 전화로 간다(파란 알갱이). 전화의 규칙을 켜 두면 집이 스스로 반응한다.
   소파의 사람을 누르면 집을 나서 버스 정류장으로 가고, 다시 누르면 돌아온다. 집 밖에서도 전화로 조명·냉방·잠금을 조절한다(인터넷 → 공유기 → 기기).
   온도 = 23 + 9·sin(π(시각−9)/12) − 1 (이해를 돕기 위한 예). */
(function () {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const OUT = [[-3.4, -2.2], [-1.4, 0.9], [3.2, 0.9], [5.0, 0.9], [7.2, 0.9], [7.2, 4.8], [8.4, 5.4]];

  function mount(root) {
    const stage = root.querySelector('.ih-stage'), canvas = stage.querySelector('canvas');
    const labs = Object.fromEntries([...stage.querySelectorAll('.ih-lab')].map((e) => [e.dataset.k, e]));
    const now = stage.querySelector('.ih-now'), clock = stage.querySelector('.ih-clock');
    const ph = root.querySelector('.ih-phone'), where = ph.querySelector('.ih-where'), log = ph.querySelector('.ih-log');
    const sens = Object.fromEntries([...ph.querySelectorAll('.ih-s')].map((e) => [e.dataset.k, e]));
    const ruleB = Object.fromEntries([...ph.querySelectorAll('.ih-rule')].map((e) => [e.dataset.k, e]));
    const ctlB = Object.fromEntries([...ph.querySelectorAll('.ih-btn')].map((e) => [e.dataset.k, e]));
    const s = window.Scene3D.make(stage, canvas, { view: { yaw: 0.4, pitch: 0.44, dist: 26, target: [1.2, 2.6, 1.0] }, fov: 34, min: 16, max: 40, pmax: 1.15, shadows: true, onFrame: frame, click: tap });
    if (!s.ok) return { setActive() {}, fit() {} };
    const { T, scene, inked, mat, group } = s;
    const V = (x, y, z) => new T.Vector3(x, y, z);
    const box = (w, h, d, c, x, y, z, p) => { const m = inked(new T.BoxGeometry(w, h, d), c); m.position.set(x, y, z); (p || scene).add(m); return m; };
    // 마당·길·정류장·나무
    const ground = new T.Mesh(new T.PlaneGeometry(60, 44), mat('#cfe0b4')); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
    const road = new T.Mesh(new T.PlaneGeometry(60, 3.2), mat('#a3a9b0')); road.rotation.x = -Math.PI / 2; road.position.set(0, 0.02, 8.2); road.receiveShadow = true; scene.add(road);
    [[5.6, 0.9, 3.4, 1.1], [7.2, 3.6, 1.1, 5.4]].forEach(([x, z, w, d]) => { const m = new T.Mesh(new T.BoxGeometry(w, 0.08, d), mat('#e8e1d0')); m.position.set(x, 0.04, z); m.receiveShadow = true; scene.add(m); });
    const stop = group(); stop.position.set(9.0, 0, 5.9);
    box(0.12, 2.6, 0.12, '#3a3f4b', 0, 1.3, 0, stop); box(0.9, 0.6, 0.08, '#3a78c2', 0, 2.5, 0, stop); box(1.6, 0.12, 0.5, '#8c6b4b', -1.1, 0.55, 0.1, stop);
    [[-10, -2.5, 1.6], [-9, 5.5, 1.3], [10.5, -3, 1.5], [-2, -8.5, 1.4]].forEach(([x, z, r]) => { box(0.35, 1.4, 0.35, '#8c6b4b', x, 0.7, z); const f = inked(new T.SphereGeometry(r, 14, 10), '#7fae6a'); f.position.set(x, 1.4 + r * 0.8, z); scene.add(f); });
    // 집(앞벽을 걷어 냄)
    const F = 0.3, WH = 3.2, wy = F + WH / 2;
    box(10, F, 7, '#e9dcc3', -1, F / 2, -0.5);
    box(10, WH, 0.25, '#f4efe6', -1, wy, -4);
    box(0.25, WH, 7, '#f4efe6', -6, wy, -0.5);
    box(0.25, WH, 4.2, '#f4efe6', 4, wy, -1.9); box(0.25, WH, 1.4, '#f4efe6', 4, wy, 2.3); box(0.25, 0.9, 1.4, '#f4efe6', 4, F + WH - 0.45, 0.9);
    box(10, 0.45, 0.22, '#f4efe6', -1, F + 0.22, 3);
    const win = box(2.4, 1.4, 0.06, '#bfe0f2', -3.2, 2.2, -3.86);
    // 가구
    box(2.6, 0.5, 1.0, '#7a9cc6', -3.4, F + 0.25, -2.9); box(2.6, 0.8, 0.3, '#6a8bb5', -3.4, F + 0.65, -3.45); box(0.3, 0.7, 1.0, '#6a8bb5', -4.85, F + 0.35, -2.9); box(0.3, 0.7, 1.0, '#6a8bb5', -1.95, F + 0.35, -2.9);
    const rug = new T.Mesh(new T.PlaneGeometry(3.4, 2.2), mat('#e6c9a8')); rug.rotation.x = -Math.PI / 2; rug.position.set(-3.2, F + 0.01, -1.1); scene.add(rug);
    box(1.2, 0.35, 0.7, '#b58b60', -3.2, F + 0.18, -1.1);
    const pot = box(0.5, 0.5, 0.5, '#c96f55', 3.1, F + 0.25, 2.3); const leaf = inked(new T.SphereGeometry(0.5, 12, 9), '#7fae6a'); leaf.position.set(3.1, F + 0.95, 2.3); scene.add(leaf); void pot;
    // 조명(천장에서 늘어진 등)
    const cord = new T.Line(new T.BufferGeometry().setFromPoints([V(-1.4, F + WH + 0.6, -1.2), V(-1.4, F + 2.55, -1.2)]), new T.LineBasicMaterial({ color: 0x3a3f4b })); scene.add(cord);
    const shade = inked(new T.ConeGeometry(0.55, 0.45, 18, 1, true), mat('#3a3f4b', { side: T.DoubleSide })); shade.position.set(-1.4, F + 2.35, -1.2); scene.add(shade);
    const bulb = new T.Mesh(new T.SphereGeometry(0.2, 16, 12), new T.MeshBasicMaterial({ color: 0xd9d4c8 })); bulb.position.set(-1.4, F + 2.12, -1.2); scene.add(bulb);
    const lampL = new T.PointLight(0xffd27a, 0, 14, 1.4); lampL.position.set(-1.4, F + 2.0, -1.2); scene.add(lampL);
    // 냉방기(왼벽)와 찬 바람
    const ac = box(0.36, 0.55, 1.8, '#ffffff', -5.7, F + 2.5, -1.2);
    const louver = new T.Mesh(new T.BoxGeometry(0.05, 0.1, 1.6), new T.MeshBasicMaterial({ color: 0x9aa3ae })); louver.position.set(-5.5, F + 2.28, -1.2); scene.add(louver);
    const airMat = new T.MeshBasicMaterial({ color: 0x6cc4ec, transparent: true, opacity: 0.7 });
    const air = Array.from({ length: 16 }, (_, i) => { const m = new T.Mesh(new T.SphereGeometry(0.07, 8, 6), airMat); m.userData.u = i / 16; m.userData.z = -1.9 + (i % 4) * 0.45; m.visible = false; scene.add(m); return m; });
    // 현관문(경첩 x=4, z=0.2)과 잠금
    const door = group(); door.position.set(4, F, 0.2);
    box(0.1, 2.25, 1.4, '#b7a48c', 0, 1.13, 0.7, door);
    box(0.12, 0.32, 0.2, '#2b3242', 0.1, 1.15, 1.18, door);
    const led = new T.Mesh(new T.SphereGeometry(0.06, 10, 8), new T.MeshBasicMaterial({ color: 0xd9483b })); led.position.set(0.17, 1.22, 1.18); door.add(led);
    // 센서와 공유기
    box(0.42, 0.52, 0.12, '#ffffff', 0.6, F + 1.9, -3.82);
    const sled = new T.Mesh(new T.SphereGeometry(0.06, 10, 8), new T.MeshBasicMaterial({ color: 0x2f9e5b })); sled.position.set(0.6, F + 2.06, -3.74); scene.add(sled);
    box(1.2, 0.08, 0.5, '#b58b60', 2.6, F + 1.3, -3.65);
    box(0.72, 0.18, 0.42, '#2b3242', 2.6, F + 1.43, -3.65);
    [-0.2, 0.2].forEach((dx) => box(0.05, 0.5, 0.05, '#2b3242', 2.6 + dx, F + 1.75, -3.8));
    const rled = new T.Mesh(new T.SphereGeometry(0.06, 10, 8), new T.MeshBasicMaterial({ color: 0x9aa3ae })); rled.position.set(2.9, F + 1.45, -3.43); scene.add(rled);
    const P = { sensor: V(0.6, F + 1.9, -3.7), router: V(2.6, F + 1.5, -3.5), sky: V(2.6, 9, -3.5), lamp: V(-1.4, F + 2.2, -1.2), ac: V(-5.5, F + 2.5, -1.2), lock: V(4.15, F + 1.15, 1.38) };
    s.label(labs.sensor, V(0.6, F + 2.7, -3.7)); s.label(labs.router, V(2.6, F + 2.35, -3.5)); s.label(labs.lock, V(4.2, F + 2.6, 1.2)); s.label(labs.ac, V(-5.5, F + 3.3, -1.2));
    // 사람
    const man = group(); const shirt = mat('#d9776b');
    const torso = inked(new T.CylinderGeometry(0.3, 0.34, 1.0, 14), shirt); torso.position.y = 1.15; man.add(torso);
    const headM = inked(new T.SphereGeometry(0.3, 16, 12), '#f2d2b3'); headM.position.y = 1.95; man.add(headM);
    const legs = [-0.14, 0.14].map((z) => { const l = inked(new T.BoxGeometry(0.18, 0.65, 0.18), '#3a3f4b'); l.position.set(0, 0.33, z); man.add(l); return l; });
    const hitBox = new T.Mesh(new T.BoxGeometry(1.2, 2.4, 1.2), new T.MeshBasicMaterial({ visible: false })); hitBox.position.y = 1.2; man.add(hitBox);
    s.label(labs.person, () => V(man.position.x, man.position.y + 2.7, man.position.z));
    // 상태
    const st = { rules: { dark: false, hot: false, away: false }, man: { lamp: false, ac: false, lock: false }, lamp: false, acOn: false, lock: false, away: false, walking: 0, wi: 0, dir: 1, seat: true };
    const flags = { dark: false, rule: false, out: false, remote: false, hot: false };
    const packets = [];
    let rig = null, ready = false, prev = { light: '', temp: null }, pkCool = 0, doorA = 0, tm = 0;
    const word = (day) => (day > 0.55 ? '밝음' : day > 0.18 ? '조금 어두움' : '어두움');
    const tempOf = (t) => 23 + 9 * Math.sin(Math.PI * (t - 9) / 12) - 1;
    function packet(a, b, then) {
      const m = new T.Mesh(new T.SphereGeometry(0.16, 12, 9), new T.MeshBasicMaterial({ color: 0x2a8fb8, transparent: true, depthTest: false })); m.renderOrder = 12; scene.add(m);
      packets.push({ m, a: a.clone(), b: b.clone(), u: 0, then });
    }
    function flash(e) { e.classList.remove('flash'); void e.offsetWidth; e.classList.add('flash'); }
    const say = (t) => { log.textContent = t; flash(log); };
    const upload = () => { packet(P.sensor, P.router, () => { rled.material.color.set(0x2f9e5b); packet(P.router, P.sky, () => { rled.material.color.set(0x9aa3ae); }); }); };
    const remote = (to, then) => packet(P.sky, P.router, () => { rled.material.color.set(0x2f9e5b); packet(P.router, to, () => { rled.material.color.set(0x9aa3ae); then(); }); });
    function apply(why) {
      const day = clamp(rig.el * 3, 0, 1), raw = tempOf(rig.t);
      const lamp = st.rules.dark ? day < 0.3 : st.man.lamp, acOn = st.rules.hot ? raw > 28 : st.man.ac;
      if (lamp !== st.lamp && st.rules.dark && why !== 'btn') say(lamp ? '규칙: 집 안이 어두워져서 조명을 켰다' : '규칙: 밝아져서 조명을 껐다');
      if (acOn !== st.acOn && st.rules.hot && why !== 'btn') say(acOn ? '규칙: 28 °C를 넘어 냉방기를 켰다' : '규칙: 시원해져서 냉방기를 껐다');
      st.lamp = lamp; st.acOn = acOn;
      bulb.material.color.set(lamp ? 0xffe28a : 0xd9d4c8); lampL.intensity = lamp ? 2.6 : 0;
      louver.material.color.set(acOn ? 0x2a8fb8 : 0x9aa3ae); air.forEach((m) => { m.visible = acOn; });
      const temp = Math.round(acOn ? Math.min(raw, 25) : raw);
      const lw = word(day) + (lamp ? ' · 조명 켬' : '');
      sens.light.querySelector('b').textContent = lw; sens.temp.querySelector('b').textContent = `${temp} °C${acOn ? ' · 냉방 중' : ''}`;
      sens.temp.classList.toggle('hot', !acOn && temp > 28);
      sens.door.querySelector('b').textContent = st.lock ? '잠김' : '열림'; sens.door.classList.toggle('warn', st.away && !st.lock);
      led.material.color.set(st.lock ? 0x2f9e5b : 0xd9483b);
      ctlB.lamp.setAttribute('aria-pressed', String(lamp)); ctlB.ac.setAttribute('aria-pressed', String(acOn)); ctlB.lock.setAttribute('aria-pressed', String(st.lock));
      Object.entries(st.rules).forEach(([k, v]) => ruleB[k].setAttribute('aria-pressed', String(v)));
      where.textContent = st.away ? '나: 외출 중(정류장)' : st.walking ? '나: 이동 중' : '나: 집 안';
      labs.person.textContent = st.walking ? '걷는 중' : st.away ? '사람 · 눌러서 집으로' : '사람 · 눌러서 외출';
      if (lw !== prev.light) { if (prev.light) flash(sens.light); prev.light = lw; }
      if (temp !== prev.temp) { if (prev.temp !== null) flash(sens.temp); prev.temp = temp; }
      if (day < 0.3) flags.dark = true;
      if (st.rules.hot && raw > 28) flags.hot = true;
      const h = Math.floor(rig.t), mnt = Math.round((rig.t - h) * 60 / 10) * 10, hh = h + (mnt === 60 ? 1 : 0), mm = mnt === 60 ? 0 : mnt;
      clock.textContent = `${hh < 12 ? '오전' : '오후'} ${hh > 12 ? hh - 12 : hh}:${String(mm).padStart(2, '0')}`;
      chip();
    }
    function chip() {
      flags.rule = flags.rule || st.rules.dark;
      const list = [['dark', '① 해를 끌어 저녁으로 보내 보자'], ['rule', '② 전화에서 «어두워지면 → 조명 켜기»를 켜 보자'], ['out', '③ 소파의 사람을 눌러 외출시켜 보자'], ['remote', '④ 집 밖에서 전화로 문을 잠그거나 냉방을 켜 보자'], ['hot', '⑤ «28 °C» 규칙을 켜고 해를 한낮으로 끌어 보자']];
      const n = list.find(([k]) => !flags[k]);
      now.textContent = n ? n[1] : '센서 → 인터넷 → 전화 → 기기, 모두 이어졌다';
      now.classList.toggle('done', !n);
    }
    rig = window.Scene3D.sunRig(s, { R: 11, H: 0.75, south: 0.15, t0: 10, shadow: 16, onChange: () => { if (!ready) return; if (pkCool <= 0) { upload(); pkCool = 0.7; } apply('sun'); } });
    rig.ball.scale.setScalar(0.6);   // 집을 가리지 않게 작은 해
    canvas.addEventListener('keydown', (e) => { const d = { ArrowRight: 0.5, ArrowLeft: -0.5 }[e.key]; if (d) { e.preventDefault(); e.stopPropagation(); rig.set(rig.t + d); } });
    // 전화
    Object.entries(ruleB).forEach(([k, b]) => b.addEventListener('click', () => {
      st.rules[k] = !st.rules[k];
      if (k === 'away' && st.rules.away && st.away && !st.lock) { st.lock = true; say('규칙: 외출 중이라 문을 잠갔다'); }
      else say(st.rules[k] ? `규칙을 켰다: ${b.textContent.trim()}` : '규칙을 껐다');
      apply('rule');
    }));
    Object.entries(ctlB).forEach(([k, b]) => b.addEventListener('click', () => {
      const go = () => {
        if (k === 'lock') st.lock = !st.lock;
        else { if (k === 'lamp') st.rules.dark = false; else st.rules.hot = false; st.man[k] = k === 'lamp' ? !st.lamp : !st.acOn; }
        apply('btn');
        const nm = { lamp: '조명을', ac: '냉방기를', lock: '현관문을' }[k], on = k === 'lock' ? st.lock : k === 'lamp' ? st.lamp : st.acOn;
        say(st.away ? `집 밖에서 ${nm} ${k === 'lock' ? (on ? '잠갔다' : '열었다') : on ? '켰다' : '껐다'} — 인터넷 → 공유기 → 기기` : `전화로 ${nm} ${k === 'lock' ? (on ? '잠갔다' : '열었다') : on ? '켰다' : '껐다'}`);
        if (st.away) { flags.remote = true; chip(); }
      };
      remote(k === 'lamp' ? P.lamp : k === 'ac' ? P.ac : P.lock, go);
    }));
    // 사람 누르기
    function tap(e) {
      if (st.walking || !s.pick(e, [hitBox])) return;
      st.walking = 1; st.dir = st.away ? -1 : 1; st.wi = st.away ? OUT.length - 1 : 0; st.seat = false;
      if (!st.away && st.rules.away) say('집을 나선다 — 문이 닫히면 규칙이 잠근다');
      if (st.away && st.lock) { say('집에 다가오자 잠금이 풀린다'); }
      apply('walk');
    }
    function placeMan() {
      if (st.seat) { man.position.set(-3.4, F + 0.18, -2.75); man.rotation.y = -Math.PI / 2; legs.forEach((l) => { l.rotation.z = Math.PI / 2; l.position.set(0.3, 0.55, l.position.z); }); torso.position.y = 0.95; headM.position.y = 1.75; return; }
      legs.forEach((l) => { l.rotation.z = 0; l.position.set(0, 0.33, l.position.z); }); torso.position.y = 1.15; headM.position.y = 1.95;
    }
    function walk(dt) {
      if (!st.walking) return;
      const nx = st.wi + st.dir, tgt = OUT[nx];
      if (!tgt) {
        st.walking = 0;
        if (st.dir > 0) { st.away = true; flags.out = true; if (st.rules.away) { st.lock = true; say('규칙: 집을 나서서 문을 잠갔다'); } else say('알림: 외출 중인데 현관문이 열려 있어요!'); }
        else { st.away = false; st.seat = true; if (st.lock && st.rules.away) st.lock = false; say('집에 돌아왔다'); }
        placeMan(); apply('walk'); return;
      }
      const dx = tgt[0] - man.position.x, dz = tgt[1] - man.position.z, d = Math.hypot(dx, dz), v = 4.6 * dt;
      if (st.dir < 0 && st.lock && Math.hypot(man.position.x - 4, man.position.z - 0.9) < 3.2) { st.lock = false; apply('walk'); }
      man.rotation.y = Math.atan2(-dz, dx);
      legs.forEach((l, i) => { l.rotation.z = Math.sin(tm * 10 + i * Math.PI) * 0.5; });
      if (d <= v) { man.position.x = tgt[0]; man.position.z = tgt[1]; st.wi = nx; }
      else { man.position.x += dx / d * v; man.position.z += dz / d * v; }
      man.position.y = man.position.x > 4.1 ? 0 : F;
    }
    function frame(dt) {
      tm += dt; pkCool -= dt;
      walk(dt);
      // 문: 사람이 가까우면 연다
      const near = st.walking && Math.hypot(man.position.x - 4, man.position.z - 0.9) < 1.6;
      doorA += ((near ? 1 : 0) - doorA) * Math.min(1, dt * 6); door.rotation.y = -1.35 * doorA;
      sled.material.color.set(pkCool > 0.4 ? 0x2a8fb8 : 0x2f9e5b);
      air.forEach((m) => { if (!m.visible) return; const u = (m.userData.u + tm * 0.35) % 1; m.position.set(-5.4 + u * 3.2, F + 2.25 - u * u * 1.4, m.userData.z + Math.sin(u * 6 + m.userData.z) * 0.15); m.scale.setScalar(1 - u * 0.6); });
      for (let i = packets.length - 1; i >= 0; i--) {
        const q = packets[i]; q.u += dt * 1.6;
        const u = Math.min(1, q.u), mid = q.a.clone().lerp(q.b, u); mid.y += Math.sin(u * Math.PI) * 0.8; q.m.position.copy(mid);
        if (q.u >= 1) { scene.remove(q.m); q.m.geometry.dispose(); packets.splice(i, 1); if (q.then) q.then(); }
      }
    }
    placeMan(); ready = true; apply('init');
    root._home = { sun: () => { const p = s.toClient(rig.ball.position), r = canvas.getBoundingClientRect(); return [Math.round(p.x - r.left), Math.round(p.y - r.top), Math.round(r.width), Math.round(r.height)]; }, time: (t) => rig.set(t), rule: (k) => ruleB[k].click(), ctl: (k) => ctlB[k].click(), out: () => tap({ clientX: s.toClient(man.position.clone().setY(1.2)).x, clientY: s.toClient(man.position.clone().setY(1.2)).y }) };
    return { setActive: s.setActive, fit: s.fit };
  }
  window.SmartHome = { mount };
})();
