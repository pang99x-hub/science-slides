/* 1-1-1 1차시 «시간과 공간의 규모»(교과서 14~15·17쪽): 장마다 조각을 붙인다.
   소단원 차시 늘리기(2026-11-13)로 옛 1차시 틀에서 장을 나눠 실었다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  const { track, join } = window.EthTrack;

  part('cover', (root) => {
    const m = window.Hunt.mount(root);
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => root.querySelector('#pr-ref').classList.toggle('answer', on);
    return {
      setActive: m.setActive, fit: m.fit,
      fragment(f, on) { if (f.dataset.anim === 'hn') answer(on); },
      sync(slide) { const f = slide.querySelector('[data-anim="hn"]'); answer(!!f && f.classList.contains('visible')); },
    };
  });

  part('scale', (root) => join(window.ScaleRuler.mount(root), window.L1.frame(root)));

  part('zoom', (root) => {
    const z = window.Zoom.mount(root);
    const q = root.querySelector('.zm-q'), msg = root.querySelector('.zm-msg');
    let minHit = false, maxHit = false;
    root.addEventListener('zm-change', (e) => {
      if (e.detail.minHit && !minHit) { minHit = true; root.querySelector('.zm-small').textContent = '수소 원자(약 0.1 nm)'; }
      if (e.detail.maxHit && !maxHit) { maxHit = true; root.querySelector('.zm-big').textContent = '관측 가능한 우주(약 930억 광년)'; }
      q.hidden = !(minHit && maxHit);
    });
    const RIGHT = { small: 'scope', big: 'light' };
    const WHY = {
      ruler: '자의 가장 작은 눈금(1 mm)보다 1000만 배나 작다. 원자는 원자를 찍는 현미경으로 본다.',
      scope: '맞다. 원자 힘 현미경처럼 원자를 찍는 현미경으로 크기를 잰다.',
      light: '맞다. 은하에서 온 빛을 망원경으로 받아 거리와 나이를 알아낸다.',
      walk: '빛도 수만~수억 년을 가야 하는 거리다. 줄자로는 끝이 없다.',
    };
    root.querySelectorAll('.zm-a').forEach((g) => {
      const bs = [...g.querySelectorAll('button')]; single(bs);
      bs.forEach((b) => b.addEventListener('click', () => {
        const ok = b.dataset.k === RIGHT[g.dataset.q];
        b.classList.toggle('bad', !ok); msg.textContent = WHY[b.dataset.k];
        msg.classList.toggle('ok', ok); msg.classList.toggle('no', !ok);
      }));
    });
    const right = (k) => root.querySelector(`.zm-a[data-q="${k}"] button[data-k="${RIGHT[k]}"][aria-pressed="true"]`);
    const t = track(root, [() => minHit, () => maxHit, () => right('small') && right('big')]);
    return join(z, t);
  });

  part('game1', (root) => window.EthGame.mount(root, {
    id: 'measure', title: '40초 무엇으로 잴까', seconds: 40,
    intro: '잴 대상을 보고 알맞은 도구를!<br>«게임 시작»을 누르자',
    endSay: '헷갈리면 «손에 닿나? 몇 초~몇 시간인가? 눈에 안 보이나? 아주 먼가?» 차례로 물어보자',
    items: [
      { q: '필통 속 연필의 길이', a: 'ruler', why: '손에 닿는 몇 cm → 자.' },
      { q: '교실 칠판의 가로 길이', a: 'ruler', why: '몇 m 길이는 줄자로 바로 잰다.' },
      { q: '내 키', a: 'ruler', why: '1~2 m → 줄자·키 재는 자.' },
      { q: '창문의 높이', a: 'ruler', why: '손에 닿는 길이 → 줄자.' },
      { q: '100 m 달리기 기록', a: 'watch', why: '10초 남짓 → 초시계.' },
      { q: '라면 물이 끓기까지 걸린 시간', a: 'watch', why: '몇 분 → 초시계.' },
      { q: '수영 50 m 기록', a: 'watch', why: '몇십 초 → 초시계.' },
      { q: '모래시계를 뒤집고 다 떨어지기까지', a: 'watch', why: '몇 분 → 초시계로 확인한다.' },
      { q: '적혈구의 지름', a: 'scope', why: '약 7 μm, 맨눈에 안 보인다 → 현미경.' },
      { q: '양파 표피 세포의 크기', a: 'scope', why: '세포 → 광학 현미경.' },
      { q: '바이러스의 크기', a: 'scope', why: '세포보다 훨씬 작다 → 전자 현미경.' },
      { q: '머리카락의 굵기', a: 'scope', why: '0.1 mm도 안 된다 → 현미경으로 정밀하게.' },
      { q: '지구에서 달까지의 거리', a: 'light', why: '38만 km → 레이저 빛이 다녀온 시간.' },
      { q: '내 휴대 전화의 위치(GPS)', a: 'light', why: '위성에서 온 전파가 걸린 시간으로 위치를 계산한다.' },
      { q: '먼 은하까지의 거리', a: 'light', why: '은하에서 온 빛을 망원경으로 받아 계산한다.' },
      { q: '건물 사이의 거리를 버튼 한 번에', a: 'light', why: '레이저 거리 측정기 — 빛의 왕복 시간.' },
    ],
  }));
  part('drill1', (root) => window.Drill.mount(root, [
    {"q":"자연 세계의 규모에 대해 옳은 것만 고른 것은?","box":["ㄱ. 원자 수준의 아주 작은 규모의 세계를 미시 세계라고 한다.","ㄴ. 자연 현상이 일어나는 시간의 규모는 모두 비슷하다.","ㄷ. 규모가 다르면 관찰하거나 재는 방법도 달라진다."],"opts":["ㄱ","ㄴ","ㄱ, ㄷ","ㄴ, ㄷ","ㄱ, ㄴ, ㄷ"],"a":2,"why":"시간 규모는 번개의 순간부터 우주의 나이까지 <b>아주 다양</b>하다."},
    {"q":"거시 세계에 속하는 것은?","opts":["원자","분자","이온","에베레스트산","물 분자 속 수소 원자"],"a":3,"why":"원자·분자·이온은 <b>미시 세계</b>. 산은 그보다 훨씬 큰 거시 세계에 있다."},
    {"q":"적혈구(지름 약 7 μm)의 크기를 재기에 알맞은 도구는?","opts":["30 cm 자","초시계","줄자","현미경","망원경"],"a":3,"why":"눈금보다 훨씬 작아 자로는 못 잰다 → <b>현미경</b>."},
    {"q":"크기가 작은 것부터 차례로 늘어놓은 것은?","opts":["적혈구 → 첨성대 → 에베레스트산 → 지구","첨성대 → 적혈구 → 지구 → 에베레스트산","적혈구 → 에베레스트산 → 첨성대 → 지구","지구 → 에베레스트산 → 첨성대 → 적혈구","첨성대 → 에베레스트산 → 적혈구 → 지구"],"a":0,"why":"약 7 μm → 9.51 m → 8848 m → 반지름 약 6400 km."},
    {"q":"표지의 두 사람이 만나지 못한 일에서 알 수 있는 것은?","opts":["약속은 지키기 어렵다","해는 날마다 다른 곳에서 뜬다","때와 곳을 모두가 같게 읽을 기준이 필요하다","산골짜기에서는 시간을 잴 수 없다","사냥에는 시계가 필요 없다"],"a":2,"why":"«언제·어디서»를 누구나 같게 읽어야 같은 현상을 함께 다룰 수 있다."},
  ]));
  part('sum1', (root) => window.RxT.sum(root));
  part('check1', (root) => { window.LessonParts.mountWrap(root); });
  part('scalemap', (r) => window.Xp.mount(r, 'scalemap'));
  part('senses', (r) => window.Xp.mount(r, 'senses'));
  part('gps', (r) => window.Xp.mount(r, 'gps'));
})();
