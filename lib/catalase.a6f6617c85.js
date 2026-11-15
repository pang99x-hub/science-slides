/* 3-3 2차시 체험 «감자즙으로 효소 실험»(교과서 147쪽 탐구 «효소의 작용» + 참고서 카탈레이스 탐구 자료창).
   실험대 위: 선반에 3 % 과산화 수소수 병 · 3 % 에탄올 병 · 증류수 · 감자즙 비커 · 스포이트 · 생감자/삶은 감자/생간 조각 접시 · 꺼져 가는 향불.
   앞: 6홈판(홈 1~3) · 시험관대(A~D, 3 % 과산화 수소수가 들어 있음).
   ① 병을 끌어 홈 위에서 기울이면 3 mL가 들어간다(홈 1·2 과산화 수소수, 홈 3 에탄올). 스포이트를 비커에 대면 빨아들이고, 홈 위에서 놓으면 10방울.
      홈 2(감자즙)에서만 거품이 솟는다. 홈 3(에탄올 + 감자즙)은 그대로(기질특이성).
   ② 조각을 끌어 B(생감자)·C(삶은 감자)·D(생간)에 넣고, 향불을 끌어 시험관 입구에 대면 산소가 나오는 관에서만 불씨가 다시 타오른다.
   ③ 기포가 멈춘 관에 과산화 수소수를 더 부으면 다시 기포(재사용). 삶은 감자는 처음부터 기포가 없다(변성).
   오른쪽 결과 표(넣은 것 · 기포 · 불씨 · 까닭)가 관찰한 대로 채워진다. 반응 빠르기·거품 높이는 이해를 돕기 위한 예.
   키보드: 1·2·3 그 홈의 다음 순서, A·B·C·D 그 시험관의 다음 순서(조각 → 향불 → 더 붓기), 0 처음부터.
   Catalase.mount(root) → { fit, setActive } · 시험용: root._ct.pour(대상, 'h2o2'|'eth') · drip(홈, 'water'|'juice') · piece(관) · splint(관) · run(초) · state() · geo() · toScreen(x, y) */
