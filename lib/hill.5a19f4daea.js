/* 3-3 2차시 체험 «에너지 언덕 넘기»(교과서 146쪽 그림 Ⅲ-31 + 참고서 활성화에너지와 반응 속도·효소가 있을 때의 반응 경로·반응열).
   반응의 진행을 땅 모양으로 그렸다: 왼쪽 분지(반응물) → 가운데 언덕(활성화에너지) → 오른쪽 분지(생성물). 높이 = 에너지.
   분자 구슬은 저마다 에너지가 달라 분지에서 우글거리고, 언덕보다 큰 에너지를 얻은 구슬만 넘어간다(넘으면 생성물 색).
   조작: 구슬을 끌어 던지기(빠를수록 큰 에너지, 모자라면 굴러 내려옴) · 아래 가열판 문지르기(온도↑, 손을 떼면 식음)
         · 효소를 끌어 언덕에 놓기(낮은 길 «효소 터널») · 표지판 누르기(발열·이화 ↔ 흡열·동화).
   ① 효소 없이 체온에서 넘겨 본다 ② 효소를 놓는다 ③ 반응열이 변하는지 본다.
   Hill.mount(root) → { fit, setActive } · 시험용: root._hl.state() · geo() · throwE(에너지) · enz(켜기) · flip() · heat(℃) · tick(초) */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const EA0 = 10, EA1 = 4, P_EXO = -6, P_ENDO = 3, N = 24, BODY = 37;
  const lerp = (a, b, k) => a + (b - a) * k, clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const FONT = '"IBM Plex Sans KR", sans-serif';

  // 반응의 진행 s(0~1)에 따른 에너지: 반응물 0 → 언덕 꼭대기 ea → 생성물 p, 양 끝은 벽
  function E(s, ea, p) {
    const sig = 1 / (1 + Math.exp(-(s - 0.5) / 0.04)), g = Math.exp(-(((s - 0.5) / 0.085) ** 2));
    let e = p * sig + (ea - p * 0.5) * g;
    if (s < 0.09) e += 6 * ((0.09 - s) / 0.09) ** 2;
    if (s > 0.91) e += 6 * ((s - 0.91) / 0.09) ** 2;
    return e;
  }
  const peak = (ea, p) => { let m = -99; for (let i = 300; i <= 700; i++) m = Math.max(m, E(i / 1000, ea, p)); return m; };
  const kT = (T) => 1.4 * (T + 273) / 310;

  // 효소(단백질): 울퉁불퉁한 덩어리 + 기질이 들어가는 오목한 자리(a 방향)
  function protein(c, x, y, R, a, t, col = ['#c9efd5', '#3fae6a', '#1d6b3a']) {
    c.save(); c.translate(x, y); c.rotate(a);
    c.beginPath();
    for (let i = 0; i <= 72; i++) {
      const th = i / 72 * TAU, d = Math.atan2(Math.sin(th), Math.cos(th));
      const notch = Math.abs(d) < 0.55 ? 0.42 * Math.cos(d / 0.55 * Math.PI / 2) : 0;
      const r = R * (1 + 0.07 * Math.sin(3 * th + 1.3) + 0.05 * Math.sin(5 * th + t * 0.8) - notch);
      c.lineTo(Math.cos(th) * r, Math.sin(th) * r);
    }
    c.closePath();
    c.shadowColor = 'rgba(20,40,30,.3)'; c.shadowBlur = 8; c.shadowOffsetY = 4;
    const g = c.createRadialGradient(-R * 0.35, -R * 0.4, 2, 0, 0, R * 1.1); g.addColorStop(0, col[0]); g.addColorStop(0.55, col[1]); g.addColorStop(1, col[2]);
    c.fillStyle = g; c.fill(); c.shadowColor = 'transparent'; c.strokeStyle = col[2]; c.lineWidth = 2; c.stroke();
    c.fillStyle = 'rgba(255,255,255,.28)';
    [[-0.45, -0.3, 0.12], [-0.1, 0.45, 0.1], [-0.55, 0.25, 0.08], [0.15, -0.55, 0.09], [0.3, 0.55, 0.08]].forEach(([u, v, r]) => { c.beginPath(); c.arc(u * R, v * R, r * R, 0, TAU); c.fill(); });
    c.restore();
  }
  function bead(c, x, y, r, col, dark) {
    const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, 1, x, y, r); g.addColorStop(0, '#fff'); g.addColorStop(0.35, col); g.addColorStop(1, dark);
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 1.2; c.stroke();
  }
  const txt = (c, t, x, y, col = '#1d2433', f = '700 20px', al = 'center') => { c.fillStyle = col; c.font = `${f} ${FONT}`; c.textAlign = al; c.fillText(t, x, y); };
  function pill(c, x, y, t, bg, fg = '#fff', f = '700 19px') {
    c.font = `${f} ${FONT}`; const w = c.measureText(t).width + 20;
    c.fillStyle = bg; c.beginPath(); c.roundRect(x - w / 2, y - 16, w, 30, 15); c.fill(); txt(c, t, x, y + 6, fg, f);
  }
  function arrow2(c, x, y0, y1, col, dash) { // 양쪽 화살표(세로)
    c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 3; if (dash) c.setLineDash([7, 5]);
    c.beginPath(); c.moveTo(x, y0); c.lineTo(x, y1); c.stroke(); c.setLineDash([]);
    const hd = (y, d) => { c.beginPath(); c.moveTo(x, y); c.lineTo(x - 7, y + d * 12); c.lineTo(x + 7, y + d * 12); c.closePath(); c.fill(); };
    const d = y1 < y0 ? 1 : -1; hd(y1, d); hd(y0, -d);
  }

  function mount(root) {
    const stage = root.querySelector('.hl-stage'), chip = root.querySelector('.hl-now'), out = root.querySelector('.hl-out'), tab = root.querySelector('.hl-tab tbody');
    let balls, T, ek, eOn, pk, endo, hits, clock, drag, msg, ok, thrown, nThrow, flips, enzHits, meas, sparks, eHome;

    function reset() {
      T = BODY; ek = 0; eOn = false; pk = 0; endo = false; hits = []; clock = 0; drag = null; ok = new Set(); thrown = null; nThrow = 0; flips = 0; enzHits = 0; sparks = [];
      meas = { off: null, on: null, accOff: [0, 0], accOn: [0, 0] };
      balls = Array.from({ length: N }, () => spawn());
      say('왼쪽 분지의 <b>분자 구슬</b> 하나를 잡아 오른쪽 언덕 너머로 <b>던져</b> 보자. 세게 던질수록 에너지가 크다.');
      table(); steps();
    }
    function spawn(b = {}) {
      const s = 0.12 + Math.random() * 0.2;
      return Object.assign(b, { s, et: E(s, ea(), pv()) + kT(T) * -Math.log(Math.random() || 0.01), dir: Math.random() < 0.5 ? -1 : 1, prod: false, age: 0, ph: Math.random() * TAU, fade: 1, thrown: false });
    }
    const ea = () => lerp(EA0, EA1, ek), pv = () => lerp(P_EXO, P_ENDO, pk);
    const say = (t) => { if (t !== msg) { msg = t; out.innerHTML = t; } };

    function geo() {
      const W = S.W, H = S.H, ax = 70, top = 200, bot = H - 104;
      const u = (bot - top) / (EA0 + 1 - P_EXO);
      const yR = top + (EA0 + 1) * u;
      const X = (s) => ax + 30 + s * (W - ax - 130), Y = (e) => yR - e * u;
      const sOf = (x) => clamp((x - ax - 30) / (W - ax - 130), 0, 1);
      return { W, H, ax, top, bot, u, yR, X, Y, sOf,
        home: { x: Math.round(W * 0.27), y: 128 }, enzAt: { x: X(0.47), y: Y(EA1) - 4 },
        plate: { x: ax + 160, y: H - 74, w: Math.round(W * 0.3), h: 34 }, thermo: { x: ax + 40, y: H - 40, h: Math.max(110, H - 40 - yR - 80) },
        sign: { x: Math.round(W * 0.66), y: 64, w: 232, h: 72 }, gauge: { x: W - 104, y: 132, r: 78 } };
    }

    // ── 움직임 ──
    function stepBalls(dt) {
      const e = ea(), p = pv(), k = kT(T);
      balls.forEach((b) => {
        if (drag && drag.ball === b) return;
        b.ph += dt * (4 + k * 3);
        if (b.prod) {
          b.age += dt; if (b.age > 3) b.fade -= dt / 0.6;
          if (b.fade <= 0) { spawn(b); return; }
        }
        const here = E(b.s, e, p);
        if (!b.thrown && Math.random() < dt * 5 && (b.prod ? here < p + 1.5 : here < 1.5)) { b.et = here + (b.prod ? 0.6 : k) * -Math.log(Math.random() || 0.01); if (Math.random() < 0.5) b.dir = -b.dir; }
        if (b.et < here) b.et = here + 0.05;
        const v = 0.8 * Math.sqrt(Math.max(0.04, b.et - here)), ns = clamp(b.s + b.dir * v * dt, 0.01, 0.99);
        if (E(ns, e, p) > b.et) {
          b.dir = -b.dir;
          if (b.thrown && b.dir < 0 && !b.prod) { thrown = { ...thrown, fail: true, t: 0 }; failMsg(b); }
        } else { b.s = ns; if (ns <= 0.01 || ns >= 0.99) b.dir = -b.dir; }
        if (b.prod) b.et = lerp(b.et, here + 0.6, Math.min(1, dt * 1.5));
        if (b.prod && b.s < 0.58) { b.s = 0.58; b.dir = 1; }
        if (!b.prod && b.s > 0.6) cross(b);
        if (b.thrown && !b.prod && b.dir < 0 && here < 1) b.thrown = false;
      });
    }
    function cross(b) {
      b.prod = true; b.age = 0; b.fade = 1; hits.push(clock); if (ek > 0.9) enzHits++;
      const g = geo(); for (let i = 0; i < 6; i++) sparks.push({ x: g.X(b.s), y: g.Y(E(b.s, ea(), pv())) - 14, vx: (Math.random() - 0.3) * 90, vy: -60 - Math.random() * 60, u: 0 });
      if (b.thrown) { b.thrown = false; thrown = { ...thrown, pass: true, t: 0 }; say(`넘었다! 던진 에너지 <b>${thrown.e.toFixed(0)}</b>이 언덕 높이 <b>${peak(ea(), pv()).toFixed(0)}</b>보다 컸다. 넘은 분자는 <b>생성물</b>(주황)이 된다.`); }
      steps();
    }
    function failMsg() {
      const need = peak(ea(), pv());
      say(`언덕을 다 못 오르고 <b>굴러 내려왔다</b>. 던진 에너지 <b>${thrown.e.toFixed(0)}</b> &lt; 넘는 데 필요한 에너지(<b>활성화에너지</b>) <b>${need.toFixed(0)}</b>. ${ek < 0.5 && T < 60 ? '체온에서 이만한 에너지를 가진 분자는 거의 없다.' : ''}`);
    }
    const rate = () => hits.filter((t) => t > clock - 4).length / Math.min(4, Math.max(1, clock));

    function throwBall(b, s, e, dir) {
      b.s = s; b.et = E(s, ea(), pv()) + e; b.dir = dir; b.thrown = true; b.prod = false; b.fade = 1; nThrow++;
      thrown = { b, e: b.et, t: 0, s, en: ek > 0.5 };
      say(`던진 에너지 <b>${b.et.toFixed(0)}</b> — 점선 높이까지 오를 수 있다. 언덕 꼭대기는 <b>${peak(ea(), pv()).toFixed(0)}</b>.`);
      steps();
    }
    function setEnz(on) {
      if (on === eOn) return; eOn = on;
      if (on) say('효소가 언덕에 <b>낮은 길</b>을 냈다. 체온 그대로인데 넘는 구슬이 훨씬 많아졌다 — 오른쪽 위 <b>반응 속도</b> 계기를 보자.');
      else say('효소를 뺐다. 언덕은 다시 높아졌지만 <b>반응물과 생성물의 높이 차(반응열)</b>는 그대로다.');
      if (!on && ok.has(2)) ok.add(3);
      steps(); table();
    }
    function flip() {
      endo = !endo; flips++;
      say(endo ? '<b>흡열 반응(동화 작용)</b>: 생성물이 반응물보다 높다. 효소는 이때도 언덕만 낮춘다. 이때 꼭대기는 생성물보다도 높아서, 넘어야 할 높이가 반응열보다 크다.' : '<b>발열 반응(이화 작용)</b>: 생성물이 반응물보다 낮아 그 차이만큼 에너지가 나온다.');
      if (eOn && ok.has(2)) ok.add(3);
      steps(); table();
    }

    // ── 표·단계 ──
    function table() {
      const p = endo ? P_ENDO : P_EXO, heat = Math.abs(p), r = (v) => (v == null ? '' : v < 0.15 ? '거의 0' : `약 ${v.toFixed(1)}개`);
      const a0 = ok.has(1) || nThrow ? `<b>${peak(EA0, p).toFixed(0)}</b>(높다)` : '', a1 = eOn || ok.has(2) ? `<b>${peak(EA1, p).toFixed(0)}</b>(낮다)` : '';
      const h0 = a0 ? `${heat} (${endo ? '흡수' : '방출'})` : '', h1 = a1 ? `${heat} (${endo ? '흡수' : '방출'})` : '';
      tab.innerHTML = `<tr><th>활성화에너지</th><td>${a0}</td><td>${a1}</td></tr><tr><th>반응열</th><td>${h0}</td><td>${h1}${a0 && a1 ? ' <b>같다</b>' : ''}</td></tr><tr><th>1초에 넘는 수<br><small>(37 ℃)</small></th><td>${r(meas.off)}</td><td>${r(meas.on)}</td></tr>`;
    }
    function steps() {
      if (nThrow && !eOn) ok.add(1);
      if (eOn && enzHits >= 3) ok.add(2);
      const n = [1, 2, 3].find((k) => !ok.has(k)) || 0;
      window.L1.steps(root, n, [...ok]); window.L1.done(root, n === 0);
      chip.textContent = n === 1 ? '① 구슬을 끌어 언덕 너머로 던지기' : n === 2 ? '② 효소를 끌어 언덕 위에 놓기' : n === 3 ? '③ 효소를 빼 보거나 표지판 누르기 — 반응열은?' : '✓ 효소는 언덕만 낮춘다 · 반응열은 그대로';
      chip.classList.toggle('done', n === 0);
      table();
    }
    function measure(dt) { // 체온 근처에서 4초 넘게 같은 상태면 1초에 넘는 수를 표에 적는다
      if (T > 42 || clock < 4) return;
      const k = ek > 0.98 ? 'On' : ek < 0.02 ? 'Off' : null; if (!k) return;
      const a = meas['acc' + k]; a[0] += dt; if (a[0] > 4) { const v = rate(); const key = k === 'On' ? 'on' : 'off'; if (meas[key] == null || Math.abs(meas[key] - v) > 0.3) { meas[key] = v; table(); } a[0] = 0; }
      (k === 'On' ? meas.accOff : meas.accOn)[0] = 0;
    }

    // ── 그리기 ──
    function draw(c, W, H, dt) {
      clock += dt;
      const g = geo(), t = clock;
      ek = clamp(ek + (eOn ? 1 : -1) * dt * 1.6, 0, 1); pk = clamp(pk + (endo ? 1 : -1) * dt * 1.4, 0, 1);
      if (!(drag && drag.heat)) T = Math.max(BODY, T - (T - BODY) * 0.6 * dt - 10 * dt);
      if (dt) { stepBalls(dt); measure(dt); }
      const e = ea(), p = pv();
      // 하늘
      const sk = c.createLinearGradient(0, 0, 0, H); sk.addColorStop(0, '#eef4f7'); sk.addColorStop(1, '#f5f2ea'); c.fillStyle = sk; c.fillRect(0, 0, W, H);
      // 땅(효소가 없을 때의 길 = 산등성이)
      const N2 = 160, ridge = (ee) => { for (let i = 0; i <= N2; i++) { const s = i / N2; c.lineTo(g.X(s), g.Y(E(s, ee, p))); } };
      c.beginPath(); c.moveTo(g.ax, H); c.lineTo(g.ax, g.Y(E(0, EA0, p))); ridge(EA0); c.lineTo(W, g.Y(E(1, EA0, p))); c.lineTo(W, H); c.closePath();
      const gr = c.createLinearGradient(0, g.top, 0, H); gr.addColorStop(0, '#c9b07e'); gr.addColorStop(0.5, '#b4945e'); gr.addColorStop(1, '#8f7146'); c.fillStyle = gr; c.fill();
      c.save(); c.clip();
      c.strokeStyle = 'rgba(90,60,30,.18)'; c.lineWidth = 2; for (let k = 0; k < 14; k++) { const y = g.top + 30 + k * 44; c.beginPath(); for (let x = 0; x <= W; x += 20) c.lineTo(x, y + Math.sin(x / 60 + k) * 6); c.stroke(); }
      c.fillStyle = 'rgba(70,45,20,.18)'; for (let k = 0; k < 90; k++) { const x = (k * 137.5) % W, y = g.top + ((k * 71.3) % (H - g.top)); c.beginPath(); c.ellipse(x, y, 5 + (k % 4), 3, k, 0, TAU); c.fill(); }
      // 효소 터널(효소가 있을 때의 낮은 길)
      if (ek > 0.01) {
        const s0 = 0.33, s1 = 0.67;
        c.beginPath(); for (let i = 0; i <= 80; i++) { const s = lerp(s0, s1, i / 80); c.lineTo(g.X(s), g.Y(E(s, e, p)) + 2); }
        for (let i = 80; i >= 0; i--) { const s = lerp(s0, s1, i / 80), y = g.Y(E(s, e, p)) - 62 * Math.sin(Math.PI * i / 80) ** 0.4 * ek; c.lineTo(g.X(s), Math.max(y, g.Y(E(s, EA0, p)) + 4)); }
        c.closePath(); const tg = c.createLinearGradient(0, g.Y(EA1) - 60, 0, g.Y(0)); tg.addColorStop(0, '#3a2c1c'); tg.addColorStop(1, '#5a4630'); c.fillStyle = tg; c.fill();
        c.strokeStyle = `rgba(63,174,106,${ek})`; c.lineWidth = 6; c.beginPath(); for (let i = 0; i <= 80; i++) { const s = lerp(s0, s1, i / 80); c.lineTo(g.X(s), g.Y(E(s, e, p)) + 3); } c.stroke();
      }
      c.restore();
      // 산등성이 선
      c.strokeStyle = '#5a4325'; c.lineWidth = 4; c.beginPath(); ridge(EA0); c.stroke();
      c.fillStyle = 'rgba(95,150,70,.85)'; for (let i = 0; i <= 60; i++) { const s = i / 60, x = g.X(s), y = g.Y(E(s, EA0, p)); c.beginPath(); c.ellipse(x, y - 2, 6, 3, 0, 0, TAU); c.fill(); }
      // 축
      c.strokeStyle = '#1d2433'; c.lineWidth = 3; c.beginPath(); c.moveTo(g.ax, g.top - 70); c.lineTo(g.ax, H - 14); c.stroke();
      c.beginPath(); c.moveTo(g.ax, g.top - 76); c.lineTo(g.ax - 9, g.top - 58); c.lineTo(g.ax + 9, g.top - 58); c.closePath(); c.fillStyle = '#1d2433'; c.fill();
      c.save(); c.translate(g.ax - 26, g.top + 70); c.rotate(-Math.PI / 2); txt(c, '에너지', 0, 0, '#1d2433', '800 22px'); c.restore();
      txt(c, '반응의 진행 →', W - 16, H - 16, '#1d2433', '800 21px', 'right');
      // 반응물·생성물 높이선과 반응열
      const yR = g.Y(0), yP = g.Y(p);
      c.setLineDash([8, 6]); c.strokeStyle = 'rgba(29,36,51,.55)'; c.lineWidth = 2;
      c.beginPath(); c.moveTo(g.X(0.08), yR); c.lineTo(W - 30, yR); c.stroke(); c.beginPath(); c.moveTo(g.X(0.62), yP); c.lineTo(W - 30, yP); c.stroke(); c.setLineDash([]);
      txt(c, '반응물', g.X(0.2), yR + 34, '#1f4f8a', '800 22px'); txt(c, '생성물', g.X(0.8), yP + 34, '#a3540c', '800 22px');
      const hx = W - 58, heatGlow = ok.has(2) ? 0.5 + 0.5 * Math.sin(t * 4) : 0;
      if (heatGlow) { c.fillStyle = `rgba(255,210,58,${0.25 + heatGlow * 0.3})`; c.beginPath(); c.roundRect(hx - 18, Math.min(yR, yP) - 6, 36, Math.abs(yP - yR) + 12, 10); c.fill(); }
      arrow2(c, hx, yR, yP, '#b2362b');
      c.save(); c.translate(hx + 30, (yR + yP) / 2); c.rotate(-Math.PI / 2); txt(c, `반응열 ${Math.abs(p).toFixed(0)}`, 0, 0, '#b2362b', '800 20px'); c.restore();
      // 활성화에너지 화살표(효소 없음: 오른쪽 · 효소 있음: 왼쪽, 이름표는 둘 다 왼쪽 하늘에)
      const pk0 = peak(EA0, p), pk1 = peak(e, p), xa = g.X(0.405), xb = g.X(0.365), lx = xb - 16;
      arrow2(c, xa, yR, g.Y(pk0), '#1d2433', ek > 0.5);
      c.setLineDash([5, 5]); c.strokeStyle = 'rgba(29,36,51,.4)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(lx, g.Y(pk0)); c.lineTo(g.X(0.5), g.Y(pk0)); c.stroke(); c.setLineDash([]);
      txt(c, '활성화에너지', lx, g.Y(pk0) + 30, '#1d2433', '800 20px', 'right'); txt(c, ek > 0.5 ? `(효소 없음) ${pk0.toFixed(0)}` : `높이 ${pk0.toFixed(0)}`, lx, g.Y(pk0) + 54, '#1d2433', '600 18px', 'right');
      if (ek > 0.5) {
        c.setLineDash([5, 5]); c.strokeStyle = 'rgba(29,107,58,.6)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(lx, g.Y(pk1)); c.lineTo(g.X(0.49), g.Y(pk1)); c.stroke(); c.setLineDash([]);
        arrow2(c, xb, yR, g.Y(pk1), '#1d6b3a');
        txt(c, '활성화에너지', lx, g.Y(pk1) + 30, '#1d6b3a', '800 20px', 'right'); txt(c, `(효소 있음) ${pk1.toFixed(0)}`, lx, g.Y(pk1) + 54, '#1d6b3a', '700 18px', 'right');
      }
      if (endo && pk > 0.9) pill(c, g.X(0.8), yP + 76, `활성화에너지 ${pk1.toFixed(0)} > 반응열 ${P_ENDO}`, '#5a4325', '#fff', '700 17px');
      // 효소(집 또는 언덕 위)
      const h = g.home;
      c.fillStyle = 'rgba(255,255,255,.7)'; c.strokeStyle = 'rgba(29,107,58,.6)'; c.lineWidth = 2; c.setLineDash([6, 5]); c.beginPath(); c.roundRect(h.x - 70, h.y - 66, 140, 128, 14); c.fill(); c.stroke(); c.setLineDash([]);
      const enzPos = drag && drag.enz ? { x: drag.x, y: drag.y } : eOn ? { x: g.enzAt.x, y: g.Y(E(0.47, e, p)) - 34 } : { x: h.x, y: h.y - 8 + Math.sin(t * 2) * 3 };
      protein(c, enzPos.x, enzPos.y, 40, eOn && !(drag && drag.enz) ? 0.3 : 0, t);
      txt(c, eOn && !(drag && drag.enz) ? '효소를 끌어 빼기' : '효소(단백질)', h.x, h.y + 52, '#1d6b3a', '700 17px');
      if (!eOn && !(drag && drag.enz)) { const a = 0.4 + 0.4 * Math.sin(t * 3); c.strokeStyle = `rgba(29,107,58,${a})`; c.lineWidth = 3; c.setLineDash([8, 8]); c.beginPath(); c.arc(g.X(0.45), g.Y(EA0) + 70, 52, 0, TAU); c.stroke(); c.setLineDash([]); }
      if (eOn) pill(c, g.X(0.5), g.Y(E(0.5, e, p)) + 40, '효소 터널', '#1d6b3a', '#fff', '700 17px');
      // 구슬
      balls.forEach((b) => {
        if (drag && drag.ball === b) return;
        const x = g.X(b.s), y = g.Y(E(b.s, e, p)), hop = Math.abs(Math.sin(b.ph)) * (2 + kT(T) * 3) * (b.thrown ? 0 : 1);
        c.globalAlpha = clamp(b.fade, 0, 1);
        if (b.thrown) window.Play.glow(c, x, y - 12, 26, 'rgba(255,210,58,.8)');
        bead(c, x + Math.sin(b.ph * 1.7) * 1.2, y - 12 - hop, 11, b.prod ? '#f2a53a' : '#3c8fd6', b.prod ? '#8a4a08' : '#173f6e');
        c.globalAlpha = 1;
      });
      if (drag && drag.ball) { bead(c, drag.x, drag.y, 14, '#3c8fd6', '#173f6e'); txt(c, '빠르게 밀어 놓기 →', drag.x + 20, drag.y - 22, '#173f6e', '700 17px', 'left'); }
      // 던진 구슬의 에너지 높이
      if (thrown && (thrown.t += dt) < 3.2) {
        const yE = g.Y(thrown.e); c.globalAlpha = thrown.t > 2.6 ? (3.2 - thrown.t) / 0.6 : 1;
        c.setLineDash([10, 6]); c.strokeStyle = thrown.pass ? '#2f9e5b' : thrown.fail ? '#d9483b' : '#c99a00'; c.lineWidth = 3; c.beginPath(); c.moveTo(g.X(thrown.s) - 30, yE); c.lineTo(g.X(0.56), yE); c.stroke(); c.setLineDash([]);
        txt(c, `던진 에너지 ${thrown.e.toFixed(0)}`, g.X(thrown.s) - 30, yE - 10, c.strokeStyle, '800 19px', 'left');
        if (thrown.fail) txt(c, '모자라 굴러 내려옴', g.X(0.47), yE + 34, '#d9483b', '800 19px', 'right');
        c.globalAlpha = 1;
      }
      // 반짝이
      sparks = sparks.filter((q) => (q.u += dt) < 0.8);
      sparks.forEach((q) => { q.x += q.vx * dt; q.y += q.vy * dt; q.vy += 120 * dt; c.globalAlpha = 1 - q.u / 0.8; c.fillStyle = '#ffd23a'; c.beginPath(); c.arc(q.x, q.y, 4, 0, TAU); c.fill(); c.globalAlpha = 1; });
      drawHeat(c, g, t); drawSign(c, g, t); drawGauge(c, g);
    }
    function drawHeat(c, g, t) {
      const pl = g.plate, hk = clamp((T - BODY) / 380, 0, 1);
      if (hk > 0.02) { c.globalAlpha = hk; window.Play.glow(c, pl.x + pl.w / 2, pl.y, pl.w * 0.6, 'rgba(255,90,30,.55)'); c.globalAlpha = 1; for (let i = 0; i < 5; i++) { const x = pl.x + 30 + i * (pl.w - 60) / 4; c.strokeStyle = `rgba(255,120,40,${hk * 0.8})`; c.lineWidth = 3; c.beginPath(); for (let k = 0; k < 8; k++) c.lineTo(x + Math.sin(t * 6 + k + i) * 6, pl.y - 10 - k * 9); c.stroke(); } }
      const mg = c.createLinearGradient(0, pl.y, 0, pl.y + pl.h); mg.addColorStop(0, '#dfe3e8'); mg.addColorStop(1, '#8a929c');
      c.fillStyle = mg; c.beginPath(); c.roundRect(pl.x, pl.y, pl.w, pl.h, 8); c.fill(); c.strokeStyle = '#3a404a'; c.lineWidth = 2; c.stroke();
      c.strokeStyle = `rgb(${lerp(90, 255, hk) | 0},${lerp(90, 70, hk) | 0},${lerp(100, 30, hk) | 0})`; c.lineWidth = 4; c.beginPath();
      for (let x = pl.x + 14; x < pl.x + pl.w - 14; x += 4) c.lineTo(x, pl.y + pl.h / 2 + Math.sin(x / 6) * 7); c.stroke();
      txt(c, drag && drag.heat ? '문지르는 중…' : '↔ 문질러 데우기', pl.x + pl.w / 2, pl.y + pl.h + 26, '#1d2433', '800 19px');
      // 온도계
      const th = g.thermo, v = clamp((T - 0) / 450, 0, 1);
      c.fillStyle = '#fff'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.roundRect(th.x - 9, th.y - th.h, 18, th.h, 9); c.fill(); c.stroke();
      c.beginPath(); c.arc(th.x, th.y + 8, 15, 0, TAU); c.fillStyle = '#d9483b'; c.fill(); c.stroke();
      c.fillStyle = '#d9483b'; c.fillRect(th.x - 4, th.y - 4 - (th.h - 14) * v, 8, (th.h - 14) * v + 8);
      [[37, '37 ℃ 체온'], [400, '400 ℃']].forEach(([tv, lab]) => { const y = th.y - 4 - (th.h - 14) * tv / 450; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.moveTo(th.x + 9, y); c.lineTo(th.x + 18, y); c.stroke(); txt(c, lab, th.x + 22, y + 6, tv === 37 ? '#1d6b3a' : '#b2362b', '700 16px', 'left'); });
      txt(c, `${Math.round(T)} ℃`, th.x, th.y - th.h - 14, T > 45 ? '#b2362b' : '#1d2433', '800 21px');
      if (T > 60) { const w = clamp((T - 60) / 80, 0, 1); c.globalAlpha = w; pill(c, g.X(0.2), g.Y(0) - 104, T > 380 ? '몸은 400 ℃가 될 수 없다!' : '몸은 이렇게 뜨거워질 수 없다(체온 37 ℃)', '#b2362b', '#fff', '800 19px'); c.globalAlpha = 1; }
    }
    function drawSign(c, g, t) {
      const s = g.sign;
      c.fillStyle = '#6b4a2a'; c.fillRect(s.x - 6, s.y + s.h - 4, 12, 34);
      c.save(); c.translate(s.x, s.y + s.h / 2); c.rotate(Math.sin(t * 1.3) * 0.015);
      const wg = c.createLinearGradient(0, -s.h / 2, 0, s.h / 2); wg.addColorStop(0, '#e2b878'); wg.addColorStop(1, '#b8874a');
      c.shadowColor = 'rgba(0,0,0,.2)'; c.shadowBlur = 6; c.shadowOffsetY = 3; c.fillStyle = wg; c.beginPath(); c.roundRect(-s.w / 2, -s.h / 2, s.w, s.h, 10); c.fill(); c.shadowColor = 'transparent';
      c.strokeStyle = '#5a3a18'; c.lineWidth = 2.5; c.stroke();
      c.strokeStyle = 'rgba(90,58,24,.25)'; c.lineWidth = 1; for (let i = 1; i < 4; i++) { c.beginPath(); c.moveTo(-s.w / 2 + 8, -s.h / 2 + i * s.h / 4); c.lineTo(s.w / 2 - 8, -s.h / 2 + i * s.h / 4 + 2); c.stroke(); }
      txt(c, endo ? '흡열 반응(동화)' : '발열 반응(이화)', 0, -4, '#2b1a08', '800 22px');
      txt(c, endo ? '누르면 발열로 ⇄' : '누르면 흡열로 ⇄', 0, 24, '#4a2e10', '700 16px');
      c.restore();
    }
    function drawGauge(c, g) {
      const q = g.gauge, v = rate(), a0 = Math.PI * 0.85, a1 = Math.PI * 2.15, max = 4;
      c.fillStyle = 'rgba(255,255,255,.88)'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.roundRect(q.x - q.r - 18, q.y - q.r - 46, q.r * 2 + 36, q.r * 2 + 72, 14); c.fill(); c.stroke();
      txt(c, '반응 속도', q.x, q.y - q.r - 18, '#1d2433', '800 20px');
      c.lineWidth = 12; c.lineCap = 'round';
      c.strokeStyle = '#e3e6ea'; c.beginPath(); c.arc(q.x, q.y + 10, q.r - 10, a0, a1); c.stroke();
      c.strokeStyle = '#2f9e5b'; c.beginPath(); c.arc(q.x, q.y + 10, q.r - 10, a0, lerp(a0, a1, clamp(v / max, 0, 1)) + 0.001); c.stroke(); c.lineCap = 'butt';
      for (let i = 0; i <= max; i++) { const a = lerp(a0, a1, i / max); txt(c, String(i), q.x + Math.cos(a) * (q.r - 34), q.y + 16 + Math.sin(a) * (q.r - 34), '#5b6474', '600 14px'); }
      txt(c, v < 0.05 ? '0' : v.toFixed(1), q.x, q.y + 20, '#1d2433', '800 30px');
      txt(c, '1초에 넘는 수', q.x, q.y + q.r + 6, '#5b6474', '700 15px');
    }

    // ── 손 조작 ──
    const near = (g, p) => { let best = null, bd = 34; balls.forEach((b) => { if (b.prod) return; const d = Math.hypot(p.x - g.X(b.s), p.y - (g.Y(E(b.s, ea(), pv())) - 12)); if (d < bd) { bd = d; best = b; } }); return best; };
    const S = window.Play.make(stage, {
      draw,
      down(p) {
        const g = geo(), s = g.sign, h = g.home, pl = g.plate;
        if (Math.abs(p.x - s.x) < s.w / 2 && Math.abs(p.y - s.y - s.h / 2) < s.h / 2 + 6) { flip(); return; }
        const ep = eOn ? { x: g.enzAt.x, y: g.Y(E(0.47, ea(), pv())) - 34 } : { x: h.x, y: h.y - 8 };
        if (Math.hypot(p.x - ep.x, p.y - ep.y) < 56) { drag = { enz: true, x: p.x, y: p.y }; return; }
        if (p.x > pl.x - 10 && p.x < pl.x + pl.w + 10 && p.y > pl.y - 40 && p.y < pl.y + pl.h + 30) { drag = { heat: true, x: p.x, y: p.y }; say('계속 문지르면 온도가 오르고 구슬이 빨라진다. 손을 떼면 다시 식는다.'); return; }
        const b = near(g, p); if (b) { drag = { ball: b, x: p.x, y: p.y, tr: [[p.x, p.y, performance.now()]] }; b.thrown = true; }
      },
      move(p) {
        if (!drag) return;
        if (drag.heat) { const d = Math.hypot(p.x - drag.x, p.y - drag.y); T = Math.min(450, T + d * 0.3); }
        drag.x = p.x; drag.y = p.y;
        if (drag.tr) { drag.tr.push([p.x, p.y, performance.now()]); if (drag.tr.length > 8) drag.tr.shift(); }
      },
      up(p) {
        const d = drag; drag = null; if (!d) return; const g = geo();
        if (d.enz) { const on = Math.abs(p.x - g.X(0.47)) < 170 && p.y > g.top - 120 && p.y < g.Y(0) + 20; setEnz(on); if (!on && !eOn) say('효소는 <b>언덕 위</b>(점선 동그라미)에 놓아야 길이 생긴다.'); return; }
        if (d.ball) {
          const tr = d.tr, a = tr[0], b = tr[tr.length - 1], dtm = Math.max(16, b[2] - a[2]), vx = (b[0] - a[0]) / dtm * 1000;
          const e = clamp(Math.abs(vx) / 75, 0.5, 14), sp = g.sOf(p.x), s = clamp(sp, 0.1, 0.4);
          throwBall(d.ball, s, e, vx < -30 ? -1 : 1);
        }
      },
      key(e) {
        if (e.key === ' ' || e.key === 'Enter') { const b = balls.find((q) => !q.prod && !q.thrown); if (b) throwBall(b, 0.3, nThrow % 2 ? 12 : 6, 1); return true; }
        if (e.key === 'e' || e.key === 'E' || e.key === '2') { setEnz(!eOn); return true; }
        if (e.key === 'ArrowUp') { T = Math.min(450, T + 60); return true; }
        if (e.key === 'ArrowDown') { T = BODY; return true; }
        if (e.key === 's' || e.key === 'S' || e.key === '3') { flip(); return true; }
        if (e.key === '0') { reset(); return true; }
        return false;
      },
    });
    root.querySelector('.hl-reset').addEventListener('click', () => { reset(); S.kick(); });
    reset();

    root._hl = {
      state: () => ({ T: Math.round(T), ek: +ek.toFixed(2), eOn, endo, hits: hits.length, enzHits, rate: +rate().toFixed(2), nThrow, thrown: thrown && { e: +thrown.e.toFixed(1), pass: !!thrown.pass, fail: !!thrown.fail }, ok: [...ok], meas, fin: root.classList.contains('u-done'), out: out.textContent, chip: chip.textContent, peak: +peak(ea(), pv()).toFixed(1) }),
      geo: () => { const g = geo(); const b = balls.find((q) => !q.prod && !q.thrown); return { W: g.W, H: g.H, home: g.home, hill: [g.X(0.47), g.Y(EA0) + 60], plate: g.plate, sign: [g.sign.x, g.sign.y + g.sign.h / 2], ball: b && [g.X(b.s), g.Y(E(b.s, ea(), pv())) - 12], enz: eOn ? [g.enzAt.x, g.Y(E(0.47, ea(), pv())) - 34] : [g.home.x, g.home.y - 8] }; },
      throwE: (e) => { const b = balls.find((q) => !q.prod && !q.thrown); throwBall(b, 0.3, e, 1); return root._hl.state(); },
      enz: (on) => { setEnz(on); return root._hl.state(); },
      flip: () => { flip(); return root._hl.state(); },
      heat: (v) => { T = v; return root._hl.state(); },
      tick: (sec) => { for (let i = 0; i < sec * 60; i++) draw(S.c, S.W, S.H, 1 / 60); return root._hl.state(); },
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Hill = { mount };
})();
