/* 엘니뇨의 영향(교과서 87쪽 그림 Ⅱ-14, 12~2월): 태평양이 가운데 오는 세계 지도(캔버스, 경도 0°~330°, 위도 70°N~60°S).
   지도 위 «엘니뇨 돋보기»(원)를 끌고 다니면(그림 어디를 눌러도 돋보기가 온다, ←↑↓→ 키도) 돋보기 안에서만 엘니뇨 때의 날씨가 보인다.
   돋보기 가운데가 한 지역에 머무르면 오른쪽에 그곳 날씨와 생활에 생기는 일이 나온다. 지역 범위는 교과서 그림을 어림해 다시 그림. */
(function () {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const CAT = {
    hot: ['고온', '#f2a0a0'], wet: ['다습', '#4fc1b6'], dry: ['건조', '#ecd9a6'], hw: ['고온 다습', '#98d38a'], cw: ['한랭 다습', '#4f6f8f'], wd: ['온난 건조', '#b88a63'],
  };
  // [이름, 범주, 경도(0~360), 위도, 반지름 경도, 반지름 위도, 날씨, 생활]
  const REG = [
    ['적도 중·동태평양', 'hw', 220, 0, 52, 6, '바닷물이 평소보다 따뜻해 구름이 잘 생기고 비가 많다', '바다 생물의 서식지가 바뀐다'],
    ['에콰도르·페루 해안', 'hw', 278, -4, 7, 7, '상승 기류가 생겨 평소보다 비가 많이 온다', '홍수 피해 · 찬물이 덜 솟아 어획량이 줄어든다'],
    ['인도네시아·오스트레일리아 북부', 'dry', 130, -6, 30, 12, '하강 기류가 생겨 비가 줄어든다', '가뭄·산불 피해 · 농작물 수확이 준다'],
    ['인도네시아 남부', 'wd', 118, -9, 11, 7, '따뜻하고 메마르다', '가뭄으로 물이 모자라고 산불이 난다'],
    ['인도·동남아시아', 'hot', 92, 13, 22, 11, '평소보다 기온이 높다', '더위로 농작물 재배가 어려워진다'],
    ['일본 부근', 'hot', 140, 37, 8, 6, '겨울이 평소보다 따뜻하다', '겨울 작물·생물의 생활 시기가 바뀐다'],
    ['중국 남부', 'wet', 114, 25, 6, 4, '평소보다 비가 많다', '물난리 위험이 커진다'],
    ['북아메리카 북서부', 'hot', 215, 57, 22, 7, '겨울이 평소보다 따뜻하다', '눈이 덜 와 봄철 물 공급이 줄 수 있다'],
    ['미국 멕시코만 연안', 'wet', 264, 30, 6, 3, '평소보다 비가 많다', '홍수 대비가 필요하다'],
    ['미국 남동부', 'cw', 277, 33, 6, 4, '평소보다 서늘하고 비가 많다', '농사철 날씨가 달라진다'],
    ['남아메리카 북부', 'dry', 298, 4, 9, 6, '비가 평소보다 적다', '가뭄으로 숲과 농작물이 피해를 입는다'],
    ['브라질 동부', 'hot', 318, -18, 5, 8, '평소보다 덥다', '더위·가뭄 피해'],
    ['남아메리카 남동부', 'wet', 304, -33, 6, 5, '평소보다 비가 많다', '홍수 피해가 생긴다'],
    ['동아프리카', 'wet', 38, -2, 5, 6, '평소보다 비가 많다', '홍수와 물을 통한 질병이 늘 수 있다'],
    ['아프리카 남부', 'wd', 28, -22, 10, 9, '따뜻하고 메마르다', '가뭄으로 옥수수 같은 농작물 수확이 준다'],
  ];
  const LO0 = 0, LO1 = 330, LA0 = 70, LA1 = -60;

  function mount(root) {
    const stage = root.querySelector('.ln-stage'), cv = stage.querySelector('canvas'), now = stage.querySelector('.ln-now');
    const it = root.querySelector('.ln-it'), iw = root.querySelector('.ln-iw'), il = root.querySelector('.ln-il'), cat = root.querySelector('.ln-cat'), seenEl = root.querySelector('.ln-seen');
    let g = window.Stage.fit(cv), lens = null, tm = 0, cur = null;
    const seen = new Set();
    const P = (lo, la) => { const L = lo < LO0 - 20 ? lo + 360 : lo; return [(L - LO0) / (LO1 - LO0) * g.w, (LA0 - la) / (LA0 - LA1) * g.h]; };
    const PP = (lo, la) => [(lo - LO0) / (LO1 - LO0) * g.w, (LA0 - la) / (LA0 - LA1) * g.h];
    const R = () => Math.min(g.w, g.h) * 0.2;
    function base(c) {
      c.fillStyle = '#bcdcef'; c.fillRect(0, 0, g.w, g.h);
      window.World.draw(c, PP, { land: '#e9e3d0', edge: 'rgba(29,36,51,.45)', lw: 1.2, wrap: true });
      c.strokeStyle = 'rgba(29,36,51,.25)'; c.setLineDash([6, 6]); c.lineWidth = 1.2;
      const [, ye] = PP(0, 0); c.beginPath(); c.moveTo(0, ye); c.lineTo(g.w, ye); c.stroke(); c.setLineDash([]);
      window.Stage.label(c, '적도', 34, ye - 8, '600 15px "IBM Plex Sans KR", sans-serif');
    }
    function nino(c) {
      REG.forEach(([, k, lo, la, rx, ry]) => {
        const [x, y] = PP(lo, la), sx = rx / (LO1 - LO0) * g.w, sy = ry / (LA0 - LA1) * g.h;
        c.fillStyle = CAT[k][1]; c.globalAlpha = 0.82; c.beginPath(); c.ellipse(x, y, sx, sy, 0, 0, 7); c.fill(); c.globalAlpha = 1;
        // 날씨 그림
        if (k === 'wet' || k === 'hw' || k === 'cw') { c.strokeStyle = '#1f5c9a'; c.lineWidth = 2; for (let i = 0; i < 4; i++) { const u = (tm * 0.9 + i / 4) % 1; const dx = (i - 1.5) * Math.min(sx, 30) * 0.5; c.beginPath(); c.moveTo(x + dx, y - 8 + u * 16); c.lineTo(x + dx - 2, y - 2 + u * 16); c.stroke(); } }
        if (k === 'hot' || k === 'wd') { c.fillStyle = '#e8742c'; c.beginPath(); c.arc(x, y, 7 + Math.sin(tm * 4) * 1.5, 0, 7); c.fill(); }
        if (k === 'dry' || k === 'wd') { c.strokeStyle = '#8a6a3a'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 12, y + 8); c.lineTo(x - 4, y + 2); c.lineTo(x + 2, y + 9); c.lineTo(x + 12, y + 3); c.stroke(); }
      });
    }
    function draw() {
      const c = g.ctx; base(c);
      window.Stage.label(c, '평상시 세계 지도', g.w - 100, 24, '700 17px "IBM Plex Sans KR", sans-serif');
      if (!lens) lens = { x: g.w * 0.3, y: g.h * 0.55 };
      c.save(); c.beginPath(); c.arc(lens.x, lens.y, R(), 0, 7); c.clip(); nino(c); c.restore();
      c.strokeStyle = '#1d2433'; c.lineWidth = 6; c.beginPath(); c.arc(lens.x, lens.y, R(), 0, 7); c.stroke();
      c.strokeStyle = '#ffe27a'; c.lineWidth = 3; c.stroke();
      const a = Math.PI / 4, hx = lens.x + Math.cos(a) * R(), hy = lens.y + Math.sin(a) * R();
      c.strokeStyle = '#1d2433'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(hx, hy); c.lineTo(hx + 34, hy + 34); c.stroke();
      window.Stage.label(c, '엘니뇨 돋보기', lens.x, lens.y - R() - 10, '700 17px "IBM Plex Sans KR", sans-serif');
      c.fillStyle = '#1d2433'; c.beginPath(); c.arc(lens.x, lens.y, 4, 0, 7); c.fill();
    }
    function locate() {
      const lo = LO0 + lens.x / g.w * (LO1 - LO0), la = LA0 - lens.y / g.h * (LA0 - LA1);
      let best = null, bs = Infinity;
      REG.forEach((r) => { const d = ((lo - r[2]) / r[4]) ** 2 + ((la - r[3]) / r[5]) ** 2; if (d <= 1.15 && r[4] * r[5] < bs) { bs = r[4] * r[5]; best = r; } });
      if (best === cur) return;
      cur = best;
      if (!best) { it.textContent = '돋보기 가운데를 색칠된 지역에 맞춰 보자'; iw.textContent = ''; il.textContent = ''; cat.textContent = ''; cat.style.background = 'transparent'; return; }
      seen.add(best[0]);
      it.textContent = best[0]; cat.textContent = CAT[best[1]][0]; cat.style.background = CAT[best[1]][1];
      iw.textContent = best[6]; il.textContent = best[7];
      root._lensSeen=[...seen]; seenEl.textContent = `살펴본 지역 ${seen.size} / ${REG.length}`;
      now.textContent = seen.size < 3 ? '돋보기를 끌고 다니며 지역을 살펴보자' : '서태평양은 마르고, 동태평양은 비가 많다';
      now.classList.toggle('done', seen.size >= 3);
    }
    const local = (e) => { const r = cv.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * g.w, y: (e.clientY - r.top) / r.height * g.h }; };
    let down = false;
    cv.addEventListener('pointerdown', (e) => { down = true; try { cv.setPointerCapture(e.pointerId); } catch { /* 합성 */ } lens = local(e); locate(); draw(); });
    cv.addEventListener('pointermove', (e) => { if (!down) return; const p = local(e); lens = { x: clamp(p.x, 0, g.w), y: clamp(p.y, 0, g.h) }; locate(); draw(); });
    const up = () => { down = false; };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    cv.addEventListener('keydown', (e) => { const d = { ArrowLeft: [-20, 0], ArrowRight: [20, 0], ArrowUp: [0, -20], ArrowDown: [0, 20] }[e.key]; if (d && lens) { e.preventDefault(); e.stopPropagation(); lens = { x: clamp(lens.x + d[0], 0, g.w), y: clamp(lens.y + d[1], 0, g.h) }; locate(); draw(); } });
    const loop = window.Stage.loop((dt) => { tm += dt; draw(); });
    root._lens = { go(lo, la) { lens = { x: (lo - LO0) / (LO1 - LO0) * g.w, y: (LA0 - la) / (LA0 - LA1) * g.h }; locate(); draw(); } };
    void P;
    return {
      setActive(on) { if (on) { const ow = g.w; g = window.Stage.fit(cv); if (lens && ow) { lens.x *= g.w / ow; lens.y *= g.h / (g.h || 1); } draw(); if (!window.Stage.reduce) loop.start(); } else loop.stop(); },
      fit() { g = window.Stage.fit(cv); draw(); },
    };
  }
  window.Lens = { mount };
})();
