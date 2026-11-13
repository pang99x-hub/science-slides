/* 3-1 4차시 체험 «화산 피해 대책 세우기»(교과서 118쪽 탐구 + 참고서: 전조 감시·제방·수로·대피소).
   비스듬히 내려다본 화산 마을 지도(화산·마을·도로·강·농경지·공항·언덕). 아래 대책 카드 여섯을 지도에 끌어 놓는다 —
   알맞은 자리 가까이면 붙고, 아니면 튕기며 어디가 좋은지 알려 준다. 화산 꼭대기를 꾹 누르면 «분출 시험»:
   용암이 마을 쪽으로 흐르다 제방에 막히거나 수로를 따라 빈 골짜기로 비켜 가고, 화산재는 바람을 타고 공항 쪽으로 간다.
   결과 판에 피해(환경적·사회 경제적, 118쪽 킬라우에아 예시 항목)를 막대로 보이고 지난 시험과 비교한다. 피해 비율은 이해를 돕기 위한 예.
   키보드: 1~6 대책 놓기, 엔터 분출 시험, 0 처음부터.
   Plan.mount(root) → { fit, setActive } · 시험용: root._pl.place('dam') · test() · state() */
(function () {
  'use strict';
  // 지도 좌표는 무대 위쪽(지도 영역) 비율. 대책: 자리·반경·안내
  const TOOLS = [
    { k: 'watch', n: '화산 감시 장비', ic: '📡', at: [0.33, 0.42], tip: '화산 경사면에 — 지진·땅 부풂·가스·온도를 재야 분출을 미리 안다' },
    { k: 'dam', n: '제방', ic: '🧱', at: [0.5, 0.5], tip: '화산과 마을 사이에 — 용암을 막아 선다' },
    { k: 'canal', n: '용암 수로', ic: '〰', at: [0.42, 0.66], tip: '화산 아래 비탈에 — 용암을 빈 골짜기로 돌린다' },
    { k: 'shelter', n: '대피소', ic: '⛺', at: [0.88, 0.7], tip: '화산 반대편 높은 언덕에 — 마을에서 멀고 높은 곳' },
    { k: 'sign', n: '대피로 표지', ic: '➜', at: [0.74, 0.8], tip: '마을에서 언덕으로 가는 길가에' },
    { k: 'ash', n: '공항 화산재 경보', ic: '✈', at: [0.86, 0.24], tip: '공항에 — 화산재 구름이 오면 비행기를 돌린다' },
  ];
  const DMG = [
    { k: 'house', n: '주택', g: '사회 경제적' }, { k: 'road', n: '도로', g: '사회 경제적' }, { k: 'power', n: '전력·용수', g: '사회 경제적' },
    { k: 'people', n: '주민 대피·인명', g: '사회 경제적' }, { k: 'fly', n: '비행 운항', g: '사회 경제적' }, { k: 'land', n: '숲·농경지', g: '환경적' }, { k: 'air', n: '대기(가스·재)', g: '환경적' },
  ];
  // 피해 계산(0~1): 대책이 놓였는지에 따라. shortcut: 정성적 규칙, 실제 피해 모형이 아님
  function damage(on) {
    const n = (k) => (on[k] ? 1 : 0);
    return {
      house: on.dam && on.canal ? 0 : on.dam || on.canal ? 0.3 : 1,
      road: on.canal ? 0.3 : on.dam ? 0.6 : 1,
      power: on.watch ? 0.4 : 1,
      people: Math.max(0.05, 1 - 0.3 * n('watch') - 0.35 * n('shelter') - 0.25 * n('sign')),
      fly: on.ash ? 0.3 : 1,
      land: on.canal ? 0.5 : on.dam ? 0.8 : 1,
      air: 1, // 가스와 재가 나오는 것 자체는 막을 수 없다
    };
  }
  const avg = (d) => Math.round(DMG.reduce((s, q) => s + d[q.k], 0) / DMG.length * 100);
  console.assert(avg(damage({})) === 100 && avg(damage(Object.fromEntries(TOOLS.map((q) => [q.k, 1])))) < 50, 'plan: 대책 없으면 100%, 모두 놓으면 절반 아래');
  function mount(root) {
    const stage = root.querySelector('.pl-stage'), now = root.querySelector('.pl-now'), out = root.querySelector('.pl-out'), board = root.querySelector('.pl-board');
    const P = window.Play, TAU = Math.PI * 2;
    let on = {}, drag = null, bounce = null, sel = 0, t = 0, msg = '', hold = 0, holding = false, erupt = null, tests = [], art = null, artW = 0, artH = 0;
    const L = (H) => H - 78;
    const X = (u) => u * S.W, Y = (v) => v * L(S.H);
    const TOP = [0.24, 0.3]; // 화산 꼭대기
    function say(h) { if (h !== msg) { msg = h; out.innerHTML = h; } }
    function steps() {
      const n = Object.keys(on).length, ok = [];
      if (n >= 3) ok.push(1); if (tests.length) ok.push(2); if (tests.some((v) => v < 50)) ok.push(3);
      const st = [1, 2, 3].find((q) => !ok.includes(q)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? `① 대책 카드를 지도에 놓자 (${n}/3)` : st === 2 ? '② 화산 꼭대기를 꾹 눌러 분출 시험' : st === 3 ? `③ 피해를 절반 아래로 — 지난 시험 ${tests[tests.length - 1]}%` : `피해 ${tests[tests.length - 1]}% — 대책이 통했다`;
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    function showBoard(d) {
      const pct = avg(d), prev = tests.length > 1 ? tests[tests.length - 2] : null;
      board.innerHTML = `<p class="pl-total">피해 <b>${pct}%</b>${prev != null ? ` <span>(지난 시험 ${prev}%)</span>` : ''}</p>` + DMG.map((q) => `<div class="pl-row"><span>${q.n}<small>${q.g}</small></span><i style="--v:${Math.round(d[q.k] * 100)}%"></i></div>`).join('');
    }
    function place(k) {
      const q = TOOLS.find((z) => z.k === k); if (!q || on[k]) return false;
      on[k] = 1; window.RxT.jolt(stage, 1); say(`<b>${q.n}</b> 설치 — ${q.tip.split(' — ')[1]}.`); steps(); S.kick(); return true;
    }
    function test() {
      if (erupt) return false;
      const d = damage(on); erupt = { t: 0, d }; say('분출! 용암과 화산재가 어디로 가는지 지켜보자…'); S.kick(); return true;
    }
    function finish() {
      const d = erupt.d, pct = avg(d); tests.push(pct); showBoard(d);
      const miss = TOOLS.filter((q) => !on[q.k]).map((q) => q.n);
      say(`분출 시험 결과 피해 <b>${pct}%</b>. ${miss.length ? `아직 없는 대책: ${miss.join('·')}.` : '여섯 대책을 모두 세웠다.'} 대기로 나온 가스·재는 막을 수 없다 — 피해를 <b>줄이는 것</b>이 목표다.`);
      steps();
    }
    const cardPos = (W, H, i) => [W * (0.085 + i * 0.166), L(H) + 40];
    // 지형(크기가 바뀔 때만 오프스크린에)
    function ground(W, H) {
      if (art && artW === W && artH === H) return art;
      art = document.createElement('canvas'); art.width = W; art.height = H; artW = W; artH = H; const c = art.getContext('2d'), l = L(H), x = (u) => u * W, y = (v) => v * l;
      let g = c.createLinearGradient(0, 0, 0, l); g.addColorStop(0, '#9cc77a'); g.addColorStop(1, '#5e9a4c'); c.fillStyle = g; c.fillRect(0, 0, W, l);
      let s = 9; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
      for (let i = 0; i < 260; i++) { c.fillStyle = `rgba(40,80,30,${0.08 + rnd() * 0.12})`; c.beginPath(); c.arc(rnd() * W, rnd() * l, 2 + rnd() * 5, 0, TAU); c.fill(); }
      // 바다(오른쪽 아래)
      c.fillStyle = '#3d86c6'; c.beginPath(); c.moveTo(x(0.62), l); c.bezierCurveTo(x(0.7), y(0.9), x(0.95), y(0.92), W, y(0.86)); c.lineTo(W, l); c.fill();
      c.strokeStyle = '#e8d9a4'; c.lineWidth = 5; c.beginPath(); c.moveTo(x(0.62), l); c.bezierCurveTo(x(0.7), y(0.9), x(0.95), y(0.92), W, y(0.86)); c.stroke();
      // 빈 골짜기(수로가 용암을 돌릴 곳, 왼쪽 아래)
      g = c.createLinearGradient(0, y(0.6), 0, l); g.addColorStop(0, '#8a9a6a'); g.addColorStop(1, '#6f7d55'); c.fillStyle = g; c.beginPath(); c.ellipse(x(0.16), y(0.86), x(0.14), y(0.12), 0, 0, TAU); c.fill(); c.fillStyle = 'rgba(30,40,20,.6)'; c.font = '700 12px "IBM Plex Sans KR", sans-serif'; c.textAlign = 'center'; c.fillText('빈 골짜기', x(0.16), y(0.88));
      // 언덕(오른쪽)
      g = c.createRadialGradient(x(0.88), y(0.66), 5, x(0.88), y(0.7), x(0.12)); g.addColorStop(0, '#b7d48e'); g.addColorStop(1, 'rgba(94,154,76,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(x(0.88), y(0.7), x(0.12), y(0.14), 0, 0, TAU); c.fill();
      // 농경지(줄무늬 밭)
      for (let i = 0; i < 4; i++) { c.fillStyle = i % 2 ? '#d9c56a' : '#a9c45c'; c.beginPath(); c.moveTo(x(0.36 + i * 0.04), y(0.74)); c.lineTo(x(0.4 + i * 0.04), y(0.74)); c.lineTo(x(0.38 + i * 0.04), y(0.95)); c.lineTo(x(0.34 + i * 0.04), y(0.95)); c.fill(); }
      // 강(화산 기슭에서 바다로)
      c.strokeStyle = '#4f9ad8'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(x(0.34), y(0.36)); c.bezierCurveTo(x(0.5), y(0.36), x(0.58), y(0.62), x(0.7), y(0.95)); c.stroke();
      // 도로(마을 → 언덕 → 공항)
      c.strokeStyle = '#5b5f66'; c.lineWidth = 7; c.beginPath(); c.moveTo(x(0.3), y(0.98)); c.quadraticCurveTo(x(0.5), y(0.82), x(0.62), y(0.62)); c.quadraticCurveTo(x(0.75), y(0.5), x(0.86), y(0.3)); c.stroke();
      c.strokeStyle = '#e6e6e6'; c.lineWidth = 1.5; c.setLineDash([8, 8]); c.stroke(); c.setLineDash([]);
      c.beginPath(); c.strokeStyle = '#5b5f66'; c.lineWidth = 5; c.moveTo(x(0.62), y(0.62)); c.quadraticCurveTo(x(0.78), y(0.78), x(0.88), y(0.7)); c.stroke();
      // 공항(활주로)
      c.save(); c.translate(x(0.86), y(0.2)); c.rotate(-0.25); c.fillStyle = '#4a4e55'; c.fillRect(-x(0.1), -9, x(0.2), 18); c.strokeStyle = '#fff'; c.setLineDash([10, 8]); c.lineWidth = 2; c.beginPath(); c.moveTo(-x(0.09), 0); c.lineTo(x(0.09), 0); c.stroke(); c.setLineDash([]); c.restore();
      c.fillStyle = '#1d2433'; c.font = '800 13px "IBM Plex Sans KR", sans-serif'; c.fillText('공항', x(0.86), y(0.2) - 20);
      // 화산(명암 있는 원뿔, 비스듬히 본 모양)
      const vx = x(0.24), vy = y(0.3), bw = x(0.2), bh = y(0.42);
      g = c.createLinearGradient(vx - bw, 0, vx + bw, 0); g.addColorStop(0, '#8a6a52'); g.addColorStop(0.45, '#6b4f3c'); g.addColorStop(1, '#3e2c22'); c.fillStyle = g;
      c.beginPath(); c.moveTo(vx - bw, vy + bh); c.quadraticCurveTo(vx - bw * 0.35, vy + bh * 0.3, vx - x(0.03), vy); c.lineTo(vx + x(0.03), vy); c.quadraticCurveTo(vx + bw * 0.35, vy + bh * 0.3, vx + bw, vy + bh); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(0,0,0,.18)'; c.lineWidth = 2; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(vx + i * x(0.008), vy + 4); c.quadraticCurveTo(vx + i * x(0.03), vy + bh * 0.5, vx + i * x(0.06), vy + bh); c.stroke(); }
      c.fillStyle = '#2a1d16'; c.beginPath(); c.ellipse(vx, vy, x(0.03), 6, 0, 0, TAU); c.fill();
      return art;
    }
    // 마을 집(그림자 있는 지붕)
    function house(c, x, y, burnt) {
      c.fillStyle = 'rgba(0,0,0,.2)'; c.fillRect(x - 9, y + 2, 22, 6);
      c.fillStyle = burnt ? '#5a4a40' : '#f2ead8'; c.fillRect(x - 10, y - 10, 20, 14);
      c.fillStyle = burnt ? '#2b211b' : '#c4513e'; c.beginPath(); c.moveTo(x - 13, y - 9); c.lineTo(x, y - 20); c.lineTo(x + 13, y - 9); c.fill();
    }
    const HOUSES = [[0.56, 0.6], [0.6, 0.66], [0.53, 0.7], [0.62, 0.74], [0.57, 0.8], [0.66, 0.68]];
    // 용암이 흐르는 길: 꼭대기 → 마을. 제방이면 제방 앞에서 멈추고, 수로면 빈 골짜기로
    function lavaPath() {
      if (on.canal) return [TOP, [0.3, 0.5], [0.36, 0.62], [0.28, 0.76], [0.18, 0.84]];
      if (on.dam) return [TOP, [0.34, 0.42], [0.46, 0.48]];
      return [TOP, [0.34, 0.42], [0.46, 0.52], [0.56, 0.66], [0.6, 0.78]];
    }
    function along(pts, u) { const n = pts.length - 1, f = Math.min(n - 1e-6, u * n), i = Math.floor(f), k = f - i; return [pts[i][0] + (pts[i + 1][0] - pts[i][0]) * k, pts[i][1] + (pts[i + 1][1] - pts[i][1]) * k]; }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const l = L(H);
        c.drawImage(ground(W, H), 0, 0, W, H);
        // 꼭대기 김(늘 조금)과 누르는 중 고리
        const [tx, ty] = [X(TOP[0]), Y(TOP[1])];
        for (let i = 0; i < 4; i++) { const ph = (t * 0.3 + i / 4) % 1; c.fillStyle = `rgba(230,230,230,${0.35 * (1 - ph)})`; c.beginPath(); c.arc(tx + Math.sin(i * 2 + t) * 6, ty - 8 - ph * 40, 6 + ph * 10, 0, TAU); c.fill(); }
        if (holding && !erupt) { hold += dt; c.strokeStyle = '#ff5a3c'; c.lineWidth = 5; c.beginPath(); c.arc(tx, ty, 26, -Math.PI / 2, -Math.PI / 2 + TAU * Math.min(1, hold / 0.8)); c.stroke(); if (hold >= 0.8) { holding = false; hold = 0; test(); } }
        else if (!erupt) { c.strokeStyle = `rgba(255,90,60,${0.4 + 0.3 * Math.sin(t * 4)})`; c.lineWidth = 2; c.setLineDash([5, 5]); c.beginPath(); c.arc(tx, ty, 24, 0, TAU); c.stroke(); c.setLineDash([]); P.txt(c, '꾹 누르기', tx, ty - 32, '#7a1d10', '800 12px'); }
        // 분출 장면
        const lava = lavaPath(); let reach = 0;
        if (erupt) { erupt.t += dt; reach = Math.min(1, erupt.t / 3.2); if (erupt.t > 4.2 && !erupt.done) { erupt.done = true; finish(); } }
        else if (tests.length) reach = 1;
        if (reach > 0) {
          c.lineCap = 'round'; c.lineJoin = 'round'; const N = 40;
          [['#7a1a0a', 18], ['#e2481c', 11], ['#ffb43a', 4]].forEach(([col, w]) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); for (let i = 0; i <= N * reach; i++) { const [u, v] = along(lava, i / N); c.lineTo(X(u), Y(v)); } c.stroke(); });
          const [hx, hy] = along(lava, reach); P.glow(c, X(hx), Y(hy), 26, 'rgba(255,140,40,.7)');
          if (erupt) for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (Math.sin(i * 7 + t * 9)) * 0.6, r = (t * 160 + i * 23) % 70; c.fillStyle = '#ff7a2a'; c.beginPath(); c.arc(tx + Math.cos(a) * r, ty + Math.sin(a) * r, 3, 0, TAU); c.fill(); }
          // 화산재 구름(바람 → 오른쪽 위 공항 쪽)
          const ar = Math.min(1, (erupt ? erupt.t : 4.2) / 4);
          for (let i = 0; i < 16; i++) { const u = i / 15 * ar; c.fillStyle = `rgba(90,90,96,${0.42 - u * 0.2})`; c.beginPath(); c.arc(tx + u * X(0.6), ty - 30 - Math.sin(u * 3) * 30 - u * Y(0.1), 16 + u * 26, 0, TAU); c.fill(); }
        }
        // 마을(용암이 닿으면 탄 집)
        const hitVillage = reach > 0.75 && !on.dam && !on.canal;
        HOUSES.forEach(([u, v], i) => house(c, X(u), Y(v), hitVillage && i < 4));
        P.txt(c, '마을', X(0.6), Y(0.88), '#1d2433', '800 14px');
        // 제방·수로 그림
        if (on.dam) { c.strokeStyle = '#7d7466'; c.lineWidth = 12; c.lineCap = 'butt'; c.beginPath(); c.moveTo(X(0.44), Y(0.42)); c.lineTo(X(0.52), Y(0.56)); c.stroke(); c.strokeStyle = '#a69d8c'; c.lineWidth = 4; c.stroke(); }
        if (on.canal) { c.strokeStyle = 'rgba(60,40,30,.75)'; c.lineWidth = 10; c.setLineDash([]); c.beginPath(); [[0.3, 0.5], [0.36, 0.62], [0.28, 0.76], [0.18, 0.84]].forEach(([u, v], i) => (i ? c.lineTo(X(u), Y(v)) : c.moveTo(X(u), Y(v)))); c.stroke(); }
        // 놓인 대책 표지와 (끄는 중) 놓을 자리 안내
        TOOLS.forEach((q) => {
          const [x, y] = [X(q.at[0]), Y(q.at[1])];
          if (on[q.k]) pin(c, q, x, y, '#2f8a45');
          else if (drag && drag.k === q.k) { c.strokeStyle = `rgba(255,216,77,${0.5 + 0.4 * Math.sin(t * 6)})`; c.lineWidth = 3; c.setLineDash([6, 5]); c.beginPath(); c.arc(x, y, 34, 0, TAU); c.stroke(); c.setLineDash([]); }
        });
        // 받침과 카드
        c.fillStyle = 'rgba(16,22,40,.95)'; c.fillRect(0, l, W, H - l);
        TOOLS.forEach((q, i) => { if (on[q.k] || (drag && drag.k === q.k)) return; const [x, y] = cardPos(W, H, i); chip(c, q, x, y, i === sel ? '#ffd84d' : '#5a6a90'); });
        if (drag) chip(c, TOOLS.find((q) => q.k === drag.k), drag.x, drag.y, '#ffd84d');
        if (bounce) { c.strokeStyle = `rgba(239,91,76,${bounce.a})`; c.lineWidth = 4; c.beginPath(); c.arc(bounce.x, bounce.y, 30 * (2 - bounce.a), 0, TAU); c.stroke(); bounce.a -= dt * 1.5; if (bounce.a <= 0) bounce = null; }
        if (erupt && erupt.done && erupt.t > 4.6) erupt = null;
      },
      down(p) {
        if (Math.hypot(p.x - X(TOP[0]), p.y - Y(TOP[1])) < 40 && !erupt) { holding = true; hold = 0; return; }
        const i = TOOLS.findIndex((q, j) => !on[q.k] && Math.abs(p.x - cardPos(S.W, S.H, j)[0]) < S.W * 0.08 && Math.abs(p.y - cardPos(S.W, S.H, j)[1]) < 26);
        if (i >= 0) { sel = i; drag = { k: TOOLS[i].k, x: p.x, y: p.y }; }
      },
      move(p, e, held) { if (held && drag) { drag.x = p.x; drag.y = p.y; } if (holding && Math.hypot(p.x - X(TOP[0]), p.y - Y(TOP[1])) > 60) { holding = false; hold = 0; } },
      up() {
        if (holding) { holding = false; if (hold < 0.8) say('화산 꼭대기를 <b>꾹</b> 눌러야 분출 시험이 시작된다'); hold = 0; }
        if (!drag) return; const q = TOOLS.find((z) => z.k === drag.k), { x, y } = drag; drag = null;
        if (y > L(S.H)) { S.kick(); return; }
        if (Math.hypot(x - X(q.at[0]), y - Y(q.at[1])) < Math.max(70, S.W * 0.09)) place(q.k);
        else { bounce = { x, y, a: 1 }; say(`여기는 알맞지 않다 — <b>${q.n}</b>은 ${q.tip}.`); S.kick(); }
      },
      key(e) {
        const i = '123456'.indexOf(e.key); if (i >= 0) { place(TOOLS[i].k); return true; }
        if (e.key === 'Enter') { test(); return true; } if (e.key === '0') { reset(); return true; } return false;
      },
    });
    function chip(c, q, x, y, edge) {
      const w = Math.min(150, S.W * 0.155), h = 46; c.save(); c.shadowColor = 'rgba(0,0,0,.4)'; c.shadowBlur = 6; c.shadowOffsetY = 3; c.fillStyle = '#fff7d6'; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, 9); c.fill(); c.restore();
      c.strokeStyle = edge; c.lineWidth = 2.5; c.beginPath(); c.roundRect(x - w / 2, y - h / 2, w, h, 9); c.stroke();
      P.txt(c, q.ic, x, y - 3, '#1d2433', '700 16px'); P.txt(c, q.n, x, y + 16, '#1d2433', '800 12px');
    }
    function pin(c, q, x, y, col) {
      c.fillStyle = 'rgba(0,0,0,.25)'; c.beginPath(); c.ellipse(x, y + 16, 12, 4, 0, 0, TAU); c.fill();
      c.fillStyle = '#fff'; c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 15, 0, TAU); c.fill(); c.stroke();
      P.txt(c, q.ic, x, y + 6, '#1d2433', '700 15px'); P.txt(c, q.n, x, y + 32, '#10331a', '800 12px');
    }
    function reset() { on = {}; drag = null; erupt = null; tests = []; sel = 0; holding = false; hold = 0; msg = ''; board.innerHTML = '<p class="pl-total">분출 시험 전</p>'; say('대책 카드를 끌어 지도의 알맞은 곳에 놓고, 화산 꼭대기를 꾹 눌러 분출 시험을 해 보자.'); steps(); S.kick(); }
    root.querySelector('.pl-reset')?.addEventListener('click', reset);
    root._pl = { place, test: () => { const r = test(); if (r) { erupt.t = 4.3; } return r; }, state: () => ({ placed: Object.keys(on), tests: tests.slice(), erupting: !!erupt }) };
    reset();
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Plan = { mount };
})();
