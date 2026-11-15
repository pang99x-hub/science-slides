/* 1차시 6장(교과서 41쪽 사고력): 바닷가 공원의 철 난간을 붓으로 칠하고 긁개로 긁는다.
   난간은 10단위 칸으로 나뉘고 칸마다 칠(0/1)과 녹 r(0~1)을 가진다. 처음 칠한 순간부터 날이 흐른다(0.6초에 하루).
   - 맨 철 칸: 비 오는 날에는 빠르게, 마른 날에는 아주 느리게 녹이 늘고, 녹슨 이웃이 있으면 더 번진다(칸마다 빠르기 조금씩 다름).
   - 칠한 칸: 페인트가 산소와 물을 막아 녹이 늘지 않는다. 긁어내면 그 자리부터 다시 녹슨다.
   날짜·빠르기는 이해를 돕기 위한 예.
   미니 게임 «30일 버티기»(2026-10-31): 다 칠한 난간에 바닷바람·비가 몰아치고 자꾸 흠집이 난다(긁힌 자리는 붉게 번쩍).
   흠집을 빨리 다시 칠해 30일 뒤 깨끗한 철을 많이 남긴다. 점수 = 녹이 거의 없는 칸의 비율, 최고 기록은 이 기기에만(localStorage). */
(function () {
  'use strict';
  const { clamp, cpt, hold, mix } = window.RX;
  const DW = 1056, DH = 700, C = 10, BR = 24;
  const PARTS = [[70, 190, 920, 36], [70, 466, 920, 30]];
  for (let i = 0; i < 9; i++) PARTS.push([118 + i * 100, 226, 24, 240]);
  PARTS.push([60, 180, 40, 420], [960, 180, 40, 420]);

  function mount(root) {
    const cv = root.querySelector('canvas');
    const now = root.querySelector('.rx-pt-now'), dayEl = root.querySelector('.rx-pt-day'), msg = root.querySelector('.rx-pt-msg');
    const q = (s) => root.querySelector(s);
    let g = window.Stage.fit(cv);
    const cells = [], map = new Map();
    let seed = 3; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    PARTS.forEach(([x, y, w, h]) => {
      for (let cx = x; cx < x + w; cx += C) for (let cy = y; cy < y + h; cy += C) {
        const key = `${cx / C | 0},${cy / C | 0}`;
        if (map.has(key)) continue;
        const c = { x: cx, y: cy, w: Math.min(C, x + w - cx), h: Math.min(C, y + h - cy), paint: 0, r: 0, k: 0.5 + rnd(), scr: false, tone: rnd() };
        map.set(key, c); cells.push(c);
      }
    });
    const nb = (c) => [[1, 0], [-1, 0], [0, 1], [0, -1]].map(([a, b]) => map.get(`${(c.x / C | 0) + a},${(c.y / C | 0) + b}`)).filter(Boolean);
    cells.forEach((c) => { c.n = nb(c); });
    const drops = Array.from({ length: 90 }, () => ({ x: rnd() * DW, y: rnd() * DH, v: 500 + rnd() * 300 }));
    let tool = 'brush', weather = 'rain', day = 0, started = false, T = 0, raining = false, painted = false, scraped = false, wet = 0;
    let game = false, nextHit = 0, flashes = [], gameEnd = false;
    const BKEY = 'rx121-paint-best';
    const best = () => { try { return +localStorage.getItem(BKEY) || 0; } catch { return 0; } };
    const res = root.querySelector('.rx-pg-res'), gbtn = root.querySelector('.rx-pt-game');

    const tf = () => { const s = Math.min(g.w / DW, g.h / DH); return { s, ox: (g.w - DW * s) / 2, oy: (g.h - DH * s) / 2 }; };
    const toD = (p) => { const t = tf(); return { x: (p.x - t.ox) / t.s, y: (p.y - t.oy) / t.s }; };
    function dab(x, y) {
      for (const c of cells) {
        if (Math.hypot(c.x + c.w / 2 - x, c.y + c.h / 2 - y) > BR) continue;
        if (tool === 'brush') { if (!c.paint) { c.paint = 1; painted = true; } }
        else if (c.paint) { c.paint = 0; c.scr = true; scraped = true; }
      }
      if (!started) { started = true; }
    }
    let last = null;
    hold(cv, {
      down(e) { last = toD(cpt(cv, e)); dab(last.x, last.y); cv.classList.add('holding'); },
      move(e) {
        if (!last) return;
        const p = toD(cpt(cv, e)), d = Math.hypot(p.x - last.x, p.y - last.y), n = Math.max(1, Math.ceil(d / 8));
        for (let i = 1; i <= n; i++) dab(last.x + (p.x - last.x) * i / n, last.y + (p.y - last.y) * i / n);
        last = p;
      },
      up() { last = null; cv.classList.remove('holding'); },
    });
    const seg = (sel, attr, set) => root.querySelectorAll(sel).forEach((b) => b.addEventListener('click', () => {
      root.querySelectorAll(sel).forEach((x) => x.setAttribute('aria-pressed', String(x === b))); set(b.dataset[attr]);
    }));
    seg('[data-tool]', 'tool', (v) => { tool = v; cv.dataset.tool = v; });
    seg('[data-w]', 'w', (v) => { weather = v; });
    cv.dataset.tool = 'brush';
    function reset() { game = false; gameEnd = false; flashes = []; cells.forEach((c) => { c.paint = 0; c.r = 0; c.scr = false; }); day = 0; started = false; painted = false; scraped = false; msg.textContent = ''; now.classList.remove('done'); }
    function scratch() {
      const c0 = cells[Math.floor(rnd() * cells.length)], cx = c0.x + 5, cy = c0.y + 5;
      for (const c of cells) if (Math.hypot(c.x + c.w / 2 - cx, c.y + c.h / 2 - cy) < 48) { c.paint = 0; c.scr = true; }
      flashes.push({ x: cx, y: cy, t: 0 }); scraped = true;
      if (window.RxFx) window.RxFx.buzz([20]);
    }
    const clean = () => Math.round(100 * cells.filter((c) => c.r < 0.2).length / cells.length);
    function startGame() {
      reset(); cells.forEach((c) => { c.paint = 1; }); painted = true; started = true; game = true; nextHit = 0.6;
      weather = 'salt'; root.querySelectorAll('[data-w]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.w === 'salt')));
      tool = 'brush'; cv.dataset.tool = 'brush'; root.querySelectorAll('[data-tool]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.tool === 'brush')));
      if (res) res.innerHTML = '흠집이 나면 바로 붓으로 다시 칠하자!';
    }
    function endGame() {
      game = false; gameEnd = true;
      const sc = clean(), b0 = best(), star = sc >= 90 ? '★★★' : sc >= 75 ? '★★☆' : sc >= 55 ? '★☆☆' : '☆☆☆';
      if (sc > b0) { try { localStorage.setItem(BKEY, String(sc)); } catch { /* 저장 못 함 */ } }
      if (res) res.innerHTML = `<b>깨끗한 철 ${sc}%</b> ${star} · 최고 ${Math.max(sc, b0)}%${sc > b0 && b0 ? ' (새 기록!)' : ''}`;
      if (window.RxFx && res) (sc >= 75 ? window.RxFx.burst : window.RxFx.shake)(res.closest('.rx-pg'));
    }
    if (gbtn) gbtn.addEventListener('click', startGame);
    q('.rx-pt-reset').addEventListener('click', reset);

    function draw() {
      const { ctx } = g, t = tf();
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
      const k = cv.width / g.w; ctx.setTransform(k * t.s, 0, 0, k * t.s, k * t.ox, k * t.oy);
      const sky = ctx.createLinearGradient(0, 0, 0, DH);
      sky.addColorStop(0, raining ? '#9fb0bd' : '#bfe3f2'); sky.addColorStop(1, raining ? '#d3dbe0' : '#eef7fb');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, DW, DH);
      ctx.fillStyle = raining ? '#6f8fa3' : '#5aa2c8'; ctx.fillRect(0, 330, DW, 130);
      ctx.fillStyle = '#c9b48f'; ctx.fillRect(0, 560, DW, 140);
      ctx.fillStyle = '#b39e78'; ctx.fillRect(0, 560, DW, 12);
      for (const c of cells) {
        let col;
        if (c.paint) col = mix('#2f7d5b', '#3f9470', c.tone * 0.6);
        else col = mix(mix('#8d949c', '#a7aeb6', c.tone), c.r > 0.55 ? '#7d3417' : '#b5552a', Math.min(1, c.r * 1.25));
        ctx.fillStyle = col; ctx.fillRect(c.x, c.y, c.w + 0.5, c.h + 0.5);
      }
      if (wet > 0.05) { ctx.fillStyle = `rgba(255,255,255,${0.12 * wet})`; PARTS.forEach(([x, y, w, h]) => ctx.fillRect(x, y, w, h * 0.3)); }
      ctx.strokeStyle = '#1d2433'; ctx.lineWidth = 2.5; PARTS.forEach(([x, y, w, h]) => ctx.strokeRect(x, y, w, h));
      flashes = flashes.filter((f) => f.t < 0.8);
      flashes.forEach((f) => { ctx.strokeStyle = `rgba(224,70,60,${1 - f.t / 0.8})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(f.x, f.y, 46 + f.t * 40, 0, Math.PI * 2); ctx.stroke(); });
      if (raining) { ctx.strokeStyle = 'rgba(60,90,120,.55)'; ctx.lineWidth = 2; ctx.beginPath(); drops.forEach((d) => { ctx.moveTo(d.x, d.y); ctx.lineTo(d.x - 4, d.y + 18); }); ctx.stroke(); }
    }
    function step(dt) {
      T += dt;
      if (started && !gameEnd) {
        day += dt / 0.6;
        if (game) { nextHit -= dt; if (nextHit <= 0) { scratch(); nextHit = 0.5 + rnd() * 0.45; } if (day >= 30) endGame(); }
        const cyc = (day % 6) / 6;
        raining = weather === 'dry' ? cyc < 0.12 : cyc < 0.6;
        wet += ((raining ? 1 : 0) - wet) * Math.min(1, dt * 1.5);
        for (const c of cells) {
          if (c.paint) continue;
          let s = 0; for (const n of c.n) s += n.paint ? 0 : n.r;
          c.r = clamp(c.r + dt * c.k * (0.004 + wet * 0.07) * (1 + 1.5 * s / 4) * (weather === 'salt' ? 1.9 : 1) * (game ? 1.6 : 1), 0, 1);
        }
      }
      flashes.forEach((f) => { f.t += dt; });
      drops.forEach((d) => { d.y += d.v * dt; if (d.y > DH) { d.y = -20; d.x = Math.random() * DW; } });
      draw();
      // 계기
      let pr = 0, pn = 0, br = 0, bn = 0;
      for (const c of cells) if (c.paint) { pn++; } else { br += c.r; bn++; }
      const bare = bn ? br / bn : 0;
      q('.rx-pt-gp').style.width = '0%'; q('.rx-pt-vp').textContent = pn ? '늘지 않음' : '칠한 곳 없음';
      q('.rx-pt-gb').style.width = (bare * 100) + '%'; q('.rx-pt-vb').textContent = bn ? (bare < 0.05 ? '거의 없음' : bare < 0.35 ? '조금' : bare < 0.7 ? '많이' : '심함') : '맨 철 없음';
      void pr;
      dayEl.textContent = started ? `${Math.floor(Math.min(day, game || gameEnd ? 30 : day))}일째${game || gameEnd ? ' / 30일' : ''} · ${raining ? '비' : '맑음'}` : '';
      if (game) { now.textContent = `도전 중 · 흠집을 다시 칠하자! 깨끗한 철 ${clean()}%`; return; }
      if (gameEnd) { now.textContent = '도전 끝! 다시 하려면 «도전» 단추'; now.classList.add('done'); return; }
      if (!started) now.textContent = '① 붓으로 난간 일부를 칠해 보자';
      else if (day < 8) now.textContent = '날이 흐른다 · 어느 쪽이 녹슬까?';
      else if (!scraped) now.textContent = '② 긁개로 칠한 곳을 조금 긁어 보자';
      else { now.textContent = '맨 철과 칠한 곳을 견주어 보자'; now.classList.add('done'); }
      if (started && day > 8 && pn && bn && !msg.textContent) msg.textContent = '맨 철만 붉게 녹슬고, 칠한 곳은 그대로다.';
      if (scraped && day > 8) msg.textContent = '긁힌 자리처럼 맨 철이 드러난 곳부터 녹이 번진다. ' + (weather === 'dry' ? '마른 날이 많으면 훨씬 느리다 → 물도 필요하다.' : weather === 'salt' ? '소금기가 있으면 더 빨리 녹슨다.' : '');
    }
    const loop = window.Stage.loop(step);
    root._game = { start: startGame, finish: () => { if (game) { day = 30; endGame(); } } };
    return {
      setActive(on) { if (on) { g = window.Stage.fit(cv); if (window.Stage.reduce) step(0.016); else loop.start(); } else loop.stop(); },
      fit() { g = window.Stage.fit(cv); draw(); },
      stroke(pts, t = 'brush') { tool = t; pts.forEach(([x, y]) => dab(x, y)); },
      skip(days) { const s = started; started = true; for (let i = 0; i < days * 10; i++) step(0.06); started = s || true; },
      reset,
    };

  }
  window.RxPaint = { mount };
})();
