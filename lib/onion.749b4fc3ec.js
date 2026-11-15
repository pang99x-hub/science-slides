/* 3-3 3차시 체험 «양파 표피세포 관찰»(교과서 153쪽 탐구 1 + 참고서 탐구 자료창 «세포막을 통한 물질의 이동 실험» + 원형질 복귀는 다른 교과서 내용).
   실험대(가상 1060×620): 왼쪽 도마에 반 자른 적양파 · 칼집 낸 비늘잎 · 면도칼, 가운데 페트리접시 둘(증류수 · 10 % 소금물) · 받침 유리 둘,
   뒤쪽에 덮개 유리 · 증류수 스포이트 · 거름종이, 오른쪽에 현미경과 거치대에 꽂힌 스마트 기기(현미경 시야가 보이는 화면).
   ① 칼집 낸 네모를 핀셋으로 집어 끌면 바깥 표피가 벗겨진다 → 접시에 담근다(5분, 1초 = 1분으로 빨리 감음) → 받침 유리에 올린다(같은 용액 한 방울)
      → 덮개 유리를 덮는다 → 받침 유리를 재물대로 끌어 올린다 → 초점 손잡이를 위아래로 돌린다.
   ② 증류수 쪽은 붉은 세포가 세포벽까지 꽉 차 팽팽하고, 소금물 쪽은 시간이 지나며 붉은 원형질(세포막)이 세포벽에서 떨어진다(원형질분리).
   ③ 소금물 표본의 덮개 유리 한쪽에 증류수를 떨어뜨리고 반대쪽에 거름종이를 대면 용액이 바뀌어 다시 부푼다(원형질 복귀).
   초점이 맞으면 스마트 기기가 찍어 오른쪽 표에 기록한다. 빠르기·세포 모양은 이해를 돕기 위한 예.
   키보드: 1 증류수 표본 다음 순서 · 2 소금물 표본 다음 순서 · 3 증류수 넣고 거름종이 대기 · ↑↓ 초점 · 0 처음부터.
   Onion.mount(root) → { fit, setActive } · 시험용: root._on.next('water'|'salt') · refill() · focus(값) · run(초) · state() · toScreen(x, y) · P(장소 이름) */
