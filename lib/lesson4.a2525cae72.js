/* 2-2-2 1차시 「도체·부도체·반도체」(교과서 88~89쪽 + 참고서 104~107쪽): 장마다 조각을 붙인다.
   차례(9장): 표지(분해한 스마트폰, 사건 파일 12) → 체험(여러 물체의 전기적 성질, 해 보기 88쪽) → 이론(도체·부도체·반도체)
   → 체험(전선 속 전자) → 이론(반도체와 불순물) → 체험(규소에 불순물 넣기) → 문제로 다지기 → 정리 → 확인. 활용은 2차시(lesson6). */
(function () {
  'use strict';
  const { part } = window.Deck;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  part('cover', (root) => {
    const ph = window.Phone.mount(root);
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector('#pr-c').classList.toggle('answer', on);
    return { fit: ph.fit, setActive: ph.setActive, fragment(f, on) { if (f.dataset.anim === 'ph') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="ph"]'); answer(!!f && f.classList.contains('visible')); } };
  });
  part('circuit', (root) => window.EthTrack.join(window.Circuit.mount(root), window.L1.frame(root)));
  part('ectheory', (root) => window.RxT.stepper(root));
  part('freee', (root) => window.FreeE.mount(root));
  part('smtheory', (root) => window.RxT.stepper(root));
  part('dope', (root) => window.Dope.mount(root));
  part('wire', (root) => window.EthTrack.join(window.More.mount(root, 'wire'), window.L1.frame(root)));
  part('drill4', (root) => window.Drill.mount(root, [
    { q: '도체와 부도체에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 자유 전자 수는 도체가 부도체보다 많다.', 'ㄴ. 도체는 원자의 크기가 작아서 전류가 잘 흐른다.', 'ㄷ. 전류를 방해하는 성질이 강할수록 좋은 도체이다.'], opts: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ'], a: 0, why: '전류가 잘 흐르는 까닭은 <b>자유 전자</b>. 방해가 클수록 도체가 아니다.' },
    { q: '자유 전자에 대한 설명으로 옳은 것은?', opts: ['원자핵 속에 붙잡혀 있는 입자이다.', '원자에 붙잡혀 있다가 에너지를 받아 풀려나 돌아다니는 전자이다.', '양(+)전하를 띤다.', '부도체에 가장 많다.', '전압을 걸면 (−)극 쪽으로 움직인다.'], a: 1, why: '자유 전자는 (−)전하 — 전압을 걸면 <b>(+)극</b> 쪽으로 움직인다.' },
    { q: '반도체를 설명한 것 중 틀린 것은?', opts: ['전류가 흐르는 정도가 도체와 부도체 사이이다.', '규소·저마늄이 대표적이다.', '불순물을 섞어 전기적 성질을 조절할 수 있다.', '빛·열 같은 조건에 따라 성질이 달라진다.', '순수한 규소는 금속보다 전류가 훨씬 잘 흐른다.'], a: 4, why: '순수한 규소는 전류가 <b>잘 흐르지 않는다</b>.' },
    { q: '순수한 규소에 인을 섞었을 때에 대한 설명으로 옳은 것만 고른 것은?', box: ['ㄱ. 인은 원자가 전자가 5개이다.', 'ㄴ. 결합하고 남는 전자가 자유 전자가 된다.', 'ㄷ. 전류가 순수한 규소보다 덜 흐른다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '남는 전자가 움직여 <b>더 잘</b> 흐른다(ㄷ ×).' },
    { q: '교과서 88쪽 해 보기처럼 물체를 회로에 끼웠을 때 전류가 흐르는 것만 고른 것은?', box: ['ㄱ. 금속 클립', 'ㄴ. 연필심', 'ㄷ. 지우개', 'ㄹ. 나무 막대'], opts: ['ㄱ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄷ, ㄹ', 'ㄱ, ㄴ, ㄹ'], a: 1, why: '클립(금속)과 연필심은 전류가 흐르고, 지우개·나무는 흐르지 않는다.' },
    { q: '순수한 규소에 붕소를 섞었을 때에 대한 설명으로 옳은 것은?', opts: ['붕소는 원자가 전자가 5개이다.', '전자가 모자란 빈자리가 생기고 이웃 전자가 그 자리로 옮겨 다닌다.', '전류가 순수한 규소보다 덜 흐른다.', '규소가 부도체로 바뀐다.', '움직일 수 있는 전자가 모두 사라진다.'], a: 1, why: '원자가 전자가 3개인 <b>붕소</b> 옆에는 빈자리 → 이웃 전자가 옮겨 다니며 전류가 흐른다.' },
    { q: '같은 조건에서 자유 전자의 수를 옳게 견준 것은?', opts: ['도체 > 반도체 > 부도체', '도체 > 부도체 > 반도체', '반도체 > 도체 > 부도체', '부도체 > 반도체 > 도체', '셋 다 같다'], a: 0, why: '자유 전자가 <b>많을수록</b> 전류가 잘 흐른다 — 반도체는 그 사이.' },
  ]));
  part('sum4', (root) => window.RxT.sum(root));
  part('check4', (root) => { window.LessonParts.mountWrap(root); });
})();
