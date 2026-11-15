/* 감염병을 진단하고 추적하는 과학(교과서 130쪽 그림 Ⅲ-1을 다시 그림, 사례 수준).
   장비를 누르면 탁자 위 검체 관이 장비로 들어가고 장비가 돌아가 결과가 나온다(카드에 무엇을 알아내는지·어떤 원리가 쓰였는지).
     자가 진단 도구: 짧은 시간에 C·T 줄로 결과(인체의 방어 작용 원리) · 중합효소연쇄반응 검사: 핵산을 늘려 정확하게
     자동염기순서분석기: 염기순서를 읽어 병원체의 특성(DNA 구조·복제 원리)
   추적 지도(가상 도시): 날짜 막대를 밀면 감염이 장소를 따라 퍼지고, 인공지능이 이은 경로(실선)와 다음에 퍼질 곳 예측(점선)이 그려진다. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const RES = {
    kit: { head: '양성 (C·T 줄 모두)', what: '짧은 시간에, 전문 장비 없이 감염 여부를 확인', how: '인체의 방어 작용과 관련된 원리', fast: 3, acc: 1 },
    pcr: { head: '양성 (핵산이 늘어남)', what: '병원체의 핵산을 여러 번 늘려 적은 양도 찾는다', how: '핵산을 늘리는(증폭) 원리', fast: 1, acc: 3 },
    seq: { head: '염기순서 읽기 완료', what: '병원체의 특성과 변이를 알아낸다 → 백신·치료제 연구', how: 'DNA의 구조와 복제 원리' },
  };
  // 가상 도시의 장소와 전파(날짜)
  const PLACES = [[40, 40, '역'], [170, 34, '시장'], [310, 40, '회사'], [44, 116, '학교'], [176, 112, '병원'], [312, 118, '공원'], [48, 196, '도서관'], [176, 196, '체육관'], [314, 194, '식당']];
  const SPREAD = [[0, 1, 1], [1, 4, 2], [1, 2, 3], [4, 3, 4], [2, 5, 5], [3, 6, 6], [5, 8, 7], [4, 7, 8], [6, 7, 9]];   // [어디서, 어디로, 날짜]

  function mount(root) {
    const stations = Object.fromEntries([...root.querySelectorAll('.dg-st')].map((s) => [s.dataset.k, s]));
    const msg = root.querySelector('.dg-msg');
    const done = new Set();
    function show(k) {
      const r = RES[k], dots = (n) => '●'.repeat(n) + '○'.repeat(3 - n);
      const extra = r.fast ? `<div class="dg-meter"><span>빠르기 <i>${dots(r.fast)}</i></span><span>정확도 <i>${dots(r.acc)}</i></span></div>`
        : `<div class="dg-cmp"><span>기준 병원체 <code>ATGCC<u>G</u>TAAGC</code></span><span>이번 검체 <code>ATGCC<u class="mut">A</u>TAAGC</code></span><small>다른 곳 1곳 → 변이를 찾았다(예시)</small></div>`;
      stations[k].querySelector('.dg-res').innerHTML = `<b>${r.head}</b><span>${r.what}</span><em>쓰인 과학: ${r.how}</em>${extra}`;
      stations[k].classList.add('done'); done.add(k);
      msg.textContent = done.size === 3 ? '세 장비 모두 과학 원리로 만들었다 — 빠른 것, 정확한 것, 특성을 읽는 것' : `${3 - done.size}개 장비가 더 남았다`;
    }
    const run = {
      kit(k) {
        const s = stations[k], drop = s.querySelector('.dg-drop'), t = s.querySelector('.dg-line.t'), c = s.querySelector('.dg-line.c');
        s.classList.add('busy');
        const fin = () => { s.classList.remove('busy'); c.classList.add('on'); t.classList.add('on'); show(k); };
        if (window.gsap && !window.Deck.reduce) gsap.timeline({ onComplete: fin }).fromTo(drop, { y: -30, opacity: 1 }, { y: 62, duration: 0.6, ease: 'power2.in' }).to(drop, { opacity: 0, duration: 0.2 }).to(c, { opacity: 1, duration: 0.4 }).to(t, { opacity: 1, duration: 0.6 });
        else fin();
      },
      pcr(k) {
        const s = stations[k], g = s.querySelector('.dg-pgraph'), led = s.querySelector('.dg-pled');
        s.classList.add('busy'); led.classList.add('blink');
        let n = 0; const iv = setInterval(() => {
          n++; const pts = []; for (let i = 0; i <= n; i++) { const x = 90 + i * 110 / 30, y = 160 - 58 / (1 + Math.exp(-(i - 18) / 2.4)); pts.push(`${x.toFixed(1)} ${y.toFixed(1)}`); }
          g.setAttribute('d', 'M' + pts.join(' L '));
          if (n >= 30) { clearInterval(iv); s.classList.remove('busy'); led.classList.remove('blink'); led.classList.add('on'); show(k); }
        }, window.Deck.reduce ? 0 : 45);
      },
      seq(k) {
        const s = stations[k], b = s.querySelector('.dg-bases'), led = s.querySelector('.dg-sled');
        s.classList.add('busy'); led.classList.add('blink'); b.innerHTML = '';
        const B = 'ATGCCGTAAGCTTGCAATCGGTACGATTGCCA';
        let i = 0; const iv = setInterval(() => {
          b.innerHTML = '';
          const seg = B.slice(i % 16, i % 16 + 9);
          [...seg].forEach((ch, j) => { const t = el('text', { class: `dg-base b-${ch}`, x: 118 + j * 15, y: 64 + (j % 3) * 18 }, b); t.textContent = ch; });
          if (++i > 22) { clearInterval(iv); s.classList.remove('busy'); led.classList.remove('blink'); led.classList.add('on'); show(k); }
        }, window.Deck.reduce ? 0 : 70);
      },
    };
    // 장비를 누르면: 검체 관이 장비 쪽으로 들어가 사라진 뒤 검사가 돌아간다
    const go = (k) => {
      const st = stations[k]; if (!RES[k] || st.classList.contains('busy') || st.classList.contains('done')) return;
      st.classList.add('busy'); const tubeG = st.querySelector('.dg-tubeg');
      const start = () => { st.classList.remove('busy'); run[k](k); };
      if (window.gsap && !window.Deck.reduce) gsap.timeline({ onComplete: start }).to(tubeG, { x: 90, y: -30, duration: 0.45, ease: 'power2.inOut' }).to(tubeG, { opacity: 0, duration: 0.2 });
      else { tubeG.style.opacity = '0'; start(); }
    };
    ['kit', 'pcr', 'seq'].forEach((k) => {
      const art = stations[k].querySelector('.dg-run');
      art.addEventListener('click', () => go(k));
      art.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); go(k); } });
    });

    // 추적 지도
    const map = stations.map, links = map.querySelector('.dg-links'), nodesG = map.querySelector('.dg-nodes'), day = map.querySelector('#dg-day'), dv = map.querySelector('.dg-dv'), mres = map.querySelector('.dg-res');
    const nodes = PLACES.map(([x, y, n]) => { const g = el('g', { class: 'dg-node', transform: `translate(${x} ${y})` }, nodesG); el('circle', { class: 'dg-nr', r: 15 }, g); el('circle', { class: 'dg-nc', r: 9 }, g); el('text', { class: 'dg-nt', y: 30 }, g).textContent = n; return g; });
    const lines = SPREAD.map(([a, b, d]) => ({ d, a, b, e: el('path', { class: 'dg-link', d: `M${PLACES[a][0]} ${PLACES[a][1]} L ${PLACES[b][0]} ${PLACES[b][1]}` }, links) }));
    function paint() {
      const d = Number(day.value), inf = new Set([0]), pred = new Set();
      lines.forEach((l) => { const on = l.d <= d, soon = !on && l.d <= d + 2 && d > 0; l.e.classList.toggle('on', on); l.e.classList.toggle('pred', soon); if (on) inf.add(l.b); });
      lines.forEach((l) => { if (!inf.has(l.b) && l.d <= d + 2 && d > 0 && inf.has(l.a)) pred.add(l.b); });
      nodes.forEach((n, i) => { n.classList.toggle('inf', inf.has(i)); n.classList.toggle('pred', pred.has(i)); });
      dv.textContent = `${d + 1}일`;
      mres.innerHTML = d === 0 ? '<span>첫 환자가 «역»에서 확인됐다. 날짜를 밀어 보자</span>' : `<b>감염 장소 ${inf.size}곳</b><span>이동 기록을 분석해 경로를 잇고(실선), 다음에 퍼질 곳 ${pred.size}곳을 예측(점선)</span><em>쓰인 과학: 정보 통신·인공지능</em>`;
    }
    day.addEventListener('input', paint); day.addEventListener('keydown', (e) => e.stopPropagation());
    paint();
    root._diag = { all: () => ['kit', 'pcr', 'seq'].forEach((k, i) => setTimeout(() => go(k), i * 300)), day: (d) => { day.value = String(d); paint(); } };
    return {};
  }
  window.DiagTrace = { mount };
})();
