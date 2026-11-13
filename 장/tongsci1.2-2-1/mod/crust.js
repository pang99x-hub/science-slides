/* 2-2 1차시 이론 «지각과 생명체를 이루는 원소». 원소 질량비를 칸 크기로 그린 칸 지도.
   아래 손잡이를 끌면(화살표 키) 칸들이 부드럽게 «지각» ↔ «사람» 비율로 바뀐다. 칸을 누르면(위·아래 화살표로도 고름)
   그 원소가 생긴 곳(빅뱅·별 속 핵융합)과 한 줄 풀이가 .ct-out에. 값은 다른 자료의 질량 %.
   Crust.mount(root) → { fit, setActive } · 시험용: root._ct.mix(0~1) · tap('O') */
(function () {
  'use strict';
  // [기호, 이름, 지각 %, 사람 %, 생긴 곳, 풀이]
  const E = [
    ['O', '산소', 46.6, 65.0, 'star', '지각과 사람 모두에서 가장 많다 — 규소·탄소·수소와 잘 결합한다'],
    ['Si', '규소', 27.7, 0, 'star', '지각 2위 — 산소 넷과 묶여 규산염 사면체를 이룬다'],
    ['C', '탄소', 0, 18.5, 'star', '생명체 물질(단백질·핵산 등)의 뼈대 — 규소와 같은 14족'],
    ['H', '수소', 0, 9.5, 'bang', '물과 생명체 물질 곳곳에 — 빅뱅 직후에 생긴 원소'],
    ['Al', '알루미늄', 8.1, 0, 'star', '지각 3위 — 장석 같은 광물 속에 들어 있다'],
    ['Fe', '철', 5.0, 0, 'star', '지각 4위 — 무거운 별 중심에서 마지막으로 만들어진다'],
    ['Ca', '칼슘', 3.6, 1.5, 'star', '지각에도 사람(뼈·이)에도 있다'],
    ['N', '질소', 0, 3.3, 'star', '단백질·핵산에 꼭 들어간다'],
    ['Na', '나트륨', 2.8, 0, 'star', '지각의 광물 속 양이온'],
    ['K', '칼륨', 2.6, 0, 'star', '지각의 광물 속 양이온'],
    ['Mg', '마그네슘', 2.1, 0, 'star', '감람석 같은 어두운 광물에 많다'],
    ['P', '인', 0, 1.0, 'star', '핵산(DNA)의 인산과 뼈에 들어간다'],
    ['etc', '기타', 1.5, 1.2, 'mix', '여러 원소 — 철보다 무거운 것은 초신성 폭발 때 생긴다'],
  ];
  // 그림 도우미(11/10 다시 그리기): 명암 구슬은 오프스크린에 한 번 그려 캐시, 면은 빛(왼쪽 위) 방향에 따라 밝기를 달리한다
  const SPR = new Map();
  const shade = (hex, f) => { const n = parseInt(hex.slice(1), 16), m = (v) => Math.round(f < 0 ? v * (1 + f) : v + (255 - v) * f); return `rgb(${m(n >> 16)},${m((n >> 8) & 255)},${m(n & 255)})`; };
  function ball(c, x, y, r, col) {
    const k = col + Math.round(r * 2); let s = SPR.get(k);
    if (!s) {
      const d = Math.ceil(r * 2) + 6; s = document.createElement('canvas'); s.width = s.height = d * 2; const g = s.getContext('2d'); g.scale(2, 2);
      g.fillStyle = 'rgba(0,0,0,.28)'; g.beginPath(); g.ellipse(d / 2 + r * 0.18, d / 2 + r * 0.22, r, r * 0.9, 0, 0, Math.PI * 2); g.fill();
      const gr = g.createRadialGradient(d / 2 - r * 0.35, d / 2 - r * 0.4, r * 0.06, d / 2, d / 2, r); gr.addColorStop(0, shade(col, 0.6)); gr.addColorStop(0.45, col); gr.addColorStop(1, shade(col, -0.5));
      g.fillStyle = gr; g.beginPath(); g.arc(d / 2, d / 2, r, 0, Math.PI * 2); g.fill(); SPR.set(k, s);
    }
    const h = s.width / 4; c.drawImage(s, x - h, y - h, h * 2, h * 2);
  }
  const ORIGIN = { star: ['별 속 핵융합', '#f2a03d'], bang: ['빅뱅 직후', '#ffd84d'], mix: ['여러 곳', '#8a93a8'] };
  // 칸 나누기: 목록을 합이 반쯤 되게 둘로 갈라 긴 쪽 방향으로 자른다(합 0인 칸은 빼고).
  function layout(items, x, y, w, h, out) {
    const tot = items.reduce((s, it) => s + it.v, 0);
    if (!items.length || tot <= 0) return out;
    if (items.length === 1) { out.push({ ...items[0], x, y, w, h }); return out; }
    let acc = 0, k = 0; while (k < items.length - 1 && acc + items[k].v <= tot / 2) acc += items[k++].v;
    if (k === 0) { acc = items[0].v; k = 1; }
    const f = acc / tot, a = items.slice(0, k), b = items.slice(k);
    if (w >= h) { layout(a, x, y, w * f, h, out); layout(b, x + w * f, y, w * (1 - f), h, out); }
    else { layout(a, x, y, w, h * f, out); layout(b, x, y + h * f, w, h * (1 - f), out); }
    return out;
  }
  function mount(root) {
    const stage = root.querySelector('.ct-stage'), out = root.querySelector('.ct-out'), now = root.querySelector('.ct-now');
    const P = window.Play;
    let mix = 0, goal = 0, pick = 'O', held = false, cells = [];
    const G = (W, H) => ({ x: 14, y: 14, w: W - 28, h: H - 84, bar: [W * 0.18, W * 0.82, H - 34] });
    function say() {
      const e = E.find((q) => q[0] === pick), v = (e[2] * (1 - mix) + e[3] * mix);
      const h = `<b>${e[1]}</b> ${v.toFixed(1)} % · <b>${ORIGIN[e[4]][0]}</b> — ${e[5]}<small>지각 ${e[2] || '—'} % · 사람 ${e[3] || '—'} %</small>`;
      if (out.innerHTML !== h) out.innerHTML = h;
      const nt = mix < 0.15 ? '지각: 산소와 규소가 대부분' : mix > 0.85 ? '사람: 산소·탄소·수소·질소' : '손잡이를 끝까지 끌어 보자';
      if (now.textContent !== nt) now.textContent = nt;
    }
    const S = P.make(stage, {
      draw(c, W, H, dt) {
        const g = G(W, H);
        mix += (goal - mix) * Math.min(1, dt * 6);
        const items = E.map((e) => ({ e, v: e[2] * (1 - mix) + e[3] * mix })).filter((q) => q.v > 0.05);
        cells = layout(items, g.x, g.y, g.w, g.h, []);
        const bg = c.createLinearGradient(0, 0, 0, H); bg.addColorStop(0, '#1a2550'); bg.addColorStop(1, '#0b1126'); c.fillStyle = bg; c.fillRect(0, 0, W, H);
        cells.forEach((q, n) => {
          const col = ORIGIN[q.e[4]][1], on = q.e[0] === pick, x = q.x + 3, y = q.y + 3, w = q.w - 6, h = q.h - 6;
          if (w < 2 || h < 2) return;
          // 칸마다 같은 계열 안에서 밝기를 조금씩 달리하고, 위에서 아래로 명암
          const tone = (n % 3) * 0.08 - 0.08, gr = c.createLinearGradient(x, y, x + w * 0.3, y + h);
          gr.addColorStop(0, shade(col, 0.35 + tone)); gr.addColorStop(1, shade(col, -0.25 + tone));
          c.fillStyle = 'rgba(0,0,0,.35)'; c.beginPath(); c.roundRect(x + 3, y + 4, w, h, 8); c.fill();
          c.fillStyle = gr; c.globalAlpha = on ? 1 : 0.88; c.beginPath(); c.roundRect(x, y, w, h, 8); c.fill(); c.globalAlpha = 1;
          c.strokeStyle = 'rgba(255,255,255,.35)'; c.lineWidth = 1.5; c.beginPath(); c.roundRect(x + 1, y + 1, w - 2, h - 2, 7); c.stroke();
          if (on) { c.strokeStyle = '#fbfcf9'; c.lineWidth = 4; c.beginPath(); c.roundRect(x - 1, y - 1, w + 2, h + 2, 9); c.stroke(); }
          const sym = q.e[0] === 'etc' ? '' : q.e[0];
          if (w > 120 && h > 90) {
            const f = Math.round(Math.min(96, Math.max(46, Math.min(w, h) * 0.32))); // 큰 칸일수록 글자도 크게
            P.txt(c, sym, x + w / 2, y + h / 2 + f * 0.1, 'rgba(29,36,51,.85)', `800 ${f}px`);
            P.txt(c, q.e[1], x + w / 2, y + h / 2 + f * 0.62, '#1d2433', `800 ${Math.round(f * 0.42)}px`); P.txt(c, `${q.v.toFixed(1)} %`, x + w / 2, y + h / 2 + f * 1.06, '#1d2433', `700 ${Math.round(f * 0.36)}px`);
          } else if (w > 44 && h > 30) {
            P.txt(c, sym || q.e[1], x + w / 2, y + h / 2 + (h > 50 ? -2 : 6), 'rgba(29,36,51,.9)', h > 50 ? '800 22px' : '800 15px');
            if (h > 50) P.txt(c, `${q.e[1]} ${q.v.toFixed(1)} %`, x + w / 2, y + h / 2 + 18, '#1d2433', '600 12px');
          }
        });
        const [a, b, y] = g.bar, hx = a + (b - a) * goal;
        c.strokeStyle = '#3a4570'; c.lineWidth = 8; c.lineCap = 'round'; c.beginPath(); c.moveTo(a, y); c.lineTo(b, y); c.stroke();
        P.txt(c, '지각', a - 16, y + 7, '#fbfcf9', '800 19px', 'right'); P.txt(c, '사람', b + 16, y + 7, '#fbfcf9', '800 19px', 'left');
        P.glow(c, hx, y, 26, 'rgba(255,216,77,.5)'); ball(c, hx, y, 14, '#ffd84d');
        let lx = 14; Object.values(ORIGIN).forEach(([n, col]) => { ball(c, lx + 6, H - 9, 6, col); P.txt(c, n, lx + 16, H - 5, '#c9d2e8', '600 13px', 'left'); lx += 28 + n.length * 13; });
        say();
      },
      down(p) {
        const g = G(S.W, S.H), [a, b, y] = g.bar;
        if (Math.abs(p.y - y) < 28 && p.x > a - 30 && p.x < b + 30) { held = true; goal = Math.max(0, Math.min(1, (p.x - a) / (b - a))); return; }
        const q = cells.find((r) => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h); if (q) pick = q.e[0];
      },
      move(p, e, h) { if (h && held) { const [a, b] = G(S.W, S.H).bar; goal = Math.max(0, Math.min(1, (p.x - a) / (b - a))); } },
      up() { held = false; },
      key(e) {
        if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') { goal = Math.max(0, Math.min(1, goal + (e.key === 'ArrowRight' ? 0.1 : -0.1))); return true; }
        if (e.key === 'ArrowUp' || e.key === 'ArrowDown') { const vis = cells.map((q) => q.e[0]); const i = vis.indexOf(pick); pick = vis[(i + (e.key === 'ArrowDown' ? 1 : vis.length - 1)) % vis.length] || 'O'; return true; }
        return false;
      },
    });
    // 자체 확인: 칸 넓이 합 = 판 넓이
    const chk = layout(E.map((e) => ({ e, v: e[2] })).filter((q) => q.v > 0), 0, 0, 100, 50, []);
    console.assert(Math.abs(chk.reduce((s, q) => s + q.w * q.h, 0) - 5000) < 1e-6, 'crust: 칸 넓이 합이 맞지 않음');
    root._ct = { mix: (v) => { goal = mix = v; S.kick(); }, tap: (k) => { pick = k; S.kick(); } };
    return { fit: S.fit, setActive: S.setActive };
  }
  window.Crust = { mount };
})();
