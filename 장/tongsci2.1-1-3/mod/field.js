/* 1차시 2장 유전적 다양성(교과서 27쪽): 같은 작물(한 종)의 네 품종으로 밭을 붓으로 칠해 심고, 곰팡이 병을 퍼뜨린다.
   병은 «가» 품종만 걸린다(가는 수확이 가장 많아 한 품종만 심고 싶게 만든다). 병든 포기 옆(8칸)과 바람에 날린 포자(반지름 3칸)로 번진다.
   다른 품종이 끼어 있으면 번지는 길이 끊겨 «가»도 일부 살아남는다. 수확량·병 저항은 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const { el, hold, clamp, rand } = window.Kit;
  const C = 13, Rw = 7, S = 74, X0 = 47, Y0 = 66;
  const KINDS = [
    { k: 'a', name: '가', fruit: '#f2c230', yield: 10, weak: true },
    { k: 'b', name: '나', fruit: '#d9543f', yield: 7 },
    { k: 'c', name: '다', fruit: '#7d4cc4', yield: 7 },
    { k: 'd', name: '라', fruit: '#e9e2c6', yield: 6 },
  ];
  const KI = Object.fromEntries(KINDS.map((k, i) => [k.k, i]));

  function mount(root) {
    const svg = root.querySelector('.gf-svg'), now = root.querySelector('.gf-now');
    const brushes = [...root.querySelectorAll('.gf-brush')], go = root.querySelector('.gf-go'), again = root.querySelector('.gf-again');
    const yb = root.querySelector('.gf-yield i'), yv = root.querySelector('.gf-yv'), sv = root.querySelector('.gf-sv'), msg = root.querySelector('.gf-msg'), mix = root.querySelector('.gf-mix');
    el('rect', { class: 'gf-bg', width: 1056, height: 660 }, svg);
    el('rect', { class: 'gf-soil', x: X0 - 12, y: Y0 - 14, width: C * S + 24, height: Rw * S + 26, rx: 14 }, svg);
    el('text', { class: 'gf-cap', x: 528, y: 634 }, svg).textContent = '한 종의 작물 밭 · 품종 = 같은 종 안의 유전자 차이';
    const cells = [];
    for (let r = 0; r < Rw; r++) for (let c = 0; c < C; c++) {
      const x = X0 + c * S + S / 2, y = Y0 + r * S + S / 2;
      const g = el('g', { class: 'gf-cell', transform: `translate(${x} ${y})` }, svg);
      el('path', { class: 'gf-row', d: 'M-30 26 h60' }, g);
      const plant = el('g', { class: 'gf-plant' }, g);
      el('path', { class: 'gf-stem', d: 'M0 24 v -30' }, plant);
      el('path', { class: 'gf-leaf', d: 'M0 8 q -20 -4 -24 -18 q 16 0 24 14 M0 2 q 20 -4 24 -18 q -16 0 -24 14' }, plant);
      const fr = el('g', {}, plant); const fruits = [[-8, -12], [8, -14], [0, -22]].map(([a, b]) => el('circle', { cx: a, cy: b, r: 7, class: 'gf-fruit' }, fr));
      const spot = el('g', { class: 'gf-spot' }, g); for (const [a, b] of [[-10, 0], [8, -6], [2, 10], [-4, -16]]) el('circle', { cx: a, cy: b, r: 5 }, spot);
      cells.push({ r, c, x, y, g, fruits, kind: null, sick: 0, dead: false });
    }
    const hand = el('circle', { class: 'gf-hand', r: S * 0.9, cx: -200, cy: -200 }, svg);
    let brush = 'a', run = null, rnd = rand(5);
    const at = (r, c) => (r >= 0 && r < Rw && c >= 0 && c < C ? cells[r * C + c] : null);
    function paintCell(cl) {
      cl.g.classList.toggle('on', !!cl.kind); cl.g.classList.toggle('sick', cl.sick > 0 && !cl.dead); cl.g.classList.toggle('dead', cl.dead);
      if (cl.kind) cl.fruits.forEach((f) => f.setAttribute('fill', KINDS[KI[cl.kind]].fruit));
    }
    function totals() {
      const planted = cells.filter((x) => x.kind), alive = planted.filter((x) => !x.dead);
      const y = alive.reduce((a, x) => a + KINDS[KI[x.kind]].yield, 0), max = C * Rw * 10;
      yb.style.width = (y / max * 100).toFixed(1) + '%'; yv.textContent = `${y}`;
      sv.textContent = `${alive.length} / ${planted.length}포기`;
      const n = new Set(planted.map((x) => x.kind)).size;
      mix.textContent = planted.length ? `심은 품종 ${n}가지` : '아직 심지 않았다';
      return { planted: planted.length, alive: alive.length, kinds: n };
    }
    function paintAt(p) {
      if (run) return;
      hand.setAttribute('cx', p.x); hand.setAttribute('cy', p.y);
      cells.forEach((cl) => { if (Math.hypot(cl.x - p.x, cl.y - p.y) < S * 0.95) { cl.kind = brush; cl.sick = 0; cl.dead = false; paintCell(cl); } });
      const t = totals();
      now.textContent = t.planted < C * Rw ? '붓으로 밭을 칠해 모두 심어 보자' : '이제 «곰팡이 병 퍼뜨리기»를 눌러 보자';
      msg.textContent = '';
    }
    hold(svg, { down: (p) => { if (run) return false; paintAt(p); }, move: paintAt, up: () => hand.setAttribute('cx', -200) }, svg);
    brushes.forEach((b) => b.addEventListener('click', () => { brush = b.dataset.k; brushes.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); }));

    function step() {
      const sick = cells.filter((x) => x.sick > 0 && !x.dead), next = [];
      sick.forEach((s) => {
        s.sick++; if (s.sick > 3) s.dead = true;
        for (let dr = -3; dr <= 3; dr++) for (let dc = -3; dc <= 3; dc++) {
          const t = at(s.r + dr, s.c + dc); if (!t || !t.kind || t.sick || t.dead || !KINDS[KI[t.kind]].weak) continue;
          const near = Math.max(Math.abs(dr), Math.abs(dc)) <= 1;
          if (near ? rnd() < 0.8 : rnd() < 0.02) next.push(t);
        }
      });
      next.forEach((t) => { t.sick = 1; });
      cells.forEach(paintCell);
      const t = totals();
      if (!sick.length && !next.length) {
        clearInterval(run); run = null; go.disabled = false;
        const lost = t.planted - t.alive;
        msg.innerHTML = t.alive === 0 ? '<b>밭이 모두 쓰러졌다.</b> 한 품종만 심으면 모두 같은 병에 약하다.'
          : t.kinds === 1 ? '<b>이 품종은 병에 강해</b> 퍼지지 않았다 — 하지만 다른 병이 오면 어떨까?'
            : `<b>${t.alive}포기가 살아남았다</b>(쓰러진 것 ${lost}포기). 병에 강한 품종이 섞여 있고, 그 사이에서 번지는 길도 끊겼다.`;
        now.textContent = '«다시 심기»로 다르게 심어 견주어 보자';
      }
    }
    function outbreak() {
      if (run) return;
      const weak = cells.filter((x) => x.kind && !x.dead && KINDS[KI[x.kind]].weak);
      if (!cells.some((x) => x.kind)) { now.textContent = '먼저 붓으로 밭을 칠해 심어 보자'; return; }
      rnd = rand(17);
      if (!weak.length) { msg.innerHTML = '<b>이 밭에는 이 곰팡이에 약한 품종이 없다.</b> 병이 번지지 못했다.'; return; }
      const first = weak.sort((a, b) => (a.c + a.r) - (b.c + b.r))[0]; first.sick = 1;
      go.disabled = true; msg.textContent = '곰팡이 포자가 날아왔다…'; now.textContent = '병이 어디까지 번지는지 보자';
      run = setInterval(step, window.Kit.reduce ? 60 : 320);
    }
    function reset() { if (run) { clearInterval(run); run = null; } go.disabled = false; cells.forEach((cl) => { cl.kind = null; cl.sick = 0; cl.dead = false; paintCell(cl); }); totals(); msg.textContent = ''; now.textContent = '품종을 골라 붓으로 밭을 칠해 심어 보자'; }
    go.addEventListener('click', outbreak); again.addEventListener('click', reset);
    reset();
    root._field = {
      fill(k) { cells.forEach((cl) => { cl.kind = typeof k === 'function' ? k(cl) : k; paintCell(cl); }); totals(); },
      fast() { if (!run) outbreak(); for (let i = 0; i < 40 && run; i++) step(); },
      reset,
    };
    return { setActive(on) { if (!on && run) { clearInterval(run); run = null; go.disabled = false; } } };
  }
  window.Field = { mount, KINDS, clamp };
})();
