// 자료실의 모든 HTML 머리말에 설치형 웹 앱 정보(앱 이름·아이콘·오프라인 저장)를 넣는다. 몇 번 돌려도 한 번만 들어간다.
// make-index.mjs가 첫 화면을 만든 뒤 부른다(단원 빌드 → make-index → 여기).
import { readdirSync, readFileSync, writeFileSync, statSync } from 'node:fs';
import { join, relative, dirname, sep } from 'node:path';

const block = (rel) => `<!--pwa-->
<link rel="manifest" href="${rel}manifest.webmanifest">
<meta name="theme-color" content="#fef9e8">
<link rel="icon" type="image/png" sizes="32x32" href="${rel}icons/favicon-32.png">
<link rel="apple-touch-icon" href="${rel}icons/apple-touch-icon.png">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-title" content="과학 수업">
<script>if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('${rel}sw.js').catch(() => {}));</script>
<!--/pwa-->
`;

export function addPwa(site) {
  let n = 0;
  const walk = (d) => readdirSync(d).forEach((f) => {
    if (f.startsWith('.') || f === 'node_modules' || f === 'guide') return;
    const p = join(d, f);
    if (statSync(p).isDirectory()) return walk(p);
    if (!f.endsWith('.html')) return;
    let t = readFileSync(p, 'utf8');
    const depth = relative(site, dirname(p)).split(sep).filter(Boolean).length;
    const b = block('../'.repeat(depth));
    t = t.replace(/<!--pwa-->[\s\S]*?<!--\/pwa-->\n?/, '');
    const i = t.indexOf('</head>'); if (i < 0) return;
    writeFileSync(p, t.slice(0, i) + b + t.slice(i)); n++;
  });
  walk(site);
  return n;
}
