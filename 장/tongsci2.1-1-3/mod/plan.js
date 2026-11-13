/* 3차시 5장 실천 점검표(교과서 31쪽 과정 3): 실천 카드를 두 축 판 위 아무 곳에나 끌어 놓는다.
   가로 = 지금 바로 할 수 있는 정도(오른쪽일수록 쉽다), 세로 = 생물다양성에 도움이 되는 정도(위일수록 크다).
   오른쪽 위 칸(쉽고 도움이 큰 것)에 놓인 카드가 오른쪽 «우리 점검표»에 오른다. 정답은 없고, 왜 그 자리에 놓았는지 말하게 한다. */
(function () {
  'use strict';
  const { el, hold, clamp } = window.Kit;
  const BX = 244, BY = 30, BW = 790, BH = 600;
  const CARDS = ['다회용품 쓰기', '자전거·대중교통 타기', '서식지 주변 쓰레기 줍기', '다친 야생 동물 구조 신고', '보호 활동 모임 함께하기', '분리배출 하기', '전기 아껴 쓰기', '기른 동물 풀어 주지 않기', '친환경 제품 고르기', '보전 표어 만들어 알리기', '국립 공원 새로 지정하기', '국제 협약 맺기'];

  function mount(root) {
    const svg = root.querySelector('.pl-svg'), now = root.querySelector('.pl-now'), list = root.querySelector('.pl-list'), cnt = root.querySelector('.pl-cnt');
    el('rect', { class: 'pl-bg', width: 1056, height: 700 }, svg);
    el('rect', { class: 'pl-board', x: BX, y: BY, width: BW, height: BH, rx: 10 }, svg);
    el('rect', { class: 'pl-best', x: BX + BW / 2, y: BY, width: BW / 2, height: BH / 2, rx: 10 }, svg);
    el('path', { class: 'pl-axis', d: `M${BX} ${BY + BH / 2} h ${BW} M${BX + BW / 2} ${BY} v ${BH}` }, svg);
    el('text', { class: 'pl-bestt', x: BX + BW - 16, y: BY + 34 }, svg).textContent = '우리 점검표';
    el('text', { class: 'pl-ax', x: BX + BW - 10, y: BY + BH / 2 - 10 }, svg).textContent = '바로 할 수 있다 →';
    el('text', { class: 'pl-ax l', x: BX + 10, y: BY + BH / 2 - 10 }, svg).textContent = '← 어렵다';
    el('text', { class: 'pl-ax v', x: BX + BW / 2 + 10, y: BY + 26 }, svg).textContent = '↑ 도움이 크다';
    el('text', { class: 'pl-ax v', x: BX + BW / 2 + 10, y: BY + BH - 12 }, svg).textContent = '↓ 도움이 작다';
    el('text', { class: 'pl-pile', x: 120, y: 690 }, svg).textContent = '실천 카드';
    const cards = CARDS.map((t, i) => {
      const g = el('g', { class: 'pl-card', tabindex: '0', role: 'button', 'aria-label': `${t} 카드: 판 위로 끌어 놓기` }, svg);
      const w = 204;   // 모든 카드를 같은 너비로(가장 긴 이름이 들어가는 폭)
      el('rect', { x: -w / 2, y: -22, width: w, height: 44, rx: 10 }, g); el('text', { y: 7 }, g).textContent = t;
      const c = { t, g, w, x: 120, y: 84 + i * 50, home: [120, 84 + i * 50], on: false };
      return c;
    });
    const best = (c) => c.on && c.x > BX + BW / 2 && c.y < BY + BH / 2;
    function paint() {
      cards.forEach((c) => { c.g.setAttribute('transform', `translate(${c.x.toFixed(1)} ${c.y.toFixed(1)})`); c.g.classList.toggle('best', best(c)); c.g.classList.toggle('pile', !c.on); });
      const B = cards.filter(best).sort((a, b) => a.y - b.y);
      list.innerHTML = B.length ? B.map((c) => `<li><i></i>${c.t}</li>`).join('') : '<li class="pl-empty">오른쪽 위 칸에 카드를 놓으면 여기에 오른다</li>';
      const placed = cards.filter((c) => c.on).length;
      cnt.textContent = `판에 놓은 카드 ${placed} / ${cards.length}`;
      now.textContent = placed < 4 ? '카드를 판 위 알맞다고 생각하는 곳에 끌어 놓자' : B.length ? '왜 그 자리에 놓았는지 모둠에서 말해 보자' : '오른쪽 위 칸에도 놓아 보자';
    }
    cards.forEach((c) => {
      hold(c.g, {
        down() { c.g.classList.add('drag'); svg.appendChild(c.g); },
        move(p) { c.x = clamp(p.x, 20, 1036); c.y = clamp(p.y, 24, 676); paint(); },
        up() { c.g.classList.remove('drag'); c.on = c.x > BX && c.x < BX + BW && c.y > BY && c.y < BY + BH; if (!c.on) { [c.x, c.y] = c.home; } else { c.x = clamp(c.x, BX + c.w / 2, BX + BW - c.w / 2); } paint(); },
      }, svg);
      c.g.addEventListener('keydown', (e) => { const d = { ArrowLeft: [-40, 0], ArrowRight: [40, 0], ArrowUp: [0, -40], ArrowDown: [0, 40] }[e.key]; if (!d) return; e.preventDefault(); e.stopPropagation(); if (!c.on) { c.on = true; c.x = BX + BW / 2; c.y = BY + BH / 2; } c.x = clamp(c.x + d[0], BX + 20, BX + BW - 20); c.y = clamp(c.y + d[1], BY + 20, BY + BH - 20); paint(); });
    });
    paint();
    root._plan = { put(i, fx, fy) { const c = cards[i]; c.on = true; c.x = BX + fx * BW; c.y = BY + fy * BH; paint(); } };
    return {};
  }
  window.ActPlan = { mount };
})();
