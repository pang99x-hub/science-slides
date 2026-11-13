/* 2-1 1차시 체험 «가상 분광기»(교과서 50쪽 탐구). 위 선반에 광원 넷(백열등·수소 방전관·헬륨 방전관·나트륨 전등)이 빛난다.
   손에 든 분광기(동그란 렌즈)를 끌어 광원 위에 대면 오른쪽 창에 그 빛의 띠가 바로 보이고, 1초쯤 대고 있으면 찰칵 찍혀 아래 사진첩에 쌓인다.
   사진첩의 띠를 끌어 맨 아래 «어느 별의 스펙트럼» 위에 놓으면 자리가 같은 선에 ✓. 별의 검은 선 = 수소·헬륨의 밝은 선 자리.
   Scope.mount(root) → { fit, setActive } · 시험용: root._sc.shoot(k) · pick(k) */
(function () {
  'use strict';
  const SRC = [['lamp', '백열등'], ['H', '수소 방전관'], ['He', '헬륨 방전관'], ['Na', '나트륨 전등']];
  const NM = Object.fromEntries(SRC);
  function mount(root) {
    const stage = root.querySelector('.sc-stage'), now = root.querySelector('.sc-now'), msg = root.querySelector('.sc-msg');
    const P = window.Play, Sp = () => window.Spec;
    const STAR = () => [...Sp().LINES.H, ...Sp().LINES.He];
    const lines = (k) => (k === 'lamp' ? [] : Sp().LINES[k]);
    let grab = null, lens = null, aim = null, dwell = 0, shots = [], pick = null, dragStrip = null, flash = 0; const cmp = new Set();
    const G = (W, H) => ({ shelf: (i) => [W * (0.08 + i * 0.13), H * 0.15], vx: W * 0.6, vw: W * 0.37, vy: H * 0.06, vh: H * 0.2, fy: H * 0.4, fh: H * 0.075, fg: H * 0.022, bx: W * 0.17, bw: W * 0.8, oy: H * 0.78, sy: H * 0.88, sh: H * 0.09 });
    function say(h, cls = '') { if (msg.innerHTML !== h) { msg.innerHTML = h; msg.className = 'u-msg sc-msg ' + cls; } }
    function steps() {
      const ok = []; if (shots.includes('lamp')) ok.push(1); if (shots.includes('H') && shots.includes('He')) ok.push(2); if (cmp.has('H') && cmp.has('He')) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 분광기(동그란 렌즈)를 끌어 백열등에 대고 기다리자' : st === 2 ? '② 수소·헬륨 방전관도 찍자' : st === 3 ? '③ 찍은 띠를 끌어 맨 아래 별 스펙트럼 위에 놓자' : '별의 대기에 수소와 헬륨이 있다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    function compare(k) {
      pick = k; if (k !== 'lamp') cmp.add(k);
      const ls = lines(k), hit = ls.filter(([nm]) => STAR().some(([s]) => Math.abs(s - nm) < 0.6)).length;
      if (k === 'lamp') say('백열등에는 선이 없어 견줄 수 없다 — 방전관의 띠를 대 보자', 'no');
      else if (hit === ls.length) say(`${NM[k]}의 밝은 선 ${ls.length}개가 모두 별의 검은 선과 같은 자리 → 별의 대기에 <b>${Sp().NAME[k]}</b>`, 'ok');
      else say(`${NM[k]}의 선은 별의 검은 선과 자리가 다르다 → 이 별 대기의 주성분은 아니다`, 'no');
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        const g = G(W, H);
        c.fillStyle = '#eef0ea'; c.fillRect(0, 0, W, H);
        // 선반과 광원
        c.fillStyle = '#c9b48a'; c.fillRect(10, H * 0.24, W * 0.53, 10);
        SRC.forEach(([k, n], i) => {
          const [x, y] = g.shelf(i);
          if (k === 'lamp') { P.glow(c, x, y, 46, 'rgba(255,240,180,1)', 'rgba(255,240,180,0)'); c.fillStyle = '#ffe48a'; c.beginPath(); c.arc(x, y, 18, 0, Math.PI * 2); c.fill(); }
          else { const col = Sp().rgb(lines(k)[lines(k).length - 1][0]); P.glow(c, x, y, 44, col.replace('rgb', 'rgba').replace(')', ',.7)')); c.fillStyle = col; c.fillRect(x - 9, y - 30, 18, 60); }
          P.txt(c, n, x, H * 0.24 + 30, '#1d2433', '700 18px');
        });
        // 분광기 창
        c.fillStyle = '#1d2433'; c.fillRect(g.vx - 10, g.vy - 4, g.vw + 20, g.vh + 46);
        P.txt(c, aim ? `분광기로 본 ${NM[aim]}` : '분광기를 광원에 대 보자', g.vx + g.vw / 2, g.vy + g.vh + 32, '#ffd84d', '700 19px');
        if (aim) Sp().band(c, g.vx, g.vy, g.vw, g.vh, { mode: aim === 'lamp' ? 'cont' : 'emit', lines: lines(aim) }); else { c.fillStyle = '#05060a'; c.fillRect(g.vx, g.vy, g.vw, g.vh); }
        if (aim && !shots.includes(aim)) { dwell += dt; c.strokeStyle = '#ffd84d'; c.lineWidth = 5; c.beginPath(); c.arc(lens.x, lens.y, 38, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.min(1, dwell / 0.9)); c.stroke(); if (dwell > 0.9) { shots.push(aim); flash = 0.7; say(aim === 'lamp' ? '찰칵 — 백열등: 모든 색이 이어진 연속 스펙트럼' : `찰칵 — ${NM[aim]}: 검은 바탕에 밝은 선 ${lines(aim).length}개(방출 스펙트럼)`); } } else dwell = 0;
        // 사진첩
        P.txt(c, '찍은 띠 — 끌어서 별 위에 놓기', 14, g.fy - 10, '#4a5468', '700 19px', 'left');
        shots.forEach((k, i) => {
          if (dragStrip && dragStrip.k === k) return;
          const y = g.fy + i * (g.fh + g.fg); P.txt(c, NM[k], g.bx - 10, y + g.fh * 0.7, '#1d2433', '700 18px', 'right');
          Sp().band(c, g.bx, y, g.bw, g.fh, { mode: k === 'lamp' ? 'cont' : 'emit', lines: lines(k) }); c.strokeStyle = k === pick ? '#f2b21c' : '#1d2433'; c.lineWidth = k === pick ? 4 : 2; c.strokeRect(g.bx, y, g.bw, g.fh);
        });
        // 별 + 견주기
        P.txt(c, '어느 별의', g.bx - 10, g.sy + g.sh * 0.45, '#1d2433', '800 19px', 'right'); P.txt(c, '스펙트럼', g.bx - 10, g.sy + g.sh * 0.95, '#1d2433', '800 19px', 'right');
        Sp().band(c, g.bx, g.sy, g.bw, g.sh, { mode: 'abs', lines: STAR() }); c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.strokeRect(g.bx, g.sy, g.bw, g.sh);
        const ov = dragStrip ? dragStrip.k : pick;
        if (ov) {
          const oy = dragStrip ? dragStrip.y : g.oy;
          Sp().band(c, g.bx, oy, g.bw, g.fh, { mode: ov === 'lamp' ? 'cont' : 'emit', lines: lines(ov) }); c.strokeStyle = '#f2b21c'; c.lineWidth = 4; c.strokeRect(g.bx, oy, g.bw, g.fh);
          if (!dragStrip) lines(ov).forEach(([nm]) => { const x = Sp().xOf(nm, g.bx, g.bw), hit = STAR().some(([s]) => Math.abs(s - nm) < 0.6); c.setLineDash([5, 5]); c.strokeStyle = hit ? '#2f9e5b' : '#d9483b'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, oy + g.fh); c.lineTo(x, g.sy + g.sh); c.stroke(); c.setLineDash([]); P.txt(c, hit ? '✓' : '✗', x, oy - 4, hit ? '#2f9e5b' : '#d9483b', '800 24px'); });
        }
        // 분광기(렌즈)
        const L0 = lens || { x: W * 0.54, y: H * 0.3 };
        c.fillStyle = '#4a5468'; c.fillRect(L0.x + 24, L0.y + 18, 70, 18);
        c.fillStyle = 'rgba(200,230,255,.35)'; c.strokeStyle = '#1d2433'; c.lineWidth = 5; c.beginPath(); c.arc(L0.x, L0.y, 30, 0, Math.PI * 2); c.fill(); c.stroke();
        if (flash > 0) { c.fillStyle = `rgba(255,255,255,${flash})`; c.fillRect(0, 0, W, H); flash = Math.max(0, flash - dt * 2.5); }
        steps();
      },
      down(p) {
        const g = G(S.W, S.H), L0 = lens || { x: S.W * 0.54, y: S.H * 0.3 };
        if (Math.hypot(p.x - L0.x, p.y - L0.y) < 50) { grab = 'lens'; lens = { x: p.x, y: p.y }; return; }
        const i = Math.floor((p.y - g.fy) / (g.fh + g.fg));
        if (i >= 0 && i < shots.length && p.x > g.bx) { grab = 'strip'; dragStrip = { k: shots[i], y: p.y - g.fh / 2 }; }
      },
      move(p, e, held) {
        if (!held) return; const g = G(S.W, S.H);
        if (grab === 'lens') { lens = { x: p.x, y: p.y }; aim = null; SRC.forEach(([k], i) => { const [x, y] = g.shelf(i); if (Math.hypot(p.x - x, p.y - y) < 40) aim = k; }); }
        else if (dragStrip) dragStrip.y = p.y - g.fh / 2;
      },
      up() {
        const g = G(S.W, S.H);
        if (dragStrip) { if (dragStrip.y + g.fh > g.oy - 20) compare(dragStrip.k); dragStrip = null; }
        aim = null; grab = null;
      },
      key(e) { const i = '1234'.indexOf(e.key); if (i >= 0) { const k = SRC[i][0]; if (!shots.includes(k)) { shots.push(k); flash = 0.5; } else compare(k); return true; } return false; },
    });
    root._sc = { shoot: (k) => { if (!shots.includes(k)) shots.push(k); S.kick(); }, pick: (k) => { compare(k); S.kick(); } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Scope = { mount };
})();
