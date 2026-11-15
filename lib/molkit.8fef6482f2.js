/* 2-1 4차시 체험 «분자 조립»(교과서 71쪽 해 보기: 공유 결합을 모형으로 나타내기). 아래 받침에서 수소·탄소·질소·플루오린 원자를 끌어 판에 놓는다.
   원자를 다른 원자에 바짝 붙여 놓으면 두 원자 모두 짝 없는 전자(노란 테)가 남아 있을 때 전자쌍 하나를 함께 쓰는 공유 결합이 생긴다.
   이미 결합한 짝에 다시 바짝 붙이면 이중·삼중 결합. 결합은 용수철처럼 흔들리고 원자끼리는 밀어내 저절로 자리를 잡는다.
   짝 없는 전자가 0인 덩어리는 분자 완성 → 이름. 원자를 받침으로 끌어 내리면 결합이 풀리며 사라진다.
   키보드: 1~4 원자 넣기, 스페이스 마지막 원자를 가까운 원자와 결합, Delete 마지막 원자 빼기, 0 모두 비우기.
   MolKit.mount(root) → { fit, setActive } · 시험용: root._mk.build('CH4') · add(el) · clear() · info() */
(function () {
  'use strict';
  const K = {
    H: { n: '수소', z: 1, out: 1, v: 1, col: '#e9eef7' },
    C: { n: '탄소', z: 6, out: 4, v: 4, col: '#5d6475' },
    N: { n: '질소', z: 7, out: 5, v: 3, col: '#5a8df0' },
    F: { n: '플루오린', z: 9, out: 7, v: 1, col: '#7fd36b' },
  };
  const ORDER = ['C', 'H', 'N', 'F'];
  const NAMES = {
    H2: ['H₂', '수소'], F2: ['F₂', '플루오린'], HF: ['HF', '플루오린화 수소'], H3N: ['NH₃', '암모니아'], CH4: ['CH₄', '메테인'],
    N2: ['N₂', '질소'], NF3: ['NF₃', '삼플루오린화 질소'], CF4: ['CF₄', '사플루오린화 탄소'], C2H6: ['C₂H₆', '에테인'], CHN: ['HCN', '사이안화 수소'],
    C2H4: ['C₂H₄', '에텐(에틸렌)'], C2H2: ['C₂H₂', '에타인(아세틸렌)'], CH3F: ['CH₃F', '플루오린화 메틸'], H4N2: ['N₂H₄', '하이드라진'],
  };
  const RECIPE = {
    HF: [['H', 'F'], [[0, 1, 1]]], NH3: [['N', 'H', 'H', 'H'], [[0, 1, 1], [0, 2, 1], [0, 3, 1]]],
    CH4: [['C', 'H', 'H', 'H', 'H'], [[0, 1, 1], [0, 2, 1], [0, 3, 1], [0, 4, 1]]], N2: [['N', 'N'], [[0, 1, 3]]],
    H2: [['H', 'H'], [[0, 1, 1]]], HCN: [['H', 'C', 'N'], [[0, 1, 1], [1, 2, 3]]],
  };
  const MAX = 12;
  const SUB = (s) => s.replace(/\d/g, (d) => '₀₁₂₃₄₅₆₇₈₉'[d]);
  function mount(root) {
    const stage = root.querySelector('.mk-stage'), now = root.querySelector('.mk-now'), out = root.querySelector('.mk-out');
    const P = window.Play;
    let atoms = [], bonds = new Map(), drag = null, uid = 0, t = 0, msg = '';
    const made = new Set();
    const key = (a, b) => (a.id < b.id ? `${a.id}-${b.id}` : `${b.id}-${a.id}`);
    const used = (a) => { let s = 0; bonds.forEach((o, k) => { const [x, y] = k.split('-').map(Number); if (x === a.id || y === a.id) s += o; }); return s; };
    const free = (a) => K[a.el].v - used(a);
    const byId = (id) => atoms.find((a) => a.id === id);
    const partners = (a) => { const o = []; bonds.forEach((ord, k) => { const [x, y] = k.split('-').map(Number); if (x === a.id) o.push([byId(y), ord]); else if (y === a.id) o.push([byId(x), ord]); }); return o; };
    const G = (W, H) => ({ R: Math.max(22, Math.min(W, H) * 0.06), trayY: H - 50, tray: (i) => [W * (0.2 + i * 0.2), H - 50] });
    function say(h) { if (h !== msg) { msg = h; out.innerHTML = h; } }
    function add(el, x, y) {
      if (atoms.length >= MAX) { say(`판에는 원자를 ${MAX}개까지 놓을 수 있다 — 쓰지 않는 원자는 받침으로 끌어 내리자`); return null; }
      const a = { id: ++uid, el, x, y, vx: 0, vy: 0 }; atoms.push(a); return a;
    }
    function remove(a) { atoms = atoms.filter((q) => q !== a); [...bonds.keys()].forEach((k) => { if (k.split('-').map(Number).includes(a.id)) bonds.delete(k); }); }
    function comps() {
      const seen = new Set(), list = [];
      atoms.forEach((a) => {
        if (seen.has(a)) return; const c = [], st = [a]; seen.add(a);
        while (st.length) { const q = st.pop(); c.push(q); partners(q).forEach(([b]) => { if (!seen.has(b)) { seen.add(b); st.push(b); } }); }
        list.push(c);
      });
      return list;
    }
    const formula = (c) => ORDER.map((e) => { const n = c.filter((a) => a.el === e).length; return n ? e + (n > 1 ? n : '') : ''; }).join('');
    function bond(a, b) {
      const k = key(a, b), o = bonds.get(k) || 0;
      if (free(a) < 1 || free(b) < 1) { say(`<b>${K[a.el].n}</b>·<b>${K[b.el].n}</b> 중 짝 없는 전자가 남지 않은 원자가 있어 더 결합하지 못한다`); return false; }
      if (o >= 3) return false;
      bonds.set(k, o + 1);
      const kind = ['단일', '이중', '삼중'][o];
      say(`${a.el}–${b.el} <b>${kind} 결합</b>: 두 원자가 전자를 하나씩 내어 만든 전자쌍 ${o + 1}개를 함께 쓴다`);
      const c = comps().find((q) => q.includes(a));
      if (c.every((q) => free(q) === 0)) {
        const f = formula(c), nm = NAMES[f], pairs = c.reduce((s, q) => s + used(q), 0) / 2;
        made.add(f); window.RxT.jolt(stage, 1);
        say(`<b>${nm ? `${nm[1]}(${nm[0]})` : `${SUB(f)} 분자`}</b> 완성 — 공유 전자쌍 ${pairs}개. ${c.some((q) => q.el === 'H') ? '수소는 헬륨처럼 2개, ' : ''}${c.some((q) => q.el !== 'H') ? '나머지는 네온처럼 바깥 껍질 8개' : '두 원자 모두 헬륨과 같은 배치'}`);
      }
      return true;
    }
    function nearest(a, maxD) { let best = null, bd = maxD; atoms.forEach((b) => { if (b === a) return; const d = Math.hypot(b.x - a.x, b.y - a.y); if (d < bd) { bd = d; best = b; } }); return best; }
    // 원자 둘레의 자리 4곳(수소는 1곳): 결합한 쪽 자리를 먼저 지우고, 남은 자리에 짝 없는 전자 → 비공유 전자쌍 순으로 놓는다.
    function slots(a) {
      const ps = partners(a), base = ps.length ? Math.atan2(ps[0][0].y - a.y, ps[0][0].x - a.x) : -Math.PI / 2;
      let s = [0, 1, 2, 3].map((k) => base + k * Math.PI / 2);
      ps.forEach(([b, o]) => { const d = Math.atan2(b.y - a.y, b.x - a.x); for (let r = 0; r < o && s.length; r++) { let bi = 0; s.forEach((q, i) => { if (Math.abs(Math.atan2(Math.sin(q - d), Math.cos(q - d))) < Math.abs(Math.atan2(Math.sin(s[bi] - d), Math.cos(s[bi] - d)))) bi = i; }); s.splice(bi, 1); } });
      const f = free(a), lone = (K[a.el].out - K[a.el].v) / 2;
      return { un: s.slice(0, f), lp: s.slice(f, f + lone) };
    }
    const dot = (c, x, y, r, col) => { c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fill(); };
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const g = G(W, H), R = g.R, L = R * 2.15, top = g.trayY - 46;
        // 힘: 결합은 용수철, 모든 원자는 서로 밀어냄, 벽 안에 가둠
        for (let it = 0; it < 2; it++) {
          atoms.forEach((a) => { a.fx = 0; a.fy = 0; });
          atoms.forEach((a, i) => atoms.slice(i + 1).forEach((b) => { const dx = b.x - a.x, dy = b.y - a.y, d = Math.max(1, Math.hypot(dx, dy)); if (d < L * 1.7 && !bonds.has(key(a, b))) { const f = (L * 1.7 - d) * 30; a.fx -= dx / d * f; a.fy -= dy / d * f; b.fx += dx / d * f; b.fy += dy / d * f; } }));
          bonds.forEach((o, k) => { const [a, b] = k.split('-').map((id) => byId(+id)); const dx = b.x - a.x, dy = b.y - a.y, d = Math.max(1, Math.hypot(dx, dy)), f = (d - L * (1 - (o - 1) * 0.06)) * 40; a.fx += dx / d * f; a.fy += dy / d * f; b.fx -= dx / d * f; b.fy -= dy / d * f; });
          atoms.forEach((a) => { if (drag && drag.a === a) { a.vx = a.vy = 0; return; } const h = Math.min(dt, 0.03) / 2; a.vx = (a.vx + a.fx * h) * (1 - 3 * h); a.vy = (a.vy + a.fy * h) * (1 - 3 * h); a.x = Math.max(R, Math.min(W - R, a.x + a.vx * h)); a.y = Math.max(R, Math.min(top - R, a.y + a.vy * h)); });
        }
        c.fillStyle = '#0f1630'; c.fillRect(0, 0, W, H);
        // 받침
        c.fillStyle = '#16203f'; c.fillRect(0, top + 8, W, H - top - 8); P.txt(c, '받침 — 끌어 올리기 / 끌어 내려 빼기', 14, top + 28, 'rgba(190,210,255,.7)', '600 14px', 'left');
        ORDER.slice().sort((p, q) => K[p].z - K[q].z).forEach((e, i) => { const [x, y] = g.tray(i); c.fillStyle = K[e].col; c.beginPath(); c.arc(x, y + 6, R * 0.55, 0, Math.PI * 2); c.fill(); P.txt(c, e, x, y + 13, e === 'H' ? '#1d2433' : '#fff', '800 20px'); P.txt(c, `${i + 1} ${K[e].n}`, x + R * 0.7, y + 12, '#fbfcf9', '700 16px', 'left'); });
        // 결합 전자쌍(두 원자 사이)
        bonds.forEach((o, k) => {
          const [a, b] = k.split('-').map((id) => byId(+id)); const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, d = Math.hypot(b.x - a.x, b.y - a.y) || 1, nx = -(b.y - a.y) / d, ny = (b.x - a.x) / d, ux = (b.x - a.x) / d, uy = (b.y - a.y) / d;
          P.glow(c, mx, my, R * 0.9, 'rgba(255,216,77,.28)');
          for (let r = 0; r < o; r++) { const off = (r - (o - 1) / 2) * 14; dot(c, mx + nx * off - ux * 5, my + ny * off - uy * 5, 5, '#ffd84d'); dot(c, mx + nx * off + ux * 5, my + ny * off + uy * 5, 5, '#ffd84d'); }
        });
        const done = comps().filter((q) => q.length > 1 && q.every((a) => free(a) === 0));
        done.forEach((q) => q.forEach((a) => P.glow(c, a.x, a.y, R * 1.8, 'rgba(92,199,122,.25)')));
        atoms.forEach((a) => {
          const k = K[a.el];
          c.strokeStyle = 'rgba(190,210,255,.7)'; c.lineWidth = 2; c.beginPath(); c.arc(a.x, a.y, R, 0, Math.PI * 2); c.stroke();
          if (a.el !== 'H') { c.strokeStyle = 'rgba(190,210,255,.35)'; c.beginPath(); c.arc(a.x, a.y, R * 0.55, 0, Math.PI * 2); c.stroke(); dot(c, a.x - R * 0.55, a.y, 3.5, '#5aa9f0'); dot(c, a.x + R * 0.55, a.y, 3.5, '#5aa9f0'); }
          c.fillStyle = '#e0503f'; c.beginPath(); c.arc(a.x, a.y, R * 0.33, 0, Math.PI * 2); c.fill(); P.txt(c, a.el, a.x, a.y + 6, '#fff', '800 17px');
          const { un, lp } = slots(a), w = Math.sin(t * 4 + a.id) * 1.5;
          un.forEach((q) => { const x = a.x + Math.cos(q) * R, y = a.y + Math.sin(q) * R; c.strokeStyle = '#ffd84d'; c.lineWidth = 2.5; c.beginPath(); c.arc(x, y, 9 + w, 0, Math.PI * 2); c.stroke(); dot(c, x, y, 5, '#7fd1ff'); });
          lp.forEach((q) => { const px = -Math.sin(q) * 6, py = Math.cos(q) * 6, x = a.x + Math.cos(q) * R, y = a.y + Math.sin(q) * R; dot(c, x + px, y + py, 4.5, '#5aa9f0'); dot(c, x - px, y - py, 4.5, '#5aa9f0'); });
        });
        done.forEach((q) => { const f = formula(q), nm = NAMES[f], x = q.reduce((s, a) => s + a.x, 0) / q.length, y = Math.min(...q.map((a) => a.y)) - R * 1.5; P.txt(c, nm ? `${nm[1]} ${nm[0]}` : SUB(f), x, Math.max(24, y), '#5cc77a', '800 22px'); });
        P.txt(c, '노란 테 = 짝 없는 전자 · 가운데 노란 점 둘 = 공유 전자쌍', W - 14, 24, 'rgba(255,216,77,.85)', '600 15px', 'right');
        // 해 볼 일
        const ok = []; if (made.has('HF')) ok.push(1); if (made.has('H3N')) ok.push(2); if (made.has('CH4')) ok.push(3);
        const st = [1, 2, 3].find((q) => !ok.includes(q)) || 0; window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
        const nt = st === 1 ? '① 수소와 플루오린으로 HF를 만들자' : st === 2 ? '② 질소 하나에 수소를 붙여 NH₃를 만들자' : st === 3 ? '③ 탄소 하나에 수소를 붙여 CH₄를 만들자' : '짝 없는 전자를 서로 내어 전자쌍을 공유한다';
        if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', st === 0); }
      },
      down(p) {
        const g = G(S.W, S.H), hit = atoms.slice().reverse().find((a) => Math.hypot(p.x - a.x, p.y - a.y) < g.R * 1.1);
        if (hit) { drag = { a: hit, dx: hit.x - p.x, dy: hit.y - p.y }; return; }
        const i = [0, 1, 2, 3].find((k) => { const [x, y] = g.tray(k); return Math.abs(p.x - x - g.R * 0.4) < g.R * 1.6 && Math.abs(p.y - y) < 34; });
        if (i != null) { const a = add(ORDER.slice().sort((q, r) => K[q].z - K[r].z)[i], p.x, p.y); if (a) drag = { a, dx: 0, dy: 0 }; }
      },
      move(p, e, held) { if (held && drag) { drag.a.x = p.x + drag.dx; drag.a.y = p.y + drag.dy; } },
      up(p) {
        if (!drag) return; const a = drag.a, g = G(S.W, S.H); drag = null;
        if (p.y > g.trayY - 38) { remove(a); say(`<b>${K[a.el].n}</b> 원자를 뺐다 — 걸려 있던 결합도 풀렸다`); return; }
        const b = nearest(a, g.R * 1.75); if (b) bond(a, b);
      },
      key(e) {
        const i = '1234'.indexOf(e.key), g = G(S.W, S.H);
        if (i >= 0) { add(ORDER.slice().sort((q, r) => K[q].z - K[r].z)[i], S.W * (0.3 + Math.random() * 0.4), (g.trayY - 46) * (0.3 + Math.random() * 0.4)); return true; }
        const last = atoms[atoms.length - 1];
        if (e.key === ' ' && last) { const b = nearest(last, Infinity); if (b) bond(last, b); return true; }
        if ((e.key === 'Delete' || e.key === 'Backspace') && last) { remove(last); return true; }
        if (e.key === '0') { clear(); return true; }
        return false;
      },
    });
    function clear() { atoms = []; bonds = new Map(); say('받침의 원자를 끌어 판 위에 놓고, 다른 원자에 바짝 붙여 보자'); }
    const reset = root.querySelector('.mk-reset'); if (reset) reset.addEventListener('click', () => { clear(); made.clear(); S.kick(); });
    clear();
    root._mk = {
      add: (el) => { const a = add(el, S.W / 2 || 300, S.H / 3 || 150); S.kick(); return a && a.id; },
      clear: () => { clear(); S.kick(); },
      build(f) { clear(); const [els, bs] = RECIPE[f], cx = S.W / 2 || 300, cy = S.H / 3 || 150; const as = els.map((e, i) => add(e, cx + Math.cos(i * 2) * 60, cy + Math.sin(i * 2) * 60)); bs.forEach(([x, y, o]) => { for (let r = 0; r < o; r++) bond(as[x], as[y]); }); S.kick(); return msg; },
      info: () => ({ atoms: atoms.map((a) => [a.el, free(a)]), bonds: [...bonds.entries()], made: [...made] }),
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.MolKit = { mount };
})();
