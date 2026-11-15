/* 1-2-3 (1-2-2에서 가져옴) 반응식·이온화 식에서 «물질의 변화»를 잇는 꺾인 화살표(수업 제작 기준 §8, 2026-10-31).
   <div class="eqx" data-links="HCl>H,Cl:이온화;H,OH>W:중화">
     <span class="sp" data-id="HCl">HCl</span><span class="op">→</span><span class="sp" data-id="H">H<sup>+</sup></span> …
   </div>
   «앞 물질들>뒤 물질들:이름» 하나마다 식 아래에 한 층씩: 앞 물질 밑에서 내려와 가로줄로 모인 뒤 뒤 물질 밑으로 화살표가 올라간다.
   슬라이드 배율과 무관하게 offset 좌표로 그리고, 보일 때(크기가 바뀔 때)마다 다시 그린다. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const mk = (t, a, p) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  function draw(box) {
    let svg = box.querySelector(':scope > svg.eqx-svg');
    if (!svg) { svg = mk('svg', { class: 'eqx-svg', 'aria-hidden': 'true' }, box); }
    svg.innerHTML = '';
    const W = box.clientWidth, H = box.clientHeight; if (!W) return;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`); svg.setAttribute('width', W); svg.setAttribute('height', H);
    const at = (id) => box.querySelector(`[data-id="${id}"]`);
    const sp = [...box.querySelectorAll('.sp')];
    const bot = Math.max(...sp.map((e) => e.offsetTop + e.offsetHeight));
    const col = getComputedStyle(box).getPropertyValue('--lk') || '#1d2433';
    (box.dataset.links || '').split(';').filter(Boolean).forEach((spec, lv) => {
      const ci = spec.indexOf(':'), path = ci < 0 ? spec : spec.slice(0, ci), label = ci < 0 ? '' : spec.slice(ci + 1); const [a, b] = path.split('>');
      const src = a.split(',').map(at).filter(Boolean), dst = b.split(',').map(at).filter(Boolean);
      if (!src.length || !dst.length) return;
      const cx = (e) => e.offsetLeft + e.offsetWidth / 2, by = (e) => e.offsetTop + e.offsetHeight + 4;
      const y = bot + 16 + lv * 40;
      const c = (box.dataset.col || '').split(',')[lv] || col.trim();
      const xs = [...src, ...dst].map(cx), x0 = Math.min(...xs), x1 = Math.max(...xs);
      const st = { stroke: c, 'stroke-width': 3.5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
      src.forEach((e) => mk('path', Object.assign({ d: `M${cx(e)} ${by(e)} V${y}` }, st), svg));
      mk('path', Object.assign({ d: `M${x0} ${y} H${x1}` }, st), svg);
      dst.forEach((e) => {
        const x = cx(e), t = by(e);
        mk('path', Object.assign({ d: `M${x} ${y} V${t + 9}` }, st), svg);
        mk('path', { d: `M${x - 8} ${t + 12} L${x} ${t} L${x + 8} ${t + 12} Z`, fill: c }, svg);
      });
      if (label) {
        const lx = (x0 + x1) / 2, t = mk('text', { x: lx, y: y + 25, 'text-anchor': 'middle', class: 'eqx-lab', fill: c }, svg); t.textContent = label;
        const w = label.length * 17 + 18; const r = mk('rect', { x: lx - w / 2, y: y + 6, width: w, height: 26, rx: 6, fill: '#fffdf6' }, svg); svg.insertBefore(r, t);
      }
    });
  }
  function init(root) {
    const boxes = [...(root || document).querySelectorAll('.eqx')];
    boxes.forEach((b) => {
      const n = (b.dataset.links || '').split(';').filter(Boolean).length;
      b.style.paddingBottom = (n ? 22 + n * 40 : 0) + 'px';
      draw(b);
      if (typeof ResizeObserver !== 'undefined') new ResizeObserver(() => draw(b)).observe(b);
    });
    return { redraw: () => boxes.forEach(draw) };
  }
  window.ABLink = { init, draw };
  const all = () => init(document);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', all); else all();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => document.querySelectorAll('.eqx').forEach(draw));
})();
