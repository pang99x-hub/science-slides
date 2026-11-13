/* 해 보기 «과학 관련 사회적 쟁점에 대한 합리적 의사 결정»(교과서 151쪽): 생성형 인공지능 프로그램.
   명령어 낱말을 눌러 넣고 «그리기»를 누르면, 오른쪽 «학습에 쓰인 그림들»의 조각이 날아와 섞이며 그림이 붓질처럼 드러난다.
   «다른 사람 B»를 누르면 같은 명령어로 비슷한 그림이 나온다(이용자 저작권에 대한 반론의 근거). 오른쪽 패널의 네 후보를 고르면 근거와 반론이 보인다. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const WORDS = ['우주', '오페라', '극장', '빛나는', '옛 그림처럼'];
  const WHO = {
    user: { t: '명령어를 넣은 이용자', r: '명령어를 고르고 다듬어 원하는 그림을 얻었으니 이용자의 창작물로 인정하자.', c: '반론: 비슷한 명령어면 누구든 비슷한 그림을 얻는다 — 왼쪽 «다른 사람 B»의 그림을 보자.' },
    dev: { t: '인공지능 개발자', r: '그림을 그릴 수 있는 인공지능을 만든 개발자의 권리도 생각해야 한다.', c: '반론: 개발자는 이 그림을 직접 구상하거나 그리지 않았다.' },
    art: { t: '학습에 쓰인 그림의 작가', r: '인공지능은 수많은 작품을 학습해 그린다 — 그 작품들의 저작권도 고려해야 한다.', c: '반론: 수많은 그림 가운데 누구의 몫이 얼마인지 가리기 어렵다.' },
    rule: { t: '사회가 함께 기준을 정한다', r: '여러 입장이 맞서니 사회 구성원이 함께 의논해 인공지능 결과물의 기준과 원칙을 정하자.', c: '함께 정하기 전까지는 판단이 엇갈린다 — 과학적 이해를 바탕으로 의견을 모은다.' },
  };
  let seedN = 7; const rnd = () => (seedN = (seedN * 16807) % 2147483647) / 2147483647;

  // 명령어 낱말에 따라 그림을 그린다(w×h 안). s는 같은 명령어에서도 조금씩 달라지게 하는 씨앗.
  function painting(g, words, s, w, h, uid) {
    g.innerHTML = '';
    const has = (k) => words.includes(k);
    seedN = 11 + s * 97;
    const defs = el('defs', {}, g);
    const sky = el('linearGradient', { id: `ai-sky-${uid}`, x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
    const space = has('우주');
    el('stop', { offset: 0, 'stop-color': space ? '#141c3a' : '#f3e2c4' }, sky); el('stop', { offset: 1, 'stop-color': space ? '#3d2f6b' : '#e6c99a' }, sky);
    if (has('옛 그림처럼')) { const f = el('filter', { id: `ai-old-${uid}` }, defs); el('feColorMatrix', { type: 'matrix', values: '0.5 0.45 0.15 0 0.05  0.38 0.5 0.12 0 0.03  0.25 0.32 0.2 0 0  0 0 0 1 0' }, f); g.setAttribute('filter', `url(#ai-old-${uid})`); } else g.removeAttribute('filter');
    el('rect', { x: 0, y: 0, width: w, height: h, fill: `url(#ai-sky-${uid})` }, g);
    if (space) for (let i = 0; i < 46; i++) el('circle', { cx: (rnd() * w).toFixed(1), cy: (rnd() * h * 0.7).toFixed(1), r: (0.8 + rnd() * 2).toFixed(1), fill: '#fff', opacity: (0.5 + rnd() * 0.5).toFixed(2) }, g);
    if (space) { el('circle', { cx: w * (0.78 + rnd() * 0.08), cy: h * (0.18 + rnd() * 0.06), r: h * 0.12, fill: '#e2a86b' }, g); el('ellipse', { cx: w * 0.8, cy: h * 0.2, rx: h * 0.2, ry: h * 0.04, fill: 'none', stroke: '#f3d39a', 'stroke-width': 3 }, g); }
    if (has('빛나는')) { const rg = el('radialGradient', { id: `ai-glow-${uid}` }, defs); el('stop', { offset: 0, 'stop-color': '#fff6c8', 'stop-opacity': 0.95 }, rg); el('stop', { offset: 1, 'stop-color': '#ffd84a', 'stop-opacity': 0 }, rg); el('circle', { cx: w * (0.5 + (rnd() - 0.5) * 0.08), cy: h * 0.42, r: h * 0.42, fill: `url(#ai-glow-${uid})` }, g); }
    if (has('극장')) {
      el('rect', { x: 0, y: h * 0.78, width: w, height: h * 0.22, fill: '#5a3a2a' }, g);
      el('path', { d: `M0 0 H ${w} V ${h * 0.1} H 0 Z`, fill: '#8a1f2b' }, g);
      el('path', { d: `M0 0 C ${w * 0.08} ${h * 0.3}, ${w * 0.04} ${h * 0.6}, ${w * 0.12} ${h * 0.8} L 0 ${h * 0.8} Z`, fill: '#a3263a' }, g);
      el('path', { d: `M${w} 0 C ${w * 0.92} ${h * 0.3}, ${w * 0.96} ${h * 0.6}, ${w * 0.88} ${h * 0.8} L ${w} ${h * 0.8} Z`, fill: '#a3263a' }, g);
      el('path', { d: `M${w * 0.16} ${h * 0.8} A ${w * 0.34} ${h * 0.72} 0 0 1 ${w * 0.84} ${h * 0.8}`, fill: 'none', stroke: '#d9b45a', 'stroke-width': 6 }, g);
    } else el('path', { d: `M0 ${h * 0.82} C ${w * 0.3} ${h * 0.74}, ${w * 0.6} ${h * 0.9}, ${w} ${h * 0.78} V ${h} H 0 Z`, fill: space ? '#2a2246' : '#a7b88a' }, g);
    if (has('오페라')) [0.36, 0.5, 0.64].forEach((x, i) => {
      const cx = w * (x + (rnd() - 0.5) * 0.04), base = h * 0.8, hh = h * (0.3 + (i === 1 ? 0.06 : 0));
      el('path', { d: `M${cx - hh * 0.22} ${base} L ${cx - hh * 0.08} ${base - hh * 0.75} H ${cx + hh * 0.08} L ${cx + hh * 0.22} ${base} Z`, fill: ['#e8e2d0', '#3c5a8c', '#7a3b5e'][i] }, g);
      el('circle', { cx, cy: base - hh * 0.85, r: hh * 0.11, fill: '#f0d2b0' }, g);
      el('path', { d: `M${cx - hh * 0.05} ${base - hh * 0.6} l ${(i - 1) * hh * 0.3 || hh * 0.25} ${-hh * 0.25}`, stroke: '#f0d2b0', 'stroke-width': 4, 'stroke-linecap': 'round' }, g);
    });
    if (has('옛 그림처럼')) for (let i = 0; i < 30; i++) el('path', { d: `M${(rnd() * w).toFixed(0)} ${(rnd() * h).toFixed(0)} q 14 -6 28 0`, stroke: '#fff', 'stroke-opacity': 0.12, 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round' }, g);
    if (!words.length) el('text', { x: w / 2, y: h / 2, class: 'ai-empty' }, g).textContent = '명령어를 넣어 주세요';
  }

  function mount(root) {
    const svg = root.querySelector('.ai-svg'), now = root.querySelector('.ai-now');
    const opts = [...root.querySelectorAll('.ai-opts button')], wt = root.querySelector('.ai-wt'), wr = root.querySelector('.ai-wr'), wc = root.querySelector('.ai-wc');
    const gs = window.gsap, reduce = window.Deck.reduce || !gs;
    el('rect', { class: 'ai-bg', x: -400, y: -300, width: 1856, height: 1300 }, svg);
    // 프로그램 창
    el('rect', { class: 'ai-win', x: 24, y: 24, width: 616, height: 652, rx: 14 }, svg);
    el('rect', { class: 'ai-bar', x: 24, y: 24, width: 616, height: 40, rx: 14 }, svg); el('rect', { class: 'ai-bar', x: 24, y: 44, width: 616, height: 20 }, svg);
    el('text', { class: 'ai-bt', x: 332, y: 51 }, svg).textContent = '생성형 인공지능 · 그림 만들기';
    el('rect', { class: 'ai-prompt', x: 48, y: 78, width: 568, height: 52, rx: 10 }, svg);
    const ptext = el('text', { class: 'ai-pt', x: 64, y: 112 }, svg);
    const chips = WORDS.map((w, i) => {
      const x = 48 + [0, 84, 190, 276, 376][i], wd = [74, 96, 76, 90, 130][i];
      const g = el('g', { class: 'ai-word', tabindex: '0', role: 'button', 'aria-pressed': 'false', 'aria-label': `명령어 «${w}» 넣기` }, svg);
      el('rect', { x, y: 146, width: wd, height: 46, rx: 23 }, g); el('text', { x: x + wd / 2, y: 176 }, g).textContent = w;
      return g;
    });
    const go = el('g', { class: 'ai-go', tabindex: '0', role: 'button', 'aria-label': '그리기' }, svg);
    el('rect', { x: 516, y: 84, width: 92, height: 40, rx: 10 }, go); el('text', { x: 562, y: 111 }, go).textContent = '그리기';
    el('rect', { class: 'ai-frame', x: 48, y: 210, width: 568, height: 446, rx: 6 }, svg);
    const canvasG = el('g', { transform: 'translate(52 214)' }, svg);
    const clip = el('clipPath', { id: 'ai-clip' }, el('defs', {}, svg)); const clipR = el('rect', { x: 0, y: 0, width: 0, height: 438 }, clip);
    const pic = el('g', { 'clip-path': 'url(#ai-clip)' }, canvasG);
    // 학습에 쓰인 그림들
    el('text', { class: 'ai-lt', x: 846, y: 54 }, svg).textContent = '학습에 쓰인 그림들(수많은 작품)';
    const thumbs = [];
    for (let i = 0; i < 12; i++) {
      const x = 668 + (i % 4) * 92, y = 70 + Math.floor(i / 4) * 74;
      const t = el('g', { class: 'ai-th', transform: `translate(${x} ${y})` }, svg);
      const inner = el('g', {}, t); painting(inner, [['우주', '극장'], ['우주'], ['극장'], ['오페라'], ['빛나는'], ['옛 그림처럼'], ['우주', '빛나는'], ['극장', '오페라'], ['옛 그림처럼', '극장'], ['우주', '오페라'], ['빛나는', '옛 그림처럼'], ['극장', '빛나는']][i], i + 3, 84, 64, `t${i}`);
      el('rect', { class: 'ai-thf', x: 0, y: 0, width: 84, height: 64 }, t);
      thumbs.push({ t, x, y });
    }
    // 다른 사람 B
    const other = el('g', { class: 'ai-other', tabindex: '0', role: 'button', 'aria-label': '다른 사람 B가 같은 명령어로 그리기' }, svg);
    el('rect', { class: 'ai-ohit', x: 662, y: 318, width: 374, height: 358, rx: 14 }, other);
    el('circle', { class: 'ai-av', cx: 700, cy: 360, r: 22 }, other); el('text', { class: 'ai-avt', x: 700, y: 368 }, other).textContent = 'B';
    el('text', { class: 'ai-ot', x: 734, y: 352 }, other).textContent = '다른 사람 B';
    const oSub = el('text', { class: 'ai-os', x: 734, y: 376 }, other); oSub.textContent = '누르면 같은 명령어로 그린다';
    el('rect', { class: 'ai-frame', x: 690, y: 398, width: 318, height: 248, rx: 6 }, other);
    const picB = el('g', { transform: 'translate(694 402)' }, other);
    const sameT = el('text', { class: 'ai-same', x: 849, y: 666 }, other);
    const fly = el('g', {}, svg);
    let words = [], drawn = null, busy = false;
    function prompt() {
      ptext.textContent = words.length ? words.join(' · ') : '낱말을 눌러 명령어를 만들어 보자';
      ptext.classList.toggle('ph', !words.length);
      go.classList.toggle('ready', words.length >= 2 && !busy);
      chips.forEach((c, i) => { const on = words.includes(WORDS[i]); c.classList.toggle('on', on); c.setAttribute('aria-pressed', String(on)); });
      if (!drawn) now.textContent = words.length >= 2 ? '② «그리기»를 눌러 보자' : '① 명령어 낱말을 두 개 이상 눌러 넣어 보자';
    }
    function toggle(i) { if (busy) return; const w = WORDS[i]; words = words.includes(w) ? words.filter((x) => x !== w) : [...words, w]; words.sort((a, b) => WORDS.indexOf(a) - WORDS.indexOf(b)); prompt(); }
    function draw() {
      if (words.length < 2 || busy) return;
      busy = true; prompt(); drawn = words.slice();
      painting(pic, drawn, 1, 560, 438, 'main');
      const done = () => { busy = false; clipR.setAttribute('width', 560); prompt(); now.textContent = '③ 오른쪽 «다른 사람 B»를 눌러 같은 명령어로 그려 보자'; sameT.textContent = ''; picB.innerHTML = ''; oSub.textContent = '누르면 같은 명령어로 그린다'; other.classList.add('ready'); };
      if (reduce) { done(); return; }
      clipR.setAttribute('width', 0);
      const tl = gs.timeline({ onComplete: done });
      thumbs.forEach((th, i) => {
        const c = th.t.cloneNode(true); c.classList.add('ai-flyc'); fly.appendChild(c);
        tl.fromTo(c, { x: th.x, y: th.y, opacity: 1 }, { x: 150 + (i % 4) * 100, y: 300 + Math.floor(i / 4) * 90, scale: 0.7, opacity: 0, duration: 0.8, ease: 'power2.in', onComplete: () => c.remove() }, i * 0.06);
      });
      tl.to(clipR, { attr: { width: 560 }, duration: 1.4, ease: 'power1.inOut' }, 0.7);
    }
    function drawB() {
      if (!drawn || busy) return;
      painting(picB, drawn, 2, 310, 240, 'b');
      if (!reduce) gs.fromTo(picB, { opacity: 0 }, { opacity: 1, duration: 0.8 });
      oSub.textContent = `명령어: ${drawn.join(' · ')}`; sameT.textContent = '같은 명령어 → 비슷한 그림';
      now.textContent = '④ 저작권은 누구에게? 오른쪽에서 골라 보자'; now.classList.add('done');
    }
    chips.forEach((c, i) => { c.addEventListener('click', () => toggle(i)); c.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); toggle(i); } }); });
    [[go, draw], [other, drawB]].forEach(([g, f]) => { g.addEventListener('click', f); g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); f(); } }); });
    // 저작권 후보(응답 모으기와 같은 단추)
    opts.forEach((b) => b.addEventListener('click', () => {
      const on = b.getAttribute('aria-pressed') !== 'true';
      opts.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
      const W = WHO[b.dataset.k];
      if (!on) { wt.textContent = '하나를 골라 보자'; wr.textContent = '고르면 그 생각의 근거와, 다른 쪽에서 나올 반론이 보인다.'; wc.textContent = ''; return; }
      wt.textContent = `© ${W.t}`; wr.textContent = W.r; wc.textContent = W.c;
    }));
    painting(pic, [], 1, 560, 438, 'main'); clipR.setAttribute('width', 560);
    prompt();
    root._ai = { words: (list) => { words = list.slice(); prompt(); }, draw, drawB, pick: (k) => opts.find((b) => b.dataset.k === k).click() };
    return {};
  }
  window.AIArt = { mount };
})();
