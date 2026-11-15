/* 2차시 2장 생태계의 안정(교과서 28쪽): 먹이그물에서 한 종을 손으로 끌어 뽑아낸다.
   끌면 이어진 먹이 줄이 늘어나고, 멀리 끌어 놓으면 줄이 끊기며 그 종이 사라진다. 그 뒤 먹이가 하나도 남지 않은 소비자가 차례로 사라진다.
   단순한 그물(먹이 사슬 하나)과 복잡한 그물을 견준다. 생물과 먹이 관계는 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const { el, hold, clamp } = window.Kit;
  const W = 1056, H = 700, PULL = 150;
  const WEBS = {
    simple: {
      nodes: { grass: ['풀', 560, 600], hop: ['메뚜기', 400, 470], frog: ['개구리', 600, 345], snake: ['뱀', 420, 220], hawk: ['매', 620, 95] },
      eats: { hop: ['grass'], frog: ['hop'], snake: ['frog'], hawk: ['snake'] },
    },
    rich: {
      nodes: { grass: ['풀', 300, 590], berry: ['나무 열매', 780, 590], hop: ['메뚜기', 150, 450], rabbit: ['토끼', 410, 450], mouse: ['쥐', 640, 450], sparrow: ['참새', 910, 320], frog: ['개구리', 210, 290], snake: ['뱀', 470, 270], fox: ['여우', 700, 260], hawk: ['매', 560, 90] },
      eats: { hop: ['grass'], rabbit: ['grass'], mouse: ['grass', 'berry'], sparrow: ['berry', 'hop'], frog: ['hop'], snake: ['frog', 'mouse'], fox: ['rabbit', 'mouse'], hawk: ['snake', 'sparrow', 'mouse', 'rabbit'] },
    },
  };
  const ICON = { grass: '🌱', berry: '🍒', hop: '🦗', rabbit: '🐇', mouse: '🐁', sparrow: '🐦', frog: '🐸', snake: '🐍', fox: '🦊', hawk: '🦅' };

  function mount(root) {
    const svg = root.querySelector('.fw-svg'), now = root.querySelector('.fw-now'), segs = [...root.querySelectorAll('.fw-seg button')];
    const msg = root.querySelector('.fw-msg'), lost = root.querySelector('.fw-lost'), again = root.querySelector('.fw-again');
    let web = 'simple', N = {}, links = [], timers = [];
    function build() {
      timers.forEach(clearTimeout); timers = [];
      svg.innerHTML = '';
      el('rect', { class: 'fw-bg', width: W, height: H }, svg);
      el('text', { class: 'fw-cap', x: 1032, y: 40 }, svg).textContent = web === 'simple' ? '단순한 생태계 · 종 5개' : '복잡한 생태계 · 종 10개';
      el('text', { class: 'fw-cap2', x: 1032, y: 68 }, svg).textContent = '화살표: 먹히는 쪽 → 먹는 쪽';
      const W0 = WEBS[web];
      const gl = el('g', {}, svg), gn = el('g', {}, svg);
      N = {};
      for (const [k, [name, x, y]] of Object.entries(W0.nodes)) {
        const g = el('g', { class: 'fw-node', tabindex: '0', role: 'button', 'aria-label': `${name} 뽑아내기(끌어서 멀리 놓기)` }, gn);
        el('circle', { r: 50, class: 'fw-disc' }, g);
        el('text', { class: 'fw-ico', y: 12 }, g).textContent = ICON[k];
        el('text', { class: 'fw-name', y: 76 }, g).textContent = name;
        el('path', { class: 'fw-x', d: 'M-30 -30 L 30 30 M 30 -30 L -30 30' }, g);
        N[k] = { k, name, x, y, hx: x, hy: y, g, alive: true, pulled: false };
      }
      links = [];
      for (const [pred, preys] of Object.entries(W0.eats)) preys.forEach((prey) => {
        const line = el('line', { class: 'fw-link', 'marker-end': 'url(#fw-arrow)' }, gl);
        links.push({ prey, pred, line, cut: false });
      });
      const defs = el('defs', {}, svg); const m = el('marker', { id: 'fw-arrow', viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto' }, defs); el('path', { d: 'M0 0 L10 5 L0 10 z', class: 'fw-head' }, m);
      Object.values(N).forEach((n) => {
        hold(n.g, {
          down() { if (!n.alive || n.pulled) return false; n.g.classList.add('drag'); },
          move(p) { n.x = clamp(p.x, 40, W - 40); n.y = clamp(p.y, 40, H - 40); draw(); },
          up() { n.g.classList.remove('drag'); const d = Math.hypot(n.x - n.hx, n.y - n.hy); if (d > PULL) pull(n); else { n.x = n.hx; n.y = n.hy; draw(); } },
        }, svg);
        n.g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); if (n.alive && !n.pulled) { n.x = n.hx + 200; pull(n); } } });
      });
      draw(); report();
      now.textContent = '생물 하나를 잡아 그물 밖으로 멀리 끌어내 보자';
      msg.innerHTML = '';
    }
    function draw() {
      Object.values(N).forEach((n) => { n.g.setAttribute('transform', `translate(${n.x.toFixed(1)} ${n.y.toFixed(1)})`); n.g.classList.toggle('dead', !n.alive); n.g.classList.toggle('pulled', n.pulled); });
      links.forEach((L) => {
        const a = N[L.prey], b = N[L.pred], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy) || 1;
        L.line.setAttribute('x1', (a.x + dx / d * 52).toFixed(1)); L.line.setAttribute('y1', (a.y + dy / d * 52).toFixed(1));
        L.line.setAttribute('x2', (b.x - dx / d * 56).toFixed(1)); L.line.setAttribute('y2', (b.y - dy / d * 56).toFixed(1));
        const st = Math.max(Math.hypot(a.x - a.hx, a.y - a.hy), Math.hypot(b.x - b.hx, b.y - b.hy));
        L.line.classList.toggle('taut', st > 20 && !L.cut); L.line.style.strokeWidth = L.cut ? '' : (4 + st / PULL * 4).toFixed(1);
        L.line.classList.toggle('cut', L.cut || !a.alive || !b.alive);
      });
    }
    function report() {
      const all = Object.values(N), gone = all.filter((n) => !n.alive);
      lost.textContent = `남은 종 ${all.length - gone.length} / ${all.length}`;
    }
    function pull(n) {
      n.alive = false; n.pulled = true;
      links.forEach((L) => { if (L.prey === n.k || L.pred === n.k) L.cut = true; });
      n.x = Math.min(W - 60, n.hx + 160); n.y = n.hy; draw(); report();
      now.textContent = '무슨 일이 이어지는지 보자';
      cascade(n, 1, []);
    }
    function cascade(first, round, starved) {
      const eats = WEBS[web].eats;
      const die = Object.values(N).filter((m) => m.alive && eats[m.k] && !eats[m.k].some((p) => N[p].alive));
      if (!die.length) {
        const total = Object.values(N).filter((m) => !m.alive).length - 1;
        msg.innerHTML = total === 0
          ? `<b>${window.Kit.josa(first.name, '이가')} 사라졌지만 다른 종은 모두 버텼다.</b> 그 종을 먹던 동물은 다른 먹이를 먹고, 그 역할을 다른 종이 대신한다.`
          : `<b>${window.Kit.josa(first.name, '이가')} 사라지자 ${starved.map((m) => m.name).join(', ')}도 먹이가 없어 사라졌다.</b>`;
        now.textContent = web === 'simple' ? '«복잡한 생태계»에서도 해 보자' : '«다시»로 다른 종도 뽑아 보자';
        return;
      }
      timers.push(setTimeout(() => {
        die.forEach((m) => { m.alive = false; links.forEach((L) => { if (L.pred === m.k || L.prey === m.k) L.cut = true; }); });
        draw(); report(); cascade(first, round + 1, starved.concat(die));
      }, window.Kit.reduce ? 0 : 750));
    }
    segs.forEach((b) => b.addEventListener('click', () => { web = b.dataset.w; segs.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); build(); }));
    again.addEventListener('click', build);
    build();
    root._web = { use(w) { segs.find((b) => b.dataset.w === w).click(); }, pull(k) { pull(N[k]); } };
    return {};
  }
  window.FoodWeb = { mount };
})();
