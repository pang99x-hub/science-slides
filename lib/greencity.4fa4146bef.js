/* 생태계평형 유지를 위한 노력(교과서 81쪽 그림 Ⅱ-9): 위에서 본 회색 도시를 손가락 붓으로 문질러 칠한다.
   옥상 → 옥상 정원, 빈터 → 숲·공원, 콘크리트 하천 → 풀과 흙의 물가(하천 복원). 칠한 비율이 문턱을 넘으면 나비·새·물고기와 왜가리가 돌아온다(모델). */
(function () {
  'use strict';
  const { el, pt, org, rng } = window.Eco;
  const C = 20, BR = 40;
  const NAME = { roof: '옥상 정원', lot: '숲·공원', river: '하천 복원' };

  function mount(root) {
    const svg = root.querySelector('.gr-svg'), now = root.querySelector('.gr-now');
    const it = root.querySelector('.gr-it'), ib = root.querySelector('.gr-ib');
    const meters = Object.fromEntries([...root.querySelectorAll('.gr-m')].map((m) => [m.dataset.k, { i: m.querySelector('i'), e: m.querySelector('em') }]));
    el('rect', { class: 'gr-street', x: -400, y: -300, width: 1856, height: 1300 }, svg);
    const areas = [];
    const R = rng(12);
    // 건물(옥상)과 빈터: 위 두 줄, 아래 한 줄
    const blocks = [];
    for (let r = 0; r < 2; r++) for (let c = 0; c < 5; c++) blocks.push([30 + c * 205, 30 + r * 205, 175, 175]);
    blocks.push([30, 590, 230, 90], [290, 590, 230, 90], [550, 590, 230, 90], [810, 590, 220, 90]);
    const lotIdx = new Set([2, 8, 12]);
    blocks.forEach(([x, y, w, h], i) => {
      const k = lotIdx.has(i) ? 'lot' : 'roof';
      el('rect', { class: k === 'lot' ? 'gr-lot' : 'gr-roof', x, y, width: w, height: h, rx: 6 }, svg);
      if (k === 'roof') { el('rect', { class: 'gr-vent', x: x + 16, y: y + 16, width: 30, height: 22 }, svg); el('circle', { class: 'gr-vent', cx: x + w - 30, cy: y + h - 30, r: 12 }, svg); }
      areas.push({ k, x, y, w, h });
    });
    // 하천: 곧은 콘크리트 물길
    el('rect', { class: 'gr-bank', x: -400, y: 446, width: 1856, height: 112 }, svg);
    el('rect', { class: 'gr-water', x: -400, y: 474, width: 1856, height: 56 }, svg);
    for (let x = 0; x < 1056; x += 44) el('path', { class: 'gr-joint', d: `M${x} 446 v 28 M ${x} 530 v 28` }, svg);
    areas.push({ k: 'river', x: 0, y: 446, w: 1056, h: 112 });
    const paintL = el('g', {}, svg), lifeL = el('g', {}, svg);
    // 칠할 수 있는 칸
    const cells = new Map(), total = { roof: 0, lot: 0, river: 0 }, done = { roof: 0, lot: 0, river: 0 };
    areas.forEach((a) => { for (let x = a.x; x < a.x + a.w - 1; x += C) for (let y = a.y; y < a.y + a.h - 1; y += C) { const key = `${Math.floor(x / C)},${Math.floor(y / C)}`; if (!cells.has(key)) { cells.set(key, { k: a.k, x, y, w: Math.min(C, a.x + a.w - x), h: Math.min(C, a.y + a.h - y), on: false, e: null }); total[a.k]++; } } });
    // 돌아올 생물(처음엔 숨김)
    const life = {
      roof: Array.from({ length: 7 }, () => { const b = areas.filter((a) => a.k === 'roof')[Math.floor(R() * 11)]; return org(lifeL, 'butterfly', b.x + 30 + R() * (b.w - 60), b.y + 40 + R() * (b.h - 60), 1.3); }),
      lot: [...areas.filter((a) => a.k === 'lot').flatMap((b) => [org(lifeL, 'tree', b.x + b.w * 0.3, b.y + b.h * 0.7, b.h > 100 ? 1.4 : 0.9), org(lifeL, 'tree', b.x + b.w * 0.7, b.y + b.h * 0.8, b.h > 100 ? 1.2 : 0.8), org(lifeL, 'sparrow', b.x + b.w * 0.5, b.y + b.h * 0.4, 1.2)])],
      river: [...Array.from({ length: 6 }, (_, i) => org(lifeL, 'fish', 80 + i * 170, 512, 1.3, i % 2 === 1)), org(lifeL, 'heron', 420, 470, 1.1), org(lifeL, 'heron', 860, 470, 1.1, true)],
    };
    Object.values(life).flat().forEach((g) => g.classList.add('gr-life'));
    const TH = { roof: 0.3, lot: 0.4, river: 0.5 };
    const WHO = { roof: '옥상 정원에 나비가 찾아왔다', lot: '숲과 공원에 새가 둥지를 틀었다', river: '되살린 물가에 물고기와 왜가리가 돌아왔다' };
    function brush(p) {
      const x0 = Math.floor((p.x - BR) / C), x1 = Math.floor((p.x + BR) / C), y0 = Math.floor((p.y - BR) / C), y1 = Math.floor((p.y + BR) / C);
      let any = false;
      for (let i = x0; i <= x1; i++) for (let j = y0; j <= y1; j++) {
        const c = cells.get(`${i},${j}`); if (!c || c.on) continue;
        if (Math.hypot(c.x + C / 2 - p.x, c.y + C / 2 - p.y) > BR) continue;
        c.on = true; done[c.k]++; any = true;
        c.e = el('rect', { class: `gr-cell ${c.k}${c.k === 'river' && c.y + C / 2 > 474 && c.y + C / 2 < 530 ? ' water' : ''}`, x: c.x, y: c.y, width: c.w + 0.5, height: c.h + 0.5 }, paintL);
      }
      if (any) paint();
    }
    function paint() {
      const back = [];
      for (const k of ['roof', 'lot', 'river']) {
        const f = total[k] ? done[k] / total[k] : 0;
        meters[k].i.style.width = (f * 100) + '%'; meters[k].e.textContent = Math.round(f * 100) + ' %';
        const on = f >= TH[k];
        life[k].forEach((g) => g.classList.toggle('on', on));
        if (on) back.push(WHO[k]);
      }
      ib.textContent = back.length ? back.join(' · ') : '아직 없다. 더 넓게 칠해 보자.';
      const all = Object.values(done).reduce((a, b) => a + b, 0) / Object.values(total).reduce((a, b) => a + b, 0);
      now.textContent = !all ? '옥상을 손가락으로 문질러 칠해 보자' : back.length < 3 ? `아직 돌아오지 않은 곳: ${['roof', 'lot', 'river'].filter((k) => done[k] / total[k] < TH[k]).map((k) => NAME[k]).join('·')}` : '세 곳 모두 생물이 돌아왔다';
      now.classList.toggle('done', back.length === 3);
      root._cover = all;
    }
    let drawing = false;
    const hit = el('rect', { class: 'gr-hit', x: 0, y: 0, width: 1056, height: 700 }, svg);
    hit.addEventListener('pointerdown', (e) => { e.preventDefault(); drawing = true; hit.setPointerCapture(e.pointerId); brush(pt(svg, e)); });
    hit.addEventListener('pointermove', (e) => { if (drawing) brush(pt(svg, e)); });
    ['pointerup', 'pointercancel'].forEach((t) => hit.addEventListener(t, () => { drawing = false; }));
    root.querySelector('#gr-clear').addEventListener('click', () => { cells.forEach((c) => { c.on = false; if (c.e) { c.e.remove(); c.e = null; } }); for (const k in done) done[k] = 0; paint(); });
    paint();
    root._gr = { get cover() { return root._cover; }, fill: (k) => { cells.forEach((c) => { if (c.k === k && !c.on) brush({ x: c.x + C / 2, y: c.y + C / 2 }); }); } };
    return {};
  }
  window.GreenCity = { mount };
})();
