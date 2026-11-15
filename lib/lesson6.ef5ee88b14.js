/* 3-2-2 2차시 «운동량과 충격량»(교과서 133~134쪽): 옛 1차시에서 운동량·충격량 부분을 떼어 낸 차시.
   차례(9장): 표지(볼링공과 탁구공) → 이론(운동량) → 체험(무엇이 더 멈추기 어려울까?) → 이론(충격량) → 체험(공을 멀리 보내려면)
   → 미니 게임 → 문제로 다지기 → 정리 → 확인. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const J = (m, root) => window.EthTrack.join(m, window.L1.frame(root));
  part('cover', (root) => {
    const m = window.Cov.mount(root, 'push'), fr = window.L1.frame(root), btns = [...root.querySelectorAll('.share-opts button')];
    btns.forEach((b) => b.addEventListener('click', () => { const on = b.getAttribute('aria-pressed') !== 'true'; btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b))); }));
    const answer = (on) => root.querySelector('#pr-a').classList.toggle('answer', on);
    return { fit: m.fit, setActive(on) { m.setActive(on); fr.setActive(on); }, fragment(f, on) { if (f.dataset.anim === 'au') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="au"]'); answer(!!f && f.classList.contains('visible')); } };
  });
  part('mmtheory', (root) => window.RxT.stepper(root));
  part('momentum', (root) => J(window.Bowling.mount(root), root));
  part('imtheory', (root) => window.RxT.stepper(root));
  part('impulse', (root) => J(window.Impulse.mount(root), root));
  part('ftarea', (root) => window.Labs.mount(root, 'kick'));
  part('game3', (root) => window.EthGame.mount(root, {
    id: 'inertia', title: '40초 관성일까, 충격량일까?', seconds: 40,
    intro: '그대로 있으려나, 계속 가려나?<br>«게임 시작»을 누르자',
    endSay: '멈춘 것은 멈춘 채로 · 가던 것은 계속 · 멀리 보내려면 큰 힘을 오래',
    items: [
      { q: '버스가 갑자기 출발하자 몸이 뒤로 쏠린다', a: 'rest', why: '몸은 제자리에 있으려 한다.' },
      { q: '컵 위 카드를 튕기자 동전이 컵 속으로 떨어진다', a: 'rest', why: '동전은 제자리에 남으려 한다.' },
      { q: '휴지를 빠르게 잡아당기자 풀리지 않고 끊어진다', a: 'rest', why: '두루마리가 제자리에 있으려 한다.' },
      { q: '깔개를 털자 먼지가 떨어져 나간다', a: 'rest', why: '먼지는 제자리에 남으려 한다.' },
      { q: '식탁보를 재빨리 빼도 접시가 그대로 있다', a: 'rest', why: '접시는 멈춘 채 있으려 한다.' },
      { q: '망치 자루를 바닥에 내리치면 머리가 자루에 더 깊이 박힌다', a: 'move', why: '자루는 멈춰도 머리는 계속 내려가려 한다.' },
      { q: '달리던 버스가 급정거하자 몸이 앞으로 쏠린다', a: 'move', why: '몸은 하던 대로 앞으로 가려 한다.' },
      { q: '페달을 멈춰도 자전거 바퀴는 계속 돈다', a: 'move', why: '돌던 상태를 유지하려 한다.' },
      { q: '피겨 선수가 밀지 않아도 얼음 위를 미끄러져 간다', a: 'move', why: '움직이던 상태를 이어 간다.' },
      { q: '멀리뛰기 선수가 도움닫기를 하고 뛴다', a: 'move', why: '달려온 빠르기를 유지한 채 뛰어오른다.' },
      { q: '급정거한 차에서 안전띠를 매지 않은 사람이 앞으로 튀어 나간다', a: 'move', why: '차는 멈춰도 사람은 계속 나아가려 한다.' },
      { q: '야구 타자가 공을 맞힌 뒤에도 방망이를 끝까지 휘두른다', a: 'imp', why: '공에 힘을 주는 시간이 길어진다.' },
      { q: '골프채를 세게 휘둘러 공을 친다', a: 'imp', why: '힘이 커서 충격량이 커진다.' },
      { q: '포신이 긴 대포가 포탄을 더 멀리 보낸다', a: 'imp', why: '포탄이 힘을 받는 시간이 길다.' },
      { q: '긴 빨대로 분 면봉이 짧은 빨대보다 멀리 난다', a: 'imp', why: '면봉이 바람의 힘을 받는 시간이 길다.' },
      { q: '테니스 선수가 공을 라켓으로 끝까지 밀어 친다', a: 'imp', why: '접촉 시간이 길어 운동량 변화가 크다.' },
      { q: '축구 선수가 공을 발등으로 세게 끝까지 찬다', a: 'imp', why: '큰 힘을 오래 — 충격량이 크다.' },
      { q: '창던지기 선수가 창을 몸 뒤에서부터 길게 밀어 던진다', a: 'imp', why: '힘을 주는 시간이 길어진다.' },
    ],
  }));
  part('drill6', (root) => window.Drill.mount(root, [
    { q: '질량 200 g인 공이 72 km/h로 날아간다. 운동량의 크기는?', opts: ['1.4 kg·m/s', '4 kg·m/s', '14.4 kg·m/s', '40 kg·m/s', '4000 kg·m/s'], a: 1, why: '0.2 kg × 20 m/s(72 km/h) = <b>4 kg·m/s</b>. 단위부터 kg, m/s로 바꾼다.' },
    { q: '마찰 없는 수평면에서 A(1 kg, 정지), B(2 kg, 4 m/s), C(3 kg, 2 m/s)가 있다. 옳은 것만 고른 것은?', box: ['ㄱ. A의 운동량은 0이다.', 'ㄴ. 운동량은 B가 C보다 크다.', 'ㄷ. C를 멈추게 하는 데 필요한 충격량이 가장 크다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: 'B 8, C 6 kg·m/s — 멈추게 하는 충격량은 <b>B가 가장 크다</b>(ㄷ ×).' },
    { q: '고속 열차에 대한 설명으로 옳은 것은?', opts: ['멈춰 있어도 질량이 커서 운동량이 크다.', '달리는 열차는 질량과 속도가 커서 운동량이 크다.', '운동량의 방향은 속도와 반대이다.', '운동량의 단위는 N이다.', '빨라져도 운동량은 그대로다.'], a: 1, why: '멈춘 열차는 속도 0 → <b>운동량 0</b>.' },
    { q: '2 m/s로 움직이던 2 kg 물체가 운동 방향으로 5 N·s의 충격량을 받았다. 나중 운동량의 크기는?', opts: ['3 kg·m/s', '4 kg·m/s', '5 kg·m/s', '9 kg·m/s', '10 kg·m/s'], a: 3, why: '처음 4 + 받은 충격량 5 = <b>9 kg·m/s</b>.' },
    { q: '얼음판에서 2 m/s로 가던 40 kg 선수를 뒤에서 밀었더니 5 m/s가 되었다. 미는 동안 받은 충격량의 크기는?', opts: ['40 N·s', '80 N·s', '120 N·s', '200 N·s', '280 N·s'], a: 2, why: '40 × (5 − 2) = <b>120 N·s</b>.' },
    { q: '20 m/s로 날아온 60 g 테니스공을 쳐서 반대 방향 50 m/s로 보냈다. 공의 운동량 변화량의 크기는?', opts: ['1.2 kg·m/s', '1.8 kg·m/s', '3.0 kg·m/s', '4.2 kg·m/s', '70 kg·m/s'], a: 3, why: '방향이 바뀌므로 0.06 × (50 − (−20)) = <b>4.2 kg·m/s</b>.' },
    { q: '공이 라켓에 0.01초 동안 맞으며 받은 힘을 힘–시간 그래프로 나타냈더니 아래 넓이가 3 N·s였다. 옳은 것만 고른 것은?', box: ['ㄱ. 공이 받은 충격량은 3 N·s이다.', 'ㄴ. 공이 받은 평균 힘은 300 N이다.', 'ㄷ. 라켓이 공에게서 받은 충격량은 0이다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '평균 힘 = 3 ÷ 0.01 = 300 N. 라켓도 <b>같은 크기 반대 방향</b>의 충격량을 받는다(ㄷ ×).' },
  ]));
  part('sum6', (root) => window.RxT.sum(root));
  part('check6', (root) => { window.LessonParts.mountWrap(root); });
})();