(function () {
  'use strict';
  const TAU = Math.PI * 2, VW = 1060, VH = 620, BENCH = 300, SOAK = 5;
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, k) => a + (b - a) * k;
  const hash = (i, k) => { const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); };
  const F = (w, s) => `${w} ${s}px "IBM Plex Sans KR", sans-serif`;
  const mix = (a, b, k) => { const p = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)); const A = p(a), B = p(b); return `rgb(${A.map((v, i) => Math.round(lerp(v, B[i], k))).join(',')})`; };
  const NAME = { water: '증류수', salt: '10 % 소금물' };
  // 자리
  const CUTS = [{ x: 168, y: 516 }, { x: 226, y: 512 }];          // 비늘잎에 낸 칼집(5 mm 네모)
  const DISH = { water: { x: 356, y: 412 }, salt: { x: 502, y: 412 } }, DRX = 62, DRY = 25;
  const SHOME = [{ x: 362, y: 540 }, { x: 506, y: 540 }], SW = 128, SH = 34;
  const COVER = { x: 316, y: 330 }, DROP = { x: 424, y: 316 }, PAPER = { x: 538, y: 332 };
  const STAGE = { x: 664, y: 458 }, KNOB = { x: 776, y: 512 }, VC = { x: 910, y: 172 }, VR = 136;
  const BEST = 0.64;
  const ROWS = {
    water: ['증류수', '세포막이 세포벽에 붙어 <b>팽팽</b>', '들어오는 물이 더 많다'],
    salt: ['10 % 소금물', '세포막이 세포벽에서 <b>떨어짐</b>(원형질분리)', '나가는 물이 더 많다'],
    back: ['소금물 → 증류수', '세포막이 다시 세포벽 쪽으로(<b>원형질 복귀</b>)', '물이 다시 들어온다'],
  };

  function mount(root) {
    const stage = root.querySelector('.on-stage'), out = root.querySelector('.on-out'), tb = root.querySelector('.on-tab tbody');
    const P = window.Play;
    let t, pieces, cuts, slides, onStage, carry, focus, knobA, rec, flash, msg, bad, seen;

    function reset() {
      t = 0; pieces = []; cuts = CUTS.map(() => false); onStage = -1; carry = null; focus = 0.2; knobA = 0; flash = 0; bad = 0; seen = 0;
      slides = SHOME.map((h, i) => ({ i, x: h.x, y: h.y, piece: null, cover: false, edge: false, wick: -1 }));
      rec = { water: false, salt: false, back: false }; msg = '';
      say('① <b>핀셋</b>으로 비늘잎의 칼집 낸 네모를 집어 끌면 바깥 표피가 벗겨진다 — <b>증류수 접시</b>에 담그자');
      table(); steps();
    }
    const say = (h) => { if (h !== msg) { msg = h; out.innerHTML = h; } };
    const warn = (h) => { say(h); bad = t; };

    // ── 판정 ──
    const inDish = (x, y) => Object.keys(DISH).find((k) => ((x - DISH[k].x) / (DRX + 8)) ** 2 + ((y - DISH[k].y) / (DRY + 16)) ** 2 < 1);
    const inSlide = (x, y, s) => Math.abs(x - s.x) < SW / 2 + 6 && Math.abs(y - s.y) < SH / 2 + 10;
    const inStage = (x, y) => x > 590 && x < 790 && y > 380 && y < 500;
    const homeSlide = (x, y) => slides.find((s) => s.i !== onStage && inSlide(x, y, s));
    const pieceOf = (kind) => pieces.find((p) => p.kind === kind);
    const cur = () => (onStage >= 0 ? slides[onStage] : null);
    function place(s) { if (s.i === onStage) { s.x = STAGE.x; s.y = STAGE.y; } else { s.x = SHOME[s.i].x; s.y = SHOME[s.i].y; } }

    // ── 동작(끌기·키보드·시험이 함께 쓴다) ──
    function peel(ci, dish) {
      if (cuts[ci] || pieceOf(dish)) return false;
      cuts[ci] = true; const pc = { kind: dish, env: dish, where: 'dish', soak: 0, p: 0, seed: pieces.length + 1 }; pieces.push(pc);
      say(`표피 조각을 <b>${NAME[dish]}</b> 접시에 담갔다 — ${SOAK}분 동안 담가 두자${pieces.length < 2 ? ` · 다른 조각은 <b>${NAME[dish === 'water' ? 'salt' : 'water']}</b>에` : ''}`);
      steps(); return true;
    }
    function toSlide(pc, s) {
      if (!s || s.piece) { warn('비어 있는 <b>받침 유리</b> 위에 올리자'); return false; }
      if (pc.soak < SOAK) { warn(`아직 ${Math.floor(pc.soak)}분 — 교과서대로 <b>${SOAK}분</b> 동안 담가 두자`); return false; }
      pc.where = 'slide'; s.piece = pc;
      say(`${NAME[pc.kind]}에 담갔던 조각을 받침 유리에 펴 올리고 같은 용액을 한 방울 떨어뜨렸다 — 이제 <b>덮개 유리</b>를 덮자`);
      return true;
    }
    function coverOn(s) {
      if (!s) return false;
      if (!s.piece) { warn('먼저 표피 조각을 받침 유리에 올리자'); return false; }
      if (s.cover) { warn('이미 덮개 유리를 덮었다'); return false; }
      s.cover = true; say('덮개 유리를 한쪽부터 비스듬히 내려 덮었다(공기 방울이 덜 생긴다) — 받침 유리를 <b>현미경 재물대</b>로 끌어 올리자'); steps(); return true;
    }
    function mountSlide(s) {
      if (!s.piece || !s.cover) { warn(!s.piece ? '표피 조각이 없는 받침 유리다' : '덮개 유리부터 덮자 — 그래야 렌즈에 용액이 묻지 않는다'); place(s); return false; }
      if (onStage >= 0 && onStage !== s.i) { const o = slides[onStage]; onStage = -1; place(o); }
      onStage = s.i; place(s); focus = 0.2 + Math.random() * 0.12; seen = 0;
      say(`${NAME[s.piece.kind]} 표본을 재물대에 올렸다 — <b>초점 손잡이</b>를 위아래로 돌려 상을 또렷하게 하자`);
      steps(); return true;
    }
    function dropEdge() {
      const s = cur();
      if (!s) { warn('먼저 소금물 표본을 재물대에 올리자'); return false; }
      if (s.piece.env === 'water') { warn(s.piece.kind === 'water' ? '이 표본은 처음부터 <b>증류수</b>다 — 소금물 표본을 올려 해 보자' : '이미 증류수로 바꿨다'); return false; }
      s.edge = true; say('덮개 유리 <b>한쪽 가장자리</b>에 증류수를 떨어뜨렸다 — <b>반대쪽</b>에 거름종이를 대어 빨아들이자'); return true;
    }
    function wick() {
      const s = cur();
      if (!s || s.piece.env === 'water' || s.wick >= 0) return false;
      if (!s.edge) { warn('거름종이는 반대쪽 증류수를 끌어당기는 일을 한다 — 먼저 <b>증류수</b>를 한쪽에 떨어뜨리자'); return false; }
      s.wick = 0; say('거름종이가 소금물을 빨아들이자 증류수가 덮개 유리 밑으로 스며든다 — 세포를 지켜보자'); return true;
    }

    // ── 움직임 ──
    function step(dt) {
      t += dt;
      pieces.forEach((pc) => {
        if (pc.where === 'dish') pc.soak += dt; // 1초 = 1분
        if (pc.env === 'salt') pc.p += dt * 0.12 * (1 - pc.p); else pc.p -= dt * 0.28 * pc.p;
      });
      slides.forEach((s) => { if (s.wick >= 0 && s.wick < 1) { s.wick = Math.min(1, s.wick + dt / 2.4); if (s.wick >= 0.5 && s.piece.env === 'salt') s.piece.env = 'water'; } });
      if (flash > 0) flash = Math.max(0, flash - dt * 2.5);
      // 초점이 맞으면 기록
      const s = cur();
      if (s && Math.abs(focus - BEST) < 0.05) {
        seen += dt; const pc = s.piece;
        if (pc.kind === 'water' && !rec.water && seen > 0.6) { rec.water = true; snap('증류수 표본: 붉은 세포가 세포벽까지 꽉 차 <b>팽팽</b>하다 — 물이 세포 안으로 들어와 부풀었다'); }
        else if (pc.kind === 'salt' && pc.env === 'salt') {
          if (pc.p > 0.42 && !rec.salt) snap('소금물 표본: 붉은 부분(세포막에 싸인 원형질)이 <b>세포벽에서 떨어졌다</b> — 물이 세포 밖으로 빠져나간 <b>원형질분리</b>');
          else if (!rec.salt) say('초점이 맞았다 — 붉은 부분이 세포벽에서 조금씩 <b>떨어지기 시작</b>한다. 잠시 지켜보자');
        } else if (pc.kind === 'salt' && pc.env === 'water' && rec.salt && !rec.back && s.wick >= 1 && pc.p < 0.2) snap('다시 증류수로 바꾸자 물이 들어와 세포막이 <b>세포벽 쪽으로 다시 부풀었다</b>(원형질 복귀)');
      } else seen = 0;
    }
    function snap(h) {
      const s = cur(), k = s.piece.kind === 'water' ? 'water' : (s.piece.env === 'salt' ? 'salt' : 'back');
      rec[k] = true; flash = 1; say(h + ' <small>· 스마트 기기로 찍어 표에 남겼다</small>');
      if (k === 'water' && !rec.salt) setTimeout(() => { if (!rec.salt && msg.includes('찍어')) say('이번엔 <b>소금물 표본</b>을 만들어 재물대에 올리자(먼저 올린 표본은 자리로 돌아간다)'); }, 3500);
      if (k === 'salt' && !rec.back) setTimeout(() => { if (!rec.back && msg.includes('찍어')) say('③ 스포이트로 덮개 유리 한쪽에 <b>증류수</b>를 떨어뜨리고, 반대쪽에 <b>거름종이</b>를 대 보자'); }, 3500);
      table(); steps();
    }
    function table() {
      tb.innerHTML = Object.keys(ROWS).map((k) => { const r = ROWS[k], on = rec[k]; return `<tr class="${on ? 'on' : ''}"><th>${r[0]}</th><td>${on ? r[1] : '?'}</td><td>${on ? r[2] : '?'}</td></tr>`; }).join('');
    }
    function steps() {
      const ok = []; const mounted = slides.some((s) => s.cover) && (onStage >= 0 || rec.water || rec.salt);
      if (mounted) ok.push(1); if (rec.water && rec.salt) ok.push(2); if (rec.back) ok.push(3);
      const now = !mounted ? 1 : !(rec.water && rec.salt) ? 2 : !rec.back ? 3 : 0;
      window.L1.steps(root, now, ok); window.L1.done(root, now === 0);
    }

    // ── 그리기 ──
    function txt(c, s, x, y, col, font, al = 'center') { c.fillStyle = col; c.font = font; c.textAlign = al; c.fillText(s, x, y); }
    function bg(c) {
      let g = c.createLinearGradient(0, 0, 0, BENCH); g.addColorStop(0, '#dfe5e2'); g.addColorStop(1, '#c8d0cc'); c.fillStyle = g; c.fillRect(0, 0, VW, BENCH);
      c.strokeStyle = 'rgba(90,110,100,.15)'; c.lineWidth = 1; for (let x = 0; x < 760; x += 64) { c.beginPath(); c.moveTo(x, 0); c.lineTo(x, BENCH); c.stroke(); }
      g = c.createLinearGradient(0, BENCH, 0, VH); g.addColorStop(0, '#f2f3ef'); g.addColorStop(0.08, '#e6e8e2'); g.addColorStop(1, '#cfd3cb'); c.fillStyle = g; c.fillRect(0, BENCH, VW, VH - BENCH);
      c.fillStyle = '#9aa29c'; c.fillRect(0, BENCH - 3, VW, 5);
    }
    function board(c) {
      c.fillStyle = 'rgba(40,30,20,.18)'; c.beginPath(); c.roundRect(24, 360, 262, 250, 14); c.fill();
      const g = c.createLinearGradient(0, 352, 0, 600); g.addColorStop(0, '#e4c08e'); g.addColorStop(1, '#c39258'); c.fillStyle = g; c.beginPath(); c.roundRect(16, 352, 262, 248, 14); c.fill();
      c.strokeStyle = '#9b6f3e'; c.lineWidth = 2; c.stroke();
      c.strokeStyle = 'rgba(120,80,40,.22)'; c.lineWidth = 1; for (let i = 0; i < 9; i++) { const y = 366 + i * 26; c.beginPath(); c.moveTo(22, y); for (let x = 22; x <= 272; x += 25) c.lineTo(x, y + Math.sin(x * 0.04 + i) * 2.4); c.stroke(); }
      // 반 자른 적양파(단면: 붉은 비늘잎 고리)
      const ox = 86, oy = 436;
      c.fillStyle = 'rgba(60,20,40,.25)'; c.beginPath(); c.ellipse(ox + 6, oy + 44, 64, 14, 0, 0, TAU); c.fill();
      let gg = c.createRadialGradient(ox - 20, oy - 30, 6, ox, oy, 70); gg.addColorStop(0, '#b34a83'); gg.addColorStop(0.7, '#7d1f57'); gg.addColorStop(1, '#4e0f35');
      c.fillStyle = gg; c.beginPath(); c.ellipse(ox, oy, 62, 52, 0, 0, TAU); c.fill();
      for (let r = 56, i = 0; r > 6; r -= 9, i++) { c.fillStyle = i % 2 ? '#fbf3f6' : '#f2dbe6'; c.beginPath(); c.ellipse(ox + 2, oy + 4, r * 0.86, r * 0.62, 0, 0, TAU); c.fill(); c.strokeStyle = '#a23a72'; c.lineWidth = 2.2; c.stroke(); }
      c.fillStyle = '#e8d9a8'; c.beginPath(); c.ellipse(ox + 2, oy + 4, 6, 4, 0, 0, TAU); c.fill();
      txt(c, '적양파', ox, oy + 74, '#5a1b3d', F(800, 15));
      // 떼어 낸 비늘잎 한 장(바깥 면이 위)
      const lx = 196, ly = 514;
      c.fillStyle = 'rgba(60,20,40,.22)'; c.beginPath(); c.ellipse(lx + 4, ly + 22, 82, 12, 0, 0, TAU); c.fill();
      c.beginPath(); c.moveTo(lx - 84, ly + 12); c.quadraticCurveTo(lx - 70, ly - 34, lx, ly - 36); c.quadraticCurveTo(lx + 70, ly - 34, lx + 84, ly + 12); c.quadraticCurveTo(lx, ly + 28, lx - 84, ly + 12); c.closePath();
      gg = c.createLinearGradient(0, ly - 36, 0, ly + 24); gg.addColorStop(0, '#c45a92'); gg.addColorStop(0.6, '#9b2b68'); gg.addColorStop(1, '#6f1748'); c.fillStyle = gg; c.fill(); c.strokeStyle = '#561137'; c.lineWidth = 1.6; c.stroke();
      c.strokeStyle = 'rgba(255,220,240,.35)'; c.lineWidth = 1; for (let i = -4; i <= 4; i++) { c.beginPath(); c.moveTo(lx + i * 18, ly - 30); c.quadraticCurveTo(lx + i * 19, ly, lx + i * 17, ly + 18); c.stroke(); }
      CUTS.forEach((p, i) => {
        if (cuts[i]) { c.fillStyle = '#f6e9ef'; c.strokeStyle = '#a23a72'; c.lineWidth = 1; c.beginPath(); c.rect(p.x - 11, p.y - 10, 22, 20); c.fill(); c.stroke(); return; }
        c.strokeStyle = '#2b0a1d'; c.lineWidth = 1.4; c.setLineDash([3, 2]); c.strokeRect(p.x - 11, p.y - 10, 22, 20); c.setLineDash([]);
      });
      txt(c, '비늘잎 · 칼집 5 mm', lx, ly + 46, '#5a1b3d', F(700, 13));
      // 면도칼
      c.save(); c.translate(214, 396); c.rotate(-0.25);
      const bg2 = c.createLinearGradient(0, -12, 0, 12); bg2.addColorStop(0, '#f4f6f8'); bg2.addColorStop(0.5, '#aab2bc'); bg2.addColorStop(1, '#e5e9ee'); c.fillStyle = bg2;
      c.beginPath(); c.roundRect(-38, -12, 76, 24, 3); c.fill(); c.strokeStyle = '#5c6570'; c.lineWidth = 1.2; c.stroke();
      c.fillStyle = '#c8ced6'; c.beginPath(); c.roundRect(-20, -4, 40, 8, 4); c.fill(); c.stroke();
      c.restore(); txt(c, '면도칼', 214, 428, '#384255', F(700, 13));
      // 핀셋(쉴 때)
      if (!carry || !['piece'].includes(carry.kind)) tweezers(c, 60, 584, -0.08, 0);
    }
    function tweezers(c, x, y, a, pinch) {
      c.save(); c.translate(x, y); c.rotate(a);
      const g = c.createLinearGradient(0, -6, 0, 6); g.addColorStop(0, '#eef1f4'); g.addColorStop(0.5, '#8d96a1'); g.addColorStop(1, '#d6dbe1');
      c.fillStyle = g; c.strokeStyle = '#4b535e'; c.lineWidth = 1;
      const o = 5 - pinch * 3.5;
      c.beginPath(); c.moveTo(0, -1); c.lineTo(104, -o - 3); c.lineTo(106, -o); c.lineTo(2, 1); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.moveTo(0, 1); c.lineTo(104, o + 3); c.lineTo(106, o); c.lineTo(2, -1); c.closePath(); c.fill(); c.stroke();
      c.restore();
    }
    function film(c, x, y, sc = 1, a = 0) {
      c.save(); c.translate(x, y); c.rotate(a); c.scale(sc, sc);
      c.fillStyle = 'rgba(190,60,130,.6)'; c.strokeStyle = 'rgba(120,20,80,.8)'; c.lineWidth = 1;
      c.beginPath(); c.moveTo(-12, -9); c.lineTo(10, -11); c.quadraticCurveTo(14, 0, 12, 10); c.lineTo(-11, 11); c.quadraticCurveTo(-14, 0, -12, -9); c.fill(); c.stroke();
      c.strokeStyle = 'rgba(255,220,240,.5)'; c.beginPath(); c.moveTo(-8, -4); c.lineTo(8, -6); c.moveTo(-9, 3); c.lineTo(9, 2); c.stroke();
      c.restore();
    }
    function dish(c, k) {
      const d = DISH[k];
      c.fillStyle = 'rgba(40,50,60,.15)'; c.beginPath(); c.ellipse(d.x + 4, d.y + 16, DRX, DRY * 0.8, 0, 0, TAU); c.fill();
      c.fillStyle = k === 'salt' ? 'rgba(225,235,240,.8)' : 'rgba(205,232,246,.75)'; c.beginPath(); c.ellipse(d.x, d.y + 4, DRX - 4, DRY - 3, 0, 0, TAU); c.fill();
      c.strokeStyle = 'rgba(80,120,140,.85)'; c.lineWidth = 1.6; c.beginPath(); c.ellipse(d.x, d.y, DRX, DRY, 0, 0, TAU); c.stroke();
      c.beginPath(); c.ellipse(d.x, d.y + 10, DRX, DRY, 0, 0, Math.PI); c.stroke(); c.beginPath(); c.moveTo(d.x - DRX, d.y); c.lineTo(d.x - DRX, d.y + 10); c.moveTo(d.x + DRX, d.y); c.lineTo(d.x + DRX, d.y + 10); c.stroke();
      c.strokeStyle = 'rgba(255,255,255,.9)'; c.lineWidth = 2; c.beginPath(); c.ellipse(d.x, d.y, DRX * 0.8, DRY * 0.6, 0, Math.PI * 1.1, Math.PI * 1.45); c.stroke();
      if (k === 'salt') for (let i = 0; i < 8; i++) { c.fillStyle = 'rgba(255,255,255,.8)'; c.fillRect(d.x + (hash(i, 4) - 0.5) * DRX * 1.4, d.y + (hash(i, 5) - 0.3) * DRY, 2, 2); }
      const pc = pieces.find((p) => p.where === 'dish' && p.kind === k);
      if (pc && !(carry && carry.obj === pc)) film(c, d.x + Math.sin(t * 1.2) * 3, d.y + 4 + Math.cos(t) * 1.5, 1, Math.sin(t * 0.7) * 0.2);
      txt(c, NAME[k], d.x, d.y + DRY + 30, k === 'salt' ? '#1f5f8a' : '#2b6a3a', F(800, 15));
      if (pc && pc.where === 'dish') txt(c, pc.soak < SOAK ? `담근 지 ${Math.floor(pc.soak)}분` : `${SOAK}분 지남 ✓`, d.x, d.y + DRY + 48, pc.soak < SOAK ? '#7a1f12' : '#2b6a3a', F(700, 13));
    }
    function slideG(c, s) {
      const x = s.x, y = s.y;
      c.fillStyle = 'rgba(40,50,60,.15)'; c.fillRect(x - SW / 2 + 4, y - SH / 2 + 5, SW, SH);
      c.fillStyle = 'rgba(215,238,245,.7)'; c.strokeStyle = 'rgba(70,110,130,.9)'; c.lineWidth = 1.4; c.beginPath(); c.rect(x - SW / 2, y - SH / 2, SW, SH); c.fill(); c.stroke();
      c.fillStyle = 'rgba(250,250,250,.9)'; c.fillRect(x - SW / 2 + 2, y - SH / 2 + 2, 30, SH - 4);
      c.strokeStyle = 'rgba(255,255,255,.95)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x - SW / 2 + 36, y - SH / 2 + 4); c.lineTo(x + SW / 2 - 6, y - SH / 2 + 4); c.stroke();
      if (s.piece) {
        txt(c, s.piece.kind === 'salt' ? '소금' : '증류', x - SW / 2 + 17, y + 5, s.piece.kind === 'salt' ? '#1f5f8a' : '#2b6a3a', F(800, 11));
        c.fillStyle = 'rgba(190,225,240,.7)'; c.beginPath(); c.ellipse(x + 14, y, 24, 13, 0, 0, TAU); c.fill();
        film(c, x + 14, y, 0.8);
        if (s.cover) { c.fillStyle = 'rgba(235,248,252,.45)'; c.strokeStyle = 'rgba(70,110,130,.9)'; c.lineWidth = 1.1; c.fillRect(x - 6, y - 15, 40, 30); c.strokeRect(x - 6, y - 15, 40, 30); c.strokeStyle = 'rgba(255,255,255,.95)'; c.beginPath(); c.moveTo(x - 3, y - 12); c.lineTo(x + 12, y - 12); c.stroke(); }
        if (s.edge && s.wick < 1) { c.fillStyle = 'rgba(150,200,235,.85)'; c.beginPath(); c.ellipse(x - 9, y, 5, 8, 0, 0, TAU); c.fill(); }
        if (s.wick >= 0 && s.wick < 1) { const w = s.wick; c.fillStyle = 'rgba(150,200,235,.35)'; c.fillRect(x - 6, y - 15, 40 * w, 30); }
      }
    }
    function shelf(c) {
      // 덮개 유리 상자
      c.fillStyle = '#e9ecef'; c.strokeStyle = '#6b737e'; c.lineWidth = 1.2; c.beginPath(); c.roundRect(COVER.x - 26, COVER.y - 12, 52, 22, 3); c.fill(); c.stroke();
      for (let i = 0; i < 4; i++) { c.fillStyle = 'rgba(210,235,245,.8)'; c.fillRect(COVER.x - 18 + i * 3, COVER.y - 20 + i * 1.5, 30, 10); c.strokeStyle = 'rgba(80,120,140,.7)'; c.strokeRect(COVER.x - 18 + i * 3, COVER.y - 20 + i * 1.5, 30, 10); }
      txt(c, '덮개 유리', COVER.x, COVER.y + 28, '#384255', F(700, 13));
      // 증류수 병 + 스포이트
      if (!(carry && carry.kind === 'dropper')) dropper(c, DROP.x, DROP.y - 34, 0);
      const g = c.createLinearGradient(DROP.x - 16, 0, DROP.x + 16, 0); g.addColorStop(0, 'rgba(180,215,235,.7)'); g.addColorStop(0.5, 'rgba(245,252,255,.75)'); g.addColorStop(1, 'rgba(160,200,225,.7)');
      c.fillStyle = g; c.strokeStyle = 'rgba(70,110,130,.9)'; c.lineWidth = 1.3; c.beginPath(); c.roundRect(DROP.x - 16, DROP.y - 18, 32, 36, 5); c.fill(); c.stroke();
      c.fillStyle = '#fff'; c.fillRect(DROP.x - 12, DROP.y - 6, 24, 12); txt(c, '증류수', DROP.x, DROP.y + 4, '#2b6a3a', F(800, 9));
      txt(c, '스포이트', DROP.x, DROP.y + 36, '#384255', F(700, 13));
      // 거름종이
      for (let i = 0; i < 3; i++) { c.fillStyle = i === 2 ? '#fbfbf7' : '#eeeee6'; c.strokeStyle = '#9a9a8c'; c.lineWidth = 1; c.beginPath(); c.ellipse(PAPER.x + i, PAPER.y - i * 2, 26, 9, 0, 0, TAU); c.fill(); c.stroke(); }
      txt(c, '거름종이', PAPER.x, PAPER.y + 24, '#384255', F(700, 13));
    }
    function dropper(c, x, y, sq) {
      c.save(); c.translate(x, y);
      c.fillStyle = 'rgba(225,240,248,.85)'; c.strokeStyle = 'rgba(70,110,130,.9)'; c.lineWidth = 1.2; c.beginPath(); c.moveTo(-3, 0); c.lineTo(-3, 34); c.lineTo(0, 42); c.lineTo(3, 34); c.lineTo(3, 0); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = 'rgba(150,200,235,.9)'; c.fillRect(-2, 22, 4, 12);
      c.fillStyle = '#d24a3a'; c.strokeStyle = '#7a1f12'; c.beginPath(); c.ellipse(0, -8 + sq * 2, 7 - sq * 2, 11 - sq * 3, 0, 0, TAU); c.fill(); c.stroke();
      c.restore();
    }
    function scope(c) {
      const s = STAGE;
      c.fillStyle = 'rgba(40,50,60,.2)'; c.beginPath(); c.ellipse(700, 612, 120, 9, 0, 0, TAU); c.fill();
      let g = c.createLinearGradient(0, 580, 0, 612); g.addColorStop(0, '#f5f6f3'); g.addColorStop(1, '#bfc4c0'); c.fillStyle = g; c.strokeStyle = '#7d847f'; c.lineWidth = 1.5;
      c.beginPath(); c.roundRect(598, 582, 204, 28, 8); c.fill(); c.stroke();
      // 팔(뒤)
      g = c.createLinearGradient(740, 0, 800, 0); g.addColorStop(0, '#f2f3ef'); g.addColorStop(1, '#c7ccc7'); c.fillStyle = g;
      c.beginPath(); c.moveTo(750, 584); c.lineTo(758, 420); c.quadraticCurveTo(766, 330, 728, 300); c.lineTo(690, 290); c.lineTo(684, 330); c.lineTo(720, 340); c.quadraticCurveTo(742, 360, 736, 420); c.lineTo(728, 584); c.closePath(); c.fill(); c.stroke();
      // 머리·경통·접안렌즈
      c.fillStyle = '#eceee9'; c.beginPath(); c.roundRect(640, 300, 92, 48, 10); c.fill(); c.stroke();
      c.save(); c.translate(700, 304); c.rotate(0.55); c.fillStyle = '#3a3f47'; c.fillRect(-11, -70, 22, 70); c.fillStyle = '#23272e'; c.fillRect(-13, -78, 26, 12); c.restore();
      // 회전판·대물렌즈
      c.fillStyle = '#c9cdc8'; c.beginPath(); c.ellipse(s.x, 356, 36, 10, 0, 0, TAU); c.fill(); c.stroke();
      g = c.createLinearGradient(s.x - 10, 0, s.x + 10, 0); g.addColorStop(0, '#6c737b'); g.addColorStop(0.5, '#d9dde1'); g.addColorStop(1, '#5d646c'); c.fillStyle = g;
      c.beginPath(); c.moveTo(s.x - 10, 362); c.lineTo(s.x + 10, 362); c.lineTo(s.x + 7, 432); c.lineTo(s.x - 7, 432); c.closePath(); c.fill(); c.stroke();
      c.fillStyle = '#d9b43a'; c.fillRect(s.x - 9, 392, 18, 4);
      c.save(); c.translate(s.x - 30, 360); c.rotate(-0.4); c.fillStyle = '#9aa1a8'; c.fillRect(-6, 0, 12, 46); c.restore();
      // 재물대
      c.fillStyle = '#2f343c'; c.beginPath(); c.roundRect(592, s.y + 6, 172, 14, 3); c.fill();
      c.fillStyle = '#4a515b'; c.fillRect(592, s.y + 4, 172, 4);
      // 조명
      const on = onStage >= 0; if (on) P.glow(c, s.x, s.y + 30, 26, 'rgba(255,248,210,.9)'); c.fillStyle = on ? '#fff6c8' : '#9aa1a8'; c.beginPath(); c.ellipse(s.x, s.y + 44, 18, 6, 0, 0, TAU); c.fill(); c.strokeStyle = '#5d646c'; c.stroke();
      c.fillStyle = '#d7dbd6'; c.strokeStyle = '#7d847f'; c.beginPath(); c.roundRect(s.x - 22, s.y + 50, 44, 34, 6); c.fill(); c.stroke();
      txt(c, '재물대', 610, s.y + 40, '#384255', F(700, 13));
      // 초점 손잡이
      const k = KNOB; c.fillStyle = 'rgba(0,0,0,.15)'; c.beginPath(); c.arc(k.x + 3, k.y + 3, 26, 0, TAU); c.fill();
      g = c.createRadialGradient(k.x - 8, k.y - 8, 2, k.x, k.y, 26); g.addColorStop(0, '#f2f3f4'); g.addColorStop(1, '#7f8790'); c.fillStyle = g; c.beginPath(); c.arc(k.x, k.y, 25, 0, TAU); c.fill(); c.strokeStyle = '#4b535e'; c.lineWidth = 1.5; c.stroke();
      c.strokeStyle = 'rgba(40,45,55,.55)'; c.lineWidth = 2; for (let i = 0; i < 12; i++) { const a = knobA + i * TAU / 12; c.beginPath(); c.moveTo(k.x + Math.cos(a) * 18, k.y + Math.sin(a) * 18); c.lineTo(k.x + Math.cos(a) * 24, k.y + Math.sin(a) * 24); c.stroke(); }
      c.fillStyle = '#c5cad0'; c.beginPath(); c.arc(k.x, k.y, 10, 0, TAU); c.fill(); c.strokeStyle = '#4b535e'; c.lineWidth = 1; c.stroke();
      txt(c, '초점 손잡이', k.x + 4, k.y + 44, '#384255', F(700, 13));
      // 스마트 기기 거치대
      c.strokeStyle = '#5d646c'; c.lineWidth = 7; c.lineCap = 'round'; c.beginPath(); c.moveTo(742, 252); c.lineTo(780, 300); c.stroke(); c.lineCap = 'butt';
      txt(c, '현미경', 640, 586 - 8, '#384255', F(800, 14), 'left');
    }
    function phone(c) {
      c.fillStyle = 'rgba(0,0,0,.2)'; c.beginPath(); c.roundRect(776, 16, 280, 326, 24); c.fill();
      c.fillStyle = '#1b1f27'; c.beginPath(); c.roundRect(770, 8, 280, 326, 24); c.fill(); c.strokeStyle = '#3d4452'; c.lineWidth = 2; c.stroke();
      c.fillStyle = '#05070a'; c.beginPath(); c.roundRect(782, 20, 256, 302, 16); c.fill();
      view(c);
      if (flash > 0) { c.fillStyle = `rgba(255,255,255,${flash * 0.8})`; c.beginPath(); c.roundRect(782, 20, 256, 302, 16); c.fill(); }
      const s = cur(), d = Math.abs(focus - BEST);
      txt(c, !s ? '현미경 시야' : d < 0.05 ? '초점 맞음' : d < 0.15 ? '조금 더 돌리자' : '흐림 — 초점 손잡이를 돌리자', VC.x, 330 - 14, d < 0.05 && s ? '#9be08f' : '#ffd84d', F(700, 14));
      txt(c, s ? `${NAME[s.piece.kind]} 표본${s.piece.kind === 'salt' && s.piece.env === 'water' ? ' → 증류수' : ''}` : '', VC.x, 40, '#e6e9ee', F(700, 13));
    }
    // 현미경 시야: 기울어진 벽돌 모양 표피세포. 원형질(붉은 색소가 든 액포 + 세포질, 세포막으로 싸임)이 p만큼 세포벽에서 떨어진다.
    let off = null;
    function view(c) {
      const s = cur();
      c.save(); c.beginPath(); c.arc(VC.x, VC.y, VR, 0, TAU); c.clip();
      if (!s) { const g = c.createRadialGradient(VC.x, VC.y, 4, VC.x, VC.y, VR); g.addColorStop(0, '#4a4f58'); g.addColorStop(1, '#1d2026'); c.fillStyle = g; c.fillRect(VC.x - VR, VC.y - VR, 2 * VR, 2 * VR); txt(c, '받침 유리를', VC.x, VC.y - 4, '#c8ccd3', F(700, 16)); txt(c, '재물대에 올리자', VC.x, VC.y + 18, '#c8ccd3', F(700, 16)); c.restore(); return; }
      const q = K * (S.cv.width / Math.max(1, S.W)), size = Math.ceil(2 * VR * q);
      if (!off) off = document.createElement('canvas');
      if (off.width !== size) { off.width = size; off.height = size; }
      const o = off.getContext('2d'); o.setTransform(1, 0, 0, 1, 0, 0); o.clearRect(0, 0, size, size); o.setTransform(q, 0, 0, q, VR * q, VR * q);
      cells(o, s.piece);
      const d = Math.abs(focus - BEST), blur = Math.min(10, d * 34);
      c.fillStyle = '#f4eff1'; c.fillRect(VC.x - VR, VC.y - VR, 2 * VR, 2 * VR);
      if ('filter' in c && blur > 0.3) c.filter = `blur(${(blur * q).toFixed(1)}px)`;
      c.drawImage(off, VC.x - VR, VC.y - VR, 2 * VR, 2 * VR); c.filter = 'none';
      if (d > 0.02) { c.fillStyle = `rgba(250,246,248,${Math.min(0.65, d * 2.2)})`; c.fillRect(VC.x - VR, VC.y - VR, 2 * VR, 2 * VR); }
      if (d < 0.05) labels(c, s);
      const vg = c.createRadialGradient(VC.x, VC.y, VR * 0.7, VC.x, VC.y, VR); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.35)'); c.fillStyle = vg; c.fillRect(VC.x - VR, VC.y - VR, 2 * VR, 2 * VR);
      c.restore();
      c.strokeStyle = '#000'; c.lineWidth = 4; c.beginPath(); c.arc(VC.x, VC.y, VR + 1, 0, TAU); c.stroke();
    }
    const ROT = -0.38, CW = 112, CH = 44;
    function cellGeo(i, j) {
      const x = (i + (j % 2 ? 0.5 : 0)) * CW + (hash(i, j) - 0.5) * 10, y = j * CH;
      const jit = (a, b) => (hash(i * 7 + a, j * 3 + b) - 0.5) * 8;
      // 육각에 가까운 길쭉한 세포(양 끝이 살짝 뾰족)
      const pts = [[-CW / 2 + jit(1, 1), jit(1, 2)], [-CW / 2 + 12 + jit(2, 1), -CH / 2 + jit(2, 2) / 3], [CW / 2 - 12 + jit(3, 1), -CH / 2 + jit(3, 2) / 3], [CW / 2 + jit(4, 1), jit(4, 2)], [CW / 2 - 12 + jit(5, 1), CH / 2 + jit(5, 2) / 3], [-CW / 2 + 12 + jit(6, 1), CH / 2 + jit(6, 2) / 3]];
      return { x, y, pts };
    }
    function blob(o, pts, r) {
      // 꼭짓점을 둥글린 닫힌 곡선
      const n = pts.length; o.beginPath();
      for (let k = 0; k < n; k++) {
        const a = pts[(k + n - 1) % n], b = pts[k], c2 = pts[(k + 1) % n];
        const p1 = [lerp(b[0], a[0], r), lerp(b[1], a[1], r)], p2 = [lerp(b[0], c2[0], r), lerp(b[1], c2[1], r)];
        if (k === 0) o.moveTo(p1[0], p1[1]); else o.lineTo(p1[0], p1[1]);
        o.quadraticCurveTo(b[0], b[1], p2[0], p2[1]);
      }
      o.closePath();
    }
    function proto(cg, i, j, p) {
      // 세포마다 다르게 줄어든다(한쪽 끝이 더 많이 떨어짐)
      const h1 = hash(i, j + 11), h2 = hash(i + 5, j), h3 = hash(i + 9, j + 4) - 0.5;
      const sx = p * (0.22 + 0.32 * h1), sy = p * (0.18 + 0.3 * h2), shift = h3 * p * CW * 0.22;
      return cg.pts.map(([x, y]) => [x * (1 - sx) + shift - (x > 0 ? 1 : -1) * 1.5, y * (1 - sy) - (y > 0 ? 1 : -1) * 1.2]);
    }
    function cells(o, pc) {
      o.save(); o.rotate(ROT);
      o.fillStyle = '#f3ecef'; o.fillRect(-VR * 1.6, -VR * 1.6, VR * 3.2, VR * 3.2);
      const p = clamp(pc.p, 0, 1), turg = pc.env === 'water' ? 1 : 0;
      for (let j = -5; j <= 5; j++) for (let i = -3; i <= 3; i++) {
        const cg = cellGeo(i, j); o.save(); o.translate(cg.x, cg.y);
        const pale = hash(i + 3, j + 7) < 0.18; // 색소가 옅은 세포도 섞여 있다
        const pp = proto(cg, i, j, p), rr = 0.18 + p * 0.3;
        blob(o, pp, rr);
        const base = pale ? mix('#e5a8c8', '#c9739f', p) : mix('#c24a88', '#8a1150', p);
        const g = o.createRadialGradient(-10, -6, 2, 0, 0, CW * 0.6); g.addColorStop(0, pale ? '#f2cfe1' : mix('#d873a8', '#b03474', p)); g.addColorStop(1, base);
        o.fillStyle = g; o.fill(); o.strokeStyle = mix('#a2306f', '#5e0a37', p); o.lineWidth = 1 + p * 0.8; o.stroke();
        if (hash(i + 1, j + 2) < 0.35) { const cx = pp[0][0] * 0.4, cy = pp[1][1] * 0.2; o.fillStyle = 'rgba(120,90,110,.55)'; o.beginPath(); o.ellipse(cx, cy, 6, 5, 0, 0, TAU); o.fill(); }
        // 세포벽(밝은 두 줄)
        blob(o, cg.pts, 0.12); o.strokeStyle = '#d9d2c5'; o.lineWidth = 4; o.stroke(); o.strokeStyle = 'rgba(95,90,80,.75)'; o.lineWidth = 1.1; o.stroke();
        if (turg && p < 0.05) { o.strokeStyle = 'rgba(255,255,255,.18)'; o.lineWidth = 1; blob(o, pp, rr); o.stroke(); }
        o.restore();
      }
      o.restore();
    }
    function labels(c, s) {
      // 가운데 세포(0,0)에 이름표와 물의 이동 화살표
      const pc = s.piece, p = clamp(pc.p, 0, 1), cg = cellGeo(0, 0), pp = proto(cg, 0, 0, p);
      const T = ([x, y]) => { const X = cg.x + x, Y = cg.y + y; return [VC.x + X * Math.cos(ROT) - Y * Math.sin(ROT), VC.y + X * Math.sin(ROT) + Y * Math.cos(ROT)]; };
      const tag = (str, x, y, col) => { c.font = F(800, 14); const w = c.measureText(str).width + 10; c.fillStyle = 'rgba(255,255,255,.9)'; c.fillRect(x - w / 2, y - 15, w, 20); c.strokeStyle = col; c.lineWidth = 1.2; c.strokeRect(x - w / 2, y - 15, w, 20); txt(c, str, x, y, col, F(800, 14)); };
      const line = (a, b, col) => { c.strokeStyle = col; c.lineWidth = 1.5; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.stroke(); };
      const wallP = T(cg.pts[2]), memP = T(pp[2]);
      line(wallP, [VC.x + 48, VC.y - 88], '#5c5446'); tag('세포벽', VC.x + 48, VC.y - 88, '#5c5446');
      line(memP, [VC.x - 40, VC.y - 72], '#8a1150'); tag(p > 0.3 ? '세포막(떨어짐)' : '세포막', VC.x - 40, VC.y - 72, '#8a1150');
      // 물의 이동: 소금물 → 밖으로, 증류수 → 안으로
      const outFlow = pc.env === 'salt' && p < 0.97, inFlow = pc.env === 'water' && (pc.kind === 'water' || p > 0.03);
      if (outFlow || inFlow) {
        const ph = (t * 0.8) % 1;
        [[3, 3], [0, 0]].forEach(([a]) => {
          const inner = T([pp[a][0] * 0.5, pp[a][1] * 0.5]), outer = T([cg.pts[a][0] * 1.25, cg.pts[a][1] * 1.25]);
          const [s0, s1] = outFlow ? [inner, outer] : [outer, inner], k = ph;
          const x = lerp(s0[0], s1[0], k), y = lerp(s0[1], s1[1], k), ang = Math.atan2(s1[1] - s0[1], s1[0] - s0[0]);
          c.save(); c.translate(x, y); c.rotate(ang); c.fillStyle = '#1f6fb0'; c.strokeStyle = '#fff'; c.lineWidth = 1.5;
          c.beginPath(); c.moveTo(10, 0); c.lineTo(-4, -7); c.lineTo(-4, 7); c.closePath(); c.fill(); c.stroke(); c.restore();
          txt(c, 'H₂O', x, y - 10, '#1f5f8a', F(800, 12));
        });
      }
    }
    function carried(c) {
      if (!carry) return;
      const { x, y } = carry;
      if (carry.kind === 'piece') {
        if (carry.peel != null) { const p = CUTS[carry.peel], k = clamp(Math.hypot(x - p.x, y - p.y) / 60, 0, 1); if (k < 1) { c.strokeStyle = 'rgba(190,60,130,.7)'; c.lineWidth = 8 * (1 - k); c.beginPath(); c.moveTo(p.x, p.y); c.lineTo(x, y); c.stroke(); } }
        film(c, x, y, 1.05, Math.sin(t * 3) * 0.1); tweezers(c, x + 4, y - 2, -0.9, 1);
      } else if (carry.kind === 'cover') { c.fillStyle = 'rgba(225,245,252,.6)'; c.strokeStyle = 'rgba(70,110,130,.9)'; c.lineWidth = 1.2; c.fillRect(x - 20, y - 15, 40, 30); c.strokeRect(x - 20, y - 15, 40, 30); }
      else if (carry.kind === 'slide') slideG(c, carry.obj);
      else if (carry.kind === 'dropper') { dropper(c, x, y - 44, 0.6); }
      else if (carry.kind === 'paper') { c.fillStyle = '#fbfbf7'; c.strokeStyle = '#9a9a8c'; c.lineWidth = 1; c.beginPath(); c.moveTo(x - 6, y - 26); c.lineTo(x + 8, y - 26); c.lineTo(x + 4, y + 8); c.lineTo(x - 8, y + 8); c.closePath(); c.fill(); c.stroke(); }
      if (['slide', 'dropper', 'paper'].includes(carry.kind) && inStage(x, y)) { c.strokeStyle = '#ffd84d'; c.lineWidth = 3; c.setLineDash([6, 5]); c.strokeRect(STAGE.x - 74, STAGE.y - 24, 148, 48); c.setLineDash([]); }
    }
    function ring(c, x, y, r) { c.strokeStyle = '#ffd84d'; c.lineWidth = 3.5; c.beginPath(); c.arc(x, y, r + Math.sin(t * 5) * 2, 0, TAU); c.stroke(); }
    function hint(c) {
      if (carry) return;
      const pw = pieceOf('water'), ps = pieceOf('salt'), s = cur();
      const next = (pc, kind) => {
        if (!pc) { const ci = cuts.findIndex((u) => !u); if (ci >= 0) return [CUTS[ci].x, CUTS[ci].y, 18]; return null; }
        if (pc.where === 'dish') return pc.soak >= SOAK ? [DISH[kind].x, DISH[kind].y, 30] : null;
        const sl = slides.find((x) => x.piece === pc); if (!sl) return null;
        if (!sl.cover) return [COVER.x, COVER.y - 6, 26];
        if (sl.i !== onStage) return [sl.x, sl.y, 30];
        return null;
      };
      let h = null;
      if (s && Math.abs(focus - BEST) >= 0.05) h = [KNOB.x, KNOB.y, 30];
      else if (!rec.water || !pw) h = next(pw, 'water') || (!ps ? next(ps, 'salt') : null);
      else if (!rec.salt) h = next(ps, 'salt');
      else if (!rec.back && s && s.piece.kind === 'salt') h = !s.edge ? [DROP.x, DROP.y - 20, 30] : s.wick < 0 ? [PAPER.x, PAPER.y, 30] : null;
      else if (!rec.back) { const sl = slides.find((x) => x.piece && x.piece.kind === 'salt'); if (sl) h = [sl.x, sl.y, 30]; }
      if (h) ring(c, h[0], h[1], h[2]);
    }

    let K = 1, OX = 0, OY = 0;
    function draw(c, W, H, dt) {
      for (let i = 0; i < 2; i++) step(dt / 2);
      c.fillStyle = '#c8d0cc'; c.fillRect(0, 0, W, H);
      K = Math.min(W / VW, H / VH); OX = (W - VW * K) / 2; OY = (H - VH * K) / 2;
      c.save(); c.translate(OX, OY); c.scale(K, K);
      bg(c); board(c); shelf(c); dish(c, 'water'); dish(c, 'salt'); scope(c);
      slides.forEach((s) => { if (!(carry && carry.obj === s)) slideG(c, s); });
      phone(c); hint(c); carried(c);
      c.restore();
      out.classList.toggle('bad', !!bad && t - bad < 0.4);
    }

    const V = (p) => ({ x: (p.x - OX) / K, y: (p.y - OY) / K });
    function grab(v) {
      const { x, y } = v;
      if (Math.hypot(x - KNOB.x, y - KNOB.y) < 34) return { kind: 'knob', y0: y };
      const ci = CUTS.findIndex((p, i) => !cuts[i] && Math.abs(x - p.x) < 20 && Math.abs(y - p.y) < 18);
      if (ci >= 0) { if (pieces.length >= 2) return null; return { kind: 'piece', obj: null, peel: ci }; }
      const dk = inDish(x, y); if (dk) { const pc = pieces.find((p) => p.where === 'dish' && p.kind === dk); if (pc) { if (pc.soak < SOAK) { warn(`아직 ${Math.floor(pc.soak)}분 — <b>${SOAK}분</b> 동안 담가 두자`); return null; } return { kind: 'piece', obj: pc }; } }
      if (Math.abs(x - COVER.x) < 32 && Math.abs(y - COVER.y + 4) < 22) return { kind: 'cover' };
      if (Math.abs(x - DROP.x) < 22 && y > DROP.y - 64 && y < DROP.y + 22) return { kind: 'dropper' };
      if (Math.abs(x - PAPER.x) < 32 && Math.abs(y - PAPER.y) < 18) return { kind: 'paper' };
      const s = slides.find((sl) => inSlide(x, y, sl)); if (s) return { kind: 'slide', obj: s, dx: s.x - x, dy: s.y - y };
      return null;
    }
    function release(cr) {
      const { x, y } = cr;
      if (cr.kind === 'piece' && cr.peel != null) {
        const dk = inDish(x, y);
        if (dk && !pieceOf(dk)) peel(cr.peel, dk);
        else if (dk) warn(`${NAME[dk]} 접시에는 이미 조각이 있다 — 다른 접시에 담그자`);
        else if (Math.hypot(x - CUTS[cr.peel].x, y - CUTS[cr.peel].y) > 30) warn('벗긴 표피는 마르기 전에 <b>접시 용액</b>에 바로 담그자');
        return;
      }
      if (cr.kind === 'piece') { const s = homeSlide(x, y); if (s) toSlide(cr.obj, s); else if (!inDish(x, y)) warn('조각을 <b>받침 유리</b> 위에 놓자'); return; }
      if (cr.kind === 'cover') { const s = slides.find((sl) => inSlide(x, y, sl)); if (s) coverOn(s); return; }
      if (cr.kind === 'slide') { const s = cr.obj; if (inStage(x, y)) mountSlide(s); else { if (s.i === onStage) { onStage = -1; steps(); } place(s); } return; }
      if (cr.kind === 'dropper') { if (inStage(x, y)) dropEdge(); return; }
      if (cr.kind === 'paper') { if (inStage(x, y)) wick(); }
    }

    const S = P.make(stage, {
      draw,
      down(p) { const v = V(p), g = grab(v); if (!g) return; carry = { ...g, x: v.x, y: v.y }; },
      move(p) {
        if (!carry) return; const v = V(p);
        if (carry.kind === 'knob') { const dy = v.y - carry.y0; carry.y0 = v.y; focus = clamp(focus - dy * 0.0032, 0, 1); knobA += dy * 0.06; return; }
        carry.x = clamp(v.x, 10, VW - 10); carry.y = clamp(v.y, 20, VH - 10);
        if (carry.kind === 'slide') { carry.obj.x = carry.x + carry.dx; carry.obj.y = carry.y + carry.dy; }
      },
      up() { if (!carry) return; const cr = carry; carry = null; release(cr); table(); steps(); },
      key(e) {
        const k = e.key;
        if (k === '1' || k === '2') { next(k === '1' ? 'water' : 'salt'); return true; }
        if (k === '3') { refill(); return true; }
        if (k === 'ArrowUp' || k === 'ArrowDown') { focus = clamp(focus + (k === 'ArrowUp' ? 0.03 : -0.03), 0, 1); knobA += k === 'ArrowUp' ? -0.4 : 0.4; return true; }
        if (k === '0') { reset(); return true; } return false;
      },
    });
    function next(kind) {
      const pc = pieceOf(kind);
      if (!pc) { const ci = cuts.findIndex((u) => !u); if (ci >= 0) peel(ci, kind); }
      else if (pc.where === 'dish') { if (pc.soak < SOAK) { pc.soak = SOAK; pc.p = pc.kind === 'salt' ? 0.45 : 0; say(`${SOAK}분이 지났다 — 조각을 받침 유리에 올리자`); } else toSlide(pc, slides.find((s) => !s.piece && s.i !== onStage)); }
      else { const s = slides.find((x) => x.piece === pc); if (!s.cover) coverOn(s); else if (s.i !== onStage) mountSlide(s); else focus = BEST; }
      table(); steps();
    }
    function refill() { const s = cur(); if (!s) { warn('먼저 소금물 표본을 재물대에 올리자'); return; } if (!s.edge) dropEdge(); else wick(); }
    reset();
    root.querySelector('.on-reset').addEventListener('click', () => { reset(); S.kick(); });
    const state = () => ({
      pieces: pieces.map((p) => ({ kind: p.kind, env: p.env, where: p.where, soak: +p.soak.toFixed(1), p: +p.p.toFixed(2) })),
      slides: slides.map((s) => ({ piece: s.piece && s.piece.kind, cover: s.cover, edge: s.edge, wick: +s.wick.toFixed(2) })),
      onStage, focus: +focus.toFixed(2), rec: { ...rec }, done: root.classList.contains('u-done'), msg,
    });
    root._on = {
      next: (k) => { next(k); S.kick(); return state(); },
      refill: () => { refill(); S.kick(); return state(); },
      focus: (v) => { focus = v; S.kick(); return state(); },
      run: (sec) => { for (let i = 0; i < sec * 60; i++) step(1 / 60); S.kick(); return state(); },
      state, toScreen: (x, y) => [OX + x * K, OY + y * K],
      P: (n) => ({ cut0: CUTS[0], cut1: CUTS[1], water: DISH.water, salt: DISH.salt, slide0: slides[0], slide1: slides[1], cover: { x: COVER.x, y: COVER.y - 4 }, drop: { x: DROP.x, y: DROP.y - 30 }, paper: PAPER, stage: STAGE, knob: KNOB }[n]),
    };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Onion = { mount };
})();
