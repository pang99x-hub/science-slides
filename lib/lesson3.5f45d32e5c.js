/* 3-3-2 1차시 «세포막과 확산»(교과서 150~151쪽 + 참고서): 장마다 조각을 붙인다.
   차례(8장): 표지(배추 절이기, 사건 파일 23) → 이론(세포막의 구조와 선택적 투과성) → 체험(3D 세포막) → 이론(확산)
   → 체험(분자는 어디로 갈까?) → 문제로 다지기 → 정리 → 확인. 삼투는 2차시(lesson6)로 옮겼다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const J = (m, root) => window.EthTrack.join(m, window.L1.frame(root));
  part('cover', (root) => {
    const st = window.Salt.mount(root), fr = window.L1.frame(root), btns = [...root.querySelectorAll('.share-opts button')];
    btns.forEach((b) => b.addEventListener('click', () => { const on = b.getAttribute('aria-pressed') !== 'true'; btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b))); }));
    const answer = (on) => root.querySelector('#pr-b').classList.toggle('answer', on);
    return { fit: st.fit, setActive(on) { st.setActive(on); fr.setActive(on); }, fragment(f, on) { if (f.dataset.anim === 'sl') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="sl"]'); answer(!!f && f.classList.contains('visible')); } };
  });
  part('smtheory', (root) => window.RxT.stepper(root));
  part('membrane3d', (root) => window.Membrane3D.mount(root));
  part('dftheory', (root) => window.RxT.stepper(root));
  part('diffink', (root) => window.Labs.mount(root, 'ink'));
  part('diffuse', (root) => J(window.Diffuse.mount(root), root));
  part('kidney', (root) => window.Labs.mount(root, 'kidney'));
  part('drill3', (root) => window.Drill.mount(root, [
    { q: '세포막을 설명한 것으로 옳은 것만 고른 것은?', box: ['ㄱ. 주성분은 인지질과 단백질이다.', 'ㄴ. 세포 안팎으로 드나드는 물질을 조절한다.', 'ㄷ. 모든 물질을 같은 빠르기로 통과시킨다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '물질의 종류·크기에 따라 다른 <b>선택적 투과성</b>(ㄷ ×).' },
    { q: '인지질 2중층에서 인지질의 배열로 옳은 것은?', opts: ['머리끼리 마주 보고 꼬리가 물 쪽을 향한다.', '꼬리끼리 마주 보고 머리가 물 쪽을 향한다.', '머리와 꼬리가 번갈아 놓인다.', '모두 한 방향으로 한 줄만 놓인다.', '머리만 있고 꼬리는 없다.'], a: 1, why: '친수성 머리는 물 쪽, 소수성 <b>꼬리끼리</b> 안쪽.' },
    { q: '막단백질을 설명한 것 중 틀린 것은?', opts: ['라이보솜에서 만들어진다.', '물질이 지나가는 통로가 되는 것도 있다.', '인지질이 움직여 자리를 옮길 수 있다.', '특정 물질만 통과시키는 것이 있다.', '세포막 안에 단단히 고정되어 움직이지 않는다.'], a: 4, why: '세포막은 <b>유동성</b>이 있어 단백질도 움직인다.' },
    { q: '인지질 2중층을 직접 통과하기 가장 쉬운 물질은?', opts: ['포도당', '나트륨 이온', '산소', '단백질', '칼륨 이온'], a: 2, why: '작고 전하가 없는 <b>산소</b>.' },
    { q: '확산의 예로 옳지 않은 것은?', opts: ['허파꽈리와 모세혈관 사이의 기체 교환', '혈액의 포도당이 조직세포로 들어감', '향수 냄새가 방 안에 퍼짐', '물에 떨어뜨린 잉크가 퍼짐', '소화된 단백질이 큰 분자 그대로 세포막을 뚫고 들어감'], a: 4, why: '단백질 같은 큰 분자는 <b>확산하지 못한다</b>.' },
    { q: '세포막 안팎의 농도 차에 따른 이동 속도 그래프에서, 농도 차가 커져도 어느 순간부터 속도가 더 빨라지지 않는 것은?', opts: ['인지질 2중층을 통한 확산', '막단백질을 통한 확산', '두 방식 모두', '두 방식 모두 아님', '알 수 없다'], a: 1, why: '통로 단백질이 모두 쓰이면 <b>더 빨라지지 않는다</b>.' },
  ]));
  part('sum3', (root) => window.RxT.sum(root));
  part('check3', (root) => { window.LessonParts.mountWrap(root); });
})();
