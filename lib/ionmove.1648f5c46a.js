/* 2-1 4차시 체험 «왜 수용액에서만 전류가 흐를까?»(교과서 73쪽 그림 Ⅱ-25·26 + 녹인 액체는 다른 교과서·참고서 내용).
   비커 속 (−)극(왼쪽)·(+)극(오른쪽), 위에 전지·스위치·전구 회로. 위 카드로 염화 나트륨/설탕을 고른다.
   처음엔 고체(이온·분자가 제자리에서 떨기만). 물병을 끌어 비커에 놓으면 물이 차고 결정이 풀려 입자가 떠돈다.
   스위치 손잡이를 끌어 내려 닫으면 Na⁺은 (−)극, Cl⁻은 (+)극으로 끌려가고 전선에 전자가 돌며 전구가 켜진다.
   설탕은 녹아도 분자 그대로라 전구가 꺼진 채. 버너 불꽃을 꾹 누르고 있으면 고체가 녹아 액체가 되고, 염화 나트륨은 이때도 전류가 흐른다.
   IonMove.mount(root) → { fit, setActive } · 시험용: root._im.pick('nacl'|'sugar') · water() · close() · heat() */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  function mount(root) {
    const stage = root.querySelector('.im-stage'), now = root.querySelector('.im-now'), out = root.querySelector('.im-out');
    const P = window.Play;
    let kind = 'nacl', phase = 'solid', level = 0, heat = 0, sw = -0.7, t = 0, drag = null, flame = false, msg = '', parts = [], eph = 0;
    const did = new Set();
    const G = (W, H) => {
      const bw = W * 0.4, bh = H * 0.46, bx = W * 0.4, by = H * 0.9;
      return { bw, bh, bx, by, top: by - bh, eL: bx - bw * 0.36, eR: bx + bw * 0.36, wy: H * 0.13, bat: [bx - bw * 0.05, H * 0.13], bulb: [bx + bw * 0.28, H * 0.13], sw: [bx - bw * 0.36, H * 0.13], bottle: [W * 0.84, H * 0.5], burner: [bx, by + 2], cards: [[W * 0.84, H * 0.1], [W * 0.84, H * 0.22]] };
    };
    function build() {
      parts = [];
      if (kind === 'nacl') { for (let r = 0; r < 4; r++) for (let q = 0; q < 6; q++) parts.push({ hx: q - 2.5, hy: r, neg: (r + q) & 1, x: 0, y: 0, vx: 0, vy: 0, free: false }); }
      else { for (let r = 0; r < 3; r++) for (let q = 0; q < 4; q++) parts.push({ hx: (q - 1.5) * 1.4, hy: r * 1.2, mol: true, x: 0, y: 0, vx: 0, vy: 0, free: false }); }
    }
    const liquid = () => phase !== 'solid';
    const flows = () => kind === 'nacl' && liquid() && sw > -0.08;
    function say(h) { if (h !== msg) { msg = h; out.innerHTML = h; } }
    function pick(k) { kind = k; phase = 'solid'; level = 0; heat = 0; build(); say(k === 'nacl' ? '<b>고체 염화 나트륨</b> — 스위치를 닫아 보고, 물병을 끌어 부어 보자' : '<b>고체 설탕</b> — 물을 부어 녹이고 스위치를 닫아 보자'); }
    function water() {
      if (phase === 'melt') { say('녹인 액체에는 물을 붓지 않는다 — «처음부터»로 돌아가자'); return; }
      if (phase === 'water') return;
      phase = 'water'; level = Math.max(level, 0.01); parts.forEach((q) => { q.free = true; q.vx = (Math.random() - 0.5) * 60; q.vy = -Math.random() * 60; });
      say(kind === 'nacl' ? '물에 녹자 Na⁺과 Cl⁻이 <b>나뉘어</b> 자유롭게 떠다닌다 — 스위치를 닫아 보자' : '설탕이 녹아도 <b>분자 그대로</b> 떠다닌다 — 스위치를 닫아 보자');
      report();
    }
    function melt() {
      if (phase === 'water') { say('물이 있으면 끓기만 한다 — «처음부터»에서 고체로 해 보자'); return; }
      if (phase === 'melt') return;
      phase = 'melt'; heat = 1; parts.forEach((q) => { q.free = true; });
      say(kind === 'nacl' ? '고체가 녹아 <b>액체</b>가 됐다 — 이온이 움직일 수 있다! 스위치를 닫아 보자' : '설탕이 녹아 액체가 됐지만 <b>분자</b>뿐이다 — 스위치를 닫아 보자');
      report();
    }
    function setSw(a) { const was = sw > -0.08; sw = Math.max(-0.7, Math.min(0, a)); const on = sw > -0.08; if (on !== was) { if (on) sw = 0; report(); } }
    function report() {
      const on = sw > -0.08;
      if (!on) return;
      if (flows()) { window.RxT.jolt(stage, 1); if (phase === 'water') did.add('aq'); else did.add('melt'); say(`전구가 켜졌다! <b>Na⁺은 (−)극</b>, <b>Cl⁻은 (+)극</b>으로 끌려가며 전류가 흐른다${phase === 'melt' ? ' — 녹인 액체에서도' : ''}`); }
      else if (kind === 'sugar' && liquid()) { did.add('sugar'); say('전구가 꺼진 채 — 설탕 분자는 전하가 없어 어느 극으로도 <b>움직이지 않는다</b>'); }
      else if (!liquid()) say(`전구가 꺼진 채 — 고체에서는 ${kind === 'nacl' ? '이온이 서로 단단히 묶여 <b>움직일 수 없다</b>' : '분자가 빽빽이 모여 있을 뿐이다'}`);
    }
    function steps() {
      const ok = []; if (did.has('aq')) ok.push(1); if (did.has('sugar')) ok.push(2); if (did.has('melt')) ok.push(3);
      const s = [1, 2, 3].find((k) => !ok.includes(k)) || 0; window.L1.steps(root, s, ok); window.L1.done(root, s === 0);
      const nt = s === 1 ? '① 염화 나트륨에 물을 붓고 스위치를 닫자' : s === 2 ? '② «설탕»을 골라 같은 실험을 해 보자' : s === 3 ? '③ 염화 나트륨 고체를 불꽃으로 녹여 연결하자' : '움직이는 이온이 있어야 전류가 흐른다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', s === 0); }
    }
    function ion(c, x, y, neg) { c.fillStyle = neg ? '#5cc77a' : '#9b6ad6'; c.beginPath(); c.arc(x, y, neg ? 13 : 10, 0, TAU); c.fill(); P.txt(c, neg ? 'Cl⁻' : 'Na⁺', x, y + 4, '#fff', '800 11px'); }
    function mol(c, x, y) { c.fillStyle = '#d4d8de'; c.strokeStyle = '#6a7380'; c.lineWidth = 1.5; c.beginPath(); for (let k = 0; k < 6; k++) { const a = k / 6 * TAU; c.lineTo(x + Math.cos(a) * 14, y + Math.sin(a) * 11); } c.closePath(); c.fill(); c.stroke(); }
    function wirePath(g) { // (+)극 → 전구 → 전지 → 스위치 → (−)극 : 바깥 전선에서 전자가 가는 길
      const y = g.wy; return [[g.eR, g.top + 30], [g.eR, y], [g.bulb[0], y], [g.bat[0], y], [g.sw[0], y], [g.eL, y], [g.eL, g.top + 30]];
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const g = G(W, H), L = g.by - 8, Rr = g.bx + g.bw / 2 - 8, Lf = g.bx - g.bw / 2 + 8;
        c.fillStyle = '#f3efe4'; c.fillRect(0, 0, W, H);
        if (level > 0 && level < 1) level = Math.min(1, level + dt * 0.9);
        if (flame && phase === 'solid') { heat += dt / 2.5; if (heat >= 1) melt(); }
        const lit = flows();
        // 회로 전선
        const path = wirePath(g); c.strokeStyle = '#1d2433'; c.lineWidth = 3.5; c.beginPath(); path.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.stroke();
        // 스위치: 틈을 지우고 팔을 그린다
        const [sx, sy] = g.sw, gap = 46; c.fillStyle = '#f3efe4'; c.fillRect(sx + 4, sy - 5, gap, 10);
        c.fillStyle = '#1d2433'; c.beginPath(); c.arc(sx + 4, sy, 5, 0, TAU); c.arc(sx + 4 + gap, sy, 5, 0, TAU); c.fill();
        c.strokeStyle = sw > -0.08 ? '#2f9e5b' : '#c0392b'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx + 4, sy); c.lineTo(sx + 4 + Math.cos(sw) * gap, sy + Math.sin(sw) * gap); c.stroke(); c.lineCap = 'butt';
        c.fillStyle = '#ffd84d'; c.beginPath(); c.arc(sx + 4 + Math.cos(sw) * gap, sy + Math.sin(sw) * gap, 10, 0, TAU); c.fill(); c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.stroke();
        P.txt(c, sw > -0.08 ? '스위치 닫힘' : '스위치 — 손잡이를 끌어 내리기', sx + 28, sy + 34, '#1d2433', '700 15px');
        // 전지
        const [ax, ay] = g.bat; c.fillStyle = '#f3efe4'; c.fillRect(ax - 14, ay - 22, 28, 44); c.strokeStyle = '#1d2433'; c.lineWidth = 4; c.beginPath(); c.moveTo(ax - 8, ay - 22); c.lineTo(ax - 8, ay + 22); c.stroke(); c.lineWidth = 7; c.beginPath(); c.moveTo(ax + 8, ay - 12); c.lineTo(ax + 8, ay + 12); c.stroke();
        P.txt(c, '전지', ax, ay + 44, '#1d2433', '700 15px');
        // 전구
        const [ux, uy] = g.bulb; if (lit) P.glow(c, ux, uy, 80, 'rgba(255,236,140,.95)');
        c.fillStyle = lit ? '#fff3a0' : '#e8ecf1'; c.strokeStyle = '#1d2433'; c.lineWidth = 3; c.beginPath(); c.arc(ux, uy - 4, 20, 0, TAU); c.fill(); c.stroke();
        P.txt(c, lit ? '전류가 흐른다!' : '전구', ux, uy + 44, lit ? '#b8860b' : '#1d2433', '800 16px');
        // 전자 흐름 점
        if (lit) { eph = (eph + dt * 120); const seg = []; let tot = 0; for (let i = 1; i < path.length; i++) { const d = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); seg.push(d); tot += d; }
          for (let s = eph % 40; s < tot; s += 40) { let r = s, i = 0; while (r > seg[i]) { r -= seg[i]; i++; } const [x1, y1] = path[i], [x2, y2] = path[i + 1], f = r / seg[i]; c.fillStyle = '#2a73b8'; c.beginPath(); c.arc(x1 + (x2 - x1) * f, y1 + (y2 - y1) * f, 4.5, 0, TAU); c.fill(); }
          P.txt(c, '● 전자', (g.eR + g.bulb[0]) / 2 + 30, g.wy - 12, '#2a73b8', '700 14px'); }
        // 비커와 액체
        const lvTop = g.by - g.bh * 0.82 * (phase === 'melt' ? 0.35 : level);
        if (phase === 'water' || phase === 'melt') { c.fillStyle = phase === 'melt' ? 'rgba(255,170,90,.45)' : 'rgba(120,180,235,.38)'; c.fillRect(Lf, lvTop, Rr - Lf, L - lvTop); }
        c.strokeStyle = '#1d2433'; c.lineWidth = 4; c.beginPath(); c.moveTo(g.bx - g.bw / 2, g.top); c.lineTo(g.bx - g.bw / 2, g.by); c.lineTo(g.bx + g.bw / 2, g.by); c.lineTo(g.bx + g.bw / 2, g.top); c.stroke();
        // 전극
        [[g.eL, '(−)극', '#2a73b8'], [g.eR, '(+)극', '#c0392b']].forEach(([x, lab, col]) => { c.fillStyle = '#5a6270'; c.fillRect(x - 7, g.top + 30, 14, g.bh * 0.78); c.fillStyle = col; c.beginPath(); c.arc(x, g.top + 14, 16, 0, TAU); c.fill(); P.txt(c, lab, x, g.top + 19, '#fff', '800 12px'); });
        // 입자
        const cx = g.bx, cy0 = g.by - 22, sp = 28, xmin = g.eL + 18, xmax = g.eR - 18, ymin = (phase === 'melt' ? lvTop : Math.min(lvTop, g.by - 40)) + 14, ymax = g.by - 18;
        parts.forEach((q, i) => {
          const hx = cx + q.hx * sp, hy = cy0 - q.hy * sp * (q.mol ? 1 : 1);
          if (!q.free) { q.x = hx + Math.sin(t * 13 + i) * 1.6; q.y = hy + Math.cos(t * 11 + i) * 1.6; }
          else {
            if (!q.x) { q.x = hx; q.y = hy; }
            q.vx += (Math.random() - 0.5) * 900 * dt; q.vy += (Math.random() - 0.5) * 900 * dt;
            if (lit && !q.mol) q.vx += (q.neg ? 1 : -1) * 260 * dt;
            q.vx *= 0.94; q.vy *= 0.94; q.x += q.vx * dt; q.y += q.vy * dt;
            if (q.x < xmin) { q.x = xmin; q.vx = Math.abs(q.vx) * 0.3; } if (q.x > xmax) { q.x = xmax; q.vx = -Math.abs(q.vx) * 0.3; }
            if (q.y < ymin) { q.y = ymin; q.vy = Math.abs(q.vy); } if (q.y > ymax) { q.y = ymax; q.vy = -Math.abs(q.vy); }
          }
          if (q.mol) mol(c, q.x, q.y); else ion(c, q.x, q.y, q.neg);
        });
        const lab = kind === 'nacl' ? (phase === 'solid' ? '고체 염화 나트륨' : phase === 'water' ? '염화 나트륨 수용액' : '녹인 염화 나트륨(액체)') : (phase === 'solid' ? '고체 설탕' : phase === 'water' ? '설탕 수용액' : '녹인 설탕(액체)');
        P.txt(c, lab, g.bx, g.by + 26, '#1d2433', '800 18px');
        if (phase === 'solid' && heat > 0) { c.fillStyle = 'rgba(255,140,60,.4)'; c.fillRect(g.bx - g.bw * 0.3, g.by - 10, g.bw * 0.6 * heat, 6); }
        // 버너
        const [fx, fy] = [g.bx - g.bw / 2 - 70, g.by - 20];
        c.fillStyle = '#5a6270'; c.fillRect(fx - 16, fy, 32, 30);
        const fh = flame ? 46 + Math.sin(t * 30) * 6 : 22; c.fillStyle = flame ? '#ff8a2a' : '#5aa9f0'; c.beginPath(); c.moveTo(fx - 12, fy); c.quadraticCurveTo(fx, fy - fh * 1.4, fx + 12, fy); c.closePath(); c.fill();
        P.txt(c, '불꽃 — 꾹 누르기', fx, fy + 50, '#1d2433', '700 14px');
        // 물병
        const [ox, oy] = drag && drag.k === 'bottle' ? [drag.x, drag.y] : g.bottle;
        c.save(); c.translate(ox, oy); if (drag && drag.k === 'bottle') c.rotate(-0.7);
        c.fillStyle = 'rgba(150,200,240,.75)'; c.strokeStyle = '#1d2433'; c.lineWidth = 2.5; c.beginPath(); c.roundRect(-24, -40, 48, 80, 8); c.fill(); c.stroke(); c.fillStyle = '#e8ecf1'; c.fillRect(-9, -58, 18, 18); c.strokeRect(-9, -58, 18, 18); c.restore();
        if (!drag) P.txt(c, '증류수 — 끌어 붓기', g.bottle[0], g.bottle[1] + 62, '#1d2433', '700 15px');
        // 고르기 카드
        [['nacl', '염화 나트륨'], ['sugar', '설탕']].forEach(([k, n], i) => { const [x, y] = g.cards[i]; c.fillStyle = k === kind ? '#ffd84d' : '#2a3560'; c.beginPath(); c.roundRect(x - 70, y - 20, 140, 40, 10); c.fill(); P.txt(c, n, x, y + 7, k === kind ? '#1d2433' : '#fbfcf9', '800 18px'); });
        steps();
      },
      down(p) {
        const g = G(S.W, S.H);
        const ci = g.cards.findIndex(([x, y]) => Math.abs(p.x - x) < 70 && Math.abs(p.y - y) < 20); if (ci >= 0) { pick(ci ? 'sugar' : 'nacl'); return; }
        const [sx, sy] = g.sw, hx = sx + 4 + Math.cos(sw) * 46, hy = sy + Math.sin(sw) * 46; if (Math.hypot(p.x - hx, p.y - hy) < 30) { drag = { k: 'sw' }; return; }
        const [bx, by] = g.bottle; if (Math.abs(p.x - bx) < 34 && Math.abs(p.y - by) < 60) { drag = { k: 'bottle', x: p.x, y: p.y }; return; }
        const fx = g.bx - g.bw / 2 - 70, fy = g.by - 20; if (Math.abs(p.x - fx) < 40 && Math.abs(p.y - fy) < 60) { flame = true; if (phase === 'water') say('물이 있으면 끓기만 한다 — «처음부터»에서 고체로 해 보자'); else if (phase === 'solid') say('가열 중… 계속 누르고 있자'); }
      },
      move(p, e, held) {
        if (!held || !drag) return;
        if (drag.k === 'bottle') { drag.x = p.x; drag.y = p.y; }
        else { const g = G(S.W, S.H), [sx, sy] = g.sw; setSw(Math.atan2(p.y - sy, Math.max(10, p.x - sx - 4))); }
      },
      up(p) {
        flame = false;
        if (!drag) return; const g = G(S.W, S.H), k = drag.k; drag = null;
        if (k === 'bottle' && Math.abs(p.x - g.bx) < g.bw * 0.6 && p.y < g.by && p.y > g.top - 120) water();
      },
      key(e) {
        const k = e.key.toLowerCase();
        if (k === '1') { pick('nacl'); return true; } if (k === '2') { pick('sugar'); return true; }
        if (k === 'w') { water(); return true; } if (k === 'h') { melt(); return true; }
        if (k === ' ' || k === 'enter') { setSw(sw > -0.08 ? -0.7 : 0); return true; }
        return false;
      },
    });
    root.querySelector('.im-reset').addEventListener('click', () => { sw = -0.7; pick(kind); S.kick(); });
    pick('nacl');
    root._im = { pick: (k) => { pick(k); S.kick(); }, water: () => { water(); level = 1; S.kick(); }, close: () => { setSw(0); S.kick(); }, heat: () => { melt(); S.kick(); }, did };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.IonMove = { mount };
})();
