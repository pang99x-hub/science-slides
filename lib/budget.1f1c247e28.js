/* 탐구 · 지구 온난화로 인한 지구 열수지 변동 탐구하기(교과서 84쪽). 열수지 그림은 교과서 그림의 값(태양 복사 = 100)으로 새로 그렸다.
   화살표: S 태양 복사 100(우주 유출) · R 반사 30(우주 유입, 대기·구름 25 + 지표 5) · Aa 대기·구름 흡수 20 · Sa 지표 흡수 50
           Up 지표 → 대기 132 · Us 지표 → 우주 12 · Dn 대기 → 지표 94 · As 대기 → 우주 58
   Budget.audit(root)  4장: 영역 띠를 누른 뒤 그 영역에 들어오고 나가는 화살표를 눌러 장부에 올린다. 다 찾으면 «평형» 도장과 표.
   Budget.valve(root)  5장: 굴뚝의 이산화 탄소 밸브를 돌리면 대기가 지표 방출을 흡수하는 비율 f가 바뀐다(처음 f = 132/144).
     어림 모형(이해를 돕기 위한 예): 지표 Es → Es + r(50 + d·Ea − Es), 대기 Ea → Ea + r(20 + f·Es − Ea), d = 94/152(대기 방출 중 지표로 가는 몫).
     Up = f·Es, Us = (1−f)·Es, Dn = d·Ea, As = (1−d)·Ea. 처음 값에서 정확히 144·152·100으로 평형. 지표 온도 변화 = 288 K × ((Es/144)^¼ − 1). */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const W = 0.36;   // 화살표 굵기(값 1당 px)
  const BANDS = { spc: [-60, 110, '우주'], atm: [110, 520, '대기'], sfc: [520, 690, '지표'] };
  const A = [
    { k: 'S', v: 100, c: 'sw', d: 'M470 -56 V200', lab: [590, 30, '태양 복사 100'], name: '태양 복사 100', io: { spc: 'out' } },
    { k: 'R', v: 30, c: 'sw', d: 'M440 200 C 380 200, 300 150, 240 -52', lab: [250, 150, '반사 30'], sub: '대기·구름 25 + 지표 5', name: '반사 30', io: { spc: 'in' } },
    { k: 'Aa', v: 20, c: 'sw', d: 'M498 210 C 540 230, 560 270, 562 318', lab: [528, 262, '20'], name: '대기·구름 흡수 20', io: { atm: 'in' }, end: [562, 330] },
    { k: 'Sa', v: 50, c: 'sw', d: 'M470 200 V520', lab: [470, 470, '50'], name: '지표 흡수 50', io: { sfc: 'in' } },
    { k: 'Up', v: 132, c: 'lw', d: 'M800 520 V240', lab: [800, 390, '132'], name: '지표 방출 → 대기 132', io: { sfc: 'out', atm: 'in' }, end: [800, 228] },
    { k: 'Us', v: 12, c: 'lw', d: 'M940 520 V-52', lab: [940, 300, '12'], name: '지표 방출 → 우주 12', io: { sfc: 'out', spc: 'in' } },
    { k: 'Dn', v: 94, c: 'lw', d: 'M640 250 V520', lab: [640, 430, '94'], name: '대기 복사 → 지표 94', io: { atm: 'out', sfc: 'in' } },
    { k: 'As', v: 58, c: 'lw', d: 'M714 210 V-52', lab: [714, 150, '58'], name: '대기 방출 → 우주 58', io: { atm: 'out', spc: 'in' } },
  ];
  const BAL = { sfc: 144, atm: 152, spc: 100 };

  function draw(svg, opt = {}) {
    el('defs', {}, svg).innerHTML = '<marker id="hb-h-' + (opt.id || 'a') + '-sw" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="2.2" markerHeight="2.2" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#f2a516"/></marker>'
      + '<marker id="hb-h-' + (opt.id || 'a') + '-lw" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="2.2" markerHeight="2.2" orient="auto"><path d="M0 0 L10 5 L0 10 z" fill="#e05a4e"/></marker>';
    const bands = {};
    Object.entries(BANDS).forEach(([k, [y0, y1, name]]) => {
      const g = el('g', { class: `hb-band ${k}`, 'data-r': k }, svg);
      el('rect', { x: 0, y: y0, width: 1000, height: y1 - y0, class: 'hb-bg' }, g);
      el('text', { x: 22, y: Math.max(y0, 0) + 46, class: 'hb-bn' }, g).textContent = name;
      bands[k] = g;
    });
    // 구름
    const cloud = el('g', { class: 'hb-cloud' }, svg);
    [[560, 300, 44], [610, 285, 54], [665, 300, 42], [600, 320, 46]].forEach(([x, y, r]) => el('circle', { cx: x, cy: y, r }, cloud));
    el('text', { x: 586, y: 372, class: 'hb-cl' }, cloud).textContent = '구름';
    const arrows = {};
    A.forEach((a) => {
      const g = el('g', { class: `hb-arr ${a.c}`, 'data-k': a.k, tabindex: opt.tap ? '0' : '-1', role: opt.tap ? 'button' : 'img', 'aria-label': a.name }, svg);
      const hit = el('path', { d: a.d, class: 'hb-hit' }, g);
      const body = el('path', { d: a.d, class: 'hb-body', 'marker-end': a.end ? '' : `url(#hb-h-${opt.id || 'a'}-${a.c})` }, g);
      const flow = el('path', { d: a.d, class: 'hb-flow' }, g);
      if (a.end) el('circle', { cx: a.end[0], cy: a.end[1], r: 14, class: 'hb-dot' }, g);
      const t = el('text', { x: a.lab[0], y: a.lab[1], class: 'hb-num' }, g); t.textContent = a.lab[2];
      if (a.sub) el('text', { x: a.lab[0], y: a.lab[1] + 30, class: 'hb-sub' }, g).textContent = a.sub;
      arrows[a.k] = { a, g, body, flow, hit, t };
      set(arrows[a.k], a.v);
    });
    return { bands, arrows, cloud };
  }
  function set(ar, v) {
    const w = Math.max(5, v * W);
    ar.body.setAttribute('stroke-width', w.toFixed(1)); ar.flow.setAttribute('stroke-width', Math.max(3, w * 0.36).toFixed(1));
    ar.hit.setAttribute('stroke-width', Math.max(46, w + 20).toFixed(1));
  }

  // ---------- 4장: 장부 맞추기 ----------
  function audit(root) {
    const svg = root.querySelector('.hb-svg');
    const { bands, arrows } = draw(svg, { tap: true, id: 'a' });
    const now = root.querySelector('.hb-now'), reg = root.querySelector('.hb-reg'), left = root.querySelector('.hb-left');
    const ulIn = root.querySelector('.hb-in'), ulOut = root.querySelector('.hb-out'), sIn = root.querySelector('.hb-sin'), sOut = root.querySelector('.hb-sout');
    const msg = root.querySelector('.hb-msg'), stamp = root.querySelector('.hb-stamp');
    const NAME = { sfc: '지표', atm: '대기', spc: '우주' };
    const done = {};
    let R = null, got = new Set();
    if (window.gsap) gsap.set(stamp, { autoAlpha: 0 });
    const need = (r) => A.filter((a) => a.io[r]);
    function pick(r) {
      R = r; got = new Set();
      Object.values(bands).forEach((b) => b.classList.toggle('on', b.dataset.r === r));
      Object.values(arrows).forEach((x) => x.g.classList.remove('in', 'out', 'got'));
      reg.textContent = `${NAME[r]}의 장부`;
      if (window.gsap) gsap.set(stamp, { autoAlpha: 0 });
      paint();
    }
    function paint() {
      if (!R) return;
      const ins = need(R).filter((a) => a.io[R] === 'in' && got.has(a.k)), outs = need(R).filter((a) => a.io[R] === 'out' && got.has(a.k));
      const li = (a) => `<li>${a.name}</li>`;
      ulIn.innerHTML = ins.map(li).join(''); ulOut.innerHTML = outs.map(li).join('');
      const si = ins.reduce((s, a) => s + a.v, 0), so = outs.reduce((s, a) => s + a.v, 0);
      sIn.textContent = ins.length ? ins.map((a) => a.v).join(' + ') + (ins.length > 1 ? ` = ${si}` : '') : '0';
      sOut.textContent = outs.length ? outs.map((a) => a.v).join(' + ') + (outs.length > 1 ? ` = ${so}` : '') : '0';
      const rest = need(R).length - got.size;
      left.textContent = rest ? `남은 화살표 ${rest}개` : '다 찾았다';
      if (!rest) {
        done[R] = { si, so };
        msg.textContent = `${NAME[R]}: 들어온 ${si} = 나간 ${so} → 열수지 평형`;
        root.querySelectorAll(`.hb-tab td[data-r="${R}"]`).forEach((td) => { td.textContent = td.dataset.c === 'in' ? si : so; td.classList.add('on'); });
        if (window.gsap) gsap.fromTo(stamp, { autoAlpha: 0, scale: 2.3, rotate: -32 }, { autoAlpha: 0.92, scale: 1, rotate: -14, duration: window.Deck.D(0.32), ease: 'power4.in' });
        const n = Object.keys(done).length;
        now.textContent = n < 3 ? `${n}/3 · 다른 영역도 맞춰 보자` : '세 영역 모두 들어온 양 = 나간 양';
        now.classList.toggle('done', n === 3);
      } else {
        msg.textContent = got.size ? '' : `${NAME[R]}에 들어오는 화살표와 나가는 화살표를 모두 눌러 보자.`;
        now.textContent = `② ${NAME[R]}에 들어오고 나가는 화살표를 누르자`; now.classList.remove('done');
      }
    }
    function tapArrow(k) {
      const ar = arrows[k];
      if (!R) { now.textContent = '① 먼저 영역(지표·대기·우주) 띠를 누르자'; return; }
      if (!ar.a.io[R]) {
        ar.g.classList.remove('bad'); void ar.g.getBBox(); ar.g.classList.add('bad');
        setTimeout(() => ar.g.classList.remove('bad'), 500);
        msg.textContent = `«${ar.a.name}»은 ${NAME[R]}에 들어오지도 나가지도 않는다.`;
        return;
      }
      got.add(k); ar.g.classList.add(ar.a.io[R], 'got'); paint();
    }
    Object.values(bands).forEach((b) => b.addEventListener('click', () => pick(b.dataset.r)));
    Object.values(arrows).forEach((ar) => {
      ar.g.addEventListener('click', (e) => { e.stopPropagation(); tapArrow(ar.a.k); });
      ar.g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); tapArrow(ar.a.k); } });
    });
    root._hb = { pick, tap: tapArrow, all() { ['sfc', 'atm', 'spc'].forEach((r) => { pick(r); need(r).forEach((a) => tapArrow(a.k)); }); } };
    return {};
  }

  // ---------- 5장: 밸브 ----------
  function valve(root) {
    const svg = root.querySelector('.hv-svg');
    const { arrows } = draw(svg, { id: 'v' });
    const F0 = 132 / 144, D0 = 94 / 152, fOf = (v) => 0.86 + 0.09 * v, V0 = (F0 - 0.86) / 0.09;
    // 굴뚝과 밸브
    const fac = el('g', { class: 'hv-fac' }, svg);
    el('rect', { x: 70, y: 556, width: 150, height: 60, class: 'hv-bld' }, fac);
    el('rect', { x: 170, y: 450, width: 30, height: 110, class: 'hv-stack' }, fac);
    el('path', { d: 'M110 586 h50 M 0 0', class: 'hv-pipe' }, fac);
    const puffs = el('g', { class: 'hv-puffs' }, svg);
    const pf = Array.from({ length: 10 }, (_, i) => { const c = el('circle', { cx: 185, cy: 440, r: 10, class: 'hv-puff' }, puffs); return { c, u: i / 10 }; });
    const dotsG = el('g', { class: 'hv-dots' }, svg);
    let q = 3; const rnd = () => { q = (q * 9301 + 49297) % 233280; return q / 233280; };
    const dots = Array.from({ length: 60 }, () => { const x = 80 + rnd() * 860, y = 130 + rnd() * 370; const g = el('g', { transform: `translate(${x.toFixed(0)} ${y.toFixed(0)})` }, dotsG); el('circle', { r: 4.5, class: 'hv-c' }, g); el('circle', { cx: -6, r: 3.2, class: 'hv-o' }, g); el('circle', { cx: 6, r: 3.2, class: 'hv-o' }, g); return g; });
    const vg = el('g', { class: 'hv-valve', tabindex: '0', role: 'slider', 'aria-label': '이산화 탄소 밸브(돌리기, ←·→ 키)' }, svg);
    el('circle', { cx: 120, cy: 470, r: 58, class: 'hv-vhit' }, vg);
    const spin = el('g', { class: 'dl-spin' }, vg);
    el('circle', { cx: 120, cy: 470, r: 44, class: 'hv-wheel' }, spin);
    [0, 60, 120].forEach((a) => el('rect', { x: 117, y: 428, width: 6, height: 84, rx: 3, transform: `rotate(${a} 120 470)`, class: 'hv-spoke' }, spin));
    el('circle', { cx: 120, cy: 470, r: 10, class: 'hv-hub' }, spin);
    el('circle', { cx: 120, cy: 428, r: 8, class: 'hv-knob' }, spin);
    el('text', { x: 120, y: 378, class: 'hv-vt' }, vg).textContent = '이산화 탄소 밸브';
    const now = root.querySelector('.hv-now');
    const chain = Object.fromEntries([...root.querySelectorAll('.hv-chain li')].map((li) => [li.dataset.k, li]));
    const bin = root.querySelector('.hv-bin'), bout = root.querySelector('.hv-bout'), btxt = root.querySelector('.hv-btxt');
    const tv = root.querySelector('.hv-tv'), tsvg = root.querySelector('.hv-temp svg');
    el('rect', { x: 10, y: 22, width: 280, height: 20, rx: 10, class: 'hv-gbg' }, tsvg);
    const zeroX = 10 + 280 * (2 / 6);
    const gbar = el('rect', { x: zeroX, y: 22, width: 0, height: 20, class: 'hv-gbar' }, tsvg);
    el('line', { x1: zeroX, x2: zeroX, y1: 14, y2: 50, class: 'hv-g0' }, tsvg);
    el('text', { x: zeroX, y: 62, class: 'hv-gt' }, tsvg).textContent = '처음';
    let f = F0, Es = 144, Ea = 152, tm = 0, v = V0, moved = false, active = false, raf = 0, last = 0, ready = false;
    const D = window.Scene3D.dial(vg, 120, 470, { max: 300, v0: V0, onChange: (x) => { v = x; f = fOf(x); if (Math.abs(x - V0) > 0.01) moved = true; if (ready && !active) { if (window.Stage.reduce) for (let i = 0; i < 600; i++) stepM(0.05); paint(); } } });
    root.querySelector('.hv-reset').addEventListener('click', () => { D.set(V0); Es = 144; Ea = 152; moved = false; paint(); });
    function stepM(dt) {
      const r = 1.7 * dt;
      for (let i = 0; i < 4; i++) { const es = Es + r / 4 * (50 + D0 * Ea - Es); const ea = Ea + r / 4 * (20 + f * Es - Ea); Es = es; Ea = ea; }
    }
    const fmt = (x) => Math.round(x);
    function word(x, x0) { return Math.abs(x - x0) < 0.6 ? '그대로' : x > x0 ? '증가' : '감소'; }
    function paint() {
      const up = f * Es, us = (1 - f) * Es, dn = D0 * Ea, as = (1 - D0) * Ea, out = 30 + us + as;
      const val = { S: 100, R: 30, Aa: 20, Sa: 50, Up: up, Us: us, Dn: dn, As: as };
      Object.entries(val).forEach(([k, x]) => { set(arrows[k], x); if (!['S', 'R'].includes(k)) arrows[k].t.textContent = fmt(x); });
      const dT = 288 * (Math.pow(Es / 144, 0.25) - 1);
      // 이산화 탄소 분자 점·연기
      const nd = Math.round(clamp(30 + (f - F0) / 0.09 * 60, 0, 60));
      dots.forEach((d, i) => d.style.display = i < nd ? '' : 'none');
      const co = v - V0;
      chain.co2.querySelector('b').textContent = Math.abs(co) < 0.02 ? '그대로' : co > 0 ? '증가' : '감소';
      chain.abs.querySelector('b').textContent = `${fmt(up)} · ${word(up, 132)}`;
      chain.dn.querySelector('b').textContent = `${fmt(dn)} · ${word(dn, 94)}`;
      chain.sfc.querySelector('b').textContent = `${fmt(dn)} · ${word(dn, 94)}`;
      chain.t.querySelector('b').textContent = Math.abs(dT) < 0.05 ? '그대로' : dT > 0 ? '상승' : '하강';
      Object.entries({ co2: co, abs: up - 132, dn: dn - 94, sfc: dn - 94, t: dT }).forEach(([k, x]) => { chain[k].classList.toggle('up', x > 0.3 || (k === 'co2' && x > 0.02) || (k === 't' && x > 0.05)); chain[k].classList.toggle('dn', x < -0.3 || (k === 'co2' && x < -0.02) || (k === 't' && x < -0.05)); });
      tv.textContent = `지표 평균 온도 변화 ${dT >= 0 ? '+' : '−'}${Math.abs(dT).toFixed(1)} °C`;
      const gx = clamp(dT, -2, 4) / 6 * 280;
      gbar.setAttribute('x', (gx >= 0 ? zeroX : zeroX + gx).toFixed(1)); gbar.setAttribute('width', Math.abs(gx).toFixed(1));
      gbar.classList.toggle('cool', dT < 0);
      bin.style.width = '50%'; bout.style.width = (clamp(out / 100, 0.8, 1.2) * 50).toFixed(1) + '%';
      const gap = 100 - out;
      btxt.textContent = Math.abs(gap) < 0.5 ? `들어옴 100 = 나감 ${fmt(out)} · 평형` : gap > 0 ? `들어옴 100 > 나감 ${out.toFixed(1)} · 에너지가 쌓여 데워지는 중` : `들어옴 100 < 나감 ${out.toFixed(1)} · 식는 중`;
      root.querySelector('.hv-bal').classList.toggle('warm', gap > 0.5);
      root.querySelector('.hv-bal').classList.toggle('cool', gap < -0.5);
      now.textContent = !moved ? '밸브를 시계 방향으로 돌리자' : Math.abs(gap) >= 0.5 ? (gap > 0 ? '나가는 에너지가 줄었다 → 지구가 데워지는 중' : '나가는 에너지가 많다 → 식는 중') : (dT > 0.05 ? '새 평형 · 지표 온도가 처음보다 높다' : dT < -0.05 ? '새 평형 · 처음보다 낮다' : '처음 평형');
      now.classList.toggle('done', moved && Math.abs(gap) < 0.5);
    }
    function tick(t) {
      raf = 0; if (!active) return;
      const dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t; tm += dt;
      stepM(dt);
      const rate = 0.25 + clamp((v - V0) * 2 + 0.5, 0, 1.2);
      pf.forEach((p) => { p.u = (p.u + dt * 0.35 * rate) % 1; p.c.setAttribute('cy', (440 - p.u * 200).toFixed(1)); p.c.setAttribute('cx', (185 + Math.sin(p.u * 6 + tm) * 14 + p.u * 60).toFixed(1)); p.c.setAttribute('r', (8 + p.u * 18).toFixed(1)); p.c.style.opacity = ((1 - p.u) * clamp(rate, 0.2, 1)).toFixed(2); });
      paint(); raf = requestAnimationFrame(tick);
    }
    ready = true; paint();
    root._hv = { set: (x) => D.set(x), settle() { for (let i = 0; i < 600; i++) stepM(0.05); paint(); }, get state() { return { Es, Ea, f }; } };
    return {
      setActive(on) {
        active = on && !window.Stage.reduce;
        if (active && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
        if (!active && raf) { cancelAnimationFrame(raf); raf = 0; }
        if (on && window.Stage.reduce) { for (let i = 0; i < 600; i++) stepM(0.05); paint(); }
      },
    };
  }

  window.Budget = { audit, valve };
})();
