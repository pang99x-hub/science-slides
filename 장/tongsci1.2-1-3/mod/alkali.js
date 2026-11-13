/* 2-1 3차시 체험 «알칼리 금속 실험»(교과서 62~63쪽 탐구 + 참고서 65~66쪽). 접시 위 리튬·나트륨·칼륨 덩어리.
   ① 칼을 끌어 덩어리를 가로지르면 잘린 면이 은백색으로 빛나다 공기 중 산소와 반응해 흐려진다(칼륨이 가장 빠르다).
   ② 잘라 낸 조각을 끌어 페놀프탈레인을 넣은 물에 넣으면 물 위를 돌아다니며 기포(수소)를 내고 물이 붉어진다. 칼륨은 보랏빛 불꽃 + 흔들림.
   ③ 성냥을 끌어 기포 위에 대면 «퍽». 반응 세기 리튬 < 나트륨 < 칼륨은 참고서 탐구 값. 실제 실험은 아주 작은 조각·보안경·선생님 안내로.
   Alkali.mount(root) → { fit, setActive } · 시험용: root._ak.cut(k) · drop(k) · match() */
(function () {
  'use strict';
  const M = [['Li', '리튬', 0.35, 0.35], ['Na', '나트륨', 0.7, 0.7], ['K', '칼륨', 1.3, 1.2]];   // [기호, 이름, 산화 속도, 반응 세기]
  function mount(root) {
    const stage = root.querySelector('.ak-stage'), now = root.querySelector('.ak-now'), out = root.querySelector('.ak-out');
    const P = window.Play;
    const lumps = M.map(([s, n, ox, rx], i) => ({ s, n, ox, rx, i, cut: false, shine: 0, piece: null }));
    let grab = null, knifeP = null, matchP = null, pinks = 0, inWater = [], bubbles = [], pop = 0, did = { cut: false, drop: new Set(), pop: false }, fire = 0;
    const G = (W, H) => ({ lump: (i) => [W * (0.12 + i * 0.15), H * 0.3], water: [W * 0.72, H * 0.58, W * 0.23, H * 0.2], knife: [W * 0.1, H * 0.8], match: [W * 0.45, H * 0.82] });
    function say(h) { if (out.innerHTML !== h) out.innerHTML = h; }
    function steps() {
      const ok = []; if (did.cut) ok.push(1); if (did.drop.size >= 2) ok.push(2); if (did.pop) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 칼을 끌어 덩어리를 가로질러 자르자' : st === 2 ? '② 잘린 조각을 끌어 물에 넣자(둘 이상)' : st === 3 ? '③ 성냥을 끌어 기포 위에 대 보자' : '알칼리 금속: 무르고, 산소·물과 잘 반응';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        const g = G(W, H);
        c.fillStyle = '#eef0ea'; c.fillRect(0, 0, W, H);
        // 접시와 덩어리
        c.fillStyle = '#dfe6ee'; c.beginPath(); c.ellipse(W * 0.27, H * 0.33, W * 0.24, 54, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#9aa3ad'; c.lineWidth = 2; c.stroke();
        lumps.forEach((l) => {
          const [x, y] = g.lump(l.i); if (l.cut) l.shine = Math.max(0, l.shine - dt * l.ox * 0.35);
          c.fillStyle = '#9b9a96'; c.beginPath(); c.roundRect(x - 34, y - 22, 68, 44, 10); c.fill();
          if (l.cut) { const k = l.shine; c.fillStyle = `rgb(${150 + 100 * k},${150 + 100 * k},${150 + 100 * k})`; c.fillRect(x - 3, y - 22, 10, 44); }
          P.txt(c, l.n, x, y + 46, '#1d2433', '700 18px');
          if (l.piece && !l.piece.used) { c.fillStyle = `rgb(${160 + 90 * l.shine},${160 + 90 * l.shine},${165 + 80 * l.shine})`; const [px, py] = grab && grab.l === l ? [grab.x, grab.y] : [x + 44, y - 4]; c.beginPath(); c.roundRect(px - 9, py - 7, 18, 14, 4); c.fill(); }
        });
        // 물 그릇(페놀프탈레인)
        const [wx, wy, ww, wh] = g.water, pk = Math.min(1, pinks);
        c.fillStyle = `rgba(${200 + 40 * pk},${225 - 120 * pk},${245 - 90 * pk},.85)`; c.beginPath(); c.ellipse(wx, wy, ww, wh, 0, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#5a6270'; c.lineWidth = 3; c.stroke();
        P.txt(c, '물 + 페놀프탈레인 용액', wx, wy + wh + 26, '#1d2433', '700 18px');
        inWater.forEach((p) => {
          p.t += dt; p.a += dt * (1 + p.rx * 2); p.size = Math.max(0, p.size - dt * 0.12 * p.rx);
          const x = wx + Math.cos(p.a) * ww * 0.5, y = wy + Math.sin(p.a * 1.3) * wh * 0.4;
          if (p.size > 0) { c.fillStyle = '#c9ccd2'; c.beginPath(); c.arc(x, y, 9 * p.size + 2, 0, Math.PI * 2); c.fill(); pinks += dt * 0.12 * p.rx; if (Math.random() < p.rx * 0.6) bubbles.push({ x, y, life: 1 }); if (p.s === 'K') { fire = 1; P.glow(c, x, y - 10, 30, 'rgba(190,120,255,.9)'); } }
        });
        bubbles.forEach((b) => { b.y -= 30 * dt; b.life -= dt; c.strokeStyle = `rgba(255,255,255,${b.life})`; c.lineWidth = 1.5; c.beginPath(); c.arc(b.x, b.y, 4, 0, Math.PI * 2); c.stroke(); }); bubbles = bubbles.filter((b) => b.life > 0);
        // 칼
        const kp = knifeP || { x: g.knife[0], y: g.knife[1] };
        c.fillStyle = '#c3c8cf'; c.beginPath(); c.moveTo(kp.x, kp.y - 4); c.lineTo(kp.x + 70, kp.y - 4); c.lineTo(kp.x + 82, kp.y + 6); c.lineTo(kp.x, kp.y + 6); c.closePath(); c.fill(); c.fillStyle = '#5a3a26'; c.fillRect(kp.x - 46, kp.y - 6, 46, 14);
        if (!knifeP) P.txt(c, '칼', kp.x + 20, kp.y + 30, '#1d2433', '700 18px');
        // 성냥
        const mp = matchP || { x: g.match[0], y: g.match[1] };
        c.fillStyle = '#e8c87a'; c.fillRect(mp.x - 3, mp.y, 6, 60); c.fillStyle = '#c0392b'; c.beginPath(); c.arc(mp.x, mp.y, 7, 0, Math.PI * 2); c.fill();
        if (matchP) P.glow(c, mp.x, mp.y - 10, 20, 'rgba(255,170,60,1)'); else P.txt(c, '성냥', mp.x, mp.y + 80, '#1d2433', '700 18px');
        if (matchP && bubbles.some((b) => Math.hypot(b.x - mp.x, b.y - mp.y) < 40) && pop <= 0) { pop = 1; did.pop = true; window.RxT.jolt(stage, 1); say('<b>퍽!</b> 기포에 불꽃을 대면 소리를 내며 탄다 → 발생한 기체는 <b>수소</b>'); }
        if (pop > 0) { P.glow(c, mp.x, mp.y - 20, 60 * pop, `rgba(255,220,120,${pop})`); P.txt(c, '퍽!', mp.x + 30, mp.y - 40, '#c0392b', '800 34px'); pop -= dt * 1.5; }
        if (fire > 0) fire -= dt;
        steps();
      },
      down(p) {
        const g = G(S.W, S.H);
        const kp = knifeP || { x: g.knife[0], y: g.knife[1] }, mp = matchP || { x: g.match[0], y: g.match[1] };
        if (Math.hypot(p.x - (kp.x + 20), p.y - kp.y) < 50) { knifeP = p; grab = { t: 'knife' }; return; }
        if (Math.abs(p.x - mp.x) < 20 && p.y > mp.y - 15 && p.y < mp.y + 65) { matchP = p; grab = { t: 'match' }; return; }
        const l = lumps.find((q) => { const [x, y] = g.lump(q.i); return q.piece && !q.piece.used && Math.hypot(p.x - (x + 44), p.y - (y - 4)) < 22; });
        if (l) grab = { t: 'piece', l, x: p.x, y: p.y };
      },
      move(p, e, held) {
        if (!held || !grab) return; const g = G(S.W, S.H);
        if (grab.t === 'knife') { knifeP = p; lumps.forEach((l) => { const [x, y] = g.lump(l.i); if (!l.cut && Math.abs(p.x + 40 - x) < 30 && Math.abs(p.y - y) < 26) { l.cut = true; l.shine = 1; l.piece = { used: false }; did.cut = true; say(`<b>${l.n}</b>: 칼로 쉽게 잘릴 만큼 무르다. 잘린 면은 은백색 → 산소와 반응해 곧 흐려진다`); } }); }
        else if (grab.t === 'match') matchP = p;
        else { grab.x = p.x; grab.y = p.y; }
      },
      up(p) {
        const g = G(S.W, S.H);
        if (grab && grab.t === 'piece') { const [wx, wy, ww, wh] = g.water; if (Math.abs(p.x - wx) < ww && Math.abs(p.y - wy) < wh) { const l = grab.l; l.piece.used = true; inWater.push({ s: l.s, rx: l.rx, a: Math.random() * 6, t: 0, size: 1 }); did.drop.add(l.s); if (l.s === 'K') window.RxT.jolt(stage, 3); else if (l.s === 'Na') window.RxT.jolt(stage, 1); say(l.s === 'Li' ? '<b>리튬</b>: 기포를 내며 반응, 물이 <b>붉게</b> → 염기성' : l.s === 'Na' ? '<b>나트륨</b>: 물 위를 빠르게 돌며 <b>격렬하게</b> 반응, 물이 붉어진다' : '<b>칼륨</b>: <b>매우 격렬</b> — 보랏빛 불꽃까지! 반응성 리튬 &lt; 나트륨 &lt; 칼륨'); } }
        if (grab && grab.t === 'knife') knifeP = null;
        if (grab && grab.t === 'match') matchP = null;
        grab = null;
      },
    });
    root.querySelector('.ak-reset').addEventListener('click', () => { lumps.forEach((l) => { l.cut = false; l.shine = 0; l.piece = null; }); inWater = []; pinks = 0; S.kick(); });
    root._ak = {
      cut: (s) => { const l = lumps.find((q) => q.s === s); l.cut = true; l.shine = 1; l.piece = { used: false }; did.cut = true; S.kick(); },
      drop: (s) => { const l = lumps.find((q) => q.s === s); if (!l.piece) l.piece = { used: false }; l.piece.used = true; inWater.push({ s, rx: l.rx, a: 0, t: 0, size: 1 }); did.drop.add(s); S.kick(); },
      match: () => { const g = G(S.W, S.H); matchP = { x: g.water[0], y: g.water[1] - 10 }; S.kick(); },
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Alkali = { mount };
})();
