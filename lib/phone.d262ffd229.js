/* 휴대 전화의 에너지 전환(교과서 그림 Ⅱ-26을 직접 써 보게 다시 그림).
   충전기를 꽂으면(단추 또는 충전기 줄 끝을 휴대 전화 아래로 끌기) 전기 → 화학(전지)으로 전지 눈금이 오른다.
   화면에서 밝기 막대·음악·진동을 누르면 전지(화학) → 전기 → 빛·소리·운동으로 갈라지고, 무엇을 켜든 열 띠가 함께 흐른다.
   많이 켤수록 전지가 빨리 닳고 휴대 전화가 달아오른다. 전지가 다 닳으면 꺼진다.
   에너지 장부: 측정기(빛·소리·떨림·온도)를 끌어 에너지 거품에 대고 «100 J 써 보기»를 누르면, 지금 설정으로 전기 100 J을 쓰는 동안
   댄 측정기만 값을 재 장부에 적는다. 넷을 다 재면 합이 100 J(에너지 보존). 열을 빼면 모자란다. 값은 이해를 돕기 위한 예. */
(function () {
  'use strict';
  const PORT = { x: 826, y: 650 }, REST = { x: 612, y: 694 };
  const ec = (e, t) => `<i class="ec" style="--c: var(--e-${e})">${t}</i>`;

  function mount(root) {
    const stage = root.querySelector('.ph-stage'), svg = stage.querySelector('.ph-svg'), q = (s) => svg.querySelector(s);
    const ui = stage.querySelector('.ph-ui'), pct = ui.querySelector('.ph-pct'), batt = ui.querySelector('.ph-bat'), battB = ui.querySelector('.ph-bat b');
    const chg = ui.querySelector('.ph-chg'), sum = stage.querySelector('.ph-sum');
    const bri = stage.querySelector('#ph-bright'), music = stage.querySelector('#ph-music'), vib = stage.querySelector('#ph-vib'), plugBtn = stage.querySelector('#ph-plug');
    const phone = q('.ph-phone'), screen = q('.ph-screen'), heatG = q('.ph-heatglow'), lightG = q('.ph-lightg'), hw = q('.ph-hw');
    const cable = q('.ph-cable'), cflow = q('.ph-cflow'), plugEnd = q('.ph-plugend'), head = q('.ph-plughead');
    const bands = Object.fromEntries([...svg.querySelectorAll('.ph-band')].map((b) => [b.dataset.e, b]));
    const bubs = Object.fromEntries([...svg.querySelectorAll('.ph-bub')].map((b) => [b.dataset.e, b]));
    const lens = Object.fromEntries(Object.entries(bands).map(([k, b]) => [k, b.getTotalLength()]));
    const off = Object.fromEntries(Object.keys(bands).map((k) => [k, 0]));
    let level = 0.6, warm = 0, plugged = false, end = { ...REST }, dragging = false, last = '';
    let isMusic = false, isVib = false;

    function placeCable(p) {
      const d = `M132 610 C 300 630, ${p.x - 200} ${p.y + 74}, ${p.x} ${p.y + 24}`;
      cable.setAttribute('d', d); cflow.setAttribute('d', d);
      plugEnd.setAttribute('transform', `translate(${p.x - PORT.x} ${p.y - PORT.y})`);
    }
    function setPlug(on) {
      plugged = on; end = on ? { ...PORT } : { ...REST }; placeCable(end);
      plugBtn.setAttribute('aria-pressed', String(on)); plugBtn.textContent = on ? '충전기 뽑기' : '충전기 꽂기';
      if (!loop.on) paint(0);
    }
    const toggle = (b, set) => b.addEventListener('click', () => { const on = b.getAttribute('aria-pressed') !== 'true'; b.setAttribute('aria-pressed', String(on)); set(on); if (!loop.on) paint(0); });
    toggle(music, (on) => { isMusic = on; });
    toggle(vib, (on) => { isVib = on; });
    plugBtn.addEventListener('click', () => setPlug(!plugged));
    bri.addEventListener('input', () => { if (!loop.on) paint(0); });
    bri.addEventListener('keydown', (e) => e.stopPropagation());
    // 충전기 줄 끝 끌기
    const pt = (e) => { const r = svg.getBoundingClientRect(); return { x: (e.clientX - r.left) * 1652 / r.width, y: (e.clientY - r.top) * 736 / r.height }; };
    head.addEventListener('pointerdown', (e) => { dragging = true; head.setPointerCapture(e.pointerId); plugEnd.classList.add('drag'); plugged = false; e.stopPropagation(); });
    head.addEventListener('pointermove', (e) => { if (!dragging) return; const p = pt(e); end = { x: Math.max(160, Math.min(1500, p.x)), y: Math.max(300, Math.min(712, p.y)) }; placeCable(end); });
    const drop = () => { if (!dragging) return; dragging = false; plugEnd.classList.remove('drag'); setPlug(Math.hypot(end.x - PORT.x, end.y - PORT.y) < 90); };
    head.addEventListener('pointerup', drop); head.addEventListener('pointercancel', drop);

    function flow(k, rate, dir, dt) {
      const b = bands[k], on = rate > 0.01;
      b.classList.toggle('on', on);
      const w = 8 + 34 * Math.min(1, rate), gap = Math.max(18, w * 1.25);
      b.style.strokeWidth = String(w);
      b.style.strokeDasharray = on ? `2 ${gap.toFixed(1)}` : 'none';
      off[k] = (off[k] - dir * dt * (50 + 120 * rate)) % (gap + 2);
      b.style.strokeDashoffset = String(off[k]);
      if (bubs[k]) bubs[k].classList.toggle('on', on);
    }
    function paint(dt) {
      const alive = level > 0.005 || plugged;
      const L = alive ? Number(bri.value) / 100 * 0.55 : 0, S = alive && isMusic ? 0.38 : 0, K = alive && isVib ? 0.42 : 0;
      const use = L + S + K, heatUse = alive ? 0.08 + 0.4 * use : 0;
      const chargeIn = plugged ? 0.9 : 0, chargeHeat = plugged ? 0.12 : 0;
      const net = chargeIn - (use + heatUse);                       // 전지로 들어가는 몫(+) / 나가는 몫(−)
      level = Math.max(0, Math.min(1, level + net * dt * (net > 0 ? 0.035 : 0.012)));   // 쓸 때는 천천히 닳게(수업 중에 금방 꺼지지 않게)
      warm += ((heatUse + chargeHeat) * 1.5 - warm) * Math.min(1, dt * 0.6);
      flow('light', L, 1, dt); flow('sound', S, 1, dt); flow('kin', K, 1, dt);
      flow('heat', heatUse + chargeHeat, 1, dt);
      flow('chem', Math.abs(net) > 0.02 ? Math.min(1, Math.abs(net)) : 0, net > 0 ? 1 : -1, dt);
      bubs.elec.classList.toggle('on', plugged);
      cflow.classList.toggle('on', plugged);
      cflow.style.strokeDashoffset = String((Number(cflow.style.strokeDashoffset) || 0) - dt * 90);
      // 화면·몸체
      const lit = alive ? Number(bri.value) / 100 : 0;
      screen.style.fill = alive ? `hsl(208 70% ${14 + 80 * lit}%)` : '#0d1118';
      ui.classList.toggle('dim', lit < 0.38); ui.classList.toggle('off', !alive);
      lightG.style.opacity = String(lit * 0.9);
      heatG.style.opacity = String(Math.min(1, warm * 0.9)); hw.style.opacity = String(Math.min(1, Math.max(0, warm - 0.15) * 1.6));
      phone.classList.toggle('vib', K > 0); ui.classList.toggle('vib', K > 0); stage.classList.toggle('music', S > 0);
      pct.textContent = `${Math.round(level * 100)}%`; battB.style.width = `${Math.max(2, level * 86)}%`;
      batt.classList.toggle('low', level < 0.15);
      chg.textContent = plugged ? (level >= 0.999 ? '충전 완료' : '충전 중 ⚡') : alive ? '충전기를 꽂아 보세요' : '';
      const key = `${plugged}|${L > 0.01}|${S > 0}|${K > 0}|${alive}`;
      if (key !== last) {
        last = key;
        const outs = [L > 0.01 && ec('light', '빛'), S > 0 && ec('sound', '소리'), K > 0 && ec('kin', '운동'), alive && ec('heat', '열')].filter(Boolean).join(' ');
        sum.innerHTML = !alive ? '전지가 다 닳아 꺼졌어요 — 충전기를 꽂아 보세요'
          : plugged ? `충전 ${ec('elec', '전기')}→${ec('chem', '화학')} 전지${use > 0.01 ? ` · 쓰는 중 → ${outs}` : ''}`
          : `${ec('chem', '화학')} 전지 → ${ec('elec', '전기')} → ${outs}`;
      }
    }
    // ---------- 에너지 장부 ----------
    const NS = 'http://www.w3.org/2000/svg', NAME = { light: '빛', sound: '소리', kin: '운동', heat: '열' }, ORDER = ['light', 'sound', 'kin', 'heat'];
    const meters = [...root.querySelectorAll('.ph-meter')], ledger = stage.querySelector('.ph-ledger');
    const rows = Object.fromEntries([...ledger.querySelectorAll('.lg-row')].map((r) => [r.dataset.e, r]));
    const lgSum = ledger.querySelector('.lg-sum em'), lgSay = ledger.querySelector('.lg-say'), runsEl = root.querySelector('.ph-runs'), runBtn = root.querySelector('#ph-run');
    const metered = new Set(), vals = {};
    ORDER.forEach((e) => { const t = document.createElementNS(NS, 'text'); t.setAttribute('class', 'ph-val'); t.setAttribute('y', '-34'); bubs[e].appendChild(t); vals[e] = t; });
    const shake = (el) => { el.classList.remove('bad'); el.getBoundingClientRect(); el.classList.add('bad'); };
    let fullRuns = 0, running = false;
    function attach(m, bub) {
      if (!bub || !NAME[bub.dataset.e]) { lgSay.textContent = '빛·소리·운동·열 거품 위에 대 보자'; return; }
      const e = bub.dataset.e;
      if (e !== m.dataset.e) { shake(m); lgSay.textContent = `${m.textContent.replace(/^\S+ /, '')}로는 ${NAME[e]} 에너지를 잴 수 없다`; return; }
      metered.add(e); m.classList.add('used'); bub.classList.add('metered'); vals[e].textContent = '측정기 ✓';
      lgSay.textContent = `${NAME[e]} 거품에 측정기를 댔다 — «100 J 써 보기»로 재 보자`;
    }
    const mdrag = window.Drag.cards(meters, {
      find: (x) => (x.closest ? x.closest('.ph-bub') : null),
      hover: (b) => ORDER.forEach((e) => bubs[e].classList.toggle('target', bubs[e] === b)),
      drop: attach,
      pick: (m) => { if (m) lgSay.textContent = '이 측정기를 댈 거품을 눌러요'; },
    });
    ORDER.forEach((e) => bubs[e].addEventListener('click', () => { if (mdrag.picked) { const m = mdrag.picked; mdrag.unpick(); attach(m, bubs[e]); } }));
    // 지금 설정으로 100 J을 쓸 때의 몫(합이 꼭 100이 되게 큰 나머지부터 1씩). 열은 대기 전력 + 전환마다 생기는 열이라 0이 되지 않는다
    function shares() {
      const w = { light: 0.5 * Number(bri.value), sound: isMusic ? 26 : 0, kin: isVib ? 30 : 0 };
      w.heat = 12 + 0.45 * (w.light + w.sound + w.kin);
      const tot = ORDER.reduce((a, k) => a + w[k], 0), raw = ORDER.map((k) => [k, w[k] / tot * 100]);
      const out = Object.fromEntries(raw.map(([k, v]) => [k, Math.floor(v)]));
      let left = 100 - ORDER.reduce((a, k) => a + out[k], 0);
      raw.sort((a, b) => (b[1] % 1) - (a[1] % 1)).forEach(([k]) => { if (left > 0) { out[k]++; left--; } });
      return out;
    }
    function show(v, f) {
      let sumV = 0;
      ORDER.forEach((e) => {
        const has = metered.has(e), n = Math.round(v[e] * f);
        rows[e].querySelector('em').textContent = has ? `${n} J` : '?';
        rows[e].classList.toggle('on', has);
        if (has) { vals[e].textContent = `${n} J`; sumV += n; }
      });
      lgSum.textContent = `${sumV} J`;
      return sumV;
    }
    runBtn.addEventListener('click', () => {
      if (running) return;
      if (level <= 0.005 && !plugged) { lgSay.textContent = '전지가 다 닳았다 — 충전기를 먼저 꽂자'; return; }
      if (!metered.size) { lgSay.textContent = '측정기를 하나 이상 거품에 대고 써 보자'; shake(runBtn); return; }
      const v = shares(); running = true; runBtn.disabled = true; ledger.classList.remove('done', 'short');
      const fin = () => {
        running = false; runBtn.disabled = false;
        const got = show(v, 1);
        if (metered.size === 4) {
          fullRuns++; ledger.classList.add('done');
          lgSay.textContent = `${ORDER.map((e) => `${NAME[e]} ${v[e]}`).join(' + ')} = 100 J — 들어간 만큼 나왔다!`;
          runsEl.textContent = fullRuns > 1 ? `${fullRuns}번 재 봤다 · 몫은 달라도 합은 늘 100 J` : '설정을 바꿔 한 번 더 써 보자';
        } else {
          ledger.classList.add('short');
          lgSay.textContent = `잰 합 ${got} J < 100 J — 나머지 ${100 - got} J은 어디로 갔을까?${metered.has('heat') ? '' : ' (휴대 전화를 만져 보면…)'}`;
        }
      };
      level = Math.max(0, level - 0.04);
      if (!window.gsap || window.Deck.reduce) { fin(); return; }
      const o = { f: 0 }; gsap.to(o, { f: 1, duration: 2.2, ease: 'power1.inOut', onUpdate: () => show(v, o.f), onComplete: fin });
    });

    // 그림(viewBox 1652×736)은 칸에 맞춰 줄고 가운데로 오므로, 화면 단추판도 같은 비율·같은 자리로 맞춘다
    const fitUI = () => {
      const W = stage.clientWidth, H = stage.clientHeight; if (!W || !H) return;
      const k = Math.min(W / 1652, H / 736), ox = (W - 1652 * k) / 2, oy = (H - 736 * k) / 2;
      ui.style.left = `${ox + 716 * k}px`; ui.style.top = `${oy + 156 * k}px`; ui.style.transform = `scale(${k})`;
    };
    if (typeof ResizeObserver === 'function') new ResizeObserver(fitUI).observe(stage);
    const loop = window.Stage.loop(paint);
    placeCable(end); paint(0); fitUI();
    return {
      setActive(on) { if (on && !window.Stage.reduce) loop.start(); else { loop.stop(); paint(0); } },
    };
  }
  window.PhoneLab = { mount };
})();
