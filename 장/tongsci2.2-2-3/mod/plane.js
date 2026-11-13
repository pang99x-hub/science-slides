/* 표지: 솔라 임펄스 2호의 하루. 시각 막대(0~24시)를 끌면 해·달·하늘·바다 색이 바뀐다.
   낮: 날개의 태양 전지(빛 → 전기)가 프로펠러를 돌리고(전기 → 운동) 남는 전기는 전지에 모은다(전기 → 화학).
   밤: 전지(화학 → 전기)로 프로펠러를 돌린다. 전지 눈금은 하루를 여러 번 돌린 정상 상태에서 시각마다 정해 둔다
   (막대를 앞뒤로 끌어도 같은 시각이면 같은 눈금). 값은 그림을 위한 것이다. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const NAC = [130, 228, 412, 510];
  const sunAlt = (t) => Math.sin(Math.PI * (t - 6) / 12);              // 6시 0, 12시 1, 0시 −1
  const light = (t) => Math.max(0, sunAlt(t));
  // 전지 눈금: 시간당 0.17·빛 − 0.05, 6~100 %
  const level = (() => {
    const n = 480, dt = 24 / n, step = (L, t) => Math.min(1, Math.max(0.06, L + (0.17 * light(t) - 0.05) * dt));
    let L = 0.5;
    for (let r = 0; r < 4; r++) for (let i = 0; i < n; i++) L = step(L, i * dt);
    const tab = [];
    for (let i = 0; i <= n; i++) { tab.push(L); L = step(L, i * dt); }
    return (t) => { const x = (((t % 24) + 24) % 24) / 24 * n, i = Math.min(n - 1, Math.floor(x)), f = x - i; return tab[i] + (tab[i + 1] - tab[i]) * f; };
  })();
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, f) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * f)).join(',')})`; };
  const mix3 = (n, d, y, s) => (s < 0 ? mix(d, n, Math.min(1, -s * 3)) : mix(d, y, Math.min(1, s * 2.6)));   // 밤 · 해 뜰 녘 · 낮
  const ec = (e, t) => `<i class="ec" style="--c: var(--e-${e})">${t}</i>`;
  const clock = (t) => {
    const h = Math.floor(t) % 24, m = Math.floor((t - Math.floor(t)) * 6) * 10;
    return `${h < 12 ? '오전' : '오후'} ${h % 12 === 0 ? 12 : h % 12}:${String(m).padStart(2, '0')}`;
  };

  function mount(root) {
    const svg = root.querySelector('.pl-svg'), q = (s) => svg.querySelector(s);
    const input = root.querySelector('#pl-time'), clk = root.querySelector('.pl-clock'), say = root.querySelector('.pl-say');
    const play = root.querySelector('#pl-play');
    const skyA = q('.pl-sky-a'), skyB = q('.pl-sky-b'), stars = q('.pl-stars'), sun = q('.pl-sun'), glow = q('.pl-glow');
    const moon = q('.pl-moon'), moonCut = q('.pl-moon-cut'), clouds = q('.pl-clouds'), sea = q('.pl-sea');
    const rays = q('.pl-rays'), shine = q('.pl-shine'), plane = q('.pl-plane'), dotsG = q('.pl-dots');
    const battF = q('.pl-batt-f'), battT = q('.pl-batt-t'), props = [...svg.querySelectorAll('.pl-props path')];
    // 날개의 태양 전지 칸(앞 가장자리 44~596, 뒤 68~572를 24칸으로, 가운데 가로줄 둘)
    const grid = q('.pl-grid');
    for (let i = 1; i < 24; i++) {
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('d', `M${44 + 552 * i / 24} 213 L ${68 + 504 * i / 24} 183`); grid.appendChild(p);
    }
    [193, 203].forEach((y) => { const k = (213 - y) / 30, m = document.createElementNS(NS, 'path'); m.setAttribute('d', `M${44 + 24 * k} ${y} H ${596 - 24 * k}`); grid.appendChild(m); });
    // 전기 알갱이: 프로펠러마다 셋
    const dots = [];
    NAC.forEach((x, k) => { for (let j = 0; j < 3; j++) { const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', 4.5); dotsG.appendChild(c); dots.push({ c, x, p: (j / 3 + k * 0.17) % 1 }); } });

    let t = Number(input.value), ang = 0, clockT = 0, playing = false, last = '';
    function paint(dt) {
      const s = sunAlt(t), L = light(t), lv = level(t), prev = level(t - 0.1);
      const charging = lv > prev + 1e-4, full = lv > 0.995;
      skyA.setAttribute('stop-color', mix3('#0d1836', '#3b4f8a', '#6fb3e6', s));
      skyB.setAttribute('stop-color', mix3('#1d2c55', '#f2a66e', '#d8eef8', s));
      sea.setAttribute('fill', mix3('#13213f', '#3d5b86', '#4f8fb8', s));
      clouds.setAttribute('fill-opacity', String(0.35 + 0.5 * Math.max(0, Math.min(1, s * 3 + 0.6))));
      clouds.querySelectorAll('path').forEach((p) => p.setAttribute('fill', mix3('#3a4668', '#f6d7c0', '#ffffff', s)));
      stars.setAttribute('opacity', String(Math.max(0, Math.min(1, -s * 3))));
      // 해: 6시 왼쪽 → 18시 오른쪽. 달: 18시 → 다음 날 6시
      const sx = 40 + 560 * (t - 6) / 12, sy = 262 - 214 * s;
      sun.setAttribute('cx', sx); sun.setAttribute('cy', sy); glow.setAttribute('cx', sx); glow.setAttribute('cy', sy);
      glow.setAttribute('opacity', String(Math.max(0, Math.min(1, s * 2 + 0.3))));
      sun.style.display = s > -0.15 ? '' : 'none';
      const u = (((t - 18) % 24) + 24) % 24 / 12, ms = Math.sin(Math.PI * u);
      moon.style.display = u <= 1 && ms > 0.04 ? '' : 'none';
      moon.setAttribute('transform', `translate(${40 + 560 * u} ${262 - 190 * ms})`);
      moonCut.setAttribute('fill', mix3('#0d1836', '#3b4f8a', '#6fb3e6', s));
      // 햇빛 → 날개
      rays.setAttribute('opacity', String(L * 0.95));
      rays.querySelectorAll('line').forEach((l) => { l.setAttribute('x1', sx); l.setAttribute('y1', sy); });
      shine.style.opacity = String(L * 0.55);
      // 비행기: 살짝 오르내리고, 프로펠러는 늘 돈다
      clockT += dt; ang += dt * 20;
      plane.setAttribute('transform', `translate(0 ${Math.sin(clockT * 1.6) * 3})`);
      props.forEach((p) => p.setAttribute('transform', `rotate(${(ang * 57.3) % 360} ${p.dataset.x} 246)`));
      // 전기 알갱이: 낮에는 날개 → 프로펠러, 밤에는 몸통(전지) → 프로펠러
      const day = L > 0.12;
      dots.forEach((d) => {
        d.p = (d.p + dt * (day ? 0.9 : 0.6)) % 1;
        const y0 = day ? 198 : 224, y = y0 + (246 - y0) * d.p;
        d.c.setAttribute('cx', d.x + (day ? Math.sin(d.p * 9) * 1.5 : 0)); d.c.setAttribute('cy', y);
        d.c.setAttribute('opacity', String(Math.sin(Math.PI * d.p)));
      });
      battF.setAttribute('width', String(34 * lv));
      battT.textContent = `${Math.round(lv * 100)}%${charging ? ' 충전 중' : full ? ' 가득' : ' 쓰는 중'}`;
      clk.textContent = clock(t);
      const key = L > 0.3 ? (full ? 'dayfull' : 'day') : L > 0 ? 'dusk' : 'night';
      if (key !== last) {
        last = key;
        say.innerHTML = key === 'day' ? `낮 ${ec('light', '빛')}→${ec('elec', '전기')}→${ec('kin', '운동')} 프로펠러 · 남는 전기 → ${ec('chem', '화학')} 전지에 저장`
          : key === 'dayfull' ? `낮 ${ec('light', '빛')}→${ec('elec', '전기')}→${ec('kin', '운동')} 프로펠러 · 전지는 가득`
          : key === 'dusk' ? `빛이 약할 때 ${ec('light', '빛')}과 ${ec('chem', '화학')} 전지 → ${ec('elec', '전기')}→${ec('kin', '운동')}`
          : `밤 ${ec('chem', '화학')} 전지 → ${ec('elec', '전기')}→${ec('kin', '운동')} 프로펠러`;
      }
    }
    const loop = window.Stage.loop((dt) => {
      if (playing) { t = (t + dt * 2) % 24; input.value = String(t); }
      paint(dt);
    });
    input.addEventListener('input', () => { t = Number(input.value); if (window.Stage.reduce || !loop.on) paint(0); });
    input.addEventListener('keydown', (e) => e.stopPropagation());   // ←→로 장이 넘어가지 않게
    play.addEventListener('click', () => {
      playing = !playing; play.setAttribute('aria-pressed', String(playing)); play.textContent = playing ? '멈추기' : '하루 흘려 보기';
    });
    // 예측 하나 고르기
    const opts = [...root.querySelectorAll('.share-opts button')];
    opts.forEach((b) => b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') !== 'true';
      opts.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
    }));
    const answer = (on) => { svg.classList.toggle('ans', on); root.querySelector('#pr-sun').classList.toggle('answer', on); };
    paint(0);
    return {
      setActive(on) { if (on && !window.Stage.reduce) loop.start(); else { loop.stop(); paint(0); } },
      fragment(f, on) { if (f.dataset.anim === 'plane') answer(on); },
      sync(slide) { const f = slide.querySelector('[data-anim="plane"]'); answer(!!f && f.classList.contains('visible')); },
    };
  }
  window.SolarPlane = { mount };
})();
