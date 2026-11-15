/* 4차시 다양성 그래프(교과서 19쪽 그림 I-11): 해양 생물 과의 수 곡선 위를 짚는 세로선(커서).
   짚은 곳의 시대·흐름을 읽어 주고, 대멸종 점 가까이면 그 자리를 크게 보여 준다. 표지에서 그린 예측(Lesson111.pred)을 점선으로 겹친다.
   곡선의 점은 교과서 그림의 모양을 따라 옮긴 것(그림 좌표 → 나이·높이)이고, 세부 높낮이는 이해를 돕기 위한 근삿값. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const AGE0 = 5.39, X0 = 116, X1 = 940, Y0 = 40, Y1 = 556, VMAX = 1000;
  // 교과서 그림의 눈금(그림 좌표 → 억 년 전): 5.39 · 2.52 · 0.66 · 오른쪽 끝(지금)
  const TICK = [[170, 5.39], [330, 2.52], [425, 0.66], [455, 0]];
  const ageOf = (px) => { for (let i = 0; i < TICK.length - 1; i++) { const [a, b] = [TICK[i], TICK[i + 1]]; if (px <= b[0]) return a[1] + (px - a[0]) / (b[0] - a[0]) * (b[1] - a[1]); } return 0; };
  const valOf = (py) => Math.max(0, (700 - py) * 5.92);
  const RAW = [[172, 700], [178, 690], [188, 680], [197, 672], [204, 671], [208, 676], [213, 673], [222, 660], [232, 645], [240, 628], [247, 618], [250, 619], [252, 640], [256, 628], [263, 619], [272, 615], [280, 612], [283, 613], [285, 633], [289, 616], [298, 612], [310, 610], [320, 611], [327, 612], [330, 660], [336, 657], [343, 652], [349, 648], [352, 652], [357, 642], [365, 632], [375, 620], [385, 612], [395, 602], [403, 594], [410, 588], [416, 580], [421, 578], [425, 598], [429, 580], [437, 566], [444, 556], [450, 549], [455, 548]];
  const PTS = RAW.map(([x, y]) => [Math.max(0, ageOf(x)), valOf(y)]);
  // 대멸종 다섯 번: 그림 속 점 자리 · 이름 · 주된 원인 · 크게 줄어든 생물 · 그 뒤
  const INFO = [
    [252, 640, '고생대 초기 대멸종', '빙하가 넓어지며 해수면과 기온이 내려갔다.', '삼엽충·완족류 등 바다 생물이 크게 줄었다.', ''],
    [285, 633, '고생대 중기 대멸종', '기온이 내려가고 바닷물의 산소가 모자라게 되었다.', '갑주어가 사라지는 등 바다 생물이 큰 피해를 입었다.', ''],
    [330, 660, '고생대 말 대멸종', '판게아가 생기고, 큰 화산 폭발로 온난화가 일어나고, 바닷물의 산소가 모자라게 되었다.', '삼엽충·방추충을 비롯한 바다 생물 대부분이 사라졌다 — 다섯 번 가운데 가장 크다.', '그 뒤: 살아남은 몇몇 양서류 무리에서 한동안 새 종이 적게 생기다가 파충류가 크게 번성했다.'],
    [352, 652, '중생대 초기 대멸종', '판게아가 갈라지며 활발해진 화산 활동과 기후 변화.', '많은 파충류와 원시 포유류가 사라졌다.', ''],
    [425, 598, '중생대 말 대멸종', '소행성 충돌과 화산 폭발.', '공룡·암모나이트 등이 사라졌다.', '그 뒤: 악어·새 무리 등이 살아남았고, 포유류가 크게 번성했다.'],
  ];
  const DOTS = INFO.map(([x, y, n, cause, lost, after], i) => ({ age: ageOf(x), v: valOf(y), n, cause, lost, after, no: i + 1, big: i === 2 }));
  const ERAS = [['고생대', 5.39, 2.52, '#e9f0e2'], ['중생대', 2.52, 0.66, '#f4ead8'], ['신생대', 0.66, 0, '#e4eef5']];
  const ax = (a) => X0 + (AGE0 - a) / AGE0 * (X1 - X0), xa = (x) => AGE0 - (x - X0) / (X1 - X0) * AGE0;
  const vy = (v) => Y1 - v / VMAX * (Y1 - Y0);
  function valAt(age) {
    for (let i = 0; i < PTS.length - 1; i++) { const [a, b] = [PTS[i], PTS[i + 1]]; if (age <= a[0] && age >= b[0]) return a[1] + (age - a[0]) / ((b[0] - a[0]) || 1e-6) * (b[1] - a[1]); }
    return age > PTS[0][0] ? PTS[0][1] : PTS[PTS.length - 1][1];
  }

  function mount(root) {
    const svg = root.querySelector('.dv-svg'), zoom = root.querySelector('.dv-zoom'), now = root.querySelector('.dv-now');
    const why = root.querySelector('.dv-why'), ageT = root.querySelector('.dv-age'), trendT = root.querySelector('.dv-trend'), mine = root.querySelector('.dv-mine');
    ERAS.forEach(([n, a, b, c]) => {
      el('rect', { x: ax(a), y: Y0, width: ax(b) - ax(a), height: Y1 - Y0, fill: c }, svg);
      el('text', { class: 'dv-era', x: (ax(a) + ax(b)) / 2, y: Y1 + 70 }, svg).textContent = n;
    });
    [300, 600, 900].forEach((v) => { el('line', { class: 'dv-grid', x1: X0, x2: X1, y1: vy(v), y2: vy(v) }, svg); el('text', { class: 'dv-tick', x: X0 - 12, y: vy(v) + 8, 'text-anchor': 'end' }, svg).textContent = v; });
    el('text', { class: 'dv-tick', x: X0 - 12, y: Y1 + 8, 'text-anchor': 'end' }, svg).textContent = '0';
    [5.39, 2.52, 0.66, 0].forEach((a) => el('text', { class: 'dv-tick', x: ax(a), y: Y1 + 32 }, svg).textContent = String(a));
    el('text', { class: 'dv-lab', x: X1 + 24, y: Y1 + 32, 'text-anchor': 'start' }, svg).textContent = '(억 년 전)';
    el('text', { class: 'dv-lab', transform: `translate(34 ${(Y0 + Y1) / 2}) rotate(-90)`, 'text-anchor': 'middle' }, svg).textContent = '해양 생물 과의 수';
    el('path', { class: 'dv-axis', d: `M${X0} ${Y0 - 8} V ${Y1} H ${X1 + 8}` }, svg);
    const pred = el('path', { class: 'dv-pred', d: '' }, svg);
    const cg = el('g', { id: 'dv-curve-111' }, svg);
    ERAS.forEach(([, a, b, c]) => el('rect', { x: ax(a), y: Y0, width: ax(b) - ax(a), height: Y1 - Y0, fill: c, class: 'dv-zbg' }, cg));
    el('path', { class: 'dv-curve', d: 'M' + PTS.map(([a, v]) => ax(a).toFixed(1) + ' ' + vy(v).toFixed(1)).join(' L ') }, cg);
    DOTS.forEach((d) => el('circle', { class: 'dv-dot' + (d.big ? ' big' : ''), cx: ax(d.age), cy: vy(d.v), r: 9 }, cg));
    el('circle', { class: 'dv-dot', cx: X0 + 30, cy: Y0 + 12, r: 9 }, svg);
    el('text', { class: 'dv-leg', x: X0 + 48, y: Y0 + 20 }, svg).textContent = '대멸종 시기';
    const predLeg = el('text', { class: 'dv-leg dv-pl', x: X0 + 200, y: Y0 + 20 }, svg); predLeg.textContent = '- - 내 예측';
    const cur = el('g', { class: 'dv-cur', opacity: 0 }, svg);
    const cl = el('line', { y1: Y0, y2: Y1 }, cur), cd = el('circle', { r: 12 }, cur);
    const bigT = el('g', { class: 'dv-big', opacity: 0 }, svg);
    const bd = DOTS[2];
    el('rect', { x: ax(bd.age) + 18, y: vy(bd.v) + 18, width: 330, height: 66, rx: 10 }, bigT);
    el('text', { x: ax(bd.age) + 32, y: vy(bd.v) + 46 }, bigT).textContent = '가장 크게 떨어진 곳: 고생대 말';
    el('text', { class: 'sm', x: ax(bd.age) + 32, y: vy(bd.v) + 72 }, bigT).textContent = '사라진 생물이 90 %에 이른다는 연구가 있다(교과서)';
    // 확대 그림
    el('rect', { class: 'dv-zframe', x: 1, y: 1, width: 398, height: 218, rx: 10 }, zoom);
    const zs = el('svg', { x: 0, y: 0, width: 400, height: 176, viewBox: '0 0 10 10', preserveAspectRatio: 'xMidYMid slice' }, zoom);
    el('use', { href: '#dv-curve-111' }, zs);
    const zT = el('text', { class: 'dv-zt', x: 200, y: 204 }, zoom); zT.textContent = '파란 점 가까이 가면 크게 보인다';
    zoom.classList.add('empty');
    let age = null;

    function showPred() {
      const p = window.Lesson111 && window.Lesson111.pred;
      pred.setAttribute('d', p && p.length > 1 ? 'M' + p.map(([a, v]) => ax(a).toFixed(1) + ' ' + (Y1 - v * (Y1 - Y0)).toFixed(1)).join(' L ') : '');
      predLeg.style.display = p && p.length > 1 ? '' : 'none';
      mine.textContent = p && p.length > 1 ? '점선은 표지에서 그린 내 예측이다. 어디가 같고 어디가 다른가?' : '표지에서 예측 그래프를 그리면 여기에 점선으로 겹쳐 보인다.';
    }
    function at(a) {
      age = Math.max(0, Math.min(AGE0, a));
      const v = valAt(age), x = ax(age), y = vy(v);
      cl.setAttribute('x1', x); cl.setAttribute('x2', x); cd.setAttribute('cx', x); cd.setAttribute('cy', y); cur.setAttribute('opacity', 1);
      const era = ERAS.find(([, s, e]) => age <= s && age >= e)[0];
      ageT.textContent = `약 ${age.toFixed(2)}억 년 전 · ${era}`;
      const near = DOTS.find((d) => Math.abs(d.age - age) < 0.09);
      const slope = (valAt(Math.max(0, age - 0.06)) - valAt(Math.min(AGE0, age + 0.06)));
      trendT.textContent = near ? `${near.n} — 짧은 기간에 과의 수가 뚝 떨어졌다.`
        : age < 0.08 ? '지금: 곡선이 가장 높다 — 대멸종을 여러 번 겪고도 종류는 오히려 늘었다.'
          : slope > 8 ? '늘어나는 중 — 새로운 생물이 생겨나 종류가 많아진다.' : slope < -8 ? '줄어드는 중 — 사라지는 생물이 생겨나는 것보다 많다.' : '거의 그대로 머문다.';
      trendT.parentElement.classList.toggle('hit', !!near);
      why.innerHTML = near ? `<b>${near.no}번째 · 원인</b> ${near.cause}<br><b>사라진 생물</b> ${near.lost}` + (near.after ? `<br><b>${near.after.slice(0, 3)}</b>${near.after.slice(3)}` : '') : '';
      why.style.display = near ? '' : 'none';
      if (near) {
        const cx = ax(near.age), cy = vy(near.v) - 70;
        zs.setAttribute('viewBox', `${cx - 170} ${cy - 75} 340 ${340 * 176 / 400}`);
        zT.textContent = near.big ? '고생대 말: 가장 깊은 낭떠러지' : near.n + ' 가까이';
        zoom.classList.remove('empty');
      }
      bigT.setAttribute('opacity', near && near.big ? 1 : 0);
      now.classList.add('gone');
    }
    const toSvg = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
    let down = false;
    svg.addEventListener('pointerdown', (e) => { down = true; try { svg.setPointerCapture(e.pointerId); } catch { /* 합성 */ } at(xa(toSvg(e).x)); });
    svg.addEventListener('pointermove', (e) => { if (down || e.pointerType === 'mouse') at(xa(toSvg(e).x)); });
    const up = () => { down = false; };
    svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
    svg.addEventListener('keydown', (e) => {
      const d = { ArrowLeft: 0.05, ArrowRight: -0.05 }[e.key];
      if (d) { e.preventDefault(); e.stopPropagation(); at((age ?? AGE0) + d); }
    });
    showPred();
    root._dv = { at };
    return { setActive(on) { if (on) showPred(); } };
  }
  window.DivGraph = { mount };
})();
