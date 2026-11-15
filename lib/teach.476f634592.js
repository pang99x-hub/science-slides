/* 1-2-1 설명 장(1-1-2 teach.js를 가져와 단원 안에 둠) 공통 조작(1-1-1 teach1.js의 방식: «그림을 조작하면 풀이가 함께 바뀐다», 한 줄씩 나오기 없음).
   EvT.gallery(root)  작은 사진을 누르면 크게 + 이름·띠·풀이·출처가 바뀐다(.gv)
   EvT.stepper(root)  시간 막대·단계 단추로 정지 그림(.st-im)이 겹쳐 바뀌고, 지금 단계 풀이(.st-text li)가 카드에 나온다
   EvT.sum(root)      정리 «한눈에 보기» 뒤집기 카드(1-1-1 sum과 같음): 앞면 번호·제목만, 누르면 뒷면, «모두 뒤집기»

   시험용: root._gv.pick(i) · root._st.set(k) · root._sm.flip(i) / all() */
(function () {
  'use strict';
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const keys = (el, fn) => el.addEventListener('keydown', (e) => {
    const m = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: 1, ArrowDown: -1 }[e.key];
    if (m) { e.preventDefault(); e.stopPropagation(); fn(m); }
  });

  function gallery(root, sel = '.gv') {
    const gv = root.querySelector(sel);
    const big = gv.querySelector('.gv-img'), name = gv.querySelector('.gv-name'), kind = gv.querySelector('.gv-kind');
    const desc = gv.querySelector('.gv-d'), cr = gv.querySelector('.gv-cr');
    const btns = [...gv.querySelectorAll('.gv-thumbs button')];
    function pick(b) {
      btns.forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
      const im = b.querySelector('img');
      big.src = im.src; big.alt = im.alt;
      name.textContent = b.dataset.name;
      if (kind) { kind.textContent = b.dataset.chip || ''; kind.className = 'chip gv-kind ' + (b.dataset.kind || ''); kind.hidden = !b.dataset.chip; }
      desc.innerHTML = b.dataset.d; cr.textContent = '사진: ' + b.dataset.cr;
      gv.dispatchEvent(new CustomEvent('gv-pick', { detail: { i: btns.indexOf(b), b } }));
    }
    btns.forEach((b) => b.addEventListener('click', () => pick(b)));
    pick(btns[0]);
    (root._gv = root._gv || {})[sel] = { pick: (i) => pick(btns[i]) };
    if (sel === '.gv') root._gv.pick = (i) => pick(btns[i]);
    return {};
  }

  function stepper(root) {
    const ims = [...root.querySelectorAll('.st-im')], range = root.querySelector('.st-range'), pills = [...root.querySelectorAll('.st-pills button')];
    const tag = root.querySelector('.st-tag'), nm = root.querySelector('.st-name'), d = root.querySelector('.st-d');
    const items = [...root.querySelectorAll('.st-text li')].map((li) => ({ n: li.querySelector('h4').innerHTML, d: li.querySelector('p').innerHTML }));
    const N = (ims.length || items.length) - 1;
    let cur = -1, active = false;
    // Manim 애니메이션: 단계를 고르면 처음부터 한 번 재생하고 마지막 장면에서 멈춘다(포스터 = 마지막 장면)
    const vids = ims.map((im) => (im.tagName === 'VIDEO' ? im : null));
    const play = (k) => vids.forEach((vd, i) => {
      if (!vd) return;
      if (i === k && active) { try { vd.currentTime = 0; } catch (e) { /* 아직 못 읽음 */ } vd.play().catch(() => {}); } else vd.pause();
    });
    const again = root.querySelector('.st-again');
    if (again) again.addEventListener('click', () => play(cur));
    function set(v, snap) {
      v = clamp(v, 0, N); if (snap) v = Math.round(v);
      range.value = String(v);
      if (range.max !== String(N)) range.max = String(N);
      ims.forEach((im, k) => { im.style.opacity = String(clamp(1 - Math.abs(v - k), 0, 1)); });
      const k = Math.round(v);
      pills.forEach((b, i) => { b.setAttribute('aria-pressed', String(i === k)); b.classList.toggle('past', i < k); });
      if (k !== cur) { cur = k; play(k); tag.textContent = `${k + 1}단계 / ${N + 1}`; nm.innerHTML = items[k].n; d.innerHTML = items[k].d; root.dispatchEvent(new CustomEvent('st-step', { detail: k })); }
    }
    range.addEventListener('input', () => set(+range.value));
    range.addEventListener('change', () => set(+range.value, true));
    keys(range, (dx) => set(Math.round(+range.value) + dx, true));
    pills.forEach((b, i) => b.addEventListener('click', () => set(i, true)));
    set(0, true);
    root._st = { set: (k) => set(k, true), vids };
    return { setActive(on) { active = !!on; play(on ? cur : -1); } };
  }

  function sum(root) {
    const boxes = [...root.querySelectorAll('.sbox')];
    boxes.forEach((b) => {
      if (b.querySelector('.fc')) return;
      const h3 = b.querySelector('h3');
      const back = document.createElement('div'); back.className = 'fc-face fc-back';
      while (b.firstChild) back.appendChild(b.firstChild);
      const front = document.createElement('div'); front.className = 'fc-face fc-front';
      front.innerHTML = `<h3>${h3.innerHTML}</h3>`;
      const fc = document.createElement('div'); fc.className = 'fc';
      fc.append(front, back); b.append(fc);
      b.classList.add('flip'); b.tabIndex = 0; b.setAttribute('role', 'button'); b.setAttribute('aria-pressed', 'false');
      const turn = () => { const on = !b.classList.contains('flipped'); b.classList.toggle('flipped', on); b.setAttribute('aria-pressed', String(on)); sync(); };
      b.addEventListener('click', turn);
      b.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); turn(); } });
    });
    const head = root.querySelector('.head');
    let all = root.querySelector('.fc-all');
    if (!all) { all = document.createElement('button'); all.type = 'button'; all.className = 'btn fc-all'; head.appendChild(all); }
    function sync() { const n = boxes.filter((b) => b.classList.contains('flipped')).length; all.textContent = n === boxes.length ? '모두 덮기' : '모두 뒤집기'; }
    all.onclick = () => { const open = boxes.some((b) => !b.classList.contains('flipped')); boxes.forEach((b) => { b.classList.toggle('flipped', open); b.setAttribute('aria-pressed', String(open)); }); sync(); };
    sync();
    root._sm = { flip: (i) => boxes[i].click(), all: () => all.click() };
    return {};
  }

  window.RxT = { gallery, stepper, sum };
})();
/* 사건 순간 흔들림 + 휴대폰 진동(1-1-1 plate3d.js 방식, 선생님이 좋아한 연출): RxT.jolt(무대, 세기 1~3) */
(function () {
  'use strict';
  const buzz = (pat) => { try { if (navigator.vibrate) navigator.vibrate(pat); } catch { /* 막힌 곳 */ } };
  window.RxT.jolt = (stage, k = 2) => {
    if (!stage) return;
    stage.classList.remove('rx-j1', 'rx-j2', 'rx-j3'); void stage.offsetWidth; stage.classList.add('rx-j' + k);
    buzz(k === 3 ? [140, 50, 220] : k === 2 ? [90, 40, 90] : [40]);
  };
})();
