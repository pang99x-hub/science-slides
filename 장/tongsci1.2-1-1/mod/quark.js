/* 2-1-1 2차시 체험 «쿼크 셋으로 양성자·중성자 만들기»(교과서 52쪽 본문, 쿼크의 전하는 다른 교과서 내용).
   아래의 위 쿼크(+2/3)·아래 쿼크(−1/3)를 끌어 고리에 셋씩 넣는다(u·d 키, 지우기 Backspace). 고리의 쿼크를 누르면 빠진다.
   Quark.mount(root) → { fit, setActive } · 시험용: root._qk.add(고리 0|1, 'u'|'d') · reset() */
(function () {
  'use strict';
  const Q = { u: { n: '위', q: 2, col: '#f29a3a', t: '+2/3' }, d: { n: '아래', q: -1, col: '#4fb37a', t: '−1/3' } };
  const KIND = { duu: ['양성자', '#e0503f'], ddu: ['중성자', '#a7adb5'] };
  const fmt = (n) => n === 0 ? '0' : n % 3 === 0 ? (n > 0 ? '+' : '−') + Math.abs(n / 3) : (n > 0 ? '+' : '−') + Math.abs(n) + '/3';
  function mount(root) {
    const stage = root.querySelector('.stage'), msg = root.querySelector('.u-msg'), now = root.querySelector('.now-chip');
    const P = window.Play, rings = [[], []], made = new Set();
    let drag = null, t = 0, S = null;
    const kind = (r) => r.length === 3 ? KIND[[...r].sort().join('')] : null;
    const geo = () => ({ rx: [S.W * 0.27, S.W * 0.73], ry: S.H * 0.38, R: Math.min(S.W * 0.16, S.H * 0.25), sy: S.H - 62, sx: { u: S.W * 0.38, d: S.W * 0.62 } });
    const slot = (g, i, j) => [g.rx[i] + Math.cos(-Math.PI / 2 + j * 2.094) * g.R * 0.5, g.ry + Math.sin(-Math.PI / 2 + j * 2.094) * g.R * 0.5];
    function sync() {
      const ks = rings.map((r) => (kind(r) || [''])[0]);
      const ok = []; if (made.has('양성자')) ok.push(1); if (made.has('중성자')) ok.push(2); if (ks.includes('양성자') && ks.includes('중성자')) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      now.textContent = ['양성자 +1, 중성자 0 — 쿼크 하나 차이', '① 위 쿼크 둘 + 아래 쿼크 하나를 한 고리에', '② 위 쿼크 하나 + 아래 쿼크 둘을 한 고리에', '③ 두 고리에 양성자와 중성자를 나란히'][st];
      now.classList.toggle('done', st === 0);
    }
    function add(i, k) {
      const r = rings[i]; if (r.length >= 3) return;
      r.push(k);
      const sum = r.reduce((a, x) => a + Q[x].q, 0), kd = kind(r);
      if (kd) { made.add(kd[0]); window.RxT.jolt(stage, 1); msg.innerHTML = `<b>${kd[0]}</b> 완성! 전하 ${r.map((x) => Q[x].t).join(' ')} = <b>${fmt(sum)}</b>`; }
      else if (r.length === 3) msg.innerHTML = `전하 합 ${fmt(sum)} — 양성자도 중성자도 아니다. 쿼크를 눌러 빼고 다시 넣자`;
      else msg.innerHTML = `${Q[k].n} 쿼크(${Q[k].t})를 넣었다 · 지금 전하 합 <b>${fmt(sum)}</b>`;
      msg.className = 'u-msg fu-msg' + (kd ? ' ok' : r.length === 3 ? ' no' : '');
      sync();
    }
    function reset() { rings[0].length = 0; rings[1].length = 0; msg.textContent = ''; sync(); S.redraw(); }
    const ball = (c, x, y, r, k) => { c.fillStyle = Q[k].col; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); P.txt(c, k, x, y + 2, '#1d2433', '800 24px'); P.txt(c, Q[k].t, x, y + 20, '#1d2433', '700 13px'); };
    S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; c.fillStyle = '#0b0e18'; c.fillRect(0, 0, W, H);
        const g = geo();
        rings.forEach((r, i) => {
          const kd = kind(r), x = g.rx[i], sum = r.reduce((a, q) => a + Q[q].q, 0);
          c.fillStyle = kd ? kd[1] + '55' : 'rgba(255,255,255,.06)'; c.strokeStyle = kd ? kd[1] : 'rgba(185,194,216,.6)'; c.lineWidth = 3;
          c.setLineDash(kd ? [] : [8, 8]); c.beginPath(); c.arc(x, g.ry, g.R, 0, Math.PI * 2); c.fill(); c.stroke(); c.setLineDash([]);
          r.forEach((k, j) => { const [sx, sy] = slot(g, i, j); ball(c, sx + Math.sin(t * 3 + j * 2 + i) * 3, sy + Math.cos(t * 2.6 + j) * 3, 30, k); });
          P.txt(c, kd ? `${kd[0]} · 전하 ${fmt(sum)}` : r.length ? `전하 합 ${fmt(sum)} (${r.length}/3)` : '쿼크 셋을 넣자', x, g.ry + g.R + 34, kd ? '#ffd84d' : '#fbfcf9', '700 22px');
        });
        ['u', 'd'].forEach((k) => { ball(c, g.sx[k], g.sy, 34, k); P.txt(c, `${Q[k].n} 쿼크`, g.sx[k] + (k === 'u' ? -52 : 52), g.sy + 7, '#fbfcf9', '700 20px', k === 'u' ? 'right' : 'left'); });
        if (drag) ball(c, drag.x, drag.y, 32, drag.k);
      },
      down(p) {
        const g = geo();
        for (const k of ['u', 'd']) if (Math.hypot(p.x - g.sx[k], p.y - g.sy) < 48) { drag = { k, x: p.x, y: p.y }; return; }
        rings.forEach((r, i) => { const j = r.findIndex((_, n) => { const [sx, sy] = slot(g, i, n); return Math.hypot(p.x - sx, p.y - sy) < 34; }); if (j >= 0) { r.splice(j, 1); msg.textContent = '쿼크 하나를 뺐다'; msg.className = 'u-msg fu-msg'; sync(); } });
      },
      move(p) { if (drag) { drag.x = p.x; drag.y = p.y; } },
      up(p) { if (!drag) return; const g = geo(), i = g.rx.findIndex((x) => Math.hypot(p.x - x, p.y - g.ry) < g.R * 1.25); if (i >= 0) add(i, drag.k); drag = null; },
      key(e) {
        const k = e.key.toLowerCase();
        if (k === 'u' || k === 'd') { const i = rings.findIndex((r) => r.length < 3); if (i >= 0) add(i, k); return true; }
        if (k === 'backspace' || k === 'delete') { const r = [...rings].reverse().find((x) => x.length); if (r) { r.pop(); sync(); } return true; }
        return false;
      },
    });
    const rb = root.querySelector('.qk-reset'); if (rb) rb.addEventListener('click', reset);
    sync();
    root._qk = { add: (i, k) => { add(i, k); S.redraw(); }, reset, rings };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Quark = { mount };
})();
