/* 1-2-1 2차시 «측정 표준의 쓰임»(교과서 30~31·36쪽): 장마다 조각을 붙인다.
   소단원 차시 늘리기(2026-11-13)로 옛 1차시 틀에서 장을 나눠 실었다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));

  part('cover', (root) => {
    const m = window.Cov.mount(root, 'zone');
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector('#pr-el').classList.toggle('answer', on);
    return { fit: m.fit, setActive: m.setActive, fragment(f, on) { if (f.dataset.anim === 'au') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="au"]'); answer(!!f && f.classList.contains('visible')); } };
  });

  part('bolts', (root) => window.Parts.mount(root));

  part('use', window.EthTrack.theory);

  part('game1', (root) => window.EthGame.mount(root, {
    id: 'std', title: '40초 어떤 측정 표준일까', seconds: 40,
    intro: '장면에 쓰인 측정 표준을 골라!<br>«게임 시작»을 누르자',
    endSay: '숫자와 단위로 정해진 기준이 있나? 없으면 «표준 아님»',
    items: [
      { q: '스마트폰에 뜬 시각에 맞춰 시험을 시작한다', a: 'time', why: '표준시 → 시간 표준.' },
      { q: '콘서트 입장권을 정각 8시에 예매한다', a: 'time', why: '모두 같은 표준시에 맞춘다 → 시간 표준.' },
      { q: '100 m 달리기 기록을 0.01초까지 잰다', a: 'time', why: '공식 기록 장치 → 시간 표준.' },
      { q: '우리나라 시계는 그리니치보다 9시간 빠르다', a: 'time', why: '동경 135° 표준시 → 시간 표준.' },
      { q: '발 길이에 맞춰 250 mm 신발을 주문한다', a: 'len', why: 'mm → 길이 표준.' },
      { q: '자동차 부품을 정해진 지름으로 깎는다', a: 'len', why: '부품 크기 → 길이 표준.' },
      { q: '택시 요금이 달린 거리에 따라 올라간다', a: 'len', why: '이동 거리(km) → 길이 표준.' },
      { q: '육상 경기장의 트랙 한 바퀴를 400 m로 만든다', a: 'len', why: 'm → 길이 표준.' },
      { q: '정육점 저울로 고기 600 g을 산다', a: 'mass', why: 'g → 질량 표준.' },
      { q: '과자 봉지에 «당류 12 g»이라고 적혀 있다', a: 'mass', why: '영양 성분 g → 질량 표준.' },
      { q: '혈당을 mg/dL 단위로 잰다', a: 'mass', why: 'mg(질량)이 들어간 표준 단위.' },
      { q: '택배 무게로 배송비를 정한다', a: 'mass', why: 'kg → 질량 표준.' },
      { q: '이마를 짚어 열이 나는지 본다', a: 'none', why: '도구도 기준도 없다 → 어림.' },
      { q: '친구와 등을 맞대어 키를 견준다', a: 'none', why: '눈으로 견주기 → 어림.' },
      { q: '손뼘으로 책상 길이를 대충 잰다', a: 'none', why: '뼘은 사람마다 다르다 → 표준 아님.' },
      { q: '마음 가는 대로 그림을 그린다', a: 'none', why: '잴 기준이 쓰이지 않는다(교과서 38쪽).' },
    ],
  }));
  part('drill3', (root) => window.Drill.mount(root, [
    {"q":"우리나라 표준시에 대한 설명으로 옳은 것은?","opts":["그리니치 천문대보다 9시간 느리다","동경 135°를 기준으로 하며 그리니치보다 9시간 빠르다","서경 135°를 기준으로 한다","지역마다 다른 표준시를 쓴다","본초 자오선을 그대로 기준으로 삼는다"],"a":1,"why":"<b>동경 135°</b> 기준, 그리니치보다 <b>9시간</b> 빠르다."},
    {"q":"신어 보지 않고도 맞는 신발을 살 수 있는 까닭은?","opts":["신발은 모두 크기가 같아서","발 크기는 누구나 비슷해서","길이의 측정 표준에 맞춰 치수를 정해 만들어서","신발 가게마다 자가 달라서","질량의 측정 표준으로 무게를 달아서"],"a":2,"why":"250 mm는 어디서나 같은 250 mm — <b>길이의 측정 표준</b>."},
    {"q":"측정 표준의 쓰임에 대해 옳은 것만 고른 것은?","box":["ㄱ. 혈당량을 잴 때 쓰인다.","ㄴ. 자동차 부품을 만들 때 쓰인다.","ㄷ. 측정 표준이 있으면 공정하게 거래할 수 있다."],"opts":["ㄱ","ㄷ","ㄱ, ㄴ","ㄴ, ㄷ","ㄱ, ㄴ, ㄷ"],"a":4,"why":"의료·생산·거래 어디에나 쓰인다."},
    {"q":"측정 표준이 쓰이지 않는 경우는?","opts":["느낌대로 자유롭게 그림을 그린다","저울로 고기의 질량을 단다","달리기 기록을 초 단위로 잰다","미세 먼지 농도를 알린다","스마트 기기의 시각에 맞춰 약속한다"],"a":0,"why":"숫자와 단위로 정한 기준이 쓰이지 않는다."},
    {"q":"1975년에 세워진 우리나라의 국가 측정 표준 대표 기관은?","opts":["기상청","한국천문연구원","통계청","한국표준과학연구원","국립중앙과학관"],"a":3,"why":"교과서 36쪽 과학 이야기: <b>한국표준과학연구원</b>."},
  ]));
  part('sum3', (root) => window.RxT.sum(root));
  part('check3', (root) => { window.LessonParts.mountWrap(root); });
  part('calib', (r) => window.Xp.mount(r, 'calib'));
  part('race', (r) => window.Xp.mount(r, 'race'));
  part('stdchain', (r) => window.Xp.mount(r, 'chain'));
})();
