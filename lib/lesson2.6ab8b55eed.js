/* 2-1-1 2차시 「생물과 환경의 상호 관계」(교과서 74~75쪽): 장마다 조각을 붙인다.
   차례(2026-10-31 승인 틀로 다시 짬, 10장): 표지(사건 파일 2, 비버 댐) → 이론(환경이 생물을 바꾼다, 사진) → 체험(빛: 낮 길이)
   → 체험(온도: 여우) → 체험(물·토양: 선인장·함초) → 이론(생물이 환경을 바꾼다, Manim + 예측 걸기)
   → 체험(해 보기 화살표) → 미니 게임(어느 방향의 영향일까, 빠른 퀴즈) → 정리(뒤집기 카드) → 확인(+ 사건 파일 2 풀기).
   예측(.share-opts)·확인 ○×(.qs)는 수업방 응답 모으기가 그대로 읽는다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const L1 = window.L1;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  const mark = (root, n, max = 3) => { const ok = []; for (let k = 1; k <= max; k++) if (n === 0 || k < n) ok.push(k); L1.steps(root, n, ok); L1.done(root, n === 0); };
  // 상태를 0.3초마다 읽는 체험 장(장에 있을 때만)
  const poll = (fn) => { let t = 0; return { setActive(on) { clearInterval(t); if (on) { fn(); t = setInterval(fn, 300); } } }; };
  const join = (...ps) => window.RxT.join(...ps);

  // 1. 표지: 비버 댐 쌓기 + 예측(답은 확인 장의 «사건 파일 2 풀기»에서). 댐이 완성되는 순간 흔들림·진동
  part('cover', (root) => {
    const b = window.BeaverDam.mount(root);
    single([...root.querySelectorAll('.share-opts button')]);
    const now = root.querySelector('.bv-now'); let was = false;
    new MutationObserver(() => { const d = now.classList.contains('done'); if (d && !was) window.RxT.jolt(root.querySelector('.bv-stage'), 2); was = d; }).observe(now, { attributes: true, attributeFilter: ['class'] });
    return b;
  });

  // 2. 이론: 환경이 생물을 바꾼다 — 사진을 누르면 맞는 환경 줄이 밝아진다
  part('a2b', (root) => {
    const rows = [...root.querySelectorAll('.ab-row')];
    root.querySelector('.gv').addEventListener('gv-pick', (e) => rows.forEach((x) => x.classList.toggle('on', x.dataset.k === e.detail.b.dataset.row)));
    return window.RxT.gallery(root);
  });

  // 3. 체험: 빛 — ① 시금치 꽃대 ② 낮을 짧게 ③ 국화 꽃
  part('mum', (root) => {
    const m = window.MumDial.mount(root);
    const now = root.querySelector('.cm-now'), s1 = root.querySelector('.cm-state'), s2 = root.querySelector('.cm-state2'), msg = root.querySelector('.cm-msg');
    let spin = false, shortDay = false;
    const p = poll(() => {
      if (s2.textContent.startsWith('꽃대가 올라와')) spin = true;
      if (now.textContent.startsWith('낮이 짧은')) shortDay = true;
      const bloom = s1.textContent.startsWith('꽃이 활짝');
      const n = bloom && spin ? 0 : !spin && !shortDay ? 1 : !shortDay ? 2 : 3;
      msg.textContent = n === 1 ? '낮이 긴 날이 이어지면 시금치는 어떻게 될까? 며칠 지켜보자.' : n === 2 ? '시금치가 꽃대를 올렸다 — 이번엔 낮을 점선보다 짧게!' : n === 3 ? (bloom ? '국화가 피었다 — 시금치 꽃대도 보고 오자.' : '국화에 꽃눈이 생기는지 며칠 지켜보자.') : '낮이 길면 시금치, 짧으면 국화가 꽃을 피웠다.';
      mark(root, n);
    });
    return join(m, p);
  });

  // 4. 체험: 온도 — ① 추운 끝 ② 더운 끝 ③ 막대 견주기
  part('fox', (root) => {
    const m = window.FoxTemp.mount(root);
    const cards = { arctic: root.querySelector('.fx-card[data-k="arctic"]'), desert: root.querySelector('.fx-card[data-k="desert"]') };
    let cold = false, hot = false, tm = 0;
    const upd = () => {
      if (cards.arctic.classList.contains('on')) cold = true;
      if (cards.desert.classList.contains('on')) hot = true;
      if (cold && hot && !tm) tm = setTimeout(() => { tm = -1; upd(); }, 1800);
      mark(root, !cold ? 1 : !hot ? 2 : tm === -1 ? 0 : 3);
    };
    Object.values(cards).forEach((c) => new MutationObserver(upd).observe(c, { attributes: true, attributeFilter: ['class'] }));
    upd();
    return m;
  });

  // 5. 체험: 물·토양 — ① 마른 땅에 물 ② 짠 땅에 물 ③ 시드는 풀 찾기
  part('water', (root) => {
    const m = window.WaterSoil.mount(root);
    let dry = false, salt = false, seen = 0;
    const p = poll(() => {
      const pl = Object.fromEntries(root._ws.plants.map(([k, W, S]) => [k, { W, S }]));
      if (pl.cactus.S > 0.25 || pl.leafy.S > 0.25) dry = true;
      if (pl.glass.S > 0.25 || pl.plain.S > 0.25) salt = true;
      if (dry && salt && pl.plain.W < 0.3) seen++;
      mark(root, !dry ? 1 : !salt ? 2 : seen > 3 ? 0 : 3);
    });
    return join(m, p);
  });

  // 6. 이론: 생물이 환경을 바꾼다 — Manim 단계 영상 + 먼저 보고 놀라기
  part('b2a', (root) => { const st = window.RxT.stepper(root); window.RxBet.mount(root, (k) => k >= 1); return st; });

  // 7. 체험: 해 보기 화살표 — ① (가)(나) ② (다)(라) ③ 견주기
  part('arrows', (root) => {
    const m = window.ArrowCases.mount(root) || {};
    const now = root.querySelector('.ar-now');
    const upd = () => {
      const n = +(now.textContent.match(/^(\d) \/ 4/) || [0, 0])[1];
      mark(root, now.classList.contains('done') ? 0 : n < 2 ? 1 : 2);
    };
    new MutationObserver(upd).observe(now, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    upd();
    return m;
  });

  // 8. 미니 게임: 어느 방향의 영향일까(빠른 퀴즈)
  part('game2', (root) => window.EcoGame.mount(root, {
    id: 'dir', title: '어느 방향의 영향일까', seconds: 40,
    intro: '무엇이 무엇을 바꿨을까?<br>«게임 시작»을 누르자',
    endSay: '헷갈리면 «무엇이 바뀌었나?»를 먼저 물어보자',
    items: [
      { q: '가을에 꽃을 피우는 국화', a: 'a2b', why: '낮이 짧아지는 빛의 변화가 꽃 피는 때를 정했다.' },
      { q: '귀가 큰 사막여우', a: 'a2b', why: '더운 온도에 맞춘 생김새 → 환경 → 생물.' },
      { q: '털이 두꺼운 북극여우', a: 'a2b', why: '추운 온도에 맞춘 생김새 → 환경 → 생물.' },
      { q: '지방층이 두꺼운 펭귄', a: 'a2b', why: '추운 온도가 몸의 생김새에 영향을 줬다.' },
      { q: '잎이 가시로 바뀐 선인장', a: 'a2b', why: '건조함(물)에 맞춘 생김새.' },
      { q: '짠 땅에서 자라는 함초', a: 'a2b', why: '소금기 많은 토양에 맞춘 몸.' },
      { q: '높은 산 사람의 많은 적혈구', a: 'a2b', why: '산소가 적은 공기가 몸에 영향을 줬다.' },
      { q: '겨울잠을 자는 개구리', a: 'a2b', why: '낮은 온도가 생활 방식을 바꿨다.' },
      { q: '광합성으로 늘어난 공기 속 산소', a: 'b2a', why: '식물(생물)이 공기(환경)를 바꿨다.' },
      { q: '비버의 댐으로 생긴 습지', a: 'b2a', why: '비버(생물)가 물길(환경)을 바꿨다.' },
      { q: '지렁이 굴로 숨 쉬는 흙', a: 'b2a', why: '지렁이(생물)가 흙(환경)을 바꿨다.' },
      { q: '소의 트림으로 늘어난 메테인', a: 'b2a', why: '소(생물)가 공기(환경)를 바꿨다.' },
      { q: '비료를 뿌려 기름진 밭', a: 'b2a', why: '사람(생물)이 흙(환경)을 바꿨다.' },
      { q: '숲 둘레가 여름에 시원함', a: 'b2a', why: '나무가 잎으로 물을 내보내 기온을 낮췄다.' },
      { q: '물풀 덕분에 맑아진 연못물', a: 'b2a', why: '물풀(생물)이 물(환경)을 바꿨다.' },
      { q: '낙엽이 분해되어 검어진 흙', a: 'b2a', why: '분해자(생물)가 흙(환경)을 바꿨다.' },
    ],
  }));

  part('sum2', (root) => window.RxT.sum(root));
  part('check2', (root) => { window.LessonParts.mountWrap(root); });
})();
