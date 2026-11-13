/* 2-1 2차시 체험 «내 몸 원소의 고향»(교과서 59쪽 탐구 + 참고서 48쪽). 위: 우주·지구·사람을 이루는 원소 고리 그래프(교과서 값).
   아래 원소 카드(사람의 수소·산소·탄소, 지구의 철·규소, 반지의 금, 풍선의 헬륨, 뼈의 칼슘)를 끌어 네 «고향» 칸
   (빅뱅 / 별 속 핵융합 / 무거운 별 / 초신성)에 넣는다. 맞으면 칸에 들어가 그래프의 그 조각이 고향 색으로 빛나고, 틀리면 튕겨 나오며 까닭.
   카드를 누른 뒤 칸을 눌러도 된다(키보드). Origin.mount(root) → { fit, setActive } · 시험용: root._og.drop(카드 번호, 고향) */
(function () {
  'use strict';
  const D = [
    ['우주', [['수소', 74], ['헬륨', 24], ['기타', 2]]],
    ['지구', [['철', 35], ['산소', 30], ['규소', 15], ['마그네슘', 13], ['니켈', 2.4], ['황', 1.9], ['칼슘', 1.1], ['알루미늄', 1.1], ['기타', 0.5]]],
    ['사람', [['산소', 65], ['탄소', 18.5], ['수소', 9.5], ['질소', 3.3], ['칼슘', 1.5], ['인', 1.0], ['기타', 1.2]]],
  ];
  const HC = { bb: '#f6c445', star: '#5cc77a', big: '#c7a0f0', sn: '#ef5b4c' };
  const WHY = {
    bb: '빅뱅 직후 우주 초기에 생겼다', star: '별 속 핵융합으로 — 태양 정도 별도 만든다', big: '태양보다 훨씬 무거운 별 속 핵융합으로', sn: '철보다 무거워 초신성 폭발 때 생겼다',
  };
  function mount(root) {
    const stage = root.querySelector('.og-stage'), out = root.querySelector('.og-out'), now = root.querySelector('.og-now');
    const cards = [...root.querySelectorAll('.og-card')], bins = [...root.querySelectorAll('.og-bin')];
    const P = window.Play, lit = new Set(), litCol = {}; let pulse = 0;
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        pulse += dt;
        c.fillStyle = '#fbfaf5'; c.fillRect(0, 0, W, H);
        D.forEach(([name, parts], i) => {
          const cx = W * (0.17 + i * 0.33), cy = H * 0.5, R = Math.min(W * 0.14, H * 0.4); let a = -Math.PI / 2;
          parts.forEach(([el, v]) => {
            const da = v / 100 * Math.PI * 2, key = `${i}:${el}`, on = lit.has(key);
            c.fillStyle = on ? litCol[key] : '#d9dde3';
            c.beginPath(); c.moveTo(cx, cy); c.arc(cx, cy, on ? R * (1.04 + 0.03 * Math.sin(pulse * 4)) : R, a, a + da); c.closePath(); c.fill();
            c.strokeStyle = '#fbfaf5'; c.lineWidth = 2; c.stroke();
            if (v >= 9) { const m = a + da / 2; P.txt(c, el, cx + Math.cos(m) * R * 0.72, cy + Math.sin(m) * R * 0.72 + 4, '#1d2433', '800 20px'); P.txt(c, `${v}%`, cx + Math.cos(m) * R * 0.72, cy + Math.sin(m) * R * 0.72 + 24, '#1d2433', '600 16px'); }
            a += da;
          });
          c.fillStyle = '#fbfaf5'; c.beginPath(); c.arc(cx, cy, R * 0.32, 0, Math.PI * 2); c.fill();
          P.txt(c, name, cx, cy + 9, '#1d2433', '800 26px');
        });
      },
    });
    let done = 0;
    function steps() {
      const ok = []; if (done >= 1) ok.push(1); if (done >= 4) ok.push(2); if (done >= cards.length) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      now.textContent = st === 1 ? '① 원소 카드를 끌어 고향 칸에 넣자' : st === 2 ? '② 넷 이상 넣어 보자' : st === 3 ? '③ 남은 카드도 모두' : '지구와 생명의 원소 = 빅뱅과 별의 선물';
      now.classList.toggle('done', st === 0);
    }
    function drop(card, bin) {
      bins.forEach((b) => b.classList.remove('hover'));
      if (!bin) return;
      const h = card.dataset.h, ok = bin.dataset.h === h;
      if (!ok) { card.classList.remove('bad'); void card.offsetWidth; card.classList.add('bad'); out.innerHTML = `<b>${card.dataset.n}</b>은(는) 여기가 아니다 — 힌트: ${card.dataset.hint}`; return; }
      card.classList.add('used'); card.setAttribute('aria-disabled', 'true');
      const chip = document.createElement('span'); chip.className = 'og-chip'; chip.textContent = card.dataset.n; bin.querySelector('.og-list').appendChild(chip);
      if (card.dataset.k) { lit.add(card.dataset.k); litCol[card.dataset.k] = HC[h]; }
      done += 1; out.innerHTML = `<b>${card.dataset.n}</b> → ${WHY[h]}`;
      window.RxT.jolt(stage, 1); S.kick(); steps();
    }
    const dr = window.Drag.cards(cards, { find: (el) => el.closest('.og-bin'), drop, hover: (b) => bins.forEach((x) => x.classList.toggle('hover', x === b)) });
    bins.forEach((b) => b.addEventListener('click', () => { if (dr.picked) { const c = dr.picked; dr.unpick(); drop(c, b); } }));
    steps();
    root._og = { drop: (i, h) => drop(cards[i], bins.find((b) => b.dataset.h === h)) };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Origin = { mount };
})();
