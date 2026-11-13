/* 3차시 표지: 기온 막대를 올리면 산의 식물대가 위로 밀려 올라간다(기후 변화 협약 사례로 들어가기).
   높이 2,000 m 산, 기온이 1 °C 오르면 같은 기온의 높이가 약 170 m 올라간다고 둔다(고도 100 m에 약 0.6 °C).
   식물대 경계(600·1,200·1,600 m)와 산 모양은 이해를 돕기 위한 예. 산은 위로 갈수록 좁아 꼭대기 식물대의 넓이가 빨리 준다. */
(function () {
  'use strict';
  const { el, keep } = window.Kit;
  const W = 660, H = 380, BASE = 350, TOP = 40, HMAX = 2000;
  const ZONES = [
    { name: '늘푸른 넓은잎나무', c: '#4f8f3f', from: 0 },
    { name: '잎 지는 넓은잎나무', c: '#8fb34a', from: 600 },
    { name: '바늘잎나무', c: '#2f6b4a', from: 1200 },
    { name: '고산 식물', c: '#c9b8d8', from: 1600 },
  ];
  const yOf = (h) => BASE - (BASE - TOP) * h / HMAX;
  const halfW = (h) => 300 * (1 - h / HMAX);

  function mount(root) {
    const svg = root.querySelector('.cl-svg'), range = root.querySelector('#cl-t'), tv = root.querySelector('.cl-tv'), read = root.querySelector('.cl-read'), now = root.querySelector('.cl-now');
    el('rect', { class: 'cl-sky', width: W, height: H }, svg);
    const sun = el('circle', { class: 'cl-sun', cx: 625, cy: 46, r: 22 }, svg);
    const defs = el('defs', {}, svg); const cp = el('clipPath', { id: 'cl-m' }, defs);
    const mt = `M${330 - 300} ${BASE} L 330 ${TOP} L ${330 + 300} ${BASE} Z`;
    el('path', { d: mt }, cp);
    const bands = el('g', { 'clip-path': 'url(#cl-m)' }, svg);
    const rects = ZONES.map((z) => el('rect', { x: 0, width: W, fill: z.c, class: 'cl-band' }, bands));
    el('path', { d: mt, class: 'cl-mt' }, svg);
    el('rect', { class: 'cl-ground', x: 0, y: BASE, width: W, height: H - BASE }, svg);
    const labs = ZONES.map(() => el('text', { class: 'cl-lab' }, svg));
    [0, 1000, 2000].forEach((h) => { el('text', { class: 'cl-h', x: 18, y: yOf(h) + 6 }, svg).textContent = `${h.toLocaleString('ko-KR')} m`; el('path', { class: 'cl-tick', d: `M60 ${yOf(h)} h 10` }, svg); });
    const flag = el('text', { class: 'cl-flag', x: 372, y: TOP + 14 }, svg);
    function paint() {
      const d = Number(range.value) / 10, up = d * 170;
      tv.textContent = `+${d.toFixed(1)} °C`;
      ZONES.forEach((z, i) => {
        const a = Math.min(HMAX, z.from === 0 ? 0 : z.from + up), b = i < ZONES.length - 1 ? Math.min(HMAX, ZONES[i + 1].from + up) : HMAX;
        rects[i].setAttribute('y', yOf(b)); rects[i].setAttribute('height', Math.max(0, yOf(a) - yOf(b)));
        const mid = (a + b) / 2; labs[i].setAttribute('x', 330 + halfW(mid) * 0 + (i % 2 ? 60 : -60)); labs[i].setAttribute('y', yOf(mid) + 6);
        labs[i].textContent = b - a > 90 ? z.name : '';
      });
      const a0 = 1600, a1 = Math.min(HMAX, 1600 + up), left = Math.pow((HMAX - a1) / (HMAX - a0), 2);
      flag.textContent = left < 0.02 ? '고산 식물 자리 없음' : '';
      sun.setAttribute('r', 22 + d * 3); sun.style.fill = `color-mix(in srgb, #f2c230 ${100 - d * 15}%, #e9531a)`;
      read.innerHTML = d < 0.05 ? '기온 막대를 올려 보자' : `식물대가 약 <b>${Math.round(up)} m</b> 위로 올라갔다. 고산 식물이 사는 넓이는 처음의 <b>${Math.round(left * 100)}%</b>`;
      now.textContent = d < 0.05 ? '기온 막대를 밀어 보자' : left < 0.05 ? '고산 식물은 더 올라갈 곳이 없다' : '더 올려 보자';
    }
    range.addEventListener('input', paint); keep(range);
    paint();
    root._clim = { t(v) { range.value = String(v * 10); paint(); } };
    return {};
  }
  window.Climate = { mount };
})();
