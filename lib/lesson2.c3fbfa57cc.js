/* 2-2-1 2차시 «단백질»(교과서 82~83쪽 + 참고서 94~96쪽): 장마다 조각을 붙인다.
   차례(11장): 표지(구슬 목걸이 접기, 사건 파일 10) → 이론(생명체를 이루는 탄소 화합물) → 체험(3D 아미노산)
   → 체험(펩타이드 결합 잇기) → 체험(사슬 접기와 변성) → 체험(3D 헤모글로빈·케라틴, 해 보기 83쪽) → 이론(단백질이 하는 일)
   → 미니 게임 → 문제로 다지기 → 정리 → 확인. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  part('cover', (root) => {
    const bd = window.Beads.mount(root);
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector('#pr-d').classList.toggle('answer', on);
    return { fit: bd.fit, setActive: bd.setActive, fragment(f, on) { if (f.dataset.anim === 'bd') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="bd"]'); answer(!!f && f.classList.contains('visible')); } };
  });
  part('bio', window.EthTrack.theory);
  part('prtheory', (root) => window.RxT.stepper(root));
  part('amino3d', (root) => window.Amino3D.mount(root));
  part('peptide', (root) => window.Peptide.mount(root));
  part('fold', (root) => window.EthTrack.join(window.Fold.mount(root), window.L1.frame(root)));
  part('hemo3d', (root) => window.Hemo3D.mount(root));
  part('work', window.EthTrack.theory);
  part('game2', (root) => window.EthGame.mount(root, {
    id: 'biomol', title: '40초 무엇으로 되어 있나?', seconds: 40,
    intro: '기본 단위체를 떠올리자!<br>«게임 시작»을 누르자',
    endSay: '아미노산 → 단백질 · 뉴클레오타이드 → 핵산 · 포도당 → 녹말',
    items: [
      { q: '머리카락의 케라틴', a: 'pro', why: '아미노산이 이어진 섬유 단백질.' },
      { q: '적혈구의 헤모글로빈', a: 'pro', why: '산소를 나르는 단백질.' },
      { q: '소화를 돕는 효소', a: 'pro', why: '효소의 주성분은 단백질.' },
      { q: '몸을 지키는 항체', a: 'pro', why: '항체도 단백질.' },
      { q: '혈당을 낮추는 인슐린', a: 'pro', why: '호르몬 — 단백질로 된 것.' },
      { q: '아미노산이 펩타이드 결합으로 이어진 것', a: 'pro', why: '그것이 단백질.' },
      { q: 'DNA', a: 'nuc', why: '유전 정보를 저장하는 핵산.' },
      { q: 'RNA', a: 'nuc', why: '정보를 전하고 단백질 합성에 관여하는 핵산.' },
      { q: '뉴클레오타이드가 길게 이어진 것', a: 'nuc', why: '핵산.' },
      { q: '인이 들어 있고 유전 정보를 담는 것', a: 'nuc', why: '핵산(C·H·O·N·P).' },
      { q: '쌀의 녹말', a: 'car', why: '포도당이 이어진 탄수화물.' },
      { q: '포도당', a: 'car', why: '탄수화물 — 주된 에너지원.' },
      { q: '식물 세포벽의 셀룰로스', a: 'car', why: '포도당이 이어진 탄수화물.' },
      { q: '버터·식용유', a: 'lip', why: '지질.' },
      { q: '세포막의 인지질', a: 'lip', why: '지질의 한 종류.' },
      { q: '피부 밑에 쌓인 지방', a: 'lip', why: '에너지를 저장하는 지질.' },
      { q: '열을 받으면 구조가 풀려 기능을 잃는 것', a: 'pro', why: '단백질의 변성.' },
      { q: '약 20종류의 단위체가 배열을 바꿔 수만 가지가 되는 것', a: 'pro', why: '아미노산 20종 → 단백질.' },
    ],
  }));
  part('drill2', (root) => window.Drill.mount(root, [
    { q: '생명체를 구성하는 물질에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 단백질·핵산·탄수화물·지질은 모두 탄소 화합물이다.', 'ㄴ. 단백질에는 질소가 있지만 핵산에는 질소가 없다.', 'ㄷ. 단백질과 핵산은 작은 단위가 되풀이해 이어진 큰 분자이다.'], opts: ['ㄱ', 'ㄴ', 'ㄱ, ㄷ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '핵산에도 <b>질소</b>가 있다(염기). 인까지 들어 있다.' },
    { q: '아미노산을 설명한 것 중 틀린 것은?', opts: ['단백질의 기본 단위체이다.', '가운데 탄소에 아미노기와 카복실기가 붙어 있다.', '곁사슬에 따라 종류가 달라진다.', '생명체의 단백질을 이루는 것은 약 20종류이다.', '아미노산 하나만으로 유전 정보를 저장한다.'], a: 4, why: '유전 정보 저장은 <b>핵산</b>의 일.' },
    { q: '펩타이드 결합에 대한 설명으로 옳은 것만 고른 것은?', box: ['ㄱ. 이웃한 두 아미노산 사이의 공유 결합이다.', 'ㄴ. 결합할 때 물 분자 1개가 빠져나온다.', 'ㄷ. 뉴클레오타이드끼리도 펩타이드 결합으로 이어진다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '펩타이드 결합은 <b>아미노산</b> 사이에서만(ㄷ ×).' },
    { q: '아미노산 50개가 한 줄로 이어진 폴리펩타이드에서 펩타이드 결합의 수와 빠져나온 물 분자 수는?', opts: ['50개, 50개', '49개, 49개', '49개, 50개', '50개, 49개', '25개, 25개'], a: 1, why: 'n개를 잇는 연결은 <b>n−1</b> — 결합마다 물 1개.' },
    { q: '단백질이 만들어지는 순서로 옳은 것은?', opts: ['아미노산 → 폴리펩타이드 → 펩타이드 결합 → 단백질', '아미노산 → 펩타이드 결합으로 연결 → 폴리펩타이드 → 접혀 입체 구조의 단백질', '폴리펩타이드 → 아미노산 → 단백질 → 접힘', '뉴클레오타이드 → 아미노산 → 단백질', '단백질 → 아미노산 → 폴리펩타이드'], a: 1, why: '잇고(펩타이드 결합) → 긴 사슬(폴리펩타이드) → <b>접혀</b> 단백질.' },
    { q: '아미노산은 약 20종류인데 단백질은 셀 수 없이 많은 까닭으로 가장 알맞은 것은?', opts: ['아미노산이 몸속에서 새 종류로 바뀌어서', '아미노산의 종류·수·배열 순서의 조합이 아주 많아서', '단백질마다 다른 원소로 이루어져서', '펩타이드 결합의 종류가 수만 가지여서', '물 분자가 섞이는 양이 달라서'], a: 1, why: '글자 20개로 수많은 단어를 쓰듯 <b>조합</b>이 무수히 많다.' },
    { q: '헤모글로빈과 케라틴에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 둘 다 아미노산이 펩타이드 결합으로 이어진 단백질이다.', 'ㄴ. 아미노산의 배열이 달라 입체 구조가 다르다.', 'ㄷ. 구조가 달라도 하는 일은 같다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '헤모글로빈은 산소 운반, 케라틴은 머리카락·손톱 — <b>기능도 다르다</b>.' },
    { q: '단백질이 하는 일로 옳지 않은 것은?', opts: ['몸의 근육·머리카락을 이룬다.', '효소로서 화학 반응을 돕는다.', '항체로서 몸을 지킨다.', '호르몬으로서 생리 작용을 조절한다.', '유전 정보를 저장해 자손에게 전한다.'], a: 4, why: '유전 정보는 <b>핵산</b>(DNA)이 저장한다.' },
    { q: '달걀을 삶으면 흰자가 하얗게 굳는 현상에 대해 옳은 것은?', opts: ['단백질이 탄수화물로 바뀐다.', '아미노산 배열 순서가 바뀐다.', '열 때문에 단백질의 입체 구조가 풀린다.', '펩타이드 결합이 모두 새로 생긴다.', '식히면 원래대로 돌아간다.'], a: 2, why: '배열은 그대로, <b>입체 구조</b>가 풀려 기능을 잃는 변성 — 돌아가지 않는다.' },
  ]));
  part('sum2', (root) => window.RxT.sum(root));
  part('check2', (root) => { window.LessonParts.mountWrap(root); });
})();
