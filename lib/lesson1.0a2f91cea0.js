/* 3-1 1차시 「감염병 진단과 과학의 유용성」(교과서 130~133쪽): 장마다 조각을 붙인다.
   차례(2026-10-31 보완, 기존 6장을 모두 살리고 6장을 더함, 12장): 표지(사건 파일 1) → 이론(감염병과 병원체, 사진) → 이론(단백질·핵산 진단, Manim + 먼저 보고 놀라기)
   → 체험(탐구 1 4홈판) → 체험(탐구 2 증폭) → 이론(추적과 관리, 사진) → 체험(진단·추적 장비) → 이론(미래 문제와 과학, 사진+표)
   → 체험(미래 도시) → 미니 게임(빠른 퀴즈) → 정리(뒤집기 카드) → 확인(+ 사건 파일 1 풀기).
   예측·감염자 고르기(.share-opts)·확인 ○×(.qs)는 수업방 응답 모으기가 그대로 읽는다. #future·#path의 data-word는 «한 낱말 묻기»에 미리 들어간다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const { track, rows, single } = window.U31;

  // 1. 표지: 3D 병원체 모형 + 예측(네 번째 단계에서 답 표시) · 사건 파일 1은 확인 장에서 푼다
  part('cover', (root) => {
    const v = window.VirusModel.mount(root);
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector('#pr-tech').classList.toggle('answer', on);
    return {
      setActive: v.setActive, fit: v.fit,
      fragment(f, on) { if (f.dataset.anim === 'vi') answer(on); },
      sync(slide) { const f = slide.querySelector('[data-anim="vi"]'); answer(!!f && f.classList.contains('visible')); },
    };
  });

  // 2. 이론: 감염병과 병원체 — 사진을 누르면 맞는 왼쪽 상자가 밝아진다
  part('path', (root) => { rows(root, '.lv-row'); return window.RxT.gallery(root); });

  // 3. 이론: 두 진단 검사 — Manim 단계 영상 + 먼저 보고 놀라기(실제 검사 영상)
  part('test', (root) => {
    const defs = [...root.querySelectorAll('.tt-def')];
    root.addEventListener('st-step', (e) => {
      const k = e.detail, on = k <= 1 ? ['ag', 'abd'] : ['pcr'];
      defs.forEach((d) => d.classList.toggle('on', on.some((c) => d.classList.contains(c))));
    });
    return window.RxT.join(window.RxT.stepper(root), window.RxPeek.mount(root));
  });

  // 4. 체험: 탐구 1 — ① 포획 항체 ② 진단 시료 ③ 검출 시약·진단 반응물
  part('well', (root) => {
    single([...root.querySelectorAll('.share-opts button')]);
    const m = window.WellPlate.mount(root);
    track(root, () => { if (root.classList.contains('wl-done')) return 0; const s = root._well ? root._well.step : 0; return s === 0 ? 1 : s === 1 ? 2 : 3; });
    return m;
  });

  // 5. 체험: 탐구 2 — ① 돌리기 시작 ② 10번 넘게 ③ 30번
  part('pcr', (root) => {
    single([...root.querySelectorAll('.share-opts button')]);
    const m = window.PcrAmp.mount(root);
    const cnt = root.querySelector('.pc-count');
    track(root, () => { if (root.classList.contains('pc-done')) return 0; const n = parseInt((cnt.textContent.match(/\d+/) || ['0'])[0], 10); return n === 0 ? 1 : n < 10 ? 2 : 3; });
    return m;
  });

  // 6. 이론: 추적과 관리 — 사진을 누르면 맞는 왼쪽 상자가 밝아진다
  part('trace', (root) => { rows(root, '.lv-row'); return window.RxT.gallery(root); });

  // 7. 체험: 진단·추적 장비 — ① 자가 진단 도구·PCR ② 염기순서분석기 ③ 추적 지도
  part('diag', (root) => {
    const m = window.DiagTrace.mount(root);
    const st = (k) => root.querySelector(`.dg-st[data-k="${k}"]`).classList.contains('done');
    const day = root.querySelector('#dg-day');
    track(root, () => (!(st('kit') && st('pcr')) ? 1 : !st('seq') ? 2 : Number(day.value) < Number(day.max) ? 3 : 0));
    return m;
  });

  // 8. 이론: 미래 사회 문제와 과학 — 사진을 누르면 왼쪽 표의 같은 줄이 밝아진다
  part('need', (root) => { rows(root, '.nd-tab tbody tr'); return window.RxT.gallery(root); });

  // 9. 체험: 미래 도시 — ① 문제 눌러 보기 ② 기술 붙이기 ③ 넷 다
  part('future', (root) => {
    const m = window.FutureCity.mount(root);
    const it = root.querySelector('.ft-it'), sc = root.querySelector('.ft-score');
    track(root, () => {
      const n = parseInt((sc.textContent.match(/\d+/) || ['0'])[0], 10);
      if (n >= 4) return 0;
      return n === 0 && it.textContent.trim() === '문제를 눌러 보자' ? 1 : n < 3 ? 2 : 3;
    });
    return m;
  });

  // 10. 미니 게임: 무엇으로 찾았나(빠른 퀴즈)
  part('game1', (root) => window.SciGame.mount(root, {
    id: 'find', title: '40초 무엇으로 찾았나', seconds: 40,
    intro: '장면 카드를 보고 쓰인 기술을 네 칸 중 하나로!<br>«게임 시작»을 누르자',
    endSay: '틀린 카드는 «찾는 것이 단백질? 핵산? 아니면 검사 뒤의 분석?» 차례로 다시 물어보자',
    items: [
      { q: 'T 줄에 붉은 선이 나타났다', a: 'prot', why: '띠의 항체가 바이러스 단백질을 붙잡았다 → 신속 항원 검사.' },
      { q: '집에서 몇 분 만에 결과를 봤다', a: 'prot', why: '간편하고 빠른 것이 신속 항원 검사의 장점.' },
      { q: '항체가 짝이 맞는 항원만 붙잡는다', a: 'prot', why: '항원-항체 반응 → 단백질을 찾는 면역 진단.' },
      { q: '병원체가 적으면 놓칠 수 있다', a: 'prot', why: '붙잡을 단백질이 적으면 줄이 흐리다 → 신속 항원 검사의 약점.' },
      { q: '1 → 2 → 4 → 8로 늘어난다', a: 'nuc', why: '핵산을 한 번 복제할 때마다 2배 → PCR 검사.' },
      { q: '30번 되풀이하면 약 10억 배', a: 'nuc', why: '2를 30번 곱한 만큼 → PCR 검사.' },
      { q: '아주 적은 병원체도 정확히 찾는다', a: 'nuc', why: '늘려서 찾으니 정확하다 → PCR 검사.' },
      { q: '결과가 나오기까지 시간이 더 든다', a: 'nuc', why: '복제를 여러 번 되풀이해야 한다 → PCR 검사의 약점.' },
      { q: '병원체에서 달라진 곳(변이)을 찾았다', a: 'seq', why: '핵산의 순서를 읽어 견준다 → 염기 순서 분석.' },
      { q: '병원체의 특징을 알아 백신을 만든다', a: 'seq', why: '유전 정보가 백신·치료제의 바탕 → 염기 순서 분석.' },
      { q: 'DNA 구조·복제의 원리를 이용했다', a: 'seq', why: '자동염기순서분석기에 쓰인 원리.' },
      { q: '치료제 개발의 단서를 얻었다', a: 'seq', why: '병원체의 특징을 알아야 치료제를 만든다 → 염기 순서 분석.' },
      { q: '확진자의 동선을 지도에 이었다', a: 'ai', why: '위치 기록을 분석 → 감염 경로 추적.' },
      { q: '다음에 퍼질 동네를 내다봤다', a: 'ai', why: '쌓인 이동 기록으로 예측 → 인공지능 추적.' },
      { q: '와이파이·위치 정보 기록을 모았다', a: 'ai', why: '정보 통신 기술로 동선을 파악 → 추적.' },
      { q: '세계의 유행 흐름을 내다봤다', a: 'ai', why: '전파 경로 예측에 인공지능을 쓴다.' },
    ],
  }));

  part('sum1', (root) => window.RxT.sum(root));
  part('check1', (root) => { window.LessonParts.mountWrap(root); });
})();
