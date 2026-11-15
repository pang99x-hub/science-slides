/* 2차시 표지(교과서 150쪽 도입): 휴대 전화 가입 화면의 동의 칸을 누르면 내 정보 조각(이름·주소·위치·구매 기록)이 서버로 가고 맞춤 추천이 뜬다.
   «가입한 서비스» 막대를 늘리면 내 정보를 가진 서버가 늘어난다. 서버 하나를 누르면 그곳에서 정보가 새어 모르는 사람에게 퍼진다. 모두 가상. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const [k, v] of Object.entries(a)) e.setAttribute(k, v); if (p) p.appendChild(e); return e; };
  const CHIPS = [['이름', '#3a78c2'], ['주소', '#2f9e5b'], ['위치', '#e2622b'], ['구매 기록', '#8d7ab8']];
  const SVC = ['쇼핑', '지도', '배달', '게임', '학습', '영상', '메신저', '운동'];

  function mount(root) {
    const svg = root.querySelector('.pv-svg'), now = root.querySelector('.pv-now'), range = root.querySelector('#pv-n'), vEl = root.querySelector('.pv-v');
    const gs = window.gsap, reduce = window.Deck.reduce || !gs;
    el('rect', { class: 'pv-bg', x: -200, y: -200, width: 1060, height: 780 }, svg);
    // 전화
    el('rect', { class: 'pv-phone', x: 20, y: 16, width: 196, height: 348, rx: 28 }, svg);
    el('rect', { class: 'pv-screen', x: 32, y: 44, width: 172, height: 296, rx: 10 }, svg);
    const form = el('g', { class: 'pv-form' }, svg);
    el('text', { class: 'pv-h', x: 118, y: 78 }, form).textContent = '회원 가입';
    [['이름', '한빛 (가상)', 104], ['주소', '○○시 ○○동', 150]].forEach(([k, v, y]) => { el('text', { class: 'pv-lab', x: 46, y }, form).textContent = k; el('rect', { class: 'pv-field', x: 44, y: y + 6, width: 148, height: 26, rx: 5 }, form); el('text', { class: 'pv-val', x: 52, y: y + 24 }, form).textContent = v; });
    const agree = el('g', { class: 'pv-agree', tabindex: '0', role: 'button', 'aria-label': '개인 정보 수집·이용에 동의하기' }, form);
    el('rect', { class: 'pv-ahit', x: 36, y: 206, width: 164, height: 92, rx: 10 }, agree);
    const box = el('rect', { class: 'pv-box', x: 46, y: 220, width: 28, height: 28, rx: 5 }, agree);
    const tick = el('path', { class: 'pv-tick', d: 'M51 234 l 7 7 l 12 -15' }, agree);
    el('text', { class: 'pv-at', x: 82, y: 232 }, agree).textContent = '개인 정보 수집·';
    el('text', { class: 'pv-at', x: 82, y: 252 }, agree).textContent = '이용에 동의합니다';
    el('text', { class: 'pv-small', x: 46, y: 284 }, agree).textContent = '이름·주소·위치·구매 기록';
    const reco = el('g', { class: 'pv-reco' }, svg);
    el('text', { class: 'pv-h', x: 118, y: 78 }, reco).textContent = '한빛 님 맞춤 추천';
    [['지난번 운동화와', '어울리는 양말', 98], ['집 근처', '새로 연 분식집', 178], ['자주 가는 길', '막히지 않는 길', 258]].forEach(([a, b, y]) => { el('rect', { class: 'pv-rc', x: 44, y, width: 148, height: 66, rx: 8 }, reco); el('text', { class: 'pv-rt', x: 56, y: y + 28 }, reco).textContent = a; el('text', { class: 'pv-rt b', x: 56, y: y + 50 }, reco).textContent = b; });
    // 서버(가입한 서비스)
    const servers = SVC.map((name, i) => {
      const x = 262 + (i % 4) * 98, y = 22 + Math.floor(i / 4) * 128;
      const g = el('g', { class: 'pv-srv', tabindex: '-1', role: 'button', 'aria-label': `${name} 서버` }, svg);
      el('rect', { class: 'pv-rack', x, y, width: 84, height: 100, rx: 8 }, g);
      [0, 1, 2].forEach((k) => el('path', { class: 'pv-slot', d: `M${x + 10} ${y + 22 + k * 18} h 40` }, g));
      el('text', { class: 'pv-sn', x: x + 42, y: y + 92 }, g).textContent = name;
      const dots = el('g', { class: 'pv-dots' }, g); CHIPS.forEach(([, c], k) => el('circle', { cx: x + 62, cy: y + 16 + k * 14, r: 5, fill: c }, dots));
      el('path', { class: 'pv-crack', d: `M${x + 20} ${y} l 12 26 l -10 14 l 16 22 l -6 18` }, g);
      return { g, x, y, dots };
    });
    const status = el('text', { class: 'pv-status', x: 456, y: 282 }, svg);
    // 모르는 사람들
    const strangers = [420, 500, 580].map((x) => { const g = el('g', { class: 'pv-man' }, svg); el('path', { d: `M${x - 18} 372 v -34 a 18 18 0 0 1 36 0 v 34 z` }, g); el('circle', { cx: x, cy: 316, r: 14 }, g); return g; });
    const fly = el('g', { class: 'pv-fly' }, svg);
    let agreed = false, leaked = 0;
    const chip = (x, y, i) => { const g = el('g', { class: 'pv-chip' }, fly); el('rect', { x: -38, y: -13, width: 76, height: 26, rx: 13, fill: CHIPS[i][1] }, g); el('text', { y: 6 }, g).textContent = CHIPS[i][0]; g.setAttribute('transform', `translate(${x} ${y})`); return g; };
    function count() { return agreed ? Number(range.value) : 0; }
    function paint() {
      const n = Number(range.value);
      vEl.textContent = `${n}곳`;
      servers.forEach((s, i) => { s.g.classList.toggle('on', i < n); s.g.classList.toggle('has', agreed && i < n); s.g.setAttribute('tabindex', agreed && i < n ? '0' : '-1'); });
      status.textContent = agreed ? `내 정보가 있는 곳: ${count()}곳${leaked ? ` · 새어 나간 곳: ${leaked}곳` : ''}` : '아직 동의하지 않았다';
      if (agreed && n > 1 && !leaked) now.textContent = '③ 서버 하나를 눌러 보자 — 그곳이 털린다면?';
    }
    function consent() {
      if (agreed) return;
      agreed = true; agree.classList.add('on'); tick.classList.add('on'); box.classList.add('on');
      now.textContent = '② 막대로 가입한 서비스를 늘려 보자';
      const s = servers[0];
      if (!reduce) CHIPS.forEach((_, i) => { const c = chip(118, 250, i); gs.to(c, { x: s.x + 42, y: s.y + 50, duration: 0.8, delay: i * 0.12, ease: 'power2.in', onComplete: () => c.remove() }); });
      setTimeout(() => { form.classList.add('gone'); reco.classList.add('on'); paint(); }, reduce ? 0 : 1100);
    }
    function leak(s) {
      if (!agreed || !s.g.classList.contains('has') || s.g.classList.contains('leak')) return;
      s.g.classList.add('leak'); leaked++;
      strangers.forEach((m) => m.classList.add('on'));
      if (!reduce) CHIPS.forEach((_, i) => { const c = chip(s.x + 42, s.y + 50, i), m = 420 + (i % 3) * 80; gs.to(c, { x: m, y: 336, duration: 0.9, delay: i * 0.1, ease: 'power1.inOut', onComplete: () => gs.to(c, { opacity: 0, duration: 0.6, delay: 0.8, onComplete: () => c.remove() }) }); });
      now.textContent = '한 곳만 새어도 내 정보가 모르는 사람에게 퍼진다';
      now.classList.add('done'); paint();
    }
    agree.addEventListener('click', consent);
    agree.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); consent(); } });
    servers.forEach((s) => { s.g.addEventListener('click', () => leak(s)); s.g.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); leak(s); } }); });
    range.addEventListener('input', paint); range.addEventListener('keydown', (e) => e.stopPropagation());
    paint();
    root._pv = { consent, n: (v) => { range.value = String(v); paint(); }, leak: (i) => leak(servers[i]) };
    return {};
  }
  window.Privacy = { mount };
})();
