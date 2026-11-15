/* 3-3-3 2차시 «전사와 번역»(교과서 156~158쪽 + 참고서): 옛 1차시에서 전사·번역 부분을 떼어 낸 차시.
   차례(7장): 표지(염기 묶음의 가짓수) → 이론(전사와 번역) → 체험(3D 핵에서 라이보솜까지) → 체험(염기 짝 맞추고 코돈 읽기) → 문제로 다지기 → 정리 → 확인. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const J = (m, root) => window.EthTrack.join(m, window.L1.frame(root));
  part('cover', (root) => {
    const m = window.Cov.mount(root, 'triple'), fr = window.L1.frame(root), btns = [...root.querySelectorAll('.share-opts button')];
    btns.forEach((b) => b.addEventListener('click', () => { const on = b.getAttribute('aria-pressed') !== 'true'; btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b))); }));
    const answer = (on) => root.querySelector('#pr-c').classList.toggle('answer', on);
    return { fit: m.fit, setActive(on) { m.setActive(on); fr.setActive(on); }, fragment(f, on) { if (f.dataset.anim === 'au') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="au"]'); answer(!!f && f.classList.contains('visible')); } };
  });
  part('fltheory', (root) => window.RxT.stepper(root));
  part('dnarna', (root) => window.Labs.mount(root, 'dnarna'));
  part('tx3d', (root) => window.Tx3D.mount(root));
  part('rnacopies', (root) => window.Labs.mount(root, 'copies'));
  part('codon', (root) => J(window.Codon.mount(root), root));
  part('samedna', (root) => window.Labs.mount(root, 'cells'));
  part('drill7', (root) => window.Drill.mount(root, [
    { q: '세포 내 유전정보의 흐름과 장소의 짝으로 옳은 것은?', opts: ['전사 — 세포막', '전사 — 핵, 번역 — 세포질의 라이보솜', '번역 — 핵', '전사 — 골지체', '번역 — 마이토콘드리아만'], a: 1, why: 'DNA는 핵 밖으로 나가지 않는다 — 전사는 <b>핵</b>, 번역은 <b>라이보솜</b>.' },
    { q: 'DNA 한 가닥의 염기 서열이 TAC CGA일 때 전사된 RNA의 서열은?', opts: ['TAC CGA', 'ATG GCT', 'AUG GCU', 'UAC CGA', 'AUC GCU'], a: 2, why: 'T→A, A→U, C→G, G→C — RNA에는 T 대신 <b>U</b>.' },
    { q: '코돈을 설명한 것으로 옳은 것만 고른 것은?', box: ['ㄱ. RNA에서 아미노산 하나를 정하는 연속된 염기 3개이다.', 'ㄴ. 모두 64가지이다.', 'ㄷ. DNA에 있는 3염기조합과 같은 말이다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '3염기조합은 <b>DNA</b>, 코돈은 <b>RNA</b>(ㄷ ×).' },
    { q: '염기 4종류로 아미노산 20종류를 모두 정하려면 염기를 적어도 몇 개씩 묶어 읽어야 하는가?', opts: ['1개', '2개', '3개', '4개', '5개'], a: 2, why: '1개 4가지, 2개 16가지, 3개 <b>64가지</b> — 20종류를 넘는 것은 3개부터.' },
    { q: '전사와 번역을 견준 것으로 옳은 것은?', opts: ['전사는 RNA로 단백질을 만드는 과정이다.', '번역은 DNA의 정보를 RNA로 옮기는 과정이다.', '전사로 RNA가, 번역으로 단백질이 만들어진다.', '전사와 번역은 모두 핵 안에서 일어난다.', '번역에는 라이보솜이 필요하지 않다.'], a: 2, why: 'DNA → (전사) → <b>RNA</b> → (번역) → <b>단백질</b>.' },
  ]));
  part('sum7', (root) => window.RxT.sum(root));
  part('check7', (root) => { window.LessonParts.mountWrap(root); });
})();
