const version = '0.8.0'
const message = 'hi, alsoweather url has been changed to https://sk5s.cyou/alsoweather'
const message2 = "try to fix undefined translation now"

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open('static').then((cache) => {
      return cache.addAll([
        './',
        './css/bulma.min.css',
        './css/style.css',
        './css/glowCookies.css',
        './js/app.js',
        './js/chart.min.js',
        './js/i18n.js',
        './js/my-chart.js',
        './js/darkmode-js.min.js',
        './js/glowCookies.js',
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
