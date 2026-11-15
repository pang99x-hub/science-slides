/* 2-2 4차시 체험 «색이 바뀌는 자동차»(교과서 92쪽 과학 이야기 · 전자 잉크).
   왼쪽: 자동차 옆모습을 채운 마이크로캡슐 칸. 위 붓 둘 중 «검게(+)»를 고르고 칸을 문지르면 그 칸에 전압이 걸려
   (+)를 띤 검은 안료가 보는 쪽으로 끌려 올라와 검게, «희게(−)»로 문지르면 (−)를 띤 흰 안료가 끌려 올라와 희게 바뀐다.
   오른쪽: 마지막으로 문지른 캡슐의 확대 단면 — 흰 알갱이(−)·검은 알갱이(+)가 전극 전압 따라 위아래로 움직인다.
   손을 떼면 전압이 꺼져도 색은 그대로(전기를 거의 쓰지 않는다 — 교과서 측주).
   키보드: B 검게 붓, W 희게 붓, 화살표로 칸 옮기기, 스페이스 칠하기, 0 처음부터.
   EInk.mount(root) → { fit, setActive } · 시험용: root._ek.paint(n) · erase(n) · state() */
(function () {
  'use strict';
  const C = 16, R = 7;
  // 자동차 옆모습 안쪽인가(칸 중심을 0~1로)
  const inCar = (u, v) => (v > 0.45 && v < 0.92 && u > 0.04 && u < 0.97) || (v > 0.1 && v <= 0.45 && u > 0.26 + (0.45 - v) * 0.35 && u < 0.72 - (0.45 - v) * 0.3);
  function mount(root) {
    const stage = root.querySelector('.ek-stage'), now = root.querySelector('.ek-now'), out = root.querySelector('.ek-out');
    const P = window.Play;
    let cells = [], tool = 1, held = false, last = null, volt = 0, msg = '', cur = [0, 0], did = { b: false, w: false };
    for (let j = 0; j < R; j++) for (let i = 0; i < C; i++) { const u = (i + 0.5) / C, v = (j + 0.5) / R; if (inCar(u, v)) cells.push({ i, j, v: 0, to: 0 }); }
    const car = (W, H) => ({ x: W * 0.04, y: H * 0.2, w: W * 0.56, h: H * 0.62 });
    const cellAt = (W, H, x, y) => { const b = car(W, H), i = Math.floor((x - b.x) / b.w * C), j = Math.floor((y - b.y) / b.h * R); return cells.find((q) => q.i === i && q.j === j); };
    const black = () => cells.filter((q) => q.to === 1).length;
    function say(h) { if (h !== msg) { msg = h; out.innerHTML = h; } }
    function steps() {
      const ok = []; if (did.b) ok.push(1); if (did.w) ok.push(2); if (black() >= 15) ok.push(3);
      const k = [1, 2, 3].find((q) => !ok.includes(q)) || 0;
      window.L1.steps(root, k, ok); window.L1.done(root, k === 0);
      const nt = k === 1 ? '① «검게» 붓으로 차체를 문질러 보자' : k === 2 ? '② «희게» 붓으로 조금 지워 보자' : k === 3 ? `③ 검은 칸 15개 이상으로 무늬를 만들자 (${black()})` : '전압의 방향이 안료의 자리를 바꾼다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', k === 0); }
    }
    function touch(q) {
      if (!q || q.to === tool) { if (q) last = q; return; }
      q.to = tool; last = q; volt = tool ? 1 : -1;
      if (tool) did.b = true; else if (did.b) did.w = true;
      say(tool ? '보는 쪽 전극에 <b>(−)</b>를 걸면 <b>(+)를 띤 검은 안료</b>가 끌려 올라와 검게 보인다' : '보는 쪽 전극에 <b>(+)</b>를 걸면 <b>(−)를 띤 흰 안료</b>가 끌려 올라와 희게 보인다');
      steps();
    }
    function drawCapsule(c, cx, cy, r, s) {
      // s: 0 흰 안료 위, 1 검은 안료 위
      { const g = c.createRadialGradient(cx - r * 0.4, cy - r * 0.4, r * 0.1, cx, cy, r); g.addColorStop(0, 'rgba(230,245,255,.35)'); g.addColorStop(1, 'rgba(120,160,210,.12)'); c.fillStyle = g; } c.strokeStyle = '#dfe8f7'; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill(); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.ellipse(cx - r * 0.45, cy - r * 0.55, r * 0.18, r * 0.08, -0.6, 0, Math.PI * 2); c.fill();
      for (let k = 0; k < 9; k++) {
        const a = k / 9 * Math.PI * 2, jx = Math.cos(a * 3) * r * 0.42, jy = Math.sin(a * 2) * r * 0.12;
        const wy = cy + (s - 0.5) * r * 1.0 + jy, by = cy - (s - 0.5) * r * 1.0 - jy; // 흰 것과 검은 것이 서로 반대쪽
        c.fillStyle = '#fbfcf9'; c.beginPath(); c.arc(cx + jx, wy, r * 0.11, 0, Math.PI * 2); c.fill(); P.txt(c, '−', cx + jx, wy + 4, '#1d2433', '800 11px');
        c.fillStyle = '#20242c'; c.strokeStyle = '#8a93a8'; c.lineWidth = 1; c.beginPath(); c.arc(cx - jx, by, r * 0.11, 0, Math.PI * 2); c.fill(); c.stroke(); P.txt(c, '+', cx - jx, by + 4, '#fbfcf9', '800 11px');
      }
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        { const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1d2742'); g.addColorStop(0.75, '#2b3656'); g.addColorStop(1, '#3a4568'); c.fillStyle = g; c.fillRect(0, 0, W, H); }
        if (!held) volt += (0 - volt) * Math.min(1, dt * 3);
        cells.forEach((q) => { q.v += (q.to - q.v) * Math.min(1, dt * 5); });
        // 붓 고르기
        [['검게 (+)', 1], ['희게 (−)', 0]].forEach(([nm, k], n) => {
          const x = W * (0.4 + n * 0.17), y = 32; c.fillStyle = tool === k ? '#ffd84d' : '#2a3560'; c.beginPath(); c.roundRect(x - 58, y - 17, 116, 34, 9); c.fill();
          P.txt(c, nm, x, y + 6, tool === k ? '#1d2433' : '#fbfcf9', '800 16px');
        });
        // 자동차(2026-11-10 «그래픽 다시 그리기»): 전시장 바닥 위 승용차 옆모습 — 그림자, 차체 곡선, 유리창 틀, 바퀴 휠, 전조등
        const b = car(W, H), cw = b.w / C, ch = b.h / R;
        const gy = b.y + b.h * 1.06;
        c.fillStyle = 'rgba(0,0,0,.45)'; c.beginPath(); c.ellipse(b.x + b.w / 2, gy, b.w * 0.55, 10, 0, 0, Math.PI * 2); c.fill();
        const body = () => { c.beginPath(); c.moveTo(b.x - 6, b.y + b.h * 0.95); c.lineTo(b.x - 8, b.y + b.h * 0.6); c.quadraticCurveTo(b.x - 4, b.y + b.h * 0.44, b.x + b.w * 0.14, b.y + b.h * 0.4);
          c.quadraticCurveTo(b.x + b.w * 0.2, b.y + b.h * 0.05, b.x + b.w * 0.32, b.y - 4); c.lineTo(b.x + b.w * 0.66, b.y - 4); c.quadraticCurveTo(b.x + b.w * 0.76, b.y + b.h * 0.05, b.x + b.w * 0.86, b.y + b.h * 0.4);
          c.quadraticCurveTo(b.x + b.w + 10, b.y + b.h * 0.46, b.x + b.w + 8, b.y + b.h * 0.62); c.lineTo(b.x + b.w + 6, b.y + b.h * 0.95); c.closePath(); };
        c.fillStyle = (() => { const g = c.createLinearGradient(0, b.y, 0, b.y + b.h); g.addColorStop(0, '#3b4a6e'); g.addColorStop(0.5, '#243352'); g.addColorStop(1, '#141c30'); return g; })(); body(); c.fill();
        cells.forEach((q) => { // 캡슐 하나 = 작은 진주알(흰 안료 ↔ 검은 안료)
          const x = b.x + (q.i + 0.5) * cw, y = b.y + (q.j + 0.5) * ch, r = Math.min(cw, ch) * 0.46, g0 = Math.round(240 - q.v * 215);
          const gr = c.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.1, x, y, r); gr.addColorStop(0, `rgb(${Math.min(255, g0 + 30)},${Math.min(255, g0 + 30)},${Math.min(255, g0 + 34)})`); gr.addColorStop(1, `rgb(${Math.max(0, g0 - 40)},${Math.max(0, g0 - 40)},${Math.max(0, g0 - 34)})`);
          c.fillStyle = gr; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill();
          if (q === last) { c.strokeStyle = '#ffd84d'; c.lineWidth = 2; c.stroke(); }
        });
        // 유리창 틀(반투명 유리 — 캡슐이 비쳐 보임)과 문 틈·손잡이
        c.fillStyle = 'rgba(120,170,230,.18)'; c.strokeStyle = '#0c1220'; c.lineWidth = 4;
        c.beginPath(); c.moveTo(b.x + b.w * 0.2, b.y + b.h * 0.38); c.quadraticCurveTo(b.x + b.w * 0.25, b.y + b.h * 0.08, b.x + b.w * 0.34, b.y + b.h * 0.06); c.lineTo(b.x + b.w * 0.48, b.y + b.h * 0.06); c.lineTo(b.x + b.w * 0.48, b.y + b.h * 0.38); c.closePath(); c.fill(); c.stroke();
        c.beginPath(); c.moveTo(b.x + b.w * 0.51, b.y + b.h * 0.06); c.lineTo(b.x + b.w * 0.64, b.y + b.h * 0.06); c.quadraticCurveTo(b.x + b.w * 0.72, b.y + b.h * 0.1, b.x + b.w * 0.79, b.y + b.h * 0.38); c.lineTo(b.x + b.w * 0.51, b.y + b.h * 0.38); c.closePath(); c.fill(); c.stroke();
        c.strokeStyle = 'rgba(10,15,28,.8)'; c.lineWidth = 2; c.beginPath(); c.moveTo(b.x + b.w * 0.495, b.y + b.h * 0.4); c.lineTo(b.x + b.w * 0.5, b.y + b.h * 0.86); c.stroke();
        c.fillStyle = '#c9cfd8'; [0.4, 0.68].forEach((u) => { c.beginPath(); c.roundRect(b.x + b.w * u, b.y + b.h * 0.47, b.w * 0.05, 5, 2.5); c.fill(); });
        c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 2; body(); c.stroke();
        P.glow(c, b.x + b.w + 4, b.y + b.h * 0.55, 20, 'rgba(255,240,180,.6)'); c.fillStyle = '#fff4c8'; c.beginPath(); c.ellipse(b.x + b.w + 2, b.y + b.h * 0.55, 5, 8, 0, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#d8261a'; c.beginPath(); c.roundRect(b.x - 10, b.y + b.h * 0.52, 6, 14, 2); c.fill();
        // 바퀴: 휠 아치 + 타이어 + 은빛 휠(살)
        [0.2, 0.8].forEach((u) => { const x = b.x + b.w * u, y = b.y + b.h * 0.95, R2 = ch * 1.05;
          c.fillStyle = '#05070c'; c.beginPath(); c.arc(x, y, R2 * 1.12, Math.PI, 0); c.fill();
          c.fillStyle = '#15171c'; c.beginPath(); c.arc(x, y, R2, 0, Math.PI * 2); c.fill();
          const rg = c.createRadialGradient(x - 3, y - 3, 1, x, y, R2 * 0.62); rg.addColorStop(0, '#f2f4f7'); rg.addColorStop(1, '#7d8591'); c.fillStyle = rg; c.beginPath(); c.arc(x, y, R2 * 0.62, 0, Math.PI * 2); c.fill();
          c.strokeStyle = '#4a515c'; c.lineWidth = 3; for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; c.beginPath(); c.moveTo(x + Math.cos(a) * R2 * 0.15, y + Math.sin(a) * R2 * 0.15); c.lineTo(x + Math.cos(a) * R2 * 0.55, y + Math.sin(a) * R2 * 0.55); c.stroke(); }
          c.fillStyle = '#2a2f38'; c.beginPath(); c.arc(x, y, R2 * 0.13, 0, Math.PI * 2); c.fill(); });
        P.txt(c, '동그라미 하나 = 아주 가는 마이크로캡슐 하나(크게 그림)', b.x + b.w / 2, H - 12, 'rgba(200,212,240,.7)', '600 13px');
        // 확대 단면
        const cx = W * 0.8, cy = H * 0.48, r = Math.min(W * 0.14, H * 0.3), s = last ? last.v : 0;
        P.txt(c, '캡슐 하나 확대', cx, H * 0.1, '#fbfcf9', '800 17px');
        [cy - r - 20, cy + r + 12].forEach((y) => { const g = c.createLinearGradient(0, y, 0, y + 8); g.addColorStop(0, '#e8ecf2'); g.addColorStop(1, '#7c8593'); c.fillStyle = g; c.fillRect(cx - r, y, r * 2, 8); });
        const vs = Math.abs(volt) > 0.1 ? (volt > 0 ? '(−)' : '(+)') : '꺼짐'; // 검게 칠할 때 보는 쪽 전극은 (−)
        P.txt(c, `보는 쪽 전극 ${vs}`, cx, cy - r - 30, Math.abs(volt) > 0.1 ? '#7fd1ff' : '#8a93a8', '700 14px');
        drawCapsule(c, cx, cy, r, s);
        if (!held && last) P.txt(c, '전압을 꺼도 색은 그대로', cx, cy + r + 44, '#5cc77a', '700 13px');
      },
      down(p) {
        if (p.y < 52) { const n = [0, 1].find((k) => Math.abs(p.x - S.W * (0.4 + k * 0.17)) < 58); if (n != null) { tool = n === 0 ? 1 : 0; return; } }
        held = true; touch(cellAt(S.W, S.H, p.x, p.y));
      },
      move(p, e, h) { if (h && held) touch(cellAt(S.W, S.H, p.x, p.y)); },
      up() { held = false; },
      key(e) {
        if (e.key === 'b' || e.key === 'B') { tool = 1; return true; } if (e.key === 'w' || e.key === 'W') { tool = 0; return true; }
        const d = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] }[e.key];
        if (d) { cur = [Math.max(0, Math.min(C - 1, cur[0] + d[0])), Math.max(0, Math.min(R - 1, cur[1] + d[1]))]; last = cells.find((q) => q.i === cur[0] && q.j === cur[1]) || last; return true; }
        if (e.key === ' ') { touch(cells.find((q) => q.i === cur[0] && q.j === cur[1])); return true; }
        if (e.key === '0') { reset(); return true; } return false;
      },
    });
    function reset() { cells.forEach((q) => { q.v = 0; q.to = 0; }); tool = 1; last = null; volt = 0; did = { b: false, w: false }; msg = ''; say('붓을 고르고 차체의 캡슐을 문질러 보자 — 문지른 칸에만 전압이 걸린다'); steps(); S.kick(); }
    root.querySelector('.ek-reset')?.addEventListener('click', reset);
    const run = (n, k) => { tool = k; cells.filter((q) => q.to !== k).slice(0, n).forEach(touch); S.kick(); return black(); };
    root._ek = { paint: (n) => run(n, 1), erase: (n) => run(n, 0), state: () => ({ black: black(), cells: cells.length, did: { ...did } }) };
    reset();
    return { fit: S.fit, setActive: S.setActive };
  }
  window.EInk = { mount };
})();
