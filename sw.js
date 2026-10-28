// 움직이는 과학 수업 — 설치형 웹 앱의 오프라인 저장. 화면(HTML·목록)은 인터넷이 되면 늘 새 판을 받고, 안 되면 저장해 둔 판을 연다.
// 그림·PDF·글꼴은 한 번 받으면 저장해 두고 쓴다. 수업방(다른 주소)은 건드리지 않는다.
const V = 'msl-v1';
const CORE = ['./', 'index.html', 'join.html', 'teach.html', 'guide.html', 'lessons.json', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png', 'icons/favicon-32.png'];
self.addEventListener('install', (e) => { e.waitUntil(caches.open(V).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())); });
self.addEventListener('activate', (e) => { e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== V).map((k) => caches.delete(k)))).then(() => self.clients.claim())); });
const fresh = async (req) => {
  const c = await caches.open(V);
  try {
    const r = await fetch(req);
    if (r.ok) c.put(req.url.split('?')[0], r.clone());
    return r;
  } catch (err) {
    return (await c.match(req.url.split('?')[0])) || (await c.match('index.html')) || Response.error();
  }
};
const kept = async (req) => {
  const c = await caches.open(V), hit = await c.match(req);
  const net = fetch(req).then((r) => { if (r.ok || r.type === 'opaque') c.put(req, r.clone()); return r; }).catch(() => hit);
  return hit || net;
};
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.origin === location.origin && u.pathname.startsWith(new URL(self.registration.scope).pathname)) {
    const page = req.mode === 'navigate' || /\.(html|json|webmanifest)$/.test(u.pathname) || u.pathname.endsWith('/');
    e.respondWith(page ? fresh(req) : kept(req));
  } else if (/fonts\.(googleapis|gstatic)\.com$/.test(u.hostname)) e.respondWith(kept(req));
});
// 첫 화면의 «모든 차시 미리 받아 두기»: 목록의 교사용·학생용 화면을 한꺼번에 저장한다.
self.addEventListener('message', (e) => {
  if (!e.data || e.data.type !== 'save-all') return;
  e.waitUntil((async () => {
    const c = await caches.open(V), list = e.data.urls || [];
    let n = 0;
    for (const url of list) { try { const r = await fetch(url); if (r.ok) await c.put(url, r); } catch (err) { /* 건너뜀 */ } n++; e.source && e.source.postMessage({ type: 'save-progress', n, total: list.length }); }
  })());
});
