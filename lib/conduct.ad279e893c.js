/* 2-1 4차시 체험 «전기 전도성 실험»(교과서 72쪽 탐구: 이온 결합 물질과 공유 결합 물질의 성질 비교하기)의 가상 실험.
   6홈판 가~라: 증류수(액체)·설탕·황산 구리(Ⅱ)·염화 나트륨(고체). 아래 도구를 끌어 쓴다.
   측정기를 홈에 대면 전류가 흐를 때 불이 켜지고 소리 물결이 퍼진다. 스포이트를 홈에 놓으면 증류수가 떨어지고,
   유리 막대를 홈 안에서 빙빙 돌리면 고체가 녹는다(황산 구리는 물이 파래짐). 녹인 뒤 다시 대면 황산 구리·염화 나트륨만 켜진다.
   측정기는 홈을 옮길 때마다 «씻기» 그릇에 담갔다 옮긴다(안 씻으면 한 번 안내). 오른쪽 결과 표(.cd-table)를 채운다.
   돋보기 원은 측정기가 닿은 홈 속 입자(고체는 제자리, 수용액의 이온은 떠다님, 설탕은 분자 그대로).
   Conduct.mount(root) → { fit, setActive } · 시험용: root._cd.measure(i) · water(i) · stir(i) (i = 0~3, 가~라) */
