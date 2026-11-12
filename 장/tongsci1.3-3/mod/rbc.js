/* 3-3 3차시 체험 «적혈구와 달걀의 삼투»(교과서 153쪽 탐구 2 «적혈구 세포막을 통한 물질의 이동 예측하기»와 더하기 + 참고서 삼투 표·주의해·또 다른 실험).
   (가) 위: 혈액 접시(적혈구 셋) · 예측 카드 꽂이(커짐·그대로·작아짐) · 비커 셋(증류수 · 생리식염수 · 10 % 소금물).
       카드를 끌어 비커 위 칸에 붙인 뒤 적혈구를 끌어 넣으면, 물 화살표가 드나들며 부피가 바뀐다.
       증류수: 들어오는 물이 많아 부풀다 터진다(용혈, 물이 붉어짐) · 생리식염수: 드나드는 양이 같아 그대로 · 10 % 소금물: 나가는 물이 많아 쪼그라든다(톱니 모양).
       바뀜이 끝나면 예측 카드에 맞음/다름이 붙는다.
   (나) 아래: 식초 비커(껍데기가 녹은 달걀 둘, 기포) → 달걀을 증류수·10 % 소금물 비커에 끌어 넣고 시간 손잡이를 0~20분으로 끌면
       달걀이 부풀거나 쭈그러들고 전자저울 표시(꺼내 잰 질량)가 바뀐다. 질량은 이해를 돕기 위한 예.
   키보드: 1·2·3 그 비커의 예측 카드 바꾸기 · Q·W·E 그 비커에 적혈구 넣기 · A·S 달걀을 증류수·소금물에 · ←→ 시간 · 0 처음부터.
   RBC.mount(root) → { fit, setActive } · 시험용: root._rb.state() · pred(i, k) · cell(i) · egg(i) · time(분) · run(초) · toScreen(x, y) · geo() */
