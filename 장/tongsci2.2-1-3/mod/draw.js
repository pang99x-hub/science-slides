/* 탐구 ① 배출 곡선 그리기(교과서 90쪽 그래프 (가)·(나), 상황 A·B는 IPCC 6차 보고서 시나리오). 값은 교과서 그래프에서 읽은 것(5년 간격).
   위 그래프에 2020~2100년 이산화 탄소 배출량 곡선을 손가락으로 그리면(지나간 해의 값이 바뀐다) 아래 기온 변화량 곡선이 따라 그려진다.
   기온 어림: 2020년부터 쌓인 배출량 C가 A·B 사이 어디쯤인지 w = (C − C_B)/(C_A − C_B)로 재고 T = T_B + w(T_A − T_B)
   (쌓인 양 차이가 작은 앞부분은 그해 배출량 비율로). 교과서 두 곡선을 잇는 어림이라 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const YRS = Array.from({ length: 17 }, (_, i) => 2020 + i * 5);
  const EA = [41, 44, 50, 57, 64, 72, 80, 88, 97, 105, 114, 121, 126, 128, 128, 127, 126];
  const EB = [39.5, 38, 36, 32, 28, 24, 20, 16, 12, 8, 4, 0.5, -3, -6, -9, -9.5, -9.5];
  const TA = [1.25, 1.42, 1.6, 1.78, 1.95, 2.15, 2.35, 2.57, 2.8, 3.02, 3.25, 3.5, 3.75, 4.0, 4.25, 4.5, 4.72];
  const TB = [1.25, 1.4, 1.5, 1.54, 1.56, 1.56, 1.56, 1.54, 1.52, 1.5, 1.47, 1.45, 1.42, 1.4, 1.37, 1.35, 1.32];
  const cum = (E) => E.reduce((a, v, i) => (a.push(i ? a[i - 1] + 5 * (E[i - 1] + v) / 2 : 0), a), []);
  const CA = cum(EA), CB = cum(EB);
  // 위(배출)·아래(기온) 그래프 영역
  const G1 = { l: 110, r: 940, t: 30, b: 300, y0: -20, y1: 130 }, G2 = { l: 110, r: 940, t: 370, b: 600, y0: 1, y1: 5 };
  const X = (yr) => G1.l + (yr - 2020) / 80 * (G1.r - G1.l);
  const Y = (G, v) => G.b - (v - G.y0) / (G.y1 - G.y0) * (G.b - G.t);

  function mount(root) {
    const svg = root.querySelector('.sc-svg'), now = root.querySelector('.sc-now'), out = root.querySelector('.sc-out'), earth = root.querySelector('.sc-earth');
    const E = EA.map(() => null); E[0] = 40;
    function axes(G, step, unit, fmt) {
      for (let v = G.y0; v <= G.y1 + 1e-9; v += step) { el('line', { x1: G.l, x2: G.r, y1: Y(G, v), y2: Y(G, v), class: 'sc-grid' + (v === 0 ? ' z' : '') }, svg); el('text', { x: G.l - 12, y: Y(G, v) + 7, class: 'sc-ax l' }, svg).textContent = fmt(v); }
      YRS.filter((y) => y % 20 === 0).forEach((y) => el('text', { x: X(y), y: G.b + 28, class: 'sc-ax c' }, svg).textContent = y);
      el('path', { d: `M${G.l} ${G.t} V${G.b} H${G.r}`, class: 'sc-frame' }, svg);
      el('text', { x: G.r, y: G.t - 8, class: 'sc-unit' }, svg).textContent = unit;
    }
    axes(G1, 20, '(가) 해마다 내보내는 이산화 탄소(10⁹ t/년)', (v) => String(v).replace('-', '−'));
    axes(G2, 1, '(나) 지표 기온 변화량(°C)', (v) => v.toFixed(1));
    const line = (G, arr, cls) => el('path', { d: arr.map((v, i) => `${i ? 'L' : 'M'}${X(YRS[i]).toFixed(1)} ${Y(G, v).toFixed(1)}`).join(' '), class: cls }, svg);
    line(G1, EA, 'sc-ref a'); line(G1, EB, 'sc-ref b'); line(G2, TA, 'sc-ref a'); line(G2, TB, 'sc-ref b');
    el('text', { x: X(2072), y: Y(G1, 118) - 12, class: 'sc-rt a' }, svg).textContent = 'A';
    el('text', { x: X(2090), y: Y(G1, -9) - 14, class: 'sc-rt b' }, svg).textContent = 'B';
    el('text', { x: X(2094), y: Y(G2, 4.5) - 12, class: 'sc-rt a' }, svg).textContent = 'A';
    el('text', { x: X(2094), y: Y(G2, 1.35) - 12, class: 'sc-rt b' }, svg).textContent = 'B';
    const myE = el('path', { class: 'sc-my' }, svg), myT = el('path', { class: 'sc-my t' }, svg);
    const pen = el('circle', { r: 9, class: 'sc-pen' }, svg);
    const hit = el('rect', { tabindex: '0', role: 'application', 'aria-label': '배출 곡선 그리는 곳(→ 다음 해로 잇기, ↑·↓ 값 바꾸기)', x: G1.l - 20, y: G1.t - 10, width: G1.r - G1.l + 40, height: G1.b - G1.t + 20, class: 'sc-hit' }, svg);
    function temps() {
      const filled = []; let last = E[0];
      E.forEach((v) => { if (v !== null) last = v; filled.push(last); });
      const C = cum(filled);
      return filled.map((v, i) => {
        if (!i) return TA[0];
        const d = CA[i] - CB[i];
        let w = d > 40 ? (C[i] - CB[i]) / d : (v - EB[i]) / ((EA[i] - EB[i]) || 1);
        w = clamp(w, -0.4, 1.4);
        return clamp(TB[i] + w * (TA[i] - TB[i]), 0.9, 5.4);
      });
    }
    function paint() { root._scProgress=root._scProgress||{};const vals=E.filter(v=>v!=null);if(vals.length>12){if(vals[vals.length-1]>70)root._scProgress.high=true;if(vals[vals.length-1]<15)root._scProgress.low=true;}
      const n = E.reduce((k, v, i) => (v !== null ? i : k), 0);
      const pts = E.map((v, i) => [i, v]).filter(([, v]) => v !== null);
      myE.setAttribute('d', pts.map(([i, v], k) => `${k ? 'L' : 'M'}${X(YRS[i]).toFixed(1)} ${Y(G1, v).toFixed(1)}`).join(' '));
      const T = temps();
      myT.setAttribute('d', T.slice(0, n + 1).map((v, i) => `${i ? 'L' : 'M'}${X(YRS[i]).toFixed(1)} ${Y(G2, v).toFixed(1)}`).join(' '));
      const t = T[n];
      out.innerHTML = n < 16 ? `${YRS[n]}년까지 그렸다 · 기온 변화량 약 <b>${t.toFixed(1)} °C</b>` : `2100년 기온 변화량 약 <b>${t.toFixed(1)} °C</b> <span>(A 약 4.7 · B 약 1.3)</span>`;
      // 지구: 기온이 높을수록 극 얼음이 작고 붉어진다
      const u = clamp((t - 1.2) / 3.5, 0, 1);
      earth.querySelector('.sc-cap.n').setAttribute('ry', (26 - 22 * u).toFixed(1));
      earth.querySelector('.sc-cap.s').setAttribute('ry', (22 - 14 * u).toFixed(1));
      earth.querySelector('.sc-glow').style.opacity = (u * 0.75).toFixed(2);
      earth.querySelector('.sc-et').textContent = n < 16 ? '' : u > 0.65 ? '극 얼음이 크게 줄었다' : u > 0.25 ? '극 얼음이 줄었다' : '지금과 비슷하다';
      now.textContent = n === 0 ? '위 그래프에 2020년부터 손가락으로 곡선을 그려 보자' : n < 16 ? '2100년까지 이어 그려 보자' : t > 3 ? 'A에 가까운 길 · 기온이 크게 오른다' : t < 2 ? 'B에 가까운 길 · 기온 상승이 멈춘다' : 'A와 B 사이의 길';
      now.classList.toggle('done', n >= 16);
    }
    const toSvg = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(svg.getScreenCTM().inverse()); return [q.x, q.y]; };
    let down = false, prev = null;
    function at(e) {
      const [x, y] = toSvg(e);
      const yr = clamp(2020 + (x - G1.l) / (G1.r - G1.l) * 80, 2020, 2100), v = clamp(G1.y0 + (G1.b - y) / (G1.b - G1.t) * (G1.y1 - G1.y0), -20, 130);
      const i = Math.round((yr - 2020) / 5);
      pen.setAttribute('cx', X(YRS[i])); pen.setAttribute('cy', Y(G1, v));
      if (i === 0) { prev = [0, v]; return; }
      // 지난 칸과 이 칸 사이를 채운다(빠르게 그어도 끊기지 않게)
      const [pi, pv] = prev || [i, v];
      const a = Math.min(pi, i), b = Math.max(pi, i);
      for (let k = Math.max(1, a); k <= b; k++) E[k] = pi === i ? v : pv + (v - pv) * (k - pi) / (i - pi);
      // 앞쪽 빈 칸은 그 앞 값으로 잇는다
      for (let k = 1; k < i; k++) if (E[k] === null) E[k] = E[k - 1];
      prev = [i, v]; paint();
    }
    hit.addEventListener('pointerdown', (e) => { down = true; prev = null; try { hit.setPointerCapture(e.pointerId); } catch { /* 합성 */ } at(e); });
    hit.addEventListener('pointermove', (e) => { if (down) at(e); });
    const up = () => { down = false; };
    hit.addEventListener('pointerup', up); hit.addEventListener('pointercancel', up);
    hit.addEventListener('keydown', (e) => {
      const n = E.reduce((k, v, i) => (v !== null ? i : k), 0);
      if (e.key === 'ArrowRight' && n < 16) E[n + 1] = E[n];
      else if (e.key === 'ArrowUp') E[n] = clamp(E[n] + 5, -20, 130);
      else if (e.key === 'ArrowDown') E[n] = clamp(E[n] - 5, -20, 130);
      else return;
      e.preventDefault(); e.stopPropagation(); paint();
    });
    root.querySelector('.sc-clear').addEventListener('click', () => { E.fill(null); E[0] = 40; paint(); });
    paint();
    root._sc = { set(arr) { arr.forEach((v, i) => { E[i] = v; }); paint(); }, A: EA, B: EB };
    return {};
  }
  window.Scenario = { mount };
})();
