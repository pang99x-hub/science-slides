/* 4차시 «대멸종 그 뒤»: 중생대 말 세계에 새총으로 소행성을 보낸다. 당긴 거리 = 환경 변화의 크기.
   변화가 클수록 견디지 못한 생물(큰 몸, 먹이를 많이 먹는 무리)이 사라지고, 오랜 시간이 지나면 살아남은 무리(작은 포유류·새·속씨식물·물고기)가
   빈자리로 갈라져 새 종이 생긴다. 종 수·견디는 정도·시간은 모두 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const GROUND = 400, REST = [118, 262], MAXP = 150, HIT = [520, 392];

  // 생물 모양(땅 = y 0)
  const G = {
    sauro(g) { el('path', { class: 'sl-leg', d: 'M-26 -20 V 0 M -10 -20 V 0 M 14 -20 V 0 M 28 -20 V 0 M -40 -32 C -70 -28, -90 -18, -104 -8 M 30 -40 C 46 -60, 54 -84, 62 -96' }, g); el('ellipse', { cx: 0, cy: -34, rx: 44, ry: 20 }, g); el('circle', { cx: 64, cy: -98, r: 8 }, g); },
    trex(g) { el('path', { class: 'sl-leg', d: 'M-6 -36 L -12 0 M 10 -36 L 14 0 M -26 -52 C -50 -48, -70 -40, -88 -28 M 22 -58 l 10 10' }, g); el('ellipse', { cx: 0, cy: -54, rx: 30, ry: 18, transform: 'rotate(-18 0 -54)' }, g); el('ellipse', { cx: 34, cy: -76, rx: 18, ry: 11 }, g); },
    ptero(g) { el('path', { d: 'M-56 4 L -6 -10 L 0 -2 L 6 -10 L 56 4 L 4 2 Z' }, g); el('path', { d: 'M4 -6 l 22 -6 l -18 10 Z' }, g); },
    conifer(g) { el('path', { class: 'sl-trunk', d: 'M0 0 V -30' }, g); el('path', { class: 'sl-leaf', d: 'M-26 -26 L 0 -96 L 26 -26 Z' }, g); },
    broad(g) { el('path', { class: 'sl-trunk', d: 'M0 0 V -40' }, g); el('circle', { class: 'sl-leaf2', cx: 0, cy: -62, r: 30 }, g); el('circle', { class: 'sl-leaf2', cx: -20, cy: -48, r: 18 }, g); el('circle', { class: 'sl-leaf2', cx: 20, cy: -48, r: 18 }, g); },
    flower(g) { el('path', { class: 'sl-trunk', d: 'M0 0 V -34 M 0 -18 l -10 -6' }, g); [[0, -46], [-8, -38], [8, -38], [0, -32]].forEach(([x, y]) => el('circle', { class: 'sl-pet', cx: x, cy: y, r: 7 }, g)); el('circle', { cx: 0, cy: -39, r: 4, class: 'sl-mid' }, g); },
    croc(g) { el('ellipse', { cx: 0, cy: -8, rx: 40, ry: 8 }, g); el('path', { d: 'M36 -10 L 66 -6 L 36 -3 Z M -38 -8 L -70 -2 L -38 -3 Z' }, g); },
    mouse(g) { el('path', { class: 'sl-leg', d: 'M-12 -6 C -22 -4, -26 -10, -32 -12' }, g); el('ellipse', { cx: 0, cy: -8, rx: 13, ry: 8 }, g); el('circle', { cx: 12, cy: -12, r: 6 }, g); },
    bigmam(g) { el('path', { class: 'sl-leg', d: 'M-22 -20 V 0 M -10 -20 V 0 M 12 -20 V 0 M 24 -20 V 0' }, g); el('ellipse', { cx: 0, cy: -32, rx: 34, ry: 18 }, g); el('path', { d: 'M28 -40 L 44 -62 L 56 -56 L 40 -34 Z' }, g); },
    carn(g) { el('path', { class: 'sl-leg', d: 'M-16 -14 V 0 M -6 -14 V 0 M 10 -14 V 0 M 18 -14 V 0 M -22 -22 C -34 -26, -40 -34, -44 -40' }, g); el('ellipse', { cx: 0, cy: -22, rx: 24, ry: 11 }, g); el('ellipse', { cx: 26, cy: -30, rx: 11, ry: 8 }, g); },
    bird(g) { el('ellipse', { cx: 0, cy: 0, rx: 14, ry: 8 }, g); el('path', { class: 'sl-leg', d: 'M-4 -2 C -14 -20, -26 -18, -34 -10 M -2 -2 C 8 -22, 20 -20, 28 -12' }, g); el('path', { d: 'M12 -4 l 10 2 l -10 3 Z' }, g); },
    bat(g) { el('path', { d: 'M0 -4 C -10 -16, -30 -14, -40 -4 C -30 -6, -24 2, -16 0 C -10 4, -4 2, 0 6 C 4 2, 10 4, 16 0 C 24 2, 30 -6, 40 -4 C 30 -14, 10 -16, 0 -4 Z' }, g); },
    ammon(g) { el('circle', { cx: 0, cy: 0, r: 20 }, g); el('path', { class: 'sl-spiral', d: 'M0 0 m 0 -4 a 4 4 0 1 1 -4 4 a 9 9 0 1 1 9 9 a 14 14 0 1 1 -14 -14' }, g); },
    plesio(g) { el('ellipse', { cx: 0, cy: 0, rx: 34, ry: 14 }, g); el('path', { class: 'sl-leg', d: 'M28 -6 C 48 -20, 54 -36, 66 -44 M -30 2 L -58 8' }, g); el('circle', { cx: 68, cy: -46, r: 7 }, g); el('path', { d: 'M-8 8 l -14 16 l 18 -12 Z M 14 8 l 6 18 l 4 -18 Z' }, g); },
    fish(g) { el('ellipse', { cx: 0, cy: 0, rx: 22, ry: 10 }, g); el('path', { d: 'M-18 0 L -34 -12 L -34 12 Z' }, g); },
    whale(g) { el('path', { d: 'M-60 0 C -50 -22, 40 -26, 60 -4 C 50 10, -30 14, -60 0 Z M -58 0 L -84 -14 L -78 0 L -84 14 Z' }, g); },
  };
  // 자리(지위) · 처음 사는 생물 · 견디는 정도 · 빈자리에 올 새 생물과 그 조상 무리
  const NICHE = [
    { k: 'bigherb', x: 330, y: GROUND, sp: 'sauro', name: '큰 초식 공룡', r: 0.2, nu: 'bigmam', nuName: '큰 초식 포유류', from: 'mam' },
    { k: 'bigcarn', x: 466, y: GROUND, sp: 'trex', name: '육식 공룡', r: 0.22, nu: 'carn', nuName: '육식 포유류', from: 'mam' },
    { k: 'air', x: 420, y: 150, sp: 'ptero', name: '익룡', r: 0.3, nu: 'bird', nuName: '큰 새', from: 'bird' },
    { k: 'tree', x: 238, y: GROUND, sp: 'conifer', name: '겉씨식물', r: 0.5, nu: 'broad', nuName: '속씨식물 나무', from: 'flower' },
    { k: 'tree2', x: 610, y: GROUND, sp: 'conifer', name: '겉씨식물', r: 0.55, nu: 'broad', nuName: '속씨식물 나무', from: 'flower' },
    { k: 'flower', x: 548, y: GROUND, sp: 'flower', name: '속씨식물', r: 0.78, group: 'flower' },
    { k: 'shore', x: 706, y: GROUND + 6, sp: 'croc', name: '악어 무리', r: 0.92 },
    { k: 'burrow', x: 284, y: 470, sp: 'mouse', name: '작은 포유류', r: 0.95, group: 'mam' },
    { k: 'burrow2', x: 520, y: 482, sp: 'mouse', name: '작은 포유류', r: 0.93, group: 'mam' },
    { k: 'air2', x: 650, y: 210, sp: 'bird', name: '작은 새', r: 0.91, group: 'bird' },
    { k: 'sea1', x: 826, y: 500, sp: 'ammon', name: '암모나이트', r: 0.3, nu: 'fish', nuName: '새 물고기', from: 'fish' },
    { k: 'sea2', x: 960, y: 548, sp: 'ammon', name: '암모나이트', r: 0.32, nu: 'fish', nuName: '새 물고기', from: 'fish' },
    { k: 'seabig', x: 900, y: 446, sp: 'plesio', name: '해양 파충류', r: 0.28, nu: 'whale', nuName: '고래 무리', from: 'mam' },
    { k: 'fish', x: 860, y: 566, sp: 'fish', name: '물고기', r: 0.66, group: 'fish' },
    { k: 'fish2', x: 1000, y: 470, sp: 'fish', name: '물고기', r: 0.7, group: 'fish' },
  ];
  // 크게 바뀐 뒤 더 갈라져 생길 수 있는 빈 곳(덤으로 늘어나는 다양성)
  const EXTRA = [
    { x: 380, y: 488, sp: 'mouse', from: 'mam' }, { x: 760, y: 120, sp: 'bat', from: 'mam' }, { x: 300, y: 230, sp: 'bird', from: 'bird' },
    { x: 404, y: GROUND, sp: 'flower', from: 'flower' }, { x: 960, y: 500, sp: 'fish', from: 'fish' }, { x: 640, y: GROUND, sp: 'flower', from: 'flower' },
    { x: 520, y: 250, sp: 'bird', from: 'bird' }, { x: 180, y: GROUND - 10, sp: 'carn', from: 'mam' },
  ];

  function mount(root) {
    const svg = root.querySelector('.sl-svg'), now = root.querySelector('.sl-now'), msg = root.querySelector('.sl-msg');
    const pwBar = root.querySelector('.sl-bar i'), pwT = root.querySelector('.sl-pw'), bars = root.querySelector('.sl-bars');
    const gauge = (k) => root.querySelector(`.sl-g[data-k="${k}"] i`);
    el('rect', { class: 'sl-sky', x: 0, y: -300, width: 1056, height: GROUND + 300 }, svg);
    const sun = el('circle', { class: 'sl-sun', cx: 930, cy: 80, r: 40 }, svg);
    el('rect', { class: 'sl-ground', x: 0, y: GROUND, width: 760, height: 200 }, svg);
    el('path', { class: 'sl-seafill', d: `M760 ${GROUND + 10} C 790 ${GROUND - 4}, 1000 ${GROUND - 4}, 1056 ${GROUND + 6} V 600 H 760 Z` }, svg);
    el('path', { class: 'sl-hill', d: `M0 ${GROUND} V 320 C 60 300, 170 300, 220 ${GROUND} Z` }, svg);
    [[284, 476], [520, 488], [380, 494]].forEach(([x, y]) => el('ellipse', { class: 'sl-hole', cx: x, cy: y, rx: 34, ry: 16 }, svg));
    el('text', { class: 'sl-cap', x: 900, y: 590 }, svg).textContent = '바다';
    el('text', { class: 'sl-cap', x: 400, y: 590 }, svg).textContent = '땅속 굴';
    const branch = el('g', { class: 'sl-branch' }, svg);
    const life = el('g', {}, svg);
    const crater = el('ellipse', { class: 'sl-crater', cx: HIT[0], cy: HIT[1] + 6, rx: 0, ry: 0 }, svg);
    const dust = el('rect', { class: 'sl-dust', x: 0, y: -300, width: 1056, height: 900, opacity: 0 }, svg);
    const flash = el('circle', { class: 'sl-flash', cx: HIT[0], cy: HIT[1], r: 0, opacity: 0 }, svg);
    const stamp = el('text', { class: 'sl-time', x: 640, y: 60, opacity: 0 }, svg);
    // 새총
    const sling = el('g', { class: 'sl-sling' }, svg);
    el('path', { class: 'sl-frame', d: `M${REST[0]} 360 V 300 M ${REST[0]} 300 L ${REST[0] - 30} 244 M ${REST[0]} 300 L ${REST[0] + 30} 244` }, sling);
    const band1 = el('line', { class: 'sl-band', x1: REST[0] - 30, y1: 244 }, sling), band2 = el('line', { class: 'sl-band', x1: REST[0] + 30, y1: 244 }, sling);
    const aim = el('path', { class: 'sl-aim', d: '' }, svg);
    const rock = el('g', { class: 'sl-rock', tabindex: '0', role: 'slider', 'aria-label': '새총의 소행성: 뒤로 당긴 만큼 환경 변화가 커진다. 왼쪽 화살표로 당기고 Enter로 놓는다', 'aria-valuemin': '0', 'aria-valuemax': '100', 'aria-valuenow': '0' }, svg);
    el('circle', { class: 'sl-rhit', r: 46 }, rock); el('path', { class: 'sl-ast', d: 'M-20 -6 C -18 -20, 2 -24, 14 -16 C 24 -8, 22 10, 10 18 C -4 24, -22 14, -20 -6 Z' }, rock);
    el('circle', { class: 'sl-pit', cx: -4, cy: -4, r: 4 }, rock); el('circle', { class: 'sl-pit', cx: 8, cy: 8, r: 3 }, rock);

    let sp = [], extras = [], pull = [0, 0], busy = false, done = false, counts = [NICHE.length, null, null];
    function drawBars() {
      bars.innerHTML = '';
      const lab = ['충돌 전', '직후', '오랜 시간 뒤'], col = ['#8a9a7a', '#d9483b', '#2f9e5b'];
      el('line', { class: 'sl-base', x1: 20, x2: 400, y1: 132, y2: 132 }, bars);
      counts.forEach((c, i) => {
        const x = 40 + i * 128, h = c == null ? 0 : c / 26 * 110;
        el('rect', { x, y: 132 - h, width: 84, height: h, fill: col[i], rx: 4 }, bars);
        el('text', { class: 'sl-bl', x: x + 42, y: 158 }, bars).textContent = lab[i];
        if (c != null) el('text', { class: 'sl-bv', x: x + 42, y: 124 - h }, bars).textContent = c + '종';
      });
    }
    function build() {
      life.innerHTML = ''; branch.innerHTML = '';
      sp = NICHE.map((n) => { const g = el('g', { class: `sl-sp sp-${n.sp}`, transform: `translate(${n.x} ${n.y})` }, life); G[n.sp](g); return { n, g, dead: false }; });
      extras = [];
    }
    function setPull(dx, dy) {
      const d = Math.hypot(dx, dy), k = d > MAXP ? MAXP / d : 1; pull = [dx * k, dy * k];
      const x = REST[0] + pull[0], y = REST[1] + pull[1], p = Math.hypot(...pull) / MAXP;
      rock.setAttribute('transform', `translate(${x} ${y})`);
      [band1, band2].forEach((b) => { b.setAttribute('x2', x); b.setAttribute('y2', y); });
      aim.setAttribute('d', p > 0.05 ? `M${x} ${y} Q ${(x + HIT[0]) / 2} ${Math.min(y, HIT[1]) - 140 - 120 * p} ${HIT[0]} ${HIT[1]}` : '');
      pwBar.style.width = (p * 100) + '%';
      pwT.textContent = p < 0.05 ? '당기지 않음' : p < 0.3 ? '작음' : p < 0.6 ? '보통' : p < 0.85 ? '큼' : '아주 큼';
      rock.setAttribute('aria-valuenow', String(Math.round(p * 100)));
      return p;
    }
    function op(e, v) { e.style.opacity = ''; e.setAttribute('opacity', v); if (window.gsap) gsap.set(e, { opacity: v }); }
    function gauges(v) { gauge('sun').style.width = (v * 100) + '%'; gauge('temp').style.width = (v * 100) + '%'; }
    function reset() {
      if (window.gsap) gsap.killTweensOf([dust, flash, crater, stamp, sun]);
      busy = false; done = false; build(); setPull(0, 0); counts = [NICHE.length, null, null]; drawBars(); gauges(1);
      op(dust, 0); op(flash, 0); op(stamp, 0); op(sun, 1); crater.setAttribute('rx', 0); crater.setAttribute('ry', 0);
      rock.style.display = ''; msg.textContent = '당긴 거리가 클수록 환경이 더 크게, 더 갑자기 바뀐다.';
      now.textContent = '새총의 소행성을 뒤로 당겼다 놓아 보자'; now.classList.remove('done', 'gone');
    }
    const T = (fn, ms) => setTimeout(fn, reduce ? 0 : ms);
    function fire(p) {
      if (busy || done) return; busy = true; now.classList.add('gone');
      const e = Math.max(0, Math.min(1, p)) * 0.9;   // 굴속 작은 포유류는 늘 살아남는다(이해를 돕기 위한 예)
      const start = [REST[0] + pull[0], REST[1] + pull[1]];
      aim.setAttribute('d', ''); setPull(0, 0);
      const fly = { t: 0 };
      const mid = [(start[0] + HIT[0]) / 2, Math.min(start[1], HIT[1]) - 140 - 120 * p];
      const place = () => { const t = fly.t, u = 1 - t; rock.setAttribute('transform', `translate(${u * u * start[0] + 2 * u * t * mid[0] + t * t * HIT[0]} ${u * u * start[1] + 2 * u * t * mid[1] + t * t * HIT[1]}) scale(${1 + t * 0.4})`); };
      const impact = () => {
        rock.style.display = 'none';
        const dark = p < 0.12 ? 0.08 : 0.25 + 0.6 * p;
        if (window.gsap && !reduce) {
          gsap.fromTo(flash, { attr: { r: 10 }, opacity: 0.95 }, { attr: { r: 160 + 360 * p }, opacity: 0, duration: 0.8, ease: 'power2.out' });
          gsap.to(crater, { attr: { rx: 30 + 70 * p, ry: 6 + 10 * p }, duration: 0.4 });
          gsap.to(dust, { opacity: dark, duration: 1.2 });
          gsap.fromTo(svg, { x: -8 * p }, { x: 0, duration: 0.6, ease: 'elastic.out(1, 0.25)' });
        } else { crater.setAttribute('rx', 30 + 70 * p); crater.setAttribute('ry', 6 + 10 * p); op(dust, dark); }
        op(sun, 1 - dark);
        gauges(Math.max(0.1, 1 - p * 0.85));
        let lost = 0;
        sp.forEach((s) => { if (s.n.r < e) { s.dead = true; lost++; s.g.classList.add('dead'); } });
        counts[1] = NICHE.length - lost; drawBars();
        msg.textContent = lost === 0 ? '변화가 작아서 거의 모든 생물이 견뎌 냈다. 더 세게 당겨 보자.'
          : `먼지가 햇빛을 가려 춥고 어두워졌다. 몸집이 크고 먹이를 많이 먹던 생물부터 ${lost}종이 사라졌다(회색).`;
        if (lost === 0) { T(() => { busy = false; rock.style.display = ''; setPull(0, 0); op(dust, 0); crater.setAttribute('rx', 0); crater.setAttribute('ry', 0); gauges(1); op(sun, 1); counts[1] = null; drawBars(); now.textContent = '조금 더 세게 당겨 보자'; now.classList.remove('gone'); }, 2200); return; }
        T(after, 2600);
      };
      if (window.gsap && !reduce) gsap.to(fly, { t: 1, duration: 0.9, ease: 'power1.in', onUpdate: place, onComplete: impact });
      else impact();
    }
    function after() {
      stamp.textContent = '오랜 시간이 지나…';
      if (window.gsap && !reduce) { gsap.fromTo(stamp, { opacity: 0 }, { opacity: 1, duration: 0.5 }); gsap.to(dust, { opacity: 0, duration: 2.2, delay: 0.4 }); gsap.to(sun, { opacity: 1, duration: 2.2, delay: 0.4 }); }
      else { op(stamp, 1); op(dust, 0); op(sun, 1); }
      gauges(1);
      const alive = sp.filter((s) => !s.dead), byGroup = (gname) => alive.find((s) => s.n.group === gname) || alive.find((s) => s.n.group) || alive[0];
      const born = [];
      sp.filter((s) => s.dead).forEach((s) => { s.g.classList.add('fossil'); if (s.n.nu) born.push({ x: s.n.x, y: s.n.y, sp: s.n.nu, parent: byGroup(s.n.from) }); });
      const nExtra = Math.min(EXTRA.length, Math.ceil(born.length * 0.6));
      EXTRA.slice(0, nExtra).forEach((x) => born.push({ x: x.x, y: x.y, sp: x.sp, parent: byGroup(x.from) }));
      born.forEach((b, i) => T(() => {
        const px = b.parent.n.x, py = b.parent.n.y - 20;
        const path = el('path', { class: 'sl-br', d: `M${px} ${py} C ${px} ${py - 80}, ${b.x} ${b.y - 120}, ${b.x} ${b.y - 24}` }, branch);
        const g = el('g', { class: `sl-sp sl-new sp-${b.sp}`, transform: `translate(${b.x} ${b.y})` }, life); G[b.sp](g);
        if (window.gsap && !reduce) { const L = path.getTotalLength(); gsap.fromTo(path, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.6 }); gsap.from(g, { opacity: 0, scale: 0.2, transformOrigin: '50% 100%', duration: 0.5, delay: 0.4, ease: 'back.out(2)' }); }
        extras.push(g);
        if (i === born.length - 1) T(finish, 900);
      }, 900 + i * 260));
      if (!born.length) T(finish, 900);
      function finish() {
        counts[2] = alive.length + born.length; drawBars(); busy = false; done = true;
        msg.textContent = `악어 무리·새·작은 포유류처럼 살아남은 생물이 빈자리로 갈라져 퍼졌고, 특히 포유류가 크게 번성했다. 생물 종류는 ${counts[1]}종까지 줄었다가 ${counts[2]}종으로 처음보다 늘었다(이해를 돕기 위한 예).`;
        now.textContent = '«처음으로»를 눌러 다른 세기로도 해 보자'; now.classList.add('done'); now.classList.remove('gone');
      }
    }
    // 끌기
    const toSvg = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
    let grab = null;
    rock.addEventListener('pointerdown', (e) => { if (busy || done) return; grab = toSvg(e); try { rock.setPointerCapture(e.pointerId); } catch { /* 합성 */ } rock.classList.add('drag'); e.stopPropagation(); e.preventDefault(); });
    rock.addEventListener('pointermove', (e) => { if (!grab) return; const p = toSvg(e); setPull(p.x - REST[0], p.y - REST[1]); });
    const release = () => { if (!grab) return; grab = null; rock.classList.remove('drag'); const p = Math.hypot(...pull) / MAXP; if (p > 0.05) fire(p); else setPull(0, 0); };
    rock.addEventListener('pointerup', release); rock.addEventListener('pointercancel', release);
    rock.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') { e.preventDefault(); e.stopPropagation(); const d = Math.min(MAXP, Math.hypot(...pull) + 15); setPull(-d * 0.8, d * 0.6); }
      else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') { e.preventDefault(); e.stopPropagation(); const d = Math.max(0, Math.hypot(...pull) - 15); setPull(-d * 0.8, d * 0.6); }
      else if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); const p = Math.hypot(...pull) / MAXP; if (p > 0.05) fire(p); }
    });
    root.querySelector('.sl-reset').addEventListener('click', reset);
    reset();
    root._sl = { fire(p) { if (busy) return; done = false; const d = p * MAXP; setPull(-d * 0.8, d * 0.6); fire(p); }, reset };
    return {};
  }
  window.SlingWorld = { mount };
})();
