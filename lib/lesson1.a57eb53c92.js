/* 2-2-1 1차시 「태양 에너지의 생성」: 장마다 조각을 붙인다.
   차례(2026-10-31 승인 틀로 보강, 12장 — 기존 7장은 그대로 두고 더함): 표지(사건 파일 1) → 설명(에너지는 어디에, 사진) → 체험(여러 가지 에너지)
   → 설명(태양의 속, 3D) → 체험(탐침) → 체험(핵융합 실험실) → 설명(수소 핵융합과 질량, Manim) → 체험(사라진 질량 저울)
   → 설명(중심부에서 지구까지) → 미니 게임(에너지 이름 맞히기, 빠른 퀴즈) → 정리(뒤집기 카드) → 확인(+ 사건 파일 1 풀기).
   예측(.share-opts)·분류(.pred[data-row] .seg)·○×(.qs)는 수업방 응답 모으기가 그대로 읽는 모양이다. */
(function () {
  'use strict';
  const { part, D } = window.Deck;
  const L1 = window.L1;
  // 체험 장 해 볼 일 ①②③(2-1-1 frame.js 방식): 지금 단계 번호(0 = 끝)
  const mark = (root, n, max = 3) => { const ok = []; for (let k = 1; k <= max; k++) if (n === 0 || k < n) ok.push(k); L1.steps(root, n, ok); L1.done(root, n === 0); };
  // 기존 조작 모듈은 고치지 않고, 장이 보이는 동안 상태를 읽어 해 볼 일을 맞춘다
  const watch = (root, fn) => { let id = 0; const run = () => mark(root, fn()); run(); return { setActive(on) { clearInterval(id); if (on) id = setInterval(run, 250); run(); } }; };
  window.SunMark = { mark, watch };

  // 1. 표지: 이글거리는 태양 · 예측 하나 고르기 · 시간 막대(석탄이라면 수천 년 vs 약 50억 년)
  part('cover', (root) => {
    const sun = window.SunGlow.mount(root.querySelector('.sun-cv'));
    const opts = [...root.querySelectorAll('.share-opts button')];
    opts.forEach((b) => b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') !== 'true';
      opts.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
    }));
    const coal = root.querySelector('.age-row.coal b i'), real = root.querySelector('.age-row.sun b i');
    const bars = (on, instant) => {
      // 수천 년 ÷ 50억 년 ≈ 100만분의 1 → 막대로는 선 하나(3px)
      if (!window.gsap || instant) { coal.style.width = on ? '3px' : '0'; real.style.width = on ? '100%' : '0'; return; }
      gsap.fromTo(real, { width: '0%' }, { width: on ? '100%' : '0%', duration: D(1.6), ease: 'power2.inOut', delay: D(0.25) });
      gsap.fromTo(coal, { width: '0px' }, { width: on ? '3px' : '0px', duration: D(0.2), delay: D(0.25) });
    };
    return {
      setActive: (on) => sun.setActive(on),
      fit: () => sun.fit(),
      fragment(f, on) { if (f.dataset.anim === 'age') bars(on); },
      sync(slide) { const f = slide.querySelector('[data-anim="age"]'); bars(f.classList.contains('visible'), true); },
    };
  });

  // 2. 여러 가지 에너지: 줄마다 에너지를 고르면 그 물건 그림이 왼쪽 에너지 상자(카드)로 들어간다.
  //    맞으면 초록 테로 남고, 틀리면 상자가 흔들리며 힌트가 뜨고 물건이 빠져나온다. 카드를 누르면 뜻(뒷면)
  part('kinds', (root) => {
    const cards = [...root.querySelectorAll('.ekinds .card')];
    const cardOf = (e) => cards.find((c) => c.dataset.e === e);
    cards.forEach((c) => c.addEventListener('click', () => c.classList.toggle('flipped')));
    root.querySelector('#kinds-flip').addEventListener('click', () => {
      const any = cards.some((c) => !c.classList.contains('flipped'));
      cards.forEach((c) => c.classList.toggle('flipped', any));
    });
    const rows = [...root.querySelectorAll('.sort-rows .pred')];
    const score = root.querySelector('.sort-score');
    let shown = false;
    const tally = () => {
      const ok = rows.filter((r) => { const p = r.querySelector('button[aria-pressed="true"]'); return p && p.dataset.v === r.dataset.a; }).length;
      score.textContent = `맞힌 줄 ${ok} / ${rows.length}${ok === rows.length ? ' · 모두 맞혔어요!' : ''}`;
    };
    const badge = (r) => root.querySelector(`.kb[data-row="${r.dataset.row}"]`);
    function drop(r, v) {
      const old = badge(r); if (old) old.remove();
      if (!v) return;
      const card = cardOf(v); if (!card) return;
      card.classList.remove('flipped');
      const kb = document.createElement('span');
      kb.className = 'kb'; kb.dataset.row = r.dataset.row;
      kb.innerHTML = `<svg viewBox="0 0 40 40"><use href="#${r.dataset.ic}"/></svg>`;
      card.querySelector('.bin').appendChild(kb);
      const right = v === r.dataset.a;
      kb.classList.add(right ? 'ok' : 'no');
      r.classList.toggle('ok', right); r.classList.toggle('no', !right);
      if (window.gsap) gsap.fromTo(kb, { scale: 0, y: -30 }, { scale: 1, y: 0, duration: 0.4, ease: 'back.out(2.5)' });
      card.classList.remove('glow', 'shake'); card.getBoundingClientRect(); card.classList.add(right ? 'glow' : 'shake');
      setTimeout(() => card.classList.remove('glow'), 900);
      if (!right) {
        score.textContent = '힌트: ' + r.dataset.hint;
        setTimeout(() => { if (kb.isConnected && !shown) { if (window.gsap) gsap.to(kb, { scale: 0, duration: 0.25, onComplete: () => kb.remove() }); else kb.remove(); } }, 1400);
      } else tally();
    }
    rows.forEach((r) => {
      const btns = [...r.querySelectorAll('.seg button')];
      btns.forEach((b) => {
        b.setAttribute('aria-pressed', 'false');
        b.addEventListener('click', () => {
          const on = b.getAttribute('aria-pressed') !== 'true';
          btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
          drop(r, on ? b.dataset.v : null);
          if (shown) btns.forEach((x) => x.classList.toggle('answer', x.dataset.v === r.dataset.a));
        });
      });
    });
    let seen = false;
    cards.forEach((c) => c.addEventListener('click', () => { seen = true; upd(); }));
    root.querySelector('#kinds-flip').addEventListener('click', () => { seen = true; upd(); });
    const upd = () => setTimeout(() => {
      const ok = rows.filter((r) => { const p = r.querySelector('button[aria-pressed="true"]'); return p && p.dataset.v === r.dataset.a; }).length;
      const any = rows.some((r) => r.querySelector('button[aria-pressed="true"]'));
      mark(root, ok === rows.length || shown ? 0 : any ? 3 : seen ? 2 : 1);
    }, 0);
    root.addEventListener('click', upd);
    upd();
    root.querySelector('#kinds-show').addEventListener('click', () => {
      shown = true;
      rows.forEach((r) => {
        r.querySelectorAll('button').forEach((b) => b.classList.toggle('answer', b.dataset.v === r.dataset.a));
        const p = r.querySelector('button[aria-pressed="true"]');
        if (!p || p.dataset.v !== r.dataset.a) {                // 정답 상자에 물건을 넣어 보여 준다
          const old = badge(r); if (old) old.remove();
          const kb = document.createElement('span'); kb.className = 'kb ok'; kb.dataset.row = r.dataset.row;
          kb.innerHTML = `<svg viewBox="0 0 40 40"><use href="#${r.dataset.ic}"/></svg>`;
          cardOf(r.dataset.a).querySelector('.bin').appendChild(kb);
        }
      });
      cards.forEach((c) => c.classList.remove('flipped'));
      tally();
    });
    return {};
  });

  // 2. 설명: 에너지는 어디에 있을까 — 사진을 누르면 맞는 왼쪽 상자가 밝아진다
  part('ework', (root) => {
    const rows = [...root.querySelectorAll('.lv-row')];
    root.querySelector('.gv').addEventListener('gv-pick', (e) => rows.forEach((x) => x.classList.toggle('on', x.dataset.k === e.detail.b.dataset.row)));
    return window.RxT.gallery(root);
  });

  // 4. 설명: 태양의 속 3D
  part('sun3d', (root) => window.Sun3D.mount(root));

  // 5. 체험: 탐침 — ① 끌어 내리기 ② 층을 지나며 읽기 ③ 핵까지
  part('inside', (root) => {
    const range = root.querySelector('#probe'); let max = 0;
    return window.RxT.join(window.SunCut.mount(root), watch(root, () => { max = Math.max(max, +range.value); return max < 5 ? 1 : max < 60 ? 2 : max < 97 ? 3 : 0; }));
  });
  // 6. 체험: 핵융합 실험실 — ① 표면 조건 ② 온도만 높게 ③ 둘 다 높게
  part('fusion', (root) => {
    const t = root.querySelector('#fz-t'), d = root.querySelector('#fz-d'); let s1 = false, s2 = false, s3 = false;
    root.querySelector('#fz-surf').addEventListener('click', () => { s1 = true; });
    return window.RxT.join(window.FusionLab.mount(root, { expose: true }), watch(root, () => {
      const T = +t.value, Dn = +d.value;
      if (T < 35) s1 = true;
      if (s1 && T >= 65 && Dn < 60) s2 = true;
      if (T >= 65 && Dn >= 65) s3 = true;
      return s3 && s2 ? 0 : s3 ? 0 : s2 ? 3 : s1 ? 2 : 1;
    }));
  });
  // 7. 설명: 수소 핵융합 — Manim 단계 영상, 단계에 맞는 왼쪽 상자가 밝아진다
  part('fuse', (root) => {
    const defs = [...root.querySelectorAll('.fu-def')];
    root.addEventListener('st-step', (e) => defs.forEach((x) => x.classList.toggle('on', x.dataset.s.split(' ').includes(String(e.detail)))));
    return window.RxT.stepper(root);
  });
  // 8. 체험: 저울 — → 단계에 따라 해 볼 일
  part('mass', (root) => {
    const rows = [...root.querySelectorAll('.mtab tr')];
    return window.RxT.join(window.MassBalance.mount(root, { expose: true }), watch(root, () => {
      const v = rows.filter((r) => r.classList.contains('visible')).length;
      return v === 0 ? 1 : v === 1 ? 2 : v === 2 ? 3 : 0;
    }));
  });
  part('output', (root) => window.SunOutput.mount(root));
  // 10. 미니 게임: 에너지 이름 맞히기(빠른 퀴즈)
  part('game1', (root) => window.EcoGame.mount(root, {
    id: 'kinds', title: '40초 에너지 이름 맞히기', seconds: 40,
    intro: '카드에 담긴 에너지는?<br>«게임 시작»을 누르자',
    endSay: '틀린 카드는 «이 에너지는 무엇에 담겼나?»부터 다시 물어보자',
    items: [
      { q: '손전등에서 뻗어 나온 빛', a: 'light', why: '빛에 실려 전해진다 → 빛에너지.' },
      { q: '창문으로 들어온 햇살', a: 'light', why: '햇빛이 실어 오는 것 → 빛에너지.' },
      { q: '밤하늘 별에서 온 빛', a: 'light', why: '멀리서 빛으로 전해진다 → 빛에너지.' },
      { q: '난로 앞에서 손을 데우는 것', a: 'heat', why: '뜨거운 곳에서 찬 손으로 옮겨 가 데운다 → 열에너지.' },
      { q: '얼음을 녹이는 뜨거운 물의 것', a: 'heat', why: '온도가 다른 물체 사이를 옮겨 가 상태를 바꾼다 → 열에너지.' },
      { q: '자동차 연료통의 휘발유', a: 'chem', why: '연료 물질 속에 저장되어 있다 → 화학 에너지.' },
      { q: '건전지 속 물질', a: 'chem', why: '물질 속에 저장돼 있다가 반응하며 전류를 낸다 → 화학 에너지.' },
      { q: '초콜릿 한 조각', a: 'chem', why: '음식 속에 저장된 에너지 → 화학 에너지.' },
      { q: '아직 불붙이지 않은 장작', a: 'chem', why: '타기 전에는 물질 속에 저장돼 있다 → 화학 에너지.' },
      { q: '콘센트에서 흐르는 전류', a: 'elec', why: '전류가 흐르며 전해진다 → 전기 에너지.' },
      { q: '충전기 선을 따라 흐르는 전류', a: 'elec', why: '전류가 실어 나른다 → 전기 에너지.' },
      { q: '굴러가는 볼링공', a: 'mech', why: '움직이는 물체(운동 에너지) → 역학적 에너지.' },
      { q: '댐 위에 가득 고인 물', a: 'mech', why: '높은 곳에 있다(위치 에너지) → 역학적 에너지.' },
      { q: '하늘로 날아가는 야구공', a: 'mech', why: '높이와 빠르기를 함께 가졌다 → 역학적 에너지.' },
      { q: '원자로 속 우라늄 원자핵', a: 'nuc', why: '원자핵이 반응할 때 나온다 → 핵에너지.' },
      { q: '태양 중심의 수소 원자핵', a: 'nuc', why: '수소 원자핵이 합쳐지며 나온다 → 핵에너지.' },
    ],
  }));

  part('sum1', (root) => window.RxT.sum(root));
  part('check1', (root) => { window.LessonParts.mountWrap(root); });
})();
