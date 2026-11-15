/* 3-2-1 3차시 «지구 주위의 운동»(교과서 130~131쪽 + 참고서 161~164쪽): 장마다 조각을 붙인다.
   차례(9장): 표지(우주 정거장, 사건 파일 18) → 이론(지구 주위의 원운동) → 체험(3D 뉴턴의 대포) → 체험(줄에 매단 공 돌리기)
   → 체험(달에서 뛰어 보자, 해 보기 131쪽) → 미니 게임 → 문제로 다지기 → 정리 → 확인. 수평으로 던진 물체는 2차시(lesson5)로 옮겼다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const J = (m, root) => window.EthTrack.join(m, window.L1.frame(root));
  part('cover', (root) => {
    const st = window.Station.mount(root), fr = window.L1.frame(root), btns = [...root.querySelectorAll('.share-opts button')];
    btns.forEach((b) => b.addEventListener('click', () => { const on = b.getAttribute('aria-pressed') !== 'true'; btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b))); }));
    const answer = (on) => root.querySelector('#pr-b').classList.toggle('answer', on);
    return { fit: st.fit, setActive(on) { st.setActive(on); fr.setActive(on); }, fragment(f, on) { if (f.dataset.anim === 'st') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="st"]'); answer(!!f && f.classList.contains('visible')); } };
  });
  part('orbtheory', (root) => window.RxT.stepper(root));
  part('cannon', (root) => J(window.Cannon.mount(root), root));
  part('sling', (root) => J(window.Sling.mount(root), root));
  part('moon', (root) => J(window.MoonJump.mount(root), root));
  part('dropride', (root) => window.Labs.mount(root, 'fall'));
  part('game2', (root) => window.EthGame.mount(root, {
    id: 'motion', title: '40초 무슨 운동일까?', seconds: 40,
    intro: '속력이 바뀌나, 방향이 바뀌나?<br>«게임 시작»을 누르자',
    endSay: '그대로면 등속 직선 · 빠르기가 바뀌면 속력 변화 · 같은 빠르기로 돌면 방향만 변화',
    items: [
      { q: '마찰 없는 얼음 위를 미끄러지는 퍽', a: 'uni', why: '힘이 없어 같은 빠르기로 곧게.' },
      { q: '수평으로 던진 공의 수평 방향 움직임만 볼 때', a: 'uni', why: '수평으로는 힘이 없어 등속.' },
      { q: '일정한 빠르기로 곧게 나는 비행기', a: 'uni', why: '빠르기·방향 그대로.' },
      { q: '곧은 레일을 같은 빠르기로 달리는 열차', a: 'uni', why: '속도가 변하지 않는다.' },
      { q: '천천히 같은 빠르기로 곧게 내려오는 낙하산(공기 저항과 중력이 맞섬)', a: 'uni', why: '빠르기가 일정하게 유지된다.' },
      { q: '절벽에서 가만히 놓은 돌', a: 'spd', why: '아래로 점점 빨라진다.' },
      { q: '수평으로 던진 공의 연직 방향 움직임만 볼 때', a: 'spd', why: '중력으로 점점 빨라진다.' },
      { q: '산꼭대기에서 수평으로 던져 휘며 떨어지는 공', a: 'spd', why: '떨어지며 빨라진다(방향도 휜다).' },
      { q: '위로 던져 올라가는 공', a: 'spd', why: '올라가며 느려진다.' },
      { q: '달 표면에서 떨어뜨린 망치', a: 'spd', why: '천천히지만 점점 빨라진다.' },
      { q: '브레이크를 밟아 곧게 멈춰 가는 자전거', a: 'spd', why: '빠르기가 줄어든다.' },
      { q: '지구를 같은 빠르기로 도는 인공위성', a: 'dir', why: '빠르기는 같고 방향이 계속 바뀐다.' },
      { q: '지구 둘레를 공전하는 달(원으로 볼 때)', a: 'dir', why: '지구 중심 쪽으로 계속 방향이 꺾인다.' },
      { q: '같은 빠르기로 도는 회전목마의 말', a: 'dir', why: '원을 따라 방향만 바뀐다.' },
      { q: '줄에 매달아 같은 빠르기로 돌리는 공', a: 'dir', why: '줄이 중심 쪽으로 당겨 방향을 바꾼다.' },
      { q: '국제 우주 정거장', a: 'dir', why: '지구 중심 쪽으로 떨어지며 옆으로 비켜 돈다.' },
      { q: '천리안 같은 정지 궤도 위성', a: 'dir', why: '지구와 함께 돌며 방향이 바뀐다.' },
      { q: '같은 빠르기로 도는 대관람차의 칸', a: 'dir', why: '원을 따라 방향이 바뀐다.' },
    ],
  }));
  part('drill2', (root) => window.Drill.mount(root, [
    { q: '물체는 1초에 약 5 m 떨어지고, 둥근 지표는 옆으로 약 8 km 갈 때 약 5 m 낮아진다. 땅에 닿지 않고 지구를 돌려면 수평 속력은 약 얼마여야 하나?(공기 저항 무시)', opts: ['약 5 m/s', '약 8 m/s', '약 5 km/s', '약 8 km/s', '약 80 km/s'], a: 3, why: '1초 동안 8 km를 옆으로 가면 떨어진 5 m만큼 지면도 낮아져 높이가 그대로 — <b>약 8 km/s</b>.' },
    { q: '뉴턴의 사고 실험에 대한 설명으로 옳은 것만 고른 것은?', box: ['ㄱ. 높은 산에서 수평으로 더 빠르게 던질수록 더 멀리 떨어진다.', 'ㄴ. 지구가 둥글어서 충분히 빠르면 땅에 닿지 않고 지구를 돈다.', 'ㄷ. 지구를 도는 포탄은 중력을 받지 않는다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '도는 동안에도 <b>중력</b>이 지구 중심 쪽으로 당긴다(ㄷ ×).' },
    { q: '지구 둘레를 같은 빠르기로 원운동하는 인공위성으로 옳은 것은?', opts: ['속도가 일정하므로 가속도가 0이다.', '중력이 없어서 떨어지지 않는다.', '가속도의 방향은 지구 중심 쪽이다.', '가속도의 방향은 운동 방향과 같다.', '빠르기가 계속 커진다.'], a: 2, why: '방향이 바뀌는 가속도 운동, 가속도 = <b>지구 중심 방향</b>(중력 방향).' },
    { q: '줄에 매달아 원을 그리며 돌리던 공의 줄이 끊어지면 공은 어디로 가는가?(위에서 본 모습)', opts: ['원의 중심 쪽', '원의 바깥쪽으로 곧장', '끊긴 순간 운동하던 방향으로 곧게', '그 자리에 멈춘다', '계속 원을 그린다'], a: 2, why: '당기던 힘이 사라지니 그 순간의 <b>운동 방향</b>(접선)으로 간다.' },
    { q: '달 표면에서 일어나는 운동으로 옳은 것은?(달의 중력은 지구의 약 1/6)', opts: ['물체가 떨어지지 않고 떠 있다.', '같은 높이에서 놓으면 지구보다 느리게 떨어진다.', '물체의 질량이 1/6로 줄어든다.', '깃털이 망치보다 늦게 떨어진다.', '수평으로 던진 공이 지구보다 가까이 떨어진다.'], a: 1, why: '가속도가 작아 <b>천천히</b> 떨어지고, 같은 속력이면 더 멀리 간다.' },
    { q: '나무에서 떨어지는 사과와 지구 둘레를 도는 달의 운동에서 같은 점은?', opts: ['둘 다 빠르기가 변하지 않는다.', '둘 다 지구의 중력을 받아 일어나는 운동이다.', '둘 다 힘을 받지 않는다.', '둘 다 곧은 길을 따라 움직인다.', '둘 다 지구 중심에서 멀어진다.'], a: 1, why: '뉴턴은 떨어지는 운동과 지구를 도는 운동을 모두 <b>중력</b>에 의한 운동으로 설명했다.' },
  ]));
  part('sum2', (root) => window.RxT.sum(root));
  part('check2', (root) => { window.LessonParts.mountWrap(root); });
})();
