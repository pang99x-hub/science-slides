// 반 수업방 쪽: join.html(학생 고정 링크)과 teach.html(선생님 페이지). make-index.mjs가 부른다.
//   학생: 클래스룸에 한 번 올려 둔 join.html?room=123456 → 선생님이 연 차시 학생용으로 저절로 옮겨 간다
//   선생님: teach.html에서 반 방을 만들고(진행 열쇠는 이 브라우저에 저장), 차시를 누르면 그 반 방에 붙은 교사용이 열린다
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const head = (title) => `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="robots" content="noindex">
<title>${esc(title)}</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hahmlet:wght@700;800&family=IBM+Plex+Sans+KR:wght@400;500;600;700&display=swap">
<style>
:root { color-scheme: light; --paper: #f2f5f3; --paper-2: #fbfcf9; --grid: #dbe4e2; --ink: #1d2433; --ink-2: #4b566a; --ink-3: #6b7587; --rule: #c3cecd; --accent: #1f5f4a; --accent-soft: #dcebe4; --hl: #ffe27a; --stamp: #c8402f; --current: #e9731a;
  --f-display: "Hahmlet", "Apple SD Gothic Neo", "Malgun Gothic", serif; --f-body: "IBM Plex Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif; }
* { box-sizing: border-box; }
body { margin: 0; color: var(--ink); font: 400 17px/1.6 var(--f-body); word-break: keep-all; overflow-wrap: break-word; background-color: var(--paper);
  background-image: linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px); background-size: 32px 32px; }
.wrap { max-width: 880px; margin: 0 auto; padding-block: 36px 48px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); display: grid; gap: 20px; }
.brand { margin: 0; font-size: 13px; font-weight: 700; letter-spacing: .18em; color: var(--accent); }
.brand a { color: inherit; text-decoration: none; }
h1 { margin: 0; font: 800 clamp(30px, 6vw, 46px)/1.1 var(--f-display); }
h2 { margin: 0; font: 700 22px/1.3 var(--f-display); }
.card { background: var(--paper-2); border: 2px solid var(--ink); border-radius: 10px; padding: 18px 20px; display: grid; gap: 12px; min-width: 0; }
.card.big { box-shadow: 6px 6px 0 var(--ink); }
.muted { color: var(--ink-2); margin: 0; }
.small { font-size: 14px; color: var(--ink-3); margin: 0; }
.btn { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 16px; border: 2px solid var(--ink); border-radius: 999px; background: var(--paper-2); color: var(--ink); font: 700 16px/1 var(--f-body); text-decoration: none; cursor: pointer; }
.btn.main { background: var(--ink); color: var(--paper-2); }
.btn.warn { border-color: var(--stamp); color: var(--stamp); }
.btn:hover { background: var(--accent); border-color: var(--accent); color: var(--paper-2); }
.btn:focus-visible, input:focus-visible { outline: 4px solid var(--hl); outline-offset: 2px; }
.row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.link { font: 500 14px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; background: var(--paper); border: 1.5px dashed var(--rule); border-radius: 8px; padding: 8px 10px; overflow-wrap: anywhere; user-select: all; }
input[type=text] { font: 600 18px/1.3 var(--f-body); padding: 10px 12px; border: 2px solid var(--ink); border-radius: 8px; background: var(--paper); color: var(--ink); min-width: 0; flex: 1 1 220px; }
ul.lessons { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
ul.lessons li { display: flex; flex-wrap: wrap; gap: 6px 12px; align-items: center; justify-content: space-between; border-top: 1px dashed var(--rule); padding-top: 8px; }
.code { font: 800 34px/1 var(--f-display); letter-spacing: .06em; }
.dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: var(--current); margin-right: 8px; animation: pulse 1.4s ease-in-out infinite; }
@keyframes pulse { 50% { opacity: .25; } }
@media (prefers-reduced-motion: reduce) { .dot { animation: none; } }
.note { border-left: 4px solid var(--stamp); padding-left: 10px; }
</style>
</head>`;

const lessonList = (units) => units.flatMap((u) => u.lessons.map((l) => ({ ...l, unit: u.unit, unitTitle: u.unitTitle, subject: u.subject, path: l.student.replace(/\/student\.html$/, '') })));

