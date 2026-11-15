/* 1차시 2장 해 보기(교과서 46~47쪽, 그림 Ⅰ-25): 8홈 홈판에 리트머스 종이·BTB·페놀프탈레인을 끌어 놓으면(엔진 Drag.cards)
   그 홈이 색으로 답하고, 오른쪽 표에 시험한 칸만 쌓인다. 리트머스는 젖은 아래쪽만 색이 바뀐다. */
(function () {
  'use strict';
  const { el, ind } = window.AB;
  const SUB = [
    { k: 'lemon', name: '레몬즙', kind: 'a', c: '#f6eaa6' },
    { k: 'vin', name: '식초', kind: 'a', c: '#f1e6cf' },
    { k: 'hcl', name: '묽은 염산', kind: 'a', c: '#e3f0f6' },
    { k: 'soda', name: '탄산음료', kind: 'a', c: '#e9f4ec' },
    { k: 'sugar', name: '설탕물', kind: 'n', c: '#e8f1f5' },
    { k: 'soap', name: '빨랫비누 물', kind: 'b', c: '#f1f1ef' },
    { k: 'bake', name: '제빵 소다 물', kind: 'b', c: '#e6eff4' },
    { k: 'naoh', name: '수산화 나트륨 수용액', short: '수산화 나트륨', kind: 'b', c: '#e3eef5' },
  ];
  const TOOLS = { blue: '푸른색 리트머스 종이', red: '붉은색 리트머스 종이', btb: 'BTB 용액', pp: '페놀프탈레인 용액' };
  const ORDER = ['blue', 'red', 'btb', 'pp'];
  function word(tool, kind) {
    if (tool === 'blue') return kind === 'a' ? '붉게' : '그대로';
    if (tool === 'red') return kind === 'b' ? '푸르게' : '그대로';
    if (tool === 'btb') return kind === 'a' ? '노란색' : kind === 'b' ? '파란색' : '초록색';
    return kind === 'b' ? '붉게' : '변화 없음';
  }

  function mount(root) {
    const svg = root.querySelector('.ab-wl-svg'), now = root.querySelector('.ab-wl-now'), msg = root.querySelector('.ab-wl-msg');
    const tbody = root.querySelector('.ab-wl-tbl tbody');
    tbody.innerHTML = SUB.map((s) => `<tr data-k="${s.k}"><th>${s.short || s.name}</th>${ORDER.map((t) => `<td data-t="${t}"></td>`).join('')}</tr>`).join('');
    el('rect', { x: 40, y: 40, width: 920, height: 520, rx: 40, fill: '#f8fafb', stroke: '#1d2433', 'stroke-width': 3 }, svg);
    el('rect', { x: 52, y: 52, width: 896, height: 496, rx: 32, fill: 'none', stroke: '#c9d3d6', 'stroke-width': 2 }, svg);
    const W = {};
    SUB.forEach((s, i) => {
      const x = 155 + (i % 4) * 230, y = i < 4 ? 175 : 410;
      const g = el('g', { class: 'ab-well', 'data-k': s.k, transform: `translate(${x} ${y})`, tabindex: 0, role: 'button', 'aria-label': s.name + ' 홈' }, svg);
      el('circle', { class: 'ab-well-rim', r: 80 }, g);
      const liq = el('circle', { class: 'ab-well-liq', r: 66, fill: s.c }, g);
      el('ellipse', { cx: -26, cy: -30, rx: 22, ry: 10, fill: '#fff', opacity: 0.55, transform: 'rotate(-30 -26 -30)' }, g);
      const strips = el('g', {}, g);
      el('text', { class: 'ab-wl-name', y: 110, text: s.short || s.name }, g);
      const res = el('text', { class: 'ab-wl-res', y: 52, text: '' }, g);
      W[s.k] = { s, g, liq, strips, res, done: {} };
    });
    function strip(w, tool) {
      const old = w.strips.querySelector(`[data-t="${tool}"]`); if (old) old.remove();
      const dx = tool === 'blue' ? -30 : 30, start = tool === 'blue' ? '#5c86cf' : '#d95560';
      const g = el('g', { 'data-t': tool, transform: `translate(${dx} -10) rotate(${tool === 'blue' ? -18 : 18})` }, w.strips);
      el('rect', { x: -11, y: -92, width: 22, height: 70, rx: 3, fill: start, stroke: '#1d2433', 'stroke-width': 2 }, g);
      const wet = el('rect', { class: 'ab-strip', x: -11, y: -24, width: 22, height: 74, rx: 3, fill: start, stroke: '#1d2433', 'stroke-width': 2 }, g);
      requestAnimationFrame(() => requestAnimationFrame(() => wet.setAttribute('fill', ind(tool, w.s.kind))));
    }
    function apply(k, tool) {
      const w = W[k], kind = w.s.kind;
      if (tool === 'blue' || tool === 'red') strip(w, tool);
      else {
        const c = ind(tool, kind);
        w.liq.setAttribute('fill', c || w.s.c);
        w.res.textContent = tool === 'pp' && !c ? '변화 없음' : '';
      }
      w.done[tool] = true;
      const td = tbody.querySelector(`tr[data-k="${k}"] td[data-t="${tool}"]`);
      const c = ind(tool, kind) || '#ffffff';
      td.innerHTML = `<span class="ab-cell"><i style="--c:${c}"></i>${word(tool, kind)}</span>`;
      td.classList.remove('new'); void td.offsetWidth; td.classList.add('new');
      msg.innerHTML = `<b>${w.s.name}</b>에 ${TOOLS[tool]} → <b>${word(tool, kind)}</b>`;
      const n = tbody.querySelectorAll('td .ab-cell').length;
      now.textContent = n >= 32 ? '모두 시험했다 — 같은 색을 낸 물질끼리 묶어 보자'
        : n >= 12 ? '③ 같은 색끼리 묶이는 물질은? 나머지 칸도 채워 보자'
        : n >= 2 ? '② 다른 도구로도, 다른 홈에도 해 보자' : '① 푸른색 리트머스 종이를 레몬즙 홈에 놓아 보자';
      now.classList.toggle('done', n >= 32);
    }
    function reset() {
      Object.values(W).forEach((w) => { w.strips.innerHTML = ''; w.liq.setAttribute('fill', w.s.c); w.res.textContent = ''; w.done = {}; });
      tbody.querySelectorAll('td').forEach((td) => { td.innerHTML = ''; });
      msg.textContent = '홈판을 씻었다. 표의 칸은 직접 시험한 것만 채워진다.';
      now.textContent = '① 푸른색 리트머스 종이를 레몬즙 홈에 놓아 보자'; now.classList.remove('done');
    }
    const cards = [...root.querySelectorAll('.ab-tool')];
    const wells = Object.values(W).map((w) => w.g);
    const drag = window.Drag.cards(cards, {
      find: (x) => { const g = x.closest && x.closest('.ab-well'); return g && svg.contains(g) ? g : null; },
      hover: (g) => wells.forEach((w) => w.classList.toggle('target', w === g)),
      drop: (c, g) => { if (g) apply(g.dataset.k, c.dataset.k); else msg.textContent = '홈 위에 놓아 보자'; },
      pick: (c) => { wells.forEach((w) => w.classList.toggle('pick', !!c)); if (c) msg.textContent = `${TOOLS[c.dataset.k]}을(를) 넣을 홈을 눌러요`; },
    });
    wells.forEach((g) => {
      const go = () => { if (drag.picked) { const c = drag.picked; drag.unpick(); apply(g.dataset.k, c.dataset.k); } else msg.textContent = '먼저 아래 시험 도구를 골라요(끌어다 놓아도 돼요)'; };
      g.addEventListener('click', go);
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); go(); } });
    });
    root.querySelector('.ab-reset').addEventListener('click', reset);
    root._wl = { apply, all() { SUB.forEach((s) => ORDER.forEach((t) => apply(s.k, t))); } };
    return {};
  }
  window.ABWells = { mount };
})();
