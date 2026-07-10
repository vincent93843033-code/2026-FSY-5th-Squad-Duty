// 第五中隊 App 離線快取：
// 策略一律「先網路、失敗才用快取」，確保有網路時永遠拿到最新版，
// 沒網路時（會場收訊差、宿舍地下室）也能開啟整個 App。
var CACHE = 'fsy5-v11';
var CORE = [
  './',
  'index.html',
  'style.css?v=40',
  'app.js?v=53',
  'app-data.js?v=3',
  'manifest.json',
  'au_campus_map.jpg?v=3',
  'meal-route-map.jpg?v=1',
  'icon-64.png?v=2',
  'icon-192.png?v=2',
  'icon-512.png',
  'https://cdn.jsdelivr.net/npm/papaparse@5.4.1/papaparse.min.js',
];

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function (c) { return c.addAll(CORE); })
      .then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; })
        .map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  if (e.request.method !== 'GET') return;
  var url = new URL(e.request.url);
  var sameOrigin = url.origin === location.origin;
  var isCdn = url.host === 'cdn.jsdelivr.net';
  // Google 試算表 CSV 交給 app.js 自己的 localStorage 快取處理
  if (!sameOrigin && !isCdn) return;
  e.respondWith(
    fetch(e.request).then(function (res) {
      if (res && (res.ok || res.type === 'opaque')) {
        var copy = res.clone();
        caches.open(CACHE).then(function (c) { c.put(e.request, copy); });
      }
      return res;
    }).catch(function () {
      return caches.match(e.request, { ignoreSearch: sameOrigin });
    })
  );
});
