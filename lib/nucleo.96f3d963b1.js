/* 2-2 3차시 체험 «뉴클레오타이드 조립»(교과서 84쪽 그림 Ⅱ-30 · 측주 DNA와 RNA).
   가운데 빈 틀(인산 동그라미 · 당 오각형 · 염기 네모). 아래 받침의 조각(인산, 당 두 종류 디옥시라이보스·라이보스,
   염기 A·G·C·T·U)을 끌어 판 위 어디에 놓아도 조각 모양에 맞는 자리로 붙는다. 셋이 다 차면 결합선이 생기고
   완성품이 오른쪽 «만든 것» 칸으로 날아간다. 디옥시라이보스+U, 라이보스+T는 튕긴다(DNA에는 T, RNA에는 U).
   만든 종류를 센다(DNA용 4 + RNA용 4 = 8종 — 참고서 내용).
   키보드: P 인산, D·R 당, A·G·C·T·U 염기, 0 처음부터.
   Nucleo.mount(root) → { fit, setActive } · 시험용: root._nu.make('d'|'r', 'A') · count() */
(function () {
  'use strict';
  const SUG = { d: '#8a5ad0', r: '#c9a2f0' }; // 디옥시라이보스 짙은 보라, 라이보스 연보라
  const NAME = { A: '아데닌', G: '구아닌', C: '사이토신', T: '타이민', U: '유라실', d: '디옥시라이보스', r: '라이보스' };
  const PIECES = [{ k: 'p', s: 'p' }, { k: 'd', s: 's' }, { k: 'r', s: 's' }, ...'AGCTU'.split('').map((b) => ({ k: b, s: 'b' }))];

  function mount(root) {
    const stage = root.querySelector('.nu-stage'), now = root.querySelector('.nu-now'), out = root.querySelector('.nu-out');
    const P = window.Play;
    let slot = { p: null, s: null, b: null }, shown = null, made = [], flying = [], drag = null, bounce = null, msg = '', t = 0;
    const kinds = new Set(), ok = new Set();
    const G = (W, H) => ({ cx: W * 0.36, cy: H * 0.4, u: Math.min(W, H) * 0.13, trayY: H - 48, trayX: (i) => W * (0.07 + i * 0.123), shelf: [W * 0.78, H * 0.08, W * 0.2, H * 0.68] });
    const pos = (g, s) => s === 'p' ? [g.cx - g.u * 1.9, g.cy - g.u * 1.1] : s === 's' ? [g.cx - g.u * 0.2, g.cy] : [g.cx + g.u * 1.0, g.cy];
    function say(h) { if (h !== msg) { msg = h; out.innerHTML = h; } }
    // 조각 그림: 인산 = 광택 빨강 구슬, 당 = 입체 오각형 판, 염기 = 오른쪽으로 뻗은 퍼즐 조각(끝 모양이 짝과 맞물림)
    function drawPiece(c, k, x, y, u, a = 1) {
      const N = window.NArt; c.globalAlpha = a;
      if (k === 'p') { N.ball(c, x, y, u * 0.55, N.COL.P); P.txt(c, 'P', x - u * 0.06, y + 5, '#fff', `800 ${Math.round(u * 0.42)}px`); }
      else if (k === 'd' || k === 'r') { N.pent(c, x, y, u * 0.72, SUG[k]); P.txt(c, k === 'd' ? '디옥시' : '라이보스', x, y + 5, '#fff', `800 ${Math.round(Math.max(11, u * 0.26))}px`); }
      else N.base(c, x - u * 0.15, y, u * 1.5, u * 0.78, k, 1, k);
      c.globalAlpha = 1;
    }
    function steps() {
      const st = [1, 2, 3].find((k) => !ok.has(k)) || 0;
      window.L1.steps(root, st, [...ok]); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 인산·당·염기를 하나씩 끌어 틀에 놓자' : st === 2 ? '② DNA용과 RNA용을 하나씩 만들자' : st === 3 ? `③ 서로 다른 종류 다섯 이상 (지금 ${kinds.size}종)` : `뉴클레오타이드 ${kinds.size}종 — 최대 8종`;
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    function put(k) {
      const s = k === 'p' ? 'p' : k === 'd' || k === 'r' ? 's' : 'b';
      const sugar = s === 's' ? k : slot.s, base = s === 'b' ? k : slot.b;
      if (sugar && base && ((sugar === 'd' && base === 'U') || (sugar === 'r' && base === 'T'))) {
        const g = G(S.W, S.H), [x, y] = pos(g, s); bounce = { x, y, a: 1 }; window.RxT.jolt(stage, 1);
        say(sugar === 'd' ? '튕겼다! 디옥시라이보스는 <b>DNA</b>의 당 — DNA에는 유라실(U)이 없고 <b>타이민(T)</b>이 있다' : '튕겼다! 라이보스는 <b>RNA</b>의 당 — RNA에는 타이민(T)이 없고 <b>유라실(U)</b>이 있다');
        return false;
      }
      slot[s] = k; shown = null;
      if (slot.p && slot.s && slot.b) finish();
      else say(`${s === 'p' ? '인산' : s === 's' ? `당(${NAME[k]})` : `염기 ${NAME[k]}(${k})`} 자리 완료 — ${[!slot.p && '인산', !slot.s && '당', !slot.b && '염기'].filter(Boolean).join('·')}을(를) 채우자`);
      return true;
    }
    function finish() {
      const key = slot.s + slot.b, dna = slot.s === 'd';
      kinds.add(key); made.push(key); ok.add(1); if ([...kinds].some((k) => k[0] === 'd') && [...kinds].some((k) => k[0] === 'r')) ok.add(2); if (kinds.size >= 5) ok.add(3);
      say(`뉴클레오타이드 완성 — <b>${dna ? 'DNA' : 'RNA'}용</b>(당 ${NAME[slot.s]} + 염기 ${NAME[slot.b]}). 인산 : 당 : 염기 = 1 : 1 : 1 · 지금까지 ${kinds.size}종`);
      flying.push({ ...slot, f: 0, i: made.length - 1 }); shown = { ...slot }; slot = { p: null, s: null, b: null }; steps();
    }
    function shelfPos(g, i) { const [x, y, w] = g.shelf; return [x + w * 0.48, y + 46 + i * 34]; }
    function mini(c, x, y, sl, u) { drawPiece(c, sl.p, x - u * 0.8, y - u * 0.25, u * 0.4); drawPiece(c, sl.s, x - u * 0.25, y, u * 0.4); drawPiece(c, sl.b, x + u * 0.2, y, u * 0.4); }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const g = G(W, H);
        window.NArt.bg(c, W, H);
        // 틀: 결합 막대(둥근 관) + 빈 자리 점선
        const [px, py] = pos(g, 'p'), [sx, sy] = pos(g, 's'), [bx, by] = pos(g, 'b');
        window.NArt.tube(c, [[px, py], [sx, sy]], (slot.p && slot.s) || shown ? '#d8cdf2' : '#5a6a90', 6);
        window.NArt.tube(c, [[sx, sy], [bx - g.u * 0.1, by]], (slot.s && slot.b) || shown ? '#d8cdf2' : '#5a6a90', 6);
        c.setLineDash([6, 5]); c.strokeStyle = 'rgba(200,212,240,.65)'; c.lineWidth = 2;
        if (!slot.p && !shown) { c.beginPath(); c.arc(px, py, g.u * 0.58, 0, Math.PI * 2); c.stroke(); P.txt(c, '인산 자리', px, py - g.u * 0.8, 'rgba(200,212,240,.85)', '700 14px'); }
        if (!slot.s && !shown) { c.beginPath(); for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i / 5 * Math.PI * 2; c[i ? 'lineTo' : 'moveTo'](sx + Math.cos(a) * g.u * 0.75, sy + Math.sin(a) * g.u * 0.75); } c.closePath(); c.stroke(); P.txt(c, '당 자리', sx, sy + g.u * 1.15, 'rgba(200,212,240,.85)', '700 14px'); }
        if (!slot.b && !shown) { c.strokeRect(bx - g.u * 0.15, by - g.u * 0.41, g.u * 1.5, g.u * 0.82); P.txt(c, '염기 자리', bx + g.u * 0.6, by + g.u * 0.95, 'rgba(200,212,240,.85)', '700 14px'); }
        c.setLineDash([]);
        const v = shown || slot; // 막 완성한 뉴클레오타이드는 다음 조각을 놓을 때까지 틀에 남겨 둔다
        if (v.p) drawPiece(c, v.p, px, py, g.u); if (v.s) drawPiece(c, v.s, sx, sy, g.u); if (v.b) drawPiece(c, v.b, bx, by, g.u);
        if (shown) P.txt(c, `완성 — ${shown.s === 'd' ? 'DNA' : 'RNA'}용 뉴클레오타이드(${NAME[shown.b]})`, g.cx, g.cy - g.u * 2.1, '#ffd84d', '800 17px');
        P.txt(c, '판 위 어디에 놓아도 맞는 자리로 붙는다', g.cx, g.cy + g.u * 2.3, 'rgba(200,212,240,.6)', '600 13px');
        // 만든 것 칸
        const [x0, y0, w0, h0] = g.shelf; c.fillStyle = 'rgba(22,32,63,.85)'; c.strokeStyle = 'rgba(160,190,255,.25)'; c.lineWidth = 1.5; c.beginPath(); c.roundRect(x0, y0, w0, h0, 12); c.fill(); c.stroke();
        P.txt(c, `만든 것 ${kinds.size}종`, x0 + w0 / 2, y0 + 22, '#ffd84d', '800 15px');
        [...kinds].slice(0, 8).forEach((k, i) => { const [x, y] = shelfPos(g, i); mini(c, x, y, { p: 'p', s: k[0], b: k[1] }, g.u * 0.62); });
        flying = flying.filter((f) => { f.f += dt * 1.6; const [tx, ty] = shelfPos(g, Math.min(7, [...kinds].indexOf(f.s + f.b))); const e = Math.min(1, f.f); mini(c, sx + (tx - sx) * e, sy + (ty - sy) * e, f, g.u * (1.6 - 0.85 * e)); return f.f < 1; });
        // 받침
        window.NArt.tray(c, W, H, g.trayY - 46);
        PIECES.forEach((q, i) => drawPiece(c, q.k, g.trayX(i) - (q.s === 'b' ? g.u * 0.3 : 0), g.trayY, g.u * 0.56));
        if (drag) drawPiece(c, drag.k, drag.x, drag.y, g.u, 0.85);
        if (bounce) { c.strokeStyle = `rgba(239,91,76,${bounce.a})`; c.lineWidth = 4; c.beginPath(); c.arc(bounce.x, bounce.y, g.u * (2 - bounce.a), 0, Math.PI * 2); c.stroke(); bounce.a -= dt * 1.5; if (bounce.a <= 0) bounce = null; }
      },
      down(p) { const g = G(S.W, S.H); const i = PIECES.findIndex((_, k) => Math.abs(p.x - g.trayX(k)) < g.u * 0.62 && Math.abs(p.y - g.trayY) < g.u * 0.62); if (i >= 0) drag = { k: PIECES[i].k, x: p.x, y: p.y }; },
      move(p, e, held) { if (held && drag) { drag.x = p.x; drag.y = p.y; } },
      up(p) { if (!drag) return; const g = G(S.W, S.H); if (p.y < g.trayY - 48 && p.x < g.shelf[0]) put(drag.k); drag = null; },
      key(e) {
        const m = { p: 'p', P: 'p', d: 'd', D: 'd', r: 'r', R: 'r' }[e.key] || ('AGCTU'.includes(e.key.toUpperCase()) && e.key.length === 1 ? e.key.toUpperCase() : null);
        if (m) { put(m); return true; } if (e.key === '0') { reset(); return true; } return false;
      },
    });
    function reset() { slot = { p: null, s: null, b: null }; shown = null; made = []; flying = []; kinds.clear(); ok.clear(); msg = ''; say('받침의 조각을 끌어 가운데 틀에 놓자 — 인산 하나, 당 하나, 염기 하나'); steps(); S.kick(); }
    root.querySelector('.nu-reset')?.addEventListener('click', reset);
    root._nu = { make(s, b) { put('p'); put(s); const r = put(b); S.kick(); return r; }, count: () => kinds.size };
    reset();
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Nucleo = { mount };
})();
