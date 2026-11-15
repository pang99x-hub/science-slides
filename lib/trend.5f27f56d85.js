/* 해 보기 · 지구 온난화의 메커니즘 알아보기(교과서 83쪽 그래프, 출처: 기상청 종합 기후변화감시정보).
   1950~2023년 기온 편차(°C, 1991~2020년 평균 기준)와 대기 중 이산화 탄소 농도(ppm). 값은 교과서 그래프에서 읽은 어림값.
   세로 눈금 가·나를 연도축을 따라 끌면(그래프 어디를 눌러도 가까운 눈금이 온다, ←·→ 키도) 그해 값이 나오고,
   오른쪽 공기 상자의 이산화 탄소 점(공기 분자 10만 개당 개수 = ppm ÷ 10)과 온도계가 그해에 맞춰 바뀐다.
   «30년 평균 선»은 1950~1979년과 1994~2023년 평균(그래프 값으로 계산)을 긋는다. 교과서 예시 답안은 약 0.61 °C 상승. */
(function () {
  'use strict';
  const Y0 = 1950;
  const TEMP = [-0.62, -0.57, -0.51, -0.46, -0.6, -0.7, -0.77, -0.6, -0.48, -0.5, -0.58, -0.54, -0.52, -0.48, -0.67, -0.68, -0.6, -0.58, -0.62, -0.53, -0.55, -0.67, -0.58, -0.45, -0.68, -0.67, -0.76, -0.52, -0.54, -0.43, -0.4, -0.37, -0.48, -0.34, -0.52, -0.53, -0.44, -0.3, -0.3, -0.35, -0.21, -0.27, -0.4, -0.36, -0.27, -0.19, -0.26, -0.08, 0.02, -0.18, -0.18, -0.04, 0, -0.01, -0.03, 0.05, 0.01, -0.02, -0.05, 0.05, 0.07, -0.04, 0.02, 0.09, 0.2, 0.33, 0.33, 0.23, 0.22, 0.33, 0.3, 0.24, 0.4, 0.55];
  const CO2 = [307.6, 308.1, 308.6, 309.2, 309.8, 310.4, 311.0, 311.7, 312.3, 313.1, 313.8, 314.6, 315.3, 316.2, 317.0, 317.7, 318.6, 319.7, 320.6, 321.7, 322.6, 323.3, 324.7, 325.9, 327.1, 328.3, 329.5, 331.0, 332.5, 334.0, 335.6, 337.3, 338.8, 340.4, 342.0, 343.6, 344.8, 346.9, 349.3, 350.8, 352.3, 353.5, 354.1, 355.5, 356.8, 358.9, 360.4, 361.9, 364.7, 366.7, 367.9, 369.7, 371.9, 374.2, 376.4, 378.4, 380.3, 382.3, 384.3, 386.3, 388.4, 390.7, 393.1, 395.0, 397.7, 400.4, 403.1, 405.8, 408.4, 410.9, 413.3, 415.9, 418.0, 420.3];
  const N = TEMP.length, Y1 = Y0 + N - 1;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const P = { l: 96, r: 880, t: 36, b: 516 };
  const X = (yr) => P.l + (yr - Y0) / (2025 - Y0) * (P.r - P.l);
  const YT = (v) => P.b - (v + 1) / 1.6 * (P.b - P.t);
  const YC = (v) => P.b - (v - 295) / 150 * (P.b - P.t);
  const f2 = (v) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(2);
  const mean = (a, i, j) => { let s = 0; for (let k = i; k <= j; k++) s += a[k]; return s / (j - i + 1); };

  function mount(root) {
    const svg = root.querySelector('.tr-svg');
    // 눈금
    for (let v = -1; v <= 0.6 + 1e-9; v += 0.2) {
      el('line', { x1: P.l, x2: P.r, y1: YT(v), y2: YT(v), class: 'tr-grid' }, svg);
      el('text', { x: P.l - 12, y: YT(v) + 7, class: 'tr-ax l' }, svg).textContent = v.toFixed(1).replace('-', '−').replace('−0.0', '0');
    }
    for (let v = 295; v <= 445; v += 25) el('text', { x: P.r + 12, y: YC(v) + 7, class: 'tr-ax r' }, svg).textContent = v;
    for (let yr = 1950; yr <= 2020; yr += 10) { el('line', { x1: X(yr), x2: X(yr), y1: P.b, y2: P.b + 8, class: 'tr-tick' }, svg); el('text', { x: X(yr), y: P.b + 34, class: 'tr-ax c' }, svg).textContent = yr; }
    el('path', { d: `M${P.l} ${P.t} V${P.b} H${P.r} V${P.t}`, class: 'tr-frame' }, svg);
    el('text', { x: 18, y: P.t - 8, class: 'tr-unit o' }, svg).textContent = '기온 편차(°C)';
    el('text', { x: 982, y: P.t - 8, class: 'tr-unit b' }, svg).textContent = '이산화 탄소(ppm)';
    const avg = el('g', { class: 'tr-avgs' }, svg);
    const a1 = mean(TEMP, 0, 29), a2 = mean(TEMP, 44, 73);
    el('line', { x1: X(1950), x2: X(1979), y1: YT(a1), y2: YT(a1), class: 'tr-avgl' }, avg);
    el('line', { x1: X(1994), x2: X(2023), y1: YT(a2), y2: YT(a2), class: 'tr-avgl' }, avg);
    el('text', { x: X(1964.5), y: YT(a1) + 34, class: 'tr-avgt' }, avg).textContent = '1950~1979년 평균';
    el('text', { x: X(2008.5), y: YT(a2) - 18, class: 'tr-avgt' }, avg).textContent = '1994~2023년 평균';
    el('path', { d: CO2.map((v, i) => `${i ? 'L' : 'M'}${X(Y0 + i).toFixed(1)} ${YC(v).toFixed(1)}`).join(' '), class: 'tr-co2' }, svg);
    el('path', { d: TEMP.map((v, i) => `${i ? 'L' : 'M'}${X(Y0 + i).toFixed(1)} ${YT(v).toFixed(1)}`).join(' '), class: 'tr-temp' }, svg);
    const lg = el('g', { class: 'tr-leg' }, svg);
    el('line', { x1: 130, x2: 170, y1: 70, y2: 70, class: 'tr-temp' }, lg); el('text', { x: 180, y: 78 }, lg).textContent = '기온 편차';
    el('line', { x1: 130, x2: 170, y1: 106, y2: 106, class: 'tr-co2' }, lg); el('text', { x: 180, y: 114 }, lg).textContent = '이산화 탄소 농도';
    // 눈금 가·나
    const cur = {};
    ['a', 'b'].forEach((k) => {
      const g = el('g', { class: `tr-cur ${k}`, tabindex: '0', role: 'slider', 'aria-label': `눈금 ${k === 'a' ? '가' : '나'} 연도` }, svg);
      el('line', { x1: 0, x2: 0, y1: P.t, y2: P.b, class: 'tr-cl' }, g);
      el('circle', { cx: 0, cy: 0, r: 9, class: 'tr-pt t' }, g);
      el('circle', { cx: 0, cy: 0, r: 9, class: 'tr-pt c' }, g);
      el('rect', { x: -30, y: P.b + 44, width: 60, height: 44, rx: 22, class: 'tr-knob' }, g);
      el('text', { x: 0, y: P.b + 75, class: 'tr-kt' }, g).textContent = k === 'a' ? '가' : '나';
      const tagT = el('text', { x: 14, y: 0, class: 'tr-vt t' }, g), tagC = el('text', { x: 14, y: 0, class: 'tr-vt c' }, g);
      cur[k] = { g, yr: k === 'a' ? 1950 : 2023, tagT, tagC };
      g.addEventListener('keydown', (e) => { const d = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1 }[e.key]; if (d) { e.preventDefault(); e.stopPropagation(); set(k, cur[k].yr + d); } });
    });
    // 오른쪽 공기 상자
    const jars = {};
    root.querySelectorAll('.tr-jar').forEach((j) => {
      const s = j.querySelector('svg'), k = j.dataset.k;
      el('rect', { x: 8, y: 10, width: 150, height: 210, rx: 12, class: 'tr-box' }, s);
      const dots = el('g', {}, s);
      // 늘 같은 자리에 찍히도록 미리 정한 자리
      let q = 11 + (k === 'b' ? 5 : 0);
      const spots = Array.from({ length: 50 }, () => { q = (q * 9301 + 49297) % 233280; const u = q / 233280; q = (q * 9301 + 49297) % 233280; return [20 + u * 126, 22 + (q / 233280) * 186]; });
      const ds = spots.map(([x, y]) => { const d = el('g', { transform: `translate(${x.toFixed(1)} ${y.toFixed(1)})` }, dots); el('circle', { r: 5.5, class: 'tr-c' }, d); el('circle', { cx: -7, r: 4, class: 'tr-o' }, d); el('circle', { cx: 7, r: 4, class: 'tr-o' }, d); return d; });
      el('rect', { x: 178, y: 14, width: 22, height: 170, rx: 11, class: 'tr-tube' }, s);
      const merc = el('rect', { x: 183, y: 100, width: 12, height: 100, rx: 6, class: 'tr-merc' }, s);
      el('circle', { cx: 189, cy: 200, r: 17, class: 'tr-bulb' }, s);
      jars[k] = { ds, merc, y: j.querySelector('.tr-y'), c: j.querySelector('.tr-cc'), t: j.querySelector('.tr-tt') };
    });
    const dd = root.querySelector('.tr-dv');
    function set(k, yr) { root._trState=root._trState||{};root._trState.moved=true;
      const c = cur[k]; c.yr = clamp(Math.round(yr), Y0, Y1);
      const i = c.yr - Y0, x = X(c.yr);
      c.g.setAttribute('transform', `translate(${x.toFixed(1)} 0)`);
      const [pt, pc] = c.g.querySelectorAll('.tr-pt');
      pt.setAttribute('cy', YT(TEMP[i])); pc.setAttribute('cy', YC(CO2[i]));
      const flip = c.yr > 2000 ? -1 : 1;
      [[c.tagT, YT(TEMP[i]) + (TEMP[i] > -0.1 ? 30 : -16), `${f2(TEMP[i])} °C`], [c.tagC, YC(CO2[i]) - 16, `${Math.round(CO2[i])} ppm`]].forEach(([t, y, s]) => { t.setAttribute('y', y); t.setAttribute('x', 14 * flip); t.setAttribute('text-anchor', flip > 0 ? 'start' : 'end'); t.textContent = s; });
      c.g.setAttribute('aria-valuenow', c.yr); c.g.setAttribute('aria-valuetext', `${c.yr}년`);
      const J = jars[k], n = Math.round(CO2[i] / 10);
      J.ds.forEach((d, m) => d.style.display = m < n ? '' : 'none');
      const top = 190 - (TEMP[i] + 1) / 1.6 * 160;
      J.merc.setAttribute('y', top.toFixed(1)); J.merc.setAttribute('height', (200 - top).toFixed(1));
      J.y.textContent = `${c.yr}년`; J.c.textContent = `이산화 탄소 약 ${Math.round(CO2[i])} ppm (점 ${n}개)`; J.t.textContent = `기온 편차 약 ${f2(TEMP[i])} °C`;
      const A = cur.a.yr - Y0, B = cur.b.yr - Y0;
      if (cur.a.yr === cur.b.yr) dd.textContent = '두 눈금이 같은 해에 있다';
      else dd.textContent = `${cur.b.yr - cur.a.yr > 0 ? '' : ''}${Math.abs(cur.b.yr - cur.a.yr)}년 사이 · 이산화 탄소 ${CO2[B] - CO2[A] >= 0 ? '+' : '−'}${Math.abs(CO2[B] - CO2[A]).toFixed(0)} ppm · 기온 ${f2(TEMP[B] - TEMP[A])} °C`;
    }
    // 그래프 위 끌기: 가까운 눈금을 잡는다
    const toYear = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(svg.getScreenCTM().inverse()); return Y0 + (q.x - P.l) / (P.r - P.l) * (2025 - Y0); };
    let hold = null;
    svg.addEventListener('pointerdown', (e) => {
      const yr = toYear(e);
      hold = Math.abs(cur.a.yr - yr) <= Math.abs(cur.b.yr - yr) ? 'a' : 'b';
      try { svg.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ }
      set(hold, yr); cur[hold].g.classList.add('drag');
    });
    svg.addEventListener('pointermove', (e) => { if (hold) set(hold, toYear(e)); });
    const up = () => { if (hold) cur[hold].g.classList.remove('drag'); hold = null; };
    svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
    const avgB = root.querySelector('.tr-avg');
    avgB.addEventListener('click', () => { root._trState=root._trState||{};root._trState.avg=true; const on = avgB.getAttribute('aria-pressed') !== 'true'; avgB.setAttribute('aria-pressed', String(on)); avg.classList.toggle('on', on); });
    root.querySelector('.tr-ends').addEventListener('click', () => { set('a', 1950); set('b', 2023); });
    set('a', 1950); set('b', 1985);root._trState.moved=false;
    root._tr = { set, avg: (on) => { avgB.setAttribute('aria-pressed', String(on)); avg.classList.toggle('on', on); } };
    return {};
  }
  window.Trend = { mount };
})();
