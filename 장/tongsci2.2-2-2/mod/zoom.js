/* 줌인 도입: 콘센트 → 송전탑 → 발전소 → 터빈 → 발전기를 카메라가 옮겨 다니며 보여 준다.
   그림 한 칸의 폭은 1000, 화면에는 한 칸(viewBox 1000×420)씩 보인다.
   한 칸 옮길 때는 두 칸이 다 보이게 물러났다가 다음 칸으로 들어간다. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const W = 1000, Y = 55, H = 420, CY = Y + H / 2;
  const NO = ['①', '②', '③', '④', '⑤'];
  const CAPTIONS = [
    '휴대폰 충전기는 콘센트에서 전기 에너지를 받는다. 이 전기는 벽 뒤 전선을 따라 어디에서 올까?',
    '전기는 송전탑과 전선을 따라 먼 곳에서 실려 온다.',
    '우리가 쓰는 전기 에너지는 대부분 발전소에서 만든다.',
    '발전소에서는 증기·물·바람이 수많은 날개가 달린 터빈을 돌린다.',
    '터빈과 함께 안쪽의 자석이 돌고, 바깥에 고정된 코일에서 전기가 만들어진다. 자석과 코일로 어떻게 전기를 만들까?',
  ];
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const D = (s) => (reduce ? 0 : s);

  const el = (name, attrs, parent) => {
    const e = document.createElementNS(NS, name);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };

  function build(svg) {
    const rotor = svg.querySelector('#turbine-rotor');
    for (let i = 0; i < 16; i++) {
      el('path', { class: 'blade', d: 'M-12 -40 C-34 -96 -24 -146 0 -176 C26 -146 24 -96 12 -40 Z', transform: `translate(3500 280) rotate(${i * 22.5})` }, rotor);
    }
    const coils = svg.querySelector('#gen-coils');
    for (let i = 0; i < 8; i++) {
      el('rect', { class: 'gcoil', x: -26, y: -206, width: 52, height: 58, rx: 6, transform: `translate(4500 300) rotate(${i * 45})` }, coils);
    }
    const gr = svg.querySelector('#gen-rotor');
    el('circle', { class: 'rotor', cx: 4500, cy: 300, r: 118 }, gr);
    el('rect', { class: 'mag-n', x: 4465, y: 200, width: 70, height: 100 }, gr);
    el('rect', { class: 'mag-s', x: 4465, y: 300, width: 70, height: 100 }, gr);
    el('rect', { class: 'ln', x: 4465, y: 200, width: 70, height: 200 }, gr);
    const tn = el('text', { class: 'mag-t', x: 4500, y: 264, 'text-anchor': 'middle' }, gr); tn.textContent = 'N';
    const ts = el('text', { class: 'mag-t', x: 4500, y: 364, 'text-anchor': 'middle' }, gr); ts.textContent = 'S';
  }

  function mount(root) {
    const svg = root.querySelector('.zs');
    const stops = [...root.querySelectorAll('.stops li')];
    const cap = root.querySelector('.zcap');
    build(svg);
    let step = 0;
    const view = (k) => `${W * k} ${Y} ${W} ${H}`;

    const loops = [];
    if (window.gsap) {
      loops.push(
        gsap.to(svg.querySelectorAll('.flow'), { strokeDashoffset: -280, duration: 2, ease: 'none', repeat: -1 }),
        gsap.to(svg.querySelector('#turbine-rotor'), { rotation: 360, svgOrigin: '3500 280', duration: 2.4, ease: 'none', repeat: -1 }),
        gsap.to(svg.querySelector('#gen-rotor'), { rotation: 360, svgOrigin: '4500 300', duration: 2.4, ease: 'none', repeat: -1 }),
        gsap.to(svg.querySelectorAll('.steamline'), { strokeDashoffset: -48, duration: 0.8, ease: 'none', repeat: -1 }),
        gsap.fromTo(svg.querySelectorAll('.steam circle'), { y: 0, opacity: 0.9 }, { y: -26, opacity: 0.35, duration: 1.6, ease: 'sine.inOut', repeat: -1, yoyo: true, stagger: 0.25 }),
        gsap.fromTo(svg.querySelector('.charge'), { attr: { y: 340, height: 10 } }, { attr: { y: 274, height: 76 }, duration: 2.2, ease: 'power1.inOut', repeat: -1 }),
      );
      loops.forEach((t) => t.pause());
    }

    function caption(k, instant) {
      cap.querySelector('.no').textContent = NO[k];
      cap.querySelector('p').textContent = CAPTIONS[k];
      if (window.gsap && !instant) gsap.fromTo(cap, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: D(0.4), delay: D(0.9), ease: 'power2.out' });
    }

    function go(k, instant) {
      const from = step;
      step = k;
      stops.forEach((li, i) => { li.classList.toggle('on', i === k); li.classList.toggle('done', i < k); });
      caption(k, instant);
      if (instant || !window.gsap || from === k) { if (window.gsap) gsap.killTweensOf(svg); svg.setAttribute('viewBox', view(k)); return; }
      const lo = Math.min(from, k), w = W * (Math.abs(k - from) + 1), h = w * H / W;
      gsap.killTweensOf(svg);
      gsap.timeline()
        .to(svg, { attr: { viewBox: `${W * lo} ${CY - h / 2} ${w} ${h}` }, duration: D(0.55), ease: 'power2.inOut' })
        .to(svg, { attr: { viewBox: view(k) }, duration: D(0.75), ease: 'power2.inOut' });
    }

    function setActive(on) { loops.forEach((t) => (on ? t.play() : t.pause())); }

    go(0, true);
    return { go, setActive, get step() { return step; } };
  }

  window.ZoomJourney = { mount };
})();
