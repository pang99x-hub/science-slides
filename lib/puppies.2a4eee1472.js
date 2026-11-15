/* 1차시 2장(교과서 20쪽 그림 Ⅰ-12): 유성생식으로 생긴 변이. 아빠·엄마 개는 털빛(D 진함/d 연함)과 흰 무늬(W 넓음/w 없음) 유전자를 한 쌍씩 가졌다(DdWw).
   «유전자 카드 물려주기»(2026-10-30 선생님 요청: 정자·난자 그림 대신): 부모마다 털빛 카드 한 쌍·흰 무늬 카드 한 쌍. 쌍마다 한 장씩 골라 가운데 강아지 자리로 보내면
   네 자리가 다 찼을 때 강아지가 태어난다: 진한 유전자 수(0~2) × 흰 무늬 유전자 수(0~2) = 9가지 모습. «무작위로 물려주기»는 쌍마다 한 장씩 저절로 고른다.
   막대: 염색체 쌍 수 n → 생식세포 2ⁿ가지, 두 부모가 만나는 조합 2ⁿ × 2ⁿ (사람 23쌍, 교차는 빼고 센 값). */
(function () {
  'use strict';
  const K = window.EvKit, { el, clamp } = K;
  const COAT = [[226, 176, 108], [190, 112, 50], [58, 44, 38]];
  const GAM = [['D', 'W'], ['D', 'w'], ['d', 'W'], ['d', 'w']];
  const AL = { D: '#5a3b26', d: '#e6b979', W: '#ffffff', w: '#8f9aa6' };

  // 옆모습 강아지(코기): k = 진한 털빛 유전자 수, j = 흰 무늬 유전자 수
  function dog(p, k, j, s) {
    const g = el('g', { transform: `scale(${s})` }, p);
    const c = K.hex(COAT[k]), dk = K.hex(K.mix(COAT[k], [0, 0, 0], 0.35)), tan = '#d99a52';
    const line = { stroke: '#1d2433', 'stroke-width': 2.5 / s * s, 'stroke-linejoin': 'round' };
    el('path', { d: 'M-58 -10 l -16 -16 l 6 22 z', fill: c, ...line }, g);   // 꼬리
    [-40, -22, 28, 44].forEach((x) => el('rect', { x: x - 7, y: 12, width: 14, height: 22, rx: 5, fill: j === 2 ? '#fff' : c, ...line }, g));
    el('ellipse', { cx: 0, cy: 0, rx: 62, ry: 26, fill: c, ...line }, g);
    if (k === 2) el('path', { d: 'M-50 -12 C -30 -30, 20 -30, 40 -14 L 30 4 C 0 -6, -30 -4, -48 4 Z', fill: '#2a211d' }, g);
    if (j >= 1) el('path', { d: `M40 ${j === 2 ? -18 : -8} C 58 -6, 58 18, 40 24 C 30 20, 30 0, 40 -8 Z`, fill: '#fff' }, g);
    if (j === 2) el('ellipse', { cx: -6, cy: 20, rx: 40, ry: 7, fill: '#fff' }, g);
    el('path', { d: 'M38 -36 l -6 -30 l 22 18 z M60 -38 l 6 -30 l 12 24 z', fill: k === 2 ? '#2a211d' : c, ...line }, g);
    el('circle', { cx: 58, cy: -26, r: 22, fill: k === 2 ? '#2a211d' : c, ...line }, g);
    if (k === 2) el('ellipse', { cx: 66, cy: -18, rx: 12, ry: 8, fill: tan }, g);
    el('ellipse', { cx: 80, cy: -18, rx: 15, ry: 10, fill: j >= 1 ? '#fff' : (k === 2 ? tan : c), ...line }, g);
    if (j === 2) el('path', { d: 'M56 -48 L 62 -48 L 68 -22 L 58 -22 Z', fill: '#fff' }, g);
    el('circle', { cx: 64, cy: -30, r: 3.5, fill: '#111' }, g);
    el('circle', { cx: 94, cy: -20, r: 4, fill: '#111' }, g);
    el('path', { d: 'M78 -10 q 6 6 12 0', fill: 'none', stroke: '#1d2433', 'stroke-width': 2 }, g);
    void dk;
    return g;
  }
  function bars(g, al, x, y) {
    al.forEach((a, i) => el('rect', { x: x - 13 + i * 15, y: y - 13, width: 11, height: 26, rx: 5, fill: AL[a], stroke: '#1d2433', 'stroke-width': 2 }, g));
  }
  const sup = (n) => String(n).split('').map((d) => '⁰¹²³⁴⁵⁶⁷⁸⁹'[d]).join('');
  const kor = (n) => (n >= 1e12 ? '약 ' + Math.round(n / 1e12) + '조' : n >= 1e8 ? '약 ' + Math.round(n / 1e8) + '억' : n >= 1e6 ? '약 ' + Math.round(n / 1e6) * 100 + '만' : n >= 1e4 ? '약 ' + Math.round(n / 1e4) + '만' : '');

  function mount(root) {
    const svg = root.querySelector('.ev-sr-svg'), now = root.querySelector('.ev-sr-now'), msg = root.querySelector('.ev-sr-msg');
    const bornT = root.querySelector('.ev-sr-born'), kindT = root.querySelector('.ev-sr-kinds');
    const nIn = root.querySelector('#ev-sr-n'), nV = root.querySelector('.ev-sr-nv'), m1 = root.querySelector('.ev-sr-m1'), m2 = root.querySelector('.ev-sr-m2');
    el('rect', { x: 0, y: 0, width: 1056, height: 640, fill: '#f7f1e3' }, svg);
    el('rect', { x: 0, y: 440, width: 1056, height: 200, fill: '#e9dcc0' }, svg);
    el('path', { d: 'M0 440 H1056', stroke: '#1d2433', 'stroke-width': 2 }, svg);
    // 부모와 그 유전자 카드(쌍마다 두 장)
    const NAME = { D: '진한 털빛', d: '연한 털빛', W: '흰 무늬', w: '무늬 없음' };
    const PX = { dad: 180, mom: 876 };
    const dad = el('g', { transform: 'translate(180 92)' }, svg); dog(dad, 1, 1, 1.05);
    const mom = el('g', { transform: 'translate(876 92)' }, svg); dog(mom, 1, 1, 1.05);
    el('text', { class: 'ev-lab', x: 180, y: 160 }, svg).textContent = '아빠 개가 가진 유전자';
    el('text', { class: 'ev-lab', x: 876, y: 160 }, svg).textContent = '엄마 개가 가진 유전자';
    const ROWY = [228, 330], ROWN = ['털빛', '흰 무늬'];
    const cards = [];
    function card(who, row, a, x) {
      const g = el('g', { class: 'ev-gcard', tabindex: '0', role: 'button', 'aria-label': `${who === 'dad' ? '아빠' : '엄마'}의 ${ROWN[row]} 카드 ${a}(${NAME[a]}) 물려주기`, transform: `translate(${x} ${ROWY[row]})` }, svg);
      el('rect', { class: 'ev-gc-bg', x: -46, y: -34, width: 92, height: 68, rx: 10, fill: '#fffdf6', stroke: '#1d2433', 'stroke-width': 2.5 }, g);
      el('rect', { x: -38, y: -26, width: 14, height: 52, rx: 6, fill: AL[a], stroke: '#1d2433', 'stroke-width': 2 }, g);
      el('text', { x: 8, y: 2, style: 'font:800 28px var(--f-display)', fill: '#1d2433', 'text-anchor': 'middle' }, g).textContent = a;
      el('text', { x: 8, y: 24, style: 'font:600 14px var(--f-body)', fill: '#4b566a', 'text-anchor': 'middle' }, g).textContent = NAME[a];
      const c = { g, who, row, a, x, y: ROWY[row] }; cards.push(c); return c;
    }
    ['dad', 'mom'].forEach((who) => ROWY.forEach((_, row) => (row ? ['W', 'w'] : ['D', 'd']).forEach((a, i) => card(who, row, a, PX[who] - 52 + i * 104))));
    ROWY.forEach((y, row) => ['dad', 'mom'].forEach((who) => el('text', { class: 'ev-sm', x: PX[who], y: y - 46 }, svg).textContent = `${ROWN[row]} 한 쌍 → 한 장만 물려준다`));
    // 가운데: 강아지가 받는 자리 넷
    el('rect', { x: 388, y: 176, width: 280, height: 210, rx: 14, fill: '#fffaf0', stroke: '#1d2433', 'stroke-width': 2, 'stroke-dasharray': '8 6' }, svg);
    el('text', { class: 'ev-lab', x: 528, y: 168 }, svg).textContent = '강아지가 받은 유전자';
    const SX = { dad: 468, mom: 588 };
    el('text', { class: 'ev-sm', x: 468, y: 202 }, svg).textContent = '아빠에게서'; el('text', { class: 'ev-sm', x: 588, y: 202 }, svg).textContent = '엄마에게서';
    const slots = {};
    ['dad', 'mom'].forEach((who) => ROWY.forEach((y, row) => {
      const g = el('g', { transform: `translate(${SX[who]} ${y + 14})` }, svg);
      el('rect', { x: -46, y: -34, width: 92, height: 68, rx: 10, fill: 'none', stroke: '#9aa3b2', 'stroke-width': 2, 'stroke-dasharray': '6 5' }, g);
      el('text', { x: 0, y: 6, style: 'font:600 15px var(--f-body)', fill: '#9aa3b2', 'text-anchor': 'middle' }, g).textContent = ROWN[row];
      slots[who + row] = { g, x: SX[who], y: y + 14, card: null };
    }));
    const preview = el('g', { transform: 'translate(528 92)' }, svg);
    el('text', { x: 0, y: 6, style: 'font:800 44px var(--f-display)', fill: '#c9b48a', 'text-anchor': 'middle' }, preview).textContent = '?';
    const litter = el('g', {}, svg);
    el('text', { class: 'ev-lab', x: 528, y: 470 }, svg).textContent = '한배에서 태어난 강아지';
    const pups = [], seen = new Set();
    let ghosts = [];

    function born(al1, al2) {
      const k = [al1[0], al2[0]].filter((a) => a === 'D').length, j = [al1[1], al2[1]].filter((a) => a === 'W').length;
      if (pups.length >= 8) { const o = pups.shift(); o.remove(); pups.forEach((p, i) => p.setAttribute('transform', `translate(${88 + i * 126} 560)`)); }
      const g = el('g', { transform: `translate(${88 + pups.length * 126} 560)` }, litter);
      const inner = el('g', {}, g); dog(inner, k, j, 0.62);
      el('text', { class: 'ev-sm', x: 0, y: 64 }, g).textContent = `${al1[0]}${al2[0]} ${al1[1]}${al2[1]}`;
      if (window.gsap && !K.reduce) gsap.from(inner, { scale: 0.1, transformOrigin: '50% 50%', duration: 0.5, ease: 'back.out(2)' });
      pups.push(g); seen.add(k * 3 + j);
      preview.innerHTML = ''; dog(preview, k, j, 0.8);
      bornT.textContent = Number(bornT.textContent) + 1; kindT.textContent = `${seen.size} / 9`;
      const coat = ['연한', '붉은', '진한'][k], wh = ['흰 무늬 없음', '흰 무늬 조금', '흰 무늬 넓음'][j];
      msg.innerHTML = `아빠에게서 <b>${al1.join('')}</b>, 엄마에게서 <b>${al2.join('')}</b> → ${coat} 털빛 · ${wh}. 같은 부모인데도 어느 카드를 받느냐에 따라 모습이 달라진다.`;
      now.textContent = seen.size < 4 ? '② 다른 카드로 여러 번 물려줘 보자' : '같은 부모에게서 서로 다른 강아지가 태어났다 → 변이';
      now.classList.toggle('done', seen.size >= 4);
    }
    function clearSlots() { ghosts.forEach((g) => g.remove()); ghosts = []; Object.values(slots).forEach((s) => { s.card = null; }); cards.forEach((c) => c.g.classList.remove('given')); }
    function give(c) {
      const s = slots[c.who + c.row];
      if (Object.values(slots).every((q) => q.card)) clearSlots();
      if (s.card) { const old = ghosts.find((gh) => gh._slot === s); if (old) { old.remove(); ghosts = ghosts.filter((gh) => gh !== old); } s.card.g.classList.remove('given'); }
      s.card = c; c.g.classList.add('given');
      const gh = c.g.cloneNode(true); gh.classList.add('ev-ghost'); gh.removeAttribute('tabindex'); gh.removeAttribute('role'); gh._slot = s; svg.appendChild(gh); ghosts.push(gh);
      const to = `translate(${s.x} ${s.y})`;
      if (window.gsap && !K.reduce) gsap.fromTo(gh, { attr: { transform: `translate(${c.x} ${c.y})` } }, { attr: { transform: to }, duration: 0.45, ease: 'power2.out' });
      else gh.setAttribute('transform', to);
      if (Object.values(slots).every((q) => q.card)) {
        const al1 = [slots.dad0.card.a, slots.dad1.card.a], al2 = [slots.mom0.card.a, slots.mom1.card.a];
        setTimeout(() => born(al1, al2), K.reduce ? 0 : 480);
      } else now.textContent = '① 쌍마다 한 장씩, 아빠와 엄마 카드를 강아지 자리로 보내자';
    }
    cards.forEach((c) => {
      c.g.addEventListener('click', () => give(c));
      c.g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); give(c); } });
    });
    function random() {
      clearSlots();
      ['dad', 'mom'].forEach((who) => [0, 1].forEach((row) => { const pair = cards.filter((c) => c.who === who && c.row === row); give(pair[Math.floor(Math.random() * 2)]); }));
    }
    const rb = root.querySelector('.ev-sr-rand'); if (rb) rb.addEventListener('click', random);
    root.querySelector('.ev-sr-reset').addEventListener('click', () => { clearSlots(); pups.splice(0).forEach((p) => p.remove()); seen.clear(); bornT.textContent = '0'; kindT.textContent = '0 / 9'; now.classList.remove('done'); now.textContent = '① 쌍마다 한 장씩, 아빠와 엄마 카드를 강아지 자리로 보내자'; preview.innerHTML = '<text x="0" y="6" style="font:800 44px var(--f-display)" fill="#c9b48a" text-anchor="middle">?</text>'; });
    function math() {
      const n = Number(nIn.value), g = Math.pow(2, n), z = g * g;
      nV.textContent = n + '쌍';
      m1.innerHTML = `한 부모가 만드는 생식세포: 2${sup(n)} = <b>${g.toLocaleString('ko-KR')}</b>가지 ${kor(g)}${n === 23 ? ' (사람)' : ''}`;
      m2.innerHTML = `두 부모가 만나 생길 수 있는 조합: <b>${z.toLocaleString('ko-KR')}</b>가지 ${kor(z)}`;
    }
    nIn.addEventListener('input', math); K.keep(nIn); math();
    root._sr = { born: (a, b) => { clearSlots(); const pick = (who, al) => [0, 1].forEach((row) => give(cards.find((c) => c.who === who && c.row === row && c.a === al[row]))); pick('dad', GAM[a]); pick('mom', GAM[b]); }, random, n: (v) => { nIn.value = String(v); math(); } };
    return {};
  }
  window.EvPuppies = { mount };
})();
