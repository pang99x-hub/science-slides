/* 3-3 4차시 체험 «모든 생물의 같은 사전»(교과서 156쪽 해 보기 유전부호의 특징 추론하기 · 157쪽 사고력
   + 참고서 내용: 유전부호 체계의 공통성, 공통조상, 대장균으로 사람 인슐린 만들기(플라스미드·재조합 DNA), 생장 호르몬, 개시·종결코돈,
   한 아미노산을 여러 코돈이 정함, «생물종마다 고유한 유전부호 ×»).
   네 귀퉁이에 사람·대장균·벼·초파리 카드(각자 라이보솜), 가운데 위 RNA 띠 받침, 코돈 사전(12칸), 아래 비교 줄 넷.
   ① RNA 띠를 끌어 생물 카드에 놓으면 그 생물의 라이보솜이 코돈씩 읽어 아미노산 구슬을 비교 줄에 내놓는다.
   ② 코돈 사전 칸(또는 비교 줄 위 코돈)을 누르면 그 칸이 커지며 뜻·같은 뜻의 코돈이 나오고, 비교 줄의 그 열이 밝아진다.
   ③ 사람 카드의 인슐린 유전자를 대장균 카드로 끌면 플라스미드에 끼워 넣는 과정과 대장균이 사람 인슐린을 만드는 모습.
   Universal.mount(root) → { fit, setActive } · 시험용: root._un.put(생물) · zoom(코돈) · insulin() · state() · geo() */
