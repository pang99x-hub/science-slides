/* 2차시 5장(교과서 44쪽): 뚜껑 덮은 유리종 속 화분. 해를 하늘 길(타원) 따라 끌면 시각이 바뀐다.
   빛 L = max(0, sin θ). 광합성 빠르기 = 0.12·L·(CO₂ 남은 정도), 세포호흡 = 0.035(밤낮없이). O₂·CO₂는 서로 반대로 오르내린다.
   유리종 속 분자 모형 수가 O₂·CO₂ 양을 따라간다. 값은 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const { el, clamp, pt, hold, atom, mix, keep } = window.RX;
  const OX = 528, OY = 560, AX = 480, AY = 515;

  function mount(root) {
    const svg = root.querySelector('.rx-jr-svg');
    const now = root.querySelector('.rx-jr-now');
    const q = (s) => root.querySelector(s);
    const cards = { ps: q('.rx-eqc[data-k="ps"]'), rs: q('.rx-eqc[data-k="rs"]') };
    const sky = el('rect', { x: 0, y: 0, width: 1056, height: 740 }, svg);
    const stars = el('g', {}, svg);
    for (let i = 0; i < 30; i++) el('circle', { cx: (i * 97) % 1056, cy: 20 + (i * 53) % 300, r: 2, fill: '#fff' }, stars);
    el('path', { d: `M${OX - AX} ${OY} A ${AX} ${AY} 0 0 1 ${OX + AX} ${OY}`, fill: 'none', stroke: '#ffffff', 'stroke-width': 3, 'stroke-dasharray': '6 10', opacity: 0.6 }, svg);
    const sun = el('g', { class: 'rx-jr-sun' }, svg);
    el('circle', { r: 46, fill: '#ffd447', stroke: '#1d2433', 'stroke-width': 3 }, sun);
    for (let i = 0; i < 8; i++) el('path', { d: 'M0 -58 L 0 -74', stroke: '#f2b417', 'stroke-width': 6, 'stroke-linecap': 'round', transform: `rotate(${i * 45})` }, sun);
    const moon = el('path', { d: 'M880 80 a 40 40 0 1 0 40 52 a 32 32 0 1 1 -40 -52 z', fill: '#f2efe0' }, svg);
    el('rect', { x: 0, y: OY, width: 1056, height: 180, fill: '#8d6e4f' }, svg);
    el('rect', { x: 200, y: OY - 14, width: 656, height: 24, rx: 6, fill: '#cdbfa8', stroke: '#1d2433', 'stroke-width': 3 }, svg);
    // 유리종
    const jarIn = el('g', {}, svg);
    el('path', { d: 'M280 546 L 280 300 Q 280 150 528 150 Q 776 150 776 300 L 776 546 Z', fill: '#dff1f8', 'fill-opacity': 0.35 }, jarIn);
    // 화분과 식물
    el('path', { d: 'M470 546 L 456 470 L 600 470 L 586 546 Z', fill: '#b5552a', stroke: '#1d2433', 'stroke-width': 3 }, svg);
    el('path', { d: 'M528 470 C 528 420, 520 360, 528 300', fill: 'none', stroke: '#3f7a35', 'stroke-width': 8 }, svg);
    const leaves = el('g', {}, svg);
    [[-1, 420], [1, 380], [-1, 340], [1, 310]].forEach(([s, y]) => el('path', { d: `M528 ${y} C ${528 + s * 50} ${y - 50}, ${528 + s * 120} ${y - 20}, ${528 + s * 130} ${y + 10} C ${528 + s * 90} ${y + 20}, ${528 + s * 40} ${y + 10}, 528 ${y} Z`, fill: '#5fae4a', stroke: '#1d2433', 'stroke-width': 2.5 }, leaves));
    const mols = el('g', {}, svg);
    el('path', { d: 'M280 546 L 280 300 Q 280 150 528 150 Q 776 150 776 300 L 776 546', fill: 'none', stroke: '#1d2433', 'stroke-width': 4 }, svg);
    el('path', { d: 'M310 300 Q 320 200 420 180', fill: 'none', stroke: '#fff', 'stroke-width': 8, opacity: 0.6, 'stroke-linecap': 'round' }, svg);
    el('rect', { x: 498, y: 132, width: 60, height: 22, rx: 8, fill: '#9aa3ae', stroke: '#1d2433', 'stroke-width': 3 }, svg);
    const clock = el('text', { class: 'rx-jr-clock', x: 1030, y: 720, 'text-anchor': 'end' }, svg);

    // 유리종 속 분자 모형
    const pool = { O2: [], CO2: [] };
    const mkMol = (k) => {
      const g = el('g', {}, mols);
      if (k === 'O2') { atom(g, 'O', -9, 0, 10, ''); atom(g, 'O', 9, 0, 10, ''); }
      else { atom(g, 'O', -17, 0, 9, ''); atom(g, 'C', 0, 0, 10, ''); atom(g, 'O', 17, 0, 9, ''); }
      return { g, x: 320 + Math.random() * 410, y: 200 + Math.random() * 320, vx: (Math.random() - 0.5) * 60, vy: (Math.random() - 0.5) * 60 };
    };
    for (let i = 0; i < 20; i++) { pool.O2.push(mkMol('O2')); pool.CO2.push(mkMol('CO2')); }

    let th = Math.PI * 0.12, o2 = 0.5, co2 = 0.5, T = 0, sawDay = false, sawNight = false;
    const place = () => {
      const L = Math.max(0, Math.sin(th));
      sun.setAttribute('transform', `translate(${OX - AX * Math.cos(th)} ${OY - AY * Math.sin(th)})`);
      sun.style.display = Math.sin(th) < -0.02 ? 'none' : '';
      sky.setAttribute('fill', mix('#1f2a44', '#bfe3f2', Math.min(1, L * 2.2)));
      stars.setAttribute('opacity', L > 0.05 ? 0 : 1); moon.setAttribute('opacity', L > 0.05 ? 0 : 1);
      // 시각: 해 뜸(θ=0) 6시 → 정오(π/2) 12시 → 해 짐(π) 18시 → 밤
      let a = ((th % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI), h = 6 + a / Math.PI * 12; if (h >= 24) h -= 24;
      clock.textContent = `${String(Math.floor(h)).padStart(2, '0')}:${String(Math.floor((h % 1) * 60)).padStart(2, '0')}`;
      return L;
    };
    let grab = false;
    hold(svg, {
      down(e) { const p = pt(svg, e); const sx = OX - AX * Math.cos(th), sy = OY - AY * Math.sin(th); grab = Math.hypot(p.x - sx, p.y - sy) < 90 || p.y < 150 || p.x < 270 || p.x > 790; if (grab) { svg.classList.add('holding'); } },
      move(e) { if (!grab) return; const p = pt(svg, e); th = Math.atan2(-(p.y - OY) / AY, -(p.x - OX) / AX); place(); },
      up() { grab = false; svg.classList.remove('holding'); },
    });
    keep(svg);
    svg.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight') { th += 0.15; e.preventDefault(); } if (e.key === 'ArrowLeft') { th -= 0.15; e.preventDefault(); } place(); });
    function step(dt) {
      T += dt;
      const L = place();
      const P = 0.12 * L * (co2 / (co2 + 0.08)), Rr = 0.035 * (o2 / (o2 + 0.05));
      o2 = clamp(o2 + (P - Rr) * dt, 0, 1); co2 = clamp(co2 + (Rr - P) * dt, 0, 1);
      if (L > 0.5) sawDay = true; if (L === 0 && sawDay) sawNight = true;
      const nO = Math.round(o2 * 20), nC = Math.round(co2 * 20);
      ['O2', 'CO2'].forEach((k) => pool[k].forEach((m, i) => {
        m.x += m.vx * dt; m.y += m.vy * dt;
        if (m.x < 310 || m.x > 750) m.vx *= -1; if (m.y < 190 || m.y > 530) m.vy *= -1;
        m.x = clamp(m.x, 310, 750); m.y = clamp(m.y, 190, 530);
        m.g.setAttribute('transform', `translate(${m.x.toFixed(1)} ${m.y.toFixed(1)})`);
        m.g.style.display = i < (k === 'O2' ? nO : nC) ? '' : 'none';
      }));
      q('.rx-jr-o2').style.width = (o2 * 100) + '%'; q('.rx-jr-co2').style.width = (co2 * 100) + '%';
      const net = P - Rr;
      q('.rx-jr-o2v').textContent = Math.abs(net) < 0.004 ? '그대로' : net > 0 ? '늘어난다' : '줄어든다';
      q('.rx-jr-co2v').textContent = Math.abs(net) < 0.004 ? '그대로' : net > 0 ? '줄어든다' : '늘어난다';
      cards.ps.classList.toggle('on', L > 0.1); cards.rs.classList.toggle('on', true);
      cards.ps.classList.toggle('dim', L <= 0.1); cards.rs.classList.toggle('dim', false);
      leaves.setAttribute('opacity', 0.75 + L * 0.25);
      now.textContent = !sawDay ? '① 해를 끌어 하늘 높이 올려 보자' : !sawNight ? '② 해를 지평선 아래로 끌어 밤을 만들어 보자' : '낮과 밤에 기체가 어떻게 바뀌었나?';
      now.classList.toggle('done', sawNight);
    }
    const loop = window.Stage.loop(step);
    step(0.016);
    return { setActive(on) { if (on) loop.start(); else loop.stop(); }, sun: (a) => { th = a; place(); }, get gas() { return { o2, co2 }; } };
  }
  window.RxJar = { mount };
})();
