/* 3-3 3차시 체험 «삼투로 물이 움직인다»(교과서 151쪽 삼투·그림 Ⅲ-36 + 152쪽 탐구 + 참고서 삼투·삼투압·U자관·세포와 삼투 표·삼투의 예).
   (가) U자관: 가운데 선택적 투과막(물 ○, 설탕 ×). 설탕 숟가락을 끌어 한쪽 관에 넣으면 물이 막을 지나 설탕 쪽으로 더 많이 넘어가 수면이 오른다.
        수면 차가 커지면 되미는 힘도 커져 드나드는 물이 같아지는 곳에서 멈춘다. 양쪽 농도가 같으면 높이 그대로.
   (나) 세포 넣기: 적혈구·양파 표피세포 카드를 끌어 저장액·등장액·고장액 비커에 넣으면 물 화살표가 드나들고 모양이 변한다. 결과는 오른쪽 표에.
   생활 예(부품함 줄의 카드)를 누르면 그 칸의 비커에 해당 세포가 들어가고 표 칸이 밝아진다.
   ① U자관으로 삼투를 본다 ② 적혈구를 세 용액에 넣는다 ③ 식물 세포를 세 용액에 넣는다.
   Osmosis.mount(root) → { fit, setActive } · 시험용: root._os.state() · geo() · sugar('L'|'R') · put('rbc'|'plant', 0~2) · ex(이름) · tick(초) */
