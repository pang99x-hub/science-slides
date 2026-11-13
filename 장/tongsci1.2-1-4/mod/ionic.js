/* 2-1 4차시 체험 «이온 결합 만들기»(교과서 68~69쪽 그림 Ⅱ-19·20 + 사고력 69쪽). 왼쪽 금속 원자, 오른쪽 비금속 원자(껍질 모형, 전자가 돈다).
   금속의 바깥 전자를 끌어 비금속의 바깥 껍질에 놓는다. 다 옮기면 양이온·음이온 표시(Na⁺, Cl⁻)가 나오고,
   두 이온이 정전기적 인력으로 서로 끌려가 붙는다(스프링 + 감쇠). 이온을 끌어 떼어 놓아도 놓는 순간 다시 끌려온다.
   위 짝 카드: 염화 나트륨 / 산화 마그네슘(전자 2개) / 염화 칼슘(칼슘 하나 + 염소 둘). 키: 1~3 짝 고르기, 스페이스·Enter 전자 하나 옮기기.
   Ionic.mount(root) → { fit, setActive } · 시험용: root._ib.pick(0|1|2) · move() */
(function () {
  'use strict';
  const PAIRS = [
    { m: 11, x: [17], f: 'NaCl', n: '염화 나트륨', r: '1 : 1' },
    { m: 12, x: [8], f: 'MgO', n: '산화 마그네슘', r: '1 : 1' },
    { m: 20, x: [17, 17], f: 'CaCl₂', n: '염화 칼슘', r: '1 : 2' },
  ];
  const SUP = (q) => (q === 0 ? '' : `${Math.abs(q) > 1 ? Math.abs(q) : ''}${q > 0 ? '⁺' : '⁻'}`.replace('2', '²').replace('3', '³'));
  const conf = (k) => { const o = []; let r = k; [2, 8, 8, 2].forEach((m) => { if (r > 0) { o.push(Math.min(m, r)); r -= m; } }); return o; };
  const ionName = (z, q) => { const n = window.Elem.get(z).n; return q > 0 ? `${n} 이온` : `${n.endsWith('소') ? n.slice(0, -1) : n}화 이온`; };
  function mount(root) {
    const stage = root.querySelector('.ib-stage'), now = root.querySelector('.ib-now'), out = root.querySelector('.ib-out');
    const P = window.Play, E = () => window.Elem;
    let pi = 0, A = [], drag = null, held = null, t = 0, msg = '', flash = 0, bonded = false; const done = new Set();
    const base = () => Math.min(S.W, S.H) * 0.058;
    const R = (i) => base() * (1 + i * 0.72);
    const outer = (a) => R(conf(a.ne).length - 1);
    function say(h) { if (h !== msg) { msg = h; out.innerHTML = h; } }
    function pick(k) {
      pi = k; bonded = false; drag = null; held = null; const p = PAIRS[k], W = S.W || 800, H = S.H || 460;
      const two = p.x.length > 1; // 염화 칼슘은 칼슘을 가운데, 염소를 양옆에
      A = [{ z: p.m, ne: p.m, x: W * (two ? 0.5 : 0.27), y: H * 0.56, vx: 0, vy: 0, metal: true }];
      p.x.forEach((z, i) => A.push({ z, ne: z, x: W * (two ? 0.17 + i * 0.66 : 0.73), y: H * 0.56, vx: 0, vy: 0, dir: two && !i ? Math.PI : 0 }));
      say(`<b>${E().get(p.m).n}</b>(원자가 전자 ${E().valence(p.m)}개)의 바깥 전자를 끌어 <b>${E().get(p.x[0]).n}</b>의 바깥 껍질에 놓아 보자`);
      S.kick();
    }
    function need(a) {
      if (a.metal) return a.ne - (a.z - E().valence(a.z));
      const sh = conf(a.ne); return sh.length > conf(a.z).length ? 0 : 8 - sh[sh.length - 1];
    }
    function give(to) {
      const m = A[0]; if (!to || need(m) <= 0 || need(to) <= 0) return false;
      m.ne -= 1; to.ne += 1; flash = 0.6;
      if (A.every((a) => need(a) <= 0)) finish(); else say(`전자가 옮겨 갔다 — ${E().get(m.z).n}에 바깥 전자 <b>${need(m)}</b>개가 남았다`);
      S.kick(); return true;
    }
    function finish() {
      bonded = true; done.add(pi); window.RxT.jolt(stage, 1);
      const p = PAIRS[pi], m = A[0], x = A[1];
      say(`<b>${E().get(m.z).s}${SUP(m.z - m.ne)}</b> ${ionName(m.z, 1)}(양이온) + <b>${E().get(x.z).s}${SUP(x.z - x.ne)}</b> ${ionName(x.z, -1)}(음이온) → 정전기적 인력으로 <b>${p.f}</b>(${p.n}), 개수비 ${p.r}<br><small>이름: 양이온은 «원소 이름 + 이온», 음이온은 «~화 이온»(염소 → 염화 이온, 산소 → 산화 이온)</small>`);
    }
    function nearAtom(p, list, pad) { return list.find((a) => Math.abs(Math.hypot(p.x - a.x, p.y - a.y) - outer(a)) < pad) || null; }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; if (!A.length) pick(0);
        c.fillStyle = '#0f1630'; c.fillRect(0, 0, W, H);
        // 짝 카드
        PAIRS.forEach((p, i) => { const x = W * (0.25 + i * 0.25), y = H - 30; c.fillStyle = i === pi ? '#ffd84d' : done.has(i) ? '#2f9e5b' : '#2a3560'; c.beginPath(); c.roundRect(x - 78, y - 20, 156, 40, 10); c.fill(); P.txt(c, `${i + 1} ${p.n}`, x, y + 7, i === pi ? '#1d2433' : '#fbfcf9', '800 18px'); });
        // 물리: 결합 뒤 비금속 이온을 금속 이온 옆 접촉 자리로 끈다(스프링 + 감쇠)
        if (bonded) {
          const m = A[0];
          A.slice(1).forEach((a) => {
            const d0 = outer(m) + outer(a) + 4, tx = m.x + Math.cos(a.dir) * d0, ty = m.y + Math.sin(a.dir) * d0, k = 26;
            const fx = (tx - a.x) * k, fy = (ty - a.y) * k;
            if (held !== a) { a.vx += fx * dt; a.vy += fy * dt; }
            if (held !== m) { m.vx -= fx * dt * 0.35; m.vy -= fy * dt * 0.35; }
          });
          const cx = W * 0.5 - (A.reduce((s, a) => s + a.x, 0) / A.length), cy = H * 0.56 - (A.reduce((s, a) => s + a.y, 0) / A.length);
          A.forEach((a) => { if (held !== a) { a.vx += cx * dt * 1.2; a.vy += cy * dt * 1.2; const damp = Math.exp(-3.2 * dt); a.vx *= damp; a.vy *= damp; a.x += a.vx * dt; a.y += a.vy * dt; } });
          A.slice(1).forEach((a) => { const m = A[0], d = Math.hypot(a.x - m.x, a.y - m.y); if (d > outer(m) + outer(a) + 30) { c.strokeStyle = 'rgba(255,216,77,.6)'; c.setLineDash([6, 6]); c.lineWidth = 2; c.beginPath(); c.moveTo(m.x, m.y); c.lineTo(a.x, a.y); c.stroke(); c.setLineDash([]); P.txt(c, '정전기적 인력', (m.x + a.x) / 2, (m.y + a.y) / 2 - 10, '#ffd84d', '700 15px'); } });
        }
        // 원자·이온
        A.forEach((a) => {
          const sh = conf(a.ne), last = sh.length - 1, q = a.z - a.ne;
          if (bonded) P.glow(c, a.x, a.y, outer(a) * 1.5, q > 0 ? 'rgba(255,138,122,.28)' : 'rgba(127,209,255,.28)');
          c.fillStyle = '#e0503f'; c.beginPath(); c.arc(a.x, a.y, base() * 0.55, 0, Math.PI * 2); c.fill(); P.txt(c, `+${a.z}`, a.x, a.y + 6, '#fff', '800 15px');
          sh.forEach((m, i) => {
            c.strokeStyle = 'rgba(190,210,255,.55)'; c.lineWidth = 2; c.beginPath(); c.arc(a.x, a.y, R(i), 0, Math.PI * 2); c.stroke();
            for (let k = 0; k < m; k++) { const ang = k / m * Math.PI * 2 + t * (0.5 - i * 0.08); const x = a.x + Math.cos(ang) * R(i), y = a.y + Math.sin(ang) * R(i); c.fillStyle = i === last ? '#7fd1ff' : '#5aa9f0'; c.beginPath(); c.arc(x, y, 5.5, 0, Math.PI * 2); c.fill(); }
          });
          if (bonded) { c.strokeStyle = q > 0 ? '#ff8a7a' : '#7fd1ff'; c.lineWidth = 2; const o = outer(a) + 8; c.beginPath(); c.moveTo(a.x - o + 8, a.y - o); c.lineTo(a.x - o, a.y - o); c.lineTo(a.x - o, a.y + o); c.lineTo(a.x - o + 8, a.y + o); c.moveTo(a.x + o - 8, a.y - o); c.lineTo(a.x + o, a.y - o); c.lineTo(a.x + o, a.y + o); c.lineTo(a.x + o - 8, a.y + o); c.stroke(); }
          P.txt(c, `${E().get(a.z).s}${SUP(q)}`, a.x, a.y - outer(a) - 16, bonded ? (q > 0 ? '#ff8a7a' : '#7fd1ff') : '#fbfcf9', '800 24px');
          if (!bonded) P.txt(c, a.metal ? '금속 원자' : '비금속 원자', a.x, a.y + outer(a) + 26, '#9aa6c8', '700 15px');
        });
        if (drag) { c.fillStyle = '#7fd1ff'; c.beginPath(); c.arc(drag.x, drag.y, 8, 0, Math.PI * 2); c.fill(); }
        if (flash > 0) { c.fillStyle = `rgba(127,209,255,${flash * 0.25})`; c.fillRect(0, 0, W, H); flash = Math.max(0, flash - dt * 2); }
        if (bonded) P.txt(c, `${PAIRS[pi].f} — ${PAIRS[pi].n}`, W * 0.5, H - 70, '#ffd84d', '800 22px');
        const ok = [0, 1, 2].filter((k) => done.has(k)).map((k) => k + 1);
        const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0; window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
        const nt = !bonded ? '금속의 바깥 전자를 끌어 비금속에 넣자' : st ? `이온을 끌어 떼어 보자 · 다음: ${st} ${PAIRS[st - 1].n}` : '전자를 주고받아 생긴 이온이 서로 끌어당긴다';
        if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
      },
      down(p) {
        const W = S.W, ci = PAIRS.findIndex((_, i) => Math.abs(p.x - W * (0.25 + i * 0.25)) < 78 && Math.abs(p.y - (S.H - 30)) < 20);
        if (ci >= 0) { pick(ci); return; }
        if (bonded) { held = A.find((a) => Math.hypot(p.x - a.x, p.y - a.y) < outer(a) + 10) || null; if (held) { held.vx = held.vy = 0; } return; }
        if (need(A[0]) > 0 && nearAtom(p, [A[0]], 16)) drag = { x: p.x, y: p.y };
      },
      move(p, e, on) { if (!on) return; if (drag) { drag.x = p.x; drag.y = p.y; } if (held) { held.x = p.x; held.y = p.y; } },
      up(p) {
        if (held) { held = null; say(msg.includes('다시 끌려') ? msg : `${msg}<br><b>놓자마자 다시 끌려와 붙었다</b> — (+)와 (−) 사이의 끌어당기는 힘`); return; }
        if (!drag) return; drag = null;
        const to = A.slice(1).find((a) => Math.hypot(p.x - a.x, p.y - a.y) < outer(a) + 24 && need(a) > 0);
        if (!give(to)) say('비금속 원자의 <b>바깥 껍질</b> 위에 놓아야 한다');
      },
      key(e) { const i = '123'.indexOf(e.key); if (i >= 0) { pick(i); return true; } if (e.key === ' ' || e.key === 'Enter') { give(A.slice(1).find((a) => need(a) > 0)); return true; } return false; },
    });
    root._ib = { pick: (k) => { pick(k); }, move: () => give(A.slice(1).find((a) => need(a) > 0)) };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Ionic = { mount };
})();
