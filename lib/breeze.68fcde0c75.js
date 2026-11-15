/* 해풍·육풍 조각. 하루 시각 막대를 끌면 해(달)가 하늘을 지나고, 땅·바다 온도가 바뀌며(땅은 크게, 바다는 조금)
   온도가 높은 쪽 공기가 올라가 그쪽 기압이 낮아진다 → 땅 가까이에서는 기압이 높은 쪽에서 낮은 쪽으로 바람.
   낮에는 바다 → 육지(해풍), 밤에는 육지 → 바다(육풍), 아침·저녁 바뀌는 때에는 바람이 약하다.
   온도 곡선은 모양만 보이는 모형(눈금 없음). 깃발·나무·굴뚝 연기가 바람 쪽으로 기운다. */
(function () {
  'use strict';
  const { tok } = window.Stage;
  const TAU = Math.PI * 2;
  // 모형: 땅은 오후 3시 무렵 가장 뜨겁고 새벽에 가장 차다. 바다는 거의 그대로
  const TL = (h) => 0.5 + 0.42 * Math.sin(TAU * (h - 9) / 24);
  const TS = (h) => 0.5 + 0.07 * Math.sin(TAU * (h - 11) / 24);
  const windOf = (h) => Math.max(-1, Math.min(1, (TL(h) - TS(h)) / 0.25));
  const clock = (h) => {
    const H = Math.floor(h + 0.001) % 24, m = Math.round((h - Math.floor(h)) * 6) * 10, mm = m >= 60 || !m ? '' : ` ${m}분`;
    const name = H === 0 ? '밤 12시' : H < 6 ? `새벽 ${H}시` : H < 12 ? `오전 ${H}시` : H === 12 ? '낮 12시' : H < 18 ? `오후 ${H - 12}시` : H < 21 ? `저녁 ${H - 12}시` : `밤 ${H - 12}시`;
    return name + mm;
  };

  function mount(root) {
    const cv = root.querySelector('.wd-cv');
    const range = root.querySelector('#wd-time'), clockEl = root.querySelector('.wd-clock');
    const dayBtn = root.querySelector('#wd-day'), nightBtn = root.querySelector('#wd-night'), playBtn = root.querySelector('#wd-play');
    const nameEl = root.querySelector('.wd-name');
    const chart = root.querySelector('.wd-chart');
    let g = window.Stage.fit(cv), h = 14, s = windOf(14), P = [], t = 0, seededW = 0, playing = false, flap = 0;
    const geo = () => { const { w, h: H } = g, sy = H * 0.64; return { w, H, sy, coast: w * 0.47, x0: w * 0.05, x1: w * 0.95, y0: 96, y1: sy - 12 }; };
    function seed(G) { P = Array.from({ length: 150 }, () => { const x = G.x0 + Math.random() * (G.x1 - G.x0), y = G.y0 + Math.random() * (G.y1 - G.y0); return { x, y, px: x, py: y }; }); }
    const reseed = () => { if (Math.abs(g.w - seededW) > 1) { seed(geo()); seededW = g.w; } };
    function vel(G, x, y) {
      const Lx = G.x1 - G.x0, Ly = G.y1 - G.y0, X = (x - G.x0) / Lx, Y = (y - G.y0) / Ly, A = 140 * Ly / Math.PI;
      return [s * A * (Math.PI / Ly) * Math.sin(Math.PI * X) * Math.cos(Math.PI * Y), -s * A * (Math.PI / Lx) * Math.cos(Math.PI * X) * Math.sin(Math.PI * Y)];
    }
    // 온도 그래프(곡선은 한 번 그리고 지금 시각만 옮긴다)
    const X = (hh) => 40 + 470 * hh / 24, Y = (v) => 130 - 120 * v;
    const curve = (f) => Array.from({ length: 97 }, (_, i) => { const hh = i / 4; return `${i ? 'L' : 'M'}${X(hh).toFixed(1)} ${Y(f(hh)).toFixed(1)}`; }).join('');
    chart.querySelector('.wc-land').setAttribute('d', curve(TL)); chart.querySelector('.wc-sea').setAttribute('d', curve(TS));
    function panel() {
      const now = chart.querySelector('.wc-now');
      now.setAttribute('x1', X(h)); now.setAttribute('x2', X(h));
      const dl = chart.querySelector('.wc-dl'), ds = chart.querySelector('.wc-ds');
      dl.setAttribute('cx', X(h)); dl.setAttribute('cy', Y(TL(h))); ds.setAttribute('cx', X(h)); ds.setAttribute('cy', Y(TS(h)));
      clockEl.textContent = clock(h); range.value = h;
      const w = windOf(h);
      nameEl.innerHTML = w > 0.15 ? '해풍: <b>바다 → 육지</b> · 땅이 더 따뜻할 때' : w < -0.15 ? '육풍: <b>육지 → 바다</b> · 바다가 더 따뜻할 때' : '바람이 약해요 · 땅과 바다 온도가 비슷한 때';
      dayBtn.setAttribute('aria-pressed', String(Math.abs(h - 14) < 0.3)); nightBtn.setAttribute('aria-pressed', String(Math.abs(h - 2) < 0.3));
    }
    function step(dt) {
      const G = geo(); t += dt; flap += dt * (2 + 6 * Math.abs(s));
      if (playing) { h = (h + dt * 1.6) % 24; panel(); }
      const target = windOf(h);
      s += Math.sign(target - s) * Math.min(Math.abs(target - s), dt * 0.9);
      for (const p of P) {
        p.px = p.x; p.py = p.y;
        const [u, v] = vel(G, p.x, p.y);
        p.x += (u + (Math.random() - 0.5) * 24) * dt; p.y += (v + (Math.random() - 0.5) * 24) * dt;
        if (p.x < G.x0 || p.x > G.x1 || p.y < G.y0 || p.y > G.y1 || (Math.hypot(u, v) < 6 && Math.random() < dt * 0.6)) {
          p.x = G.x0 + (0.15 + Math.random() * 0.7) * (G.x1 - G.x0); p.y = G.y0 + (0.15 + Math.random() * 0.7) * (G.y1 - G.y0); p.px = p.x; p.py = p.y;
        }
      }
      draw(G);
    }
    const mixc = (a, b, k) => a.map((v, i) => Math.round(v + (b[i] - v) * k));
    const rgb = (c) => `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
    function pill(ctx, text, x, y, size = 24, fill) {
      ctx.font = `700 ${size}px "IBM Plex Sans KR", sans-serif`; ctx.textAlign = 'center';
      const w = ctx.measureText(text).width + 26, hh = size + 14;
      ctx.fillStyle = fill || tok('paper-2'); ctx.strokeStyle = tok('ink'); ctx.lineWidth = 2;
      ctx.beginPath(); ctx.roundRect(x - w / 2, y - hh / 2 - size * 0.35, w, hh, hh / 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = tok('ink'); ctx.fillText(text, x, y);
    }
    function thermo(ctx, x, y, level, name) {
      ctx.fillStyle = tok('paper-2'); ctx.strokeStyle = tok('ink'); ctx.lineWidth = 2.5;
      ctx.beginPath(); ctx.roundRect(x - 12, y - 128, 24, 120, 12); ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.arc(x, y + 6, 18, 0, TAU); ctx.fillStyle = tok('e-heat'); ctx.fill(); ctx.stroke();
      ctx.fillStyle = tok('e-heat'); ctx.fillRect(x - 5, y - 12 - 104 * level, 10, 104 * level + 10);
      pill(ctx, name, x, y + 52, 20);
    }
    function draw(G) {
      if (g.w < 60 || g.h < 60) return;                       // 숨은 장(크기 0)에서는 그리지 않는다
      const { ctx, w, h: H } = g;
      const day = h >= 6 && h <= 18, sunA = Math.PI * (((day ? h : (h + 12) % 24) - 6) / 12);
      const elev = Math.sin(TAU * (h - 6) / 24);                // -1 한밤 … 1 한낮
      const k = Math.max(0, Math.min(1, (elev + 0.25) / 0.6));  // 0 밤 → 1 낮
      // 하늘(해 질 녘·해 뜰 녘에는 노을)
      const top = mixc([33, 45, 72], [190, 222, 240], k), bot = mixc([60, 76, 104], [236, 245, 248], k);
      const dusk = Math.max(0, 1 - Math.abs(elev) / 0.3) * 0.6;
      const sky = ctx.createLinearGradient(0, 0, 0, G.sy);
      sky.addColorStop(0, rgb(top)); sky.addColorStop(1, rgb(mixc(bot, [250, 196, 140], dusk)));
      ctx.fillStyle = sky; ctx.fillRect(0, 0, w, G.sy);
      // 해·달
      const bx = w * 0.08 + w * 0.84 * (sunA / Math.PI), by = G.sy - 40 - (G.sy - 130) * Math.sin(sunA);
      if (day) {
        ctx.beginPath(); ctx.arc(bx, by, 64, 0, TAU); ctx.fillStyle = 'rgba(245, 207, 58, .25)'; ctx.fill();
        ctx.beginPath(); ctx.arc(bx, by, 38, 0, TAU); ctx.fillStyle = tok('e-light'); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = tok('ink'); ctx.stroke();
      } else {
        for (let i = 0; i < 18; i++) { ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect((i * 173) % w, 20 + (i * 97) % (G.sy * 0.5), 3, 3); }
        ctx.beginPath(); ctx.arc(bx, by, 32, 0, TAU); ctx.fillStyle = '#eef1f5'; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = tok('ink'); ctx.stroke();
        ctx.beginPath(); ctx.arc(bx + 13, by - 8, 28, 0, TAU); ctx.fillStyle = rgb(top); ctx.fill();
      }
      // 바다(물결은 바람 쪽으로 흐른다)
      const sea = ctx.createLinearGradient(0, G.sy, 0, H);
      sea.addColorStop(0, rgb(mixc([40, 70, 110], [91, 159, 214], k))); sea.addColorStop(1, rgb(mixc([25, 45, 80], [58, 120, 180], k)));
      ctx.fillStyle = sea; ctx.fillRect(G.coast - 30, G.sy, w - G.coast + 30, H - G.sy);
      ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 3;
      const span = w - G.coast - 60;
      for (let i = 0; i < 7; i++) { const x = G.coast + 40 + (((i * 131 - t * 30 * s) % span) + span) % span, y = G.sy + 22 + (i % 4) * 26; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 15, y - 8, x + 30, y); ctx.stroke(); }
      // 땅: 풀 · 흙 · 모래사장
      const land = ctx.createLinearGradient(0, G.sy - 20, 0, H);
      land.addColorStop(0, rgb(mixc([70, 92, 62], [150, 190, 108], k))); land.addColorStop(0.18, rgb(mixc([92, 74, 52], [190, 150, 104], k))); land.addColorStop(1, rgb(mixc([70, 56, 40], [160, 124, 84], k)));
      ctx.fillStyle = land; ctx.beginPath(); ctx.moveTo(0, G.sy - 18); ctx.lineTo(G.coast - 120, G.sy - 18); ctx.quadraticCurveTo(G.coast - 40, G.sy - 12, G.coast + 10, G.sy + 6); ctx.lineTo(G.coast + 40, H); ctx.lineTo(0, H); ctx.closePath(); ctx.fill();
      ctx.fillStyle = rgb(mixc([140, 124, 92], [236, 214, 160], k)); ctx.beginPath(); ctx.moveTo(G.coast - 140, G.sy - 17); ctx.quadraticCurveTo(G.coast - 40, G.sy - 12, G.coast + 12, G.sy + 6); ctx.lineTo(G.coast + 30, G.sy + 40); ctx.quadraticCurveTo(G.coast - 60, G.sy + 6, G.coast - 140, G.sy - 4); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = tok('ink'); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(0, G.sy - 18); ctx.lineTo(G.coast - 120, G.sy - 18); ctx.quadraticCurveTo(G.coast - 40, G.sy - 12, G.coast + 10, G.sy + 6); ctx.stroke();
      // 집 · 굴뚝 연기(바람 쪽으로)
      const hx = w * 0.19, hy = G.sy - 18;
      ctx.fillStyle = rgb(mixc([120, 120, 130], [244, 240, 228], k)); ctx.strokeStyle = tok('ink'); ctx.lineWidth = 2.5;
      ctx.fillRect(hx - 50, hy - 64, 100, 64); ctx.strokeRect(hx - 50, hy - 64, 100, 64);
      ctx.fillStyle = tok('wall'); ctx.fillRect(hx + 24, hy - 112, 16, 34); ctx.strokeRect(hx + 24, hy - 112, 16, 34);
      ctx.fillStyle = '#c8402f'; ctx.beginPath(); ctx.moveTo(hx - 62, hy - 62); ctx.lineTo(hx, hy - 108); ctx.lineTo(hx + 62, hy - 62); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = k < 0.4 ? '#ffd76a' : '#cfe0ea';
      for (const dx of [-30, 10]) { ctx.fillRect(hx + dx, hy - 46, 22, 22); ctx.strokeRect(hx + dx, hy - 46, 22, 22); }
      for (let i = 0; i < 5; i++) {
        const a = ((t * 0.6 + i / 5) % 1), x = hx + 32 - s * a * 140, y = hy - 120 - a * 90;
        ctx.beginPath(); ctx.arc(x, y, 8 + a * 14, 0, TAU); ctx.fillStyle = `rgba(200, 205, 212, ${(0.7 * (1 - a)).toFixed(2)})`; ctx.fill();
      }
      // 나무(바람에 기운다)
      const tx = w * 0.34, ty = G.sy - 18, bend = -s * 22;
      ctx.strokeStyle = '#6b4f2a'; ctx.lineWidth = 10; ctx.lineCap = 'round'; ctx.beginPath(); ctx.moveTo(tx, ty); ctx.quadraticCurveTo(tx, ty - 50, tx + bend, ty - 96); ctx.stroke();
      ctx.fillStyle = rgb(mixc([40, 80, 50], [63, 143, 74], k)); ctx.strokeStyle = tok('ink'); ctx.lineWidth = 2;
      for (const [dx, dy, r] of [[0, -110, 34], [-26, -92, 26], [26, -92, 26]]) { ctx.beginPath(); ctx.arc(tx + bend + dx + Math.sin(flap + dx) * 3 * Math.abs(s), ty + dy, r, 0, TAU); ctx.fill(); ctx.stroke(); }
      // 깃발(바람이 불어 가는 쪽으로 펄럭인다)
      const fx = G.coast - 70, fy = G.sy - 14;
      ctx.strokeStyle = tok('ink'); ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(fx, fy); ctx.lineTo(fx, fy - 130); ctx.stroke();
      const dir = s >= 0 ? -1 : 1, len = 26 + 50 * Math.abs(s), droop = 40 * (1 - Math.abs(s));
      ctx.fillStyle = '#d0453a'; ctx.beginPath(); ctx.moveTo(fx, fy - 128);
      for (let i = 0; i <= 8; i++) { const u = i / 8; ctx.lineTo(fx + dir * len * u, fy - 128 + droop * u + Math.sin(flap * 2 - u * 6) * 6 * u * Math.abs(s)); }
      for (let i = 8; i >= 0; i--) { const u = i / 8; ctx.lineTo(fx + dir * len * u, fy - 100 + droop * u + Math.sin(flap * 2 - u * 6) * 6 * u * Math.abs(s)); }
      ctx.closePath(); ctx.fill(); ctx.lineWidth = 2; ctx.stroke();
      // 공기의 한 바퀴(큰 고리 화살표, 바람이 셀수록 진하다): 따뜻한 쪽에서 오르고 찬 쪽에서 내린다
      const a = Math.abs(s);
      if (a > 0.12) {
        const cx = (G.x0 + G.x1) / 2, cy = (G.y0 + G.y1) / 2, rx = (G.x1 - G.x0) * 0.42, ry = (G.y1 - G.y0) * 0.38;
        const col = `rgba(27, 138, 95, ${(0.25 + 0.5 * a).toFixed(2)})`;
        ctx.strokeStyle = col; ctx.fillStyle = col; ctx.lineWidth = 8; ctx.lineCap = 'round';
        for (const [s0, s1] of [[0.15, 0.85], [1.15, 1.85]]) {
          ctx.beginPath(); ctx.ellipse(cx, cy, rx, ry, 0, Math.PI * s0, Math.PI * s1); ctx.stroke();
          // 해풍(s > 0): 아래쪽은 바다 → 땅(왼쪽), 위쪽은 땅 → 바다(오른쪽) = 두 호 모두 각도가 커지는 쪽 → 끝에 화살촉
          const e = Math.PI * (s > 0 ? s1 : s0), ex = cx + rx * Math.cos(e), ey = cy + ry * Math.sin(e);
          const sg = s > 0 ? 1 : -1, dx = -rx * Math.sin(e) * sg, dy = ry * Math.cos(e) * sg, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
          ctx.beginPath(); ctx.moveTo(ex + ux * 18, ey + uy * 18); ctx.lineTo(ex - uy * 14 - ux * 8, ey + ux * 14 - uy * 8); ctx.lineTo(ex + uy * 14 - ux * 8, ey - ux * 14 - uy * 8); ctx.closePath(); ctx.fill();
        }
      }
      // 공기 알갱이
      ctx.lineCap = 'round';
      for (const p of P) {
        ctx.strokeStyle = 'rgba(27, 138, 95, .5)'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(p.px, p.py); ctx.lineTo(p.x + (p.x - p.px) * 4, p.y + (p.y - p.py) * 4); ctx.stroke();
        ctx.beginPath(); ctx.arc(p.x, p.y, 3.2, 0, TAU); ctx.fillStyle = tok('e-kin'); ctx.fill();
      }
      // 온도계 · 기압 · 바람 이름
      thermo(ctx, w * 0.07, G.sy - 40, TL(h), '땅');
      thermo(ctx, w * 0.93, G.sy - 40, TS(h), '바다');
      if (a > 0.15) {
        pill(ctx, s > 0 ? '기압 낮음' : '기압 높음', w * 0.24, G.sy - 160, 22, s > 0 ? '#fde9d9' : '#dcebf7');
        pill(ctx, s > 0 ? '기압 높음' : '기압 낮음', w * 0.74, G.sy - 160, 22, s > 0 ? '#dcebf7' : '#fde9d9');
        pill(ctx, s > 0 ? '해풍 · 바다 → 육지' : '육풍 · 육지 → 바다', G.coast, G.sy - 226, 28, '#e3f1e8');
      } else pill(ctx, '바람이 약한 때', G.coast, G.sy - 226, 26);
    }
    const stopPlay = () => { playing = false; playBtn.setAttribute('aria-pressed', 'false'); playBtn.textContent = '하루 흘려 보기'; };
    const goTo = (to) => {
      stopPlay();
      const o = { h };
      if (window.gsap && !window.Stage.reduce) gsap.to(o, { h: to, duration: 1, ease: 'power2.inOut', onUpdate: () => { h = ((o.h % 24) + 24) % 24; panel(); } });
      else { h = ((to % 24) + 24) % 24; panel(); }
    };
    range.addEventListener('input', () => { stopPlay(); h = Number(range.value); panel(); });
    dayBtn.addEventListener('click', () => goTo(14));
    nightBtn.addEventListener('click', () => goTo(h > 14 ? 26 : 2));
    playBtn.addEventListener('click', () => { playing = !playing; playBtn.setAttribute('aria-pressed', String(playing)); playBtn.textContent = playing ? '멈추기' : '하루 흘려 보기'; });
    panel();
    const l = window.Stage.loop(step);
    return {
      setActive(on) { if (on) { g = window.Stage.fit(cv); reseed(); if (window.Stage.reduce) { s = windOf(h); draw(geo()); } else l.start(); } else l.stop(); },
      fit() { g = window.Stage.fit(cv); reseed(); draw(geo()); },
    };
  }

  window.SeaBreeze = { mount };
})();
