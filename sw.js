const CACHE_NAME = 'uie-planificador-v4';
const ASSETS = [
    '/styles.css',
    '/data.js',
    '/tabs.js',
    '/theme.js',
    '/content.js',
    '/dua.js',
    '/supports.js',
    '/report.js',
    '/navigation.js',
    '/app.js',
    '/Logo UIE/UIE.png',
    '/Logo UIE/UIE_blanco.png',
    'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Inter:wght@300;400;500;600;700&family=Nunito:wght@400;500;600;700;800&family=Outfit:wght@400;500;600;700;800&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.12/pdfmake.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.12/vfs_fonts.min.js'
];

self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(key) { return key !== CACHE_NAME; })
                    .map(function(key) { return caches.delete(key); })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', function(event) {
    var url = new URL(event.request.url);
    if (url.pathname === '/' || url.pathname.endsWith('index.html')) {
        event.respondWith(
            fetch(event.request).then(function(response) {
                var clone = response.clone();
                caches.open(CACHE_NAME).then(function(cache) { cache.put(event.request, clone); });
                return response;
            }).catch(function() {
                return caches.match(event.request);
            })
        );
        return;
    }
    event.respondWith(
        caches.match(event.request).then(function(cached) {
            return cached || fetch(event.request);
        })
    );
});
