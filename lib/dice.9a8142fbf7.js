/* 3-3 4차시 체험 «주사위로 단백질 만들기»(교과서 158쪽 탐구 «세포 내 유전정보의 흐름 확인하기»를 혼자 해 보는 판).
   교과서 규칙 그대로: 주사위 숫자 → 전사에 사용되는 DNA 가닥의 3염기조합(1 AGC · 2 ACG · 3 GTA · 4 CTG · 5 CCA · 6 TAC) → 코돈 → 아미노산 모형(● ◆ ■ ▲ ♥ ★).
   활동지: DNA 가닥 15칸(첫 TAC는 미리 적힘) · RNA 15칸 · 단백질 5칸.
   ① 주사위를 끌어 던져 DNA 12칸을 채운다 ② RNA 칸을 눌러 짝 염기를 고른다 ③ 표의 아미노산 모형을 끌어 단백질 칸에 놓는다.
   끝나면 «한 번 더»로 새로 만들고, 지난번 단백질과 견준다.
   Dice.mount(root) → { fit, setActive } · 시험용: root._dc.state() · geo() · roll(눈) · rna(칸, 염기) · bead(칸, 눈) · again() · tick(초) */
(function () {
  'use strict';
  const TAU = Math.PI * 2, FONT = '"IBM Plex Sans KR", sans-serif';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k, ease = (u) => u * u * (3 - 2 * u);
  const TRI = [null, 'AGC', 'ACG', 'GTA', 'CTG', 'CCA', 'TAC'];
  const PAIR = { A: 'U', T: 'A', G: 'C', C: 'G' };
  const COD = TRI.map((t) => t && [...t].map((b) => PAIR[b]).join(''));
  const AMINO = [null, '세린', '시스테인', '히스티딘', '아스파트산', '글라이신', '메싸이오닌'];
  const BLANK = { tri: [4], cod: [2, 5] }; // 교과서 표의 빈칸
  const SHAPE = [null, { k: 'circle', c: '#e9636b' }, { k: 'diamond', c: '#3d8fd6' }, { k: 'square', c: '#8f7cc2' }, { k: 'tri', c: '#f2b630' }, { k: 'heart', c: '#f29a55' }, { k: 'star', c: '#5aa045' }];
  const BC = { A: '#ffd84d', T: '#f2a03d', G: '#5cc77a', C: '#5aa9f0', U: '#f07ab4' };
  console.assert(COD.join() === ',UCG,UGC,CAU,GAC,GGU,AUG', 'dice codons'); // 교과서 표(UCG·CAU·GAC·AUG)와 맞는지

  const txt = (c, t, x, y, col = '#1d2433', f = '700 20px', al = 'center') => { c.fillStyle = col; c.font = `${f} ${FONT}`; c.textAlign = al; c.fillText(t, x, y); };
  function pill(c, x, y, t, bg, fg = '#fff', f = '700 16px', al = 'center') {
    c.font = `${f} ${FONT}`; const w = c.measureText(t).width + 20, x0 = al === 'left' ? x : al === 'right' ? x - w : x - w / 2;
    c.fillStyle = bg; c.beginPath(); c.roundRect(x0, y - 14, w, 27, 13); c.fill(); txt(c, t, x0 + w / 2, y + 5, fg, f);
  }
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = (v) => clamp(Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k), 0, 255); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
  function shape(c, x, y, v, r) { // 교과서 아미노산 모형
    const s = SHAPE[v]; c.beginPath();
    if (s.k === 'circle') c.arc(x, y, r, 0, TAU);
    else if (s.k === 'diamond') { c.moveTo(x, y - r * 1.15); c.lineTo(x + r, y); c.lineTo(x, y + r * 1.15); c.lineTo(x - r, y); }
    else if (s.k === 'square') c.roundRect(x - r * 0.88, y - r * 0.88, r * 1.76, r * 1.76, r * 0.25);
    else if (s.k === 'tri') { c.moveTo(x, y - r * 1.05); c.lineTo(x + r * 1.05, y + r * 0.8); c.lineTo(x - r * 1.05, y + r * 0.8); }
    else if (s.k === 'heart') { c.moveTo(x, y + r * 0.95); c.bezierCurveTo(x - r * 1.5, y - r * 0.1, x - r * 0.75, y - r * 1.25, x, y - r * 0.45); c.bezierCurveTo(x + r * 0.75, y - r * 1.25, x + r * 1.5, y - r * 0.1, x, y + r * 0.95); }
    else for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r * 1.1; c.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); }
    c.closePath();
    const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, 1, x, y, r * 1.2); g.addColorStop(0, shade(s.c, 0.5)); g.addColorStop(0.65, s.c); g.addColorStop(1, shade(s.c, -0.3));
    c.shadowColor = 'rgba(0,0,0,.2)'; c.shadowBlur = 5; c.shadowOffsetY = 2; c.fillStyle = g; c.fill(); c.shadowColor = 'transparent';
    c.strokeStyle = shade(s.c, -0.45); c.lineWidth = 1.4; c.stroke();
  }
  const PIPS = { 1: [[0, 0]], 2: [[-1, -1], [1, 1]], 3: [[-1, -1], [0, 0], [1, 1]], 4: [[-1, -1], [1, -1], [-1, 1], [1, 1]], 5: [[-1, -1], [1, -1], [0, 0], [-1, 1], [1, 1]], 6: [[-1, -1], [1, -1], [-1, 0], [1, 0], [-1, 1], [1, 1]] };
  function die(c, x, y, z, a, v, s, glow) { // 정육면체 주사위(앞면 + 윗면·옆면 깊이)
    c.save(); c.fillStyle = `rgba(0,0,0,${0.22 - z * 0.002})`; c.beginPath(); c.ellipse(x + 6, y + s * 0.62, s * (0.72 + z * 0.004), s * 0.2, 0, 0, TAU); c.fill();
    c.translate(x, y - z); c.rotate(a);
    if (glow) { c.fillStyle = `rgba(255,214,77,${0.4 * glow})`; c.beginPath(); c.roundRect(-s * 0.75, -s * 0.75, s * 1.5, s * 1.5, s * 0.3); c.fill(); }
    const d = s * 0.16;
    c.fillStyle = '#c9ccd6'; c.beginPath(); c.moveTo(-s / 2, -s / 2); c.lineTo(-s / 2 + d, -s / 2 - d); c.lineTo(s / 2 + d, -s / 2 - d); c.lineTo(s / 2 + d, s / 2 - d); c.lineTo(s / 2, s / 2); c.closePath(); c.fill();
    const g = c.createLinearGradient(-s / 2, -s / 2, s / 2, s / 2); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#e3e5ec');
    c.fillStyle = g; c.strokeStyle = '#8a8fa0'; c.lineWidth = 1.5; c.beginPath(); c.roundRect(-s / 2, -s / 2, s, s, s * 0.18); c.fill(); c.stroke();
    PIPS[v].forEach(([u, w]) => { c.fillStyle = v === 1 ? '#d23a3a' : u + w === 0 && v % 2 ? '#d23a3a' : '#2c4fa8'; c.beginPath(); c.arc(u * s * 0.27, w * s * 0.27, s * (v === 1 ? 0.13 : 0.085), 0, TAU); c.fill(); });
    c.restore();
  }

  function mount(root) {
    const stage = root.querySelector('.dc-stage'), chip = root.querySelector('.dc-now'), out = root.querySelector('.dc-out');
    let clock, dna, rolls, rna, prot, D, drag, pick, fly, msg, ok, shownTri, shownCod, hist, last, shakeAt, lastRow;

    function reset(keep) {
      if (keep && prot && prot.every(Boolean)) last = prot.map((p) => p.v);
      if (!keep) last = null;
      clock = 0; dna = 'TAC'.split(''); rolls = [6]; rna = Array(15).fill(null); prot = Array(5).fill(null); drag = null; pick = null; fly = []; ok = new Set();
      shownTri = new Set([1, 2, 3, 5, 6]); shownCod = new Set([1, 3, 4, 6]); shakeAt = {}; lastRow = 0;
      const g = S ? geo() : null; D = { x: g ? g.mat.x + g.mat.w * 0.5 : 200, y: g ? g.mat.y + g.mat.h * 0.55 : 160, vx: 0, vy: 0, z: 0, a: 0.1, v: 5, roll: false, t: 0, hist: [] };
      say(last ? '새 판이다. 위에 <b>지난번 단백질</b>을 남겨 두었다. 다시 주사위를 던져 견주어 보자.' : '활동지의 DNA 가닥 첫 세 칸에는 <b>TAC</b>가 적혀 있다. 왼쪽 <b>주사위</b>를 잡아 휙 끌었다 놓아 던지자. 나온 눈의 3염기조합이 다음 칸에 들어간다.');
      steps();
    }
    const say = (t) => { if (t !== msg) { msg = t; out.innerHTML = t; } };

    function geo() {
      const W = S.W, H = S.H, mat = { x: 14, y: 14, w: Math.round(W * 0.34), h: Math.round(H * 0.47) };
      const tb = { x: mat.x + mat.w + 18, y: 14, w: W - mat.x - mat.w - 32, h: mat.h }, rh = (tb.h - 34) / 6;
      const cols = [0.17, 0.27, 0.27, 0.29].map((f) => f * tb.w), cx = [tb.x]; cols.forEach((w, i) => cx.push(cx[i] + w));
      const sy = mat.y + mat.h + 20, lab = 132, cw = (W - 14 - lab - 14) / 15, ch = Math.min(64, (H - sy - 60) / 3.6);
      const rows = { dna: sy, rna: sy + ch * 1.6, pro: sy + ch * 3.2 };
      return { W, H, mat, tb, rh, cx, cols, lab, cw, ch, rows, x0: 14 + lab, cellX: (i) => 14 + lab + cw * (i + 0.5), proX: (k) => 14 + lab + cw * (k * 3 + 1.5),
        rowY: (v) => tb.y + 34 + rh * (v - 1) + rh / 2, modelX: cx[3] + cols[3] / 2, again: { x: mat.x + mat.w - 150, y: mat.y + 12, w: 138, h: 46 } };
    }
    const dnaFull = () => dna.length >= 15;
    const codonDone = (k) => [0, 1, 2].every((i) => rna[k * 3 + i]);

    // ① 주사위
    function throwDie(vx, vy) {
      if (dnaFull() || D.roll) return false;
      const sp = Math.hypot(vx, vy);
      if (sp < 260) { const a = Math.random() * TAU; vx = Math.cos(a) * 700; vy = Math.sin(a) * 500; }
      else if (sp > 2200) { vx *= 2200 / sp; vy *= 2200 / sp; }
      Object.assign(D, { vx, vy, roll: true, t: 0, spin: (Math.random() < 0.5 ? -1 : 1) * (6 + Math.random() * 6), hop: 34 });
      say('데굴데굴…'); return true;
    }
    function land(v) {
      D.roll = false; D.v = v; D.vx = D.vy = 0; D.z = 0; D.landT = clock; lastRow = v; rolls.push(v);
      const g = geo(), t = TRI[v], at = dna.length;
      t.split('').forEach((b, i) => fly.push({ b, x: g.cx[1] + g.cols[1] / 2 + (i - 1) * 16, y: g.rowY(v), tx: g.cellX(at + i), ty: g.rows.dna + g.ch / 2, u: -i * 0.12, done: () => { dna[at + i] = b; } }));
      dna.length = at + 3; for (let i = 0; i < 3; i++) dna[at + i] = null;
      const newTri = !shownTri.has(v); shownTri.add(v);
      say(`주사위 눈 <b>${v}</b> → 3염기조합 <b>${t}</b>.${newTri ? ` 표의 이 칸은 비어 있었다. 코돈이 ${COD[v]}이니 DNA 쪽은 짝을 거꾸로 맞춘 <b>${t}</b>.` : ''} ${dna.length >= 15 ? 'DNA 가닥 15칸이 다 찼다! 이제 <b>RNA 칸을 눌러</b> 짝 염기를 골라 전사하자.' : `DNA ${rolls.length * 3}/15칸. 한 번 더 던지자.`}`);
      if (dna.length >= 15) ok.add(1);
      steps();
    }
    const dieHit = (p) => Math.hypot(p.x - D.x, p.y - D.y) < 52;
    function stepDie(dt, g) {
      const m = g.mat, r = 34;
      if (drag && drag.die) return;
      if (!D.roll) return;
      D.t += dt; D.x += D.vx * dt; D.y += D.vy * dt;
      if (D.x < m.x + r) { D.x = m.x + r; D.vx = Math.abs(D.vx) * 0.7; } if (D.x > m.x + m.w - r) { D.x = m.x + m.w - r; D.vx = -Math.abs(D.vx) * 0.7; }
      if (D.y < m.y + r + 10) { D.y = m.y + r + 10; D.vy = Math.abs(D.vy) * 0.7; } if (D.y > m.y + m.h - r - 6) { D.y = m.y + m.h - r - 6; D.vy = -Math.abs(D.vy) * 0.7; }
      const f = Math.exp(-1.9 * dt); D.vx *= f; D.vy *= f;
      const sp = Math.hypot(D.vx, D.vy); D.a += D.spin * dt * clamp(sp / 600, 0, 1); D.hop *= Math.exp(-2.2 * dt);
      D.z = Math.abs(Math.sin(D.t * 11)) * D.hop * clamp(sp / 500, 0, 1);
      if ((D.ft = (D.ft || 0) + dt) > 0.08 && sp > 60) { D.ft = 0; D.v = 1 + Math.floor(Math.random() * 6); }
      if (sp < 45) { D.a = Math.round(D.a / (Math.PI / 2)) * (Math.PI / 2) + 0.06; land(D.force || D.v); D.force = 0; }
    }

    // ② 전사
    function chooseRNA(i, b) {
      if (!dnaFull() || dna.some((x) => !x)) { say('먼저 주사위로 <b>DNA 가닥</b>을 끝까지 채우자.'); return false; }
      if (rna[i]) return false;
      const need = PAIR[dna[i]];
      if (b !== need) {
        shakeAt[i] = clock;
        say(b === 'T' ? '<b>RNA에는 T가 없다.</b> DNA의 A에는 RNA의 <b>U</b>가 짝으로 붙는다.' : `DNA의 <b>${dna[i]}</b>에 붙는 RNA 염기는 <b>${need}</b>다. 짝: A→U, T→A, G→C, C→G.`);
        return false;
      }
      rna[i] = { b, t: clock }; pick = null;
      const k = Math.floor(i / 3);
      if (codonDone(k)) {
        const v = TRI.indexOf(dna.slice(k * 3, k * 3 + 3).join('')), newC = !shownCod.has(v); shownCod.add(v);
        say(`코돈 <b>${COD[v]}</b> 완성(3염기조합 ${TRI[v]}에서).${newC ? ' 표의 빈 코돈 칸도 채워졌다.' : ''}${k === 0 ? ' 첫 코돈 AUG는 단백질 합성을 시작하는 <b>개시코돈</b>이다.' : ''} ${rna.every(Boolean) ? '전사 끝! 이제 표의 <b>아미노산 모형</b>을 끌어 단백질 칸에 놓자.' : ''}`);
      } else say(`${dna[i]} → <b>${b}</b>. 맞았다.`);
      if (rna.every(Boolean)) ok.add(2);
      steps(); return true;
    }
    // ③ 번역
    function placeBead(k, v, from) {
      const g = geo();
      if (prot[k]) return false;
      const back = (m) => { fly.push({ v, x: from ? from.x : g.proX(k), y: from ? from.y : g.rows.pro, tx: g.modelX, ty: g.rowY(v), u: 0 }); shakeAt['p' + k] = clock; say(m); return false; };
      if (!codonDone(k)) return back(`이 칸 위의 코돈이 아직 비어 있다. 먼저 RNA ${k * 3 + 1}~${k * 3 + 3}번째 칸을 채우자.`);
      const cod = rna.slice(k * 3, k * 3 + 3).map((r) => r.b).join(''), want = COD.indexOf(cod);
      if (v !== want) return back(`코돈 <b>${cod}</b>에 맞는 모형이 아니다. 표의 <b>코돈 칸</b>에서 ${cod}를 찾아 그 줄의 모형을 끌어 오자.`);
      prot[k] = { v, t: clock, fx: from ? from.x : g.modelX, fy: from ? from.y : g.rowY(v) };
      const n = prot.filter(Boolean).length;
      if (n === 5) {
        ok.add(3); const same = last && last.every((x, i) => x === prot[i].v);
        say(`단백질 모형 완성! 아미노산 5개가 <b>펩타이드결합</b>으로 줄줄이 이어졌다. ${last ? (same ? '지난번과 서열이 같아 같은 단백질이다.' : '지난번 단백질과 견주어 보자. <b>DNA 서열이 다르니 아미노산 배열이 달라졌고</b>, 다른 단백질이다.') : '주사위 판의 <b>«한 번 더»</b>를 눌러 새로 만들어 견주어 보자.'}`);
      } else say(`코돈 <b>${cod}</b> → 모형(${AMINO[v]}). ${n === 1 ? '번역은 첫 코돈부터 세 염기씩 차례로 읽는다.' : '앞 아미노산과 이어졌다.'}`);
      steps(); return true;
    }

    function steps() {
      const n = [1, 2, 3].find((k) => !ok.has(k)) || 0;
      window.L1.steps(root, n, [...ok]); window.L1.done(root, n === 0);
      chip.textContent = n === 1 ? `① 주사위를 끌어 던지기 (DNA ${dna.filter(Boolean).length}/15칸)` : n === 2 ? `② RNA 칸을 눌러 짝 염기 고르기 (${rna.filter(Boolean).length}/15)` : n === 3 ? `③ 표의 모형을 끌어 단백질 칸에 놓기 (${prot.filter(Boolean).length}/5)` : '✓ DNA → RNA → 단백질 · «한 번 더»로 새로 만들기';
      chip.classList.toggle('done', n === 0);
    }

    // ── 그리기 ──
    function draw(c, W, H, dt) {
      clock += dt; const t = clock, g = geo();
      c.fillStyle = '#f6f2e8'; c.fillRect(0, 0, W, H);
      stepDie(dt, g);
      // 던지는 판(펠트)
      const m = g.mat, fg = c.createRadialGradient(m.x + m.w / 2, m.y + m.h / 2, 20, m.x + m.w / 2, m.y + m.h / 2, m.w * 0.7);
      fg.addColorStop(0, '#3f8a5c'); fg.addColorStop(1, '#2a6243'); c.fillStyle = fg; c.beginPath(); c.roundRect(m.x, m.y, m.w, m.h, 16); c.fill();
      c.strokeStyle = '#7a5a32'; c.lineWidth = 8; c.stroke(); c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 1; c.setLineDash([3, 5]); c.beginPath(); c.roundRect(m.x + 12, m.y + 12, m.w - 24, m.h - 24, 10); c.stroke(); c.setLineDash([]);
      if (last) { txt(c, '지난번 단백질', m.x + 18, m.y + 30, '#d7f0df', '700 14px', 'left'); last.forEach((v, i) => { if (i) { c.strokeStyle = 'rgba(255,255,255,.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(m.x + 34 + (i - 1) * 36, m.y + 54); c.lineTo(m.x + 34 + i * 36, m.y + 54); c.stroke(); } shape(c, m.x + 34 + i * 36, m.y + 54, v, 13); }); }
      const dz = drag && drag.die;
      if (!dnaFull() && !D.roll && !dz) { const bob = Math.sin(t * 3) * 4; txt(c, '잡고 휙 끌어 던지기 →', D.x, D.y - 60 + bob, '#fff7c2', '800 16px'); }
      die(c, D.x, D.y, dz ? 18 : D.z, D.a + (dz ? Math.sin(t * 20) * 0.05 : 0), D.v, 62, D.landT && t - D.landT < 1.2 ? 1 - (t - D.landT) / 1.2 : 0);
      if (dnaFull() && !D.roll) { txt(c, `DNA 다 채움 · 던진 눈 ${rolls.slice(1).join(' · ')}`, m.x + m.w / 2, m.y + m.h - 18, '#d7f0df', '700 15px'); }
      if (ok.has(3)) { const a = g.again, p = 1 + Math.sin(t * 3) * 0.03; c.save(); c.translate(a.x + a.w / 2, a.y + a.h / 2); c.scale(p, p); c.fillStyle = '#fff3c4'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.roundRect(-a.w / 2, -a.h / 2, a.w, a.h, 12); c.fill(); c.stroke(); txt(c, '한 번 더 ↻', 0, 7, '#1d2433', '800 18px'); c.restore(); }
      drawTable(c, g, t);
      drawSheet(c, g, t);
      // 날아가는 글자·모형
      fly = fly.filter((f) => { f.u = Math.min(1, f.u + dt / 0.6); if (f.u <= 0) return true; const e = ease(f.u), x = lerp(f.x, f.tx, e), y = lerp(f.y, f.ty, e) - Math.sin(Math.PI * f.u) * 50;
        if (f.b) { c.fillStyle = BC[f.b]; c.beginPath(); c.roundRect(x - 16, y - 18, 32, 36, 6); c.fill(); txt(c, f.b, x, y + 8, '#1d2433', '800 22px'); } else shape(c, x, y, f.v, 16);
        if (f.u >= 1 && f.done) f.done(); return f.u < 1; });
      if (drag && drag.v) shape(c, drag.x, drag.y, drag.v, 20);
      if (pick != null) drawPick(c, g, t);
    }
    function drawTable(c, g, t) {
      const b = g.tb; c.fillStyle = '#fffdf6'; c.strokeStyle = 'rgba(29,36,51,.35)'; c.lineWidth = 1.5; c.beginPath(); c.roundRect(b.x, b.y, b.w, b.h, 12); c.fill(); c.stroke();
      ['주사위 숫자', '3염기조합', '코돈', '아미노산 모형'].forEach((h, i) => { c.fillStyle = '#f1e8d6'; c.beginPath(); c.roundRect(g.cx[i] + 4, b.y + 4, g.cols[i] - 8, 26, 13); c.fill(); txt(c, h, g.cx[i] + g.cols[i] / 2, b.y + 23, '#1d2433', '800 15px'); });
      for (let v = 1; v <= 6; v++) {
        const y = g.rowY(v), hot = lastRow === v && D.landT && t - D.landT < 2.5;
        if (hot) { c.fillStyle = `rgba(255,214,77,${0.5 * (1 - (t - D.landT) / 2.5)})`; c.fillRect(b.x + 4, y - g.rh / 2, b.w - 8, g.rh); }
        if (v > 1) { c.strokeStyle = 'rgba(29,36,51,.12)'; c.lineWidth = 1; c.beginPath(); c.moveTo(b.x + 8, y - g.rh / 2); c.lineTo(b.x + b.w - 8, y - g.rh / 2); c.stroke(); }
        txt(c, String(v), g.cx[0] + g.cols[0] / 2, y + 6, '#1d2433', '700 17px');
        const tri = shownTri.has(v), cod = shownCod.has(v);
        txt(c, tri ? TRI[v] : '?', g.cx[1] + g.cols[1] / 2, y + 6, tri ? (BLANK.tri.includes(v) ? '#b2362b' : '#1d2433') : '#a0a6b2', '700 18px');
        txt(c, cod ? COD[v] : '?', g.cx[2] + g.cols[2] / 2, y + 6, cod ? (BLANK.cod.includes(v) ? '#b2362b' : '#1d2433') : '#a0a6b2', '700 18px');
        const dragging = drag && drag.v === v, can = ok.has(2) && !ok.has(3);
        if (!dragging) shape(c, g.modelX, y + (can ? Math.sin(t * 2.5 + v) * 1.5 : 0), v, Math.min(13, g.rh * 0.36));
        if (can) { c.strokeStyle = 'rgba(29,111,184,.35)'; c.setLineDash([3, 3]); c.lineWidth = 1.5; c.beginPath(); c.arc(g.modelX, y, Math.min(19, g.rh * 0.5), 0, TAU); c.stroke(); c.setLineDash([]); }
      }
      txt(c, '전사에 사용되는 DNA 가닥 기준 · 빨간 글자는 교과서 표의 빈칸', b.x + b.w - 10, b.y + b.h + 14, '#5b6474', '600 12px', 'right');
    }
    function cell(c, x, y, w, h, b, col, sh) {
      c.fillStyle = b ? col : '#fff'; c.strokeStyle = 'rgba(29,36,51,.3)'; c.lineWidth = 1.2; c.beginPath(); c.roundRect(x - w / 2 + 2 + sh, y + 2, w - 4, h - 4, 6); c.fill(); c.stroke();
      if (b) txt(c, b, x + sh, y + h / 2 + 8, '#1d2433', '800 22px');
    }
    function drawSheet(c, g, t) {
      const R = g.rows, L = g.lab, cw = g.cw, ch = g.ch;
      const tag = (y, h, s) => { c.fillStyle = '#f1e8d6'; c.beginPath(); c.roundRect(16, y + 4, L - 16, h - 8, (h - 8) / 2); c.fill(); txt(c, s, 16 + (L - 16) / 2, y + h / 2 + 6, '#1d2433', '800 17px'); };
      tag(R.dna, ch, 'DNA 가닥'); tag(R.rna, ch, 'RNA'); tag(R.pro, ch * 1.3, '단백질');
      txt(c, '↓ 전사', 16 + (L - 16) / 2, R.dna + ch + ch * 0.42, '#8a6a4a', '700 14px'); txt(c, '↓ 번역', 16 + (L - 16) / 2, R.rna + ch + ch * 0.42, '#8a6a4a', '700 14px');
      for (let k = 1; k < 5; k++) { const x = g.x0 + cw * k * 3; c.strokeStyle = 'rgba(29,36,51,.45)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, R.dna - 4); c.lineTo(x, R.pro + ch * 1.3 + 4); c.stroke(); }
      for (let i = 0; i < 15; i++) {
        const x = g.cellX(i);
        cell(c, x, R.dna, cw, ch, dna[i], BC[dna[i]] ? shade(BC[dna[i]], 0.35) : '#fff', 0);
        const r = rna[i], sh = shakeAt[i] && t - shakeAt[i] < 0.5 ? Math.sin((t - shakeAt[i]) * 50) * 5 : 0;
        cell(c, x, R.rna, cw, ch, r && r.b, r ? shade(BC[r.b], 0.35) : '#fff', sh);
        if (!r && ok.has(1) && !pick) { c.strokeStyle = `rgba(29,111,184,${0.3 + 0.25 * Math.sin(t * 4 + i * 0.4)})`; c.lineWidth = 2; c.beginPath(); c.roundRect(x - cw / 2 + 4, R.rna + 4, cw - 8, ch - 8, 5); c.stroke(); }
        if (pick === i) { c.strokeStyle = '#1d2433'; c.lineWidth = 3; c.beginPath(); c.roundRect(x - cw / 2 + 2, R.rna + 2, cw - 4, ch - 4, 6); c.stroke(); }
      }
      // 단백질 칸과 구슬 끈
      const py = R.pro + ch * 0.65, done = prot.every(Boolean);
      for (let k = 0; k < 5; k++) { const x = g.proX(k), sh = shakeAt['p' + k] && t - shakeAt['p' + k] < 0.5 ? Math.sin((t - shakeAt['p' + k]) * 50) * 5 : 0; c.fillStyle = '#fff'; c.strokeStyle = 'rgba(29,36,51,.3)'; c.lineWidth = 1.2; c.beginPath(); c.roundRect(x - cw * 1.5 + 3 + sh, R.pro + 2, cw * 3 - 6, ch * 1.3 - 4, 8); c.fill(); c.stroke();
        if (!prot[k] && ok.has(2) && codonDone(k)) { c.setLineDash([5, 4]); c.strokeStyle = `rgba(29,111,184,${0.45 + 0.3 * Math.sin(t * 4 + k)})`; c.lineWidth = 2; c.beginPath(); c.arc(x, py, 20, 0, TAU); c.stroke(); c.setLineDash([]); } }
      const pos = (k) => [g.proX(k), py + (done ? Math.sin(t * 2 + k * 0.9) * 4 : 0)];
      for (let k = 1; k < 5; k++) if (prot[k] && prot[k - 1] && clock - prot[k].t > 0.45) { const [a, b] = pos(k - 1), [x, y] = pos(k); c.strokeStyle = '#6b5a45'; c.lineWidth = 3; c.beginPath(); c.moveTo(a, b); c.quadraticCurveTo((a + x) / 2, (b + y) / 2 + 8, x, y); c.stroke(); }
      prot.forEach((p, k) => { if (!p) return; const u = clamp((clock - p.t) / 0.45, 0, 1), e = ease(u), [x, y] = pos(k); shape(c, lerp(p.fx, x, e), lerp(p.fy, y, e) - Math.sin(Math.PI * u) * 40, p.v, 17); });
    }
    function drawPick(c, g, t) {
      const x = clamp(g.cellX(pick), 150, g.W - 150), y = g.rows.rna + g.ch + 34;
      c.fillStyle = '#fff'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.shadowColor = 'rgba(0,0,0,.25)'; c.shadowBlur = 10; c.shadowOffsetY = 3; c.beginPath(); c.roundRect(x - 140, y - 30, 280, 56, 14); c.fill(); c.shadowColor = 'transparent'; c.stroke();
      ['A', 'U', 'G', 'C', 'T'].forEach((b, i) => { const bx = x - 112 + i * 56; c.fillStyle = shade(BC[b], 0.2); c.beginPath(); c.arc(bx, y - 2, 21, 0, TAU); c.fill(); c.strokeStyle = shade(BC[b], -0.4); c.lineWidth = 1.5; c.stroke(); txt(c, b, bx, y + 6, '#1d2433', '800 20px'); });
    }
    const pickHit = (g, p) => { if (pick == null) return null; const x = clamp(g.cellX(pick), 150, g.W - 150), y = g.rows.rna + g.ch + 34; for (let i = 0; i < 5; i++) if (Math.hypot(p.x - (x - 112 + i * 56), p.y - (y - 2)) < 25) return 'AUGCT'[i]; return Math.abs(p.x - x) < 140 && Math.abs(p.y - y) < 30 ? '' : null; };

    // ── 손 조작 ──
    let trail = [];
    const S = window.Play.make(stage, {
      draw,
      down(p) {
        const g = geo(), pk = pickHit(g, p);
        if (pk) { chooseRNA(pick, pk); return; } if (pk === '') return;
        pick = null;
        if (ok.has(3)) { const a = g.again; if (p.x > a.x && p.x < a.x + a.w && p.y > a.y && p.y < a.y + a.h) { reset(true); return; } }
        if (!dnaFull() && !D.roll && dieHit(p)) { drag = { die: true, ox: D.x - p.x, oy: D.y - p.y }; trail = [{ x: p.x, y: p.y, t: performance.now() }]; return; }
        if (p.y > g.rows.rna && p.y < g.rows.rna + g.ch && p.x > g.x0) { const i = Math.floor((p.x - g.x0) / g.cw); if (i >= 0 && i < 15) { if (!ok.has(1)) say('먼저 주사위로 <b>DNA 가닥</b>을 끝까지 채우자.'); else if (!rna[i]) { pick = i; say(`DNA <b>${dna[i]}</b>의 짝은? 위에 뜬 염기 가운데 하나를 누르자.`); } } return; }
        if (Math.abs(p.x - g.modelX) < 26 && p.y > g.tb.y + 34 && p.y < g.tb.y + g.tb.h) { const v = clamp(Math.floor((p.y - g.tb.y - 34) / g.rh) + 1, 1, 6); if (ok.has(2)) drag = { v, x: p.x, y: p.y }; else say('아미노산 모형은 <b>전사를 마친 뒤</b> 끌어 온다.'); }
      },
      move(p) {
        if (!drag) return;
        if (drag.die) { const m = geo().mat; D.x = clamp(p.x + drag.ox, m.x + 34, m.x + m.w - 34); D.y = clamp(p.y + drag.oy, m.y + 44, m.y + m.h - 40); trail.push({ x: p.x, y: p.y, t: performance.now() }); if (trail.length > 6) trail.shift(); D.a += 0.02; return; }
        drag.x = p.x; drag.y = p.y;
      },
      up(p) {
        const d = drag; drag = null; if (!d) return; const g = geo();
        if (d.die) { const a = trail[0], b = trail[trail.length - 1], dt = Math.max(16, b.t - a.t) / 1000; throwDie((b.x - a.x) / dt, (b.y - a.y) / dt); return; }
        if (d.v) {
          const k = [0, 1, 2, 3, 4].find((kk) => Math.abs(p.x - g.proX(kk)) < g.cw * 1.5 && p.y > g.rows.pro - 20 && p.y < g.rows.pro + g.ch * 1.3 + 20);
          if (k == null) { fly.push({ v: d.v, x: p.x, y: p.y, tx: g.modelX, ty: g.rowY(d.v), u: 0 }); say('모형은 아래 <b>단백질 칸</b>(코돈 바로 밑)에 놓자.'); return; }
          if (prot[k]) { fly.push({ v: d.v, x: p.x, y: p.y, tx: g.modelX, ty: g.rowY(d.v), u: 0 }); return; }
          placeBead(k, d.v, p);
        }
      },
      key(e) {
        const k = e.key.toUpperCase();
        if (e.key === '0') { reset(false); return true; }
        if (k === 'N' && ok.has(3)) { reset(true); return true; }
        if ((e.key === ' ' || e.key === 'Enter') && !dnaFull()) { throwDie(0, 0); return true; }
        if ('AUGCT'.includes(k) && k.length === 1 && ok.has(1)) { const i = rna.findIndex((x) => !x); if (i >= 0) { pick = i; chooseRNA(i, k); } return true; }
        if (/^[1-6]$/.test(e.key) && ok.has(2)) { const i = prot.findIndex((x) => !x); if (i >= 0) placeBead(i, +e.key); return true; }
        return false;
      },
    });
    root.querySelector('.dc-reset').addEventListener('click', () => { reset(false); S.kick(); });
    reset(false);

    root._dc = {
      state: () => ({ dna: dna.map((x) => x || '_').join(''), rna: rna.map((x) => (x ? x.b : '_')).join(''), prot: prot.map((x) => (x ? x.v : 0)).join(''), rolls: [...rolls], rolling: D.roll, last, ok: [...ok], fin: root.classList.contains('u-done'), out: out.textContent, chip: chip.textContent, pick }),
      geo: () => { const g = geo(); return { W: g.W, H: g.H, die: [D.x, D.y], mat: g.mat, rnaCell: [...Array(15)].map((_, i) => [g.cellX(i), g.rows.rna + g.ch / 2]), pick: pick == null ? null : Object.fromEntries([...'AUGCT'].map((b, i) => [b, [clamp(g.cellX(pick), 150, g.W - 150) - 112 + i * 56, g.rows.rna + g.ch + 32]])), model: [0, 1, 2, 3, 4, 5, 6].map((v) => [g.modelX, v ? g.rowY(v) : 0]), pro: [0, 1, 2, 3, 4].map((k) => [g.proX(k), g.rows.pro + g.ch * 0.65]), again: [g.again.x + g.again.w / 2, g.again.y + g.again.h / 2] }; },
      roll: (v) => { if (throwDie(900, 300)) D.force = v; return root._dc.state(); },
      rna: (i, b) => { chooseRNA(i, b); return root._dc.state(); },
      bead: (k, v) => { placeBead(k, v); return root._dc.state(); },
      again: () => { reset(true); return root._dc.state(); },
      tick: (sec) => { for (let i = 0; i < sec * 60; i++) draw(S.c, S.W, S.H, 1 / 60); return root._dc.state(); },
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Dice = { mount };
})();
