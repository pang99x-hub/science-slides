/* 3-2 미니 게임(2-1-1 ecgame.js를 단원 안에 둠)(1-2-3 eafun.js의 «빠르게 고르기»를 가져와 단원 안에 둠: 실행 중 다른 단원 파일을 읽지 않는다).
   EcoGame.mount(root, cfg) cfg = { id, title, seconds, intro, endSay, items: [{ q, a, why, ic }] }
   카드가 하나씩 나오면 아래 단추(숫자 키 1~4)로 고른다. 맞히면 10점 + 연속 덤(최대 +10), 연속 5개마다 폭죽·진동, 틀리면 까닭.
   최고 기록은 이 기기에만(localStorage, 막히면 저장 없이).
   수업방이 켜져 있으면 빠른 퀴즈(엔진 quiz.js): 선생님이 시작하면 모두 같은 순간·같은 카드 차례(seed)로 하고 카드마다 처음 답이 선생님 통계로 간다.
   수업방이 없으면 «게임 시작»으로 혼자 한다. 해 볼 일 ①②③과 «알게 된 것»은 L1.steps·L1.done으로 맞춘다.
   시험용: root._game.begin() · answer(값) · end() · cur */
(function () {
  'use strict';
  const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const buzz = (p) => { try { if (navigator.vibrate) navigator.vibrate(p); } catch { /* 막힌 곳 */ } };
  const store = {
    get(k) { try { return window.localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { window.localStorage.setItem(k, v); } catch { /* 저장 못 함 */ } },
  };
  function burst(el) {
    if (!el || reduce()) return;
    const host = el.closest('section') || document.body, hr = host.getBoundingClientRect(), r = el.getBoundingClientRect();
    const sc = hr.width / (host.offsetWidth || hr.width) || 1;
    const cx = (r.left + r.width / 2 - hr.left) / sc, cy = (r.top + r.height / 2 - hr.top) / sc;
    const C = ['#ffd84d', '#3f8f4a', '#2a8fb8', '#8a5a32', '#d9483b'];
    for (let i = 0; i < 22; i++) {
      const p = document.createElement('i'); p.className = 'fx-bit';
      const a = (i / 22) * Math.PI * 2 + Math.random() * 0.3, d = 70 + Math.random() * 90;
      p.style.cssText = `left:${cx}px;top:${cy}px;background:${C[i % C.length]};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d - 30}px;--r:${Math.random() * 360}deg`;
      host.appendChild(p); setTimeout(() => p.remove(), 1000);
    }
  }

  function mount(root, cfg) {
    const g = root.querySelector('.eg-game'), card = g.querySelector('.eg-card'), why = g.querySelector('.eg-why');
    const btns = [...g.querySelectorAll('.eg-ans button')], start = g.querySelector('.eg-start');
    const tEl = g.querySelector('.eg-time'), sEl = g.querySelector('.eg-score'), kEl = g.querySelector('.eg-streak'), bEl = g.querySelector('.eg-best');
    const bar = g.querySelector('.eg-tbar i'), log = root.querySelector('.eg-log');
    const KEY = 'eth32-best-' + cfg.id, LEN = cfg.seconds || 40;
    let best = +(store.get(KEY) || 0), score = 0, streak = 0, left = LEN, deck = [], cur = null, timer = null, last = 0, lock = false, rand = Math.random, played = 0;
    const misses = new Map();
    const cards = cfg.items.map((it, i) => ({ ...it, k: 'c' + i }));
    const ansName = (v) => { const b = btns.find((x) => x.dataset.v === v); return b ? (b.querySelector('.eg-t') || b).textContent.replace(/\s+/g, ' ').trim() : v; };
    const quiz = window.Quiz ? window.Quiz.attach(root, {
      id: 'eth32-' + cfg.id, title: cfg.title || '', host: g, durationMs: LEN * 1000,
      items: cards.map((c) => ({ id: c.k, label: `${c.q} → ${ansName(c.a)}` })),
      onStart: (seed, info) => begin(seed, info),
      onStop: () => { if (timer) end(); },
    }) : null;
    const inRoom = () => !!(quiz && quiz.running());
    const L1 = window.L1;
    const steps = (n) => { L1.steps(root, n, n === 0 ? [1, 2, 3] : n === 3 ? [1, 2] : n === 2 ? [1] : []); L1.done(root, n === 0); };
    const paint = () => {
      sEl.textContent = score; kEl.textContent = streak; bEl.textContent = best;
      tEl.textContent = Math.ceil(left) + '초'; bar.style.width = (left / LEN * 100).toFixed(1) + '%';
    };
    function next() {
      if (!deck.length) { deck = cards.slice(); for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; } }
      cur = deck.pop(); lock = false;
      card.innerHTML = `${cur.ic ? `<span class="eg-ic">${cur.ic}</span>` : ''}<b>${cur.q}</b>${cur.sub ? `<small>${cur.sub}</small>` : ''}`;
      card.classList.remove('ok', 'bad', 'in'); void card.offsetWidth; card.classList.add('in');
      btns.forEach((b) => { b.disabled = false; b.classList.remove('right', 'wrong'); });
    }
    function showLog() {
      if (!log) return;
      const top = [...misses.entries()].sort((a, b) => b[1] - a[1]).slice(0, 3);
      log.innerHTML = top.length ? '<b>헷갈린 카드</b> ' + top.map(([k]) => { const c = cards.find((x) => x.k === k); return `<span>${c.q} → ${ansName(c.a)}</span>`; }).join('') : '<b>헷갈린 카드</b> 없음 — 모두 맞혔다!';
      log.hidden = false;
    }
    function end() {
      clearInterval(timer); timer = null; played++;
      btns.forEach((b) => { b.disabled = true; });
      if (inRoom()) quiz.finish(score);
      const rec = score > best;
      if (rec) { best = score; store.set(KEY, String(best)); burst(bEl); buzz([80, 40, 80, 40, 160]); }
      card.classList.remove('ok', 'bad');
      card.innerHTML = `<b>${rec ? '새 최고 기록!' : '끝!'} ${score}점</b><small>${cfg.endSay || ''}</small>`;
      start.textContent = '다시 도전'; start.hidden = false;
      showLog(); steps(0); paint();
    }
    function begin(seed, info) {
      rand = seed != null && window.Quiz ? window.Quiz.rng(seed) : Math.random;
      score = (info && info.resume && info.resume.s) || 0; streak = 0; left = Math.max(1, LEN - ((info && info.elapsed) || 0) / 1000);
      deck = []; misses.clear(); start.hidden = true; why.textContent = ''; if (log) log.hidden = true;
      steps(2); next(); paint(); last = performance.now();
      clearInterval(timer);
      timer = setInterval(() => { const t = performance.now(); left -= (t - last) / 1000; last = t; if (left <= 0) { left = 0; end(); } paint(); }, 100);
    }
    function answer(b) {
      if (!timer || lock || !cur || !b) return;
      lock = true;
      const ok = b.dataset.v === cur.a, right = btns.find((x) => x.dataset.v === cur.a);
      if (ok) {
        score += 10 + Math.min(streak, 5) * 2; streak++;
        card.classList.add('ok'); b.classList.add('right');
        if (streak % 5 === 0) { burst(kEl); buzz([30, 30, 30]); }
      } else {
        streak = 0; card.classList.add('bad'); b.classList.add('wrong'); right.classList.add('right'); buzz(60);
        misses.set(cur.k, (misses.get(cur.k) || 0) + 1);
        if (!played) steps(3);
      }
      if (inRoom()) quiz.answer(cur.k, ok, score);
      why.innerHTML = (ok ? '<b class="eg-o">맞아요</b> ' : '<b class="eg-x">아니에요</b> ') + cur.why;
      paint();
      setTimeout(() => { if (timer) next(); }, ok ? 700 : 1700);
    }
    btns.forEach((b) => b.addEventListener('click', () => answer(b)));
    g.addEventListener('keydown', (e) => { const i = '12345'.indexOf(e.key); if (i >= 0 && btns[i]) { e.preventDefault(); e.stopPropagation(); answer(btns[i]); } });
    start.addEventListener('click', () => begin());
    card.innerHTML = `<b>${cfg.intro}</b>`;
    btns.forEach((b) => { b.disabled = true; });
    steps(1); paint();
    root._game = { begin: () => begin(), answer: (v) => answer(btns.find((b) => b.dataset.v === v)), end, get cur() { return cur; }, quiz };
    // 장을 떠나면 멈춘다(빠른 퀴즈 중에는 선생님이 장을 넘겨도 끝까지 한다)
    return { setActive(on) { if (!on && timer && !inRoom()) { clearInterval(timer); timer = null; start.hidden = false; start.textContent = '다시 도전'; } } };
  }
  window.EthGame = { mount };
})();
