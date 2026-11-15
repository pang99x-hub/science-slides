/* 1-2-2 «재미» 묶음(2026-10-31 선생님: «화학파트는 다른 단원에 비해 상대적으로 노잼이다»).
   ① 먼저 보고 놀라기 + 예측 걸기(.hook): 이론 장 그림 칸 위에 덮개로 뜬다. 보기(.share-opts)는 수업방이 그대로 센다.
      단계 data-anim="bet" → 정답 보기가 빛나고 작은 불꽃·흔들림 + 실험 영상 재생, data-anim="hookoff" → 덮개가 걷히고 이론 그림.
   ② 기존 예측(abq·abrow)도 공개될 때 정답 보기에 불꽃.
   ③ 미니 게임(.game[data-game]): color(지시약 색 맞히기 연속) · sort(산·염기 빨리 가르기 30초) · titr(중화 적정 챌린지, data-ind="btb|pp").
      최고 기록은 이 기기에만(localStorage, 막혀 있으면 기록 없이). 성공하면 휴대폰 진동(지원 기기만).
      수업방이 켜져 있으면 빠른 퀴즈(엔진 quiz.js): 선생님이 시작하면 모두 같은 순간·같은 문제 차례로 하고 답은 선생님 통계로 간다.
        색 맞히기 = 여덟 물질 한 번씩(60초) · 빨리 가르기 = 30초 · 적정 = 같은 비밀 염산으로 한 번(60초, 중화점과 가까울수록 점수).
   장 모듈 등록은 Deck.part(장 id, …)로 — 한 장에 모듈이 여럿이어도 된다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const reduce = () => !!window.Deck.reduce;
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem('ab122-' + k)); } catch { return null; } },
    set(k, v) { try { localStorage.setItem('ab122-' + k, JSON.stringify(v)); } catch { /* 저장 막힘: 기록 없이 */ } },
  };
  const buzz = (p) => { try { if (navigator.vibrate) navigator.vibrate(p); } catch { /* 지원 안 함 */ } };
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const pick = (a, r = Math.random) => a[Math.floor(r() * a.length)];
  // 화학식 글자(<sub>2</sub> → ₂) — 선생님 통계 카드 이름은 글자만 쓴다
  const SUB = '₀₁₂₃₄₅₆₇₈₉', SUP = { '+': '⁺', '−': '⁻', '-': '⁻', 2: '²', 3: '³' };
  const plain = (html) => html.replace(/<sub>(\d+)<\/sub>/g, (_, d) => [...d].map((c) => SUB[c]).join('')).replace(/<sup>([^<]+)<\/sup>/g, (_, t) => [...t].map((c) => SUP[c] || c).join('')).replace(/<[^>]+>/g, '');
  // 빠른 퀴즈 손잡이(수업방이 없으면 null → 혼자 하기 그대로)
  const quizOf = (root, F, o) => (window.Quiz ? window.Quiz.attach(root, { host: F.body, show: () => F.show(true), ...o }) : null);
  const live = (qz) => !!(qz && qz.running());
  // 받침에 맞춘 조사: jo('식초', '은', '는') → 식초는
  const jo = (w, a1, a2) => { const c = w.replace(/<[^>]+>/g, '').trim().slice(-1).charCodeAt(0); const has = c >= 0xac00 && c <= 0xd7a3 ? (c - 0xac00) % 28 !== 0 : /[0-9LMNR]$/i.test(String.fromCharCode(c)); return w + (has ? a1 : a2); };

  // 작은 불꽃: 대상 가운데에서 색 조각이 퍼진다
  function burst(target, n = 16) {
    if (!target || reduce()) return;
    const b = el('span', 'fx-burst'); b.setAttribute('aria-hidden', 'true');
    const cols = ['#f2c230', '#e0463c', '#3fa65c', '#2c62c6', '#ec8a3a'];
    for (let i = 0; i < n; i++) {
      const s = el('i'); const a = (i / n) * Math.PI * 2, r = 70 + Math.random() * 60;
      s.style.setProperty('--dx', Math.cos(a) * r + 'px'); s.style.setProperty('--dy', Math.sin(a) * r + 'px'); s.style.background = cols[i % cols.length];
      b.appendChild(s);
    }
    target.appendChild(b); setTimeout(() => b.remove(), 1000);
  }
  function shake(target) { if (!target || reduce()) return; target.classList.remove('fx-shake'); void target.offsetWidth; target.classList.add('fx-shake'); setTimeout(() => target.classList.remove('fx-shake'), 600); }
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));

  // ① 먼저 보고 놀라기 + 예측 걸기
  function hook(root) {
    const hk = root.querySelector('.hook'), v = hk.querySelector('video'), btns = [...hk.querySelectorAll('.share-opts button')];
    const right = hk.querySelector('.share-opts button[data-right]'), play = hk.querySelector('.hk-play');
    single(btns);
    let active = false;
    const run = () => { if (!v) return; try { v.currentTime = 0; } catch { /* 아직 못 읽음 */ } const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    if (play) play.addEventListener('click', run);
    function reveal(on, anim) {
      hk.classList.toggle('shown', on);
      btns.forEach((b) => { b.classList.toggle('right', on && b === right); b.classList.toggle('wrong', on && b !== right && b.getAttribute('aria-pressed') === 'true'); });
      if (on && anim) { burst(right); shake(hk.querySelector('.bet')); buzz(40); if (active) run(); }
    }
    const off = (on) => { hk.classList.toggle('off', on); if (on && v) v.pause(); };
    return {
      setActive(on) { active = on; if (!on && v) v.pause(); },
      fragment(f, on) { if (f.dataset.anim === 'bet') reveal(on, on); if (f.dataset.anim === 'hookoff') off(on); },
      sync(slide) {
        const b = slide.querySelector('[data-anim="bet"]'), h = slide.querySelector('[data-anim="hookoff"]');
        reveal(!!b && b.classList.contains('visible'), false); off(!!h && h.classList.contains('visible'));
      },
    };
  }

  // ② 기존 예측 공개에 불꽃
  function sparkle() {
    return { fragment(f, on) { if (on && (f.dataset.anim === 'abq' || f.dataset.anim === 'abrow')) setTimeout(() => { const a = f.closest('section').querySelector('.share-opts .ab-ans'); if (a) burst(a); }, 80); } };
  }

  // ③ 미니 게임 공통 틀: 여는 단추(.gm-open) → 무대 위 덮개(.game)
  function frame(root, g, title) {
    const open = root.querySelector('.gm-open');
    g.innerHTML = '';
    const head = el('div', 'gm-head', `<b class="gm-title">${title}</b><span class="gm-score" aria-live="polite"></span><button type="button" class="btn gm-close">닫기</button>`);
    const body = el('div', 'gm-body'); g.append(head, body);
    const show = (on) => { g.hidden = !on; if (open) open.setAttribute('aria-pressed', String(on)); };
    if (open) open.addEventListener('click', () => show(g.hidden));
    head.querySelector('.gm-close').addEventListener('click', () => show(false));
    show(false);
    return { head, body, score: head.querySelector('.gm-score'), show };
  }

  // 지시약 색 맞히기(연속 기록)
  const SUBS = [['레몬즙', 'a'], ['식초', 'a'], ['묽은 염산', 'a'], ['탄산음료', 'a'], ['설탕물', 'n'], ['빨랫비누 물', 'b'], ['제빵 소다 물', 'b'], ['수산화 나트륨 수용액', 'b']];
  const KIND = { a: '산성', n: '중성', b: '염기성' };
  const INDS = {
    blue: ['푸른 리트머스 종이', [['붉은색', '#d95560'], ['푸른색', '#5c86cf']], { a: 0, n: 1, b: 1 }],
    red: ['붉은 리트머스 종이', [['붉은색', '#d95560'], ['푸른색', '#5c86cf']], { a: 0, n: 0, b: 1 }],
    btb: ['BTB 용액', [['노란색', '#ecc51e'], ['초록색', '#3fa65c'], ['파란색', '#2c62c6']], { a: 0, n: 1, b: 2 }],
    pp: ['페놀프탈레인 용액', [['무색', '#f4f4f4'], ['붉은색', '#e2457f']], { a: 0, n: 0, b: 1 }],
  };
  function colorGame(root, g) {
    const F = frame(root, g, '지시약 색 맞히기');
    let streak = 0, best = store.get('color') || 0, q = null, done = false, timer = 0;
    // 빠른 퀴즈: 여덟 물질을 한 번씩(같은 차례·같은 지시약), 60초. 맞히면 10점 + 연속 덤
    const QN = SUBS.length, QT = 60;
    let Z = null;                                    // { rand, order, i, score, end(ms), iv }
    const qz = quizOf(root, F, {
      id: 'ab122-color', title: '지시약 색 맞히기', durationMs: QT * 1000,
      items: SUBS.map((x, i) => ({ id: 's' + i, label: `${x[0]} → ${KIND[x[1]]}` })),
      onStart(seed, info) {
        const rand = window.Quiz.rng(seed), order = window.Quiz.shuffle(SUBS.map((_, i) => i), rand);
        Z = { rand, order, inds: order.map(() => pick(Object.keys(INDS), rand)), i: 0, score: (info.resume && info.resume.s) || 0, end: performance.now() + QT * 1000 - info.elapsed };
        if (info.resume) Z.i = Math.min(QN, Object.keys(info.resume.a || {}).length);
        streak = 0; clearInterval(Z.iv); Z.iv = setInterval(() => { if (Z && performance.now() >= Z.end) qEnd(); else upd(); }, 250);
        if (Z.i >= QN) qEnd(); else next();
      },
      onStop() { if (Z) { clearInterval(Z.iv); clearTimeout(timer); Z = null; upd(); next(); } },   // 판이 끝나면 덮개 아래에서 혼자 하기로
    });
    function qEnd() { if (!Z) return; clearInterval(Z.iv); clearTimeout(timer); done = true; const sc = Z.score; if (live(qz)) qz.finish(sc); Z = null; msg.innerHTML = `끝! <b>${sc}점</b> <button type="button" class="btn gm-next">혼자 더 하기</button>`; msg.querySelector('.gm-next').addEventListener('click', next); upd(); }
    const upd = () => {
      if (Z) F.score.innerHTML = `문제 <b>${Math.min(Z.i + 1, QN)}/${QN}</b> · 점수 <b>${Z.score}</b> · <b>${Math.max(0, Math.ceil((Z.end - performance.now()) / 1000))}</b>초`;
      else F.score.innerHTML = `연속 <b>${streak}</b> · 최고 <b>${best}</b>`;
    };
    const card = el('div', 'gm-q'), tube = el('div', 'gm-tube', '<i></i>'), txt = el('p', 'gm-ask'), opts = el('div', 'gm-opts'), msg = el('p', 'gm-msg');
    msg.setAttribute('aria-live', 'polite');
    card.append(tube, txt); F.body.append(card, opts, msg);
    function next() {
      clearTimeout(timer); done = false;
      let s, k;
      if (Z) { s = SUBS[Z.order[Z.i]]; k = Z.inds[Z.i]; }
      else do { s = pick(SUBS); k = pick(Object.keys(INDS)); } while (q && q.s === s && q.k === k);
      q = { s, k }; const [nm, os] = INDS[k];
      tube.querySelector('i').style.background = '#eef3f7';
      txt.innerHTML = `<b>${s[0]}</b>에 <b>${nm}</b>${jo(nm, '을', '를').slice(nm.length)} 대면?`;
      opts.innerHTML = ''; opts.style.setProperty('--n', os.length);
      os.forEach(([n, c], i) => { const b = el('button', 'gm-opt', `<i style="--c:${c}"></i>${n}`); b.type = 'button'; b.addEventListener('click', () => answer(i, b)); opts.appendChild(b); });
      msg.textContent = '색을 골라 보자.';
    }
    function answer(i, b) {
      if (done) return; done = true;
      const [nm, os, ans] = INDS[q.k], r = ans[q.s[1]], [cn, cc] = os[r];
      tube.querySelector('i').style.background = cc;
      const why = `${jo(q.s[0], '은', '는')} ${KIND[q.s[1]]} → ${nm.replace(' 종이', '').replace(' 용액', '')} ${cn}`;
      if (Z) {                                       // 빠른 퀴즈: 틀려도 잠깐 뒤 다음 문제로
        const okq = i === r;
        if (okq) { Z.score += 10 + Math.min(streak, 5) * 2; streak++; b.classList.add('right'); burst(b, 12); } else { streak = 0; b.classList.add('wrong'); opts.children[r].classList.add('right'); shake(card); }
        if (live(qz)) qz.answer('s' + SUBS.indexOf(q.s), okq, Z.score);
        msg.innerHTML = okq ? `정답! ${why}` : `아쉽다 — ${why}`;
        Z.i++; upd();
        timer = setTimeout(() => { if (!Z) return; if (Z.i >= QN) qEnd(); else next(); }, okq ? 900 : 1600);
        return;
      }
      if (i === r) {
        streak++; if (streak > best) { best = streak; store.set('color', best); }
        b.classList.add('right'); burst(b, 12);
        msg.innerHTML = `정답! ${why}` + (streak && streak % 5 === 0 ? ` · <b>${streak}연속!</b>` : '');
        if (streak % 5 === 0) buzz([40, 30, 40]);
        timer = setTimeout(next, 1300);
      } else {
        b.classList.add('wrong'); opts.children[r].classList.add('right'); shake(card);
        msg.innerHTML = `아쉽다 — ${why}. 연속 기록은 0부터. <button type="button" class="btn gm-next">다음 문제</button>`;
        msg.querySelector('.gm-next').addEventListener('click', next); streak = 0;
      }
      upd();
    }
    upd(); next();
    return { setActive(on) { if (!on && !live(qz)) { clearTimeout(timer); F.show(false); } } };
  }

  // 산·염기 빨리 가르기(30초)
  const ITEMS = [
    ['HCl', 'a', 'HCl → H<sup>+</sup> + Cl<sup>−</sup>'], ['HNO<sub>3</sub>', 'a', 'HNO<sub>3</sub> → H<sup>+</sup> + NO<sub>3</sub><sup>−</sup>'],
    ['CH<sub>3</sub>COOH', 'a', 'CH<sub>3</sub>COOH → H<sup>+</sup> + CH<sub>3</sub>COO<sup>−</sup>'], ['H<sub>2</sub>SO<sub>4</sub>', 'a', 'H<sub>2</sub>SO<sub>4</sub> → 2H<sup>+</sup> + SO<sub>4</sub><sup>2−</sup>'],
    ['H<sub>2</sub>CO<sub>3</sub>', 'a', 'H<sub>2</sub>CO<sub>3</sub> → 2H<sup>+</sup> + CO<sub>3</sub><sup>2−</sup>'],
    ['NaOH', 'b', 'NaOH → Na<sup>+</sup> + OH<sup>−</sup>'], ['KOH', 'b', 'KOH → K<sup>+</sup> + OH<sup>−</sup>'],
    ['Ca(OH)<sub>2</sub>', 'b', 'Ca(OH)<sub>2</sub> → Ca<sup>2+</sup> + 2OH<sup>−</sup>'], ['Ba(OH)<sub>2</sub>', 'b', 'Ba(OH)<sub>2</sub> → Ba<sup>2+</sup> + 2OH<sup>−</sup>'],
    ['NH<sub>4</sub>OH', 'b', 'NH<sub>4</sub>OH → NH<sub>4</sub><sup>+</sup> + OH<sup>−</sup>'],
  ];
  function sortGame(root, g) {
    const F = frame(root, g, '산·염기 빨리 가르기 · 30초');
    const T = 30; let left = T, score = 0, best = store.get('sort') || 0, cur = null, iv = 0, on = false, rand = Math.random;
    const qz = quizOf(root, F, {
      id: 'ab122-sort', title: '산·염기 빨리 가르기 30초', durationMs: T * 1000,
      items: ITEMS.map((x, i) => ({ id: 'f' + i, label: `${plain(x[0])} → ${x[1] === 'a' ? '산' : '염기'}` })),
      onStart: (seed, info) => go(seed, info),
      onStop: () => { if (on) stop(true); },
    });
    const top = el('div', 'gm-bar', '<i></i>'), card = el('div', 'gm-card'), eq = el('p', 'gm-eq'), opts = el('div', 'gm-opts two'), msg = el('p', 'gm-msg');
    msg.setAttribute('aria-live', 'polite');
    const bA = el('button', 'gm-opt big k-a', '산<small>H<sup>+</sup>을 내놓음</small>'), bB = el('button', 'gm-opt big k-b', '염기<small>OH<sup>−</sup>을 내놓음</small>');
    bA.type = bB.type = 'button'; opts.append(bA, bB);
    const start = el('button', 'btn play gm-start', '시작'); start.type = 'button';
    F.body.append(top, card, eq, opts, msg, start);
    const upd = () => { F.score.innerHTML = `점수 <b>${score}</b> · 최고 <b>${best}</b> · <b>${Math.max(0, Math.ceil(left))}</b>초`; top.querySelector('i').style.width = (left / T * 100) + '%'; };
    const nextItem = () => { let x; do { x = pick(ITEMS, rand); } while (cur && x === cur); cur = x; card.innerHTML = x[0]; card.classList.remove('gone'); };
    function stop(fin) {
      clearInterval(iv); on = false; opts.classList.add('off'); start.hidden = false; start.textContent = '다시 하기';
      if (fin && live(qz)) qz.finish(score);
      if (fin) {
        const nb = score > best; if (nb) { best = score; store.set('sort', best); buzz([50, 30, 50]); burst(card, 20); }
        card.innerHTML = `${score}개`; msg.innerHTML = nb ? '<b>새 최고 기록!</b> 산은 모두 H<sup>+</sup>, 염기는 모두 OH<sup>−</sup>을 내놓았다.' : '산은 모두 H<sup>+</sup>, 염기는 모두 OH<sup>−</sup>을 내놓았다.';
      }
      upd();
    }
    // seed가 있으면(빠른 퀴즈) 모두 같은 화학식 차례, 늦게 들어오면 지난 시간만큼 줄인다
    function go(seed, info) {
      rand = seed != null && window.Quiz ? window.Quiz.rng(seed) : Math.random; cur = null;
      score = (info && info.resume && info.resume.s) || 0; left = Math.max(1, T - ((info && info.elapsed) || 0) / 1000); on = true; opts.classList.remove('off'); start.hidden = true; eq.innerHTML = ''; msg.textContent = '화학식을 보고 산인지 염기인지 빨리 누르자.';
      nextItem(); upd(); clearInterval(iv);
      iv = setInterval(() => { left -= 0.1; if (left <= 0) stop(true); else upd(); }, 100);
    }
    function ans(k, b) {
      if (!on) return;
      eq.innerHTML = cur[2];
      if (live(qz)) qz.answer('f' + ITEMS.indexOf(cur), k === cur[1], score + (k === cur[1] ? 1 : 0));
      if (k === cur[1]) { score++; b.classList.add('flash'); setTimeout(() => b.classList.remove('flash'), 250); card.classList.add('gone'); setTimeout(nextItem, 160); }
      else { left -= 2; shake(card); msg.innerHTML = `${cur[0]} → ${cur[1] === 'a' ? '산' : '염기'} — 2초 깎임`; setTimeout(nextItem, 450); }
      upd();
    }
    bA.addEventListener('click', () => ans('a', bA)); bB.addEventListener('click', () => ans('b', bB));
    start.addEventListener('click', () => go());
    opts.classList.add('off'); card.innerHTML = 'HCl? NaOH?'; msg.textContent = '«시작»을 누르면 30초 동안 화학식이 하나씩 나온다.'; upd();
    return { setActive(a) { if (!a && !live(qz)) { if (on) stop(false); F.show(false); } } };
  }

  // 중화 적정 챌린지: 염산 10 mL(농도는 비밀)에 NaOH 수용액을 넣다가 중화점에서 멈춘다
  function titrGame(root, g) {
    const ind = g.dataset.ind || 'btb';
    const F = frame(root, g, ind === 'pp' ? '중화 적정 챌린지 · 페놀프탈레인' : '중화 적정 챌린지 · BTB');
    const key = 'titr-' + ind; let best = store.get(key), A = 10, add = 0, over = false, rand = Math.random, qT = 0;
    // 빠른 퀴즈: 모두 같은 비밀 염산(seed)으로 한 번, 60초. 점수 = 100 − 중화점과 차이(mL)×40
    const qz = quizOf(root, F, {
      id: 'ab122-titr-' + ind, title: ind === 'pp' ? '중화 적정 챌린지(페놀프탈레인)' : '중화 적정 챌린지(BTB)', durationMs: 60000,
      items: [{ id: 'eq', label: '중화점 맞히기(±0.5 mL 안)' }],
      onStart(seed, info) { rand = window.Quiz.rng(seed); fresh(); clearTimeout(qT); qT = setTimeout(() => { if (!over) stop(); }, Math.max(500, 60000 - info.elapsed)); },
      onStop() { clearTimeout(qT); if (!over) { over = true; wrap.querySelectorAll('.gm-a, .gm-b, .gm-stop').forEach((b) => { b.disabled = true; }); } },
    });
    const wrap = el('div', 'gm-titr');
    wrap.innerHTML = `<svg viewBox="0 0 360 400" class="gm-svg" aria-label="뷰렛 아래 삼각 플라스크. 넣은 부피에 따라 지시약 색이 바뀐다">
      <rect x="166" y="0" width="28" height="120" rx="6" fill="#eef6fb" stroke="#1d2433" stroke-width="3"/><rect class="gm-bu" x="170" y="10" width="20" height="106" fill="#bcd9ef"/>
      <path d="M172 120 L188 120 L184 150 L176 150 Z" fill="#1d2433"/><circle class="gm-drop" cx="180" cy="160" r="7" fill="#9cc7e8" opacity="0"/>
      <path d="M140 190 L220 190 L220 230 L320 380 L40 380 L140 230 Z" fill="#fbfdff" stroke="#1d2433" stroke-width="4" stroke-linejoin="round"/>
      <path class="gm-liq" d="M104 290 L256 290 L320 380 L40 380 Z" fill="#ecc51e" stroke="none"/>
      <path d="M140 190 L220 190 L220 230 L320 380 L40 380 L140 230 Z" fill="none" stroke="#1d2433" stroke-width="4" stroke-linejoin="round"/></svg>
      <div class="gm-side"><p class="gm-read">넣은 NaOH 수용액 <b class="gm-v">0.0</b> mL</p><p class="gm-read">온도 <b class="gm-t">24.5</b> °C</p>
      <div class="gm-btns"><button type="button" class="btn gm-a">한 방울 +0.5 mL</button><button type="button" class="btn gm-b">아주 조금 +0.1 mL</button><button type="button" class="btn play gm-stop">여기서 멈춤!</button></div>
      <p class="gm-msg" aria-live="polite"></p><button type="button" class="btn gm-new" hidden>새 염산으로 다시</button></div>`;
    F.body.appendChild(wrap);
    const $ = (s) => wrap.querySelector(s);
    const mix = (c1, c2, t) => { const p = (c) => [1, 3, 5].map((i) => parseInt(c.slice(i, i + 2), 16)); const a = p(c1), b = p(c2); return '#' + a.map((x, i) => Math.round(x + (b[i] - x) * Math.max(0, Math.min(1, t))).toString(16).padStart(2, '0')).join(''); };
    function color() {
      const d = add - A;
      if (ind === 'pp') return d < -0.05 ? '#f6f8fb' : d < 0.4 ? mix('#f6f8fb', '#f4a6c6', (d + 0.05) / 0.45) : mix('#f4a6c6', '#d6246e', (d - 0.4) / 1.5);
      if (d < -0.9) return '#ecc51e'; if (d < -0.15) return mix('#ecc51e', '#3fa65c', (d + 0.9) / 0.75);
      if (d <= 0.15) return '#3fa65c'; if (d < 0.9) return mix('#3fa65c', '#2c62c6', (d - 0.15) / 0.75); return '#2c62c6';
    }
    const temp = () => 24.5 + 8 * Math.min(add, A) / (10 + add);
    const fmt = (x) => x.toFixed(1);
    function draw() {
      $('.gm-liq').setAttribute('fill', color()); $('.gm-v').textContent = fmt(add); $('.gm-t').textContent = fmt(temp());
      $('.gm-bu').setAttribute('height', String(Math.max(6, 106 - add * 5))); $('.gm-bu').setAttribute('y', String(116 - Math.max(6, 106 - add * 5)));
      F.score.innerHTML = best != null ? `최고 기록: 중화점과 <b>${fmt(best)} mL</b> 차이` : '최고 기록 없음';
    }
    function drop(v) {
      if (over) return; add = Math.round((add + v) * 10) / 10;
      const d = $('.gm-drop'); if (!reduce() && window.gsap) gsap.fromTo(d, { attr: { cy: 158 }, opacity: 1 }, { attr: { cy: 300 }, opacity: 0, duration: 0.35, ease: 'power1.in' });
      if (ind === 'pp' && add < A - 0.05 && add > A - 3 && !reduce()) { const L = $('.gm-liq'); L.setAttribute('fill', '#f7c6da'); setTimeout(draw, 260); } else draw();
      $('.gm-msg').textContent = add > A + 3 ? '너무 많이 넣었다 — 이미 염기성이다.' : ind === 'pp' ? '연분홍이 사라지지 않고 남는 순간이 중화점 바로 뒤다.' : '초록색이 되는 순간이 중화점이다.';
      if (add >= 25) stop();
    }
    function stop() {
      if (over) return; over = true; const d = Math.abs(add - A);
      const star = d <= 0.15 ? '★★★ 딱 중화점!' : d <= 0.5 ? '★★ 아주 가깝다' : d <= 1.5 ? '★ 조금 벗어났다' : '다시 도전!';
      const nb = best == null || d < best; if (nb) { best = d; store.set(key, Math.round(d * 10) / 10); }
      if (d <= 0.15) { buzz([60, 40, 60]); burst($('.gm-stop'), 22); } else shake(wrap);
      if (live(qz)) { const sc = Math.max(0, Math.round(100 - d * 40)); clearTimeout(qT); qz.answer('eq', d <= 0.5, sc); qz.finish(sc); }
      $('.gm-msg').innerHTML = `${star} 중화점은 <b>${fmt(A)} mL</b>였다(넣은 양 ${fmt(add)} mL). 온도는 중화점에서 가장 높다.` + (nb ? ' <b>새 기록!</b>' : '');
      wrap.querySelectorAll('.gm-a, .gm-b, .gm-stop').forEach((b) => { b.disabled = true; }); $('.gm-new').hidden = false; draw();
    }
    function fresh() { A = 8 + Math.round(rand() * 12) / 2; rand = Math.random; add = 0; over = false; wrap.querySelectorAll('.gm-a, .gm-b, .gm-stop').forEach((b) => { b.disabled = false; }); $('.gm-new').hidden = true; $('.gm-msg').textContent = '염산 10 mL에 지시약을 넣었다. 농도는 비밀 — 한 방울씩 넣어 보자.'; draw(); }
    $('.gm-a').addEventListener('click', () => drop(0.5)); $('.gm-b').addEventListener('click', () => drop(0.1));
    $('.gm-stop').addEventListener('click', stop); $('.gm-new').addEventListener('click', fresh);
    fresh();
    return { setActive(on) { if (!on) F.show(false); } };
  }

  const GAMES = { color: colorGame, sort: sortGame, titr: titrGame };
  document.querySelectorAll('.reveal .slides > section').forEach((sec) => {
    if (!sec.id) return;
    if (sec.querySelector('.hook')) part(sec.id, hook);
    else if (sec.querySelector('.share-opts')) part(sec.id, sparkle);
    sec.querySelectorAll('.game[data-game]').forEach((g) => part(sec.id, (root) => GAMES[g.dataset.game](root, g)));
  });
  window.ABFun = { burst, shake, buzz };
})();
