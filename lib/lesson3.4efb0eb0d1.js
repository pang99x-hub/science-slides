/* 1-1-1 2차시 «시간과 길이 측정의 발전»(교과서 16쪽): 장마다 조각을 붙인다.
   소단원 차시 늘리기(2026-11-13)로 옛 1차시 틀에서 장을 나눠 실었다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  const { track, join } = window.EthTrack;

  part('cover', (root) => {
    const m = window.Cov.mount(root, 'clock');
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector('#pr-el').classList.toggle('answer', on);
    return { fit: m.fit, setActive: m.setActive, fragment(f, on) { if (f.dataset.anim === 'au') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="au"]'); answer(!!f && f.classList.contains('visible')); } };
  });

  part('devel', (root) => {
    const st = window.RxT.stepper(root);
    const rows = [...root.querySelectorAll('.dv-row')];
    root.addEventListener('st-step', (e) => rows.forEach((r) => r.classList.toggle('on', r.dataset.k === (e.detail < 3 ? 't' : 'l'))));
    rows[0].classList.add('on');
    return st;
  });

  part('sundial', (root) => window.Sundial.mount(root));

  part('laser', (root) => window.Laser.mount(root));

  part('tools', window.EthTrack.theory);

  part('range', (root) => window.RangeBar.mount(root));
  part('drill3', (root) => window.Drill.mount(root, [
    {"q":"시간을 재는 도구가 발전한 차례로 옳은 것은?","opts":["세슘 원자시계 → 괘종시계 → 앙부일구","괘종시계 → 앙부일구 → 세슘 원자시계","앙부일구 → 괘종시계 → 세슘 원자시계","앙부일구 → 세슘 원자시계 → 괘종시계","괘종시계 → 세슘 원자시계 → 앙부일구"],"a":2,"why":"해 그림자 → 추의 흔들림 → 원자의 빛. 세는 것이 점점 고르고 빨라졌다."},
    {"q":"앙부일구로 시각을 알 수 있는 까닭은?","opts":["달의 모양이 날마다 달라져서","해의 위치에 따라 그림자가 달라져서","물이 일정하게 떨어져서","추가 일정하게 흔들려서","빛이 왕복하는 시간이 달라져서"],"a":1,"why":"앙부일구는 조선 시대의 <b>해시계</b>. 그림자의 자리로 시각을 읽는다."},
    {"q":"레이저 길이 측정기에 대해 옳은 것만 고른 것은?","box":["ㄱ. 빛이 왕복한 시간을 이용한다.","ㄴ. 시간을 정밀하게 잴수록 길이도 정밀하게 안다.","ㄷ. 손이 닿는 가까운 거리만 잴 수 있다."],"opts":["ㄱ","ㄷ","ㄱ, ㄴ","ㄴ, ㄷ","ㄱ, ㄴ, ㄷ"],"a":2,"why":"빛을 쓰면 달처럼 <b>아주 먼 곳</b>까지의 거리도 잰다."},
    {"q":"최근의 세슘 원자시계는 얼마나 정밀할까?","opts":["하루에 1초쯤 어긋난다","한 해에 1초쯤 어긋난다","100년에 1초쯤 어긋난다","3000만 년에 1초쯤 어긋난다","조금도 어긋나지 않는다"],"a":3,"why":"교과서 16쪽: <b>3000만 년</b>이 지나야 1초의 오차."},
    {"q":"측정할 수 있는 규모가 넓어진 결과로 옳은 것만 고른 것은?","box":["ㄱ. 세포·분자처럼 작은 규모를 재면서 의학·반도체 분야가 발전했다.","ㄴ. 태양계·은하처럼 큰 규모를 재면서 항공 우주 분야가 발전했다.","ㄷ. 사람이 경험할 수 있는 자연 세계는 달라지지 않았다."],"opts":["ㄱ","ㄴ","ㄷ","ㄱ, ㄴ","ㄱ, ㄴ, ㄷ"],"a":3,"why":"재는 범위가 넓어지며 경험할 수 있는 자연 세계도 <b>크게 넓어졌다</b>."},
  ]));
  part('sum3', (root) => window.RxT.sum(root));
  part('check3', (root) => { window.LessonParts.mountWrap(root); });
  part('pend', (r) => window.Xp.mount(r, 'pend'));
})();
