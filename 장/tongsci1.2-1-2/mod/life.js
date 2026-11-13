/* 2-1 2차시 체험 «별의 질량과 일생»(교과서 55~56쪽 + 참고서 45·50쪽). 손으로 별의 일생을 움직인다:
   · 별 가장자리를 바깥으로 끌면 무거운 별, 안으로 끌면 가벼운 별(태양의 0.5~40배).
   · 아래 «일생 막대»의 손잡이를 끌면 별이 그 순간의 모습으로 계속 변한다(성운 → 원시별 → 주계열성 → 적색 거성 → 행성상 성운 → 백색 왜성 /
     초거성 → 초신성(흔들림) → 중성자별·블랙홀). 단계에 들어서면 오른쪽에 실제 사진.
   수명 = 100억 년 × 질량^-2.5(이해를 돕기 위한 어림), 10배·25배 경계는 참고서 기준. Life.mount(root, photos) → { fit, setActive } · 시험용: root._lf.mass(배) · at(0~1) */
(function () {
  'use strict';
  const SM = [['성운', 0.08, 'orion'], ['원시별', 0.08, null], ['주계열성', 0.42, null], ['적색 거성', 0.14, null], ['행성상 성운', 0.14, 'ring'], ['백색 왜성', 0.14, 'sirius']];
  const BG = [['성운', 0.08, 'orion'], ['원시별', 0.08, null], ['주계열성', 0.3, null], ['초거성', 0.18, 'betel'], ['초신성', 0.16, 'crab'], ['중성자별', 0.2, null]];
  const DESC = {
    성운: '기체·티끌 구름 — 밀도 큰 곳에서 별이 태어난다', 원시별: '중력 수축으로 빛나지만 핵융합 없음', 주계열성: '수소 핵융합 → 헬륨. 일생의 대부분',
    '적색 거성': '부풀어 붉다. 중심에서 헬륨 핵융합 → 탄소·산소', '행성상 성운': '바깥층이 퍼져 원소를 우주로 돌려준다', '백색 왜성': '남은 중심이 수축한 작고 빽빽한 별(탄소·산소)',
    초거성: '아주 크게 부푼 별. 중심에서 철까지', 초신성: '철 중심이 무너지며 폭발 → 금·우라늄 생성·방출', 중성자별: '폭발 뒤 남은 중심이 수축한 중성자 덩어리', 블랙홀: '태양의 약 25배 이상이면 빛도 못 빠져나오는 블랙홀',
  };
  function mount(root, photos) {
    const stage = root.querySelector('.lf-stage'), out = root.querySelector('.lf-out'), now = root.querySelector('.lf-now');
    const fig = root.querySelector('.lf-fig'), img = fig.querySelector('img'), cap = fig.querySelector('figcaption');
    const P = window.Play;
    let M = 1, u = 0, grab = null, grab0 = [1, 1], t = 0, lastName = '', boom = 0; const seen = new Set();
    const path = () => (M < 10 ? SM : BG.map((s, i) => (i === 5 && M >= 25 ? ['블랙홀', s[1], null] : s)));
    function where() { let acc = 0; const ps = path(); for (let i = 0; i < ps.length; i++) { if (u <= acc + ps[i][1] || i === ps.length - 1) return { i, f: Math.min(1, (u - acc) / ps[i][1]), s: ps[i] }; acc += ps[i][1]; } return null; }
    const life = () => 1e10 * Math.pow(M, -2.5);
    const fmt = (y) => (y >= 1e8 ? `${Math.round(y / 1e8)}억 년` : `${Math.max(1, Math.round(y / 1e4))}만 년`);
    function steps() {
      const ok = []; if (seen.has('small-end')) ok.push(1); if (seen.has('big-end')) ok.push(2); if (seen.has('photo2')) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 일생 막대 손잡이를 끝까지 끌어 보자' : st === 2 ? '② 별 가장자리를 바깥으로 끌어 무겁게 한 뒤 다시' : st === 3 ? '③ 사진이 나오는 단계를 둘 이상 지나 보자' : '질량이 일생을 정한다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    let photoSeen = 0;
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt;
        c.fillStyle = '#0b1026'; c.fillRect(0, 0, W, H);
        const w = where(), name = w.s[0], f = w.f, cx = W * 0.5, cy = H * 0.42, base = Math.min(W, H) * 0.09 * Math.pow(M, 0.28);
        const hotCol = M < 2 ? ['#fff6c8', '#ffc24a'] : M < 10 ? ['#ffffff', '#cfe2ff'] : ['#e8f0ff', '#8fb8ff'];
        if (name === '성운') { for (let i = 0; i < 160; i++) { const a = i * 2.39996, r = Math.sqrt((i * 0.618) % 1) * W * 0.3 * (1 - f * 0.6); c.fillStyle = 'rgba(190,200,235,.6)'; c.fillRect(cx + Math.cos(a) * r, cy + Math.sin(a) * r * 0.7, 2.5, 2.5); } }
        else if (name === '원시별') P.glow(c, cx, cy, base * (2.5 - f), `rgba(255,${120 + f * 60},70,.9)`);
        else if (name === '주계열성') { P.glow(c, cx, cy, base * 1.8, hotCol[0], 'rgba(255,200,120,0)'); c.fillStyle = hotCol[1]; c.beginPath(); c.arc(cx, cy, base, 0, Math.PI * 2); c.fill(); }
        else if (name === '적색 거성' || name === '초거성') { const k = 1 + f * (name === '초거성' ? 3.2 : 2.4), col = `rgb(${230},${Math.round(150 - f * 70)},${Math.round(80 - f * 30)})`; P.glow(c, cx, cy, base * k * 1.3, 'rgba(239,110,70,.5)'); c.fillStyle = col; c.beginPath(); c.arc(cx, cy, base * k, 0, Math.PI * 2); c.fill(); }
        else if (name === '행성상 성운' || name === '백색 왜성') {
          const k = name === '행성상 성운' ? f : 1, a = name === '백색 왜성' ? 0.25 * (1 - f) : 0.8;
          c.strokeStyle = `rgba(127,209,255,${a})`; c.lineWidth = 30 * (1 - k * 0.5) + 6; c.beginPath(); c.arc(cx, cy, base * (1.5 + k * 3), 0, Math.PI * 2); c.stroke();
          P.glow(c, cx, cy, 18, '#ffffff'); c.fillStyle = '#fff'; c.beginPath(); c.arc(cx, cy, 6, 0, Math.PI * 2); c.fill();
        } else if (name === '초신성') {
          if (lastName !== '초신성') { boom = 1; window.RxT.jolt(stage, 3); }
          P.glow(c, cx, cy, base * (2 + f * 9), `rgba(255,${230 - f * 80},${180 - f * 100},${1 - f * 0.6})`);
          ['금', '은', '우라늄', '철', '산소', '탄소', '규소', '구리'].forEach((n, i) => { const a = i * Math.PI / 4 + 0.3, d = base * (1 + f * 6); P.txt(c, n, cx + Math.cos(a) * d * 1.3, cy + Math.sin(a) * d, ['#ffd84d', '#e8ecf1', '#7fe07f'][i % 3], '800 22px'); });
        } else if (name === '중성자별') { const a = t * 3; c.strokeStyle = 'rgba(160,210,255,.7)'; c.lineWidth = 6; c.beginPath(); c.moveTo(cx - Math.cos(a) * 140, cy - Math.sin(a) * 140); c.lineTo(cx + Math.cos(a) * 140, cy + Math.sin(a) * 140); c.stroke(); P.glow(c, cx, cy, 26, '#cfe8ff'); }
        else if (name === '블랙홀') { c.strokeStyle = 'rgba(255,170,80,.8)'; c.lineWidth = 10; c.beginPath(); c.ellipse(cx, cy, 90, 26, 0.2, 0, Math.PI * 2); c.stroke(); c.fillStyle = '#000'; c.beginPath(); c.arc(cx, cy, 36, 0, Math.PI * 2); c.fill(); }
        if (boom > 0) { c.fillStyle = `rgba(255,250,230,${boom})`; c.fillRect(0, 0, W, H); boom = Math.max(0, boom - dt * 2); }
        P.txt(c, name, 20, 96, '#fbfcf9', '800 30px', 'left');
        P.txt(c, `태양의 ${M < 1 ? M.toFixed(1) : Math.round(M)}배 · 수명 약 ${fmt(life())}`, W - 20, 42, '#ffd84d', '800 22px', 'right');
        if (u < 0.2) P.txt(c, '별 가장자리를 끌어 질량 바꾸기 ↔', cx, cy + base * 2.4 + 20, '#ffd84d', '700 20px');
        // 일생 막대
        const ty = H - 52, tx0 = 30, tx1 = W - 30; let acc = 0;
        path().forEach(([n, wd], i) => { const x0 = tx0 + (tx1 - tx0) * acc, x1 = tx0 + (tx1 - tx0) * (acc + wd); c.fillStyle = i === w.i ? '#2a3a6a' : '#16203f'; c.fillRect(x0 + 1, ty - 16, x1 - x0 - 2, 32); P.txt(c, n, (x0 + x1) / 2, ty + 7, i === w.i ? '#ffd84d' : '#b9c2d8', '700 18px'); acc += wd; });
        const hx = tx0 + (tx1 - tx0) * u; c.fillStyle = '#ffd84d'; c.beginPath(); c.arc(hx, ty - 26, 13, 0, Math.PI * 2); c.fill(); c.strokeStyle = '#1d2433'; c.lineWidth = 3; c.stroke();
        P.txt(c, '일생 막대 — 손잡이를 끌어 시간을 흘리자', W / 2, ty + 40, '#8d97a3', '600 16px');
        // 바뀐 단계 알림
        if (name !== lastName) {
          lastName = name;
          out.innerHTML = `<b>${name}</b> ${DESC[name]}${name === '주계열성' ? ` <small>이 별은 약 ${fmt(life())} 동안 이 단계</small>` : ''}`;
          const ph = w.s[2];
          if (ph && photos[ph]) { fig.hidden = false; img.src = photos[ph].src; img.alt = photos[ph].alt; cap.innerHTML = `<b>${name}</b> 실제 사진 <small>${photos[ph].cr}</small>`; seen.add('ph:' + ph); photoSeen = [...seen].filter((s) => s.startsWith('ph:')).length; if (photoSeen >= 2) seen.add('photo2'); }
        }
        if (u > 0.97) seen.add(M < 10 ? 'small-end' : 'big-end');
        steps();
      },
      down(p) { const ty = S.H - 52; if (p.y > ty - 50) { grab = 'u'; this.move(p, null, true); } else { grab = 'm'; grab0 = [Math.max(20, Math.hypot(p.x - S.W * 0.5, p.y - S.H * 0.42)), M]; } },
      move(p, e, held) {
        if (!held || !grab) return;
        if (grab === 'u') u = Math.max(0, Math.min(1, (p.x - 30) / (S.W - 60)));
        else { const d = Math.max(10, Math.hypot(p.x - S.W * 0.5, p.y - S.H * 0.42)); M = Math.max(0.5, Math.min(40, grab0[1] * Math.pow(d / grab0[0], 3.5))); }
      },
      up() { grab = null; },
      key(e) { if (e.key === 'ArrowRight') { u = Math.min(1, u + 0.04); return true; } if (e.key === 'ArrowLeft') { u = Math.max(0, u - 0.04); return true; } if (e.key === 'ArrowUp') { M = Math.min(40, M * 1.5); return true; } if (e.key === 'ArrowDown') { M = Math.max(0.5, M / 1.5); return true; } return false; },
    });
    root._lf = { mass: (m) => { M = m; S.kick(); }, at: (x) => { u = x; S.redraw(); } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Life = { mount };
})();
