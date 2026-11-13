/* 해 보기 «미래 사회 문제 해결에서 과학의 필요성»(교과서 131쪽): 미래 도시 그림의 네 문제 자리에 과학 기술 카드를 끌어 붙인다.
   화석 연료 고갈 ↔ 수소 연료 전지 발전 · 디지털 정보 격차 ↔ 인공지능 도우미 · 고령화 사회 심화 ↔ 스마트 헬스케어 · 기후 변화 ↔ 탄소 포집 장치
   맞으면 그 자리 그림이 바뀌고(문제 → 해결), 틀리면 카드가 흔들리고 힌트가 뜬다. 문제 자리(!)를 누르면 무엇이 문제인지 보인다. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const PROB = {
    fuel: { name: '화석 연료의 고갈', desc: '석탄·석유·천연가스를 계속 캐 쓰면 언젠가 바닥나고, 에너지가 모자라게 된다.', tech: '수소 연료 전지 발전', fix: '수소와 산소가 만나 전기를 만들고, 물만 나온다. 화석 연료에 덜 기댄다.' },
    gap: { name: '디지털 정보 격차', desc: '무인 주문기와 앱이 늘수록 디지털 기기에 서툰 사람은 정보와 서비스에서 멀어진다.', tech: '인공지능 도우미', fix: '말로 물으면 알아듣고 단계마다 안내해 누구나 기기를 쓸 수 있게 돕는다.' },
    age: { name: '고령화 사회의 심화', desc: '나이 든 인구가 늘고, 혼자 지내며 돌봄이 필요한 사람이 많아진다.', tech: '스마트 헬스케어', fix: '몸에 지닌 기기가 건강 정보를 재어 이상이 생기면 병원과 가족에게 알린다.' },
    heat: { name: '지구 온난화로 인한 기후 변화', desc: '온실 기체가 늘어 기온이 오르고 폭염·가뭄·홍수가 잦아진다.', tech: '탄소 포집 장치', fix: '공장·발전소에서 나오는 이산화 탄소를 붙잡아 공기 중으로 나가지 않게 한다.' },
  };
  const jong = (w) => (w.charCodeAt(w.length - 1) - 0xac00) % 28, eul = (w) => (jong(w) ? '을' : '를');
  const HINT = { fuel: '연료가 바닥나는 발전소에 필요한 기술이다', gap: '기기 앞에서 어쩔 줄 모르는 사람을 돕는 기술이다', age: '혼자 지내는 어르신의 건강을 지키는 기술이다', heat: '굴뚝에서 나오는 이산화 탄소를 붙잡는 기술이다' };
  const ZONE = { fuel: [30, 150, 270, 300], gap: [320, 190, 230, 260], age: [570, 170, 230, 280], heat: [820, 110, 220, 340] };

  function scene(svg) {
    const g = (c, p) => el('g', { class: c }, p || svg);
    const defs = el('defs', {}, svg);
    const sky = el('linearGradient', { id: 'ft-sky', x1: 0, y1: 0, x2: 0, y2: 1 }, defs); el('stop', { offset: 0, 'stop-color': '#bfe0f2' }, sky); el('stop', { offset: 1, 'stop-color': '#eaf5fb' }, sky);
    el('rect', { x: -400, y: -300, width: 1856, height: 770, fill: 'url(#ft-sky)' }, svg);
    el('rect', { class: 'ft-ground', x: -400, y: 450, width: 1856, height: 450 }, svg);
    el('rect', { class: 'ft-road', x: -400, y: 500, width: 1856, height: 46 }, svg);
    el('path', { class: 'ft-lane', d: 'M-400 523 H 1456' }, svg);
    // 먼 배경 건물
    const far = g('ft-far'); [[60, 330, 60, 120], [400, 300, 70, 150], [520, 350, 50, 100], [800, 320, 60, 130], [980, 340, 60, 110]].forEach(([x, y, w, h]) => el('rect', { x, y, width: w, height: h }, far));
    // 1. 발전소(연료 탱크·굴뚝)
    const P = g('ft-z', svg); P.dataset.t = 'fuel';
    el('rect', { class: 'ft-bld', x: 60, y: 300, width: 150, height: 150 }, P);
    el('rect', { class: 'ft-bld', x: 150, y: 210, width: 30, height: 90 }, P);
    el('path', { class: 'ft-roof', d: 'M60 300 L 135 262 L 210 300 Z' }, P);
    const tank = el('g', { class: 'ft-tank' }, P); el('rect', { x: 222, y: 340, width: 60, height: 110, rx: 10 }, tank); el('rect', { class: 'ft-gauge', x: 236, y: 356, width: 32, height: 78, rx: 4 }, tank);
    el('rect', { class: 'ft-glevel', x: 238, y: 420, width: 28, height: 12, rx: 3 }, tank); el('text', { class: 'ft-small', x: 252, y: 470 }, tank).textContent = '연료';
    const smoke = g('ft-prob ft-smoke', P); [[170, 190, 16], [180, 164, 20], [168, 136, 24]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r }, smoke));
    const fuelFix = g('ft-fix', P);
    const h2 = el('g', { transform: 'translate(240 330)' }, fuelFix); el('rect', { class: 'ft-h2', x: -22, y: 0, width: 64, height: 120, rx: 30 }, h2); el('text', { class: 'ft-h2t', x: 10, y: 66 }, h2).textContent = 'H₂';
    el('rect', { class: 'ft-cell', x: 84, y: 360, width: 92, height: 60, rx: 8 }, fuelFix); el('text', { class: 'ft-small', x: 130, y: 396 }, fuelFix).textContent = '연료 전지';
    el('path', { class: 'ft-bolt', d: 'M136 296 l -16 26 h 14 l -10 24 l 26 -32 h -14 l 10 -18 z' }, fuelFix);
    el('path', { class: 'ft-dropw', d: 'M196 420 c -6 10, -8 14, 0 20 c 8 -6, 6 -10, 0 -20 z' }, fuelFix);
    // 2. 가게 앞 무인 주문기와 어르신
    const K = g('ft-z', svg); K.dataset.t = 'gap';
    el('rect', { class: 'ft-bld shop', x: 330, y: 300, width: 210, height: 150 }, K); el('path', { class: 'ft-awn', d: 'M322 300 h 226 l -12 -26 h -202 z' }, K);
    el('rect', { class: 'ft-kiosk', x: 362, y: 336, width: 54, height: 114, rx: 8 }, K); el('rect', { class: 'ft-kscr', x: 370, y: 346, width: 38, height: 46, rx: 4 }, K);
    const old1 = person(K, 460, 450, '#8d7ab8', true);
    const q1 = g('ft-prob', K); el('circle', { class: 'ft-bub', cx: 486, cy: 318, r: 22 }, q1); el('text', { class: 'ft-bubt', x: 486, y: 327 }, q1).textContent = '?';
    const gapFix = g('ft-fix', K); el('path', { class: 'ft-say', d: 'M330 236 h 170 a 12 12 0 0 1 12 12 v 36 a 12 12 0 0 1 -12 12 h -120 l -18 20 l 2 -20 h -34 a 12 12 0 0 1 -12 -12 v -36 a 12 12 0 0 1 12 -12 z' }, gapFix);
    el('text', { class: 'ft-sayt', x: 415, y: 271 }, gapFix).textContent = '말로 주문해 보세요';
    // 3. 집에 홀로 지내는 어르신
    const H = g('ft-z', svg); H.dataset.t = 'age';
    el('rect', { class: 'ft-bld home', x: 590, y: 300, width: 190, height: 150 }, H); el('path', { class: 'ft-roof home', d: 'M576 304 L 685 228 L 794 304 Z' }, H);
    el('rect', { class: 'ft-win', x: 612, y: 330, width: 70, height: 56 }, H); el('rect', { class: 'ft-door', x: 718, y: 370, width: 40, height: 80 }, H);
    person(H, 646, 390, '#b07a5a', true, 0.6);
    const sad = g('ft-prob', H); el('path', { class: 'ft-heart sad', d: 'M700 262 c -10 -16, -34 -6, -24 12 l 24 22 l 24 -22 c 10 -18, -14 -28, -24 -12 z' }, sad);
    const ageFix = g('ft-fix', H); el('rect', { class: 'ft-watch', x: 664, y: 360, width: 16, height: 14, rx: 3 }, ageFix);
    el('path', { class: 'ft-pulse', d: 'M680 362 C 730 330, 770 290, 790 244' }, ageFix);
    const clinic = el('g', { transform: 'translate(792 198)' }, ageFix); el('rect', { class: 'ft-clinic', x: -26, y: 0, width: 52, height: 40, rx: 6 }, clinic); el('path', { class: 'ft-cross', d: 'M0 8 V 32 M -12 20 H 12' }, clinic);
    // 4. 공장 굴뚝과 더위
    const F = g('ft-z', svg); F.dataset.t = 'heat';
    el('rect', { class: 'ft-bld fac', x: 840, y: 330, width: 190, height: 120 }, F); el('path', { class: 'ft-saw', d: 'M840 330 l 40 -30 v 30 l 40 -30 v 30 l 40 -30 v 30 l 40 -30 v 30 l 30 -24 v 24' }, F);
    el('rect', { class: 'ft-bld', x: 990, y: 220, width: 26, height: 110 }, F);
    const co2 = g('ft-prob ft-co2', F); [[1003, 196, 18], [992, 160, 24], [1010, 124, 28]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r }, co2)); el('text', { class: 'ft-co2t', x: 1004, y: 132 }, co2).textContent = 'CO₂';
    const therm = el('g', { class: 'ft-therm', transform: 'translate(870 150)' }, F); el('rect', { x: -9, y: 0, width: 18, height: 120, rx: 9 }, therm); el('rect', { class: 'ft-tf', x: -5, y: 20, width: 10, height: 96, rx: 5 }, therm); el('circle', { cx: 0, cy: 126, r: 14 }, therm);
    const heatFix = g('ft-fix', F); el('rect', { class: 'ft-ccs', x: 920, y: 150, width: 46, height: 180, rx: 10 }, heatFix); el('text', { class: 'ft-small v', x: 943, y: 248 }, heatFix).textContent = '포집';
    el('path', { class: 'ft-pull', d: 'M990 212 C 980 200, 976 190, 966 186' }, heatFix);
    // 해(기후 변화 자리에서 뜨겁게)
    el('circle', { class: 'ft-sun', cx: 760, cy: 80, r: 34 }, svg);
    // 문제 자리 표시(!)와 끌어 놓을 영역
    const spots = Object.entries(ZONE).map(([t, [x, y, w, h]]) => {
      const s = el('g', { class: 'ft-spot', 'data-t': t, tabindex: '0', role: 'button', 'aria-label': `${PROB[t].name} 자리` }, svg);
      el('rect', { class: 'ft-zone', x, y, width: w, height: h, rx: 18 }, s);
      const m = el('g', { class: 'ft-mark', transform: `translate(${x + w - 18} ${y + 18})` }, s); el('circle', { r: 20 }, m); el('text', { y: 8 }, m).textContent = '!';
      el('text', { class: 'ft-zt', x: x + w / 2, y: y + h + 28 }, s).textContent = PROB[t].name;
      return s;
    });
    return spots;
  }
  function person(p, x, y, color, old, k = 1) {
    const g = el('g', { class: 'ft-person', transform: `translate(${x} ${y}) scale(${k})` }, p);
    el('path', { class: 'ft-body', d: 'M-18 0 v -54 a 18 18 0 0 1 36 0 v 54 z', fill: color }, g);
    el('circle', { class: 'ft-face', cy: -76, r: 16 }, g);
    if (old) el('path', { class: 'ft-hair', d: 'M-15 -82 a 16 16 0 0 1 30 0 a 20 10 0 0 0 -30 0 z' }, g);
    return g;
  }

  function mount(root) {
    const svg = root.querySelector('.ft-svg'), cards = [...root.querySelectorAll('.ft-card')];
    const it = root.querySelector('.ft-it'), ib = root.querySelector('.ft-ib'), msg = root.querySelector('.ft-msg'), score = root.querySelector('.ft-score');
    const spots = scene(svg), zones = Object.fromEntries([...svg.querySelectorAll('.ft-z')].map((z) => [z.dataset.t, z]));
    const done = new Set();
    const shake = (e) => { e.classList.remove('bad'); e.getBoundingClientRect(); e.classList.add('bad'); };
    function info(t) { const p = PROB[t]; it.textContent = done.has(t) ? `${p.tech} → ${p.name}` : p.name; ib.textContent = done.has(t) ? p.fix : p.desc; }
    function attach(card, spot, quiet) {
      if (!spot) { msg.textContent = '도시 그림의 문제 자리(!) 위에 놓아 보자'; return; }
      const t = spot.dataset.t, c = card.dataset.t;
      if (c !== t) { shake(card); msg.textContent = `«${PROB[t].name}»에는 맞지 않다 — 이 카드는 ${HINT[c]}`; return; }
      done.add(t); card.classList.add('used'); zones[t].classList.add('fixed'); spot.classList.add('fixed'); spot.querySelector('.ft-mark text').textContent = '✓'; info(t);
      if (!quiet) { msg.textContent = `${PROB[t].tech}: ${PROB[t].fix}`; if (window.gsap && !window.Deck.reduce) gsap.fromTo(zones[t].querySelector('.ft-fix'), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, clearProps: 'opacity,transform' }); }
      score.textContent = `붙인 기술 ${done.size} / 4`;
      if (done.size === 4) msg.textContent = '네 문제 모두 과학 기술로 풀 길을 찾았다 — 그런데 과학만으로 충분할까?';
    }
    const drag = window.Drag.cards(cards, {
      find: (x) => x.closest && x.closest('#future .ft-spot'),
      hover: (s) => spots.forEach((x) => x.classList.toggle('target', x === s)),
      drop: attach,
      pick: (c) => { svg.classList.toggle('picking', !!c); if (c) msg.textContent = `«${c.textContent}»${eul(c.textContent)} 붙일 문제 자리를 눌러요`; },
    });
    spots.forEach((s) => {
      const go = () => { if (drag.picked) { const c = drag.picked; drag.unpick(); attach(c, s); } else info(s.dataset.t); };
      s.addEventListener('click', go);
      s.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); go(); } });
    });
    root.querySelector('#ft-all').addEventListener('click', () => cards.forEach((c) => { if (!c.classList.contains('used')) attach(c, spots.find((s) => s.dataset.t === c.dataset.t), true); }));
    return {};
  }
  window.FutureCity = { mount };
})();
