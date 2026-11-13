/* 3차시 설명·체험 조각.
   T3.effect(root)  5장 «대륙이 움직이면 생물도»: 막대를 끌면 대륙 조각이 흩어짐 ↔ 하나로 모임. 얕은 바다(하늘색 띠)·안쪽 사막·해류 고리가 함께 바뀌고
                    오른쪽 막대 넷(해안선 길이·얕은 바다 넓이·기후의 다양함·바다 생물 종류)과 풀이가 바뀐다. 막대 높이는 이해를 돕기 위한 예.
   T3.match(root)   6장 «이 지구는 언제일까?»: 3D 지구 그림 셋을 시대 칸에 끌어 놓거나(누르고 칸 누르기) → 맞으면 근거 한 줄, 다 맞으면 물음 하나.
   시험용: root._ef.set(0~1) · root._mt.put(그림 k, 칸 k) · root._mt.ask(v) */
(function () {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (svg) => (t, a = {}, p) => { const e = document.createElementNS(NS, t); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); (p || svg).appendChild(e); return e; };

  // ---------- 5장 ----------
  // 대륙 조각: 흩어진 자리 → 모인 자리(중심 기준), 모양은 둥근 덩어리
  const BL = [
    { a: [170, 150], b: [380, 210], r: [92, 70], rot: -10 },
    { a: [560, 120], b: [500, 205], r: [100, 64], rot: 8 },
    { a: [250, 390], b: [395, 330], r: [78, 96], rot: 14 },
    { a: [600, 400], b: [512, 335], r: [96, 76], rot: -6 },
    { a: [420, 250], b: [450, 270], r: [54, 46], rot: 0 },
  ];
  const blob = (cx, cy, rx, ry, rot, k) => {
    let d = ''; for (let i = 0; i <= 24; i++) { const a = i / 24 * Math.PI * 2, w = 1 + 0.12 * Math.sin(a * 3 + k) + 0.07 * Math.sin(a * 5 + k * 2); const x = Math.cos(a) * rx * w, y = Math.sin(a) * ry * w; const c = Math.cos(rot * Math.PI / 180), s = Math.sin(rot * Math.PI / 180); d += (i ? 'L' : 'M') + (cx + x * c - y * s).toFixed(1) + ' ' + (cy + x * s + y * c).toFixed(1); }
    return d + 'Z';
  };
  const SAY = [
    [0.34, '대륙이 <b>흩어져</b> 있다. 해안선이 길고 둘레마다 <b>얕은 바다</b>가 넓다. 해류가 여러 갈래로 흘러 기후도 여러 가지다 → 사는 곳이 다양해 생물이 많다.'],
    [0.7, '대륙이 서로 다가가 맞붙기 시작한다. 맞닿은 곳의 얕은 바다가 사라지고, 부딪친 자리에 산맥이 솟는다.'],
    [2, '하나로 <b>모였다</b>(초대륙). 해안선이 짧아져 <b>얕은 바다</b>가 줄고, 안쪽은 바다에서 멀어 <b>메마른 땅</b>이 된다. 해류·기후가 단순해져 사는 곳이 줄어 → <b>멸종</b>이 늘었다(고생대 말).'],
  ];
  function effect(root) {
    const svg = root.querySelector('.ef-svg'), el = mk(svg), range = root.querySelector('.ef-range'), say = root.querySelector('.ef-say');
    const bars = [...root.querySelectorAll('.ef-bars i')], btns = [...root.querySelectorAll('.ef-go')];
    el('rect', { x: 0, y: 0, width: 800, height: 520, rx: 16, class: 'ef-ocean' });
    // 해류: 흩어졌을 때 작은 고리 여럿, 모였을 때 큰 고리 하나
    const many = el('g', { class: 'ef-cur' }), one = el('g', { class: 'ef-cur' });
    [[110, 270, 70, 50], [700, 260, 70, 60], [410, 80, 120, 34], [430, 470, 140, 34]].forEach(([x, y, rx, ry]) => { el('ellipse', { cx: x, cy: y, rx, ry, class: 'ef-loop' }, many); el('path', { d: `M${x + rx - 8} ${y - 10} l 8 10 l 10 -6`, class: 'ef-head' }, many); });
    el('ellipse', { cx: 450, cy: 270, rx: 330, ry: 225, class: 'ef-loop' }, one); el('path', { d: 'M772 260 l 8 12 l 10 -8', class: 'ef-head' }, one);
    const shelfG = el('g'), landG = el('g');
    const shelves = BL.map(() => el('path', { class: 'ef-shelf' }, shelfG)), lands = BL.map(() => el('path', { class: 'ef-land' }, landG));
    const desert = el('ellipse', { cx: 450, cy: 272, rx: 110, ry: 70, class: 'ef-desert' });
    const dLab = el('text', { x: 450, y: 280, class: 'ef-tlab' }); dLab.textContent = '메마른 안쪽';
    const mtn = el('g', { class: 'ef-mtn' });
    for (let i = 0; i < 6; i++) el('path', { d: `M${420 + i * 16} 238 l 10 -22 l 10 22 Z` }, mtn);
    const sLab = el('text', { x: 120, y: 90, class: 'ef-tlab ef-shlab' }); sLab.textContent = '얕은 바다';
    let t = 0;
    function set(v) {
      t = clamp(v, 0, 1); range.value = String(Math.round(t * 100));
      BL.forEach((b, i) => {
        const x = b.a[0] + (b.b[0] - b.a[0]) * t, y = b.a[1] + (b.b[1] - b.a[1]) * t;
        lands[i].setAttribute('d', blob(x, y, b.r[0], b.r[1], b.rot, i));
        const sh = 26 * (1 - 0.75 * t);
        shelves[i].setAttribute('d', blob(x, y, b.r[0] + sh, b.r[1] + sh, b.rot, i));
      });
      desert.setAttribute('opacity', String(clamp((t - 0.55) / 0.35, 0, 1) * 0.95)); dLab.setAttribute('opacity', String(clamp((t - 0.7) / 0.2, 0, 1)));
      mtn.setAttribute('opacity', String(clamp((t - 0.45) / 0.3, 0, 1)));
      many.setAttribute('opacity', String(1 - t)); one.setAttribute('opacity', String(t));
      sLab.setAttribute('opacity', String(1 - t * 0.8));
      const v4 = [1 - 0.6 * t, 1 - 0.72 * t, 1 - 0.55 * t, 1 - 0.6 * t];
      bars.forEach((b, i) => { b.style.width = (v4[i] * 100).toFixed(0) + '%'; });
      say.innerHTML = SAY.find(([a]) => t < a)[1];
      btns.forEach((b) => b.setAttribute('aria-pressed', String(Math.abs(+b.dataset.t - t) < 0.02)));
    }
    range.addEventListener('input', () => set(+range.value / 100));
    range.addEventListener('keydown', (e) => e.stopPropagation());
    btns.forEach((b) => b.addEventListener('click', () => {
      const to = +b.dataset.t, from = t;
      if (window.gsap) { const o = { v: from }; window.gsap.to(o, { v: to, duration: 1.2, ease: 'power2.inOut', onUpdate: () => set(o.v) }); } else set(to);
    }));
    set(0);
    root._ef = { set };
    return {};
  }

  // ---------- 6장 ----------
  const WHY = {
    pz: '대륙이 하나로 모인 <b>판게아</b> → 고생대 말',
    mz: '판게아가 갈라져 <b>대서양이 좁게</b> 열리는 중 → 중생대',
    cz: '대서양이 넓고 인도가 아시아에 붙음(<b>히말라야</b>) → 신생대',
  };
  function match(root) {
    const cards = [...root.querySelectorAll('.mt-card')], slots = [...root.querySelectorAll('.mt-slot')], msg = root.querySelector('.mt-msg');
    const ask = [...root.querySelectorAll('.mt-ask button')], askBox = root.querySelector('.mt-ask');
    const place = {}; let pick = null, asked = null;
    function render() {
      slots.forEach((s) => {
        const k = Object.keys(place).find((c) => place[c] === s.dataset.k), box = s.querySelector('.mt-in');
        box.innerHTML = ''; s.classList.toggle('ok', k === s.dataset.k); s.classList.toggle('bad', !!k && k !== s.dataset.k);
        if (k) { const im = cards.find((c) => c.dataset.k === k).querySelector('img').cloneNode(); box.appendChild(im); }
        s.querySelector('.mt-why').innerHTML = k === s.dataset.k ? WHY[k] : k ? '이 시대의 지구가 아니다 — 대서양과 대륙의 붙은 모양을 다시 보자' : '';
      });
      cards.forEach((c) => { c.classList.toggle('used', !!place[c.dataset.k]); c.setAttribute('aria-pressed', String(pick === c.dataset.k)); });
      const right = Object.keys(place).filter((k) => place[k] === k).length;
      root.dataset.right = right; askBox.hidden = right < 3;
      ask.forEach((b) => { b.setAttribute('aria-pressed', String(asked === b.dataset.v)); b.classList.toggle('right', asked && b.dataset.v === 'wide'); });
      msg.innerHTML = right < 3 ? (pick ? '이제 놓을 시대 칸을 누르자' : `맞게 놓은 그림 ${right} / 3`) : !asked ? '세 그림을 차례로 보면 대서양은 어떻게 되었나?' : asked === 'wide' ? '맞다! 대서양은 판게아가 갈라진 뒤 <b>점점 넓어졌다</b>. 지금도 해마다 조금씩 넓어진다.' : '다시 보자: 고생대 말에는 대서양이 없었고, 중생대에 좁게 열려 신생대에 넓어졌다.';
      msg.classList.toggle('bad', asked && asked !== 'wide');
    }
    function put(k, slot) { Object.keys(place).forEach((c) => { if (place[c] === slot) delete place[c]; }); place[k] = slot; pick = null; render(); }
    cards.forEach((c) => {
      c.addEventListener('click', () => { if (c.classList.contains('dragged')) { c.classList.remove('dragged'); return; } pick = pick === c.dataset.k ? null : c.dataset.k; render(); });
      // 끌어 놓기
      let id = null, x0 = 0, y0 = 0;
      c.addEventListener('pointerdown', (e) => { id = e.pointerId; x0 = e.clientX; y0 = e.clientY; try { c.setPointerCapture(id); } catch { /* 합성 */ } });
      c.addEventListener('pointermove', (e) => { if (e.pointerId !== id) return; const k = c.getBoundingClientRect().width / (c.offsetWidth || 1); c.style.transform = `translate(${(e.clientX - x0) / k}px, ${(e.clientY - y0) / k}px)`; c.classList.add('drag'); });
      const up = (e) => {
        if (e.pointerId !== id) return; id = null; const moved = Math.hypot(e.clientX - x0, e.clientY - y0) > 8;
        c.style.transform = ''; c.classList.remove('drag');
        if (moved) { c.classList.add('dragged'); c.style.visibility = 'hidden'; const t = document.elementFromPoint(e.clientX, e.clientY); c.style.visibility = ''; const s = t && t.closest('.mt-slot'); if (s) put(c.dataset.k, s.dataset.k); setTimeout(() => c.classList.remove('dragged'), 50); }
      };
      c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
    });
    slots.forEach((s) => s.addEventListener('click', () => { if (pick) put(pick, s.dataset.k); }));
    ask.forEach((b) => b.addEventListener('click', () => { asked = b.dataset.v; render(); }));
    root.querySelector('.mt-reset').addEventListener('click', () => { Object.keys(place).forEach((k) => delete place[k]); pick = null; asked = null; render(); });
    render();
    root._mt = { put, ask: (v) => { asked = v; render(); }, get right() { return +root.dataset.right; }, get asked() { return asked; } };
    return {};
  }
  window.T3 = { effect, match };
})();
