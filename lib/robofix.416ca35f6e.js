/* 탐구 «일상생활에 활용되는 로봇의 특징 분석과 개선 방안»(교과서 146~147쪽): 식당 옆모습. 서빙 로봇이 주방 → 좁은 통로 → 식탁으로 음식을 나르며
   문제 넷이 드러난다(손님이 직접 내린다, 국이 식는다, 통로에서 머뭇거린다, 좋아하는 메뉴를 모른다). 그림 밑 개선 부품을 알맞은 번호 붙은 문제 자리에 붙이면
   로봇에 그 부품이 생기고 처음부터 다시 일한다. 부품마다 «만드는 비용» 막대가 오른다(이해를 돕기 위한 예). */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const PROB = {
    arm: { name: '손님이 직접 내린다', desc: '로봇이 음식을 가져와도 결국 손님이 쟁반에서 식탁 위로 옮겨야 한다.', fix: '관절이 있는 팔이 쟁반을 식탁 위에 바로 놓는다.', hint: '음식을 식탁 위로 옮겨 놓는 부품이다', cost: 38, zone: [748, 286, 170, 110] },
    warm: { name: '국이 식는다', desc: '주방에서 식탁까지 오는 동안 국에서 김이 사라진다 — 식어서 도착한다.', fix: '보온 칸이 따뜻한 음식은 따뜻하게, 찬 음식은 차갑게 지킨다.', hint: '음식의 온도를 지키는 부품이다', cost: 14, zone: [588, 282, 150, 96] },
    nav: { name: '통로에서 머뭇거린다', desc: '의자가 튀어나온 좁은 통로에서 부딪힐까 봐 한참 멈췄다가 지나간다.', fix: '최신 센서와 인공지능 길 찾기로 장애물을 비켜 좁은 곳도 매끄럽게 지나간다.', hint: '좁고 복잡한 곳에서 비켜 가게 돕는 부품이다', cost: 26, zone: [386, 300, 210, 180] },
    learn: { name: '좋아하는 메뉴를 모른다', desc: '손님마다 즐겨 먹는 메뉴가 다른데, 로봇은 누가 무엇을 좋아하는지 모른다.', fix: '손님의 선호와 주문 기록을 배워 자주 찾는 메뉴를 추천한다.', hint: '손님이 좋아하는 것을 기억해 추천하는 부품이다', cost: 20, zone: [814, 26, 222, 160] },
  };
  const NAME = { arm: '관절 팔', warm: '보온 칸', nav: '길 찾기 센서', learn: '주문 기록 학습' };
  const jong = (w) => (w.charCodeAt(w.length - 1) - 0xac00) % 28 > 0, ga = (w) => w + (jong(w) ? '이' : '가'), eun = (w) => w + (jong(w) ? '은' : '는'), eul = (w) => w + (jong(w) ? '을' : '를');
  const REST = 662, NO = { nav: '1', warm: '2', arm: '3', learn: '4' };

  function scene(svg) {
    el('rect', { class: 'rf-wall', x: -400, y: -300, width: 1856, height: 770 }, svg);
    el('rect', { class: 'rf-floor', x: -400, y: 470, width: 1856, height: 400 }, svg);
    el('path', { class: 'rf-base', d: 'M-400 470 H 1456' }, svg);
    // 주방
    const k = el('g', { class: 'rf-kitchen' }, svg);
    el('rect', { class: 'rf-counter', x: 20, y: 330, width: 190, height: 140 }, k); el('rect', { class: 'rf-ctop', x: 12, y: 318, width: 206, height: 16, rx: 4 }, k);
    el('rect', { class: 'rf-hood', x: 92, y: -130, width: 46, height: 252 }, k); el('rect', { class: 'rf-hood', x: 40, y: 120, width: 150, height: 60, rx: 8 }, k);
    el('path', { class: 'rf-pot', d: 'M70 318 v -34 h 70 v 34 z' }, k); el('text', { class: 'rf-lab', x: 115, y: 410 }, k).textContent = '주방';
    // 통로의 의자 둘
    const ch = (x, flip) => { const g = el('g', { class: 'rf-chair', transform: `translate(${x} 0) scale(${flip ? -1 : 1} 1)` }, svg); el('path', { d: 'M-30 470 V 396 H 30 V 470 M -30 396 V 300 H -18 V 396' }, g); el('rect', { x: -34, y: 390, width: 68, height: 10, rx: 4 }, g); };
    ch(446, false); ch(540, true);
    el('text', { class: 'rf-lab', x: 493, y: 296 }, svg).textContent = '좁은 통로';
    // 식탁과 손님
    const t = el('g', { class: 'rf-table' }, svg);
    el('rect', { x: 744, y: 380, width: 230, height: 14, rx: 4 }, t); el('path', { d: 'M770 394 V 470 M 948 394 V 470' }, t);
    const cust = el('g', { class: 'rf-cust' }, svg);
    el('path', { class: 'rf-cchair', d: 'M1000 470 V 410 H 950 M 1000 410 V 320' }, cust);
    el('path', { class: 'rf-cbody', d: 'M952 410 v -72 a 22 22 0 0 1 44 0 v 72 z' }, cust);
    el('circle', { class: 'rf-cface', cx: 972, cy: 304, r: 22 }, cust);
    const hand = el('path', { class: 'rf-hand', d: 'M956 356 C 930 360, 912 366, 900 372' }, cust);
    const think = el('g', { class: 'rf-think' }, svg);
    el('path', { d: 'M836 40 h 170 a 16 16 0 0 1 16 16 v 64 a 16 16 0 0 1 -16 16 h -60 l -10 40 l -16 -40 h -84 a 16 16 0 0 1 -16 -16 v -64 a 16 16 0 0 1 16 -16 z' }, think);
    const thinkT = el('text', { x: 920, y: 80 }, think); const thinkT2 = el('text', { x: 920, y: 108 }, think);
    // 식탁 위 음식(내려놓은 뒤)
    const served = el('g', { class: 'rf-served' }, svg);
    el('path', { class: 'rf-bowl', d: 'M800 364 a 26 16 0 0 0 52 0 z' }, served); el('ellipse', { class: 'rf-plate', cx: 900, cy: 378, rx: 30, ry: 5 }, served);
    // 로봇
    const bot = el('g', { class: 'rf-bot' }, svg);
    const inner = el('g', {}, bot);
    el('rect', { class: 'rf-bbase', x: -50, y: 436, width: 100, height: 30, rx: 14 }, inner);
    [-28, 28].forEach((x) => el('circle', { class: 'rf-wheel', cx: x, cy: 468, r: 9 }, inner));
    el('rect', { class: 'rf-col', x: -12, y: 250, width: 24, height: 190 }, inner);
    el('rect', { class: 'rf-tray', x: -56, y: 362, width: 112, height: 10, rx: 4 }, inner);
    el('rect', { class: 'rf-tray', x: -56, y: 418, width: 112, height: 10, rx: 4 }, inner);
    const warmBox = el('g', { class: 'rf-part', 'data-k': 'warm' }, inner); el('rect', { class: 'rf-warm', x: -58, y: 316, width: 116, height: 50, rx: 10 }, warmBox); el('text', { class: 'rf-ptxt', x: 0, y: 312 }, warmBox).textContent = '보온';
    const dishes = el('g', { class: 'rf-dishes' }, inner);
    const bowl = el('path', { class: 'rf-bowl', d: 'M-30 346 a 26 16 0 0 0 52 0 z' }, dishes);
    const steam = el('g', { class: 'rf-steam' }, dishes); [-14, -4, 6].forEach((x) => el('path', { d: `M${x} 336 c -6 -8 6 -12 0 -22` }, steam));
    el('ellipse', { class: 'rf-plate', cx: 0, cy: 416, rx: 30, ry: 5 }, dishes); el('circle', { class: 'rf-food', cx: 0, cy: 410, r: 10 }, dishes);
    void bowl;
    el('rect', { class: 'rf-head', x: -42, y: 190, width: 84, height: 62, rx: 14 }, inner);
    const face = el('g', { class: 'rf-face' }, inner); el('circle', { cx: -14, cy: 218, r: 6 }, face); el('circle', { cx: 14, cy: 218, r: 6 }, face); el('path', { d: 'M-12 234 q 12 8 24 0' }, face);
    const rec = el('g', { class: 'rf-part rf-rec', 'data-k': 'learn' }, inner); el('rect', { x: -38, y: 194, width: 76, height: 54, rx: 10 }, rec); el('text', { x: 0, y: 216 }, rec).textContent = '추천'; el('text', { class: 'sm', x: 0, y: 238 }, rec).textContent = '늘 드시던 것';
    const nav = el('g', { class: 'rf-part', 'data-k': 'nav' }, inner); el('path', { class: 'rf-dome', d: 'M-16 190 a 16 14 0 0 1 32 0 z' }, nav);
    const scan = el('g', { class: 'rf-scan' }, nav); [40, 70, 100].forEach((r) => el('path', { d: `M${r * 0.7} ${182 - r * 0.7} A ${r} ${r} 0 0 1 ${r * 0.7} ${182 + r * 0.7}` }, scan));
    const arm = el('g', { class: 'rf-part rf-arm', 'data-k': 'arm', transform: 'translate(12 336)' }, inner);
    const up = el('g', { class: 'rf-up' }, arm); el('rect', { x: 0, y: -7, width: 70, height: 14, rx: 7 }, up); el('circle', { cx: 0, cy: 0, r: 10 }, up);
    const lo = el('g', { class: 'rf-lo', transform: 'translate(70 0)' }, up); el('rect', { x: 0, y: -6, width: 60, height: 12, rx: 6 }, lo); el('circle', { cx: 0, cy: 0, r: 8 }, lo); el('path', { class: 'rf-grip', d: 'M60 -12 v 24 M 60 -12 h 12 M 60 12 h 12' }, lo);
    // 문제 자리
    const spots = Object.entries(PROB).map(([key, p]) => {
      const [x, y, w, h] = p.zone;
      const s = el('g', { class: 'rf-spot', 'data-k': key, tabindex: '0', role: 'button', 'aria-label': `문제: ${p.name}` }, svg);
      el('rect', { class: 'rf-zone', x, y, width: w, height: h, rx: 16 }, s);
      const m = el('g', { class: 'rf-mark', transform: `translate(${x + w - 16} ${y + 16})` }, s); el('circle', { r: 20 }, m); el('text', { y: 8 }, m).textContent = NO[key];
      return s;
    });
    return { bot, inner, warmBox, dishes, steam, hand, think, thinkT, thinkT2, served, arm, up, lo, scan, rec, spots };
  }

  function mount(root) {
    const svg = root.querySelector('.rf-svg'), now = root.querySelector('.rf-now'), msg = root.querySelector('.rf-msg');
    const nEl = root.querySelector('.rf-n'), costEl = root.querySelector('.rf-cost em');
    const cards = [...root.querySelectorAll('.rf-card')];
    const S = scene(svg), fixed = new Set();
    const spot = Object.fromEntries(S.spots.map((s) => [s.dataset.k, s]));
    const gs = window.gsap, reduce = window.Deck.reduce || !gs;
    let tl = null, started = false;
    const pulse = (k) => { spot[k].classList.remove('pulse'); void spot[k].getBoundingClientRect(); spot[k].classList.add('pulse'); };
    const bend = (a, b) => { S.up.setAttribute('transform', `rotate(${a.toFixed(1)})`); S.lo.setAttribute('transform', `translate(70 0) rotate(${b.toFixed(1)})`); };
    const reach = (u) => { const L = (a, b) => (a + (b - a) * u).toFixed(1); S.hand.setAttribute('d', `M956 356 C ${L(930, 900)} ${L(360, 350)}, ${L(912, 800)} ${L(366, 360)}, ${L(900, 726)} ${L(372, 362)}`); };
    function think(a, b, happy) { S.thinkT.textContent = a; S.thinkT2.textContent = b; S.think.classList.toggle('happy', !!happy); }
    function parts() { svg.querySelectorAll('.rf-part').forEach((p) => p.classList.toggle('on', fixed.has(p.dataset.k))); }
    function run() {
      if (tl) tl.kill();
      parts();
      const has = (k) => fixed.has(k);
      gs && gs.set([S.dishes, S.served, S.steam, S.inner], { clearProps: 'all' }); bend(0, 0); reach(0);
      S.served.classList.remove('on'); S.dishes.style.opacity = '';
      think('…', '', false);
      if (reduce) {
        S.bot.setAttribute('transform', `translate(${REST} 0)`);
        S.steam.style.opacity = has('warm') ? '1' : '0'; S.served.classList.add('on'); S.dishes.style.opacity = '0';
        think(has('learn') ? '내가 좋아하는 걸' : '내가 자주 먹는 걸', has('learn') ? '기억해 줬네!' : '알아주면 좋겠다', has('learn'));
        return;
      }
      const pos = { x: 140 };
      const at = () => S.bot.setAttribute('transform', `translate(${pos.x.toFixed(1)} 0)`);
      at();
      tl = gs.timeline({ onUpdate: at });
      tl.to(pos, { x: 400, duration: 1.1, ease: 'power1.inOut' });
      if (has('nav')) { tl.fromTo(S.scan, { opacity: 0 }, { opacity: 1, duration: 0.25, repeat: 3, yoyo: true }, '>-0.1').to(pos, { x: 600, duration: 0.9, ease: 'none' }, '<'); }
      else {
        tl.call(() => { pulse('nav'); msg.textContent = '좁은 통로 — 부딪힐까 봐 머뭇거린다'; })
          .to(S.inner, { rotation: -3, transformOrigin: '50% 100%', duration: 0.18, repeat: 5, yoyo: true })
          .to(pos, { x: 600, duration: 1.9, ease: 'power1.inOut' });
      }
      tl.to(pos, { x: REST, duration: 0.45, ease: 'power1.out' });
      const arriveAt = tl.duration();
      if (!has('warm')) tl.call(() => { pulse('warm'); });
      if (has('arm')) {
        const j = { a: 0, b: 0 }, upd = () => bend(j.a, j.b);
        tl.to(j, { a: -16, b: 30, duration: 0.5, onUpdate: upd })
          .to(S.dishes, { x: 150, y: 0, duration: 0.7, ease: 'power1.inOut' }, '<0.15')
          .call(() => { S.dishes.style.opacity = '0'; S.served.classList.add('on'); gs.set(S.dishes, { x: 0 }); msg.textContent = '관절 팔이 음식을 식탁 위에 놓았다'; })
          .to(j, { a: 0, b: 0, duration: 0.5, onUpdate: upd });
      } else {
        const r = { u: 0 }, upd = () => reach(r.u);
        tl.call(() => { pulse('arm'); msg.textContent = '손님이 일어나 직접 음식을 내려야 한다'; })
          .to(r, { u: 1, duration: 0.7, onUpdate: upd })
          .call(() => { S.dishes.style.opacity = '0'; S.served.classList.add('on'); })
          .to(r, { u: 0, duration: 0.5, onUpdate: upd });
      }
      tl.call(() => {
        if (has('learn')) think('내가 좋아하는 걸', '기억해 줬네!', true); else { think('내가 자주 먹는 걸', '알아주면 좋겠다', false); pulse('learn'); }
        const left = Object.keys(PROB).filter((k) => !fixed.has(k));
        msg.textContent = left.length ? `남은 문제 ${left.length}개 — 번호 자리에 알맞은 부품을 붙여 보자` : '네 문제를 모두 고쳤다 — 그런데 비용은? 실제로 만들 수 있을까?';
      });
      if (!has('warm')) tl.to(S.steam, { opacity: 0, duration: arriveAt, ease: 'none' }, 0);   // 오는 동안 국이 식는다(맨 나중에 넣어야 뒤 순서가 밀리지 않는다)
    }
    function info(k) { const p = PROB[k]; msg.textContent = fixed.has(k) ? `${NAME[k]}: ${p.fix}` : `${p.name} — ${p.desc}`; }
    const shake = (e) => { e.classList.remove('bad'); e.getBoundingClientRect(); e.classList.add('bad'); };
    function attach(card, s) {
      if (!s) { msg.textContent = '그림의 번호 붙은 문제 자리 위에 놓아 보자'; return; }
      const k = s.dataset.k, c = card.dataset.k;
      if (k !== c) { shake(card); msg.textContent = `«${PROB[k].name}»에는 맞지 않다 — ${eun(NAME[c])} ${PROB[c].hint}`; return; }
      fixed.add(k); card.classList.add('used'); s.classList.add('fixed'); s.querySelector('.rf-mark text').textContent = '✓'; root.querySelector(`.rf-probs li[data-k="${k}"]`).classList.add('fixed');
      nEl.textContent = `${fixed.size} / 4`; costEl.style.width = `${[...fixed].reduce((n, x) => n + PROB[x].cost, 12)}%`;
      msg.textContent = `${NAME[k]}: ${PROB[k].fix} — 다시 일해 본다`;
      now.textContent = fixed.size === 4 ? '고칠수록 비용도 오른다 — 어느 개선이 가장 어려울까?' : `고친 문제 ${fixed.size} / 4 · 남은 번호를 찾아보자`;
      setTimeout(run, 700);
    }
    const drag = window.Drag.cards(cards, {
      find: (x) => x.closest && x.closest('#robofix .rf-spot'),
      hover: (t) => S.spots.forEach((x) => x.classList.toggle('target', x === t)),
      drop: attach,
      pick: (c) => { svg.classList.toggle('picking', !!c); if (c) msg.textContent = `${eul(c.textContent)} 붙일 번호 자리를 눌러요`; },
    });
    S.spots.forEach((s) => {
      const go = () => { if (drag.picked) { const c = drag.picked; drag.unpick(); attach(c, s); } else info(s.dataset.k); };
      s.addEventListener('click', go);
      s.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); go(); } });
    });
    costEl.style.width = '12%';
    S.bot.setAttribute('transform', 'translate(140 0)'); think('…', '', false);
    root._fix = { all: () => cards.forEach((c) => { if (!c.classList.contains('used')) attach(c, spot[c.dataset.k]); }), run, get tl() { return tl; } };
    return { setActive(on) { if (on && !started) { started = true; setTimeout(run, 500); } } };
  }
  window.RobotFix = { mount };
})();