(function () {
  'use strict';
  const TAU = Math.PI * 2, FONT = '"IBM Plex Sans KR", sans-serif';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k, ease = (u) => u * u * (3 - 2 * u);
  const SOL = [{ n: '저장액', s: '증류수', tint: 'rgba(170,215,240,.55)' }, { n: '등장액', s: '세포 안과 같은 농도', tint: 'rgba(170,205,230,.6)' }, { n: '고장액', s: '10 % 소금물', tint: 'rgba(150,190,220,.7)' }];
  const RES = { rbc: ['부풀다 터짐(용혈)', '변화 없음', '쪼그라듦'], plant: ['팽팽해짐(팽윤)', '변화 없음', '원형질분리'] };
  const CELL = { rbc: '적혈구', plant: '양파 표피세포' };
  const EX = {
    root: { c: 'plant', s: 0, t: '<b>뿌리털이 흙의 물을 빨아들인다</b>: 뿌리털 세포 안이 흙 속 물보다 진하다 → 흙 물은 뿌리털에게 <b>저장액</b>. 물이 세포 안으로 더 많이 들어온다.' },
    cabbage: { c: 'plant', s: 2, t: '<b>소금물에 절인 배추가 숨이 죽는다</b>: 진한 소금물은 배추 세포에게 <b>고장액</b>. 세포에서 물이 빠져나가 원형질분리가 일어나고 잎이 흐물흐물해진다.' },
    fruit: { c: 'plant', s: 2, t: '<b>과일에 설탕을 뿌려 과일청을 담그면 물이 고인다</b>: 설탕이 녹은 겉물이 과일 세포보다 진한 <b>고장액</b>이 되어 세포 속 물이 밖으로 나온다.' },
    ringer: { c: 'rbc', s: 1, t: '<b>링거액(수액)</b>은 혈구와 농도를 맞춘 <b>등장액</b>이다. 증류수를 혈관에 넣으면 적혈구가 부풀어 터질 수 있다.' },
    egg: { c: 'rbc', s: 0, t: '<b>껍데기를 녹인 달걀을 증류수에 담그면 무거워진다</b>(교과서 더하기): 달걀도 막으로 싸인 동물 세포라 <b>저장액</b>에서 물이 들어와 부푼다. 10 % 소금물에서는 가벼워진다.' },
  };

  const txt = (c, t, x, y, col = '#1d2433', f = '700 20px', al = 'center') => { c.fillStyle = col; c.font = `${f} ${FONT}`; c.textAlign = al; c.fillText(t, x, y); };
  function pill(c, x, y, t, bg, fg = '#fff', f = '700 17px', al = 'center') {
    c.font = `${f} ${FONT}`; const w = c.measureText(t).width + 20, x0 = al === 'left' ? x : al === 'right' ? x - w : x - w / 2;
    c.fillStyle = bg; c.beginPath(); c.roundRect(x0, y - 15, w, 28, 14); c.fill(); txt(c, t, x0 + w / 2, y + 5, fg, f);
  }
  function arrow(c, x0, y0, x1, y1, w, col) {
    const a = Math.atan2(y1 - y0, x1 - x0), hl = 8 + w * 1.6;
    c.strokeStyle = col; c.fillStyle = col; c.lineWidth = w; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1 - Math.cos(a) * hl * 0.8, y1 - Math.sin(a) * hl * 0.8); c.stroke(); c.lineCap = 'butt';
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - Math.cos(a - 0.45) * hl, y1 - Math.sin(a - 0.45) * hl); c.lineTo(x1 - Math.cos(a + 0.45) * hl, y1 - Math.sin(a + 0.45) * hl); c.closePath(); c.fill();
  }
  function cube(c, x, y, s, a) { // 설탕 알갱이
    c.save(); c.translate(x, y); c.rotate(a);
    const g = c.createLinearGradient(-s, -s, s, s); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#d9cba8');
    c.fillStyle = g; c.strokeStyle = '#9a8655'; c.lineWidth = 1.2; c.beginPath(); c.roundRect(-s, -s, s * 2, s * 2, 2); c.fill(); c.stroke(); c.restore();
  }
  // 적혈구: 가운데 오목(오목도 cc), 크기 k, 쭈글쭈글 sp, 터짐 b(0~1)
  function rbc(c, x, y, R, k, cc, sp, b, t) {
    if (b > 0) {
      const g = c.createRadialGradient(x, y, 2, x, y, R * (1.5 + b)); g.addColorStop(0, `rgba(200,50,45,${0.55 * (1 - b * 0.6)})`); g.addColorStop(1, 'rgba(200,50,45,0)');
      c.fillStyle = g; c.beginPath(); c.arc(x, y, R * (1.5 + b), 0, TAU); c.fill();
      c.strokeStyle = `rgba(160,60,60,${0.7 - b * 0.3})`; c.lineWidth = 2; c.setLineDash([10, 9]); c.beginPath(); c.arc(x, y, R * k, 0.3, TAU - 0.2); c.stroke(); c.setLineDash([]);
      for (let i = 0; i < 7; i++) { const a = i / 7 * TAU + 0.4, d = R * k * (1 + b * 0.5); c.fillStyle = 'rgba(190,40,40,.6)'; c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 3 + (i % 3), 0, TAU); c.fill(); }
      return;
    }
    c.beginPath();
    for (let i = 0; i <= 90; i++) { const a = i / 90 * TAU, r = R * k * (1 + sp * Math.abs(Math.sin(7 * a)) ** 3 + 0.015 * Math.sin(3 * a + t * 2)); c.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r * (1 - 0.06 * cc)); }
    c.closePath();
    const g = c.createRadialGradient(x - R * 0.2 * k, y - R * 0.25 * k, R * 0.05, x, y, R * k * 1.05);
    g.addColorStop(0, cc > 0.1 ? `rgba(244,${lerp(120, 175, cc) | 0},${lerp(115, 165, cc) | 0},1)` : '#e2706a'); g.addColorStop(0.42, cc > 0.1 ? '#d75550' : '#cf4a44'); g.addColorStop(0.8, '#b52f2b'); g.addColorStop(1, '#7d1a1a');
    c.shadowColor = 'rgba(80,0,0,.25)'; c.shadowBlur = 8; c.shadowOffsetY = 3; c.fillStyle = g; c.fill(); c.shadowColor = 'transparent';
    c.strokeStyle = '#6e1414'; c.lineWidth = 1.6; c.stroke();
    if (cc > 0.1) { c.strokeStyle = `rgba(120,20,20,${0.35 * cc})`; c.lineWidth = 3; c.beginPath(); c.arc(x, y, R * k * 0.42, 0, TAU); c.stroke(); }
  }
  // 양파 표피세포: 세포벽(바깥 사각) + 원형질(세포막·자주색 액포·핵). gap = 세포막이 벽에서 떨어진 정도(0~1), bulge = 벽이 부푼 정도
  function plant(c, x, y, w, h, gap, bulge, t) {
    const wall = (inset, bow) => { const x0 = x - w / 2 + inset, x1 = x + w / 2 - inset, y0 = y - h / 2 + inset, y1 = y + h / 2 - inset; c.beginPath(); c.moveTo(x0 + 8, y0); c.quadraticCurveTo(x, y0 - bow, x1 - 8, y0); c.quadraticCurveTo(x1, y0, x1, y0 + 8); c.quadraticCurveTo(x1 + bow, y, x1, y1 - 8); c.quadraticCurveTo(x1, y1, x1 - 8, y1); c.quadraticCurveTo(x, y1 + bow, x0 + 8, y1); c.quadraticCurveTo(x0, y1, x0, y1 - 8); c.quadraticCurveTo(x0 - bow, y, x0, y0 + 8); c.quadraticCurveTo(x0, y0, x0 + 8, y0); c.closePath(); };
    // 이웃 세포벽 조금(조직처럼)
    c.save(); c.beginPath(); c.rect(x - w / 2 - 18, y - h / 2 - 16, w + 36, h + 32); c.clip();
    c.strokeStyle = 'rgba(120,100,50,.45)'; c.lineWidth = 5;
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([u, v]) => { c.beginPath(); c.rect(x - w / 2 + u * (w + 6) + (v ? w * 0.3 * v : 0), y - h / 2 + v * (h + 6), w, h); c.stroke(); });
    c.restore();
    wall(0, bulge); c.fillStyle = '#f6f1dc'; c.fill(); c.strokeStyle = '#7a6a2c'; c.lineWidth = 7; c.stroke();
    // 원형질(세포막 안): 떨어질수록 둥글게
    const px = x + gap * 5, pw = w - 12 - gap * w * 0.4, ph = h - 10 - gap * h * 0.36;
    c.beginPath(); c.roundRect(px - pw / 2, y - ph / 2, pw, ph, 8 + gap * Math.min(pw, ph) * 0.45);
    const vg = c.createRadialGradient(px - pw * 0.2, y - ph * 0.2, 4, px, y, Math.max(pw, ph) * 0.7);
    vg.addColorStop(0, gap > 0.3 ? '#a3317a' : bulge > 2 ? '#d98bc0' : '#c768a8'); vg.addColorStop(1, gap > 0.3 ? '#5e1048' : '#93367a');
    c.fillStyle = vg; c.fill(); c.strokeStyle = '#3f2a52'; c.lineWidth = 2; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.ellipse(px - pw * 0.2, y - ph * 0.22, pw * 0.22, ph * 0.12, -0.2, 0, TAU); c.fill();
    c.fillStyle = '#d9d2c2'; c.strokeStyle = '#6b6252'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(px + pw / 2 - 16, y + ph / 2 - 14 + Math.sin(t) * 0.5, 9, 7, 0, 0, TAU); c.fill(); c.stroke();
  }

  function mount(root) {
    const stage = root.querySelector('.os-stage'), chip = root.querySelector('.os-now'), out = root.querySelector('.os-out'), tab = root.querySelector('.os-tab tbody');
    const exBtns = [...root.querySelectorAll('.os-ex')];
    let clock, drag, msg, ok, sL, sR, xh, flow, water, sugarP, cross, beak, res, pick, eqSaid;

    function reset() {
      clock = 0; drag = null; ok = new Set(); sL = 0; sR = 0; xh = 0; flow = 0; water = []; sugarP = []; cross = []; eqSaid = false;
      beak = [null, null, null]; res = { rbc: [0, 0, 0], plant: [0, 0, 0] }; pick = null;
      exBtns.forEach((b) => b.setAttribute('aria-pressed', 'false'));
      say('(가) 위의 <b>설탕 숟가락</b>을 끌어 U자관 <b>오른쪽 관</b>에 넣어 보자. 막은 물 분자만 지나가게 한다.');
      table(); steps();
    }
    const say = (t) => { if (t !== msg) { msg = t; out.innerHTML = t; } };

    function geo() {
      const W = S.W, H = S.H, ux = Math.round(W * 0.4), aw = 92, xL = Math.round(ux * 0.27), xR = Math.round(ux * 0.73), xm = (xL + xR) / 2;
      const yTop = 150, yb = H - 140, rest = Math.round((yTop + yb - aw) / 2 + 40), sc = 170;
      const rx = ux + 20, bw = Math.floor((W - rx - 12 - 28) / 3);
      return { W, H, ux, aw, xL, xR, xm, yTop, yb, rest, sc, yLl: rest + xh * sc, yLr: rest - xh * sc,
        bowl: { x: xm, y: 70 }, spoon: { x: xm + 64, y: 54 },
        beak: [0, 1, 2].map((i) => ({ x: rx + i * (bw + 14), y: 136, w: bw, h: Math.round(H * 0.47) })),
        cards: ['rbc', 'plant'].map((k, i) => ({ k, x: rx + 10 + i * ((W - rx - 12) / 2), y: H - 168, w: (W - rx - 12) / 2 - 20, h: 112 })) };
    }

    // ── (가) U자관 ──
    const conc = () => [sL / (1 - xh), sR / (1 + xh)];
    function sugar(side) {
      if ((side === 'L' ? sL : sR) >= 3) { say('한쪽에 세 숟가락까지만 넣자.'); return; }
      if (side === 'L') sL++; else sR++;
      const g = geo(), x = side === 'L' ? g.xL : g.xR, y = side === 'L' ? g.yLl : g.yLr;
      for (let i = 0; i < 7; i++) sugarP.push({ side, x: x + (Math.random() - 0.5) * 40, y: y - 30 - Math.random() * 30, vx: 0, vy: 40, a: Math.random() * TAU, fall: true });
      eqSaid = false;
      const [cl, cr] = conc();
      say(sL && sR && Math.abs(cl - cr) < 0.02 ? '이제 양쪽 <b>농도가 같다</b>. 물은 계속 오가지만 양쪽으로 드나드는 양이 같아 수면 높이가 변하지 않는다.'
        : `${side === 'L' ? '왼쪽' : '오른쪽'} 관에 설탕을 넣었다. 설탕 알갱이는 막에 막히지만, 물 분자는 막을 지나 <b>농도가 높은 쪽</b>으로 더 많이 넘어간다 — <b>삼투</b>. 수면을 지켜보자.`);
      steps();
    }
    function stepU(dt, g) {
      const [cl, cr] = conc(), G = 1.6;
      flow = 0.55 * ((cr - cl) - G * 2 * xh); xh = clamp(xh + flow * dt, -0.62, 0.62);
      if ((sL || sR) && Math.abs(flow) < 0.012 && Math.abs(xh) > 0.1 && !eqSaid) { eqSaid = true; say(`수면 차가 더 벌어지지 않는다. 높아진 물기둥이 되미는 힘과 삼투가 맞서 <b>드나드는 물의 양이 같아졌다</b>. 이때 막에 작용하는 압력이 <b>삼투압</b>이고, 농도가 진할수록 크다. ${Math.abs(xh) > 0.4 ? '' : '설탕을 더 넣으면 차이가 더 벌어진다.'}`); steps(); }
      if (Math.abs(xh) > 0.15) ok.add(1);
      // 막을 지나는 물 분자(오가는 수: 농도가 높은 쪽으로 가는 수가 더 많다)
      const jLR = 1.6 + Math.max(0, flow) * 30, jRL = 1.6 + Math.max(0, -flow) * 30;
      if (Math.random() < jLR * dt) cross.push({ d: 1, u: 0, y: g.yb - g.aw * (0.15 + Math.random() * 0.7) });
      if (Math.random() < jRL * dt) cross.push({ d: -1, u: 0, y: g.yb - g.aw * (0.15 + Math.random() * 0.7) });
      cross = cross.filter((q) => (q.u += dt / 0.9) < 1);
      water.forEach((p) => moveIn(p, dt, g, 2.5));
      sugarP.forEach((p) => {
        if (p.fall) { p.vy += 300 * dt; p.y += p.vy * dt; const lv = p.side === 'L' ? g.yLl : g.yLr; if (p.y > lv + 6) { p.fall = false; p.vx = (Math.random() - 0.5) * 30; p.vy = 20; } return; }
        moveIn(p, dt, g, 5);
      });
    }
    function moveIn(p, dt, g, r) { // 자기 쪽 액체 안에서 무작위로 움직인다(막에서는 튕김)
      p.vx += -p.vx * 1.5 * dt + (Math.random() - 0.5) * 220 * dt; p.vy += -p.vy * 1.5 * dt + (Math.random() - 0.5) * 220 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt; p.a = (p.a || 0) + dt;
      const ax = p.side === 'L' ? g.xL : g.xR, lv = p.side === 'L' ? g.yLl : g.yLr, ch = g.yb - g.aw;
      p.y = clamp(p.y, lv + r + 2, g.yb - r - 3);
      const lo = p.y > ch + r ? (p.side === 'L' ? ax - g.aw / 2 + r : g.xm + r + 3) : ax - g.aw / 2 + r, hi = p.y > ch + r ? (p.side === 'L' ? g.xm - r - 3 : ax + g.aw / 2 - r) : ax + g.aw / 2 - r;
      if (p.x < lo) { p.x = lo; p.vx = Math.abs(p.vx); } if (p.x > hi) { p.x = hi; p.vx = -Math.abs(p.vx); if (p.side === 'L' && r > 3 && p.y > ch) p.hit = clock; }
      if (p.side === 'R' && p.x <= lo + 0.5 && r > 3 && p.y > ch) p.hit = clock;
    }
    function drawU(c, g, t) {
      pill(c, 14, 26, '(가) U자관', '#1f5f4a', '#fff', '800 18px', 'left');
      const { xL, xR, xm, aw, yTop, yb } = g, ch = yb - aw, [cl, cr] = conc();
      // 액체
      const liq = (side, lv, cc) => {
        const x0 = side === 'L' ? xL - aw / 2 : xm, x1 = side === 'L' ? xm : xR + aw / 2, ax = side === 'L' ? xL : xR;
        const gr = c.createLinearGradient(0, lv, 0, yb); const k = clamp(cc / 1.5, 0, 1); gr.addColorStop(0, `rgba(${lerp(180, 250, k)},${lerp(220, 226, k)},${lerp(244, 160, k)},.95)`); gr.addColorStop(1, `rgba(${lerp(120, 232, k)},${lerp(180, 190, k)},${lerp(225, 100, k)},.95)`);
        c.fillStyle = gr; c.beginPath(); c.moveTo(ax - aw / 2, lv); c.lineTo(ax + aw / 2, lv); c.lineTo(ax + aw / 2, side === 'L' ? ch : yb - 18); c.lineTo(x1, side === 'L' ? ch : yb); c.lineTo(x1, yb); c.lineTo(x0, yb); c.lineTo(x0, side === 'L' ? yb - 18 : ch); if (side === 'R') c.lineTo(ax - aw / 2, ch); c.closePath(); c.fill();
        c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 2; c.beginPath(); for (let x = ax - aw / 2; x <= ax + aw / 2; x += 6) c.lineTo(x, lv + Math.sin(x / 9 + t * 3) * 1.4); c.stroke();
      };
      // 바닥 가로관 채우기(양쪽 모두 아래는 가득)
      liq('L', g.yLl, cl); liq('R', g.yLr, cr);
      // 유리관
      c.strokeStyle = '#6f7d88'; c.lineWidth = 4; c.lineJoin = 'round';
      c.beginPath(); c.moveTo(xL - aw / 2, yTop); c.lineTo(xL - aw / 2, yb - 18); c.quadraticCurveTo(xL - aw / 2, yb, xL - aw / 2 + 18, yb); c.lineTo(xR + aw / 2 - 18, yb); c.quadraticCurveTo(xR + aw / 2, yb, xR + aw / 2, yb - 18); c.lineTo(xR + aw / 2, yTop); c.stroke();
      c.beginPath(); c.moveTo(xL + aw / 2, yTop); c.lineTo(xL + aw / 2, ch); c.lineTo(xR - aw / 2, ch); c.lineTo(xR - aw / 2, yTop); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 3; [xL - aw / 2 + 7, xR - aw / 2 + 7].forEach((x) => { c.beginPath(); c.moveTo(x, yTop + 10); c.lineTo(x, ch - 10); c.stroke(); });
      // 처음 수면 눈금
      c.setLineDash([6, 5]); c.strokeStyle = 'rgba(29,36,51,.45)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(xL - aw / 2 - 14, g.rest); c.lineTo(xR + aw / 2 + 14, g.rest); c.stroke(); c.setLineDash([]);
      txt(c, '처음 높이', xL - aw / 2 - 18, g.rest - 8, '#5b6474', '600 13px', 'right');
      // 분자
      water.forEach((p) => { c.fillStyle = '#2a7fc0'; c.beginPath(); c.arc(p.x, p.y, 2.6, 0, TAU); c.fill(); });
      sugarP.forEach((p) => { cube(c, p.x, p.y, 5, p.a); if (p.hit && clock - p.hit < 0.35) { c.strokeStyle = `rgba(217,72,59,${1 - (clock - p.hit) / 0.35})`; c.lineWidth = 2; c.beginPath(); c.arc(xm, p.y, 9, 0, TAU); c.stroke(); } });
      // 막
      c.strokeStyle = '#c99a2e'; c.lineWidth = 6; c.setLineDash([7, 4]); c.beginPath(); c.moveTo(xm, ch); c.lineTo(xm, yb); c.stroke(); c.setLineDash([]);
      cross.forEach((q) => { const x = xm - q.d * 26 + q.d * 52 * q.u; c.globalAlpha = Math.sin(Math.PI * q.u); c.fillStyle = '#0d5fa0'; c.beginPath(); c.arc(x, q.y, 3.6, 0, TAU); c.fill(); c.globalAlpha = 1; });
      txt(c, '선택적 투과막', xm, yb + 26, '#8a6512', '800 16px'); txt(c, '물 ○ · 설탕 ×', xm, yb + 46, '#8a6512', '700 14px');
      // 드나드는 물 화살표
      const jLR = 1 + Math.max(0, flow) * 22, jRL = 1 + Math.max(0, -flow) * 22, ay = ch - 20;
      arrow(c, xm - 32, ay - 8, xm + 32, ay - 8, clamp(2 + jLR * 1.5, 2, 12), 'rgba(29,111,184,.9)'); arrow(c, xm + 32, ay + 12, xm - 32, ay + 12, clamp(2 + jRL * 1.5, 2, 12), 'rgba(29,111,184,.9)');
      txt(c, '물', xm, ay - 26, '#1d6fb8', '800 16px');
      // 이름과 농도
      [['L', xL, g.yLl, sL, cl], ['R', xR, g.yLr, sR, cr]].forEach(([s, x, lv, n, cc]) => { txt(c, n ? `설탕 ${n}숟가락` : '물', x, yTop - 14, '#1d2433', '800 17px'); if (n) txt(c, `농도 ${cc.toFixed(1)}`, x, yTop - 34, '#8a6512', '700 14px'); });
      // 수면 차
      if (Math.abs(g.yLl - g.yLr) > 8) {
        const hx = xR + aw / 2 + 30, a = Math.min(g.yLl, g.yLr), b = Math.max(g.yLl, g.yLr);
        c.setLineDash([4, 4]); c.strokeStyle = 'rgba(29,36,51,.5)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(xL, g.yLl); c.lineTo(hx + 8, g.yLl); c.moveTo(xR, g.yLr); c.lineTo(hx + 8, g.yLr); c.stroke(); c.setLineDash([]);
        c.strokeStyle = '#b2362b'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(hx, a); c.lineTo(hx, b); c.stroke();
        c.save(); c.translate(hx + 16, (a + b) / 2); c.rotate(-Math.PI / 2); txt(c, '수면 차', 0, 0, '#b2362b', '800 15px'); c.restore();
      }
      // 설탕 그릇과 숟가락
      const bw = g.bowl; c.fillStyle = '#e8eef2'; c.strokeStyle = '#6f7d88'; c.lineWidth = 2; c.beginPath(); c.ellipse(bw.x, bw.y, 46, 12, 0, 0, TAU); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(bw.x - 46, bw.y); c.quadraticCurveTo(bw.x, bw.y + 62, bw.x + 46, bw.y); c.fillStyle = '#d6dee4'; c.fill(); c.stroke();
      c.fillStyle = '#fbf7ec'; c.beginPath(); c.ellipse(bw.x, bw.y - 2, 40, 9, 0, 0, TAU); c.fill();
      for (let i = 0; i < 14; i++) cube(c, bw.x - 30 + (i * 37) % 60, bw.y - 4 + (i % 3) * 2, 2.6, i);
      txt(c, '설탕', bw.x - 70, bw.y + 6, '#5b6474', '700 15px', 'right');
      if (!(drag && drag.spoon)) spoonAt(c, g.spoon.x, g.spoon.y + Math.sin(t * 2.4) * 2, -0.5, true);
    }
    function spoonAt(c, x, y, a, heap) {
      c.save(); c.translate(x, y); c.rotate(a);
      const mg = c.createLinearGradient(0, -8, 0, 8); mg.addColorStop(0, '#f4f6f8'); mg.addColorStop(1, '#8e99a3');
      c.fillStyle = mg; c.strokeStyle = '#59636c'; c.lineWidth = 1.5; c.beginPath(); c.roundRect(4, -4, 70, 8, 4); c.fill(); c.stroke();
      c.beginPath(); c.ellipse(-12, 0, 20, 13, 0, 0, TAU); c.fill(); c.stroke();
      if (heap) { c.fillStyle = '#fffaf0'; c.beginPath(); c.ellipse(-12, -3, 15, 8, 0, Math.PI, TAU); c.fill(); for (let i = 0; i < 5; i++) cube(c, -22 + i * 5, -5 - (i % 2) * 3, 2.2, i); }
      c.restore();
    }

    // ── (나) 세포 넣기 ──
    function put(cell, i) {
      beak[i] = { cell, u: 0 };
      const m = cell === 'rbc'
        ? ['<b>적혈구</b>를 <b>저장액</b>(증류수)에 넣었다. 세포 안이 바깥보다 진해 들어오는 물이 나가는 물보다 많다 → 부풀다가 결국 <b>터진다(용혈)</b>.',
          '<b>적혈구</b>를 <b>등장액</b>에 넣었다. 물이 들어오지도 나가지도 않는 것이 아니라, <b>드나드는 양이 같아서</b> 모양이 그대로다.',
          '<b>적혈구</b>를 <b>고장액</b>(10 % 소금물)에 넣었다. 바깥이 더 진해 나가는 물이 많다 → 쪼그라든다.']
        : ['<b>양파 표피세포</b>를 <b>저장액</b>에 넣었다. 물이 많이 들어와 액포가 커지고 세포가 팽팽해진다(<b>팽윤</b>). 단단한 <b>세포벽</b>이 버텨서 터지지 않는다.',
          '<b>양파 표피세포</b>를 <b>등장액</b>에 넣었다. 드나드는 물의 양이 같아 부피가 변하지 않는다.',
          '<b>양파 표피세포</b>를 <b>고장액</b>에 넣었다. 물이 빠져나가 자주색 액포와 세포질이 줄어들고 <b>세포막이 세포벽에서 떨어진다(원형질분리)</b>. 세포벽 크기는 거의 그대로다.'];
      say(m[i]); pick = { cell, i, at: clock }; table(); steps();
    }
    function stepB(dt) { beak.forEach((b, i) => { if (!b) return; const was = b.u; b.u = Math.min(1, b.u + dt / 3.2); if (was < 1 && b.u >= 1) { res[b.cell][i] = 1; table(); steps(); } }); }
    function drawB(c, g, t) {
      pill(c, g.ux + 20, 26, '(나) 세포 넣기', '#1f5f4a', '#fff', '800 18px', 'left');
      txt(c, '카드를 끌어 비커에 넣기', g.ux + 190, 32, '#5b6474', '700 15px', 'left');
      g.beak.forEach((q, i) => {
        const b = beak[i], cx = q.x + q.w / 2, cy = q.y + q.h * 0.55;
        txt(c, SOL[i].n, cx, q.y - 34, '#1d2433', '800 21px'); txt(c, SOL[i].s, cx, q.y - 12, '#5b6474', '600 14px');
        const hot = drag && drag.card && Math.abs(drag.x - cx) < q.w / 2 && drag.y > q.y && drag.y < q.y + q.h;
        // 비커
        c.fillStyle = SOL[i].tint; c.beginPath(); c.roundRect(q.x + 6, q.y + 30, q.w - 12, q.h - 36, [0, 0, 14, 14]); c.fill();
        c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 2; c.beginPath(); for (let x = q.x + 8; x < q.x + q.w - 8; x += 6) c.lineTo(x, q.y + 30 + Math.sin(x / 10 + t * 2 + i) * 1.5); c.stroke();
        if (i === 2) { c.fillStyle = 'rgba(255,255,255,.75)'; for (let k = 0; k < 18; k++) { const x = q.x + 16 + (k * 47) % (q.w - 32), y = q.y + 46 + (k * 29) % (q.h - 64); c.fillRect(x + Math.sin(t + k) * 2, y, 3, 3); } }
        c.strokeStyle = hot ? '#e0a400' : '#6f7d88'; c.lineWidth = hot ? 5 : 3; c.beginPath(); c.moveTo(q.x, q.y + 6); c.lineTo(q.x + 6, q.y + 14); c.lineTo(q.x + 6, q.y + q.h - 14); c.quadraticCurveTo(q.x + 6, q.y + q.h, q.x + 20, q.y + q.h); c.lineTo(q.x + q.w - 20, q.y + q.h); c.quadraticCurveTo(q.x + q.w - 6, q.y + q.h, q.x + q.w - 6, q.y + q.h - 14); c.lineTo(q.x + q.w - 6, q.y + 14); c.lineTo(q.x + q.w, q.y + 6); c.stroke();
        c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 3; c.beginPath(); c.moveTo(q.x + 14, q.y + 30); c.lineTo(q.x + 14, q.y + q.h - 24); c.stroke();
        if (!b) { txt(c, '비어 있음', cx, cy + 6, 'rgba(29,36,51,.4)', '700 16px'); return; }
        // 현미경으로 본 동그라미
        const R = Math.min(q.w * 0.42, 80);
        c.save(); c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.fillStyle = 'rgba(255,255,250,.88)'; c.fill(); c.clip();
        const u = ease(b.u);
        if (b.cell === 'rbc') {
          const rr = R * 0.5;
          if (i === 0) rbc(c, cx, cy, rr, 1 + 0.4 * Math.min(1, u / 0.75), clamp(1 - u / 0.6, 0, 1), 0, b.u > 0.82 ? (b.u - 0.82) / 0.18 : 0, t);
          else if (i === 1) rbc(c, cx, cy, rr, 1 + Math.sin(t * 2) * 0.01, 1, 0, 0, t);
          else rbc(c, cx, cy, rr, 1 - 0.25 * u, 1 - 0.7 * u, 0.13 * u, 0, t);
        } else {
          const pw = R * 1.45, ph = R * 0.92;
          if (i === 0) plant(c, cx, cy, pw * (1 + 0.03 * u), ph * (1 + 0.04 * u), 0, 5 * u, t);
          else if (i === 1) plant(c, cx, cy, pw, ph, 0.05, 0, t);
          else plant(c, cx, cy, pw, ph, 0.05 + 0.7 * u, 0, t);
        }
        c.restore();
        c.strokeStyle = '#3a404a'; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke();
        // 물이 드나드는 화살표(굵기 = 양)
        const inW = i === 0 ? 9 : i === 1 ? 4.5 : 2, outW = i === 0 ? 2 : i === 1 ? 4.5 : 9, act = b.u < 1 || i === 1 || (b.cell === 'plant' && i === 0);
        if (act && !(b.cell === 'rbc' && i === 0 && b.u > 0.85)) {
          const ph = (t * 0.8) % 1;
          [[-1, 0], [1, 0]].forEach(([sx]) => {
            const x0 = cx + sx * (R - 4), x1 = cx + sx * (R - 34);
            c.globalAlpha = 0.5 + 0.5 * Math.sin(ph * TAU); arrow(c, x0, cy - 16, x1, cy - 16, inW, '#1d6fb8'); c.globalAlpha = 0.5 + 0.5 * Math.cos(ph * TAU); arrow(c, x1, cy + 16, x0, cy + 16, outW, '#5aa9e0'); c.globalAlpha = 1;
          });
          txt(c, 'H₂O', cx, cy - R - 8, '#1d6fb8', '800 14px');
        }
        if (b.u >= 1) pill(c, cx, q.y + q.h + 24, RES[b.cell][i], b.cell === 'rbc' ? '#a3302b' : '#6e2a66', '#fff', '700 15px');
        else txt(c, `${CELL[b.cell]} 넣는 중…`, cx, q.y + q.h + 28, '#5b6474', '600 14px');
      });
      // 카드
      g.cards.forEach((q) => {
        const lift = drag && drag.card === q.k; if (lift) c.globalAlpha = 0.35;
        drawCard(c, q.x, q.y + Math.sin(t * 2 + (q.k === 'rbc' ? 0 : 1)) * 1.5, q.w, q.h, q.k, t); c.globalAlpha = 1;
      });
      if (drag && drag.card) { const q = g.cards.find((k) => k.k === drag.card); drawCard(c, drag.x - q.w / 2, drag.y - q.h / 2, q.w, q.h, q.k, t, true); }
    }
    function drawCard(c, x, y, w, h, k, t, lifted) {
      c.save(); c.shadowColor = 'rgba(0,0,0,.2)'; c.shadowBlur = lifted ? 16 : 6; c.shadowOffsetY = lifted ? 8 : 3;
      c.fillStyle = '#fffdf6'; c.beginPath(); c.roundRect(x, y, w, h, 14); c.fill(); c.shadowColor = 'transparent';
      c.strokeStyle = k === 'rbc' ? '#a3302b' : '#6e2a66'; c.lineWidth = 3; c.stroke();
      if (k === 'rbc') rbc(c, x + 56, y + h / 2, 30, 1, 1, 0, 0, t); else plant(c, x + 58, y + h / 2, 72, 46, 0.05, 0, t);
      txt(c, k === 'rbc' ? '동물 세포' : '식물 세포', x + 112, y + 40, '#5b6474', '700 15px', 'left');
      txt(c, CELL[k], x + 112, y + 66, '#1d2433', '800 20px', 'left');
      txt(c, '끌어 넣기', x + 112, y + 92, k === 'rbc' ? '#a3302b' : '#6e2a66', '700 14px', 'left');
      c.restore();
    }

    // ── 표·단계 ──
    function table() {
      const desc = ['세포 안보다 묽다', '세포 안과 같다', '세포 안보다 진하다'];
      tab.innerHTML = SOL.map((s, i) => `<tr><th>${s.n}<br><small>${desc[i]}</small></th>${['rbc', 'plant'].map((k) => `<td class="${pick && pick.cell === k && pick.i === i ? 'pick' : ''}">${res[k][i] ? `<b>${RES[k][i]}</b>` : ''}</td>`).join('')}</tr>`).join('');
    }
    function steps() {
      if (res.rbc.every(Boolean)) ok.add(2); if (res.plant.every(Boolean)) ok.add(3);
      const n = [1, 2, 3].find((k) => !ok.has(k)) || 0;
      window.L1.steps(root, n, [...ok]); window.L1.done(root, n === 0);
      chip.textContent = n === 1 ? '① 설탕 숟가락을 끌어 U자관 한쪽에 넣기' : n === 2 ? '② 적혈구 카드를 세 비커에 차례로 넣기' : n === 3 ? '③ 양파 표피세포 카드를 세 비커에 넣기' : '✓ 물은 묽은 쪽 → 진한 쪽으로 (삼투)';
      chip.classList.toggle('done', n === 0);
    }

    function draw(c, W, H, dt) {
      clock += dt; const g = geo(), t = clock;
      if (!water.length && W) for (let i = 0; i < 70; i++) { const side = i % 2 ? 'R' : 'L'; water.push({ side, x: (side === 'L' ? g.xL : g.xR) + (Math.random() - 0.5) * g.aw * 0.8, y: lerp(g.rest + 8, g.yb - 8, Math.random()), vx: 0, vy: 0 }); }
      if (dt) { stepU(dt, g); stepB(dt); }
      const bg = c.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#f7f5ee'); bg.addColorStop(1, '#ece6d6'); c.fillStyle = bg; c.fillRect(0, 0, W, H);
      c.fillStyle = 'rgba(120,95,60,.12)'; c.fillRect(0, H - 34, W, 34);
      c.strokeStyle = 'rgba(29,36,51,.18)'; c.lineWidth = 2; c.setLineDash([8, 8]); c.beginPath(); c.moveTo(g.ux + 4, 16); c.lineTo(g.ux + 4, H - 16); c.stroke(); c.setLineDash([]);
      drawU(c, g, t); drawB(c, g, t);
      if (drag && drag.spoon) { spoonAt(c, drag.x, drag.y, -0.2 + Math.sin(t * 8) * 0.06, true); txt(c, '관 위에서 놓기', drag.x, drag.y + 34, '#1d2433', '700 15px'); }
    }

    const S = window.Play.make(stage, {
      draw,
      down(p) {
        const g = geo();
        if (Math.hypot(p.x - g.spoon.x, p.y - g.spoon.y) < 50 || Math.hypot(p.x - g.bowl.x, p.y - g.bowl.y) < 46) { drag = { spoon: true, x: p.x, y: p.y }; return; }
        const cd = g.cards.find((q) => p.x > q.x && p.x < q.x + q.w && p.y > q.y && p.y < q.y + q.h);
        if (cd) { drag = { card: cd.k, x: p.x, y: p.y }; return; }
      },
      move(p) { if (drag) { drag.x = p.x; drag.y = p.y; } },
      up(p) {
        const d = drag; drag = null; if (!d) return; const g = geo();
        if (d.spoon) {
          const side = Math.abs(p.x - g.xL) < g.aw && p.y < g.yb ? 'L' : Math.abs(p.x - g.xR) < g.aw && p.y < g.yb ? 'R' : null;
          if (side) sugar(side); else say('숟가락은 U자관 <b>왼쪽 관</b>이나 <b>오른쪽 관</b> 위에서 놓자.');
        }
        if (d.card) {
          const i = g.beak.findIndex((q) => p.x > q.x && p.x < q.x + q.w && p.y > q.y - 50 && p.y < q.y + q.h + 20);
          if (i >= 0) put(d.card, i); else say('카드는 세 <b>비커</b> 가운데 하나에 놓자.');
        }
      },
      key(e) {
        const k = e.key;
        if (k === 'l' || k === 'L') { sugar('L'); return true; }
        if (k === 'r' || k === 'R') { sugar('R'); return true; }
        if ('123'.includes(k) && k) { put('rbc', +k - 1); return true; }
        if ('456'.includes(k) && k) { put('plant', +k - 4); return true; }
        if (k === '0') { reset(); return true; }
        return false;
      },
    });
    function ex(name) {
      const e = EX[name]; if (!e) return;
      exBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.ex === name)));
      put(e.c, e.s); say(e.t); pick = { cell: e.c, i: e.s, at: clock }; table();
    }
    exBtns.forEach((b) => b.addEventListener('click', () => { ex(b.dataset.ex); S.kick(); }));
    root.querySelector('.os-reset').addEventListener('click', () => { reset(); S.kick(); });
    reset();

    root._os = {
      state: () => ({ sL, sR, xh: +xh.toFixed(3), flow: +flow.toFixed(3), res: JSON.parse(JSON.stringify(res)), beak: beak.map((b) => b && b.cell), ok: [...ok], fin: root.classList.contains('u-done'), out: out.textContent, chip: chip.textContent }),
      geo: () => { const g = geo(); return { W: g.W, H: g.H, spoon: [g.spoon.x, g.spoon.y], armL: [g.xL, g.yTop + 20], armR: [g.xR, g.yTop + 20], beak: g.beak.map((q) => [q.x + q.w / 2, q.y + q.h / 2]), cards: g.cards.map((q) => [q.k, q.x + q.w / 2, q.y + q.h / 2]) }; },
      sugar: (s) => { sugar(s); return root._os.state(); },
      put: (k, i) => { put(k, i); return root._os.state(); },
      ex: (n) => { ex(n); return root._os.state(); },
      tick: (sec) => { for (let i = 0; i < sec * 60; i++) draw(S.c, S.W, S.H, 1 / 60); return root._os.state(); },
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Osmosis = { mount };
})();
