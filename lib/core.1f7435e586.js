/* 슬라이드 엔진(모든 차시 공용): reveal.js(넘기기·단계·발표자 화면) + 판서 플러그인 + GSAP(움직임).
   장마다 하는 일은 Deck.part('장 id', root => ({ setActive, fit, fragment(f, on), sync(slide) }))로 등록한다.
   공용 단계 움직임(data-anim): type(한 글자씩), mark(형광펜), result(결과가 찍힘), blank(빈칸이 열림). */
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const D = (s) => (reduce ? 0 : s);
  const factories = [];
  const Deck = window.Deck = { reduce, D, part(id, make) { factories.push([id, make]); } };
  if (window.gsap && window.SplitText) gsap.registerPlugin(SplitText);

  function start() {
    Reveal.initialize({
      width: 1920, height: 1080, margin: 0, minScale: 0.05, maxScale: 4,
      center: false, hash: true, controls: true, controlsTutorial: false, progress: true,
      slideNumber: 'c/t', transition: 'fade', transitionSpeed: 'fast', backgroundTransition: 'none',
      viewDistance: 3,
      // 좁은 세로 화면의 «스크롤 보기»를 끈다. 켜 두면 ① 보이는 장과 현재 장이 어긋나 그림이 시작되지 않고
      // ② 가로로 돌릴 때 reveal이 장 HTML을 통째로 다시 만들어 장 모듈(캔버스·조작)이 끊긴다(2026-10-27 휴대폰에서 확인)
      scrollActivationWidth: null,
      chalkboard: {
        theme: 'whiteboard', boardmarkerWidth: 5, colorButtons: true,
        toggleChalkboardButton: false, toggleNotesButton: false, transition: 300,
        // 실수로 지우지 않도록 «전체 지우기(Backspace)»와 «내려받기(D)» 단축키는 끈다
        keyBindings: { resetAll: { keyCode: 0, key: '', description: '' }, download: { keyCode: 0, key: '', description: '' } },
      },
      plugins: [window.RevealNotes, window.RevealChalkboard].filter(Boolean),   // 학생용에는 발표자 메모 플러그인이 없다
    }).then(ready);
  }

  function ready() {
    // 한 장에 모듈이 여럿 붙을 수 있다(예: 공용 표지 + 차시별 덧붙임)
    const parts = new Map();
    // 장 id 또는 data-part(장 모듈: id가 고유 번호라 공용 장 모듈은 data-part="cover"처럼 이름으로 붙인다)
    for (const [id, make] of factories) {
      const roots = new Set([document.getElementById(id), ...document.querySelectorAll(`section[data-part~="${id}"]`)]);
      for (const root of roots) {
        if (!root) continue;
        if (!parts.has(root)) parts.set(root, []);
        parts.get(root).push(make(root) || {});
      }
    }
    const each = (root, fn) => (parts.get(root) || []).forEach(fn);
    document.querySelectorAll('.fragment.custom[data-anim="type"] .txt').forEach((t) => {
      if (window.SplitText) t._split = new SplitText(t, { type: 'chars', charsClass: 'ch' });
    });
    // 처음 볼 때 숨길 단계
    document.querySelectorAll('.fragment.custom[data-anim="type"], .fragment.custom[data-anim="mark"]').forEach((f) => {
      if (!f.classList.contains('visible')) gsap.set(f, { autoAlpha: 0 });
    });
    document.querySelectorAll('.fragment.custom[data-anim="result"] .ans').forEach((a) => gsap.set(a, { autoAlpha: 0 }));


    function showFragment(f, on) {
      const anim = f.dataset.anim;
      if (anim === 'type') {
        const s = f.querySelector('.txt')._split;
        if (on) {
          gsap.set(f, { autoAlpha: 1 });
          gsap.from(f.querySelector('.no'), { autoAlpha: 0, scale: 0.4, duration: D(0.3), ease: 'back.out(3)' });
          if (s) gsap.fromTo(s.chars, { autoAlpha: 0 }, { autoAlpha: 1, stagger: D(0.022), duration: D(0.01), ease: 'none' });
        } else gsap.set(f, { autoAlpha: 0 });
      } else if (anim === 'mark') {
        const mark = f.querySelector('.mark');
        if (on) {
          gsap.fromTo(f, { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: D(0.45), ease: 'power3.out' });
          gsap.fromTo(mark, { backgroundSize: '0% 100%' }, { backgroundSize: '100% 100%', duration: D(0.9), delay: D(0.35), ease: 'power2.inOut' });
        } else gsap.set(f, { autoAlpha: 0 });
      } else if (anim === 'result') {
        const ans = f.querySelector('.ans');
        if (on) gsap.fromTo(ans, { autoAlpha: 0, scale: 1.7, rotate: -8 }, { autoAlpha: 1, scale: 1, rotate: 0, duration: D(0.4), ease: 'back.out(2.2)' });
        else gsap.set(ans, { autoAlpha: 0 });
      } else if (anim === 'blank') {
        const bk = f.querySelector('.bk');
        if (on) gsap.fromTo(bk, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: D(0.4), ease: 'back.out(3)' });
        else gsap.set(bk, { autoAlpha: 1, scale: 1 });
      }
      each(f.closest('section'), (p) => { if (p.fragment) p.fragment(f, on); });
    }

    // 앞뒤로 오갈 때 이미 보이는 단계는 움직임 없이 맞춰 둔다
    function syncFragments(slide) {
      slide.querySelectorAll('.fragment.custom').forEach((f) => {
        const vis = f.classList.contains('visible'), anim = f.dataset.anim;
        if (anim === 'type' || anim === 'mark') {
          gsap.set(f, { autoAlpha: vis ? 1 : 0, y: 0 });
          if (anim === 'type' && vis) { const s = f.querySelector('.txt')._split; if (s) gsap.set(s.chars, { autoAlpha: 1 }); }
          if (anim === 'mark') gsap.set(f.querySelector('.mark'), { backgroundSize: vis ? '100% 100%' : '0% 100%' });
        } else if (anim === 'result') gsap.set(f.querySelector('.ans'), { autoAlpha: vis ? 1 : 0, scale: 1, rotate: 0 });
        else if (anim === 'blank') gsap.set(f.querySelector('.bk'), { autoAlpha: 1, scale: 1 });
      });
      each(slide, (p) => { if (p.sync) p.sync(slide); });
    }

    setupToolbar();
    const onSlide = () => {
      const cur = Reveal.getCurrentSlide();
      for (const [root, list] of parts) list.forEach((p) => { if (p.setActive) p.setActive(root === cur); });
      syncFragments(cur);
    };
    Reveal.on('slidechanged', onSlide);
    Reveal.on('resize', () => { for (const list of parts.values()) list.forEach((p) => { if (p.fit) p.fit(); }); });
    Reveal.on('fragmentshown', (e) => e.fragments.forEach((f) => showFragment(f, true)));
    Reveal.on('fragmenthidden', (e) => e.fragments.forEach((f) => showFragment(f, false)));
    onSlide();
  }

  function setupToolbar() {
    const act = {
      pen: () => RevealChalkboard.toggleNotesCanvas(),
      board: () => RevealChalkboard.toggleChalkboard(),
      clear: () => RevealChalkboard.clear(),
      overview: () => Reveal.toggleOverview(),
      speaker: () => { const n = Reveal.getPlugin('notes'); if (n) n.open(); },
      full: () => {
        const el = document.documentElement;
        if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
        else if (el.requestFullscreen) el.requestFullscreen().catch(() => {});
      },
    };
    document.querySelectorAll('.toolbar [data-tool]').forEach((b) => b.addEventListener('click', () => {
      const f = act[b.dataset.tool]; if (f) f(); b.blur();
    }));
    // 단추 이름(2026-11-02 «그 바가 뭘하는건지 모르겠다»): 맨 위 «이름 보기»를 누르면 그림 옆에 이름이 펼쳐진다(기억).
    // 마우스를 올려도 바로 이름이 뜬다. 나중에 붙는 단추(수업방)는 data-label로 이름을 준다
    const bar = document.querySelector('.toolbar');
    if (bar) {
      const NAME = { home: '처음 화면', pen: '판서', board: '칠판', clear: '판서 지우기', overview: '한눈에 보기', speaker: '발표자 화면', full: '전체 화면' };
      const label = (b) => {
        if (b.querySelector(':scope > .tb-label')) return;
        const t = b.dataset.label || NAME[b.dataset.tool] || (b.classList.contains('home') ? NAME.home : b.getAttribute('aria-label') || '');
        if (t) b.insertAdjacentHTML('beforeend', `<span class="tb-label">${t}</span>`);
      };
      const KEY = 'deck:toolbar-labels';
      const tg = document.createElement('button');
      tg.type = 'button'; tg.className = 'tb-names';
      tg.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h10M4 12h16M4 17h12"/></svg>';
      const set = (on) => {
        bar.classList.toggle('labeled', on); tg.setAttribute('aria-pressed', String(on));
        tg.dataset.label = on ? '이름 숨기기' : '이름 보기'; tg.setAttribute('aria-label', tg.dataset.label);
        const l = tg.querySelector('.tb-label'); if (l) l.textContent = tg.dataset.label;
        try { localStorage.setItem(KEY, on ? '1' : '0'); } catch { /* 저장이 막혀도 이번에는 된다 */ }
      };
      let on0 = false; try { on0 = localStorage.getItem(KEY) === '1'; } catch { /* 처음 */ }
      set(on0);
      tg.addEventListener('click', () => { set(!bar.classList.contains('labeled')); tg.blur(); });
      const home = bar.querySelector('a.home');
      bar.insertBefore(tg, home ? home.nextSibling : bar.firstChild);
      bar.querySelectorAll('button, a.home').forEach(label);
      new MutationObserver(() => bar.querySelectorAll('button, a.home').forEach(label)).observe(bar, { childList: true, subtree: true });
      // 이름을 숨겼을 때 마우스를 올리면 막대 오른쪽에 이름표(막대는 넘길 수 있어 안에 두면 잘린다)
      let tip = null;
      bar.addEventListener('pointerover', (e) => {
        const b = e.target.closest('button, a.home');
        if (e.pointerType !== 'mouse' || !b || bar.classList.contains('labeled')) return;
        const t = b.querySelector('.tb-label'); if (!t) return;
        if (!tip) { tip = document.createElement('div'); tip.className = 'tb-tip'; document.body.appendChild(tip); }
        const r = b.getBoundingClientRect(), br = bar.getBoundingClientRect();
        tip.textContent = t.textContent; tip.style.left = br.right + 10 + 'px'; tip.style.top = r.top + r.height / 2 + 'px'; tip.hidden = false;
      });
      bar.addEventListener('pointerout', (e) => { if (tip && !bar.contains(e.relatedTarget)) tip.hidden = true; });
      bar.addEventListener('scroll', () => { if (tip) tip.hidden = true; }, { passive: true });
    }
    // 마지막 장 «다음 차시 열기»: 수업방 주소(방·반·시험 주소)를 그대로 들고 간다
    document.querySelectorAll('a.next-go').forEach((a) => a.addEventListener('click', (e) => {
      const now = new URLSearchParams(location.search), keep = new URLSearchParams();
      for (const k of ['room', 'cls', 'roomapi']) if (now.get(k)) keep.set(k, now.get(k));
      if (![...keep].length) return;
      e.preventDefault();
      location.href = a.href.split(/[?#]/)[0] + '?' + keep;
    }));
  }

  // 장 모듈이 모두 등록된 뒤(본문 끝의 스크립트가 다 돈 뒤) 시작한다
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else setTimeout(start, 0);
})();

