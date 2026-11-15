/* 1-1 1차시 이론 장 «측정 범위가 넓어지면»(교과서 16쪽). 연도 막대(1400~2025년)를 끌면
   그때까지 잴 수 있던 길이·시간의 범위 띠가 넓어지고, 새로 나온 도구가 띠 끝에 붙는다.
   연도와 범위는 이해를 돕기 위한 대략의 예. RangeBar.mount(root) → {} · 시험용: root._rb.set(연도) */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, at, par) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  // [연도, 띠(len/time), 끝(lo/hi), log10 값, 도구, 한 줄]
  const EV = [
    [1400, 'len', 'lo', -3, '자의 눈금', '손가락 마디·막대 대신 눈금 자로 1 mm쯤까지'],
    [1400, 'len', 'hi', 7, '지구 둘레 추정', '그림자 각도로 지구 크기를 짐작했다'],
    [1400, 'time', 'lo', 3, '해시계·물시계', '몇 분 단위까지 읽었다'],
    [1400, 'time', 'hi', 11, '역사 기록', '수천 년의 기록'],
    [1434, 'time', 'lo', 2.5, '앙부일구', '해 그림자로 시각을 쟀다'],
    [1656, 'time', 'lo', 0, '진자 시계', '흔들림을 세어 1초 단위로'],
    [1676, 'len', 'lo', -6, '광학 현미경', '미생물과 세포가 보이기 시작했다'],
    [1672, 'len', 'hi', 11, '태양까지 거리', '행성 관측으로 지구~태양 거리를 계산'],
    [1838, 'len', 'hi', 17, '가까운 별까지 거리', '별의 위치가 조금씩 바뀌는 것으로 거리 계산'],
    [1907, 'time', 'hi', 17, '암석 연대 측정', '방사성 원소로 지구가 수십억 년 되었음을 앎'],
    [1924, 'len', 'hi', 22.4, '안드로메다까지 거리', '우리은하 밖에 다른 은하가 있음을 알게 됨'],
    [1931, 'len', 'lo', -8.5, '전자 현미경', '바이러스가 보이기 시작했다'],
    [1955, 'time', 'lo', -9, '세슘 원자시계', '10억분의 1초까지 정밀하게'],
    [1965, 'time', 'hi', 17.6, '우주의 나이', '우주에서 온 빛으로 138억 년을 앎'],
    [1986, 'len', 'lo', -10, '원자 힘 현미경', '원자 하나하나를 찍는다'],
    [1995, 'len', 'hi', 26, '우주 망원경', '수십억 광년 떨어진 은하까지'],
    [2001, 'time', 'lo', -17, '아주 짧은 빛 펄스', '원자 속 전자의 움직임까지(아토초)'],
  ].sort((a, b) => a[0] - b[0]);
  const AX = { len: { lo: -11, hi: 27, y: 92, name: '길이', unit: 'm' }, time: { lo: -18, hi: 18, y: 262, name: '시간', unit: '초' } };
  const X0 = 60, X1 = 900;
  const SUP = '⁰¹²³⁴⁵⁶⁷⁸⁹';
  const pw = (n) => '10' + (n < 0 ? '⁻' : '') + String(Math.abs(n)).split('').map((d) => SUP[d]).join('');

  function mount(root) {
    const svg = root.querySelector('.rb-svg'), range = root.querySelector('.rb-range'), yr = root.querySelector('.rb-year'), news = root.querySelector('.rb-news');
    const xOf = (k, v) => X0 + (v - AX[k].lo) / (AX[k].hi - AX[k].lo) * (X1 - X0);
    const bands = {};
    ['len', 'time'].forEach((k) => {
      const A = AX[k];
      el('text', { x: X0, y: A.y - 44, class: 'rb-name' }, svg).textContent = `${A.name} (${A.unit})`;
      el('rect', { x: X0, y: A.y - 20, width: X1 - X0, height: 40, rx: 20, class: 'rb-track' }, svg);
      const b = el('rect', { x: X0, y: A.y - 20, width: 10, height: 40, rx: 20, class: 'rb-band ' + k }, svg);
      for (let n = A.lo; n <= A.hi; n++) if (n % 3 === 0) { const x = xOf(k, n); el('line', { x1: x, y1: A.y + 22, x2: x, y2: A.y + 32, class: 'rb-tk' }, svg); el('text', { x, y: A.y + 56, class: 'rb-tl', 'text-anchor': 'middle' }, svg).textContent = pw(n); }
      const lo = el('text', { class: 'rb-end', 'text-anchor': 'end' }, svg), hi = el('text', { class: 'rb-end' }, svg);
      bands[k] = { b, lo, hi };
    });
    // 사람의 감각으로 바로 아는 범위(눈금 자·하루~일생)
    [['len', -3, 4], ['time', -1, 9.4]].forEach(([k, a, z]) => { const y = AX[k].y; el('rect', { x: xOf(k, a), y: y - 26, width: xOf(k, z) - xOf(k, a), height: 52, rx: 8, class: 'rb-sense' }, svg); });
    el('text', { x: xOf('len', 0.5), y: AX.len.y - 30, class: 'rb-st', 'text-anchor': 'middle' }, svg).textContent = '맨눈·몸으로';
    function set(y) {
      y = Math.round(clamp(y, 1400, 2025)); range.value = String(y); yr.textContent = `${y}년`;
      const got = EV.filter((e) => e[0] <= y);
      ['len', 'time'].forEach((k) => {
        const lo = Math.min(...got.filter((e) => e[1] === k && e[2] === 'lo').map((e) => e[3])), hi = Math.max(...got.filter((e) => e[1] === k && e[2] === 'hi').map((e) => e[3]));
        const xa = xOf(k, lo), xb = xOf(k, hi), B = bands[k];
        B.b.setAttribute('x', xa); B.b.setAttribute('width', Math.max(10, xb - xa));
        const tl = got.filter((e) => e[1] === k && e[2] === 'lo').pop(), th = got.filter((e) => e[1] === k && e[2] === 'hi').pop();
        const A = AX[k];
        B.lo.setAttribute('x', xa - 10); B.lo.setAttribute('y', A.y + 8); B.lo.textContent = tl[4];
        B.hi.setAttribute('x', xb + 10); B.hi.setAttribute('y', A.y + 8); B.hi.textContent = th[4];
        B.hi.setAttribute('text-anchor', xb > X1 - 160 ? 'end' : 'start'); if (xb > X1 - 160) { B.hi.setAttribute('x', xb - 22); B.hi.classList.add('in'); } else B.hi.classList.remove('in');
        B.lo.setAttribute('text-anchor', xa < X0 + 160 ? 'start' : 'end'); if (xa < X0 + 160) { B.lo.setAttribute('x', xa + 22); B.lo.classList.add('in'); } else B.lo.classList.remove('in');
      });
      const last = got.slice(-3).reverse();
      news.innerHTML = last.map((e, i) => `<li class="${i ? '' : 'new'}"><span class="rb-y">${e[0]}</span><b>${e[4]}</b> ${e[5]}</li>`).join('');
      root.dispatchEvent(new CustomEvent('rb-change', { detail: y }));
    }
    range.addEventListener('input', () => set(+range.value));
    set(1400);
    root._rb = { set };
    return {};
  }
  window.RangeBar = { mount };
})();
