/* 먹이그물 잇기(교과서 76쪽 그림 Ⅱ-5를 간추림). 먹히는 생물에서 먹는 생물로 끌면(또는 차례로 누르면) 화살표가 생긴다.
   «생물 빼 보기»를 켜고 생물을 누르면, 학생이 이은 화살표만 따라 두 단계까지 늘고 줆이 퍼진다(정성적). */
(function () {
  'use strict';
  const { el, pt, josa } = window.Eco;
  const N = {
    rice: { name: '벼', at: [180, 618], lv: [0], kind: 'rice' },
    foxtail: { name: '강아지풀', at: [892, 618], lv: [0], kind: 'grass' },
    hopper: { name: '메뚜기', at: [548, 600], lv: [1], kind: 'grasshopper' },
    rabbit: { name: '토끼', at: [372, 462], lv: [1], kind: 'rabbit' },
    mouse: { name: '쥐', at: [836, 418], lv: [1], kind: 'mouse' },
    sparrow: { name: '참새', at: [124, 382], lv: [1, 2], kind: 'sparrow' },
    frog: { name: '개구리', at: [640, 452], lv: [2], kind: 'frog' },
    mole: { name: '두더지', at: [880, 196], lv: [2], kind: 'mole' },
    snake: { name: '뱀', at: [276, 226], lv: [2, 3], kind: 'snake' },
    owl: { name: '올빼미', at: [560, 292], lv: [2, 3], kind: 'owl' },
    hawk: { name: '매', at: [516, 96], lv: [2, 3], kind: 'hawk' },
  };
  const LINKS = ['rice>hopper', 'rice>sparrow', 'rice>rabbit', 'foxtail>hopper', 'foxtail>rabbit', 'foxtail>mouse',
    'hopper>sparrow', 'hopper>frog', 'hopper>mole', 'sparrow>snake', 'sparrow>hawk', 'rabbit>hawk', 'rabbit>owl',
    'mouse>snake', 'mouse>owl', 'frog>snake', 'mole>hawk', 'snake>hawk', 'snake>owl'];
  const LV = ['var(--lv0)', 'var(--lv1)', 'var(--lv2)', 'var(--lv3)'];
  const R0 = 50;

  function mount(root) {
    const svg = root.querySelector('.fw-svg'), now = root.querySelector('.fw-now');
    const it = root.querySelector('.fw-it'), ib = root.querySelector('.fw-ib'), nEl = root.querySelector('.fw-n');
    const defs = el('defs', {}, svg);
    const mk = el('marker', { id: 'fw-arrow', viewBox: '0 0 10 10', refX: 8, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, defs);
    el('path', { d: 'M0 0 L 10 5 L 0 10 z', class: 'fw-head' }, mk);
    el('rect', { class: 'fw-bg', x: -400, y: -300, width: 1856, height: 1300 }, svg);
    el('path', { class: 'fw-hill', d: 'M-400 360 Q 300 300 700 340 T 1456 330 V 1000 H -400 Z' }, svg);
    const linkLayer = el('g', { class: 'fw-links' }, svg);
    const temp = el('path', { class: 'fw-temp', d: '' }, svg);
    const nodeLayer = el('g', {}, svg);
    const nodes = {};
    for (const [k, n] of Object.entries(N)) {
      const g = el('g', { class: 'fw-node', 'data-k': k, tabindex: '0', role: 'button', 'aria-label': n.name, transform: `translate(${n.at[0]} ${n.at[1]})` }, nodeLayer);
      el('circle', { class: 'fw-disc', r: R0 }, g);
      if (n.lv.length === 1) el('circle', { class: 'fw-ring', r: R0, style: `stroke:${LV[n.lv[0]]}` }, g);
      else {
        el('path', { class: 'fw-ring', d: `M0 ${-R0} A ${R0} ${R0} 0 0 0 0 ${R0}`, style: `stroke:${LV[n.lv[0]]}` }, g);
        el('path', { class: 'fw-ring', d: `M0 ${R0} A ${R0} ${R0} 0 0 0 0 ${-R0}`, style: `stroke:${LV[n.lv[1]]}` }, g);
      }
      const s = { rice: 1.05, grass: 1.0, grasshopper: 1.25, rabbit: 1.15, mouse: 1.4, sparrow: 1.25, frog: 1.3, mole: 1.15, snake: 0.95, owl: 1.0, hawk: 1.0 }[n.kind];
      window.Eco.org(g, n.kind, 0, 26 + (n.kind === 'snake' ? -8 : 0), s);
      el('text', { class: 'fw-name', y: R0 + 26 }, g).textContent = n.name;
      const badge = el('g', { class: 'fw-badge', transform: `translate(${R0 - 6} ${-R0 + 6})` }, g);
      el('circle', { r: 20 }, badge); const bt = el('text', { y: 8 }, badge);
      const cross = el('path', { class: 'fw-x', d: `M-34 -34 L 34 34 M 34 -34 L -34 34` }, g);
      nodes[k] = { k, ...n, g, badge, bt, cross };
    }
    const have = new Map();   // 'a>b' → path
    let removeMode = false, removed = new Set(), sel = null;
    const modeBtn = root.querySelector('#fw-mode');

    function arc(a, b) {
      const [x1, y1] = N[a].at, [x2, y2] = N[b].at;
      const dx = x2 - x1, dy = y2 - y1, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
      const bend = 0.12 * L, mx = (x1 + x2) / 2 - uy * bend, my = (y1 + y2) / 2 + ux * bend;
      const s0 = [x1 + ux * (R0 + 4), y1 + uy * (R0 + 4)], s1 = [x2 - ux * (R0 + 10), y2 - uy * (R0 + 10)];
      return `M${s0[0].toFixed(1)} ${s0[1].toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${s1[0].toFixed(1)} ${s1[1].toFixed(1)}`;
    }
    function addLink(id, quiet) {
      if (have.has(id)) return false;
      const [a, b] = id.split('>');
      const p = el('path', { class: 'fw-link', d: arc(a, b), 'marker-end': 'url(#fw-arrow)' }, linkLayer);
      have.set(id, p);
      if (!quiet && window.gsap) { const L = p.getTotalLength(); gsap.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.5, ease: 'power2.out', onComplete: () => { p.style.strokeDasharray = ''; } }); }
      return true;
    }
    const shake = (k) => { const g = nodes[k].g; g.classList.remove('bad'); g.getBoundingClientRect(); g.classList.add('bad'); };
    function tryLink(a, b) {
      if (!a || !b || a === b) return;
      const A = N[a].name, B = N[b].name;
      if (LINKS.includes(`${a}>${b}`)) {
        if (addLink(`${a}>${b}`)) { it.textContent = `${A} → ${B}`; ib.textContent = `${josa.ga(B)} ${josa.eul(A)} 먹는다. 에너지가 ${A}에서 ${josa.ro(B)} 옮겨 간다.`; }
        else { it.textContent = '이미 이었다'; ib.textContent = `${A} → ${B} 화살표가 벌써 있다.`; }
      } else if (LINKS.includes(`${b}>${a}`)) {
        addLink(`${b}>${a}`);
        it.textContent = `방향을 바꿔 ${B} → ${A}`;
        ib.textContent = `${josa.ga(A)} ${josa.eul(B)} 먹으므로, 화살표는 먹히는 ${B}에서 먹는 ${A} 쪽으로 그린다.`;
      } else {
        shake(b);
        it.textContent = '이 그림에는 없는 관계';
        ib.textContent = N[a].lv[0] === 0 && N[b].lv[0] === 0 ? '식물끼리는 먹고 먹히지 않는다.' : `${josa.wa(A)} ${B} 사이에는 이 먹이그물에서 먹고 먹히는 관계가 없다.`;
      }
      paint();
    }
    function nodeAt(p) {
      let best = null, bd = 1e9;
      for (const n of Object.values(nodes)) { const d = Math.hypot(n.at[0] - p.x, n.at[1] - p.y); if (d < bd) { bd = d; best = n; } }
      return bd < R0 + 22 ? best.k : null;
    }
    function select(k) {
      sel = k; Object.values(nodes).forEach((n) => n.g.classList.toggle('sel', n.k === k));
      if (k) { it.textContent = `${N[k].name}에서 출발`; ib.textContent = `${josa.eul(N[k].name)} 먹는 생물을 누르거나, 그쪽으로 끌어 놓자.`; }
    }
    // 끌어서 잇기 / 차례로 눌러 잇기 / 빼기 모드에서는 누르면 사라짐
    let drag = null;
    svg.addEventListener('pointerdown', (e) => {
      const p = pt(svg, e), k = nodeAt(p);
      if (!k) { select(null); return; }
      e.preventDefault();
      if (removeMode) { toggleRemove(k); return; }
      drag = { k, moved: false, id: e.pointerId }; svg.setPointerCapture(e.pointerId);
    });
    svg.addEventListener('pointermove', (e) => {
      if (!drag) return;
      const p = pt(svg, e), [x, y] = N[drag.k].at;
      if (!drag.moved && Math.hypot(p.x - x, p.y - y) < 18) return;
      drag.moved = true;
      temp.setAttribute('d', `M${x} ${y} L ${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
      const over = nodeAt(p); Object.values(nodes).forEach((n) => n.g.classList.toggle('target', n.k === over && over !== drag.k));
    });
    const end = (e) => {
      if (!drag) return;
      const d = drag; drag = null; temp.setAttribute('d', '');
      Object.values(nodes).forEach((n) => n.g.classList.remove('target'));
      if (d.moved) { select(null); tryLink(d.k, nodeAt(pt(svg, e))); return; }
      if (sel && sel !== d.k) { const a = sel; select(null); tryLink(a, d.k); } else select(sel === d.k ? null : d.k);
    };
    svg.addEventListener('pointerup', end);
    svg.addEventListener('pointercancel', () => { drag = null; temp.setAttribute('d', ''); });
    Object.values(nodes).forEach((n) => n.g.addEventListener('keydown', (e) => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      e.preventDefault(); e.stopPropagation();
      if (removeMode) toggleRemove(n.k); else if (sel && sel !== n.k) { const a = sel; select(null); tryLink(a, n.k); } else select(sel === n.k ? null : n.k);
    }));

    // ---------- 생물 빼기 ----------
    function toggleRemove(k) {
      if (removed.has(k)) removed.delete(k); else removed.add(k);
      paint();
    }
    function effects() {
      const L = [...have.keys()].map((id) => id.split('>'));
      const preyOf = (k) => L.filter(([, b]) => b === k).map(([a]) => a), predOf = (k) => L.filter(([a]) => a === k).map(([, b]) => b);
      const up = new Map(), down = new Map(), lines = [];
      const add = (m, k, why) => { if (removed.has(k)) return; if (!m.has(k)) m.set(k, why); };
      for (const r of removed) {
        const R = N[r].name;
        preyOf(r).forEach((p) => { add(up, p, `${R}에게 덜 먹혀 늘어난다`); });
        predOf(r).forEach((q) => {
          const other = preyOf(q).filter((x) => !removed.has(x));
          if (!other.length) add(down, q, `먹이 ${josa.ga(R)} 없어져 사라질 위기`);
          else add(down, q, `먹이가 줄지만 다른 먹이(${other.map((x) => N[x].name).join('·')})로 버틴다`);
        });
      }
      // 두 번째 단계: 늘어난 생물의 먹이는 더 먹히고(↓), 늘어난 생물을 먹는 쪽은 먹이가 는다(↑)
      const down2 = new Map(), up2 = new Map();
      for (const [k] of up) preyOf(k).forEach((p) => { if (!removed.has(p) && !down.has(p) && !down2.has(p)) down2.set(p, `늘어난 ${josa.ege(N[k].name)} 더 많이 먹힌다`); });
      for (const [k] of up) if (!down2.has(k)) predOf(k).forEach((q) => { if (!removed.has(q) && !down.has(q) && !up.has(q) && !up2.has(q)) up2.set(q, `먹이 ${josa.ga(N[k].name)} 늘어난다`); });
      for (const [k, w] of down2) down.set(k, w);
      for (const [k, w] of up2) up.set(k, w);
      for (const k of Object.keys(N)) {
        const u = up.get(k), d = down.get(k), n = N[k].name;
        if (u && d) lines.push(`<b>${n} ↕</b> ${u} · 그러나 ${d}`);
        else if (u) lines.push(`<b>${n} ↑</b> ${u}`);
        else if (d) lines.push(`<b>${n} ${/위기/.test(d) ? '!' : '↓'}</b> ${d}`);
      }
      return { up, down, lines, preyOf, predOf };
    }
    function paint() {
      nEl.textContent = `${have.size} / ${LINKS.length}`;
      const ef = removed.size ? effects() : null;
      Object.values(nodes).forEach((n) => {
        const gone = removed.has(n.k);
        n.g.classList.toggle('gone', gone);
        let b = '';
        if (ef && !gone) {
          const u = ef.up.has(n.k), d = ef.down.has(n.k);
          const crit = d && /위기/.test(ef.down.get(n.k));
          b = u && d ? '↕' : u ? '↑' : d ? (crit ? '!' : '↓') : '';
          n.badge.setAttribute('class', 'fw-badge ' + (u && !d ? 'up' : d ? (crit ? 'crit' : 'down') : '') + (b ? ' on' : ''));
        } else n.badge.setAttribute('class', 'fw-badge');
        n.bt.textContent = b;
      });
      have.forEach((p, id) => { const [a, b] = id.split('>'); p.classList.toggle('dead', removed.has(a) || removed.has(b)); });
      if (ef) {
        it.textContent = [...removed].map((k) => N[k].name).join('·') + ' 사라짐';
        ib.innerHTML = ef.lines.length ? ef.lines.slice(0, 5).join('<br>') + (ef.lines.length > 5 ? ` 외 ${ef.lines.length - 5}종` : '') : '이은 화살표가 없어 다른 생물에 미치는 영향이 보이지 않는다 — 먼저 이어 보자.';
      }
      const done = have.size === LINKS.length;
      now.textContent = removeMode ? (removed.size ? '다시 누르면 돌아온다 · 다른 생물도 빼 보자' : '사라지게 할 생물을 눌러 보자 (참새부터)')
        : done ? '다 이었다! «생물 빼 보기»를 켜 보자' : have.size ? `남은 관계 ${LINKS.length - have.size}개 — 계속 이어 보자` : '벼에서 메뚜기로 끌어 보자';
      now.classList.toggle('done', done && !removeMode);
    }
    modeBtn.addEventListener('click', () => {
      removeMode = !removeMode; modeBtn.setAttribute('aria-pressed', String(removeMode)); select(null);
      svg.classList.toggle('removing', removeMode);
      if (!removeMode) { removed.clear(); it.textContent = '끌어서 잇기'; ib.textContent = '화살표는 에너지가 가는 쪽, 곧 먹히는 생물 → 먹는 생물로 그린다.'; }
      else { it.textContent = '생물 빼 보기'; ib.textContent = '생물을 누르면 사라진다. 이은 화살표를 따라 다른 생물의 수가 어떻게 바뀔지 보인다.'; }
      paint();
    });
    root.querySelector('#fw-all').addEventListener('click', () => { LINKS.forEach((id) => addLink(id, true)); paint(); });
    root.querySelector('#fw-reset').addEventListener('click', () => {
      have.forEach((p) => p.remove()); have.clear(); removed.clear(); removeMode = false; modeBtn.setAttribute('aria-pressed', 'false'); svg.classList.remove('removing'); select(null);
      it.textContent = '끌어서 잇기'; ib.textContent = '화살표는 에너지가 가는 쪽, 곧 먹히는 생물 → 먹는 생물로 그린다.'; paint();
    });
    paint();
    root._fw = { link: tryLink, all: () => root.querySelector('#fw-all').click(), mode: () => modeBtn.click(), remove: toggleRemove, get n() { return have.size; } };
    return {};
  }
  window.FoodWeb = { mount };
})();
