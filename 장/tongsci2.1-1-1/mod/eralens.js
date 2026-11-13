/* 2차시 «시대 탐험»(교과서 16~17쪽 그림 I-3~I-10): 시대 띠에서 시대를 고르면 그 시대 풍경에서 생물이 살아 움직인다.
   «시간 돋보기»를 끌어 대면 그 자리의 생물이 오늘날 지층 속 화석으로, 땅 밑의 증거(석탄층·화산재층·빙하 긁힌 자국 등)가 보인다.
   돋보기 가운데를 잠깐 머물게 하면 화석 서랍에 모이고, 서랍의 화석을 누르면 크게 꺼내 끌어 돌려 본다(앞: 살아 있던 모습, 뒤: 화석).
   그림 조각(window.EraArt)은 표지(eraorder.js)도 함께 쓴다. */
(function () {
  'use strict';
  const NS = 'http://www.w3.org/2000/svg';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const r1 = (v) => Math.round(v * 10) / 10;

  // ---------- 생물·증거 그림(원점 둘레, 대략 100 단위). class f=몸, d=선, e=눈, w=날개, g=살아 있을 때만, lf=잎줄기 ----------
  const A = {};
  A.cyano = () => {
    let s = '';
    [[-40, -14, 0], [-44, 4, 1.4], [-36, 20, 2.6]].forEach(([x0, y0, ph]) => {
      for (let i = 0; i < 11; i++) s += `<circle class="f" cx="${x0 + i * 8}" cy="${r1(y0 + 6 * Math.sin(i * 0.7 + ph))}" r="4.3" style="fill:#3aa38a"/>`;
    });
    return s;
  };
  A.strom = () => {
    const dome = (k) => `M${-48 * k} 0 C ${-48 * k} ${-40 * k} ${-26 * k} ${-58 * k} 0 ${-58 * k} C ${26 * k} ${-58 * k} ${48 * k} ${-40 * k} ${48 * k} 0`;
    let s = `<path class="f" style="fill:#a8936c" d="${dome(1)} Z"/>`;
    [0.82, 0.64, 0.46, 0.28].forEach((k) => { s += `<path class="d" d="${dome(k)}"/>`; });
    return s + `<path class="g" d="${dome(1.02)}" style="fill:none;stroke:#3aa38a;stroke-width:6;stroke-dasharray:3 5"/>`;
  };
  A.ediac = () => {
    let s = `<path class="d" d="M0 4 V 14"/><ellipse class="f" cx="0" cy="16" rx="12" ry="5" style="fill:#c98b7a"/>`;
    s += `<path class="f" style="fill:#e0a892" d="M0 6 C -18 -20 -16 -70 0 -92 C 16 -70 18 -20 0 6 Z"/>`;
    for (let y = -6; y > -84; y -= 8) s += `<path class="d" d="M0 ${y} L -12 ${y - 7} M0 ${y} L 12 ${y - 7}"/>`;
    s += `<g transform="translate(38 4)"><ellipse class="f" cx="0" cy="0" rx="20" ry="12" style="fill:#d79a86"/><path class="d" d="M-18 0 H 18"/>`;
    for (let x = -14; x <= 14; x += 4) s += `<path class="d" d="M${x} -10 V 10"/>`;
    return s + '</g>';
  };
  A.trilo = () => {
    let s = `<path class="f" style="fill:#8b6b4a" d="M-30 -18 C -30 -44 30 -44 30 -18 L 26 -12 L -26 -12 Z"/>`;
    s += `<path class="f" style="fill:#9c7b56" d="M-26 -12 L 26 -12 L 20 26 C 10 38 -10 38 -20 26 Z"/>`;
    s += `<path class="d" d="M-30 -18 L -36 4 M30 -18 L 36 4 M-8 -38 C -10 -20 -8 10 -5 32 M8 -38 C 10 -20 8 10 5 32"/>`;
    for (let y = -6; y <= 26; y += 5) { const w = 25 - (y + 12) * 0.16; s += `<path class="d" d="M${r1(-w)} ${y} H ${r1(w)}"/>`; }
    return s + `<circle class="e" cx="-13" cy="-26" r="3.4"/><circle class="e" cx="13" cy="-26" r="3.4"/>`;
  };
  A.brach = () => {
    let s = `<path class="f" style="fill:#d6b98c" d="M0 18 C -30 18 -38 -6 -31 -17 C -20 -32 20 -32 31 -17 C 38 -6 30 18 0 18 Z"/>`;
    for (let a = -64; a <= 64; a += 16) { const t = a * Math.PI / 180; s += `<path class="d" d="M0 15 L ${r1(Math.sin(t) * 31)} ${r1(15 - Math.cos(t) * 40)}"/>`; }
    return s + `<path class="d" d="M-12 18 Q 0 25 12 18"/>`;
  };
  A.armfish = () => `<path class="f" style="fill:#7d8a96" d="M40 0 C 38 -14 20 -20 4 -18 L -20 -10 L -44 -2 L -56 -16 L -51 1 L -58 15 L -44 6 L -20 10 L 4 16 C 22 18 38 12 40 0 Z"/>
    <path class="f" style="fill:#5e6b78" d="M40 0 C 38 -14 20 -20 6 -18 C 2 -6 2 8 6 16 C 22 18 38 12 40 0 Z"/>
    <path class="d" d="M20 -16 C 17 -6 17 6 20 14 M -10 -11 L -6 -18 L -2 -12"/><circle class="e" cx="29" cy="-4" r="3.2"/>`;
  function quad(p0, p1, p2, t) { const u = 1 - t; return [u * u * p0[0] + 2 * u * t * p1[0] + t * t * p2[0], u * u * p0[1] + 2 * u * t * p1[1] + t * t * p2[1]]; }
  A.fern = () => {
    let s = `<path class="f" style="fill:#7a5a3a" d="M-7 0 L -4 -112 L 4 -112 L 7 0 Z"/><path class="d" d="M-5 -20 l 10 -6 M-5 -50 l 10 -6 M-5 -80 l 10 -6"/>`;
    [[-78, 6], [-60, -34], [-30, -62], [0, -70], [30, -62], [60, -34], [78, 6]].forEach(([dx, dy]) => {
      const p0 = [0, -112], p2 = [dx, -112 + dy + 40], p1 = [dx * 0.45, -112 + dy - 10];
      s += `<path class="lf" d="M0 -112 Q ${r1(p1[0])} ${r1(p1[1])} ${r1(p2[0])} ${r1(p2[1])}"/>`;
      for (let t = 0.15; t < 0.96; t += 0.1) {
        const a = quad(p0, p1, p2, t), b = quad(p0, p1, p2, t + 0.02), nx = -(b[1] - a[1]), ny = b[0] - a[0], n = Math.hypot(nx, ny) || 1, L = 10 * (1.1 - t);
        s += `<path class="lf lt" d="M${r1(a[0] - nx / n * L)} ${r1(a[1] - ny / n * L)} L ${r1(a[0] + nx / n * L)} ${r1(a[1] + ny / n * L)}"/>`;
      }
    });
    return s;
  };
  A.dfly = () => `<g class="w"><ellipse cx="-28" cy="-14" rx="28" ry="7" transform="rotate(-8 -28 -14)"/><ellipse cx="28" cy="-14" rx="28" ry="7" transform="rotate(8 28 -14)"/>
    <ellipse cx="-26" cy="0" rx="25" ry="6.5" transform="rotate(10 -26 0)"/><ellipse cx="26" cy="0" rx="25" ry="6.5" transform="rotate(-10 26 0)"/></g>
    <path class="d" d="M-50 -16 L -6 -14 M50 -16 L 6 -14 M-46 3 L -6 -4 M46 3 L 6 -4"/>
    <path class="f" style="fill:#2a6fa8" d="M0 -26 L 4 -18 L 2.5 44 L 0 50 L -2.5 44 L -4 -18 Z"/><circle class="f" style="fill:#1f5786" cx="0" cy="-29" r="6"/>`;
  A.amph = () => `<path class="lg" d="M18 6 L 24 22 L 32 23 M-18 6 L -24 21 L -17 23 M8 6 L 4 20 M-30 2 L -36 16"/>
    <path class="f" style="fill:#7f8f45" d="M48 -6 C 44 -17 30 -19 18 -15 L -20 -12 C -36 -12 -52 -6 -70 -2 C -52 2 -36 5 -20 7 L 18 8 C 32 10 46 6 48 -6 Z"/>
    <path class="d" d="M30 0 Q 40 2 46 -2"/><circle class="d" cx="0" cy="-4" r="2.5"/><circle class="d" cx="-14" cy="-2" r="2"/><circle class="e" cx="38" cy="-9" r="3"/>`;
  A.sauro = () => `<path class="f" style="fill:#6f8c4e" d="M-34 -4 h 18 v 42 h -18 Z M-10 -2 h 16 v 40 h -16 Z M26 -2 h 16 v 40 h -16 Z M48 -4 h 16 v 42 h -16 Z"/>
    <path class="f" style="fill:#7f9a5c" d="M-40 -40 C -10 -66 40 -62 56 -42 C 70 -62 84 -112 104 -122 C 116 -128 128 -120 121 -111 C 106 -104 92 -72 76 -24 C 70 -6 56 2 40 2 L -40 2 C -70 0 -100 -10 -134 -2 C -100 -24 -70 -34 -40 -40 Z"/>
    <path class="d" d="M-20 -30 Q 10 -40 40 -30 M60 -40 Q 72 -60 88 -98"/><circle class="e" cx="113" cy="-118" r="3"/>`;
  A.ginkgo = () => {
    let s = `<path class="f" style="fill:#7a5a3a" d="M-8 0 L -5 -90 L -30 -120 L -26 -124 L -3 -100 L 0 -140 L 5 -140 L 6 -100 L 30 -126 L 34 -122 L 8 -88 L 8 0 Z"/>`;
    const fan = (x, y, a) => `<path class="f" style="fill:#a4c23a" transform="translate(${x} ${y}) rotate(${a})" d="M0 0 L -11 -15 Q 0 -22 11 -15 Z"/>`;
    [[-30, -124, -20], [-44, -118, -60], [-20, -136, 10], [0, -142, 0], [16, -136, 30], [30, -128, 20], [44, -120, 70], [-36, -104, -100], [36, -106, 110], [-8, -120, -30], [10, -116, 40], [-52, -130, -40], [52, -134, 50], [-24, -150, -10], [24, -150, 15]].forEach((p) => { s += fan(...p); });
    return s;
  };
  A.archae = () => `<path class="f" style="fill:#7b5b3e" d="M-14 2 L -66 8 L -64 14 L -14 8 Z"/><path class="d" d="M-24 4 l -4 10 M-34 5 l -4 10 M-44 6 l -4 10 M-54 7 l -4 10 M-24 4 l -4 -8 M-34 5 l -4 -8 M-44 6 l -4 -8 M-54 7 l -4 -8"/>
    <path class="f" style="fill:#a88459" d="M-2 -4 L -34 -50 L -18 -46 L -8 -54 L 2 -46 L 10 -6 Z"/><path class="d" d="M-28 -44 L -2 -6 M-14 -48 L 2 -6 M-4 -50 L 6 -6"/>
    <ellipse class="f" style="fill:#8a6a4a" cx="0" cy="2" rx="18" ry="10"/><circle class="f" style="fill:#8a6a4a" cx="20" cy="-8" r="8"/>
    <path class="f" style="fill:#d9b98a" d="M26 -10 L 40 -6 L 26 -3 Z"/><path class="d" d="M30 -6 l 1 2 M34 -5 l 1 2 M-30 -48 l -6 4 M-18 -48 l -2 -6"/><circle class="e" cx="22" cy="-10" r="2.2"/>`;
  A.ammo = () => {
    let p = '', ribs = '';
    for (let i = 0; i <= 90; i++) { const t = i / 90 * 3.2 * Math.PI, r = 4 + 34 * Math.pow(t / (3.2 * Math.PI), 1.25); p += (i ? ' L ' : 'M ') + r1(r * Math.cos(t)) + ' ' + r1(r * Math.sin(t)); }
    for (let i = 20; i <= 90; i += 4) { const t = i / 90 * 3.2 * Math.PI, r = 4 + 34 * Math.pow(t / (3.2 * Math.PI), 1.25), r0 = r * 0.62; ribs += `M${r1(r0 * Math.cos(t))} ${r1(r0 * Math.sin(t))} L ${r1(r * Math.cos(t))} ${r1(r * Math.sin(t))} `; }
    return `<g class="g"><path d="M-30 12 C -46 20 -52 30 -60 26 M-30 16 C -44 28 -46 40 -56 40 M-28 20 C -36 34 -34 46 -42 50" style="fill:none;stroke:#c97a3a;stroke-width:4;stroke-linecap:round"/></g>
      <circle class="f" style="fill:#d48a46" cx="0" cy="0" r="38"/><path class="d" d="${p}"/><path class="d" d="${ribs}"/>`;
  };
  A.ichthy = () => `<path class="f" style="fill:#4f7396" d="M-2 -16 L 10 -32 L 18 -14 Z M6 8 L 0 22 L 16 10 Z"/>
    <path class="f" style="fill:#5b7ea0" d="M74 2 L 42 -2 C 22 -18 -20 -18 -40 -6 L -62 -22 L -57 0 L -62 20 L -40 7 C -20 16 20 14 42 5 Z"/>
    <path class="d" d="M40 4 L 70 3 M-30 0 Q 0 6 30 2"/><circle class="e" cx="34" cy="-4" r="3.6"/>`;
  A.mammoth = () => `<path class="f" style="fill:#6b4428" d="M-56 0 L -54 42 H -36 L -36 6 Z M20 6 L 22 42 H 42 L 44 2 Z"/>
    <path class="f" style="fill:#7a4f2e" d="M60 -10 C 60 -52 38 -80 0 -82 C -30 -84 -54 -72 -62 -52 C -76 -48 -82 -32 -80 -12 C -78 0 -84 22 -90 36 C -86 40 -79 38 -77 31 C -72 18 -66 6 -60 0 L -52 8 L -36 10 L 20 10 C 40 10 60 4 60 -10 Z"/>
    <path class="d" d="M-40 -60 l -4 12 M-24 -70 l -3 12 M-6 -74 l -2 12 M14 -70 l 0 12 M32 -60 l 2 12 M46 -44 l 3 12 M-50 -20 l -4 14 M30 -8 l 0 14 M0 -10 l 0 14"/>
    <path class="t" d="M-70 -14 C -98 -8 -106 -34 -88 -46"/><circle class="e" cx="-62" cy="-40" r="3.2"/>`;
  A.angio = () => {
    let s = `<path class="f" style="fill:#7a5a3a" d="M-7 0 L -4 -60 L -24 -84 L -19 -88 L -2 -70 L 0 -96 L 6 -96 L 6 -70 L 22 -90 L 27 -86 L 8 -60 L 8 0 Z"/>`;
    [[-30, -100, 30], [0, -118, 34], [30, -100, 30], [-14, -84, 26], [16, -84, 26]].forEach(([x, y, r]) => { s += `<circle class="f" style="fill:#4f9a3a" cx="${x}" cy="${y}" r="${r}"/>`; });
    [[-38, -104], [-12, -124], [10, -110], [30, -96], [-24, -86], [20, -82], [2, -96], [40, -110]].forEach(([x, y]) => { s += `<g class="g" transform="translate(${x} ${y})"><circle r="5" style="fill:#f2a7c3;stroke:#a3326b;stroke-width:1.2"/><circle r="1.8" style="fill:#f5cf3a"/></g>`; });
    return s;
  };
  A.nummu = () => {
    let p = '';
    for (let i = 0; i <= 80; i++) { const t = i / 80 * 6 * Math.PI, r = 2 + 3.6 * t / Math.PI; p += (i ? ' L ' : 'M ') + r1(r * Math.cos(t)) + ' ' + r1(r * Math.sin(t) * 0.92); }
    return `<ellipse class="f" style="fill:#e3d3ad" cx="0" cy="0" rx="26" ry="24"/><path class="d" d="${p}"/>
      <g transform="translate(42 10)"><ellipse class="f" style="fill:#e3d3ad" cx="0" cy="0" rx="20" ry="7"/><path class="d" d="M-18 0 H 18 M-12 -4 V 4 M-6 -5 V 5 M0 -6 V 6 M6 -5 V 5 M12 -4 V 4"/></g>`;
  };
  A.human = () => `<path class="lg" d="M8 -64 L 26 -40 L 30 10 M-6 -60 L -16 -34" style="stroke:#9a6a44"/><path class="d" d="M30 -70 L 30 40" style="stroke-width:4"/>
    <path class="f" style="fill:#8a5a38" d="M-6 -66 C -6 -78 12 -78 12 -66 L 10 -28 L 14 0 L 18 36 L 8 36 L 2 4 L -4 36 L -14 36 L -8 0 L -8 -28 Z"/>
    <circle class="f" style="fill:#9a6a44" cx="2" cy="-84" r="11"/><path class="d" d="M-6 -88 Q 2 -100 12 -90"/><circle class="e" cx="7" cy="-85" r="1.8"/>`;
  // 증거(땅 밑에서만 보인다): v=그때의 모습, r=지금 지층 속 증거
  const band = (fill, extra = '') => `<rect class="rk" x="-110" y="-46" width="220" height="26" style="fill:#c9b28a"/><rect class="ev" x="-110" y="-20" width="220" height="40" style="fill:${fill}"/><rect class="rk" x="-110" y="20" width="220" height="26" style="fill:#b59b74"/>${extra}`;
  A.coalR = () => {
    let s = band('#2b2b2b');
    [[-70, 0], [-10, -4], [52, 2]].forEach(([x, y]) => { s += `<g transform="translate(${x} ${y}) rotate(-70) scale(.22)" class="ghost">${A.fern()}</g>`; });
    return s;
  };
  A.swamp = () => `<rect x="-110" y="10" width="220" height="30" style="fill:#5d7f8f" class="g"/><g transform="translate(-50 30) scale(.5)">${A.fern()}</g><g transform="translate(40 30) scale(.6)">${A.fern()}</g>`;
  A.ashR = () => { let s = band('#9a9a96'); for (let i = 0; i < 46; i++) s += `<circle cx="${r1(-104 + (i * 37) % 208)}" cy="${r1(-16 + (i * 13) % 32)}" r="${1.4 + (i % 3)}" style="fill:#5a5a58"/>`; return s; };
  A.volc = () => `<path class="f" style="fill:#6b5a4a" d="M-90 40 L -18 -44 L 18 -44 L 90 40 Z"/><path style="fill:#e2622b" d="M-18 -44 L 18 -44 L 10 -30 L 2 -38 L -6 -26 L -12 -36 Z"/>
    <g class="lz-smoke"><circle cx="-6" cy="-60" r="14" style="fill:#8f8a85"/><circle cx="12" cy="-78" r="18" style="fill:#a19c97"/><circle cx="-10" cy="-98" r="20" style="fill:#b3aea9"/></g>`;
  A.glacR = () => `<rect x="-110" y="-46" width="220" height="92" style="fill:#a9a49b"/><path d="M-96 -30 L 80 -10 M-90 -10 L 92 8 M-100 10 L 70 26 M-80 26 L 96 40 M-60 -40 L 100 -24" style="stroke:#57534c;stroke-width:3"/>
    <ellipse cx="-50" cy="20" rx="16" ry="11" style="fill:#7d776d;stroke:#3c3934;stroke-width:2"/><ellipse cx="58" cy="-24" rx="12" ry="9" style="fill:#8b857b;stroke:#3c3934;stroke-width:2"/>`;
  A.glac = () => `<path class="f" style="fill:#8d8f96" d="M-100 40 L -30 -60 L 10 -20 L 40 -50 L 100 40 Z"/><path style="fill:#f4f8fb;stroke:#9fb6c7;stroke-width:2" d="M-48 -34 L -30 -60 L 10 -20 L 40 -50 L 60 -22 L 30 0 L 20 40 L -4 40 L 0 4 Z"/>`;
  A.foldR = () => { let s = `<rect x="-110" y="-50" width="220" height="100" style="fill:#b8a68c"/>`; for (let k = -2; k <= 2; k++) s += `<path d="M-110 ${k * 18} C -60 ${k * 18 - 40} -30 ${k * 18 + 40} 0 ${k * 18} S 60 ${k * 18 - 40} 110 ${k * 18}" style="fill:none;stroke:${k % 2 ? '#7d6a52' : '#9c8a72'};stroke-width:9"/>`; return s + `<path d="M-30 -50 L 10 50" style="stroke:#3c3934;stroke-width:3;stroke-dasharray:8 5"/>`; };
  A.flat = () => { let s = `<rect x="-110" y="-50" width="220" height="100" style="fill:#c9b896"/>`; for (let k = -2; k <= 2; k++) s += `<path d="M-110 ${k * 18} H 110" style="stroke:${k % 2 ? '#7d6a52' : '#9c8a72'};stroke-width:9"/>`; return s; };

  // ---------- 시대마다: 풍경과 숨은 화석·증거 ----------
  // it: [키, 이름, 그림, x, y, 크기, 움직임, 한 줄 사실, 찾을 곳 힌트, 서랍 그림 맞춤 [크기, dx, dy]]
  const ERAS = [
    { k: 'pc', name: '선캄브리아시대', sky: ['#e3a06c', '#f3d2a6'], sea: '#4c8aa8', land: '#8a6a52', rock: '#b8a68c',
      clim: '대체로 따뜻했지만 빙하기도 몇 번 있었던 것으로 본다. 처음엔 산소가 아주 적었다', geo: '오랜 세월 지각 변동을 받아 대륙 모습을 알기 어렵다', life: '생명은 자외선이 닿지 않는 바닷속에서 처음 나타났고 뭍에는 생물이 없었다. 처음엔 단세포, 말기에 첫 다세포 생물', nick: '', more: '남세균, 스트로마톨라이트, 에디아카라 생물군',
      it: [
        ['cyano', '남세균', 'cyano', 150, 450, 1.3, 'pulse', '햇빛으로 광합성을 해 바다와 공기에 처음으로 산소를 늘려 간 작은 생물', '얕은 바다', [1.8, 0, 0]],
        ['strom', '스트로마톨라이트', 'strom', 270, 566, 1.2, '', '남세균이 내놓은 끈끈한 막에 모래·진흙이 달라붙어 겹겹이 쌓인 구조. 가장 오래된 생물의 흔적이다', '바다 밑바닥', [1.6, 0, 40]],
        ['ediac', '에디아카라 생물군', 'ediac', 390, 548, 1.0, 'sway', '뼈도 껍데기도 없는 초기 다세포 생물 화석 무리. 오스트레일리아에서 처음 찾았다', '바다 밑바닥', [1.3, -10, 40]],
        ['fold', '휘고 깨진 지층', ['flat', 'foldR'], 780, 520, 1, '', '화석이 드문 까닭 셋: 생물 수가 적었고, 뼈·껍데기 같은 단단한 부분이 없었고, 오랜 세월 지각 변동을 받았다', '뭍의 땅속', [0.85, 0, 0]],
      ] },
    { k: 'pz', name: '고생대', sky: ['#a9d4ec', '#e6f3fa'], sea: '#3f86b5', land: '#7d7a4a', rock: '#c2ad88',
      clim: '대체로 따뜻했으나 말기에 빙하기가 찾아왔다', geo: '말기에 대륙이 한데 모여 초대륙 판게아가 되었다', life: '초기: 산소가 늘며 껍데기 가진 바다 생물이 폭발적으로 늘었다 / 중기: 오존층 덕에 뭍으로 / 말기: 파충류·겉씨식물 출현', nick: '', more: '바다: 삼엽충·방추충·완족류·필석·갑주어 / 뭍: 양치식물 숲·양서류·대형 곤충',
      it: [
        ['trilo', '삼엽충', 'trilo', 170, 548, 1.1, 'crawl', '몸이 세로로 세 갈래로 나뉜 바다 동물. 고생대 지층임을 알려 준다', '바다 밑바닥', [1.9, 0, 0]],
        ['brach', '완족류', 'brach', 300, 566, 1.1, '', '껍데기 두 장을 가진 바다 동물. 조개와 닮았지만 다른 무리', '바다 밑바닥', [2.2, 0, 0]],
        ['armfish', '갑주어(어류)', 'armfish', 260, 420, 1.3, 'swim', '머리가 단단한 뼈판으로 덮인 옛 물고기. 처음 나타난 척추동물 무리', '바닷속', [1.7, 0, 0]],
        ['amph', '양서류', 'amph', 520, 352, 1.1, 'walk', '물과 뭍을 오가며 산 네발 동물. 어류보다 뒤에 나타났다', '물가', [1.5, 10, 0]],
        ['fern', '양치식물', 'fern', 760, 380, 1.15, 'sway', '씨 없이 홀씨로 퍼지는 식물. 늪 둘레에 큰 숲을 이루었다', '뭍의 숲', [0.78, 0, 56]],
        ['dfly', '거대 곤충(잠자리)', 'dfly', 620, 170, 1.2, 'fly', '지금 것보다 훨씬 큰 잠자리 무리가 하늘을 날았다', '하늘', [1.6, 0, 0]],
        ['coal', '석탄층', ['swamp', 'coalR'], 880, 540, 1, '', '양치식물 숲이 묻힌 뒤 오랜 세월 열과 압력을 받아 생긴 검은 층. 오늘날 캐는 석탄이 된다', '숲의 땅속', [0.85, 0, 0]],
      ] },
    { k: 'mz', name: '중생대', sky: ['#f2cf86', '#fbecc9'], sea: '#3b8fb0', land: '#9a8a52', rock: '#d1b98f',
      clim: '빙하기 없이 내내 따뜻했고 바다 높이도 높았다(화산 기체의 이산화 탄소가 온실 효과를 키움)', geo: '판게아가 갈라지며 서식지가 여러 가지로 나뉘었다', life: '서식지가 다양해져 앞 시대 대멸종에서 살아남은 생물이 크게 번성했다. 속씨식물·시조새·원시 포유류가 나타났다', nick: '파충류의 시대', more: '뭍: 공룡·겉씨식물(은행나무·소나무) / 바다: 암모나이트·해양 파충류',
      it: [
        ['ammo', '암모나이트', 'ammo', 190, 500, 1.1, 'bob', '돌돌 말린 껍데기 속에 사는 바다 동물. 중생대 말에 사라졌다', '바닷속', [1.9, 4, 0]],
        ['ichthy', '해양 파충류(어룡)', 'ichthy', 300, 400, 1.2, 'swim', '돌고래처럼 생겼지만 바다에 사는 파충류', '바닷속', [1.3, 0, 0]],
        ['sauro', '공룡', 'sauro', 680, 400, 1.05, 'walk', '중생대 뭍을 차지한 파충류. 중생대 말에 멸종했다', '뭍', [0.66, -6, 30]],
        ['ginkgo', '겉씨식물(은행나무)', 'ginkgo', 900, 380, 1.1, 'sway', '씨가 열매 속에 싸이지 않고 겉으로 드러난 식물', '뭍의 숲', [0.95, 0, 64]],
        ['archae', '시조새', 'archae', 520, 170, 1.2, 'fly', '가장 오래된 새 무리. 깃털·날개와 함께 이빨·긴 꼬리뼈가 있어 새와 파충류의 특징을 함께 지녔다', '하늘', [1.5, 10, 10]],
        ['ash', '화산재층', ['volc', 'ashR'], 820, 545, 1, '', '화산이 자주 터졌다는 증거. 화산 기체가 공기를 데웠다', '뭍의 땅속', [0.85, 0, 0]],
      ] },
    { k: 'cz', name: '신생대', sky: ['#bcd6e6', '#eaf3f8'], sea: '#4682ad', land: '#a7a24e', rock: '#cbbd9a',
      clim: '중기까지 따뜻하다가 점점 추워져, 말기에 빙하기와 간빙기가 되풀이되었다', geo: '대서양은 더 넓어지고 히말라야·알프스산맥이 솟아 지금과 비슷해졌다. 빙하기에 바다가 낮아지면 얕은 바다가 뭍으로 드러나 생물이 대륙 사이를 건너갔다', life: '넓은 초원이 펼쳐지고 지금과 비슷한 생물들이 자리 잡았다. 끝 무렵 인류의 조상이 나타났다', nick: '포유류의 시대', more: '바다: 화폐석 / 뭍: 매머드 같은 포유류·조류, 속씨식물(참나무·단풍나무)',
      it: [
        ['nummu', '화폐석', 'nummu', 220, 520, 1.3, 'bob', '동전처럼 납작하고 둥근 껍데기를 가진 바다의 작은 생물', '바닷속', [2, -16, 0]],
        ['mammoth', '매머드(포유류)', 'mammoth', 680, 392, 1.05, 'walk', '긴 털을 두른 코끼리 무리. 추운 빙하기의 들판에 살았다', '들판', [1.05, 6, 16]],
        ['angio', '속씨식물', 'angio', 900, 400, 1.1, 'sway', '꽃이 피고 씨가 열매 속에 싸이는 식물', '들판', [1.1, 0, 56]],
        ['human', '인류의 조상', 'human', 540, 410, 1, 'walk', '신생대의 끝 무렵에 비로소 나타났다', '들판', [1.2, 0, 26]],
        ['glac', '빙하가 긁은 자국', ['glac', 'glacR'], 860, 230, 1, '', '빙하가 바위를 끌고 가며 긁은 자국. 빙하기가 있었다는 증거', '높은 산', [0.85, 0, 0]],
      ] },
  ];
  const ANIM = { pulse: 'lz-pulse', sway: 'lz-sway', crawl: 'lz-crawl', swim: 'lz-swim', walk: 'lz-walk', fly: 'lz-fly', bob: 'lz-bob' };

  // 풍경(살아 있는 모습). 표지의 카드도 이것을 쓴다. 증거(땅속)는 풍경에 그리지 않는다.
  function scene(k, uid = 'x') {
    const E = ERAS.find((e) => e.k === k);
    let s = `<defs><linearGradient id="lz-sky-${k}-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${E.sky[0]}"/><stop offset="1" stop-color="${E.sky[1]}"/></linearGradient>
      <linearGradient id="lz-sea-${k}-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${E.sea}"/><stop offset="1" stop-color="#1f4f74"/></linearGradient></defs>
      <rect x="0" y="0" width="1000" height="600" fill="url(#lz-sky-${k}-${uid})"/>`;
    // 먼 풍경
    if (k === 'pc' || k === 'mz') s += `<g transform="translate(${k === 'pc' ? 840 : 760} 270) scale(${k === 'pc' ? 1.2 : 0.8})">${A.volc()}</g>`;
    if (k === 'cz') s += `<path d="M560 330 L 700 150 L 780 240 L 860 120 L 1000 300 L 1000 330 Z" fill="#8d8f96" stroke="#1d2433" stroke-width="2"/><path d="M660 202 L 700 150 L 740 196 L 718 210 L 700 190 L 680 214 Z M820 172 L 860 120 L 910 186 L 884 200 L 864 176 L 842 200 Z" fill="#f4f8fb" stroke="#9fb6c7" stroke-width="2"/><path d="M842 200 L 864 176 L 884 200 L 874 300 L 850 300 Z" fill="#e4f0f7" stroke="#9fb6c7" stroke-width="2"/>`;
    if (k === 'pz') s += `<path d="M600 330 C 700 290 820 300 1000 280 L 1000 330 Z" fill="#6f8a5a" opacity=".6"/>`;
    // 뭍
    const ground = { pc: 'M440 600 L 440 360 C 520 330 560 352 620 320 C 700 300 760 336 840 318 C 900 306 960 326 1000 316 L 1000 600 Z',
      pz: 'M440 600 L 440 370 C 500 350 560 340 640 336 C 760 330 880 344 1000 334 L 1000 600 Z',
      mz: 'M460 600 L 460 380 C 540 360 600 352 700 350 C 820 348 900 352 1000 344 L 1000 600 Z',
      cz: 'M450 600 L 450 380 C 540 360 600 354 700 352 C 820 350 900 356 1000 350 L 1000 600 Z' }[k];
    s += `<path d="${ground}" fill="${E.land}" stroke="#1d2433" stroke-width="2.5"/>`;
    if (k === 'pz') s += `<ellipse cx="660" cy="372" rx="90" ry="12" fill="#5d7f8f" stroke="#1d2433" stroke-width="2"/>`;
    if (k === 'cz' || k === 'mz') for (let i = 0; i < 26; i++) s += `<path d="M${470 + i * 21} ${392 + (i % 3) * 8} l -4 -14 M${474 + i * 21} ${392 + (i % 3) * 8} l 3 -12" stroke="${k === 'cz' ? '#6f8a2a' : '#5f7a3a'}" stroke-width="2.5"/>`;
    // 바다
    s += `<path d="M0 300 H 470 C 452 340 446 380 440 420 L 440 600 H 0 Z" fill="url(#lz-sea-${k}-${uid})" stroke="#1d2433" stroke-width="2.5"/>`;
    s += `<path d="M0 600 L 0 580 C 120 566 260 590 440 572 L 440 600 Z" fill="#c9b48a" stroke="#1d2433" stroke-width="2"/>`;
    s += `<path d="M20 312 q 20 -8 40 0 t 40 0 M200 316 q 20 -8 40 0 t 40 0" fill="none" stroke="#ffffff" stroke-opacity=".6" stroke-width="3"/>`;
    if (k === 'pc') s += `<g opacity=".55"><circle cx="760" cy="90" r="46" fill="#f6c64a"/></g>`;
    else s += `<circle cx="900" cy="80" r="40" fill="#f6d34a" opacity=".85"/>`;
    // 생물
    E.it.forEach(([key, , art, x, y, sc, an]) => {
      if (Array.isArray(art)) return;
      s += `<g class="lz-it" data-k="${key}" transform="translate(${x} ${y}) scale(${sc})"><g class="${ANIM[an] || ''}">${A[art]()}</g></g>`;
      if (key === 'strom') s += `<g transform="translate(${x + 66} ${y + 4}) scale(.6)">${A.strom()}</g><g transform="translate(${x - 90} ${y + 6}) scale(.7)">${A.strom()}</g>`;
      if (key === 'fern') s += `<g transform="translate(${x + 90} ${y - 10}) scale(.9)"><g class="lz-sway">${A.fern()}</g></g><g transform="translate(${x - 80} ${y}) scale(.7)"><g class="lz-sway">${A.fern()}</g></g>`;
      if (key === 'ginkgo') s += `<g transform="translate(${x - 300} ${y - 20}) scale(.7)">${A.ginkgo()}</g>`;
      if (key === 'angio') s += `<g transform="translate(${x - 320} ${y - 10}) scale(.75)"><g class="lz-sway">${A.angio()}</g></g>`;
      if (key === 'trilo') s += `<g transform="translate(${x + 60} ${y + 14}) scale(.7) rotate(30)">${A.trilo()}</g>`;
    });
    return s;
  }

  // 땅 밑(돋보기 속): 지층 + 같은 자리의 화석 + 증거
  function under(k) {
    const E = ERAS.find((e) => e.k === k);
    let s = `<rect x="0" y="0" width="1000" height="600" fill="${E.rock}"/>`;
    for (let y = 20; y < 600; y += 46) s += `<path d="M0 ${y} C 250 ${y - 8} 500 ${y + 10} 1000 ${y - 4}" fill="none" stroke="#1d2433" stroke-opacity=".18" stroke-width="${8 + (y % 3) * 4}"/>`;
    E.it.forEach(([key, , art, x, y, sc]) => {
      const fa = Array.isArray(art) ? A[art[1]]() : A[art]();
      s += `<g class="lz-under${Array.isArray(art) ? ' lz-ev' : ' lz-fos'}" data-k="${key}" transform="translate(${x} ${y}) scale(${sc})">${fa}</g>`;
    });
    return s;
  }

  // 서랍·살펴보기용 작은 그림(앞: 살아 있던 모습, 뒤: 화석·증거)
  function thumb(item, side) {
    const [, , art, , , , , , , [k, dx, dy]] = item;
    const ev = Array.isArray(art), body = ev ? A[art[side === 'back' ? 1 : 0]]() : A[art]();
    const cls = side === 'back' ? (ev ? 'lz-ev' : 'lz-fos lz-stone') : 'lz-alive';
    return `<svg viewBox="-100 -100 200 200" aria-hidden="true">${side === 'back' && !ev ? '<rect x="-100" y="-100" width="200" height="200" class="lz-slab"/>' : ''}<g class="${cls}" transform="translate(${dx} ${dy}) scale(${k})">${body}</g></svg>`;
  }

  window.EraArt = { A, ERAS, scene, under, thumb };

  // ---------- 장 조각 ----------
  function mount(root) {
    const svg = root.querySelector('.lz-svg'), now = root.querySelector('.lz-now');
    const strip = root.querySelector('.lz-strip'), drawer = root.querySelector('.lz-drawer'), cnt = root.querySelector('.lz-count');
    const info = { name: root.querySelector('.lz-ename'), clim: root.querySelector('.lz-clim'), geo: root.querySelector('.lz-geo'), life: root.querySelector('.lz-life'), more: root.querySelector('.lz-more'), nick: root.querySelector('.lz-nick') };
    const exam = root.querySelector('.lz-exam'), flip = root.querySelector('.lz-flip'), front = root.querySelector('.lz-front'), back = root.querySelector('.lz-back');
    const ename = root.querySelector('.lz-xname'), efact = root.querySelector('.lz-xfact'), eside = root.querySelector('.lz-xside');
    const found = {}; ERAS.forEach((e) => { found[e.k] = new Set(); });
    let era = ERAS[0], lens = { x: 330, y: 300 }, R = 92, dwell = null, dwellT = 0, examining = null, rot = 0;

    svg.innerHTML = `<defs><clipPath id="lz-clip"><circle class="lz-cc" cx="0" cy="0" r="${R}"/></clipPath></defs>
      <g class="lz-scene"></g><g class="lz-under-wrap" clip-path="url(#lz-clip)"><g class="lz-ug"></g></g>
      <g class="lz-lens"><circle class="lz-ring" r="${R}"/><circle class="lz-prog" r="${R - 9}" transform="rotate(-90)"/><path class="lz-handle" d="M${R * 0.72} ${R * 0.72} L ${R * 1.32} ${R * 1.32}"/><text class="lz-ltxt" y="${R + 28}"></text></g>`;
    const sceneG = svg.querySelector('.lz-scene'), ug = svg.querySelector('.lz-ug'), cc = svg.querySelector('.lz-cc'), lensG = svg.querySelector('.lz-lens'), prog = svg.querySelector('.lz-prog'), ltxt = svg.querySelector('.lz-ltxt');
    const C = 2 * Math.PI * (R - 9);
    prog.style.strokeDasharray = `0 ${C}`;

    function drawDrawer() {
      const fs = found[era.k];
      drawer.innerHTML = era.it.map((it) => {
        const got = fs.has(it[0]);
        return `<button type="button" class="lz-slot${got ? ' got' : ''}" data-k="${it[0]}" ${got ? '' : 'disabled'} aria-label="${got ? it[1] + ' 꺼내 보기' : '아직 못 찾음: ' + it[8] + '을 살펴보자'}">
          ${got ? thumb(it, 'back') : '<span class="lz-q">?</span>'}<b>${got ? it[1] : it[8]}</b></button>`;
      }).join('');
      cnt.textContent = `${fs.size} / ${era.it.length}`;
      drawer.querySelectorAll('.lz-slot.got').forEach((b) => b.addEventListener('click', () => open(b.dataset.k)));
    }
    function setEra(k) {
      era = ERAS.find((e) => e.k === k) || ERAS[0];
      sceneG.innerHTML = scene(era.k, 'lens'); ug.innerHTML = under(era.k);
      strip.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === era.k)));
      info.name.textContent = era.name; info.clim.textContent = era.clim; info.geo.textContent = era.geo; info.life.textContent = era.life; info.more.textContent = era.more; info.nick.textContent = era.nick ? '«' + era.nick + '»' : '';
      root.dataset.era = era.k;
      drawDrawer(); close(); dwell = null; place();
    }
    function place() {
      lensG.setAttribute('transform', `translate(${r1(lens.x)} ${r1(lens.y)})`);
      cc.setAttribute('cx', r1(lens.x)); cc.setAttribute('cy', r1(lens.y));
      ug.querySelectorAll('.lz-under').forEach((g) => g.classList.remove('near'));
      const hit = era.it.find((it) => Math.hypot(it[3] - lens.x, it[4] - lens.y) < 64 * Math.max(0.9, it[5]));
      ltxt.textContent = hit ? hit[1] : '';
      if (hit) ug.querySelector(`.lz-under[data-k="${hit[0]}"]`).classList.add('near');
      if (!hit) { dwell = null; prog.style.strokeDasharray = `0 ${C}`; return; }
      if (found[era.k].has(hit[0])) { dwell = null; prog.style.strokeDasharray = `${C} 0`; lensG.classList.add('had'); return; }
      lensG.classList.remove('had');
      if (!dwell || dwell !== hit[0]) { dwell = hit[0]; dwellT = performance.now(); tick(); }
    }
    function tick() {
      if (!dwell) return;
      const f = Math.min(1, (performance.now() - dwellT) / 550);
      prog.style.strokeDasharray = `${r1(f * C)} ${C}`;
      if (f >= 1) { collect(dwell); return; }
      requestAnimationFrame(tick);
    }
    function collect(k) {
      found[era.k].add(k); const it = era.it.find((x) => x[0] === k); dwell = null;
      drawDrawer(); lensG.classList.add('had');
      const b = drawer.querySelector(`.lz-slot[data-k="${k}"]`);
      if (b && window.gsap && !reduce) gsap.fromTo(b, { scale: 1.35 }, { scale: 1, duration: 0.5, ease: 'back.out(3)' });
      const all = found[era.k].size === era.it.length;
      now.textContent = all ? `${era.name}의 화석·증거를 모두 찾았다! 다른 시대도 골라 보자` : `«${it[1]}» 찾음 — 서랍에서 눌러 꺼내 보자`;
      now.classList.toggle('done', all);
      if (!examining) open(k);
    }
    // 돋보기 끌기(어디를 눌러도 돋보기가 그곳으로 온다)
    const toSvg = (e) => { const p = svg.createSVGPoint(); p.x = e.clientX; p.y = e.clientY; const q = p.matrixTransform(svg.getScreenCTM().inverse()); return { x: Math.max(0, Math.min(1000, q.x)), y: Math.max(0, Math.min(600, q.y)) }; };
    let drag = null;
    svg.addEventListener('pointerdown', (e) => { if (e.button) return; drag = e.pointerId; try { svg.setPointerCapture(e.pointerId); } catch (err) { /* 합성 */ } lens = toSvg(e); place(); svg.classList.add('holding'); e.stopPropagation(); });
    svg.addEventListener('pointermove', (e) => { if (drag !== e.pointerId) return; lens = toSvg(e); place(); });
    const up = (e) => { if (drag === e.pointerId) { drag = null; svg.classList.remove('holding'); } };
    svg.addEventListener('pointerup', up); svg.addEventListener('pointercancel', up);
    svg.addEventListener('keydown', (e) => {
      const d = { ArrowLeft: [-30, 0], ArrowRight: [30, 0], ArrowUp: [0, -30], ArrowDown: [0, 30] }[e.key];
      if (!d) return; e.preventDefault(); e.stopPropagation();
      lens = { x: Math.max(0, Math.min(1000, lens.x + d[0])), y: Math.max(0, Math.min(600, lens.y + d[1])) }; place();
    });
    // 시대 띠: 누르거나 끌어서 고르기
    let sdrag = false;
    const pickAt = (e) => { const el = document.elementFromPoint(e.clientX, e.clientY); const b = el && el.closest('.lz-strip button'); if (b && b.dataset.k !== era.k) setEra(b.dataset.k); };
    strip.addEventListener('pointerdown', (e) => { sdrag = true; pickAt(e); try { strip.setPointerCapture(e.pointerId); } catch (err) { /* 합성 */ } e.stopPropagation(); });
    strip.addEventListener('pointermove', (e) => { if (sdrag) pickAt(e); });
    strip.addEventListener('pointerup', () => { sdrag = false; }); strip.addEventListener('pointercancel', () => { sdrag = false; });
    strip.querySelectorAll('button').forEach((b) => b.addEventListener('click', (e) => { if (e.detail === 0) setEra(b.dataset.k); }));

    // 살펴보기: 끌어서 돌리면 뒷면(화석)이 보인다
    function setRot(v, anim) {
      rot = v;
      if (window.gsap && anim && !reduce) gsap.to(flip, { rotateY: rot, duration: 0.45, ease: 'power2.out' }); else flip.style.transform = `rotateY(${rot}deg)`;
      const backSide = (((rot % 360) + 360) % 360) > 90 && (((rot % 360) + 360) % 360) < 270;
      eside.textContent = backSide ? '뒷면: 지층 속에 남은 화석·증거' : '앞면: 살아 있던 때의 모습';
    }
    function open(k) {
      const it = era.it.find((x) => x[0] === k); if (!it) return;
      examining = k; exam.hidden = false;
      front.innerHTML = thumb(it, 'front'); back.innerHTML = thumb(it, 'back');
      ename.textContent = it[1]; efact.textContent = it[7];
      setRot(180, false);
      drawer.querySelectorAll('.lz-slot').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.k === k)));
    }
    function close() { examining = null; exam.hidden = true; }
    let fx = null, r0 = 0, moved = false;
    flip.addEventListener('pointerdown', (e) => { fx = e.clientX; r0 = rot; moved = false; try { flip.setPointerCapture(e.pointerId); } catch (err) { /* 합성 */ } e.stopPropagation(); });
    flip.addEventListener('pointermove', (e) => { if (fx === null) return; const k = (window.Reveal && Reveal.getScale && Reveal.getScale()) || 1; const dx = (e.clientX - fx) / k; if (Math.abs(dx) > 4) moved = true; setRot(r0 + dx * 0.9, false); });
    const fend = () => { if (fx === null) return; fx = null; setRot(moved ? Math.round(rot / 180) * 180 : rot + 180, true); };
    flip.addEventListener('pointerup', fend); flip.addEventListener('pointercancel', fend);
    flip.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') { e.preventDefault(); e.stopPropagation(); setRot(rot + (e.key === 'ArrowLeft' ? -180 : 180), true); } });
    root.querySelector('.lz-close').addEventListener('click', () => { close(); drawer.querySelectorAll('.lz-slot').forEach((b) => b.setAttribute('aria-pressed', 'false')); });

    setEra('pc');
    root._lz = { era: setEra, lens(x, y) { lens = { x, y }; place(); }, open, rot: (v) => setRot(v, false), get found() { return found; } };
    return {};
  }

  window.EraLens = { mount };
})();