export function joinPage(site, units) {
  const lessons = lessonList(units);
  return `${head('수업방 들어가기 · ' + site.name)}
<body>
<div class="wrap">
  <p class="brand"><a href="index.html">${esc(site.name)}</a></p>
  <h1 id="title">수업방</h1>
  <div class="card big" id="app" aria-live="polite"><p class="muted">확인하는 중…</p></div>
  <div class="card">
    <h2>혼자 복습하기</h2>
    <ul class="lessons">${lessons.map((l) => `<li><span>${esc(l.unit)} ${l.n}차시 ${esc(l.title)}</span><a class="btn" href="${esc(l.student)}">열기</a></li>`).join('')}</ul>
  </div>
</div>
<script>
(function () {
  'use strict';
  var qs = new URLSearchParams(location.search);
  var API = (qs.get('roomapi') || ${JSON.stringify(site.roomApi || '')}).replace(/\\/$/, '');
  var pass = qs.get('roomapi') ? '&roomapi=' + encodeURIComponent(qs.get('roomapi')) : '';
  var code = qs.get('room') || '';
  var app = document.getElementById('app');
  var cid; try { cid = localStorage.getItem('science-room:cid'); if (!cid) { cid = 's-' + Array.from(crypto.getRandomValues(new Uint8Array(12)), function (b) { return b.toString(16).padStart(2, '0'); }).join(''); localStorage.setItem('science-room:cid', cid); } } catch (e) { cid = 's-' + Math.random().toString(36).slice(2); }
  var gone = false;
  function show(html) { app.innerHTML = html; }
  function go(path) { if (gone) return; gone = true; location.replace(path + '/student.html?room=' + code + pass); }
  if (!/^(\\d{4}|\\d{6})$/.test(code) || !API) { show('<h2>링크가 올바르지 않아요</h2><p class="muted">선생님께 반 링크를 다시 받아 주세요. 아래에서 혼자 복습할 수는 있어요.</p>'); return; }
  function wait(info) {
    document.getElementById('title').textContent = (info.name || '수업방') + ' 수업방';
    show('<h2><span class="dot" aria-hidden="true"></span>선생님을 기다리는 중</h2><p class="muted">선생님이 수업을 시작하면 이 화면이 저절로 그 차시로 넘어가요. 화면을 켜 둔 채 기다려 주세요.</p><p class="small">이름은 보내지 않아요.</p>');
  }
  var ws = null, tries = 0;
  function listen() {
    try { ws = new WebSocket(API.replace(/^http/, 'ws') + '/rooms/' + code + '/ws?role=student&cid=' + cid); } catch (e) { return; }
    ws.onmessage = function (e) { var m; try { m = JSON.parse(e.data); } catch (x) { return; } if ((m.t === 'state' && m.lesson) || m.t === 'lesson') go((m.lesson || m).path); };
    ws.onclose = function () { if (!gone) setTimeout(function () { check(); }, Math.min(10000, 1000 * Math.pow(2, tries++))); };
  }
  function check() {
    fetch(API + '/rooms/' + code).then(function (r) { return r.json(); }).then(function (info) {
      if (!info.open) { show('<h2>이 반 수업방은 닫혔어요</h2><p class="muted">선생님께 새 링크를 받아 주세요. 아래에서 혼자 복습할 수는 있어요.</p>'); return; }
      if (info.lesson) { go(info.lesson.path); return; }
      wait(info); if (!ws || ws.readyState > 1) listen();
    }).catch(function () { show('<h2>연결하지 못했어요</h2><p class="muted">인터넷 연결을 확인하고 다시 열어 주세요.</p>'); setTimeout(check, 5000); });
  }
  check();
})();
</script>
</body>
</html>
`;
}

