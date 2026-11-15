/* 2-1-1 3차시 이론 장 오른쪽 «늘어나는 빛»: 화면을 좌우로 끌면(화살표 키) 우주가 팽창하고, 그 안의 빛 물결이 같이 늘어난다.
   38만 년 약 3000 K → 지금 약 3 K. 크기 «약 1000배»와 중간 온도는 이해를 돕기 위한 예. Stretch.mount(root) → { fit, setActive } · 시험용: root._st.set(0~1) */
(function () {
  'use strict';
  function mount(root) {
    const stage = root.querySelector('.stage'), out = root.querySelector('.bb-out'), now = root.querySelector('.now-chip');
    const P = window.Play;
    let v = 0, v0 = 0, x0 = 0, t = 0, moved = false, end = false;
    function set(n) {
      v = Math.max(0, Math.min(1, n)); if (v >= 0.98) end = true;
      const k = Math.pow(1000, v), K = 3000 / k;
      out.innerHTML = `우주 크기 <b>${k < 10 ? k.toFixed(1) : Math.round(k)}배</b> · 빛의 파장도 그만큼 길어짐 · 온도 약 <b>${K >= 10 ? Math.round(K / 10) * 10 : K.toFixed(0)} K</b><small>${v >= 0.98 ? '지금: 약 3 K의 전파(마이크로파)로 사방에서 관측된다 = 우주 배경 복사' : v <= 0.02 ? '빅뱅 후 약 38만 년: 약 3000 K, 빛이 처음 곧게 퍼졌다' : '팽창하는 동안 빛은 점점 늘어나고 우주는 식는다'}</small>`;
      now.textContent = end ? '3000 K의 빛 → 3 K의 전파' : moved ? '오른쪽 끝(지금)까지 끌자' : '오른쪽으로 끌어 우주를 팽창시키자';
      now.classList.toggle('done', end);
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; c.fillStyle = '#0b0e18'; c.fillRect(0, 0, W, H);
        const w = W * (0.16 + 0.76 * v), x = (W - w) / 2, y = H * 0.2, h = H * 0.5;
        c.strokeStyle = 'rgba(185,194,216,.7)'; c.lineWidth = 2; c.strokeRect(x, y, w, h);
        const hue = 50 - 50 * Math.min(1, v * 2), light = 60 - 25 * Math.max(0, v * 2 - 1);
        c.strokeStyle = `hsl(${hue},${v > 0.5 ? 100 - (v - 0.5) * 160 : 100}%,${light}%)`; c.lineWidth = 4; c.beginPath();
        for (let i = 0; i <= 200; i++) { const px = x + w * i / 200, py = y + h / 2 + Math.sin(i / 200 * Math.PI * 12 - t * 4) * h * 0.3; if (i) c.lineTo(px, py); else c.moveTo(px, py); }
        c.stroke();
        P.txt(c, '← 물결 여섯 개 = 같은 빛 →', W / 2, y + h + 32, '#fbfcf9', '600 19px');
        const by = H - 28, b0 = W * 0.12, b1 = W * 0.88;
        c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(b0, by - 3, b1 - b0, 6); c.fillStyle = '#ffd84d'; c.beginPath(); c.arc(b0 + (b1 - b0) * v, by, 11, 0, Math.PI * 2); c.fill();
        P.txt(c, '38만 년', b0, by - 16, '#fbfcf9', '700 16px'); P.txt(c, '지금(138억 년)', b1 - 20, by - 16, '#fbfcf9', '700 16px');
      },
      down(p) { x0 = p.x; v0 = v; },
      move(p, e, held) { if (held) { moved = true; set(v0 + (p.x - x0) / (S.W * 0.76)); } },
      key(e) { const d = { ArrowLeft: -0.1, ArrowRight: 0.1 }[e.key]; if (!d) return false; moved = true; set(v + d); return true; },
    });
    set(0);
    root._st = { set: (n) => { moved = true; set(n); S.redraw(); } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Stretch = { mount };
})();
