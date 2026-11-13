/* 3-2 1차시 체험 «어디서나 ‹아래›는 지구 중심»(교과서 130쪽 측주 중력의 방향 · 참고서 160쪽 무게와 질량).
   왼쪽: 우주에서 본 지구. 받침의 사람·사과·물방울을 끌어 지구 둘레에 놓으면 발은 땅, 머리는 바깥으로 서고
   중력 화살표가 지구 중심 쪽으로 자란다. 사과·물방울은 놓인 자리에서 지구 중심 쪽으로 떨어진다. 놓인 것도 다시 끌어 옮길 수 있다.
   오른쪽: 저울. 1 kg 추를 끌어 접시에 올리고 바닥(지구·달)을 누르면 무게만 9.8 N ↔ 약 1.6 N으로 바뀌고 질량 1 kg은 그대로.
   Grav.mount(root) → { fit, setActive } · 시험용: root._gr.place(종류, 각도°) · weigh(true/false) · ground('earth'|'moon') · state() */
(function () {
  'use strict';
  const TAU = Math.PI * 2, G = { earth: 9.8, moon: 1.6 }, KINDS = ['person', 'apple', 'drop'], NAME = { person: '사람', apple: '사과', drop: '물방울' };
  const sm = (a, b, x) => { const k = Math.max(0, Math.min(1, (x - a) / (b - a))); return k * k * (3 - 2 * k); };
  // 3차원 값 잡음(지구 대륙·구름 무늬, 시드 고정)
  const hash = (i, j, k) => { const s = Math.sin(i * 127.1 + j * 311.7 + k * 74.7) * 43758.5453; return s - Math.floor(s); };
  function noise(x, y, z) {
    const i = Math.floor(x), j = Math.floor(y), k = Math.floor(z), u = x - i, v = y - j, w = z - k;
    const fu = u * u * (3 - 2 * u), fv = v * v * (3 - 2 * v), fw = w * w * (3 - 2 * w), L = (a, b, t) => a + (b - a) * t;
    const c = (a, b, d) => hash(i + a, j + b, k + d);
    return L(L(L(c(0, 0, 0), c(1, 0, 0), fu), L(c(0, 1, 0), c(1, 1, 0), fu), fv), L(L(c(0, 0, 1), c(1, 0, 1), fu), L(c(0, 1, 1), c(1, 1, 1), fu), fv), fw);
  }
  const fbm = (x, y, z, n) => { let s = 0, a = 0.5, f = 1; for (let o = 0; o < n; o++) { s += a * noise(x * f, y * f, z * f); a *= 0.5; f *= 2.03; } return s / (1 - Math.pow(0.5, n)); };
  // 서로 다른 곳 수: 각도가 35° 넘게 떨어진 자리만 센다
  const spots = (ths) => { const got = []; ths.forEach((t) => { if (got.every((g) => Math.abs(Math.atan2(Math.sin(t - g), Math.cos(t - g))) > 0.61)) got.push(t); }); return got.length; };
  console.assert(spots([0, 0.1, 2, 4]) === 3 && spots([0, 0.2]) === 1, 'gravity: 자리 세기');

  // 지구 그림 세 겹(땅·바다 / 구름 / 밤낮 그늘)을 한 번 그려 둔다
  function bakeEarth(n) {
    const mk = () => { const cv = document.createElement('canvas'); cv.width = cv.height = n; return [cv, cv.getContext('2d')]; };
    const [base, b] = mk(), [cloud, cl] = mk(), [shade, sh] = mk();
    const ib = b.createImageData(n, n), ic = cl.createImageData(n, n), is = sh.createImageData(n, n);
    const L = [-0.55, -0.5, 0.67];
    for (let py = 0; py < n; py++) for (let px = 0; px < n; px++) {
      const x = (px + 0.5) / n * 2 - 1, y = (py + 0.5) / n * 2 - 1, r2 = x * x + y * y; if (r2 > 1) continue;
      const z = Math.sqrt(1 - r2), o = (py * n + px) * 4, edge = sm(1, 0.985, Math.sqrt(r2));
      const h = fbm(x * 1.6 + 3.1, y * 1.6 - 1.7, z * 1.6 + 0.4, 5), dry = fbm(x * 3 + 9, y * 3, z * 3 - 4, 3);
      let R, Gc, B;
      if (Math.abs(y) > 0.9 - (h - 0.5) * 0.25) { R = 236; Gc = 242; B = 247; } // 극지방 얼음
      else if (h > 0.53) {
        const m = sm(0.53, 0.7, h), d = sm(0.45, 0.62, dry) * (1 - Math.abs(y));
        R = 70 + 110 * d + 40 * m; Gc = 125 + 40 * d - 30 * m; B = 58 + 40 * d;
      } else { const s = sm(0.4, 0.53, h); R = 14 + 30 * s; Gc = 58 + 70 * s; B = 128 + 60 * s; }
      ib.data[o] = R; ib.data[o + 1] = Gc; ib.data[o + 2] = B; ib.data[o + 3] = 255 * edge;
      const cv = fbm(x * 2.4 - 5, y * 4.2 + 2, z * 2.4 + 7, 4);
      ic.data[o] = ic.data[o + 1] = ic.data[o + 2] = 255; ic.data[o + 3] = 230 * sm(0.55, 0.72, cv) * edge;
      const lit = Math.max(0, x * L[0] + y * L[1] + z * L[2]);
      is.data[o] = 4; is.data[o + 1] = 8; is.data[o + 2] = 24; is.data[o + 3] = 255 * edge * (0.72 * (1 - sm(0, 0.55, lit)) + 0.12 * (1 - z));
    }
    b.putImageData(ib, 0, 0); cl.putImageData(ic, 0, 0); sh.putImageData(is, 0, 0);
    return { base, cloud, shade };
  }

  function mount(root) {
    const stage = root.querySelector('.gr-stage'), now = root.querySelector('.gr-now'), out = root.querySelector('.gr-out');
    const P = window.Play;
    let objs, drag, onPan, place, seen, t, msg, hover, last, earthImg = null, earthKey = 0, stars = null, wobble, needle, uiT = 0;
    function reset() { objs = []; drag = null; onPan = false; place = 'earth'; seen = { earth: false, moon: false }; t = 0; msg = ''; hover = null; last = null; wobble = 0; needle = 0; }
    reset();
    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };
    // 배치: 지구(왼쪽) · 저울 판(오른쪽)
    const L = () => {
      const W = S.W, H = S.H, px = W * 0.655, R = Math.min(W * 0.25, H * 0.31);
      return { W, H, cx: W * 0.33, cy: H * 0.46, R, tray: { x: 16, y: H - 108, w: 270, h: 92 }, pan: { x: px, y: 16, w: W - px - 16, h: H - 32 } };
    };
    const SZ = (k, R) => ({ person: R * 0.2, apple: R * 0.065, drop: R * 0.06 })[k];
    const restR = () => 1; // 바닥 자리(발·사과 밑)가 지표에 닿을 때
    // 저울 판 안 배치
    function scaleL(l) {
      const p = l.pan, sy = p.y + 136, gy = p.y + p.h - 196, sx = p.x + p.w * 0.64;
      return { tiles: [{ k: 'earth', x: p.x + 14, y: p.y + 50, w: (p.w - 42) / 2, h: 74 }, { k: 'moon', x: p.x + 28 + (p.w - 42) / 2, y: p.y + 50, w: (p.w - 42) / 2, h: 74 }],
        sy, gy, sx, panY: gy - 150, stool: { x: p.x + 58, y: gy - 34 }, box: { y: p.y + p.h - 170 } };
    }
    const weightPos = (l) => { const s = scaleL(l); if (drag && drag.k === 'w') return [drag.x, drag.y]; return onPan ? [s.sx, s.panY - 2 + needle * 0.9] : [s.stool.x, s.stool.y]; };

    function addObj(k, th, rFrom) {
      const l = L(), o = { k, th, r: 1, vr: 0, grow: 0, t: 0, id: Math.random() };
      o.r = k === 'person' ? 1 : Math.max(restR(o, l.R) + 0.16, Math.min(1.75, rFrom || 0));
      objs.push(o); if (objs.length > 10) objs.shift();
      last = o; tell(o); steps(); S.kick(); return o;
    }
    function where(th) {
      const d = ((th * 180 / Math.PI) % 360 + 360) % 360;
      return d > 235 && d < 305 ? '지구 위쪽(북극 쪽)' : d > 55 && d < 125 ? '지구 아래쪽(남극 쪽)' : d >= 125 && d <= 235 ? '지구 왼쪽' : '지구 오른쪽';
    }
    function tell(o) {
      const n = spots(objs.map((q) => q.th)), w = where(o.th);
      if (n >= 3) { say(`화살표 ${objs.length}개를 따라가 보면 모두 <b>지구 중심</b> 한 점에서 만난다. 서 있는 곳마다 ‹아래›가 가리키는 쪽은 달라도, 중력은 늘 지구 중심을 향한다.`); return; }
      if (o.k === 'person') say(`${w}에 선 사람 — 발은 땅에, 머리는 우주 쪽. 이 사람에게 ‹아래›는 발밑, 곧 <b>지구 중심 쪽</b>이다.${o.th > 0.9 && o.th < 2.2 ? ' 거꾸로 매달린 게 아니다!' : ''}`);
      else say(`${w}에서 놓은 ${NAME[o.k]}이 그 자리에서 곧장 <b>지구 중심 쪽</b>으로 떨어진다. 다른 곳에도 놓아 보자.`);
    }
    function setGround(k) {
      if (place === k) return; place = k; wobble = 1;
      if (onPan) seen[k] = true;
      say(onPan ? (k === 'moon' ? '달에서는 눈금이 <b>약 1.6 N</b>으로 내려간다(지구의 약 1/6). 달이 당기는 힘이 약하기 때문이다. 그래도 추에 든 물질의 양, <b>질량은 1 kg 그대로</b>.'
        : '지구로 돌아오니 다시 <b>9.8 N</b>. 무게는 장소에 따라 바뀌고, 질량 1 kg은 어디서나 같다.')
        : `바닥을 ${k === 'moon' ? '달' : '지구'}로 바꿨다. 1 kg 추를 저울 접시에 끌어 올려 보자.`);
      steps(); S.kick();
    }
    function weigh(on) {
      onPan = on; wobble = 1; if (on) seen[place] = true;
      say(on ? (place === 'earth' ? '지구에서 1 kg 추의 무게는 약 <b>9.8 N</b> — 지구가 추를 당기는 힘의 크기다. 이제 위의 «달» 바닥을 눌러 보자.' : '달에서 1 kg 추의 무게는 약 <b>1.6 N</b>. «지구» 바닥을 눌러 비교해 보자.')
        : '추를 내렸다 — 저울이 받는 힘이 없어 눈금은 0. 그래도 추의 질량은 1 kg.');
      steps(); S.kick();
    }
    function steps() {
      const ok = [];
      if (spots(objs.map((q) => q.th)) >= 3) ok.push(1);
      if (seen.earth || seen.moon) ok.push(2);
      if (seen.earth && seen.moon) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const n = spots(objs.map((q) => q.th));
      const nt = st === 1 ? `① 지구 둘레 여러 곳에 놓기 (${n}/3곳)` : st === 2 ? '② 1 kg 추를 저울 접시로' : st === 3 ? `③ 바닥을 ${seen.earth ? '달' : '지구'}로 바꿔 보기` : '모두 해 봤다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
      if (!msg) say('왼쪽 아래 받침에서 <b>사람·사과·물방울</b>을 끌어 지구 둘레 아무 곳에나 놓아 보자. 지구 아래쪽에도!');
    }

    // ── 그리기 ──
    function drawPerson(c, h, i, sw) {
      const shirt = ['#d9563a', '#2f6fb0', '#e0a526', '#3f8f5a'][i % 4], pants = ['#2d3a55', '#4a3a2c', '#33415c', '#5a4632'][i % 4];
      c.lineCap = 'round'; c.lineJoin = 'round';
      c.strokeStyle = pants; c.lineWidth = h * 0.13;
      c.beginPath(); c.moveTo(-h * 0.07, -h * 0.46); c.lineTo(-h * 0.1, -h * 0.04); c.moveTo(h * 0.07, -h * 0.46); c.lineTo(h * 0.1, -h * 0.04); c.stroke();
      c.fillStyle = '#2a2420'; c.beginPath(); c.ellipse(-h * 0.12, -h * 0.025, h * 0.09, h * 0.035, 0, 0, TAU); c.ellipse(h * 0.12, -h * 0.025, h * 0.09, h * 0.035, 0, 0, TAU); c.fill();
      c.strokeStyle = shirt; c.lineWidth = h * 0.1;
      c.beginPath(); c.moveTo(-h * 0.13, -h * 0.76); c.lineTo(-h * 0.24, -h * 0.52 + sw); c.moveTo(h * 0.13, -h * 0.76); c.lineTo(h * 0.24, -h * 0.52 - sw); c.stroke();
      const g = c.createLinearGradient(-h * 0.16, 0, h * 0.16, 0); g.addColorStop(0, shirt); g.addColorStop(1, 'rgba(0,0,0,.25)');
      c.fillStyle = shirt; c.beginPath(); c.roundRect(-h * 0.15, -h * 0.8, h * 0.3, h * 0.38, h * 0.08); c.fill(); c.fillStyle = g; c.fill();
      c.fillStyle = '#f0c49a'; c.beginPath(); c.arc(-h * 0.25, -h * 0.5 + sw, h * 0.045, 0, TAU); c.arc(h * 0.25, -h * 0.5 - sw, h * 0.045, 0, TAU); c.fill();
      c.beginPath(); c.arc(0, -h * 0.9, h * 0.11, 0, TAU); c.fill();
      c.fillStyle = '#2b2018'; c.beginPath(); c.arc(0, -h * 0.93, h * 0.115, Math.PI * 1.05, Math.PI * 1.95); c.fill();
    }
    function drawApple(c, r) {
      const g = c.createRadialGradient(-r * 0.35, -r * 0.4, r * 0.1, 0, 0, r * 1.1); g.addColorStop(0, '#ff8a6a'); g.addColorStop(0.5, '#d42a1f'); g.addColorStop(1, '#7d120e');
      c.fillStyle = g; c.beginPath(); c.moveTo(0, -r * 0.7); c.bezierCurveTo(r * 0.9, -r * 1.25, r * 1.35, r * 0.25, r * 0.3, r * 0.95); c.quadraticCurveTo(0, r * 0.82, -r * 0.3, r * 0.95); c.bezierCurveTo(-r * 1.35, r * 0.25, -r * 0.9, -r * 1.25, 0, -r * 0.7); c.fill();
      c.strokeStyle = '#4a2a14'; c.lineWidth = Math.max(1.5, r * 0.14); c.beginPath(); c.moveTo(0, -r * 0.65); c.quadraticCurveTo(r * 0.05, -r * 1.05, r * 0.2, -r * 1.25); c.stroke();
      c.fillStyle = '#4c9a3a'; c.beginPath(); c.ellipse(r * 0.48, -r * 1.05, r * 0.38, r * 0.17, -0.5, 0, TAU); c.fill();
      c.fillStyle = 'rgba(255,255,255,.55)'; c.beginPath(); c.ellipse(-r * 0.42, -r * 0.25, r * 0.13, r * 0.25, 0.3, 0, TAU); c.fill();
    }
    function drawDrop(c, r) {
      const g = c.createRadialGradient(-r * 0.3, r * 0.1, r * 0.1, 0, r * 0.2, r * 1.2); g.addColorStop(0, '#d9f1ff'); g.addColorStop(0.55, '#4aa6e6'); g.addColorStop(1, '#1d5f9c');
      c.fillStyle = g; c.beginPath(); c.moveTo(0, -r * 1.5); c.bezierCurveTo(r * 0.5, -r * 0.6, r, -r * 0.1, r, r * 0.3); c.arc(0, r * 0.3, r, 0, Math.PI); c.bezierCurveTo(-r, -r * 0.1, -r * 0.5, -r * 0.6, 0, -r * 1.5); c.fill();
      c.fillStyle = 'rgba(255,255,255,.75)'; c.beginPath(); c.ellipse(-r * 0.38, r * 0.15, r * 0.14, r * 0.3, 0.3, 0, TAU); c.fill();
    }
    // 물체 하나: (x, y)는 발/바닥 자리, rot은 «위»가 향할 쪽
    function drawThing(c, k, x, y, rot, R, i, sw) {
      c.save(); c.translate(x, y); c.rotate(rot);
      if (k === 'person') drawPerson(c, SZ(k, R), i, sw); else { c.translate(0, -SZ(k, R)); (k === 'apple' ? drawApple : drawDrop)(c, SZ(k, R)); }
      c.restore();
    }
    function arrow(c, x0, y0, x1, y1, col, w) {
      const a = Math.atan2(y1 - y0, x1 - x0), len = Math.hypot(x1 - x0, y1 - y0); if (len < 4) return;
      const hl = Math.min(w * 3.2, len * 0.6);
      c.save(); c.translate(x0, y0); c.rotate(a);
      c.beginPath(); c.moveTo(0, -w / 2); c.lineTo(len - hl, -w / 2); c.lineTo(len - hl, -w * 1.5); c.lineTo(len, 0); c.lineTo(len - hl, w * 1.5); c.lineTo(len - hl, w / 2); c.lineTo(0, w / 2); c.closePath();
      c.lineJoin = 'round'; c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 4; c.stroke(); c.fillStyle = col; c.fill(); c.restore();
    }
    const label = (c, s, x, y, col, f, al) => { c.save(); c.font = `${f} "IBM Plex Sans KR", sans-serif`; c.textAlign = al || 'center'; c.lineJoin = 'round'; c.strokeStyle = 'rgba(8,14,30,.85)'; c.lineWidth = 5; c.strokeText(s, x, y); c.fillStyle = col; c.fillText(s, x, y); c.restore(); };

    function drawScale(c, l) {
      const p = l.pan, s = scaleL(l), moon = place === 'moon';
      c.fillStyle = '#f7f5ee'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.roundRect(p.x, p.y, p.w, p.h, 14); c.fill(); c.stroke();
      P.txt(c, '저울 — 바닥을 눌러 바꾸기', p.x + p.w / 2, p.y + 34, '#1d2433', '800 21px');
      s.tiles.forEach((tl) => {
        const on = place === tl.k, m = tl.k === 'moon';
        c.save(); c.beginPath(); c.roundRect(tl.x, tl.y, tl.w, tl.h, 10); c.clip();
        const g = c.createLinearGradient(0, tl.y, 0, tl.y + tl.h); if (m) { g.addColorStop(0, '#0b1020'); g.addColorStop(0.55, '#1b2236'); g.addColorStop(0.56, '#9a9a96'); g.addColorStop(1, '#6d6d6a'); } else { g.addColorStop(0, '#9fd0ef'); g.addColorStop(0.55, '#d9eef8'); g.addColorStop(0.56, '#5f9a45'); g.addColorStop(1, '#7b5a3a'); }
        c.fillStyle = g; c.fillRect(tl.x, tl.y, tl.w, tl.h);
        if (m) { c.fillStyle = 'rgba(60,60,58,.5)'; [[0.3, 0.75, 7], [0.7, 0.85, 5], [0.55, 0.68, 3]].forEach(([u, v, r]) => { c.beginPath(); c.ellipse(tl.x + tl.w * u, tl.y + tl.h * v, r * 1.6, r * 0.6, 0, 0, TAU); c.fill(); }); }
        c.restore();
        c.lineWidth = on ? 5 : 2; c.strokeStyle = on ? '#ffd23f' : '#1d2433'; c.beginPath(); c.roundRect(tl.x, tl.y, tl.w, tl.h, 10); c.stroke();
        label(c, m ? '달' : '지구', tl.x + tl.w / 2, tl.y + 34, '#fff', '800 24px');
        if (!on) { const a = 0.5 + 0.5 * Math.sin(t * 4); c.globalAlpha = a; label(c, '누르기', tl.x + tl.w / 2, tl.y + tl.h - 10, '#ffe27a', '800 17px'); c.globalAlpha = 1; }
      });
      // 장면: 하늘과 바닥
      const x0 = p.x + 10, x1 = p.x + p.w - 10, sy = s.sy, gy = s.gy;
      c.save(); c.beginPath(); c.roundRect(x0, sy, x1 - x0, gy + 40 - sy, 10); c.clip();
      const sk = c.createLinearGradient(0, sy, 0, gy);
      if (moon) { sk.addColorStop(0, '#05070f'); sk.addColorStop(1, '#151a2b'); } else { sk.addColorStop(0, '#7fbde6'); sk.addColorStop(1, '#e4f2f8'); }
      c.fillStyle = sk; c.fillRect(x0, sy, x1 - x0, gy - sy);
      if (moon) {
        for (let i = 0; i < 40; i++) { const u = ((i * 97) % 101) / 101, v = ((i * 53) % 89) / 89; c.fillStyle = `rgba(255,255,255,${0.35 + 0.35 * Math.sin(t * 2 + i)})`; c.fillRect(x0 + u * (x1 - x0), sy + v * (gy - sy) * 0.8, 1.6, 1.6); }
        const ex = x0 + (x1 - x0) * 0.2, ey = sy + 40; const eg = c.createRadialGradient(ex - 6, ey - 6, 2, ex, ey, 20); eg.addColorStop(0, '#9fd3ff'); eg.addColorStop(0.7, '#2a6fb5'); eg.addColorStop(1, '#123a6a');
        c.fillStyle = eg; c.beginPath(); c.arc(ex, ey, 20, 0, TAU); c.fill(); c.fillStyle = 'rgba(80,150,70,.8)'; c.beginPath(); c.ellipse(ex - 4, ey + 2, 8, 5, 0.5, 0, TAU); c.fill();
      } else {
        c.fillStyle = '#9cc58a'; c.beginPath(); c.moveTo(x0, gy); for (let x = x0; x <= x1; x += 6) c.lineTo(x, gy - 26 - 16 * Math.sin((x - x0) * 0.02) - 8 * Math.sin((x - x0) * 0.05)); c.lineTo(x1, gy); c.fill();
        c.fillStyle = 'rgba(255,255,255,.9)'; [[0.72, 0.18], [0.3, 0.3]].forEach(([u, v], i) => { const cx = x0 + (x1 - x0) * u + Math.sin(t * 0.2 + i) * 8, cy = sy + (gy - sy) * v; [[0, 0, 13], [13, -5, 11], [24, 2, 9], [-11, 3, 9]].forEach(([dx, dy, r]) => { c.beginPath(); c.arc(cx + dx, cy + dy, r, 0, TAU); c.fill(); }); });
      }
      const gg = c.createLinearGradient(0, gy, 0, gy + 40);
      if (moon) { gg.addColorStop(0, '#a3a39e'); gg.addColorStop(1, '#5e5e5a'); } else { gg.addColorStop(0, '#5f9a45'); gg.addColorStop(0.18, '#4c7f37'); gg.addColorStop(0.2, '#8a6440'); gg.addColorStop(1, '#5d4128'); }
      c.fillStyle = gg; c.fillRect(x0, gy, x1 - x0, 40);
      if (moon) { c.fillStyle = 'rgba(50,50,48,.45)'; [[0.15, 12, 9], [0.48, 22, 6], [0.82, 14, 8]].forEach(([u, dy, r]) => { c.beginPath(); c.ellipse(x0 + (x1 - x0) * u, gy + dy, r * 1.8, r * 0.55, 0, 0, TAU); c.fill(); }); }
      else { c.strokeStyle = '#3f7d36'; c.lineWidth = 2; for (let x = x0 + 4; x < x1; x += 9) { c.beginPath(); c.moveTo(x, gy + 2); c.lineTo(x + 2 + Math.sin(t * 2 + x) * 1.5, gy - 6); c.stroke(); } }
      c.restore();
      // 받침대(추 자리)
      const st = s.stool;
      c.fillStyle = '#a77b4f'; c.fillRect(st.x - 40, st.y, 80, 12); c.fillStyle = '#7d5634'; c.fillRect(st.x - 34, st.y + 12, 8, gy - st.y - 12); c.fillRect(st.x + 26, st.y + 12, 8, gy - st.y - 12);
      // 저울 몸통과 눈금판
      const bx = s.sx, top = s.panY + 14 + needle * 0.9, by = gy;
      const body = c.createLinearGradient(bx - 70, 0, bx + 70, 0); body.addColorStop(0, '#c9d2dc'); body.addColorStop(0.45, '#f4f7fa'); body.addColorStop(1, '#9aa6b3');
      c.fillStyle = '#56606c'; c.fillRect(bx - 8, s.panY + 4 + needle * 0.9, 16, 24);
      c.fillStyle = body; c.strokeStyle = '#3b4552'; c.lineWidth = 2; c.beginPath(); c.roundRect(bx - 72, s.panY + 24, 144, by - s.panY - 24, 12); c.fill(); c.stroke();
      const dx = bx, dy = s.panY + 24 + (by - s.panY - 24) * 0.5, dr = 58;
      c.fillStyle = '#fffef8'; c.beginPath(); c.arc(dx, dy, dr, 0, TAU); c.fill(); c.strokeStyle = '#3b4552'; c.lineWidth = 3; c.stroke();
      for (let v = 0; v <= 10; v += 0.5) {
        const a = -Math.PI / 2 + v / 10 * TAU * 0.83, big = v % 2 === 0, r0 = dr - (big ? 12 : 6);
        c.strokeStyle = '#1d2433'; c.lineWidth = big ? 2.4 : 1.2; c.beginPath(); c.moveTo(dx + Math.cos(a) * r0, dy + Math.sin(a) * r0); c.lineTo(dx + Math.cos(a) * (dr - 2), dy + Math.sin(a) * (dr - 2)); c.stroke();
        if (big) P.txt(c, String(v), dx + Math.cos(a) * (dr - 22), dy + Math.sin(a) * (dr - 22) + 5, '#1d2433', '700 14px');
      }
      P.txt(c, 'N', dx + 15, dy + 18, '#c0392b', '800 14px');
      const na = -Math.PI / 2 + Math.max(0, needle) / 10 * TAU * 0.83;
      c.strokeStyle = '#c0392b'; c.lineWidth = 3.5; c.lineCap = 'round'; c.beginPath(); c.moveTo(dx - Math.cos(na) * 8, dy - Math.sin(na) * 8); c.lineTo(dx + Math.cos(na) * (dr - 9), dy + Math.sin(na) * (dr - 9)); c.stroke();
      c.fillStyle = '#1d2433'; c.beginPath(); c.arc(dx, dy, 5, 0, TAU); c.fill();
      // 접시
      const pg = c.createLinearGradient(0, top - 10, 0, top); pg.addColorStop(0, '#eef2f6'); pg.addColorStop(1, '#8e9aa7');
      c.fillStyle = pg; c.beginPath(); c.ellipse(bx, top - 4, 66, 10, 0, 0, TAU); c.fill(); c.strokeStyle = '#3b4552'; c.lineWidth = 2; c.stroke();
      if (!onPan && !(drag && drag.k === 'w')) { const a = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 4)); c.strokeStyle = `rgba(230,160,0,${a})`; c.lineWidth = 3; c.setLineDash([7, 6]); c.beginPath(); c.ellipse(bx, top - 30, 56, 34, 0, 0, TAU); c.stroke(); c.setLineDash([]); P.txt(c, '여기에 추', bx, top - 72, '#b06d00', '800 18px'); }
      // 1 kg 추
      const [wx, wy] = weightPos(l);
      c.save(); c.translate(wx, wy);
      const wg = c.createLinearGradient(-30, 0, 30, 0); wg.addColorStop(0, '#3c4049'); wg.addColorStop(0.4, '#8d939e'); wg.addColorStop(1, '#2c3038');
      c.fillStyle = wg; c.beginPath(); c.moveTo(-30, 0); c.lineTo(30, 0); c.lineTo(24, -40); c.lineTo(-24, -40); c.closePath(); c.fill();
      c.fillStyle = '#5c626c'; c.fillRect(-12, -48, 24, 9); c.strokeStyle = '#4a4f58'; c.lineWidth = 5; c.beginPath(); c.arc(0, -54, 9, Math.PI, TAU); c.stroke();
      P.txt(c, '1 kg', 0, -12, '#fff', '800 17px'); c.restore();
      if (!onPan && !(drag && drag.k === 'w')) { const b = Math.sin(t * 4) * 5; c.fillStyle = 'rgba(255,210,63,.95)'; c.beginPath(); c.moveTo(wx + 34, wy - 66 + b); c.lineTo(wx + 54, wy - 72 + b); c.lineTo(wx + 48, wy - 54 + b); c.fill(); }
      // 읽은 값
      const bw = (p.w - 42) / 2, ry = s.box.y;
      [['무게(저울 눈금)', onPan ? `${G[place].toFixed(1)} N` : '0 N', '#c0392b'], ['질량', '1 kg', '#1f5f4a']].forEach(([a, b, col], i) => {
        const x = p.x + 14 + i * (bw + 14);
        c.fillStyle = '#fff'; c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.roundRect(x, ry, bw, 98, 10); c.fill(); c.stroke();
        P.txt(c, a, x + bw / 2, ry + 30, '#1d2433', '700 18px'); P.txt(c, b, x + bw / 2, ry + 76, col, '800 36px');
      });
      P.txt(c, moon ? '달: 지구의 약 1/6로 당긴다' : '지구 표면: 1 kg마다 약 9.8 N', p.x + p.w / 2, ry + 136, '#46505e', '700 18px');
    }

    function draw(c, W, H, dt) {
      const l = L(), { cx, cy, R } = l;
      if (dt) step(dt, l);
      // 우주 배경과 별
      const bg = c.createRadialGradient(cx, cy, R, cx, cy, W * 0.9); bg.addColorStop(0, '#111a33'); bg.addColorStop(1, '#03050c'); c.fillStyle = bg; c.fillRect(0, 0, W, H);
      if (!stars || stars.W !== W) stars = { W, s: Array.from({ length: 140 }, (_, i) => [((i * 7919) % 1000) / 1000 * W, ((i * 104729) % 997) / 997 * H, 0.6 + (i % 3) * 0.6, i]) };
      stars.s.forEach(([x, y, r, i]) => { c.fillStyle = `rgba(255,255,255,${0.35 + 0.35 * Math.sin(t * 1.5 + i * 1.7)})`; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); });
      // 지구
      const n = Math.min(560, Math.round(R * 2 * Math.min(1.5, window.devicePixelRatio || 1)));
      if (n !== earthKey) { earthImg = bakeEarth(n); earthKey = n; }
      P.glow(c, cx, cy, R * 1.12, 'rgba(110,170,255,.45)', 'rgba(110,170,255,0)');
      c.drawImage(earthImg.base, cx - R, cy - R, R * 2, R * 2);
      c.save(); c.translate(cx, cy); c.rotate(t * 0.012); c.drawImage(earthImg.cloud, -R, -R, R * 2, R * 2); c.restore();
      c.drawImage(earthImg.shade, cx - R, cy - R, R * 2, R * 2);
      c.strokeStyle = 'rgba(150,200,255,.55)'; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, R + 1, 0, TAU); c.stroke();
      // 중력 화살표와 중심선
      const any = objs.length || (drag && drag.k !== 'w' && hover);
      if (any) {
        c.save(); c.setLineDash([6, 7]); c.lineDashOffset = -t * 20; c.strokeStyle = 'rgba(255,255,255,.4)'; c.lineWidth = 1.5;
        objs.forEach((o) => { c.beginPath(); c.moveTo(cx + Math.cos(o.th) * R * o.r, cy + Math.sin(o.th) * R * o.r); c.lineTo(cx, cy); c.stroke(); });
        c.restore();
      }
      objs.forEach((o) => {
        const cr = R * o.r + SZ(o.k, R) * (o.k === 'person' ? 0.5 : 1), x = cx + Math.cos(o.th) * cr, y = cy + Math.sin(o.th) * cr, len = R * 0.42 * o.grow;
        arrow(c, x, y, x - Math.cos(o.th) * len, y - Math.sin(o.th) * len, '#ff5a3c', 7);
      });
      if (any) { c.fillStyle = '#ffd23f'; c.beginPath(); c.arc(cx, cy, 7, 0, TAU); c.fill(); c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.stroke(); label(c, '지구 중심', cx, cy + 32, '#ffd23f', '800 21px'); }
      objs.forEach((o, i) => { if (drag && drag.o === o) return; drawThing(c, o.k, cx + Math.cos(o.th) * R * o.r, cy + Math.sin(o.th) * R * o.r, o.th + Math.PI / 2, R, i, o.k === 'person' ? Math.sin(t * 3 + i) * R * 0.012 : 0); });
      if (last && last.grow > 0.5) { const cr = R * last.r + SZ(last.k, R) * (last.k === 'person' ? 0.5 : 1), x = cx + Math.cos(last.th) * (cr - R * 0.3), y = cy + Math.sin(last.th) * (cr - R * 0.3); label(c, '중력', x + Math.sin(last.th) * 34, y - Math.cos(last.th) * 34, '#ffb4a3', '800 20px'); }
      // 받침
      const tr = l.tray;
      c.fillStyle = 'rgba(255,255,255,.1)'; c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2; c.setLineDash([8, 6]); c.beginPath(); c.roundRect(tr.x, tr.y, tr.w, tr.h, 14); c.fill(); c.stroke(); c.setLineDash([]);
      KINDS.forEach((k, i) => {
        const x = tr.x + tr.w * (i + 0.5) / 3, b = !objs.length && !drag ? Math.sin(t * 4 + i) * 3 : 0;
        drawThing(c, k, x, tr.y + 62 + b, 0, k === 'person' ? R * 0.9 : R * 1.6, i, 0);
        P.txt(c, NAME[k], x, tr.y + 86, '#e8eefc', '700 18px');
      });
      // 끄는 중인 물체
      if (drag && drag.k !== 'w') {
        if (hover) {
          const gx = cx + Math.cos(hover.th) * R, gy = cy + Math.sin(hover.th) * R;
          c.strokeStyle = 'rgba(255,210,63,.85)'; c.lineWidth = 3; c.beginPath(); c.arc(gx, gy, 14 + Math.sin(t * 8) * 3, 0, TAU); c.stroke();
        }
        const rot = hover ? hover.th + Math.PI / 2 : 0;
        drawThing(c, drag.kind, drag.x, drag.y + (drag.kind === 'person' ? SZ('person', R) * 0.5 : SZ(drag.kind, R)), rot, R, objs.length, 0);
      }
      drawScale(c, l);
      uiT += dt; if (uiT > 0.3 || !dt) { uiT = 0; steps(); }
    }
    function step(dt, l) {
      t += dt;
      const g = 2.4; // 화면용 낙하 가속도(R/s²)
      objs.forEach((o) => {
        o.grow = Math.min(1, o.grow + dt * 1.6);
        const rest = restR(o, l.R);
        if (o.r > rest + 1e-4) { o.vr += g * dt; o.r = Math.max(rest, o.r - o.vr * dt); if (o.r === rest) o.vr = 0; }
      });
      const target = onPan ? G[place] : 0; wobble = Math.max(0, wobble - dt * 0.6);
      needle += (target - needle) * Math.min(1, dt * 6) + Math.sin(t * 18) * wobble * 0.08;
    }

    // ── 손 조작 ──
    const pol = (p, l) => ({ d: Math.hypot(p.x - l.cx, p.y - l.cy), th: Math.atan2(p.y - l.cy, p.x - l.cx) });
    const S = P.make(stage, {
      draw,
      down(p) {
        const l = L(), s = scaleL(l), tr = l.tray;
        const tile = s.tiles.find((q) => p.x > q.x && p.x < q.x + q.w && p.y > q.y && p.y < q.y + q.h); if (tile) { setGround(tile.k); return; }
        const [wx, wy] = weightPos(l); if (Math.abs(p.x - wx) < 44 && p.y > wy - 70 && p.y < wy + 14) { drag = { k: 'w', x: p.x, y: p.y + 20 }; return; }
        if (p.x > tr.x && p.x < tr.x + tr.w && p.y > tr.y - 20 && p.y < tr.y + tr.h) { drag = { k: 'o', kind: KINDS[Math.min(2, Math.floor((p.x - tr.x) / tr.w * 3))], x: p.x, y: p.y }; return; }
        let best = null, bd = 30;
        objs.forEach((o) => { const cr = l.R * o.r + (o.k === 'person' ? SZ('person', l.R) * 0.5 : SZ(o.k, l.R)), d = Math.hypot(p.x - (l.cx + Math.cos(o.th) * cr), p.y - (l.cy + Math.sin(o.th) * cr)); if (d < bd) { bd = d; best = o; } });
        if (best) { objs = objs.filter((o) => o !== best); drag = { k: 'o', kind: best.k, x: p.x, y: p.y }; }
      },
      move(p, e, held) {
        if (!held || !drag) return;
        drag.x = p.x; drag.y = p.y + (drag.k === 'w' ? 20 : 0);
        if (drag.k === 'o') { const l = L(), q = pol(p, l); hover = q.d < l.R * 1.9 && p.x < l.pan.x ? q : null; }
      },
      up(p) {
        if (!drag) return;
        const l = L();
        if (drag.k === 'w') { const s = scaleL(l); weigh(Math.abs(p.x - s.sx) < 95 && p.y > s.panY - 110 && p.y < s.gy); }
        else {
          const q = pol(p, l);
          if (q.d < l.R * 1.9 && p.x < l.pan.x) addObj(drag.kind, q.th, q.d / l.R);
          else say(`${NAME[drag.kind]}을 지구 가까이에 놓아야 한다. 지구 둘레 아무 곳이나 괜찮다.`);
        }
        drag = null; hover = null; steps();
      },
      key(e) {
        const k = e.key.toLowerCase(), auto = () => -Math.PI / 2 + objs.length * 2.2;
        if (k === 'p') { addObj('person', auto()); return true; }
        if (k === 'a') { addObj('apple', auto(), 1.6); return true; }
        if (k === 'w') { addObj('drop', auto(), 1.6); return true; }
        if (k === 's') { weigh(!onPan); return true; }
        if (k === 'm') { setGround(place === 'earth' ? 'moon' : 'earth'); return true; }
        if (k === '0') { reset(); steps(); return true; }
        return false;
      },
    });
    root.querySelector('.gr-reset').addEventListener('click', () => { reset(); steps(); S.kick(); });
    steps();
    const go = (sec) => { const l = L(); for (let k = 0; k < sec * 30; k++) step(1 / 30, l); steps(); S.kick(); };
    root._gr = {
      place: (k, deg, r) => { addObj(k, deg * Math.PI / 180, r || 1.5); go(1.5); return root._gr.state(); },
      weigh: (on) => { weigh(on !== false); go(1.5); return root._gr.state(); },
      ground: (k) => { setGround(k); go(1.5); return root._gr.state(); },
      state: () => ({ n: objs.length, spots: spots(objs.map((q) => q.th)), landed: objs.every((o) => o.r <= restR(o, L().R) + 1e-3), onPan, place, reading: +needle.toFixed(2), seen: { ...seen }, done: root.classList.contains('u-done') }),
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Grav = { mount };
})();
