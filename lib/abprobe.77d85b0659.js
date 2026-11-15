/* 1차시 4장(교과서 47쪽 간이 전기 전도성 측정기): 비커 받침을 옆으로 밀어 비커를 고르고, 측정기 손잡이를 아래로 끌어
   전극 두 개를 용액에 담근다. 산·염기 수용액이면 불이 켜지고 «삐», 증류수·설탕물은 꺼진 채. 전극이 잠겨 있으면 받침이 움직이지 않는다. */
(function () {
  'use strict';
  const { el, grab, clamp, loop } = window.AB;
  const BK = [
    { k: 'water', name: '증류수', on: 0, c: '#e4f1f8' },
    { k: 'sugar', name: '설탕물', on: 0, c: '#e8f1f5' },
    { k: 'hcl', name: '묽은 염산', on: 1, c: '#e3f0f6' },
    { k: 'vin', name: '식초', on: 1, c: '#f1e6cf' },
    { k: 'naoh', name: '수산화 나트륨 수용액', short: '수산화 나트륨', on: 1, c: '#e3eef5' },
    { k: 'soap', name: '빨랫비누 물', on: 1, c: '#f1f1ef' },
  ];
  const CX = 500, GAP = 170, LIQ = 446, MAXOFF = 150;

  function mount(root) {
    const svg = root.querySelector('.ab-pr-svg'), now = root.querySelector('.ab-pr-now'), msg = root.querySelector('.ab-pr-msg');
    const list = root.querySelector('.ab-plist');
    list.innerHTML = BK.map((b) => `<li data-k="${b.k}"><span>${b.short || b.name}</span><b>?</b></li>`).join('');
    el('rect', { x: 0, y: 600, width: 1000, height: 60, fill: '#e6dccb' }, svg);
    // 받침대(비커 뒤에 선다)
    el('rect', { x: 900, y: 60, width: 22, height: 500, fill: '#b7bcc4', stroke: '#1d2433', 'stroke-width': 3 }, svg);
    el('rect', { x: 860, y: 540, width: 110, height: 24, rx: 6, fill: '#7d848f', stroke: '#1d2433', 'stroke-width': 3 }, svg);
    // 받침과 비커
    const tray = el('g', { class: 'ab-hand', tabindex: 0, role: 'slider', 'aria-label': '비커 받침(좌우로 밀기)' }, svg);
    el('rect', { class: 'ab-hit', x: 40, y: 380, width: 1020, height: 230 }, tray);
    el('rect', { x: 50, y: 560, width: 1000, height: 30, rx: 8, fill: '#9c7b55', stroke: '#1d2433', 'stroke-width': 3 }, tray);
    BK.forEach((b, i) => {
      const x = 160 + i * GAP;
      el('rect', { x: x - 54, y: LIQ, width: 108, height: 110, fill: b.c }, tray);
      el('path', { d: `M${x - 60} 400 V548 Q${x - 60} 558 ${x - 50} 558 H${x + 50} Q${x + 60} 558 ${x + 60} 548 V400`, class: 'ab-glass' }, tray);
      el('path', { d: `M${x - 60} 400 h-8`, stroke: '#1d2433', 'stroke-width': 3 }, tray);
      el('line', { x1: x - 54, y1: LIQ, x2: x + 54, y2: LIQ, stroke: '#6fa4c6', 'stroke-width': 2 }, tray);
      el('text', { class: 'ab-small', x, y: 584, fill: '#fff', style: 'fill:#fff', text: b.short || b.name, 'font-size': b.short ? 14 : 16 }, tray);
    });
    // 받침대와 측정기
    const probe = el('g', {}, svg);
    el('rect', { x: 560, y: 150, width: 350, height: 18, rx: 6, fill: '#b7bcc4', stroke: '#1d2433', 'stroke-width': 3 }, probe);
    el('rect', { x: 418, y: 100, width: 164, height: 104, rx: 14, fill: '#2b3242', stroke: '#1d2433', 'stroke-width': 3 }, probe);
    const glow = el('circle', { cx: 460, cy: 140, r: 34, fill: '#ffdf5a', opacity: 0 }, probe);
    const led = el('circle', { cx: 460, cy: 140, r: 16, fill: '#5a4a2a', stroke: '#fff', 'stroke-width': 2 }, probe);
    el('text', { x: 460, y: 190, 'font-size': 14, fill: '#fff', 'text-anchor': 'middle', 'font-weight': 700, text: '불빛' }, probe);
    el('circle', { cx: 540, cy: 140, r: 16, fill: '#3c4558', stroke: '#fff', 'stroke-width': 2 }, probe);
    el('text', { x: 540, y: 190, 'font-size': 14, fill: '#fff', 'text-anchor': 'middle', 'font-weight': 700, text: '소리' }, probe);
    const beep = el('text', { x: 600, y: 100, 'font-size': 30, 'font-weight': 800, fill: '#c8402f', opacity: 0, text: '삐—' }, probe);
    [CX - 22, CX + 22].forEach((x) => { el('rect', { x: x - 5, y: 204, width: 10, height: 156, fill: '#c9ced6', stroke: '#1d2433', 'stroke-width': 2 }, probe); });
    const knob = el('g', { class: 'ab-hand', tabindex: 0, role: 'slider', 'aria-label': '측정기 손잡이(아래로 끌어 담그기)' }, probe);
    el('circle', { class: 'ab-hit', cx: 700, cy: 159, r: 60 }, knob);
    el('circle', { cx: 700, cy: 159, r: 30, fill: '#c8402f', stroke: '#1d2433', 'stroke-width': 3 }, knob);
    el('path', { d: 'M700 140 v38 M688 166 l12 12 l12 -12', stroke: '#fff', 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }, knob);
    let off = 0, tx = 340 - 0 * GAP, sel = 0, settle = null;
    const tipY = () => 360 + off;
    function paint() {
      probe.setAttribute('transform', `translate(0 ${off.toFixed(1)})`);
      tray.setAttribute('transform', `translate(${(tx - 340 + 340).toFixed(1)} 0)`);
      const i = Math.round((340 - tx) / GAP), near = Math.abs(340 - tx - i * GAP) < 14;
      sel = clamp(i, 0, BK.length - 1);
      const inL = near && tipY() > LIQ + 10;
      const b = BK[sel], lit = inL && b.on;
      glow.setAttribute('opacity', lit ? 0.75 : 0); led.setAttribute('fill', lit ? '#ffe36b' : '#5a4a2a'); beep.setAttribute('opacity', lit ? 1 : 0);
      list.querySelectorAll('li').forEach((li) => li.classList.toggle('cur', li.dataset.k === b.k && near));
      if (inL) {
        const li = list.querySelector(`li[data-k="${b.k}"]`);
        if (!li.classList.contains('on') && !li.classList.contains('off')) { li.classList.add(b.on ? 'on' : 'off'); li.querySelector('b').textContent = b.on ? '켜짐 ●' : '꺼짐 ○'; }
        msg.innerHTML = `<b>${b.name}</b>: ${b.on ? '불이 켜지고 소리가 난다 → 전류가 흐른다' : '불이 켜지지 않는다 → 전류가 흐르지 않는다'}`;
        const n = list.querySelectorAll('li.on, li.off').length;
        now.textContent = n >= BK.length ? '어떤 용액에서 전류가 흘렀나?' : '② 들어 올린 뒤 받침을 밀어 다른 비커로';
        now.classList.toggle('done', n >= BK.length);
      }
    }
    grab(knob, svg, {
      start(p) { knob._y = p.y - off; },
      move(p) { off = clamp(p.y - knob._y, 0, MAXOFF); paint(); },
    });
    let gx = 0;
    grab(tray, svg, {
      start(p) { if (off > 80) { msg.textContent = '전극이 비커 안에 있다. 손잡이를 먼저 올리자(실제로는 증류수로 씻고 옮긴다).'; return false; } gx = p.x - tx; if (settle) settle.stop(); },
      move(p) { tx = clamp(p.x - gx, 340 - (BK.length - 1) * GAP - 40, 380); paint(); },
      end() { const i = clamp(Math.round((340 - tx) / GAP), 0, BK.length - 1), goal = 340 - i * GAP; settle = loop((dt) => { tx += (goal - tx) * Math.min(1, dt * 12); if (Math.abs(goal - tx) < 0.3) { tx = goal; settle.stop(); } paint(); }); settle.start(); },
    });
    const key = (node, f) => node.addEventListener('keydown', (e) => { const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key]; if (d) { e.preventDefault(); e.stopPropagation(); f(d); paint(); } });
    key(knob, (d) => { off = clamp(off + d * 25, 0, MAXOFF); });
    key(tray, (d) => { if (off > 80) return; tx = clamp(340 - (sel + d) * GAP, 340 - (BK.length - 1) * GAP, 340); });
    paint();
    root._pr = { go(i, o) { off = 0; tx = 340 - i * GAP; paint(); off = o; paint(); } };
    return { setActive(on) { if (!on && settle) settle.stop(); } };
  }
  window.ABProbe = { mount };
})();
