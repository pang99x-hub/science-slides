/* 3차시 2장 «땅을 밀고 당겨 보자»: 땅의 단면(지층 다섯 겹 — 둘째 층은 바다에서 쌓여 조개·암모나이트가 든 층, 그 아래 지각과 맨틀).
   단면을 잡아 가운데로 밀면 지층이 접히고 두꺼워지며 산맥이 솟는다. 쌓인 힘이 일정 넘으면 지진이 난다(흔들림·진원 원·단층 어긋남·지진계).
   바깥으로 벌리면 가운데 땅이 내려앉아 골짜기가 생기고, 마그마가 올라 화산이 터지고, 더 벌리면 바닷물이 들어와 새 바다와 해령이 생긴다.
   d = −1(가장 벌림) ~ +1(가장 밈). 모양·빠르기는 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const sm = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const LAYER = ['#d8c49a', '#9fb3b8', '#c9a77c', '#b9926a', '#a7845f'];

  function mount(root) {
    const stage = root.querySelector('.pl-stage'), cv = stage.querySelector('canvas'), now = root.querySelector('.pl-now');
    const range = root.querySelector('#pl-d'), msg = root.querySelector('.pl-msg');
    const scv = root.querySelector('.pl-seis-cv'), mh = root.querySelector('.pl-mh'), mw = root.querySelector('.pl-mw'), qn = root.querySelector('.pl-qn b');
    const exc = Object.fromEntries([...root.querySelectorAll('.pl-exc')].map((e) => [e.dataset.k, e]));
    const tok = window.Stage.tok;
    let g = window.Stage.fit(cv), sg = window.Stage.fit(scv);
    let d = 0, shown = 0, strain = 0, off = 0, shake = 0, quakes = 0, water = 0, rings = [], blobs = [], t = 0, lastMsg = '', vel = 0;
    const seis = new Float32Array(240); let seisAmp = 0;

    // 휴대폰 진동(지원하는 기기만: 안드로이드 크롬 등. 아이폰 사파리는 진동을 지원하지 않는다)
    const buzz = (pat) => { try { if (navigator.vibrate) navigator.vibrate(pat); } catch { /* 막힌 곳 */ } };
    function quake(kind) {
      quakes++; shake = 1; seisAmp = 1; buzz(kind === 'push' ? [120, 50, 200] : [80, 40, 80]);
      if (kind === 'push') off = Math.min(off + 1, 7);
      rings.push({ k: kind, r: 0 });
      qn.textContent = quakes + '번';
      qn.parentElement.classList.remove('flash'); void qn.parentElement.offsetWidth; qn.parentElement.classList.add('flash');
    }
    function set(nd, fromUser) {
      nd = clamp(nd, -1, 1);
      const dd = nd - d;
      if (fromUser && Math.abs(dd) > 0) { strain += Math.abs(dd) * (Math.abs(nd) > 0.12 ? 1 : 0.2); vel = dd; }
      d = nd; range.value = String(Math.round(d * 100));
      if (strain > 0.16) { strain = 0; if (Math.abs(d) > 0.12) quake(d > 0 ? 'push' : 'pull'); }
    }

    function draw(dt) {
      const { ctx, w, h } = g;
      t += dt;
      shown += (d - shown) * Math.min(1, dt * 7);
      const p = Math.max(shown, 0), q = Math.max(-shown, 0);
      water += ((q > 0.55 ? 1 : 0) - water) * Math.min(1, dt * 1.2);
      shake = Math.max(0, shake - dt * 1.6);
      ctx.save(); ctx.clearRect(0, 0, w, h);
      if (shake > 0) ctx.translate(Math.sin(t * 90) * 9 * shake, Math.cos(t * 77) * 5 * shake);
      const cx = w / 2, y0 = h * 0.37, ySea = y0 + h * 0.035, th = h * 0.04, moho0 = h * 0.78;
      // 하늘·먼 바다
      const sky = ctx.createLinearGradient(0, 0, 0, ySea); sky.addColorStop(0, '#a9d3f0'); sky.addColorStop(1, '#e3f1f8');
      ctx.fillStyle = sky; ctx.fillRect(-20, -20, w + 40, ySea + 20);
      // 맨틀
      const man = ctx.createLinearGradient(0, h * 0.6, 0, h); man.addColorStop(0, '#e5874a'); man.addColorStop(1, '#c4462a');
      ctx.fillStyle = man; ctx.fillRect(-20, h * 0.55, w + 40, h * 0.5);
      const N = 160, X = (i) => -20 + (w + 40) * i / N;
      const gx = (x) => Math.exp(-(((x - cx) / (w * 0.17)) ** 2));
      const fx = cx + w * 0.085;
      const step = (x) => clamp((x - fx) / 8, 0, 1);
      const U = (x) => h * 0.42 * p * gx(x) + off * h * 0.014 * step(x) * gx(x) * sm(0, 0.25, p);
      const fold = (x) => h * 0.028 * p * Math.sin((x - cx) / (w * 0.032)) * gx(x);
      const G = w * 0.24 * q;                      // 벌어진 틈 반쪽 너비
      const sag = h * 0.13 * sm(0, 0.5, q);         // 골짜기 깊이
      const inGap = (x) => Math.abs(x - cx) < G;
      // 층의 경계(i = 0 지표 … 5 지층 바닥), 판의 좌표 x → 그릴 x(벌리면 바깥으로 밀림)
      const shift = (x) => (x < cx ? x - G : x + G);
      const yb = (i, x) => {
        const gg = gx(x);
        return y0 + i * th * (1 + 1.1 * p * gg) - U(x) + fold(x) * (1 - i * 0.12);
      };
      const moho = (x) => moho0 + h * 0.16 * p * gx(x) - h * 0.2 * q * Math.exp(-(((x - cx) / (w * 0.22 + G)) ** 2));
      // 지각(층 아래)
      const band = (top, bot, fill, side) => {
        ctx.beginPath();
        const xs = []; for (let i = 0; i <= N; i++) { const x = X(i); if (side === 'l' ? x > cx : side === 'r' ? x < cx : false) continue; xs.push(x); }
        xs.forEach((x, j) => { const sx = shift(x), y = top(x); j ? ctx.lineTo(sx, y) : ctx.moveTo(sx, y); });
        for (let j = xs.length - 1; j >= 0; j--) { const x = xs[j]; ctx.lineTo(shift(x), bot(x)); }
        ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
      };
      for (const side of ['l', 'r']) {
        band((x) => yb(5, x), moho, '#8f7458', side);
        for (let i = 0; i < 5; i++) band((x) => yb(i, x), (x) => yb(i + 1, x), LAYER[i], side);
      }
      // 층 경계선
      ctx.lineWidth = 1.5; ctx.strokeStyle = 'rgba(29,36,51,.45)';
      for (const side of ['l', 'r']) for (let i = 0; i <= 5; i++) {
        ctx.beginPath(); let first = true;
        for (let k = 0; k <= N; k++) { const x = X(k); if (side === 'l' ? x > cx : x < cx) continue; const sx = shift(x), y = yb(i, x); first ? ctx.moveTo(sx, y) : ctx.lineTo(sx, y); first = false; }
        ctx.stroke();
      }
      // 지표선
      ctx.lineWidth = 3; ctx.strokeStyle = tok('ink');
      for (const side of ['l', 'r']) { ctx.beginPath(); let first = true; for (let k = 0; k <= N; k++) { const x = X(k); if (side === 'l' ? x > cx : x < cx) continue; const sx = shift(x), y = yb(0, x); first ? ctx.moveTo(sx, y) : ctx.lineTo(sx, y); first = false; } ctx.stroke(); }
      // 산꼭대기 눈
      if (p > 0.55) {
        const top = U(cx) - fold(cx);
        ctx.fillStyle = '#f7fbff'; ctx.beginPath();
        let first = true; const lim = y0 - h * 0.17;
        for (let k = 0; k <= N; k++) { const x = X(k), y = yb(0, x); if (y > lim) continue; first ? ctx.moveTo(x, y) : ctx.lineTo(x, y); first = false; }
        ctx.closePath(); ctx.globalAlpha = sm(0.55, 0.8, p); if (!first) ctx.fill(); ctx.globalAlpha = 1; void top;
      }
      // 바다 생물 화석(둘째 층 가운데)
      for (const side of ['l', 'r']) for (let x = 20; x < w; x += 46) {
        if (side === 'l' ? x > cx : x < cx) continue;
        const y = (yb(1, x) + yb(2, x)) / 2, sx = shift(x);
        if (inGap(sx)) continue;
        shell(ctx, sx, y, 5 + 2 * p * gx(x), (x / 46) % 2 < 1);
      }
      // 틈: 내려앉은 골짜기 · 마그마 · 화산 · 바다
      if (q > 0.01) {
        const lx = cx - G, rx = cx + G, floor = (x) => y0 + sag * Math.cos(((x - cx) / (G || 1)) * Math.PI / 2) ** 0.7 + (water > 0.02 ? h * 0.06 * sm(0.5, 0.8, q) : 0);
        // 늘어난 얇은 지각
        ctx.beginPath(); ctx.moveTo(lx, yb(0, cx)); for (let k = 0; k <= 40; k++) { const x = lx + (rx - lx) * k / 40; ctx.lineTo(x, floor(x)); }
        const bot = (x) => { const b = Math.cos(((x - cx) / (G || 1)) * Math.PI / 2); return moho(x) * (1 - b) + (floor(x) + h * 0.07) * b; };
        for (let k = 40; k >= 0; k--) { const x = lx + (rx - lx) * k / 40; ctx.lineTo(x, bot(x)); }
        ctx.closePath(); ctx.fillStyle = water > 0.3 ? '#4a4f5c' : '#8f7458'; ctx.fill();
        ctx.strokeStyle = tok('ink'); ctx.lineWidth = 3; ctx.beginPath(); for (let k = 0; k <= 40; k++) { const x = lx + (rx - lx) * k / 40; k ? ctx.lineTo(x, floor(x)) : ctx.moveTo(x, floor(x)); } ctx.stroke();
        // 정단층(틈 가장자리)
        ctx.setLineDash([8, 6]); ctx.strokeStyle = tok('stamp'); ctx.lineWidth = 2.5;
        [[lx, -1], [rx, 1]].forEach(([x, s]) => { ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x - s * h * 0.06, y0 + h * 0.24); ctx.stroke(); });
        ctx.setLineDash([]);
        // 마그마
        const mt = moho(cx) - (moho(cx) - (floor(cx) + 10)) * sm(0.08, 0.55, q);
        const mg = ctx.createLinearGradient(0, mt, 0, h * 0.8); mg.addColorStop(0, '#ffcf5a'); mg.addColorStop(0.3, '#ff7a2a'); mg.addColorStop(1, '#c4462a');
        ctx.fillStyle = mg; ctx.beginPath(); const mwid = Math.max(14, G * 0.45);
        ctx.moveTo(cx - mwid * 1.6, h * 0.82); ctx.bezierCurveTo(cx - mwid, h * 0.7, cx - mwid * 0.5, mt + 20, cx, mt); ctx.bezierCurveTo(cx + mwid * 0.5, mt + 20, cx + mwid, h * 0.7, cx + mwid * 1.6, h * 0.82); ctx.closePath(); ctx.fill();
        // 화산(틈 가장자리 둘)
        if (q > 0.22 && water < 0.6) {
          const vs = sm(0.22, 0.4, q);
          [cx - G * 0.62, cx + G * 0.62].forEach((x, i) => {
            const by = floor(x), ht = h * 0.09 * vs;
            ctx.fillStyle = '#5b4a3e'; ctx.strokeStyle = tok('ink'); ctx.lineWidth = 2.5;
            ctx.beginPath(); ctx.moveTo(x - ht * 0.9, by + 2); ctx.lineTo(x - ht * 0.18, by - ht); ctx.lineTo(x + ht * 0.18, by - ht); ctx.lineTo(x + ht * 0.9, by + 2); ctx.closePath(); ctx.fill(); ctx.stroke();
            ctx.strokeStyle = '#ff7a2a'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(x, by - ht); ctx.lineTo(x + (i ? 6 : -6), by - ht * 0.3); ctx.stroke();
            if (Math.random() < dt * 22 * vs) blobs.push({ x, y: by - ht, vx: (Math.random() - 0.5) * 120, vy: -160 - Math.random() * 140, life: 1, ash: Math.random() < 0.5 });
          });
        }
        // 바다
        if (water > 0.02) {
          const wl = ySea + (1 - water) * h * 0.2;
          ctx.save(); ctx.beginPath(); ctx.moveTo(lx, wl); for (let k = 0; k <= 40; k++) { const x = lx + (rx - lx) * k / 40; ctx.lineTo(x, Math.max(wl, floor(x))); } ctx.lineTo(rx, wl); ctx.closePath();
          ctx.fillStyle = 'rgba(42,110,190,.78)'; ctx.fill(); ctx.restore();
          ctx.strokeStyle = 'rgba(255,255,255,.7)'; ctx.lineWidth = 2; ctx.beginPath(); for (let x = lx + 8; x < rx - 8; x += 22) { ctx.moveTo(x, wl + 2 + Math.sin(t * 2 + x) * 1.5); ctx.lineTo(x + 10, wl + 2 + Math.sin(t * 2 + x) * 1.5); } ctx.stroke();
          // 해령
          if (water > 0.6) { ctx.strokeStyle = `rgba(255,120,40,${0.6 + 0.4 * Math.sin(t * 4)})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(cx - 14, floor(cx) + 4); ctx.lineTo(cx, floor(cx) - 10); ctx.lineTo(cx + 14, floor(cx) + 4); ctx.stroke(); }
        }
      }
      // 화산 분출물
      blobs = blobs.filter((b) => (b.life -= dt * 0.8) > 0);
      blobs.forEach((b) => { b.vy += 260 * dt; b.x += b.vx * dt; b.y += b.vy * dt; ctx.fillStyle = b.ash ? `rgba(80,74,70,${b.life * 0.6})` : `rgba(255,${120 + 80 * b.life | 0},40,${b.life})`; ctx.beginPath(); ctx.arc(b.x, b.y, b.ash ? 9 * (1.4 - b.life) + 3 : 4, 0, 7); ctx.fill(); });
      // 역단층(밀 때)
      if (p > 0.15) {
        ctx.setLineDash([8, 6]); ctx.strokeStyle = tok('stamp'); ctx.lineWidth = 2.5; ctx.beginPath();
        ctx.moveTo(fx, yb(0, fx) + 4); ctx.lineTo(fx + h * 0.12, yb(5, fx) + h * 0.12); ctx.stroke(); ctx.setLineDash([]);
      }
      // 지진 원
      rings = rings.filter((r) => (r.r += dt * 260) < 260);
      rings.forEach((r) => {
        const ex = r.k === 'push' ? fx + h * 0.06 : cx - G, ey = r.k === 'push' ? yb(5, fx) + h * 0.06 : y0 + h * 0.14;
        ctx.strokeStyle = `rgba(200,64,47,${1 - r.r / 260})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(ex, ey, r.r, 0, 7); ctx.stroke();
        ctx.fillStyle = tok('stamp'); ctx.beginPath(); ctx.arc(ex, ey, 9, 0, 7); ctx.fill();
        if (r.r < 120) window.Stage.label(ctx, '지진!', ex, ey - 22, '800 30px "IBM Plex Sans KR", sans-serif');
      });
      // 손잡이(양쪽 판)
      [[46, 1], [w - 46, -1]].forEach(([x, s]) => {
        const y = y0 + h * 0.2;
        ctx.fillStyle = 'rgba(251,252,249,.92)'; ctx.strokeStyle = tok('ink'); ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect(x - 34, y - 30, 68, 60, 14); ctx.fill(); ctx.stroke();
        ctx.fillStyle = tok('ink'); ctx.beginPath(); ctx.moveTo(x + s * 20, y); ctx.lineTo(x - s * 6, y - 16); ctx.lineTo(x - s * 6, y + 16); ctx.closePath(); ctx.fill();
        ctx.fillRect(x - s * 18 - 4, y - 5, 12, 10);
      });
      // 움직이는 방향 화살표
      if (Math.abs(vel) > 0.002) {
        const s = vel > 0 ? 1 : -1, y = y0 + h * 0.46;
        ctx.strokeStyle = tok('accent'); ctx.lineWidth = 6; ctx.lineCap = 'round';
        [[cx - w * 0.3, s], [cx + w * 0.3, -s]].forEach(([x, dir]) => { ctx.beginPath(); ctx.moveTo(x - 40 * dir, y); ctx.lineTo(x + 40 * dir, y); ctx.moveTo(x + 40 * dir, y); ctx.lineTo(x + 24 * dir, y - 14); ctx.moveTo(x + 40 * dir, y); ctx.lineTo(x + 24 * dir, y + 14); ctx.stroke(); });
        vel *= Math.pow(0.02, dt);
      }
      // 이름표
      const L = (txt, x, y) => window.Stage.label(ctx, txt, x, y, '700 24px "IBM Plex Sans KR", sans-serif');
      L('바다에서 쌓인 층(화석)', 150, (yb(1, 130) + yb(2, 130)) / 2 - 16);
      L('지각', 110, (yb(5, 110) + moho(110)) / 2 + 8);
      L('맨틀', 110, h * 0.9);
      if (p > 0.3) L('산맥이 솟는다', cx, yb(0, cx) - 26);
      if (p > 0.6) L('바다 생물 화석이 높이 올라왔다', cx - w * 0.04, (yb(1, cx) + yb(2, cx)) / 2 - 30);
      if (p > 0.15) L('단층', fx + h * 0.1, yb(3, fx) + 10);
      if (q > 0.12 && water < 0.3) L('땅이 갈라져 내려앉는다', cx, y0 + sag + 40);
      if (q > 0.1) L('마그마', cx, water > 0.3 ? h * 0.74 : Math.min(h * 0.86, moho(cx) - 10));
      if (q > 0.3 && water < 0.6) L('화산', cx - G * 0.62, y0 - h * 0.12);
      if (water > 0.5) { L('새 바다', cx, ySea + 34); L('해령', cx + 60, y0 + sag + h * 0.07); }
      ctx.restore();
      // 지진계
      drawSeis(dt);
      // 계기·설명
      mh.style.width = (clamp(p, 0, 1) * 100).toFixed(1) + '%';
      mw.style.width = (water * clamp(q, 0, 1) * 100).toFixed(1) + '%';
      exc.push.classList.toggle('on', p > 0.25); exc.pull.classList.toggle('on', q > 0.25);
      const m = p > 0.75 ? '높은 산맥이 되었다. 바다에서 쌓인 지층이 산꼭대기 가까이까지 올라갔다. 힘이 쌓일 때마다 지진이 난다.'
        : p > 0.25 ? '두 판이 부딪쳐 지층이 휘어 접히고 두꺼워지며 땅이 솟는다.'
          : q > 0.55 ? '갈라진 틈으로 바닷물이 들어와 새 바다가 생겼다. 바다 밑 가운데에서 마그마가 새 바닥을 만든다(해령).'
            : q > 0.22 ? '땅이 갈라져 골짜기가 생기고, 올라온 마그마로 화산이 터진다.'
              : q > 0.05 ? '두 판이 멀어지며 가운데 땅이 갈라지기 시작한다.' : '두 판이 가만히 있다. 판을 밀거나 벌려 보자.';
      if (m !== lastMsg) { lastMsg = m; msg.textContent = m; }
      now.textContent = p > 0.7 ? '② 이번에는 반대로 벌려 보자' : q > 0.6 ? '바다가 열렸다! 다시 밀어도 된다' : p > 0.05 ? '계속 밀어 보자 — 지진이 날 수도 있다' : q > 0.05 ? '더 벌려 보자' : '판을 잡아 가운데로 밀어 보자';
      now.classList.toggle('done', q > 0.6);
    }
    function shell(ctx, x, y, r, amm) {
      ctx.save(); ctx.translate(x, y); ctx.strokeStyle = 'rgba(29,36,51,.7)'; ctx.fillStyle = '#e9e1cf'; ctx.lineWidth = 1.4;
      if (amm) { ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fill(); ctx.stroke(); ctx.beginPath(); for (let a = 0; a < 12; a += 0.3) { const rr = r * Math.exp(-0.16 * (12 - a)); ctx.lineTo(rr * Math.cos(a), rr * Math.sin(a)); } ctx.stroke(); }
      else { ctx.beginPath(); ctx.moveTo(-r, r * 0.4); ctx.bezierCurveTo(-r, -r * 0.9, r, -r * 0.9, r, r * 0.4); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.beginPath(); for (let k = -2; k <= 2; k++) { ctx.moveTo(0, r * 0.4); ctx.lineTo(k * r * 0.4, -r * 0.4); } ctx.stroke(); }
      ctx.restore();
    }
    function drawSeis(dt) {
      const { ctx, w, h } = sg;
      const n = Math.max(1, Math.round(dt * 120));
      for (let k = 0; k < n; k++) { seis.copyWithin(0, 1); seis[seis.length - 1] = (Math.random() - 0.5) * (0.06 + seisAmp * 1.8) * (1 + Math.sin(t * 40)); seisAmp *= 0.985; }
      ctx.clearRect(0, 0, w, h); ctx.fillStyle = '#fbfcf9'; ctx.fillRect(0, 0, w, h);
      ctx.strokeStyle = '#dbe4e2'; ctx.lineWidth = 1; for (let x = 0; x < w; x += 24) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke(); }
      ctx.strokeStyle = tok('stamp'); ctx.lineWidth = 2; ctx.beginPath();
      for (let i = 0; i < seis.length; i++) { const x = i / (seis.length - 1) * w, y = h / 2 + clamp(seis[i], -1, 1) * h * 0.46; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke();
    }

    // 끌기: 오른쪽 반을 잡고 왼쪽으로(또는 왼쪽 반을 잡고 오른쪽으로) 끌면 밀기
    let drag = null;
    cv.addEventListener('pointerdown', (e) => {
      const r = cv.getBoundingClientRect(); const side = e.clientX - r.left > r.width / 2 ? 1 : -1;
      drag = { id: e.pointerId, x: e.clientX, d0: d, side, k: r.width };
      try { cv.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ }
      cv.classList.add('holding'); e.stopPropagation();
    });
    cv.addEventListener('pointermove', (e) => {
      if (!drag || drag.id !== e.pointerId) return;
      const dx = (e.clientX - drag.x) / drag.k;
      set(drag.d0 - drag.side * dx * 2.6, true);
    });
    const up = (e) => { if (drag && drag.id === e.pointerId) { drag = null; cv.classList.remove('holding'); } };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    range.addEventListener('input', () => set(Number(range.value) / 100, true));
    range.addEventListener('keydown', (e) => e.stopPropagation());
    root.querySelector('#pl-reset').addEventListener('click', () => { set(0); shown = 0; off = 0; quakes = 0; water = 0; strain = 0; qn.textContent = '0번'; blobs = []; rings = []; });

    const loop = window.Stage.loop(draw);
    root._pl = { set: (v) => set(v, true), push: (v) => { for (let i = 1; i <= 20; i++) set(d + (v - d) / (21 - i), true); }, get d() { return d; }, get quakes() { return quakes; } };
    return {
      setActive(on) { if (on) { g = window.Stage.fit(cv); sg = window.Stage.fit(scv); if (window.Stage.reduce) draw(0.5); else loop.start(); } else loop.stop(); },
      fit() { g = window.Stage.fit(cv); sg = window.Stage.fit(scv); draw(0.016); },
    };
  }

  window.Plates = { mount };
})();
