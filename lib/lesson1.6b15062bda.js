/* 3-1-1 1차시 「지구시스템과 지권」(교과서 102~106쪽 + 참고서 124~126쪽): 장마다 조각을 붙인다.
   차례(8장): 표지(생명 가능 지대, 사건 파일 13) → 이론(시스템과 지구시스템) → 체험(무엇이 어느 권역?) → 이론(지권의 층상 구조)
   → 체험(3D 지구 속으로) → 문제로 다지기 → 정리 → 확인. 기권·수권은 2차시(lesson5). */
(function () {
  'use strict';
  const { part } = window.Deck;
  const J = (m, root) => window.EthTrack.join(m, window.L1.frame(root));
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  part('cover', (root) => {
    const hb = window.Habit.mount(root);
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector('#pr-w').classList.toggle('answer', on);
    return { fit: hb.fit, setActive: hb.setActive, fragment(f, on) { if (f.dataset.anim === 'hb') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="hb"]'); answer(!!f && f.classList.contains('visible')); } };
  });
  part('sytheory', (root) => window.RxT.stepper(root));
  part('spheres', (root) => J(window.Spheres.mount(root), root));
  part('getheory', (root) => window.RxT.stepper(root));
  part('shrink', (root) => window.EthTrack.join(window.More31.mount(root, 'scale'), window.L1.frame(root)));
  part('earth3d', (root) => J(window.Earth3D.mount(root), root));
  part('moho', (root) => window.EthTrack.join(window.More31.mount(root, 'moho'), window.L1.frame(root)));
  part('drill1', (root) => window.Drill.mount(root, [
    { q: '지구시스템에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 요소들이 서로 영향을 미치며 하나로 움직이는 시스템이다.', 'ㄴ. 태양계라는 시스템의 한 요소이기도 하다.', 'ㄷ. 각 권역은 서로 영향을 주고받지 않는다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '권역들은 끊임없이 <b>상호작용</b>한다(ㄷ ×).' },
    { q: '행성에 생명체가 있으려면 필요한 조건으로 가장 알맞게 짝 지은 것은?', opts: ['큰 크기, 많은 위성', '안정적으로 에너지를 주는 별, 액체 상태의 물', '두꺼운 얼음층, 강한 바람', '높은 온도, 많은 화산', '고리, 빠른 자전'], a: 1, why: '꾸준한 별빛과 <b>액체 물</b> — 지구는 태양과 알맞게 떨어져 있다.' },
    { q: '지구시스템의 권역과 예의 짝으로 옳지 않은 것은?', opts: ['기권 — 질소·산소', '수권 — 빙하·지하수', '지권 — 암석·토양', '생물권 — 사람·미생물', '외권 — 구름·비'], a: 4, why: '구름·비는 <b>기권</b>. 외권은 대기 밖 우주 공간.' },
    { q: '지권의 층을 설명한 것 중 틀린 것은?', opts: ['지각은 가장 바깥의 얇은 층이다.', '맨틀은 지권에서 부피가 가장 크다.', '외핵은 액체 상태이다.', '내핵은 철과 니켈로 된 고체이다.', '맨틀은 액체라서 쉽게 흐른다.'], a: 4, why: '맨틀은 <b>고체</b>지만 아주 천천히 흐른다.' },
    { q: '대륙 지각과 해양 지각을 비교한 것으로 옳은 것은?', opts: ['대륙 지각이 더 얇다.', '해양 지각이 더 두껍다.', '대륙 지각이 더 두껍고, 해양 지각이 밀도가 더 크다.', '둘의 두께와 밀도가 같다.', '대륙 지각이 밀도가 더 크다.'], a: 2, why: '대륙 지각은 두껍고 가벼운 화강암질, 해양 지각은 얇고 무거운 현무암질.' },
    { q: '지권에서 부피가 가장 큰 층과 액체 상태인 층을 차례로 옳게 쓴 것은?', opts: ['지각, 맨틀', '맨틀, 외핵', '맨틀, 내핵', '외핵, 내핵', '지각, 외핵'], a: 1, why: '맨틀은 지권 부피의 약 80%, 액체는 <b>외핵</b>뿐.' },
    { q: '생물권에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 기권·수권·지권에 걸쳐 있다.', 'ㄴ. 사람도 생물권에 든다.', 'ㄷ. 땅 위에만 있다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '생물은 땅 위뿐 아니라 <b>바닷속과 공기 중</b>에도 산다(ㄷ ×).' },
  ]));
  part('sum1', (root) => window.RxT.sum(root));
  part('check1', (root) => { window.LessonParts.mountWrap(root); });
})();
