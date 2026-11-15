/* 2-1 2차시 이론 «별의 탄생»(교과서 54~55쪽 그림 Ⅱ-8 + 참고서 44쪽). 우주 공간에 기체·티끌 알갱이가 떠다닌다.
   화면을 누른 채 문지르면 손 둘레의 알갱이가 그쪽으로 끌려 모인다. 한곳에 충분히 모이면 그 덩어리가 스스로 중력으로
   주변을 더 끌어당기고(성운), 뭉친 알갱이 수만큼 중심이 뜨거워져 붉게 빛나는 원시별 → 1000만 K을 넘으면 번쩍(수소 핵융합) 별이 된다.
   오른쪽 중심 온도 눈금, 왼쪽 정의 상자(.lv-row[data-k=0~3])가 단계에 맞춰 밝아진다. 덩어리 질량·온도 관계는 이해를 돕기 위한 예.
   Birth.mount(root) → { fit, setActive } · 시험용: root._bi.feed(개수) */
(function () {
  'use strict';
  const NAME = ['성간 물질', '성운', '원시별', '별(주계열성)'];
  const D = ['기체(주로 수소·헬륨)와 티끌이 흩어져 있다 — 손으로 문질러 모아 보자', '알갱이가 모여 <b>성운</b> — 모인 곳의 중력이 커져 주변을 더 끌어당긴다', '<b>중력 수축</b>으로 뜨거워져 빛나는 원시별 — 아직 핵융합은 없다', '중심이 <b>1000만 K</b>를 넘자 <b>수소 핵융합</b> 시작 → 스스로 빛나는 별'];
  function mount(root) {
    const stage = root.querySelector('.bi-stage'), out = root.querySelector('.bi-out'), rows = [...root.querySelectorAll('.lv-row')], now = root.querySelector('.bi-now');
    const P = window.Play;
    let ps = [], hand = null, core = null, mass = 0, lv = -1, born = false, flash = 0, t = 0;
    function reset(W, H) {
      ps = []; for (let i = 0; i < 320; i++) ps.push({ x: Math.random() * W * 0.8, y: Math.random() * H, vx: (Math.random() - 0.5) * 10, vy: (Math.random() - 0.5) * 10 });
      core = null; mass = 0; born = false; lv = -1;
    }
    const tempK = () => (mass < 5 ? 30 : Math.min(2e7, 30 * Math.pow(10, mass / 26)));
    function level() { return born ? 3 : mass >= 70 ? 2 : (core && mass >= 8) ? 1 : 0; }
    function setLevel(k) {
      if (k === lv) return; lv = k;
      rows.forEach((r) => r.classList.toggle('on', +r.dataset.k === k));
      out.innerHTML = `<b>${NAME[k]}</b> ${D[k]}`;
      const ok = []; if (k >= 1) ok.push(1); if (k >= 2) ok.push(2); if (k >= 3) ok.push(3);
      now.textContent = k === 0 ? '① 화면을 누른 채 문질러 기체를 모으자' : k === 1 ? '② 계속 모아 원시별로 키우자' : k === 2 ? '③ 1000만 K까지 — 더 모으자' : '별이 태어났다!';
      now.classList.toggle('done', k === 3);
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        if (!ps.length && W) reset(W, H);
        t += dt;
        c.fillStyle = '#0b1026'; c.fillRect(0, 0, W, H);
        // 손으로 끌기
        ps.forEach((p) => {
          if (hand) { const dx = hand.x - p.x, dy = hand.y - p.y, d = Math.hypot(dx, dy); if (d < 150 && d > 1) { p.vx += dx / d * 240 * dt; p.vy += dy / d * 240 * dt; } }
          if (core) { const dx = core.x - p.x, dy = core.y - p.y, d = Math.hypot(dx, dy), g = (20 + mass * 6) / Math.max(40, d); if (d < 120 + mass * 3) { p.vx += dx / d * g * 60 * dt; p.vy += dy / d * g * 60 * dt; } }
          p.vx *= 0.97; p.vy *= 0.97; p.x += p.vx * dt; p.y += p.vy * dt;
          if (p.x < 0 || p.x > W * 0.82) p.vx *= -1; if (p.y < 0 || p.y > H) p.vy *= -1;
        });
        // 덩어리 찾기·삼키기
        if (!core) {
          const near = hand ? ps.filter((p) => Math.hypot(p.x - hand.x, p.y - hand.y) < 40) : [];
          if (near.length >= 12) core = { x: hand.x, y: hand.y };
        }
        if (core) {
          for (let i = ps.length - 1; i >= 0; i--) { const p = ps[i]; if (Math.hypot(p.x - core.x, p.y - core.y) < 10 + Math.sqrt(mass) * 2) { ps.splice(i, 1); mass += 1; } }
          if (hand) { core.x += (hand.x - core.x) * 0.02; core.y += (hand.y - core.y) * 0.02; }
        }
        ps.forEach((p) => { c.fillStyle = 'rgba(190,205,240,.75)'; c.fillRect(p.x, p.y, 2.4, 2.4); });
        if (core) {
          const K = tempK(), r = 6 + Math.sqrt(mass) * 3;
          if (!born && K >= 1e7) { born = true; flash = 1; window.RxT.jolt(stage, 2); }
          if (mass >= 8 && !born) P.glow(c, core.x, core.y, r * 4, mass >= 70 ? `rgba(255,${150 - Math.min(80, mass / 2)},80,.85)` : 'rgba(170,190,240,.45)');
          if (born) { P.glow(c, core.x, core.y, r * 5 + Math.sin(t * 3) * 4, 'rgba(255,245,200,1)', 'rgba(255,200,120,0)'); P.txt(c, '수소 핵융합!', core.x, core.y - r * 5 - 10, '#fff', '800 24px'); }
        }
        if (hand) { c.strokeStyle = 'rgba(255,216,77,.6)'; c.lineWidth = 2; c.beginPath(); c.arc(hand.x, hand.y, 150, 0, Math.PI * 2); c.stroke(); }
        if (flash > 0) { c.fillStyle = `rgba(255,250,220,${flash})`; c.fillRect(0, 0, W, H); flash = Math.max(0, flash - dt * 1.5); }
        // 온도 눈금
        const gx = W * 0.91, y0 = H * 0.1, y1 = H * 0.86, K = core ? tempK() : 30, l = Math.log10(K) / 7.2;
        c.fillStyle = '#16203f'; c.fillRect(gx - 14, y0, 28, y1 - y0); c.fillStyle = '#e8603c'; c.fillRect(gx - 10, y1 - (y1 - y0) * l, 20, (y1 - y0) * l);
        const m = y1 - (y1 - y0) * 7 / 7.2; c.strokeStyle = '#ffd84d'; c.lineWidth = 3; c.beginPath(); c.moveTo(gx - 24, m); c.lineTo(gx + 24, m); c.stroke();
        P.txt(c, '1000만 K', gx - 28, m + 6, '#ffd84d', '700 18px', 'right'); P.txt(c, '중심 온도', gx, y1 + 26, '#fbfcf9', '700 18px');
        P.txt(c, NAME[level()], 20, 96, '#fbfcf9', '800 30px', 'left');
        setLevel(level());
      },
      down(p) { hand = p; }, move(p, e, held) { if (held) hand = p; }, up() { hand = null; },
    });
    root.querySelector('.bi-reset').addEventListener('click', () => { reset(S.W, S.H); S.kick(); });
    root._bi = { feed: (n) => { if (!core) core = { x: S.W * 0.4, y: S.H * 0.5 }; mass += n; S.redraw(); } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Birth = { mount };
})();
