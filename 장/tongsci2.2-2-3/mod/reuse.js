/* 창의력 «버려지는 열을 쓸모 있게»: 왼쪽 열이 나오는 곳의 «열» 동그라미를 끌어(또는 눌러 고른 뒤) 오른쪽 쓸 곳에 놓으면
   관이 이어지고 열 알갱이가 흐르며 그곳이 살아난다(물에서 김, 창에 불빛, 식물이 자라고, 눈이 녹는다).
   화력 발전소 → 난방·온수는 실제로 쓰는 방법(열병합 발전)이라고 알려 준다. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  // 받침이 있으면(ㄹ은 빼고) «으로»
  const ro = (w) => { const j = (w.charCodeAt(w.length - 1) - 0xac00) % 28; return j && j !== 8 ? '으로' : '로'; };

  function mount(root) {
    const svg = root.querySelector('.ru-svg'), pipesG = svg.querySelector('.ru-pipes'), dragP = svg.querySelector('.ru-drag');
    const msg = root.querySelector('.ru-msg');
    const srcs = [...svg.querySelectorAll('.ru-src')], uses = [...svg.querySelectorAll('.ru-use')];
    const links = new Map();                                  // 's|u' → path
    let picked = null;
    const xy = (g, dx, dy) => { const m = g.getAttribute('transform').match(/translate\(([\d.]+) ([\d.]+)\)/); return { x: Number(m[1]) + dx, y: Number(m[2]) + dy }; };
    const out = (s) => xy(s, 420, 60), inn = (u) => xy(u, 0, 60);
    const curve = (a, b) => `M${a.x} ${a.y} C ${a.x + 220} ${a.y}, ${b.x - 220} ${b.y}, ${b.x} ${b.y}`;
    const pt = (e) => { const r = svg.getBoundingClientRect(); return { x: (e.clientX - r.left) * 1652 / r.width, y: (e.clientY - r.top) * 620 / r.height }; };
    function refresh() {
      srcs.forEach((s) => s.classList.toggle('on', [...links.keys()].some((k) => k.startsWith(s.dataset.s + '|'))));
      uses.forEach((u) => u.classList.toggle('on', [...links.keys()].some((k) => k.endsWith('|' + u.dataset.u))));
    }
    function connect(s, u) {
      const key = `${s.dataset.s}|${u.dataset.u}`;
      if (links.has(key)) { msg.textContent = '이미 이어 둔 관이에요'; return; }
      const p = document.createElementNS(NS, 'path');
      p.setAttribute('class', 'ru-pipe'); p.setAttribute('d', curve(out(s), inn(u)));
      pipesG.appendChild(p); links.set(key, p);
      const sn = s.dataset.name, un = u.dataset.name;
      msg.textContent = s.dataset.s === 'plant' && (u.dataset.u === 'house' || u.dataset.u === 'water')
        ? `실제로 쓰는 방법! 발전소에서 버리던 열로 ${un}${ro(un)} — 열병합 발전`
        : `${sn}의 열 → ${un}: 버려질 열을 쓸모 있게!`;
      refresh();
      if (window.gsap && !window.Deck.reduce) { const L = p.getTotalLength(); gsap.fromTo(p, { strokeDasharray: `${L} ${L}`, strokeDashoffset: L }, { strokeDashoffset: 0, duration: 0.6, ease: 'power1.inOut', onComplete: () => { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; } }); }
    }
    const pick = (s) => { picked = s; srcs.forEach((x) => x.classList.toggle('pick', x === s)); if (s) msg.textContent = `${s.dataset.name}의 열을 어디에 쓸까? 오른쪽 쓸 곳을 눌러요`; };
    srcs.forEach((s) => {
      const h = s.querySelector('.ru-h');
      h.setAttribute('tabindex', '0'); h.setAttribute('role', 'button'); h.setAttribute('aria-label', `${s.dataset.name}의 열 끌기`);
      let on = false, moved = false, s0 = null;
      h.addEventListener('pointerdown', (e) => { on = true; moved = false; s0 = pt(e); h.setPointerCapture(e.pointerId); e.stopPropagation(); });
      h.addEventListener('pointermove', (e) => {
        if (!on) return;
        const a = pt(e);
        if (!moved && Math.hypot(a.x - s0.x, a.y - s0.y) < 6) return;
        moved = true; dragP.setAttribute('d', curve(out(s), a)); dragP.classList.add('on');
        const over = document.elementFromPoint(e.clientX, e.clientY);
        uses.forEach((u) => u.classList.toggle('target', !!over && over.closest('.ru-use') === u));
      });
      h.addEventListener('pointerup', (e) => {
        if (!on) return; on = false; dragP.classList.remove('on'); uses.forEach((u) => u.classList.remove('target'));
        if (!moved) { pick(picked === s ? null : s); return; }
        const over = document.elementFromPoint(e.clientX, e.clientY), u = over && over.closest('.ru-use');
        if (u) connect(s, u); else msg.textContent = '오른쪽 쓸 곳 위에 놓아 보자';
      });
      h.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); pick(picked === s ? null : s); } });
    });
    uses.forEach((u) => {
      u.setAttribute('tabindex', '0'); u.setAttribute('role', 'button'); u.setAttribute('aria-label', `${u.dataset.name}에 잇기`);
      const go = () => { if (picked) { const s = picked; pick(null); connect(s, u); } else msg.textContent = '먼저 왼쪽 «열» 동그라미를 끌거나 눌러요'; };
      u.addEventListener('click', go);
      u.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); go(); } });
    });
    root.querySelector('#ru-clear').addEventListener('click', () => { links.forEach((p) => p.remove()); links.clear(); pick(null); refresh(); msg.textContent = '왼쪽 «열» 동그라미를 끌어 오른쪽 쓸 곳에 놓아 보자'; });
    root._reuse = { connect: (a, b) => connect(srcs.find((s) => s.dataset.s === a), uses.find((u) => u.dataset.u === b)) };
    return {};
  }
  window.HeatReuse = { mount };
})();
