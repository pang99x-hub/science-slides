/* 1-2-2 2차시 «디지털 정보와 현대 문명»(교과서 33~35·39쪽): 장마다 조각을 붙인다.
   소단원 차시 늘리기(2026-11-13)로 옛 2차시 틀에서 장을 나눠 실었다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));

  part('cover', (root) => {
    const m = window.Cov.mount(root, 'bits');
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector('#pr-el').classList.toggle('answer', on);
    return { fit: m.fit, setActive: m.setActive, fragment(f, on) { if (f.dataset.anim === 'au') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="au"]'); answer(!!f && f.classList.contains('visible')); } };
  });

  part('adc', (root) => window.ADC.mount(root));

  part('civ', window.EthTrack.theory);

  part('timer', (root) => window.Timer.mount(root));
  part('drill4', (root) => window.Drill.mount(root, [
    {"q":"디지털 정보의 특징으로 옳은 것만 고른 것은?","box":["ㄱ. 저장하기 쉽다.","ㄴ. 분석하기 쉽다.","ㄷ. 멀리 보내기 어렵다."],"opts":["ㄱ","ㄷ","ㄱ, ㄴ","ㄴ, ㄷ","ㄱ, ㄴ, ㄷ"],"a":2,"why":"<b>전송</b>하기도 쉽다 → 정보 통신에 쓰인다."},
    {"q":"디지털 정보가 아닌 것은?","opts":["스마트 기기로 찍은 사진","컴퓨터로 쓴 문서","스마트 기기로 찍은 영상","낮 동안 이어져 변하는 햇빛의 세기","누리 소통망에 올린 글"],"a":3,"why":"햇빛의 세기는 연속적으로 변하는 <b>아날로그 신호</b>다."},
    {"q":"현대의 정보 통신에 대한 설명으로 옳은 것은?","opts":["인터넷이 널리 퍼져 시간과 공간의 제약 없이 정보를 나눈다","디지털 정보는 쓰지 않는다","가까이 있는 사람끼리만 정보를 나눌 수 있다","정보를 나누는 데 시간이 오래 걸린다","아날로그 신호를 그대로 주고받는다"],"a":0,"why":"디지털 정보는 전송하기 쉬워 빠르게 공유된다."},
    {"q":"디지털 정보를 쓰는 정보 통신의 예로 보기 어려운 것은?","opts":["실시간 원격 교육","인터넷으로 물건 사기","인터넷 은행 거래","멀리서 로봇 조종하기","앙부일구의 그림자로 시각 읽기"],"a":4,"why":"앙부일구는 그림자를 눈으로 읽는다 — 디지털 정보를 주고받지 않는다."},
    {"q":"신호를 디지털로 바꾸는 일에 대해 옳은 것만 고른 것은?","box":["ㄱ. 바꾸는 과정에서 원래 신호의 정보 일부가 빠질 수 있다.","ㄴ. 더 자주, 더 잘게 재면 원래 신호에 가까워진다.","ㄷ. 디지털 정보는 0과 1로 나타낸다."],"opts":["ㄱ","ㄷ","ㄱ, ㄴ","ㄱ, ㄴ, ㄷ","ㄴ, ㄷ"],"a":3,"why":"셋 다 옳다. «디지털로 재기» 체험에서 확인했다."},
  ]));
  part('sum4', (root) => window.RxT.sum(root));
  part('check4', (root) => { window.LessonParts.mountWrap(root); });
  part('pixel', (r) => window.Xp.mount(r, 'pixel'));
  part('copy', (r) => window.Xp.mount(r, 'copy'));
  part('send', (r) => window.Xp.mount(r, 'send'));
})();
