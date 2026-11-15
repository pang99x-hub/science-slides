/* 3차시 4장 외래생물 관리: 연못에 누군가 풀어 준 블루길 두 마리. 시간이 흐르면(한 해 = 3초) 블루길은 해마다 크게 불어나고
   토종 물고기(붕어·버들치·송사리)는 알과 새끼를 먹혀 줄어든다. 블루길을 눌러 잡아낸다. 일찍 잡을수록 쉽다.
   물길 입구의 «길목 막기»를 켜면 새로 들어오는 블루길이 없다. 번식 속도와 토종 감소는 이해를 돕기 위한 예. 10년이 지나면 멈춘다. */
(function () {
  'use strict';
  const { el, clamp, rand } = window.Kit;
  const W = 1056, H = 640, YEAR = 3, NATIVE = 18;
  const pondAt = (x, y) => ((x - 560) / 430) ** 2 + ((y - 340) / 250) ** 2 < 1;

  function mount(root) {
    const svg = root.querySelector('.al-svg'), now = root.querySelector('.al-now'), msg = root.querySelector('.al-msg');
    const vY = root.querySelector('.al-year'), vA = root.querySelector('.al-a'), vN = root.querySelector('.al-n'), vC = root.querySelector('.al-c'), gate = root.querySelector('.al-gate'), again = root.querySelector('.al-again');
    const chart = root.querySelector('.al-chart');
    el('rect', { class: 'al-land', width: W, height: H }, svg);
    el('path', { class: 'al-stream', d: 'M0 120 C 60 140 110 170 170 230' }, svg);
    el('ellipse', { class: 'al-pond', cx: 560, cy: 340, rx: 440, ry: 260 }, svg);
    for (let i = 0; i < 12; i++) { const a = i / 12 * 6.28; el('path', { class: 'al-weed', d: `M${(560 + 400 * Math.cos(a)).toFixed(0)} ${(340 + 230 * Math.sin(a)).toFixed(0)} q 6 -18 0 -34` }, svg); }
    const gateG = el('g', { class: 'al-gateg', transform: 'translate(110 175)' }, svg); el('rect', { x: -40, y: -14, width: 80, height: 28, rx: 6 }, gateG); el('text', { y: 8 }, gateG).textContent = '막음';
    el('text', { class: 'al-in', x: 12, y: 100 }, svg).textContent = '물길 입구';
    const school = el('g', {}, svg), fx = el('g', {}, svg);
    let fish = [], t = 0, caught = 0, run = true, rnd = rand(3), hist = [], lastYear = -1;
    const mk = (kind) => {
      let x, y; do { x = 160 + rnd() * 800; y = 110 + rnd() * 460; } while (!pondAt(x, y));
      const g = el('g', { class: 'al-fish ' + kind }, school);
      if (kind === 'blue') { el('path', { d: 'M-26 0 q 24 -24 50 0 q -26 24 -50 0 z M22 0 l 14 -12 v 24 z', class: 'al-bb' }, g); el('circle', { cx: -12, cy: -4, r: 5, class: 'al-gill' }, g); g.setAttribute('role', 'button'); g.setAttribute('aria-label', '블루길 잡기'); }
      else { el('path', { d: 'M-16 0 q 14 -12 30 0 q -16 12 -30 0 z M12 0 l 9 -7 v 14 z', class: 'al-nb' }, g); }
      const f = { kind, g, x, y, a: rnd() * 6.28, s: kind === 'blue' ? 60 : 45 };
      if (kind === 'blue') {
        const grab = (e) => { e.stopPropagation(); e.preventDefault(); if (!run || f.gone) return; f.gone = true; caught++; g.classList.add('net'); setTimeout(() => g.remove(), 300); fish = fish.filter((z) => z !== f); const m = el('text', { class: 'al-got', x: f.x, y: f.y - 20 }, fx); m.textContent = '잡았다'; setTimeout(() => m.remove(), 700); count(); };
        g.addEventListener('pointerdown', grab);
      }
      fish.push(f); return f;
    };
    const n = (k) => fish.filter((f) => f.kind === k).length;
    function count() {
      vA.textContent = `${n('blue')}마리`; vN.textContent = `${n('native')}마리`; vC.textContent = `${caught}마리`;
    }
    function drawChart() {
      chart.innerHTML = '';
      const max = 60, wv = 300, hv = 110;
      const pts = (k) => hist.map((h, i) => `${(i / 10 * wv).toFixed(1)} ${(hv - Math.min(max, h[k]) / max * hv).toFixed(1)}`).join(' L ');
      if (hist.length > 1) { el('path', { d: 'M' + pts('b'), class: 'al-lb' }, chart); el('path', { d: 'M' + pts('n'), class: 'al-ln' }, chart); }
    }
    function yearTick(y) {
      const b = n('blue');
      // 번식: 블루길 1쌍마다 새끼 몇 마리(밀도가 높으면 덜)
      const born = Math.round(b * 0.8 * (1 - b / 60)); for (let i = 0; i < born; i++) mk('blue');
      if (!gate.checked && y % 2 === 1) mk('blue');
      // 토종: 블루길이 많을수록 줄고, 적으면 조금씩 회복
      const nv = n('native'), target = Math.round(NATIVE * clamp(1 - n('blue') / 30, 0, 1));
      if (nv > target) { fish.filter((f) => f.kind === 'native').slice(0, Math.min(nv - target, 4)).forEach((f) => { f.g.remove(); fish = fish.filter((z) => z !== f); }); }
      else if (nv < target) mk('native');
      hist.push({ b: n('blue'), n: n('native') }); drawChart(); count();
    }
    function reset() {
      school.innerHTML = ''; fish = []; t = 0; caught = 0; run = true; hist = []; lastYear = 0; rnd = rand(3);
      for (let i = 0; i < NATIVE; i++) mk('native');
      mk('blue'); mk('blue');
      hist.push({ b: 2, n: NATIVE }); drawChart(); count(); vY.textContent = '0년'; msg.textContent = '';
      now.textContent = '블루길(파란 아가미)을 눌러 잡아내자';
    }
    gate.addEventListener('change', () => { gateG.classList.toggle('on', gate.checked); });
    again.addEventListener('click', reset);
    const loop = window.Kit.ticker((dt) => {
      if (run) {
        t += dt; const y = Math.floor(t / YEAR);
        if (y !== lastYear && y <= 10) { lastYear = y; yearTick(y); vY.textContent = `${y}년`; }
        if (t >= 10 * YEAR + 0.5) {
          run = false; const b = n('blue'), nv = n('native');
          msg.innerHTML = b === 0 ? `<b>10년 동안 블루길을 막아 냈다.</b> 토종 물고기 ${nv}마리가 산다. 일찍 찾아 바로 없애는 것이 가장 쉽다.`
            : b < 10 ? `<b>블루길 ${b}마리가 남았다.</b> 조금만 남아도 다시 불어난다 — 계속 지켜보고 잡아야 한다.`
              : `<b>블루길이 ${b}마리로 불어나 토종 물고기가 ${nv}마리만 남았다.</b> 한번 퍼지면 다 잡기 어렵다.`;
          now.textContent = '«처음부터»로 다시 해 보자';
        }
      }
      fish.forEach((f) => {
        f.a += (rnd() - 0.5) * 2 * dt; let nx = f.x + Math.cos(f.a) * f.s * dt, ny = f.y + Math.sin(f.a) * f.s * 0.6 * dt;
        if (!pondAt(nx, ny)) { f.a += Math.PI * (0.6 + rnd() * 0.8); nx = f.x; ny = f.y; }
        f.x = nx; f.y = ny; f.g.setAttribute('transform', `translate(${f.x.toFixed(1)} ${f.y.toFixed(1)}) scale(${Math.cos(f.a) < 0 ? -1 : 1} 1)`);
      });
    });
    reset();
    root._al = { skip(y) { for (let i = 0; i < y; i++) { lastYear++; yearTick(lastYear); } t = lastYear * YEAR; vY.textContent = `${lastYear}년`; }, catchAll() { fish.filter((f) => f.kind === 'blue').forEach((f) => f.g.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true }))); }, reset };
    return { setActive(on) { if (on) { reset(); loop.start(); } else loop.stop(); } };
  }
  window.Alien = { mount };
})();
