/* 3차시 5장 «기린의 목, 두 설명»: 같은 세대 막대로 왼쪽(용불용설)과 오른쪽(자연선택설) 기린 무리가 나란히 바뀐다.
   세대 0 조상 → 1 먹이 다툼 → 2 자손 → 3 오늘날. 목 길이·마릿수는 이해를 돕기 위한 그림. 시험용: root._gf.set(세대) */
(function () {
  'use strict';
  const K = window.EvKit;
  // 왼쪽(용불용설): 모두 짧게 시작 → 애써 늘임 → 늘인 목이 자손에게(×) → 모두 긺
  const LAM = [[1, 1, 1, 1], [1.35, 1.35, 1.35, 1.35], [1.5, 1.5, 1.5, 1.5], [1.9, 1.9, 1.9, 1.9]];
  // 오른쪽(자연선택설): 처음부터 다양 → 짧은 목은 굶음 → 긴 목의 자손(조금씩 다름) → 대부분 긺
  const SEL = [[0.9, 1.5, 1.15, 1.8], [0.9, 1.5, 1.15, 1.8], [1.6, 1.85, 1.5, 1.75], [1.85, 1.95, 1.7, 1.9]];
  const DEAD = [[], [0, 2], [], []];
  const TXT = {
    lam: ['처음 기린은 <b>모두 목이 짧았다</b>.', '높은 잎을 먹으려고 목을 자꾸 늘이자 <b>목이 길어졌다</b>.', '살면서 길어진 목이 자손에게 그대로 전해졌다고 본다 → 그러나 <b>살면서 얻은 형질은 유전되지 않는다</b>.', '그래서 오늘날 이 설명(<b>용불용설</b>)은 받아들여지지 않는다.'],
    sel: ['처음부터 목 길이가 <b>여러 가지</b>였다(<b>변이</b>).', '높은 잎만 남자 목이 짧은 기린은 먹이를 얻지 못해 <b>살아남기 어려웠다</b>(생존 경쟁).', '목이 긴 기린이 살아남아 그 형질을 <b>자손에게 물려주었다</b>(자연선택).', '이 과정이 여러 세대 되풀이되어 목이 긴 기린이 <b>대부분</b>이 되었다.'],
  };
  const GEN = ['조상', '먹이가 높은 곳에만', '자손 세대', '오늘날'];
  function giraffe(g, x, base, neck, dead) {
    const el = (t, a) => K.el(t, a, g);
    const h = 70 * neck;
    const grp = el('g', { transform: `translate(${x} ${base})`, class: 'gf-g' + (dead ? ' dead' : '') });
    const e = (t, a) => K.el(t, a, grp);
    ['M-24 0 V50', 'M-12 0 V52', 'M14 0 V52', 'M26 0 V50'].forEach((d) => e('path', { d, class: 'gf-leg' }));
    e('ellipse', { cx: 0, cy: -6, rx: 36, ry: 22, class: 'gf-body' });
    e('path', { d: `M18 -18 L${28 + h * 0.18} ${-18 - h} L${42 + h * 0.18} ${-14 - h} L32 -6 Z`, class: 'gf-body' });
    e('ellipse', { cx: 44 + h * 0.18, cy: -22 - h, rx: 16, ry: 9, class: 'gf-body' });
    e('path', { d: `M${36 + h * 0.18} ${-30 - h} l-2 -10 M${42 + h * 0.18} ${-30 - h} l1 -10`, class: 'gf-horn' });
    e('circle', { cx: 48 + h * 0.18, cy: -24 - h, r: 2.2, class: 'gf-eye' });
    [[-14, -12], [6, -2], [-24, 0], [16, -14], [-2, -18]].forEach(([a, b]) => e('circle', { cx: a, cy: b, r: 5, class: 'gf-spot' }));
    for (let k = 1; k < 4; k++) e('circle', { cx: 28 + h * 0.18 * k / 4, cy: -18 - h * k / 4, r: 4, class: 'gf-spot' });
    if (dead) e('path', { d: 'M-26 -40 L26 20 M26 -40 L-26 20', class: 'gf-x' });
    return grp;
  }
  function mount(root) {
    const svg = root.querySelector('.gf-svg'), range = root.querySelector('.gf-range');
    const lamT = root.querySelector('.gf-lam'), selT = root.querySelector('.gf-sel'), genT = root.querySelectorAll('.gf-gen');
    const pills = [...root.querySelectorAll('.gf-pills button')];
    const el = (t, a, p) => K.el(t, a, p);
    function tree(p, x) { el('rect', { x: x - 8, y: 240, width: 16, height: 200, class: 'gf-trunk' }, p); [[0, 215, 70], [-50, 242, 45], [50, 242, 45]].forEach(([dx, y, r]) => el('ellipse', { cx: x + dx, cy: y, rx: r, ry: r * 0.6, class: 'gf-leaf' }, p)); }
    const panes = [0, 500].map((ox, i) => {
      const p = el('g', { transform: `translate(${ox} 0)` }, svg);
      el('rect', { x: 6, y: 6, width: 488, height: 468, rx: 14, class: i ? 'gf-pane sel' : 'gf-pane lam' }, p);
      el('rect', { x: 6, y: 400, width: 488, height: 74, class: 'gf-ground' }, p);
      tree(p, 400);
      el('text', { x: 24, y: 44, class: 'gf-title' }, p).textContent = i ? '자연선택설(다윈)' : '용불용설(라마르크)';
      return { p, herd: el('g', {}, p), stamp: el('g', { class: 'gf-stamp', transform: 'translate(240 110) rotate(-5)' }, p), arrow: el('g', {}, p) };
    });
    const st = panes[0].stamp; el('rect', { x: -170, y: -32, width: 340, height: 64, rx: 10 }, st); el('text', { y: 12, 'text-anchor': 'middle' }, st).textContent = '살면서 얻은 형질은 유전 ×';
    let g = 0;
    function set(v) {
      g = Math.max(0, Math.min(3, Math.round(v))); range.value = String(g);
      panes.forEach((pn, i) => {
        pn.herd.innerHTML = ''; pn.arrow.innerHTML = '';
        const N = i ? SEL[g] : LAM[g];
        N.forEach((n, k) => giraffe(pn.herd, 60 + k * 82, 400, n, i === 1 && DEAD[g].includes(k)));
        if (!i && g === 1) N.forEach((n, k) => { const x = 60 + k * 82 + 40; el('path', { d: `M${x} 230 V180 M${x - 10} 192 L${x} 178 L${x + 10} 192`, class: 'gf-up' }, pn.arrow); });
      });
      panes[0].stamp.style.display = g >= 2 ? '' : 'none';
      lamT.innerHTML = TXT.lam[g]; selT.innerHTML = TXT.sel[g];
      genT.forEach((t) => { t.textContent = GEN[g]; });
      pills.forEach((b, i) => { b.setAttribute('aria-pressed', String(i === g)); b.classList.toggle('past', i < g); });
    }
    range.addEventListener('input', () => set(+range.value));
    range.addEventListener('keydown', (e) => e.stopPropagation());
    pills.forEach((b, i) => b.addEventListener('click', () => set(i)));
    set(0);
    root._gf = { set };
    return {};
  }
  window.EvGiraffe = { mount };
})();
