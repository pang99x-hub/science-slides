/* 1차시 설명 장의 조작 그림(2026-10-30 선생님 요청 «구조·원리는 조작하며 이해, 한 줄씩 나오기는 자제»).
   T1.gallery(root)   2장 화석의 예: 작은 사진을 누르면 크게 보이고 이름·몸/흔적·한 줄 풀이·출처가 바뀐다
   T1.form(root)      3장 화석이 만들어지는 과정: 시간 막대를 끌면 단면 그림 다섯 장이 이어지며 바뀌고, 지금 단계의 풀이가 나온다
   T1.kinds(root)     5장 생존 기간 × 분포 면적: 점을 끌거나 생물을 고르면 «시상 / 표준 / 어느 쪽도 어려움»과 그 까닭이 바뀐다
   T1.eras(root)      8장 지질 시대의 구분: 경계선을 층 사이로 옮기기 · 46억 년 막대 위 표시를 끌면 시대·하루 시계 시각이 바뀐다
   T1.sum(root)       10장 정리: 칸을 누르면 그 칸만 또렷하게
   시험용: root._gv.pick(i) · root._fm.set(단계 0~4) · root._kd.pick(k) / set(u, w) · root._er.cut(0~2) / age(억 년) */
(function () {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const svgPt = (svg, e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
  // 끌기: 누른 곳부터 바로 따라온다(손가락·마우스·펜)
  function drag(el, svg, on) {
    let id = null;
    el.addEventListener('pointerdown', (e) => { id = e.pointerId; try { el.setPointerCapture(id); } catch { /* 합성 이벤트 */ } on(svgPt(svg, e)); e.preventDefault(); });
    el.addEventListener('pointermove', (e) => { if (e.pointerId === id) on(svgPt(svg, e)); });
    const up = (e) => { if (e.pointerId === id) id = null; };
    el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
  }
  const keys = (el, fn) => el.addEventListener('keydown', (e) => {
    const m = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[e.key];
    if (m) { e.preventDefault(); e.stopPropagation(); fn(m[0], m[1]); }
  });

  // ---------- 2장: 화석 사진 보기 ----------
  function gallery(root) {
    const big = root.querySelector('.gv-img'), name = root.querySelector('.gv-name'), kind = root.querySelector('.gv-kind');
    const desc = root.querySelector('.gv-d'), cr = root.querySelector('.gv-cr');
    const btns = [...root.querySelectorAll('.gv-thumbs button')];
    const KIND = { body: '몸(유해)', trace: '흔적', etc: '그 밖에' };
    function pick(b) {
      btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      const im = b.querySelector('img');
      big.src = im.src; big.alt = im.alt;
      name.textContent = b.dataset.name; kind.textContent = KIND[b.dataset.kind]; kind.className = 'chip gv-kind ' + b.dataset.kind;
      desc.textContent = b.dataset.d; cr.textContent = '사진: ' + b.dataset.cr;
    }
    btns.forEach((b) => b.addEventListener('click', () => pick(b)));
    pick(btns[0]);
    root._gv = { pick: (i) => pick(btns[i]) };
    return {};
  }

  // ---------- 3장: 시간 막대로 보는 화석의 생성 ----------
  const FORM = [
    { n: '죽음', d: '바다에 살던 조개가 죽어 바닥에 놓인다. 그대로 두면 썩거나 다른 동물에게 먹히고, 물결에 부서진다.' },
    { n: '빨리 묻힘', d: '진흙·모래가 <b>금세 덮는다</b>. 덮여야 산소와 청소 동물이 닿지 않아 모양이 지켜진다.' },
    { n: '쌓여 굳음', d: '그 위로 층이 겹겹이 쌓이고 눌려 <b>퇴적암</b>이 된다. 묻힌 껍데기도 오랜 세월 성분이 바뀌어 돌처럼 된다.' },
    { n: '솟아오름 <small>융기</small>', d: '땅이 밀려 올라와 바다 밑에서 쌓인 지층이 물 위로 나와 <b>육지</b>가 된다.' },
    { n: '깎여 드러남 <small>침식</small>', d: '비·바람·흐르는 물이 위층을 깎아 내면 묻혀 있던 화석이 <b>땅 위로</b> 드러나 사람에게 발견된다.' },
  ];
  function form(root) {
    const ims = [...root.querySelectorAll('.fm-im')], range = root.querySelector('.fm-range'), pills = [...root.querySelectorAll('.fm-pills button')];
    const tag = root.querySelector('.fm-tag'), nm = root.querySelector('.fm-name'), d = root.querySelector('.fm-d');
    let cur = -1;
    function set(v, snap) {
      v = clamp(v, 0, 4); if (snap) v = Math.round(v);
      range.value = String(v);
      ims.forEach((im, k) => { im.style.opacity = String(clamp(1 - Math.abs(v - k), 0, 1)); });
      const k = Math.round(v);
      pills.forEach((b, i) => { b.setAttribute('aria-pressed', String(i === k)); b.classList.toggle('past', i < k); });
      if (k !== cur) { cur = k; tag.textContent = `${k + 1}단계 / 5`; nm.innerHTML = FORM[k].n; d.innerHTML = FORM[k].d; }
    }
    range.addEventListener('input', () => set(+range.value));
    range.addEventListener('change', () => set(+range.value, true));
    keys(range, (dx, dy) => set(Math.round(+range.value) + (dx || dy), true));
    pills.forEach((b, i) => b.addEventListener('click', () => set(i, true)));
    set(0, true);
    root._fm = { set: (k) => set(k, true) };
    return {};
  }

  // ---------- 5장: 생존 기간 × 분포 면적 ----------
  // u = 생존 기간(0 짧다 ~ 1 길다), w = 분포 면적(0 좁다 ~ 1 넓다). 생물 자리는 이해를 돕기 위한 예
  const ORG = {
    fern: { n: '고사리', u: 0.582, w: 0.08, t: '따뜻하고 습한 <b>육지</b>에서 쌓인 지층' },
    coral: { n: '산호', u: 0.582, w: 0.2, t: '따뜻하고 얕은 <b>바다</b>에서 쌓인 지층' },
    clam: { n: '조개', u: 0.582, w: 0.32, t: '얕은 바다·<b>갯벌</b>에서 쌓인 지층' },
    tri: { n: '삼엽충', u: 0.093, w: 0.895, t: '<b>고생대</b>에 쌓인 지층' },
    amm: { n: '암모나이트', u: 0.093, w: 0.77, t: '<b>중생대</b>에 쌓인 지층' },
    num: { n: '화폐석', u: 0.093, w: 0.645, t: '<b>신생대</b>에 쌓인 지층' },
  };
  const VERDICT = {
    env: { tag: '시상 화석', why: '<b>오래</b> 살아남았고, <b>특정한 환경</b>(좁은 곳)에서만 산다.', tell: '오늘날 사는 곳을 보고 지층이 쌓일 때의 <b>환경</b>을 알아낸다.' },
    std: { tag: '표준 화석', why: '<b>짧은 기간</b>만 살았고, <b>넓은 지역</b>에 퍼져 살았다.', tell: '여러 곳의 지층에서 함께 나와 지층이 쌓인 <b>시기</b>를 알려 준다.' },
    lw: { tag: '어느 쪽으로도 쓰기 어렵다', why: '오래 살았고, 어디에나 퍼져 살았다.', tell: '언제인지도, 어떤 곳인지도 좁혀 주지 못한다.' },
    sn: { tag: '어느 쪽으로도 쓰기 어렵다', why: '짧게 살았고, 좁은 곳에만 있었다.', tell: '다른 지역에서 찾기 어려워 지층끼리 견주기 힘들다.' },
  };
  function kinds(root) {
    const svg = root.querySelector('.kg'), pt = svg.querySelector('.kg-pt');
    const X0 = 90, X1 = 540, Y0 = 420, Y1 = 20;
    const card = root.querySelector('.kres'), tag = card.querySelector('.kres-tag'), why = card.querySelector('.kres-why'), tell = card.querySelector('.kres-tell');
    const img = card.querySelector('.kres-img'), nm = card.querySelector('.kres-name'), org = card.querySelector('.kres-org'), cr = card.querySelector('.kres-cr');
    const chips = [...root.querySelectorAll('.kg-chips button')], store = root.querySelector('.kres-store');
    const quads = { env: svg.querySelector('.q-env'), std: svg.querySelector('.q-std'), lw: svg.querySelector('.q-lw'), sn: svg.querySelector('.q-sn') };
    let u = 0, w = 0;
    function set(nu, nw, k) {
      u = clamp(nu, 0, 1); w = clamp(nw, 0, 1);
      if (!k) k = Object.keys(ORG).find((o) => Math.hypot(ORG[o].u - u, ORG[o].w - w) < 0.07);
      if (k) { u = ORG[k].u; w = ORG[k].w; }
      pt.setAttribute('transform', `translate(${X0 + u * (X1 - X0)} ${Y0 - w * (Y0 - Y1)})`);
      const q = u >= 0.5 ? (w >= 0.5 ? 'lw' : 'env') : (w >= 0.5 ? 'std' : 'sn');
      Object.entries(quads).forEach(([key, el]) => el.classList.toggle('on', key === q));
      const V = VERDICT[q];
      card.className = 'tcard kres k-' + q;
      tag.textContent = V.tag; why.innerHTML = V.why; tell.innerHTML = '→ ' + V.tell;
      chips.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === k)));
      svg.querySelectorAll('.kg-org').forEach((g) => g.classList.toggle('on', g.dataset.k === k));
      const src = k && store.querySelector(`img[data-k="${k}"]`);
      card.classList.toggle('noimg', !src);
      if (src) { img.src = src.src; img.alt = src.alt; cr.textContent = '사진: ' + src.dataset.cr; nm.textContent = ORG[k].n; org.innerHTML = '화석이 나오면 → ' + ORG[k].t; }
      else { nm.textContent = '이 자리의 생물이라면'; org.textContent = '생물 이름을 누르면 그 자리로 간다'; cr.textContent = ''; }
      pt.setAttribute('aria-valuetext', `생존 기간 ${u < 0.5 ? '짧다' : '길다'}, 분포 면적 ${w < 0.5 ? '좁다' : '넓다'}: ${V.tag}`);
    }
    drag(svg, svg, (p) => set((p.x - X0) / (X1 - X0), (Y0 - p.y) / (Y0 - Y1)));
    keys(pt, (dx, dy) => set(u + dx * 0.06, w + dy * 0.06, null));
    chips.forEach((b) => b.addEventListener('click', () => set(ORG[b.dataset.k].u, ORG[b.dataset.k].w, b.dataset.k)));
    set(ORG.fern.u, ORG.fern.w, 'fern');
    root._kd = { pick: (k) => set(ORG[k].u, ORG[k].w, k), set: (a, b) => set(a, b) };
    return {};
  }

  // ---------- 8장: 시대의 경계 · 46억 년 막대 ----------
  // 막대의 비율은 교과서 값(88.2·6.3·4.1·1.4 %)이고, 그 사이는 고르게 나눠 그린다
  const B = [{ a: 46, f: 0 }, { a: 5.39, f: 0.882 }, { a: 2.52, f: 0.945 }, { a: 0.66, f: 0.986 }, { a: 0, f: 1 }];
  const fOf = (a) => { for (let i = 0; i < 4; i++) if (a >= B[i + 1].a) return B[i].f + (B[i].a - a) / (B[i].a - B[i + 1].a) * (B[i + 1].f - B[i].f); return 1; };
  const aOf = (f) => { for (let i = 0; i < 4; i++) if (f <= B[i + 1].f) return B[i].a - (f - B[i].f) / (B[i + 1].f - B[i].f) * (B[i].a - B[i + 1].a); return 0; };
  const ERA = (a) => (a > 5.39 ? '선캄브리아시대' : a > 2.52 ? '고생대' : a > 0.66 ? '중생대' : '신생대');
  const fmtA = (a) => (a >= 1 ? `약 ${a.toFixed(1)}억 년 전` : a > 0.004 ? `약 ${Math.round(a * 10000).toLocaleString('ko-KR')}만 년 전` : '현재');
  const hm = (f) => { if (f >= 0.9995) return '자정'; const m = Math.min(1439, Math.round(f * 1440)); const h = Math.floor(m / 60), mm = String(m % 60).padStart(2, '0'); return `${h < 12 ? '오전' : h < 18 ? '오후' : '밤'} ${h % 12 || 12}시 ${mm}분`; };
  const SAY = [
    '바뀐 생물이 없다 → 여기는 <b>경계가 아니다</b>.',
    '<b>삼엽충이 사라지고 암모나이트가 나타났다</b> → 생물이 크게 바뀐 곳 = <b>시대의 경계</b>(고생대 | 중생대)',
    '바뀐 생물이 없다 → 여기는 <b>경계가 아니다</b>.',
  ];
  function eras(root) {
    // 경계선 옮기기
    const msvg = root.querySelector('.mini-range svg'), cutg = msvg.querySelector('.mr-cutg'), say = root.querySelector('.mr-say');
    const GAP = [70, 120, 170];
    let gi = 0;
    function cut(i) {
      gi = clamp(i, 0, 2);
      cutg.setAttribute('transform', `translate(0 ${GAP[gi]})`);
      cutg.classList.toggle('hit', gi === 1);
      say.innerHTML = SAY[gi]; say.classList.toggle('hit', gi === 1);
    }
    drag(msvg, msvg, (p) => { let best = 0; GAP.forEach((y, i) => { if (Math.abs(p.y - y) < Math.abs(p.y - GAP[best])) best = i; }); if (best !== gi) cut(best); });
    keys(cutg, (dx, dy) => cut(gi - dy + dx));
    // 46억 년 막대: 위 막대(전체)와 아래 막대(마지막 11.8 %를 늘린 것)
    const esvg = root.querySelector('.era-svg'), mk = esvg.querySelector('.er-mk'), zmk = esvg.querySelector('.er-zmk'), read = root.querySelector('.er-read');
    const hand = root.querySelector('.ck-hand'), dot = root.querySelector('.ck-dot'), W = 820, Z0 = 0.882;
    let age = 1.0;
    function setAge(a) {
      age = clamp(a, 0, 46); const f = fOf(age);
      mk.setAttribute('transform', `translate(${f * W} 0)`);
      zmk.style.display = f >= Z0 ? '' : 'none';
      zmk.setAttribute('transform', `translate(${clamp((f - Z0) / (1 - Z0), 0, 1) * W} 0)`);
      read.innerHTML = `<b>${fmtA(age)}</b> · ${ERA(age)} · 하루로 치면 <b>${hm(f)}</b>`;
      const r = f * 360; hand.setAttribute('transform', `rotate(${r} 110 110)`);
      dot.setAttribute('transform', `rotate(${r} 110 110)`);
      mk.setAttribute('aria-valuetext', `${fmtA(age)}, ${ERA(age)}`);
    }
    drag(esvg, esvg, (p) => {
      const x = clamp(p.x / W, 0, 1);
      setAge(p.y < 112 ? aOf(x) : aOf(Z0 + x * (1 - Z0)));
    });
    keys(mk, (dx, dy) => setAge(aOf(clamp(fOf(age) + (dx || dy) * (fOf(age) >= Z0 ? 0.004 : 0.02), 0, 1))));
    root.querySelectorAll('.er-go').forEach((b) => b.addEventListener('click', () => setAge(+b.dataset.a)));
    cut(0); setAge(age);
    root._er = { cut, age: setAge };
    return {};
  }

  // ---------- 10장: 정리 칸 짚기 ----------
  // 정리: 뒤집기 카드. 앞면 = 번호·제목·물음, 뒷면 = 정리(원래 칸 내용)
  function sum(root) {
    const boxes = [...root.querySelectorAll('.sbox')];
    boxes.forEach((b) => {
      if (b.querySelector('.fc')) return;
      const h3 = b.querySelector('h3');
      const back = document.createElement('div'); back.className = 'fc-face fc-back';
      while (b.firstChild) back.appendChild(b.firstChild);
      const front = document.createElement('div'); front.className = 'fc-face fc-front';
      front.innerHTML = `<h3>${h3.innerHTML}</h3>`;
      const fc = document.createElement('div'); fc.className = 'fc';
      fc.append(front, back); b.append(fc);
      b.classList.add('flip'); b.tabIndex = 0; b.setAttribute('role', 'button'); b.setAttribute('aria-pressed', 'false');
      const turn = () => { const on = !b.classList.contains('flipped'); b.classList.toggle('flipped', on); b.setAttribute('aria-pressed', String(on)); sync(); };
      b.addEventListener('click', turn);
      b.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); turn(); } });
    });
    const head = root.querySelector('.head');
    let all = root.querySelector('.fc-all');
    if (!all) { all = document.createElement('button'); all.type = 'button'; all.className = 'btn fc-all'; head.appendChild(all); }
    function sync() { const n = boxes.filter((b) => b.classList.contains('flipped')).length; all.textContent = n === boxes.length ? '모두 덮기' : '모두 뒤집기'; }
    all.onclick = () => { const open = boxes.some((b) => !b.classList.contains('flipped')); boxes.forEach((b) => { b.classList.toggle('flipped', open); b.setAttribute('aria-pressed', String(open)); }); sync(); };
    sync();
    root._sm = { flip: (i) => boxes[i].click(), all: () => all.click() };
    return {};
  }
  window.T1 = { gallery, form, kinds, eras, sum };
})();
