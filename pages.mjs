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
<script>if (!/^(localhost|127\\.0\\.0\\.1|)$/.test(location.hostname) && /[?&]roomapi=/.test(location.search)) { var u = new URL(location.href); u.searchParams.delete('roomapi'); history.replaceState(null, '', u); }</script>
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
.ugroup { border: 2px solid var(--ink); border-radius: 10px; background: var(--paper); padding: 12px 16px; display: block; min-width: 0; } .ugroup > ul { margin-top: 10px; }
.uhead { margin: 0; display: flex; flex-wrap: wrap; align-items: center; gap: 4px 10px; font: 700 20px/1.3 var(--f-display); }
.subjl { margin: 6px 0 -8px; font: 800 26px/1.2 var(--f-display); }
.uhead .ucode { font: 700 13px/1 var(--f-body); letter-spacing: .04em; color: var(--paper-2); background: var(--accent); border-radius: 999px; padding: 5px 10px; }
.uhead { cursor: pointer; list-style: none; } .uhead::-webkit-details-marker { display: none; } .ugroup .ucount::after { content: ' ▸'; } .ugroup[open] .ucount::after { content: ' ▾'; }
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
.pmenu { position: relative; border: 0; padding: 0; } .pmenu summary { list-style: none; position: relative; width: 44px; height: 44px; display: grid; place-items: center; border: 2px solid var(--ink); border-radius: 12px; background: var(--paper-2); color: var(--ink); cursor: pointer; } .pmenu summary::-webkit-details-marker { display: none; }
.pdot { font-style: normal; padding: 2px 7px; border-radius: 99px; background: var(--stamp); color: var(--paper-2); font: 700 12px/1.2 var(--f-body); } .pmenu summary .pdot { position: absolute; top: -8px; right: -8px; }
.pmenu [hidden] { display: none; } .pmenu .pwho { min-height: 36px; padding-block: 8px; max-width: 230px; font-size: 13px; color: var(--ink-3); border-bottom: 1px solid var(--rule); cursor: default; } .pmenu .pwho:hover { background: none; }
.pmenu > div { position: absolute; right: 0; top: 50px; z-index: 9; display: grid; min-width: 168px; background: var(--paper-2); border: 2px solid var(--ink); border-radius: 10px; overflow: hidden; }
.pmenu > div > * { min-height: 44px; padding: 0 16px; border: 0; background: none; display: flex; align-items: center; gap: 8px; font: 700 15px/1.2 var(--f-body); color: var(--ink); text-decoration: none; text-align: left; cursor: pointer; } .pmenu > div > *:hover { background: var(--accent-soft); }
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
details.room > summary { list-style: none; display: grid; gap: 10px; color: var(--ink); font-weight: 400; }
details.room > summary::-webkit-details-marker { display: none; }
details.room .roomhead .code::after { content: ' ▾'; color: var(--ink-3); }
details.room:not([open]) .roomhead .code::after { content: ' ▸'; }
.roombody { display: grid; grid-template-columns: minmax(0, 1fr); gap: 12px; }
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
.shrow { display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 4px 10px; align-items: center; border-top: 1px dashed var(--rule); padding-top: 10px; } .shrow:first-child { border-top: 0; padding-top: 0; } #browselist { gap: 10px; }
.shrow .talk { font-size: 13px; font-weight: 600; color: var(--ink-3); text-decoration: none; white-space: nowrap; justify-self: end; padding: 4px 0; } .shrow .talk:hover { color: var(--accent); }
.shrow .acts { display: flex; gap: 6px; justify-self: end; } .shrow .acts .btn { white-space: nowrap; }
.shrow > b, .shrow > .small { min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
@media (max-width: 560px) { .shrow > .small, .shrow .acts { grid-column: 1 / -1; } .shrow .acts { justify-self: stretch; } .shrow .acts .btn { flex: 1 1 0; } }
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
    store(SESS, { token: token || s.token, email: j.email, name: j.name || s.name || '', status: j.status, admin: !!j.admin, pending: j.pending || 0, notes: j.notes || 0, talk: j.talk || 0, mine: j.mine || 0, school: j.school || s.school || '' });
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
    return pushOff().then(function () { return api('/auth/logout', { session: s && s.token, have: have() }); }).then(done, done);
  }
  // ---- 푸시 알림(2026-11-16, 수업방 src/push.mjs): 쪽지·내 글 답글/공감·가입 승인. 아이폰은 홈 화면에 추가한 앱에서만 된다 ----
  var PUSHFOR = 'kk-push-for', pushIs = null;   // pushIs: null 모름 · 'none' 못 씀 · 'off' · 'on'
  function pushReg() { return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window ? navigator.serviceWorker.ready : Promise.reject(new Error('none')); }
  function pushSend(sub) { var o = sub.toJSON(), s = sess(); return api('/push/sub', { session: s.token, endpoint: o.endpoint, p256dh: o.keys.p256dh, auth: o.keys.auth }).then(function (j) { if (j.error) throw new Error(j.error); store(PUSHFOR, s.email); }); }
  function pushOn() {
    return pushReg().then(function (reg) {
      return Notification.requestPermission().then(function (p) { if (p !== 'granted') throw new Error('브라우저 설정에서 이 사이트의 알림을 허용해 주세요.'); return api('/push/key', {}); })
        .then(function (j) { if (!j.key) throw new Error('알림은 아직 준비하고 있어요.'); var raw = atob(j.key.replace(/-/g, '+').replace(/_/g, '/')), key = new Uint8Array(raw.length); for (var i = 0; i < raw.length; i++) key[i] = raw.charCodeAt(i); return reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key }); })
        .then(pushSend).then(function () { pushIs = 'on'; });
    });
  }
  // 끄기: 이 브라우저의 알림 주소를 없애고 서버에서도 지운다(로그아웃 때도 — 공용 컴퓨터에 남의 알림이 뜨지 않게)
  function pushOff() {
    return pushReg().then(function (reg) { return reg.pushManager.getSubscription(); }).then(function (sub) {
      if (!sub) return; var s = sess(); store(PUSHFOR, null); pushIs = 'off';
      return Promise.all([sub.unsubscribe(), s ? api('/push/off', { session: s.token, endpoint: sub.endpoint }) : 0]);
    }).catch(function () {});
  }
  // 지금 켜져 있나. 켜져 있는데 다른 계정이 켠 것이면(로그아웃 없이 계정이 바뀜) 지금 계정 것으로 다시 적는다
  function pushCheck() {
    return pushReg().then(function (reg) { return reg.pushManager.getSubscription(); }).then(function (sub) {
      var s = sess(); pushIs = sub ? 'on' : 'off';
      if (sub && s && stored(PUSHFOR) !== s.email) return pushSend(sub).catch(function () {});
    }, function () { pushIs = 'none'; }).then(function () { return pushIs; });
  }
  function pushItem() { return pushIs === 'none' ? '<span class="pwho">알림은 홈 화면에 추가한 앱에서 켤 수 있어요</span>' : '<button type="button" data-go="push">' + (pushIs === 'on' ? '알림 끄기' : '알림 켜기') + '</button>'; }
  // ---- 짝대기 세 개 메뉴(오른쪽 위, 선생님 페이지·이야기 쪽 공통, 2026-11-16 «선생님 페이지랑 분리»): 수업 일은 선생님 페이지, 선생님끼리의 일(이야기·내 글·쪽지)은 이야기 쪽 ----
  function profCard() {
    var s = sess(), el = document.getElementById('prof'); if (!el) return;
    if (!s) { el.innerHTML = ''; return; }
    if (pushIs === null) { pushIs = 'off'; pushCheck().then(profCard); }
    var n = String(s.name || s.email), ok = s.status === 'approved', tm = (s.talk || 0) + (s.mine || 0), all = (s.notes || 0) + tm;   // 새 소식: 쪽지 + 이야기 새 글 + 내 글 반응
    function pd(n) { return n ? '<i class="pdot">' + n + '</i>' : ''; }
    var dot = pd(s.notes);
    var q = new URLSearchParams(location.search).get('roomapi'); q = q ? '?roomapi=' + encodeURIComponent(q) : '';
    function a(go, page, t) { return '<a data-go="' + go + '" href="' + page + '.html' + q + '#' + go + '">' + t + '</a>'; }
    el.innerHTML = '<details class="pmenu"><summary aria-label="내 메뉴' + (all ? ', 새 소식 ' + all + '개' : '') + '"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>' + pd(all) + '</summary><div>'
      + '<span class="pwho">' + esc(n.replace(/\s*선생님$/, '')) + ' 선생님</span>' + a('rooms', 'teach', '선생님 페이지')
      + (ok ? a('talk', 'board', '이야기' + pd(tm)) + a('notes', 'board', '쪽지' + dot) : '') + a('me', 'teach', '내 정보')
      + (ok || s.status === 'pending' ? pushItem() : '') + '<a href="policy.html">약관·개인정보</a><button type="button" data-go="out">로그아웃</button><span class="pwho" id="pmsg" role="status" hidden></span></div></details>';
  }
  document.addEventListener('click', function (e) {
    var m = document.querySelector('.pmenu[open]'), b = m && e.target.closest('.pmenu [data-go]');
    if (b && b.dataset.go === 'push') {   // 메뉴는 연 채로 두고 결과를 그 자리에 알린다
      var say = function (t) { profCard(); var d = document.querySelector('.pmenu'), p = document.getElementById('pmsg'); d.open = true; p.textContent = t; p.hidden = false; };
      (pushIs === 'on' ? pushOff().then(function () { say('알림을 껐어요.'); }) : pushOn().then(function () { say('알림을 켰어요. 쪽지·답글·공감이 오면 알려 드려요.'); }, function (err) { say(err && err.message !== 'none' ? err.message : '이 브라우저에서는 알림을 켤 수 없어요.'); }));
      return;
    }
    if (m && (b || !m.contains(e.target))) m.open = false;
    if (b && b.dataset.go === 'out') { if (window.kkOut) kkOut(); logout().then(function () { location.reload(); }); }
  });
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
  function find(path) { path = String(path).replace(/^deck\\//, ''); return LESSONS.filter(function (l) { return l.path === path; })[0] || null; }   // 재생기·내 수업(deck/…)도 같은 차시
  function label(l) { return l.unit + ' ' + l.n + '차시 ' + l.title; }
  function uhead(l) { var n = LESSONS.filter(function (x) { return x.unit === l.unit && x.subject === l.subject; }).length, first = LESSONS.filter(function (x) { return x.subject === l.subject; })[0]; return (first && first.unit === l.unit && l.subject ? '<h3 class="subjl">' + esc(l.subject) + '</h3>' : '') + '<details class="ugroup"><summary class="uhead"><span class="ucode">' + esc(l.unit) + '</span>' + esc(l.unitTitle) + '<span class="ucount">' + n + '차시</span></summary><ul class="lessons">'; }
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
      if (l.unit !== unit) { html += (unit ? '</ul></details>' : '') + uhead(l); unit = l.unit; }
      var href = teacher ? l.teacher + tq() : l.student + (withRoom ? '?room=' + code + pass : '');
      var tag = mark.now === l.path ? '<b class="tag now">지금 수업 중</b>' : mark.next === l.path ? '<b class="tag next">다음 차시</b>' : mark.last === l.path ? '<b class="tag">지난 수업</b>' : '';
      var main = mark.now === l.path || (teacher ? mark.next === l.path : mark.last === l.path);
      html += '<li><span>' + esc(l.n + '차시 ' + l.title) + tag + '</span><a class="btn' + (main ? ' main' : '') + '" href="' + esc(href) + '">' + (teacher ? (mark.now === l.path ? '이어서 하기' : '수업 시작') : '열기') + '</a></li>';
    });
    $('list').innerHTML = html + (unit ? '</ul></details>' : '');
    // 단원은 접어 두고, 하던 곳 한 단원만 펴 둔다(지금 수업 중 > 이어 갈 차시 > 지난 수업)
    var here = $('list').querySelector('.tag.now') || $('list').querySelector('.btn.main') || $('list').querySelector('.tag');
    if (here) here.closest('details').open = true;
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
      if (info.open && info.wall) { location.replace('wall.html?room=' + code + pass); return; }   // 의견판만 따로 쓰는 방(연수·학급회의)은 그 판으로
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
  <nav class="topnav"><a class="btn small" href="index.html">← 자료실 첫 화면</a><img class="brand" src="brand/frame.svg" alt="${esc(site.name)}" style="height:78px;margin-block:-26px -10px"><span id="prof"></span></nav>
  <header class="pagehead">
    <h1>선생님 페이지</h1>
    <p class="muted">과목마다 수업방을 하나 만들고, <b>과목 링크</b>를 반 클래스룸에 한 번 올려 두세요.</p>
  </header>
  <style>.tabs { display: flex; flex-wrap: nowrap; overflow-x: auto; gap: 8px; margin-bottom: 4px; padding-bottom: 4px; } .tabs .btn { flex: 0 0 auto; white-space: nowrap; } @media (max-width: 720px) { .tabs { gap: 5px; } .tabs .btn { min-height: 38px; padding: 0 11px; font-size: 14px; } } @media (max-width: 560px) { .tabs { gap: 2px; } .tabs .btn { flex: 1 1 auto; padding: 0 3px; font-size: min(13px, 2.9vw); letter-spacing: -.03em; } } .tabs[hidden], .tabp[hidden] { display: none; } .tabp { display: contents; } .tabs .btn[aria-selected="true"] { background: var(--ink); color: var(--paper-2); }</style>
  <div class="tabs" id="tabs" role="tablist" aria-label="선생님 페이지 메뉴" hidden><button class="btn" type="button" role="tab" data-tab="rooms">수업 열기</button><button class="btn" type="button" role="tab" data-tab="box">내 수업</button><button class="btn" type="button" role="tab" data-tab="stats">수업 통계</button></div>
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
  <div class="card" id="newcard" hidden style="border-width:3px">
    <h2>새 수업 만들기</h2>
    <p class="muted">빈 화면에서 시작해 글·그림·도형·표와 <b>움직이는 장</b>을 넣어 나만의 수업을 만들어요. 만든 수업은 아래 내 수업에 담기고, 수업방에서 열면 학생 화면이 함께 움직여요.</p>
    <div class="form"><label style="flex:1 1 240px">수업 이름<input type="text" id="newname" maxlength="80" placeholder="예: 산화와 환원 1차시" autocomplete="off"></label><button class="btn main" type="button" id="newgo" style="flex:0 0 auto;min-height:48px">새 수업 만들기</button></div>
    <p class="small" id="newmsg" aria-live="polite"></p>
  </div>
  <div class="card" id="boxcard" hidden>
    <h2>내 수업</h2>
    <p class="muted">차시를 골라 <b>내 수업에 담고</b>, 목록에서 <b>수정</b>을 눌러 내 수업에 맞게 고쳐요. 로그인하면 어느 컴퓨터에서든 열려요.</p>
    <style>#boxpick .grow { flex: 1 1 240px; } #boxpick .subj { flex: 0 1 170px; } #boxpick .btn { flex: 0 0 auto; min-height: 48px; } #boxlist .acts { flex: 1 1 100%; display: flex; flex-wrap: nowrap; gap: 6px; overflow-x: auto; } #boxlist .acts .btn { flex: 0 0 auto; white-space: nowrap; } @media (max-width: 720px) { #boxlist .acts { gap: 4px; } #boxlist .acts .btn { padding: 0 9px; font-size: 13px; } } #boxlist .row.hit { outline: 3px solid var(--hl); outline-offset: 4px; border-radius: 6px; }</style>
    <div class="form" id="boxpick"><label class="subj">과목<select id="boxsubj"></select></label><label class="grow">단원<select id="boxunit"></select></label><label class="grow">차시<select id="boxlesson"></select></label><button class="btn main" type="button" id="boxadd">내 수업에 담기</button></div>
    <p class="small" id="boxmsg" aria-live="polite"></p>
    <div id="boxlist" class="stack"></div>
  </div>
  </div>
  <div class="tabp" data-tab="box">
  <div class="card" id="browsecard" hidden>
    <h2>자료 찾기</h2>
    <p class="muted">미리 보고, 마음에 들면 <b>내 수업에 담아</b> 고쳐 쓰세요.</p>
    <div class="form" id="brpick"><label class="subj">과목<select id="brsubj"></select></label><label class="grow">대단원<select id="brbig"></select></label><label class="grow">단원<select id="brunit"></select></label></div>
    <style>#brpick .grow { flex: 1 1 240px; } #brpick .subj { flex: 0 1 170px; }</style>
    <h3>꿈틀 기본 자료</h3>
    <div id="baselist" class="stack"></div>
    <h3>선생님들이 공유한 수업</h3>
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
        <p class="small note">여럿이 쓰는 교실 컴퓨터라면 수업 뒤 오른쪽 위 이름을 누르고 «로그아웃»을 눌러 주세요. 그 컴퓨터에 남은 진행 열쇠도 못 쓰게 돼요.</p>
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
  if (cur === 'browse') cur = 'box';   // 옛 탭 이름
  if (cur === 'board') cur = 'rooms';   // 이야기는 따로 있는 쪽(board.html)으로 옮겼다(2026-11-16)
  // 메뉴의 «선생님 페이지»·«내 정보»는 주소 끝 #rooms·#me 로 온다. 옛 주소(#p12·#mine·#notes)는 이야기 쪽으로 넘긴다
  function hash() {
    var h = location.hash.slice(1);
    if (/^(p\\d+|mine|notes)$/.test(h)) return location.replace('board.html' + location.search + '#' + h);
    if (h === 'rooms' || h === 'me') { history.replaceState(null, '', location.pathname + location.search); show(h); scrollTo(0, 0); }
  }
  addEventListener('hashchange', hash);
  function show(t) { var on = !mk.hidden; cur = t; tabs.hidden = !on; ps.forEach(function (p) { p.hidden = on && p.dataset.tab !== t; }); bs.forEach(function (b) { b.setAttribute('aria-selected', b.dataset.tab === t); }); try { sessionStorage.setItem('science-room:tab', t); } catch (e) {} }
  bs.forEach(function (b) { b.onclick = function () { show(b.dataset.tab); }; });
  new MutationObserver(function () { show(cur); }).observe(mk, { attributes: true, attributeFilter: ['hidden'] });
  show(cur); hash();
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
  var AREA = ${JSON.stringify(Object.fromEntries(units.map((u) => [u.subjectSlug + '.' + u.unit, u.area || ''])))};   // 단원 → «대단원 › 중단원»(자료 둘러보기 고르기)
  var STDTXT = ${JSON.stringify(Object.fromEntries(units.filter((u) => u.standard).map((u) => [u.standard, u.standardText || ''])))};   // 성취기준 코드 → 설명(수업 통계)
  var GID = qs.get('gid') || ${JSON.stringify(site.googleClientId || '')};
  var KEY = 'science-room:classes';
  var MODES = { anon: '익명', num: '번호만', numname: '번호와 이름' };
