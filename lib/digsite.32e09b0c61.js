/* 1차시 «지층 속 시계»(교과서 14쪽 «화석으로 지층의 생성 시기와 환경을 안다»): 멀리 떨어진 두 절벽(바닷가 절벽·산골짜기 절벽).
   흙과 풀로 덮인 절벽 면을 손가락으로 문질러 파내면 층과 화석이 드러난다. 화석을 찾으면 그림에 꼬리표가 붙고
   오른쪽 «지층 맞대기» 그림의 그 층이 채워진다. 맞대기 그림에서 왼쪽 층 → 오른쪽 층을 차례로 누르면, 같은 표준 화석이 나온
   층끼리만 이어진다(틀리면 왜 안 되는지 한 줄). 두 쌍을 다 이으면 «알게 된 것»(L1 틀). 해 볼 일: ① 화석 여섯 찾기 ② 같은 시기 층 잇기.
   (설명 단계의 영상·문장은 lesson1.js와 차시 틀이 맡는다)
   DgSite.mount(root) → { setActive, fit } · 시험용 root._dg = { dig(x, y), find(n), all(), link(왼쪽 층, 오른쪽 층) } (그림 좌표 1000×560) */
(function () {
  'use strict';
  const LW = 1000, LH = 560;
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  // 절벽: x 범위, 층(위→아래: 두께, 색, 결, 화석). 층 두께·화석 자리는 이해를 돕기 위한 예
  const CLIFFS = [
    { name: '바닷가 절벽', x0: 70, x1: 440, top: 110, layers: [
      { h: 92, c: '#e6d6a8', t: 'lime', f: 'num' }, { h: 84, c: '#8f8576', t: 'shale', f: 'fern' }, { h: 104, c: '#d8d0bd', t: 'lime', f: 'amm' }, { h: 110, c: '#9a9187', t: 'shale', f: 'tri' }] },
    { name: '산골짜기 절벽', x0: 560, x1: 930, top: 150, layers: [
      { h: 110, c: '#d8d0bd', t: 'lime', f: 'amm' }, { h: 86, c: '#cdb58c', t: 'sand', f: null }, { h: 112, c: '#9a9187', t: 'shale', f: 'tri' }, { h: 60, c: '#b19c80', t: 'pebble', f: null }] },
  ];
  const FOS = {
    tri: { name: '삼엽충', kind: '표준', era: '고생대', c: '#5b8fd0' },
    amm: { name: '암모나이트', kind: '표준', era: '중생대', c: '#4fa36b' },
    num: { name: '화폐석', kind: '표준', era: '신생대', c: '#e0a03a' },
    fern: { name: '고사리', kind: '시상', era: null, env: '따뜻하고 습한 육지' },
  };

  // ---- 화석 그림(돌 속에 찍힌 모양) ----
  function drawFossil(ctx, k, x, y, s) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    // 둘레의 돌 바탕(화석이 든 덩이)
    const halo = ctx.createRadialGradient(0, 0, 10, 0, 0, 46);
    halo.addColorStop(0, 'rgba(255,250,235,.55)'); halo.addColorStop(1, 'rgba(255,250,235,0)');
    ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(0, 0, 46, 0, Math.PI * 2); ctx.fill();
    const ink = '#3a332b';
    if (k === 'tri') {
      const g = ctx.createLinearGradient(-22, 0, 22, 0); g.addColorStop(0, '#5e5446'); g.addColorStop(0.5, '#8d7f6b'); g.addColorStop(1, '#5e5446');
      ctx.fillStyle = g; ctx.strokeStyle = ink; ctx.lineWidth = 2;
      // 머리 방패 + 볼가시
      ctx.beginPath(); ctx.moveTo(-26, -14); ctx.quadraticCurveTo(-24, -36, 0, -38); ctx.quadraticCurveTo(24, -36, 26, -14); ctx.lineTo(30, 4); ctx.lineTo(20, -12); ctx.lineTo(-20, -12); ctx.lineTo(-30, 4); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#a39581'; ctx.beginPath(); ctx.ellipse(0, -24, 7, 11, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = ink; [[-13, -22], [13, -22]].forEach(([ex, ey]) => { ctx.beginPath(); ctx.ellipse(ex, ey, 3.2, 2.2, 0, 0, Math.PI * 2); ctx.fill(); });
      // 가슴 마디
      ctx.fillStyle = g;
      for (let i = 0; i < 8; i++) { const yy = -11 + i * 5.2, w = 21 - i * 1.3; ctx.beginPath(); ctx.ellipse(0, yy + 2.6, w, 3.2, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke(); }
      // 꼬리
      ctx.beginPath(); ctx.ellipse(0, 33, 11, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.strokeStyle = 'rgba(40,34,28,.7)'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(-6, -12); ctx.lineTo(-5, 38); ctx.moveTo(6, -12); ctx.lineTo(5, 38); ctx.stroke();
    } else if (k === 'amm') {
      const g = ctx.createRadialGradient(-8, -8, 4, 0, 0, 36); g.addColorStop(0, '#e9dcc0'); g.addColorStop(0.7, '#b59f7c'); g.addColorStop(1, '#7c6a50');
      ctx.fillStyle = g; ctx.strokeStyle = ink; ctx.lineWidth = 2.2; ctx.beginPath(); ctx.arc(0, 0, 34, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.lineWidth = 2; ctx.beginPath();
      for (let a = 0; a < Math.PI * 6.2; a += 0.08) { const r = 1.5 + a * 1.68; ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
      ctx.stroke();
      ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(58,51,43,.75)';
      for (let a = 0.6; a < Math.PI * 6.2; a += 0.32) {
        const r0 = 1.5 + (a - Math.PI * 2) * 1.68, r1 = 1.5 + a * 1.68; if (r0 < 4) continue;
        const m = (r0 + r1) / 2; ctx.beginPath(); ctx.moveTo(Math.cos(a) * r0, Math.sin(a) * r0); ctx.quadraticCurveTo(Math.cos(a + 0.12) * m, Math.sin(a + 0.12) * m, Math.cos(a) * r1, Math.sin(a) * r1); ctx.stroke();
      }
    } else if (k === 'num') {
      for (const [dx, dy, sc] of [[-14, 6, 0.75], [16, -8, 0.6], [0, 0, 1]]) {
        ctx.save(); ctx.translate(dx, dy); ctx.scale(sc, sc);
        const g = ctx.createRadialGradient(-4, -4, 2, 0, 0, 22); g.addColorStop(0, '#f6ecd2'); g.addColorStop(1, '#bfa77b');
        ctx.fillStyle = g; ctx.strokeStyle = ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.ellipse(0, 0, 22, 20, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.lineWidth = 1.2; ctx.beginPath(); for (let a = 0; a < Math.PI * 7; a += 0.1) { const r = 1 + a * 0.85; ctx.lineTo(Math.cos(a) * r * 1.05, Math.sin(a) * r * 0.95); } ctx.stroke();
        ctx.restore();
      }
    } else if (k === 'fern') {
      ctx.strokeStyle = '#2f2a24'; ctx.fillStyle = 'rgba(47,42,36,.82)'; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.moveTo(-44, 16); ctx.quadraticCurveTo(0, -2, 46, -16); ctx.stroke();
      for (let i = 1; i < 12; i++) {
        const t = i / 12, px = -42 + 86 * t, py = 15 - 29 * t, L = 17 * (1 - t * 0.6), base = -0.33;
        [-1, 1].forEach((sd) => {
          const a = base + sd * 1.05, tx = px + Math.cos(a) * L, ty = py + Math.sin(a) * L, nx = -Math.sin(a) * 3.2, ny = Math.cos(a) * 3.2;
          ctx.beginPath(); ctx.moveTo(px, py); ctx.quadraticCurveTo((px + tx) / 2 + nx, (py + ty) / 2 + ny, tx, ty); ctx.quadraticCurveTo((px + tx) / 2 - nx, (py + ty) / 2 - ny, px, py); ctx.fill();
          ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(px, py); ctx.lineTo(tx, ty); ctx.stroke();
        });
      }
    }
    ctx.restore();
  }
  // 결 무늬(작은 캔버스를 패턴으로)
  function texture(kind) {
    const c = document.createElement('canvas'); c.width = 80; c.height = 60; const x = c.getContext('2d');
    x.strokeStyle = 'rgba(40,32,22,.28)'; x.fillStyle = 'rgba(40,32,22,.28)'; x.lineWidth = 1.6;
    if (kind === 'lime') { [[0, 20], [0, 50]].forEach(([, y]) => { x.beginPath(); x.moveTo(0, y); x.lineTo(80, y); x.stroke(); }); [[30, 0, 20], [70, 0, 20], [10, 20, 30], [50, 20, 30], [30, 50, 60], [70, 50, 60]].forEach(([xx, y0, y1]) => { x.beginPath(); x.moveTo(xx, y0); x.lineTo(xx, y1); x.stroke(); }); }
    if (kind === 'shale') { for (let y = 6; y < 60; y += 9) { x.beginPath(); x.moveTo((y * 7) % 20, y); x.lineTo(40 + (y * 3) % 30, y); x.moveTo(55 + (y % 7), y + 4); x.lineTo(80, y + 4); x.stroke(); } }
    if (kind === 'sand') { for (let i = 0; i < 26; i++) { x.beginPath(); x.arc((i * 37) % 80, (i * 23) % 60, 1.2 + (i % 3) * 0.6, 0, Math.PI * 2); x.fill(); } }
    if (kind === 'pebble') { for (let i = 0; i < 9; i++) { x.beginPath(); x.ellipse((i * 29) % 80, (i * 19) % 60, 6 + (i % 3) * 2, 4 + (i % 2) * 2, i, 0, Math.PI * 2); x.stroke(); } }
    return c;
  }

  function mount(root) {
    const stage = root.querySelector('.dg-stage'), cv = stage.querySelector('canvas'), now = root.querySelector('.dg-now');
    const msg = root.querySelector('.dg-msg'), cor = root.querySelector('.dg-cor');
    const tex = {}; ['lime', 'shale', 'sand', 'pebble'].forEach((k) => { tex[k] = texture(k); });
    // 덮개(흙·풀) 캔버스: 그림 좌표 그대로
    const mask = document.createElement('canvas'); mask.width = LW; mask.height = LH;
    const mctx = mask.getContext('2d');
    const items = [];
    CLIFFS.forEach((cl, ci) => {
      let y = cl.top;
      cl.layers.forEach((L, li) => {
        L.y = y;
        if (L.f) items.push({ k: L.f, ci, li, x: cl.x0 + (cl.x1 - cl.x0) * (0.3 + 0.4 * ((li + ci) % 2)), y: y + L.h / 2, found: false });
        y += L.h;
      });
      cl.bottom = y;
    });
    const edge = (cl, x) => cl.top - 10 - 8 * Math.sin((x - cl.x0) / 37) - 5 * Math.sin((x - cl.x0) / 13);   // 절벽 윗선(울퉁불퉁)
    function cover() {
      mctx.globalCompositeOperation = 'source-over'; mctx.clearRect(0, 0, LW, LH);
      CLIFFS.forEach((cl) => {
        const g = mctx.createLinearGradient(0, cl.top, 0, cl.bottom); g.addColorStop(0, '#7d6141'); g.addColorStop(1, '#5e4630');
        mctx.fillStyle = g; mctx.fillRect(cl.x0 - 4, cl.top - 44, cl.x1 - cl.x0 + 8, cl.bottom - cl.top + 48);
        for (let i = 0; i < 300; i++) { const x = cl.x0 + ((i * 97) % (cl.x1 - cl.x0)), y = cl.top + ((i * 61) % (cl.bottom - cl.top)); mctx.fillStyle = i % 3 ? 'rgba(48,34,20,.45)' : 'rgba(170,140,98,.5)'; mctx.beginPath(); mctx.ellipse(x, y, 2 + (i % 4), 1.5 + (i % 3), i, 0, Math.PI * 2); mctx.fill(); }
        // 뿌리
        mctx.strokeStyle = 'rgba(205,180,140,.5)'; mctx.lineWidth = 1.6;
        for (let x = cl.x0 + 20; x < cl.x1; x += 46) { mctx.beginPath(); mctx.moveTo(x, cl.top); mctx.bezierCurveTo(x + 8, cl.top + 30, x - 10, cl.top + 50, x + 4, cl.top + 80); mctx.stroke(); }
      });
    }
    cover();
    let g = null;
    const linked = {};
    function draw() {
      if (!g) return;
      const { ctx, w, h } = g, s = Math.min(w / LW, h / LH), ox = (w - LW * s) / 2, oy = (h - LH * s) / 2;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#cfe7f4'; ctx.fillRect(0, 0, w, h / 2); ctx.fillStyle = '#7fa95c'; ctx.fillRect(0, h / 2, w, h / 2);
      ctx.save(); ctx.translate(ox, oy); ctx.scale(s, s);
      // 하늘·먼 산·바다·풀밭
      const sky = ctx.createLinearGradient(0, 0, 0, 470); sky.addColorStop(0, '#cfe7f4'); sky.addColorStop(1, '#f2f7f2'); ctx.fillStyle = sky; ctx.fillRect(0, 0, LW, LH);
      ctx.fillStyle = '#b9cfc4'; ctx.beginPath(); ctx.moveTo(0, 300); [[120, 230], [230, 270], [360, 210], [520, 280], [640, 200], [780, 250], [900, 190], [1000, 240]].forEach(([x, y]) => ctx.lineTo(x, y)); ctx.lineTo(1000, 470); ctx.lineTo(0, 470); ctx.fill();
      ctx.fillStyle = '#7fb7d8'; ctx.fillRect(0, 430, 60, 40);
      const gr = ctx.createLinearGradient(0, 460, 0, 560); gr.addColorStop(0, '#a5c97f'); gr.addColorStop(1, '#7fa95c'); ctx.fillStyle = gr; ctx.fillRect(0, 462, LW, 98);
      CLIFFS.forEach((cl) => {
        ctx.save();
        ctx.beginPath(); ctx.moveTo(cl.x0, cl.bottom); ctx.lineTo(cl.x0, edge(cl, cl.x0)); for (let x = cl.x0; x <= cl.x1; x += 6) ctx.lineTo(x, edge(cl, x)); ctx.lineTo(cl.x1, cl.bottom); ctx.closePath();
        ctx.clip();
        cl.layers.forEach((L, li) => {
          const top = li === 0 ? cl.top - 40 : L.y;
          ctx.fillStyle = L.c; ctx.fillRect(cl.x0, top, cl.x1 - cl.x0, L.y + L.h - top);
          ctx.fillStyle = ctx.createPattern(tex[L.t], 'repeat'); ctx.fillRect(cl.x0, top, cl.x1 - cl.x0, L.y + L.h - top);
          ctx.strokeStyle = 'rgba(29,36,51,.6)'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(cl.x0, L.y); for (let x = cl.x0; x <= cl.x1; x += 20) ctx.lineTo(x, L.y + 2.5 * Math.sin(x / 31 + li)); ctx.stroke();
        });
        const sh = ctx.createLinearGradient(cl.x0, 0, cl.x1, 0); sh.addColorStop(0, 'rgba(255,255,255,.14)'); sh.addColorStop(0.7, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(30,20,10,.22)');
        ctx.fillStyle = sh; ctx.fillRect(cl.x0, cl.top - 40, cl.x1 - cl.x0, cl.bottom - cl.top + 40);
        items.filter((it) => CLIFFS[it.ci] === cl).forEach((it) => drawFossil(ctx, it.k, it.x, it.y, 1.08));
        ctx.drawImage(mask, 0, 0);
        ctx.restore();
        ctx.strokeStyle = '#1d2433'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(cl.x0, cl.bottom); ctx.lineTo(cl.x0, edge(cl, cl.x0)); for (let x = cl.x0; x <= cl.x1; x += 6) ctx.lineTo(x, edge(cl, x)); ctx.lineTo(cl.x1, cl.bottom); ctx.stroke();
        ctx.strokeStyle = '#4a7a30'; ctx.lineWidth = 3;
        for (let x = cl.x0 + 2; x < cl.x1; x += 6) { const y0 = edge(cl, x) + 1; ctx.beginPath(); ctx.moveTo(x, y0); ctx.lineTo(x + 3 - (x % 3) * 2, y0 - 10 - (x % 5) * 2.2); ctx.stroke(); }
        ctx.font = '800 26px "IBM Plex Sans KR", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#1d2433';
        ctx.fillText(cl.name, (cl.x0 + cl.x1) / 2, cl.top - 40);
      });
      // 이은 층(같은 표준 화석)
      Object.keys(linked).forEach((k) => {
        const two = items.filter((it) => it.k === k), [a, b] = two, La = CLIFFS[a.ci].layers[a.li], Lb = CLIFFS[b.ci].layers[b.li];
        ctx.fillStyle = FOS[k].c + '55'; ctx.beginPath(); ctx.moveTo(CLIFFS[0].x1, La.y); ctx.lineTo(CLIFFS[1].x0, Lb.y); ctx.lineTo(CLIFFS[1].x0, Lb.y + Lb.h); ctx.lineTo(CLIFFS[0].x1, La.y + La.h); ctx.fill();
        ctx.setLineDash([12, 9]); ctx.strokeStyle = '#c8402f'; ctx.lineWidth = 3.5;
        [[La.y, Lb.y], [La.y + La.h, Lb.y + Lb.h]].forEach(([y1, y2]) => { ctx.beginPath(); ctx.moveTo(CLIFFS[0].x1, y1); ctx.lineTo(CLIFFS[1].x0, y2); ctx.stroke(); });
        ctx.setLineDash([]);
        ctx.font = '800 22px "IBM Plex Sans KR", sans-serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#1d2433';
        ctx.fillText(FOS[k].era, (CLIFFS[0].x1 + CLIFFS[1].x0) / 2, (La.y + Lb.y + (La.h + Lb.h) / 2) / 2 + 8);
      });
      // 찾은 화석 꼬리표
      items.filter((it) => it.found).forEach((it) => {
        const f = FOS[it.k], t = `${f.name} → ${f.kind === '표준' ? f.era : '육지 환경'}`;
        ctx.font = '700 22px "IBM Plex Sans KR", sans-serif'; const tw = ctx.measureText(t).width + 24;
        const right = it.x + 44 + tw <= (it.ci === 0 ? 505 : 995), x = right ? it.x + 44 : it.x - 44 - tw, y = it.y - 18;
        ctx.fillStyle = f.kind === '표준' ? '#fff4c4' : '#dff1e3'; ctx.strokeStyle = '#1d2433'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.roundRect(x, y, tw, 36, 18); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#1d2433'; ctx.textAlign = 'left'; ctx.fillText(t, x + 12, y + 26);
      });
      ctx.restore();
      g.map = { s, ox, oy };
    }

    // ---- 지층 맞대기 그림(오른쪽 칸) ----
    const K = 0.6, CX = [[24, 204], [356, 536]], CY0 = 40;
    const boxes = [];
    CLIFFS.forEach((cl, ci) => {
      el('text', { class: 'dg-ch', x: (CX[ci][0] + CX[ci][1]) / 2, y: CY0 - 12 + (cl.top - 110) * K }, cor).textContent = cl.name;
      cl.layers.forEach((L, li) => {
        const y = CY0 + (L.y - 110) * K, hh = L.h * K;
        const gEl = el('g', { class: 'dg-box', tabindex: 0, role: 'button', 'data-ci': ci, 'data-li': li }, cor);
        el('rect', { x: CX[ci][0], y, width: CX[ci][1] - CX[ci][0], height: hh, fill: L.c }, gEl);
        const t = el('text', { x: (CX[ci][0] + CX[ci][1]) / 2, y: y + hh / 2 + 8 }, gEl); t.textContent = '?';
        boxes.push({ ci, li, g: gEl, t, y, hh, L });
      });
    });
    const bandG = el('g', { class: 'dg-bands' }, cor); cor.insertBefore(bandG, cor.firstChild);
    let sel = null;
    function paintCor() {
      const all = items.every((it) => it.found);
      boxes.forEach((b) => {
        const it = items.find((x) => x.ci === b.ci && x.li === b.li);
        const F = it && it.found ? FOS[it.k] : null;
        b.t.textContent = F ? F.name : it ? '?' : all ? '화석 없음' : '?';
        b.g.classList.toggle('got', !!F); b.g.classList.toggle('std', !!F && F.kind === '표준'); b.g.classList.toggle('env', !!F && F.kind === '시상');
        b.g.classList.toggle('none', !it && all); b.g.classList.toggle('sel', sel === b);
      });
      bandG.textContent = '';
      Object.keys(linked).forEach((k) => {
        const [a, b] = boxes.filter((x) => { const it = items.find((i) => i.ci === x.ci && i.li === x.li); return it && it.k === k; });
        el('path', { class: 'dg-band', fill: FOS[k].c, d: `M${CX[0][1]} ${a.y} L ${CX[1][0]} ${b.y} V ${b.y + b.hh} L ${CX[0][1]} ${a.y + a.hh} Z` }, bandG);
        el('text', { class: 'dg-bt', x: (CX[0][1] + CX[1][0]) / 2, y: (a.y + b.y + (a.hh + b.hh) / 2) / 2 + 8 }, bandG).textContent = FOS[k].era;
      });
    }
    function ui() {
      const n = items.filter((it) => it.found).length, all = n === items.length, nl = Object.keys(linked).length, fin = nl === 2;
      root.querySelector('.dg-n').textContent = `${n}/${items.length}`;
      window.L1.steps(root, fin ? 0 : !all ? 1 : 2, [all ? 1 : 0, fin ? 2 : 0]);
      window.L1.done(root, fin);
    }
    function link(a, b) {
      const ia = items.find((it) => it.ci === a.ci && it.li === a.li), ib = items.find((it) => it.ci === b.ci && it.li === b.li);
      const ok = ia && ib && ia.found && ib.found && ia.k === ib.k && FOS[ia.k].kind === '표준';
      if (ok) { linked[ia.k] = true; msg.textContent = `둘 다 ${FOS[ia.k].name}! 깊이와 두께는 달라도 같은 ${FOS[ia.k].era}에 쌓인 층이다.`; now.textContent = `${FOS[ia.k].era} 층을 이었다`; now.className = 'now-chip dg-now done'; }
      else {
        now.textContent = '이을 수 없다'; now.className = 'now-chip dg-now warn';
        msg.textContent = (!ia || !ib) ? '화석이 없는 층은 언제 쌓였는지 알 근거가 없다.'
          : (!ia.found || !ib.found) ? '아직 화석을 찾지 못한 층이다. 먼저 그림에서 파 보자.'
          : (ia.k === 'fern' || ib.k === 'fern') ? '고사리는 시상 화석이라 «언제»가 아니라 «어떤 곳»을 알려 준다.'
          : `${FOS[ia.k].name}(${FOS[ia.k].era})와 ${FOS[ib.k].name}(${FOS[ib.k].era})는 다른 시대의 화석이다.`;
      }
      sel = null; paintCor(); ui(); draw();
    }
    boxes.forEach((b) => {
      const act = () => {
        if (!items.every((it) => it.found)) { msg.textContent = '먼저 두 절벽의 화석을 모두 찾자.'; return; }
        if (!sel || sel.ci === b.ci) { sel = b; paintCor(); msg.textContent = `«${CLIFFS[b.ci].name}»의 층을 골랐다. 이제 다른 절벽에서 같은 때 쌓인 층을 누르자.`; return; }
        link(sel.ci === 0 ? sel : b, sel.ci === 0 ? b : sel);
      };
      b.g.addEventListener('click', act);
      b.g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); act(); } });
    });

    function check() {
      const data = mctx.getImageData(0, 0, LW, LH).data;
      let changed = null;
      items.forEach((it) => {
        if (it.found) return;
        let clear = 0, n = 0;
        for (let dy = -22; dy <= 22; dy += 11) for (let dx = -22; dx <= 22; dx += 11) { n++; const x = Math.round(it.x + dx), y = Math.round(it.y + dy); if (data[(y * LW + x) * 4 + 3] < 60) clear++; }
        if (clear / n > 0.55) { it.found = true; changed = it; }
      });
      if (changed) report(changed);
    }
    function report(it) {
      const f = items.filter((x) => x.found), n = f.length, all = n === items.length;
      if (it) {
        const F = FOS[it.k];
        now.textContent = `${F.name} 화석 발견!`; now.className = 'now-chip dg-now done';
        msg.textContent = F.kind === '표준' ? `${F.name}은 ${F.era}에만 살았다 → 이 층은 ${F.era}에 쌓였다.` : '고사리 층은 «언제»보다 «어떤 곳»(따뜻하고 습한 육지)에서 쌓였는지를 알려 준다.';
        if (all) msg.textContent += ' 이제 오른쪽 그림에서 같은 때 쌓인 층끼리 이어 보자.';
      } else if (n === 0) { now.textContent = ''; now.className = 'now-chip dg-now'; msg.textContent = '두 절벽은 멀리 떨어져 있어 층을 따라가 볼 수 없다. 흙을 문질러 화석을 찾아보자.'; }
      paintCor(); ui(); draw();
    }
    let digging = null, pending = false;
    function dig(x, y, px, py) {
      mctx.globalCompositeOperation = 'destination-out'; mctx.lineCap = 'round'; mctx.lineWidth = 56; mctx.strokeStyle = '#000';
      mctx.beginPath(); mctx.moveTo(px ?? x, py ?? y); mctx.lineTo(x, y); mctx.stroke();
      if (!pending) { pending = true; requestAnimationFrame(() => { pending = false; check(); draw(); }); }
    }
    const toL = (e) => { const r = cv.getBoundingClientRect(), k = r.width / (cv.clientWidth || 1), m = g.map; return { x: ((e.clientX - r.left) / k - m.ox) / m.s, y: ((e.clientY - r.top) / k - m.oy) / m.s }; };
    cv.addEventListener('pointerdown', (e) => { if (!g) return; const q = toL(e); digging = { id: e.pointerId, ...q }; try { cv.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ } cv.classList.add('dragging'); dig(q.x, q.y); });
    cv.addEventListener('pointermove', (e) => { if (!digging || digging.id !== e.pointerId) return; const q = toL(e); dig(q.x, q.y, digging.x, digging.y); digging.x = q.x; digging.y = q.y; });
    const up = (e) => { if (digging && digging.id === e.pointerId) { digging = null; cv.classList.remove('dragging'); } };
    cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
    root.querySelector('.dg-reset').addEventListener('click', () => { cover(); items.forEach((it) => { it.found = false; }); Object.keys(linked).forEach((k) => delete linked[k]); sel = null; report(null); });
    report(null);
    const uncover = (it) => { for (let a = 0; a < 6.3; a += 0.7) dig(it.x + Math.cos(a) * 20, it.y + Math.sin(a) * 20, it.x, it.y); };
    root._dg = {
      dig: (x, y) => { dig(x, y); },
      find: (n) => { items.filter((it) => !it.found).slice(0, n).forEach(uncover); check(); },
      all: () => { items.forEach(uncover); check(); },
      link: (la, rb) => link(boxes.find((b) => b.ci === 0 && b.li === la), boxes.find((b) => b.ci === 1 && b.li === rb)),
    };
    return {
      setActive(on) { if (on) { g = window.Stage.fit(cv); draw(); } },
      fit() { g = window.Stage.fit(cv); draw(); },
    };
  }
  window.DgSite = { mount };
})();
