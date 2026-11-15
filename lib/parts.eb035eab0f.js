/* 여러 차시가 함께 쓰는 장: 표지(#cover)와 덮개(예측 → 덮개 들기 → 도장). */
(function () {
  'use strict';
  const { D, reduce } = window.Deck;

  // 표지: Manim 영상은 도입부(data-loop초)가 끝나면 그 지점부터 되풀이한다
  window.Deck.part('cover', (root) => {
    const video = root.querySelector('video');
    const h1 = root.querySelector('h1');
    const split = window.SplitText && h1 ? new SplitText(h1, { type: 'chars', charsClass: 'ch' }) : null;
    let tl = null;
    if (video) video.addEventListener('ended', () => { video.currentTime = Number(video.dataset.loop || 2.4); video.play().catch(() => {}); });
    function play() {
      if (video) video.play().catch(() => {});
      if (!window.gsap || tl) return;
      tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        .from(root.querySelector('.masthead'), { autoAlpha: 0, y: -12, duration: D(0.4) })
        .from(split ? split.chars : h1, { autoAlpha: 0, y: 46, rotate: 4, stagger: D(0.035), duration: D(0.55) }, '-=0.1')
        .fromTo(root.querySelector('.hero-pen'), { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: D(1.1), ease: 'power1.inOut' }, '-=0.15')
        .from(root.querySelector('.col-fig'), { autoAlpha: 0, x: 60, duration: D(0.7) }, 0.2)
        .from(root.querySelector('.goals-label'), { autoAlpha: 0, duration: D(0.3) }, '-=0.4');
    }
    return { setActive(on) { if (on) play(); else if (video) video.pause(); } };
  });

  // 덮개: 보기를 고르고(응답 집계 가능) 덮개를 들면 정답과 도장. data-anim="flap" 단계와 묶여 있다.
  function flap(root) {
    const flapEl = root.querySelector('.flap');
    const stamp = root.querySelector('.flap-wrap .stamp');
    const note = root.querySelector('.answer .note');
    const options = [...root.querySelectorAll('.option')];
    const flapIndex = Number(root.querySelector('[data-anim="flap"]').dataset.fragmentIndex);
    const stampKey = root.dataset.stampKey || 'hanmin-tongsci2-' + root.id;
    const tallies = options.map(() => 0);
    let choice = null;
    gsap.set(stamp, { autoAlpha: 0 });

    options.forEach((o, i) => {
      const pick = () => {
        choice = choice === o.dataset.key ? null : o.dataset.key;
        options.forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.key === choice)));
      };
      o.addEventListener('click', (e) => { if (!e.target.closest('.tally')) pick(); });
      o.addEventListener('keydown', (e) => {
        if ((e.key === 'Enter' || e.key === ' ') && !e.target.closest('.tally')) { e.preventDefault(); e.stopPropagation(); pick(); }
      });
      o.querySelectorAll('.tb').forEach((b) => b.addEventListener('click', (e) => {
        e.stopPropagation();
        tallies[i] = Math.max(0, tallies[i] + Number(b.dataset.d));
        const total = tallies.reduce((a, c) => a + c, 0) || 1;
        options.forEach((x, j) => {
          x.querySelector('.tally span').textContent = tallies[j];
          x.querySelector('.bar i').style.width = (tallies[j] / total * 100) + '%';
        });
      }));
    });
    const tallyBtn = root.querySelector('[data-act="tally"]');
    if (tallyBtn) tallyBtn.addEventListener('click', (e) => {
      const on = root.querySelector('.predict').classList.toggle('tallying');
      e.currentTarget.setAttribute('aria-pressed', String(on));
    });
    const open = () => { if (Reveal.getCurrentSlide() === root) Reveal.navigateFragment(flapIndex); };
    flapEl.addEventListener('click', open);
    flapEl.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); open(); } });

    function lift(instant) {
      const d = instant ? 0 : 1;
      gsap.to(flapEl, { rotateX: 104, autoAlpha: 0, duration: D(0.75) * d, ease: 'power2.inOut', onComplete: () => { flapEl.style.pointerEvents = 'none'; } });
      const right = options.find((o) => o.dataset.right === 'true');
      right.classList.add('right');
      const picked = options.find((o) => o.dataset.key === choice);
      note.textContent = !choice ? '다음에는 먼저 골라 보고 덮개를 들어요.'
        : picked === right ? (root.dataset.rightNote || '맞혔어요!') : picked.dataset.why;
      gsap.fromTo(stamp, { autoAlpha: 0, scale: 2.3, rotate: -32 },
        { autoAlpha: 0.92, scale: 1, rotate: -14, duration: D(0.32) * d, delay: D(0.7) * d, ease: 'power4.in',
          onComplete: () => {
            if (!instant && !reduce) gsap.fromTo(root.querySelector('.flap-wrap'), { x: -4 }, { x: 0, duration: 0.25, ease: 'elastic.out(1, 0.3)' });
            try { localStorage.setItem(stampKey, JSON.stringify({ at: Date.now(), choice })); } catch (err) { /* 저장이 막혀도 수업은 그대로 */ }
          } });
    }
    function lower(instant) {
      flapEl.style.pointerEvents = '';
      gsap.to(flapEl, { rotateX: 0, autoAlpha: 1, duration: instant ? 0 : D(0.45), ease: 'power2.out' });
      gsap.set(stamp, { autoAlpha: 0 });
      options.forEach((o) => o.classList.remove('right'));
      note.textContent = '';
    }
    const badge = (f, on) => { if (window.LessonParts && f.dataset.row) window.LessonParts.badge(f, on); };
    return {
      fragment(f, on) {
        if (f.dataset.anim === 'flap') (on ? lift() : lower());
        if (f.dataset.anim === 'result') badge(f, on);
      },
      sync(slide) {
        slide.querySelectorAll('.fragment.custom').forEach((f) => {
          const vis = f.classList.contains('visible');
          if (f.dataset.anim === 'flap') (vis ? lift(true) : lower(true));
          if (f.dataset.anim === 'result') badge(f, vis);
        });
      },
    };
  }

  window.Parts = { flap };
})();
