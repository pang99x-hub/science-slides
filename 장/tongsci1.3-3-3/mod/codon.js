/* 3-3 4차시 체험 «염기 짝 맞추고 코돈 읽기»(교과서 157~158쪽 그림 Ⅲ-39 전사와 번역 · 3염기조합과 코돈 + 참고서 전사·번역·코돈 표·비법 특강·문제 유형).
   (가) 전사(핵 속): 풀린 DNA 중 전사에 쓰이는 가닥 아래로 RNA 뉴클레오타이드(A·U·G·C)를 끌어 짝을 맞춘다. T를 끌거나 짝이 틀리면 튕긴다.
   (나) 번역(세포질 라이보솜): 코돈 괄호를 끌어 RNA를 세 개씩 묶고, 코돈 사전을 보고 아미노산 카드를 첫 코돈부터 끌어 놓으면 펩타이드결합으로 이어진다. 종결코돈에는 «멈춤».
   문제 모드: 끝나면 «문제 풀기» 카드를 눌러 DNA 서열 → 아미노산 배열 세 문제(카드를 칸에 끌어 놓으면 바로 채점).
   ① RNA를 전사한다 ② 코돈으로 나눈다 ③ 아미노산 사슬을 만든다.
   Codon.mount(root) → { fit, setActive } · 시험용: root._cd.state() · geo() · base('A') · bracket(k) · card('M') · quiz() · tick(초) */
