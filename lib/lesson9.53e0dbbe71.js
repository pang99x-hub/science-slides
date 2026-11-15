/* 2-1-3 2차시 «전자 배치와 주기성»(교과서 64~65쪽). 차례(7장): 표지(전자 더하기) → 체험(전자 배치 만들기, 해 보기 64쪽) → 체험(원자 모형 붙이기) → 이론(원자가 전자와 주기성) → 문제로 다지기 → 정리 → 확인. */
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
  cov('shell');
  part('atomb', (root) => window.AtomB.mount(root));
  part('tablefit', (root) => window.TableFit.mount(root));
  part('saw', (root) => window.Sawtooth.mount(root));
  part('drill9', (root) => window.Drill.mount(root, [
    { q: '원자의 전자 배치에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 전자는 원자핵에 가까운 껍질부터 채워진다.', 'ㄴ. 첫 번째 껍질에는 전자가 최대 8개 채워진다.', 'ㄷ. 같은 주기 원소들은 원자가 전자 수가 같다.'], opts: ['ㄱ', 'ㄴ', 'ㄱ, ㄷ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 0, why: '첫 껍질은 최대 <b>2개</b>. 원자가 전자 수가 같은 것은 같은 <b>족</b>.' },
    { q: '원자 X: 원자핵 +8, 첫 번째 껍질 전자 2개, 두 번째 껍질 전자 6개. 옳은 것만 고른 것은?', box: ['ㄱ. 2주기 원소이다.', 'ㄴ. 양성자 수는 6이다.', 'ㄷ. 원자가 전자 수는 8이다.'], opts: ['ㄱ', 'ㄴ', 'ㄷ', 'ㄱ, ㄷ', 'ㄴ, ㄷ'], a: 0, why: '껍질 2개 → 2주기. 양성자 수 = 전자 수 = <b>8</b>, 원자가 전자 <b>6</b>(산소).' },
    { q: '플루오린(2, 7)과 염소(2, 8, 7)의 공통점만 고른 것은?', box: ['ㄱ. 원자가 전자 수가 7이다.', 'ㄴ. 비금속 원소이다.', 'ㄷ. 전자가 든 껍질 수가 2이다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '껍질 수는 플루오린 2, 염소 <b>3</b>(주기가 다르다).' },
    { q: '원자 번호 12인 마그네슘에 대해 옳은 것은?',
      opts: ['전자 배치는 2, 10이다.', '원자가 전자 수는 2이고 3주기 2족 원소다.', '전자가 들어 있는 껍질은 2개다.', '나트륨과 원자가 전자 수가 같다.', '2주기 원소다.'], a: 1,
      why: '전자 12개 → <b>2, 8, 2</b>. 껍질 3개 → 3주기, 가장 바깥 전자 2개 → 2족.' },
    { q: '원자 번호 3번 리튬부터 10번 네온까지에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 전자가 들어 있는 껍질 수가 모두 2로 같다.', 'ㄴ. 원자가 전자 수는 리튬에서 플루오린까지 1씩 늘어난다.', 'ㄷ. 여덟 원소는 모두 같은 족이다.'],
      opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '여덟 원소는 같은 <b>주기</b>(2주기)다. 족은 1족부터 18족까지 저마다 다르다(ㄷ ×).' },
  ]));
  part('sum9', (root) => window.RxT.sum(root));
  part('check9', (root) => { window.LessonParts.mountWrap(root); });
  part('ladder9', (r) => window.M34.mount(r, 'ladder9'));
  part('mystery9', (r) => window.M34.mount(r, 'mystery9'));
  part('cycle9', (r) => window.M34.mount(r, 'cycle9'));
})();
