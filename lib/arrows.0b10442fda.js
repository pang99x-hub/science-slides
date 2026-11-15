/* 2차시 5장 해 보기(교과서 75쪽): 생물과 환경 사이 영향의 방향을 가리는 사례 넷 — (가) 소와 메테인, (나) 추운 곳의 펭귄,
   (다) 드론으로 비료를 뿌린 땅, (라) 산소를 내놓는 식물(그림 Ⅱ-4). 사례마다 생물(초록 동그라미)과 환경(파란 동그라미) 사이에
   손가락으로 화살표를 그린다(영향을 준 쪽 → 받은 쪽). 방향이 맞으면 장면이 움직이고 오른쪽 두 칸 중 하나에 쌓인다. */
(function () {
  'use strict';
  const { el, pt, clamp, loop } = window.Eco;
  const CW = 512, CH = 372;
  const CASES = [
    { c: 'cow', tag: '(가)', title: '소', bio: ['소', 120, 270], abio: ['공기', 400, 96], dir: 'b2a', ok: '소가 내뿜은 메테인이 공기 중 온실 기체를 늘린다 → 생물이 환경을 바꿨다.', no: '이 사례에서 바뀐 것은 무엇일까? 공기 속에 무엇이 늘어나는지 보자.' },
    { c: 'peng', tag: '(나)', title: '펭귄', bio: ['펭귄', 380, 270], abio: ['온도', 100, 96], dir: 'a2b', ok: '추운 온도에 맞춰 펭귄은 피하 지방층이 두껍게 발달했다 → 환경이 생물에 영향을 줬다.', no: '펭귄이 추위를 바꾼 걸까, 추위가 펭귄의 몸을 바꾼 걸까?' },
    { c: 'drone', tag: '(다)', title: '드론과 밭', bio: ['사람', 110, 110], abio: ['토양', 330, 280], dir: 'b2a', ok: '사람이 드론으로 비료를 뿌려 토양이 기름져졌다 → 생물이 환경을 바꿨다.', no: '땅이 사람을 바꾼 걸까, 사람이 땅을 바꾼 걸까?' },
    { c: 'plant', tag: '(라)', title: '식물', bio: ['식물', 390, 280], abio: ['공기', 110, 100], dir: 'b2a', ok: '식물이 광합성으로 내놓은 산소가 공기 중 산소를 늘린다 → 생물이 환경을 바꿨다.', no: '광합성을 하면 공기 속 무엇이 늘어날까?' },
  ];

  function scene(c, g) {
    if (c === 'cow') {
      el('rect', { class: 'ar-air', x: 0, y: 0, width: CW, height: 222 }, g);
      el('rect', { class: 'ar-field', x: 0, y: 220, width: CW, height: CH - 220 }, g);
      const cow = el('g', { transform: 'translate(250 300)' }, g);
      [-50, -30, 30, 48].forEach((x) => el('path', { class: 'ar-ln', d: `M${x} -30 L${x} 10` }, cow));
      el('rect', { class: 'ec-o', fill: '#fbfcf9', x: -70, y: -76, width: 140, height: 56, rx: 22 }, cow);
      [[-40, -60, 16], [10, -44, 12], [40, -64, 10]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r, fill: '#3a3f4b' }, cow));
      el('path', { class: 'ec-o', fill: '#fbfcf9', d: 'M62 -70 L104 -78 Q118 -60 104 -42 L66 -40 Z' }, cow);
      el('ellipse', { class: 'ec-o', fill: '#f2b8b8', cx: 108, cy: -56, rx: 10, ry: 12 }, cow);
      el('path', { class: 'ar-ln', d: 'M70 -76 l-6 -14 M84 -78 l4 -14' }, cow);
      const bub = el('g', { class: 'ar-fx' }, g);
      const gauge = el('rect', { class: 'ar-gas', x: 20, y: 30, width: 0, height: 18, rx: 9 }, g);
      el('text', { class: 'ar-small', x: 20, y: 24 }, g).textContent = '공기 속 온실 기체';
      el('rect', { class: 'ar-gbox', x: 20, y: 30, width: 180, height: 18, rx: 9 }, g);
      return { bub, gauge, kind: 'gas' };
    }
    if (c === 'peng') {
      el('rect', { class: 'ar-cold', x: 0, y: 0, width: CW, height: CH }, g);
      el('path', { class: 'ar-ice', d: `M0 300 L${CW} 290 L${CW} ${CH} L0 ${CH} Z` }, g);
      const wind = el('g', { class: 'ar-fx ar-wind' }, g);
      [0, 1, 2].forEach((i) => el('path', { d: `M${40 + i * 30} ${150 + i * 30} q40 -14 80 0 t80 0` }, wind));
      const p = el('g', { transform: 'translate(300 296)' }, g);
      el('ellipse', { class: 'ec-o', fill: '#2b3242', cx: 0, cy: -70, rx: 42, ry: 70 }, p);
      el('ellipse', { fill: '#fbfcf9', cx: 6, cy: -62, rx: 28, ry: 54 }, p);
      el('circle', { class: 'ec-o', fill: '#2b3242', cx: 4, cy: -140, r: 26 }, p);
      el('path', { fill: '#f2a23a', d: 'M26 -142 L46 -136 L26 -130 Z' }, p);
      el('circle', { cx: 14, cy: -146, r: 3.5, fill: '#fff' }, p);
      el('path', { fill: '#f2a23a', d: 'M-20 0 l-12 6 h22 Z M14 0 l-6 6 h22 Z' }, p);
      const cut = el('g', { class: 'ar-fx', transform: 'translate(-110 -90)' }, p);
      
      el('rect', { x: -44, y: -44, width: 88, height: 18, fill: '#f6e3d3' }, cut);
      el('rect', { class: 'ar-fat', x: -44, y: -26, width: 88, height: 34 }, cut);
      el('rect', { x: -44, y: 8, width: 88, height: 36, fill: '#c9505a' }, cut);
      el('rect', { class: 'ar-lensc', x: -44, y: -44, width: 88, height: 88 }, cut); el('text', { class: 'ar-small', x: -44, y: 64 }, cut).textContent = '피하 지방층';
      el('line', { class: 'ar-ln', x1: 36, y1: -10, x2: 76, y2: 20 }, cut);
      return { cut, wind, kind: 'peng' };
    }
    if (c === 'drone') {
      el('rect', { class: 'ar-sky2', x: 0, y: 0, width: CW, height: 230 }, g);
      const soil = el('rect', { class: 'ar-soil', x: 0, y: 230, width: CW, height: CH - 230 }, g);
      const crops = el('g', {}, g);
      const sprouts = [60, 130, 200, 270, 340, 410, 470].map((x) => { const s = el('path', { class: 'ar-crop', d: `M${x} 232 q-10 -14 -16 -24 M${x} 232 q10 -14 16 -24 M${x} 232 l0 -26` }, crops); return s; });
      const dr = el('g', { class: 'ar-drone' }, g);
      el('rect', { class: 'ec-o', fill: '#4b566a', x: -24, y: -8, width: 48, height: 16, rx: 6 }, dr);
      [-34, 34].forEach((x) => { el('line', { class: 'ar-ln', x1: x * 0.7, y1: 0, x2: x, y2: -10 }, dr); el('ellipse', { class: 'ar-rotor', cx: x, cy: -12, rx: 18, ry: 4 }, dr); });
      const dust = el('g', { class: 'ar-fx' }, g);
      return { soil, sprouts, dr, dust, kind: 'drone' };
    }
    el('rect', { class: 'ar-sky2', x: 0, y: 0, width: CW, height: CH }, g);
    el('rect', { class: 'ar-field', x: 0, y: 330, width: CW, height: CH - 330 }, g);
    window.Eco.draw.tree(g, 280, 336, 1.4, { color: '#4f9a52' });
    const bub = el('g', { class: 'ar-fx' }, g);
    const gauge = el('rect', { class: 'ar-o2', x: 300, y: 30, width: 0, height: 18, rx: 9 }, g);
    el('text', { class: 'ar-small', x: 300, y: 24 }, g).textContent = '공기 속 산소';
    el('rect', { class: 'ar-gbox', x: 300, y: 30, width: 180, height: 18, rx: 9 }, g);
    return { bub, gauge, kind: 'o2' };
  }

  function mount(root) {
    const svg = root.querySelector('.ar-svg');
    el('rect', { class: 'ar-bg', x: -400, y: -300, width: 1856, height: 1400 }, svg);
    const defs = el('defs', {}, svg);
    [['ok', '#2f9e5b'], ['no', '#d9483b'], ['tmp', '#1d2433']].forEach(([k, col]) => { const m = el('marker', { id: 'ar-h-' + k, viewBox: '0 0 10 10', refX: 7, refY: 5, markerWidth: 4, markerHeight: 4, orient: 'auto' }, defs); el('path', { d: 'M0 0 L10 5 L0 10 z', fill: col }, m); });
    const lists = { a2b: root.querySelector('.ar-list[data-k="a2b"]'), b2a: root.querySelector('.ar-list[data-k="b2a"]') };
    const msg = root.querySelector('.ar-msg'), now = root.querySelector('.ar-now');
    const cards = CASES.map((C, i) => {
      const ox = 10 + (i % 2) * (CW + 14), oy = 10 + Math.floor(i / 2) * (CH + 14);
      const card = el('g', { class: 'ar-card', 'data-c': C.c, transform: `translate(${ox} ${oy})` }, svg);
      const cp = el('clipPath', { id: 'ar-cp-' + C.c }, defs); el('rect', { width: CW, height: CH, rx: 14 }, cp);
      const sg = el('g', { 'clip-path': `url(#ar-cp-${C.c})` }, card);
      const fx = scene(C.c, sg);
      el('rect', { class: 'ar-frame', width: CW, height: CH, rx: 14 }, card);
      const hd = el('g', {}, card);
      el('rect', { class: 'ar-hd', x: 12, y: CH - 50, width: 150, height: 38, rx: 19 }, hd);
      el('text', { class: 'ar-hdt', x: 87, y: CH - 24 }, hd).textContent = `${C.tag} ${C.title}`;
      const line = el('line', { class: 'ar-line' }, card);
      const stampT = el('text', { class: 'ar-stamp', x: CW - 16, y: CH - 22 }, card);
      const node = (k, [name, x, y]) => {
        const n = el('g', { class: `ar-node ${k}`, 'data-k': k, transform: `translate(${x} ${y})`, tabindex: '0', role: 'button', 'aria-label': `${C.tag} ${name}: 여기서 시작해 다른 동그라미까지 끌어 화살표 그리기` }, card);
        el('circle', { r: 44 }, n); el('text', { y: 9 }, n).textContent = name;
        return { n, x, y };
      };
      const N = { bio: node('bio', C.bio), abio: node('abio', C.abio) };
      return { C, card, fx, line, stampT, N, done: false, t: 0, ox, oy };
    });
    function finish(K, from) {
      const { C } = K;
      const want = C.dir === 'b2a' ? 'bio' : 'abio';
      const a = K.N[from], b = K.N[from === 'bio' ? 'abio' : 'bio'];
      const ok = from === want;
      const dx = b.x - a.x, dy = b.y - a.y, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L;
      K.line.setAttribute('x1', (a.x + ux * 50).toFixed(1)); K.line.setAttribute('y1', (a.y + uy * 50).toFixed(1));
      K.line.setAttribute('x2', (b.x - ux * 52).toFixed(1)); K.line.setAttribute('y2', (b.y - uy * 52).toFixed(1));
      K.line.setAttribute('class', 'ar-line ' + (ok ? 'ok' : 'no')); K.line.setAttribute('marker-end', `url(#ar-h-${ok ? 'ok' : 'no'})`);
      msg.textContent = `${C.tag} ${ok ? C.ok : C.no}`; msg.classList.toggle('bad', !ok);
      if (!ok) { setTimeout(() => { if (K.done) finish(K, want); else K.line.setAttribute('class', 'ar-line'); }, 1100); return; }
      if (K.done) return;
      K.done = true; K.card.classList.add('done');
      K.stampT.textContent = C.dir === 'b2a' ? '생물 → 환경' : '환경 → 생물';
      const li = document.createElement('li'); li.textContent = `${C.tag} ${C.title}`; lists[C.dir].appendChild(li);
      const n = cards.filter((k) => k.done).length;
      now.textContent = n < 4 ? `${n} / 4 · 다른 사례도 화살표를 그려 보자` : '네 사례 모두 끝 · 두 방향이 다 있다';
      now.classList.toggle('done', n === 4);
    }
    cards.forEach((K) => {
      Object.entries(K.N).forEach(([k, nd]) => {
        let on = null;
        nd.n.addEventListener('pointerdown', (e) => {
          if (e.button) return; on = e.pointerId; e.stopPropagation(); e.preventDefault();
          try { nd.n.setPointerCapture(e.pointerId); } catch (err) { /* 합성 */ }
          K.line.setAttribute('class', 'ar-line tmp'); K.line.setAttribute('marker-end', 'url(#ar-h-tmp)');
          K.line.setAttribute('x1', nd.x); K.line.setAttribute('y1', nd.y); K.line.setAttribute('x2', nd.x); K.line.setAttribute('y2', nd.y);
          if (K.done) K.line.setAttribute('class', 'ar-line tmp');
        });
        nd.n.addEventListener('pointermove', (e) => {
          if (on !== e.pointerId) return;
          const p = pt(svg, e); K.line.setAttribute('x2', (p.x - K.ox).toFixed(1)); K.line.setAttribute('y2', (p.y - K.oy).toFixed(1));
        });
        const end = (e) => {
          if (on !== e.pointerId) return; on = null;
          const p = pt(svg, e), other = K.N[k === 'bio' ? 'abio' : 'bio'];
          if (Math.hypot(p.x - K.ox - other.x, p.y - K.oy - other.y) < 70) finish(K, k);
          else { K.line.setAttribute('class', K.done ? 'ar-line ok' : 'ar-line'); if (K.done) finish(K, K.C.dir === 'b2a' ? 'bio' : 'abio'); }
        };
        nd.n.addEventListener('pointerup', end); nd.n.addEventListener('pointercancel', end);
        // 키보드: 시작 동그라미에서 엔터 → 그쪽에서 화살표를 그린다
        nd.n.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); finish(K, k); } });
      });
    });
    function step(dt) {
      cards.forEach((K) => {
        if (!K.done) return; K.t += dt; const f = K.fx, t = K.t;
        if (f.kind === 'gas' || f.kind === 'o2') {
          f.gauge.setAttribute('width', (clamp(t / 6, 0, 1) * 180).toFixed(1));
          while (f.bub.childNodes.length < 7) { const b = el('g', {}, f.bub); el('circle', { r: 20, class: f.kind === 'gas' ? 'ar-ch4' : 'ar-ox' }, b); el('text', { class: 'ar-bt', y: 7 }, b).textContent = f.kind === 'gas' ? 'CH₄' : 'O₂'; b._p = f.bub.childNodes.length / 7; }
          [...f.bub.childNodes].forEach((b, i) => {
            const ph = (t * 0.35 + i / 7) % 1;
            const x = f.kind === 'gas' ? 360 + Math.sin(ph * 6 + i) * 18 - ph * 40 : 230 + (i % 3) * 50 + Math.sin(ph * 5 + i) * 10;
            const y = f.kind === 'gas' ? 236 - ph * 190 : 200 - ph * 160;
            b.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`); b.style.opacity = (Math.sin(ph * Math.PI)).toFixed(2);
          });
        }
        if (f.kind === 'peng') { f.cut.style.opacity = clamp(t * 1.5, 0, 1); f.wind.style.opacity = 1; f.wind.setAttribute('transform', `translate(${((t * 80) % 60).toFixed(1)} 0)`); }
        if (f.kind === 'drone') {
          const x = 40 + ((t * 90) % 440); f.dr.setAttribute('transform', `translate(${x.toFixed(1)} 90)`);
          f.dr.style.opacity = 1;
          if (f.dust.childNodes.length < 12) el('circle', { class: 'ar-dust', r: 3 }, f.dust);
          [...f.dust.childNodes].forEach((d, i) => { const ph = (t * 1.2 + i / 12) % 1; d.setAttribute('cx', (x - 10 + (i % 4) * 7 - ph * 30).toFixed(1)); d.setAttribute('cy', (100 + ph * 130).toFixed(1)); d.style.opacity = (1 - ph).toFixed(2); });
          const k = clamp(t / 5, 0, 1); f.soil.style.fill = `rgb(${Math.round(196 - 110 * k)},${Math.round(154 - 90 * k)},${Math.round(108 - 70 * k)})`;
          f.sprouts.forEach((s) => s.setAttribute('transform', `translate(0 ${(232 * (1 - (1 + k * 1.2))).toFixed(1)}) scale(1 ${(1 + k * 1.2).toFixed(2)})`));
        }
      });
    }
    const L = loop(step);
    root._ar = { draw(c, from) { finish(cards.find((k) => k.C.c === c), from); }, all() { cards.forEach((K) => finish(K, K.C.dir === 'b2a' ? 'bio' : 'abio')); } };
    return { setActive(on) { if (on) L.start(); else L.stop(); } };
  }
  window.ArrowCases = { mount };
})();
