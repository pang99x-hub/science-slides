/* 해 보기 «우리 주변의 에너지 전환»: 텔레비전·스피커·촛불.
   단추로 켜면 기구가 실제로 작동한다(화면 그림, 스피커 콘 떨림, 불꽃). 에너지 카드를 끌어다 들어가는·나오는 칸에 놓는다.
   «열화상 카메라»를 끌고 다니며 기구에 비추면 렌즈 안만 열화상으로 보인다. 켜 둔 기구는 몇 초에 걸쳐 달아오른다(버려지는 열).
   빛·소리만 채우고 열이 남으면 열화상 카메라로 비춰 보라고 알려 준다. */
(function () {
  'use strict';
  const NAME = { elec: '전기 에너지', chem: '화학 에너지', light: '빛에너지', sound: '소리 에너지', heat: '열에너지', kin: '운동 에너지' };
  const ig = (w) => ((w.charCodeAt(w.length - 1) - 0xac00) % 28 ? '이' : '가');   // 받침이 있으면 «이»
  const SHORT = { elec: '전기', chem: '화학', light: '빛', sound: '소리', heat: '열', kin: '운동' };
  const POW = { tv: ['전원 켜기', '전원 끄기'], spk: ['음악 틀기', '음악 끄기'], candle: ['불 붙이기', '불 끄기'] };
  const NO_IN = {
    tv: '텔레비전은 콘센트에 꽂혀 있어요. 콘센트에서 무엇이 들어올까요?',
    spk: '스피커도 콘센트에 꽂혀 있어요. 콘센트에서 무엇이 들어올까요?',
    candle: '초는 콘센트에 꽂지 않아요. 불이 붙어 타는 것은 초의 재료(파라핀)예요',
  };
  const NO_OUT = {
    elec: '전기 에너지는 들어가는 쪽이에요',
    chem: '화학 에너지는 물질 속에 저장된 에너지예요. 무엇이 나오는지 켜서 보자',
    kin: '기구가 움직여 다니지는 않아요. 무엇이 나오는지 켜서 보자',
    light: '이 기구에서 빛이 나나요? 켜서 보자',
    sound: '이 기구에서 소리가 나나요? 켜서 보자',
    heat: '',
  };

  function mount(root) {
    const cards = [...root.querySelectorAll('.dv-card')];
    const chips = [...root.querySelectorAll('.dv-chip')];
    const slots = [...root.querySelectorAll('.slot')];
    const msg = root.querySelector('.dv-msg'), body = root.querySelector('.dv-body'), cam = root.querySelector('.dv-cam');
    const placed = new Map(cards.map((c) => [c, new Set()]));          // 나오는 칸에 이미 놓은 에너지
    const say = (t) => { msg.textContent = t; };
    const pop = (el) => { if (window.gsap && !window.Deck.reduce) gsap.fromTo(el, { scale: 0.8 }, { scale: 1, duration: 0.35, ease: 'back.out(3)' }); };
    const shake = (el) => { el.classList.remove('bad'); el.getBoundingClientRect(); el.classList.add('bad'); };

    cards.forEach((c) => {
      const b = c.querySelector('.dv-pow'), [a, z] = POW[c.dataset.dev];
      b.addEventListener('click', () => {
        const on = !c.classList.contains('on');
        c.classList.toggle('on', on); b.setAttribute('aria-pressed', String(on)); b.textContent = on ? z : a;
        lens();
      });
    });
    // 열화상 카메라: 기구 그림마다 열화상 층(그림 사본 + 열 얼룩)을 깔고, 렌즈 동그라미 안만 보이게 오려 낸다
    const R = 92, layers = cards.map((c) => {
      const st = c.querySelector('.dv-stage'), lay = document.createElement('div');
      lay.className = 'dv-tlay'; lay.setAttribute('aria-hidden', 'true');
      lay.appendChild(st.querySelector('.dv-art').cloneNode(true)); lay.appendChild(st.querySelector('.dv-heat'));
      st.appendChild(lay); return { c, st, lay };
    });
    let cx = null, cy = null, lastSay = '', quiet = false;
    const scale = () => (window.Reveal && Reveal.getScale && Reveal.getScale()) || 1;
    function lens() {
      if (cx === null) return;
      const k = scale(), b = body.getBoundingClientRect();
      const px = b.left + cx * k, py = b.top + cy * k;                      // 렌즈 가운데(화면 좌표)
      let over = null;
      layers.forEach(({ c, st, lay }) => {
        const r = st.getBoundingClientRect(), lx = (px - r.left) / k, ly = (py - r.top) / k;
        lay.style.clipPath = `circle(${R}px at ${lx.toFixed(1)}px ${ly.toFixed(1)}px)`;
        if (px > r.left && px < r.right && py > r.top && py < r.bottom) over = c;
      });
      const t = !over ? '' : over.classList.contains('on') ? `${over.dataset.name}${ig(over.dataset.name)} 달아오른다 — 쓰려던 것이 아닌 열이 나온다` : `${over.dataset.name}${ig(over.dataset.name)} 꺼져 있어 차갑다. 켜고 잠깐 기다려 보자`;
      if (t && t !== lastSay) { lastSay = t; if (!quiet) say(t); }
    }
    function moveCam(x, y) {
      cx = Math.max(R, Math.min(body.clientWidth - R, x)); cy = Math.max(R, Math.min(body.clientHeight - 40, y));
      cam.style.transform = `translate(${(cx - R - 14).toFixed(1)}px, ${(cy - R - 14).toFixed(1)}px)`;
      lens();
    }
    let hold = null;
    cam.addEventListener('pointerdown', (e) => { hold = { x: e.clientX, y: e.clientY, cx, cy }; try { cam.setPointerCapture(e.pointerId); } catch { /* 합성 이벤트 */ } cam.classList.add('drag'); e.stopPropagation(); });
    cam.addEventListener('pointermove', (e) => { if (!hold) return; const k = scale(); moveCam(hold.cx + (e.clientX - hold.x) / k, hold.cy + (e.clientY - hold.y) / k); });
    const drop = () => { hold = null; cam.classList.remove('drag'); };
    cam.addEventListener('pointerup', drop); cam.addEventListener('pointercancel', drop);
    cam.addEventListener('keydown', (e) => {
      const d = { ArrowLeft: [-40, 0], ArrowRight: [40, 0], ArrowUp: [0, -40], ArrowDown: [0, 40] }[e.key];
      if (d) { e.preventDefault(); e.stopPropagation(); moveCam(cx + d[0], cy + d[1]); }
    });
    // 처음부터 펼친 채 촛불 칸 오른쪽 위에 둔다(접어 두면 단추처럼 보여 열화상 카메라인 줄 모른다). 처음 놓을 때는 안내 글을 바꾸지 않는다
    const place = () => {
      const r = layers[layers.length - 1].st.getBoundingClientRect(), b = body.getBoundingClientRect(), k = scale();
      quiet = true; moveCam((r.right - b.left) / k - R - 18, (r.top - b.top) / k + R + 18); quiet = false;
    };
    root._devices = { aim: (i) => { const r = layers[i].st.getBoundingClientRect(), b = body.getBoundingClientRect(), k = scale(); moveCam((r.left - b.left + r.width / 2) / k, (r.top - b.top + r.height * 0.4) / k); } };

    function fill(slot, e) {
      slot.dataset.e = e; slot.textContent = NAME[e];
      slot.style.setProperty('--c', `var(--e-${e})`); slot.classList.add('on');
      slot.setAttribute('aria-label', slot.getAttribute('aria-label').replace(/ 칸.*$/, ` 칸: ${NAME[e]}`));
      pop(slot);
    }
    function check(card) {
      const outs = card.dataset.out.split(' '), got = placed.get(card);
      const inOk = card.querySelector('.slot[data-slot="in"]').classList.contains('on');
      const left = outs.filter((e) => !got.has(e));
      const done = inOk && !left.length;
      card.classList.toggle('done', done);
      if (done) say(`${card.dataset.name} 완성! ${SHORT[card.dataset.in]} → ${outs.map((e) => SHORT[e]).join(' · ')}`);
      else if (left.length === 1 && left[0] === 'heat' && got.size) say(`${card.dataset.name}: 하나 더 남았어요. 열화상 카메라를 끌어다 비춰 볼까?`);
      if (cards.every((c) => c.classList.contains('done'))) say('셋 다 완성! 세 기구 모두에서 열에너지가 함께 나온다');
    }
    function tryDrop(chip, slot) {
      if (!slot) { say('칸 위에 놓아 보자'); return; }
      if (slot.classList.contains('on')) { say('이미 채운 칸이에요'); return; }
      const card = slot.closest('.dv-card'), e = chip.dataset.e, name = card.dataset.name;
      if (slot.dataset.slot === 'in') {
        if (e === card.dataset.in) { fill(slot, e); say(`맞아요: ${name}에는 ${NAME[e]}가 들어간다`); }
        else { shake(slot); shake(chip); say(NO_IN[card.dataset.dev]); }
      } else {
        const outs = card.dataset.out.split(' '), got = placed.get(card);
        if (got.has(e)) { shake(slot); say('이미 넣은 에너지예요. 다른 것도 나오나요?'); }
        else if (outs.includes(e)) { got.add(e); fill(slot, e); say(`맞아요: ${name}에서 ${NAME[e]}가 나온다`); }
        else { shake(slot); shake(chip); say(NO_OUT[e] || '다시 생각해 보자'); }
      }
      check(card);
    }
    const drag = window.Drag.cards(chips, {
      find: (el) => el.closest('#devices .slot'),
      hover: (s) => slots.forEach((x) => x.classList.toggle('target', x === s && !x.classList.contains('on'))),
      drop: tryDrop,
      pick: (c) => { if (c) say(`«${c.textContent}» 카드를 놓을 칸을 눌러요`); },
    });
    slots.forEach((s) => {
      const place = () => { if (drag.picked) { const c = drag.picked; drag.unpick(); tryDrop(c, s); } else if (!s.classList.contains('on')) say('먼저 아래 에너지 카드를 골라요(끌어다 놓아도 돼요)'); };
      s.addEventListener('click', place);
      s.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); place(); } });
    });
    root.querySelector('#dv-all').addEventListener('click', () => {
      cards.forEach((card) => {
        const inS = card.querySelector('.slot[data-slot="in"]');
        if (!inS.classList.contains('on')) fill(inS, card.dataset.in);
        const got = placed.get(card), free = [...card.querySelectorAll('.slot[data-slot="out"]:not(.on)')];
        card.dataset.out.split(' ').filter((e) => !got.has(e)).forEach((e, i) => { got.add(e); if (free[i]) fill(free[i], e); });
        check(card);
      });
    });
    return { setActive(on) { if (on && cx === null) requestAnimationFrame(place); else if (on) lens(); } };
  }
  window.DevicesLab = { mount };
})();
