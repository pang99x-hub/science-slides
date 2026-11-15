/* 2-2-2 4차시 「화력 발전과 핵발전」: 장마다 모듈을 붙인다. */
(function () {
  'use strict';
  const { part, reduce, D } = window.Deck;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const press = (btns, on) => btns.forEach((b) => b.setAttribute('aria-pressed', String(b === on)));
  const NS = 'http://www.w3.org/2000/svg';
  const E = { chem: '화학 에너지', nuc: '핵에너지', pot: '위치 에너지', heat: '열에너지', kin: '운동 에너지', elec: '전기 에너지' };
  const chain = (keys) => keys.map((k) => `<span class="ech sm" style="--c: var(--e-${k})">${E[k]}</span>`).join('<i>→</i>');

  // ---------- 1. 표지: 반 예측 → 2024년 실제 발전 비중 ----------
  part('cover', (root) => {
    const btns = [...root.querySelectorAll('.share-opts button')];
    const box = root.querySelector('.share');
    const rows = [...box.querySelectorAll('.srow')];
    const bars = rows.map((r) => r.querySelector('b i'));
    const W = (r) => (Number(r.dataset.v) / 50 * 100) + '%';           // 칸 전체 = 50%. 오른쪽 끝에 «우리 반 예측» 자리를 남긴다
    let pick = null;
    const mark = () => rows.forEach((r) => r.classList.toggle('picked', r.dataset.k === pick));
    btns.forEach((b) => b.addEventListener('click', () => {
      pick = pick === b.dataset.k ? null : b.dataset.k;
      btns.forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.k === pick)));
      mark();
    }));
    function show(on, instant) {
      if (!window.gsap) return;
      if (!on) { gsap.set(box, { autoAlpha: 0 }); gsap.set(bars, { width: 0 }); return; }
      if (instant) { gsap.set(box, { autoAlpha: 1, y: 0 }); rows.forEach((r, i) => gsap.set(bars[i], { width: W(r) })); return; }
      gsap.fromTo(box, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: D(0.35) });
      rows.forEach((r, i) => gsap.fromTo(bars[i], { width: 0 }, { width: W(r), duration: D(0.9), delay: D(0.25 + i * 0.18), ease: 'power3.out' }));
    }
    show(false);
    return {
      fragment(f, on) { if (f === box) show(on); },
      sync() { show(box.classList.contains('visible'), true); },
    };
  });

  // ---------- 2. 발전소의 에너지 흐름: 점의 색 = 그 자리의 에너지 형태 ----------
  const KIN = ['kin', [[550, 250], [630, 282], [708, 282], [780, 282], [845, 282]]];
  const ELEC = ['elec', [[845, 282], [910, 282], [990, 282], [990, 150]]];
  const ROUTES = {
    fire: [['chem', [[115, 560], [205, 578], [236, 572]]], ['heat', [[236, 572], [310, 548], [310, 340], [380, 330], [380, 250], [550, 250]]], KIN, ELEC],
    nuc: [['nuc', [[280, 548], [280, 452]]], ['heat', [[280, 452], [300, 410], [340, 410], [470, 410], [470, 250], [550, 250]]], KIN, ELEC],
    hydro: [['pot', [[130, 330], [240, 412], [335, 470]]], ['kin', [[335, 470], [574, 530], [630, 530], [630, 472], [630, 381]]], ['elec', [[630, 381], [685, 380], [990, 380], [990, 150]]]],
  };
  const INFO = {   // 교과서 108쪽 학습 활동지의 표를 우리말로 다시 씀
    fire: { src: '석유, 석탄, 천연가스 등의 화석 연료', how: '석탄·석유·천연가스를 태운 열로 물을 끓이고, 그 수증기가 터빈을 돌린다.', chain: ['chem', 'heat', 'kin', 'elec'] },
    nuc: { src: '우라늄과 같은 핵연료', how: '우라늄이 핵분열할 때 나오는 열로 물을 끓이고, 그 수증기가 터빈을 돌린다.', chain: ['nuc', 'heat', 'kin', 'elec'] },
    hydro: { src: '높은 곳에 있는 물', how: '댐에 가둬 높은 곳에 있던 물이 아래로 쏟아지며 터빈을 돌린다.', chain: ['pot', 'kin', 'elec'] },
  };
  part('plant', (root) => {
    const svg = root.querySelector('svg.pl'), layer = svg.querySelector('#pl-dots');
    const scenes = { fire: svg.querySelector('#sc-fire'), nuc: svg.querySelector('#sc-nuc'), hydro: svg.querySelector('#sc-hydro') };
    const common = svg.querySelector('#sc-common');
    const btns = [...root.querySelectorAll('[data-sc]')];
    const card = { src: root.querySelector('.pl-src'), how: root.querySelector('.pl-how'), chain: root.querySelector('.pl-chain') };
    const pauseBtn = root.querySelector('#pl-pause');
    const SPEED = 150, GAP = 46;
    let segs = [], total = 0, dots = [], phase = 0, raf = 0, last = 0, active = false, paused = false, sc = 'fire';

    // 회전(터빈·발전기 자석), 불꽃, 연기, 물의 흐름: 장면과 상관없이 늘 같은 반복
    const loops = [];
    if (window.gsap && !reduce) {
      svg.querySelectorAll('.pl-rot').forEach((g) => loops.push(gsap.to(g, { rotation: 360, svgOrigin: g.dataset.o, duration: 1.6, ease: 'none', repeat: -1 })));
      svg.querySelectorAll('.pl-flame path').forEach((p, i) => loops.push(gsap.to(p, { scaleY: 0.72, transformOrigin: '50% 100%', duration: 0.32 + i * 0.05, yoyo: true, repeat: -1, ease: 'sine.inOut' })));
      svg.querySelectorAll('.pl-smoke circle').forEach((c, i) => loops.push(gsap.fromTo(c, { y: 24, autoAlpha: 0.55 }, { y: -26, autoAlpha: 0, duration: 2.4, delay: i * 0.8, repeat: -1, ease: 'none' })));
      svg.querySelectorAll('.pl-water, .pl-river').forEach((p) => loops.push(gsap.to(p, { strokeDashoffset: -48, duration: 1.2, ease: 'none', repeat: -1 })));
      svg.querySelectorAll('.pl-fuel rect').forEach((r, i) => loops.push(gsap.to(r, { opacity: 0.55, duration: 0.5 + i * 0.12, yoyo: true, repeat: -1, ease: 'sine.inOut' })));
      loops.forEach((t) => t.pause());
    }

    function build(route) {
      segs = []; total = 0;
      for (const [e, pts] of route) for (let i = 0; i < pts.length - 1; i++) {
        const [x0, y0] = pts[i], [x1, y1] = pts[i + 1], l = Math.hypot(x1 - x0, y1 - y0);
        segs.push({ e, x0, y0, x1, y1, l, s: total }); total += l;
      }
      layer.textContent = '';
      dots = [];
      const n = Math.round(total / GAP);
      for (let i = 0; i < n; i++) {
        const c = document.createElementNS(NS, 'circle');
        c.setAttribute('r', '9'); layer.appendChild(c);
        dots.push({ c, e: '' });
      }
    }
    function at(d) {
      for (const s of segs) if (d <= s.s + s.l) { const t = (d - s.s) / s.l; return [s.x0 + (s.x1 - s.x0) * t, s.y0 + (s.y1 - s.y0) * t, s.e]; }
      const s = segs[segs.length - 1]; return [s.x1, s.y1, s.e];
    }
    function place() {
      const gap = total / dots.length;
      dots.forEach((d, i) => {
        const dist = (phase + i * gap) % total, [x, y, e] = at(dist);
        d.c.setAttribute('cx', x.toFixed(1)); d.c.setAttribute('cy', y.toFixed(1));
        if (d.e !== e) { d.e = e; d.c.setAttribute('class', 'dot e-' + e); }
        d.c.style.opacity = clamp(Math.min(dist, total - dist) / 40, 0, 1);   // 처음과 끝에서 스며들고 사라진다
      });
    }
    function frame(t) {
      raf = 0;
      if (!active) return;
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0; last = t;
      if (!paused && !reduce) phase = (phase + SPEED * dt) % total;
      place();
      raf = requestAnimationFrame(frame);
    }
    function setScene(k) {
      sc = k;
      press(btns, btns.find((b) => b.dataset.sc === k));
      for (const [key, g] of Object.entries(scenes)) g.toggleAttribute('hidden', key !== k);
      common.toggleAttribute('hidden', k === 'hydro');
      build(ROUTES[k]); phase = 0; place();
      const info = INFO[k];
      card.src.textContent = info.src; card.how.textContent = info.how; card.chain.innerHTML = chain(info.chain);
      if (window.gsap) {
        gsap.fromTo(svg.querySelectorAll('.sc:not([hidden]), #sc-common:not([hidden])'), { autoAlpha: 0 }, { autoAlpha: 1, duration: D(0.35) });
        gsap.fromTo(root.querySelector('.pl-card'), { autoAlpha: 0.2, x: 12 }, { autoAlpha: 1, x: 0, duration: D(0.35) });
      }
    }
    function run() {
      const go = active && !paused;
      loops.forEach((l) => (go ? l.play() : l.pause()));
      if (active && !raf) { last = 0; raf = requestAnimationFrame(frame); }
    }
    btns.forEach((b) => b.addEventListener('click', () => { if (b.dataset.sc !== sc) setScene(b.dataset.sc); }));
    pauseBtn.addEventListener('click', () => {
      paused = !paused;
      pauseBtn.setAttribute('aria-pressed', String(paused));
      pauseBtn.querySelector('span').textContent = paused ? '다시 흐르기' : '멈추기';
      run();
    });
    setScene('fire');
    return {
      setActive(on) {
        active = on; run();
        if (!on && raf) { cancelAnimationFrame(raf); raf = 0; }
      },
    };
  });

  // ---------- 3. 두 흐름 겹치기 + 발전 과정 순서 ----------
  const STEPS = {
    fire: ['화석 연료(석탄·가스)를 태운다.', '물이 끓어 뜨겁고 압력이 높은 수증기가 된다.', '수증기가 터빈을 돌린다.', '터빈에 이어진 발전기가 돌며 전기가 생긴다.'],
    nuc: ['우라늄 원자핵이 핵분열한다.', '물이 끓어 뜨겁고 압력이 높은 수증기가 된다.', '수증기가 터빈을 돌린다.', '터빈에 이어진 발전기가 돌며 전기가 생긴다.'],
  };
  part('merge', (root) => {
    const mg = root.querySelector('.mg');
    const rows = [...root.querySelectorAll('.mg-row')];
    const note = root.querySelector('.mg-note');
    const same = rows.map((r) => [...r.querySelectorAll('.same')]);
    const first = rows.map((r) => r.querySelector('i:not(.same)'));
    function merge(on, instant) {
      if (!window.gsap) return;
      const dy = (rows[1].offsetTop - rows[0].offsetTop) / 2, d = instant ? 0 : 1;
      const o = { duration: D(0.8) * d, ease: 'power3.inOut' };
      mg.classList.toggle('merged', on);
      gsap.to(same[0], { y: on ? dy : 0, ...o });
      gsap.to(same[1], { y: on ? -dy : 0, autoAlpha: on ? 0 : 1, ...o });
      gsap.to(first[0], { y: on ? dy / 2 : 0, rotate: on ? 32 : 0, ...o });
      gsap.to(first[1], { y: on ? -dy / 2 : 0, rotate: on ? -32 : 0, ...o });
      const mk = note.querySelector('.mark');
      if (!on) { gsap.set(note, { autoAlpha: 0 }); gsap.set(mk, { backgroundSize: '0% 100%' }); return; }
      if (instant) { gsap.set(note, { autoAlpha: 1, y: 0 }); gsap.set(mk, { backgroundSize: '100% 100%' }); return; }
      gsap.fromTo(note, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: D(0.45), delay: D(0.6) });
      gsap.fromTo(mk, { backgroundSize: '0% 100%' }, { backgroundSize: '100% 100%', duration: D(0.9), delay: D(0.95), ease: 'power2.inOut' });
    }
    if (window.gsap) gsap.set(note, { autoAlpha: 0 });

    // 순서 놀이: 맞는 카드만 칸에 들어가고, 틀리면 흔들린다
    const kinds = [...root.querySelectorAll('[data-o]')];
    const slots = [...root.querySelectorAll('.slots li')];
    const pool = root.querySelector('.pool'), msg = root.querySelector('.ord-msg');
    const done = new Set();
    let kind = 'nuc', next = 0;
    function deal() {
      next = 0; msg.textContent = '';
      slots.forEach((li) => { li.textContent = ''; li.className = ''; });
      let order;
      do { order = [0, 1, 2, 3].sort(() => Math.random() - 0.5); } while (order.every((v, i) => v === i));
      pool.textContent = '';
      order.forEach((i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'ocard'; b.textContent = STEPS[kind][i]; b.dataset.i = i;
        b.addEventListener('click', () => pick(b));
        pool.appendChild(b);
      });
    }
    function pick(b) {
      if (Number(b.dataset.i) !== next) {
        b.classList.add('nope');
        if (window.gsap) gsap.fromTo(b, { x: -10 }, { x: 0, duration: D(0.5), ease: 'elastic.out(1, 0.3)', onComplete: () => b.classList.remove('nope') });
        else b.classList.remove('nope');
        return;
      }
      const li = slots[next];
      li.textContent = b.textContent; li.className = 'done';
      b.classList.add('used'); b.disabled = true;
      if (window.gsap) gsap.from(li, { autoAlpha: 0, x: 40, duration: D(0.3), ease: 'power2.out' });
      next++;
      if (next === slots.length) {
        done.add(kind);
        const other = kind === 'fire' ? '핵발전' : '화력 발전';
        msg.textContent = done.size === 2 ? '두 번째 카드부터는 화력 발전과 핵발전이 똑같다!' : `완성! ${other}으로 바꿔서 한 번 더.`;
        if (done.size === 2) slots.slice(1).forEach((x) => x.classList.add('same'));
      }
    }
    kinds.forEach((b) => b.addEventListener('click', () => { kind = b.dataset.o; press(kinds, b); deal(); }));
    root.querySelector('#ord-reset').addEventListener('click', deal);
    deal();

    return {
      fragment(f, on) { if (f === note) merge(on); },
      sync() { merge(note.classList.contains('visible'), true); },
    };
  });

  // ---------- 4. 장단점 카드 ----------
  part('proscons', (root) => {
    const cards = [...root.querySelectorAll('.card')];
    cards.forEach((c) => c.addEventListener('click', () => c.classList.toggle('flipped')));
    root.querySelector('#pc-all').addEventListener('click', () => {
      const any = cards.some((c) => !c.classList.contains('flipped'));
      cards.forEach((c) => c.classList.toggle('flipped', any));
    });
  });

  // ---------- 5. 전력 수요 급증(예시 수치) ----------
  part('demand', (root) => {
    const cv = root.querySelector('canvas[data-chart="demand"]');
    const out = root.querySelector('.d-result'), why = root.querySelector('.d-why');
    const H = 4, N = 200;                                          // 15시부터 4시간
    const dem = (t) => 62 + 30 * (1 - Math.cos(Math.PI * t / H)) / 2;
    const NUC0 = 40, FIRE0 = 22, RAMP = { fire: 20, nuc: 2 };     // 한 시간에 올릴 수 있는 양(예시)
    let tNow = 0, sim = null, tw = null, dpr = 1, C = null, hatch = null;
    function simulate(m) {
      const nuc = new Float32Array(N + 1), fire = new Float32Array(N + 1), dt = H / N;
      nuc[0] = NUC0; fire[0] = FIRE0;
      for (let i = 1; i <= N; i++) {
        const need = dem(i * dt);
        nuc[i] = nuc[i - 1]; fire[i] = fire[i - 1];
        if (m === 'fire') fire[i] = Math.min(need - nuc[i], fire[i - 1] + RAMP.fire * dt);
        if (m === 'nuc') nuc[i] = Math.min(need - fire[i], nuc[i - 1] + RAMP.nuc * dt);
      }
      return { nuc, fire };
    }
    const hexA = (hex, a) => { const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; };
    function readColors() {
      const s = getComputedStyle(document.documentElement), g = (k) => s.getPropertyValue('--' + k).trim();
      C = { ink: g('ink'), ink2: g('ink-2'), ink3: g('ink-3'), rule: g('rule'), paper: g('paper-2'), nuc: g('e-nuc'), fire: g('e-heat'), font: g('f-body'), pen: g('f-pen') };
      const p = document.createElement('canvas'); p.width = p.height = 14;
      const pc = p.getContext('2d'); pc.strokeStyle = hexA(C.ink, 0.7); pc.lineWidth = 2.5;
      pc.beginPath(); pc.moveTo(-2, 16); pc.lineTo(16, -2); pc.moveTo(-2, 2); pc.lineTo(2, -2); pc.moveTo(12, 16); pc.lineTo(16, 12); pc.stroke();
      hatch = p;
    }
    function draw() {
      if (!C) readColors();
      const c = cv.getContext('2d'), w = cv.offsetWidth, h = cv.offsetHeight;
      if (!w || !h) return;
      c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, w, h);
      const L = 40, R = 150, T = 24, B = 52;
      const X = (t) => L + (w - L - R) * t / H, Y = (v) => T + (h - T - B) * (1 - v / 100);
      c.strokeStyle = C.rule; c.lineWidth = 1;
      for (const v of [25, 50, 75, 100]) { c.beginPath(); c.moveTo(L, Math.round(Y(v)) + 0.5); c.lineTo(w - R, Math.round(Y(v)) + 0.5); c.stroke(); }
      c.strokeStyle = C.ink3; c.lineWidth = 1.5; c.beginPath(); c.moveTo(L, Y(0)); c.lineTo(w - R, Y(0)); c.stroke();
      c.font = `500 22px ${C.font}`; c.fillStyle = C.ink2; c.textAlign = 'center'; c.textBaseline = 'top';
      for (let k = 0; k <= H; k++) c.fillText((15 + k) + '시', X(k), Y(0) + 12);
      const s = sim || simulate(null), n = Math.round(tNow / H * N), dt = H / N;
      const band = (lo, hi, fill) => {
        if (n < 1) return;
        c.beginPath();
        for (let i = 0; i <= n; i++) c.lineTo(X(i * dt), Y(hi(i)));
        for (let i = n; i >= 0; i--) c.lineTo(X(i * dt), Y(lo(i)));
        c.closePath(); c.fillStyle = fill; c.fill();
      };
      band(() => 0, (i) => s.nuc[i], hexA(C.nuc, 0.5));
      band((i) => s.nuc[i], (i) => s.nuc[i] + s.fire[i], hexA(C.fire, 0.45));
      // 공급 위 경계선(띠 사이 2px 틈 대신 종이색 선)
      if (n >= 1) {
        c.strokeStyle = C.paper; c.lineWidth = 2; c.beginPath();
        for (let i = 0; i <= n; i++) c.lineTo(X(i * dt), Y(s.nuc[i])); c.stroke();
      }
      // 모자란 전기: 수요가 공급보다 큰 곳
      let short = 0;
      if (n >= 1) {
        c.beginPath();
        for (let i = 0; i <= n; i++) c.lineTo(X(i * dt), Y(dem(i * dt)));
        for (let i = n; i >= 0; i--) c.lineTo(X(i * dt), Y(Math.min(dem(i * dt), s.nuc[i] + s.fire[i])));
        c.closePath(); c.fillStyle = c.createPattern(hatch, 'repeat'); c.fill();
        short = dem(n * dt) - (s.nuc[n] + s.fire[n]);
      }
      // 수요(앞으로 올 시간은 점선)
      c.strokeStyle = C.ink; c.lineWidth = 3.5; c.lineJoin = 'round';
      c.beginPath(); for (let i = 0; i <= n; i++) c.lineTo(X(i * dt), Y(dem(i * dt))); c.stroke();
      c.setLineDash([8, 8]); c.lineWidth = 2.5; c.beginPath();
      for (let i = n; i <= N; i++) c.lineTo(X(i * dt), Y(dem(i * dt))); c.stroke(); c.setLineDash([]);
      // 지금 표시
      c.strokeStyle = C.ink3; c.lineWidth = 1.5; c.setLineDash([4, 6]);
      c.beginPath(); c.moveTo(X(tNow), T); c.lineTo(X(tNow), Y(0)); c.stroke(); c.setLineDash([]);
      // 직접 이름표
      c.textAlign = 'left'; c.textBaseline = 'middle'; c.font = `700 22px ${C.font}`; c.fillStyle = C.ink;
      c.fillText('전력 수요', X(H) + 12, Y(dem(H)));
      if (n >= 1) {
        c.font = `600 21px ${C.font}`; c.fillStyle = C.ink2;
        c.fillText('핵발전', X(tNow) + 12, Y(s.nuc[n] / 2));
        c.fillText('화력 발전', X(tNow) + 12, Y(s.nuc[n] + s.fire[n] / 2));
        if (short > 3) {
          c.font = `700 22px ${C.font}`; c.fillStyle = C.ink;
          c.fillText('모자란 전기', X(tNow) + 12, Y(dem(n * dt) - short / 2));
        }
      }
    }
    function fit() {
      const rs = (window.Reveal && Reveal.getScale) ? Reveal.getScale() : 1;
      dpr = clamp((window.devicePixelRatio || 1) * rs, 1, 3);
      cv.width = Math.round(cv.offsetWidth * dpr); cv.height = Math.round(cv.offsetHeight * dpr);
      draw();
    }
    function play(m) {
      sim = simulate(m); out.textContent = ''; why.hidden = true;
      if (tw) tw.kill();
      const o = { t: 0 };
      const end = () => {
        out.textContent = m === 'fire'
          ? '공급이 수요를 바로 따라갔다. 전기가 모자라지 않는다.'
          : '공급이 수요를 따라가지 못했다. 저녁 7시에 전기가 모자란다(빗금).';
        why.hidden = false;
        if (window.gsap) gsap.from(why, { autoAlpha: 0, y: 12, duration: D(0.4) });
      };
      if (!window.gsap || reduce) { tNow = H; draw(); end(); return; }
      tw = gsap.to(o, { t: H, duration: 4.5, ease: 'none', onUpdate: () => { tNow = o.t; draw(); }, onComplete: end });
    }
    root.querySelector('#d-fire').addEventListener('click', () => play('fire'));
    root.querySelector('#d-nuc').addEventListener('click', () => play('nuc'));
    root.querySelector('#d-reset').addEventListener('click', () => {
      if (tw) tw.kill();
      sim = null; tNow = 0; out.textContent = ''; why.hidden = true; draw();
    });
    return { fit, setActive(on) { if (on) fit(); else if (tw) tw.progress(1); } };
  });

  // ---------- 6. 몇 명이 쓸 수 있는 양일까 ----------
  part('impact', (root) => {
    const inp = root.querySelector('#calc-mwh');
    const cell = (k) => root.querySelector(`[data-s="${k}"]`);
    const ans = root.querySelector('.calc-ans'), people = root.querySelector('.people');
    const fmt = (v) => Math.round(v).toLocaleString('ko-KR');
    const about = (v) => {
      if (v >= 1e4) { const m = v / 1e4; return '약 ' + (m >= 100 ? Math.round(m).toLocaleString('ko-KR') : m.toFixed(1).replace(/\.0$/, '')) + '만 명'; }
      return '약 ' + fmt(v) + '명';
    };
    const PERSON = '<svg viewBox="0 0 24 36" aria-hidden="true"><circle cx="12" cy="6" r="5.5"/><path d="M3 34V20a9 9 0 0 1 18 0v14z"/></svg>';
    inp.addEventListener('keydown', (e) => { e.stopPropagation(); if (e.key === 'Enter') calc(); });
    function calc() {
      const mwh = Number(inp.value);
      people.textContent = '';
      if (!Number.isFinite(mwh) || mwh <= 0) {
        ['kwh', 'day', 'ppl'].forEach((k) => (cell(k).textContent = '–'));
        ans.textContent = '발전량(MWh)을 숫자로 넣어 보자.'; return;
      }
      const v = { kwh: mwh * 1000, day: mwh * 1000 / 365, ppl: mwh * 1000 / 365 / 5 };
      const unit = { kwh: ' kWh', day: ' kWh', ppl: '명' };
      ans.textContent = '';
      const fin = () => {
        ans.textContent = about(v.ppl);
        const k = Math.min(50, Math.max(1, Math.round(v.ppl / 1e5)));
        people.innerHTML = PERSON.repeat(k) + (v.ppl / 1e5 > 50.5 ? '<span class="more">…</span>' : '');
        if (window.gsap) gsap.from(people.children, { autoAlpha: 0, y: 14, stagger: D(0.03), duration: D(0.25) });
      };
      if (!window.gsap || reduce) { ['kwh', 'day', 'ppl'].forEach((k) => (cell(k).textContent = fmt(v[k]) + unit[k])); fin(); return; }
      const tl = gsap.timeline({ onComplete: fin });
      ['kwh', 'day', 'ppl'].forEach((k, i) => {
        const o = { x: 0 };
        cell(k).textContent = '';
        tl.to(o, { x: v[k], duration: 0.6, ease: 'power2.out', onUpdate: () => (cell(k).textContent = fmt(o.x) + unit[k]) }, i * 0.55);
      });
    }
    root.querySelector('#calc-go').addEventListener('click', calc);
  });

  // ---------- 7. 확인 ----------
  part('check4', (root) => { window.LessonParts.mountWrap(root); });
})();

