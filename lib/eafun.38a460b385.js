/* 1-2-3 수업 도구(2026-10-31 «노잼» 보완 + 승인 틀).
   EAWatch(root, 칩 선택자, map(글) → 지금 단계 · 0이면 끝 · null이면 글 앞 ①②③)  체험 장 해 볼 일 ①②③과 «알게 된 것»
   EAPred(root, { ans: 정답 data-k, anim: 공개 조각 이름, say: 공개 때 풀이 })  예측 걸기 → 공개: 정답 단추가 빛나고 폭죽
   EAFirst(root)  «먼저 보고 놀라기»: 장에 처음 들어오면 실제 반응 영상 덮개가 열려 재생된다. «닫고 이론 보기»·«다시 보기»
   EAGame.mount(root, cfg)  빠르게 고르기 게임: 카드가 하나씩 나오고 단추로 고른다. 40초, 연속 정답, 최고 기록(이 기기에 저장)
                            수업방이 켜져 있으면 빠른 퀴즈(엔진 quiz.js): 선생님이 시작하면 모두 같은 순간·같은 카드 차례로 하고, 답은 선생님 통계로 간다
   EAChall(root)  3차시 설계 챌린지: 설계대 기록 줄을 읽어 점수·최고 기록·성공 진동
   EAT.burst(el) · EAT.buzz(pattern) */
