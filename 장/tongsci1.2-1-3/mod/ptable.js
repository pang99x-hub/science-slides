/* 2-1 3차시 이론 «주기율표 읽기»(교과서 60~61쪽). 118개 원소가 든 주기율표(색 = 금속·비금속·준금속, 굵은 테 = 실온에서 기체, 점선 = 액체).
   돋보기를 끌고 다니면 그 칸의 가로줄(주기)과 세로줄(족)이 함께 밝아지고, 돋보기 속에 원자 번호·기호·이름·상태가 크게 보인다.
   왼쪽 정의 상자(.lv-row[data-k=m|n|x])가 돋보기 아래 원소의 무리와 함께 밝아진다. Ptable.mount(root) → { fit, setActive } · 시험용: root._pt.at(z) */
(function () {
  'use strict';
  const KC = { m: '#cfe2ff', n: '#fff1a8', x: '#c8f0cf', u: '#e3e5ea' }, KN = { m: '금속', n: '비금속', x: '준금속', u: '아직 분류 안 됨' }, STN = { s: '고체', l: '액체', g: '기체' };
  function mount(root) {
    const stage = root.querySelector('.pt-stage'), out = root.querySelector('.pt-out'), now = root.querySelector('.pt-now'), rows = [...root.querySelectorAll('.lv-row')];
    const P = window.Play, E = () => window.Elem;
    let lens = null, cur = null, msg = ''; const seen = new Set();
    const G = (W, H) => { const cw = (W - 50) / 18, ch = Math.min(cw * 1.1, (H - 40) / 9.9); return { cw, ch, x0: 34, y0: 26 }; };
    const cell = (g, e) => { const [col, row] = E().pos(e); return [g.x0 + (col - 1) * g.cw, g.y0 + (row - 1) * g.ch]; };
    function pick(e) {
      if (!e || e === cur) return; cur = e; seen.add(e.k); if (e.g) { seen.add('g' + e.g); }
      rows.forEach((r) => r.classList.toggle('on', r.dataset.k === e.k));
      const h = `<b>${e.z} ${e.s} ${e.n}</b> · ${e.p}주기${e.g ? ` ${e.g}족` : '(란타넘족·악티늄족)'} · ${KN[e.k]} · 실온 ${STN[e.st]}${e.z === 1 ? ' <small>1족이지만 비금속 — 알칼리 금속이 아니다</small>' : e.z === 6 ? ' <small>비금속이지만 흑연은 전기가 통한다</small>' : ''}`;
      if (h !== msg) { msg = h; out.innerHTML = h; }
    }
    const S = P.make(stage, {
      draw(c, W, H) {
        const g = G(W, H);
        c.fillStyle = '#fbfaf5'; c.fillRect(0, 0, W, H);
        if (cur && cur.g) { c.fillStyle = 'rgba(255,216,77,.28)'; c.fillRect(g.x0 + (cur.g - 1) * g.cw, g.y0, g.cw, g.ch * 7); c.fillRect(g.x0, g.y0 + (cur.p - 1) * g.ch, g.cw * 18, g.ch); }
        E().all.forEach((e) => {
          const [x, y] = cell(g, e);
          c.fillStyle = KC[e.k]; c.fillRect(x + 1, y + 1, g.cw - 2, g.ch - 2);
          c.strokeStyle = '#1d2433'; c.lineWidth = e.st === 'g' ? 2.5 : 1; if (e.st === 'l') c.setLineDash([3, 3]); c.strokeRect(x + 1, y + 1, g.cw - 2, g.ch - 2); c.setLineDash([]);
          P.txt(c, e.s, x + g.cw / 2, y + g.ch * 0.66, '#1d2433', `700 ${Math.round(g.cw * 0.36)}px`);
        });
        for (let k = 1; k <= 18; k++) P.txt(c, String(k), g.x0 + (k - 0.5) * g.cw, g.y0 - 6, '#4a5468', '600 13px');
        for (let k = 1; k <= 7; k++) P.txt(c, String(k), g.x0 - 14, g.y0 + (k - 0.4) * g.ch, '#4a5468', '600 13px');
        P.txt(c, '족 →', g.x0 + 18.4 * g.cw, g.y0 - 6, '#4a5468', '700 13px', 'left');
        // 돋보기
        const L = lens || { x: g.x0 + 10.5 * g.cw, y: g.y0 + 5.2 * g.ch };
        const e = E().all.find((q) => { const [x, y] = cell(g, q); return L.x >= x && L.x < x + g.cw && L.y >= y && L.y < y + g.ch; });
        if (e) pick(e);
        const R = Math.min(70, g.cw * 1.9);
        c.fillStyle = 'rgba(255,255,255,.95)'; c.strokeStyle = '#1d2433'; c.lineWidth = 5; c.beginPath(); c.arc(L.x + R * 0.9, L.y - R * 0.9, R, 0, Math.PI * 2); c.fill(); c.stroke();
        c.lineWidth = 8; c.beginPath(); c.moveTo(L.x + R * 0.25, L.y - R * 0.25); c.lineTo(L.x, L.y); c.stroke();
        if (cur) { const cx = L.x + R * 0.9, cy = L.y - R * 0.9; c.fillStyle = KC[cur.k]; c.beginPath(); c.arc(cx, cy, R - 6, 0, Math.PI * 2); c.fill(); P.txt(c, String(cur.z), cx, cy - R * 0.45, '#4a5468', '700 15px'); P.txt(c, cur.s, cx, cy + 8, '#1d2433', '800 30px'); P.txt(c, cur.n, cx, cy + R * 0.5, '#1d2433', '700 15px'); }
        const st = !seen.has('n') || !seen.has('m') ? 1 : !seen.has('g1') || !seen.has('g17') ? 2 : 0;
        const nt = st === 1 ? '① 돋보기를 끌어 금속과 비금속을 찾아보자' : st === 2 ? '② 1족과 17족에도 가 보자' : '같은 세로줄(족) = 성질이 비슷한 무리';
        if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
      },
      down(p) { lens = p; }, move(p, e, held) { if (held) lens = p; },
      key(e) { const g = G(S.W, S.H), L = lens || { x: g.x0 + 10.5 * g.cw, y: g.y0 + 5.2 * g.ch }; const d = { ArrowLeft: [-g.cw, 0], ArrowRight: [g.cw, 0], ArrowUp: [0, -g.ch], ArrowDown: [0, g.ch] }[e.key]; if (d) { lens = { x: L.x + d[0], y: L.y + d[1] }; return true; } return false; },
    });
    root._pt = { at: (z) => { const g = G(S.W, S.H), [x, y] = E().pos(E().get(z)); lens = { x: g.x0 + (x - 0.5) * g.cw, y: g.y0 + (y - 0.5) * g.ch }; S.kick(); } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Ptable = { mount };
})();
