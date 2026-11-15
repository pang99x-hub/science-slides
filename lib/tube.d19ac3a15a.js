/* 1차시 5장(개념 넓히기): 산화 구리(Ⅱ)와 탄소 가루를 섞어 가열하고, 나온 기체를 석회수에 통과시킨다. 2CuO + C → 2Cu + CO₂
   - 가열 단추(또는 버너)를 누르고 있는 동안만 불이 켜지고 온도 θ가 오른다. 놓으면 식는다.
   - θ가 충분히 높을 때만 반응 정도 ξ가 늘고, 검은 알갱이가 문턱을 넘으며 붉어진다(불꽃 가까운 곳부터).
   - 생긴 CO₂ 거품이 석회수로 들어가면 석회수가 뿌옇게 된다. 유리관을 뺀 뒤 생긴 기체는 공기로 나간다.
   - 유리관이 석회수에 잠긴 채 식히면 석회수가 거꾸로 빨려 올라온다(역류) → 끝까지 오르면 시험관이 깨진다.
   빠르기는 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const { el, clamp, mix, keep } = window.RX;

  function mount(root) {
    const svg = root.querySelector('.rx-tb-svg');
    const now = root.querySelector('.rx-tb-now');
    const msg = root.querySelector('.rx-tb-msg');
    const heatBtn = root.querySelector('.rx-tb-heat'), pipeBtn = root.querySelector('.rx-tb-pipe');
    const q = (s) => root.querySelector(s);
    const obsL = q('.rx-obs[data-k="lime"]'), obsP = q('.rx-obs[data-k="powder"]');

    el('rect', { x: 0, y: 0, width: 1056, height: 740, fill: '#eef2ef' }, svg);
    el('rect', { x: 0, y: 690, width: 1056, height: 50, fill: '#cdbfa8' }, svg);
    // 스탠드
    el('rect', { class: 'rx-tb-steel', x: 60, y: 140, width: 16, height: 552 }, svg);
    el('rect', { class: 'rx-tb-steel', x: 30, y: 680, width: 200, height: 14, rx: 4 }, svg);
    el('rect', { class: 'rx-tb-steel', x: 68, y: 318, width: 200, height: 12, rx: 4 }, svg);
    el('rect', { class: 'rx-tb-clamp', x: 250, y: 300, width: 34, height: 54, rx: 6 }, svg);
    // 버너
    const BX = 220;
    const burner = el('g', { class: 'rx-tb-burner' }, svg);
    el('rect', { class: 'rx-tb-steel', x: BX - 70, y: 666, width: 140, height: 24, rx: 6 }, burner);
    el('rect', { class: 'rx-tb-steel', x: BX - 18, y: 440, width: 36, height: 230, rx: 4 }, burner);
    el('rect', { x: BX - 26, y: 616, width: 52, height: 20, rx: 6, fill: '#8a919b', stroke: '#1d2433', 'stroke-width': 2 }, burner);
    el('path', { d: `M${BX + 70} 676 L 300 676`, stroke: '#e2622b', 'stroke-width': 9, 'stroke-linecap': 'round' }, burner);
    const flameO = el('path', { class: 'rx-tb-flame' }, svg);
    const flameI = el('path', { class: 'rx-tb-flame2' }, svg);
    // 시험관(입구가 조금 아래로)
    const tubeG = el('g', { transform: 'rotate(6 300 330)' }, svg);
    el('path', { class: 'rx-tb-glass', d: 'M100 300 L 470 300 L 470 360 L 100 360 A 30 30 0 0 1 100 300 Z' }, tubeG);
    const powder = el('g', {}, tubeG);
    el('path', { d: 'M76 352 Q 90 318 130 322 L 320 330 Q 340 340 340 356 L 100 358 Q 80 358 76 352 Z', fill: '#2a2626' }, powder);
    let seed = 5; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    const grains = [];
    for (let i = 0; i < 150; i++) {
      const x = 84 + rnd() * 250, top = 326 + Math.max(0, (x - 300) * 0.5), y = top + rnd() * (354 - top);
      const near = Math.abs(x - BX) / 160;
      grains.push({ e: el('circle', { cx: x, cy: y, r: 2.5 + rnd() * 3, fill: '#1e1a1a' }, powder), th: clamp(0.1 + near * 0.55 + rnd() * 0.35, 0.05, 0.98) });
    }
    const crack = el('path', { class: 'rx-tb-crack', d: 'M210 300 l 14 18 l -10 10 l 18 16 M 300 302 l -8 22 l 14 8 l -6 26' }, tubeG);
    el('rect', { class: 'rx-tb-stopper', x: 462, y: 296, width: 30, height: 68, rx: 4 }, tubeG);
    // 석회수 시험관
    const LX = 760;
    el('rect', { class: 'rx-tb-steel', x: LX - 80, y: 600, width: 160, height: 14, rx: 4 }, svg);
    el('rect', { class: 'rx-tb-steel', x: LX - 70, y: 614, width: 10, height: 78 }, svg);
    el('rect', { class: 'rx-tb-steel', x: LX + 60, y: 614, width: 10, height: 78 }, svg);
    const lime = el('path', { d: `M${LX - 34} 520 L ${LX - 34} 650 A 34 34 0 0 0 ${LX + 34} 650 L ${LX + 34} 520 Z`, fill: '#e8f4fa' }, svg);
    const specks = el('g', {}, svg);
    for (let i = 0; i < 46; i++) el('circle', { cx: LX - 28 + rnd() * 56, cy: 530 + rnd() * 150, r: 2 + rnd() * 2.5, fill: '#ffffff', stroke: '#c9c9bd', 'stroke-width': 1 }, specks);
    el('path', { class: 'rx-tb-glass', d: `M${LX - 38} 430 L ${LX - 38} 650 A 38 38 0 0 0 ${LX + 38} 650 L ${LX + 38} 430` }, svg);
    el('text', { class: 'rx-tb-lab', x: LX + 60, y: 470 }, svg).textContent = '석회수';
    el('text', { class: 'rx-tb-lab', x: 200, y: 270 }, svg).textContent = '산화 구리(Ⅱ) + 탄소 가루';
    // 유리관
    const pipe = el('path', { class: 'rx-tb-pipe' }, svg);
    const pipeIn = el('path', { class: 'rx-tb-pipe2' }, svg);
    const suck = el('path', { class: 'rx-tb-suck' }, svg);
    const pipeHit = el('circle', { class: 'rx-tb-pipehit', r: 46, tabindex: 0, role: 'button', 'aria-label': '유리관 빼기 또는 넣기' }, svg);
    const bubbles = el('g', {}, svg);

    let theta = 0, xi = 0, cloud = 0, sb = 0, heating = false, inLime = true, broken = false, maxT = 0, T = 0, pipeY = 640;
    const bub = [];
    function setPipe(on) {
      inLime = on; pipeBtn.textContent = on ? '유리관 빼기' : '유리관 넣기'; pipeBtn.setAttribute('aria-pressed', String(on));
    }
    pipeBtn.addEventListener('click', () => setPipe(!inLime));
    pipeHit.addEventListener('click', () => setPipe(!inLime));
    keep(pipeHit); pipeHit.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setPipe(!inLime); } });
    const on = (e) => { if (broken) { msg.textContent = '시험관이 깨졌다. «새 시험관»으로 다시 해 보자'; return; } heating = true; heatBtn.setAttribute('aria-pressed', 'true'); if (e && e.pointerId != null) try { e.currentTarget.setPointerCapture(e.pointerId); } catch (err) { /* 그대로 */ } };
    const off = () => { heating = false; heatBtn.setAttribute('aria-pressed', 'false'); };
    [heatBtn, burner].forEach((n) => {
      n.addEventListener('pointerdown', (e) => { e.stopPropagation(); e.preventDefault(); on(e); });
      n.addEventListener('pointerup', off); n.addEventListener('pointercancel', off); n.addEventListener('lostpointercapture', off);
    });
    heatBtn.addEventListener('keydown', (e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); e.stopPropagation(); if (!e.repeat) on(); } });
    heatBtn.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') off(); });
    heatBtn.addEventListener('click', (e) => e.preventDefault());
    burner.style.cursor = 'pointer';
    function reset() { theta = 0; xi = 0; cloud = 0; sb = 0; broken = false; maxT = 0; off(); setPipe(true); crack.style.opacity = 0; obsL.classList.remove('on'); obsP.classList.remove('on'); msg.textContent = ''; now.classList.remove('done'); bub.length = 0; bubbles.innerHTML = ''; }
    q('.rx-tb-reset').addEventListener('click', reset);

    function step(dt) {
      T += dt;
      if (heating) theta += (1 - theta) * 0.45 * dt; else theta -= theta * 0.22 * dt;
      maxT = Math.max(maxT, theta);
      const rate = heating && theta > 0.55 && xi < 1 ? 0.1 * (theta - 0.55) / 0.45 : 0;
      xi = clamp(xi + rate * dt, 0, 1);
      if (inLime) cloud = clamp(cloud + rate * 1.7 * dt, 0, 1);
      // 역류
      if (inLime && !heating && maxT > 0.5 && theta > 0.15 && !broken) sb += 0.22 * dt; else sb -= 0.6 * dt;
      sb = clamp(sb, 0, 1);
      if (sb >= 1 && !broken) { broken = true; off(); crack.style.opacity = 1; msg.innerHTML = '<b>역류!</b> 차가운 석회수가 뜨거운 시험관으로 들어가 시험관이 깨졌다. 불을 끄기 전에 유리관부터 빼야 한다'; }
      // 그림
      const fh = heating ? 95 + 8 * Math.sin(T * 14) : 0, FB = 440;
      flameO.setAttribute('d', fh ? `M${BX - 20} ${FB} C ${BX - 24} ${FB - fh * 0.5}, ${BX - 4} ${FB - fh * 0.9}, ${BX} ${FB - fh} C ${BX + 4} ${FB - fh * 0.9}, ${BX + 24} ${FB - fh * 0.5}, ${BX + 20} ${FB} Z` : '');
      flameI.setAttribute('d', fh ? `M${BX - 10} ${FB} C ${BX - 10} ${FB - 30}, ${BX} ${FB - fh * 0.45}, ${BX} ${FB - fh * 0.45} C ${BX} ${FB - fh * 0.45}, ${BX + 10} ${FB - 30}, ${BX + 10} ${FB} Z` : '');
      grains.forEach((g) => g.e.setAttribute('fill', xi > g.th ? '#c8653a' : mix('#1e1a1a', '#5a2a1a', theta * 0.4)));
      pipeY += ((inLime ? 640 : 470) - pipeY) * Math.min(1, dt * 8);
      const d = `M492 368 L ${LX - 40} 368 Q ${LX} 368 ${LX} 408 L ${LX} ${pipeY}`;
      pipe.setAttribute('d', d); pipeIn.setAttribute('d', d);
      pipeHit.setAttribute('cx', LX); pipeHit.setAttribute('cy', pipeY - 30);
      suck.setAttribute('d', sb > 0 ? `M${LX} ${pipeY} L ${LX} ${Math.max(372, pipeY - sb / 0.6 * (pipeY - 372))}${sb > 0.6 ? ` L ${LX - (sb - 0.6) / 0.4 * (LX - 492)} 368` : ''}` : '');
      lime.setAttribute('fill', mix('#a9d6ea', '#d6d5c8', cloud));
      lime.setAttribute('opacity', 0.75 + cloud * 0.25);
      specks.setAttribute('opacity', cloud.toFixed(2));
      // 거품
      if (rate > 0 && Math.random() < rate * 40 * dt * 10) bub.push({ x: LX + (Math.random() - 0.5) * 6, y: inLime ? pipeY : pipeY, life: 0, air: !inLime, e: el('circle', { r: 4 + Math.random() * 4, class: inLime ? 'rx-tb-bub' : 'rx-tb-gas' }, bubbles) });
      for (let i = bub.length - 1; i >= 0; i--) {
        const b = bub[i]; b.life += dt; b.y -= (b.air ? 30 : 70) * dt; b.x += Math.sin(b.life * 8) * 0.6;
        b.e.setAttribute('cx', b.x); b.e.setAttribute('cy', b.y);
        if ((!b.air && b.y < 524) || b.life > 2.2) { b.e.remove(); bub.splice(i, 1); }
      }
      // 기록
      q('.rx-tb-mass').style.width = (100 - xi * 22) + '%'; q('.rx-tb-mv').textContent = xi < 0.02 ? '처음 그대로' : '줄어든다';
      q('.rx-tb-temp').style.width = (theta * 100) + '%';
      q('.rx-tb-tv').textContent = theta < 0.15 ? '실온' : theta < 0.4 ? '따뜻함' : theta < 0.55 ? '뜨거움' : rate > 0 ? '아주 뜨거움 · 반응 중' : '아주 뜨거움';
      obsL.querySelector('p').innerHTML = cloud < 0.08 ? '맑다' : cloud < 0.4 ? '조금 뿌옇다' : '뿌옇게 흐려졌다 → <b>이산화 탄소</b>가 생겼다';
      obsP.querySelector('p').innerHTML = xi < 0.05 ? '검은색' : xi < 0.5 ? '불꽃 가까운 곳부터 붉은 알갱이가 생긴다' : '붉은 알갱이가 많아졌다 → <b>구리</b>가 생겼다';
      obsL.classList.toggle('on', cloud >= 0.4); obsP.classList.toggle('on', xi >= 0.5);
      if (!broken) {
        if (theta < 0.05 && xi === 0) now.textContent = '① 버너를 누르고 있어 보자';
        else if (xi < 0.5) now.textContent = heating ? '계속 누르고 있자 · 석회수를 지켜보자' : '불이 꺼져 식는 중 · 다시 눌러 가열하자';
        else if (inLime) now.textContent = '② 불을 끄기 전에 유리관부터 빼자';
        else { now.textContent = '이제 불을 꺼도 안전하다 · 무엇이 생겼나?'; now.classList.add('done'); }
        if (sb > 0.05 && !msg.textContent.includes('역류')) msg.innerHTML = '석회수가 유리관을 타고 거꾸로 올라온다! 유리관을 빼자';
        else if (sb === 0 && msg.innerHTML.startsWith('석회수가')) msg.textContent = '';
      }
    }
    const loop = window.Stage.loop(step);
    step(0.016);
    return {
      setActive(v) { if (v) { if (window.Stage.reduce) step(0.016); else loop.start(); } else { off(); loop.stop(); } },
      heat: (v) => (v ? on() : off()), pipe: setPipe, reset, get state() { return { theta, xi, cloud, sb, broken }; },
    };
  }
  window.RxTube = { mount };
})();