(function () {
  'use strict';
  const CODE = 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG', B4 = 'UCAG';
  const aa = (c) => CODE[B4.indexOf(c[0]) * 16 + B4.indexOf(c[1]) * 4 + B4.indexOf(c[2])];
  const ALL = []; for (const a of B4) for (const b of B4) for (const c of B4) ALL.push(a + b + c);
  const KO = { F: '페닐알라닌', L: '류신', S: '세린', Y: '타이로신', C: '시스테인', W: '트립토판', P: '프롤린', H: '히스티딘', Q: '글루타민', R: '아르지닌', I: '아이소류신', M: '메싸이오닌', T: '트레오닌', N: '아스파라진', K: '라이신', V: '발린', A: '알라닌', D: '아스파트산', E: '글루탐산', G: '글라이신', '*': '종결' };
  const AAC = { M: '#e8574a', A: '#f2a53a', W: '#8a5cc7', K: '#3c8fd6', G: '#4cae5b', F: '#e05fa1', H: '#2fa9a0', E: '#c99a12', V: '#6f8796', Y: '#b5651d', R: '#2b5fa8', '*': '#9aa0a8' };
  const BCOL = { A: '#ffd84d', U: '#f07ab4', G: '#5cc77a', C: '#5aa9f0' };
  // 이해를 돕기 위한 예: 같은 RNA 띠
  const STRIP = ['AUG', 'GCU', 'UGG', 'AAA', 'GGC', 'UAA'];
  const DICT = ['AUG', 'GCU', 'UGG', 'AAA', 'GGC', 'UAA', 'UUU', 'CAU', 'GAA', 'GUA', 'UAU', 'CGU'];
  const syn = (c) => ALL.filter((x) => aa(x) === aa(c));
  console.assert(ALL.length === 64 && STRIP.map(aa).join('') === 'MAWKG*' && syn('GCU').length === 4 && syn('UAA').join() === 'UAA,UAG,UGA' && syn('AUG').length === 1 && aa('GUA') === 'V' && aa('CGU') === 'R' && ALL.filter((c) => aa(c) !== '*').length === 61, 'universal: 표준 유전부호');
  const ORG = [
    { k: 'human', name: '사람', kind: '동물' }, { k: 'ecoli', name: '대장균', kind: '세균' },
    { k: 'rice', name: '벼', kind: '식물' }, { k: 'fly', name: '초파리', kind: '곤충' },
  ];
  const KEYS = 'qwerasdfzxcv';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), ease = (k) => (k <= 0 ? 0 : k >= 1 ? 1 : 1 - (1 - k) * (1 - k));
  const inR = (p, r) => r && p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h;
  const FONT = '"IBM Plex Sans KR", sans-serif';

  function mount(root) {
    const stage = root.querySelector('.un-stage'), cv = stage.querySelector('canvas'), chip = root.querySelector('.un-now'), out = root.querySelector('.un-out'), think = root.querySelector('.un-think');
    let o, ok, seen, zoom, ins, showProc, drag, t, msg, G;
    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };
    function reset() {
      o = Object.fromEntries(ORG.map((q) => [q.k, { res: [], tl: null, fly: [], n: 0 }]));
      ok = new Set(); seen = new Set(); zoom = null; ins = null; showProc = false; drag = null; t = 0;
      think.classList.remove('open');
      say('가운데 위 <b>RNA 띠</b>를 끌어 생물 카드에 놓아 보자. 그 생물의 <b>라이보솜</b>이 띠를 읽어 단백질을 만든다');
      steps();
    }

    // ── 자리 잡기 ──
    function geo() {
      const W = S.W, H = S.H, g = 12, cw = Math.round(clamp(W * 0.235, 200, 262)), ch = (H - 3 * g) / 2;
      const cards = { human: { x: g, y: g }, ecoli: { x: W - g - cw, y: g }, rice: { x: g, y: 2 * g + ch }, fly: { x: W - g - cw, y: 2 * g + ch } };
      Object.values(cards).forEach((r) => { r.w = cw; r.h = ch; r.rx = r.x + r.w / 2; r.ry = r.y + r.h - 46; });
      const x0 = cw + 2 * g, x1 = W - cw - 2 * g, cwid = x1 - x0;
      const disp = { x: x0, y: g, w: cwid, h: 74 };
      const tile = Math.min(24, (cwid - 40 - 5 * 8) / 18);
      const dictY = disp.y + disp.h + 10, gw = (cwid - 24) / 4, gh = 60;
      const cells = DICT.map((c, i) => ({ c, x: x0 + (i % 4) * (gw + 8), y: dictY + 30 + Math.floor(i / 4) * (gh + 7), w: gw, h: gh }));
      const area = { x: x0, y: dictY + 30, w: cwid, h: 3 * gh + 14 };
      const cmpY = area.y + area.h + 14, lab = 74, sw = (cwid - lab) / 6, rh = clamp((H - 64 - cmpY - 26) / 4, 40, 60);
      const cols = STRIP.map((c, i) => ({ c, x: x0 + lab + i * sw, w: sw }));
      const rows = ORG.map((q, i) => ({ k: q.k, y: cmpY + 26 + i * rh, h: rh }));
      return { W, H, cards, x0, x1, cwid, disp, tile, dictY, cells, area, cmpY, lab, sw, rh, cols, rows };
    }
    const geneR = () => { const r = G.cards.human; return { x: r.x + 10, y: r.y + r.h * 0.56, w: r.w - 20, h: 34 }; };

    // ── 그림 도구 ──
    function rr(c, x, y, w, h, r) { c.beginPath(); c.roundRect(x, y, w, h, r); }
    function txt(c, s, x, y, f = '700 16px', col = '#1d2433', al = 'center') { c.fillStyle = col; c.font = `${f} ${FONT}`; c.textAlign = al; c.textBaseline = 'middle'; c.fillText(s, x, y); }
    function bead(c, x, y, r, k) {
      const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r); g.addColorStop(0, '#fff'); g.addColorStop(0.25, AAC[k]); g.addColorStop(1, shade(AAC[k], -0.35));
      c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.strokeStyle = shade(AAC[k], -0.5); c.lineWidth = 1.2; c.stroke();
    }
    function shade(h, k) { const n = parseInt(h.slice(1), 16), f = (v) => clamp(Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k), 0, 255); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; }
    function codonTiles(c, cod, x, y, s, hl) {
      [...cod].forEach((b, i) => {
        const X = x + i * s; rr(c, X + 1, y, s - 2, s, 4); c.fillStyle = BCOL[b]; c.fill(); c.strokeStyle = hl ? '#1d2433' : 'rgba(29,36,51,.55)'; c.lineWidth = hl ? 2 : 1; c.stroke();
        txt(c, b, X + s / 2, y + s / 2 + 1, `800 ${Math.round(s * 0.62)}px`, '#1d2433');
      });
    }
    // RNA 띠: 위에 당-인산 뼈대(청록), 아래로 염기 칸
    function strip(c, x, y, s, upto = 6, clip) {
      const gap = s * 0.35, w = 18 * s + 5 * gap;
      c.save(); if (clip) { c.beginPath(); c.rect(clip.x, clip.y, clip.w, clip.h); c.clip(); }
      c.fillStyle = '#2a9d8f'; rr(c, x - 4, y - s * 0.36, w + 8, s * 0.3, s * 0.15); c.fill();
      STRIP.slice(0, upto).forEach((cod, i) => codonTiles(c, cod, x + i * (3 * s + gap), y, s));
      c.restore(); return w;
    }
    const stripW = (s) => 18 * s + 5 * s * 0.35;
    function ribo(c, x, y, s = 1, glow = 0) {
      if (glow) { c.fillStyle = `rgba(255,216,77,${0.35 * glow})`; c.beginPath(); c.ellipse(x, y, 52 * s, 40 * s, 0, 0, 7); c.fill(); }
      let g = c.createRadialGradient(x - 10 * s, y - 22 * s, 2, x, y - 12 * s, 38 * s); g.addColorStop(0, '#8e93e0'); g.addColorStop(1, '#353a8c');
      c.fillStyle = g; c.beginPath(); c.ellipse(x, y - 12 * s, 36 * s, 21 * s, 0, 0, 7); c.fill();
      g = c.createRadialGradient(x - 8 * s, y + 10 * s, 2, x, y + 14 * s, 30 * s); g.addColorStop(0, '#b3b7f0'); g.addColorStop(1, '#5c62bd');
      c.fillStyle = g; c.beginPath(); c.ellipse(x, y + 15 * s, 29 * s, 12 * s, 0, 0, 7); c.fill();
    }
    // ── 생물 그림(160 단위 상자 안, 가운데 0,0) ──
    const ART = {
      human(c) {
        let g = c.createLinearGradient(0, 20, 0, 80); g.addColorStop(0, '#5b93d3'); g.addColorStop(1, '#2d5b94');
        c.fillStyle = g; c.beginPath(); c.moveTo(-66, 80); c.bezierCurveTo(-64, 40, -52, 28, -20, 22); c.lineTo(20, 22); c.bezierCurveTo(52, 28, 64, 40, 66, 80); c.closePath(); c.fill();
        c.fillStyle = '#e2a982'; c.beginPath(); c.moveTo(-12, 6); c.lineTo(12, 6); c.lineTo(14, 26); c.lineTo(0, 36); c.lineTo(-14, 26); c.closePath(); c.fill();
        c.fillStyle = '#e7edf6'; c.beginPath(); c.moveTo(-16, 22); c.lineTo(0, 38); c.lineTo(-6, 46); c.lineTo(-22, 26); c.closePath(); c.fill(); c.beginPath(); c.moveTo(16, 22); c.lineTo(0, 38); c.lineTo(6, 46); c.lineTo(22, 26); c.closePath(); c.fill();
        c.fillStyle = '#e9b48f'; [-1, 1].forEach((k) => { c.beginPath(); c.ellipse(29 * k, -18, 6, 10, 0, 0, 7); c.fill(); });
        g = c.createRadialGradient(-8, -30, 4, 0, -20, 40); g.addColorStop(0, '#fbe0c6'); g.addColorStop(1, '#e3a77f');
        c.fillStyle = g; c.beginPath(); c.ellipse(0, -20, 28, 34, 0, 0, 7); c.fill();
        c.fillStyle = '#3a2a22'; c.beginPath(); c.moveTo(-30, -16); c.bezierCurveTo(-34, -52, -6, -64, 10, -58); c.bezierCurveTo(30, -54, 36, -36, 30, -14); c.bezierCurveTo(26, -30, 16, -40, -2, -40); c.bezierCurveTo(-16, -38, -24, -30, -30, -16); c.fill();
        c.fillStyle = '#2b2522'; [-1, 1].forEach((k) => { c.beginPath(); c.ellipse(10 * k, -18, 3, 3.6, 0, 0, 7); c.fill(); });
        c.strokeStyle = '#5a3a2a'; c.lineWidth = 2.2; c.lineCap = 'round'; [-1, 1].forEach((k) => { c.beginPath(); c.moveTo(5 * k, -27); c.lineTo(15 * k, -28); c.stroke(); });
        c.strokeStyle = '#b5745a'; c.beginPath(); c.moveTo(0, -14); c.lineTo(-3, -4); c.lineTo(1, -3); c.stroke();
        c.strokeStyle = '#a4513e'; c.beginPath(); c.arc(0, 0, 8, 0.25, Math.PI - 0.25); c.stroke();
      },
      ecoli(c, t) {
        c.strokeStyle = '#6c7d4a'; c.lineWidth = 1.6;
        for (let j = 0; j < 3; j++) { c.beginPath(); for (let x = 0; x <= 34; x += 2) { const X = 54 + x, Y = -12 + j * 12 + 5 * Math.sin(x * 0.35 - t * 6 + j); x ? c.lineTo(X, Y) : c.moveTo(X, Y); } c.stroke(); }
        c.lineWidth = 1; for (let i = 0; i < 14; i++) { const a = i / 14 * 6.28, x = Math.cos(a) * 58, y = Math.sin(a) * 26; c.beginPath(); c.moveTo(x, y); c.lineTo(x * 1.12, y * 1.25); c.stroke(); }
        const g = c.createLinearGradient(0, -28, 0, 28); g.addColorStop(0, '#c4e8a8'); g.addColorStop(0.5, '#86c46a'); g.addColorStop(1, '#4e8d42');
        rr(c, -58, -27, 116, 54, 27); c.fillStyle = g; c.fill(); c.strokeStyle = '#356b2e'; c.lineWidth = 2.4; c.stroke();
        c.strokeStyle = 'rgba(40,80,40,.6)'; c.lineWidth = 2; c.beginPath(); for (let x = -36; x <= 30; x += 3) { const y = 7 * Math.sin(x * 0.3) + 3 * Math.cos(x * 0.7); x === -36 ? c.moveTo(x, y) : c.lineTo(x, y); } c.stroke();
        c.strokeStyle = '#2f6d8a'; c.lineWidth = 1.8; [[-38, -12], [34, 12]].forEach(([x, y]) => { c.beginPath(); c.arc(x, y, 5, 0, 7); c.stroke(); });
        c.fillStyle = 'rgba(255,255,255,.35)'; rr(c, -46, -21, 70, 9, 5); c.fill();
      },
      rice(c, t) {
        c.fillStyle = '#9b7b55'; rr(c, -70, 64, 140, 14, 6); c.fill();
        const sway = 3 * Math.sin(t * 1.2);
        [[-30, -0.22], [-14, -0.1], [0, 0], [14, 0.1], [30, 0.22]].forEach(([x, a], i) => {
          c.strokeStyle = i % 2 ? '#4f9a44' : '#3f8a3a'; c.lineWidth = 3; c.beginPath(); c.moveTo(x * 0.5, 66); c.quadraticCurveTo(x * 0.8, 10, x + sway, -40 + Math.abs(x) * 0.6); c.stroke();
          const g = c.createLinearGradient(0, 60, 0, -30); g.addColorStop(0, '#3f8a3a'); g.addColorStop(1, '#8fd078'); c.fillStyle = g;
          c.beginPath(); c.moveTo(x * 0.55, 64); c.quadraticCurveTo(x * 2.2 + (x ? 0 : 20), 20, x * 2.6 + 6 + sway, -12 - i * 3); c.quadraticCurveTo(x * 1.8 + 2, 24, x * 0.55 + 4, 64); c.fill();
        });
        [[-30, -40], [0, -48], [30, -40]].forEach(([x0, y0], j) => {
          const X = x0 + sway, dir = j === 0 ? -1 : 1; c.strokeStyle = '#b08a2e'; c.lineWidth = 1.6; c.beginPath(); c.moveTo(X, y0); c.quadraticCurveTo(X + 22 * dir, y0 - 22, X + 32 * dir, y0 + 6); c.stroke();
          for (let i = 0; i < 9; i++) { const u = i / 8, gx = X + (1 - (1 - u) * (1 - u)) * 32 * dir, gy = y0 - 22 * Math.sin(u * 2.4) + u * 8; const g = c.createRadialGradient(gx - 1, gy - 1, 0.5, gx, gy, 5); g.addColorStop(0, '#fff3b8'); g.addColorStop(1, '#d6a531'); c.fillStyle = g; c.beginPath(); c.ellipse(gx + 3 * dir, gy + 2, 3.2, 5.4, 0.6 * dir, 0, 7); c.fill(); }
        });
      },
      fly(c, t) {
        const fl = 0.06 * Math.sin(t * 30);
        c.strokeStyle = '#3d2a1a'; c.lineWidth = 2; c.lineCap = 'round';
        [-1, 1].forEach((k) => [[-6, -18, -30], [2, -26, 4], [10, -24, 34]].forEach(([y, dx, dy]) => { c.beginPath(); c.moveTo(6 * k, y); c.lineTo(k * (16 - dx * 0.4), y + dy * 0.35); c.lineTo(k * (26 - dx * 0.1), y + dy * 0.8); c.stroke(); }));
        [-1, 1].forEach((k) => {
          c.save(); c.translate(6 * k, -4); c.rotate(k * (0.5 + fl)); const g = c.createLinearGradient(0, 0, 0, 60); g.addColorStop(0, 'rgba(225,235,245,.85)'); g.addColorStop(1, 'rgba(190,205,220,.55)');
          c.fillStyle = g; c.beginPath(); c.ellipse(0, 30, 13, 34, 0, 0, 7); c.fill(); c.strokeStyle = 'rgba(80,90,110,.7)'; c.lineWidth = 1; c.stroke();
          c.beginPath(); c.moveTo(0, 0); c.lineTo(-4, 58); c.moveTo(0, 6); c.lineTo(6, 52); c.moveTo(-3, 30); c.lineTo(5, 34); c.stroke(); c.restore();
        });
        let g = c.createRadialGradient(-4, 30, 2, 0, 34, 22); g.addColorStop(0, '#e7c27a'); g.addColorStop(1, '#8c6630');
        c.fillStyle = g; c.beginPath(); c.ellipse(0, 34, 13, 24, 0, 0, 7); c.fill();
        c.strokeStyle = '#4a3214'; c.lineWidth = 3; for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(0, 26 + i * 9, 12 - i * 1.5, 2.5, 0, 0, Math.PI); c.stroke(); }
        g = c.createRadialGradient(-3, -8, 2, 0, -4, 16); g.addColorStop(0, '#c9a060'); g.addColorStop(1, '#7a5426'); c.fillStyle = g; c.beginPath(); c.ellipse(0, -4, 13, 14, 0, 0, 7); c.fill();
        c.fillStyle = '#a07a40'; c.beginPath(); c.ellipse(0, -26, 11, 9, 0, 0, 7); c.fill();
        [-1, 1].forEach((k) => { g = c.createRadialGradient(9 * k - 1, -29, 1, 9 * k, -27, 8); g.addColorStop(0, '#ff7a6a'); g.addColorStop(1, '#a3150e'); c.fillStyle = g; c.beginPath(); c.ellipse(9 * k, -27, 7, 8, 0, 0, 7); c.fill(); });
        c.strokeStyle = '#3d2a1a'; c.lineWidth = 1.5; [-1, 1].forEach((k) => { c.beginPath(); c.moveTo(3 * k, -34); c.lineTo(6 * k, -42); c.stroke(); });
      },
    };
    function art(c, k, x, y, w, h) { const s = Math.min(w, h) / 160; c.save(); c.translate(x + w / 2, y + h / 2); c.scale(s, s); ART[k](c, t); c.restore(); }

    // ── 그리기 ──
    function draw(c, W, H, dt) {
      t += dt; G = geo(); step(dt);
      c.clearRect(0, 0, W, H);
      ORG.forEach((q) => drawCard(c, q));
      drawDisp(c); if (showProc && ins) drawProc(c); else drawDict(c); drawCmp(c);
      if (drag) {
        if (drag.kind === 'rna') { c.save(); c.globalAlpha = 0.92; strip(c, drag.x - stripW(15) / 2, drag.y - 7, 15); c.restore(); }
        else { drawGene(c, drag.x - 60, drag.y - 14, 120, 28, 1); }
      }
    }
    function drawCard(c, q) {
      const r = G.cards[q.k], st = o[q.k], over = drag && inR(drag, r), lit = (drag && drag.kind === 'rna') || (drag && drag.kind === 'gene' && q.k === 'ecoli');
      rr(c, r.x, r.y, r.w, r.h, 14); c.fillStyle = over ? '#fff6cf' : '#fbfcf9'; c.fill(); c.lineWidth = over ? 4 : lit ? 3 : 2; c.strokeStyle = over ? '#c98a12' : lit ? '#d7a520' : '#1d2433'; c.setLineDash(lit && !over ? [8, 6] : []); c.stroke(); c.setLineDash([]);
      txt(c, q.name, r.x + 14, r.y + 22, '800 21px', '#1d2433', 'left'); txt(c, q.kind, r.x + r.w - 14, r.y + 22, '600 15px', '#5b6577', 'right');
      const ih = r.h * 0.45; art(c, q.k, r.x + 10, r.y + 36, r.w - 20, ih);
      if (q.k === 'ecoli' && ins) drawColony(c, r);
      // 라이보솜과 지나가는 띠
      const rx = r.rx, ry = r.ry, s = Math.min(1, r.w / 240);
      if (st.tl) { const sw = 3 * 16 + 16 * 0.35, x = rx - 24 - st.tl.pos * sw; strip(c, x, ry - 6, 16, 6, { x: r.x + 4, y: r.y, w: r.w - 8, h: r.h }); }
      ribo(c, rx, ry, s, over ? 0.6 + 0.4 * Math.sin(t * 8) : 0);
      txt(c, '라이보솜', rx, ry + 34 * s + 4, '600 14px', '#353a8c');
      if (st.tl && st.tl.c < 6) { const A = aa(STRIP[st.tl.c]); txt(c, `${STRIP[st.tl.c]} → ${KO[A]}`, rx, ry - 40 * s, '800 15px', A === '*' ? '#6b7280' : shade(AAC[A], -0.35)); }
      else if (st.n) txt(c, `읽은 횟수 ${st.n}`, rx, ry - 40 * s, '600 14px', '#5b6577');
      if (q.k === 'human' && ok.has(2)) drawGene(c, ...Object.values(geneR()), ins ? 0.35 : 1);
    }
    function drawGene(c, x, y, w, h, a) {
      c.save(); c.globalAlpha = a; const pulse = a === 1 && !drag ? 0.5 + 0.5 * Math.sin(t * 5) : 0;
      if (pulse) { rr(c, x - 4, y - 4, w + 8, h + 8, 10); c.fillStyle = `rgba(255,216,77,${0.5 * pulse})`; c.fill(); }
      rr(c, x, y, w, h, 8); c.fillStyle = '#fff1df'; c.fill(); c.strokeStyle = '#c0661c'; c.lineWidth = 2; c.stroke();
      c.strokeStyle = '#9b6fd6'; c.lineWidth = 2; for (let k = 0; k < 2; k++) { c.beginPath(); for (let i = 0; i <= 30; i++) { const X = x + 6 + i * 1.3, Y = y + h / 2 + Math.sin(i * 0.5 + k * Math.PI) * h * 0.28; i ? c.lineTo(X, Y) : c.moveTo(X, Y); } c.stroke(); }
      txt(c, '인슐린 유전자', x + 50 + (w - 50) / 2, y + h / 2 + 1, '800 14px', '#8a3d0c'); c.restore();
    }
    function drawDisp(c) {
      const d = G.disp; rr(c, d.x, d.y, d.w, d.h, 12); c.fillStyle = '#eef7f5'; c.fill(); c.strokeStyle = '#2a9d8f'; c.lineWidth = 2; c.setLineDash([7, 5]); c.stroke(); c.setLineDash([]);
      txt(c, 'RNA 띠 · 끌어서 생물 카드에 놓기', d.x + 12, d.y + 15, '700 15px', '#12665d', 'left');
      const s = G.tile, w = stripW(s), bob = 2 * Math.sin(t * 2.5);
      strip(c, d.x + (d.w - w) / 2, d.y + 34 + bob, s);
    }
    function drawDict(c) {
      const A = G.area;
      txt(c, '코돈 사전 · 64칸 가운데 12칸', A.x, G.dictY + 12, '800 18px', '#1d2433', 'left');
      txt(c, '염기 1개 4가지 ✗ · 2개 16가지 ✗ · 3개 64가지 ✓', A.x + A.w, G.dictY + 12, '600 14px', '#5b6577', 'right');
      G.cells.forEach((q, i) => {
        const A2 = aa(q.c), inS = STRIP.includes(q.c), sel = zoom && zoom.c === q.c;
        rr(c, q.x, q.y, q.w, q.h, 9); c.fillStyle = sel ? '#fff6cf' : '#fff'; c.fill(); c.strokeStyle = inS ? '#1d2433' : '#9aa3b2'; c.lineWidth = inS ? 2 : 1.4; c.stroke();
        const ts = Math.min(20, (q.w - 16) / 3); codonTiles(c, q.c, q.x + (q.w - 3 * ts) / 2, q.y + 6, ts);
        if (A2 !== '*') bead(c, q.x + 14, q.y + q.h - 14, 6, A2);
        txt(c, A2 === '*' ? '종결코돈' : KO[A2] + (q.c === 'AUG' ? '·개시' : ''), q.x + q.w / 2 + (A2 === '*' ? 0 : 6), q.y + q.h - 14, '700 14px', '#1d2433');
        txt(c, KEYS[i].toUpperCase(), q.x + q.w - 7, q.y + 9, '600 10px', '#a0a7b4', 'right');
      });
      if (zoom) drawZoom(c);
    }
    function drawZoom(c) {
      const A = G.area, f = G.cells.find((q) => q.c === zoom.c) || { x: A.x + A.w / 2, y: A.y + A.h / 2, w: 0, h: 0 }, u = ease(zoom.u);
      const x = f.x + (A.x - f.x) * u, y = f.y + (A.y - f.y) * u, w = f.w + (A.w - f.w) * u, h = f.h + (A.h - f.h) * u;
      c.save(); c.shadowColor = 'rgba(29,36,51,.3)'; c.shadowBlur = 14; rr(c, x, y, w, h, 14); c.fillStyle = '#fffdf3'; c.fill(); c.restore();
      rr(c, x, y, w, h, 14); c.strokeStyle = '#1d2433'; c.lineWidth = 2.5; c.stroke();
      if (u < 0.85) return;
      const cod = zoom.c, A2 = aa(cod), ss = syn(cod).filter((z) => z !== cod);
      codonTiles(c, cod, x + 18, y + 16, 40, true);
      txt(c, '→', x + 158, y + 36, '800 28px', '#1d2433');
      if (A2 !== '*') { bead(c, x + 196, y + 36, 17, A2); txt(c, KO[A2], x + 222, y + 36, '800 26px', '#1d2433', 'left'); } else txt(c, '종결코돈 · 아미노산 없음', x + 182, y + 36, '800 22px', '#4b5563', 'left');
      const line2 = cod === 'AUG' ? '개시코돈 — 번역은 늘 여기서 시작, 메싸이오닌을 정하는 코돈은 이것 하나' : A2 === '*' ? `번역을 멈추게 한다 — ${ss.join('·')}도 종결코돈` : ss.length ? `같은 ${KO[A2]}: ${ss.join(' · ')} (코돈 64가지, 아미노산 약 20가지)` : `${KO[A2]}을(를) 정하는 코돈은 이것 하나`;
      txt(c, line2, x + 18, y + 84, '700 15px', '#384255', 'left');
      txt(c, '사람·대장균·벼·초파리 모두 같은 뜻', x + 18, y + 116, '800 17px', '#2f7a3d', 'left');
      ORG.forEach((q, i) => { const X = x + 18 + i * Math.min(110, (w - 36) / 4); art(c, q.k, X, y + 132, 44, 44); txt(c, '✓', X + 52, y + 156, '800 20px', '#2f7a3d'); });
      txt(c, '누르면 닫힘', x + w - 12, y + h - 12, '600 12px', '#8a93a3', 'right');
    }
    function drawCmp(c) {
      const y0 = G.cmpY, x0 = G.x0;
      txt(c, '비교', x0, y0 + 12, '800 16px', '#1d2433', 'left');
      const z = zoom && STRIP.indexOf(zoom.c), all = ORG.every((q) => o[q.k].res.length === 6);
      G.cols.forEach((q, i) => {
        if (z === i) { rr(c, q.x + 2, y0, q.w - 4, 26 + 4 * G.rh, 8); c.fillStyle = 'rgba(255,216,77,.45)'; c.fill(); }
        const ts = Math.min(15, (q.w - 8) / 3); codonTiles(c, q.c, q.x + (q.w - 3 * ts) / 2, y0 + 4, ts);
      });
      G.rows.forEach((r, j) => {
        const st = o[r.k]; if (j % 2 === 0) { c.fillStyle = 'rgba(29,36,51,.04)'; c.fillRect(x0, r.y, G.cwid, r.h); }
        art(c, r.k, x0, r.y + 2, 30, r.h - 4); txt(c, ORG[j].name, x0 + 33, r.y + r.h / 2, '700 14px', '#1d2433', 'left');
        G.cols.forEach((q, i) => {
          const A2 = st.res[i]; if (!A2) { c.strokeStyle = '#c9ccd3'; c.setLineDash([3, 3]); c.beginPath(); c.arc(q.x + q.w / 2, r.y + r.h * 0.38, 9, 0, 7); c.stroke(); c.setLineDash([]); return; }
          if (A2 === '*') txt(c, '■ 종결', q.x + q.w / 2, r.y + r.h * 0.42, '700 13px', '#6b7280');
          else { bead(c, q.x + q.w / 2, r.y + r.h * 0.36, Math.min(11, r.h * 0.22), A2); txt(c, KO[A2], q.x + q.w / 2, r.y + r.h * 0.8, '700 13px', '#1d2433'); }
        });
        st.fly.forEach((f) => { const q = G.cols[f.i], from = G.cards[r.k], u = ease(f.u); const X = from.rx + (q.x + q.w / 2 - from.rx) * u, Y = from.ry - 20 + (r.y + r.h * 0.36 - from.ry + 20) * u - Math.sin(u * Math.PI) * 40; if (f.k !== '*') bead(c, X, Y, 10, f.k); });
      });
      if (all) { const yb = G.rows[3].y + G.rh + 2; txt(c, '네 줄 모두 메싸이오닌–알라닌–트립토판–라이신–글라이신 ✓', x0 + G.cwid / 2, Math.min(yb + 10, G.H - 70), '800 14px', '#2f7a3d'); }
    }
    function drawColony(c, r) {
      const n = ins.u < 3 ? 0 : Math.min(8, 2 ** Math.floor((ins.u - 3) / 0.45));
      for (let i = 0; i < n; i++) { const x = r.x + 26 + (i % 4) * ((r.w - 52) / 3), y = r.y + 46 + Math.floor(i / 4) * 20; rr(c, x - 12, y - 5, 24, 10, 5); c.fillStyle = '#8cc770'; c.fill(); c.strokeStyle = '#356b2e'; c.lineWidth = 1; c.stroke(); }
      if (ins.u > 4.2) { const k = Math.min(1, (ins.u - 4.2) / 0.6); c.globalAlpha = k; rr(c, r.x + 10, r.y + r.h * 0.56, r.w - 20, 30, 8); c.fillStyle = '#fde3d8'; c.fill(); c.strokeStyle = '#c0661c'; c.lineWidth = 2; c.stroke(); txt(c, '사람 인슐린 생산 중', r.x + r.w / 2, r.y + r.h * 0.56 + 15, '800 15px', '#8a3d0c'); c.globalAlpha = 1; }
    }
    // ③ 산업 예: 다섯 단계 그림
    const PROC = [['사람 DNA에서', '인슐린', '유전자 자르기'], ['대장균', '플라스미드에', '끼우기'], ['재조합 DNA를', '대장균에', '넣기'], ['대장균이', '불어나며', '인슐린 생산'], ['인슐린을', '모아서', '당뇨병 약으로']];
    function drawProc(c) {
      const A = G.area, pw = A.w / 5;
      txt(c, '사람 유전자를 넣은 대장균 · 누르면 사전으로', A.x, G.dictY + 12, '800 18px', '#1d2433', 'left');
      PROC.forEach((lines, i) => {
        const x = A.x + i * pw, on = ins.u >= i * 0.9, k = clamp((ins.u - i * 0.9) / 0.6, 0, 1);
        rr(c, x + 3, A.y, pw - 6, A.h, 10); c.fillStyle = on ? '#fff' : '#f2f3f5'; c.fill(); c.strokeStyle = on ? '#c0661c' : '#c9ccd3'; c.lineWidth = 2; c.stroke();
        txt(c, '①②③④⑤'[i], x + 16, A.y + 14, '800 15px', '#c0661c');
        c.save(); c.globalAlpha = 0.25 + 0.75 * k; const cx = x + pw / 2, cy = A.y + A.h * 0.38; procArt(c, i, cx, cy, Math.min(pw, 120) / 120); c.restore();
        lines.forEach((l, j) => txt(c, l, x + pw / 2, A.y + A.h - 44 + j * 16, '700 13px', on ? '#1d2433' : '#9aa3b2'));
      });
    }
    function procArt(c, i, x, y, s) {
      c.save(); c.translate(x, y); c.scale(s, s); c.lineWidth = 2;
      const plasmid = (r, ins2) => { c.strokeStyle = '#2f6d8a'; c.lineWidth = 4; c.beginPath(); c.arc(0, 0, r, ins2 ? 0.5 : 0, ins2 ? 6.28 - 0.1 : 7); c.stroke(); if (ins2) { c.strokeStyle = '#e07a2a'; c.lineWidth = 6; c.beginPath(); c.arc(0, 0, r, -0.1, 0.5); c.stroke(); } };
      if (i === 0) { c.fillStyle = '#f6e2d6'; c.beginPath(); c.arc(0, 0, 34, 0, 7); c.fill(); c.strokeStyle = '#c4805f'; c.stroke(); c.fillStyle = '#c9a3e6'; c.beginPath(); c.arc(-4, 0, 14, 0, 7); c.fill(); c.strokeStyle = '#e07a2a'; c.lineWidth = 6; c.beginPath(); c.moveTo(14, -24); c.lineTo(38, -36); c.stroke(); txt(c, '✂', 28, -14, '800 18px', '#384255'); }
      if (i === 1) plasmid(26, true);
      if (i === 2) { const g = c.createLinearGradient(0, -24, 0, 24); g.addColorStop(0, '#c4e8a8'); g.addColorStop(1, '#5fa35a'); rr(c, -44, -22, 88, 44, 22); c.fillStyle = g; c.fill(); c.strokeStyle = '#356b2e'; c.stroke(); c.save(); c.scale(0.5, 0.5); plasmid(24, true); c.restore(); }
      if (i === 3) for (let j = 0; j < 6; j++) { const X = -30 + (j % 3) * 30, Y = -14 + Math.floor(j / 3) * 28; rr(c, X - 13, Y - 7, 26, 14, 7); c.fillStyle = '#8cc770'; c.fill(); c.strokeStyle = '#356b2e'; c.lineWidth = 1.2; c.stroke(); bead(c, X + 12, Y - 8, 4, 'K'); }
      if (i === 4) { rr(c, -16, -30, 32, 58, 6); c.fillStyle = '#e8f1f8'; c.fill(); c.strokeStyle = '#5b6577'; c.lineWidth = 2; c.stroke(); c.fillStyle = '#9aa3b2'; c.fillRect(-12, -38, 24, 9); c.fillStyle = '#cfe3f7'; c.fillRect(-14, -6, 28, 32); txt(c, '인슐린', 0, 8, '800 10px', '#1d4f86'); }
      c.restore();
    }

    // ── 움직임 ──
    function step(dt) {
      ORG.forEach((q) => {
        const st = o[q.k];
        if (st.tl) {
          st.tl.tt += dt; const per = 0.55; st.tl.pos = Math.min(st.tl.c + clamp(st.tl.tt / per, 0, 1), 6) - 0.5;
          if (st.tl.tt >= per) { const A = aa(STRIP[st.tl.c]); st.fly.push({ i: st.tl.c, k: A, u: 0 }); st.tl.c++; st.tl.tt = 0; if (st.tl.c >= 6) { st.tl = null; st.n++; } }
        }
        st.fly.forEach((f) => { f.u = Math.min(1, f.u + dt / 0.5); if (f.u >= 1) st.res[f.i] = f.k; });
        const was = st.fly.length; st.fly = st.fly.filter((f) => f.u < 1); if (was && !st.fly.length && st.res.length === 6 && !st.tl) finished(q.k);
      });
      if (zoom && zoom.u < 1) zoom.u = Math.min(1, zoom.u + dt / 0.3);
      if (ins && ins.u < 6) { ins.u += dt; if (ins.u >= 4.6 && !ok.has(3)) { ok.add(3); think.classList.add('open'); say('대장균의 라이보솜도 사람과 <b>같은 코돈 사전</b>으로 읽으니, 넣어 준 사람 유전자로 <b>사람 인슐린</b>이 만들어진다. 효모에 넣거나 <b>생장 호르몬</b> 같은 다른 단백질을 만들 때도 같은 원리다'); steps(); } }
    }
    function finished(k) {
      const nm = ORG.find((q) => q.k === k).name, n = ORG.filter((q) => o[q.k].res.length === 6).length;
      if (n === 4) { ok.add(1); say('네 생물 모두 <b>메싸이오닌–알라닌–트립토판–라이신–글라이신</b> — 종이 달라도 같은 코돈은 <b>같은 아미노산</b>이 된다. 이제 사전 칸을 눌러 열을 비교해 보자'); }
      else say(`${nm}의 라이보솜이 읽었다 — AUG에서 시작해 UAA에서 멈춘다. 다른 생물에도 넣어 보자 (${n}/4)`);
      steps();
    }
    function put(k) {
      const st = o[k]; if (st.tl) return false;
      st.res = []; st.fly = []; st.tl = { c: 0, tt: 0, pos: -0.5 }; say(`${ORG.find((q) => q.k === k).name} 카드에 RNA를 넣었다 — 라이보솜이 <b>코돈(염기 3개)</b>씩 읽는다`); steps(); S.kick(); return true;
    }
    function openZoom(cod) {
      if (zoom && zoom.c === cod) { zoom = null; return; }
      showProc = false; zoom = { c: cod, u: 0 };
      if (STRIP.includes(cod)) seen.add(cod);
      const A2 = aa(cod), rowsDone = ORG.filter((q) => o[q.k].res.length === 6).length;
      say(STRIP.includes(cod) ? `<b>${cod}</b> → ${A2 === '*' ? '종결코돈' : KO[A2]} — 비교 줄의 이 열을 보면 ${rowsDone === 4 ? '네 생물이 모두 같다' : '띠를 넣은 생물마다 같다'}. 생물종마다 다른 사전이 따로 있지 않다` : `<b>${cod}</b> → ${A2 === '*' ? '종결코돈' : KO[A2]} — 이 띠에는 없는 코돈이지만, 어느 생물에서나 뜻이 같다`);
      steps(); S.kick();
    }
    function insulin() {
      if (!ok.has(2) || ins) return false;
      ins = { u: 0 }; showProc = true; zoom = null;
      say('사람 세포에서 잘라 낸 <b>인슐린 유전자</b>를 대장균의 고리 모양 DNA(<b>플라스미드</b>)에 끼워 넣는다 → 재조합 DNA'); steps(); S.kick(); return true;
    }
    function steps() {
      if (ok.has(1) && [...seen].length >= 2) ok.add(2);
      const n = [1, 2, 3].find((q) => !ok.has(q)) || 0, done = ORG.filter((q) => o[q.k].res.length === 6).length;
      window.L1.steps(root, n, [...ok]); window.L1.done(root, n === 0);
      const nt = n === 1 ? `① RNA 띠를 네 생물 카드에 넣자 (${done}/4)` : n === 2 ? `② 사전 칸을 눌러 열을 비교하자 (${Math.min(2, seen.size)}/2)` : n === 3 ? '③ 사람 카드의 인슐린 유전자를 대장균에 끌자' : '종이 달라도 같은 코돈 → 같은 아미노산';
      if (chip.textContent !== nt) { chip.textContent = nt; chip.classList.toggle('done', n === 0); }
    }

    // ── 손 조작 ──
    const S = window.Play.make(stage, {
      draw,
      down(p) {
        if (!G) return;
        if (zoom && zoom.u > 0.5) { const A = G.area; zoom = null; if (inR(p, A)) return; }
        if (inR(p, G.disp)) { drag = { kind: 'rna', x: p.x, y: p.y }; return; }
        if (ok.has(2) && !ins && inR(p, geneR())) { drag = { kind: 'gene', x: p.x, y: p.y }; return; }
        if (showProc && ins && inR(p, G.area)) { showProc = false; return; }
        if (!showProc) { const q = G.cells.find((r) => inR(p, r)); if (q) { openZoom(q.c); return; } }
        const col = G.cols.find((q) => p.x >= q.x && p.x <= q.x + q.w && p.y >= G.cmpY && p.y <= G.cmpY + 26 + 4 * G.rh);
        if (col) { openZoom(col.c); return; }
        if (!showProc && ins && p.y < G.area.y && p.y > G.dictY && p.x > G.x0 && p.x < G.x1) { showProc = true; return; }
        const card = ORG.find((q) => inR(p, G.cards[q.k]));
        if (card) say(`<b>${card.name}</b>(${card.kind}) — 모습과 사는 방식은 다르지만 세포마다 <b>라이보솜</b>이 있어 RNA를 읽어 단백질을 만든다`);
      },
      move(p) { if (drag) { drag.x = p.x; drag.y = p.y; } },
      up(p) {
        if (!drag) return; const d = drag; drag = null;
        const card = ORG.find((q) => inR(p, G.cards[q.k]));
        if (d.kind === 'rna') { if (card) put(card.k); else say('RNA 띠를 <b>생물 카드</b> 위에 놓아야 그 생물의 라이보솜이 읽는다'); return; }
        if (card && card.k === 'ecoli') insulin();
        else if (card && card.k !== 'human') say(`${card.name}에도 넣을 수 있지만(유전자 변형 생물), 빨리 불어나는 <b>대장균</b>에 넣어 보자`);
        else say('인슐린 유전자를 <b>대장균</b> 카드에 끌어 놓자');
      },
      key(e) {
        const k = e.key.toLowerCase();
        if ('1234'.includes(k) && k !== '') { put(ORG[+k - 1].k); return true; }
        const i = KEYS.indexOf(k); if (i >= 0) { openZoom(DICT[i]); return true; }
        if (k === 'i') { insulin(); return true; }
        if (k === 'escape' && zoom) { zoom = null; return true; }
        return false;
      },
    });
    root.querySelector('.un-reset').addEventListener('click', () => { reset(); S.kick(); });
    reset();
    root._un = {
      put(k) { return put(k); }, zoom(c) { openZoom(c); return !!zoom; }, insulin: () => insulin(),
      state: () => ({ res: Object.fromEntries(ORG.map((q) => [q.k, o[q.k].res.join('')])), ok: [...ok], seen: [...seen], zoom: zoom && zoom.c, ins: ins && +ins.u.toFixed(1) }),
      geo: () => { const g = geo(), r = cv.getBoundingClientRect(), k = r.width / g.W, P = (x, y) => ({ x: r.left + x * k, y: r.top + y * k }); return { disp: P(g.disp.x + g.disp.w / 2, g.disp.y + 40), cards: Object.fromEntries(ORG.map((q) => [q.k, P(g.cards[q.k].rx, g.cards[q.k].ry - 30)])), cells: g.cells.map((q) => P(q.x + q.w / 2, q.y + q.h / 2)), gene: (() => { const r2 = geneR(); return P(r2.x + r2.w / 2, r2.y + r2.h / 2); })() }; },
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Universal = { mount };
})();
