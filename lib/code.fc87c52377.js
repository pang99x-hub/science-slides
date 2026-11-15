/* 2-2 3차시 표지 «네 글자 암호»(교과서 84~85쪽: DNA는 네 가지 염기의 순서에 유전 정보를 담는다).
   아래 받침의 염기 카드 A·T·G·C를 끌어 위쪽 판 어디에 놓아도 윗가닥 끝에 차례로 붙는다.
   그러면 아랫가닥 쪽에서 짝 염기(A↔T, G↔C)가 미끄러져 와 붙고 사이에 가로대가 생긴다(사다리).
   글자 수 n이 늘 때마다 «이 길이로 만들 수 있는 서열 4ⁿ가지»가 커진다(10글자면 약 100만).
   키보드: A·T·G·C 키로 붙이기, Backspace 빼기, 0 처음부터.
   Code4.mount(root) → { fit, setActive } · 시험용: root._cx.type('ATGC…') · state() */
(function () {
  'use strict';
  const PAIR = { A: 'T', T: 'A', G: 'C', C: 'G' };
  const KEYS = 'ATGC', MAX = 12;
  const big = (n) => { const v = 4 ** n; return v >= 1e8 ? `약 ${Math.round(v / 1e8)}억` : v >= 1e4 ? `약 ${Math.round(v / 1e4).toLocaleString()}만` : v.toLocaleString(); };

  function mount(root) {
    const stage = root.querySelector('.cx-stage'), now = root.querySelector('.cx-now');
    const P = window.Play;
    let S0 = [], drag = null, t = 0;
    const G = (W, H) => {
      const cw = Math.min(48, (W - 90) / MAX), x0 = (W - cw * MAX) / 2 + cw / 2 + 18;
      return { cw, x: (i) => x0 + i * cw, yTop: H * 0.24, yBot: H * 0.64, trayY: H - 34, trayX: (k) => W * (0.2 + k * 0.2) };
    };
    function add(b) { if (S0.length >= MAX) return; const g = G(S.W || 600, S.H || 430); S0.push({ b, born: t, px: g.x(S0.length) + 160 }); }
    const A = () => window.NArt;
    function card(c, x, y, w, b, a = 1) { c.globalAlpha = a; A().card(c, x, y, w - 6, 36, A().COL[b], b, '800 20px'); c.globalAlpha = 1; }
    // 세로로 선 염기 조각: 골격 y0에서 dir(+1 아래, −1 위) 쪽으로 len만큼
    function vbase(c, x, y0, len, w, b, dir, a = 1) {
      c.globalAlpha = a; c.save(); c.translate(x, y0); c.rotate(Math.PI / 2); A().base(c, 0, 0, len, w, b, dir, null); c.restore();
      window.Play.txt(c, b, x, y0 + dir * len * 0.42 + 7, '#1d2433', '800 18px'); c.globalAlpha = 1;
    }
    function chip() {
      const n = S0.length;
      const nt = !n ? '아래 염기 카드를 끌어 위 판에 놓자' : n < 4 ? '짝 염기가 저절로 붙는다 — 몇 글자 더' : `${n}글자 서열은 ${big(n)}가지`;
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', n >= 4); }
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const g = G(W, H);
        A().bg(c, W, H);
        const n0 = S0.length, mid = (g.yTop + g.yBot) / 2, len = mid - g.yTop - 13, bw = g.cw * 0.72;
        // 당-인산 골격 두 줄: 둥근 관 + 당(보라 판)·인산(빨강 구슬)
        [[g.yTop, 1], [g.yBot, -1]].forEach(([y, side]) => {
          if (!n0) return;
          const xs = S0.map((s, i) => (side > 0 ? s.px : g.x(i)));
          A().tube(c, [[xs[0] - g.cw * 0.5, y], [xs[n0 - 1] + g.cw * 0.5, y]], '#b9a6e6', 7);
          xs.forEach((x, i) => { A().pent(c, x, y, g.cw * 0.24, A().COL.S); if (i < n0 - 1 || side > 0) A().ball(c, x + g.cw / 2, y, g.cw * 0.13, A().COL.P); });
        });
        S0.forEach((s, i) => {
          const x = g.x(i); s.px += (x - s.px) * Math.min(1, dt * 10);
          const k = Math.min(1, Math.max(0, (t - s.born - 0.25) / 0.6)); // 짝 염기가 미끄러져 오는 정도
          const ease = 1 - (1 - k) ** 3;
          vbase(c, s.px, g.yTop + g.cw * 0.22, len - g.cw * 0.22, bw, s.b, 1);
          if (k > 0) {
            const off = (1 - ease) * 120;
            vbase(c, x, g.yBot - g.cw * 0.22 + off, len - g.cw * 0.22, bw, PAIR[s.b], -1, 0.4 + 0.6 * ease);
            if (k >= 1) A().hb(c, x, mid - 9, x, mid + 9, 'AT'.includes(s.b) ? 2 : 3, 6);
          }
        });
        P.txt(c, '윗가닥', 10, g.yTop + 5, 'rgba(200,212,240,.75)', '700 13px', 'left');
        P.txt(c, '짝 가닥', 10, g.yBot + 5, 'rgba(200,212,240,.75)', '700 13px', 'left');
        const n = S0.length;
        if (n) { P.txt(c, `${n}글자 → 만들 수 있는 서열 ${big(n)}가지 (4ⁿ)`, W / 2, g.trayY - 46, '#ffd84d', '800 19px'); }
        else P.txt(c, 'A는 T와, G는 C와만 짝을 짓는다 — 모양이 맞물린다', W / 2, H * 0.4, 'rgba(200,212,240,.85)', '700 17px');
        // 받침
        A().tray(c, W, H, g.trayY - 30);
        KEYS.split('').forEach((b, k) => card(c, g.trayX(k), g.trayY, 58, b));
        if (drag) card(c, drag.x, drag.y, 58, drag.b, 0.9);
        chip();
      },
      down(p) { const g = G(S.W, S.H); const k = KEYS.split('').findIndex((_, i) => Math.abs(p.x - g.trayX(i)) < 34 && Math.abs(p.y - g.trayY) < 26); if (k >= 0) drag = { b: KEYS[k], x: p.x, y: p.y }; },
      move(p, e, held) { if (held && drag) { drag.x = p.x; drag.y = p.y; } },
      up(p) { if (!drag) return; const g = G(S.W, S.H); if (p.y < g.trayY - 34) add(drag.b); drag = null; },
      key(e) {
        const b = e.key.toUpperCase(); if (KEYS.includes(b) && b.length === 1) { add(b); return true; }
        if (e.key === 'Backspace') { S0.pop(); return true; }
        if (e.key === '0') { S0 = []; return true; }
        return false;
      },
    });
    root._cx = { type(s) { [...s.toUpperCase()].filter((b) => KEYS.includes(b)).forEach(add); S.kick(); return S0.length; }, state: () => ({ n: S0.length, top: S0.map((s) => s.b).join(''), bottom: S0.map((s) => PAIR[s.b]).join('') }) };
    console.assert(PAIR[PAIR.G] === 'G' && big(10).startsWith('약 105'), 'code4: 짝 규칙·4ⁿ');
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Code4 = { mount };
})();