export function teachPage(site, units) {
  const lessons = lessonList(units);
  return `${head('선생님 페이지 · ' + site.name)}
<body>
<div class="wrap">
  <p class="brand"><a href="index.html">${esc(site.name)}</a></p>
  <h1>선생님 페이지</h1>
  <p class="muted">반마다 수업방을 한 번 만들어 두고, <b>학생 링크</b>를 그 반 클래스룸에 한 번만 올려 두세요. 수업 때는 이 페이지에서 반과 차시를 누르면 그 반 학생 화면이 따라와요. 이 페이지를 즐겨찾기에 넣어 두세요.</p>
  <div id="classes" style="display:grid;gap:16px"></div>
  <div class="card">
    <h2>반 수업방 만들기</h2>
    <form class="row" id="make"><input type="text" id="name" maxlength="30" placeholder="예: 2학년 3반" aria-label="반 이름" autocomplete="off"><button class="btn main" type="submit">만들기</button></form>
    <p class="small" id="msg" aria-live="polite"></p>
  </div>
  <div class="card">
    <h2>다른 기기에서 쓰기</h2>
    <p class="muted">반마다 «다른 기기용 링크»를 복사해 집 컴퓨터나 휴대폰에서 한 번 열면, 그 기기에서도 같은 반으로 수업할 수 있어요.</p>
    <p class="small note">다른 기기용 링크에는 진행 열쇠가 들어 있어요. 학생에게 보내지 마세요. 학생에게는 <b>학생 링크</b>만 주세요.</p>
  </div>
</div>
<script>
(function () {
  'use strict';
  var qs = new URLSearchParams(location.search);
  var API = (qs.get('roomapi') || ${JSON.stringify(site.roomApi || '')}).replace(/\\/$/, '');
  var pass = qs.get('roomapi') ? '&roomapi=' + encodeURIComponent(qs.get('roomapi')) : '';
  var BASE = location.href.split(/[?#]/)[0].replace(/[^/]*$/, '');
  var LESSONS = ${JSON.stringify(lessons.map((l) => ({ label: `${l.unit} ${l.n}차시 ${l.title}`, teacher: l.teacher })))};
  var KEY = 'science-room:classes';
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { msg('이 브라우저에 저장하지 못했어요(사생활 보호 창이면 일반 창에서 열어 주세요).'); } }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function msg(t) { document.getElementById('msg').textContent = t; }
  // 다른 기기용 링크(#add=...)로 열었으면 이 브라우저에 반을 더한다
  var m = location.hash.match(/^#add=(.+)$/);
  if (m) {
    try { var c = JSON.parse(decodeURIComponent(m[1])); if (/^\\d{6}$/.test(c.code) && c.key) { var l = load().filter(function (x) { return x.code !== c.code; }); l.push(c); save(l); } } catch (e) {}
    history.replaceState(null, '', location.pathname + location.search);
  }
  function copy(text, btn) {
    var done = function () { var t = btn.textContent; btn.textContent = '복사했어요'; setTimeout(function () { btn.textContent = t; }, 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () { prompt('복사해서 쓰세요', text); });
    else prompt('복사해서 쓰세요', text);
  }
  function render() {
    var list = load(), box = document.getElementById('classes');
    if (!list.length) { box.innerHTML = '<div class="card"><p class="muted">아직 만든 반 수업방이 없어요. 아래에서 반 이름을 넣고 만들어 주세요.</p></div>'; return; }
    box.innerHTML = list.map(function (c, i) {
      var join = BASE + 'join.html?room=' + c.code;
      return '<div class="card big" data-i="' + i + '">'
        + '<div class="row" style="justify-content:space-between"><h2>' + esc(c.name || '반 수업방') + '</h2><span class="code" title="참여 코드">' + c.code + '</span></div>'
        + '<p class="small">학생 링크(클래스룸에 한 번 올려 두기)</p><div class="link">' + esc(join) + '</div>'
        + '<div class="row"><button class="btn" data-a="copy">학생 링크 복사</button><button class="btn" data-a="move">다른 기기용 링크 복사</button><button class="btn warn" data-a="del">이 기기에서 지우기</button></div>'
        + '<p class="small">수업 시작 — 차시를 누르면 이 반 수업방에 붙은 교사용이 열려요</p>'
        + '<ul class="lessons">' + LESSONS.map(function (l) { return '<li><span>' + esc(l.label) + '</span><a class="btn main" href="' + esc(l.teacher) + '?room=' + c.code + pass + '">시작</a></li>'; }).join('') + '</ul>'
        + '</div>';
    }).join('');
    box.querySelectorAll('[data-i]').forEach(function (card) {
      var c = load()[+card.dataset.i];
      card.querySelector('[data-a="copy"]').onclick = function (e) { copy(BASE + 'join.html?room=' + c.code, e.currentTarget); };
      card.querySelector('[data-a="move"]').onclick = function (e) { copy(BASE + 'teach.html#add=' + encodeURIComponent(JSON.stringify(c)), e.currentTarget); };
      card.querySelector('[data-a="del"]').onclick = function (e) {
        var b = e.currentTarget;
        if (!b.dataset.armed) { b.dataset.armed = '1'; b.textContent = '한 번 더 누르면 지워져요'; setTimeout(function () { if (b.isConnected) { delete b.dataset.armed; b.textContent = '이 기기에서 지우기'; } }, 3000); return; }
        save(load().filter(function (x) { return x.code !== c.code; })); render();
      };
    });
  }
  document.getElementById('make').onsubmit = function (e) {
    e.preventDefault();
    var name = document.getElementById('name').value.trim();
    if (!name) { msg('반 이름을 넣어 주세요.'); return; }
    if (!API) { msg('수업방 주소가 없어요.'); return; }
    msg('만드는 중…');
    fetch(API + '/rooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ persist: true, name: name }) })
      .then(function (r) { return r.json(); }).then(function (j) {
        if (!j.code || !j.key) throw new Error(j.error || '만들지 못했어요');
        var l = load(); l.push({ code: j.code, key: j.key, name: j.name || name }); save(l);
        document.getElementById('name').value = ''; msg(name + ' 수업방을 만들었어요. 학생 링크를 클래스룸에 올려 두세요.'); render();
      }).catch(function (err) { msg((err && err.message) || '만들지 못했어요. 인터넷 연결을 확인해 주세요.'); });
  };
  render();
})();
</script>
</body>
</html>
`;
}
