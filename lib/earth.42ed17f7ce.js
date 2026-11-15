/* 2-1 2차시 체험 «지구의 탄생과 생명»(교과서 58쪽 그림 Ⅱ-13 + 참고서 48쪽). 손으로 지구를 만든다:
   ① 둘레를 떠도는 미행성체를 끌어 원시 지구에 던지면 쾅(흔들림) — 지구가 커지고 뜨거워진다. 다섯 번이면 마그마 바다.
   ② 저절로: 무거운 철·니켈 방울이 가라앉아 핵, 산소·규소는 맨틀 → 겉이 식어 원시 지각, 화산 가스로 대기(구름).
   ③ 구름을 문지르면 비가 내려 바다가 차오르고 이산화 탄소가 바다에 녹아 줄어든다 → 바다에서 생명 → 광합성으로 산소 증가.
   오른쪽 막대 = 대기 성분(지금 값 질소 78 %·산소 21 % 말고는 이해를 돕기 위한 어림). Earth.mount(root) → { fit, setActive } · 시험용: root._ea.hit() · rain(양) */
(function () {
  'use strict';
  function mount(root) {
    const stage = root.querySelector('.ea-stage'), out = root.querySelector('.ea-out'), now = root.querySelector('.ea-now');
    const P = window.Play;
    let hits = 0, heat = 0, phase = 'hit', tP = 0, sink = 0, ocean = 0, life = 0, rubbing = null, flash = 0, rocks = [], drops = [], iron = [], drag = null;
    const air = () => { // [이산화 탄소, 질소, 수증기, 산소]
      if (phase === 'hit' || phase === 'magma') return null;
      const o2 = Math.min(21, life * 21), co2 = Math.max(0.04, 50 - ocean * 45 - life * 5), h2o = Math.max(1, 35 - ocean * 30), n2 = 100 - o2 - co2 - h2o;
      return [co2, n2, h2o, o2];
    };
    function spawn(W, H) { rocks = []; for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2 + 0.4; rocks.push({ x: W * 0.36 + Math.cos(a) * W * 0.26, y: H * 0.5 + Math.sin(a) * H * 0.36, vx: -Math.sin(a) * 14, vy: Math.cos(a) * 10 }); } }
    function say(h) { if (out.innerHTML !== h) out.innerHTML = h; }
    function steps() {
      const ok = []; if (hits >= 5) ok.push(1); if (ocean >= 1) ok.push(2); if (life >= 1) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = phase === 'hit' ? `① 미행성체를 끌어 지구에 던지자(${hits}/5)` : phase === 'rain' ? '② 구름을 문질러 비를 내리자' : st === 0 ? '지구와 생명의 역사 = 우주 역사의 일부' : '지켜보자…';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        if (!rocks.length && phase === 'hit') spawn(W, H);
        tP += dt;
        const cx = W * 0.36, cy = H * 0.52, R = Math.min(W * 0.26, H * 0.38) * (0.62 + Math.min(5, hits) * 0.076);
        c.fillStyle = '#0b1026'; c.fillRect(0, 0, W, H);
        // 단계 진행
        if (phase === 'magma' && tP > 1.6) { phase = 'core'; tP = 0; iron = []; for (let i = 0; i < 40; i++) { const a = Math.random() * Math.PI * 2, r = R * (0.6 + Math.random() * 0.35); iron.push({ a, r }); } }
        if (phase === 'core') { sink = Math.min(1, tP / 2.6); if (sink >= 1 && tP > 3.2) { phase = 'crust'; tP = 0; } }
        if (phase === 'crust' && tP > 1.8) { phase = 'rain'; tP = 0; }
        if (phase === 'rain' && ocean >= 1) { phase = 'life'; tP = 0; }
        if (phase === 'life') life = Math.min(1, life + dt * 0.18);
        heat = Math.max(phase === 'hit' ? 0 : 0, heat - dt * (phase === 'crust' || phase === 'rain' || phase === 'life' ? 0.5 : 0.05));
        const air0 = air();
        if (air0) P.glow(c, cx, cy, R + 40, `rgba(160,190,230,${0.18 + ocean * 0.1})`, 'rgba(160,190,230,0)');
        // 지구 몸통
        if (phase === 'hit') { c.fillStyle = `rgb(${138 + heat * 100},${90 + heat * 30},${58})`; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fill(); if (heat > 0.2) P.glow(c, cx, cy, R * 1.1, `rgba(255,120,60,${heat * 0.5})`); }
        else if (phase === 'magma') { const g = c.createRadialGradient(cx, cy, 4, cx, cy, R); g.addColorStop(0, '#ffb347'); g.addColorStop(1, '#e8603c'); c.fillStyle = g; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fill(); for (let i = 0; i < 30; i++) { const a = i * 2.4 + tP, r = R * Math.sqrt((i * 0.37) % 1); c.fillStyle = i % 3 ? '#8d8f94' : '#f0e0b0'; c.beginPath(); c.arc(cx + Math.cos(a) * r, cy + Math.sin(a) * r, 4, 0, Math.PI * 2); c.fill(); } }
        else {
          c.fillStyle = phase === 'core' ? '#e07a42' : '#b8613a'; c.beginPath(); c.arc(cx, cy, R, 0, Math.PI * 2); c.fill();
          c.fillStyle = '#a7adb5'; c.beginPath(); c.arc(cx, cy, R * 0.48 * (phase === 'core' ? sink : 1), 0, Math.PI * 2); c.fill();
          if (phase === 'core') iron.forEach((d) => { const r = d.r + (R * 0.3 - d.r) * sink; c.fillStyle = '#c3c8cf'; c.beginPath(); c.arc(cx + Math.cos(d.a) * r, cy + Math.sin(d.a) * r, 5, 0, Math.PI * 2); c.fill(); });
          if (phase !== 'core') { c.strokeStyle = '#5a3a26'; c.lineWidth = 10; c.beginPath(); c.arc(cx, cy, R - 5, 0, Math.PI * 2); c.stroke(); }
          if (ocean > 0) { c.strokeStyle = '#2a73b8'; c.lineWidth = 4 + ocean * 12; c.beginPath(); c.arc(cx, cy, R + 2, Math.PI * (0.55 - ocean * 0.45), Math.PI * (0.55 + ocean * 0.45)); c.stroke(); }
          if (life > 0) for (let i = 0; i < Math.floor(life * 14); i++) { const a = Math.PI * (0.2 + i * 0.05); c.fillStyle = '#5cc77a'; c.beginPath(); c.arc(cx + Math.cos(a) * (R + 6), cy + Math.sin(a) * (R + 6), 4, 0, Math.PI * 2); c.fill(); }
          P.txt(c, '핵(철·니켈)', cx, cy + 6, '#1d2433', '800 20px'); P.txt(c, '맨틀(산소·규소)', cx, cy - R * 0.66, '#fbfcf9', '700 19px');
          if (phase === 'rain' || phase === 'life' || phase === 'crust') {   // 구름
            for (let i = 0; i < 5; i++) { const x = cx - R * 0.8 + i * R * 0.4, y = cy - R - 60; c.fillStyle = 'rgba(220,226,240,.85)'; c.beginPath(); c.arc(x, y, 26, 0, Math.PI * 2); c.arc(x + 22, y + 6, 20, 0, Math.PI * 2); c.fill(); }
          }
        }
        // 미행성체(끌어 던지기)
        if (phase === 'hit') rocks.forEach((r) => {
          if (r !== drag) { r.x += r.vx * dt; r.y += r.vy * dt; }
          if (Math.hypot(r.x - cx, r.y - cy) < R + 8) { hits += 1; heat = Math.min(1, heat + 0.3); flash = 0.5; window.RxT.jolt(stage, 2); r.dead = true; if (hits >= 5) { phase = 'magma'; tP = 0; } }
          if (!r.dead) { c.fillStyle = '#8d8f94'; c.beginPath(); c.arc(r.x, r.y, 15, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#ffd84d'; c.lineWidth = 2; c.stroke(); }
        });
        rocks = rocks.filter((r) => !r.dead);
        if (phase === 'hit' && !rocks.length && hits < 5) spawn(W, H);
        // 비
        if (rubbing && phase === 'rain') { for (let i = 0; i < 4; i++) drops.push({ x: rubbing.x + (Math.random() - 0.5) * 60, y: rubbing.y, v: 300 }); ocean = Math.min(1, ocean + dt * 0.25); }
        for (let i = drops.length - 1; i >= 0; i--) { const d = drops[i]; d.y += d.v * dt; if (d.y > cy - R) { drops.splice(i, 1); continue; } c.strokeStyle = 'rgba(160,200,255,.85)'; c.lineWidth = 2; c.beginPath(); c.moveTo(d.x, d.y); c.lineTo(d.x - 4, d.y + 14); c.stroke(); }
        if (flash > 0) { c.fillStyle = `rgba(255,220,170,${flash})`; c.fillRect(0, 0, W, H); flash = Math.max(0, flash - dt * 2); }
        // 대기 막대
        const bx = W * 0.75, bw = W * 0.19, top = H * 0.14, bh = H * 0.62, AC = ['#a7adb5', '#7fd1ff', '#cfe9ff', '#5cc77a'], AN = ['이산화 탄소', '질소', '수증기', '산소'];
        P.txt(c, '대기 성분', bx + bw / 2, top - 14, '#fbfcf9', '700 21px');
        if (!air0) P.txt(c, '아직 대기가 거의 없다', bx + bw / 2, top + bh / 2, '#8d97a3', '700 19px');
        else { let y = top + bh; air0.forEach((v, i) => { const h = bh * v / 100; c.fillStyle = AC[i]; c.fillRect(bx, y - h, bw, h); if (v >= 7) P.txt(c, `${AN[i]} ${Math.round(v)}%`, bx + bw / 2, y - h / 2 + 7, '#0b1026', '800 18px'); y -= h; }); c.strokeStyle = '#fbfcf9'; c.lineWidth = 2; c.strokeRect(bx, top, bw, bh); }
        const NM = { hit: '미행성체 충돌', magma: '마그마 바다', core: '맨틀과 핵', crust: '원시 지각', rain: '원시 바다', life: '생명 탄생' };
        P.txt(c, NM[phase], 20, H - 22, '#fbfcf9', '800 30px', 'left');
        say({ hit: '미행성체가 부딪칠 때마다 지구가 <b>커지고 뜨거워진다</b>', magma: '충돌열로 겉이 녹아 <b>마그마 바다</b>', core: '무거운 <b>철·니켈</b>이 가라앉아 핵, 가벼운 <b>산소·규소</b>는 맨틀 — 화산 가스로 대기', crust: '충돌이 줄어 겉이 식어 <b>원시 지각</b>', rain: '수증기가 비로 내려 <b>원시 바다</b> — 이산화 탄소가 바다에 녹아 줄어든다', life: life < 1 ? '바다에서 <b>최초의 생명</b> — 광합성 생물이 <b>산소</b>를 늘린다' : '지금의 대기: <b>질소 78 %, 산소 21 %</b>' }[phase]);
        steps();
      },
      down(p) { if (phase === 'hit') { drag = rocks.find((r) => Math.hypot(r.x - p.x, r.y - p.y) < 30) || null; if (drag) drag.hist = [[p.x, p.y, performance.now()]]; } else if (phase === 'rain') rubbing = p; },
      move(p, e, held) { if (!held) return; if (drag) { drag.x = p.x; drag.y = p.y; drag.hist.push([p.x, p.y, performance.now()]); if (drag.hist.length > 5) drag.hist.shift(); } else if (phase === 'rain') rubbing = p; },
      up() { if (drag) { const h = drag.hist, a = h[0], b = h[h.length - 1], dtm = Math.max(16, b[2] - a[2]) / 1000; drag.vx = (b[0] - a[0]) / dtm; drag.vy = (b[1] - a[1]) / dtm; drag = null; } rubbing = null; },
      key(e) { if (e.key === 'Enter' || e.key === ' ') { if (phase === 'hit' && rocks[0]) { rocks[0].vx = (S.W * 0.36 - rocks[0].x) * 2; rocks[0].vy = (S.H * 0.52 - rocks[0].y) * 2; } else if (phase === 'rain') ocean = Math.min(1, ocean + 0.25); return true; } return false; },
    });
    root.querySelector('.ea-reset').addEventListener('click', () => { hits = 0; heat = 0; phase = 'hit'; tP = 0; ocean = 0; life = 0; rocks = []; S.kick(); });
    root._ea = { hit: () => { const r = rocks[0]; if (r) { r.x = S.W * 0.36; r.y = S.H * 0.52; } S.kick(); }, rain: (k) => { ocean = Math.min(1, ocean + k); S.kick(); } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Earth = { mount };
})();
