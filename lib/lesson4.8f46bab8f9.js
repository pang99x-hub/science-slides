/* 1-1-2 2차시 «기본량의 조합과 세계 시각»(교과서 21~25쪽): 장마다 조각을 붙인다.
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
    const m = window.Cov.mount(root, 'run');
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector('#pr-el').classList.toggle('answer', on);
    return { fit: m.fit, setActive: m.setActive, fragment(f, on) { if (f.dataset.anim === 'au') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="au"]'); answer(!!f && f.classList.contains('visible')); } };
  });

  part('derived', (root) => {
    const st = window.RxT.stepper(root);
    const rows = [...root.querySelectorAll('.dv-tab tr')];
    const on = (k) => rows.forEach((r) => r.classList.toggle('on', +r.dataset.k === k));
    root.addEventListener('st-step', (e) => on(e.detail)); on(0);
    return st;
  });

  part('bag', (root) => window.Bag3D.mount(root));

  part('pitch', (root) => window.Pitch.mount(root));

  part('world', (root) => join(window.WorldTime.mount(root), window.L1.frame(root)));
  part('drill4', (root) => window.Drill.mount(root, [
    {"q":"물체의 부피를 나타낼 때 쓰는 기본량은?","opts":["시간","길이","질량","전류","온도"],"a":1,"why":"부피는 공간에서 차지하는 크기 → <b>길이</b> 셋을 곱한다."},
    {"q":"속력의 단위로 알맞은 것은?","opts":["kg","cm³","%","m/s","mAh"],"a":3,"why":"속력 = 이동한 거리 ÷ 걸린 시간 → m/s, km/h."},
    {"q":"기본량의 조합에 대해 옳은 것만 고른 것은?","box":["ㄱ. 속력은 길이와 시간을 함께 써서 나타낸다.","ㄴ. 퍼센트 농도는 질량을 이용해 나타낸다.","ㄷ. 배터리 용량 mAh는 전류와 시간을 곱한 단위이다."],"opts":["ㄱ","ㄴ","ㄱ, ㄷ","ㄱ, ㄴ, ㄷ","ㄴ, ㄷ"],"a":3,"why":"셋 다 옳다. 주요 개념은 <b>기본량의 조합</b>으로 설명한다."},
    {"q":"세계 시각의 기준에 대한 설명으로 옳지 않은 것은?","opts":["기준선은 그리니치 천문대를 지나는 본초 자오선이다","1884년 국제 협약으로 정했다","본초 자오선을 기준으로 동경과 서경을 나눈다","그 전에는 나라마다 제 기준으로 시각을 정했다","프랑스의 주장대로 파리 천문대가 기준이 되었다"],"a":4,"why":"프랑스가 파리를 주장했지만 혼란을 걱정한 반대로 <b>그리니치</b>를 계속 썼다."},
    {"q":"새로 생겨난 단위에 대해 옳은 것은?","opts":["bit는 길이의 기본 단위이다","bps는 데이터가 이동하는 빠르기를 나타낸다","bps는 질량의 단위이다","bit는 온도를 나타낸다","새로운 단위는 더 생기지 않는다"],"a":1,"why":"bit는 데이터를 저장·처리하는 기본 단위, bps는 데이터가 이동하는 속력의 단위(교과서 25쪽)."},
  ]));
  part('sum4', (root) => window.RxT.sum(root));
  part('check4', (root) => { window.LessonParts.mountWrap(root); });
  part('battery', (r) => window.Xp.mount(r, 'battery'));
  part('sugar', (r) => window.Xp.mount(r, 'sugar'));
})();
