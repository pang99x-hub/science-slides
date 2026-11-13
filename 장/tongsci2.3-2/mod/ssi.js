/* 과학 관련 사회적 쟁점(교과서 150쪽 그림 Ⅲ-6): 가운데 원 둘레에 쟁점 다섯을 그림으로 둔다. 그림을 누르면 오른쪽 저울에
   «기대되는 점»과 «걱정되는 점»이 함께 올라가 흔들리다 거의 수평으로 멈춘다 — 정답이 하나로 정해지지 않는 문제. 저울은 무게를 잰 것이 아니다. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const ISS = {
    nuke: { q: ['오래된 핵발전소,', '계속 돌려야 할까?'], g: '전기 에너지를 싸게 만들 수 있다', b: '정해진 가동 연한을 넘기면 위험할 수 있다', tags: ['경제', '환경', '사회'] },
    renew: { q: ['신재생 에너지,', '더 늘려야 할까?'], g: '지구 환경을 지키는 데 도움이 된다', b: '시설을 세우는 데 비용이 많이 든다', tags: ['환경', '경제'] },
    gmo: { q: ['유전자 변형 작물,', '재배를 막아야 할까?'], g: '병충해에 강하고 수확량이 많다', b: '사람에게 미치는 영향이 아직 충분히 연구되지 않았다', tags: ['사회', '윤리'] },
    animal: { q: ['동물 실험,', '꼭 필요할까?'], g: '약·화장품을 쓰기 전에 안전성을 확인한다', b: '동물의 생명도 존중해야 한다 — 필요 없는 실험은 줄이자', tags: ['윤리'] },
    dev: { q: ['환경을 지키려면', '개발을 멈춰야 할까?'], g: '개발로 경제가 성장해야 하는 나라도 있다', b: '개발하면 환경이 오염된다', tags: ['환경', '경제', '사회'] },
  };
  const KEYS = ['nuke', 'renew', 'gmo', 'animal', 'dev'];

  function art(k, g) {
    const p = (d, c) => el('path', { d, class: c }, g);
    if (k === 'nuke') { p('M-34 40 C -24 10, -24 -10, -30 -40 H 30 C 24 -10, 24 10, 34 40 Z', 'ss-a grey'); p('M-14 -10 l 8 12 l -6 10 M 10 4 l 6 10', 'ss-crack'); p('M-20 -46 c -10 -14 6 -20 0 -32 M 8 -46 c -8 -12 6 -18 0 -30', 'ss-steam'); }
    else if (k === 'renew') { p('M-44 40 l 14 -36 h 40 l -14 36 Z', 'ss-a blue'); p('M-34 22 h 40 M -26 4 l -12 36 M -12 4 l -12 36 M 2 4 l -12 36', 'ss-line'); p('M30 40 V -16', 'ss-pole'); p('M30 -16 l 4 -30 l -8 0 Z M 30 -16 l 26 14 l 4 -7 Z M 30 -16 l -26 14 l 4 7 Z', 'ss-a white'); }
    else if (k === 'gmo') { p('M-8 40 V -20', 'ss-pole green'); p('M-8 -36 c -16 0 -18 34 0 44 c 18 -10 16 -44 0 -44 z', 'ss-a yellow'); p('M-8 10 c -26 -4 -34 -20 -36 -30 M -8 20 c 26 -4 34 -20 36 -30', 'ss-leaf'); p('M30 -40 c 16 10 -16 20 0 30 c 16 10 -16 20 0 30 c 16 10 -16 20 0 30 M 46 -40 c -16 10 16 20 0 30 c -16 10 16 20 0 30 c -16 10 16 20 0 30', 'ss-dna'); }
    else if (k === 'animal') { el('ellipse', { cx: -10, cy: 16, rx: 30, ry: 22, class: 'ss-a white' }, g); el('circle', { cx: 16, cy: -6, r: 15, class: 'ss-a white' }, g); p('M10 -18 c -6 -24 2 -32 6 -30 c 4 4 2 18 0 28 M 22 -18 c 0 -22 10 -30 14 -26 c 2 6 -4 18 -8 26', 'ss-a white'); el('circle', { cx: 21, cy: -8, r: 2.5, class: 'ss-eye' }, g); p('M-50 40 l 10 -26 v -14 h 12 v 14 l 10 26 z', 'ss-a flask'); }
    else { p('M-50 40 h 44 v -16 h -10 l -8 -16 h -20 v 32 h -6 z', 'ss-a yellow'); p('M-14 8 l 22 -30 l 22 8', 'ss-arm'); p('M30 -22 l 12 10 l -14 8 z', 'ss-a grey'); p('M44 40 V 6', 'ss-pole'); el('circle', { cx: 44, cy: -4, r: 18, class: 'ss-a green' }, g); el('circle', { cx: -40, cy: 42, r: 7, class: 'ss-wheel' }, g); el('circle', { cx: -16, cy: 42, r: 7, class: 'ss-wheel' }, g); }
  }

  function mount(root) {
    const svg = root.querySelector('.ss-svg'), now = root.querySelector('.ss-now'), sc = root.querySelector('.ss-scale');
    const title = root.querySelector('.ss-title'), gEl = root.querySelector('.ss-g'), bEl = root.querySelector('.ss-b'), tags = root.querySelector('.ss-tags');
    el('rect', { class: 'ss-bg', x: -400, y: -300, width: 1856, height: 1300 }, svg);
    const C = [528, 392];
    el('circle', { class: 'ss-hub', cx: C[0], cy: C[1], r: 104 }, svg);
    ['여러 가지', '과학 관련', '사회적 쟁점'].forEach((t, i) => { el('text', { class: 'ss-ht', x: C[0], y: C[1] - 24 + i * 32 }, svg).textContent = t; });
    const nodes = KEYS.map((k, i) => {
      const a = -Math.PI / 2 + i * 2 * Math.PI / 5, x = C[0] + 262 * Math.cos(a), y = C[1] + 250 * Math.sin(a);
      el('path', { class: 'ss-link', d: `M${C[0]} ${C[1]} L ${x.toFixed(1)} ${y.toFixed(1)}` }, svg).parentNode.insertBefore(svg.lastChild, svg.querySelector('.ss-hub'));
      const g = el('g', { class: 'ss-node', 'data-k': k, tabindex: '0', role: 'button', 'aria-label': ISS[k].q.join(' ') }, svg);
      el('circle', { class: 'ss-nbg', cx: x, cy: y, r: 98 }, g);
      const pic = el('g', { transform: `translate(${x.toFixed(1)} ${(y - 26).toFixed(1)})` }, g); art(k, pic);
      ISS[k].q.forEach((t, j) => { el('text', { class: 'ss-nt', x, y: y + 44 + j * 24 }, g).textContent = t; });
      return g;
    });
    // 저울
    el('path', { class: 'ss-sbase', d: 'M240 166 h 80 l -20 -16 h -40 z' }, sc);
    el('rect', { class: 'ss-spole', x: 274, y: 30, width: 12, height: 124 }, sc);
    const beam = el('g', {}, sc); el('rect', { class: 'ss-beam', x: 70, y: 24, width: 420, height: 12, rx: 6 }, beam); el('circle', { class: 'ss-pivot', cx: 280, cy: 30, r: 11 }, beam);
    const pan = (k, label) => { const g = el('g', { class: `ss-pan ${k}` }, sc); el('path', { class: 'ss-str', d: 'M-70 90 L 0 0 L 70 90' }, g); el('path', { class: 'ss-dish', d: 'M-84 90 h 168 a 84 18 0 0 1 -168 0 z' }, g); const blk = el('g', { class: 'ss-blk' }, g); el('rect', { x: -66, y: 46, width: 132, height: 42, rx: 6 }, blk); el('text', { x: 0, y: 74 }, blk).textContent = label; return g; };
    const L = pan('good', '기대'), R = pan('bad', '걱정');
    let ang = 0, t0 = 0, amp = 0, bias = 0, raf = 0;
    function place(a) {
      beam.setAttribute('transform', `rotate(${a.toFixed(2)} 280 30)`);
      const r = a * Math.PI / 180;
      L.setAttribute('transform', `translate(${(280 - 190 * Math.cos(r)).toFixed(1)} ${(30 - 190 * Math.sin(r)).toFixed(1)})`);
      R.setAttribute('transform', `translate(${(280 + 190 * Math.cos(r)).toFixed(1)} ${(30 + 190 * Math.sin(r)).toFixed(1)})`);
    }
    function wobble(now2) {
      raf = 0; const t = (now2 - t0) / 1000;
      ang = bias + amp * Math.exp(-t / 0.7) * Math.sin(t * 7);
      place(ang);
      if (t < 4) raf = requestAnimationFrame(wobble);
    }
    sc.classList.add('empty'); place(0);
    function pick(k) {
      const I = ISS[k];
      nodes.forEach((n) => n.classList.toggle('on', n.dataset.k === k));
      title.textContent = I.q.join(' '); gEl.textContent = I.g; bEl.textContent = I.b;
      tags.innerHTML = ''; I.tags.forEach((t) => { const s = document.createElement('span'); s.textContent = t; tags.appendChild(s); }); tags.prepend('측면 ');
      sc.classList.remove('empty');
      amp = 14; bias = (KEYS.indexOf(k) % 2 ? 1 : -1) * 1.5; t0 = performance.now();
      if (window.Deck.reduce) place(bias); else if (!raf) raf = requestAnimationFrame(wobble);
      now.textContent = '저울이 한쪽으로 쉽게 기울지 않는다 — 다른 쟁점도 눌러 보자';
    }
    nodes.forEach((n) => { n.addEventListener('click', () => pick(n.dataset.k)); n.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); pick(n.dataset.k); } }); });
    root._ssi = { pick };
    return {};
  }
  window.IssueMap = { mount };
})();
