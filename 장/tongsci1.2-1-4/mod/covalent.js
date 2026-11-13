/* 2-1 4차시 체험 «공유 결합 만들기»(교과서 70쪽 그림 Ⅱ-22·23 + 질소 분자는 참고서 내용). 원자(껍질 모형)를 끌어 다른 원자에 가까이 가져가 놓으면
   바깥 껍질이 겹치고, 겹친 곳에 두 원자가 하나씩 내놓은 전자가 짝을 이뤄 공유 전자쌍(노란 빛)이 된다.
   결합한 원자는 결합 거리에 스프링처럼 자리 잡는다(너무 붙이면 밀어내고, 끌어 떼면 다시 당긴다).
   위 짝 카드: 물(수소 둘 + 산소) / 산소 분자(전자쌍 2, 이중 결합) / 질소 분자(전자쌍 3, 삼중 결합). 키: 1~3 고르기, 스페이스·Enter 결합 하나 맺기.
   Covalent.mount(root) → { fit, setActive } · 시험용: root._cv.pick(0|1|2) · join() */
(function () {
  'use strict';
  const SETS = [
    { n: '물', f: 'H₂O', atoms: [8, 1, 1], bonds: [[0, 1, 1], [0, 2, 1]], line: 'H−O−H' },
    { n: '산소 분자', f: 'O₂', atoms: [8, 8], bonds: [[0, 1, 2]], line: 'O=O' },
    { n: '질소 분자', f: 'N₂', atoms: [7, 7], bonds: [[0, 1, 3]], line: 'N≡N' },
  ];
  const KIND = ['', '단일 결합', '이중 결합', '삼중 결합'];
  const conf = (k) => { const o = []; let r = k; [2, 8].forEach((m) => { if (r > 0) { o.push(Math.min(m, r)); r -= m; } }); return o; };
  function mount(root) {
    const stage = root.querySelector('.cv-stage'), now = root.querySelector('.cv-now'), out = root.querySelector('.cv-out');
    const P = window.Play, E = () => window.Elem;
    let si = 0, A = [], B = [], held = null, t = 0, msg = '', flash = 0; const done = new Set();
    const base = () => Math.min(S.W, S.H) * 0.095;
    const R = (i) => base() * (1 + i * 0.8);
    const outer = (a) => R(conf(a.z).length - 1);
    const d0 = (a, b) => (outer(a) + outer(b)) * 0.62;
    function say(h) { if (h !== msg) { msg = h; out.innerHTML = h; } }
    function pick(k) {
      si = k; held = null; const s = SETS[k], W = S.W || 800, H = S.H || 460;
      const xs = s.atoms.length === 3 ? [0.5, 0.18, 0.82] : [0.25, 0.75];
      A = s.atoms.map((z, i) => ({ z, x: W * xs[i], y: H * (s.atoms.length === 3 && i ? 0.7 : 0.55), vx: 0, vy: 0 }));
      B = s.bonds.map(([a, b, o]) => ({ a, b, o, on: false }));
      say(`<b>${s.n}</b>: 원자를 끌어 다른 원자에 바깥 껍질이 겹치도록 놓아 보자 (원자가 전자 ${s.atoms.map((z) => `${E().get(z).n} ${E().valence(z)}개`).filter((v, i, l) => l.indexOf(v) === i).join(', ')})`);
      S.kick();
    }
    function bond(b) {
      if (!b || b.on) return false; b.on = true; flash = 0.6; window.RxT.jolt(stage, 1);
      const s = SETS[si];
      if (B.every((q) => q.on)) {
        done.add(si);
        const pairs = B.reduce((n, q) => n + q.o, 0), like = [...new Set(s.atoms.map((z) => (z === 1 ? '수소는 헬륨' : `${E().get(z).n}는 네온`)))].join(', ');
        say(`<b>${s.f}</b> 완성 (${s.line}) — 공유 전자쌍 <b>${pairs}</b>개, ${s.bonds.length > 1 ? '두 결합 모두' : '두 원자 사이'} <b>${KIND[s.bonds[0][2]]}</b><br>${like}과 같은 전자 배치가 되어 안정해졌다`);
      } else say(`전자쌍 ${b.o}개를 함께 쓰기 시작했다 — 남은 원자도 붙여 보자`);
      S.kick(); return true;
    }
    function tryBond(a) { const i = A.indexOf(a); return bond(B.find((q) => !q.on && (q.a === i || q.b === i) && Math.hypot(A[q.a].x - A[q.b].x, A[q.a].y - A[q.b].y) < d0(A[q.a], A[q.b]) * 1.9)); }
    function lone(a, i) { return E().valence(a.z) - B.filter((q) => q.on && (q.a === i || q.b === i)).reduce((n, q) => n + q.o, 0); }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; if (!A.length) pick(0);
        c.fillStyle = '#0f1630'; c.fillRect(0, 0, W, H);
        SETS.forEach((s, i) => { const x = W * (0.25 + i * 0.25), y = H - 30; c.fillStyle = i === si ? '#ffd84d' : done.has(i) ? '#2f9e5b' : '#2a3560'; c.beginPath(); c.roundRect(x - 78, y - 20, 156, 40, 10); c.fill(); P.txt(c, `${i + 1} ${s.n}`, x, y + 7, i === si ? '#1d2433' : '#fbfcf9', '800 18px'); });
        // 물리: 결합한 쌍은 결합 거리 스프링, 모든 쌍은 너무 가까우면 밀어냄
        const F = A.map(() => [0, 0]);
        for (let i = 0; i < A.length; i++) for (let j = i + 1; j < A.length; j++) {
          const a = A[i], b = A[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.max(1, Math.hypot(dx, dy)), ux = dx / d, uy = dy / d;
          const q = B.find((k) => k.on && ((k.a === i && k.b === j) || (k.a === j && k.b === i)));
          let f = 0; const L = d0(a, b);
          if (q) f = (d - L) * 30; else if (d < L * 1.6) f = (d - L * 1.6) * 30;
          F[i][0] += ux * f; F[i][1] += uy * f; F[j][0] -= ux * f; F[j][1] -= uy * f;
        }
        A.forEach((a, i) => { if (a === held) return; const damp = Math.exp(-4 * dt); a.vx = (a.vx + F[i][0] * dt) * damp; a.vy = (a.vy + F[i][1] * dt) * damp; a.x = Math.max(outer(a), Math.min(W - outer(a), a.x + a.vx * dt)); a.y = Math.max(70 + outer(a), Math.min(H - outer(a), a.y + a.vy * dt)); });
        // 껍질·원자핵·안쪽 전자
        A.forEach((a) => {
          const sh = conf(a.z);
          sh.forEach((m, i) => { c.strokeStyle = i === sh.length - 1 ? 'rgba(190,210,255,.75)' : 'rgba(190,210,255,.4)'; c.lineWidth = 2; c.beginPath(); c.arc(a.x, a.y, R(i), 0, Math.PI * 2); c.stroke(); });
          if (sh.length > 1) for (let k = 0; k < 2; k++) { const g = k * Math.PI + t * 0.8; c.fillStyle = '#5aa9f0'; c.beginPath(); c.arc(a.x + Math.cos(g) * R(0), a.y + Math.sin(g) * R(0), 5.5, 0, Math.PI * 2); c.fill(); }
          c.fillStyle = '#e0503f'; c.beginPath(); c.arc(a.x, a.y, base() * 0.42, 0, Math.PI * 2); c.fill(); P.txt(c, E().get(a.z).s, a.x, a.y + 6, '#fff', '800 16px');
        });
        // 공유 전자쌍(겹친 곳)
        B.forEach((q) => {
          if (!q.on) return; const a = A[q.a], b = A[q.b], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, ang = Math.atan2(b.y - a.y, b.x - a.x), px = -Math.sin(ang), py = Math.cos(ang);
          P.glow(c, mx, my, 22 + q.o * 8, `rgba(255,216,77,${0.35 + flash * 0.4})`);
          for (let j = 0; j < q.o; j++) { const off = (j - (q.o - 1) / 2) * 15; [-1, 1].forEach((s) => { const x = mx + px * off + Math.cos(ang) * s * 5.5, y = my + py * off + Math.sin(ang) * s * 5.5; c.fillStyle = '#ffd84d'; c.beginPath(); c.arc(x, y, 5.5, 0, Math.PI * 2); c.fill(); }); }
        });
        // 바깥 껍질의 나머지 전자(결합 반대쪽에 모인다)
        A.forEach((a, i) => {
          const n = lone(a, i), r = outer(a); if (n <= 0) return;
          const dirs = B.filter((q) => q.on && (q.a === i || q.b === i)).map((q) => { const o = A[q.a === i ? q.b : q.a]; return Math.atan2(o.y - a.y, o.x - a.x); });
          let c0 = t * 0.4, span = Math.PI * 2;
          if (dirs.length) { const vx = dirs.reduce((s, g) => s + Math.cos(g), 0), vy = dirs.reduce((s, g) => s + Math.sin(g), 0); c0 = Math.atan2(-vy, -vx); span = Math.PI * (dirs.length > 1 ? 0.9 : 1.3); }
          for (let k = 0; k < n; k++) { const g = dirs.length ? c0 - span / 2 + span * (k + 0.5) / n : c0 + k / n * Math.PI * 2; c.fillStyle = '#7fd1ff'; c.beginPath(); c.arc(a.x + Math.cos(g) * r, a.y + Math.sin(g) * r, 5.5, 0, Math.PI * 2); c.fill(); }
        });
        if (flash > 0) flash = Math.max(0, flash - dt * 1.5);
        const s = SETS[si];
        if (done.has(si) && B.every((q) => q.on)) P.txt(c, `${s.f}  ${s.line}`, W * 0.72, 44, '#ffd84d', '800 24px');
        const ok = [0, 1, 2].filter((k) => done.has(k)).map((k) => k + 1);
        const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0; window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
        const nt = !B.every((q) => q.on) ? `원자를 끌어 붙여 ${s.n}을(를) 만들자` : st ? `떼어 봐도 다시 당긴다 · 다음: ${st} ${SETS[st - 1].n}` : '비금속 원자들은 전자쌍을 함께 써서 결합한다';
        if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
      },
      down(p) {
        const ci = SETS.findIndex((_, i) => Math.abs(p.x - S.W * (0.25 + i * 0.25)) < 78 && Math.abs(p.y - (S.H - 30)) < 20);
        if (ci >= 0) { pick(ci); return; }
        held = A.find((a) => Math.hypot(p.x - a.x, p.y - a.y) < outer(a)) || null; if (held) { held.vx = held.vy = 0; }
      },
      move(p, e, on) { if (on && held) { held.x = p.x; held.y = Math.max(60, p.y); } },
      up() { if (!held) return; const a = held; held = null; tryBond(a); },
      key(e) { const i = '123'.indexOf(e.key); if (i >= 0) { pick(i); return true; } if (e.key === ' ' || e.key === 'Enter') { bond(B.find((q) => !q.on)); return true; } return false; },
    });
    root._cv = { pick: (k) => pick(k), join: () => bond(B.find((q) => !q.on)) };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Covalent = { mount };
})();
