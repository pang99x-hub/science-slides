/* 1-1 2차시 이론 장 «우리 주변의 기본량»(교과서 18쪽 그림 I-3). 방 그림 속 물건 다섯을 누르면 그 물건이 알려 주는
   기본량·값·단위가 카드에 나온다. 다섯을 다 찾으면 나머지 두 기본량(물질량·광도)도 켜진다.
   Daily.mount(root) → {} · 시험용: root._dl.pick(k) */
(function () {
  'use strict';
  // [키, 기본량, 값, 단위 이름, 풀이]
  const SPOT = {
    map: ['시간', '도착까지 15분', 's(초)', '지도 앱은 도착할 때까지 걸리는 <b>시간</b>을 알려 준다'],
    win: ['길이', '창문 가로 120 cm', 'm(미터)', '창문·가구의 크기는 <b>길이</b>로 나타낸다'],
    scale: ['질량', '양배추 1.2 kg', 'kg(킬로그램)', '채소·고기는 <b>질량</b>으로 값을 비교한다'],
    plug: ['전류', '충전기 2 A', 'A(암페어)', '전자 기기는 정해진 <b>전류</b>를 확인해야 안전하다'],
    therm: ['온도', '체온 36.5 °C', 'K(켈빈)', '몸이 얼마나 뜨거운지는 <b>온도</b>로 나타낸다'],
  };
  const ART = `
  <rect x="0" y="0" width="900" height="520" fill="#f1ece0"/>
  <rect x="0" y="380" width="900" height="140" fill="#cfb48a"/>
  <g class="dl-spot" data-k="win" tabindex="0" role="button" aria-label="창문">
    <rect x="70" y="50" width="250" height="200" rx="6" fill="#bfe0f2" stroke="#5b4630" stroke-width="8"/>
    <path d="M195 50 V250 M70 150 H320" stroke="#5b4630" stroke-width="6"/>
    <path d="M90 230 L150 160 L190 200 L230 150 L300 230 Z" fill="#9cc58a" opacity=".8"/>
    <circle cx="270" cy="95" r="22" fill="#ffd84d"/>
  </g>
  <rect x="380" y="300" width="460" height="22" fill="#8d6a3e" stroke="#4a3826" stroke-width="4"/>
  <path d="M400 322 V470 M820 322 V470" stroke="#4a3826" stroke-width="12"/>
  <g class="dl-spot" data-k="scale" tabindex="0" role="button" aria-label="저울 위 양배추">
    <rect x="410" y="268" width="150" height="32" rx="6" fill="#e3e6ea" stroke="#1d2433" stroke-width="3"/>
    <rect x="455" y="276" width="60" height="16" rx="3" fill="#1d2433"/><text x="485" y="289" text-anchor="middle" class="dl-lcd">1.20</text>
    <circle cx="485" cy="225" r="46" fill="#9fd17e" stroke="#4f8a3a" stroke-width="4"/>
    <path d="M450 215 Q485 190 520 215 M455 240 Q485 222 515 240" stroke="#4f8a3a" stroke-width="3" fill="none"/>
  </g>
  <g class="dl-spot" data-k="map" tabindex="0" role="button" aria-label="지도 앱이 켜진 휴대 전화">
    <rect x="600" y="196" width="78" height="104" rx="10" fill="#1d2433"/>
    <rect x="607" y="206" width="64" height="80" rx="4" fill="#e8f1e4"/>
    <path d="M612 270 Q630 240 645 250 T668 220" stroke="#2a73b8" stroke-width="5" fill="none"/>
    <circle cx="668" cy="220" r="6" fill="#d9483b"/><text x="639" y="222" text-anchor="middle" class="dl-tiny">15분</text>
  </g>
  <g class="dl-spot" data-k="plug" tabindex="0" role="button" aria-label="콘센트에 꽂힌 충전기">
    <rect x="720" y="245" width="70" height="55" rx="8" fill="#fbfcf9" stroke="#1d2433" stroke-width="3"/>
    <text x="755" y="279" text-anchor="middle" class="dl-tiny">2 A</text>
    <path d="M755 245 Q760 170 860 160" stroke="#1d2433" stroke-width="5" fill="none"/>
    <rect x="850" y="130" width="40" height="56" rx="6" fill="#fbfcf9" stroke="#1d2433" stroke-width="3"/>
  </g>
  <g class="dl-spot" data-k="therm" tabindex="0" role="button" aria-label="체온계">
    <rect x="200" y="330" width="120" height="44" rx="22" fill="#fbfcf9" stroke="#1d2433" stroke-width="3" transform="rotate(-12 260 352)"/>
    <rect x="222" y="340" width="56" height="24" rx="4" fill="#d6eef7" stroke="#1d2433" stroke-width="2" transform="rotate(-12 260 352)"/>
    <text x="250" y="360" text-anchor="middle" class="dl-tiny" transform="rotate(-12 260 352)">36.5</text>
  </g>`;

  function mount(root) {
    const svg = root.querySelector('.dl-svg'), card = root.querySelector('.dl-card'), got = root.querySelector('.dl-got'), rest = root.querySelector('.dl-rest');
    svg.innerHTML = ART;
    const found = new Set();
    function pick(k) {
      const s = SPOT[k]; found.add(k);
      svg.querySelectorAll('.dl-spot').forEach((g) => { g.classList.toggle('on', g.dataset.k === k); g.classList.toggle('seen', found.has(g.dataset.k)); });
      const ph = root.querySelector('.dl-photo');
      card.innerHTML = `${k === 'scale' && ph ? `<figure class="dl-fig"><img src="${ph.src}" alt="${ph.alt}"><small class="cr">사진: ${ph.dataset.cr}</small></figure>` : ''}<div class="dl-tx"><div class="dl-h"><span class="t-tag">${s[0]}</span><b>${s[1]}</b></div><p>${s[3]}</p><p class="dl-u">기본 단위 <b>${s[2]}</b></p></div>`;
      got.textContent = `${found.size} / 5`;
      root.querySelectorAll('.dl-qty span').forEach((c) => c.classList.toggle('on', [...found].some((f) => SPOT[f][0] === c.textContent)));
      rest.hidden = found.size < 5;
    }
    svg.querySelectorAll('.dl-spot').forEach((g) => {
      g.addEventListener('click', () => pick(g.dataset.k));
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); pick(g.dataset.k); } });
    });
    card.innerHTML = '<p class="dl-hint">방 안의 물건을 눌러 보자. 무엇을 잴 수 있을까?</p>';
    root._dl = { pick };
    return {};
  }
  window.Daily = { mount };
})();