/* 반응식 칸 맞춤(2026-10-31 «반응식이 튀어 나가 있는 건 왜 안 고쳐져»): 휴대폰마다 글꼴이 늦게 오거나 달라
   식이 칸보다 넓어지면 넘친다. 지금 장의 식(.bx .eqx .eqbox [data-fit])을 감싸는 칸(스스로 넘치지 않는 가장 가까운 칸)의
   안쪽 너비에 맞게 zoom으로 줄인다(화살표 겹그림도 함께 줄어든다). 장이 바뀔 때·글꼴이 올 때·크기가 바뀔 때·1초마다 다시 잰다. */
(function () {
  'use strict';
  const SEL = '.bx, .eqx, .eqbox, [data-fit]';
  const num = (v) => parseFloat(v) || 0;
  function fit(el, sec, s) {
    el.style.zoom = '';
    if (!el.offsetParent) return;
    const er = el.getBoundingClientRect();
    let limit = Infinity;
    for (let a = el.parentElement; a && a !== sec.parentElement; a = a.parentElement) {
      const r = a.getBoundingClientRect(), p = a.parentElement && a.parentElement.getBoundingClientRect();
      if (p && a !== sec && r.right > p.right + 2) continue;                 // 스스로 넘친 칸은 기준이 못 된다
      const cs = getComputedStyle(a);
      limit = Math.min(limit, r.right / s - num(cs.borderRightWidth) - num(cs.paddingRight));
      if (a === sec) break;
    }
    const avail = limit - er.left / s, need = Math.max(el.scrollWidth, er.width / s);
    if (avail > 20 && need > avail + 1) el.style.zoom = String(Math.max(0.5, (avail - 2) / need));
  }
  function run() {
    const R = window.Reveal; if (!R || !R.getCurrentSlide) return;
    const sec = R.getCurrentSlide(); if (!sec) return;
    const s = sec.getBoundingClientRect().width / (sec.offsetWidth || 1) || 1;
    const els = [...sec.querySelectorAll(SEL)].filter((e) => !(e.parentElement && e.parentElement.closest(SEL)));
    els.forEach((e) => fit(e, sec, s));
    fitCols(sec, s);
    fitBoxes(sec);
    fitWide(sec);
  }
  // 높이가 정해진 상자(overflow 숨김) 안에서 글이 넘치면 안쪽 조각들을 줄인다(뒤집기 카드 뒷면 등)
  const MEDIA = 'video, img, canvas, iframe, .pk-vid, .st-stage, .st-im, [class*="3d"], [class*="vid"], .stage, .scene';
  function fitBoxes(sec) {
    sec.querySelectorAll('[data-boxfit]').forEach((c) => { c.style.zoom = ''; c.removeAttribute('data-boxfit'); });
    sec.querySelectorAll('*').forEach((b) => {
      if (!b.offsetParent || b.matches(MEDIA) || b.closest(SKIP)) return;
      const cs = getComputedStyle(b); if (cs.overflow === 'visible' && cs.overflowY === 'visible') return;
      if (!/\S/.test(b.textContent) || b.querySelector('video, canvas, iframe, .st-stage, [class*="3d"]')) return;
      for (let k = 0; k < 3 && b.scrollHeight > b.clientHeight + 3; k++) {
        const z = Math.max(0.6, (b.clientHeight - 2) / b.scrollHeight);
        [...b.children].forEach((c) => { if (c.offsetParent) { const now = parseFloat(c.style.zoom) || 1; c.style.zoom = String(Math.max(0.6, now * z)); c.setAttribute('data-boxfit', ''); } });
      }
    });
  }
  // 장 오른쪽 밖으로 나간 글: 그것을 품은 단을 가로로 맞게 줄인다
  function fitWide(sec) {
    const sr = sec.getBoundingClientRect(), right = sr.right - 6;
    const cols = new Set();
    sec.querySelectorAll('*').forEach((e) => {
      if (!e.offsetParent || e.closest(SKIP) || e.closest('svg')) return;
      const r = e.getBoundingClientRect(); if (r.width < 3 || r.width > sr.width * 0.9 || r.right <= right + 1) return;
      let c = e, up = e.parentElement; while (up && up !== sec && up.getBoundingClientRect().width < sr.width * 0.6) { c = up; up = up.parentElement; }
      cols.add(c);
    });
    [...cols].filter((c) => ![...cols].some((o) => o !== c && o.contains(c))).forEach((c) => {
      for (let k = 0; k < 3; k++) {
        const r = c.getBoundingClientRect(); let far = r.right;
        c.querySelectorAll('*').forEach((e) => { if (e.offsetParent && !e.closest('svg')) far = Math.max(far, e.getBoundingClientRect().right); });
        if (far <= right + 1) break;
        const z = Math.max(0.6, (parseFloat(c.style.zoom) || 1) * (right - r.left) / (far - r.left));
        c.style.zoom = String(z); c.setAttribute('data-colfit', '');
      }
    });
  }
  // 칸 높이 맞춤: 글꼴이 넓어 줄이 늘어 칸이 장 아래(꼬리말)로 내려가면 그 칸 전체를 줄인다
  const SKIP = '.footer, .ph-det, .pk, .notes, .slide-number, .fx-bit, .ea-bit, .u-toast, .qz-board, .qz-cover, .wl, .pr-img, .pr-shield, [hidden]';   // 빠른 퀴즈 판·덮개는 제 크기로 그린다. 의견판(.wl)은 wall.js가 글씨를 맞추고 칸 안에서 스크롤한다. 발표 그림·덮개(.pr-*)는 present.js 것
  function fitCols(sec, s) {
    sec.querySelectorAll('[data-colfit]').forEach((c) => { c.style.zoom = ''; });
    const sr = sec.getBoundingClientRect(), ft = sec.querySelector(':scope > .footer, .footer');
    const limit = (ft && ft.offsetParent ? ft.getBoundingClientRect().top : sr.bottom - 8 * s) - 4 * s;
    const hd = sec.querySelector('.head, h2'); const top = hd && hd.offsetParent ? hd.getBoundingClientRect().bottom + 2 * s : sr.top;
    const cols = new Set();
    const vis = (e) => e.offsetParent && !e.closest(SKIP) && getComputedStyle(e).position !== 'fixed';
    sec.querySelectorAll('*').forEach((e) => {
      if (!vis(e) || (hd && hd.contains(e))) return;
      const cs = getComputedStyle(e); if (cs.position === 'absolute') return;
      const r = e.getBoundingClientRect(); if (r.height < 4) return;
      if (r.bottom <= limit + 1 && r.top >= top - 1) return;
      // 넘친 것을 품은 «단»: 장 너비의 60%·80%·90% 아래인 가장 높은 조상 순으로 찾는다
      const climb = (frac) => { let c = e, up = e.parentElement; while (up && up !== sec && !(hd && up.contains(hd)) && up.getBoundingClientRect().width < sr.width * frac) { c = up; up = up.parentElement; } return c; };
      let c = null; for (const f of [0.6, 0.8, 0.9]) { const k = climb(f); if (k.getBoundingClientRect().width < sr.width * f && k !== e) { c = k; break; } }
      if (!c && r.width < sr.width * 0.9) c = e;
      if (c) cols.add(c);
    });
    // 바깥 단만 남긴다
    const list = [...cols].filter((c) => ![...cols].some((o) => o !== c && o.contains(c)));
    const span = (c) => { const r = c.getBoundingClientRect(); let low = r.bottom, high = r.top;
      c.querySelectorAll('*').forEach((e) => { if (!vis(e)) return; const b = e.getBoundingClientRect(); if (b.height < 2) return; if (b.bottom > low) low = b.bottom; if (b.top < high) high = b.top; });
      return [Math.min(r.top, high), low]; };
    list.forEach((c) => {
      // 칸 높이가 고정된 단은 줄여도 안쪽이 다시 늘어나므로 몇 번 거듭 잰다
      let z = 1;
      for (let k = 0; k < 4; k++) {
        const [hi, lo] = span(c); const over = Math.max(0, lo - limit) + Math.max(0, top - hi);
        if (over < 1) break;
        z = Math.max(0.55, z * (lo - hi - over) / (lo - hi));
        c.style.zoom = String(z); c.setAttribute('data-colfit', '');
        if (z <= 0.55) break;
      }
    });
  }
  let t = 0; const soon = () => { clearTimeout(t); t = setTimeout(run, 60); };
  function hook() {
    const R = window.Reveal; if (!R || !R.on) return setTimeout(hook, 200);
    ['ready', 'slidechanged', 'fragmentshown', 'fragmenthidden', 'resize'].forEach((ev) => R.on(ev, soon));
    if (document.fonts) { document.fonts.ready.then(soon); if (document.fonts.addEventListener) document.fonts.addEventListener('loadingdone', soon); }
    window.addEventListener('resize', soon);
    setInterval(run, 1000);
    soon();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', hook); else hook();
})();
