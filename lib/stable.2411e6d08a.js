/* 2-1 3차시 체험 «18족처럼 되기»(교과서 67쪽 해 보기 + 참고서 76쪽). 위 원자 카드(나트륨·마그네슘·알루미늄·산소·플루오린·염소)를 눌러 고른다.
   바깥 껍질의 전자를 끌어 왼쪽 «내보내기» 칸에 버리거나, 오른쪽 «받기» 더미에서 전자를 끌어 바깥 껍질에 넣는다.
   바깥 껍질이 2개·8개로 꽉 차 18족(헬륨·네온·아르곤)과 같아지면 번쩍 + 이온 표시(Na⁺, O²⁻ …). 원자핵 (+) 전하는 그대로라 전자 수만큼 전하가 생긴다.
   Stable.mount(root) → { fit, setActive } · 시험용: root._st2.pick(z) · give(k) · take(k) */
(function () {
  'use strict';
  const ZS = [11, 12, 13, 8, 9, 17], NOBLE = { 2: '헬륨', 10: '네온', 18: '아르곤' };
  const SUP = (q) => (q === 0 ? '' : `${Math.abs(q) > 1 ? Math.abs(q) : ''}${q > 0 ? '⁺' : '⁻'}`.replace('2', '²').replace('3', '³'));
  function mount(root) {
    const stage = root.querySelector('.sb-stage'), now = root.querySelector('.sb-now'), out = root.querySelector('.sb-out');
    const P = window.Play, E = () => window.Elem;
    let z = 11, ne = 11, drag = null, t = 0, flash = 0, msg = ''; const done = new Set();
    const conf = (k) => { const o = []; let r = k; [2, 8, 8].forEach((m) => { if (r > 0) { o.push(Math.min(m, r)); r -= m; } }); return o; };
    const G = (W, H) => ({ cx: W * 0.5, cy: H * 0.46, r: Math.min(W, H) * 0.08, card: (i) => [W * (0.14 + i * 0.145), H - 30], out: [W * 0.1, H * 0.46], inn: [W * 0.9, H * 0.46] });
    function say(h) { if (h !== msg) { msg = h; out.innerHTML = h; } }
    function check() {
      const q = z - ne, e = E().get(z);
      if (NOBLE[ne]) { if (!done.has(z)) { done.add(z); flash = 1; window.RxT.jolt(stage, 1); } say(`<b>${e.n}</b>: 전자 ${Math.abs(q)}개를 ${q > 0 ? '잃어' : '얻어'} <b>${NOBLE[ne]}</b>과 같은 전자 배치 → <b>${e.s}${SUP(q)}</b> ${q > 0 ? '양이온' : '음이온'}`); }
      else say(`<b>${e.n}</b>: 원자가 전자 ${E().valence(z)}개 — ${E().valence(z) <= 3 ? '바깥 전자를 <b>내보내</b> 보자' : '전자를 <b>받아</b> 바깥 껍질을 채워 보자'} (지금 전자 ${ne}개, 전하 ${q > 0 ? '+' : ''}${q})`);
    }
    function pick(k) { z = k; ne = k; check(); S.kick(); }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const g = G(W, H), sh = conf(ne), last = sh.length - 1, noble = !!NOBLE[ne];
        c.fillStyle = '#0f1630'; c.fillRect(0, 0, W, H);
        ZS.forEach((k, i) => { const [x, y] = g.card(i), e = E().get(k); c.fillStyle = k === z ? '#ffd84d' : done.has(k) ? '#2f9e5b' : '#2a3560'; c.beginPath(); c.roundRect(x - 52, y - 20, 104, 40, 10); c.fill(); P.txt(c, e.n, x, y + 7, k === z ? '#1d2433' : '#fbfcf9', '800 19px'); });
        // 원자
        if (noble) P.glow(c, g.cx, g.cy, g.r * 6, 'rgba(255,216,77,.35)');
        c.fillStyle = '#e0503f'; c.beginPath(); c.arc(g.cx, g.cy, g.r * 0.6, 0, Math.PI * 2); c.fill(); P.txt(c, `+${z}`, g.cx, g.cy + 7, '#fff', '800 20px');
        for (let i = 0; i < 3; i++) { const r = g.r * (1.3 + i * 0.95); c.strokeStyle = i <= last ? 'rgba(190,210,255,.8)' : 'rgba(190,210,255,.15)'; c.lineWidth = 2.5; c.beginPath(); c.arc(g.cx, g.cy, r, 0, Math.PI * 2); c.stroke(); }
        sh.forEach((m, i) => { const r = g.r * (1.3 + i * 0.95); for (let k = 0; k < m; k++) { const a = k / m * Math.PI * 2 + t * 0.4; const x = g.cx + Math.cos(a) * r, y = g.cy + Math.sin(a) * r; c.fillStyle = i === last ? '#7fd1ff' : '#5aa9f0'; c.beginPath(); c.arc(x, y, 8, 0, Math.PI * 2); c.fill(); } });
        const q = z - ne; P.txt(c, `${E().get(z).s}${SUP(q)}`, g.cx, g.cy - g.r * 3.6, noble ? '#ffd84d' : '#fbfcf9', '800 34px');
        if (noble) P.txt(c, `${NOBLE[ne]}과 같은 배치!`, g.cx, g.cy + g.r * 3.9, '#ffd84d', '800 22px');
        // 내보내기·받기
        const [ox, oy] = g.out, [ix, iy] = g.inn;
        c.strokeStyle = '#ff8a7a'; c.setLineDash([6, 5]); c.lineWidth = 2; c.strokeRect(ox - 60, oy - 50, 120, 100); c.setLineDash([]); P.txt(c, '내보내기', ox, oy + 72, '#ff8a7a', '800 19px'); P.txt(c, '여기로 끌어 버리기', ox, oy + 6, '#ff8a7a', '600 14px');
        c.fillStyle = '#16203f'; c.beginPath(); c.roundRect(ix - 60, iy - 50, 120, 100, 14); c.fill(); for (let k = 0; k < 6; k++) { c.fillStyle = '#7fd1ff'; c.beginPath(); c.arc(ix - 30 + (k % 3) * 30, iy - 14 + Math.floor(k / 3) * 26, 8, 0, Math.PI * 2); c.fill(); } P.txt(c, '받기(전자 더미)', ix, iy + 72, '#7fd1ff', '800 19px');
        if (drag) { c.fillStyle = '#7fd1ff'; c.beginPath(); c.arc(drag.x, drag.y, 10, 0, Math.PI * 2); c.fill(); }
        if (flash > 0) { c.fillStyle = `rgba(255,216,77,${flash * 0.35})`; c.fillRect(0, 0, W, H); flash = Math.max(0, flash - dt * 1.5); }
        const ok = []; if (done.has(11)) ok.push(1); if (done.has(17)) ok.push(2); if ([12, 13, 8, 9].some((k) => done.has(k))) ok.push(3);
        const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0; window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
        const nt = st === 1 ? '① 나트륨의 바깥 전자를 끌어 내보내자' : st === 2 ? '② 염소를 골라 전자를 받아 채우자' : st === 3 ? '③ 다른 원자도 하나 해 보자' : '전자를 잃거나 얻어 18족처럼 안정해진다';
        if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
      },
      down(p) {
        const g = G(S.W, S.H);
        const ci = ZS.findIndex((k, i) => { const [x, y] = g.card(i); return Math.abs(p.x - x) < 52 && Math.abs(p.y - y) < 20; });
        if (ci >= 0) { pick(ZS[ci]); return; }
        const [ix, iy] = g.inn; if (Math.abs(p.x - ix) < 60 && Math.abs(p.y - iy) < 50) { drag = { x: p.x, y: p.y, from: 'in' }; return; }
        const sh = conf(ne), r = g.r * (1.3 + (sh.length - 1) * 0.95);
        if (ne > 0 && Math.abs(Math.hypot(p.x - g.cx, p.y - g.cy) - r) < 18) drag = { x: p.x, y: p.y, from: 'atom' };
      },
      move(p, e, held) { if (held && drag) { drag.x = p.x; drag.y = p.y; } },
      up(p) {
        if (!drag) return; const g = G(S.W, S.H), [ox, oy] = g.out, d = Math.hypot(p.x - g.cx, p.y - g.cy);
        if (drag.from === 'atom' && Math.abs(p.x - ox) < 70 && Math.abs(p.y - oy) < 60) { ne -= 1; check(); }
        if (drag.from === 'in' && d < g.r * 4) { if (ne < 18) { ne += 1; check(); } }
        drag = null;
      },
      key(e) { if (e.key === 'ArrowDown') { if (ne > 0) { ne -= 1; check(); } return true; } if (e.key === 'ArrowUp') { if (ne < 18) { ne += 1; check(); } return true; } const i = '123456'.indexOf(e.key); if (i >= 0) { pick(ZS[i]); return true; } return false; },
    });
    check();
    root._st2 = { pick, give: (k) => { ne -= k; check(); S.kick(); }, take: (k) => { ne += k; check(); S.kick(); } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Stable = { mount };
})();
