/* 2-2 3차시 체험 «DNA 사다리 만들기»(교과서 86~87쪽 탐구 DNA 모형 제작 — 보라 당, 빨강 인산, 염기 노랑 A·주황 T·초록 G·파랑 C).
   아래 받침의 뉴클레오타이드 카드(A·T·G·C)를 끌어 판 왼쪽 절반에 놓으면 왼쪽 가닥 끝에 붙어 당–인산 골격(공유 결합)이 자란다.
   판 오른쪽 절반에 놓으면 아직 짝 없는 왼쪽 염기(놓은 높이에서 가장 가까운 것)의 맞은편에 붙는다 — A–T, G–C만 딱 붙고
   가로대에 수소 결합 점선(A–T 2개, G–C 3개 — 참고서 내용)이 생긴다. 틀린 짝은 튕긴다. 오른쪽 가닥은 인산·당 순서가 거꾸로(반대 방향).
   염기쌍 5개 이상이면 «꼬기» 손잡이가 나타나고, 끌면 사다리가 이중 나선처럼 비틀린다(2D 원근).
   키보드: A·T·G·C 왼쪽 가닥에 잇기, Enter 다음 빈자리에 맞는 짝, ←→ 꼬기, Backspace 마지막 빼기, 0 처음부터.
   Ladder.mount(root) → { fit, setActive } · 시험용: root._ld.left('ATGC') · pair() · twist(0~1) · info() */
