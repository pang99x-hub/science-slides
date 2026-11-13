/* 2차시 3장(교과서 43쪽 해 보기): 위에서 본 페트리 접시에 구리 테이프 모양을 그리고, 스포이트로 질산 은 수용액을 떨어뜨린다.
   - 테이프: 끈 길을 따라 6단위마다 점을 찍어 굵은 구리 띠로 그린다.
   - 방울: 누르는 동안 퍼지며 커진다. 방울마다 Ag⁺·NO₃⁻ 20개씩(모형 값).
   - 방울에 잠긴 테이프 점마다 반응이 일어나 은 결정(가지)이 자라고, 반응한 만큼 Ag⁺ 2개 → Cu²⁺ 1개로 바뀌며 방울이 푸르러진다.
   빠르기·개수는 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const { clamp, cpt, hold, mix } = window.RX;
  const DW = 1056, DH = 740, CX = 528, CY = 370, CR = 320, TAPE = 22, PER = 20;

  function mount(root) {
    const cv = root.querySelector('canvas');
    const now = root.querySelector('.rx-ds-now'), msg = root.querySelector('.rx-ds-msg');
    const q = (s) => root.querySelector(s);
    const rows = Object.fromEntries([...root.querySelectorAll('.rx-cnt-row')].map((r) => [r.dataset.k, r]));
    let g = window.Stage.fit(cv);
    let tool = 'tape', strokes = [], pts = [], drops = [], reacted = 0, holding = null;
    const tf = () => { const s = Math.min(g.w / DW, g.h / DH); return { s, ox: (g.w - DW * s) / 2, oy: (g.h - DH * s) / 2 }; };
    const toD = (p) => { const t = tf(); return { x: (p.x - t.ox) / t.s, y: (p.y - t.oy) / t.s }; };
    const inDish = (p) => Math.hypot(p.x - CX, p.y - CY) < CR - 18;
    function addPt(p) {
      if (!inDish(p)) return;
      const last = pts[pts.length - 1];
      if (last && Math.hypot(p.x - last.x, p.y - last.y) < 6) return;
      if (last && last.s === strokes.length && Math.hypot(p.x - last.x, p.y - last.y) > 6) {
        const n = Math.floor(Math.hypot(p.x - last.x, p.y - last.y) / 6);
        for (let i = 1; i < n; i++) pts.push(mk(last.x + (p.x - last.x) * i / n, last.y + (p.y - last.y) * i / n));
      }
      pts.push(mk(p.x, p.y));
    }
    let seed = 9; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
    function mk(x, y) {
      const a = rnd() * Math.PI * 2, L = 14 + rnd() * 26;
      const br = [[a, L, 0]];
      for (let i = 0; i < 3; i++) br.push([a + (rnd() - 0.5) * 1.8, L * (0.35 + rnd() * 0.4), 0.3 + rnd() * 0.5]);
      return { x, y, s: strokes.length, grow: 0, br };
    }
    hold(cv, {
      down(e) {
        const p = toD(cpt(cv, e));
        if (!inDish(p)) return;
        if (tool === 'tape') { strokes.push(1); addPt(p); }
        else { holding = { x: p.x, y: p.y, r: 24, ag: PER, no: PER, cu: 0, t: 0 }; drops.push(holding); }
      },
      move(e) {
        const p = toD(cpt(cv, e));
        if (tool === 'tape') addPt(p);
        else if (holding) { holding.x = p.x; holding.y = p.y; }
      },
      up() { holding = null; },
    });
    root.querySelectorAll('[data-tool]').forEach((b) => b.addEventListener('click', () => {
      root.querySelectorAll('[data-tool]').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); tool = b.dataset.tool; cv.dataset.tool = tool;
    }));
    cv.dataset.tool = 'tape';
    function reset() { strokes = []; pts = []; drops = []; reacted = 0; msg.textContent = ''; now.classList.remove('done'); }
    q('.rx-ds-reset').addEventListener('click', reset);

    function draw() {
      const { ctx } = g, t = tf();
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, cv.width, cv.height);
      const k = cv.width / g.w; ctx.setTransform(k * t.s, 0, 0, k * t.s, k * t.ox, k * t.oy);
      ctx.fillStyle = '#3b3f4a'; ctx.fillRect(-400, -400, DW + 800, DH + 800);
      ctx.fillStyle = '#e9edf0'; ctx.beginPath(); ctx.arc(CX, CY, CR + 14, 0, 7); ctx.fill();
      ctx.fillStyle = '#f7fafb'; ctx.beginPath(); ctx.arc(CX, CY, CR, 0, 7); ctx.fill();
      ctx.lineWidth = 4; ctx.strokeStyle = '#9aa7b0'; ctx.stroke();
      // 방울
      drops.forEach((d) => {
        const b = d.cu / PER * 2;
        ctx.fillStyle = mix('#e4edf2', '#4f97da', clamp(b, 0, 1)); ctx.globalAlpha = 0.75;
        ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, 7); ctx.fill(); ctx.globalAlpha = 1;
        ctx.strokeStyle = 'rgba(80,110,140,.45)'; ctx.lineWidth = 2; ctx.stroke();
      });
      // 테이프
      ctx.lineCap = 'round'; ctx.lineJoin = 'round';
      [['#6b3a1c', TAPE + 4], ['#c8743a', TAPE], ['#e3a072', TAPE * 0.3]].forEach(([c, w]) => {
        ctx.strokeStyle = c; ctx.lineWidth = w; ctx.beginPath();
        pts.forEach((p, i) => { const pr = pts[i - 1]; if (!pr || pr.s !== p.s) ctx.moveTo(p.x, p.y); else ctx.lineTo(p.x, p.y); if (!pr || pr.s !== p.s) ctx.lineTo(p.x + 0.1, p.y); });
        ctx.stroke();
      });
      // 은 결정
      pts.forEach((p) => {
        if (p.grow < 0.02) return;
        ctx.strokeStyle = '#5d6670'; ctx.lineWidth = 5; ctx.beginPath(); crystal(ctx, p); ctx.stroke();
        ctx.strokeStyle = '#e8ecf0'; ctx.lineWidth = 3; ctx.beginPath(); crystal(ctx, p); ctx.stroke();
      });
      // 스포이트
      if (holding) {
        ctx.fillStyle = 'rgba(255,255,255,.75)'; ctx.strokeStyle = '#1d2433'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.rect(holding.x - 9, holding.y - 150, 18, 110); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#e2622b'; ctx.beginPath(); ctx.ellipse(holding.x, holding.y - 160, 16, 24, 0, 0, 7); ctx.fill(); ctx.stroke();
      }
    }
    function crystal(ctx, p) {
      const [a, L] = p.br[0], ex = p.x + Math.cos(a) * L * p.grow * 1.6 + Math.cos(a) * TAPE * 0.4, ey = p.y + Math.sin(a) * L * p.grow * 1.6 + Math.sin(a) * TAPE * 0.4;
      ctx.moveTo(p.x, p.y); ctx.lineTo(ex, ey);
      p.br.slice(1).forEach(([b, l, at]) => {
        const sx = p.x + (ex - p.x) * at, sy = p.y + (ey - p.y) * at;
        ctx.moveTo(sx, sy); ctx.lineTo(sx + Math.cos(b) * l * p.grow * 1.6, sy + Math.sin(b) * l * p.grow * 1.6);
      });
    }
    function step(dt) {
      drops.forEach((d) => { if (d === holding) { d.t += dt; d.r = Math.min(170, 24 + d.t * 70); } });
      for (const d of drops) {
        if (d.ag <= 0.01) continue;
        const wet = pts.filter((p) => Math.hypot(p.x - d.x, p.y - d.y) < d.r);
        if (!wet.length) continue;
        const dk = Math.min(d.ag / 2, 0.035 * wet.length * dt);
        d.ag -= 2 * dk; d.cu += dk; reacted += dk;
        wet.forEach((p) => { p.grow = Math.min(1, p.grow + dk / wet.length * 4); });
      }
      draw();
      const nAg = drops.length * PER, nCu = Math.floor(reacted + 1e-6);
      const ag = nAg - 2 * nCu, no = nAg;
      const set = (k, v, max) => { rows[k].querySelector('i').style.width = (max ? v / max * 100 : 0) + '%'; rows[k].querySelector('em').textContent = v; };
      const max = Math.max(PER, nAg);
      set('ag', ag, max); set('cu', nCu, max); set('no', no, max);
      q('.rx-cnt-sum').innerHTML = drops.length ? `전체 이온 수 ${ag + nCu + no}개 (처음 ${2 * nAg}개)${nCu ? ' → <b>줄었다</b>' : ''}` : '';
      if (!pts.length) now.textContent = '① 접시 안에 손가락으로 테이프 모양을 그려 보자';
      else if (!drops.length) now.textContent = '② 스포이트로 바꿔 테이프 위를 눌러 보자';
      else if (nCu < 3) now.textContent = '잠긴 테이프 둘레를 지켜보자';
      else { now.textContent = '은 이온 수와 구리 이온 수를 견주어 보자'; now.classList.add('done'); }
      if (drops.length && !nCu && !holding && drops.every((d) => !pts.some((p) => Math.hypot(p.x - d.x, p.y - d.y) < d.r))) msg.textContent = '테이프에 닿지 않은 용액에서는 아무 일도 일어나지 않는다. 테이프 위에 떨어뜨려 보자.';
      else if (nCu) msg.innerHTML = '은빛 결정이 자라고(Ag<sup>+</sup> → Ag), 용액이 푸르러진다(Cu → Cu<sup>2+</sup>).';
    }
    const loop = window.Stage.loop(step);
    return {
      setActive(on) { if (on) { g = window.Stage.fit(cv); loop.start(); } else loop.stop(); },
      fit() { g = window.Stage.fit(cv); draw(); },
      tape(list) { strokes.push(1); list.forEach(([x, y]) => addPt({ x, y })); },
      drop(x, y, r = 120) { drops.push({ x, y, r, ag: PER, no: PER, cu: 0, t: 0 }); },
      reset,
    };
  }
  window.RxDish = { mount };
})();
