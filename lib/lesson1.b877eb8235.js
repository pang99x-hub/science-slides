/* 2-2-2 1차시 「소형 발전기는 어떻게 전기를 만들까」: 장마다 모듈을 붙인다. */
(function () {
  'use strict';
  const { part } = window.Deck;

  part('zoom', (root) => {
    const z = window.ZoomJourney.mount(root);
    return {
      setActive: z.setActive,
      fragment(f, on) { if (f.dataset.anim === 'zoom') { const k = Number(f.dataset.step); z.go(on ? k : k - 1); } },
      sync(slide) {
        const shown = [...slide.querySelectorAll('[data-anim="zoom"].visible')].map((f) => Number(f.dataset.step));
        z.go(shown.length ? Math.max(...shown) : 0, true);
      },
    };
  });
  part('field', (root) => window.FieldReview.mount(root));
  part('inquiry', (root) => { window.LessonParts.mountInquiry(root); });
  part('lab', (root) => window.InductionLab.mount(root, { stepped: true }));   // 보이는 줄 수가 바뀔 때만 바늘이 움직인다
  part('flap', (root) => window.Parts.flap(root));
  part('wrap', (root) => { window.LessonParts.mountWrap(root); });
})();

/* 2026-10-31 보완(승인 틀): 표지 사건 예측 · 이론(사진) · 실험실 «알게 된 것» · 미니 게임 · 뒤집기 카드. 기존 장 모듈은 그대로 둔다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  part('cover', (root) => { window.Gx.single([...root.querySelectorAll('.cv-case .share-opts button')]); return {}; });
  // 이론: 사진을 누르면 맞는 왼쪽 상자가 밝아진다
  part('gen', (root) => {
    const rows = [...root.querySelectorAll('.lv-row')];
    root.querySelector('.gv').addEventListener('gv-pick', (e) => rows.forEach((x) => x.classList.toggle('on', x.dataset.k === e.detail.b.dataset.row)));
    return window.RxT.gallery(root);
  });
  // 실험실: «해 볼 것» 세 칸(자석만·코일만·함께)이 채워지면 알게 된 것
  part('lab', (root) => window.Gx.track(root, ['magnet', 'coil', 'both'].map((m) => (r) => r.querySelector(`.checks li[data-mode="${m}"]`).classList.contains('done'))));
  part('game1', (root) => window.EcoGame.mount(root, {
    id: 'needle', title: '40초 바늘 맞히기', seconds: 40,
    intro: '이 상황에서 검류계 바늘은?<br>«게임 시작»을 누르자',
    endSay: '틀린 카드는 «자석과 코일 사이가 바뀌는가?»부터 다시 물어보자',
    items: [
      { q: '코일 속으로 자석을 밀어 넣는 중', a: 'move', why: '자석이 다가와 코일을 지나는 자기장이 바뀐다.' },
      { q: '코일 속에 자석을 넣고 멈춘 채', a: 'stay', why: '자기장은 있지만 바뀌지 않는다 → 전류 없음.' },
      { q: '멈춘 자석 쪽으로 코일을 가져가는 중', a: 'move', why: '코일이 움직여도 상대 위치가 바뀐다.' },
      { q: '자석에서 코일을 멀리 떼는 중', a: 'move', why: '멀어질 때도 자기장이 바뀐다(줄어든다).' },
      { q: '자석과 코일을 함께 들고 같은 간격으로 걷기', a: 'stay', why: '둘 사이가 그대로라 코일을 지나는 자기장도 그대로.' },
      { q: '코일 위로 자석을 빠르게 빼내는 중', a: 'move', why: '빼낼 때도 상대 위치가 바뀐다.' },
      { q: '아주 센 자석을 코일 옆에 가만히', a: 'stay', why: '세기보다 «바뀌는가»가 중요하다. 그대로면 0.' },
      { q: '코일 앞에서 자석을 빙글빙글 돌리는 중', a: 'move', why: 'N극·S극이 번갈아 와서 자기장이 계속 바뀐다.' },
      { q: '둘레에 자석 없이 코일만 흔드는 중', a: 'stay', why: '바뀔 자기장이 거의 없어 바늘이 그대로.' },
      { q: '손전등 손잡이를 돌리는 중', a: 'move', why: '속의 자석이 코일 곁에서 돈다 → 불이 켜진다.' },
      { q: '손잡이를 멈춘 손전등', a: 'stay', why: '돌리지 않으면 자석도 멈춘다 → 불이 꺼진다.' },
      { q: '발전기를 단 자전거 바퀴가 도는 중', a: 'move', why: '바퀴가 발전기 속 자석을 돌린다.' },
      { q: '세워 둔 자전거의 발전기', a: 'stay', why: '바퀴가 멈추면 자석도 멈춘다.' },
      { q: '자석을 코일 속에서 위아래로 흔드는 중', a: 'move', why: '들어갔다 나왔다 할 때마다 자기장이 바뀐다.' },
    ],
  }));
  part('sum1', (root) => window.RxT.sum(root));
})();