${AUTH_JS}
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { msg('이 브라우저에 저장하지 못했어요(사생활 보호 창이면 일반 창에서 열어 주세요).'); } }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function msg(t) { document.getElementById('msg').textContent = t; }
  function find(path) { path = String(path).replace(/^deck\\//, ''); return LESSONS.filter(function (l) { return l.path === path; })[0] || (path.indexOf('my/') === 0 ? { path: path, mine: true } : null); }   // 재생기·내 수업(deck/…)도 같은 차시
  function label(l) { return l.mine ? '내가 만든 수업' : l.unit + ' ' + l.n + '차시 ' + l.title; }
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
  function uhead(l) { var n = LESSONS.filter(function (x) { return x.unit === l.unit && x.subject === l.subject; }).length, first = LESSONS.filter(function (x) { return x.subject === l.subject; })[0]; return (first && first.unit === l.unit && l.subject ? '<h3 class="subjl">' + esc(l.subject) + '</h3>' : '') + '<details class="ugroup"><summary class="uhead"><span class="ucode">' + esc(l.unit) + '</span>' + esc(l.unitTitle) + '<span class="ucount">' + n + '차시</span></summary><ul class="lessons">'; }
  function lessonsHtml(c) {
    var html = '', unit = '';
    LESSONS.forEach(function (l) {
      if (l.unit !== unit) { html += (unit ? '</ul></details>' : '') + uhead(l); unit = l.unit; }
      html += '<li><span>' + esc(l.n + '차시 ' + l.title) + '</span><a class="btn" href="' + esc(l.teacher + '?room=' + c.code + pass) + '">시작</a></li>';
    });
    return html + (unit ? '</ul></details>' : '');
  }
  // 수업방마다 지금 수업 중인지·지난 수업(과목 방이면 반마다), 반 목록 수정
  function status(card, c) {
    var box = card.querySelector('[data-s]');
    fetch(API + '/rooms/' + c.code).then(function (r) { return r.json(); }).then(function (info) {
      if (!info.open) { box.textContent = '닫힌 방이에요(오래 쓰지 않아 닫혔어요). 아래 «설정 → 수업방 삭제»로 목록에서 빼고 새로 만들어 주세요.'; return; }
      var list = info.classes || [];
      if (String(list) !== String(c.classes || [])) update(c.code, { classes: list });
      if (info.name && info.name !== c.name) { update(c.code, { name: info.name }); c.name = info.name; var hn = card.querySelector('[data-name]'); if (hn) hn.textContent = info.name; }   // 다른 기기에서 바꾼 이름
      card.querySelectorAll('[data-ll]').forEach(function (x) { x.textContent = (list.length ? '과목' : '반') + x.dataset.ll; });
      var now = info.lesson && find(info.lesson.path), oc = info.lesson && info.lesson.cls, last = info.last && find(info.last.path);
      if (now) {
        if (openCard[c.code] !== false) card.open = true;   // 손으로 접은 방만 빼고 편다(다시 그리는 사이에 끼어도)
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
  var openSet = {}, openCard = {};                                                  // 설정 칸을 연 수업방
  function update(code, patch) { save(load().map(function (x) { return x.code === code ? Object.assign(x, patch) : x; })); }
  function render() {
    var list = load(), box = document.getElementById('classes');
    if (!list.length) { box.innerHTML = '<div class="card"><p class="muted">아직 만든 수업방이 없어요. 아래에서 과목 이름과 가르치는 반을 넣고 만들어 주세요. 다른 기기에서 만든 수업방은 로그인하면 여기에도 보여요.</p></div>'; return; }
    box.innerHTML = list.map(function (c, i) {
      var join = BASE + 'join.html?room=' + c.code, mode = c.idMode || 'anon', sub = (c.classes || []).length ? '과목' : '반';
      return '<details class="card big room" data-i="' + i + '"' + (openCard[c.code] ? ' open' : '') + '>'   // 접어 두고 수업 중인 방만 편다
        + '<summary><div class="roomhead"><h2 data-name>' + esc(c.name || '수업방') + '</h2><span class="code" title="참여 코드">' + c.code + '</span></div>'
        + '<p class="status" data-s>확인하는 중…</p></summary><div class="roombody">'
        + '<div data-cls></div>'
        + '<p class="linkhead"><span class="label" data-ll=" 링크">' + sub + ' 링크</span><span class="small">반 클래스룸에 한 번 올려 두고, 선생님도 수업 때 이 링크를 열어요</span></p>'
        + '<div class="link">' + esc(join) + '</div>'
        + '<div class="row"><a class="btn main" href="' + esc(join + pass) + '" data-ll=" 링크 열기">' + sub + ' 링크 열기</a><button class="btn" type="button" data-a="copy" data-ll=" 링크 복사">' + sub + ' 링크 복사</button></div>'
        + ((c.classes || []).length ? '' : '<details><summary>차시 바로 시작</summary><div class="ugroups">' + lessonsHtml(c) + '</div></details>')
        + '<details class="set"' + (openSet[c.code] ? ' open' : '') + '><summary>설정 <span class="opt">이름 · 가르치는 반 · 학생 표시 · 삭제</span></summary><div class="setbox">'
        + '<form class="form" data-a="namef"><label class="grow">수업방 이름<input type="text" maxlength="30" value="' + esc(c.name || '') + '" autocomplete="off"></label><button class="btn" type="submit">이름 저장</button></form>'
        + '<div data-clsf></div>'
        + '<div class="field"><span class="flabel">학생 표시</span><div class="row">' + ['anon', 'num', 'numname'].map(function (k) { return '<button class="btn small" type="button" data-m="' + k + '" aria-pressed="' + (mode === k) + '">' + MODES[k] + '</button>'; }).join('')
        + (mode !== 'anon' ? '<label class="sizebox">인원 <input type="text" inputmode="numeric" data-a="size" value="' + (c.size || '') + '" placeholder="안 정함" aria-label="반 인원"> 명</label>' : '') + '</div>'
        + (mode !== 'anon' ? '<span class="small">인원을 비우면 수업 패널에 들어온 번호만 보여요. 넣으면 안 들어온 번호도 보여요.</span>' : '') + '</div>'
        + '<div class="field"><span class="flabel">수업방 삭제</span><div class="row"><button class="btn warn small" type="button" data-a="del">이 수업방 삭제</button><span class="small">링크로 들어와도 열리지 않고 지난 수업 기록도 사라져요. 되돌릴 수 없어요.</span></div></div>'
        + '</div></details></div></details>';
    }).join('');
    box.querySelectorAll('[data-i]').forEach(function (card) {
      var c = load()[+card.dataset.i];
      status(card, c);
      card.ontoggle = function (e) { if (e.target === card) openCard[c.code] = card.open; };   // 손으로 여닫은 것은 다시 그려도 그대로
      var set = card.querySelector('details.set');
      set.ontoggle = function () { openSet[c.code] = set.open; };          // 다시 그려도 설정 칸을 연 채로
      card.querySelector('[data-a="copy"]').onclick = function (e) { copy(BASE + 'join.html?room=' + c.code, e.currentTarget); };
      card.querySelector('[data-a="del"]').onclick = function (e) {
        var b = e.currentTarget;
        if (!armed(b, '한 번 더 누르면 «' + (c.name || '수업방') + '»을 지워요', '이 수업방 삭제')) return;
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
      box.innerHTML = '<div class="acct"><span class="muted">' + who + (s.admin ? '<span class="tag">관리자</span>' : '') + '<br><span class="small">학교: ' + esc(s.school || '아직 없음') + '</span></span><span class="row"><button class="btn small" type="button" id="editme">내 정보 수정</button>' + out + '</span></div>'
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
      box.innerHTML = '<p class="muted">' + who + ' · <b class="tag next">승인 기다림</b></p><p class="muted">가입 신청을 보냈어요. 관리하는 선생님이 승인하면 이 페이지가 저절로 바뀌어요(30초마다 확인해요).</p><div class="row"><button class="btn main" type="button" id="recheck">승인됐는지 다시 보기</button><button class="btn small" type="button" id="pushme">승인되면 알림 받기</button>' + out + '</div>';
      document.getElementById('pushme').onclick = function () { meMsg('알림을 켜는 중…'); pushOn().then(function () { meMsg('승인되면 이 기기로 알려 드릴게요.'); profCard(); }, function (err) { meMsg(err && err.message !== 'none' ? err.message : '이 브라우저에서는 알림을 켤 수 없어요. 아이폰은 홈 화면에 추가한 앱에서 켤 수 있어요.'); }); };
      document.getElementById('recheck').onclick = function () { meMsg('확인하는 중…'); syncMe().then(function () { meMsg(sess() && sess().status === 'approved' ? '승인됐어요!' : '아직 승인 전이에요.'); renderAll(); }); };
    } else {
      box.innerHTML = '<p class="muted">' + who + ' · <b class="tag">' + (ST[s.status] || '가입 전') + '</b></p>'
        + '<p class="muted">' + (s.status === 'revoked' ? '승인이 해제됐어요. 다시 쓰려면 관리하는 선생님께 문의하거나 다시 신청해 주세요.' : s.status === 'denied' ? '지난 신청이 받아들여지지 않았어요. 내용을 고쳐 다시 신청할 수 있어요.' : '수업방을 만들고 수업하려면 가입 신청을 해 주세요. 관리하는 선생님이 승인하면 바로 쓸 수 있어요.') + '</p>'
        + '<form class="form" id="signup"><label class="grow">이름<input type="text" id="su-name" maxlength="20" autocomplete="name" value="' + esc(s.name || '') + '"></label>'
        + '<label class="grow">학교<input type="text" id="su-school" maxlength="40" placeholder="예: 한민고등학교" autocomplete="organization"></label>'
        + '<label class="grow">가르치는 과목·한 마디(선택)<input type="text" id="su-note" maxlength="120" placeholder="예: 통합과학 2학년" autocomplete="off"></label>'
        + '<p class="small">이 자료는 학교 수업 같은 교육 목적으로만 쓸 수 있어요. 출판사·교육 업체 등의 영리 목적 이용과 무단 복제·재배포는 안 돼요. 신청하면 이 조건과 <a href="policy.html" target="_blank" rel="noopener">약관·개인정보 처리 안내</a>에 동의한 것으로 봐요.</p>'
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

  // 내 수업: 편집기(deck.html?…&edit)에서 저장한 내 수업 목록. 내 수업이 아직 없는 워커(404)면 카드를 숨긴다
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
      card.hidden = document.getElementById('newcard').hidden = false;
      if (j.error) { boxMsg(j.error); return; }
      boxHave = {};
      document.getElementById('boxlist').innerHTML = j.decks.length ? j.decks.map(function (d) {
        boxHave[d.base] = true;
        var day = new Date(d.updated_at);
        return '<div class="row" data-base="' + esc(d.base) + '"><b>' + esc(d.title) + '</b><span class="small">' + d.slides + '장 · ' + (day.getMonth() + 1) + '월 ' + day.getDate() + '일 저장' + (d.origin ? ' · 원작 ' + esc(d.origin) : '') + (d.shared ? ' · <b>공유 중</b>' : '') + '</span>' + (d.shared && d.post ? '<a class="btn small" data-post="' + d.post + '" href="board.html' + (pass ? '?' + pass.slice(1) : '') + '#p' + d.post + '">이야기 ❤️ ' + d.likes + ' · 💬 ' + d.comments + '</a>' : '')
          + '<span class="acts"><a class="btn small main" target="_blank" rel="noopener" href="' + boxUrl(d.base, '&box') + '">수업하기</a>'
          + '<a class="btn small" target="_blank" rel="noopener" href="' + boxUrl(d.base, '&box&edit') + '">수정</a>'
          + '<a class="btn small" target="_blank" rel="noopener" href="' + boxUrl(d.base, '&box&save') + '">내려받기</a>'
          + '<button class="btn small" type="button" data-share="' + (d.shared ? 0 : 1) + '">' + (d.shared ? '공유 끄기' : '공유하기') + '</button>'
          + '<button class="btn small" type="button" data-del>삭제</button></span></div>';
      }).join('') : '<p class="small">아직 담은 수업이 없어요. 위에서 차시를 골라 내 수업에 담아 보세요.</p>';
      boxUnits().then(boxPick);
      if (focus) boxShow(focus, text);
    }, function () { boxMsg('내 수업을 불러오지 못했어요. 인터넷 연결을 확인해 주세요.'); });
  }
  // 새 수업 만들기: 빈 장 하나짜리 수업(my/<번호>/1)을 내 수업에 두고 편집기로 연다(재생기 deck.html이 자료실 차시 없이 연다)
  document.getElementById('newgo').onclick = function () {
    var b = this, say = function (t) { document.getElementById('newmsg').textContent = t; }, name = document.getElementById('newname').value.replace(/\s+/g, ' ').trim();
    if (!name) { say('수업 이름을 적어 주세요.'); document.getElementById('newname').focus(); return; }
    var id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6), base = 'my/' + id + '/1';
    b.disabled = true; say('만드는 중…');
    api('/decks/save', { session: sess().token, base: base, title: name, order: [{ id: 'my.' + id + '.1' }], edits: {} }).then(function (j) {
      b.disabled = false;
      if (j.error) { say(j.error); return; }
      say(''); location.href = boxUrl(base, '&box&edit');   // 뒤로 돌아왔을 때 «만드는 중…»이 남지 않게
    }, function () { b.disabled = false; say('만들지 못했어요. 인터넷 연결을 확인해 주세요.'); });
  };
  // 내 수업에 담기: 고른 차시를 원래 장 순서 그대로 저장한다(워커 /decks/save). 이 브라우저에서 고쳐 둔 작업본이 있으면 그것을 담는다(수정을 누르면 내 수업 것으로 덮이므로)
  document.getElementById('boxadd').onclick = function () { boxAdd(this, document.getElementById('boxlesson').value, boxMsg); };
  // 자료실 차시를 내 수업에 담는다(내 수업 탭의 고르기와 둘러보기 탭의 기본 자료가 함께 쓴다). say: 안내를 적을 곳
  function boxAdd(b, p, say) {
    var m = p.split('/');
    if (!p) return;
    if (boxHave[p]) { say('이미 내 수업에 있는 차시예요. «내 수업»에서 고치거나 수업하세요.'); boxShow(p, '이미 내 수업에 있는 차시예요. 표시한 줄에서 고치거나 수업하세요.'); return; }
    b.disabled = true; say('담는 중…');
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
      if (j.error) { say(j.error); return; }
      say('내 수업에 담았어요. «내 수업»에서 고치거나 수업할 수 있어요.');
      boxCard(p, '내 수업에 담았어요. 수정을 누르면 편집기가 열려요.');
    }, function () { b.disabled = false; say('담지 못했어요. 인터넷 연결을 확인해 주세요.'); });
  }
  document.getElementById('boxlist').onclick = function (e) {
    var row = e.target.closest('[data-base]');
    if (row && e.target.hasAttribute('data-share')) {   // 공유: 승인된 선생님 모두가 «자료 둘러보기»에서 보고 담아 간다
      var on = e.target.getAttribute('data-share') === '1';
      var note = on ? prompt('«' + row.querySelector('b').textContent + '»을(를) 승인된 선생님 모두에게 공유해요. 내 이름과 학교가 함께 보여요.\\n어떤 수업인지 한마디 남겨 주세요. 게시판 «자료 나눔»에 올라가 댓글로 이야기할 수 있어요(비워도 돼요).', '') : '';
      if (note === null) return;
      api('/decks/share', { session: sess().token, base: row.getAttribute('data-base'), on: on, note: note }).then(function (j) { boxMsg(j.error || (on ? '공유했어요. 다른 선생님의 «자료 둘러보기»에 보여요.' : '공유를 껐어요.')); boxCard(); browseCard(); }, function () { boxMsg('바꾸지 못했어요. 인터넷 연결을 확인해 주세요.'); });
      return;
    }
    if (!row || !e.target.hasAttribute('data-del') || !confirm('«' + row.querySelector('b').textContent + '»을(를) 내 수업에서 지울까요? 되돌릴 수 없어요.')) return;
    api('/decks/delete', { session: sess().token, base: row.getAttribute('data-base') }).then(function (j) { boxMsg(j.error || '지웠어요.'); boxCard(); }, function () { boxMsg('지우지 못했어요. 인터넷 연결을 확인해 주세요.'); });
  };

  // 자료 둘러보기: 다른 선생님이 공유한 수업(워커가 걸러서 준다). 미리 보기 · 내 수업에 담기
  function browseMsg(t) { document.getElementById('browsemsg').textContent = t; }
  // 꿈틀 기본 자료: 자료실의 모든 차시를 과목·단원별로 접어 보인다(이 페이지에 든 목록이라 서버 저장이 없다)
  // 과목 · 대단원 · 단원(중단원 - 소단원)으로 좁힌다. 비워 두면 전체. 기본 자료와 공유 수업에 함께 걸린다
  var SHARED = [];
  function brUnits() {
    var g = function (id) { return document.getElementById(id); }, sb = g('brsubj'), bb = g('brbig'), ub = g('brunit'), all = [{ k: '', t: '전체' }];
    var ar = function (l) { return (AREA[ukey(l)] || '').split(' › '); }, kv = function (x) { return x.k; }, tx = function (x) { return x.t; };
    var us = once(LESSONS.filter(function (l) { return UNITS.indexOf(ukey(l)) >= 0; }), ukey);
    opts(sb, all.concat(once(us, function (l) { return l.subject; }).map(function (l) { return { k: l.subject, t: l.subject }; })), kv, tx);
    us = us.filter(function (l) { return !sb.value || l.subject === sb.value; });
    opts(bb, all.concat(sb.value ? once(us, function (l) { return ar(l)[0]; }).map(function (l) { return { k: ar(l)[0], t: ar(l)[0] }; }) : []), kv, tx);
    us = us.filter(function (l) { return !bb.value || ar(l)[0] === bb.value; });
    opts(ub, all.concat(sb.value ? us.map(function (l) { return { k: ukey(l), t: (ar(l)[1] ? ar(l)[1] + ' - ' : '') + l.unit + ' ' + l.unitTitle }; }) : []), kv, tx);
    bb.disabled = ub.disabled = !sb.value;
    return us.filter(function (l) { return !ub.value || ukey(l) === ub.value; });
  }
  function baseList() {
    boxUnits().then(function () {
      var us = brUnits(), keys = us.map(ukey), narrowed = !!document.getElementById('brsubj').value;
      document.getElementById('baselist').innerHTML = us.map(function (u) {
        return '<details' + (us.length === 1 ? ' open' : '') + '><summary><b>' + esc(u.subject + ' ' + u.unit + ' ' + u.unitTitle) + '</b></summary>' + LESSONS.filter(function (l) { return ukey(l) === ukey(u); }).map(function (l) {
          return '<div class="row"><span>' + esc(l.n + '차시 ' + l.title) + '</span><a class="btn small" target="_blank" rel="noopener" href="' + boxUrl(l.path, '') + '">미리 보기</a><button class="btn small" type="button" data-add="' + esc(l.path) + '">내 수업에 담기</button></div>';
        }).join('') + '</details>';
      }).join('');
      // 공유 수업: 고른 단원의 것 + 새로 만든 수업(my/, 단원이 없다)
      var list = SHARED.filter(function (d) { return !narrowed || d.base.indexOf('my/') === 0 || keys.indexOf(d.base.split('/').slice(0, 2).join('.')) >= 0; });
      document.getElementById('browselist').innerHTML = list.length ? list.map(function (d) {
        var day = new Date(d.updated_at);
        // 두 줄: 제목 | 공감·댓글 수, 만든 이 | 단추(2026-11-15 «정렬이 안되어 있고 칸을 많이 잡아먹는다»)
        return '<div class="shrow" data-id="' + d.id + '"><b>' + esc(d.title) + '</b>'
          + (d.post ? '<a class="talk" data-post="' + d.post + '" href="board.html' + (pass ? '?' + pass.slice(1) : '') + '#p' + d.post + '" aria-label="이야기: 공감 ' + d.likes + ', 댓글 ' + d.comments + '" title="이야기 보기">♡ ' + d.likes + '&ensp;💬 ' + d.comments + '</a>' : '<span></span>')
          + '<span class="small">' + esc(d.by || '선생님') + (d.origin ? ' · 원작 ' + esc(d.origin) : '') + ' · ' + d.slides + '장 · ' + (day.getMonth() + 1) + '월 ' + day.getDate() + '일' + (d.mine ? ' · 내가 공유' : '') + '</span>'
          + '<span class="acts"><a class="btn small" target="_blank" rel="noopener" href="' + boxUrl(d.base, '&share=' + d.id) + '">미리 보기</a>'
          + (d.mine ? '' : '<button class="btn small" type="button" data-copy>내 수업에 담기</button>') + '</span></div>';
      }).join('') : '<p class="small">' + (SHARED.length ? '이 단원에 공유된 수업은 아직 없어요.' : '아직 공유된 수업이 없어요. «내 수업»에서 «공유하기»를 누르면 여기에 보여요.') + '</p>';
    });
  }
  document.getElementById('brsubj').onchange = document.getElementById('brbig').onchange = document.getElementById('brunit').onchange = baseList;
  document.getElementById('baselist').onclick = function (e) { var p = e.target.getAttribute('data-add'); if (p) boxAdd(e.target, p, browseMsg); };
  function browseCard() {
    var card = document.getElementById('browsecard'); baseList();
    api('/decks/browse', { session: sess().token }).then(function (j) {
      if (j.http === 404) { card.hidden = true; return; }
      card.hidden = false;
      if (j.error) { browseMsg(j.error); return; }
      SHARED = j.decks; baseList();
    }, function () { browseMsg('불러오지 못했어요. 인터넷 연결을 확인해 주세요.'); });
  }
  document.getElementById('browselist').onclick = function (e) {
    var row = e.target.closest('[data-id]'); if (!row || !e.target.hasAttribute('data-copy')) return;
    var go = function (over) {
      api('/decks/copy', { session: sess().token, id: Number(row.getAttribute('data-id')), over: over }).then(function (j) {
        if (j.exists && !over) { if (confirm('이 차시는 이미 내 수업에 있어요. 담아 온 수업으로 바꿀까요? 지금 내 수업은 사라져요.')) go(true); return; }
        browseMsg(j.error || '내 수업에 담았어요. «내 수업»에서 고치거나 수업할 수 있어요.'); if (!j.error) boxCard();
      }, function () { browseMsg('담지 못했어요. 인터넷 연결을 확인해 주세요.'); });
    };
    go(false);
  };

${STATS_JS}
  // 화면 전체: 로그인 상태에 따라 카드를 보이고 숨긴다
  function renderAll() {
    var s = sess(), ok = !!(s && s.status === 'approved');
    meCard(); adminCard(); profCard();
    if (ok) { boxCard(); browseCard(); statsCard(); } else { document.getElementById('boxcard').hidden = document.getElementById('newcard').hidden = true; document.getElementById('browsecard').hidden = true; document.getElementById('statscard').hidden = true; }
    document.getElementById('makecard').hidden = !ok;
    document.getElementById('classes').hidden = !ok;
    if (ok) render(); else document.getElementById('classes').innerHTML = '';
  }
  // 첫 화면 «새 수업방 만들기»(#makecard)로 왔으면 만들기 칸으로 옮겨 이름 칸에 둔다
  var toMake = function () { var m = document.getElementById('makecard'); if (location.hash === '#makecard' && !m.hidden) { m.scrollIntoView({ block: 'center' }); } };      // 입력 칸은 잡지 않는다(폰에서 들어올 때마다 자판이 올라왔다, 11/14)
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

// 선생님 게시판(board.html, 2026-10-30): 승인된 선생님만(수업방과 같은 구글 로그인).
//   2026-11-15 대표 «접수 같은 기능은 필요없다 · 오류신고나 요청 게시판은 따로 · 쓰레드 형식»: «이야기»(제목·종류 없이 바로 쓰는 글)와 «오류·요청» 둘로 나누고 처리 상태는 뺐다(답은 댓글로)
//   board.html?lesson=tongsci2/2-2-2/1&slide=3 → 그 차시·장이 붙은 새 글 쓰기 · board.html#p12 → 12번 글
//   글은 마크다운. 화면에 띄울 때 marked(MIT)로 바꾸고 DOMPurify(Apache-2.0/MPL)로 위험한 태그를 걸러 낸다
const BOARD_JS = String.raw`
  // 선생님 게시판 화면(2026-11-16 스레드 형태로 새로 짬): 글이 그대로 이어 보이고, 그 자리에서 공감, 글을 열면 답글(한 단계)·사진
  var S = { board: qs.get('lesson') ? 'help' : 'talk', sort: 'new', q: '', page: 0, lesson: qs.get('lesson') || '' };
  var POSTS = {}, MEM = {}, CUR = 0, TO = 0, ME = '';
  function nm(n) { return String(n).split(' · ')[0]; }   // «이름 · 학교»에서 이름만
  function first(t) { return String(t || '').trim().split('\n')[0].slice(0, 80); }   // 제목 칸이 없다: 첫 줄이 제목 구실
  function $(id) { return document.getElementById(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function md(t) { try { return DOMPurify.sanitize(marked.parse(String(t || ''), { breaks: true })); } catch (e) { return '<p>' + esc(t).replace(/\n/g, '<br>') + '</p>'; } }
  function when(ms) { var d = new Date(ms), now = Date.now(), m = Math.round((now - ms) / 60000); return m < 1 ? '방금' : m < 60 ? m + '분 전' : m < 1440 ? Math.round(m / 60) + '시간 전' : (d.getMonth() + 1) + '월 ' + d.getDate() + '일'; }
  function lessonName(p) { var l = LESSONS.filter(function (x) { return x.path === p; })[0]; return l ? l.unit + ' ' + l.n + '차시 ' + l.title : p; }
  function lessonLink(p, slide) { var l = LESSONS.filter(function (x) { return x.path === p; })[0]; return l ? '<a href="' + esc(l.teacher) + (slide ? '#/' + (slide - 1) : '') + '" target="_blank" rel="noopener">' + esc(lessonName(p)) + (slide ? ' · ' + slide + '장' : '') + '</a>' : esc(p || ''); }
  function call(op, body) { var s = sess(); body = body || {}; body.session = s && s.token; return api('/board/' + op, body).then(function (j) { if (j.login) { signedOut(); gate(); throw new Error(j.error); } if (j.error) throw new Error(j.error); return j; }); }
  function say(t) { $('bmsg').textContent = t || ''; if (t) $('bmsg').scrollIntoView({ block: 'nearest' }); }
  // 마크다운 도구는 늦게 받는다(defer). 글을 그리기 전에 다 받았는지 기다린다
  var mdReady = new Promise(function (ok) { if (document.readyState !== 'loading') ok(); else addEventListener('DOMContentLoaded', ok); });

  // ---- 그리는 조각: 이름 첫 글자 동그라미 · 사진 · 아이콘 줄 · «⋯» 메뉴 ----
  var SV = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';
  var IC = {
    heart: SV + '<path d="M12 20.5l-1.3-1.2C5.6 14.700 3 12.200 3 8.900 3 6.400 5 4.500 7.400 4.500c1.800 0 3.500.9 4.600 2.500 1.100-1.600 2.800-2.500 4.600-2.500C19 4.500 21 6.400 21 8.900c0 3.300-2.600 5.800-7.700 10.400L12 20.500z"/></svg>',
    talk: SV + '<path d="M5 4.500h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-8.500L6 21v-3.500H5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2z"/></svg>',
    share: SV + '<path d="M5 12.500V19a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6.500M12 15V4m0 0L8 8m4-4l4 4"/></svg>',
    photo: SV + '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.500" cy="10" r="1.500"/><path d="M21 15.500l-5-5L6 19"/></svg>'
  };
  function hue(n) { var h = 0; for (var i = 0; i < n.length; i++) h = (h * 31 + n.charCodeAt(i)) % 360; return h; }
  function av(n, note) { n = String(n || '?'); var h = hue(n), st = ' style="background:hsl(' + h + ' 45% 88%);color:hsl(' + h + ' 45% 26%)">' + esc(n.charAt(0));   // note 가 있으면 누르는 프로필(그 선생님과의 대화방)
    return note ? '<button type="button" class="av" data-note="' + note + '" aria-label="' + esc(nm(n)) + ' 선생님에게 쪽지 보내기"' + st + '</button>' : '<span class="av" aria-hidden="true"' + st + '</span>'; }
  function pn(r, k) { return r.mine ? '' : k + r.id; }
  function pics(ks) { return ks && ks.length ? '<div class="pics n' + ks.length + '">' + ks.map(function (k) { return '<img data-k="' + esc(k) + '" alt="첨부 사진">'; }).join('') + '</div>' : ''; }
  // 사진은 승인된 선생님만 받는다: 로그인 표를 머리말에 실어 받아 이 화면 안 주소(blob)로 건다
  var BLOB = {};
  function loadPics(root) {
    root.querySelectorAll('img[data-k]').forEach(function (im) {
      var k = im.dataset.k;
      if (!BLOB[k]) BLOB[k] = fetch(API + '/board/img/' + k, { headers: { Authorization: 'Bearer ' + (sess() || {}).token } }).then(function (r) { if (!r.ok) throw 0; return r.blob(); }).then(function (b) { return URL.createObjectURL(b); });
      BLOB[k].then(function (u) { im.src = u; }).catch(function () { delete BLOB[k]; im.alt = '사진을 불러오지 못했어요'; });
    });
  }
  function acts(k, r) {
    return '<div class="acts"><button type="button" class="ab lk" data-like="' + k + r.id + '" aria-pressed="' + !!r.liked + '" aria-label="공감">' + IC.heart + '<span>' + (r.likes || '') + '</span></button>'
      + (k === 'p' ? '<a class="ab" href="#p' + r.id + '" aria-label="답글">' + IC.talk + '<span>' + (r.comments || '') + '</span></a><button type="button" class="ab" data-share="' + r.id + '" aria-label="공유">' + IC.share + '</button>'
        : '<button type="button" class="ab" data-reply="' + r.id + '">' + IC.talk + '<span>답글</span></button>') + '</div>';
  }
  function menu(k, r, admin) {
    var note = r.mine ? '' : '<button type="button" data-note="' + k + r.id + '" data-name="' + esc(r.author_name) + '">쪽지 보내기</button>';
    if (!(r.mine || admin)) return '<details class="menu"><summary aria-label="쪽지 보내기">⋯</summary><div>' + note + '</div></details>';
    var back = k === 'p' && r.hidden && admin && r.kind === 'share';   // 숨긴 자료 나눔 글만 되살릴 수 있다(나머지는 정말 지워진다)
    return '<details class="menu"><summary aria-label="수정·삭제">⋯</summary><div>' + note + (k === 'p' ? '<button type="button" data-edit="' + r.id + '">수정</button>' : '')
      + '<button type="button" class="warn" data-del="' + k + r.id + '"' + (back ? ' data-back="1">다시 보이기' : '>삭제') + '</button></div></details>';
  }
  function head(r, extra, k, admin) { return '<div class="hd"><b' + (r.mine ? '' : ' data-note="' + k + r.id + '"') + '>' + esc(r.author_name) + '</b><span class="meta">' + when(r.created_at) + (extra || '') + '</span>' + menu(k, r, admin) + '</div>'; }
  function postHtml(p, admin, full) {
    var body = (p.body.indexOf(p.title) === 0 || p.title === '사진' ? '' : '<p><b>' + esc(p.title) + '</b></p>') + md(p.body);
    return av(p.author_name, pn(p, 'p')) + '<div class="tb">' + head(p, (p.kind === 'share' ? ' · 자료 나눔' : '') + (p.hidden ? ' · 숨김' : ''), 'p', admin)
      + '<div class="mdb' + (full ? '' : ' clamp" data-open="' + p.id + (p.long ? '" data-long="1' : '')) + '">' + body + '</div>'
      + pics(p.images)
      + (p.lesson && p.kind !== 'share' ? '<p class="meta ltag">' + lessonLink(p.lesson, p.slide) + '</p>' : '')
      + acts('p', p) + '</div>';
  }
  // 그린 뒤: 사진을 받고, 잘린 긴 글에 «더 보기»를 단다
  function after(root) {
    loadPics(root);
    root.querySelectorAll('.mdb.clamp').forEach(function (m) { if (m.dataset.long || m.scrollHeight > m.clientHeight + 4) m.insertAdjacentHTML('afterend', '<a class="morel" href="#p' + m.dataset.open + '">더 보기</a>'); });
  }

  // ---- 사진 고르기: 화면에서 긴 변 1600으로 줄인 JPEG로 바꿔 둔다(4장까지) ----
  function shrink(f) {
    return createImageBitmap(f).then(function (bm) {
      var k = Math.min(1, 1600 / Math.max(bm.width, bm.height)), c = document.createElement('canvas'), x;
      c.width = Math.round(bm.width * k); c.height = Math.round(bm.height * k);
      x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(bm, 0, 0, c.width, c.height);
      var q = 0.82, u; do { u = c.toDataURL('image/jpeg', q); q -= 0.12; } while (u.length > 1.15e6 && q > 0.3);   // 서버 한도 900kB
      if (u.length > 1.15e6) throw 0;
      return u;
    });
  }
  function picker(inp, pv, msg) {
    var P = { list: [] };
    function show() { pv.innerHTML = P.list.map(function (u, i) { return '<span class="pvi"><img src="' + u + '" alt="올릴 사진 ' + (i + 1) + '"><button type="button" data-i="' + i + '" aria-label="사진 빼기">×</button></span>'; }).join(''); }
    pv.onclick = function (e) { var b = e.target.closest('[data-i]'); if (b) { P.list.splice(+b.dataset.i, 1); show(); } };
    inp.onchange = function () {
      var fs = [].slice.call(inp.files, 0, 4 - P.list.length); msg(inp.files.length > fs.length ? '사진은 4장까지 올릴 수 있어요.' : '');
      Promise.all(fs.map(shrink)).then(function (us) { P.list = P.list.concat(us); show(); }).catch(function () { msg('사진을 읽지 못했어요.'); });
      inp.value = '';
    };
    P.clear = function () { P.list = []; show(); };
    return P;
  }
  function grow(t) { t.oninput = function () { t.style.height = 'auto'; t.style.height = t.scrollHeight + 'px'; }; }

  // ---- 들어오기: 로그인 → 승인 확인 ----
  function gate() {
    var s = sess(); profCard();
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
    ME = s.name || s.email;
    $('wav').innerHTML = av(ME);
    route();
  }
  function press() { document.querySelectorAll('[data-b]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.b === S.board)); }); var nt = S.board === 'notes', nb = $('nnew'), my = S.board === 'mine'; nb.hidden = my; $('fq').hidden = !my; if (!my && S.q) { S.q = ''; $('fq').value = ''; }   // 내 글: 글쓰기 대신 찾기
     nb.title = nt ? '새 쪽지' : '글 쓰기'; nb.setAttribute('aria-label', nb.title); nb.onclick = nt ? finder : function () { compose(null, true); }; }   // ✏️(새 쪽지)는 쪽지일 때만, 단추 줄 오른쪽에
  function route() {
    var m = /^#p(\d+)$/.exec(location.hash), r = /^#r([pcn]\d+|u[0-9a-f]{24}|bot)$/.exec(location.hash), h = location.hash.slice(1);
    clearInterval(RT); $('detail').className = 'card'; document.body.classList.remove('inroom');
    if (r) return room(r[1]);
    if (h === 'talk' || h === 'mine' || h === 'notes') { S.board = h; S.lesson = ''; }   // 짝대기 메뉴의 «이야기»·«내 글»·«쪽지»
    if (m) openPost(+m[1]); else { CUR = 0; $('detail').hidden = true; $('listv').hidden = false; press(); compose(); list(); }
  }
  addEventListener('hashchange', function () { if (sess()) route(); });

  // ---- 목록 ----
  var CACHE = 'science-slides:board:';
  function keep() { try { Object.keys(MEM).forEach(function (k) { sessionStorage.setItem(k, JSON.stringify(MEM[k])); }); } catch (e) {} }
  window.kkOut = forget;   // 메뉴의 로그아웃이 부른다: 이 탭에 남은 글 목록을 지운다(공용 컴퓨터)
  function forget() { MEM = {}; try { Object.keys(sessionStorage).forEach(function (k) { if (k.indexOf(CACHE) === 0) sessionStorage.removeItem(k); }); } catch (e) {} }
  function list(more) {
    if (S.board === 'notes') return notes();
    if (!more) S.page = 0;
    // 서버가 멀어 왕복이 느리다: 이 탭에서 지난번에 받은 첫 쪽을 먼저 그리고, 새로 받으면 바꾼다(로그아웃하면 지운다)
    var ck = S.q || S.lesson || more ? '' : CACHE + S.board + S.sort, old = null;
    if (ck) try { old = MEM[ck] || JSON.parse(sessionStorage.getItem(ck)); } catch (e) {}
    if (old) mdReady.then(function () { draw(old); }); else if (!more) $('plist').innerHTML = '<li class="empty">불러오는 중…</li>';
    call('list', { board: S.board, sort: S.sort, q: S.q, lesson: S.lesson, page: S.page }).then(function (j) {
      if (ck) { MEM[ck] = j; keep(); }
      return mdReady.then(function () { draw(j); });
    }).catch(function (e) { say(e.message); });
    function draw(j) {
      $('lessonf').hidden = !S.lesson; $('lessonf').innerHTML = S.lesson ? esc(lessonName(S.lesson)) + ' 글만 보는 중 · <a href="#" id="alll">모두 보기</a>' : '';
      if (S.lesson) $('alll').onclick = function (e) { e.preventDefault(); S.lesson = ''; list(); };
      var html = j.posts.map(function (p) { POSTS[p.id] = p; return '<li class="bp th' + (p.hidden ? ' hid' : '') + '">' + postHtml(p, j.admin) + '</li>'; }).join('');
      if (more) $('plist').insertAdjacentHTML('beforeend', html); else $('plist').innerHTML = html || '<li class="empty">' + (S.board === 'help' ? '아직 들어온 오류·요청이 없어요.' : '아직 글이 없어요. 첫 이야기를 남겨 주세요.') + '</li>';
      after($('plist'));
      $('more').hidden = !j.more; unread(j.unread || 0, j);
    }
  }
  function filters() {
    document.querySelectorAll('[data-b]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.b === S.board)); b.onclick = function () { S.board = b.dataset.b; S.lesson = ''; filters(); if (location.hash) location.hash = ''; else route(); }; });
    $('more').onclick = function () { S.page++; list(true); };
    $('fq').onkeydown = function (e) { if (e.key === 'Enter') { S.q = this.value.trim(); S.page = 0; list(); } };
    $('wlesson').innerHTML = '<option value="">차시 없음</option>' + LESSONS.map(function (l) { return '<option value="' + esc(l.path) + '">' + esc(l.unit + ' ' + l.n + '차시 ' + l.title) + '</option>'; }).join('');
  }

  // ---- 글 쓰기: 목록 위 칸에 바로 쓴다(제목·종류 없음). 오류·요청에서만 차시·장을 붙인다. edit 이면 그 글 수정(사진은 그대로) ----
  var WP = picker($('wfile'), $('wpv'), function (t) { $('wmsg').textContent = t; });
  grow($('wbody'));
  var FIRST = !!qs.get('lesson');   // 차시 «의견» 단추로 왔을 때만 글 칸이 처음부터 열려 있다
  function compose(edit, open) {
    var on = !!edit || !!open || (FIRST && S.board === 'help'); FIRST = false;   // 평소엔 목록만 — ✏️를 눌러야 글 칸이 펼쳐진다(스레드처럼)
    var help = edit ? edit.kind === 'bug' || edit.kind === 'ask' : S.board === 'help';
    $('write').hidden = !on; $('wl').hidden = !help || !!edit; $('wcancel').hidden = !on; $('wpick').hidden = !!edit; $('wmsg').textContent = ''; WP.clear();
    $('wbody').maxLength = 6000; $('wbody').placeholder = help ? '어느 차시 몇 장에서 무엇이 어떻게 보였는지 적어 주세요.' : '수업 이야기, 궁금한 것. 편하게 남겨 주세요.';
    $('wbody').value = edit ? edit.body : ''; $('wsend').textContent = edit ? '수정' : '올리기'; $('wbody').oninput();
    if (on) { $('detail').hidden = true; $('listv').hidden = true; $('nnew').hidden = true; $('wbody').focus(); }
    if (!edit) { $('wlesson').value = S.lesson || ''; $('wslide').value = S.lesson ? parseInt(qs.get('slide'), 10) || '' : ''; }
    $('wform').onsubmit = function (e) {
      e.preventDefault();
      var body = $('wbody').value;
      if (!body.trim() && !WP.list.length) return;
      $('wsend').disabled = true; $('wsend').textContent = edit ? '수정하는 중…' : '올리는 중…';
      (edit ? call('edit', { id: edit.id, title: edit.body.indexOf(edit.title) === 0 ? first(body) || edit.title : edit.title, body: body })
        : call('post', { kind: help ? 'bug' : 'idea', body: body, images: WP.list, lesson: help ? $('wlesson').value || null : null, slide: help ? parseInt($('wslide').value, 10) || null : null }))
        .then(function () { $('wsend').disabled = false; route(); })
        .catch(function (err) { $('wsend').disabled = false; $('wsend').textContent = edit ? '수정' : '올리기'; $('wmsg').textContent = err.message; });
    };
    $('wcancel').onclick = function () { route(); };
  }

  // ---- 글 보기: 글 → 답글 칸 → 답글(답글의 답글은 한 단계, 세로 선 아래) ----
  var CP;
  function openPost(id, again) {
    CUR = id; $('listv').hidden = true; $('write').hidden = true; $('nnew').hidden = true;
    if (!again) { $('detail').hidden = false; $('detail').innerHTML = '<p class="muted">불러오는 중…</p>'; }
    call('get', { id: id }).then(function (j) { return mdReady.then(function () { return j; }); }).then(function (j) {
      if (CUR !== id) return;
      var p = j.post, d = $('detail'), rapi = qs.get('roomapi'); d.hidden = false; TO = 0;
      if (POSTS[id]) { POSTS[id].likes = p.likes; POSTS[id].liked = p.liked; POSTS[id].comments = p.comments; keep(); } else POSTS[id] = p;
      POSTS[id].body = p.body; POSTS[id].long = 0;   // 목록은 긴 글을 잘라 받는다: 수정할 때는 온전한 글로
      var item = function (c) {
        return '<div role="listitem" class="th' + (c.parent_id ? ' sub' : '') + '" id="c' + c.id + '" data-top="' + (c.parent_id || c.id) + '" data-name="' + esc(c.author_name) + '">' + av(c.author_name, pn(c, 'c')) + '<div class="tb">' + head(c, '', 'c', j.admin) + '<div class="mdb">' + md(c.body) + '</div>' + pics(c.images) + acts('c', c) + '</div></div>';
      };
      d.innerHTML = '<p class="backp"><a href="#" id="back">← 목록</a></p><div class="th main' + (p.hidden ? ' hid' : '') + '">' + postHtml(p, j.admin, true) + '</div>'
        + (j.deck ? '<p class="row"><a class="btn main" target="_blank" rel="noopener" href="deck.html?d=' + esc(p.lesson) + '&share=' + j.deck + (rapi ? '&roomapi=' + encodeURIComponent(rapi) : '') + '">수업 미리 보기</a><a class="btn" href="teach.html' + (rapi ? '?roomapi=' + encodeURIComponent(rapi) : '') + '">내 수업에 담으러 가기</a></p>' : p.kind === 'share' ? '<p class="small">지금은 공유를 그만둔 수업이에요.</p>' : '')
        + '<form id="cform" class="th cform">' + av(ME) + '<div class="tb"><p class="meta" id="cto" hidden></p><textarea id="cbody" rows="1" maxlength="3000" aria-label="답글 쓰기"></textarea><div class="pvs" id="cpv"></div>'
        + '<div class="wrow"><label class="ab pick" aria-label="사진 넣기"><input type="file" id="cfile" accept="image/*" multiple>' + IC.photo + '</label><i class="sp"></i><button class="btn main small" type="submit" id="csend">답글</button></div><p class="small" id="dmsg" aria-live="polite"></p></div></form>'
        + '<div class="cl" id="cl" role="list">' + j.comments.filter(function (c) { return !c.parent_id; }).map(function (c) { return item(c) + j.comments.filter(function (x) { return x.parent_id === c.id; }).map(item).join(''); }).join('') + '</div>';
      after(d);
      var dm = function (t) { $('dmsg').textContent = t; }, nm = function (n) { return String(n).split(' · ')[0]; }, ph = function (n) { $('cbody').placeholder = nm(n) + ' 선생님에게 답글 남기기'; };
      CP = picker($('cfile'), $('cpv'), dm); grow($('cbody')); ph(p.author_name);
      $('back').onclick = function (e) { e.preventDefault(); location.hash = ''; };
      // 답글의 «답글»을 누르면 답글 칸이 그 답글 묶음 아래로 간다
      d.replyTo = function (cid) {
        var el = $('c' + cid), all = cid && el ? d.querySelectorAll('#cl [data-top="' + el.dataset.top + '"]') : [];
        TO = all.length ? cid : 0;
        if (TO) { all[all.length - 1].after($('cform')); ph(el.dataset.name); $('cto').innerHTML = esc(nm(el.dataset.name)) + ' 선생님에게 답글 · <a href="#" id="cno">그만두기</a>'; $('cno').onclick = function (e) { e.preventDefault(); d.replyTo(0); }; $('cbody').focus(); }
        else { $('cl').before($('cform')); ph(p.author_name); }
        $('cto').hidden = !TO; $('cform').classList.toggle('sub', !!TO);
      };
      // 답글은 쓴 글을 바로 붙여 보이고(보내는 중), 서버 답이 오면 다시 그린다. 실패하면 떼고 글 칸에 되돌린다
      $('cform').onsubmit = function (e) {
        e.preventDefault();
        var t = $('cbody').value, im = CP.list.slice(), li = document.createElement('div'); if (!t.trim() && !im.length) return;
        li.className = 'th hid' + (TO ? ' sub' : ''); li.innerHTML = av(ME) + '<div class="tb"><p class="meta">보내는 중…</p><div class="mdb">' + md(t) + '</div></div>';
        if (TO) $('cform').before(li); else $('cl').appendChild(li);
        $('cbody').value = ''; CP.clear(); $('csend').disabled = true;
        call('comment', { id: id, body: t, images: im, parent: TO || undefined }).then(function () { openPost(id, true); }).catch(function (er) { li.remove(); $('cbody').value = t; CP.list = im; $('csend').disabled = false; dm(er.message); });
      };
    }).catch(function (e) { say(e.message); location.hash = ''; });
  }
  // ---- 쪽지: 대화방(AX 메신저 모양). 목록은 상대마다 한 줄, 방은 말풍선. 방은 글·답글의 «⋯ 쪽지 보내기»나 목록에서 연다 ----
  var RT = 0, RK = '', RIDS = [];
  function unread(n, j) {   // 탭의 숫자, 그리고 짝대기 단추의 숫자
    var s = sess() || {}, t = j ? j.talk || 0 : s.talk || 0, m = j ? j.mine || 0 : s.mine || 0;   // j(글 목록 응답)가 오면 이야기 새 글·내 글 반응 수도 새로
    $('ndot').textContent = n || ''; $('tdot').textContent = t || ''; $('mdot').textContent = m || '';
    if (s.token && ((s.notes || 0) !== n || (s.talk || 0) !== t || (s.mine || 0) !== m)) { s.notes = n; s.talk = t; s.mine = m; store(SESS, s); profCard(); }
  }
  function notes() {
    $('more').hidden = true; $('lessonf').hidden = true; $('plist').innerHTML = '<li class="empty">불러오는 중…</li>';
    call('notes').then(function (j) {
      unread(j.rooms.reduce(function (a, r) { return a + r.unread; }, 0), j);
      $('plist').innerHTML = (j.rooms.map(function (r) {
        var who = nm(r.name);
        return '<li class="bp th rm" data-room="' + r.with + '">' + (r.bot ? BOTAV : av(who)) + '<div class="tb"><div class="hd"><b>' + esc(who) + (r.bot ? '' : ' 선생님') + '</b><span class="meta">' + when(r.created_at) + '</span></div>'
          + '<div class="rl"><span>' + (r.mine ? '나: ' : '') + esc(r.body) + '</span>' + (r.unread ? '<i class="rn">' + r.unread + '</i>' : '') + '</div></div></li>';
      }).join('') || '<li class="empty">주고받은 쪽지가 없어요. 위의 ✏️ 를 눌러 선생님을 찾거나, 글쓴이 프로필을 눌러 쪽지를 보내 보세요.</li>');
    }).catch(function (e) { say(e.message); });
  }
  // 새 쪽지(2026-11-16): 이름·학교로 선생님을 찾아 누르면 바로 그 대화방이 열린다. 창은 <dialog>(Esc·바깥 초점 막기는 브라우저가)
  var FT = 0, FHINT = '<li class="empty">받는 선생님의 이름이나 학교를 두 글자 넘게 적어 주세요.</li>';
  function finder() {
    var d = $('nfind');
    if (!d) {
      d = document.createElement('dialog'); d.id = 'nfind'; d.setAttribute('aria-label', '새 쪽지');
      d.innerHTML = '<div class="row between"><h2>새 쪽지</h2><button type="button" class="ab" id="nfx" aria-label="닫기">✕</button></div><input id="nfq" type="search" placeholder="이름, 학교로 찾기" aria-label="받는 선생님 찾기" maxlength="20" autocomplete="off"><ul id="nfl" aria-live="polite"></ul>';
      document.body.appendChild(d);
      $('nfx').onclick = function () { d.close(); };
      $('nfq').oninput = function () {
        var q = this.value.trim(); clearTimeout(FT);
        if (q.length < 2) { $('nfl').innerHTML = FHINT; return; }
        FT = setTimeout(function () {
          call('find', { q: q }).then(function (j) {
            if ($('nfq').value.trim() !== q) return;   // 그사이 더 적었으면 버린다
            $('nfl').innerHTML = j.people.map(function (p) { return '<li><button type="button" data-to="' + esc(p.to) + '">' + av(p.name) + '<span>' + esc(p.name) + '</span></button></li>'; }).join('') || '<li class="empty">찾는 선생님이 없어요.</li>';
          }).catch(function (e) { $('nfl').innerHTML = '<li class="empty">' + esc(e.message) + '</li>'; });
        }, 300);
      };
      $('nfl').onclick = function (e) { var b = e.target.closest('[data-to]'); if (b) { d.close(); location.hash = 'r' + b.dataset.to; } };
    }
    $('nfq').value = ''; $('nfl').innerHTML = FHINT; d.showModal();
  }
  // 이모티콘: AX 메신저의 것을 그대로(Microsoft Fluent Emoji 3D, MIT — stickers/NOTICE.txt). [이름, 뜻, 파일]
  var STK = [["thanks","감사합니다","folded_hands_3d_default"],["heart","마음을 담아","red_heart_3d"],["heart-hands","사랑합니다","heart_hands_3d_default"],["bouquet","꽃다발","bouquet_3d"],["touched","감동이에요","smiling_face_with_hearts_3d"],["thumbs-up","좋아요","thumbs_up_3d_default"],["ok","알겠습니다","ok_hand_3d_default"],["check","확인했습니다","check_mark_button_3d"],["salute","넵!","saluting_face_3d"],["raised-hand","저요","raised_hand_3d_default"],["clap","수고하셨습니다","clapping_hands_3d_default"],["muscle","힘내세요","flexed_biceps_3d_default"],["coffee","커피 한 잔","hot_beverage_3d"],["sparkles","최고예요","sparkles_3d"],["party","축하합니다","party_popper_3d"],["partying","신나요","partying_face_3d"],["cake","생일 축하해요","birthday_cake_3d"],["trophy","1등","trophy_3d"],["smile","방긋","smiling_face_with_smiling_eyes_3d"],["grin","활짝","beaming_face_with_smiling_eyes_3d"],["joy","웃겨요","face_with_tears_of_joy_3d"],["rofl","빵 터졌어요","rolling_on_the_floor_laughing_3d"],["wink","찡긋","winking_face_3d"],["bow","죄송합니다","person_bowing_3d_default"],["please","부탁드려요","pleading_face_3d"],["cry","엉엉","loudly_crying_face_3d"],["sweat-smile","머쓱","grinning_face_with_sweat_3d"],["sweat","진땀","downcast_face_with_sweat_3d"],["hooray","만세","raising_hands_3d_default"],["star-struck","멋져요","star-struck_3d"],["fire","화이팅","fire_3d"],["clover","행운을 빌어요","four_leaf_clover_3d"],["thinking","고민 중","thinking_face_3d"],["wave","안녕하세요","waving_hand_3d_default"],["sleeping","졸려요","sleeping_face_3d"],["idea","좋은 생각","light_bulb_3d"]];
  function stkImg(id, size) { for (var i = 0; i < STK.length; i++) if (STK[i][0] === id) return '<img class="stk" src="stickers/fluent/' + STK[i][2] + '.png" alt="' + STK[i][1] + '" width="' + size + '" height="' + size + '" loading="lazy" draggable="false">'; return ''; }   // 목록에 없는 이름은 그리지 않는다
  // 꿈틀이(알림 봇) 얼굴과 카드. 카드는 AX 메신저처럼 아는 모양만 그린다(모르는 카드는 글만 보인다)
  var BOTAV = '<span class="av bot"><img src="brand/kkumteuli.svg" alt=""></span>';
  function cardHtml(n) {
    var c = n.card; if (!c || n.mine) return '';
    if (c.type === 'post' && c.id > 0) return '<p class="rcard"><a class="btn" href="#p' + (+c.id) + '">글 보기</a></p>';
    if (c.type === 'signup' && c.email) return '<p class="rcard">' + (c.state === 'pending'
      ? '<button class="btn main" type="button" data-decide="approve" data-who="' + esc(c.email) + '">승인</button><button class="btn" type="button" data-decide="deny" data-who="' + esc(c.email) + '">거절</button>'
      : '<span class="tag">' + ({ approved: '승인했어요', denied: '거절했어요', revoked: '승인을 해제했어요' }[c.state] || '처리했어요') + '</span>') + '</p>';
    return '';
  }
  function room(key) {
    RK = key; RIDS = []; S.board = 'notes'; press(); $('nnew').hidden = true; $('write').hidden = true; $('listv').hidden = true;
    var d = $('detail'), sig = null, box, shown = null, isBot = false, arm = 0; d.hidden = false; d.className = 'card chat'; document.body.classList.add('inroom'); scrollTo(0, 0);
    d.innerHTML = '<div class="rhead"><button type="button" class="ab" id="rback" aria-label="대화방 목록으로"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 5l-7 7 7 7"/></svg></button><span id="rav"></span><b id="rname"></b></div><div id="rmsgs"></div>'
      + '<div class="pvs" id="rpv"></div><form id="rform"><button type="button" class="ab" id="rplus" aria-label="더하기" aria-expanded="false"><svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v8M8 12h8"/></svg></button><input type="file" id="rfile" accept="image/*" multiple hidden><textarea id="rbody" rows="1" maxlength="1000" aria-label="쪽지 쓰기" placeholder="쪽지 보내기" enterkeyhint="send"></textarea><button type="button" class="ab" id="rsmile" aria-label="이모티콘" aria-expanded="false"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5a4.5 4.5 0 007 0M9 9.5h.01M15 9.5h.01"/></svg></button><button type="submit" aria-label="보내기"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 19V5M5.5 11.5L12 5l6.500 6.5"/></svg></button></form><div class="rplus" id="rplusp" role="group" aria-label="더하기 메뉴" hidden><button type="button" id="rphoto"><span><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="M21 15.500l-5-5L6 19"/></svg></span>사진</button></div><div class="rstk" id="rstk" role="group" aria-label="이모티콘" hidden></div>';
    $('rback').onclick = function () { location.hash = 'notes'; }; box = $('rmsgs');
    var only = document.createElement('p'); only.className = 'muted rbotn'; only.hidden = true; only.textContent = '꿈틀이는 알림만 보내요. 답장은 받지 못해요.'; d.appendChild(only);
    box.addEventListener('click', function (e) {   // 가입 신청 카드의 승인·거절
      var b = e.target.closest('[data-decide]'); if (!b) return; b.disabled = true;
      api('/admin/decide', { session: sess().token, email: b.dataset.who, action: b.dataset.decide }).then(function (j) { if (j.error) throw new Error(j.error); return load(); }).catch(function (er) { b.disabled = false; say(er.message); });
    });
    var RP = picker($('rfile'), $('rpv'), say);
    function panel(which) { [['rplus', 'rplusp'], ['rsmile', 'rstk']].forEach(function (x) { var on = x[0] === which && $(x[1]).hidden; $(x[1]).hidden = !on; $(x[0]).setAttribute('aria-expanded', on); }); }
    $('rplus').onclick = function () { panel('rplus'); };
    $('rphoto').onclick = function () { panel(); $('rfile').click(); };
    $('rsmile').onclick = function () { if (!$('rstk').innerHTML) $('rstk').innerHTML = STK.map(function (x) { return '<button type="button" data-stk="' + x[0] + '" aria-label="' + x[1] + '" title="' + x[1] + '">' + stkImg(x[0], 48) + '</button>'; }).join(''); panel('rsmile'); };
    $('rstk').onclick = function (e) { var b = e.target.closest('[data-stk]'); if (!b) return; panel(); call('note', { to: RK, sticker: b.dataset.stk }).then(function () { return load(true); }).catch(function (er) { say(er.message); }); };
    $('rbody').onfocus = function () { panel(); };
    function load(down) {
      return call('notes', { with: RK }).then(function (j) {
        if (!box.isConnected) return;   // 그 사이 다른 방·목록으로 옮겼다
        var ids = j.notes.map(function (n) { return n.id; }), nu = j.notes.filter(function (n) { return n.unread; }).length, day = '';
        var who = nm(j.name), school = String(j.name).split(' · ')[1] || '';
        isBot = !!j.bot;
        $('rname').textContent = who + (isBot ? '' : ' 선생님'); $('rav').innerHTML = isBot ? BOTAV : av(who); $('rbody').placeholder = isBot ? '모두에게 새 소식 보내기' : '쪽지 보내기'; RIDS = ids;   // 받는 사람은 위에 있다(폰에서 두 줄이 되지 않게 짧게)
        $('rform').hidden = isBot && !j.admin; only.hidden = !(isBot && !j.admin); $('rplus').hidden = $('rsmile').hidden = isBot;
        // 방 열쇠는 남아 있는 쪽지 번호로 둔다(처음 연 글·쪽지가 지워져도 방이 열리게)
        if (ids.length) { RK = 'n' + ids[ids.length - 1]; history.replaceState(null, '', '#r' + RK); }
        if (nu) unread(Math.max(0, ((sess() || {}).notes || 0) - nu));
        var now = ids.join() + '|' + j.notes.map(function (n) { return (n.card && n.card.state) || ''; }).join(); if (now === sig) return; sig = now;
        var was = shown; shown = ids;
        // 맨 위: 상대 얼굴·이름·학교와 «두 분만 봐요» 알림. 그 아래 날짜 알약과 말풍선(시각은 말풍선 밑)
        box.innerHTML = '<div class="rprof">' + (isBot ? BOTAV + '<b>꿈틀이</b><span>꿈틀 알림</span>' : av(who) + '<b>' + esc(who) + ' 선생님</b>' + (school ? '<span>' + esc(school) + '</span>' : ''))
          + '<p class="rlock"><svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 018 0v3"/></svg><span>' + (isBot ? '꿈틀이가 보내는 알림이에요. 선생님만 볼 수 있고, 답장은 받지 못해요.' : '이 쪽지는 보낸 사람과 받은 사람 두 분만 볼 수 있어요. 다른 선생님이나 바깥에 공개되지 않아요.') + '</span></p></div>'
          + (j.notes.map(function (n) {
          var t = new Date(n.created_at), k = t.toDateString(), sep = k === day ? '' : '<p class="rday">' + t.getFullYear() + '. ' + (t.getMonth() + 1) + '. ' + t.getDate() + '.</p>'; day = k;
          return sep + '<div class="rb' + (n.mine ? ' me' : '') + (was && was.indexOf(n.id) < 0 ? ' in' : '') + '">' + pics(n.images) + stkImg(n.sticker, 72) + (n.body ? '<p class="bub">' + esc(n.body) + '</p>' : '') + cardHtml(n) + '<span class="rt"><time>' + t.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit' }) + '</time><button type="button" class="rdel" data-del="n' + n.id + '" hidden>삭제</button></span></div>';
        }).join('') || '<p class="empty">' + (isBot ? '아직 온 알림이 없어요.' : '첫 쪽지를 보내 보세요.') + '</p>');
        loadPics(box);
        if (down || box.scrollHeight - box.scrollTop - box.clientHeight < 120) box.scrollTop = box.scrollHeight;
      });
    }
    $('rform').onsubmit = function (e) {
      e.preventDefault();
      var t = $('rbody'), body = t.value, imgs = RP.list; if (!body.trim() && !imgs.length) return;
      if (isBot && !arm) { arm = 1; say('한 번 더 누르면 승인된 모든 선생님에게 꿈틀이 이름으로 보내요.'); setTimeout(function () { arm = 0; }, 4000); return; } arm = 0;
      t.value = ''; RP.clear(); say('');
      call('note', { to: RK, body: body, images: imgs }).then(function () { return load(true); }).catch(function (er) { t.value = body; say(er.message); });   // 실패하면 글은 되돌리고 사진은 다시 고른다
    };
    $('rbody').onkeydown = function (e) { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing && matchMedia('(hover: hover)').matches) { e.preventDefault(); $('rform').requestSubmit(); } };   // 컴퓨터에서는 엔터로 보낸다
    load(true).catch(function (e) { say(e.message); location.hash = 'notes'; });
    // shortcut: 열려 있는 동안 5초마다 다시 읽는다, 쪽지를 많이 쓰게 되면 수업방처럼 웹소켓으로 바꾼다
    RT = setInterval(function () { if (!document.hidden && d.offsetParent) load().catch(function () {}); }, 5000);
  }
  function armed(b, text, idle) { if (b.dataset.armed) return true; b.dataset.armed = '1'; b.textContent = text; setTimeout(function () { if (b.isConnected) { delete b.dataset.armed; b.textContent = idle; } }, 3000); return false; }

  // ---- 누르기: 공감 · 공유 · 답글 · 수정 · 삭제 · 사진 크게 · 글 열기 ----
  function likeIt(b) {
    // 누르는 즉시 바꾸고 서버 답으로 맞춘다. 실패하면 되돌린다
    var k = b.dataset.like.charAt(0), id = +b.dataset.like.slice(1), on = b.getAttribute('aria-pressed') !== 'true', sp = b.querySelector('span'), n = +sp.textContent || 0;
    var paint = function (o, c) { b.setAttribute('aria-pressed', String(o)); sp.textContent = c || ''; if (k === 'p' && POSTS[id]) { POSTS[id].liked = o; POSTS[id].likes = c; keep(); } };
    paint(on, Math.max(0, n + (on ? 1 : -1))); b.disabled = true;
    call('like', k === 'p' ? { id: id, on: on } : { comment: id, on: on }).then(function (r) { paint(on, r.likes); }).catch(function (e) { paint(!on, n); say(e.message); }).then(function () { b.disabled = false; });
  }
  function shareIt(b) {
    var u = new URL('board.html#p' + b.dataset.share, location.href.split(/[?#]/)[0]).href;
    if (navigator.share) return navigator.share({ url: u }).catch(function () {});
    navigator.clipboard.writeText(u).then(function () { var s = document.createElement('span'); s.textContent = '주소를 복사했어요'; b.appendChild(s); setTimeout(function () { s.remove(); }, 2000); }).catch(function () { say('주소를 복사하지 못했어요: ' + u); });
  }
  function delIt(b) {
    var k = b.dataset.del.charAt(0), id = +b.dataset.del.slice(1), back = !!b.dataset.back;
    if (!back && !armed(b, '한 번 더 누르면 지워져요', '삭제')) return;
    if (k === 'n') return call('notedel', { id: id }).then(function () {
      RIDS = RIDS.filter(function (x) { return x !== id; });
      if (!RIDS.length) { location.hash = 'notes'; return; }
      RK = 'n' + RIDS[0]; history.replaceState(null, '', '#r' + RK); route();
    }).catch(function (e) { say(e.message); });
    call('hide', k === 'p' ? { id: id, on: !back } : { comment: id, on: true }).then(function () {
      if (k === 'c') return openPost(CUR, true);
      Object.keys(MEM).forEach(function (m) { MEM[m].posts = MEM[m].posts.filter(function (p) { return p.id !== id; }); }); keep();
      if (location.hash) location.hash = ''; else list();
    }).catch(function (e) { say(e.message); });
  }
  $('board').addEventListener('click', function (e) {
    var t = e.target.closest('[data-like],[data-share],[data-reply],[data-edit],[data-del],[data-note],[data-open],[data-room],.bub,.rt time,.pics'); if (!t) return;
    var d = t.dataset;
    if (d.like) likeIt(t);
    else if (d.share) shareIt(t);
    else if (d.reply) $('detail').replyTo(+d.reply);
    else if (d.edit) { if (POSTS[d.edit].long) call('get', { id: +d.edit }).then(function (j) { compose(j.post); }).catch(function (er) { say(er.message); }); else compose(POSTS[d.edit]); }
    else if (d.del) delIt(t);
    else if (d.note) { t.closest('details') && (t.closest('details').open = false); location.hash = 'r' + d.note; }
    else if (d.room) location.hash = 'r' + d.room;
    else if (t.matches('.bub,time')) { var x = t.closest('.rb').querySelector('.rdel'); x.hidden = !x.hidden; if (!x.hidden) x.scrollIntoView({ block: 'nearest' }); }   // 말풍선(사진만 보낸 쪽지는 시각)을 누르면 «삭제»가 나온다
    else if (d.open) { if (!e.target.closest('a,button,summary') && !String(getSelection())) location.hash = 'p' + d.open; }
    else t.classList.toggle('open');   // 사진: 누르면 잘리지 않은 크기로, 다시 누르면 접힌다
  });
  // «⋯» 메뉴는 바깥을 누르면 닫힌다
  document.addEventListener('click', function (e) { document.querySelectorAll('details.menu[open]').forEach(function (m) { if (!m.contains(e.target)) m.open = false; }); });

  filters();
  // 저장된 로그인으로 먼저 그린다(로그인 확인을 기다리면 목록이 왕복 한 번만큼 늦게 뜬다). 확인 결과가 다르면 다시 그린다
  var mark = function () { var s = sess(); return s ? s.token + s.status + !!s.admin : ''; }, was = mark();
  var start = gate;
  if (was) start();
  syncMe().then(function () { if (!was || mark() !== was) start(); });
`;

// 약관·개인정보 처리 안내(2026-11-16). 사실이 바뀌면(받는 항목·맡긴 곳·보관 기간) 여기를 먼저 고친다
export function policyPage(site) {
  return `${head('약관·개인정보 처리 안내 · ' + site.name)}
<body>
<div class="wrap">
  <nav class="topnav"><a class="btn small" href="index.html">← 자료실 첫 화면</a><img class="brand" src="brand/frame.svg" alt="${esc(site.name)}" style="height:78px;margin-block:-26px -10px"></nav>
  <header class="pagehead"><h1>약관·개인정보 처리 안내</h1><p class="muted">${esc(site.name)}은 현직 교사 한 사람이 운영하는 비영리 수업 자료실이에요. 시행일 2026년 11월 16일.</p></header>
  <style>.pol h2 { margin-top: 8px; } .pol table { width: 100%; min-width: 520px; border-collapse: collapse; font-size: 15px; } .pol th, .pol td { border: 1px solid var(--rule); padding: 8px 10px; text-align: left; vertical-align: top; } .pol th { background: var(--paper); white-space: nowrap; } .pol .tw { overflow-x: auto; } .pol li { margin: 4px 0; }</style>
  <div class="card pol">
    <h2>이용 약관</h2>
    <ul>
      <li>수업 자료는 학교 수업과 교사 연수 같은 비영리 교육 활동에 자유롭게 쓸 수 있어요(${esc(site.license || '')}). 출판사·교육 업체 등의 영리 목적 이용과 무단 복제·재배포는 안 돼요.</li>
      <li>수업방 만들기, 내 수업, 이야기(게시판), 쪽지는 가입을 신청해 승인받은 선생님만 써요. 학생은 가입이나 로그인 없이 수업방에 들어와요.</li>
      <li>내 수업과 게시판에 올린 글·사진·자료의 권리와 책임은 올린 선생님에게 있어요. 학생 얼굴·이름 같은 다른 사람의 개인정보, 저작권이 있는 자료는 올리지 말아 주세요.</li>
      <li>다른 사람을 괴롭히는 글, 광고, 서비스를 방해하는 이용은 알리지 않고 지우거나 승인을 거둘 수 있어요.</li>
      <li>무료로 운영하는 서비스라 사정에 따라 기능이 바뀌거나 멈출 수 있어요. 중요한 자료는 따로 보관해 주세요.</li>
    </ul>
  </div>
  <div class="card pol">
    <h2>개인정보 처리 안내</h2>
    <h3>1. 받는 정보와 쓰는 곳</h3>
    <div class="tw"><table>
      <tr><th>누구</th><th>받는 정보</th><th>쓰는 곳</th></tr>
      <tr><td>선생님(가입)</td><td>구글 계정의 이메일·이름, 학교, 가입 때 적은 과목·한 마디</td><td>본인 확인, 가입 승인, 게시판·수업 화면의 이름·학교 표시</td></tr>
      <tr><td>선생님(이용)</td><td>수업방 설정(과목·반 이름), 내 수업(고친 슬라이드), 게시판 글·답글·사진·공감, 쪽지, 수업 통계(숫자)</td><td>수업 진행, 선생님 사이 자료·의견 나눔</td></tr>
      <tr><td>선생님(알림을 켰을 때)</td><td>알림을 켠 기기의 알림 주소와 암호 열쇠(브라우저가 만들어 줘요)</td><td>쪽지·내 글의 답글과 공감·가입 승인을 그 기기에 알리기. 알림을 끄거나 로그아웃하면 지워요</td></tr>
      <tr><td>학생</td><td>선생님이 수업방을 «번호만»·«번호와 이름»으로 정했을 때만 번호(와 이름), 수업 중 낸 답. «익명» 방은 받지 않아요</td><td>수업 중 선생님 화면에 참여·응답을 보여 주기</td></tr>
    </table></div>
    <ul>
      <li>학생은 가입하지 않고, 이메일·전화번호 같은 연락처를 받지 않아요. 수업 통계에는 학생 이름·번호를 남기지 않고 숫자만 남겨요.</li>
      <li>이메일은 다른 선생님에게 보이지 않아요(게시판·쪽지에는 이름과 학교만 나와요). 승인된 선생님은 쪽지를 보낼 때 다른 선생님을 이름·학교로 찾을 수 있어요. 가입 신청을 살피는 관리자만 봐요.</li>
      <li>쿠키와 광고·방문자 추적 도구는 쓰지 않아요. 로그인 상태와 학생이 고른 반은 그 기기의 브라우저 저장 공간에만 둬요.</li>
    </ul>
    <h3>2. 보관 기간</h3>
    <ul>
      <li>선생님 계정 정보·내 수업·게시판 글·쪽지: 직접 지우거나 탈퇴를 요청할 때까지. 지우면 서버에서도 바로 지워져요(공유한 수업의 «자료 나눔» 글만 숨김으로 남고, 탈퇴 때 함께 지워요).</li>
      <li>학생 번호·이름과 답: 그 수업 동안만. 다음 수업을 열거나 선생님이 응답을 지우면 없어지고, 한 번 쓰는 방은 마지막 활동 세 시간 뒤, 과목 수업방은 쓰지 않은 지 400일이 지나면 방째 지워져요.</li>
    </ul>
    <h3>3. 맡긴 곳(국외 이전)</h3>
    <div class="tw"><table>
      <tr><th>맡긴 곳</th><th>하는 일</th><th>가는 정보</th></tr>
      <tr><td>Cloudflare, Inc.(미국 등)</td><td>수업방·게시판 서버와 저장</td><td>위 1의 모든 정보</td></tr>
      <tr><td>Google LLC(미국)</td><td>선생님 구글 로그인, 글꼴</td><td>로그인하는 선생님의 계정 확인, 접속 기록</td></tr>
      <tr><td>GitHub, Inc.(미국)</td><td>자료실 화면(웹 쪽) 제공</td><td>접속 기록(IP 주소 등)</td></tr>
      <tr><td>쓰는 브라우저의 알림 서버(Google·Apple·Mozilla·Microsoft)</td><td>알림을 켠 기기로 알림 전달</td><td>암호로 잠근 알림 글(«○○ 선생님이 쪽지를 보냈어요» 같은 한 줄. 쪽지·글 내용은 넣지 않아요)</td></tr>
      <tr><td>Telegram</td><td>관리자에게 가입 신청·새 글 알림</td><td>신청한 선생님의 이름·학교·이메일, 새 글 앞부분</td></tr>
    </table></div>
    <p class="small">이 밖의 곳에 팔거나 넘기지 않아요. 법에 따른 요청이 있을 때만 예외예요.</p>
    <h3>4. 내 정보 보기·고치기·지우기</h3>
    <ul>
      <li>이름·학교는 선생님 페이지 오른쪽 위 이름 → «내 정보»에서 고쳐요. 글·답글·쪽지·내 수업·수업방은 각 화면에서 바로 지워요.</li>
      <li>탈퇴(계정과 남은 자료 모두 지우기)와 그 밖의 요청은 ${site.contact ? esc(site.contact) + '(으)로' : '게시판 «오류·요청»에 글을 남기거나 관리자에게 쪽지로'} 알려 주세요. 확인하는 대로 처리해요.</li>
      <li>학생·보호자는 담임·교과 선생님을 거쳐 같은 요청을 할 수 있어요.</li>
    </ul>
    <h3>5. 지키는 방법</h3>
    <ul>
      <li>모든 통신은 암호화(HTTPS)하고, 로그인 표는 서버에 지문(해시)으로만 둬요. 게시판 사진은 승인된 선생님만 받을 수 있어요.</li>
      <li>공용 컴퓨터에서는 수업 뒤 «로그아웃»을 눌러 주세요.</li>
    </ul>
    <p class="small">개인정보 보호 책임: ${esc(site.author || site.name + ' 운영자')}${site.contact ? ' · ' + esc(site.contact) : ''}. 내용이 바뀌면 이 쪽과 게시판에 먼저 알려요.</p>
  </div>
</div>
</body>
</html>
`;
}

export function boardPage(site, units) {
  const lessons = lessonList(units);
  return `${head('선생님 게시판 · ' + site.name)}
<style>
.kinds { display: flex; flex-wrap: wrap; gap: 6px; }
.rm { cursor: pointer; } .rm .hd .meta { margin-left: auto; } .rl { display: flex; align-items: center; gap: 8px; color: var(--ink-2); font-size: 15px; } .rl span { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.rn { font-style: normal; padding: 2px 7px; border-radius: 99px; background: var(--stamp); color: var(--paper-2); font: 700 12px/1.2 var(--f-body); }
#detail.chat { display: grid; gap: 0; padding: 0; overflow: hidden; }
.rhead { display: flex; align-items: center; gap: 8px; padding: 6px 12px 6px 4px; border-bottom: 1px solid var(--rule); font-size: 16px; } .rhead .ab { justify-content: center; padding: 0; } .rhead .av { width: 32px; height: 32px; font-size: 14px; }
#rmsgs { display: grid; gap: 4px; align-content: start; max-height: 520px; overflow-y: auto; padding: 4px 14px 14px; background: var(--paper); }
.rprof { display: grid; justify-items: center; gap: 4px; padding: 22px 0 6px; text-align: center; } .rprof .av { width: 72px; height: 72px; font-size: 30px; margin-bottom: 6px; } .rprof b { font: 700 19px/1.3 var(--f-body); } .rprof > span { font-size: 14px; color: var(--ink-3); }
.rlock { display: flex; gap: 8px; align-items: flex-start; justify-self: stretch; margin: 12px 0 0; padding: 12px 14px; border-radius: 12px; background: var(--grid); color: var(--ink-2); font-size: 13px; line-height: 1.5; text-align: left; } .rlock svg { flex: none; margin-top: 1px; color: var(--accent); }
.rday { justify-self: center; margin: 18px 0 8px; padding: 4px 14px; border: 1px solid var(--rule); border-radius: 99px; background: var(--paper-2); color: var(--ink-3); font-size: 12px; }
.rb { display: grid; justify-items: start; gap: 4px; margin-bottom: 6px; } .rb.me { justify-items: end; }
.bub { margin: 0; max-width: 82%; padding: 11px 15px; border: 1px solid var(--rule); border-radius: 18px; background: var(--paper-2); font-size: 15px; line-height: 1.55; white-space: pre-wrap; overflow-wrap: anywhere; cursor: pointer; }
.rb.me .bub { border-color: var(--accent); background: var(--accent); color: var(--paper-2); }
.rt { display: flex; align-items: center; gap: 8px; min-height: 18px; padding: 0 4px; } .rb.me .rt { flex-direction: row-reverse; } .rt time { font-size: 11px; color: var(--ink-3); }
.rdel { min-height: 28px; padding: 0 10px; border: 1px solid var(--stamp); border-radius: 99px; background: none; color: var(--stamp); font: 700 12px/1 var(--f-body); cursor: pointer; } .rdel[data-armed] { background: var(--stamp); color: var(--paper-2); }
#rpv { margin: 12px 16px 0; } .rb .pics { width: min(260px, 82%); margin: 0; } .rb.me .pics { justify-self: end; } .rb .pics.n1:not(.open) img { aspect-ratio: 4 / 3; } .rb .pics.open { width: 100%; } .rt time { cursor: pointer; }
#rform { display: flex; align-items: flex-end; margin: 10px 12px 12px; padding: 2px; border: 1px solid var(--rule); border-radius: 26px; background: var(--paper-2); } #rform:focus-within { border-color: var(--ink); } #rform .ab { justify-content: center; padding: 0; border-radius: 50%; }
#rbody { flex: 1; min-width: 0; min-height: 44px; max-height: 120px; box-sizing: border-box; padding: 11px 4px; border: 0; outline: 0; background: none; color: var(--ink); font: 400 16px/1.4 var(--f-body); resize: none; }
#rform [type=submit] { flex: none; width: 36px; height: 36px; margin: 4px; display: grid; place-items: center; border: 0; border-radius: 50%; background: var(--accent); color: var(--paper-2); cursor: pointer; }
#rplus svg { transition: transform .15s; } #rplus[aria-expanded="true"] svg { transform: rotate(45deg); } #rpv .pvi img { width: 48px; height: 48px; }
.av.bot { background: var(--paper-2); border: 1px solid var(--rule); overflow: hidden; } .av.bot img { width: 72%; height: 72%; }
/* 대화방을 열면 위 메뉴 줄만 남기고 화면을 다 쓴다. 입력줄은 늘 바닥에(100dvh — 폰 자판이 올라와도) */
body.inroom { overflow: hidden; } body.inroom .wrap { height: 100dvh; min-height: 0; box-sizing: border-box; display: flex; flex-direction: column; gap: 10px; padding-block: 32px 10px; } body.inroom #bmsg:empty { display: none; }
body.inroom .pagehead, body.inroom #board > .row, body.inroom #wform, body.inroom #listv { display: none; }
body.inroom #board, body.inroom #detail.chat { flex: 1; min-height: 0; display: flex; flex-direction: column; } body.inroom #rmsgs { flex: 1; min-height: 0; max-height: none; }
#rplus[hidden] ~ #rbody { padding-left: 16px; } .rcard { display: flex; align-items: center; gap: 8px; margin: 2px 0 0; } .rbotn { margin: 10px 12px 14px; text-align: center; font-size: 13px; }
/* 움직임은 AX 메신저 것을 따른다: 새 말풍선이 올라오고, 대화방이 옆에서 들어오고, 판이 떠오르고, 안 읽은 수가 톡 */
@keyframes rin { from { opacity: 0; transform: translateY(10px); } } @keyframes rrise { from { opacity: 0; transform: translateY(6px); } } @keyframes rpop { from { transform: scale(.6); } } @keyframes rslide { from { opacity: 0; transform: translateX(18px); } }
.rb.in { animation: rin .24s cubic-bezier(.22, .8, .3, 1); } #rplusp, #rstk { animation: rrise .18s ease-out; } .rn { animation: rpop .2s cubic-bezier(.22, .8, .3, 1); } .card.chat { animation: rslide .22s cubic-bezier(.22, .8, .3, 1); }
@media (prefers-reduced-motion: reduce) { .rb.in, #rplusp, #rstk, .rn, .card.chat, #write { animation: none; } }
.rplus { display: grid; grid-template-columns: repeat(auto-fill, minmax(76px, 1fr)); gap: 8px 2px; padding: 0 12px 12px; } .rplus[hidden], .rstk[hidden] { display: none; }
.rplus button { display: flex; flex-direction: column; align-items: center; gap: 6px; padding: 6px 2px; border: 0; border-radius: 10px; background: none; color: var(--ink); font: 400 12px/1.2 var(--f-body); cursor: pointer; } .rplus button span { display: grid; place-items: center; width: 48px; height: 48px; border-radius: 50%; background: var(--accent-soft); color: var(--accent); }
.rstk { display: grid; grid-template-columns: repeat(auto-fill, minmax(64px, 1fr)); gap: 4px; max-height: 216px; overflow-y: auto; padding: 0 12px 12px; } .rstk button { display: grid; place-items: center; min-height: 64px; padding: 4px; border: 0; border-radius: 10px; background: none; cursor: pointer; } .rstk button:hover { background: var(--accent-soft); } .rstk .stk { width: 48px; height: 48px; }
.stk { display: block; width: 72px; height: 72px; object-fit: contain; user-select: none; }
.kinds i { font-style: normal; } .kinds i:not(:empty) { margin-left: 6px; padding: 1px 7px; border-radius: 99px; background: var(--stamp); color: var(--paper-2); font-size: 12px; }
/* 스레드 한 줄: 왼쪽 이름 동그라미, 오른쪽 이름·글·사진·아이콘 줄 */
.th { display: grid; grid-template-columns: 40px minmax(0, 1fr); gap: 12px; padding: 14px 0; border-bottom: 1px solid var(--rule); margin: 0; }
.th.hid { opacity: .5; }
.av { width: 40px; height: 40px; border-radius: 50%; display: grid; place-items: center; font: 700 17px/1 var(--f-body); }
.tb { display: grid; grid-template-columns: minmax(0, 1fr); gap: 4px; min-width: 0; }
.hd { display: flex; align-items: center; gap: 8px; min-height: 36px; font-size: 15px; line-height: 1.3; } .hd b { overflow-wrap: anywhere; }
.meta { font-size: 13px; color: var(--ink-3); margin: 0; } .hd .meta { flex: 0 0 auto; } .meta.ltag a { color: var(--ink-3); }
ul.plist { list-style: none; margin: 0; padding: 0 16px; background: var(--paper-2); border: 2px solid var(--ink); border-radius: 10px; }
ul.plist > li:last-child, .cl > :last-child { border-bottom: 0; }
#write { padding: 6px 12px 6px 10px; grid-template-columns: 30px minmax(0, 1fr); gap: 8px; background: var(--paper-2); border: 2px solid var(--ink); border-radius: 10px; border-bottom-width: 2px; } #write[hidden] { display: none; } #write { animation: rrise .2s ease-out; } #wbody { min-height: 34vh; } #write .av { width: 30px; height: 30px; font-size: 13px; margin-top: 4px; }
#detail { display: block; padding: 4px 16px 8px; } #detail[hidden] { display: none; } .backp { margin: 10px 0 0; font-size: 14px; }
.empty { color: var(--ink-3); padding: 14px 0; }
button.av { border: 0; padding: 0; cursor: pointer; } .hd b[data-note] { cursor: pointer; }
#nnew[hidden], #fq[hidden] { display: none; } #fq { width: 100%; } #nnew { position: fixed; z-index: 5; right: max(16px, calc(50vw - 424px)); bottom: calc(20px + env(safe-area-inset-bottom)); box-shadow: 0 3px 0 var(--ink); width: 52px; height: 52px; border: 2px solid var(--ink); border-radius: 50%; background: var(--paper-2); font-size: 20px; line-height: 1; cursor: pointer; }
#nfind { width: min(440px, calc(100vw - 32px)); padding: 20px; border: 2px solid var(--ink); border-radius: 16px; background: var(--paper-2); color: var(--ink); } #nfind::backdrop { background: rgba(0, 0, 0, .35); }
#nfind h2 { margin: 0; font-size: 22px; } #nfq { width: 100%; box-sizing: border-box; margin: 14px 0 6px; padding: 12px 14px; border: 2px solid var(--ink); border-radius: 12px; background: var(--paper); color: var(--ink); font: inherit; }
#nfl { list-style: none; margin: 0; padding: 0; min-height: 96px; max-height: 50vh; overflow: auto; } #nfl button { display: flex; align-items: center; gap: 12px; width: 100%; min-height: 52px; padding: 6px 4px; border: 0; background: none; color: var(--ink); font: inherit; text-align: left; cursor: pointer; } #nfl button:hover, #nfl button:focus-visible { background: var(--grid); }
.mdb { font-size: 16px; line-height: 1.65; overflow-wrap: anywhere; min-width: 0; } .mdb > :first-child { margin-top: 0; } .mdb > :last-child { margin-bottom: 0; } .mdb img { max-width: 100%; } .mdb pre, .mdb table { display: block; max-width: 100%; overflow-x: auto; }
.mdb.clamp { max-height: 15em; overflow: hidden; cursor: pointer; } .morel { font-size: 14px; color: var(--ink-3); }
.pics { display: grid; gap: 4px; grid-template-columns: 1fr 1fr; margin-top: 6px; border-radius: 12px; overflow: hidden; cursor: zoom-in; max-width: 520px; }
.pics img { width: 100%; aspect-ratio: 1; object-fit: cover; display: block; background: var(--grid); min-height: 80px; }
.pics.n1 { grid-template-columns: 1fr; } .pics.n1 img { aspect-ratio: auto; max-height: 420px; } .pics.n3 img:first-child { grid-column: span 2; aspect-ratio: 2; }
.pics.open { display: block; cursor: zoom-out; max-width: none; } .pics.open img { aspect-ratio: auto; max-height: none; object-fit: contain; margin-bottom: 4px; }
.acts { display: flex; align-items: center; gap: 2px; margin: 2px 0 -6px -10px; }
.ab { display: inline-flex; align-items: center; gap: 6px; min-width: 44px; min-height: 44px; padding: 0 10px; border: 0; border-radius: 999px; background: none; color: var(--ink-2); font: 400 14px/1 var(--f-body); text-decoration: none; cursor: pointer; }
.ab:hover { background: var(--accent-soft); } .ab:focus-visible, .pick:focus-within, .menu summary:focus-visible, textarea:focus-visible { outline: 3px solid var(--hl); outline-offset: 1px; }
.lk[aria-pressed="true"] { color: var(--stamp); } .lk[aria-pressed="true"] svg { fill: currentColor; }
.menu { margin: 0 0 0 auto; padding: 0; border: 0; position: relative; } .menu summary { list-style: none; width: 36px; height: 36px; display: grid; place-items: center; border-radius: 50%; font-size: 20px; line-height: 1; color: var(--ink-3); cursor: pointer; } .menu summary::-webkit-details-marker { display: none; } .menu summary:hover { background: var(--accent-soft); }
.menu div { position: absolute; right: 0; top: 38px; z-index: 5; display: grid; min-width: 132px; background: var(--paper-2); border: 2px solid var(--ink); border-radius: 10px; overflow: hidden; }
.menu div button { min-height: 44px; padding: 0 14px; border: 0; background: none; text-align: left; font: 700 15px/1.2 var(--f-body); color: var(--ink); white-space: nowrap; cursor: pointer; } .menu div button:hover { background: var(--accent-soft); }
.menu .warn { color: var(--stamp); } .menu .warn[data-armed] { background: var(--stamp); color: var(--paper-2); }
/* 글·답글 쓰는 칸 */
.th textarea { font: 400 16px/1.5 var(--f-body); padding: 7px 0; border: 0; border-radius: 0; background: none; color: var(--ink); width: 100%; box-sizing: border-box; resize: none; overflow: hidden; min-height: 38px; display: block; }
.wrow { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; margin-left: -10px; } .wrow .sp { flex: 1 1 0; }
.wl { display: flex; gap: 8px; flex: 1 1 220px; min-width: 0; } .wl[hidden], .pick[hidden] { display: none; } .wl select { flex: 1 1 0; min-width: 0; } .wl input { flex: 0 0 72px; width: 72px; }
.pick { position: relative; justify-content: center; } .pick input { position: absolute; width: 1px; height: 1px; opacity: 0; }
.pvs { display: flex; flex-wrap: wrap; gap: 10px; } .pvs:empty { display: none; } .pvi { position: relative; } .pvi img { width: 76px; height: 76px; object-fit: cover; border-radius: 8px; display: block; }
.pvi button { position: absolute; top: -8px; right: -8px; width: 28px; height: 28px; border-radius: 50%; border: 2px solid var(--paper-2); background: var(--ink); color: var(--paper-2); font: 700 15px/1 var(--f-body); cursor: pointer; }
/* 답글의 답글: 위 답글 동그라미 가운데에서 내려오는 세로 선 아래 */
.th.sub { margin-left: 19px; padding-left: 21px; border-left: 2px solid var(--rule); border-bottom: 0; grid-template-columns: 32px minmax(0, 1fr); } .th.sub .av { width: 32px; height: 32px; font-size: 14px; }
.th.main { padding-top: 8px; } .cform .av { opacity: .85; }
.btn.small { min-height: 36px; padding: 0 14px; font-size: 14px; }
</style>
<body>
<div class="wrap">
  <nav class="topnav"><a class="btn small" href="index.html">← 자료실 첫 화면</a><img class="brand" src="brand/frame.svg" alt="${esc(site.name)}" style="height:78px;margin-block:-26px -10px"><span id="prof"></span></nav>
  <header class="pagehead">
    <h1>이야기</h1>
    <p class="muted">수업 이야기는 «이야기»에, 찾은 오류와 바라는 점은 «오류·요청»에 남겨 주세요.</p>
  </header>
  <div class="card" id="gate" hidden><div id="gatebox"></div></div>
  <div id="board" hidden class="stack">
    <div class="row between"><div class="kinds" role="group" aria-label="게시판"><button class="btn small" type="button" data-b="talk">이야기<i id="tdot"></i></button><button class="btn small" type="button" data-b="help">오류·요청</button><button class="btn small" type="button" data-b="mine">내 글<i id="mdot"></i></button><button class="btn small" type="button" data-b="notes">쪽지<i id="ndot"></i></button></div><button type="button" id="nnew" aria-label="새 쪽지" title="새 쪽지" hidden>✏️</button></div>
    <p class="small" id="bmsg" aria-live="polite"></p>
    <form id="wform">
      <div id="write" class="th" hidden>
        <span id="wav"></span>
        <div class="tb">
          <textarea id="wbody" rows="1" maxlength="6000" aria-label="글 쓰기"></textarea>
          <div class="pvs" id="wpv"></div>
          <div class="wrow"><label class="ab pick" id="wpick" aria-label="사진 넣기"><input type="file" id="wfile" accept="image/*" multiple><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8.5" cy="10" r="1.5"/><path d="M21 15.5l-5-5L6 19"/></svg></label><span class="wl" id="wl" hidden><select id="wlesson" aria-label="차시"></select><input type="text" inputmode="numeric" id="wslide" placeholder="몇 장" aria-label="장"></span><i class="sp"></i><button class="btn small" type="button" id="wcancel" hidden>그만두기</button><button class="btn main small" type="submit" id="wsend">올리기</button></div>
          <p class="small" id="wmsg" aria-live="polite"></p>
        </div>
      </div>
    </form>
    <div id="listv" class="stack">
      <input type="text" id="fq" placeholder="내 글·답글 단 글에서 찾기" aria-label="찾기" enterkeyhint="search" hidden>
      <p class="small" id="lessonf" hidden></p>
      <ul class="plist" id="plist"></ul>
      <button class="btn" type="button" id="more" hidden>더 보기</button>
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
