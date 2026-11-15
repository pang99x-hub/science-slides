/* 2-1-1 3차시 표지 «사라지지 않는 잡음»(1964년 펜지어스·윌슨의 안테나, 다른 교과서 내용). 화면을 좌우로 끌면(화살표 키) 안테나가 돈다.
   어느 방향이든 잡음 세기가 같다. 잡음 세기 눈금은 이해를 돕기 위한 예. Horn.mount(root) → { fit, setActive } · 시험용: root._hn.turn(도) */
(function () {
  'use strict';
  function mount(root) {
    const stage = root.querySelector('.au-stage'), out = root.querySelector('.au-out'), now = root.querySelector('.au-now');
    const P = window.Play, STARS = Array.from({ length: 40 }, (_, i) => [((i * 61) % 100) / 100, ((i * 37) % 55) / 100, 1 + (i % 3)]);
    let a = 0, a0 = 0, x0 = 0, lo = 0, hi = 0, t = 0;
    function turn(v) {
      a = Math.max(-80, Math.min(80, v)); lo = Math.min(lo, a); hi = Math.max(hi, a);
      const swept = hi - lo >= 100;
      out.innerHTML = `안테나 방향 <b>${a > 0 ? '동쪽 ' : a < 0 ? '서쪽 ' : ''}${Math.abs(Math.round(a))}°</b> · 잡음 세기 <b>3</b> — ${swept ? '어디로 돌려도 <b>똑같다</b>' : '다른 쪽 하늘은?'}`;
      now.textContent = swept ? '사방에서 같은 세기로 온다' : '좌우로 끌어 안테나를 하늘 이쪽저쪽으로';
      now.classList.toggle('done', swept);
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; c.fillStyle = '#0b0e18'; c.fillRect(0, 0, W, H);
        STARS.forEach(([x, y, r]) => { c.fillStyle = 'rgba(230,236,255,.8)'; c.fillRect(x * W, y * H, r, r); });
        const bx = W * 0.36, by = H - 30, r = a * Math.PI / 180;
        c.fillStyle = '#1b2236'; c.fillRect(0, H - 30, W, 30);
        c.save(); c.translate(bx, by); c.rotate(r);
        P.glow(c, 0, -H * 0.55, 90, 'rgba(255,216,77,.16)');
        c.fillStyle = '#cfd6e6'; c.beginPath(); c.moveTo(-14, 0); c.lineTo(14, 0); c.lineTo(46, -120); c.lineTo(-46, -120); c.closePath(); c.fill();
        c.restore();
        // 오른쪽: 수신기 화면(잡음 물결 — 방향과 상관없이 같은 크기)
        const mx = W * 0.64, mw = W * 0.32, my = H * 0.3, mh = H * 0.34;
        c.fillStyle = '#16203f'; c.strokeStyle = '#cfd6e6'; c.lineWidth = 2; c.fillRect(mx, my, mw, mh); c.strokeRect(mx, my, mw, mh);
        c.strokeStyle = '#ffd84d'; c.beginPath();
        for (let i = 0; i <= 60; i++) { const y = my + mh / 2 + Math.sin(i * 1.7 + t * 9) * Math.sin(i * 0.9 + t * 5) * mh * 0.22; if (i) c.lineTo(mx + mw * i / 60, y); else c.moveTo(mx, y); }
        c.stroke();
        P.txt(c, '수신기 · 잡음 세기 3', mx + mw / 2, my - 12, '#fbfcf9', '700 20px');
      },
      down(p) { x0 = p.x; a0 = a; },
      move(p, e, held) { if (held) turn(a0 + (p.x - x0) / S.W * 200); },
      key(e) { const d = { ArrowLeft: -10, ArrowRight: 10 }[e.key]; if (!d) return false; turn(a + d); return true; },
    });
    turn(0);
    root._hn = { turn: (v) => { turn(v); S.redraw(); } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Horn = { mount };
})();
