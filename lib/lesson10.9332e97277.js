/* 2-1-3 3차시 «원소가 결합하는 까닭»(교과서 66~67쪽). 차례(7장): 표지(나트륨과 네온) → 체험(18족처럼 되기, 해 보기 67쪽) → 이론(18족과 결합하는 까닭) → 미니 게임 → 문제로 다지기 → 정리 → 확인. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  // 표지: 오른쪽 손 조작 + 예측 둘 중 하나, 한 번 넘기면 답에 테
  const cover = (mount, ans = '#pr-el', anim = 'au') => part('cover', (root) => {
    const m = mount(root);
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector(ans).classList.toggle('answer', on);
    return { fit: m.fit, setActive: m.setActive, fragment(f, on) { if (f.dataset.anim === anim) answer(on); }, sync(slide) { const f = slide.querySelector(`[data-anim="${anim}"]`); answer(!!f && f.classList.contains('visible')); } };
  });
  const cov = (kind) => cover((r) => window.Cov.mount(r, kind));
  cov('noble');
  part('stable', (root) => window.Stable.mount(root));
  part('noble', window.EthTrack.theory);
  part('game10', (root) => window.EthGame.mount(root, {
    id: 'ion', title: '40초 전자를 잃을까 얻을까', seconds: 40,
    intro: '18족처럼 되는 쉬운 길을 골라!<br>«게임 시작»을 누르자',
    endSay: '원자가 전자 1·2개 → 잃고, 6·7개 → 얻는다',
    items: [
      { q: '리튬', a: 'l1', why: '2, 1 → 1개 잃고 헬륨처럼.' }, { q: '나트륨', a: 'l1', why: '2, 8, 1 → 1개 잃고 네온처럼.' }, { q: '칼륨', a: 'l1', why: '1족 → 1개 잃음.' },
      { q: '마그네슘', a: 'l2', why: '2, 8, 2 → 2개 잃고 네온처럼.' }, { q: '칼슘', a: 'l2', why: '2족 → 2개 잃음.' }, { q: '베릴륨', a: 'l2', why: '2, 2 → 2개 잃고 헬륨처럼.' },
      { q: '플루오린', a: 'g1', why: '2, 7 → 1개 얻고 네온처럼.' }, { q: '염소', a: 'g1', why: '2, 8, 7 → 1개 얻고 아르곤처럼.' }, { q: '브로민', a: 'g1', why: '17족 → 1개 얻음.' },
      { q: '산소', a: 'g2', why: '2, 6 → 2개 얻고 네온처럼.' }, { q: '황', a: 'g2', why: '2, 8, 6 → 2개 얻고 아르곤처럼.' },
      { q: '전자 배치 2, 8, 1', a: 'l1', why: '바깥 1개 → 잃는다(나트륨).' }, { q: '전자 배치 2, 8, 7', a: 'g1', why: '바깥 7개 → 1개 얻는다(염소).' }, { q: '전자 배치 2, 6', a: 'g2', why: '바깥 6개 → 2개 얻는다(산소).' },
      { q: '전자 배치 2, 8, 8, 2', a: 'l2', why: '바깥 2개 → 잃는다(칼슘).' }, { q: '1족 원소(수소 제외)', a: 'l1', why: '알칼리 금속 → 1개 잃음.' },
    ],
  }));
  part('drill10', (root) => window.Drill.mount(root, [
    { q: '18족 원소에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 바깥 껍질에 전자가 2개 또는 8개 채워져 있다.', 'ㄴ. 다른 원소와 잘 반응한다.', 'ㄷ. 원자가 전자 수를 0으로 본다.'], opts: ['ㄱ', 'ㄴ', 'ㄱ, ㄷ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '꽉 차 안정 → 잘 반응하지 않는 <b>비활성 기체</b>(ㄴ ×).' },
    { q: '산소 원자(전자 배치 2, 6)가 안정해지는 방법으로 옳은 것은?',
      opts: ['전자 6개를 잃는다.', '전자 2개를 얻어 네온과 같은 전자 배치가 된다.', '전자 2개를 잃어 헬륨과 같은 전자 배치가 된다.', '전자 1개를 얻는다.', '이미 안정하므로 변하지 않는다.'], a: 1,
      why: '6개를 잃는 것보다 <b>2개를 얻는</b> 편이 쉽다 → 2, 8(네온).' },
    { q: '이온과, 그 이온과 전자 배치가 같은 18족 원소를 옳게 짝 지은 것은?',
      opts: ['나트륨 이온(Na⁺) — 네온', '염화 이온(Cl⁻) — 네온', '마그네슘 이온(Mg²⁺) — 아르곤', '산화 이온(O²⁻) — 헬륨', '리튬 이온(Li⁺) — 네온'], a: 0,
      why: 'Na⁺ 2, 8 = 네온. Cl⁻는 아르곤, Mg²⁺와 O²⁻는 네온, Li⁺는 헬륨과 같다.' },
    { q: '원소가 결합하는 까닭에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 18족 원소는 가장 바깥 껍질이 채워져 있어 안정하다.', 'ㄴ. 금속 원소는 전자를 잃어 양이온이 되기 쉽다.', 'ㄷ. 비금속 원소끼리는 전자를 주고받지 못하므로 결합할 수 없다.'],
      opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '비금속 원소끼리는 전자를 <b>함께 가져</b> 결합한다(ㄷ ×) — 다음 소단원의 공유 결합.' },
    { q: '칼슘 원자(전자 배치 2, 8, 8, 2)가 이온이 될 때에 대해 옳은 것은?',
      opts: ['전자 2개를 얻어 Ca²⁻가 된다.', '전자 2개를 잃어 Ca²⁺가 되고 아르곤과 전자 배치가 같아진다.', '전자 1개를 잃어 Ca⁺가 된다.', '전자 6개를 얻는다.', '네온과 전자 배치가 같아진다.'], a: 1,
      why: '바깥 전자 2개를 잃으면 <b>2, 8, 8</b>(아르곤). 전자를 잃었으니 (+)전하를 띤다.' },
  ]));
  part('sum10', (root) => window.RxT.sum(root));
  part('check10', (root) => { window.LessonParts.mountWrap(root); });
  part('lens10', (r) => window.M34.mount(r, 'lens10'));
  part('bulb10', (r) => window.M34.mount(r, 'bulb10'));
  part('pair10', (r) => window.M34.mount(r, 'pair10'));
})();