(function () {
  'use strict';
  const TAU = Math.PI * 2, VW = 1060, VH = 620;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const hash = (i, k) => { const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); };
  const F = (w, s) => `${w} ${s}px "IBM Plex Sans KR", sans-serif`;
  const KCAT = { juice: 0.32, raw: 0.24, liver: 0.55, boil: 0, water: 0 }; // 효소 활성(이해를 돕기 위한 예)
  const WELL_RULE = { 1: ['h2o2', 'water'], 2: ['h2o2', 'juice'], 3: ['eth', 'juice'] };
  const TUBE_RULE = { A: null, B: 'raw', C: 'boil', D: 'liver' };
  const NAME = { h2o2: '3 % 과산화 수소수', eth: '3 % 에탄올', water: '증류수', juice: '감자즙', raw: '생감자 조각', boil: '삶은 감자 조각', liver: '생간 조각' };
  const WHY = {
    w1: '효소가 없어 분해가 아주 느리다', w2: '감자즙 속 카탈레이스가 분해를 빠르게 한다', w3: '카탈레이스는 에탄올과 결합하지 못한다(기질특이성)',
    A: '효소 없음 — 저절로는 아주 느리다', B: '생감자 속 카탈레이스 → 산소 발생', C: '열에 효소가 변성되어 기능을 잃었다', D: '간세포에도 카탈레이스가 많다',
  };

  function mount(root) {
    const stage = root.querySelector('.ct-stage'), out = root.querySelector('.ct-out'), tb = root.querySelector('.ct-tab tbody');
    const P = window.Play;
    let t, wells, tubes, items, held, drips, streams, msg, flash, flared, repoured, bad;

    // ── 자리(가상 1060×620) ──
    const SHELF = 232;
    const HOME = { h2o2: [62, SHELF], eth: [146, SHELF], water: [244, SHELF], juice: [336, SHELF], drop: [430, 150], raw: [540, SHELF], boil: [640, SHELF], liver: [740, SHELF], stick: [850, SHELF] };
    const WPOS = { 1: [130, 470], 2: [250, 470], 3: [370, 470] }, WBACK = [[130, 392], [250, 392], [370, 392]];
    const TPOS = { A: [610, 300], B: [710, 300], C: [810, 300], D: [910, 300] }; // 입구 가운데
    const TB = 560, TW = 17; // 시험관 바닥 y, 반지름

    function reset() {
      t = 0; msg = ''; flash = null; drips = []; streams = []; held = null; flared = new Set(); repoured = new Set(); bad = 0;
      wells = {}; [1, 2, 3].forEach((n) => { wells[n] = { id: 'w' + n, sol: null, add: null, vol: 0, fuel: 0, enz: 0, foam: 0, bub: [], t0: -1, seen: false, res: '' }; });
      tubes = {}; Object.keys(TPOS).forEach((k) => { tubes[k] = { id: k, sol: 'h2o2', add: null, vol: 1, fuel: 1, enz: 0, foam: 0, bub: [], t0: -1, seen: false, res: '', spark: '', stop: false, again: 0, pourK: 0 }; });
      items = {}; Object.keys(HOME).forEach((k) => { items[k] = { k, x: HOME[k][0], y: HOME[k][1], a: 0, used: false, liq: null, park: null }; });
      items.stick.flare = 0; items.stick.ins = null;
      say('① 과산화 수소수 병을 끌어 <b>홈 1·2</b> 위에서, 에탄올 병을 <b>홈 3</b> 위에서 기울이자(3 mL씩)');
      table(); steps();
    }
    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };

    // ── 판정 ──
    function wellAt(x, y) { for (const n of [1, 2, 3]) { const [cx, cy] = WPOS[n]; if (Math.abs(x - cx) < 52 && Math.abs(y - (cy - 50)) < 70) return n; } return null; }
    function tubeAt(x, y) { for (const k of Object.keys(TPOS)) { const [cx, cy] = TPOS[k]; if (Math.abs(x - cx) < 40 && y > cy - 110 && y < cy + 60) return k; } return null; }
    const mouthOf = (it, a = it.a) => [it.x + 108 * Math.sin(a), it.y - 108 * Math.cos(a)];

    function pourInto(kind, liq, ok) {
      if (kind === 'well') {
        const w = wells[ok];
        if (w.sol) return;
        if (WELL_RULE[ok][0] !== liq) { warn(`교과서대로: 홈 ${ok}에는 <b>${NAME[WELL_RULE[ok][0]]}</b>을(를) 넣는다`); return; }
        w.sol = liq; w.fuel = liq === 'h2o2' ? 1 : 0; w.vol = 1;
        const left = [1, 2, 3].filter((n) => !wells[n].sol);
        say(left.length ? `홈 ${ok}에 ${NAME[liq]} 3 mL · 남은 홈: ${left.join('·')}` : '이제 <b>스포이트</b>를 끌어 증류수나 감자즙 비커에 대 빨아들인 뒤, 홈 위에서 놓자(10방울)');
      } else {
        const tu = tubes[ok];
        if (liq !== 'h2o2') { warn('시험관에는 <b>과산화 수소수</b>만 붓는다'); return; }
        const was = tu.fuel < 0.05;
        tu.fuel += 1; tu.vol = Math.min(1.9, tu.vol + 0.3); tu.stop = false;
        if (tu.enz > 0 && tu.t0 >= 0 && was) { tu.again = t; repoured.add(ok); say(`${ok}에 다시 붓자 <b>기포가 또</b> 난다 — 효소는 반응 뒤에도 그대로라 <b>다시 쓰인다</b>(재사용)`); row(ok, { res: '많이 → 멈춤 → 다시 발생' }); }
        else if (tu.enz > 0 && tu.t0 >= 0) say(`${ok}에 더 부었다 — 아직 기포가 나는 중이다. 기포가 <b>멈춘 뒤</b> 부어 보자`);
        else if (tu.t0 >= 0 || ok === 'A') { say(`${ok}에 더 부어도 기포가 없다 — 이 관에는 일하는 효소가 없다`); }
        else say(`${ok}에 과산화 수소수를 더 부었다 — 먼저 조각을 넣어 보자`);
      }
    }
    function dripInto(n, liq) {
      const w = wells[n];
      if (!w.sol) { warn(`먼저 병을 기울여 홈 ${n}에 용액 3 mL를 넣자`); return false; }
      if (w.add) { warn(`홈 ${n}에는 이미 ${NAME[w.add]}을(를) 넣었다`); return false; }
      if (WELL_RULE[n][1] !== liq) { warn(`교과서대로: 홈 ${n}에는 <b>${NAME[WELL_RULE[n][1]]}</b> 10방울`); return false; }
      w.add = liq; w.enz = KCAT[liq]; w.t0 = t + 1.4; // 10방울이 다 떨어진 뒤
      for (let i = 0; i < 10; i++) drips.push({ x: WPOS[n][0] + (Math.random() - 0.5) * 3, y: WPOS[n][1] - 106, d: i * 0.13, vy: 0, liq, n });
      return true;
    }
    function pieceInto(k, kind) {
      const tu = tubes[k];
      if (tu.add) { warn(`${k}에는 이미 ${NAME[tu.add]}이(가) 들어 있다`); return false; }
      if (TUBE_RULE[k] !== kind) { warn(k === 'A' ? 'A는 <b>그대로</b> 둔다(비교용)' : `${k}에는 <b>${NAME[TUBE_RULE[k]]}</b>을(를) 넣는다`); return false; }
      tu.add = kind; tu.enz = KCAT[kind]; tu.t0 = t + 0.6; tu.pz = 0;
      if (tubes.A.t0 < 0) tubes.A.t0 = t + 0.6; // A(그대로)도 함께 지켜본다
      return true;
    }
    function splint(k) {
      const tu = tubes[k], on = tu.enz > 0 && tu.fuel > 0.08;
      if (on) { items.stick.flare = 3.2; flared.add(k); tu.spark = '다시 타오름'; say(`${k}: 불씨가 <b>다시 타오른다</b> — 나온 기체는 타는 것을 돕는 <b>산소</b>`); }
      else { tu.spark = '변화 없음'; say(tu.enz > 0 && tu.t0 >= 0 ? `${k}: 기포가 멈춰 불씨에 변화가 없다 — 과산화 수소수를 더 붓고 다시 대 보자` : `${k}: 불씨에 변화가 없다 — 이 관에서는 산소가 거의 나오지 않는다`); }
      table(); steps();
    }
    function warn(h) { bad = t; say(h); }

    // ── 표·단계 ──
    const ROWS = [['w1', '홈 1', '과산화 수소수 + 증류수'], ['w2', '홈 2', '과산화 수소수 + 감자즙'], ['w3', '홈 3', '에탄올 + 감자즙'],
      ['A', '시험관 A', '과산화 수소수만'], ['B', '시험관 B', '+ 생감자 조각'], ['C', '시험관 C', '+ 삶은 감자 조각'], ['D', '시험관 D', '+ 생간 조각']];
    const box = (id) => (id[0] === 'w' ? wells[+id[1]] : tubes[id]);
    function row(id, o) { Object.assign(box(id), o); table(); }
    function table() {
      tb.innerHTML = ROWS.map(([id, nm, put]) => {
        const b = box(id), well = id[0] === 'w';
        const sp = well ? '—' : (b.spark ? `<b class="${b.spark === '다시 타오름' ? 'on' : ''}">${b.spark}</b>` : '');
        return `<tr><th>${nm}</th><td>${put}</td><td>${b.res ? `<b class="${/많이|다시/.test(b.res) ? 'on' : ''}">${b.res}</b>` : ''}</td><td>${sp}</td><td class="why">${b.seen ? WHY[id] + (repoured.has(id) ? ' · 다시 부으면 또 반응(재사용)' : '') : ''}</td></tr>`;
      }).join('');
    }
    function steps() {
      const s1 = [1, 2, 3].every((n) => wells[n].seen), s2 = flared.size > 0, s3 = tubes.C.seen && repoured.size > 0;
      const ok = []; if (s1) ok.push(1); if (s2) ok.push(2); if (s3) ok.push(3);
      const now = [1, 2, 3].find((n) => !ok.includes(n)) || 0;
      window.L1.steps(root, now, ok); window.L1.done(root, now === 0);
    }

    // ── 움직임 ──
    function react(b, dt, isTube) {
      const rate = b.sol === 'h2o2' && b.enz > 0 && b.t0 >= 0 && t > b.t0 ? b.enz * b.fuel : 0;
      b.rate = rate; b.fuel = Math.max(0, b.fuel - rate * dt);
      if (b.fuel < 0.04 && rate > 0) b.fuel = 0;
      b.foam = clamp(b.foam + (rate * 1.8 - b.foam * 0.22) * dt, 0, isTube ? 1.25 : 1);
      // 관찰 기록(넣고 2.5초 뒤)
      if (b.t0 >= 0 && !b.seen && t > b.t0 + 2.5) {
        b.seen = true; b.res = b.enz > 0 && b.sol === 'h2o2' ? '많이 발생' : '거의 없음';
        const id = b.id;
        if (id === 'w1') say('홈 1(증류수): 거품이 거의 없다 — 효소가 없으면 과산화 수소는 <b>아주 느리게</b> 분해된다');
        if (id === 'w2') say('홈 2(감자즙): 거품이 부글부글 — 감자즙 속 <b>카탈레이스</b>가 과산화 수소를 물과 산소로 빠르게 나눈다');
        if (id === 'w3') say('홈 3(에탄올 + 감자즙): 거품 없음 — 카탈레이스는 에탄올과는 결합하지 못한다(<b>기질특이성</b>)');
        if (id === 'C') say('C(삶은 감자): 기포가 없다 — 열 때문에 효소 단백질의 입체 구조가 바뀌어(<b>변성</b>) 반응물과 결합하지 못한다');
        if (id === 'B') say('B(생감자): 기포가 계속 오른다 — 이제 꺼져 가는 <b>향불</b>을 끌어 B의 입구에 대 보자');
        if (id === 'D') say('D(생간): 기포가 아주 활발하다 — 동물의 간세포에도 카탈레이스가 많다');
        if ([1, 2, 3].every((n) => wells[n].seen) && id[0] === 'w') say('② 접시의 조각을 끌어 시험관 <b>B·C·D</b>에 넣고(A는 그대로), <b>향불</b>을 입구에 대 보자');
        table(); steps();
      }
      if (isTube && b.enz > 0 && b.seen && b.fuel === 0 && !b.stop) { b.stop = true; if (b.res === '많이 발생') b.res = '많이 → 멈춤'; table(); say(`${b.id}의 기포가 멈췄다 — 효소가 닳았을까, 과산화 수소가 다 쓰였을까? 병을 끌어 <b>과산화 수소수를 더</b> 부어 보자`); }
    }
    function step(dt) {
      t += dt;
      [1, 2, 3].forEach((n) => react(wells[n], dt, false));
      Object.values(tubes).forEach((tu) => react(tu, dt, true));
      // 기포 입자
      Object.values(tubes).forEach((tu) => {
        const [cx] = TPOS[tu.id];
        if (Math.random() < tu.rate * dt * 60) tu.bub.push({ x: cx + (Math.random() - 0.5) * 14, y: TB - 14, r: 1.2 + Math.random() * 2.2, vy: 40 + Math.random() * 40 });
        if (Math.random() < 0.15 * dt && tu.sol) tu.bub.push({ x: cx + (Math.random() - 0.5) * 18, y: TB - 6, r: 0.8, vy: 25 }); // 아주 드물게
        const top = surf(tu);
        tu.bub.forEach((o) => { o.y -= o.vy * dt; o.x += Math.sin(t * 6 + o.r * 9) * 0.3; });
        tu.bub = tu.bub.filter((o) => o.y > top + 2);
        if (tu.add && tu.pz < 1) tu.pz = Math.min(1, tu.pz + dt * 2.2);
      });
      [1, 2, 3].forEach((n) => { const w = wells[n]; if (Math.random() < w.rate * dt * 40) w.bub.push({ a: Math.random() * TAU, r: Math.random(), age: 0, s: 1.5 + Math.random() * 2.5 }); w.bub.forEach((o) => { o.age += dt; }); w.bub = w.bub.filter((o) => o.age < 1.2); });
      // 스포이트 방울
      drips.forEach((d) => { d.d -= dt; if (d.d < 0) { d.vy += 900 * dt; d.y += d.vy * dt; } });
      drips = drips.filter((d) => d.y < WPOS[d.n][1] - 8);
      // 붓기
      const it = held && (held.k === 'h2o2' || held.k === 'eth') ? held : null;
      ['h2o2', 'eth'].forEach((k) => { const b = items[k]; if (b !== it) { b.a = lerp(b.a, 0, Math.min(1, dt * 8)); b.pour = 0; } });
      if (it) {
        const [px, py] = mouthOf(it, -1.25), [mx, my] = mouthOf(it), wn = wellAt(px, py + 80), tk = tubeAt(px, py + 40); // 다 기울였을 때의 주둥이로 대상을 정한다
        const tgt = wn ? ['well', wn] : tk ? ['tube', tk] : null;
        it.a = lerp(it.a, tgt ? -1.25 : -0.25, Math.min(1, dt * 6));
        if (tgt && it.a < -1.0) {
          const key = tgt.join(':'); if (it.tk !== key) { it.tk = key; it.pour = 0; }
          it.pour += dt; streams = [{ x: mx, y: my, to: tgt[0] === 'well' ? WPOS[tgt[1]][1] - 30 : surf(tubes[tgt[1]]), liq: it.k }];
          if (it.pour > 0.7 && !it.done) { it.done = key; pourInto(tgt[0], it.k, tgt[1]); table(); steps(); }
        } else { streams = []; it.pour = 0; }
        if (!tgt) { it.tk = null; it.done = null; }
        else if (it.done && it.done !== tgt.join(':')) it.done = null;
      } else streams = [];
      // 향불
      const st = items.stick; st.flare = Math.max(0, st.flare - dt);
      if (held === st) {
        const tip = stickTip(st), tk = tubeAt(tip[0], tip[1]);
        if (tk && tip[1] > TPOS[tk][1] - 14 && tip[1] < TPOS[tk][1] + 40) { if (st.ins !== tk) { st.ins = tk; st.insT = t; } else if (t - st.insT > 0.45 && st.did !== tk) { st.did = tk; splint(tk); } }
        else { st.ins = null; st.did = null; }
      }
      // 스포이트 채우기
      const dr = items.drop;
      if (held === dr) { const tip = [dr.x, dr.y + 70]; for (const k of ['water', 'juice']) { const [bx, by] = HOME[k]; if (Math.abs(tip[0] - bx) < 34 && tip[1] > by - 70 && tip[1] < by) { if (dr.liq !== k) { dr.liq = k; dr.fill = 0; say(`스포이트에 <b>${NAME[k]}</b>을(를) 빨아들였다 — 홈 위로 옮겨 놓자`); } } } }
      dr.fill = Math.min(1, (dr.fill || 0) + dt * 3);
      // 제자리로
      Object.values(items).forEach((o) => {
        if (o === held) return;
        let hx = HOME[o.k][0], hy = HOME[o.k][1];
        if (o.park && t < o.park.until) { hx = o.park.x; hy = o.park.y; } else o.park = null;
        o.x = lerp(o.x, hx, Math.min(1, dt * 9)); o.y = lerp(o.y, hy, Math.min(1, dt * 9));
      });
    }
    const surf = (tu) => TB - 90 * tu.vol; // 시험관 액체 표면 y
    const stickTip = (s) => (held === s ? [s.x, s.y + 118] : [s.x - 2, s.y - 128]); // 들면 불씨를 아래로

    // ── 그리기 ──
    function txt(c, s, x, y, col, font, al = 'center') { c.fillStyle = col; c.font = font; c.textAlign = al; c.fillText(s, x, y); }
    function bg(c) {
      let gr = c.createLinearGradient(0, 0, 0, SHELF); gr.addColorStop(0, '#e7ecf1'); gr.addColorStop(1, '#d6dde5'); c.fillStyle = gr; c.fillRect(0, 0, VW, SHELF + 10);
      c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = 1; for (let x = 0; x < VW; x += 70) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, SHELF); c.stroke(); } for (let y = 35; y < SHELF; y += 70) { c.beginPath(); c.moveTo(0, y); c.lineTo(VW, y); c.stroke(); }
      // 선반
      gr = c.createLinearGradient(0, SHELF, 0, SHELF + 22); gr.addColorStop(0, '#f4f1ea'); gr.addColorStop(1, '#b9b2a2'); c.fillStyle = gr; c.fillRect(0, SHELF, VW, 22);
      c.fillStyle = 'rgba(0,0,0,.12)'; c.fillRect(0, SHELF + 22, VW, 8);
      // 실험대 윗면
      gr = c.createLinearGradient(0, SHELF + 22, 0, VH); gr.addColorStop(0, '#d8dcd6'); gr.addColorStop(1, '#bfc5bd'); c.fillStyle = gr; c.fillRect(0, SHELF + 30, VW, VH - SHELF - 30);
      c.strokeStyle = 'rgba(80,90,80,.12)'; for (let i = 0; i < 40; i++) { c.beginPath(); const y = SHELF + 40 + hash(i, 1) * (VH - SHELF - 50); c.moveTo(hash(i, 2) * VW, y); c.lineTo(hash(i, 2) * VW + 40 + hash(i, 3) * 80, y + 2); c.stroke(); }
    }
    function bottle(c, o, liq) {
      c.save(); c.translate(o.x, o.y); c.rotate(o.a);
      if (Math.abs(o.a) < 0.05) { c.fillStyle = 'rgba(0,0,0,.14)'; c.beginPath(); c.ellipse(4, 2, 30, 6, 0, 0, TAU); c.fill(); }
      const brown = liq === 'h2o2', gr = c.createLinearGradient(-28, 0, 28, 0);
      if (brown) { gr.addColorStop(0, '#3e1c0b'); gr.addColorStop(0.3, '#8a4a1c'); gr.addColorStop(0.55, '#b5702f'); gr.addColorStop(1, '#341707'); }
      else { gr.addColorStop(0, 'rgba(170,200,215,.85)'); gr.addColorStop(0.4, 'rgba(240,250,255,.7)'); gr.addColorStop(1, 'rgba(150,180,200,.85)'); }
      const body = () => { c.beginPath(); c.moveTo(-27, -4); c.lineTo(-27, -64); c.quadraticCurveTo(-27, -80, -12, -84); c.lineTo(-10, -96); c.lineTo(10, -96); c.lineTo(12, -84); c.quadraticCurveTo(27, -80, 27, -64); c.lineTo(27, -4); c.quadraticCurveTo(27, 0, 22, 0); c.lineTo(-22, 0); c.quadraticCurveTo(-27, 0, -27, -4); };
      body(); c.fillStyle = gr; c.fill(); c.strokeStyle = brown ? '#2a1206' : '#5d7c8c'; c.lineWidth = 1.6; c.stroke();
      if (!brown) { c.save(); body(); c.clip(); c.fillStyle = 'rgba(205,230,240,.55)'; c.fillRect(-30, -60, 60, 62); c.restore(); }
      c.fillStyle = 'rgba(255,255,255,.4)'; c.fillRect(-20, -70, 5, 62);
      c.fillStyle = brown ? '#f4f4f2' : '#3a6fb0'; c.strokeStyle = '#555'; c.lineWidth = 1; c.fillRect(-11, -108, 22, 13); c.strokeRect(-11, -108, 22, 13);
      c.fillStyle = '#fbf6e6'; c.fillRect(-23, -56, 46, 38); c.strokeStyle = brown ? '#7a1f12' : '#1f5f8a'; c.strokeRect(-23, -56, 46, 38);
      c.fillStyle = brown ? '#7a1f12' : '#1f5f8a'; c.textAlign = 'center';
      if (brown) { c.font = F(800, 10.5); c.fillText('과산화', 0, -42); c.fillText('수소수', 0, -30); }
      else { c.font = F(800, 12); c.fillText('에탄올', 0, -36); }
      c.font = F(700, 10); c.fillText('3 %', 0, -21);
      c.restore();
    }
    function beaker(c, x, y, liq) {
      const w = 34, h = 78, juice = liq === 'juice';
      c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(x + 3, y, w + 2, 5, 0, 0, TAU); c.fill();
      // 액체
      const ly = y - h * 0.58, gr = c.createLinearGradient(x - w, 0, x + w, 0);
      if (juice) { gr.addColorStop(0, '#c9b27c'); gr.addColorStop(0.5, '#ead9a8'); gr.addColorStop(1, '#bba06a'); } else { gr.addColorStop(0, 'rgba(170,205,225,.6)'); gr.addColorStop(0.5, 'rgba(225,242,250,.5)'); gr.addColorStop(1, 'rgba(160,195,215,.6)'); }
      c.fillStyle = gr; c.beginPath(); c.moveTo(x - w + 2, ly); c.lineTo(x - w + 2, y - 4); c.quadraticCurveTo(x - w + 2, y - 1, x - w + 6, y - 1); c.lineTo(x + w - 6, y - 1); c.quadraticCurveTo(x + w - 2, y - 1, x + w - 2, y - 4); c.lineTo(x + w - 2, ly); c.fill();
      c.fillStyle = juice ? 'rgba(250,240,210,.8)' : 'rgba(240,250,255,.7)'; c.beginPath(); c.ellipse(x, ly, w - 2, 4, 0, 0, TAU); c.fill();
      if (juice) { c.fillStyle = 'rgba(150,120,70,.35)'; for (let i = 0; i < 12; i++) { c.beginPath(); c.arc(x + (hash(i, 7) - 0.5) * 2 * (w - 6), y - 6 - hash(i, 8) * 30, 1.2, 0, TAU); c.fill(); } }
      // 유리
      c.strokeStyle = 'rgba(70,100,120,.85)'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(x - w - 4, y - h); c.lineTo(x - w, y - h + 4); c.lineTo(x - w, y - 4); c.quadraticCurveTo(x - w, y, x - w + 4, y); c.lineTo(x + w - 4, y); c.quadraticCurveTo(x + w, y, x + w, y - 4); c.lineTo(x + w, y - h); c.stroke();
      c.beginPath(); c.ellipse(x, y - h, w, 4, 0, 0, TAU); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 3; c.beginPath(); c.moveTo(x - w + 7, y - h + 10); c.lineTo(x - w + 7, y - 10); c.stroke();
      c.strokeStyle = 'rgba(70,100,120,.6)'; c.lineWidth = 1; for (let i = 1; i <= 3; i++) { c.beginPath(); c.moveTo(x + w - 12, y - i * 18); c.lineTo(x + w - 2, y - i * 18); c.stroke(); }
      txt(c, NAME[liq], x, y + 22, '#384255', F(700, 14));
    }
    function dropper(c, o) {
      c.save(); c.translate(o.x, o.y);
      // 유리관
      c.fillStyle = 'rgba(225,240,248,.75)'; c.strokeStyle = 'rgba(70,100,120,.9)'; c.lineWidth = 1.4;
      c.beginPath(); c.moveTo(-5, -10); c.lineTo(-5, 52); c.lineTo(-1.5, 72); c.lineTo(1.5, 72); c.lineTo(5, 52); c.lineTo(5, -10); c.closePath(); c.fill(); c.stroke();
      if (o.liq) { c.fillStyle = o.liq === 'juice' ? 'rgba(220,200,140,.95)' : 'rgba(160,200,225,.8)'; const h = 46 * (o.fill || 1); c.beginPath(); c.moveTo(-4, 52 - h + 18); c.lineTo(-4, 52); c.lineTo(-1, 70); c.lineTo(1, 70); c.lineTo(4, 52); c.lineTo(4, 52 - h + 18); c.fill(); }
      c.strokeStyle = 'rgba(255,255,255,.85)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-2.5, -6); c.lineTo(-2.5, 48); c.stroke();
      // 고무 꼭지
      const sq = o.squeeze ? 0.8 : 1, gr = c.createLinearGradient(-12, 0, 12, 0); gr.addColorStop(0, '#7f1d18'); gr.addColorStop(0.4, '#d8483c'); gr.addColorStop(1, '#6a1410');
      c.fillStyle = gr; c.beginPath(); c.ellipse(0, -28, 11 * sq, 18, 0, 0, TAU); c.fill(); c.fillRect(-7, -14, 14, 8); c.strokeStyle = '#4a0d0a'; c.lineWidth = 1.2; c.beginPath(); c.ellipse(0, -28, 11 * sq, 18, 0, 0, TAU); c.stroke();
      c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.ellipse(-4, -33, 3, 8, 0, 0, TAU); c.fill();
      c.restore();
    }
    function dish(c, x, y, kind, used) {
      c.fillStyle = 'rgba(0,0,0,.12)'; c.beginPath(); c.ellipse(x + 3, y, 40, 7, 0, 0, TAU); c.fill();
      c.fillStyle = 'rgba(235,245,250,.75)'; c.strokeStyle = 'rgba(70,100,120,.8)'; c.lineWidth = 1.4; c.beginPath(); c.ellipse(x, y - 6, 40, 9, 0, 0, TAU); c.fill(); c.stroke();
      txt(c, NAME[kind].replace(' 조각', ''), x, y + 22, '#384255', F(700, 14));
      if (!used) piece(c, x, y - 12, kind, 1);
    }
    function piece(c, x, y, kind, s) {
      c.save(); c.translate(x, y); c.scale(s, s);
      if (kind === 'liver') {
        const gr = c.createRadialGradient(-5, -5, 1, 0, 0, 18); gr.addColorStop(0, '#a3443c'); gr.addColorStop(0.6, '#6e1f1c'); gr.addColorStop(1, '#3e0e0d');
        c.fillStyle = gr; c.beginPath(); c.moveTo(-17, 4); c.bezierCurveTo(-18, -9, -4, -12, 6, -10); c.bezierCurveTo(16, -8, 19, 2, 15, 7); c.bezierCurveTo(8, 11, -10, 11, -17, 4); c.fill();
        c.fillStyle = 'rgba(255,255,255,.45)'; c.beginPath(); c.ellipse(-4, -6, 6, 2, -0.3, 0, TAU); c.fill();
      } else {
        const boiled = kind === 'boil';
        c.fillStyle = boiled ? '#b98a4e' : '#8a6234'; c.beginPath(); c.moveTo(-15, -8); c.lineTo(13, -10); c.lineTo(16, 6); c.lineTo(-14, 8); c.closePath(); c.fill(); // 껍질 쪽
        const gr = c.createLinearGradient(0, -10, 0, 8); gr.addColorStop(0, boiled ? '#f3dc9c' : '#fbf3d0'); gr.addColorStop(1, boiled ? '#d9b866' : '#e9d79a');
        c.fillStyle = gr; c.beginPath(); c.moveTo(-13, -7); c.lineTo(12, -8); c.lineTo(14, 5); c.lineTo(-12, 6); c.closePath(); c.fill();
        if (boiled) { c.fillStyle = 'rgba(255,255,255,.35)'; c.beginPath(); c.arc(-3, -3, 4, 0, TAU); c.fill(); } else { c.fillStyle = 'rgba(200,180,110,.5)'; for (let i = 0; i < 6; i++) { c.beginPath(); c.arc(-9 + i * 4, -2 + (i % 2) * 3, 0.9, 0, TAU); c.fill(); } }
      }
      c.restore();
    }
    function stick(c, o) {
      const [tx, ty] = stickTip(o), up = held !== o, bx = up ? o.x : o.x, byy = up ? o.y - 6 : o.y - 4, sg = up ? 1 : -1;
      if (up) { c.fillStyle = '#7a5a3a'; c.beginPath(); c.ellipse(o.x, o.y - 4, 18, 6, 0, 0, TAU); c.fill(); } // 받침
      c.strokeStyle = '#6b4a2b'; c.lineWidth = 4; c.lineCap = 'round'; c.beginPath(); c.moveTo(bx, byy); c.lineTo(tx, ty + 8 * sg); c.stroke();
      c.strokeStyle = '#3a3a3a'; c.lineWidth = 4.5; c.beginPath(); c.moveTo(tx, ty + 8 * sg); c.lineTo(tx, ty); c.stroke(); c.lineCap = 'butt';
      // 연기
      c.strokeStyle = 'rgba(150,150,160,.45)'; c.lineWidth = 2; c.beginPath(); for (let i = 0; i < 14; i++) { const yy = ty - 4 - i * 5; c.lineTo(tx + Math.sin(t * 2.4 + i * 0.6) * (2 + i * 0.7), yy); } c.stroke();
      // 불씨·불꽃
      if (o.flare > 0) {
        const k = Math.min(1, o.flare / 0.6), fh = 28 * k * (1 + 0.12 * Math.sin(t * 30));
        P.glow(c, tx, ty - 6, 34 * k, 'rgba(255,190,60,.75)');
        const gr = c.createLinearGradient(0, ty - fh, 0, ty); gr.addColorStop(0, 'rgba(255,240,150,.2)'); gr.addColorStop(0.5, '#ffb43a'); gr.addColorStop(1, '#ff6a1a');
        c.fillStyle = gr; c.beginPath(); c.moveTo(tx - 7 * k, ty); c.quadraticCurveTo(tx - 8 * k, ty - fh * 0.5, tx, ty - fh); c.quadraticCurveTo(tx + 8 * k, ty - fh * 0.5, tx + 7 * k, ty); c.fill();
      } else {
        const dim = o.ins && tubes[o.ins] && !(tubes[o.ins].enz > 0 && tubes[o.ins].fuel > 0.08) ? 0.45 : 1;
        P.glow(c, tx, ty, 9, `rgba(255,120,40,${0.55 * dim + 0.2 * Math.sin(t * 5) * dim})`);
        c.fillStyle = `rgba(255,${90 + 40 * dim},40,${dim})`; c.beginPath(); c.arc(tx, ty, 2.6, 0, TAU); c.fill();
      }
      if (held !== o) txt(c, '꺼져 가는 향불', HOME.stick[0], HOME.stick[1] + 22, '#384255', F(700, 14));
    }
    function plate(c) {
      // 6홈판(투명 플라스틱): 뒷줄 3개는 쓰지 않는다
      const x0 = 50, x1 = 450, y0 = 350, y1 = 530;
      c.fillStyle = 'rgba(0,0,0,.13)'; c.beginPath(); c.roundRect(x0 + 6, y0 + 10, x1 - x0, y1 - y0, 18); c.fill();
      const gr = c.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, 'rgba(245,250,252,.92)'); gr.addColorStop(1, 'rgba(215,228,235,.92)');
      c.fillStyle = gr; c.strokeStyle = 'rgba(80,110,125,.8)'; c.lineWidth = 2; c.beginPath(); c.roundRect(x0, y0, x1 - x0, y1 - y0, 18); c.fill(); c.stroke();
      c.fillStyle = 'rgba(190,210,220,.9)'; c.beginPath(); c.roundRect(x0, y1 - 14, x1 - x0, 14, [0, 0, 18, 18]); c.fill();
      WBACK.forEach(([x, y]) => wellShape(c, x, y, null));
      [1, 2, 3].forEach((n) => wellShape(c, WPOS[n][0], WPOS[n][1], wells[n], n));
      txt(c, '6홈판', x0 + 8, y1 + 24, '#384255', F(700, 14), 'left');
    }
    function wellShape(c, x, y, w, n) {
      const rx = 46, ry = 24, dep = 26;
      c.fillStyle = 'rgba(170,195,208,.55)'; c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(80,110,125,.8)'; c.lineWidth = 1.6; c.stroke();
      c.fillStyle = 'rgba(120,150,165,.35)'; c.beginPath(); c.ellipse(x, y + dep * 0.35, rx - 6, ry - 6, 0, 0, TAU); c.fill();
      if (w && w.vol > 0) {
        const liqC = w.add === 'juice' ? 'rgba(222,205,150,.85)' : w.sol === 'eth' ? 'rgba(215,235,245,.8)' : 'rgba(195,225,240,.8)';
        c.fillStyle = liqC; c.beginPath(); c.ellipse(x, y + 4, rx - 7, ry - 7, 0, 0, TAU); c.fill();
        c.strokeStyle = 'rgba(255,255,255,.8)'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(x, y + 4, rx - 14, ry - 12, 0, Math.PI * 1.1, Math.PI * 1.5); c.stroke();
        // 거품: 표면 위로 솟는 둥근 더미
        const fh = w.foam * 70;
        if (fh > 1) {
          for (let i = 0; i < 90; i++) {
            const u = hash(i, 1), v = hash(i, 2); const ang = u * TAU, rr = Math.sqrt(v);
            const bx = x + Math.cos(ang) * rr * (rx - 10), base = y + 4 + Math.sin(ang) * rr * (ry - 9);
            const hgt = fh * (1 - rr * rr) * (0.5 + 0.5 * hash(i, 3));
            const by = base - hgt + Math.sin(t * 7 + i) * 0.8, br = 3 + hash(i, 4) * 5 * Math.min(1, w.foam * 2);
            const gg = c.createRadialGradient(bx - br * 0.3, by - br * 0.4, 0.3, bx, by, br); gg.addColorStop(0, '#fff'); gg.addColorStop(0.75, 'rgba(250,248,240,.97)'); gg.addColorStop(1, 'rgba(200,195,180,.95)');
            c.fillStyle = gg; c.beginPath(); c.arc(bx, by, br, 0, TAU); c.fill();
          }
        }
        w.bub.forEach((o) => { c.strokeStyle = `rgba(255,255,255,${1 - o.age})`; c.lineWidth = 1; c.beginPath(); c.arc(x + Math.cos(o.a) * o.r * (rx - 12), y + 4 + Math.sin(o.a) * o.r * (ry - 10) - o.age * 6, o.s, 0, TAU); c.stroke(); });
      }
      if (n) txt(c, String(n), x, y + ry + 22, '#1d2433', F(800, 17));
    }
    function rack(c) {
      const x0 = 560, x1 = 960;
      // 뒷기둥·판
      c.fillStyle = '#b07a46'; c.fillRect(x0, 330, 12, 250); c.fillRect(x1 - 12, 330, 12, 250);
      Object.keys(TPOS).forEach((k) => tube(c, k));
      let gr = c.createLinearGradient(0, 340, 0, 362); gr.addColorStop(0, '#d9a56d'); gr.addColorStop(1, '#a8723f');
      c.fillStyle = gr; c.fillRect(x0 - 6, 340, x1 - x0 + 12, 22); c.strokeStyle = '#6b4626'; c.lineWidth = 1.2; c.strokeRect(x0 - 6, 340, x1 - x0 + 12, 22);
      gr = c.createLinearGradient(0, 568, 0, 590); gr.addColorStop(0, '#d9a56d'); gr.addColorStop(1, '#8e5f33');
      c.fillStyle = gr; c.fillRect(x0 - 10, 568, x1 - x0 + 20, 22); c.strokeRect(x0 - 10, 568, x1 - x0 + 20, 22);
      Object.keys(TPOS).forEach((k) => { txt(c, k, TPOS[k][0], 357, '#fff', F(800, 15)); txt(c, tubes[k].add ? NAME[tubes[k].add].replace(' 조각', '') : (k === 'A' ? '그대로' : ''), TPOS[k][0], 610, '#384255', F(700, 14)); });
      txt(c, '시험관 속: 3 % 과산화 수소수', (x0 + x1) / 2, 291, '#384255', F(700, 13));
    }
    function tube(c, k) {
      const tu = tubes[k], [cx, my] = TPOS[k], s = surf(tu);
      // 액체
      const gr = c.createLinearGradient(cx - TW, 0, cx + TW, 0); gr.addColorStop(0, 'rgba(170,205,225,.75)'); gr.addColorStop(0.5, 'rgba(230,245,252,.65)'); gr.addColorStop(1, 'rgba(160,195,215,.75)');
      c.fillStyle = gr; c.beginPath(); c.moveTo(cx - TW + 2, s); c.lineTo(cx - TW + 2, TB - TW); c.arc(cx, TB - TW, TW - 2, Math.PI, 0, true); c.lineTo(cx + TW - 2, s); c.fill();
      c.fillStyle = 'rgba(240,250,255,.8)'; c.beginPath(); c.ellipse(cx, s, TW - 2, 3, 0, 0, TAU); c.fill();
      if (tu.add) piece(c, cx, lerp(my - 30, TB - 14, tu.pz || 0), tu.add, 0.62);
      tu.bub.forEach((o) => { c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 1; c.beginPath(); c.arc(o.x, o.y, o.r, 0, TAU); c.stroke(); });
      // 거품 기둥
      const fh = tu.foam * 150;
      if (fh > 1) {
        c.save(); c.beginPath(); c.rect(cx - TW - 30, my - 60, TW * 2 + 60, s - my + 62); c.clip();
        const n = Math.round(10 + fh * 1.1);
        for (let i = 0; i < n; i++) {
          const v = hash(i, 5), y = s - v * fh, over = y < my, w = over ? TW + 4 + (my - y) * 0.15 : TW - 3;
          const bx = cx + (hash(i, 6) - 0.5) * 2 * w + Math.sin(t * 6 + i) * 0.6, br = 2.5 + hash(i, 7) * 3.5;
          const gg = c.createRadialGradient(bx - 1, y - 1, 0.3, bx, y, br); gg.addColorStop(0, '#fff'); gg.addColorStop(1, 'rgba(205,210,215,.95)');
          c.fillStyle = gg; c.beginPath(); c.arc(bx, y, br, 0, TAU); c.fill();
        }
        c.restore();
      }
      // 유리
      c.strokeStyle = 'rgba(70,100,120,.9)'; c.lineWidth = 1.8; c.beginPath(); c.moveTo(cx - TW, my); c.lineTo(cx - TW, TB - TW); c.arc(cx, TB - TW, TW, Math.PI, 0, true); c.lineTo(cx + TW, my); c.stroke();
      c.beginPath(); c.ellipse(cx, my, TW + 2, 3.5, 0, 0, TAU); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.75)'; c.lineWidth = 3; c.beginPath(); c.moveTo(cx - TW + 5, my + 8); c.lineTo(cx - TW + 5, TB - 22); c.stroke();
      if (tu.spark === '다시 타오름') txt(c, '산소!', cx + TW + 5, my + 22, '#b0301f', F(800, 14), 'left');
    }
    function streamsDraw(c) {
      streams.forEach((s) => {
        const gr = c.createLinearGradient(0, s.y, 0, s.to); gr.addColorStop(0, s.liq === 'h2o2' ? 'rgba(190,220,240,.9)' : 'rgba(220,240,250,.9)'); gr.addColorStop(1, 'rgba(190,220,240,.5)');
        c.strokeStyle = gr; c.lineWidth = 3.5; c.beginPath(); c.moveTo(s.x, s.y); for (let y = s.y; y < s.to; y += 8) c.lineTo(s.x + Math.sin(t * 20 + y * 0.2) * 1.2, y); c.stroke();
      });
      drips.forEach((d) => { if (d.d > 0) return; c.fillStyle = d.liq === 'juice' ? 'rgba(225,205,145,.95)' : 'rgba(190,220,240,.95)'; c.beginPath(); c.moveTo(d.x, d.y - 6); c.quadraticCurveTo(d.x + 3.5, d.y, d.x, d.y + 3); c.quadraticCurveTo(d.x - 3.5, d.y, d.x, d.y - 6); c.fill(); });
    }
    function hint(c) {
      if (held) return;
      const b = (x, y) => { const k = Math.sin(t * 4) * 3; c.fillStyle = '#1d2433'; c.beginPath(); c.moveTo(x - 6, y - 10 + k); c.lineTo(x + 6, y - 10 + k); c.lineTo(x, y + k); c.fill(); };
      if (![1, 2, 3].every((n) => wells[n].sol)) b(HOME.h2o2[0], HOME.h2o2[1] - 118);
      else if (![1, 2, 3].every((n) => wells[n].add)) b(HOME.drop[0], HOME.drop[1] - 56);
      else if (!tubes.B.add) b(HOME.raw[0], HOME.raw[1] - 36);
      else if (!flared.size) b(HOME.stick[0], HOME.stick[1] - 150);
    }

    let K = 1, OX = 0, OY = 0;
    function draw(c, W, H, dt) {
      for (let i = 0; i < 2; i++) step(dt / 2);
      c.fillStyle = '#c9cec7'; c.fillRect(0, 0, W, H);
      K = Math.min(W / VW, H / VH); OX = (W - VW * K) / 2; OY = (H - VH * K) / 2;
      c.save(); c.translate(OX, OY); c.scale(K, K);
      bg(c);
      beaker(c, HOME.water[0], HOME.water[1], 'water'); beaker(c, HOME.juice[0], HOME.juice[1], 'juice');
      ['raw', 'boil', 'liver'].forEach((k) => dish(c, HOME[k][0], HOME[k][1], k, true));
      // 드롭퍼 받침
      c.fillStyle = '#8b8f97'; c.fillRect(HOME.drop[0] - 18, SHELF - 6, 36, 6); c.fillRect(HOME.drop[0] - 2, 160, 4, SHELF - 166); c.fillRect(HOME.drop[0] - 14, 158, 28, 4);
      txt(c, '스포이트', HOME.drop[0], SHELF + 22 - 2 + 20, '#384255', F(700, 14));
      plate(c); rack(c);
      stick(c, items.stick);
      ['raw', 'boil', 'liver'].forEach((k) => { const o = items[k]; if (!o.used) piece(c, o.x, o.y - 12, k, held === o ? 1.15 : 1); });
      bottle(c, items.eth, 'eth'); bottle(c, items.h2o2, 'h2o2');
      dropper(c, items.drop);
      streamsDraw(c); hint(c);
      txt(c, '3 % 과산화 수소수', HOME.h2o2[0] + 2, SHELF + 40, '#7a1f12', F(700, 13));
      txt(c, '3 % 에탄올', HOME.eth[0] + 4, SHELF + 40, '#1f5f8a', F(700, 13));
      c.restore();
      out.classList.toggle('bad', !!bad && t - bad < 0.4);
    }

    const V = (p) => ({ x: (p.x - OX) / K, y: (p.y - OY) / K });
    function grab(v) {
      const o = items, hit = (k, dx, y0, y1) => Math.abs(v.x - o[k].x) < dx && v.y > o[k].y + y0 && v.y < o[k].y + y1;
      if (hit('drop', 16, -50, 74)) return o.drop;
      for (const k of ['raw', 'boil', 'liver']) if (!o[k].used && hit(k, 30, -30, 8)) return o[k];
      if (hit('h2o2', 32, -110, 4)) return o.h2o2;
      if (hit('eth', 32, -110, 4)) return o.eth;
      const tip = stickTip(o.stick); if (Math.abs(v.x - o.stick.x) < 24 && v.y > tip[1] - 16 && v.y < o.stick.y + 4) return o.stick;
      return null;
    }
    function release(o) {
      if (o.k === 'drop' && o.liq) {
        const n = wellAt(o.x, o.y + 100);
        if (n && dripInto(n, o.liq)) { o.park = { x: WPOS[n][0], y: WPOS[n][1] - 178, until: t + 1.6 }; o.squeeze = true; setTimeout(() => { o.squeeze = false; o.liq = null; }, 1500); say(`홈 ${n}에 ${NAME[o.liq]} 10방울 — 잘 지켜보자`); }
      }
      if (['raw', 'boil', 'liver'].includes(o.k)) { const k = tubeAt(o.x, o.y); if (k && pieceInto(k, o.k)) { o.used = true; say(`${k}에 ${NAME[o.k]}을(를) 넣었다 — 기포를 지켜보자`); table(); } }
      if (o.k === 'stick') { o.ins = null; o.did = null; }
      if (o.k === 'h2o2' || o.k === 'eth') { o.tk = null; o.done = null; }
    }

    const S = P.make(stage, {
      draw,
      down(p) { const v = V(p), o = grab(v); if (!o) return; held = o; o.dx = o.x - v.x; o.dy = o.y - v.y; if (o.k === 'stick') { o.dx = 0; o.dy = -40; o.x = v.x; o.y = v.y - 40; } },
      move(p) { if (!held) return; const v = V(p); held.x = clamp(v.x + held.dx, 20, VW - 20); held.y = clamp(v.y + held.dy, 60, VH - 10); },
      up() { if (!held) return; const o = held; held = null; release(o); },
      key(e) {
        const k = e.key.toUpperCase();
        if ('123'.includes(k) && k.length === 1) { const n = +k, w = wells[n]; if (!w.sol) pourInto('well', WELL_RULE[n][0], n); else if (!w.add) { if (dripInto(n, WELL_RULE[n][1])) say(`홈 ${n}에 ${NAME[WELL_RULE[n][1]]} 10방울 — 잘 지켜보자`); } table(); steps(); return true; }
        if (TPOS[k]) {
          const tu = tubes[k];
          if (TUBE_RULE[k] && !tu.add) { if (pieceInto(k, TUBE_RULE[k])) { items[TUBE_RULE[k]].used = true; say(`${k}에 ${NAME[TUBE_RULE[k]]}을(를) 넣었다 — 기포를 지켜보자`); } }
          else if (!tu.spark) { if (tu.t0 < 0) tu.t0 = t; splint(k); }
          else pourInto('tube', 'h2o2', k);
          table(); steps(); return true;
        }
        if (k === '0') { reset(); return true; } return false;
      },
    });
    const state = () => ({
      wells: [1, 2, 3].map((n) => ({ sol: wells[n].sol, add: wells[n].add, res: wells[n].res, foam: +wells[n].foam.toFixed(2) })),
      tubes: Object.fromEntries(Object.values(tubes).map((u) => [u.id, { add: u.add, res: u.res, spark: u.spark, fuel: +u.fuel.toFixed(2), foam: +u.foam.toFixed(2), stop: u.stop }])),
      flared: [...flared], repoured: [...repoured], done: root.classList.contains('u-done'), msg,
    });
    reset();
    root.querySelector('.ct-reset').addEventListener('click', () => { reset(); S.kick(); });
    root._ct = {
      pour: (tg, liq) => { if (typeof tg === 'number') pourInto('well', liq, tg); else pourInto('tube', liq, tg); table(); steps(); S.kick(); return state(); },
      drip: (n, liq) => { dripInto(n, liq); S.kick(); return state(); },
      piece: (k) => { if (pieceInto(k, TUBE_RULE[k])) items[TUBE_RULE[k]].used = true; table(); S.kick(); return state(); },
      splint: (k) => { splint(k); S.kick(); return state(); },
      run: (sec) => { for (let i = 0; i < sec * 60; i++) step(1 / 60); S.kick(); return state(); },
      state, geo: () => ({ K, OX, OY, HOME, WPOS, TPOS }),
      toScreen: (x, y) => [OX + x * K, OY + y * K],
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Catalase = { mount };
})();
