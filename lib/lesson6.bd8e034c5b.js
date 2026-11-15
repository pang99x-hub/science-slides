/* 2-1-1 3차시 «우주 배경 복사와 빅뱅의 증거»(교과서 52~53쪽).
   차례(7장): 표지(전파 안테나 돌리기) → 체험(우주 배경 복사) → 이론(식어 버린 빛, 두 증거) → 미니 게임(언제 생겼을까)
   → 문제로 다지기 → 정리 → 확인. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  // 표지: 오른쪽 손 조작 + 예측 둘 중 하나, 한 번 넘기면 첫째 답에 테
  const cover = (M) => part('cover', (root) => {
    const m = M.mount(root);
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector('#pr-el').classList.toggle('answer', on);
    return { fit: m.fit, setActive: m.setActive, fragment(f, on) { if (f.dataset.anim === 'au') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="au"]'); answer(!!f && f.classList.contains('visible')); } };
  });
  cover(window.Horn);
  part('cmb', (root) => window.CMB.mount(root));
  part('evid', (root) => window.Stretch.mount(root));
  part('game6', (root) => window.EthGame.mount(root, {
    id: 'early', title: '40초 언제 생겼을까', seconds: 40,
    intro: '카드의 입자·사건이 생긴 때를 골라!<br>«게임 시작»을 누르자',
    endSay: '우주가 식으며 작은 입자부터: 쿼크·전자 → 원자핵 → 원자 → 별',
    items: [
      { q: '쿼크', a: 'first', why: '가장 먼저 생긴 기본 입자.' },
      { q: '전자', a: 'first', why: '쿼크와 함께 빅뱅 직후 생긴 기본 입자.' },
      { q: '한 점에서 대폭발이 일어나 팽창 시작', a: 'first', why: '빅뱅 — 모든 것의 시작.' },
      { q: '세 가지 색으로 그린 아주 작은 입자들이 흩어진다', a: 'first', why: '쿼크 — 빅뱅 직후.' },
      { q: '양성자', a: 'min3', why: '쿼크 3개가 모여 생겼다 → 3분 이전.' },
      { q: '중성자', a: 'min3', why: '쿼크 3개가 모여 생겼다 → 3분 이전.' },
      { q: '헬륨 원자핵', a: 'min3', why: '빅뱅 후 약 3분 사이 핵융합으로.' },
      { q: '수소 원자핵(양성자 하나)', a: 'min3', why: '양성자 자체가 수소 원자핵 → 3분 이전.' },
      { q: '수소 원자', a: 'y38', why: '원자핵이 전자를 붙잡아야 원자 → 약 38만 년.' },
      { q: '헬륨 원자', a: 'y38', why: '헬륨 원자핵 + 전자 2개 → 약 38만 년.' },
      { q: '우주 배경 복사', a: 'y38', why: '원자가 생기며 퍼진 빛 → 약 38만 년.' },
      { q: '빛이 처음으로 곧게 퍼지기 시작', a: 'y38', why: '전자가 원자핵에 붙잡힌 뒤 → 약 38만 년.' },
      { q: '별', a: 'later', why: '수소·헬륨이 모여 → 원자가 생긴 뒤.' },
      { q: '은하', a: 'later', why: '별이 모인 무리 → 그 뒤.' },
      { q: '탄소', a: 'later', why: '별 속 핵융합으로(2-1-2 1차시) → 그 뒤.' },
      { q: '철', a: 'later', why: '무거운 별의 중심에서(2-1-2 1차시) → 그 뒤.' },
    ],
  }));
  part('drill6', (root) => window.Drill.mount(root, [
    { q: '빅뱅 뒤 서로 다른 때 (가)~(다)에 일어난 일이다. 옳은 것은?',
      box: ['(가) 쿼크가 모여 양성자와 중성자가 생겼다.', '(나) 원자핵과 전자가 따로 떠다녔다.', '(다) 빛이 막힘 없이 우주로 퍼지기 시작했다.'],
      opts: ['가장 먼저 일어난 일은 (나)이다.', '우주의 온도는 (나) 때 가장 높았다.', '(다) 무렵 우주가 투명해졌다.', '(다)는 빅뱅 후 약 3분 무렵이다.', '전자는 (가)와 (나) 사이에 생겼다.'], a: 2, why: '차례는 (가) → (나) → (다). (다)는 원자가 생긴 약 38만 년 — 빛이 곧게 퍼져 우주가 <b>투명</b>해졌다. 전자는 (가)보다 먼저 생겼다.' },
    { q: '원자가 만들어지기 전의 우주가 불투명했던 까닭으로 옳은 것은?',
      opts: ['우주가 지금보다 어두웠기 때문이다.', '빛이 아직 생기지 않았기 때문이다.', '따로 떠다니던 전자와 원자핵이 빛을 흩어지게 했기 때문이다.', '별과 은하가 빛을 가렸기 때문이다.', '우주가 팽창을 멈추고 있었기 때문이다.'], a: 2, why: '전기를 띤 입자(전자·원자핵)가 빛과 자꾸 부딪쳐 빛이 곧게 나아가지 못했다. 원자가 되자 빛이 <b>곧게</b> 퍼졌다(투명).' },
    { q: '우주 배경 복사에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 빅뱅 후 약 38만 년에 원자가 만들어지며 퍼져 나간 빛이다.', 'ㄴ. 우주가 팽창하면서 파장이 점점 짧아졌다.', 'ㄷ. 하늘의 모든 방향에서 거의 같은 세기로 관측된다.'],
      opts: ['ㄱ', 'ㄴ', 'ㄱ, ㄷ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '공간이 늘어나며 빛의 파장도 <b>길어졌다</b>(ㄴ ×). 약 3000 K의 빛이 지금은 약 3 K의 전파로 사방에서 온다.' },
    { q: '우주에 널리 퍼진 수소와 헬륨에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 수소와 헬륨의 질량비는 약 3 : 1이다.', 'ㄴ. 빅뱅 뒤 수소의 비율은 계속 늘고 있다.', 'ㄷ. 이 질량비는 빅뱅 우주론의 증거가 된다.'],
      opts: ['ㄱ', 'ㄴ', 'ㄱ, ㄷ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '별 속에서는 수소가 핵융합해 헬륨이 되므로 수소 비율이 늘지 않는다(ㄴ ×). 이론으로 예측한 3 : 1이 관측과 같다(ㄷ ○).' },
    { q: '빅뱅 우주론을 뒷받침하는 증거만 고른 것은?', box: ['ㄱ. 하늘의 모든 방향에서 관측되는 우주 배경 복사', 'ㄴ. 우주의 수소와 헬륨의 질량비가 약 3 : 1인 것', 'ㄷ. 태양 스펙트럼에 검은 선이 나타나는 것'],
      opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '이론이 내놓은 값과 관측이 같은 것이 증거(ㄱ, ㄴ). 태양의 검은 선은 태양 대기의 <b>원소</b>를 알려 줄 뿐이다.' },
  ]));
  part('sum6', (root) => window.RxT.sum(root));
  part('check6', (root) => { window.LessonParts.mountWrap(root); });
  part('glow', (r) => window.Xpa.mount(r, 'glow'));
  part('lookback', (r) => window.Xpa.mount(r, 'lookback'));
  part('ratio', (r) => window.Xpa.mount(r, 'ratio'));
})();
