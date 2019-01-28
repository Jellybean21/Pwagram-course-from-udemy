self.addEventListener('install', function(event){
  console.log('[Service Worker] Installing Service Worker...', event);
});
//Installing the Service Worker
//Registering the Service Worker is happening in the app.js
self.addEventListener('activate', function(event){
  console.log('[Service Worker] Activating Service Worker', event);
  return self.clients.claim();
});
//Last step we activate the Serice Worker
self.addEventListener('fetch', function(event){
   // fetch event will be triggred when by exemple the html page load something like assets like js files or css files ect... or when image is loading
  event.respondWith(fetch(event.request));
});
