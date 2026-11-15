/* 2차시 4장 서식지 파괴와 단편화: 가로세로 1 km 숲에 손가락으로 도로를 긋는다(폭 10 m).
   숲을 10 m 칸 100×100으로 나눠, 숲 가장자리나 도로에서 100 m 넘게 떨어진 칸만 «깊은 숲»으로 센다(가정은 이해를 돕기 위한 예).
   처음 깊은 숲은 800 m × 800 m = 640,000 m². 깊은 숲 조각마다 7 ha(700칸)에 곰 한 마리가 산다고 가정한다.
   토끼는 숲을 돌아다니다 도로를 건너면 차에 치인다(로드킬). 생태통로를 도로에 끌어 놓으면 그 자리로는 안전하게 건너고, 숲 조각이 이어진 것으로 센다. */
(function () {
  'use strict';
  const { el, hold, clamp, rand } = window.Kit;
  const G = 100, X0 = 30, Y0 = 30, SZ = 640, CS = SZ / G, BEAR = 700, EDGE = 10;

  function mount(root) {
    const svg = root.querySelector('.rd-svg'), now = root.querySelector('.rd-now'), again = root.querySelector('.rd-again');
    const vCore = root.querySelector('.rd-core'), vPct = root.querySelector('.rd-pct i'), vBits = root.querySelector('.rd-bits'), vBear = root.querySelector('.rd-bear'), vKill = root.querySelector('.rd-kill'), msg = root.querySelector('.rd-msg');
    el('rect', { class: 'rd-bg', width: 1056, height: 700 }, svg);
    const cv = document.createElement('canvas'); cv.width = G; cv.height = G; const cx = cv.getContext('2d'); const img = cx.createImageData(G, G);
    const map = el('image', { x: X0, y: Y0, width: SZ, height: SZ, class: 'rd-map', preserveAspectRatio: 'none' }, svg);
    el('rect', { class: 'rd-frame', x: X0, y: Y0, width: SZ, height: SZ }, svg);
    el('text', { class: 'rd-scale', x: X0, y: Y0 + SZ + 26 }, svg).textContent = '← 1 km →  (진한 초록: 깊은 숲, 연한 초록: 가장자리 100 m)';
    const gRoads = el('g', {}, svg), gCorr = el('g', {}, svg), gMarks = el('g', {}, svg), gAnim = el('g', {}, svg);
    const live = el('path', { class: 'rd-live', d: '' }, svg);
    // 생태통로 손잡이(무대 오른쪽)
    const tokHome = [860, 600];
    const tok = el('g', { class: 'rd-tok', tabindex: '0', role: 'button', 'aria-label': '생태통로: 끌어서 도로 위에 놓기' }, svg);
    el('rect', { x: -70, y: -34, width: 140, height: 68, rx: 12, class: 'rd-tokb' }, tok);
    el('path', { d: 'M-50 10 q 50 -40 100 0', class: 'rd-tokarc' }, tok);
    el('text', { y: 28, class: 'rd-tokt' }, tok).textContent = '생태통로';
    el('text', { class: 'rd-toklab', x: tokHome[0], y: tokHome[1] - 54 }, svg).textContent = '끌어서 도로 위에';
    const road = new Uint8Array(G * G), corr = new Uint8Array(G * G), dist = new Float32Array(G * G);
    let lines = [], cur = null, kills = 0, safe = 0, rnd = rand(9), info = {};
    const cell = (x, y) => { const c = Math.floor((x - X0) / CS), r = Math.floor((y - Y0) / CS); return c >= 0 && r >= 0 && c < G && r < G ? r * G + c : -1; };
    const inForest = (p) => p.x >= X0 && p.y >= Y0 && p.x <= X0 + SZ && p.y <= Y0 + SZ;
    function compute() {
      for (let r = 0; r < G; r++) for (let c = 0; c < G; c++) { const i = r * G + c; dist[i] = road[i] ? 0 : Math.min(c + 0.5, G - c - 0.5, r + 0.5, G - r - 0.5); }
      const D = 1.4142;
      for (let r = 0; r < G; r++) for (let c = 0; c < G; c++) { const i = r * G + c; let d = dist[i]; if (c > 0) d = Math.min(d, dist[i - 1] + 1); if (r > 0) { d = Math.min(d, dist[i - G] + 1); if (c > 0) d = Math.min(d, dist[i - G - 1] + D); if (c < G - 1) d = Math.min(d, dist[i - G + 1] + D); } dist[i] = d; }
      for (let r = G - 1; r >= 0; r--) for (let c = G - 1; c >= 0; c--) { const i = r * G + c; let d = dist[i]; if (c < G - 1) d = Math.min(d, dist[i + 1] + 1); if (r < G - 1) { d = Math.min(d, dist[i + G] + 1); if (c < G - 1) d = Math.min(d, dist[i + G + 1] + D); if (c > 0) d = Math.min(d, dist[i + G - 1] + D); } dist[i] = d; }
      // 통로가 놓여도 도로 칸은 가장자리다(깊은 숲 넓이는 그대로, 연결만 바뀐다)
      const core = (i) => !road[i] && dist[i] > EDGE;
      // 깊은 숲 조각(곰), 숲 조각(통로 포함 연결)
      const seen = new Int32Array(G * G).fill(-1); const coreParts = [];
      for (let i = 0; i < G * G; i++) { if (!core(i) || seen[i] >= 0) continue; let n = 0; const q = [i]; seen[i] = coreParts.length; while (q.length) { const j = q.pop(); n++; const r = (j / G) | 0, c = j % G; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const rr = r + a, cc = c + b; if (rr < 0 || cc < 0 || rr >= G || cc >= G) continue; const k = rr * G + cc; if (core(k) && seen[k] < 0) { seen[k] = coreParts.length; q.push(k); } } } coreParts.push(n); }
      const lab = new Int32Array(G * G).fill(-1); let bits = 0, big = 0;
      for (let i = 0; i < G * G; i++) { if ((road[i] && !corr[i]) || lab[i] >= 0) continue; let n = 0; const q = [i]; lab[i] = bits; while (q.length) { const j = q.pop(); n++; const r = (j / G) | 0, c = j % G; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const rr = r + a, cc = c + b; if (rr < 0 || cc < 0 || rr >= G || cc >= G) continue; const k = rr * G + cc; if (!(road[k] && !corr[k]) && lab[k] < 0) { lab[k] = bits; q.push(k); } } } if (n > 30) big++; bits++; }
      const coreN = coreParts.reduce((a, b) => a + b, 0), bears = coreParts.reduce((a, b) => a + Math.floor(b / BEAR), 0);
      info = { core: coreN * 100, pct: coreN / 6400 * 100, bits: big, bears, parts: coreParts.filter((n) => n > 30).length };
      // 그림
      for (let i = 0; i < G * G; i++) {
        const col = corr[i] ? [92, 160, 90] : road[i] ? [110, 110, 110] : core(i) ? [47, 107, 58] : [150, 196, 122];
        img.data.set([...col, 255], i * 4);
      }
      cx.putImageData(img, 0, 0); map.setAttribute('href', cv.toDataURL());
      vCore.textContent = `${info.core.toLocaleString('ko-KR')} m²`;
      vPct.style.width = info.pct.toFixed(1) + '%'; root.querySelector('.rd-pv').textContent = `처음의 ${info.pct.toFixed(1)}%`;
      vBits.textContent = `${info.bits}조각`; vBear.textContent = `${info.bears}마리`;
      drawBears(seen, coreParts);
    }
    const gBear = el('g', {}, svg);
    function drawBears(seen, parts) {
      gBear.innerHTML = '';
      parts.forEach((n, id) => {
        const k = Math.floor(n / BEAR); if (!k) return;
        const cells = []; for (let i = 0; i < G * G; i++) if (seen[i] === id && dist[i] > EDGE + 4) cells.push(i);
        for (let j = 0; j < k && cells.length; j++) { const i = cells[Math.floor((j + 0.5) / k * cells.length)]; const t = el('text', { class: 'rd-bearI', x: X0 + (i % G + 0.5) * CS, y: Y0 + (((i / G) | 0) + 0.5) * CS + 12 }, gBear); t.textContent = '🐻'; }
      });
    }
    function rasterize(pts) {
      const segs = []; for (let k = 1; k < pts.length; k++) segs.push([pts[k - 1], pts[k]]);
      for (let r = 0; r < G; r++) for (let c = 0; c < G; c++) {
        const x = X0 + (c + 0.5) * CS, y = Y0 + (r + 0.5) * CS;
        for (const [a, b] of segs) { const dx = b.x - a.x, dy = b.y - a.y, L = dx * dx + dy * dy || 1, t = clamp(((x - a.x) * dx + (y - a.y) * dy) / L, 0, 1), d = Math.hypot(a.x + t * dx - x, a.y + t * dy - y); if (d <= CS * 0.62) { road[r * G + c] = 1; break; } }
      }
    }
    function addRoad(pts) {
      if (lines.length >= 4) { msg.textContent = '도로는 넷까지 그을 수 있다 — «처음 숲으로»'; return; }
      rasterize(pts); lines.push(pts);
      el('path', { class: 'rd-road', d: 'M' + pts.map((p) => `${p.x.toFixed(0)} ${p.y.toFixed(0)}`).join(' L ') }, gRoads);
      compute();
      msg.innerHTML = lines.length === 1 ? `<b>도로 하나로</b> 깊은 숲이 처음의 ${info.pct.toFixed(0)}%로 줄었다. 도로 자체는 좁은데도 양옆 100 m가 가장자리가 되었다.` : `깊은 숲은 처음의 <b>${info.pct.toFixed(0)}%</b>, 곰은 <b>${info.bears}마리</b>가 남았다.`;
      now.textContent = lines.length < 2 ? '도로를 하나 더 그어 보자' : '생태통로를 도로 위에 끌어 놓아 보자';
    }
    hold(svg, {
      down(p) { if (!inForest(p)) return false; cur = [p]; live.setAttribute('d', `M${p.x} ${p.y}`); },
      move(p) { if (!cur) return; const q = cur[cur.length - 1]; if (Math.hypot(p.x - q.x, p.y - q.y) < 10) return; cur.push({ x: clamp(p.x, X0, X0 + SZ), y: clamp(p.y, Y0, Y0 + SZ) }); live.setAttribute('d', 'M' + cur.map((a) => `${a.x.toFixed(0)} ${a.y.toFixed(0)}`).join(' L ')); },
      up() { if (cur && cur.length > 2 && Math.hypot(cur[0].x - cur[cur.length - 1].x, cur[0].y - cur[cur.length - 1].y) > 60) addRoad(cur); cur = null; live.setAttribute('d', ''); },
    }, svg);
    // 생태통로 끌기
    let tx = tokHome[0], ty = tokHome[1], nCorr = 0;
    const placeTok = () => tok.setAttribute('transform', `translate(${tx.toFixed(1)} ${ty.toFixed(1)})`);
    function dropCorr(p) {
      const i0 = cell(p.x, p.y); let hit = 0;
      if (i0 >= 0) { const r0 = (i0 / G) | 0, c0 = i0 % G; for (let r = r0 - 4; r <= r0 + 4; r++) for (let c = c0 - 4; c <= c0 + 4; c++) { if (r < 0 || c < 0 || r >= G || c >= G) continue; const i = r * G + c; if (road[i] && Math.hypot(r - r0, c - c0) <= 4) { corr[i] = 1; hit++; } } }
      if (!hit) { msg.textContent = '생태통로는 도로 위에 놓아야 한다'; return; }
      nCorr++;
      const b = el('g', { class: 'rd-corr', transform: `translate(${p.x.toFixed(0)} ${p.y.toFixed(0)})` }, gCorr); el('circle', { r: 30 }, b); el('text', { y: 8 }, b).textContent = '통로';
      compute();
      msg.innerHTML = `<b>생태통로</b>로 숲 조각이 이어졌다(지금 ${info.bits}조각). 동물이 그 자리로는 안전하게 건넌다 — 깊은 숲 넓이는 그대로라는 점도 보자.`;
      now.textContent = '토끼가 어디로 건너는지 지켜보자';
    }
    hold(tok, { down() { tok.classList.add('drag'); }, move(p) { tx = p.x; ty = p.y; placeTok(); }, up(p) { tok.classList.remove('drag'); if (inForest(p)) dropCorr(p); tx = tokHome[0]; ty = tokHome[1]; placeTok(); } }, svg);
    tok.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); const i = road.findIndex((v, j) => v && !corr[j]); if (i >= 0) dropCorr({ x: X0 + (i % G + 0.5) * CS, y: Y0 + (((i / G) | 0) + 0.5) * CS }); } });
    placeTok();
    // 토끼
    const bun = Array.from({ length: 12 }, () => { const t = el('text', { class: 'rd-bun' }, gAnim); t.textContent = '🐇'; return { t, x: 0, y: 0, a: 0 }; });
    const spawn = (b) => { for (let k = 0; k < 50; k++) { b.x = X0 + 20 + rnd() * (SZ - 40); b.y = Y0 + 20 + rnd() * (SZ - 40); const i = cell(b.x, b.y); if (i >= 0 && !road[i]) break; } b.a = rnd() * 6.28; };
    bun.forEach(spawn);
    function mark(x, y, ok) { const m = el('text', { class: ok ? 'rd-ok' : 'rd-x', x, y: y + 8 }, gMarks); m.textContent = ok ? '✓' : '✕'; setTimeout(() => m.remove(), 2600); }
    const loop = window.Kit.ticker((dt) => {
      bun.forEach((b) => {
        b.a += (rnd() - 0.5) * 3 * dt;
        const nx = b.x + Math.cos(b.a) * 40 * dt, ny = b.y + Math.sin(b.a) * 40 * dt;
        if (nx < X0 + 8 || nx > X0 + SZ - 8 || ny < Y0 + 8 || ny > Y0 + SZ - 8) { b.a += Math.PI; return; }
        const i = cell(nx, ny), j = cell(b.x, b.y);
        if (i >= 0 && road[i] && !(j >= 0 && road[j])) {
          if (corr[i]) { safe++; mark(nx, ny, true); } else { kills++; mark(nx, ny, false); spawn(b); vKill.textContent = `${kills} · 통로로 건넘 ${safe}`; return; }
          vKill.textContent = `${kills} · 통로로 건넘 ${safe}`;
        }
        b.x = nx; b.y = ny; b.t.setAttribute('x', b.x.toFixed(1)); b.t.setAttribute('y', (b.y + 8).toFixed(1));
      });
    });
    function reset() { road.fill(0); corr.fill(0); lines = []; gRoads.innerHTML = ''; gCorr.innerHTML = ''; gMarks.innerHTML = ''; kills = 0; safe = 0; nCorr = 0; vKill.textContent = '0 · 통로로 건넘 0'; bun.forEach(spawn); compute(); msg.textContent = ''; now.textContent = '숲을 가로질러 손가락으로 도로를 그어 보자'; }
    again.addEventListener('click', reset);
    reset();
    root._road = {
      cross() { addRoad([{ x: X0, y: Y0 + SZ / 2 }, { x: X0 + SZ, y: Y0 + SZ / 2 }]); addRoad([{ x: X0 + SZ / 2, y: Y0 }, { x: X0 + SZ / 2, y: Y0 + SZ }]); },
      corridor(fx, fy) { dropCorr({ x: X0 + fx * SZ, y: Y0 + fy * SZ }); },
      get info() { return info; },
    };
    return { setActive(on) { if (on) loop.start(); else loop.stop(); } };
  }
  window.RoadCut = { mount };
})();
