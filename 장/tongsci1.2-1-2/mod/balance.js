/* 2-1 2차시 이론 «수소 핵융합과 별의 크기»(교과서 55쪽 + 참고서 44쪽 힘의 평형). 살아 있는 별:
   별 가장자리를 끌어 누르거나 늘렸다 놓으면 중력(파란 안쪽 화살표)과 내부 압력에 의한 힘(빨간 바깥 화살표)이 달라져
   출렁이다 제 크기로 돌아온다(평형). 중심의 수소가 줄어(왼쪽 아래 막대) 바닥나면 핵융합이 멈춰 수축 → 중심이 뜨거워져
   헬륨 핵융합 → 바깥이 크게 부풀어 붉은 적색 거성. 크기·시간은 이해를 돕기 위한 과장. Balance.mount(root) → { fit, setActive } · 시험용: root._ba.squeeze(배) · drain() */
(function () {
  'use strict';
  function mount(root) {
    const stage = root.querySelector('.ba-stage'), out = root.querySelector('.ba-out'), now = root.querySelector('.ba-now');
    const P = window.Play;
    let R = 1, v = 0, hold = null, fuel = 1, phase = 'main', tPh = 0, did = { sq: false, st: false }, msg = '';
    const eqR = () => (phase === 'main' ? 1 : phase === 'collapse' ? 0.55 : 2.3);
    function say(h) { if (h !== msg) { msg = h; out.innerHTML = h; } }
    function steps() {
      const ok = []; if (did.sq) ok.push(1); if (did.st) ok.push(2); if (phase === 'giant') ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 별 가장자리를 끌어 안으로 눌렀다 놓자' : st === 2 ? '② 바깥으로 늘렸다 놓자' : st === 3 ? '③ 수소가 바닥날 때까지 지켜보자' : '수소가 바닥나 적색 거성이 됐다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        const cx = W / 2, cy = H * 0.52, R0 = Math.min(W, H) * 0.17;
        // 연료와 단계
        if (phase === 'main' && did.sq && did.st) fuel = Math.max(0, fuel - dt * 0.06);
        if (phase === 'main' && fuel <= 0) { phase = 'collapse'; tPh = 0; }
        if (phase === 'collapse') { tPh += dt; if (tPh > 2.2) { phase = 'giant'; window.RxT.jolt(stage, 1); } }
        // 힘과 운동
        const g = 1 / (R * R), pr = phase === 'collapse' ? 0.3 * Math.pow(eqR(), 1) / (R * R * R) : Math.pow(eqR(), 1) / (R * R * R);
        if (!hold) { v += (pr - g) * 6 * dt; v *= Math.pow(0.25, dt); R = Math.max(0.3, Math.min(3, R + v * dt * 2)); }
        // 그리기
        c.fillStyle = '#0b1026'; c.fillRect(0, 0, W, H);
        const r = R0 * R, giant = phase === 'giant';
        const sg = c.createRadialGradient(cx, cy, 2, cx, cy, r); sg.addColorStop(0, giant ? '#ffd0a0' : '#fff6c8'); sg.addColorStop(0.6, giant ? '#ef7a4a' : '#ffc24a'); sg.addColorStop(1, giant ? '#c8402a' : '#f2a03d');
        P.glow(c, cx, cy, r * 1.35, giant ? 'rgba(239,90,60,.35)' : 'rgba(255,200,90,.35)');
        c.fillStyle = sg; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill();
        if (phase !== 'main') { P.glow(c, cx, cy, R0 * 0.28, 'rgba(160,210,255,.95)'); P.txt(c, phase === 'giant' ? '헬륨 핵융합' : '중심 수축 → 뜨거워짐', cx, cy + 6, '#0b1026', '800 18px'); }
        const arrow = (x0, y0, x1, y1, col) => { const a = Math.atan2(y1 - y0, x1 - x0); c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 6; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1 - Math.cos(a) * 12, y1 - Math.sin(a) * 12); c.stroke(); c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - Math.cos(a - 0.45) * 20, y1 - Math.sin(a - 0.45) * 20); c.lineTo(x1 - Math.cos(a + 0.45) * 20, y1 - Math.sin(a + 0.45) * 20); c.closePath(); c.fill(); };
        const gl = Math.min(110, 55 * g * (giant ? 2 : 1)), pl = Math.min(110, 55 * pr * (giant ? 2 : 1));
        for (let i = 0; i < 8; i++) {
          const a = i * Math.PI / 4 + Math.PI / 8;
          arrow(cx + Math.cos(a) * (r + 14 + gl), cy + Math.sin(a) * (r + 14 + gl), cx + Math.cos(a) * (r + 10), cy + Math.sin(a) * (r + 10), '#7fd1ff');
          const b = a + Math.PI / 8; arrow(cx + Math.cos(b) * (r - pl - 6), cy + Math.sin(b) * (r - pl - 6), cx + Math.cos(b) * (r - 4), cy + Math.sin(b) * (r - 4), '#ff6f5c');
        }
        if (hold) { c.setLineDash([6, 6]); c.strokeStyle = '#ffd84d'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, R0, 0, Math.PI * 2); c.stroke(); c.setLineDash([]); }
        P.txt(c, '→ 중력(안쪽)', W - 20, H - 52, '#7fd1ff', '800 22px', 'right'); P.txt(c, '→ 내부 압력에 의한 힘(바깥쪽)', W - 20, H - 20, '#ff8a7a', '800 22px', 'right');
        // 중심 수소 막대
        const bx = 20, by = H - 40, bw = 220;
        c.fillStyle = '#16203f'; c.fillRect(bx, by, bw, 18); c.fillStyle = '#f6c445'; c.fillRect(bx, by, bw * fuel, 18); P.txt(c, `중심의 수소 ${Math.round(fuel * 100)} %`, bx, by - 8, '#fbfcf9', '700 19px', 'left');
        say(hold ? (R < 0.95 ? '눌렀다: 중력 &lt; 내부 압력 → 놓으면 <b>되밀려 커진다</b>' : R > 1.05 ? '늘렸다: 중력 &gt; 내부 압력 → 놓으면 <b>당겨져 작아진다</b>' : '두 힘이 같다')
          : phase === 'main' ? '수소 핵융합 중 — 중력 = 내부 압력 → <b>크기 일정</b>(주계열성)'
          : phase === 'collapse' ? '수소가 바닥나 핵융합이 멈춤 → 내부 압력 &lt; 중력 → <b>중심 수축</b>, 온도 상승' : '중심 1억 K → 헬륨 핵융합, 바깥은 <b>팽창</b>해 붉은 <b>적색 거성</b>');
        steps();
      },
      down(p) { const cx = S.W / 2, cy = S.H * 0.52; hold = Math.hypot(p.x - cx, p.y - cy); },
      move(p, e, held) { if (!held || hold == null) return; const R0 = Math.min(S.W, S.H) * 0.17, cx = S.W / 2, cy = S.H * 0.52; R = Math.max(0.45, Math.min(1.8, Math.hypot(p.x - cx, p.y - cy) / R0)); v = 0; if (R < 0.85) did.sq = true; if (R > 1.2) did.st = true; },
      up() { hold = null; },
      key(e) { if (e.key === 'ArrowDown') { R = 0.7; did.sq = true; v = 0; return true; } if (e.key === 'ArrowUp') { R = 1.4; did.st = true; v = 0; return true; } return false; },
    });
    root.querySelector('.ba-reset').addEventListener('click', () => { R = 1; v = 0; fuel = 1; phase = 'main'; did = { sq: false, st: false }; S.kick(); });
    root._ba = { squeeze: (k) => { R = k; v = 0; if (k < 0.85) did.sq = true; if (k > 1.2) did.st = true; S.kick(); }, drain: () => { did.sq = did.st = true; fuel = 0; } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Balance = { mount };
})();
