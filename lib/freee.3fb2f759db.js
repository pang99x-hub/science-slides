/* 2-2 4차시 체험 «전선 속 전자»(교과서 89쪽 그림 Ⅱ-31 + 참고서: 속박된 전자·자유 전자, 부도체의 전자는 (+)쪽으로 기울 뿐).
   위 카드로 구리(도체)·고무(부도체)·규소(반도체)를 고른다. 막대 속 원자는 붙잡힌 전자가 제자리에서 떨고, 자유 전자는 돌아다닌다.
   아래 전압 손잡이를 끌면(←→) 막대 양 끝에 (−)·(+)가 생기고 자유 전자가 (+)극 쪽으로 흘러 전류계 바늘이 움직인다.
   규소일 때 «빛»·«열»을 꾹 누르면 붙잡힌 전자가 떨어져 나와 자유 전자가 늘어난다. 전자가 흐르는 방향과 전류 방향은 반대.
   FreeE.mount(root) → { fit, setActive } · 시험용: root._fe.pick('cu'|'rub'|'si') · volt(0~1) · light(초) · info() */
(function () {
  'use strict';
  const MAT = {
    cu: { n: '구리', kind: '도체', free: 34, mob: 1, col: '#c97a3d' },
    rub: { n: '고무', kind: '부도체', free: 0, mob: 0, col: '#4a4f5c' },
    si: { n: '규소', kind: '반도체', free: 3, mob: 0.8, col: '#7d8fb3' },
  };
  const KEYS = ['cu', 'rub', 'si'], COLS = 9, ROWS = 3, EXTRA_MAX = 18;
  function mount(root) {
    const stage = root.querySelector('.fe-stage'), now = root.querySelector('.fe-now'), out = root.querySelector('.fe-out'), meter = root.querySelector('.fe-meter');
    const P = window.Play;
    let mat = 'cu', volt = 0, extra = 0, glow = null, glowT = 0, idle = 0, t = 0, drag = null, free = [], msg = '';
    const done = new Set(), tried = new Set();
    const G = (W, H) => ({ bx0: W * 0.1, bx1: W * 0.9, by0: H * 0.2, by1: H * 0.56, cardX: (i) => W * (0.45 + i * 0.19), trk: [W * 0.1, W * 0.5, H * 0.86], gauge: [W * 0.5, H * 0.74], icons: [[W * 0.7, H * 0.86], [W * 0.86, H * 0.86]] });
    const site = (g, i, j) => [g.bx0 + (g.bx1 - g.bx0) * (i + 0.5) / COLS, g.by0 + (g.by1 - g.by0) * (j + 0.5) / ROWS];
    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };
    const nFree = () => MAT[mat].free + (mat === 'si' ? Math.round(extra) : 0);
    const current = () => volt * nFree() * MAT[mat].mob; // 이해를 돕기 위한 상대값
    function spawn(n) { const g = G(S.W || 700, S.H || 470); for (let k = 0; k < n; k++) free.push({ x: g.bx0 + Math.random() * (g.bx1 - g.bx0), y: g.by0 + Math.random() * (g.by1 - g.by0), vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.5) * 60 }); }
    function sync() { const want = nFree(); while (free.length < want) spawn(1); while (free.length > want) free.pop(); }
    function info() {
      const I = current();
      meter.innerHTML = `물질 <b>${MAT[mat].n}(${MAT[mat].kind})</b> · 자유 전자 <b>${nFree()}</b>개 · 전류 <b>${I.toFixed(1)}</b>`;
      if (mat === 'cu' && volt > 0.3) done.add(1);
      if (mat === 'rub' && volt > 0.3) done.add(2);
      if (mat === 'si' && extra >= 6 && volt > 0.2) done.add(3);
      const st = [1, 2, 3].find((k) => !done.has(k)) || 0;
      window.L1.steps(root, st, [...done]); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 구리를 고르고 아래 손잡이를 끌어 전압을 걸자' : st === 2 ? '② «고무»로 바꿔 같은 전압을 걸어 보자' : st === 3 ? '③ «규소»에 전압을 걸고 빛이나 열을 꾹 눌러 보자' : '자유 전자가 많을수록 전류가 잘 흐른다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
      return { mat, volt, free: nFree(), current: I, extra };
    }
    function explain() {
      if (volt < 0.05) { say(`<b>${MAT[mat].n}</b> — 전압이 없으면 자유 전자는 제멋대로 돌아다닐 뿐, 한쪽으로 흐르지 않는다`); return; }
      if (mat === 'cu') say('<b>구리</b>: 자유 전자가 아주 많아 (+)극 쪽으로 우르르 흐른다 → 전류가 <b>잘 흐른다</b>(도체)');
      else if (mat === 'rub') say('<b>고무</b>: 전자가 원자에 붙잡혀 (+)쪽으로 살짝 기울 뿐 옮겨 가지 못한다 → 전류가 <b>거의 흐르지 않는다</b>(부도체)');
      else say(extra >= 6 ? `<b>규소</b>: 빛·열의 에너지로 붙잡힌 전자가 떨어져 나와 자유 전자가 늘었다 → 전류가 <b>커졌다</b>(반도체는 조건에 따라 달라진다)` : '<b>규소</b>: 자유 전자가 조금뿐이라 전류도 조금 — 빛이나 열을 꾹 눌러 보자');
    }
    function pick(k) { mat = k; tried.add(k); extra = 0; free = []; sync(); explain(); info(); S.kick(); }
    function setVolt(v) { volt = Math.max(0, Math.min(1, v)); explain(); info(); S.kick(); }
    function excite(dt) { if (mat !== 'si') return; extra = Math.min(EXTRA_MAX, extra + dt * 9); idle = 0; sync(); explain(); info(); }
    // 그림(2026-11-10 «그래픽 다시 그리기»): 전선을 잘라 속을 확대한 모습 — 피복 단면, 물질 결정 질감, 광택 원자 구슬, 바늘 전류계, 전구·불꽃 아이콘
    const lg = (c, x0, y0, x1, y1, st2) => { const g = c.createLinearGradient(x0, y0, x1, y1); st2.forEach(([o, col]) => g.addColorStop(o, col)); return g; };
    const ball = (c, x, y, r, a, b2) => { const g = c.createRadialGradient(x - r * 0.35, y - r * 0.35, r * 0.15, x, y, r); g.addColorStop(0, a); g.addColorStop(1, b2); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); };
    const FILL = { cu: [['#e9a56a', 0], ['#b8692f', 0.5], ['#8a4a1e', 1]], rub: [['#3c414c', 0], ['#2a2e37', 1]], si: [['#9aa6c0', 0], ['#5f6c88', 0.6], ['#46526c', 1]] };
    function bulbIcon(c, x, y, on2) { if (on2) P.glow(c, x, y, 34, 'rgba(255,236,150,.6)'); ball(c, x, y - 4, 13, on2 ? '#fffbe0' : '#d9e2f2', on2 ? '#ffd84d' : '#7d8aa6'); c.fillStyle = '#9aa1ab'; c.fillRect(x - 6, y + 8, 12, 9); c.strokeStyle = '#5c6370'; c.lineWidth = 1; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(x - 6, y + 10 + i * 3); c.lineTo(x + 6, y + 11 + i * 3); c.stroke(); } }
    function flameIcon(c, x, y, on2) { if (on2) P.glow(c, x, y, 34, 'rgba(255,140,60,.6)'); c.fillStyle = lg(c, 0, y - 18, 0, y + 14, [[0, '#ffe08a'], [0.5, '#ff8a3d'], [1, '#d33a1a']]); c.beginPath(); c.moveTo(x, y - 18); c.bezierCurveTo(x + 14, y - 4, x + 12, y + 14, x, y + 14); c.bezierCurveTo(x - 12, y + 14, x - 14, y - 4, x, y - 18); c.fill(); c.fillStyle = 'rgba(255,250,220,.85)'; c.beginPath(); c.moveTo(x, y - 4); c.bezierCurveTo(x + 6, y + 4, x + 5, y + 12, x, y + 12); c.bezierCurveTo(x - 5, y + 12, x - 6, y + 4, x, y - 4); c.fill(); }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const g = G(W, H), m = MAT[mat];
        if (glow && dt) excite(dt);
        else if (mat === 'si' && extra > 0 && dt) { idle += dt; if (idle > 2) { extra = Math.max(0, extra - dt * 3); sync(); info(); } } // 빛을 끄면 전자가 천천히 다시 붙잡힌다
        c.fillStyle = lg(c, 0, 0, 0, H, [[0, '#23304f'], [1, '#141b30']]); c.fillRect(0, 0, W, H);
        // 위 카드
        KEYS.forEach((k, i) => { const x = g.cardX(i); c.fillStyle = k === mat ? '#ffd84d' : '#2a3560'; c.beginPath(); c.roundRect(x - 64, 14, 128, 34, 9); c.fill(); P.txt(c, `${MAT[k].n} · ${MAT[k].kind}`, x, 37, k === mat ? '#1d2433' : '#fbfcf9', '800 15px'); });
        // 전선 단면: 바깥 피복(두꺼운 고무 껍질) → 속 물질(결정 결)
        const x0 = g.bx0 - 12, y0 = g.by0 - 18, w0 = g.bx1 - g.bx0 + 24, h0 = g.by1 - g.by0 + 36;
        c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.roundRect(x0 - 8, y0 - 6, w0 + 16, h0 + 20, 22); c.fill();
        c.fillStyle = lg(c, 0, y0 - 12, 0, y0 + h0 + 12, [[0, '#4d5566'], [0.15, '#2a2f3a'], [0.85, '#1e222a'], [1, '#3e4553']]); c.beginPath(); c.roundRect(x0 - 10, y0 - 12, w0 + 20, h0 + 24, 22); c.fill();
        P.txt(c, '피복(부도체)', x0 + 46, y0 - 18, '#b9c2d8', '700 12px');
        c.fillStyle = lg(c, 0, y0, 0, y0 + h0, FILL[mat].map(([col, o]) => [o, col])); c.beginPath(); c.roundRect(x0, y0, w0, h0, 14); c.fill();
        c.save(); c.beginPath(); c.roundRect(x0, y0, w0, h0, 14); c.clip(); c.strokeStyle = mat === 'rub' ? 'rgba(255,255,255,.03)' : 'rgba(255,255,255,.08)'; c.lineWidth = 1;
        for (let i = -h0; i < w0; i += 14) { c.beginPath(); c.moveTo(x0 + i, y0); c.lineTo(x0 + i + h0 * 0.6, y0 + h0); c.stroke(); }
        c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(x0, y0 + 4, w0, h0 * 0.18); c.restore();
        // 양 끝 극: 금속판(전압을 걸면 색이 오른다)
        [[g.bx0 - 30, '(−)', '90,169,240', '#7fd1ff'], [g.bx1 + 16, '(+)', '239,91,76', '#ff8a7a']].forEach(([x, lab, rgb, tc]) => {
          c.fillStyle = lg(c, x, 0, x + 14, 0, [[0, '#7c8593'], [0.5, '#e6e9ee'], [1, '#6c7381']]); c.fillRect(x, y0 - 6, 14, h0 + 12);
          if (volt > 0.02) { c.fillStyle = `rgba(${rgb},${0.25 + volt * 0.5})`; c.fillRect(x, y0 - 6, 14, h0 + 12); P.txt(c, lab, x + 7, y0 - 14, tc, '800 18px'); } });
        // 원자: 원자핵 + 붙잡힌 전자(떨림, 부도체는 (+)쪽으로 기움)
        const lean = mat === 'rub' ? volt * 7 : volt * 2;
        for (let i = 0; i < COLS; i++) for (let j = 0; j < ROWS; j++) {
          const [x, y] = site(g, i, j);
          ball(c, x, y, 10, '#ff9a8a', '#a82a1c'); P.txt(c, '+', x, y + 5, '#fff', '800 13px');
          for (let q = 0; q < 2; q++) {
            const a = t * 3 + i * 1.7 + j * 2.3 + q * Math.PI, ex = x + Math.cos(a) * 15 + lean, ey = y + Math.sin(a) * 15;
            ball(c, ex, ey, 4, 'rgba(220,240,255,.9)', 'rgba(70,140,220,.7)');
          }
        }
        // 자유 전자
        const drift = volt * m.mob * 170;
        free.forEach((e) => {
          if (dt) {
            e.vx += (Math.random() - 0.5) * 300 * dt; e.vy += (Math.random() - 0.5) * 300 * dt;
            e.vx *= Math.pow(0.4, dt); e.vy *= Math.pow(0.4, dt);
            e.x += (e.vx + drift) * dt; e.y += e.vy * dt;
            if (e.x > g.bx1) e.x = g.bx0 + (e.x - g.bx1); if (e.x < g.bx0) e.x = g.bx1 - (g.bx0 - e.x); // 회로를 돌아 다시 들어온다
            if (e.y < g.by0 - 6 || e.y > g.by1 + 6) { e.vy *= -1; e.y = Math.max(g.by0 - 6, Math.min(g.by1 + 6, e.y)); }
          }
          P.glow(c, e.x, e.y, 10, 'rgba(255,220,90,.35)'); ball(c, e.x, e.y, 5, '#fff6c8', '#d9a414');
        });
        // 방향 화살표
        if (volt > 0.05 && current() > 0.05) {
          const y = g.by1 + 36; c.lineWidth = 3;
          c.strokeStyle = '#ffd84d'; c.beginPath(); c.moveTo(W * 0.3, y); c.lineTo(W * 0.46, y); c.lineTo(W * 0.44, y - 6); c.moveTo(W * 0.46, y); c.lineTo(W * 0.44, y + 6); c.stroke();
          P.txt(c, '전자의 흐름', W * 0.38, y - 10, '#ffd84d', '700 14px');
          c.strokeStyle = '#ff8a7a'; c.beginPath(); c.moveTo(W * 0.7, y); c.lineTo(W * 0.54, y); c.lineTo(W * 0.56, y - 6); c.moveTo(W * 0.54, y); c.lineTo(W * 0.56, y + 6); c.stroke();
          P.txt(c, '전류의 방향', W * 0.62, y - 10, '#ff8a7a', '700 14px');
        }
        // 전류계
        const [gx, gy] = g.gauge, R = 46, I = current(), ang = Math.PI * (1 + Math.min(1, I / 34));
        c.fillStyle = lg(c, 0, gy - 40, 0, gy + 30, [[0, '#e6e8ec'], [1, '#a9aeb7']]); c.beginPath(); c.roundRect(gx - R - 14, gy - 40, 2 * R + 28, 72, 10); c.fill();
        c.fillStyle = '#fbf8ef'; c.beginPath(); c.arc(gx, gy + 20, R, Math.PI, Math.PI * 2); c.closePath(); c.fill();
        c.strokeStyle = '#1d2433'; c.lineWidth = 1.5; for (let k = 0; k <= 10; k++) { const a2 = Math.PI * (1 + k / 10), r1 = k % 5 ? R - 7 : R - 12; c.beginPath(); c.moveTo(gx + Math.cos(a2) * r1, gy + 20 + Math.sin(a2) * r1); c.lineTo(gx + Math.cos(a2) * (R - 2), gy + 20 + Math.sin(a2) * (R - 2)); c.stroke(); }
        c.strokeStyle = '#d8261a'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(gx, gy + 20); c.lineTo(gx + Math.cos(ang) * (R - 6), gy + 20 + Math.sin(ang) * (R - 6)); c.stroke(); c.fillStyle = '#1d2433'; c.beginPath(); c.arc(gx, gy + 20, 4, 0, Math.PI * 2); c.fill();
        P.txt(c, '전류계', gx, gy + 40, '#c8d4f0', '700 13px');
        // 전압 손잡이
        const [t0, t1, ty] = g.trk, hx = t0 + (t1 - t0) * volt;
        c.strokeStyle = '#5a6a90'; c.lineWidth = 6; c.beginPath(); c.moveTo(t0, ty); c.lineTo(t1, ty); c.stroke();
        c.strokeStyle = '#ffd84d'; c.beginPath(); c.moveTo(t0, ty); c.lineTo(hx, ty); c.stroke();
        ball(c, hx, ty, 13, '#fff1a8', '#c99a14');
        P.txt(c, `전압 ${Math.round(volt * 100)}%`, (t0 + t1) / 2, ty - 18, '#fbfcf9', '700 15px');
        // 빛·열 (규소일 때)
        g.icons.forEach(([x, y], k) => {
          const on = mat === 'si', hot = glow === k;
          c.globalAlpha = on ? 1 : 0.25; c.fillStyle = '#2a3560'; c.beginPath(); c.arc(x, y, 26, 0, Math.PI * 2); c.fill();
          (k ? flameIcon : bulbIcon)(c, x, y, hot); P.txt(c, k ? '열 — 꾹' : '빛 — 꾹', x, y + 42, '#c8d4f0', '700 13px'); c.globalAlpha = 1;
          if (hot) { c.strokeStyle = k ? 'rgba(255,122,61,.5)' : 'rgba(255,242,168,.5)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x, y - 26); c.lineTo(W * 0.6, g.by1); c.stroke(); }
        });
      },
      down(p) {
        const g = G(S.W, S.H);
        const ci = KEYS.findIndex((_, i) => Math.abs(p.x - g.cardX(i)) < 64 && Math.abs(p.y - 31) < 20); if (ci >= 0) { pick(KEYS[ci]); return; }
        const [t0, t1, ty] = g.trk; if (p.x > t0 - 24 && p.x < t1 + 24 && Math.abs(p.y - ty) < 28) { drag = 'v'; setVolt((p.x - t0) / (t1 - t0)); return; }
        const k = g.icons.findIndex(([x, y]) => Math.hypot(p.x - x, p.y - y) < 32);
        if (k >= 0) { if (mat === 'si') glow = k; else say('빛·열 실험은 <b>규소</b>를 골라야 차이가 보인다'); }
      },
      move(p, e, held) { if (held && drag === 'v') { const g = G(S.W, S.H); setVolt((p.x - g.trk[0]) / (g.trk[1] - g.trk[0])); } },
      up() { drag = null; glow = null; },
      key(e) {
        if (e.key === 'ArrowRight') { setVolt(volt + 0.1); return true; } if (e.key === 'ArrowLeft') { setVolt(volt - 0.1); return true; }
        const i = '123'.indexOf(e.key); if (i >= 0) { pick(KEYS[i]); return true; }
        if (e.key === ' ' || e.key === 'l') { excite(0.4); return true; }
        if (e.key === '0') { reset(); return true; }
        return false;
      },
    });
    function reset() { done.clear(); tried.clear(); volt = 0; glow = null; pick('cu'); }
    root.querySelector('.fe-reset')?.addEventListener('click', reset);
    reset();
    root._fe = { pick(k) { pick(k); return info(); }, volt(v) { setVolt(v); return info(); }, light(sec) { excite(sec); S.kick(); return info(); }, info };
    // 자체 검사: 고무는 전압을 걸어도 전류 0, 구리 > 규소
    console.assert(MAT.rub.free * MAT.rub.mob === 0 && MAT.cu.free * MAT.cu.mob > MAT.si.free * MAT.si.mob, 'freee 물질 규칙');
    return { fit: S.fit, setActive: S.setActive };
  }
  window.FreeE = { mount };
})();
