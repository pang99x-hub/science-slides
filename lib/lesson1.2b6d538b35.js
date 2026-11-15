/* 1-2-1 1차시 «측정과 측정 표준»(교과서 28~29쪽): 장마다 조각을 붙인다.
   소단원 차시 늘리기(2026-11-13)로 옛 1차시 틀에서 장을 나눠 실었다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));

  part('cover', (root) => {
    window.Yuchuk.mount(root);
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector('#pr-cmp').classList.toggle('answer', on);
    return { fragment(f, on) { if (f.dataset.anim === 'yc') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="yc"]'); answer(!!f && f.classList.contains('visible')); } };
  });

  part('meas', (root) => window.Gauge.mount(root));

  part('guess', (root) => window.Guess.mount(root));

  part('stdef', (root) => window.RxT.stepper(root));

  part('proto', (root) => window.Proto3D.mount(root));
  part('drill1', (root) => window.Drill.mount(root, [
    {"q":"측정에 해당하는 것은?","opts":["손으로 이마를 짚어 열을 가늠한다","친구와 등을 맞대어 키를 견준다","체온계로 체온을 잰다","손뼘으로 책상 길이를 대충 헤아린다","눈대중으로 물의 양을 짐작한다"],"a":2,"why":"<b>도구</b>로 재어 수치와 단위로 나타내야 측정. 나머지는 어림이다."},
    {"q":"측정 표준에 대해 옳은 것만 고른 것은?","box":["ㄱ. 측정의 기준이 되는 기본 단위의 정의이다.","ㄴ. 그 값을 확인하도록 만든 장치도 측정 표준에 든다.","ㄷ. 국제적으로 같은 단위를 쓰는 것은 측정 표준과 관계없다."],"opts":["ㄱ","ㄷ","ㄱ, ㄴ","ㄴ, ㄷ","ㄱ, ㄴ, ㄷ"],"a":2,"why":"기본량마다 국제 공통 단위를 쓰는 것도 <b>측정 표준</b>이다."},
    {"q":"1 m를 정하는 기준이 바뀌어 온 차례로 옳은 것은?","opts":["미터원기 → 지구의 크기 → 빛","지구의 크기 → 미터원기 → 빛","빛 → 미터원기 → 지구의 크기","지구의 크기 → 빛 → 미터원기","미터원기 → 빛 → 지구의 크기"],"a":1,"why":"북극~적도 거리의 1000만분의 1 → 금속 미터원기 → 1983년 빛."},
    {"q":"미터 협약에 대한 설명으로 옳은 것은?","opts":["1983년에 빛으로 1 m를 정한 약속이다","1 kg을 플랑크 상수로 정한 조약이다","우리나라의 표준시를 정한 조약이다","1875년 17개 나라가 도량형을 통일하려고 맺은 조약이다","미터원기를 더는 쓰지 않기로 한 조약이다"],"a":3,"why":"미터 협약으로 <b>미터원기</b>를 측정 표준으로 함께 쓰게 되었다."},
    {"q":"오늘날 1 kg을 정하는 데 쓰는 것은?","opts":["킬로그램 원기","미터원기","지구의 크기","세슘 원자시계","플랑크 상수"],"a":4,"why":"빛의 에너지와 관련된 <b>플랑크 상수</b>를 이용한 값으로 정한다."},
  ]));
  part('sum1', (root) => window.RxT.sum(root));
  part('check1', (root) => { window.LessonParts.mountWrap(root); });
  part('avg', (r) => window.Xp.mount(r, 'avg'));
  part('hands', (r) => window.Xp.mount(r, 'hands'));
})();
