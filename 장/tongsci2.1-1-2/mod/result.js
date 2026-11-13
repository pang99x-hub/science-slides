/* 2차시 4장 «결과 읽기»: 교과서 23쪽 모의실험 예시 결과(남은 개수 × 2)를 회차 막대로 넘기며 읽는다.
   막대를 끌면 그 회차까지의 누적 막대가 나타나고, 지금 회차의 비율·풀이가 바뀐다. 시험용: root._rs.set(k) */
(function () {
  'use strict';
  const K = window.EvKit;
  const COL = { r: '#d8343f', y: '#f2c230', g: '#2f9e5b', b: '#2a63c9' }, NAME = { r: '빨강', y: '노랑', g: '초록', b: '파랑' }, ORD = ['y', 'r', 'g', 'b'];
  // 교과서 23쪽 예시 결과(남은 개수 × 2), 2회 뒤 초록 3 → 노랑 3
  const ST = [
    { t: '처음', v: { r: 10, y: 0, g: 10, b: 10 }, d: '빨강·초록·파랑 <b>10개씩</b>. 노랑은 아직 없다.' },
    { t: '1회 뒤', v: { r: 12, y: 0, g: 10, b: 8 }, d: '15개를 집어낸 뒤 남은 수만큼 더했다. 노란 도화지 위에서 <b>빨강</b>이 가장 많이 남았다.' },
    { t: '2회 뒤', v: { r: 14, y: 0, g: 10, b: 6 }, d: '빨강이 조금 더 늘고 파랑이 줄었다. 아직 어느 색도 도화지와 같지 않다.' },
    { t: '초록 → 노랑', v: { r: 14, y: 3, g: 7, b: 6 }, d: '초록 3개를 <b>노랑 3개</b>로 바꿨다 = 돌연변이로 집단에 <b>새 형질</b>이 생김.' },
    { t: '3회 뒤', v: { r: 12, y: 6, g: 6, b: 6 }, d: '노랑 3개 모두 살아남아 6개가 됐다. 도화지와 같은 색이라 <b>눈에 덜 띈다</b>.' },
    { t: '4회 뒤', v: { r: 14, y: 12, g: 2, b: 2 }, d: '노랑이 12개로 늘고 초록·파랑은 거의 사라졌다.' },
    { t: '5회 뒤', v: { r: 4, y: 22, g: 2, b: 2 }, d: '노랑이 <b>22개</b>로 가장 많다. 환경(노란 도화지)에 맞는 형질의 <b>비율</b>이 회를 거듭할수록 늘었다.' },
  ];
  function mount(root) {
    const svg = root.querySelector('.rs-svg'), range = root.querySelector('.rs-range'), pills = [...root.querySelectorAll('.rs-pills button')];
    const tag = root.querySelector('.rs-tag'), nm = root.querySelector('.rs-name'), d = root.querySelector('.rs-d'), pct = root.querySelector('.rs-pct');
    const el = (t, a, p) => K.el(t, a, p || svg);
    const X0 = 90, W = 120, G = 32, Y0 = 470, H = 400;
    el('line', { x1: X0 - 10, x2: X0 + 7 * (W + G), y1: Y0, y2: Y0, class: 'rs-ax' });
    [0, 10, 20, 30].forEach((n) => { el('line', { x1: X0 - 10, x2: X0 + 7 * (W + G), y1: Y0 - n / 30 * H, y2: Y0 - n / 30 * H, class: 'rs-grid' }); el('text', { x: X0 - 18, y: Y0 - n / 30 * H + 8, class: 'rs-tick' }).textContent = n; });
    el('text', { x: 30, y: 250, class: 'rs-yl', 'writing-mode': 'tb' }).textContent = '초콜릿(개)';
    const bars = ST.map((s, i) => {
      const g = el('g', { class: 'rs-bar' }); let y = Y0; const x = X0 + i * (W + G);
      ORD.forEach((c) => { const n = s.v[c]; if (!n) return; const h = n / 30 * H; y -= h; el('rect', { x, y, width: W, height: h, fill: COL[c], class: 'rs-seg' }, g); if (n >= 2) el('text', { x: x + W / 2, y: y + h / 2 + 9, class: 'rs-n' + (c === 'y' ? ' dark' : '') }, g).textContent = n; });
      el('text', { x: x + W / 2, y: Y0 + 34, class: 'rs-x' }, g).textContent = s.t;
      return g;
    });
    let k = 0;
    function set(v) {
      k = Math.max(0, Math.min(ST.length - 1, Math.round(v))); range.value = String(k);
      bars.forEach((b, i) => { b.classList.toggle('hide', i > k); b.classList.toggle('on', i === k); });
      pills.forEach((b, i) => { b.setAttribute('aria-pressed', String(i === k)); b.classList.toggle('past', i < k); });
      const s = ST[k]; tag.textContent = `${k + 1} / ${ST.length}`; nm.textContent = s.t; d.innerHTML = s.d;
      pct.innerHTML = ORD.map((c) => `<span><i style="background:${COL[c]}"></i>${NAME[c]} <b>${Math.round(s.v[c] / 30 * 100)}%</b></span>`).join('');
    }
    range.addEventListener('input', () => set(+range.value)); range.addEventListener('keydown', (e) => e.stopPropagation());
    pills.forEach((b, i) => b.addEventListener('click', () => set(i)));
    set(0);
    root._rs = { set };
    return {};
  }
  window.EvResult = { mount };
})();