(function () {
  'use strict';
  const reduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const buzz = (p) => { try { if (navigator.vibrate) navigator.vibrate(p); } catch { /* 막힌 곳 */ } };
  const store = {
    get(k) { try { return window.localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { window.localStorage.setItem(k, v); } catch { /* 저장 못 함 */ } },
  };
  // 폭죽: 단추 둘레로 작은 조각이 튄다
  function burst(el, cols) {
    if (!el || reduce()) return;
    const host = el.closest('section') || document.body, hr = host.getBoundingClientRect(), r = el.getBoundingClientRect();
    const sc = hr.width / (host.offsetWidth || hr.width);
    const cx = (r.left + r.width / 2 - hr.left) / sc, cy = (r.top + r.height / 2 - hr.top) / sc;
    const C = cols || ['#ffd84d', '#e2622b', '#2a8fb8', '#2f9e5b', '#d9483b'];
    for (let i = 0; i < 22; i++) {
      const p = document.createElement('i'); p.className = 'ea-bit';
      const a = (i / 22) * Math.PI * 2 + Math.random() * 0.3, d = 70 + Math.random() * 90;
      p.style.cssText = `left:${cx}px;top:${cy}px;background:${C[i % C.length]};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px;--r:${Math.random() * 360}deg`;
      host.appendChild(p); setTimeout(() => p.remove(), 1000);
    }
  }
  window.EAT = { burst, buzz, store };

  window.EAWatch = function (root, sel, map) {
    const chip = root.querySelector(sel); if (!chip) return;
    const all = [...root.querySelectorAll('.u-steps li')].map((li) => +li.dataset.s);
    const DIG = '①②③④';
    let cur = 1, was = false;
    const upd = () => {
      const t = chip.textContent.trim();
      let n = map ? map(t, chip) : null;
      if (n == null && chip.classList.contains('done')) n = 0;
      if (n == null) { const i = DIG.indexOf(t[0]); if (i >= 0) n = i + 1; }
      if (n === 0) { window.L1.steps(root, 0, all); window.L1.done(root, true); if (!was) { was = true; burst(root.querySelector('.u-learn b')); } return; }
      if (n != null) cur = Math.min(n, Math.max(...all));
      window.L1.steps(root, cur, all.filter((k) => k < cur)); window.L1.done(root, false);
    };
    new MutationObserver(upd).observe(chip, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    upd();
  };

  window.EAPred = function (root, o) {
    const btns = [...root.querySelectorAll('.share-opts button')];
    if (o.bind !== false) btns.forEach((b) => b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') !== 'true';
      btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
    }));
    const right = btns.find((b) => b.dataset.k === o.ans), say = root.querySelector('.ea-pred-say');
    let shown = false;
    const show = (on) => {
      btns.forEach((b) => { b.classList.toggle('answer', on && b === right); b.classList.toggle('dim', on && b !== right); });
      if (say) say.hidden = !on;
      if (on && !shown) { burst(right); buzz([40, 30, 60]); }
      shown = on;
    };
    return {
      fragment(f, on) { if (f.dataset.anim === o.anim) show(on); },
      sync(slide) { const f = slide.querySelector(`[data-anim="${o.anim}"]`); show(!!f && f.classList.contains('visible')); },
    };
  };

  // 덮개가 열려 있을 때 «다음»은 먼저 덮개를 닫는다(2026-10-31 «이론 장에 Manim이 안 나와»)
  const openFirst = () => { const s = window.Reveal && Reveal.getCurrentSlide(); return s && s._first && !s._first.box.hidden ? s : null; };
  document.addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key) || e.target.closest('input,textarea,button')) return;
    const s = openFirst(); if (s) { e.preventDefault(); e.stopImmediatePropagation(); s._first.set(false); }
  }, true);
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.navigate-right, .navigate-next')) return;
    const s = openFirst(); if (s) { e.preventDefault(); e.stopImmediatePropagation(); s._first.set(false); }
  }, true);
  window.EAFirst = function (root) {
    const box = root.querySelector('.ea-first'); if (!box) return {};
    const v = box.querySelector('video'), open = root.querySelector('.ea-first-open');
    let seen = false;
    const play = () => { try { v.currentTime = 0; } catch { /* 아직 못 읽음 */ } const p = v.play(); if (p && p.catch) p.catch(() => {}); };
    const set = (on) => { box.hidden = !on; if (open) open.hidden = on; if (on) play(); else v.pause(); };
    box.querySelector('.ea-first-close').addEventListener('click', () => set(false));
    box.querySelector('.ea-first-again').addEventListener('click', play);
    if (open) open.addEventListener('click', () => set(true));
    set(false);
    v.addEventListener('ended', () => setTimeout(() => { if (!box.hidden) set(false); }, 2000));   // 영상이 끝나면 덮개를 걷어 이론 그림(Manim)이 보이게
    root._first = { set, box };
    return { setActive(on) { if (on && !seen) { seen = true; set(true); } else if (!on) v.pause(); } };
  };

  // ---------- 빠르게 고르기 게임 ----------
  function mount(root, cfg) {
    const g = root.querySelector('.ea-game'), card = g.querySelector('.eg-card'), why = g.querySelector('.eg-why');
    const btns = [...g.querySelectorAll('.eg-ans button')], start = g.querySelector('.eg-start');
    const tEl = g.querySelector('.eg-time'), sEl = g.querySelector('.eg-score'), kEl = g.querySelector('.eg-streak'), bEl = g.querySelector('.eg-best');
    const now = root.querySelector('.eg-now'), bar = g.querySelector('.eg-tbar i');
    const KEY = 'ea123-best-' + cfg.id, LEN = cfg.seconds || 40;
    let best = +(store.get(KEY) || 0), score = 0, streak = 0, left = LEN, deck = [], cur = null, timer = null, last = 0, played = 0, lock = false, rand = Math.random;
    const shuffle = (a) => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
    const cards = cfg.items.map((it, i) => ({ ...it, k: 'c' + i }));
    // 빠른 퀴즈: 카드 이름은 «카드 → 정답 단추 이름»(선생님 화면 카드마다 정답률)
    const ansName = (v) => { const b = btns.find((x) => x.dataset.v === v); return b ? (b.querySelector('.eg-t') || b).textContent.replace(/\s+/g, ' ').trim() : v; };
    const quiz = window.Quiz ? window.Quiz.attach(root, {
      id: 'ea123-' + cfg.id, title: cfg.title || '', host: g, durationMs: LEN * 1000,
      items: cards.map((c) => ({ id: c.k, label: `${c.q} → ${ansName(c.a)}` })),
      onStart: (seed, info) => begin(seed, info),
      onStop: () => { if (timer) end(); },
    }) : null;
    const inRoom = () => !!(quiz && quiz.running());
    const paint = () => {
      sEl.textContent = score; kEl.textContent = streak; bEl.textContent = best;
      tEl.textContent = Math.ceil(left) + '초'; bar.style.width = (left / LEN * 100).toFixed(1) + '%';
    };
    function next() {
      if (!deck.length) deck = shuffle(cards.slice());
      cur = deck.pop(); lock = false;
      card.innerHTML = `<span class="eg-ic">${cur.ic || ''}</span><b>${cur.q}</b>`;
      card.classList.remove('ok', 'bad'); void card.offsetWidth; card.classList.add('in');
      btns.forEach((b) => { b.disabled = false; b.classList.remove('right', 'wrong'); });
    }
    function end() {
      clearInterval(timer); timer = null; played++;
      btns.forEach((b) => { b.disabled = true; });
      if (inRoom()) quiz.finish(score);
      const rec = score > best;
      if (rec) { best = score; store.set(KEY, String(best)); burst(bEl); buzz([80, 40, 80, 40, 160]); }
      card.innerHTML = `<b>${rec ? '새 최고 기록!' : '끝!'} ${score}점</b><small>${cfg.endSay || ''}</small>`;
      start.textContent = '다시 도전'; start.hidden = false;
      if (now) { now.textContent = '③ 결과를 보고 헷갈린 카드를 짝과 말해 보자'; now.classList.add('done'); }
      paint();
    }
    // seed가 있으면(빠른 퀴즈) 모두 같은 카드 차례, 늦게 들어오면 지난 시간만큼 줄인다
    function begin(seed, info) {
      rand = seed != null && window.Quiz ? window.Quiz.rng(seed) : Math.random;
      score = (info && info.resume && info.resume.s) || 0; streak = 0; left = Math.max(1, LEN - ((info && info.elapsed) || 0) / 1000); deck = []; start.hidden = true; why.textContent = '';
      if (now) { now.classList.remove('done'); now.textContent = '② 카드를 보고 빠르게 고르자'; }
      next(); paint(); last = performance.now();
      timer = setInterval(() => { const t = performance.now(); left -= (t - last) / 1000; last = t; if (left <= 0) { left = 0; end(); } paint(); }, 100);
    }
    function answer(b) {
      if (!timer || lock || !cur) return;
      lock = true;
      const ok = b.dataset.v === cur.a;
      const right = btns.find((x) => x.dataset.v === cur.a);
      if (ok) {
        score += 10 + Math.min(streak, 5) * 2; streak++;
        card.classList.add('ok'); b.classList.add('right');
        if (streak % 5 === 0) { burst(kEl); buzz([30, 30, 30]); }
      } else {
        streak = 0; card.classList.add('bad'); b.classList.add('wrong'); right.classList.add('right'); buzz(60);
      }
      if (inRoom()) quiz.answer(cur.k, ok, score);
      why.innerHTML = (ok ? '<b class="eg-o">맞아요</b> ' : '<b class="eg-x">아니에요</b> ') + cur.why;
      paint();
      setTimeout(() => { if (timer) next(); }, ok ? 650 : 1500);
    }
    btns.forEach((b) => b.addEventListener('click', () => answer(b)));
    g.addEventListener('keydown', (e) => { const i = '1234'.indexOf(e.key); if (i >= 0 && btns[i]) { e.preventDefault(); e.stopPropagation(); answer(btns[i]); } });
    start.addEventListener('click', () => begin());
    card.innerHTML = `<b>${cfg.intro}</b>`;
    btns.forEach((b) => { b.disabled = true; });
    paint();
    root._game = { begin: () => begin(), answer: (v) => answer(btns.find((b) => b.dataset.v === v)), end, get cur() { return cur; } };
    // 장을 떠나면 멈춘다(빠른 퀴즈 중에는 선생님이 장을 넘겨도 끝까지 한다)
    return { setActive(on) { if (!on && timer && !inRoom()) { clearInterval(timer); timer = null; start.hidden = false; start.textContent = '다시 도전'; } } };
  }
  window.EAGame = { mount };

  // ---------- 3차시 설계 챌린지 ----------
  window.EAChall = function (root) {
    const log = root.querySelector('.ea-de-log tbody'), out = root.querySelector('.ea-ch-score');
    if (!log || !out) return;
    const sEl = out.querySelector('.cs-now'), bEl = out.querySelector('.cs-best'), tEl = out.querySelector('.cs-try'), msg = out.querySelector('.cs-msg');
    const KEY = 'ea123-best-design';
    let best = +(store.get(KEY) || 0), tries = 0, done = false;
    const paint = (s) => { sEl.textContent = s == null ? '—' : s; bEl.textContent = best || '—'; tEl.textContent = tries; };
    paint(null);
    new MutationObserver((ms) => ms.forEach((m) => m.addedNodes.forEach((tr) => {
      if (tr.nodeName !== 'TR') return;
      tries++;
      const td = [...tr.children].map((c) => c.textContent);
      if (tr.className === 'good' && !/질산/.test(td[1])) {
        const n = parseInt(td[1].replace(/\D/g, ''), 10) || 3;
        const s = Math.max(20, 100 - (tries - 1) * 12 - Math.max(0, n - 3) * 8);
        const rec = s > best; if (rec) { best = s; store.set(KEY, String(best)); }
        msg.innerHTML = rec ? '<b>새 최고 기록!</b> 적은 시도·알맞은 주머니 수로 성공' : '성공! 주머니를 덜 쓰거나 한 번에 맞히면 점수가 오른다';
        paint(s); burst(sEl); buzz([90, 40, 90, 40, 180]); done = true;
      } else {
        msg.textContent = tr.className === 'warn' ? '익었지만 김이 튈 위험 — 안전성 점수 없음' : '아직 실패 — 다시 고쳐 보자';
        paint(done ? sEl.textContent : null);
      }
    }))).observe(log, { childList: true });
    root._chall = { reset() { tries = 0; done = false; paint(null); msg.textContent = '목표: 고른 음식을 안전하게 익히기'; } };
  };
})();
/* 장 조각 여럿을 하나로(fragment·sync·setActive를 모두 부른다) */
window.EAMerge = function (...ps) {
  ps = ps.filter(Boolean);
  const call = (k, a) => ps.forEach((p) => { if (typeof p[k] === 'function') p[k](...a); });
  return { fragment: (...a) => call('fragment', a), sync: (...a) => call('sync', a), setActive: (...a) => call('setActive', a) };
};
