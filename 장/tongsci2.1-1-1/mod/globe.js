/* 3차시 3장 «움직이는 대륙»(교과서 16~17쪽 그림 I-6·I-8·I-10): 3D 지구. 시간 막대를 고생대 후기 → 현재로 밀면
   대륙 판이 모여 판게아가 되고(맞닿는 곳에 산맥이 솟음) 다시 갈라져 대서양이 열리고 인도가 아시아에 부딪쳐 히말라야가 솟는다.
   화산 지대(고생대 말 시베리아, 중생대 말 인도 서부)가 타오르고, 빙하(고생대 말 한랭, 신생대 말 빙하기·간빙기)·해수면·기후대가 바뀐다.
   땅은 지구 표면에 고르게 흩은 점(피보나치 구) 가운데 지금 대륙 안에 드는 점을 육각 기둥으로 세운 것이다. 판마다 몇 시각의 자리(중심 위도·경도 + 돌린 각)를 두고 사이를 구면 보간한다.
   대륙 모양·자리·얼음 넓이·해수면은 대략(이해를 돕기 위한 예). 교과서 값은 2.52·0.66억 년(시대 경계)뿐이다. */
(function () {
  'use strict';
  const D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  // ---------- 작은 벡터·사원수 ----------
  const vec = (lon, lat) => [Math.cos(lat * D2R) * Math.sin(lon * D2R), Math.sin(lat * D2R), Math.cos(lat * D2R) * Math.cos(lon * D2R)];
  const toLL = (v) => [Math.atan2(v[0], v[2]) * R2D, Math.asin(clamp(v[1], -1, 1)) * R2D];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const qAxis = (ax, ang) => { const s = Math.sin(ang / 2); return [ax[0] * s, ax[1] * s, ax[2] * s, Math.cos(ang / 2)]; };
  const qMul = (a, b) => [
    a[3] * b[0] + a[0] * b[3] + a[1] * b[2] - a[2] * b[1],
    a[3] * b[1] - a[0] * b[2] + a[1] * b[3] + a[2] * b[0],
    a[3] * b[2] + a[0] * b[1] - a[1] * b[0] + a[2] * b[3],
    a[3] * b[3] - a[0] * b[0] - a[1] * b[1] - a[2] * b[2]];
  function qFrom(a, b) { // a → b(단위 벡터)
    const d = dot(a, b);
    if (d > 0.999999) return [0, 0, 0, 1];
    if (d < -0.999999) { let ax = cross([1, 0, 0], a); if (Math.hypot(...ax) < 1e-6) ax = cross([0, 1, 0], a); return qAxis(norm(ax), Math.PI); }
    const c = cross(a, b), q = [c[0], c[1], c[2], 1 + d], l = Math.hypot(...q); return q.map((x) => x / l);
  }
  function qSlerp(a, b, t) {
    let d = a[0] * b[0] + a[1] * b[1] + a[2] * b[2] + a[3] * b[3]; let bb = b;
    if (d < 0) { d = -d; bb = b.map((x) => -x); }
    if (d > 0.9995) { const q = a.map((x, i) => x + (bb[i] - x) * t), l = Math.hypot(...q); return q.map((x) => x / l); }
    const th = Math.acos(d), s = Math.sin(th), wa = Math.sin((1 - t) * th) / s, wb = Math.sin(t * th) / s;
    return a.map((x, i) => x * wa + bb[i] * wb);
  }
  function qRot(q, v) {
    const [x, y, z, w] = q, ix = w * v[0] + y * v[2] - z * v[1], iy = w * v[1] + z * v[0] - x * v[2], iz = w * v[2] + x * v[1] - y * v[0], iw = -x * v[0] - y * v[1] - z * v[2];
    return [ix * w + iw * -x + iy * -z - iz * -y, iy * w + iw * -y + iz * -x - ix * -z, iz * w + iw * -z + ix * -y - iy * -x];
  }

  // ---------- 지금 대륙(경도, 위도) — 대략 ----------
  const PLATES = ['na', 'sa', 'af', 'eu', 'in', 'au', 'an'];
  const POLY = {
    na: [[[-168, 66], [-162, 70], [-140, 70], [-125, 72], [-95, 72], [-80, 73], [-65, 62], [-60, 55], [-55, 50], [-66, 44], [-70, 41], [-76, 35], [-81, 31], [-80, 25], [-83, 29], [-90, 30], [-97, 27], [-97, 21], [-92, 18], [-87, 21], [-83, 15], [-78, 8], [-80, 7], [-86, 12], [-92, 14], [-105, 20], [-110, 24], [-112, 30], [-117, 32], [-121, 35], [-124, 40], [-124, 48], [-133, 56], [-145, 60], [-155, 58], [-165, 60]],
      [[-73, 78], [-60, 82], [-30, 83], [-20, 80], [-20, 72], [-30, 68], [-42, 60], [-50, 62], [-55, 68], [-60, 75]],
      [[-120, 70], [-90, 82], [-70, 83], [-62, 80], [-80, 74], [-110, 72]]],
    sa: [[[-78, 8], [-72, 12], [-62, 10], [-52, 5], [-50, 0], [-44, -2], [-35, -6], [-37, -12], [-40, -22], [-48, -26], [-53, -33], [-58, -38], [-65, -42], [-66, -48], [-69, -52], [-73, -53], [-75, -46], [-73, -37], [-71, -28], [-70, -18], [-76, -14], [-81, -5], [-80, 0], [-77, 4]]],
    af: [[[-17, 21], [-16, 14], [-12, 8], [-8, 5], [-2, 5], [5, 6], [9, 4], [9, -1], [13, -8], [12, -17], [15, -27], [18, -34], [22, -34], [28, -33], [33, -26], [35, -20], [40, -15], [40, -5], [43, 0], [51, 11], [44, 11], [43, 13], [38, 20], [35, 28], [33, 31], [22, 32], [20, 31], [11, 33], [10, 37], [0, 36], [-6, 36], [-10, 30], [-13, 27]],
      [[35, 29], [39, 31], [48, 30], [56, 26], [59, 22], [52, 17], [44, 13], [39, 20]],
      [[44, -25], [47, -25], [50, -15], [49, -12], [44, -17]]],
    eu: [[[-10, 36], [-9, 43], [-2, 44], [-5, 48], [0, 49], [5, 53], [8, 57], [5, 62], [15, 69], [25, 71], [40, 68], [60, 70], [70, 73], [80, 73], [100, 77], [115, 74], [140, 72], [160, 70], [179, 68], [179, 64], [163, 60], [157, 51], [140, 54], [135, 44], [128, 35], [122, 31], [121, 25], [110, 20], [108, 15], [105, 9], [100, 13], [100, 4], [104, 1], [98, 8], [95, 16], [92, 22], [92, 26], [85, 28], [75, 34], [68, 25], [62, 25], [57, 26], [48, 30], [40, 37], [36, 36], [30, 36], [27, 37], [26, 40], [23, 36], [20, 40], [15, 38], [12, 44], [8, 44], [3, 43], [0, 38], [-5, 36]],
      [[-5, 50], [2, 52], [-2, 58], [-6, 58]], [[130, 31], [141, 36], [142, 45], [140, 41], [133, 34]],
      [[95, 5], [106, -6], [115, -8], [118, 2], [109, 4], [103, 6]]],
    in: [[[68, 25], [72, 21], [73, 16], [77, 8], [80, 10], [80, 15], [87, 21], [92, 22], [92, 26], [85, 28], [75, 34]]],
    au: [[[114, -22], [122, -18], [130, -12], [137, -12], [142, -11], [146, -19], [153, -25], [150, -37], [141, -38], [135, -35], [129, -32], [115, -34]]],
  };
  function inPoly(p, poly) {
    let c = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > p[1]) !== (yj > p[1]) && p[0] < (xj - xi) * (p[1] - yi) / (yj - yi) + xi) c = !c;
    }
    return c;
  }
  function plateOf(lon, lat) {
    if (lat < -64 || (lat < -62 && lon > -70 && lon < -56)) return 'an';
    for (const k of ['in', 'af', 'eu', 'na', 'sa', 'au']) if (POLY[k].some((pl) => inPoly([lon, lat], pl))) return k;
    return null;
  }

  // ---------- 판의 옛 자리: 시각(백만 년 전) → [중심 위도, 중심 경도, 돌린 각(도, 바깥에서 보아 시계 반대)] ----------
  // 현재는 그대로. 교과서 그림 I-6(판게아)·I-8(중생대 중기)·I-10(신생대)을 보고 맞춘 대략값
  const TIMES = [300, 252, 150, 66, 0];
  // [위도, 경도, 돌린 각] = 그 시각 판 중심의 자리(절대) · { rel: 판, pole: [위도, 경도], ang } = 다른 판에 붙어 오일러 극을 축으로 돈 자리(상대)
  const KEY = {
    af: [[-26, 10, -14], [-12, 14, -6], [-8, 16, -4], [-2, 18, -2], null],
    sa: [{ rel: 'af', pole: [44, -30.6], ang: 57 }, { rel: 'af', pole: [44, -30.6], ang: 57 }, { rel: 'af', pole: [44, -30.6], ang: 55 }, { rel: 'af', pole: [44, -30.6], ang: 24 }, null],
    na: [{ rel: 'af', pole: [66, -13.5], ang: 56 }, { rel: 'af', pole: [66, -13.5], ang: 75 }, { rel: 'af', pole: [66, -13.5], ang: 62 }, { rel: 'af', pole: [66, -13.5], ang: 26 }, null],
    eu: [{ rel: 'na', pole: [88.5, 27.7], ang: -38 }, { rel: 'na', pole: [88.5, 27.7], ang: -38 }, { rel: 'na', pole: [88.5, 27.7], ang: -36 }, { rel: 'na', pole: [88.5, 27.7], ang: -22 }, null],
    in: [[-36, 52, 70], [-28, 56, 66], [-30, 60, 62], [-12, 68, 24], null],
    an: [[-66, 58, -40], [-60, 62, -40], [-62, 66, -40], [-82, 20, 10], null],
    au: [{ rel: 'an', pole: [-2, 38], ang: -31 }, { rel: 'an', pole: [-2, 38], ang: -31 }, { rel: 'an', pole: [-2, 38], ang: -31 }, { rel: 'an', pole: [-2, 38], ang: -29 }, null],
  };
  const TAUS = {}; // 판 → 시각별 사원수
  const CENTER = {};

  // ---------- 땅 점 ----------
  function build(N) {
    const cells = [];
    const gold = Math.PI * (3 - Math.sqrt(5));
    const sea = [];
    for (let i = 0; i < N; i++) {
      const y = 1 - 2 * (i + 0.5) / N, r = Math.sqrt(1 - y * y), th = i * gold;
      const v = [r * Math.sin(th), y, r * Math.cos(th)], [lon, lat] = toLL(v);
      const k = plateOf(lon, lat);
      if (k) cells.push({ v, lon, lat, k }); else sea.push(v);
    }
    // 바다까지의 거리(지금 해안선 기준, 라디안) — 해수면이 오르면 낮은 해안부터 잠긴다
    const sea3 = sea.filter((_, i) => i % 3 === 0); // 셋에 하나만 견주어도 해안 거리는 충분히 맞다(빠르게)
    for (const c of cells) { let best = -1; for (const s of sea3) { const d = c.v[0] * s[0] + c.v[1] * s[1] + c.v[2] * s[2]; if (d > best) best = d; } c.coast = Math.acos(clamp(best, -1, 1)); }
    // 판 중심과 시각별 사원수
    for (const k of PLATES) {
      const m = [0, 0, 0]; cells.filter((c) => c.k === k).forEach((c) => { m[0] += c.v[0]; m[1] += c.v[1]; m[2] += c.v[2]; });
      const c0 = norm(m); CENTER[k] = c0;
      TAUS[k] = KEY[k].map((kf) => {
        if (!kf) return [0, 0, 0, 1];
        if (kf.rel) return qAxis(vec(kf.pole[1], kf.pole[0]), kf.ang * D2R);
        const c1 = vec(kf[1], kf[0]);
        return qMul(qAxis(c1, kf[2] * D2R), qFrom(c0, c1));
      });
    }
    return cells;
  }
  function plateQ(k, t) {
    const rel = (KEY[k].find((x) => x && x.rel) || {}).rel;
    const own = plateQ0(k, t);
    return rel ? qMul(plateQ(rel, t), own) : own;
  }
  function plateQ0(k, t) {
    const T = TIMES, Q = TAUS[k];
    if (t >= T[0]) return Q[0];
    for (let i = 0; i < T.length - 1; i++) if (t <= T[i] && t >= T[i + 1]) {
      const u = (T[i] - t) / (T[i] - T[i + 1]);
      return qSlerp(Q[i], Q[i + 1], smooth(0, 1, u) * 0.6 + u * 0.4);
    }
    return Q[T.length - 1];
  }

  // ---------- 산맥·화산 지대(지금 자리 기준) ----------
  const RANGES = [
    { k: 'na', name: 'app', pts: [[-84, 34], [-80, 37], [-76, 40], [-72, 43], [-68, 46]], r: 5, h: (t) => 0.32 + 0.68 * smooth(305, 262, t) - 0.62 * smooth(240, 0, t) },
    { k: 'eu', name: 'ural', pts: [[58, 52], [59, 57], [60, 62], [62, 67]], r: 4, h: (t) => 0.25 + 0.75 * smooth(305, 255, t) - 0.65 * smooth(230, 0, t) },
    { k: 'eu', name: 'him', pts: [[73, 35], [78, 33], [83, 30], [88, 28.5], [93, 29], [85, 33], [90, 33]], r: 4.5, h: (t) => smooth(50, 0, t) * 1.25 },
    { k: 'eu', name: 'alps', pts: [[6, 46], [10, 46.5], [14, 47]], r: 3, h: (t) => smooth(40, 0, t) * 0.75 },
    { k: 'sa', name: 'andes', pts: [[-78, 2], [-77, -8], [-72, -16], [-69, -23], [-70, -32], [-71, -40]], r: 3.5, h: (t) => smooth(130, 0, t) * 0.95 },
    { k: 'na', name: 'rock', pts: [[-107, 36], [-110, 42], [-114, 48], [-120, 55], [-130, 60]], r: 4.5, h: (t) => smooth(90, 0, t) * 0.8 },
  ];
  const VOLC = [
    { k: 'eu', name: 'sib', at: [95, 64], r: 9, peak: 252, w: 7 },
    { k: 'in', name: 'dec', at: [75, 19], r: 6, peak: 66, w: 5 },
  ];
  const dist = (a, b) => Math.acos(clamp(dot(a, b), -1, 1)) * R2D;
  function shapes(cells) {
    for (const c of cells) {
      c.rng = RANGES.map((g) => (g.k !== c.k ? 0 : Math.exp(-((Math.min(...g.pts.map((p) => dist(c.v, vec(p[0], p[1])))) / g.r) ** 2))));
      c.vol = VOLC.map((g) => (g.k !== c.k ? 0 : clamp(1 - dist(c.v, vec(g.at[0], g.at[1])) / g.r, 0, 1)));
    }
  }

  // ---------- 시대별 기후(대략) ----------
  // 빙하가 덮는 위도(이 위도보다 극 쪽). 남쪽 / 북쪽
  function iceLat(t, wob) {
    let s = 91, n = 91;
    if (t >= 251) s = 52 + 14 * smooth(300, 251, t);           // 고생대 말 한랭(남쪽 곤드와나 빙하)
    if (t < 36) s = Math.min(s, 64 + 6 * smooth(0, 36, t));    // 남극 대륙에 빙하
    if (t < 3) { const g = wob; n = 74 - 22 * g; s = Math.min(s, 64 - 10 * g); } // 빙하기·간빙기(wob 0 간빙기 ~ 1 빙하기)
    return { s, n };
  }
  // 해수면(0 = 지금쯤, 1 = 아주 높음, 음수 = 낮음)
  function seaLevel(t, wob) {
    let v = 0.15 + 0.85 * Math.exp(-(((t - 95) / 55) ** 2)) - 0.25 * smooth(275, 252, t) * smooth(230, 252, t);
    if (t < 3) v -= 0.1 + 0.6 * wob;
    return v;
  }
  function warmth(t) { // 0 한랭 ~ 1 온난
    if (t > 252) return 0.25 + 0.4 * smooth(300, 252, t) * 0 + 0.35 * smooth(270, 252, t);
    if (t > 66) return 0.95;
    return 0.95 - 0.6 * smooth(50, 0, t);
  }

  // 대륙이 모인 정도(0 흩어짐 ~ 1 판게아): 해안선·얕은 바다·해류·기후대가 따라 바뀐다
  const together = (t) => (t >= 252 ? smooth(305, 256, t) : smooth(120, 250, t));
  window.GlobeData = { vec, toLL, qRot, build, plateQ, plateOf, POLY, KEY, TIMES, PLATES, RANGES, VOLC, shapes, iceLat, seaLevel, warmth, CENTER };

  // ---------- 장 모듈 ----------
  const EVENTS = [
    { id: 'gather', from: 300, to: 258, t: '대륙이 모인다', p: '떨어져 있던 대륙들이 서로 다가와 부딪치고, 맞닿은 자리에 산맥이 솟는다.' },
    { id: 'cold', from: 300, to: 256, t: '남쪽 대륙에 빙하', p: '남극 가까이 있던 대륙이 얼음에 덮였다. 기후가 차가워진다.' },
    { id: 'pangaea', from: 262, to: 238, t: '초대륙 판게아', p: '대륙이 한 덩어리가 되자 해안선이 짧아지고 얕은 바다(대륙붕)가 줄어 바다 생물이 살 곳이 줄었다. 해류가 단순해지고 기후대도 단순해져 안쪽은 메마른 땅이 된다.' },
    { id: 'sib', from: 259, to: 245, t: '시베리아의 큰 화산 활동', p: '용암이 넓은 땅을 덮고 화산 가스가 쏟아져 나온다.', bad: true },
    { id: 'ext1', from: 256, to: 248, t: '고생대 말 대멸종', p: '많은 생물이 사라졌다(삼엽충도 이때). 판게아가 생겨 얕은 바다가 줄고 기후대가 단순해진 것, 큰 화산 활동이 원인으로 꼽힌다.', bad: true },
    { id: 'split', from: 232, to: 150, t: '판게아가 갈라진다', p: '틈으로 바닷물이 들어와 대서양과 인도양이 열리기 시작한다. 해안선과 얕은 바다가 늘고 해류·기후대가 복잡해져 서식지가 다양해진다 → 생물이 늘어난다.' },
    { id: 'warm', from: 245, to: 70, t: '빙하 없는 따뜻한 시대', p: '화산 활동으로 이산화 탄소가 늘어 온실 효과가 커진다. 해수면이 높아 대륙 가장자리가 얕은 바다에 잠긴다.' },
    { id: 'satl', from: 140, to: 0, t: '남대서양이 열린다', p: '남아메리카와 아프리카가 떨어지며 대서양이 남북으로 길어진다.' },
    { id: 'india', from: 130, to: 55, t: '인도가 북쪽으로', p: '인도가 남쪽 대륙에서 떨어져 나와 바다를 건너 북쪽으로 올라간다.' },
    { id: 'dec', from: 71, to: 62, t: '인도 서부의 큰 화산 활동', p: '용암이 넓은 땅을 덮는다.', bad: true },
    { id: 'ext2', from: 69, to: 63, t: '중생대 말 대멸종', p: '운석 충돌과 화산 활동 등으로 환경이 급히 바뀌어 공룡과 암모나이트가 사라졌다.', bad: true },
    { id: 'him', from: 50, to: 0, t: '히말라야산맥이 솟는다', p: '인도가 유라시아에 부딪쳐 땅이 접히고 솟아오른다. 바다에서 쌓인 지층이 산꼭대기까지 올라간다.' },
    { id: 'alps', from: 40, to: 0, t: '알프스산맥이 솟는다', p: '아프리카가 북쪽으로 밀려 유라시아에 부딪친다. 대서양과 인도양은 더 넓어져 수륙 분포가 지금과 비슷해진다.' },
    { id: 'cool', from: 40, to: 3, t: '점점 서늘해진다', p: '남극 대륙에 빙하가 생기고 기온이 차츰 내려간다.' },
    { id: 'ice', from: 3, to: -1, t: '빙하기와 간빙기', p: '빙하기가 네 번, 그 사이 간빙기가 세 번 찾아왔다고 알려져 있다. 빙하기에는 해수면이 낮아져 얕은 바다가 땅으로 드러나고, 그 길로 생물이 다른 대륙으로 건너간다.' },
  ];

  function mount(root) {
    const stage = root.querySelector('.gb-stage'), canvas = stage.querySelector('canvas');
    const range = root.querySelector('#gb-t'), tv = root.querySelector('.gb-tv'), play = root.querySelector('.gb-play');
    const eraEl = root.querySelector('.gb-era'), climEl = root.querySelector('.gb-clim'), seaEl = root.querySelector('.gb-sea');
    const logEl = root.querySelector('.gb-log'), now = stage.querySelector('.gb-now');
    const labs = Object.fromEntries([...stage.querySelectorAll('.gb-lab')].map((e) => [e.dataset.k, e]));
    const extEl = stage.querySelector('.gb-ext'), iceEl = stage.querySelector('.gb-ice');
    const meter = { coast: root.querySelector('.gb-m-coast'), shelf: root.querySelector('.gb-m-shelf'), zone: root.querySelector('.gb-m-zone'), zoneT: root.querySelector('.gb-m-zt') };
    let t = 300, wobT = 0, dirty = true, playing = false, touched = false, wasOld = true;
    const CYC = 9;   // 빙하기 네 번을 보여 주는 데 걸리는 초
    const wobOf = () => (t < 3 && wobT < CYC ? Math.sin(Math.PI * 4 * wobT / CYC) ** 2 : 0);
    const s = window.Scene3D.make(stage, canvas, { view: { yaw: 0.15, pitch: 0.12, dist: 4.1, target: [0, 0, 0] }, fov: 30, min: 2.4, max: 7, pmin: -1.3, pmax: 1.3, onFrame: frame });
    if (!s.ok) {
      const api = { t: (v) => { t = v; panel(); } };
      root._gb = api; range.addEventListener('input', () => { t = 300 - Number(range.value); panel(); });
      panel(); return { setActive() {}, fit() {} };
    }
    const { T, scene } = s;
    s.renderer.setClearColor(new T.Color('#0f1a2c'), 1);
    scene.add(new T.HemisphereLight(0xffffff, 0x36435a, 1.2));
    const sun = new T.DirectionalLight(0xfff4de, 1.8); sun.position.set(3, 2.2, 4); scene.add(sun);
    // 별
    { const g = new T.BufferGeometry(), p = []; for (let i = 0; i < 500; i++) { const v = norm([Math.random() - 0.5, Math.random() - 0.5, Math.random() - 0.5]); p.push(v[0] * 40, v[1] * 40, v[2] * 40); } g.setAttribute('position', new T.Float32BufferAttribute(p, 3)); scene.add(new T.Points(g, new T.PointsMaterial({ color: 0xc9d6ea, size: 0.12 }))); }
    // 바다(꼭짓점 색: 극 쪽 바다 얼음)
    const oceanGeo = new T.SphereGeometry(1, 96, 64);
    const oc = new Float32Array(oceanGeo.attributes.position.count * 3); oceanGeo.setAttribute('color', new T.BufferAttribute(oc, 3));
    const ocean = new T.Mesh(oceanGeo, new T.MeshLambertMaterial({ vertexColors: true })); scene.add(ocean);
    const atmo = new T.Mesh(new T.SphereGeometry(1.07, 48, 32), new T.MeshBasicMaterial({ color: 0x7fb8ff, transparent: true, opacity: 0.09, side: T.BackSide })); scene.add(atmo);
    const tilt = new T.Group(); scene.add(tilt);

    const cells = build(26000); shapes(cells);
    const n = cells.length;
    const geo = new T.CylinderGeometry(0.0138, 0.0138, 1, 6); geo.translate(0, 0.5, 0);
    const land = new T.InstancedMesh(geo, new T.MeshLambertMaterial({ color: 0xffffff }), n);
    land.instanceMatrix.setUsage(T.DynamicDrawUsage); tilt.add(land);
    const M = new T.Matrix4(), Qt = new T.Quaternion(), P = new T.Vector3(), S = new T.Vector3(), UP = new T.Vector3(0, 1, 0), C = new T.Color(), Nv = new T.Vector3();
    // 바다 사이 갈라진 골(대서양 중앙 해령) — 맞붙어 있던 해안 짝의 가운데
    const PAIRS = [[['na', -60, 64], ['eu', -14, 64]], [['na', -55, 51], ['eu', -9, 44]], [['na', -66, 43], ['af', -10, 31]], [['na', -76, 33], ['af', -17, 21]], [['sa', -52, 5], ['af', -16, 12]], [['sa', -35, -6], ['af', 8, 4]], [['sa', -40, -22], ['af', 12, -12]], [['sa', -53, -33], ['af', 15, -27]], [['sa', -66, -50], ['af', 20, -36]]];
    const ridgeGeo = new T.BufferGeometry(); ridgeGeo.setAttribute('position', new T.Float32BufferAttribute(new Float32Array(PAIRS.length * 3), 3));
    const ridge = new T.Line(ridgeGeo, new T.LineBasicMaterial({ color: 0xff7a3a, transparent: true, opacity: 0 })); tilt.add(ridge);
    // 화산 연기
    const smokeMat = new T.MeshBasicMaterial({ color: 0x55504a, transparent: true, opacity: 0.55, depthWrite: false });
    const puffs = Array.from({ length: 36 }, (_, i) => { const m = new T.Mesh(new T.SphereGeometry(0.03, 8, 6), smokeMat.clone()); m.userData = { v: i % 2, u: (i / 18) % 1 }; m.visible = false; tilt.add(m); return m; });
    // 운석 충돌(중생대 말) 자리: 멕시코
    const crater = new T.Mesh(new T.TorusGeometry(0.05, 0.012, 8, 28), new T.MeshBasicMaterial({ color: 0xffd23a })); crater.visible = false; tilt.add(crater);
    const IMPACT = { k: 'na', at: vec(-89, 21) };
    const rot = (k, v, tt) => qRot(plateQ(k, tt), v);
    const v3 = (a, r = 1) => P.set(a[0] * r, a[1] * r, a[2] * r);

    const pal = {
      trop: new T.Color('#2f7d3b'), dry: new T.Color('#d9be78'), temp: new T.Color('#5f9e4f'), cold: new T.Color('#a7b79c'),
      mount: new T.Color('#8a6a48'), snow: new T.Color('#f4f8fb'), ice: new T.Color('#eef6fb'), lava: new T.Color('#ff5a1f'), shelf: new T.Color('#5fb7d6'),
      sea: new T.Color('#2a64a8'), seaD: new T.Color('#1d4a86'), seaIce: new T.Color('#dfeef7'),
    };

    function draw() {
      const wob = wobOf();
      const ice = iceLat(t, wob), sl = seaLevel(t, wob), w = warmth(t);
      const rq = Object.fromEntries(PLATES.map((k) => [k, plateQ(k, t)]));
      const rh = RANGES.map((g) => Math.max(0, g.h(t)));
      const vh = VOLC.map((g) => Math.exp(-(((t - g.peak) / g.w) ** 2)));
      // 안쪽(바다에서 먼 정도): 같은 시각 다른 판 점과의 가까움은 계산이 커서, 판게아 시기에는 판 중심 가까운 곳을 메마르게 둔다
      const pang = smooth(300, 262, t) * smooth(170, 240, t);
      const pc = norm(qRot(rq.af, vec(5, 20)));
      for (let i = 0; i < n; i++) {
        const c = cells[i], p = qRot(rq[c.k], c.v), lat = Math.asin(clamp(p[1], -1, 1)) * R2D, al = Math.abs(lat);
        let h = 0; for (let j = 0; j < RANGES.length; j++) if (c.rng[j]) h = Math.max(h, c.rng[j] * rh[j]);
        let vol = 0; for (let j = 0; j < VOLC.length; j++) if (c.vol[j]) vol = Math.max(vol, c.vol[j] * vh[j]);
        // 기후대(따뜻할수록 띠가 극 쪽으로 넓어진다)
        const sh = 1 + 0.35 * (w - 0.6);
        if (al < 14 * sh) C.copy(pal.trop); else if (al < 34 * sh) C.copy(pal.dry); else if (al < 58 * sh) C.copy(pal.temp); else C.copy(pal.cold);
        const inner = pang * clamp(1 - dist(p, pc) / 38, 0, 1) * clamp((al - 5) / 20, 0, 1);
        if (inner > 0) C.lerp(pal.dry, clamp(inner * 1.6, 0, 1));
        let top = 0.008 + h * 0.055;
        const flooded = h < 0.12 && vol < 0.1 && c.coast < Math.max(0, sl) * 0.09;
        if (h > 0.05) C.lerp(pal.mount, clamp(h * 1.4, 0, 1));
        if (h > 0.55) C.lerp(pal.snow, clamp((h - 0.55) * 2.2, 0, 1));
        const iced = lat < -ice.s || lat > ice.n;
        if (iced) { C.copy(pal.ice); top += 0.006; }
        if (flooded) { C.copy(pal.shelf); top = 0.003; }
        if (vol > 0.08) { C.lerp(pal.lava, clamp(vol * 1.3, 0, 0.95)); top += vol * 0.01; }
        Nv.set(p[0], p[1], p[2]); Qt.setFromUnitVectors(UP, Nv);
        M.compose(P.set(p[0] * 0.995, p[1] * 0.995, p[2] * 0.995), Qt, S.set(1, top, 1));
        land.setMatrixAt(i, M); land.setColorAt(i, C);
      }
      land.instanceMatrix.needsUpdate = true; if (land.instanceColor) land.instanceColor.needsUpdate = true;
      // 바다 색(얼음)
      const pos = oceanGeo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const lat = Math.asin(clamp(pos.getY(i), -1, 1)) * R2D;
        C.copy(pal.sea).lerp(pal.seaD, Math.abs(lat) / 90 * 0.6);
        if (lat < -(ice.s + 6) || lat > ice.n + 6) C.copy(pal.seaIce);
        oc[i * 3] = C.r; oc[i * 3 + 1] = C.g; oc[i * 3 + 2] = C.b;
      }
      oceanGeo.attributes.color.needsUpdate = true;
      // 해령
      const rp = ridgeGeo.attributes.position; let open = 0;
      PAIRS.forEach(([a, b], i) => { const pa = qRot(rq[a[0]], vec(a[1], a[2])), pb = qRot(rq[b[0]], vec(b[1], b[2])); const m = norm([pa[0] + pb[0], pa[1] + pb[1], pa[2] + pb[2]]); rp.setXYZ(i, m[0] * 1.004, m[1] * 1.004, m[2] * 1.004); open += dist(pa, pb); });
      rp.needsUpdate = true; open /= PAIRS.length;
      ridge.material.opacity = clamp((open - 8) / 14, 0, 1);
      // 연기
      puffs.forEach((m) => { m.visible = vh[m.userData.v] > 0.2; });
      // 운석 자리
      const ci = clamp(1 - Math.abs(t - 66) / 3, 0, 1);
      crater.visible = ci > 0; if (ci > 0) { const p = rot(IMPACT.k, IMPACT.at, t); Nv.set(p[0], p[1], p[2]); crater.position.set(p[0] * 1.012, p[1] * 1.012, p[2] * 1.012); crater.quaternion.setFromUnitVectors(new T.Vector3(0, 0, 1), Nv); crater.scale.setScalar(0.6 + ci); }
      // 이름표
      const lab = (k, on, at) => { const e = labs[k]; if (!e) return; e.classList.toggle('off', !on); if (on) e._at = at; };
      lab('pangaea', pang > 0.6, () => new T.Vector3(...pc).multiplyScalar(1.08));
      const mid = ridgeGeo.attributes.position; const mi = 4;
      lab('atl', ridge.material.opacity > 0.5, () => new T.Vector3(mid.getX(mi), mid.getY(mi), mid.getZ(mi)).multiplyScalar(1.06));
      lab('him', rh[2] > 0.45, () => { const p = rot('eu', vec(85, 30), t); return new T.Vector3(...p).multiplyScalar(1.12); });
      lab('app', rh[0] > 0.8 && t > 200, () => { const p = rot('na', vec(-78, 39), t); return new T.Vector3(...p).multiplyScalar(1.1); });
      lab('alps', rh[3] > 0.4, () => { const p = rot('eu', vec(10, 46.5), t); return new T.Vector3(...p).multiplyScalar(1.1); });
      lab('sib', vh[0] > 0.3, () => { const p = rot('eu', vec(95, 64), t); return new T.Vector3(...p).multiplyScalar(1.12); });
      lab('dec', vh[1] > 0.3, () => { const p = rot('in', vec(75, 19), t); return new T.Vector3(...p).multiplyScalar(1.12); });
      lab('ice', ice.s < 70 || ice.n < 75, () => new T.Vector3(0, ice.n < 75 ? 1.12 : -1.12, 0));
      lab('impact', ci > 0.3, () => { const p = rot(IMPACT.k, IMPACT.at, t); return new T.Vector3(...p).multiplyScalar(1.12); });
      Object.values(labs).forEach((e) => { if (!e._bound) { e._bound = true; s.label(e, () => (e._at ? e._at() : new T.Vector3(0, 0, -9))); } });
      panel(sl);
    }
    function frame(dt) {
      if (playing) { t = Math.max(0, t - dt * 22); range.value = String(Math.round(300 - t)); if (t <= 0) setPlay(false); dirty = true; }
      if (t < 3) { if (wasOld) { wasOld = false; wobT = 0; } if (wobT < CYC) { wobT += dt; dirty = true; } } else wasOld = true;
      // 연기 오르기
      puffs.forEach((m) => {
        if (!m.visible) return; m.userData.u = (m.userData.u + dt * 0.35) % 1;
        const g = VOLC[m.userData.v], p = rot(g.k, vec(g.at[0] + Math.sin(m.id) * 3, g.at[1] + Math.cos(m.id) * 2), t), u = m.userData.u;
        m.position.set(p[0] * (1.02 + u * 0.16), p[1] * (1.02 + u * 0.16), p[2] * (1.02 + u * 0.16)); m.scale.setScalar(0.6 + u * 2.2); m.material.opacity = 0.6 * (1 - u);
      });
      if (dirty) { dirty = false; draw(); }
      if (typeof hideBack === 'function') hideBack();
    }
    function eraOf(tt) { return tt >= 251.5 ? '고생대' : tt >= 65.5 ? '중생대' : '신생대'; }
    let lastLog = '';
    function panel(sl = seaLevel(t, wobOf())) {
      const ma = t / 100;
      tv.textContent = t < 0.5 ? '현재' : `약 ${ma.toFixed(ma < 1 ? 2 : 1)}억 년 전`;
      const era = eraOf(t); eraEl.textContent = t < 0.5 ? '신생대(현재)' : era + (t >= 251.5 ? (t > 262 ? ' 후기' : ' 말') : t >= 65.5 && t < 72 ? ' 말' : '');
      eraEl.dataset.era = era;
      const w = warmth(t), ice = iceLat(t, 0);
      climEl.textContent = t < 3 ? '빙하기·간빙기 되풀이' : ice.s < 75 && t >= 251 ? '한랭(남쪽 빙하)' : w > 0.85 ? '온난(빙하 없음)' : w > 0.6 ? '온난 → 서늘' : '서늘(남극 빙하)';
      seaEl.textContent = sl > 0.6 ? '높다(대륙 가장자리가 잠김)' : sl > 0.2 ? '보통' : '낮다';
      const tog = together(t), coast = 1 - 0.6 * tog, shelf = clamp(0.62 * coast + 0.42 * clamp(sl, -0.4, 1) - 0.05, 0.04, 1), zones = 1 - 0.55 * tog;
      meter.coast.style.width = (coast * 100).toFixed(0) + '%'; meter.shelf.style.width = (shelf * 100).toFixed(0) + '%'; meter.zone.style.width = (zones * 100).toFixed(0) + '%';
      meter.zoneT.textContent = zones > 0.75 ? '다양' : zones > 0.6 ? '보통' : '단순';
      const glac = t < 3 && wobT < CYC ? Math.min(4, Math.floor(4 * wobT / CYC) + 1) : 0, w2 = wobOf();
      iceEl.textContent = glac ? (w2 > 0.5 ? `빙하기 ${glac}번째` : '간빙기') : ''; iceEl.classList.toggle('off', !glac);
      const on = EVENTS.filter((e) => t <= e.from && t >= e.to);
      const key = on.map((e) => e.id).join();
      if (key !== lastLog) {
        lastLog = key;
        logEl.innerHTML = on.slice(-3).map((e) => `<li class="${e.bad ? 'bad' : ''}"><b>${e.t}</b><span>${e.p}</span></li>`).join('') || '<li><b>시간 막대를 밀어 보자</b><span>대륙이 어떻게 움직이는지 지켜보자.</span></li>';
      }
      const ext = on.find((e) => e.id === 'ext1' || e.id === 'ext2');
      extEl.textContent = ext ? ext.t : ''; extEl.classList.toggle('off', !ext);
      if (now) { now.textContent = !touched ? '① 시간 막대를 밀어 판게아를 만들어 보자' : t > 262 ? '대륙이 모이고 있다 — 산맥을 보자' : t > 230 ? '② 판게아! 계속 밀어 갈라지게 하자' : t > 60 ? '대서양이 열린다 · 지구를 끌어 돌려 보자' : t > 3 ? '인도가 아시아에 부딪친다' : '빙하가 넓어졌다 줄었다 한다'; now.classList.toggle('done', t < 3); }
    }
    const setT = (v) => { t = clamp(v, 0, 300); range.value = String(Math.round(300 - t)); dirty = true; if (!s.active) frame(0), s.render(); };
    range.addEventListener('input', () => { touched = true; setPlay(false); t = 300 - Number(range.value); dirty = true; if (!s.active) { frame(0); s.render(); } });
    range.addEventListener('keydown', (e) => e.stopPropagation());
    function setPlay(on) { playing = on; play.setAttribute('aria-pressed', String(on)); play.textContent = on ? '멈추기' : '흘려 보기'; if (on) { touched = true; if (t <= 0.5) t = 300; } }
    play.addEventListener('click', () => setPlay(!playing));
    // 판게아 자리로 돌려 보기 단추들
    root.querySelectorAll('.gb-jump').forEach((b) => b.addEventListener('click', () => { touched = true; setPlay(false); setT(Number(b.dataset.t)); }));
    // 대륙 이름표(판에 붙어 함께 움직인다)와 누르면 나오는 풀이(2026-10-30 2차: 설명 장)
    const CONT = { na: '북아메리카', sa: '남아메리카', af: '아프리카', eu: '유라시아', in: '인도', au: '오스트레일리아', an: '남극' };
    const INFO = {
      na: '고생대 말에는 유럽·아프리카와 붙어 판게아의 북서쪽을 이루었다. 중생대에 떨어져 나가며 그 사이에 대서양이 열렸다.',
      sa: '아프리카와 맞붙어 있다가 중생대에 떨어졌다. 두 대륙의 해안선 모양이 서로 맞물린다.',
      af: '판게아의 한가운데에 있었다. 신생대에 북쪽으로 밀려 유럽에 부딪쳐 알프스산맥이 솟았다.',
      eu: '판게아의 북쪽 부분. 신생대에 인도가 남쪽에서 부딪쳐 히말라야산맥이 솟았다.',
      in: '남쪽 대륙들 사이에 붙어 있다가 떨어져 나와 바다를 건너 북쪽으로 올라갔다.',
      au: '남극과 붙어 있다가 신생대에 떨어져 북쪽으로 옮겨 갔다.',
      an: '지금은 얼음에 덮였지만, 옛날엔 더 따뜻한 위도에 있어 식물 화석이 나온다.',
      pangaea: '고생대 말 거의 모든 대륙이 모인 하나의 초대륙. 해안선이 짧아지고 안쪽은 메말랐다.',
      atl: '판게아가 갈라진 틈에 바닷물이 들어 생긴 바다. 가운데 해령(주황 줄)에서 새 바닥이 생기며 지금도 넓어진다.',
      app: '대륙이 모일 때 맞부딪친 자리에 솟은 산맥(북아메리카 동쪽). 오랜 세월 깎여 지금은 낮다.',
      him: '신생대에 인도가 유라시아에 부딪쳐 솟았다. 꼭대기 지층에서 바다 생물 화석이 나온다.',
      alps: '신생대에 아프리카가 유라시아 쪽으로 밀려 부딪쳐 솟았다.',
      sib: '고생대 말 시베리아에서 아주 큰 화산 활동이 오래 이어졌다(4차시 대멸종의 증거).',
      dec: '중생대 말 인도 서부에서 큰 화산 활동이 있었다.',
      impact: '중생대 말 멕시코 유카탄반도에 큰 운석이 떨어졌다(4차시 대멸종의 증거).',
      ice: '추운 시기에 극 쪽 땅과 바다를 덮은 빙하. 빙하가 넓어지면 해수면이 낮아진다.',
    };
    const pn = root.querySelector('.gb-pn'), pd = root.querySelector('.gb-pd'), pcard = root.querySelector('.gb-part');
    let selK = null;
    function info(k) {
      selK = selK === k ? null : k;
      stage.querySelectorAll('.g3-label').forEach((e) => e.classList.toggle('on', (e.dataset.k || e.dataset.c) === selK));
      if (pn) { pn.textContent = selK ? (CONT[selK] || stage.querySelector(`.gb-lab[data-k="${selK}"]`).textContent) : '이름표를 눌러 보자'; pd.textContent = selK ? INFO[selK] : '대륙이나 산맥·바다에 붙은 이름표를 누르면 그곳의 이야기가 나온다.'; pcard.classList.toggle('on', !!selK); }
    }
    const contBox = stage.querySelector('.gb-conts');
    const conts = contBox ? Object.entries(CONT).map(([k, n]) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'g3-label gb-cont'; b.dataset.c = k; b.textContent = n; contBox.appendChild(b);
      b.addEventListener('click', () => info(k));
      const off = { an: [0, -0.1, 0] }[k];
      s.label(b, () => { const p = qRot(plateQ(k, t), CENTER[k]); return new T.Vector3(p[0], p[1], p[2]).multiplyScalar(1.1); });
      return { b, k };
    }) : [];
    Object.entries(labs).forEach(([k, e]) => { e.addEventListener('click', () => info(k)); });
    // 지구 뒤쪽으로 돌아간 이름표는 숨긴다
    const cam = new T.Vector3(), pos = new T.Vector3();
    function hideBack() {
      cam.copy(s.camera.position).normalize();
      conts.forEach(({ b, k }) => { const p = qRot(plateQ(k, t), CENTER[k]); pos.set(p[0], p[1], p[2]); const v = pos.dot(cam) > 0.2; b.classList.toggle('back', !v); });
      Object.values(labs).forEach((e) => { if (!e._at) return; const v = e._at().normalize().dot(cam) > 0.15; e.classList.toggle('back', !v); });
    }
    const home = root.querySelector('.g3-home'); if (home) home.addEventListener('click', () => s.home());
    info(null); selK = null; if (pn) info(null);
    root._gb = { t: (v) => { touched = true; setT(v); }, look: (yaw, pitch, dist) => s.look({ yaw, pitch, dist }, 0.01), play: setPlay, info };
    draw();
    // 눈금을 막대의 실제 자리에 맞춘다(엄지 반지름만큼 안쪽)
    const ticks = root.querySelector('.gb-ticks');
    function placeTicks() {
      const box = ticks.parentElement, br = box.getBoundingClientRect(), ir = range.getBoundingClientRect(), k = br.width / (box.offsetWidth || 1);
      if (!ir.width) return;
      const pad = parseFloat(getComputedStyle(box).paddingLeft) + parseFloat(getComputedStyle(box).borderLeftWidth);
      ticks.style.marginLeft = ((ir.left - br.left) / k - pad + 19) + 'px'; ticks.style.width = (ir.width / k - 38) + 'px';
    }
    return {
      setActive(on) { s.setActive(on); if (!on) setPlay(false); else placeTicks(); dirty = true; },
      fit() { s.fit(); placeTicks(); },
    };
  }

  window.Globe = { mount };
})();
