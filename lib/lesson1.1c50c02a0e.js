/* 2-1-1 1차시 «스펙트럼과 우주의 원소»(교과서 48~50쪽): 장마다 조각을 붙인다.
   차례(9장): 표지(오로라의 색, 사건 파일 5) → 이론(스펙트럼 세 가지) → 체험(가상 분광기, 탐구 50쪽) → 이론(원소마다 고유한 선)
   → 체험(우주의 원소) → 미니 게임(어떤 스펙트럼?) → 문제로 다지기 → 정리 → 확인. */
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
  cover(window.Aurora);
  part('kinds', (root) => window.SpecKinds.mount(root));
  part('scope', (root) => window.Scope.mount(root));
  part('lines', window.EthTrack.theory);
  part('abund', (root) => window.Abund.mount(root));
  part('game1', (root) => window.EthGame.mount(root, {
    id: 'speckind', title: '30초 어떤 스펙트럼?', seconds: 30,
    intro: '카드의 빛을 나누면 나올 스펙트럼을 골라!<br>«게임 시작»을 누르자',
    endSay: '뜨거운 고체는 연속, 고온의 기체는 방출, 저온의 기체를 지난 빛은 흡수',
    items: [
      { q: '백열전구의 빛', a: 'cont', why: '뜨거운 필라멘트 → 모든 색이 이어진 띠.' },
      { q: '뜨겁게 달군 쇠가 내는 빛', a: 'cont', why: '고온의 고체 → 연속 스펙트럼.' },
      { q: '무지개처럼 끊김 없이 이어진 색의 띠', a: 'cont', why: '끊김이 없으면 연속 스펙트럼.' },
      { q: '촛불 속 뜨거운 그을음 알갱이의 빛', a: 'cont', why: '뜨거운 고체 알갱이 → 연속 스펙트럼.' },
      { q: '네온사인의 빛', a: 'emit', why: '고온의 네온 기체가 스스로 내는 빛 → 밝은 선.' },
      { q: '수소 방전관의 빛', a: 'emit', why: '고온의 수소 기체 → 밝은 선 몇 개.' },
      { q: '나트륨 가로등의 노란빛', a: 'emit', why: '고온의 나트륨 기체 → 노란 밝은 선.' },
      { q: '오로라의 초록빛', a: 'emit', why: '산소가 내는 557.7 nm 밝은 선.' },
      { q: '검은 바탕에 밝은 선 몇 개', a: 'emit', why: '밝은 선만 보이면 방출 스펙트럼.' },
      { q: '태양 빛', a: 'abs', why: '태양 대기를 지나며 검은 선(프라운호퍼 선)이 생긴다.' },
      { q: '멀리 있는 별에서 온 빛', a: 'abs', why: '별의 대기를 지나온 빛 → 검은 선.' },
      { q: '백열등 빛이 저온의 수소 기체를 지난 뒤', a: 'abs', why: '기체가 제 색의 빛을 흡수 → 검은 선.' },
      { q: '연속된 색의 띠에 검은 선 몇 개', a: 'abs', why: '검은 선이 있으면 흡수 스펙트럼.' },
      { q: '프라운호퍼 선', a: 'abs', why: '태양 스펙트럼의 검은 선 = 흡수선.' },
    ],
  }));
  const X = [[430, 1], [520, 1], [610, .8]], Y = [[455, 1], [575, 1]], Z = [[470, 1], [500, .7], [660, 1]];
  const L = () => window.Spec.LINES;
  part('drill1', (root) => window.Drill.mount(root, [
    { q: '세 가지 빛을 분광기로 본 스펙트럼 (가)~(다)이다. 옳은 것은?',
      strips: [{ label: '(가)', mode: 'cont', lines: [] }, { label: '(나)', mode: 'emit', lines: X }, { label: '(다)', mode: 'abs', lines: X }],
      opts: ['(가)는 고온의 기체가 내는 빛의 스펙트럼이다.', '(나)는 백열등 빛의 스펙트럼이다.', '(다)는 방출 스펙트럼이다.', '(나)와 (다)는 서로 다른 원소의 스펙트럼이다.', '(가)는 백열등 빛에서 볼 수 있는 연속 스펙트럼이다.'], a: 4, why: '(가) 연속 = 백열등, (나) 방출 = 고온의 기체, (다) 흡수 = 저온의 기체를 지난 빛. (나)와 (다)는 선의 <b>자리</b>가 같으므로 같은 원소.' },
    { q: '가상의 원소 세 가지로 얻은 스펙트럼 A~E이다. A와 같은 원소의 스펙트럼은?',
      strips: [{ label: 'A', mode: 'emit', lines: X }, { label: 'B', mode: 'abs', lines: Y }, { label: 'C', mode: 'abs', lines: X }, { label: 'D', mode: 'emit', lines: Z }, { label: 'E', mode: 'emit', lines: Y }],
      opts: ['B', 'C', 'D', 'E'], a: 1, why: '밝은 선이든 검은 선이든 <b>자리</b>가 같으면 같은 원소. A의 밝은 선 셋과 C의 검은 선 셋이 같은 자리다(B와 E도 짝).' },
    { q: '별 A, B의 스펙트럼과 네 원소의 방출 스펙트럼이다. 옳은 것만 고른 것은?',
      strips: [{ label: '별 A', mode: 'abs', lines: [...L().H, ...L().He, ...L().Na] }, { label: '별 B', mode: 'abs', lines: [...L().H, ...L().Ca] }, { label: '수소', mode: 'emit', lines: L().H }, { label: '헬륨', mode: 'emit', lines: L().He }, { label: '나트륨', mode: 'emit', lines: L().Na }, { label: '칼슘', mode: 'emit', lines: L().Ca }],
      box: ['ㄱ. 별 A에는 수소·헬륨·나트륨이 있다.', 'ㄴ. 별 B에는 칼슘이 없다.', 'ㄷ. 두 별의 스펙트럼은 흡수 스펙트럼이다.', 'ㄹ. 나트륨의 띠는 저온의 기체가 내는 빛을 나눈 것이다.'],
      opts: ['ㄱ, ㄴ', 'ㄱ, ㄷ', 'ㄴ, ㄷ', 'ㄴ, ㄹ', 'ㄷ, ㄹ'], a: 1, why: '별 B의 검은 선 중 칼슘 선과 같은 자리가 있다 → 칼슘이 있다(ㄴ ×). 원소의 밝은 선 띠는 <b>고온</b>의 기체가 낸 빛(ㄹ ×).' },
    { q: '별빛의 스펙트럼을 분석해 알 수 있는 것만 고른 것은?', box: ['ㄱ. 별의 대기에 있는 원소의 종류', 'ㄴ. 별을 이루는 원소의 질량비', 'ㄷ. 별의 크기'],
      opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '흡수선의 <b>자리</b>로 원소의 종류를, 선의 <b>세기</b>로 질량비를 안다. 별의 크기는 흡수선만으로는 알 수 없다.' },
    { q: '우주를 이루는 원소에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 질량비가 가장 큰 원소는 수소이다.', 'ㄴ. 수소와 헬륨을 더하면 전체의 약 98 %이다.', 'ㄷ. 수소와 헬륨의 질량비는 약 1 : 3이다.'],
      opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '수소 약 74 % + 헬륨 약 24 % ≈ 98 %. 질량비는 수소 : 헬륨 ≈ <b>3 : 1</b>(ㄷ은 순서가 거꾸로).' },
  ]));
  part('sum1', (root) => window.RxT.sum(root));
  part('check1', (root) => { window.LessonParts.mountWrap(root); });
  part('flame', (r) => window.Xpa.mount(r, 'flame'));
})();
