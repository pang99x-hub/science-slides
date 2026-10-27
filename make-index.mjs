// 자료실 첫 화면(index.html)을 site.json과 lessons.json으로 만든다. 단원 빌드가 끝날 때마다 불린다.
//   node make-index.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { joinPage, teachPage } from './pages.mjs';
import { guidePage } from './guide.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const site = JSON.parse(readFileSync(join(here, 'site.json'), 'utf8'));
const { units } = existsSync(join(here, 'lessons.json')) ? JSON.parse(readFileSync(join(here, 'lessons.json'), 'utf8')) : { units: [] };
// 차시 폴더에 slides.pdf(tools/pdf.mjs가 만든 화면 모음)가 있으면 링크를 단다
const pdfOf = (l) => { const p = posix.join(posix.dirname(l.student), 'slides.pdf'); return existsSync(join(here, p)) ? p : null; };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// 참여 코드 넣기: 반·과목 방(6자리)은 join.html로, 한 번 쓰는 방(4자리)은 선생님이 연 차시 학생용으로
const JOIN_JS = String.raw`
(function () {
  var f = document.getElementById('joinf'); if (!f) return;
  var qs = new URLSearchParams(location.search);
  var API = (qs.get('roomapi') || f.dataset.api || '').replace(/\/$/, '');
  var pass = qs.get('roomapi') ? 'roomapi=' + encodeURIComponent(qs.get('roomapi')) : '';
  var say = function (t) { document.getElementById('joinmsg').textContent = t; };
  var esc = function (x) { return String(x == null ? '' : x).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var stored = function (k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } };
  var tail = pass ? '&' + pass : '';
  // 이 기기에서 로그인한 승인 선생님: 내 수업방을 바로 연다
  var sess = stored('science-room:session'), rooms = stored('science-room:classes') || [];
  if (sess && sess.token && sess.status === 'approved') {
    var tm = document.getElementById('tmine');
    tm.innerHTML = '<p class="who2"><b>' + esc(String(sess.name || sess.email).replace(/\s*선생님$/, '')) + '</b> 선생님 · 이 기기에 로그인돼 있어요</p>'
      + (rooms.length ? '<ul>' + rooms.map(function (r) { return '<li><span><b>' + esc(r.name || '수업방') + '</b> <span class="sub">' + esc((r.classes || []).join(' · ') || r.code) + '</span></span><a class="btn main" href="join.html?room=' + esc(r.code) + tail + '">수업 열기</a></li>'; }).join('') + '</ul>' : '<p class="who2">아직 만든 수업방이 없어요.</p>');
    tm.hidden = false; document.getElementById('tguest').hidden = true;
    var tg = document.getElementById('tgo'); tg.textContent = rooms.length ? '새 수업방 만들기 · 선생님 페이지' : '새 수업방 만들기'; tg.href = 'teach.html' + (pass ? '?' + pass : '') + '#makecard';
    if (rooms.length) tg.classList.remove('main');
  }
  // 학생: 이 기기로 들어갔던 반·과목 수업방 다시 들어가기
  var seen = [];
  try { for (var k = 0; k < localStorage.length; k++) { var key = localStorage.key(k); if (/^science-room:me:\d{6}$/.test(key)) seen.push(key.slice(16)); } } catch (e) {}
  seen = seen.filter(function (c) { return !rooms.some(function (r) { return r.code === c; }); }).slice(0, 4);
  if (seen.length) Promise.all(seen.map(function (c) { return fetch(API + '/rooms/' + c).then(function (r) { return r.json(); }).then(function (i) { return i.open ? { c: c, i: i, me: stored('science-room:me:' + c) || {} } : null; }, function () { return null; }); })).then(function (list) {
    list = list.filter(Boolean); if (!list.length) return;
    var sm = document.getElementById('smine');
    sm.innerHTML = '<p class="who2">이 기기로 들어갔던 수업방</p><ul>' + list.map(function (x) { return '<li><span><b>' + esc(x.i.name || '수업방') + '</b> <span class="sub">' + esc([x.me.cls, x.me.num ? x.me.num + '번' : ''].filter(Boolean).join(' ')) + '</span></span><a class="btn main" href="join.html?room=' + x.c + tail + '">다시 들어가기</a></li>'; }).join('') + '</ul>';
    sm.hidden = false;
  });
  f.onsubmit = function (e) {
    e.preventDefault();
    var code = f.code.value.replace(/\s+/g, '');
    if (!/^(\d{4}|\d{6})$/.test(code)) { say('참여 코드는 숫자 네 자리나 여섯 자리예요.'); return; }
    say('확인하는 중…');
    fetch(API + '/rooms/' + code).then(function (r) { return r.json(); }).then(function (info) {
      if (!info.open) { say('열려 있는 수업방이 아니에요. 코드를 다시 확인해 주세요.'); return; }
      if (info.locked) { say('선생님이 방을 잠갔어요.'); return; }
      var go = info.persist ? 'join.html?room=' + code : info.path ? info.path + '/student.html?room=' + code : '';
      if (!go) { say('이 코드는 선생님이 띄운 차시 화면에서 넣어요. 그 차시의 체험하기를 열고 사람 모양 단추를 눌러 주세요.'); return; }
      location.href = go + (pass ? '&' + pass : '');
    }, function () { say('연결하지 못했어요. 인터넷 연결을 확인해 주세요.'); });
  };
})();
`;

