/* 3-1 1차시 체험 «무엇이 어느 권역?»(교과서 104~105쪽 그림 Ⅲ-1 지구시스템의 구성 요소 + 참고서: 외권).
   지구 단면 풍경 삽화(우주 → 하늘 → 눈 덮인 산·숲·화산 → 바다 → 땅속 암석·지하수층). 아래 카드 12장을 끌어
   풍경의 알맞은 곳에 놓으면 딱 붙고 그 권역이 빛난다. 틀리면 튕기며 까닭. 생물권 카드(나무·물고기 등)는
   기권·수권·지권 어디에 놓아도 맞다 — 생물권이 세 권역에 걸쳐 있다는 것(점선 테).
   키보드: 좌우로 카드 고르기, 1 기권 · 2 수권 · 3 지권 · 4 생물권 · 5 외권, 0 처음부터.
   Spheres.mount(root) → { fit, setActive } · 시험용: root._sp.put('cloud') · state() */
(function () {
  'use strict';
  const SPH = { atm: ['기권', '#7fc4ff'], hyd: ['수권', '#3f8fe8'], geo: ['지권', '#c58a4a'], bio: ['생물권', '#5cc77a'], ext: ['외권', '#b48cff'] };
  const CARDS = [
    { k: 'cloud', n: '구름', s: 'atm', why: '공기 속 수증기가 모인 것 — 기상 현상은 기권에서' },
    { k: 'gas', n: '화산 가스', s: 'atm', why: '땅속에서 나왔지만 하늘로 퍼지면 기권의 일부' },
    { k: 'aurora', n: '오로라', s: 'atm', why: '태양풍 입자가 높은 하늘(열권)의 공기와 부딪쳐 빛난다' },
    { k: 'sea', n: '바다', s: 'hyd', why: '수권의 물 대부분(97% 이상)이 바닷물' },
    { k: 'ice', n: '빙하', s: 'hyd', why: '얼어 있어도 물 — 육지 물 가운데 가장 많다' },
    { k: 'gw', n: '지하수', s: 'hyd', why: '땅속에 있어도 물이므로 수권' },
    { k: 'rock', n: '흙·암석', s: 'geo', why: '지구 겉 부분 — 생물이 사는 터전' },
    { k: 'mantle', n: '맨틀', s: 'geo', why: '지구 속도 지권 — 지각 아래 두꺼운 층' },
    { k: 'tree', n: '나무', s: 'bio', why: '생명체는 생물권 — 땅·물·공기 어디에 있든' },
    { k: 'fish', n: '물고기', s: 'bio', why: '바닷속에 살아도 생명체이니 생물권' },
    { k: 'wind', n: '태양풍', s: 'ext', why: '대기 밖 우주 공간에서 오는 입자의 흐름' },
    { k: 'moon', n: '달', s: 'ext', why: '대기 밖 우주 공간의 천체' },
  ];
  function mount(root) {
    const stage = root.querySelector('.sp-stage'), now = root.querySelector('.sp-now'), out = root.querySelector('.sp-out');
    const P = window.Play;
    let placed = {}, drag = null, bounce = null, flash = null, sel = 0, t = 0, msg = '', miss = 0, art = null, artW = 0;
    const L = (H) => H - 92; // 풍경 높이(아래는 카드 받침)
    // 풍경 안 위치 → 물리 권역(외·기·수·지)
    function region(x, y, W, H) {
      const l = L(H), u = x / W, v = y / l;
      if (v < 0.14) return 'ext';
      if (u < 0.55) {
        const top = 0.46 - Math.max(0, 0.22 * (1 - Math.abs(u - 0.29) / 0.17)); // 산 능선
        if (v < top) return 'atm';
        if (u > 0.22 && u < 0.36 && v < 0.31) return 'hyd'; // 눈·빙하
        if (v > 0.66 && v < 0.74) return 'hyd'; // 지하수층
        return 'geo';
      }
      if (v < 0.5) return 'atm';
      if (v < 0.86) return 'hyd';
      return 'geo';
    }
    const SPOT = { atm: [0.75, 0.3], hyd: [0.78, 0.66], geo: [0.2, 0.84], bio: [0.12, 0.42], ext: [0.4, 0.07] };
    function say(h) { if (h !== msg) { msg = h; out.innerHTML = h; } }
    function steps() {
      const n = Object.keys(placed).length, cov = new Set(Object.keys(placed).map((k) => CARDS.find((q) => q.k === k).s));
      const ok = []; if (n >= 4) ok.push(1); if (cov.size === 5) ok.push(2); if (n === CARDS.length) ok.push(3);
      const st = [1, 2, 3].find((q) => !ok.includes(q)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? `① 카드를 끌어 풍경의 알맞은 곳에 놓자 (${n}/4)` : st === 2 ? `② 다섯 권역에 하나씩은 놓자 (${cov.size}/5)` : st === 3 ? `③ 남은 카드도 (${n}/12)` : `모두 맞혔다 — 틀린 시도 ${miss}번`;
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    function drop(k, x, y) {
      const q = CARDS.find((c) => c.k === k); if (!q || placed[k]) return false;
      const r = region(x, y, S.W, S.H), good = q.s === 'bio' ? r !== 'ext' : r === q.s;
      if (good) { placed[k] = { x, y }; flash = { s: q.s, a: 1 }; window.RxT.jolt(stage, 1); say(`<b>${q.n}</b> → <b>${SPH[q.s][0]}</b>: ${q.why}`); }
      else { miss += 1; bounce = { x, y, a: 1 }; say(`튕겼다 — 거기는 <b>${SPH[r][0]}</b>. <b>${q.n}</b>은(는) ${q.s === 'bio' ? '생명체 — 땅·물·공기 쪽에 놓자' : SPH[q.s][0] + '에 속한다'}`); }
      steps(); S.kick(); return good;
    }
    const cardPos = (W, H, i) => [W * (0.085 + (i % 6) * 0.166), L(H) + 26 + Math.floor(i / 6) * 40];
    // 풍경 삽화는 크기가 바뀔 때만 오프스크린에 그린다
    function scene(W, H) {
      if (art && artW === W) return art;
      art = document.createElement('canvas'); art.width = W; art.height = H; artW = W; const c = art.getContext('2d'), l = L(H);
      const lg = (y0, y1, st) => { const g = c.createLinearGradient(0, y0, 0, y1); st.forEach(([o, col]) => g.addColorStop(o, col)); return g; };
      c.fillStyle = lg(0, l * 0.14, [[0, '#04060f'], [1, '#141c3c']]); c.fillRect(0, 0, W, l * 0.14);
      let s = 3; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
      for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(255,255,255,${0.3 + rnd() * 0.6})`; c.fillRect(rnd() * W, rnd() * l * 0.13, 1.4, 1.4); }
      c.fillStyle = lg(l * 0.14, l * 0.5, [[0, '#3c6fb8'], [0.6, '#8ec3ef'], [1, '#d9eefb']]); c.fillRect(0, l * 0.14, W, l * 0.36);
      // 바다
      c.fillStyle = lg(l * 0.5, l * 0.86, [[0, '#2f86d6'], [1, '#0b2f63']]); c.fillRect(W * 0.55, l * 0.5, W * 0.45, l * 0.36);
      c.fillStyle = lg(l * 0.86, l, [[0, '#6b5233'], [1, '#3c2a18']]); c.fillRect(W * 0.55, l * 0.86, W * 0.45, l * 0.14);
      // 땅: 지층 + 지하수층
      c.fillStyle = lg(l * 0.46, l, [[0, '#7a5a34'], [0.4, '#5d4024'], [1, '#3a2614']]); c.fillRect(0, l * 0.46, W * 0.56, l * 0.54);
      [[0.56, '#8a6a42'], [0.62, '#6a4c2c'], [0.8, '#523a22'], [0.9, '#43301c']].forEach(([v, col]) => { c.fillStyle = col; c.fillRect(0, l * v, W * 0.56, l * 0.035); });
      c.fillStyle = 'rgba(80,150,230,.55)'; c.fillRect(0, l * 0.66, W * 0.56, l * 0.08); for (let i = 0; i < 60; i++) { c.fillStyle = 'rgba(200,230,255,.5)'; c.beginPath(); c.arc(rnd() * W * 0.56, l * (0.665 + rnd() * 0.07), 1.5, 0, Math.PI * 2); c.fill(); }
      c.fillStyle = 'rgba(0,0,0,.25)'; c.fillRect(0, l * 0.46, W * 0.56, 4);
      // 산 + 눈
      c.fillStyle = lg(l * 0.24, l * 0.46, [[0, '#8b8f95'], [1, '#5b5145']]); c.beginPath(); c.moveTo(W * 0.12, l * 0.46); c.lineTo(W * 0.29, l * 0.24); c.lineTo(W * 0.46, l * 0.46); c.fill();
      c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.moveTo(W * 0.29, l * 0.24); c.lineTo(W * 0.46, l * 0.46); c.lineTo(W * 0.33, l * 0.46); c.fill();
      c.fillStyle = '#f3f8ff'; c.beginPath(); c.moveTo(W * 0.24, l * 0.305); c.lineTo(W * 0.29, l * 0.24); c.lineTo(W * 0.34, l * 0.305); c.lineTo(W * 0.31, l * 0.29); c.lineTo(W * 0.28, l * 0.31); c.lineTo(W * 0.26, l * 0.295); c.fill();
      // 화산(바닷가)
      c.fillStyle = lg(l * 0.36, l * 0.46, [[0, '#4a3a33'], [1, '#2c211c']]); c.beginPath(); c.moveTo(W * 0.44, l * 0.46); c.lineTo(W * 0.5, l * 0.36); c.lineTo(W * 0.53, l * 0.36); c.lineTo(W * 0.58, l * 0.5); c.fill();
      c.fillStyle = '#ff7a2e'; c.fillRect(W * 0.5, l * 0.358, W * 0.03, 3);
      // 숲(나무 몇 그루)
      for (let i = 0; i < 7; i++) { const x = W * (0.03 + i * 0.03), y = l * 0.46; c.fillStyle = '#5a3a1e'; c.fillRect(x - 2, y - 14, 4, 14); c.fillStyle = i % 2 ? '#2f7d3c' : '#3f9a4b'; c.beginPath(); c.moveTo(x - 10, y - 10); c.lineTo(x, y - 34); c.lineTo(x + 10, y - 10); c.fill(); }
      return art;
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const l = L(H);
        c.drawImage(scene(W, H), 0, 0);
        // 움직이는 것: 태양·달, 오로라, 구름, 화산 가스, 파도, 물고기
        P.glow(c, W * 0.93, l * 0.06, 34, 'rgba(255,214,110,.9)'); c.fillStyle = '#fff2b8'; c.beginPath(); c.arc(W * 0.93, l * 0.06, 12, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#d9dce3'; c.beginPath(); c.arc(W * 0.7, l * 0.06, 8, 0, Math.PI * 2); c.fill(); c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.arc(W * 0.703, l * 0.06, 7, -1.2, 1.9); c.fill();
        for (let i = 0; i < 5; i++) { const x = W * (0.12 + i * 0.07); const g = c.createLinearGradient(0, l * 0.13, 0, l * 0.24); g.addColorStop(0, 'rgba(120,255,170,0)'); g.addColorStop(0.5, `rgba(120,255,170,${0.3 + 0.15 * Math.sin(t * 2 + i)})`); g.addColorStop(1, 'rgba(120,255,170,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(x, l * 0.13); c.quadraticCurveTo(x + 14 * Math.sin(t + i), l * 0.19, x + 6, l * 0.24); c.lineTo(x + 18, l * 0.24); c.quadraticCurveTo(x + 26, l * 0.19, x + 20, l * 0.13); c.fill(); }
        [[0.68, 0.24, 1], [0.86, 0.32, 0.8], [0.16, 0.2, 0.7]].forEach(([u, v, s], i) => { const x = ((u * W + t * 8 * (i + 1)) % (W + 80)) - 40, y = l * v; c.fillStyle = 'rgba(255,255,255,.92)'; [[0, 0, 22], [18, -6, 18], [34, 0, 16], [16, 6, 18]].forEach(([dx, dy, r]) => { c.beginPath(); c.arc(x + dx * s, y + dy * s, r * s, 0, Math.PI * 2); c.fill(); }); });
        for (let i = 0; i < 6; i++) { const ph = (t * 0.35 + i / 6) % 1; c.fillStyle = `rgba(150,140,135,${(1 - ph) * 0.55})`; c.beginPath(); c.arc(W * 0.515 + Math.sin(ph * 6 + i) * 8, l * (0.35 - ph * 0.17), 6 + ph * 16, 0, Math.PI * 2); c.fill(); }
        c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 2; c.beginPath(); for (let x = W * 0.55; x <= W; x += 6) c.lineTo(x, l * 0.5 + Math.sin(x * 0.05 + t * 2) * 2.5); c.stroke();
        for (let i = 0; i < 4; i++) { const x = W * (0.62 + ((t * 0.04 + i * 0.09) % 0.34)), y = l * (0.7 + (i % 2) * 0.06); c.fillStyle = '#f2a03d'; c.beginPath(); c.ellipse(x, y, 9, 4, 0, 0, Math.PI * 2); c.fill(); c.beginPath(); c.moveTo(x - 8, y); c.lineTo(x - 14, y - 4); c.lineTo(x - 14, y + 4); c.fill(); }
        // 권역 이름표
        [['ext', 0.02, 0.05], ['atm', 0.02, 0.18], ['hyd', 0.9, 0.56], ['geo', 0.02, 0.56]].forEach(([k, u, v]) => { const [nm, col] = SPH[k]; c.font = '800 15px "IBM Plex Sans KR", sans-serif'; const w = c.measureText(nm).width + 16; c.fillStyle = 'rgba(10,16,32,.6)'; c.beginPath(); c.roundRect(W * u, l * v, w, 24, 8); c.fill(); P.txt(c, nm, W * u + w / 2, l * v + 17, col, '800 15px'); });
        // 생물권 점선 테: 숲 · 바다 생물 · 하늘
        c.strokeStyle = SPH.bio[1]; c.setLineDash([6, 5]); c.lineWidth = 2; c.beginPath(); c.roundRect(W * 0.005, l * 0.33, W * 0.24, l * 0.16, 10); c.stroke(); c.beginPath(); c.roundRect(W * 0.58, l * 0.62, W * 0.38, l * 0.18, 10); c.stroke(); c.setLineDash([]);
        P.txt(c, '생물권(땅·물·공기에 걸쳐)', W * 0.125, l * 0.325, SPH.bio[1], '800 13px');
        // 방금 맞힌 권역이 빛난다
        if (flash) { const col = SPH[flash.s][1]; c.globalAlpha = flash.a * 0.35; c.fillStyle = col; if (flash.s === 'ext') c.fillRect(0, 0, W, l * 0.14); else if (flash.s === 'atm') c.fillRect(0, l * 0.14, W, l * 0.32); else if (flash.s === 'hyd') c.fillRect(W * 0.55, l * 0.5, W * 0.45, l * 0.36); else if (flash.s === 'geo') c.fillRect(0, l * 0.46, W * 0.56, l * 0.54); else { c.fillRect(W * 0.005, l * 0.33, W * 0.24, l * 0.16); c.fillRect(W * 0.58, l * 0.62, W * 0.38, l * 0.18); } c.globalAlpha = 1; flash.a -= dt * 0.9; if (flash.a <= 0) flash = null; }
        // 붙인 카드
        CARDS.forEach((q) => { const p = placed[q.k]; if (p) tag(c, q, p.x, p.y, 0.95, SPH[q.s][1]); });
        // 받침
        c.fillStyle = 'rgba(12,18,36,.92)'; c.fillRect(0, l, W, H - l);
        CARDS.forEach((q, i) => { if (placed[q.k] || (drag && drag.k === q.k)) return; const [x, y] = cardPos(W, H, i); tag(c, q, x, y, 1, i === sel ? '#ffd84d' : '#5a6a90'); });
        if (drag) tag(c, CARDS.find((q) => q.k === drag.k), drag.x, drag.y, 0.92, '#ffd84d');
        if (bounce) { c.strokeStyle = `rgba(239,91,76,${bounce.a})`; c.lineWidth = 4; c.beginPath(); c.arc(bounce.x, bounce.y, 40 * (2 - bounce.a), 0, Math.PI * 2); c.stroke(); bounce.a -= dt * 1.5; if (bounce.a <= 0) bounce = null; }
      },
      down(p) {
        const i = CARDS.findIndex((q, j) => { if (placed[q.k]) return false; const [x, y] = cardPos(S.W, S.H, j); return Math.abs(p.x - x) < S.W * 0.08 && Math.abs(p.y - y) < 18; });
        if (i >= 0) { sel = i; drag = { k: CARDS[i].k, x: p.x, y: p.y }; }
      },
      move(p, e, held) { if (held && drag) { drag.x = p.x; drag.y = Math.min(p.y, L(S.H) - 8); } },
      up(p) { if (!drag) return; const k = drag.k; drag = null; if (p.y < L(S.H)) drop(k, p.x, Math.min(p.y, L(S.H) - 8)); else S.kick(); },
      key(e) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { const left = CARDS.map((q, i) => i).filter((i) => !placed[CARDS[i].k]); if (!left.length) return true; const j = left.indexOf(sel); sel = left[(Math.max(0, j) + (e.key === 'ArrowRight' ? 1 : left.length - 1)) % left.length]; return true; }
        const s = ['atm', 'hyd', 'geo', 'bio', 'ext']['12345'.indexOf(e.key)];
        if (s) { const q = CARDS[sel]; if (q && !placed[q.k]) { const [u, v] = SPOT[s]; drop(q.k, S.W * u, L(S.H) * v); } return true; }
        if (e.key === '0') { reset(); return true; } return false;
      },
    });
    function tag(c, q, x, y, a, edge) {
      c.globalAlpha = a; c.font = '800 15px "IBM Plex Sans KR", sans-serif'; const w = c.measureText(q.n).width + 22;
      c.save(); c.shadowColor = 'rgba(0,0,0,.45)'; c.shadowBlur = 6; c.shadowOffsetY = 3; c.fillStyle = '#fff7d6'; c.beginPath(); c.roundRect(x - w / 2, y - 15, w, 30, 9); c.fill(); c.restore();
      c.strokeStyle = edge; c.lineWidth = 2.5; c.beginPath(); c.roundRect(x - w / 2, y - 15, w, 30, 9); c.stroke();
      P.txt(c, q.n, x, y + 5, '#1d2433', '800 15px'); c.globalAlpha = 1;
    }
    function reset() { placed = {}; miss = 0; drag = null; sel = 0; msg = ''; say('카드를 끌어 풍경 속 알맞은 곳에 놓자 — 그곳이 어느 권역인지 생각하며'); steps(); S.kick(); }
    root.querySelector('.sp-reset')?.addEventListener('click', reset);
    root._sp = { put: (k) => { const q = CARDS.find((c) => c.k === k); const [u, v] = SPOT[q.s]; return drop(k, S.W * u, L(S.H) * v); }, state: () => ({ placed: Object.keys(placed), miss }) };
    reset();
    console.assert(region(100, 5, 1000, 600) === 'ext' && region(800, 400, 1000, 600) === 'hyd' && region(100, 400, 1000, 600) === 'geo', 'spheres: 권역 판정');
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Spheres = { mount };
})();
