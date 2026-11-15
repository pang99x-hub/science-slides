/* 3-2-1 1차시 «중력과 자유 낙하»(교과서 122~125쪽 + 참고서 159~162쪽): 장마다 조각을 붙인다.
   차례(12장): 표지(망치와 깃털, 사건 파일 17) → 이론(중력과 무게) → 체험(어디서나 아래는 지구 중심) → 이론(속도와 가속도)
   → 체험(가속 페달과 브레이크) → 이론(자유 낙하와 중력 가속도) → 체험(낙하 사진 분석, 해 보기 125쪽) → 체험(무거운 것이 먼저?)
   → 미니 게임 → 문제로 다지기 → 정리 → 확인. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const J = (m, root) => window.EthTrack.join(m, window.L1.frame(root));
  part('cover', (root) => {
    const fh = window.Feather.mount(root), fr = window.L1.frame(root), btns = [...root.querySelectorAll('.share-opts button')];
    btns.forEach((b) => b.addEventListener('click', () => { const on = b.getAttribute('aria-pressed') !== 'true'; btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b))); }));
    const answer = (on) => root.querySelector('#pr-b').classList.toggle('answer', on);
    return { fit: fh.fit, setActive(on) { fh.setActive(on); fr.setActive(on); }, fragment(f, on) { if (f.dataset.anim === 'fh') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="fh"]'); answer(!!f && f.classList.contains('visible')); } };
  });
  part('grtheory', (root) => window.RxT.stepper(root));
  part('gravity', (root) => J(window.Grav.mount(root), root));
  part('actheory', (root) => window.RxT.stepper(root));
  part('accel', (root) => J(window.Accel.mount(root), root));
  part('fftheory', (root) => window.RxT.stepper(root));
  part('freefall', (root) => J(window.Strobe.mount(root), root));
  part('mass', (root) => window.MassDrop.mount(root));
  part('game1', (root) => window.EthGame.mount(root, {
    id: 'accdir', title: '40초 가속도는 어느 쪽?', seconds: 40,
    intro: '빨라지나, 느려지나, 그대로인가?<br>«게임 시작»을 누르자',
    endSay: '빨라지면 운동 방향 · 느려지면 반대 방향 · 속도가 그대로면 0',
    items: [
      { q: '떨어지는 사과', a: 'same', why: '아래로 가며 점점 빨라진다 — 가속도도 아래(운동 방향).' },
      { q: '출발선에서 막 뛰쳐나가는 단거리 선수', a: 'same', why: '속도가 커지는 중.' },
      { q: '초록불에 출발하는 버스', a: 'same', why: '정지에서 빨라진다.' },
      { q: '비탈을 굴러 내려가며 빨라지는 공', a: 'same', why: '속도가 커지는 쪽이 가속도 방향.' },
      { q: '번지 점프 뒤 줄이 펴지기 전까지 떨어지는 사람', a: 'same', why: '중력으로 점점 빨라진다.' },
      { q: '이륙하려고 활주로를 달리는 비행기', a: 'same', why: '속도가 커지며 앞으로.' },
      { q: '빨간불 앞에서 브레이크를 밟은 자동차', a: 'opp', why: '느려진다 — 가속도는 뒤쪽.' },
      { q: '위로 던져 올라가는 중인 공', a: 'opp', why: '위로 가며 느려진다 — 가속도는 아래(중력 방향).' },
      { q: '결승선을 지나 속도를 줄이는 선수', a: 'opp', why: '느려지는 중.' },
      { q: '착륙해 활주로에서 멈춰 가는 비행기', a: 'opp', why: '속도가 줄어든다.' },
      { q: '얼음판 위에서 점점 느려지는 컬링 돌', a: 'opp', why: '마찰로 느려진다 — 운동 반대 방향.' },
      { q: '비탈을 굴러 올라가며 느려지는 공', a: 'opp', why: '속도가 줄어드는 쪽과 반대가 가속도.' },
      { q: '책상 위에 가만히 놓인 필통', a: 'zero', why: '속도가 계속 0 — 변화량 0.' },
      { q: '고속도로를 같은 빠르기로 곧게 달리는 차', a: 'zero', why: '빠르기·방향 모두 그대로.' },
      { q: '일정한 빠르기로 곧게 움직이는 무빙워크 위 가방', a: 'zero', why: '속도가 변하지 않는다.' },
      { q: '천장에 매달려 멈춰 있는 전등', a: 'zero', why: '정지 상태가 그대로.' },
      { q: '같은 빠르기로 곧게 올라가는 엘리베이터', a: 'zero', why: '방향도 빠르기도 그대로.' },
      { q: '정류장에 서 있는 버스', a: 'zero', why: '속도 0이 그대로 — 가속도 0.' },
    ],
  }));
  part('drill1', (root) => window.Drill.mount(root, [
    { q: '중력에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 질량이 있는 두 물체는 떨어져 있어도 서로 당긴다.', 'ㄴ. 지구가 사과를 당기는 힘과 사과가 지구를 당기는 힘은 크기가 같고 방향이 반대이다.', 'ㄷ. 나뭇가지에 매달려 멈춰 있는 사과는 중력을 받지 않는다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '매달린 사과도 떨어지는 사과도 <b>똑같이 중력을 받는다</b>. 매달린 사과는 꼭지가 위로 붙잡아 줄 뿐이다(ㄷ ×).' },
    { q: '남극에 서 있는 사람이 받는 중력의 방향은?', opts: ['북극 쪽', '하늘 쪽', '지구 중심 쪽', '적도 쪽', '태양 쪽'], a: 2, why: '서 있는 곳이 어디든 중력은 <b>지구 중심</b>을 향한다.' },
    { q: '지구에서 질량이 6 kg인 물체를 달에 가져갔다. 옳은 것은?', opts: ['질량 1 kg, 무게는 그대로', '질량 6 kg, 무게는 약 1/6', '질량 1 kg, 무게도 약 1/6', '질량 6 kg, 무게도 그대로', '질량과 무게 모두 6배'], a: 1, why: '질량은 물질의 양이라 <b>그대로</b>, 무게(중력의 크기)는 약 <b>1/6</b>.' },
    { q: '질량이 5 kg인 물체의 지표면 근처에서의 무게는?(중력 가속도 9.8 m/s²)', opts: ['5 N', '9.8 N', '14.8 N', '49 N', '약 8.2 N'], a: 3, why: '무게 = 질량 × 중력 가속도 = 5 × 9.8 = <b>49 N</b>.' },
    { q: '정지해 있던 자전거가 4초 뒤 8 m/s가 되었다. 가속도의 크기는?', opts: ['0.5 m/s²', '2 m/s²', '4 m/s²', '12 m/s²', '32 m/s²'], a: 1, why: '(8 − 0) ÷ 4 = <b>2 m/s²</b>.' },
    { q: '20 m/s로 달리던 차가 브레이크를 밟아 5초 만에 멈췄다. 옳은 것은?', opts: ['가속도 4 m/s², 운동 방향과 같다', '가속도 4 m/s², 운동 방향과 반대', '가속도 100 m/s², 운동 방향과 반대', '가속도 0', '가속도 20 m/s², 운동 방향과 같다'], a: 1, why: '(0 − 20) ÷ 5 → 크기 <b>4 m/s²</b>, 느려지니 <b>반대 방향</b>.' },
    { q: '가만히 놓은 공이 자유 낙하 한다. 3초 뒤 속력은?(공기 저항 무시)', opts: ['3 m/s', '9.8 m/s', '19.6 m/s', '29.4 m/s', '39.2 m/s'], a: 3, why: '1초마다 9.8 m/s씩 → 9.8 × 3 = <b>29.4 m/s</b>.' },
    { q: '같은 높이에서 볼링공과 탁구공을 진공 속에서 동시에 놓았다. 옳은 것만 고른 것은?', box: ['ㄱ. 볼링공이 받는 중력이 더 크다.', 'ㄴ. 두 공의 가속도는 같다.', 'ㄷ. 볼링공이 먼저 바닥에 닿는다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '중력은 다르지만 가속도가 같아 <b>동시에</b> 닿는다(ㄷ ×).' },
    { q: '자유 낙하 운동을 나타낸 그래프로 옳은 것만 고른 것은?', box: ['ㄱ. 속도–시간 그래프: 원점을 지나는 비스듬한 직선', 'ㄴ. 가속도–시간 그래프: 시간 축과 나란한 직선(0이 아닌 값)', 'ㄷ. 위치(떨어진 거리)–시간 그래프: 기울기가 일정한 직선'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '등가속도 운동이라 떨어진 거리는 <b>점점 가파르게</b> 늘어나는 곡선이다(ㄷ ×).' },
  ]));
  part('sum1', (root) => window.RxT.sum(root));
  part('check1', (root) => { window.LessonParts.mountWrap(root); });
})();
