/* 3-2-2 2차시 «충격량과 안전»(교과서 134~141쪽 + 참고서 171~172쪽): 장마다 조각을 붙인다.
   차례(11장): 표지(고속 열차, 사건 파일 20) → 이론(충돌 시간과 힘) → 체험(달걀을 지켜라) → 이론(우리 곁의 안전장치, 사진)
   → 체험(자동차 충돌 시험) → 체험(공 받기와 공 차기) → 체험(안전장치 설계실, 탐구 136~137쪽·창의력 키움 141쪽)
   → 미니 게임 → 문제로 다지기(단원 복습) → 정리(단원 전체) → 확인. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const J = (m, root) => window.EthTrack.join(m, window.L1.frame(root));
  part('cover', (root) => {
    const st = window.Train.mount(root), fr = window.L1.frame(root), btns = [...root.querySelectorAll('.share-opts button')];
    btns.forEach((b) => b.addEventListener('click', () => { const on = b.getAttribute('aria-pressed') !== 'true'; btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b))); }));
    const answer = (on) => root.querySelector('#pr-b').classList.toggle('answer', on);
    return { fit: st.fit, setActive(on) { st.setActive(on); fr.setActive(on); }, fragment(f, on) { if (f.dataset.anim === 'tr') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="tr"]'); answer(!!f && f.classList.contains('visible')); } };
  });
  part('sftheory', (root) => window.RxT.stepper(root));
  part('egg', (root) => J(window.Egg.mount(root), root));
  part('devices', window.EthTrack.theory);
  part('crash', (root) => J(window.Crash.mount(root), root));
  part('catch', (root) => J(window.Catch.mount(root), root));
  part('design', (root) => J(window.Design.mount(root), root));
  part('game4', (root) => window.EthGame.mount(root, {
    id: 'safety', title: '40초 이 장치는 무엇을 할까?', seconds: 40,
    intro: '시간을 늘리나, 관성을 막나?<br>«게임 시작»을 누르자',
    endSay: '푹신하게 받으면 시간을 늘림 · 붙잡아 두면 관성을 막음 · 멀리 보내려면 충격량 크게',
    items: [
      { q: '자동차 에어백', a: 'time', why: '머리가 멈추는 시간을 늘린다.' },
      { q: '찌그러지며 충격을 받는 범퍼', a: 'time', why: '차가 멈추는 시간이 길어진다.' },
      { q: '도로의 보호 난간', a: 'time', why: '부딪친 차가 천천히 멈춘다.' },
      { q: '높이뛰기 매트', a: 'time', why: '몸이 멈추는 시간을 늘린다.' },
      { q: '두꺼운 포수 글러브', a: 'time', why: '공이 멈추는 시간이 길어진다.' },
      { q: '택배 상자 속 뽁뽁이', a: 'time', why: '물건이 받는 충격 시간을 늘린다.' },
      { q: '체육관 기둥에 감은 스펀지', a: 'time', why: '부딪친 몸이 천천히 멈춘다.' },
      { q: '무릎 보호대 안쪽 스펀지', a: 'time', why: '충돌 시간을 늘려 무릎을 지킨다.' },
      { q: '자동차 안전띠', a: 'iner', why: '급정거 때 몸이 앞으로 튀어 나가지 않게.' },
      { q: '안전모 턱끈', a: 'iner', why: '몸이 멈출 때 안전모가 벗겨지지 않게.' },
      { q: '놀이 기구의 어깨 고정 장치', a: 'iner', why: '갑자기 멈춰도 몸이 튀어 나가지 않게.' },
      { q: '트럭 짐칸의 짐 묶는 끈', a: 'iner', why: '급정거 때 짐이 앞으로 쏠리지 않게.' },
      { q: '버스 손잡이를 꼭 잡기', a: 'iner', why: '출발·정지 때 몸이 쏠리지 않게.' },
      { q: '골프채를 끝까지 휘두르기', a: 'push', why: '공에 힘을 주는 시간을 늘린다.' },
      { q: '배구 스파이크를 세게 내리치기', a: 'push', why: '큰 힘으로 공의 운동량을 크게.' },
      { q: '포신이 긴 대포', a: 'push', why: '포탄이 힘을 받는 시간이 길다.' },
      { q: '테니스공을 라켓으로 밀어 치기', a: 'push', why: '접촉 시간을 늘려 충격량을 키운다.' },
      { q: '투수가 공을 몸 뒤에서부터 길게 끌어 던지기', a: 'push', why: '공에 힘을 오래 준다.' },
    ],
  }));
  part('drill4', (root) => window.Drill.mount(root, [
    { q: '같은 높이에서 같은 달걀을 단단한 바닥과 푹신한 방석에 떨어뜨렸다. 옳은 것만 고른 것은?', box: ['ㄱ. 두 달걀이 받은 충격량은 같다.', 'ㄴ. 방석에 떨어진 달걀이 힘을 받는 시간이 더 길다.', 'ㄷ. 단단한 바닥에 떨어진 달걀이 받은 평균 힘이 더 작다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '충격량이 같고 시간이 짧은 단단한 바닥 쪽 힘이 <b>더 크다</b>(ㄷ ×).' },
    { q: '같은 충격량을 받을 때, 충돌 시간이 0.01초에서 0.04초로 늘어나면 평균 힘은?', opts: ['4배', '2배', '그대로', '1/2', '1/4'], a: 4, why: '힘은 시간에 <b>반비례</b> → 1/4.' },
    { q: '에어백·범퍼·안전 매트에 공통으로 쓰인 원리는?', opts: ['충격량을 크게 한다.', '충돌 시간을 늘려 받는 힘을 줄인다.', '질량을 줄여 운동량을 없앤다.', '관성을 없앤다.', '운동량을 늘린다.'], a: 1, why: '충격량은 그대로, <b>시간을 늘려</b> 힘을 줄인다.' },
    { q: '안전띠에 대한 설명으로 옳은 것은?', opts: ['자동차의 운동량을 줄인다.', '급정거 때 몸이 관성으로 앞으로 튀어 나가지 않게 붙잡는다.', '충격량을 크게 한다.', '정지한 차에서만 효과가 있다.', '관성을 크게 만든다.'], a: 1, why: '안전띠는 <b>관성</b>에 대비한 장치다.' },
    { q: '공을 맨손으로 받을 때 충격량 S를 시간 t 동안, 글러브로 받을 때 충격량 3S를 시간 2t 동안 받았다. 평균 힘의 비(맨손 : 글러브)는?', opts: ['1 : 1', '2 : 3', '3 : 2', '1 : 3', '1 : 6'], a: 1, why: '맨손 S/t, 글러브 3S/2t → <b>2 : 3</b>.' },
    { q: '2 kg 물체가 4 m/s로 벽에 부딪쳐 반대 방향 2 m/s로 튀어 나왔다. 벽에게서 받은 충격량의 크기는?', opts: ['4 N·s', '6 N·s', '8 N·s', '12 N·s', '16 N·s'], a: 3, why: '방향이 바뀌므로 2 × (2 − (−4)) = <b>12 N·s</b>.' },
    { q: '질량 3m, m, m인 A, B, C를 높이 4h, 4h, h에서 동시에 자유 낙하 시켰다. 바닥에 닿기 직전까지 운동량 변화량이 가장 큰 것은?(단원 복습)', opts: ['A', 'B', 'C', 'A와 B가 같다', '모두 같다'], a: 0, why: '높을수록 빠르고, 같은 높이면 무거울수록 큼 → <b>A</b>.' },
    { q: '같은 높이에서 질량 m인 A를 가만히 놓고, 질량 2m인 B를 수평으로 던졌다. 옳은 것은?(단원 복습)', opts: ['B가 먼저 바닥에 닿는다.', '두 물체의 가속도는 같다.', 'B의 가속도가 A의 2배이다.', 'A의 수평 속력이 B보다 크다.', '두 물체의 운동량은 늘 같다.'], a: 1, why: '둘 다 <b>중력 가속도</b> — 질량과 관계없다.' },
    { q: '원 궤도를 따라 일정한 빠르기로 지구를 도는 인공위성에 대해 옳은 것만 고른 것은?(단원 복습)', box: ['ㄱ. 지구의 중력을 받는다.', 'ㄴ. 가속도의 방향은 지구 중심 쪽이다.', 'ㄷ. 운동 방향이 바뀌지 않는다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '원을 도니 <b>방향이 계속 바뀐다</b>(ㄷ ×).' },
    { q: '옳은 것만 고른 것은?(중단원 마무리 139쪽 변형)', box: ['ㄱ. 같은 물체라면 빠르게 움직일수록 운동량이 크다.', 'ㄴ. 부딪칠 때 받은 충격량이 운동량의 변화량보다 늘 크다.', 'ㄷ. 지표 근처에서 놓은 공과 옆으로 던진 공은 가속도가 같다.'], opts: ['ㄱ', 'ㄴ', 'ㄱ, ㄷ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '충격량은 운동량 변화량과 <b>같다</b>(ㄴ ×).' },
  ]));
  part('sum4', (root) => window.RxT.sum(root));
  part('check4', (root) => { window.LessonParts.mountWrap(root); });
})();
