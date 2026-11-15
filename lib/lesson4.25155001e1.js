/* 2-1-4 3차시 «결합에 따른 물질의 성질»(교과서 72~74쪽). 차례(8장): 표지(젖은 손과 플러그, 사건 파일 8) → 체험(전기 전도성 실험) → 체험(이온의 이동) → 이론(두 결합 견주기) → 체험(제임스 웹) → 문제로 다지기 → 정리 → 확인. */
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
  cover((r) => window.Plug.mount(r), '#pr-i', 'pl');
  part('conduct', (root) => window.Conduct.mount(root));
  part('ionmove', (root) => window.IonMove.mount(root));
  part('compare', window.EthTrack.theory);
  part('jwst', (root) => window.Jwst.mount(root));
  part('drill4', (root) => window.Drill.mount(root, [
    { q: '물질 (가)는 고체 ×, 수용액 ○, (나)는 고체 ×, 수용액 ×로 전류가 흘렀다. 옳은 것만 고른 것은?', box: ['ㄱ. (가)는 이온 결합 물질이다.', 'ㄴ. (나)는 설탕일 수 있다.', 'ㄷ. (가)의 수용액에 전원을 연결하면 양이온은 (+)극 쪽으로 움직인다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '양이온은 반대 전하인 <b>(−)극</b> 쪽으로 끌려간다(ㄷ ×).' },
    { q: '전기 전도성 실험에서 고체를 녹일 때 수돗물이 아닌 증류수를 쓰는 까닭은?', opts: ['증류수에는 이온이 거의 없어 그 자체로는 전류가 흐르지 않기 때문', '증류수가 고체를 더 빨리 녹이기 때문', '증류수가 측정기의 전지를 아껴 주기 때문', '증류수가 공유 결합 물질을 이온으로 나누기 때문', '증류수의 온도가 늘 일정하기 때문'], a: 0, why: '수돗물에는 이온이 녹아 있어 결과를 흐린다. 증류수는 <b>이온이 거의 없다</b>.' },
    { q: '고체 염화 나트륨에 전류가 흐르지 않는 까닭으로 옳은 것은?', opts: ['이온이 들어 있지 않아서', '이온이 서로 강하게 붙들려 움직일 수 없어서', '원자들이 전자쌍을 공유하고 있어서', '전기적으로 중성인 분자로 되어 있어서', '나트륨이 비금속이어서'], a: 1, why: '이온은 있지만 제자리에 묶여 있다. 물에 녹이거나 녹인 액체가 되면 <b>움직여</b> 전류가 흐른다.' },
    { q: '순수한 물은 전류가 거의 흐르지 않는데, 젖은 손으로 플러그를 꽂으면 위험한 까닭은?', opts: ['땀이나 수돗물에 녹아 있는 이온이 전류를 나르기 때문', '물 분자가 전자쌍을 내놓아 전류가 되기 때문', '물이 금속처럼 전자를 자유롭게 옮기기 때문', '손의 피부가 이온 결합으로 되어 있기 때문', '물이 닿으면 플러그가 녹기 때문'], a: 0, why: '땀·수돗물에는 염화 나트륨 등 <b>이온 결합 물질</b>이 녹아 있다.' },
  ]));
  part('sum4', (root) => window.RxT.sum(root));
  part('check4', (root) => { window.LessonParts.mountWrap(root); });
  part('dose4', (r) => window.M34.mount(r, 'dose4'));
  part('blue4', (r) => window.M34.mount(r, 'blue4'));
})();
