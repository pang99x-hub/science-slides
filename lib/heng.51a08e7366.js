/* 심화 · 열기관의 열효율(화력 발전소). 삽으로 석탄을 불에 퍼 넣으면(한 삽 25 J) 흡수한 열 Q₁이 늘고,
   보일러 밸브를 돌려 수증기를 더 뜨겁게 하면 같은 Q₁에서 터빈이 하는 일 W가 커진다(열효율 0.15~0.45).
   방출한 열 Q₂ = Q₁ − W는 냉각기에서 바다로 나간다. 밸브를 끝까지 돌려도 Q₂는 0이 되지 않는다. 관 속 알갱이: 수증기(흰색) → 물(파란색) */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const K = 0.17;                                   // 화살표 굵기(px / J)

  function arrow(line, head, x1, y1, x2, y2, w) {
    line.setAttribute('d', `M${x1} ${y1} L ${x2} ${y2}`); line.style.strokeWidth = String(w);
    const a = Math.atan2(y2 - y1, x2 - x1), hw = w / 2 + 12, L = 26 + w * 0.3;
    const px = -Math.sin(a), py = Math.cos(a);
    head.setAttribute('points', [[x2 + px * hw, y2 + py * hw], [x2 + Math.cos(a) * L, y2 + Math.sin(a) * L], [x2 - px * hw, y2 - py * hw]].map((p) => p.map((v) => v.toFixed(1)).join(',')).join(' '));
  }

  function mount(root) {
    const svg = root.querySelector('.he-svg'), q = (s) => svg.querySelector(s);
    const nEl = root.querySelector('.he-n'), less = root.querySelector('#he-less');
    const shovel = q('.he-shovel'), valve = q('.he-valve'), spokes = q('.he-vs'), tf = q('.he-tf');
    const o1 = root.querySelector('.he-o1'), o2 = root.querySelector('.he-o2'), nowEl = root.querySelector('.he-now'), msg = root.querySelector('.he-msg');
    const blades = q('.he-blades'), lglow = q('.he-lglow'), plume = q('.he-plume'), warm = q('.he-cool.warm'), fire = q('.he-fire');
    const tv = { q1: q('.he-tq1 .he-tv'), w: q('.he-tw .he-tv'), q2: q('.he-tq2 .he-tv') };
    const pipes = [...svg.querySelectorAll('.he-pipe')].map((p) => ({ p, L: p.getTotalLength(), water: p.classList.contains('he-water') }));
    const dotsG = q('.he-dots'), dots = [];
    pipes.forEach((pp, j) => { for (let i = 0; i < 6; i++) { const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', '6'); c.setAttribute('class', pp.water ? 'he-dw' : 'he-ds'); dotsG.appendChild(c); dots.push({ c, pp, u: i / 6 + j * 0.05 }); } });
    const tongues = [0, 1, 2, 3].map(() => { const p = document.createElementNS(NS, 'path'); p.setAttribute('class', 'he-flame'); fire.appendChild(p); return p; });
    let Q1 = 100, Q2 = 70, W = 30, ang = 0, t = 0, shov = 4, rot = 150, lumps = [];
    const REST = { x: 52, y: 614 }, ROT_MAX = 300;

    function read() {
      Q1 = shov * 25; const e = 0.15 + 0.3 * rot / ROT_MAX;
      W = Math.round(Q1 * e); Q2 = Q1 - W;
      nEl.textContent = String(shov); o1.textContent = `${Q1} J`;
      o2.textContent = rot < 60 ? '낮음' : rot < 180 ? '보통' : rot < 270 ? '높음' : '아주 높음';
      tf.setAttribute('width', (18 + 132 * rot / ROT_MAX).toFixed(1));
      spokes.setAttribute('transform', `rotate(${rot.toFixed(1)} 200 262)`);
      tv.q1.textContent = `${Q1} J`; tv.w.textContent = `${W} J`; tv.q2.textContent = `${Q2} J`;
      nowEl.innerHTML = `W = ${Q1} − ${Q2} = <b>${W} J</b><br>e = ${W} ÷ ${Q1} = <b>${e.toFixed(2)}</b> (${Math.round(e * 100)} %)`;
      msg.textContent = rot >= ROT_MAX ? '밸브를 끝까지 돌려도 Q₂는 0이 되지 않는다 — 열기관은 남은 열을 꼭 내보낸다'
        : rot <= 0 ? '수증기가 덜 뜨거우면 같은 열로 일을 적게 한다' : shov >= 8 ? '불이 가득 찼다(8삽)' : '';
      arrow(q('.he-q1'), q('.he-q1h'), 200, 600, 200, 536, Q1 * K);
      arrow(q('.he-w'), q('.he-wh'), 636, 60, 712, 60, Math.max(3, W * K));
      arrow(q('.he-q2'), q('.he-q2h'), 652, 522, 744, 590, Math.max(3, Q2 * K));
      lglow.style.opacity = String(Math.min(1, W / 120));
      plume.style.opacity = String(0.15 + Math.min(0.85, Q2 / 170));
      warm.style.opacity = String(0.3 + Math.min(0.7, Q2 / 150));
    }
    function step(dt) {
      t += dt; ang = (ang + dt * W * 5) % 360;
      blades.setAttribute('transform', `rotate(${ang} 560 140)`);
      dots.forEach((d) => {
        d.u = (d.u + dt * (0.05 + Q1 / 1400)) % 1;
        const p = d.pp.p.getPointAtLength(d.u * d.pp.L);
        d.c.setAttribute('cx', p.x.toFixed(1)); d.c.setAttribute('cy', p.y.toFixed(1));
      });
      lumps = lumps.filter((l) => { l.t += dt; const k = Math.min(1, l.t / 0.5); l.g.setAttribute('transform', `translate(${(l.x0 + (180 - l.x0) * k).toFixed(1)} ${(l.y0 + (570 - l.y0) * k * k).toFixed(1)})`); if (k >= 1) { l.g.remove(); return false; } return true; });
      const s = 0.45 + Q1 / 200 * 0.75;
      tongues.forEach((p, i) => {
        const x = 140 + i * 40, h = (34 + 40 * s) * (0.8 + 0.25 * Math.sin(t * 9 + i * 1.7)), w = 16 + 8 * s;
        p.setAttribute('d', `M${x - w} 592 Q ${x - w * 0.8} ${592 - h * 0.55} ${x + Math.sin(t * 6 + i) * 5} ${592 - h} Q ${x + w * 0.8} ${592 - h * 0.55} ${x + w} 592 Z`);
      });
    }
    const pt = (ev) => { const p = svg.createSVGPoint(); p.x = ev.clientX; p.y = ev.clientY; return p.matrixTransform(svg.getScreenCTM().inverse()); };
    const place = (x, y) => shovel.setAttribute('transform', `translate(${x.toFixed(1)} ${y.toFixed(1)})`);
    function addCoal(x, y) {
      if (shov >= 8) { read(); return; }
      shov++; read();
      const g = document.createElementNS(NS, 'path'); g.setAttribute('class', 'he-lump'); g.setAttribute('d', 'M-12 -6 l 8 -8 l 10 4 l 4 8 l -12 4 z'); svg.appendChild(g);
      lumps.push({ g, x0: x, y0: y, t: 0 }); if (!loop.on) step(0.6);
    }
    // 삽: 끌어서 불 위(보일러 아래)에 놓으면 한 삽
    let sh = null;
    shovel.addEventListener('pointerdown', (ev) => { sh = pt(ev); try { shovel.setPointerCapture(ev.pointerId); } catch { /* 합성 이벤트 */ } shovel.classList.add('drag'); ev.stopPropagation(); });
    shovel.addEventListener('pointermove', (ev) => { if (!sh) return; const p = pt(ev); place(p.x, p.y); });
    const shUp = (ev) => {
      if (!sh) return; const p = pt(ev), moved = Math.hypot(p.x - sh.x, p.y - sh.y) > 8; sh = null; shovel.classList.remove('drag');
      if (!moved || (p.x > 100 && p.x < 300 && p.y > 480 && p.y < 610)) addCoal(moved ? p.x : 180, moved ? p.y : 560);
      else msg.textContent = '삽을 보일러 아래 불 위에 놓아 보자';
      place(REST.x, REST.y);
    };
    shovel.addEventListener('pointerup', shUp); shovel.addEventListener('pointercancel', () => { sh = null; place(REST.x, REST.y); });
    shovel.addEventListener('keydown', (ev) => { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); ev.stopPropagation(); addCoal(180, 560); } });
    less.addEventListener('click', () => { shov = Math.max(1, shov - 1); read(); });
    // 밸브: 바퀴를 잡고 원을 그리며 돌린다(0~300°)
    let va = null;
    const angAt = (ev) => { const p = pt(ev); return Math.atan2(p.y - 262, p.x - 200) * 180 / Math.PI; };
    valve.addEventListener('pointerdown', (ev) => { va = angAt(ev); try { valve.setPointerCapture(ev.pointerId); } catch { /* 합성 이벤트 */ } valve.classList.add('drag'); ev.stopPropagation(); });
    valve.addEventListener('pointermove', (ev) => { if (va === null) return; const a = angAt(ev); let d = a - va; if (d > 180) d -= 360; if (d < -180) d += 360; va = a; rot = Math.max(0, Math.min(ROT_MAX, rot + d)); read(); });
    const vUp = () => { va = null; valve.classList.remove('drag'); };
    valve.addEventListener('pointerup', vUp); valve.addEventListener('pointercancel', vUp);
    valve.addEventListener('keydown', (ev) => { const d = { ArrowRight: 30, ArrowUp: 30, ArrowLeft: -30, ArrowDown: -30 }[ev.key]; if (d) { ev.preventDefault(); ev.stopPropagation(); rot = Math.max(0, Math.min(ROT_MAX, rot + d)); read(); } });
    place(REST.x, REST.y);
    root._heng = { set(n, r) { shov = n; rot = r; read(); } };
    const loop = window.Stage.loop(step);
    read(); step(0);
    return { setActive(on) { if (on && !window.Stage.reduce) loop.start(); else { loop.stop(); step(0); } } };
  }
  window.HeatEngine = { mount };
})();
