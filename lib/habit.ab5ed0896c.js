/* 3-1 1차시 표지 «물이 머무는 거리»(교과서 104~105쪽: 생명체가 살려면 꾸준히 에너지를 주는 별과 액체 상태의 물이 있어야 한다).
   왼쪽에 빛나는 태양, 오른쪽으로 궤도 띠. 행성 하나를 끌어 태양에서 가깝게·멀게 옮기면 표면이 바뀐다:
   가까우면 물이 끓어 두꺼운 수증기 구름(금성 쪽), 알맞으면 파란 바다·흰 구름·초록 땅(지구), 멀면 얼음(화성 너머).
   생명 가능 지대(초록 띠, 참고서·다른 교과서 내용)에 들어오면 띠가 빛난다. 금성·지구·화성 위치 눈금. 키보드 좌우.
   Habit.mount(root) → { fit, setActive } · 시험용: root._hb.at(0~1) */
(function () {
  'use strict';
  const ZONE = [0.4, 0.58], MARK = [['금성', 0.3], ['지구', 0.48], ['화성', 0.68]];
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  function mount(root) {
    const stage = root.querySelector('.hb-stage'), now = root.querySelector('.hb-now');
    const P = window.Play;
    let pos = 0.16, drag = false, t = 0, moved = false, sky = null, skyW = 0;
    const X = (W, k) => W * (0.2 + k * 0.72);
    // 별 바탕은 크기가 바뀔 때만 다시 그린다
    function backdrop(W, H) {
      if (sky && skyW === W) return sky;
      sky = document.createElement('canvas'); sky.width = W; sky.height = H; skyW = W; const c = sky.getContext('2d');
      const g = c.createLinearGradient(0, 0, W, H); g.addColorStop(0, '#0b1230'); g.addColorStop(1, '#05070f'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      let s = 9; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
      for (let i = 0; i < 140; i++) { c.fillStyle = `rgba(255,255,255,${0.2 + rnd() * 0.7})`; c.beginPath(); c.arc(rnd() * W, rnd() * H, rnd() * 1.4, 0, Math.PI * 2); c.fill(); }
      return sky;
    }
    const weights = (k) => { const hot = clamp((ZONE[0] + 0.03 - k) / 0.08, 0, 1), cold = clamp((k - ZONE[1] + 0.03) / 0.08, 0, 1); return { hot, cold, earth: Math.max(0, 1 - hot - cold) }; };
    function planet(c, x, y, r, k) {
      const w = weights(k);
      c.save(); c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.clip();
      // 지구: 바다 + 돌아가는 대륙 + 구름
      if (w.earth > 0) {
        c.globalAlpha = w.earth; const o = c.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r); o.addColorStop(0, '#5fb8ff'); o.addColorStop(1, '#0b3f8a'); c.fillStyle = o; c.fillRect(x - r, y - r, r * 2, r * 2);
        const sh = (t * 10) % (r * 4);
        [[-0.6, -0.2, 0.45, 0.3], [0.3, 0.25, 0.5, 0.28], [-0.1, -0.55, 0.3, 0.16], [1.2, -0.1, 0.4, 0.3]].forEach(([u, v, a, b]) => {
          for (const d of [0, -r * 4]) { c.fillStyle = '#4f9b45'; c.beginPath(); c.ellipse(x + u * r + sh + d - r, y + v * r, a * r, b * r, 0.4, 0, Math.PI * 2); c.fill(); c.fillStyle = 'rgba(176,140,82,.7)'; c.beginPath(); c.ellipse(x + u * r + sh + d - r + a * r * 0.3, y + v * r, a * r * 0.35, b * r * 0.4, 0.4, 0, Math.PI * 2); c.fill(); }
        });
        c.fillStyle = 'rgba(255,255,255,.75)'; [[-0.2, -0.35, 0.5], [0.4, 0.5, 0.4], [-0.6, 0.35, 0.3]].forEach(([u, v, a]) => { c.beginPath(); c.ellipse(x + u * r + Math.sin(t * 0.6 + u) * 6, y + v * r, a * r, a * r * 0.18, -0.2, 0, Math.PI * 2); c.fill(); });
      }
      // 뜨거움: 노란 수증기·구름이 소용돌이
      if (w.hot > 0) {
        c.globalAlpha = w.hot; const o = c.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r); o.addColorStop(0, '#fff1c4'); o.addColorStop(1, '#c9822f'); c.fillStyle = o; c.fillRect(x - r, y - r, r * 2, r * 2);
        for (let i = 0; i < 6; i++) { c.strokeStyle = `rgba(255,236,190,${0.35 + 0.1 * Math.sin(t + i)})`; c.lineWidth = r * 0.12; c.beginPath(); c.ellipse(x + Math.sin(t * 0.5 + i) * r * 0.2, y + (i - 2.5) * r * 0.3, r * 0.95, r * 0.08, 0.1, 0, Math.PI * 2); c.stroke(); }
      }
      // 차가움: 얼음 껍질과 금
      if (w.cold > 0) {
        c.globalAlpha = w.cold; const o = c.createRadialGradient(x - r * 0.4, y - r * 0.4, r * 0.1, x, y, r); o.addColorStop(0, '#ffffff'); o.addColorStop(1, '#8fb3cf'); c.fillStyle = o; c.fillRect(x - r, y - r, r * 2, r * 2);
        c.strokeStyle = 'rgba(70,110,150,.55)'; c.lineWidth = 1.5; [[-0.7, -0.2, 0.6, 0.3], [-0.2, -0.8, 0.1, 0.7], [0.1, 0.1, 0.8, -0.3]].forEach(([a, b, d, e]) => { c.beginPath(); c.moveTo(x + a * r, y + b * r); c.lineTo(x + (a + d) * r * 0.5, y + (b + e) * r * 0.6); c.lineTo(x + d * r, y + e * r); c.stroke(); });
      }
      // 낮과 밤: 태양 반대쪽 그늘
      c.globalAlpha = 1; const sh = c.createLinearGradient(x - r, y, x + r, y); sh.addColorStop(0, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,10,.55)'); c.fillStyle = sh; c.fillRect(x - r, y - r, r * 2, r * 2);
      c.restore();
      // 대기 테두리(지구일 때 파랗게, 뜨거울 때 누렇게)
      c.strokeStyle = w.hot > 0.5 ? 'rgba(255,214,140,.7)' : w.cold > 0.5 ? 'rgba(220,235,255,.4)' : 'rgba(140,200,255,.8)'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, r + 2, 0, Math.PI * 2); c.stroke();
      // 뜨거울 때 솟는 김
      if (w.hot > 0.4) for (let i = 0; i < 5; i++) { const ph = (t * 0.5 + i / 5) % 1; c.fillStyle = `rgba(255,240,210,${(1 - ph) * 0.4 * w.hot})`; c.beginPath(); c.arc(x + (i - 2) * r * 0.35, y - r - ph * r * 0.9, r * (0.12 + ph * 0.2), 0, Math.PI * 2); c.fill(); }
    }
    function state(k) { const w = weights(k); return w.hot > 0.5 ? 'hot' : w.cold > 0.5 ? 'cold' : 'earth'; }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; c.drawImage(backdrop(W, H), 0, 0);
        const cy = H * 0.5, r = Math.min(W, H) * 0.12;
        // 태양: 코로나 + 표면
        P.glow(c, -W * 0.02, cy, H * 0.75, 'rgba(255,190,80,.55)'); P.glow(c, -W * 0.02, cy, H * 0.42, 'rgba(255,230,140,.9)');
        const sg = c.createRadialGradient(-W * 0.05, cy - H * 0.05, 4, -W * 0.02, cy, H * 0.3); sg.addColorStop(0, '#fffbe6'); sg.addColorStop(0.6, '#ffcb47'); sg.addColorStop(1, '#f08a1c'); c.fillStyle = sg; c.beginPath(); c.arc(-W * 0.02, cy, H * 0.3, 0, Math.PI * 2); c.fill();
        P.txt(c, '태양', W * 0.06, cy + H * 0.38, '#ffe39a', '800 17px');
        // 궤도 띠와 생명 가능 지대
        c.strokeStyle = 'rgba(200,212,240,.25)'; c.setLineDash([4, 6]); c.lineWidth = 1.5; c.beginPath(); c.moveTo(X(W, 0), cy); c.lineTo(X(W, 1), cy); c.stroke(); c.setLineDash([]);
        const inZone = pos >= ZONE[0] && pos <= ZONE[1], za = inZone ? 0.32 + 0.1 * Math.sin(t * 4) : 0.14;
        const zx0 = X(W, ZONE[0]), zx1 = X(W, ZONE[1]); const zg = c.createLinearGradient(zx0, 0, zx1, 0); zg.addColorStop(0, `rgba(92,199,122,0)`); zg.addColorStop(0.5, `rgba(92,199,122,${za})`); zg.addColorStop(1, `rgba(92,199,122,0)`);
        c.fillStyle = zg; c.fillRect(zx0, H * 0.12, zx1 - zx0, H * 0.76); P.txt(c, '생명 가능 지대', (zx0 + zx1) / 2, H * 0.1, inZone ? '#9ff0b4' : 'rgba(159,240,180,.6)', '800 15px');
        MARK.forEach(([n, k]) => { const x = X(W, k); c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(x - 1, cy + r + 10, 2, 12); P.txt(c, n, x, cy + r + 40, '#c8d4f0', '700 15px'); });
        // 행성
        const px = X(W, pos); planet(c, px, cy, r, pos);
        if (!moved) { const a = 0.5 + 0.5 * Math.sin(t * 3); c.strokeStyle = `rgba(255,216,77,${a})`; c.lineWidth = 3; c.beginPath(); c.arc(px, cy, r + 10, 0, Math.PI * 2); c.stroke(); P.txt(c, '← 끌기 →', px, cy - r - 16, '#ffd84d', '800 15px'); }
        const st = state(pos), lab = st === 'hot' ? '물이 끓어 수증기로' : st === 'cold' ? '물이 꽁꽁 언 얼음' : '바다에 액체 물';
        P.txt(c, lab, px, cy + r + 66, st === 'earth' ? '#9ff0b4' : st === 'hot' ? '#ffd28a' : '#cfe6ff', '800 16px');
        const nt = !moved ? '행성을 끌어 태양에서 멀어지게 해 보자' : st === 'hot' ? '너무 가깝다 — 물이 끓어 버린다' : st === 'cold' ? '너무 멀다 — 물이 얼어 버린다' : '알맞은 거리 — 액체 물이 머문다!';
        if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', moved && st === 'earth'); }
      },
      down(p) { const cy = S.H * 0.5, r = Math.min(S.W, S.H) * 0.12; if (Math.hypot(p.x - X(S.W, pos), p.y - cy) < r * 1.6) drag = true; },
      move(p, e, held) { if (held && drag) { pos = clamp((p.x - S.W * 0.2) / (S.W * 0.72), 0, 1); moved = true; } },
      up() { drag = false; },
      key(e) { const d = { ArrowLeft: -0.04, ArrowRight: 0.04 }[e.key]; if (!d) return false; pos = clamp(pos + d, 0, 1); moved = true; return true; },
    });
    root._hb = { at: (k) => { pos = clamp(k, 0, 1); moved = true; S.kick(); return state(pos); } };
    console.assert(state(0.1) === 'hot' && state(0.48) === 'earth' && state(0.9) === 'cold', 'habit: 거리별 상태');
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Habit = { mount };
})();
