/* 2차시 2장(교과서 22~23쪽 탐구 과정 1~6): 노란 도화지 위 초콜릿으로 하는 자연선택 모의실험.
   한 회: 눈을 감았다 뜨며 가장 먼저 보인 초콜릿을 톡 집기 ×5(학생) → 다른 포식자 둘(컴퓨터)이 5개씩 → 남은 개수 세기 → 같은 색을 그 수만큼 더하기(×2).
   2회가 끝나면 초록 3개를 눌러 노랑으로(돌연변이, 초록이 모자라면 다른 색). 5회까지. 컴퓨터 포식자는 도화지와 색차(Lab)가 큰 것을 더 잘 본다(가중치 0.05 + (색차/100)²).
   교과서 23쪽 예시 결과를 표에 함께 띄울 수 있다. */
(function () {
  'use strict';
  const K = window.EvKit, C = window.EvChoco, { clamp } = K;
  const ORDER = ['red', 'yellow', 'green', 'blue'];
  // 교과서 23쪽 예시 결과(남은 개수): 빨강·노랑·초록·파랑
  const BOOK = [[6, null, 5, 4], [7, null, 5, 3], [6, 3, 3, 3], [7, 6, 1, 1], [2, 11, 1, 1]];
  const RAD = 17;

  function mount(root) {
    const cv = root.querySelector('.ev-hu-cv'), now = root.querySelector('.ev-hu-now'), roundT = root.querySelector('.ev-hu-round');
    const mine = root.querySelector('.ev-hu-mine'), msg = root.querySelector('.ev-hu-msg'), tbody = root.querySelector('.ev-tbl tbody');
    const bookB = root.querySelector('.ev-hu-book'), autoB = root.querySelector('.ev-hu-auto');
    let g = K.fit(cv), ch = [], round = 1, phase = 'ready', lid = 1, lidTo = 1, myN = 0, others = 0, timer = 0, glove = null, mut = 0, fastRound = false, book = false;
    const res = [];
    const P = () => ({ x: 22, y: 22, w: g.w - 44, h: g.h - 44 });
    const toPx = (q) => { const p = P(); return { x: p.x + RAD + q.x * (p.w - 2 * RAD), y: p.y + RAD + q.y * (p.h - 2 * RAD) }; };
    function freeSpot(near) {
      const p = P(), sx = 2 * RAD / (p.w - 2 * RAD), sy = 2 * RAD / (p.h - 2 * RAD);
      for (let t = 0; t < 60; t++) {
        const x = near && t < 30 ? clamp(near.x + (Math.random() - 0.5) * 0.18, 0, 1) : Math.random(), y = near && t < 30 ? clamp(near.y + (Math.random() - 0.5) * 0.24, 0, 1) : Math.random();
        if (ch.every((o) => !o.alive || Math.hypot((o.x - x) / sx, (o.y - y) / sy) > 1.05)) return { x, y };
      }
      return { x: Math.random(), y: Math.random() };
    }
    function reset() {
      ch = []; round = 1; phase = 'ready'; lid = 1; lidTo = 1; myN = 0; others = 0; glove = null; mut = 0; res.length = 0; fastRound = false;
      ['red', 'green', 'blue'].forEach((c) => { for (let i = 0; i < 10; i++) { const s = freeSpot(); ch.push({ c, x: s.x, y: s.y, alive: true, pop: 1 }); } });
      mine.innerHTML = ''; roundT.textContent = '1회'; table();
      now.textContent = '① 화면을 누르면 눈을 감았다 뜬다'; now.classList.remove('done');
      msg.innerHTML = '처음: 빨강·초록·파랑 10개씩. 포식자 셋이 5개씩 15개를 집는다(나 하나 + 컴퓨터 둘).';
    }
    const live = () => ch.filter((o) => o.alive);
    const count = () => { const n = { red: 0, yellow: 0, green: 0, blue: 0 }; live().forEach((o) => n[o.c]++); return n; };
    const weight = (o) => 0.05 + Math.pow(C.vis(C.COL[o.c], C.PAPER) / 100, 2);
    function table() {
      tbody.innerHTML = '';
      for (let r = 0; r < 5; r++) {
        const tr = document.createElement('tr'), d = res[r];
        tr.innerHTML = `<th>${r + 1}회</th>` + ORDER.map((c, i) => {
          const bk = book ? `<em>${BOOK[r][i] == null ? '–' : BOOK[r][i] + '→' + BOOK[r][i] * 2}</em>` : '';
          if (!d) return `<td>${bk}</td>`;
          const v = d.rem[c]; const show = v == null ? '–' : `<b>${v}</b><small>→${d.x2 ? d.x2[c] : '?'}</small>`;
          return `<td>${show}${bk}</td>`;
        }).join('') + `<td class="ev-most">${d ? most(d.rem) : ''}${book ? `<em>${most(Object.fromEntries(ORDER.map((c, i) => [c, BOOK[r][i]])))}</em>` : ''}</td>`;
        if (r === round - 1 && phase !== 'done') tr.className = 'cur';
        tbody.appendChild(tr);
      }
    }
    function most(rem) { const m = Math.max(...ORDER.map((c) => rem[c] || 0)); return ORDER.filter((c) => (rem[c] || 0) === m).map((c) => C.NAME[c]).join('·'); }
    function blink() { phase = 'blink'; lidTo = 0; timer = 0; }
    function pick(o, who) {
      const p = toPx(o);
      glove = { x: p.x, y: p.y, t: 0, o, who };
      o.alive = false; o.taken = 1;
      if (who === 'me') { myN++; const i = document.createElement('i'); i.className = 'ev-dot'; i.dataset.c = o.c; mine.appendChild(i); }
    }
    function after() {
      // 한 번 집은 뒤
      if (phase === 'pick' || phase === 'blink') {
        if (myN < 5) { if (fastRound) autoPick(); else blink(); return; }
        phase = 'others'; others = 0; timer = 0.3; now.textContent = '다른 포식자 두 명이 5개씩 집는다'; return;
      }
    }
    function autoPick() { const L = live(); pick(L[K.pickW(L.map(weight))], 'me'); phase = 'pick'; }
    function tally() {
      const n = count(); const rem = {}; ORDER.forEach((c) => { rem[c] = round <= 2 && c === 'yellow' ? null : n[c]; });
      res[round - 1] = { rem }; table();
      msg.innerHTML = `${round}회 남은 개수 — ` + ORDER.filter((c) => rem[c] != null).map((c) => `${C.NAME[c]} <b>${rem[c]}</b>`).join(', ') + '. 이제 같은 색을 남은 수만큼 더한다.';
      phase = 'tally'; timer = 0.9;
    }
    function double() {
      live().forEach((o) => { const s = freeSpot(o); ch.push({ c: o.c, x: s.x, y: s.y, alive: true, pop: 0 }); });
      ch = ch.filter((o) => o.alive);
      const n = count(), d = res[round - 1]; d.x2 = {}; ORDER.forEach((c) => { d.x2[c] = d.rem[c] == null ? null : n[c]; }); table();
      if (round === 2) {
        phase = 'mutate'; mut = 0;
        const g3 = count().green >= 3;
        now.textContent = g3 ? '④ 초록 초콜릿 3개를 눌러 노란색으로 바꾸자(과정 5)' : '④ 초록이 모자라니 다른 색 3개를 눌러 노란색으로 바꾸자';
        msg.innerHTML = '과정 5: 2회가 끝난 뒤 초록 3개를 노랑 3개로 바꾼다. 집단에 없던 <b>새 형질</b>이 나타나는 장면이다.';
        if (fastRound) setTimeout(autoMut, 300);
      } else if (round === 5) {
        phase = 'done'; table(); const m = most(res[4].rem);
        now.textContent = `5회 끝! 가장 많이 남은 색: ${m}`; now.classList.add('done');
        msg.innerHTML = `5회 뒤 30개 가운데 노랑 <b>${count().yellow}</b>개. 노란 도화지에서 눈에 덜 띄는 노랑이 회를 거듭하며 늘었다.`;
      } else { round++; roundT.textContent = round + '회'; myN = 0; mine.innerHTML = ''; phase = 'ready'; table(); now.textContent = `${round}회: 화면을 눌러 다시 눈을 감았다 뜨자`; if (fastRound) { fastRound = false; } }
    }
    function mutateAt(o) {
      const greenLeft = count().green;
      if (o.c === 'yellow' || (greenLeft > 0 && o.c !== 'green')) return false;
      o.c = 'yellow'; o.pop = 0; mut++;
      if (mut >= 3) {
        round = 3; roundT.textContent = '3회'; myN = 0; mine.innerHTML = ''; phase = 'ready'; table();
        now.textContent = '3회: 화면을 눌러 눈을 감았다 뜨자(과정 6)'; msg.innerHTML = `이제 노랑 ${count().yellow}개, 초록 ${count().green}개. 3~5회를 이어 하자.`; fastRound = false;
      }
      return true;
    }
    function autoMut() { while (phase === 'mutate') { const L = live().filter((o) => (count().green > 0 ? o.c === 'green' : o.c !== 'yellow')); if (!L.length) break; mutateAt(L[Math.floor(Math.random() * L.length)]); } }
    function step(dt) {
      lid += clamp(lidTo - lid, -dt * 5, dt * 5);
      if (phase === 'blink') {
        if (lid <= 0.01 && lidTo === 0) { timer += dt; if (timer > 0.35) lidTo = 1; }
        if (lidTo === 1 && lid >= 0.99) { phase = 'pick'; now.textContent = `② 처음 눈에 띈 초콜릿을 톡! (${myN + 1}/5)`; }
      }
      if (glove) { glove.t += dt * (glove.who === 'me' ? 3 : 5); if (glove.t >= 2) { glove = null; if (phase === 'pick') after(); } }
      if (phase === 'others' && !glove) {
        timer -= dt;
        if (timer <= 0) {
          if (others < 10) { const L = live(); pick(L[K.pickW(L.map(weight))], 'pc'); others++; timer = 0.12; }
          else tally();
        }
      }
      if (phase === 'tally') { timer -= dt; if (timer <= 0) double(); }
      ch.forEach((o) => { if (o.pop < 1) o.pop = Math.min(1, o.pop + dt * 2.5); });
      draw();
    }
    function draw() {
      const c = g.ctx; C.table(c, g.w, g.h); const p = P(); C.paper(c, p.x, p.y, p.w, p.h, C.PAPER);
      ch.forEach((o) => { if (!o.alive && !(glove && glove.o === o)) return; const q = toPx(o); let x = q.x, y = q.y;
        if (glove && glove.o === o && glove.t > 1) { const u = glove.t - 1; y += u * 240; x += (glove.who === 'me' ? 0 : (q.x < g.w / 2 ? -1 : 1) * u * 200); }
        C.choco(c, x, y, RAD * (0.3 + 0.7 * o.pop) * (phase === 'mutate' && o.c === 'green' ? 1 + 0.08 * Math.sin(Date.now() / 150) : 1), C.COL[o.c]); });
      if (glove) {
        const q = { x: glove.x, y: glove.y }, u = glove.t;
        const gy = u < 1 ? K.lerp(g.h + 140, q.y + 50, u) : q.y + 50 + (u - 1) * 240;
        const gx = glove.who === 'me' ? q.x : q.x + (u < 1 ? (1 - u) : (u - 1)) * (q.x < g.w / 2 ? -200 : 200);
        C.glove(c, gx, gy, glove.who === 'me' ? 0 : (q.x < g.w / 2 ? 0.4 : -0.4), u < 1 ? 1 - u : 0);
      }
      if (lid < 0.999) {
        const half = g.h / 2 * (1 - lid);
        c.fillStyle = '#2a1e1a';
        c.beginPath(); c.moveTo(0, 0); c.lineTo(g.w, 0); c.lineTo(g.w, half); c.quadraticCurveTo(g.w / 2, half + 60 * (1 - lid), 0, half); c.closePath(); c.fill();
        c.beginPath(); c.moveTo(0, g.h); c.lineTo(g.w, g.h); c.lineTo(g.w, g.h - half); c.quadraticCurveTo(g.w / 2, g.h - half - 60 * (1 - lid), 0, g.h - half); c.closePath(); c.fill();
        if (lid < 0.3) { c.fillStyle = '#f5ead7'; c.font = '400 54px "Nanum Pen Script", cursive'; c.textAlign = 'center'; c.fillText('눈을 감았다가…', g.w / 2, g.h / 2 + 16); }
      }
    }
    reset();
    K.hold(cv, {
      down(p) {
        if (phase === 'ready') { blink(); return true; }
        if (phase === 'pick' && !glove) {
          const o = live().map((q) => ({ q, d: Math.hypot(toPx(q).x - p.x, toPx(q).y - p.y) })).filter((a) => a.d < RAD * 1.6).sort((a, b) => a.d - b.d)[0];
          if (o) pick(o.q, 'me'); return true;
        }
        if (phase === 'mutate') { const o = live().map((q) => ({ q, d: Math.hypot(toPx(q).x - p.x, toPx(q).y - p.y) })).filter((a) => a.d < RAD * 1.6).sort((a, b) => a.d - b.d)[0]; if (o) mutateAt(o.q); return true; }
        return true;
      },
    }, (e) => K.cvPt(cv, e));
    autoB.addEventListener('click', () => {
      if (phase === 'done') return;
      if (phase === 'mutate') { autoMut(); return; }
      if (phase === 'ready' || phase === 'pick') { fastRound = true; lid = 1; lidTo = 1; if (!glove) autoPick(); }
    });
    root.querySelector('.ev-hu-reset').addEventListener('click', () => reset());
    bookB.addEventListener('click', () => { book = !book; bookB.setAttribute('aria-pressed', String(book)); table(); });
    const tk = K.ticker(step);
    // 시험용: 한 회를 곧바로 끝낸다
    root._hu = {
      round() { if (phase === 'mutate') { autoMut(); return; } while (myN < 5) { const L = live(); pick(L[K.pickW(L.map(weight))], 'me'); } glove = null; for (let i = 0; i < 10; i++) { const L = live(); pick(L[K.pickW(L.map(weight))], 'pc'); } glove = null; tally(); double(); },
      book: () => bookB.click(), get phase() { return phase; },
    };
    return {
      setActive(on) { if (on) { g = K.fit(cv); draw(); tk.start(); } else tk.stop(); },
      fit() { g = K.fit(cv); draw(); },
    };
  }
  window.EvHunt = { mount };
})();
