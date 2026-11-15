/* 3-3-1 3차시 «효소 실험과 활용»(교과서 147~149쪽 + 참고서): 옛 2차시에서 실험·반응 속도·활용을 떼어 낸 차시.
   차례(7장): 표지(과산화 수소수와 감자) → 체험(감자즙으로 효소 실험) → 체험(효소가 일하는 빠르기) → 이론(생활 속 효소) → 문제로 다지기 → 정리 → 확인. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const J = (m, root) => window.EthTrack.join(m, window.L1.frame(root));
  part('cover', (root) => {
    const m = window.Cov.mount(root, 'potato'), fr = window.L1.frame(root), btns = [...root.querySelectorAll('.share-opts button')];
    btns.forEach((b) => b.addEventListener('click', () => { const on = b.getAttribute('aria-pressed') !== 'true'; btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b))); }));
    const answer = (on) => root.querySelector('#pr-b').classList.toggle('answer', on);
    return { fit: m.fit, setActive(on) { m.setActive(on); fr.setActive(on); }, fragment(f, on) { if (f.dataset.anim === 'au') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="au"]'); answer(!!f && f.classList.contains('visible')); } };
  });
  part('catalase', (root) => J(window.Catalase.mount(root), root));
  part('enzfair', (root) => window.Labs.mount(root, 'fair'));
  part('rate', (root) => J(window.Rate.mount(root), root));
  part('enzph', (root) => window.Labs.mount(root, 'ph'));
  part('uses', window.EthTrack.theory);
  part('enzchew', (root) => window.Labs.mount(root, 'chew'));
  part('drill5', (root) => window.Drill.mount(root, [
    { q: '기포가 멈춘 감자즙 시험관에 과산화 수소수를 더 넣었더니 다시 기포가 생겼다. 알 수 있는 것은?', opts: ['효소가 반응 뒤에도 변하지 않고 남아 있다.', '과산화 수소가 효소로 바뀌었다.', '감자즙에 에탄올이 생겼다.', '효소가 변성되었다.', '반응열이 커졌다.'], a: 0, why: '효소는 <b>재사용</b>된다.' },
    { q: '3 % 과산화 수소수에 증류수, 감자즙을 각각 넣고 3 % 에탄올에 감자즙을 넣었다. 기포가 많이 생기는 것은?', opts: ['과산화 수소수 + 증류수', '과산화 수소수 + 감자즙', '에탄올 + 감자즙', '셋 다 같다', '셋 다 생기지 않는다'], a: 1, why: '감자즙의 <b>카탈레이스</b>가 과산화 수소를 물과 산소로 빠르게 나눈다.' },
    { q: '생감자 대신 삶은 감자를 넣으면 기포가 거의 생기지 않는 까닭은?', opts: ['감자의 녹말이 사라져서', '카탈레이스가 열에 변성되어서', '과산화 수소가 증발해서', '반응열이 커져서', '효소가 너무 많아져서'], a: 1, why: '열로 입체 구조가 망가지는 <b>변성</b>.' },
    { q: '효소의 양이 일정할 때 기질 농도를 계속 늘렸더니 초기 반응 속도가 어느 순간부터 더 빨라지지 않았다. 까닭은?', opts: ['기질이 효소를 변성시켜서', '모든 효소가 기질과 결합해 쉬는 효소가 없어서', '활성화에너지가 커져서', '반응열이 줄어서', '생성물이 사라져서'], a: 1, why: '효소가 모두 바쁘다 — 더 빠르게 하려면 <b>효소</b>를 늘린다.' },
    { q: '효소를 활용한 예와 분야의 짝으로 옳지 않은 것은?', opts: ['식혜 — 식품', '효소 세제 — 생활용품', '혈당 측정기 — 의약', '폐수 정화 — 환경', '소화제 — 산업'], a: 4, why: '소화제는 <b>의약</b> 분야.' },
    { q: '감자즙의 카탈레이스가 과산화 수소를 분해할 때 생기는 물질은?', opts: ['물과 산소', '물과 이산화 탄소', '에탄올과 산소', '포도당과 물', '수소와 질소'], a: 0, why: '과산화 수소 → <b>물 + 산소</b>. 올라오는 기포가 산소다.' },
  ]));
  part('sum5', (root) => window.RxT.sum(root));
  part('check5', (root) => { window.LessonParts.mountWrap(root); });
})();
