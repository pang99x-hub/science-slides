/* 3-1 4차시 체험 «투명 용기 속 작은 지구»(교과서 121쪽 창의력 키움).
   유리병 단면에 재료 카드(자갈·모래·흙·다육식물·이끼·물·분무기·뚜껑)를 끌어 넣으면 층이 쌓이고 식물이 자리 잡고 물이 고인다.
   자갈 → 모래 → 흙 순서가 아니면 튕기며 안내한다. 뚜껑을 덮으면 램프 빛을 받아 물이 증발 → 유리벽에 물방울이 맺힘 →
   흘러내림이 계속 돌고, 잎에서 광합성 반짝임이 난다. 다 만들면 병 속 요소를 눌러 권역(지권·수권·기권·생물권)을 찾는다.
   키보드: 왼쪽·오른쪽 화살표로 카드(뚜껑을 덮은 뒤엔 요소) 고르기, 엔터로 넣기(누르기), 0 처음부터.
   양·속도는 이해를 돕기 위한 그림. Terra.mount(root) → { fit, setActive } · 시험용: root._te.add(k) · close() · tap(k) · state() */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const CARDS = [
    { k: 'gravel', n: '자갈', c: '#9a8f84' }, { k: 'sand', n: '모래', c: '#e3c88e' }, { k: 'soil', n: '흙', c: '#6b4a2f' },
    { k: 'succ', n: '다육식물', c: '#6fae6a' }, { k: 'moss', n: '이끼', c: '#4f8f3a' }, { k: 'water', n: '물', c: '#5aa9f0' },
    { k: 'spray', n: '분무기', c: '#9fd3f5' }, { k: 'lid', n: '뚜껑', c: '#5a6270' },
  ];
  // 누를 수 있는 요소 → 권역
  const SPH = {
    gravel: ['geo', '자갈·모래·흙 — 지권', '바닥의 돌과 흙은 땅을 이루는 지권. 식물 뿌리가 자리 잡고 물이 스며든다.'],
    water: ['hyd', '고인 물 — 수권', '바닥에 고인 물과 흙 속 물기는 수권. 증발해 다시 비처럼 돌아온다.'],
    air: ['atm', '병 속 공기 — 기권', '뚜껑 아래 공기는 기권. 수증기를 싣고 다니며 식물에 이산화 탄소를 준다.'],
    plant: ['bio', '다육식물·이끼 — 생물권', '살아 있는 식물은 생물권. 빛으로 광합성을 하고 잎에서 물을 내보낸다.'],
    lamp: ['sun', '램프 빛 — 바깥에서 오는 에너지', '권역이 아니라 에너지원. 지구의 태양처럼 병 속 물을 데워 순환을 돌린다.'],
  };
  const SPH_N = { geo: '지권', hyd: '수권', atm: '기권', bio: '생물권' };

  function mount(root) {
    const stage = root.querySelector('.te-stage'), now = root.querySelector('.te-now'), out = root.querySelector('.te-out');
    const P = window.Play;
    let have, closed, vapor, drops, falls, sparks, mist, cycles, found, drag, sel, selR, msg, t, bounce, bg = null, bgKey = '', tickT = 0;
    function reset() { have = new Set(); closed = false; vapor = []; drops = []; falls = []; sparks = []; mist = []; cycles = 0; found = new Set(); drag = null; sel = 0; selR = 0; msg = ''; t = 0; bounce = null; }
    reset();
    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };
    const L = (H) => H - 72; // 카드 받침 위
    const J = () => { const W = S.W, H = S.H; return { x0: W * 0.16, x1: W * 0.6, y0: H * 0.1, y1: L(H) - 16 }; };
    const LAYER = { gravel: 0.12, sand: 0.08, soil: 0.15 };
    const surf = () => { const j = J(), h = j.y1 - j.y0; let y = j.y1; ['gravel', 'sand', 'soil'].forEach((k) => { if (have.has(k)) y -= h * LAYER[k]; }); return y; };
    const cardPos = (i) => [S.W * (0.07 + i * 0.123), L(S.H) + 36];
    const lampPos = () => [S.W * 0.83, S.H * 0.16];
    const puddle = () => { const j = J(); return { x: j.x0 + (j.x1 - j.x0) * 0.74, w: (j.x1 - j.x0) * 0.22 }; };

    function add(k) {
      if (have.has(k)) return false;
      const need = { sand: 'gravel', soil: 'sand' }[k];
      let why = '';
      if (k === 'gravel' || k === 'sand' || k === 'soil') { if (need && !have.has(need)) why = '아래부터 <b>자갈 → 모래 → 흙</b> 순서로 깔자 — 물이 잘 빠지게.'; }
      else if (k === 'succ' || k === 'moss') { if (!have.has('soil')) why = '식물은 <b>흙</b>을 깐 다음에 심는다.'; }
      else if (k === 'water') { if (!have.has('soil')) why = '흙을 먼저 깔아야 물이 고일 자리가 생긴다.'; }
      else if (k === 'spray') { if (!have.has('succ') && !have.has('moss')) why = '분무기는 <b>식물</b>을 심은 뒤에 뿌린다.'; }
      else if (k === 'lid') { const left = CARDS.filter((q) => q.k !== 'lid' && !have.has(q.k)).map((q) => q.n); if (left.length) why = `재료를 다 넣고 덮자 — 남은 것: ${left.join('·')}`; }
      if (why) { say(why); return false; }
      have.add(k);
      const j = J();
      if (k === 'spray') for (let i = 0; i < 40; i++) mist.push({ x: j.x0 + 30 + Math.random() * (j.x1 - j.x0 - 60), y: j.y0 + 20 + Math.random() * 40, vy: 30 + Math.random() * 40, life: 1.4 });
      if (k === 'lid') closed = true;
      falls.push({ k, s: 0 });
      say({ gravel: '자갈을 깔았다 — 맨 아래에서 물이 빠지는 길이 된다.', sand: '모래를 덮었다 — 흙이 자갈 틈으로 새지 않게 막는다.', soil: '흙을 깔았다 — 식물이 뿌리내릴 자리.', succ: '다육식물을 심었다.', moss: '이끼를 덮었다 — 흙의 물기를 붙잡는다.', water: '얕은 곳에 물을 부어 고이게 했다.', spray: '분무기로 식물에 물을 듬뿍 뿌렸다.', lid: '뚜껑을 덮었다 — 이제 병 안의 물은 밖으로 나가지 못한다. 램프 빛을 받아 돌기 시작한다.' }[k]);
      steps(); S.kick(); return true;
    }
    function tap(k) {
      if (!closed) { say('먼저 작은 지구를 다 만들고 뚜껑을 덮자.'); return false; }
      const s = SPH[k]; if (!s) return false;
      if (s[0] !== 'sun') found.add(s[0]);
      sparks.push({ k, life: 1.2 });
      say(`<b>${s[1]}</b> — ${s[2]}`); steps(); S.kick(); return true;
    }
    function hit(p) {
      const j = J(), y = surf(), pd = puddle(), [lx, ly] = lampPos();
      if (Math.hypot(p.x - lx, p.y - ly) < 50) return 'lamp';
      if (p.x < j.x0 - 10 || p.x > j.x1 + 10 || p.y < j.y0 - 10 || p.y > j.y1 + 10) return null;
      if (Math.abs(p.x - pd.x) < pd.w * 0.7 && Math.abs(p.y - y) < 22) return 'water';
      if (p.y > y - 6) return 'gravel';
      if (p.y > y - 70 && (Math.abs(p.x - (j.x0 + (j.x1 - j.x0) * 0.3)) < 50 || Math.abs(p.x - (j.x0 + (j.x1 - j.x0) * 0.52)) < 40)) return 'plant';
      return 'air';
    }

    function step(dt) {
      t += dt;
      falls.forEach((f) => { f.s = Math.min(1, f.s + dt * 2.2); }); falls = falls.filter((f) => f.s < 1);
      mist.forEach((m) => { m.y += m.vy * dt; m.life -= dt; }); mist = mist.filter((m) => m.life > 0 && m.y < surf());
      sparks.forEach((s) => { s.life -= dt; }); sparks = sparks.filter((s) => s.life > 0);
      if (bounce) { bounce.s += dt * 2.5; if (bounce.s >= 1) bounce = null; }
      if (!closed) return;
      const j = J(), y = surf(), pd = puddle();
      // 증발(고인 물)·잎에서 내보내는 물(증산)
      if (Math.random() < dt * 9) { const leaf = Math.random() < 0.35, x = leaf ? j.x0 + (j.x1 - j.x0) * (0.3 + (Math.random() - 0.5) * 0.12) : pd.x + (Math.random() - 0.5) * pd.w; vapor.push({ x, y: leaf ? y - 40 : y - 3, vx: (Math.random() - 0.5) * 20, vy: -(30 + Math.random() * 25) }); }
      vapor.forEach((v) => {
        v.x += v.vx * dt + Math.sin(t * 3 + v.y * 0.05) * 0.3; v.y += v.vy * dt;
        const wall = v.x < j.x0 + 8 ? j.x0 + 5 : v.x > j.x1 - 8 ? j.x1 - 5 : null;
        if (v.y < j.y0 + 12 || wall !== null || (v.y < j.y0 + 70 && Math.random() < dt * 0.6)) {
          v.dead = true; const x = wall !== null ? wall : v.x, yy = Math.max(j.y0 + 8, v.y);
          const near = drops.find((d) => Math.abs(d.x - x) < 14 && Math.abs(d.y - yy) < 14);
          const still = drops.filter((d) => !d.fall), tgt = near || (still.length >= 40 ? still[Math.floor(Math.random() * still.length)] : null);
          if (tgt) tgt.r = Math.min(6, tgt.r + 0.7); else drops.push({ x, y: yy, r: 1.6, fall: false, onLid: wall === null });
        }
      });
      vapor = vapor.filter((v) => !v.dead);
      drops.forEach((d) => {
        if (!d.fall) d.r += dt * 0.5; // 맺힌 물방울은 수증기를 계속 모아 커진다
        if (!d.fall && d.r > 4.2) { d.fall = true; if (d.onLid) { d.x = d.x < (j.x0 + j.x1) / 2 ? j.x0 + 5 : j.x1 - 5; } }
        if (d.fall) { d.y += 150 * dt; if (d.y >= y - 2) { d.dead = true; cycles += 1; } }
      });
      drops = drops.filter((d) => !d.dead);
      if (Math.random() < dt * 1.6) { const pl = have.has('succ') ? 0.3 : 0.52; sparks.push({ k: 'photo', x: j.x0 + (j.x1 - j.x0) * (pl + (Math.random() - 0.5) * 0.1), y: y - 20 - Math.random() * 30, life: 0.8 }); }
    }

    function steps() {
      const ok = []; if (CARDS.every((q) => q.k === 'lid' || have.has(q.k))) ok.push(1); if (closed && cycles >= 8) ok.push(2); if (found.size >= 4) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 재료 카드를 병에 끌어 넣자 — 아래부터 자갈' : st === 2 ? (closed ? '② 램프 빛에 물이 도는 모습을 지켜보자' : '② 뚜껑 카드를 끌어 병을 덮자') : st === 3 ? `③ 병 속을 눌러 네 권역을 찾자 (${found.size}/4)` : '작은 지구 안에서도 물과 에너지가 돈다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }

    function paintBg(W, H) {
      const k = Math.max(1, Math.min(2, window.devicePixelRatio || 1)), cv = document.createElement('canvas'); cv.width = W * k; cv.height = H * k;
      const c = cv.getContext('2d'); c.setTransform(k, 0, 0, k, 0, 0);
      const wall = c.createLinearGradient(0, 0, 0, H); wall.addColorStop(0, '#f3efe6'); wall.addColorStop(1, '#e2dccd'); c.fillStyle = wall; c.fillRect(0, 0, W, H);
      // 나무 탁자
      const ty = L(H) - 16, tb = c.createLinearGradient(0, ty, 0, H); tb.addColorStop(0, '#b98a5a'); tb.addColorStop(0.2, '#9a6d42'); tb.addColorStop(1, '#6e4a2a');
      c.fillStyle = tb; c.fillRect(0, ty, W, H - ty);
      c.strokeStyle = 'rgba(60,35,15,.25)'; c.lineWidth = 1.5; for (let i = 0; i < 6; i++) { c.beginPath(); for (let x = 0; x <= W; x += 20) { const y = ty + 10 + i * 10 + Math.sin(x * 0.02 + i) * 2; x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
      // 카드 받침
      c.fillStyle = 'rgba(29,36,51,.82)'; c.fillRect(0, L(H), W, H - L(H));
      // 램프 스탠드
      const [lx, ly] = [W * 0.83, H * 0.16];
      c.strokeStyle = '#3a3f4a'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(W * 0.9, ty); c.lineTo(W * 0.9, H * 0.45); c.lineTo(lx + 18, ly + 8); c.stroke();
      const bs = c.createLinearGradient(W * 0.86, 0, W * 0.94, 0); bs.addColorStop(0, '#4a505c'); bs.addColorStop(1, '#2a2e36'); c.fillStyle = bs; c.beginPath(); c.ellipse(W * 0.9, ty, 34, 7, 0, 0, TAU); c.fill();
      return cv;
    }

    function rock(c, x, y, r, col) { const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r); g.addColorStop(0, '#d8d0c6'); g.addColorStop(1, col); c.fillStyle = g; c.beginPath(); c.ellipse(x, y, r * 1.2, r, (x * 7) % 3, 0, TAU); c.fill(); }

    function drawJar(c, W, H) {
      const j = J(), y = surf(), h = j.y1 - j.y0, rr = 26;
      const shape = () => { c.beginPath(); c.moveTo(j.x0, j.y0); c.lineTo(j.x0, j.y1 - rr); c.quadraticCurveTo(j.x0, j.y1, j.x0 + rr, j.y1); c.lineTo(j.x1 - rr, j.y1); c.quadraticCurveTo(j.x1, j.y1, j.x1, j.y1 - rr); c.lineTo(j.x1, j.y0); };
      // 병 속 공기(뚜껑을 덮으면 살짝 뿌옇게)
      c.save(); shape(); c.closePath(); c.clip();
      c.fillStyle = closed ? `rgba(220,236,245,${0.25 + Math.min(0.2, cycles * 0.01)})` : 'rgba(225,238,246,.18)'; c.fillRect(j.x0, j.y0, j.x1 - j.x0, h);
      // 층
      let base = j.y1; const fallOf = (k) => { const f = falls.find((q) => q.k === k); return f ? f.s : 1; };
      [['gravel', '#8a8178'], ['sand', '#e3c88e'], ['soil', '#5a3d26']].forEach(([k, col]) => {
        if (!have.has(k)) return; const th = h * LAYER[k], s = fallOf(k), top = base - th, dy = (1 - s) * (top - j.y0);
        const g = c.createLinearGradient(0, top, 0, base); g.addColorStop(0, col); g.addColorStop(1, k === 'soil' ? '#3a2616' : k === 'sand' ? '#c7a76a' : '#5e564e');
        c.globalAlpha = s; c.fillStyle = g; c.fillRect(j.x0, top - dy, j.x1 - j.x0, th);
        if (k === 'gravel') for (let i = 0; i < 46; i++) rock(c, j.x0 + 8 + ((i * 53) % 97) / 97 * (j.x1 - j.x0 - 16), top - dy + 6 + ((i * 31) % 17) / 17 * (th - 10), 5 + (i % 4), '#6e655c');
        if (k === 'sand') { c.fillStyle = 'rgba(255,255,255,.35)'; for (let i = 0; i < 120; i++) c.fillRect(j.x0 + ((i * 71) % 211) / 211 * (j.x1 - j.x0), top - dy + ((i * 13) % 29) / 29 * th, 1.5, 1.5); }
        if (k === 'soil') { c.fillStyle = 'rgba(20,10,4,.35)'; for (let i = 0; i < 90; i++) c.fillRect(j.x0 + ((i * 89) % 223) / 223 * (j.x1 - j.x0), top - dy + ((i * 17) % 31) / 31 * th, 2, 2); }
        c.globalAlpha = 1; base = top;
      });
      // 물웅덩이
      if (have.has('water')) { const pd = puddle(), s = fallOf('water'), g = c.createLinearGradient(0, y - 4, 0, y + 10); g.addColorStop(0, 'rgba(120,190,240,.95)'); g.addColorStop(1, 'rgba(40,110,180,.95)'); c.fillStyle = g; c.beginPath(); c.ellipse(pd.x, y + 3, pd.w * 0.5 * s, 9, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(pd.x, y + 1, pd.w * 0.3 * s, 3 + Math.sin(t * 2), 0, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); }
      // 이끼
      if (have.has('moss')) { const s = fallOf('moss'), mx = j.x0 + (j.x1 - j.x0) * 0.52; for (let i = 0; i < 16; i++) { const x = mx - 44 + i * 6, r = 6 + (i % 3) * 2, g = c.createRadialGradient(x - 2, y - 6, 1, x, y - 2, r); g.addColorStop(0, '#9ad06a'); g.addColorStop(1, '#2f6a28'); c.fillStyle = g; c.globalAlpha = s; c.beginPath(); c.arc(x, y - 2 - (1 - s) * 40, r, Math.PI, 0); c.fill(); } c.globalAlpha = 1; }
      // 다육식물(장미 모양 잎)
      if (have.has('succ')) {
        const s = fallOf('succ'), px = j.x0 + (j.x1 - j.x0) * 0.3, py = y - (1 - s) * 60;
        c.save(); c.translate(px, py); c.scale(1.7, 1.7); c.translate(-px, -py);
        c.strokeStyle = '#5a3d26'; c.lineWidth = 2; for (let i = 0; i < 5; i++) { c.beginPath(); c.moveTo(px, py + 2); c.lineTo(px - 12 + i * 6, py + 18); c.stroke(); }
        for (let ring = 0; ring < 3; ring++) for (let i = 0; i < 7; i++) {
          const a = -Math.PI + (i / 6) * Math.PI, len = 34 - ring * 9, lx = px + Math.cos(a) * len * 0.55, ly = py - 8 - ring * 9 + Math.sin(a) * len * 0.5;
          const g = c.createLinearGradient(px, py, lx, ly); g.addColorStop(0, '#4f8f5a'); g.addColorStop(1, ring === 2 ? '#bfe6a8' : '#8fcf88');
          c.fillStyle = g; c.beginPath(); c.ellipse((px + lx) / 2, (py - 6 - ring * 9 + ly) / 2, len * 0.32, 7 - ring, a, 0, TAU); c.fill();
        }
        c.restore();
      }
      // 분무 안개
      mist.forEach((m) => { c.fillStyle = `rgba(200,230,255,${Math.min(0.8, m.life)})`; c.beginPath(); c.arc(m.x, m.y, 2, 0, TAU); c.fill(); });
      // 수증기·물방울
      vapor.forEach((v) => { c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.arc(v.x, v.y, 2.2, 0, TAU); c.fill(); });
      drops.forEach((d) => { const g = c.createRadialGradient(d.x - d.r * 0.3, d.y - d.r * 0.3, 0.5, d.x, d.y, d.r); g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(110,170,230,.75)'); c.fillStyle = g; c.beginPath(); c.arc(d.x, d.y, d.r, 0, TAU); c.fill(); if (d.fall) { c.strokeStyle = 'rgba(140,190,240,.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(d.x, d.y - 14); c.lineTo(d.x, d.y - 2); c.stroke(); } });
      // 광합성·요소 누름 반짝임
      sparks.forEach((s) => {
        const a = Math.min(1, s.life * 1.5);
        if (s.k === 'photo') { P.glow(c, s.x, s.y, 10, `rgba(255,250,170,${a})`); return; }
        const pd = puddle(), pts = { gravel: [(j.x0 + j.x1) / 2, (y + j.y1) / 2], water: [pd.x, y], air: [(j.x0 + j.x1) / 2, j.y0 + (y - j.y0) * 0.4], plant: [j.x0 + (j.x1 - j.x0) * 0.3, y - 30], lamp: lampPos() }[s.k];
        if (pts) P.glow(c, pts[0], pts[1], 70, `rgba(255,216,77,${a * 0.55})`);
      });
      c.restore();
      // 유리(두께·반사광)
      c.lineWidth = 5; c.strokeStyle = 'rgba(160,200,220,.85)'; shape(); c.stroke();
      c.lineWidth = 2; c.strokeStyle = 'rgba(255,255,255,.9)'; shape(); c.stroke();
      const hl = c.createLinearGradient(j.x0, 0, j.x0 + 26, 0); hl.addColorStop(0, 'rgba(255,255,255,.55)'); hl.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = hl; c.fillRect(j.x0 + 6, j.y0 + 14, 18, (j.y1 - j.y0) * 0.7);
      c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(j.x1 - 18, j.y0 + 30, 6, (j.y1 - j.y0) * 0.45);
      // 입구 테두리 · 뚜껑
      c.fillStyle = 'rgba(170,205,225,.9)'; c.fillRect(j.x0 - 6, j.y0 - 6, j.x1 - j.x0 + 12, 8);
      if (closed) { const s = falls.find((f) => f.k === 'lid'), dy = s ? (1 - s.s) * -60 : 0, g = c.createLinearGradient(0, j.y0 - 22, 0, j.y0); g.addColorStop(0, '#7a8494'); g.addColorStop(1, '#3a404c'); c.fillStyle = g; c.beginPath(); c.roundRect(j.x0 - 12, j.y0 - 22 + dy, j.x1 - j.x0 + 24, 18, 5); c.fill(); c.fillStyle = '#2a2e36'; c.beginPath(); c.roundRect((j.x0 + j.x1) / 2 - 18, j.y0 - 32 + dy, 36, 12, 4); c.fill(); }
    }

    function drawCard(c, q, x, y, a, edge, gone) {
      const w = S.W * 0.112, h = 40; c.globalAlpha = a;
      c.fillStyle = gone ? 'rgba(255,255,255,.15)' : '#fbfaf5'; c.strokeStyle = edge; c.lineWidth = gone ? 1 : 3; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, 9); c.fill(); c.stroke();
      if (!gone) { c.fillStyle = q.c; c.beginPath(); c.arc(x - w / 2 + 16, y, 8, 0, TAU); c.fill(); P.txt(c, q.n, x + 8, y + 6, '#1d2433', `800 ${w < 90 ? 13 : 16}px`); }
      else P.txt(c, '✓ ' + q.n, x, y + 5, 'rgba(255,255,255,.6)', '700 13px');
      c.globalAlpha = 1;
    }

    const S = P.make(stage, {
      draw(c, W, H, dt) {
        if (dt) step(Math.min(dt, 0.05));
        const key = `${W}x${H}`; if (key !== bgKey) { bg = paintBg(W, H); bgKey = key; } c.drawImage(bg, 0, 0, W, H);
        const [lx, ly] = lampPos(), j = J();
        // 램프 빛(뚜껑을 덮으면 켜짐)
        if (closed) { const g = c.createLinearGradient(lx, ly, j.x1, surf()); g.addColorStop(0, 'rgba(255,236,150,.55)'); g.addColorStop(1, 'rgba(255,236,150,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(lx - 20, ly + 10); c.lineTo(lx + 20, ly + 14); c.lineTo(j.x1 - 10, surf()); c.lineTo(j.x0 + 40, surf()); c.closePath(); c.fill(); }
        drawJar(c, W, H);
        // 램프 갓
        const sh = c.createLinearGradient(lx - 40, ly - 20, lx + 30, ly + 20); sh.addColorStop(0, '#5a606c'); sh.addColorStop(1, '#2a2e36'); c.fillStyle = sh; c.beginPath(); c.moveTo(lx - 44, ly + 14); c.lineTo(lx - 14, ly - 18); c.lineTo(lx + 22, ly - 12); c.lineTo(lx + 30, ly + 22); c.closePath(); c.fill();
        P.glow(c, lx - 6, ly + 16, closed ? 46 + Math.sin(t * 3) * 3 : 18, closed ? 'rgba(255,240,170,.95)' : 'rgba(255,255,255,.4)');
        P.txt(c, closed ? '램프(햇빛 대신)' : '램프', lx, ly + 52, '#1d2433', '800 13px');
        // 권역 이름표(찾은 것)
        const pd = puddle(), y = surf(), tagAt = { geo: [j.x0 + 50, (y + j.y1) / 2], hyd: [pd.x, y + 26], atm: [(j.x0 + j.x1) / 2, j.y0 + 40], bio: [j.x0 + (j.x1 - j.x0) * 0.3, y - 74] };
        found.forEach((s) => { const [x, yy] = tagAt[s]; c.fillStyle = 'rgba(29,36,51,.85)'; c.beginPath(); c.roundRect(x - 34, yy - 14, 68, 24, 8); c.fill(); P.txt(c, SPH_N[s], x, yy + 4, '#ffd84d', '800 14px'); });
        if (closed && found.size < 4 && cycles >= 2) { const a = 0.5 + 0.5 * Math.sin(t * 4); P.txt(c, '병 속 흙·물·공기·식물을 눌러 보자', (j.x0 + j.x1) / 2, j.y0 + 100, `rgba(29,36,51,${0.6 + a * 0.4})`, '800 14px'); }
        // 순환 계기
        if (closed) P.txt(c, `맺혔다 흘러내린 물방울 ${cycles}`, W * 0.8, L(H) - 34, '#1d2433', '800 14px');
        // 카드
        CARDS.forEach((q, i) => { if (drag && drag.k === q.k) return; const [x, cy] = cardPos(i); let dx = 0; if (bounce && bounce.k === q.k) dx = Math.sin(bounce.s * 18) * 8 * (1 - bounce.s); drawCard(c, q, x + dx, cy, 1, i === sel && !closed ? '#ffd84d' : '#5a6a90', have.has(q.k)); });
        if (!drag && !closed) { const i = CARDS.findIndex((q) => !have.has(q.k)); if (i >= 0) { const [x, cy] = cardPos(i), a = 0.5 + 0.5 * Math.sin(t * 4); c.strokeStyle = `rgba(255,216,77,${a})`; c.lineWidth = 3; c.beginPath(); c.roundRect(x - W * 0.06, cy - 24, W * 0.12, 48, 11); c.stroke(); } }
        if (drag) { drawCard(c, CARDS.find((q) => q.k === drag.k), drag.x, drag.y, 0.92, '#ffd84d', false); const over = drag.x > j.x0 - 40 && drag.x < j.x1 + 40 && drag.y < L(H); if (over) { c.strokeStyle = 'rgba(255,216,77,.9)'; c.lineWidth = 4; c.setLineDash([8, 6]); c.strokeRect(j.x0 - 8, j.y0 - 8, j.x1 - j.x0 + 16, j.y1 - j.y0 + 16); c.setLineDash([]); } }
        tickT += dt; if (tickT > 0.25 || !dt) { tickT = 0; steps(); }
      },
      down(p) {
        if (p.y > L(S.H)) { const i = CARDS.findIndex((q, k) => { const [x, y] = cardPos(k); return !have.has(q.k) && Math.abs(p.x - x) < S.W * 0.06 && Math.abs(p.y - y) < 26; }); if (i >= 0) { sel = i; drag = { k: CARDS[i].k, x: p.x, y: p.y }; } return; }
        const h = hit(p); if (h) tap(h);
      },
      move(p, e, held) { if (held && drag) { drag.x = p.x; drag.y = p.y; } },
      up() {
        if (!drag) return; const j = J(), k = drag.k, over = drag.x > j.x0 - 40 && drag.x < j.x1 + 40 && drag.y < L(S.H); drag = null;
        if (over && !add(k)) bounce = { k, s: 0 };
      },
      key(e) {
        const R = ['gravel', 'water', 'air', 'plant', 'lamp'];
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const d = e.key === 'ArrowRight' ? 1 : -1; if (closed) { selR = (selR + d + R.length) % R.length; say(`고른 곳: ${SPH[R[selR]][1].split(' — ')[0]} — 엔터로 누르기`); } else sel = (sel + d + CARDS.length) % CARDS.length; return true; }
        if (e.key === 'Enter' || e.key === ' ') { if (closed) tap(R[selR]); else if (!add(CARDS[sel].k)) bounce = { k: CARDS[sel].k, s: 0 }; return true; }
        if (e.key === '0') { reset(); steps(); return true; }
        return false;
      },
    });
    root.querySelector('.te-reset').addEventListener('click', () => { reset(); msg = ''; say('재료 카드를 끌어 병에 넣자 — <b>맨 아래는 자갈</b>.'); steps(); S.kick(); });
    say('재료 카드를 끌어 병에 넣자 — <b>맨 아래는 자갈</b>.'); steps();
    const run = (sec) => { for (let k = 0; k < sec * 30; k++) step(1 / 30); steps(); S.kick(); };
    root._te = {
      add: (k) => { const r = add(k); run(0.6); return r; },
      close: () => { const r = add('lid'); run(4); return r; },
      tap: (k) => tap(k),
      run,
      state: () => ({ have: [...have], closed, cycles, found: [...found], drops: drops.length }),
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Terra = { mount };
})();
