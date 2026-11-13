/* 탐구 ② 2100년 뉴스(교과서 91쪽 과정 2, 90쪽 예시 답안): 상황 A·B를 고르고, 섞인 카드 다섯 장을 위아래로 끌어
   원인 → 대기 → 지구계 → 생태계 → 사람 생활 순서로 놓는다(카드를 누른 뒤 ↑·↓ 키도). 순서가 맞으면 왼쪽 뉴스 화면이 장면마다 차례로 방송된다.
   숫자: A 기온 4 °C 넘게·배출량 약 3배, B 2070년대 후반 0 아래·1.5 °C 안팎은 교과서 90쪽 그래프에서 읽은 것. */
(function () {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const CARDS = {
 A:[['원인','높은 화석 연료 사용이 이어짐','fac'],['대기','탄소가 쌓여 온실 효과 강화','air'],['지구계','육지 빙하 감소·해수면 상승','ice'],['생태계','찬 바다에 살던 어종 감소','eco'],['사람 생활','어업·식량 대책을 바꿔야 함','life']],
 B:[['원인','화석 연료를 적극 줄임','fac'],['대기','탄소 증가와 온난화가 둔화','air'],['지구계','A에 비해 변화 폭이 작음','ice'],['생태계','서식지 이동의 부담이 감소','eco'],['사람 생활','감축을 이어 가며 해안에 대비','life']]
  };
  const ANCHOR = { A: '2100년 오늘의 뉴스입니다. 지난 80년 동안 무슨 일이 있었을까요?', B: '2100년 오늘의 뉴스입니다. 80년 전의 선택이 지구를 지켰습니다.' };

  function mount(root) {
    const list = root.querySelector('.nw-list'), tv = root.querySelector('.nw-tv'), cap = root.querySelector('.nw-cap'), now = root.querySelector('.nw-now');
    const pick = [...root.querySelectorAll('.nw-pick')];
    let sc = 'A', order = [], els = [], played = false, timer = 0;
    const H = 102;
    function deal(k) {
      sc = k; played = false; clearTimeout(timer);
      pick.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === k)));
      tv.className = 'nw-tv ' + k; tv.querySelectorAll('.nw-scene').forEach((x) => x.classList.remove('on'));
      cap.textContent = '카드를 인과 순서로 놓으면 방송이 시작된다';
      list.innerHTML = ''; els = [];
      // 맞는 순서가 아닌 섞임(늘 같게)
      order = [3, 0, 4, 2, 1];
      CARDS[k].forEach(([tag, txt], i) => {
        const c = document.createElement('div'); c.className = 'nw-card'; c.tabIndex = 0; c.dataset.i = i;
        c.innerHTML = `<span class="nw-tag">${tag}</span><span class="nw-t">${txt}</span><span class="nw-grip" aria-hidden="true">⋮⋮</span>`;
        c.setAttribute('aria-label', `${tag}: ${txt} (↑·↓로 옮기기)`);
        list.appendChild(c); els[i] = c; bind(c, i);
      });
      layout(true); check();
    }
    function layout(instant) {
      order.forEach((ci, slot) => { const c = els[ci]; if (c.classList.contains('drag')) return; c.style.transition = instant ? 'none' : ''; c.style.transform = `translateY(${slot * H}px)`; });
    }
    function check() {
      const ok = order.every((ci, s) => ci === s);
      els.forEach((c, i) => c.classList.toggle('ok', ok || order.indexOf(i) === i));
      const right = order.filter((ci, s) => ci === s).length;
      now.textContent = ok ? '인과 고리 완성 · 방송 중' : `${right} / 5장 제자리 · 원인에서 사람 생활까지`;
      now.classList.toggle('done', ok);
      if (ok && !played) play();
    }
    function play() {
      played = true;
      const scenes = [...tv.querySelectorAll('.nw-scene')];
      let i = -1;
      cap.textContent = ANCHOR[sc];
      const nextS = () => {
        i += 1; if (i >= 5) return;
        scenes.forEach((x, j) => x.classList.toggle('on', j <= i));
        cap.textContent = CARDS[sc][i][1];
        timer = setTimeout(nextS, window.Stage.reduce ? 0 : 2200);
      };
      timer = setTimeout(nextS, 1600);
    }
    function move(ci, to) {
      const from = order.indexOf(ci); to = clamp(to, 0, 4); if (from === to) return;
      order.splice(from, 1); order.splice(to, 0, ci); layout();
    }
    function bind(c, ci) {
      let on = false, y0 = 0, s0 = 0;
      c.addEventListener('pointerdown', (e) => { on = true; y0 = e.clientY; s0 = order.indexOf(ci); try { c.setPointerCapture(e.pointerId); } catch { /* 합성 */ } c.classList.add('drag'); e.stopPropagation(); });
      c.addEventListener('pointermove', (e) => {
        if (!on) return;
        const k = (window.Reveal && Reveal.getScale && Reveal.getScale()) || 1, dy = (e.clientY - y0) / k;
        c.style.transition = 'none'; c.style.transform = `translateY(${s0 * H + dy}px)`;
        move(ci, Math.round(s0 + dy / H));
      });
      const up = () => { if (!on) return; on = false; c.classList.remove('drag'); c.style.transition = ''; layout(); check(); };
      c.addEventListener('pointerup', up); c.addEventListener('pointercancel', up);
      c.addEventListener('keydown', (e) => { const d = { ArrowUp: -1, ArrowDown: 1 }[e.key]; if (d) { e.preventDefault(); e.stopPropagation(); move(ci, order.indexOf(ci) + d); check(); } });
    }
    pick.forEach((b) => b.addEventListener('click', () => deal(b.dataset.k)));
    root.querySelector('.nw-shuffle').addEventListener('click', () => deal(sc));
    deal('A');
    root._nw = { deal, solve() { order = [0, 1, 2, 3, 4]; layout(); check(); }, move: (ci, to) => { move(ci, to); check(); } };
    return { setActive(on) { if (!on) clearTimeout(timer); } };
  }
  window.News = { mount };
})();