(function () {
  'use strict';
  const B = { A: '#ffd84d', T: '#f2a03d', G: '#5cc77a', C: '#5aa9f0' }, MATE = { A: 'T', T: 'A', G: 'C', C: 'G' }, HB = { A: 2, T: 2, G: 3, C: 3 };
  const NAME = { A: '아데닌', T: '타이민', G: '구아닌', C: '사이토신' };
  const SUGAR = '#9b6bd6', PHOS = '#e0503f', MAX = 8, KEYS = 'ATGC';
  function mount(root) {
    const stage = root.querySelector('.ld-stage'), now = root.querySelector('.ld-now'), out = root.querySelector('.ld-out'), seqEl = root.querySelector('.ld-seq');
    const P = window.Play;
    let L = [], drag = null, bounce = null, tw = 0, twT = 0, knob = false, t = 0, msg = '';
    const done = new Set();
    const G = (W, H) => {
      // 사다리를 판 높이 가운데에 두고 간격을 넉넉히(11/10 점검: 쌍이 적으면 아래가 텅 빔)
      const trayY = H - 46, bar = [W * 0.3, W * 0.7, H - 96], n = Math.max(L.length, 4), avail = bar[2] - 40 - 96, dy = Math.min(84, avail / (n - 1)), y0 = 96 + (avail - dy * (n - 1)) / 2;
      return { trayY, bar, y0, dy, cx: W * 0.5, half: Math.min(W * 0.2, 150), card: (i) => [W * (0.2 + i * 0.2), trayY] };
    };
    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };
    function stats() {
      const pairs = L.filter((b) => b.r).length, cnt = { A: 0, T: 0, G: 0, C: 0 };
      L.forEach((b) => { cnt[b.l]++; if (b.r) cnt[b.r]++; });
      if (L.length >= 4) done.add(1); if (pairs >= 4) done.add(2); if (pairs >= 5 && twT > 0.75) done.add(3);
      const st = [1, 2, 3].find((k) => !done.has(k)) || 0;
      window.L1.steps(root, st, [...done]); window.L1.done(root, st === 0);
      const nt = st === 1 ? `① 카드를 왼쪽에 끌어 가닥을 잇자 (${L.length}/4)` : st === 2 ? `② 오른쪽에 짝 염기를 끌어 맞추자 (${pairs}/4)` : st === 3 ? (pairs < 5 ? `③ 염기쌍을 5개로 늘리면 꼬기 손잡이가 나온다 (${pairs}/5)` : '③ 아래 손잡이를 끌어 사다리를 꼬자') : '두 가닥이 꼬인 이중 나선';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
      const full = pairs === L.length && L.length > 0;
      seqEl.innerHTML = `<span>왼쪽 가닥 <b>${L.map((b) => b.l).join(' ') || '—'}</b></span><span>오른쪽 가닥 <b>${L.map((b) => b.r || '·').join(' ') || '—'}</b></span>`
        + `<span class="ld-cnt">A ${cnt.A} · T ${cnt.T} · G ${cnt.G} · C ${cnt.C}${full ? ` → <b>A = T, G = C</b>` : ''}</span>`;
      knob = pairs >= 5;
      return { left: L.map((b) => b.l).join(''), right: L.map((b) => b.r || '.').join(''), pairs, tw, cnt };
    }
    function addLeft(k) {
      if (L.length >= MAX) { say(`판이 꽉 찼다(${MAX}쌍) — 실제 DNA는 염기쌍이 수백만~수십억 개`); return false; }
      L.push({ l: k, r: null, born: t, rb: 0 }); window.RxT.jolt(stage, 1);
      say(`<b>${NAME[k]}(${k})</b> 뉴클레오타이드를 이었다 — 앞 뉴클레오타이드의 <b>당</b>과 이것의 <b>인산</b>이 공유 결합해 골격이 자란다`);
      return true;
    }
    function addRight(k, y, g) {
      const open = L.map((b, i) => (b.r ? -1 : i)).filter((i) => i >= 0);
      if (!open.length) { say('맞은편 자리가 모두 찼다 — 왼쪽 가닥을 먼저 늘리자'); return false; }
      const i = y == null ? open[0] : open.reduce((a, b) => (Math.abs(g.y0 + b * g.dy - y) < Math.abs(g.y0 + a * g.dy - y) ? b : a));
      const want = MATE[L[i].l];
      if (k !== want) {
        bounce = { i, a: 1 }; window.RxT.jolt(stage, 1);
        say(`튕겼다! <b>${L[i].l}</b>의 짝은 <b>${want}</b> — 아데닌(A)은 타이민(T)과, 구아닌(G)은 사이토신(C)과만 짝을 이룬다`);
        return false;
      }
      L[i].r = k; L[i].rb = t; window.RxT.jolt(stage, 1);
      say(`<b>${L[i].l}–${k}</b> 짝! 두 염기 사이에 수소 결합 <b>${HB[k]}개</b>(점선). 오른쪽 가닥은 인산·당 순서가 <b>거꾸로</b> 붙는다`);
      return true;
    }
    // 염기쌍 i의 그림 자리: 꼬기 각도에 따라 두 가닥이 축 둘레를 돈다(2D 원근)
    function pos(g, i) {
      const th = tw * i * 0.62, cs = Math.cos(th), z = Math.sin(th), y = g.y0 + i * g.dy;
      return { y, xl: g.cx - g.half * cs, xr: g.cx + g.half * cs, zl: -z, zr: z };
    }
    const N = () => window.NArt;
    // 한 가닥의 뉴클레오타이드: 당(보라 판) + 인산(빨강 구슬). 왼쪽은 인산이 위, 오른쪽은 아래(가닥 방향이 반대)
    function nucleo(c, x, y, side, s, dy) {
      N().ball(c, x, y + (side < 0 ? -dy * 0.5 : dy * 0.5), 6.5 * s, N().COL.P);
      N().pent(c, x, y, 11 * s, N().COL.S);
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; tw += (twT - tw) * Math.min(1, dt * 6);
        const g = G(W, H);
        N().bg(c, W, H);
        if (tw < 0.05) { // 판 안내: 왼쪽·오른쪽 절반
          c.fillStyle = 'rgba(255,255,255,.03)'; c.fillRect(0, 50, g.cx, g.trayY - 80);
          P.txt(c, '← 여기 놓으면 왼쪽 가닥', W * 0.2, g.trayY - 48, 'rgba(200,212,240,.6)', '700 14px');
          P.txt(c, '여기 놓으면 짝 염기 →', W * 0.8, g.trayY - 48, 'rgba(200,212,240,.6)', '700 14px');
          if (L.length) { const ly = pos(g, L.length - 1).y + 30; P.txt(c, '인산 → 당 ↓', g.cx - g.half, ly, '#c8d4f0', '700 13px'); P.txt(c, '당 → 인산 ↓', g.cx + g.half, ly, '#c8d4f0', '700 13px'); }
        }
        // 골격(공유 결합): 당과 다음 인산을 잇는 둥근 관
        [-1, 1].forEach((side) => {
          let seg = [];
          const flush = () => { if (seg.length > 1) N().tube(c, seg, '#c3b2ec', 6); seg = []; };
          L.forEach((b, i) => { if (side > 0 && !b.r) { flush(); return; } const p = pos(g, i); seg.push([side < 0 ? p.xl : p.xr, p.y]); });
          flush();
        });
        // 염기쌍 — 뒤쪽 먼저(깊이 순서). 앞쪽은 크고 밝게, 뒤쪽은 작고 어둡게
        const order = L.map((_, i) => i).sort((a, b) => pos(g, a).zl - pos(g, b).zl);
        order.forEach((i) => {
          const b = L[i], p = pos(g, i), m = (p.xl + p.xr) / 2, sl = 1 + 0.22 * p.zl, sr = 1 + 0.22 * p.zr;
          const grow = Math.min(1, (t - b.born) / 0.3), h = 22 * (sl + sr) / 2, lab = tw < 0.3;
          const dirL = Math.sign(m - p.xl) || 1, lenL = Math.max(4, Math.abs(m - p.xl) - 9);
          c.globalAlpha = 0.72 + 0.28 * (p.zl + 1) / 2;
          N().base(c, p.xl + dirL * 8, p.y, (lenL - 8) * grow, h, b.l, dirL, lab && grow > 0.9 ? b.l : null);
          if (b.r) {
            const gr = Math.min(1, (t - b.rb) / 0.3), dirR = -dirL;
            c.globalAlpha = 0.72 + 0.28 * (p.zr + 1) / 2;
            N().base(c, p.xr + dirR * 8, p.y, (lenL - 8) * gr, h, b.r, dirR, lab && gr > 0.9 ? b.r : null);
            c.globalAlpha = 1; if (gr >= 1) N().hb(c, m - 9, p.y, m + 9, p.y, HB[b.l], 4.5 * sl);
          } else if (tw < 0.05) { c.globalAlpha = 1; c.strokeStyle = 'rgba(255,216,77,.45)'; c.setLineDash([5, 5]); c.lineWidth = 2; c.strokeRect(m + 4, p.y - 11, p.xr - m - 12, 22); c.setLineDash([]); }
          c.globalAlpha = 0.75 + 0.25 * (p.zl + 1) / 2; nucleo(c, p.xl, p.y, -1, sl, g.dy);
          if (b.r) { c.globalAlpha = 0.75 + 0.25 * (p.zr + 1) / 2; nucleo(c, p.xr, p.y, 1, sr, g.dy); }
          c.globalAlpha = 1;
        });
        if (bounce) { const p = pos(g, bounce.i); c.strokeStyle = `rgba(239,91,76,${bounce.a})`; c.lineWidth = 4; c.beginPath(); c.arc(p.xr, p.y, 40 * (2 - bounce.a), 0, Math.PI * 2); c.stroke(); bounce.a -= dt * 1.5; if (bounce.a <= 0) bounce = null; }
        // 꼬기 손잡이
        if (knob) {
          const [x0, x1, by] = g.bar, kx = x0 + (x1 - x0) * twT;
          N().tube(c, [[x0, by], [x1, by]], '#5a6a90', 7); N().tube(c, [[x0, by], [kx, by]], '#ffd84d', 7);
          N().ball(c, kx, by, 14, '#ffd84d'); P.txt(c, '꼬기 ↻', kx, by - 22, '#ffd84d', '800 14px');
          P.txt(c, '사다리', x0 - 34, by + 5, '#c8d4f0', '700 13px'); P.txt(c, '이중 나선', x1 + 40, by + 5, '#c8d4f0', '700 13px');
        }
        // 받침
        N().tray(c, W, H, g.trayY - 30);
        [...KEYS].forEach((k, i) => { const [x, y] = g.card(i); c.globalAlpha = drag && drag.k === k ? 0.35 : 1; N().card(c, x, y, 124, 42, B[k], `${k} ${NAME[k]}`, "800 19px"); c.globalAlpha = 1; });
        if (drag && drag.k) N().card(c, drag.x, drag.y, 64, 36, B[drag.k], drag.k, '800 18px');
      },
      down(p) {
        const g = G(S.W, S.H);
        if (knob && Math.abs(p.y - g.bar[2]) < 26 && p.x > g.bar[0] - 24 && p.x < g.bar[1] + 24) { drag = { knob: true }; return; }
        const i = [...KEYS].findIndex((_, k) => { const [x, y] = g.card(k); return Math.abs(p.x - x) < 62 && Math.abs(p.y - y) < 26; });
        if (i >= 0) drag = { k: KEYS[i], x: p.x, y: p.y };
      },
      move(p, e, held) {
        if (!held || !drag) return;
        if (drag.knob) { const g = G(S.W, S.H); twT = Math.max(0, Math.min(1, (p.x - g.bar[0]) / (g.bar[1] - g.bar[0]))); stats(); return; }
        drag.x = p.x; drag.y = p.y;
      },
      up(p) {
        if (!drag) return; const d = drag; drag = null;
        if (d.knob) { stats(); if (twT > 0.75) say('두 가닥이 꼬여 <b>이중 나선</b> — 당과 인산은 바깥, 염기쌍은 안쪽에 계단처럼 놓인다'); return; }
        const g = G(S.W, S.H);
        if (p.y > g.trayY - 30) return; // 받침에 도로 놓음
        if (tw > 0.05) { twT = 0; tw = 0; } // 꼰 채로 손대면 사다리로 펴서 잇는다
        if (!L.length || p.x < g.cx) addLeft(d.k); else addRight(d.k, p.y, g);
        stats();
      },
      key(e) {
        const k = e.key.toUpperCase();
        if (KEYS.includes(k) && e.key.length === 1) { addLeft(k); stats(); return true; }
        if (e.key === 'Enter') { const b = L.find((q) => !q.r); if (b) addRight(MATE[b.l], null, G(S.W, S.H)); stats(); return true; }
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { if (knob) { twT = Math.max(0, Math.min(1, twT + (e.key === 'ArrowRight' ? 0.1 : -0.1))); stats(); } return true; }
        if (e.key === 'Backspace' && L.length) { L.pop(); stats(); return true; }
        if (e.key === '0') { reset(); return true; }
        return false;
      },
    });
    function reset() { L = []; tw = 0; twT = 0; done.clear(); msg = ''; say('받침의 뉴클레오타이드 카드를 끌어 판 왼쪽에 놓자'); stats(); S.kick(); }
    root.querySelector('.ld-reset')?.addEventListener('click', reset);
    reset();
    root._ld = {
      left(s) { [...s.toUpperCase()].forEach((k) => KEYS.includes(k) && addLeft(k)); S.kick(); return stats(); },
      pair() { L.forEach((b) => { if (!b.r) { b.r = MATE[b.l]; b.rb = t; } }); S.kick(); return stats(); },
      twist(v) { twT = Math.max(0, Math.min(1, v)); tw = twT; stats(); S.kick(); return stats(); },
      info: stats,
    };
    console.assert(MATE[MATE.A] === 'A' && MATE[MATE.G] === 'G', 'ladder 짝 규칙');
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Ladder = { mount };
})();
