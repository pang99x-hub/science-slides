/* 물의 순환 조각. 물방울이 바다 → 증발(열) → 구름(위치) → 비(운동) → 산 위 호수(위치) → 댐·수력 발전소(전기 번쩍)
   → 강(운동) → 바다로 돈다. 물방울 색은 그 순간 물이 가진(옮기는) 에너지. 발전소 전기는 전선을 따라 마을 불빛이 된다.
   «물방울 하나 따라가기»: 한 방울에 고리를 두르고 지금 단계와 에너지를 말풍선으로 보여 준다.
   오른쪽 단계 카드를 누르면 그림에서 그 부분이 강조된다. 발전소를 끄면 물은 댐을 넘어 그냥 흐르고 마을이 어두워진다. */
(function () {
  'use strict';
  const { tok, label } = window.Stage;
  const TAU = Math.PI * 2;
  const SAY = {
    sea: '바다 · 햇볕에 데워지길 기다려요', evap: '증발 · 열에너지를 받아 올라가요', drift: '수증기 · 높이 올라가 구름으로',
    cloud: '구름 · 높은 곳의 물(위치 에너지)', rain: '비 · 떨어지며 운동 에너지', lake: '호수 · 높은 곳에 모인 물(위치 에너지)',
    fall: '댐 아래로 · 터빈을 돌려 전기로', river: '강 · 흘러가는 운동 에너지',
  };

  function mount(root) {
    const cv = root.querySelector('.wt-cv');
    const damBtn = root.querySelector('#wt-dam'), followBtn = root.querySelector('#wt-follow'), nEl = root.querySelector('.wt-n');
    let g = window.Stage.fit(cv), D = [], sparks = [], dam = true, turned = 0, t = 0, seededW = 0, glow = 0, watched = null, focus = null;
    const geo = () => {
      const { w, h } = g, sea = h * 0.8, plain = h * 0.78;
      const peak = { x: w * 0.18, y: h * 0.27 }, foot = w * 0.46;
      const ground = (x) => (x <= peak.x ? sea - (sea - peak.y) * (x / peak.x) : x <= foot ? peak.y + (plain - peak.y) * ((x - peak.x) / (foot - peak.x)) : plain);
      const ly = h * 0.42, lx0 = peak.x + (foot - peak.x) * ((ly - peak.y) / (plain - peak.y)) + 4, damX = w * 0.33;
      const tx = w * 0.37, turb = { x: tx, y: ground(tx) };
      return {
        w, h, sea, plain, peak, foot, ground, coast: w * 0.63,
        cloud: { x: w * 0.27, y: h * 0.15 }, lake: { x0: lx0, x1: damX, y: ly }, damX, turb,
        river: [[tx, turb.y], [w * 0.41, ground(w * 0.41)], [foot, plain + 10], [w * 0.55, plain + 18], [w * 0.66, sea + 16]],
        town: { x: w * 0.5, y: plain },
      };
    };
    const fresh = (G, st) => ({ st: st || 'sea', x: G.w * (0.68 + Math.random() * 0.28), y: G.sea - 4, wait: Math.random() * 2.5, i: 0, tx: G.cloud.x + (Math.random() - 0.5) * 150, vy: 0, up: 120 + Math.random() * 50 });
    function seed(G) {
      D = [];
      for (let i = 0; i < 70; i++) {
        const d = fresh(G), r = Math.random();
        if (r < 0.3) { d.st = 'evap'; d.y = G.sea - Math.random() * (G.sea - G.cloud.y); }
        else if (r < 0.45) { d.st = 'cloud'; d.x = d.tx; d.y = G.cloud.y + (Math.random() - 0.5) * 30; d.wait = Math.random() * 2; }
        else if (r < 0.6) { d.st = 'lake'; d.x = G.lake.x0 + Math.random() * (G.lake.x1 - G.lake.x0); d.y = G.lake.y + 6; d.wait = Math.random() * 2; }
        else if (r < 0.8) { d.st = 'river'; d.i = Math.floor(Math.random() * (G.river.length - 1)); [d.x, d.y] = G.river[d.i]; }
        D.push(d);
      }
      watched = null;
    }
    const reseed = () => { if (Math.abs(g.w - seededW) > 1) { seed(geo()); seededW = g.w; } };
    function step(dt) {
      const G = geo(); t += dt; glow = Math.max(0, glow - dt * 0.35);
      for (const d of D) {
        if (d.st === 'sea') { d.wait -= dt; if (d.wait < 0) d.st = 'evap'; }
        else if (d.st === 'evap') { d.y -= d.up * dt; d.x += Math.sin(t * 3 + d.tx) * 20 * dt; if (d.y < G.cloud.y + 40) d.st = 'drift'; }
        else if (d.st === 'drift') {
          const dx = d.tx - d.x; d.x += Math.sign(dx) * Math.min(Math.abs(dx), 180 * dt); d.y += (G.cloud.y + (Math.random() - 0.5) * 20 - d.y) * dt;
          if (Math.abs(dx) < 4) { d.st = 'cloud'; d.wait = 0.4 + Math.random() * 1.8; }
        } else if (d.st === 'cloud') { d.wait -= dt; if (d.wait < 0) { d.st = 'rain'; d.x = G.lake.x0 + 6 + Math.random() * (G.lake.x1 - G.lake.x0 - 12); d.vy = 40; } }
        else if (d.st === 'rain') { d.vy += 500 * dt; d.y += d.vy * dt; if (d.y > G.lake.y + 4) { d.st = 'lake'; d.y = G.lake.y + 6; d.wait = 0.4 + Math.random() * 1.6; } }
        else if (d.st === 'lake') { d.wait -= dt; d.x += 18 * dt; if (d.wait < 0 || d.x > G.damX - 6) { d.st = 'fall'; d.x = G.damX + 6; d.y = G.lake.y + 10; d.vy = 60; } }
        else if (d.st === 'fall') {
          d.vy += 600 * dt; d.y += d.vy * dt; d.x += (G.turb.x - d.x) * 4 * dt;
          if (d.y >= G.turb.y - 4) {
            d.st = 'river'; d.i = 0; [d.x, d.y] = G.river[0];
            if (dam) { turned++; nEl.textContent = turned; glow = Math.min(1, glow + 0.18); sparks.push({ x: G.turb.x + 34, y: G.turb.y - 46, t: 0 }); }
          }
        } else if (d.st === 'river') {
          const [nx, ny] = G.river[d.i + 1], dx = nx - d.x, dy = ny - d.y, dd = Math.hypot(dx, dy);
          if (dd < 5) { d.i++; if (d.i >= G.river.length - 1) Object.assign(d, fresh(G)); continue; }
          d.x += dx / dd * 140 * dt; d.y += dy / dd * 140 * dt;
        }
        if (d === watched) { d.trail = d.trail || []; d.trail.push([d.x, d.y]); if (d.trail.length > 240) d.trail.shift(); }
      }
      if (followBtn.getAttribute('aria-pressed') === 'true' && !watched) { watched = D.find((d) => d.st === 'sea') || D[0]; watched.trail = []; }
      for (const s of sparks) s.t += dt;
      sparks = sparks.filter((s) => s.t < 0.5);
      if (focus && t > focus.until) focus = null;
      draw(G);
    }
    const COLOR = { evap: 'e-heat', drift: 'e-pot', cloud: 'e-pot', rain: 'e-kin', lake: 'e-pot', fall: 'e-kin', river: 'e-kin' };
    function cloud(ctx, x, y) {
      const puffs = [[-90, 10, 40], [-40, -18, 52], [20, -24, 56], [80, 0, 44], [0, 18, 46], [-60, 26, 34], [60, 24, 36]];
      ctx.fillStyle = '#ffffff'; ctx.strokeStyle = tok('ink'); ctx.lineWidth = 2.5; ctx.beginPath();
      for (const [dx, dy, r] of puffs) { ctx.moveTo(x + dx + r, y + dy); ctx.arc(x + dx, y + dy, r, 0, TAU); }
      ctx.fill(); ctx.stroke(); ctx.fillStyle = '#ffffff';
      for (const [dx, dy, r] of puffs) { ctx.beginPath(); ctx.arc(x + dx, y + dy, r - 2, 0, TAU); ctx.fill(); }
      ctx.fillStyle = 'rgba(58, 143, 208, .12)'; ctx.beginPath(); ctx.ellipse(x, y + 30, 120, 18, 0, 0, TAU); ctx.fill();
    }
    function draw(G) {
      if (g.w < 60 || g.h < 60) return;                       // 숨은 장(크기 0)에서는 그리지 않는다
      const { ctx, w, h } = g;
      ctx.clearRect(0, 0, w, h);
      const sky = ctx.createLinearGradient(0, 0, 0, G.sea);
      sky.addColorStop(0, '#d4e9f3'); sky.addColorStop(1, '#f0f7f8');
      ctx.fillStyle = sky; ctx.fillRect(0, 0, w, h);
      // 해와 바다를 데우는 햇살
      const sx = w - 84, sy = 76;
      ctx.beginPath(); ctx.arc(sx, sy, 70, 0, TAU); ctx.fillStyle = 'rgba(245, 207, 58, .22)'; ctx.fill();
      ctx.strokeStyle = 'rgba(138, 106, 0, .35)'; ctx.lineWidth = 3; ctx.setLineDash([10, 12]); ctx.lineDashOffset = -t * 30;
      for (const tx of [0.7, 0.8, 0.9]) { ctx.beginPath(); ctx.moveTo(sx - 20, sy + 30); ctx.lineTo(w * tx, G.sea - 6); ctx.stroke(); }
      ctx.setLineDash([]);
      ctx.beginPath(); ctx.arc(sx, sy, 42, 0, TAU); ctx.fillStyle = tok('e-light'); ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = tok('ink'); ctx.stroke();
      // 바다(데워져 반짝이는 물결)
      const sea = ctx.createLinearGradient(0, G.sea, 0, h);
      sea.addColorStop(0, '#5b9fd6'); sea.addColorStop(1, '#3a78b4');
      ctx.fillStyle = sea; ctx.fillRect(G.coast - 20, G.sea, w - G.coast + 20, h - G.sea);
      ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 3;
      for (let i = 0; i < 6; i++) { const x = G.coast + 30 + ((i * 97 + t * 18) % (w - G.coast - 80)), y = G.sea + 18 + (i % 3) * 24; ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + 15, y - 7, x + 30, y); ctx.stroke(); }
      // 들판(마을)
      ctx.fillStyle = '#9fbf72'; ctx.fillRect(G.foot - 40, G.plain, G.coast - G.foot + 60, h - G.plain);
      ctx.fillStyle = '#c9a77c'; ctx.fillRect(G.foot - 40, G.plain + 26, G.coast - G.foot + 60, h - G.plain);
      // 산(눈 덮인 꼭대기, 나무)
      const mt = ctx.createLinearGradient(0, G.peak.y, 0, h);
      mt.addColorStop(0, '#7aa863'); mt.addColorStop(1, '#4f7d44');
      ctx.beginPath(); ctx.moveTo(0, h); ctx.lineTo(0, G.sea); ctx.lineTo(G.peak.x, G.peak.y); ctx.lineTo(G.foot, G.plain); ctx.lineTo(G.foot, h); ctx.closePath();
      ctx.fillStyle = mt; ctx.fill(); ctx.lineWidth = 2.5; ctx.strokeStyle = tok('ink'); ctx.stroke();
      const sn = 0.16;
      ctx.beginPath(); ctx.moveTo(G.peak.x, G.peak.y);
      ctx.lineTo(G.peak.x * (1 - sn), G.peak.y + (G.sea - G.peak.y) * sn); ctx.lineTo(G.peak.x * (1 - sn / 2), G.peak.y + (G.sea - G.peak.y) * sn * 0.8);
      ctx.lineTo(G.peak.x + (G.foot - G.peak.x) * sn * 0.4, G.peak.y + (G.plain - G.peak.y) * sn * 0.9); ctx.lineTo(G.peak.x + (G.foot - G.peak.x) * sn * 0.8, G.peak.y + (G.plain - G.peak.y) * sn * 0.85); ctx.closePath();
      ctx.fillStyle = '#ffffff'; ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#2d6b36';
      for (const fx of [0.04, 0.09, 0.13, 0.42]) { const x = w * fx, y = G.ground(x); ctx.beginPath(); ctx.moveTo(x, y - 34); ctx.lineTo(x - 13, y + 2); ctx.lineTo(x + 13, y + 2); ctx.closePath(); ctx.fill(); }
      // 호수와 댐
      const ly = G.lake.y, lx0 = G.lake.x0, lx1 = G.damX;
      ctx.beginPath(); ctx.moveTo(lx0, ly); ctx.lineTo(lx1, ly); ctx.lineTo(lx1, G.ground(lx1)); ctx.closePath();
      ctx.fillStyle = '#5b9fd6'; ctx.fill(); ctx.lineWidth = 2; ctx.strokeStyle = tok('ink'); ctx.stroke();
      ctx.fillStyle = '#c3cbd2'; ctx.beginPath(); ctx.moveTo(G.damX - 4, ly - 18); ctx.lineTo(G.damX + 10, ly - 18); ctx.lineTo(G.damX + 18, G.ground(G.damX + 18)); ctx.lineTo(G.damX - 4, G.ground(G.damX - 4)); ctx.closePath(); ctx.fill(); ctx.stroke();
      // 발전소와 전선 → 마을
      const px = G.turb.x, py = G.turb.y;
      ctx.fillStyle = dam ? '#e6ece9' : '#d0d4d8'; ctx.fillRect(px + 6, py - 70, 66, 54); ctx.strokeRect(px + 6, py - 70, 66, 54);
      ctx.beginPath(); ctx.arc(px + 39, py - 43, 15, 0, TAU); ctx.stroke();
      ctx.save(); ctx.translate(px + 39, py - 43); ctx.rotate(dam ? t * 6 : 0); ctx.beginPath(); for (let i = 0; i < 4; i++) { ctx.rotate(Math.PI / 2); ctx.moveTo(0, 0); ctx.lineTo(13, 0); } ctx.stroke(); ctx.restore();
      const tw = { x: (px + 72 + G.town.x) / 2, y: G.plain - 120 };
      ctx.strokeStyle = tok('ink'); ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(tw.x, G.plain); ctx.lineTo(tw.x - 14, tw.y + 8); ctx.lineTo(tw.x + 14, tw.y + 8); ctx.closePath(); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(tw.x - 20, tw.y + 10); ctx.lineTo(tw.x + 20, tw.y + 10); ctx.stroke();
      ctx.strokeStyle = tok('e-elec'); ctx.lineWidth = 4;
      ctx.beginPath(); ctx.moveTo(px + 72, py - 62); ctx.quadraticCurveTo((px + 72 + tw.x) / 2, py - 40, tw.x, tw.y + 10); ctx.quadraticCurveTo((tw.x + G.town.x) / 2, tw.y + 40, G.town.x + 10, G.plain - 56); ctx.stroke();
      if (dam && glow > 0.05) { ctx.setLineDash([6, 18]); ctx.lineDashOffset = -t * 120; ctx.strokeStyle = tok('e-light'); ctx.lineWidth = 6; ctx.stroke(); ctx.setLineDash([]); }
      for (const [dx, hh] of [[0, 52], [56, 42], [104, 58]]) {     // 마을: 전기가 오면 창에 불이 켜진다
        const x = G.town.x + dx, y = G.plain;
        ctx.fillStyle = '#f4f0e4'; ctx.strokeStyle = tok('ink'); ctx.lineWidth = 2.5; ctx.fillRect(x, y - hh, 44, hh); ctx.strokeRect(x, y - hh, 44, hh);
        ctx.fillStyle = '#c8402f'; ctx.beginPath(); ctx.moveTo(x - 6, y - hh); ctx.lineTo(x + 22, y - hh - 22); ctx.lineTo(x + 50, y - hh); ctx.closePath(); ctx.fill(); ctx.stroke();
        const on = dam ? glow : 0;
        ctx.fillStyle = `rgba(${(200 + 55 * on) | 0}, ${(205 + 30 * on) | 0}, ${(215 - 120 * on) | 0}, 1)`; ctx.fillRect(x + 12, y - hh + 12, 20, 16); ctx.strokeRect(x + 12, y - hh + 12, 20, 16);
        if (on > 0.2) { ctx.beginPath(); ctx.arc(x + 22, y - hh + 20, 22 * on, 0, TAU); ctx.fillStyle = `rgba(245, 207, 58, ${(0.35 * on).toFixed(2)})`; ctx.fill(); }
      }
      for (const s of sparks) { ctx.beginPath(); ctx.arc(s.x, s.y, 10 + s.t * 50, 0, TAU); ctx.strokeStyle = `rgba(199,139,0,${(1 - s.t / 0.5).toFixed(2)})`; ctx.lineWidth = 4; ctx.stroke(); }
      // 강
      ctx.strokeStyle = '#5b9fd6'; ctx.lineWidth = 12; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      ctx.beginPath(); G.river.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke();
      cloud(ctx, G.cloud.x, G.cloud.y);
      // 강조(단계 카드를 눌렀을 때)
      if (focus) {
        const a = Math.min(1, (focus.until - t) / 0.5);
        const zone = { evap: [w * 0.82, (G.sea + G.cloud.y) / 2 + 40, 170, 230], cloud: [G.cloud.x, G.cloud.y, 170, 90], river: [(G.lake.x0 + G.river[3][0]) / 2, (G.cloud.y + G.plain) / 2 + 60, 220, 260], dam: [G.damX + 40, G.lake.y + 60, 120, 120] }[focus.k];
        if (zone) { ctx.save(); ctx.globalAlpha = a; ctx.setLineDash([14, 10]); ctx.lineDashOffset = -t * 40; ctx.strokeStyle = tok('accent'); ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(zone[0], zone[1], zone[2], zone[3], 0, 0, TAU); ctx.stroke(); ctx.restore(); }
      }
      // 물방울
      for (const d of D) {
        if (d.st === 'sea') continue;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.st === 'evap' ? 4.5 : 5, 0, TAU);
        ctx.fillStyle = tok(COLOR[d.st]); ctx.globalAlpha = d.st === 'evap' ? 0.85 : 1; ctx.fill();
        ctx.globalAlpha = 1; ctx.lineWidth = 1.2; ctx.strokeStyle = tok('ink'); ctx.stroke();
      }
      const f = '700 22px "IBM Plex Sans KR", sans-serif';
      label(ctx, '증발 ↑', w * 0.86, G.sea - 150, f);
      label(ctx, '구름', G.cloud.x, G.cloud.y - 70, f);
      label(ctx, '비 ↓', G.lake.x0 - 30, G.cloud.y + 120, f);
      label(ctx, '호수(댐)', G.lake.x0 - 40, G.lake.y + 30, f);
      label(ctx, dam ? '수력 발전소' : '발전소 꺼짐', px + 39, py - 84, f);
      label(ctx, '마을', G.town.x + 74, G.plain - 84, f);
      label(ctx, '바다', w * 0.84, h - 30, f);
      // 따라가는 물방울
      if (watched) {
        if (watched.trail && watched.trail.length > 1) { ctx.strokeStyle = 'rgba(29,36,51,.5)'; ctx.lineWidth = 3; ctx.setLineDash([4, 8]); ctx.beginPath(); watched.trail.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.stroke(); ctx.setLineDash([]); }
        const x = watched.st === 'sea' ? watched.x : watched.x, y = watched.st === 'sea' ? G.sea + 10 : watched.y;
        ctx.beginPath(); ctx.arc(x, y, 14, 0, TAU); ctx.lineWidth = 4; ctx.strokeStyle = tok('ink'); ctx.stroke();
        const text = SAY[watched.st] || '';
        ctx.font = '700 22px "IBM Plex Sans KR", sans-serif';
        const tw2 = ctx.measureText(text).width + 28, bx = Math.min(w - tw2 - 10, Math.max(10, x - tw2 / 2)), by = Math.max(10, y - 74);
        ctx.fillStyle = tok('paper-2'); ctx.strokeStyle = tok(COLOR[watched.st] || 'ink'); ctx.lineWidth = 4;
        ctx.beginPath(); ctx.roundRect(bx, by, tw2, 40, 20); ctx.fill(); ctx.stroke();
        ctx.fillStyle = tok('ink'); ctx.textAlign = 'left'; ctx.fillText(text, bx + 14, by + 28);
      }
    }
    damBtn.addEventListener('click', () => { dam = !dam; damBtn.setAttribute('aria-pressed', String(dam)); damBtn.textContent = dam ? '수력 발전소 켜짐' : '수력 발전소 꺼짐'; });
    followBtn.addEventListener('click', () => { const on = followBtn.getAttribute('aria-pressed') !== 'true'; followBtn.setAttribute('aria-pressed', String(on)); if (!on) watched = null; });
    root.querySelectorAll('.wsteps li[data-focus]').forEach((li) => {
      li.addEventListener('click', () => { focus = { k: li.dataset.focus, until: t + 3 }; root.querySelectorAll('.wsteps li').forEach((x) => x.classList.toggle('pick', x === li)); });
    });
    const l = window.Stage.loop(step);
    root._water = { stats: () => { const c = {}; for (const d of D) c[d.st] = (c[d.st] || 0) + 1; return c; } };
    return {
      setActive(on) { if (on) { g = window.Stage.fit(cv); reseed(); if (window.Stage.reduce) draw(geo()); else l.start(); } else l.stop(); },
      fit() { g = window.Stage.fit(cv); reseed(); draw(geo()); },
    };
  }

  window.WaterCycle = { mount };
})();
