/* 2-1-2 2차시 «별의 진화와 무거운 원소»(교과서 55~56쪽). 차례(9장): 표지(연금술사의 실패, 사건 파일 6) → 이론(별의 일생, Manim) → 체험(3D 별의 속) → 체험(별의 질량과 일생) → 체험(초신성) → 미니 게임 → 문제로 다지기 → 정리 → 확인. */
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
  cover((r) => window.Furnace.mount(r), '#pr-star', 'fn');
  part('evol', (root) => window.RxT.stepper(root));
  part('star3d', (root) => window.Star3D.mount(root));
  part('path', (root) => window.Life.mount(root, Object.fromEntries([...root.querySelectorAll('.lf-src')].map((i) => [i.dataset.k, { src: i.src, alt: i.alt, cr: i.dataset.cr }]))));
  part('nova', (root) => window.Nova.mount(root));
  part('game2', (root) => window.EthGame.mount(root, {
    id: 'origin', title: '40초 이 원소는 어디서', seconds: 40,
    intro: '원소가 처음 생긴 곳을 골라!<br>«게임 시작»을 누르자',
    endSay: '수소·헬륨은 빅뱅, 탄소·산소는 별, 철까지 무거운 별, 그보다 무거우면 초신성',
    items: [
      { q: '수소', a: 'bb', why: '빅뱅 직후 우주 초기에.' },
      { q: '헬륨(우주에 있는 것의 대부분)', a: 'bb', why: '대부분 빅뱅 후 약 3분 사이에.' },
      { q: '내 몸속 물 분자의 수소', a: 'bb', why: '수소는 모두 빅뱅 때 생겼다.' },
      { q: '풍선 속 헬륨', a: 'bb', why: '우주의 헬륨은 대부분 빅뱅 때.' },
      { q: '탄소', a: 'sun', why: '헬륨 핵융합 → 태양 정도 별도 만든다.' },
      { q: '산소', a: 'sun', why: '태양 정도 별 중심에서 탄소·산소까지.' },
      { q: '연필심(흑연)의 탄소', a: 'sun', why: '별 속 헬륨 핵융합으로.' },
      { q: '백색 왜성을 이루는 원소', a: 'sun', why: '태양 정도 별이 남긴 탄소·산소.' },
      { q: '철', a: 'big', why: '무거운 별 중심의 규소 핵융합 → 별이 만드는 가장 무거운 원소.' },
      { q: '규소', a: 'big', why: '무거운 별 속 산소 핵융합으로.' },
      { q: '마그네슘', a: 'big', why: '무거운 별 속 탄소 핵융합으로.' },
      { q: '네온', a: 'big', why: '무거운 별 속 탄소 핵융합으로.' },
      { q: '금', a: 'sn', why: '철보다 무거움 → 초신성 폭발 때.' },
      { q: '은', a: 'sn', why: '철보다 무거움 → 초신성 폭발 때.' },
      { q: '우라늄', a: 'sn', why: '철보다 무거움 → 초신성 폭발 때.' },
      { q: '구리 전선의 구리', a: 'sn', why: '철보다 무거움 → 초신성 폭발 때.' },
    ],
  }));
  part('drill2', (root) => window.Drill.mount(root, [
    { q: '원소와 그 원소가 생기는 곳을 옳게 짝 지은 것은?',
      opts: ['수소 — 태양 정도 별의 중심', '탄소 — 산소 핵융합', '철 — 별 속 핵융합으로 만들 수 있는 가장 무거운 원소', '구리 — 무거운 별 속 핵융합', '우라늄 — 행성상 성운'], a: 2,
      why: '수소는 빅뱅, 탄소는 헬륨 핵융합, 구리·우라늄처럼 철보다 무거운 원소는 <b>초신성 폭발</b>.' },
    { q: '질량이 다른 두 별에서 핵융합이 끝났을 때의 속이다. 옳은 것만 고른 것은?', box: ['(가) 바깥부터 수소 / 헬륨 / 탄소·산소', '(나) 바깥부터 수소 / 헬륨 / 탄소·산소·질소 / 산소·네온·마그네슘 / 규소·황 / 철', 'ㄱ. 별의 질량은 (나)가 (가)보다 크다.', 'ㄴ. 중심의 가장 높은 온도는 (나)가 (가)보다 낮다.', 'ㄷ. 태양이 진화하면 (나)처럼 된다.'],
      opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 0, why: '(나)는 철까지 만든 무거운 별 → 중심 온도도 <b>더 높다</b>. 태양은 (가)처럼 탄소·산소에서 끝난다.' },
    { q: '헬륨보다 무거운 원소의 생성에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 태양과 질량이 비슷한 별 속에서는 헬륨보다 무거운 원소가 생기지 않는다.', 'ㄴ. 철보다 무거운 원소는 초신성 폭발 때 만들어진다.', 'ㄷ. 철은 별 속 규소 핵융합으로 생긴다.'],
      opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 3, why: '태양 정도 별도 헬륨 핵융합으로 <b>탄소·산소</b>를 만든다(ㄱ ×).' },
    { q: '태양과 질량이 비슷한 별의 마지막 모습으로 옳은 것은?',
      opts: ['초신성 폭발을 일으킨다.', '중심에서 철이 만들어진다.', '바깥층은 행성상 성운이 되고 중심은 백색 왜성으로 남는다.', '중성자별이나 블랙홀이 된다.', '수소 핵융합만 하다가 그대로 식는다.'], a: 2,
      why: '태양 정도 별은 헬륨 핵융합으로 탄소·산소까지 만든 뒤 <b>행성상 성운과 백색 왜성</b>으로 끝난다. 초신성 폭발은 훨씬 무거운 별의 일.' },
    { q: '별이 만든 원소가 퍼지는 과정에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 초신성 폭발로 별 속의 원소가 우주 공간으로 흩어진다.', 'ㄴ. 흩어진 원소는 새로 태어나는 별과 행성의 재료가 된다.', 'ㄷ. 철보다 무거운 원소는 폭발하기 전 별의 중심에서 핵융합으로 만들어진다.'],
      opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '별 속 핵융합은 <b>철</b>에서 끝난다. 철보다 무거운 원소는 <b>폭발할 때</b> 만들어진다(ㄷ ×).' },
  ]));
  part('sum2', (root) => window.RxT.sum(root));
  part('check2', (root) => { window.LessonParts.mountWrap(root); });
  part('gold', (r) => window.Xpa.mount(r, 'gold'));
})();
