/* 2-2-1 2차시 「태양 에너지의 전환과 흐름」: 장마다 조각을 붙인다.
   차례(2026-10-31 승인 틀로 보강, 11장 — 기존 7장은 그대로 두고 더함): 표지(사건 파일 2) → 체험(에너지 전환) → 설명(햇빛을 모아 두는 방법, 사진)
   → 체험(광합성) → 설명(태양의 열이 공기와 물을 움직인다, Manim) → 체험(바람) → 체험(물의 순환) → 체험(흐름도·근원)
   → 미니 게임(전환 따라가기, 빠른 퀴즈) → 정리(뒤집기 카드) → 확인(+ 사건 파일 2 풀기).
   예측(.share-opts)·전환 고르기·바람 예측(.pred[data-row] .seg)·근원 ○×·확인 ○×(.qs)는 수업방 응답 모으기가 그대로 읽는다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const { tok } = window.Stage;
  const L1 = window.L1;
  // 체험 장 해 볼 일 ①②③(2-1-1 frame.js 방식): 지금 단계 번호(0 = 끝). 기존 조작 모듈은 고치지 않고 상태를 읽어 맞춘다
  const mark = (root, n, max = 3) => { const ok = []; for (let k = 1; k <= max; k++) if (n === 0 || k < n) ok.push(k); L1.steps(root, n, ok); L1.done(root, n === 0); };
  const watch = (root, fn) => { let id = 0; const run = () => mark(root, fn()); run(); return { setActive(on) { clearInterval(id); if (on) id = setInterval(run, 250); run(); } }; };
  const join = (...ps) => window.RxT.join(...ps);
  const NAME = { light: '빛에너지', heat: '열에너지', chem: '화학 에너지', elec: '전기 에너지', kin: '운동 에너지', pot: '위치 에너지' };
  // 한 묶음에서 하나만 누르게(다시 누르면 풀림)
  const single = (btns, after) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
    if (after) after(b);
  }));

  // 1. 표지: 예측 하나 · 거슬러 올라가기(→ 한 번에 한 칸: 길이 거꾸로 그려지고 더 먼 출처가 나타난다).
  //    태양까지 닿으면 태양 → 식물 → 석탄 → 발전소 → 휴대폰으로 에너지가 흐른다
  part('cover', (root) => {
    single([...root.querySelectorAll('.share-opts button')]);
    const segs = [...root.querySelectorAll('.tr-seg')], nodes = [...root.querySelectorAll('.tr-node')];
    const frags = [...root.querySelectorAll('[data-anim="trace"]')];
    const sun = root.querySelector('.tr-sun');
    const lens = new Map(segs.map((g) => [g, g.querySelector('.tr-flow').getTotalLength()]));
    let k = -1;
    function set(n, instant) {
      const quick = instant || !window.gsap || window.Stage.reduce;
      nodes.forEach((g) => {
        const on = Number(g.dataset.k) <= n;
        if (quick) { g.style.opacity = on ? 1 : 0; g.style.transform = ''; }
        else if (on && Number(g.dataset.k) > k) gsap.fromTo(g, { opacity: 0, scale: 0.6, transformOrigin: '50% 50%' }, { opacity: 1, scale: 1, duration: 0.5, delay: 0.55, ease: 'back.out(2)' });
        else if (!on) gsap.set(g, { opacity: 0 });
      });
      segs.forEach((g) => {
        const sk = Number(g.dataset.k), L = lens.get(g), base = g.querySelector('.tr-base'), flow = g.querySelector('.tr-flow');
        const on = sk <= n;
        g.classList.toggle('flow', n >= 4);
        for (const p of [base, flow]) {
          p.style.strokeDasharray = `${L} ${L}`;
          if (quick || !on || sk <= k) { if (!(n >= 4 && p === flow)) p.style.strokeDashoffset = on ? 0 : -L; }
          else gsap.fromTo(p, { strokeDashoffset: -L }, { strokeDashoffset: 0, duration: 0.6, ease: 'power1.inOut' });   // 끝(위)에서 처음(아래)으로 거슬러 그린다
        }
        g.style.opacity = on ? 1 : 0;
      });
      sun.classList.toggle('lit', n >= 4);
      k = n;
    }
    const count = () => frags.filter((f) => f.classList.contains('visible')).length;
    set(0, true);
    return {
      fragment(f) { if (f.dataset.anim === 'trace') set(count()); },
      sync() { set(count(), true); },
    };
  });

  // 2. 에너지 전환 실험대: 줄(기구)을 고르면 실험대에 놓이고, 나오는 에너지를 맞게 고르면 기구가 움직인다
  part('convert', (root) => {
    const rows = [...root.querySelectorAll('.sort-rows .pred')];
    const score = root.querySelector('.sort-score');
    const svg = root.querySelector('.cv-svg'), all = (s) => svg.querySelectorAll(s);
    const msg = svg.querySelector('.cv-msg'), msgT = msg.querySelector('text');
    const tagIn = svg.querySelector('.cv-tag-in'), tagOut = svg.querySelector('.cv-tag-out');
    const pct = svg.querySelector('.batt-pct');
    const pipeA = svg.querySelector('.pipe-a'), pipeB = svg.querySelector('.pipe-b'), outX = svg.querySelector('.out-x');
    let shown = false, cur = rows[0];
    const pick = (r) => { const b = r.querySelector('button[aria-pressed="true"]'); return b ? b.dataset.v : null; };
    function show(shake) {
      rows.forEach((r) => r.classList.toggle('cur', r === cur));
      const d = cur.dataset, to = shown ? d.a : pick(cur), right = to === d.a;
      all('.inp').forEach((g) => g.classList.toggle('on', g.dataset.in === d.in));
      all('.dev').forEach((g) => { const on = g.dataset.dev === d.dev; g.classList.toggle('on', on); g.classList.toggle('go', on && right); });
      all('.out').forEach((g) => { const on = g.dataset.out === to; g.classList.toggle('on', on); g.classList.toggle('go', on && right); g.classList.toggle('dim', on && !right); });
      outX.classList.toggle('on', !!to && !right);
      pipeA.style.setProperty('--fc', `var(--e-${d.from})`); pipeA.classList.add('run');
      pipeB.style.setProperty('--fc', right ? `var(--e-${to})` : 'var(--rule)'); pipeB.classList.toggle('run', right);
      tagIn.textContent = NAME[d.from]; tagOut.textContent = to ? NAME[to] : '?';
      pct.textContent = d.dev === 'phone' && right ? '충전 중' : '20%';
      msg.classList.toggle('ok', right); msg.classList.toggle('no', !!to && !right);
      msgT.textContent = !to ? `${d.name}: 나오는 에너지를 골라 보세요` : right ? `✓ ${d.name} — ${NAME[d.from]} → ${NAME[to]}` : `✕ 멈췄어요. ${d.hint}`;
      if (shake && to && !right) { const dev = svg.querySelector('.dev.on'); dev.classList.remove('no'); dev.getBoundingClientRect(); dev.classList.add('no'); }
    }
    const grade = () => {
      if (!shown) return;
      let ok = 0;
      rows.forEach((r) => {
        const p = pick(r), right = p === r.dataset.a; if (right) ok++;
        r.classList.toggle('ok', right); r.classList.toggle('no', !!p && !right);
        r.querySelectorAll('button').forEach((b) => b.classList.toggle('answer', b.dataset.v === r.dataset.a));
      });
      score.textContent = `맞힌 줄 ${ok} / ${rows.length}`;
    };
    rows.forEach((r) => {
      const btns = [...r.querySelectorAll('.seg button')];
      btns.forEach((b) => b.setAttribute('aria-pressed', 'false'));
      single(btns, () => { cur = r; grade(); show(true); });
      r.addEventListener('click', (e) => { if (!e.target.closest('button')) { cur = r; show(); } });
    });
    root.querySelector('#conv-show').addEventListener('click', () => { shown = true; grade(); show(); });
    show();
    // 해 볼 일: ① 줄 고르기 ② 맞는 에너지로 기구 움직이기 ③ 다섯 모두
    let touched = false;
    root.querySelector('.sort-rows').addEventListener('click', () => { touched = true; });
    return watch(root, () => {
      const ok = rows.filter((r) => pick(r) === r.dataset.a).length;
      return ok === rows.length || shown ? 0 : ok > 0 ? 3 : touched ? 2 : 1;
    });
  });

  // 3. 설명: 햇빛을 모아 두는 방법(사진) — 누른 사진에 맞는 왼쪽 상자가 밝아진다
  part('bio', (root) => {
    const rows = [...root.querySelectorAll('.lv-row')];
    root.querySelector('.gv').addEventListener('gv-pick', (e) => rows.forEach((x) => x.classList.toggle('on', x.dataset.k === e.detail.b.dataset.row)));
    return window.RxT.gallery(root);
  });
  // 4. 체험: 광합성 — ① 햇빛 끄기 ② 다시 켜기 ③ 시간 막대 끝까지
  part('photo', (root) => {
    const li = root.querySelector('#ph-light'), tm = root.querySelector('#ph-time'); let dark = false, again = false, far = false;
    return join(window.Photosynthesis.mount(root), watch(root, () => {
      if (+li.value <= 10) dark = true;
      if (dark && +li.value >= 50) again = true;
      if (+tm.value >= 3.9) far = true;
      return again && far ? 0 : again ? 3 : dark ? 2 : 1;
    }));
  });
  // 5. 설명: 태양의 열이 공기와 물을 움직인다 — Manim 단계, 맞는 왼쪽 상자가 밝아진다
  part('heatflow', (root) => {
    const defs = [...root.querySelectorAll('.hf-def')];
    root.addEventListener('st-step', (e) => defs.forEach((x) => x.classList.toggle('on', x.dataset.s.split(' ').includes(String(e.detail)))));
    return window.RxT.stepper(root);
  });

  // 4. 바람: 예측 하나 고르기 + 해풍·육풍 그림
  part('wind', (root) => {
    const btns = [...root.querySelectorAll('.wind-pred .seg button')];
    btns.forEach((b) => b.setAttribute('aria-pressed', 'false'));
    single(btns);
    // 해 볼 일: ① 낮 바람 예측 ② 밤으로 옮기기 ③ 하루 흘려 보기
    const tm = root.querySelector('#wd-time'), play = root.querySelector('#wd-play'); let night = false, ran = false;
    return join(window.SeaBreeze.mount(root), watch(root, () => {
      const pred = btns.some((b) => b.getAttribute('aria-pressed') === 'true');
      const h = +tm.value; if (h < 5 || h > 20) night = true;
      if (play.getAttribute('aria-pressed') === 'true') ran = true;
      return pred && night && ran ? 0 : pred && night ? 3 : pred ? 2 : 1;
    }));
  });

  // 7. 체험: 물의 순환 — ① 따라가기 ② 발전소 끄기 ③ 다시 켜기
  part('water', (root) => {
    const fo = root.querySelector('#wt-follow'), dam = root.querySelector('#wt-dam'); let a = false, off = false, on2 = false;
    return join(window.WaterCycle.mount(root), watch(root, () => {
      if (fo.getAttribute('aria-pressed') === 'true') a = true;
      const isOn = dam.getAttribute('aria-pressed') === 'true';
      if (!isOn) off = true; else if (off) on2 = true;
      return a && on2 ? 0 : off ? 3 : a ? 2 : 1;
    }));
  });

  // 6. 흐름도: 에너지 카드를 끌어다(또는 카드 → 빈칸 차례로 눌러) 알맞은 빈칸에 놓는다. 채운 칸으로 가는 길에 에너지가 흐른다.
  //    선생님은 → 로 하나씩 채울 수 있다(단계). 모두 채우면 태양에서 모든 갈래로 흐른다. 태양이 근원일까?(○×)
  part('flow', (root) => {
    const boxes = [...root.querySelectorAll('.ef-q')];
    const links = [...root.querySelectorAll('.ef-links path')];
    const chips = [...root.querySelectorAll('.ef-chip')];
    const msg = root.querySelector('.ef-msg'), wrap = root.querySelector('.ef-wrap');
    const filled = new Set();                                   // 학생이 채운 칸(data-i)
    let fragOn = new Set(), picked = null;
    const isOn = (b) => filled.has(b.dataset.i) || fragOn.has(b.dataset.i);
    function paint() {
      boxes.forEach((b) => b.classList.toggle('on', isOn(b)));
      links.forEach((l) => {
        const t = l.dataset.to, box = boxes.find((b) => b.dataset.i === t);
        const live = t === 'light' || t === 'heat' || (box && isOn(box));
        l.classList.toggle('live', !!live);
        l.style.setProperty('--c', t === 'light' ? 'var(--e-light-ink)' : t === 'heat' ? 'var(--e-heat)' : box ? `var(--e-${box.dataset.e})` : 'var(--ink-2)');
      });
      const done = boxes.every(isOn);
      wrap.classList.toggle('done', done);
      chips.forEach((c) => { c.hidden = c.classList.contains('used') || done; });
      if (done) msg.textContent = '완성! 지구의 에너지 대부분은 태양에서 출발해요';
    }
    function tryPlace(chip, box) {
      if (!chip || !box) return;
      if (isOn(box)) { msg.textContent = '이미 채운 칸이에요'; return; }
      if (chip.dataset.e === box.dataset.e) {
        filled.add(box.dataset.i); chip.classList.add('used');
        msg.textContent = `맞아요: ${box.querySelector('.ef-s').textContent} → ${chip.textContent}`;
        if (window.gsap) gsap.fromTo(box, { scale: 0.85, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.4, ease: 'back.out(3)' });
      } else {
        msg.textContent = `다시 생각해 보자: ${box.querySelector('.ef-s').textContent}에서는 어떤 에너지일까?`;
        box.classList.remove('bad'); box.getBoundingClientRect(); box.classList.add('bad');
        chip.classList.remove('bad'); chip.getBoundingClientRect(); chip.classList.add('bad');
      }
      unpick(); paint();
    }
    const unpick = () => { if (picked) picked.setAttribute('aria-pressed', 'false'); picked = null; boxes.forEach((b) => b.classList.remove('target')); };
    chips.forEach((c) => {
      c.setAttribute('aria-pressed', 'false');
      let sx = 0, sy = 0, moved = false, dragging = false;
      c.addEventListener('pointerdown', (e) => { sx = e.clientX; sy = e.clientY; moved = false; dragging = true; c.setPointerCapture(e.pointerId); e.stopPropagation(); });
      c.addEventListener('pointermove', (e) => {
        if (!dragging) return;
        const dx = e.clientX - sx, dy = e.clientY - sy;
        if (!moved && Math.hypot(dx, dy) < 6) return;
        moved = true;
        const k = (window.Reveal && Reveal.getScale && Reveal.getScale()) || 1;
        c.classList.add('drag'); c.style.transform = `translate(${dx / k}px, ${dy / k}px)`;
        c.style.pointerEvents = 'none';
        const over = document.elementFromPoint(e.clientX, e.clientY);
        c.style.pointerEvents = '';
        boxes.forEach((b) => b.classList.toggle('target', !!over && over.closest('.ef-q') === b));
      });
      c.addEventListener('pointerup', (e) => {
        if (!dragging) return; dragging = false;
        if (!moved) {                                           // 눌러서 고르기
          const on = picked !== c; unpick();
          if (on) { picked = c; c.setAttribute('aria-pressed', 'true'); msg.textContent = '이 카드를 놓을 빈칸을 눌러요'; }
          return;
        }
        c.style.visibility = 'hidden';
        const over = document.elementFromPoint(e.clientX, e.clientY);
        c.style.visibility = ''; c.classList.remove('drag'); c.style.transform = '';
        boxes.forEach((b) => b.classList.remove('target'));
        const box = over && over.closest('.ef-q');
        if (box) tryPlace(c, box); else msg.textContent = '빈칸 위에 놓아 보자';
      });
      c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') e.stopPropagation(); });
      c.addEventListener('click', (e) => { if (e.detail === 0) { const on = picked !== c; unpick(); if (on) { picked = c; c.setAttribute('aria-pressed', 'true'); } } });   // 키보드
    });
    boxes.forEach((b) => {
      const place = () => { if (picked) tryPlace(picked, b); else msg.textContent = '먼저 에너지 카드를 골라요(끌어다 놓아도 돼요)'; };
      b.addEventListener('click', place);
      b.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); place(); } });
    });
    root.querySelector('#ef-all').addEventListener('click', () => { boxes.forEach((b) => filled.add(b.dataset.i)); chips.forEach((c) => c.classList.add('used')); unpick(); paint(); });
    const frags = () => new Set([...root.querySelectorAll('[data-anim="efill"]')].filter((f) => f.classList.contains('visible')).map((f) => f.dataset.fragmentIndex));
    paint();
    // 근원 ○×
    const items = [...root.querySelectorAll('.origin .qs li')];
    const score = root.querySelector('.origin-score');
    const grade = () => {
      const done = items.filter((li) => li.dataset.picked);
      const ok = done.filter((li) => li.dataset.picked === li.dataset.a).length;
      score.textContent = done.length ? `맞힌 것 ${ok} / ${items.length}` : '';
    };
    items.forEach((li) => {
      const btns = [...li.querySelectorAll('.ox button')];
      btns.forEach((b) => b.addEventListener('click', () => {
        li.dataset.picked = b.dataset.v; li.classList.add('answered');
        btns.forEach((x) => { x.classList.toggle('pick', x === b); x.classList.toggle('right', x === b && b.dataset.v === li.dataset.a); x.classList.toggle('wrong', x === b && b.dataset.v !== li.dataset.a); });
        grade();
      }));
    });
    root.querySelector('#origin-show').addEventListener('click', () => {
      items.forEach((li) => { li.classList.add('answered'); li.querySelectorAll('.ox button').forEach((x) => x.classList.toggle('answer', x.dataset.v === li.dataset.a)); });
    });
    // 해 볼 일: ① 빛 갈래(빈칸 0·1·2) ② 열 갈래(3·4·5) ③ 근원 ○× 일곱
    const on = (ks) => ks.every((k) => boxes[k].classList.contains('on'));
    return join({
      fragment(f) { if (f.dataset.anim === 'efill') { fragOn = frags(); paint(); } },
      sync() { fragOn = frags(); paint(); },
    }, watch(root, () => {
      const a = on([0, 1, 2]), b = on([3, 4, 5]), c = items.every((li) => li.classList.contains('answered'));
      return a && b && c ? 0 : a && b ? 3 : a ? 2 : 1;
    }));
  });

  // 9. 미니 게임: 전환 따라가기(빠른 퀴즈)
  part('game2', (root) => window.EcoGame.mount(root, {
    id: 'conv', title: '45초 전환 따라가기', seconds: 45,
    intro: '«무엇 → ?» 화살표 뒤 에너지는?<br>«게임 시작»을 누르자',
    endSay: '틀린 카드는 «그 일로 무엇이 생겼나?»를 다시 물어보자',
    items: [
      { q: '잎의 광합성: 빛 → ?', a: 'chem', why: '포도당에 저장된다 → 화학 에너지.' },
      { q: '땅을 데운 햇볕: 빛 → ?', a: 'heat', why: '땅의 온도가 오른다 → 열에너지.' },
      { q: '바닷가 바람: 열 → ?', a: 'kin', why: '공기가 움직인다 → 운동 에너지.' },
      { q: '증발해 생긴 구름: 열 → ?', a: 'pot', why: '물이 높은 곳에 올라갔다 → 위치 에너지.' },
      { q: '산에서 흘러내리는 강물: 위치 → ?', a: 'kin', why: '물이 움직인다 → 운동 에너지.' },
      { q: '댐 터빈에 연결된 발전기: 운동 → ?', a: 'elec', why: '전류를 만든다 → 전기 에너지.' },
      { q: '지붕의 태양 전지: 빛 → ?', a: 'elec', why: '빛으로 전류를 만든다 → 전기 에너지.' },
      { q: '태양열 온수기: 빛 → ?', a: 'heat', why: '물을 데운다 → 열에너지.' },
      { q: '석탄을 태우는 보일러: 화학 → ?', a: 'heat', why: '타면서 뜨거워진다 → 열에너지.' },
      { q: '휴대폰 충전: 전기 → ?', a: 'chem', why: '배터리 속 물질에 저장된다 → 화학 에너지.' },
      { q: '켜진 형광등: 전기 → ?', a: 'light', why: '빛을 내려고 켠다 → 빛에너지.' },
      { q: '돌아가는 선풍기 날개: 전기 → ?', a: 'kin', why: '날개가 돈다 → 운동 에너지.' },
      { q: '밥 먹고 달리기: 화학 → ?', a: 'kin', why: '몸이 움직인다 → 운동 에너지.' },
      { q: '엘리베이터가 올라감: 전기 → ?', a: 'pot', why: '높은 곳으로 올라간다 → 위치 에너지.' },
      { q: '내리막을 달리는 롤러코스터: 위치 → ?', a: 'kin', why: '높이가 줄고 빨라진다 → 운동 에너지.' },
      { q: '풀을 먹은 소: 풀의 화학 → 소의 ?', a: 'chem', why: '몸속 양분으로 저장된다 → 화학 에너지.' },
    ],
  }));

  part('sum2', (root) => window.RxT.sum(root));
  part('confirm2', (root) => { window.LessonParts.mountWrap(root); });
})();
