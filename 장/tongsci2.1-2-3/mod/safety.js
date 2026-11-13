/* 3차시: 실험 전 위험 찾기(교과서 58쪽 안전). 그림 속 위험 네 곳을 누르면 그 자리가 고쳐지고 까닭이 뜬다.
   eye 맨눈으로 김 나는 용기 들여다보기 → 보안경 · hand 맨손 → 고무장갑 · food 실험대 위 간식 → 치움 · sink 개수대에 버림 → 정해진 통. */
(function () {
  'use strict';
  const { el } = window.EA;
  const FIX = {
    eye: ['보안경 쓰기', '물을 부으면 수증기가 갑자기 생겨 눈에 튈 수 있다.'],
    hand: ['면장갑 + 실험용 고무장갑', '용기가 뜨겁고, 남은 물질은 강한 염기성이다.'],
    food: ['실험실에서 먹지 않기', '음식을 «조리»해도 익었는지만 확인한다.'],
    sink: ['안내받은 곳에 버리기', '강한 염기성 물질을 개수대에 바로 버리지 않는다.'],
  };
  function person(g, x, y, shirt) {
    el('rect', { class: 'ea-sf-coat', x: x - 46, y: y + 40, width: 92, height: 150, rx: 26 }, g);
    el('circle', { class: 'ea-sf-head', cx: x, cy: y, r: 36 }, g);
    el('path', { class: 'ea-sf-hair', d: `M${x - 36} ${y - 4} q4 -40 36 -40 q32 0 36 40 q-10 -18 -36 -18 q-26 0 -36 18z`, fill: shirt }, g);
  }
  function mount(root) {
    const svg = root.querySelector('.ea-sf-svg');
    const now = root.querySelector('.sf-now'), list = Object.fromEntries([...root.querySelectorAll('.ea-sf-list li')].map((l) => [l.dataset.k, l]));
    el('rect', { class: 'ea-sf-wall', x: 0, y: 0, width: 1060, height: 700 }, svg);
    el('rect', { class: 'ea-sf-win', x: 60, y: 40, width: 220, height: 140, rx: 6 }, svg);
    el('rect', { class: 'ea-sf-bench', x: 0, y: 470, width: 1060, height: 40 }, svg);
    el('rect', { class: 'ea-sf-cab', x: 0, y: 510, width: 1060, height: 190 }, svg);
    // 학생 A와 반응 용기
    const A = el('g', {}, svg); person(A, 455, 262, '#3a2a1a'); el('path', { class: 'ea-sf-arm', d: 'M420 340 Q 330 380 262 412' }, A);
    el('rect', { class: 'ea-sf-cont', x: 380, y: 400, width: 150, height: 70, rx: 6 }, svg);
    const steam = [0, 1, 2].map((i) => el('path', { class: 'ea-sf-steam', d: `M${410 + i * 40} 396 q-12 -24 0 -48 q12 -24 0 -48` }, svg));
    const goggles = el('g', { class: 'ea-sf-gog' }, svg); el('rect', { x: 421, y: 248, width: 68, height: 24, rx: 10 }, goggles);
    // 맨손 + 주머니
    const handG = el('g', {}, svg);
    el('circle', { class: 'ea-sf-hand', cx: 250, cy: 420, r: 22 }, handG);
    el('rect', { class: 'ea-sf-pouch', x: 214, y: 428, width: 70, height: 36, rx: 8 }, handG);
    const glove = el('circle', { class: 'ea-sf-glove', cx: 250, cy: 420, r: 24 }, svg);
    // 간식
    const snack = el('g', { class: 'ea-sf-snack' }, svg);
    el('path', { class: 'ea-sf-chip', d: 'M600 470 l10 -60 h60 l10 60 z' }, snack);
    el('rect', { class: 'ea-sf-can', x: 690, y: 420, width: 30, height: 50, rx: 6 }, snack);
    const bag = el('g', { class: 'ea-sf-bag' }, svg); el('rect', { x: 860, y: 60, width: 150, height: 90, rx: 10 }, bag); el('text', { x: 935, y: 112, text: '가방(실험실 밖)' }, bag);
    // 학생 B와 개수대
    el('rect', { class: 'ea-sf-sink', x: 820, y: 456, width: 180, height: 30, rx: 6 }, svg);
    el('path', { class: 'ea-sf-tap', d: 'M960 456 V 400 h-30' }, svg);
    const B = el('g', {}, svg); person(B, 800, 250, '#6b4128');
    const pour = el('path', { class: 'ea-sf-pour', d: 'M880 380 q30 40 20 80' }, svg);
    el('rect', { class: 'ea-sf-cup', x: 850, y: 352, width: 50, height: 36, rx: 4, transform: 'rotate(40 875 370)' }, svg);
    const waste = el('g', { class: 'ea-sf-waste' }, svg); el('rect', { x: 720, y: 520, width: 90, height: 110, rx: 10 }, waste); el('text', { x: 765, y: 584, text: '모으는 통' }, waste);
    // 누를 곳
    const SPOT = { eye: [455, 262, 70], hand: [250, 430, 60], food: [655, 440, 70], sink: [895, 420, 80] };
    const found = new Set();
    const ripple = el('circle', { class: 'ea-sf-rip', r: 0 }, svg);
    function fix(k) {
      if (found.has(k)) return;
      found.add(k);
      svg.classList.add('f-' + k);
      const li = list[k]; li.classList.add('on'); li.querySelector('b').textContent = FIX[k][0]; li.querySelector('span').textContent = FIX[k][1];
      now.textContent = found.size < 4 ? `② 더 찾아보자 (${found.size} / 4)` : '③ 네 곳을 모두 고쳤다 — 이제 실험복을 입고 시작!';
      now.classList.toggle('done', found.size === 4);
    }
    for (const [k, [x, y, r]] of Object.entries(SPOT)) {
      const h = el('circle', { class: 'ea-sf-hit', cx: x, cy: y, r, tabindex: 0, role: 'button', 'aria-label': '위험해 보이는 곳' }, svg);
      h.addEventListener('click', (e) => { e.stopPropagation(); fix(k); });
      h.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); fix(k); } });
    }
    svg.addEventListener('click', (e) => {
      const p = window.EA.pt(svg, e);
      ripple.setAttribute('cx', p.x); ripple.setAttribute('cy', p.y);
      ripple.classList.remove('go'); void ripple.getBBox(); ripple.classList.add('go');
    });
    void steam; void pour; void glove; void goggles; void snack; void bag; void waste;
    root._sf = { fix };
    return {};
  }
  window.LabSafety = { mount };
})();
