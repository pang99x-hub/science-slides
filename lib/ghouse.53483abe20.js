/* 온실 효과(교과서 82쪽 그림 Ⅱ-10): 지구 단면 캔버스. 위 = 우주, 가운데 = 대기, 아래 = 지표.
   햇빛 알갱이(노랑)는 분자를 지나쳐 지표에 닿아 흡수된다(지표 열 H += 1). 지표는 H에 비례해 지구 복사 알갱이(빨강 물결)를 위로 낸다.
   부품함의 기체 카드를 하늘에 놓으면 분자 4개가 떠다닌다. 온실 기체(이산화 탄소·수증기·메테인)는 지구 복사 알갱이를 붙잡아 흔들리다
   아무 방향으로 다시 내고, 질소·산소는 그냥 지나가게 둔다. 지표로 돌아온 알갱이는 다시 H가 된다 → H(온도계)가 새 평형으로 오른다.
   알갱이 수·분자 수·흡수 확률은 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const GAS = {
    co2: { gh: true, name: '이산화 탄소', atoms: [[0, 0, 9, '#2b2f38'], [-15, 0, 8, '#d9483b'], [15, 0, 8, '#d9483b']] },
    h2o: { gh: true, name: '수증기', atoms: [[0, 0, 9, '#d9483b'], [-11, 8, 6, '#f2f4f7'], [11, 8, 6, '#f2f4f7']] },
    ch4: { gh: true, name: '메테인', atoms: [[0, 0, 9, '#2b2f38'], [-11, -9, 6, '#f2f4f7'], [11, -9, 6, '#f2f4f7'], [-11, 9, 6, '#f2f4f7'], [11, 9, 6, '#f2f4f7']] },
    n2: { gh: false, name: '질소', atoms: [[-7, 0, 9, '#3a78c2'], [7, 0, 9, '#3a78c2']] },
    o2: { gh: false, name: '산소', atoms: [[-7, 0, 9, '#e27a6f'], [7, 0, 9, '#e27a6f']] },
  };
  const SUN = 9, K = 0.32, MAXM = 44;   // 초당 햇빛 알갱이, 지표 방출 비율(H당 초당), 분자 최대 수

  function mount(root) {
    const stage = root.querySelector('.gh-stage'), cv = stage.querySelector('canvas');
    const now = stage.querySelector('.gh-now');
    const tw = root.querySelector('.gh-tw'), outN = root.querySelector('.gh-out'), backN = root.querySelector('.gh-back'), msg = root.querySelector('.gh-msg');
    const thermo = root.querySelector('.gh-thermo');
    let g = window.Stage.fit(cv);
    const mols = [], ph = []; root._ghProgress={nitrogen:false,greenhouse:false,returned:false};
    let H = SUN / K, Hs = H, emitAcc = 0, sunAcc = 0, tm = 0;
    const H0 = SUN / K;
    const win = { out: [], back: [] };   // 최근 4초 동안의 수
    const geo = () => { const { w, h } = g; return { w, h, top: h * 0.13, gnd: h * 0.84 }; };

    // 온도계(SVG): 대기가 없을 때 눈금을 표시
    const NS = 'http://www.w3.org/2000/svg';
    const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); (p || thermo).appendChild(e); return e; };
    el('rect', { x: 42, y: 14, width: 36, height: 250, rx: 18, class: 'gh-tube' });
    const merc = el('rect', { x: 50, y: 200, width: 20, height: 80, rx: 10, class: 'gh-merc' });
    el('circle', { cx: 60, cy: 290, r: 30, class: 'gh-bulb' });
    const baseY = 214;
    el('line', { x1: 30, x2: 90, y1: baseY, y2: baseY, class: 'gh-base' });
    const level = (hv) => clamp(baseY - (hv / H0 - 1) * 320, 30, 262);

    function add(k, x, y, n = 4) { root._ghProgress[k==='n2'?'nitrogen':GAS[k].gh?'greenhouse':'oxygen']=true;
      const { w, top, gnd } = geo();
      for (let i = 0; i < n && mols.length < MAXM; i++) {
        mols.push({ k, x: clamp(x + (Math.random() - 0.5) * 300, 20, w - 20), y: clamp(y + (Math.random() - 0.5) * 90, top + 30, gnd - 40),
          vx: (Math.random() - 0.5) * 30, vy: (Math.random() - 0.5) * 20, a: Math.random() * 6, ex: 0, hold: null });
      }
      status();
    }
    function clear() { mols.length = 0; ph.length = 0; H=SUN/K;Hs=H;win.out.length=0;win.back.length=0;status();read(); }
    function status() {
      const gh = mols.filter((m) => GAS[m.k].gh).length, other = mols.length - gh;
      now.textContent = !mols.length ? '대기가 없는 지구 · 기체 카드를 하늘로 끌어 놓자'
        : !gh ? '질소·산소는 지구 복사를 그냥 보낸다 · 다른 기체도 놓아 보자'
        : `온실 기체 분자 ${gh}개${other ? ` · 다른 기체 ${other}개` : ''}`;
      now.classList.toggle('done', gh > 0);
    }

    function emit(x, y, ang, kind, src) { ph.push({ x, y, vx: Math.cos(ang) * 230, vy: Math.sin(ang) * 230, kind, t: 0, src }); }
    function step(dt) {
      const { w, top, gnd } = geo();
      tm += dt;
      // 햇빛
      sunAcc += SUN * dt;
      while (sunAcc >= 1) { sunAcc -= 1; const x = w * (0.08 + Math.random() * 0.84); ph.push({ x: x - 60, y: 0, vx: 50, vy: 260, kind: 'sw', t: 0 }); }
      // 지표 방출
      emitAcc += K * H * dt;
      while (emitAcc >= 1 && H >= 1) { emitAcc -= 1; H -= 1; emit(w * (0.04 + Math.random() * 0.92), gnd - 2, -Math.PI / 2 + (Math.random() - 0.5) * 1.6, 'lw'); }
      // 분자
      mols.forEach((m) => {
        m.x += m.vx * dt; m.y += m.vy * dt; m.a += dt;
        if (m.x < 20 || m.x > w - 20) m.vx *= -1;
        if (m.y < top + 26 || m.y > gnd - 34) m.vy *= -1;
        m.x = clamp(m.x, 20, w - 20); m.y = clamp(m.y, top + 26, gnd - 34);
        if (m.ex > 0) { m.ex -= dt; if (m.ex <= 0 && m.hold) { emit(m.x, m.y, Math.random() * Math.PI * 2, 'lw', m); m.hold = null; } }
      });
      // 알갱이
      for (let i = ph.length - 1; i >= 0; i--) {
        const p = ph[i]; p.x += p.vx * dt; p.y += p.vy * dt; p.t += dt;
        let gone = false;
        if (p.kind === 'lw') {
          for (const m of mols) {
            if (!GAS[m.k].gh || m.hold || m === p.src || p.t < 0.05) continue;
            if (Math.hypot(m.x - p.x, m.y - p.y) < 50) { m.hold = p; m.ex = 0.2; gone = true; break; }
          }
          if (!gone && p.y < top) { gone = true; win.out.push(tm); }
          if (!gone && p.y > gnd) { gone = true; H += 1; win.back.push(tm); }
        } else if (p.y > gnd) { gone = true; H += 1; }
        if (p.kind === 'lw') { if (p.x < 0) p.x += w; else if (p.x > w) p.x -= w; }
        if (!gone && (p.x < -80 || p.x > w + 80 || p.y < -40)) gone = true;
        if (gone) ph.splice(i, 1);
      }
      ['out', 'back'].forEach((k) => { while (win[k].length && win[k][0] < tm - 4) win[k].shift(); });
      Hs += (H - Hs) * Math.min(1, dt * 1.2);
      read();
    }
    let lastRead = 0;
    function read() {
      if (tm - lastRead < 0.25) return; lastRead = tm;
      merc.setAttribute('y', level(Hs).toFixed(1)); merc.setAttribute('height', (290 - level(Hs)).toFixed(1));
      const r = Hs / H0;
      tw.textContent = r < 1.05 ? '대기가 없을 때와 비슷' : r < 1.2 ? '조금 높아졌다' : r < 1.4 ? '꽤 높아졌다' : '많이 높아졌다';
      if(win.back.length>0)root._ghProgress.returned=true; outN.textContent = `4초에 ${win.out.length}`; backN.textContent = `4초에 ${win.back.length}`;
      const gh = mols.some((m) => GAS[m.k].gh);
      msg.textContent = !gh ? '지표가 낸 지구 복사가 모두 우주로 빠져나간다. 받은 만큼 내보내며 낮은 온도에서 평형.'
        : '온실 기체가 붙잡은 지구 복사의 일부가 지표로 돌아온다 → 지표가 더 데워진 뒤 새 평형에서 멈춘다.';
    }
    function draw() {
      const { w, h, top, gnd } = geo(), c = g.ctx;
      c.clearRect(0, 0, w, h);
      // 우주·대기·지표
      c.fillStyle = '#1c2744'; c.fillRect(0, 0, w, top);
      const sky = c.createLinearGradient(0, top, 0, gnd); sky.addColorStop(0, '#9fcbe6'); sky.addColorStop(1, '#e3f1f8');
      c.fillStyle = mols.length ? sky : '#e9eef1'; c.fillRect(0, top, w, gnd - top);
      if (!mols.length) { c.fillStyle = '#c3cecd'; c.font = '600 22px "IBM Plex Sans KR", sans-serif'; c.textAlign = 'center'; c.fillText('대기 없음', w / 2, (top + gnd) / 2); }
      const heat = clamp((Hs / H0 - 1) / 0.5, 0, 1);
      const gg = c.createLinearGradient(0, gnd, 0, h);
      gg.addColorStop(0, `rgb(${Math.round(120 + 110 * heat)},${Math.round(150 - 40 * heat)},${Math.round(90 - 30 * heat)})`); gg.addColorStop(1, '#6b5a43');
      c.fillStyle = gg; c.fillRect(0, gnd, w, h - gnd);
      c.strokeStyle = '#1d2433'; c.lineWidth = 3; c.beginPath(); c.moveTo(0, gnd); c.lineTo(w, gnd); c.stroke();
      window.Stage.label(c, '우주', w / 2, top - 16, '700 20px "IBM Plex Sans KR", sans-serif');
      window.Stage.label(c, '지표', 50, gnd + 34, '700 20px "IBM Plex Sans KR", sans-serif');
      // 해
      c.fillStyle = '#ffcf3a'; c.beginPath(); c.arc(w - 60, top / 2, 26, 0, 7); c.fill(); c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.stroke();
      // 분자
      mols.forEach((m) => {
        const jig = m.ex > 0 ? Math.sin(tm * 60) * 4 : 0;
        c.save(); c.translate(m.x + jig, m.y); c.rotate(Math.sin(m.a) * 0.6);
        if (m.ex > 0) { c.fillStyle = 'rgba(230,80,60,.25)'; c.beginPath(); c.arc(0, 0, 26, 0, 7); c.fill(); }
        GAS[m.k].atoms.forEach(([x, y, r, col]) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.stroke(); });
        c.restore();
      });
      // 알갱이
      ph.forEach((p) => {
        if (p.kind === 'sw') {
          c.strokeStyle = '#e8a10f'; c.lineWidth = 4; c.lineCap = 'round';
          c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(p.x - p.vx * 0.06, p.y - p.vy * 0.06); c.stroke();
        } else {
          const a = Math.atan2(p.vy, p.vx), L = 26;
          c.save(); c.translate(p.x, p.y); c.rotate(a);
          c.strokeStyle = '#d9483b'; c.lineWidth = 3.5; c.beginPath();
          for (let s = 0; s <= L; s += 2) { const yy = Math.sin(s / 3 + p.t * 30) * 4; s ? c.lineTo(-s, yy) : c.moveTo(-s, yy); }
          c.stroke(); c.restore();
        }
      });
    }

    // 끌어 놓기: 마지막 손가락 자리에 분자를 놓는다
    const cards = [...root.querySelectorAll('.gh-card')];
    let lastPt = null;
    cards.forEach((c) => c.addEventListener('pointermove', (e) => { lastPt = { x: e.clientX, y: e.clientY }; }));
    const toLocal = (pt) => { const r = cv.getBoundingClientRect(); return { x: (pt.x - r.left) / r.width * g.w, y: (pt.y - r.top) / r.height * g.h }; };
    const dragger = window.Drag.cards(cards, {
      find: (el) => (el.closest('.gh-stage') ? stage : null),
      hover: (t) => stage.classList.toggle('target', !!t),
      pick: (c) => stage.classList.toggle('picking', !!c),
      drop: (c, t) => { if (t && lastPt) { const p = toLocal(lastPt); add(c.dataset.k, p.x, p.y); } },
    });
    cv.addEventListener('click', (e) => {
      const c = dragger.picked; if (!c) return;
      const p = toLocal({ x: e.clientX, y: e.clientY }); add(c.dataset.k, p.x, p.y); dragger.unpick();
    });
    cv.addEventListener('keydown', (e) => { const c = dragger.picked; if (c && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); e.stopPropagation(); add(c.dataset.k, g.w / 2, g.h / 2); dragger.unpick(); } });
    root.querySelector('.gh-clear').addEventListener('click', clear);

    const loop = window.Stage.loop((dt) => { step(dt); draw(); });
    status(); read();
    root._gh = { add: (k, n = 4) => { const { w, top, gnd } = geo(); add(k, w * (0.2 + Math.random() * 0.6), (top + gnd) / 2, n); }, clear, get H() { return Hs; } };
    return {
      setActive(on) { if (on) { g = window.Stage.fit(cv); if (window.Stage.reduce) { for (let i = 0; i < 400; i++) step(0.05); draw(); } else loop.start(); } else loop.stop(); },
      fit() { g = window.Stage.fit(cv); draw(); },
    };
  }
  window.GreenHouse = { mount };
})();
