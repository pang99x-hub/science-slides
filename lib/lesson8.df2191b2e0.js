/* 2-1-2 3차시 «태양계와 지구의 형성»(교과서 57~59쪽). 차례(8장): 표지(성운 수축) → 이론(태양계 형성, Manim) → 체험(원시 원반) → 체험(지구의 탄생) → 체험(내 몸 원소의 고향) → 문제로 다지기 → 정리 → 확인. */
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
  cov('spin');
  part('solar', (root) => window.RxT.stepper(root));
  part('disk', (root) => window.Disk.mount(root));
  part('earth', (root) => window.Earth.mount(root));
  part('origin', (root) => window.Origin.mount(root));
  part('drill8', (root) => window.Drill.mount(root, [
    { q: '태양계가 생기는 과정에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 태양계 성운이 수축하기 시작한 것은 초신성 폭발과 관련 있다.', 'ㄴ. 성운이 수축하면서 중심의 온도가 높아졌다.', 'ㄷ. 원시 태양이 도는 방향과 원시 행성이 공전하는 방향은 반대다.'],
      opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '원시 태양과 원반은 <b>같은 방향</b>으로 돌아 행성들도 같은 방향으로 공전한다(ㄷ ×).' },
    { q: '원시 태양에 가까운 A와 먼 B 지점을 견준 것으로 옳은 것만 고른 것은?', box: ['ㄱ. 철·니켈 같은 금속 원소는 B보다 A에 많다.', 'ㄴ. 온도는 A가 B보다 높다.', 'ㄷ. B에서 생긴 행성은 평균 밀도가 크다.'],
      opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '먼 B에서는 가벼운 물질과 기체가 모인 <b>목성형</b> → 평균 밀도가 작다(ㄷ ×).' },
    { q: '(가) 미행성체 충돌 → (나) 마그마 바다 → (다) 원시 지각. 옳은 것만 고른 것은?', box: ['ㄱ. (가) → (나) 동안 지구의 질량이 커졌다.', 'ㄴ. (나) → (다) 동안 미행성체 충돌이 줄었다.', 'ㄷ. (다) 시기에 처음으로 맨틀과 핵이 나뉘었다.', 'ㄹ. 최초의 생명은 (다)보다 먼저 나타났다.'],
      opts: ['ㄱ, ㄴ', 'ㄱ, ㄹ', 'ㄷ, ㄹ', 'ㄱ, ㄴ, ㄷ', 'ㄴ, ㄷ, ㄹ'], a: 0, why: '맨틀과 핵은 <b>마그마 바다</b> 때 나뉘었고(ㄷ ×), 생명은 원시 바다가 생긴 <b>뒤</b>(ㄹ ×).' },
    { q: '지구형 행성과 목성형 행성에 대해 옳은 것은?',
      opts: ['목성형 행성은 원시 태양 가까이에서 생겼다.', '지구형 행성은 목성형 행성보다 평균 밀도가 작다.', '지구형 행성은 원시 태양 가까이에서 철·규소처럼 녹는점이 높은 물질이 모여 생겼다.', '목성형 행성은 주로 암석과 금속으로 되어 있다.', '두 종류의 행성은 서로 다른 성운에서 생겼다.'], a: 2,
      why: '태양 가까이는 뜨거워 <b>녹는점이 높은 무거운 물질</b>만 남았다 → 작고 밀도가 큰 지구형 행성.' },
    { q: '사람 몸을 이루는 원소가 생긴 곳에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 몸속 물 분자의 수소는 빅뱅 직후에 생겼다.', 'ㄴ. 몸속 탄소와 산소는 별 속 핵융합으로 생겼다.', 'ㄷ. 혈액 속 철은 지구 내부에서 새로 만들어졌다.'],
      opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '철은 <b>무거운 별 속</b> 핵융합으로 생겨 초신성 폭발로 퍼졌다. 지구는 원소를 새로 만들지 못한다(ㄷ ×).' },
  ]));
  part('sum8', (root) => window.RxT.sum(root));
  part('check8', (root) => { window.LessonParts.mountWrap(root); });
  part('skater', (r) => window.Xpa.mount(r, 'skater'));
  part('cosmocal', (r) => window.Xpa.mount(r, 'cosmocal'));
})();
