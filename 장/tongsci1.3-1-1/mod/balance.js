/* 3-1 2차시 «균형이 깨지면»(교과서 111쪽 해 보기 + 참고서: 지구 온난화·오존층 파괴).
   옛날 사진과 요즘 사진을 겹쳐 두고, 가운데 경계를 끌어 넘기며 비교한다(왼쪽 옛날, 오른쪽 요즘).
   짝 두 가지: 북극해 여름 얼음(1984 ↔ 2012) · 남극 상공 오존(1979 ↔ 2020). 아래 작은 사진을 눌러 짝을 바꾼다.
   손대기 전에는 경계가 천천히 오가며 «끌어 보라»고 알린다. 키보드: 좌우로 경계, 1·2 짝, 0 처음부터.
   Balance.mount(root) → { fit, setActive } · 시험용: root._ba.set(0~1) · pair(0|1) · state() */
(function () {
  'use strict';
  function mount(root) {
    const stage = root.querySelector('.wp-stage'), old = root.querySelector('.wp-old'), cut = root.querySelector('.wp-cut');
    const now = root.querySelector('.wp-now'), out = root.querySelector('.wp-out'), thumbs = [...root.querySelectorAll('.wp-thumbs button')];
    const P = thumbs.map((b) => ({ ...b.dataset }));
    let pi = 0, x = 0.5, held = false, touched = false, active = false, raf = 0, t0 = 0;
    const seen = [{ l: false, r: false }, { l: false, r: false }];
    function show() {
      const q = P[pi];
      root.querySelector('.wp-new').src = q.new; old.src = q.old;
      root.querySelector('.wp-tl').textContent = q.tl; root.querySelector('.wp-tr').textContent = q.tr;
      root.querySelector('.wp-cr').textContent = q.cr; root.querySelector('.wp-key').hidden = q.key !== '1';
      stage.dataset.pair = String(pi);
      thumbs.forEach((b, i) => b.setAttribute('aria-pressed', String(i === pi)));
    }
    function place(v) {
      x = Math.max(0, Math.min(1, v));
      old.style.clipPath = `inset(0 ${((1 - x) * 100).toFixed(2)}% 0 0)`; cut.style.left = `${(x * 100).toFixed(2)}%`;
      cut.setAttribute('aria-valuenow', String(Math.round(x * 100)));
      if (touched) { if (x < 0.12) seen[pi].r = true; if (x > 0.88) seen[pi].l = true; }
      steps();
    }
    function steps() {
      const a = seen[0].l && seen[0].r, b = seen[1].l && seen[1].r, full = (s) => s.l && s.r;
      const ok = []; if (touched) ok.push(1); if (full(seen[pi]) || a || b) ok.push(2); if (a && b) ok.push(3);
      const st = [1, 2, 3].find((q) => !ok.includes(q)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 가운데 경계를 끌어 보자' : st === 2 ? '② 왼쪽 끝·오른쪽 끝까지 밀어 옛날과 요즘을 하나씩 보자' : st === 3 ? '③ 아래 다른 사진 짝도 비교하자' : '두 짝 모두 비교했다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
      const q = P[pi], h = x > 0.88 ? q.sayl : x < 0.12 ? q.sayr : q.saym;
      if (out.innerHTML !== h) out.innerHTML = h;
    }
    const pt = (e) => { const r = stage.getBoundingClientRect(); return (e.clientX - r.left) / r.width; };
    stage.addEventListener('pointerdown', (e) => { held = true; touched = true; try { stage.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ } stage.classList.add('holding'); place(pt(e)); });
    stage.addEventListener('pointermove', (e) => { if (held) place(pt(e)); });
    const up = () => { held = false; stage.classList.remove('holding'); };
    stage.addEventListener('pointerup', up); stage.addEventListener('pointercancel', up);
    cut.addEventListener('keydown', (e) => {
      const d = { ArrowLeft: -0.05, ArrowRight: 0.05, Home: -1, End: 1 }[e.key];
      if (d !== undefined) { touched = true; place(x + d); } else if (e.key === '1' || e.key === '2') pair(+e.key - 1); else if (e.key === '0') reset(); else return;
      e.preventDefault(); e.stopPropagation();
    });
    thumbs.forEach((b, i) => b.addEventListener('click', () => pair(i)));
    function pair(i) { pi = i; show(); place(touched ? 0.5 : x); }
    // 손대기 전에는 경계가 천천히 오간다
    const reduce = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function tick(t) { raf = 0; if (!active || touched || reduce()) return; if (!t0) t0 = t; place(0.5 + 0.18 * Math.sin((t - t0) / 900)); raf = requestAnimationFrame(tick); }
    function reset() { touched = false; seen.forEach((s) => { s.l = false; s.r = false; }); t0 = 0; pi = 0; show(); place(0.5); if (active && !raf) raf = requestAnimationFrame(tick); }
    root.querySelector('.wp-reset')?.addEventListener('click', reset);
    root._ba = { set: (v) => { touched = true; place(v); }, pair, state: () => ({ pair: pi, x, seen: JSON.parse(JSON.stringify(seen)) }) };
    reset();
    console.assert(P.length === 2 && P.every((q) => q.old && q.new), 'balance: 사진 짝 둘');
    return {
      fit() { /* CSS가 크기를 맞춘다 */ },
      setActive(on) { active = on; if (on && !touched && !raf) raf = requestAnimationFrame(tick); else if (!on && raf) { cancelAnimationFrame(raf); raf = 0; } },
    };
  }
  window.Balance = { mount };
})();
