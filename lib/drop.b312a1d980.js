/* 3-1 2차시 표지 «물방울 하나의 여행»(교과서 108~109쪽 물의 순환: 태양 에너지로 증발 → 응결해 구름 → 비 → 강 → 바다).
   풍경 단면(태양·하늘·구름·산·강·해안·바다). 바다 속 물방울을 끌어 하늘에 놓으면 증발(태양 에너지 흡수, 수증기로 흐려짐),
   수증기를 구름 쪽으로 끌면 응결(에너지 방출, 반짝임), 구름 속 물방울을 산 위로 끌어 놓으면 비로 떨어져 강을 따라 바다로 돌아온다.
   한 바퀴마다 «증발 n · 돌아옴 n» 계기가 같이 오른다. 표지라 해 볼 일 없음. 키보드: 스페이스·엔터로 다음 단계, 0 처음부터.
   Drop.mount(root) → { fit, setActive } · 시험용: root._dr2.go('sky'|'cloud'|'rain'|'sea') */
(function () {
  'use strict';
  const NOTE = {
    sea: ['바다 속 물방울 — 끌어 하늘로 올려 보자', ''],
    sky: ['증발 — 태양 에너지를 흡수해 수증기가 되었다', '흡수'],
    cloud: ['응결 — 에너지를 내놓으며 구름 속 물방울이 되었다', '방출'],
    rain: ['비 — 산 위에 떨어진다', ''],
    river: ['강을 따라 흘러 바다로 — 땅을 깎고 흙을 나른다', ''],
  };
  const HINT = { sea: '물방울을 하늘(위쪽)로 끌어 놓자', sky: '수증기를 구름 쪽으로 끌어 놓자', cloud: '구름 속 물방울을 산 위로 끌어 놓자' };
  function mount(root) {
    const stage = root.querySelector('.dr2-stage'), now = root.querySelector('.dr2-now');
    const P = window.Play;
    let phase = 'sea', x = 0, y = 0, drag = false, t = 0, k = 0, fx = [], laps = 0, msg = '', art = null, artW = 0;
    // 강물 길: 산 중턱 → 해안(비율 좌표)
    const RIVER = [[0.26, 0.6], [0.32, 0.67], [0.37, 0.7], [0.44, 0.71], [0.5, 0.74], [0.58, 0.76]];
    const SEA = (W, H) => [W * 0.8, H * 0.8], CLOUD = (W, H) => [W * 0.5, H * 0.17], PEAK = (W, H) => [W * 0.24, H * 0.4];
    const at = (pts, u, W, H) => { const f = Math.min(pts.length - 1.001, u * (pts.length - 1)), i = Math.floor(f), r = f - i; return [W * (pts[i][0] + (pts[i + 1][0] - pts[i][0]) * r), H * (pts[i][1] + (pts[i + 1][1] - pts[i][1]) * r)]; };
    function say(h) { if (h !== msg) { msg = h; now.textContent = h; now.classList.toggle('done', laps > 0 && phase === 'sea'); } }
    function scene(W, H) {
      if (art && artW === W) return art;
      art = document.createElement('canvas'); art.width = W; art.height = H; artW = W; const c = art.getContext('2d');
      const lg = (y0, y1, st) => { const g = c.createLinearGradient(0, y0, 0, y1); st.forEach(([o, col]) => g.addColorStop(o, col)); return g; };
      c.fillStyle = lg(0, H * 0.62, [[0, '#3d78c4'], [0.7, '#9fd0f2'], [1, '#e2f2fb']]); c.fillRect(0, 0, W, H * 0.62);
      // 바다
      c.fillStyle = lg(H * 0.6, H, [[0, '#2e8ad8'], [1, '#0b2c5c']]); c.beginPath(); c.moveTo(W * 0.58, H * 0.62); c.lineTo(W, H * 0.62); c.lineTo(W, H); c.lineTo(W * 0.52, H); c.fill();
      // 땅(해안까지)
      c.fillStyle = lg(H * 0.55, H, [[0, '#7aa04a'], [0.18, '#5d7f37'], [0.3, '#6b4f2e'], [1, '#3b2816']]); c.beginPath(); c.moveTo(0, H * 0.58); c.lineTo(W * 0.5, H * 0.66); c.quadraticCurveTo(W * 0.56, H * 0.66, W * 0.6, H * 0.64); c.lineTo(W * 0.52, H); c.lineTo(0, H); c.fill();
      [0.78, 0.88].forEach((v) => { c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(0, H * v, W * 0.55, 3); });
      // 산 + 눈 + 그늘
      c.fillStyle = lg(H * 0.32, H * 0.62, [[0, '#8a8f97'], [1, '#556043']]); c.beginPath(); c.moveTo(W * 0.02, H * 0.6); c.lineTo(W * 0.24, H * 0.32); c.lineTo(W * 0.44, H * 0.62); c.fill();
      c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.moveTo(W * 0.24, H * 0.32); c.lineTo(W * 0.44, H * 0.62); c.lineTo(W * 0.3, H * 0.62); c.fill();
      c.fillStyle = '#f4f8ff'; c.beginPath(); c.moveTo(W * 0.2, H * 0.37); c.lineTo(W * 0.24, H * 0.32); c.lineTo(W * 0.28, H * 0.37); c.lineTo(W * 0.25, H * 0.355); c.lineTo(W * 0.22, H * 0.375); c.fill();
      // 강(구불구불) + 삼각주 모래
      c.strokeStyle = '#3d8fe0'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); RIVER.forEach(([u, v], i) => c[i ? 'lineTo' : 'moveTo'](W * u, H * v)); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2; c.stroke();
      c.fillStyle = 'rgba(222,196,140,.85)'; c.beginPath(); c.ellipse(W * 0.57, H * 0.75, W * 0.035, H * 0.018, -0.3, 0, Math.PI * 2); c.fill();
      // 숲
      for (let i = 0; i < 6; i++) { const tx = W * (0.36 + i * 0.022), ty = H * (0.645 + i * 0.002); c.fillStyle = '#4b331b'; c.fillRect(tx - 1.5, ty - 10, 3, 10); c.fillStyle = i % 2 ? '#2f7d3c' : '#3f9a4b'; c.beginPath(); c.moveTo(tx - 8, ty - 7); c.lineTo(tx, ty - 26); c.lineTo(tx + 8, ty - 7); c.fill(); }
      return art;
    }
    function set(p) {
      phase = p; k = 0; const W = S.W, H = S.H;
      if (p === 'sea') { [x, y] = SEA(W, H); }
      if (p === 'sky') { for (let i = 0; i < 10; i++) fx.push({ x, y, vx: (Math.random() - 0.5) * 30, vy: -20 - Math.random() * 30, a: 1, c: '255,236,170' }); }
      if (p === 'cloud') { [x, y] = CLOUD(W, H); for (let i = 0; i < 14; i++) { const a = Math.random() * 6.3; fx.push({ x, y, vx: Math.cos(a) * 60, vy: Math.sin(a) * 60, a: 1, c: '255,255,255' }); } }
      if (p === 'rain') { [x, y] = [PEAK(W, H)[0], H * 0.16]; }
      say(NOTE[p][0] + (HINT[p] ? ` · ${HINT[p]}` : '')); window.RxT.jolt(stage, 0.6); S.kick();
    }
    function next() { set({ sea: 'sky', sky: 'cloud', cloud: 'rain', rain: 'rain', river: 'river' }[phase]); }
    function drop2(px, py) {
      const W = S.W, H = S.H, [cx, cy] = CLOUD(W, H);
      if (phase === 'sea' && py < H * 0.55) return set('sky');
      if (phase === 'sky' && Math.hypot(px - cx, py - cy) < W * 0.2) return set('cloud');
      if (phase === 'cloud' && px < W * 0.5 && py < H * 0.6) return set('rain');
      say(`아직이다 — ${HINT[phase] || ''}`); S.kick();
    }
    function blob(c, bx, by, r, vapor) {
      if (vapor) { for (let i = 0; i < 5; i++) { c.fillStyle = `rgba(235,245,255,${0.35 - i * 0.05})`; c.beginPath(); c.arc(bx + Math.sin(t * 2 + i) * 6, by + Math.cos(t * 1.7 + i) * 5, r * (1 + i * 0.35), 0, Math.PI * 2); c.fill(); } return; }
      const g = c.createRadialGradient(bx - r * 0.35, by - r * 0.2, r * 0.1, bx, by + r * 0.2, r * 1.4); g.addColorStop(0, '#e8f6ff'); g.addColorStop(0.5, '#56aef0'); g.addColorStop(1, '#1b5fb0');
      c.save(); c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 8; c.shadowOffsetY = 3; c.fillStyle = g;
      c.beginPath(); c.moveTo(bx, by - r * 1.7); c.bezierCurveTo(bx + r * 0.6, by - r * 0.8, bx + r, by - r * 0.2, bx + r, by + r * 0.3); c.arc(bx, by + r * 0.3, r, 0, Math.PI); c.bezierCurveTo(bx - r, by - r * 0.2, bx - r * 0.6, by - r * 0.8, bx, by - r * 1.7); c.fill(); c.restore();
      c.fillStyle = 'rgba(255,255,255,.8)'; c.beginPath(); c.ellipse(bx - r * 0.35, by - r * 0.05, r * 0.18, r * 0.32, 0.3, 0, Math.PI * 2); c.fill();
    }
    function badge(c, txt, bx, by, warm) {
      c.font = '800 15px "IBM Plex Sans KR", sans-serif'; const w = c.measureText(txt).width + 18;
      c.fillStyle = warm ? 'rgba(239,91,76,.92)' : 'rgba(42,115,184,.92)'; c.beginPath(); c.roundRect(bx - w / 2, by - 13, w, 26, 13); c.fill(); P.txt(c, txt, bx, by + 5, '#fff', '800 15px');
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; k += dt;
        if (!x && !y) [x, y] = SEA(W, H);
        c.drawImage(scene(W, H), 0, 0);
        // 태양 + 햇살
        P.glow(c, W * 0.08, H * 0.1, 70, 'rgba(255,214,110,.85)'); c.fillStyle = '#fff1a8'; c.beginPath(); c.arc(W * 0.08, H * 0.1, 22, 0, Math.PI * 2); c.fill();
        c.strokeStyle = 'rgba(255,230,140,.35)'; c.lineWidth = 3; for (let i = 0; i < 4; i++) { const a = 0.35 + i * 0.12, u = (t * 0.3 + i * 0.25) % 1; c.beginPath(); c.moveTo(W * 0.08 + Math.cos(a) * 40, H * 0.1 + Math.sin(a) * 40); c.lineTo(W * 0.08 + Math.cos(a) * (60 + u * 200), H * 0.1 + Math.sin(a) * (60 + u * 200)); c.stroke(); }
        // 구름(물방울이 들어가면 커지고 짙어짐)
        const [cx, cy] = CLOUD(W, H), big = phase === 'cloud' ? 1.15 : 1, drift = Math.sin(t * 0.4) * 10;
        [[0, 0, 34], [30, -12, 28], [58, 2, 26], [-30, 4, 24], [20, 12, 30]].forEach(([dx, dy, r]) => { const g = c.createRadialGradient(cx + dx + drift - r * 0.3, cy + dy - r * 0.4, 2, cx + dx + drift, cy + dy, r * big); g.addColorStop(0, '#ffffff'); g.addColorStop(1, phase === 'cloud' ? '#c3cbd6' : '#e6ebf2'); c.fillStyle = g; c.beginPath(); c.arc(cx + dx + drift, cy + dy, r * big, 0, Math.PI * 2); c.fill(); });
        // 파도
        c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2; c.beginPath(); for (let px = W * 0.6; px <= W; px += 6) c.lineTo(px, H * 0.625 + Math.sin(px * 0.05 + t * 2) * 2.5); c.stroke();
        // 단계별 움직임
        if (phase === 'sky' && !drag) { y = Math.max(H * 0.28, y - dt * 18); x += Math.sin(t) * 0.3; }
        if (phase === 'cloud' && !drag) { x = cx + drift; y = cy + 8; }
        if (phase === 'rain') {
          y += dt * 230; const [px] = PEAK(W, H); x = px + 6;
          for (let i = 0; i < 14; i++) { const rx = px - 60 + i * 9, ry = H * 0.2 + ((t * 300 + i * 37) % (H * 0.2)); c.strokeStyle = 'rgba(80,140,220,.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx - 3, ry + 10); c.stroke(); }
          if (y > H * 0.58) { phase = 'river'; k = 0; say(NOTE.river[0]); }
        }
        if (phase === 'river') { [x, y] = at(RIVER, Math.min(1, k / 3.2), W, H); if (k > 3.2) { laps += 1; set('sea'); say(`바다로 돌아왔다 — 증발한 만큼 비·강물로 돌아온다 (한 바퀴 ${laps}번) · 또 끌어 보자`); } }
        if (phase === 'sea' && !drag) { const [sx, sy] = SEA(W, H); x += (sx - x) * Math.min(1, dt * 3); y = sy + Math.sin(t * 2) * 4; }
        // 반짝임·김
        fx.forEach((f) => { f.x += f.vx * dt; f.y += f.vy * dt; f.a -= dt * 0.8; c.fillStyle = `rgba(${f.c},${Math.max(0, f.a)})`; c.beginPath(); c.arc(f.x, f.y, 3, 0, Math.PI * 2); c.fill(); }); fx = fx.filter((f) => f.a > 0);
        // 물방울
        blob(c, x, y, 14, phase === 'sky');
        const lab = NOTE[phase][1]; if (lab && k < 3.5) badge(c, `에너지 ${lab}`, x, y - 40, lab === '흡수');
        // 계기
        c.fillStyle = 'rgba(10,16,32,.7)'; c.beginPath(); c.roundRect(W - 168, H - 46, 156, 34, 10); c.fill();
        P.txt(c, `증발 ${laps + (['sky', 'cloud', 'rain', 'river'].includes(phase) ? 1 : 0)} · 돌아옴 ${laps}`, W - 90, H - 23, '#fff3d6', '800 15px');
      },
      down(p) { if (['sea', 'sky', 'cloud'].includes(phase) && Math.hypot(p.x - x, p.y - y) < 60) drag = true; },
      move(p, e, held) { if (held && drag) { x = p.x; y = p.y; } },
      up(p) { if (!drag) return; drag = false; drop2(p.x, p.y); },
      key(e) { if (e.key === ' ' || e.key === 'Enter') { next(); return true; } if (e.key === '0') { laps = 0; set('sea'); return true; } return false; },
    });
    root._dr2 = { go: (p) => { set(p); return phase; } };
    say(NOTE.sea[0]);
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Drop = { mount };
})();
