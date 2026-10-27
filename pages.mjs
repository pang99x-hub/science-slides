// 반 수업방 쪽: join.html(학생 고정 링크)과 teach.html(선생님 페이지). make-index.mjs가 부른다.
//   학생: 클래스룸에 한 번 올려 둔 join.html?room=123456 → 선생님이 연 차시 학생용으로 저절로 옮겨 간다. 수업이 없으면 복습
//   선생님: teach.html에서 수업방을 만들고(진행 열쇠는 이 브라우저에 저장), 같은 링크를 열면 선생님 화면이 된다
//   과목 방: 가르치는 반 목록이 있는 방. 학생은 처음 한 번 반을 고르고, 선생님은 반을 골라 수업을 연다(그 반 학생만 따라온다)
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
[hidden] { display: none !important; }
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
input[type=text], input[type=email], select { font: 600 18px/1.3 var(--f-body); padding: 10px 12px; border: 2px solid var(--ink); border-radius: 8px; background: var(--paper); color: var(--ink); min-width: 0; }
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
input[type=password] { font: 600 18px/1.3 var(--f-body); padding: 10px 12px; border: 2px solid var(--ink); border-radius: 8px; background: var(--paper); color: var(--ink); min-width: 0; width: 100%; }
.btn.small { min-height: 34px; padding: 0 12px; font-size: 14px; }
.namebox { display: flex; flex-wrap: wrap; gap: 8px 12px; align-items: center; min-width: 0; flex: 1 1 auto; }
.namebox form { flex: 1 1 100%; }
</style>
</head>`;

const lessonList = (units) => units.flatMap((u) => u.lessons.map((l) => ({ ...l, unit: u.unit, unitTitle: u.unitTitle, subject: u.subject, path: l.student.replace(/\/student\.html$/, '') })));
const lessonData = (lessons) => JSON.stringify(lessons.map((l) => ({ unit: l.unit, unitTitle: l.unitTitle, n: l.n, title: l.title, path: l.path, student: l.student, teacher: l.teacher })));

// 선생님 로그인(구글)·이 기기의 수업방 열쇠 — join.html과 teach.html이 같이 쓴다. 바깥 스크립트에 API·GID가 있어야 한다
// (템플릿 안에 그대로 들어가므로 이 안에는 달러+중괄호를 쓰지 않는다)
const AUTH_JS = String.raw`
  var SESS = 'science-room:session', ROOMS = 'science-room:classes';
  function stored(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function store(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function sess() { var s = stored(SESS); return s && s.token ? s : null; }          // { token, email, name, status, admin, pending }
  function devId() {
    var d = null; try { d = localStorage.getItem('science-room:dev'); } catch (e) {}
    if (!/^d-[0-9a-f]{20}$/.test(d || '')) { d = 'd-' + Array.from(crypto.getRandomValues(new Uint8Array(10)), function (b) { return b.toString(16).padStart(2, '0'); }).join(''); try { localStorage.setItem('science-room:dev', d); } catch (e) {} }
    return d;
  }
  function myRooms() { return stored(ROOMS) || []; }
  function have() { return myRooms().filter(function (c) { return c && c.code && c.key; }).map(function (c) { return { code: c.code, key: c.key }; }); }
  function api(path, body) {
    return fetch(API + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body || {}) })
      .then(function (r) { return r.json().then(function (j) { j.http = r.status; return j; }); });
  }
  // 로그인·맞추기 결과를 이 기기에 둔다(승인된 선생님이면 내 수업방과 이 기기용 진행 열쇠까지)
  function keep(j, token) {
    var s = sess() || {};
    store(SESS, { token: token || s.token, email: j.email, name: j.name || s.name || '', status: j.status, admin: !!j.admin, pending: j.pending || 0 });
    if (j.rooms) store(ROOMS, j.rooms.map(function (r) { return { code: r.code, key: r.key, name: r.name, idMode: r.idMode, size: r.size, classes: r.classes }; }));
    return sess();
  }
  function signedOut() { store(SESS, null); store(ROOMS, null); }
  // 로그인돼 있으면 서버와 맞춘다 → 로그인 정보(로그인 안 됐거나 풀렸으면 null)
  function syncMe() {
    var s = sess(); if (!s) return Promise.resolve(null);
    return api('/me', { session: s.token, dev: devId(), have: have() }).then(function (j) { if (j.login) { signedOut(); return null; } return j.error ? s : keep(j); }, function () { return s; });
  }
  // 로그아웃: 이 기기의 진행 열쇠도 서버에서 못 쓰게 한다(공용 컴퓨터)
  function logout() {
    var s = sess(), done = function () { signedOut(); try { if (window.google && google.accounts) google.accounts.id.disableAutoSelect(); } catch (e) {} };
    return api('/auth/logout', { session: s && s.token, have: have() }).then(done, done);
  }
  // 구글 로그인 단추. 구글 스크립트는 이 단추를 띄울 때만 불러온다(학생 화면은 구글에 연결하지 않는다)
  function googleButton(box, onDone) {
    if (!GID) { box.innerHTML = '<p class="small">구글 로그인을 준비하고 있어요. 조금 뒤에 다시 와 주세요.</p>'; return; }
    var go = function () {
      if (!window.google || !google.accounts || !google.accounts.id) { box.innerHTML = '<p class="small">구글 로그인을 불러오지 못했어요. 인터넷 연결을 확인해 주세요.</p>'; return; }
      google.accounts.id.initialize({ client_id: GID, auto_select: false, callback: function (r) {
        onDone(null, '확인하는 중…', true);
        api('/auth/google', { credential: r.credential, dev: devId(), have: have() }).then(function (j) {
          if (j.error) onDone(null, j.error); else onDone(keep(j, j.session));
        }, function () { onDone(null, '연결하지 못했어요. 인터넷 연결을 확인해 주세요.'); });
      } });
      box.innerHTML = '';
      google.accounts.id.renderButton(box, { theme: 'outline', size: 'large', text: 'signin_with', shape: 'pill', locale: 'ko' });
    };
    if (window.google && google.accounts && google.accounts.id) { go(); return; }
    var sc = document.createElement('script'); sc.src = 'https://accounts.google.com/gsi/client'; sc.async = true; sc.onload = go; sc.onerror = go; document.head.appendChild(sc);
  }
`;

export function joinPage(site, units) {
  const lessons = lessonList(units);
  return `${head(site.name + ' · 수업방')}
