/* 2-1 새 차시 표지 여섯 가지(2026-11-13 다시 그림): 화면을 좌우로 끌면(화살표 키) 값 v(0~1)가 바뀌고 그림이 따라 움직인다.
   Cov.mount(root, 종류) → { fit, setActive } · 다른 파일에 기대지 않는다(그림 도구 G는 이 파일 안에 있다).
   종류: fuel(세월을 감아 석탄 태양과 진짜 태양 견주기) spin(성운을 오므려 회전 보기) shell(원자 번호를 올려 껍질 채우기)
         noble(나트륨의 바깥 전자를 떼어 네온과 견주기) salt(나트륨의 전자를 염소에게 건네기) share(수소 원자 둘을 겹쳐 전자쌍 나누기)
   시험용: root._cv.set(0~1) · 크기·시간·거리 값은 이해를 돕기 위한 예 */
(function () {
  'use strict';
  const TAU = Math.PI * 2, FONT = '"IBM Plex Sans KR", sans-serif', YL = '#ffd84d', INK = '#fbfcf9', DIM = 'rgba(205,212,230,.78)';
  const lerp = (a, b, k) => a + (b - a) * k, clamp = (v, a, b) => Math.max(a, Math.min(b, v)), ease = (k) => k * k * (3 - 2 * k);
  const rnd = (seed) => { let s = seed >>> 0 || 1; return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296); };
  // ── 그림 도구 ──
  const G = {
    txt(c, t, x, y, col = INK, f = '700 18px', al = 'center') { c.fillStyle = col; c.font = `${f} ${FONT}`; c.textAlign = al; c.textBaseline = 'alphabetic'; c.fillText(t, x, y); },
    pill(c, x, y, t, bg = 'rgba(15,20,34,.82)', fg = INK, f = '700 15px', al = 'center') {
      c.font = `${f} ${FONT}`; const w = c.measureText(t).width + 18, x0 = al === 'left' ? x : al === 'right' ? x - w : x - w / 2;
      c.fillStyle = bg; c.beginPath(); c.roundRect(x0, y - 13, w, 26, 13); c.fill(); G.txt(c, t, x0 + w / 2, y + 5, fg, f); return w;
    },
    glow(c, x, y, r, inner, outer = 'rgba(0,0,0,0)') { if (r <= 0) return; const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, inner); g.addColorStop(1, outer); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); },
    ball(c, x, y, r, col, dark, hi = '#fff') { const g = c.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.05, x, y, r); g.addColorStop(0, hi); g.addColorStop(0.32, col); g.addColorStop(1, dark); c.fillStyle = g; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); },
    line(c, x1, y1, x2, y2, col, w = 2, dash) { c.strokeStyle = col; c.lineWidth = w; if (dash) c.setLineDash(dash); c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.stroke(); if (dash) c.setLineDash([]); },
    arrow(c, x1, y1, x2, y2, col, w = 3, hd = 11) {
      const a = Math.atan2(y2 - y1, x2 - x1); G.line(c, x1, y1, x2 - Math.cos(a) * hd * 0.6, y2 - Math.sin(a) * hd * 0.6, col, w);
      c.fillStyle = col; c.beginPath(); c.moveTo(x2, y2); c.lineTo(x2 - Math.cos(a - 0.45) * hd, y2 - Math.sin(a - 0.45) * hd); c.lineTo(x2 - Math.cos(a + 0.45) * hd, y2 - Math.sin(a + 0.45) * hd); c.closePath(); c.fill();
    },
    vgrad(c, x, y, w, h, stops) { const g = c.createLinearGradient(0, y, 0, y + h); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); c.fillStyle = g; c.fillRect(x, y, w, h); },
    stars(c, W, H, t, n = 70, seed = 7, a = 1) {
      const R = rnd(seed);
      for (let i = 0; i < n; i++) { const x = R() * W, y = R() * H, s = R(), tw = 0.55 + 0.45 * Math.sin(t * (1 + s * 2) + i); c.fillStyle = `rgba(230,236,255,${(0.2 + 0.6 * s) * tw * a})`; c.beginPath(); c.arc(x, y, 0.5 + s * 1.3, 0, TAU); c.fill(); }
    },
    // 손가락(끝이 x, y)
    hand(c, x, y, s = 1, a = 1) {
      c.save(); c.globalAlpha = a; c.translate(x, y); c.scale(s, s); c.rotate(-0.25);
      c.fillStyle = '#fff'; c.strokeStyle = '#1d2433'; c.lineWidth = 2.4; c.lineJoin = 'round';
      const part = (px, py, w, h, r) => { c.beginPath(); c.roundRect(px, py, w, h, r); c.fill(); c.stroke(); };
      part(-13, 22, 36, 34, 11); part(-23, 30, 13, 22, 6.5); part(3, 18, 11, 18, 5.5); part(12, 21, 11, 16, 5.5); part(-6, 0, 12, 36, 6);
      c.strokeStyle = 'rgba(29,36,51,.35)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-3, 6); c.lineTo(3, 6); c.stroke(); c.restore();
    },
    // 끄는 안내: (x, y)에서 오른쪽으로 dist만큼 손가락이 미끄러진다. 한 번 끌면 그리지 않는다
    hint(c, x, y, t, dist, label) {
      const k = (t * 0.6) % 1, m = ease(clamp((k - 0.15) / 0.6, 0, 1)), a = k < 0.1 ? k / 0.1 : k > 0.85 ? (1 - k) / 0.15 : 1;
      c.save(); c.globalAlpha = 0.9 * a; G.arrow(c, x, y, x + dist, y, YL, 5, 17); c.restore();
      if (k < 0.25) { c.strokeStyle = `rgba(255,216,77,${0.8 * (1 - k / 0.25)})`; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 8 + k * 80, 0, TAU); c.stroke(); }
      G.hand(c, x + dist * m, y, 0.95, a);
      if (label) G.pill(c, x + dist / 2, y - 30, label, 'rgba(15,20,34,.88)', YL, '700 15px');
    },
  };
  // 원자핵: 양성자(빨강)·중성자(회색) 알갱이 뭉치. 알갱이 수는 보기 좋게 줄인다
  function nucleus(c, x, y, r, z, t, tint) {
    const n = z === 1 ? 1 : clamp(Math.round(z * 1.6), 2, 26), R = rnd(z * 31 + 5);
    G.glow(c, x, y, r * 2.2, tint || 'rgba(255,120,90,.35)');
    const pts = [];
    for (let i = 0; i < n; i++) { const a = i * 2.39996, d = r * 0.78 * Math.sqrt((i + 0.5) / n); pts.push([x + Math.cos(a) * d, y + Math.sin(a) * d, R()]); }
    pts.sort((p, q) => p[1] - q[1]);
    const br = n === 1 ? r * 0.7 : r * clamp(0.95 / Math.sqrt(n), 0.2, 0.5);
    pts.forEach(([px, py], i) => { const pr = i % 2 === 0; const j = Math.sin(t * 9 + i) * 0.6; G.ball(c, px + j, py, br, pr ? '#e4572e' : '#9aa3b5', pr ? '#7a1f12' : '#454c5c', pr ? '#ffd2c2' : '#f2f4f8'); });
  }
  // 전자: 빛나는 노란 알갱이
  function electron(c, x, y, r = 5, col = YL) { G.glow(c, x, y, r * 3.2, 'rgba(255,216,77,.45)'); G.ball(c, x, y, r, col, '#b88a00', '#fffbe6'); }
  // 원자 모형: 껍질 shells=[2,8,1], 바깥 껍질은 hi(밝게). skip: 그리지 않을 바깥 전자 수
  function atom(c, x, y, step, shells, t, o = {}) {
    const z = o.z || shells.reduce((a, b) => a + b, 0);
    shells.forEach((n, i) => {
      const r = step * (i + 1.25), outer = i === shells.length - 1;
      c.strokeStyle = outer && o.hiOuter ? 'rgba(255,216,77,.7)' : 'rgba(170,185,220,.45)'; c.lineWidth = outer && o.hiOuter ? 2.2 : 1.4; c.setLineDash(n ? [] : [5, 6]);
      c.beginPath(); c.arc(x, y, r, 0, TAU); c.stroke(); c.setLineDash([]);
      const show = n - (outer ? (o.skip || 0) : 0);
      for (let j = 0; j < show; j++) { const a = TAU * j / n + t * (0.5 / (i + 1)) * (i % 2 ? -1 : 1) + (o.phase || 0); electron(c, x + Math.cos(a) * r, y + Math.sin(a) * r, o.er || 4.6, o.ecol && outer ? o.ecol : YL); }
    });
    nucleus(c, x, y, step * 0.7, z, t, o.tint);
  }
  // 원소 칸(주기율표 한 칸 모양)
  function tile(c, x, y, w, h, z, sym, name, col, on) {
    c.fillStyle = on ? col : 'rgba(255,255,255,.07)'; c.strokeStyle = on ? '#fff' : 'rgba(255,255,255,.22)'; c.lineWidth = on ? 2 : 1;
    c.beginPath(); c.roundRect(x, y, w, h, 5); c.fill(); c.stroke();
    G.txt(c, String(z), x + 4, y + 12, on ? '#1d2433' : DIM, '700 10px', 'left'); G.txt(c, sym, x + w / 2, y + h * 0.66, on ? '#1d2433' : INK, `800 ${Math.round(h * 0.42)}px`);
    if (name && h > 40) G.txt(c, name, x + w / 2, y + h - 5, on ? '#1d2433' : DIM, '600 10px');
  }
  const NAMES = '수소 헬륨 리튬 베릴륨 붕소 탄소 질소 산소 플루오린 네온 나트륨 마그네슘 알루미늄 규소 인 황 염소 아르곤 칼륨 칼슘'.split(' ');
  const SYM = 'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca'.split(' ');
  const cfg = (z) => { const r = []; for (const cap of [2, 8, 8, 2]) { if (z <= 0) break; r.push(Math.min(cap, z)); z -= cap; } return r; };
  const grp = (z) => [1, 18, 1, 2, 13, 14, 15, 16, 17, 18, 1, 2, 13, 14, 15, 16, 17, 18, 1, 2][z - 1];
  const years = (y) => y < 1e4 ? `${(y < 100 ? Math.round(y) : Math.round(y / 10) * 10).toLocaleString('ko-KR')}년` : y < 1e8 ? `${Math.round(y / 1e4).toLocaleString('ko-KR')}만 년` : `${(y / 1e8).toFixed(y < 1e9 ? 1 : 0)}억 년`;
  // 우주 배경
  function space(c, W, H, t, seed = 7) { G.vgrad(c, 0, 0, W, H, ['#070a16', '#0d1328', '#141a33']); G.stars(c, W, H, t, 80, seed); }

  const KINDS = {
    // ── 2-1-2 1차시: 장작불처럼 타는 태양이라면? 세월 눈금(로그)을 끌어 1년 → 100억 년 ──
    fuel: {
      draw(c, W, H, v, t) {
        space(c, W, H, t, 11);
        const y = Math.pow(10, v * 10), lg = v * 10, cy = H * 0.41, r = Math.min(W * 0.14, H * 0.2);
        // 석탄 태양: 장작불이 다 타는 데 수천 년이라는 어림 → 3.2(약 1600년)부터 사그라져 4(1만 년)에 재
        const burn = clamp(1 - (lg - 3.2) / 0.9, 0, 1), lx = W * 0.27;
        G.glow(c, lx, cy, r * (1.9 + 0.08 * Math.sin(t * 5)) * (0.4 + 0.6 * burn), `rgba(255,120,30,${0.55 * burn})`);
        // 석탄 덩이를 공처럼 쌓은 것: 어두운 바탕 + 덩이(밝은 윗면) + 덩이 사이 붉은 틈
        G.ball(c, lx, cy, r, burn > 0.02 ? '#3a2a22' : '#77757a', burn > 0.02 ? '#120c0a' : '#3c3b40', burn > 0.02 ? '#6b4a38' : '#b9b7bc');
        c.save(); c.beginPath(); c.arc(lx, cy, r, 0, TAU); c.clip();
        const R = rnd(4);
        for (let i = 0; i < 60; i++) {
          const a = R() * TAU, d = Math.sqrt(R()) * r * 1.02, px = lx + Math.cos(a) * d, py = cy + Math.sin(a) * d, s = r * (0.13 + R() * 0.09), rot = R() * 6;
          const hot = burn * clamp(0.35 + 0.65 * Math.sin(t * 2.2 + i * 1.7) * Math.sin(t * 0.9 + i), 0, 1);
          const pts = [0, 1, 2, 3, 4].map((k) => { const aa = rot + k / 5 * TAU, rr = s * (0.7 + 0.4 * Math.abs(Math.sin(i * 3 + k * 2))); return [px + Math.cos(aa) * rr, py + Math.sin(aa) * rr]; });
          if (hot > 0.05) { c.save(); c.globalCompositeOperation = 'lighter'; G.glow(c, px, py, s * 1.5, `rgba(255,110,20,${0.45 * hot})`); c.restore(); }
          const lit = 1 - (py - cy + r) / (2 * r) * 0.6, base = burn > 0.02 ? 34 : 120;
          c.fillStyle = `rgb(${Math.round(base * lit + 30 * hot)},${Math.round((base - 4) * lit)},${Math.round((base - 6) * lit)})`;
          c.beginPath(); pts.forEach(([x, y], k) => (k ? c.lineTo : c.moveTo).call(c, x, y)); c.closePath(); c.fill();
          c.strokeStyle = burn > 0.02 ? `rgba(255,${Math.round(90 + 120 * hot)},40,${0.25 + 0.7 * hot})` : 'rgba(60,60,64,.6)'; c.lineWidth = 1.6; c.stroke();
          c.fillStyle = 'rgba(255,255,255,.08)'; c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); c.lineTo(pts[1][0], pts[1][1]); c.lineTo(px, py); c.closePath(); c.fill();
        }
        c.restore();
        if (burn > 0.02) { // 불길: 위로 일렁이는 불꽃 여러 겹
          c.save(); c.globalCompositeOperation = 'lighter';
          for (let i = 0; i < 11; i++) {
            const u = (i - 5) / 5, bx = lx + u * r * 0.9, by = cy - Math.sqrt(1 - u * u * 0.81) * r * 0.9 + 4, h = r * (0.55 + 0.35 * Math.sin(t * 6 + i * 2.1)) * burn * (1 - Math.abs(u) * 0.45), w = r * 0.2;
            const g = c.createLinearGradient(bx, by, bx, by - h); g.addColorStop(0, 'rgba(255,190,70,.85)'); g.addColorStop(0.5, 'rgba(255,110,30,.5)'); g.addColorStop(1, 'rgba(200,40,10,0)'); c.fillStyle = g;
            const sw = Math.sin(t * 5 + i) * w * 0.6;
            c.beginPath(); c.moveTo(bx - w, by); c.bezierCurveTo(bx - w, by - h * 0.5, bx + sw - w * 0.3, by - h * 0.7, bx + sw, by - h); c.bezierCurveTo(bx + sw + w * 0.3, by - h * 0.6, bx + w, by - h * 0.4, bx + w, by); c.closePath(); c.fill();
          }
          c.restore();
        } else for (let i = 0; i < 3; i++) { const k = (t * 0.25 + i / 3) % 1; c.fillStyle = `rgba(170,170,175,${0.3 * (1 - k)})`; c.beginPath(); c.arc(lx + Math.sin(k * 6 + i) * 10, cy - r - k * r * 0.7, 8 + k * 16, 0, TAU); c.fill(); }
        // 진짜 태양: 쌀알 무늬·흑점·홍염
        const sx = W * 0.72, old = clamp((lg - 9.88) / 0.12, 0, 1), sr = r * (1 + 0.25 * old), sc = old > 0 ? `rgb(255,${Math.round(lerp(201, 130, old))},${Math.round(lerp(77, 60, old))})` : '#ffc94d';
        G.glow(c, sx, cy, sr * 2.3, old > 0 ? `rgba(255,${Math.round(lerp(190, 110, old))},70,.5)` : 'rgba(255,190,80,.5)');
        for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + 0.6 + t * 0.05, h = r * (0.12 + 0.05 * Math.sin(t * 1.3 + i * 2)), px = sx + Math.cos(a) * r, py = cy + Math.sin(a) * r; c.strokeStyle = 'rgba(255,110,60,.45)'; c.lineWidth = 3; c.lineCap = 'round'; c.beginPath(); c.moveTo(px - Math.sin(a) * h, py + Math.cos(a) * h); c.quadraticCurveTo(px + Math.cos(a) * h * 1.6, py + Math.sin(a) * h * 1.6, px + Math.sin(a) * h, py - Math.cos(a) * h); c.stroke(); }
        G.ball(c, sx, cy, sr, sc, old > 0 ? '#a8361a' : '#e8741c', '#fff6cf');
        c.save(); c.beginPath(); c.arc(sx, cy, sr, 0, TAU); c.clip(); const Q = rnd(9);
        for (let i = 0; i < 90; i++) { c.fillStyle = `rgba(255,${200 + Q() * 50},120,${0.12 + 0.1 * Math.sin(t * 2 + i)})`; c.beginPath(); c.arc(sx + (Q() - 0.5) * 2 * sr, cy + (Q() - 0.5) * 2 * sr, 2 + Q() * 4, 0, TAU); c.fill(); }
        [[0.3, -0.2, 0.07], [0.42, -0.1, 0.045]].forEach(([u, w, s]) => { const px = sx + Math.sin(t * 0.05 + u * 5) * r * u, py = cy + w * r; c.fillStyle = 'rgba(90,40,10,.75)'; c.beginPath(); c.arc(px, py, r * s, 0, TAU); c.fill(); });
        c.restore();
        G.txt(c, '석탄으로 된 태양이라면', lx, cy + r * 1.25 + 18, burn > 0.02 ? '#ffb070' : DIM, '700 16px'); G.txt(c, '실제 태양', sx, cy + r * 1.25 + 18, '#ffd27a', '700 16px'); // 부풀어도 글자 자리는 그대로
        G.pill(c, lx, cy + r * 1.25 + 37, burn > 0.6 ? '활활 타는 중' : burn > 0.02 ? '사그라든다' : '다 타서 재만 남음', burn > 0.02 ? 'rgba(120,50,10,.8)' : 'rgba(70,72,80,.85)', INK, '700 13px');
        G.pill(c, sx, cy + r * 1.25 + 37, old > 0.05 ? '중심 수소 바닥 · 부풀기 시작' : '수소 핵융합으로 빛난다', old > 0.05 ? 'rgba(150,40,20,.9)' : 'rgba(120,80,10,.8)', INK, '700 13px');
        // 세월 눈금(로그): 태양이 생긴 뒤 1년 ~ 100억 년, 약 46억 년 = 지금
        const x0 = W * 0.08, x1 = W * 0.92, by = H * 0.84;
        c.fillStyle = 'rgba(255,255,255,.08)'; c.beginPath(); c.roundRect(x0 - 10, by - 16, x1 - x0 + 20, 32, 16); c.fill();
        const X = (l) => x0 + (x1 - x0) * l / 10;
        G.line(c, x0, by, x1, by, 'rgba(220,226,240,.5)', 3); G.line(c, x0, by, X(lg), by, YL, 4);
        [[0, '1년'], [2, '100년'], [4, '1만 년'], [6, '100만 년'], [8, '1억 년'], [10, '100억 년']].forEach(([l, s]) => { G.line(c, X(l), by - 6, X(l), by + 6, 'rgba(220,226,240,.7)', 2); G.txt(c, s, X(l), by + 24, DIM, '700 17px'); });   // 눈금 글자는 선 아래: 위에는 두 태양의 상태 알약이 있다
        G.txt(c, '태양이 생긴 뒤 →', x0 - 4, by + 46, DIM, '700 16px', 'left');
        const now = Math.log10(4.6e9); G.line(c, X(now), by - 9, X(now), by + 9, '#7fe3a0', 3); G.txt(c, '지금(약 46억 년)', X(now) + 4, by + 46, '#7fe3a0', '800 16px', 'right');
        G.ball(c, X(lg), by, 9, YL, '#b88a00');
        G.pill(c, W - 12, 24, '태양이 생기고 ' + years(y), 'rgba(15,20,34,.85)', YL, '800 16px', 'right');
      },
      hint: (W, H) => [W * 0.08, H * 0.84, W * 0.24, ''],
      say(v, moved) { const y = Math.pow(10, v * 10); return [y < 1500 ? `생기고 <b>${years(y)}</b> — 두 태양 모두 빛난다` : y < 1e4 ? `생기고 <b>${years(y)}</b> — 석탄 태양은 <b>다 타 들어간다</b>` : y < 7.6e9 ? `생기고 <b>${years(y)}</b> — 석탄 태양은 벌써 재, 실제 태양은 아직 빛난다${y > 4e9 ? '(지금 약 46억 년째)' : ''}` : `생기고 <b>${years(y)}</b> — 실제 태양도 약 100억 년 무렵 중심의 수소가 바닥나 <b>부풀기 시작</b>한다`, moved ? (v > 0.9 ? '무엇으로 이렇게 오래 빛날까?' : '오른쪽 끝까지 끌어 보자') : '눈금을 끌어 세월 흘리기', v > 0.9]; },
    },
    // ── 2-1-2 3차시: 성운이 수축하며 빨리 돌고 납작해진다 ──
    spin: {
      init(st) { st.ph = 0; },
      draw(c, W, H, v, t, dt, st) {
        space(c, W, H, t, 21);
        st.ph += dt * (0.25 + 3.4 * v * v);
        const cx = W / 2, cy = H * 0.47, R0 = Math.min(W * 0.42, H * 0.62), k = 1 - 0.55 * v, fl = 1 - 0.8 * v, tilt = fl;
        // 성운 기체 덩이(보라·분홍·파랑)
        const Q = rnd(5);
        for (let i = 0; i < 26; i++) { const a = Q() * TAU + st.ph * 0.35, d = Math.sqrt(Q()) * R0 * k, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * tilt, rr = (28 + Q() * 46) * (1 - 0.4 * v); const col = ['rgba(150,110,220,', 'rgba(230,120,170,', 'rgba(90,150,230,'][i % 3]; G.glow(c, x, y, rr, col + (0.18 + 0.1 * (1 - v)) + ')'); }
        // 원시 태양
        G.glow(c, cx, cy, 16 + 80 * v, `rgba(255,214,110,${0.2 + 0.75 * v})`); if (v > 0.4) G.ball(c, cx, cy, 4 + 13 * (v - 0.4) / 0.6, '#ffd84d', '#f29a1d');
        // 티끌 알갱이: 빠를수록 꼬리(흔적)가 길다
        for (let i = 0; i < 110; i++) {
          const d = (0.12 + ((i * 37) % 88) / 100) * R0 * k, w = (0.5 + 0.9 * (R0 * k / Math.max(d, 8))) , a = i * 2.4 + st.ph * w * 0.6, tail = Math.min(1.2, 0.05 + 0.5 * v * w * 0.6);
          c.strokeStyle = `rgba(215,225,255,${0.25 + 0.5 * ((i % 5) / 5)})`; c.lineWidth = 1.2 + (i % 3) * 0.7; c.lineCap = 'round';
          c.beginPath(); c.ellipse(cx, cy, d, d * tilt, 0, a - tail, a); c.stroke();
          G.glow(c, cx + Math.cos(a) * d, cy + Math.sin(a) * d * tilt, 3 + (i % 3), 'rgba(235,240,255,.9)');
        }
        // 도는 방향 화살표
        const ar = Math.min(R0 * k * 1.02, W * 0.4, (H - cy - 34) / Math.max(tilt, 0.2)); c.strokeStyle = 'rgba(255,216,77,.85)'; c.lineWidth = 3; c.beginPath(); c.ellipse(cx, cy, ar, ar * tilt + 2, 0, 0.15 * Math.PI, 0.45 * Math.PI); c.stroke();
        const ea = 0.45 * Math.PI; G.arrow(c, cx + Math.cos(ea - 0.05) * ar, cy + Math.sin(ea - 0.05) * (ar * tilt + 2), cx + Math.cos(ea + 0.05) * ar, cy + Math.sin(ea + 0.05) * (ar * tilt + 2), YL, 3, 13);
        // 회전 빠르기 막대 + 크기 눈금
        const bx = W - 26, bh = H * 0.5, by = H * 0.24;
        c.fillStyle = 'rgba(255,255,255,.12)'; c.beginPath(); c.roundRect(bx - 8, by, 16, bh, 8); c.fill();
        const sp = (0.25 + 3.4 * v * v) / 3.65; c.fillStyle = YL; c.beginPath(); c.roundRect(bx - 8, by + bh * (1 - sp), 16, bh * sp, 8); c.fill();
        G.txt(c, '회전', bx, by - 8, YL, '700 13px'); G.txt(c, '빠르기', bx, by + bh + 18, YL, '700 13px', 'center');
        G.line(c, cx - R0 * k, H - 22, cx + R0 * k, H - 22, DIM, 2); G.line(c, cx - R0 * k, H - 28, cx - R0 * k, H - 16, DIM, 2); G.line(c, cx + R0 * k, H - 28, cx + R0 * k, H - 16, DIM, 2);
        G.pill(c, cx, H - 22, v < 0.35 ? '둥글게 퍼진 성운' : v < 0.85 ? '수축 중 · 점점 납작' : '원시 태양 + 원시 원반', 'rgba(15,20,34,.9)', INK, '700 13px');
      },
      hint: (W, H) => [W * 0.3, H * 0.47, W * 0.32, '오른쪽으로 끌어 오므리기'],
      say(v, moved) { return [v < 0.3 ? '천천히 도는 <b>성운</b> — 둥글게 퍼져 있다' : v < 0.85 ? '수축할수록 <b>빨리 돌고 납작해진다</b>' : '가운데 원시 태양, 둘레에 <b>납작한 원반</b> — 모두 같은 방향으로 돈다', moved ? (v > 0.85 ? '행성은 이 원반에서 생긴다' : '오른쪽 끝까지 끌어 보자') : '끌어서 성운 오므리기', v > 0.85]; },
    },
    // ── 2-1-3 2차시: 원자 번호 1~20, 전자를 하나씩 채운다 ──
    shell: {
      draw(c, W, H, v, t) {
        space(c, W, H, t, 31);
        const z = 1 + Math.round(v * 19), sh = cfg(z), cx = W * 0.29, cy = H * 0.5, step = H * 0.43 / 5.25;
        atom(c, cx, cy, step, sh, t, { z, hiOuter: true });
        // 오른쪽 위: 원소 칸 크게 + 전자 배치
        const rx = W * 0.58, rw = W * 0.4, tw = Math.min(92, rw * 0.36), ty = 70;
        tile(c, rx, ty, tw, tw * 1.08, z, SYM[z - 1], NAMES[z - 1], grp(z) === 1 && z > 1 ? '#ff9f6b' : grp(z) === 18 ? '#a7c7ff' : '#ffe08a', true);
        G.txt(c, '전자 배치', rx + tw + 14, ty + 22, DIM, '600 13px', 'left'); G.txt(c, sh.join(', '), rx + tw + 14, ty + 50, YL, '800 24px', 'left');
        G.txt(c, `바깥 껍질 ${sh[sh.length - 1]}개`, rx + tw + 14, ty + 78, INK, '700 15px', 'left');
        // 오른쪽 아래: 1~20번 주기율표(1족 칸 주황)
        const cw = Math.min(40, (W - rx - 14) / 8), ch = Math.min(cw * 0.95, (H - ty - tw * 1.08 - 50) / 4), ox = rx, oy = H - ch * 4 - 12;
        G.txt(c, '1족', ox + cw / 2, oy - 6, '#ff9f6b', '700 12px'); G.txt(c, '18족', ox + cw * 7.5, oy - 6, '#a7c7ff', '700 12px');
        for (let k = 1; k <= 20; k++) {
          const g = grp(k), per = k <= 2 ? 0 : k <= 10 ? 1 : k <= 18 ? 2 : 3, x = ox + (g <= 2 ? g - 1 : g - 11) * cw, y = oy + per * ch, on = k === z, one = g === 1 && k > 1;
          c.fillStyle = on ? YL : one ? 'rgba(255,159,107,.4)' : k < z ? 'rgba(255,255,255,.16)' : 'rgba(255,255,255,.06)'; c.fillRect(x + 1, y + 1, cw - 2, ch - 2);
          G.txt(c, SYM[k - 1], x + cw / 2, y + ch * 0.68, on ? '#1d2433' : DIM, `700 ${Math.round(Math.min(cw, ch) * 0.46)}px`);
        }
        for (let p = 0; p < 4; p++) G.txt(c, `${p + 1}`, ox - 6, oy + p * ch + ch * 0.68, DIM, '600 10px', 'right');
      },
      hint: (W, H) => [W * 0.1, H * 0.5, W * 0.3, '오른쪽으로 끌어 전자 더하기'],
      say(v, moved) { const z = 1 + Math.round(v * 19), s = cfg(z), same = [3, 11, 19].includes(z); return [`원자 번호 <b>${z}</b> ${NAMES[z - 1]} · 전자 배치 ${s.join(', ')} · 가장 바깥 껍질 전자 <b>${s[s.length - 1]}</b>개${same ? ' — 리튬·나트륨·칼륨은 모두 1개' : ''}`, moved ? '3번·11번·19번의 바깥 껍질을 견주어 보자' : '끌어서 전자 하나씩 더하기', same && z > 3]; },
    },
    // ── 2-1-3 3차시: 나트륨의 바깥 전자를 떼어 내면 네온과 같은 배치 ──
    noble: {
      draw(c, W, H, v, t) {
        space(c, W, H, t, 41);
        const st = Math.min(W / 17, H / 11), ax = W * 0.28, bx = W * 0.75, y = H * 0.5, off = v >= 0.9;
        atom(c, ax, y, st, off ? [2, 8] : [2, 8, 1], t, { z: 11, skip: off ? 0 : 1, hiOuter: !off });
        atom(c, bx, y, st, [2, 8], t, { z: 10, tint: 'rgba(110,160,255,.35)' });
        // 떼어 내는 전자: 바깥 껍질에서 오른쪽 위로, 끌림을 고무줄 같은 점선으로
        const r3 = st * 3.25, ex = ax + r3 + v * W * 0.18, ey = y - v * H * 0.28 + Math.sin(t * 4) * 2;
        if (!off) { c.strokeStyle = `rgba(255,216,77,${0.6 - 0.4 * v})`; c.lineWidth = 2; c.setLineDash([4, 5]); c.beginPath(); c.moveTo(ax + r3, y); c.quadraticCurveTo(ax + r3 + 20, y - 10, ex, ey); c.stroke(); c.setLineDash([]); }
        electron(c, ex, ey, 6);
        if (off) { G.pill(c, ex, ey - 20, '떨어져 나간 전자', 'rgba(15,20,34,.9)', YL, '700 12px'); [ax, bx].forEach((x) => { c.strokeStyle = `rgba(127,227,160,${0.6 + 0.3 * Math.sin(t * 4)})`; c.lineWidth = 3; c.beginPath(); c.arc(x, y, st * 2.25 + 9, 0, TAU); c.stroke(); }); G.pill(c, (ax + bx) / 2, y, '같은 배치', 'rgba(30,90,50,.9)', '#c9f5d6', '800 14px'); }
        G.pill(c, ax, H - 54, off ? 'Na⁺ 나트륨 이온 · 2, 8' : 'Na 나트륨 · 2, 8, 1', 'rgba(15,20,34,.9)', off ? '#7fe3a0' : INK, '700 14px');
        G.pill(c, bx, H - 54, 'Ne 네온 · 2, 8', 'rgba(15,20,34,.9)', '#a7c7ff', '700 14px');
        G.txt(c, `원자핵 (+)11 · 전자 ${off ? 10 : 11}개`, ax, H - 24, DIM, '600 12px'); G.txt(c, '원자핵 (+)10 · 전자 10개', bx, H - 24, DIM, '600 12px');
      },
      hint: (W, H) => [W * 0.28 + Math.min(W / 17, H / 11) * 3.25, H * 0.5, W * 0.16, '바깥 전자를 끌어 떼기'],
      say(v, moved) { return [v < 0.9 ? '나트륨: 바깥 껍질에 전자 <b>1개</b> · 네온: 바깥 껍질이 <b>8개</b>로 꽉 찼다' : '전자 1개를 떼어 내니 나트륨의 전자 배치가 <b>네온과 같아졌다</b>', moved ? (v < 0.9 ? '전자를 끝까지 떼어 내 보자' : '둘의 바깥 껍질을 견주어 보자') : '끌어서 바깥 전자 떼기', v >= 0.9]; },
    },
    // ── 2-1-4 1차시: 나트륨의 전자가 염소로 → Na⁺·Cl⁻ → 끌어당겨 소금 알갱이 ──
    salt: {
      draw(c, W, H, v, t) {
        space(c, W, H, t, 51);
        const st = Math.min(W / 18, H / 11.5), on = v >= 0.9, y = H * 0.48, pull = on ? (W * 0.47 - st * 5.5 - 26) / 2 : 0;
        const ax = W * 0.25 + pull, bx = W * 0.72 - pull;
        atom(c, ax, y, st, on ? [2, 8] : [2, 8, 1], t, { z: 11, skip: on ? 0 : 1, hiOuter: !on });
        atom(c, bx, y, st, [2, 8, 8], t, { z: 17, skip: on ? 0 : 1, tint: 'rgba(120,220,140,.35)' });
        const r3 = st * 3.25, k = ease(Math.min(1, v / 0.9)), a0 = 0, a1 = Math.PI + TAU / 8 * 0.5;
        // 건너가는 전자: 나트륨 바깥 껍질 → 염소 바깥 껍질의 빈자리
        const sx = ax + r3, sy = y, tx = bx + Math.cos(a1) * r3, ty = y + Math.sin(a1) * r3;
        const ex = lerp(sx, tx, k), ey = lerp(sy, ty, k) - Math.sin(k * Math.PI) * st * 1.6;
        if (k > 0.02 && k < 0.99) for (let i = 1; i < 10; i++) { const q = Math.max(0, k - i * 0.03); c.fillStyle = `rgba(255,159,67,${0.4 - i * 0.04})`; c.beginPath(); c.arc(lerp(sx, tx, q), lerp(sy, ty, q) - Math.sin(q * Math.PI) * st * 1.6, 5 - i * 0.4, 0, TAU); c.fill(); }
        if (!on) electron(c, ex, ey, 5.5, '#ff9f43');
        if (on) {
          [[ax, st * 2.25, '+', '#ff8a65'], [bx, r3, '−', '#7fe3a0']].forEach(([x, rr, s, col]) => { c.strokeStyle = col; c.lineWidth = 2.5; c.beginPath(); c.arc(x, y, rr + 8, 0, TAU); c.stroke(); G.ball(c, x + rr * 0.72, y - rr * 0.72 - 6, 11, col, '#333'); G.txt(c, s, x + rr * 0.72, y - rr * 0.72, '#1d2433', '900 17px'); });
          const m = (ax + st * 2.25 + 8 + bx - r3 - 8) / 2, wob = Math.sin(t * 5) * 2; G.arrow(c, m - 3 + wob, y, ax + st * 2.25 + 10, y, '#ffd84d', 3, 9); G.arrow(c, m + 3 - wob, y, bx - r3 - 10, y, '#ffd84d', 3, 9);
          G.pill(c, m, y + r3 + 2, '서로 끌어당긴다', 'rgba(15,20,34,.9)', YL, '700 13px');
          // 오른쪽 위: 소금 알갱이(정육면체 결정)
          const gx = W - 52, gy = 46, s = 22 + Math.sin(t * 2) * 0.5;
          G.glow(c, gx, gy, 40, 'rgba(255,255,255,.18)');
          c.fillStyle = '#f4f6fb'; c.beginPath(); c.moveTo(gx - s, gy - s * 0.4); c.lineTo(gx, gy - s); c.lineTo(gx + s, gy - s * 0.4); c.lineTo(gx, gy + s * 0.2); c.closePath(); c.fill();
          c.fillStyle = '#c9d0de'; c.beginPath(); c.moveTo(gx - s, gy - s * 0.4); c.lineTo(gx, gy + s * 0.2); c.lineTo(gx, gy + s); c.lineTo(gx - s, gy + s * 0.4); c.closePath(); c.fill();
          c.fillStyle = '#aab3c5'; c.beginPath(); c.moveTo(gx + s, gy - s * 0.4); c.lineTo(gx, gy + s * 0.2); c.lineTo(gx, gy + s); c.lineTo(gx + s, gy + s * 0.4); c.closePath(); c.fill();
          G.txt(c, '소금', gx, gy + s + 18, INK, '700 13px');
        }
        G.pill(c, ax, H - 50, on ? 'Na⁺ 나트륨 이온 · 2, 8' : 'Na 나트륨 · 2, 8, 1', 'rgba(15,20,34,.9)', on ? '#ff9f80' : INK, '700 14px');
        G.pill(c, bx, H - 50, on ? 'Cl⁻ 염화 이온 · 2, 8, 8' : 'Cl 염소 · 2, 8, 7', 'rgba(15,20,34,.9)', on ? '#7fe3a0' : INK, '700 14px');
        G.txt(c, '원자핵 (+)11 · 전자 11개 → 10개', ax, H - 22, DIM, '600 12px'); G.txt(c, '원자핵 (+)17 · 전자 17개 → 18개', bx, H - 22, DIM, '600 12px');
      },
      hint: (W, H) => [W * 0.25 + Math.min(W / 18, H / 11.5) * 3.25, H * 0.48, W * 0.2, '전자를 염소 쪽으로'],
      say(v, moved) { return [v < 0.9 ? '나트륨의 바깥 전자 <b>1개</b>가 염소 쪽으로 건너간다' : '<b>Na⁺</b>와 <b>Cl⁻</b> — 둘 다 바깥 껍질이 8개로 꽉 찼고, (+)와 (−)가 서로 끌어당긴다', moved ? (v < 0.9 ? '끝까지 건네 보자' : '이렇게 붙은 것이 소금(염화 나트륨)') : '끌어서 전자 건네기', v >= 0.9]; },
    },
    // ── 2-1-4 2차시: 수소 원자 둘이 다가가 전자쌍을 함께 가진다 ──
    share: {
      draw(c, W, H, v, t) {
        space(c, W, H, t, 61);
        const on = v >= 0.9, k = ease(Math.min(1, v / 0.9)), st = Math.min(W / 7.5, H / 4.2), gap = st * lerp(2.9, 1.2, k), y = H * 0.4;
        [-1, 1].forEach((s) => {
          const x = W / 2 + s * gap / 2;
          const g = c.createRadialGradient(x, y, 0, x, y, st); g.addColorStop(0, `rgba(120,170,255,${0.32 + 0.1 * Math.sin(t * 2 + s)})`); g.addColorStop(0.75, 'rgba(90,130,230,.12)'); g.addColorStop(1, 'rgba(90,130,230,0)');
          c.fillStyle = g; c.beginPath(); c.arc(x, y, st, 0, TAU); c.fill();
          c.strokeStyle = on ? 'rgba(255,216,77,.75)' : 'rgba(170,185,220,.5)'; c.lineWidth = on ? 2.2 : 1.4; c.beginPath(); c.arc(x, y, st * 0.78, 0, TAU); c.stroke();
          nucleus(c, x, y, st * 0.16, 1, t);
          if (!on) { const a = t * 1.1 * s + (s > 0 ? 1 : 0); electron(c, x + Math.cos(a) * st * 0.78, y + Math.sin(a) * st * 0.78, 5.5); }
          G.txt(c, 'H', x, y + st + 18, INK, '800 16px');
        });
        if (on) { // 겹친 곳의 전자쌍: 두 원자 사이를 오가며 8자로 돈다
          const a = t * 2.2; [0, Math.PI].forEach((p) => electron(c, W / 2 + Math.sin(a + p) * gap * 0.16, y + Math.cos(a + p) * st * 0.3, 5.5));
          G.pill(c, W / 2, y - st * 0.95, '공유 전자쌍', 'rgba(15,20,34,.9)', YL, '800 14px');
        }
        // 아래 작은 그래프: 핵 사이 거리와 에너지(모양만, 이해를 돕기 위한 예)
        const gx = W * 0.14, gw = W * 0.72, gy = H - 20, gh = H * 0.22;
        c.fillStyle = 'rgba(255,255,255,.06)'; c.beginPath(); c.roundRect(gx - 10, gy - gh - 14, gw + 20, gh + 24, 10); c.fill();
        const E = (u) => { const d = lerp(0.35, 1, u); return 1.6 * (Math.pow(0.42 / d, 6) - 2 * Math.pow(0.42 / d, 3)); };
        c.strokeStyle = 'rgba(167,199,255,.85)'; c.lineWidth = 2; c.beginPath(); for (let i = 0; i <= 60; i++) { const u = i / 60, yy = gy - gh * 0.55 - clamp(E(u), -1.7, 0.8) * gh * 0.32; (i ? c.lineTo : c.moveTo).call(c, gx + u * gw, yy); } c.stroke();
        G.line(c, gx, gy - gh * 0.55, gx + gw, gy - gh * 0.55, 'rgba(255,255,255,.25)', 1, [3, 4]);
        const u = clamp((gap / st - 0.75) / 2.3, 0, 1), py = gy - gh * 0.55 - clamp(E(u), -1.7, 0.8) * gh * 0.32;
        G.ball(c, gx + u * gw, py, 6, YL, '#b88a00');
        G.txt(c, '에너지', gx - 4, gy - gh - 2, DIM, '600 11px', 'left'); G.txt(c, '핵 사이 거리 →', gx + gw, gy + 2, DIM, '600 11px', 'right');
      },
      hint: (W, H) => [W * 0.26, H * 0.4, W * 0.18, '끌어서 두 원자 붙이기'],
      say(v, moved) { return [v < 0.9 ? '수소 원자 둘 — 전자가 <b>1개씩</b>. 헬륨처럼 되려면 하나씩 모자란다' : '전자쌍 하나를 <b>함께</b> 가진 수소 분자 H₂ — 둘 다 헬륨처럼 전자 2개', moved ? (v < 0.9 ? '두 원자가 겹칠 때까지 끌어 보자' : '빼앗지 않고 같이 쓴다') : '끌어서 두 원자 붙이기', v >= 0.9]; },
    },
  };
  function mount(root, kind) {
    const K = KINDS[kind], P = window.Play;
    const stage = root.querySelector('.au-stage'), out = root.querySelector('.au-out'), now = root.querySelector('.au-now');
    const st = {}; if (K.init) K.init(st);
    let v = 0, v0 = 0, x0 = 0, t = 0, moved = false;
    function set(x) { v = clamp(x, 0, 1); const [o, n, done] = K.say(v, moved); out.innerHTML = o; now.textContent = n; now.classList.toggle('done', !!done); }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; c.clearRect(0, 0, W, H); K.draw(c, W, H, v, t, dt, st);
        if (!moved && K.hint) { const [hx, hy, d, l] = K.hint(W, H); G.hint(c, hx, hy, t, d, l); }
      },
      down(p) { x0 = p.x; v0 = v; },
      move(p, e, held) { if (held && Math.abs(p.x - x0) > 2) { moved = true; set(v0 + (p.x - x0) / S.W * 1.3); } },
      key(e) { const d = { ArrowLeft: -0.05, ArrowRight: 0.05 }[e.key]; if (!d) return false; moved = true; set(v + d); return true; },
    });
    set(0);
    root._cv = { set: (x) => { moved = true; set(x); S.redraw(); } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Cov = { mount };
})();
