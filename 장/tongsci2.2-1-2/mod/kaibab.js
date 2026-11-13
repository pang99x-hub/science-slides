/* 해 보기: 카이바브 고원(교과서 78쪽). 그래프 위 연도 막대를 끌면 위의 고원 그림(늑대·사슴·식물)이 그해 모습으로 바뀐다.
   값은 교과서 그래프를 눈으로 읽어 옮긴 대략값: 늑대(×100마리), 사슴(×1000마리), 식물군집(상댓값). 1905년 약 400·약 3800은 교과서 본문 값. */
(function () {
  'use strict';
  const { el, pt, clamp, org, rng } = window.Eco;
  const YR = [1905, 1907, 1909, 1910, 1912, 1915, 1918, 1919, 1920, 1922, 1925, 1928, 1930];
  const WOLF = [4.0, 4.0, 2.0, 0.8, 0.6, 0.6, 0.7, 0.7, 0.8, 0.9, 1.0, 1.0, 1.1];
  const DEER = [3.8, 4.0, 4.5, 4.8, 5.6, 7.0, 8.8, 9.0, 8.5, 7.2, 5.0, 3.2, 2.2];
  const PLANT = [5.6, 5.4, 5.1, 5.0, 4.6, 3.9, 3.0, 2.6, 2.3, 2.0, 2.1, 2.1, 2.1];
  const STORY = [
    [1905, '1905년의 고원', '늑대와 사슴이 함께 산다. 사슴을 지키려고 정부가 늑대 사냥을 허용했다.'],
    [1907.5, '늑대 사냥', '사냥이 이어지며 늑대가 빠르게 줄어든다.'],
    [1911, '늑대가 거의 사라짐', '사슴을 잡아먹던 늑대가 크게 줄었다. 사슴이 늘기 시작한다.'],
    [1914, '사슴이 불어남', '잡아먹히는 사슴이 줄어 수가 크게 늘어난다. 사슴이 뜯어 먹는 풀과 어린나무가 줄기 시작한다.'],
    [1918, '사슴이 가장 많을 때', '고원에 사슴이 가득하지만, 먹을 식물은 크게 줄었다.'],
    [1921, '먹이가 모자람', '먹이가 부족해진 사슴이 굶주려 빠르게 줄어든다. 망가진 식물군집은 쉽게 되살아나지 않는다.'],
    [1927, '1930년 무렵', '사슴은 처음보다도 적어졌고, 식물도 예전만큼 돌아오지 않았다. 늑대를 없앤 것이 사슴에게도 도움이 되지 않았다.'],
  ];
  const GX0 = 110, GX1 = 960, GY0 = 664, GY1 = 384, VMAX = 10;
  const xOf = (y) => GX0 + (y - 1905) / 25 * (GX1 - GX0), yOf = (v) => GY0 - v / VMAX * (GY0 - GY1);
  function at(arr, y) {
    let i = YR.findIndex((v) => v > y); if (i < 0) return arr[arr.length - 1]; if (i === 0) return arr[0];
    const u = (y - YR[i - 1]) / (YR[i] - YR[i - 1]), s = u * u * (3 - 2 * u);
    return arr[i - 1] + (arr[i] - arr[i - 1]) * s;
  }
  function curve(arr) {
    const pts = [];
    for (let y = 1905; y <= 1930.001; y += 0.25) pts.push(`${xOf(y).toFixed(1)} ${yOf(at(arr, y)).toFixed(1)}`);
    return 'M' + pts.join(' L ');
  }

  function mount(root) {
    const svg = root.querySelector('.kb-svg'), now = root.querySelector('.kb-now'), range = root.querySelector('#kb-year');
    const yEl = root.querySelector('.kb-y'), wEl = root.querySelector('.kb-w'), dEl = root.querySelector('.kb-d'), pEl = root.querySelector('.kb-p');
    const it = root.querySelector('.kb-it'), ib = root.querySelector('.kb-ib');
    const R = rng(11);
    // 고원 그림
    el('rect', { class: 'kb-sky', x: -400, y: -300, width: 1856, height: 640 }, svg);
    el('path', { class: 'kb-mesa', d: 'M-400 150 L 120 150 L 170 110 L 520 110 L 560 140 L 820 140 L 860 100 L 1456 100 V 340 H -400 Z' }, svg);
    const ground = el('path', { class: 'kb-ground', d: 'M-400 200 Q 300 180 600 196 T 1456 190 V 340 H -400 Z' }, svg);
    el('rect', { class: 'kb-cut', x: -400, y: 340, width: 1856, height: 700 }, svg);
    const plants = Array.from({ length: 26 }, (_, i) => { const x = 30 + (i * 397) % 1000, y = 214 + (i * 53) % 110; return org(svg, i % 3 === 0 ? 'tree' : 'grass', x, y, i % 3 === 0 ? 1.0 + R() * 0.3 : 1.0, R() < 0.5); });
    plants.sort((a, b) => a.transform.baseVal[0].matrix.f - b.transform.baseVal[0].matrix.f).forEach((p) => svg.appendChild(p));
    const deer = Array.from({ length: 20 }, () => org(svg, 'deer', 40 + R() * 960, 230 + R() * 90, 0.9 + R() * 0.2, R() < 0.5));
    const wolves = Array.from({ length: 8 }, () => org(svg, 'wolf', 60 + R() * 920, 240 + R() * 80, 0.95, R() < 0.5));
    const shot = el('text', { class: 'kb-shot', x: 1030, y: 40 }, svg);
    // 그래프
    const g = el('g', { class: 'kb-graph' }, svg);
    el('rect', { class: 'kb-gbg', x: GX0, y: GY1, width: GX1 - GX0, height: GY0 - GY1 }, g);
    for (let v = 0; v <= 10; v += 2) { el('path', { class: 'kb-grid', d: `M${GX0} ${yOf(v)} H ${GX1}` }, g); el('text', { class: 'kb-tk', x: GX0 - 10, y: yOf(v) + 7 }, g).textContent = v === 0 ? '낮음' : v === 10 ? '높음' : ''; }
    [1905, 1910, 1915, 1920, 1925, 1930].forEach((y) => { el('text', { class: 'kb-tx', x: xOf(y), y: GY0 + 26 }, g).textContent = y; });
    el('text', { class: 'kb-lab', x: GX0 - 4, y: GY1 - 14 }, g).textContent = '변화의 경향';
    el('text', { class: 'kb-lab r', x: GX1 + 4, y: GY1 - 14 }, g).textContent = '식물군집의 양(상댓값)';
    el('path', { class: 'kb-c plant', d: curve(PLANT) }, g);
    el('path', { class: 'kb-c wolf', d: curve(WOLF) }, g);
    el('path', { class: 'kb-c deer', d: curve(DEER) }, g);
    el('text', { class: 'kb-cn wolf', x: xOf(1906.2), y: yOf(4.6) }, g).textContent = '늑대';
    el('text', { class: 'kb-cn deer', x: xOf(1914.5), y: yOf(8.2) }, g).textContent = '사슴';
    el('text', { class: 'kb-cn plant', x: xOf(1909), y: yOf(6.2) }, g).textContent = '식물군집';
    const past = el('rect', { class: 'kb-past', x: GX0, y: GY1, width: 0, height: GY0 - GY1 }, g);
    const mark = el('g', { class: 'kb-mark', tabindex: '-1' }, g);
    el('path', { class: 'kb-ml', d: `M0 ${GY1 - 10} V ${GY0}` }, mark);
    const dots = ['wolf', 'deer', 'plant'].map((k) => el('circle', { class: `kb-dot ${k}`, r: 9 }, mark));
    const hd = el('g', { class: 'kb-hd', transform: `translate(0 ${GY1 - 26})` }, mark);
    el('rect', { x: -46, y: -22, width: 92, height: 40, rx: 20 }, hd); const ht = el('text', { y: 7 }, hd);
    const hit = el('rect', { class: 'kb-hit', x: GX0 - 30, y: GY1 - 60, width: GX1 - GX0 + 60, height: GY0 - GY1 + 90 }, g);

    let year = 1905, moved = false;
    const round = (v, s) => Math.round(v / s) * s;
    function paint() {
      const W = at(WOLF, year), Dv = at(DEER, year), P = at(PLANT, year), x = xOf(year);
      mark.setAttribute('transform', `translate(${x.toFixed(1)} 0)`);
      past.setAttribute('width', (x - GX0).toFixed(1));
      [W, Dv, P].forEach((v, i) => dots[i].setAttribute('cy', yOf(v).toFixed(1)));
      ht.textContent = Math.floor(year);
      yEl.textContent = Math.floor(year);
      wEl.textContent = year < 1905.5 ? '약 400' : W < 2 ? '처음보다 적음' : '줄어드는 중';
      dEl.textContent = year < 1905.5 ? '약 3800' : year < 1920 ? '늘어나는 중' : '줄어드는 중';
      pEl.textContent = P > 4.6 ? '많음' : P > 3.2 ? '줄어듦' : '크게 줄어듦';
      const nW = Math.round(W * 2), nD = Math.round(Dv * 2.2), nP = Math.round(26 * clamp((P - 1.2) / 4.4, 0, 1));
      wolves.forEach((w, i) => w.style.display = i < nW ? '' : 'none');
      deer.forEach((d, i) => { d.style.display = i < nD ? '' : 'none'; d.classList.toggle('thin', year > 1920.5); });
      plants.forEach((p, i) => p.classList.toggle('bare', i >= nP));
      ground.classList.toggle('dry', P < 3);
      shot.textContent = year > 1906 && year < 1912 ? '늑대 사냥 허용' : '';
      const S = [...STORY].reverse().find(([y]) => year >= y);
      it.textContent = S[1]; ib.textContent = S[2];
      range.value = String(year);
      now.textContent = !moved ? '연도 막대를 오른쪽으로 끌어 보자' : year < 1919 ? '사슴과 식물을 함께 보며 더 끌어 보자' : year < 1929 ? '사슴이 왜 줄어들까?' : '1905년과 1930년을 견주어 보자';
      now.classList.toggle('done', year >= 1929);
    }
    function setYear(y) { year = clamp(y, 1905, 1930); moved = moved || year > 1905.5; paint(); }
    let drag = false;
    hit.addEventListener('pointerdown', (e) => { e.preventDefault(); drag = true; hit.setPointerCapture(e.pointerId); setYear(1905 + (pt(svg, e).x - GX0) / (GX1 - GX0) * 25); });
    hit.addEventListener('pointermove', (e) => { if (drag) setYear(1905 + (pt(svg, e).x - GX0) / (GX1 - GX0) * 25); });
    ['pointerup', 'pointercancel'].forEach((t) => hit.addEventListener(t, () => { drag = false; }));
    range.addEventListener('input', () => setYear(Number(range.value)));
    window.Eco.keyStop(range);
    paint();
    root._kb = { year: setYear };
    return {};
  }
  window.Kaibab = { mount };
})();
