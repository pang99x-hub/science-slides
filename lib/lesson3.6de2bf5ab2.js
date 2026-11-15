/* 2-2-3 3차시 「에너지 문제와 신재생 에너지」: 장마다 조각을 붙인다.
   예측(.share-opts)·확인 ○×(.qs)는 수업방 응답 모으기가 그대로 읽는다. 7장(#check3)의 data-word는 수업방 «한 낱말 묻기»에 미리 들어간다. */
(function () {
  'use strict';
  const { part } = window.Deck;
  const J = (...p) => window.RxT.join(...p);
  const dock = (root, cfg) => window.UDock.mount(root, cfg);
  const pick = (sel) => (root) => { const rows = [...root.querySelectorAll(sel)]; root.querySelector('.gv').addEventListener('gv-pick', (e) => rows.forEach((x) => x.classList.toggle('on', x.dataset.k === e.detail.b.dataset.row))); return window.RxT.gallery(root); };
  const single = (btns) => btns.forEach((b) => b.addEventListener('click', () => {
    const on = b.getAttribute('aria-pressed') !== 'true';
    btns.forEach((x) => x.setAttribute('aria-pressed', String(on && x === b)));
  }));
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const mix = (a, b, f) => { const A = hex(a), B = hex(b); return `rgb(${A.map((v, i) => Math.round(v + (B[i] - v) * f)).join(',')})`; };

  // 1. 표지: 시간이 흐르면 화석 연료가 줄고 이산화 탄소가 쌓인다. 신재생 에너지로 바꾸면 천천히 준다(정성적 그림)
  part('cover', (root) => {
    const svg = root.querySelector('.fu-svg'), q = (s) => svg.querySelector(s);
    const input = root.querySelector('#fu-time'), when = root.querySelector('.fu-when'), ren = root.querySelector('#fu-ren');
    const rotors = [...svg.querySelectorAll('.fu-rotor')];
    let useRen = false, ang = 0;
    function draw() {
      const t = Number(input.value) / 100, u = useRen ? 0.3 : 1;
      const left = Math.max(0, 1 - u * t * 1.02), co2 = Math.min(1, u * t * 1.1), out = left < 0.06;
      q('.fu-sa').setAttribute('stop-color', mix('#7fbde6', '#9a9a96', co2));
      q('.fu-sb').setAttribute('stop-color', mix('#d8eef8', '#d6c9a8', co2));
      q('.fu-co2').style.opacity = String(Math.min(1, co2 * 1.2));
      q('.fu-oil').setAttribute('rx', String(Math.max(4, 210 * left)));
      q('.fu-oilt').textContent = out ? '거의 바닥났다' : '땅속 화석 연료';
      q('.fu-tf').setAttribute('y', String(94 - (14 + 66 * co2))); q('.fu-tf').setAttribute('height', String(14 + 66 * co2));
      q('.fu-smoke').style.opacity = out ? '0' : String(useRen ? 0.35 : 0.9);
      q('.fu-ren').style.opacity = useRen ? '1' : '0';
      q('.fu-win').style.opacity = out && !useRen ? '.15' : '1';
      when.textContent = t < 0.15 ? '지금' : t < 0.5 ? '조금 뒤' : t < 0.85 ? '먼 뒤' : '먼 미래';
    }
    const loop = window.Stage.loop((dt) => { ang = (ang + dt * 120) % 360; rotors.forEach((r) => { const [x, y] = r.dataset.c.split(' '); r.setAttribute('transform', `rotate(${ang.toFixed(1)} ${x} ${y})`); }); });
    input.addEventListener('input', draw); input.addEventListener('keydown', (e) => e.stopPropagation());
    ren.addEventListener('click', () => { useRen = !useRen; ren.setAttribute('aria-pressed', String(useRen)); ren.textContent = useRen ? '신재생 에너지로 바꿈 ✓' : '신재생 에너지로 바꾸기'; draw(); });
    single([...root.querySelectorAll('.share-opts button')]);
    const answer = (on) => { svg.classList.toggle('with-def', on); root.querySelector('#pr-runout').classList.toggle('answer', on); };
    draw();
    return {
      setActive(on) { if (on && !window.Stage.reduce) loop.start(); else loop.stop(); },
      fragment(f, on) { if (f.dataset.anim === 'fu') answer(on); },
      sync(slide) { const f = slide.querySelector('[data-anim="fu"]'); answer(!!f && f.classList.contains('visible')); },
    };
  });

  part('sus', pick('.su-def'));
  part('regen', (root) => J(window.RegenBrake.mount(root), dock(root, {
    steps: ['가속하기', '브레이크로 멈추기', '일반 브레이크와 견주기'],
    on: ['#rg-gas', '#rg-brake, #rg-stop', '#rg-normal'],
    learn: '회생 제동은 느려질 때 <b>운동 에너지 → 전기 에너지</b>로 바꿔 전지에 모은다. 일반 브레이크는 열로 버린다.',
  })));
  part('harvest', (root) => J(window.EnergyHarvest.mount(root), dock(root, {
    steps: ['타일 밟기', '학생 무리 보내기', '30걸음 넘게 모으기'],
    on: ['.hv-tiles', '#hv-crowd', (r) => (parseInt(r.querySelector('.hv-n').textContent, 10) || 0) >= 30],
    learn: '한 걸음의 전기는 아주 작지만 많이 모으면 센서·안내판을 켠다 → <b>에너지 수확 기술</b>.',
  })));
  part('redef', pick('.re-def'));

  // 4. 분류: 카드를 상자에 끌어다(또는 카드 → 상자) 넣는다. 맞으면 상자에 들어가고 까닭이 뜬다
  part('sort', (root) => {
    const cards = [...root.querySelectorAll('.so-card')], bins = [...root.querySelectorAll('.so-bin')];
    const msg = root.querySelector('.so-msg'), score = root.querySelector('.so-score');
    const NAME = { new: '신에너지', re: '재생 에너지', no: '신재생 에너지가 아닌 것' };
    const HINT = { no: '땅속에서 캐내 쓰면 줄어드는 연료예요', re: '햇빛·물·바람·땅속 열·생물처럼 다시 생기는 것이에요', new: '연료를 새롭게 바꾸거나 수소를 쓰는 기술이에요' };
    const shake = (e) => { e.classList.remove('bad'); e.getBoundingClientRect(); e.classList.add('bad'); };
    const count = () => { const n = cards.filter((c) => c.classList.contains('placed')).length; score.textContent = n ? `넣은 카드 ${n} / ${cards.length}` : ''; if (n === cards.length) msg.textContent = '모두 넣었다! 화석·핵연료만 신재생 에너지가 아니다'; };
    function place(c, bin, quiet) {
      if (!bin) { msg.textContent = '상자 위에 놓아 보자'; return; }
      if (c.dataset.k === bin.dataset.k) {
        bin.querySelector('.so-in').appendChild(c); c.classList.add('placed'); c.setAttribute('aria-pressed', 'false'); c.tabIndex = -1;
        if (!quiet) { msg.textContent = `${c.textContent.trim()} → ${NAME[bin.dataset.k]}: ${c.dataset.why}`; if (window.gsap && !window.Deck.reduce) gsap.fromTo(c, { scale: 0.7 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' }); }
      } else { shake(c); shake(bin); msg.textContent = `다시 생각해 보자: ${HINT[c.dataset.k]}`; }
      count();
    }
    const drag = window.Drag.cards(cards, {
      find: (el) => el.closest('#sort .so-bin'),
      hover: (b) => bins.forEach((x) => x.classList.toggle('target', x === b)),
      drop: place,
      pick: (c) => { if (c) msg.textContent = `«${c.textContent.trim()}» 카드를 넣을 상자를 눌러요`; },
    });
    bins.forEach((b) => {
      const go = () => { if (drag.picked) { const c = drag.picked; drag.unpick(); place(c, b); } else msg.textContent = '먼저 카드를 골라요(끌어다 넣어도 돼요)'; };
      b.addEventListener('click', (e) => { if (!e.target.closest('.so-card')) go(); });
      b.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); go(); } });
    });
    root.querySelector('#so-all').addEventListener('click', () => { cards.filter((c) => !c.classList.contains('placed')).forEach((c) => place(c, bins.find((b) => b.dataset.k === c.dataset.k), true)); });
    return dock(root, {
      steps: ['카드 넣기', '다섯 장 넣기', '모두 넣기'],
      on: [(r) => r.querySelector('.so-card.placed'), (r) => r.querySelector('.so-card.placed') && r.querySelectorAll('.so-card.placed').length >= 5, (r) => cards.every((c) => c.classList.contains('placed'))],
      learn: '화석 연료와 핵연료만 빼면 모두 신재생 — <b>다시 채워지면 재생</b>, 연료를 새롭게 바꿔 쓰면 <b>신에너지</b>.',
    });
  });

  part('techs', (root) => J(window.RenewTech.mount(root), dock(root, {
    steps: ['해 끌기', '구름·바람 바꾸기', '하루 돌려 보기'],
    on: ['canvas[tabindex]', '.tc-wind, .tc-cards', '#tc-play'],
    learn: '햇빛·바람에 따라 <b>발전량이 들쭉날쭉</b>하다 → 전기를 저장하고 여러 에너지를 함께 쓴다.',
  })));
  part('future', (root) => J(window.FutureTech.mount(root), dock(root, {
    steps: ['수소 밸브 열기', '산소 밸브 열기', 'KSTAR 자기장 세게'],
    on: ['.fc-valve[data-g="h"]', '.fc-valve[data-g="o"]', '.tk-knob, .tk-dial'],
    learn: '연료 전지는 수소 + 산소로 <b>전기</b>와 물을 만든다. 핵융합은 가벼운 원자핵이 합쳐질 때의 에너지를 쓰려는 연구다.',
  })));
  part('game3', (root) => window.EnGame.mount(root, {
    id: 'renew', title: '40초 신재생 빨리 가르기', seconds: 40,
    intro: '신에너지? 재생 에너지? 둘 다 아님?<br>«게임 시작»을 누르자',
    endSay: '틀린 카드는 «다시 채워지나? 새로 바꿔 쓰는 기술인가?»로 다시 물어보자',
    items: [
      { q: '수소 에너지', a: 'new', why: '물·유기 물질에서 수소를 만들어 쓰는 새 기술.' },
      { q: '연료 전지', a: 'new', why: '수소와 산소로 전기를 만드는 장치 → 신에너지.' },
      { q: '석탄 액화·가스화', a: 'new', why: '화석 연료를 액체·기체로 «바꿔» 쓴다 → 신에너지.' },
      { q: '수소 연료 전지 버스', a: 'new', why: '연료 전지로 달린다 → 신에너지.' },
      { q: '태양광 발전', a: 're', why: '햇빛은 다시 온다 → 재생 에너지.' },
      { q: '태양열 집열판', a: 're', why: '햇빛의 열 → 재생 에너지.' },
      { q: '풍력 발전', a: 're', why: '바람은 다시 분다 → 재생 에너지.' },
      { q: '시화호 조력 발전', a: 're', why: '밀물·썰물은 날마다 되풀이된다 → 재생(해양).' },
      { q: '아이슬란드 지열 발전', a: 're', why: '땅속 열 → 재생 에너지.' },
      { q: '태양 전지 버스 정류장', a: 're', why: '태양광으로 충전한다 → 재생 에너지.' },
      { q: '수도꼭지 수력 온도계', a: 're', why: '흐르는 물의 힘(소형 수력) → 재생 에너지.' },
      { q: '석유 화력 발전', a: 'no', why: '화석 연료를 그대로 태운다 → 아님.' },
      { q: '천연가스 보일러', a: 'no', why: '화석 연료 → 신재생 에너지가 아니다.' },
      { q: '우라늄 핵발전', a: 'no', why: '핵연료 → 신재생 에너지에 넣지 않는다.' },
      { q: '석탄 화력 발전', a: 'no', why: '캐내 쓰면 줄어드는 화석 연료.' },
    ],
  }));
  part('sum3', (root) => window.RxT.sum(root));
  part('check3', (root) => { window.LessonParts.mountWrap(root); });
})();
