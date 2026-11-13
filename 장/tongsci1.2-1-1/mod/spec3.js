/* 2-1 1차시 이론 «스펙트럼 세 가지»(교과서 48쪽 그림 Ⅱ-1). 실험대: 왼쪽 광원 자리(백열등), 가운데 빛길, 프리즘, 아래 스크린.
   아래 기체 병(수소·헬륨·나트륨)을 끌어 «광원 자리»에 놓으면 그 기체가 뜨겁게 빛나 방출 스펙트럼, «빛길»에 놓으면 백열등 빛이
   차가운 기체를 지나 흡수 스펙트럼. 병을 밖으로 끌어내면 다시 백열등의 연속 스펙트럼. 빛 알갱이가 계속 흐르고, 왼쪽 정의 상자가 따라 밝아진다.
   SpecKinds.mount(root) → { fit, setActive } · 시험용: root._sk.put('H'|'He'|'Na', 'src'|'path'|null) */
(function () {
  'use strict';
  const EL = ['H', 'He', 'Na'];
  const MODE = { cont: ['연속 스펙트럼', '백열등 빛 → 모든 색이 끊김 없이 이어진 띠'], emit: ['방출 스펙트럼', '고온의 기체가 내는 빛 → 검은 바탕에 <b>밝은 선</b>'], abs: ['흡수 스펙트럼', '백열등 빛이 저온의 기체를 지남 → 연속 띠 위에 <b>검은 선</b>'] };
  function mount(root) {
    const stage = root.querySelector('.sk-stage'), out = root.querySelector('.sk-out'), rows = [...root.querySelectorAll('.lv-row')], now = root.querySelector('.sk-now');
    const P = window.Play, S0 = () => window.Spec;
    const jars = EL.map((k, i) => ({ k, slot: null, x: 0, y: 0, home: i }));
    let drag = null, t = 0, phot = [], seen = new Set(['cont']);
    const L = (W, H) => ({ src: [W * 0.1, H * 0.3], path: [W * 0.33, H * 0.3], prism: [W * 0.58, H * 0.3], bandY: H * 0.56, bx: W * 0.05, bw: W * 0.9, shelfY: H * 0.9, home: (i) => [W * (0.3 + i * 0.16), H * 0.9] });
    const mode = () => (jars.some((j) => j.slot === 'src') ? 'emit' : jars.some((j) => j.slot === 'path') ? 'abs' : 'cont');
    const gas = () => (jars.find((j) => j.slot) || {}).k;
    function place(j, slot) { jars.forEach((o) => { if (o !== j && o.slot && (slot === o.slot || slot)) o.slot = null; }); j.slot = slot; seen.add(mode()); sync(); }
    function sync() {
      const m = mode(), g = gas();
      rows.forEach((r) => r.classList.toggle('on', r.dataset.k === m));
      out.innerHTML = `<b>${MODE[m][0]}</b> · ${MODE[m][1]}${g ? ` <small>${S0().NAME[g]}의 선은 늘 같은 자리</small>` : ''}`;
      const st = !seen.has('emit') ? 1 : !seen.has('abs') ? 2 : 0;
      now.textContent = st === 1 ? '기체 병을 끌어 «광원 자리»에 놓자' : st === 2 ? '이번엔 병을 «빛길»에 놓자' : '같은 기체면 밝은 선·검은 선 자리가 같다';
      now.classList.toggle('done', st === 0);
    }
    function jarDraw(c, j, x, y) {
      const col = S0().rgb(S0().LINES[j.k][S0().LINES[j.k].length - 1][0]);
      const hot = j.slot === 'src';
      if (hot) P.glow(c, x, y, 70, col.replace('rgb', 'rgba').replace(')', ',.8)'));
      c.fillStyle = hot ? col : 'rgba(180,210,240,.55)'; c.strokeStyle = '#1d2433'; c.lineWidth = 3;
      c.beginPath(); c.roundRect(x - 34, y - 40, 68, 80, 12); c.fill(); c.stroke();
      c.fillStyle = '#5a6270'; c.fillRect(x - 20, y - 52, 40, 14);
      P.txt(c, S0().NAME[j.k], x, y + 8, hot ? '#1d2433' : '#1d2433', '800 21px');
      if (j.slot === 'path') for (let i = 0; i < 8; i++) { c.fillStyle = '#2a73b8'; c.beginPath(); c.arc(x - 22 + (i * 13) % 46, y - 28 + (i * 23) % 56, 3.5, 0, Math.PI * 2); c.fill(); }
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const g = L(W, H), m = mode(), lines = gas() ? S0().LINES[gas()] : [];
        c.fillStyle = '#f6f4ec'; c.fillRect(0, 0, W, H);
        // 자리 표시
        [['src', '광원 자리'], ['path', '빛길(저온)']].forEach(([k, n]) => { const [x, y] = g[k]; c.setLineDash([7, 6]); c.strokeStyle = drag ? '#b8860b' : '#9aa3ad'; c.lineWidth = 2; c.strokeRect(x - 48, y - 58, 96, 116); c.setLineDash([]); P.txt(c, n, x, y + 82, '#4a5468', '700 21px'); });
        // 백열등(광원 자리에 기체가 없을 때)
        if (m !== 'emit') { const [x, y] = g.src; P.glow(c, x, y, 64, 'rgba(255,240,180,1)', 'rgba(255,240,180,0)'); c.fillStyle = '#ffe48a'; c.strokeStyle = '#1d2433'; c.lineWidth = 3; c.beginPath(); c.arc(x, y, 26, 0, Math.PI * 2); c.fill(); c.stroke(); P.txt(c, '백열등', x, y + 50, '#1d2433', '700 20px'); }
        // 빛줄기와 흐르는 빛 알갱이
        const [sx, sy] = g.src, [px, py] = g.prism;
        c.strokeStyle = 'rgba(255,210,90,.5)'; c.lineWidth = 10; c.beginPath(); c.moveTo(sx + 30, sy); c.lineTo(px - 40, py); c.stroke();
        if (Math.random() < 0.5) phot.push({ x: sx + 30, life: 1 });
        phot.forEach((p) => { p.x += 260 * dt; }); phot = phot.filter((p) => p.x < px - 40);
        phot.forEach((p) => { c.fillStyle = '#ffd84d'; c.beginPath(); c.arc(p.x, sy + Math.sin(p.x / 9) * 3, 4, 0, Math.PI * 2); c.fill(); });
        // 프리즘
        c.fillStyle = 'rgba(210,235,250,.9)'; c.strokeStyle = '#1d2433'; c.lineWidth = 3; c.beginPath(); c.moveTo(px, py - 70); c.lineTo(px + 62, py + 46); c.lineTo(px - 62, py + 46); c.closePath(); c.fill(); c.stroke();
        P.txt(c, '프리즘', px, py + 76, '#1d2433', '700 21px');
        for (let i = 0; i <= 12; i++) { const nm = 400 + 25 * i; c.strokeStyle = S0().rgb(nm, m === 'emit' ? 0.2 : 0.9); c.globalAlpha = 0.6; c.lineWidth = 3; c.beginPath(); c.moveTo(px + 20, py + 10); c.lineTo(S0().xOf(nm, g.bx, g.bw), g.bandY); c.stroke(); c.globalAlpha = 1; }
        S0().band(c, g.bx, g.bandY, g.bw, H * 0.14, { mode: m, lines }); c.strokeStyle = '#1d2433'; c.lineWidth = 3; c.strokeRect(g.bx, g.bandY, g.bw, H * 0.14);
        S0().scale(c, g.bx, g.bandY + H * 0.14 + 2, g.bw);
        // 기체 병
        P.txt(c, '기체 병 — 끌어 옮기기', W * 0.1, g.shelfY + 6, '#4a5468', '700 19px', 'left');
        jars.forEach((j) => { if (j === drag) return; const [x, y] = j.slot ? g[j.slot] : g.home(j.home); jarDraw(c, j, x, y); });
        if (drag) jarDraw(c, drag, drag.x, drag.y);
      },
      down(p) {
        const g = L(S.W, S.H);
        drag = jars.find((j) => { const [x, y] = j.slot ? g[j.slot] : g.home(j.home); return Math.abs(p.x - x) < 40 && Math.abs(p.y - y) < 50; }) || null;
        if (drag) { drag.x = p.x; drag.y = p.y; }
      },
      move(p, e, held) { if (held && drag) { drag.x = p.x; drag.y = p.y; } },
      up(p) {
        if (!drag) return; const g = L(S.W, S.H);
        const near = (k) => Math.hypot(p.x - g[k][0], p.y - g[k][1]) < 80;
        place(drag, near('src') ? 'src' : near('path') ? 'path' : null); drag = null;
      },
      key(e) { const i = '123'.indexOf(e.key); if (i >= 0) { const j = jars[i]; place(j, j.slot === 'src' ? 'path' : j.slot === 'path' ? null : 'src'); return true; } return false; },
    });
    sync();
    root._sk = { put: (k, slot) => { place(jars.find((j) => j.k === k), slot); S.kick(); } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.SpecKinds = { mount };
})();
