/* 2-1-1 1차시 「생태계구성요소」(교과서 72~73쪽): 장마다 조각을 붙인다.
   차례(2026-10-31 승인 틀로 다시 짬, 10장): 표지(사건 파일 1) → 이론(개체에서 생태계까지, 사진) → 체험(고리 넓히기)
   → 이론(생물요소와 비생물요소, 3D 연못) → 이론(생산자·소비자·분해자, Manim + 먼저 보고 놀라기) → 체험(해 보기 연못 나누기)
   → 미니 게임(빨리 가르기, 빠른 퀴즈) → 체험(분해자가 사라진 숲) → 정리(뒤집기 카드) → 확인(+ 사건 파일 1 풀기).
   예측(.share-opts)·확인 ○×(.qs)는 수업방 응답 모으기가 그대로 읽는다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const L1 = window.L1;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  // 체험 장 해 볼 일: 지금 단계 번호(0 = 끝)
  const mark = (root, n, max = 3) => { const ok = []; for (let k = 1; k <= max; k++) if (n === 0 || k < n) ok.push(k); L1.steps(root, n, ok); L1.done(root, n === 0); };
  window.EcoMark = mark;
  // 1. 표지: 두 밭 타임랩스 + 예측(답은 확인 장의 «사건 파일 1 풀기»에서)
  part('cover', (root) => {
    const w = window.WormBed.mount(root);
    single([...root.querySelectorAll('.share-opts button')]);
    return { setActive: w.setActive };
  });

  // 2. 이론: 개체에서 생태계까지 — 사진을 누르면 맞는 왼쪽 상자가 밝아진다
  part('lvl', (root) => {
    const rows = [...root.querySelectorAll('.lv-row')];
    root.querySelector('.gv').addEventListener('gv-pick', (e) => rows.forEach((x) => x.classList.toggle('on', x.dataset.k === e.detail.b.dataset.row)));
    return window.RxT.gallery(root);
  });

  // 3. 체험: 고리 넓히기 — ① 개체군에서 멈춤 ② 군집 ③ 생태계
  part('ring', (root) => {
    const m = window.EcoRing.mount(root) || {};
    const msg = root.querySelector('.rg-msg');
    const seen = new Set();
    const SAY = { ind: '아직 한 마리 — 고리를 조금 넓혀 사슴 무리를 품어 보자.', pop: '사슴만 여럿 → 한 종의 무리. 이번엔 다른 생물까지 품어 보자.', com: '여러 종이 함께 → 그런데 빛·물·흙은 아직 밖에 있다.', eco: '생물과 둘레 환경을 모두 품었다.' };
    const upd = () => {
      const lv = root.dataset.level || 'ind'; seen.add(lv);
      msg.textContent = SAY[lv];
      const n = !seen.has('pop') ? 1 : !seen.has('com') ? 2 : !seen.has('eco') ? 3 : 0;
      mark(root, n);
    };
    new MutationObserver(upd).observe(root, { attributes: true, attributeFilter: ['data-level'] });
    upd();
    return m;
  });

  // 4. 이론: 3D 연못
  part('comp', (root) => window.EcoPond3D.mount(root));

  // 5. 이론: 생산자·소비자·분해자 — Manim 단계 영상 + 먼저 보고 놀라기
  part('roles', (root) => {
    const defs = ['prod', 'cons', 'dec'];
    root.addEventListener('st-step', (e) => root.querySelectorAll('.rl-def').forEach((d) => d.classList.toggle('on', e.detail === 3 || d.classList.contains(defs[e.detail]))));
    return window.RxT.join(window.RxT.stepper(root), window.RxPeek.mount(root));
  });

  // 6. 체험: 해 보기 연못 나누기
  part('pond', (root) => {
    root.addEventListener('pd-prog', (e) => { const d = e.detail; mark(root, d.n === 15 ? 0 : d.abio < 5 ? 1 : d.bio < 10 ? 2 : 3); });
    return window.PondSort.mount(root);
  });

  // 7. 미니 게임: 생산자·소비자·분해자·비생물요소 빨리 가르기(빠른 퀴즈)
  part('game1', (root) => window.EcoGame.mount(root, {
    id: 'sort', title: '40초 빨리 가르기', seconds: 40,
    intro: '카드에 나온 것을 네 칸 중 하나로!<br>«게임 시작»을 누르자',
    endSay: '틀린 카드는 «살아 있나? → 어떻게 양분을 얻나?» 차례로 다시 물어보자',
    items: [
      { q: '화단의 민들레', a: 'prod', why: '잎으로 광합성을 해 양분을 만든다 → 생산자.' },
      { q: '그늘진 바위의 이끼', a: 'prod', why: '작아도 광합성을 하는 식물 → 생산자.' },
      { q: '바다의 미역', a: 'prod', why: '빛을 받아 양분을 만든다 → 생산자.' },
      { q: '물속의 식물 플랑크톤', a: 'prod', why: '광합성을 하는 아주 작은 생물 → 생산자.' },
      { q: '화단의 개미', a: 'cons', why: '다른 생물을 먹어서 양분을 얻는다 → 소비자.' },
      { q: '운동장의 참새', a: 'cons', why: '씨앗·곤충을 먹는다 → 소비자.' },
      { q: '갯벌의 게', a: 'cons', why: '작은 생물과 찌꺼기를 먹는다 → 소비자.' },
      { q: '물속의 동물 플랑크톤', a: 'cons', why: '식물 플랑크톤을 먹는다 → 소비자.' },
      { q: '소나무 곁의 송이버섯', a: 'dec', why: '버섯은 빛으로 양분을 못 만든다 → 분해자.' },
      { q: '빵에 핀 곰팡이', a: 'dec', why: '빵을 분해해 양분을 얻는다 → 분해자.' },
      { q: '흙 속의 세균', a: 'dec', why: '살아 있고, 사체를 분해한다 → 분해자(생물요소).' },
      { q: '운동장의 햇빛', a: 'abio', why: '살아 있지 않은 둘레 환경 → 비생물요소.' },
      { q: '화단의 흙', a: 'abio', why: '흙(토양)은 둘레 환경 → 비생물요소.' },
      { q: '어제 내린 빗물', a: 'abio', why: '물은 생물이 사는 환경 → 비생물요소.' },
      { q: '오늘 아침 기온', a: 'abio', why: '온도는 모양이 없어도 비생물요소.' },
      { q: '교실 창밖의 공기', a: 'abio', why: '공기는 둘레 환경 → 비생물요소.' },
    ],
  }));

  // 8. 체험: 분해자가 사라진 숲 — ① 그대로 두고 보기 ② 한쪽만 칠하기 ③ 전체 칠하기
  part('decomp', (root) => {
    const m = window.Decomp.mount(root) || {};
    const now = root.querySelector('.dc-now'), msg = root.querySelector('.dc-msg');
    let watched = false, half = false, tm = 0;
    const upd = () => {
      if (now.textContent.startsWith('칠한 곳')) half = true;
      const n = now.classList.contains('done') ? 0 : !watched && !half ? 1 : !half ? 2 : 3;
      msg.textContent = n === 1 ? '낙엽이 쌓이는 동안 흙 속 양분과 풀의 건강 막대를 보자.' : n === 2 ? '땅 한쪽만 문질러 분해자를 퍼뜨려 보자.' : n === 3 ? '칠한 쪽 풀만 짙어졌다 — 이제 바닥 전체를 칠하자.' : '낙엽이 삭고 흙이 검어져 풀이 다시 짙어졌다.';
      mark(root, n);
    };
    new MutationObserver(upd).observe(now, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    upd();
    return {
      setActive(on) {
        if (m.setActive) m.setActive(on);
        clearTimeout(tm);
        if (on && !watched) tm = setTimeout(() => { watched = true; upd(); }, 4000);
      },
    };
  });

  part('sum1', (root) => window.RxT.sum(root));
  part('check1', (root) => { window.LessonParts.mountWrap(root); });
})();
