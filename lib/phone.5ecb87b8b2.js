/* 2-2 4차시 표지 «분해한 스마트폰»(교과서 88쪽 도입: 전자 기기 속 물질은 모두 전기가 잘 통할까?).
   왼쪽에 분해한 스마트폰 부품(유리 화면·플라스틱 뒷판·기판 위 구리 배선·칩·전지 단자·발광 다이오드).
   오른쪽 아래 측정 집게(두 끝이 붙은 테스터)를 끌어 부품 위에 놓으면 위 전구 회로가 반응한다:
   구리·전지 단자(도체) → 밝게 켜지고 전선 위로 전자 점이 흐름 / 유리·플라스틱(부도체) → 꺼짐 /
   칩·발광 다이오드(반도체) → 희미하게 깜빡임(조건에 따라 달라짐). 키보드 1~6 부품 고르기, 0 처음부터.
   Phone.mount(root) → { fit, setActive } · 시험용: root._ph.probe('copper'|'glass'|'chip'|…) · state() */
(function () {
  'use strict';
  // k: 시험용 이름, n: 화면 이름, kind: c 도체 · i 부도체 · s 반도체, box: 판 비율(x, y, w, h)
  const PARTS = [
    { k: 'glass', n: '유리 화면', kind: 'i', box: [0.04, 0.08, 0.2, 0.62], col: '#9fd3ef' },
    { k: 'back', n: '플라스틱 뒷판', kind: 'i', box: [0.27, 0.08, 0.2, 0.62], col: '#8a93a8' },
    { k: 'copper', n: '구리 배선', kind: 'c', box: [0.51, 0.1, 0.17, 0.16], col: '#d98c4a' },
    { k: 'chip', n: '칩', kind: 's', box: [0.51, 0.31, 0.11, 0.14], col: '#1d2433' },
    { k: 'term', n: '전지 단자', kind: 'c', box: [0.51, 0.5, 0.17, 0.08], col: '#e8c15a' },
    { k: 'led', n: '발광 다이오드', kind: 's', box: [0.64, 0.31, 0.06, 0.1], col: '#f6f1d0' },
  ];
  const SAY = {
    c: (n) => `<b>${n}</b>: 전구가 밝게 켜진다 — 전류가 잘 흐르는 물질(금속)`,
    i: (n) => `<b>${n}</b>: 전구가 꺼진 채 — 전류가 거의 흐르지 않는 물질`,
    s: (n) => `<b>${n}</b>: 희미하게 깜빡인다 — 조건에 따라 전류가 흐르기도 하는 물질`,
  };

  function mount(root) {
    const stage = root.querySelector('.ph-stage'), now = root.querySelector('.ph-now');
    const P = window.Play;
    let on = null, drag = null, t = 0; const seen = new Set();
    const G = (W, H) => ({
      bx: (b) => [b[0] * W, b[1] * H, b[2] * W, b[3] * H],
      home: [W * 0.86, H * 0.82], bulb: [W * 0.86, H * 0.22],
      loop: [[W * 0.75, H * 0.12], [W * 0.97, H * 0.12], [W * 0.97, H * 0.62], [W * 0.75, H * 0.62]],
    });
    const hit = (g, x, y) => PARTS.find((q) => { const [a, b, w, h] = g.bx(q.box); return x > a - 12 && x < a + w + 12 && y > b - 12 && y < b + h + 12; });
    function probe(q) { on = q || null; if (q) seen.add(q.kind); S.kick(); }
    function chip() {
      const nt = !on ? '측정 집게를 끌어 부품 위에 놓자' : seen.size < 3 ? SAY[on.kind](on.n).replace(/<[^>]+>/g, '') : '금속·유리·칩 — 전기가 통하는 정도가 저마다 다르다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', seen.size >= 3); }
    }
    // 그림(2026-11-10 «그래픽 다시 그리기»): 실물 분해 사진처럼 — 유리 반사, 플라스틱 곡면, 초록 기판·금빛 배선, 검은 칩, 은색 전지
    const lg = (c, x0, y0, x1, y1, stops) => { const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, col]) => g.addColorStop(o, col)); return g; };
    let cache = null, cw = 0, chh = 0;
    function still(W, H, g) { // 움직이지 않는 부분은 한 번만 그려 둔다
      if (cache && cw === W && chh === H) return cache;
      cache = document.createElement('canvas'); cw = W; chh = H; const k = 2; cache.width = W * k; cache.height = H * k;
      const c = cache.getContext('2d'); c.scale(k, k);
      // 책상 매트
      c.fillStyle = lg(c, 0, 0, 0, H, [[0, '#26324f'], [1, '#141c33']]); c.fillRect(0, 0, W, H);
      c.strokeStyle = 'rgba(255,255,255,.04)'; c.lineWidth = 1; for (let x = 0; x < W; x += 24) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, H); c.stroke(); } for (let y = 0; y < H; y += 24) { c.beginPath(); c.moveTo(0, y); c.lineTo(W, y); c.stroke(); }
      const sh = (x, y, w, h, r) => { c.save(); c.shadowColor = 'rgba(0,0,0,.55)'; c.shadowBlur = 14; c.shadowOffsetY = 6; c.fillStyle = '#000'; c.beginPath(); c.roundRect(x, y, w, h, r); c.fill(); c.restore(); };
      // 유리 화면(검은 유리 + 비스듬한 반사광)
      { const [x, y, w, h] = g.bx(PARTS[0].box); sh(x, y, w, h, 16);
        c.fillStyle = lg(c, x, y, x + w, y + h, [[0, '#2b3c55'], [0.5, '#0d1626'], [1, '#1d2a40']]); c.beginPath(); c.roundRect(x, y, w, h, 16); c.fill();
        c.save(); c.clip(); c.fillStyle = 'rgba(255,255,255,.13)'; c.beginPath(); c.moveTo(x + w * 0.1, y); c.lineTo(x + w * 0.55, y); c.lineTo(x, y + h * 0.55); c.lineTo(x, y + h * 0.2); c.fill();
        c.fillStyle = 'rgba(255,255,255,.06)'; c.beginPath(); c.moveTo(x + w * 0.75, y); c.lineTo(x + w, y); c.lineTo(x + w, y + h * 0.1); c.lineTo(x + w * 0.1, y + h); c.lineTo(x - w * 0.2, y + h); c.fill(); c.restore();
        c.strokeStyle = '#5b6b85'; c.lineWidth = 2; c.beginPath(); c.roundRect(x, y, w, h, 16); c.stroke();
        c.fillStyle = '#05080f'; c.beginPath(); c.roundRect(x + w * 0.38, y + 8, w * 0.24, 5, 3); c.fill(); c.beginPath(); c.arc(x + w * 0.7, y + 10.5, 3.5, 0, Math.PI * 2); c.fill(); }
      // 플라스틱 뒷판(곡면 광택 + 카메라 돌출부)
      { const [x, y, w, h] = g.bx(PARTS[1].box); sh(x, y, w, h, 16);
        c.fillStyle = lg(c, x, 0, x + w, 0, [[0, '#5d6575'], [0.15, '#8b93a3'], [0.5, '#a3abb9'], [0.85, '#7f8797'], [1, '#575f6e']]); c.beginPath(); c.roundRect(x, y, w, h, 16); c.fill();
        c.fillStyle = lg(c, x, y, x + w * 0.4, y + w * 0.4, [[0, '#454c59'], [1, '#2c323d']]); c.beginPath(); c.roundRect(x + w * 0.08, y + w * 0.08, w * 0.42, w * 0.42, 9); c.fill();
        [[0.2, 0.2], [0.38, 0.2], [0.2, 0.38]].forEach(([u, v]) => { const cx = x + w * u, cy = y + w * v, r = w * 0.065; c.fillStyle = '#0b0f17'; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill(); c.fillStyle = 'rgba(120,170,255,.35)'; c.beginPath(); c.arc(cx - r * 0.3, cy - r * 0.3, r * 0.35, 0, Math.PI * 2); c.fill(); });
        c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 1.5; c.beginPath(); c.roundRect(x + 2, y + 2, w - 4, h - 4, 14); c.stroke(); }
      // 초록 기판(유리섬유 결, 구멍, 금빛 배선)
      { const x = W * 0.49, y = H * 0.06, w = W * 0.24, h = H * 0.6; sh(x, y, w, h, 8);
        c.fillStyle = lg(c, x, y, x + w, y + h, [[0, '#1f6b45'], [1, '#164f34']]); c.beginPath(); c.roundRect(x, y, w, h, 8); c.fill();
        c.save(); c.beginPath(); c.roundRect(x, y, w, h, 8); c.clip();
        c.strokeStyle = 'rgba(255,255,255,.035)'; for (let i = -h; i < w; i += 5) { c.beginPath(); c.moveTo(x + i, y); c.lineTo(x + i + h, y + h); c.stroke(); }
        c.strokeStyle = 'rgba(214,170,74,.55)'; c.lineWidth = 1.6; for (let i = 0; i < 9; i++) { const yy = y + h * (0.62 + i * 0.035); c.beginPath(); c.moveTo(x + 8, yy); c.lineTo(x + w * 0.4, yy); c.lineTo(x + w * 0.5, yy - 10); c.lineTo(x + w - 8, yy - 10); c.stroke(); }
        for (let i = 0; i < 14; i++) { const hx = x + 10 + (i * 37) % (w - 20), hy = y + h * 0.95 - (i * 23) % 30; c.fillStyle = '#c9a24a'; c.beginPath(); c.arc(hx, hy, 3.2, 0, Math.PI * 2); c.fill(); c.fillStyle = '#0d2a1c'; c.beginPath(); c.arc(hx, hy, 1.4, 0, Math.PI * 2); c.fill(); }
        c.restore(); }
      // 구리 배선(금빛 띠와 둥근 접점)
      { const [x, y, w, h] = g.bx(PARTS[2].box);
        for (let i = 0; i < 5; i++) { const yy = y + 6 + i * (h - 12) / 4; c.strokeStyle = lg(c, 0, yy - 2, 0, yy + 2, [[0, '#f6c98a'], [0.5, '#c97a36'], [1, '#8a4f1e']]); c.lineWidth = 4; c.beginPath(); c.moveTo(x + 4, yy); c.lineTo(x + w * 0.55, yy); c.lineTo(x + w * 0.7, yy + (i % 2 ? 6 : -6)); c.lineTo(x + w - 10, yy + (i % 2 ? 6 : -6)); c.stroke(); c.fillStyle = '#e9b46e'; c.beginPath(); c.arc(x + w - 8, yy + (i % 2 ? 6 : -6), 4, 0, Math.PI * 2); c.fill(); } }
      // 칩(검은 몸체 + 은빛 다리)
      { const [x, y, w, h] = g.bx(PARTS[3].box);
        c.fillStyle = '#c7ccd4'; for (let i = 0; i < 5; i++) { const yy = y + 5 + i * (h - 10) / 4; c.fillRect(x - 7, yy - 1.5, 7, 3); c.fillRect(x + w, yy - 1.5, 7, 3); }
        c.fillStyle = lg(c, x, y, x + w, y + h, [[0, '#3a3f49'], [1, '#111419']]); c.beginPath(); c.roundRect(x, y, w, h, 3); c.fill();
        c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(x + 2, y + 2, w - 4, h * 0.25);
        c.fillStyle = '#0a0c10'; c.beginPath(); c.arc(x + 7, y + 7, 2.5, 0, Math.PI * 2); c.fill();
        }
      // 전지 단자(금도금 접점) + 그 아래 은색 전지 파우치
      { const [x, y, w, h] = g.bx(PARTS[4].box);
        c.fillStyle = lg(c, 0, y + h + 6, 0, y + h + 6 + H * 0.07, [[0, '#e6e9ee'], [0.5, '#aab1bb'], [1, '#d8dce2']]); c.beginPath(); c.roundRect(x - 6, y + h + 6, w + 12, H * 0.07, 6); c.fill();
        c.fillStyle = '#1d2433'; c.fillRect(x, y, w, h);
        for (let i = 0; i < 4; i++) { const xx = x + 6 + i * (w - 12) / 3.4; c.fillStyle = lg(c, xx, 0, xx + w / 6, 0, [[0, '#f8df8a'], [0.5, '#d6a838'], [1, '#a77a1e']]); c.beginPath(); c.roundRect(xx, y + 3, w / 6, h - 6, 2); c.fill(); } }
      // 발광 다이오드(작은 흰 사각 부품 + 노란 형광체 창)
      { const [x, y, w, h] = g.bx(PARTS[5].box);
        c.fillStyle = '#eef0f2'; c.beginPath(); c.roundRect(x + w * 0.1, y + h * 0.1, w * 0.8, h * 0.62, 2); c.fill();
        c.fillStyle = lg(c, 0, y + h * 0.2, 0, y + h * 0.62, [[0, '#fff3b0'], [1, '#e6c53a']]); c.beginPath(); c.arc(x + w / 2, y + h * 0.41, w * 0.28, 0, Math.PI * 2); c.fill(); }
      return cache;
    }
    function drawParts(c, g) {
      PARTS.forEach((q) => {
        const [x, y, w, h] = g.bx(q.box), lit = on === q;
        if (q.k === 'led' && lit) P.glow(c, x + w / 2, y + h * 0.41, 30, `rgba(255,236,140,${0.35 + 0.25 * Math.sin(t * 9)})`);
        if (lit) { c.strokeStyle = '#ffd84d'; c.lineWidth = 3; c.setLineDash([6, 4]); c.beginPath(); c.roundRect(x - 4, y - 4, w + 8, h + 8, 8); c.stroke(); c.setLineDash([]); }
        const col = lit ? '#ffd84d' : '#e2e8f4';
        if (q.k === 'led') { P.txt(c, '발광', x + w / 2, y + h + 16, col, '700 14px'); P.txt(c, '다이오드', x + w / 2, y + h + 31, col, '700 14px'); } // 두 줄: 한 줄이면 옆 칩 이름표와 겹침
        else P.txt(c, q.n, x + w / 2, y + h + (q.k === 'term' ? H_ * 0.07 + 26 : 18), col, '700 14px');
      });
    }
    let H_ = 0;
    function bulb(c, x, y, lvl) { // 유리구 + 필라멘트 + 나사 꼭지
      if (lvl > 0) P.glow(c, x, y, 70 * lvl + 12, `rgba(255,214,100,${0.45 * lvl + 0.15})`);
      c.fillStyle = lg(c, x - 8, y + 16, x + 8, y + 16, [[0, '#7c8392'], [0.5, '#d9dde4'], [1, '#6c7381']]); c.fillRect(x - 9, y + 16, 18, 14);
      c.strokeStyle = '#4a5160'; c.lineWidth = 1; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(x - 9, y + 18 + i * 3.4); c.lineTo(x + 9, y + 20 + i * 3.4); c.stroke(); }
      c.fillStyle = lvl > 0 ? `rgba(255,236,170,${0.55 + 0.4 * lvl})` : 'rgba(200,220,255,.18)'; c.beginPath(); c.arc(x, y, 20, 0, Math.PI * 2); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1.5; c.beginPath(); c.arc(x, y, 20, 0, Math.PI * 2); c.stroke();
      c.strokeStyle = lvl > 0.5 ? '#fff6c8' : lvl > 0 ? '#f0b04a' : '#8a7a5a'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(x - 6, y + 14); c.lineTo(x - 5, y - 2); for (let i = 0; i < 5; i++) c.lineTo(x - 5 + i * 2.5 + 1.25, y - 2 + (i % 2 ? 3 : -3)); c.lineTo(x + 6, y + 14); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.5)'; c.beginPath(); c.ellipse(x - 8, y - 8, 4, 7, -0.6, 0, Math.PI * 2); c.fill();
    }
    function cell(c, x, y) { // 세워 둔 원통 건전지
      c.fillStyle = lg(c, x - 11, 0, x + 11, 0, [[0, '#7a5a12'], [0.4, '#f2c544'], [0.7, '#c99a1c'], [1, '#6e5010']]); c.fillRect(x - 11, y, 22, 44);
      c.fillStyle = lg(c, x - 11, 0, x + 11, 0, [[0, '#2a2f3a'], [0.45, '#5a6170'], [1, '#22262f']]); c.fillRect(x - 11, y + 30, 22, 14);
      c.fillStyle = '#c3c8d0'; c.fillRect(x - 4, y - 4, 8, 4); P.txt(c, '+', x, y + 14, '#3a2a00', '800 13px');
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const g = G(W, H);
        H_ = H; c.drawImage(still(W, H, g), 0, 0, W, H);
        drawParts(c, g);
        // 전구 회로: 전지 → 전구 → 집게
        const lvl = !on ? 0 : on.kind === 'c' ? 1 : on.kind === 's' ? 0.25 + 0.15 * Math.sin(t * 7) : 0;
        c.lineCap = 'round'; c.strokeStyle = '#0b0f18'; c.lineWidth = 6; c.beginPath(); g.loop.forEach(([x, y], i) => c[i ? 'lineTo' : 'moveTo'](x, y)); c.stroke();
        c.strokeStyle = '#d8462f'; c.lineWidth = 4; c.stroke(); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1; c.stroke();
        const [lx, ly] = g.bulb; bulb(c, lx, ly, lvl); P.txt(c, '전구', lx, ly + 46, '#e2e8f4', '700 13px');
        cell(c, W * 0.97, H * 0.3); P.txt(c, '전지', W * 0.95, H * 0.3 + 62, '#e2e8f4', '700 13px', 'right');
        if (lvl > 0) { // 전선 위 전자 점
          const pts = g.loop, L = pts.length - 1;
          for (let k = 0; k < 8; k++) { let f = ((t * 0.35 * (on.kind === 'c' ? 1 : 0.3) + k / 8) % 1) * L; const i = Math.floor(f), u = f - i; const [x1, y1] = pts[i], [x2, y2] = pts[i + 1]; c.fillStyle = '#7fd1ff'; c.beginPath(); c.arc(x1 + (x2 - x1) * u, y1 + (y2 - y1) * u, 4, 0, Math.PI * 2); c.fill(); }
        }
        // 측정 집게: 회로 아래 끝에서 집게까지 전선
        const [px, py] = drag ? [drag.x, drag.y] : on ? (() => { const [a, b, w, h] = g.bx(on.box); return [a + w / 2, b + h / 2]; })() : g.home;
        c.strokeStyle = '#d8462f'; c.lineWidth = 4; c.beginPath(); c.moveTo(W * 0.75, H * 0.62); c.quadraticCurveTo(W * 0.78, H * 0.9, px - 6, py + 6); c.stroke();
        c.strokeStyle = '#1d2433'; c.beginPath(); c.moveTo(W * 0.97, H * 0.62); c.quadraticCurveTo(W * 0.9, H * 0.95, px + 6, py + 6); c.stroke();
        [[px - 7, '#d8462f', '#7a1a10'], [px + 7, '#2a2f3a', '#0b0d12']].forEach(([x, a, b]) => { c.fillStyle = lg(c, x - 5, 0, x + 5, 0, [[0, b], [0.5, a], [1, b]]); c.beginPath(); c.roundRect(x - 5, py - 4, 10, 22, 4); c.fill(); c.fillStyle = '#c8cdd5'; c.beginPath(); c.moveTo(x - 2, py - 4); c.lineTo(x, py - 14); c.lineTo(x + 2, py - 4); c.fill(); });
        if (!on && !drag) P.txt(c, '측정 집게', g.home[0], g.home[1] + 30, '#ffd84d', '800 14px');
        P.txt(c, '빨강 · 검정 = 측정 집게의 두 끝', 12, H - 10, 'rgba(200,212,240,.6)', '600 12px', 'left');
        chip();
      },
      down(p) { const g = G(S.W, S.H); const [hx, hy] = on ? (() => { const [a, b, w, h] = g.bx(on.box); return [a + w / 2, b + h / 2]; })() : g.home; if (Math.hypot(p.x - hx, p.y - hy) < 46) { drag = { x: p.x, y: p.y }; on = null; } },
      move(p, e, held) { if (held && drag) { drag.x = p.x; drag.y = p.y; } },
      up(p) { if (!drag) return; const g = G(S.W, S.H); drag = null; probe(hit(g, p.x, p.y)); },
      key(e) { const i = '123456'.indexOf(e.key); if (i >= 0) { probe(PARTS[i]); return true; } if (e.key === '0') { on = null; seen.clear(); return true; } return false; },
    });
    root._ph = { probe(k) { probe(PARTS.find((q) => q.k === k)); return on ? on.kind : null; }, state: () => ({ on: on && on.k, seen: [...seen] }) };
    console.assert(PARTS.filter((q) => q.kind === 'c').length === 2 && PARTS.filter((q) => q.kind === 's').length === 2, 'phone: 부품 분류');
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Phone = { mount };
})();
