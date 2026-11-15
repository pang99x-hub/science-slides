/* 2-1 «문제로 다지기» 장: 개념을 배운 뒤 풀어 보는 문제를 한 장에 한 문제씩 넘겨 본다(참고서 문제를 수업용으로 다시 씀).
   문제 = { q, strips?: [{ label, mode: 'emit'|'abs'|'cont', lines }], box?: [보기 줄…], opts: [보기…], a: 정답 번호(0부터), why }
   고르면 바로 맞음·틀림 + 풀이, «다음 문제». 띠 그림은 Spec.band로 그린다. 오른쪽 칸 맞힌 개수.
   Drill.mount(root, items) → { fit } · 시험용: root._dr.go(i) · pick(k) */
(function () {
  'use strict';
  const NO = '①②③④⑤⑥';
  function mount(root, items) {
    const card = root.querySelector('.dr-card'), nav = root.querySelector('.dr-nav'), score = root.querySelector('.dr-score');
    const prevB = root.querySelector('.dr-prev'), nextB = root.querySelector('.dr-next');
    const done = items.map(() => null);
    let i = 0;
    const dots = items.map((_, k) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = String(k + 1); b.setAttribute('aria-label', `${k + 1}번 문제`); b.addEventListener('click', () => go(k)); nav.appendChild(b); return b; });
    function strips(host, ss) {
      ss.forEach((s) => {
        const row = document.createElement('div'); row.className = 'dr-strip';
        const lab = document.createElement('b'); lab.textContent = s.label; row.appendChild(lab);
        const cv = document.createElement('canvas'); cv.width = 1200; cv.height = 70; cv.setAttribute('aria-label', `${s.label} 스펙트럼`); row.appendChild(cv);
        host.appendChild(row);
        window.Spec.band(cv.getContext('2d'), 0, 0, 1200, 70, { mode: s.mode, lines: s.lines, glow: false });
      });
    }
    function render() {
      const it = items[i], got = done[i];
      card.innerHTML = '';
      const q = document.createElement('p'); q.className = 'dr-q'; q.innerHTML = `<span class="dr-n">${i + 1}</span>${it.q}`; card.appendChild(q);
      if (it.strips) { const f = document.createElement('div'); f.className = 'dr-fig'; card.appendChild(f); strips(f, it.strips); }
      if (it.box) { const bx = document.createElement('div'); bx.className = 'dr-box'; bx.innerHTML = '<span>보기</span>' + it.box.map((t) => `<p>${t}</p>`).join(''); card.appendChild(bx); }
      const ol = document.createElement('div'); ol.className = 'dr-opts' + (it.opts.some((o) => o.length > 18) ? ' long' : ''); card.appendChild(ol);
      it.opts.forEach((o, k) => {
        const b = document.createElement('button'); b.type = 'button'; b.innerHTML = `<span>${NO[k]}</span>${o}`;
        if (got != null) { b.disabled = true; if (k === it.a) b.classList.add('ok'); else if (k === got) b.classList.add('no'); }
        b.addEventListener('click', () => pick(k)); ol.appendChild(b);
      });
      const w = document.createElement('p'); w.className = 'dr-why'; w.setAttribute('aria-live', 'polite');
      if (got != null) { w.classList.add(got === it.a ? 'ok' : 'no'); w.innerHTML = `<b>${got === it.a ? '맞았어요' : `정답 ${NO[it.a]}`}</b> ${it.why}`; }
      card.appendChild(w);
      dots.forEach((d, k) => { d.setAttribute('aria-current', String(k === i)); d.classList.toggle('ok', done[k] != null && done[k] === items[k].a); d.classList.toggle('no', done[k] != null && done[k] !== items[k].a); });
      prevB.disabled = i === 0; nextB.disabled = i === items.length - 1;
      const n = done.filter((d, k) => d != null && d === items[k].a).length, tried = done.filter((d) => d != null).length;
      score.innerHTML = `푼 문제 <b>${tried}</b> / ${items.length} · 맞힌 문제 <b>${n}</b>`;
      const ok = []; if (tried >= 1) ok.push(1); if (tried >= Math.ceil(items.length / 2)) ok.push(2); if (tried === items.length) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
    }
    function pick(k) { if (done[i] != null) return; done[i] = k; render(); }
    function go(k) { i = Math.max(0, Math.min(items.length - 1, k)); render(); }
    prevB.addEventListener('click', () => go(i - 1)); nextB.addEventListener('click', () => go(i + 1));
    render();
    root._dr = { go, pick };
    return {};
  }
  window.Drill = { mount };
})();
