let CACHE_STATIC_NAME = 'static-v24';
let CACHE_DYNAMIC_NAME = 'dynamic-v12';
let STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
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
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'];
//function trimCache(cacheName, maxItems){// function to control how many items max we can cache , it delete the oldest.
//  caches.open(cacheName)
//    .then(function(cache){
//      return cache.keys()
//      .then(function(keys){
//        if(keys.length > maxItems){
//          cache.delete(keys[0])// delete the older items in keys array
//            .then(trimCache(cacheName, maxItems));
//        };
//    })
//
//    });
//}
self.addEventListener('install', function(event){
  console.log('[Service Worker] Installing Service Worker...', event);
  //lets open the cache
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)// static is the name of your cache , you can give a name you like
      .then(function(cache) {
        console.log('[Service Worker] Precaching app shell');
        cache.addAll(STATIC_FILES);




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
/*self.addEventListener('fetch', function(event){
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
          }).catch(function(err){ // if it throw an error like other pages not cached , we are able to open the static cache and match it to serve the offline.html file we cached earlier.
            return caches.open(CACHE_STATIC_NAME)
            .then(function (cache){
              return cache.match('/offline.html'); // return the value of cache.match
            });
          });
        }
      })

    //request are our keys
  );
});*/
function isInArray(string, array){
  let cachePath;
  if(string.indexOf(self.origin) === 0){
    console.log('matched', string);
    cachePath = string.substring(self.origin.length);
  }else{
    cachePath = string;
  }
  return false;
}
//Cache then Network strategy , dynamic caching
self.addEventListener('fetch', function(event){
  let url = 'https://httpbin.org/get';//cache network strategie for this url
  if(event.request.url.indexOf(url) > -1){//we can check if the event request url contains that url // > -1 mean we found and entry of 'https://httpbin.org/get' in event.request.url
    event.respondWith(
      caches.open(CACHE_DYNAMIC_NAME)
        .then(function(cache){ //function the cache we opened as argument
          return fetch(event.request)
          .then(function (res){ // using the response wich it give to us
            //trimCache(CACHE_DYNAMIC_NAME, 5);
            cache.put(event.request, res.clone());
            return res;
          })
        })
    );
    //let's check if we are loading one of the files we cached in static cache
  }else if (isInArray(event.request.url, STATIC_FILES)){//(new RegExp('\\b' + STATIC_FILES.join('\\b|\\b') + '\\b').test(event.request.url))// if in the static file array that contains any of the url , the request url , contains any elements of the Regex in that array. It means basically if the url matches the regex separated words.
    event.respondWith(
      caches.match(event.request)// We respond with the cache only strategy
    );
  }else {
    event.respondWith(
      caches.match(event.request)
        .then(function(response){
          if(response) {
            return response;
          }else{
            return fetch(event.request)
            .then(function(res){
              return caches.open(CACHE_DYNAMIC_NAME)
              .then(function(cache){
                //trimCache(CACHE_DYNAMIC_NAME, 5)
                cache.put(event.request.url, res.clone());
                return res;
              })
            }).catch(function(err){
              return caches.open(CACHE_STATIC_NAME)
              .then(function (cache){
                if ( event.request.headers.get('accept').includes('text/html')){// we call a get method to get a specific header. if the accept header includes text/html as answer
                    return cache.match('/offline.html');                        //It means the incoming request accept html
                }

              });
            });
          }
        })

    );
  }

});

/*self.addEventListener('fetch', function(event){

  event.respondWith(
    fetch(event.request)
      .then(function (res){
        return caches.open(CACHE_DYNAMIC_NAME)
      .then(function(cache){
        cache.put(event.request.url, res.clone());
        return res;
      })
    })
    .catch(function (error){
    return caches.match(event.request)

  })
);
});*/

// Cash only strategy
/*self.addEventListener('fetch', function(event){

  event.respondWith(
    caches.match(event.request)
  );
});*/

//Network only strategy
/*self.addEventListener('fetch', function(event){

  event.respondWith(
    fetch(event.request);
  );
});*/
