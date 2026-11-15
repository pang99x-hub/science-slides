/* 물과 산화 칼슘 조리 장치의 온도 모형(1-2-3 3차시 공용). 실제 측정값이 아니라 교과서 예시 결과
   «주머니 3개 + 물 120 mL → 조리 용기 물 300 mL가 약 80 °C, 5분쯤 유지»(59쪽)에 맞춘 두 칸 열 모형이다.
   반응 용기(산화 칼슘 + 물) → 조리 용기(음식) → 바깥 공기로 열이 흐른다. 100 °C를 넘는 몫은 물을 김으로 날린다.
   LimeModel.run({ n: 주머니 수(10 g씩), water: 반응 용기 물 mL, food: 조리 용기 내용물 mL, lid, wrap, cold(질산 암모늄 주머니로 바꿈), min: 분 })
   → { t[], tr[], tf[], steam[], peak, hold(최고 온도 −5 °C 이상 유지한 분), risk(0~1 김이 튈 위험) } (10초 간격) */
(function () {
  'use strict';
  const T0 = 20, QP = 70000, TAU = 200, DT = 1;
  function run(o) {
    const n = o.n, food = o.food ?? 300, min = o.min ?? 20;
    let water = o.water ?? 120, tr = T0, tf = T0, left = n * QP * (o.cold ? -0.22 : 1), steamNow = 0, steamSum = 0;
    const out = { t: [], tr: [], tf: [], steam: [] };
    const cf = food * 4.0 + 160;
    for (let s = 0; s <= min * 60; s += DT) {
      if (s % 10 === 0) { out.t.push(s / 60); out.tr.push(tr); out.tf.push(tf); out.steam.push(steamNow); }
      // 물이 모자라면 덜 반응하고(남은 가루), 반응 속도도 느려진다
      const wet = Math.min(1, water / (n * 22));
      const rel = left / TAU * DT * (0.35 + 0.65 * wet);
      left -= rel;
      const cr = Math.max(30, water) * 4.18 + n * 9 + 180;
      const contact = Math.min(1, 0.45 + water / 220);
      const kRF = 14 * contact, kRA = o.wrap ? 0.4 : 1.0, kFA = o.lid ? 0.7 : 1.6;
      const qRF = kRF * (tr - tf), qRA = kRA * (tr - T0), qFA = kFA * (tf - T0);
      tr += (rel - (qRF + qRA) * DT) / cr;
      tf += (qRF - qFA) * DT / cf;
      steamNow = 0;
      if (tr > 100) { const ex = (tr - 100) * cr; tr = 100; const m = ex / 2257; water = Math.max(5, water - m); steamNow = m / DT; steamSum += m; }
      if (tf > 99) tf = 99;
    }
    const peak = Math.max(...out.tf);
    const hold = out.tf.filter((v) => v >= peak - 5).length * 10 / 60;
    // 김이 튈 위험: 주머니가 많고 물이 적을수록, 뚜껑 없이 끓을수록
    const risk = o.cold ? 0 : Math.min(1, steamSum / 30 + Math.max(0, n * 22 - (o.water ?? 120)) / 160);
    return { ...out, peak, hold, risk, dry: (o.water ?? 120) < n * 22 };
  }
  // 조리 용기 온도가 need °C 이상인 시간(분)
  const above = (r, need) => r.tf.filter((v) => v >= need).length * 10 / 60;
  // 음식마다 익는 조건(이해를 돕기 위한 예): need °C 이상을 min분 넘게
  const FOODS = {
    milk: { name: '데운 우유', need: 50, min: 3 },
    soup: { name: '크림 수프', need: 58, min: 4 },
    egg: { name: '달걀찜', need: 75, min: 8 },
    ramen: { name: '컵라면', need: 90, min: 4 },
  };
  window.LimeModel = { run, above, T0, FOODS };
  if (typeof module !== 'undefined') module.exports = window.LimeModel;
})();
