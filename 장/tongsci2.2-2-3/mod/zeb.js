/* 과학 소양 «제로 에너지 건축물»(교과서 117쪽 그림을 다시 그림). 기술 부품 카드를 집 단면의 알맞은 자리(+)에 끌어 붙인다(카드 → 자리 차례로 눌러도 된다).
   패시브(덜 쓰게): 고효율 단열재(벽 속)·3중창(창틀)·외부 전동 가리개(햇볕 드는 창 바깥)·경사진 창문(지붕 창)
   액티브(효율 높이고 만들기): 지열 난방(땅속)·폐열 회수 환기(다락)·자동 조명(천장)·태양광 발전(지붕 위)
   맞는 자리면 부품이 나타나고 새는 열·들어오는 햇볕 화살표가 준다. 틀린 자리면 카드가 흔들리고 힌트가 뜬다. 붙인 자리를 누르면 뗀다.
   쓰는 막대 ≤ 만드는 막대면 «제로 에너지». 태양광만으로는 닿지 않게 해 두었다(먼저 덜 쓰게). 값은 그림을 위한 비교. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const CUT = { ins: 2.2, win: 1.4, shade: 1, slant: 0.6, geo: 1.5, vent: 1, light: 0.6 }, PV = 3.5, BASE = 10;
  const SPOT = { ins: [262, 470, '벽 속'], win: [360, 465, '창틀'], shade: [700, 335, '햇볕 드는 창 바깥'], slant: [668, 222, '지붕 창'], geo: [515, 580, '집 아래 땅속'], vent: [530, 242, '다락'], light: [530, 322, '방 천장'], pv: [380, 226, '지붕 위'] };
  const WHY = {
    ins: '벽 속을 채워 벽으로 새는 열을 막는다', win: '유리를 세 겹으로 해 창으로 새는 열을 줄인다', shade: '창 바깥에서 햇볕을 가려 냉방을 덜 한다', slant: '비스듬한 지붕 창으로 햇빛을 들여 조명을 덜 쓴다',
    geo: '땅속의 고른 온도를 써서 냉난방 효율을 높인다', vent: '나가는 공기의 열로 들어오는 공기를 데운다', light: '사람이 없으면 저절로 꺼져 전기를 아낀다', pv: '지붕에서 햇빛으로 전기를 만든다',
  };
  const HINT = {
    ins: '단열재는 열이 빠져나가는 벽 속에 넣는다', win: '3중창은 창틀에 끼운다', shade: '가리개는 햇볕이 드는 창의 바깥에 단다', slant: '경사진 창은 지붕에 낸다',
    geo: '지열은 땅속에서 얻는다', vent: '환기 장치는 다락에 둔다', light: '자동 조명은 방 천장에 단다', pv: '태양광 패널은 햇빛이 잘 드는 지붕 위에 올린다',
  };
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const arrow = (p, x1, y1, x2, y2, cls, key) => { const g = el('g', { class: `ze-ar ${cls}`, 'data-k': key }, p); el('path', { d: `M${x1} ${y1} L ${x2} ${y2}` }, g); const a = Math.atan2(y2 - y1, x2 - x1); el('path', { class: 'ze-ah', d: `M${x2} ${y2} l ${(-16 * Math.cos(a - 0.5)).toFixed(1)} ${(-16 * Math.sin(a - 0.5)).toFixed(1)} M ${x2} ${y2} l ${(-16 * Math.cos(a + 0.5)).toFixed(1)} ${(-16 * Math.sin(a + 0.5)).toFixed(1)}` }, g); return g; };
  const jong = (w) => (w.charCodeAt(w.length - 1) - 0xac00) % 28;
  const eun = (w) => (jong(w) ? '은' : '는');

  function mount(root) {
    const svg = root.querySelector('.ze-svg'), parts = [...root.querySelectorAll('.ze-part')], msg = root.querySelector('.ze-msg');
    const uBar = root.querySelector('.ze-bars .use i'), mBar = root.querySelector('.ze-bars .make i'), goal = root.querySelector('.ze-goal');
    el('rect', { class: 'ze-sky', width: 1056, height: 520 }, svg);
    el('circle', { class: 'ze-sun', cx: 960, cy: 80, r: 36 }, svg);
    el('rect', { class: 'ze-ground', y: 520, width: 1056, height: 132 }, svg);
    // 지열관(땅속)
    const geo = el('g', { class: 'ze-x', 'data-k': 'geo' }, svg); el('path', { class: 'ze-geo', d: 'M440 520 V 620 H 470 V 540 H 500 V 620 H 530 V 540 H 560 V 620 H 590 V 520' }, geo); el('text', { class: 'ze-lab', x: 515, y: 644 }, geo).textContent = '지열 난방';
    // 집
    el('path', { class: 'ze-wall', d: 'M260 520 V 280 L 530 120 L 800 280 V 520 Z' }, svg);
    el('path', { class: 'ze-floor', d: 'M260 400 H 800' }, svg);
    const ins = el('g', { class: 'ze-x', 'data-k': 'ins' }, svg); el('path', { class: 'ze-ins', d: 'M276 516 V 288 L 530 138 L 784 288 V 516' }, ins);
    el('path', { class: 'ze-roof', d: 'M236 290 L 530 110 L 824 290' }, svg);
    // 창(왼쪽·오른쪽)과 3중창 선, 외부 가리개, 경사진 창
    [[320, 300], [660, 300], [320, 430], [660, 430]].forEach(([x, y], i) => {
      el('rect', { class: 'ze-win', x, y, width: 80, height: 70 }, svg);
      const t = el('g', { class: 'ze-x', 'data-k': 'win' }, svg); el('path', { class: 'ze-tri', d: `M${x + 6} ${y} V ${y + 70} M ${x + 12} ${y} V ${y + 70}` }, t);
      if (i === 1) { const s = el('g', { class: 'ze-x', 'data-k': 'shade' }, svg); for (let k = 0; k < 5; k++) el('rect', { class: 'ze-blind', x: x - 6, y: y - 6 + k * 15, width: 92, height: 7, rx: 2 }, s); }
    });
    el('path', { class: 'ze-skyw', d: 'M640 196 L 700 232 L 688 252 L 628 216 Z' }, svg);
    const sl = el('g', { class: 'ze-x', 'data-k': 'slant' }, svg); el('path', { class: 'ze-slant', d: 'M624 190 L 712 242' }, sl);
    // 태양광, 환기 장치, 자동 조명
    const pv = el('g', { class: 'ze-x', 'data-k': 'pv' }, svg); for (let k = 0; k < 3; k++) el('path', { class: 'ze-pv', d: `M${300 + k * 62} ${262 - k * 36} l 54 -32 l 20 12 l -54 32 z` }, pv);
    const vent = el('g', { class: 'ze-x', 'data-k': 'vent' }, svg); el('rect', { class: 'ze-vent', x: 490, y: 220, width: 80, height: 44, rx: 8 }, vent); el('text', { class: 'ze-lab sm', x: 530, y: 248 }, vent).textContent = '환기';
    el('path', { class: 'ze-vflow', d: 'M490 242 H 420 M 640 242 H 570' }, vent);
    const lt = el('g', { class: 'ze-x', 'data-k': 'light' }, svg); el('circle', { class: 'ze-sensor', cx: 530, cy: 300, r: 10 }, lt); el('path', { class: 'ze-sline', d: 'M512 316 l -16 16 M 548 316 l 16 16' }, lt);
    el('circle', { class: 'ze-lamp', cx: 530, cy: 360, r: 16 }, svg);
    // 새는 열·들어오는 햇볕 화살표
    const ar = el('g', { class: 'ze-arrows' }, svg);
    arrow(ar, 268, 360, 196, 360, 'heat', 'ins'); arrow(ar, 268, 470, 196, 470, 'heat', 'ins'); arrow(ar, 792, 360, 864, 360, 'heat', 'ins');
    arrow(ar, 400, 120, 360, 64, 'heat', 'ins');
    arrow(ar, 360, 372, 360, 400, 'heat2', 'win'); arrow(ar, 700, 372, 700, 400, 'heat2', 'win');
    arrow(ar, 900, 150, 750, 300, 'sun', 'shade'); arrow(ar, 860, 120, 700, 210, 'sun', 'slant');
    const lab = el('text', { class: 'ze-say', x: 530, y: 60 }, svg);
    // 붙일 자리(+)
    const spots = Object.entries(SPOT).map(([k, [x, y, name]]) => {
      const g = el('g', { class: 'ze-spot', 'data-t': k, transform: `translate(${x} ${y})`, tabindex: '0', role: 'button', 'aria-label': `${name} 자리` }, svg);
      el('circle', { r: 30 }, g); el('path', { class: 'ze-plus', d: 'M-10 0 H 10 M 0 -10 V 10' }, g);
      const t = el('text', { class: 'ze-sn', y: 50 }, g); t.textContent = name;
      return g;
    });
    const on = {};
    const name = (k) => parts.find((p) => p.dataset.t === k).textContent.trim();
    const shake = (e) => { e.classList.remove('bad'); e.getBoundingClientRect(); e.classList.add('bad'); };
    function paint() {
      svg.querySelectorAll('.ze-x').forEach((g) => g.classList.toggle('on', !!on[g.dataset.k]));
      svg.querySelectorAll('.ze-ar').forEach((g) => g.classList.toggle('off', !!on[g.dataset.k]));
      spots.forEach((g) => g.classList.toggle('done', !!on[g.dataset.t]));
      parts.forEach((p) => { p.classList.toggle('used', !!on[p.dataset.t]); p.tabIndex = on[p.dataset.t] ? -1 : 0; });
      const use = BASE - Object.entries(CUT).reduce((s, [k, v]) => s + (on[k] ? v : 0), 0), make = on.pv ? PV : 0;
      uBar.style.width = `${use / BASE * 100}%`; mBar.style.width = `${make / BASE * 100}%`;
      const zero = make > 0 && use <= make;
      root.classList.toggle('zero', zero);
      goal.textContent = zero ? '제로 에너지! 쓰는 만큼 스스로 만든다' : on.pv ? '아직 쓰는 쪽이 크다 — 먼저 덜 쓰게(패시브) 해 보자' : Object.keys(on).length ? '덜 쓰게 했다. 만드는 기술도 붙여 보자' : '';
      lab.textContent = zero ? '쓴 에너지 − 만든 에너지 ≤ 0' : '';
    }
    function attach(card, spot) {
      if (!spot) { msg.textContent = '집 그림의 + 자리 위에 놓아 보자'; return; }
      const k = card.dataset.t;
      if (spot.dataset.t !== k) { shake(card); shake(spot); msg.textContent = `${name(k)}${eun(name(k))} 여기가 아니다 — ${HINT[k]}`; return; }
      on[k] = true; paint();
      msg.textContent = `${name(k)} → ${SPOT[k][2]}: ${WHY[k]}`;
      const g = svg.querySelectorAll(`.ze-x[data-k="${k}"]`);
      if (window.gsap && !window.Deck.reduce) gsap.fromTo(g, { scale: 0.85, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.4, ease: 'back.out(3)' });
    }
    const drag = window.Drag.cards(parts, {
      find: (x) => x.closest && x.closest('#zeb .ze-spot'),
      hover: (t) => spots.forEach((g) => g.classList.toggle('target', g === t)),
      drop: attach,
      pick: (c) => { svg.classList.toggle('picking', !!c); if (c) msg.textContent = `«${c.textContent.trim()}»${eun(c.textContent.trim())} 집의 어디에 붙일까? 자리(+)를 눌러요`; },
    });
    spots.forEach((g) => {
      const go = () => { if (drag.picked) { const c = drag.picked; drag.unpick(); attach(c, g); } else msg.textContent = `${SPOT[g.dataset.t][2]} — 알맞은 부품 카드를 끌어 붙여 보자`; };
      g.addEventListener('click', go);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); go(); } });
    });
    // 붙인 부품을 누르면 뗀다
    svg.querySelectorAll('.ze-x').forEach((g) => g.addEventListener('click', () => { const k = g.dataset.k; if (!on[k]) return; delete on[k]; paint(); msg.textContent = `${name(k)}${eun(name(k))} 뗐다`; }));
    root._zeb = { all() { Object.keys(SPOT).forEach((k) => { on[k] = true; }); paint(); }, put: (k) => { on[k] = true; paint(); } };
    paint();
    return {};
  }
  window.ZeroHouse = { mount };
})();
