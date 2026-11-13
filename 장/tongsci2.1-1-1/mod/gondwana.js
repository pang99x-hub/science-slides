/* 2차시 «대륙 맞추기»(교과서 16쪽 그림 I-6과 함께): 지금은 멀리 떨어진 남쪽 대륙 조각(남아메리카·남극·인도·오스트레일리아)을
   끌어 옮기고 돌려 아프리카에 맞춘다. 조각에는 같은 화석이 나오는 띠(메소사우루스·글로소프테리스·리스트로사우루스)가 그려져 있어
   제자리에 가까워지면 딸깍 붙고, 띠가 이어지면 빛난다. 모양·자리는 대략(이해를 돕기 위한 예).
   돌리기: 조각 위 둥근 손잡이를 끌거나, 조각 위에서 바퀴, 키보드 Q·E(←→↑↓는 옮기기). */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const PIECES = {
    af: { name: '아프리카', fixed: true, pts: [[430, 90], [520, 70], [610, 80], [660, 120], [700, 170], [690, 210], [650, 250], [640, 310], [610, 370], [575, 420], [540, 432], [515, 392], [498, 335], [478, 285], [455, 252], [430, 245], [395, 210], [385, 170], [400, 125]] },
    sa: { name: '남아메리카', start: [-230, 70, -28], pts: [[290, 190], [340, 185], [395, 210], [430, 245], [455, 252], [478, 285], [498, 335], [515, 392], [470, 470], [432, 540], [408, 548], [396, 500], [360, 420], [322, 340], [292, 266]] },
    in: { name: '인도', start: [262, -214, 38], pts: [[690, 214], [748, 222], [790, 262], [782, 320], [750, 372], [716, 392], [688, 372], [660, 334], [652, 300], [650, 252]] },
    an: { name: '남극', start: [-90, 150, 24], pts: [[470, 560], [520, 470], [575, 440], [612, 412], [660, 396], [716, 400], [770, 394], [830, 410], [880, 450], [880, 510], [820, 570], [720, 600], [600, 610], [510, 600]] },
    au: { name: '오스트레일리아', start: [146, 268, -42], pts: [[830, 330], [880, 300], [940, 312], [980, 360], [972, 420], [930, 452], [888, 446], [856, 420], [836, 380]] },
  };
  const BANDS = [
    { k: 'glo', name: '글로소프테리스', on: ['sa', 'af', 'in', 'an', 'au'], shape: '<polygon points="300,380 460,300 600,330 700,250 820,230 1000,300 1000,470 860,600 560,640 380,580"/>' },
    { k: 'lys', name: '리스트로사우루스', on: ['af', 'in', 'an'], shape: '<polygon points="560,300 680,230 790,250 800,330 760,430 640,470 560,420"/>' },
    { k: 'mes', name: '메소사우루스', on: ['sa', 'af'], shape: '<ellipse cx="497" cy="342" rx="84" ry="34" transform="rotate(-19 497 342)"/>' },
  ];
  const cen = (pts) => pts.reduce((a, p) => [a[0] + p[0] / pts.length, a[1] + p[1] / pts.length], [0, 0]);

  function mount(root) {
    const svg = root.querySelector('.pz-svg'), now = root.querySelector('.pz-now'), msg = root.querySelector('.pz-msg');
    const defs = el('defs', {}, svg);
    defs.innerHTML = `<pattern id="pz-p-glo" width="22" height="22" patternUnits="userSpaceOnUse"><rect width="22" height="22" fill="#5fa04a" fill-opacity=".38"/><path d="M5 16 Q 11 2 17 16 Q 11 12 5 16 Z" fill="#2f6e2a"/></pattern>
      <pattern id="pz-p-lys" width="16" height="16" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="16" height="16" fill="#e39a3a" fill-opacity=".42"/><path d="M0 0 V16" stroke="#a8601a" stroke-width="4"/></pattern>
      <pattern id="pz-p-mes" width="26" height="14" patternUnits="userSpaceOnUse"><rect width="26" height="14" fill="#3a86c8" fill-opacity=".5"/><path d="M0 7 q 6.5 -6 13 0 t 13 0" fill="none" stroke="#1f4f86" stroke-width="2.5"/></pattern>`;
    el('rect', { class: 'pz-sea', x: -120, y: -60, width: 1280, height: 840 }, svg);
    const ghost = el('g', { class: 'pz-ghost' }, svg);
    const st = {};
    Object.entries(PIECES).forEach(([k, P]) => {
      const pts = P.pts.map((p) => p.join(',')).join(' '), c = cen(P.pts);
      el('clipPath', { id: 'pz-c-' + k }, defs).innerHTML = `<polygon points="${pts}"/>`;
      if (!P.fixed) el('polygon', { points: pts }, ghost);
      const g = el('g', { class: 'pz-piece' + (P.fixed ? ' fixed' : ''), 'data-k': k, tabindex: P.fixed ? '-1' : '0', role: 'button', 'aria-label': `${P.name} 조각(끌어 옮기기, Q·E로 돌리기)` }, svg);
      el('polygon', { class: 'pz-land', points: pts }, g);
      const bg = el('g', { 'clip-path': `url(#pz-c-${k})` }, g);
      BANDS.forEach((B) => { if (B.on.includes(k)) { const b = el('g', { class: 'pz-band', 'data-b': B.k, fill: `url(#pz-p-${B.k})` }, bg); b.innerHTML = B.shape; } });
      el('polygon', { class: 'pz-edge', points: pts }, g);
      const t = el('text', { class: 'pz-name', x: c[0], y: c[1] + 8 }, g); t.textContent = P.name;
      let knob = null;
      if (!P.fixed) {
        knob = el('g', { class: 'pz-knob', transform: `translate(${c[0]} ${c[1] - 52})` }, g);
        el('circle', { r: 20 }, knob); el('path', { d: 'M-9 4 A 10 10 0 1 1 6 8 M6 8 l 1 -9 M6 8 l -8 -2' }, knob);
      }
      st[k] = { g, c, knob, tx: 0, ty: 0, a: 0, placed: !!P.fixed };
      if (!P.fixed) [st[k].tx, st[k].ty, st[k].a] = P.start;
    });
    const apply = (k) => { const s = st[k]; s.g.setAttribute('transform', `translate(${s.tx.toFixed(1)} ${s.ty.toFixed(1)}) rotate(${s.a.toFixed(1)} ${s.c[0]} ${s.c[1]})`); };
    const legend = [...root.querySelectorAll('.pz-fos')];
    function status() {
      const n = Object.values(st).filter((s) => s.placed).length - 1;
      BANDS.forEach((B) => {
        const ok = B.on.every((k) => st[k].placed);
        svg.querySelectorAll(`.pz-band[data-b="${B.k}"]`).forEach((b) => b.classList.toggle('joined', ok));
        const L = legend.find((x) => x.dataset.b === B.k); if (L) L.classList.toggle('joined', ok);
      });
      const all = n === 4;
      svg.classList.toggle('solved', all);
      now.textContent = all ? '판게아의 남쪽 부분이 다시 하나로 붙었다' : n ? `${n} / 4 조각을 붙였다 — 화석 띠가 이어지게 맞춰 보자` : '조각을 끌어 아프리카에 붙이자(둥근 손잡이로 돌리기)';
      now.classList.toggle('done', all);
      msg.textContent = all ? '띠가 모두 이어졌다! 바다를 건너지 못하는 생물의 화석이 여러 대륙에 이어진다는 것은 무엇을 뜻할까?'
        : '민물에 살던 메소사우루스는 넓은 바다를 건너지 못했다. 그런데 남아메리카와 아프리카 양쪽에서 나온다. 왜일까?';
    }
    function trySnap(k) {
      const s = st[k], a = ((s.a % 360) + 540) % 360 - 180;
      if (Math.hypot(s.tx, s.ty) < 56 && Math.abs(a) < 20) {
        s.tx = 0; s.ty = 0; s.a = 0; s.placed = true; s.g.classList.add('placed'); s.g.setAttribute('tabindex', '-1');
        if (window.gsap && !Deck.reduce) { apply(k); gsap.fromTo(s.g, { opacity: 0.55 }, { opacity: 1, duration: 0.5 }); }
      }
      apply(k); status();
    }
    const toSvg = (e) => { const q = svg.createSVGPoint(); q.x = e.clientX; q.y = e.clientY; return q.matrixTransform(svg.getScreenCTM().inverse()); };
    Object.entries(st).forEach(([k, s]) => {
      apply(k);
      if (PIECES[k].fixed) return;
      let mode = null, p0 = null, s0 = null;
      s.g.addEventListener('pointerdown', (e) => {
        if (e.button || s.placed) return;
        mode = e.target.closest('.pz-knob') ? 'rot' : 'move'; p0 = toSvg(e); s0 = { tx: s.tx, ty: s.ty, a: s.a };
        if (mode === 'rot') s0.ang = Math.atan2(p0.y - (s.c[1] + s.ty), p0.x - (s.c[0] + s.tx)) * 180 / Math.PI;
        if (svg.lastElementChild !== s.g) svg.appendChild(s.g);
        try { s.g.setPointerCapture(e.pointerId); } catch (err) { /* 합성 */ }
        s.g.classList.add('drag'); e.stopPropagation();
      });
      s.g.addEventListener('pointermove', (e) => {
        if (!mode) return; const p = toSvg(e);
        if (mode === 'move') { s.tx = s0.tx + p.x - p0.x; s.ty = s0.ty + p.y - p0.y; } else { s.a = s0.a + Math.atan2(p.y - (s.c[1] + s.ty), p.x - (s.c[0] + s.tx)) * 180 / Math.PI - s0.ang; }
        apply(k);
      });
      const end = () => { if (!mode) return; mode = null; s.g.classList.remove('drag'); trySnap(k); };
      s.g.addEventListener('pointerup', end); s.g.addEventListener('pointercancel', end);
      s.g.addEventListener('wheel', (e) => { if (s.placed) return; e.preventDefault(); s.a += Math.sign(e.deltaY) * 6; apply(k); clearTimeout(s.wt); s.wt = setTimeout(() => trySnap(k), 300); }, { passive: false });
      s.g.addEventListener('keydown', (e) => {
        if (s.placed) return;
        const mv = { ArrowLeft: [-14, 0], ArrowRight: [14, 0], ArrowUp: [0, -14], ArrowDown: [0, 14] }[e.key], rt = { q: -6, Q: -6, e: 6, E: 6 }[e.key];
        if (!mv && !rt) return; e.preventDefault(); e.stopPropagation();
        if (mv) { s.tx += mv[0]; s.ty += mv[1]; } else s.a += rt;
        trySnap(k); if (!s.placed) s.g.focus();
      });
    });
    status();
    root._pz = {
      solve() { Object.keys(st).forEach((k) => { if (!st[k].placed) { st[k].tx = 4; st[k].ty = 4; st[k].a = 2; trySnap(k); } }); },
      place(k, tx, ty, a) { Object.assign(st[k], { tx, ty, a }); trySnap(k); },
    };
    return {};
  }
  window.Gondwana = { mount };
})();
