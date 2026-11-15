/* 2-1-1 2차시 «빅뱅과 입자의 생성»(교과서 51~52쪽).
   차례(9장): 표지(팽창하는 우주 끌기) → 이론(빅뱅 우주론) → 이론(입자의 탄생, Manim) → 체험(3D 물질 속으로)
   → 체험(쿼크 셋으로 양성자·중성자) → 체험(수소:헬륨 3:1) → 문제로 다지기 → 정리 → 확인. */
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
  cover(window.Balloon);
  part('bigbang', (root) => window.BigBang.mount(root));
  part('early', (root) => window.RxT.stepper(root));
  part('atom', (root) => window.Atom3D.mount(root));
  part('quark', (root) => window.Quark.mount(root));
  part('fuse', (root) => window.Fuse.mount(root));
  part('drill5', (root) => window.Drill.mount(root, [
    { q: '빅뱅 우주론으로 본 우주에 대해 옳은 것만 고른 것은?',
      box: ['ㄱ. 우주는 지금도 팽창하고 있다.', 'ㄴ. 팽창하는 동안 우주의 온도는 그대로였다.', 'ㄷ. 팽창하면서 우주의 밀도는 작아졌다.', 'ㄹ. 새 입자가 계속 생겨 우주 전체의 질량이 늘었다.'],
      opts: ['ㄱ, ㄴ', 'ㄱ, ㄷ', 'ㄴ, ㄹ', 'ㄱ, ㄷ, ㄹ', 'ㄴ, ㄷ, ㄹ'], a: 1, why: '팽창하면 <b>온도와 밀도는 낮아지고</b>, 우주 전체의 질량은 일정하다. 기본 입자는 초기에만 생겼다.' },
    { q: '위 쿼크(전하 +2/3)와 아래 쿼크(전하 −1/3)에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 양성자는 위 쿼크 2개와 아래 쿼크 1개로 되어 있다.', 'ㄴ. 중성자를 이루는 쿼크 3개의 전하를 더하면 0이다.', 'ㄷ. 양성자가 쪼개져 쿼크가 생겼다.'],
      opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '양성자: +2/3 +2/3 −1/3 = +1, 중성자: +2/3 −1/3 −1/3 = 0. 쿼크가 <b>모여</b> 양성자·중성자가 됐다(ㄷ ×).' },
    { q: '빅뱅 뒤 생긴 차례대로 늘어놓은 것은?', box: ['ㄱ. 원자', 'ㄴ. 쿼크와 전자', 'ㄷ. 헬륨 원자핵', 'ㄹ. 양성자와 중성자'],
      opts: ['ㄴ → ㄹ → ㄷ → ㄱ', 'ㄴ → ㄷ → ㄹ → ㄱ', 'ㄹ → ㄴ → ㄷ → ㄱ', 'ㄱ → ㄷ → ㄹ → ㄴ', 'ㄴ → ㄹ → ㄱ → ㄷ'], a: 0, why: '우주가 식으며 <b>작은 입자부터</b>: 쿼크·전자 → 양성자·중성자 → 헬륨 원자핵(약 3분) → 원자(약 38만 년).' },
    { q: '양성자 14개와 중성자 2개가 있다. 중성자가 모두 헬륨 원자핵을 만드는 데 쓰였을 때 옳은 것은? (양성자와 중성자의 질량은 같다고 본다.)',
      opts: ['헬륨 원자핵은 2개 생긴다.', '남은 수소 원자핵은 10개이다.', '수소 원자핵과 헬륨 원자핵의 개수비는 3 : 1이다.', '수소 원자핵과 헬륨 원자핵의 질량비는 3 : 1이다.', '헬륨 원자핵 하나의 질량은 수소 원자핵의 2배이다.'], a: 3, why: '헬륨 원자핵 1개(양성자 2 + 중성자 2, 질량 4), 남은 양성자 12개 = 수소 원자핵 12개(질량 12). 개수비 12 : 1, <b>질량비 12 : 4 = 3 : 1</b>.' },
    { q: '빅뱅 뒤 입자가 생기는 과정에 대한 설명으로 옳은 것은?',
      opts: ['양성자가 전자보다 먼저 생겼다.', '중성자는 더 쪼갤 수 없는 기본 입자다.', '수소 원자핵은 중성자 하나로 되어 있다.', '헬륨 원자핵은 양성자 2개와 중성자 1개로 되어 있다.', '헬륨 원자핵이 생기기 직전 양성자가 중성자보다 훨씬 많았다.'], a: 4, why: '기본 입자는 쿼크·전자(①② ×), 수소 원자핵 = 양성자 1개(③ ×), 헬륨 원자핵 = 양성자 2 + 중성자 2(④ ×). 직전에는 양성자 : 중성자 ≈ 7 : 1.' },
  ]));
  part('sum5', (root) => window.RxT.sum(root));
  part('check5', (root) => { window.LessonParts.mountWrap(root); });
  part('cool', (r) => window.Xpa.mount(r, 'cool'));
})();
