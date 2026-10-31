/* 서비스 워커 — 앱 파일을 기기에 담아 두어 인터넷 없이도 열린다. build.py가 아래 두 줄을 채운다.
   판이 바뀌면 CACHE 이름이 바뀌어, 다음에 열 때 말없이 새 판으로 바뀐다(할 일 데이터는 localStorage라 그대로). */
var CACHE = 'todo02-a72adea4';
var FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k.indexOf('todo02-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request, { ignoreSearch: true }).then(function (hit) { return hit || fetch(e.request); }));
});
/* 알림을 누르면 앱을 앞으로 */
self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    for (var i = 0; i < list.length; i++) if ('focus' in list[i]) return list[i].focus();
    if (self.clients.openWindow) return self.clients.openWindow('./');
  }));
});
