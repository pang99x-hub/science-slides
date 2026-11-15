/* 2-2 4차시 체험 «여러 물체의 전기적 성질»(교과서 88쪽 해 보기: 디지털 전류계·스위치·전지·집게 달린 전선).
   아래 받침의 물체(클립·연필심·지우개·나무 막대·발광 다이오드)를 끌어 판 위 아무 데나 놓으면 두 집게 사이에 끼워진다.
   스위치 손잡이를 끌어 내리면 회로가 닫히고 전류계 숫자가 오르며 전선 위로 전자 점이 흐른다.
   끼운 발광 다이오드를 누르면 방향이 뒤집힌다(한쪽 방향만 켜짐). 숫자는 이해를 돕기 위한 예.
   결과 표(.cr-table)는 회로를 닫고 시험할 때마다 채운다. 키보드: 1~5 물체 끼우기, 스페이스 스위치, F 뒤집기, 0 처음부터.
   Circuit.mount(root) → { fit, setActive } · 시험용: root._cr.test('clip') · flip() · close() · state() */
(function () {
  'use strict';
  // mA: 이해를 돕기 위한 예. led는 바른 방향일 때만
  const OBJ = [
    { k: 'clip', n: '클립', mA: 480, col: '#c3cbd3' },
    { k: 'lead', n: '연필심', mA: 120, col: '#4a5468' },
    { k: 'eraser', n: '지우개', mA: 0, col: '#f2a3a0' },
    { k: 'wood', n: '나무 막대', mA: 0, col: '#b98a55' },
    { k: 'led', n: '발광 다이오드', mA: 18, col: '#f6f1d0' },
  ];

  function mount(root) {
    const stage = root.querySelector('.cr-stage'), now = root.querySelector('.cr-now'), out = root.querySelector('.cr-out');
    const P = window.Play;
    let cur = null, rev = false, closed = false, lever = 0, drag = null, t = 0, msg = '';
    const tested = new Set(), ledDir = new Set(); // ledDir: 'f'·'r' 두 방향 모두 해 봤나
    const G = (W, H) => {
      const L = W * 0.12, R = W * 0.88, T = H * 0.16, B = H * 0.62, mid = W * 0.5;
      return { L, R, T, B, mid, gap: [mid - 60, mid + 60], trayY: H - 40, trayX: (i) => W * (0.11 + i * 0.195), sw: [W * 0.32, T], am: [W * 0.66, T],
        path: [[mid + 60, B], [R, B], [R, T], [L, T], [L, B], [mid - 60, B]] };
    };
    const amp = () => (!closed || !cur ? 0 : cur.k === 'led' ? (rev ? 0 : cur.mA) : cur.mA);
    function say(h) { if (h !== msg) { msg = h; out.innerHTML = h; } }
    function record() {
      if (!closed || !cur) return;
      const a = amp(); tested.add(cur.k); if (cur.k === 'led') ledDir.add(rev ? 'r' : 'f');
      const row = root.querySelector(`.cr-table tr[data-k="${cur.k}"] td`);
      if (row) { const led = cur.k === 'led'; row.textContent = led ? (ledDir.size === 2 ? '○ (한쪽 방향만)' : a ? '○' : '×') : a ? '○' : '×'; row.className = a || (led && ledDir.has('f')) ? 'ok' : 'no'; }
      say(a ? `<b>${cur.n}</b>: 전류가 흐른다 — ${a} mA${cur.k === 'led' ? ' · 불이 켜졌다' : ''}` : cur.k === 'led' ? '<b>발광 다이오드</b>: 거꾸로 끼우면 흐르지 않는다 — 다시 눌러 뒤집어 보자' : `<b>${cur.n}</b>: 전류가 흐르지 않는다 — 0 mA`);
      steps();
    }
    function steps() {
      const ok = []; if (tested.size >= 3) ok.push(1); if (tested.size >= 5) ok.push(2); if (ledDir.size === 2) ok.push(3);
      const st = [1, 2, 3].find((q) => !ok.includes(q)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      const nt = st === 1 ? '① 물체를 끌어 집게에 끼우고 스위치를 내리자' : st === 2 ? '② 다섯 물체를 모두 시험하자' : st === 3 ? '③ 끼운 발광 다이오드를 눌러 뒤집어 보자' : '전류가 잘 흐르는 물체와 그렇지 않은 물체가 있다';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
    }
    function put(o) { cur = o; rev = false; record(); S.kick(); }
    function setClosed(v) { if (closed === v) return; closed = v; lever = v ? 1 : 0; record(); if (!v) say('스위치를 열었다 — 오래 닫아 두면 연필심·전선이 뜨거워진다'); S.kick(); }
    // 그림(2026-11-10 «그래픽 다시 그리기»): 나무 실험대 위 실제 부품 — 건전지 홀더, 칼 스위치, 7세그먼트 전류계, 악어 집게, 물체 실물 모양
    const lg = (c, x0, y0, x1, y1, st) => { const g = c.createLinearGradient(x0, y0, x1, y1); st.forEach(([o, col]) => g.addColorStop(o, col)); return g; };
    let bg = null, bw = 0, bh = 0;
    function table(W, H) { // 나무 실험대(결) — 한 번만 그린다
      if (bg && bw === W && bh === H) return bg;
      bg = document.createElement('canvas'); bw = W; bh = H; bg.width = W * 2; bg.height = H * 2; const c = bg.getContext('2d'); c.scale(2, 2);
      c.fillStyle = lg(c, 0, 0, 0, H, [[0, '#8a5a34'], [1, '#6b4325']]); c.fillRect(0, 0, W, H);
      for (let i = 0; i < 70; i++) { const y = (i * 37.7) % H, a = 0.04 + (i % 5) * 0.015; c.strokeStyle = `rgba(40,20,5,${a})`; c.lineWidth = 1 + (i % 3); c.beginPath(); c.moveTo(0, y); for (let x = 0; x <= W; x += 40) c.lineTo(x, y + Math.sin(x / 90 + i) * 3); c.stroke(); }
      c.fillStyle = 'rgba(255,230,190,.06)'; c.fillRect(0, 0, W, H * 0.4);
      return bg;
    }
    function wire(c, pts, col) { c.lineJoin = 'round'; c.lineCap = 'round'; c.strokeStyle = 'rgba(0,0,0,.35)'; c.lineWidth = 8; c.beginPath(); pts.forEach(([x, y], i) => c[i ? 'lineTo' : 'moveTo'](x + 2, y + 3)); c.stroke(); c.strokeStyle = col; c.lineWidth = 6; c.beginPath(); pts.forEach(([x, y], i) => c[i ? 'lineTo' : 'moveTo'](x, y)); c.stroke(); c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.5; c.stroke(); }
    const SEG = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
    function seg7(c, txt, x, y, h, on) { // 오른쪽 맞춤 7세그먼트 숫자
      const w = h * 0.55, t = h * 0.12; [...txt.padStart(3, ' ')].forEach((ch, k) => {
        const ox = x + k * (w + t * 2); const lit = SEG[ch] || '';
        const S2 = { a: [ox + t, y, w - 2 * t, t], d: [ox + t, y + h - t, w - 2 * t, t], g: [ox + t, y + h / 2 - t / 2, w - 2 * t, t], f: [ox, y + t, t, h / 2 - t], b: [ox + w - t, y + t, t, h / 2 - t], e: [ox, y + h / 2, t, h / 2 - t], c: [ox + w - t, y + h / 2, t, h / 2 - t] };
        Object.entries(S2).forEach(([sg, r]) => { c.fillStyle = lit.includes(sg) && on ? '#ff5a3c' : 'rgba(255,90,60,.1)'; c.fillRect(...r); }); });
    }
    function gator(c, x, y, dir) { // 악어 집게(빨간 손잡이 + 톱니 턱)
      c.save(); c.translate(x, y); c.scale(dir, 1);
      c.fillStyle = lg(c, 0, -10, 0, 10, [[0, '#e8e2d8'], [0.5, '#9aa0a8'], [1, '#5d636c']]); c.beginPath(); c.moveTo(0, -3); c.lineTo(22, -9); c.lineTo(22, 9); c.lineTo(0, 3); c.fill();
      c.fillStyle = '#5d636c'; for (let i = 0; i < 4; i++) { c.beginPath(); c.moveTo(4 + i * 5, -4); c.lineTo(6 + i * 5, 0); c.lineTo(8 + i * 5, -4); c.fill(); }
      c.fillStyle = lg(c, 0, -9, 0, 9, [[0, '#ff6b55'], [1, '#a32514']]); c.beginPath(); c.roundRect(-30, -9, 32, 18, 6); c.fill();
      c.restore();
    }
    function drawObj(c, o, x, y, w, flip) {
      c.save(); c.translate(x, y);
      c.fillStyle = 'rgba(0,0,0,.28)'; c.beginPath(); c.ellipse(3, 12, w / 2, 5, 0, 0, Math.PI * 2); c.fill(); // 그림자
      if (o.k === 'clip') { // 은빛 철사 클립
        c.lineCap = 'round'; const L = w / 2; const path = () => { c.beginPath(); c.moveTo(-L + 10, 6); c.lineTo(L - 6, 6); c.arc(L - 6, 0, 6, Math.PI / 2, -Math.PI / 2, true); c.lineTo(-L + 6, -6); c.arc(-L + 6, -1, 5, -Math.PI / 2, Math.PI / 2, true); c.lineTo(L - 16, 4); c.arc(L - 16, 0, 4, Math.PI / 2, -Math.PI / 2, true); c.lineTo(-L + 18, -4); };
        c.strokeStyle = '#6b737e'; c.lineWidth = 4; path(); c.stroke(); c.strokeStyle = '#eef2f6'; c.lineWidth = 1.6; path(); c.stroke(); }
      else if (o.k === 'lead') { c.fillStyle = lg(c, 0, -4, 0, 4, [[0, '#8d929b'], [0.35, '#3a3e46'], [1, '#15171b']]); c.beginPath(); c.roundRect(-w / 2, -4, w, 8, 4); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(-w / 2 + 4, -3, w - 8, 1.5); }
      else if (o.k === 'eraser') { c.fillStyle = lg(c, 0, -11, 0, 11, [[0, '#ffc7c3'], [0.6, '#f29a95'], [1, '#c96e6a']]); c.beginPath(); c.roundRect(-w * 0.32, -11, w * 0.64, 22, 6); c.fill(); c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.roundRect(-w * 0.3, -10, w * 0.6, 5, 3); c.fill(); }
      else if (o.k === 'wood') { c.fillStyle = lg(c, 0, -6, 0, 6, [[0, '#e3b47a'], [0.5, '#c48a4c'], [1, '#8a5a2c']]); c.beginPath(); c.roundRect(-w / 2, -6, w, 12, 3); c.fill(); c.strokeStyle = 'rgba(90,50,15,.45)'; c.lineWidth = 1; for (let i = 0; i < 3; i++) { c.beginPath(); c.moveTo(-w / 2 + 3, -3 + i * 3); c.bezierCurveTo(-w / 6, -5 + i * 3, w / 6, -1 + i * 3, w / 2 - 3, -3 + i * 3); c.stroke(); } }
      else if (o.k === 'led') { const d = flip ? -1 : 1; // 투명 렌즈 + 길이가 다른 다리 둘(긴 쪽 +)
        c.strokeStyle = '#c8cdd5'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(-6, 4); c.lineTo(-6, 8); c.lineTo(-w / 2, 8); c.moveTo(6, 4); c.lineTo(6, 8); c.lineTo(w / 2, 8); c.stroke();
        c.fillStyle = 'rgba(255,248,210,.55)'; c.beginPath(); c.arc(0, -8, 11, Math.PI, 0); c.lineTo(11, 4); c.lineTo(-11, 4); c.fill(); c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 1.2; c.stroke();
        c.fillStyle = 'rgba(255,255,255,.7)'; c.beginPath(); c.ellipse(-4, -12, 2.5, 5, -0.4, 0, Math.PI * 2); c.fill();
        if (w >= 100) P.txt(c, d > 0 ? '+ 긴 다리 ←' : '→ 긴 다리 +', 0, 28, '#fff3d6', '700 12px'); }
      c.restore();
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const g = G(W, H), a = amp();
        c.drawImage(table(W, H), 0, 0, W, H);
        wire(c, g.path, '#c9342a');
        // 전지(왼쪽 변 가운데): 검은 홀더에 끼운 원통 건전지
        const by = (g.T + g.B) / 2; c.fillStyle = '#1b1d22'; c.beginPath(); c.roundRect(g.L - 18, by - 34, 36, 68, 6); c.fill();
        c.fillStyle = lg(c, g.L - 12, 0, g.L + 12, 0, [[0, '#6e5010'], [0.45, '#f2c544'], [1, '#6e5010']]); c.fillRect(g.L - 12, by - 26, 24, 34);
        c.fillStyle = lg(c, g.L - 12, 0, g.L + 12, 0, [[0, '#1f232b'], [0.45, '#5a6170'], [1, '#1f232b']]); c.fillRect(g.L - 12, by + 8, 24, 18);
        c.fillStyle = '#c8cdd5'; c.fillRect(g.L - 5, by - 30, 10, 4); P.txt(c, '+', g.L, by - 12, '#3a2a00', '800 14px'); P.txt(c, '전지 1.5 V', g.L + 24, by + 5, '#fff3d6', '700 13px', 'left');
        // 스위치(위 변): 흰 받침 위 칼 스위치, 손잡이를 끌어 내리면 닫힘
        const [sx, sy] = g.sw, ang = -0.7 * (1 - lever);
        c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.roundRect(sx - 40, sy - 8, 84, 22, 5); c.fill();
        c.fillStyle = lg(c, 0, sy - 10, 0, sy + 10, [[0, '#f4f1ea'], [1, '#c9c3b6']]); c.beginPath(); c.roundRect(sx - 42, sy - 11, 84, 20, 5); c.fill();
        c.fillStyle = '#b08a3a'; c.beginPath(); c.arc(sx - 28, sy, 5, 0, Math.PI * 2); c.arc(sx + 30, sy, 5, 0, Math.PI * 2); c.fill();
        const ex = sx - 28 + 58 * Math.cos(ang), ey = sy + 58 * Math.sin(ang);
        c.strokeStyle = '#8a6a2a'; c.lineWidth = 6; c.lineCap = 'round'; c.beginPath(); c.moveTo(sx - 28, sy); c.lineTo(ex, ey); c.stroke(); c.strokeStyle = '#f0d58a'; c.lineWidth = 2; c.stroke();
        c.fillStyle = lg(c, ex - 8, ey - 8, ex + 8, ey + 8, [[0, '#ff7a5c'], [1, '#a32514']]); c.beginPath(); c.arc(ex, ey, 10, 0, Math.PI * 2); c.fill();
        P.txt(c, closed ? '스위치 닫힘' : '스위치 — 빨간 손잡이를 끌어 내리기', sx + 6, sy + 74, closed ? '#b6f5c8' : '#fff3d6', '700 13px');
        // 디지털 전류계(위 변): 회색 몸체 + 어두운 창 + 7세그먼트 숫자
        const [ax, ay] = g.am;
        c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.roundRect(ax - 62, ay - 28, 128, 66, 12); c.fill();
        c.fillStyle = lg(c, 0, ay - 32, 0, ay + 32, [[0, '#e6e8ec'], [1, '#a9aeb7']]); c.beginPath(); c.roundRect(ax - 64, ay - 32, 128, 64, 12); c.fill();
        c.fillStyle = '#121418'; c.beginPath(); c.roundRect(ax - 52, ay - 22, 104, 34, 5); c.fill();
        seg7(c, String(Math.round(a)), ax - 46, ay - 17, 24, true); P.txt(c, 'mA', ax + 38, ay + 4, a ? '#ff8a6a' : '#6a4a44', '800 12px');
        c.fillStyle = '#d8462f'; c.beginPath(); c.arc(ax - 40, ay + 22, 4, 0, Math.PI * 2); c.fill(); c.fillStyle = '#1d2433'; c.beginPath(); c.arc(ax + 40, ay + 22, 4, 0, Math.PI * 2); c.fill();
        P.txt(c, '디지털 전류계', ax, ay + 50, '#fff3d6', '700 13px');
        // 악어 집게와 끼운 물체(아래 변 가운데)
        gator(c, g.gap[0], g.B, 1); gator(c, g.gap[1], g.B, -1);
        if (cur) drawObj(c, cur, g.mid, g.B, 110, rev); else P.txt(c, '여기에 물체가 끼워진다', g.mid, g.B + 32, 'rgba(255,243,214,.7)', '700 13px');
        if (cur && cur.k === 'led' && a) P.glow(c, g.mid, g.B - 8, 60, 'rgba(255,226,120,.7)');
        // 전자 점: 전류가 흐를 때만, 세기에 따라 빠르기
        if (a) { const pts = g.path, n = pts.length - 1, sp = 0.05 + a / 1600; for (let k = 0; k < 14; k++) { const f = ((t * sp + k / 14) % 1) * n, i = Math.floor(f), u = f - i, [x1, y1] = pts[i], [x2, y2] = pts[i + 1]; c.fillStyle = '#9fe4ff'; c.beginPath(); c.arc(x1 + (x2 - x1) * u, y1 + (y2 - y1) * u, 3.5, 0, Math.PI * 2); c.fill(); } }
        // 받침
        c.fillStyle = lg(c, 0, g.trayY - 34, 0, H, [[0, '#3a2414'], [1, '#24160c']]); c.fillRect(0, g.trayY - 34, W, H); c.fillStyle = 'rgba(255,255,255,.08)'; c.fillRect(0, g.trayY - 34, W, 2);
        OBJ.forEach((o, i) => { const x = g.trayX(i); c.globalAlpha = tested.has(o.k) ? 0.55 : 1; drawObj(c, o, x, g.trayY - 8, 70, false); c.globalAlpha = 1; P.txt(c, o.n, x, g.trayY + 24, '#fff3d6', '700 12px'); });
        if (drag && drag.o) drawObj(c, drag.o, drag.x, drag.y, 90, false);
      },
      down(p) {
        const g = G(S.W, S.H);
        const i = OBJ.findIndex((_, k) => Math.abs(p.x - g.trayX(k)) < 48 && Math.abs(p.y - g.trayY) < 34);
        if (i >= 0) { drag = { o: OBJ[i], x: p.x, y: p.y }; return; }
        const [sx, sy] = g.sw; if (Math.hypot(p.x - sx, p.y - sy) < 70) { drag = { sw: true, y0: p.y, l0: lever }; return; }
        if (cur && cur.k === 'led' && Math.abs(p.x - g.mid) < 60 && Math.abs(p.y - g.B) < 34) { rev = !rev; record(); }
      },
      move(p, e, held) { if (!held || !drag) return; if (drag.sw) { lever = Math.max(0, Math.min(1, drag.l0 + (p.y - drag.y0) / 50)); } else { drag.x = p.x; drag.y = p.y; } },
      up(p) {
        if (!drag) return; const g = G(S.W, S.H), d = drag; drag = null;
        if (d.sw) { setClosed(lever > 0.5); lever = closed ? 1 : 0; return; }
        if (p.y < g.trayY - 36) put(d.o); // 판 위 어디에 놓아도 집게 사이로
      },
      key(e) {
        const i = '12345'.indexOf(e.key); if (i >= 0) { put(OBJ[i]); return true; }
        if (e.key === ' ') { setClosed(!closed); return true; }
        if (e.key === 'f' || e.key === 'F') { if (cur && cur.k === 'led') { rev = !rev; record(); } return true; }
        if (e.key === '0') { reset(); return true; } return false;
      },
    });
    function reset() {
      cur = null; rev = false; closed = false; lever = 0; tested.clear(); ledDir.clear();
      root.querySelectorAll('.cr-table td').forEach((td) => { td.textContent = ''; td.className = ''; });
      say('물체를 끌어 집게 사이에 끼우고, 스위치 손잡이를 끌어 내려 회로를 닫자'); steps(); S.kick();
    }
    root.querySelector('.cr-reset')?.addEventListener('click', reset);
    reset();
    root._cr = {
      test(k) { put(OBJ.find((o) => o.k === k)); setClosed(true); record(); return amp(); },
      flip() { if (cur && cur.k === 'led') { rev = !rev; record(); S.kick(); } return amp(); },
      close() { setClosed(true); return amp(); },
      state: () => ({ cur: cur && cur.k, rev, closed, amp: amp(), tested: [...tested], led: [...ledDir] }),
    };
    console.assert(OBJ.find((o) => o.k === 'eraser').mA === 0 && OBJ.find((o) => o.k === 'clip').mA > OBJ.find((o) => o.k === 'lead').mA, 'circuit: 전류 크기 순서');
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Circuit = { mount };
})();
