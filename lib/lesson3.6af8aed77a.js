/* 2-2-2 3차시 「발전기」: 장마다 모듈을 붙인다. */
(function () {
  'use strict';
  const { part, reduce } = window.Deck;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const press = (btns, on) => btns.forEach((b) => b.setAttribute('aria-pressed', String(b === on)));

  part('simple', (root) => window.MiniGen.mountSimple(root));

  part('rotor', (root) => {
    const g = window.MiniGen.mountRot(root);
    return {
      setActive: g.setActive, fit: g.fit,
      fragment(f, on) {
        if (f.dataset.anim !== 'deg') return;
        if (on) g.goDeg(Number(f.dataset.deg));
        else { const prev = f.previousElementSibling; if (prev && prev.dataset.anim === 'deg') g.goDeg(Number(prev.dataset.deg)); }
      },
    };
  });

  // 교류와 직류: 지난 2초 동안의 그래프가 흘러간다
  part('acdc', (root) => {
    const { lineChart, colors } = window.MiniGen;
    const C = colors();
    const ac = root.querySelector('canvas[data-chart="ac"]'), dc = root.querySelector('canvas[data-chart="dc"]');
    const btns = [...root.querySelectorAll('[data-sp]')];
    const F = { 1: 1, 2: 2, 3: 3.5 }, AMP = { 1: 0.45, 2: 0.75, 3: 1 };    // 화면용으로 느리게 그린 교류(실제 60 Hz)
    let sp = 1, raf = 0, active = false, dpr = 1;
    const sign = (v) => (v === 0 ? '0' : v > 0 ? '+' : '−');
    function draw(t) {
      const N = 241, a = new Float32Array(N), d = new Float32Array(N), now = t / 1000;
      for (let i = 0; i < N; i++) { const tt = now - (N - 1 - i) / 120; a[i] = AMP[sp] * Math.sin(2 * Math.PI * F[sp] * tt); d[i] = 0.6; }
      lineChart(ac, dpr, C, a, { lo: -1.15, hi: 1.15, color: C.current, ticks: [-1, 0, 1], tickLabel: sign });
      lineChart(dc, dpr, C, d, { lo: -1.15, hi: 1.15, color: C.accent, ticks: [-1, 0, 1], tickLabel: sign });
    }
    function fit() {
      const rs = (window.Reveal && Reveal.getScale) ? Reveal.getScale() : 1;
      dpr = clamp((window.devicePixelRatio || 1) * rs, 1, 3);
      for (const c of [ac, dc]) { c.width = Math.round(c.offsetWidth * dpr); c.height = Math.round(c.offsetHeight * dpr); }
      draw(performance.now());
    }
    function frame(t) { raf = 0; if (!active) return; draw(reduce ? 0 : t); raf = requestAnimationFrame(frame); }
    btns.forEach((b) => b.addEventListener('click', () => { sp = Number(b.dataset.sp); press(btns, b); }));
    return {
      fit,
      setActive(on) {
        active = on;
        if (on && !raf) { fit(); raf = requestAnimationFrame(frame); }
        if (!on && raf) { cancelAnimationFrame(raf); raf = 0; }
      },
    };
  });

  part('gen3d', (root) => window.Gen3D.mount(root));

  // 터빈을 돌리는 것 + 에너지 공급을 끊으면 멈춘다
  part('turbines', (root) => {
    if (!window.gsap) return {};
    const loops = [];
    const origins = ['112 60', '118 78', '122 60'];
    root.querySelectorAll('.src .tb').forEach((g, i) => loops.push(gsap.to(g, { rotation: 360, svgOrigin: origins[i], duration: 2.2, ease: 'none', repeat: -1 })));
    root.querySelectorAll('.src .air, .src .water, .src .steam, .sup .steam').forEach((p) => loops.push(gsap.to(p, { strokeDashoffset: -40, duration: 0.8, ease: 'none', repeat: -1 })));
    const spin = [
      gsap.to(root.querySelector('.tb2'), { rotation: 360, svgOrigin: '160 70', duration: 1.4, ease: 'none', repeat: -1 }),
      gsap.to(root.querySelector('.rot2'), { rotation: 360, svgOrigin: '381 70', duration: 1.4, ease: 'none', repeat: -1 }),
    ];
    const bulb = root.querySelector('.bulb2'), steam = root.querySelector('.sup .steam');
    const all = loops.concat(spin);
    all.forEach((t) => t.pause());
    let on = true;
    const btn = root.querySelector('#sup-toggle');
    btn.addEventListener('click', () => {
      on = !on;
      btn.setAttribute('aria-pressed', String(on));
      btn.querySelector('span').textContent = on ? '에너지 공급 끊기' : '에너지 다시 공급하기';
      spin.forEach((t) => { t.play(); gsap.to(t, { timeScale: on ? 1 : 0, duration: on ? 1.2 : 2.6, ease: on ? 'power1.in' : 'power2.out' }); });
      gsap.to(bulb, { opacity: on ? 1 : 0.15, duration: on ? 1.2 : 2.4 });
      gsap.to(steam, { opacity: on ? 1 : 0, duration: 0.4 });
    });
    return { setActive(a) { all.forEach((t) => (a ? t.play() : t.pause())); } };
  });

  part('check3', (root) => { window.LessonParts.mountWrap(root); });
})();

