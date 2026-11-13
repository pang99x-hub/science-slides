/* 2-1 2차시 체험 «원시 원반에서 행성 만들기»(교과서 57쪽 + 참고서 47쪽). 원시 태양 둘레를 알갱이가 돈다(가까울수록 빠르게).
   가까운 곳은 회색 철·니켈·규소 알갱이만 드문드문, 얼음 경계 바깥은 흰 얼음 알갱이가 많고 푸른 수소·헬륨 기체가 가득하다.
   원반 위를 누른 채 문지르면 손끝의 미행성체가 알갱이를 쓸어 담으며 자란다. 바깥에서 충분히 크면 둘레의 기체까지 빨아들여 거대해진다(목성형).
   손을 떼면 그 자리에서 공전한다. 안쪽·바깥쪽 행성을 하나씩 만들면 오른쪽 표가 채워진다. 거리·경계는 이해를 돕기 위한 예.
   Disk.mount(root) → { fit, setActive } · 시험용: root._dk.make('in'|'out') */
(function () {
  'use strict';
  const SNOW = 0.42;
  function mount(root) {
    const stage = root.querySelector('.dk-stage'), out = root.querySelector('.dk-out'), now = root.querySelector('.dk-now'), tbl = root.querySelector('.dk-table');
    const P = window.Play;
    let ps = [], seed = null, planets = [], W0 = 0;
    const geo = (W, H) => ({ sx: W * 0.1, sy: H * 0.5, Rx: W * 0.86, k: 0.32 });
    function reset(W, H) {
      W0 = W; ps = []; planets = []; seed = null;
      for (let i = 0; i < 700; i++) {
        const r = 0.08 + Math.random() * 0.92, kind = r < SNOW ? (Math.random() < 0.35 ? 'rock' : null) : (Math.random() < 0.45 ? 'ice' : Math.random() < 0.8 ? 'gas' : 'rock');
        if (kind) ps.push({ r, a: Math.random() * Math.PI * 2, kind });
      }
    }
    const pos = (g, r, a) => [g.sx + Math.cos(a) * r * g.Rx, g.sy + Math.sin(a) * r * g.Rx * g.k];
    function say(h) { if (out.innerHTML !== h) out.innerHTML = h; }
    function steps() {
      const hasIn = planets.some((p) => !p.giant && p.r < SNOW), hasOut = planets.some((p) => p.giant);
      const ok = []; if (hasIn) ok.push(1); if (hasOut) ok.push(2); if (hasIn && hasOut) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      tbl.classList.toggle('in', hasIn); tbl.classList.toggle('out', hasOut);
      const nt = st === 1 ? '① 태양 가까운 원반을 누른 채 문질러 행성을 만들자' : st === 2 ? '② 얼음 경계 바깥에서 크게 키워 보자' : '두 행성을 표에서 견줘 보자';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        if (!ps.length || W !== W0) reset(W, H);
        const g = geo(W, H);
        c.fillStyle = '#0b1026'; c.fillRect(0, 0, W, H);
        // 얼음 경계
        c.setLineDash([8, 6]); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2; c.beginPath(); c.ellipse(g.sx, g.sy, SNOW * g.Rx, SNOW * g.Rx * g.k, 0, 0, Math.PI * 2); c.stroke(); c.setLineDash([]);
        P.txt(c, '얼음 경계', g.sx + SNOW * g.Rx, g.sy - SNOW * g.Rx * g.k - 8, '#fbfcf9', '700 19px');
        // 알갱이 공전
        ps.forEach((p) => { p.a += dt * 0.5 * Math.pow(p.r, -1.5) * 0.25; const [x, y] = pos(g, p.r, p.a); c.fillStyle = p.kind === 'rock' ? '#a7adb5' : p.kind === 'ice' ? '#eef7ff' : 'rgba(90,169,240,.55)'; c.fillRect(x, y, p.kind === 'gas' ? 2 : 3, p.kind === 'gas' ? 2 : 3); });
        P.glow(c, g.sx, g.sy, 70, 'rgba(255,240,190,1)', 'rgba(255,170,60,0)');
        // 미행성체 키우기
        if (seed) {
          const cap = 10 + Math.sqrt(seed.m) * 3 + (seed.giant ? 60 : 0);
          for (let i = ps.length - 1; i >= 0; i--) {
            const p = ps[i], [x, y] = pos(g, p.r, p.a);
            if (Math.hypot(x - seed.x, y - seed.y) < cap && (p.kind !== 'gas' || seed.giant)) { ps.splice(i, 1); seed.m += p.kind === 'gas' ? 1.5 : 1; seed.ice += p.kind === 'ice' ? 1 : 0; }
          }
          const r = Math.hypot((seed.x - g.sx) / g.Rx, (seed.y - g.sy) / (g.Rx * g.k));
          if (!seed.giant && r > SNOW && seed.m > 45) { seed.giant = true; window.RxT.jolt(stage, 1); }
          drawPlanet(c, seed.x, seed.y, seed);
          say(seed.giant ? '고체가 많아 빨리 자란 미행성체가 둘레의 <b>수소·헬륨 기체</b>까지 빨아들인다 → 거대한 <b>목성형</b>' : r < SNOW ? `가까운 곳: 녹는점 높은 <b>철·니켈·규소</b>만 고체 — 알갱이가 드물어 천천히 자란다(모은 양 ${seed.m})` : `바깥: <b>얼음</b>까지 고체라 빨리 자란다(모은 양 ${seed.m}) — 더 키우면?`);
        }
        planets.forEach((p) => { p.a += dt * 0.5 * Math.pow(p.r, -1.5) * 0.25; const [x, y] = pos(g, p.r, p.a); drawPlanet(c, x, y, p); P.txt(c, p.giant ? '목성형' : '지구형', x, y - (p.giant ? 46 : 22), '#ffd84d', '800 20px'); });
        if (!seed && !planets.length) P.txt(c, '원반 위를 누른 채 문질러 알갱이를 모으자', W * 0.55, H - 22, '#ffd84d', '800 22px');
        steps();
      },
      down(p) { seed = { x: p.x, y: p.y, m: 1, ice: 0, giant: false }; },
      move(p, e, held) { if (held && seed) { seed.x = p.x; seed.y = p.y; } },
      up() {
        if (!seed) return; const g = geo(S.W, S.H);
        if (seed.m >= 12) { const r = Math.hypot((seed.x - g.sx) / g.Rx, (seed.y - g.sy) / (g.Rx * g.k)), a = Math.atan2((seed.y - g.sy) / g.k, seed.x - g.sx); planets.push({ r, a, m: seed.m, giant: seed.giant, ice: seed.ice }); if (planets.length > 4) planets.shift(); say(seed.giant ? '<b>목성형 행성</b> — 크고 평균 밀도가 작다' : r < SNOW ? '<b>지구형 행성</b> — 작고 단단하며 평균 밀도가 크다' : '얼음 미행성체 — 더 키우면 기체를 끌어당긴다'); }
        seed = null;
      },
    });
    function drawPlanet(c, x, y, p) {
      if (p.giant) { P.glow(c, x, y, 44 + Math.sqrt(p.m), 'rgba(232,210,154,.55)'); c.fillStyle = '#d9a86a'; c.beginPath(); c.arc(x, y, 18 + Math.sqrt(p.m) * 1.2, 0, Math.PI * 2); c.fill(); }
      else { c.fillStyle = p.ice > p.m / 3 ? '#dfeefc' : '#8d8f94'; c.beginPath(); c.arc(x, y, 4 + Math.sqrt(p.m) * 1.1, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#ffd84d'; c.lineWidth = 2; c.stroke(); }
    }
    root.querySelector('.dk-reset').addEventListener('click', () => { reset(S.W, S.H); S.kick(); });
    root._dk = { make: (k) => { const g = geo(S.W, S.H); planets.push(k === 'in' ? { r: 0.25, a: 1, m: 20, giant: false, ice: 0 } : { r: 0.75, a: 2, m: 120, giant: true, ice: 40 }); S.kick(); } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Disk = { mount };
})();
