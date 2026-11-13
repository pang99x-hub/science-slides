/* 기후 변화의 영향(교과서 88쪽, 90쪽 예시 답안): 한반도 지도(SVG). 막대로 지구 평균 기온 상승(산업화 이전 대비)을 1.1 → 4.5 °C로 밀면
   사과밭이 북쪽으로 옮겨 가고, 남해안에 감귤·바나나(아열대 작물)가 생기며, 동해의 명태(한류성) 떼는 북쪽으로 떠나고 고등어·멸치(난류성)가 늘고,
   서해안 낮은 땅이 물에 잠기고, 태풍 표시가 커진다. 오른쪽 목록에 그 기온에서 두드러지는 변화가 켜진다.
   1.1 °C(2011~2020년)는 IPCC 제6차 평가 보고서 값. 재배지·어장의 위치와 켜지는 기온은 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const KOR = [[124.4, 40.1], [125.0, 39.5], [124.8, 38.6], [125.5, 37.8], [126.6, 37.4], [126.5, 36.8], [126.2, 36.4], [126.6, 35.7], [126.3, 35.1], [126.4, 34.5], [127.2, 34.6], [127.9, 34.7], [128.6, 34.9], [129.2, 35.2], [129.5, 35.9], [129.4, 36.5], [129.3, 37.2], [128.9, 37.7], [128.4, 38.4], [127.6, 39.1], [128.4, 39.7], [129.4, 40.6], [129.8, 41.0], [130.6, 42.4], [129.7, 42.4], [128.9, 42.0], [128.0, 41.8], [127.0, 41.6], [126.0, 41.0]];
  const X = (lo) => 400 + (lo - 127.5) * 52, Y = (la) => (43.2 - la) * 60;
  // 기온에 따라 켜지는 변화 [기온, 칸 이름, 설명]
  const FX = [
    [1.1, 'ice', '극지방·높은 산의 빙하가 줄고 있다'],
    [1.5, 'apple', '사과를 기르기 알맞은 곳이 북쪽·높은 곳으로 옮겨 간다'],
    [2.0, 'fish', '한류성 물고기(명태)가 줄고 난류성 물고기(고등어·멸치)가 는다'],
    [2.5, 'fruit', '남해안에서 감귤·바나나 같은 아열대 작물을 기른다'],
    [3.0, 'sea', '바닷물이 데워져 부피가 늘고 빙하가 녹아 해수면이 올라 낮은 땅이 잠긴다'],
    [3.5, 'storm', '강한 태풍·홍수·가뭄 같은 이상 기후가 잦아진다'],
    [4.0, 'health', '모기가 옮기는 감염병이 늘고, 이산화 탄소가 녹아 바다가 산성화된다'],
  ];

  function mount(root) {
    const svg = root.querySelector('.kr-svg'), range = root.querySelector('#kr-t'), tv = root.querySelector('.kr-tv'), now = root.querySelector('.kr-now');
    const items = Object.fromEntries([...root.querySelectorAll('.kr-fx li')].map((li) => [li.dataset.k, li]));
    el('rect', { x: -200, y: -100, width: 1300, height: 1000, class: 'kr-seabg' }, svg);
    const warmSea = el('rect', { x: -200, y: -100, width: 1300, height: 1000, class: 'kr-warmsea' }, svg);
    const land = el('path', { d: KOR.map(([lo, la], i) => `${i ? 'L' : 'M'}${X(lo).toFixed(1)} ${Y(la).toFixed(1)}`).join(' ') + 'Z', class: 'kr-land' }, svg);
    void land;
    el('ellipse', { cx: X(126.55), cy: Y(33.38), rx: 20, ry: 9, class: 'kr-land' }, svg);
    // 잠기는 서해안 낮은 땅
    const flood = el('g', { class: 'kr-flood' }, svg);
    [[126.6, 37.2, 10, 7], [126.45, 36.6, 8, 13], [126.5, 35.5, 8, 16], [126.7, 34.75, 12, 6], [128.9, 35.1, 10, 5]].forEach(([lo, la, rx, ry]) => el('ellipse', { cx: X(lo), cy: Y(la), rx, ry }, flood));
    el('text', { x: X(125.0), y: Y(38.3), class: 'kr-sea' }, svg).textContent = '서해';
    el('text', { x: X(130.4), y: Y(38.5), class: 'kr-sea' }, svg).textContent = '동해';
    el('text', { x: X(127.6), y: Y(33.6), class: 'kr-sea' }, svg).textContent = '남해';
    // 사과밭(띠 안에 흩어 놓음)
    const apples = Array.from({ length: 14 }, (_, i) => {
      const g = el('g', { class: 'kr-apple' }, svg); el('circle', { r: 7 }, g); el('path', { d: 'M0 -7 q 3 -6 7 -4 q -3 4 -7 4', class: 'kr-leaf' }, g);
      return { g, lo: 126.9 + (i % 5) * 0.42 + ((i * 7) % 3) * 0.06, off: (Math.floor(i / 5) - 1) * 0.55 + ((i * 3) % 4) * 0.08 };
    });
    // 감귤·바나나
    const fruits = [[126.3, 33.4, 'c'], [126.8, 33.35, 'c'], [127.4, 34.8, 'c'], [128.1, 34.9, 'c'], [126.9, 35.0, 'b'], [127.7, 35.1, 'b'], [128.7, 35.2, 'c'], [126.7, 35.6, 'b']].map(([lo, la, k], i) => {
      const g = el('g', { class: `kr-fruit ${k}`, transform: `translate(${X(lo)} ${Y(la)})` }, svg);
      if (k === 'c') el('circle', { r: 7 }, g); else el('path', { d: 'M-8 -3 q 8 12 17 -2 q -8 5 -17 2' }, g);
      return { g, th: 2.4 + (i % 4) * 0.45 };
    });
    // 물고기 떼
    const school = (cls, n) => Array.from({ length: n }, (_, i) => { const g = el('g', { class: cls }, svg); el('path', { d: 'M-8 0 q 8 -6 16 0 q -8 6 -16 0 m 16 0 l 6 -5 v 10 z' }, g); return { g, i }; });
    const cod = school('kr-cod', 8), mack = school('kr-mack', 10);
    const storm = el('g', { class: 'kr-storm' }, svg);
    el('circle', { r: 30 }, storm); el('path', { d: 'M0 -30 a 30 30 0 0 1 30 30 M0 30 a 30 30 0 0 1 -30 -30', class: 'kr-swirl' }, storm);
    const mosq = el('text', { class: 'kr-mosq', x: X(127.2), y: Y(35.6) }, svg); mosq.textContent = '';
    let T = 1.1, tm = 0, active = false, raf = 0, last = 0;
    function paint() {
      T = Number(range.value) / 10;
      tv.textContent = `+${T.toFixed(1)} °C`;
      const u = (T - 1.1) / 3.4;
      const appleLat = 36.2 + 2.6 * u;
      apples.forEach((a) => { const la = appleLat + a.off; a.g.setAttribute('transform', `translate(${X(a.lo).toFixed(1)} ${Y(la).toFixed(1)})`); a.g.style.opacity = la > 41.5 ? 0 : 1; });
      fruits.forEach((f) => f.g.style.opacity = T >= f.th ? 1 : 0);
      flood.style.opacity = clamp((T - 2.6) / 1.6, 0, 1);
      warmSea.style.opacity = clamp(u, 0, 1) * 0.3;
      storm.style.opacity = clamp((T - 2.8) / 1.2, 0, 1); storm.setAttribute('transform', `translate(${X(129.6)} ${Y(33.4)}) scale(${(0.8 + u * 0.8).toFixed(2)})`);
      mosq.textContent = T >= 4 ? '모기 ↑' : '';
      FX.forEach(([t, k]) => items[k].classList.toggle('on', T >= t));
      const n = FX.filter(([t]) => T >= t).length;
      now.textContent = T < 1.5 ? '막대를 밀어 지구 평균 기온을 올려 보자' : `${n}가지 변화가 나타났다`;
      now.classList.toggle('done', n >= 5);
    }
    function move(dt) {
      tm += dt; const u = (T - 1.1) / 3.4;
      cod.forEach((c) => { const la = 39.0 + 3.5 * u + Math.sin(tm + c.i) * 0.15 + (c.i % 3) * 0.3, lo = 130.0 + (c.i % 4) * 0.35 + Math.sin(tm * 0.7 + c.i) * 0.2; c.g.setAttribute('transform', `translate(${X(lo).toFixed(1)} ${Y(la).toFixed(1)})`); c.g.style.opacity = la > 42.3 ? 0 : 1; });
      mack.forEach((m) => { const la = 33.6 + (m.i % 3) * 0.35 + 3.2 * u * ((m.i % 2) + 0.5), lo = 128.8 + (m.i % 5) * 0.45 + Math.sin(tm * 0.9 + m.i) * 0.2; m.g.setAttribute('transform', `translate(${X(lo).toFixed(1)} ${Y(la).toFixed(1)})`); m.g.style.opacity = m.i < 4 + Math.round(6 * u) ? 1 : 0; });
      storm.querySelector('.kr-swirl').setAttribute('transform', `rotate(${(-tm * 90) % 360})`);
    }
    function tick(t) { raf = 0; if (!active) return; const dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t; move(dt); raf = requestAnimationFrame(tick); }
    range.addEventListener('input', paint);
    range.addEventListener('keydown', (e) => e.stopPropagation());
    paint(); move(0);
    root._kr = { set(v) { range.value = String(Math.round(v * 10)); paint(); move(0); } };
    return { setActive(on) { active = on && !window.Stage.reduce; if (active && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); } if (!active && raf) { cancelAnimationFrame(raf); raf = 0; } } };
  }
  window.Korea = { mount };
})();
