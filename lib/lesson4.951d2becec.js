/* 2-2-3 4차시 「자가발전 학교 설계하기」(교과서 115~117쪽 프로젝트 + 중단원 정리): 장마다 조각을 붙인다.
   차례(2026-10-31 보완, 기존 장 모두 그대로 + 더함, 8장): 표지(사건 파일 4) → 체험(우리 학교에 설치) → 이론(제로 에너지 건축물, 사진)
   → 체험(제로 에너지 건축물 만들기) → 체험(발표·평가) → 미니 게임 → 정리(뒤집기 카드) → 확인(+ 사건 풀기).
   스스로 평가(.seg)·확인 ○×(.qs)는 수업방 응답 모으기가 읽는다. 5장(#present)의 data-word는 수업방 «한 낱말 묻기»에 미리 들어간다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const single = (btns, after) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
    if (after) after(b, on);
  }));

  const J = (...p) => window.RxT.join(...p);
  const dock = (root, cfg) => window.UDock.mount(root, cfg);

  part('cover', (root) => { single([...root.querySelectorAll('.share-opts button')]); return {}; });
  part('school', (root) => J(window.SchoolMap.mount(root), dock(root, {
    steps: ['장치 고르기', '자리에 놓기', '덜 쓰기도 해 보기'],
    on: ['.sc-dev', (r) => r.querySelector('.sc-dev.used'), '#sc-led, #sc-idle'],
    learn: '자리마다 <b>햇빛·바람·물·사람</b> 조건이 달라 발전량이 다르다. 만드는 것과 함께 <b>덜 쓰는 것</b>도 필요하다.',
  })));
  part('zdef', (root) => {
    const rows = [...root.querySelectorAll('.zd-def')];
    root.querySelector('.gv').addEventListener('gv-pick', (e) => rows.forEach((x) => x.classList.toggle('on', x.dataset.k === e.detail.b.dataset.row)));
    return window.RxT.gallery(root);
  });
  const PAS = ['ins', 'win', 'shade', 'slant'], ACT = ['geo', 'vent', 'light', 'pv'];
  part('zeb', (root) => J(window.ZeroHouse.mount(root), dock(root, {
    steps: ['패시브 붙이기', '액티브 붙이기', '«0» 맞추기'],
    on: [(r) => PAS.some((k) => r.querySelector(`.ze-part.used[data-t="${k}"]`)), (r) => ACT.some((k) => r.querySelector(`.ze-part.used[data-t="${k}"]`)), (r) => r.classList.contains('zero')],
    learn: '<b>패시브</b>로 덜 쓰고 <b>액티브</b>로 만들어 쓰면, 쓰는 에너지와 만드는 에너지가 맞아 «0»이 된다.',
  })));

  // 5. 발표와 평가: 모둠 번호·실용성·창의성 별점 → 점수 표(이 화면에만)
  part('present', (root) => {
    root.querySelectorAll('.pe-q .seg').forEach((g) => single([...g.querySelectorAll('button')]));
    const teams = [...root.querySelectorAll('.pe-team button')];
    let team = 1; const score = { use: 0, new: 0 }, rec = new Map();
    single(teams, (b, on) => { team = on ? Number(b.dataset.t) : team; if (!on) b.setAttribute('aria-pressed', 'true'); });
    root.querySelectorAll('.pe-stars').forEach((box) => {
      const k = box.dataset.k;
      for (let i = 1; i <= 5; i++) {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'pe-star'; b.textContent = '★'; b.setAttribute('aria-label', `${i}점`); b.dataset.n = String(i);
        b.addEventListener('click', () => { score[k] = i; box.querySelectorAll('.pe-star').forEach((x) => x.classList.toggle('on', Number(x.dataset.n) <= i)); });
        box.appendChild(b);
      }
    });
    const body = root.querySelector('.pe-table tbody');
    const draw = () => {
      const rows = [...rec.entries()].map(([t, v]) => ({ t, ...v, sum: v.use + v.new })).sort((a, b) => b.sum - a.sum || a.t - b.t);
      body.innerHTML = rows.length ? rows.map((r, i) => `<tr${i === 0 ? ' class="top"' : ''}><td>${i + 1}</td><td>${r.t}모둠</td><td>${r.use}</td><td>${r.new}</td><td><b>${r.sum}</b></td></tr>`).join('') : '<tr><td colspan="5" class="pe-empty">아직 적은 점수가 없어요</td></tr>';
    };
    root.querySelector('#pe-save').addEventListener('click', () => {
      if (!score.use || !score.new) return;
      rec.set(team, { use: score.use, new: score.new }); draw();
    });
    draw();
    return dock(root, {
      steps: ['모둠 고르기', '별점 주기', '점수 적기'],
      on: ['.pe-team button', '.pe-star', '#pe-save'],
      learn: '좋은 설계는 <b>원리</b>가 맞고, 우리 학교 <b>조건</b>에 맞으며, 새로운 생각이 담긴 것이다.',
    });
  });

  part('game4', (root) => window.EnGame.mount(root, {
    id: 'place', title: '40초 이 자리에 이 기술', seconds: 40,
    intro: '이 자리에 가장 알맞은 기술은?<br>«게임 시작»을 누르자',
    endSay: '틀린 카드는 «그 자리에 늘 있는 것이 무엇인가?»로 다시 따져 보자',
    items: [
      { q: '하루 종일 볕이 드는 본관 옥상', a: 'pv', why: '가려지지 않는 강한 햇빛 → 태양광.' },
      { q: '체육관과 급식실 사이 바람길', a: 'wd', why: '바람이 세고 늘 분다 → 소형 풍력.' },
      { q: '급식실 지붕의 빗물관', a: 'hy', why: '높은 곳에서 물이 떨어진다 → 소형 수력.' },
      { q: '점심시간 줄 서는 급식실 바닥', a: 'pz', why: '많은 학생이 밟는 압력 → 압전 소자.' },
      { q: '운동장 햇빛 가림막 위', a: 'pv', why: '넓고 해가 잘 든다 → 태양광.' },
      { q: '바람 센 언덕 위 운동장 끝', a: 'wd', why: '센 바람이 이어진다 → 풍력.' },
      { q: '학교 뒤 계곡에서 떨어지는 물', a: 'hy', why: '높이 차가 있는 물 → 수력.' },
      { q: '등교 때 붐비는 현관 계단', a: 'pz', why: '발걸음이 몰린다 → 압전 소자.' },
      { q: '남쪽으로 기운 강당 지붕', a: 'pv', why: '해를 정면으로 받는다 → 태양광.' },
      { q: '늘 바람이 부는 바닷가 방파제', a: 'wd', why: '바닷바람 → 풍력.' },
      { q: '옥상 물탱크에서 내려오는 관', a: 'hy', why: '물이 아래로 흐른다 → 수력.' },
      { q: '체육관 농구 코트 바닥', a: 'pz', why: '뛰고 구르는 압력 → 압전 소자.' },
    ],
  }));
  part('sum4', (root) => window.RxT.sum(root));

  part('check4', (root) => { window.LessonParts.mountWrap(root); });
})();
