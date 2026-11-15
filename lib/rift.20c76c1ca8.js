/* 3-1 3차시 표지 «아프리카가 갈라진다»(교과서 112~113쪽 도입: 동아프리카 열곡대 · 발산형 경계).
   동아프리카 단면(사바나 땅 · 대륙 지각 · 암석권 · 연약권). 양쪽 대륙 덩어리를 손으로 끌어 벌리면(한쪽만 끌어도 됨)
   땅이 갈라지고 → 가운데가 내려앉아 열곡(호수) → 마그마가 솟아 화산·새 지각 → 바닷물이 들어와 좁은 바다(홍해처럼).
   연약권의 맨틀은 가운데서 솟아 양옆으로 흐른다(계속 움직이는 화살). 폭·시간 숫자는 이해를 돕기 위한 예.
   키보드: 왼쪽·오른쪽 화살표로 좁히기·벌리기, 0 처음부터. Rift.mount(root) → { fit, setActive } · 시험용: root._rf.open(0~1) · state() */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const STAGES = [
    [0, '① 땅이 갈라지기 시작한다 — 양쪽 땅을 바깥으로 끌어 보자'],
    [0.15, '② 열곡대 — 가운데가 내려앉아 길고 깊은 골짜기, 바닥에 호수'],
    [0.45, '③ 마그마가 솟는다 — 화산이 생기고 틈을 새 지각이 메운다'],
    [0.75, '④ 바닷물이 들어왔다 — 좁은 바다가 생겼다(홍해처럼)'],
  ];
  const stageOf = (o) => STAGES.reduce((a, s, i) => (o >= s[0] ? i : a), 0);
  function mount(root) {
    const stage = root.querySelector('.rf-stage'), now = root.querySelector('.rf-now');
    const P = window.Play;
    let open = 0, t = 0, grab = null, smoke = [], art = null, artW = 0, artH = 0, msg = '', last = 0;
    const lay = (H) => ({ y0: H * 0.4, crust: H * 0.56, lith: H * 0.72 });
    const gapW = (W) => open * W * 0.36;
    function say(h) { if (h !== msg) { msg = h; now.textContent = h; now.classList.toggle('done', open >= 0.75); } }
    function set(v) {
      open = Math.max(0, Math.min(1, v)); const s = stageOf(open);
      if (s !== last) { last = s; window.RxT.jolt(stage, 0.8); }
      say(STAGES[s][1]); S.kick(); return state();
    }
    const km = () => Math.round(5 + open * 295), myr = () => Math.round(open * 30);
    function state() { return { open: +open.toFixed(3), stage: stageOf(open) + 1, km: km() }; }
    // 하늘·연약권 바탕(크기가 바뀔 때만)
    function backdrop(W, H) {
      if (art && artW === W && artH === H) return art;
      art = document.createElement('canvas'); art.width = W; art.height = H; artW = W; artH = H; const c = art.getContext('2d'), L = lay(H);
      c.fillStyle = '#4b4734'; c.fillRect(0, 0, W, H); // 가운데 틈 뒤도 매번 덮이게
      let g = c.createLinearGradient(0, 0, 0, L.y0); g.addColorStop(0, '#5b8fd0'); g.addColorStop(0.7, '#bcdcf2'); g.addColorStop(1, '#f6e3b8'); c.fillStyle = g; c.fillRect(0, 0, W, L.y0);
      // 먼 산줄기
      c.fillStyle = 'rgba(110,120,140,.35)'; c.beginPath(); c.moveTo(0, L.y0); for (let x = 0; x <= W; x += 20) c.lineTo(x, L.y0 - 18 - 14 * Math.sin(x * 0.013) - 8 * Math.sin(x * 0.041)); c.lineTo(W, L.y0); c.fill();
      g = c.createLinearGradient(0, L.lith, 0, H); g.addColorStop(0, '#e2662c'); g.addColorStop(1, '#8e2412'); c.fillStyle = g; c.fillRect(0, L.lith - 40, W, H - L.lith + 40);
      let s = 9; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
      for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(255,${180 + rnd() * 60},120,${0.08 + rnd() * 0.12})`; c.beginPath(); c.arc(rnd() * W, L.lith + rnd() * (H - L.lith), 2 + rnd() * 5, 0, TAU); c.fill(); }
      return art;
    }
    // 대륙 덩어리 하나(왼쪽 dir=-1, 오른쪽 dir=1). 안쪽 끝은 위가 처지고 아래가 얇아진다.
    function block(c, W, H, dir) {
      const L = lay(H), g = gapW(W), cx = W / 2, inner = cx + dir * g / 2, outer = dir < 0 ? -20 : W + 20;
      const sag = Math.min(1, open * 5) * 16, thin = g * 0.3 + open * 30;
      const top = (x) => L.y0 + sag * Math.max(0, 1 - Math.abs(x - inner) / 70);
      // 암석권(맨틀 윗부분)
      let gr = c.createLinearGradient(0, L.crust, 0, L.lith); gr.addColorStop(0, '#6d6a52'); gr.addColorStop(1, '#4b4734'); c.fillStyle = gr;
      c.beginPath(); c.moveTo(outer, L.crust); c.lineTo(inner, L.crust + sag * 0.5); c.lineTo(inner - dir * thin * 0.2, L.lith - open * 34); c.lineTo(inner - dir * thin - dir * 40, L.lith); c.lineTo(outer, L.lith); c.fill();
      // 대륙 지각(층리 무늬)
      gr = c.createLinearGradient(0, L.y0, 0, L.crust); gr.addColorStop(0, '#c08a52'); gr.addColorStop(1, '#8a5a32'); c.fillStyle = gr;
      c.beginPath(); c.moveTo(outer, L.y0); for (let x = outer; dir < 0 ? x <= inner : x >= inner; x -= dir * 8) c.lineTo(x, top(x)); c.lineTo(inner, top(inner)); c.lineTo(inner + dir * 6, L.crust + sag * 0.5); c.lineTo(outer, L.crust); c.fill();
      c.save(); c.clip(); c.strokeStyle = 'rgba(60,30,10,.18)'; c.lineWidth = 2; for (let k = 1; k < 4; k++) { const y = L.y0 + (L.crust - L.y0) * k / 4; c.beginPath(); c.moveTo(outer, y); c.lineTo(inner, y + sag * 0.5); c.stroke(); } c.restore();
      // 정단층 계단(안쪽 끝)
      if (open > 0.05) { c.strokeStyle = 'rgba(40,20,5,.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(inner + dir * 34, top(inner + dir * 34)); c.lineTo(inner + dir * 20, L.crust); c.stroke(); }
      // 풀밭 + 아카시아
      c.fillStyle = '#9bab4a'; c.beginPath(); c.moveTo(outer, L.y0 - 4); for (let x = outer; dir < 0 ? x <= inner : x >= inner; x -= dir * 8) c.lineTo(x, top(x) - 4); c.lineTo(inner, top(inner)); c.lineTo(outer, L.y0 + 4); c.fill();
      [0.2, 0.55, 0.85].forEach((f, i) => { const tx = dir < 0 ? (inner - 60) * f : inner + 60 + (W - inner - 60) * f, ty = top(tx); acacia(c, tx, ty, 0.8 + (i % 2) * 0.3); });
      return { inner, top };
    }
    function acacia(c, x, y, s) {
      c.strokeStyle = '#4a3218'; c.lineWidth = 3 * s; c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - 18 * s); c.lineTo(x - 8 * s, y - 26 * s); c.moveTo(x, y - 18 * s); c.lineTo(x + 9 * s, y - 27 * s); c.stroke();
      const g = c.createLinearGradient(0, y - 34 * s, 0, y - 24 * s); g.addColorStop(0, '#5f8a35'); g.addColorStop(1, '#3d6122'); c.fillStyle = g; c.beginPath(); c.ellipse(x, y - 29 * s, 20 * s, 6 * s, 0, 0, TAU); c.fill();
    }
    function volcano(c, x, y, h, glow) {
      const g = c.createLinearGradient(x - h, 0, x + h, 0); g.addColorStop(0, '#6a5a4c'); g.addColorStop(0.5, '#4a3d33'); g.addColorStop(1, '#2e251f'); c.fillStyle = g;
      c.beginPath(); c.moveTo(x - h * 1.3, y + 2); c.lineTo(x - h * 0.18, y - h); c.lineTo(x + h * 0.18, y - h); c.lineTo(x + h * 1.3, y + 2); c.fill();
      if (glow > 0) { P.glow(c, x, y - h, 16 + glow * 10, `rgba(255,120,40,${0.5 * glow})`); c.fillStyle = `rgba(255,150,60,${0.8 * glow})`; c.fillRect(x - h * 0.14, y - h - 2, h * 0.28, 4); }
      if (Math.random() < 0.08 * glow) smoke.push({ x: x + (Math.random() - 0.5) * 6, y: y - h - 4, r: 5, a: 0.6 });
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const L = lay(H), g = gapW(W), cx = W / 2;
        c.drawImage(backdrop(W, H), 0, 0);
        // 해
        P.glow(c, W * 0.86, H * 0.1, 50, 'rgba(255,220,120,.8)'); c.fillStyle = '#fff2b0'; c.beginPath(); c.arc(W * 0.86, H * 0.1, 18, 0, TAU); c.fill();
        // 솟는 마그마 혹(연약권) — 벌어질수록 높이 솟는다
        const mTop = L.lith - 20 - open * (L.lith - L.y0 - 40);
        const mg = c.createRadialGradient(cx, mTop + 30, 4, cx, mTop + 60, 90 + g); mg.addColorStop(0, '#ffd25a'); mg.addColorStop(0.5, '#f0702a'); mg.addColorStop(1, 'rgba(200,60,20,0)');
        c.fillStyle = mg; c.beginPath(); c.moveTo(cx - 80 - g, L.lith + 10); c.quadraticCurveTo(cx, mTop - 20, cx + 80 + g, L.lith + 10); c.fill();
        // 맨틀 흐름 화살: 가운데서 솟아 양옆으로
        c.strokeStyle = 'rgba(255,235,190,.75)'; c.lineWidth = 3; c.fillStyle = 'rgba(255,235,190,.85)';
        for (let i = 0; i < 6; i++) {
          const u = (t * 0.25 + i / 6) % 1;
          [-1, 1].forEach((d) => {
            let x, y, ang; if (u < 0.35) { x = cx + d * 12; y = H - 10 - (H - 10 - L.lith - 14) * (u / 0.35); ang = -Math.PI / 2; } else { x = cx + d * (12 + (u - 0.35) / 0.65 * W * 0.45); y = L.lith + 18; ang = d > 0 ? 0 : Math.PI; }
            c.save(); c.translate(x, y); c.rotate(ang); c.globalAlpha = Math.sin(u * Math.PI); c.beginPath(); c.moveTo(8, 0); c.lineTo(-6, -6); c.lineTo(-6, 6); c.fill(); c.restore();
          });
        }
        c.globalAlpha = 1;
        // 가운데 틈: 새 지각(현무암)·내려앉은 조각·호수·바다
        const floor = L.y0 + 14 + Math.min(1, open / 0.3) * 30 + Math.max(0, open - 0.6) * 60;
        if (g > 2) {
          const x0 = cx - g / 2, x1 = cx + g / 2;
          if (open >= 0.4) { // 새 지각(현무암): 가운데일수록 젊고 뜨겁다
            const bg = c.createLinearGradient(x0, 0, x1, 0); bg.addColorStop(0, '#2f3136'); bg.addColorStop(0.5, '#4a3a36'); bg.addColorStop(1, '#2f3136'); c.fillStyle = bg; c.fillRect(x0 - 2, floor, g + 4, L.lith - floor);
            c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 1; for (let k = 1; k < 6; k++) { const dx = g / 2 * k / 6; [cx - dx, cx + dx].forEach((x) => { c.beginPath(); c.moveTo(x, floor); c.lineTo(x, L.lith); c.stroke(); }); }
            const pulse = 0.6 + 0.4 * Math.sin(t * 4); c.strokeStyle = `rgba(255,${140 + pulse * 80},60,.95)`; c.lineWidth = 3 + pulse * 2; c.beginPath(); c.moveTo(cx, mTop + 20); c.lineTo(cx, floor); c.stroke(); P.glow(c, cx, floor, 14 + pulse * 6, 'rgba(255,140,50,.8)');
          } else { // 내려앉은 지각 조각
            c.fillStyle = '#9a6a3e'; c.beginPath(); c.moveTo(x0, floor); c.lineTo(x1, floor); c.lineTo(x1 - 4, L.crust + 10); c.lineTo(x0 + 4, L.crust + 10); c.fill();
            c.fillStyle = '#5a5643'; c.fillRect(x0 + 4, L.crust + 10, g - 8, L.lith - L.crust - 10);
          }
          if (open >= 0.75) { // 바닷물
            const sea = L.y0 + 10, wg = c.createLinearGradient(0, sea, 0, floor); wg.addColorStop(0, '#3d9be0'); wg.addColorStop(1, '#0d3c78'); c.fillStyle = wg; c.fillRect(x0 - 8, sea, g + 16, floor - sea);
            c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 2; c.beginPath(); for (let x = x0 - 8; x <= x1 + 8; x += 5) c.lineTo(x, sea + Math.sin(x * 0.08 + t * 2.5) * 2); c.stroke();
            P.txt(c, '좁은 바다', cx, sea + 26, '#e6f4ff', '800 15px');
          } else if (open >= 0.15) { // 열곡 바닥의 호수
            const lw = g * 0.8; c.fillStyle = 'rgba(70,150,210,.9)'; c.beginPath(); c.ellipse(cx, floor + 1, lw / 2, 5, 0, 0, TAU); c.fill();
            c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(cx - lw * 0.2 + Math.sin(t) * 6, floor - 1, lw * 0.15, 1.5);
          }
        }
        // 양쪽 대륙
        const lb = block(c, W, H, -1), rb = block(c, W, H, 1);
        // 어깨의 화산(열곡이 생긴 뒤)
        const vg = open < 0.2 ? 0 : Math.min(1, (open - 0.2) * 4);
        if (vg > 0) { volcano(c, lb.inner - 70, lb.top(lb.inner - 70), 34 * vg, open >= 0.45 ? 1 : 0.4); volcano(c, rb.inner + 90, rb.top(rb.inner + 90), 26 * vg, open >= 0.45 ? 0.8 : 0.3); }
        smoke.forEach((s) => { s.y -= dt * 22; s.x += dt * 8; s.r += dt * 6; s.a -= dt * 0.25; c.fillStyle = `rgba(90,85,80,${Math.max(0, s.a)})`; c.beginPath(); c.arc(s.x, s.y, s.r, 0, TAU); c.fill(); }); smoke = smoke.filter((s) => s.a > 0);
        // 손잡이 표시(아직 안 건드렸으면 흔들리는 화살)
        if (!grab) { const wob = Math.sin(t * 3) * 6; [[-1, lb.inner - 40], [1, rb.inner + 40]].forEach(([d, x]) => { c.fillStyle = 'rgba(255,216,77,.95)'; c.save(); c.translate(x + d * wob, L.y0 - 54); c.rotate(d > 0 ? 0 : Math.PI); c.beginPath(); c.moveTo(16, 0); c.lineTo(0, -11); c.lineTo(0, -5); c.lineTo(-14, -5); c.lineTo(-14, 5); c.lineTo(0, 5); c.lineTo(0, 11); c.fill(); c.restore(); }); }
        // 층 이름
        [['대륙 지각', (L.y0 + L.crust) / 2 + 5, '#fff3dc'], ['암석권(맨틀 윗부분)', (L.crust + L.lith) / 2 + 5, '#f0ead0'], ['연약권 — 천천히 흐른다', L.lith + 46, '#fff1d6']].forEach(([s, y, col]) => P.txt(c, s, 12, y, col, '800 14px', 'left'));
        // 계기: 폭 · 시간
        c.fillStyle = 'rgba(10,16,32,.72)'; c.beginPath(); c.roundRect(W - 236, H - 48, 224, 36, 10); c.fill();
        P.txt(c, `벌어진 폭 약 ${km()} km · 약 ${myr()}백만 년`, W - 124, H - 24, '#fff3d6', '800 15px');
        const bx = W - 228, bw = 208; c.fillStyle = 'rgba(255,255,255,.25)'; c.fillRect(bx, H - 15, bw, 3); c.fillStyle = '#ffd84d'; c.fillRect(bx, H - 15, bw * open, 3);
      },
      down(p) { if (p.y < S.H * 0.85) grab = { side: p.x < S.W / 2 ? -1 : 1, x0: p.x, o0: open }; },
      move(p, e, held) { if (held && grab) set(grab.o0 + grab.side * (p.x - grab.x0) / (S.W * 0.36)); },
      up() { if (grab) { grab = null; S.kick(); } },
      key(e) { if (e.key === 'ArrowRight') { set(open + 0.05); return true; } if (e.key === 'ArrowLeft') { set(open - 0.05); return true; } if (e.key === '0') { grab = null; set(0); return true; } return false; },
    });
    root._rf = { open: set, state };
    set(0);
    console.assert(stageOf(0) === 0 && stageOf(0.2) === 1 && stageOf(0.5) === 2 && stageOf(0.9) === 3, 'rift: 단계 판정');
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Rift = { mount };
})();
