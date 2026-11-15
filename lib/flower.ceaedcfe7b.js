/* 3-3 4차시 체험 «유전자가 바뀌면 꽃 색이»(교과서 155쪽 해 보기 + 참고서 유전자와 형질, 유전부호, 유전자 이상과 유전병).
   (가) 붉은 꽃과 꽃잎 세포 속 «붉은 색소 합성 효소 유전자»(일부, 12염기 = 3염기조합 4개). 전사에 쓰이는 가닥의 염기를 누르면 A→G→C→T로 바뀐다.
        바로 아래에 전사된 RNA 코돈과 아미노산이 따라 바뀌고, 그 아래 흐름 «유전자 → 효소(단백질) → 붉은 색소 → 꽃 색»이 차례로 켜진다.
        아미노산이 바뀌거나(효소 모양이 망가짐) 종결코돈이 생기거나(번역이 중간에 멈춤) 개시코돈이 사라지면 색소를 못 만들어 꽃이 하얘진다.
        같은 아미노산을 지정하는 코돈으로 바뀌면 효소가 그대로라 꽃도 붉다. «원래대로»를 누르면 붉은 꽃으로 돌아간다.
   (나) 사람과 동물의 유전병: 멜라닌 합성 효소 유전자 이상 → 멜라닌이 없다(백색증, 토끼 그림) · 헤모글로빈 유전자 염기 T→A(코돈 GAA→GUA, 글루탐산→발린) → 낫 모양 적혈구가 모세 혈관에 걸린다.
   염기 수·효소 모양·색이 바뀌는 빠르기·백색증 유전자 염기는 이해를 돕기 위한 예.
   키보드: ←→ 염기 고르기, 스페이스·엔터 바꾸기, R 원래대로, A 백색증, S 낫 모양, 0 처음부터.
   Flower.mount(root) → { fit, setActive } · 시험용: root._fl.flip(i) · revert() · alb() · sick() · run(초) · state() · hit(이름[, i]) */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const F = (w, s) => `${w} ${s}px "IBM Plex Sans KR", sans-serif`;
  const mix = (a, b, k) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], clamp(k, 0, 1)))).join(',')})`; };
  function txt(c, s, x, y, col, font, al = 'center') { c.fillStyle = col; c.font = font; c.textAlign = al; c.fillText(s, x, y); }
  // 표준 유전부호(UCAG 순서)
  const NB = 'UCAG', AA = 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';
  const NAME = { F: '페닐알라닌', L: '류신', S: '세린', Y: '타이로신', C: '시스테인', W: '트립토판', P: '프롤린', H: '히스티딘', Q: '글루타민', R: '아르지닌', I: '아이소류신', M: '메싸이오닌', T: '트레오닌', N: '아스파라진', K: '라이신', V: '발린', A: '알라닌', D: '아스파트산', E: '글루탐산', G: '글라이신', '*': '종결' };
  const tr = (cod) => AA[16 * NB.indexOf(cod[0]) + 4 * NB.indexOf(cod[1]) + NB.indexOf(cod[2])];
  const RNA = { A: 'U', G: 'C', C: 'G', T: 'A' }, PAIR = { A: 'T', T: 'A', G: 'C', C: 'G' }, NEXT = { A: 'G', G: 'C', C: 'T', T: 'A' };
  const ORIG = 'TACCTTCCAACC'.split(''); // 전사에 쓰이는 가닥 → RNA AUG GAA GGU UGG(메싸이오닌-글루탐산-글라이신-트립토판)
  const BASECOL = { A: '#d9483b', T: '#e8a23a', G: '#2f8a4a', C: '#2a73b8', U: '#8a4fb8' };

  function read(tpl) {
    const rna = tpl.map((b) => RNA[b]).join(''), cods = [0, 1, 2, 3].map((i) => rna.slice(i * 3, i * 3 + 3)), aas = cods.map(tr);
    const o = [0, 1, 2, 3].map((i) => tr(ORIG.slice(i * 3, i * 3 + 3).map((b) => RNA[b]).join('')));
    const changed = tpl.some((b, i) => b !== ORIG[i]);
    let kind = 'normal', at = -1;
    if (cods[0] !== 'AUG') { kind = 'nostart'; at = 0; }
    else if (aas.indexOf('*') >= 0) { kind = 'stop'; at = aas.indexOf('*'); }
    else if (aas.some((a, i) => a !== o[i])) { kind = 'miss'; at = aas.findIndex((a, i) => a !== o[i]); }
    else if (changed) kind = 'silent';
    return { cods, aas, o, kind, at, works: kind === 'normal' || kind === 'silent' };
  }

  // ── 그림 도우미 ──
  function petal(c, len, wid, ruff, t) {
    c.beginPath(); c.moveTo(0, 0);
    c.bezierCurveTo(wid * 0.9, -len * 0.25, wid * 1.1, -len * 0.75, wid * 0.55, -len * 0.96);
    for (let i = 0; i <= 8; i++) { const u = i / 8, x = lerp(wid * 0.55, -wid * 0.55, u), y = -len * (0.96 + 0.06 * Math.sin(u * Math.PI)) + (i % 2 ? ruff : -ruff * 0.4) * (1 + 0.15 * Math.sin(t * 2 + i)); c.lineTo(x, y); }
    c.bezierCurveTo(-wid * 1.1, -len * 0.75, -wid * 0.9, -len * 0.25, 0, 0); c.closePath();
  }
  function flower(c, x, y, R, col, t, base) {
    const sway = Math.sin(t * 0.9) * 0.05;
    // 줄기와 잎
    c.strokeStyle = '#3f7d2c'; c.lineWidth = R * 0.09; c.lineCap = 'round';
    c.beginPath(); c.moveTo(x, base); c.quadraticCurveTo(x - R * 0.12, (y + base) / 2, x + Math.sin(sway) * R, y + R * 0.2); c.stroke();
    [[0.62, -1], [0.78, 1]].forEach(([u, k]) => {
      const ly = lerp(y, base, u), lx = x - R * 0.06;
      c.save(); c.translate(lx, ly); c.rotate(k * (0.9 + 0.08 * Math.sin(t * 1.2 + k)));
      const g = c.createLinearGradient(0, 0, 0, -R * 0.9); g.addColorStop(0, '#2f6a22'); g.addColorStop(1, '#7cb54f');
      c.fillStyle = g; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(R * 0.28, -R * 0.45, 0, -R * 0.95); c.quadraticCurveTo(-R * 0.28, -R * 0.45, 0, 0); c.fill();
      c.strokeStyle = 'rgba(220,240,200,.6)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, -2); c.lineTo(0, -R * 0.85); c.stroke(); c.restore();
    });
    // 꽃받침
    c.save(); c.translate(x + Math.sin(sway) * R, y + R * 0.2); c.rotate(sway);
    c.fillStyle = '#4c8a34'; c.beginPath(); c.moveTo(-R * 0.16, -R * 0.1); c.quadraticCurveTo(0, R * 0.32, R * 0.16, -R * 0.1); c.closePath(); c.fill();
    // 꽃잎 세 겹
    const edge = mix('#d8cfc0', '#8e1022', col), mid = mix('#fbf8f2', '#d42a3c', col), hi = mix('#ffffff', '#f06a6f', col);
    [[R * 0.95, 9, 0, 0.2], [R * 0.78, 8, 0.35, 0.12], [R * 0.55, 7, 0.1, 0.05]].forEach(([len, n, off, sp], li) => {
      for (let i = 0; i < n; i++) {
        const a = -Math.PI / 2 + (i / (n - 1) - 0.5) * (2.6 - li * 0.5) + off * 0.3 + Math.sin(t * 1.1 + i) * 0.015;
        c.save(); c.translate(0, -R * 0.08 - li * R * 0.05); c.rotate(a + Math.PI / 2);
        const g = c.createLinearGradient(0, 0, 0, -len); g.addColorStop(0, edge); g.addColorStop(0.35, mid); g.addColorStop(0.85, hi); g.addColorStop(1, edge);
        petal(c, len, len * 0.32, len * 0.05, t); c.fillStyle = g; c.fill(); c.strokeStyle = mix('#b9ad9b', '#6e0a18', col); c.lineWidth = 1; c.stroke();
        c.restore();
      }
    });
    c.restore();
  }
  function enzyme(c, x, y, r, ok, k, t) {
    // ok: 제 모양(오목한 활성 자리) · 아니면 엉킨 모양. k: 0 없음 ~ 1 다 있음(짧게 끊긴 효소는 k가 작다)
    if (k <= 0.01) { c.setLineDash([5, 5]); c.strokeStyle = '#9aa1ad'; c.lineWidth = 2; c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke(); c.setLineDash([]); return; }
    const lobes = ok ? [[-0.45, -0.1, 0.55], [0.45, -0.1, 0.55], [-0.2, 0.42, 0.5], [0.3, 0.42, 0.45], [0, 0.1, 0.5]] : [[-0.5, 0.3, 0.45], [0.1, -0.4, 0.42], [0.5, 0.2, 0.5], [-0.15, 0.1, 0.38], [0.35, -0.55, 0.3], [-0.55, -0.35, 0.33]];
    const n = Math.max(1, Math.round(lobes.length * k));
    lobes.slice(0, n).forEach(([dx, dy, rr], i) => {
      const px = x + dx * r + Math.sin(t * 2 + i) * 1.2, py = y + dy * r + Math.cos(t * 1.7 + i) * 1.2, g = c.createRadialGradient(px - rr * r * 0.3, py - rr * r * 0.35, 1, px, py, rr * r);
      g.addColorStop(0, '#fff6c8'); g.addColorStop(0.45, ok ? '#f2c230' : '#c9b56a'); g.addColorStop(1, ok ? '#a87a10' : '#7d7040');
      c.fillStyle = g; c.beginPath(); c.arc(px, py, rr * r, 0, TAU); c.fill();
    });
    if (ok) { c.fillStyle = '#20283a'; c.beginPath(); c.moveTo(x - r * 0.22, y - r * 0.75); c.lineTo(x, y - r * 0.32); c.lineTo(x + r * 0.22, y - r * 0.75); c.closePath(); c.fill(); } // 활성 자리(홈)
  }
  function rabbit(c, x, y, s, m, t) {
    // m: 멜라닌 양 0(흰 털·붉은 눈) ~ 1(갈색 털·검은 눈)
    c.save(); c.translate(x, y); c.scale(s, s);
    const fur = mix('#f6f3ee', '#8b5e3c', m), dark = mix('#d9d2c8', '#5a3a22', m), ear = Math.sin(t * 1.3) * 0.06;
    c.fillStyle = fur; c.beginPath(); c.arc(30, -8, 8, 0, TAU); c.fill(); // 꼬리
    let g = c.createRadialGradient(-4, -26, 4, 0, -18, 34); g.addColorStop(0, mix('#ffffff', '#b07d55', m)); g.addColorStop(0.7, fur); g.addColorStop(1, dark);
    c.fillStyle = g; c.beginPath(); c.ellipse(4, -18, 30, 22, 0, 0, TAU); c.fill();
    c.fillStyle = dark; c.beginPath(); c.ellipse(-16, -2, 10, 5, 0, 0, TAU); c.fill();
    [[-0.25 + ear, -24], [0.05 - ear, -16]].forEach(([a, ex]) => { c.save(); c.translate(ex, -52); c.rotate(a); c.fillStyle = fur; c.beginPath(); c.ellipse(0, -22, 7, 24, 0, 0, TAU); c.fill(); c.fillStyle = '#f0b6b8'; c.beginPath(); c.ellipse(0, -21, 3.5, 18, 0, 0, TAU); c.fill(); c.restore(); });
    g = c.createRadialGradient(-26, -50, 3, -22, -44, 20); g.addColorStop(0, mix('#ffffff', '#b07d55', m)); g.addColorStop(1, fur);
    c.fillStyle = g; c.beginPath(); c.ellipse(-22, -42, 18, 15, -0.2, 0, TAU); c.fill();
    c.fillStyle = mix('#d92d3a', '#1a120c', m); c.beginPath(); c.arc(-27, -46, 3.6, 0, TAU); c.fill();
    c.fillStyle = 'rgba(255,255,255,.85)'; c.beginPath(); c.arc(-28, -47.5, 1.2, 0, TAU); c.fill();
    c.fillStyle = '#e48a91'; c.beginPath(); c.arc(-39, -40, 2.4, 0, TAU); c.fill();
    c.restore();
  }
  function rbc(c, x, y, r, sk, a) {
    c.save(); c.translate(x, y); c.rotate(a);
    if (sk < 0.5) { // 가운데가 오목한 원반(옆에서 비스듬히)
      const g = c.createRadialGradient(0, 0, r * 0.2, 0, 0, r); g.addColorStop(0, '#e98a86'); g.addColorStop(0.55, '#c8322f'); g.addColorStop(1, '#8e1a1c');
      c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, r, r * lerp(0.62, 0.4, sk * 2), 0, 0, TAU); c.fill();
      c.fillStyle = 'rgba(250,190,180,.6)'; c.beginPath(); c.ellipse(0, 0, r * 0.38, r * 0.18, 0, 0, TAU); c.fill();
    } else { // 낫 모양(초승달)
      const k = (sk - 0.5) * 2, g = c.createLinearGradient(0, -r, 0, r * 0.4); g.addColorStop(0, '#c8322f'); g.addColorStop(1, '#7d1416');
      c.fillStyle = g; c.beginPath(); c.ellipse(0, r * 0.25, r * 1.3, r * 0.85, 0, Math.PI, TAU); c.ellipse(0, r * 0.25, r * 1.3, r * lerp(0.6, 0.3, k), 0, 0, Math.PI, true); c.closePath(); c.fill();
      c.strokeStyle = 'rgba(60,0,0,.5)'; c.lineWidth = 1; c.stroke();
    }
    c.restore();
  }
  function pill(c, x, y, w, h, fill, stroke, lw = 2) { c.beginPath(); c.roundRect(x, y, w, h, Math.min(10, h / 2)); c.fillStyle = fill; c.fill(); if (stroke) { c.strokeStyle = stroke; c.lineWidth = lw; c.stroke(); } }

  function mount(root) {
    const stage = root.querySelector('.fl-stage'), chip = root.querySelector('.fl-now'), out = root.querySelector('.fl-out'), photo = root.querySelector('.fl-photo');
    let t, tpl, sel, col, lightT, alb, sick, mel, sk, cells, seen, msg, outMsg, pre;
    function reset() {
      t = 0; tpl = ORIG.slice(); sel = 4; col = 1; lightT = 9; alb = false; sick = false; mel = 1; sk = 0; msg = ''; outMsg = null;
      seen = { white: false, back: false, alb: false, sick: false }; pre = [];
      cells = Array.from({ length: 9 }, (_, i) => ({ u: i / 9, a: Math.random() * TAU, v: 0 }));
      if (photo) photo.hidden = true; steps();
    }
    const say = (h) => { if (h !== msg) { msg = h; chip.innerHTML = h; } };
    const tell = (h) => { if (h !== outMsg) { outMsg = h; out.innerHTML = h; } };

    function geo(W, H) {
      const h1 = H * 0.58, cw = 46, gap = 16, gw = 12 * cw + 3 * gap, gx = W * 0.27;
      const colX = (i) => gx + i * cw + Math.floor(i / 3) * gap + cw / 2;
      const yA = h1 * 0.15, yB = h1 * 0.33, yR = h1 * 0.47, yP = h1 * 0.6, yC = h1 * 0.82;
      const cy0 = h1 + 14, ch = H - cy0 - 6, cwid = (W - 30) / 2;
      return { W, H, h1, cw, gx, gw, colX, yA, yB, yR, yP, yC, fl: { x: W * 0.12, y: h1 * 0.32, R: Math.min(W * 0.1, h1 * 0.27), base: h1 * 0.88 },
        undo: { x: gx + gw + 16, y: yB - 18, w: W - (gx + gw + 16) - 12, h: 36 },
        nodes: [0, 1, 2, 3].map((i) => ({ x: lerp(gx + 50, W - 70, i / 3), y: yC })),
        A: { x: 10, y: cy0, w: cwid, h: ch }, B: { x: 20 + cwid, y: cy0, w: cwid, h: ch } };
    }
    const tileA = (g) => ({ x: g.A.x + 14, y: g.A.y + 44, w: 150, h: 96 });
    const tileB = (g) => ({ x: g.B.x + 14, y: g.B.y + 44, w: 168, h: 96 });
    const inR = (p, r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;

    function flip(i) {
      tpl[i] = NEXT[tpl[i]]; sel = i; lightT = 0;
      const r = read(tpl), k = Math.floor(i / 3);
      if (!r.works) seen.white = true; else if (seen.white && r.kind === 'normal') seen.back = true;
      const cod = `<b>${r.cods[k]}</b>`;
      if (r.kind === 'normal') tell('모든 염기가 <b>처음과 같다</b>. 효소가 제 모양으로 만들어져 붉은 색소가 다시 쌓인다.');
      else if (r.kind === 'silent') tell(`염기는 바뀌었지만 코돈 ${cod}도 <b>${NAME[r.aas[k]]}</b>을(를) 지정한다. 아미노산 순서가 그대로라 효소도 그대로 — 꽃은 <b>붉다</b>.`);
      else if (r.kind === 'miss') tell(`코돈이 ${cod}로 바뀌어 아미노산 <b>${NAME[r.o[r.at]]} → ${NAME[r.aas[r.at]]}</b>. 아미노산 순서가 달라져 효소의 <b>입체 구조</b>가 망가지고, 붉은 색소를 못 만들어 꽃이 <b>하얘진다</b>.`);
      else if (r.kind === 'stop') tell(`코돈 ${cod}는 <b>종결코돈</b> — 번역이 중간에서 멈춰 효소가 짧게 끊긴다. 색소를 못 만들어 꽃이 <b>하얘진다</b>.`);
      else tell(`첫 코돈이 ${cod}로 바뀌어 <b>개시코돈(AUG)</b>이 사라졌다 — 번역이 시작되지 않아 효소가 없다. 꽃이 <b>하얘진다</b>.`);
      steps();
    }
    function revert() {
      if (tpl.every((b, i) => b === ORIG[i])) return;
      tpl = ORIG.slice(); lightT = 0; if (seen.white) seen.back = true;
      tell('유전자를 <b>원래대로</b> 되돌렸다. 정상 효소 → 붉은 색소 → <b>붉은 꽃</b>. 유전자 → 단백질 → 형질로 정보가 흐른다.'); steps();
    }
    function toggleAlb() {
      alb = !alb; seen.alb = true;
      tell(alb ? '<b>멜라닌 합성 효소 유전자</b>에 이상이 생기면 효소를 못 만들어 <b>멜라닌</b>이 생기지 않는다. 털·피부가 하얗고 눈은 핏줄 색이 비쳐 붉게 보인다(<b>백색증</b>).' : '정상 유전자 → 멜라닌 합성 효소 → <b>멜라닌</b> → 털이 갈색, 눈이 검다.');
      steps();
    }
    function toggleSick() {
      sick = !sick; seen.sick = true;
      tell(sick ? '헤모글로빈 유전자의 염기 <b>하나</b>(T→A)가 바뀌어 코돈 <b>GAA → GUA</b>, 아미노산 <b>글루탐산 → 발린</b>. 바뀐 헤모글로빈이 길게 엉겨 붙어 적혈구가 <b>낫 모양</b>이 되고, 모세 혈관에 걸려 산소를 잘 나르지 못한다(<b>빈혈</b>).' : '정상 헤모글로빈 → 가운데가 오목한 <b>원반 모양</b> 적혈구가 모세 혈관을 잘 지나간다.');
      if (photo) photo.hidden = false; steps();
    }
    function steps() {
      const ok = []; if (seen.white) ok.push(1); if (seen.back) ok.push(2); if (seen.alb && seen.sick) ok.push(3);
      const now = [1, 2, 3].find((n) => !ok.includes(n)) || 0;
      window.L1.steps(root, now, ok); window.L1.done(root, now === 0);
    }

    function step(dt) {
      t += dt; lightT += dt;
      const r = read(tpl), tgt = r.works ? 1 : 0;
      if (lightT > 1.6) col += clamp(tgt - col, -dt * 0.8, dt * 0.8);
      mel += clamp((alb ? 0 : 1) - mel, -dt * 0.7, dt * 0.7); sk += clamp((sick ? 1 : 0) - sk, -dt * 0.6, dt * 0.6);
      // 적혈구: 낫 모양일수록 느리고, 좁은 곳에서 걸려 쌓인다
      const narrow = (u) => u > 0.62 && u < 0.78;
      const order = cells.slice().sort((a, b) => b.u - a.u);
      order.forEach((o, i) => {
        let v = lerp(0.16, 0.05, sk); if (sk > 0.5 && narrow(o.u)) v *= 0.15;
        o.u += v * dt; o.a += dt * lerp(1.2, 0.2, sk);
        const ahead = order[i - 1]; if (ahead && ahead.u > o.u && ahead.u - o.u < 0.075 && !(o.u > 0.95)) o.u = Math.max(o.u - v * dt, ahead.u - 0.075);
        if (o.u > 1.05) o.u -= 1.1;
      });
      // 색소가 될 물질이 효소로 흘러 들어간다
      if (Math.random() < dt * 2.4) pre.push({ k: 0, y: (Math.random() - 0.5) * 30 });
      pre.forEach((p) => { p.k += dt * 0.5; }); pre = pre.filter((p) => p.k < 1);
    }

    function draw(c, W, H, dt) {
      const g = geo(W, H); step(dt);
      c.clearRect(0, 0, W, H);
      let gr = c.createLinearGradient(0, 0, 0, g.h1); gr.addColorStop(0, '#fbf6ee'); gr.addColorStop(1, '#f1ebdf'); c.fillStyle = gr; c.fillRect(0, 0, W, g.h1);
      c.fillStyle = '#e8edf0'; c.fillRect(0, g.h1, W, H - g.h1);
      c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, g.h1); c.lineTo(W, g.h1); c.stroke();
      const r = read(tpl);
      // (가) 꽃
      txt(c, '(가) 꽃 색', 16, 30, '#1d2433', F(800, 20), 'left');
      flower(c, g.fl.x, g.fl.y, g.fl.R, col, t, g.fl.base);
      { const lb = col > 0.5 ? '붉은색 꽃' : '흰색 꽃'; c.font = F(800, 18); const w = c.measureText(lb).width + 18; pill(c, g.fl.x - w / 2, g.fl.base - 4, w, 28, '#fff', col > 0.5 ? '#a3182c' : '#6b7280', 2); txt(c, lb, g.fl.x, g.fl.base + 16, col > 0.5 ? '#a3182c' : '#6b7280', F(800, 18)); }
      // 유전자(두 가닥)
      txt(c, '꽃잎 세포 속 · 붉은 색소 합성 효소 유전자(일부)', g.gx, g.yA - 30, '#1d2433', F(800, 18), 'left');
      const x0 = g.colX(0) - g.cw / 2, x1 = g.colX(11) + g.cw / 2;
      [g.yA, g.yB].forEach((yy, s) => { c.strokeStyle = s ? '#3a4688' : '#9aa6cc'; c.lineWidth = 5; c.beginPath(); for (let x = x0 - 10; x <= x1 + 10; x += 6) c.lineTo(x, yy + (s ? 1 : -1) * 18 + Math.sin(x * 0.03 + t * 1.5) * 2); c.stroke(); });
      for (let i = 0; i < 12; i++) {
        const x = g.colX(i), b = tpl[i], top = PAIR[b], ch = b !== ORIG[i], wob = Math.sin(t * 1.5 + x * 0.03) * 2;
        c.strokeStyle = 'rgba(80,90,120,.5)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x, g.yA + 12 + wob); c.lineTo(x, g.yB - 12 + wob); c.stroke();
        pill(c, x - 17, g.yA - 16 + wob, 34, 30, '#fff', BASECOL[top], 2); txt(c, top, x, g.yA + 7 + wob, BASECOL[top], F(800, 20));
        const hot = i === sel && document.activeElement === stage.querySelector('canvas');
        pill(c, x - 19, g.yB - 18 + wob, 38, 36, ch ? '#fff1a8' : '#fff', ch ? '#d9483b' : BASECOL[b], ch ? 3.5 : 2.5);
        if (hot) { c.strokeStyle = '#1d2433'; c.setLineDash([4, 3]); c.lineWidth = 2; c.strokeRect(x - 23, g.yB - 22 + wob, 46, 44); c.setLineDash([]); }
        txt(c, b, x, g.yB + 8 + wob, BASECOL[b], F(800, 22));
      }
      [0, 1, 2, 3].forEach((k) => { const a = g.colX(k * 3) - 20, b = g.colX(k * 3 + 2) + 20; c.strokeStyle = '#6b7280'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(a, g.yB + 26); c.lineTo(a, g.yB + 32); c.lineTo(b, g.yB + 32); c.lineTo(b, g.yB + 26); c.stroke(); });
      txt(c, '← 전사에 쓰이는 가닥', g.undo.x, g.yB + 30, '#3a4688', F(700, 15), 'left');
      // 원래대로
      const U = g.undo, same = tpl.every((b, i) => b === ORIG[i]);
      pill(c, U.x, U.y - 44, U.w, U.h, same ? 'rgba(0,0,0,.04)' : '#fff', same ? '#c9ccd3' : '#1d2433', 2);
      txt(c, '↺ 원래대로', U.x + U.w / 2, U.y - 44 + 24, same ? '#9aa1ad' : '#1d2433', F(800, 17));
      // RNA 코돈과 아미노산
      [0, 1, 2, 3].forEach((k) => {
        const xm = g.colX(k * 3 + 1), cod = r.cods[k], a = r.aas[k], bad = (r.kind === 'miss' && a !== r.o[k]) || (r.kind === 'stop' && k === r.at) || (r.kind === 'nostart' && k === 0);
        const dead = (r.kind === 'stop' && k > r.at) || r.kind === 'nostart';
        pill(c, xm - 62, g.yR - 18, 124, 32, '#f4ecfb', '#8a4fb8', 2);
        [...cod].forEach((ch, j) => txt(c, ch, xm + (j - 1) * 26, g.yR + 6, BASECOL[ch] || '#333', F(800, 20)));
        c.globalAlpha = dead && !(r.kind === 'stop' && k === r.at) ? 0.3 : 1;
        pill(c, xm - 62, g.yP - 16, 124, 30, bad ? '#ffd9d3' : '#fff', bad ? '#d9483b' : '#6b7280', bad ? 3 : 1.5);
        txt(c, NAME[a] + (a === 'M' && k === 0 ? '(시작)' : ''), xm, g.yP + 6, bad ? '#b23a22' : '#1d2433', F(700, a === 'M' ? 14 : 16));
        c.globalAlpha = 1;
        if (k < 3 && !dead) { c.strokeStyle = '#6b7280'; c.lineWidth = 3; c.beginPath(); c.moveTo(xm + 62, g.yP - 1); c.lineTo(g.colX(k * 3 + 4) - 62, g.yP - 1); c.stroke(); }
      });
      txt(c, 'RNA 코돈', g.undo.x, g.yR + 6, '#6e2a96', F(700, 15), 'left');
      txt(c, '아미노산', g.undo.x, g.yP + 6, '#1d2433', F(700, 15), 'left');
      // 흐름: 유전자 → 효소 → 붉은 색소 → 꽃 색
      const Nd = g.nodes, lit = (i) => lightT > i * 0.55, br = !r.works, rN = 40;
      const labels = ['유전자', r.kind === 'nostart' ? '효소 없음' : r.works ? '효소(단백질)' : '망가진 효소', '붉은 색소', col > 0.5 ? '붉은색 꽃' : '흰색 꽃'];
      const arrows = ['전사 · 번역', '효소 작용', '꽃잎에 쌓임'];
      for (let i = 0; i < 3; i++) {
        const a = Nd[i], b = Nd[i + 1], on = lit(i + 1) && !(br && i >= 1), cut = br && i === 1;
        c.strokeStyle = on ? '#2f8a4a' : cut ? '#d9483b' : '#c9ccd3'; c.lineWidth = on ? 5 : 3; c.setLineDash(cut ? [8, 6] : []);
        c.beginPath(); c.moveTo(a.x + rN + 8, a.y); c.lineTo(b.x - rN - 14, b.y); c.stroke(); c.setLineDash([]);
        c.fillStyle = c.strokeStyle; c.beginPath(); c.moveTo(b.x - rN - 4, b.y); c.lineTo(b.x - rN - 18, b.y - 9); c.lineTo(b.x - rN - 18, b.y + 9); c.fill();
        txt(c, arrows[i], (a.x + b.x) / 2, a.y - 14, on ? '#2f6a22' : '#9aa1ad', F(700, 15));
        if (on) { const u = ((t * 0.7 + i * 0.33) % 1), px = lerp(a.x + rN + 8, b.x - rN - 14, u); c.fillStyle = '#ffd84d'; c.beginPath(); c.arc(px, a.y, 6, 0, TAU); c.fill(); c.strokeStyle = '#a87a10'; c.lineWidth = 1.5; c.stroke(); }
        if (cut) { const mx = (a.x + b.x) / 2; c.strokeStyle = '#d9483b'; c.lineWidth = 5; c.beginPath(); c.moveTo(mx - 10, a.y - 10 + 14); c.lineTo(mx + 10, a.y + 10 + 14); c.moveTo(mx + 10, a.y - 10 + 14); c.lineTo(mx - 10, a.y + 10 + 14); c.stroke(); }
      }
      Nd.forEach((n, i) => {
        const on = lit(i) && !(br && i >= 2);
        c.fillStyle = on ? '#fff' : 'rgba(255,255,255,.6)'; c.strokeStyle = on ? '#1d2433' : '#c9ccd3'; c.lineWidth = on ? 2.5 : 1.5; c.beginPath(); c.arc(n.x, n.y, rN, 0, TAU); c.fill(); c.stroke();
        txt(c, labels[i], n.x, n.y + rN + 22, i === 1 && br ? '#b23a22' : '#1d2433', F(800, 16));
      });
      // 아이콘
      { const n = Nd[0]; c.save(); c.beginPath(); c.arc(n.x, n.y, rN - 3, 0, TAU); c.clip();
        for (let s of [1, -1]) { c.strokeStyle = s > 0 ? '#f2c230' : '#b98a14'; c.lineWidth = 3.5; c.beginPath(); for (let x = -rN; x <= rN; x += 3) c.lineTo(n.x + x, n.y + s * 11 * Math.sin(x / 30 * TAU + t * 1.5)); c.stroke(); }
        if (r.kind !== 'normal') { c.fillStyle = '#d9483b'; c.beginPath(); c.arc(n.x + 6, n.y, 6, 0, TAU); c.fill(); }
        c.restore(); }
      { const n = Nd[1], k = r.kind === 'nostart' ? 0 : r.kind === 'stop' ? clamp(r.at / 4, 0.2, 0.6) : 1;
        if (lit(1)) enzyme(c, n.x, n.y + 4, rN * 0.7, r.works, k, t);
        // 색소가 될 물질(옅은 알갱이)이 효소로 들어가 붉은 색소가 되어 나온다
        pre.forEach((p) => {
          const ax = Nd[0].x + rN + 30, k2 = p.k;
          if (k2 < 0.5) { const px = lerp(n.x - 60, n.x - 6, k2 * 2), py = n.y - rN - 6 + p.y * 0.2 - Math.sin(k2 * Math.PI) * 6; if (px > ax) { c.fillStyle = '#efe7d0'; c.strokeStyle = '#a99c78'; c.lineWidth = 1; c.beginPath(); c.arc(px, py, 4.5, 0, TAU); c.fill(); c.stroke(); } }
          else if (r.works && lit(2)) { const px = lerp(n.x + 6, Nd[2].x - 20, (k2 - 0.5) * 2), py = n.y - rN - 6 + Math.sin(k2 * 9) * 3; c.fillStyle = '#d42a3c'; c.beginPath(); c.arc(px, py, 4.5, 0, TAU); c.fill(); }
          else { const px = n.x - 6 - (k2 - 0.5) * 40, py = n.y - rN - 6 - (k2 - 0.5) * 30; c.fillStyle = 'rgba(239,231,208,.8)'; c.beginPath(); c.arc(px, py, 4.5, 0, TAU); c.fill(); }
        }); }
      { const n = Nd[2], m = Math.round(col * 16); for (let i = 0; i < 16; i++) { const a = i * 2.4, rr = 6 + (i % 4) * 6.5; const px = n.x + Math.cos(a + t * 0.3) * rr, py = n.y + Math.sin(a + t * 0.3) * rr * 0.8; c.fillStyle = i < m ? '#d42a3c' : 'rgba(200,200,200,.35)'; c.beginPath(); c.arc(px, py, 4.5, 0, TAU); c.fill(); } }
      { const n = Nd[3]; c.save(); c.beginPath(); c.arc(n.x, n.y, rN - 3, 0, TAU); c.clip(); c.translate(n.x, n.y + 14); for (let i = 0; i < 6; i++) { c.save(); c.rotate((i / 6) * TAU + t * 0.1); petal(c, 30, 10, 1.5, t); c.fillStyle = mix('#fbf8f2', '#d42a3c', col); c.fill(); c.strokeStyle = mix('#c9bfae', '#8e1022', col); c.lineWidth = 1; c.stroke(); c.restore(); } c.restore(); }

      // (나) 카드 둘
      [[g.A, '(나) 백색증 · 멜라닌 합성 효소 유전자'], [g.B, '(나) 낫 모양 적혈구 빈혈증 · 헤모글로빈 유전자']].forEach(([R, s]) => {
        pill(c, R.x, R.y, R.w, R.h, '#fbfcfd', '#1d2433', 2); txt(c, s, R.x + 14, R.y + 28, '#1d2433', F(800, 18), 'left');
      });
      // 백색증
      { const T = tileA(g), on = alb, wob = Math.sin(t * 3) * (seen.alb ? 0 : 2);
        pill(c, T.x, T.y + wob, T.w, T.h, on ? '#fff1a8' : '#fff', on ? '#d9483b' : '#1d2433', 2.5);
        txt(c, '유전자', T.x + T.w / 2, T.y + 22 + wob, '#6b7280', F(700, 14));
        txt(c, on ? '이상' : '정상', T.x + T.w / 2, T.y + 54 + wob, on ? '#b23a22' : '#2f8a4a', F(800, 26));
        txt(c, '눌러 바꾸기', T.x + T.w / 2, T.y + 82 + wob, '#2a73b8', F(700, 14));
        const A = g.A, ex = T.x + T.w + 60, ey = T.y + T.h / 2, cx2 = ex + 100;
        c.strokeStyle = '#6b7280'; c.lineWidth = 3; c.beginPath(); c.moveTo(T.x + T.w + 8, ey); c.lineTo(ex - 32, ey); c.stroke();
        enzyme(c, ex, ey, 24, !alb || mel > 0.5, alb ? clamp(mel, 0, 1) : 1, t); txt(c, '효소', ex, ey + 42, '#1d2433', F(700, 14));
        c.strokeStyle = alb ? '#d9483b' : '#6b7280'; c.setLineDash(alb ? [6, 5] : []); c.beginPath(); c.moveTo(ex + 32, ey); c.lineTo(cx2 - 36, ey); c.stroke(); c.setLineDash([]);
        // 멜라닌을 만드는 세포
        gr = c.createRadialGradient(cx2 - 8, ey - 8, 4, cx2, ey, 32); gr.addColorStop(0, '#fff2e6'); gr.addColorStop(1, '#e6cdb4'); c.fillStyle = gr; c.beginPath(); c.arc(cx2, ey, 32, 0, TAU); c.fill(); c.strokeStyle = '#a07a55'; c.lineWidth = 1.5; c.stroke();
        for (let i = 0; i < 14; i++) { if (i / 14 >= mel) continue; const a = i * 2.3 + t * 0.4, rr = 8 + (i % 3) * 7; c.fillStyle = '#4a2a14'; c.beginPath(); c.ellipse(cx2 + Math.cos(a) * rr, ey + Math.sin(a) * rr, 3.4, 2.2, a, 0, TAU); c.fill(); }
        txt(c, mel > 0.3 ? '멜라닌' : '멜라닌 없음', cx2, ey + 50, '#5a3a22', F(700, 14));
        rabbit(c, A.x + A.w - 70, A.y + A.h - 22, Math.min(1.3, A.h / 170), mel, t);
        txt(c, alb ? '흰 털 · 붉은 눈' : '갈색 털 · 검은 눈', A.x + A.w - 76, A.y + 52, alb ? '#b23a22' : '#5a3a22', F(700, 15));
        txt(c, '페닐케톤뇨증도 효소 유전자 이상으로 생긴다', A.x + 14, A.y + A.h - 14, '#6b7280', F(600, 14), 'left');
      }
      // 낫 모양 적혈구
      { const T = tileB(g), on = sick, wob = Math.sin(t * 3 + 1) * (seen.sick ? 0 : 2), B = g.B;
        pill(c, T.x, T.y + wob, T.w, T.h, on ? '#fff1a8' : '#fff', on ? '#d9483b' : '#1d2433', 2.5);
        const row = (lab, s, y, colr) => { txt(c, lab, T.x + 10, T.y + y + wob, '#6b7280', F(700, 13), 'left'); txt(c, s, T.x + T.w - 10, T.y + y + wob, colr, F(800, 17), 'right'); };
        row('DNA', on ? 'C A T' : 'C T T', 26, on ? '#d9483b' : '#1d2433');
        row('RNA', on ? 'G U A' : 'G A A', 54, '#6e2a96');
        row('아미노산', on ? '발린' : '글루탐산', 82, on ? '#b23a22' : '#1d2433');
        txt(c, '눌러 바꾸기', T.x + T.w / 2, T.y + T.h + 18, '#2a73b8', F(700, 14));
        // 모세 혈관
        const vx0 = T.x + T.w + 24, vx1 = B.x + B.w - 14, vy = T.y + T.h / 2 + 10, vr = (u) => (u > 0.62 && u < 0.78 ? 20 : 30);
        c.fillStyle = '#f6d3cf'; c.strokeStyle = '#b7615a'; c.lineWidth = 2.5; c.beginPath();
        for (let i = 0; i <= 40; i++) { const u = i / 40; c.lineTo(lerp(vx0, vx1, u), vy - vr(u)); } for (let i = 40; i >= 0; i--) { const u = i / 40; c.lineTo(lerp(vx0, vx1, u), vy + vr(u)); } c.closePath(); c.fill(); c.stroke();
        c.save(); c.beginPath(); c.rect(vx0, vy - 40, vx1 - vx0, 80); c.clip();
        cells.forEach((o, i) => { rbc(c, lerp(vx0, vx1, o.u), vy + Math.sin(o.u * 20 + i) * 6 * (1 - sk), 17, sk, sk > 0.5 ? 0.3 * Math.sin(i * 1.7) : Math.sin(o.a) * 0.4); });
        c.restore();
        txt(c, '모세 혈관', vx0 + 6, vy + 54, '#8e3a34', F(700, 14), 'left');
        txt(c, sk > 0.5 ? '낫 모양 적혈구가 좁은 곳에 걸린다' : '원반 모양 적혈구가 잘 흐른다', (vx0 + vx1) / 2 + 30, vy - 44, sk > 0.5 ? '#b23a22' : '#2f6a22', F(700, 14));
      }

      // 지금 할 것
      if (!seen.white) say('꽃잎 세포 속 유전자의 <b>아래 가닥 염기</b>를 하나 눌러 바꿔 보자');
      else if (!seen.back) say(r.works ? '꽃이 붉다 — 다른 염기도 바꾸거나 <b>원래대로</b>를 눌러 보자' : '꽃이 하얘졌다 — <b>원래대로</b>를 누르거나 염기를 되돌려 보자');
      else if (!(seen.alb && seen.sick)) say('아래 <b>(나)</b> 두 유전자 칸을 눌러 사람·동물의 예를 보자');
      else say('<b>유전자 → 단백질 → 형질</b>: 염기 하나가 형질을 바꿀 수 있다');
      if (outMsg === null) tell('꽃이 붉은 것은 꽃잎 세포가 <b>붉은 색소 합성 효소</b>를 만들고, 이 효소가 붉은 색소를 만들기 때문이다. 효소는 단백질이고, 그 설계도는 <b>유전자</b>에 있다.');
    }

    function colAt(g, p) { for (let i = 0; i < 12; i++) if (Math.abs(p.x - g.colX(i)) < g.cw / 2 && Math.abs(p.y - g.yB) < 26) return i; return -1; }
    let press = null;
    reset();
    const S = window.Play.make(stage, {
      draw,
      down(p) { press = p; },
      up(p) {
        if (!press || Math.hypot(p.x - press.x, p.y - press.y) > 14) { press = null; return; }
        press = null; const g = geo(S.W, S.H), i = colAt(g, p);
        if (i >= 0) { flip(i); return; }
        const U = g.undo; if (inR(p, { x: U.x, y: U.y - 44, w: U.w, h: U.h })) { revert(); return; }
        if (inR(p, tileA(g))) { toggleAlb(); return; }
        const tb = tileB(g); if (inR(p, { x: tb.x, y: tb.y, w: tb.w, h: tb.h + 24 })) toggleSick();
      },
      key(e) {
        const k = e.key;
        if (k === 'ArrowLeft') { sel = (sel + 11) % 12; return true; }
        if (k === 'ArrowRight') { sel = (sel + 1) % 12; return true; }
        if (k === ' ' || k === 'Enter') { flip(sel); return true; }
        if (k === 'r' || k === 'R') { revert(); return true; }
        if (k === 'a' || k === 'A') { toggleAlb(); return true; }
        if (k === 's' || k === 'S') { toggleSick(); return true; }
        if (k === '0') { reset(); return true; }
        return false;
      },
    });
    root.querySelector('.fl-reset').addEventListener('click', () => { reset(); S.kick(); });
    const state = () => { const r = read(tpl); return { tpl: tpl.join(''), cods: r.cods.join(' '), kind: r.kind, col: +col.toFixed(2), mel: +mel.toFixed(2), sk: +sk.toFixed(2), seen: { ...seen }, msg, out: out.textContent }; };
    root._fl = {
      flip: (i) => { flip(i); S.kick(); return state(); }, revert: () => { revert(); S.kick(); return state(); },
      alb: () => { toggleAlb(); S.kick(); return state(); }, sick: () => { toggleSick(); S.kick(); return state(); },
      run: (sec) => { for (let i = 0; i < sec * 60; i++) step(1 / 60); S.kick(); return state(); },
      hit: (name, i = 0) => { const g = geo(S.W, S.H); if (name === 'base') return { x: g.colX(i), y: g.yB }; if (name === 'undo') return { x: g.undo.x + g.undo.w / 2, y: g.undo.y - 26 }; const T = name === 'alb' ? tileA(g) : tileB(g); return { x: T.x + T.w / 2, y: T.y + T.h / 2 }; },
      state, reset: () => { reset(); S.kick(); }, read: (s) => read(s.split('')),
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Flower = { mount };
})();
