/* 3-1 2차시 체험 «탄소 원자의 여행»(교과서 109쪽 그림 Ⅲ-8 탄소의 순환 + 참고서 130~131쪽).
   풍경 단면: 하늘(기권) · 숲(생물권) · 바다(수권) · 땅속(지권 — 육지 아래 화석 연료, 바다 아래 석회암).
   빛나는 탄소 원자를 끌어 다른 권역에 놓으면, 실제 있는 경로(광합성·호흡·화석 연료 생성·연소·화산 활동·용해·방출·석회암 생성)일 때만
   화살표를 따라 날아가고 모습(CO₂·유기물·탄산 이온·석회암/화석 연료)이 바뀐다. 없는 경로는 튕겨 돌아온다.
   공장 굴뚝을 누르고 있으면 화석 연료를 태워 기권 CO₂가 늘고, 바다에 녹아 바닷물 pH가 내려간다.
   숫자는 이해를 돕기 위한 예. Carbon.mount(root) → { fit, setActive } · 시험용: root._cb.go('atm'|'bio'|'hydro'|'geo') · burn(초) · state() */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const NAME = { atm: '기권', bio: '생물권', hydro: '수권', fos: '지권', lime: '지권' };
  const FORM = { atm: '이산화 탄소(CO₂)', bio: '유기물(생물의 몸)', hydro: '탄산 이온(바닷물에 녹음)', fos: '화석 연료(석탄·석유)', lime: '석회암' };
  const TAG = { atm: 'CO₂', bio: '유기물', hydro: 'CO₃²⁻', fos: '석탄', lime: '석회암' };
  // [출발, 도착, 이름, 설명]
  const EDGES = [
    ['atm', 'bio', '광합성', '식물이 이산화 탄소를 흡수해 양분(유기물)을 만든다'],
    ['bio', 'atm', '호흡', '생물이 호흡하고 죽은 몸이 분해되며 이산화 탄소가 나온다'],
    ['bio', 'fos', '화석 연료 생성', '생물의 사체가 오랜 시간 땅에 묻혀 석탄·석유가 된다'],
    ['fos', 'atm', '연소', '화석 연료를 태우면 탄소가 이산화 탄소로 돌아간다'],
    ['lime', 'atm', '화산 활동', '땅속 탄소가 화산 가스에 섞여 대기로 나온다'],
    ['atm', 'hydro', '용해', '대기의 이산화 탄소가 바닷물에 녹는다'],
    ['hydro', 'atm', '방출', '바닷물에 녹아 있던 이산화 탄소가 대기로 빠져나온다'],
    ['hydro', 'lime', '석회암 생성', '바닷물의 탄산 이온이 칼슘과 만나 가라앉아 석회암이 된다'],
  ];
  const edge = (a, b) => EDGES.find((e) => e[0] === a && e[1] === b);
  // 정규 좌표: 하늘 y<0.3 · 육지(왼쪽, 지표 0.56) · 바다(오른쪽, 해수면 0.5~해저 0.78) · 땅속 y>0.78
  const zoneAt = (u, v) => (v < 0.32 ? 'atm' : v > 0.79 ? (u < 0.5 ? 'fos' : 'lime') : u < 0.5 ? 'bio' : 'hydro');
  const HOME = { atm: [0.5, 0.15], bio: [0.2, 0.42], hydro: [0.74, 0.64], fos: [0.22, 0.9], lime: [0.76, 0.9] };
  console.assert(zoneAt(0.2, 0.4) === 'bio' && zoneAt(0.8, 0.9) === 'lime' && EDGES.length === 8 && !edge('geo', 'bio'), 'carbon: 권역·경로');

  function mount(root) {
    const stage = root.querySelector('.cb-stage'), now = root.querySelector('.cb-now'), out = root.querySelector('.cb-out');
    const lis = [...root.querySelectorAll('.cb-paths li')], co2Bar = root.querySelector('.cb-co2 i'), co2N = root.querySelector('.cb-co2 b'), phBar = root.querySelector('.cb-ph i'), phN = root.querySelector('.cb-ph b');
    const P = window.Play;
    let at, pos, drag, fly, bounce, found, visited, co2, burning, burnT, smoke, t, msg, bgKey = '', bg = null, meterT = 0;
    function reset() { at = 'atm'; pos = HOME.atm.slice(); drag = false; fly = null; bounce = null; found = new Set(); visited = new Set(['atm']); co2 = 280; burning = false; burnT = 0; smoke = []; t = 0; msg = ''; }
    reset();
    const ph = () => 8.2 - (co2 - 280) * 0.0009;
    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };
    const X = (u) => u * S.W, Y = (v) => v * S.H;
    const factory = () => ({ x: 0.38, y: 0.56, w: 0.1 });

    function paintBg(W, H) {
      const k = Math.max(1, Math.min(2, window.devicePixelRatio || 1)), cv = document.createElement('canvas'); cv.width = W * k; cv.height = H * k;
      const c = cv.getContext('2d'); c.setTransform(k, 0, 0, k, 0, 0);
      const sk = c.createLinearGradient(0, 0, 0, H * 0.56); sk.addColorStop(0, '#6aa8dc'); sk.addColorStop(1, '#d8ecf8'); c.fillStyle = sk; c.fillRect(0, 0, W, H);
      // 바다
      const sea = c.createLinearGradient(0, H * 0.5, 0, H * 0.79); sea.addColorStop(0, '#3a9ad4'); sea.addColorStop(1, '#14457e'); c.fillStyle = sea; c.fillRect(W * 0.5, H * 0.5, W * 0.5, H * 0.29);
      // 육지(풀밭 → 흙)
      const land = c.createLinearGradient(0, H * 0.56, 0, H * 0.79); land.addColorStop(0, '#78ad52'); land.addColorStop(0.15, '#8a6a44'); land.addColorStop(1, '#6a4e32');
      c.fillStyle = land; c.beginPath(); c.moveTo(0, H * 0.56); c.lineTo(W * 0.47, H * 0.56); c.quadraticCurveTo(W * 0.52, H * 0.6, W * 0.52, H * 0.79); c.lineTo(0, H * 0.79); c.fill();
      // 땅속: 왼쪽 석탄층, 오른쪽 석회암층
      const rock = c.createLinearGradient(0, H * 0.79, 0, H); rock.addColorStop(0, '#5b4a3a'); rock.addColorStop(1, '#2e241b'); c.fillStyle = rock; c.fillRect(0, H * 0.79, W, H * 0.21);
      c.fillStyle = '#1a1612'; c.beginPath(); c.moveTo(W * 0.03, H * 0.88); c.bezierCurveTo(W * 0.15, H * 0.85, W * 0.3, H * 0.92, W * 0.46, H * 0.87); c.lineTo(W * 0.46, H * 0.94); c.bezierCurveTo(W * 0.3, H * 0.98, W * 0.15, H * 0.92, W * 0.03, H * 0.95); c.fill();
      c.fillStyle = 'rgba(255,255,255,.12)'; for (let i = 0; i < 40; i++) { c.fillRect(W * (0.05 + (i * 37 % 100) / 250), H * (0.885 + (i * 13 % 10) / 200), 3, 1.5); }
      for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) { const x = W * (0.54 + i * 0.05 + (r % 2) * 0.025), y = H * (0.83 + r * 0.045); c.fillStyle = r % 2 ? '#d9d2c0' : '#cbc3ad'; c.fillRect(x, y, W * 0.046, H * 0.04); c.strokeStyle = '#9a917a'; c.strokeRect(x, y, W * 0.046, H * 0.04); }
      // 숲
      for (let i = 0; i < 7; i++) { const x = W * (0.04 + i * 0.045), y = H * 0.56; c.fillStyle = '#5a3e22'; c.fillRect(x - 2, y - 18, 4, 18); const g = c.createRadialGradient(x - 4, y - 34, 2, x, y - 28, 18); g.addColorStop(0, '#8fd06f'); g.addColorStop(1, '#2d6a30'); c.fillStyle = g; c.beginPath(); c.arc(x, y - 30, 14, 0, TAU); c.fill(); }
      // 사슴 한 마리
      c.fillStyle = '#9a6a3a'; c.beginPath(); c.ellipse(W * 0.3, H * 0.535, 14, 7, 0, 0, TAU); c.fill(); c.fillRect(W * 0.3 - 10, H * 0.535, 3, 10); c.fillRect(W * 0.3 + 8, H * 0.535, 3, 10); c.beginPath(); c.arc(W * 0.3 + 16, H * 0.515, 5, 0, TAU); c.fill();
      // 바다 속 조개·산호
      [[0.6, '#f2a0a0'], [0.7, '#f6d28a'], [0.86, '#f2a0a0']].forEach(([u, col]) => { c.fillStyle = col; c.beginPath(); c.arc(W * u, H * 0.78, 8, Math.PI, 0); c.fill(); });
      // 화산(바닷가 쪽 작은 산)
      c.fillStyle = '#5a4a40'; c.beginPath(); c.moveTo(W * 0.9, H * 0.5); c.lineTo(W * 0.95, H * 0.36); c.lineTo(W * 0.97, H * 0.36); c.lineTo(W * 1.02, H * 0.5); c.fill();
      // 공장
      const f = { x: W * 0.38, y: H * 0.56, w: W * 0.1 }; c.fillStyle = '#7d8592'; c.fillRect(f.x - f.w / 2, f.y - 26, f.w, 26); c.fillStyle = '#5d6572'; c.fillRect(f.x + f.w * 0.15, f.y - 62, 10, 40);
      c.fillStyle = '#ffd25a'; [-0.35, -0.1, 0.15].forEach((u) => c.fillRect(f.x + u * f.w, f.y - 18, 8, 7));
      // 권역 이름
      [['기권', 0.04, 0.06], ['생물권', 0.04, 0.33], ['수권', 0.9, 0.56], ['지권 — 화석 연료', 0.04, 0.83], ['지권 — 석회암', 0.6, 0.995]].forEach(([s, u, v]) => P.txt(c, s, W * u, H * v - 4, '#fff', '800 14px', 'left'));
      return cv;
    }
    function arrowPath(a, b) { const [x1, y1] = HOME[a], [x2, y2] = HOME[b], mx = (x1 + x2) / 2, my = (y1 + y2) / 2, dx = x2 - x1, dy = y2 - y1; return [x1, y1, mx - dy * 0.25, my + dx * 0.25, x2, y2]; }
    const qpt = ([x1, y1, cx, cy, x2, y2], s) => [(1 - s) * (1 - s) * x1 + 2 * (1 - s) * s * cx + s * s * x2, (1 - s) * (1 - s) * y1 + 2 * (1 - s) * s * cy + s * s * y2];
    function atom(c, x, y, z) {
      P.glow(c, x, y, 34, 'rgba(255,240,140,.6)');
      const g = c.createRadialGradient(x - 5, y - 6, 2, x, y, 18); g.addColorStop(0, '#6b6b6b'); g.addColorStop(1, '#141414'); c.fillStyle = g; c.beginPath(); c.arc(x, y, 17, 0, TAU); c.fill();
      c.strokeStyle = '#ffd84d'; c.lineWidth = 2.5; c.stroke(); P.txt(c, 'C', x, y + 6, '#fff', '800 17px');
      c.fillStyle = 'rgba(29,36,51,.85)'; c.font = '800 13px "IBM Plex Sans KR", sans-serif'; const w = c.measureText(TAG[z]).width + 14; c.beginPath(); c.roundRect(x - w / 2, y + 22, w, 20, 8); c.fill(); P.txt(c, TAG[z], x, y + 37, '#ffd84d', '800 13px');
    }
    function steps() {
      const ok = []; if (found.has('광합성')) ok.push(1); if (['atm', 'bio', 'hydro'].every((z) => visited.has(z)) && (visited.has('fos') || visited.has('lime'))) ok.push(2); if (co2 >= 400) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 하늘의 탄소를 끌어 숲에 놓아 보자' : st === 2 ? '② 탄소를 네 권역에 모두 데려가 보자' : st === 3 ? '③ 공장 굴뚝을 꾹 누르고 있어 보자' : '탄소의 총량은 그대로, 머무는 곳만 바뀐다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
      lis.forEach((li) => li.classList.toggle('on', found.has(li.dataset.k)));
      co2Bar.style.width = `${Math.min(100, (co2 - 200) / 4)}%`; co2N.textContent = Math.round(co2); phBar.style.width = `${Math.max(0, (ph() - 7.6) / 0.7 * 100)}%`; phN.textContent = ph().toFixed(2);
    }
    function drop(u, v) {
      const z = zoneAt(u, v);
      if (z === at || (z === 'fos' || z === 'lime') && (at === 'fos' || at === 'lime')) { bounce = { from: pos.slice(), s: 0 }; return { ok: false, same: true }; }
      // 지권에 놓을 때는 생물권 → 화석 연료, 수권 → 석회암으로 맞춰 준다
      const to = z === 'fos' || z === 'lime' ? (at === 'bio' ? 'fos' : at === 'hydro' ? 'lime' : z) : z;
      const e = edge(at, to);
      if (!e) { bounce = { from: pos.slice(), s: 0 }; say(`<b>${NAME[at]} → ${NAME[to]}</b> 바로 가는 길은 없다 — 탄소가 튕겨 돌아왔다. 다른 권역을 거쳐 가 보자`); return { ok: false, from: at, to }; }
      fly = { e, path: arrowPath(at, to), s: 0 }; found.add(e[2]); visited.add(to); at = to;
      say(`<b>${e[2]}</b>: ${e[3]} — 이제 탄소는 <b>${NAME[to]}</b>의 <b>${FORM[to]}</b>`);
      return { ok: true, path: e[2], to };
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt || 0;
        const key = `${W}x${H}`; if (key !== bgKey) { bg = paintBg(W, H); bgKey = key; }
        c.drawImage(bg, 0, 0, W, H);
        // CO₂가 많을수록 하늘이 뿌옇다
        c.fillStyle = `rgba(150,130,110,${Math.min(0.35, (co2 - 280) / 900)})`; c.fillRect(0, 0, W, H * 0.5);
        // 찾은 경로 화살표
        EDGES.forEach((e) => { if (!found.has(e[2])) return; const p = arrowPath(e[0], e[1]); c.strokeStyle = 'rgba(255,216,77,.75)'; c.lineWidth = 3; c.setLineDash([8, 6]); c.lineDashOffset = -t * 30; c.beginPath(); c.moveTo(X(p[0]), Y(p[1])); c.quadraticCurveTo(X(p[2]), Y(p[3]), X(p[4]), Y(p[5])); c.stroke(); c.setLineDash([]);
          const [mx, my] = qpt(p, 0.5); c.fillStyle = 'rgba(29,36,51,.8)'; c.font = '800 12px "IBM Plex Sans KR", sans-serif'; const w = c.measureText(e[2]).width + 12; c.beginPath(); c.roundRect(X(mx) - w / 2, Y(my) - 10, w, 20, 7); c.fill(); P.txt(c, e[2], X(mx), Y(my) + 5, '#ffd84d', '800 12px'); });
        // 굴뚝 연기
        if (burning) { burnT += dt; co2 = Math.min(620, co2 + dt * 45); if (Math.random() < dt * 25) smoke.push({ x: 0.4 + 0.01, y: 0.49, r: 6, a: 0.7 }); }
        smoke.forEach((s) => { s.y -= dt * 0.08; s.x += dt * 0.03; s.r += dt * 14; s.a -= dt * 0.25; c.fillStyle = `rgba(90,90,90,${Math.max(0, s.a)})`; c.beginPath(); c.arc(X(s.x), Y(s.y), s.r, 0, TAU); c.fill(); });
        smoke = smoke.filter((s) => s.a > 0);
        const f = factory(); if (!burning && co2 < 400 && found.size >= 1) { const a = 0.5 + 0.5 * Math.sin(t * 4); c.strokeStyle = `rgba(255,120,80,${a})`; c.lineWidth = 3; c.beginPath(); c.roundRect(X(f.x - f.w / 2) - 6, Y(f.y) - 70, X(f.w) + 12, 76, 10); c.stroke(); }
        if (burning) P.txt(c, '화석 연료 연소 중', X(f.x), Y(f.y) - 78, '#fff', '800 13px');
        // 탄소 원자 위치
        if (fly) { fly.s = Math.min(1, fly.s + (dt || 0.016) * 1.4); pos = qpt(fly.path, fly.s); if (fly.s >= 1) { fly = null; pos = HOME[at].slice(); } }
        else if (bounce) { bounce.s = Math.min(1, bounce.s + (dt || 0.016) * 2.5); const h = HOME[at], s = bounce.s; pos = [bounce.from[0] + (h[0] - bounce.from[0]) * s, bounce.from[1] + (h[1] - bounce.from[1]) * s - Math.sin(s * Math.PI) * 0.06]; if (s >= 1) bounce = null; }
        else if (!drag) pos = [HOME[at][0], HOME[at][1] + Math.sin(t * 2) * 0.008];
        atom(c, X(pos[0]), Y(pos[1]), fly ? fly.e[1] : at);
        if (!drag && !fly && found.size === 0) P.txt(c, '탄소를 끌어 다른 권역에 놓기', X(pos[0]), Y(pos[1]) + 62, '#1d2433', '800 13px');
        meterT += dt || 0; if (meterT > 0.2 || !dt) { meterT = 0; steps(); }
      },
      down(p) {
        const u = p.x / S.W, v = p.y / S.H;
        if (!fly && Math.hypot(p.x - X(pos[0]), p.y - Y(pos[1])) < 34) { drag = true; bounce = null; return; }
        const f = factory(); if (Math.abs(u - f.x) < f.w * 0.7 && v > f.y - 0.15 && v < f.y + 0.03) { burning = true; say('굴뚝에서 <b>화석 연료</b>를 태운다 — 땅속에 오래 갇혀 있던 탄소가 <b>이산화 탄소</b>로 대기에 쌓이고, 일부는 바다에 녹아 바닷물이 산성 쪽으로 바뀐다'); }
      },
      move(p, e, held) { if (held && drag) pos = [Math.max(0.03, Math.min(0.97, p.x / S.W)), Math.max(0.03, Math.min(0.97, p.y / S.H))]; },
      up() { if (drag) { drag = false; drop(pos[0], pos[1]); } burning = false; },
      key(e) {
        const m = { 1: 'atm', 2: 'bio', 3: 'hydro', 4: 'geo' }[e.key]; if (m) { root._cb.go(m); return true; }
        if (e.key === 'b' || e.key === 'B') { co2 = Math.min(620, co2 + 20); return true; } return false;
      },
    });
    root.querySelector('.cb-reset').addEventListener('click', () => { reset(); out.innerHTML = ''; steps(); S.kick(); });
    steps();
    root._cb = {
      go: (z) => { const to = z === 'geo' ? (at === 'hydro' ? 'lime' : 'fos') : z; const r = drop(...HOME[to]); if (fly) { fly = null; pos = HOME[at].slice(); } bounce = null; steps(); S.kick(); return r; },
      burn: (sec) => { co2 = Math.min(620, co2 + sec * 45); steps(); S.kick(); return { co2: Math.round(co2), ph: +ph().toFixed(2) }; },
      state: () => ({ at, form: FORM[at], found: [...found], co2: Math.round(co2), ph: +ph().toFixed(2) }),
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Carbon = { mount };
})();
