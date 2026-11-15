/* 3-1 4차시 표지 «화산 하나, 서늘해진 지구»(교과서 116~117쪽 · 1991년 필리핀 피나투보 화산).
   왼쪽: 열대 숲·마을 사이 화산 단면(마그마 방 → 화도 → 분화구). 화산을 꾹 누르고 있으면 압력 게이지가 차서 폭발 →
   화산재·가스 기둥이 성층권까지 → 바람을 타고 오른쪽 작은 지구를 감싸는 회색 띠로 번짐 → 햇빛 화살이 줄고
   아래 «지구 평균 기온 변화» 그래프가 해마다 그려지며 약 0.5 ℃ 내려갔다가 몇 해 뒤 돌아온다(관측 경향을 단순화).
   키보드: 스페이스·엔터로 압력 올리기, 0 처음부터. Pinatubo.mount(root) → { fit, setActive } · 시험용: root._pn.blow() · year(1990~1995) · state() */
(function () {
  'use strict';
  const TAU = Math.PI * 2;
  const Y0 = 1990, Y1 = 1995, ERUPT = 1991.45; // 1991년 6월
  // 하늘을 덮은 화산재·가스 띠의 짙기(0~1): 분출 뒤 반년 만에 지구를 감싸고 2~3년에 걸쳐 걷힌다
  const veil = (y) => (y < ERUPT ? 0 : y < 1992 ? (y - ERUPT) / (1992 - ERUPT) : Math.max(0, 1 - (y - 1992) / 2.5));
  // 기온 변화(℃): 띠보다 조금 늦게 가장 낮아진다(약 -0.5 ℃) + 해마다 작은 들쭉날쭉
  const bump = (y) => (y < 1991.6 ? 0 : y < 1992.4 ? (y - 1991.6) / 0.8 : Math.max(0, 1 - (y - 1992.4) / 2.3));
  const dT = (y) => -0.5 * bump(y) + 0.04 * Math.sin(y * 9.1) + 0.03 * Math.sin(y * 23.7);
  console.assert(veil(1990) === 0 && veil(1992) === 1 && veil(1995) === 0 && dT(1992.4) < -0.4 && Math.abs(dT(1990.5)) < 0.1, 'pinatubo: 띠·기온 곡선');

  function mount(root) {
    const stage = root.querySelector('.pn-stage'), now = root.querySelector('.pn-now');
    const P = window.Play;
    let p, erupted, yr, t, hold, ash, msg, art = null, artKey = '';
    function reset() { p = 0; erupted = false; yr = ERUPT - 0.05; t = 0; hold = false; ash = []; msg = ''; }
    reset();
    const say = (h, ok) => { if (h !== msg) { msg = h; now.textContent = h; now.classList.toggle('done', !!ok); } };
    // 배치: 왼쪽 58% 화산, 오른쪽 위 지구, 오른쪽 아래 그래프
    const lay = (W, H) => ({ vx: W * 0.29, ground: H * 0.7, strat: H * 0.2, gx: W * 0.6, ex: W * 0.8, ey: H * 0.24, er: Math.min(W * 0.11, H * 0.15), gy: H * 0.5, gw: W * 0.37, gh: H * 0.4 });

    // 하늘·땅·화산·숲·마을 바탕(크기가 바뀔 때만 다시 그린다)
    function backdrop(W, H) {
      const key = W + 'x' + H; if (art && artKey === key) return art;
      art = document.createElement('canvas'); art.width = W; art.height = H; artKey = key; const c = art.getContext('2d'), L = lay(W, H);
      let g = c.createLinearGradient(0, 0, 0, L.ground); g.addColorStop(0, '#1f3f7a'); g.addColorStop(0.35, '#4f86c6'); g.addColorStop(1, '#cfe6f4'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      // 성층권 경계(대류권 위)
      c.strokeStyle = 'rgba(255,255,255,.35)'; c.setLineDash([5, 6]); c.beginPath(); c.moveTo(0, L.strat); c.lineTo(L.gx - 10, L.strat); c.stroke(); c.setLineDash([]);
      // 땅 단면(흙·암석층)
      g = c.createLinearGradient(0, L.ground, 0, H); g.addColorStop(0, '#6b5038'); g.addColorStop(1, '#3b2a1e'); c.fillStyle = g; c.fillRect(0, L.ground, L.gx - 10, H - L.ground);
      let s = 7; const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
      for (let i = 0; i < 90; i++) { c.fillStyle = `rgba(${rnd() < 0.5 ? '255,230,200' : '30,20,10'},${0.08 + rnd() * 0.1})`; c.beginPath(); c.arc(rnd() * (L.gx - 10), L.ground + rnd() * (H - L.ground), 1 + rnd() * 3, 0, TAU); c.fill(); }
      // 마그마 방
      const my = L.ground + (H - L.ground) * 0.6; g = c.createRadialGradient(L.vx, my, 4, L.vx, my, 60); g.addColorStop(0, '#ffd25a'); g.addColorStop(0.5, '#f0702a'); g.addColorStop(1, '#8e2412'); c.fillStyle = g; c.beginPath(); c.ellipse(L.vx, my, 62, 22, 0, 0, TAU); c.fill();
      // 화산체(명암)
      const top = L.strat + (L.ground - L.strat) * 0.55, hw = W * 0.2;
      g = c.createLinearGradient(L.vx - hw, 0, L.vx + hw, 0); g.addColorStop(0, '#7a6a58'); g.addColorStop(0.45, '#5a4a3c'); g.addColorStop(1, '#2f261f'); c.fillStyle = g;
      c.beginPath(); c.moveTo(L.vx - hw, L.ground + 2); c.quadraticCurveTo(L.vx - hw * 0.4, L.ground - 10, L.vx - 18, top); c.lineTo(L.vx + 18, top); c.quadraticCurveTo(L.vx + hw * 0.4, L.ground - 10, L.vx + hw, L.ground + 2); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.12)'; c.lineWidth = 1.5; for (let k = 1; k < 6; k++) { c.beginPath(); c.moveTo(L.vx - 14 + k * 2, top + 4); c.lineTo(L.vx - hw * (0.2 + k * 0.13), L.ground); c.stroke(); }
      // 화도
      c.fillStyle = '#c4421c'; c.fillRect(L.vx - 4, top, 8, my - top - 18);
      // 열대 숲(양쪽 비탈 아래)
      const tree = (x, y, k) => { c.fillStyle = '#4a3218'; c.fillRect(x - 1.5, y - 10 * k, 3, 10 * k); const tg = c.createRadialGradient(x - 3, y - 16 * k, 2, x, y - 14 * k, 10 * k); tg.addColorStop(0, '#6fae45'); tg.addColorStop(1, '#2d6a2a'); c.fillStyle = tg; c.beginPath(); c.arc(x, y - 14 * k, 9 * k, 0, TAU); c.fill(); };
      for (let i = 0; i < 9; i++) { tree(8 + i * 11, L.ground, 0.8 + (i % 3) * 0.15); tree(L.vx + hw - 6 + i * 10, L.ground, 0.75 + (i % 2) * 0.2); }
      // 마을(지붕 있는 집 셋)
      [[L.vx - hw - 26, 0], [L.vx - hw - 6, 1]].forEach(([x], i) => { c.fillStyle = '#efe2c8'; c.fillRect(x, L.ground - 12, 16, 12); c.fillStyle = i ? '#b3472e' : '#8a5a32'; c.beginPath(); c.moveTo(x - 3, L.ground - 12); c.lineTo(x + 8, L.ground - 20); c.lineTo(x + 19, L.ground - 12); c.fill(); });
      // 오른쪽 칸 바탕(우주)
      g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#0b1530'); g.addColorStop(1, '#16213e'); c.fillStyle = g; c.fillRect(L.gx - 6, 0, W - L.gx + 6, H);
      for (let i = 0; i < 40; i++) { c.fillStyle = `rgba(255,255,255,${0.3 + rnd() * 0.6})`; c.fillRect(L.gx + rnd() * (W - L.gx), rnd() * H * 0.45, 1.5, 1.5); }
      c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(L.gx - 6, 0, 2, H);
      return art;
    }
    function earth(c, L) {
      const { ex, ey, er } = L, v = veil(yr);
      // 햇빛 화살(왼쪽 위 → 지구): 띠가 짙을수록 덜 닿는다
      for (let i = 0; i < 5; i++) {
        const y = ey - er * 0.8 + i * er * 0.4, u = (t * 0.6 + i * 0.21) % 1, reach = 1 - v * 0.55;
        c.strokeStyle = `rgba(255,214,90,${0.85 - v * 0.5})`; c.lineWidth = 3; c.beginPath(); c.moveTo(L.gx + 6, y); c.lineTo(L.gx + 6 + (ex - er - L.gx) * reach, y); c.stroke();
        if (v > 0.3) { c.fillStyle = 'rgba(255,214,90,.6)'; c.beginPath(); c.arc(L.gx + 6 + (ex - er - L.gx) * reach + 4, y - 6 * u, 2.5, 0, TAU); c.fill(); }
      }
      // 지구
      let g = c.createRadialGradient(ex - er * 0.35, ey - er * 0.35, er * 0.1, ex, ey, er); g.addColorStop(0, '#6fb6f0'); g.addColorStop(0.7, '#1f5fae'); g.addColorStop(1, '#0c2c5e'); c.fillStyle = g; c.beginPath(); c.arc(ex, ey, er, 0, TAU); c.fill();
      c.save(); c.beginPath(); c.arc(ex, ey, er, 0, TAU); c.clip();
      const rot = (t * 0.08) % 1;
      [[0.1, -0.25, 0.32, 0.22], [0.55, 0.1, 0.22, 0.3], [0.85, -0.35, 0.28, 0.18], [0.35, 0.35, 0.18, 0.14]].forEach(([u, vv, rw, rh]) => {
        const x = ex + (((u + rot) % 1) * 2 - 1) * er * 1.4; c.fillStyle = '#5f9a45'; c.beginPath(); c.ellipse(x, ey + vv * er, rw * er, rh * er, 0.3, 0, TAU); c.fill();
      });
      // 화산재·가스 띠(적도 부근에서 남북으로 번진다)
      if (v > 0) { const bw = er * (0.25 + v * 0.75); g = c.createLinearGradient(0, ey - bw, 0, ey + bw); g.addColorStop(0, 'rgba(170,165,160,0)'); g.addColorStop(0.5, `rgba(185,180,172,${0.75 * v})`); g.addColorStop(1, 'rgba(170,165,160,0)'); c.fillStyle = g; c.fillRect(ex - er, ey - bw, er * 2, bw * 2); }
      // 밤 쪽 그늘
      g = c.createLinearGradient(ex - er, 0, ex + er, 0); g.addColorStop(0.5, 'rgba(0,0,20,0)'); g.addColorStop(1, 'rgba(0,0,20,.55)'); c.fillStyle = g; c.fillRect(ex - er, ey - er, er * 2, er * 2);
      c.restore();
      if (v > 0.05) P.txt(c, '하늘을 감싼 화산재·가스', ex, ey + er + 16, '#d9d4cc', '800 12px');
    }
    function graph(c, L) {
      const { gx, gy, gw, gh } = L, x = (y) => gx + 16 + (y - Y0) / (Y1 - Y0) * (gw - 30), yv = (d) => gy + 16 + (0.2 - d) / 0.8 * (gh - 34);
      c.fillStyle = 'rgba(255,255,255,.95)'; c.beginPath(); c.roundRect(gx, gy, gw, gh, 8); c.fill();
      P.txt(c, '지구 평균 기온 변화(℃)', gx + 8, gy + 13, '#1d2433', '800 11px', 'left');
      c.strokeStyle = '#c9cfd8'; c.lineWidth = 1; [0, -0.5].forEach((d) => { c.beginPath(); c.moveTo(x(Y0), yv(d)); c.lineTo(x(Y1), yv(d)); c.stroke(); P.txt(c, d ? '약 -0.5' : '0', x(Y1) - 2, yv(d) - 3, '#7a8494', '700 10px', 'right'); });
      for (let y = Y0; y <= Y1; y++) P.txt(c, String(y).slice(2) === '90' ? '1990' : `'${String(y).slice(2)}`, x(y), gy + gh - 4, '#7a8494', '700 10px');
      // 분출 표시
      c.strokeStyle = '#d24b2a'; c.setLineDash([3, 3]); c.beginPath(); c.moveTo(x(ERUPT), gy + 16); c.lineTo(x(ERUPT), gy + gh - 16); c.stroke(); c.setLineDash([]);
      // 곡선(지금 해까지)
      c.strokeStyle = '#1f5fae'; c.lineWidth = 2.5; c.beginPath(); for (let y = Y0; y <= yr; y += 0.04) c.lineTo(x(y), yv(dT(y))); c.stroke();
      c.fillStyle = '#1f5fae'; c.beginPath(); c.arc(x(yr), yv(dT(yr)), 4, 0, TAU); c.fill();
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const L = lay(W, H), top = L.strat + (L.ground - L.strat) * 0.55;
        // 압력: 누르는 동안 차고, 놓으면 조금씩 빠진다
        if (!erupted) { p = Math.max(0, Math.min(1, p + (hold ? 0.55 : -0.12) * dt)); if (p >= 1) erupt(); }
        else if (yr < Y1) yr = Math.min(Y1, yr + dt * 0.55);
        c.drawImage(backdrop(W, H), 0, 0);
        // 마그마가 화도로 차오른다
        const my = L.ground + (H - L.ground) * 0.6, fill = erupted ? Math.max(0.25, 1 - (yr - ERUPT) * 0.6) : p;
        c.fillStyle = `rgba(255,${150 + fill * 80},60,${0.5 + fill * 0.5})`; c.fillRect(L.vx - 4, my - 18 - (my - 18 - top) * fill, 8, (my - 18 - top) * fill);
        if (p > 0.5 && !erupted) { const sh = (p - 0.5) * 4; c.save(); c.translate(Math.sin(t * 60) * sh, 0); P.glow(c, L.vx, top, 18 + sh * 6, 'rgba(255,120,40,.6)'); c.restore(); }
        // 분출 기둥과 화산재
        const since = erupted ? (yr - ERUPT) : 0;
        if (erupted && since < 1.2) {
          const k = Math.max(0, 1 - since / 1.2), colTop = L.strat - 14;
          const g = c.createLinearGradient(0, colTop, 0, top); g.addColorStop(0, `rgba(150,145,140,${0.75 * k})`); g.addColorStop(1, `rgba(90,80,75,${0.95 * k})`); c.fillStyle = g;
          c.beginPath(); c.moveTo(L.vx - 10, top); c.quadraticCurveTo(L.vx - 30, (top + colTop) / 2, L.vx - 60, colTop); c.lineTo(L.vx + 70, colTop - 6); c.quadraticCurveTo(L.vx + 30, (top + colTop) / 2, L.vx + 10, top); c.fill();
          // 우산 모양 구름(성층권)
          c.fillStyle = `rgba(165,160,152,${0.8 * k})`; for (let i = 0; i < 7; i++) { c.beginPath(); c.arc(L.vx - 60 + i * 24 + since * 60, colTop + Math.sin(i + t) * 3, 16, 0, TAU); c.fill(); }
          P.glow(c, L.vx, top, 22, `rgba(255,120,40,${0.8 * k})`);
          if (Math.random() < 0.9 * k) ash.push({ x: L.vx + (Math.random() - 0.5) * 60, y: L.strat - 10 + Math.random() * 20, vx: 50 + Math.random() * 60, a: 0.9 });
        }
        // 성층권의 바람이 화산재를 지구 쪽으로
        ash.forEach((a) => { a.x += a.vx * dt; a.y += Math.sin(a.x * 0.05) * 0.3; if (a.x > L.gx - 8) a.a -= dt * 2; c.fillStyle = `rgba(200,195,188,${Math.max(0, a.a)})`; c.beginPath(); c.arc(a.x, a.y, 2.2, 0, TAU); c.fill(); });
        ash = ash.filter((a) => a.a > 0);
        P.txt(c, '성층권', 8, L.strat - 6, 'rgba(255,255,255,.85)', '800 12px', 'left');
        P.txt(c, '마그마 방', L.vx + 70, my + 4, '#ffe2c0', '800 12px', 'left');
        // 압력 게이지
        if (!erupted) {
          const gx = L.vx + W * 0.11, gy = top - 4, gh = 70; c.fillStyle = 'rgba(10,16,32,.7)'; c.beginPath(); c.roundRect(gx - 4, gy - 4, 20, gh + 8, 6); c.fill();
          const gg = c.createLinearGradient(0, gy + gh, 0, gy); gg.addColorStop(0, '#ffd84d'); gg.addColorStop(1, '#e2462a'); c.fillStyle = gg; c.fillRect(gx, gy + gh * (1 - p), 12, gh * p);
          P.txt(c, '압력', gx + 6, gy + gh + 18, '#fff', '800 12px');
          if (!hold && p < 0.05) { const w = 0.5 + 0.5 * Math.sin(t * 4); c.strokeStyle = `rgba(255,216,77,${w})`; c.lineWidth = 3; c.beginPath(); c.arc(L.vx, top + 20, 30 + w * 6, 0, TAU); c.stroke(); P.txt(c, '꾹 누르기', L.vx, top + 66, '#fff', '800 14px'); }
        }
        earth(c, L); graph(c, L);
        P.txt(c, `${Math.floor(yr)}년`, L.gx + L.gw - 8, L.gy + 13, '#1f5fae', '800 12px', 'right');
        // 안내
        const d = dT(yr);
        if (!erupted) say(p > 0.02 ? `마그마가 차오른다 — 압력 ${Math.round(p * 100)}%` : '화산을 꾹 누르고 있으면 압력이 찬다');
        else if (yr < 1992) say('폭발! 화산재와 가스가 성층권까지 올라 바람을 타고 퍼진다');
        else if (yr < 1993.2) say(`하늘을 감싼 띠가 햇빛을 가린다 — 지구 평균 기온 약 ${d.toFixed(1)} ℃`);
        else if (yr < Y1) say('화산재와 가스가 걷히며 기온이 돌아온다');
        else say('화산 하나가 몇 해 동안 지구 전체의 기온을 바꿨다 — 다시 누르면 처음부터', true);
      },
      down(p0) { if (erupted && yr >= Y1) reset(); if (!erupted && p0.x < lay(S.W, S.H).gx) hold = true; },
      up() { hold = false; },
      key(e) {
        if (e.key === ' ' || e.key === 'Enter') { if (erupted && yr >= Y1) reset(); if (!erupted) { p = Math.min(1, p + 0.25); if (p >= 1) erupt(); } return true; }
        if (e.key === '0') { reset(); return true; } return false;
      },
    });
    function erupt() { erupted = true; p = 1; yr = ERUPT; hold = false; window.RxT.jolt(stage, 1); S.kick(); }
    const state = () => ({ pressure: +p.toFixed(2), erupted, year: +yr.toFixed(2), dT: +dT(yr).toFixed(2), veil: +veil(yr).toFixed(2) });
    root._pn = { blow: () => { if (!erupted) erupt(); return state(); }, year: (y) => { if (!erupted) erupt(); yr = Math.max(ERUPT, Math.min(Y1, y)); S.kick(); return state(); }, state };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Pinatubo = { mount };
})();
