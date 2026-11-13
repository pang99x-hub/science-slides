/* 2·3·4차시 설명 장의 조작 그림(1차시 teach1.js와 같은 방식: 그림을 조작하면 풀이가 함께 바뀐다).
   T2.steps(root)    시간 막대 단계 그림: .st-im 그림 여러 장 + .st-range 막대 + .st-pills 단추(data-n 이름, data-d 풀이) → .st-tag/.st-name/.st-d
   T2.gal(root, sel) 작은 사진을 누르면 크게(.gl-big img · .gl-name · .gl-d · .gl-cr), 단추에 data-name·data-d·data-cr
   T2.tour(root)     2차시 «시대 탐험기»: 시대 단추 → 풍경(EraArt)·수륙 분포 지구 그림·다섯 칸·화석 사진이 함께 바뀐다
   T2.lineage(root)  2차시 «생물이 나타난 차례»: 시간 표시를 끌면 그때 살던 무리가 켜지고, 무리를 누르면 풀이
   T2.watch(root, fn) 장 안의 변화(글자·class)를 지켜보다 fn() — 체험 장의 해 볼 일 ①②③을 맞춘다
   시험용: root._st.set(k) · root._tr.era(k) / photo(i) · root._ln.age(억 년) / pick(k) */
(function () {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const svgPt = (svg, e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
  function drag(el, svg, on) {
    let id = null;
    el.addEventListener('pointerdown', (e) => { id = e.pointerId; try { el.setPointerCapture(id); } catch { /* 합성 */ } on(svgPt(svg, e)); e.preventDefault(); });
    el.addEventListener('pointermove', (e) => { if (e.pointerId === id) on(svgPt(svg, e)); });
    const up = (e) => { if (e.pointerId === id) id = null; };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  }
  const keys = (el, fn) => el.addEventListener('keydown', (e) => {
    const m = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: 1, ArrowDown: -1 }[e.key];
    if (m) { e.preventDefault(); e.stopPropagation(); fn(m); }
  });

  // ---------- 시간 막대 단계 그림 ----------
  function steps(root, sel = '') {
    const box = sel ? root.querySelector(sel) : root;
    const ims = [...box.querySelectorAll('.st-im')], range = box.querySelector('.st-range'), pills = [...box.querySelectorAll('.st-pills button')];
    const tag = root.querySelector(box.dataset.out ? box.dataset.out + ' .st-tag' : '.st-tag'), nm = root.querySelector(box.dataset.out ? box.dataset.out + ' .st-name' : '.st-name'), d = root.querySelector(box.dataset.out ? box.dataset.out + ' .st-d' : '.st-d');
    const N = pills.length;
    let cur = -1;
    function set(v, snap) {
      v = clamp(v, 0, N - 1); if (snap) v = Math.round(v);
      range.value = String(v);
      ims.forEach((im, k) => { im.style.opacity = String(clamp(1 - Math.abs(v - k), 0, 1)); });
      const k = Math.round(v);
      pills.forEach((b, i) => { b.setAttribute('aria-pressed', String(i === k)); b.classList.toggle('past', i < k); });
      if (k !== cur) { cur = k; if (tag) tag.textContent = `${k + 1}단계 / ${N}`; nm.innerHTML = pills[k].dataset.n || pills[k].innerHTML; d.innerHTML = pills[k].dataset.d; root.dispatchEvent(new CustomEvent('st-step', { detail: k })); }
    }
    range.max = String(N - 1);
    range.addEventListener('input', () => set(+range.value));
    range.addEventListener('change', () => set(+range.value, true));
    keys(range, (dx) => set(Math.round(+range.value) + dx, true));
    pills.forEach((b, i) => b.addEventListener('click', () => set(i, true)));
    set(0, true);
    const api = { set: (k) => set(k, true), get k() { return cur; }, reset() { cur = -1; set(0, true); } };
    if (!sel) root._st = api; else (root._sts = root._sts || {})[sel] = api;
    return {};
  }

  // ---------- 사진 고르기 ----------
  function gal(root, sel = '.gl') {
    const g = root.querySelector(sel), big = g.querySelector('.gl-big img'), name = g.querySelector('.gl-name'), d = g.querySelector('.gl-d'), cr = g.querySelector('.gl-cr');
    const btns = [...g.querySelectorAll('.gl-thumbs button')];
    function pick(b) {
      btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      const im = b.querySelector('img'); big.src = im.src; big.alt = im.alt;
      if (name) name.textContent = b.dataset.name; if (d) d.innerHTML = b.dataset.d; if (cr) cr.textContent = '사진: ' + b.dataset.cr;
    }
    btns.forEach((b) => b.addEventListener('click', () => pick(b)));
    pick(btns[0]);
    (root._gl = root._gl || {})[sel] = { pick: (i) => pick(btns[i]) };
    return {};
  }

  // ---------- 2차시 시대 탐험기 ----------
  // 다섯 칸: 기후 · 땅과 바다 · 바다 생물 · 육지 생물 · 끝날 때(신생대는 «지금»)
  const TOUR = {
    pc: { span: '약 46억 년 전 ~ 5억 3900만 년 전 · 전체의 88.2 %',
      rows: ['대체로 따뜻했고, 빙하기가 몇 번 있었던 것으로 본다.', '오랜 세월 휘고 깨진 지층뿐이라 대륙 모습을 <b>알기 어렵다</b>.',
        '<b>남세균</b>이 광합성으로 산소를 내놓았고, 그 흔적이 <b>스트로마톨라이트</b>다. 끝 무렵 첫 <b>다세포 생물</b>(에디아카라 생물군).',
        '생물이 없었다. 강한 <b>자외선</b>이 그대로 내리쬐었다.', '바다와 공기에 쌓인 <b>산소</b>가 다음 시대 생물이 늘어날 바탕이 되었다.'],
      endT: '흐름' },
    pz: { span: '약 5억 3900만 년 전 ~ 2억 5200만 년 전 · 6.3 %',
      rows: ['대체로 따뜻하다가 <b>말기에 추워졌다</b>(남쪽 대륙에 빙하).', '흩어진 대륙이 차츰 모여 말기에 초대륙 <b>판게아</b>가 되었다.',
        '껍데기·뼈가 단단한 생물이 크게 늘었다: <b>삼엽충</b>·완족류, 이어서 <b>어류</b>.', '<b>오존층</b>이 자외선을 막자 뭍으로 올라왔다: <b>양치식물</b> 숲, <b>양서류</b>, 거대 곤충.',
        '판게아가 생기고 기후가 추워지는 등 환경이 급히 바뀌어 삼엽충을 비롯한 매우 많은 생물이 사라졌다(가장 큰 대멸종).'] },
    mz: { span: '약 2억 5200만 년 전 ~ 6600만 년 전 · 4.1 %',
      rows: ['빙하기 없이 <b>따뜻했다</b>. 화산이 내뿜은 이산화 탄소가 온실 효과를 키웠다.', '판게아가 <b>갈라지며</b> 대서양이 열리기 시작했고, 사는 곳이 여러 갈래로 나뉘었다.',
        '<b>암모나이트</b>, 어룡 같은 해양 파충류.', '<b>공룡</b>, 은행나무 같은 <b>겉씨식물</b>, 새의 조상인 시조새.', '환경이 갑자기 바뀌어 <b>공룡과 암모나이트</b>가 사라졌다.'] },
    cz: { span: '약 6600만 년 전 ~ 지금 · 1.4 %',
      rows: ['중기까지 따뜻하다가 점점 서늘해져, 말기에 <b>빙하기와 간빙기</b>가 되풀이되었다.', '대서양이 더 넓어지고 인도가 아시아에 부딪쳐 <b>히말라야산맥</b>이 솟았다. 지금과 비슷해졌다.',
        '<b>화폐석</b>이 번성했다.', '매머드 같은 <b>포유류</b>, 꽃이 피는 <b>속씨식물</b>. 끝 무렵 <b>인류의 조상</b>이 나타났다.', '우리가 사는 시대. 지금도 이어지고 있다.'],
      endT: '지금' },
  };
  function tour(root) {
    const svg = root.querySelector('.tr-svg'), btns = [...root.querySelectorAll('.tr-eras button')], tag = root.querySelector('.tr-tag'), span = root.querySelector('.tr-span');
    const rows = [...root.querySelectorAll('.tr-rows dd')], endT = root.querySelector('.tr-end'), map = root.querySelector('.tr-map'), thumbs = root.querySelector('.tr-thumbs');
    const store = root.querySelector('.tr-store'), big = root.querySelector('.tr-big');
    let cur = null;
    function photo(i) {
      const b = thumbs.querySelectorAll('button')[i]; if (!b) return;
      thumbs.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      const im = store.querySelector(`img[data-i="${b.dataset.i}"]`);
      big.querySelector('img').src = im.src; big.querySelector('img').alt = im.alt;
      big.querySelector('b').textContent = im.dataset.name; big.querySelector('p').innerHTML = im.dataset.d; big.querySelector('.cr').textContent = '사진: ' + im.dataset.cr;
      big.hidden = false;
    }
    function era(k) {
      cur = k; const D = TOUR[k], name = btns.find((b) => b.dataset.k === k).dataset.name;
      btns.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === k)));
      root.dataset.era = k;
      svg.innerHTML = window.EraArt.scene(k, 'tr');
      tag.textContent = name; span.textContent = D.span;
      rows.forEach((dd, i) => { dd.innerHTML = D.rows[i]; });
      endT.textContent = D.endT || '끝날 때';
      const mi = map.querySelector(`img[data-k="${k}"]`);
      map.querySelectorAll('img').forEach((x) => { x.hidden = x !== mi; });
      map.querySelector('.tr-nomap').hidden = !!mi;
      const ims = [...store.querySelectorAll(`img[data-era="${k}"]`)];
      thumbs.innerHTML = ims.map((im) => `<button type="button" aria-pressed="false" data-i="${im.dataset.i}"><img src="${im.src}" alt=""><span>${im.dataset.name}</span></button>`).join('');
      thumbs.querySelectorAll('button').forEach((b, i) => b.addEventListener('click', () => (b.getAttribute('aria-pressed') === 'true' ? close() : photo(i))));
      close();
    }
    function close() { big.hidden = true; thumbs.querySelectorAll('button').forEach((x) => x.setAttribute('aria-pressed', 'false')); }
    big.querySelector('.tr-close').addEventListener('click', close);
    btns.forEach((b) => b.addEventListener('click', () => era(b.dataset.k)));
    store.querySelectorAll('img').forEach((im, i) => { im.dataset.i = i; });
    era('pc');
    root._tr = { era, photo, close };
    return {};
  }

  // ---------- 2차시 생물이 나타난 차례 ----------
  // 처음 나타난 때(억 년 전)와 번성한 시대는 이해를 돕기 위한 예(교과서는 시대만 말한다)
  const LIN = [
    { k: 'fish', g: 'ani', n: '어류', a: 5.0, boom: [4.3, 2.52], d: '물속에서 아가미로 숨 쉬는 척추동물. 고생대 바다에서 번성했다(갑주어).', when: '고생대 초에 나타나 고생대 바다에서 번성' },
    { k: 'amph', g: 'ani', n: '양서류', a: 3.7, boom: [3.6, 2.52], d: '어릴 때는 물에서, 자라서는 물과 뭍을 오간다. 뭍에 처음 오른 척추동물 무리.', when: '고생대 중기에 나타나 고생대 뭍에서 번성' },
    { k: 'rept', g: 'ani', n: '파충류', a: 3.1, boom: [2.52, 0.66], d: '껍데기 있는 알을 낳아 물을 떠나 살 수 있었다. 공룡도 파충류다.', when: '고생대 말에 나타나 중생대에 번성(공룡)' },
    { k: 'bird', g: 'ani', n: '조류', a: 1.5, boom: [0.66, 0], d: '깃털과 날개가 있다. 시조새는 새와 파충류의 특징을 함께 지녔다.', when: '중생대에 나타나(시조새) 신생대에 번성' },
    { k: 'mamm', g: 'ani', n: '포유류', a: 2.2, boom: [0.66, 0], d: '새끼를 젖으로 기르고 털이 있다. 공룡이 사라진 뒤 빈자리를 채웠다.', when: '중생대에 작게 나타나 신생대에 번성(매머드)' },
    { k: 'fern', g: 'pl', n: '양치식물', a: 4.2, boom: [3.8, 2.52], d: '씨 없이 홀씨로 퍼진다. 고생대 늪가에 큰 숲을 이루어 석탄층이 되었다.', when: '고생대에 뭍으로 올라 고생대에 번성' },
    { k: 'gymn', g: 'pl', n: '겉씨식물', a: 3.6, boom: [2.52, 0.66], d: '씨가 열매에 싸이지 않고 겉으로 드러난다(은행나무·소나무).', when: '고생대 말에 나타나 중생대에 번성' },
    { k: 'angi', g: 'pl', n: '속씨식물', a: 1.3, boom: [0.66, 0], d: '꽃이 피고 씨가 열매 속에 싸인다. 지금 들판의 풀과 나무 대부분.', when: '중생대에 나타나 신생대에 번성' },
  ];
  // 가로축: 5.39 → 0억 년. 시대 칸 너비는 읽기 좋게 고생대 45 %·중생대 33 %·신생대 22 %로 둔다
  const X0 = 230, X1 = 1180;
  const KN = [[5.39, 0], [2.52, 0.45], [0.66, 0.78], [0, 1]];
  const xOf = (a) => { a = clamp(a, 0, 5.39); for (let i = 0; i < 3; i++) if (a >= KN[i + 1][0]) return X0 + (X1 - X0) * (KN[i][1] + (KN[i][0] - a) / (KN[i][0] - KN[i + 1][0]) * (KN[i + 1][1] - KN[i][1])); return X1; };
  const aOf = (x) => { const u = clamp((x - X0) / (X1 - X0), 0, 1); for (let i = 0; i < 3; i++) if (u <= KN[i + 1][1]) return KN[i][0] - (u - KN[i][1]) / (KN[i + 1][1] - KN[i][1]) * (KN[i][0] - KN[i + 1][0]); return 0; };
  const ERA = (a) => (a > 2.52 ? '고생대' : a > 0.66 ? '중생대' : '신생대');
  const fmt = (a) => (a >= 1 ? `약 ${a.toFixed(1)}억 년 전` : a > 0.01 ? `약 ${Math.round(a * 10000).toLocaleString('ko-KR')}만 년 전` : '지금');
  function lineage(root) {
    const svg = root.querySelector('.ln-svg'), NS = 'http://www.w3.org/2000/svg';
    const el = (t, a, p) => { const e = document.createElementNS(NS, t); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); (p || svg).appendChild(e); return e; };
    const read = root.querySelector('.ln-read'), card = { n: root.querySelector('.ln-n'), w: root.querySelector('.ln-w'), d: root.querySelector('.ln-d'), box: root.querySelector('.ln-card') };
    // 시대 띠
    [['고생대', 5.39, 2.52, '#e3ecf8'], ['중생대', 2.52, 0.66, '#e2f2e6'], ['신생대', 0.66, 0, '#fbf0d8']].forEach(([n, s, e, c]) => {
      el('rect', { x: xOf(s), y: 30, width: xOf(e) - xOf(s), height: 600, fill: c });
      const t = el('text', { x: (xOf(s) + xOf(e)) / 2, y: 62, class: 'ln-era' }); t.textContent = n;
    });
    [5.39, 2.52, 0.66, 0].forEach((a) => { el('line', { x1: xOf(a), x2: xOf(a), y1: 30, y2: 640, class: 'ln-grid' }); const t = el('text', { x: xOf(a), y: 676, class: 'ln-tick' }); t.textContent = a ? a + '억 년 전' : '지금'; });
    const gl = el('text', { x: 20, y: 120, class: 'ln-grp' }); gl.textContent = '척추동물';
    const gp = el('text', { x: 20, y: 452, class: 'ln-grp' }); gp.textContent = '식물';
    const rowY = (i) => (i < 5 ? 110 + i * 62 : 140 + i * 62);
    const R = LIN.map((L, i) => {
      const y = rowY(i), g = el('g', { class: 'ln-row', 'data-k': L.k, tabindex: 0, role: 'button', 'aria-label': `${L.n}: ${L.when}` });
      el('rect', { x: 12, y: y - 26, width: X1 - 4, height: 52, class: 'ln-hit' }, g);
      const t = el('text', { x: 214, y: y + 9, class: 'ln-name' }, g); t.textContent = L.n;
      el('line', { x1: xOf(L.a), x2: X1, y1: y, y2: y, class: 'ln-life ' + L.g }, g);
      el('line', { x1: xOf(L.boom[0]), x2: xOf(L.boom[1]), y1: y, y2: y, class: 'ln-boom ' + L.g }, g);
      el('circle', { cx: xOf(L.a), cy: y, r: 11, class: 'ln-start ' + L.g }, g);
      g.addEventListener('click', () => pick(L.k));
      g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); pick(L.k); } });
      return { L, g };
    });
    // 끄는 시간 표시
    const mk = el('g', { class: 'ln-mk', tabindex: 0, role: 'slider', 'aria-label': '시간 표시: 끌거나 화살표 키로 옮긴다' });
    el('line', { x1: 0, x2: 0, y1: 30, y2: 640, class: 'ln-mline' }, mk);
    el('path', { d: 'M-16 4 H16 L0 28 Z', class: 'ln-mtri' }, mk);
    let age = 4.0, sel = null;
    function setAge(a) {
      age = clamp(a, 0, 5.39); mk.setAttribute('transform', `translate(${xOf(age)} 0)`);
      const alive = R.filter((r) => r.L.a >= age), boom = R.filter((r) => age <= r.L.boom[0] && age >= r.L.boom[1]);
      R.forEach((r) => { r.g.classList.toggle('alive', r.L.a >= age); r.g.classList.toggle('booming', boom.includes(r)); });
      read.innerHTML = `<b>${fmt(age)}</b> · ${ERA(age)} — 살던 무리: ${alive.length ? alive.map((r) => (boom.includes(r) ? `<b>${r.L.n}</b>` : r.L.n)).join(' · ') : '아직 없음'}`;
      mk.setAttribute('aria-valuetext', `${fmt(age)}, ${ERA(age)}`);
    }
    function pick(k) {
      sel = k; const L = LIN.find((x) => x.k === k);
      R.forEach((r) => r.g.classList.toggle('sel', r.L.k === k));
      card.n.textContent = L.n; card.w.textContent = L.when; card.d.textContent = L.d; card.box.classList.add('on');
      setAge(L.a - 0.02);
    }
    drag(svg, svg, (p) => { if (p.x >= X0 - 10) setAge(aOf(p.x)); });
    keys(mk, (d) => setAge(aOf(xOf(age) + d * 20)));
    setAge(age);
    root._ln = { age: setAge, pick };
    return {};
  }

  // ---------- 체험 장: 변화를 지켜보기 ----------
  function watch(root, fn) {
    let q = 0;
    const run = () => { q = 0; fn(); };
    new MutationObserver(() => { if (!q) q = requestAnimationFrame(run); }).observe(root, { subtree: true, childList: true, attributes: true, characterData: true, attributeFilter: ['class', 'aria-pressed', 'hidden'] });
    fn();
  }

  window.T2 = { steps, gal, tour, lineage, watch, xOf, aOf };
})();
