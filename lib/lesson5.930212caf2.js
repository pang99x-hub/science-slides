/* 2-2-1 4차시 「DNA 이중 나선과 염기 서열」(교과서 84~87쪽 + 참고서 97~99쪽): 장마다 조각을 붙인다.
   차례(8장): 표지(맞은편 염기 붙이기) → 이론(이중 나선) → 체험(DNA 사다리 만들기, 탐구 86~87쪽) → 체험(3D DNA·RNA)
   → 체험(염기 비율 저울) → 문제로 다지기 → 정리 → 확인. 옛 3차시에서 나눠 옴. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  part('cover', (root) => {
    const m = window.Cov.mount(root, 'pair');
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector('#pr-t').classList.toggle('answer', on);
    return { fit: m.fit, setActive: m.setActive, fragment(f, on) { if (f.dataset.anim === 'au') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="au"]'); answer(!!f && f.classList.contains('visible')); } };
  });
  part('hxtheory', (root) => window.RxT.stepper(root));
  part('ladder', (root) => window.EthTrack.join(window.Ladder.mount(root), window.L1.frame(root)));
  part('dna3d', (root) => window.DNA3D.mount(root));
  part('ratio', (root) => window.Ratio.mount(root));
  part('unzip', (root) => window.EthTrack.join(window.More.mount(root, 'unzip'), window.L1.frame(root)));
  part('repair', (root) => window.EthTrack.join(window.More.mount(root, 'repair'), window.L1.frame(root)));
  part('drill5', (root) => window.Drill.mount(root, [
    { q: 'DNA 한 가닥의 염기 서열이 GTACCATG일 때 맞은편 가닥의 서열은?', opts: ['GTACCATG', 'CATGGTAC', 'CAUGGUAC', 'TGCAACGT', 'GTACGTAC'], a: 1, why: 'G↔C, T↔A로 바꾼다 → <b>CATGGTAC</b>. U는 RNA에만.' },
    { q: '두 가닥 DNA에서 아데닌(A)이 전체 염기의 20%일 때 구아닌(G)의 비율은?', opts: ['20%', '30%', '40%', '60%', '80%'], a: 1, why: 'A = T = 20% → G + C = 60% → <b>G = 30%</b>.' },
    { q: 'DNA 이중 나선 구조에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 당과 인산은 나선의 바깥쪽에 있다.', 'ㄴ. 염기는 나선의 안쪽에서 짝을 짓는다.', 'ㄷ. 두 가닥은 같은 염기끼리(A–A) 결합한다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '짝은 <b>A–T, G–C</b>(ㄷ ×).' },
    { q: '생명체마다 생김새 등 특성이 다른 까닭으로 가장 알맞은 것은?', opts: ['DNA의 당 종류가 생명체마다 달라서', 'DNA의 염기 서열이 생명체마다 달라서', 'DNA가 생명체마다 한 가닥 또는 두 가닥이어서', '생명체마다 염기가 4종류 또는 5종류여서', '인산의 수가 생명체마다 달라서'], a: 1, why: '정보는 <b>염기 서열</b>에 담긴다.' },
    { q: 'DNA 한 가닥의 염기가 A 3개, T 2개, G 4개, C 1개일 때 맞은편 가닥의 염기 수는?', opts: ['A 3, T 2, G 4, C 1', 'A 2, T 3, G 1, C 4', 'A 4, T 1, G 3, C 2', 'A 1, T 4, G 2, C 3', 'A 2, T 3, G 4, C 1'], a: 1, why: 'A 맞은편은 T, G 맞은편은 C → 맞은편 가닥은 <b>A 2, T 3, G 1, C 4</b>.' },
    { q: '사람의 DNA에서 아데닌(A)이 전체 염기의 30.4%이다. 사이토신(C)의 비율은?', opts: ['19.6%', '30.4%', '39.2%', '60.8%', '69.6%'], a: 0, why: 'A = T = 30.4% → G + C = 39.2% → <b>C = 19.6%</b>.' },
    { q: '어떤 두 가닥 DNA의 염기 수가 A 28, T 28, G 22, C 22이다. 옳은 것만 고른 것은?', box: ['ㄱ. A와 T의 수가 같은 것은 둘이 짝을 이루기 때문이다.', 'ㄴ. 이 DNA의 염기쌍은 모두 50쌍이다.', 'ㄷ. 한 가닥에 있는 A는 반드시 14개이다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '짝 규칙은 두 가닥 <b>사이</b>의 규칙 — 한 가닥 안의 A 수는 정해지지 않는다(ㄷ ×).' },
  ]));
  part('sum5', (root) => window.RxT.sum(root));
  part('check5', (root) => { window.LessonParts.mountWrap(root); });
})();
