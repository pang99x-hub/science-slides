/* 과학기술의 발전이 미래 사회에 미치는 유용성과 한계(교과서 148~149쪽, 그림 Ⅲ-5 양면성): 미래 도시 네 곳(공장·거리·학교·도로).
   «과학기술 발전» 막대를 밀면 그림이 바뀌며 좋아지는 점(초록)과 새 문제(빨강)가 함께 늘고, 저울 두 접시에 함께 무게가 쌓인다.
   «대비» 막대(윤리적 지침·보안·교육)를 밀면 문제가 줄지만 0이 되지는 않는다(문제 = 발전 × (1 − 0.75 × 대비), 이해를 돕기 위한 예). */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const PL = {
    fac: { name: '공장 · 인공지능 로봇', good: '생산성', bad: '일자리', g: '로봇 팔이 쉬지 않고 정확하게 일해 생산성이 높아진다.', b: '자동화로 사라지는 일자리가 생긴다.', p: '재교육으로 새 일자리로 옮겨 가게 돕는다.', box: [20, 120, 330, 290] },
    st: { name: '거리 · 정보 통신 기술', good: '빠른 소통', bad: '사이버 폭력', g: '시간과 장소에 얽매이지 않고 정보를 주고받는다.', b: '익명성을 악용한 허위 사실 유포·사이버 언어폭력이 늘 수 있다.', p: '신고 제도와 정보 윤리 교육.', box: [370, 150, 310, 260] },
    sch: { name: '학교 · 인공지능 학습 도우미', good: '맞춤 교육', bad: '디지털 격차', g: '학생마다 수준에 맞춘 교육을 받는다.', b: '기기나 인터넷이 없는 학생은 뒤처진다(디지털 격차).', p: '기기 지원과 디지털 교육.', box: [700, 110, 336, 300] },
    road: { name: '도로 · 자율주행 자동차', good: '안전한 교통', bad: '보안·사생활', g: '인공지능 교통 관제와 자율주행으로 덜 막히고 사고가 준다.', b: '해킹 같은 보안 위협, 이동 기록이 새면 사생활 침해.', p: '보안 기술과 개인 정보 보호 규칙.', box: [20, 420, 1016, 130] },
  };
  const KEYS = ['fac', 'st', 'sch', 'road'];

  function city(svg) {
    const g = (c, p) => el('g', { class: c }, p || svg);
    el('rect', { class: 'ts-sky', x: -400, y: -300, width: 1856, height: 720 }, svg);
    el('rect', { class: 'ts-grass', x: -400, y: 400, width: 1856, height: 30 }, svg);
    el('rect', { class: 'ts-road', x: -400, y: 430, width: 1856, height: 120 }, svg);
    el('path', { class: 'ts-lane', d: 'M-400 490 H 1456' }, svg);
    el('rect', { class: 'ts-grass', x: -400, y: 550, width: 1856, height: 300 }, svg);
    const o = {};
    // 공장
    const F = g('ts-pl'); F.dataset.k = 'fac';
    el('rect', { class: 'ts-bld', x: 40, y: 220, width: 290, height: 180 }, F);
    el('path', { class: 'ts-saw', d: 'M40 220 l 48 -40 v 40 l 48 -40 v 40 l 48 -40 v 40 l 48 -40 v 40 l 48 -40 v 40 l 50 -40 v 40' }, F);
    el('rect', { class: 'ts-belt', x: 60, y: 340, width: 250, height: 14, rx: 7 }, F);
    o.boxes = g('', F); for (let i = 0; i < 5; i++) el('rect', { class: 'ts-box', x: 0, y: 318, width: 22, height: 22, rx: 3 }, o.boxes);
    o.arms = [0, 1, 2].map((i) => { const a = g('ts-robo', F); const x = 100 + i * 80; el('rect', { x: x - 12, y: 290, width: 24, height: 14, rx: 4 }, a); el('path', { d: `M${x} 292 L ${x + 10} 258 L ${x + 30} 270 L ${x + 30} 300` }, a); return a; });
    o.workers = [0, 1, 2].map((i) => { const w = g('ts-man', F); man(w, 110 + i * 80, 396, '#d9a14a'); return w; });
    o.lost = g('ts-bad', F); man(o.lost, 348, 396, '#d9a14a'); el('text', { class: 'ts-q', x: 348, y: 312 }, o.lost).textContent = '?';
    o.retrain = g('ts-prep', F); el('rect', { class: 'ts-prepb', x: 236, y: 128, width: 120, height: 38, rx: 8 }, o.retrain); el('text', { x: 296, y: 153 }, o.retrain).textContent = '재교육';
    o.prodT = el('text', { class: 'ts-good-t', x: 120, y: 160 }, F);
    // 거리
    const S = g('ts-pl'); S.dataset.k = 'st';
    el('rect', { class: 'ts-bld b2', x: 420, y: 250, width: 90, height: 150 }, S); el('rect', { class: 'ts-bld b2', x: 560, y: 200, width: 100, height: 200 }, S);
    o.p1 = g('', S); man(o.p1, 470, 396, '#3a78c2'); el('rect', { class: 'ts-phone', x: 480, y: 330, width: 12, height: 20, rx: 3 }, o.p1);
    o.p2 = g('', S); man(o.p2, 610, 396, '#8d7ab8'); el('rect', { class: 'ts-phone', x: 588, y: 330, width: 12, height: 20, rx: 3 }, o.p2);
    o.waves = g('ts-good', S); el('path', { d: 'M496 320 C 520 250, 570 250, 592 320' }, o.waves); el('circle', { cx: 544, cy: 262, r: 16, class: 'ts-globe' }, o.waves);
    o.angry = g('ts-bad', S); el('path', { class: 'ts-bub', d: 'M600 196 h 90 a 12 12 0 0 1 12 12 v 34 a 12 12 0 0 1 -12 12 h -60 l -16 16 l 2 -16 h -16 a 12 12 0 0 1 -12 -12 v -34 a 12 12 0 0 1 12 -12 z' }, o.angry); el('text', { x: 645, y: 232 }, o.angry).textContent = '#@!%';
    o.report = g('ts-prep', S); el('rect', { class: 'ts-prepb', x: 590, y: 150, width: 116, height: 36, rx: 8 }, o.report); el('text', { x: 648, y: 174 }, o.report).textContent = '신고·교육';
    // 학교
    const C = g('ts-pl'); C.dataset.k = 'sch';
    el('rect', { class: 'ts-bld sch', x: 730, y: 210, width: 280, height: 190 }, C); el('path', { class: 'ts-roof', d: 'M720 214 L 870 150 L 1020 214 Z' }, C);
    el('circle', { class: 'ts-clock', cx: 870, cy: 186, r: 16 }, C);
    [760, 840, 920].forEach((x) => el('rect', { class: 'ts-win', x, y: 236, width: 56, height: 40 }, C));
    o.kids = [0, 1, 2].map((i) => { const k = g('', C); man(k, 780 + i * 70, 396, ['#3fbf6a', '#e2622b', '#2a8fb8'][i], 0.78); return k; });
    o.tabs = [0, 1].map((i) => el('rect', { class: 'ts-tab ts-good', x: 790 + i * 70, y: 342, width: 24, height: 18, rx: 3 }, C));
    o.noTab = g('ts-bad', C); el('text', { class: 'ts-q', x: 920, y: 312 }, o.noTab).textContent = '?';
    o.lend = el('rect', { class: 'ts-tab ts-prep', x: 930, y: 342, width: 24, height: 18, rx: 3 }, C);
    o.giveT = g('ts-prep', C); el('rect', { class: 'ts-prepb', x: 900, y: 110, width: 120, height: 36, rx: 8 }, o.giveT); el('text', { x: 960, y: 134 }, o.giveT).textContent = '기기 지원';
    // 도로
    const R = g('ts-pl'); R.dataset.k = 'road';
    o.cars = [0, 1, 2, 3, 4].map((i) => { const c = g('ts-car', R); el('rect', { class: 'ts-cbody', x: -36, y: -16, width: 72, height: 24, rx: 8 }, c); el('path', { class: 'ts-ctop', d: 'M-22 -16 l 8 -14 h 28 l 8 14 z' }, c); el('circle', { class: 'ts-cw', cx: -20, cy: 9, r: 8 }, c); el('circle', { class: 'ts-cw', cx: 20, cy: 9, r: 8 }, c); const d = el('circle', { class: 'ts-driver', cx: -2, cy: -20, r: 6 }, c); const s = el('path', { class: 'ts-sense', d: 'M38 -6 a 22 22 0 0 1 0 12 M 46 -10 a 32 32 0 0 1 0 20' }, c); c.dataset.i = i; return { c, d, s, x: 60 + i * 150, lane: i % 2 }; });
    const hc = o.cars[2].c;   // 해킹 표시와 보안 방패는 셋째 차에 붙어 다닌다
    o.hack = g('ts-bad', hc); el('path', { class: 'ts-warn', d: 'M-40 -36 l 20 -34 l 20 34 z' }, o.hack); el('text', { class: 'ts-warnt', x: -20, y: -41 }, o.hack).textContent = '!'; el('text', { class: 'ts-tag-t', x: -20, y: -78 }, o.hack).textContent = '해킹';
    o.shield = g('ts-prep', hc); el('path', { class: 'ts-shield', d: 'M4 -64 l 20 -8 l 20 8 v 14 c 0 14 -10 20 -20 26 c -10 -6 -20 -12 -20 -26 z' }, o.shield); el('text', { class: 'ts-tag-t', x: 24, y: -80 }, o.shield).textContent = '보안';
    // 누를 자리
    const hits = KEYS.map((k) => { const [x, y, w, h] = PL[k].box; const s = el('g', { class: 'ts-spot', 'data-k': k, tabindex: '0', role: 'button', 'aria-label': PL[k].name }, svg); el('rect', { x, y, width: w, height: h, rx: 16 }, s); return s; });
    return { o, hits };
  }
  function man(p, x, y, color, k = 1) {
    const g = el('g', { transform: `translate(${x} ${y}) scale(${k})` }, p);
    el('path', { class: 'ts-body', d: 'M-15 0 v -46 a 15 15 0 0 1 30 0 v 46 z', fill: color }, g);
    el('circle', { class: 'ts-face', cy: -64, r: 13 }, g);
    return g;
  }
  function scale(svg) {
    el('path', { class: 'ts-sbase', d: 'M240 204 h 80 l -20 -18 h -40 z' }, svg);
    el('rect', { class: 'ts-spole', x: 274, y: 34, width: 12, height: 154 }, svg);
    const beam = el('g', { class: 'ts-beam' }, svg);
    el('rect', { x: 60, y: 28, width: 440, height: 12, rx: 6 }, beam); el('circle', { cx: 280, cy: 34, r: 12 }, beam);
    const pan = (x, k, label) => {
      const g = el('g', { class: `ts-pan ${k}` }, svg);
      el('path', { class: 'ts-str', d: 'M-80 112 L 0 0 L 80 112' }, g);
      el('path', { class: 'ts-dish', d: 'M-92 112 h 184 a 92 20 0 0 1 -184 0 z' }, g);
      const stack = el('g', {}, g);
      el('text', { class: 'ts-pt', y: 156 }, g).textContent = label;
      return { g, stack, x };
    };
    return { beam, L: pan(100, 'good', '유용성'), R: pan(460, 'bad', '한계') };
  }

  function mount(root) {
    const svg = root.querySelector('.ts-svg'), sc = root.querySelector('.ts-scale');
    const tech = root.querySelector('#ts-tech'), prep = root.querySelector('#ts-prep'), tv = root.querySelector('.ts-tv'), pv = root.querySelector('.ts-pv');
    const it = root.querySelector('.ts-it'), ib = root.querySelector('.ts-ib');
    const { o, hits } = city(svg), S = scale(sc);
    let cur = null, raf = 0, active = false, last = 0, tm = 0;
    const lerp = (a, b, u) => a + (b - a) * u;
    function blocks(stack, vals, cls) {
      stack.innerHTML = ''; let y = 110;
      vals.forEach(([v, name]) => { if (v < 0.04) return; const h = 6 + 18 * v; y -= h; const b = el('g', { class: `ts-blk ${cls}` }, stack); el('rect', { x: -78, y, width: 156, height: h - 2, rx: 4 }, b); if (h > 17) el('text', { x: 0, y: y + h / 2 + 5 }, b).textContent = name; });
    }
    function paint() {
      const t = Number(tech.value) / 100, p = Number(prep.value) / 100, risk = t * (1 - 0.75 * p);
      tv.textContent = t < 0.15 ? '오늘' : t < 0.55 ? '10년 뒤' : '20년 뒤'; pv.textContent = p < 0.1 ? '없음' : p < 0.6 ? '조금' : '많이';
      // 공장: 로봇 팔이 늘고 일하는 사람이 준다
      o.arms.forEach((a, i) => a.style.opacity = clamp(t * 3 - i, 0, 1));
      o.workers.forEach((w, i) => w.style.opacity = clamp(1 - (t * 3 - (2 - i)) , 0.0, 1) > 0.5 ? 1 : 0);
      const gone = o.workers.filter((w) => w.style.opacity === '0').length;
      o.lost.style.opacity = gone ? clamp(1 - p * 1.1, 0.15, 1) : 0; o.retrain.style.opacity = gone ? p : 0;
      o.prodT.textContent = `생산량 ${'▲'.repeat(1 + Math.round(t * 3))}`;
      // 거리
      o.waves.style.opacity = 0.25 + 0.75 * t; o.angry.style.opacity = risk * 1.3; o.report.style.opacity = t > 0.2 ? p : 0;
      // 학교
      o.tabs.forEach((e, i) => e.style.opacity = clamp(t * 2.5 - i * 0.5, 0, 1));
      o.noTab.style.opacity = t > 0.3 ? clamp(1 - p * 1.3, 0, 1) : 0; o.lend.style.opacity = t > 0.3 ? clamp(p * 1.5 - 0.3, 0, 1) : 0; o.giveT.style.opacity = t > 0.3 ? p : 0;
      // 도로: 운전자가 사라지고 센서가 생긴다
      o.cars.forEach((c, i) => { const auto = t * 5 > i + 0.5; c.d.style.opacity = auto ? 0 : 1; c.s.style.opacity = auto ? 1 : 0; });
      o.hack.style.opacity = clamp(risk * 1.6 - 0.25, 0, 1); o.shield.style.opacity = t > 0.3 ? p : 0;
      // 저울
      const good = KEYS.map((k) => [t, PL[k].good]), bad = KEYS.map((k) => [risk, PL[k].bad]);
      blocks(S.L.stack, good, 'good'); blocks(S.R.stack, bad, 'bad');
      const G = t * 4, B = risk * 4, ang = clamp((B - G) * 3.2, -12, 12);
      S.beam.setAttribute('transform', `rotate(${ang.toFixed(2)} 280 34)`);
      const rad = ang * Math.PI / 180;
      [[S.L, -180], [S.R, 180]].forEach(([pan, dx]) => pan.g.setAttribute('transform', `translate(${(280 + dx * Math.cos(rad)).toFixed(1)} ${(34 + dx * Math.sin(rad)).toFixed(1)})`));
      if (cur) info(cur);
    }
    function info(k) {
      const P = PL[k], t = Number(tech.value) / 100, p = Number(prep.value) / 100;
      cur = k; hits.forEach((h) => h.classList.toggle('on', h.dataset.k === k));
      it.textContent = P.name;
      ib.innerHTML = '';
      const line = (cls, tag, txt) => { const q = document.createElement('p'); q.className = cls; const b = document.createElement('b'); b.textContent = tag; q.append(b, ' ' + txt); ib.appendChild(q); };
      if (t < 0.1) { line('', '', '막대를 밀어 기술이 발전하면 이곳이 어떻게 바뀌는지 보자.'); return; }
      line('ts-l good', '좋아지는 점', P.g); line('ts-l bad', '새 문제', P.b); if (p > 0.05) line('ts-l prep', '대비', P.p);
    }
    [tech, prep].forEach((r) => { r.addEventListener('input', paint); r.addEventListener('keydown', (e) => e.stopPropagation()); });
    hits.forEach((h) => { h.addEventListener('click', () => info(h.dataset.k)); h.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); info(h.dataset.k); } }); });
    function tick(now) {
      raf = 0; if (!active) return;
      const dt = Math.min(0.05, (now - last) / 1000 || 0.016); last = now;
      move(dt); raf = requestAnimationFrame(tick);
    }
    function move(dt) {
      tm += dt;
      const t = Number(tech.value) / 100;
      [...o.boxes.children].forEach((b, i) => { const x = 60 + ((tm * (40 + 90 * t) + i * 56) % 250); b.setAttribute('x', x.toFixed(1)); });
      o.cars.forEach((c, i) => {
        const auto = t * 5 > i + 0.5, v = auto ? 120 : 70 + 40 * Math.sin(tm * 1.3 + i);
        c.x += v * dt * (c.lane ? -1 : 1); if (c.x > 1110) c.x = -60; if (c.x < -60) c.x = 1110;
        c.c.setAttribute('transform', `translate(${c.x.toFixed(1)} ${c.lane ? 470 : 522}) scale(${c.lane ? -1 : 1} 1)`);
      });
    }
    paint(); move(0);
    root._two = { set: (a, b) => { tech.value = String(a); prep.value = String(b); paint(); }, info };
    return { setActive(on) { active = on; if (on && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); } if (!on && raf) { cancelAnimationFrame(raf); raf = 0; } } };
  }
  window.TwoSides = { mount };
})();