/* 2026-10-31 보완(승인 틀): 이론(사진) · 기존 조작 장의 해 볼 일 ①②③ · 미니 게임 · 뒤집기 카드. 기존 장 모듈은 그대로 둔다. */
(function () {
  'use strict';
  const { part } = window.Deck, Gx = window.Gx;
  part('fuel', (root) => {
    const rows = [...root.querySelectorAll('.lv-row')];
    root.querySelector('.gv').addEventListener('gv-pick', (e) => rows.forEach((x) => x.classList.toggle('on', x.dataset.k === e.detail.b.dataset.row)));
    return window.RxT.gallery(root);
  });
  part('merge', (root) => {
    const msg = root.querySelector('.ord-msg');
    return Gx.track(root, [
      () => /완성|똑같다/.test(msg.textContent),
      () => /똑같다/.test(msg.textContent),
      (r) => r.querySelector('.mg-note').classList.contains('visible'),
    ]);
  });
  part('demand', (root) => {
    const out = root.querySelector('.d-result');
    let fire = false, nuc = false;
    return Gx.track(root, [
      () => (fire = fire || /바로 따라갔다/.test(out.textContent)),
      () => (nuc = nuc || /모자란다/.test(out.textContent)),
      () => fire && nuc,
    ]);
  });
  part('impact', (root) => {
    const inp = root.querySelector('#calc-mwh'), ppl = root.querySelector('[data-s="ppl"]');
    let first = null, other = false, aspect = false;
    root.querySelector('#calc-go').addEventListener('click', () => setTimeout(() => {
      if (first == null) first = inp.value; else if (inp.value !== first) other = true;
    }, 50));
    root.querySelectorAll('.aspects span').forEach((sp) => {
      const pick = () => { root.querySelectorAll('.aspects span').forEach((x) => x.classList.toggle('on', x === sp)); aspect = true; };
      sp.addEventListener('click', pick);
      sp.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); pick(); } });
    });
    return Gx.track(root, [() => ppl.textContent.trim() !== '–' && ppl.textContent.trim() !== '', () => other, () => aspect]);
  });
  part('game4', (root) => window.EcoGame.mount(root, {
    id: 'plant', title: '40초 발전소 가르기', seconds: 40,
    intro: '화력 발전? 핵발전? 둘 다?<br>«게임 시작»을 누르자',
    endSay: '틀린 카드는 «열을 얻는 과정인가, 그다음 과정인가?»로 다시 따져 보자',
    items: [
      { q: '석탄·석유·천연가스를 태운다', a: 'a', why: '화석 연료를 태워 열을 얻는 것은 화력 발전.' },
      { q: '우라늄이 핵분열한다', a: 'b', why: '핵연료의 핵분열로 열을 얻는 것은 핵발전.' },
      { q: '끓인 물의 수증기로 터빈을 돌린다', a: 'c', why: '열을 얻은 다음 과정은 둘 다 같다.' },
      { q: '발전기 속 자석이 돌아 전기를 만든다', a: 'c', why: '둘 다 같은 발전기로 전자기 유도를 쓴다.' },
      { q: '이산화 탄소가 많이 나온다', a: 'a', why: '연료를 태우기 때문 — 화력 발전.' },
      { q: '방사성 폐기물을 오래 보관해야 한다', a: 'b', why: '다 쓴 핵연료에서 방사선이 나온다 — 핵발전.' },
      { q: '미세 먼지 같은 대기 오염 물질이 나온다', a: 'a', why: '태울 때 생긴다 — 화력 발전.' },
      { q: '전기가 갑자기 더 필요할 때 빨리 출력을 올린다', a: 'a', why: '화력은 출력 조절이 쉽다.' },
      { q: '아주 적은 연료로 아주 많은 전기를 만든다', a: 'b', why: '작은 우라늄 알갱이가 많은 열을 낸다 — 핵발전.' },
      { q: '화학 에너지에서 출발한다', a: 'a', why: '연료 속 화학 에너지 → 열 — 화력 발전.' },
      { q: '핵에너지에서 출발한다', a: 'b', why: '핵에너지 → 열 — 핵발전.' },
      { q: '열 → 운동 → 전기 에너지로 바뀐다', a: 'c', why: '열을 얻은 뒤의 전환은 둘 다 같다.' },
      { q: '연료가 언젠가 바닥난다', a: 'c', why: '화석 연료도, 우라늄도 묻힌 양에 한계가 있다.' },
      { q: '사고가 나면 방사선 피해가 클 수 있다', a: 'b', why: '방사성 물질이 새어 나올 수 있다 — 핵발전.' },
    ],
  }));
  part('sum4', (root) => window.RxT.sum(root));
})();
