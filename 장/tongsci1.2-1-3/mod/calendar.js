/* 2-1 3차시 표지 «원소 달력»(교과서 60쪽 도입). 리튬(3)부터 칼슘(20)까지 원소 카드가 한 줄로 길게 놓여 있다(색 = 성질이 비슷한 무리).
   오른쪽 끝 손잡이를 끌어 «한 줄에 몇 칸»을 바꾸면 카드가 달력처럼 접히며 움직인다. 8칸에서 같은 색이 세로로 나란히 → 번쩍.
   Calendar.mount(root) → { fit, setActive } · 시험용: root._ca.cols(n) */
(function () {
  'use strict';
  const FAM = { 3: 'a', 11: 'a', 19: 'a', 4: 'b', 12: 'b', 20: 'b', 9: 'h', 17: 'h', 10: 'g', 18: 'g' };
  const COL = { a: '#ef5b4c', b: '#f2a03d', h: '#5cc77a', g: '#5aa9f0', o: '#c9ced6' };
  function mount(root) {
    const stage = root.querySelector('.ca-stage'), now = root.querySelector('.ca-now');
    const P = window.Play, E = () => window.Elem;
    const cards = []; for (let z = 3; z <= 20; z++) cards.push({ z, x: 0, y: 0 });
    let n = 12, grab = false, hit8 = false, glow = 0;
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        c.fillStyle = '#fbfaf5'; c.fillRect(0, 0, W, H);
        const cw = Math.min(46, (W - 60) / 12 - 4), ch = cw * 1.25, x0 = 20, y0 = 74;
        cards.forEach((k, i) => {
          const tx = x0 + (i % n) * (cw + 4), ty = y0 + Math.floor(i / n) * (ch + 6);
          k.x += (tx - k.x) * Math.min(1, dt * 10 || 1); k.y += (ty - k.y) * Math.min(1, dt * 10 || 1);
          const e = E().get(k.z), f = FAM[k.z] || 'o';
          c.fillStyle = COL[f]; c.strokeStyle = '#1d2433'; c.lineWidth = 2;
          c.beginPath(); c.roundRect(k.x, k.y, cw, ch, 6); c.fill(); c.stroke();
          P.txt(c, String(k.z), k.x + cw / 2, k.y + 15, '#1d2433', '600 12px');
          P.txt(c, e.s, k.x + cw / 2, k.y + ch * 0.7, '#1d2433', `800 ${Math.round(cw * 0.42)}px`);
        });
        // 손잡이: 첫 줄 끝 오른쪽
        const hx = x0 + n * (cw + 4) + 4, hy = y0 + ch / 2;
        c.fillStyle = '#ffd84d'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.roundRect(hx, y0 - 6, 18, ch + 12, 6); c.fill(); c.stroke();
        P.txt(c, '↔', hx + 9, hy + 6, '#1d2433', '800 16px');
        P.txt(c, `한 줄에 ${n}칸`, W - 14, H - 14, '#4a5468', '800 18px', 'right');
        if (n === 8 && !hit8) { hit8 = true; glow = 1; window.RxT.jolt(stage, 1); }
        if (n === 8) { for (let col = 0; col < 8; col++) { const f = FAM[3 + col]; if (!f) continue; c.strokeStyle = COL[f]; c.lineWidth = 4; c.setLineDash([6, 4]); c.strokeRect(x0 + col * (cw + 4) - 3, y0 - 4, cw + 6, (ch + 6) * 3 + 2); c.setLineDash([]); } }
        if (glow > 0) { c.fillStyle = `rgba(255,216,77,${glow * 0.35})`; c.fillRect(0, 0, W, H); glow = Math.max(0, glow - dt * 1.5); }
        const nt = n === 8 ? '8칸에서 같은 색이 세로로 나란히!' : '노란 손잡이를 끌어 줄을 접어 보자';
        if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', n === 8); }
      },
      down(p) { grab = true; this.move(p, null, true); },
      move(p, e, held) { if (!held || !grab) return; const cw = Math.min(46, (S.W - 60) / 12 - 4); n = Math.max(3, Math.min(12, Math.round((p.x - 20) / (cw + 4)))); },
      up() { grab = false; },
      key(e) { if (e.key === 'ArrowLeft') { n = Math.max(3, n - 1); return true; } if (e.key === 'ArrowRight') { n = Math.min(12, n + 1); return true; } return false; },
    });
    root._ca = { cols: (k) => { n = k; S.kick(); } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Calendar = { mount };
})();
