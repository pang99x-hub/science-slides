/* 3-3-3 1차시 «유전자와 단백질»(교과서 154~155쪽 + 참고서): 장마다 조각을 붙인다.
   차례(6장): 표지(인슐린을 만드는 세균, 사건 파일 24) → 이론(유전자와 단백질) → 체험(유전자가 바뀌면 꽃 색이) → 문제로 다지기 → 정리 → 확인.
   전사·번역은 2차시(lesson7), 유전부호·단백질 만들기는 3차시(lesson8)로 옮겼다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const J = (m, root) => window.EthTrack.join(m, window.L1.frame(root));
  part('cover', (root) => {
    const st = window.Insulin.mount(root), fr = window.L1.frame(root), btns = [...root.querySelectorAll('.share-opts button')];
    btns.forEach((b) => b.addEventListener('click', () => { const on = b.getAttribute('aria-pressed') !== 'true'; btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b))); }));
    const answer = (on) => root.querySelector('#pr-b').classList.toggle('answer', on);
    return { fit: st.fit, setActive(on) { st.setActive(on); fr.setActive(on); }, fragment(f, on) { if (f.dataset.anim === 'is') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="is"]'); answer(!!f && f.classList.contains('visible')); } };
  });
  part('genezoom', (root) => window.Labs.mount(root, 'zoom'));
  part('gptheory', (root) => window.RxT.stepper(root));
  part('genefind', (root) => window.Labs.mount(root, 'genes'));
  part('protfold', (root) => window.Labs.mount(root, 'fold'));
  part('flower', (root) => window.Flower.mount(root));
  part('sickle', (root) => window.Labs.mount(root, 'sickle'));
  part('drill4', (root) => window.Drill.mount(root, [
    { q: '유전자를 설명한 것으로 옳은 것만 고른 것은?', box: ['ㄱ. 유전정보가 담긴 DNA의 특정 부위이다.', 'ㄴ. 한 분자의 DNA에는 유전자가 하나뿐이다.', 'ㄷ. 유전자의 정보로 단백질이 만들어진다.'], opts: ['ㄱ', 'ㄴ', 'ㄱ, ㄷ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: 'DNA 한 분자에 유전자가 <b>여럿</b> 있다(ㄴ ×).' },
    { q: '어떤 꽃에서 «효소 유전자 → ㉠ → 붉은 색소 → 붉은 꽃»의 과정이 일어난다. ㉠은?', opts: ['RNA가 저장된 염색체', '효소 단백질', '포도당', '인지질', '3염기조합'], a: 1, why: '유전자의 정보로 만든 <b>효소(단백질)</b>가 색소를 만든다.' },
    { q: '헤모글로빈 유전자의 염기 하나가 바뀌어 낫 모양 적혈구 빈혈증이 생기는 과정으로 옳은 것은?', opts: ['전사와 번역이 전혀 일어나지 않는다.', '바뀐 코돈 때문에 아미노산 하나가 달라져 단백질의 입체 구조와 기능이 바뀐다.', '단백질은 정상과 똑같다.', '적혈구의 세포막만 바뀐다.', 'RNA가 단백질로 바뀌지 않고 그대로 일한다.'], a: 1, why: '아미노산 배열이 바뀌면 <b>입체 구조</b>가 달라져 제 기능을 못 한다.' },
    { q: '유전자에 담긴 정보가 형질로 나타나기까지의 순서로 옳은 것은?', opts: ['단백질 → 유전자 → 형질', '유전자 → 단백질 → 형질', '형질 → 단백질 → 유전자', '유전자 → 형질 → 단백질', '단백질 → 형질 → 유전자'], a: 1, why: '유전자의 정보로 <b>단백질</b>이 만들어지고 단백질이 형질을 나타낸다.' },
  ]));
  part('sum4', (root) => window.RxT.sum(root));
  part('check4', (root) => { window.LessonParts.mountWrap(root); });
})();