const unitHtml = (u) => `
  <section class="unit" id="${esc(u.subjectSlug)}-${esc(u.unit)}">
    <div class="unit-head">
      <p class="crumbs">${esc(u.subject)} · ${esc(u.area)}</p>
      <h2><span class="code">${esc(u.unit)}</span>${esc(u.unitTitle)}</h2>
      <p class="std"><b>성취기준 ${esc(u.standard)}</b> ${esc(u.standardText)}</p>
    </div>
    <ol class="lessons">
${u.lessons.map((l) => `      <li class="lesson">
        <div class="top"><span class="no">${l.n}차시</span>${pdfOf(l) ? `<a class="pdf" href="${esc(pdfOf(l))}" download="${esc(`${u.unit} ${l.n}차시 ${l.title}.pdf`)}" title="장마다 마지막 단계까지 연 화면 모음(A4 가로, 인쇄·복습용)">PDF 받기</a>` : ''}</div>
        <h3>${esc(l.title)}</h3>
        <p class="q">${esc(l.question)}</p>
        <p class="meta">${esc(u.textbook)} ${esc(l.pages)}쪽 기준 · ${l.slides}장</p>
        <div class="go"><a class="btn main" href="${esc(l.student)}" title="학생 화면으로 혼자 넘겨 보며 조작해 봐요">체험하기</a><a class="btn" href="${esc(l.teacher)}" title="발표자 메모가 있는 선생님 화면(수업방 없이 띄울 때)">선생님 화면</a></div>
      </li>`).join('\n')}
    </ol>
    <p class="upd">${esc(u.updated)} 고침</p>
  </section>`;

