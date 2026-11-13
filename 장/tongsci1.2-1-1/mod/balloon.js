/* 2-1-1 2차시 표지 «팽창하는 우주»: 화면을 좌우로 끌면(화살표 키) 우주가 커지고 작아진다. 은하 배치·거리 값은 이해를 돕기 위한 예.
   Balloon.mount(root) → { fit, setActive } · 시험용: root._bl.set(크기 0.08~1.6) */
(function () {
  'use strict';
  function mount(root) {
    const stage = root.querySelector('.au-stage'), out = root.querySelector('.au-out'), now = root.querySelector('.au-now');
    const P = window.Play, G = Array.from({ length: 16 }, (_, i) => ({ a: i * 2.4, d: 0.3 + ((i * 37) % 70) / 100 }));
    let s = 1, s0 = 1, x0 = 0, t = 0, moved = false;
    function set(v) {
      s = Math.max(0.08, Math.min(1.6, v));
      out.innerHTML = s < 0.15 ? '모든 은하가 <b>한 점</b> 가까이 모였다 — 아주 작고 뜨겁다' : `두 은하 사이 거리 <b>${(s * 10).toFixed(1)}</b> · ${s > s0 || !moved ? '커질수록 서로 멀어진다' : '거꾸로 돌리면 서로 가까워진다'}`;
      now.textContent = moved ? (s < 0.15 ? '여기서 시작했다면?' : '왼쪽 끝까지 끌어 보자') : '좌우로 끌어 우주를 키우고 줄이자';
      now.classList.toggle('done', s < 0.15);
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; c.fillStyle = '#0b0e18'; c.fillRect(0, 0, W, H);
        const cx = W / 2, cy = H / 2, k = Math.min(W, H) * 0.3 * s;
        if (s < 0.3) P.glow(c, cx, cy, 160 * (0.3 - s) / 0.22 + 20, 'rgba(255,216,77,.9)');
        c.strokeStyle = 'rgba(185,194,216,.35)'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, k * 1.08 + 4, 0, Math.PI * 2); c.stroke();
        const xy = (g) => [cx + Math.cos(g.a) * g.d * k, cy + Math.sin(g.a) * g.d * k];
        const [ax, ay] = xy(G[0]), [bx, by] = xy(G[5]);
        c.strokeStyle = '#ffd84d'; c.setLineDash([6, 6]); c.beginPath(); c.moveTo(ax, ay); c.lineTo(bx, by); c.stroke(); c.setLineDash([]);
        G.forEach((g, i) => { const [x, y] = xy(g); P.glow(c, x, y, 9 + 3 * Math.sin(t * 2 + i), i === 0 || i === 5 ? 'rgba(255,216,77,1)' : 'rgba(200,215,255,.95)'); });
      },
      down(p) { x0 = p.x; s0 = s; },
      move(p, e, held) { if (held) { moved = true; set(s0 + (p.x - x0) / S.W * 2); } },
      key(e) { const d = { ArrowLeft: -0.1, ArrowRight: 0.1 }[e.key]; if (!d) return false; moved = true; s0 = s; set(s + d); return true; },
    });
    set(1);
    root._bl = { set: (v) => { moved = true; s0 = s; set(v); S.redraw(); } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Balloon = { mount };
})();
