/* 1차시 조작 장 공통 틀(내용 정리와 수업 설계 §4): 해 볼 일 ①②③(.u-steps), 끝나면 «알게 된 것»(.u-learn)과
   «정리 영상» 단추(.u-vbtn → .u-vid 덮개), 단계(→)로 여는 개념 카드(.u-sum 안의 .fragment)가 나오면 오른쪽 칸이 정리 모드로 바뀐다.
   L1.steps(root, 지금 단계 번호, [끝난 번호…]) · L1.done(root, 끝났나) · L1.frame(root) → 장 조각(Deck.part에 덧붙임) */
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
    const panel = root.querySelector('.u-sum') && root.querySelector('.u-sum').closest('.panel');
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
    const sum = () => { if (panel) panel.classList.toggle('summing', !!root.querySelector('.u-sum .fragment.visible')); };
    root._frame = { open };
    return {
      setActive(on) { if (!on) open(false); },
      fragment() { sum(); },
      sync() { sum(); },
    };
  }
  window.L1 = { steps, done, frame };
})();
