// 반 수업방 쪽: join.html(학생 고정 링크)과 teach.html(선생님 페이지). make-index.mjs가 부른다.
//   학생: 클래스룸에 한 번 올려 둔 join.html?room=123456 → 선생님이 연 차시 학생용으로 저절로 옮겨 간다. 수업이 없으면 복습
//   선생님: teach.html에서 반 방을 만들고(진행 열쇠는 이 브라우저에 저장), 같은 반 링크를 열면 선생님 화면이 된다
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
a { color: var(--accent); }
h1 { margin: 0; font: 800 clamp(30px, 6vw, 46px)/1.1 var(--f-display); text-wrap: balance; }
h2 { margin: 0; font: 700 22px/1.3 var(--f-display); text-wrap: balance; }
.card { background: var(--paper-2); border: 2px solid var(--ink); border-radius: 10px; padding: 18px 20px; display: grid; gap: 12px; min-width: 0; }
.card.big { box-shadow: 6px 6px 0 var(--ink); }
.muted { color: var(--ink-2); margin: 0; }
.small { font-size: 14px; color: var(--ink-3); margin: 0; }
.btn { display: inline-flex; align-items: center; justify-content: center; min-height: 44px; padding: 0 16px; border: 2px solid var(--ink); border-radius: 999px; background: var(--paper-2); color: var(--ink); font: 700 16px/1.2 var(--f-body); text-decoration: none; cursor: pointer; text-align: center; }
.btn.main { background: var(--ink); color: var(--paper-2); }
.btn.warn { border-color: var(--stamp); color: var(--stamp); }
.btn.warn[data-armed] { background: var(--stamp); color: var(--paper-2); }
.btn[aria-pressed="true"] { background: var(--accent); border-color: var(--accent); color: var(--paper-2); }
.btn:hover { background: var(--accent); border-color: var(--accent); color: var(--paper-2); }
.btn:focus-visible, input:focus-visible, select:focus-visible, summary:focus-visible { outline: 4px solid var(--hl); outline-offset: 2px; }
.row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.between { justify-content: space-between; }
.link { font: 500 14px/1.4 ui-monospace, SFMono-Regular, Menlo, monospace; background: var(--paper); border: 1.5px dashed var(--rule); border-radius: 8px; padding: 8px 10px; overflow-wrap: anywhere; user-select: all; }
input[type=text], select { font: 600 18px/1.3 var(--f-body); padding: 10px 12px; border: 2px solid var(--ink); border-radius: 8px; background: var(--paper); color: var(--ink); min-width: 0; }
.form { display: flex; flex-wrap: wrap; gap: 12px; align-items: flex-end; }
.form label { display: grid; gap: 4px; font: 600 14px/1.3 var(--f-body); color: var(--ink-2); min-width: 0; }
.form label.grow { flex: 1 1 220px; }
.form input, .form select { width: 100%; }
ul.lessons { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
ul.lessons li { display: flex; flex-wrap: wrap; gap: 6px 12px; align-items: center; justify-content: space-between; border-top: 1px dashed var(--rule); padding-top: 8px; }
ul.lessons li.unit { border-top: 0; padding-top: 10px; font: 700 14px/1.3 var(--f-body); letter-spacing: .04em; color: var(--accent); }
ul.lessons li.unit:first-child { padding-top: 0; }
.tag { display: inline-block; margin-left: 6px; padding: 1px 8px; border-radius: 999px; font: 700 13px/1.5 var(--f-body); background: var(--accent-soft); color: var(--accent); white-space: nowrap; }
.tag.now { background: var(--current); color: var(--paper-2); }
.tag.next { background: var(--hl); color: var(--ink); }
.code { font: 800 34px/1 var(--f-display); letter-spacing: .06em; }
.dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; background: var(--current); margin-right: 8px; animation: pulse 1.4s ease-in-out infinite; }
@keyframes pulse { 50% { opacity: .25; } }
@media (prefers-reduced-motion: reduce) { .dot { animation: none; } }
.note { border-left: 4px solid var(--stamp); padding-left: 10px; }
.status { margin: 0; padding: 8px 12px; border-radius: 8px; background: var(--paper); color: var(--ink-2); }
.status.live { background: #fde9d9; color: var(--ink); }
details { border-top: 1px dashed var(--rule); padding-top: 8px; }
details > summary { cursor: pointer; font-weight: 700; color: var(--ink-2); list-style-position: inside; }
details[open] > summary { margin-bottom: 8px; }
.sizebox { display: inline-flex; gap: 6px; align-items: center; font-size: 14px; color: var(--ink-3); }
.sizebox input { width: 64px; font-size: 16px; padding: 6px 8px; }
</style>
</head>`;

const lessonList = (units) => units.flatMap((u) => u.lessons.map((l) => ({ ...l, unit: u.unit, unitTitle: u.unitTitle, subject: u.subject, path: l.student.replace(/\/student\.html$/, '') })));
const lessonData = (lessons) => JSON.stringify(lessons.map((l) => ({ unit: l.unit, unitTitle: l.unitTitle, n: l.n, title: l.title, path: l.path, student: l.student, teacher: l.teacher })));

export function joinPage(site, units) {
  const lessons = lessonList(units);
  return `${head(site.name + ' · 반 수업방')}
<body>
<div class="wrap">
  <p class="brand"><a href="index.html">${esc(site.name)}</a></p>
  <h1 id="title">반 수업방</h1>
  <div class="card big" id="app" aria-live="polite"><p class="muted">확인하는 중…</p></div>
  <div class="card" id="lib" hidden>
    <h2 id="libTitle">차시 목록</h2>
    <ul class="lessons" id="list"></ul>
  </div>
  <p class="small" id="foot"></p>
</div>
<script>
(function () {
  'use strict';
  var qs = new URLSearchParams(location.search);
  var API = (qs.get('roomapi') || ${JSON.stringify(site.roomApi || '')}).replace(/\\/$/, '');
  var pass = qs.get('roomapi') ? '&roomapi=' + encodeURIComponent(qs.get('roomapi')) : '';
  var code = qs.get('room') || '';
  var LESSONS = ${lessonData(lessons)};
  var $ = function (id) { return document.getElementById(id); };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function find(path) { return LESSONS.filter(function (l) { return l.path === path; })[0] || null; }
  function label(l) { return l.unit + ' ' + l.n + '차시 ' + l.title; }
  function nextOf(path) { for (var i = 0; i < LESSONS.length - 1; i++) if (LESSONS[i].path === path) return LESSONS[i + 1].path; return null; }
  var cid; try { cid = localStorage.getItem('science-room:cid'); if (!cid) { cid = 's-' + Array.from(crypto.getRandomValues(new Uint8Array(12)), function (b) { return b.toString(16).padStart(2, '0'); }).join(''); localStorage.setItem('science-room:cid', cid); } } catch (e) { cid = 's-' + Math.random().toString(36).slice(2); }
  // 이 기기에 이 반의 진행 열쇠가 있으면 선생님 화면(같은 링크). ?as=student 이면 학생 화면 미리 보기(연결·학생 수에 안 들어감)
  var mine = null; try { mine = (JSON.parse(localStorage.getItem('science-room:classes')) || []).filter(function (c) { return c.code === code; })[0] || null; } catch (e) {}
  var preview = !!mine && qs.get('as') === 'student';
  var teacher = !!mine && !preview;
  var ME = 'science-room:me:' + code;
  function getMe() { try { return JSON.parse(localStorage.getItem(ME)); } catch (e) { return null; } }
  function idQuery() { var m = getMe(); return m ? '&num=' + m.num + (m.name ? '&name=' + encodeURIComponent(m.name) : '') : ''; }
  // 번호를 받는 반이면 처음 한 번 번호(와 이름)를 묻는다
  function askId(info, next) {
    var withName = info.idMode === 'numname';
    show('<h2>' + esc(info.name || '반') + ' 수업방</h2><p class="muted">선생님이 ' + (withName ? '번호와 이름' : '번호') + '을 받기로 했어요. 처음 한 번만 넣으면 돼요.</p>'
      + '<form class="row" id="idf"><input type="text" inputmode="numeric" id="num" placeholder="번호" aria-label="번호" style="flex:0 1 110px">' + (withName ? '<input type="text" id="nm" maxlength="12" placeholder="이름" aria-label="이름" autocomplete="off" style="flex:1 1 160px">' : '') + '<button class="btn main" type="submit">들어가기</button></form><p class="small" id="idm" aria-live="polite"></p>');
    $('num').focus();
    $('idf').onsubmit = function (e) {
      e.preventDefault();
      var num = parseInt($('num').value, 10), name = withName ? $('nm').value.replace(/\\s+/g, ' ').trim() : '';
      if (!(num >= 1 && num <= 99)) { $('idm').textContent = '번호를 1~99 사이로 넣어 주세요.'; return; }
      if (withName && !/^[\\p{L} ]{1,12}$/u.test(name)) { $('idm').textContent = '이름을 글자로 12자 안에서 넣어 주세요.'; return; }
      try { localStorage.setItem(ME, JSON.stringify({ num: num, name: name })); } catch (x) {}
      next();
    };
  }
  var gone = false;
  function show(html) { $('app').innerHTML = html; }
  function go(path) { if (gone) return; gone = true; location.replace(path + '/student.html?room=' + code + pass); }
  function copy(text, btn) {
    var done = function () { var t = btn.textContent; btn.textContent = '복사했어요'; setTimeout(function () { btn.textContent = t; }, 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () { prompt('복사해서 쓰세요', text); }); else prompt('복사해서 쓰세요', text);
  }
  if (!/^(\\d{4}|\\d{6})$/.test(code) || !API) {
    show('<h2>링크가 올바르지 않아요</h2><p class="muted">선생님께 반 링크를 다시 받아 주세요.</p>');
    library(false); return;
  }
  // 단원별 차시 목록. mark: { now, next, last } 차시 경로
  function library(withRoom, mark) {
    mark = mark || {};
    $('lib').hidden = false;
    $('libTitle').textContent = teacher ? '차시 고르기 — 누르면 이 반 수업이 그 차시로 시작돼요' : withRoom ? '복습 — 아무 차시나 열어 볼 수 있어요' : '차시 목록 — 혼자 볼 수 있어요';
    var html = '', unit = '';
    LESSONS.forEach(function (l) {
      if (l.unit !== unit) { unit = l.unit; html += '<li class="unit">' + esc(l.unit + ' ' + l.unitTitle) + '</li>'; }
      var href = teacher ? l.teacher + '?room=' + code + pass : l.student + (withRoom ? '?room=' + code + pass : '');
      var tag = mark.now === l.path ? '<b class="tag now">지금 수업 중</b>' : mark.next === l.path ? '<b class="tag next">다음 차시</b>' : mark.last === l.path ? '<b class="tag">지난 수업</b>' : '';
      var main = mark.now === l.path || (teacher ? mark.next === l.path : mark.last === l.path);
      html += '<li><span>' + esc(l.n + '차시 ' + l.title) + tag + '</span><a class="btn' + (main ? ' main' : '') + '" href="' + esc(href) + '">' + (teacher ? (mark.now === l.path ? '이어서 하기' : '수업 시작') : '열기') + '</a></li>';
    });
    $('list').innerHTML = html;
  }
  // ---- 선생님 화면: 지금 수업 / 지난 수업 · 다음 차시, 들어온 학생 수(10초마다) ----
  var sig = null, pollT = 0;
  function teacherView(info) {
    var s = JSON.stringify([info.lesson, info.last]);
    if (s !== sig) {
      sig = s;
      var now = info.lesson ? find(info.lesson.path) : null;
      var lastL = info.last ? find(info.last.path) : null;
      var nextL = now ? null : lastL ? find(nextOf(lastL.path)) : LESSONS[0];
      var tHref = function (l) { return esc(l.teacher + '?room=' + code + pass); };
      var h = now
        ? '<h2><span class="dot" aria-hidden="true"></span>지금 수업 중: ' + esc(label(now)) + '</h2><p class="muted">학생 화면이 이 차시를 따라가고 있어요. 마칠 때 «수업 끝내기»를 누르면 학생은 복습으로 바뀌어요. 잊어도 선생님 화면을 닫고 15분 뒤에 저절로 끝나요.</p>'
        : '<h2>수업 전이에요</h2><p class="muted">' + (lastL ? '지난 수업은 <b>' + esc(label(lastL)) + '</b>이에요. ' : '') + '차시를 고르면 수업이 시작되고, 들어와 있는 학생 화면이 그 차시로 옮겨 가요.</p>';
      h += '<p class="muted">지금 들어와 있는 학생: <b id="cnt">0</b>명</p><div class="row">'
        + (now ? '<a class="btn main" href="' + tHref(now) + '">이어서 하기</a><button class="btn warn" type="button" id="end">수업 끝내기</button>'
          : nextL ? '<a class="btn main" href="' + tHref(nextL) + '">' + (lastL ? '다음 차시 시작' : '첫 차시 시작') + ' · ' + esc(nextL.n + '차시 ' + nextL.title) + '</a>' : '')
        + '<button class="btn" type="button" id="copy">반 링크 복사</button><a class="btn" href="?room=' + code + '&as=student' + pass + '">학생 화면 미리 보기</a><a class="btn" href="teach.html' + (pass ? '?' + pass.slice(1) : '') + '">선생님 페이지</a></div>';
      show(h);
      $('copy').onclick = function (e) { copy(location.href.split('?')[0] + '?room=' + code, e.currentTarget); };
      var end = $('end');
      if (end) end.onclick = function () {
        if (!end.dataset.armed) { end.dataset.armed = '1'; end.textContent = '한 번 더 누르면 수업이 끝나요'; setTimeout(function () { if (end.isConnected) { delete end.dataset.armed; end.textContent = '수업 끝내기'; } }, 3000); return; }
        end.disabled = true;
        fetch(API + '/rooms/' + code + '/end', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: mine.key }) })
          .then(function (r) { return r.json(); }).then(function () { check(); }).catch(function () { end.disabled = false; end.textContent = '끝내지 못했어요 · 다시 누르기'; delete end.dataset.armed; });
      };
      library(true, { now: now && now.path, next: nextL && nextL.path, last: lastL && lastL.path });
    }
    $('cnt').textContent = info.students || 0;
    clearTimeout(pollT);
    pollT = setTimeout(function tick() { if (document.hidden) { pollT = setTimeout(tick, 10000); return; } check(); }, 10000);   // 화면을 보고 있을 때만
  }
  // ---- 학생 화면 미리 보기 ----
  function previewView(info) {
    var now = info.lesson ? find(info.lesson.path) : null, lastL = info.last ? find(info.last.path) : null;
    show('<h2>학생 화면 미리 보기</h2><p class="muted">' + (now ? '지금은 수업 중이라, 학생이 반 링크를 열면 이 화면 없이 바로 <b>' + esc(label(now)) + '</b>로 넘어가요.' : '수업이 없을 때 학생은 이 링크에서 아래 차시를 골라 복습해요. 선생님이 수업을 시작하면 어느 화면에 있든 저절로 수업 차시로 넘어가요.') + '</p>'
      + '<p class="small">미리 보기는 수업방에 붙지 않아 학생 수에 들어가지 않아요. 차시를 열면 혼자 보기로 열려요.</p><div class="row"><a class="btn main" href="?room=' + code + pass + '">선생님 화면으로 돌아가기</a></div>');
    library(false, { now: now && now.path, last: lastL && lastL.path });
  }
  var ws = null, tries = 0;
  function listen() {
    if (teacher || preview) return;                      // 선생님 화면·미리 보기는 듣지 않는다(학생 수로 세지 않게)
    try { ws = new WebSocket(API.replace(/^http/, 'ws') + '/rooms/' + code + '/ws?role=student&cid=' + cid + idQuery()); } catch (e) { return; }
    ws.onopen = function () { tries = 0; ws.send(JSON.stringify({ t: 'where', path: 'library', h: 0 })); };
    ws.onmessage = function (e) {
      var m; try { m = JSON.parse(e.data); } catch (x) { return; }
      if ((m.t === 'state' && m.lesson) || m.t === 'lesson') go((m.lesson || m).path);
      if (m.t === 'summon' && m.path) go(m.path);
    };
    ws.onclose = function () { if (!gone) setTimeout(check, Math.min(10000, 1000 * Math.pow(2, tries++))); };
  }
  function check() {
    fetch(API + '/rooms/' + code).then(function (r) { return r.json(); }).then(function (info) {
      if (!info.open) { show('<h2>이 반 수업방은 닫혔어요</h2><p class="muted">' + (teacher ? '선생님 페이지에서 새로 만들어 주세요.' : '선생님께 새 링크를 받아 주세요. 아래 차시는 혼자 볼 수 있어요.') + '</p>'); library(false); return; }
      $('title').textContent = (info.name || '반') + ' 수업방' + (teacher ? ' · 선생님' : '');
      if (teacher) { teacherView(info); return; }
      if (preview) { previewView(info); return; }
      if (info.idMode && info.idMode !== 'anon' && !getMe()) { askId(info, check); return; }
      if (info.lesson) { go(info.lesson.path); return; }               // 수업 중에는 복습 목록 없이 바로 수업으로
      var who = getMe(), lastL = info.last ? find(info.last.path) : null;
      show('<h2><span class="dot" aria-hidden="true"></span>지금은 복습 시간이에요</h2><p class="muted">아래 차시를 자유롭게 열어 볼 수 있어요. 선생님이 수업을 시작하면 어느 화면에 있든 저절로 수업 차시로 넘어가요.</p>'
        + (lastL ? '<div class="row"><a class="btn main" href="' + esc(lastL.student + '?room=' + code + pass) + '">지난 수업 다시 보기 · ' + esc(lastL.n + '차시 ' + lastL.title) + '</a></div>' : '')
        + '<p class="small">' + (info.idMode && info.idMode !== 'anon' && who ? who.num + '번' + (who.name ? ' ' + esc(who.name) : '') + '으로 들어와 있어요. <a href="#" id="reid">바꾸기</a>' : '이름은 보내지 않아요.') + '</p>');
      var re = $('reid'); if (re) re.onclick = function (e) { e.preventDefault(); try { localStorage.removeItem(ME); } catch (x) {} if (ws) { gone = true; ws.close(); gone = false; ws = null; } check(); };
      library(true, { last: lastL && lastL.path });
      if (!ws || ws.readyState > 1) listen();
    }).catch(function () { show('<h2>연결하지 못했어요</h2><p class="muted">인터넷 연결을 확인해 주세요. 아래 차시는 혼자 볼 수 있어요.</p>'); library(false); setTimeout(check, 5000); });
  }
  $('foot').textContent = teacher ? '이 기기에 진행 열쇠가 있어서 같은 반 링크가 선생님 화면으로 열려요. 학생 기기에서는 학생 화면으로 열려요.' : '';
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
  <p class="muted">반마다 수업방을 한 번 만들고, <b>반 링크</b>를 그 반 클래스룸에 한 번만 올려 두세요. 학생은 그 링크로 언제든 들어와 복습하고, 수업 때는 선생님이 여는 차시로 저절로 옮겨 가요. 선생님도 수업 때 <b>같은 반 링크</b>를 이 기기에서 열면 선생님 화면이 돼요.</p>
  <div id="classes" style="display:grid;gap:16px"></div>
  <div class="card">
    <h2>반 수업방 만들기</h2>
    <form class="form" id="make">
      <label class="grow">반 이름<input type="text" id="name" maxlength="30" placeholder="예: 2학년 3반" autocomplete="off"></label>
      <label>학생 표시<select id="idmode"><option value="anon">익명</option><option value="num">번호만</option><option value="numname">번호와 이름</option></select></label>
      <label id="sizeWrap" hidden>반 인원<input type="text" inputmode="numeric" id="size" value="30" style="width:90px"></label>
      <button class="btn main" type="submit">만들기</button>
    </form>
    <p class="small"><b>익명</b>은 들어온 수와 응답 수만 보여요. <b>번호만</b>·<b>번호와 이름</b>은 학생이 처음 한 번 넣고, 수업 패널에 번호 칸(같은 장·다른 장·안 들어옴)으로 보여요. 이름은 «이름 보기»를 눌렀을 때만 보여요. 언제든 바꿀 수 있어요.</p>
    <p class="small" id="msg" aria-live="polite"></p>
  </div>
  <div class="card">
    <h2>다른 기기에서 쓰기 · 열쇠 보관</h2>
    <p class="muted">진행 열쇠는 이 브라우저에만 있어요. 반마다 «다른 기기용 링크»를 복사해 집 컴퓨터나 휴대폰에서 한 번 열면 그 기기에서도 같은 반으로 수업할 수 있어요. 휴대폰에서 같은 차시를 열면 리모컨처럼 함께 넘어가요.</p>
    <p class="small note">브라우저 기록을 지우면 열쇠도 지워져요. 다른 기기용 링크를 나만 보는 메모에 저장해 두면 언제든 되살릴 수 있어요. 이 링크는 학생에게 보내지 마세요.</p>
  </div>
</div>
<script>
(function () {
  'use strict';
  var qs = new URLSearchParams(location.search);
  var API = (qs.get('roomapi') || ${JSON.stringify(site.roomApi || '')}).replace(/\\/$/, '');
  var pass = qs.get('roomapi') ? '&roomapi=' + encodeURIComponent(qs.get('roomapi')) : '';
  var BASE = location.href.split(/[?#]/)[0].replace(/[^/]*$/, '');
  var LESSONS = ${lessonData(lessons)};
  var KEY = 'science-room:classes';
  var MODES = { anon: '익명', num: '번호만', numname: '번호와 이름' };
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { msg('이 브라우저에 저장하지 못했어요(사생활 보호 창이면 일반 창에서 열어 주세요).'); } }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function msg(t) { document.getElementById('msg').textContent = t; }
  function find(path) { return LESSONS.filter(function (l) { return l.path === path; })[0] || null; }
  function label(l) { return l.unit + ' ' + l.n + '차시 ' + l.title; }
  function post(path, body) { return fetch(API + '/rooms/' + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(function (r) { return r.json(); }); }
  // 다른 기기용 링크(#add=...)로 열었으면 이 브라우저에 반을 더한다
  var m = location.hash.match(/^#add=(.+)$/);
  if (m) {
    try { var c = JSON.parse(decodeURIComponent(m[1])); if (/^\\d{6}$/.test(c.code) && c.key) { var l = load().filter(function (x) { return x.code !== c.code; }); l.push(c); save(l); msg((c.name || '반') + ' 수업방을 이 기기에 더했어요.'); } } catch (e) {}
    history.replaceState(null, '', location.pathname + location.search);
  }
  function copy(text, btn) {
    var done = function () { var t = btn.textContent; btn.textContent = '복사했어요'; setTimeout(function () { btn.textContent = t; }, 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () { prompt('복사해서 쓰세요', text); });
    else prompt('복사해서 쓰세요', text);
  }
  function armed(b, text, idle) {
    if (b.dataset.armed) return true;
    b.dataset.armed = '1'; b.textContent = text;
    setTimeout(function () { if (b.isConnected) { delete b.dataset.armed; b.textContent = idle; } }, 3000);
    return false;
  }
  function lessonsHtml(c) {
    var html = '', unit = '';
    LESSONS.forEach(function (l) {
      if (l.unit !== unit) { unit = l.unit; html += '<li class="unit">' + esc(l.unit + ' ' + l.unitTitle) + '</li>'; }
      html += '<li><span>' + esc(l.n + '차시 ' + l.title) + '</span><a class="btn" href="' + esc(l.teacher + '?room=' + c.code + pass) + '">시작</a></li>';
    });
    return html;
  }
  // 반마다 지금 수업 중인지·지난 수업
  function status(card, c) {
    var box = card.querySelector('[data-s]');
    fetch(API + '/rooms/' + c.code).then(function (r) { return r.json(); }).then(function (info) {
      if (!info.open) { box.textContent = '닫힌 방이에요(오래 쓰지 않아 닫혔어요). 이 기기에서 지우고 새로 만들어 주세요.'; return; }
      var now = info.lesson && find(info.lesson.path), last = info.last && find(info.last.path);
      if (now) {
        box.classList.add('live');
        box.innerHTML = '<span class="dot" aria-hidden="true"></span>지금 수업 중: <b>' + esc(label(now)) + '</b> · 학생 ' + (info.students || 0) + '명 <button class="btn warn" type="button" data-a="end" style="min-height:36px;margin-left:6px">수업 끝내기</button>';
        var b = box.querySelector('[data-a="end"]');
        b.onclick = function () {
          if (!armed(b, '한 번 더 누르면 수업이 끝나요', '수업 끝내기')) return;
          b.disabled = true; post(c.code + '/end', { key: c.key }).then(function () { box.classList.remove('live'); status(card, c); }).catch(function () { msg('끝내지 못했어요. 인터넷 연결을 확인해 주세요.'); b.disabled = false; });
        };
      } else box.innerHTML = last ? '수업 전 · 지난 수업: <b>' + esc(label(last)) + '</b>' : '수업 전 · 아직 연 차시가 없어요';
    }).catch(function () { box.textContent = '수업방 상태를 확인하지 못했어요.'; });
  }
  function update(code, patch) { save(load().map(function (x) { return x.code === code ? Object.assign(x, patch) : x; })); }
  function render() {
    var list = load(), box = document.getElementById('classes');
    if (!list.length) { box.innerHTML = '<div class="card"><p class="muted">아직 만든 반 수업방이 없어요. 아래에서 반 이름을 넣고 만들어 주세요.</p></div>'; return; }
    box.innerHTML = list.map(function (c, i) {
      var join = BASE + 'join.html?room=' + c.code, mode = c.idMode || 'anon';
      return '<div class="card big" data-i="' + i + '">'
        + '<div class="row between"><h2>' + esc(c.name || '반 수업방') + '</h2><span class="code" title="참여 코드">' + c.code + '</span></div>'
        + '<p class="status" data-s>확인하는 중…</p>'
        + '<p class="small">반 링크 — 이 반 클래스룸에 한 번 올려 두세요. 선생님도 수업 때 이 링크를 열어요.</p><div class="link">' + esc(join) + '</div>'
        + '<div class="row"><a class="btn main" href="' + esc(join + pass) + '">반 링크 열기</a><button class="btn" type="button" data-a="copy">반 링크 복사</button></div>'
        + '<div class="row"><span class="small">학생 표시</span>' + ['anon', 'num', 'numname'].map(function (k) { return '<button class="btn" type="button" data-m="' + k + '" aria-pressed="' + (mode === k) + '">' + MODES[k] + '</button>'; }).join('')
        + (mode !== 'anon' ? '<label class="sizebox">인원 <input type="text" inputmode="numeric" data-a="size" value="' + (c.size || 30) + '" aria-label="반 인원"> 명</label>' : '') + '</div>'
        + '<details><summary>차시 바로 시작</summary><ul class="lessons">' + lessonsHtml(c) + '</ul></details>'
        + '<details><summary>이 기기 관리</summary><div class="row"><button class="btn" type="button" data-a="move">다른 기기용 링크 복사</button><button class="btn warn" type="button" data-a="del">이 기기에서 지우기</button></div>'
        + '<p class="small">지워도 반 링크와 학생 기록은 그대로예요. 다른 기기용 링크가 있으면 되살릴 수 있어요.</p></details>'
        + '</div>';
    }).join('');
    box.querySelectorAll('[data-i]').forEach(function (card) {
      var c = load()[+card.dataset.i];
      status(card, c);
      card.querySelector('[data-a="copy"]').onclick = function (e) { copy(BASE + 'join.html?room=' + c.code, e.currentTarget); };
      card.querySelectorAll('[data-m]').forEach(function (b) {
        b.onclick = function () {
          post(c.code + '/settings', { key: c.key, idMode: b.dataset.m }).then(function (j) {
            if (j.error) { msg(j.error); return; }
            update(c.code, { idMode: j.idMode, size: j.size }); render();
          }).catch(function () { msg('바꾸지 못했어요. 인터넷 연결을 확인해 주세요.'); });
        };
      });
      var size = card.querySelector('[data-a="size"]');
      if (size) size.onchange = function () {
        var n = parseInt(size.value, 10);
        if (!(n >= 1 && n <= 60)) { msg('반 인원은 1~60명으로 넣어 주세요.'); size.value = c.size || 30; return; }
        post(c.code + '/settings', { key: c.key, size: n }).then(function (j) { if (j.error) { msg(j.error); return; } update(c.code, { size: j.size }); msg((c.name || '반') + ' 인원을 ' + j.size + '명으로 바꿨어요.'); }).catch(function () { msg('바꾸지 못했어요. 인터넷 연결을 확인해 주세요.'); });
      };
      card.querySelector('[data-a="move"]').onclick = function (e) { copy(BASE + 'teach.html#add=' + encodeURIComponent(JSON.stringify(c)), e.currentTarget); };
      card.querySelector('[data-a="del"]').onclick = function (e) {
        if (!armed(e.currentTarget, '한 번 더 누르면 지워져요', '이 기기에서 지우기')) return;
        save(load().filter(function (x) { return x.code !== c.code; })); render();
      };
    });
  }
  var idmode = document.getElementById('idmode');
  idmode.onchange = function () { document.getElementById('sizeWrap').hidden = idmode.value === 'anon'; };
  document.getElementById('make').onsubmit = function (e) {
    e.preventDefault();
    var name = document.getElementById('name').value.trim();
    if (!name) { msg('반 이름을 넣어 주세요.'); return; }
    if (!API) { msg('수업방 주소가 없어요.'); return; }
    msg('만드는 중…');
    var mode = idmode.value, size = parseInt(document.getElementById('size').value, 10) || 30;
    fetch(API + '/rooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ persist: true, name: name, idMode: mode, size: size }) })
      .then(function (r) { return r.json(); }).then(function (j) {
        if (!j.code || !j.key) throw new Error(j.error || '만들지 못했어요');
        var l = load(); l.push({ code: j.code, key: j.key, name: j.name || name, idMode: j.idMode || mode, size: j.size || size }); save(l);
        document.getElementById('name').value = ''; msg(name + ' 수업방을 만들었어요. 반 링크를 그 반 클래스룸에 올려 두세요.'); render();
      }).catch(function (err) { msg((err && err.message) || '만들지 못했어요. 인터넷 연결을 확인해 주세요.'); });
  };
  render();
})();
</script>
</body>
</html>
`;
}
