// 자료실 첫 화면(index.html)을 site.json과 lessons.json으로 만든다. 단원 빌드가 끝날 때마다 불린다.
//   node make-index.mjs
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname, posix } from 'node:path';
import { fileURLToPath } from 'node:url';
import { joinPage, teachPage } from './pages.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const site = JSON.parse(readFileSync(join(here, 'site.json'), 'utf8'));
const { units } = existsSync(join(here, 'lessons.json')) ? JSON.parse(readFileSync(join(here, 'lessons.json'), 'utf8')) : { units: [] };
// 차시 폴더에 slides.pdf(tools/pdf.mjs가 만든 화면 모음)가 있으면 링크를 단다
const pdfOf = (l) => { const p = posix.join(posix.dirname(l.student), 'slides.pdf'); return existsSync(join(here, p)) ? p : null; };
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const unitHtml = (u) => `
  <section class="unit" id="${esc(u.subjectSlug)}-${esc(u.unit)}">
    <div class="unit-head">
      <p class="crumbs">${esc(u.subject)} · ${esc(u.area)}</p>
      <h2><span class="code">${esc(u.unit)}</span>${esc(u.unitTitle)}</h2>
      <p class="std"><b>성취기준 ${esc(u.standard)}</b> ${esc(u.standardText)}</p>
    </div>
    <ol class="lessons">
${u.lessons.map((l) => `      <li class="lesson">
        <span class="no">${l.n}차시</span>
        <h3>${esc(l.title)}</h3>
        <p class="q">${esc(l.question)}</p>
        <p class="meta">${esc(u.textbook)} ${esc(l.pages)}쪽 기준 · ${l.slides}장</p>
        <div class="go"><a class="btn main" href="${esc(l.student)}">학생용 열기</a><a class="btn" href="${esc(l.teacher)}">교사용</a>${pdfOf(l) ? `<a class="btn" href="${esc(pdfOf(l))}" title="장마다 마지막 단계까지 연 화면 모음(A4 가로, 인쇄용)">PDF</a>` : ''}</div>
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
.lessons { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 14px; }
.lesson { border: 2px solid var(--ink); border-radius: 8px; background: var(--paper); padding: 14px 16px; display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.lesson .no { align-self: flex-start; font-size: 13px; font-weight: 700; color: var(--paper-2); background: var(--accent); border-radius: 999px; padding: 1px 10px; }
.lesson h3 { font: 700 22px/1.25 var(--f-display); margin: 4px 0 0; }
.lesson .q { font-family: var(--f-pen); font-size: 24px; line-height: 1.15; color: var(--ink-2); margin: 0; }
.lesson .meta { font-size: 13px; color: var(--ink-3); margin: 2px 0 8px; }
.go { margin-top: auto; display: flex; flex-wrap: wrap; gap: 8px; }
.btn { display: inline-flex; align-items: center; min-height: 44px; padding: 0 16px; border: 2px solid var(--ink); border-radius: 999px; color: var(--ink); background: var(--paper-2); text-decoration: none; font-weight: 600; }
.btn.main { background: var(--ink); color: var(--paper-2); }
.btn:hover { background: var(--accent); border-color: var(--accent); color: var(--paper-2); }
.btn:focus-visible { outline: 4px solid var(--hl); outline-offset: 2px; }
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

<div class="how">
  <div class="card">
    <h2>학생</h2>
    <ul>
      <li>선생님이 알려 준 차시의 <b>학생용 열기</b>를 누른다.</li>
      <li>화면을 밀거나 화살표로 넘기고, 그림 속 자석·코일·단추를 직접 움직여 본다.</li>
      <li>선생님이 수업방을 열면 왼쪽 위 사람 모양 단추를 누르고 화면의 참여 코드 네 자리를 넣는다(QR을 찍어도 된다).</li>
      <li>휴대폰은 가로로 돌리면 크게 보인다.</li>
      <li>복습하거나 인쇄하려면 <b>PDF</b>를 연다(장마다 정답까지 다 연 화면).</li>
    </ul>
  </div>
  <div class="card">
    <h2>선생님</h2>
    <ul>
      <li><b>교사용</b>에는 장마다 발표자 메모(발문·예시 답·지도 유의점)가 있다. <kbd>S</kbd> 발표자 화면</li>
      <li><kbd>→</kbd> 다음 단계 · <kbd>F</kbd> 전체 화면 · <kbd>C</kbd> 판서 · <kbd>B</kbd> 칠판 · <kbd>Esc</kbd> 한눈에 보기</li>
      <li><b><a href="teach.html">선생님 페이지</a></b>: 반마다 수업방을 한 번 만들고 학생 링크를 클래스룸에 올려 두면, 수업 때 반과 차시만 누르면 된다.</li>
      <li><b>수업방</b>: 사람 모양 단추 → «수업방 열기». 참여 코드·QR을 프로젝터로 띄우면 학생 화면이 선생님이 넘기는 장을 따라온다(«모두 따라오기 / 자유롭게», 잠그기). 학생이 예측·○×를 누르면 보기마다 고른 수가 뜨고, «한 낱말 묻기»로 낱말 구름을 띄울 수 있다. 학생 이름·기록은 남지 않는다.</li>
      <li>파일 하나에 다 들어 있어 내려받으면 인터넷 없이도 열린다(글꼴만 기본 글꼴로 바뀌고, 수업방은 인터넷이 있어야 한다).</li>
    </ul>
  </div>
</div>

${units.map(unitHtml).join('\n')}

<footer>
  <p>${site.author ? `만든 곳: ${esc(site.author)} · ` : ''}수업자료는 <a href="${esc(site.licenseUrl)}" target="_blank" rel="noopener">${esc(site.license)}</a> — 출처를 밝히면 비영리로 고쳐 쓰고 나눌 수 있습니다.${site.contact ? ` 문의·고칠 점: ${esc(site.contact)}` : ''}</p>
  <p>교과서 쪽수는 미래엔 통합과학2 기준이며, 다른 교과서는 성취기준으로 찾아 쓰면 됩니다. 통계는 장마다 출처를 적었습니다.</p>
</footer>
</div>
</body>
</html>
`;
writeFileSync(join(here, 'index.html'), html);
writeFileSync(join(here, 'join.html'), joinPage(site, units));
writeFileSync(join(here, 'teach.html'), teachPage(site, units));
writeFileSync(join(here, '.nojekyll'), '');
console.log(`반 수업방 쪽 join.html · teach.html`);
console.log(`자료실 첫 화면 index.html · 단원 ${units.length}개 · 차시 ${units.reduce((a, u) => a + u.lessons.length, 0)}개`);
