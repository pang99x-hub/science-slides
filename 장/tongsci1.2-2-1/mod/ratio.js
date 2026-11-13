/* 2-2 3차시 체험 «염기 비율 저울»(교과서 97쪽 대단원 마무리 10번 + 참고서: A 19%면 T 19%, G·C 각 31%).
   위: 네 칸(A·T·G·C) 비율 막대 + 원그래프. 아데닌 손잡이를 끌면(←→) T가 같이 바뀌고 G·C가 남은 몫을 반씩 나눈다.
   손잡이 길 위 «대장균 24.7%»·«사람 30.4%» 눈금(교과서 97쪽 자료의 값)에 맞추면 풀이.
   아래: 염기 카드를 끌어(또는 A·T·G·C 키) 한 가닥 서열을 쓰면 짝 가닥이 저절로 쓰이고, 두 가닥 합계가 늘 A = T, G = C.
   Ratio.mount(root) → { fit, setActive } · 시험용: root._rt.setA(%) · seq('GTACCATGCAT') · info() */
(function () {
  'use strict';
  const B = { A: '#ffd84d', T: '#f2a03d', G: '#5cc77a', C: '#5aa9f0' }, MATE = { A: 'T', T: 'A', G: 'C', C: 'G' }, KEYS = 'ATGC', MAXN = 12;
  const MARK = [{ v: 24.7, n: '대장균' }, { v: 30.4, n: '사람' }];
  const parts = (a) => { const g = (100 - 2 * a) / 2; return { A: a, T: a, G: g, C: g }; };
  function mount(root) {
    const stage = root.querySelector('.rt-stage'), now = root.querySelector('.rt-now'), out = root.querySelector('.rt-out'), cntEl = root.querySelector('.rt-count');
    const P = window.Play;
    let a = 25, top = [], drag = null, msg = '', hit = new Set(), moved = false, t = 0;
    const done = new Set();
    const G = (W, H) => ({ x0: W * 0.06, x1: W * 0.6, barY: 96, barH: 44, trk: 206, pie: [W * 0.81, 150, Math.min(W * 0.14, 88)], s1: H * 0.64, s2: H * 0.64 + 60, cw: Math.min(44, (W - 60) / MAXN - 4), trayY: H - 38 });
    const ax = (g, v) => g.x0 + (g.x1 - g.x0) * v / 50; // 손잡이 길: A 0~50%
    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };
    function stats() {
      const c = { A: 0, T: 0, G: 0, C: 0 }; top.forEach((k) => { c[k]++; c[MATE[k]]++; });
      cntEl.innerHTML = top.length ? `두 가닥 합계 A <b>${c.A}</b> · T <b>${c.T}</b> · G <b>${c.G}</b> · C <b>${c.C}</b> → <b>A = T, G = C</b>` : '아래에서 한 가닥 서열을 써 보자';
      if (moved) done.add(1); if (hit.size === 2) done.add(2); if (top.length >= 6) done.add(3);
      const st = [1, 2, 3].find((k) => !done.has(k)) || 0;
      window.L1.steps(root, st, [...done]); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 노란 손잡이를 끌어 아데닌 비율을 바꿔 보자' : st === 2 ? `② «사람»·«대장균» 눈금에 맞춰 보자 (${hit.size}/2)` : st === 3 ? `③ 카드를 끌어 한 가닥 서열을 쓰자 (${top.length}/6)` : '한 가닥을 알면 다른 가닥도 안다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
      return { a, parts: parts(a), top: top.join(''), bottom: top.map((k) => MATE[k]).join(''), count: c };
    }
    function setA(v) {
      a = Math.round(Math.max(0, Math.min(50, v)) * 10) / 10; moved = true;
      const m = MARK.find((q) => Math.abs(q.v - a) < 0.8);
      const p = parts(a);
      if (m) { a = m.v; hit.add(m.n); const q = parts(a); say(`<b>${m.n}</b> DNA: A ${q.A}% → T도 ${q.T}%, 나머지 ${(100 - 2 * a).toFixed(1)}%를 G·C가 반씩 <b>${q.G.toFixed(1)}%</b>. 생물마다 비율은 달라도 A = T, G = C는 같다`); }
      else say(`A가 <b>${p.A}%</b>면 짝인 T도 <b>${p.T}%</b>, G와 C는 각각 <b>${p.G.toFixed(1)}%</b> — A·T 한 쌍, G·C 한 쌍씩 짝을 지어 있으니까`);
      stats(); S.kick();
    }
    function push(k) { if (top.length >= MAXN) { say(`칸이 꽉 찼다(${MAXN}글자)`); return; } top.push(k); say(`위 가닥에 <b>${k}</b> → 아래 가닥은 짝인 <b>${MATE[k]}</b>`); stats(); }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const g = G(W, H), p = parts(a);
        const N = window.NArt; N.bg(c, W, H);
        // 비율 막대: 둥근 통 안을 네 칸이 나눠 채움(광택·그림자)
        const bw = g.x1 - g.x0;
        c.save(); c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.roundRect(g.x0 + 2, g.barY + 4, bw, g.barH, 12); c.fill();
        c.beginPath(); c.roundRect(g.x0, g.barY, bw, g.barH, 12); c.clip();
        let x = g.x0;
        KEYS.split('').forEach((k) => {
          const w = bw * p[k] / 100, gr = c.createLinearGradient(0, g.barY, 0, g.barY + g.barH);
          gr.addColorStop(0, N.shade(B[k], 0.45)); gr.addColorStop(0.5, B[k]); gr.addColorStop(1, N.shade(B[k], -0.3));
          c.fillStyle = gr; c.fillRect(x, g.barY, w + 0.5, g.barH); c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(x + w - 1, g.barY, 1.5, g.barH); x += w;
        });
        c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(g.x0, g.barY + 3, bw, g.barH * 0.18);
        c.restore();
        x = g.x0; KEYS.split('').forEach((k) => { const w = bw * p[k] / 100; if (w > 40) P.txt(c, `${k} ${p[k].toFixed(1)}%`, x + w / 2, g.barY + g.barH / 2 + 6, '#1d2433', '800 15px'); x += w; });
        P.txt(c, '이중 나선 DNA의 염기 비율', g.x0 + bw / 2, g.barY - 12, '#c8d4f0', '700 14px');
        // 원그래프: 그림자 + 조각마다 그러데이션 + 바깥 글자
        const [px, py, pr] = g.pie; let a0 = -Math.PI / 2;
        c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.ellipse(px + 4, py + 8, pr, pr * 0.96, 0, 0, Math.PI * 2); c.fill();
        KEYS.split('').forEach((k) => {
          const a1 = a0 + Math.PI * 2 * p[k] / 100, gr = c.createRadialGradient(px - pr * 0.3, py - pr * 0.35, pr * 0.1, px, py, pr);
          gr.addColorStop(0, N.shade(B[k], 0.4)); gr.addColorStop(1, N.shade(B[k], -0.2));
          c.fillStyle = gr; c.beginPath(); c.moveTo(px, py); c.arc(px, py, pr, a0, a1); c.closePath(); c.fill();
          c.strokeStyle = 'rgba(15,22,48,.8)'; c.lineWidth = 2; c.stroke();
          if (p[k] > 4) { const am = (a0 + a1) / 2; P.txt(c, k, px + Math.cos(am) * pr * 0.62, py + Math.sin(am) * pr * 0.62 + 6, '#1d2433', '800 17px'); }
          a0 = a1;
        });
        c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(px - pr * 0.3, py - pr * 0.45, pr * 0.45, pr * 0.22, -0.5, 0, Math.PI * 2); c.fill();
        // 손잡이 길 + 10% 눈금 + 생물 눈금(이름은 위·아래로 엇갈려 겹치지 않게)
        N.tube(c, [[g.x0, g.trk], [g.x1, g.trk]], '#5a6a90', 8); N.tube(c, [[g.x0, g.trk], [ax(g, a), g.trk]], '#ffd84d', 8);
        for (let v = 0; v <= 50; v += 10) { const tx = ax(g, v); c.fillStyle = 'rgba(200,212,240,.55)'; c.fillRect(tx - 1, g.trk + 9, 2, 7); P.txt(c, `${v}%`, tx, g.trk + 30, '#8a93a8', '600 12px'); }
        MARK.forEach((m, j) => {
          const mx = ax(g, m.v), on = hit.has(m.n), col = on ? '#5cc77a' : '#c8d4f0', up = j === 0;
          c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.moveTo(mx, g.trk + (up ? -10 : 10)); c.lineTo(mx, g.trk + (up ? -24 : 24)); c.stroke();
          P.txt(c, `${m.n} ${m.v}%`, mx, up ? g.trk - 30 : g.trk + 46, col, '700 13px');
        });
        const kx = ax(g, a); N.ball(c, kx, g.trk, 15 + (moved ? 0 : Math.sin(t * 4) * 2), '#ffd84d'); P.txt(c, 'A', kx - 1, g.trk + 5, '#1d2433', '800 14px');
        P.txt(c, '← 아데닌(A) 비율 손잡이를 끌자 →', (g.x0 + g.x1) / 2, g.trk + 68, '#ffd84d', '700 13px');
        // 서열 두 줄: 윤기 나는 글자 조각 + 사이 수소 결합
        c.fillStyle = 'rgba(255,255,255,.04)'; c.beginPath(); c.roundRect(10, g.s1 - 48, W - 20, g.s2 - g.s1 + 82, 12); c.fill();
        P.txt(c, '한 가닥(직접 쓰기)', 22, g.s1 - 30, '#c8d4f0', '700 13px', 'left'); P.txt(c, '짝 가닥(저절로)', 22, g.s2 + 40, '#c8d4f0', '700 13px', 'left');
        const sx = (i) => 30 + i * (g.cw + 4) + g.cw / 2;
        for (let i = 0; i < MAXN; i++) {
          const k = top[i];
          [[g.s1, k], [g.s2, k && MATE[k]]].forEach(([y, q], r) => {
            if (q) N.card(c, sx(i), y, g.cw, 34, B[q], q, '800 16px');
            else { c.strokeStyle = r ? 'rgba(200,212,240,.15)' : 'rgba(255,216,77,.4)'; c.setLineDash([4, 4]); c.lineWidth = 1.5; c.strokeRect(sx(i) - g.cw / 2, y - 17, g.cw, 34); c.setLineDash([]); }
          });
          if (k) N.hb(c, sx(i), g.s1 + 19, sx(i), g.s2 - 19, 'AT'.includes(k) ? 2 : 3, 5);
        }
        // 받침
        N.tray(c, W, H, g.trayY - 24);
        KEYS.split('').forEach((k, i) => N.card(c, W * (0.2 + i * 0.2), g.trayY, 56, 32, B[k], k, '800 16px'));
        if (drag && drag.k) N.card(c, drag.x, drag.y, 56, 34, B[drag.k], drag.k, '800 16px');
      },
      down(p) {
        const g = G(S.W, S.H);
        if (Math.abs(p.y - g.trk) < 28 && p.x > g.x0 - 24 && p.x < g.x1 + 24) { drag = { knob: true }; setA((p.x - g.x0) / (g.x1 - g.x0) * 50); return; }
        const i = KEYS.split('').findIndex((_, k) => Math.abs(p.x - S.W * (0.2 + k * 0.2)) < 32 && Math.abs(p.y - g.trayY) < 22);
        if (i >= 0) drag = { k: KEYS[i], x: p.x, y: p.y, sx: p.x, sy: p.y };
      },
      move(p, e, held) {
        if (!held || !drag) return; const g = G(S.W, S.H);
        if (drag.knob) setA((p.x - g.x0) / (g.x1 - g.x0) * 50); else { drag.x = p.x; drag.y = p.y; }
      },
      up(p) {
        if (!drag) return; const d = drag, g = G(S.W, S.H); drag = null;
        // 누르기만 해도, 서열 칸 근처 어디에 놓아도 한 가닥 끝에 붙인다
        if (d.k && (Math.hypot(p.x - d.sx, p.y - d.sy) < 8 || (p.y < g.trayY - 24 && p.y > g.s1 - 60))) push(d.k);
        S.kick();
      },
      key(e) {
        const k = e.key.toUpperCase();
        if (KEYS.includes(k) && e.key.length === 1) { push(k); return true; }
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { setA(a + (e.key === 'ArrowRight' ? 1 : -1)); return true; }
        if (e.key === 'Backspace' && top.length) { top.pop(); stats(); return true; }
        if (e.key === '0') { reset(); return true; }
        return false;
      },
    });
    function reset() { a = 25; top = []; hit.clear(); moved = false; done.clear(); msg = ''; say('노란 손잡이를 끌어 아데닌(A) 비율을 바꿔 보자'); stats(); S.kick(); }
    root.querySelector('.rt-reset')?.addEventListener('click', reset);
    reset();
    root._rt = { setA(v) { setA(v); return stats(); }, seq(s) { [...s.toUpperCase()].forEach((k) => KEYS.includes(k) && push(k)); S.kick(); return stats(); }, info: stats };
    // 자체 검사: 네 비율의 합은 100, A=19 → G=31
    console.assert(Object.values(parts(19)).reduce((x, y) => x + y, 0) === 100 && parts(19).G === 31, 'ratio 비율 규칙');
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Ratio = { mount };
})();
