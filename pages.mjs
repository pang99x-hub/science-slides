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
input[type=password] { font: 600 18px/1.3 var(--f-body); padding: 10px 12px; border: 2px solid var(--ink); border-radius: 8px; background: var(--paper); color: var(--ink); min-width: 0; width: 100%; }
.pin-ok { color: var(--accent); font-weight: 700; }
.pin-no { color: var(--stamp); }
</style>
</head>`;

const lessonList = (units) => units.flatMap((u) => u.lessons.map((l) => ({ ...l, unit: u.unit, unitTitle: u.unitTitle, subject: u.subject, path: l.student.replace(/\/student\.html$/, '') })));
const lessonData = (lessons) => JSON.stringify(lessons.map((l) => ({ unit: l.unit, unitTitle: l.unitTitle, n: l.n, title: l.title, path: l.path, student: l.student, teacher: l.teacher })));

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
  // ---- 선생님으로 들어가기: 수업방을 만들 때 정한 선생님 비밀번호 → 이 기기에 진행 열쇠 ----
  var PIN = 'science-room:pin', pinTried = false;
  function savedPin() { try { return localStorage.getItem(PIN); } catch (e) { return null; } }
  function teacherDoor(info) {
    $('foot').innerHTML = '<button class="btn" type="button" id="tdoor">선생님이세요? 비밀번호로 들어가기</button>';
    $('tdoor').onclick = function () { pinForm(info); };
  }
  function pinForm(info) {
    if (ws) { gone = true; try { ws.close(); } catch (x) {} ws = null; gone = false; }
    $('lib').hidden = true; $('foot').innerHTML = '';
    if (!info.pin) {
      show('<h2>선생님으로 들어가기</h2><p class="muted">이 수업방은 아직 선생님 비밀번호가 없어요. 수업방을 만든 기기에서 선생님 페이지를 열고 비밀번호를 정하면, 그다음부터는 어느 기기에서든 여기서 비밀번호만 넣으면 돼요.</p><div class="row"><a class="btn main" href="teach.html' + (pass ? '?' + pass.slice(1) : '') + '">선생님 페이지</a><button class="btn" type="button" id="pinback">학생 화면으로</button></div>');
    } else {
      show('<h2>선생님으로 들어가기</h2><p class="muted">수업방을 만들 때 정한 <b>선생님 비밀번호</b>를 넣으면 이 기기가 선생님 기기가 돼요. 기기마다 한 번만 하면 되고, 이 기기에서는 다른 수업방 링크도 저절로 선생님으로 열려요.</p>'
        + '<form class="row" id="pinf"><input type="password" id="pin" autocomplete="current-password" placeholder="선생님 비밀번호" aria-label="선생님 비밀번호" style="flex:1 1 220px"><button class="btn main" type="submit">들어가기</button></form>'
        + '<p class="small" id="pinm" aria-live="polite"></p><div class="row"><button class="btn" type="button" id="pinback">학생 화면으로</button></div>');
      $('pin').focus();
      $('pinf').onsubmit = function (e) { e.preventDefault(); var v = $('pin').value.trim(); if (v.length < 6) { $('pinm').textContent = '비밀번호를 6글자 이상 넣어 주세요.'; return; } $('pinm').textContent = '확인하는 중…'; unlock(v, false); };
    }
    $('pinback').onclick = function () { check(); };
  }
  function unlock(pin, silent) {
    fetch(API + '/rooms/' + code + '/teacher', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ pin: pin }) })
      .then(function (r) { return r.json(); }).then(function (j) {
        if (!j.ok || !j.key) { if (silent) check(); else $('pinm').textContent = j.error || '들어가지 못했어요.'; return; }
        try {
          var list = (JSON.parse(localStorage.getItem('science-room:classes')) || []).filter(function (c) { return c.code !== code; });
          list.push({ code: code, key: j.key, name: j.name, idMode: j.idMode, size: j.size, pin: true });
          localStorage.setItem('science-room:classes', JSON.stringify(list));
          localStorage.setItem(PIN, pin);
        } catch (x) { if (!silent) $('pinm').textContent = '이 브라우저에 저장하지 못했어요(사생활 보호 창이면 일반 창에서 열어 주세요).'; return; }
        location.replace(location.href.split('#')[0]);           // 선생님 화면으로 다시 연다
      }).catch(function () { if (silent) check(); else $('pinm').textContent = '연결하지 못했어요. 인터넷 연결을 확인해 주세요.'; });
  }
  function check() {
    fetch(API + '/rooms/' + code).then(function (r) { return r.json(); }).then(function (info) {
      if (!info.open) { show('<h2>이 반 수업방은 닫혔어요</h2><p class="muted">' + (teacher ? '선생님 페이지에서 새로 만들어 주세요.' : '선생님께 새 링크를 받아 주세요. 아래 차시는 혼자 볼 수 있어요.') + '</p>'); library(false); return; }
      $('title').textContent = (info.name || '반') + ' 수업방' + (teacher ? ' · 선생님' : '');
      if (teacher) { teacherView(info); return; }
      if (preview) { previewView(info); return; }
      // 이 기기에 선생님 비밀번호가 저장돼 있으면(다른 반에서 한 번 넣음) 조용히 선생님으로 열어 본다
      if (info.pin && !pinTried && savedPin()) { pinTried = true; unlock(savedPin(), true); return; }
      teacherDoor(info);
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
  $('foot').textContent = teacher ? '이 기기에 진행 열쇠가 있어서 학생과 같은 링크가 선생님 화면으로 열려요. 학생 기기에서는 학생 화면으로 열려요.' : '';
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
  <p class="muted">과목마다 수업방을 하나 만들고 가르치는 반을 적어 두세요. 그 <b>과목 링크</b>를 반마다 클래스룸에 한 번만 올려 두면 돼요. 학생은 처음 한 번 자기 반을 고르고, 그 링크로 언제든 들어와 복습해요. 선생님이 반을 골라 수업을 열면 <b>그 반 학생만</b> 수업 차시로 저절로 옮겨 가요. 선생님도 수업 때 <b>같은 링크</b>를 열면 돼요. 처음 쓰는 기기라면 «선생님이세요?»에 선생님 비밀번호를 한 번 넣어요.</p>
  <div class="card" id="pincard">
    <h2>선생님 비밀번호</h2>
    <div id="pinbox"></div>
    <p class="small" id="pinmsg" aria-live="polite"></p>
  </div>
  <div id="classes" style="display:grid;gap:16px"></div>
  <div class="card">
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
    <h2>다른 기기에서 수업하기</h2>
    <p class="muted">집 컴퓨터·휴대폰·다른 교실 컴퓨터에서는 클래스룸에 올린 <b>과목 링크</b>를 열고, 아래쪽 <b>«선생님이세요? 비밀번호로 들어가기»</b>에 선생님 비밀번호만 넣으면 돼요. 그 기기에서는 다른 수업방 링크도 저절로 선생님으로 열려요. 휴대폰에서 같은 차시를 열면 리모컨처럼 함께 넘어가요.</p>
    <p class="small note">선생님 비밀번호는 학생에게 알려 주지 마세요. 5번 틀리면 10분 동안 잠겨요. 함께 쓰는 교실 컴퓨터라면 수업 뒤 이 페이지에서 «이 기기에서 지우기»를 눌러 주세요.</p>
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
  var PIN = 'science-room:pin';
  function savedPin() { try { return localStorage.getItem(PIN); } catch (e) { return null; } }
  function load() { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch (e) { return []; } }
  function save(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { msg('이 브라우저에 저장하지 못했어요(사생활 보호 창이면 일반 창에서 열어 주세요).'); } }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function msg(t) { document.getElementById('msg').textContent = t; }
  function find(path) { return LESSONS.filter(function (l) { return l.path === path; })[0] || null; }
  function label(l) { return l.unit + ' ' + l.n + '차시 ' + l.title; }
  function post(path, body) { return fetch(API + '/rooms/' + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).then(function (r) { return r.json(); }); }
  function parseCls(v) { return String(v || '').split(/[,，、\\n]/).map(function (x) { return x.replace(/\\s+/g, ' ').trim(); }).filter(Boolean); }
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
  // 수업방마다 지금 수업 중인지·지난 수업(과목 방이면 반마다), 반 목록 고치기
  function status(card, c) {
    var box = card.querySelector('[data-s]');
    fetch(API + '/rooms/' + c.code).then(function (r) { return r.json(); }).then(function (info) {
      if (!info.open) { box.textContent = '닫힌 방이에요(오래 쓰지 않아 닫혔어요). 이 기기에서 지우고 새로 만들어 주세요.'; return; }
      var list = info.classes || [];
      if (String(list) !== String(c.classes || [])) update(c.code, { classes: list });
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
      box.insertAdjacentHTML('beforeend', info.pin ? ' · <span class="pin-ok">비밀번호 걸림</span>' : ' · <b class="pin-no">비밀번호 없음</b>');
      if (!info.pin && savedPin()) {
        box.insertAdjacentHTML('beforeend', ' <button class="btn" type="button" data-a="pin" style="min-height:36px">지금 걸기</button>');
        box.querySelector('[data-a="pin"]').onclick = function () { post(c.code + '/settings', { key: c.key, pin: savedPin() }).then(function (j) { if (j.error) msg(j.error); status(card, c); }); };
      }
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
    if (!list.length) { box.innerHTML = '<div class="card"><p class="muted">아직 만든 수업방이 없어요. 아래에서 과목 이름과 가르치는 반을 넣고 만들어 주세요.</p></div>'; return; }
    box.innerHTML = list.map(function (c, i) {
      var join = BASE + 'join.html?room=' + c.code, mode = c.idMode || 'anon', sub = (c.classes || []).length ? '과목' : '반';
      return '<div class="card big" data-i="' + i + '">'
        + '<div class="row between"><h2>' + esc(c.name || '수업방') + '</h2><span class="code" title="참여 코드">' + c.code + '</span></div>'
        + '<p class="status" data-s>확인하는 중…</p>'
        + '<div data-cls style="display:grid;gap:10px"></div>'
        + '<p class="small"><span data-ll=" 링크">' + sub + ' 링크</span> — 가르치는 반 클래스룸마다 한 번 올려 두세요. 선생님도 수업 때 이 링크를 열어요.</p><div class="link">' + esc(join) + '</div>'
        + '<div class="row"><a class="btn main" href="' + esc(join + pass) + '" data-ll=" 링크 열기">' + sub + ' 링크 열기</a><button class="btn" type="button" data-a="copy" data-ll=" 링크 복사">' + sub + ' 링크 복사</button></div>'
        + '<div class="row"><span class="small">학생 표시</span>' + ['anon', 'num', 'numname'].map(function (k) { return '<button class="btn" type="button" data-m="' + k + '" aria-pressed="' + (mode === k) + '">' + MODES[k] + '</button>'; }).join('')
        + (mode !== 'anon' ? '<label class="sizebox">인원 <input type="text" inputmode="numeric" data-a="size" value="' + (c.size || 30) + '" aria-label="반 인원"> 명</label>' : '') + '</div>'
        + ((c.classes || []).length ? '' : '<details><summary>차시 바로 시작</summary><ul class="lessons">' + lessonsHtml(c) + '</ul></details>')
        + '<details><summary>이 기기 관리</summary><div class="row"><button class="btn" type="button" data-a="move">다른 기기용 링크 복사</button><button class="btn warn" type="button" data-a="del">이 기기에서 지우기</button></div>'
        + '<p class="small">지워도 링크와 학생 기록은 그대로예요. 다른 기기용 링크가 있으면 되살릴 수 있어요.</p></details>'
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
  function pinMsg(t) { document.getElementById('pinmsg').textContent = t; }
  function pinCard(editing) {
    var box = document.getElementById('pinbox'), has = !!savedPin();
    if (has && !editing) {
      box.innerHTML = '<p class="muted">이 기기에 저장돼 있어요. 새로 만드는 수업방에 저절로 걸려요.</p><div class="row"><button class="btn" type="button" id="pinchg">바꾸기</button><button class="btn warn" type="button" id="pindel">이 기기에서 지우기</button></div>';
      document.getElementById('pinchg').onclick = function () { pinCard(true); };
      document.getElementById('pindel').onclick = function (e) {
        if (!armed(e.currentTarget, '한 번 더 누르면 이 기기의 비밀번호와 반 열쇠를 지워요', '이 기기에서 지우기')) return;
        try { localStorage.removeItem(PIN); localStorage.removeItem(KEY); } catch (x) {}
        pinMsg('이 기기에서 지웠어요. 수업방과 학생 기록은 그대로예요. 다시 쓰려면 수업방 링크에서 비밀번호를 넣으면 돼요.'); pinCard(); render();
      };
      return;
    }
    box.innerHTML = '<p class="muted">한 번 정해 두면 어느 기기에서든 수업방 링크의 «선생님이세요?»에 이 비밀번호만 넣으면 선생님 화면이 돼요.</p>'
      + '<form class="form" id="pinset"><label class="grow">선생님 비밀번호(6글자 이상)<input type="password" id="tpin" autocomplete="new-password"></label><button class="btn main" type="submit">정하기</button></form>';
    document.getElementById('pinset').onsubmit = function (e) {
      e.preventDefault();
      var v = document.getElementById('tpin').value.trim();
      if (v.length < 6) { pinMsg('6글자 이상으로 정해 주세요.'); return; }
      try { localStorage.setItem(PIN, v); } catch (x) { pinMsg('이 브라우저에 저장하지 못했어요.'); return; }
      var list = load();
      if (!list.length) { pinMsg('정했어요. 이제 아래에서 수업방을 만들면 이 비밀번호가 걸려요.'); pinCard(); return; }
      pinMsg('이 기기의 수업방 ' + list.length + '개에 거는 중…');
      Promise.all(list.map(function (c) { return post(c.code + '/settings', { key: c.key, pin: v }).catch(function () { return { error: 1 }; }); })).then(function (rs) {
        var ok = rs.filter(function (r) { return !r.error; }).length;
        pinMsg('정했어요. 이 기기의 수업방 ' + ok + '개에 걸었어요.'); pinCard(); render();
      });
    };
  }
  pinCard();
  var idmode = document.getElementById('idmode');
  idmode.onchange = function () { document.getElementById('sizeWrap').hidden = idmode.value === 'anon'; };
  document.getElementById('make').onsubmit = function (e) {
    e.preventDefault();
    var name = document.getElementById('name').value.trim();
    if (!name) { msg('이름을 넣어 주세요.'); return; }
    if (!API) { msg('수업방 주소가 없어요.'); return; }
    if (!savedPin()) { msg('먼저 위에서 선생님 비밀번호를 정해 주세요. 다른 기기에서 선생님으로 들어갈 때 써요.'); pinCard(true); var t = document.getElementById('tpin'); if (t) t.focus(); return; }
    msg('만드는 중…');
    var mode = idmode.value, size = parseInt(document.getElementById('size').value, 10) || 30, cls = parseCls(document.getElementById('cls').value);
    fetch(API + '/rooms', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ persist: true, name: name, idMode: mode, size: size, pin: savedPin(), classes: cls }) })
      .then(function (r) { return r.json(); }).then(function (j) {
        if (!j.code || !j.key) throw new Error(j.error || '만들지 못했어요');
        var got = j.classes || [];
        var l = load(); l.push({ code: j.code, key: j.key, name: j.name || name, idMode: j.idMode || mode, size: j.size || size, classes: got }); save(l);
        document.getElementById('name').value = ''; document.getElementById('cls').value = '';
        msg(name + ' 수업방을 만들었어요. ' + (got.length ? '과목 링크를 ' + got.join(', ') + ' 클래스룸에 올려 두세요.' : '반 링크를 그 반 클래스룸에 올려 두세요.') + (got.length < cls.length ? ' (반 이름은 글자·숫자로 10자 안, 16개까지예요.)' : '')); render();
      }).catch(function (err) { msg((err && err.message) || '만들지 못했어요. 인터넷 연결을 확인해 주세요.'); });
  };
  render();
})();
</script>
</body>
</html>
`;
}
