/* 3-1 4차시 체험 «지진 해일»(교과서 117쪽 지진의 피해 · 참고서 144쪽 지진 해일).
   넓은 단면: 먼바다(약 4000 m) → 비탈 → 대륙붕 → 해안 마을 → 언덕 위 대피소.
   바다 밑 단층 덩어리를 위로 끌어 올리면 해수면이 솟아 파가 양쪽으로 퍼진다.
   먼바다에서는 낮고 빠르게(배가 거의 못 느낌), 얕아질수록 느려지며 높아진다(빠르기 √(gd), 파고 ∝ 깊이^-1/4).
   마을 사람을 끌어 언덕 대피소로 옮기거나 해일 경보 탑을 누르면 스스로 올라간다.
   깊이·파고·시간은 이해를 돕기 위한 예. Tsunami.mount(root) → { fit, setActive } · 시험용: root._ts.quake(0~1) · evac() · alarm() · state() */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const SEA = 0.36, COAST = 0.72, PLAIN = 0.345, HILL0 = 0.84, HILL1 = 0.94, TOP = 0.16, SAFE = 0.91, TOWER = 0.79, F0 = 0.14, F1 = 0.28;
  const sm = (a, b, x) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
  // 바닥(바다 밑)·땅 높이(화면 비율, 아래로 클수록 깊다)
  const ground = (u) => {
    if (u < COAST) return u < 0.42 ? 0.88 : u < 0.58 ? 0.88 - 0.38 * sm(0.42, 0.58, u) : u < 0.71 ? 0.5 - 0.08 * (u - 0.58) / 0.13 : 0.42 - (0.42 - PLAIN) * (u - 0.71) / 0.01;
    return u < HILL0 ? PLAIN : u < HILL1 ? PLAIN - (PLAIN - TOP) * (u - HILL0) / (HILL1 - HILL0) : TOP;
  };
  const depth = (u) => Math.max(5, 4000 * Math.pow(Math.max(0, ground(Math.min(u, COAST - 0.001)) - SEA) / 0.52, 3)); // m
  const vel = (u) => 0.006 + 0.1 * Math.sqrt(depth(u) / 4000); // 화면 폭/초
  const amp = (a0, u) => a0 * Math.pow(4000 / depth(u), 0.25); // m
  // 자체 확인: 해안 쪽이 더 느리고 더 높다
  console.assert(vel(0.3) > vel(0.75) && amp(1, 0.75) > amp(1, 0.3), 'tsunami: 얕을수록 느리고 높다');

  function mount(root) {
    const stage = root.querySelector('.ts-stage'), now = root.querySelector('.ts-now'), out = root.querySelector('.ts-out');
    const P = window.Play;
    let lift, a0, waves, quaked, t, drag, people, alarmOn, alarmT, arrived, flood, lost, saw, msg, bgSky = null, bgGround = null, bgKey = '', uiT = 0;
    function reset() {
      lift = 0; a0 = 0; waves = []; quaked = false; t = 0; drag = null; alarmOn = false; alarmT = 0; arrived = false; flood = null; lost = -1; saw = false; msg = '';
      people = Array.from({ length: 6 }, (_, i) => ({ x: 0.728 + i * 0.013, st: 'home', ph: i * 1.3 }));
    }
    reset();
    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };
    const X = (u) => u * S.W, Y = (v) => v * S.H;
    const front = () => waves.find((w) => w.dir > 0);

    function paint(W, H) {
      const k = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const mk = () => { const cv = document.createElement('canvas'); cv.width = W * k; cv.height = H * k; const c = cv.getContext('2d'); c.setTransform(k, 0, 0, k, 0, 0); return [cv, c]; };
      const [sky, s] = mk();
      const g = s.createLinearGradient(0, 0, 0, H * SEA); g.addColorStop(0, '#8fc3e6'); g.addColorStop(1, '#e3f1f8'); s.fillStyle = g; s.fillRect(0, 0, W, H);
      [[0.12, 0.08, 1], [0.46, 0.12, 0.8], [0.7, 0.06, 0.9]].forEach(([x, y, r]) => { s.fillStyle = 'rgba(255,255,255,.85)'; [[0, 0, 18], [16, -6, 14], [30, 2, 12], [-14, 4, 11]].forEach(([dx, dy, rr]) => { s.beginPath(); s.arc(W * x + dx * r, H * y + dy * r, rr * r, 0, TAU); s.fill(); }); });
      const [gr, c] = mk();
      // 바다 밑과 땅(물 위에 덮어 그린다)
      c.beginPath(); c.moveTo(0, H);
      for (let u = 0; u <= 1.0001; u += 0.004) c.lineTo(W * u, H * ground(u));
      c.lineTo(W, H); c.closePath();
      const rock = c.createLinearGradient(0, H * 0.3, 0, H); rock.addColorStop(0, '#9b8466'); rock.addColorStop(0.5, '#6f5a43'); rock.addColorStop(1, '#4a3b2c'); c.fillStyle = rock; c.fill();
      c.save(); c.clip();
      for (let i = 0; i < 420; i++) { const x = ((i * 173) % 997) / 997 * W, y = H * (0.3 + ((i * 61) % 100) / 100 * 0.7); c.fillStyle = `rgba(${i % 3 ? 40 : 220},${i % 3 ? 30 : 200},${i % 3 ? 20 : 160},.14)`; c.fillRect(x, y, 2 + (i % 3), 1.5); }
      // 지층 줄
      c.strokeStyle = 'rgba(40,28,18,.25)'; c.lineWidth = 1;
      for (let j = 1; j < 6; j++) { c.beginPath(); for (let u = 0; u <= 1; u += 0.01) { const y = H * (ground(u) + j * 0.025) + Math.sin(u * 30 + j) * 2; u ? c.lineTo(W * u, y) : c.moveTo(0, y); } c.stroke(); }
      // 바다 밑 진흙 띠
      c.fillStyle = 'rgba(120,110,90,.55)'; c.beginPath(); for (let u = 0; u <= COAST; u += 0.004) c.lineTo(W * u, H * ground(u) + 5); for (let u = COAST; u >= 0; u -= 0.004) c.lineTo(W * u, H * ground(u)); c.fill();
      c.restore();
      // 땅 위 풀·모래사장
      c.fillStyle = '#e6d39a'; c.beginPath(); c.moveTo(W * 0.71, H * 0.42); c.lineTo(W * COAST, H * PLAIN); c.lineTo(W * 0.73, H * PLAIN); c.lineTo(W * 0.73, H * (PLAIN + 0.02)); c.fill();
      c.strokeStyle = '#5f9a45'; c.lineWidth = 5; c.beginPath(); for (let u = 0.728; u <= 1; u += 0.004) c.lineTo(W * u, H * ground(u)); c.stroke();
      // 언덕 나무
      for (let i = 0; i < 6; i++) { const u = 0.86 + i * 0.016, y = H * ground(u); c.fillStyle = '#6b4a2b'; c.fillRect(W * u - 1.5, y - 10, 3, 10); c.fillStyle = i % 2 ? '#3f7d36' : '#4f9442'; c.beginPath(); c.arc(W * u, y - 14, 7, 0, TAU); c.fill(); }
      // 마을 집
      [0.738, 0.762, 0.818].forEach((u, i) => { const y = H * PLAIN, w = 26 + i * 2, h = 19; c.fillStyle = ['#f2e2c4', '#e8d5b4', '#f5e8cf'][i]; c.fillRect(W * u - w / 2, y - h, w, h); c.fillStyle = ['#c0533b', '#3f6f9a', '#9a5a2e'][i]; c.beginPath(); c.moveTo(W * u - w / 2 - 3, y - h); c.lineTo(W * u, y - h - 11); c.lineTo(W * u + w / 2 + 3, y - h); c.fill(); c.fillStyle = '#7aa7c9'; c.fillRect(W * u - 4, y - h + 4, 6, 6); });
      // 대피소
      const sx = W * 0.972, sy = H * TOP;
      c.fillStyle = '#e9f2e4'; c.fillRect(sx - 20, sy - 22, 34, 22); c.fillStyle = '#2f7d4a'; c.beginPath(); c.moveTo(sx - 24, sy - 22); c.lineTo(sx - 3, sy - 34); c.lineTo(sx + 18, sy - 22); c.fill();
      P.txt(c, '대피소', sx - 3, sy - 40, '#1f5a34', '800 12px');
      // 단층 표시선(덩어리 양옆)
      c.strokeStyle = 'rgba(30,20,10,.7)'; c.lineWidth = 2; c.setLineDash([6, 4]);
      [F0, F1].forEach((u) => { c.beginPath(); c.moveTo(W * u, H * 0.88); c.lineTo(W * u + (u === F0 ? -14 : 14), H); c.stroke(); }); c.setLineDash([]);
      P.txt(c, '먼바다(깊이 약 4000 m)', W * 0.33, H * 0.8, 'rgba(255,255,255,.9)', '800 13px');
      P.txt(c, '대륙붕(얕은 바다)', W * 0.645, H * 0.46, 'rgba(255,255,255,.95)', '800 12px');
      return [sky, gr];
    }
    // 화면에 보이는 수면 높이(px): 실제보다 크게 과장
    const etaPx = (u) => waves.reduce((s, w) => { const a = 9 + amp(w.a, Math.min(w.x, COAST - 0.001)) * 14, d = (u - w.x) / w.wd; return s + a * Math.exp(-d * d); }, 0);
    function quake(l) {
      if (quaked) return false;
      lift = Math.max(0.3, Math.min(1, l)); a0 = 0.8 * lift; quaked = true;
      const c = (F0 + F1) / 2; waves = [{ x: c, dir: 1, a: a0 / 2, wd: 0.09 }, { x: c, dir: -1, a: a0 / 2, wd: 0.09 }];
      steps(); S.kick(); return true;
    }
    function alarm() { if (alarmOn) return; alarmOn = true; alarmT = 0; people.forEach((p) => { if (p.st === 'home') p.st = 'walk'; }); steps(); S.kick(); }
    const slot = () => SAFE + 0.005 + people.filter((p) => p.st === 'safe').length * 0.009;
    function step(dt) {
      t += dt; alarmT += dt;
      waves.forEach((w) => { const v = vel(Math.max(0, Math.min(COAST - 0.001, w.x))); w.x += w.dir * v * dt; w.wd = 0.03 + 0.06 * (v / 0.106); });
      waves = waves.filter((w) => w.x > -0.2 && !(w.dir > 0 && w.x >= COAST));
      const f = front(); if (f && f.x > 0.68) saw = true;
      if (quaked && !arrived && !f) { arrived = true; flood = { t: 0, a: amp(a0 / 2, COAST - 0.001) }; }
      people.forEach((p) => { if (p.st === 'walk') { p.x += 0.03 * dt; if (p.x >= SAFE) { p.x = slot(); p.st = 'safe'; } } });
      if (flood) {
        flood.t += dt;
        if (lost < 0 && flood.t > 1.2) { const fx = floodX(1); lost = 0; people.forEach((p) => { if (p.st !== 'safe' && p.x < fx) { p.st = 'lost'; lost += 1; } }); steps(); }
      }
    }
    const floodK = () => (!flood ? 0 : flood.t < 1.5 ? flood.t / 1.5 : flood.t < 3 ? 1 : Math.max(0, 1 - (flood.t - 3) / 4));
    const floodLevel = (k) => Y(SEA) - (9 + flood.a * 14) * k; // px
    function floodX(k) { const yf = floodLevel(k) / S.H; return Math.min(HILL1, HILL0 + Math.max(0, PLAIN - yf) / (PLAIN - TOP) * (HILL1 - HILL0)); }
    function remain() { const f = front(); if (!f) return 0; let s = 0; for (let u = f.x; u < COAST; u += 0.004) s += 0.004 / vel(u); return s; }
    function steps() {
      const allSafe = people.every((p) => p.st === 'safe');
      const ok = []; if (quaked) ok.push(1); if (saw) ok.push(2); if (arrived && lost === 0) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 바다 밑 단층을 위로 끌어 올리자' : st === 2 ? '② 파가 해안으로 오며 어떻게 바뀌나 보자' : st === 3 ? (arrived ? '처음부터 다시 — 이번엔 모두 대피시키자' : '③ 도착 전에 마을 사람을 언덕으로!') : '모두 대피했다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
      const f = front();
      if (!quaked) say('바다 밑 단층 덩어리를 <b>위로 끌어 올리자</b> — 해저에서 지진이 일어나 바닷물 전체가 들어 올려진다.');
      else if (f) {
        const u = Math.min(f.x, COAST - 0.001), d = depth(u), kmh = Math.round(Math.sqrt(9.8 * d) * 3.6), h = amp(f.a, u);
        say(d > 1000 ? `먼바다 — 깊이 약 ${Math.round(d / 100) * 100} m, 빠르기 약 ${kmh} km/h(비행기만큼), 파고는 약 ${h.toFixed(1)} m뿐. 배 위에서는 거의 못 느낀다.`
          : `얕은 바다 — 깊이 약 ${Math.round(d)} m, 빠르기 약 ${kmh} km/h로 <b>느려지고</b>, 뒤따라온 물이 쌓여 파고가 약 ${h.toFixed(1)} m로 <b>높아진다</b>.${allSafe ? '' : alarmOn ? ' 사람들이 언덕으로 오르는 중!' : ' 마을 사람을 언덕으로 옮기거나 경보 탑을 누르자.'}`);
      } else if (lost < 0) say('해일이 해안에 닿아 마을로 밀려든다!');
      else say(lost === 0 ? `해일이 마을을 덮쳤지만 <b>모두 언덕 대피소로 피했다</b>.${alarmOn ? ' 경보가 시간을 벌어 주었다.' : ''} 해안에서 높아진 파는 낮은 땅 깊숙이 밀려든다.`
        : `${lost}명이 미처 피하지 못했다. 먼바다에서 몇 분이면 해안에 닿는다 — <b>처음부터</b> 다시, 경보를 더 빨리 울려 보자.`);
    }
    function figure(c, x, y, col, k) {
      c.save(); c.translate(x, y); c.scale(1.35, 1.35); c.translate(-x, -y);
      const sw = Math.sin(k) * 3;
      c.strokeStyle = col; c.lineWidth = 2.4; c.lineCap = 'round';
      c.beginPath(); c.moveTo(x, y - 6); c.lineTo(x - 3 + sw, y); c.moveTo(x, y - 6); c.lineTo(x + 3 - sw, y); c.moveTo(x, y - 6); c.lineTo(x, y - 13); c.moveTo(x, y - 11); c.lineTo(x - 4 - sw * 0.5, y - 8); c.moveTo(x, y - 11); c.lineTo(x + 4 + sw * 0.5, y - 8); c.stroke();
      c.fillStyle = '#f2c9a0'; c.beginPath(); c.arc(x, y - 16, 3.4, 0, TAU); c.fill(); c.restore();
    }
    const pPos = (p) => p.dx != null ? [p.dx, p.dy] : [X(p.x), Y(ground(p.x))];
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        if (dt) step(Math.min(dt, 0.05));
        const key = `${W}x${H}`; if (key !== bgKey) { [bgSky, bgGround] = paint(W, H); bgKey = key; }
        c.drawImage(bgSky, 0, 0, W, H);
        // 바닷물(수면에 파의 높이를 더해)
        c.beginPath(); c.moveTo(0, H);
        for (let x = 0; x <= X(COAST) + 2; x += 3) c.lineTo(x, Y(SEA) - etaPx(x / W) + Math.sin(x * 0.05 + t * 2) * 1.2);
        c.lineTo(X(COAST) + 2, H); c.closePath();
        const sea = c.createLinearGradient(0, Y(SEA) - 40, 0, H); sea.addColorStop(0, '#5aa9d8'); sea.addColorStop(0.35, '#2b6fa6'); sea.addColorStop(1, '#123a63'); c.fillStyle = sea; c.fill();
        c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1.5; c.beginPath(); for (let x = 0; x <= X(COAST); x += 3) { const y = Y(SEA) - etaPx(x / W); x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
        c.drawImage(bgGround, 0, 0, W, H);
        // 솟은 단층 덩어리
        if (lift > 0) {
          const up = lift * H * 0.06, x0 = X(F0), x1 = X(F1), y = Y(0.88);
          const g = c.createLinearGradient(0, y - up, 0, y); g.addColorStop(0, '#9b8466'); g.addColorStop(1, '#6f5a43'); c.fillStyle = g; c.fillRect(x0, y - up, x1 - x0, up + 2);
          c.strokeStyle = 'rgba(30,20,10,.7)'; c.lineWidth = 2; c.strokeRect(x0, y - up, x1 - x0, up + 2);
        }
        if (!quaked) {
          const p = 0.5 + 0.5 * Math.sin(t * 4), cx = X((F0 + F1) / 2), y = Y(0.88) - lift * H * 0.06;
          c.fillStyle = `rgba(255,216,77,${0.55 + 0.45 * p})`; c.beginPath(); c.moveTo(cx, y - 34 - p * 6); c.lineTo(cx - 12, y - 18 - p * 6); c.lineTo(cx + 12, y - 18 - p * 6); c.fill();
          P.txt(c, '단층을 위로 끌기', cx, y - 42 - p * 6, '#fff', '800 14px');
        } else if (t < 2.5 || waves.length) {
          // 진앙 표시(잠깐)
          const r = ((t * 60) % 60); c.strokeStyle = `rgba(255,120,60,${Math.max(0, 1 - r / 60)})`; c.lineWidth = 3; c.beginPath(); c.arc(X((F0 + F1) / 2), Y(0.88), 10 + r, Math.PI, TAU); c.stroke();
        }
        // 배(먼바다): 파가 지나가도 거의 흔들리지 않는다
        const bx = X(0.34), by = Y(SEA) - etaPx(0.34);
        c.fillStyle = '#e9edf0'; c.beginPath(); c.moveTo(bx - 22, by - 4); c.lineTo(bx + 22, by - 4); c.lineTo(bx + 15, by + 5); c.lineTo(bx - 15, by + 5); c.fill(); c.fillStyle = '#c0533b'; c.fillRect(bx - 6, by - 12, 12, 8);
        // 범람
        if (flood) {
          const k = floodK(), yf = floodLevel(k), fx = floodX(k);
          if (k > 0) { c.beginPath(); c.moveTo(X(COAST) - 4, yf); c.lineTo(X(fx), yf); for (let u = fx; u >= COAST - 0.005; u -= 0.003) c.lineTo(X(u), Y(ground(u))); c.closePath(); c.fillStyle = 'rgba(70,110,140,.82)'; c.fill(); c.strokeStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.moveTo(X(COAST) - 4, yf); c.lineTo(X(fx), yf); c.stroke(); }
        }
        // 경보 탑
        const tx = X(TOWER), ty = Y(PLAIN);
        c.fillStyle = '#5b6470'; c.fillRect(tx - 2, ty - 46, 4, 46); c.fillStyle = alarmOn && Math.sin(t * 12) > 0 ? '#ff4a3a' : '#d24b3a'; c.beginPath(); c.arc(tx, ty - 50, 7, 0, TAU); c.fill();
        c.fillStyle = '#d9dee4'; c.beginPath(); c.moveTo(tx + 5, ty - 44); c.lineTo(tx + 15, ty - 50); c.lineTo(tx + 15, ty - 36); c.fill();
        if (alarmOn && alarmT < 14) for (let i = 0; i < 3; i++) { const r = ((alarmT * 40 + i * 20) % 60); c.strokeStyle = `rgba(255,74,58,${1 - r / 60})`; c.lineWidth = 2; c.beginPath(); c.arc(tx + 15, ty - 43, 8 + r, -0.9, 0.9); c.stroke(); }
        else if (!alarmOn && quaked && !arrived) { const p = 0.5 + 0.5 * Math.sin(t * 5); c.strokeStyle = `rgba(255,216,77,${p})`; c.lineWidth = 3; c.setLineDash([5, 5]); c.beginPath(); c.arc(tx, ty - 34, 24, 0, TAU); c.stroke(); c.setLineDash([]); }
        P.txt(c, '해일 경보', tx, ty - 62, '#1d2433', '800 12px');
        // 사람
        people.forEach((p, i) => {
          const [x, y] = pPos(p);
          if (p.st === 'lost') { c.fillStyle = 'rgba(210,60,40,.9)'; c.beginPath(); c.arc(x, y - 10, 7, 0, TAU); c.fill(); P.txt(c, '!', x, y - 6, '#fff', '900 11px'); return; }
          figure(c, x, y, p.st === 'safe' ? '#2f7d4a' : '#1d2433', p.st === 'walk' || p.dx != null ? t * 10 + i : 0);
        });
        if (people.some((p) => p.st === 'safe')) P.txt(c, `대피 ${people.filter((p) => p.st === 'safe').length}/6`, X(0.95), Y(TOP) + 18, '#1f5a34', '800 12px');
        // 계기
        const f = front();
        c.fillStyle = 'rgba(255,255,255,.92)'; c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; const mx = W * 0.4; c.beginPath(); c.roundRect(mx, 10, 236, 62, 8); c.fill(); c.stroke();
        if (f) {
          const u = Math.min(f.x, COAST - 0.001), d = depth(u);
          P.txt(c, `파고 약 ${amp(f.a, u).toFixed(1)} m · 빠르기 약 ${Math.round(Math.sqrt(9.8 * d) * 3.6)} km/h`, mx + 10, 34, '#1d2433', '800 13px', 'left');
          P.txt(c, `해일 도착까지 약 ${Math.max(1, Math.round(remain() * 2))}분`, mx + 10, 58, '#c0392b', '800 14px', 'left');
          c.strokeStyle = 'rgba(255,216,77,.9)'; c.lineWidth = 2; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(X(f.x), Y(SEA) - 70); c.lineTo(X(f.x), Y(SEA) - etaPx(f.x) - 4); c.stroke(); c.setLineDash([]);
        } else P.txt(c, quaked ? (arrived ? '해일이 해안에 닿았다' : '') : '파고 — · 빠르기 —', mx + 10, 34, '#1d2433', '800 13px', 'left');
        uiT += dt; if (uiT > 0.25 || !dt) { uiT = 0; steps(); }
      },
      down(p) {
        const hit = people.find((q) => { if (q.st === 'safe' || q.st === 'lost') return false; const [x, y] = pPos(q); return Math.abs(p.x - x) < 16 && p.y > y - 32 && p.y < y + 10; });
        if (hit) { drag = { k: 'p', q: hit }; hit.st = 'drag'; hit.dx = p.x; hit.dy = p.y; return; }
        if (Math.abs(p.x - X(TOWER)) < 26 && p.y > Y(PLAIN) - 70 && p.y < Y(PLAIN) + 6) { alarm(); return; }
        if (!quaked && p.x < X(0.46) && p.y > Y(0.55)) drag = { k: 'f', y0: p.y };
      },
      move(p, e, held) {
        if (!held || !drag) return;
        if (drag.k === 'f') lift = Math.max(0, Math.min(1, (drag.y0 - p.y) / (S.H * 0.15)));
        else { drag.q.dx = p.x; drag.q.dy = p.y; }
      },
      up(p) {
        if (!drag) return;
        if (drag.k === 'f') { if (lift > 0.15) quake(lift); else lift = 0; }
        else { const q = drag.q; q.dx = q.dy = null; if (p.x > X(SAFE - 0.015)) { q.x = slot(); q.st = 'safe'; } else { q.x = Math.max(0.725, Math.min(SAFE - 0.01, p.x / S.W)); q.st = alarmOn ? 'walk' : 'home'; } }
        drag = null; steps();
      },
      key(e) {
        if (e.key === 'ArrowUp') { quake(1); return true; }
        if (e.key === 'Enter' || e.key === 'a' || e.key === 'A') { alarm(); return true; }
        if (e.key === 'e' || e.key === 'E') { root._ts.evac(); return true; }
        if (e.key === '0') { reset(); steps(); return true; } return false;
      },
    });
    root.querySelector('.ts-reset').addEventListener('click', () => { reset(); steps(); S.kick(); });
    steps();
    const go = (sec) => { for (let k = 0; k < sec * 30; k++) step(1 / 30); steps(); S.kick(); };
    root._ts = {
      quake: (v) => { quake(v == null ? 1 : v); go(1); return root._ts.state(); },
      evac: () => { people.forEach((q) => { if (q.st !== 'safe' && q.st !== 'lost') { q.x = slot(); q.st = 'safe'; } }); steps(); S.kick(); return root._ts.state(); },
      alarm: () => { alarm(); return root._ts.state(); },
      run: (sec) => { go(sec); return root._ts.state(); },
      state: () => ({ quaked, front: front() ? +front().x.toFixed(3) : null, arrived, saw, safe: people.filter((q) => q.st === 'safe').length, lost, alarm: alarmOn }),
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Tsunami = { mount };
})();
