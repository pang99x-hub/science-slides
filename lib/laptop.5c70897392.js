/* 1-1 2차시 체험 «노트북 제품 정보에서 기본량 찾기»(교과서 20쪽 해 보기). 위 도장(시간·길이·질량·전류·온도·조합)을 고른 뒤
   제품 정보 줄을 누르면 그 줄에 도장이 찍히고, 틀리면 까닭이 나온다. 다 맞히면 «부피 구하기»로 길이 셋을 곱한다.
   Laptop.mount(root) → {} · 시험용: root._lp.stamp(줄 번호, 도장) · vol() */
(function () {
  'use strict';
  // [항목, 값, 정답, 틀릴 때 까닭]
  const ROWS = [
    ['가로', '35.8 cm', 'len', 'cm는 길이의 단위다.'],
    ['세로', '23.7 cm', 'len', 'cm는 길이의 단위다.'],
    ['높이', '1.9 cm', 'len', '높이도 길이다.'],
    ['질량', '약 1.6 kg', 'mass', 'kg은 질량의 단위다.'],
    ['정격 전류', '2 A', 'cur', 'A(암페어)는 전류의 단위다.'],
    ['최대 사용 시간', '10시간 20분', 'time', '시간·분은 시간의 단위다.'],
    ['중앙 처리 장치 온도', '평균 43 °C', 'temp', '°C는 일상에서 쓰는 온도 단위다(기본 단위는 K).'],
    ['배터리 용량', '4000 mAh', 'mix', 'mAh = 전류(mA) × 시간(h). 기본량 둘을 곱해 만든 양이다.'],
  ];
  const NAME = { time: '시간', len: '길이', mass: '질량', cur: '전류', temp: '온도', mix: '조합' };

  function mount(root) {
    const tb = root.querySelector('.lp-rows'), stamps = [...root.querySelectorAll('.lp-stamp button')], msg = root.querySelector('.lp-msg'), vb = root.querySelector('.lp-vol'), vo = root.querySelector('.lp-volout');
    let cur = 'len'; const got = ROWS.map(() => null); let volDone = false;
    tb.innerHTML = ROWS.map((r, i) => `<tr data-i="${i}" tabindex="0"><th>${r[0]}</th><td>${r[1]}</td><td class="lp-tag"><span>?</span></td></tr>`).join('');
    const trs = [...tb.querySelectorAll('tr')];
    function steps() {
      const base = ROWS.every((r, i) => r[2] === 'mix' || got[i] === r[2]), mix = got[ROWS.length - 1] === 'mix';
      const ok = []; if (base) ok.push(1); if (mix) ok.push(2); if (volDone) ok.push(3);
      const st = [1, 2, 3].find((k) => !ok.includes(k)) || 0;
      window.L1.steps(root, st, ok); window.L1.done(root, st === 0);
      vb.disabled = !(base && mix);
    }
    function stamp(i, k) {
      const r = ROWS[i], tr = trs[i], ok = k === r[2];
      if (ok) { got[i] = k; tr.classList.add('ok'); tr.classList.remove('no'); tr.querySelector('.lp-tag').innerHTML = `<span class="k-${k}">${NAME[k]}</span>`; msg.className = 'u-msg ok'; msg.textContent = `맞다. ${r[3]}`; }
      else { tr.classList.remove('no'); void tr.offsetWidth; tr.classList.add('no'); msg.className = 'u-msg no'; msg.textContent = `«${NAME[k]}»은 아니다. ${r[3]}`; }
      steps();
    }
    trs.forEach((tr, i) => {
      tr.addEventListener('click', () => stamp(i, cur));
      tr.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); stamp(i, cur); } });
    });
    stamps.forEach((b) => b.addEventListener('click', () => { cur = b.dataset.k; stamps.forEach((x) => x.setAttribute('aria-pressed', String(x === b))); }));
    vb.addEventListener('click', () => { volDone = true; vo.innerHTML = '부피 = 가로 × 세로 × 높이 = 35.8 cm × 23.7 cm × 1.9 cm ≈ <b>1612 cm³</b> — <b>길이</b> 셋을 곱해 나타낸다'; steps(); });
    steps();
    root._lp = { stamp: (i, k) => stamp(i, k), vol: () => vb.click() };
    return {};
  }
  window.Laptop = { mount };
})();
