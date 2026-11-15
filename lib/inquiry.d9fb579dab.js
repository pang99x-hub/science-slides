/* 탐구 안내(검류계 맛보기·예측)와 마무리(빈칸·○× 문제).
   반이 고른 예측은 Lesson.pred에 두고, «공통점 찾기» 결과 표가 열릴 때 맞춰 본다. */
(function () {
  'use strict';
  const Lesson = window.Lesson = window.Lesson || { pred: {} };
  const TRUTH = { 1: 'y', 2: 'y', 3: 'n' };          // 결과 표 1~3행의 실제 결과(바늘이 움직이는가)
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const D = (s) => (reduce ? 0 : s);
  const NS = 'http://www.w3.org/2000/svg';

  function mountInquiry(root) {
    // 검류계: 영점이 가운데인 눈금
    const ticks = root.querySelector('.galv-ticks');
    for (let i = -5; i <= 5; i++) {
      const a = i / 5 * 55 * Math.PI / 180, r0 = i === 0 ? 62 : 70, r1 = 82;
      const l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', 100 + r0 * Math.sin(a)); l.setAttribute('y1', 130 - r0 * Math.cos(a));
      l.setAttribute('x2', 100 + r1 * Math.sin(a)); l.setAttribute('y2', 130 - r1 * Math.cos(a));
      ticks.appendChild(l);
    }
    const needle = root.querySelector('.galv-needle');
    const input = root.querySelector('#galv-i');
    const read = root.querySelector('.galv-read');
    const show = () => {
      const v = Number(input.value) / 100;
      if (window.gsap) gsap.to(needle, { rotation: v * 55, svgOrigin: '100 130', duration: D(0.35), ease: 'back.out(2)', overwrite: true });
      read.textContent = Math.abs(v) < 0.04 ? '전류 없음 → 바늘은 0'
        : v > 0 ? '한쪽으로 흐르면 → 바늘이 오른쪽' : '반대로 흐르면 → 바늘이 왼쪽';
    };
    input.addEventListener('input', show);
    input.addEventListener('keydown', (e) => e.stopPropagation());   // ←→로 슬라이드가 넘어가지 않게
    show();

    // 실험 전 예측
    root.querySelectorAll('.pred').forEach((row) => {
      const k = row.dataset.row, btns = [...row.querySelectorAll('button')];
      btns.forEach((b) => b.addEventListener('click', () => {
        Lesson.pred[k] = Lesson.pred[k] === b.dataset.v ? undefined : b.dataset.v;
        btns.forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.v === Lesson.pred[k])));
      }));
    });
  }

  // 결과 표 한 줄이 나타나거나 숨을 때
  function badge(row, on) {
    const el = row.querySelector('.pred-badge');
    if (!el) return;
    const k = row.dataset.row, p = k && Lesson.pred[k];
    if (!on || !p) { el.textContent = ''; el.className = 'pred-badge'; return; }
    const ok = p === TRUTH[k];
    el.textContent = ok ? '예측 맞음' : '예측과 다름';
    el.className = 'pred-badge ' + (ok ? 'ok' : 'no');
  }

  function mountWrap(root) {
    const items = [...root.querySelectorAll('.qs li')];
    const stamp = root.querySelector('.stamp');
    if (window.gsap) gsap.set(stamp, { autoAlpha: 0 });
    let stamped = false;
    const check = () => {
      const all = items.every((li) => li.dataset.picked === li.dataset.a);
      if (all && !stamped && window.gsap) {
        stamped = true;
        gsap.fromTo(stamp, { autoAlpha: 0, scale: 2.3, rotate: -32 }, { autoAlpha: 0.92, scale: 1, rotate: -14, duration: D(0.32), ease: 'power4.in' });
      }
    };
    items.forEach((li) => {
      const btns = [...li.querySelectorAll('.ox button')];
      btns.forEach((b) => b.addEventListener('click', () => {
        li.dataset.picked = b.dataset.v;
        li.classList.add('answered');
        btns.forEach((x) => {
          x.classList.toggle('pick', x === b);
          x.classList.toggle('right', x === b && b.dataset.v === li.dataset.a);
          x.classList.toggle('wrong', x === b && b.dataset.v !== li.dataset.a);
        });
        check();
      }));
    });
    root.querySelector('#quiz-show').addEventListener('click', () => {
      items.forEach((li) => {
        li.classList.add('answered');
        li.querySelectorAll('.ox button').forEach((x) => x.classList.toggle('answer', x.dataset.v === li.dataset.a));
      });
    });
  }

  window.LessonParts = { mountInquiry, mountWrap, badge };
})();
