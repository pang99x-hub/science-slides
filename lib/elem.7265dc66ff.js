/* 2-1 3·4차시 원소 자료. Elem.all[z-1] = { z, s(기호), n(이름), g(족, 란타넘·악티늄족은 0), p(주기), k: 'm'|'n'|'x'|'u'(금속·비금속·준금속·미분류), st: 's'|'l'|'g'(실온 상태) }
   Elem.shells(z) → [2, 8, …](원자 번호 20까지, 보어 모형) · Elem.valence(z) → 원자가 전자 수(18족 0) · Elem.pos(e) → 표 칸 [열, 행](란타넘족·악티늄족은 아래 두 줄) */
(function () {
  'use strict';
  const S = 'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe Cs Ba La Ce Pr Nd Pm Sm Eu Gd Tb Dy Ho Er Tm Yb Lu Hf Ta W Re Os Ir Pt Au Hg Tl Pb Bi Po At Rn Fr Ra Ac Th Pa U Np Pu Am Cm Bk Cf Es Fm Md No Lr Rf Db Sg Bh Hs Mt Ds Rg Cn Nh Fl Mc Lv Ts Og'.split(' ');
  const N = '수소 헬륨 리튬 베릴륨 붕소 탄소 질소 산소 플루오린 네온 나트륨 마그네슘 알루미늄 규소 인 황 염소 아르곤 칼륨 칼슘 스칸듐 타이타늄 바나듐 크로뮴 망가니즈 철 코발트 니켈 구리 아연 갈륨 저마늄 비소 셀레늄 브로민 크립톤 루비듐 스트론튬 이트륨 지르코늄 나이오븀 몰리브데넘 테크네튬 루테늄 로듐 팔라듐 은 카드뮴 인듐 주석 안티모니 텔루륨 아이오딘 제논 세슘 바륨 란타넘 세륨 프라세오디뮴 네오디뮴 프로메튬 사마륨 유로퓸 가돌리늄 터븀 디스프로슘 홀뮴 어븀 툴륨 이터븀 루테튬 하프늄 탄탈럼 텅스텐 레늄 오스뮴 이리듐 백금 금 수은 탈륨 납 비스무트 폴로늄 아스타틴 라돈 프랑슘 라듐 악티늄 토륨 프로트악티늄 우라늄 넵투늄 플루토늄 아메리슘 퀴륨 버클륨 캘리포늄 아인슈타이늄 페르뮴 멘델레븀 노벨륨 로렌슘 러더포듐 더브늄 시보귬 보륨 하슘 마이트너륨 다름슈타튬 뢴트게늄 코페르니슘 니호늄 플레로븀 모스코븀 리버모륨 테네신 오가네손'.split(' ');
  const NONMETAL = new Set([1, 2, 6, 7, 8, 9, 10, 15, 16, 17, 18, 34, 35, 36, 53, 54, 86]);
  const METALLOID = new Set([5, 14, 32, 33, 51, 52]);
  const UNK = new Set([113, 115, 117, 118]);
  const GAS = new Set([1, 2, 7, 8, 9, 10, 17, 18, 36, 54, 86]), LIQ = new Set([35, 80]);
  function place(z) {
    const P = [[1, 2], [3, 10], [11, 18], [19, 36], [37, 54], [55, 86], [87, 118]];
    const p = P.findIndex(([a, b]) => z >= a && z <= b) + 1, first = P[p - 1][0];
    if (z === 1) return [1, 1]; if (z === 2) return [18, 1];
    if (p <= 3) { const i = z - first; return [i < 2 ? i + 1 : i + 10 + (p === 1 ? 0 : 0) + 0, p].map((v, j) => (j === 0 && i >= 2 ? i + 11 - 0 : v)); }
    if (p <= 5) return [z - first + 1, p];
    const off = z - first;                       // 6·7주기: 3족 자리 다음 15개는 아래 줄
    if (off < 2) return [off + 1, p];
    if (off >= 2 && off <= 16) return [0, p];   // 란타넘족·악티늄족
    return [off - 13, p];
  }
  const all = S.map((s, i) => {
    const z = i + 1; let [g, p] = place(z);
    if (p <= 3 && z > 2) { const first = p === 2 ? 3 : 11, k = z - first; g = k < 2 ? k + 1 : k + 11; }
    return { z, s, n: N[i], g, p, k: UNK.has(z) ? 'u' : NONMETAL.has(z) ? 'n' : METALLOID.has(z) ? 'x' : 'm', st: GAS.has(z) ? 'g' : LIQ.has(z) ? 'l' : 's' };
  });
  function pos(e) {
    if (e.g) return [e.g, e.p];
    const base = e.p === 6 ? 57 : 89; return [3 + (e.z - base), e.p + 2.6];   // 아래 두 줄
  }
  function shells(z) { const out = []; let r = z; [2, 8, 8, 2].forEach((m) => { if (r > 0) { out.push(Math.min(m, r)); r -= m; } }); return out; }
  function valence(z) { const e = all[z - 1]; if (e.g === 18) return 0; const sh = shells(z); return sh[sh.length - 1]; }
  window.Elem = { all, pos, shells, valence, get: (z) => all[z - 1] };
})();
