/* 빅데이터 활용의 장점과 문제점(교과서 135쪽 해 보기, 통화 기록 → 유동 인구 예시). 가상 도시의 낮 시간 휴대 전화 위치 기록을
   «자료를 얼마나 자세히» 막대로 구역별 합계 → 동네별 → 거리별 → 한 사람까지 본다. 자세할수록 사람이 몰리는 곳을 잇는 버스 노선은 잘 정해지지만,
   한 사람 단위에서는 집 → 학교 → 학원 → 집 동선이 드러나 누구인지 알 수 있다(사생활 침해). 아래 카드는 장점·문제점 칸에 나눈다. 모두 가상. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const X0 = 40, Y0 = 30, W = 976, H = 440, COLS = 12, ROWS = 8, CW = W / COLS, CH = H / ROWS;
  const LV = [{ c: 3, r: 2, name: '구역별 합계', use: 0.3, risk: 0.05, say: '구역별 합계만으로는 사람이 많은 곳을 대충만 안다 — 노선을 정하기에 부족하다' },
    { c: 6, r: 4, name: '동네별', use: 0.7, risk: 0.2, say: '동네별로 보면 사람이 몰리는 곳이 보인다 — 버스 노선을 꽤 잘 정할 수 있다' },
    { c: 12, r: 8, name: '거리별', use: 0.95, risk: 0.5, say: '거리별로 보면 노선을 더 알맞게 정한다. 그러나 사람이 적은 곳은 누가 있는지 짐작될 수도 있다' },
    { c: 12, r: 8, name: '한 사람', use: 1, risk: 1, say: '한 사람의 기록까지 보면 집 → 학교 → 학원이 드러나 누구인지 알 수 있다 — 사생활 침해' }];
  const SPOTS = [[9.5, 1.5, '학교', 46], [10.5, 5.5, '회사', 40], [4.5, 6.5, '시장', 34], [7.5, 0.5, '역', 30]];   // [열, 행, 이름, 사람 수]
  let seed = 11; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const gauss = () => (rnd() + rnd() + rnd() - 1.5) / 1.5;

  function mount(root) {
    const svg = root.querySelector('.mr-svg'), zoom = root.querySelector('#mr-zoom'), zv = root.querySelector('.mr-zv');
    const useB = root.querySelector('.mr-r .use'), riskB = root.querySelector('.mr-r .risk'), say = root.querySelector('.mr-say');
    const cards = [...root.querySelectorAll('.mr-card')], bins = [...root.querySelectorAll('.mr-bin')], msg = root.querySelector('.mr-msg');
    el('rect', { class: 'mr-bg', x: -400, y: -300, width: 1856, height: 1120 }, svg);
    const city = el('g', { class: 'mr-city' }, svg);
    for (let c = 0; c < COLS; c++) for (let r = 0; r < ROWS; r++) el('rect', { class: c < 4 ? 'mr-blk home' : 'mr-blk', x: X0 + c * CW + 6, y: Y0 + r * CH + 6, width: CW - 12, height: CH - 12, rx: 6 }, city);
    const lms = el('g', { class: 'mr-lms' });
    SPOTS.forEach(([c, r, n]) => { const g = el('g', { class: 'mr-lm', transform: `translate(${X0 + c * CW} ${Y0 + r * CH})` }, lms); el('rect', { x: -26, y: -14, width: 52, height: 28, rx: 6 }, g); el('text', { y: 6 }, g).textContent = n; });
    el('text', { class: 'mr-area', x: X0 + 2 * CW, y: Y0 + H + 26 }, svg).textContent = '주택가';
    const heat = el('g', { class: 'mr-heat' }, svg), dotsG = el('g', { class: 'mr-dots' }, svg);
    const route = el('path', { class: 'mr-route' }, svg), bus = el('g', { class: 'mr-bus' }, svg);
    el('rect', { x: -18, y: -11, width: 36, height: 22, rx: 6 }, bus); el('text', { y: 6 }, bus).textContent = '버스';
    const trail = el('g', { class: 'mr-trail' }, svg);
    svg.insertBefore(lms, route);   // 장소 이름은 사람 점 위에
    // 사람(낮 시간 위치): 장소 근처에 모이고, 나머지는 흩어져 있다
    const people = [];
    SPOTS.forEach(([c, r, , n]) => { for (let i = 0; i < n; i++) people.push([X0 + c * CW + gauss() * CW * 0.9, Y0 + r * CH + gauss() * CH * 0.9]); });
    for (let i = 0; i < 70; i++) people.push([X0 + rnd() * W, Y0 + rnd() * H]);
    const dots = people.map(([x, y]) => el('circle', { cx: Math.max(X0, Math.min(X0 + W, x)).toFixed(1), cy: Math.max(Y0, Math.min(Y0 + H, y)).toFixed(1), r: 4 }, dotsG));
    // 한 사람의 하루 동선(가상)
    const PATH = [[1.5, 5.5, '07:50 집'], [9.5, 1.5, '08:20 학교'], [5.5, 3.5, '16:40 학원'], [1.5, 5.5, '19:10 집']];
    const pd = PATH.map(([c, r]) => `${(X0 + c * CW).toFixed(1)} ${(Y0 + r * CH).toFixed(1)}`).join(' L ');
    el('path', { class: 'mr-pp', d: `M${pd}` }, trail);
    PATH.slice(0, 3).forEach(([c, r, t], i) => { const g = el('g', { transform: `translate(${X0 + c * CW} ${Y0 + r * CH})` }, trail); el('circle', { r: 9 }, g); el('text', { x: 14, y: i === 0 ? 24 : -12 }, g).textContent = i === 0 ? '07:50 집 · 19:10 집' : t; });
    const cell = (x, y, lv) => [Math.min(lv.c - 1, Math.floor((x - X0) / (W / lv.c))), Math.min(lv.r - 1, Math.floor((y - Y0) / (H / lv.r)))];
    function paint() {
      const i = Number(zoom.value), lv = LV[i];
      zv.textContent = lv.name;
      heat.innerHTML = '';
      const cnt = Array.from({ length: lv.c * lv.r }, () => 0);
      people.forEach(([x, y]) => { const [c, r] = cell(Math.max(X0, Math.min(X0 + W - 1, x)), Math.max(Y0, Math.min(Y0 + H - 1, y)), lv); cnt[r * lv.c + c]++; });
      const mx = Math.max(...cnt);
      if (i < 3) cnt.forEach((n, k) => { const c = k % lv.c, r = Math.floor(k / lv.c); el('rect', { x: X0 + c * W / lv.c, y: Y0 + r * H / lv.r, width: W / lv.c, height: H / lv.r, style: `fill-opacity:${(0.08 + 0.7 * n / mx).toFixed(2)}` }, heat); if (i < 2) el('text', { class: 'mr-n', x: X0 + (c + 0.5) * W / lv.c, y: Y0 + (r + 0.5) * H / lv.r + 8 }, heat).textContent = `${n}`; });
      svg.classList.toggle('lv3', i === 3);
      // 버스 노선: 보이는 자세함으로 찾은 붐비는 칸을 잇는다
      const top = cnt.map((n, k) => [n, k]).sort((a, b) => b[0] - a[0]).slice(0, i === 0 ? 2 : 4).map(([, k]) => [X0 + ((k % lv.c) + 0.5) * W / lv.c, Y0 + (Math.floor(k / lv.c) + 0.5) * H / lv.r]).sort((a, b) => a[0] - b[0]);
      const home = [X0 + 1.5 * CW, Y0 + 4.5 * CH];
      const pts = [home, ...top];
      route.setAttribute('d', 'M' + pts.map((p) => p.map((v) => v.toFixed(1)).join(' ')).join(' L '));
      bus.setAttribute('transform', `translate(${home[0].toFixed(1)} ${home[1].toFixed(1)})`);
      useB.style.width = `${lv.use * 100}%`; riskB.style.width = `${lv.risk * 100}%`;
      riskB.classList.toggle('hi', lv.risk >= 0.5);
      say.textContent = lv.say;
    }
    zoom.addEventListener('input', paint); zoom.addEventListener('keydown', (e) => e.stopPropagation());
    // 장점·문제점 나누기
    const shake = (e) => { e.classList.remove('bad'); e.getBoundingClientRect(); e.classList.add('bad'); };
    const placed = () => cards.filter((c) => c.classList.contains('placed')).length;
    function put(c, bin) {
      if (!bin) { msg.textContent = '장점·문제점 칸 위에 놓아 보자'; return; }
      if (c.dataset.k !== bin.dataset.k) { shake(c); msg.textContent = c.dataset.k === 'good' ? '이건 빅데이터 덕분에 할 수 있게 된 일이다' : '이건 빅데이터를 쓸 때 조심해야 할 점이다'; return; }
      bin.querySelector('.mr-in').appendChild(c); c.classList.add('placed'); c.setAttribute('aria-pressed', 'false');
      msg.textContent = placed() === cards.length ? '장점을 살리고 문제점을 줄이며 올바르게 써야 한다' : `${placed()} / ${cards.length}`;
    }
    const drag = window.Drag.cards(cards, {
      find: (x) => x.closest && x.closest('#merit .mr-bin'),
      hover: (b) => bins.forEach((x) => x.classList.toggle('target', x === b)),
      drop: put,
      pick: (c) => { if (c) msg.textContent = '넣을 칸을 눌러요'; },
    });
    bins.forEach((b) => {
      const go = () => { if (drag.picked) { const c = drag.picked; drag.unpick(); put(c, b); } };
      b.addEventListener('click', (e) => { if (!e.target.closest('.mr-card')) go(); });
      b.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); go(); } });
    });
    paint();
    root._merit = { zoom: (v) => { zoom.value = String(v); paint(); }, all: () => cards.forEach((c) => { if (!c.classList.contains('placed')) put(c, bins.find((b) => b.dataset.k === c.dataset.k)); }) };
    return {};
  }
  window.MeritMap = { mount };
})();
