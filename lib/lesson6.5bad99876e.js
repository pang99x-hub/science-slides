/* 3-3-2 2차시 «삼투»(교과서 151~153쪽 + 참고서): 옛 1차시에서 삼투 부분을 떼어 낸 차시.
   차례(9장): 표지(시든 잎과 맑은 물) → 이론(삼투) → 체험(삼투로 물이 움직인다) → 체험(양파 표피세포 관찰) → 체험(적혈구와 달걀의 삼투)
   → 미니 게임 → 문제로 다지기 → 정리 → 확인(사건 파일 23 풀기). */
(function () {
  'use strict';
  const { part } = window.Deck;
  const J = (m, root) => window.EthTrack.join(m, window.L1.frame(root));
  part('cover', (root) => {
    const m = window.Cov.mount(root, 'wilt'), fr = window.L1.frame(root), btns = [...root.querySelectorAll('.share-opts button')];
    btns.forEach((b) => b.addEventListener('click', () => { const on = b.getAttribute('aria-pressed') !== 'true'; btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b))); }));
    const answer = (on) => root.querySelector('#pr-b').classList.toggle('answer', on);
    return { fit: m.fit, setActive(on) { m.setActive(on); fr.setActive(on); }, fragment(f, on) { if (f.dataset.anim === 'au') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="au"]'); answer(!!f && f.classList.contains('visible')); } };
  });
  part('ostheory', (root) => window.RxT.stepper(root));
  part('osmosis', (root) => J(window.Osmosis.mount(root), root));
  part('onion', (root) => J(window.Onion.mount(root), root));
  part('potato', (root) => window.Labs.mount(root, 'potato'));
  part('rbc', (root) => window.RBC.mount(root));
  part('game3', (root) => window.EthGame.mount(root, {
    id: 'transport', title: '40초 어떻게 지나갈까?', seconds: 40,
    intro: '막을 바로, 통로로, 물만?<br>«게임 시작»을 누르자',
    endSay: '기체·지방산은 인지질 2중층 · 포도당·이온은 막단백질 · 농도 차로 물이 움직이면 삼투',
    items: [
      { q: '허파꽈리에서 모세혈관으로 산소가 들어간다', a: 'lip', why: '작고 전하 없는 기체 — 2중층을 바로.' },
      { q: '조직세포의 이산화 탄소가 혈액으로 나온다', a: 'lip', why: '기체는 인지질 사이로.' },
      { q: '지방산이 세포막을 지나간다', a: 'lip', why: '지질과 잘 섞인다.' },
      { q: '잎 세포로 이산화 탄소가 들어간다', a: 'lip', why: '작은 기체.' },
      { q: '광합성으로 생긴 산소가 잎 세포 밖으로 나간다', a: 'lip', why: '기체 — 2중층.' },
      { q: '혈액 속 포도당이 근육세포로 들어간다', a: 'prot', why: '크고 물과 잘 섞여 통로로.' },
      { q: '나트륨 이온(Na⁺)이 세포 안으로 들어온다', a: 'prot', why: '전하를 띠어 막단백질로.' },
      { q: '칼륨 이온(K⁺)이 세포 밖으로 나간다', a: 'prot', why: '이온 — 막단백질.' },
      { q: '아미노산이 세포 안으로 옮겨 간다', a: 'prot', why: '물에 녹는 분자 — 통로로.' },
      { q: '특정 물질만 골라 통과시키는 통로가 있다', a: 'prot', why: '막단백질마다 맡은 물질이 있다.' },
      { q: '증류수에 넣은 적혈구가 부풀다 터진다', a: 'osm', why: '물이 세포 안으로 — 삼투.' },
      { q: '소금에 절인 배추가 축 처진다', a: 'osm', why: '물이 진한 소금물 쪽으로 빠져나간다.' },
      { q: '뿌리털이 흙 속의 물을 빨아들인다', a: 'osm', why: '뿌리털 세포액이 더 진하다.' },
      { q: '과일에 설탕을 뿌려 두면 즙이 빠져나온다', a: 'osm', why: '물이 진한 설탕 쪽으로.' },
      { q: '진한 소금물 속 양파 세포에서 세포막이 세포벽에서 떨어진다', a: 'osm', why: '물이 빠져나가는 원형질분리.' },
      { q: '시든 채소를 맑은 물에 담그면 다시 싱싱해진다', a: 'osm', why: '물이 세포 안으로 들어와 팽팽해진다.' },
      { q: '민물고기를 바닷물에 넣으면 몸의 물이 빠져나간다', a: 'osm', why: '바깥이 더 진하다.' },
      { q: '병원에서 혈액과 농도가 같은 수액을 쓴다', a: 'osm', why: '등장액이라 적혈구 모양이 그대로.' },
    ],
  }));
  part('drill6', (root) => window.Drill.mount(root, [
    { q: '선택적 투과막으로 나눈 U자관 한쪽에 물, 다른 쪽에 설탕 용액을 넣었다. 시간이 지나면?', opts: ['설탕이 물 쪽으로 넘어가 높이가 같아진다.', '물이 설탕 용액 쪽으로 옮겨 가 그쪽 수면이 올라간다.', '물이 물 쪽으로 더 모인다.', '아무 변화도 없다.', '막이 터진다.'], a: 1, why: '설탕은 막을 못 지나고 물만 <b>진한 쪽</b>으로 — 삼투.' },
    { q: '적혈구를 증류수, 혈액과 농도가 같은 소금물, 진한 소금물에 각각 넣었다. 옳은 것은?', opts: ['증류수에서 쪼그라든다.', '같은 농도의 소금물에서 물이 전혀 드나들지 않는다.', '진한 소금물에서 부풀다 터진다.', '증류수에서 부풀다 터질 수 있다.', '세 용액 모두 모양이 같다.'], a: 3, why: '증류수에서는 물이 들어와 <b>터질 수 있다</b>(용혈). 같은 농도에서는 드나드는 양이 같다.' },
    { q: '진한 소금물에 넣은 양파 표피세포를 관찰했다. 옳은 것만 고른 것은?', box: ['ㄱ. 세포 안의 물이 밖으로 빠져나간다.', 'ㄴ. 세포막이 세포벽에서 떨어진다.', 'ㄷ. 세포벽이 없어 결국 터진다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '식물 세포는 <b>세포벽</b>이 받쳐 주어 터질 일이 없다. 고장액에서는 원형질분리(ㄷ ×).' },
    { q: '삼투로 설명할 수 있는 것만 고른 것은?', box: ['ㄱ. 배추를 소금에 절이면 숨이 죽는다.', 'ㄴ. 뿌리털이 흙의 물을 흡수한다.', 'ㄷ. 허파꽈리에서 산소가 혈액으로 들어간다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '산소가 들어가는 것은 기체의 <b>확산</b>(ㄷ ×).' },
    { q: '시든 채소를 맑은 물에 담가 두면 다시 싱싱해지는 까닭은?', opts: ['물이 세포 밖으로 빠져나가서', '물이 세포 안으로 들어가 세포가 팽팽해져서', '소금이 세포 안으로 들어가서', '세포벽이 녹아서', '세포막이 사라져서'], a: 1, why: '세포 안이 더 진하다 — <b>삼투</b>로 물이 안으로 들어온다.' },
  ]));
  part('sum6', (root) => window.RxT.sum(root));
  part('check6', (root) => { window.LessonParts.mountWrap(root); });
})();
