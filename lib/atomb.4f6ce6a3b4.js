/* 2-1 3차시 체험 «전자 배치 만들기»(교과서 64쪽 해 보기: 투명 전자 껍질 + 붙임딱지). 가운데 원자핵, 둘레에 전자 껍질 넷.
   아래 «전자» 더미에서 파란 전자를 끌어 껍질에 놓으면 그 자리로 미끄러져 들어가 돈다. 안쪽 껍질(2개)이 차기 전에 바깥에 놓으면 튕겨 나온다.
   전자 수만큼 원자핵의 (+) 전하가 맞춰져(중성 원자) 어떤 원소인지·주기(껍질 수)·족·원자가 전자(노란 테)가 바로 나온다. 바깥 전자를 끌어내면 하나씩 빠진다.
   첫 껍질 2개, 둘째·셋째 8개(원자 번호 20까지는 넷째에 2개). AtomB.mount(root) → { fit, setActive } · 시험용: root._ab2.set(전자 수) */
(function () {
  'use strict';
  const CAP = [2, 8, 8, 2];
  function mount(root) {
    const stage = root.querySelector('.am-stage'), now = root.querySelector('.am-now'), out = root.querySelector('.am-out');
    const P = window.Play, E = () => window.Elem;
    let n = 0, drag = null, fly = [], t = 0, bounce = null, made = new Set(), msg = '';
    const G = (W, H) => ({ cx: W * 0.44, cy: H * 0.47, r: Math.min(W, H) * 0.1, pile: [W * 0.08, H * 0.85] });
    const shellR = (g, i) => g.r * (1.25 + i * 0.85);
    const conf = (k) => { const o = []; let r = k; CAP.forEach((m) => { if (r > 0) { o.push(Math.min(m, r)); r -= m; } }); return o; };
    function say(h) { if (h !== msg) { msg = h; out.innerHTML = h; } }
    function info() {
      if (!n) { say('전자를 끌어 첫 번째 껍질에 놓아 보자'); return; }
      const e = E().get(n), sh = conf(n), v = E().valence(n);
      say(`전자 ${n}개 → 원자핵 <b>+${n}</b> → <b>${e.n}(${e.s})</b> · 껍질 ${sh.length}개 = <b>${e.p}주기</b> · ${e.g}족 · 원자가 전자 <b>${v}</b>${v === 0 ? '(18족: 바깥 껍질이 꽉 참)' : ''}`);
      if ([6, 11, 17].includes(n)) made.add(n);
    }
    function steps() {
      const ok = []; if (made.has(6)) ok.push(1); if (made.has(11)) ok.push(2); if (made.has(17)) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 전자 6개를 놓아 탄소를 만들자' : st === 2 ? '② 계속 놓아 나트륨(11)을 만들자' : st === 3 ? '③ 염소(17)까지 가 보자' : '껍질 수 = 주기, 바깥 전자 수 = 족';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const g = G(W, H), sh = conf(n), last = sh.length - 1;
        c.fillStyle = '#0f1630'; c.fillRect(0, 0, W, H);
        for (let i = 0; i < 4; i++) { c.strokeStyle = i <= last ? 'rgba(190,210,255,.8)' : 'rgba(190,210,255,.25)'; c.lineWidth = 3; c.beginPath(); c.arc(g.cx, g.cy, shellR(g, i), 0, Math.PI * 2); c.stroke(); P.txt(c, `${i + 1}번째 · 최대 ${CAP[i]}`, g.cx, g.cy - shellR(g, i) - 5, 'rgba(190,210,255,.75)', '600 13px'); }
        P.glow(c, g.cx, g.cy, g.r * 0.9, 'rgba(239,91,76,.9)'); c.fillStyle = '#e0503f'; c.beginPath(); c.arc(g.cx, g.cy, g.r * 0.6, 0, Math.PI * 2); c.fill();
        P.txt(c, `+${n}`, g.cx, g.cy + 8, '#fff', '800 24px');
        sh.forEach((m, i) => { for (let k = 0; k < m; k++) { const a = k / m * Math.PI * 2 + t * (0.6 - i * 0.12), x = g.cx + Math.cos(a) * shellR(g, i), y = g.cy + Math.sin(a) * shellR(g, i); if (i === last && E().valence(n)) { c.strokeStyle = '#ffd84d'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 12, 0, Math.PI * 2); c.stroke(); } c.fillStyle = '#5aa9f0'; c.beginPath(); c.arc(x, y, 8, 0, Math.PI * 2); c.fill(); P.txt(c, '−', x, y + 4, '#fff', '800 12px'); } });
        if (n) { const e = E().get(n); P.txt(c, `${e.n} ${e.s}`, W * 0.86, 60, '#fbfcf9', '800 32px'); P.txt(c, `${e.p}주기 ${e.g}족`, W * 0.86, 94, '#ffd84d', '800 22px'); P.txt(c, '노란 테 = 원자가 전자', W * 0.86, 124, '#ffd84d', '600 16px'); }
        // 전자 더미
        const [px, py] = g.pile; c.fillStyle = '#16203f'; c.strokeStyle = '#5a6a90'; c.lineWidth = 2; c.beginPath(); c.roundRect(px - 50, py - 34, 100, 68, 14); c.fill(); c.stroke();
        for (let k = 0; k < 6; k++) { c.fillStyle = '#5aa9f0'; c.beginPath(); c.arc(px - 30 + (k % 3) * 30, py - 10 + Math.floor(k / 3) * 22, 8, 0, Math.PI * 2); c.fill(); }
        P.txt(c, '전자', px, py + 52, '#fbfcf9', '700 18px');
        if (drag) { c.fillStyle = '#5aa9f0'; c.beginPath(); c.arc(drag.x, drag.y, 10, 0, Math.PI * 2); c.fill(); }
        if (bounce) { bounce.t -= dt; c.fillStyle = `rgba(239,91,76,${bounce.t})`; c.beginPath(); c.arc(bounce.x, bounce.y + (1 - bounce.t) * 40, 10, 0, Math.PI * 2); c.fill(); if (bounce.t <= 0) bounce = null; }
        steps();
      },
      down(p) {
        const g = G(S.W, S.H), [px, py] = g.pile;
        if (Math.abs(p.x - px) < 55 && Math.abs(p.y - py) < 40) { drag = { x: p.x, y: p.y, from: 'pile' }; return; }
        const sh = conf(n), last = sh.length - 1;
        if (n && Math.abs(Math.hypot(p.x - g.cx, p.y - g.cy) - shellR(g, last)) < 16) { n -= 1; drag = { x: p.x, y: p.y, from: 'shell' }; info(); }
      },
      move(p, e, held) { if (held && drag) { drag.x = p.x; drag.y = p.y; } },
      up(p) {
        if (!drag) return; const g = G(S.W, S.H), d = Math.hypot(p.x - g.cx, p.y - g.cy);
        let ring = -1; for (let i = 0; i < 4; i++) if (Math.abs(d - shellR(g, i)) < g.r * 0.42) ring = i;
        if (ring >= 0) {
          const sh = conf(n), want = conf(n + 1).length - 1;
          if (n >= 20) { say('원자 번호 20까지만 만들 수 있다'); }
          else if (ring === want) { n += 1; info(); }
          else if (ring > want) { bounce = { x: p.x, y: p.y, t: 1 }; window.RxT.jolt(stage, 1); say(`튕겨 나왔다! 전자는 <b>안쪽 껍질부터</b> 채운다 — ${want + 1}번째 껍질(최대 ${CAP[want]}개)이 아직 덜 찼다`); }
          else { bounce = { x: p.x, y: p.y, t: 1 }; say(`${ring + 1}번째 껍질은 이미 꽉 찼다(최대 ${CAP[ring]}개) — 다음 껍질로`); }
          void sh;
        }
        drag = null;
      },
      key(e) { if (e.key === '+' || e.key === 'ArrowUp') { if (n < 20) { n += 1; info(); } return true; } if (e.key === '-' || e.key === 'ArrowDown') { if (n > 0) { n -= 1; info(); } return true; } return false; },
    });
    info();
    root._ab2 = { set: (k) => { n = k; info(); S.kick(); } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.AtomB = { mount };
})();
