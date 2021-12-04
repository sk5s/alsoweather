self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('static').then((cache) => {
      return cache.addAll([
        './',
        './css/bulma.min.css',
        './css/style.css',
        './js/chart.min.js',
        './js/i18n.js',
        './js/my-chart.js',
        './icon/icon.png',
      ])
    })
  )
})

self.addEventListener('fetch', (e) => {
  e.respondWith(
    caches.match(e.request).then((response) => {
      return response || fetch(e.request)
    })
  )
})
