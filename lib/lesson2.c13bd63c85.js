/* 1-1-2 1차시 «기본량과 단위»(교과서 18~20쪽): 장마다 조각을 붙인다.
   소단원 차시 늘리기(2026-11-13)로 옛 2차시 틀에서 장을 나눠 실었다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const { join } = window.EthTrack;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));


  part('cover', (root) => {
    window.Doe.mount(root);
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector('#pr-size').classList.toggle('answer', on);
    return {
      fragment(f, on) { if (f.dataset.anim === 'de') answer(on); },
      sync(slide) { const f = slide.querySelector('[data-anim="de"]'); answer(!!f && f.classList.contains('visible')); },
    };
  });

  part('qty', (root) => window.Daily.mount(root));

  part('units', (root) => window.UnitRoad.mount(root));

  part('laptop', (root) => window.Laptop.mount(root));

  part('game2', (root) => window.EthGame.mount(root, {
    id: 'base', title: '40초 어떤 기본량일까', seconds: 40,
    intro: '값과 단위를 보고 기본량을!<br>«게임 시작»을 누르자',
    endSay: '단위를 먼저 보자: m 무리는 길이, g 무리는 질량, s·분·시간은 시간',
    items: [
      { q: '운동장 한 바퀴 400 m', a: 'len', why: 'm → 길이.' },
      { q: '노트북 두께 1.9 cm', a: 'len', why: 'cm → 길이.' },
      { q: '마라톤 42.195 km', a: 'len', why: 'km → 길이(1000 m의 묶음).' },
      { q: '적혈구 지름 7 μm', a: 'len', why: 'μm(마이크로미터) → 길이.' },
      { q: '수학 시험 50분', a: 'time', why: '분 → 시간.' },
      { q: '라면 끓이기 4분', a: 'time', why: '분 → 시간.' },
      { q: '하루 86400 s', a: 'time', why: 's(초) → 시간.' },
      { q: '택배 상자 3 kg', a: 'mass', why: 'kg → 질량.' },
      { q: '배드민턴 셔틀콕 5 g', a: 'mass', why: 'g → 질량.' },
      { q: '화물선 짐 5만 t', a: 'mass', why: 't(톤) = 1000 kg → 질량.' },
      { q: '휴대 전화 충전기 2 A', a: 'cur', why: 'A(암페어) → 전류.' },
      { q: '전기 주전자 8 A', a: 'cur', why: 'A → 전류.' },
      { q: '건전지가 흘려 주는 0.5 A', a: 'cur', why: 'A → 전류.' },
      { q: '체온 36.5 °C', a: 'temp', why: '°C → 온도.' },
      { q: '냉동실 -18 °C', a: 'temp', why: '°C → 온도(기본 단위는 K).' },
      { q: '오늘 최고 기온 31 °C', a: 'temp', why: '°C → 온도.' },
    ],
  }));
  part('drill2', (root) => window.Drill.mount(root, [
    {"q":"과학의 기본량이 아닌 것은?","opts":["시간","길이","질량","전류","속력"],"a":4,"why":"속력은 길이와 시간을 <b>묶어</b> 나타내는 양이다(다음 차시)."},
    {"q":"기본량과 기본 단위를 잘못 짝 지은 것은?","opts":["시간 — s","길이 — m","질량 — g","전류 — A","온도 — K"],"a":2,"why":"질량의 기본 단위는 <b>kg</b>."},
    {"q":"단위에 대해 옳은 것만 고른 것은?","box":["ㄱ. 단위는 양의 크기를 나타내고 견주는 기준이다.","ㄴ. 같은 양을 사람마다 다른 단위로 쓰면 헷갈린다.","ㄷ. 1 km는 100 m이다."],"opts":["ㄱ","ㄷ","ㄱ, ㄴ","ㄴ, ㄷ","ㄱ, ㄴ, ㄷ"],"a":2,"why":"k는 1000배 → 1 km = <b>1000 m</b>."},
    {"q":"노트북 제품 정보의 값과 기본량을 바르게 짝 지은 것은?","opts":["2 A — 질량","약 1.6 kg — 길이","35.8 cm — 길이","43 ℃ — 전류","10시간 20분 — 온도"],"a":2,"why":"A는 전류, kg은 질량, cm는 길이, ℃는 온도, 시간·분은 시간."},
    {"q":"단위의 크기를 바르게 나타낸 것은?","opts":["1 t = 1000 kg","1 km = 100 m","1 kg = 100 g","1 m = 10 cm","1 nm = 1000 m"],"a":0,"why":"1 km = 1000 m, 1 kg = 1000 g, 1 m = 100 cm, 1 nm = 10억분의 1 m."},
  ]));
  part('sum2', (root) => window.RxT.sum(root));
  part('check2', (root) => { window.LessonParts.mountWrap(root); });
  part('three', (r) => window.Xp.mount(r, 'three'));
  part('kelvin', (r) => window.Xp.mount(r, 'kelvin'));
})();
