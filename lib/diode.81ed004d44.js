/* 2-2 4차시 체험 «다이오드의 방향»(참고서 «다이오드의 정류 작용», 교과서 89쪽 그림 Ⅱ-32 다이오드).
   회로 둘: 왼쪽은 전구만, 오른쪽은 전구 + 다이오드(발광 다이오드처럼 켜질 때 붉게 빛남).
   전지를 누르면 극이 뒤집히고, 다이오드를 누르면 방향이 뒤집힌다(돌아가는 움직임).
   전구 회로는 어느 쪽이든 켜지고 전류 점이 돈다. 다이오드 회로는 방향이 맞을 때만 켜지고, 반대면 점이 다이오드 앞에 막혀 쌓인다.
   키보드: 1 왼쪽 전지, 2 오른쪽 전지, 3 다이오드, 0 처음부터.
   Diode.mount(root) → { fit, setActive } · 시험용: root._dd.flip('bat1'|'bat2'|'diode') · state() */
(function () {
  'use strict';
  const N = 26; // 회로마다 전류 점 수
  function mount(root) {
    const stage = root.querySelector('.dd-stage'), now = root.querySelector('.dd-now'), out = root.querySelector('.dd-out');
    const P = window.Play;
    let st, msg = '', t = 0;
    const SD = 0.875; // 다이오드 자리(왼쪽 변 가운데, 둘레 비율)
    function reset() {
      st = { bat1: 1, bat2: 1, diode: 1, rot: { bat1: 0, bat2: 0, diode: 0 }, flips: { bat1: 0, bat2: 0, diode: 0 }, ok: new Set(),
        dots: [0, 1].map(() => Array.from({ length: N }, (_, i) => ({ s: i / N, stop: false }))) };
      msg = ''; say('전지나 다이오드를 눌러 뒤집어 보자 — 전구가 켜지는지, 전류 점이 어디서 멈추는지 보자'); steps();
    }
    const box = (W, H, i) => ({ x: W * (0.05 + i * 0.5), y: H * 0.2, w: W * 0.4, h: H * 0.58 });
    // 둘레 비율 s(0~1) → 좌표. 순서: 왼쪽 위 → 오른쪽 위 → 오른쪽 아래 → 왼쪽 아래 → 왼쪽 위
    function at(b, s) {
      const L = 2 * (b.w + b.h); let d = ((s % 1) + 1) % 1 * L;
      if (d < b.w) return [b.x + d, b.y]; d -= b.w;
      if (d < b.h) return [b.x + b.w, b.y + d]; d -= b.h;
      if (d < b.w) return [b.x + b.w - d, b.y + b.h]; d -= b.w;
      return [b.x, b.y + b.h - d];
    }
    const on = (i) => i === 0 || st.bat2 === st.diode;
    function say(h) { if (h !== msg) { msg = h; out.innerHTML = h; } }
    function steps() {
      const k = [1, 2, 3].find((n) => !st.ok.has(n)) || 0;
      window.L1.steps(root, k, [...st.ok]); window.L1.done(root, k === 0);
      const nt = k === 1 ? '① 왼쪽 회로의 전지를 눌러 뒤집자' : k === 2 ? '② 오른쪽 회로의 전지를 뒤집자' : k === 3 ? '③ 다이오드를 눌러 돌려 다시 켜자' : '다이오드는 한쪽으로만 전류를 보낸다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', k === 0); }
    }
    function flip(what) {
      st[what] *= -1; st.rot[what] = Math.PI; st.flips[what] += 1;
      st.dots.forEach((ds) => ds.forEach((d) => { d.stop = false; }));
      if (what === 'bat1') { st.ok.add(1); say('왼쪽 전구는 전지를 뒤집어도 <b>그대로 켜진다</b> — 전류 방향만 바뀐다'); }
      if (what === 'bat2') {
        if (st.ok.has(1)) st.ok.add(2);
        say(on(1) ? '다이오드 방향과 전지 방향이 맞았다 — <b>켜진다</b>' : '전지를 뒤집었더니 오른쪽은 <b>꺼졌다</b> — 전류가 다이오드의 출구로 들어가지 못해 막혔다');
      }
      if (what === 'diode') {
        if (st.ok.has(2) && on(1)) st.ok.add(3);
        say(on(1) ? '다이오드를 돌려 입구를 전류 쪽으로 — <b>다시 켜졌다</b>. 한쪽으로만 흐르게 하는 것이 <b>정류 작용</b>' : '다이오드가 거꾸로 — 전류가 막혀 <b>꺼졌다</b>');
      }
      steps(); S.kick();
    }
    // 그림(2026-11-10 «그래픽 다시 그리기»): 원통 건전지, 유리 전구(필라멘트·나사 꼭지), 실물 다이오드(검은 몸체 + 은색 띠 = 출구 쪽)
    const lg = (c, x0, y0, x1, y1, st2) => { const g = c.createLinearGradient(x0, y0, x1, y1); st2.forEach(([o, col]) => g.addColorStop(o, col)); return g; };
    function drawBattery(c, b, dir, rot) {
      const cx = b.x + b.w / 2, cy = b.y + b.h; // 아래 변 가운데
      c.save(); c.translate(cx, cy); c.rotate(rot); c.scale(dir > 0 ? 1 : -1, 1);
      c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.roundRect(-44, -14, 92, 32, 8); c.fill();
      c.fillStyle = lg(c, 0, -16, 0, 16, [[0, '#f2c544'], [0.45, '#fff1b0'], [0.6, '#c99a1c'], [1, '#6e5010']]); c.beginPath(); c.roundRect(-46, -16, 62, 32, [8, 0, 0, 8]); c.fill();
      c.fillStyle = lg(c, 0, -16, 0, 16, [[0, '#4b5260'], [0.45, '#9aa1ad'], [0.6, '#2f343e'], [1, '#14171c']]); c.beginPath(); c.roundRect(16, -16, 30, 32, [0, 8, 8, 0]); c.fill();
      c.fillStyle = lg(c, 0, -7, 0, 7, [[0, '#e6e9ee'], [1, '#8a919b']]); c.fillRect(-52, -7, 6, 14);
      c.restore();
      P.txt(c, '+', cx + (dir > 0 ? -30 : 30), cy + 7, '#3a2a00', '800 20px'); P.txt(c, '−', cx + (dir > 0 ? 30 : -30), cy + 7, '#e8edf5', '800 20px');
      P.txt(c, '전지 (누르면 뒤집기)', cx, cy + 40, 'rgba(225,232,245,.8)', '700 14px');
    }
    function drawBulb(c, b, lit) {
      const cx = b.x + b.w / 2, cy = b.y - 10;
      if (lit) P.glow(c, cx, cy - 6, 80, 'rgba(255,214,110,.6)');
      c.fillStyle = lg(c, cx - 11, 0, cx + 11, 0, [[0, '#6c7381'], [0.5, '#e2e5ea'], [1, '#5c6370']]); c.fillRect(cx - 11, cy + 14, 22, 16);
      c.strokeStyle = '#3e4450'; c.lineWidth = 1; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(cx - 11, cy + 16 + i * 3.6); c.lineTo(cx + 11, cy + 18 + i * 3.6); c.stroke(); }
      c.fillStyle = '#2a2f38'; c.beginPath(); c.roundRect(cx - 16, cy + 28, 32, 8, 2); c.fill();
      c.fillStyle = lit ? 'rgba(255,240,180,.92)' : 'rgba(205,220,245,.2)'; c.beginPath(); c.arc(cx, cy - 6, 22, 0, Math.PI * 2); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 1.6; c.beginPath(); c.arc(cx, cy - 6, 22, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = lit ? '#fff7cf' : '#9a8a64'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(cx - 6, cy + 13); c.lineTo(cx - 5, cy - 6); for (let i = 0; i < 5; i++) c.lineTo(cx - 5 + (i + 0.5) * 2.5, cy - 6 + (i % 2 ? 3 : -3)); c.lineTo(cx + 6, cy + 13); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(cx - 9, cy - 14, 4, 7, -0.6, 0, Math.PI * 2); c.fill();
      P.txt(c, lit ? '켜짐' : '꺼짐', cx, cy - 40, lit ? '#ffd84d' : '#8a93a8', '800 16px');
    }
    function drawDiode(c, b, dir, rot, lit) {
      const [cx, cy] = at(b, SD);
      if (lit) P.glow(c, cx, cy, 46, 'rgba(255,214,110,.45)');
      c.save(); c.translate(cx, cy); c.rotate(rot + (dir > 0 ? -Math.PI / 2 : Math.PI / 2)); c.scale(1.4, 1.4); // +x 쪽 = 흐를 수 있는 방향
      c.strokeStyle = '#c8cdd5'; c.lineWidth = 3; c.beginPath(); c.moveTo(-34, 0); c.lineTo(34, 0); c.stroke();
      c.fillStyle = lg(c, 0, -10, 0, 10, [[0, '#5a606c'], [0.35, '#1b1e24'], [1, '#05060a']]); c.beginPath(); c.roundRect(-18, -10, 36, 20, 6); c.fill();
      c.fillStyle = lg(c, 0, -10, 0, 10, [[0, '#f4f6f9'], [1, '#9aa1ab']]); c.fillRect(9, -10, 6, 20); // 은색 띠 = 출구(−) 쪽
      c.fillStyle = 'rgba(255,255,255,.18)'; c.fillRect(-16, -8, 32, 4);
      c.fillStyle = lit ? '#ffd84d' : '#c8d4f0'; c.beginPath(); c.moveTo(-8, -30); c.lineTo(8, -22); c.lineTo(-8, -14); c.closePath(); c.fill(); c.fillRect(8, -30, 3, 16); // 기호: 화살 = 흐르는 쪽
      c.restore();
      P.txt(c, '다이오드', cx + 70, cy - 6, '#fbfcf9', '800 15px', 'left'); P.txt(c, '은색 띠 = 출구 · 누르면 돌리기', cx + 70, cy + 14, 'rgba(210,220,240,.75)', '600 12px', 'left');
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt;
        { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#23304f'); g.addColorStop(1, '#141b30'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
        Object.keys(st.rot).forEach((k) => { st.rot[k] = Math.max(0, st.rot[k] - dt * 6); });
        [0, 1].forEach((i) => {
          const b = box(W, H, i), lit = on(i), dir = i ? st.bat2 : st.bat1;
          P.txt(c, i ? '전구 + 다이오드 회로' : '전구만 있는 회로', b.x + b.w / 2, H - 40, '#fbfcf9', '800 18px');
          c.lineJoin = 'round'; c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 9; c.strokeRect(b.x + 2, b.y + 3, b.w, b.h); c.strokeStyle = '#c9342a'; c.lineWidth = 6; c.strokeRect(b.x, b.y, b.w, b.h); c.strokeStyle = 'rgba(255,255,255,.3)'; c.lineWidth = 1.5; c.strokeRect(b.x, b.y, b.w, b.h);
          // 전류 점: 방향 dir(+1이면 둘레 비율이 늘어나는 쪽)
          const sp = 0.12 * dt;
          st.dots[i].forEach((d) => {
            if (i === 1 && !lit) {
              // 막힘: 다이오드 앞까지 와서 줄을 선다
              const gap = ((SD - d.s) * dir + 2) % 1;
              const rank = st.dots[i].filter((q) => q.stop).length;
              if (!d.stop && gap < 0.015 + rank * 0.012) d.stop = true;
              if (!d.stop) d.s = ((d.s + dir * sp) % 1 + 1) % 1;
            } else d.s = ((d.s + dir * sp) % 1 + 1) % 1;
            const [x, y] = at(b, d.s); c.fillStyle = d.stop ? '#ffb3a6' : '#9fe4ff'; c.beginPath(); c.arc(x, y, 4, 0, Math.PI * 2); c.fill();
          });
          drawBulb(c, b, lit); drawBattery(c, b, dir, i ? st.rot.bat2 : st.rot.bat1);
          if (i) drawDiode(c, b, st.diode, st.rot.diode, lit);
        });
        P.txt(c, '파란 점 = 전류가 흐르는 방향(전지 + 극에서 나와 − 극으로)', W / 2, H - 14, 'rgba(200,212,240,.7)', '600 13px');
      },
      down(p) {
        const W = S.W, H = S.H;
        for (const i of [0, 1]) {
          const b = box(W, H, i);
          if (Math.abs(p.x - (b.x + b.w / 2)) < 60 && Math.abs(p.y - (b.y + b.h)) < 36) { flip(i ? 'bat2' : 'bat1'); return; }
          if (i) { const [dx, dy] = at(b, SD); if (Math.hypot(p.x - dx, p.y - dy) < 40) { flip('diode'); return; } }
        }
      },
      key(e) { const m = { 1: 'bat1', 2: 'bat2', 3: 'diode' }[e.key]; if (m) { flip(m); return true; } if (e.key === '0') { reset(); S.kick(); return true; } return false; },
    });
    root.querySelector('.dd-reset')?.addEventListener('click', () => { reset(); S.kick(); });
    root._dd = { flip, state: () => ({ bat1: st.bat1, bat2: st.bat2, diode: st.diode, lit2: on(1), ok: [...st.ok] }) };
    reset();
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Diode = { mount };
})();