(function () {
  'use strict';
  const TAU = Math.PI * 2, VW = 1060, VH = 700;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const ease = (k) => k * k * (3 - 2 * k);
  const hash = (i, k) => { const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); };
  const F = (w, s) => `${w} ${s}px "IBM Plex Sans KR", sans-serif`;
  const PRED = { up: '커짐', same: '그대로', down: '작아짐' };
  const SOL = [
    { name: '증류수', sub: '저장액', truth: 'up', inN: 6, outN: 2, tint: [205, 228, 244], res: '부풀다 터짐(용혈)', water: '들어옴 > 나감' },
    { name: '생리식염수', sub: '등장액', truth: 'same', inN: 4, outN: 4, tint: [212, 230, 240], res: '그대로', water: '들어옴 = 나감' },
    { name: '10 % 소금물', sub: '고장액', truth: 'down', inN: 2, outN: 6, tint: [222, 232, 236], res: '쪼그라듦', water: '들어옴 < 나감' },
  ];
  const EGG = [{ name: '증류수', dm: 2.6, ds: 0.1, inN: 4, outN: 1 }, { name: '10 % 소금물', dm: -2.2, ds: -0.08, inN: 1, outN: 4 }]; // 20분 뒤 질량 변화(g)·크기 변화: 이해를 돕기 위한 예
  const M0 = 60.0, CHG = 4.6; // 적혈구 바뀌는 시간(초)
  // 판정·질량 계산 자체 점검
  const verdict = (i, k) => SOL[i].truth === k;
  const eggMass = (i, min) => M0 + EGG[i].dm * clamp(min / 20, 0, 1);
  console.assert(verdict(0, 'up') && verdict(1, 'same') && !verdict(2, 'up') && eggMass(0, 20) > M0 && eggMass(1, 20) < M0 && eggMass(0, 0) === M0, 'rbc: 판정·질량');

  // 자리(가상 좌표 1060×700)
  const DISH = { x: 104, y: 112, r: 70 }, CELL0 = [[78, 96], [130, 102], [104, 138]];
  const RACK = [['up', 105, 236], ['same', 105, 290], ['down', 105, 344]], CW = 140, CH = 42;
  const BK = [350, 590, 830].map((x) => ({ x, top: 160, bot: 362, hw: 90 })), SLOT_Y = 116;
  const DIV = 404;
  const VIN = { x: 108, bot: 664, hw: 82, h: 170 }, EGG0 = [[76, 606], [140, 612]];
  const EB = [330, 530].map((x) => ({ x, bot: 664, hw: 82, h: 170 }));
  const TR = { x0: 720, x1: 1010, y: 640 };

  function mount(root) {
    const stage = root.querySelector('.rb-stage'), out = root.querySelector('.rb-out'), tb = root.querySelector('.rb-tab tbody'), photo = root.querySelector('.rb-photo');
    const P = window.Play;
    let t, beaks, cells, eggs, min, held, msg, bad, K = 1, OX = 0, OY = 0, lastT;
    function reset() {
      t = 0; min = 0; held = null; bad = 0; lastT = -9; ok = new Set();
      beaks = SOL.map(() => ({ pred: null, cell: null, red: 0, judged: false }));
      cells = CELL0.map(([x, y], i) => ({ i, x, y, used: false }));
      eggs = EGG0.map(([x, y], i) => ({ i, x, y, in: null }));
      say('적혈구를 넣기 전에 먼저 <b>예측 카드</b>(커짐 · 그대로 · 작아짐)를 끌어 비커 위 빈칸에 붙이자');
      table(); steps();
    }
    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };
    const warn = (h) => { bad = t; say(h); };
    const beakAt = (x, y) => BK.findIndex((b) => Math.abs(x - b.x) < b.hw + 14 && y > SLOT_Y - 34 && y < b.bot);
    const eggBeakAt = (x, y) => EB.findIndex((b) => Math.abs(x - b.x) < b.hw + 10 && y > b.bot - b.h - 40 && y < b.bot);
    // 적혈구 상태: 시작 뒤 지난 시간 → 반지름 배율·가운데 옅음·톱니·터짐
    function cellLook(i, c) {
      const k = clamp((t - c.t0) / CHG, 0, 1), e = ease(k);
      if (i === 0) { const sw = ease(clamp(k / 0.8, 0, 1)), burst = clamp((k - 0.8) / 0.2, 0, 1) + (t - c.t0 > CHG ? clamp((t - c.t0 - CHG) / 3, 0, 1) : 0); return { s: 1 + 0.38 * sw, pale: sw, cren: 0, burst: Math.min(1, burst), k }; }
      if (i === 1) return { s: 1 + 0.012 * Math.sin(t * 2.4), pale: 0, cren: 0, burst: 0, k };
      return { s: 1 - 0.24 * e, pale: -0.4 * e, cren: e, burst: 0, k };
    }
    function judge(i) {
      const b = beaks[i]; if (b.judged || !b.cell || t - b.cell.t0 < CHG) return;
      b.judged = true; const okk = verdict(i, b.pred);
      say(`<b>${SOL[i].name}</b>: ${SOL[i].res} — 예측 «${PRED[b.pred]}» ${okk ? '<b class="rb-ok">맞았다</b>' : `<b class="rb-no">다르다</b>(정답 «${PRED[SOL[i].truth]}»)`}. ${i === 0 ? '들어오는 물이 나가는 물보다 많아 부풀다 끝내 터졌다(용혈).' : i === 1 ? '물이 드나들지 않는 게 아니라, 들어오고 나가는 양이 같다.' : '나가는 물이 들어오는 물보다 많아 쪼그라들고 겉이 톱니처럼 울퉁불퉁해졌다.'}`);
      table(); steps();
    }
    function putCard(i, k) {
      const b = beaks[i];
      if (b.cell) { warn(`${SOL[i].name}에는 이미 적혈구를 넣었다 — 예측은 넣기 전에! («처음부터»로 다시)`); return false; }
      b.pred = k; say(`${SOL[i].name} 비커에 «${PRED[k]}» 예측 카드를 붙였다${beaks.every((q) => q.pred) ? ' — 이제 접시의 적혈구를 끌어 비커에 넣자' : ''}`);
      table(); steps(); return true;
    }
    function putCell(i, ci) {
      const b = beaks[i];
      if (!b.pred) { warn(`먼저 <b>예측 카드</b>를 ${SOL[i].name} 비커 위 칸에 붙이자 — 넣기 전에 어떻게 될지 정해 두는 것이 탐구의 시작`); return false; }
      if (b.cell) { warn(`${SOL[i].name}에는 이미 적혈구가 있다 — 다른 비커에 넣자`); return false; }
      const c = ci == null ? cells.find((q) => !q.used) : cells[ci]; if (!c) return false;
      c.used = true; b.cell = { t0: t };
      say(`적혈구를 <b>${SOL[i].name}</b>에 넣었다 — 파란 화살표(물)가 들어오는 수와 나가는 수를 비교해 보자`);
      table(); steps(); return true;
    }
    function putEgg(j, ei) {
      const b = EB[j]; if (eggs.some((e) => e.in === j)) { warn(`${EGG[j].name} 비커에는 이미 달걀이 있다`); return false; }
      const e = ei == null ? eggs.find((q) => q.in === null) : eggs[ei]; if (!e || e.in !== null) return false;
      e.in = j; e.x = b.x; e.y = b.bot - 66;
      say(eggs.every((q) => q.in !== null) ? '달걀 둘을 넣었다(처음 질량은 둘 다 60.0 g). 오른쪽 <b>시간 손잡이</b>를 20분까지 끌어 보자' : `달걀 하나를 ${EGG[j].name}에 넣었다 — 다른 달걀은 남은 비커에`);
      table(); steps(); return true;
    }
    function setMin(m) {
      if (!eggs.every((q) => q.in !== null)) { warn('달걀 둘을 먼저 <b>증류수</b>와 <b>10 % 소금물</b> 비커에 하나씩 넣자'); return; }
      const nm = clamp(Math.round(m * 2) / 2, 0, 20); if (nm !== min) lastT = t; min = nm;
      if (min >= 20) say(`20분 뒤 — 증류수 달걀 <b>${eggMass(0, 20).toFixed(1)} g</b>(늘어남), 소금물 달걀 <b>${eggMass(1, 20).toFixed(1)} g</b>(줄어듦). 껍데기 밑 얇은 막이 세포막처럼 물을 오가게 했다`);
      else say(`${min}분 — 증류수 달걀은 물이 들어와 부풀고, 소금물 달걀은 물이 빠져 쭈그러든다`);
      table(); steps();
    }
    function table() {
      const rows = SOL.map((s, i) => {
        const b = beaks[i], fin = b.judged;
        const pr = b.pred ? `<span class="rb-pc">${PRED[b.pred]}</span>${fin ? (verdict(i, b.pred) ? ' <b class="rb-ok">✓</b>' : ' <b class="rb-no">✗</b>') : ''}` : '—';
        return `<tr><th>${s.name}<small>${fin ? s.sub : ''}</small></th><td>${pr}</td><td>${fin ? s.res : b.cell ? '보는 중…' : '—'}</td><td>${fin ? s.water : '—'}</td></tr>`;
      });
      const eg = EGG.map((g, j) => { const e = eggs.find((q) => q.in === j); return `<tr><th>달걀 · ${g.name}</th><td>—</td><td>${e ? `${M0.toFixed(1)} → ${eggMass(j, min).toFixed(1)} g` : '—'}</td><td>${e && min > 0 ? (j ? '들어옴 < 나감' : '들어옴 > 나감') : '—'}</td></tr>`; });
      tb.innerHTML = rows.join('') + '<tr class="rb-sep"><th colspan="4">(나) 달걀 · 시간 ' + min + '분</th></tr>' + eg.join('');
    }
    let ok = new Set();
    function steps() {
      if (beaks.every((b) => b.pred)) ok.add(1);
      if (beaks.every((b) => b.judged)) ok.add(2);
      if (eggs.every((e) => e.in !== null) && min >= 20) ok.add(3);
      const st = [1, 2, 3].find((q) => !ok.has(q)) || 0;
      window.L1.steps(root, st, [...ok]); window.L1.done(root, st === 0);
      if (photo) photo.hidden = !ok.has(2);
    }

    // ── 그리기 ──
    function txt(c, s, x, y, col, font, al = 'center') { c.fillStyle = col; c.font = font; c.textAlign = al; c.fillText(s, x, y); }
    function bg(c) {
      let gr = c.createLinearGradient(0, 0, 0, VH); gr.addColorStop(0, '#eef2f4'); gr.addColorStop(1, '#e2e7ea'); c.fillStyle = gr; c.fillRect(0, 0, VW, VH);
      const bench = (y0, y1) => { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, '#d9d4c7'); g.addColorStop(1, '#b8b19f'); c.fillStyle = g; c.fillRect(0, y0, VW, y1 - y0); c.fillStyle = 'rgba(0,0,0,.1)'; c.fillRect(0, y0, VW, 3); };
      bench(362, DIV - 6); bench(664, VH);
      c.fillStyle = '#c7ccd0'; c.fillRect(0, DIV - 6, VW, 4);
      const tag = (s, x, y) => { c.font = F(800, 17); const w = c.measureText(s).width + 22; c.fillStyle = '#1d2433'; c.beginPath(); c.roundRect(x, y - 18, w, 28, 14); c.fill(); txt(c, s, x + w / 2, y + 2, '#fbfcf9', F(800, 17)); };
      tag('(가) 적혈구 — 예측하고 넣기', 12, 26); tag('(나) 달걀 — 같은 원리', 12, DIV + 28);
    }
    function glass(c, x, bot, hw, h, tint, red = 0, lv = 0.78, label) {
      const top = bot - h, ly = bot - h * lv;
      c.fillStyle = 'rgba(0,0,0,.13)'; c.beginPath(); c.ellipse(x + 4, bot + 2, hw + 4, 7, 0, 0, TAU); c.fill();
      const [r, g, b] = tint, rr = Math.round(lerp(r, 226, red)), gg = Math.round(lerp(g, 120, red)), bb = Math.round(lerp(b, 128, red));
      const gr = c.createLinearGradient(x - hw, 0, x + hw, 0);
      gr.addColorStop(0, `rgba(${rr - 30},${gg - 25},${bb - 15},.75)`); gr.addColorStop(0.45, `rgba(${rr},${gg},${bb},.55)`); gr.addColorStop(1, `rgba(${rr - 35},${gg - 30},${bb - 20},.78)`);
      c.fillStyle = gr; c.beginPath(); c.moveTo(x - hw + 2, ly); c.lineTo(x - hw + 2, bot - 6); c.quadraticCurveTo(x - hw + 2, bot - 1, x - hw + 8, bot - 1); c.lineTo(x + hw - 8, bot - 1); c.quadraticCurveTo(x + hw - 2, bot - 1, x + hw - 2, bot - 6); c.lineTo(x + hw - 2, ly); c.fill();
      c.fillStyle = `rgba(${Math.min(255, rr + 25)},${Math.min(255, gg + 20)},${Math.min(255, bb + 12)},.85)`; c.beginPath(); c.ellipse(x, ly, hw - 2, 6, 0, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(255,255,255,.5)'; c.lineWidth = 1; c.beginPath(); c.ellipse(x, ly + 1 + Math.sin(t * 1.3 + x) * 0.6, hw - 10, 4, 0, 0.2, Math.PI - 0.2); c.stroke();
      c.strokeStyle = 'rgba(60,90,110,.9)'; c.lineWidth = 2; c.beginPath(); c.moveTo(x - hw - 6, top); c.lineTo(x - hw, top + 6); c.lineTo(x - hw, bot - 6); c.quadraticCurveTo(x - hw, bot, x - hw + 6, bot); c.lineTo(x + hw - 6, bot); c.quadraticCurveTo(x + hw, bot, x + hw, bot - 6); c.lineTo(x + hw, top); c.stroke();
      c.beginPath(); c.ellipse(x, top, hw, 6, 0, 0, TAU); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 4; c.beginPath(); c.moveTo(x - hw + 9, top + 14); c.lineTo(x - hw + 9, bot - 14); c.stroke();
      c.strokeStyle = 'rgba(60,90,110,.55)'; c.lineWidth = 1.2; for (let i = 1; i <= 4; i++) { const y = bot - i * h / 5.5; c.beginPath(); c.moveTo(x + hw - 16, y); c.lineTo(x + hw - 3, y); c.stroke(); }
      if (label) { c.font = F(800, 17); const w = c.measureText(label).width + 20; c.fillStyle = '#fbfcf9'; c.strokeStyle = '#384255'; c.lineWidth = 1.5; c.beginPath(); c.roundRect(x - w / 2, bot + 9, w, 26, 6); c.fill(); c.stroke(); txt(c, label, x, bot + 28, '#1d2433', F(800, 17)); }
    }
    // 적혈구(위에서 본 원반): s 크기, pale 가운데 옅음(0 오목 ~ 1 부풂, 음수면 진함), cren 톱니, burst 터짐
    function cell(c, x, y, r, o = { s: 1, pale: 0, cren: 0, burst: 0 }, seedI = 0) {
      const R = r * o.s;
      if (o.burst > 0) {
        for (let i = 0; i < 46; i++) { const a = hash(i, seedI + 3) * TAU, d = R * (0.3 + hash(i, seedI + 4) * 0.8 + o.burst * (1.2 + hash(i, 9) * 2.6)); c.fillStyle = `rgba(200,40,45,${(0.55 * (1 - o.burst * 0.75)).toFixed(3)})`; c.beginPath(); c.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 2.2 + hash(i, 5) * 2, 0, TAU); c.fill(); }
        c.strokeStyle = `rgba(214,120,128,${(0.85 - 0.3 * o.burst).toFixed(2)})`; c.lineWidth = 2.5;
        for (let k = 0; k < 5; k++) { const a0 = k / 5 * TAU + 0.3, a1 = a0 + TAU / 5 - 0.35 * o.burst; c.beginPath(); c.arc(x, y, R * (1 + 0.05 * o.burst), a0, a1); c.stroke(); }
        if (o.burst < 0.35) { c.globalAlpha = 1 - o.burst / 0.35; cell(c, x, y, r, { s: o.s, pale: 1, cren: 0, burst: 0 }, seedI); c.globalAlpha = 1; }
        return;
      }
      const path = () => {
        c.beginPath(); const N = 15;
        for (let i = 0; i <= 120; i++) { const a = i / 120 * TAU, sp = o.cren * 0.17 * Math.pow(Math.abs(Math.cos(N * a / 2)), 8), w = o.cren * 0.04 * Math.sin(3 * a + seedI); const rr = R * (1 + sp + w); const px = x + Math.cos(a) * rr, py = y + Math.sin(a) * rr; if (i) c.lineTo(px, py); else c.moveTo(px, py); }
        c.closePath();
      };
      c.fillStyle = 'rgba(80,0,0,.18)'; c.beginPath(); c.ellipse(x + 3, y + 4, R * 1.02, R * 0.98, 0, 0, TAU); c.fill();
      const pl = clamp(o.pale, -1, 1), gr = c.createRadialGradient(x - R * 0.12, y - R * 0.12, R * 0.05, x, y, R * 1.05);
      const ctr = pl >= 0 ? `rgb(${Math.round(lerp(236, 196, pl))},${Math.round(lerp(128, 46, pl))},${Math.round(lerp(120, 50, pl))})` : `rgb(${Math.round(lerp(236, 170, -pl))},${Math.round(lerp(128, 40, -pl))},${Math.round(lerp(120, 44, -pl))})`;
      gr.addColorStop(0, ctr); gr.addColorStop(0.32, ctr); gr.addColorStop(0.62, pl < 0 ? '#9a1c22' : '#c3262c'); gr.addColorStop(0.9, pl < 0 ? '#7e1419' : '#a51d24'); gr.addColorStop(1, '#86151b');
      path(); c.fillStyle = gr; c.fill(); c.strokeStyle = '#6e1015'; c.lineWidth = 1.6; c.stroke();
      c.fillStyle = 'rgba(255,255,255,.28)'; c.beginPath(); c.ellipse(x - R * 0.42, y - R * 0.45, R * 0.22, R * 0.11, -0.7, 0, TAU); c.fill();
    }
    function arrow(c, x0, y0, x1, y1, a = 1) {
      const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy) || 1, ux = dx / L, uy = dy / L;
      c.strokeStyle = `rgba(30,112,200,${a})`; c.fillStyle = c.strokeStyle; c.lineWidth = 3.2; c.lineCap = 'round';
      c.beginPath(); c.moveTo(x0, y0); c.lineTo(x1 - ux * 6, y1 - uy * 6); c.stroke();
      c.beginPath(); c.moveTo(x1, y1); c.lineTo(x1 - ux * 11 - uy * 6, y1 - uy * 11 + ux * 6); c.lineTo(x1 - ux * 11 + uy * 6, y1 - uy * 11 - ux * 6); c.closePath(); c.fill();
    }
    // 막을 건너는 물 화살표: 들어오는 inN개, 나가는 outN개가 돌아가며 흐른다
    function flows(c, x, y, R, inN, outN, ph, a = 1) {
      const n = inN + outN;
      for (let i = 0; i < n; i++) {
        const inward = i < inN, ang = (i / n) * TAU + (inward ? 0.2 : 0.55) + ph * 0.3, p = ((t * 0.55 + i * 0.37) % 1);
        const r0 = inward ? R * 1.75 : R * 0.45, r1 = inward ? R * 0.45 : R * 1.75, rA = lerp(r0, r1, p), rB = lerp(r0, r1, Math.min(1, p + 0.32));
        const al = a * Math.min(1, Math.sin(p * Math.PI) * 1.6);
        arrow(c, x + Math.cos(ang) * rA, y + Math.sin(ang) * rA, x + Math.cos(ang) * rB, y + Math.sin(ang) * rB, al);
      }
    }
    function card(c, k, x, y, sc = 1, mark) {
      c.save(); c.translate(x, y); c.scale(sc, sc);
      c.fillStyle = 'rgba(0,0,0,.18)'; c.beginPath(); c.roundRect(-CW / 2 + 3, -CH / 2 + 4, CW, CH, 8); c.fill();
      c.fillStyle = '#fffdf2'; c.strokeStyle = '#1d2433'; c.lineWidth = 2; c.beginPath(); c.roundRect(-CW / 2, -CH / 2, CW, CH, 8); c.fill(); c.stroke();
      c.fillStyle = k === 'up' ? '#2a73b8' : k === 'same' ? '#5b6270' : '#c0392b'; c.beginPath(); c.roundRect(-CW / 2, -CH / 2, 12, CH, [8, 0, 0, 8]); c.fill();
      const ic = k === 'up' ? '+' : k === 'same' ? '=' : '−';
      txt(c, ic, -CW / 2 + 32, 9, c.fillStyle, F(800, 26)); txt(c, PRED[k], 14, 8, '#1d2433', F(800, 21));
      if (mark) { const okk = mark === 'ok'; c.fillStyle = okk ? '#1f8a4c' : '#c0392b'; c.beginPath(); c.arc(CW / 2 - 2, -CH / 2 + 2, 15, 0, TAU); c.fill(); txt(c, okk ? '✓' : '✗', CW / 2 - 2, -CH / 2 + 9, '#fff', F(800, 19)); }
      c.restore();
    }
    function slot(c, i) {
      const b = BK[i], q = beaks[i];
      if (q.pred) card(c, q.pred, b.x, SLOT_Y, 1, q.judged ? (verdict(i, q.pred) ? 'ok' : 'no') : null);
      else { c.setLineDash([7, 5]); c.strokeStyle = '#7a8394'; c.lineWidth = 2; c.beginPath(); c.roundRect(b.x - CW / 2, SLOT_Y - CH / 2, CW, CH, 8); c.stroke(); c.setLineDash([]); txt(c, '예측 카드', b.x, SLOT_Y + 6, '#7a8394', F(700, 16)); }
    }
    function dish(c) {
      const { x, y, r } = DISH;
      c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(x + 4, y + 8, r + 4, r * 0.62 + 4, 0, 0, TAU); c.fill();
      let gr = c.createRadialGradient(x - 20, y - 20, 4, x, y, r); gr.addColorStop(0, 'rgba(255,255,255,.95)'); gr.addColorStop(1, 'rgba(205,220,228,.9)');
      c.fillStyle = gr; c.strokeStyle = 'rgba(70,100,120,.8)'; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y, r, r * 0.62, 0, 0, TAU); c.fill(); c.stroke();
      c.beginPath(); c.ellipse(x, y + 3, r - 8, r * 0.62 - 7, 0, 0, TAU); c.stroke();
      gr = c.createRadialGradient(x, y + 4, 4, x, y + 4, r * 0.8); gr.addColorStop(0, 'rgba(232,170,170,.55)'); gr.addColorStop(1, 'rgba(232,170,170,0)'); c.fillStyle = gr; c.beginPath(); c.ellipse(x, y + 4, r - 10, r * 0.55, 0, 0, TAU); c.fill();
      txt(c, '적혈구 (혈액)', x, y + r * 0.62 + 24, '#384255', F(700, 16));
    }
    function egg(c, x, y, sc, wr, inVin) {
      const rx = 30 * sc, ry = 38 * sc;
      const path = () => { c.beginPath(); for (let i = 0; i <= 90; i++) { const a = i / 90 * TAU, w = 1 + wr * (0.05 * Math.sin(7 * a + 1) + 0.035 * Math.sin(11 * a)), ey = Math.sin(a) > 0 ? 1 : 0.86; const px = x + Math.cos(a) * rx * w, py = y + Math.sin(a) * ry * w * ey; if (i) c.lineTo(px, py); else c.moveTo(px, py); } c.closePath(); };
      c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(x + 3, y + ry - 2, rx * 0.9, 6, 0, 0, TAU); c.fill();
      const gr = c.createRadialGradient(x - rx * 0.35, y - ry * 0.4, 2, x, y, ry * 1.1);
      gr.addColorStop(0, 'rgba(255,253,240,.97)'); gr.addColorStop(0.55, 'rgba(244,234,205,.9)'); gr.addColorStop(1, 'rgba(214,196,150,.92)');
      path(); c.fillStyle = gr; c.fill();
      const yg = c.createRadialGradient(x + 2, y + 6, 2, x + 2, y + 6, 20 * sc); yg.addColorStop(0, 'rgba(245,170,50,.75)'); yg.addColorStop(1, 'rgba(245,170,50,0)'); c.fillStyle = yg; c.beginPath(); c.arc(x + 2, y + 6, 20 * sc, 0, TAU); c.fill();
      path(); c.strokeStyle = 'rgba(150,125,80,.8)'; c.lineWidth = 1.6; c.stroke();
      c.fillStyle = 'rgba(255,255,255,.6)'; c.beginPath(); c.ellipse(x - rx * 0.4, y - ry * 0.45, rx * 0.18, ry * 0.12, -0.5, 0, TAU); c.fill();
      if (inVin) for (let i = 0; i < 7; i++) { const p = (t * 0.4 + hash(i, x)) % 1, a = hash(i, 2) * TAU; c.strokeStyle = `rgba(255,255,255,${(0.9 * (1 - p)).toFixed(2)})`; c.lineWidth = 1.2; c.beginPath(); c.arc(x + Math.cos(a) * rx * 0.9 + Math.sin(t + i) * 2, y + Math.sin(a) * ry * 0.8 - p * 70, 2 + hash(i, 3) * 2.5, 0, TAU); c.stroke(); }
    }
    function balance(c) {
      const x = 700, y = 432, w = 330, h = 128;
      c.fillStyle = 'rgba(0,0,0,.14)'; c.beginPath(); c.roundRect(x + 5, y + 7, w, h, 14); c.fill();
      let gr = c.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#f2f4f5'); gr.addColorStop(1, '#c9ced2'); c.fillStyle = gr; c.strokeStyle = '#5d6670'; c.lineWidth = 2; c.beginPath(); c.roundRect(x, y, w, h, 14); c.fill(); c.stroke();
      txt(c, '전자저울 · 꺼내서 잰 달걀 질량(예)', x + w / 2, y + 22, '#384255', F(700, 15));
      gr = c.createLinearGradient(0, y + 32, 0, y + 116); gr.addColorStop(0, '#c9dbb2'); gr.addColorStop(1, '#b4caa0'); c.fillStyle = gr; c.strokeStyle = '#3c4a34'; c.beginPath(); c.roundRect(x + 14, y + 32, w - 28, 84, 6); c.fill(); c.stroke();
      EGG.forEach((g, j) => {
        const e = eggs.find((q) => q.in === j), yy = y + 64 + j * 38;
        txt(c, g.name + ' 달걀', x + 26, yy, '#26331f', F(700, 16), 'left');
        txt(c, e ? eggMass(j, min).toFixed(1) + ' g' : '— g', x + w - 26, yy + 2, '#1b2614', '600 26px "IBM Plex Mono", monospace', 'right');
      });
    }
    function track(c) {
      const { x0, x1, y } = TR, kx = lerp(x0, x1, min / 20);
      txt(c, '시간 손잡이', x0 - 4, y - 32, '#1d2433', F(800, 17), 'left'); txt(c, `${min}분`, x1 + 4, y - 32, '#2a73b8', F(800, 20), 'right');
      c.strokeStyle = '#9aa3ad'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(x0, y); c.lineTo(x1, y); c.stroke();
      c.strokeStyle = '#2a73b8'; c.beginPath(); c.moveTo(x0, y); c.lineTo(kx, y); c.stroke();
      for (let m = 0; m <= 20; m += 5) { const x = lerp(x0, x1, m / 20); c.fillStyle = '#5d6670'; c.fillRect(x - 1, y + 9, 2, 8); txt(c, m + '분', x, y + 34, '#384255', F(600, 14)); }
      const ready = eggs.every((q) => q.in !== null);
      c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.arc(kx + 2, y + 3, 17, 0, TAU); c.fill();
      c.fillStyle = ready ? '#fbfcf9' : '#d9dde1'; c.strokeStyle = '#1d2433'; c.lineWidth = 2.5; c.beginPath(); c.arc(kx, y, 16, 0, TAU); c.fill(); c.stroke();
      c.strokeStyle = '#7a8394'; c.lineWidth = 2; for (const d of [-5, 0, 5]) { c.beginPath(); c.moveTo(kx + d, y - 7); c.lineTo(kx + d, y + 7); c.stroke(); }
    }
    function legend(c) {
      const x = 940, y = 186;
      c.fillStyle = 'rgba(251,252,249,.92)'; c.strokeStyle = '#9aa3ad'; c.lineWidth = 1.5; c.beginPath(); c.roundRect(x, y, 108, 118, 10); c.fill(); c.stroke();
      arrow(c, x + 20, y + 30, x + 56, y + 30); txt(c, '물 분자', x + 84, y + 36, '#1e70c8', F(800, 15));
      txt(c, '적혈구 그림은', x + 54, y + 66, '#5b6270', F(600, 13)); txt(c, '크게 확대한 것', x + 54, y + 84, '#5b6270', F(600, 13));
      txt(c, '(지름 약 8 μm)', x + 54, y + 104, '#5b6270', F(600, 13));
    }
    function hint(c) {
      if (held) return; let p = null;
      if (!ok.has(1)) p = [190, 226]; else if (!ok.has(2)) { const c0 = cells.find((q) => !q.used); if (c0) p = [c0.x, c0.y - 24]; }
      else if (!ok.has(3)) { const e = eggs.find((q) => q.in === null); p = e ? [e.x, e.y - 50] : [lerp(TR.x0, TR.x1, min / 20), TR.y - 22]; }
      if (!p) return; const k = Math.sin(t * 4) * 4; c.fillStyle = '#1d2433'; c.beginPath(); c.moveTo(p[0] - 8, p[1] - 12 + k); c.lineTo(p[0] + 8, p[1] - 12 + k); c.lineTo(p[0], p[1] + k); c.fill();
    }
    function draw(c, W, H, dt) {
      t += dt; beaks.forEach((b, i) => { if (b.cell) { judge(i); if (i === 0) b.red = clamp((t - b.cell.t0 - CHG * 0.8) / 4, 0, 1) * 0.35; } });
      c.fillStyle = '#e2e7ea'; c.fillRect(0, 0, W, H);
      K = Math.min(W / VW, H / VH); OX = (W - VW * K) / 2; OY = (H - VH * K) / 2;
      c.save(); c.translate(OX, OY); c.scale(K, K);
      bg(c);
      // (가)
      dish(c);
      txt(c, '예측 카드 (끌어서 붙이기)', 105, 200, '#384255', F(700, 15));
      RACK.forEach(([k, x, y]) => card(c, k, x, y));
      BK.forEach((b, i) => {
        const q = beaks[i];
        glass(c, b.x, b.bot, b.hw, b.bot - b.top, SOL[i].tint, q.red, 0.8, SOL[i].name);
        slot(c, i);
        if (q.cell) {
          const L = cellLook(i, q.cell), cy = b.bot - 96, R = 34;
          const active = q.cell && (t - q.cell.t0 < CHG + 0.3 || i === 1);
          if (L.burst < 0.4) { if (active || i === 2) flows(c, b.x, cy, R * L.s, active ? SOL[i].inN : 3, active ? SOL[i].outN : 3, i, i === 2 && !active ? 0.55 : 1); }
          c.save(); c.beginPath(); c.rect(b.x - b.hw + 3, b.bot - (b.bot - b.top) * 0.8, 2 * b.hw - 6, (b.bot - b.top) * 0.8 - 2); c.clip(); cell(c, b.x, cy, R, L, i); c.restore(); // 터진 적혈구 조각은 비커 물 안에만
          if (q.judged) txt(c, SOL[i].res, b.x, b.bot - 18, i === 0 ? '#a01c22' : '#1d2433', F(800, 16));
        }
      });
      legend(c);
      cells.forEach((q) => { if (!q.used && held !== q) cell(c, q.x, q.y, 16, { s: 1, pale: 0, cren: 0, burst: 0 }, q.i); });
      // (나)
      glass(c, VIN.x, VIN.bot, VIN.hw, VIN.h, [236, 226, 190], 0, 0.72, '식초 (껍데기 녹이기)');
      EB.forEach((b, j) => glass(c, b.x, b.bot, b.hw, b.h, j ? [222, 232, 236] : [205, 228, 244], 0, 0.78, EGG[j].name));
      const f = min / 20, flowA = clamp(1 - (t - lastT) / 1.5, 0, 1);
      eggs.forEach((e) => {
        if (held === e) return;
        if (e.in === null) { egg(c, e.x, e.y, 1, 0, true); return; }
        const g = EGG[e.in], sc = 1 + g.ds * f;
        if (flowA > 0) flows(c, e.x, e.y, 34 * sc, g.inN, g.outN, e.in + 3, flowA);
        egg(c, e.x, e.y, sc, e.in === 1 ? f : 0, false);
      });
      balance(c); track(c);
      // 들고 있는 것
      if (held) {
        if (held.kind === 'card') card(c, held.k, held.x, held.y, 1.06);
        else if (held.kind === 'cell') cell(c, held.x, held.y, 18, { s: 1, pale: 0, cren: 0, burst: 0 }, held.i);
        else if (held.kind === 'egg') egg(c, held.x, held.y, 1.04, 0, false);
      }
      hint(c);
      c.restore();
      out.classList.toggle('bad', !!bad && t - bad < 0.45);
    }

    // ── 손 조작 ──
    const V = (p) => ({ x: (p.x - OX) / K, y: (p.y - OY) / K });
    function grab(v) {
      if (Math.hypot(v.x - lerp(TR.x0, TR.x1, min / 20), v.y - TR.y) < 30 || (Math.abs(v.y - TR.y) < 22 && v.x > TR.x0 - 10 && v.x < TR.x1 + 10)) return { kind: 'knob' };
      for (const [k, x, y] of RACK) if (Math.abs(v.x - x) < CW / 2 && Math.abs(v.y - y) < CH / 2 + 2) return { kind: 'card', k, x, y, dx: x - v.x, dy: y - v.y };
      for (let i = 0; i < 3; i++) { const q = beaks[i], b = BK[i]; if (q.pred && !q.cell && Math.abs(v.x - b.x) < CW / 2 && Math.abs(v.y - SLOT_Y) < CH / 2) { const k = q.pred; q.pred = null; table(); steps(); return { kind: 'card', k, x: b.x, y: SLOT_Y, dx: b.x - v.x, dy: SLOT_Y - v.y }; } }
      for (const q of cells) if (!q.used && Math.hypot(v.x - q.x, v.y - q.y) < 24) return Object.assign(q, { kind: 'cell', dx: q.x - v.x, dy: q.y - v.y, hx: q.x, hy: q.y });
      if (Math.hypot(v.x - DISH.x, (v.y - DISH.y) / 0.62) < DISH.r) { const q = cells.find((z) => !z.used); if (q) return Object.assign(q, { kind: 'cell', dx: 0, dy: 0, hx: q.x, hy: q.y }); }
      for (const e of eggs) if (e.in === null && Math.abs(v.x - e.x) < 32 && Math.abs(v.y - e.y) < 40) return Object.assign(e, { kind: 'egg', dx: e.x - v.x, dy: e.y - v.y, hx: e.x, hy: e.y });
      return null;
    }
    function release(o) {
      if (o.kind === 'card') { const i = beakAt(o.x, o.y); if (i >= 0) putCard(i, o.k); else say('예측 카드는 <b>비커 위 빈칸</b>에 놓자'); }
      if (o.kind === 'cell') { const i = beakAt(o.x, o.y); if (!(i >= 0 && putCell(i, o.i))) { o.x = o.hx; o.y = o.hy; if (i < 0) say('적혈구를 비커 안에 놓자'); } }
      if (o.kind === 'egg') { const j = eggBeakAt(o.x, o.y); if (!(j >= 0 && putEgg(j, o.i))) { o.x = o.hx; o.y = o.hy; if (j < 0) say('달걀을 <b>증류수</b>나 <b>10 % 소금물</b> 비커에 넣자'); } }
    }
    const S = P.make(stage, {
      draw,
      down(p) { const v = V(p); held = grab(v); if (held && held.kind === 'knob') setMin((v.x - TR.x0) / (TR.x1 - TR.x0) * 20); },
      move(p) {
        if (!held) return; const v = V(p);
        if (held.kind === 'knob') { setMin((v.x - TR.x0) / (TR.x1 - TR.x0) * 20); return; }
        held.x = clamp(v.x + held.dx, 20, VW - 20); held.y = clamp(v.y + held.dy, 20, VH - 10);
      },
      up() { if (!held) return; const o = held; held = null; if (o.kind !== 'knob') release(o); },
      key(e) {
        const k = e.key.toUpperCase(), ks = ['up', 'same', 'down'];
        if ('123'.includes(k) && k.length === 1) { const i = +k - 1, q = beaks[i]; putCard(i, ks[(ks.indexOf(q.pred) + 1) % 3]); return true; }
        if ('QWE'.includes(k) && k.length === 1) { putCell('QWE'.indexOf(k)); return true; }
        if ((k === 'A' || k === 'S')) { putEgg(k === 'A' ? 0 : 1); return true; }
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { setMin(min + (e.key === 'ArrowRight' ? 2 : -2)); return true; }
        if (k === '0') { reset(); return true; } return false;
      },
    });
    const state = () => ({ beaks: beaks.map((b) => ({ pred: b.pred, cell: !!b.cell, judged: b.judged })), eggs: eggs.map((e) => e.in), min, ok: [...ok], done: root.classList.contains('u-done'), msg });
    reset();
    root.querySelector('.rb-reset').addEventListener('click', () => { reset(); S.kick(); });
    root._rb = {
      state, pred: (i, k) => { putCard(i, k); S.kick(); return state(); }, cell: (i) => { putCell(i); S.kick(); return state(); }, egg: (j) => { putEgg(j); S.kick(); return state(); },
      time: (m) => { setMin(m); S.kick(); return state(); }, run: (sec) => { for (let i = 0; i < sec * 30; i++) draw(S.c, S.W, S.H, 1 / 30); return state(); },
      toScreen: (x, y) => { const r = stage.querySelector('canvas').getBoundingClientRect(), k = r.width / (S.W || 1); return { x: r.left + (OX + x * K) * k, y: r.top + (OY + y * K) * k }; },
      geo: () => ({ DISH, CELL0, RACK, BK, SLOT_Y, EB, EGG0, TR, VIN }),
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.RBC = { mount };
})();