/* 2026-10-31 보완(승인 틀): 표지 사건 예측 · 이론(사진) · 기존 조작 장의 해 볼 일 ①②③ · 미니 게임 · 뒤집기 카드. 기존 장 모듈은 그대로 둔다. */
(function () {
  'use strict';
  const { part } = window.Deck, Gx = window.Gx;
  part('cover', (root) => { Gx.single([...root.querySelectorAll('.cv-case .share-opts button')]); return {}; });
  part('gent', (root) => {
    const rows = [...root.querySelectorAll('.lv-row')];
    root.querySelector('.gv').addEventListener('gv-pick', (e) => rows.forEach((x) => x.classList.toggle('on', x.dataset.k === e.detail.b.dataset.row)));
    return window.RxT.gallery(root);
  });
  // 간이 발전기: 약 → 강 → 끄기
  part('simple', (root) => {
    let weak = false, strong = false, off = false;
    root.querySelectorAll('[data-fan]').forEach((b) => b.addEventListener('click', () => {
      const v = +b.dataset.fan;
      if (v >= 1) weak = true;
      if (v === 3 && weak) strong = true;
      if (v === 0 && strong) off = true;
    }));
    return Gx.track(root, [() => weak, () => strong, () => off]);
  });
  // 터빈: 끊기 → 멈춤 보기 → 다시 공급
  part('turbines', (root) => {
    const btn = root.querySelector('#sup-toggle');
    let cutAt = 0, again = false;
    btn.addEventListener('click', () => { if (btn.getAttribute('aria-pressed') === 'false') cutAt = performance.now(); else if (cutAt) again = true; });
    return Gx.track(root, [() => cutAt > 0, () => cutAt > 0 && (again || performance.now() - cutAt > 2800), () => again]);
  });
  part('game3', (root) => window.EcoGame.mount(root, {
    id: 'turbine', title: '40초 터빈 돌리기', seconds: 40,
    intro: '이 발전소의 터빈은 무엇이 돌릴까?<br>«게임 시작»을 누르자',
    endSay: '틀린 카드는 «무엇으로 열을 내나, 무엇이 흐르나?»로 다시 따져 보자',
    items: [
      { q: '언덕 위 풍력 발전기', a: 'a', why: '바람이 날개(터빈)를 민다.' },
      { q: '바다 위 풍력 발전 단지', a: 'a', why: '바다의 센 바람이 날개를 돌린다.' },
      { q: '댐 아래 수력 발전소', a: 'b', why: '떨어지는 물이 수차를 돌린다.' },
      { q: '밀물·썰물을 쓰는 조력 발전소', a: 'b', why: '드나드는 바닷물이 수차를 돌린다.' },
      { q: '밤에 물을 올려 두는 양수 발전소', a: 'b', why: '위 저수지의 물을 떨어뜨려 수차를 돌린다.' },
      { q: '석탄 화력 발전소', a: 'c', why: '석탄을 태워 물을 끓인 수증기가 터빈을 돌린다.' },
      { q: '천연가스(LNG) 화력 발전소', a: 'c', why: '가스를 태운 열로 만든 수증기가 돌린다.' },
      { q: '핵발전소', a: 'c', why: '핵에너지로 물을 끓여 만든 수증기가 돌린다.' },
      { q: '땅속 열을 쓰는 지열 발전소', a: 'c', why: '뜨거운 땅속 열로 만든 수증기가 돌린다.' },
      { q: '석유 화력 발전소', a: 'c', why: '기름을 태운 열로 만든 수증기가 돌린다.' },
      { q: '지붕 위 태양광 발전', a: 'd', why: '빛이 전지판에서 바로 전기가 된다 — 도는 것이 없다.' },
      { q: '수소 연료 전지', a: 'd', why: '화학 반응으로 바로 전기를 만든다 — 터빈이 없다.' },
    ],
  }));
  part('sum3', (root) => window.RxT.sum(root));
})();
