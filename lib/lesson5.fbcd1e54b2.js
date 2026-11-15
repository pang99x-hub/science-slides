/* 3-1-1 2차시 「기권과 수권」(교과서 105~107쪽 + 참고서 124~126쪽): 장마다 조각을 붙인다.
   차례(9장): 표지(기구를 띄우면) → 이론(기권의 층상 구조) → 체험(기상 관측 기구) → 체험(바다 속 수온) → 이론(수권과 생물권 사진)
   → 미니 게임 → 문제로 다지기 → 정리 → 확인. 옛 1차시에서 나눠 옴. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const J = (m, root) => window.EthTrack.join(m, window.L1.frame(root));
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  part('cover', (root) => {
    const m = window.Cov.mount(root, 'alt');
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector('#pr-z').classList.toggle('answer', on);
    return { fit: m.fit, setActive: m.setActive, fragment(f, on) { if (f.dataset.anim === 'au') answer(on); }, sync(slide) { const f = slide.querySelector('[data-anim="au"]'); answer(!!f && f.classList.contains('visible')); } };
  });
  part('aitheory', (root) => window.RxT.stepper(root));
  part('balloon', (root) => J(window.Balloon.mount(root), root));
  part('ocean', (root) => J(window.Ocean.mount(root), root));
  part('hydro', window.EthTrack.theory);
  part('earthwater', (root) => window.EthTrack.join(window.More31.mount(root, 'water'), window.L1.frame(root)));
  part('game1', (root) => window.EthGame.mount(root, {
    id: 'atmos', title: '40초 기권의 어느 층?', seconds: 40,
    intro: '올라갈수록 추워질까, 더워질까?<br>«게임 시작»을 누르자',
    endSay: '기상 현상 대류권 · 오존층 성층권 · 유성 중간권 · 오로라 열권',
    items: [
      { q: '비·눈·구름 같은 기상 현상', a: 'tr', why: '수증기가 있고 대류가 일어나는 대류권.' },
      { q: '오존층이 자외선을 흡수한다', a: 'st', why: '오존층은 약 20~30 km, 성층권.' },
      { q: '유성이 빛나며 타 버린다', a: 'me', why: '중간권에서 공기와 부딪쳐 빛난다.' },
      { q: '오로라가 나타난다', a: 'th', why: '열권 — 태양에서 온 입자가 공기와 부딪쳐 빛난다.' },
      { q: '높이 올라갈수록 기온이 내려가고 기상 현상이 있다', a: 'tr', why: '대류권.' },
      { q: '높이 올라갈수록 기온이 올라가고 공기가 안정하다', a: 'st', why: '아래가 차고 위가 따뜻해 섞이지 않는 성층권.' },
      { q: '공기는 뒤섞이지만 수증기가 부족해 구름·비가 없다', a: 'me', why: '중간권.' },
      { q: '공기가 아주 희박하고 낮과 밤 기온 차가 매우 크다', a: 'th', why: '열권.' },
      { q: '높이 약 0~11 km', a: 'tr', why: '대류권(위도에 따라 다름).' },
      { q: '높이 약 11~50 km', a: 'st', why: '성층권.' },
      { q: '높이 약 50~80 km', a: 'me', why: '중간권.' },
      { q: '높이 80 km 위', a: 'th', why: '열권.' },
      { q: '태풍과 장마전선', a: 'tr', why: '기상 현상은 대류권에서.' },
      { q: '자외선을 막아 생명을 지키는 층', a: 'st', why: '오존층이 있는 성층권.' },
      { q: '국제 우주 정거장이 도는 높이', a: 'th', why: '약 400 km — 열권.' },
      { q: '기권에서 기온이 가장 낮은 곳이 있는 층', a: 'me', why: '중간권 꼭대기가 가장 춥다.' },
      { q: '대기 질량의 대부분(약 80%)이 모인 층', a: 'tr', why: '공기는 아래에 몰려 있다 — 대류권.' },
      { q: '태양 빛을 직접 흡수해 기온이 급격히 오르는 층', a: 'th', why: '열권.' },
    ],
  }));
  part('drill5', (root) => window.Drill.mount(root, [
    { q: '기권의 층에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 높이에 따른 기온 변화로 네 층을 나눈다.', 'ㄴ. 기상 현상은 대류권에서 나타난다.', 'ㄷ. 열권에서는 높이 올라갈수록 기온이 내려간다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '열권은 높이 올라갈수록 기온이 <b>올라간다</b>.' },
    { q: '성층권에서 높이 올라갈수록 기온이 올라가는 까닭은?', opts: ['구름이 많아서', '지표에서 멀어서', '오존층이 태양의 자외선을 흡수해서', '수증기가 많아서', '공기가 가장 많이 모여 있어서'], a: 2, why: '<b>오존</b>이 자외선을 흡수해 데워진다.' },
    { q: '해수의 층에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 깊이에 따른 수온 분포로 나눈다.', 'ㄴ. 수온 약층은 깊이에 따라 수온이 급격히 낮아진다.', 'ㄷ. 심해층은 계절에 따라 수온이 크게 바뀐다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '심해층은 햇빛이 닿지 않아 늘 차고 <b>거의 일정</b>하다.' },
    { q: '바다 위에 부는 바람이 강해지면 어떻게 될까?', opts: ['혼합층이 얇아진다.', '혼합층이 두꺼워진다.', '심해층이 사라진다.', '수온 약층이 두꺼워진다.', '바닷물의 양이 늘어난다.'], a: 1, why: '바람이 표층 물을 더 깊이 휘저어 <b>혼합층이 두꺼워진다</b>.' },
    { q: '기권의 성분과 역할에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 질소가 가장 많고 그다음이 산소이다.', 'ㄴ. 온실 효과로 지구의 기온을 알맞게 지킨다.', 'ㄷ. 공기가 희박한 열권은 낮과 밤 기온 차가 작다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '공기가 희박하면 열을 붙잡지 못해 열권은 낮밤 기온 차가 <b>매우 크다</b>(ㄷ ×).' },
    { q: '지구의 물에 대해 옳은 것만 고른 것은?', box: ['ㄱ. 해수가 97% 넘게 차지한다.', 'ㄴ. 육지의 물 가운데 가장 많은 것은 빙하이다.', 'ㄷ. 강과 호수의 물이 지하수보다 많다.'], opts: ['ㄱ', 'ㄷ', 'ㄱ, ㄴ', 'ㄴ, ㄷ', 'ㄱ, ㄴ, ㄷ'], a: 2, why: '육지의 물은 빙하 &gt; 지하수 &gt; <b>강·호수</b> 순(ㄷ ×).' },
    { q: '바다가 지구의 기온을 고르게 지켜 주는 까닭은?', opts: ['물은 비열이 커서 쉽게 데워지거나 식지 않아서', '바닷물이 짜서', '바다가 햇빛을 모두 반사해서', '바다 밑이 뜨거워서', '바닷물이 늘 얼어 있어서'], a: 0, why: '물은 <b>비열</b>이 크다 — 천천히 데워지고 천천히 식는다.' },
  ]));
  part('sum5', (root) => window.RxT.sum(root));
  part('check5', (root) => { window.LessonParts.mountWrap(root); });
})();
