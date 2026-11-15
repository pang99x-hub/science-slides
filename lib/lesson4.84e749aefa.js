/* 3-1-2 2차시 「화산 활동과 지구시스템」(교과서 116~118쪽 + 참고서 143~144쪽): 장마다 조각을 붙인다.
   차례(7장): 표지(피나투보 화산, 사건 파일 16) → 이론(화산 활동과 지구시스템) → 체험(화산이 터지면)
   → 체험(화산 피해 대책, 탐구 118쪽) → 문제로 다지기 → 정리 → 확인. 지진은 3차시(lesson6). */
(function () {
  'use strict';
  const { part } = window.Deck;
  const J = (m, root) => window.EthTrack.join(m, window.L1.frame(root));
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  part('cover', (root) => {
    const pn = window.Pinatubo.mount(root);
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector('#pr-a').classList.toggle('answer', on);
    return { fit: pn.fit, setActive: pn.setActive, fragment(f, on) { if (f.dataset.anim === 'pn') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="pn"]'); answer(!!f && f.classList.contains('visible')); } };
  });
  part('vltheory', (root) => window.RxT.stepper(root));
  part('sieve', (root) => window.EthTrack.join(window.More31.mount(root, 'sieve'), window.L1.frame(root)));
  part('volcano', (root) => J(window.Volcano.mount(root), root));
  part('watch', (root) => window.EthTrack.join(window.More31.mount(root, 'watch'), window.L1.frame(root)));
  part('plan', (root) => window.Plan.mount(root));
  part('geoheat', (root) => window.EthTrack.join(window.More31.mount(root, 'geo'), window.L1.frame(root)));
  part('drill4', (root) => window.Drill.mount(root, [
    { q: '화산 분출물에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 화산 가스는 대부분 수증기이다.', 'ㄴ. 화산에서 튀어나온 고체 알갱이는 크기별로 화산암괴·화산력·화산재·화산진으로 부른다.', 'ㄷ. 용암은 화산 폭발로 부서진 고체 알갱이이다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '부서진 고체 알갱이는 <b>화산 쇄설물</b>(ㄷ ×).' },
    { q: '화산 활동이 다른 권역에 주는 영향의 짝으로 옳지 않은 것은?', opts: ['기권 — 화산재가 햇빛을 가린다', '생물권 — 산성비가 생물 성장을 방해한다', '지권 — 용암이 새 땅을 만든다', '기권 — 화산 가스가 대기 성분을 바꾼다', '수권 — 화산재가 지구 평균 기온을 크게 올린다'], a: 4, why: '화산재는 햇빛을 가려 기온을 <b>낮춘다</b>.' },
    { q: '화산 활동이 주는 이로운 점만 고른 것은?', box: ['ㄱ. 오래 지나면 화산 둘레의 흙이 기름져진다.', 'ㄴ. 온천과 지열 발전에 쓰인다.', 'ㄷ. 화산 가스가 녹아든 산성비가 내린다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '산성비는 생물이 자라는 것을 <b>방해</b>한다(ㄷ ×).' },
    { q: '1991년 피나투보 화산이 터진 뒤 지구 평균 기온이 한동안 내려간 까닭은?', opts: ['성층권까지 올라간 화산재와 가스가 햇빛을 가려서', '용암이 바다를 식혀서', '화산이 땅속 열을 모두 써 버려서', '오존층이 두꺼워져서', '바닷물이 늘어나서'], a: 0, why: '지권의 변화가 <b>기권</b>을 거쳐 지구 전체로 번졌다.' },
    { q: '화산 분출이 가까워졌음을 알려 주는 낌새로 알맞지 않은 것은?', opts: ['작은 지진이 부쩍 잦아진다.', '화산 둘레 땅이 부풀어 오른다.', '땅의 온도가 오른다.', '화산 가스가 더 많이 나온다.', '화산 둘레 지하수가 얼어붙는다.'], a: 4, why: '마그마가 올라오면 땅이 <b>데워진다</b>. 지진·부풂·가스·온도 변화를 감시해 분출을 미리 안다.' },
    { q: '화산 피해 대책을 평가하는 기준과 그 뜻을 옳게 짝 지은 것은?', opts: ['현실성 — 비용이 알맞은가', '경제성 — 실제로 할 수 있는가', '체계성 — 감시·경보·대피가 이어지는가', '현실성 — 감시·경보·대피가 이어지는가', '경제성 — 감시·경보·대피가 이어지는가'], a: 2, why: '현실성은 실제로 할 수 있는가, 경제성은 비용, <b>체계성</b>은 감시 → 경보 → 대피의 이어짐.' },
    { q: '대책을 세워도 막기 어려운 화산 피해는?', opts: ['용암이 마을로 흘러드는 것', '주민이 제때 피하지 못하는 것', '비행기가 화산재 속을 나는 것', '대기로 퍼진 화산 가스와 화산재', '용암이 도로와 농경지를 덮는 것'], a: 3, why: '제방·수로·대피소·경보로 줄일 수 있지만, 대기로 나온 가스·재는 <b>막지 못한다</b>.' },
  ]));
  part('sum4', (root) => window.RxT.sum(root));
  part('check4', (root) => { window.LessonParts.mountWrap(root); });
})();
