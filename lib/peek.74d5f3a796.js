/* 1-2-1 재미 요소(2026-10-31 선생님 «화학 파트가 노잼»):
   RxFx.burst(단추)   맞힌 보기가 빛나며 작은 조각이 튀어 나간다(+ 짧은 진동, 지원 기기만)
   RxFx.shake(요소)   틀렸을 때 좌우로 흔들림(+ 진동)
   RxPeek.mount(root) «먼저 보고 놀라기»: 예측 걸기(.share-opts, 수업방이 반 전체 답을 센다) → 실제 실험 영상 → 정답 공개.
     덮개(.pk)는 장에 처음 들어올 때 열려 있고 «닫고 설명 보기»로 닫는다. 머리말 «▶ 실험 영상» 단추로 다시 연다.
   RxBet.mount(root, 이벤트, 판정)  그림(3D) 결과 예측: 단계가 결과에 닿으면 정답이 공개된다.
   RxT.join(...조각)  한 장에 조각이 여럿일 때 setActive 등을 함께 부른다. */
(function () {
  'use strict';
  const buzz = (p) => { try { if (navigator.vibrate) navigator.vibrate(p); } catch { /* 막힌 곳 */ } };
  const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const COLS = ['#f2c230', '#d9631e', '#2a63c9', '#2f9e5b', '#e0463c', '#ffffff'];

  function burst(el, n = 16) {
    if (!el) return;
    el.classList.remove('fx-pop'); void el.offsetWidth; el.classList.add('fx-pop');
    buzz([30, 30, 60]);
    if (reduce()) return;
    const host = el.closest('section') || document.body, hb = host.getBoundingClientRect(), b = el.getBoundingClientRect();
    const sc = hb.width / (host.offsetWidth || hb.width) || 1;            // 장이 줄어 보일 때(Reveal 크기 맞춤) 좌표를 되돌린다
    const cx = (b.left + b.width / 2 - hb.left) / sc, cy = (b.top + b.height / 2 - hb.top) / sc;
    for (let i = 0; i < n; i++) {
      const s = document.createElement('i'); s.className = 'fx-bit';
      const a = (i / n) * Math.PI * 2 + Math.random() * 0.4, d = 70 + Math.random() * 90;
      s.style.cssText = `left:${cx}px;top:${cy}px;background:${COLS[i % COLS.length]};--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d - 30}px;--r:${Math.random() * 360}deg`;
      host.appendChild(s); setTimeout(() => s.remove(), 1000);
    }
  }
  function shake(el) { if (!el) return; el.classList.remove('fx-shake'); void el.offsetWidth; el.classList.add('fx-shake'); buzz([60, 40, 60]); }
  window.RxFx = { burst, shake, buzz };

  // 예측 보기 하나만 고르기 + 정답 공개
  function opts(root, box, ans, say) {
    const btns = [...box.querySelectorAll('.share-opts button')];
    btns.forEach((b) => b.addEventListener('click', () => {
      if (box.classList.contains('pk-shown')) return;
      const on = b.getAttribute('aria-pressed') !== 'true';
      btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
    }));
    let shown = false;
    function show(on = true) {
      shown = on; box.classList.toggle('pk-shown', on);
      const right = btns.find((b) => b.dataset.k === ans);
      btns.forEach((b) => b.classList.toggle('rx-right', on && b === right));
      if (!on) { if (say) say.textContent = ''; return; }
      const mine = btns.find((b) => b.getAttribute('aria-pressed') === 'true');
      burst(right);
      if (say) say.innerHTML = !mine ? `정답: <b>${right.textContent}</b>` : mine === right ? `<b>맞혔다!</b> ${right.dataset.why || ''}` : `아쉽다 — 정답은 <b>${right.textContent}</b>. ${right.dataset.why || ''}`;
      if (mine && mine !== right) shake(mine);
    }
    return { show, get shown() { return shown; } };
  }

  function mount(root) {
    const pk = root.querySelector('.pk'), open = root.querySelector('.pk-open');
    const video = pk.querySelector('video'), play = pk.querySelector('.pk-play'), say = pk.querySelector('.pk-say');
    const o = opts(root, pk, pk.dataset.ans, say);
    say.textContent = '하나를 고른 뒤 «▶ 영상 보기»를 누르자.';
    let active = false, seen = false, auto = 0;
    const set = (on) => {
      if (!on) clearTimeout(auto);
      pk.hidden = !on; root.classList.toggle('pk-on', on);
      if (open) open.setAttribute('aria-expanded', String(on));
      if (!on) video.pause();
    };
    function go() {
      pk.classList.add('pk-playing');
      try { video.currentTime = 0; } catch { /* 아직 못 읽음 */ }
      video.play().catch(() => { o.show(true); });
      play.textContent = '↻ 다시 보기';
    }
    play.addEventListener('click', go);
    video.addEventListener('click', go);
    video.addEventListener('ended', () => {
      if (!o.shown) { o.show(true);  }
      // 정답을 본 뒤 잠시 뒤 덮개를 걷어 이론판(정의 + Manim)이 보이게 한다(2026-10-31 «이론 장에 Manim이 안 나와»)
      clearTimeout(auto);
      const note = document.createElement('span'); note.className = 'pk-auto'; note.textContent = ' 곧 설명으로 넘어간다…'; say.appendChild(note);
      auto = setTimeout(() => { if (!pk.hidden) set(false); }, 3500);
    });
    pk.querySelector('.pk-close').addEventListener('click', () => set(false));
    if (open) open.addEventListener('click', () => set(pk.hidden));
    set(false);
    root._pk = { open: () => set(true), close: () => set(false), show: () => o.show(true), play: go, video };
    return {
      setActive(on) {
        active = !!on;
        if (on && !seen) { seen = true; set(true); }
        if (!on) video.pause();
      },
    };
  }
  function openPk() { const s = window.Reveal && Reveal.getCurrentSlide(); const pk = s && s.querySelector('.pk:not([hidden])'); return pk && s._pk ? s : null; }
  document.addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].includes(e.key) || e.target.closest('input,textarea,button')) return;
    const s = openPk(); if (s) { e.preventDefault(); e.stopImmediatePropagation(); s._pk.close(); }
  }, true);
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.navigate-right, .navigate-next')) return;
    const s = openPk(); if (s) { e.preventDefault(); e.stopImmediatePropagation(); s._pk.close(); }
  }, true);
  window.RxPeek = { mount, opts };

  // 그림 결과 예측: 판정(단계) → 참이면 공개
  function bet(root, hit) {
    const box = root.querySelector('.rx-bet'); if (!box) return {};
    const say = box.querySelector('.pk-say');
    const o = opts(root, box, box.dataset.ans, say);
    root.addEventListener('st-step', (e) => { const h = hit(e.detail); if (h && !o.shown) o.show(true); });
    root._bet = o;
    return {};
  }
  window.RxBet = { mount: bet };

  window.RxT.join = (...ps) => ({
    setActive(on) { ps.forEach((p) => p && p.setActive && p.setActive(on)); },
    fragment(f, on) { ps.forEach((p) => p && p.fragment && p.fragment(f, on)); },
    sync(s) { ps.forEach((p) => p && p.sync && p.sync(s)); },
    fit() { ps.forEach((p) => p && p.fit && p.fit()); },
  });
})();
