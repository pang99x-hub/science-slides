/* 2-1 1차시 이론 «빅뱅 우주론»(교과서 51쪽 + 허블 법칙은 다른 교과서 내용). 은하들이 서로 멀어지며 우주가 계속 팽창한다(저절로 흐름).
   화면을 왼쪽으로 끌면 시간이 거꾸로 — 은하들이 모여들고 뜨거워지다 «한 점»에서 번쩍(빅뱅). 오른쪽으로 끌면 다시 팽창.
   지금 쪽에서는 멀리 있는 은하일수록 긴 화살표(빨리 멀어짐)와 오른쪽 아래 허블 법칙 그래프. 왼쪽 상자(.lv-row[data-k=hubble|gamow|bb])가 밝아진다.
   팽창 빠르기는 일정하다고 단순화(이해를 돕기 위한 예). BigBang.mount(root) → { fit, setActive } · 시험용: root._bb.set(억 년) */
(function () {
  'use strict';
  const NOW = 138;
  function mount(root) {
    const stage = root.querySelector('.bb-stage'), out = root.querySelector('.bb-out'), rows = [...root.querySelectorAll('.lv-row')], now = root.querySelector('.bb-now');
    const P = window.Play;
    const GX = []; for (let i = 0; i < 40; i++) { const a = i * 2.39996, d = 0.12 + ((i * 0.618) % 1) * 0.88; GX.push([Math.cos(a) * d, Math.sin(a) * d * 0.62, i % 3]); }
    let t = 60, drag = null, sawPast = false, sawZero = false, flash = 0, msg = '';
    function say(h) { if (h !== msg) { msg = h; out.innerHTML = h; } }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        if (!drag && t < NOW) t = Math.min(NOW, t + dt * 8);
        if (t < 30) sawPast = true;
        const a = Math.max(0.002, t / NOW), cx = W / 2, cy = H * 0.46, SC = Math.min(W, H * 1.6) * 0.5;
        c.fillStyle = t < 12 ? `rgb(${40 + (12 - t) * 12},${24},${48})` : '#0f1630'; c.fillRect(0, 0, W, H);
        if (t < 14) P.glow(c, cx, cy, 30 + (14 - t) * 18, `rgba(255,${200 - (14 - t) * 6},120,${Math.min(1, (14 - t) / 10)})`);
        GX.forEach(([x, y, k]) => {
          const px = cx + x * SC * a, py = cy + y * SC * a, s = 0.4 + 0.6 * a;
          if (t > 4) { c.save(); c.translate(px, py); c.rotate(k); c.fillStyle = k ? '#cdd8ff' : '#ffe6a8'; c.beginPath(); c.ellipse(0, 0, 11 * s, 4.5 * s, 0, 0, Math.PI * 2); c.fill(); c.fillStyle = '#fff'; c.beginPath(); c.arc(0, 0, 2.5 * s, 0, Math.PI * 2); c.fill(); c.restore(); }
          if (t > 110) { const k2 = 0.25; c.strokeStyle = 'rgba(127,209,255,.8)'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(px, py); c.lineTo(px + x * SC * a * k2, py + y * SC * a * k2); c.stroke(); }
        });
        // 두 은하 자
        const A = GX[3], B = GX[17], ax = cx + A[0] * SC * a, ay = cy + A[1] * SC * a, bx = cx + B[0] * SC * a, by = cy + B[1] * SC * a;
        if (t > 4) { c.setLineDash([8, 6]); c.strokeStyle = '#ffd84d'; c.lineWidth = 3; c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke(); c.setLineDash([]); [[ax, ay], [bx, by]].forEach(([x, y]) => { c.strokeStyle = '#ffd84d'; c.beginPath(); c.arc(x, y, 13, 0, Math.PI * 2); c.stroke(); }); if (a > 0.5) P.txt(c, `거리 = 지금의 ${Math.round(a * 100)}%`, (ax + bx) / 2, (ay + by) / 2 - 16, '#ffd84d', '700 20px'); }
        if (t <= 0.5) { if (!sawZero) { sawZero = true; flash = 1; window.RxT.jolt(stage, 3); } P.txt(c, '한 점 → 대폭발(빅뱅)', cx, 60, '#ffd84d', '800 30px'); }
        if (t > 110) {   // 허블 법칙
          const x0 = W - 270, y0 = H - 190; c.fillStyle = 'rgba(251,252,249,.94)'; c.fillRect(x0, y0, 256, 170); c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.strokeRect(x0, y0, 256, 170);
          c.beginPath(); c.moveTo(x0 + 40, y0 + 137); c.lineTo(x0 + 240, y0 + 137); c.moveTo(x0 + 40, y0 + 137); c.lineTo(x0 + 40, y0 + 17); c.stroke();
          c.setLineDash([7, 5]); c.strokeStyle = '#2a73b8'; c.lineWidth = 3; c.beginPath(); c.moveTo(x0 + 40, y0 + 137); c.lineTo(x0 + 230, y0 + 27); c.stroke(); c.setLineDash([]);
          GX.forEach(([x, y], i) => { if (i % 3) return; const d = Math.hypot(x, y / 0.62); c.fillStyle = '#d9483b'; c.beginPath(); c.arc(x0 + 40 + d * 190, y0 + 137 - d * 110 + ((i * 13) % 9 - 4), 5, 0, Math.PI * 2); c.fill(); });
          P.txt(c, '허블 법칙', x0 + 50, y0 + 22, '#1d2433', '800 18px', 'left'); P.txt(c, '은하까지 거리 →', x0 + 140, y0 + 160, '#4a5468', '700 15px');
        }
        if (flash > 0) { c.fillStyle = `rgba(255,250,220,${flash})`; c.fillRect(0, 0, W, H); flash = Math.max(0, flash - dt * 1.5); }
        // 시간 손잡이
        const ty = H - 26, x0 = 30, x1 = W - 300; c.fillStyle = '#2a3150'; c.fillRect(x0, ty - 4, x1 - x0, 8);
        const hx = x0 + (x1 - x0) * t / NOW; c.fillStyle = '#ffd84d'; c.beginPath(); c.arc(hx, ty, 12, 0, Math.PI * 2); c.fill();
        P.txt(c, '빅뱅', x0, ty - 14, '#b9c2d8', '700 16px', 'left'); P.txt(c, '지금', x1, ty - 14, '#b9c2d8', '700 16px', 'right');
        const k = t > 110 ? 'hubble' : t < 12 ? 'bb' : 'gamow';
        rows.forEach((r) => r.classList.toggle('on', r.dataset.k === k));
        say(t >= NOW - 0.5 ? '<b>지금</b> · 멀리 있는 은하일수록 빨리 멀어진다 — 우주가 팽창하고 있다(허블, 1929년)' : t <= 0.5 ? '<b>약 138억 년 전</b> · 모든 물질과 에너지가 한 점에 → 대폭발로 시작' : `<b>빅뱅 후 약 ${Math.round(t)}억 년</b> · 우주의 크기 지금의 약 ${Math.round(a * 100)}% <small>과거로 갈수록 작고 뜨겁다</small>`);
        const nt = !sawPast ? '화면을 왼쪽으로 끌어 시간을 되감자' : !sawZero ? '끝까지 — 빅뱅까지 되감자' : '손을 떼면 우주가 다시 팽창한다';
        if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', sawZero); }
      },
      down(p) { drag = { x: p.x, t0: t }; },
      move(p, e, held) { if (held && drag) t = Math.max(0, Math.min(NOW, drag.t0 + (p.x - drag.x) / (S.W * 0.6) * NOW)); },
      up() { drag = null; },
      key(e) { if (e.key === 'ArrowLeft') { t = Math.max(0, t - 15); return true; } if (e.key === 'ArrowRight') { t = Math.min(NOW, t + 15); return true; } return false; },
    });
    root._bb = { set: (v) => { t = v; drag = { x: 0, t0: v }; S.redraw(); drag = null; } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.BigBang = { mount };
})();
