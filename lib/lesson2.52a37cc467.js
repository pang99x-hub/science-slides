/* 1-2-2 1차시 «신호와 센서»(교과서 32~33쪽): 장마다 조각을 붙인다.
   소단원 차시 늘리기(2026-11-13)로 옛 2차시 틀에서 장을 나눠 실었다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));

  part('cover', (root) => {
    const m = window.Pulse.mount(root);
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector('#pr-light').classList.toggle('answer', on);
    return { setActive: m.setActive, fit: m.fit, fragment(f, on) { if (f.dataset.anim === 'pu') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="pu"]'); answer(!!f && f.classList.contains('visible')); } };
  });

  part('signal', window.EthTrack.theory);

  part('quake', (root) => window.Quake.mount(root));

  part('digit', (root) => window.RxT.stepper(root));

  part('phone', (root) => window.Phone3D.mount(root));

  part('game2', (root) => window.EthGame.mount(root, {
    id: 'sensor', title: '40초 어떤 센서일까', seconds: 40,
    intro: '장면 속 센서가 받는 신호는?<br>«게임 시작»을 누르자',
    endSay: '무엇을 알아채는지 물어보자: 빛? 뜨거움? 누름? 움직임?',
    items: [
      { q: '어두워지면 저절로 켜지는 가로등', a: 'light', why: '주변 밝기를 알아챈다 → 빛 센서.' },
      { q: '계산대에서 바코드를 읽는 스캐너', a: 'light', why: '되돌아온 빛의 무늬를 읽는다 → 빛 센서.' },
      { q: '스마트워치로 심박수 재기', a: 'light', why: '되돌아온 빛의 변화 → 빛 센서.' },
      { q: '이마에 대지 않고 체온을 재는 온도계', a: 'light', why: '몸에서 나오는 적외선(빛)을 받는다 → 빛 센서.' },
      { q: '에어컨이 방 온도를 26 °C로 맞춘다', a: 'temp', why: '방의 온도 → 온도 센서.' },
      { q: '밥이 다 되면 보온으로 바뀌는 전기밥솥', a: 'temp', why: '솥의 온도 변화 → 온도 센서.' },
      { q: '냉장고 안을 늘 차갑게 유지', a: 'temp', why: '안쪽 온도를 재어 냉각을 조절 → 온도 센서.' },
      { q: '불이 나 뜨거워지면 울리는 감지기', a: 'temp', why: '갑자기 오른 온도 → 온도 센서.' },
      { q: '스마트폰 화면을 손가락으로 누르기', a: 'press', why: '손가락이 닿은 곳을 알아챈다 → 터치 센서.' },
      { q: '사람이 너무 많이 타면 울리는 엘리베이터', a: 'press', why: '바닥을 누르는 무게 → 압력 센서.' },
      { q: '자동차 좌석에 앉으면 켜지는 안전띠 알림', a: 'press', why: '좌석을 누르는 힘 → 압력 센서.' },
      { q: '전자저울에 사과 올리기', a: 'press', why: '누르는 힘을 질량으로 → 압력(힘) 센서.' },
      { q: '폰을 눕히면 화면이 가로로 돈다', a: 'acc', why: '기울기 → 가속도 센서.' },
      { q: '걸음 수를 세는 앱', a: 'acc', why: '몸이 흔들리는 움직임 → 가속도 센서.' },
      { q: '폰을 기울여 게임 속 자동차 운전', a: 'acc', why: '기울어진 방향 → 가속도 센서.' },
      { q: '부딪히는 순간 터지는 자동차 에어백', a: 'acc', why: '갑자기 멈추는 움직임 → 가속도 센서.' },
    ],
  }));
  part('drill2', (root) => window.Drill.mount(root, [
    {"q":"신호에 대해 옳은 것만 고른 것은?","box":["ㄱ. 자연계의 변화가 우리에게 전달된 것이 신호이다.","ㄴ. 자연계의 신호는 대부분 연속적으로 변하는 아날로그 형태이다.","ㄷ. 신호를 재어 분석해도 쓸모 있는 정보는 얻을 수 없다."],"opts":["ㄱ","ㄷ","ㄱ, ㄴ","ㄴ, ㄷ","ㄱ, ㄴ, ㄷ"],"a":2,"why":"신호를 측정·분석하면 <b>정보</b>를 얻는다(체온 → 건강 상태)."},
    {"q":"센서가 하는 일로 옳은 것은?","opts":["전기 신호를 자연계의 신호로 바꾼다","자연계의 신호를 받아 전기 신호로 바꾼다","정보를 지워 없앤다","신호를 연속적인 값으로만 나타낸다","디지털 정보를 아날로그로 바꾼다"],"a":1,"why":"센서 = 자연계의 신호 → <b>전기 신호</b>."},
    {"q":"신호와 그 신호를 분석해 얻는 정보를 바르게 짝 지은 것은?","opts":["피부 온도 — 우주의 생성 과정","우주에서 온 빛 — 체온이 높은 사람","지진파 — 심박수","지진파 — 지진이 일어난 위치","햇빛의 세기 — 지진이 일어난 위치"],"a":3,"why":"피부 온도 → 체온 높은 사람, 우주에서 온 빛 → 우주의 생성 과정."},
    {"q":"자동차의 속력과 속력계에 대해 옳은 것만 고른 것은?","box":["ㄱ. 달리는 자동차의 속력은 연속적으로 변한다.","ㄴ. 센서가 있는 속력계는 속력을 디지털 형태로 잰다.","ㄷ. 디지털은 최소 단위가 있는 끊긴 값으로 나타내는 것이다."],"opts":["ㄱ","ㄴ","ㄱ, ㄷ","ㄴ, ㄷ","ㄱ, ㄴ, ㄷ"],"a":4,"why":"셋 다 옳다."},
    {"q":"어두워지면 저절로 켜지는 가로등에 쓰이는 센서는?","opts":["빛 센서","온도 센서","습도 센서","압력 센서","가속도 센서"],"a":0,"why":"주변의 밝기(빛의 세기)를 알아챈다."},
  ]));
  part('sum2', (root) => window.RxT.sum(root));
  part('check2', (root) => { window.LessonParts.mountWrap(root); });
  part('light', (r) => window.Xp.mount(r, 'light'));
})();
