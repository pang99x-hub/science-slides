/* 2-1 2차시 체험 «초신성 폭발»(교과서 56쪽 + 참고서 45쪽). 무거운 별의 중심을 손으로 꾹 누르고 있으면(중력 수축)
   중심이 작아지며 온도가 오르고, 다음 핵융합 온도에 닿는 순간 번쩍 새 원소 층이 생겨 중심이 되밀린다(헬륨 → 탄소·산소 → … → 철).
   철이 생긴 뒤 누르면 더는 버티지 못하고 무너졌다 튕겨 폭발(크게 흔들림·진동) → 원소 알갱이가 이름표를 달고 사방으로 날아간다.
   잠시 뒤 게성운 사진. 층마다 온도는 이해를 돕기 위한 어림. Nova.mount(root) → { fit, setActive } · 시험용: root._nv.push(초) · boom() */
(function () {
  'use strict';
  const ST = [['수소', '#f6c445', 1e7], ['헬륨', '#9fd3ff', 1e7], ['탄소·산소', '#5cc77a', 1e8], ['산소·네온·마그네슘', '#c7a0f0', 1e9], ['규소·황', '#f0a0b0', 2e9], ['철', '#a7adb5', 3e9]];
  const OUT = [['금', '#ffd84d', 1], ['은', '#e8ecf1', 1], ['우라늄', '#7fe07f', 1], ['납', '#b9c2d8', 1], ['구리', '#f2a03d', 1], ['철', '#a7adb5', 0], ['산소', '#7fd1ff', 0], ['탄소', '#5cc77a', 0], ['규소', '#f0a0b0', 0], ['수소', '#f6c445', 0], ['헬륨', '#9fd3ff', 0], ['마그네슘', '#c7a0f0', 0]];
  function mount(root) {
    const stage = root.querySelector('.nv-stage'), now = root.querySelector('.nv-now'), msg = root.querySelector('.nv-msg'), photo = root.querySelector('.nv-photo');
    const P = window.Play;
    let n = 1, sq = 0, press = false, phase = 'fuse', tB = 0, flash = 0, deb = [], fl = [];
    const Tc = () => ST[Math.min(n, ST.length - 1)][2] * (0.3 + sq * 0.75);
    function say(h, cls = '') { if (msg.innerHTML !== h) { msg.innerHTML = h; msg.className = 'u-msg nv-msg ' + cls; } }
    function steps() {
      const ok = []; if (n === ST.length) ok.push(1); if (phase !== 'fuse' && phase !== 'collapse') ok.push(2); if (!photo.hidden) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 별 중심을 꾹 누르고 있자(중력 수축)' : st === 2 ? '② 철 중심을 한 번 더 꾹!' : st === 3 ? '③ 잠시 기다리면 실제 잔해 사진' : '무거운 원소가 우주로 흩어졌다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    function boom(W, H) {
      phase = 'boom'; tB = 0; flash = 1; window.RxT.jolt(stage, 3);
      deb = []; for (let i = 0; i < 90; i++) { const a = Math.random() * Math.PI * 2, s = 120 + Math.random() * 360, o = OUT[i % OUT.length]; deb.push({ x: W * 0.42, y: H * 0.52, vx: Math.cos(a) * s, vy: Math.sin(a) * s, o, lab: i < OUT.length }); }
      say('폭발하는 몇 초 사이 <b>금·은·우라늄</b> 등 철보다 무거운 원소가 생겨 별이 만든 원소와 함께 흩어진다', 'ok');
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        const cx = W * 0.42, cy = H * 0.52, R = Math.min(W, H) * 0.4;
        c.fillStyle = '#080b1c'; c.fillRect(0, 0, W, H);
        if (phase === 'fuse' || phase === 'collapse') {
          if (phase === 'fuse') sq = press ? Math.min(1, sq + dt * 0.8) : Math.max(0, sq - dt * 0.6);
          if (phase === 'fuse' && n < ST.length && Tc() >= ST[n][2] && press) {      // 다음 핵융합 점화
            n += 1; sq = 0.15; flash = 0.6; window.RxT.jolt(stage, 1);
            for (let i = 0; i < 24; i++) { const a = Math.random() * Math.PI * 2; fl.push({ x: cx, y: cy, vx: Math.cos(a) * 200, vy: Math.sin(a) * 200, life: 0.6 }); }
            const RX = ['수소 핵융합', '헬륨 핵융합', '탄소 핵융합', '산소 핵융합', '규소 핵융합'];
            say(n === ST.length ? '<b>철</b>이 생겼다 — 철은 아주 안정해 핵융합해도 에너지가 나오지 않는다. 한 번 더 누르면?' : `번쩍! <b>${RX[n - 2]}</b> → ${ST[n - 1][0]} 생성 — 중심이 다시 버틴다`);
          }
          if (phase === 'fuse' && n === ST.length && press && sq > 0.7) { phase = 'collapse'; tB = 0; }
          let k = 1 - sq * 0.35;
          if (phase === 'collapse') { tB += dt; k = Math.max(0.12, 1 - tB * 1.6); if (tB > 0.6) boom(W, H); }
          for (let i = 0; i < n; i++) {
            const r = R * (1 - i / ST.length * 0.85) * (i === 0 ? 1 : k);
            c.fillStyle = ST[i][1]; c.strokeStyle = '#fbfcf9'; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, r, 0, Math.PI * 2); c.fill(); c.stroke();
          }
          if (press && phase === 'fuse') { c.strokeStyle = 'rgba(127,209,255,.9)'; c.lineWidth = 5; for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4, r0 = R * 0.62, r1 = R * (0.4 - sq * 0.12); c.beginPath(); c.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); c.lineTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); c.stroke(); } }
          for (let i = 0; i < n; i++) P.txt(c, ST[i][0], W * 0.8, 44 + i * 34, ST[i][1], '700 22px', 'left');
          P.txt(c, `중심 약 ${Tc() >= 1e8 ? Math.round(Tc() / 1e8) + '억' : Math.round(Tc() / 1e4) + '만'} K`, 20, 96, '#fbfcf9', '800 26px', 'left');
          if (n < ST.length) { const need = ST[n][2]; P.txt(c, `다음 핵융합: ${need >= 1e8 ? need / 1e8 + '억' : need / 1e4 + '만'} K`, 20, 128, '#ffd84d', '700 20px', 'left'); }
          if (!press && phase === 'fuse' && sq < 0.05) P.txt(c, '여기를 꾹 누르고 있자', cx, cy + R + 30 > H - 10 ? H - 14 : cy + R + 30, '#ffd84d', '800 22px');
        } else {
          tB += dt;
          P.glow(c, cx, cy, Math.min(W, H) * (0.2 + tB * 0.5), `rgba(255,220,160,${Math.max(0, 0.9 - tB * 0.25)})`, 'rgba(120,60,180,0)');
          deb.forEach((d) => { d.x += d.vx * dt; d.y += d.vy * dt; d.vx *= Math.pow(0.55, dt); d.vy *= Math.pow(0.55, dt); c.fillStyle = d.o[1]; c.beginPath(); c.arc(d.x, d.y, 3, 0, Math.PI * 2); c.fill(); if (d.lab) P.txt(c, d.o[0], d.x, d.y - 8, d.o[1], d.o[2] ? '800 30px' : '800 21px'); });
          c.fillStyle = '#fbfcf9'; c.beginPath(); c.arc(cx, cy, 5, 0, Math.PI * 2); c.fill();
          P.txt(c, '큰 글씨: 초신성 때만 생기는 철보다 무거운 원소', 20, H - 22, '#ffd84d', '800 22px', 'left');
          if (tB > 2.5 && photo.hidden) { photo.hidden = false; phase = 'done'; }
        }
        for (let i = fl.length - 1; i >= 0; i--) { const s = fl[i]; s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt; if (s.life <= 0) { fl.splice(i, 1); continue; } c.fillStyle = `rgba(255,240,180,${s.life * 1.6})`; c.fillRect(s.x, s.y, 4, 4); }
        if (flash > 0) { c.fillStyle = `rgba(255,250,230,${flash})`; c.fillRect(0, 0, W, H); flash = Math.max(0, flash - dt * 2); }
        steps();
      },
      down() { press = true; }, up() { press = false; },
      key(e) { if (e.key === ' ' || e.key === 'Enter') { press = !press; return true; } return false; },
    });
    function reset() { n = 1; sq = 0; phase = 'fuse'; deb = []; photo.hidden = true; say('', ''); S.kick(); }
    root.querySelector('.nv-reset').addEventListener('click', reset);
    reset();
    root._nv = { push: () => { press = true; S.kick(); }, release: () => { press = false; }, boom: () => { n = ST.length; boom(S.W, S.H); S.kick(); } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Nova = { mount };
})();
