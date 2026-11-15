/* 2-1 3차시 체험 «할로젠»(교과서 62쪽 + 참고서 66쪽). 병 넷: 플루오린(옅은 노랑 기체)·염소(노랑 기체)·브로민(적갈색 액체)·아이오딘(보라 고체).
   병 속에서 원자 둘씩 붙은 분자(이원자 분자)가 상태에 맞게 움직인다(기체는 빠르게 날고, 액체는 바닥에서 미끄러지고, 고체는 제자리에서 떤다).
   아래 나트륨 조각을 끌어 병에 넣으면 번쩍 — 흰 결정(염화 나트륨 등)이 생기고, 수소 풍선을 끌어 넣으면 염화 수소 등이 생겨 옆 리트머스가 붉어진다(물에 녹으면 산성).
   색·상태는 참고서 표. Halogen.mount(root) → { fit, setActive } · 시험용: root._hg.add('Na'|'H', 병 번호) */
(function () {
  'use strict';
  const B = [['F', '플루오린', 'F₂', '#f3f0b0', 'g'], ['Cl', '염소', 'Cl₂', '#d8e66a', 'g'], ['Br', '브로민', 'Br₂', '#9a3b1c', 'l'], ['I', '아이오딘', 'I₂', '#5b2a7a', 's']];
  const SALT = { F: '플루오린화 나트륨', Cl: '염화 나트륨', Br: '브로민화 나트륨', I: '아이오딘화 나트륨' }, ACID = { F: '플루오린화 수소', Cl: '염화 수소', Br: '브로민화 수소', I: '아이오딘화 수소' };
  function mount(root) {
    const stage = root.querySelector('.hg-stage'), now = root.querySelector('.hg-now'), out = root.querySelector('.hg-out');
    const P = window.Play;
    const bot = B.map(([s, n, f, col, st], i) => ({ s, n, f, col, st, i, mol: [], salt: 0, acid: 0, flash: 0 }));
    bot.forEach((b) => { for (let k = 0; k < 9; k++) b.mol.push({ x: Math.random(), y: b.st === 'g' ? Math.random() : 0.75 + Math.random() * 0.2, a: Math.random() * 6, vx: (Math.random() - 0.5), vy: (Math.random() - 0.5), ox: 0, oy: 0 }); if (b.st === 's') b.mol.forEach((m, k) => { m.ox = 0.2 + (k % 3) * 0.3; m.oy = 0.62 + Math.floor(k / 3) * 0.12; }); });
    let drag = null; const did = { Na: false, H: false };
    const G = (W, H) => ({ b: (i) => [W * (0.13 + i * 0.235), H * 0.38, W * 0.17, H * 0.5], na: [W * 0.25, H * 0.9], h: [W * 0.6, H * 0.88] });
    function say(h) { if (out.innerHTML !== h) out.innerHTML = h; }
    function steps() {
      const ok = []; ok.push(1); if (did.Na) ok.push(2); if (did.H) ok.push(3);
      const st = [2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 2 ? '② 나트륨 조각을 끌어 병에 넣자' : st === 3 ? '③ 수소 풍선을 끌어 병에 넣자' : '할로젠: 반응성이 커 수소·알칼리 금속과 잘 반응';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        const g = G(W, H);
        c.fillStyle = '#eef0ea'; c.fillRect(0, 0, W, H);
        bot.forEach((b) => {
          const [x, y, w, h] = g.b(b.i), x0 = x - w / 2, y0 = y - h / 2;
          c.fillStyle = 'rgba(255,255,255,.6)'; c.strokeStyle = '#5a6270'; c.lineWidth = 3; c.beginPath(); c.roundRect(x0, y0, w, h, 14); c.fill(); c.stroke();
          c.fillStyle = '#5a6270'; c.fillRect(x - w * 0.25, y0 - 18, w * 0.5, 18);
          if (b.st === 'g') { c.fillStyle = b.col + '66'; c.fillRect(x0 + 3, y0 + 3, w - 6, h - 6); }
          if (b.st === 'l') { c.fillStyle = b.col; c.fillRect(x0 + 3, y0 + h * 0.62, w - 6, h * 0.38 - 3); c.fillStyle = b.col + '44'; c.fillRect(x0 + 3, y0 + 3, w - 6, h * 0.6); }
          b.mol.forEach((m) => {
            if (b.st === 'g') { m.x += m.vx * dt * 0.8; m.y += m.vy * dt * 0.8; if (m.x < 0.08 || m.x > 0.92) m.vx *= -1; if (m.y < 0.08 || m.y > 0.92) m.vy *= -1; m.a += dt * 3; }
            else if (b.st === 'l') { m.x += m.vx * dt * 0.25; if (m.x < 0.1 || m.x > 0.9) m.vx *= -1; m.a += dt; }
            else { m.x = m.ox + Math.sin(performance.now() / 90 + m.ox * 9) * 0.01; m.y = m.oy; }
            const px = x0 + m.x * w, py = y0 + m.y * h, dx = Math.cos(m.a) * 6, dy = Math.sin(m.a) * 6;
            c.fillStyle = b.st === 's' ? '#3a1a52' : b.st === 'l' ? '#5a1c0a' : '#9aa05a'; [[-1], [1]].forEach(([k]) => { c.beginPath(); c.arc(px + dx * k, py + dy * k, 6, 0, Math.PI * 2); c.fill(); });
          });
          if (b.salt) { for (let k = 0; k < 10; k++) { c.fillStyle = '#fff'; c.strokeStyle = '#9aa3ad'; c.lineWidth = 1; c.fillRect(x0 + 12 + (k * 23) % (w - 30), y0 + h - 24 - Math.floor(k / 5) * 12, 10, 10); c.strokeRect(x0 + 12 + (k * 23) % (w - 30), y0 + h - 24 - Math.floor(k / 5) * 12, 10, 10); } }
          if (b.acid) { c.fillStyle = '#d9483b'; c.fillRect(x0 + w + 4, y0 + 20, 12, 70); P.txt(c, '리트머스', x0 + w + 10, y0 + 106, '#d9483b', '700 13px'); }
          if (b.flash > 0) { P.glow(c, x, y, w, `rgba(255,250,200,${b.flash})`); b.flash -= dt * 1.5; }
          P.txt(c, `${b.n}(${b.f})`, x, y0 + h + 26, '#1d2433', '800 19px');
          P.txt(c, b.st === 'g' ? '기체' : b.st === 'l' ? '액체' : '고체', x, y0 + h + 48, '#4a5468', '700 16px');
        });
        // 나트륨·수소
        const na = drag && drag.k === 'Na' ? [drag.x, drag.y] : g.na, hh = drag && drag.k === 'H' ? [drag.x, drag.y] : g.h;
        c.fillStyle = '#c9ccd2'; c.beginPath(); c.roundRect(na[0] - 20, na[1] - 13, 40, 26, 6); c.fill(); c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.stroke();
        if (!drag || drag.k !== 'Na') P.txt(c, '나트륨 조각', na[0] + 30, na[1] + 6, '#1d2433', '700 17px', 'left');
        c.fillStyle = '#cfe9ff'; c.beginPath(); c.arc(hh[0], hh[1] - 16, 20, 0, Math.PI * 2); c.fill(); c.stroke(); c.beginPath(); c.moveTo(hh[0], hh[1] + 4); c.lineTo(hh[0], hh[1] + 26); c.stroke(); P.txt(c, 'H₂', hh[0], hh[1] - 10, '#1d2433', '800 16px');
        if (!drag || drag.k !== 'H') P.txt(c, '수소 풍선', hh[0] + 30, hh[1] - 10, '#1d2433', '700 17px', 'left');
        steps();
      },
      down(p) { const g = G(S.W, S.H); if (Math.hypot(p.x - g.na[0], p.y - g.na[1]) < 30) drag = { k: 'Na', x: p.x, y: p.y }; else if (Math.hypot(p.x - g.h[0], p.y - g.h[1] + 16) < 30) drag = { k: 'H', x: p.x, y: p.y }; },
      move(p, e, held) { if (held && drag) { drag.x = p.x; drag.y = p.y; } },
      up(p) {
        if (!drag) return; const g = G(S.W, S.H);
        const b = bot.find((q) => { const [x, y, w, h] = g.b(q.i); return Math.abs(p.x - x) < w / 2 && Math.abs(p.y - y) < h / 2 + 20; });
        if (b) add(drag.k, b.i);
        drag = null;
      },
    });
    function add(k, i) {
      const b = bot[i]; b.flash = 1; did[k === 'Na' ? 'Na' : 'H'] = true; window.RxT.jolt(stage, b.s === 'F' ? 3 : 2);
      if (k === 'Na') { b.salt = 1; say(`나트륨 + ${b.n} → 흰 결정 <b>${SALT[b.s]}</b> — 할로젠은 알칼리 금속과 격렬하게 반응한다`); }
      else { b.acid = 1; say(`수소 + ${b.n} → <b>${ACID[b.s]}</b> — 물에 녹으면 <b>산성</b>(리트머스가 붉어짐)`); }
      S.kick();
    }
    root._hg = { add };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Halogen = { mount };
})();
