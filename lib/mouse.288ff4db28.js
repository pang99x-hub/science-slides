/* 2-2 4차시 체험 «무선 마우스 분해»(교과서 90쪽 해 보기 · 도체, 부도체, 반도체의 활용 살펴보기).
   가운데 뚜껑을 연 무선 마우스와 USB 수신기 그림. 부품을 누르면 이름표가 튀어나오고, 이름표를 끌어
   아래 세 칸(도체·부도체·반도체) 근처에 놓으면 맞으면 딱 붙고 틀리면 튕기며 까닭을 알려 준다.
   USB 수신기는 칩(반도체)과 단자(도체)로 나눠 둔다. 키보드: 1~8 부품 고르기, D·I·S 칸에 넣기, 0 처음부터.
   Mouse.mount(root) → { fit, setActive } · 시험용: root._ms.put('wheel','ins') · state() */
(function () {
  'use strict';
  const BIN = { con: ['도체', '#f2a03d'], ins: ['부도체', '#8a93a8'], semi: ['반도체', '#5cc77a'] };
  // 부품: 이름, 맞는 칸, 까닭, 그림 자리(판 너비·높이 비율)
  const PARTS = [
    { k: 'shell', n: '겉 껍데기(플라스틱)', c: 'ins', why: '플라스틱은 전류가 거의 흐르지 않아 손을 보호하고 부품을 감싼다', at: [0.2, 0.2] },
    { k: 'wheel', n: '마우스 휠(고무)', c: 'ins', why: '고무는 전류가 거의 흐르지 않는다 — 손가락이 닿는 곳', at: [0.36, 0.17], book: 1 },
    { k: 'copper', n: '기판의 구리 배선', c: 'con', why: '구리는 자유 전자가 많아 부품 사이로 전류를 나른다', at: [0.47, 0.42] },
    { k: 'chip', n: '기판의 칩', c: 'semi', why: '칩 속 반도체 소자가 버튼·움직임 신호를 처리한다', at: [0.36, 0.48] },
    { k: 'led', n: '발광 다이오드', c: 'semi', why: '전류가 흐르면 빛을 내는 반도체 소자 — 바닥의 빛 센서', at: [0.3, 0.33], book: 1 },
    { k: 'term', n: '전지 단자(금속 판)', c: 'con', why: '금속 판이 전지와 맞닿아 전류를 기판으로 보낸다', at: [0.39, 0.66] },
    { k: 'rxchip', n: '수신기 속 칩', c: 'semi', why: '무선 신호를 받아 처리하는 반도체', at: [0.78, 0.33], book: 1 },
    { k: 'rxplug', n: '수신기 단자(금속)', c: 'con', why: '컴퓨터와 맞닿아 전류·신호가 오가는 금속 단자', at: [0.86, 0.33], book: 1 },
  ];
  function mount(root) {
    const stage = root.querySelector('.ms-stage'), now = root.querySelector('.ms-now'), out = root.querySelector('.ms-out');
    const P = window.Play;
    let tags = [], placed = {}, drag = null, bounce = null, msg = '', t = 0, miss = 0;
    const binX = (W, i) => W * (0.2 + i * 0.3), binY = (H) => H - 58;
    function say(h) { if (h !== msg) { msg = h; out.innerHTML = h; } }
    function steps() {
      const book = PARTS.filter((q) => q.book).every((q) => placed[q.k]), n = Object.keys(placed).length;
      const ok = []; if (book) ok.push(1); if (n >= 6) ok.push(2); if (n === PARTS.length) ok.push(3);
      const k = [1, 2, 3].find((q) => !ok.includes(q)) || 0;
      window.L1.steps(root, k, ok); window.L1.done(root, k === 0);
      const nt = k === 1 ? '① 휠·발광 다이오드·USB 수신기(칩·단자)를 먼저 나누자' : k === 2 ? `② 다른 부품도 눌러 나누자 (${n}/8)` : k === 3 ? `③ 남은 부품까지 모두 (${n}/8)` : `모두 맞혔다 — 틀린 시도 ${miss}번`;
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', k === 0); }
    }
    function pop(q) {
      if (placed[q.k] || tags.some((g) => g.k === q.k)) return;
      const [ax, ay] = q.at; tags.push({ k: q.k, x: S.W * ax, y: S.H * ay, hx: S.W * ax, hy: S.H * ay + 34, vy: -120 });
      say(`<b>${q.n}</b> — 이름표를 끌어 아래 도체·부도체·반도체 칸에 넣자`); S.kick();
    }
    function put(k, c) {
      const q = PARTS.find((p) => p.k === k); if (!q || placed[k]) return false;
      tags = tags.filter((g) => g.k !== k);
      if (q.c === c) { placed[k] = c; window.RxT.jolt(stage, 1); say(`맞았다! <b>${q.n}</b> → <b>${BIN[c][0]}</b>: ${q.why}`); }
      else { miss += 1; const [ax, ay] = q.at; tags.push({ k, x: S.W * BIN_X(c), y: binY(S.H), hx: S.W * ax, hy: S.H * ay + 34, vy: 0 }); bounce = { x: S.W * BIN_X(c), y: binY(S.H), a: 1 }; say(`튕겼다 — <b>${q.n}</b>은(는) ${BIN[c][0]}가 아니다. 힌트: ${q.why}`); }
      steps(); S.kick(); return q.c === c;
    }
    const BIN_X = (c) => 0.2 + ['con', 'ins', 'semi'].indexOf(c) * 0.3;
    // 그림(2026-11-10 «그래픽 다시 그리기»): 뚜껑을 연 실제 무선 마우스 — 곡면 껍데기, 고무 휠 결, 초록 기판, 광센서, 건전지, 나노 수신기
    const lg = (c, x0, y0, x1, y1, st) => { const g = c.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, col]) => g.addColorStop(o, col)); return g; };
    function shellPath(c, mx, my, rx, ry) { c.beginPath(); c.moveTo(mx, my - ry); c.bezierCurveTo(mx + rx * 0.95, my - ry, mx + rx * 1.05, my + ry * 0.2, mx + rx * 0.8, my + ry * 0.75); c.bezierCurveTo(mx + rx * 0.55, my + ry * 1.05, mx - rx * 0.55, my + ry * 1.05, mx - rx * 0.8, my + ry * 0.75); c.bezierCurveTo(mx - rx * 1.05, my + ry * 0.2, mx - rx * 0.95, my - ry, mx, my - ry); c.closePath(); }
    function drawMouse(c, W, H) {
      const mx = W * 0.36, my = H * 0.42, rx = W * 0.22, ry = H * 0.36;
      c.save(); c.shadowColor = 'rgba(0,0,0,.55)'; c.shadowBlur = 22; c.shadowOffsetY = 10; c.fillStyle = '#000'; shellPath(c, mx, my, rx, ry); c.fill(); c.restore();
      // 겉 껍데기: 흰 플라스틱 곡면(가장자리 어둡게) + 안쪽 바닥
      c.fillStyle = (() => { const g = c.createRadialGradient(mx - rx * 0.3, my - ry * 0.4, 10, mx, my, rx * 1.2); g.addColorStop(0, '#fbfcfd'); g.addColorStop(0.7, '#d5d9e0'); g.addColorStop(1, '#9aa1ad'); return g; })(); shellPath(c, mx, my, rx, ry); c.fill();
      c.fillStyle = '#c3c8d1'; shellPath(c, mx, my + 4, rx * 0.9, ry * 0.9); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2; shellPath(c, mx, my, rx * 0.985, ry * 0.985); c.stroke();
      // 기판(초록 + 섬유 결 + 금빛 구멍)
      const bx = mx - rx * 0.6, by = my - ry * 0.52, bw = rx * 1.22, bh = ry * 1.02;
      c.fillStyle = lg(c, bx, by, bx + bw, by + bh, [[0, '#2b8a57'], [1, '#1b5e3b']]); c.beginPath(); c.roundRect(bx, by, bw, bh, 10); c.fill();
      c.save(); c.beginPath(); c.roundRect(bx, by, bw, bh, 10); c.clip(); c.strokeStyle = 'rgba(255,255,255,.04)'; c.lineWidth = 1; for (let i = -bh; i < bw; i += 5) { c.beginPath(); c.moveTo(bx + i, by); c.lineTo(bx + i + bh, by + bh); c.stroke(); } c.restore();
      // 구리 배선(금빛, 꺾인 선 + 둥근 접점)
      for (let i = 0; i < 6; i++) { const y0 = my - ry * 0.4 + i * ry * 0.16; c.strokeStyle = lg(c, 0, y0 - 2, 0, y0 + 2, [[0, '#f6c98a'], [1, '#a8662a']]); c.lineWidth = 3; c.beginPath(); c.moveTo(mx - rx * 0.5, y0); c.lineTo(mx + rx * 0.05, y0); c.lineTo(mx + rx * 0.22, y0 + 10); c.lineTo(mx + rx * 0.52, y0 + 10); c.stroke(); c.fillStyle = '#e9b46e'; c.beginPath(); c.arc(mx + rx * 0.52, y0 + 10, 3.5, 0, Math.PI * 2); c.fill(); }
      // 칩(검은 몸체 + 은빛 다리)
      { const x = W * 0.36 - 24, y = H * 0.48 - 17; c.fillStyle = '#c7ccd4'; for (let i = 0; i < 5; i++) { c.fillRect(x - 5, y + 4 + i * 6, 5, 2.5); c.fillRect(x + 48, y + 4 + i * 6, 5, 2.5); } c.fillStyle = lg(c, x, y, x + 48, y + 34, [[0, '#3a3f49'], [1, '#101318']]); c.beginPath(); c.roundRect(x, y, 48, 34, 3); c.fill(); c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(x + 2, y + 2, 44, 8); c.fillStyle = '#05070a'; c.beginPath(); c.arc(x + 6, y + 6, 2, 0, Math.PI * 2); c.fill(); }
      // 발광 다이오드(바닥 광센서 옆 빨간 빛)
      { const x = W * 0.3, y = H * 0.33; P.glow(c, x, y, 26, 'rgba(255,70,50,.45)'); c.fillStyle = '#eef0f2'; c.fillRect(x - 8, y - 6, 16, 12); c.fillStyle = (() => { const g = c.createRadialGradient(x - 2, y - 2, 1, x, y, 6); g.addColorStop(0, '#ffb0a0'); g.addColorStop(1, '#d8261a'); return g; })(); c.beginPath(); c.arc(x, y, 5.5, 0, Math.PI * 2); c.fill(); }
      // 휠: 검은 고무, 가로 홈 결
      { const x = mx, y = my - ry * 0.84; c.fillStyle = '#1a1d24'; c.beginPath(); c.roundRect(x - 16, y - 4, 32, 58, 12); c.fill(); /* 껍데기 안 휠 홈 */ c.fillStyle = lg(c, x - 12, 0, x + 12, 0, [[0, '#0d0f13'], [0.5, '#3a3f49'], [1, '#0d0f13']]); c.beginPath(); c.roundRect(x - 12, y, 24, 50, 10); c.fill(); c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 1.5; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(x - 10, y + 5 + i * 5); c.lineTo(x + 10, y + 5 + i * 5); c.stroke(); } }
      // 건전지(AA, 금색·검정) + 전지 단자(은빛 금속 판과 용수철)
      { const x = W * 0.39, y = H * 0.66; c.fillStyle = lg(c, 0, y - 32, 0, y - 10, [[0, '#f2c544'], [0.5, '#a87d16'], [1, '#6e5010']]); c.beginPath(); c.roundRect(x - 40, y - 32, 56, 22, 6); c.fill(); c.fillStyle = lg(c, 0, y - 32, 0, y - 10, [[0, '#5a6170'], [1, '#1b1e25']]); c.beginPath(); c.roundRect(x + 14, y - 32, 22, 22, 6); c.fill(); P.txt(c, 'AA', x - 14, y - 16, '#3a2a00', '800 11px');
        c.fillStyle = lg(c, 0, y - 6, 0, y + 6, [[0, '#f2f4f7'], [0.5, '#9aa1ab'], [1, '#d8dce2']]); c.fillRect(x - 40, y - 6, 80, 12); c.strokeStyle = '#8b929c'; c.lineWidth = 2; c.beginPath(); for (let i = 0; i < 6; i++) { c.moveTo(x + 22 + i * 3, y - 6); c.lineTo(x + 24 + i * 3, y + 6); } c.stroke(); }
      // USB 수신기(검은 플라스틱 + 은빛 단자, 구멍 둘)
      { const x = W * 0.72, y = H * 0.27, w = W * 0.1, h = H * 0.12;
        c.save(); c.shadowColor = 'rgba(0,0,0,.5)'; c.shadowBlur = 10; c.shadowOffsetY = 5; c.fillStyle = lg(c, 0, y, 0, y + h, [[0, '#3c424f'], [1, '#14171d']]); c.beginPath(); c.roundRect(x, y, w, h, 8); c.fill(); c.restore();
        c.fillStyle = lg(c, 0, H * 0.29, 0, H * 0.37, [[0, '#f0f2f5'], [0.5, '#9aa1ab'], [1, '#d0d4da']]); c.fillRect(W * 0.82, H * 0.29, W * 0.07, H * 0.08);
        c.fillStyle = '#2a2f3a'; c.fillRect(W * 0.835, H * 0.305, 7, 5); c.fillRect(W * 0.86, H * 0.305, 7, 5);
        c.fillStyle = '#0b0d11'; c.fillRect(W * 0.78 - 10, H * 0.33 - 8, 20, 16); c.fillStyle = '#c7ccd4'; for (let i = 0; i < 3; i++) { c.fillRect(W * 0.78 - 13, H * 0.33 - 6 + i * 5, 3, 2); c.fillRect(W * 0.78 + 10, H * 0.33 - 6 + i * 5, 3, 2); }
        P.txt(c, 'USB 수신기', W * 0.8, H * 0.47, '#fbfcf9', '800 15px'); }
      // 아직 누르지 않은 부품에 깜박이는 물음표
      PARTS.forEach((q) => {
        if (placed[q.k] || tags.some((g) => g.k === q.k)) return;
        const [x, y] = [W * q.at[0], H * q.at[1]], a = 0.55 + 0.45 * Math.sin(t * 4 + x);
        c.strokeStyle = `rgba(255,216,77,${a})`; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 18, 0, Math.PI * 2); c.stroke();
        P.txt(c, '?', x + 20, y - 14, '#ffd84d', '800 16px');
      });
    }
    function drawTag(c, g, a = 1) {
      const q = PARTS.find((p) => p.k === g.k); c.globalAlpha = a;
      c.font = '800 15px "IBM Plex Sans KR", sans-serif'; const w = c.measureText(q.n).width + 22;
      c.fillStyle = '#fff7d6'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.roundRect(g.x - w / 2, g.y - 16, w, 32, 9); c.fill(); c.stroke();
      P.txt(c, q.n, g.x, g.y + 5, '#1d2433', '800 15px'); c.globalAlpha = 1;
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt;
        c.fillStyle = lg(c, 0, 0, 0, H, [[0, '#2a3552'], [1, '#141b30']]); c.fillRect(0, 0, W, H);
        drawMouse(c, W, H);
        // 칸
        ['con', 'ins', 'semi'].forEach((k, i) => {
          const x = binX(W, i), y = binY(H), [nm, col] = BIN[k], items = PARTS.filter((q) => placed[q.k] === k);
          c.fillStyle = 'rgba(255,255,255,.06)'; c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.roundRect(x - W * 0.14, y - 44, W * 0.28, 96, 12); c.fill(); c.stroke();
          P.txt(c, nm, x, y - 24, col, '800 19px');
          items.forEach((q, j) => P.txt(c, q.n, x, y + 2 + j * 17, '#fbfcf9', '700 13px'));
        });
        // 이름표: 튀어나와 제자리로 내려앉는다
        tags.forEach((g) => { if (g === drag) return; g.vy += 900 * dt; g.y += g.vy * dt; g.x += (g.hx - g.x) * Math.min(1, dt * 6); if (g.y > g.hy) { g.y = g.hy; g.vy = 0; } drawTag(c, g); });
        if (drag) drawTag(c, drag, 0.9);
        if (bounce) { c.strokeStyle = `rgba(239,91,76,${bounce.a})`; c.lineWidth = 4; c.beginPath(); c.arc(bounce.x, bounce.y, 50 * (2 - bounce.a), 0, Math.PI * 2); c.stroke(); bounce.a -= dt * 1.5; if (bounce.a <= 0) bounce = null; }
      },
      down(p) {
        const g = [...tags].reverse().find((q) => Math.abs(p.x - q.x) < 80 && Math.abs(p.y - q.y) < 18);
        if (g) { drag = g; return; }
        const q = PARTS.find((r) => Math.hypot(p.x - S.W * r.at[0], p.y - S.H * r.at[1]) < 34); if (q) pop(q);
      },
      move(p, e, held) { if (held && drag) { drag.x = p.x; drag.y = p.y; } },
      up(p) {
        if (!drag) return; const g = drag; drag = null;
        if (p.y > binY(S.H) - 90) { const i = Math.max(0, Math.min(2, Math.round((p.x / S.W - 0.2) / 0.3))); put(g.k, ['con', 'ins', 'semi'][i]); }
        else { g.hx = p.x; g.hy = p.y; }
      },
      key(e) {
        const i = '12345678'.indexOf(e.key); if (i >= 0) { pop(PARTS[i]); return true; }
        const c = { d: 'con', D: 'con', i: 'ins', I: 'ins', s: 'semi', S: 'semi' }[e.key];
        if (c) { const g = tags[tags.length - 1]; if (g) put(g.k, c); return true; }
        if (e.key === '0') { reset(); return true; } return false;
      },
    });
    function reset() { tags = []; placed = {}; miss = 0; drag = null; msg = ''; say('부품의 노란 동그라미를 누르면 이름표가 나온다 — 전기적 성질에 맞는 칸으로 끌자'); steps(); S.kick(); }
    root.querySelector('.ms-reset')?.addEventListener('click', reset);
    root._ms = { put: (k, c) => put(k, c), state: () => ({ placed: { ...placed }, miss }) };
    reset();
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Mouse = { mount };
})();
