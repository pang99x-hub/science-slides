/* 3-1 3차시 체험 «판을 움직이는 힘»(교과서 113쪽 판 구조론 · 참고서 139~140쪽 판 이동의 원동력).
   지구 단면 한 조각: 위 암석권 판 셋(왼판·가운데판·오른판), 아래 연약권·맨틀(붉은 그러데이션), 바닥 외핵 쪽 열.
   바닥 열 손잡이를 끌어 세게 하면 맨틀 알갱이가 두 고리로 돌고(상승부 x=0.3, 하강부 x=0.75),
   위의 판이 끌려가 상승부 위는 벌어져 마그마가 새 지각을 만들고, 하강부 위는 부딪혀 한쪽이 가라앉고 산이 솟는다.
   속도·크기는 이해를 돕기 위한 그림. Convect.mount(root) → { fit, setActive } · 시험용: root._cv.heat(0~1) · tap('up'|'down') · state() */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const UP = 0.3, DOWN = 0.75, TOP = 0.27, BOT = 0.88; // 상승부·하강부 x, 맨틀 위·아래 y
  // 대류 고리 두 개: 가운데 고리(상승부 → 하강부, 위에서 오른쪽으로), 바깥 고리(화면 끝을 넘어 이어짐, 위에서 왼쪽으로)
  const CELLS = [{ cx: (UP + DOWN) / 2, rx: (DOWN - UP) / 2, sgn: 1 }, { cx: (DOWN + 1 + UP) / 2, rx: (1 + UP - DOWN) / 2, sgn: -1 }];
  const cellPt = (cl, th, r) => [(((cl.cx + cl.rx * r * Math.cos(th)) % 1) + 1) % 1, (TOP + BOT) / 2 + (BOT - TOP) / 2 * r * Math.sin(th)];
  // 자체 확인: 가운데 고리는 왼쪽(상승부)에서 위로, 꼭대기에서 오른쪽으로 흐른다
  console.assert(cellPt(CELLS[0], Math.PI + 0.1, 1)[1] < cellPt(CELLS[0], Math.PI, 1)[1] && cellPt(CELLS[0], -Math.PI / 2 + 0.1, 1)[0] > cellPt(CELLS[0], -Math.PI / 2, 1)[0], 'convect: 가운데 고리 방향');

  function mount(root) {
    const stage = root.querySelector('.cv-stage'), now = root.querySelector('.cv-now'), out = root.querySelector('.cv-out');
    const P = window.Play;
    let heat, drift, t, run, found, drag, msg, parts, ring, bg = null, bgKey = '', uiT = 0;
    function reset() {
      heat = 0.1; drift = 0; t = 0; run = 0; found = new Set(); drag = false; msg = ''; ring = null;
      parts = Array.from({ length: 150 }, (_, i) => ({ cl: i % 2, th: Math.random() * TAU, r: 0.25 + Math.random() * 0.7 }));
    }
    reset();
    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };
    const X = (u) => u * S.W, Y = (v) => v * S.H;
    const slider = () => ({ x0: X(0.3), x1: X(0.7), y: S.H - 20 });

    function paintBg(W, H) {
      const k = Math.max(1, Math.min(2, window.devicePixelRatio || 1)), cv = document.createElement('canvas'); cv.width = W * k; cv.height = H * k;
      const c = cv.getContext('2d'); c.setTransform(k, 0, 0, k, 0, 0);
      // 맨틀: 위는 주황, 아래로 갈수록 붉고 뜨겁게
      const m = c.createLinearGradient(0, H * 0.2, 0, H); m.addColorStop(0, '#f3a95a'); m.addColorStop(0.45, '#e2703a'); m.addColorStop(0.85, '#b8321f'); m.addColorStop(1, '#7a1a12');
      c.fillStyle = m; c.fillRect(0, 0, W, H);
      // 연약권 띠(조금 녹아 무른 부분) — 얼룩 질감
      c.fillStyle = 'rgba(255,214,140,.16)'; c.fillRect(0, H * TOP, W, H * 0.12);
      for (let i = 0; i < 260; i++) { const x = ((i * 137) % 1000) / 1000 * W, y = H * (0.25 + ((i * 59) % 100) / 100 * 0.62), r = 1 + (i % 4); c.fillStyle = `rgba(${i % 3 ? 120 : 255},${i % 3 ? 30 : 200},${i % 3 ? 15 : 120},.13)`; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
      // 바닥: 외핵 쪽 열
      const core = c.createLinearGradient(0, H * 0.9, 0, H); core.addColorStop(0, 'rgba(255,200,80,0)'); core.addColorStop(1, 'rgba(255,220,120,.55)');
      c.fillStyle = core; c.fillRect(0, H * 0.88, W, H * 0.12);
      P.txt(c, '연약권', W * 0.04, H * 0.335, 'rgba(255,255,255,.9)', '800 13px', 'left');
      P.txt(c, '맨틀', W * 0.04, H * 0.62, 'rgba(255,255,255,.85)', '800 14px', 'left');
      return cv;
    }
    // 판 한 장(앞면 단면): 지각 + 맨틀 윗부분, 결 무늬가 off만큼 밀려 움직임이 보인다
    function plate(c, x0, x1, ocean, off, lift) {
      const W = S.W, H = S.H, ys = Y(ocean ? 0.16 : 0.12) - (lift || 0), yb = Y(TOP), yc = ys + (yb - ys) * (ocean ? 0.3 : 0.45);
      if (x1 <= x0) return;
      c.save(); c.beginPath(); c.rect(x0, 0, x1 - x0, H); c.clip();
      const cr = c.createLinearGradient(0, ys, 0, yc); cr.addColorStop(0, ocean ? '#7d8a86' : '#c9a27a'); cr.addColorStop(1, ocean ? '#4c5856' : '#9a7656');
      c.fillStyle = cr; c.fillRect(x0, ys, x1 - x0, yc - ys);
      const ml = c.createLinearGradient(0, yc, 0, yb); ml.addColorStop(0, '#8a6a4a'); ml.addColorStop(1, '#6a4a32');
      c.fillStyle = ml; c.fillRect(x0, yc, x1 - x0, yb - yc);
      // 움직이는 결(세로 금) — 판이 끌려가는 것이 보이게
      c.strokeStyle = 'rgba(40,25,12,.28)'; c.lineWidth = 1.5;
      for (let x = ((off % 34) + 34) % 34 - 34; x < W; x += 34) { if (x < x0 - 2 || x > x1 + 2) continue; c.beginPath(); c.moveTo(x, ys + 4); c.lineTo(x + 6, yb - 3); c.stroke(); }
      c.strokeStyle = 'rgba(255,255,255,.25)'; c.beginPath(); c.moveTo(x0, ys + 1); c.lineTo(x1, ys + 1); c.stroke();
      c.restore();
      c.strokeStyle = 'rgba(30,20,10,.55)'; c.lineWidth = 1.5; c.strokeRect(x0, ys, x1 - x0, yb - ys);
      return ys;
    }
    function arrow(c, x, y, dx, col, a) {
      c.save(); c.globalAlpha = a; c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 4; c.beginPath(); c.moveTo(x - dx, y); c.lineTo(x + dx, y); c.stroke();
      const s = Math.sign(dx); c.beginPath(); c.moveTo(x + dx + s * 8, y); c.lineTo(x + dx - s * 4, y - 7); c.lineTo(x + dx - s * 4, y + 7); c.fill(); c.restore();
    }
    function step(dt) {
      t += dt;
      const v = heat * heat;
      parts.forEach((p) => { p.th += CELLS[p.cl].sgn * v * dt * 1.6 / (0.5 + p.r * 0.5); });
      if (heat > 0.4) run += dt;
      drift = Math.min(1, drift + v * dt * 0.08);
      if (ring) { ring.t -= dt; if (ring.t <= 0) ring = null; }
    }
    function steps() {
      const ok = []; if (run > 2.5) ok.push(1); if (found.has('up')) ok.push(2); if (found.has('down')) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 아래 열 손잡이를 오른쪽으로 끌자' : st === 2 ? '② 판이 갈라지는 곳을 눌러 보자' : st === 3 ? '③ 판이 부딪히는 곳을 눌러 보자' : '맨틀 대류가 판을 끌고 간다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
      if (st === 1) say(heat < 0.3 ? `열 ${Math.round(heat * 100)}% — 맨틀이 거의 움직이지 않는다. 열을 더 올리자.` : `열 ${Math.round(heat * 100)}% — 데워진 맨틀은 가벼워 올라가고, 식은 맨틀은 무거워 내려간다(<b>맨틀 대류</b>).`);
    }
    function tap(which) {
      if (heat < 0.3) { say('먼저 열을 올려 맨틀이 돌게 하자 — 대류가 없으면 판도 멈춘다.'); return false; }
      found.add(which); ring = { k: which, t: 1.4 };
      say(which === 'up' ? '<b>상승부</b> — 뜨거운 맨틀이 올라와 양옆으로 퍼지며 판을 <b>벌린다</b>. 벌어진 틈으로 마그마가 솟아 새 지각이 생긴다.'
        : '<b>하강부</b> — 식은 맨틀이 가라앉으며 판을 끌어당겨 두 판이 <b>부딪친다</b>. 무거운 판은 아래로 들어가고, 위에는 산이 솟는다.');
      steps(); S.kick(); return true;
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        if (dt) step(Math.min(dt, 0.05));
        const key = `${W}x${H}`; if (key !== bgKey) { bg = paintBg(W, H); bgKey = key; }
        c.drawImage(bg, 0, 0, W, H);
        const v = heat * heat;
        // 대류 고리 화살표(열이 셀수록 진하게)
        CELLS.forEach((cl) => {
          c.save(); c.strokeStyle = `rgba(255,240,200,${0.12 + v * 0.45})`; c.lineWidth = 6; c.setLineDash([16, 12]); c.lineDashOffset = -cl.sgn * t * 40 * v;
          c.beginPath(); for (let a = 0; a <= TAU + 0.01; a += 0.05) { const [u, w] = cellPt(cl, a, 0.62); const px = X(u), py = Y(w); a && Math.abs(px - c._lx) < W * 0.5 ? c.lineTo(px, py) : c.moveTo(px, py); c._lx = px; } c.stroke(); c.restore();
        });
        // 맨틀 알갱이: 위로 갈수록 식어 어두워진다
        parts.forEach((p) => { const [u, w] = cellPt(CELLS[p.cl], p.th, p.r), hot = (w - TOP) / (BOT - TOP); c.fillStyle = `rgba(255,${Math.round(150 + hot * 90)},${Math.round(60 + hot * 80)},${0.35 + v * 0.5})`; c.beginPath(); c.arc(X(u), Y(w), 2.6 + hot * 1.4, 0, TAU); c.fill(); });
        // 상승부 기둥(밝게) · 하강부(어둡게)
        const up = c.createLinearGradient(X(UP) - 30, 0, X(UP) + 30, 0); up.addColorStop(0, 'rgba(255,230,140,0)'); up.addColorStop(0.5, `rgba(255,230,140,${0.12 + v * 0.35})`); up.addColorStop(1, 'rgba(255,230,140,0)');
        c.fillStyle = up; c.fillRect(X(UP) - 30, Y(TOP), 60, Y(BOT) - Y(TOP));
        const dn = c.createLinearGradient(X(DOWN) - 30, 0, X(DOWN) + 30, 0); dn.addColorStop(0, 'rgba(90,30,20,0)'); dn.addColorStop(0.5, `rgba(90,30,20,${0.1 + v * 0.3})`); dn.addColorStop(1, 'rgba(90,30,20,0)');
        c.fillStyle = dn; c.fillRect(X(DOWN) - 30, Y(TOP), 60, Y(BOT) - Y(TOP));
        // 하늘·바다
        const sky = c.createLinearGradient(0, 0, 0, Y(0.16)); sky.addColorStop(0, '#9fcbea'); sky.addColorStop(1, '#d9ecf7'); c.fillStyle = sky; c.fillRect(0, 0, W, Y(0.16));
        c.fillStyle = '#3b8fcb'; c.fillRect(0, Y(0.09), X(DOWN), Y(0.16) - Y(0.09));
        // 판 셋: 왼판·가운데판(해양판), 오른판(대륙판). 벌어진 틈과 가라앉는 끝
        const gap = 6 + drift * W * 0.07, mv = t * v * 26;
        // 새 지각(마그마가 식어 생긴 띠)
        const mg = c.createLinearGradient(0, Y(0.16), 0, Y(TOP)); mg.addColorStop(0, '#5a4038'); mg.addColorStop(0.4, '#c8401c'); mg.addColorStop(1, '#ffb347');
        c.fillStyle = mg; c.fillRect(X(UP) - gap / 2, Y(0.16), gap, Y(TOP) - Y(0.16));
        P.glow(c, X(UP), Y(0.2), 14 + v * 26, `rgba(255,170,60,${0.3 + v * 0.6 * (0.7 + 0.3 * Math.sin(t * 6))})`);
        plate(c, 0, X(UP) - gap / 2, true, -mv);
        // 가운데판: 하강부에서 아래로 휘어 들어간다
        const sink = drift * H * 0.18;
        plate(c, X(UP) + gap / 2, X(DOWN), true, mv);
        c.save(); c.fillStyle = '#6a4a32'; c.beginPath(); c.moveTo(X(DOWN) - 4, Y(0.16)); c.lineTo(X(DOWN) + 6, Y(0.16)); c.lineTo(X(DOWN) + 10 + sink * 0.5, Y(TOP) + sink); c.lineTo(X(DOWN) - 14 + sink * 0.5, Y(TOP) + sink); c.closePath(); c.fill(); c.strokeStyle = 'rgba(30,20,10,.55)'; c.stroke(); c.restore();
        const ys = plate(c, X(DOWN), W, false, -mv * 0.6);
        // 하강부 위: 산이 솟는다
        const mh = 6 + drift * H * 0.09; const mtn = c.createLinearGradient(0, ys - mh, 0, ys); mtn.addColorStop(0, '#e9eef0'); mtn.addColorStop(0.25, '#8d8f86'); mtn.addColorStop(1, '#5f8f4a');
        c.fillStyle = mtn; c.beginPath(); c.moveTo(X(DOWN), ys); c.lineTo(X(DOWN) + W * 0.04, ys - mh * 0.7); c.lineTo(X(DOWN) + W * 0.07, ys - mh); c.lineTo(X(DOWN) + W * 0.1, ys - mh * 0.6); c.lineTo(X(DOWN) + W * 0.15, ys); c.fill();
        c.fillStyle = '#6aa84f'; c.fillRect(X(DOWN) + W * 0.15, ys - 3, W, 3);
        P.txt(c, '해양판', X(0.14), Y(0.215), 'rgba(255,255,255,.95)', '800 13px'); P.txt(c, '해양판', X(0.52), Y(0.215), 'rgba(255,255,255,.95)', '800 13px'); P.txt(c, '대륙판', X(0.9), Y(0.2), 'rgba(255,255,255,.95)', '800 13px');
        // 판이 움직이는 방향
        const a = Math.min(1, v * 3);
        arrow(c, X(0.15), Y(0.05), -22, '#1d2433', a); arrow(c, X(0.52), Y(0.05), 22, '#1d2433', a); arrow(c, X(0.9), Y(0.05), -16, '#1d2433', a * 0.8);
        if (v > 0.1) { P.txt(c, '상승부', X(UP), Y(0.5), 'rgba(255,255,255,.95)', '800 15px'); P.txt(c, '하강부', X(DOWN), Y(0.5), 'rgba(255,255,255,.95)', '800 15px'); }
        // 누른 곳 표시
        if (ring) { const x = X(ring.k === 'up' ? UP : DOWN), r = 26 + (1.4 - ring.t) * 30; c.strokeStyle = `rgba(255,216,77,${Math.min(1, ring.t)})`; c.lineWidth = 4; c.beginPath(); c.arc(x, Y(0.2), r, 0, TAU); c.stroke(); P.txt(c, ring.k === 'up' ? '갈라진다' : '부딪친다', x, Y(0.2) - r - 6, '#1d2433', '800 15px'); }
        else if (run > 2.5 && found.size < 2) { const k = found.has('up') ? DOWN : UP, p = 0.5 + 0.5 * Math.sin(t * 4); c.strokeStyle = `rgba(255,216,77,${p})`; c.lineWidth = 3; c.setLineDash([6, 6]); c.beginPath(); c.arc(X(k), Y(0.2), 30, 0, TAU); c.stroke(); c.setLineDash([]); }
        // 열 손잡이
        const sl = slider(), kx = sl.x0 + heat * (sl.x1 - sl.x0);
        c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.roundRect(sl.x0, sl.y - 4, sl.x1 - sl.x0, 8, 4); c.fill();
        const hg = c.createLinearGradient(sl.x0, 0, sl.x1, 0); hg.addColorStop(0, '#ffd27a'); hg.addColorStop(1, '#ff4a1c'); c.fillStyle = hg; c.beginPath(); c.roundRect(sl.x0, sl.y - 4, kx - sl.x0, 8, 4); c.fill();
        const kg = c.createRadialGradient(kx - 3, sl.y - 3, 1, kx, sl.y, 13); kg.addColorStop(0, '#fff3c8'); kg.addColorStop(1, '#e8641a'); c.fillStyle = kg; c.beginPath(); c.arc(kx, sl.y, 13, 0, TAU); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke();
        P.txt(c, `아래쪽 열 ${Math.round(heat * 100)}%`, sl.x1 + 14, sl.y + 5, '#fff', '800 14px', 'left');
        if (!drag && run < 0.5) P.txt(c, '← 끌기 →', kx, sl.y - 20, '#fff', '800 13px');
        uiT += dt; if (uiT > 0.2 || !dt) { uiT = 0; steps(); }
      },
      down(p) {
        const sl = slider(); if (Math.abs(p.y - sl.y) < 26 && p.x > sl.x0 - 24 && p.x < sl.x1 + 24) { drag = true; heat = Math.max(0, Math.min(1, (p.x - sl.x0) / (sl.x1 - sl.x0))); return; }
        // 판 위·아래 어디를 눌러도 가까운 쪽(상승부·하강부)으로 본다
        if (p.y < Y(0.6)) { if (Math.abs(p.x - X(UP)) < S.W * 0.12) tap('up'); else if (Math.abs(p.x - X(DOWN)) < S.W * 0.12) tap('down'); }
      },
      move(p, e, held) { if (held && drag) { const sl = slider(); heat = Math.max(0, Math.min(1, (p.x - sl.x0) / (sl.x1 - sl.x0))); } },
      up() { drag = false; },
      key(e) {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { heat = Math.max(0, Math.min(1, heat + (e.key === 'ArrowRight' ? 0.1 : -0.1))); return true; }
        if (e.key === '1') { tap('up'); return true; } if (e.key === '2') { tap('down'); return true; }
        if (e.key === '0') { reset(); steps(); return true; } return false;
      },
    });
    root.querySelector('.cv-reset').addEventListener('click', () => { reset(); steps(); S.kick(); });
    steps();
    const go = (sec) => { for (let k = 0; k < sec * 30; k++) step(1 / 30); steps(); S.kick(); };
    root._cv = {
      heat: (v) => { heat = Math.max(0, Math.min(1, v)); go(3); return root._cv.state(); },
      tap: (k) => tap(k),
      state: () => ({ heat: +heat.toFixed(2), drift: +drift.toFixed(2), run: +run.toFixed(1), found: [...found] }),
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Convect = { mount };
})();