(function () {
  'use strict';
  const TAU = Math.PI * 2, FONT = '"IBM Plex Sans KR", sans-serif';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), lerp = (a, b, k) => a + (b - a) * k, ease = (u) => u * u * (3 - 2 * u);
  // 표준 유전부호(첫째·둘째·셋째 염기 U C A G 순서, *는 종결코돈)
  const B4 = 'UCAG', AA = 'FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG';
  const code = (k) => AA[B4.indexOf(k[0]) * 16 + B4.indexOf(k[1]) * 4 + B4.indexOf(k[2])];
  const NAME = { F: '페닐알라닌', L: '류신', S: '세린', Y: '타이로신', C: '시스테인', W: '트립토판', P: '프롤린', H: '히스티딘', Q: '글루타민', R: '아르지닌', I: '아이소류신', M: '메싸이오닌', T: '트레오닌', N: '아스파라진', K: '라이신', V: '발린', A: '알라닌', D: '아스파트산', E: '글루탐산', G: '글라이신', '*': '멈춤' };
  const PAIR = { A: 'U', T: 'A', G: 'C', C: 'G' }, DPAIR = { A: 'T', T: 'A', G: 'C', C: 'G' };
  const toRNA = (tpl) => [...tpl].map((b) => PAIR[b]).join('');
  const COL = { A: '#ffd84d', T: '#f2a03d', G: '#5cc77a', C: '#5aa9f0', U: '#f07ab4' };
  const AC = { M: '#2f9e5b', A: '#e0a030', W: '#8a5cc2', F: '#e0503f', G: '#7d8b99', H: '#2a8fb8', E: '#d9487a', K: '#b8742a', Y: '#3fa39a', '*': '#c0392b' };
  const DECK = ['M', 'A', 'W', 'F', 'G', 'H', 'E', 'K', 'Y', '*'];
  const TPL = 'TACCGTACCATT', RNA = toRNA(TPL), CODING = [...TPL].map((b) => DPAIR[b]).join(''); // RNA = AUG GCA UGG UAA
  const QUIZ = [
    { kind: 'tpl', dna: 'TACAAACCG' }, { kind: 'tpl', dna: 'TACGTACTT' }, { kind: 'cod', dna: 'ATGTGGGCA' },
  ].map((q) => { const r = q.kind === 'tpl' ? toRNA(q.dna) : q.dna.replace(/T/g, 'U'); return { ...q, rna: r, ans: [0, 1, 2].map((i) => code(r.slice(i * 3, i * 3 + 3))) }; });
  // 자체 점검: 표준 유전부호 몇 개와 문제 정답이 카드에 있는지
  console.assert(code('AUG') === 'M' && code('UAA') === '*' && code('UGA') === '*' && code('UGG') === 'W' && code('GAA') === 'E' && code('CAU') === 'H' && code('GGU') === 'G' && code('UCG') === 'S', 'codon table');
  console.assert(RNA === 'AUGGCAUGGUAA' && QUIZ.every((q) => q.ans.every((a) => DECK.includes(a))), 'codon quiz');
  const DICT = DECK.map((a) => { const cs = []; for (const x of B4) for (const y of B4) for (const z of B4) if (code(x + y + z) === a) cs.push(x + y + z); return { a, cs }; });

  const txt = (c, t, x, y, col = '#1d2433', f = '700 20px', al = 'center') => { c.fillStyle = col; c.font = `${f} ${FONT}`; c.textAlign = al; c.fillText(t, x, y); };
  function pill(c, x, y, t, bg, fg = '#fff', f = '700 16px', al = 'center') {
    c.font = `${f} ${FONT}`; const w = c.measureText(t).width + 20, x0 = al === 'left' ? x : al === 'right' ? x - w : x - w / 2;
    c.fillStyle = bg; c.beginPath(); c.roundRect(x0, y - 14, w, 27, 13); c.fill(); txt(c, t, x0 + w / 2, y + 5, fg, f);
  }
  const shade = (hex, k) => { const n = parseInt(hex.slice(1), 16), f = (v) => clamp(Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k), 0, 255); return `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`; };
  // 염기 조각: 퓨린(A·G)은 끝이 튀어나오고 피리미딘(T·U·C)은 끝이 파여 짝끼리 맞물린다(A–T/U 세모, G–C 둥근 홈)
  function tab(c, x, y0, dir, L, w, b, a = 1) {
    const ye = y0 + dir * L, k = 9, tri = b === 'A' || b === 'T' || b === 'U', out = b === 'A' || b === 'G';
    c.save(); c.globalAlpha *= a; c.beginPath(); c.moveTo(x - w / 2, y0); c.lineTo(x - w / 2, ye); c.lineTo(x - w * 0.26, ye);
    const e = ye + dir * (out ? k : -k);
    if (tri) c.lineTo(x, e); else c.quadraticCurveTo(x, ye + dir * (out ? 2 * k : -2 * k), x + w * 0.26, ye);
    c.lineTo(x + w * 0.26, ye); c.lineTo(x + w / 2, ye); c.lineTo(x + w / 2, y0); c.closePath();
    const g = c.createLinearGradient(x - w / 2, 0, x + w / 2, 0); g.addColorStop(0, shade(COL[b], 0.35)); g.addColorStop(0.55, COL[b]); g.addColorStop(1, shade(COL[b], -0.22));
    c.fillStyle = g; c.fill(); c.strokeStyle = shade(COL[b], -0.5); c.lineWidth = 1.6; c.stroke();
    txt(c, b, x, y0 + dir * L * 0.55 + 8, '#1d2433', '800 22px'); c.restore();
  }
  function sugar(c, x, y, r, rna, a = 1) { // 오각형 당(DNA 디옥시라이보스 보라, RNA 라이보스 연분홍 보라)
    c.save(); c.globalAlpha *= a; c.beginPath(); for (let i = 0; i < 5; i++) { const t = -Math.PI / 2 + i * TAU / 5; c.lineTo(x + Math.cos(t) * r, y + Math.sin(t) * r); } c.closePath();
    const g = c.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r * 1.2); g.addColorStop(0, rna ? '#f0d4f7' : '#cdb6ef'); g.addColorStop(1, rna ? '#b277c8' : '#7a52b8');
    c.fillStyle = g; c.fill(); c.strokeStyle = rna ? '#7a3f8f' : '#4b2f80'; c.lineWidth = 1.4; c.stroke(); c.restore();
  }
  function phos(c, x, y, r, a = 1) {
    c.save(); c.globalAlpha *= a; const g = c.createRadialGradient(x - r * 0.35, y - r * 0.35, 1, x, y, r); g.addColorStop(0, '#ff9a8a'); g.addColorStop(1, '#b8322a');
    c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.strokeStyle = '#7d1a14'; c.lineWidth = 1.2; c.stroke(); c.restore();
  }
  // 뉴클레오타이드 하나(당이 아래, 염기가 위를 향함) — 받침·끌기용
  function nucleo(c, x, y, b, rna, s = 1) {
    tab(c, x, y - 10 * s, -1, 40 * s, 40 * s, b); sugar(c, x, y, 13 * s, rna); phos(c, x - 24 * s, y + 4 * s, 8 * s);
    c.strokeStyle = '#5b4a6e'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - 17 * s, y + 3 * s); c.lineTo(x - 12 * s, y + 1 * s); c.stroke();
  }
  // 아미노산 구슬
  function bead(c, x, y, a, r = 21, glow = 0) {
    if (glow) { c.fillStyle = `rgba(255,214,77,${0.45 * glow})`; c.beginPath(); c.arc(x, y, r + 9, 0, TAU); c.fill(); }
    if (a === '*') { // 멈춤: 팔각형
      c.beginPath(); for (let i = 0; i < 8; i++) { const t = Math.PI / 8 + i * TAU / 8; c.lineTo(x + Math.cos(t) * r, y + Math.sin(t) * r); } c.closePath();
      c.fillStyle = '#c0392b'; c.fill(); c.strokeStyle = '#fff'; c.lineWidth = 2.5; c.stroke(); txt(c, '멈춤', x, y + 5, '#fff', '800 14px'); return;
    }
    const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, 2, x, y, r * 1.05); g.addColorStop(0, shade(AC[a], 0.55)); g.addColorStop(0.6, AC[a]); g.addColorStop(1, shade(AC[a], -0.35));
    c.shadowColor = 'rgba(0,0,0,.22)'; c.shadowBlur = 6; c.shadowOffsetY = 3; c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); c.shadowColor = 'transparent';
    c.strokeStyle = shade(AC[a], -0.5); c.lineWidth = 1.5; c.stroke();
    txt(c, NAME[a].slice(0, 2), x, y + 6, '#fff', `800 ${Math.round(r * 0.72)}px`);
  }

  function mount(root) {
    const stage = root.querySelector('.cd-stage'), chip = root.querySelector('.cd-now'), out = root.querySelector('.cd-out');
    let clock, phase, mv, rna, brk, chain, foldT, drag, fly, msg, ok, sel, qi, qgot, qdone, qwait, shake;

    function reset() {
      clock = 0; phase = 'tx'; mv = 0; rna = []; brk = []; chain = []; foldT = -1; drag = null; fly = []; ok = new Set(); sel = 0;
      qi = 0; qgot = [null, null, null]; qdone = 0; qwait = 0; shake = null;
      say('DNA 이중나선이 풀렸다. 가운데 <b>전사에 사용되는 가닥</b>의 염기를 보고, 아래 받침의 <b>RNA 뉴클레오타이드</b>를 하나씩 끌어 짝을 맞춰 붙이자. 짝은 A–U, T–A, G–C, C–G.');
      steps();
    }
    const say = (t) => { if (t !== msg) { msg = t; out.innerHTML = t; } };

    function geo() {
      const W = S.W, H = S.H, n = 12, s = Math.min(72, (W - 260) / n), x0 = 150 + s / 2, L = 42;
      const yT = Math.round(H * 0.34), yR = yT + 2 * L + 6, yR2 = 138, ty = H - 66;
      const nucs = ['A', 'U', 'G', 'C', 'T'].map((b, i) => ({ b, x: 150 + i * 120 + (b === 'T' ? 60 : 0), y: ty + 22 }));
      const cw = 82, cards = [{ k: 'br', x: 70, y: ty, w: 116 }, ...DECK.map((a, i) => ({ k: a, x: 150 + cw / 2 + i * (cw + 4), y: ty, w: cw }))];
      const dict = { x: W - 336, y: 204, w: 324, h: ty - 56 - 204 };
      return { W, H, n, s, x0, L, yT, yR, yR2, ty, nucs, cards, dict, sx: (i) => x0 + i * s, chainY: Math.round(H * 0.42) };
    }
    const nextIdx = () => rna.length;

    // ── (가) 전사 ──
    function putBase(b, from) {
      const g = geo(), i = nextIdx(); if (phase !== 'tx' || i >= g.n) return false;
      const need = PAIR[TPL[i]];
      if (b !== need) {
        const home = g.nucs.find((q) => q.b === b);
        fly.push({ b, x: from ? from.x : g.sx(i), y: from ? from.y : g.yR, tx: home.x, ty: home.y, u: 0, bad: true });
        shake = { i, t: clock };
        say(b === 'T' ? '튕겨 나갔다! <b>RNA 염기에는 T(타이민)가 없다.</b> 그 자리는 U(유라실)가 맡아 DNA의 A와 짝을 이룬다.'
          : `튕겨 나갔다! 전사에 사용되는 가닥의 염기는 <b>${TPL[i]}</b>. ${TPL[i]}의 짝은 <b>${need}</b>이다(A–U, T–A, G–C, C–G).`);
        return false;
      }
      rna.push({ b, t: clock, fx: from ? from.x : g.sx(i), fy: from ? from.y : g.yR + 60 });
      const k = rna.length;
      if (k === 1) say(`맞았다. DNA의 <b>${TPL[0]}</b>에 RNA의 <b>${b}</b>. RNA 뉴클레오타이드는 당이 <b>라이보스</b>이고 염기는 A·G·C·U 네 가지다. 초록 <b>RNA 합성효소</b>가 다음 자리로 옮겨 간다.`);
      else if (k === 4) say('새 뉴클레오타이드는 앞 뉴클레오타이드의 당에 인산으로 이어진다. 이렇게 본이 되는 가닥과 염기가 짝을 이루는(<b>상보적인</b>) RNA가 자란다.');
      else if (k === 8) say('사람처럼 <b>핵막이 있는 세포</b>는 DNA가 핵 속에 있어 전사도 <b>핵 속</b>에서 일어난다. 핵막이 없는 세균은 세포질에 DNA가 있어 거기서 전사한다.');
      else if (k < g.n) say(`${TPL[k - 1]} → ${b}. 다음 염기는 <b>${TPL[k]}</b>.`);
      if (k === g.n) { ok.add(1); phase = 'move'; mv = 0; say('전사 끝! 다 만든 RNA는 DNA에서 떨어지고 DNA 두 가닥은 다시 이중나선이 된다. 원본 DNA는 핵 속에 그대로 남고, RNA만 <b>핵막의 구멍</b>을 지나 세포질의 <b>라이보솜</b>으로 간다.'); }
      steps(); return true;
    }

    // ── (나) 번역 ──
    function putBracket(k) {
      if (phase !== 'tl' || brk.includes(k)) return false;
      if (k < 0 || k > 3) return false;
      brk.push(k); brk.sort();
      if (brk.length === 1) say('RNA에서 이어진 염기 <b>3개</b>가 아미노산 하나를 지정하는 유전부호, 곧 <b>코돈</b>이다. 왜 셋일까? 염기는 4종류라 1개씩이면 4가지, 2개씩이면 4×4=16가지뿐이라 아미노산 약 20종류를 다 가리킬 수 없다. 3개씩이면 4×4×4=<b>64가지</b>.');
      else if (brk.length === 4) { ok.add(2); say('코돈 4개. 코돈은 <b>첫 염기부터 겹치지 않게</b> 세 개씩 읽는다. 이제 오른쪽 <b>코돈 사전</b>에서 첫 코돈부터 찾아 아래 <b>아미노산 카드</b>를 괄호 위로 끌어 놓자.'); }
      else say(`코돈 ${k + 1}: <b>${RNA.slice(k * 3, k * 3 + 3)}</b>. DNA에서 이 코돈에 해당하는 연속된 염기 3개(<b>${TPL.slice(k * 3, k * 3 + 3)}</b>)를 <b>3염기조합</b>이라고 한다.`);
      steps(); return true;
    }
    function badBracket(k) {
      say(`괄호가 어긋났다. 코돈은 <b>개시코돈 AUG가 있는 첫 염기부터</b> 세 개씩, 겹치지 않게 끊는다. 염기 하나라도 밀리면 전혀 다른 코돈이 된다.`); shake = { br: k, t: clock };
    }
    function putCard(a, from) {
      const g = geo(), home = g.cards.find((q) => q.k === a);
      const back = (m) => { fly.push({ a, x: from ? from.x : home.x, y: from ? from.y : g.yR2, tx: home.x, ty: home.y, u: 0, bad: true }); say(m); return false; };
      if (phase === 'q') return putQuiz(a, from, null);
      if (phase !== 'tl') return false;
      if (brk.length < 4) return back('먼저 <b>코돈 괄호</b>를 끌어 RNA를 세 개씩 묶자.');
      const k = chain.length; if (k >= 4) return false;
      const cod = RNA.slice(k * 3, k * 3 + 3), want = code(cod);
      if (a !== want) {
        shake = { br: k, t: clock };
        if (want === '*') return back(`<b>${cod}</b>는 <b>종결코돈</b>이다. 지정하는 아미노산이 없어 여기서 번역이 멈춘다. «멈춤» 카드를 놓자.`);
        if (a === '*') return back(`<b>${cod}</b>는 종결코돈이 아니다. 사전에서 ${cod}를 찾아보자.`);
        return back(`<b>${NAME[a]}</b>는 ${DICT.find((d) => d.a === a).cs.join('·')}가 지정한다. 지금 라이보솜이 읽는 코돈은 <b>${cod}</b>. 사전에서 다시 찾아보자.`);
      }
      chain.push({ a, t: clock, fx: from ? from.x : home.x, fy: from ? from.y : home.y });
      if (a === '*') { ok.add(3); foldT = clock; say('종결코돈에 이르러 라이보솜이 떨어지고 사슬이 풀려난다. 아미노산 사슬(폴리펩타이드)은 <b>휘고 접히며</b> 저마다의 입체 구조를 갖춘 <b>단백질</b>이 된다. RNA 염기 12개 → 아미노산 3개: 염기 수는 아미노산 수의 <b>3배 이상</b>이다.'); }
      else if (k === 0) say('<b>AUG → 메싸이오닌.</b> AUG는 번역의 출발 신호인 <b>개시코돈</b>이기도 하다. 번역은 늘 개시코돈에서 시작한다.');
      else say(`<b>${cod} → ${NAME[a]}.</b> 앞 아미노산과 <b>펩타이드결합</b>으로 이어졌다. 라이보솜이 다음 코돈으로 한 칸(염기 3개) 옮겨 간다.`);
      steps(); return true;
    }

    // ── 문제 모드 ──
    function startQuiz() { phase = 'q'; qi = 0; qgot = [null, null, null]; qdone = 0; qwait = 0; sel = 0; sayQ(); steps(); }
    function sayQ() {
      const q = QUIZ[qi];
      say(q.kind === 'tpl' ? `문제 ${qi + 1}. 위 가닥이 <b>전사에 사용되는</b> DNA 가닥이라면 만들어지는 아미노산 배열은? 짝을 바꿔 RNA 코돈을 만든 뒤 사전에서 찾아 카드를 칸에 끌어 놓자.`
        : `문제 ${qi + 1}. 이번에는 전사에 사용되지 <b>않은</b> 가닥이다. RNA는 어느 가닥과 상보적일까? 카드를 칸에 끌어 놓자.`);
    }
    function putQuiz(a, from, slot) {
      const g = geo(), q = QUIZ[qi], home = g.cards.find((x) => x.k === a);
      if (qwait || qdone >= 3) return false;
      if (slot == null) slot = qgot.findIndex((x) => !x); if (slot < 0) return false;
      if (qgot[slot]) slot = qgot.findIndex((x) => !x);
      const trip = q.dna.slice(slot * 3, slot * 3 + 3), cod = q.rna.slice(slot * 3, slot * 3 + 3);
      if (a !== q.ans[slot]) {
        fly.push({ a, x: from ? from.x : home.x, y: from ? from.y : 300, tx: home.x, ty: home.y, u: 0, bad: true }); shake = { q: slot, t: clock };
        const raw = code(trip.replace(/T/g, 'U')), comp = code([...trip].map((b) => PAIR[b]).join(''));
        if (q.kind === 'tpl' && a === raw) say(`아깝다! DNA 염기 <b>${trip}</b>를 그대로 읽었다. 먼저 짝으로 바꿔 RNA 코돈을 만들어야 한다(T–A, A–U, G–C, C–G).`);
        else if (q.kind === 'cod' && a === comp) say(`아깝다! 짝으로 바꾼 것은 <b>전사에 사용된 가닥</b>일 때다. 이 가닥은 RNA와 염기 서열이 같고 <b>T만 U로</b> 바뀐다.`);
        else say(`${slot + 1}번째 3염기조합 <b>${trip}</b>에서 코돈을 다시 만들어 사전에서 찾아보자.`);
        return false;
      }
      qgot[slot] = { a, t: clock };
      if (qgot.every(Boolean)) {
        qdone = Math.max(qdone, qi + 1);
        say(`정답! ${q.kind === 'tpl' ? 'DNA' : '이 가닥'} ${q.dna.match(/.../g).join(' ')} → RNA <b>${q.rna.match(/.../g).join(' ')}</b> → <b>${q.ans.map((x) => NAME[x]).join(' – ')}</b>.${qi < 2 ? ' 다음 문제로 넘어간다.' : ' 세 문제 모두 맞혔다!'}`);
        if (qi < 2) qwait = clock + 2.4;
      } else say(`${slot + 1}번째: ${trip} → 코돈 <b>${cod}</b> → ${NAME[a]}. 나머지 칸도 채우자.`);
      steps(); return true;
    }

    function steps() {
      const n = [1, 2, 3].find((k) => !ok.has(k)) || 0;
      window.L1.steps(root, n, [...ok]); window.L1.done(root, n === 0);
      chip.textContent = phase === 'q' ? (qdone >= 3 ? '✓ 세 문제 모두 정답' : `문제 ${qi + 1}/3 · 카드를 칸에 끌어 놓기`)
        : n === 1 ? `① 받침의 뉴클레오타이드를 끌어 짝 맞추기 (${rna.length}/12)` : phase === 'move' ? 'RNA가 핵을 빠져나간다…'
        : n === 2 ? `② 코돈 괄호를 끌어 RNA를 세 개씩 묶기 (${brk.length}/4)` : n === 3 ? `③ 사전을 보고 아미노산 카드를 첫 코돈부터 (${chain.length}/4)` : '✓ DNA → RNA → 단백질 · «문제 풀기»를 눌러 보자';
      chip.classList.toggle('done', n === 0);
    }

    // ── 그리기 ──
    function backbone(c, g, y, n, rna, a, dir) { // 당-인산 골격
      c.save(); c.globalAlpha = a; c.strokeStyle = rna ? '#8a4fa0' : '#5b3f8f'; c.lineWidth = 4; c.beginPath(); c.moveTo(g.sx(0) - g.s / 2, y); c.lineTo(g.sx(n - 1) + g.s / 2 * (n === g.n ? 1 : 0), y); c.stroke(); c.restore();
      for (let i = 0; i < n; i++) { sugar(c, g.sx(i), y, 12, rna, a); if (i < n - 1 || n === g.n) phos(c, g.sx(i) + g.s / 2, y + dir * 2, 7, a); }
    }
    function draw(c, W, H, dt) {
      clock += dt; const t = clock, g = geo();
      if (phase === 'move') { mv = Math.min(1, mv + dt / 2.4); if (mv >= 1) { phase = 'tl'; say('여기는 <b>세포질</b>. RNA에 <b>라이보솜</b>이 붙었다. 아래 <b>코돈 괄호</b>를 끌어 RNA 위에 놓아 염기를 세 개씩 묶자.'); steps(); } }
      if (qwait && t > qwait) { qwait = 0; qi++; qgot = [null, null, null]; sayQ(); steps(); }
      const m = phase === 'tx' ? 0 : phase === 'move' ? ease(mv) : 1;
      // 배경: 핵 속 → 세포질
      const bg = c.createLinearGradient(0, 0, 0, H);
      if (phase === 'q') { bg.addColorStop(0, '#f7f4ec'); bg.addColorStop(1, '#efe9dc'); }
      else { bg.addColorStop(0, `rgb(${lerp(236, 246, m) | 0},${lerp(230, 240, m) | 0},${lerp(246, 226, m) | 0})`); bg.addColorStop(1, `rgb(${lerp(222, 238, m) | 0},${lerp(214, 230, m) | 0},${lerp(238, 210, m) | 0})`); }
      c.fillStyle = bg; c.fillRect(0, 0, W, H);
      if (phase !== 'q') {
        pill(c, W - 14, 24, m < 0.5 ? '핵 속' : '세포질', m < 0.5 ? '#6b4f96' : '#8a6512', '#fff', '800 16px', 'right');
        // 세포질 알갱이
        if (m > 0) { c.fillStyle = `rgba(160,130,70,${0.18 * m})`; for (let i = 0; i < 40; i++) { const x = (i * 197.3 + t * 6) % W, y = (i * 83.7) % (H - 120) + 20; c.beginPath(); c.arc(x, y, 2 + (i % 3), 0, TAU); c.fill(); } }
      }
      if (phase === 'q') drawQuiz(c, g, t); else drawMain(c, g, t, m);
      // 받침 / 카드
      c.fillStyle = 'rgba(255,255,255,.72)'; c.strokeStyle = 'rgba(29,36,51,.25)'; c.lineWidth = 1.5; c.beginPath(); c.roundRect(10, g.ty - 52, W - 20, 108, 14); c.fill(); c.stroke();
      if (phase === 'tx' || phase === 'move') {
        txt(c, 'RNA 뉴클레오타이드', 22, g.ty - 30, '#7a3f8f', '800 16px', 'left'); txt(c, '(당: 라이보스)', 22, g.ty - 10, '#7a3f8f', '600 14px', 'left');
        g.nucs.forEach((q) => { const hot = drag && drag.b === q.b; c.globalAlpha = q.b === 'T' ? 0.82 : 1; nucleo(c, q.x, q.y + (hot ? 0 : Math.sin(t * 2 + q.x) * 2), q.b, q.b !== 'T', 0.86); c.globalAlpha = 1; });
        const tq = g.nucs[4]; txt(c, 'DNA 뉴클레오타이드', tq.x + 46, g.ty - 6, '#4b2f80', '700 14px', 'left'); txt(c, '(타이민 T)', tq.x + 46, g.ty + 14, '#4b2f80', '600 14px', 'left');
        c.strokeStyle = 'rgba(29,36,51,.25)'; c.setLineDash([4, 4]); c.beginPath(); c.moveTo(tq.x - 60, g.ty - 44); c.lineTo(tq.x - 60, g.ty + 48); c.stroke(); c.setLineDash([]);
      } else {
        g.cards.forEach((q, i) => {
          if (q.k === 'br') {
            const used = phase === 'q' || brk.length >= 4; c.globalAlpha = used ? 0.35 : 1;
            bracketShape(c, q.x, q.y - 14, 84, '#1d6fb8', 4); txt(c, '코돈 괄호', q.x, q.y + 30, '#1d6fb8', '800 15px'); c.globalAlpha = 1; return;
          }
          const on = phase === 'q' || (phase === 'tl' && brk.length >= 4);
          c.globalAlpha = on ? 1 : 0.4;
          c.fillStyle = sel === i - 1 && on ? '#fff3c4' : '#fff'; c.strokeStyle = sel === i - 1 && on ? '#1d2433' : 'rgba(29,36,51,.35)'; c.lineWidth = sel === i - 1 && on ? 2.5 : 1.5;
          c.beginPath(); c.roundRect(q.x - q.w / 2, q.y - 44, q.w, 92, 10); c.fill(); c.stroke();
          if (!(drag && drag.a === q.k)) bead(c, q.x, q.y - 10 + (on ? Math.sin(t * 2.2 + i) * 1.5 : 0), q.k, 19);
          txt(c, q.k === '*' ? '종결' : NAME[q.k], q.x, q.y + 34, '#1d2433', `700 ${NAME[q.k].length > 4 ? 12 : 14}px`);
          c.globalAlpha = 1;
        });
      }
      // 날아가는 조각(튕김·돌아감)
      fly = fly.filter((f) => { f.u = Math.min(1, f.u + dt / 0.55); const e = ease(f.u), hop = Math.sin(Math.PI * f.u) * 60;
        const x = lerp(f.x, f.tx, e) + (f.bad ? Math.sin(f.u * 30) * 6 * (1 - f.u) : 0), y = lerp(f.y, f.ty, e) - hop;
        if (f.b) nucleo(c, x, y, f.b, f.b !== 'T', 0.86); else bead(c, x, y, f.a, 19); return f.u < 1; });
      // 끄는 것
      if (drag) {
        if (drag.b) nucleo(c, drag.x, drag.y, drag.b, drag.b !== 'T', 0.95);
        if (drag.br) bracketShape(c, drag.x, drag.y, g.s * 3 - 10, '#1d6fb8', 5);
        if (drag.a) bead(c, drag.x, drag.y, drag.a, 22, 1);
      }
    }
    function bracketShape(c, x, y, w, col, lw) {
      c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; c.beginPath(); c.moveTo(x - w / 2, y - 10); c.lineTo(x - w / 2, y + 8); c.lineTo(x + w / 2, y + 8); c.lineTo(x + w / 2, y - 10); c.stroke();
    }
    function drawMain(c, g, t, m) {
      const { s, L } = g, w = s - 12;
      const yR = lerp(g.yR, g.yR2, m), dnaA = 1 - m;
      // DNA(위로 물러나며 다시 닫힘)
      if (dnaA > 0.02) {
        const yT = g.yT - m * 120;
        const shut = phase === 'tx' ? 0 : Math.min(1, m * 2.5), ycs = lerp(g.yT - 2 * L - 30, yT - 2 * L - 4, shut);
        // 양 끝 이중나선(닫힌 부분)
        c.save(); c.globalAlpha = dnaA;
        [[-1, g.sx(0) - s / 2], [1, g.sx(g.n - 1) + s / 2]].forEach(([d, x]) => {
          c.strokeStyle = '#5b3f8f'; c.lineWidth = 4;
          const ym = (ycs + yT) / 2;
          for (const yy of [ycs, yT]) { c.beginPath(); c.moveTo(x, yy); c.bezierCurveTo(x + d * 30, yy, x + d * 30, ym + (yy === yT ? 14 : -14), x + d * 56, ym + (yy === yT ? 14 : -14)); c.lineTo(x + d * 104, ym + (yy === yT ? 14 : -14)); c.stroke(); }
          for (let j = 0; j < 3; j++) { const xx = x + d * (64 + j * 16); c.strokeStyle = ['#ffd84d', '#5cc77a', '#f2a03d'][j]; c.lineWidth = 7; c.beginPath(); c.moveTo(xx, ym - 12); c.lineTo(xx, ym + 12); c.stroke(); }
        });
        // 전사에 사용되지 않는 가닥(위, 염기가 위를 향하다 닫힐 때 아래로)
        for (let i = 0; i < g.n; i++) tab(c, g.sx(i), ycs, shut > 0.5 ? 1 : -1, shut > 0.5 ? L - 2 : L - 4, w, CODING[i], 0.55 + shut * 0.45);
        backbone(c, g, ycs, g.n, false, 1, -1);
        // 전사에 사용되는 가닥
        for (let i = 0; i < g.n; i++) { const sh = shake && shake.i === i && t - shake.t < 0.5 ? Math.sin((t - shake.t) * 50) * 5 : 0; tab(c, g.sx(i) + sh, yT, shut > 0.5 ? -1 : 1, L, w, TPL[i]); }
        backbone(c, g, yT, g.n, false, 1, 1);
        txt(c, 'DNA', 18, ycs - L + 14, '#4b2f80', '800 20px', 'left');
        txt(c, '전사에', 14, yT + 22, '#4b2f80', '800 15px', 'left'); txt(c, '사용되는', 14, yT + 40, '#4b2f80', '800 15px', 'left'); txt(c, '가닥 ▶', 14, yT + 58, '#4b2f80', '800 15px', 'left');
        if (phase === 'tx') { txt(c, '↕ 수소 결합이 끊어져 두 가닥이 풀린 곳', g.sx(g.n / 2) - s / 2, (ycs + yT) / 2 + 6, '#6b4f96', '700 15px'); }
        c.restore();
      }
      // RNA 합성효소(다음 자리)
      if (phase === 'tx' && rna.length < g.n) {
        const x = g.sx(rna.length), cy = (g.yT + g.yR) / 2, pulse = 1 + Math.sin(t * 3) * 0.04;
        const gr = c.createRadialGradient(x - 20, cy - 30, 10, x, cy, 120); gr.addColorStop(0, 'rgba(120,200,140,.45)'); gr.addColorStop(1, 'rgba(60,150,90,.12)');
        c.fillStyle = gr; c.beginPath(); c.ellipse(x - s * 0.6, cy, s * 1.4 * pulse, 92 * pulse, 0, 0, TAU); c.fill(); c.strokeStyle = 'rgba(47,130,80,.55)'; c.lineWidth = 2; c.stroke();
        txt(c, 'RNA 합성효소', x - s * 0.6, cy + 112, '#2f7a4c', '700 14px');
        // 빈 자리 표시
        c.setLineDash([5, 4]); c.strokeStyle = 'rgba(29,36,51,.55)'; c.lineWidth = 2; c.beginPath(); c.roundRect(x - w / 2, g.yR - L - 6, w, L + 22, 6); c.stroke(); c.setLineDash([]);
        txt(c, `${TPL[rna.length]}의 짝?`, x, g.yR + 40, '#1d2433', '800 16px');
      }
      // 번역 단계: 라이보솜(지금 읽는 코돈)
      const k = chain.length;
      if (phase === 'tl' && brk.length >= 4 && k < 4) {
        const x = g.sx(k * 3 + 1), y = yR - 22, wob = Math.sin(t * 2) * 2;
        c.save(); c.globalAlpha = 0.75;
        let gr = c.createRadialGradient(x - 20, y - 50, 8, x, y - 40, 110); gr.addColorStop(0, '#f3dcb0'); gr.addColorStop(1, '#c79a52');
        c.fillStyle = gr; c.beginPath(); c.ellipse(x, y - 44 + wob, s * 2, 52, 0, 0, TAU); c.fill();
        gr = c.createRadialGradient(x - 20, y + 50, 6, x, y + 46, 90); gr.addColorStop(0, '#f3dcb0'); gr.addColorStop(1, '#b8873e');
        c.fillStyle = gr; c.beginPath(); c.ellipse(x, y + 48 - wob, s * 1.7, 30, 0, 0, TAU); c.fill(); c.restore();
        txt(c, '라이보솜', x + s * 2 + 8, y - 70, '#8a6512', '800 15px', 'left');
      }
      // RNA
      for (let i = 0; i < rna.length; i++) {
        const r = rna[i], u = clamp((clock - r.t) / 0.35, 0, 1), e = ease(u);
        const x = lerp(r.fx, g.sx(i), e), y = lerp(r.fy, yR, e) - Math.sin(Math.PI * u) * 30;
        if (u < 1) { nucleo(c, x, y, r.b, true, 0.86); continue; }
        tab(c, g.sx(i), yR - 2, -1, L, w, r.b);
      }
      if (rna.length) {
        c.strokeStyle = '#8a4fa0'; c.lineWidth = 4; c.beginPath(); c.moveTo(g.sx(0) - s / 2, yR); c.lineTo(g.sx(rna.length - 1), yR); c.stroke();
        rna.forEach((r, i) => { if (clock - r.t >= 0.35) { sugar(c, g.sx(i), yR, 12, true); if (i < rna.length - 1) phos(c, g.sx(i) + s / 2, yR + 2, 7); } });
        txt(c, 'RNA', 18, yR + 6, '#7a3f8f', '800 20px', 'left');
      }
      if (phase === 'tx') return;
      // 코돈 괄호
      brk.forEach((kk) => {
        const sh = shake && shake.br === kk && t - shake.t < 0.5 ? Math.sin((t - shake.t) * 50) * 5 : 0;
        const x = g.sx(kk * 3 + 1) + sh, y = yR + 24;
        bracketShape(c, x, y, s * 3 - 10, kk === 3 ? '#c0392b' : '#1d6fb8', 4);
        txt(c, `코돈 ${kk + 1}`, x, y + 30, kk === 3 ? '#c0392b' : '#1d6fb8', '800 15px');
      });
      if (shake && shake.bad != null && t - shake.t < 0.7) { const x = shake.bad; c.strokeStyle = `rgba(217,72,59,${1 - (t - shake.t) / 0.7})`; bracketShape(c, x, yR + 24, s * 3 - 10, c.strokeStyle, 4); }
      if (phase === 'tl' && brk.length < 4) {
        const nx = [0, 1, 2, 3].find((kk) => !brk.includes(kk));
        c.globalAlpha = 0.35 + 0.25 * Math.sin(t * 4); bracketShape(c, g.sx(nx * 3 + 1), yR + 24, s * 3 - 10, '#1d6fb8', 3); c.globalAlpha = 1;
      }
      // 아미노산 사슬(펩타이드결합)
      const cy = g.chainY, cx0 = 150, step = 96, fold = foldT >= 0 ? ease(clamp((t - foldT) / 1.6, 0, 1)) : 0;
      const pos = (i) => { const n = chain.filter((q) => q.a !== '*').length, a = (i - (n - 1) / 2) * 1.1; return fold ? [lerp(cx0 + i * step, cx0 + step + Math.sin(a) * 70, fold), lerp(cy, cy + 30 - Math.cos(a) * 46 + Math.sin(t * 1.5 + i) * 2, fold)] : [cx0 + i * step, cy + Math.sin(t * 1.6 + i) * 3]; };
      const beads = chain.filter((q) => q.a !== '*');
      if (beads.length) txt(c, fold ? '단백질(접힌 폴리펩타이드)' : '아미노산 사슬', 18, cy - 44, '#1d2433', '800 16px', 'left');
      for (let i = 1; i < beads.length; i++) {
        if (clock - beads[i].t < 0.45) continue;
        const [x0, y0] = pos(i - 1), [x1, y1] = pos(i);
        c.strokeStyle = '#3a4252'; c.lineWidth = 5; c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1, y1); c.stroke();
        if (i === 1 && !fold) pill(c, (x0 + x1) / 2, cy - 34, '펩타이드결합', '#3a4252', '#fff', '700 13px');
      }
      beads.forEach((q, i) => { const u = clamp((clock - q.t) / 0.45, 0, 1), e = ease(u), [px, py] = pos(i); bead(c, lerp(q.fx, px, e), lerp(q.fy, py, e) - Math.sin(Math.PI * u) * 40, q.a, 23, u >= 1 && clock - q.t < 1.2 ? 1 - (clock - q.t - 0.45) / 0.75 : 0);
        if (u >= 1 && !fold) txt(c, NAME[q.a], px, py + 42, '#1d2433', '700 14px'); });
      if (chain.length) { // 코돈 위 대응 표시
        chain.forEach((q, i) => { if (i < 4) txt(c, q.a === '*' ? '종결' : NAME[q.a], g.sx(i * 3 + 1), yR - L - 16, q.a === '*' ? '#c0392b' : shade(AC[q.a], -0.35), '800 15px'); });
      }
      // 문제 풀기 카드
      if (ok.has(3)) {
        const q = qcard(g), p = 1 + Math.sin(t * 3) * 0.03;
        c.save(); c.translate(q.x + q.w / 2, q.y + q.h / 2); c.scale(p, p);
        c.fillStyle = '#1d6fb8'; c.shadowColor = 'rgba(0,0,0,.25)'; c.shadowBlur = 10; c.shadowOffsetY = 4; c.beginPath(); c.roundRect(-q.w / 2, -q.h / 2, q.w, q.h, 14); c.fill(); c.shadowColor = 'transparent';
        txt(c, '문제 풀기 ▶', 0, -2, '#fff', '800 22px'); txt(c, 'DNA 서열 → 아미노산 3문제', 0, 22, '#d6e8f7', '600 14px'); c.restore();
      }
      drawDict(c, g, t, phase === 'tl' && brk.length >= 4 && k < 4 ? RNA.slice(k * 3, k * 3 + 3) : null);
    }
    const qcard = (g) => ({ x: g.dict.x - 250, y: g.chainY + 90, w: 230, h: 66 });
    function drawDict(c, g, t, look) {
      const d = g.dict, rh = Math.min(30, (d.h - 40) / DICT.length);
      c.fillStyle = 'rgba(255,253,246,.96)'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.roundRect(d.x, d.y, d.w, d.h, 12); c.fill(); c.stroke();
      txt(c, '코돈 사전(표준 유전부호 일부)', d.x + d.w / 2, d.y + 24, '#1d2433', '800 16px');
      DICT.forEach((r, i) => {
        const y = d.y + 40 + i * rh, hit = look && r.cs.includes(look);
        if (hit) { c.fillStyle = `rgba(255,214,77,${0.55 + 0.25 * Math.sin(t * 5)})`; c.fillRect(d.x + 4, y, d.w - 8, rh - 2); }
        c.font = `700 ${rh > 26 ? 15 : 13}px ${FONT}`; c.textAlign = 'left';
        let x = d.x + 12; r.cs.forEach((cd) => { c.fillStyle = cd === look ? '#b2362b' : '#1d2433'; c.fillText(cd, x, y + rh * 0.68); x += c.measureText(cd + ' ').width; });
        txt(c, (r.a === '*' ? '종결코돈' : NAME[r.a]) + (r.a === 'M' ? '(개시)' : ''), d.x + d.w - 12, y + rh * 0.68, r.a === '*' ? '#c0392b' : shade(AC[r.a], -0.35), `800 ${rh > 26 ? 15 : 13}px`, 'right');
      });
    }
    function quizGeo(g) { const y0 = 54, s = Math.min(64, (g.dict.x - 200) / 9.6), x0 = 170; return { y0, s, x0, bx: (i) => x0 + i * s + Math.floor(i / 3) * s * 0.3, slot: (j) => ({ x: x0 + (j * 3 + 1) * s + j * s * 0.3, y: 300 }) }; }
    function drawQuiz(c, g, t) {
      const q = QUIZ[qi], Q = quizGeo(g), w = Q.s - 8;
      pill(c, 14, 22, `문제 ${qi + 1} / 3`, '#1d6fb8', '#fff', '800 16px', 'left');
      txt(c, q.kind === 'tpl' ? '전사에 사용되는 DNA 가닥' : '전사에 사용되지 않은 DNA 가닥(RNA와 짝이 아님)', 128, 28, '#4b2f80', '800 17px', 'left'); txt(c, 'DNA', 60, Q.y0 + 36, '#4b2f80', '800 17px');
      for (let i = 0; i < 9; i++) tab(c, Q.bx(i) + 20, Q.y0 + 4, 1, 40, w, q.dna[i]);
      c.strokeStyle = '#5b3f8f'; c.lineWidth = 4; c.beginPath(); c.moveTo(Q.bx(0) + 20 - Q.s / 2, Q.y0 + 4); c.lineTo(Q.bx(8) + 20 + Q.s / 2, Q.y0 + 4); c.stroke();
      txt(c, '↓ 전사', 60, Q.y0 + 92, '#6b4f96', '700 15px'); txt(c, 'RNA', 60, Q.y0 + 128, '#7a3f8f', '800 17px');
      for (let j = 0; j < 3; j++) {
        const got = qgot[j];
        for (let i = 0; i < 3; i++) { const x = Q.bx(j * 3 + i) + 20; if (got) tab(c, x, Q.y0 + 150, -1, 40, w, q.rna[j * 3 + i]); else { c.setLineDash([5, 4]); c.strokeStyle = 'rgba(29,36,51,.35)'; c.lineWidth = 1.5; c.strokeRect(x - w / 2, Q.y0 + 108, w, 42); c.setLineDash([]); txt(c, '?', x, Q.y0 + 136, '#8a93a3', '700 18px'); } }
        const sl = Q.slot(j), sh = shake && shake.q === j && t - shake.t < 0.5 ? Math.sin((t - shake.t) * 50) * 6 : 0, sx = sl.x + 20 + sh;
        bracketShape(c, sx, Q.y0 + 166, Q.s * 3 - 10, '#1d6fb8', 3);
        if (got) { const u = clamp((clock - got.t) / 0.4, 0, 1); bead(c, sx, sl.y, got.a, 26, 1 - u); txt(c, NAME[got.a], sx, sl.y + 46, '#1d2433', '700 15px'); }
        else { c.setLineDash([6, 5]); c.strokeStyle = `rgba(29,111,184,${0.5 + 0.3 * Math.sin(t * 4 + j)})`; c.lineWidth = 2.5; c.beginPath(); c.arc(sx, sl.y, 27, 0, TAU); c.stroke(); c.setLineDash([]); txt(c, `아미노산 ${j + 1}`, sx, sl.y + 46, '#5b6474', '600 14px'); }
        if (j) { c.strokeStyle = qgot[j] && qgot[j - 1] ? '#3a4252' : 'rgba(58,66,82,.25)'; c.lineWidth = 4; c.beginPath(); c.moveTo(Q.slot(j - 1).x + 20 + 28, sl.y); c.lineTo(sx - 28, sl.y); c.stroke(); }
      }
      txt(c, '↓ 번역', 60, 300, '#6b4f96', '700 15px');
      if (qdone >= 3) pill(c, 18, 372, '✓ 세 문제 모두 정답 — 처음부터 다시 해도 된다', '#2f9e5b', '#fff', '800 16px', 'left');
      drawDict(c, g, t, null);
    }

    // ── 손 조작 ──
    const hitNuc = (g, p) => g.nucs.find((q) => Math.abs(p.x - q.x) < 34 && p.y > q.y - 60 && p.y < q.y + 22);
    const hitCard = (g, p) => g.cards.find((q) => Math.abs(p.x - q.x) < q.w / 2 && Math.abs(p.y - q.y) < 46);
    function dropMain(g, p, d) {
      const yR = g.yR2;
      if (d.b) { if (p.y > g.yT - 30 && p.y < g.yR + 70 && p.x > g.sx(0) - g.s && p.x < g.sx(g.n - 1) + g.s) putBase(d.b, p); else { const h = g.nucs.find((q) => q.b === d.b); fly.push({ b: d.b, x: p.x, y: p.y, tx: h.x, ty: h.y, u: 0 }); say('뉴클레오타이드는 <b>전사에 사용되는 가닥 바로 아래</b>(점선 자리)에 놓아야 붙는다.'); } return; }
      if (d.br) {
        if (Math.abs(p.y - yR) > 90) { say('괄호는 <b>RNA 위</b>에 놓아야 한다.'); return; }
        const i = Math.round((p.x - g.x0) / g.s) - 1; // 괄호 가운데가 가리키는 염기 - 1 = 시작 염기
        if (i % 3 === 0 && i >= 0 && i <= 9) { if (!putBracket(i / 3)) say('그 코돈은 이미 묶었다. 다른 세 염기를 묶자.'); }
        else { badBracket(); shake = { bad: g.sx(clamp(i + 1, 1, 10)), t: clock }; }
        return;
      }
      if (d.a) {
        if (phase === 'q') { const Q = quizGeo(g), j = [0, 1, 2].find((jj) => Math.hypot(p.x - Q.slot(jj).x - 20, p.y - Q.slot(jj).y) < 70); if (j == null) { const h = g.cards.find((q) => q.k === d.a); fly.push({ a: d.a, x: p.x, y: p.y, tx: h.x, ty: h.y, u: 0 }); say('카드는 <b>아미노산 칸</b>(점선 동그라미)에 놓자.'); return; } putQuiz(d.a, p, qgot[j] ? null : j); return; }
        if (p.y < g.ty - 60) putCard(d.a, p); else { const h = g.cards.find((q) => q.k === d.a); fly.push({ a: d.a, x: p.x, y: p.y, tx: h.x, ty: h.y, u: 0 }); }
      }
    }
    const S = window.Play.make(stage, {
      draw,
      down(p) {
        const g = geo();
        if (phase === 'tx') { const n = hitNuc(g, p); if (n) drag = { b: n.b, x: p.x, y: p.y }; return; }
        if (phase === 'tl' && ok.has(3)) { const q = qcard(g); if (p.x > q.x && p.x < q.x + q.w && p.y > q.y && p.y < q.y + q.h) { startQuiz(); return; } }
        if (phase === 'tl' || phase === 'q') {
          const it = hitCard(g, p); if (!it) return;
          if (it.k === 'br') { if (phase === 'tl' && brk.length < 4) drag = { br: true, x: p.x, y: p.y }; return; }
          if (phase === 'tl' && brk.length < 4) { say('아미노산 카드는 <b>코돈 괄호</b>를 다 씌운 뒤에 쓴다.'); return; }
          sel = DECK.indexOf(it.k); drag = { a: it.k, x: p.x, y: p.y };
        }
      },
      move(p) { if (drag) { drag.x = p.x; drag.y = p.y; } },
      up(p) { const d = drag; drag = null; if (d) dropMain(geo(), p, d); },
      key(e) {
        const k = e.key.toUpperCase();
        if (e.key === '0') { reset(); return true; }
        if (phase === 'tx' && 'AUGCT'.includes(k) && k.length === 1) { putBase(k); return true; }
        if (phase === 'tl' && k === 'B') { const nx = [0, 1, 2, 3].find((kk) => !brk.includes(kk)); if (nx != null) putBracket(nx); return true; }
        if ((phase === 'tl' || phase === 'q') && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) { sel = (sel + (e.key === 'ArrowRight' ? 1 : DECK.length - 1)) % DECK.length; say(`고른 카드: <b>${DECK[sel] === '*' ? '멈춤(종결)' : NAME[DECK[sel]]}</b>. Enter로 놓는다.`); return true; }
        if ((phase === 'tl' || phase === 'q') && e.key === 'Enter') { putCard(DECK[sel]); return true; }
        if (phase === 'tl' && ok.has(3) && k === 'Q') { startQuiz(); return true; }
        return false;
      },
    });
    root.querySelector('.cd-reset').addEventListener('click', () => { reset(); S.kick(); });
    reset();

    root._cd = {
      state: () => ({ phase, rna: rna.map((r) => r.b).join(''), brk: [...brk], chain: chain.map((q) => q.a).join(''), ok: [...ok], qi, qdone, qgot: qgot.map((x) => x && x.a), fin: root.classList.contains('u-done'), out: out.textContent, chip: chip.textContent }),
      geo: () => { const g = geo(), Q = quizGeo(g), qc = qcard(g); return { W: g.W, H: g.H, nucs: Object.fromEntries(g.nucs.map((q) => [q.b, [q.x, q.y - 20]])), slot: (i) => [g.sx(i), g.yR - 20], drop: [g.sx(Math.min(rna.length, 11)), g.yR - 20], yR2: g.yR2, br: (i) => [g.sx(i + 1), g.yR2 + 10], codonX: [0, 1, 2, 3].map((i) => g.sx(i * 3 + 1)), cards: Object.fromEntries(g.cards.map((q) => [q.k, [q.x, q.y - 10]])), qcard: [qc.x + qc.w / 2, qc.y + qc.h / 2], qslot: [0, 1, 2].map((j) => [Q.slot(j).x + 20, Q.slot(j).y]), quiz: QUIZ.map((q) => q.ans.join('')) }; },
      base: (b) => { putBase(b); return root._cd.state(); },
      bracket: (k) => { putBracket(k); return root._cd.state(); },
      card: (a) => { putCard(a); return root._cd.state(); },
      quiz: () => { startQuiz(); return root._cd.state(); },
      tick: (sec) => { for (let i = 0; i < sec * 60; i++) draw(S.c, S.W, S.H, 1 / 60); return root._cd.state(); },
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Codon = { mount };
})();
