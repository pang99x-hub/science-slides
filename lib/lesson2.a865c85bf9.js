/* 3-1 2차시 「빅데이터의 활용」(교과서 134~141쪽): 장마다 조각을 붙인다.
   차례(2026-10-31 보완, 기존 5장을 모두 살리고 5장을 더함, 10장 · 설명 순서는 학습지 개념 순서 «실시간 측정 → 빅데이터 → 활용·장단점»):
   표지(사건 파일 2) → 이론(센서·피지컬 컴퓨팅, 사진) → 체험(소리 측정기) → 이론(빅데이터, Manim + 먼저 보고 놀라기)
   → 체험(쌓인 데이터의 쓰임·데이터 센터) → 이론(활용과 장점·문제점, 사진+표) → 체험(자세히 볼수록) → 미니 게임 → 정리(뒤집기 카드) → 확인(+ 사건 파일 2 풀기).
   예측(.share-opts)·확인 ○×(.qs)는 수업방 응답 모으기가 읽는다. #sound·#sensor·#use의 data-word는 «한 낱말 묻기»에 미리 들어간다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const { track, rows, single } = window.U31;

  // 1. 표지: 가상 태풍의 예보 범위 + 예측(네 번째 단계에서 답 표시) · 사건 파일 2는 확인 장에서 푼다
  part('cover', (root) => {
    window.TyphoonMap.mount(root);
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector('#pr-data').classList.toggle('answer', on);
    return {
      fragment(f, on) { if (f.dataset.anim === 'ty') answer(on); },
      sync(slide) { const f = slide.querySelector('[data-anim="ty"]'); answer(!!f && f.classList.contains('visible')); },
    };
  });

  // 2. 이론: 센서·피지컬 컴퓨팅 — 사진을 누르면 맞는 왼쪽 상자가 밝아진다
  part('sensor', (root) => { rows(root, '.lv-row'); return window.RxT.gallery(root); });

  // 3. 체험: 소리 측정기 — ① 소리 내기 ② 기준선 정하기 ③ 측정 간격 5초
  part('sound', (root) => {
    const m = window.SoundMeter.mount(root);
    const th = root.querySelector('.sd-thv'), iv = root.querySelector('.sd-num[data-k="int"]');
    const th0 = th.textContent.trim();
    let fired = false, moved = false;
    root.querySelectorAll('.sd-src').forEach((s) => s.addEventListener('click', () => { fired = true; }));
    track(root, () => {
      if (th.textContent.trim() !== th0) moved = true;
      return !fired ? 1 : !moved ? 2 : iv.textContent.trim() !== '5' ? 3 : 0;
    });
    return m;
  });

  // 4. 이론: 빅데이터 — Manim 단계 영상 + 먼저 보고 놀라기(실제 위성 영상)
  part('big', (root) => {
    const defs = [...root.querySelectorAll('.bg-def')];
    root.addEventListener('st-step', (e) => defs.forEach((d, i) => d.classList.toggle('on', i === (e.detail === 0 ? 0 : e.detail === 1 ? 1 : 2))));
    return window.RxT.join(window.RxT.stepper(root), window.RxPeek.mount(root));
  });

  // 5. 체험: 쌓인 데이터의 쓰임 — ① 카드 하나 ② 넷 다 ③ 친환경 운영
  part('bigdata', (root) => {
    const m = window.BigData.mount(root);
    track(root, () => {
      const u = root.querySelectorAll('.bd-use.used').length, e = root.querySelectorAll('.bd-eco.used').length;
      return u === 0 ? 1 : u < 4 ? 2 : e === 0 ? 3 : 0;
    });
    return m;
  });

  // 6. 이론: 활용과 장점·문제점 — 사진을 누르면 왼쪽 표의 같은 줄이 밝아진다
  part('use', (root) => { rows(root, '.use-tab tbody tr'); return window.RxT.gallery(root); });

  // 7. 체험: 자세히 볼수록 — ① 거리 단위 ② 한 사람 ③ 카드 나누기
  part('merit', (root) => {
    const m = window.MeritMap.mount(root);
    const z = root.querySelector('#mr-zoom');
    track(root, () => {
      const v = Number(z.value), p = root.querySelectorAll('.mr-card.placed').length;
      return v < 2 ? 1 : v < 3 ? 2 : p < 6 ? 3 : 0;
    });
    return m;
  });

  // 8. 미니 게임: 빅데이터 판정단(빠른 퀴즈)
  part('game2', (root) => window.SciGame.mount(root, {
    id: 'judge', title: '40초 빅데이터 판정단', seconds: 40,
    intro: '생활 속 장면 카드를 네 칸 중 하나로 판정!<br>«게임 시작»을 누르자',
    endSay: '틀린 카드는 «누구에게 좋은가, 무엇이 새어 나가나, 자료가 고른가, 스스로 따져 봤나?»로 다시 보자',
    items: [
      { q: '길 찾기 앱이 막히는 길을 피해 안내했다', a: 'good', why: '많은 이동 기록으로 빠른 길을 예측 → 장점.' },
      { q: '번역기가 문장을 상황에 맞게 옮겼다', a: 'good', why: '언어 빅데이터로 맥락을 배웠다 → 장점.' },
      { q: '유전체 자료로 걸리기 쉬운 병을 미리 알았다', a: 'good', why: '질병 예측과 맞춤 치료 → 장점.' },
      { q: '약물 자료를 분석해 신약 후보를 빨리 골랐다', a: 'good', why: '개발 기간을 줄인다 → 장점.' },
      { q: '배달 앱 기록이 새어 나가 집 주소가 알려졌다', a: 'priv', why: '모으고 관리하다 유출 → 개인 정보 위험.' },
      { q: '이름은 지웠지만 동선만 봐도 누구인지 알겠다', a: 'priv', why: '자세한 기록은 이름 없이도 사람을 드러낸다 → 사생활 침해.' },
      { q: '건강 앱의 수면 기록이 광고 회사로 넘어갔다', a: 'priv', why: '민감한 정보가 동의 없이 퍼졌다 → 개인 정보 위험.' },
      { q: '통화 기록이 유출돼 한 사람의 하루가 드러났다', a: 'priv', why: '유동 인구 분석의 그림자 → 사생활 침해.' },
      { q: '한 학교 자료만으로 전국 청소년 키를 예측했다', a: 'bias', why: '한쪽에 치우친 자료 → 결과도 치우친다(편향).' },
      { q: '잘못 입력된 기온 자료가 섞여 예보가 틀렸다', a: 'bias', why: '정확하지 않은 자료 → 잘못된 결과.' },
      { q: '남학생 사진만 배운 프로그램이 여학생을 못 알아봤다', a: 'bias', why: '배운 자료가 고르지 않았다 → 편향.' },
      { q: '가짜 후기가 섞여 엉뚱한 상품이 1등이 됐다', a: 'bias', why: '검증되지 않은 자료 → 틀린 분석.' },
      { q: '안내가 시키는 대로만 가다 막다른 길에 섰다', a: 'dep', why: '결과를 따져 보지 않았다 → 지나친 의존.' },
      { q: '추천 영상만 보다 비슷한 것만 보게 됐다', a: 'dep', why: '스스로 고르지 않고 맡겼다 → 지나친 의존.' },
      { q: '앱이 괜찮다 해서 아픈데도 병원에 안 갔다', a: 'dep', why: '예측도 틀릴 수 있다 → 지나친 의존.' },
      { q: '데이터가 많으니 무조건 맞다고 믿었다', a: 'dep', why: '많아도 틀릴 수 있다 → 비판적으로 따져 보기.' },
    ],
  }));

  part('sum2', (root) => window.RxT.sum(root));
  part('check2', (root) => { window.LessonParts.mountWrap(root); });
})();
