import { existsSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
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
.wrap { max-width: 880px; margin: 0 auto; padding-block: 36px 48px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); display: grid; grid-template-columns: minmax(0, 1fr); gap: 20px; }
.brand { margin: 0; font-size: 13px; font-weight: 700; letter-spacing: .18em; color: var(--accent); }
.brand a { color: inherit; text-decoration: none; }
a { color: var(--accent); }
h1 { margin: 0; font: 800 clamp(30px, 6vw, 46px)/1.1 var(--f-display); text-wrap: balance; }
h2 { margin: 0; font: 700 22px/1.3 var(--f-display); text-wrap: balance; }
.card { background: var(--paper-2); border: 2px solid var(--ink); border-radius: 10px; padding: 18px 20px; display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; min-width: 0; }
.card.big { box-shadow: 6px 6px 0 var(--ink); }
.muted { color: var(--ink-2); margin: 0; }
.small { font-size: 14px; color: var(--ink-3); margin: 0; }
.apptip { border: 2px dashed var(--ink-3); border-radius: 8px; padding: 10px 12px; display: flex; flex-wrap: wrap; align-items: center; gap: 8px 12px; }
.apptip p { margin: 0; font-size: 14px; color: var(--ink-2); flex: 1 1 260px; }
.apptip .appcode { font-size: 16px; letter-spacing: .1em; color: var(--ink); }
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
/* 차시 목록: 단원(주제)마다 묶음 */
.ugroups { display: grid; gap: 22px; }
.ugroup { border: 2px solid var(--ink); border-radius: 10px; background: var(--paper); padding: 12px 16px 14px; display: grid; gap: 10px; min-width: 0; }
.uhead { margin: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; font: 700 20px/1.3 var(--f-display); }
.subjl { margin: 6px 0 -8px; font: 800 26px/1.2 var(--f-display); }
.uhead .ucode { font: 700 13px/1 var(--f-body); letter-spacing: .04em; color: var(--paper-2); background: var(--accent); border-radius: 999px; padding: 5px 10px; }
.uhead .ucount { margin-left: auto; font: 600 13px/1.3 var(--f-body); color: var(--ink-3); }
.ugroup ul.lessons li:first-child { border-top: 0; padding-top: 0; }
.ugroup ul.lessons li { flex-wrap: nowrap; }
.ugroup ul.lessons li > span { flex: 1 1 auto; min-width: 0; }
.ugroup ul.lessons li > .btn { flex: 0 0 auto; }
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
/* 선생님 페이지 */
.topnav { display: flex; flex-wrap: wrap; gap: 8px 10px; align-items: center; }
.topnav .brand { margin-left: auto; }   /* 단추는 왼쪽에 모으고 이름만 오른쪽 */
.pagehead { display: grid; gap: 8px; }
.stack { display: grid; gap: 16px; grid-template-columns: minmax(0, 1fr); }   /* 안의 긴 글·표·고르기 칸이 화면 밖으로 밀지 않게 */
.h2 { font: 700 22px/1.3 var(--f-display); }
.acct { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 8px 12px; }
.acct .tag { margin-left: 4px; }
details.fold { border-top: 0; padding-top: 0; }
details.fold > summary { list-style: none; display: flex; flex-wrap: wrap; align-items: center; gap: 6px 12px; color: var(--ink); }
details.fold > summary::-webkit-details-marker { display: none; }
details.fold > summary::after { content: '▾'; margin-left: auto; font-size: 18px; color: var(--ink-3); transition: transform .15s; }
details.fold:not([open]) > summary::after { transform: rotate(-90deg); }
details.fold[open] > summary { margin-bottom: 12px; }
.fold-body { display: grid; gap: 12px; }
.roomhead { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px 16px; }
.linkhead { display: flex; flex-wrap: wrap; align-items: baseline; gap: 2px 10px; margin: 0; }
.label { font: 700 15px/1.3 var(--f-body); color: var(--ink); }
.setbox { display: grid; gap: 16px; }
.field { display: grid; gap: 6px; }
.flabel { font: 600 14px/1.3 var(--f-body); color: var(--ink-2); }
.makeform { display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.5fr) auto auto auto; gap: 12px; align-items: end; }
.makeform label { display: grid; gap: 4px; font: 600 14px/1.3 var(--f-body); color: var(--ink-2); min-width: 0; }
.makeform input, .makeform select { width: 100%; }
input[type=text], input[type=email], select { min-height: 48px; }
.opt { font-weight: 500; color: var(--ink-3); }
.steps { margin: 0; padding-left: 1.3em; display: grid; gap: 6px; color: var(--ink-2); }
#msg:empty, .card p.small:empty { display: none; }
.makeform .btn { min-height: 48px; }
select { height: 48px; max-width: 100%; min-width: 0; }
.row > select { flex: 1 1 0; }   /* 긴 차시 이름이 폰 화면 밖으로 밀지 않게 */
#msg { margin: 0; padding: 8px 12px; border-radius: 8px; background: var(--accent-soft); color: var(--accent); font-weight: 600; }
@media (max-width: 720px) {
  .makeform { grid-template-columns: 1fr 1fr; }
  .makeform label:nth-child(-n+2), .makeform button { grid-column: 1 / -1; }
}
</style>
</head>`;

const lessonList = (units) => units.flatMap((u) => u.lessons.map((l) => ({ ...l, unit: u.unit, unitTitle: u.unitTitle, subject: u.subject, path: l.student.replace(/\/student\.html$/, '') })));
const lessonData = (lessons) => JSON.stringify(lessons.map((l) => ({ subject: l.subject, unit: l.unit, unitTitle: l.unitTitle, n: l.n, title: l.title, path: l.path, student: l.student, teacher: l.teacher })));

// 선생님 로그인(구글)·이 기기의 수업방 열쇠 — join.html과 teach.html이 같이 쓴다. 바깥 스크립트에 API·GID가 있어야 한다
// (템플릿 안에 그대로 들어가므로 이 안에는 달러+중괄호를 쓰지 않는다)
const AUTH_JS = String.raw`
  var SESS = 'science-room:session', ROOMS = 'science-room:classes';
  function stored(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
  function store(k, v) { try { if (v == null) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } }
  function sess() { var s = stored(SESS); return s && s.token ? s : null; }          // { token, email, name, status, admin, pending, school }
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
    store(SESS, { token: token || s.token, email: j.email, name: j.name || s.name || '', status: j.status, admin: !!j.admin, pending: j.pending || 0, school: j.school || s.school || '' });
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
  <nav class="topnav"><a class="btn small" href="index.html">← 자료실 첫 화면</a><img class="brand" src="brand/frame.svg" alt="${esc(site.name)}" style="height:78px;margin-block:-26px -10px"></nav>
  <h1 id="title">수업방</h1>
  <div class="card big" id="app" aria-live="polite"><p class="muted">확인하는 중…</p></div>
  <div class="card" id="lib" hidden>
    <h2 id="libTitle">차시 목록</h2>
    <div class="ugroups" id="list"></div>
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
  function uhead(l) { var n = LESSONS.filter(function (x) { return x.unit === l.unit; }).length, first = LESSONS.filter(function (x) { return x.subject === l.subject; })[0]; return (first && first.unit === l.unit && l.subject ? '<h3 class="subjl">' + esc(l.subject) + '</h3>' : '') + '<section class="ugroup"><h3 class="uhead"><span class="ucode">' + esc(l.unit) + '</span>' + esc(l.unitTitle) + '<span class="ucount">' + n + '차시</span></h3><ul class="lessons">'; }
  function nextOf(path) { for (var i = 0; i < LESSONS.length - 1; i++) if (LESSONS[i].path === path) return LESSONS[i + 1].path; return null; }
  var cid; try { cid = localStorage.getItem('science-room:cid'); if (!cid) { cid = 's-' + Array.from(crypto.getRandomValues(new Uint8Array(12)), function (b) { return b.toString(16).padStart(2, '0'); }).join(''); localStorage.setItem('science-room:cid', cid); } } catch (e) { cid = 's-' + Math.random().toString(36).slice(2); }
  // 이 기기에 이 반의 진행 열쇠가 있으면 선생님 화면(같은 링크). ?as=student 이면 학생 화면 미리 보기(연결·학생 수에 안 들어감)
  var mine = null; try { mine = (JSON.parse(localStorage.getItem('science-room:classes')) || []).filter(function (c) { return c.code === code; })[0] || null; } catch (e) {}
  var preview = !!mine && qs.get('as') === 'student';
  var teacher = !!mine && !preview;
  var ME = 'science-room:me:' + code;
  // 아이폰·아이패드 사파리: 홈 화면 앱은 저장 공간이 따로라, 앱에서 이 반 코드나 링크를 한 번 넣게 안내한다
  var IOS = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  var INAPP = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
  function appTip() { return IOS && !INAPP && /^\\d{6}$/.test(code) ? '<div class="apptip"><p><b>홈 화면 앱으로 쓰나요?</b> 앱 첫 화면의 참여 칸에 이 반 코드(<b class="appcode">' + code + '</b>)나 링크를 넣으면, 다음부터 앱에서 바로 들어와요.</p><button class="btn small" type="button" id="copylink">링크 복사</button></div>' : ''; }
  function wireTip() { var b = $('copylink'); if (!b) return; b.onclick = function () { var u = location.href.split(/[?#]/)[0] + '?room=' + code; var ok = function () { b.textContent = '복사했어요'; }; if (navigator.clipboard) navigator.clipboard.writeText(u).then(ok, function () { prompt('복사해서 쓰세요', u); }); else prompt('복사해서 쓰세요', u); }; }
  function getMe() { try { return JSON.parse(localStorage.getItem(ME)); } catch (e) { return null; } }
  // seat: 방이 알린 번호 겹침 { taken: 번호 }(다른 기기가 이미 그 번호) · { moved: 번호 }(다른 기기가 이 기기 번호로 들어옴)
  // takeSeat: 다음 연결에서 내 번호를 이 기기로 옮긴다(«이 기기로 옮기기»)
  var seat = null, takeSeat = false;
  function idQuery() { var m = getMe(); return (m ? (m.cls ? '&cls=' + encodeURIComponent(m.cls) : '') + (m.num ? '&num=' + m.num : '') + (m.name ? '&name=' + encodeURIComponent(m.name) : '') : '') + (takeSeat ? '&take=1' : ''); }
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
    var old = getMe() || {}, cls = list.indexOf(old.cls) >= 0 ? old.cls : null, what = withName ? '번호와 이름' : '번호', take = false;
    var lead = seat && seat.taken ? '<b>' + seat.taken + '번</b>은 다른 기기에서 이미 들어와 있어요. 번호가 맞는지 확인해 주세요. 내 번호가 맞으면 «이 기기로 옮기기»를 눌러요.'
      : seat && seat.moved ? '다른 기기가 <b>' + seat.moved + '번</b>으로 들어와서 이 기기의 번호가 빠졌어요. 이 기기로 계속하려면 번호를 다시 넣어 주세요.'
      : list.length ? (withNum ? '우리 반을 고르고 ' + what + '을 넣어요.' : '우리 반을 골라요.') + ' 처음 한 번만 하면 돼요.' : '선생님이 ' + what + '을 받기로 했어요. 처음 한 번만 넣으면 돼요.';
    show('<h2>' + esc(info.name || '반') + ' 수업방</h2><p class="muted">' + lead + '</p>'
      + '<form id="idf" style="display:grid;gap:10px">'
      + (list.length ? '<div class="row" role="group" aria-label="우리 반">' + list.map(function (c) { return '<button class="btn" type="button" data-c="' + esc(c) + '" aria-pressed="' + (c === cls) + '">' + esc(c) + '</button>'; }).join('') + '</div>' : '')
      + (withNum ? '<div class="row"><input type="text" inputmode="numeric" id="num" placeholder="번호" aria-label="번호" style="flex:0 1 110px" value="' + (old.num || '') + '">' + (withName ? '<input type="text" id="nm" maxlength="12" placeholder="이름" aria-label="이름" autocomplete="off" style="flex:1 1 160px" value="' + esc(old.name || '') + '">' : '') + '<button class="btn main" type="submit">들어가기</button>' + (seat && seat.taken ? '<button class="btn" type="button" id="take">이 기기로 옮기기</button>' : '') + '</div>' : '')
      + '</form><p class="small" id="idm" aria-live="polite"></p>');
    var form = $('idf');
    if ($('take')) $('take').onclick = function () { take = true; done(); take = false; };
    function done() {
      var num = withNum ? parseInt($('num').value, 10) : null, name = withName ? $('nm').value.replace(/\\s+/g, ' ').trim() : '';
      if (list.length && !cls) { $('idm').textContent = '우리 반을 먼저 골라 주세요.'; return; }
      if (withNum && !(num >= 1 && num <= 99)) { $('idm').textContent = '번호를 1~99 사이로 넣어 주세요.'; return; }
      if (withName && !/^[\\p{L} ]{1,12}$/u.test(name)) { $('idm').textContent = '이름을 글자로 12자 안에서 넣어 주세요.'; return; }
      try { localStorage.setItem(ME, JSON.stringify({ cls: cls, num: num, name: name })); } catch (x) {}
      seat = null; if (take) takeSeat = true;
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
  function go(path) { if (gone) return; gone = true; location.replace((path.indexOf('deck/') === 0 ? 'deck.html?d=' + path.slice(5) + '&role=student&' : path + '/student.html?') + 'room=' + code + pass); }
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
      if (l.unit !== unit) { html += (unit ? '</ul></section>' : '') + uhead(l); unit = l.unit; }
      var href = teacher ? l.teacher + tq() : l.student + (withRoom ? '?room=' + code + pass : '');
      var tag = mark.now === l.path ? '<b class="tag now">지금 수업 중</b>' : mark.next === l.path ? '<b class="tag next">다음 차시</b>' : mark.last === l.path ? '<b class="tag">지난 수업</b>' : '';
      var main = mark.now === l.path || (teacher ? mark.next === l.path : mark.last === l.path);
      html += '<li><span>' + esc(l.n + '차시 ' + l.title) + tag + '</span><a class="btn' + (main ? ' main' : '') + '" href="' + esc(href) + '">' + (teacher ? (mark.now === l.path ? '이어서 하기' : '수업 시작') : '열기') + '</a></li>';
    });
    $('list').innerHTML = html + (unit ? '</ul></section>' : '');
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
  var ws = null, tries = 0, pongAt = 0, pongSeen = false;
  function listen() {
    if (teacher || preview) return;                      // 선생님 화면·미리 보기는 듣지 않는다(학생 수로 세지 않게)
    var sock;
    try { sock = ws = new WebSocket(API.replace(/^http/, 'ws') + '/rooms/' + code + '/ws?role=student&cid=' + cid + idQuery() + '&hb=1'); } catch (e) { return; }
    takeSeat = false;
    ws.onopen = function () { tries = 0; pongAt = Date.now(); sock.send(JSON.stringify({ t: 'where', path: 'library', h: 0 })); };
    ws.onmessage = function (e) {
      if (e.data === 'pong') { pongAt = Date.now(); pongSeen = true; return; }
      var m; try { m = JSON.parse(e.data); } catch (x) { return; }
      if (m.t === 'state' && forMe(m.lesson)) go(m.lesson.path);          // 우리 반 수업만 따라간다
      if (m.t === 'lesson' && forMe(m)) go(m.path);
      if (m.t === 'summon' && m.path && forMe(m)) go(m.path);
      if (m.t === 'classes') check();
      if (m.t === 'seat') {                                                // 같은 번호로 다른 기기가 있다 · 내 번호가 다른 기기로 갔다
        if (m.moved) { var w = getMe() || {}; w.num = null; w.name = ''; try { localStorage.setItem(ME, JSON.stringify(w)); } catch (x) {} }
        seat = m; drop(); check();
      }
    };
    ws.onclose = function () { if (!gone && ws === sock) setTimeout(check, Math.min(10000, 1000 * Math.pow(2, tries++))); };
  }
  // 연결을 끊고 다시 붙기를 하지 않는다(번호를 다시 받거나 새로 붙을 때)
  function drop() { var w = ws; ws = null; if (w) { w.onclose = null; try { w.close(); } catch (x) {} } }
  // 연결 확인: 25초마다 'ping'(방이 'pong'으로 자동 응답). 70초 넘게 답이 없거나, 화면이 다시 보였을 때 4초 안에 답이 없으면 새로 붙는다
  setInterval(function () {
    if (ws && ws.readyState > 1) { drop(); check(); return; }            // 방이 닫았는데 닫힘이 끝나지 않은 연결
    if (!ws || ws.readyState !== 1) return;
    if (pongSeen && Date.now() - pongAt > 70000) { drop(); check(); return; }
    try { ws.send('ping'); } catch (x) {}
  }, 25000);
  document.addEventListener('visibilitychange', function () {
    if (!document.hidden && ws && ws.readyState > 1) { drop(); check(); return; }
    if (document.hidden || !ws || ws.readyState !== 1 || !pongSeen) return;
    var sent = Date.now(); try { ws.send('ping'); } catch (x) {}
    setTimeout(function () { if (ws && ws.readyState === 1 && pongAt < sent) { drop(); check(); } }, 4000);
  });
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
      if (seat || needId(info)) { askId(info, check); return; }
      if (forMe(info.lesson)) { go(info.lesson.path); return; }          // 우리 반 수업 중에는 복습 목록 없이 바로 수업으로
      var who = getMe() || {}, mc = myCls(info), lastI = lastOf(info, mc), lastL = lastI ? find(lastI.path) : null;
      var tag = [mc ? esc(mc) : '', info.idMode && info.idMode !== 'anon' && who.num ? who.num + '번' + (who.name ? ' ' + esc(who.name) : '') : ''].filter(Boolean).join(' ');
      show('<h2><span class="dot" aria-hidden="true"></span>지금은 복습 시간이에요</h2><p class="muted">아래 차시를 자유롭게 열어 볼 수 있어요. 선생님이 ' + (mc ? '우리 반 ' : '') + '수업을 시작하면 어느 화면에 있든 저절로 수업 차시로 넘어가요.</p>'
        + (lastL ? '<div class="row"><a class="btn main" href="' + esc(lastL.student + '?room=' + code + pass) + '">지난 수업 다시 보기 · ' + esc(lastL.n + '차시 ' + lastL.title) + '</a></div>' : '')
        + '<p class="small">' + (tag ? '이 기기는 <b>' + tag + '</b> 학생으로 들어와 있어요. <a href="#" id="reid">바꾸기</a>' : '이름은 보내지 않아요.') + '</p>' + appTip());
      wireTip();
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

// 우리 반 수업 통계 탭(2026-11-13, 수업방/src/stats.mjs의 POST /stats/list). teachPage 스크립트 안에 들어간다(sess·api·esc·find·label을 쓴다)
// 이 안에는 달러+중괄호를 쓰지 않는다
const STATS_JS = String.raw`
  var ST = null, STIX = {};
  function stMsg(t) { document.getElementById('stmsg').textContent = t; }
  function pc(x) { return x == null ? '—' : Math.round(x * 100) + '%'; }
  function avg(a) { a = a.filter(function (x) { return x != null; }); return a.length ? a.reduce(function (s, x) { return s + x; }, 0) / a.length : null; }
  function stKey(r) { return r.room.length === 4 ? 'once' : r.room + '|' + (r.cls || ''); }
  function stName(r) { return r.room.length === 4 ? '한 번 쓰는 방' : (r.room_name || '반 방 ' + r.room) + (r.cls ? ' · ' + r.cls : ''); }
  function two(n) { return String(n).padStart(2, '0'); }
  function hm(t) { var d = new Date(t); return two(d.getHours()) + ':' + two(d.getMinutes()); }
  function md(t) { var d = new Date(t); return (d.getMonth() + 1) + '/' + d.getDate(); }
  function day(t) { var d = new Date(t); return md(t) + '(' + '일월화수목금토'[d.getDay()] + ') ' + hm(t); }
  function lname(r) { var l = find(r.path); return l ? label(l) : (r.title || r.path); }
  function lshort(r) { var l = find(r.path); return l ? l.unit + ' ' + l.n + '차시' : r.path; }
  // 응답률: 문항마다 답한 기기 / 들어온 기기의 평균 · 퀴즈 정답률: 판마다 정답률을 참여 인원으로 가중 평균
  function resp(r) { return r.asks.length && r.devices ? avg(r.asks.map(function (a) { return Math.min(1, a[2] / r.devices); })) : null; }
  function qsum(r) { var n = 0, d = 0, w = 0, acc = 0; r.quiz.forEach(function (q) { n += q.n; d += q.done; if (q.acc != null) { w += q.n; acc += q.acc * q.n; } }); return { n: n, d: d, acc: w ? acc / w / 100 : null }; }
  // 장 번호: 장/<과목>.<단원>/index.json의 장 순서(없으면 장 id 그대로)
  function stIx(path) {
    var m = String(path).split('/'), k = m[0] + '.' + m[1];
    if (!STIX[k]) STIX[k] = fetch('장/' + k + '/index.json').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
    return STIX[k];
  }
  function slideOf(ix, path, sec) {
    var m = String(path).split('/'), l = ix && (ix.lessons || []).filter(function (x) { return String(x.n) === m[2]; })[0];
    var i = l ? l.slides.indexOf(m[0] + '.' + m[1] + '.' + m[2] + '.' + sec) : -1;
    return i >= 0 ? (i + 1) + '장' : sec ? '«' + sec + '» 장' : '';
  }
  // 퀴즈가 있던 장: 시작할 때 선생님이 보던 장 차례(h)
  function qAt(r, z) { return z.h != null ? (z.h + 1) + '장' : '<span data-sl="' + esc(r.path + '|' + z.id) + '"></span>'; }
  function qname(q) {
    if (/^w-/.test(q)) return '한 낱말 답';
    var m = q.match(/-(q(\d+)|pred(\w*)|flap|share|factors)$/); if (!m) return q;
    return m[2] ? '○× ' + m[2] + '번' : m[1].indexOf('pred') === 0 ? '예측' + (m[3] ? ' ' + m[3] : '') : { flap: '고르기', share: '생각 나누기', factors: '여럿 고르기' }[m[1]];
  }
  // 한 줄: 이름 · 막대 · 47% (7/15). kind: 'acc' 정답률(초록) | 'resp' 응답률(주황)
  function bar(name, p, n, of, kind, sub) {
    return '<li class="' + kind + '"><span class="st-lb">' + name + (sub ? '<span class="st-sub">' + sub + '</span>' : '') + '</span><span class="st-meter"><i style="width:' + Math.round((p || 0) * 100) + '%"></i></span><span class="st-v"><b>' + pc(p) + '</b> (' + n + '/' + of + ')</span></li>';
  }
  function statsCard() {
    var card = document.getElementById('statscard'), days = Number(document.getElementById('stdays').value);
    api('/stats/list', { session: sess().token, from: days ? Date.now() - days * 864e5 : 0 }).then(function (j) {
      if (j.http === 404) { card.hidden = true; return; }
      card.hidden = false;
      if (j.error) { stMsg(j.error); return; }
      ST = j; stMsg(''); stPick(); stDraw();
    }, function () { stMsg('통계를 불러오지 못했어요. 인터넷 연결을 확인해 주세요.'); });
  }
  function stPick() {
    var sel = document.getElementById('stcls'), was = sel.value, seen = {};
    var opts = ['<option value="">모든 반</option>'];
    ST.rows.forEach(function (r) { var k = stKey(r); if (!seen[k]) { seen[k] = 1; opts.push('<option value="' + esc(k) + '">' + esc(stName(r)) + '</option>'); } });
    sel.innerHTML = opts.join(''); if (seen[was]) sel.value = was;
  }
  function stDraw() {
    var k = document.getElementById('stcls').value, rows = ST.rows.filter(function (r) { return !k || stKey(r) === k; }), box = document.getElementById('stbox');
    var others = ST.others ? '<p class="small">관리자: 다른 선생님 수업 ' + ST.others + '번이 쌓여 있어요(내용은 그 선생님만 봐요).</p>' : '';
    if (!rows.length) { box.innerHTML = '<p class="small">이 기간에 쌓인 수업이 없어요. 수업방에서 수업하고 «수업 끝내기»를 누르면 여기에 보여요.</p>' + others; return; }
    var ra = avg(rows.map(resp)), qa = avg(rows.map(function (r) { return qsum(r).acc; })), aw = rows.reduce(function (s, r) { return s + r.away; }, 0);
    var kpi = function (v, t, cls) { return '<div class="st-k ' + (cls || '') + '"><b>' + v + '</b><span>' + t + '</span></div>'; };
    box.innerHTML = '<div class="st-kpi">' + kpi(rows.length, '수업') + kpi(pc(ra), '평균 응답률', 'resp') + kpi(pc(qa), '평균 퀴즈 정답률', 'acc') + kpi(aw + '번', '딴짓 알림') + '</div>'
      + '<section class="st-sec"><h3 class="st-h">차시를 거치며</h3>' + stLine(rows.slice().sort(function (a, b) { return a.started - b.started; })) + '</section>'
      + '<section class="st-sec"><h3 class="st-h">약한 문제 상위 5 <small>빠른 퀴즈 카드, 정답률 낮은 차례</small></h3>' + stWeak(rows) + '</section>'
      + '<section class="st-sec"><h3 class="st-h">성취기준별 퀴즈 정답률</h3><ul class="st-bars">' + stStd(rows) + '</ul></section>'
      + '<section class="st-sec"><h3 class="st-h">수업마다 <small>줄을 누르면 문항별로 펼쳐요</small></h3><div class="st-table"><div class="st-tr st-th" aria-hidden="true"><span>날짜</span><span>차시</span><span>반</span><span>학생</span><span>응답률</span><span>퀴즈 정답률</span><span>딴짓</span></div>' + rows.map(stRow).join('') + '</div></section>' + others;
    // 장 번호는 단원 장 목록을 받은 뒤에 채운다
    [].forEach.call(box.querySelectorAll('[data-sl]'), function (el) { var a = el.getAttribute('data-sl').split('|'); stIx(a[0]).then(function (ix) { el.textContent = slideOf(ix, a[0], a[1]); }); });
  }
  // 약한 문제: 같은 퀴즈 카드끼리 묶어 머리를 한 번만
  function stWeak(rows) {
    var by = {};
    rows.forEach(function (r) { r.quiz.forEach(function (q) { q.items.forEach(function (it) {
      var g = r.path + '|' + q.id, key = g + '|' + (it[3] || it[0]), x = by[key] || (by[key] = { label: it[0], t: 0, ok: 0, g: g, r: r, q: q });
      x.t += it[1]; x.ok += it[2];
    }); }); });
    var list = Object.keys(by).map(function (k) { return by[k]; }).filter(function (x) { return x.t && x.ok < x.t; });
    list.sort(function (a, b) { return (a.t < 2) - (b.t < 2) || a.ok / a.t - b.ok / b.t || b.t - a.t; });   // 한 명만 푼 카드는 뒤로
    if (!list.length) return '<p class="small">빠른 퀴즈를 하면 많이 틀린 카드가 여기에 보여요.</p>';
    var groups = [];
    list.slice(0, 5).forEach(function (x) { var g = groups.filter(function (y) { return y.g === x.g; })[0]; if (!g) groups.push(g = { g: x.g, r: x.r, q: x.q, xs: [] }); g.xs.push(x); });
    return groups.map(function (g) {
      return '<p class="st-grp">' + (g.q.title ? '«' + esc(g.q.title) + '» · ' : '빠른 퀴즈 · ') + esc(lshort(g.r)) + ' · ' + qAt(g.r, g.q) + '</p><ul class="st-bars">'
        + g.xs.map(function (x) { return bar(esc(x.label), x.ok / x.t, x.ok, x.t, 'acc'); }).join('') + '</ul>';
    }).join('');
  }
  function stStd(rows) {
    var by = {};
    rows.forEach(function (r) { var k = r.std || '', x = by[k] || (by[k] = { t: 0, ok: 0, units: {} }); var l = find(r.path); if (l) x.units[l.unit + ' ' + l.unitTitle] = 1; r.quiz.forEach(function (q) { q.items.forEach(function (it) { x.t += it[1]; x.ok += it[2]; }); }); });
    var list = Object.keys(by).filter(function (k) { return by[k].t; }).sort(function (a, b) { return by[a].ok / by[a].t - by[b].ok / by[b].t; });
    if (!list.length) return '<li class="small">빠른 퀴즈를 하면 성취기준마다 정답률이 모여요.</li>';
    return list.map(function (k) {
      var x = by[k], t = STDTXT[k] || '', short = t.length > 30 ? t.slice(0, 30) + '…' : t;
      return bar(esc(short || k || '성취기준 없음'), x.ok / x.t, x.ok, x.t, 'acc', esc([k, Object.keys(x.units).join(', ')].filter(Boolean).join(' · ')));
    }).join('');
  }
  function stRow(r) {
    var q = qsum(r), re = resp(r);
    var cell = function (cls, lab, v) { return '<span class="' + cls + '">' + (lab ? '<i>' + lab + ' </i>' : '') + v + '</span>'; };
    var head = '<summary class="st-tr">' + cell('c-d', '', day(r.started)) + cell('c-l', '', esc(lname(r))) + cell('c-c', '', esc(stName(r)))
      + cell('c-n', '학생', r.devices + '명') + cell('c-r', '응답', pc(re)) + cell('c-a', '정답', r.quiz.length ? pc(q.acc) : '—') + cell('c-w', '딴짓', r.away + '번') + '</summary>';
    var asks = r.asks.slice().sort(function (a, b) { return a[2] - b[2]; }).map(function (a) {
      return bar(esc(qname(a[0])) + (a[1] ? ' <span class="st-at" data-sl="' + esc(r.path + '|' + a[1]) + '"></span>' : ''), r.devices ? Math.min(1, a[2] / r.devices) : null, a[2], r.devices, 'resp');
    }).join('');
    var quiz = r.quiz.map(function (z) {
      var tried = z.items.filter(function (it) { return it[1]; }), skip = z.items.length - tried.length;
      return '<p class="st-grp">빠른 퀴즈' + (z.title ? ' «' + esc(z.title) + '»' : '') + ' · ' + qAt(r, z) + ' · ' + z.n + '명 참여 · ' + z.done + '명 완료 · 정답률 ' + (z.acc == null ? '—' : z.acc + '%') + '</p>'
        + '<ul class="st-bars">' + tried.sort(function (a, b) { return a[2] / a[1] - b[2] / b[1]; }).map(function (it) { return bar(esc(it[0]), it[2] / it[1], it[2], it[1], 'acc'); }).join('') + '</ul>'
        + (skip ? '<p class="small">아무도 풀지 않은 카드 ' + skip + '장은 뺐어요.</p>' : '');
    }).join('');
    return '<details class="st-row">' + head + '<div class="st-body">'
      + '<p class="small">' + day(r.started) + ' ~ ' + hm(r.ended) + ' · 최대 동시 ' + r.peak + '명 · 들어온 기기 ' + r.devices + '대 · 딴짓 알림 ' + r.away + '번(' + r.away_n + '명)' + (r.std ? ' · ' + esc(r.std) : '') + '</p>'
      + (asks ? '<p class="st-grp">문항별 응답률 · 답한 학생 / 들어온 학생</p><ul class="st-bars">' + asks + '</ul>' : '<p class="small">이 수업에는 학생이 답한 문항이 없어요.</p>')
      + quiz + '</div></details>';
  }
  // 꺾은선: 수업 차례대로 퀴즈 정답률·응답률. 점마다 차시와 날짜(같은 날이면 시각), 값은 점 옆에. 6개가 넘으면 옆으로 넘긴다
  function stLine(rows) {
    if (rows.length < 2) return '<p class="small">수업이 두 번 넘게 쌓이면 꺾은선으로 보여요.</p>';
    rows = rows.slice(-30);
    var n = rows.length, GAP = 108, L = 52, R = 56, T = 28, B = 58, H = 250, W = Math.max(600, L + R + GAP * (n - 1));
    var x = function (i) { return n > 5 ? L + GAP * i : L + (W - L - R) * i / (n - 1); }, y = function (v) { return T + (H - T - B) * (1 - v); };
    var g = [0, .5, 1].map(function (v) { return '<line x1="' + L + '" x2="' + (W - R + 24) + '" y1="' + y(v) + '" y2="' + y(v) + '" class="st-grid"/><text x="' + (L - 10) + '" y="' + y(v) + '" text-anchor="end" dominant-baseline="middle">' + v * 100 + '%</text>'; }).join('');
    var xl = rows.map(function (r, i) {
      var sameDay = (i > 0 && md(rows[i - 1].started) === md(r.started)) || (i < n - 1 && md(rows[i + 1].started) === md(r.started));
      var when = i > 0 && md(rows[i - 1].started) === md(r.started) ? hm(r.started) : md(r.started) + (sameDay ? ' ' + hm(r.started) : '');
      return '<text x="' + x(i) + '" y="' + (H - 32) + '" text-anchor="middle" class="st-xl">' + esc(lshort(r)) + '</text><text x="' + x(i) + '" y="' + (H - 12) + '" text-anchor="middle">' + when + '</text>';
    }).join('');
    var RV = rows.map(resp), AV = rows.map(function (r) { return qsum(r).acc; });
    var line = function (vals, cls, name, other) {
      var pts = vals.map(function (v, i) { return v == null ? null : [x(i), y(v), v, i]; }).filter(Boolean); if (!pts.length) return '';
      var dyOf = function (p) { var o = other[p[3]]; return o == null || p[2] > o || (p[2] === o && cls === 'acc') ? -12 : 22; };   // 높은 쪽 값은 점 위, 낮은 쪽은 점 아래
      return '<polyline class="' + cls + '" points="' + pts.map(function (p) { return p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ') + '"/>'
        + pts.map(function (p) { return '<circle class="' + cls + '" cx="' + p[0].toFixed(1) + '" cy="' + p[1].toFixed(1) + '" r="5"><title>' + esc(lname(rows[p[3]])) + ' · ' + name + ' ' + pc(p[2]) + '</title></circle><text class="st-pv ' + cls + '" x="' + p[0].toFixed(1) + '" y="' + (p[1] + dyOf(p)).toFixed(1) + '" text-anchor="middle">' + pc(p[2]) + '</text>'; }).join('');
    };
    return '<div class="st-legend"><span class="acc">퀴즈 정답률</span><span class="resp">응답률</span>' + (n > 6 ? '<span class="st-hint">옆으로 넘겨 지난 수업 보기</span>' : '') + '</div>'
      + '<div class="st-wrap">' + (n > 6 ? '<div class="st-yax" style="height:' + H + 'px">' + [0, .5, 1].map(function (v) { return '<span style="top:' + y(v) + 'px">' + v * 100 + '%</span>'; }).join('') + '</div>' : '') + '<div class="st-scroll"><svg class="st-chart" viewBox="0 0 ' + W + ' ' + H + '" style="' + (n > 6 ? 'width:' + W + 'px' : 'min-width:520px') + '" role="img" aria-label="수업마다 퀴즈 정답률과 응답률">' + g + xl
      + line(RV, 'resp', '응답률', AV) + line(AV, 'acc', '퀴즈 정답률', RV) + '</svg></div></div>';
  }
  document.getElementById('stcls').onchange = function () { if (ST) stDraw(); };
  document.getElementById('stdays').onchange = function () { statsCard(); };
`;

export function teachPage(site, units) {
  const lessons = lessonList(units);
  // 장 묶음이 있는(고칠 수 있는) 단원: 장/<과목>.<단원>/index.json
  const bundles = join(dirname(fileURLToPath(import.meta.url)), '장');
  const editable = existsSync(bundles) ? readdirSync(bundles).filter((d) => existsSync(join(bundles, d, 'index.json'))) : [];
  return `${head('선생님 페이지 · ' + site.name)}
<body>
<div class="wrap">
  <nav class="topnav"><a class="btn small" href="index.html">← 자료실 첫 화면</a><a class="btn small" href="board.html">선생님 게시판</a><img class="brand" src="brand/frame.svg" alt="${esc(site.name)}" style="height:78px;margin-block:-26px -10px"></nav>
  <header class="pagehead">
    <h1>선생님 페이지</h1>
    <p class="muted">과목마다 수업방을 하나 만들고, <b>과목 링크</b>를 반 클래스룸에 한 번 올려 두세요.</p>
  </header>
  <style>.tabs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 4px; } .tabs[hidden], .tabp[hidden] { display: none; } .tabp { display: contents; } .tabs .btn[aria-selected="true"] { background: var(--ink); color: var(--paper-2); }</style>
  <div class="tabs" id="tabs" role="tablist" aria-label="선생님 페이지 메뉴" hidden><button class="btn" type="button" role="tab" data-tab="rooms">내 수업방</button><button class="btn" type="button" role="tab" data-tab="stats">수업 통계</button><button class="btn" type="button" role="tab" data-tab="box">내 수업함</button><button class="btn" type="button" role="tab" data-tab="browse">자료 둘러보기</button><a class="btn" href="board.html">게시판</a><button class="btn" type="button" role="tab" data-tab="me">내 정보</button></div>
  <div class="tabp" data-tab="me">
  <div class="card" id="me">
    <h2 id="mehead">선생님 로그인</h2>
    <div id="mebox"><p class="muted">확인하는 중…</p></div>
    <p class="small" id="memsg" aria-live="polite"></p>
  </div>
  <div class="card" id="admin" hidden>
    <details class="fold" id="admind"><summary><span class="h2">가입 신청 관리</span><span class="tag" id="adminsum"></span></summary>
      <div class="fold-body"><div id="adminbox"></div><p class="small" id="adminmsg" aria-live="polite"></p></div>
    </details>
  </div>
  </div>
  <p id="msg" aria-live="polite"></p>
  <div class="tabp" data-tab="stats">
  <div class="card" id="statscard" hidden>
    <h2>우리 반 수업 통계</h2>
    <style>
      #stbox { gap: 28px; }
      .st-kpi { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 12px; }
      .st-k { border: 1.5px solid var(--rule); border-radius: 8px; background: var(--paper); padding: 12px 14px; display: grid; gap: 2px; }
      .st-k b { font: 700 32px/1.1 var(--f-display); color: var(--ink); } .st-k span { font-size: 14px; color: var(--ink-3); }
      .st-k.acc b { color: var(--accent); } .st-k.resp b { color: var(--current); }
      .st-sec { display: grid; grid-template-columns: minmax(0, 1fr); gap: 10px; min-width: 0; }
      .st-h { margin: 0; font: 700 18px/1.3 var(--f-display); } .st-h small { font: 400 13px/1.4 var(--f-body); color: var(--ink-3); margin-left: 6px; }
      .st-grp { margin: 6px 0 0; font-size: 14px; color: var(--ink-2); }
      .st-bars { list-style: none; margin: 0; padding: 0; display: grid; gap: 6px; }
      .st-bars li { display: grid; grid-template-columns: minmax(0, 1fr) 140px 92px; gap: 12px; align-items: center; font-size: 15px; }
      .st-lb { min-width: 0; } .st-sub { display: block; font-size: 12px; color: var(--ink-3); } .st-at { font-size: 12px; color: var(--ink-3); }
      .st-v { font-size: 13px; color: var(--ink-3); white-space: nowrap; text-align: right; } .st-v b { font-size: 15px; font-weight: 600; color: var(--ink); }
      .st-meter { height: 8px; border-radius: 99px; background: var(--grid); overflow: hidden; } .st-meter i { display: block; height: 100%; background: var(--ink-3); }
      .st-bars li.acc .st-meter i { background: var(--accent); } .st-bars li.resp .st-meter i { background: var(--current); }
      .st-table { display: grid; gap: 0; border-top: 1.5px solid var(--rule); }
      .st-tr { display: grid; grid-template-columns: 112px minmax(0, 1fr) 120px 52px 60px 84px 48px; gap: 10px; align-items: center; padding: 10px 8px; font-size: 14px; }
      .st-tr > span { min-width: 0; } .st-tr i { display: none; font-style: normal; color: var(--ink-3); }
      .st-th { font-size: 13px; color: var(--ink-3); border-bottom: 1.5px solid var(--rule); padding-block: 6px; }
      .st-row { border-bottom: 1px solid var(--rule); }
      .st-row > summary { cursor: pointer; list-style: none; } .st-row > summary::-webkit-details-marker { display: none; }
      .st-row > summary:hover, .st-row[open] > summary { background: var(--accent-soft); }
      .st-row .c-d { color: var(--ink-3); font-size: 13px; } .st-row .c-l { color: var(--ink); font-weight: 600; } .st-row .c-c { color: var(--ink-2); }
      .st-row .c-r { color: var(--current); } .st-row .c-a { color: var(--accent); }
      .st-body { padding: 10px 8px 16px; display: grid; gap: 8px; }
      .st-legend { display: flex; flex-wrap: wrap; gap: 4px 16px; font-size: 14px; color: var(--ink-2); } .st-legend .st-hint { margin-left: auto; color: var(--ink-3); font-size: 13px; }
      .st-legend .acc::before, .st-legend .resp::before { content: ''; display: inline-block; width: 18px; height: 3px; border-radius: 2px; margin-right: 6px; vertical-align: middle; }
      .st-legend .acc::before { background: var(--accent); } .st-legend .resp::before { background: var(--current); }
      .st-wrap { position: relative; min-width: 0; } .st-yax { position: absolute; left: 0; top: 0; width: 50px; z-index: 1; pointer-events: none; background: linear-gradient(to right, var(--paper-2) 75%, transparent); }   /* 옆으로 넘겨도 눈금은 그대로 */
      .st-yax span { position: absolute; right: 10px; transform: translateY(-50%); font-size: 14px; color: var(--ink-3); }
      .st-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; direction: rtl; } .st-scroll > svg { direction: ltr; }   /* 처음부터 최근 수업(오른쪽 끝)이 보이게 */
      .st-chart { width: 100%; height: auto; display: block; } .st-chart text { font: 400 14px var(--f-body); fill: var(--ink-3); } .st-chart .st-xl { fill: var(--ink-2); }
      .st-chart .st-grid { stroke: var(--grid); stroke-width: 1; } .st-chart polyline { fill: none; stroke-width: 2.5; } .st-chart circle { stroke: var(--paper-2); stroke-width: 2; }
      .st-chart .st-pv { font-size: 13px; font-weight: 600; } .st-chart .st-pv.acc { fill: var(--accent); } .st-chart .st-pv.resp { fill: var(--current); }
      .st-chart polyline.acc { stroke: var(--accent); } .st-chart circle.acc { fill: var(--accent); } .st-chart polyline.resp { stroke: var(--current); } .st-chart circle.resp { fill: var(--current); }
      @media (max-width: 720px) {
        .st-kpi { grid-template-columns: repeat(2, minmax(0, 1fr)); } .st-k b { font-size: 28px; }
        .st-bars li { grid-template-columns: minmax(0, 1fr) 56px 82px; gap: 8px; }
        .st-tr.st-th { display: none; }
        .st-tr { display: flex; flex-wrap: wrap; gap: 2px 12px; padding: 10px 6px; } .st-tr i { display: inline; }
        .st-tr .c-l { flex: 1 1 100%; order: -1; } .st-tr .c-d { order: -2; flex: 1 1 100%; } .st-tr .c-c { flex: 1 1 100%; }
      }
    </style>
    <p class="muted">수업방에서 수업을 끝내면(차시를 바꾸거나 «수업 끝내기», 한 번 쓰는 방은 닫을 때) 그 수업의 숫자가 여기에 쌓여요. 학생 이름·번호는 남기지 않고, 나만 볼 수 있어요.</p>
    <div class="form"><label class="grow">반<select id="stcls"></select></label><label>기간<select id="stdays"><option value="7">최근 1주</option><option value="30" selected>최근 한 달</option><option value="120">최근 넉 달</option><option value="0">전체</option></select></label></div>
    <div id="stbox" class="stack"></div>
    <p class="small" id="stmsg" aria-live="polite"></p>
  </div>
  </div>
  <div class="tabp" data-tab="box">
  <div class="card" id="boxcard" hidden>
    <h2>내 수업함</h2>
    <p class="muted">차시를 골라 <b>수업함에 담고</b>, 목록에서 <b>고치기</b>를 눌러 내 수업에 맞게 고쳐요. 로그인하면 어느 컴퓨터에서든 열려요.</p>
    <style>#boxpick .grow { flex: 1 1 240px; } #boxpick .subj { flex: 0 1 170px; } #boxpick .btn { flex: 0 0 auto; min-height: 48px; } #boxlist .row.hit { outline: 3px solid var(--hl); outline-offset: 4px; border-radius: 6px; }</style>
    <div class="form" id="boxpick"><label class="subj">과목<select id="boxsubj"></select></label><label class="grow">단원<select id="boxunit"></select></label><label class="grow">차시<select id="boxlesson"></select></label><button class="btn main" type="button" id="boxadd">수업함에 담기</button></div>
    <p class="small" id="boxmsg" aria-live="polite"></p>
    <div id="boxlist" class="stack"></div>
  </div>
  </div>
  <div class="tabp" data-tab="browse">
  <div class="card" id="browsecard" hidden>
    <h2>자료 둘러보기</h2>
    <p class="muted">다른 선생님이 공유한 수업이에요. 미리 보고, 마음에 들면 <b>내 수업함에 담아</b> 내 수업에 맞게 고쳐 쓰세요. <b>미리 보기</b> 화면에서는 필요한 장만 골라 내 수업(어느 차시든) 뒤에 붙일 수도 있어요. 궁금한 점이나 써 본 이야기는 <b>이야기</b>를 눌러 댓글로 나눠요.</p>
    <div id="browselist" class="stack"></div>
    <p class="small" id="browsemsg" aria-live="polite"></p>
  </div>
  </div>
  <div class="tabp" data-tab="rooms">
  <div id="classes" class="stack"></div>
  <div class="card" id="makecard" hidden>
    <h2>새 수업방 만들기</h2>
    <form class="makeform" id="make">
      <label>과목 이름<input type="text" id="name" maxlength="30" placeholder="예: 통합과학2" autocomplete="off"></label>
      <label>가르치는 반<input type="text" id="cls" maxlength="200" placeholder="예: 2-1반, 2-3반, 2-5반" autocomplete="off"></label>
      <label>학생 표시<select id="idmode"><option value="anon">익명</option><option value="num">번호만</option><option value="numname">번호와 이름</option></select></label>
      <label id="sizeWrap" hidden>반 인원 <span class="opt">선택</span><input type="text" inputmode="numeric" id="size" placeholder="안 정함" style="width:96px"></label>
      <button class="btn main" type="submit">만들기</button>
    </form>
    <p class="small">가르치는 반은 쉼표로 나눠 적어요. 그러면 링크 하나를 여러 반이 함께 써요(비워 두면 반 하나). 번호를 받으면 수업 중 누가 들어왔는지 번호 칸으로 보여요(인원을 비우면 들어온 번호만). 모두 나중에 바꿀 수 있어요.</p>
  </div>
  <div class="card">
    <details class="fold"><summary><span class="h2">이렇게 써요</span></summary>
      <div class="fold-body">
        <ol class="steps">
          <li>구글로 로그인해요. 처음이면 가입 신청을 하고, 승인되면 바로 써요.</li>
          <li>과목마다 수업방을 만들고 가르치는 반을 적어요.</li>
          <li><b>과목 링크</b>를 반마다 클래스룸에 한 번 올려 둬요. 학생은 처음 한 번 자기 반을 고르고, 로그인 없이 들어와 언제든 복습해요.</li>
          <li>수업 때는 선생님도 같은 링크를 열고 반과 차시를 골라요. <b>그 반 학생만</b> 수업 차시로 옮겨 오고, 다른 반은 복습을 그대로 해요.</li>
          <li>다른 기기에서는 과목 링크 아래 «선생님이세요? 구글로 로그인»을 누르면 돼요. 휴대폰으로 같은 차시를 열면 리모컨처럼 함께 넘어가요.</li>
        </ol>
        <p class="small note">여럿이 쓰는 교실 컴퓨터라면 수업 뒤 «내 정보»의 «로그아웃»을 눌러 주세요. 그 컴퓨터에 남은 진행 열쇠도 못 쓰게 돼요.</p>
      </div>
    </details>
  </div>
  </div>
</div>
<script>
// 탭(2026-11-12 구성 개편): 승인된 선생님(«새 수업방 만들기»가 보일 때)에게만 탭을 보이고, 그 전에는 로그인·가입 안내가 한 줄로 쌓인 채 둔다
(function () {
  var tabs = document.getElementById('tabs'), mk = document.getElementById('makecard'), ps = [].slice.call(document.querySelectorAll('.tabp')), bs = [].slice.call(tabs.querySelectorAll('button')), cur = 'rooms';
  try { cur = sessionStorage.getItem('science-room:tab') || cur; } catch (e) {}
  function show(t) { var on = !mk.hidden; cur = t; tabs.hidden = !on; ps.forEach(function (p) { p.hidden = on && p.dataset.tab !== t; }); bs.forEach(function (b) { b.setAttribute('aria-selected', b.dataset.tab === t); }); try { sessionStorage.setItem('science-room:tab', t); } catch (e) {} }
  bs.forEach(function (b) { b.onclick = function () { show(b.dataset.tab); }; });
  new MutationObserver(function () { show(cur); }).observe(mk, { attributes: true, attributeFilter: ['hidden'] });
  show(cur);
})();
</script>
<script>
(function () {
  'use strict';
  var qs = new URLSearchParams(location.search);
  var API = (qs.get('roomapi') || ${JSON.stringify(site.roomApi || '')}).replace(/\\/$/, '');
  var pass = qs.get('roomapi') ? '&roomapi=' + encodeURIComponent(qs.get('roomapi')) : '';
  var BASE = location.href.split(/[?#]/)[0].replace(/[^/]*$/, '');
  var LESSONS = ${lessonData(lessons)};
  var STDTXT = ${JSON.stringify(Object.fromEntries(units.filter((u) => u.standard).map((u) => [u.standard, u.standardText || ''])))};   // 성취기준 코드 → 설명(수업 통계)
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
  function uhead(l) { var n = LESSONS.filter(function (x) { return x.unit === l.unit; }).length, first = LESSONS.filter(function (x) { return x.subject === l.subject; })[0]; return (first && first.unit === l.unit && l.subject ? '<h3 class="subjl">' + esc(l.subject) + '</h3>' : '') + '<section class="ugroup"><h3 class="uhead"><span class="ucode">' + esc(l.unit) + '</span>' + esc(l.unitTitle) + '<span class="ucount">' + n + '차시</span></h3><ul class="lessons">'; }
  function lessonsHtml(c) {
    var html = '', unit = '';
    LESSONS.forEach(function (l) {
      if (l.unit !== unit) { html += (unit ? '</ul></section>' : '') + uhead(l); unit = l.unit; }
      html += '<li><span>' + esc(l.n + '차시 ' + l.title) + '</span><a class="btn" href="' + esc(l.teacher + '?room=' + c.code + pass) + '">시작</a></li>';
    });
    return html + (unit ? '</ul></section>' : '');
  }
  // 수업방마다 지금 수업 중인지·지난 수업(과목 방이면 반마다), 반 목록 고치기
  function status(card, c) {
    var box = card.querySelector('[data-s]');
    fetch(API + '/rooms/' + c.code).then(function (r) { return r.json(); }).then(function (info) {
      if (!info.open) { box.textContent = '닫힌 방이에요(오래 쓰지 않아 닫혔어요). 아래 «설정 → 수업방 지우기»로 목록에서 빼고 새로 만들어 주세요.'; return; }
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
      card.querySelector('[data-cls]').innerHTML = list.length ? '<ul class="lessons">' + list.map(function (k) { var l = (info.lastBy || {})[k], f = l && find(l.path); return '<li><span><b>' + esc(k) + '</b> · 학생 ' + ((info.byCls || {})[k] || 0) + '명 들어옴</span><span class="small">지난 수업: ' + (f ? esc(label(f)) : '아직 없어요') + '</span></li>'; }).join('') + '</ul>' : '';
      var cb = card.querySelector('[data-clsf]');
      cb.innerHTML = '<form class="form" data-a="clsf"><label class="grow"><span>가르치는 반 <span class="opt">· 쉼표로 나눠요</span></span><input type="text" maxlength="200" value="' + esc(list.join(', ')) + '" placeholder="예: 2-1반, 2-3반, 2-5반" autocomplete="off"></label><button class="btn" type="submit">' + (list.length ? '반 목록 저장' : '과목 방으로 바꾸기') + '</button></form>';
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
  var openSet = {};                                                  // 설정 칸을 연 수업방
  function update(code, patch) { save(load().map(function (x) { return x.code === code ? Object.assign(x, patch) : x; })); }
  function render() {
    var list = load(), box = document.getElementById('classes');
    if (!list.length) { box.innerHTML = '<div class="card"><p class="muted">아직 만든 수업방이 없어요. 아래에서 과목 이름과 가르치는 반을 넣고 만들어 주세요. 다른 기기에서 만든 수업방은 로그인하면 여기에도 보여요.</p></div>'; return; }
    box.innerHTML = list.map(function (c, i) {
      var join = BASE + 'join.html?room=' + c.code, mode = c.idMode || 'anon', sub = (c.classes || []).length ? '과목' : '반';
      return '<div class="card big" data-i="' + i + '">'
        + '<div class="roomhead"><h2 data-name>' + esc(c.name || '수업방') + '</h2><span class="code" title="참여 코드">' + c.code + '</span></div>'
        + '<p class="status" data-s>확인하는 중…</p>'
        + '<div data-cls></div>'
        + '<p class="linkhead"><span class="label" data-ll=" 링크">' + sub + ' 링크</span><span class="small">반 클래스룸에 한 번 올려 두고, 선생님도 수업 때 이 링크를 열어요</span></p>'
        + '<div class="link">' + esc(join) + '</div>'
        + '<div class="row"><a class="btn main" href="' + esc(join + pass) + '" data-ll=" 링크 열기">' + sub + ' 링크 열기</a><button class="btn" type="button" data-a="copy" data-ll=" 링크 복사">' + sub + ' 링크 복사</button></div>'
        + ((c.classes || []).length ? '' : '<details><summary>차시 바로 시작</summary><div class="ugroups">' + lessonsHtml(c) + '</div></details>')
        + '<details class="set"' + (openSet[c.code] ? ' open' : '') + '><summary>설정 <span class="opt">이름 · 가르치는 반 · 학생 표시 · 지우기</span></summary><div class="setbox">'
        + '<form class="form" data-a="namef"><label class="grow">수업방 이름<input type="text" maxlength="30" value="' + esc(c.name || '') + '" autocomplete="off"></label><button class="btn" type="submit">이름 저장</button></form>'
        + '<div data-clsf></div>'
        + '<div class="field"><span class="flabel">학생 표시</span><div class="row">' + ['anon', 'num', 'numname'].map(function (k) { return '<button class="btn small" type="button" data-m="' + k + '" aria-pressed="' + (mode === k) + '">' + MODES[k] + '</button>'; }).join('')
        + (mode !== 'anon' ? '<label class="sizebox">인원 <input type="text" inputmode="numeric" data-a="size" value="' + (c.size || '') + '" placeholder="안 정함" aria-label="반 인원"> 명</label>' : '') + '</div>'
        + (mode !== 'anon' ? '<span class="small">인원을 비우면 수업 패널에 들어온 번호만 보여요. 넣으면 안 들어온 번호도 보여요.</span>' : '') + '</div>'
        + '<div class="field"><span class="flabel">수업방 지우기</span><div class="row"><button class="btn warn small" type="button" data-a="del">이 수업방 지우기</button><span class="small">링크로 들어와도 열리지 않고 지난 수업 기록도 사라져요. 되돌릴 수 없어요.</span></div></div>'
        + '</div></details></div>';
    }).join('');
    box.querySelectorAll('[data-i]').forEach(function (card) {
      var c = load()[+card.dataset.i];
      status(card, c);
      var set = card.querySelector('details.set');
      set.ontoggle = function () { openSet[c.code] = set.open; };          // 다시 그려도 설정 칸을 연 채로
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
      card.querySelector('[data-a="namef"]').onsubmit = function (e) {
        e.preventDefault();
        var v = this.querySelector('input').value.replace(/\\s+/g, ' ').trim();
        if (!v) { msg('수업방 이름을 넣어 주세요.'); return; }
        post(c.code + '/settings', { key: c.key, name: v }).then(function (j) {
          if (j.error) { msg(j.error); return; }
          update(c.code, { name: j.name || v }); render();
          msg('이름을 바꿨어요: «' + (j.name || v) + '». 학생 화면·클래스룸 링크는 그대로이고, 들어와 있는 학생 화면에도 바로 바뀌어요.');
        }).catch(function () { msg('바꾸지 못했어요. 인터넷 연결을 확인해 주세요.'); });
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
        var v = size.value.trim(), n = parseInt(v, 10);
        if (v && !(n >= 1 && n <= 60)) { msg('반 인원은 1~60명으로 넣거나 비워 두세요.'); size.value = c.size || ''; return; }
        post(c.code + '/settings', { key: c.key, size: v }).then(function (j) { if (j.error) { msg(j.error); return; } update(c.code, { size: j.size }); msg((c.name || '반') + (j.size ? ' 인원을 ' + j.size + '명으로 정했어요.' : ' 인원을 비웠어요. 수업 패널에 들어온 번호만 보여요.')); }).catch(function () { msg('바꾸지 못했어요. 인터넷 연결을 확인해 주세요.'); });
      };
    });
  }

  // ---- 선생님 로그인 카드: 로그인 전 / 가입 전·신청 / 승인 기다림 / 승인됨 ----
  function meMsg(t) { document.getElementById('memsg').textContent = t; }
  var ST = { none: '가입 전', pending: '승인 기다림', denied: '신청이 받아들여지지 않음', revoked: '승인 해제됨' };
  function meCard() {
    var box = document.getElementById('mebox'), s = sess();
    if (!s) {
      document.getElementById('mehead').hidden = false;
      var old = myRooms().length;
      box.innerHTML = '<p class="muted">학교나 개인 구글 계정으로 로그인해요. 처음이면 가입 신청을 하고, 승인되면 어느 기기에서든 내 수업방이 보여요.</p>'
        + (old ? '<p class="small">이 기기에 있던 수업방 ' + old + '개는 로그인하면 이 계정으로 옮겨져요.</p>' : '') + '<div id="gbtn"></div>';
      googleButton(document.getElementById('gbtn'), function (who, err, busy) { if (busy) { meMsg(err); return; } if (!who) { meMsg(err); return; } meMsg(''); renderAll(); });
      return;
    }
    var who = '<b>' + esc(s.name || s.email) + '</b>' + (s.name ? ' · ' + esc(s.email) : '');
    var out = '<button class="btn small" type="button" id="logout">로그아웃</button>';
    document.getElementById('mehead').hidden = s.status === 'approved';
    if (s.status === 'approved') {
      box.innerHTML = '<div class="acct"><span class="muted">' + who + (s.admin ? '<span class="tag">관리자</span>' : '') + '<br><span class="small">학교: ' + esc(s.school || '아직 없음') + '</span></span><span class="row"><button class="btn small" type="button" id="editme">내 정보 고치기</button>' + out + '</span></div>'
        + '<form class="form" id="profile" hidden><label class="grow">이름<input type="text" id="pf-name" maxlength="20" autocomplete="name" value="' + esc(s.name || '') + '"></label>'
        + '<label class="grow">학교<input type="text" id="pf-school" maxlength="40" placeholder="예: 한민고등학교" autocomplete="organization" value="' + esc(s.school || '') + '"></label>'
        + '<p class="small grow">학교 이름은 내 수업방으로 연 슬라이드 위쪽에 나와요(학생 화면도). 한민고는 HANMIN ACADEMY로 나와요.</p>'
        + '<button class="btn main" type="submit">저장</button><button class="btn" type="button" id="pf-cancel">닫기</button></form>'
        + (s.admin && s.pending ? '<p><a class="tag next" href="#admin">가입 신청 ' + s.pending + '건이 승인을 기다려요 ↓</a></p>' : '');
      var pf = document.getElementById('profile');
      document.getElementById('editme').onclick = function () { pf.hidden = !pf.hidden; if (!pf.hidden) document.getElementById('pf-school').focus(); };
      document.getElementById('pf-cancel').onclick = function () { pf.hidden = true; meMsg(''); };
      pf.onsubmit = function (e) {
        e.preventDefault();
        var b = { session: s.token, dev: devId(), have: have(), name: document.getElementById('pf-name').value, school: document.getElementById('pf-school').value };
        if (!b.name.trim() || !b.school.trim()) { meMsg('이름과 학교를 넣어 주세요.'); return; }
        meMsg('저장하는 중…');
        api('/profile', b).then(function (j) { if (j.login) { signedOut(); renderAll(); return; } if (j.error) { meMsg(j.error); return; } keep(j); renderAll(); meMsg('저장했어요. 다음에 여는 슬라이드부터 바뀐 학교 이름이 나와요.'); }, function () { meMsg('저장하지 못했어요. 인터넷 연결을 확인해 주세요.'); });
      };
    } else if (s.status === 'pending') {
      box.innerHTML = '<p class="muted">' + who + ' · <b class="tag next">승인 기다림</b></p><p class="muted">가입 신청을 보냈어요. 관리하는 선생님이 승인하면 이 페이지가 저절로 바뀌어요(30초마다 확인해요).</p><div class="row"><button class="btn main" type="button" id="recheck">승인됐는지 다시 보기</button>' + out + '</div>';
      document.getElementById('recheck').onclick = function () { meMsg('확인하는 중…'); syncMe().then(function () { meMsg(sess() && sess().status === 'approved' ? '승인됐어요!' : '아직 승인 전이에요.'); renderAll(); }); };
    } else {
      box.innerHTML = '<p class="muted">' + who + ' · <b class="tag">' + (ST[s.status] || '가입 전') + '</b></p>'
        + '<p class="muted">' + (s.status === 'revoked' ? '승인이 해제됐어요. 다시 쓰려면 관리하는 선생님께 문의하거나 다시 신청해 주세요.' : s.status === 'denied' ? '지난 신청이 받아들여지지 않았어요. 내용을 고쳐 다시 신청할 수 있어요.' : '수업방을 만들고 수업하려면 가입 신청을 해 주세요. 관리하는 선생님이 승인하면 바로 쓸 수 있어요.') + '</p>'
        + '<form class="form" id="signup"><label class="grow">이름<input type="text" id="su-name" maxlength="20" autocomplete="name" value="' + esc(s.name || '') + '"></label>'
        + '<label class="grow">학교<input type="text" id="su-school" maxlength="40" placeholder="예: 한민고등학교" autocomplete="organization"></label>'
        + '<label class="grow">가르치는 과목·한 마디(선택)<input type="text" id="su-note" maxlength="120" placeholder="예: 통합과학 2학년" autocomplete="off"></label>'
        + '<p class="small">이 자료는 학교 수업 같은 교육 목적으로만 쓸 수 있어요. 출판사·교육 업체 등의 영리 목적 이용과 무단 복제·재배포는 안 돼요. 신청하면 이 조건에 동의한 것으로 봐요.</p>'
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
    var day = function (t) { return new Date(t).toLocaleDateString('ko-KR'); };
    var row = function (u, acts) {
      return '<li><span><b>' + esc(u.name || u.email) + '</b>' + (u.school ? ' · ' + esc(u.school) : '') + '<br><span class="small">' + esc(u.email) + (u.note ? ' · ' + esc(u.note) : '') + (u.at ? '<br>신청 ' + day(u.at) : '') + (u.decided ? ' · ' + ({ approved: '승인', denied: '거절', revoked: '해제' }[u.status] || '처리') + ' ' + day(u.decided) : '') + '</span></span><span class="row">'
        + acts.map(function (a) { return '<button class="btn' + (a[0] === 'approve' ? ' main' : a[0] === 'deny' || a[0] === 'revoke' ? ' warn' : '') + '" type="button" data-e="' + esc(u.email) + '" data-act="' + a[0] + '">' + a[1] + '</button>'; }).join('') + '</span></li>';
    };
    var by = function (st) { return users.filter(function (u) { return u.status === st; }); };
    var pend = by('pending'), ok = by('approved'), rest = users.filter(function (u) { return u.status === 'denied' || u.status === 'revoked'; });
    var sum = document.getElementById('adminsum'), fold = document.getElementById('admind');
    sum.textContent = pend.length ? '새 신청 ' + pend.length + '건' : '새 신청 없음 · 승인된 선생님 ' + ok.length + '명';
    sum.className = 'tag' + (pend.length ? ' next' : '');
    if (!fold.dataset.init) { fold.dataset.init = '1'; fold.open = pend.length > 0; }   // 처음에는 새 신청이 있을 때만 펼친다
    document.getElementById('adminbox').innerHTML =
      '<p class="muted">' + (pend.length ? '새 가입 신청 <b>' + pend.length + '</b>건' : '새 가입 신청이 없어요.') + '</p>'
      + (pend.length ? '<ul class="lessons">' + pend.map(function (u) { return row(u, [['approve', '승인'], ['deny', '거절']]); }).join('') + '</ul>' : '')
      + '<details open><summary>가입한 선생님 ' + ok.length + '명</summary><ul class="lessons">' + ok.map(function (u) { return row(u, [['revoke', '승인 해제']]); }).join('') + '</ul>'
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
    var mode = idmode.value, size = document.getElementById('size').value, cls = parseCls(document.getElementById('cls').value);
    api('/rooms', { session: s.token, persist: true, name: name, idMode: mode, size: size, classes: cls }).then(function (j) {
      if (j.login) { signedOut(); renderAll(); msg('로그인이 풀렸어요. 다시 로그인해 주세요.'); return; }
      if (!j.code || !j.key) { msg(j.error || '만들지 못했어요.'); return; }
      var got = j.classes || [];
      var l = load(); l.push({ code: j.code, key: j.key, name: j.name || name, idMode: j.idMode || mode, size: j.size || null, classes: got }); save(l);
      document.getElementById('name').value = ''; document.getElementById('cls').value = '';
      msg(name + ' 수업방을 만들었어요. ' + (got.length ? '과목 링크를 ' + got.join(', ') + ' 클래스룸에 올려 두세요.' : '반 링크를 그 반 클래스룸에 올려 두세요.') + (got.length < cls.length ? ' (반 이름은 글자·숫자로 10자 안, 16개까지예요.)' : '')); render();
    }, function () { msg('만들지 못했어요. 인터넷 연결을 확인해 주세요.'); });
  };

  // 내 수업함: 편집기(deck.html?…&edit)에서 저장한 내 수업 목록. 수업함이 아직 없는 워커(404)면 카드를 숨긴다
  var EDITABLE = ${JSON.stringify(editable)}, boxHave = {};
  function boxMsg(t) { document.getElementById('boxmsg').textContent = t; }
  function boxUrl(base, more) { return 'deck.html?d=' + base + more + pass; }
  // 담을 수 있는 단원: 장/units.json(장 묶음이 있는 단원). 없으면 이 페이지를 만들 때 본 장 묶음
  var UNITS = null;
  function boxUnits() { return UNITS ? Promise.resolve(UNITS) : fetch('장/units.json').then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; }).then(function (u) { UNITS = Array.isArray(u) && u.length ? u : EDITABLE; return UNITS; }); }
  function ukey(l) { return l.path.split('/').slice(0, 2).join('.'); }
  function opts(sel, list, val, text) { var v = sel.value; sel.innerHTML = list.map(function (x) { return '<option value="' + esc(val(x)) + '">' + esc(text(x)) + '</option>'; }).join(''); if (list.some(function (x) { return val(x) === v; })) sel.value = v; }
  function once(list, f) { var seen = {}; return list.filter(function (x) { var k = f(x); if (seen[k]) return false; seen[k] = true; return true; }); }
  // 과목 → 단원 → 차시 고르기(고른 것은 그대로 둔다)
  function boxPick() {
    var g = function (id) { return document.getElementById(id); }, sb = g('boxsubj'), ub = g('boxunit'), lb = g('boxlesson');
    var can = LESSONS.filter(function (l) { return UNITS.indexOf(ukey(l)) >= 0; });
    opts(sb, once(can, function (l) { return l.subject; }), function (l) { return l.subject; }, function (l) { return l.subject; });
    opts(ub, once(can.filter(function (l) { return l.subject === sb.value; }), ukey), ukey, function (l) { return l.unit + ' ' + l.unitTitle; });
    opts(lb, can.filter(function (l) { return ukey(l) === ub.value; }), function (l) { return l.path; }, function (l) { return l.n + '차시 ' + l.title + (boxHave[l.path] ? ' (담음)' : ''); });
    g('boxadd').disabled = !can.length;
  }
  document.getElementById('boxsubj').onchange = document.getElementById('boxunit').onchange = boxPick;
  // 목록에서 그 차시 줄을 짚어 준다
  function boxShow(base, text) {
    var row = document.querySelector('#boxlist [data-base="' + base + '"]');
    boxMsg(text);
    if (!row) return;
    row.classList.add('hit'); row.scrollIntoView({ block: 'center', behavior: 'smooth' });
    setTimeout(function () { row.classList.remove('hit'); }, 4000);
  }
  function boxCard(focus, text) {
    var card = document.getElementById('boxcard'), s = sess();
    api('/decks/list', { session: s.token }).then(function (j) {
      if (j.http === 404) { card.hidden = true; return; }
      card.hidden = false;
      if (j.error) { boxMsg(j.error); return; }
      boxHave = {};
      document.getElementById('boxlist').innerHTML = j.decks.length ? j.decks.map(function (d) {
        boxHave[d.base] = true;
        var day = new Date(d.updated_at);
        return '<div class="row" data-base="' + esc(d.base) + '"><b>' + esc(d.title) + '</b><span class="small">' + d.slides + '장 · ' + (day.getMonth() + 1) + '월 ' + day.getDate() + '일 저장' + (d.origin ? ' · 원작 ' + esc(d.origin) : '') + (d.shared ? ' · <b>공유 중</b>' : '') + '</span>' + (d.shared && d.post ? '<a class="btn small" href="board.html' + (pass ? '?' + pass.slice(1) : '') + '#p' + d.post + '">이야기 ❤️ ' + d.likes + ' · 💬 ' + d.comments + '</a>' : '')
          + '<a class="btn small main" target="_blank" rel="noopener" href="' + boxUrl(d.base, '&box') + '">수업하기</a>'
          + '<a class="btn small" target="_blank" rel="noopener" href="' + boxUrl(d.base, '&box&edit') + '">고치기</a>'
          + '<a class="btn small" target="_blank" rel="noopener" href="' + boxUrl(d.base, '&box&save') + '">내려받기</a>'
          + '<button class="btn small" type="button" data-share="' + (d.shared ? 0 : 1) + '">' + (d.shared ? '공유 끄기' : '공유하기') + '</button>'
          + '<button class="btn small" type="button" data-del>지우기</button></div>';
      }).join('') : '<p class="small">아직 담은 수업이 없어요. 위에서 차시를 골라 수업함에 담아 보세요.</p>';
      boxUnits().then(boxPick);
      if (focus) boxShow(focus, text);
    }, function () { boxMsg('수업함을 불러오지 못했어요. 인터넷 연결을 확인해 주세요.'); });
  }
  // 수업함에 담기: 고른 차시를 원래 장 순서 그대로 저장한다(워커 /decks/save). 이 브라우저에서 고쳐 둔 작업본이 있으면 그것을 담는다(고치기를 누르면 수업함 것으로 덮이므로)
  document.getElementById('boxadd').onclick = function () {
    var b = this, p = document.getElementById('boxlesson').value, m = p.split('/');
    if (!p) return;
    if (boxHave[p]) { boxShow(p, '이미 수업함에 있는 차시예요. 표시한 줄에서 고치거나 수업하세요.'); return; }
    b.disabled = true; boxMsg('담는 중…');
    fetch('장/' + m[0] + '.' + m[1] + '/index.json').then(function (r) { if (!r.ok) throw new Error(); return r.json(); }).then(function (ix) {
      var x = ix.lessons.filter(function (y) { return String(y.n) === m[2]; })[0];
      if (!x) throw new Error();
      var order = x.slides.map(function (id) { return { id: id, src: id }; }), mine = null, edits = {};
      try { mine = JSON.parse(localStorage.getItem('deck-order:' + p)); } catch (e) {}
      if (Array.isArray(mine) && mine.length) order = mine;
      order.forEach(function (o) { var v = null; try { v = localStorage.getItem('deck-edit:' + o.id); } catch (e) {} if (v) edits[o.id] = v; });
      return api('/decks/save', { session: sess().token, base: p, title: ix.unit.unitTitle + ' ' + x.n + '차시', order: order, edits: edits }).then(function (j) {
        if (!j.error) try { localStorage.removeItem('deck-dirty:' + p); } catch (e) {}
        return j;
      });
    }).then(function (j) {
      b.disabled = false;
      if (j.error) { boxMsg(j.error); return; }
      boxCard(p, '수업함에 담았어요. 고치기를 누르면 편집기가 열려요.');
    }, function () { b.disabled = false; boxMsg('담지 못했어요. 인터넷 연결을 확인해 주세요.'); });
  };
  document.getElementById('boxlist').onclick = function (e) {
    var row = e.target.closest('[data-base]');
    if (row && e.target.hasAttribute('data-share')) {   // 공유: 승인된 선생님 모두가 «자료 둘러보기»에서 보고 담아 간다
      var on = e.target.getAttribute('data-share') === '1';
      var note = on ? prompt('«' + row.querySelector('b').textContent + '»을(를) 승인된 선생님 모두에게 공유해요. 내 이름과 학교가 함께 보여요.\\n어떤 수업인지 한마디 남겨 주세요. 게시판 «자료 나눔»에 올라가 댓글로 이야기할 수 있어요(비워도 돼요).', '') : '';
      if (note === null) return;
      api('/decks/share', { session: sess().token, base: row.getAttribute('data-base'), on: on, note: note }).then(function (j) { boxMsg(j.error || (on ? '공유했어요. 다른 선생님의 «자료 둘러보기»에 보여요.' : '공유를 껐어요.')); boxCard(); browseCard(); }, function () { boxMsg('바꾸지 못했어요. 인터넷 연결을 확인해 주세요.'); });
      return;
    }
    if (!row || !e.target.hasAttribute('data-del') || !confirm('«' + row.querySelector('b').textContent + '»을(를) 수업함에서 지울까요? 되돌릴 수 없어요.')) return;
    api('/decks/delete', { session: sess().token, base: row.getAttribute('data-base') }).then(function (j) { boxMsg(j.error || '지웠어요.'); boxCard(); }, function () { boxMsg('지우지 못했어요. 인터넷 연결을 확인해 주세요.'); });
  };

  // 자료 둘러보기: 다른 선생님이 공유한 수업(워커가 걸러서 준다). 미리 보기 · 내 수업함에 담기
  function browseMsg(t) { document.getElementById('browsemsg').textContent = t; }
  function browseCard() {
    var card = document.getElementById('browsecard');
    api('/decks/browse', { session: sess().token }).then(function (j) {
      if (j.http === 404) { card.hidden = true; return; }
      card.hidden = false;
      if (j.error) { browseMsg(j.error); return; }
      document.getElementById('browselist').innerHTML = j.decks.length ? j.decks.map(function (d) {
        var day = new Date(d.updated_at);
        return '<div class="row" data-id="' + d.id + '"><b>' + esc(d.title) + '</b><span class="small">' + esc(d.by || '선생님') + (d.origin ? ' · 원작 ' + esc(d.origin) : '') + ' · ' + d.slides + '장 · ' + (day.getMonth() + 1) + '월 ' + day.getDate() + '일</span>'
          + '<a class="btn small main" target="_blank" rel="noopener" href="' + boxUrl(d.base, '&share=' + d.id) + '">미리 보기</a>'
          + (d.post ? '<a class="btn small" href="board.html' + (pass ? '?' + pass.slice(1) : '') + '#p' + d.post + '">이야기 ❤️ ' + d.likes + ' · 💬 ' + d.comments + '</a>' : '')
          + (d.mine ? '<span class="small">내가 공유한 수업</span>' : '<button class="btn small" type="button" data-copy>내 수업함에 담기</button>') + '</div>';
      }).join('') : '<p class="small">아직 공유된 수업이 없어요. «내 수업함»에서 «공유하기»를 누르면 여기에 보여요.</p>';
    }, function () { browseMsg('불러오지 못했어요. 인터넷 연결을 확인해 주세요.'); });
  }
  document.getElementById('browselist').onclick = function (e) {
    var row = e.target.closest('[data-id]'); if (!row || !e.target.hasAttribute('data-copy')) return;
    var go = function (over) {
      api('/decks/copy', { session: sess().token, id: Number(row.getAttribute('data-id')), over: over }).then(function (j) {
        if (j.exists && !over) { if (confirm('이 차시의 내 수업이 이미 수업함에 있어요. 담아 온 수업으로 바꿀까요? 지금 내 수업은 사라져요.')) go(true); return; }
        browseMsg(j.error || '내 수업함에 담았어요. «내 수업함»에서 고치거나 수업할 수 있어요.'); if (!j.error) boxCard();
      }, function () { browseMsg('담지 못했어요. 인터넷 연결을 확인해 주세요.'); });
    };
    go(false);
  };

${STATS_JS}
  // 화면 전체: 로그인 상태에 따라 카드를 보이고 숨긴다
  function renderAll() {
    var s = sess(), ok = !!(s && s.status === 'approved');
    meCard(); adminCard();
    if (ok) { boxCard(); browseCard(); statsCard(); } else { document.getElementById('boxcard').hidden = true; document.getElementById('browsecard').hidden = true; document.getElementById('statscard').hidden = true; }
    document.getElementById('makecard').hidden = !ok;
    document.getElementById('classes').hidden = !ok;
    if (ok) render(); else document.getElementById('classes').innerHTML = '';
  }
  // 첫 화면 «새 수업방 만들기»(#makecard)로 왔으면 만들기 칸으로 옮겨 이름 칸에 둔다
  var toMake = function () { var m = document.getElementById('makecard'); if (location.hash === '#makecard' && !m.hidden) { m.scrollIntoView({ block: 'center' }); document.getElementById('name').focus(); } };
  renderAll(); toMake();
  if (sess()) syncMe().then(function () { renderAll(); toMake(); }, renderAll);   // 다른 기기에서 만든 수업방·승인 여부를 맞춘다
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

// 선생님 게시판(board.html, 2026-10-30): 오류 신고·요청·의견·수업 후기. 승인된 선생님만(수업방과 같은 구글 로그인).
//   board.html?lesson=tongsci2/2-2-2/1&slide=3 → 그 차시·장이 붙은 새 글 쓰기 · board.html#p12 → 12번 글
//   글은 마크다운. 화면에 띄울 때 marked(MIT)로 바꾸고 DOMPurify(Apache-2.0/MPL)로 위험한 태그를 걸러 낸다
const BOARD_JS = String.raw`
  var KIND = { bug: '오류 신고', ask: '요청', idea: '의견', review: '수업 후기', share: '자료 나눔' };
  var STAT = { open: '접수', planned: '계획', started: '고치는 중', completed: '반영됨', declined: '보류' };
  var S = { kind: '', status: '', sort: 'new', q: '', page: 0, lesson: qs.get('lesson') || '' };
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function md(t) { try { return DOMPurify.sanitize(marked.parse(String(t || ''), { breaks: true })); } catch (e) { return '<p>' + esc(t).replace(/\n/g, '<br>') + '</p>'; } }
  function when(ms) { var d = new Date(ms), now = Date.now(), m = Math.round((now - ms) / 60000); return m < 1 ? '방금' : m < 60 ? m + '분 전' : m < 1440 ? Math.round(m / 60) + '시간 전' : (d.getMonth() + 1) + '월 ' + d.getDate() + '일'; }
  function lessonName(p) { var l = LESSONS.filter(function (x) { return x.path === p; })[0]; return l ? l.unit + ' ' + l.n + '차시 ' + l.title : p; }
  function lessonLink(p, slide) { var l = LESSONS.filter(function (x) { return x.path === p; })[0]; return l ? '<a href="' + esc(l.teacher) + (slide ? '#/' + (slide - 1) : '') + '" target="_blank" rel="noopener">' + esc(lessonName(p)) + (slide ? ' · ' + slide + '장' : '') + '</a>' : esc(p || ''); }
  function call(op, body) { var s = sess(); body = body || {}; body.session = s && s.token; return api('/board/' + op, body).then(function (j) { if (j.login) { signedOut(); gate(); throw new Error(j.error); } if (j.error) throw new Error(j.error); return j; }); }
  function say(t) { $('bmsg').textContent = t || ''; }
  // 마크다운 도구는 목록을 막지 않게 늦게 받는다(defer). 글을 열 때만 다 받았는지 기다린다
  var mdReady = new Promise(function (ok) { if (document.readyState !== 'loading') ok(); else addEventListener('DOMContentLoaded', ok); });

  // ---- 들어오기: 로그인 → 승인 확인 ----
  function gate() {
    var s = sess();
    $('board').hidden = true;
    if (!s) {
      $('gate').hidden = false;
      $('gatebox').innerHTML = '<p class="muted">가입 승인을 받은 선생님만 볼 수 있어요. 수업방과 같은 구글 계정으로 로그인해 주세요.</p><div id="gbtn"></div><p class="small" id="gmsg"></p>';
      googleButton($('gbtn'), function (who, err) { if (!who) { $('gmsg').textContent = err; return; } gate(); });
      return;
    }
    if (s.status !== 'approved') {
      $('gate').hidden = false;
      $('gatebox').innerHTML = '<p class="muted">' + esc(s.email) + ' 계정은 아직 가입 승인 전이에요. <a href="teach.html">선생님 페이지</a>에서 가입 신청을 해 주세요.</p>';
      return;
    }
    $('gate').hidden = true; $('board').hidden = false;
    $('who').innerHTML = esc(s.name || s.email) + (s.admin ? ' · 관리' : '');
    route();
  }
  function route() { var m = /^#p(\d+)$/.exec(location.hash); if (m) openPost(+m[1]); else { $('detail').hidden = true; $('listv').hidden = false; list(); } }
  addEventListener('hashchange', function () { if (sess()) route(); });

  // ---- 목록 ----
  function list(more) {
    if (!more) S.page = 0;
    call('list', { kind: S.kind, status: S.status, sort: S.sort, q: S.q, lesson: S.lesson, page: S.page }).then(function (j) {
      var c = j.counts || {};
      $('counts').innerHTML = Object.keys(STAT).map(function (k) { return '<span class="st st-' + k + '">' + STAT[k] + ' ' + (c[k] || 0) + '</span>'; }).join('');
      $('lessonf').hidden = !S.lesson; $('lessonf').innerHTML = S.lesson ? esc(lessonName(S.lesson)) + ' 글만 보는 중 · <a href="#" id="alll">모두 보기</a>' : '';
      if (S.lesson) $('alll').onclick = function (e) { e.preventDefault(); S.lesson = ''; list(); };
      var html = j.posts.map(function (p) {
        return '<li class="bp' + (p.hidden ? ' hid' : '') + '"><a href="#p' + p.id + '"><span class="row"><span class="kd kd-' + p.kind + '">' + KIND[p.kind] + '</span>' + (p.kind === 'share' ? '' : '<span class="st st-' + p.status + '">' + STAT[p.status] + '</span>') + (p.replied ? '<span class="tagr">답 있음</span>' : '') + (p.hidden ? '<span class="tagr">숨김</span>' : '') + '</span>'
          + '<b class="bt">' + esc(p.title) + '</b><span class="pv">' + esc(p.preview) + '</span>'
          + '<span class="meta">' + (p.lesson ? esc(lessonName(p.lesson)) + (p.slide ? ' · ' + p.slide + '장' : '') + ' · ' : '') + esc(p.author_name) + ' · ' + when(p.created_at) + ' · ❤️ ' + p.likes + ' · 💬 ' + p.comments + '</span></a></li>';
      }).join('');
      if (more) $('plist').insertAdjacentHTML('beforeend', html); else $('plist').innerHTML = html || '<li class="empty">아직 글이 없어요. 첫 글을 남겨 주세요.</li>';
      $('more').hidden = !j.more;
    }).catch(function (e) { say(e.message); });
  }
  function filters() {
    document.querySelectorAll('[data-k]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.k === S.kind)); b.onclick = function () { S.kind = b.dataset.k; filters(); list(); }; });
    $('fstat').onchange = function () { S.status = this.value; list(); };
    $('fsort').onchange = function () { S.sort = this.value; list(); };
    $('fq').onkeydown = function (e) { if (e.key === 'Enter') { S.q = this.value.trim(); list(); } };
    $('more').onclick = function () { S.page++; list(true); };
  }

  // ---- 새 글 ----
  function writer(edit) {
    var w = $('write'), slide = parseInt(qs.get('slide'), 10) || '';
    w.hidden = false; $('detail').hidden = true; $('listv').hidden = true;
    $('wlesson').innerHTML = '<option value="">차시 없음(전체 이야기)</option>' + LESSONS.map(function (l) { return '<option value="' + esc(l.path) + '">' + esc(l.unit + ' ' + l.n + '차시 ' + l.title) + '</option>'; }).join('');
    $('wkind').value = edit ? edit.kind : (S.lesson ? 'bug' : 'idea'); $('wkind').disabled = !!edit;
    $('wlesson').value = edit ? edit.lesson || '' : S.lesson || ''; $('wlesson').disabled = !!edit;
    $('wslide').value = edit ? edit.slide || '' : (S.lesson ? slide : ''); $('wslide').disabled = !!edit;
    $('wtitle').value = edit ? edit.title : ''; $('wbody').value = edit ? edit.body : '';
    $('whead').textContent = edit ? '글 고치기' : '새 글 쓰기';
    $('wtitle').focus();
    $('wform').onsubmit = function (e) {
      e.preventDefault();
      var b = { kind: $('wkind').value, title: $('wtitle').value, body: $('wbody').value, lesson: $('wlesson').value || null, slide: parseInt($('wslide').value, 10) || null };
      $('wsend').disabled = true;
      (edit ? call('edit', { id: edit.id, title: b.title, body: b.body }).then(function () { return { id: edit.id }; }) : call('post', b))
        .then(function (j) { w.hidden = true; $('wsend').disabled = false; if (location.hash === '#p' + j.id) route(); else location.hash = '#p' + j.id; })
        .catch(function (err) { $('wsend').disabled = false; $('wmsg').textContent = err.message; });
    };
    $('wcancel').onclick = function () { w.hidden = true; route(); };
  }

  // ---- 글 보기 ----
  function openPost(id) {
    $('listv').hidden = true; $('write').hidden = true;
    call('get', { id: id }).then(function (j) { return mdReady.then(function () { return j; }); }).then(function (j) {
      var p = j.post, d = $('detail'); d.hidden = false;
      var h = '<p><a href="#" id="back">← 목록</a></p><div class="row"><span class="kd kd-' + p.kind + '">' + KIND[p.kind] + '</span>' + (p.kind === 'share' ? '' : '<span class="st st-' + p.status + '">' + STAT[p.status] + '</span>') + (p.hidden ? '<span class="tagr">숨김</span>' : '') + '</div>'
        + '<h2>' + esc(p.title) + '</h2><p class="meta">' + (p.lesson ? lessonLink(p.lesson, p.slide) + ' · ' : '') + esc(p.author_name) + ' · ' + when(p.created_at) + '</p>'
        + '<div class="mdb">' + md(p.body) + '</div>'
        + (j.deck ? '<p class="row"><a class="btn main" target="_blank" rel="noopener" href="deck.html?d=' + esc(p.lesson) + '&share=' + j.deck + (qs.get('roomapi') ? '&roomapi=' + encodeURIComponent(qs.get('roomapi')) : '') + '">수업 미리 보기</a><a class="btn" href="teach.html' + (qs.get('roomapi') ? '?roomapi=' + encodeURIComponent(qs.get('roomapi')) : '') + '">내 수업함에 담으러 가기</a></p>' : p.kind === 'share' ? '<p class="small">지금은 공유를 그만둔 수업이에요.</p>' : '')
        + '<div class="row"><button class="btn" type="button" id="like" aria-pressed="' + j.liked + '">❤️ 공감 ' + p.likes + '</button>'
        + (p.mine || j.admin ? '<button class="btn" type="button" id="edit">고치기</button><button class="btn warn" type="button" id="del">' + (p.hidden && j.admin ? '다시 보이기' : '지우기') + '</button>' : '') + '</div>';
      if (p.reply) h += '<div class="reply"><b>관리자 답</b>' + md(p.reply) + '</div>';
      if (j.admin) h += '<div class="admin"><b>처리 상태</b><div class="row">' + Object.keys(STAT).map(function (k) { return '<button class="btn small" type="button" data-s="' + k + '" aria-pressed="' + (k === p.status) + '">' + STAT[k] + '</button>'; }).join('') + '</div><textarea id="reply" rows="3" placeholder="답 달기(선택) — 상태를 누르면 함께 저장돼요"></textarea></div>';
      h += '<h3>댓글 ' + j.comments.filter(function (c) { return !c.hidden; }).length + '</h3><ul class="cl">' + j.comments.map(function (c) {
        return '<li' + (c.hidden ? ' class="hid"' : '') + '><p class="meta">' + esc(c.author_name) + ' · ' + when(c.created_at) + (c.mine || j.admin ? ' · <a href="#" data-c="' + c.id + '" data-on="' + (c.hidden ? 0 : 1) + '">' + (c.hidden ? '다시 보이기' : '지우기') + '</a>' : '') + '</p>' + md(c.body) + '</li>';
      }).join('') + '</ul><form id="cform" class="cform"><textarea id="cbody" rows="3" placeholder="댓글 쓰기"></textarea><button class="btn main" type="submit">댓글 달기</button></form><p class="small" id="dmsg"></p>';
      d.innerHTML = h;
      var dm = function (t) { $('dmsg').textContent = t; };
      $('back').onclick = function (e) { e.preventDefault(); location.hash = ''; };
      $('like').onclick = function () { var on = this.getAttribute('aria-pressed') !== 'true', b = this; call('like', { id: id, on: on }).then(function (r) { b.setAttribute('aria-pressed', String(on)); b.textContent = '❤️ 공감 ' + r.likes; }).catch(function (e) { dm(e.message); }); };
      if ($('edit')) $('edit').onclick = function () { writer(p); };
      if ($('del')) $('del').onclick = function () { var on = !(p.hidden && j.admin); if (on && !armed(this, '한 번 더 누르면 지워져요', '지우기')) return; call('hide', { id: id, on: on }).then(function () { location.hash = ''; }).catch(function (e) { dm(e.message); }); };
      d.querySelectorAll('[data-s]').forEach(function (b) { b.onclick = function () { call('status', { id: id, status: b.dataset.s, reply: $('reply').value }).then(function () { openPost(id); }).catch(function (e) { dm(e.message); }); }; });
      d.querySelectorAll('[data-c]').forEach(function (a) { a.onclick = function (e) { e.preventDefault(); call('hide', { comment: +a.dataset.c, on: a.dataset.on === '1' }).then(function () { openPost(id); }).catch(function (er) { dm(er.message); }); }; });
      $('cform').onsubmit = function (e) { e.preventDefault(); call('comment', { id: id, body: $('cbody').value }).then(function () { openPost(id); }).catch(function (er) { dm(er.message); }); };
    }).catch(function (e) { say(e.message); location.hash = ''; });
  }
  function armed(b, text, idle) { if (b.dataset.armed) return true; b.dataset.armed = '1'; b.textContent = text; setTimeout(function () { if (b.isConnected) { delete b.dataset.armed; b.textContent = idle; } }, 3000); return false; }

  filters();
  $('new').onclick = function () { writer(); };
  $('out').onclick = function (e) { e.preventDefault(); logout().then(gate); };
  // 저장된 로그인으로 먼저 그린다(로그인 확인을 기다리면 목록이 왕복 한 번만큼 늦게 뜬다). 확인 결과가 다르면 다시 그린다
  var mark = function () { var s = sess(); return s ? s.token + s.status + !!s.admin : ''; }, was = mark();
  var start = function () { gate(); if (qs.get('lesson') && sess() && sess().status === 'approved' && !location.hash) writer(); };
  if (was) start();
  syncMe().then(function () { if (!was || mark() !== was) start(); });
`;

export function boardPage(site, units) {
  const lessons = lessonList(units);
  return `${head('선생님 게시판 · ' + site.name)}
<style>
.kinds { display: flex; flex-wrap: wrap; gap: 6px; }
.bfil { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; }
.bfil input { flex: 1 1 200px; }
.counts { display: flex; flex-wrap: wrap; gap: 6px; }
.st, .kd, .tagr { font: 700 13px/1 var(--f-body); padding: 5px 9px; border-radius: 999px; border: 1.5px solid var(--ink-3); color: var(--ink-2); background: var(--paper); }
.kd-bug { border-color: var(--stamp); color: var(--stamp); } .kd-ask { border-color: var(--accent); color: var(--accent); }
.st-open { background: #fff3c4; } .st-planned { background: #dcebf7; } .st-started { background: #ffe0cc; } .st-completed { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); } .st-declined { background: #eee; }
ul.plist, ul.cl { list-style: none; margin: 0; padding: 0; display: grid; gap: 10px; }
.bp a { display: grid; gap: 6px; padding: 12px 14px; border: 2px solid var(--ink); border-radius: 10px; background: var(--paper-2); color: var(--ink); text-decoration: none; }
.bp a:hover { border-color: var(--accent); }
.bp.hid a, .cl li.hid { opacity: .5; }
.bt { font: 700 18px/1.35 var(--f-body); } .pv { color: var(--ink-2); font-size: 15px; overflow: hidden; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.meta { font-size: 13px; color: var(--ink-3); margin: 0; }
.empty { color: var(--ink-3); padding: 12px; }
.mdb { line-height: 1.7; overflow-wrap: anywhere; min-width: 0; } .mdb img { max-width: 100%; } .mdb pre, .mdb table { display: block; max-width: 100%; overflow-x: auto; }
#detail { grid-template-columns: minmax(0, 1fr); }
.reply { border-left: 4px solid var(--accent); background: var(--accent-soft); padding: 10px 14px; border-radius: 6px; }
.admin { border: 2px dashed var(--ink-3); border-radius: 10px; padding: 10px 12px; display: grid; gap: 8px; }
textarea { font: 400 16px/1.5 var(--f-body); padding: 10px 12px; border: 2px solid var(--ink); border-radius: 8px; background: var(--paper); color: var(--ink); width: 100%; box-sizing: border-box; }
.cl li { border-top: 1px dashed var(--rule); padding-top: 8px; }
.cform { display: grid; gap: 8px; justify-items: start; }
.btn.small { min-height: 34px; padding: 0 12px; font-size: 14px; }
</style>
<body>
<div class="wrap">
  <nav class="topnav"><a class="btn small" href="index.html">← 자료실 첫 화면</a><img class="brand" src="brand/frame.svg" alt="${esc(site.name)}" style="height:78px;margin-block:-26px -10px"></nav>
  <header class="pagehead">
    <h1>선생님 게시판</h1>
    <p class="muted">수업자료를 쓰다 찾은 오류, 바라는 점, 수업 후기를 남겨 주세요. 차시 화면의 «의견» 단추로 오면 그 차시와 장이 저절로 붙어요.</p>
  </header>
  <div class="card" id="gate" hidden><div id="gatebox"></div></div>
  <div id="board" hidden class="stack">
    <div class="row between"><span class="small"><b id="who"></b> · <a href="#" id="out">로그아웃</a></span><button class="btn main" type="button" id="new">새 글 쓰기</button></div>
    <p class="small" id="bmsg" aria-live="polite"></p>
    <div id="listv" class="stack">
      <div class="kinds" role="group" aria-label="종류"><button class="btn small" type="button" data-k="">전체</button><button class="btn small" type="button" data-k="bug">오류 신고</button><button class="btn small" type="button" data-k="ask">요청</button><button class="btn small" type="button" data-k="idea">의견</button><button class="btn small" type="button" data-k="review">수업 후기</button><button class="btn small" type="button" data-k="share">자료 나눔</button></div>
      <div class="bfil"><select id="fstat" aria-label="처리 상태"><option value="">모든 상태</option><option value="open">접수</option><option value="planned">계획</option><option value="started">고치는 중</option><option value="completed">반영됨</option><option value="declined">보류</option></select>
        <select id="fsort" aria-label="정렬"><option value="new">최신순</option><option value="top">공감순</option></select><input type="text" id="fq" placeholder="찾기(엔터)" aria-label="찾기"></div>
      <div class="counts" id="counts"></div>
      <p class="small" id="lessonf" hidden></p>
      <ul class="plist" id="plist"></ul>
      <button class="btn" type="button" id="more" hidden>더 보기</button>
    </div>
    <div class="card" id="write" hidden>
      <h2 id="whead">새 글 쓰기</h2>
      <form id="wform" class="stack">
        <div class="form"><label>종류<select id="wkind"><option value="bug">오류 신고</option><option value="ask">요청</option><option value="idea">의견</option><option value="review">수업 후기</option></select></label>
          <label class="grow">차시<select id="wlesson"></select></label><label>장<input type="text" inputmode="numeric" id="wslide" style="width:80px" placeholder="몇 장"></label></div>
        <label class="form"><span class="small">제목</span><input type="text" id="wtitle" maxlength="80" style="width:100%"></label>
        <textarea id="wbody" rows="8" maxlength="6000" placeholder="무엇이 어떻게 보였는지, 어떻게 바뀌면 좋을지 적어 주세요. 마크다운(**굵게**, 목록, 링크)을 쓸 수 있어요."></textarea>
        <div class="row"><button class="btn main" type="submit" id="wsend">올리기</button><button class="btn" type="button" id="wcancel">그만두기</button></div>
        <p class="small" id="wmsg" aria-live="polite"></p>
      </form>
    </div>
    <div class="card" id="detail" hidden></div>
  </div>
</div>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.2/marked.min.js"></script>
<script defer src="https://cdnjs.cloudflare.com/ajax/libs/dompurify/3.1.6/purify.min.js"></script>
<script>
(function () {
  'use strict';
  var qs = new URLSearchParams(location.search);
  var API = (qs.get('roomapi') || ${JSON.stringify(site.roomApi || '')}).replace(/\\/$/, '');
  var GID = qs.get('gid') || ${JSON.stringify(site.googleClientId || '')};
  var LESSONS = ${lessonData(lessons)};
${AUTH_JS}
${BOARD_JS}
})();
</script>
</body>
</html>
`;
}
