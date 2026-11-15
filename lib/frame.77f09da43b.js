/* 1-1-3 체험 장 공통 틀(1-1-1 l1frame.js를 가져와 단원 안에 둠: 실행 중 다른 단원 파일을 읽지 않는다).
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
