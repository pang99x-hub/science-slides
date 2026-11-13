// 손 편집기 시험판(공유·편집 4단계 미리 보기). deck.html?d=…&edit 가 수업을 띄운 뒤 이 파일을 부른다.
// 화면의 장(live)과 원본 장(model: 실행 흔적이 없는 HTML)에 같은 data-eid 번호가 있고, 고칠 때 둘을 함께 고친다. 저장은 model만 쓴다.
// shortcut: 저장은 이 브라우저(localStorage), 넣은 그림은 data URI — 3단계에서 워커 저장(D1·R2)과 서버의 스크립트 거르기로 바꾼다
(() => {
  const src = JSON.parse(document.getElementById('ed-src').textContent);
  const box = document.createElement('template');
  box.innerHTML = src.slides.map((s) => s.html).join('');
  const models = [...box.content.children].filter((e) => e.matches('section'));
  if (models.length !== src.slides.length) console.warn('편집기: 장 수가 맞지 않습니다', models.length, src.slides.length);
  let seq = Math.max(0, ...[...box.content.querySelectorAll('[data-eid]')].map((e) => +e.dataset.eid));
  const M = (id) => box.content.querySelector(`[data-eid="${id}"]`);
  const L = (id) => document.querySelector(`.reveal .slides [data-eid="${id}"]`);
  const resolve = (html) => html.replace(/@@([A-Z0-9_]+)@@/g, (all, k) => src.media[k] || all);
  const unresolve = (html) => Object.entries(src.media).reduce((h, [k, url]) => (url ? h.split(url).join(`@@${k}@@`) : h), html);
  const key = (i) => 'deck-edit:' + src.slides[i].id;

  // 고를 수 있는 것, 고칠 수 없는 것(장 모듈이 움직이는 부분)
  const LOCK = 'canvas, button, input, select, textarea, video, iframe, aside.notes';
  const BLOCK = '[data-edit], [data-ed-add], img, figure, table, svg, h1, h2, h3, h4, p, li, .tcard, .sbox, .chip';
  const isText = (el) => el.matches('[data-edit]');
  const COLORS = ['#1b1f24', '#d92d20', '#1d4ed8', '#15803d', '#c2410c', '#7c3aed', '#6b7280', '#ffffff'];
  const FILLS = ['#ffffff', '#fde68a', '#bfdbfe', '#bbf7d0', '#fecaca', '#e5e7eb', '#1b1f24', '#d92d20', '#1d4ed8', '#15803d'];
  const PAPERS = ['#ffffff', '#fff8dc', '#e8f1fb', '#e9f5ec', '#fdecef', '#f1f3f5'];
  const FONTS = [['기본', ''], ['고딕', 'var(--f-body)'], ['명조', 'var(--f-display)'], ['손글씨', 'var(--f-pen)']];   // 틀이 이미 불러오는 글씨체만
  const SHAPES = [['화살표', 360, 160, 'M0 35H60V10L100 50L60 90V65H0Z'], ['양쪽 화살표', 400, 160, 'M0 50L30 15V37H70V15L100 50L70 85V63H30V85Z'], ['세모', 260, 240, 'M50 0L100 100H0Z'],
    ['별', 260, 260, 'M50 2L61 38H98L68 60L79 96L50 74L21 96L32 60L2 38H39Z'], ['말풍선', 420, 300, 'M10 5H90Q100 5 100 15V65Q100 75 90 75H45L20 98V75H10Q0 75 0 65V15Q0 5 10 5Z'],
    ['체크', 220, 220, 'M8 55L22 40L40 60L80 12L95 25L42 90Z'], ['엑스', 200, 200, 'M15 0L50 35L85 0L100 15L65 50L100 85L85 100L50 65L15 100L0 85L35 50L0 15Z']];

  let sel = null, more = [], hover = null, editing = null, drag = null, clip = null, lasso = null;
  const ids = () => (sel ? [sel, ...more] : []);
  const hist = [], redo = [];

  // ---------- 화면 ----------
  const h = (tag, props = {}, ...kids) => { const e = Object.assign(document.createElement(tag), props); e.append(...kids); return e; };
  const btn = (text, title, fn, cls = '') => h('button', { type: 'button', textContent: text, title, className: cls, onclick: (e) => { fn(e); e.currentTarget.blur(); } });
  document.head.append(h('style', { textContent: `
    html.ed-on .reveal { position: fixed !important; left: 228px; top: 56px; width: calc(100% - 228px) !important; height: calc(100% - 152px) !important; touch-action: none; }
    html.ed-on .toolbar, html.ed-on .reveal .controls, html.ed-on .reveal .progress { display: none !important; }
    html.ed-on .reveal .fragment { opacity: 1 !important; visibility: visible !important; }
    html.ed-on .reveal .slides [data-eid] { cursor: default; }
    html.ed-on .reveal .slides [contenteditable] { cursor: text; outline: none; user-select: text; -webkit-user-select: text; }
    .ed-ui, .ed-ui * { box-sizing: border-box; font: 500 14px/1.3 system-ui, -apple-system, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif; }
    .ed-top { position: fixed; z-index: 1000; left: 0; right: 0; top: 0; height: 56px; display: flex; align-items: center; gap: 6px; padding: 0 12px; background: #fff; border-bottom: 1px solid #d5dae1; color: #1b1f24; }
    .ed-top b { font-weight: 700; margin-right: 8px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 16em; }
    .ed-top .sep { width: 1px; height: 24px; background: #d5dae1; margin: 0 6px; }
    .ed-top .gap { flex: 1; }
    @media (max-width: 1360px) { .ed-ui.ed-top { gap: 4px; } .ed-ui.ed-top button { padding: 0 8px; } .ed-top b { max-width: 7em; } }   /* 단추가 다 들어가게 좁은 화면에서는 줄인다 */
    @media (max-width: 1100px) { .ed-top b { display: none; } }
    .ed-top .say { position: fixed; z-index: 999; top: 64px; right: 12px; max-width: calc(100% - 260px); color: #3b4452; background: rgba(255, 255, 255, .94); border: 1px solid #d5dae1; border-radius: 999px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; padding: 4px 12px; font-size: 13px; pointer-events: none; }
    .ed-top .say:empty { display: none; }   /* 저장 안내는 단추 줄 아래 오른쪽에 띄운다(단추 줄이 차서 가려지지 않게). AI 창을 열면 그 뒤로 숨는다 */
    .ed-ui button { height: 38px; min-width: 38px; padding: 0 12px; border: 1px solid #d5dae1; border-radius: 8px; background: #fff; color: #1b1f24; cursor: pointer; white-space: nowrap; }
    .ed-ui button:hover { background: #f1f4f8; } .ed-ui button:disabled { opacity: .35; cursor: default; }
    .ed-ui button:focus-visible { outline: 2px solid #2563eb; outline-offset: 1px; }
    .ed-ui button.go { background: #2563eb; border-color: #2563eb; color: #fff; } .ed-ui button.go:hover { background: #1d4ed8; }
    .ed-ui button.warn { color: #b42318; }
    .ed-list { position: fixed; z-index: 1000; left: 0; top: 56px; bottom: 0; width: 228px; overflow: auto; background: #f6f8fa; border-right: 1px solid #d5dae1; padding: 0 8px 8px; }
    .ed-list > button { display: flex; gap: 8px; width: 100%; height: auto; min-height: 40px; padding: 8px 10px; margin-bottom: 4px; text-align: left; white-space: normal; border-color: transparent; background: none; align-items: baseline; }
    .ed-list button i { font-style: normal; color: #8a94a3; min-width: 1.4em; } .ed-list button em { font-style: normal; color: #2563eb; margin-left: auto; white-space: nowrap; }
    .ed-list button[aria-current="true"] { background: #fff; border-color: #2563eb; }
    .ed-frame { position: fixed; z-index: 990; pointer-events: none; border: 2px solid #2563eb; display: none; }
    .ed-frame.hover { border: 1.5px dashed #2563eb; opacity: .7; } .ed-frame.lock { border-color: #98a2b3; }
    .ed-frame.text-on { border-style: dashed; }
    .ed-h { position: absolute; width: 12px; height: 12px; margin: -6px; background: #fff; border: 2px solid #2563eb; border-radius: 50%; pointer-events: auto; touch-action: none; }
    .ed-h::after { content: ""; position: absolute; inset: -9px; }   /* 손가락으로도 잡히게 */
    .ed-bar { position: fixed; z-index: 995; display: none; gap: 4px; padding: 4px; background: #fff; border: 1px solid #d5dae1; border-radius: 10px; box-shadow: 0 4px 16px rgba(16, 24, 40, .16); align-items: center; }
    .ed-bar button { height: 34px; min-width: 34px; padding: 0 9px; border-color: transparent; }
    .ed-ui button.dot { width: 26px; min-width: 26px; height: 26px; padding: 0; border-radius: 50%; border: 1px solid #98a2b3; }
    .ed-pop { position: fixed; z-index: 1001; display: none; flex-wrap: wrap; gap: 6px; max-width: 330px; padding: 8px; background: #fff; border: 1px solid #d5dae1; border-radius: 10px; box-shadow: 0 4px 16px rgba(16, 24, 40, .16); align-items: center; }
    .ed-bar .sep { width: 1px; height: 20px; background: #d5dae1; margin: 0 2px; }
    .ed-tools { position: sticky; top: 0; z-index: 1; display: flex; gap: 2px; align-items: center; margin: 0 -8px 8px; padding: 6px 8px; background: #f6f8fa; border-bottom: 1px solid #d5dae1; }
    .ed-tools button { width: 32px; min-width: 32px; height: 32px; padding: 0; display: grid; place-items: center; border-color: transparent; background: none; border-radius: 6px; color: #3b4452; }
    .ed-tools button:hover:not(:disabled) { background: #e6eaf0; } .ed-tools button.warn { color: #b42318; }
    .ed-tools .gap { flex: 1; } .ed-tools .sep { width: 1px; height: 18px; background: #d5dae1; margin: 0 4px; }
    .ed-pop .ask { width: 100%; color: #1b1f24; word-break: keep-all; } .ed-pop .cap { width: 100%; color: #5b6573; font-size: 12px; margin-top: 4px; }
    .ed-notes { position: fixed; z-index: 1000; left: 228px; right: 0; bottom: 0; height: 96px; display: flex; gap: 8px; align-items: stretch; padding: 8px 12px; background: #fff; border-top: 1px solid #d5dae1; color: #5b6573; }
    .ed-notes label { width: 5.5em; padding-top: 6px; }
    .ed-notes textarea { flex: 1; resize: none; padding: 6px 10px; border: 1px solid #d5dae1; border-radius: 8px; color: #1b1f24; background: #fff; }
    .ed-pop input { width: 220px; height: 38px; padding: 0 10px; border: 1px solid #d5dae1; border-radius: 8px; color: #1b1f24; background: #fff; }
    .ed-pop button.line { width: 100%; text-align: left; }
    .ed-frame.more { border-width: 1.5px; }
    .ed-band { position: fixed; z-index: 991; display: none; border: 1px solid #2563eb; background: rgba(37, 99, 235, .1); pointer-events: none; }
    .ed-h.rot { left: 50%; top: -30px; cursor: grab; background: #2563eb; }
    .ed-ai { position: fixed; z-index: 1000; right: 0; top: 56px; bottom: 0; width: 380px; display: none; flex-direction: column; gap: 8px; padding: 18px; overflow: auto; background: #fff; border-left: 1px solid #d5dae1; color: #1b1f24; box-shadow: -4px 0 16px rgba(16, 24, 40, .12); }
    .ed-ai h2 { font-size: 15px; font-weight: 700; margin: 6px 0 0; } .ed-ai pre { margin: 0; padding: 8px 10px; white-space: pre-wrap; word-break: break-all; font: 12px/1.5 ui-monospace, Menlo, monospace; background: #f6f8fa; border: 1px solid #e3e7ec; border-radius: 8px; }
    .ed-ai textarea { min-height: 150px; padding: 8px 10px; font: 12px/1.5 ui-monospace, Menlo, monospace; border: 1px solid #98a2b3; border-radius: 8px; color: #1b1f24; background: #fff; }
    .ed-ai .head { display: flex; align-items: center; justify-content: space-between; } .ed-ai .head h2 { font-size: 18px; margin: 0; } .ed-ui button.x { border: 0; font-size: 16px; color: #667085; }
    .ed-ai .steps { list-style: none; margin: 4px 0 0; padding: 0; display: grid; gap: 14px; } .ed-ai .steps li { display: flex; gap: 12px; align-items: flex-start; }
    .ed-ai .steps i { flex: none; width: 26px; height: 26px; border-radius: 50%; background: #2563eb; color: #fff; font: 700 13px/26px system-ui, sans-serif; text-align: center; }
    .ed-ai .steps div { display: grid; gap: 3px; justify-items: start; white-space: normal; } .ed-ai .steps b { font-size: 15px; } .ed-ai .steps span { font-size: 13px; line-height: 1.5; color: #475467; } .ed-ai .steps span:empty { display: none; } .ed-ai .steps button { margin-top: 4px; }
    .ed-ai h3 { font-size: 14px; font-weight: 700; margin: 14px 0 0; padding-top: 16px; border-top: 1px solid #e3e7ec; } .ed-ai .cap { font-size: 12px; color: #667085; margin-top: -4px; }
    .ed-ai .says { display: flex; flex-wrap: wrap; gap: 6px; } .ed-ai .says button { height: auto; padding: 7px 12px; border-radius: 999px; font-size: 13px; line-height: 1.4; white-space: normal; text-align: left; background: #f1f5ff; border-color: #d6e0fb; color: #1e3a8a; } .ed-ai .says button:hover { background: #e2eaff; }
    .ed-ai .note { margin: 8px 0 0; padding: 10px 12px; font-size: 13px; line-height: 1.55; white-space: normal; color: #475467; background: #f6f8fa; border-radius: 8px; }
    .ed-ai details { margin-top: 8px; padding-top: 12px; border-top: 1px solid #e3e7ec; font-size: 13px; color: #475467; } .ed-ai summary { cursor: pointer; font-weight: 600; } .ed-ai details[open] { display: grid; gap: 8px; } .ed-ai details textarea { width: 100%; box-sizing: border-box; min-height: 110px; } .ed-ai details > button { justify-self: start; }
    .ed-ai .mini { margin: 0; padding-left: 18px; line-height: 2.4; white-space: normal; } .ed-ai .mini button { height: 30px; font-size: 13px; }
    .ed-ai #ed-ai-out { font-size: 13px; font-weight: 600; } .ed-ai #ed-ai-out:empty { display: none; }
    .ed-guide { position: fixed; z-index: 989; background: #e11d48; pointer-events: none; display: none; }
  ` }));
  document.documentElement.classList.add('ed-on');

  const say = h('span', { className: 'say', role: 'status' });
  const tell = (t) => { say.textContent = t; };
  const undoB = btn('↶', '되돌리기 (Ctrl+Z)', () => travel(false)), redoB = btn('↷', '다시 하기 (Ctrl+Shift+Z)', () => travel(true));
  let bgNext = false;
  const file = h('input', { type: 'file', accept: 'image/*', hidden: true, onchange: () => { if (file.files[0]) (bgNext ? setBg : addImage)(file.files[0]); file.value = ''; } });
  // 단추 아래에 펼치는 작은 고르기 상자
  const popup = h('div', { className: 'ed-ui ed-pop' });
  const shut = () => { popup.style.display = 'none'; };
  popup.onclick = (e) => { if (!e.target.matches('input, select')) shut(); };
  function pop(e, ...kids) {
    const r = e.currentTarget.getBoundingClientRect(); popup.replaceChildren(...kids); popup.style.display = 'flex';
    Object.assign(popup.style, { left: Math.max(8, Math.min(r.left, innerWidth - popup.offsetWidth - 8)) + 'px', top: r.bottom + 6 + 'px' });
  }
  const dots = (colors, fn) => colors.map((c) => { const b = btn('', '색 ' + c, () => fn(c), 'dot'); b.style.background = c; return b; });
  // 되돌릴 수 없는 일은 단추 아래 작은 상자에서 한 번 더 묻는다
  const ask = (e, text, yes, fn) => pop(e, h('span', { className: 'ask', textContent: text }), btn(yes, yes, fn, 'warn'), btn('취소', '그만두기', () => {}));
  const icon = (d, title, fn, cls = '') => { const b = btn('', title, fn, cls); b.innerHTML = `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`; b.setAttribute('aria-label', title); return b; };
  const resetB = btn('이 장 원래대로', '이 장에서 고친 것을 모두 버립니다', (e) => (src.slides[at()].src ? ask(e, '이 장에서 고친 것을 모두 버릴까요?', '원래대로', () => { localStorage.removeItem(key(at())); touch(); location.reload(); }) : tell('새로 만든 장은 돌아갈 원래 모습이 없습니다. 필요 없으면 왼쪽 휴지통으로 빼세요')), 'warn');   // 새로 만든 장은 저장분이 곧 장이라 지우면 빈 장이 된다
  const top = h('div', { className: 'ed-ui ed-top' },
    h('b', { textContent: '고치기 · ' + src.title }), btn('다른 차시 열기', '다른 단원·차시를 골라 편집기로 엽니다', (e) => openOther(e)), undoB, redoB, h('span', { className: 'sep' }),
    btn('＋ 글 상자', '글 상자 넣기', () => addBox('text')), btn('＋ 그림', '내 컴퓨터의 그림 넣기 (복사한 그림은 Ctrl+V, 파일은 끌어다 놓아도 됩니다)', () => { bgNext = false; file.click(); }),
    btn('＋ 도형', '네모·동그라미·선·화살표·별·말풍선 넣기', (e) => shapeMenu(e)), btn('＋ 표', '표 넣기 · 줄과 칸 수를 고릅니다', (e) => tableMenu(e)), btn('배경', '이 장의 배경 바꾸기', (e) => bgMenu(e)), btn('AI로 고치기', 'AI에게 말로 시켜 수업을 고치는 방법 안내', () => aiOpen(ai.style.display !== 'flex')),
    say, h('span', { className: 'gap' }), resetB, btn('수업함에 저장', '고친 수업을 내 수업함에 저장합니다 · 선생님 페이지에서 어느 컴퓨터로든 엽니다', () => boxSave()), btn('내려받기', '고친 수업을 내 HTML 파일 하나로 내려받습니다(인터넷 없이 열립니다)', () => { endText(); window.open(`${location.pathname}?d=${src.d}&mine&save`); }), btn('수업 화면으로 보기', '고친 수업을 새 창에서 엽니다', () => window.open(`${location.pathname}?d=${src.d}&mine#/${Reveal.getIndices().h}`), 'go'), file);
  const list = h('div', { className: 'ed-ui ed-list' });
  const frame = h('div', { className: 'ed-ui ed-frame' }), hov = h('div', { className: 'ed-ui ed-frame hover' });
  const bar = h('div', { className: 'ed-ui ed-bar' });
  const guides = [h('div', { className: 'ed-ui ed-guide' }), h('div', { className: 'ed-ui ed-guide' })];
  const memo = h('textarea', { id: 'ed-memo', placeholder: '이 장에서 할 말을 적어 두세요. 발표자 화면에만 보이고 학생 화면에는 나오지 않습니다.', onchange: () => saveMemo() });
  const notes = h('div', { className: 'ed-ui ed-notes' }, h('label', { htmlFor: 'ed-memo', textContent: '발표자 메모' }), memo);
  const band = h('div', { className: 'ed-ui ed-band' });
  document.body.append(top, list, notes, hov, frame, band, bar, popup, ...guides);
  for (const b of [bar, popup]) b.onmousedown = (e) => { if (!e.target.matches('input, select')) e.preventDefault(); };   // 글 고치는 중에 단추를 눌러도 고른 글자가 풀리지 않게

  // ---------- 도우미 ----------
  const cur = () => Reveal.getCurrentSlide();
  const at = () => Reveal.getSlides().indexOf(cur());
  const scale = () => { const s = cur(); return s.getBoundingClientRect().width / s.offsetWidth || 1; };
  const unit = (el) => { const r = el.getBoundingClientRect(), s = cur().getBoundingClientRect(), k = scale(); return { x: (r.left - s.left) / k, y: (r.top - s.top) / k, w: r.width / k, h: r.height / k }; };
  // 옮길 때 쓰는 left·top의 지금 값(흐름 속 요소는 position: relative로 바꿔 옮긴다 — transform은 장 모듈의 움직임과 부딪친다)
  const pos = (el) => { const cs = getComputedStyle(el), st = cs.position === 'static'; return { st, left: st ? 0 : parseFloat(cs.left) || 0, top: st ? 0 : parseFloat(cs.top) || 0 }; };
  const px = (n) => Math.round(n * 10) / 10 + 'px';
  const angle = (el) => parseFloat(el.style.rotate) || 0;
  const size = (el) => (el.offsetWidth != null ? { w: el.offsetWidth, h: el.offsetHeight } : { w: parseFloat(getComputedStyle(el).width), h: parseFloat(getComputedStyle(el).height) });   // 돌리기 전 크기(svg는 offsetWidth가 없다)
  const LIFT = { position: 'relative', 'z-index': '5' };   // 흐름 속 요소를 옮기면 뒤 카드 밑으로 들어가 다시 잡을 수 없으므로 앞으로 올린다

  function pick(t) {
    const el = t.closest && t.closest('.reveal .slides [data-eid]');
    if (!el || !cur().contains(el)) return {};
    if (el.closest(LOCK)) return { lock: el.closest(LOCK) };
    const b = el.closest(BLOCK);
    return b && b !== cur() && cur().contains(b) ? { id: b.dataset.eid } : {};
  }
  // 바깥 상자: 장을 거의 다 덮는 배치용 상자는 건너뛴다
  function outer(id) {
    for (let p = L(id).parentElement; p && p !== cur(); p = p.parentElement) {
      const u = unit(p);
      if (p.dataset.eid && u.w * u.h < 1920 * 1080 * 0.6 && !p.closest(LOCK)) return p.dataset.eid;
    }
    return null;
  }

  // ---------- 고친 것 쌓기(되돌리기) ----------
  function commit(op, i = at()) { op.at = i; op.redo(); hist.push(op); if (hist.length > 300) hist.shift(); redo.length = 0; after(op.at); }
  function travel(fwd) {
    endText();
    const op = (fwd ? redo : hist).pop(); if (!op) return;
    if (op.at !== at()) Reveal.slide(op.at);
    fwd ? op.redo() : op.undo(); (fwd ? hist : redo).push(op);
    if (ids().some((id) => !L(id))) select(null);
    after(op.at);
  }
  const clean = (m) => { const c = m.cloneNode(true); for (const e of [c, ...c.querySelectorAll('[data-eid]')]) e.removeAttribute('data-eid'); return c.outerHTML; };
  function after(i) {
    try { localStorage.setItem(key(i), clean(models[i])); touch(); tell('저장됨 ' + new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })); }
    catch (e) { tell('저장하지 못했습니다(그림이 너무 큽니다)'); }
    shut(); undoB.disabled = !hist.length; redoB.disabled = !redo.length;
    marks(); paintBar(); showMemo(); aiShow();
  }
  const both = (id, fn) => { for (const e of [M(id), L(id)]) if (e) fn(e); };
  function styleOp(id, props) {
    const m = M(id), before = {}; for (const k in props) before[k] = m.style.getPropertyValue(k);
    const set = (p) => both(id, (e) => { for (const k in p) p[k] === '' ? e.style.removeProperty(k) : e.style.setProperty(k, p[k]); });
    return { redo: () => set(props), undo: () => set(before) };
  }
  function attrOp(id, k, v) {
    const before = M(id).getAttribute(k), set = (x) => both(id, (e) => (x == null ? e.removeAttribute(k) : e.setAttribute(k, x)));
    return { redo: () => set(v), undo: () => set(before) };
  }
  function htmlOp(id, v) {   // v: 원본 쪽 글(@@이름@@ 그대로)
    const m = M(id), before = m.innerHTML, set = (x) => both(id, (e) => { e.innerHTML = e === m ? x : resolve(x); });
    return { redo: () => set(v), undo: () => set(before) };
  }
  const multi = (ops) => ({ redo: () => ops.forEach((o) => o.redo()), undo: () => [...ops].reverse().forEach((o) => o.undo()) });
  // 새 요소: model 쪽을 만들고 번호를 붙인 뒤 같은 글로 화면 쪽을 만든다
  function make(html) {
    const t = document.createElement('template'); t.innerHTML = html.trim();
    const m = t.content.firstElementChild;
    for (const e of [m, ...m.querySelectorAll('*')]) e.setAttribute('data-eid', ++seq);
    t.innerHTML = resolve(m.outerHTML);
    return { m, l: t.content.firstElementChild };
  }
  // where: { parent: 번호, before: 번호|null }
  function addOp(n, where) {
    const put = (node, P) => { const p = P(where.parent), b = where.before && P(where.before); p.insertBefore(node, b && b.parentNode === p ? b : null); };
    return { redo: () => { put(n.m, M); put(n.l, L); }, undo: () => { n.m.remove(); n.l.remove(); } };
  }
  function removeOp(id) {
    const m = M(id), l = L(id), next = m.nextElementSibling;
    return addOpReverse(addOp({ m, l }, { parent: m.parentElement.dataset.eid, before: next && next.dataset.eid }));
  }
  const addOpReverse = (o) => ({ redo: o.undo, undo: o.redo });

  // ---------- 고르기와 그리기 ----------
  function select(id) {
    endText(); sel = id; more = []; paintBar();
    if (!id) return tell('고칠 것을 누르세요 · 움직이는 체험 부분은 그대로 작동합니다');
    tell(isText(L(id)) ? '두 번 누르면 글을 고칩니다 · 끌어서 옮기기' : '끌어서 옮기기 · 점을 끌어 크기 바꾸기');
  }
  // 누른 것 고르기. 묶음이면 묶음 모두, Shift를 누르면 더하거나 뺀다
  function choose(id, add) {
    const g = L(id).dataset.edG, set = g ? [...cur().querySelectorAll(`[data-ed-g="${g}"]`)].map((e) => e.dataset.eid) : [id], all = ids();
    let next = !add ? [id, ...set.filter((x) => x !== id)] : all.includes(id) ? all.filter((x) => !set.includes(x)) : [...all, ...set.filter((x) => !all.includes(x))];
    choose2(next);
  }
  function choose2(next) { select(next[0] || null); more = next.slice(1); paintBar(); if (more.length) tell(`${next.length}개 골랐습니다 · 끌어서 함께 옮기기 · Shift+누르기로 더하거나 빼기`); }
  function place(box, el) {
    if (!el) { box.style.display = 'none'; return null; }
    const r = el.getBoundingClientRect(), a = angle(el);
    if (!a) Object.assign(box.style, { display: 'block', left: r.left - 2 + 'px', top: r.top - 2 + 'px', width: r.width + 4 + 'px', height: r.height + 4 + 'px', rotate: '' });
    else {   // 돌린 것은 가운데를 맞추고 틀도 같이 돌린다
      const z = size(el), k = scale(), w = z.w * k + 4, hh = z.h * k + 4;
      Object.assign(box.style, { display: 'block', left: r.left + r.width / 2 - w / 2 + 'px', top: r.top + r.height / 2 - hh / 2 + 'px', width: w + 'px', height: hh + 'px', rotate: a + 'deg' });
    }
    return r;
  }
  const extra = [];
  function tick() {
    const el = sel && L(sel);
    const r = place(frame, el);
    frame.classList.toggle('text-on', !!editing);
    place(hov, !drag && hover && !ids().includes(hover) ? L(hover) : null);
    more.forEach((id, i) => { if (!extra[i]) document.body.append(extra[i] = h('div', { className: 'ed-ui ed-frame more' })); place(extra[i], L(id)); });
    extra.slice(more.length).forEach((x) => { x.style.display = 'none'; });
    if (r && !drag) {
      bar.style.display = 'flex';
      const bw = bar.offsetWidth, y = r.top - 88 > 60 ? r.top - 88 : Math.min(r.bottom + 12, innerHeight - 150);   // 위쪽 돌림 손잡이를 가리지 않게 띄운다
      Object.assign(bar.style, { left: Math.max(236, Math.min(r.left, innerWidth - bw - 8)) + 'px', top: y + 'px' });
    } else bar.style.display = 'none';
    requestAnimationFrame(tick);
  }
  function paintBar() {
    frame.replaceChildren(); bar.replaceChildren();
    const el = sel && L(sel); if (!el) return;
    const text = isText(el), kind = el.dataset.edAdd;
    const sep = () => h('span', { className: 'sep' });
    if (more.length) {   // 여러 개: 맞춤·묶기·색·복제·지우기만
      const grouped = ids().every((id) => L(id).dataset.edG && L(id).dataset.edG === el.dataset.edG);
      bar.append(h('span', { textContent: `${ids().length}개` }), sep(),
        btn('맞춤', '줄 맞추기', (e) => pop(e, ...[['왼쪽', 'x', 0], ['가운데', 'x', .5], ['오른쪽', 'x', 1], ['위', 'y', 0], ['중간', 'y', .5], ['아래', 'y', 1]].map(([n, ax, f]) => btn(n, n + ' 맞춤', () => alignAll(ax, f))))),
        grouped ? btn('묶음 풀기', '묶음을 풉니다', () => commit(multi(ids().map((id) => attrOp(id, 'data-ed-g', null))))) : btn('묶기', '하나처럼 함께 고르고 옮기게 묶습니다', () => { const g = 'g' + ++seq; commit(multi(ids().map((id) => attrOp(id, 'data-ed-g', g)))); }), sep(),
        btn('글자색', '글자 색', (e) => pop(e, ...dots(COLORS, (c) => paint({ color: c })))),
        btn('채움', '채움 색', (e) => pop(e, ...dots(FILLS, (c) => commit(multi(ids().map((id) => styleOp(id, { [L(id).matches('svg') ? 'color' : 'background-color']: c }))))))), sep(),
        btn('복제', '똑같은 것을 하나씩 더 (Ctrl+D)', duplicate), btn('지우기', '지우기 (Delete)', remove, 'warn'));
      return;
    }
    // 글은 높이가 글 양을 따라가므로 좌우 점만, 나머지는 여덟 점
    for (const d of text ? ['e', 'w'] : ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']) {
      const k = h('div', { className: 'ed-h' });
      k.style.left = d.includes('w') ? '0' : d.includes('e') ? '100%' : '50%'; k.style.top = d.includes('n') ? '0' : d.includes('s') ? '100%' : '50%';
      k.style.cursor = { n: 'ns', s: 'ns', e: 'ew', w: 'ew', nw: 'nwse', se: 'nwse', ne: 'nesw', sw: 'nesw' }[d] + '-resize';
      k.onpointerdown = (e) => startDrag(e, d);
      frame.append(k);
    }
    if (!/^(inline|table-)/.test(getComputedStyle(el).display)) { const k = h('div', { className: 'ed-h rot', title: '끌어서 돌리기' }); k.onpointerdown = (e) => startDrag(e, 'rot'); frame.append(k); }
    const pic = el.matches('img'), shape = el.matches('svg');
    if (text) {
      const st = (b, k, v) => { b.style[k] = v; return b; };
      bar.append(st(btn('가', '글자 작게', () => font(-1)), 'fontSize', '11px'), st(btn('가', '글자 크게', () => font(1)), 'fontSize', '18px'),
        st(btn('가', '굵게 · 글 고치는 중에는 고른 글자만', () => mark('bold', 'font-weight', (c) => (+c.fontWeight >= 600 ? '400' : '800'))), 'fontWeight', '800'),
        st(btn('가', '기울임', () => mark('italic', 'font-style', (c) => (c.fontStyle === 'italic' ? 'normal' : 'italic'))), 'fontStyle', 'italic'),
        st(btn('가', '밑줄', () => mark('underline', 'text-decoration', (c) => (c.textDecorationLine.includes('underline') ? 'none' : 'underline'))), 'textDecoration', 'underline'),
        btn('글자색', '글자 색 · 글 고치는 중에는 고른 글자만', (e) => pop(e, ...dots(COLORS, (c) => (editing ? document.execCommand('foreColor', false, c) : commit(styleOp(sel, { color: c })))))),
        btn('글씨체', '글씨체', (e) => pop(e, ...FONTS.map(([n, f]) => st(btn(n, n, () => commit(styleOp(sel, { 'font-family': f }))), 'fontFamily', f)))),
        btn('정렬', '왼쪽 → 가운데 → 오른쪽', align),
        btn('줄', '글머리표 · 줄 간격', (e) => pop(e, btn('• 글머리표', '줄마다 점을 붙이거나 뗍니다', bullets), ...[1, 1.2, 1.5, 1.8, 2].map((v) => btn(v.toFixed(1), '줄 간격 ' + v, () => commit(styleOp(sel, { 'line-height': String(v) })))))),
        btn('링크', '고른 글자에 누리집 주소 걸기', linkMenu), sep());
    }
    if (el.closest('table')) {
      bar.append(btn('표', '줄·칸 넣고 빼기', (e) => pop(e, btn('아래에 줄 넣기', '', () => tableOp('row+'), 'line'), btn('오른쪽에 칸 넣기', '', () => tableOp('col+'), 'line'), btn('이 줄 지우기', '', () => tableOp('row-'), 'line warn'), btn('이 칸 지우기', '', () => tableOp('col-'), 'line warn'))), sep());
    }
    if (!pic && (!shape || kind)) bar.append(btn('채움', '채움 색', (e) => pop(e, ...dots(FILLS, (c) => commit(styleOp(sel, { [shape ? 'color' : 'background-color']: c }))),
      ...(shape ? [] : [btn('없음', '채움 없음', () => commit(styleOp(sel, { 'background-color': 'transparent' })))]))));
    if (!shape) bar.append(btn('테두리', '테두리 선', (e) => pop(e, btn('없음', '테두리 없음', () => commit(styleOp(sel, { border: 'none' }))),
      ...dots(COLORS, (c) => commit(styleOp(sel, { 'border-style': 'solid', 'border-color': c, 'border-width': parseFloat(getComputedStyle(L(sel)).borderTopWidth) ? getComputedStyle(L(sel)).borderTopWidth : '4px' }))),
      btn('가늘게', '가는 선', () => commit(styleOp(sel, { 'border-style': 'solid', 'border-width': '2px' }))), btn('굵게', '굵은 선', () => commit(styleOp(sel, { 'border-style': 'solid', 'border-width': '8px' }))))));
    bar.append(sep());
    bar.append(btn('앞으로', '다른 것보다 앞에 놓기', () => layer(1)), btn('뒤로', '다른 것보다 뒤에 놓기', () => layer(-1)), sep(),
      btn('복제', '똑같은 것을 하나 더 (Ctrl+D)', duplicate), btn('지우기', '지우기 (Delete)', remove, 'warn'));
    const up = outer(sel);
    if (up) bar.append(sep(), btn('바깥 상자', '이것을 담은 상자를 고릅니다', () => select(up)));
  }
  // 장 넣기·빼기·순서: 내 순서를 저장하고 새로 연다
  // shortcut: 장 구성을 바꾸면 화면을 새로 열어 되돌리기 기록이 사라진다, 워커 저장(3단계) 때 그 자리에서 바꾸게 고친다
  const ORDER = 'deck-order:' + src.d, DIRTY = 'deck-dirty:' + src.d;   // DIRTY: 이 브라우저에서 고친 뒤 수업함에 아직 저장하지 않음
  function touch() { try { localStorage.setItem(DIRTY, '1'); } catch (e) { /* 꽉 참 */ } }
  const session = () => { try { const s = JSON.parse(localStorage.getItem('science-room:session')); return s && s.token ? s : null; } catch (e) { return null; } };
  const roomApi = () => (new URLSearchParams(location.search).get('roomapi') || 'https://science-room.pang99x.workers.dev').replace(/\/$/, '');
  // 수업함에 저장: 이 브라우저의 작업본(장 순서 + 고친 장)을 수업방 워커의 내 계정에 올린다
  async function boxSave() {
    endText();
    const s = session();
    if (!s) { tell('선생님 페이지에서 로그인하면 수업함에 저장할 수 있습니다'); return false; }
    const o = order(), edits = {};
    for (const x of o) { const v = localStorage.getItem('deck-edit:' + x.id); if (v) edits[x.id] = v; }
    tell('수업함에 저장하는 중…');
    try {
      const r = await fetch(roomApi() + '/decks/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session: s.token, base: src.d, title: src.title, order: o, edits }) }), j = await r.json();
      tell(j.error || '수업함에 저장했습니다 · 선생님 페이지의 «내 수업함»에서 엽니다');
      if (!j.error) localStorage.removeItem(DIRTY);
      return !j.error;
    } catch (e) { tell('수업함에 연결하지 못했습니다. 인터넷 연결을 확인해 주세요'); return false; }
  }
  // 다른 차시 열기: 과목 → 단원 → 차시를 골라 그 차시 편집기로 간다. 수업함에 담은 차시는 수업함 것을 연다
  async function openOther(e) {
    endText();
    const at0 = { currentTarget: e.currentTarget }, [slug, unit] = src.d.split('/');
    const json = (u) => fetch(u).then((r) => (r.ok ? r.json() : null)).catch(() => null);
    const s = session();
    const [all, can, mine] = await Promise.all([json('lessons.json'), json('장/units.json'),
      s ? fetch(roomApi() + '/decks/list', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session: s.token }) }).then((r) => r.json()).catch(() => null) : null]);
    const inBox = new Set(((mine && mine.decks) || []).map((x) => x.base));
    // units.json이 없으면 지금 단원만 고른다(장 묶음이 있는 단원만 편집기로 열린다)
    let units = ((all && all.units) || []).filter((u) => (Array.isArray(can) ? can : [slug + '.' + unit]).includes(u.subjectSlug + '.' + u.unit));
    if (!units.length) units = [{ subject: '', subjectSlug: slug, unit, unitTitle: src.title.replace(/ \d+차시$/, ''), lessons: src.lessons }];
    const mk = (label, list, val) => { const el = h('select', { ariaLabel: label }); el.append(...list.map(([v, t]) => h('option', { value: v, textContent: t }))); if (list.some(([v]) => v === val)) el.value = val; el.style.cssText = 'width:100%;height:38px;padding:0 8px;border:1px solid #d5dae1;border-radius:8px;background:#fff;color:#1b1f24'; return el; };
    const subj = mk('과목', [...new Set(units.map((u) => u.subjectSlug))].map((x) => [x, (units.find((u) => u.subjectSlug === x).subject || x)]), slug);
    const uSel = h('span', { style: 'display:contents' }), lSel = h('span', { style: 'display:contents' });
    let uBox, lBox;
    const fillL = (val) => { const u = units.find((x) => x.subjectSlug + '/' + x.unit === uBox.value); lBox = mk('차시', (u ? u.lessons : []).map((l) => { const d = uBox.value + '/' + l.n; return [d, `${l.n}차시 ${l.title}` + (d === src.d ? ' (지금 고치는 중)' : inBox.has(d) ? ' (수업함)' : '')]; }), val); lSel.replaceChildren(lBox); };
    const fillU = (val) => { uBox = mk('단원', units.filter((u) => u.subjectSlug === subj.value).map((u) => [u.subjectSlug + '/' + u.unit, `${u.unit} ${u.unitTitle}`]), val); uBox.onchange = () => fillL(); uSel.replaceChildren(uBox); fillL(src.d); };
    subj.onchange = () => fillU(); fillU(slug + '/' + unit);
    const go = (d) => {
      const q = new URLSearchParams(location.search); q.set('d', d); q.delete('box'); q.delete('edit');
      const useBox = inBox.has(d) && !localStorage.getItem('deck-dirty:' + d);   // 그 차시를 이 브라우저에서 고친 뒤 저장하지 않았으면 그 작업본을 연다
      location.href = location.pathname + '?' + q.toString().replace(/=(?=&|$)/g, '').replace(/%2F/g, '/') + (useBox ? '&box' : '') + '&edit';
    };
    const open = () => {
      const d = lBox.value; if (!d || d === src.d) return tell('지금 고치고 있는 차시입니다');
      if (!localStorage.getItem(DIRTY)) return go(d);
      setTimeout(() => pop(at0, h('span', { className: 'ask', textContent: '이 차시에서 고친 것을 아직 수업함에 저장하지 않았습니다. 고친 것은 이 브라우저에 남지만, 다른 컴퓨터에서 열려면 저장해야 합니다.' }),
        btn('저장하고 열기', '수업함에 저장한 뒤 고른 차시를 엽니다', async () => { if (await boxSave()) go(d); }, 'go'), btn('저장 없이 열기', '이 브라우저에만 남기고 엽니다', () => go(d)), btn('취소', '그만두기', () => {})));   // 이 상자를 누른 클릭이 끝난 뒤에 띄운다(바로 띄우면 같은 클릭에 닫힌다)
    };
    pop(at0, h('span', { className: 'cap', textContent: '과목' }), subj, h('span', { className: 'cap', textContent: '단원' }), uSel, h('span', { className: 'cap', textContent: '차시' }), lSel,
      btn('이 차시 고치기', '고른 차시를 편집기로 엽니다', open, 'go'));
  }
  const order = () => src.slides.map((s) => (s.src ? { id: s.id, src: s.src } : { id: s.id }));
  const newId = () => 'mine.' + Date.now().toString(36) + (++seq).toString(36);
  function reorder(next, go) { endText(); localStorage.setItem(ORDER, JSON.stringify(next)); touch(); location.hash = '#/' + go; location.reload(); }
  function moveSlide(d) { const i = at(), o = order(), j = i + d; if (j < 0 || j >= o.length) return; [o[i], o[j]] = [o[j], o[i]]; reorder(o, j); }
  // 같은 체험 장을 복제하면 움직이는 부분은 앞쪽 장에서만 작동한다(장 이름이 겹친다)
  function copySlide() { const i = at(), o = order(), id = newId(); localStorage.setItem('deck-edit:' + id, clean(models[i])); o.splice(i + 1, 0, { ...o[i], id }); reorder(o, i + 1); }
  function dropSlide() { const i = at(), o = order(); if (o.length < 2) return tell('장이 하나뿐이라 뺄 수 없습니다'); const [x] = o.splice(i, 1); if (x.id.startsWith('mine.')) localStorage.removeItem('deck-edit:' + x.id); reorder(o, Math.min(i, o.length - 1)); }
  const esc = (t) => t.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
  const rich = (t) => esc(t.trim()).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/\n/g, '<br>');   // 꾸밈 없는 글 + **굵게** + 줄 바꿈만
  const blankHtml = (title, body, memo) => '<section data-state="blank" class="std"><div class="sheet"></div><div class="frame"></div>' +
    ADD.text.replace('left:560px;top:470px;width:800px;font-size:40px', 'left:160px;top:120px;width:1600px;font-size:72px;font-weight:800').replace('글을 입력하세요', title) +
    ADD.text.replace('left:560px;top:470px;width:800px', 'left:160px;top:300px;width:1600px').replace('글을 입력하세요', body) + (memo ? `<aside class="notes">${memo}</aside>` : '') + '</section>';
  // 움직이는 장: AI가 짠 HTML 문서를 격리된 틀(sandbox, 같은 출처 아님)에 넣는다 — 이 사이트의 저장분·수업방·다른 장을 건드리지 못한다
  const attr = (t) => esc(t).replace(/"/g, '&quot;');
  const liveHtml = (title, doc, memo) => `<section data-state="blank" class="std" data-ed-live="${attr(title)}"><iframe sandbox="allow-scripts" title="${attr(title)}" style="position:absolute;left:0;top:0;width:1920px;height:1080px;border:0" srcdoc="${attr(doc)}"></iframe>${memo ? `<aside class="notes">${memo}</aside>` : ''}</section>`;
  const liveOf = (m) => m.dataset.edLive != null && m.querySelector('iframe[srcdoc]');
  function blankSlide() { const i = at(), o = order(), id = newId(); localStorage.setItem('deck-edit:' + id, blankHtml('제목', '내용을 입력하세요')); o.splice(i + 1, 0, { id }); reorder(o, i + 1); }
  function addMenu(e) {   // 빈 장, 또는 다른 차시의 장 가져오기
    pop(e, btn('빈 장', '지금 장 뒤에 빈 장 넣기', blankSlide, 'line'), h('span', { className: 'cap', textContent: '다른 차시에서 가져오기' }), ...src.lessons.map((l) => btn(`${l.n}차시 · ${l.title}`, '이 차시의 장 보기', async (ev) => {
      ev.stopPropagation();
      const got = await Promise.all(l.slides.map((id) => fetch(`장/${id}/t.json`).then((r) => r.json()).catch(() => null)));
      popup.replaceChildren(...l.slides.map((id, n) => {
        const t = document.createElement('template'); t.innerHTML = got[n] ? got[n].html : '';
        const hd = t.content.querySelector('h1, h2');
        return btn(`${n + 1}. ${hd ? hd.textContent.trim() : id.split('.').pop()}`, '지금 장 뒤에 넣기', () => {
          const i = at(), o = order(); o.splice(i + 1, 0, { id: o.some((x) => x.id === id) ? newId() : id, src: id }); reorder(o, i + 1);
        }, 'line');
      }));
    }, 'line')));
  }
  function marks() {
    const slides = Reveal.getSlides(), i = at(), off = (b, v) => { b.disabled = v; return b; };
    list.replaceChildren(h('div', { className: 'ed-tools', role: 'toolbar', ariaLabel: '장 다루기' },
      icon('M12 5v14M5 12h14', '장 넣기', addMenu), icon('M9 9h11v11H9zM5 15V5a1 1 0 0 1 1-1h9', '이 장 복제', copySlide), h('span', { className: 'sep' }),
      off(icon('M12 19V5M5 12l7-7 7 7', '이 장을 앞으로 옮기기', () => moveSlide(-1)), i === 0), off(icon('M12 5v14M5 12l7 7 7-7', '이 장을 뒤로 옮기기', () => moveSlide(1)), i === slides.length - 1),
      h('span', { className: 'gap' }),
      ...(localStorage.getItem(ORDER) ? [icon('M4 12a8 8 0 1 0 3-6.2M4 4v5h5', '장 구성 원래대로', (e) => ask(e, '넣고 빼고 옮긴 것을 버리고 원래 차시 순서로 돌릴까요?', '원래대로', () => { localStorage.removeItem(ORDER); touch(); location.hash = ''; location.reload(); }))] : []),
      off(icon('M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3', '이 장 빼기', (e) => ask(e, `${i + 1}번 장을 수업에서 뺄까요?`, '빼기', dropSlide), 'warn'), slides.length < 2)),
    ...slides.map((s, n) => {
      const t = s.querySelector('h1, h2, [data-ed-add="text"]');
      const b = h('button', { type: 'button', onclick: () => Reveal.slide(n) }, h('i', { textContent: n + 1 }), h('span', { textContent: s.dataset.edLive || (t && t.textContent.trim()) || s.dataset.state || '장' }), h('em', { textContent: localStorage.getItem(key(n)) ? '고침' : '' }));
      b.setAttribute('aria-current', n === i);
      return b;
    }));
  }
  // 발표자 메모: 꾸밈 없는 글로 고친다
  const noteOf = (root) => root.querySelector('aside.notes');
  function showMemo() {
    const a = noteOf(models[at()]), t = document.createElement('template');
    t.innerHTML = a ? a.innerHTML.replace(/<br\s*\/?>|<\/p>\s*<p[^>]*>/gi, '\n') : '';
    memo.value = t.content.textContent.trim();
  }
  function memoOp(i, v) {
    const m = models[i], a = noteOf(m);
    return a ? htmlOp(a.dataset.eid, v) : v ? addOp(make(`<aside class="notes">${v}</aside>`), { parent: m.dataset.eid, before: null }) : null;
  }
  function saveMemo() { const op = memoOp(at(), rich(memo.value)); if (op) commit(op); }

  // ---------- AI 창구: 브라우저에 연결된 AI(또는 붙여 넣기)가 글로 읽고 명령으로 고친다 ----------
  const aiIn = h('textarea', { id: 'ed-ai-in', ariaLabel: 'AI가 준 답 붙여 넣는 칸', placeholder: 'AI가 준 답을 여기에 붙여 넣으세요', spellcheck: false });
  const aiOut = h('div', { id: 'ed-ai-out', role: 'status' }), aiMap = h('pre', { id: 'ed-ai-map' }), aiSrc = h('pre', { id: 'ed-ai-src' });
  const aiUndo = btn('방금 적용 취소', '마지막으로 적용하기 전으로 돌립니다', () => {
    const b = JSON.parse(sessionStorage.getItem('ed-ai-back') || 'null'); if (!b) return;
    for (const k of Object.keys(localStorage)) if (k.startsWith('deck-')) localStorage.removeItem(k);
    for (const k in b) localStorage.setItem(k, b[k]);
    sessionStorage.removeItem('ed-ai-back'); sessionStorage.setItem('ed-ai-msg', '결과: 방금 적용한 것을 취소했습니다'); location.reload();
  });
  const aiMan = h('pre', { textContent: `이 칸은 브라우저에 연결된 AI(Claude·제미나이·ChatGPT)나 선생님이 수업을 글로 고치는 창구입니다.
1) 아래 «수업 개요»를 읽습니다. [3]은 3번 장, 3.2는 3번 장의 둘째 글 칸입니다.
2) «명령(AI용)» 칸에 JSON 배열을 넣습니다. 넣으면 1초 안에 자동으로 적용되고 칸이 비워집니다(누를 단추는 없습니다). 장 번호는 적용하기 전 개요의 번호입니다.
3) «결과(AI용)»를 읽습니다. 장 구성이 바뀌면 화면이 새로 열리니 다시 읽으세요. 오류가 하나라도 있으면 아무것도 바뀌지 않습니다. 방금 적용한 것을 되돌리려면 [{"do":"undo"}]를 넣습니다.

명령 (글에서 **굵게**, 줄 바꿈은 \\n):
{"do":"text","at":"3.2","text":"새 글"}  글 칸 바꾸기
{"do":"add","after":3,"title":"제목","body":"내용","notes":"발표자 메모"}  3번 장 뒤에 새 장 (after 0 = 맨 앞)
{"do":"box","slide":3,"text":"글","x":160,"y":760,"w":1600,"size":40}  글 상자 넣기 (장 크기 1920×1080)
{"do":"notes","slide":3,"text":"발표자 메모"}
{"do":"move","slide":3,"to":1}  3번 장을 1번 자리로
{"do":"remove","slide":3}  장 빼기

{"do":"live","after":3,"title":"제목","html":"<!doctype html>…","notes":"발표자 메모"}  3번 장 뒤에 움직이는 장을 새로 만들기
{"do":"live","slide":4,"html":"<!doctype html>…"}  개요에 «움직이는 장»이라 적힌 장을 새 문서로 바꾸기 (title·notes를 주면 함께 바꿈)

움직이는 장(live)의 html 규칙: CSS·JavaScript를 모두 담은 완전한 HTML 문서 하나. 화면(100vw×100vh, 16:9, 전자칠판)에 꽉 차게, 글자는 크게(본문 4vh 이상), 마우스와 터치 모두 되게 pointer 이벤트로, 한국어로 만든다. 격리된 틀에서 돌아 저장(localStorage·쿠키)과 바깥 화면은 쓸 수 없고, 바깥 파일도 되도록 쓰지 않는다. 지금 보는 움직이는 장의 문서는 아래 «이 장의 문서»에 있다.
text·add·box·notes의 글에 넣은 HTML·코드는 글자 그대로 들어간다. 자료실 원래 장의 움직이는 부분(체험·문제 풀이)은 글만 바꿀 수 있으니, 동작을 바꾸려면 live로 새 장을 만들고 원래 장은 remove 한다.` });
  const copy = (t, done) => navigator.clipboard.writeText(t).then(() => tell(done));
  const say1 = (t) => btn(t, '누르면 복사됩니다. AI 대화창에 붙여 넣으세요', () => copy(t, '복사했습니다. AI 대화창에 붙여 넣으세요'));
  const step = (n, title, sub, ...kids) => h('li', {}, h('i', { textContent: n }), h('div', {}, h('b', { textContent: title }), h('span', { textContent: sub }), ...kids));
  const ai = h('div', { className: 'ed-ui ed-ai', id: 'ed-ai' },
    h('div', { className: 'head' }, h('h2', { textContent: 'AI로 고치기' }), btn('✕', '닫기', () => aiOpen(false), 'x')),
    h('ol', { className: 'steps' },
      step('1', '브라우저 AI 열기', '크롬의 Claude 확장 프로그램(오른쪽 위 퍼즐 모양), 제미나이, ChatGPT처럼 지금 보는 페이지를 직접 다루는 AI면 됩니다. 없으면 Chrome 웹 스토어에서 설치합니다.'),
      step('2', '말로 시키기', '대화창에 하고 싶은 일을 적으면 AI가 고칩니다.'),
      step('3', '마음에 안 들면 되돌리기', '', aiUndo)),
    aiOut,
    h('h3', { textContent: '이렇게 말해 보세요' }),
    h('div', { className: 'says' }, ...['3번 장 뒤에 염기 짝 맞추기 놀이를 만들어 줘', '마지막에 ○× 퀴즈 5문제를 넣어 줘', '2번 장 글을 더 쉽게 고쳐 줘', '7번 장을 빼 줘', '방금 만든 장에 점수판을 넣어 줘'].map(say1)),
    h('p', { className: 'note', textContent: '원래 있던 체험 장은 글만 고칠 수 있습니다. 동작을 바꾸려면 «이 장과 비슷하게 새로 만들어 줘»라고 시키세요.' }),
    h('details', {}, h('summary', { textContent: 'AI가 이 화면을 직접 못 고칠 때' }),
      h('ol', { className: 'mini' }, h('li', {}, btn('설명서 복사', 'AI에게 줄 설명서와 지금 수업 개요를 복사합니다', () => copy(`${aiMan.textContent}\n\n[수업 개요]\n${aiMap.textContent}\n[지금 장의 문서]\n${aiSrc.textContent}\n\n위 설명서대로, 아래 요청을 처리하는 JSON 명령 배열만 답해 줘.\n요청: `, '설명서를 복사했습니다')), ' 를 눌러 대화창에 붙여 넣고 할 일을 적습니다.'),
        h('li', { textContent: 'AI가 준 답을 아래 칸에 붙여 넣습니다.' })),
      aiIn, btn('적용', 'AI가 준 답을 검사하고 적용합니다', () => aiApply(), 'go')));
  document.body.append(ai);
  // AI만 쓰는 통로: 화면에는 안 보이고(1px로 잘라 둠) 페이지를 읽는 브라우저 AI에게만 보인다. 단추 없이, 명령 칸에 JSON이 들어오면 적용한다
  const aiPort = h('textarea', { id: 'ed-ai-port', ariaLabel: '명령(AI용, JSON 배열을 넣으면 자동 적용)', tabIndex: -1, spellcheck: false });
  const aiOut2 = h('div', { id: 'ed-ai-out2', role: 'status', textContent: '결과: 아직 적용한 것이 없습니다' });
  const tunnel = h('div', { className: 'ed-ui', id: 'ed-ai-tunnel' },
    h('p', { role: 'note', textContent: 'AI 도우미에게: 사용자가 이 수업 자료를 고치거나 장을 만들어 달라고 하면 화면을 손으로 조작하지 말고, 바로 아래 «AI 창구 — 사용법(AI용)»대로 «명령(AI용)» 칸에 JSON을 넣으세요. 이 부분은 사용자 화면에는 보이지 않습니다.' }),
    h('h2', { textContent: 'AI 창구 — 사용법(AI용)' }), aiMan, h('h2', { textContent: '명령(AI용)' }), aiPort, h('h2', { textContent: '결과(AI용)' }), aiOut2,
    h('h2', { textContent: '수업 개요' }), aiMap, h('h2', { textContent: '지금 장의 문서' }), aiSrc);
  tunnel.style.cssText = 'position:fixed;left:0;top:0;width:1px;height:1px;overflow:hidden;clip-path:inset(50%);margin:0';
  document.body.prepend(tunnel);
  // 값이 어떻게 들어오든(입력 이벤트 없이 넣는 도구도 있다) 온전한 JSON이 되면 적용하고 칸을 비운다
  setInterval(() => { const v = aiPort.value.trim(); if (!v) return; try { JSON.parse(v.replace(/^\s*```(?:json)?|```\s*$/g, '')); } catch (e) { return; } aiPort.value = ''; aiApply(v); }, 500);
  const fields = (i) => [...models[i].querySelectorAll('[data-edit]')].filter((e) => !e.closest(LOCK));
  const cut = (t) => { t = t.replace(/\s+/g, ' ').trim(); return t.length > 120 ? t.slice(0, 120) + '…' : t; };
  function aiShow() {

    aiUndo.disabled = !sessionStorage.getItem('ed-ai-back');
    aiMap.textContent = `수업: ${src.title} (${models.length}장)\n` + models.map((m, i) => {
      const t = m.querySelector('h1, h2, [data-ed-add="text"]'), a = noteOf(m);
      return `[${i + 1}] ${cut(m.dataset.edLive || (t ? t.textContent : m.dataset.state || '장'))}${liveOf(m) ? ' (움직이는 장 — live로 고칠 수 있음)' : src.slides[i].src ? '' : ' (새로 만든 장)'}\n` + fields(i).map((f, k) => `  ${i + 1}.${k + 1} ${cut(f.textContent)}\n`).join('') + (a ? `  메모: ${cut(a.textContent)}\n` : '');
    }).join('');
    const lv = liveOf(models[at()]); aiSrc.textContent = lv ? lv.getAttribute('srcdoc') : '(지금 장은 움직이는 장이 아닙니다)';
  }
  function aiOpen(on) { ai.style.display = on ? 'flex' : 'none'; on ? sessionStorage.setItem('ed-ai-open', '1') : sessionStorage.removeItem('ed-ai-open'); aiShow(); }
  const aiSay = (t) => { aiOut.textContent = aiOut2.textContent = t; aiOut.style.color = t.startsWith('오류') ? '#b42318' : '#15803d'; };
  function aiApply(text = aiIn.value) {
    let cmds; try { cmds = JSON.parse(text.replace(/^\s*```(?:json)?|```\s*$/g, '')); } catch (e) { return aiSay('오류: JSON 형식이 아닙니다 — ' + e.message); }
    if (cmds && cmds.do === 'undo' || Array.isArray(cmds) && cmds.length === 1 && cmds[0] && cmds[0].do === 'undo') return sessionStorage.getItem('ed-ai-back') ? aiUndo.click() : aiSay('오류: 취소할 것이 없습니다');
    if (!Array.isArray(cmds)) cmds = [cmds];
    const n = models.length, errs = [], str = (v, max = 2000) => typeof v === 'string' && v.length <= max, opt = (v) => v == null || str(v);
    const sl = (v) => Number.isInteger(v) && v >= 1 && v <= n, num = (v, lo, hi) => v == null || (Number.isFinite(v) && v >= lo && v <= hi);
    const field = (ref) => { const m = /^(\d+)\.(\d+)$/.exec(ref || ''); return m && sl(+m[1]) ? fields(+m[1] - 1)[+m[2] - 1] : null; };
    if (cmds.length > 60) errs.push('명령은 한 번에 60개까지입니다');
    cmds.forEach((c, k) => {
      const need = (okay, why) => { if (!okay) errs.push(`${k + 1}번째 명령(${c && c.do}): ${why}`); };
      if (!c || typeof c !== 'object') return need(false, '모양이 다릅니다');
      if (c.do === 'text') { need(field(c.at), '없는 칸입니다(at)'); need(str(c.text), 'text가 없거나 너무 깁니다'); }
      else if (c.do === 'notes') { need(sl(c.slide), '없는 장입니다'); need(str(c.text), 'text가 없거나 너무 깁니다'); }
      else if (c.do === 'box') { need(sl(c.slide), '없는 장입니다'); need(str(c.text) && c.text.trim(), 'text가 없거나 너무 깁니다'); need(num(c.x, 0, 1900) && num(c.y, 0, 1060) && num(c.w, 40, 1920) && num(c.size, 10, 300), 'x·y·w·size 값이 범위를 벗어났습니다'); }
      else if (c.do === 'add') { need(Number.isInteger(c.after) && c.after >= 0 && c.after <= n, 'after는 0~' + n); need(str(c.title, 200) && c.title.trim(), 'title이 없거나 너무 깁니다'); need(opt(c.body) && opt(c.notes), 'body·notes가 너무 깁니다'); }
      else if (c.do === 'live') {
        need(str(c.html, 300000) && /<\w/.test(c.html), 'html이 없거나 너무 깁니다(30만 자까지)'); need(opt(c.notes), 'notes가 너무 깁니다');
        if (c.slide != null) { need(sl(c.slide) && liveOf(models[c.slide - 1]), 'slide는 개요에 «움직이는 장»이라 적힌 장만 됩니다'); need(c.title == null || (str(c.title, 200) && c.title.trim()), 'title이 너무 깁니다'); }
        else { need(Number.isInteger(c.after) && c.after >= 0 && c.after <= n, 'after는 0~' + n); need(str(c.title, 200) && c.title.trim(), 'title이 없거나 너무 깁니다'); }
      }
      else if (c.do === 'remove') need(sl(c.slide), '없는 장입니다');
      else if (c.do === 'move') need(sl(c.slide) && sl(c.to), '없는 장입니다(slide·to)');
      else need(false, '모르는 명령입니다');
    });
    if (errs.length) return aiSay('오류(아무것도 바꾸지 않았습니다): ' + errs.join(' / '));
    try { sessionStorage.setItem('ed-ai-back', JSON.stringify(Object.fromEntries(Object.keys(localStorage).filter((k) => k.startsWith('deck-')).map((k) => [k, localStorage.getItem(k)])))); }
    catch (e) { return aiSay('오류(아무것도 바꾸지 않았습니다): 되돌릴 사본을 만들 자리가 없습니다. 큰 그림을 줄여 주세요'); }
    endText(); select(null);
    // 글 → 장 구성 순서로. 장 구성은 번호가 밀리지 않게 장 id로 다룬다
    const o = order(), id0 = o.map((x) => x.id), last = {}; let shape = false, boxes = 0;
    for (const c of cmds) {
      if (c.do === 'text') { const f = field(c.at); commit(htmlOp(f.dataset.eid, rich(c.text)), +c.at.split('.')[0] - 1); }
      else if (c.do === 'notes') { const op = memoOp(c.slide - 1, rich(c.text)); if (op) commit(op, c.slide - 1); }
      else if (c.do === 'box') {
        const html = ADD.text.replace('left:560px;top:470px;width:800px;font-size:40px', `left:${c.x ?? 160}px;top:${c.y ?? 760 + 70 * boxes++}px;width:${c.w ?? 1600}px;font-size:${c.size ?? 40}px`).replace('글을 입력하세요', rich(c.text));
        commit(addOp(make(html), { parent: models[c.slide - 1].dataset.eid, before: null }), c.slide - 1);
      } else {
        shape = true; const pos = (id) => o.findIndex((x) => x.id === id);
        if (c.do === 'live' && c.slide != null) { const m = models[c.slide - 1], a = noteOf(m); localStorage.setItem('deck-edit:' + id0[c.slide - 1], liveHtml(c.title ? c.title.trim() : m.dataset.edLive, c.html, c.notes != null ? rich(c.notes) : a ? a.innerHTML : '')); }
        else if (c.do === 'live') { const id = newId(), anchor = last[c.after] || id0[c.after - 1]; localStorage.setItem('deck-edit:' + id, liveHtml(c.title.trim(), c.html, rich(c.notes || ''))); o.splice(anchor ? pos(anchor) + 1 : 0, 0, { id }); last[c.after] = id; }
        else if (c.do === 'add') { const id = newId(), anchor = last[c.after] || id0[c.after - 1]; localStorage.setItem('deck-edit:' + id, blankHtml(rich(c.title), rich(c.body || ''), rich(c.notes || ''))); o.splice(anchor ? pos(anchor) + 1 : 0, 0, { id }); last[c.after] = id; }
        else if (pos(id0[c.slide - 1]) >= 0) { const [x] = o.splice(pos(id0[c.slide - 1]), 1); if (c.do === 'move') o.splice(c.to - 1, 0, x); }
      }
    }
    const msg = `결과: ${cmds.length}개 명령을 적용했습니다`;
    if (!o.length) return aiSay('오류: 장을 모두 뺄 수는 없습니다(글 바꾸기만 적용했습니다)');
    if (shape) { sessionStorage.setItem('ed-ai-msg', msg + ` · 지금 ${o.length}장`); return reorder(o, Math.min(at(), o.length - 1)); }
    aiSay(msg); aiShow();
  }

  // ---------- 고치는 동작 ----------
  function font(d) { const el = L(sel), f = parseFloat(getComputedStyle(el).fontSize); commit(styleOp(sel, { 'font-size': px(Math.max(10, Math.round(f * (d > 0 ? 1.1 : 1 / 1.1)))) })); }
  // 글 고치는 중이면 고른 글자에만, 아니면 글 상자 전체에
  function mark(cmd, prop, next) { if (editing) return document.execCommand(cmd); commit(styleOp(sel, { [prop]: next(getComputedStyle(L(sel))) })); }
  function align() { const a = getComputedStyle(L(sel)).textAlign; commit(styleOp(sel, { 'text-align': a === 'center' ? 'right' : a === 'right' || a === 'end' ? 'left' : 'center' })); }
  const sheetId = () => (cur().querySelector(':scope > .sheet') || cur()).dataset.eid;   // 모눈종이를 그리는 바탕
  function bgMenu(e) {
    const set = (p) => commit(styleOp(sheetId(), p));
    pop(e, ...dots(PAPERS, (c) => set({ 'background-color': c })), btn('모눈 없애기', '모눈 줄을 지웁니다', () => set({ 'background-image': 'none' })),
      btn('그림…', '내 컴퓨터의 그림을 배경으로 씁니다', () => { bgNext = true; file.click(); }),
      btn('원래대로', '배경을 처음대로', () => set({ 'background-color': '', 'background-image': '', 'background-size': '', 'background-position': '' })));
  }
  const setBg = (f) => readImage(f, (url) => commit(styleOp(sheetId(), { 'background-image': `url("${url}")`, 'background-size': 'cover', 'background-position': 'center' })));
  function shapeMenu(e) {
    const ic = (title, inner, fn) => { const b = btn('', title, fn); b.innerHTML = `<svg viewBox="0 0 100 100" width="24" height="24" aria-hidden="true">${inner}</svg>`; b.setAttribute('aria-label', title); return b; };
    pop(e, ic('네모', '<rect x="6" y="18" width="88" height="64" rx="8" fill="currentColor"/>', () => addBox('rect')), ic('동그라미', '<circle cx="50" cy="50" r="42" fill="currentColor"/>', () => addBox('oval')),
      ic('선', '<rect x="4" y="46" width="92" height="8" fill="currentColor"/>', () => addBox('line')),
      ...SHAPES.map(([n, w, hh, d]) => ic(n, `<path fill="currentColor" d="${d}"/>`, () => addBox('shape',
        `<svg data-ed-add="shape" viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;left:${960 - w / 2}px;top:${540 - hh / 2}px;width:${w}px;height:${hh}px;color:#d92d20;z-index:4"><path fill="currentColor" d="${d}"/></svg>`))));
  }
  function layer(d) { const el = L(sel), cs = getComputedStyle(el); commit(styleOp(sel, { ...(cs.position === 'static' ? { position: 'relative' } : {}), 'z-index': String((parseInt(cs.zIndex) || 0) + d) })); }
  const paint = (p) => commit(multi(ids().map((id) => styleOp(id, p))));
  function remove() { const all = ids(); if (!all.length) return; select(null); commit(multi(all.map(removeOp))); }
  function alignAll(ax, f) {   // 고른 것들의 바깥 테두리 기준
    const us = ids().map((id) => [id, unit(L(id)), pos(L(id))]), lo = Math.min(...us.map(([, u]) => u[ax])), hi = Math.max(...us.map(([, u]) => u[ax] + (ax === 'x' ? u.w : u.h)));
    commit(multi(us.map(([id, u, p]) => { const d = lo + (hi - lo) * f - (u[ax] + (ax === 'x' ? u.w : u.h) * f); return styleOp(id, { ...(p.st ? LIFT : {}), [ax === 'x' ? 'left' : 'top']: px((ax === 'x' ? p.left : p.top) + d) }); })));
  }
  function bullets() {
    endText();
    const lines = M(sel).innerHTML.split(/<br\s*\/?>/i), on = lines.every((l) => /^\s*• /.test(l));
    commit(multi([htmlOp(sel, lines.map((l) => (on ? l.replace(/^(\s*)• /, '$1') : /^\s*• /.test(l) ? l : '• ' + l)).join('<br>')), styleOp(sel, on ? { 'padding-left': '', 'text-indent': '' } : { 'padding-left': '1em', 'text-indent': '-1em' })]));
  }
  function linkMenu(e) {
    const s = getSelection();
    if (!editing || s.isCollapsed) return tell('두 번 눌러 글을 고치는 중에, 링크를 걸 글자를 먼저 고르세요');
    const range = s.getRangeAt(0), back = () => { L(editing).focus(); s.removeAllRanges(); s.addRange(range); };
    const input = h('input', { type: 'url', placeholder: 'https://', ariaLabel: '누리집 주소' });
    const go = () => {
      const v = input.value.trim(), url = /^https?:\/\//i.test(v) ? v : 'https://' + v;
      if (!v || /[\s"<>]/.test(v)) return tell('주소를 다시 확인하세요');
      back(); document.execCommand('createLink', false, url);
      for (const a of L(editing).querySelectorAll('a[href]')) { a.target = '_blank'; a.rel = 'noopener'; }
      shut();
    };
    input.onkeydown = (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); go(); } };
    pop(e, input, btn('넣기', '링크 걸기', (ev) => { ev.stopPropagation(); go(); }, 'go'), btn('없애기', '링크 풀기', () => { back(); document.execCommand('unlink'); }));
    input.focus();
  }
  function copyOf(id) { const c = M(id).cloneNode(true); for (const e of [c, ...c.querySelectorAll('[data-eid]')]) e.removeAttribute('data-eid'); return c; }
  function duplicate() {
    const all = ids(); if (!all.length) return;
    endText();
    const gmap = {}, made = all.map((id) => {
      const m = M(id), c = copyOf(id), abs = getComputedStyle(L(id)).position === 'absolute';
      if (abs) { const p = pos(L(id)); c.style.left = px(p.left + 24); c.style.top = px(p.top + 24); }   // 흐름 속 요소(카드 등)는 바로 뒤에 한 칸 더 생긴다
      if (c.dataset.edG) c.dataset.edG = gmap[c.dataset.edG] || (gmap[c.dataset.edG] = 'g' + ++seq);   // 복제한 묶음은 새 묶음
      const n = make(c.outerHTML), next = m.nextElementSibling;
      return [n.m.dataset.eid, addOp(n, { parent: m.parentElement.dataset.eid, before: next && next.dataset.eid })];
    });
    commit(multi(made.map((x) => x[1])));
    choose2(made.map((x) => x[0]));
  }
  function paste() {
    if (!clip) return;
    if (clip.from.every((id) => M(id) && L(id) && cur().contains(L(id)))) { choose2(clip.from); return duplicate(); }
    const t = document.createElement('template'); t.innerHTML = clip.html; const c = t.content.firstElementChild;
    Object.assign(c.style, { position: 'absolute', left: '200px', top: '200px', width: px(clip.w), boxSizing: 'border-box', margin: '0' });
    const n = make(c.outerHTML); commit(addOp(n, { parent: cur().dataset.eid, before: null })); select(n.m.dataset.eid);
  }
  const ADD = {
    text: '<div data-ed-add="text" data-edit="add" style="position:absolute;left:560px;top:470px;width:800px;font-size:40px;line-height:1.4;color:#1b1f24;z-index:5">글을 입력하세요</div>',
    rect: '<div data-ed-add="rect" style="position:absolute;left:760px;top:390px;width:400px;height:300px;background:#fde68a;border-radius:16px;z-index:4"></div>',
    line: '<div data-ed-add="line" style="position:absolute;left:760px;top:537px;width:400px;height:6px;background:#1b1f24;z-index:4"></div>',
    oval: '<div data-ed-add="oval" style="position:absolute;left:810px;top:390px;width:300px;height:300px;background:#bfdbfe;border-radius:50%;z-index:4"></div>',
  };
  const tableHtml = (r, c) => `<table data-ed-add="table" style="position:absolute;left:${960 - Math.min(1500, 240 * c) / 2}px;top:${Math.max(120, 540 - 36 * r)}px;width:${Math.min(1500, 240 * c)}px;border-collapse:collapse;background:#fff;z-index:5">` +
    ('<tr>' + '<td data-edit="add" style="border:2px solid #94a3b8;padding:12px 16px;font-size:30px;line-height:1.3;color:#1b1f24">&nbsp;</td>'.repeat(c) + '</tr>').repeat(r) + '</table>';
  function tableMenu(e) {   // 격자에서 줄×칸 고르기
    const N = 8, label = h('span', { textContent: '줄 × 칸을 고르세요' }), cells = [];
    const show = (r, c) => { cells.forEach((b, i) => { b.style.background = Math.floor(i / N) <= r && i % N <= c ? '#bfdbfe' : '#fff'; }); label.textContent = `${r + 1}줄 × ${c + 1}칸`; };
    for (let i = 0; i < N * N; i++) {
      const r = Math.floor(i / N), c = i % N, b = btn('', `${r + 1}줄 × ${c + 1}칸`, () => addBox('table', tableHtml(r + 1, c + 1)));
      Object.assign(b.style, { width: '28px', minWidth: '28px', height: '28px', padding: '0', borderRadius: '4px' }); b.onpointerenter = b.onfocus = () => show(r, c); cells.push(b);
    }
    const grid = h('div', {}, ...cells); Object.assign(grid.style, { display: 'grid', gridTemplateColumns: `repeat(${N}, 28px)`, gap: '3px' });
    const wrap = h('div', {}, grid, label); label.style.cssText = 'display:block;margin-top:6px;color:#5b6573';
    pop(e, wrap);
  }
  // 표 줄·칸 넣고 빼기. 고른 칸 기준(표를 골랐으면 마지막 줄·칸)
  // shortcut: 합친 칸(colspan·rowspan)은 헤아리지 않는다, 합친 칸이 있는 표를 고치게 되면 칸 위치 계산을 넣는다
  function tableOp(what) {
    endText();
    const el = L(sel), cell = el.closest('td, th'), tb = el.closest('table'), mt = M(tb.dataset.eid), rows = [...mt.rows];
    const r = cell ? cell.parentElement.rowIndex : rows.length - 1, c = cell ? cell.cellIndex : rows[r].cells.length - 1;
    const blank = (n) => { const x = n.cloneNode(true); for (const e of [x, ...x.querySelectorAll('[data-eid]')]) e.removeAttribute('data-eid'); for (const k of x.matches('tr') ? [...x.cells] : [x]) { k.innerHTML = '&nbsp;'; k.setAttribute('data-edit', 'add'); } return x.outerHTML; };
    const afterOf = (n) => ({ parent: n.parentElement.dataset.eid, before: n.nextElementSibling && n.nextElementSibling.dataset.eid });
    const wrapRow = (html) => { const n = make('<table><tbody>' + html + '</tbody></table>'); const pickRow = (t) => t.querySelector('tr'); return { m: pickRow(n.m), l: pickRow(n.l) }; };
    const wrapCell = (html) => { const n = make('<table><tbody><tr>' + html + '</tr></tbody></table>'); const pk = (t) => t.querySelector('td, th'); return { m: pk(n.m), l: pk(n.l) }; };
    const cellAt = (row) => row.cells[Math.min(c, row.cells.length - 1)];
    if (what === 'row+') return commit(addOp(wrapRow(blank(rows[r])), afterOf(rows[r])));
    if (what === 'col+') return commit(multi(rows.map((row) => addOp(wrapCell(blank(cellAt(row))), afterOf(cellAt(row))))));
    if (what === 'row-' ? rows.length < 2 : rows[r].cells.length < 2) return tell('마지막 한 줄·한 칸은 지울 수 없습니다 · 표를 골라 지우세요');
    const op = what === 'row-' ? removeOp(rows[r].dataset.eid) : multi(rows.map((row) => removeOp(cellAt(row).dataset.eid)));
    select(tb.dataset.eid); commit(op);
  }
  function addBox(kind, html) {
    endText();
    const n = make(html || ADD[kind]), k = cur().querySelectorAll('[data-ed-add]:not([data-ed-add] *)').length;
    // 잇달아 넣은 것이 서로 가리지 않게 조금씩 비켜 놓고 맨 앞에 둔다
    for (const e of [n.m, n.l]) Object.assign(e.style, { left: px(parseFloat(e.style.left) + (k % 8) * 36), top: px(parseFloat(e.style.top) + (k % 8) * 36), zIndex: String(10 + k) });
    commit(addOp(n, { parent: cur().dataset.eid, before: null }));
    select(n.m.dataset.eid);
    if (kind === 'text') startText(sel, true);
  }
  function readImage(f, then) {
    const img = new Image();
    img.onload = () => {
      // 저장소를 아끼려고 긴 변 1600px로 줄인다(투명 바탕은 webp로 지킨다)
      const k = Math.min(1, 1600 / Math.max(img.width, img.height)), cv = h('canvas', { width: Math.round(img.width * k), height: Math.round(img.height * k) });
      cv.getContext('2d').drawImage(img, 0, 0, cv.width, cv.height);
      URL.revokeObjectURL(img.src);
      then(cv.toDataURL('image/webp', 0.85), cv.width, cv.height);
    };
    img.onerror = () => tell('그림을 읽지 못했습니다');
    img.src = URL.createObjectURL(f);
  }
  const addImage = (f) => readImage(f, (url, cw, ch) => {
    const w = Math.min(800, cw), hh = Math.round(w * ch / cw);
    addBox('img', `<img data-ed-add="img" alt="" src="${url}" style="position:absolute;left:${960 - w / 2}px;top:${540 - hh / 2}px;width:${w}px;height:${hh}px;z-index:4">`);
  });
  const picIn = (list) => [...(list || [])].find((x) => x.type.startsWith('image/'));

  // 글 고치기: 화면 쪽 글을 원본 글로 되돌린 뒤(장 모듈이 글자를 쪼개 둔 흔적 지우기) 그 자리에서 고친다
  function startText(id, all) {
    const el = L(id); if (!isText(el)) return;
    sel = id; paintBar();
    el.innerHTML = resolve(M(id).innerHTML);
    el.contentEditable = 'true'; el.focus(); document.execCommand('styleWithCSS', false, true);
    const r = document.createRange(); r.selectNodeContents(el); if (!all) r.collapse(false);
    const s = getSelection(); s.removeAllRanges(); s.addRange(r);
    editing = id; tell('글 고치는 중 · 바깥을 누르거나 Esc로 끝내기 · Shift+Enter 줄 바꿈');
  }
  function endText() {
    if (!editing) return;
    const id = editing, el = L(id), m = M(id); editing = null;
    el.removeAttribute('contenteditable'); getSelection().removeAllRanges();
    const t = document.createElement('template'); t.innerHTML = el.innerHTML;
    for (const e of t.content.querySelectorAll('script, style, iframe, object')) e.remove();
    for (const e of t.content.querySelectorAll('*')) for (const a of [...e.attributes]) if (/^on|^contenteditable$/i.test(a.name) || (a.name === 'href' && /^\s*(?!https?:)[a-z][a-z0-9+.-]*:/i.test(a.value))) e.removeAttribute(a.name);
    const afterHtml = unresolve(t.innerHTML);
    if (afterHtml !== m.innerHTML) commit(htmlOp(id, afterHtml));
  }

  // 옮기기·크기 바꾸기. 맞춤선: 다른 요소와 장의 가장자리·가운데에 6px 안으로 들어오면 붙는다(Alt를 누르면 붙지 않는다)
  function startDrag(e, dir) {
    if (e.button) return;
    e.preventDefault(); e.stopPropagation(); endText();
    const el = L(sel), u = unit(el), p = pos(el), img = el.matches('img'), a = angle(el), r = el.getBoundingClientRect();
    const picked = dir ? [sel] : ids(), items = picked.map((id) => ({ id, el: L(id), p: pos(L(id)), props: null }));
    if (a && dir) Object.assign(u, size(el));   // 돌린 것의 크기는 돌리기 전 가로·세로로 잰다
    const lines = { x: [0, 960, 1920], y: [0, 540, 1080] };
    for (const o of cur().querySelectorAll(BLOCK)) {
      if (items.some((it) => it.el === o || it.el.contains(o) || o.contains(it.el)) || o.closest(LOCK) || !o.offsetParent) continue;
      const r = unit(o); lines.x.push(r.x, r.x + r.w / 2, r.x + r.w); lines.y.push(r.y, r.y + r.h / 2, r.y + r.h);
    }
    drag = { dir, el, u, p, img, lines, a, items, cx: r.left + r.width / 2, cy: r.top + r.height / 2, x: e.clientX, y: e.clientY, k: scale(), moved: false };
  }
  function snap(vals, pool) {   // vals: 붙을 수 있는 내 선들 → [보정값, 붙은 선]
    let best = [0, null, 7];
    for (const v of vals) for (const l of pool) { const d = Math.abs(l - v); if (d < best[2]) best = [l - v, l, d]; }
    return best;
  }
  function moveDrag(e) {
    const d = drag; let dx = (e.clientX - d.x) / d.k, dy = (e.clientY - d.y) / d.k;
    if (!d.moved && Math.hypot(dx, dy) * d.k < 4) return;
    d.moved = true;
    const s = cur().getBoundingClientRect(); let gx = null, gy = null;
    const props = d.p.st ? { ...LIFT } : {};
    if (d.dir === 'rot') {   // 가운데에서 본 손잡이 방향이 각도. 15°마다 붙는다(Alt를 누르면 1°씩)
      let deg = Math.round(Math.atan2(e.clientX - d.cx, d.cy - e.clientY) * 180 / Math.PI);
      if (!e.altKey) deg = Math.round(deg / 15) * 15;
      d.el.style.rotate = deg ? deg + 'deg' : ''; d.items[0].props = { rotate: deg ? deg + 'deg' : '' };
      return tell(deg + '°');
    }
    if (!d.dir) {
      if (!e.altKey) {
        const [ax, lx] = snap([d.u.x + dx, d.u.x + d.u.w / 2 + dx, d.u.x + d.u.w + dx], d.lines.x), [ay, ly] = snap([d.u.y + dy, d.u.y + d.u.h / 2 + dy, d.u.y + d.u.h + dy], d.lines.y);
        dx += ax; dy += ay; gx = lx; gy = ly;
      }
      for (const it of d.items) { it.props = { ...(it.p.st ? LIFT : {}), left: px(it.p.left + dx), top: px(it.p.top + dy) }; for (const k in it.props) it.el.style.setProperty(k, it.props[k]); }
    } else {
      const W = d.dir.includes('w'), E = d.dir.includes('e'), N = d.dir.includes('n'), S = d.dir.includes('s');
      const t = d.a * Math.PI / 180, cos = Math.cos(t), sin = Math.sin(t);
      if (d.a) [dx, dy] = [dx * cos + dy * sin, -dx * sin + dy * cos];   // 끈 거리를 요소의 가로·세로 방향으로 바꾼다
      if (!e.altKey && !d.a) {
        if (E || W) { const [a, l] = snap([W ? d.u.x + dx : d.u.x + d.u.w + dx], d.lines.x); dx += a; gx = l; }
        if ((N || S) && !(d.img && (E || W))) { const [a, l] = snap([N ? d.u.y + dy : d.u.y + d.u.h + dy], d.lines.y); dy += a; gy = l; }
      }
      let w = Math.max(24, d.u.w + (E ? dx : W ? -dx : 0)), hh = Math.max(4, d.u.h + (S ? dy : N ? -dy : 0));
      if (d.img && (E || W)) hh = w * d.u.h / d.u.w;   // 그림은 비율을 지킨다
      Object.assign(props, { 'box-sizing': 'border-box', width: px(w), 'max-width': 'none' });
      if (getComputedStyle(d.el.parentElement).display.includes('flex')) props.flex = 'none';
      if (N || S || d.img) props.height = px(hh);
      if (W) props.left = px(d.p.left + d.u.w - w);
      if (N || (d.img && d.dir.includes('n'))) props.top = px(d.p.top + d.u.h - hh);
      if (d.a) {   // 가운데를 축으로 돌기 때문에, 맞은편 점이 제자리에 있도록 위치를 고쳐 준다
        const ox = (W ? 1 : E ? -1 : 0) * (d.u.w - w) / 2, oy = (N ? 1 : S ? -1 : 0) * (d.u.h - hh) / 2;
        Object.assign(props, { left: px(d.p.left - (w - d.u.w) / 2 + ox * cos - oy * sin), top: px(d.p.top - (hh - d.u.h) / 2 + ox * sin + oy * cos) });
      }
      for (const k in props) d.el.style.setProperty(k, props[k]);
      d.items[0].props = props;
    }
    const g = (el, v, vert) => { if (v == null) return (el.style.display = 'none'); Object.assign(el.style, vert ? { display: 'block', left: s.left + v * d.k + 'px', top: s.top + 'px', width: '1px', height: s.height + 'px' } : { display: 'block', top: s.top + v * d.k + 'px', left: s.left + 'px', height: '1px', width: s.width + 'px' }); };
    g(guides[0], gx, true); g(guides[1], gy, false);
  }
  function endDrag() {
    const d = drag; drag = null; guides.forEach((g) => { g.style.display = 'none'; });
    if (d && d.moved && d.items.some((it) => it.props)) commit(multi(d.items.filter((it) => it.props).map((it) => styleOp(it.id, it.props))));
  }

  // ---------- 입력 받기 ----------
  const ours = (t) => t.closest && t.closest('.ed-ui');
  window.addEventListener('pointerdown', (e) => {
    if (!(e.target.closest && e.target.closest('.ed-pop'))) shut();
    if (ours(e.target)) return;
    if (editing) { if (L(editing).contains(e.target)) return; endText(); }
    const hit = pick(e.target);
    if (hit.lock) { select(null); return tell('움직이는 부분은 고칠 수 없습니다 · 그대로 눌러 볼 수 있어요'); }
    if (!hit.id) {   // 빈 곳을 끌면 범위로 고른다
      select(null);
      if (!e.button && e.target.closest && e.target.closest('.reveal')) lasso = { x: e.clientX, y: e.clientY };
      return;
    }
    if (e.shiftKey) return choose(hit.id, true);
    if (!ids().includes(hit.id)) choose(hit.id, false);
    else if (hit.id !== sel) choose2([hit.id, ...ids().filter((x) => x !== hit.id)]);   // 누른 것을 기준으로
    startDrag(e, '');
  }, true);
  window.addEventListener('pointermove', (e) => {
    if (drag) return moveDrag(e);
    if (lasso) { const x = Math.min(lasso.x, e.clientX), y = Math.min(lasso.y, e.clientY); lasso.r = { x, y, w: Math.abs(e.clientX - lasso.x), h: Math.abs(e.clientY - lasso.y) }; return Object.assign(band.style, { display: 'block', left: x + 'px', top: y + 'px', width: lasso.r.w + 'px', height: lasso.r.h + 'px' }); }
    const hit = ours(e.target) || editing ? {} : pick(e.target);
    hover = hit.id || null;
  }, true);
  function endLasso() {   // 범위 안에 온전히 든 것만, 상자와 그 속이 함께 들면 상자만
    const q = lasso.r; lasso = null; band.style.display = 'none';
    if (!q || q.w < 6 || q.h < 6) return;
    const inside = [...cur().querySelectorAll(BLOCK)].filter((o) => { const r = o.getBoundingClientRect(); return o.dataset.eid && !o.closest(LOCK) && r.width && r.left >= q.x && r.top >= q.y && r.right <= q.x + q.w && r.bottom <= q.y + q.h; });
    choose2(inside.filter((o) => !inside.some((x) => x !== o && x.contains(o))).map((o) => o.dataset.eid));
  }
  for (const ev of ['pointerup', 'pointercancel']) window.addEventListener(ev, () => { if (drag) endDrag(); if (lasso) endLasso(); }, true);
  // 고를 수 있는 것을 누를 때는 장 모듈(카드 뒤집기 등)과 장 넘기기가 반응하지 않게 막는다
  for (const ev of ['click', 'mousedown', 'mouseup', 'touchstart', 'touchend', 'dblclick']) window.addEventListener(ev, (e) => {
    if (ours(e.target) || (editing && L(editing).contains(e.target))) return;
    const hit = pick(e.target);
    if (!hit.id) return;
    e.stopPropagation(); if (e.cancelable && ev !== 'touchstart' && ev !== 'touchend') e.preventDefault();
    if (ev === 'dblclick' && isText(L(hit.id))) startText(hit.id);
  }, true);
  window.addEventListener('dragover', (e) => e.preventDefault());
  // Reveal이 data-state="drop" 장에서 같은 이름의 이벤트를 window에 보낸다(dataTransfer 없음)
  window.addEventListener('drop', (e) => { if (!e.dataTransfer) return; e.preventDefault(); const f = picIn(e.dataTransfer.files); if (f) addImage(f); });
  window.addEventListener('paste', (e) => {   // 복사한 그림은 그림으로 넣고, 글 고칠 때 붙여 넣기는 꾸밈 없는 글만
    const f = picIn(e.clipboardData && e.clipboardData.files);
    if (f) { e.preventDefault(); return addImage(f); }
    if (!editing) return;
    e.preventDefault(); document.execCommand('insertText', false, (e.clipboardData || window.clipboardData).getData('text/plain'));
  }, true);
  window.addEventListener('keydown', (e) => {
    if (ours(e.target) && e.target.matches('input, textarea')) return;
    const mod = e.ctrlKey || e.metaKey, k = e.key.toLowerCase(), done = () => { e.preventDefault(); e.stopPropagation(); };
    if (editing) {
      e.stopPropagation();   // 글자 키로 장이 넘어가지 않게
      if (e.key === 'Escape') { e.preventDefault(); endText(); }
      else if (e.key === 'Enter') { e.preventDefault(); if (e.shiftKey) document.execCommand('insertLineBreak'); else endText(); }
      return;
    }
    if (mod && k === 'z') { done(); return travel(e.shiftKey); }
    if (mod && k === 'y') { done(); return travel(true); }
    if (mod && k === 'v' && clip) { done(); return paste(); }
    if (!sel) return;
    if (e.key === 'Delete' || e.key === 'Backspace') { done(); remove(); }
    else if (e.key === 'Escape') { done(); select(null); }
    else if (e.key === 'Enter' && isText(L(sel))) { done(); startText(sel); }
    else if (mod && k === 'd') { done(); duplicate(); }
    else if (mod && k === 'c') { done(); clip = { from: ids(), html: copyOf(sel).outerHTML, w: unit(L(sel)).w }; tell('복사했습니다 · Ctrl+V로 붙여 넣기'); }
    else if (e.key.startsWith('Arrow')) {
      done(); const s = e.shiftKey ? 10 : 1, v = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, -s], ArrowDown: [0, s] }[e.key];
      commit(multi(ids().map((id) => { const q = pos(L(id)); return styleOp(id, { ...(q.st ? LIFT : {}), left: px(q.left + v[0]), top: px(q.top + v[1]) }); })));
    }
  }, true);

  function start() {
    Reveal.layout();
    Reveal.on('slidechanged', () => { select(null); hover = null; marks(); showMemo(); aiShow(); });
    undoB.disabled = redoB.disabled = true;
    marks(); select(null); showMemo(); tick();
    if (sessionStorage.getItem('ed-ai-open') || new URLSearchParams(location.search).has('ai')) aiOpen(true);
    if (sessionStorage.getItem('ed-ai-msg')) { aiSay(sessionStorage.getItem('ed-ai-msg')); sessionStorage.removeItem('ed-ai-msg'); }
    window.__ed = { M, L, hist, pick, ids, choose2 };   // 시험에서 들여다보는 창
  }
  const wait = setInterval(() => { if (window.Reveal && Reveal.isReady()) { clearInterval(wait); start(); } }, 100);
})();