(function () {
  'use strict';
  const WELLS = [
    { k: 'a', tag: '가', n: '증류수', solid: false, ion: false, col: '#f4f6f8' },
    { k: 'b', tag: '나', n: '설탕', solid: true, ion: false, col: '#fbfbf7' },
    { k: 'c', tag: '다', n: '황산 구리(Ⅱ)', solid: true, ion: true, col: '#2f7fd0' },
    { k: 'd', tag: '라', n: '염화 나트륨', solid: true, ion: true, col: '#f2f2ee' },
  ];
  const TAU = Math.PI * 2;
  function mount(root) {
    const stage = root.querySelector('.cd-stage'), now = root.querySelector('.cd-now'), out = root.querySelector('.cd-out'), tbl = root.querySelector('.cd-table');
    const P = window.Play;
    const st = WELLS.map((w) => ({ ...w, water: !w.solid, stir: 0, grains: Array.from({ length: 14 }, () => [Math.random() * 1.2 - 0.6, Math.random() * 1.2 - 0.6, 0.6 + Math.random() * 0.5]) }));
    const res = {};
    let t = 0, drag = null, tool = { probe: null, drop: null, rod: null }, dirty = -1, warned = false, foc = -1, sel = 0, msg = '', drops = [], lastA = null;
    const G = (W, H) => {
      const r = Math.min(W, H) * 0.1, px = W * 0.35, py = H * 0.37;
      return {
        r, well: (i) => [px + (i % 3 - 1) * r * 2.7, py + (Math.floor(i / 3) - 0.5) * r * 2.7],
        home: { probe: [W * 0.1, H * 0.92], drop: [W * 0.3, H * 0.9], rod: [W * 0.46, H * 0.92] }, wash: [W * 0.64, H * 0.86],
        lens: [W * 0.83, H * 0.33], lr: Math.min(W, H) * 0.19,
      };
    };
    const solved = (w) => w.water && w.stir >= 1;
    const conducts = (w) => w.ion && (w.solid ? solved(w) : false);
    function say(h) { if (h !== msg) { msg = h; out.innerHTML = h; } }
    function record(i) {
      const w = st[i];
      if (w.solid && w.water && !solved(w)) { say(`<b>${w.tag} ${w.n}</b>: 아직 덜 녹았다 — 유리 막대로 더 저어 다 녹이자`); return; }
      const key = `${w.k}-${!w.solid ? 'l' : w.water ? 'a' : 's'}`, on = conducts(w), v = on ? '○' : '×';
      res[key] = v;
      const td = tbl && tbl.querySelector(`td[data-c="${key}"]`); if (td) { td.textContent = v; td.className = on ? 'ok' : 'no'; }
      const state = !w.solid ? '액체' : w.water ? '수용액' : '고체';
      say(on ? `<b>${w.tag} ${w.n} ${state}</b>: 불이 켜지고 소리가 난다 — 전류가 <b>흐른다</b>` : `<b>${w.tag} ${w.n} ${state}</b>: 불이 꺼진 채 — 전류가 <b>흐르지 않는다</b>${w.ion && !w.water ? ' <small>이온이 제자리에 묶여 있다</small>' : !w.ion && w.water ? ' <small>녹아도 이온이 없다</small>' : ''}`);
      if (on) window.RxT.jolt(stage, 1);
    }
    function measure(i) {
      if (dirty >= 0 && dirty !== i && !warned) { warned = true; say('측정기를 씻지 않고 옮겼다 — 앞 시료가 묻으면 결과가 틀릴 수 있다. 다음부터 <b>씻기</b> 그릇에 담갔다 옮기자'); tool.probe = i; foc = i; dirty = i; setTimeout(() => record(i), 900); return; }
      tool.probe = i; foc = i; dirty = i; record(i);
    }
    function water(i) {
      const w = st[i]; foc = i;
      if (!w.solid) { say('가 홈은 처음부터 증류수다'); return; }
      if (w.water) { say(`<b>${w.tag}</b> 홈에는 이미 물이 있다 — 유리 막대로 젓자`); return; }
      w.water = true; for (let k = 0; k < 3; k++) drops.push({ i, y: -40 - k * 30, v: 0 });
      say(`<b>${w.tag} ${w.n}</b>에 증류수를 떨어뜨렸다 — 이제 유리 막대로 빙빙 저어 녹이자`);
    }
    function stirBy(i, a) {
      const w = st[i]; foc = i;
      if (!w.solid) return;
      if (!w.water) { say('고체만 있으면 저어도 녹지 않는다 — 스포이트로 물을 먼저 넣자'); return; }
      const was = w.stir; w.stir = Math.min(1, w.stir + a / (TAU * 3));
      if (was < 1 && w.stir >= 1) say(`<b>${w.tag} ${w.n}</b>이(가) 다 녹았다${w.k === 'c' ? ' — 물이 <b>파랗게</b> 변했다' : ''}. 측정기를 대 보자`);
    }
    function steps() {
      const ok = []; if (['a-l', 'b-s', 'c-s', 'd-s'].every((k) => res[k])) ok.push(1); if (st.slice(1).every(solved)) ok.push(2); if (['b-a', 'c-a', 'd-a'].every((k) => res[k])) ok.push(3);
      const s = [1, 2, 3].find((k) => !ok.includes(k)) || 0; window.L1.steps(root, s, ok); window.L1.done(root, s === 0);
      const nt = s === 1 ? '① 측정기를 끌어 가~라 홈에 하나씩 대 보자' : s === 2 ? '② 스포이트로 물을 넣고 유리 막대로 저어 녹이자' : s === 3 ? '③ 녹인 수용액에 측정기를 다시 대 보자' : '수용액에서 전류가 흐르는 것은 이온 결합 물질';
      if (now.textContent !== nt) { now.textContent = nt; now.classList.toggle('done', s === 0); }
    }
    const wellAt = (g, x, y) => st.findIndex((w, i) => { const [wx, wy] = g.well(i); return Math.hypot(x - wx, y - wy) < g.r * 1.15; });
    function toolPos(g, k) { if (drag && drag.k === k) return [drag.x, drag.y]; if (k === 'probe' && tool.probe != null) { const [x, y] = g.well(tool.probe); return [x, y + g.r * 0.3]; } return g.home[k]; }
    function drawProbe(c, x, y, lit) {
      c.strokeStyle = '#8a929c'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - 9, y); c.lineTo(x - 9, y - 40); c.moveTo(x + 9, y); c.lineTo(x + 9, y - 40); c.stroke();
      c.fillStyle = '#e9ecef'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.roundRect(x - 26, y - 112, 52, 74, 8); c.fill(); c.stroke();
      if (lit) { P.glow(c, x, y - 92, 60, 'rgba(255,90,70,.9)'); for (let k = 0; k < 3; k++) { const r = 30 + ((t * 60 + k * 22) % 66); c.strokeStyle = `rgba(255,200,80,${1 - r / 96})`; c.lineWidth = 3; c.beginPath(); c.arc(x, y - 75, r, -0.6, 0.6); c.stroke(); c.beginPath(); c.arc(x, y - 75, r, Math.PI - 0.6, Math.PI + 0.6); c.stroke(); } }
      c.fillStyle = lit ? '#ff5a46' : '#7a2a24'; c.beginPath(); c.arc(x, y - 92, 9, 0, TAU); c.fill(); c.stroke();
      c.fillStyle = '#5a6270'; for (let k = 0; k < 3; k++) c.fillRect(x - 12, y - 70 + k * 8, 24, 3);
    }
    function drawLens(c, g) {
      const [lx, ly] = g.lens, R = g.lr;
      c.save(); c.beginPath(); c.arc(lx, ly, R, 0, TAU); c.fillStyle = '#eaf3fb'; c.fill(); c.clip();
      const w = foc >= 0 ? st[foc] : null;
      if (!w) P.txt(c, '측정기가 닿은 홈 속을', lx, ly - 6, '#4a5468', '700 16px'), P.txt(c, '여기서 크게 본다', lx, ly + 18, '#4a5468', '700 16px');
      else {
        const sol = solved(w), liquid = !w.solid || w.water;
        if (liquid) { c.fillStyle = w.k === 'c' ? `rgba(47,127,208,${0.12 + 0.3 * w.stir})` : 'rgba(120,180,230,.18)'; c.fillRect(lx - R, ly - R, R * 2, R * 2); for (let k = 0; k < 14; k++) { const a = k * 2.4 + t * 0.7, rr = R * (0.2 + (k % 5) * 0.15); P.txt(c, '·', lx + Math.cos(a) * rr, ly + Math.sin(a * 1.3) * rr, 'rgba(60,110,170,.6)', '800 26px'); } }
        if (!w.solid) P.txt(c, '물 분자뿐 — 이온 없음', lx, ly + R * 0.75, '#1d2433', '700 15px');
        else if (!sol) { // 고체: 제자리에서 떨기
          for (let r = -2; r <= 2; r++) for (let q = -2; q <= 2; q++) { const x = lx + q * R * 0.22 + Math.sin(t * 9 + r + q) * 1.5, y = ly + r * R * 0.22; if (w.ion) ion(c, x, y, (r + q) & 1, w.k); else mol(c, x, y); }
          P.txt(c, w.ion ? '이온이 제자리에 묶여 있다' : '분자가 빽빽이 모여 있다', lx, ly + R * 0.86, '#1d2433', '700 15px');
        } else {
          for (let k = 0; k < 16; k++) { const ph = k * 1.7, x = lx + Math.sin(t * (0.5 + (k % 4) * 0.13) + ph) * R * 0.7, y = ly + Math.cos(t * (0.4 + (k % 3) * 0.17) + ph * 1.3) * R * 0.62; if (w.ion) ion(c, x, y, k & 1, w.k); else mol(c, x, y); }
          P.txt(c, w.ion ? '이온이 자유롭게 떠다닌다' : '분자 그대로 떠다닌다', lx, ly + R * 0.86, '#1d2433', '700 15px');
        }
      }
      c.restore(); c.strokeStyle = '#1d2433'; c.lineWidth = 5; c.beginPath(); c.arc(lx, ly, R, 0, TAU); c.stroke();
      c.lineWidth = 9; c.beginPath(); c.moveTo(lx + R * 0.72, ly + R * 0.72); c.lineTo(lx + R * 1.05, ly + R * 1.05); c.stroke();
      P.txt(c, w ? `돋보기 · ${w.tag} ${w.n}` : '돋보기', lx, ly - R - 10, '#1d2433', '800 17px');
    }
    function ion(c, x, y, neg, k) {
      const pos = !neg; c.fillStyle = pos ? (k === 'c' ? '#2f7fd0' : '#9b6ad6') : (k === 'c' ? '#d0a32f' : '#5cc77a'); c.beginPath(); c.arc(x, y, pos ? 8 : 11, 0, TAU); c.fill();
      P.txt(c, pos ? '+' : '−', x, y + 5, '#fff', '800 14px');
    }
    function mol(c, x, y) { c.fillStyle = '#c9cdd3'; c.strokeStyle = '#6a7380'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(x, y, 13, 8, 0.4, 0, TAU); c.fill(); c.stroke(); }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        t += dt; const g = G(W, H);
        c.fillStyle = '#efe7d6'; c.fillRect(0, 0, W, H); c.fillStyle = '#d7c7a6'; c.fillRect(0, H * 0.74, W, H * 0.26);
        // 6홈판
        const [x0, y0] = g.well(0), [x5, y5] = g.well(5);
        c.fillStyle = '#ffffff'; c.strokeStyle = '#1d2433'; c.lineWidth = 2.5; c.beginPath(); c.roundRect(x0 - g.r * 1.45, y0 - g.r * 1.45, x5 - x0 + g.r * 2.9, y5 - y0 + g.r * 2.9, 18); c.fill(); c.stroke();
        for (let i = 0; i < 6; i++) {
          const [x, y] = g.well(i), w = st[i];
          c.fillStyle = '#e4e8ec'; c.beginPath(); c.arc(x, y, g.r, 0, TAU); c.fill(); c.strokeStyle = i === sel && w ? '#e0a400' : '#9aa3ad'; c.lineWidth = i === sel && w ? 4 : 2; c.stroke();
          if (!w) continue;
          if (w.water) { c.fillStyle = w.k === 'c' ? `rgba(47,127,208,${0.15 + 0.6 * w.stir})` : 'rgba(150,200,240,.45)'; c.beginPath(); c.arc(x, y, g.r * 0.9, 0, TAU); c.fill(); }
          if (w.solid) w.grains.forEach(([gx, gy, s], k) => { const d = w.stir, a = t * 0.8 + k; const sx = x + (gx + Math.cos(a) * d * 0.5) * g.r * (1 + d * 0.3), sy = y + (gy + Math.sin(a) * d * 0.5) * g.r * (1 + d * 0.3), sz = g.r * 0.17 * s * (1 - d); if (sz < 0.5) return; c.fillStyle = w.col; c.strokeStyle = 'rgba(29,36,51,.45)'; c.lineWidth = 1; c.fillRect(sx - sz, sy - sz, sz * 2, sz * 2); c.strokeRect(sx - sz, sy - sz, sz * 2, sz * 2); });
          P.txt(c, `${w.tag} ${w.n}`, x, y - g.r - 8, '#1d2433', '800 16px');
          P.txt(c, !w.solid ? '액체' : solved(w) ? '수용액' : w.water ? '물 + 고체' : '고체', x, y + g.r + 20, '#4a5468', '600 14px');
        }
        // 떨어지는 물방울
        drops.forEach((d) => { d.v += 900 * dt; d.y += d.v * dt; const [x, y] = g.well(d.i); if (d.y < 0) { c.fillStyle = '#5aa9f0'; c.beginPath(); c.arc(x, y + d.y, 5, 0, TAU); c.fill(); } }); drops = drops.filter((d) => d.y < 0);
        // 씻기 그릇
        const [bx, by] = g.wash; c.fillStyle = 'rgba(150,200,240,.6)'; c.strokeStyle = '#1d2433'; c.lineWidth = 2.5; c.beginPath(); c.ellipse(bx, by, 70, 26, 0, 0, TAU); c.fill(); c.stroke();
        P.txt(c, '씻기(증류수)', bx, by + 48, '#1d2433', '700 16px');
        // 도구
        const [rx, ry] = toolPos(g, 'rod'); c.strokeStyle = 'rgba(200,225,240,.95)'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(rx, ry); c.lineTo(rx + 26, ry - 130); c.stroke(); c.strokeStyle = 'rgba(29,36,51,.5)'; c.lineWidth = 1.5; c.stroke(); c.lineCap = 'butt';
        const [dx, dy] = toolPos(g, 'drop'); c.fillStyle = 'rgba(200,230,250,.9)'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.moveTo(dx, dy); c.lineTo(dx - 6, dy - 60); c.lineTo(dx + 6, dy - 60); c.closePath(); c.fill(); c.stroke(); c.fillStyle = '#d9483b'; c.beginPath(); c.roundRect(dx - 10, dy - 92, 20, 34, 9); c.fill(); c.stroke();
        const [qx, qy] = toolPos(g, 'probe'), pw = tool.probe != null && !(drag && drag.k === 'probe') ? st[tool.probe] : null;
        drawProbe(c, qx, qy, !!pw && conducts(pw));
        if (!drag) { P.txt(c, '측정기', g.home.probe[0], H - 6, '#1d2433', '700 15px'); P.txt(c, '스포이트', g.home.drop[0], H - 6, '#1d2433', '700 15px'); P.txt(c, '유리 막대', g.home.rod[0] + 14, H - 6, '#1d2433', '700 15px'); }
        drawLens(c, g);
        steps();
      },
      down(p) {
        const g = G(S.W, S.H);
        const hit = ['probe', 'drop', 'rod'].find((k) => { const [x, y] = toolPos(g, k); const cy = k === 'probe' ? y - 70 : k === 'drop' ? y - 50 : y - 60; return Math.abs(p.x - (k === 'rod' ? x + 13 : x)) < 34 && Math.abs(p.y - cy) < 72; });
        if (!hit) { const i = wellAt(g, p.x, p.y); if (i >= 0 && st[i]) { sel = i; foc = i; } return; }
        drag = { k: hit, x: p.x, y: p.y }; if (hit === 'probe') tool.probe = null; lastA = null;
      },
      move(p, e, held) {
        if (!held || !drag) return; drag.x = p.x; drag.y = p.y;
        if (drag.k === 'rod') { const g = G(S.W, S.H), i = wellAt(g, p.x, p.y); if (i >= 0 && st[i]) { const [wx, wy] = g.well(i), a = Math.atan2(p.y - wy, p.x - wx); if (lastA && lastA.i === i) { let d = a - lastA.a; if (d > Math.PI) d -= TAU; if (d < -Math.PI) d += TAU; stirBy(i, Math.abs(d)); } lastA = { i, a }; } else lastA = null; }
      },
      up(p) {
        if (!drag) return; const g = G(S.W, S.H), k = drag.k, i = wellAt(g, p.x, p.y); drag = null;
        if (k === 'probe') { const [bx, by] = g.wash; if (Math.hypot(p.x - bx, p.y - by) < 80) { dirty = -1; say('측정기를 증류수로 씻었다 — 이제 다른 홈에 대자'); } else if (i >= 0 && st[i]) { sel = i; measure(i); } }
        else if (k === 'drop' && i >= 0 && st[i]) { sel = i; water(i); }
      },
      key(e) {
        const n = '1234'.indexOf(e.key); if (n >= 0) { sel = n; foc = n; return true; }
        const k = e.key.toLowerCase();
        if (k === 'm') { measure(sel); return true; } if (k === 'w') { water(sel); return true; } if (k === 's') { stirBy(sel, TAU * 3); return true; } if (k === 'c') { dirty = -1; tool.probe = null; say('측정기를 증류수로 씻었다'); return true; }
        return false;
      },
    });
    root.querySelector('.cd-reset').addEventListener('click', () => {
      st.forEach((w) => { w.water = !w.solid; w.stir = 0; }); Object.keys(res).forEach((k) => delete res[k]);
      if (tbl) tbl.querySelectorAll('td[data-c]').forEach((td) => { td.textContent = ''; td.className = ''; });
      tool.probe = null; dirty = -1; warned = false; foc = -1; sel = 0; say(''); S.kick();
    });
    root._cd = { measure: (i) => { dirty = -1; measure(i); S.kick(); }, water: (i) => { water(i); S.kick(); }, stir: (i) => { stirBy(i, TAU * 3); S.kick(); }, res };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Conduct = { mount };
})();
