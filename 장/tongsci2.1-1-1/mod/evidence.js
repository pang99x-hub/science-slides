/* 4차시 탐구(교과서 18~19쪽): 대멸종 가설 셋(운석(소행성) 충돌설·화산 폭발설·수륙 분포 변화설)의 판 위에 증거 카드를 놓아 타당성 바늘을 움직인다.
   고생대 말 / 중생대 말을 바꿔 따진다. 그 가설을 받치는 증거면 바늘이 오르고 판 그림이 원인을 보여 준다.
   시기가 다른 증거, 원인을 보여 주지 못하는 증거는 바늘을 움직이지 못한다. 바늘 높이는 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const D = (s) => (window.Deck && window.Deck.reduce ? 0 : s);
  const EV = { p: '고생대 말', k: '중생대 말' };
  const HYP = {
    rock: { name: '운석(소행성) 충돌설', mech: '충돌로 날린 먼지가 햇빛을 가려 기온이 내려가고 식물의 광합성이 줄었다.' },
    volc: { name: '화산 폭발설', mech: '화산 가스로 산성비가 내리고 온난화가 심해져 바닷물이 뜨거워졌다.' },
    land: { name: '수륙 분포 변화설', mech: '대륙이 모이며 얕은 바다가 줄고 기후대가 바뀌어 살 곳이 사라졌다.' },
    anox: { name: '해양 무산소화설', mech: '해류 순환이 멈추고 큰 적조가 번져 바닷물 속 산소가 급격히 줄었다.' },
  };
  const CARD = {
    ir: { ev: 'k', hyp: 'rock', name: '중생대 말 지층의 이리듐', desc: '중생대와 신생대 경계에 쌓인 얇은 지층에서 이리듐이 유난히 많이 나온다. 이리듐은 지구 표면에는 드물고 운석에는 많은 원소다.' },
    crater: { ev: 'k', hyp: 'rock', name: '유카탄 반도의 운석 구덩이', desc: '멕시코 유카탄 반도 땅속에 아주 큰 운석 구덩이가 묻혀 있고, 생긴 때가 중생대 말과 맞는다.' },
    sib: { ev: 'p', hyp: 'volc', name: '시베리아 대규모 용암층', desc: '시베리아의 넓은 땅을 두꺼운 용암층이 덮고 있다. 고생대 말에 약 100만 년에 걸쳐 화산 활동이 이어진 것으로 본다.' },
    deccan: { ev: 'k', hyp: 'volc', name: '데칸 고원 용암 대지', desc: '인도 데칸 고원에는 용암이 겹겹이 쌓인 넓은 대지가 있다. 중생대 말 무렵 큰 화산 활동이 있었다는 흔적이다.' },
    pangaea: { ev: 'p', hyp: 'land', name: '판게아와 줄어든 얕은 바다', desc: '고생대 말 대륙들이 모여 초대륙 판게아가 되자 대륙 가장자리의 얕은 바다가 크게 줄고 기후가 차가워졌다.' },
    warm: { ev: 'p', hyp: 'volc', name: '갑자기 데워진 바닷물', desc: '고생대 말 지층에 바닷물이 짧은 시간에 크게 데워진 흔적이 남아 있다. 화산 가스가 온실 효과를 키운 결과로 본다.' },
    anoxfe: { ev: 'p', hyp: 'anox', name: '산화되지 않은 철·유기물 지층', desc: '고생대 말 바다 지층에 산화되지 않은 철과 썩지 않은 유기물이 많다. 바닥의 물에 산소가 거의 없었다는 흔적이다.' },
    nodino: { ev: 'k', hyp: 'none', name: '경계 위로 사라진 공룡 화석', desc: '경계 지층 아래에서는 공룡 화석이 나오지만 그 위로는 나오지 않는다. 공룡이 언제 사라졌는지를 알려 준다.' },
  };
  const NEED = { p: ['sib', 'warm', 'pangaea', 'anoxfe'], k: ['ir', 'crater', 'deccan'] };
  const CON = {
    p: '고생대 말: 시베리아 용암층과 데워진 바닷물은 화산 폭발설을, 판게아 형성은 수륙 분포 변화설을, 산소 없이 쌓인 지층은 해양 무산소화설을 받친다. 여러 원인이 겹쳐 가장 큰 대멸종이 되었다고 본다.',
    k: '중생대 말: 이리듐 층과 큰 운석 구덩이가 운석 충돌설을 가장 강하게 받친다. 같은 무렵 인도의 용암 대지도 있어 화산 폭발이 함께 영향을 주었다고 보는 과학자도 있다.',
  };
  const jong = (w) => (w.charCodeAt(w.length - 1) - 0xac00) % 28 > 0, eul = (w) => w + (jong(w) ? '을' : '를'), eun = (w) => w + (jong(w) ? '은' : '는');
  const BW = 336, GAP = 10, H = 600, SC = (1056 - GAP * 5) / 4 / BW;   // 판 넷을 한 줄에(판 안 좌표는 336 너비로 그리고 줄인다)

  function board(svg, k, i) {
    const x = GAP + i * (BW * SC + GAP);
    const g = el('g', { class: 'ev-board', 'data-k': k, transform: `translate(${x} 42) scale(${SC})`, tabindex: '0', role: 'button', 'aria-label': HYP[k].name + ' 판' }, svg);
    el('rect', { class: 'ev-bbg', x: 0, y: 8, width: BW, height: H - 16, rx: 14 }, g);
    el('text', { class: 'ev-bt', x: BW / 2, y: 46 }, g).textContent = HYP[k].name;
    const cp = el('clipPath', { id: 'ev-clip-' + k }, g); el('rect', { x: 0, y: 0, width: BW - 32, height: 250, rx: 8 }, cp);
    const art0 = el('g', { class: 'ev-art', transform: 'translate(16 62)' }, g);
    const art = el('g', { 'clip-path': `url(#ev-clip-${k})` }, art0);
    el('rect', { class: 'ev-sky', x: 0, y: 0, width: BW - 32, height: 250, rx: 8 }, art);
    el('rect', { class: 'ev-frame', x: 0, y: 0, width: BW - 32, height: 250, rx: 8 }, art0);
    const sun = el('g', { class: 'ev-sun' }, art); el('circle', { cx: 236, cy: 52, r: 26 }, sun);
    const dim = el('rect', { class: 'ev-dim', x: 0, y: 0, width: BW - 32, height: 250, rx: 8, opacity: 0 }, art);
    const o = { g, x, art, sun, dim };
    // 시기별 땅(고생대 말: 양치식물·삼엽충 / 중생대 말: 공룡·겉씨식물)
    o.world = el('g', { class: 'ev-world' }, art);
    if (k === 'rock') {
      o.dust = el('g', { class: 'ev-dust', opacity: 0 }, art);
      [[200, 60, 90, 34], [120, 46, 80, 28], [250, 90, 70, 30], [60, 70, 70, 24]].forEach(([cx, cy, rx, ry]) => el('ellipse', { cx, cy, rx, ry }, o.dust));
      o.rock = el('g', { class: 'ev-rock', opacity: 0 }, art);
      el('path', { class: 'ev-trail', d: 'M-40 -30 L 0 0' }, o.rock); el('circle', { r: 13 }, o.rock);
      o.crater = el('ellipse', { class: 'ev-crater', cx: 150, cy: 206, rx: 0, ry: 0 }, art);
    }
    if (k === 'volc') {
      o.plume = el('g', { class: 'ev-plume', opacity: 0 }, art);
      [[150, 70, 46], [110, 52, 34], [196, 48, 38], [150, 30, 30]].forEach(([cx, cy, r]) => el('circle', { cx, cy, r }, o.plume));
      o.rain = el('g', { class: 'ev-rain', opacity: 0 }, art);
      for (let j = 0; j < 9; j++) el('path', { d: `M${30 + j * 30} ${96 + (j % 3) * 10} l -8 22` }, o.rain);
      const v = el('g', { class: 'ev-volc' }, art);
      el('path', { class: 'ev-cone', d: 'M70 210 L 132 118 H 168 L 230 210 Z' }, v);
      o.lava = el('path', { class: 'ev-lava', d: 'M136 120 C 140 150, 120 170, 112 206 M 162 120 C 164 160, 186 176, 196 206', opacity: 0 }, v);
      o.hot = el('text', { class: 'ev-hot', x: 270, y: 238, opacity: 0, 'text-anchor': 'end' }, art); o.hot.textContent = '수온 ↑';
    }
    if (k === 'land') {
      el('rect', { class: 'ev-sea', x: 0, y: 0, width: BW - 32, height: 250, rx: 8 }, art);
      o.map = el('g', { class: 'ev-map' }, art);
      const blobs = [['M0 -30 C 30 -36, 44 -6, 30 18 C 16 36, -26 30, -30 6 C -34 -14, -20 -26, 0 -30 Z', 70, 70], ['M0 -24 C 26 -28, 34 0, 22 20 C 8 34, -24 26, -26 4 C -28 -14, -16 -22, 0 -24 Z', 220, 66], ['M0 -26 C 24 -30, 36 -4, 26 18 C 12 34, -22 30, -28 8 C -32 -12, -18 -24, 0 -26 Z', 90, 186], ['M0 -22 C 22 -26, 32 -2, 22 16 C 10 30, -20 26, -24 6 C -28 -10, -16 -20, 0 -22 Z', 220, 184]];
      o.cont = blobs.map(([d, cx, cy]) => { const c = el('g', { transform: `translate(${cx} ${cy})` }, o.map); el('path', { class: 'ev-shelf', d, transform: 'scale(1.45)' }, c); el('path', { class: 'ev-land', d }, c); return { c, cx, cy }; });
      o.shelfT = el('text', { class: 'ev-cap', x: 152, y: 242 }, art); o.shelfT.textContent = '옅은 파랑: 얕은 바다';
    }
    if (k === 'anox') {
      el('rect', { class: 'ev-sea2', x: 0, y: 0, width: BW - 32, height: 250 }, art);
      el('rect', { class: 'ev-air', x: 0, y: 0, width: BW - 32, height: 46 }, art);
      o.bottom = el('rect', { class: 'ev-anox', x: 0, y: 120, width: BW - 32, height: 130, opacity: 0 }, art);
      o.flow = el('path', { class: 'ev-flow', d: 'M30 80 C 90 60, 210 60, 270 90 C 290 140, 260 200, 200 210 C 120 220, 50 200, 30 150 Z' }, art);
      o.tide = el('ellipse', { class: 'ev-tide', cx: 150, cy: 50, rx: 0, ry: 8 }, art);
      o.fishes = [[90, 110], [190, 150], [130, 190]].map(([fx, fy]) => { const f = el('g', { class: 'ev-fish', transform: `translate(${fx} ${fy})`, 'data-y': fy, 'data-x': fx }, art); el('ellipse', { rx: 18, ry: 8 }, f); el('path', { d: 'M-16 0 L -28 -9 L -28 9 Z' }, f); return f; });
      el('rect', { class: 'ev-floor', x: 0, y: 226, width: BW - 32, height: 24 }, art);
      o.o2 = el('text', { class: 'ev-cap ev-o2', x: 152, y: 243 }, art); o.o2.textContent = '바닷물의 산소: 넉넉함';
    }
    // 바늘
    const gx = BW / 2, gy = 470, r = 104;
    el('path', { class: 'ev-arc', d: `M${gx - r} ${gy} A ${r} ${r} 0 0 1 ${gx + r} ${gy}` }, g);
    el('path', { class: 'ev-arc2', d: `M${gx + r * Math.cos(Math.PI * 0.25)} ${gy - r * Math.sin(Math.PI * 0.25)} A ${r} ${r} 0 0 1 ${gx + r} ${gy}` }, g);
    el('text', { class: 'ev-gl', x: gx - r, y: gy + 26 }, g).textContent = '약함';
    el('text', { class: 'ev-gl', x: gx + r, y: gy + 26 }, g).textContent = '강함';
    el('text', { class: 'ev-gt', x: gx, y: gy + 30 }, g).textContent = '타당성';
    o.needle = el('g', { class: 'ev-needle' }, g); el('path', { d: `M${gx} ${gy} L ${gx - r + 14} ${gy}` }, o.needle); el('circle', { cx: gx, cy: gy, r: 10 }, o.needle);
    o.gx = gx; o.gy = gy;
    o.list = el('text', { class: 'ev-list', x: BW / 2, y: H - 62 }, g);
    o.hit = el('rect', { class: 'ev-hit', x: 0, y: 8, width: BW, height: H - 16, rx: 14 }, g);
    return o;
  }

  function paintWorld(o, ev) {
    o.world.innerHTML = '';
    const w = o.world;
    if (o.g.dataset.k === 'land' || o.g.dataset.k === 'anox') return;
    el('rect', { class: 'ev-ground', x: 0, y: 200, width: BW - 32, height: 50 }, w);
    if (ev === 'p') {
      el('rect', { class: 'ev-water', x: 0, y: 214, width: 120, height: 36 }, w);
      const tri = el('g', { class: 'ev-tri', transform: 'translate(44 234)' }, w); el('ellipse', { rx: 16, ry: 9 }, tri); el('path', { d: 'M-10 0 H 10 M -6 -7 V 7 M 6 -7 V 7' }, tri);
      [[190, 200], [240, 200], [280, 200]].forEach(([fx, fy]) => { const f = el('g', { class: 'ev-fern', transform: `translate(${fx} ${fy})` }, w); el('path', { d: 'M0 0 C -4 -20, 4 -40, 0 -58 M 0 -12 l -14 -8 M 0 -12 l 14 -8 M 0 -26 l -12 -8 M 0 -26 l 12 -8 M 0 -40 l -9 -7 M 0 -40 l 9 -7' }, f); });
    } else {
      const t = el('g', { class: 'ev-tree', transform: 'translate(262 200)' }, w); el('path', { d: 'M0 0 V -26' }, t); el('path', { class: 'ev-leaf', d: 'M-20 -22 L 0 -70 L 20 -22 Z' }, t);
      const d = el('g', { class: 'ev-dino', transform: 'translate(96 200)' }, w);
      el('path', { d: 'M-46 -18 C -40 -40, 10 -44, 22 -26 C 30 -40, 34 -66, 48 -70 C 56 -72, 58 -64, 50 -62 C 40 -58, 38 -36, 34 -20 C 30 -10, 10 -8, -4 -10 C -20 -10, -40 -6, -60 -10 C -50 -12, -48 -14, -46 -18 Z M -30 -12 V 0 M -14 -12 V 0 M 8 -12 V 0 M 22 -14 V 0' }, d);
    }
  }

  function mount(root) {
    const svg = root.querySelector('.ev-svg'), now = root.querySelector('.ev-now'), msg = root.querySelector('.ev-msg'), desc = root.querySelector('.ev-desc');
    const crit = [...root.querySelectorAll('.ev-crit li')], segBtns = [...root.querySelectorAll('.ev-seg button')];
    const cards = [...root.querySelectorAll('.ev-card')];
    const B = {}; ['rock', 'volc', 'land', 'anox'].forEach((k, i) => { B[k] = board(svg, k, i); });
    const state = { p: { placed: [], lv: { rock: 0, volc: 0, land: 0, anox: 0 } }, k: { placed: [], lv: { rock: 0, volc: 0, land: 0, anox: 0 } } };
    let ev = 'p';

    function needle(o, lv, instant) {
      const a = Math.min(1, lv / 2) * 180;
      const sv = (o.g.dataset.k === 'rock' || o.g.dataset.k === 'land' || o.g.dataset.k === 'volc');
      if (window.gsap) gsap.to(o.needle, { rotation: a, svgOrigin: `${o.gx} ${o.gy}`, duration: instant ? 0 : D(0.8), ease: 'elastic.out(1, 0.5)', overwrite: true });
      void sv;
    }
    function art(o, lv, instant) {
      const k = o.g.dataset.k, on = lv > 0, d = instant ? 0 : D(0.9);
      const to = (t, v) => { if (window.gsap) gsap.to(t, Object.assign({ duration: d, overwrite: true }, v)); else Object.entries(v).forEach(([a, b]) => t.setAttribute(a, b)); };
      if (k === 'rock') {
        to(o.dust, { opacity: on ? Math.min(0.92, 0.5 + lv * 0.22) : 0 });
        to(o.dim, { opacity: on ? 0.38 : 0 });
        to(o.crater, { attr: { rx: on ? 46 : 0, ry: on ? 9 : 0 } });
      }
      if (k === 'volc') { to(o.plume, { opacity: on ? 0.9 : 0 }); to(o.lava, { opacity: on ? 1 : 0 }); to(o.rain, { opacity: on ? 1 : 0 }); to(o.hot, { opacity: on ? 1 : 0 }); to(o.dim, { opacity: on ? 0.22 : 0 }); }
      if (k === 'anox') {
        to(o.bottom, { opacity: on ? 0.85 : 0 }); to(o.flow, { opacity: on ? 0 : 0.7 }); to(o.tide, { attr: { rx: on ? 120 : 0 } });
        o.fishes.forEach((f, j) => { const fx = +f.dataset.x, fy = +f.dataset.y; if (window.gsap) gsap.to(f, { attr: { transform: on ? `translate(${fx} ${56 + j * 6}) rotate(180)` : `translate(${fx} ${fy})` }, duration: d * 1.4, overwrite: true }); });
        o.o2.textContent = on ? '바닷물의 산소: 거의 없음' : '바닷물의 산소: 넉넉함';
      }
      if (k === 'land') {
        const join = on;
        o.cont.forEach(({ c, cx, cy }) => { const tx = join ? 150 + (cx - 150) * 0.42 : cx, ty = join ? 126 + (cy - 126) * 0.5 : cy; if (window.gsap) gsap.to(c, { attr: { transform: `translate(${tx} ${ty})` }, duration: d * 1.4, ease: 'power2.inOut', overwrite: true }); else c.setAttribute('transform', `translate(${tx} ${ty})`); });
        o.shelfT.textContent = join ? '모이자 얕은 바다가 줄었다' : '옅은 파랑: 얕은 바다';
      }
    }
    function fall(o) {
      if (!window.gsap || D(1) === 0) return;
      gsap.fromTo(o.rock, { opacity: 1, attr: { transform: 'translate(10 -10)' } }, { attr: { transform: 'translate(150 204)' }, duration: 0.7, ease: 'power2.in', onComplete: () => { gsap.to(o.rock, { opacity: 0, duration: 0.2 }); gsap.fromTo(o.art, { x: -6 }, { x: 0, duration: 0.4, ease: 'elastic.out(1, 0.3)' }); } });
    }
    function render(instant) {
      const s = state[ev];
      Object.entries(B).forEach(([k, o]) => {
        paintWorld(o, ev); needle(o, s.lv[k], instant); art(o, s.lv[k], instant);
        o.list.textContent = '';
        s.placed.filter((c) => CARD[c].hyp === k).forEach((c, j) => { el('tspan', { x: BW / 2, dy: j ? 26 : 0 }, o.list).textContent = '✓ ' + CARD[c].name; });
      });
      cards.forEach((c) => c.classList.toggle('used', s.placed.includes(c.dataset.k)));
      cards.forEach((c) => c.classList.toggle('other', c.dataset.ev !== ev));
      const sup = s.placed.filter((c) => CARD[c].hyp !== 'none').length;
      const all = NEED[ev].every((c) => s.placed.includes(c));
      [sup >= 1, sup >= 2, all].forEach((v, i) => crit[i].classList.toggle('on', v));
      segBtns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === ev)));
      root.querySelector('.ev-stage').dataset.ev = ev;
      return all;
    }
    function say(t, kind) { msg.textContent = t; msg.className = 'u-msg ev-msg' + (kind ? ' ' + kind : ''); }
    function drop(ck, hk) {
      const c = CARD[ck], h = HYP[hk], s = state[ev], cardEl = cards.find((x) => x.dataset.k === ck);
      desc.textContent = c.desc;
      const bad = () => { if (cardEl) { cardEl.classList.remove('bad'); void cardEl.offsetWidth; cardEl.classList.add('bad'); } };
      if (s.placed.includes(ck)) { say('이미 올린 증거다.'); return; }
      if (c.ev !== ev) { bad(); say(c.hyp === 'none' ? `«${c.name}»${jong(c.name) ? '은' : '는'} ${EV[c.ev]} 일이다. 지금 따지는 것은 ${EV[ev]} 대멸종이다.` : `«${c.name}»${jong(c.name) ? '은' : '는'} ${HYP[c.hyp].name}의 증거가 맞다. 다만 ${EV[c.ev]} 대멸종의 증거라서, 지금 따지는 ${EV[ev]}과 시기가 다르다 → 위에서 «${EV[c.ev]} 대멸종»을 골라 놓아 보자.`, 'no'); return; }
      if (c.hyp === 'none') { bad(); say('공룡이 «언제» 사라졌는지는 알려 주지만 «왜» 사라졌는지는 말해 주지 않는다 → 어느 가설의 무게도 되지 못한다.', 'no'); return; }
      if (c.hyp !== hk) { bad(); say(`«${c.name}»${jong(c.name) ? '은' : '는'} ${h.name}의 원인을 보여 주지 못한다.`, 'no'); return; }
      s.placed.push(ck); s.lv[hk] += 1;
      const all = render();
      if (hk === 'rock') fall(B.rock);
      say(`${eun(c.name)} ${eul(h.name)} 받친다. ${h.mech}` + (all ? ' ' + CON[ev] : ''), 'ok');
      now.textContent = all ? `${EV[ev]} 증거를 다 올렸다! 다른 시기도 따져 보자` : '좋아! 다른 카드도 올려 보자';
      now.classList.toggle('done', all);
    }
    const picker = window.Drag.cards(cards, {
      find: (e) => e.closest && e.closest('.ev-board'),
      hover: (t) => Object.values(B).forEach((o) => o.g.classList.toggle('target', o.g === t)),
      pick: (c) => { svg.classList.toggle('picking', !!c); if (c) desc.textContent = CARD[c.dataset.k].desc; },
      drop: (c, t) => { if (t) drop(c.dataset.k, t.dataset.k); else desc.textContent = CARD[c.dataset.k].desc; },
    });
    Object.values(B).forEach((o) => {
      const go = () => { const c = picker.picked; if (c) { picker.unpick(); drop(c.dataset.k, o.g.dataset.k); } };
      o.g.addEventListener('click', go);
      o.g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); go(); } });
    });
    function setEv(k) { ev = k; render(true); say(`${EV[k]} 대멸종을 따진다. 카드의 시기부터 확인하자.`); now.textContent = '카드를 알맞은 가설 판에 끌어 놓자'; now.classList.remove('done'); }
    segBtns.forEach((b) => b.addEventListener('click', () => setEv(b.dataset.k)));
    render(true);
    root._ev = { event: setEv, drop };
    return {};
  }
  window.Evidence = { mount };
})();
