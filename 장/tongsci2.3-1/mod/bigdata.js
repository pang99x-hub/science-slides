/* 빅데이터의 축적과 활용(교과서 134~135쪽 그림 Ⅲ-2) + 데이터 센터(138쪽 과학 소양). 왼쪽 네 데이터가 디지털로 쌓여 있다.
   «쓰임» 카드를 그 일에 필요한 데이터 위에 끌어 놓으면, 데이터가 관을 따라 데이터 센터로 흘러가 분석되고(톱니가 돈다) 오른쪽에 쓰임이 나타난다.
   분석이 늘수록 데이터 센터의 전기·열 막대가 오른다. «친환경 운영» 카드를 데이터 센터에 붙이면 재생 에너지 몫이 늘고(지붕 태양광·풍력), 바닷속에 두면 열이 준다. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const SRC = [
    { k: 'shop', name: '상품 구매 기록', L: ['상품 구매 기록'], use: '운동화 추천', what: '구매 기록을 분석해 좋아할 만한 상품을 골라 보여 준다', W: ['구매 기록을 분석해 좋아할 만한', '상품을 골라 보여 준다'], hint: '사람들이 무엇을 샀는지가 필요하다' },
    { k: 'gene', name: '생물 유전체 연구 자료', L: ['생물 유전체', '연구 자료'], use: '질병 예측·맞춤 치료', what: '쌓인 유전체 자료로 걸리기 쉬운 병을 예측하고 알맞은 치료를 찾는다', W: ['걸리기 쉬운 병을 예측하고', '알맞은 치료를 찾는다'], hint: '생물의 유전 정보가 필요하다' },
    { k: 'lab', name: '과학 실험 결과', L: ['과학 실험 결과'], use: '신약 후보 찾기', what: '기존 약물·화학 물질 자료를 분석해 짧은 기간에 신약 후보를 추린다', W: ['기존 약물·화학 물질 자료로', '짧은 기간에 신약 후보를 추린다'], hint: '약과 화학 물질을 실험한 결과가 필요하다' },
    { k: 'lang', name: '언어(글·말) 자료', L: ['언어(글·말)', '자료'], use: '외국어 번역', what: '아주 많은 글과 말을 학습해 상황에 알맞게 번역한다', W: ['아주 많은 글과 말을 학습해', '상황에 알맞게 번역한다'], hint: '사람들이 쓴 글과 말이 필요하다' },
  ];
  const YS = [86, 208, 330, 452], DC = { x: 400, y: 120, w: 250, h: 340 };

  function icon(g, k) {
    if (k === 'shop') { el('path', { class: 'bi-a', d: 'M-16 -8 h 32 l -4 26 h -24 z' }, g); el('path', { class: 'bi-l', d: 'M-8 -8 v -6 a 8 8 0 0 1 16 0 v 6' }, g); }
    if (k === 'gene') { el('path', { class: 'bi-l', d: 'M-10 -22 C 14 -12, -14 0, 10 10 C 14 12, -10 20, -10 24 M 10 -22 C -14 -12, 14 0, -10 10 C -14 12, 10 20, 10 24' }, g); el('path', { class: 'bi-r', d: 'M-5 -15 h 10 M -6 3 h 12 M -5 17 h 10' }, g); }
    if (k === 'lab') { el('path', { class: 'bi-a', d: 'M-6 -22 h 12 v 14 l 14 24 a 4 4 0 0 1 -4 6 h -32 a 4 4 0 0 1 -4 -6 l 14 -24 z' }, g); el('path', { class: 'bi-q', d: 'M-14 10 h 28 l 4 8 h -36 z' }, g); }
    if (k === 'lang') { el('path', { class: 'bi-a', d: 'M-22 -18 h 26 a 6 6 0 0 1 6 6 v 12 a 6 6 0 0 1 -6 6 h -14 l -8 8 v -8 h -4 a 6 6 0 0 1 -6 -6 v -12 a 6 6 0 0 1 6 -6 z' }, g); el('text', { class: 'bi-t', x: -9, y: -1 }, g).textContent = '가'; el('path', { class: 'bi-b', d: 'M2 2 h 22 a 5 5 0 0 1 5 5 v 10 a 5 5 0 0 1 -5 5 h -2 v 6 l -6 -6 h -14 a 5 5 0 0 1 -5 -5 v -10 a 5 5 0 0 1 5 -5 z' }, g); el('text', { class: 'bi-t', x: 13, y: 18 }, g).textContent = 'A'; }
  }

  function mount(root) {
    const svg = root.querySelector('.bd-svg'), uses = [...root.querySelectorAll('.bd-use')], ecos = [...root.querySelectorAll('.bd-eco')];
    const msg = root.querySelector('.bd-msg'), mGrid = root.querySelector('.bd-m[data-k="elec"] .grid'), mGreen = root.querySelector('.bd-m[data-k="elec"] .green'), mHeat = root.querySelector('.bd-m[data-k="heat"] i');
    el('rect', { class: 'bd-bg', x: -400, y: -300, width: 1856, height: 1160 }, svg);
    // 관(데이터 → 데이터 센터)
    const pipes = {}, outs = {}, srcs = {};
    SRC.forEach((s, i) => {
      const y = YS[i];
      pipes[s.k] = el('path', { class: 'bd-pipe', d: `M270 ${y} C 330 ${y}, 340 ${290}, ${DC.x} ${DC.y + 60 + i * 70}` }, svg);
    });
    // 데이터 센터
    const dc = el('g', { class: 'bd-dc', tabindex: '0', role: 'button', 'aria-label': '데이터 센터' }, svg);
    el('rect', { class: 'bd-dcb', x: DC.x, y: DC.y, width: DC.w, height: DC.h, rx: 10 }, dc);
    el('rect', { class: 'bd-dcr', x: DC.x - 8, y: DC.y - 14, width: DC.w + 16, height: 18, rx: 4 }, dc);
    const racks = [0, 1, 2].map((r) => { const g = el('g', { class: 'bd-rack' }, dc); const x = DC.x + 22 + r * 76; el('rect', { x, y: DC.y + 70, width: 62, height: 220, rx: 6 }, g); for (let k = 0; k < 9; k++) { el('rect', { class: 'bd-slot', x: x + 8, y: DC.y + 82 + k * 23, width: 46, height: 14, rx: 3 }, g); el('circle', { class: 'bd-led', cx: x + 48, cy: DC.y + 89 + k * 23, r: 3 }, g); } return g; });
    el('text', { class: 'bd-dct', x: DC.x + DC.w / 2, y: DC.y + 34 }, dc).textContent = '데이터 센터';
    el('text', { class: 'bd-dcs', x: DC.x + DC.w / 2, y: DC.y + 56 }, dc).textContent = '슈퍼컴퓨터·인공지능이 분석';
    const gearAt = el('g', { transform: `translate(${DC.x + DC.w / 2} ${DC.y + DC.h - 30})` }, dc), gear = el('g', { class: 'bd-gear' }, gearAt);
    el('path', { d: 'M-4 -18 h 8 l 1 6 l 5 2 l 5 -4 l 6 6 l -4 5 l 2 5 l 6 1 v 8 l -6 1 l -2 5 l 4 5 l -6 6 l -5 -4 l -5 2 l -1 6 h -8 l -1 -6 l -5 -2 l -5 4 l -6 -6 l 4 -5 l -2 -5 l -6 -1 v -8 l 6 -1 l 2 -5 l -4 -5 l 6 -6 l 5 4 l 5 -2 z' }, gear); el('circle', { class: 'bd-gh', r: 6 }, gear);
    // 친환경 운영: 지붕 태양광·풍력, 바닷속 서버
    const ren = el('g', { class: 'bd-ren' }, svg);
    [0, 1, 2].forEach((k) => el('path', { class: 'bd-pv', d: `M${DC.x + 14 + k * 62} ${DC.y - 16} l 12 -26 h 44 l -12 26 z` }, ren));
    el('path', { class: 'bd-wt', d: `M${DC.x + DC.w + 30} ${DC.y + 120} V ${DC.y - 40}` }, ren);
    const rotorAt = el('g', { transform: `translate(${DC.x + DC.w + 30} ${DC.y - 40})` }, ren), rotor = el('g', { class: 'bd-rotor' }, rotorAt); el('path', { d: 'M0 0 V -40 M 0 0 L 35 20 M 0 0 L -35 20' }, rotor); el('circle', { class: 'bd-hub', r: 5 }, rotorAt);
    const sea = el('g', { class: 'bd-sea' }, svg);
    el('path', { class: 'bd-water', d: `M${DC.x + 60} 500 q 20 -10 40 0 t 40 0 t 40 0 t 40 0 t 40 0 V 560 H ${DC.x + 60} Z` }, sea);
    el('rect', { class: 'bd-cap', x: DC.x + 110, y: 512, width: 110, height: 34, rx: 17 }, sea); el('text', { class: 'bd-capt', x: DC.x + 165, y: 534 }, sea).textContent = '바닷속 서버';
    // 왼쪽 데이터, 오른쪽 쓰임
    SRC.forEach((s, i) => {
      const y = YS[i];
      const g = el('g', { class: 'bd-src', 'data-k': s.k, tabindex: '0', role: 'button', 'aria-label': s.name }, svg); srcs[s.k] = g;
      el('rect', { class: 'bd-card', x: 30, y: y - 46, width: 240, height: 92, rx: 14 }, g);
      const ic = el('g', { transform: `translate(72 ${y})` }, g); icon(ic, s.k);
      s.L.forEach((line, j) => { el('text', { class: 'bd-sn', x: 110, y: y + (s.L.length === 1 ? 6 : -6 + j * 24) }, g).textContent = line; });
      const bits = el('g', { class: 'bd-bits' }, g); for (let k = 0; k < 6; k++) el('rect', { x: 110 + k * 22, y: y + 30, width: 16, height: 7, rx: 2 }, bits);
      const o = el('g', { class: 'bd-out', 'data-k': s.k }, svg); outs[s.k] = o;
      el('rect', { class: 'bd-oc', x: 770, y: y - 46, width: 262, height: 92, rx: 14 }, o);
      el('text', { class: 'bd-oq', x: 901, y: y + 10 }, o).textContent = '?';
      el('text', { class: 'bd-on', x: 790, y: y - 12 }, o).textContent = s.use;
      s.W.forEach((line, j) => { el('text', { class: 'bd-ow', x: 790, y: y + 14 + j * 20 }, o).textContent = line; });
      el('path', { class: 'bd-arrow', d: `M${DC.x + DC.w + 4} ${DC.y + 60 + i * 70} C 700 ${DC.y + 60 + i * 70}, 720 ${y}, 766 ${y}` }, o);
    });
    const active = new Set(), eco = new Set();
    function meters() {
      const total = 22 + 19 * active.size, green = eco.has('ren') ? total * 0.6 : 0, heat = (20 + 18 * active.size) * (eco.has('sea') ? 0.45 : 1);
      mGrid.style.width = `${total - green}%`; mGreen.style.width = `${green}%`; mHeat.style.width = `${heat}%`;
      racks.forEach((r, i) => r.classList.toggle('on', active.size > i));
      ren.classList.toggle('on', eco.has('ren')); sea.classList.toggle('on', eco.has('sea'));
    }
    const shake = (e) => { e.classList.remove('bad'); e.getBoundingClientRect(); e.classList.add('bad'); };
    function analyse(k, quiet) {
      active.add(k); pipes[k].classList.add('on'); srcs[k].classList.add('on'); meters();
      const show = () => { outs[k].classList.add('on'); gear.classList.remove('spin'); };
      if (quiet || window.Deck.reduce) show(); else { gear.classList.add('spin'); setTimeout(show, 1300); }
      const s = SRC.find((x) => x.k === k);
      if (!quiet) msg.textContent = `${s.name} → 분석 → ${s.use}: ${s.what}`;
      if (active.size === 4 && !quiet) msg.textContent = '네 쓰임 모두 찾았다 — 분석이 늘수록 데이터 센터의 전기와 열도 는다. 친환경 운영 카드를 데이터 센터에 붙여 보자';
    }
    function drop(card, t) {
      const isUse = card.classList.contains('bd-use');
      if (!t) { msg.textContent = isUse ? '쓰임 카드는 그 일에 필요한 데이터 위에 놓아 보자' : '친환경 운영 카드는 데이터 센터에 붙여 보자'; return; }
      if (isUse) {
        if (t === dc) { msg.textContent = '쓰임 카드는 그 일에 필요한 «데이터» 위에 놓아 보자'; return; }
        const k = card.dataset.k;
        if (t.dataset.k !== k) { shake(card); msg.textContent = `«${card.textContent}»에는 ${SRC.find((x) => x.k === k).hint}`; return; }
        card.classList.add('used'); analyse(k);
      } else {
        if (t !== dc) { msg.textContent = '친환경 운영 카드는 데이터 센터에 붙여 보자'; return; }
        eco.add(card.dataset.k); card.classList.add('used'); meters();
        msg.textContent = card.dataset.k === 'ren' ? '재생 에너지로 필요한 전기의 일부를 직접 만든다' : '바닷속처럼 찬 곳에 두면 서버를 식히는 데 드는 에너지가 준다';
      }
    }
    const targets = [...Object.values(srcs), dc];
    const hover = (t) => targets.forEach((x) => x.classList.toggle('target', x === t));
    const find = (x) => { const s = x.closest && x.closest('#bigdata .bd-src, #bigdata .bd-dc'); return s || null; };
    const dUse = window.Drag.cards(uses, { find, hover, drop, pick: (c) => { if (c) msg.textContent = `«${c.textContent}»에 필요한 데이터를 눌러요`; } });
    const dEco = window.Drag.cards(ecos, { find, hover, drop, pick: (c) => { if (c) msg.textContent = `«${c.textContent}» — 데이터 센터를 눌러요`; } });
    targets.forEach((t) => {
      const go = () => { const c = dUse.picked || dEco.picked; if (!c) return; (dUse.picked ? dUse : dEco).unpick(); drop(c, t); };
      t.addEventListener('click', go);
      t.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); go(); } });
    });
    root.querySelector('#bd-all').addEventListener('click', () => { uses.forEach((c) => { if (!c.classList.contains('used')) { c.classList.add('used'); analyse(c.dataset.k, true); } }); msg.textContent = '네 쓰임 모두 — 친환경 운영 카드도 데이터 센터에 붙여 보자'; });
    root._bd = { eco: (k) => { const c = ecos.find((x) => x.dataset.k === k); drop(c, dc); } };
    meters();
    return {};
  }
  window.BigData = { mount };
})();
