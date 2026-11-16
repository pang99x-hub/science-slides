// 움직이는 과학 수업 — 설치형 웹 앱의 오프라인 저장. 화면(HTML·목록)은 인터넷이 되면 늘 새 판을 받고, 안 되면 저장해 둔 판을 연다.
// 그림·PDF·글꼴은 한 번 받으면 저장해 두고 쓴다. 수업방(다른 주소)은 건드리지 않는다.
const V = 'msl-v2';   // v2: 꿈틀 새싹 아이콘으로 바뀌어 옛 아이콘 저장분을 버린다
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
// 푸시 알림(수업방 src/push.mjs가 보낸다): 한 줄 글을 띄우고, 누르면 그 화면을 연다(이 앱 안의 주소만)
self.addEventListener('push', (e) => {
  let d = {}; try { d = e.data.json(); } catch (err) { /* 빈 알림 */ }
  e.waitUntil(self.registration.showNotification(String(d.title || '꿈틀'), { body: String(d.body || '새 소식이 있어요.'), tag: d.tag ? String(d.tag) : undefined, icon: new URL('icons/icon-192.png', self.registration.scope).href, data: { url: String(d.url || 'teach.html') } }));
});
self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  const scope = self.registration.scope; let u = new URL((e.notification.data || {}).url || '', scope).href; if (!u.startsWith(scope)) u = scope;
  e.waitUntil(self.clients.matchAll({ type: 'window' }).then((cs) => { const c = cs.find((x) => x.url.startsWith(scope) && 'navigate' in x); return c ? c.navigate(u).then((w) => (w || c).focus()) : self.clients.openWindow(u); }));
});
self.addEventListener('fetch', (e) => {
  const req = e.request; if (req.method !== 'GET') return;
  const u = new URL(req.url);
  if (u.origin === location.origin && u.pathname.startsWith(new URL(self.registration.scope).pathname)) {
    const page = req.mode === 'navigate' || /\.(html|json|webmanifest)$/.test(u.pathname) || u.pathname.endsWith('/')
      || (/\.js$/.test(u.pathname) && !u.pathname.includes('/lib/'));   // edit.js처럼 이름에 지문이 없는 스크립트는 저장분을 먼저 주면 올린 뒤 한 번은 옛 판이 뜬다
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
