/* 3-2-1 2차시 «수평으로 던진 물체»(교과서 126~129쪽): 옛 2차시에서 수평으로 던진 물체 부분을 떼어 낸 차시.
   차례(7장): 표지(놓은 공과 옆으로 친 공) → 이론 → 체험(동시 낙하 장치) → 체험(세게 던지면?) → 문제로 다지기 → 정리 → 확인. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const J = (m, root) => window.EthTrack.join(m, window.L1.frame(root));
  part('cover', (root) => {
    const m = window.Cov.mount(root, 'drop'), fr = window.L1.frame(root), btns = [...root.querySelectorAll('.share-opts button')];
    btns.forEach((b) => b.addEventListener('click', () => { const on = b.getAttribute('aria-pressed') !== 'true'; btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b))); }));
    const answer = (on) => root.querySelector('#pr-c').classList.toggle('answer', on);
    return { fit: m.fit, setActive(on) { m.setActive(on); fr.setActive(on); }, fragment(f, on) { if (f.dataset.anim === 'au') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="au"]'); answer(!!f && f.classList.contains('visible')); } };
  });
  part('pjtheory', (root) => window.RxT.stepper(root));
  part('launcher', (root) => J(window.Launcher.mount(root), root));
  part('throw', (root) => J(window.Throw.mount(root), root));
  part('pjstrobe', (root) => window.Labs.mount(root, 'strobe'));
  part('pjheight', (root) => window.Labs.mount(root, 'height'));
  part('pjdrop', (root) => window.Labs.mount(root, 'airdrop'));
  part('drill5', (root) => window.Drill.mount(root, [
    { q: '수평으로 던진 공의 수평 방향 운동을 나타낸 그래프로 옳은 것만 고른 것은?(공기 저항 무시)', box: ['ㄱ. 속도–시간 그래프: 시간 축과 나란한 직선', 'ㄴ. 가속도–시간 그래프: 값이 0인 직선', 'ㄷ. 위치–시간 그래프: 점점 가팔라지는 곡선'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '수평으로는 힘이 없는 <b>등속 직선 운동</b> — 위치–시간은 곧은 비탈 직선이다(ㄷ ×).' },
    { q: '같은 높이에서 공 A는 가만히 놓고, 공 B는 동시에 수평으로 던졌다. 옳은 것은?', opts: ['A가 먼저 바닥에 닿는다.', 'B가 먼저 바닥에 닿는다.', '두 공은 동시에 바닥에 닿는다.', '질량이 큰 공이 먼저 닿는다.', 'B의 가속도가 A보다 크다.'], a: 2, why: '연직 운동이 똑같아 <b>동시에</b> 닿는다.' },
    { q: '같은 높이에서 공 세 개를 수평으로 각각 2 m/s, 4 m/s, 6 m/s로 동시에 던졌다. 옳은 것은?', opts: ['6 m/s로 던진 공이 가장 늦게 닿는다.', '세 공이 동시에 닿고, 6 m/s 공이 가장 멀리 간다.', '세 공이 같은 곳에 떨어진다.', '2 m/s 공이 가장 먼저 닿는다.', '빠를수록 연직 방향 가속도가 크다.'], a: 1, why: '착지 시간은 같고 수평 거리는 <b>던진 속력에 비례</b>한다.' },
    { q: '중력 가속도가 지구의 2배인 곳에서 같은 높이·같은 속력으로 공을 수평으로 던지면?', opts: ['더 오래 날아 더 멀리 간다.', '더 빨리 바닥에 닿아 수평 거리가 짧아진다.', '지구와 똑같이 움직인다.', '수평 방향 속력이 2배가 된다.', '바닥에 닿지 않는다.'], a: 1, why: '더 빨리 떨어지므로 날아가는 시간이 줄어 <b>덜 멀리</b> 간다.' },
    { q: '수평으로 던진 공이 그리는 길에 대한 설명으로 옳은 것만 고른 것은?(공기 저항 무시)', box: ['ㄱ. 같은 시간 동안 수평으로 간 거리는 늘 같다.', 'ㄴ. 같은 시간 동안 연직으로 떨어진 거리는 점점 커진다.', 'ㄷ. 공에 작용하는 힘의 방향은 공이 움직이는 방향과 늘 같다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '힘(중력)은 늘 <b>연직 아래</b>를 향한다. 공이 움직이는 방향은 계속 휜다(ㄷ ×).' },
    { q: '수평으로 던진 공이 손을 떠나 날아가는 동안 공에 작용하는 힘은?(공기 저항 무시)', opts: ['던진 방향으로 미는 힘과 중력', '중력뿐', '아무 힘도 작용하지 않는다', '던진 방향으로 미는 힘뿐', '위로 떠받치는 힘과 중력'], a: 1, why: '손을 떠난 뒤에는 <b>중력</b>만 작용한다. 옆으로는 힘이 없어 같은 빠르기로 간다.' },
  ]));
  part('sum5', (root) => window.RxT.sum(root));
  part('check5', (root) => { window.LessonParts.mountWrap(root); });
})();
