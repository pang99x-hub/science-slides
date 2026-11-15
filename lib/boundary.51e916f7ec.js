/* 3-1 3차시 체험 «두 판을 움직여 보자»(교과서 113~115쪽 그림 Ⅲ-12 여러 가지 판의 경계 · 참고서 141~142쪽).
   비스듬히 내려다본 블록 단면: 왼판·오른판(이름표를 눌러 해양판 ⇄ 대륙판). 판을 손으로 끌어
   ① 바깥으로 벌리면 발산형(해양판끼리 → 해령, 대륙판이 끼면 → 열곡대), ② 위아래로 끌면 보존형(변환 단층, 지진만),
   ③ 안으로 밀면 수렴형(해양–해양: 해구 + 호상열도, 해양–대륙: 해구 + 습곡 산맥·화산, 대륙–대륙: 습곡 산맥, 화산 없음).
   진원은 섭입대를 따라 깊어진다. 크기·속도는 이해를 돕기 위한 그림.
   Boundary.mount(root) → { fit, setActive } · 시험용: root._bd2.move('apart'|'slide'|'push') · kind('L'|'R','ocean'|'cont') · state() */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const SEA = 0.3, SURF = { cont: 0.26, ocean: 0.42 }, THICK = { cont: 0.24, ocean: 0.13 }; // 정규 높이(위가 0)
  const DX = 0.05, DY = 0.09; // 윗면(비스듬히 본 땅 표면)의 깊이 방향
  const EX = {
    ridge: ['해령', '동태평양 해령'], rift: ['열곡대', '동아프리카 열곡대'], fault: ['변환 단층', '산안드레아스 단층'],
    oo: ['해구 · 호상열도', '마리아나 해구'], oc: ['해구 · 습곡 산맥', '안데스산맥'], cc: ['습곡 산맥', '히말라야산맥'],
  };
  // 어떤 경계·지형인지 정하는 규칙(그림과 패널이 함께 쓴다)
  function judge(mode, L, R) {
    if (mode === 'apart') return L === 'ocean' && R === 'ocean' ? 'ridge' : 'rift';
    if (mode === 'slide') return 'fault';
    if (mode === 'push') return L === 'cont' && R === 'cont' ? 'cc' : L === 'ocean' && R === 'ocean' ? 'oo' : 'oc';
    return null;
  }
  console.assert(judge('push', 'ocean', 'cont') === 'oc' && judge('apart', 'cont', 'ocean') === 'rift' && judge('push', 'cont', 'cont') === 'cc', 'boundary: 판정 규칙');

  function mount(root) {
    const stage = root.querySelector('.bd2-stage'), now = root.querySelector('.bd2-now'), out = root.querySelector('.bd2-out');
    const rows = [...root.querySelectorAll('.bd2-table tbody tr')];
    const P = window.Play;
    let kinds, mode, amt, goal, t, drag, done, msg, smoke, uiT = 0, pats = null, patKey = '';
    function reset() { kinds = { L: 'ocean', R: 'ocean' }; mode = null; amt = 0; goal = 0; t = 0; drag = null; done = { apart: false, slide: false, push: new Set() }; msg = ''; smoke = []; }
    reset();
    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };
    const X = (u) => u * S.W, Y = (v) => v * S.H;

    // 질감 무늬(오프스크린에 한 번 그려 둔다)
    function makePats(c) {
      const mk = (w, h, f) => { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; f(cv.getContext('2d'), w, h); return c.createPattern(cv, 'repeat'); };
      const dots = (g, w, h, cols, n) => { for (let i = 0; i < n; i++) { g.fillStyle = cols[i % cols.length]; g.beginPath(); g.arc(((i * 37) % w), ((i * 61) % h), 0.8 + (i % 3) * 0.6, 0, TAU); g.fill(); } };
      return {
        cont: mk(64, 40, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#d2ad84'); gr.addColorStop(1, '#bf9670'); g.fillStyle = gr; g.fillRect(0, 0, w, h); dots(g, w, h, ['rgba(120,80,50,.35)', 'rgba(255,240,220,.5)', 'rgba(60,40,30,.3)'], 46); g.strokeStyle = 'rgba(110,70,40,.25)'; g.beginPath(); g.moveTo(0, h * 0.5); g.bezierCurveTo(w * 0.3, h * 0.4, w * 0.7, h * 0.62, w, h * 0.5); g.stroke(); }),
        ocean: mk(48, 30, (g, w, h) => { g.fillStyle = '#5e6b67'; g.fillRect(0, 0, w, h); dots(g, w, h, ['rgba(20,30,30,.45)', 'rgba(160,175,170,.35)'], 40); }),
        lith: mk(60, 40, (g, w, h) => { g.fillStyle = '#7d5a3e'; g.fillRect(0, 0, w, h); dots(g, w, h, ['rgba(50,30,20,.35)', 'rgba(170,120,80,.3)'], 36); }),
      };
    }
    function paintBack(c, W, H) {
      const sky = c.createLinearGradient(0, 0, 0, Y(SEA)); sky.addColorStop(0, '#a7d0ee'); sky.addColorStop(1, '#e3f1fa'); c.fillStyle = sky; c.fillRect(0, 0, W, H);
      const m = c.createLinearGradient(0, Y(0.5), 0, H); m.addColorStop(0, '#f2a65a'); m.addColorStop(0.5, '#e07a3e'); m.addColorStop(1, '#c2472a'); c.fillStyle = m; c.fillRect(0, Y(0.45), W, H);
      c.fillStyle = 'rgba(255,220,160,.18)'; for (let i = 0; i < 120; i++) { c.beginPath(); c.arc(((i * 131) % 997) / 997 * W, Y(0.5) + ((i * 71) % 100) / 100 * (H - Y(0.5)), 1.5 + (i % 3), 0, TAU); c.fill(); }
    }
    // 판 하나의 표면 높이(픽셀 y): 경계 근처 지형을 더한다
    function surfY(side, x) {
      const k = kinds[side], xb = X(0.5), d = Math.abs(x - xb), base = Y(SURF[k]), w = S.W, h = S.H, j = judge(mode, kinds.L, kinds.R), a = amt;
      if (j === 'ridge') return base - a * h * 0.08 * Math.exp(-((d / (w * 0.16)) ** 2));
      if (j === 'rift' && k === 'cont') return base + a * h * 0.07 * Math.exp(-((d / (w * 0.07)) ** 2)) - a * h * 0.03 * Math.exp(-(((d - w * 0.12) / (w * 0.05)) ** 2));
      if (j === 'cc') return base - a * h * 0.2 * Math.exp(-((d / (w * 0.13)) ** 2)) * (1 + 0.12 * Math.sin(x * 0.12));
      if (j === 'oc' && k === 'cont') { const m = Math.exp(-(((d - w * 0.11) / (w * 0.07)) ** 2)); return base - a * h * 0.13 * m * (1 + 0.15 * Math.sin(x * 0.15)); }
      return base;
    }
    function rootY(side, x) { const j = judge(mode, kinds.L, kinds.R), d = Math.abs(x - X(0.5)); return j === 'cc' ? amt * S.H * 0.1 * Math.exp(-((d / (S.W * 0.14)) ** 2)) : 0; }
    // 섭입하는 판(해양–대륙이면 해양판, 해양–해양이면 오른판)
    const subSide = () => { const j = judge(mode, kinds.L, kinds.R); if (j === 'oo') return 'R'; if (j === 'oc') return kinds.L === 'ocean' ? 'L' : 'R'; return null; };

    function plateFace(c, side, x0, x1, slab) {
      const k = kinds[side], th = Y(THICK[k]);
      const top = [], bot = [];
      for (let x = x0; x <= x1 + 0.5; x += 4) { const xx = Math.min(x, x1); top.push([xx, surfY(side, xx)]); }
      for (let x = x1; x >= x0 - 0.5; x -= 4) { const xx = Math.max(x, x0); bot.push([xx, Y(SURF[k]) + th + rootY(side, xx)]); }
      const poly = (pts) => { c.beginPath(); pts.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); c.closePath(); };
      let pts = top.concat(bot);
      if (slab) { // 경계에서 아래로 휘어 들어가는 판: 위 끝 → 섭입대 끝 → 아래 끝
        const [tx, ty] = slab.from, dir = slab.dir, ang = 0.62, L = slab.len, ex = tx + dir * Math.cos(ang) * L, ey = ty + Math.sin(ang) * L, nx = -dir * Math.sin(ang) * th, ny = Math.cos(ang) * th;
        const tp = top.slice(), bt = bot.slice();
        if (dir < 0) { tp.reverse(); bt.reverse(); } // 경계 쪽이 배열 끝에 오도록
        pts = [...tp.filter(([x]) => (dir > 0 ? x <= tx : x >= tx)), [tx, ty], [ex, ey], [ex + nx, ey + ny], [tx + nx, ty + ny], ...bt.filter(([x]) => (dir > 0 ? x <= tx : x >= tx))];
        slab.tip = [ex, ey]; slab.ang = ang;
      }
      // 판 전체(맨틀 윗부분)
      c.fillStyle = pats.lith; poly(pts); c.fill();
      // 지각(위쪽 띠)
      c.save(); poly(pts); c.clip();
      const cr = k === 'cont' ? 0.48 : 0.42; c.fillStyle = pats[k];
      c.beginPath(); top.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y))); for (let i = top.length - 1; i >= 0; i--) { const [x, y] = top[i]; c.lineTo(x, Math.max(y, Y(SURF[k])) + th * cr + rootY(side, x) * 0.6); } c.closePath(); c.fill();
      if (slab) { const [tx, ty] = slab.from; c.beginPath(); c.moveTo(tx, ty); c.lineTo(slab.tip[0], slab.tip[1]); c.lineTo(slab.tip[0] - slab.dir * Math.sin(slab.ang) * th * cr, slab.tip[1] + Math.cos(slab.ang) * th * cr); c.lineTo(tx - slab.dir * Math.sin(slab.ang) * th * cr, ty + Math.cos(slab.ang) * th * cr); c.fill(); }
      // 습곡(구부러진 지층 선)
      const j = judge(mode, kinds.L, kinds.R);
      if ((j === 'cc' || (j === 'oc' && k === 'cont')) && amt > 0.1) { c.strokeStyle = 'rgba(90,50,25,.45)'; c.lineWidth = 2; for (let i = 1; i <= 3; i++) { c.beginPath(); top.forEach(([x, y], n) => { const yy = y + i * th * 0.11 + Math.sin(x * 0.09) * amt * 6; n ? c.lineTo(x, yy) : c.moveTo(x, yy); }); c.stroke(); } }
      c.restore();
      // 앞면 그늘과 테두리
      const sh = c.createLinearGradient(0, Y(0.2), 0, Y(0.75)); sh.addColorStop(0, 'rgba(255,255,255,.08)'); sh.addColorStop(1, 'rgba(0,0,0,.22)'); c.fillStyle = sh; poly(pts); c.fill();
      c.strokeStyle = 'rgba(30,20,10,.6)'; c.lineWidth = 1.5; poly(pts); c.stroke();
      return top;
    }
    // 윗면(비스듬히 본 땅·바다 표면): 보존형이면 오른판 위 표시가 깊이 방향으로 밀린다
    function topFace(c, side, x0, x1, shift) {
      const k = kinds[side], y = Math.min(Y(SURF[k]), k === 'ocean' ? Y(SEA) : 1e9), dx = X(DX), dy = Y(DY);
      c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.lineTo(x1 + dx, y - dy); c.lineTo(x0 + dx, y - dy); c.closePath();
      const g = c.createLinearGradient(0, y - dy, 0, y);
      if (k === 'ocean') { g.addColorStop(0, '#6fb3e0'); g.addColorStop(1, '#3f8fcb'); } else { g.addColorStop(0, '#9cc77a'); g.addColorStop(1, '#6aa84f'); }
      c.fillStyle = g; c.fill(); c.strokeStyle = 'rgba(30,40,50,.35)'; c.lineWidth = 1; c.stroke();
      // 표시 줄(판이 어긋나는 것을 보여 주는 흰 줄): 깊이 가운데를 가로지른다
      const f = 0.5 + shift; if (f > 0.05 && f < 0.95) { c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 3; c.setLineDash([10, 6]); c.beginPath(); c.moveTo(x0 + dx * f, y - dy * f); c.lineTo(x1 + dx * f, y - dy * f); c.stroke(); c.setLineDash([]); }
    }
    function tagPos(side) { const k = kinds[side]; return [X(side === 'L' ? 0.17 : 0.83) + X(DX) * 0.5, Math.min(Y(SURF[k]), k === 'ocean' ? Y(SEA) : 1e9) - Y(DY) * 0.5]; }
    function tag(c, side) {
      const [x, y] = tagPos(side), s = kinds[side] === 'ocean' ? '해양판 ⇄' : '대륙판 ⇄';
      c.font = '800 14px "IBM Plex Sans KR", sans-serif'; const w = c.measureText(s).width + 18;
      c.fillStyle = kinds[side] === 'ocean' ? '#1e5f96' : '#7a5a2a'; c.beginPath(); c.roundRect(x - w / 2, y - 13, w, 26, 13); c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2; c.stroke();
      P.txt(c, s, x, y + 5, '#fff', '800 14px');
    }
    function arrowH(c, x, y, len, col) { c.strokeStyle = col; c.fillStyle = col; c.lineWidth = 5; c.beginPath(); c.moveTo(x, y); c.lineTo(x + len, y); c.stroke(); const s = Math.sign(len); c.beginPath(); c.moveTo(x + len + s * 10, y); c.lineTo(x + len - s * 2, y - 8); c.lineTo(x + len - s * 2, y + 8); c.fill(); }
    function quake(c, x, y, ph, col) { const a = 0.4 + 0.6 * Math.max(0, Math.sin(t * 5 + ph)); c.fillStyle = col; c.globalAlpha = a; c.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? 3 : 7, an = i * Math.PI / 5; c.lineTo(x + Math.cos(an) * r, y + Math.sin(an) * r); } c.closePath(); c.fill(); c.globalAlpha = 1; }
    function volcano(c, x, yb, h, w) {
      const g = c.createLinearGradient(0, yb - h, 0, yb); g.addColorStop(0, '#5a4a40'); g.addColorStop(1, '#8a7a62');
      c.fillStyle = g; c.beginPath(); c.moveTo(x - w, yb); c.lineTo(x - w * 0.18, yb - h); c.lineTo(x + w * 0.18, yb - h); c.lineTo(x + w, yb); c.closePath(); c.fill(); c.strokeStyle = 'rgba(30,20,10,.5)'; c.lineWidth = 1.2; c.stroke();
      P.glow(c, x, yb - h, 8 + amt * 6, `rgba(255,120,40,${0.5 + 0.3 * Math.sin(t * 6)})`);
      if (Math.random() < 0.15) smoke.push({ x, y: yb - h - 4, r: 4, a: 0.7 });
    }
    function label(c, s, x, y, sub) { c.font = '800 15px "IBM Plex Sans KR", sans-serif'; const w = c.measureText(s).width + 16; c.fillStyle = 'rgba(29,36,51,.85)'; c.beginPath(); c.roundRect(x - w / 2, y - 15, w, 24, 8); c.fill(); P.txt(c, s, x, y + 2, '#ffd84d', '800 15px'); if (sub) P.txt(c, sub, x, y + 22, '#1d2433', '700 12px'); }

    function info() {
      const j = judge(mode, kinds.L, kinds.R), a = amt > 0.6;
      rows.forEach((r) => r.classList.toggle('on', !!mode && r.dataset.m === mode));
      if (!mode || amt < 0.15) return say('판을 손으로 끌어 보자 — <b>바깥으로</b> 벌리기, <b>위아래로</b> 어긋나게, <b>안으로</b> 밀기. 이름표를 누르면 판 종류가 바뀐다.');
      const ex = EX[j];
      const txt = {
        ridge: '두 해양판이 <b>멀어지자</b> 틈으로 마그마가 올라와 새 해양 지각이 되고, 바다 밑에 길게 솟은 산줄기 <b>해령</b>이 생긴다. 얕은 지진과 화산 활동.',
        rift: '대륙이 양쪽으로 <b>찢어지며</b> 가운데가 내려앉아 길고 깊은 골짜기 <b>열곡대</b>가 생긴다. 더 벌어지면 바닷물이 들어와 새 바다가 된다.',
        fault: '두 판이 서로 반대로 <b>미끄러져</b> 지나간다. 판이 새로 생기거나 사라지지 않고 <b>변환 단층</b>을 따라 지진만 잦다 — 화산은 거의 없다.',
        oo: '무거운 해양판이 다른 해양판 아래로 <b>파고든다(섭입)</b>. 경계에 깊은 골짜기 <b>해구</b>, 그 옆에 활처럼 늘어선 화산섬 <b>호상열도</b>. 진원은 섭입대를 따라 깊어진다.',
        oc: '무거운 해양판이 대륙판 아래로 <b>섭입</b>한다. 바다 쪽엔 <b>해구</b>, 대륙 쪽엔 화산이 줄지은 <b>습곡 산맥</b>. 진원은 대륙 쪽으로 갈수록 깊다.',
        cc: '둘 다 가벼운 대륙판이라 아래로 들어가지 못하고 <b>부딪쳐</b> 구겨진다 — 거대한 <b>습곡 산맥</b>. 지진은 잦지만 마그마가 생기지 않아 <b>화산은 없다</b>.',
      }[j];
      say(`${txt} <span class="bd2-ex">실제 예: ${ex[1]}</span>${a ? '' : ' (더 끌어 보자)'}`);
    }
    function steps() {
      const ok = []; if (done.apart) ok.push(1); if (done.slide) ok.push(2); if (done.push.size >= 2) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 판을 바깥으로 끌어 벌려 보자' : st === 2 ? '② 판을 위아래로 끌어 어긋나게 하자' : st === 3 ? `③ 판 종류를 바꿔 가며 안으로 밀어 보자 (${done.push.size}/2)` : '판이 움직이는 방향이 지형을 정한다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
      info();
    }
    function setMode(m, g) { if (m !== mode) { mode = m; amt = 0; smoke = []; } goal = Math.max(0, Math.min(1, g)); }
    function record() { if (amt < 0.85 || !mode) return; if (mode === 'apart') done.apart = true; else if (mode === 'slide') done.slide = true; else done.push.add(judge(mode, kinds.L, kinds.R)); }
    function tick(dt) { t += dt; amt += (goal - amt) * Math.min(1, dt * 5); record(); smoke.forEach((s) => { s.y -= dt * 22; s.x += dt * 8; s.r += dt * 6; s.a -= dt * 0.35; }); smoke = smoke.filter((s) => s.a > 0); }
    function setKind(side, k) { kinds[side] = k || (kinds[side] === 'ocean' ? 'cont' : 'ocean'); mode = null; amt = 0; goal = 0; smoke = []; steps(); S.kick(); }

    const S = P.make(stage, {
      draw(c, W, H, dt) {
        if (dt) tick(Math.min(dt, 0.05));
        const key = `${W}x${H}`; if (key !== patKey) { pats = makePats(c); patKey = key; }
        paintBack(c, W, H);
        const j = judge(mode, kinds.L, kinds.R), xb = X(0.5), a = amt;
        const gap = mode === 'apart' ? a * W * 0.12 : 0, sub = subSide(), shift = mode === 'slide' ? a * 0.38 : 0;
        // 윗면(뒤쪽) 먼저
        topFace(c, 'L', 0, xb - gap / 2, mode === 'slide' ? -shift : 0);
        topFace(c, 'R', xb + gap / 2, W, shift);
        { // 두 윗면 사이: 벌어진 틈은 새 지각(붉은빛), 높이가 다르면 대륙판의 끝 벽
          const ty = (k) => Math.min(Y(SURF[k]), k === 'ocean' ? Y(SEA) : 1e9), yl = ty(kinds.L), yr = ty(kinds.R), dx = X(DX), dy = Y(DY);
          if (gap > 1 || yl !== yr) { c.fillStyle = gap > 1 ? '#8a2e14' : '#9a7656'; c.beginPath(); c.moveTo(xb - gap / 2, yl); c.lineTo(xb - gap / 2 + dx, yl - dy); c.lineTo(xb + gap / 2 + dx, yr - dy); c.lineTo(xb + gap / 2, yr); c.closePath(); c.fill(); if (gap > 1) P.glow(c, xb + dx / 2, (yl + yr - dy) / 2, gap * 0.4, `rgba(255,140,50,${0.4 + 0.2 * Math.sin(t * 5)})`); }
        }
        // 바닷물(앞면): 해양판 위
        ['L', 'R'].forEach((s) => { if (kinds[s] !== 'ocean') return; const x0 = s === 'L' ? 0 : xb, x1 = s === 'L' ? xb : W; const g = c.createLinearGradient(0, Y(SEA), 0, Y(SURF.ocean)); g.addColorStop(0, '#3f8fcb'); g.addColorStop(1, '#1d5f99'); c.fillStyle = g; c.fillRect(x0, Y(SEA), x1 - x0, Y(SURF.ocean) - Y(SEA) + 2); });
        if (j === 'rift' && a > 0.75) { c.fillStyle = `rgba(63,143,203,${(a - 0.75) * 4})`; c.fillRect(xb - gap / 2 - 10, Y(SEA), gap + 20, Y(SURF.cont + 0.08) - Y(SEA)); }
        // 발산형: 틈으로 솟는 마그마
        if (mode === 'apart' && a > 0.02) {
          const mg = c.createLinearGradient(0, Y(0.3), 0, Y(0.7)); mg.addColorStop(0, '#4a3a34'); mg.addColorStop(0.25, '#d2461c'); mg.addColorStop(1, '#ffb347');
          c.fillStyle = mg; c.beginPath(); c.moveTo(xb - gap / 2 - 2, Y(0.32)); c.lineTo(xb + gap / 2 + 2, Y(0.32)); c.lineTo(xb + gap * 1.2, Y(0.8)); c.lineTo(xb - gap * 1.2, Y(0.8)); c.closePath(); c.fill();
          for (let i = 0; i < 6; i++) { const yy = Y(0.78) - ((t * 60 + i * 40) % (Y(0.78) - Y(0.36))); P.glow(c, xb + Math.sin(i * 2 + t) * gap * 0.25, yy, 6, 'rgba(255,200,90,.8)'); }
        }
        // 판 앞면
        if (j === 'oo' || j === 'oc') {
          const over = sub === 'L' ? 'R' : 'L', dir = sub === 'L' ? 1 : -1, slab = { from: [xb, Y(SURF.ocean)], dir, len: W * 0.08 + a * W * 0.3 };
          plateFace(c, sub, sub === 'L' ? 0 : xb, sub === 'L' ? xb : W, slab);
          plateFace(c, over, over === 'L' ? 0 : xb, over === 'L' ? xb : W);
          // 해구(경계의 깊은 골짜기)
          const tdp = a * H * 0.08; c.fillStyle = '#16497a'; c.beginPath(); c.moveTo(xb - W * 0.05, Y(SURF.ocean) - 1); c.lineTo(xb, Y(SURF.ocean) + tdp); c.lineTo(xb + W * 0.05 * (kinds[over] === 'cont' ? 0.3 : 1), Y(SURF.ocean) - 1); c.closePath(); c.fill();
          // 마그마가 솟아 화산을 만든다
          const vx = xb + dir * W * (j === 'oo' ? 0.13 : 0.11), vy = j === 'oo' ? Y(SURF.ocean) : surfY(over, vx);
          if (a > 0.3) {
            const tip = slab.tip; c.strokeStyle = 'rgba(255,120,40,.5)'; c.lineWidth = 3; c.setLineDash([4, 6]); c.beginPath(); c.moveTo(tip[0] - dir * W * 0.04, tip[1] - H * 0.06); c.lineTo(vx, vy + H * 0.04); c.stroke(); c.setLineDash([]);
            for (let i = 0; i < 4; i++) { const f = ((t * 0.4 + i / 4) % 1); P.glow(c, tip[0] - dir * W * 0.04 + (vx - tip[0] + dir * W * 0.04) * f, tip[1] - H * 0.06 + (vy + H * 0.04 - tip[1] + H * 0.06) * f, 5, 'rgba(255,170,60,.9)'); }
            if (j === 'oo') { volcano(c, vx, vy, (a - 0.3) * H * 0.3, W * 0.045); volcano(c, vx + dir * W * 0.06, vy, (a - 0.3) * H * 0.2, W * 0.035); }
            else volcano(c, vx, vy + 2, (a - 0.3) * H * 0.1, W * 0.03);
          }
          // 섭입대를 따라 깊어지는 진원: 얕은 곳 노랑 → 깊은 곳 빨강
          if (a > 0.15) { const n = Math.round(3 + a * 7); for (let i = 0; i < n; i++) { const f = (i + 0.5) / n, ang = 0.62, L = slab.len * f, x = xb + dir * Math.cos(ang) * L - dir * 6, y = Y(SURF.ocean) + Math.sin(ang) * L - 6; quake(c, x, y, i * 1.7, `hsl(${50 - f * 50},95%,${55 - f * 10}%)`); } }
          if (a > 0.5) { label(c, '해구', xb, Y(SURF.ocean) + tdp + 26); label(c, j === 'oo' ? '호상열도' : '습곡 산맥 · 화산', vx, Math.min(vy, Y(SEA)) - (j === 'oo' ? (a - 0.3) * H * 0.3 : H * 0.14) - 20); label(c, '섭입대', slab.tip[0] - dir * W * 0.02, slab.tip[1] + 30, '진원이 점점 깊어진다'); }
        } else {
          plateFace(c, 'L', 0, xb - gap / 2); plateFace(c, 'R', xb + gap / 2, W);
          if (j === 'ridge' && a > 0.4) label(c, '해령', xb, Y(SURF.ocean) - a * H * 0.08 - 28, '가운데 갈라진 골짜기는 열곡');
          if (j === 'rift' && a > 0.4) label(c, '열곡대', xb, Y(SURF.cont) - H * 0.07, a > 0.75 ? '바닷물이 들어와 새 바다가 생기기 시작' : '');
          if (mode === 'apart' && a > 0.2) for (let i = 0; i < 3; i++) quake(c, xb + (i - 1) * gap * 0.6, Y(0.4) + i * 8, i * 2, '#ffd84d');
          if (j === 'fault' && a > 0.1) {
            c.strokeStyle = '#ffd84d'; c.lineWidth = 3; c.setLineDash([8, 5]); c.beginPath(); c.moveTo(xb, Y(SURF.ocean)); c.lineTo(xb + X(DX), Y(SURF.ocean) - Y(DY)); c.stroke(); c.setLineDash([]);
            for (let i = 0; i < 4; i++) quake(c, xb + X(DX) * (0.2 + i * 0.2), Y(SEA) - Y(DY) * (0.2 + i * 0.2) + 4, i * 1.3, '#ffd84d');
            if (a > 0.4) label(c, '변환 단층', xb + X(DX) * 0.5, Y(SEA) - Y(DY) - 24, '지진만 잦고 화산은 거의 없다');
          }
          if (j === 'cc') {
            for (let i = 0; i < 5; i++) quake(c, xb + (i - 2) * W * 0.04, Y(SURF.cont) + H * (0.08 + (i % 3) * 0.05), i * 1.9, i % 2 ? '#ffd84d' : '#ffa53a');
            if (a > 0.4) label(c, '습곡 산맥', xb, Y(SURF.cont) - a * H * 0.2 - 22, '화산은 없다');
          }
        }
        smoke.forEach((s) => { c.fillStyle = `rgba(120,115,110,${s.a * 0.6})`; c.beginPath(); c.arc(s.x, s.y, s.r, 0, TAU); c.fill(); });
        // 판이 움직이는 방향
        if (mode && a > 0.05) {
          const y = Y(0.09);
          if (mode === 'apart') { arrowH(c, X(0.3), y, -50, '#1d2433'); arrowH(c, X(0.7), y, 50, '#1d2433'); }
          if (mode === 'push') { arrowH(c, X(0.25), y, 50, '#1d2433'); arrowH(c, X(0.75), y, -50, '#1d2433'); }
          if (mode === 'slide') { P.txt(c, '⊙ 앞으로', X(0.25), y + 6, '#1d2433', '800 16px'); P.txt(c, '⊗ 뒤로', X(0.75), y + 6, '#1d2433', '800 16px'); }
        }
        tag(c, 'L'); tag(c, 'R');
        P.txt(c, '암석권(판)', X(0.02), Y(0.5), 'rgba(255,255,255,.9)', '800 12px', 'left'); P.txt(c, '연약권', X(0.02), Y(0.86), 'rgba(255,255,255,.9)', '800 13px', 'left');
        if (!mode && !drag) { const p = 0.5 + 0.5 * Math.sin(t * 4); c.strokeStyle = `rgba(255,216,77,${p})`; c.lineWidth = 3; c.setLineDash([6, 6]); c.strokeRect(X(0.55), Y(0.2), X(0.4), Y(0.42)); c.setLineDash([]); P.txt(c, '판을 잡고 끌기 ↔ ↕', X(0.75), Y(0.66), '#fff', '800 15px'); }
        uiT += dt; if (uiT > 0.2 || !dt) { uiT = 0; steps(); }
      },
      down(p) {
        for (const s of ['L', 'R']) { const [x, y] = tagPos(s); if (Math.abs(p.x - x) < 64 && Math.abs(p.y - y) < 20) { setKind(s); return; } }
        if (p.y < Y(0.12)) return;
        drag = { side: p.x < S.W / 2 ? 'L' : 'R', x: p.x, y: p.y, m: null, a0: 0 };
      },
      move(p, e, held) {
        if (!held || !drag) return;
        const dx = p.x - drag.x, dy = p.y - drag.y;
        if (!drag.m) { if (Math.hypot(dx, dy) < 14) return; const out = drag.side === 'R' ? dx > 0 : dx < 0; drag.m = Math.abs(dy) > Math.abs(dx) ? 'slide' : out ? 'apart' : 'push'; drag.a0 = drag.m === mode ? amt : 0; }
        const d = drag.m === 'slide' ? Math.abs(dy) / (S.H * 0.3) : Math.abs(dx) / (S.W * 0.2);
        setMode(drag.m, drag.a0 + d);
      },
      up() { drag = null; },
      key(e) {
        const m = { 1: 'apart', 2: 'slide', 3: 'push' }[e.key]; if (m) { setMode(m, 1); return true; }
        if (e.key === 'q' || e.key === 'Q') { setKind('L'); return true; } if (e.key === 'w' || e.key === 'W') { setKind('R'); return true; }
        if (e.key === '0') { reset(); steps(); return true; } return false;
      },
    });
    root.querySelector('.bd2-reset').addEventListener('click', () => { reset(); steps(); S.kick(); });
    steps();
    const go = (sec) => { for (let k = 0; k < sec * 30; k++) tick(1 / 30); steps(); S.kick(); };
    root._bd2 = {
      move: (m) => { setMode(m, 1); go(2); return root._bd2.state(); },
      kind: (side, k) => { setKind(side, k); return root._bd2.state(); },
      state: () => ({ kinds: { ...kinds }, mode, amt: +amt.toFixed(2), form: judge(mode, kinds.L, kinds.R), done: { apart: done.apart, slide: done.slide, push: [...done.push] } }),
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Boundary = { mount };
})();