const html = `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(site.name)}</title>
<meta name="description" content="${esc(site.tagline)}">
${site.draft ? '<meta name="robots" content="noindex">\n' : ''}<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hahmlet:wght@700;800&family=IBM+Plex+Sans+KR:wght@400;500;600;700&family=Nanum+Pen+Script&display=swap">
<style>
/* 슬라이드와 같은 «모눈 실험 노트». 프로젝터·종이 느낌 그대로 밝은 판 하나로 둔다 */
:root {
  color-scheme: light;
  --paper: #f2f5f3; --paper-2: #fbfcf9; --grid: #dbe4e2; --grid-strong: #c9d5d3;
  --ink: #1d2433; --ink-2: #4b566a; --ink-3: #6b7587; --rule: #c3cecd;
  --accent: #1f5f4a; --accent-soft: #dcebe4; --hl: #ffe27a; --stamp: #c8402f;
  --f-display: "Hahmlet", "Apple SD Gothic Neo", "Malgun Gothic", serif;
  --f-body: "IBM Plex Sans KR", "Apple SD Gothic Neo", "Malgun Gothic", sans-serif;
  --f-pen: "Nanum Pen Script", "Apple SD Gothic Neo", cursive;
}
* { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; }
body {
  margin: 0; color: var(--ink); font: 400 17px/1.6 var(--f-body); word-break: keep-all; overflow-wrap: break-word;
  background-color: var(--paper);
  background-image: linear-gradient(var(--grid) 1px, transparent 1px), linear-gradient(90deg, var(--grid) 1px, transparent 1px);
  background-size: 32px 32px;
}
.wrap { max-width: 1120px; margin: 0 auto; padding-block: 0 48px; padding-left: max(16px, env(safe-area-inset-left, 0px)); padding-right: max(16px, env(safe-area-inset-right, 0px)); }
.draft { background: var(--hl); color: var(--ink); text-align: center; font-weight: 600; padding: 8px 16px; }
header { padding-block: 48px 28px; display: grid; gap: 10px; }
.brand { font-size: 13px; font-weight: 700; letter-spacing: .18em; color: var(--accent); margin: 0; }
h1 { font: 800 clamp(36px, 7vw, 64px)/1.05 var(--f-display); margin: 0; letter-spacing: -.01em; text-wrap: balance; }
.tag { font-size: 19px; color: var(--ink-2); margin: 0; max-width: 40em; }
.pen { font-family: var(--f-pen); font-size: 30px; color: var(--ink-2); margin: 4px 0 0; transform: rotate(-1deg); transform-origin: left; }
.how { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 36px; }
.card { background: var(--paper-2); border: 2px solid var(--ink); border-radius: 8px; padding: 18px 20px; min-width: 0; }
.card h2 { font: 700 20px var(--f-display); margin: 0 0 8px; }
.card ul { margin: 0; padding-left: 20px; display: grid; gap: 4px; }
kbd { font: 600 13px var(--f-body); border: 1.5px solid var(--ink-2); border-bottom-width: 3px; border-radius: 5px; padding: 0 6px; background: var(--paper); }
.unit { background: var(--paper-2); border: 2px solid var(--ink); border-radius: 10px; box-shadow: 6px 6px 0 var(--ink); padding: 22px 22px 14px; margin-bottom: 32px; }
.unit-head { display: grid; gap: 6px; margin-bottom: 16px; }
.crumbs { margin: 0; font-size: 14px; color: var(--ink-2); letter-spacing: .02em; }
.unit h2 { font: 800 clamp(26px, 4.4vw, 36px)/1.15 var(--f-display); margin: 0; display: flex; flex-wrap: wrap; gap: 4px 14px; align-items: baseline; }
.code { font: 600 .55em var(--f-body); border: 2px solid var(--ink); border-radius: 999px; padding: 1px 12px; }
.std { margin: 0; font-size: 15px; color: var(--ink-2); max-width: 60em; }
.std b { color: var(--ink); margin-right: 6px; }
.lessons { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 262px), 1fr)); gap: 14px; }
.lesson { border: 2px solid var(--ink); border-radius: 8px; background: var(--paper); padding: 14px 16px; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.lesson .top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.pdf { font: 600 13px/1 var(--f-body); color: var(--ink-2); text-decoration: none; border: 1.5px solid var(--rule); border-radius: 999px; padding: 5px 10px; background: var(--paper-2); white-space: nowrap; }
.pdf::before { content: "↓ "; }
.pdf:hover { border-color: var(--accent); color: var(--accent); }
.pdf:focus-visible { outline: 4px solid var(--hl); outline-offset: 2px; }
.lesson .no { align-self: flex-start; font-size: 13px; font-weight: 700; color: var(--paper-2); background: var(--accent); border-radius: 999px; padding: 1px 10px; }
.lesson h3 { font: 700 22px/1.25 var(--f-display); margin: 4px 0 0; }
.lesson .q { font-family: var(--f-pen); font-size: 24px; line-height: 1.15; color: var(--ink-2); margin: 0; }
.lesson .meta { font-size: 13px; color: var(--ink-3); margin: 2px 0 8px; }
.go { margin-top: auto; display: flex; flex-wrap: wrap; gap: 8px; }
.go .btn { padding: 0 14px; }
.btn { display: inline-flex; align-items: center; min-height: 44px; padding: 0 16px; border: 2px solid var(--ink); border-radius: 999px; color: var(--ink); background: var(--paper-2); text-decoration: none; font-weight: 600; }
.btn.main { background: var(--ink); color: var(--paper-2); }
.btn:hover { background: var(--accent); border-color: var(--accent); color: var(--paper-2); }
.btn:focus-visible { outline: 4px solid var(--hl); outline-offset: 2px; }
.doors { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 18px; margin-bottom: 40px; }
.door { background: var(--paper-2); border: 2px solid var(--ink); border-radius: 10px; box-shadow: 6px 6px 0 var(--ink); padding: 20px 22px; display: grid; gap: 12px; align-content: start; min-width: 0; }
.door .who { margin: 0; font-size: 13px; font-weight: 700; letter-spacing: .18em; color: var(--accent); }
.door h2 { margin: 0; font: 800 clamp(26px, 4vw, 32px)/1.15 var(--f-display); }
.door p { margin: 0; color: var(--ink-2); }
.door .small { font-size: 14px; color: var(--ink-3); }
.joinf { display: flex; flex-wrap: wrap; gap: 8px; align-items: stretch; }
.joinf input { font: 800 30px/1 var(--f-display); letter-spacing: .18em; width: 7.4em; max-width: 100%; min-height: 56px; padding: 6px 12px; border: 2px solid var(--ink); border-radius: 8px; background: var(--paper); color: var(--ink); text-align: center; }
.joinf input:focus-visible { outline: 4px solid var(--hl); outline-offset: 2px; }
.joinf .btn { min-height: 56px; }
.joinmsg { min-height: 1.4em; font-weight: 600; color: var(--stamp) !important; }
.joinmsg:empty { display: none; }
.door ol { margin: 0; padding-left: 1.3em; display: grid; gap: 4px; color: var(--ink-2); }
.door .links { display: flex; flex-wrap: wrap; gap: 8px; }
.mine { display: grid; gap: 8px; }
.mine .who2 { margin: 0; font-size: 15px; color: var(--ink-2); }
.mine ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 8px; }
.mine li { display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 6px 12px; padding: 10px 12px; border: 2px solid var(--ink); border-radius: 8px; background: var(--paper); }
.mine li b { font-family: var(--f-display); font-size: 18px; }
.mine li .sub { font-size: 14px; color: var(--ink-3); }
.mine .btn { min-height: 40px; }
.door details { border-top: 1px dashed var(--rule); padding-top: 10px; display: grid; gap: 8px; }
.door details summary { cursor: pointer; font-weight: 700; color: var(--ink-2); }
.door details p { font-size: 15px; margin-top: 6px; }
button.btn { font: inherit; font-weight: 600; cursor: pointer; }
.sec { display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 14px; margin: 0 0 16px; }
.sec h2 { margin: 0; font: 800 clamp(24px, 4vw, 30px)/1.2 var(--f-display); }
.sec p { margin: 0; color: var(--ink-2); font-size: 15px; }
.upd { text-align: right; font-size: 12px; color: var(--ink-3); margin: 10px 0 0; }
footer { border-top: 2px solid var(--ink); padding-top: 18px; display: grid; gap: 8px; font-size: 14px; color: var(--ink-2); }
footer p { margin: 0; }
footer a { color: var(--accent); }
</style>
</head>
<body>
${site.draft ? '<div class="draft">미리보기 — 아직 공개하지 않은 판입니다</div>\n' : ''}<div class="wrap">
<header>
  <p class="brand">INTERACTIVE SCIENCE SLIDES</p>
  <h1>${esc(site.name)}</h1>
  <p class="tag">${esc(site.tagline)}</p>
  <p class="pen">보고, 끌어 보고, 다시 생각하기</p>
</header>

<div class="doors">
  <section class="door" id="student">
    <p class="who">학생</p>
    <h2>수업 참여하기</h2>
    <p>클래스룸에 올라온 <b>과목 링크</b>를 누르면 바로 들어가요. 선생님이 화면에 참여 코드를 띄웠다면 여기에 넣어요.</p>
    <form class="joinf" id="joinf" data-api="${esc(site.roomApi || '')}"><input name="code" inputmode="numeric" maxlength="6" autocomplete="off" placeholder="000000" aria-label="참여 코드"><button class="btn main" type="submit">들어가기</button></form>
    <p class="joinmsg" id="joinmsg" aria-live="polite"></p>
    <div id="smine" class="mine" hidden></div>
    <div class="links"><a class="btn" href="guide.html">참여 방법 미리 해 보기 →</a></div>
    <p class="small">로그인은 필요 없어요. 휴대폰은 가로로 돌리면 크게 보여요.</p>
  </section>
  <section class="door" id="teacher">
    <p class="who">선생님</p>
    <h2>수업 개설하기</h2>
    <div id="tguest">
      <ol>
        <li>구글로 로그인하고 가입 승인을 받아요.</li>
        <li>과목 수업방을 만들고 가르치는 반을 적어요.</li>
        <li>과목 링크를 반 클래스룸에 한 번 올려 둬요. 수업 때는 반과 차시만 고르면 돼요.</li>
      </ol>
    </div>
    <div id="tmine" class="mine" hidden></div>
    <div class="links"><a class="btn main" href="teach.html" id="tgo">구글로 로그인하고 시작하기</a><a class="btn" href="guide.html">학생 쪽 화면 보기</a></div>
    <details><summary>수업방 없이 화면만 띄울 때</summary>
      <p>자료 카드의 <b>선생님 화면</b>에는 장마다 발표자 메모(발문·예시 답·지도 유의점)가 있어요.</p>
      <p><kbd>S</kbd> 발표자 화면 · <kbd>→</kbd> 다음 단계 · <kbd>F</kbd> 전체 화면 · <kbd>C</kbd> 판서 · <kbd>B</kbd> 칠판 · <kbd>Esc</kbd> 한눈에 보기</p>
      <p>파일 하나에 다 들어 있어 내려받으면 인터넷 없이도 열려요(글꼴만 기본 글꼴로 바뀌고, 수업방은 인터넷이 있어야 해요). 복습·인쇄용으로는 장마다 정답까지 연 <b>PDF</b>도 있어요.</p>
    </details>
  </section>
</div>

<div class="sec"><h2>수업 자료</h2><p><b>체험하기</b>는 학생 화면을 혼자 넘겨 보며 그림 속 자석·코일·단추를 직접 움직여 보는 거예요.</p></div>

${units.map(unitHtml).join('\n')}

<footer>
  <p>${site.author ? `만든 곳: ${esc(site.author)} · ` : ''}수업자료는 <a href="${esc(site.licenseUrl)}" target="_blank" rel="noopener">${esc(site.license)}</a> — 출처를 밝히면 비영리로 고쳐 쓰고 나눌 수 있습니다.${site.contact ? ` 문의·고칠 점: ${esc(site.contact)}` : ''}</p>
  <p>교과서 쪽수는 미래엔 통합과학2 기준이며, 다른 교과서는 성취기준으로 찾아 쓰면 됩니다. 통계는 장마다 출처를 적었습니다.</p>
</footer>
</div>
<script>${JOIN_JS}</script>
</body>
</html>
`;
writeFileSync(join(here, 'index.html'), html);
writeFileSync(join(here, 'guide.html'), guidePage(site));
writeFileSync(join(here, 'join.html'), joinPage(site, units));
writeFileSync(join(here, 'teach.html'), teachPage(site, units));
writeFileSync(join(here, '.nojekyll'), '');
console.log(`반 수업방 쪽 join.html · teach.html`);
console.log(`자료실 첫 화면 index.html · 단원 ${units.length}개 · 차시 ${units.reduce((a, u) => a + u.lessons.length, 0)}개`);
