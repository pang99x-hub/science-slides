/* 완화와 적응(교과서 88쪽 그림 Ⅱ-15, 89쪽 해 보기): 바닷가 도시(SVG)와 한 줄 예산 띠.
   예산 띠의 경계 셋을 끌어(경계를 누른 뒤 ←·→ 키도) 네 대책에 나눠 준다:
     완화 — 태양광 등 에너지 기술(sol), 이산화 탄소 포집·저장(ccs) / 적응 — 그늘막·도심 습지 공원(shd), 도시 농업 등 식량 대책(farm)
   도시에 그만큼 지어지고, 두 계기가 따로 움직인다:
     앞으로의 온난화 = 1 − 0.8·(1 − e^(−4.5·(0.65·sol + 0.35·ccs)))  ·  지금의 피해 = 1 − 0.8·(1 − e^(−4.5·(0.55·shd + 0.45·farm)))
   한쪽에만 몰아주면 다른 쪽 계기가 그대로 높다 → 둘 다 필요. 식과 값은 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const K = ['sol', 'ccs', 'shd', 'farm'];
  const INFO = {
    sol: ['태양광 등 에너지 기술', '완화', '화석 연료 대신 햇빛·바람으로 전기를 만들면 이산화 탄소를 덜 내보낸다.', '이미 널리 쓰이고 값이 내려가고 있어 타당성이 높다. 날씨에 따라 발전량이 달라 저장 장치가 함께 필요하다.'],
    ccs: ['이산화 탄소 포집·저장', '완화', '공장·발전소에서 나오는 이산화 탄소를 모아 땅속이나 바다 밑에 가둬 대기로 가지 않게 한다.', '배출을 바로 줄일 수 있지만 비용이 크고, 새지 않게 오래 관리해야 한다.'],
    shd: ['그늘막·도심 습지 공원', '적응', '그늘은 햇빛을 막고, 습지와 나무는 물이 증발하며 열을 빼앗아 도시를 식힌다. 큰비 때 물을 머금는다.', '비용이 적고 바로 효과가 있지만, 온난화 자체를 멈추지는 못한다.'],
    farm: ['도시 농업 등 식량 대책', '적응', '재배지가 바뀌어도 가까운 곳에서 식량을 얻고, 기후에 맞는 작물로 바꾼다.', '식량 위기에 대비할 수 있지만 도시에서 기를 수 있는 양에 한계가 있다.'],
  };

  function mount(root) {
    const svg = root.querySelector('.ad-svg'), bar = root.querySelector('.ad-bar'), info = root.querySelector('.ad-info'), now = root.querySelector('.ad-now');
    const mMit = root.querySelector('.ad-m[data-k="mit"]'), mAd = root.querySelector('.ad-m[data-k="ad"]');
    // 도시
    el('rect', { x: 0, y: 0, width: 1000, height: 300, class: 'ad-sky' }, svg);
    const sun = el('circle', { cx: 900, cy: 70, r: 42, class: 'ad-sun' }, svg);
    const haze = el('rect', { x: 0, y: 150, width: 1000, height: 230, class: 'ad-haze' }, svg);
    el('rect', { x: 0, y: 380, width: 1000, height: 260, class: 'ad-ground' }, svg);
    el('path', { d: 'M0 520 C 200 500, 380 560, 560 540 S 860 500, 1000 530 V 700 H 0 Z', class: 'ad-sea' }, svg);
    el('rect', { x: 0, y: 440, width: 1000, height: 22, class: 'ad-road' }, svg);
    // 건물
    const bld = [[60, 230, 90, 150, '#c9d6e3'], [170, 200, 70, 180, '#e3d6c4'], [520, 250, 80, 130, '#d6e3c9'], [610, 190, 70, 190, '#c9d6e3']].map(([x, y, w, h, c]) => { const g = el('g', {}, svg); el('rect', { x, y, width: w, height: h, fill: c, class: 'ad-bld' }, g); for (let r = y + 16; r < y + h - 20; r += 30) for (let q = x + 12; q < x + w - 14; q += 24) el('rect', { x: q, y: r, width: 12, height: 14, class: 'ad-win' }, g); return { g, x, y, w }; });
    // 공장과 연기
    el('rect', { x: 800, y: 300, width: 140, height: 80, class: 'ad-fac' }, svg);
    el('rect', { x: 900, y: 210, width: 24, height: 90, class: 'ad-fac' }, svg);
    const smoke = Array.from({ length: 7 }, (_, i) => ({ c: el('circle', { cx: 912, cy: 200, r: 12, class: 'ad-smoke' }, svg), u: i / 7 }));
    // 태양광(바다 위)·탄소 포집 배관과 시추대
    const panels = Array.from({ length: 12 }, (_, i) => { const p = el('rect', { x: 90 + (i % 6) * 62, y: 560 + Math.floor(i / 6) * 34, width: 54, height: 26, rx: 3, class: 'ad-pv', transform: 'skewX(-20)' }, svg); return p; });
    const ccs = el('g', { class: 'ad-ccs' }, svg);
    el('path', { d: 'M930 380 V 470 H 740 V 560', class: 'ad-pipe' }, ccs);
    const pipeFlow = el('path', { d: 'M930 380 V 470 H 740 V 560', class: 'ad-pflow' }, ccs);
    el('path', { d: 'M705 560 h 70 l -10 -40 h -50 z', class: 'ad-rig' }, ccs); el('path', { d: 'M740 520 v 100', class: 'ad-drill' }, ccs);
    // 그늘막·나무·습지
    const shades = [300, 380, 450].map((x) => { const g = el('g', { class: 'ad-shade' }, svg); el('path', { d: `M${x - 34} 400 L ${x} 376 L ${x + 34} 400 Z`, class: 'ad-tent' }, g); el('path', { d: `M${x} 376 V 438`, class: 'ad-pole' }, g); return g; });
    const trees = [270, 330, 410, 480, 250, 500].map((x, i) => { const g = el('g', { class: 'ad-tree' }, svg); el('rect', { x: x - 4, y: 412 - (i > 3 ? 20 : 0), width: 8, height: 24, class: 'ad-trunk' }, g); el('circle', { cx: x, cy: 404 - (i > 3 ? 20 : 0), r: 16, class: 'ad-leaf' }, g); return g; });
    const wet = el('ellipse', { cx: 380, cy: 488, rx: 110, ry: 18, class: 'ad-wet' }, svg);
    // 옥상 농장
    const farms = bld.map((b) => { const g = el('g', { class: 'ad-farm' }, svg); for (let q = b.x + 8; q < b.x + b.w - 8; q += 14) el('circle', { cx: q, cy: b.y - 7, r: 7 }, g); return g; });
    // 더위에 지친 사람들
    const people = [340, 420].map((x) => { const g = el('g', {}, svg); el('circle', { cx: x, cy: 420, r: 8, class: 'ad-head' }, g); el('path', { d: `M${x} 428 v 18`, class: 'ad-body' }, g); const sw = el('path', { d: `M${x + 13} 404 q 5 8 0 11 q -5 -3 0 -11`, class: 'ad-sweat' }, g); return { g, sw }; });
    void people;
    // 예산 띠
    let cuts = [60, 90, 95];
    const segs = K.map((k) => { const d = document.createElement('div'); d.className = `ad-seg ${k}`; d.dataset.k = k; d.tabIndex = -1; bar.appendChild(d); d.addEventListener('click', () => show(k)); return d; });
    const hands = [0, 1, 2].map((i) => { const h = document.createElement('button'); h.type = 'button'; h.className = 'ad-hand'; h.setAttribute('aria-label', `예산 경계 ${i + 1}(←·→로 옮기기)`); bar.appendChild(h); return h; });
    const share = () => { const c = [0, ...cuts, 100]; return Object.fromEntries(K.map((k, i) => [k, (c[i + 1] - c[i]) / 100])); };
    function paint() {
      const c = [0, ...cuts, 100];
      segs.forEach((d, i) => { d.style.left = c[i] + '%'; d.style.width = (c[i + 1] - c[i]) + '%'; d.textContent = c[i + 1] - c[i] >= 9 ? `${INFO[K[i]][0].split(' ')[0]} ${Math.round(c[i + 1] - c[i])}` : ''; });
      hands.forEach((h, i) => { h.style.left = cuts[i] + '%'; });
      const S = share();
      const mit = 1 - 0.8 * (1 - Math.exp(-4.5 * (0.65 * S.sol + 0.35 * S.ccs)));
      const ad = 1 - 0.8 * (1 - Math.exp(-4.5 * (0.55 * S.shd + 0.45 * S.farm)));
      panels.forEach((p, i) => p.style.opacity = i < Math.round(S.sol * 24) ? 1 : 0.08);
      ccs.style.opacity = 0.15 + 0.85 * clamp(S.ccs * 3, 0, 1); pipeFlow.style.animationDuration = (2.2 - 1.6 * clamp(S.ccs * 2.5, 0, 1)) + 's';
      shades.forEach((g, i) => g.style.opacity = i < Math.round(S.shd * 8) ? 1 : 0.1);
      trees.forEach((g, i) => g.style.opacity = i < Math.round(S.shd * 14) ? 1 : 0.1);
      wet.style.opacity = clamp(S.shd * 3, 0.05, 1);
      farms.forEach((g, i) => g.style.opacity = i < Math.round(S.farm * 10) ? 1 : 0.05);
      haze.style.opacity = (0.15 + 0.55 * ad).toFixed(2);
      sun.setAttribute('r', (32 + 26 * mit).toFixed(1));
      people.forEach((p) => p.sw.style.opacity = ad > 0.5 ? 1 : 0);
      [[mMit, mit], [mAd, ad]].forEach(([m, v]) => { m.querySelector('i').style.backgroundSize = `${(v * 100).toFixed(0)}% 100%`; m.querySelector('b').textContent = v > 0.66 ? '높음' : v >= 0.5 ? '중간' : '낮음'; m.classList.toggle('hi', v > 0.66); });
      root._adState = { mit, ad, S };
      now.textContent = mit > 0.6 && ad < 0.45 ? '지금 피해는 줄었지만 온난화는 계속된다' : ad > 0.6 && mit < 0.45 ? '배출은 줄었지만 지금의 더위·식량 피해에는 무방비' : mit < 0.5 && ad < 0.5 ? '두 계기가 모두 낮다 · 완화와 적응을 함께!' : '경계를 끌어 예산을 나눠 보자';
      now.classList.toggle('done', mit < 0.5 && ad < 0.5);
    }
    function show(k) {
      const [name, kind, how, ok] = INFO[k];
      info.innerHTML = `<b>${name}</b><span class="ad-kind ${kind === '완화' ? 'mit' : 'ad'}">${kind}</span><p><em>과학적 원리</em> ${how}</p><p><em>타당성</em> ${ok}</p>`;
      segs.forEach((d) => d.classList.toggle('on', d.dataset.k === k));
    }
    hands.forEach((h, i) => {
      let on = false;
      const setX = (e) => { const r = bar.getBoundingClientRect(); const v = clamp((e.clientX - r.left) / r.width * 100, 0, 100); cuts[i] = clamp(v, i ? cuts[i - 1] : 0, i < 2 ? cuts[i + 1] : 100); paint(); };
      h.addEventListener('pointerdown', (e) => { on = true; e.stopPropagation(); try { h.setPointerCapture(e.pointerId); } catch { /* 합성 */ } h.classList.add('drag'); });
      h.addEventListener('pointermove', (e) => { if (on) setX(e); });
      const up = () => { on = false; h.classList.remove('drag'); };
      h.addEventListener('pointerup', up); h.addEventListener('pointercancel', up);
      h.addEventListener('keydown', (e) => { const d = { ArrowLeft: -5, ArrowRight: 5 }[e.key]; if (d) { e.preventDefault(); e.stopPropagation(); cuts[i] = clamp(cuts[i] + d, i ? cuts[i - 1] : 0, i < 2 ? cuts[i + 1] : 100); paint(); } });
    });
    let tm = 0, active = false, raf = 0, last = 0;
    function tick(t) {
      raf = 0; if (!active) return; const dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t; tm += dt;
      const S = share(), k = 1 - clamp(S.ccs * 2.5, 0, 0.9);
      smoke.forEach((p) => { p.u = (p.u + dt * 0.3) % 1; p.c.setAttribute('cy', (200 - p.u * 140).toFixed(1)); p.c.setAttribute('cx', (912 - p.u * 50).toFixed(1)); p.c.setAttribute('r', (10 + p.u * 22).toFixed(1)); p.c.style.opacity = ((1 - p.u) * k).toFixed(2); });
      raf = requestAnimationFrame(tick);
    }
    paint(); show('sol');
    root._ad = { set(c) { cuts = c.slice(); paint(); }, show };
    return { setActive(on) { active = on && !window.Stage.reduce; if (active && !raf) { last = performance.now(); raf = requestAnimationFrame(tick); } if (!active && raf) { cancelAnimationFrame(raf); raf = 0; } } };
  }
  window.Adapt = { mount };
})();
