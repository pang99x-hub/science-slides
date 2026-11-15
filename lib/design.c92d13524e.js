/* 3-2 4차시 체험 «안전장치 설계실»(교과서 136~137쪽 탐구 프로젝트(교통·스포츠의 충격 줄이기)
   + 141쪽 창의력 키움 «드론의 안전을 지켜라» + 참고서 충돌과 안전장치·관성과 안전장치).
   위: 분야 표지 넷(교통 · 스포츠 · 학교생활 · 드론)을 눌러 고른다. 가운데: 시험 대상(안전모를 쓴 머리 단면 · 정강이 보호대 단면 · 계단 모서리 · 드론).
   아래 재료 받침에서 재료를 끌어 점선 자리(겉 껍질 · 안쪽 완충 · 고정 띠 / 드론: 프로펠러 둘레 · 몸체 범퍼 · 몸체 위 · 조종 장치)에 놓는다.
   시험 추(드론은 드론)를 당겼다 놓으면 부딪힌다: 충격량 J = m v는 그대로, 충돌 시간 Δt = 기본 + 완충재가 더하는 시간 → 최대 힘 = πJ / (2Δt)(반 사인꼴 힘).
   고정 띠가 없으면 보호구가 관성으로 벗겨져 날아간다. 드론은 부딪힌 뒤 떨어지고(낙하산이면 천천히), «통신 끊김» 카드로 신호가 끊긴 상황을 본다(자동 귀환).
   오른쪽 칸: 교과서 평가 기준(과학 원리 · 실현 가능성 · 유용성 · 창의성) 별표와 고려 사항(위험 요소 · 관성/운동량/충격량 · 독창성 · 친환경).
   ① 분야를 골라 재료를 붙인다 ② 충돌 시험으로 힘이 줄었는지 본다(완충재를 붙이고 시험) ③ 다른 분야 하나를 더 설계해 시험한다.
   질량·빠르기·시간·위험선은 이해를 돕기 위한 예. 화면은 느린 화면.
   Design.mount(root) → { fit, setActive } · 시험용: root._ds.field(k) · attach(재료[, 자리]) · remove(자리) · test(당김 0~1) · comm() · state() · geo() */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const FIELDS = {
    car: { name: '교통 안전', who: '자전거 탄 사람의 머리(안전모 단면)', m: 5, v: 6, t0: 3, safe: 5000, hit: '연석 모형 추',
      zones: { OUT: '안전모 겉', IN: '안전모 안쪽', FIX: '턱끈' }, risk: [['넘어지며 머리가 연석에 부딪힘', ['IN', 'OUT']], ['안전모가 벗겨져 날아감', ['FIX']]] },
    sport: { name: '스포츠 안전', who: '축구 선수의 정강이·무릎(보호대 단면)', m: 3, v: 5, t0: 3, safe: 3000, hit: '상대 선수 축구화',
      zones: { OUT: '보호대 겉', IN: '보호대 안쪽', FIX: '종아리 띠' }, risk: [['상대 발에 정강이를 차임', ['IN', 'OUT']], ['보호대가 흘러내림', ['FIX']]] },
    school: { name: '학교생활 안전', who: '계단 모서리(보호재 단면)', m: 4, v: 3, t0: 2.5, safe: 3000, hit: '머리 모형',
      zones: { OUT: '모서리 덮개', IN: '모서리 완충', FIX: '고정 띠' }, risk: [['미끄러져 모서리에 머리를 부딪힘', ['IN', 'OUT']], ['보호재가 밀려 떨어짐', ['FIX']]] },
    drone: { name: '드론', who: '나무를 향해 나는 드론', m: 1.2, v: 8, t0: 2, safe: 2500, hit: '드론',
      zones: { RING: '프로펠러 둘레', IN: '몸체 범퍼', TOP: '몸체 위', CHIP: '조종 장치' }, risk: [['다른 드론·장애물과 충돌', ['RING', 'IN']], ['비행 제어·통신 끊김', ['CHIP', 'TOP']]] },
  };
  const ORDER = ['car', 'sport', 'school', 'drone'];
  // add: 더하는 충돌 시간(ms) · z: 붙는 자리 · crit: 평가 기준 별 · cons: 고려 사항(in 관성 · mo 운동량 · im 충격량 · orig 독창성 · eco 친환경)
  const MATS = {
    sponge: { name: '스펀지', add: 6, z: ['IN'], crit: ['sci', 'real'], cons: ['im'], info: '<b>스펀지</b> — 눌리면서 천천히 멈추게 해 충돌 시간을 늘린다. 농구대 기둥·보호대 안쪽에 쓰인다.' },
    honey: { name: '벌집 구조', add: 8, z: ['IN'], crit: ['sci', 'new'], cons: ['im', 'orig'], info: '<b>벌집 구조</b> — 육각 칸이 차례로 찌그러지며 시간을 끈다. 가볍고 단단해 다리 보호대에 알맞다.' },
    air: { name: '공기 주머니', add: 12, z: ['IN'], crit: ['sci', 'new'], cons: ['im', 'orig'], info: '<b>공기 주머니</b> — 갇힌 공기가 눌리며 오래 받쳐 준다. 에어백·에어 매트·뽁뽁이(공기 포장재)와 같은 원리.' },
    band: { name: '탄성 띠', add: 0, z: ['FIX'], crit: ['sci', 'use'], cons: ['in'], info: '<b>탄성 띠(안전띠)</b> — 몸과 보호구가 관성으로 튀어 나가지 않게 붙잡는다. 턱끈·자동차 안전띠가 하는 일.' },
    shell: { name: '플라스틱 껍질', add: 2, z: ['OUT'], crit: ['real', 'use'], cons: [], info: '<b>딱딱한 플라스틱 껍질</b> — 뾰족한 것을 막고 힘을 넓게 퍼뜨린다. 혼자서는 충돌 시간을 거의 늘리지 못한다.' },
    fiber: { name: '재활용 섬유', add: 4, z: ['IN', 'FIX'], crit: ['real', 'new'], cons: ['eco'], info: '<b>재활용 섬유</b> — 버려진 페트병·옷감을 다시 짠 푹신한 천. 친환경이고 피부에 닿아도 해롭지 않다.' },
    guard: { name: '프로펠러 보호대', add: 7, z: ['RING'], crit: ['sci', 'use'], cons: ['im'], info: '<b>프로펠러 보호대</b> — 날개 둘레 고리가 먼저 휘며 부딪히는 시간을 늘리고, 돌던 날개가 사람을 다치게 하지 않게 막는다.' },
    chute: { name: '낙하산', add: 0, z: ['TOP'], crit: ['sci', 'new'], cons: ['mo'], info: '<b>낙하산</b> — 멈춘 드론이 떨어질 때 빠르기를 줄여 땅에 닿을 때의 운동량을 작게 한다.' },
    rth: { name: '자동 귀환', add: 0, z: ['CHIP'], crit: ['use', 'new'], cons: ['orig'], info: '<b>자동 귀환 장치</b> — 조종 신호가 끊기면 위치 정보로 처음 떠오른 곳에 스스로 돌아온다.' },
  };
  const MORD = ['sponge', 'honey', 'air', 'band', 'shell', 'fiber', 'guard', 'chute', 'rth'];
  const DRONLY = ['guard', 'chute', 'rth'];
  const ZORD = { car: ['IN', 'OUT', 'FIX'], sport: ['IN', 'OUT', 'FIX'], school: ['IN', 'OUT', 'FIX'], drone: ['RING', 'IN', 'TOP', 'CHIP'] };
  const CUSH = ['IN', 'OUT', 'RING'];
  const msOf = (f, d) => FIELDS[f].t0 + CUSH.reduce((s, z) => s + (d[z] ? MATS[d[z]].add : 0), 0);
  const peak = (J, ms) => Math.PI * J / (2 * ms / 1000);
  const kN = (n) => (n / 1000).toFixed(1);
  const HDROP = 10, VFALL = Math.sqrt(2 * 9.8 * HDROP), VCHUTE = 3;
  // 자체 확인: 안전모(껍질+공기 주머니) 17 ms → 같은 충격량 30 N·s에서 최대 힘이 위험선 아래 · 맨머리는 위 · 껍질만은 여전히 위
  console.assert(msOf('car', { OUT: 'shell', IN: 'air' }) === 17 && peak(30, 17) < 5000 && peak(30, 3) > 5000 && peak(30, msOf('car', { OUT: 'shell' })) > 5000 && Math.abs(peak(30, 17) * 2 * 0.017 / Math.PI - 30) < 1e-9, 'design: 충격량');

  function why(f, k, z) {
    const M = MATS[k];
    if (f !== 'drone' && DRONLY.includes(k)) return `${M.name}는 드론 전용이다. 위쪽 «드론» 표지를 눌러 보자.`;
    if (f === 'drone' && k === 'shell') return '드론은 가벼워야 오래 난다 — 무거운 껍질 대신 <b>프로펠러 보호대</b>를 달자.';
    if (f === 'drone' && k === 'band') return '드론에는 묶어 둘 몸이 없다 — 떨어지는 것은 <b>낙하산</b>으로 대비한다.';
    if (k === 'shell') return '딱딱한 껍질은 <b>맨 겉</b>에 둔다. 안쪽이나 띠 자리에서는 시간을 늘리지 못한다.';
    if (k === 'band') return '탄성 띠는 몸에 묶는 <b>고정 띠</b> 자리에 둔다.';
    if (z === 'OUT') return '푹신한 재료가 겉에 있으면 쉽게 찢기고 긁힌다 — <b>안쪽 완충</b> 자리에 두자.';
    if (z === 'FIX') return '띠 자리에는 몸을 붙잡는 <b>탄성 띠</b>(또는 재활용 섬유 띠)가 맞다.';
    if (z === 'RING') return '날개 둘레에는 <b>프로펠러 보호대</b> 고리가 맞다. 푹신한 재료는 몸체 범퍼에.';
    if (z === 'TOP') return '몸체 위는 <b>낙하산</b> 자리다.';
    if (z === 'CHIP') return '조종 장치 자리에는 <b>자동 귀환 장치</b>가 들어간다.';
    return '이 자리에는 맞지 않는다.';
  }

  function mount(root) {
    const stage = root.querySelector('.ds-stage'), chip = root.querySelector('.ds-now'), out = root.querySelector('.ds-out');
    const P = window.Play;
    let fld, des, res, crashOk, ph, th, om, s0, hitT, hitD, cur, drag, msg, clock, shake, fly, dX, dY, dV, dPh, dT, chuteOpen, comm, sel, commBtn = null, bg = null, bgKey = '';

    function reset() {
      fld = 'car'; des = { car: {}, sport: {}, school: {}, drone: {} }; res = {}; crashOk = {}; comm = null;
      ph = 'idle'; th = 0; om = 0; s0 = 0; hitT = 0; hitD = 0; cur = null; drag = null; msg = ''; clock = 0; shake = 0; fly = null; sel = 0;
      dX = null; dY = null; dV = 0; dPh = 'hover'; dT = 0; chuteOpen = false;
      say('위쪽 <b>분야 표지</b>를 고르고, 아래 받침의 재료를 끌어 점선 자리에 붙이자. 재료를 그냥 누르면 쓰임새가 나온다.');
      panel();
    }
    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };

    // ── 자리 잡기 ──
    function geo() {
      const W = S.W, H = S.H, TOP = 112, SH = 146, sx0 = 0, sx1 = W - 384, sy0 = TOP, sy1 = H - SH - 8, sw = sx1 - sx0, sh = sy1 - sy0;
      const g = { W, H, TOP, sx0, sx1, sy0, sy1, sw, sh, gr: { x: W - 374, y: 10, w: 364, h: 252 }, rb: { x: W - 374, y: 272, w: 364, h: 150 },
        rk: { x: W - 374, y: 432, w: 364, h: sy1 - 432 }, shelf: { y: H - SH, h: SH - 6 }, cards: ORDER.map((k, i) => ({ k, x: 10 + i * 156, y: 10, w: 146, h: 92 })) };
      const d = des[fld];
      if (fld === 'car') {
        const R = Math.min(58, sh * 0.15), hx = sx0 + sw * 0.4, hy = sy0 + sh * 0.42, cy = -0.35 * R, inT = d.IN ? 14 : 0, outT = d.OUT ? 12 : 0;
        const r = R + 1 + inT + outT, surf = hx + Math.sqrt(r * r - cy * cy), full = hx + Math.sqrt((R + 27) ** 2 - cy * cy);
        Object.assign(g, { R, hx, hy, cy: hy + cy, inT, outT, surf, rbob: 34, px: full + 40, py: sy0 + 4, ax0: hx, ay0: hy, landY: sy1 - 74 - R - 22 });
      } else if (fld === 'sport') {
        const lx = sx0 + sw * 0.36, ky = sy0 + 74, ay = sy1 - 66, shin = lx + 26, inT = d.IN ? 14 : 0, outT = d.OUT ? 12 : 0;
        Object.assign(g, { lx, ky, ay, shin, inT, outT, cy: (ky + ay) / 2 + 6, surf: shin + inT + outT + 2, rbob: 36, px: shin + 26 + 42, py: sy0 - 30, ax0: shin, ay0: (ky + ay) / 2 - 6, landY: sy1 - 44 });
      } else if (fld === 'school') {
        const ex = sx0 + sw * 0.46, ey = sy0 + sh * 0.44, inT = d.IN ? 16 : 0, outT = d.OUT ? 8 : 0;
        Object.assign(g, { ex, ey, inT, outT, cy: ey + 18, surf: ex + inT + outT, rbob: 34, px: ex + 24 + 40, py: sy0 - 10, ax0: ex, ay0: ey, landY: sy1 - 34 - 58 });
      } else {
        const gy = sy1 - 30, tx = sx1 - 92, rest = tx - 150, dy = sy0 + sh * 0.4, ring = d.RING ? 38 : 28;
        Object.assign(g, { gy, tx, rest, dy, ring, home: sx0 + 70, reach: 82 + ring });
      }
      if (fld !== 'drone') g.L = g.cy - g.py;
      return g;
    }
    const bob = (g, t) => ({ x: g.px + g.L * Math.sin(t), y: g.py + g.L * Math.cos(t) });
    const thC = (g) => Math.asin(Math.max(-1, Math.min(1, (g.surf + g.rbob - g.px) / g.L))); // 이 설계의 겉면에 닿는 각
    const TMAX = 1.0;

    // ── 재료 무늬 ──
    const pats = {};
    function pat(c, k) {
      if (pats[k]) return pats[k];
      const n = 40, cv = document.createElement('canvas'); cv.width = n; cv.height = n; const x = cv.getContext('2d');
      let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
      if (k === 'sponge') { x.fillStyle = '#f2c23e'; x.fillRect(0, 0, n, n); for (let i = 0; i < 26; i++) { const a = rnd() * n, b = rnd() * n, r = 1 + rnd() * 2.6; x.fillStyle = 'rgba(160,110,10,.55)'; x.beginPath(); x.ellipse(a, b, r, r * 0.8, 0, 0, TAU); x.fill(); x.fillStyle = 'rgba(255,240,170,.6)'; x.beginPath(); x.arc(a - r * 0.4, b - r * 0.5, r * 0.4, 0, TAU); x.fill(); } }
      else if (k === 'honey') { x.fillStyle = '#c9d6e6'; x.fillRect(0, 0, n, n); x.strokeStyle = '#5d6f8c'; x.lineWidth = 1.6; const s = 6.6; for (let j = -1; j < 5; j++) for (let i = -1; i < 5; i++) { const cx = i * s * 1.73 + (j % 2 ? s * 0.866 : 0), cy = j * s * 1.5; x.beginPath(); for (let q = 0; q < 6; q++) { const a = Math.PI / 6 + q * Math.PI / 3; x.lineTo(cx + s * Math.cos(a), cy + s * Math.sin(a)); } x.closePath(); x.fillStyle = (i + j) % 2 ? '#d9e3ef' : '#bccbde'; x.fill(); x.stroke(); } }
      else if (k === 'air') { x.fillStyle = '#d9ecfb'; x.fillRect(0, 0, n, n); [[10, 10], [30, 10], [20, 28], [0, 28], [40, 28]].forEach(([a, b]) => { const gg = x.createRadialGradient(a - 3, b - 3, 1, a, b, 9); gg.addColorStop(0, '#ffffff'); gg.addColorStop(0.7, '#cfe6fa'); gg.addColorStop(1, '#7fb2df'); x.fillStyle = gg; x.beginPath(); x.arc(a, b, 8.5, 0, TAU); x.fill(); }); }
      else if (k === 'band') { x.fillStyle = '#2b3d68'; x.fillRect(0, 0, n, n); for (let i = 0; i < n; i += 5) { x.fillStyle = i % 10 ? '#33497a' : '#243458'; x.fillRect(i, 0, 3, n); } x.strokeStyle = 'rgba(255,214,90,.8)'; x.setLineDash([4, 3]); x.lineWidth = 1.2; x.beginPath(); x.moveTo(0, 5); x.lineTo(n, 5); x.moveTo(0, 35); x.lineTo(n, 35); x.stroke(); }
      else if (k === 'shell') { const gg = x.createLinearGradient(0, 0, n, n); gg.addColorStop(0, '#ef7046'); gg.addColorStop(1, '#c43f1d'); x.fillStyle = gg; x.fillRect(0, 0, n, n); }
      else if (k === 'fiber') { x.fillStyle = '#8fb08a'; x.fillRect(0, 0, n, n); for (let i = 0; i < n; i += 4) { x.strokeStyle = i % 8 ? 'rgba(60,96,58,.55)' : 'rgba(225,240,220,.5)'; x.lineWidth = 1.4; x.beginPath(); x.moveTo(i, 0); x.lineTo(i, n); x.stroke(); x.beginPath(); x.moveTo(0, i + 2); x.lineTo(n, i + 2); x.stroke(); } for (let i = 0; i < 9; i++) { x.fillStyle = ['#4f86c6', '#ffffff', '#d3584a'][i % 3]; x.fillRect(rnd() * n, rnd() * n, 4, 1.6); } }
      else if (k === 'guard') { x.fillStyle = '#3d434d'; x.fillRect(0, 0, n, n); x.fillStyle = '#58606c'; for (let i = 0; i < n; i += 8) x.fillRect(0, i, n, 3); }
      else if (k === 'chute') { for (let i = 0; i < n; i += 10) { x.fillStyle = (i / 10) % 2 ? '#ffffff' : '#f28a1f'; x.fillRect(i, 0, 10, n); } }
      else { x.fillStyle = '#1e2329'; x.fillRect(0, 0, n, n); x.strokeStyle = '#3bd27a'; x.lineWidth = 1.2; x.beginPath(); x.moveTo(4, 10); x.lineTo(20, 10); x.lineTo(20, 30); x.lineTo(36, 30); x.stroke(); x.fillStyle = '#3bd27a'; x.beginPath(); x.arc(20, 10, 2.2, 0, TAU); x.arc(36, 30, 2.2, 0, TAU); x.fill(); }
      return (pats[k] = c.createPattern(cv, 'repeat'));
    }
    function fillMat(c, k, shade) {
      c.fillStyle = pat(c, k); c.fill();
      if (k === 'shell') { c.save(); c.clip(); c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(-9999, -9999, 1e5, 1e5); c.restore(); }
      if (shade) { c.save(); c.clip(); c.fillStyle = shade; c.fillRect(-9999, -9999, 1e5, 1e5); c.restore(); }
      c.strokeStyle = 'rgba(29,36,51,.75)'; c.lineWidth = 1.5; c.stroke();
    }

    // ── 배경(분야마다 한 번) ──
    function paintBg(g) {
      const { W, H, TOP, sx1, sy0, sy1 } = g, k2 = Math.max(1, Math.min(2, window.devicePixelRatio || 1));
      const cv = document.createElement('canvas'); cv.width = W * k2; cv.height = H * k2; const c = cv.getContext('2d'); c.setTransform(k2, 0, 0, k2, 0, 0);
      // 맨 위 띠 · 오른쪽 칸 · 받침
      c.fillStyle = '#eef1f5'; c.fillRect(0, 0, W, H);
      c.fillStyle = '#e3e8ef'; c.fillRect(0, 0, W, TOP);
      c.fillStyle = '#f6f3ea'; c.fillRect(sx1, TOP, W - sx1, sy1 - TOP);
      // 장면
      c.save(); c.beginPath(); c.rect(0, sy0, sx1, sy1 - sy0); c.clip();
      if (fld === 'car') {
        const sk = c.createLinearGradient(0, sy0, 0, sy1); sk.addColorStop(0, '#8cc9ef'); sk.addColorStop(1, '#e3f2fb'); c.fillStyle = sk; c.fillRect(0, sy0, sx1, sy1 - sy0);
        // 먼 건물
        [[20, 120, 70], [100, 90, 60], [175, 140, 80], [470, 110, 70], [550, 150, 90]].forEach(([x, h, w]) => { c.fillStyle = '#b8c7d6'; c.fillRect(x, sy1 - 70 - h, w, h); c.fillStyle = 'rgba(255,255,255,.55)'; for (let yy = sy1 - 60 - h; yy < sy1 - 80; yy += 18) for (let xx = x + 8; xx < x + w - 10; xx += 16) c.fillRect(xx, yy, 8, 9); });
        c.fillStyle = '#6f8f5a'; c.fillRect(0, sy1 - 74, sx1, 10);
        const rd = c.createLinearGradient(0, sy1 - 64, 0, sy1); rd.addColorStop(0, '#5d6470'); rd.addColorStop(1, '#3d434d'); c.fillStyle = rd; c.fillRect(0, sy1 - 64, sx1, 64);
        c.fillStyle = '#f2f2f2'; for (let x = 10; x < sx1; x += 70) c.fillRect(x, sy1 - 30, 38, 5);
        c.fillStyle = '#c9c4ba'; c.fillRect(0, sy1 - 70, sx1, 8);
      } else if (fld === 'sport') {
        const sk = c.createLinearGradient(0, sy0, 0, sy1); sk.addColorStop(0, '#7fbfe8'); sk.addColorStop(0.55, '#d9eefa'); sk.addColorStop(0.56, '#5c9b4c'); sk.addColorStop(1, '#2f6e2c'); c.fillStyle = sk; c.fillRect(0, sy0, sx1, sy1 - sy0);
        const my = sy0 + (sy1 - sy0) * 0.555; c.fillStyle = '#d24c3f'; c.fillRect(0, my - 40, sx1, 30); c.fillStyle = '#b63a2f'; c.fillRect(0, my - 12, sx1, 12);
        for (let x = 0; x < sx1; x += 22) { c.fillStyle = ['#355ea8', '#e3b33b', '#fff', '#2f9e5b'][(x / 22) % 4 | 0]; c.beginPath(); c.arc(x + 11, my - 46, 6, 0, TAU); c.fill(); }
        for (let x = 0; x < sx1; x += 80) { c.fillStyle = 'rgba(255,255,255,.06)'; c.fillRect(x, my, 40, sy1 - my); }
        c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 4; c.beginPath(); c.moveTo(0, sy1 - 30); c.lineTo(sx1, sy1 - 30); c.stroke();
      } else if (fld === 'school') {
        const wl = c.createLinearGradient(0, sy0, 0, sy1); wl.addColorStop(0, '#f4ecd9'); wl.addColorStop(1, '#e5d6b6'); c.fillStyle = wl; c.fillRect(0, sy0, sx1, sy1 - sy0);
        c.fillStyle = '#b8d2c0'; c.fillRect(0, sy0 + 40, sx1, 6);
        // 창문
        const wx = sx1 - 230, wy = sy0 + 70; c.fillStyle = '#9dc8e6'; c.fillRect(wx, wy, 150, 110); c.strokeStyle = '#ffffff'; c.lineWidth = 8; c.strokeRect(wx, wy, 150, 110); c.lineWidth = 5; c.beginPath(); c.moveTo(wx + 75, wy); c.lineTo(wx + 75, wy + 110); c.moveTo(wx, wy + 55); c.lineTo(wx + 150, wy + 55); c.stroke();
        c.fillStyle = '#c7b48f'; c.fillRect(0, sy1 - 34, sx1, 34); c.fillStyle = '#ad9a74'; c.fillRect(0, sy1 - 34, sx1, 3);
        // 계단(오른쪽 아래에서 왼쪽 위로 오름)
        const { ex, ey } = g, sw2 = 96, shh = 58, fl = sy1 - 34;
        const conc = (x0, y0, x1) => { const gg = c.createLinearGradient(0, y0, 0, fl); gg.addColorStop(0, '#b9b4ab'); gg.addColorStop(1, '#8d877c'); c.fillStyle = gg; c.fillRect(x0, y0, x1 - x0, fl - y0); };
        for (let k = 4; k >= -2; k--) { const x1 = ex - k * sw2, y = ey - k * shh; if (y > fl) continue; conc(-10, Math.max(sy0 - 10, y), x1); c.fillStyle = '#d2cdc3'; c.fillRect(-10, y, x1 + 10, 5); c.strokeStyle = '#6b665d'; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x1, y); c.lineTo(x1, Math.min(fl, y + shh)); c.stroke(); }
        for (let i = 0; i < 40; i++) { c.fillStyle = 'rgba(80,74,64,.25)'; c.fillRect((i * 97) % (ex + 2 * sw2), ey + 10 + (i * 53) % 200, 3, 2); }
        P.txt(c, '계단', ex - 150, ey + 40, '#4b463e', '800 20px');
      } else {
        const sk = c.createLinearGradient(0, sy0, 0, sy1); sk.addColorStop(0, '#79b8e6'); sk.addColorStop(1, '#dff0fa'); c.fillStyle = sk; c.fillRect(0, sy0, sx1, sy1 - sy0);
        c.fillStyle = '#a7c79a'; c.beginPath(); c.moveTo(0, g.gy); for (let x = 0; x <= sx1; x += 20) c.lineTo(x, g.gy - 40 - 22 * Math.sin(x / 90) - 10 * Math.sin(x / 33)); c.lineTo(sx1, g.gy); c.fill();
        const gr = c.createLinearGradient(0, g.gy, 0, sy1); gr.addColorStop(0, '#5a9a48'); gr.addColorStop(1, '#3b7432'); c.fillStyle = gr; c.fillRect(0, g.gy, sx1, sy1 - g.gy);
        // 이륙장 H
        c.fillStyle = '#e9e5da'; c.beginPath(); c.ellipse(g.home, g.gy + 8, 46, 10, 0, 0, TAU); c.fill(); c.strokeStyle = '#d24c3f'; c.lineWidth = 2; c.stroke(); P.txt(c, 'H', g.home, g.gy + 14, '#d24c3f', '900 18px');
        P.txt(c, '이륙한 곳', g.home, g.gy + 34, '#1d2433', '700 15px');
        // 나무(장애물)
        const tx = g.tx, bk = c.createLinearGradient(tx, 0, tx + 56, 0); bk.addColorStop(0, '#6b4a2b'); bk.addColorStop(0.5, '#8a6239'); bk.addColorStop(1, '#4e3520'); c.fillStyle = bk; c.fillRect(tx, sy0 + 40, 56, g.gy - sy0 - 32);
        c.strokeStyle = 'rgba(40,25,10,.5)'; c.lineWidth = 1.5; for (let y = sy0 + 60; y < g.gy; y += 22) { c.beginPath(); c.moveTo(tx + 8, y); c.quadraticCurveTo(tx + 20, y + 8, tx + 14, y + 18); c.stroke(); c.beginPath(); c.moveTo(tx + 40, y + 10); c.quadraticCurveTo(tx + 48, y + 18, tx + 42, y + 28); c.stroke(); }
        [[-30, 10, 60], [40, -10, 70], [100, 20, 60], [10, 50, 55], [70, 60, 50]].forEach(([dx, dy, r]) => { const lg = c.createRadialGradient(tx + dx, sy0 + dy - 10, 4, tx + dx, sy0 + dy, r); lg.addColorStop(0, '#6fb35a'); lg.addColorStop(1, '#2f6e2c'); c.fillStyle = lg; c.beginPath(); c.arc(tx + dx, sy0 + dy, r, 0, TAU); c.fill(); });
        P.txt(c, '장애물(나무)', tx + 28, g.gy - 12, '#fff', '800 15px');
      }
      c.restore();
      c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, TOP); c.lineTo(W, TOP); c.moveTo(sx1, TOP); c.lineTo(sx1, sy1); c.moveTo(0, sy1); c.lineTo(W, sy1); c.stroke();
      // 받침(나무판)
      const sy = g.shelf.y, wd = c.createLinearGradient(0, sy - 4, 0, H); wd.addColorStop(0, '#d9b98a'); wd.addColorStop(1, '#b38a55'); c.fillStyle = wd; c.fillRect(0, sy - 6, W, H - sy + 6);
      c.strokeStyle = 'rgba(110,70,30,.25)'; c.lineWidth = 1; for (let y = sy + 4; y < H; y += 9) { c.beginPath(); c.moveTo(0, y); c.bezierCurveTo(W * 0.3, y + 3, W * 0.6, y - 3, W, y + 1); c.stroke(); }
      return cv;
    }

    // ── 대상 그리기 ──
    function headPath(c, hx, hy, R) { // 오른쪽을 보는 옆얼굴
      c.beginPath(); c.moveTo(hx - 0.2 * R, hy + 0.98 * R);
      c.bezierCurveTo(hx - 1.05 * R, hy + 0.85 * R, hx - 1.12 * R, hy - 0.2 * R, hx - 0.9 * R, hy - 0.62 * R);
      c.bezierCurveTo(hx - 0.6 * R, hy - 1.08 * R, hx + 0.35 * R, hy - 1.1 * R, hx + 0.72 * R, hy - 0.72 * R);
      c.bezierCurveTo(hx + 0.95 * R, hy - 0.45 * R, hx + 0.92 * R, hy - 0.25 * R, hx + 0.96 * R, hy - 0.08 * R);
      c.lineTo(hx + 1.16 * R, hy + 0.2 * R); c.lineTo(hx + 0.98 * R, hy + 0.3 * R);
      c.quadraticCurveTo(hx + 1.04 * R, hy + 0.5 * R, hx + 0.96 * R, hy + 0.58 * R);
      c.quadraticCurveTo(hx + 0.98 * R, hy + 0.8 * R, hx + 0.7 * R, hy + 0.92 * R);
      c.quadraticCurveTo(hx + 0.4 * R, hy + 1.04 * R, hx - 0.2 * R, hy + 0.98 * R); c.closePath();
    }
    function drawCar(c, g, push, loose) {
      const { R, hx, hy, inT } = g, d = des.car, x = hx - push;
      // 몸통·팔·핸들
      c.save(); c.lineCap = 'round';
      c.strokeStyle = '#2c2f36'; c.lineWidth = 12; c.beginPath(); c.moveTo(x + 1.6 * R, hy + 2.6 * R); c.lineTo(x + 2.2 * R, hy + 2.1 * R); c.stroke();
      c.strokeStyle = '#9aa3ad'; c.lineWidth = 5; c.beginPath(); c.moveTo(x + 2.2 * R, hy + 2.1 * R); c.lineTo(x + 2.45 * R, hy + 2.0 * R); c.stroke();
      const jg = c.createLinearGradient(x - R, hy + R, x + R, hy + 3 * R); jg.addColorStop(0, '#2f6fd0'); jg.addColorStop(1, '#173f86'); c.fillStyle = jg;
      c.beginPath(); c.moveTo(x - 0.5 * R, hy + 0.8 * R); c.quadraticCurveTo(x - 2.2 * R, hy + 1.3 * R, x - 2.6 * R, hy + 3.4 * R); c.lineTo(x + 0.9 * R, hy + 3.4 * R); c.quadraticCurveTo(x + 0.6 * R, hy + 1.6 * R, x + 0.1 * R, hy + 0.9 * R); c.closePath(); c.fill();
      c.strokeStyle = '#173f86'; c.lineWidth = 0.42 * R; c.beginPath(); c.moveTo(x - 0.2 * R, hy + 1.5 * R); c.quadraticCurveTo(x + 1.0 * R, hy + 1.6 * R, x + 1.6 * R, hy + 2.5 * R); c.stroke();
      c.fillStyle = '#f1c7a0'; c.beginPath(); c.arc(x + 1.65 * R, hy + 2.55 * R, 0.2 * R, 0, TAU); c.fill();
      c.fillStyle = '#ffd84d'; c.fillRect(x - 1.9 * R, hy + 2.0 * R, 1.2 * R, 0.12 * R);
      c.restore();
      // 목·머리
      c.fillStyle = '#e8b78c'; c.fillRect(x - 0.35 * R, hy + 0.6 * R, 0.55 * R, 0.5 * R);
      const sg = c.createRadialGradient(x + 0.3 * R, hy - 0.3 * R, R * 0.1, x, hy, R * 1.2); sg.addColorStop(0, '#f7d4b2'); sg.addColorStop(1, '#d9a47a');
      headPath(c, x, hy, R); c.fillStyle = sg; c.fill(); c.strokeStyle = '#a8764e'; c.lineWidth = 1.6; c.stroke();
      // 머리카락(뒤통수)
      c.save(); headPath(c, x, hy, R); c.clip(); c.fillStyle = '#3a2a1d'; c.beginPath(); c.ellipse(x - 0.45 * R, hy - 0.45 * R, 0.75 * R, 0.68 * R, -0.3, 0, TAU); c.fill(); c.beginPath(); c.ellipse(x + 0.05 * R, hy - 0.86 * R, 0.8 * R, 0.32 * R, 0.15, 0, TAU); c.fill(); c.restore();
      // 귀·눈·입
      c.fillStyle = '#e2a982'; c.beginPath(); c.ellipse(x - 0.12 * R, hy + 0.08 * R, 0.14 * R, 0.22 * R, 0, 0, TAU); c.fill(); c.strokeStyle = '#a8764e'; c.lineWidth = 1.2; c.stroke();
      c.fillStyle = '#2a1d14'; c.beginPath(); c.ellipse(x + 0.62 * R, hy - 0.1 * R, 0.06 * R, 0.09 * R, 0, 0, TAU); c.fill();
      c.strokeStyle = '#3a2a1d'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x + 0.48 * R, hy - 0.3 * R); c.lineTo(x + 0.76 * R, hy - 0.28 * R); c.stroke();
      c.strokeStyle = '#a5523f'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 0.8 * R, hy + 0.5 * R); c.lineTo(x + 0.95 * R, hy + 0.48 * R); c.stroke();
      // 안전모(단면)
      const a0 = Math.PI * 0.92, a1 = TAU - 0.42;
      const ring = (r0, r1) => { c.beginPath(); c.arc(x, hy, r1, a0, a1); c.arc(x, hy, r0, a1, a0, true); c.closePath(); };
      const prot = () => {
        if (d.IN) { ring(R + 1, R + 15); fillMat(c, d.IN, 'rgba(0,0,0,.06)'); }
        if (d.OUT) { ring(R + 1 + inT, R + 13 + inT); fillMat(c, d.OUT); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2.5; c.beginPath(); c.arc(x, hy, R + 9 + inT, Math.PI * 1.2, Math.PI * 1.55); c.stroke(); }
      };
      if (!loose) prot(); else if (fly) { c.save(); c.translate(x + fly.x, hy + fly.y); c.rotate(fly.r); c.translate(-x, -hy); prot(); c.restore(); }
      // 턱끈
      if (d.FIX) {
        const J = { x: x + 0.3 * R, y: hy + 1.02 * R }, A = { x: x + (R + 8) * Math.cos(-1.2), y: hy + (R + 8) * Math.sin(-1.2) }, B = { x: x + (R + 8) * Math.cos(a0), y: hy + (R + 8) * Math.sin(a0) };
        c.save(); c.lineCap = 'round'; c.strokeStyle = pat(c, d.FIX); c.lineWidth = 8; c.beginPath(); c.moveTo(A.x, A.y); c.lineTo(J.x, J.y); c.lineTo(B.x, B.y); c.stroke();
        c.fillStyle = '#1d2433'; c.fillRect(J.x - 7, J.y - 5, 14, 10); c.restore();
      }
    }
    function legPath(c, g, x) {
      const { ky, ay } = g, L = x - 26;
      c.beginPath(); c.moveTo(L - 4, ky - 30); c.lineTo(L + 54, ky - 30); c.quadraticCurveTo(L + 60, ky + 10, L + 52, ky + 40); c.lineTo(L + 50, ay - 20); c.lineTo(L + 4, ay - 20);
      c.bezierCurveTo(L - 22, ay - 120, L - 22, ky + 120, L - 8, ky + 40); c.closePath();
    }
    function drawSport(c, g, push, loose) {
      const { ky, ay, inT } = g, d = des.sport, x = g.lx - push, shin = x + 26;
      // 반바지
      c.fillStyle = '#1f4fa0'; c.beginPath(); c.moveTo(x - 50, g.sy0); c.lineTo(x + 50, g.sy0); c.lineTo(x + 46, ky - 10); c.lineTo(x - 46, ky - 6); c.closePath(); c.fill();
      // 다리(양말 포함)
      const lg = c.createLinearGradient(x - 40, 0, x + 40, 0); lg.addColorStop(0, '#d9a47a'); lg.addColorStop(0.6, '#f3cba6'); lg.addColorStop(1, '#e3b088'); legPath(c, g, x); c.fillStyle = lg; c.fill(); c.strokeStyle = '#a8764e'; c.lineWidth = 1.5; c.stroke();
      c.save(); legPath(c, g, x); c.clip(); c.fillStyle = '#ffffff'; c.fillRect(x - 60, ay - 96, 140, ay); c.fillStyle = '#d24c3f'; c.fillRect(x - 60, ay - 96, 140, 10); c.restore();
      c.fillStyle = 'rgba(160,110,70,.35)'; c.beginPath(); c.ellipse(x + 10, ky - 6, 22, 14, 0, 0, TAU); c.fill(); P.txt(c, '무릎', x + 46, ky - 2, '#1d2433', '800 17px', 'left');
      // 축구화
      c.fillStyle = '#1d2433'; c.beginPath(); c.moveTo(x - 24, ay - 22); c.lineTo(x + 30, ay - 22); c.quadraticCurveTo(x + 86, ay - 8, x + 90, ay + 10); c.lineTo(x - 30, ay + 10); c.quadraticCurveTo(x - 36, ay - 6, x - 24, ay - 22); c.fill();
      c.fillStyle = '#e3b33b'; c.fillRect(x - 10, ay - 12, 60, 4); [x - 20, x + 10, x + 40, x + 70].forEach((sx) => { c.fillStyle = '#9aa3ad'; c.fillRect(sx, ay + 10, 8, 7); });
      // 보호대(단면)
      const yA = ky + 26, yB = ay - 38;
      const prot = () => {
        if (d.IN) { c.beginPath(); c.roundRect(shin, yA, 14, yB - yA, 6); fillMat(c, d.IN); }
        if (d.OUT) { c.beginPath(); c.roundRect(shin + inT, yA - 6, 12, yB - yA + 12, [8, 10, 10, 8]); fillMat(c, d.OUT); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2; c.beginPath(); c.moveTo(shin + inT + 8, yA + 10); c.lineTo(shin + inT + 8, yA + 70); c.stroke(); }
      };
      if (!loose) prot(); else if (fly) { c.save(); c.translate(shin + fly.x, (yA + yB) / 2 + fly.y); c.rotate(fly.r); c.translate(-shin, -(yA + yB) / 2); prot(); c.restore(); }
      if (d.FIX) [yA + 18, yB - 30].forEach((y) => { c.beginPath(); c.roundRect(x - 30, y, shin + inT + (d.OUT ? 12 : 0) - x + 32, 13, 4); fillMat(c, d.FIX); });
    }
    function drawSchool(c, g, push, loose) {
      const { ex, ey, inT } = g, d = des.school;
      const L = (t0, t1, a, b) => { c.beginPath(); c.moveTo(ex - a, ey - t0); c.lineTo(ex - a, ey - t1); c.lineTo(ex + t1, ey - t1); c.lineTo(ex + t1, ey + b); c.lineTo(ex + t0, ey + b); c.lineTo(ex + t0, ey - t0); c.closePath(); };
      const prot = () => {
        if (d.IN) { L(0, 16, 80, 52); fillMat(c, d.IN); }
        if (d.OUT) { L(inT, inT + 8, 84, 56); fillMat(c, d.OUT); }
      };
      if (!loose) prot(); else if (fly) { c.save(); c.translate(ex + fly.x, ey + fly.y); c.rotate(fly.r); c.translate(-ex, -ey); prot(); c.restore(); }
      if (d.FIX) { const t = inT + (d.OUT ? 8 : 0); [[ex - 70, ey - t - 3, 12, t + 8], [ex - 3, ey + 34, t + 8, 12]].forEach(([a, b, w, h]) => { c.beginPath(); c.roundRect(a, b, w, h, 3); fillMat(c, d.FIX); }); }
    }
    function striker(c, g, t, press) {
      const B = bob(g, t), pr = press || 0;
      c.save(); if (fld !== 'sport') { c.strokeStyle = '#4b5361'; c.lineWidth = 3; c.beginPath(); c.moveTo(g.px, g.py); c.lineTo(B.x + pr, B.y - 26); c.stroke();
      c.fillStyle = '#2b2f36'; c.beginPath(); c.arc(g.px, g.py, 6, 0, TAU); c.fill(); }
      const x = B.x + pr, y = B.y;
      if (fld === 'car') { // 연석 모형(화강암 덩어리)
        const gg = c.createLinearGradient(x - 34, y - 28, x + 34, y + 28); gg.addColorStop(0, '#c9c7c2'); gg.addColorStop(1, '#7d7a74'); c.fillStyle = gg; c.beginPath(); c.roundRect(x - 34, y - 28, 68, 56, [10, 4, 4, 10]); c.fill(); c.strokeStyle = '#3d3b37'; c.lineWidth = 2; c.stroke();
        for (let i = 0; i < 22; i++) { c.fillStyle = i % 2 ? 'rgba(40,40,40,.35)' : 'rgba(255,255,255,.4)'; c.fillRect(x - 30 + (i * 37) % 60, y - 24 + (i * 23) % 48, 2.5, 2); }
        c.fillStyle = '#4b5361'; c.fillRect(x - 4, y - 34, 8, 8);
      } else if (fld === 'sport') { // 상대 선수의 다리 + 축구화(앞코가 왼쪽)
        const lg2 = c.createLinearGradient(x - 20, 0, x + 30, 0); lg2.addColorStop(0, '#e3b088'); lg2.addColorStop(1, '#c58f63');
        c.strokeStyle = lg2; c.lineWidth = 36; c.lineCap = 'round'; c.beginPath(); c.moveTo(g.px, g.py); c.lineTo(x + 6, y - 22); c.stroke();
        c.strokeStyle = '#ffd84d'; c.lineWidth = 37; c.lineCap = 'butt'; c.beginPath(); c.moveTo(g.px + (x - g.px) * 0.62, g.py + (y - g.py) * 0.62); c.lineTo(x + 6, y - 22); c.stroke();
        c.strokeStyle = '#1f4fa0'; c.lineWidth = 37; c.beginPath(); c.moveTo(g.px + (x - g.px) * 0.6, g.py + (y - g.py) * 0.6); c.lineTo(g.px + (x - g.px) * 0.64, g.py + (y - g.py) * 0.64); c.stroke();
        c.fillStyle = '#d24c3f'; c.beginPath(); c.moveTo(x + 26, y - 34); c.lineTo(x - 8, y - 34); c.quadraticCurveTo(x - 40, y - 20, x - 40, y + 6); c.lineTo(x + 30, y + 8); c.closePath(); c.fill(); c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; c.stroke();
        c.fillStyle = '#fff'; c.fillRect(x - 16, y - 16, 30, 3); [x - 30, x - 6, x + 16].forEach((sx) => { c.fillStyle = '#9aa3ad'; c.fillRect(sx, y + 6, 7, 6); });
      } else { // 시험용 머리 모형(왼쪽을 봄)
        const hg = c.createRadialGradient(x - 10, y - 12, 4, x, y, 38); hg.addColorStop(0, '#fdf6ea'); hg.addColorStop(1, '#cdbfa8'); c.fillStyle = hg; c.beginPath(); c.arc(x, y, 34, 0, TAU); c.fill(); c.strokeStyle = '#7d7262'; c.lineWidth = 2; c.stroke();
        c.fillStyle = '#7d7262'; c.beginPath(); c.arc(x - 14, y - 6, 3.5, 0, TAU); c.fill(); c.beginPath(); c.moveTo(x - 34, y - 2); c.lineTo(x - 40, y + 6); c.lineTo(x - 32, y + 8); c.fill();
        c.strokeStyle = '#ffd84d'; c.lineWidth = 3; c.setLineDash([6, 4]); c.beginPath(); c.arc(x, y, 26, -0.4, 0.9); c.stroke(); c.setLineDash([]);
      }
      c.restore();
    }
    function drawDrone(c, g, x, y, t) {
      const d = des.drone;
      c.save();
      if (d.TOP && chuteOpen) { // 펼친 낙하산
        c.strokeStyle = 'rgba(29,36,51,.6)'; c.lineWidth = 1.2; [-70, -30, 30, 70].forEach((dx) => { c.beginPath(); c.moveTo(x + dx, y - 120); c.lineTo(x, y - 16); c.stroke(); });
        c.beginPath(); c.moveTo(x - 80, y - 118); c.quadraticCurveTo(x, y - 210, x + 80, y - 118); c.quadraticCurveTo(x, y - 136, x - 80, y - 118); fillMat(c, 'chute');
      }
      // 팔·다리
      c.strokeStyle = '#4b5361'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(x - 82, y - 14); c.lineTo(x + 82, y - 14); c.stroke();
      c.strokeStyle = '#6d7787'; c.lineWidth = 4; c.beginPath(); c.moveTo(x - 30, y + 14); c.lineTo(x - 42, y + 34); c.moveTo(x + 30, y + 14); c.lineTo(x + 42, y + 34); c.moveTo(x - 52, y + 34); c.lineTo(x - 30, y + 34); c.moveTo(x + 30, y + 34); c.lineTo(x + 52, y + 34); c.stroke();
      // 몸체
      if (d.IN) { c.beginPath(); c.roundRect(x - 62, y - 26, 124, 52, 18); fillMat(c, d.IN); }
      const bd = c.createLinearGradient(0, y - 18, 0, y + 18); bd.addColorStop(0, '#ffffff'); bd.addColorStop(1, '#b9c1cc'); c.fillStyle = bd; c.beginPath(); c.roundRect(x - 52, y - 18, 104, 36, 14); c.fill(); c.strokeStyle = '#4b5361'; c.lineWidth = 1.5; c.stroke();
      c.fillStyle = '#1d2433'; c.beginPath(); c.arc(x + 40, y + 16, 9, 0, TAU); c.fill(); c.fillStyle = '#5aa0e6'; c.beginPath(); c.arc(x + 42, y + 15, 4, 0, TAU); c.fill();
      c.fillStyle = Math.sin(t * 6) > 0 ? '#ff4b3a' : '#7a1a10'; c.beginPath(); c.arc(x - 40, y - 4, 4, 0, TAU); c.fill();
      c.fillStyle = Math.sin(t * 6) > 0 ? '#3bd27a' : '#1a5a32'; c.beginPath(); c.arc(x + 26, y - 4, 4, 0, TAU); c.fill();
      if (d.TOP && !chuteOpen) { c.beginPath(); c.roundRect(x - 20, y - 36, 40, 18, 6); fillMat(c, 'chute'); }
      if (d.CHIP) { c.beginPath(); c.roundRect(x - 14, y - 6, 28, 16, 3); fillMat(c, 'rth'); c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 6, y - 6); c.lineTo(x + 12, y - 30); c.stroke(); c.fillStyle = '#3bd27a'; c.beginPath(); c.arc(x + 12, y - 31, 3, 0, TAU); c.fill(); }
      // 날개(돌아감)
      [-82, 82].forEach((dx) => {
        c.fillStyle = '#2b2f36'; c.fillRect(x + dx - 6, y - 26, 12, 14);
        const spin = dPh === 'down' && !chuteOpen ? 0.3 : 1, w = 28 * Math.abs(Math.cos(t * 30 * spin + dx));
        c.fillStyle = 'rgba(40,46,56,.55)'; c.beginPath(); c.ellipse(x + dx, y - 28, Math.max(3, w), 3.5, 0, 0, TAU); c.fill();
        c.fillStyle = 'rgba(120,130,145,.18)'; c.beginPath(); c.ellipse(x + dx, y - 28, 28, 5, 0, 0, TAU); c.fill();
        if (d.RING) { c.save(); c.beginPath(); c.ellipse(x + dx, y - 28, 38, 9, 0, 0, TAU); c.ellipse(x + dx, y - 28, 31, 5, 0, 0, TAU, true); fillMat(c, 'guard'); c.restore(); }
      });
      c.restore();
    }

    // ── 자리(놓는 곳) ──
    function zones(g) {
      const zs = {}, d = des[fld];
      if (fld === 'car') {
        const { R, hx, hy } = g; zs.IN = { x: hx - R - 18, y: hy - R - 18, w: 2 * R + 36, h: R * 1.2, lx: hx - R * 0.7, ly: hy - R - 34 };
        zs.OUT = { x: hx - R - 34, y: hy - R - 34, w: 2 * R + 70, h: R * 1.2 + 10, lx: hx + R * 0.5, ly: hy - R - 46 };
        zs.FIX = { x: hx - R, y: hy + 0.3 * R, w: 1.4 * R, h: 0.85 * R, lx: hx - R * 0.5, ly: hy + 1.25 * R };
      } else if (fld === 'sport') {
        const { shin, ky, ay } = g; zs.IN = { x: shin - 6, y: ky + 26, w: 22, h: ay - ky - 64, lx: shin + 100, ly: ky + 60 };
        zs.OUT = { x: shin + 12, y: ky + 20, w: 26, h: ay - ky - 52, lx: shin + 100, ly: ky + 110 };
        zs.FIX = { x: g.lx - 34, y: ky + 30, w: 60, h: ay - ky - 80, lx: g.lx - 92, ly: (ky + ay) / 2 };
      } else if (fld === 'school') {
        const { ex, ey } = g; zs.IN = { x: ex - 80, y: ey - 18, w: 98, h: 72, lx: ex - 40, ly: ey - 72 };
        zs.OUT = { x: ex - 84, y: ey - 30, w: 112, h: 90, lx: ex - 40, ly: ey - 46 };
        zs.FIX = { x: ex - 110, y: ey + 2, w: 90, h: 70, lx: ex - 130, ly: ey + 80 };
      } else {
        const x = dX == null ? g.rest : dX, y = dY == null ? g.dy : dY;
        zs.RING = { x: x - 124, y: y - 44, w: 248, h: 32, lx: x + 124, ly: y - 64 };
        zs.IN = { x: x - 62, y: y - 26, w: 124, h: 52, lx: x - 110, ly: y + 50 };
        zs.TOP = { x: x - 26, y: y - 44, w: 52, h: 30, lx: x, ly: y - 64 };
        zs.CHIP = { x: x - 16, y: y - 8, w: 32, h: 20, lx: x + 30, ly: y + 58 };
      }
      Object.keys(zs).forEach((k) => { zs[k].k = k; zs[k].on = !!d[k]; });
      return zs;
    }
    function zoneShape(c, g, z) { // 빈 자리의 점선 윤곽
      const k = z.k;
      if (fld === 'car') { const { R, hx, hy } = g, a0 = Math.PI * 0.92, a1 = TAU - 0.42;
        if (k === 'IN' || k === 'OUT') { const r0 = k === 'IN' ? R + 1 : R + 1 + g.inT, r1 = r0 + (k === 'IN' ? 14 : 12); c.beginPath(); c.arc(hx, hy, r1, a0, a1); c.arc(hx, hy, r0, a1, a0, true); c.closePath(); }
        else { c.beginPath(); c.moveTo(hx + (R + 8) * Math.cos(-1.2), hy + (R + 8) * Math.sin(-1.2)); c.lineTo(hx + 0.3 * R, hy + 1.02 * R); c.lineTo(hx + (R + 8) * Math.cos(a0), hy + (R + 8) * Math.sin(a0)); }
      } else if (fld === 'sport') { const { shin, ky, ay, inT } = g, yA = ky + 26, yB = ay - 38;
        if (k === 'IN') { c.beginPath(); c.roundRect(shin, yA, 14, yB - yA, 6); } else if (k === 'OUT') { c.beginPath(); c.roundRect(shin + inT, yA - 6, 12, yB - yA + 12, 8); }
        else { c.beginPath(); [yA + 18, yB - 30].forEach((y) => c.rect(g.lx - 30, y, shin - g.lx + 30 + inT + g.outT, 13)); }
      } else if (fld === 'school') { const { ex, ey, inT } = g;
        const L = (t0, t1, a, b) => { c.beginPath(); c.moveTo(ex - a, ey - t0); c.lineTo(ex - a, ey - t1); c.lineTo(ex + t1, ey - t1); c.lineTo(ex + t1, ey + b); c.lineTo(ex + t0, ey + b); c.lineTo(ex + t0, ey - t0); c.closePath(); };
        if (k === 'IN') L(0, 16, 80, 52); else if (k === 'OUT') L(inT, inT + 8, 84, 56); else { const t = inT + g.outT; c.beginPath(); c.rect(ex - 70, ey - t - 3, 12, t + 8); c.rect(ex - 3, ey + 34, t + 8, 12); }
      } else { const x = dX == null ? g.rest : dX, y = dY == null ? g.dy : dY;
        if (k === 'RING') { c.beginPath(); c.ellipse(x - 82, y - 28, 38, 9, 0, 0, TAU); c.moveTo(x + 120, y - 28); c.ellipse(x + 82, y - 28, 38, 9, 0, 0, TAU); }
        else if (k === 'IN') { c.beginPath(); c.roundRect(x - 62, y - 26, 124, 52, 18); } else if (k === 'TOP') { c.beginPath(); c.roundRect(x - 20, y - 36, 40, 18, 6); } else { c.beginPath(); c.roundRect(x - 14, y - 6, 28, 16, 3); }
      }
    }
    const zoneAt = (g, p, k) => { const zs = zones(g), hit = Object.values(zs).filter((z) => p.x > z.x - 18 && p.x < z.x + z.w + 18 && p.y > z.y - 18 && p.y < z.y + z.h + 18); if (!hit.length) return null; return (k && hit.find((z) => MATS[k].z.includes(z.k) && !(fld === 'drone' && ['shell', 'band'].includes(k)) && (fld === 'drone' || !DRONLY.includes(k)))) || hit[0]; };
    const fits = (k, z) => MATS[k].z.includes(z) && !(fld === 'drone' && ['shell', 'band'].includes(k)) && (fld === 'drone' || !DRONLY.includes(k)) && !!FIELDS[fld].zones[z];

    // ── 붙이기·떼기 ──
    function attach(k, zk) {
      const g = geo(); zk = zk || ZORD[fld].find((z) => fits(k, z) && !des[fld][z]) || ZORD[fld].find((z) => fits(k, z));
      if (!zk || !fits(k, zk)) { say(why(fld, k, zk || MATS[k].z[0])); return false; }
      const d = des[fld], before = msOf(fld, d);
      Object.keys(d).forEach((z) => { if (d[z] === k) delete d[z]; });
      d[zk] = k; fly = null; if (fld === 'drone') { dPh = 'hover'; chuteOpen = false; }
      const after = msOf(fld, d), Z = FIELDS[fld].zones[zk];
      let s = `${MATS[k].info} → <b>${Z}</b>에 붙였다.`;
      if (after !== before) s += ` 예상 충돌 시간 ${before} → <b>${after} ms</b>.`;
      else if (zk === 'FIX') s += ' 시간은 그대로 — 보호구를 몸에 붙잡아 둔다.';
      say(s); g && panel(); return true;
    }
    function detach(zk) { const d = des[fld]; if (!d[zk]) return; const k = d[zk]; delete d[zk]; fly = null; say(`${MATS[k].name}를 뗐다. 예상 충돌 시간 <b>${msOf(fld, d)} ms</b>.`); panel(); }

    // ── 충돌 시험 ──
    function hitStart(s) {
      const F0 = FIELDS[fld], d = des[fld], v = F0.v * s, J = F0.m * v, ms = msOf(fld, d), Fp = peak(J, ms), Fb = peak(J, F0.t0);
      const prot = !!(d.IN || d.OUT), loose = fld !== 'drone' && prot && !d.FIX;
      cur = { f: fld, s, v, J, ms, Fp, Fb, prot, loose, fix: !!d.FIX, chute: !!d.TOP, safe: Fp <= F0.safe, mats: { ...d } };
      res[fld] = cur; if (ms > F0.t0 + 0.5) crashOk[fld] = true;
      ph = 'hit'; hitT = 0; hitD = 0.35 + ms * 0.045; fly = null;
      if (!cur.safe) { shake = 1; try { if (navigator.vibrate) navigator.vibrate(Fp > 2 * F0.safe ? [40, 30, 60] : 30); } catch { /* 지원 안 함 */ } }
      let t = `빠르기 ${v.toFixed(1)} m/s로 부딪혔다. 충격량(넓이) <b>${J.toFixed(1)} N·s</b>는 보호 없을 때와 같고, 충돌 시간 ${F0.t0} → <b>${ms} ms</b>`;
      t += ms > F0.t0 ? `로 늘어 최대 힘이 ${kN(Fb)} → <b>${kN(Fp)} kN</b>으로 줄었다.` : ` 그대로라 최대 힘 <b>${kN(Fp)} kN</b>.`;
      t += cur.safe ? ' 다칠 수 있는 힘보다 작다 ✓' : ' 아직 다칠 수 있는 힘보다 크다 ✗';
      if (d.OUT && !d.IN && fld !== 'drone') t += ' 껍질만으로는 시간이 거의 안 는다.';
      if (loose) t += ' 고정 띠가 없어 보호구가 <b>관성</b>으로 제자리에 남으려다 벗겨져 날아갔다.';
      else if (prot && d.FIX) t += ' 고정 띠가 보호구를 붙잡아 튀어 나가지 않았다.';
      if (fld === 'drone') t += d.TOP ? ` 떨어질 때 낙하산이 펴져 ${VCHUTE} m/s로 내려온다(운동량↓).` : ` 날개가 멈춰 ${VFALL.toFixed(0)} m/s로 떨어진다 — 낙하산이 있으면?`;
      say(t); panel();
    }
    function step(g, dt) {
      if (shake > 0) shake = Math.max(0, shake - dt * 3);
      if (fld !== 'drone') {
        if (ph === 'swing') { om += -14 * Math.sin(th) * dt; th += om * dt; if (th <= thC(g)) { th = thC(g); hitStart(s0); } }
        else if (ph === 'hit') { hitT += dt; if (hitT >= hitD) { ph = 'after'; om = 0.9 * Math.sqrt(28 * (1 - Math.cos(TMAX * Math.max(0.25, s0)))) * 0.35; if (cur.loose) { const L = { car: [-150, -340, -5], sport: [70, -60, -2.4], school: [110, -160, 2] }[fld]; fly = { x: 0, y: 0, r: 0, vx: L[0], vy: L[1], vr: L[2] }; } } }
        else if ((ph === 'after' || ph === 'idle') && !(drag && drag.bob)) { const t0 = ph === 'idle' && !drag ? 0.03 * Math.sin(clock * 1.3) : 0; om += (-14 * Math.sin(th - t0) - 2.2 * om) * dt; th += om * dt; if (th < thC(g)) { th = thC(g); om = Math.abs(om) * 0.3; } }
        if (fly && !fly.land) { fly.vy += 900 * dt; fly.x += fly.vx * dt; fly.y += fly.vy * dt; fly.r += fly.vr * dt; const ground = g.landY - g.ay0; if (fly.y > ground) { fly.y = ground; fly.land = true; fly.r = fld === 'car' ? Math.PI : fld === 'sport' ? -Math.PI / 2 : 0; } }
      } else {
        if (dX == null) { dX = g.rest; dY = g.dy; }
        if (dPh === 'hover') { if (!drag) { dX += (g.rest - dX) * Math.min(1, dt * 2); dY = g.dy + Math.sin(clock * 2) * 5; } }
        else if (dPh === 'fly') { dV = Math.min(dV + 1600 * dt, 300 + 600 * s0); dX += dV * dt; if (dX + g.reach >= g.tx) { dX = g.tx - g.reach; dPh = 'hit'; dT = 0; hitStart(s0); } }
        else if (dPh === 'hit') { dT += dt; ph = 'hit'; hitT = dT; if (dT >= hitD) { dPh = 'down'; ph = 'after'; dV = 0; chuteOpen = !!des.drone.TOP; dX -= 10; } }
        else if (dPh === 'down' || dPh === 'drift') {
          if (dPh === 'drift') dX = Math.min(g.tx - g.reach, dX + 70 * dt * (comm && comm.rth ? -1 : 1));
          if (comm && comm.rth && dPh === 'drift') { dX = Math.max(g.home, dX); if (dX <= g.home + 1) { dV += 40 * dt; dY += 60 * dt; } } else { dV = chuteOpen ? 60 : dV + 520 * dt; dY += dV * dt; }
          if (dY >= g.gy - 34) { dY = g.gy - 34; dPh = 'land'; dT = 0; }
        } else if (dPh === 'comm') { dT += dt; dY = g.dy + Math.sin(clock * 2) * 3; if (dT > 0.9) { dPh = 'drift'; chuteOpen = !comm.rth && !!des.drone.TOP; dV = 0; } }
        else if (dPh === 'land') { dT += dt; if (dT > 1.6) { dPh = 'hover'; ph = 'idle'; chuteOpen = false; comm = comm && { ...comm, done: true }; dY = g.dy; dX = g.home; } }
      }
    }

    // ── 그래프·결과·위험 요소·표지·받침 ──
    function graph(c, g) {
      const B = g.gr, x0 = B.x + 46, y0 = B.y + B.h - 34, w = B.w - 62, h = B.h - 98, F0 = FIELDS[fld];
      const Fmax = peak(F0.m * F0.v, F0.t0) * 1.04, sx = w / 25, sy = h / Fmax, r = res[fld];
      c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(B.x, B.y, B.w, B.h, 10); c.fill(); c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.stroke();
      P.txt(c, '받는 힘(kN)–시간 그래프', B.x + 12, B.y + 25, '#1d2433', '800 18px', 'left');
      c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x0, y0 - h - 8); c.lineTo(x0, y0); c.lineTo(x0 + w + 4, y0); c.stroke();
      const stp = Fmax > 12000 ? 5000 : 2000;
      for (let n = stp; n < Fmax; n += stp) { c.strokeStyle = 'rgba(29,36,51,.1)'; c.beginPath(); c.moveTo(x0, y0 - n * sy); c.lineTo(x0 + w, y0 - n * sy); c.stroke(); P.txt(c, String(n / 1000), x0 - 6, y0 - n * sy + 5, '#59607a', '600 15px', 'right'); }
      for (let n = 5; n <= 25; n += 5) P.txt(c, String(n), x0 + n * sx, y0 + 18, '#59607a', '600 15px');
      P.txt(c, '시간(ms)', x0 + w + 2, y0 + 32, '#59607a', '700 15px', 'right');
      const yS = y0 - F0.safe * sy; c.save(); c.setLineDash([7, 5]); c.strokeStyle = '#d23a2a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, yS); c.lineTo(x0 + w, yS); c.stroke(); c.restore();
      P.txt(c, '다칠 수 있는 힘(예)', x0 + w, yS - 6, '#c0321f', '700 15px', 'right');
      if (!r) { P.txt(c, '충돌 시험을 하면 그려진다', x0 + w / 2 + 10, y0 - h * 0.3, '#59607a', '700 17px'); return; }
      const pulse = (F, T, upto, fill, stroke, dash) => { c.beginPath(); c.moveTo(x0, y0); const n = 48; for (let k = 0; k <= n; k++) { const t = T * k / n; if (t > upto) break; c.lineTo(x0 + t * sx, y0 - F * Math.sin(Math.PI * t / T) * sy); } c.lineTo(x0 + Math.min(T, upto) * sx, y0); c.closePath(); if (fill) { c.fillStyle = fill; c.fill(); } c.save(); if (dash) c.setLineDash(dash); c.strokeStyle = stroke; c.lineWidth = 2.5; c.stroke(); c.restore(); };
      const live = ph === 'hit' && cur === r ? Math.min(1, hitT / hitD) : 1, t0 = FIELDS[r.f].t0, more = r.ms > t0;
      pulse(r.Fb, t0, 99, 'rgba(120,128,140,.14)', '#6d7787', [5, 4]);
      if (more) pulse(r.Fp, r.ms, r.ms * live, 'rgba(232,72,58,.32)', '#c0321f');
      // 범례(제목 아래 한 줄)
      const ly = B.y + 50; c.save(); c.setLineDash([5, 4]); c.strokeStyle = '#6d7787'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(B.x + 12, ly - 5); c.lineTo(B.x + 34, ly - 5); c.stroke(); c.restore();
      P.txt(c, `보호 없음 ${kN(r.Fb)} kN`, B.x + 40, ly, '#4b5361', '700 15px', 'left');
      if (more) { c.fillStyle = 'rgba(232,72,58,.5)'; c.fillRect(B.x + 186, ly - 12, 20, 12); P.txt(c, `이번 ${kN(r.Fp)} kN · ${r.ms} ms`, B.x + 212, ly, '#c0321f', '800 15px', 'left'); }
      if (live >= 1) P.txt(c, more ? `두 넓이(충격량) 같다 ${r.J.toFixed(1)} N·s` : `충격량 ${r.J.toFixed(1)} N·s · 시간 그대로`, x0 + w, y0 - h + 10, '#7a1a10', '800 15px', 'right');
    }
    function resultBox(c, g) {
      const B = g.rb, r = res[fld], d = des[fld], F0 = FIELDS[fld];
      c.fillStyle = '#ffffff'; c.beginPath(); c.roundRect(B.x, B.y, B.w, B.h, 10); c.fill(); c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.stroke();
      P.txt(c, r ? '시험 결과' : '지금 설계', B.x + 12, B.y + 26, '#1d2433', '800 17px', 'left');
      P.txt(c, F0.who.replace(/\(.*\)/, ''), B.x + B.w - 12, B.y + 26, '#59607a', '700 15px', 'right');
      const ms = r ? r.ms : msOf(fld, d), L = [];
      L.push([`충돌 시간 ${F0.t0} → ${ms} ms`, ms > F0.t0 ? '#1f7a2a' : '#1d2433']);
      if (r) L.push([`최대 힘 ${kN(r.Fp)} kN ${r.safe ? '✓ 위험선 아래' : '✗ 위험선 위'}`, r.safe ? '#1f7a2a' : '#c0321f']);
      else L.push(['최대 힘: 충돌 시험 뒤에 나온다', '#59607a']);
      if (fld === 'drone') L.push([r ? (r.chute ? `떨어질 때 ${VCHUTE} m/s ✓ 낙하산` : `떨어질 때 ${VFALL.toFixed(0)} m/s ✗ 낙하산 없음`) : (d.TOP ? '낙하산: 떨어지는 빠르기↓' : '낙하산: 아직 없음'), r ? (r.chute ? '#1f7a2a' : '#c0321f') : '#59607a']);
      else { const prot = !!(d.IN || d.OUT); L.push([!prot ? '튀어 나감 방지: 보호구 없음' : d.FIX ? '튀어 나감 방지 ✓ 고정 띠' : '튀어 나감 방지 ✗ 관성으로 벗겨짐', !prot ? '#59607a' : d.FIX ? '#1f7a2a' : '#c0321f']); }
      if (fld === 'drone') L.push([comm && comm.done ? (comm.rth ? '통신 끊김 ✓ 자동 귀환' : '통신 끊김 ✗ 떠내려감') : '통신 끊김: 카드를 눌러 시험', comm && comm.done ? (comm.rth ? '#1f7a2a' : '#c0321f') : '#59607a']);
      L.forEach(([t, col], i) => P.txt(c, t, B.x + 14, B.y + 56 + i * 27, col, '700 19px', 'left'));
    }
    function riskCards(c, g) {
      const B = g.rk, F0 = FIELDS[fld], d = des[fld], zs = zones(g);
      P.txt(c, '위험 요소 ↔ 안전장치', B.x + 4, B.y + 16, '#1d2433', '800 16px', 'left');
      const h = Math.min(64, (B.h - 30) / 2 - 6);
      F0.risk.forEach(([t, zk], i) => {
        const y = B.y + 26 + i * (h + 8), x = B.x, w = B.w, on = zk.some((z) => d[z]), btn = fld === 'drone' && i === 1;
        c.fillStyle = on ? '#e7f5e9' : '#fff3f0'; c.beginPath(); c.roundRect(x, y, w, h, 10); c.fill(); c.strokeStyle = on ? '#2f9e5b' : '#d23a2a'; c.lineWidth = btn ? 3 : 2; c.stroke();
        c.fillStyle = on ? '#2f9e5b' : '#d23a2a'; c.beginPath(); c.arc(x + 22, y + h / 2, 12, 0, TAU); c.fill(); P.txt(c, on ? '✓' : '!', x + 22, y + h / 2 + 6, '#fff', '900 16px');
        P.txt(c, t, x + 42, y + h / 2 - (btn ? 4 : -6), '#1d2433', '700 18px', 'left');
        if (btn) P.txt(c, comm && !comm.done ? '시험 중…' : '눌러서 신호 끊어 보기 ▶', x + 42, y + h / 2 + 19, '#c0321f', '700 16px', 'left');
        // 붙인 장치까지 잇는 선
        zk.forEach((z) => { if (!d[z] || !zs[z]) return; const Z = zs[z]; c.save(); c.setLineDash([4, 4]); c.lineDashOffset = -clock * 20; c.strokeStyle = 'rgba(47,158,91,.8)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y + h / 2); c.bezierCurveTo(x - 60, y + h / 2, Z.x + Z.w + 60, Z.y + Z.h / 2, Z.x + Z.w / 2, Z.y + Z.h / 2); c.stroke(); c.restore(); });
        if (btn) commBtn = { x, y, w, h };
      });
    }
    function icon(c, k, x, y) { // 표지 그림(가운데 x,y · 높이 약 50)
      c.save(); c.lineCap = 'round'; c.lineJoin = 'round';
      if (k === 'car') { // 자전거 + 안전모
        c.strokeStyle = '#1d2433'; c.lineWidth = 3; [[-22, 12], [22, 12]].forEach(([dx, dy]) => { c.beginPath(); c.arc(x + dx, y + dy, 13, 0, TAU); c.stroke(); });
        c.strokeStyle = '#d24c3f'; c.beginPath(); c.moveTo(x - 22, y + 12); c.lineTo(x - 6, y - 6); c.lineTo(x + 12, y - 6); c.lineTo(x + 22, y + 12); c.moveTo(x - 6, y - 6); c.lineTo(x + 2, y + 12); c.lineTo(x + 12, y - 6); c.stroke();
        const hg = c.createLinearGradient(x - 14, y - 30, x + 14, y - 14); hg.addColorStop(0, '#ef7046'); hg.addColorStop(1, '#c43f1d'); c.fillStyle = hg; c.beginPath(); c.moveTo(x - 16, y - 14); c.quadraticCurveTo(x - 14, y - 34, x + 6, y - 32); c.quadraticCurveTo(x + 20, y - 26, x + 18, y - 14); c.closePath(); c.fill();
      } else if (k === 'sport') { // 축구공 + 보호대
        const bg2 = c.createRadialGradient(x - 18, y - 6, 2, x - 12, y, 20); bg2.addColorStop(0, '#ffffff'); bg2.addColorStop(1, '#c9ccd3'); c.fillStyle = bg2; c.beginPath(); c.arc(x - 12, y, 19, 0, TAU); c.fill(); c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; c.stroke();
        c.fillStyle = '#1d2433'; c.beginPath(); for (let q = 0; q < 5; q++) { const a = -Math.PI / 2 + q * TAU / 5; c.lineTo(x - 12 + 7 * Math.cos(a), y + 7 * Math.sin(a)); } c.fill();
        c.fillStyle = '#2f6fd0'; c.beginPath(); c.roundRect(x + 14, y - 24, 18, 46, [8, 8, 12, 12]); c.fill(); c.strokeStyle = '#173f86'; c.stroke(); c.strokeStyle = '#fff'; c.lineWidth = 1; for (let yy = y - 16; yy < y + 18; yy += 7) { c.beginPath(); c.moveTo(x + 17, yy); c.lineTo(x + 29, yy); c.stroke(); }
      } else if (k === 'school') { // 계단
        c.fillStyle = '#a9a398'; c.beginPath(); c.moveTo(x - 30, y + 22); for (let s = 0; s < 4; s++) { c.lineTo(x - 30 + s * 16, y + 22 - (s + 1) * 12); c.lineTo(x - 14 + s * 16, y + 22 - (s + 1) * 12); } c.lineTo(x + 34, y + 22); c.closePath(); c.fill(); c.strokeStyle = '#5d584f'; c.lineWidth = 1.5; c.stroke();
        c.fillStyle = '#f2c23e'; for (let s = 0; s < 4; s++) c.fillRect(x - 30 + s * 16, y + 20 - (s + 1) * 12, 7, 5);
      } else { // 드론
        c.strokeStyle = '#4b5361'; c.lineWidth = 4; c.beginPath(); c.moveTo(x - 28, y - 4); c.lineTo(x + 28, y - 4); c.stroke();
        c.fillStyle = '#e9edf2'; c.beginPath(); c.roundRect(x - 16, y - 10, 32, 16, 6); c.fill(); c.strokeStyle = '#4b5361'; c.lineWidth = 1.5; c.stroke();
        [-28, 28].forEach((dx) => { c.fillStyle = 'rgba(40,46,56,.5)'; c.beginPath(); c.ellipse(x + dx, y - 10, 16 * Math.abs(Math.cos(clock * 8 + dx)) + 3, 3, 0, 0, TAU); c.fill(); });
        c.fillStyle = '#1d2433'; c.beginPath(); c.arc(x + 10, y + 8, 4, 0, TAU); c.fill();
      }
      c.restore();
    }
    function cards(c, g) {
      g.cards.forEach((b) => {
        const on = b.k === fld, done = crashOk[b.k], lift = on ? -2 : 0;
        c.save(); c.shadowColor = 'rgba(29,36,51,.25)'; c.shadowBlur = on ? 10 : 4; c.shadowOffsetY = on ? 4 : 2;
        c.fillStyle = on ? '#fff6cc' : '#ffffff'; c.beginPath(); c.roundRect(b.x, b.y + lift, b.w, b.h, 12); c.fill(); c.restore();
        c.strokeStyle = on ? '#1d2433' : '#9aa3ad'; c.lineWidth = on ? 3 : 1.5; c.beginPath(); c.roundRect(b.x, b.y + lift, b.w, b.h, 12); c.stroke();
        icon(c, b.k, b.x + b.w / 2, b.y + 36 + lift);
        P.txt(c, FIELDS[b.k].name, b.x + b.w / 2, b.y + b.h - 10 + lift, '#1d2433', '800 18px');
        if (done) { c.fillStyle = '#2f9e5b'; c.beginPath(); c.arc(b.x + b.w - 14, b.y + 14 + lift, 11, 0, TAU); c.fill(); P.txt(c, '✓', b.x + b.w - 14, b.y + 20 + lift, '#fff', '900 14px'); }
      });
    }
    function slots(g) { const n = MORD.length, gap = 8, w = (g.W - 20 - gap * (n - 1)) / n; return MORD.map((k, i) => ({ k, x: 10 + i * (w + gap), y: g.shelf.y + 4, w, h: g.shelf.h - 8 })); }
    function swatch(c, k, x, y, w, h) {
      c.save(); c.beginPath(); c.roundRect(x, y, w, h, 8); c.fillStyle = pat(c, k); c.fill();
      const sh = c.createLinearGradient(0, y, 0, y + h); sh.addColorStop(0, 'rgba(255,255,255,.28)'); sh.addColorStop(1, 'rgba(0,0,0,.18)'); c.fillStyle = sh; c.fill();
      c.strokeStyle = 'rgba(29,36,51,.8)'; c.lineWidth = 1.5; c.stroke(); c.restore();
    }
    function shelf(c, g) {
      const used = Object.values(des[fld]);
      slots(g).forEach((b, i) => {
        const ok = MATS[b.k].z.some((z) => fits(b.k, z)), isUsed = used.includes(b.k), picked = drag && drag.mat === b.k;
        c.save(); c.globalAlpha = ok ? 1 : 0.38;
        c.fillStyle = sel === i ? '#fff6cc' : 'rgba(255,255,255,.92)'; c.beginPath(); c.roundRect(b.x, b.y, b.w, b.h, 10); c.fill();
        c.strokeStyle = sel === i ? '#1d2433' : 'rgba(29,36,51,.35)'; c.lineWidth = sel === i ? 2.5 : 1.2; if (isUsed) c.setLineDash([5, 4]); c.stroke(); c.setLineDash([]);
        if (!picked) swatch(c, b.k, b.x + 10, b.y + 8, b.w - 20, b.h - 60);
        const nm = MATS[b.k].name, two = nm.length > 5 && nm.includes(' ');
        if (two) { const [a, z] = nm.split(' '); P.txt(c, a, b.x + b.w / 2, b.y + b.h - 30, '#1d2433', '800 17px'); P.txt(c, z, b.x + b.w / 2, b.y + b.h - 11, '#1d2433', '800 17px'); }
        else P.txt(c, nm, b.x + b.w / 2, b.y + b.h - 18, '#1d2433', '800 17px');
        if (isUsed) P.txt(c, '✓', b.x + b.w - 12, b.y + 20, '#2f9e5b', '900 18px');
        if (!ok) P.txt(c, DRONLY.includes(b.k) ? '드론 전용' : '드론엔 ×', b.x + b.w / 2, b.y + (b.h - 60) / 2 + 14, '#1d2433', '800 14px');
        c.restore();
      });
      c.fillStyle = '#1d2433'; c.beginPath(); c.roundRect(10, g.shelf.y - 22, 90, 22, [8, 8, 0, 0]); c.fill(); P.txt(c, '재료 받침', 55, g.shelf.y - 6, '#fff', '800 14px');
    }
    function pill(c, x, y, s, bgc, fg = '#fff', f = '700 15px') { c.font = `${f} "IBM Plex Sans KR", sans-serif`; const w = c.measureText(s).width + 18; c.fillStyle = bgc; c.beginPath(); c.roundRect(x - w / 2, y - 17, w, 26, 13); c.fill(); P.txt(c, s, x, y + 2, fg, f); }

    function draw(c, W, H, dt) {
      if (!W) return;
      clock += dt; const g = geo();
      const key = fld + W + 'x' + H; if (key !== bgKey) { bg = paintBg(g); bgKey = key; }
      step(g, dt);
      c.clearRect(0, 0, W, H); c.save();
      if (shake > 0) c.translate((Math.random() - 0.5) * 12 * shake, (Math.random() - 0.5) * 8 * shake);
      c.drawImage(bg, 0, 0, W, H);
      const u = ph === 'hit' && cur ? Math.min(1, hitT / hitD) : 0, sq = ph === 'hit' ? Math.sin(Math.PI * u) : 0;
      const pen = sq * (2 + (cur ? cur.ms : 0) * 0.9), push = sq * (cur && cur.ms <= FIELDS[fld].t0 + 2 ? 10 : 4);
      c.save(); c.beginPath(); c.rect(0, g.sy0, g.sx1, g.sy1 - g.sy0); c.clip();
      const loose = !!(fly && cur && cur.loose);
      if (fld === 'car') drawCar(c, g, push, loose); else if (fld === 'sport') drawSport(c, g, push, loose); else if (fld === 'school') drawSchool(c, g, push, loose);
      // 빈 자리 점선·이름
      const zs = zones(g), dk = drag && drag.mat;
      Object.values(zs).forEach((z) => {
        if (z.on && !(dk && fits(dk, z.k))) return;
        const good = dk && fits(dk, z.k);
        if (fld === 'drone' && dPh !== 'hover') return;
        c.save(); zoneShape(c, g, z); c.setLineDash([6, 5]); c.lineDashOffset = -clock * 14; c.strokeStyle = good ? '#2f9e5b' : 'rgba(29,36,51,.55)'; c.lineWidth = good ? 3.5 : 2; if (good) { c.fillStyle = 'rgba(47,158,91,.18)'; c.fill(); } c.stroke(); c.restore();
        if (!z.on && (!dk || good)) pill(c, z.lx, z.ly, FIELDS[fld].zones[z.k], good ? '#2f9e5b' : 'rgba(29,36,51,.78)', '#fff', '700 16px');
      });
      if (fld === 'drone') drawDrone(c, g, dX == null ? g.rest : dX, dY == null ? g.dy : dY, clock);
      else {
        const B0 = bob(g, th);
        striker(c, g, th, ph === 'hit' ? -pen : 0);
        if (ph === 'hit' && cur && !cur.safe) { c.save(); c.globalAlpha = 0.7 * sq; P.glow(c, g.surf, g.cy, 70, 'rgba(255,90,60,.9)'); c.restore(); }
        pill(c, B0.x, Math.max(g.sy0 + 22, B0.y - 60), FIELDS[fld].hit, 'rgba(29,36,51,.8)', '#fff', '700 14px');
      }
      // 끌기 안내
      if (!res[fld] && !drag && (ph === 'idle') && Object.keys(des[fld]).length) {
        const hx = fld === 'drone' ? (dX || g.rest) : bob(g, th).x, hy = fld === 'drone' ? (dY || g.dy) : bob(g, th).y, k = Math.abs(Math.sin(clock * 2.4));
        c.save(); c.setLineDash([6, 5]); c.lineDashOffset = -clock * 16; c.strokeStyle = '#ffb000'; c.lineWidth = 3; c.beginPath(); c.arc(hx, hy, fld === 'drone' ? 70 : 46, 0, TAU); c.stroke(); c.restore();
        const ax = fld === 'drone' ? hx - 80 - k * 30 : hx + 52 + k * 26; pill(c, ax, hy + (fld === 'drone' ? 64 : 4), fld === 'drone' ? '← 끌었다 놓기' : '당겼다 놓기 →', '#ffb000', '#1d2433', '800 15px');
      }
      if (fly && fly.land && cur && cur.loose) pill(c, Math.max(g.sx0 + 150, Math.min(g.sx1 - 150, g.ax0 + fly.x)), g.sy1 - 18, '관성으로 벗겨져 떨어진 보호구', '#c0321f', '#fff', '800 16px');
      if (fld === 'drone' && comm && !comm.done) { const x = (dX || g.rest), y = (dY || g.dy) - 70; c.save(); c.strokeStyle = '#c0321f'; c.lineWidth = 3; [10, 18, 26].forEach((r) => { c.beginPath(); c.arc(x, y + 14, r, -2.4, -0.7); c.stroke(); }); c.beginPath(); c.moveTo(x - 20, y - 14); c.lineTo(x + 20, y + 14); c.stroke(); c.restore(); pill(c, x, y - 26, comm.rth ? '신호 끊김 → 자동 귀환' : '신호 끊김!', comm.rth ? '#2f9e5b' : '#c0321f'); }
      if (fld === 'drone' && dPh === 'land' && (cur || comm)) pill(c, dX, g.gy - 70, chuteOpen || (comm && comm.rth && !comm.done) ? '살며시 내려앉음' : '쿵! 떨어짐', chuteOpen ? '#2f9e5b' : '#c0321f');
      c.restore();
      cards(c, g); graph(c, g); resultBox(c, g); riskCards(c, g); shelf(c, g);
      if (drag && drag.mat) { c.save(); c.globalAlpha = 0.92; c.shadowColor = 'rgba(0,0,0,.35)'; c.shadowBlur = 12; swatch(c, drag.mat, drag.x - 40, drag.y - 28, 80, 56); c.restore(); pill(c, drag.x, drag.y - 42, MATS[drag.mat].name, '#1d2433'); }
      if (!Object.keys(des[fld]).length && !drag) { const b = slots(g)[sel], k = Math.abs(Math.sin(clock * 2.4)); c.save(); c.setLineDash([6, 5]); c.lineDashOffset = -clock * 16; c.strokeStyle = '#ffb000'; c.lineWidth = 3; c.beginPath(); c.roundRect(b.x - 3, b.y - 3, b.w + 6, b.h + 6, 12); c.stroke(); c.restore(); pill(c, b.x + b.w / 2 + 40, b.y - 14 - k * 10, '끌어서 대상에 붙이기 ↑', '#ffb000', '#1d2433', '800 15px'); }
      c.restore();
      if (Math.floor(clock * 2) !== Math.floor((clock - dt) * 2)) panelSoft();
    }

    // ── 오른쪽 칸 ──
    const stars = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);
    let lastPanel = '';
    function panel() {
      const d = des[fld], ks = Object.values(d), r = res[fld];
      const cnt = { sci: 0, real: 0, use: 0, new: 0 }, by = { sci: [], real: [], use: [], new: [] };
      ks.forEach((k) => MATS[k].crit.forEach((q) => { cnt[q]++; by[q].push(MATS[k].name); }));
      if (r && r.safe && r.ms > FIELDS[fld].t0) { cnt.sci++; by.sci.push('시험 통과'); }
      root.querySelectorAll('.ds-eval tbody tr').forEach((tr) => {
        const q = tr.dataset.k, n = Math.min(3, cnt[q]), td = tr.querySelector('.st'), h = `${stars(n)}<small>${by[q].slice(0, 2).join('·') || '—'}</small>`;
        if (td.innerHTML !== h) { if (n > (+td.dataset.n || 0)) { tr.classList.remove('pop'); void tr.offsetWidth; tr.classList.add('pop'); } td.innerHTML = h; td.dataset.n = n; }
      });
      const cons = new Set(); ks.forEach((k) => MATS[k].cons.forEach((q) => cons.add(q)));
      if (d.FIX === 'fiber') cons.add('in');
      const tested = !!r || (fld === 'drone' && comm && comm.done);
      const on = { risk: tested, law: ['in', 'mo', 'im'].some((p) => cons.has(p)), orig: cons.has('orig'), eco: cons.has('eco') };
      root.querySelectorAll('.ds-cons li').forEach((li) => li.classList.toggle('on', on[li.dataset.k]));
      root.querySelectorAll('.ds-cons i').forEach((i) => i.classList.toggle('on', cons.has(i.dataset.p)));
      const ok = []; if (ORDER.some((f) => Object.keys(des[f]).length)) ok.push(1); if (ORDER.some((f) => crashOk[f])) ok.push(2); if (ORDER.filter((f) => crashOk[f]).length >= 2) ok.push(3);
      const n = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, n, ok); window.L1.done(root, n === 0);
      const t = n === 1 ? '① 재료를 끌어 점선 자리에 붙이기' : n === 2 ? (Object.keys(d).some((z) => CUSH.includes(z) && MATS[d[z]].add > 2) ? '② 추를 당겼다 놓아 충돌 시험' : '② 완충재를 붙이고 충돌 시험') : n === 3 ? `③ 다른 분야(${crashOk.drone ? '교통·스포츠·학교' : '드론'})도 설계해 시험` : '✓ 시간을 늘려 힘↓ · 관성에 대비';
      if (chip.textContent !== t) chip.textContent = t; chip.classList.toggle('done', n === 0);
      lastPanel = JSON.stringify([fld, ks, !!r, comm && comm.done]);
    }
    function panelSoft() { const s = JSON.stringify([fld, Object.values(des[fld]), !!res[fld], comm && comm.done]); if (s !== lastPanel) panel(); }

    // ── 손 조작 ──
    function setField(k) {
      if (!FIELDS[k] || (ph === 'hit')) return; fld = k; ph = 'idle'; th = 0; om = 0; fly = null; dX = null; dY = null; dPh = 'hover'; chuteOpen = false; comm = null; drag = null;
      const F0 = FIELDS[k];
      say(`<b>${F0.name}</b> — 시험 대상: ${F0.who}. 오른쪽 «위험 요소»를 보고, 그 위험을 줄일 재료를 골라 붙이자.${k === 'drone' ? ' 드론 전용 재료(보호대·낙하산·자동 귀환)가 열렸다.' : ''}`);
      panel();
    }
    function startComm() {
      if (fld !== 'drone' || dPh !== 'hover' || ph === 'hit') return;
      comm = { rth: !!des.drone.CHIP, chute: !!des.drone.TOP, done: false }; dPh = 'comm'; dT = 0; cur = res.drone || null;
      say(comm.rth ? '조종 신호가 끊겼다! <b>자동 귀환 장치</b>가 위치 정보로 이륙한 곳(H)에 스스로 돌아와 내려앉는다.'
        : `조종 신호가 끊겼다! 드론은 하던 대로 앞으로 계속 흘러가다(관성) 떨어진다.${comm.chute ? ' 낙하산이 펴져 천천히 내려온다.' : ' 자동 귀환 장치나 낙하산이 있으면?'}`);
      panel();
    }
    const S = P.make(stage, {
      draw,
      down(p) {
        const g = geo();
        const cd = g.cards.find((b) => p.x > b.x && p.x < b.x + b.w && p.y > b.y && p.y < b.y + b.h); if (cd) { setField(cd.k); return; }
        if (commBtn && fld === 'drone' && p.x > commBtn.x && p.x < commBtn.x + commBtn.w && p.y > commBtn.y && p.y < commBtn.y + commBtn.h) { startComm(); return; }
        const sl = slots(g).findIndex((b) => p.x > b.x && p.x < b.x + b.w && p.y > b.y && p.y < b.y + b.h);
        if (sl >= 0) { sel = sl; const k = MORD[sl]; drag = { mat: k, x: p.x, y: p.y, x0: p.x, y0: p.y }; return; }
        if (ph === 'hit') return;
        if (fld === 'drone') {
          const x = dX == null ? g.rest : dX, y = dY == null ? g.dy : dY;
          if (dPh === 'hover' && Math.abs(p.x - x) < 120 && Math.abs(p.y - y) < 50) {
            const z = zoneAt(g, p); drag = { drone: true, off: p.x - x, x0: p.x, y0: p.y, z: z && z.on ? z.k : null }; return; // 위아래로 멀리 끌어내면 그 재료를 뗀다
          }
        } else {
          const B = bob(g, th); if (Math.hypot(p.x - B.x, p.y - B.y) < 56 && ph !== 'swing') { drag = { bob: true }; ph = 'idle'; fly = null; return; }
        }
        const z = zoneAt(g, p); if (z && z.on) { drag = { off: z.k, mat: des[fld][z.k], x: p.x, y: p.y, x0: p.x, y0: p.y, from: true }; return; }
        say(fld === 'drone' ? '드론을 잡아 <b>왼쪽으로</b> 끌었다 놓으면 나무를 향해 날아간다.' : `<b>${FIELDS[fld].hit}</b>를 잡아 오른쪽으로 당겼다 놓자.`);
      },
      move(p) {
        if (!drag) return; const g = geo();
        if (drag.mat !== undefined && !drag.bob && !drag.drone) { drag.x = p.x; drag.y = p.y; return; }
        if (drag.bob) { th = Math.max(0, Math.min(TMAX, Math.atan2(p.x - g.px, p.y - g.py))); om = 0; return; }
        if (drag.drone) { dX = Math.max(g.rest - 230, Math.min(g.rest, p.x - drag.off)); }
      },
      up(p) {
        const d0 = drag; drag = null; if (!d0) return; const g = geo();
        if (d0.bob) { if (th < 0.22) { say('조금 더 <b>멀리</b> 당겨야 부딪힌다.'); return; } s0 = Math.min(1, Math.sin(th / 2) / Math.sin(TMAX / 2)); om = 0; ph = 'swing'; return; }
        if (d0.drone) { if (d0.z && Math.abs(p.y - d0.y0) > 60 && Math.abs(p.x - d0.x0) < 80) { dX = g.rest; detach(d0.z); return; } const s = (g.rest - dX) / 230; if (s < 0.15) { say('드론을 <b>왼쪽으로 더</b> 끌었다 놓자.'); return; } s0 = Math.min(1, s); dV = 0; dPh = 'fly'; ph = 'swing'; fly = null; return; }
        const moved = Math.hypot(p.x - d0.x0, p.y - d0.y0) > 12;
        if (d0.from) { if (!moved) { say(MATS[d0.mat].info + ' 끌어서 밖에 놓으면 뗀다.'); return; } const z = zoneAt(g, p, d0.mat); if (!z || z.k !== d0.off) detach(d0.off); return; }
        if (!moved) { const ok = MATS[d0.mat].z.some((z) => fits(d0.mat, z)); say(MATS[d0.mat].info + (ok ? ' 끌어서 점선 자리에 놓자.' : ' ' + why(fld, d0.mat, MATS[d0.mat].z[0]))); return; }
        const z = zoneAt(g, p, d0.mat);
        if (!z) { say('점선 자리 위에 놓아야 붙는다.'); return; }
        if (!fits(d0.mat, z.k)) { say(why(fld, d0.mat, z.k)); try { if (navigator.vibrate) navigator.vibrate(20); } catch { /* 지원 안 함 */ } return; }
        attach(d0.mat, z.k);
      },
      key(e) {
        const k = e.key;
        if (k >= '1' && k <= '4') { setField(ORDER[+k - 1]); return true; }
        if (k === 'ArrowLeft' || k === 'ArrowRight') { sel = (sel + (k === 'ArrowRight' ? 1 : MORD.length - 1)) % MORD.length; say(MATS[MORD[sel]].info + ' 엔터로 붙인다.'); return true; }
        if (k === 'Enter') { attach(MORD[sel]); return true; }
        if (k === 'Backspace') { const z = [...ZORD[fld]].reverse().find((q) => des[fld][q]); if (z) detach(z); return true; }
        if (k === ' ') { api.test(0.8, true); return true; }
        if (k === 'c' || k === 'C') { startComm(); return true; }
        if (k === '0') { reset(); return true; }
        return false;
      },
    });
    root.querySelector('.ds-reset').addEventListener('click', () => { reset(); S.kick(); });

    const api = {
      field: (k) => { setField(k); S.redraw(); return api.state(); },
      attach: (k, z) => { const r = attach(k, z); S.redraw(); return r; },
      remove: (z) => { detach(z); S.redraw(); return api.state(); },
      test: (s = 0.8, anim) => {
        if (ph === 'hit') return api.state();
        const g = geo(); s0 = s;
        if (anim) { if (fld === 'drone') { dX = g.rest - 230 * s; dV = 0; dPh = 'fly'; ph = 'swing'; } else { th = 2 * Math.asin(s * Math.sin(TMAX / 2)); om = 0; ph = 'swing'; } }
        else { if (fld === 'drone') { dX = g.tx - g.reach; dPh = 'hit'; dT = 0; } else th = thC(g); hitStart(s); }
        S.redraw(); return api.state();
      },
      comm: () => { startComm(); return api.state(); },
      state: () => ({ fld, des: JSON.parse(JSON.stringify(des)), res: Object.fromEntries(Object.entries(res).map(([k, r]) => [k, { ms: r.ms, Fp: Math.round(r.Fp), Fb: Math.round(r.Fb), J: +r.J.toFixed(2), safe: r.safe, loose: r.loose }])), crashOk: { ...crashOk }, comm, ph, dPh, done: root.classList.contains('u-done'), out: out.textContent, chip: chip.textContent }),
      geo: () => { const g = geo(), zs = zones(g); return { W: g.W, H: g.H, cards: g.cards, slots: slots(g), zones: zs, bob: fld === 'drone' ? { x: dX == null ? g.rest : dX, y: dY == null ? g.dy : dY } : bob(g, th), px: g.px, py: g.py, rest: g.rest, commBtn }; },
    };
    root._ds = api;
    reset();
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Design = { mount };
})();
