/* 2차시 3장 생물자원(교과서 28쪽 그림 Ⅰ-18): 생물 카드를 마을의 알맞은 시설에 끌어 넣으면 시설이 돌아가 자원이 나온다.
   벼 → 쌀(식량) · 목화 → 옷(의복 재료) · 디기탈리스 → 심장병 치료제(의약품) · 옥수수 → 바이오에탄올(에너지) · 효모 → 빵(산업용 재료) · 잘 보전된 숲 → 쉼터(휴식처).
   카드를 누른 뒤 시설을 눌러도 된다(엔진 drag.js). */
(function () {
  'use strict';
  const { el, shake, josa } = window.Kit;
  const SPOT = {
    rice: { at: [24, 70], fac: '방앗간', out: '쌀', use: '식량 제공', ico: '🍚', roof: '#c0563f', hint: '벼는 낟알을 찧어 먹는다' },
    cotton: { at: [374, 70], fac: '옷 공장', out: '옷감·옷', use: '의복 재료 제공', ico: '👕', roof: '#6c8fe0', hint: '목화 솜에서 실을 뽑는다' },
    digi: { at: [724, 70], fac: '제약 연구소', out: '심장병 치료제', use: '의약품 제공', ico: '💊', roof: '#7d4cc4', hint: '디기탈리스에서 얻은 물질은 약이 된다' },
    corn: { at: [24, 370], fac: '바이오 연료 공장', out: '바이오에탄올', use: '에너지 제공', ico: '⛽', roof: '#e9731a', hint: '옥수수·사탕수수로 연료를 만든다' },
    yeast: { at: [374, 370], fac: '식품 공장', out: '빵', use: '산업용 재료 제공', ico: '🍞', roof: '#c49a2c', hint: '효모는 빵을 부풀리는 미생물이다' },
    forest: { at: [724, 370], fac: '생태 공원', out: '쉼터·관광', use: '휴식처 제공', ico: '🏕️', roof: '#3f8a4a', hint: '잘 보전된 생태계는 쉬는 곳이 된다' },
  };

  function mount(root) {
    const svg = root.querySelector('.rs-svg'), now = root.querySelector('.rs-now'), msg = root.querySelector('.rs-msg'), cnt = root.querySelector('.rs-count');
    const cards = [...root.querySelectorAll('.rs-card')];
    el('rect', { class: 'rs-bg', width: 1056, height: 680 }, svg);
    el('path', { class: 'rs-road', d: 'M0 350 H1056 M352 0 V680 M702 0 V680' }, svg);
    const spots = {};
    for (const [k, s] of Object.entries(SPOT)) {
      const [x, y] = s.at;
      const g = el('g', { class: 'rs-spot', 'data-k': k, tabindex: '0', role: 'button', 'aria-label': `${s.fac}: 알맞은 생물을 넣어 보자`, transform: `translate(${x} ${y})` }, svg);
      el('rect', { class: 'rs-lot', width: 308, height: 262, rx: 14 }, g);
      el('text', { class: 'rs-fac', x: 18, y: 36 }, g).textContent = s.fac;
      const b = el('g', { class: 'rs-bld', transform: 'translate(40 70)' }, g);
      el('rect', { x: 0, y: 40, width: 130, height: 110, class: 'rs-wall' }, b);
      el('path', { d: 'M-10 44 L 65 0 L 140 44 Z', fill: s.roof, class: 'rs-ln' }, b);
      el('rect', { x: 50, y: 100, width: 30, height: 50, class: 'rs-door' }, b);
      el('rect', { x: 100, y: -10, width: 18, height: 40, class: 'rs-wall' }, b);
      const smoke = el('g', { class: 'rs-smoke' }, b); for (let i = 0; i < 2; i++) el('circle', { cx: 118 + i * 12, cy: -18 - i * 10, r: 7 + i * 2 }, smoke);
      const gear = el('g', { class: 'rs-gear', transform: 'translate(25 80)' }, b); el('circle', { r: 16, class: 'rs-gearc' }, gear); for (let i = 0; i < 6; i++) el('rect', { x: -4, y: -22, width: 8, height: 10, transform: `rotate(${i * 60})`, class: 'rs-gearc' }, gear);
      const drop = el('g', { class: 'rs-drop' }, g); el('rect', { x: 194, y: 96, width: 96, height: 96, rx: 12, class: 'rs-in' }, drop); el('text', { x: 242, y: 150, class: 'rs-plus' }, drop).textContent = '+';
      const out = el('g', { class: 'rs-out' }, g); el('text', { x: 242, y: 160, class: 'rs-ico' }, out).textContent = s.ico; el('text', { x: 154, y: 236, class: 'rs-use' }, out).textContent = `${s.out} → ${s.use}`;
      spots[k] = { g, done: false };
    }
    let n = 0;
    function put(card, spot) {
      if (!spot) { msg.textContent = '마을의 시설 위에 놓아 보자'; return; }
      const k = card.dataset.k, s = SPOT[spot.dataset.k], C = card.textContent.trim();
      if (spots[spot.dataset.k].done) { msg.textContent = `${s.fac}에는 이미 생물을 넣었다`; return; }
      if (spot.dataset.k !== k) { shake(card); msg.innerHTML = `${josa(C, '은는')} ${s.fac}에 맞지 않는다 — ${s.hint}.`; return; }
      spots[k].done = true; spot.classList.add('done'); card.classList.add('used'); n++;
      msg.innerHTML = `<b>${C} → ${s.out}</b>: ${s.use}`;
      cnt.textContent = `얻은 생물자원 ${n} / 6가지`;
      now.textContent = n < 6 ? '다른 생물도 알맞은 시설에 넣어 보자' : '여섯 가지 생물에서 여섯 가지 자원을 얻었다';
      if (window.gsap && !window.Kit.reduce) gsap.fromTo(spot.querySelector('.rs-ico'), { scale: 0.3, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
    }
    const drag = window.Drag.cards(cards, {
      find: (x) => x.closest && x.closest('#res .rs-spot'),
      hover: (t) => Object.values(spots).forEach((s) => s.g.classList.toggle('target', s.g === t)),
      drop: put,
      pick: (c) => { svg.classList.toggle('picking', !!c); if (c) msg.textContent = `${josa(c.textContent.trim(), '을를')} 넣을 시설을 눌러 보자`; },
    });
    Object.values(spots).forEach(({ g }) => {
      const go = () => { if (drag.picked) { const c = drag.picked; drag.unpick(); put(c, g); } else msg.textContent = `${SPOT[g.dataset.k].fac} — 알맞은 생물 카드를 끌어 넣어 보자`; };
      g.addEventListener('click', go);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); go(); } });
    });
    cnt.textContent = '얻은 생물자원 0 / 6가지';
    root._res = { put(k) { put(cards.find((c) => c.dataset.k === k), spots[k].g); }, wrong() { put(cards.find((c) => c.dataset.k === 'corn'), spots.rice.g); } };
    return {};
  }
  window.BioRes = { mount };
})();
