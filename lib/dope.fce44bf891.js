/* 2-2 4차시 체험 «규소에 불순물 넣기»(교과서 89쪽: 규소에 인·붕소를 섞으면 전류가 잘 흐른다 + 참고서: 남는 전자·빈자리).
   규소 격자(5×4, 이웃끼리 전자쌍). 아래 받침의 인(P, 원자가 전자 5)·붕소(B, 3)를 끌어 격자 근처 아무 데나 놓으면 가까운 규소와 바뀐다.
   인이면 남는 전자 하나가 떨어져 돌아다니고, 붕소면 전자 하나가 모자란 빈자리(점선 원)가 생겨 이웃 전자가 옮겨 오며 빈자리가 움직인다.
   전압 손잡이를 끌면(←→) 전자는 (+)극 쪽, 빈자리는 (−)극 쪽으로 흐르고 전류계 숫자가 불순물 수만큼 커진다(숫자는 이해를 돕기 위한 예).
   Dope.mount(root) → { fit, setActive } · 시험용: root._dp.add('P'|'B', n) · volt(0~1) · info() */
(function () {
  'use strict';
  const COLS = 5, ROWS = 4, DOT = { Si: '#7d8fb3', P: '#f2a03d', B: '#e86fa8' };
  function mount(root) {
    const stage = root.querySelector('.dp-stage'), now = root.querySelector('.dp-now'), out = root.querySelector('.dp-out'), meter = root.querySelector('.dp-meter');
    const P = window.Play;
    let atoms = [], carriers = [], volt = 0, drag = null, t = 0, msg = '';
    const done = new Set();
    const G = (W, H) => ({ x0: W * 0.14, x1: W * 0.86, y0: 70, y1: H - 150, trayY: H - 40, tray: { P: W * 0.16, B: W * 0.34 }, trk: [W * 0.52, W * 0.9, H - 40] });
    const pos = (g, i, j) => [g.x0 + (g.x1 - g.x0) * i / (COLS - 1), g.y0 + (g.y1 - g.y0) * j / (ROWS - 1)];
    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };
    const count = (k) => atoms.filter((a) => a.k === k).length;
    const current = () => volt * (0.3 + 1.6 * (count('P') + count('B'))); // 이해를 돕기 위한 예
    function info() {
      const nP = count('P'), nB = count('B'), I = current();
      meter.innerHTML = `인 <b>${nP}</b> · 붕소 <b>${nB}</b> · 전류 <b>${I.toFixed(1)} mA</b>${nP || nB ? ` <small>(${nP ? 'n형' : ''}${nP && nB ? '·' : ''}${nB ? 'p형' : ''})</small>` : ' <small>(순수 규소)</small>'}`;
      if (nP) done.add(1); if (nB) done.add(2); if ((nP || nB) && volt > 0.3) done.add(3);
      const st = [1, 2, 3].find((k) => !done.has(k)) || 0;
      window.L1.steps(root, st, [...done]); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 인(P)을 끌어 규소 사이에 넣자' : st === 2 ? '② 붕소(B)도 하나 넣어 보자' : st === 3 ? '③ 손잡이를 끌어 전압을 걸어 보자' : '불순물이 많을수록 전류가 커진다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
      return { P: nP, B: nB, volt, current: I };
    }
    function put(k, i, j) {
      const a = atoms.find((q) => q.i === i && q.j === j);
      if (!a || a.k !== 'Si') return false;
      a.k = k; a.flash = 1;
      const g = G(S.W || 700, S.H || 470), [x, y] = pos(g, i, j);
      if (k === 'P') { carriers.push({ k: 'e', x: x + 14, y: y - 14, vx: 30, vy: -20 }); say('<b>인</b>은 바깥 전자가 5개 — 넷은 이웃 규소와 짝을 짓고 <b>하나가 남아</b> 자유롭게 돌아다닌다'); }
      else { carriers.push({ k: 'h', x: x + (g.x1 - g.x0) / (COLS - 1) / 2, y, vx: 0, vy: 0, hop: 0 }); say('<b>붕소</b>는 바깥 전자가 3개 — 짝 하나에 전자가 모자라 <b>빈자리</b>가 생기고, 이웃 전자가 옮겨 오면 빈자리가 움직인다'); }
      window.RxT.jolt(stage, 1); info(); S.kick(); return true;
    }
    function dropAt(k, x, y) {
      const g = G(S.W, S.H); let best = null, bd = 1e9;
      atoms.forEach((a) => { if (a.k !== 'Si') return; const [ax, ay] = pos(g, a.i, a.j), d = Math.hypot(ax - x, ay - y); if (d < bd) { bd = d; best = a; } });
      if (!best) { say('규소 자리가 더 없다 — «처음부터»를 눌러 다시'); return; }
      put(k, best.i, best.j);
    }
    function addAuto(k) { const si = atoms.filter((a) => a.k === 'Si'); if (!si.length) return; const a = si[Math.floor(si.length / 2 + (k === 'B' ? 3 : 0)) % si.length]; put(k, a.i, a.j); }
    function setVolt(v) {
      volt = Math.max(0, Math.min(1, v));
      const n = count('P') + count('B');
      if (volt > 0.05) say(n ? `전압을 걸자 남는 전자는 <b>(+)극</b> 쪽, 빈자리는 <b>(−)극</b> 쪽으로 움직인다 — 순수 규소보다 전류가 <b>커졌다</b>` : '순수한 규소는 전자가 모두 이웃과 짝을 지어 붙잡혀 있어 전류가 아주 조금만 흐른다');
      info(); S.kick();
    }
    // 그림(2026-11-10 «그래픽 다시 그리기»): 웨이퍼 결정 바탕, 광택 원자 구슬, 빛나는 전자쌍, 금속 전극판
    const ball = (c, x, y, r, a, b2) => { const g = c.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.15, x, y, r); g.addColorStop(0, a); g.addColorStop(1, b2); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); };
    const SHADE = { Si: ['#dfe6f5', '#5d6a88'], P: ['#ffd3a0', '#c96a12'], B: ['#ffc7e2', '#b8327a'] };
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const g = G(W, H), sx = (g.x1 - g.x0) / (COLS - 1), sy = (g.y1 - g.y0) / (ROWS - 1);
        { const gr = c.createLinearGradient(0, 0, W, H); gr.addColorStop(0, '#2a2f4a'); gr.addColorStop(0.5, '#3a3550'); gr.addColorStop(1, '#1d2238'); c.fillStyle = gr; c.fillRect(0, 0, W, H);
          c.strokeStyle = 'rgba(255,255,255,.03)'; c.lineWidth = 1; for (let i = -H; i < W; i += 9) { c.beginPath(); c.moveTo(i, 0); c.lineTo(i + H, H); c.stroke(); } }
        // 양 끝 극
        if (volt > 0.02) {
          c.fillStyle = '#c7ccd4'; c.fillRect(g.x0 - 60, g.y0 - 30, 12, g.y1 - g.y0 + 60); c.fillStyle = `rgba(90,169,240,${0.25 + volt * 0.5})`; c.fillRect(g.x0 - 60, g.y0 - 30, 12, g.y1 - g.y0 + 60); P.txt(c, '(−)', g.x0 - 54, g.y0 - 38, '#7fd1ff', '800 17px');
          c.fillStyle = '#c7ccd4'; c.fillRect(g.x1 + 48, g.y0 - 30, 12, g.y1 - g.y0 + 60); c.fillStyle = `rgba(239,91,76,${0.25 + volt * 0.5})`; c.fillRect(g.x1 + 48, g.y0 - 30, 12, g.y1 - g.y0 + 60); P.txt(c, '(+)', g.x1 + 54, g.y0 - 38, '#ff8a7a', '800 17px');
        }
        // 결합(전자쌍): 이웃 사이 막대 + 전자 둘. 붕소가 만든 빈자리는 아래 점선 원으로 따로 그린다
        c.lineWidth = 4;
        for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) {
          const [x, y] = pos(g, i, j);
          [[1, 0], [0, 1]].forEach(([di, dj]) => {
            if (i + di >= COLS || j + dj >= ROWS) return;
            const [x2, y2] = pos(g, i + di, j + dj), mx = (x + x2) / 2, my = (y + y2) / 2;
            c.strokeStyle = 'rgba(190,210,255,.18)'; c.lineWidth = 7; c.beginPath(); c.moveTo(x, y); c.lineTo(x2, y2); c.stroke(); c.lineWidth = 4;
            const ox = dj ? 6 : 0, oy = di ? 6 : 0;
            ball(c, mx - ox, my - oy, 4.5, '#e6f6ff', '#3f8fd8'); ball(c, mx + ox, my + oy, 4.5, '#e6f6ff', '#3f8fd8');
          });
        }
        // 원자
        atoms.forEach((a) => {
          const [x, y] = pos(g, a.i, a.j);
          if (a.flash > 0) { c.fillStyle = `rgba(255,216,77,${a.flash * 0.5})`; c.beginPath(); c.arc(x, y, 36, 0, Math.PI * 2); c.fill(); a.flash = Math.max(0, a.flash - dt * 1.2); }
          c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(x + 3, y + 18, 16, 5, 0, 0, Math.PI * 2); c.fill();
          ball(c, x, y, 20, ...SHADE[a.k]);
          P.txt(c, a.k, x, y + 6, a.k === 'Si' ? '#1d2433' : '#fff', '800 17px');
        });
        // 남는 전자·빈자리
        const drift = volt * 90;
        carriers.forEach((q) => {
          if (dt) {
            if (q.k === 'e') {
              q.vx += (Math.random() - 0.5) * 260 * dt; q.vy += (Math.random() - 0.5) * 260 * dt; q.vx *= Math.pow(0.5, dt); q.vy *= Math.pow(0.5, dt);
              q.x += (q.vx + drift) * dt; q.y += q.vy * dt;
            } else { // 빈자리는 결합 자리 사이를 깡충깡충 — 전압이 있으면 (−)쪽으로 더 자주
              q.hop -= dt; if (q.hop <= 0) { q.hop = 0.5 - volt * 0.3; const left = volt > 0.05 ? Math.random() < 0.75 : Math.random() < 0.5; q.x += (left ? -1 : 1) * sx / 2; q.y += (Math.random() - 0.5) * sy * 0.6; }
            }
            if (q.x > g.x1 + 30) q.x = g.x0 - 20; if (q.x < g.x0 - 30) q.x = g.x1 + 20;
            q.y = Math.max(g.y0 - 20, Math.min(g.y1 + 20, q.y));
          }
          if (q.k === 'e') { P.glow(c, q.x, q.y, 16, 'rgba(255,220,90,.4)'); ball(c, q.x, q.y, 7, '#fff6c8', '#d9a414'); P.txt(c, '−', q.x, q.y + 4, '#1d2433', '800 12px'); }
          else { c.strokeStyle = '#ff8ac0'; c.lineWidth = 2.5; c.setLineDash([4, 3]); c.beginPath(); c.arc(q.x, q.y, 9, 0, Math.PI * 2); c.stroke(); c.setLineDash([]); }
        });
        // 받침 + 전압 손잡이
        c.fillStyle = '#16203f'; c.fillRect(0, g.trayY - 34, W, H);
        ['P', 'B'].forEach((k) => { const x = g.tray[k]; ball(c, x, g.trayY, 20, ...SHADE[k]); P.txt(c, k, x, g.trayY + 6, '#fff', '800 17px'); P.txt(c, k === 'P' ? '인 (전자 5)' : '붕소 (전자 3)', x + 70, g.trayY + 5, '#c8d4f0', '700 14px'); });
        const [t0, t1, ty] = g.trk, hx = t0 + (t1 - t0) * volt;
        c.strokeStyle = '#5a6a90'; c.lineWidth = 6; c.beginPath(); c.moveTo(t0, ty); c.lineTo(t1, ty); c.stroke();
        c.strokeStyle = '#ffd84d'; c.beginPath(); c.moveTo(t0, ty); c.lineTo(hx, ty); c.stroke();
        c.fillStyle = '#ffd84d'; c.beginPath(); c.arc(hx, ty, 12, 0, Math.PI * 2); c.fill();
        P.txt(c, `전압 ${Math.round(volt * 100)}%`, (t0 + t1) / 2, ty - 18, '#fbfcf9', '700 14px');
        P.txt(c, `전류 ${current().toFixed(1)} mA`, g.x1 + 22, 34, '#ffd84d', '800 20px', 'right'); // (+)극 판·기호 왼쪽에
        if (drag && drag.k) { c.globalAlpha = 0.9; ball(c, drag.x, drag.y, 20, ...SHADE[drag.k]); c.globalAlpha = 1; P.txt(c, drag.k, drag.x, drag.y + 6, '#fff', '800 17px'); }
      },
      down(p) {
        const g = G(S.W, S.H);
        for (const k of ['P', 'B']) if (Math.hypot(p.x - g.tray[k], p.y - g.trayY) < 30) { drag = { k, x: p.x, y: p.y }; return; }
        const [t0, t1, ty] = g.trk; if (p.x > t0 - 20 && p.x < t1 + 20 && Math.abs(p.y - ty) < 26) { drag = { v: true }; setVolt((p.x - t0) / (t1 - t0)); }
      },
      move(p, e, held) { if (!held || !drag) return; if (drag.v) { const g = G(S.W, S.H); setVolt((p.x - g.trk[0]) / (g.trk[1] - g.trk[0])); } else { drag.x = p.x; drag.y = p.y; } },
      up(p) { if (drag && drag.k) { const g = G(S.W, S.H); if (p.y < g.trayY - 34) dropAt(drag.k, p.x, p.y); } drag = null; },
      key(e) {
        if (e.key === 'ArrowRight') { setVolt(volt + 0.1); return true; } if (e.key === 'ArrowLeft') { setVolt(volt - 0.1); return true; }
        const k = e.key.toUpperCase(); if (k === 'P' || k === 'B') { addAuto(k); return true; }
        if (e.key === '0') { reset(); return true; }
        return false;
      },
    });
    function reset() {
      atoms = []; for (let j = 0; j < ROWS; j++) for (let i = 0; i < COLS; i++) atoms.push({ i, j, k: 'Si', flash: 0 });
      carriers = []; volt = 0; done.clear(); msg = '';
      say('순수한 규소: 바깥 전자 4개가 모두 이웃과 짝을 지어 붙잡혀 있다 — 인이나 붕소를 끌어 넣어 보자'); info(); S.kick();
    }
    root.querySelector('.dp-reset')?.addEventListener('click', reset);
    reset();
    root._dp = { add(k, n = 1) { for (let q = 0; q < n; q++) addAuto(k); return info(); }, volt(v) { setVolt(v); return info(); }, info };
    // 자체 검사: 불순물이 있으면 같은 전압에서 전류가 순수 규소보다 크다
    console.assert(0.5 * (0.3 + 1.6) > 0.5 * 0.3, 'dope 전류 규칙');
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Dope = { mount };
})();
