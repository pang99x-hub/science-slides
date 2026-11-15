/* 3-2 체험 장 공통 틀(2-1-1 frame.js를 가져와 단원 안에 둠: 실행 중 다른 단원 파일을 읽지 않는다).
   오른쪽 칸 해 볼 일 ①②③(.u-steps), 끝나면 «알게 된 것»(.u-learn). 영상 덮개(.u-vbtn → .u-vid).
   L1.steps(root, 지금 단계, [끝난 번호…]) · L1.done(root, 끝났나) · L1.frame(root) → 장 조각
   L1.watch(root, map): 기존 조작 모듈이 쓰는 «지금 할 것» 칩(.ev-now)의 글과 done 표시를 읽어 해 볼 일 단계를 맞춘다.
     map(글, 끝났나) → 지금 단계 번호(없으면 그대로). 기본: 글 앞의 ①②③④⑤. */
(function () {
  'use strict';
  function steps(root, now, ok) {
    root.querySelectorAll('.u-steps li').forEach((li) => {
      const n = +li.dataset.s;
      li.classList.toggle('now', n === now);
      li.classList.toggle('ok', ok.includes(n));
    });
  }
  function done(root, on) {
    if (root.classList.contains('u-done') === !!on) return;
    root.classList.toggle('u-done', !!on);
    const b = root.querySelector('.u-vbtn');
    if (b && on) { b.classList.remove('pulse'); void b.offsetWidth; b.classList.add('pulse'); }
  }
  function frame(root) {
    const vbtn = root.querySelector('.u-vbtn'), box = root.querySelector('.u-vid'), video = box && box.querySelector('video');
    const open = (on) => {
      if (!box) return;
      box.hidden = !on;
      if (vbtn) vbtn.setAttribute('aria-expanded', String(on));
      if (on) { try { video.currentTime = 0; } catch { /* 아직 못 읽음 */ } video.play().catch(() => {}); } else video.pause();
    };
    if (vbtn) vbtn.addEventListener('click', () => open(box.hidden));
    if (box) {
      box.querySelector('.u-vclose').addEventListener('click', () => open(false));
      box.querySelector('.u-vagain').addEventListener('click', () => { video.currentTime = 0; video.play().catch(() => {}); });
    }
    root._frame = { open };
    return { setActive(on) { if (!on) open(false); } };
  }
  const DIG = '①②③④⑤⑥';
  function watch(root, map) {
    const now = root.querySelector('.ev-now'); if (!now) return {};
    const all = [...root.querySelectorAll('.u-steps li')].map((li) => +li.dataset.s);
    let cur = 1;
    const upd = () => {
      const fin = now.classList.contains('done'), t = now.textContent.trim();
      if (fin) { steps(root, 0, all); done(root, true); return; }
      let n = map ? map(t, fin) : null;
      if (n === 0) { steps(root, 0, all); done(root, true); return; }
      if (n == null) { const i = DIG.indexOf(t[0]); if (i >= 0) n = i + 1; }
      if (n != null) cur = Math.min(n, Math.max(...all));
      steps(root, cur, all.filter((k) => k < cur)); done(root, false);
    };
    new MutationObserver(upd).observe(now, { childList: true, characterData: true, subtree: true, attributes: true, attributeFilter: ['class'] });
    upd();
    return {};
  }
  window.L1 = { steps, done, frame, watch };
})();
/* 3-2 보강(2026-10-31): 기존 조작 장에 해 볼 일 ①②③을 붙이는 도우미.
   EthTrack.track(root, [조건…]) 조건이 한 번 참이 되면 그 단계 ✓(되돌아가지 않음), 모두 끝나면 «알게 된 것». 장이 열려 있는 동안만 살핀다.
   EthTrack.theory(root) 이론 장: 사진을 누르면 data-row가 같은 왼쪽 상자(.lv-row)가 밝아진다.
   시험용: root._trk.check() */
(function () {
  'use strict';
  function track(root, conds) {
    const ok = new Set(); let tm = 0;
    const upd = () => {
      conds.forEach((c, i) => { try { if (!ok.has(i + 1) && c()) ok.add(i + 1); } catch (e) { /* 그림 준비 전 */ } });
      const now = conds.map((_, i) => i + 1).find((n) => !ok.has(n)) || 0;
      window.L1.steps(root, now, [...ok]); window.L1.done(root, now === 0);
    };
    upd();
    root._trk = { check: upd };
    return { setActive(on) { clearInterval(tm); if (on) { upd(); tm = setInterval(upd, 400); } } };
  }
  const join = (...ps) => {
    const o = { setActive(on) { ps.forEach((p) => p && p.setActive && p.setActive(on)); } };
    ['fit', 'fragment', 'sync'].forEach((k) => { if (ps.some((p) => p && p[k])) o[k] = (...a) => ps.forEach((p) => p && p[k] && p[k](...a)); });
    return o;
  };
  const txt = (root, sel) => ((root.querySelector(sel) || {}).textContent || '').trim();
  const pressed = (root, sel) => !!root.querySelector(sel + ' button[aria-pressed="true"]');
  function theory(root) {
    const rows = [...root.querySelectorAll('.lv-row')];
    root.querySelector('.gv').addEventListener('gv-pick', (e) => rows.forEach((x) => x.classList.toggle('on', x.dataset.k === e.detail.b.dataset.row)));
    return window.RxT.gallery(root);
  }
  window.EthTrack = { track, join, txt, pressed, theory };
})();
