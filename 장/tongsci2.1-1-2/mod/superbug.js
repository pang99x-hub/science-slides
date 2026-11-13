/* 1차시 5장(교과서 21쪽 본문): 항생제 내성 세균의 자연선택. 페트리 접시를 육각 격자 자리로 나누고 자리마다 비었음/내성 없음/내성 있음.
   누르고 있는 동안 그 자리에서 항생제가 둥글게 번진다(반지름이 누른 시간만큼 커짐). 농도가 높은 곳의 내성 없는 세균은 죽고, 내성 세균은 산다.
   손을 떼면 항생제는 차츰 옅어지고, 세균은 옆 빈자리로 분열해 퍼진다(자식은 부모 성질 그대로). 수·속도는 이해를 돕기 위한 모형. */
(function () {
  'use strict';
  const K = window.EvKit, { clamp } = K;
  const SP = 15;

  function mount(root) {
    const cv = root.querySelector('.ev-sb-cv'), ch = root.querySelector('.ev-sb-chart');
    const now = root.querySelector('.ev-sb-now'), msg = root.querySelector('.ev-sb-msg'), doseT = root.querySelector('.ev-sb-dose b'), pctT = root.querySelector('.ev-sb-pct');
    let g = K.fit(cv), cg = K.fit(ch);
    let cx = 0, cy = 0, R = 0, sites = [], hist = [], doses = 0, holding = null, holdT = 0, tm = 0, sample = 0, phase = 0;
    const r = Math.random;
    function build() {
      cx = g.w / 2; cy = g.h / 2 + 4; R = Math.min(g.w, g.h) / 2 - 26;
      const old = sites; sites = [];
      const dy = SP * 0.866;
      for (let j = -Math.ceil(R / dy); j <= Math.ceil(R / dy); j++) for (let i = -Math.ceil(R / SP) - 1; i <= Math.ceil(R / SP) + 1; i++) {
        const x = cx + i * SP + (j & 1 ? SP / 2 : 0), y = cy + j * dy;
        if (Math.hypot(x - cx, y - cy) > R - 10) continue;
        sites.push({ x, y, s: 0, c: 0, die: 0, a: r() * 3.14, nb: null });
      }
      const key = (s) => Math.round(s.x / 2) + ',' + Math.round(s.y / 2);
      const map = new Map(); sites.forEach((s, k) => map.set(key(s), k));
      sites.forEach((s) => {
        s.nb = [];
        sites.forEach((t, k) => { if (t !== s && Math.abs(t.x - s.x) < SP * 1.2 && Math.abs(t.y - s.y) < SP * 1.2 && Math.hypot(t.x - s.x, t.y - s.y) < SP * 1.15) s.nb.push(k); });
      });
      void map; void old;
    }
    function reset() {
      sites.forEach((s) => { s.s = r() < 0.9 ? 1 : 0; s.c = 0; s.die = 0; });
      // 쓰기 전부터 있던 내성 세균 몇 개
      for (let k = 0; k < 5 && sites.length; k++) { const s = sites[Math.floor(r() * sites.length)]; s.s = 2; }
      hist = []; doses = 0; doseT.textContent = '0'; phase = 0;
      now.textContent = '① 접시 한가운데를 꾹 누르고 있어 보자'; now.classList.remove('done');
      msg.innerHTML = '처음 접시에는 내성 세균(주황)이 아주 조금 섞여 있다. 항생제를 쓰기 <b>전부터</b> 있었다.';
      record(); chart();
    }
    const frac = () => { let n = 0, m = 0; sites.forEach((s) => { if (s.s === 1) n++; else if (s.s === 2) m++; }); return { n, m, f: m / Math.max(1, n + m) }; };
    function record() { const { f } = frac(); hist.push(f); if (hist.length > 240) hist = hist.filter((_, i) => i % 2 === 0); pctT.textContent = Math.round(f * 100) + ' %'; }
    function chart() {
      const { ctx: c, w, h } = cg; c.clearRect(0, 0, w, h);
      c.strokeStyle = '#c3cecd'; c.lineWidth = 1; c.font = '600 13px "IBM Plex Sans KR", sans-serif'; c.fillStyle = '#7b8597'; c.textAlign = 'left';
      [0, 0.5, 1].forEach((v) => { const y = h - 8 - (h - 20) * v; c.beginPath(); c.moveTo(34, y); c.lineTo(w, y); c.stroke(); c.fillText(Math.round(v * 100) + '%', 0, y + 4); });
      if (hist.length < 2) return;
      c.strokeStyle = '#e07a1f'; c.lineWidth = 4; c.lineJoin = 'round'; c.beginPath();
      hist.forEach((v, i) => { const x = 34 + (w - 40) * i / Math.max(60, hist.length - 1), y = h - 8 - (h - 20) * v; if (i) c.lineTo(x, y); else c.moveTo(x, y); }); c.stroke();
    }
    function step(dt) {
      tm += dt;
      if (holding) {
        holdT += dt; const rad = Math.min(R + 20, 30 + holdT * 110);
        sites.forEach((s) => { const d = Math.hypot(s.x - holding.x, s.y - holding.y); if (d < rad) s.c = Math.max(s.c, 1 - 0.35 * d / rad); });
      }
      let killed = 0;
      sites.forEach((s) => {
        if (!holding) s.c = Math.max(0, s.c - dt * 0.11);
        if (s.die > 0) { s.die -= dt * 2; if (s.die <= 0) { s.die = 0; s.s = 0; } return; }
        if (s.s === 1 && s.c > 0.45 && r() < dt * 4) { s.die = 1; killed++; }
        if (s.s && r() < dt * 0.5) {
          if (s.s === 1 && s.c > 0.3) return;
          const e = s.nb.filter((k) => sites[k].s === 0 && sites[k].die === 0 && (s.s === 2 || sites[k].c < 0.3));
          if (e.length) { const t = sites[e[Math.floor(r() * e.length)]]; t.s = s.s; t.a = s.a + (r() - 0.5); }
        }
      });
      sample += dt; if (sample > 0.4) { sample = 0; record(); chart(); talk(); }
      draw();
    }
    function talk() {
      const { n, m, f } = frac();
      if (doses === 0) return;
      if (f > 0.9) { now.textContent = '항생제를 되풀이해 쓰자 접시가 내성 세균으로 바뀌었다'; now.classList.add('done'); msg.innerHTML = `내성 세균 비율 <b>${Math.round(f * 100)} %</b>. 항생제가 있는 환경에서 내성 세균이 골라져 남으며(<b>자연선택</b>) 집단 전체가 항생제 속에 맞게 바뀌었다.`; return; }
      if (holding) return;
      if (phase === 1 && n + m < sites.length * 0.75) msg.innerHTML = `살아남은 세균 가운데 내성 세균이 늘었다(지금 <b>${Math.round(f * 100)} %</b>). 빈자리를 채우는 것은 주로 누구일까?`;
      else if (phase === 1) { msg.innerHTML = `빈자리가 다시 찼다. 내성 세균 비율 <b>${Math.round(f * 100)} %</b> — 처음보다 늘었다. 다시 눌러 보자.`; now.textContent = '② 한 번 더 항생제를 써 보자'; }
    }
    function draw() {
      const c = g.ctx; c.fillStyle = '#2b3242'; c.fillRect(0, 0, g.w, g.h);
      if (R <= 4) return;
      c.fillStyle = '#d9d2b6'; c.beginPath(); c.arc(cx, cy, R + 12, 0, 7); c.fill();
      c.fillStyle = '#efe6c2'; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.fill();
      // 항생제가 번진 곳
      sites.forEach((s) => { if (s.c > 0.05) { c.fillStyle = `rgba(150,110,220,${(s.c * 0.32).toFixed(3)})`; c.fillRect(s.x - SP / 2, s.y - SP / 2, SP, SP * 0.9); } });
      c.lineCap = 'round';
      const rod = (cond, col, w) => { c.strokeStyle = col; c.lineWidth = w; c.beginPath(); sites.forEach((s) => { if (!cond(s)) return; const dx = Math.cos(s.a) * 4.5, dy = Math.sin(s.a) * 4.5; c.moveTo(s.x - dx, s.y - dy); c.lineTo(s.x + dx, s.y + dy); }); c.stroke(); };
      rod((s) => s.s === 1 && !s.die, '#1f6f63', 9); rod((s) => s.s === 1 && !s.die, '#3fb2a0', 6);
      rod((s) => s.s === 2, '#8a3f0a', 9); rod((s) => s.s === 2, '#f08a2c', 6);
      c.globalAlpha = 0.5; rod((s) => s.die > 0, '#9aa3ae', 6); c.globalAlpha = 1;
      // 유리 테두리와 스포이트
      c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = 4; c.beginPath(); c.arc(cx, cy, R + 12, 0, 7); c.stroke();
      if (holding) {
        const x = holding.x, y = holding.y - 18;
        c.fillStyle = 'rgba(150,110,220,.9)'; c.strokeStyle = '#1d2433'; c.lineWidth = 3;
        c.beginPath(); c.roundRect(x - 9, y - 120, 18, 92, 6); c.fill(); c.stroke();
        c.fillStyle = '#e04c4c'; c.beginPath(); c.roundRect(x - 13, y - 150, 26, 34, 10); c.fill(); c.stroke();
        c.fillStyle = '#fff'; c.beginPath(); c.moveTo(x - 6, y - 28); c.lineTo(x + 6, y - 28); c.lineTo(x, y - 4); c.closePath(); c.fill(); c.stroke();
        const fy = y + ((tm * 260) % 30); c.fillStyle = 'rgba(150,110,220,.95)'; c.beginPath(); c.arc(x, fy, 5, 0, 7); c.fill();
      }
    }
    build(); reset(); draw();
    K.hold(cv, {
      down(p) { if (Math.hypot(p.x - cx, p.y - cy) > R) return false; holding = p; holdT = 0; doses++; doseT.textContent = String(doses); phase = 1; msg.innerHTML = '항생제가 번지는 곳의 청록색(내성 없는) 세균이 죽는다. 주황색은?'; return true; },
      move(p) { if (holding) { holding = p; } },
      up() { holding = null; },
    }, (e) => K.cvPt(cv, e));
    root.querySelector('.ev-sb-reset').addEventListener('click', () => { reset(); draw(); });
    const tk = K.ticker(step);
    root._sb = { dose: (x, y, t) => { holding = { x: cx + x, y: cy + y }; holdT = t; doses++; doseT.textContent = String(doses); phase = 1; step(0.016); holding = null; }, run: (sec) => { for (let t = 0; t < sec; t += 0.05) step(0.05); }, frac };
    return {
      setActive(on) { if (on) { g = K.fit(cv); cg = K.fit(ch); if (Math.abs(g.w / 2 - cx) > 2 || Math.abs(g.h / 2 + 4 - cy) > 2) { build(); reset(); } chart(); draw(); if (!K.reduce) tk.start(); } else tk.stop(); },
      fit() { g = K.fit(cv); cg = K.fit(ch); build(); reset(); chart(); draw(); },
    };
  }
  window.EvSuperbug = { mount };
})();
