/* 서비스 워커 — 앱 파일을 기기에 담아 두어 인터넷 없이도 열린다. build.py가 아래 두 줄을 채운다.
   판이 바뀌면 CACHE 이름이 바뀌어, 다음에 열 때 말없이 새 판으로 바뀐다(할 일 데이터는 localStorage라 그대로). */
var CACHE = 'todo02-b158bd0d';
var FILES = ["./", "index.html", "manifest.webmanifest", "icon-180.png", "icon-192.png", "icon-512.png"];

self.addEventListener('install', function (e) {
  /* cache: 'reload' = 브라우저의 HTTP 캐시를 건너뛰고 서버에서 새로 받음 — 옛 index.html이 새 캐시 이름으로 굳던 길 (새 눈 5호 5번) */
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES.map(function (u) { return new Request(u, { cache: 'reload' }); })); }).then(function () { return self.skipWaiting(); }));
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
  if (e.action === 'ok') return;   /* '확인' = 닫기만 (안드로이드 알림과 같게 · 11-01) */
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function (list) {
    var d = e.notification.data || {};
    /* '10분 뒤' = 열린 앱에 알려 같은 미루기 규칙으로(앱이 데이터에 남김 · 앞으로 띄우지 않음). 웹 알림은 앱이 열려 있을 때만 울리므로 열린 앱이 늘 있음 */
    if (e.action === 'snooze') { for (var j = 0; j < list.length; j++) try { list[j].postMessage({ type: 'snooze', taskId: d.taskId, key: d.key }); return; } catch (x) {} return; }
    /* 열린 앱이 있으면 앞으로 + 그 할 일 열기(안드로이드와 같게 · 새 눈 9호) */
    for (var i = 0; i < list.length; i++) if ('focus' in list[i]) { try { list[i].postMessage({ type: 'open-task', taskId: d.taskId, key: d.key }); } catch (x) {} return list[i].focus(); }
    if (self.clients.openWindow) return self.clients.openWindow('./');
  }));
});
