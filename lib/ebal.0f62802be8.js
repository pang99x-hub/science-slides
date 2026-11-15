/* 2차시 미니 게임 «전자 맞추기»(2026-10-31, 체험 «같은 반응, 두 가지 눈»을 게임으로 바꿈 — 배울 것은 그대로:
   산화·환원은 전자를 잃은 쪽과 얻은 쪽이 동시에, 잃은 전자 수 = 얻은 전자 수 · 산소가 없어도 전자의 눈으로는 산화·환원).
   왼쪽 원자의 노란 전자(e⁻)를 끌어 오른쪽 이온·원자에 놓는다. 받는 쪽은 정해진 수를 다 채워야 바뀐다(반만 받은 이온은 없다).
   왼쪽 원자의 전자를 모두 옮겼을 때 반쯤 찬 쪽이 없으면 성공 → 반응식 완성, 점수(기본 100 + 빠르기 + 연속 성공).
   최고 기록은 이 기기에만 저장(localStorage, 막힌 곳이면 저장 없이). 시험용: root._eb.round(i) · auto()
   수업방이 켜져 있으면 빠른 퀴즈(엔진 quiz.js): 선생님이 시작하면 모두 같은 순간에 1판부터. 판마다 첫 시도 성공·실패가 선생님 통계로,
   다섯 판을 다 깨면 끝(제한 시간 없음 — 모두 끝내거나 선생님이 끝낸다). */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const KEY = 'rx121-ebal-best';
  const R = [
    { t: '아연과 구리 이온', d: [['Zn', 'Zn²⁺', 2, '#a9b4c2', 1]], a: [['Cu²⁺', 'Cu', 2, '#7fb0e6', '#c8743a', 3]],
      eq: 'Zn + Cu<sup>2+</sup> → Zn<sup>2+</sup> + Cu', ox: '0>2', red: '1>3', say: '산소가 없는 반응 — <b>전자의 눈</b>으로 보면 아연은 산화, 구리 이온은 환원.' },
    { t: '구리와 은 이온', d: [['Cu', 'Cu²⁺', 2, '#c8743a', 1]], a: [['Ag⁺', 'Ag', 1, '#dfe6ee', '#b9c2cc', 3]],
      eq: 'Cu + 2Ag<sup>+</sup> → Cu<sup>2+</sup> + 2Ag', ox: '0>2', red: '1>3', say: 'Ag<sup>+</sup>는 전자를 하나씩만 받는다 → 구리 1개에 <b>은 이온 2개</b>.' },
    { t: '마그네슘과 산소', d: [['Mg', 'Mg²⁺', 2, '#d7decb', 2]], a: [['O', 'O²⁻', 2, '#e0463c', '#f08a7e', 2, 'O₂']],
      eq: '2Mg + O<sub>2</sub> → 2MgO', ox: '0>2', red: '1>2', say: '산소의 눈: 산소를 <b>얻음</b> = 전자의 눈: 전자를 <b>잃음</b> → 마그네슘의 산화.' },
    { t: '나트륨과 염소', d: [['Na', 'Na⁺', 1, '#c9c3e6', 2]], a: [['Cl', 'Cl⁻', 1, '#9ccf6b', '#c6e7a6', 2, 'Cl₂']],
      eq: '2Na + Cl<sub>2</sub> → 2NaCl', ox: '0>2', red: '1>2', say: '산소가 없어 산소의 눈으로는 설명할 수 없다 → <b>전자의 눈</b>이 더 넓다.' },
    { t: '도전: 알루미늄과 구리 이온', d: [['Al', 'Al³⁺', 3, '#c7cdd6', 2]], a: [['Cu²⁺', 'Cu', 2, '#7fb0e6', '#c8743a', 4]],
      eq: '2Al + 3Cu<sup>2+</sup> → 2Al<sup>3+</sup> + 3Cu', ox: '0>2', red: '1>3', say: '잃은 전자 6개 = 얻은 전자 6개 → Al 2개에 Cu<sup>2+</sup> <b>3개</b>.' },
  ];
  const mk = (tag, at, par) => { const e = document.createElementNS(NS, tag); for (const k in at) e.setAttribute(k, at[k]); if (par) par.appendChild(e); return e; };
  const load = () => { try { return +localStorage.getItem(KEY) || 0; } catch { return 0; } };
  const save = (v) => { try { localStorage.setItem(KEY, String(v)); } catch { /* 저장 못 함 */ } };

  function mount(root) {
    const svg = root.querySelector('.rx-eb-svg'), now = root.querySelector('.rx-eb-now'), q = (s) => root.querySelector(s);
    const msg = q('.rx-eb-msg'), eqp = q('.rx-eb-eq'), eqc = q('.rx-eb-eqc'), sayp = q('.rx-eb-say');
    const L1 = window.L1, Fx = window.RxFx;
    let ri = 0, score = 0, streak = 0, best = load(), cleared = new Set(), t0 = 0, tAcc = 0, active = false, busy = false, raf = 0;
    let donors = [], accs = [], lost = 0, got = 0;
    const quiz = window.Quiz ? window.Quiz.attach(root, {
      id: 'rx121-ebal', title: '전자 맞추기', host: root.querySelector('.sim-col'), durationMs: 0,
      items: R.map((r, i) => ({ id: 'r' + i, label: r.t.replace(/^도전: /, '') })),
      onStart(seed, info) {
        const done = info.resume ? Object.keys(info.resume.a || {}).filter((k) => info.resume.a[k]).map((k) => +k.slice(1)) : [];
        score = (info.resume && info.resume.s) || 0; streak = 0; cleared = new Set(done);
        q('.rx-eb-new').hidden = true; q('.rx-eb-next').hidden = true;
        const first = R.findIndex((_, i) => !cleared.has(i));
        build(first < 0 ? R.length - 1 : first);
      },
      onStop() { q('.rx-eb-new').hidden = false; },
    }) : null;
    const inRoom = () => !!(quiz && quiz.running());

    const pt = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
    const secs = () => (tAcc + (active && t0 ? performance.now() - t0 : 0)) / 1000;
    function board() {
      q('.rx-eb-score').textContent = score; q('.rx-eb-streak').textContent = streak; q('.rx-eb-best').textContent = best;
      q('.rx-eb-lost').textContent = lost; q('.rx-eb-got').textContent = got;
      q('.rx-eb-round').textContent = `${ri + 1} / ${R.length}`;
      root.querySelectorAll('.rx-eb-dots i').forEach((d, i) => { d.classList.toggle('ok', cleared.has(i)); d.classList.toggle('now', i === ri); });
    }
    function tick() { q('.rx-eb-time').textContent = secs().toFixed(1) + '초'; raf = active ? requestAnimationFrame(tick) : 0; }
    function steps() {
      const all = cleared.size === R.length;
      const n = all ? 0 : ri <= 1 ? 1 : ri <= 3 ? 2 : 3;
      const ok = []; if (cleared.has(0) && cleared.has(1)) ok.push(1); if (cleared.has(2) && cleared.has(3)) ok.push(2); if (cleared.has(4)) ok.push(3);
      L1.steps(root, n, ok); L1.done(root, all);
    }

    function build(i) {
      ri = i; busy = false; lost = 0; got = 0; tAcc = 0; t0 = active ? performance.now() : 0;
      const r = R[i];
      svg.textContent = '';
      // 바탕: 잃는 쪽 · 얻는 쪽
      mk('rect', { x: 24, y: 70, width: 470, height: 640, rx: 22, class: 'rx-eb-zone ox' }, svg);
      mk('rect', { x: 562, y: 70, width: 470, height: 640, rx: 22, class: 'rx-eb-zone red' }, svg);
      mk('text', { x: 259, y: 112, class: 'rx-eb-zt ox' }, svg).textContent = '전자를 잃는 쪽 → 산화';
      mk('text', { x: 797, y: 112, class: 'rx-eb-zt red' }, svg).textContent = '전자를 얻는 쪽 → 환원';
      mk('path', { d: 'M500 390 H556', class: 'rx-eb-arr' }, svg); mk('path', { d: 'M548 376 L566 390 L548 404Z', fill: '#4a5468' }, svg);
      donors = []; accs = [];
      const [ds, dIon, de, dc, dn] = r.d[0];
      for (let k = 0; k < dn; k++) {
        const y = dn === 1 ? 410 : 270 + k * 290, x = 250;
        const g = mk('g', { class: 'rx-eb-don' }, svg);
        const c = mk('circle', { cx: x, cy: y, r: 66, fill: dc, class: 'rx-eb-ball' }, g);
        const tx = mk('text', { x, y: y + 14, class: 'rx-eb-sym' }, g); tx.textContent = ds;
        const d = { g, c, tx, x, y, ion: dIon, left: de, beads: [] };
        donors.push(d);
        for (let m = 0; m < de; m++) {
          const a = -Math.PI / 2 + (m - (de - 1) / 2) * 0.62, bx = x + Math.cos(a) * 98, by = y + Math.sin(a) * 98;
          bead(d, bx, by);
        }
      }
      const [as, aProd, need, ac, pc, an, pair] = r.a[0];
      const ys = an === 2 ? [290, 530] : an === 3 ? [200, 410, 620] : [176, 344, 512, 680 - 6];
      if (pair) { mk('line', { x1: 800, y1: ys[0], x2: 800, y2: ys[1], class: 'rx-eb-bond' }, svg); mk('text', { x: 700, y: (ys[0] + ys[1]) / 2 + 10, class: 'rx-eb-mol' }, svg).textContent = pair; }
      for (let k = 0; k < an; k++) {
        const y = ys[k], x = 800, rr = an === 4 ? 46 : 56;
        const g = mk('g', { class: 'rx-eb-acc' }, svg);
        const c = mk('circle', { cx: x, cy: y, r: rr, fill: ac, class: 'rx-eb-ball' }, g);
        const tx = mk('text', { x, y: y + 12, class: 'rx-eb-sym' + (as.length > 2 ? ' sm' : '') }, g); tx.textContent = as;
        const slots = [];
        for (let m = 0; m < need; m++) {
          const sx = x + rr + 34 + m * 46, sy = y;
          slots.push({ x: sx, y: sy, el: mk('circle', { cx: sx, cy: sy, r: 18, class: 'rx-eb-slot' }, g) });
        }
        accs.push({ g, c, tx, x, y, rr, need, has: 0, slots, prod: aProd, pc });
      }
      now.textContent = `${i + 1}판 · ${r.t} — 전자를 끌어 옮기자`; now.classList.remove('done');
      eqc.classList.remove('on'); eqp.innerHTML = ''; eqp.removeAttribute('data-ox'); eqp.removeAttribute('data-red');
      sayp.innerHTML = '전자를 다 옮기면 반응식이 완성된다.';
      msg.textContent = '';
      board(); steps();
    }
    function bead(d, x, y) {
      const g = mk('g', { class: 'rx-eb-e', transform: `translate(${x} ${y})`, tabindex: '0', role: 'button', 'aria-label': '전자' }, svg);
      mk('circle', { r: 20 }, g); mk('text', { y: 7 }, g).textContent = 'e⁻';
      const b = { g, d, x, y, home: [x, y], done: false };
      d.beads.push(b);
      g.addEventListener('pointerdown', (e) => grab(b, e));
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); const a = accs.find((x) => x.has < x.need); if (a) drop(b, a); } });
      return b;
    }
    const place = (b, x, y) => { b.x = x; b.y = y; b.g.setAttribute('transform', `translate(${x} ${y})`); };
    function fly(b, x, y, then) {
      if (window.gsap && !window.Deck?.reduce) { const o = { x: b.x, y: b.y }; window.gsap.to(o, { x, y, duration: 0.28, ease: 'power2.out', onUpdate: () => place(b, o.x, o.y), onComplete: then }); }
      else { place(b, x, y); if (then) then(); }
    }
    function grab(b, e) {
      if (b.done || busy) return;
      e.preventDefault(); e.stopPropagation();
      if (!t0 && active) t0 = performance.now();
      svg.appendChild(b.g); b.g.classList.add('lift');
      const p0 = pt(e), ox = b.x - p0.x, oy = b.y - p0.y;
      try { b.g.setPointerCapture(e.pointerId); } catch { /* 없음 */ }
      const mv = (ev) => { const p = pt(ev); place(b, p.x + ox, p.y + oy); accs.forEach((a) => a.g.classList.toggle('near', Math.hypot(a.x - b.x, a.y - b.y) < a.rr + 70)); };
      const up = () => {
        b.g.removeEventListener('pointermove', mv); b.g.removeEventListener('pointerup', up); b.g.removeEventListener('pointercancel', up);
        b.g.classList.remove('lift'); accs.forEach((a) => a.g.classList.remove('near'));
        const a = accs.map((x) => [x, Math.hypot(x.x - b.x, x.y - b.y)]).filter(([x, dd]) => dd < x.rr + 80).sort((m, n) => m[1] - n[1])[0];
        if (a) drop(b, a[0]); else fly(b, ...b.home);
      };
      b.g.addEventListener('pointermove', mv); b.g.addEventListener('pointerup', up); b.g.addEventListener('pointercancel', up);
    }
    function drop(b, a) {
      if (a.has >= a.need) { Fx.shake(a.g); msg.innerHTML = `이미 꽉 찼다 — ${a.prod}가 되었으니 더 받지 않는다.`; fly(b, ...b.home); return; }
      const s = a.slots[a.has]; a.has++; b.done = true; b.g.classList.add('in');
      const d = b.d; d.left--; lost++; got++;
      fly(b, s.x, s.y, () => { s.el.classList.add('fill'); });
      if (d.left === 0) { d.tx.textContent = d.ion; d.c.classList.add('ion'); Fx.burst && pop(d.g); }
      else d.tx.textContent = d.tx.textContent;
      if (a.has === a.need) { a.tx.textContent = a.prod; a.c.setAttribute('fill', a.pc); pop(a.g); window.RxFx.buzz([25]); }
      msg.textContent = '';
      board(); check();
    }
    function pop(g) { g.classList.remove('rx-eb-pop'); void g.getBBox(); g.classList.add('rx-eb-pop'); }
    function check() {
      if (donors.some((d) => d.left > 0)) return;
      busy = true;
      const half = accs.filter((a) => a.has > 0 && a.has < a.need);
      if (half.length) {
        streak = 0; board();
        if (inRoom()) quiz.answer('r' + ri, false, score);
        half.forEach((a) => Fx.shake(a.g)); if (window.RxT.jolt) window.RxT.jolt(q('.rx-eb-stage'), 1);
        const a = half[0];
        msg.innerHTML = `${a.tx.textContent}는 전자 <b>${a.need}개</b>를 다 받아야 ${a.prod}가 된다. 반만 받은 것은 없다 — 다시!`;
        now.textContent = `${ri + 1}판 · 다시 해 보자`;
        setTimeout(() => { if (R[ri]) build(ri); }, 1900);
        return;
      }
      const sec = secs(); tAcc = sec * 1000; t0 = 0;
      const pts = 100 + Math.max(0, Math.round((25 - sec) * 4)) + streak * 20;
      streak++; score += pts; cleared.add(ri);
      if (score > best) { best = score; save(best); }
      if (inRoom()) { quiz.answer('r' + ri, true, score); if (cleared.size === R.length) { quiz.finish(score); q('.rx-eb-new').hidden = false; } }
      const r = R[ri];
      eqp.innerHTML = r.eq; eqp.dataset.ox = r.ox; eqp.dataset.red = r.red; eqp.dataset.by = 's';
      if (window.RX && window.RX.bx) window.RX.bx(eqp);
      eqc.classList.add('on'); sayp.innerHTML = r.say;
      Fx.burst(q('.rx-eb-scorebox'), 20);
      msg.innerHTML = `<b>성공!</b> +${pts}점 (${sec.toFixed(1)}초${streak > 1 ? ` · ${streak}연속` : ''})`;
      now.textContent = ri < R.length - 1 ? `${ri + 1}판 성공! 다음 판으로` : '다섯 판을 모두 맞췄다!';
      if (cleared.size === R.length) now.classList.add('done');
      board(); steps();
      q('.rx-eb-next').hidden = ri >= R.length - 1;
    }
    q('.rx-eb-next').addEventListener('click', () => { q('.rx-eb-next').hidden = true; build(Math.min(R.length - 1, ri + 1)); });
    q('.rx-eb-again').addEventListener('click', () => { q('.rx-eb-next').hidden = true; build(ri); });
    q('.rx-eb-new').addEventListener('click', () => { score = 0; streak = 0; cleared.clear(); q('.rx-eb-next').hidden = true; build(0); });
    q('.rx-eb-next').hidden = true;
    build(0);
    // 시험용: 이 판을 바르게(또는 일부러 틀리게) 풀기
    root._eb = {
      round: (i) => build(i),
      auto(wrong) {
        const bs = donors.flatMap((d) => d.beads).filter((b) => !b.done);
        if (wrong) { bs.forEach((b, k) => drop(b, accs[k % accs.length])); return; }
        for (const b of bs) { const a = accs.find((x) => x.has > 0 && x.has < x.need) || accs.find((x) => x.has < x.need); if (a) drop(b, a); }
      },
      get score() { return score; },
    };
    return {
      setActive(on) {
        if (on === active) return;
        if (!on && t0) { tAcc += performance.now() - t0; t0 = 0; }
        active = !!on;
        if (on && !busy && lost > 0) t0 = performance.now();
        if (on) tick(); else if (raf) cancelAnimationFrame(raf);
      },
    };
  }
  window.RxEbal = { mount };
})();
