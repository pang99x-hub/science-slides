/* 과학자의 연구 윤리(교과서 153쪽 그림 Ⅲ-7): 연구실 벽의 다섯 팻말(정직성과 개방성·실험 대상에 대한 존중·지식 재산권 존중·상호 존중·사회적 책임)과
   그 아래 실험대의 물건. 그림 밑 사례 카드를 알맞은 팻말에 놓으면 그 자리가 바르게 바뀌고(문제 → 바른 모습), 틀리면 카드가 흔들리며 힌트가 뜬다. 사례는 만든 것. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const P = {
    honest: { name: ['정직성과', '개방성'], desc: '연구 절차와 결과를 조작하거나 꾸며 내지 않는다. 학문 발전을 위해 연구 내용을 공개한다.', card: '실험 결과의 숫자를 바라는 대로 고쳐 발표했다', fix: '고친 숫자를 되돌리고 원래 자료를 함께 공개했다', hint: '결과를 꾸미지 않는 것과 관련 있다' },
    subject: { name: ['실험 대상에', '대한 존중'], desc: '실험 대상을 윤리적으로 대하고 그 생명과 존엄성을 존중한다.', card: '실험동물을 좁은 우리에 함부로 가두어 두었다', fix: '넓은 우리에 물과 깔짚을 넣어 주었다', hint: '실험에 쓰이는 생명을 대하는 태도와 관련 있다' },
    ip: { name: ['지식 재산권', '존중'], desc: '다른 과학자의 연구 결과를 함부로 쓰지 않는다.', card: '다른 과학자의 그래프를 출처 없이 내 논문에 실었다', fix: '그래프에 출처를 밝혔다', hint: '남의 연구 결과를 쓰는 방법과 관련 있다' },
    mutual: { name: ['상호 존중'], desc: '함께 연구하는 동료를 존중하고, 참여한 사람들의 성과를 공정하게 나눈다.', card: '함께 연구한 동료의 이름을 논문에서 뺐다', fix: '동료의 이름을 저자에 넣었다', hint: '함께 연구한 사람과의 관계와 관련 있다' },
    social: { name: ['사회적 책임'], desc: '사회에 악영향을 주는 연구는 피하고, 공공의 이익을 위해 노력한다.', card: '사회에 해를 끼칠 수 있는 연구를 알면서도 그대로 진행했다', fix: '해로운 연구를 멈추고 공공에 이로운 연구로 바꾸었다', hint: '연구가 사회에 미칠 영향과 관련 있다' },
  };
  const KEYS = ['honest', 'subject', 'ip', 'mutual', 'social'];

  function station(svg, k, cx) {
    const g = el('g', { class: 're-st', 'data-k': k }, svg);
    const bad = el('g', { class: 're-bad' }, g), good = el('g', { class: 're-good' }, g);
    const y = 420;
    if (k === 'honest') {
      el('rect', { class: 're-mon', x: cx - 70, y: y - 130, width: 140, height: 100, rx: 8 }, g); el('rect', { class: 're-stand', x: cx - 10, y: y - 30, width: 20, height: 30 }, g);
      [0, 1, 2, 3].forEach((i) => el('rect', { class: 're-bar', x: cx - 52 + i * 28, y: y - 50 - [20, 34, 28, 40][i], width: 18, height: [20, 34, 28, 40][i] }, g));
      el('rect', { class: 're-barx', x: cx + 32, y: y - 122, width: 18, height: 72 }, bad); el('path', { class: 're-erase', d: `M${cx + 24} ${y - 126} l 34 0 M ${cx + 24} ${y - 118} l 34 0` }, bad);
      const f = el('g', { transform: `translate(${cx + 40} ${y - 6})` }, good); el('path', { class: 're-folder', d: 'M-34 0 v -34 h 22 l 8 8 h 38 v 26 z' }, f); el('text', { class: 're-tag', x: 0, y: -10 }, f).textContent = '공개';
    } else if (k === 'subject') {
      el('rect', { class: 're-cage', x: cx - 40, y: y - 54, width: 80, height: 54 }, bad); [1, 2, 3].forEach((i) => el('path', { class: 're-wire', d: `M${cx - 40 + i * 20} ${y - 54} v 54` }, bad));
      el('ellipse', { class: 're-mouse', cx, cy: y - 14, rx: 16, ry: 10 }, bad);
      el('rect', { class: 're-cage big', x: cx - 80, y: y - 80, width: 160, height: 80, rx: 6 }, good); el('rect', { class: 're-bed', x: cx - 76, y: y - 18, width: 152, height: 16 }, good);
      el('ellipse', { class: 're-mouse', cx: cx - 20, cy: y - 26, rx: 16, ry: 10 }, good); el('rect', { class: 're-water', x: cx + 44, y: y - 74, width: 14, height: 40, rx: 4 }, good);
    } else if (k === 'ip') {
      el('rect', { class: 're-paper', x: cx - 60, y: y - 140, width: 120, height: 140 }, g); [0, 1, 2].forEach((i) => el('path', { class: 're-txt', d: `M${cx - 46} ${y - 124 + i * 12} h 92` }, g));
      el('rect', { class: 're-chart', x: cx - 46, y: y - 82, width: 92, height: 56 }, g); el('path', { class: 're-cline', d: `M${cx - 40} ${y - 34} l 24 -16 l 20 8 l 30 -26` }, g);
      el('text', { class: 're-q', x: cx, y: y - 8 }, bad).textContent = '출처?';
      el('text', { class: 're-tag ok', x: cx, y: y - 8 }, good).textContent = '[출처: ○○ 연구팀]';
    } else if (k === 'mutual') {
      el('rect', { class: 're-paper', x: cx - 60, y: y - 140, width: 120, height: 100 }, g);
      el('text', { class: 're-auth', x: cx, y: y - 112 }, bad).textContent = '저자: 김○○';
      el('text', { class: 're-auth sm', x: cx, y: y - 112 }, good).textContent = '저자 김○○·이○○';
      [0, 1].forEach((i) => el('path', { class: 're-txt', d: `M${cx - 46} ${y - 92 + i * 12} h 92` }, g));
      const m = el('g', { transform: `translate(${cx + 84} ${y})` }, g); el('path', { class: 're-body', d: 'M-16 0 v -40 a 16 16 0 0 1 32 0 v 40 z' }, m); el('circle', { class: 're-face', cy: -56, r: 13 }, m);
      el('path', { class: 're-mouth', d: 'M-5 -50 q 5 -4 10 0' }, el('g', { transform: `translate(${cx + 84} ${y})` }, bad));
      el('path', { class: 're-mouth', d: 'M-5 -52 q 5 5 10 0' }, el('g', { transform: `translate(${cx + 84} ${y})` }, good));
    } else {
      const f = el('g', { transform: `translate(${cx} ${y})` }, g); el('path', { class: 're-folder', d: 'M-60 0 v -70 h 40 l 12 12 h 68 v 58 z' }, f);
      el('text', { class: 're-tag bad', x: cx, y: y - 22 }, bad).textContent = '해로운 물질 연구';
      el('rect', { class: 're-stop', x: cx - 50, y: y - 64, width: 100, height: 26, rx: 4, transform: `rotate(-10 ${cx} ${y - 50})` }, good); el('text', { class: 're-stopt', x: cx, y: y - 45, transform: `rotate(-10 ${cx} ${y - 50})` }, good).textContent = '중단';
      el('text', { class: 're-tag ok', x: cx, y: y - 12 }, good).textContent = '깨끗한 물 연구로';
    }
    g.appendChild(bad); g.appendChild(good);   // 문제·바른 모습 표시는 물건 위에
    return g;
  }

  function mount(root) {
    const svg = root.querySelector('.re-svg'), now = root.querySelector('.re-now');
    const it = root.querySelector('.re-it'), ib = root.querySelector('.re-ib'), msg = root.querySelector('.re-msg'), score = root.querySelector('.re-score');
    const cards = [...root.querySelectorAll('.re-card')];
    el('rect', { class: 're-wall', x: -400, y: -300, width: 1856, height: 760 }, svg);
    el('rect', { class: 're-floor', x: -400, y: 460, width: 1856, height: 500 }, svg);
    el('rect', { class: 're-bench', x: 20, y: 420, width: 1016, height: 26, rx: 4 }, svg); el('rect', { class: 're-benchf', x: 30, y: 446, width: 996, height: 120 }, svg);
    const X = [116, 320, 528, 736, 940];
    const spots = KEYS.map((k, i) => {
      const s = el('g', { class: 're-spot', 'data-k': k, tabindex: '0', role: 'button', 'aria-label': P[k].name.join(' ') }, svg);
      el('rect', { class: 're-zone', x: X[i] - 100, y: 116, width: 200, height: 334, rx: 16 }, s);
      const b = el('g', { class: 're-sign' }, s); el('rect', { x: X[i] - 90, y: 130, width: 180, height: 76, rx: 10 }, b);
      P[k].name.forEach((t, j) => { el('text', { x: X[i], y: P[k].name.length === 1 ? 178 : 162 + j * 28 }, b).textContent = t; });
      const m = el('g', { class: 're-mark', transform: `translate(${X[i] + 84} 134)` }, s); el('circle', { r: 17 }, m); el('text', { y: 7 }, m).textContent = '?';
      station(s, k, X[i]);
      return s;
    });
    const done = new Set();
    const shake = (e) => { e.classList.remove('bad'); e.getBoundingClientRect(); e.classList.add('bad'); };
    function info(k) { it.textContent = P[k].name.join(' '); ib.textContent = P[k].desc; spots.forEach((s) => s.classList.toggle('on', s.dataset.k === k)); }
    function put(card, s, quiet) {
      if (!s) { msg.textContent = '연구실의 팻말 자리 위에 놓아 보자'; return; }
      const k = s.dataset.k, c = card.dataset.k;
      if (k !== c) { shake(card); msg.textContent = `«${P[k].name.join(' ')}»과는 다르다 — 이 사례는 ${P[c].hint}`; return; }
      done.add(k); card.classList.add('used'); s.classList.add('fixed'); s.querySelector('.re-mark text').textContent = '✓';
      info(k);
      if (!quiet) msg.textContent = `«${P[k].card}» → ${P[k].fix}`;
      score.textContent = `바로잡은 자리 ${done.size} / 5`;
      now.textContent = done.size === 5 ? '다섯 원칙을 모두 지킨 연구실' : `남은 사례 ${5 - done.size}장`;
      now.classList.toggle('done', done.size === 5);
    }
    const drag = window.Drag.cards(cards, {
      find: (x) => x.closest && x.closest('#reseth .re-spot'),
      hover: (s) => spots.forEach((x) => x.classList.toggle('target', x === s)),
      drop: put,
      pick: (c) => { svg.classList.toggle('picking', !!c); if (c) msg.textContent = `«${P[c.dataset.k].card}» — 놓을 팻말 자리를 눌러요`; },
    });
    cards.forEach((c) => c.addEventListener('pointerenter', () => { if (!drag.picked) msg.textContent = `사례: ${P[c.dataset.k].card}`; }));
    spots.forEach((s) => {
      const go = () => { if (drag.picked) { const c = drag.picked; drag.unpick(); put(c, s); } else info(s.dataset.k); };
      s.addEventListener('click', go);
      s.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); go(); } });
    });
    root.querySelector('#re-all').addEventListener('click', () => cards.forEach((c) => { if (!c.classList.contains('used')) put(c, spots.find((s) => s.dataset.k === c.dataset.k), true); }));
    return {};
  }
  window.LabEthics = { mount };
})();
