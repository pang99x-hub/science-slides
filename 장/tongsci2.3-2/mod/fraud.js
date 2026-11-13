/* 해 보기 «과학 윤리의 중요성 논증하기»(교과서 152쪽): 거짓으로 밝혀진 혈액 진단 기술(회사·인물 이름 없이).
   «시간» 막대를 밀면 발표 → 투자 → 승인·판매 → 문제 발견 → 취재로 흐르고, 판매가 시작되면 거짓 결과를 받는 사람이 늘어난다.
   그 무렵의 사람(투자자·승인 기관·연구자·기자)을 누르면 기계 상자를 열어 검증한다 — 일찍 검증할수록 피해가 적다. 아무도 안 누르면 끝에서 기자가 밝힌다.
   사람 수(40명 칸)는 이해를 돕기 위한 예. 막대를 검증한 때보다 앞으로 되돌리면 검증도 없던 일이 된다. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const jong = (w) => (w.charCodeAt(w.length - 1) - 0xac00) % 28 > 0, ga = (w) => w + (jong(w) ? '이' : '가'), eun = (w) => w + (jong(w) ? '은' : '는'), eul = (w) => w + (jong(w) ? '을' : '를');
  const N = 40, SALE = 0.34;
  const STAGES = [[0, '발표'], [0.17, '투자'], [0.34, '승인·판매'], [0.58, '문제 발견'], [0.8, '취재']];
  const WHO = [
    { k: 'inv', name: '투자자', at: [150, 214], win: [0.12, 0.34], did: '자료를 보거나 기술을 따져 보지 않고 돈을 냈다.', fix: '투자하기 전에 연구 자료를 요구해 확인했다' },
    { k: 'reg', name: '승인 기관 책임자', at: [150, 420], win: [0.3, 0.58], did: '제대로 검증하지 않고 제품을 승인했다.', fix: '승인하기 전에 다른 연구실에서 똑같이 해 보게 했다' },
    { k: 'sci', name: '연구자들', at: [906, 214], win: [0.56, 0.82], did: '몇몇 연구자가 기술의 문제점을 발견했다.', fix: '발견한 문제를 숨기지 않고 알렸다' },
    { k: 'rep', name: '기자', at: [906, 420], win: [0.78, 1.01], did: '끈질기게 추적해 결과가 조작되었고 실제 기술은 없음을 밝혔다.', fix: '끈질기게 추적해 조작을 밝혔다' },
  ];
  const STORY = [
    [0, '기술 발표', '한 벤처 사업가가 피 한 방울로 200여 가지 질병을 진단하는 기술을 개발하고 있다고 발표했다.'],
    [0.17, '투자', '투자자 몇몇이 연구 자료도 보지 않고, 기술이 진짜인지 따져 보지도 않은 채 큰돈을 냈다.'],
    [0.34, '승인과 판매', '질병 관리 기관의 책임자가 제품을 승인했고, 고객들이 검사 결과를 받기 시작했다.'],
    [0.58, '문제 발견', '몇몇 연구자가 이 기술의 문제점을 발견했다.'],
    [0.8, '취재와 폭로', '이를 알게 된 기자가 끈질기게 추적했다.'],
  ];

  function man(p, x, y, color, k = 1) {
    const g = el('g', { transform: `translate(${x} ${y}) scale(${k})` }, p);
    el('path', { class: 'fr-body', d: 'M-20 0 v -60 a 20 20 0 0 1 40 0 v 60 z', fill: color }, g);
    el('circle', { class: 'fr-face', cy: -84, r: 17 }, g);
    return g;
  }

  function mount(root) {
    const svg = root.querySelector('.fr-svg'), now = root.querySelector('.fr-now'), range = root.querySelector('#fr-t'), tv = root.querySelector('.fr-tv');
    const it = root.querySelector('.fr-it'), ib = root.querySelector('.fr-ib'), nEl = root.querySelector('.fr-n'), msg = root.querySelector('.fr-msg');
    el('rect', { class: 'fr-bg', x: -400, y: -300, width: 1856, height: 1300 }, svg);
    // 시간 줄
    el('path', { class: 'fr-line', d: 'M80 52 H 976' }, svg);
    STAGES.forEach(([u, t]) => { const x = 80 + 896 * u; el('circle', { class: 'fr-dot', cx: x, cy: 52, r: 8 }, svg); el('text', { class: 'fr-st', x: x + (u === 0 ? 10 : 0), y: 34 }, svg).textContent = t; });
    const mark = el('path', { class: 'fr-mark', d: 'M0 64 l -10 16 h 20 z' }, svg);
    // 기계 상자
    const mach = el('g', { class: 'fr-mach' }, svg);
    el('rect', { class: 'fr-box', x: 408, y: 170, width: 240, height: 180, rx: 14 }, mach);
    const inside = el('g', { class: 'fr-in' }, mach); el('rect', { x: 424, y: 186, width: 208, height: 148, rx: 8 }, inside); el('text', { x: 528, y: 258 }, inside).textContent = '진단 기술이'; el('text', { x: 528, y: 288 }, inside).textContent = '들어 있지 않다';
    const lid = el('g', { class: 'fr-lid' }, mach); el('rect', { x: 408, y: 170, width: 240, height: 180, rx: 14 }, lid);
    el('text', { class: 'fr-bt', x: 528, y: 236 }, lid).textContent = '기적의 진단 기계'; el('text', { class: 'fr-bs', x: 528, y: 266 }, lid).textContent = '피 한 방울 → 200여 가지 질병';
    el('circle', { class: 'fr-drop', cx: 528, cy: 304, r: 12 }, lid);
    const stamp = el('g', { class: 'fr-stamp' }, mach); el('rect', { x: 446, y: 360, width: 164, height: 48, rx: 8 }, stamp); el('text', { x: 528, y: 393 }, stamp).textContent = '결과 조작';
    // 사람들
    const who = WHO.map((w, i) => {
      const g = el('g', { class: 'fr-who', tabindex: '0', role: 'button', 'aria-label': `${ga(w.name)} 검증하기` }, svg);
      el('rect', { class: 'fr-whit', x: w.at[0] - 120, y: w.at[1] - 130, width: 240, height: 170, rx: 14 }, g);
      man(g, w.at[0] - 50, w.at[1] + 10, ['#d9a14a', '#3a78c2', '#2f9e5b', '#8d7ab8'][i]);
      (w.name === '승인 기관 책임자' ? ['승인 기관', '책임자'] : [w.name]).forEach((t2, j, a) => { el('text', { class: 'fr-wn', x: w.at[0] + 40, y: w.at[1] - (a.length > 1 ? 86 : 70) + j * 24 }, g).textContent = t2; });
      const lens = el('g', { class: 'fr-lens', transform: `translate(${w.at[0] + 34} ${w.at[1] - 24})` }, g); el('circle', { r: 20 }, lens); el('path', { d: 'M14 14 l 16 16' }, lens);
      const note = el('text', { class: 'fr-wnote', x: w.at[0] + 30, y: w.at[1] + 30 }, g);
      return { ...w, g, note };
    });
    // 고객 40명
    const crowd = Array.from({ length: N }, (_, i) => { const x = 92 + (i % 20) * 46, y = 516 + Math.floor(i / 20) * 52; const g = el('g', { class: 'fr-c' }, svg); el('circle', { cx: x, cy: y - 22, r: 9 }, g); el('path', { d: `M${x - 12} ${y + 8} v -12 a 12 12 0 0 1 24 0 v 12 z` }, g); el('path', { class: 'fr-x', d: `M${x + 8} ${y - 36} l 10 10 M ${x + 18} ${y - 36} l -10 10` }, g); return g; });
    el('text', { class: 'fr-ct', x: 528, y: 610 }, svg).textContent = '검사 결과를 받은 고객';
    let vAt = null, vWho = null;
    const harmedAt = (u) => Math.round(N * clamp((u - SALE) / (1 - SALE), 0, 1));
    function paint() {
      const u = Number(range.value) / 100;
      if (vAt !== null && u < vAt - 1e-6) { vAt = null; vWho = null; }
      if (vAt === null && u >= 0.99) { vAt = 0.99; vWho = WHO[3]; }
      const stop = vAt ?? u, n = harmedAt(Math.min(u, stop));
      mark.setAttribute('transform', `translate(${(80 + 896 * u).toFixed(1)} 0)`);
      const S = [...STORY].reverse().find(([s]) => u >= s);
      tv.textContent = STAGES.slice().reverse().find(([s]) => u >= s)[1];
      crowd.forEach((c, i) => { c.classList.toggle('got', i < harmedAt(u) && i < n); c.classList.toggle('safe', vAt !== null && i >= n); });
      nEl.textContent = `${n}명`;
      const open = vAt !== null;
      mach.classList.toggle('open', open);
      who.forEach((w) => {
        const live = !open && u >= w.win[0] && u < w.win[1], past = u >= w.win[1] || (open && vWho !== w && u >= w.win[0]);
        w.g.classList.toggle('live', live); w.g.classList.toggle('past', past && vWho !== w); w.g.classList.toggle('hero', vWho === w);
        w.note.textContent = vWho === w ? '검증했다!' : live ? '누르면 검증' : past && u >= w.win[1] && w.k !== 'rep' ? (w.k === 'sci' ? '문제를 발견' : '확인하지 않음') : '';
      });
      if (open) {
        it.textContent = `${ga(vWho.name)} 검증했다`;
        ib.textContent = vWho.k === 'rep' && Number(range.value) >= 99 ? WHO[3].did : `${vWho.fix} → 상자 속에 진단 기술이 없다는 것이 드러났다.`;
        msg.textContent = n === 0 ? '판매 전에 검증해 아무도 거짓 결과를 받지 않았다.' : n < N ? `더 일찍 검증했다면 피해가 더 적었다 — 막대를 되돌려 더 앞에서 검증해 보자.` : '끝까지 아무도 검증하지 않아 피해가 가장 컸다 — 막대를 되돌려 더 앞에서 검증해 보자.';
        now.textContent = n === 0 ? '가장 일찍 검증했다' : '막대를 되돌려 더 일찍 검증해 보자';
      } else {
        it.textContent = S[1]; ib.textContent = S[2];
        const L = who.find((w) => u >= w.win[0] && u < w.win[1]);
        msg.textContent = L ? `지금 ${eul(L.name)} 누르면 그때 검증한다` : '';
        now.textContent = u < 0.05 ? '막대를 밀어 시간을 보내 보자' : L ? `지금 ${eul(L.name)} 눌러 검증해 보자` : '막대를 더 밀어 보자';
      }
    }
    function verify(w) {
      const u = Number(range.value) / 100;
      if (vAt !== null || u < w.win[0] || u >= w.win[1]) { if (vAt === null) msg.textContent = u < w.win[0] ? `${eun(w.name)} 아직 등장하지 않았다 — 막대를 더 밀어 보자` : `${w.name}의 때는 지났다 — ${w.did}`; return; }
      vAt = u; vWho = w; paint();
    }
    who.forEach((w) => { w.g.addEventListener('click', () => verify(w)); w.g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); verify(w); } }); });
    range.addEventListener('input', paint); range.addEventListener('keydown', (e) => e.stopPropagation());
    paint();
    root._fr = { t: (v) => { range.value = String(v); paint(); }, verify: (k) => verify(who.find((w) => w.k === k)) };
    return {};
  }
  window.FakeTest = { mount };
})();
