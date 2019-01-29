let CACHE_STATIC_NAME = 'static-v4';
let CACHE_DYNAMIC_NAME = 'dynamic-v2';


self.addEventListener('install', function(event){
  console.log('[Service Worker] Installing Service Worker...', event);
  //lets open the cache
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)// static is the name of your cache , you can give a name you like
      .then(function(cache) {
        console.log('[Service Worker] Precaching app shell');
        cache.addAll([
          '/',
          '/index.html',
          '/src/js/app.js',
          '/src/js/feed.js',
          '/src/js/promise.js',
          '/src/js/fetch.js',
          '/src/js/material.min.js',
          '/src/css/app.css',
          '/src/css/feed.css',
          '/src/images/main-image.jpg',
          'https://fonts.googleapis.com/css?family=Roboto:400,700',
          'https://fonts.googleapis.com/icon?family=Material+Icons',
          'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
        ]);


      }) //in the then block we execute a function and we passe it an argument by the opening method
  )//wait until a given operation wich has to return a promise and caches open returns a promise.
  //it won't finish the installation event before the caches step is done.
});
// A comment...adding a simple comment in the service worker file allow you to update the service worker to change a file in cache but it's not a good practice.

//Installing the Service Worker
//Registering the Service Worker is happening in the app.js


self.addEventListener('activate', function(event){
  console.log('[Service Worker] Activating Service Worker', event);
  event.waitUntil(
    caches.keys()
    .then(function(responseKeyList){
      return Promise.all(responseKeyList.map(function(key){// we want to transform an array of string ( with the existing caches) into an array of promises.
        if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME){
          console.log('[SERVICE WORKER] Removing old caches', key)
          return caches.delete(key);
        }
      }));
    })
  );
  return self.clients.claim();
});
//Last step we activate the Serice Worker
//the following step allow us to cache dynamicaly.
self.addEventListener('fetch', function(event){
   // fetch event will be triggered when by exemple the html page load something like assets like js files or css files ect... or when image is loading
  event.respondWith(
    caches.match(event.request) // caches.match allow us to call match to have a look at all our sub caches and see if we find given resource here.We match our request event.
      .then(function(response){
        if(response) {
          return response; // returning the value from the cache
        }else{
          return fetch(event.request)
          .then(function(res){//we already passed an argument called response so here we will use res
            return caches.open(CACHE_DYNAMIC_NAME)
            .then(function(cache){
              cache.put(event.request.url, res.clone());//first argument we passe to put this in is the url identifier. the second argument is the response or rest , is the name here.
              return res;// this will allows us to continue with network request if we want to get something wich is not cached but get it from the cache
            })
          }).catch(function(err){
            console.log('error' + err);
          });
        }
      })

    //request are our keys
  );
});