<body>
<div class="wrap">
  <p class="brand"><a href="index.html">${esc(site.name)}</a></p>
  <h1 id="title">수업방</h1>
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
  var GID = qs.get('gid') || ${JSON.stringify(site.googleClientId || '')};
  var LESSONS = ${lessonData(lessons)};
  var $ = function (id) { return document.getElementById(id); };
${AUTH_JS}
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
  function idQuery() { var m = getMe(); return m ? (m.cls ? '&cls=' + encodeURIComponent(m.cls) : '') + (m.num ? '&num=' + m.num : '') + (m.name ? '&name=' + encodeURIComponent(m.name) : '') : ''; }
  // 처음 한 번 넣을 것: 과목 방이면 우리 반, 번호를 받는 반이면 번호(와 이름)
  function needId(info) {
    var w = getMe() || {}, list = info.classes || [];
    if (list.length && list.indexOf(w.cls) < 0) return true;
    return !!info.idMode && info.idMode !== 'anon' && !w.num;
  }
  function myCls(info) { return (info.classes || []).length ? (getMe() || {}).cls || null : null; }
  // 이 수업이 나에게 해당하나: 반이 정해진 수업은 그 반 학생만
  function forMe(l) { return !!l && (!l.cls || l.cls === (getMe() || {}).cls); }
  function lastOf(info, c) { return c ? (info.lastBy || {})[c] || null : info.last || null; }
  function askId(info, next) {
    var list = info.classes || [], withNum = !!info.idMode && info.idMode !== 'anon', withName = info.idMode === 'numname';
    var old = getMe() || {}, cls = list.indexOf(old.cls) >= 0 ? old.cls : null, what = withName ? '번호와 이름' : '번호';
    show('<h2>' + esc(info.name || '반') + ' 수업방</h2><p class="muted">' + (list.length ? (withNum ? '우리 반을 고르고 ' + what + '을 넣어요.' : '우리 반을 골라요.') + ' 처음 한 번만 하면 돼요.' : '선생님이 ' + what + '을 받기로 했어요. 처음 한 번만 넣으면 돼요.') + '</p>'
      + '<form id="idf" style="display:grid;gap:10px">'
      + (list.length ? '<div class="row" role="group" aria-label="우리 반">' + list.map(function (c) { return '<button class="btn" type="button" data-c="' + esc(c) + '" aria-pressed="' + (c === cls) + '">' + esc(c) + '</button>'; }).join('') + '</div>' : '')
      + (withNum ? '<div class="row"><input type="text" inputmode="numeric" id="num" placeholder="번호" aria-label="번호" style="flex:0 1 110px" value="' + (old.num || '') + '">' + (withName ? '<input type="text" id="nm" maxlength="12" placeholder="이름" aria-label="이름" autocomplete="off" style="flex:1 1 160px" value="' + esc(old.name || '') + '">' : '') + '<button class="btn main" type="submit">들어가기</button></div>' : '')
      + '</form><p class="small" id="idm" aria-live="polite"></p>');
    var form = $('idf');
    function done() {
      var num = withNum ? parseInt($('num').value, 10) : null, name = withName ? $('nm').value.replace(/\\s+/g, ' ').trim() : '';
      if (list.length && !cls) { $('idm').textContent = '우리 반을 먼저 골라 주세요.'; return; }
      if (withNum && !(num >= 1 && num <= 99)) { $('idm').textContent = '번호를 1~99 사이로 넣어 주세요.'; return; }
      if (withName && !/^[\\p{L} ]{1,12}$/u.test(name)) { $('idm').textContent = '이름을 글자로 12자 안에서 넣어 주세요.'; return; }
      try { localStorage.setItem(ME, JSON.stringify({ cls: cls, num: num, name: name })); } catch (x) {}
      next();
    }
    form.querySelectorAll('[data-c]').forEach(function (b) {
      b.onclick = function () {
        cls = b.dataset.c;
        form.querySelectorAll('[data-c]').forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        if (withNum) $('num').focus(); else done();                     // 반만 고르는 방: 누르면 바로 들어간다
      };
    });
    form.onsubmit = function (e) { e.preventDefault(); done(); };
    var first = (cls && $('num')) || form.querySelector('[data-c]') || $('num'); if (first) first.focus();
  }
  var gone = false;
  function show(html) { $('app').innerHTML = html; }
  function go(path) { if (gone) return; gone = true; location.replace(path + '/student.html?room=' + code + pass); }
  function copy(text, btn) {
    var done = function () { var t = btn.textContent; btn.textContent = '복사했어요'; setTimeout(function () { btn.textContent = t; }, 1600); };
    if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, function () { prompt('복사해서 쓰세요', text); }); else prompt('복사해서 쓰세요', text);
  }
  if (!/^(\\d{4}|\\d{6})$/.test(code) || !API) {
    show('<h2>링크가 올바르지 않아요</h2><p class="muted">선생님께 링크를 다시 받아 주세요.</p>');
    library(false); return;
  }
  // 단원별 차시 목록. mark: { now, next, last } 차시 경로
  function library(withRoom, mark) {
    mark = mark || {};
    $('lib').hidden = false;
    $('libTitle').textContent = teacher ? '차시 고르기 — 누르면 ' + (selCls || '이 반') + ' 수업이 그 차시로 시작돼요' : withRoom ? '복습 — 아무 차시나 열어 볼 수 있어요' : '차시 목록 — 혼자 볼 수 있어요';
    var html = '', unit = '';
    LESSONS.forEach(function (l) {
      if (l.unit !== unit) { unit = l.unit; html += '<li class="unit">' + esc(l.unit + ' ' + l.unitTitle) + '</li>'; }
      var href = teacher ? l.teacher + tq() : l.student + (withRoom ? '?room=' + code + pass : '');
      var tag = mark.now === l.path ? '<b class="tag now">지금 수업 중</b>' : mark.next === l.path ? '<b class="tag next">다음 차시</b>' : mark.last === l.path ? '<b class="tag">지난 수업</b>' : '';
      var main = mark.now === l.path || (teacher ? mark.next === l.path : mark.last === l.path);
      html += '<li><span>' + esc(l.n + '차시 ' + l.title) + tag + '</span><a class="btn' + (main ? ' main' : '') + '" href="' + esc(href) + '">' + (teacher ? (mark.now === l.path ? '이어서 하기' : '수업 시작') : '열기') + '</a></li>';
    });
    $('list').innerHTML = html;
  }
  // ---- 선생님 화면: 지금 수업 / (과목 방이면 반 고르기) 지난 수업 · 다음 차시, 들어온 학생 수(10초마다) ----
  var sig = null, pollT = 0, lastInfo = null, selCls = null, CLS_KEY = 'science-room:cls:' + code;
  function tq() { return '?room=' + code + (selCls ? '&cls=' + encodeURIComponent(selCls) : '') + pass; }
  function teacherView(info) {
    lastInfo = info;
    var list = info.classes || [];
    if (!list.length) selCls = null;
    else if (list.indexOf(selCls) < 0) { var st = null; try { st = localStorage.getItem(CLS_KEY); } catch (e) {} selCls = (info.lesson && info.lesson.cls) || (list.indexOf(st) >= 0 ? st : list[0]); }
    var s = JSON.stringify([info.lesson, info.last, info.lastBy, list, selCls]);
    if (s !== sig) {
      sig = s;
      var open = info.lesson ? find(info.lesson.path) : null, openCls = (info.lesson && info.lesson.cls) || null;
      var now = open && openCls === selCls ? open : null;                // 고른 반(반 목록이 없으면 이 방)의 수업
      var lastI = lastOf(info, selCls), lastL = lastI ? find(lastI.path) : null;
      var nextL = now ? null : lastL ? find(nextOf(lastL.path)) : LESSONS[0];
      var who = function (c) { return c ? esc(c) + ' · ' : ''; };
      var h = open
        ? '<h2><span class="dot" aria-hidden="true"></span>지금 수업 중: ' + who(openCls) + esc(label(open)) + '</h2><p class="muted">' + (openCls ? esc(openCls) + ' ' : '') + '학생 화면이 이 차시를 따라가고 있어요. 마칠 때 «수업 끝내기»를 누르면 학생은 복습으로 바뀌어요. 잊어도 선생님 화면을 닫고 15분 뒤에 저절로 끝나요.</p>'
        : '<h2>수업 전이에요</h2><p class="muted">' + (list.length ? '반을 고르고 차시를 누르면 수업이 시작되고, 들어와 있는 <b>그 반 학생</b> 화면만 그 차시로 옮겨 가요. 다른 반 학생은 복습을 그대로 해요.' : (lastL ? '지난 수업은 <b>' + esc(label(lastL)) + '</b>이에요. ' : '') + '차시를 고르면 수업이 시작되고, 들어와 있는 학생 화면이 그 차시로 옮겨 가요.') + '</p>';
      h += '<p class="muted" id="cnt"></p>';
      if (open) h += '<div class="row"><a class="btn' + (now ? ' main' : '') + '" href="' + esc(open.teacher + '?room=' + code + (openCls ? '&cls=' + encodeURIComponent(openCls) : '') + pass) + '">' + who(openCls) + '이어서 하기</a><button class="btn warn" type="button" id="end">수업 끝내기</button></div>';
      if (list.length) h += '<div class="row" role="group" aria-label="수업할 반"><span class="small">수업할 반</span>' + list.map(function (c) { return '<button class="btn" type="button" data-c="' + esc(c) + '" aria-pressed="' + (c === selCls) + '">' + esc(c) + '</button>'; }).join('') + '</div>'
        + '<p class="muted">' + esc(selCls) + ' 지난 수업: ' + (lastL ? '<b>' + esc(label(lastL)) + '</b>' : '아직 없어요') + '</p>';
      if (nextL) h += '<div class="row"><a class="btn main" href="' + esc(nextL.teacher + tq()) + '">' + who(selCls) + (lastL ? '다음 차시 시작' : '첫 차시 시작') + ' · ' + esc(nextL.n + '차시 ' + nextL.title) + '</a></div>'
        + (open ? '<p class="small">시작하면 ' + (openCls ? esc(openCls) + ' ' : '지금 ') + '수업은 끝나요.</p>' : '');
      h += '<div class="row"><button class="btn" type="button" id="copy">' + (list.length ? '과목 링크 복사' : '반 링크 복사') + '</button><a class="btn" href="?room=' + code + '&as=student' + pass + '">학생 화면 미리 보기</a><a class="btn" href="teach.html' + (pass ? '?' + pass.slice(1) : '') + '">선생님 페이지</a></div>';
      show(h);
      $('copy').onclick = function (e) { copy(location.href.split('?')[0] + '?room=' + code, e.currentTarget); };
      $('app').querySelectorAll('[data-c]').forEach(function (b) {
        b.onclick = function () { selCls = b.dataset.c; try { localStorage.setItem(CLS_KEY, selCls); } catch (e) {} teacherView(lastInfo); };
      });
      var end = $('end');
      if (end) end.onclick = function () {
        if (!end.dataset.armed) { end.dataset.armed = '1'; end.textContent = '한 번 더 누르면 수업이 끝나요'; setTimeout(function () { if (end.isConnected) { delete end.dataset.armed; end.textContent = '수업 끝내기'; } }, 3000); return; }
        end.disabled = true;
        fetch(API + '/rooms/' + code + '/end', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ key: mine.key }) })
          .then(function (r) { return r.json(); }).then(function () { check(); }).catch(function () { end.disabled = false; end.textContent = '끝내지 못했어요 · 다시 누르기'; delete end.dataset.armed; });
      };
      library(true, { now: now && now.path, next: nextL && nextL.path, last: lastL && lastL.path });
    }
    var by = info.byCls || {};
    $('cnt').innerHTML = '지금 들어와 있는 학생: <b>' + (info.students || 0) + '</b>명' + (list.length ? ' (' + list.map(function (c) { return esc(c) + ' ' + (by[c] || 0); }).join(' · ') + ')' : '');
    clearTimeout(pollT);
    pollT = setTimeout(function tick() { if (document.hidden) { pollT = setTimeout(tick, 10000); return; } check(); }, 10000);   // 화면을 보고 있을 때만
  }
  // ---- 학생 화면 미리 보기 ----
  function previewView(info) {
    var now = info.lesson ? find(info.lesson.path) : null, lastL = info.last ? find(info.last.path) : null;
    show('<h2>학생 화면 미리 보기</h2><p class="muted">' + (now ? '지금은 수업 중이라, 학생이 링크를 열면 이 화면 없이 바로 <b>' + esc(label(now)) + '</b>로 넘어가요.' : '수업이 없을 때 학생은 이 링크에서 아래 차시를 골라 복습해요. 선생님이 수업을 시작하면 어느 화면에 있든 저절로 수업 차시로 넘어가요.') + '</p>'
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
      if (m.t === 'state' && forMe(m.lesson)) go(m.lesson.path);          // 우리 반 수업만 따라간다
      if (m.t === 'lesson' && forMe(m)) go(m.path);
      if (m.t === 'summon' && m.path && forMe(m)) go(m.path);
      if (m.t === 'classes') check();
    };
    ws.onclose = function () { if (!gone) setTimeout(check, Math.min(10000, 1000 * Math.pow(2, tries++))); };
  }
  // ---- 선생님으로 들어가기: 가입 승인된 선생님 구글 계정으로 로그인 → 이 기기에 진행 열쇠 ----
  var synced = false;
  function isMine() { return myRooms().some(function (c) { return c.code === code && c.key; }); }
  function reopen() { location.replace(location.href.split('#')[0]); }      // 선생님 화면(또는 학생 화면)으로 다시 연다
  var teachUrl = 'teach.html' + (pass ? '?' + pass.slice(1) : '');
  function teacherDoor() {
    $('foot').innerHTML = '<button class="btn" type="button" id="tdoor">선생님이세요? 구글로 로그인</button>';
    $('tdoor').onclick = function () { loginView(false); };
  }
  // claim: 이 기기에 이 방 열쇠는 있는데 로그인 전(로그인하면 그 계정 수업방으로 옮겨진다)
  function loginView(claim) {
    if (ws) { gone = true; try { ws.close(); } catch (x) {} ws = null; gone = false; }
    $('lib').hidden = true; $('foot').innerHTML = '';
    show('<h2>선생님으로 들어가기</h2><p class="muted">' + (claim
      ? '이 기기에 이 수업방 열쇠가 있어요. 이제 선생님 기능은 로그인해야 쓸 수 있어요. 구글로 로그인하면 이 수업방이 그 계정으로 옮겨지고 바로 수업할 수 있어요.'
      : '가입 승인을 받은 선생님 구글 계정으로 로그인하면 이 기기가 선생님 기기가 돼요. 한 번 로그인한 기기는 다른 수업방 링크도 저절로 선생님으로 열려요. 학생은 로그인하지 않아요.') + '</p>'
      + '<div id="gbtn"></div><p class="small" id="lm" aria-live="polite"></p><div class="row">' + (claim ? '' : '<button class="btn" type="button" id="back">학생 화면으로</button>') + '<a class="btn" href="' + teachUrl + '">선생님 페이지</a></div>');
    var back = $('back'); if (back) back.onclick = function () { check(); };
    googleButton($('gbtn'), function (who, err) {
      if (!who) { $('lm').textContent = err; return; }
      if (who.status !== 'approved') { $('lm').innerHTML = esc(who.email) + ' 계정은 아직 가입 승인 전이에요. <a href="' + teachUrl + '">선생님 페이지</a>에서 가입 신청을 해 주세요.'; return; }
      if (isMine()) { reopen(); return; }
      $('lm').textContent = who.email + ' 계정이 만든 수업방이 아니에요. 이 수업방을 만든 선생님 계정으로 로그인해 주세요.';
    });
  }
  function check() {
    fetch(API + '/rooms/' + code).then(function (r) { return r.json(); }).then(function (info) {
      if (!info.open) { show('<h2>이 반 수업방은 닫혔어요</h2><p class="muted">' + (teacher ? '선생님 페이지에서 새로 만들어 주세요.' : '선생님께 새 링크를 받아 주세요. 아래 차시는 혼자 볼 수 있어요.') + '</p>'); library(false); return; }
      $('title').textContent = (info.name || '반') + ' 수업방' + (teacher ? ' · 선생님' : '');
      if (teacher) { if (sess()) teacherView(info); else loginView(true); return; }
      if (preview) { previewView(info); return; }
      // 이 기기가 다른 수업방에서 로그인해 둔 선생님 기기면, 이 방도 내 방인지 조용히 맞춰 본다
      if (!synced && sess()) { synced = true; syncMe().then(function () { if (isMine()) reopen(); else check(); }, check); return; }
      teacherDoor();
      if (needId(info)) { askId(info, check); return; }
      if (forMe(info.lesson)) { go(info.lesson.path); return; }          // 우리 반 수업 중에는 복습 목록 없이 바로 수업으로
      var who = getMe() || {}, mc = myCls(info), lastI = lastOf(info, mc), lastL = lastI ? find(lastI.path) : null;
      var tag = [mc ? esc(mc) : '', info.idMode && info.idMode !== 'anon' && who.num ? who.num + '번' + (who.name ? ' ' + esc(who.name) : '') : ''].filter(Boolean).join(' ');
      show('<h2><span class="dot" aria-hidden="true"></span>지금은 복습 시간이에요</h2><p class="muted">아래 차시를 자유롭게 열어 볼 수 있어요. 선생님이 ' + (mc ? '우리 반 ' : '') + '수업을 시작하면 어느 화면에 있든 저절로 수업 차시로 넘어가요.</p>'
        + (lastL ? '<div class="row"><a class="btn main" href="' + esc(lastL.student + '?room=' + code + pass) + '">지난 수업 다시 보기 · ' + esc(lastL.n + '차시 ' + lastL.title) + '</a></div>' : '')
        + '<p class="small">' + (tag ? '이 기기는 <b>' + tag + '</b> 학생으로 들어와 있어요. <a href="#" id="reid">바꾸기</a>' : '이름은 보내지 않아요.') + '</p>');
      var re = $('reid'); if (re) re.onclick = function (e) { e.preventDefault(); try { localStorage.removeItem(ME); } catch (x) {} if (ws) { gone = true; ws.close(); gone = false; ws = null; } check(); };
      library(true, { last: lastL && lastL.path });
      if (!ws || ws.readyState > 1) listen();
    }).catch(function () { show('<h2>연결하지 못했어요</h2><p class="muted">인터넷 연결을 확인해 주세요. 아래 차시는 혼자 볼 수 있어요.</p>'); library(false); setTimeout(check, 5000); });
  }
  if (teacher && sess()) {
    $('foot').innerHTML = (sess().pending ? '<b>가입 신청 ' + sess().pending + '건</b>이 승인을 기다려요 · <a href="teach.html' + (pass ? '?' + pass.slice(1) : '') + '">선생님 페이지에서 승인</a><br>' : '')
      + '이 기기는 <b>' + esc(sess().email) + '</b> 계정으로 로그인돼 있어 선생님 화면으로 열려요. 학생 기기에서는 학생 화면으로 열려요. <a href="#" id="out">로그아웃</a>';
    $('out').onclick = function (e) { e.preventDefault(); this.textContent = '로그아웃하는 중…'; logout().then(reopen); };
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
  <p class="muted">과목마다 수업방을 하나 만들고 가르치는 반을 적어 두세요. 그 <b>과목 링크</b>를 반마다 클래스룸에 한 번만 올려 두면 돼요. 학생은 처음 한 번 자기 반을 고르고, 그 링크로 언제든 들어와 복습해요. 선생님이 반을 골라 수업을 열면 <b>그 반 학생만</b> 수업 차시로 저절로 옮겨 가요. 선생님은 <b>구글로 로그인</b>하고, 처음이면 가입 신청을 해서 승인을 받아요. 학생은 로그인하지 않아요.</p>
  <div class="card big" id="me">
    <h2>선생님 로그인</h2>
    <div id="mebox"><p class="muted">확인하는 중…</p></div>
    <p class="small" id="memsg" aria-live="polite"></p>
  </div>
  <div class="card" id="admin" hidden>
    <h2>가입 신청 관리</h2>
    <div id="adminbox"></div>
    <p class="small" id="adminmsg" aria-live="polite"></p>
  </div>
  <div id="classes" style="display:grid;gap:16px"></div>
  <div class="card" id="makecard" hidden>
    <h2>수업방 만들기</h2>
    <form class="form" id="make">
      <label class="grow">이름<input type="text" id="name" maxlength="30" placeholder="예: 통합과학2" autocomplete="off"></label>
      <label class="grow">가르치는 반(쉼표로 나눠요)<input type="text" id="cls" maxlength="200" placeholder="예: 2-1반, 2-3반, 2-5반" autocomplete="off"></label>
      <label>학생 표시<select id="idmode"><option value="anon">익명</option><option value="num">번호만</option><option value="numname">번호와 이름</option></select></label>
      <label id="sizeWrap" hidden>반 인원<input type="text" inputmode="numeric" id="size" value="30" style="width:90px"></label>
      <button class="btn main" type="submit">만들기</button>
    </form>
    <p class="small"><b>가르치는 반</b>을 적으면 과목 방이 돼요. 링크 하나를 모든 반이 같이 쓰고, 학생은 처음 한 번 자기 반을 골라요. 지난 수업·다음 차시는 반마다 따로 기억해요. 비워 두면 반 하나짜리 방이에요. 반은 나중에 더하거나 뺄 수 있어요.</p>
    <p class="small"><b>익명</b>은 들어온 수와 응답 수만 보여요. <b>번호만</b>·<b>번호와 이름</b>은 학생이 처음 한 번 넣고, 수업 패널에 번호 칸(같은 장·다른 장·안 들어옴)으로 보여요. 이름은 «이름 보기»를 눌렀을 때만 보여요. 언제든 바꿀 수 있어요.</p>
    <p class="small" id="msg" aria-live="polite"></p>
  </div>
  <div class="card">
    <h2>다른 기기·교실 컴퓨터에서 수업하기</h2>
    <p class="muted">어느 기기에서든 클래스룸에 올린 <b>과목 링크</b>를 열고, 아래쪽 <b>«선생님이세요? 구글로 로그인»</b>을 누르면 돼요. 이 페이지에서 로그인해도 같아요. 한 번 로그인한 기기는 다른 수업방 링크도 저절로 선생님으로 열려요. 휴대폰에서 같은 차시를 열면 리모컨처럼 함께 넘어가요.</p>
    <p class="small note">여럿이 함께 쓰는 교실 컴퓨터라면 수업 뒤 이 페이지 위쪽 «로그아웃»을 눌러 주세요. 로그아웃하면 그 컴퓨터에 남은 진행 열쇠도 못 쓰게 돼요.</p>
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
  var GID = qs.get('gid') || ${JSON.stringify(site.googleClientId || '')};
  var KEY = 'science-room:classes';
  var MODES = { anon: '익명', num: '번호만', numname: '번호와 이름' };
${AUTH_JS}
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { msg('이 브라우저에 저장하지 못했어요(사생활 보호 창이면 일반 창에서 열어 주세요).'); } }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function msg(t) { document.getElementById('msg').textContent = t; }
  function find(path) { return LESSONS.filter(function (l) { return l.path === path; })[0] || null; }
  function label(l) { return l.unit + ' ' + l.n + '차시 ' + l.title; }
  function post(path, body) { return fetch(API + '/rooms/' + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(function (r) { return r.json(); }); }
  function parseCls(v) { return String(v || '').split(/[,，、\\n]/).map(function (x) { return x.replace(/\\s+/g, ' ').trim(); }).filter(Boolean); }
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
  // 수업방마다 지금 수업 중인지·지난 수업(과목 방이면 반마다), 반 목록 고치기
  function status(card, c) {
    var box = card.querySelector('[data-s]');
    fetch(API + '/rooms/' + c.code).then(function (r) { return r.json(); }).then(function (info) {
      if (!info.open) { box.textContent = '닫힌 방이에요(오래 쓰지 않아 닫혔어요). 아래 «수업방 지우기»로 목록에서 빼고 새로 만들어 주세요.'; return; }
      var list = info.classes || [];
      if (String(list) !== String(c.classes || [])) update(c.code, { classes: list });
      if (info.name && info.name !== c.name) { update(c.code, { name: info.name }); c.name = info.name; var hn = card.querySelector('[data-name]'); if (hn) hn.textContent = info.name; }   // 다른 기기에서 바꾼 이름
      card.querySelectorAll('[data-ll]').forEach(function (x) { x.textContent = (list.length ? '과목' : '반') + x.dataset.ll; });
      var now = info.lesson && find(info.lesson.path), oc = info.lesson && info.lesson.cls, last = info.last && find(info.last.path);
      if (now) {
        box.classList.add('live');
        box.innerHTML = '<span class="dot" aria-hidden="true"></span>지금 수업 중: <b>' + (oc ? esc(oc) + ' · ' : '') + esc(label(now)) + '</b> · 학생 ' + (oc ? (info.byCls || {})[oc] || 0 : info.students || 0) + '명 <button class="btn warn" type="button" data-a="end" style="min-height:36px;margin-left:6px">수업 끝내기</button>';
        var b = box.querySelector('[data-a="end"]');
        b.onclick = function () {
          if (!armed(b, '한 번 더 누르면 수업이 끝나요', '수업 끝내기')) return;
          b.disabled = true; post(c.code + '/end', { key: c.key }).then(function () { box.classList.remove('live'); status(card, c); }).catch(function () { msg('끝내지 못했어요. 인터넷 연결을 확인해 주세요.'); b.disabled = false; });
        };
      } else box.innerHTML = list.length ? '수업 전' : last ? '수업 전 · 지난 수업: <b>' + esc(label(last)) + '</b>' : '수업 전 · 아직 연 차시가 없어요';
      var cb = card.querySelector('[data-cls]');
      cb.innerHTML = (list.length ? '<ul class="lessons">' + list.map(function (k) { var l = (info.lastBy || {})[k], f = l && find(l.path); return '<li><span><b>' + esc(k) + '</b> · 학생 ' + ((info.byCls || {})[k] || 0) + '명 들어옴</span><span class="small">지난 수업: ' + (f ? esc(label(f)) : '아직 없어요') + '</span></li>'; }).join('') + '</ul>' : '')
        + '<form class="form" data-a="clsf"><label class="grow">가르치는 반(쉼표로 나눠요)<input type="text" maxlength="200" value="' + esc(list.join(', ')) + '" placeholder="예: 2-1반, 2-3반, 2-5반" autocomplete="off"></label><button class="btn" type="submit">' + (list.length ? '반 목록 저장' : '과목 방으로 바꾸기') + '</button></form>';
      cb.querySelector('[data-a="clsf"]').onsubmit = function (e) {
        e.preventDefault();
        var want = parseCls(this.querySelector('input').value);
        post(c.code + '/settings', { key: c.key, classes: want }).then(function (j) {
          if (j.error) { msg(j.error); return; }
          update(c.code, { classes: j.classes });
          msg((c.name || '수업방') + ' 반 목록: ' + (j.classes.length ? j.classes.join(', ') : '없음(반 하나짜리 방)') + (j.classes.length < want.length ? ' · 반 이름은 글자·숫자로 10자 안, 16개까지예요.' : ''));
          render();
        }).catch(function () { msg('바꾸지 못했어요. 인터넷 연결을 확인해 주세요.'); });
      };
    }).catch(function () { box.textContent = '수업방 상태를 확인하지 못했어요.'; });
  }
  function update(code, patch) { save(load().map(function (x) { return x.code === code ? Object.assign(x, patch) : x; })); }
  function render() {
    var list = load(), box = document.getElementById('classes');
    if (!list.length) { box.innerHTML = '<div class="card"><p class="muted">아직 만든 수업방이 없어요. 아래에서 과목 이름과 가르치는 반을 넣고 만들어 주세요. 다른 기기에서 만든 수업방은 로그인하면 여기에도 보여요.</p></div>'; return; }
    box.innerHTML = list.map(function (c, i) {
      var join = BASE + 'join.html?room=' + c.code, mode = c.idMode || 'anon', sub = (c.classes || []).length ? '과목' : '반';
      return '<div class="card big" data-i="' + i + '">'
        + '<div class="row between"><div class="namebox" data-head><h2 data-name>' + esc(c.name || '수업방') + '</h2><button class="btn small" type="button" data-a="rename">이름 바꾸기</button></div><span class="code" title="참여 코드">' + c.code + '</span></div>'
        + '<p class="status" data-s>확인하는 중…</p>'
        + '<div data-cls style="display:grid;gap:10px"></div>'
        + '<p class="small"><span data-ll=" 링크">' + sub + ' 링크</span> — 가르치는 반 클래스룸마다 한 번 올려 두세요. 선생님도 수업 때 이 링크를 열어요.</p><div class="link">' + esc(join) + '</div>'
        + '<div class="row"><a class="btn main" href="' + esc(join + pass) + '" data-ll=" 링크 열기">' + sub + ' 링크 열기</a><button class="btn" type="button" data-a="copy" data-ll=" 링크 복사">' + sub + ' 링크 복사</button></div>'
        + '<div class="row"><span class="small">학생 표시</span>' + ['anon', 'num', 'numname'].map(function (k) { return '<button class="btn" type="button" data-m="' + k + '" aria-pressed="' + (mode === k) + '">' + MODES[k] + '</button>'; }).join('')
        + (mode !== 'anon' ? '<label class="sizebox">인원 <input type="text" inputmode="numeric" data-a="size" value="' + (c.size || 30) + '" aria-label="반 인원"> 명</label>' : '') + '</div>'
        + ((c.classes || []).length ? '' : '<details><summary>차시 바로 시작</summary><ul class="lessons">' + lessonsHtml(c) + '</ul></details>')
        + '<details><summary>수업방 지우기</summary><p class="small">지우면 클래스룸에 올린 링크로 들어와도 열리지 않고, 반마다 지난 수업 기록도 사라져요. 되돌릴 수 없어요. 들어와 있는 학생 화면에는 «수업방이 끝났어요»가 떠요.</p>'
        + '<div class="row"><button class="btn warn" type="button" data-a="del">이 수업방 지우기</button></div></details>'
        + '</div>';
    }).join('');
    box.querySelectorAll('[data-i]').forEach(function (card) {
      var c = load()[+card.dataset.i];
      status(card, c);
      card.querySelector('[data-a="copy"]').onclick = function (e) { copy(BASE + 'join.html?room=' + c.code, e.currentTarget); };
      card.querySelector('[data-a="del"]').onclick = function (e) {
        var b = e.currentTarget;
        if (!armed(b, '한 번 더 누르면 «' + (c.name || '수업방') + '»을 지워요', '이 수업방 지우기')) return;
        b.disabled = true;
        var gone = function () { save(load().filter(function (x) { return x.code !== c.code; })); msg('«' + (c.name || '수업방') + '» 수업방을 지웠어요.'); render(); };
        post(c.code + '/delete', { key: c.key }).then(function (j) {
          if (!j.error) { gone(); return; }
          // 이미 닫힌 방이면 목록에서만 뺀다
          fetch(API + '/rooms/' + c.code).then(function (r) { return r.json(); }).then(function (info) { if (!info.open) gone(); else { msg(j.error); b.disabled = false; } }, function () { msg(j.error); b.disabled = false; });
        }).catch(function () { msg('지우지 못했어요. 인터넷 연결을 확인해 주세요.'); b.disabled = false; });
      };
      card.querySelector('[data-a="rename"]').onclick = function () {
        var head = card.querySelector('[data-head]');
        head.innerHTML = '<form class="form" data-a="namef"><label class="grow">수업방 이름<input type="text" maxlength="30" value="' + esc(c.name || '') + '" autocomplete="off"></label><button class="btn main" type="submit">저장</button><button class="btn" type="button" data-a="cancel">취소</button></form><p class="small" aria-live="polite" data-a="namemsg">학생 화면·클래스룸 링크는 그대로이고, 이름만 바뀌어요.</p>';
        var f = head.querySelector('form'), inp = f.querySelector('input'), say = function (t) { head.querySelector('[data-a="namemsg"]').textContent = t; };
        inp.focus(); inp.select();
        f.querySelector('[data-a="cancel"]').onclick = function () { render(); };
        f.onsubmit = function (e) {
          e.preventDefault();
          var v = inp.value.replace(/\\s+/g, ' ').trim();
          if (!v) { say('이름을 넣어 주세요.'); return; }
          say('바꾸는 중…');
          post(c.code + '/settings', { key: c.key, name: v }).then(function (j) {
            if (j.error) { say(j.error); return; }
            update(c.code, { name: j.name || v }); render();
            msg('이름을 바꿨어요: «' + (j.name || v) + '». 들어와 있는 학생 화면에도 바로 바뀌어요.');
          }).catch(function () { say('바꾸지 못했어요. 인터넷 연결을 확인해 주세요.'); });
        };
      };
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
    });
  }

  // ---- 선생님 로그인 카드: 로그인 전 / 가입 전·신청 / 승인 기다림 / 승인됨 ----
  function meMsg(t) { document.getElementById('memsg').textContent = t; }
  var ST = { none: '가입 전', pending: '승인 기다림', denied: '신청이 받아들여지지 않음', revoked: '승인 해제됨' };
  function meCard() {
    var box = document.getElementById('mebox'), s = sess();
    if (!s) {
      var old = myRooms().length;
      box.innerHTML = '<p class="muted">학교나 개인 구글 계정으로 로그인해요. 처음이면 가입 신청을 하고, 승인되면 어느 기기에서든 내 수업방이 보여요.</p>'
        + (old ? '<p class="small">이 기기에 있던 수업방 ' + old + '개는 로그인하면 이 계정으로 옮겨져요.</p>' : '') + '<div id="gbtn"></div>';
      googleButton(document.getElementById('gbtn'), function (who, err, busy) { if (busy) { meMsg(err); return; } if (!who) { meMsg(err); return; } meMsg(''); renderAll(); });
      return;
    }
    var who = '<b>' + esc(s.name || s.email) + '</b>' + (s.name ? ' · ' + esc(s.email) : '');
    var out = '<button class="btn" type="button" id="logout">로그아웃</button>';
    if (s.status === 'approved') {
      box.innerHTML = '<p class="muted">' + who + '(으)로 로그인돼 있어요' + (s.admin ? ' · 관리자' : '') + '.</p>'
        + (s.admin && s.pending ? '<p><a class="tag next" href="#admin">가입 신청 ' + s.pending + '건이 승인을 기다려요 ↓</a></p>' : '') + '<div class="row">' + out + '</div>';
    } else if (s.status === 'pending') {
      box.innerHTML = '<p class="muted">' + who + ' · <b class="tag next">승인 기다림</b></p><p class="muted">가입 신청을 보냈어요. 관리하는 선생님이 승인하면 이 페이지가 저절로 바뀌어요(30초마다 확인해요).</p><div class="row"><button class="btn main" type="button" id="recheck">승인됐는지 다시 보기</button>' + out + '</div>';
      document.getElementById('recheck').onclick = function () { meMsg('확인하는 중…'); syncMe().then(function () { meMsg(sess() && sess().status === 'approved' ? '승인됐어요!' : '아직 승인 전이에요.'); renderAll(); }); };
    } else {
      box.innerHTML = '<p class="muted">' + who + ' · <b class="tag">' + (ST[s.status] || '가입 전') + '</b></p>'
        + '<p class="muted">' + (s.status === 'revoked' ? '승인이 해제됐어요. 다시 쓰려면 관리하는 선생님께 문의하거나 다시 신청해 주세요.' : s.status === 'denied' ? '지난 신청이 받아들여지지 않았어요. 내용을 고쳐 다시 신청할 수 있어요.' : '수업방을 만들고 수업하려면 가입 신청을 해 주세요. 관리하는 선생님이 승인하면 바로 쓸 수 있어요.') + '</p>'
        + '<form class="form" id="signup"><label class="grow">이름<input type="text" id="su-name" maxlength="20" autocomplete="name" value="' + esc(s.name || '') + '"></label>'
        + '<label class="grow">학교<input type="text" id="su-school" maxlength="40" placeholder="예: 한민고등학교" autocomplete="organization"></label>'
        + '<label class="grow">가르치는 과목·한 마디(선택)<input type="text" id="su-note" maxlength="120" placeholder="예: 통합과학 2학년" autocomplete="off"></label>'
        + '<button class="btn main" type="submit">가입 신청</button></form><div class="row">' + out + '</div>';
      document.getElementById('signup').onsubmit = function (e) {
        e.preventDefault();
        var b = { session: s.token, dev: devId(), have: have(), name: document.getElementById('su-name').value, school: document.getElementById('su-school').value, note: document.getElementById('su-note').value };
        if (!b.name.trim() || !b.school.trim()) { meMsg('이름과 학교를 넣어 주세요.'); return; }
        meMsg('보내는 중…');
        api('/signup', b).then(function (j) { if (j.login) { signedOut(); renderAll(); return; } if (j.error) { meMsg(j.error); return; } keep(j); meMsg(''); renderAll(); }, function () { meMsg('보내지 못했어요. 인터넷 연결을 확인해 주세요.'); });
      };
    }
    document.getElementById('logout').onclick = function (e) {
      if (!armed(e.currentTarget, '한 번 더 누르면 로그아웃해요', '로그아웃')) return;
      meMsg('로그아웃하는 중…'); logout().then(function () { meMsg('로그아웃했어요. 이 기기의 진행 열쇠도 지웠어요.'); renderAll(); });
    };
  }

  // ---- 가입 신청 관리(관리자만) ----
  function adminMsg(t) { document.getElementById('adminmsg').textContent = t; }
  function adminCard(users, admins) {
    var card = document.getElementById('admin'), s = sess();
    card.hidden = !(s && s.admin);
    if (card.hidden) return;
    if (!users) { api('/admin/list', { session: s.token }).then(function (j) { if (j.users) adminCard(j.users, j.admins); else adminMsg(j.error || '명단을 불러오지 못했어요.'); }, function () { adminMsg('명단을 불러오지 못했어요.'); }); return; }
    var row = function (u, acts) {
      return '<li><span><b>' + esc(u.name || u.email) + '</b>' + (u.school ? ' · ' + esc(u.school) : '') + '<br><span class="small">' + esc(u.email) + (u.note ? ' · ' + esc(u.note) : '') + '</span></span><span class="row">'
        + acts.map(function (a) { return '<button class="btn' + (a[0] === 'approve' ? ' main' : a[0] === 'deny' || a[0] === 'revoke' ? ' warn' : '') + '" type="button" data-e="' + esc(u.email) + '" data-act="' + a[0] + '">' + a[1] + '</button>'; }).join('') + '</span></li>';
    };
    var by = function (st) { return users.filter(function (u) { return u.status === st; }); };
    var pend = by('pending'), ok = by('approved'), rest = users.filter(function (u) { return u.status === 'denied' || u.status === 'revoked'; });
    document.getElementById('adminbox').innerHTML =
      '<p class="muted">' + (pend.length ? '새 가입 신청 <b>' + pend.length + '</b>건' : '새 가입 신청이 없어요.') + '</p>'
      + (pend.length ? '<ul class="lessons">' + pend.map(function (u) { return row(u, [['approve', '승인'], ['deny', '거절']]); }).join('') + '</ul>' : '')
      + '<details' + (ok.length ? '' : ' open') + '><summary>승인된 선생님 ' + ok.length + '명</summary><ul class="lessons">' + ok.map(function (u) { return row(u, [['revoke', '승인 해제']]); }).join('') + '</ul>'
      + '<p class="small">관리자: ' + esc((admins || []).join(', ')) + ' (늘 승인돼 있어요)</p></details>'
      + (rest.length ? '<details><summary>거절·해제 ' + rest.length + '명</summary><ul class="lessons">' + rest.map(function (u) { return row(u, [['approve', '승인']]); }).join('') + '</ul></details>' : '')
      + '<form class="form" id="addt"><label class="grow">신청 없이 바로 더하기(구글 계정 이메일)<input type="email" id="addt-email" maxlength="200" autocomplete="off" placeholder="teacher@example.com"></label><button class="btn" type="submit">승인해 더하기</button></form>';
    var decide = function (email, action) {
      adminMsg('바꾸는 중…');
      api('/admin/decide', { session: s.token, email: email, action: action }).then(function (j) { if (j.error) { adminMsg(j.error); return; } adminMsg(email + ' · ' + { approve: '승인했어요', deny: '거절했어요', revoke: '승인을 해제했어요' }[action]); adminCard(j.users, j.admins); }, function () { adminMsg('바꾸지 못했어요. 인터넷 연결을 확인해 주세요.'); });
    };
    document.querySelectorAll('#adminbox [data-act]').forEach(function (b) {
      b.onclick = function () {
        if (b.dataset.act !== 'approve' && !armed(b, '한 번 더 누르면 ' + b.textContent, b.textContent)) return;
        decide(b.dataset.e, b.dataset.act);
      };
    });
    document.getElementById('addt').onsubmit = function (e) {
      e.preventDefault();
      var v = document.getElementById('addt-email').value.trim().toLowerCase();
      if (!/^[^@\s]+@[^@\s]+$/.test(v)) { adminMsg('이메일을 확인해 주세요.'); return; }
      decide(v, 'approve');
    };
  }

  // ---- 수업방 만들기(승인된 선생님) ----
  var idmode = document.getElementById('idmode');
  idmode.onchange = function () { document.getElementById('sizeWrap').hidden = idmode.value === 'anon'; };
  document.getElementById('make').onsubmit = function (e) {
    e.preventDefault();
    var name = document.getElementById('name').value.trim(), s = sess();
    if (!name) { msg('이름을 넣어 주세요.'); return; }
    if (!API) { msg('수업방 주소가 없어요.'); return; }
    if (!s) { msg('먼저 위에서 구글로 로그인해 주세요.'); return; }
    msg('만드는 중…');
    var mode = idmode.value, size = parseInt(document.getElementById('size').value, 10) || 30, cls = parseCls(document.getElementById('cls').value);
    api('/rooms', { session: s.token, persist: true, name: name, idMode: mode, size: size, classes: cls }).then(function (j) {
      if (j.login) { signedOut(); renderAll(); msg('로그인이 풀렸어요. 다시 로그인해 주세요.'); return; }
      if (!j.code || !j.key) { msg(j.error || '만들지 못했어요.'); return; }
      var got = j.classes || [];
      var l = load(); l.push({ code: j.code, key: j.key, name: j.name || name, idMode: j.idMode || mode, size: j.size || size, classes: got }); save(l);
      document.getElementById('name').value = ''; document.getElementById('cls').value = '';
      msg(name + ' 수업방을 만들었어요. ' + (got.length ? '과목 링크를 ' + got.join(', ') + ' 클래스룸에 올려 두세요.' : '반 링크를 그 반 클래스룸에 올려 두세요.') + (got.length < cls.length ? ' (반 이름은 글자·숫자로 10자 안, 16개까지예요.)' : '')); render();
    }, function () { msg('만들지 못했어요. 인터넷 연결을 확인해 주세요.'); });
  };

  // 화면 전체: 로그인 상태에 따라 카드를 보이고 숨긴다
  function renderAll() {
    var s = sess(), ok = !!(s && s.status === 'approved');
    meCard(); adminCard();
    document.getElementById('makecard').hidden = !ok;
    document.getElementById('classes').hidden = !ok;
    if (ok) render(); else document.getElementById('classes').innerHTML = '';
  }
  renderAll();
  if (sess()) syncMe().then(renderAll, renderAll);                  // 다른 기기에서 만든 수업방·승인 여부를 맞춘다
  // 승인을 기다리는 동안 30초마다 확인해 승인되면 저절로 열어 준다
  setInterval(function () {
    var s = sess(); if (!s || s.status !== 'pending' || document.hidden) return;
    syncMe().then(function (n) { if (n && n.status === 'approved') { renderAll(); meMsg('승인됐어요! 이제 수업방을 만들 수 있어요.'); } });
  }, Number(qs.get('poll')) || 30000);                              // ?poll=은 시험용
})();
</script>
</body>
</html>
`;
}
