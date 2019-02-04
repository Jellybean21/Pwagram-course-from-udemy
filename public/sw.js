importScripts('/src/js/idb.js');
importScripts('/src/js/idbUtility.js');

var CACHE_STATIC_NAME = 'static-v36';
var CACHE_DYNAMIC_NAME = 'dynamic-v2';
var STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/idb.js',
  '/src/js/promise.js',
  '/src/js/fetch.js',
  '/src/js/material.min.js',
  '/src/css/app.css',
  '/src/css/feed.css',
  '/src/images/main-image.jpg',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];

// function trimCache(cacheName, maxItems) {
//   caches.open(cacheName)
//     .then(function (cache) {
//       return cache.keys()
//         .then(function (keys) {
//           if (keys.length > maxItems) {
//             cache.delete(keys[0])
//               .then(trimCache(cacheName, maxItems));
//           }
//         });
//     })
// }

self.addEventListener('install', function (event) {
  console.log('[Service Worker] Installing Service Worker ...', event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
      .then(function (cache) {
        console.log('[Service Worker] Precaching App Shell');
        cache.addAll(STATIC_FILES);
      })
  )
});

self.addEventListener('activate', function (event) {
  console.log('[Service Worker] Activating Service Worker ....', event);
  event.waitUntil(
    caches.keys()
      .then(function (keyList) {
        return Promise.all(keyList.map(function (key) {
          if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
            console.log('[Service Worker] Removing old cache.', key);
            return caches.delete(key);
          }
        }));
      })
  );
  return self.clients.claim();
});

function isInArray(string, array) {
  var cachePath;
  if (string.indexOf(self.origin) === 0) { // request targets domain where we serve the page from (i.e. NOT a CDN)
    console.log('matched ', string);
    cachePath = string.substring(self.origin.length); // take the part of the URL AFTER the domain (e.g. after localhost:8080)
  } else {
    cachePath = string; // store the full request (for CDNs)
  }
  return array.indexOf(cachePath) > -1;
}

self.addEventListener('fetch', function (event) {

  var url = 'https://patagram-b2193.firebaseio.com/post';
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(fetch(event.request)
      .then(function (res) {
        var clonedRes = res.clone();
        clearAllData('posts')
          .then(function () {
            return clonedRes.json();
          })
          .then(function (data) {
            for (var key in data) {
              writeData('posts', data[key])
                // .then(function() {
                //   deleteItemFromData('posts', data[key].id);
                // });
            }
          });
        return res;
      })
    );
  } else if (isInArray(event.request.url, STATIC_FILES)) {
    event.respondWith(
      caches.match(event.request)
    );
  } else {
    event.respondWith(
      caches.match(event.request)
        .then(function (response) {
          if (response) {
            return response;
          } else {
            return fetch(event.request)
              .then(function (res) {
                return caches.open(CACHE_DYNAMIC_NAME)
                  .then(function (cache) {
                    // trimCache(CACHE_DYNAMIC_NAME, 3);
                    cache.put(event.request.url, res.clone());
                    return res;
                  })
              })
              .catch(function (err) {
                return caches.open(CACHE_STATIC_NAME)
                  .then(function (cache) {
                    if (event.request.headers.get('accept').includes('text/html')) {
                      return cache.match('/offline.html');
                    }
                  });
              });
          }
        })
    );
  }
});

// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//       .then(function(response) {
//         if (response) {
//           return response;
//         } else {
//           return fetch(event.request)
//             .then(function(res) {
//               return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache) {
//                   cache.put(event.request.url, res.clone());
//                   return res;
//                 })
//             })
//             .catch(function(err) {
//               return caches.open(CACHE_STATIC_NAME)
//                 .then(function(cache) {
//                   return cache.match('/offline.html');
//                 });
//             });
//         }
//       })
//   );
// });

// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     fetch(event.request)
//       .then(function(res) {
//         return caches.open(CACHE_DYNAMIC_NAME)
//                 .then(function(cache) {
//                   cache.put(event.request.url, res.clone());
//                   return res;
//                 })
//       })
//       .catch(function(err) {
//         return caches.match(event.request);
//       })
//   );
// });

// Cache-only
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     caches.match(event.request)
//   );
// });

// Network-only
// self.addEventListener('fetch', function (event) {
//   event.respondWith(
//     fetch(event.request)
//   );
// });
self.addEventListener('sync', function(event){
  //this triggered when network is back
  console.log('[Service Worker] Background syncing', event);
  //we check if the syn new post exists
  //if this is the case we want to do somthing specific
  // if we have different tags or different syncro tasks we could use a switch with case statement to do different things
  if(event.tag === 'sync-new-posts'){
    console.log('[SERVICE WORKER] Syncing new posts');
    event.waitUntil(
      readAllData('sync-posts')
      .then(function(data){
        for (var dt of data) {
          fetch('https://us-central1-patagram-b2193.cloudfunctions.net/storePostData', {
            method: 'POST',
            headers: {'Content-Type': 'application/json',
                       'Accept': 'application/json'} ,
              body: JSON.stringify({
              id: dt.id,
              title: dt.title,
              location: dt.location,
              image: 'https://firebasestorage.googleapis.com/v0/b/patagram-b2193.appspot.com/o/sf-boat.jpg?alt=media&token=5a7f4de8-83e6-4c3a-9c94-a92aab337811'
            })
          })
          .then(function(res){
            console.log('Data sent', res);
            if (res.ok){
              res.json()
              .then(function(resData){
                deleteItemFromData('sync-posts', resData.id);
                console.log(resData.id);
              })

            }
          })
          .catch(function(err){
            console.log('Error while sending data', err);
          })
        }

      })
    )

  }
})
//Event to interact with notification , this is a feature mobile so only serviceWorker can handle this
self.addEventListener('notificationclick', function(event){
  let notification = event.notification;
  let action = event.action;

  console.log(notification);
  //If the user click on the confirm button with the confirm action
  if(action === 'confirm'){
    console.log('Confirm was chosen');
    notification.close();// automaticaly close the notification after action.
  }else{
    console.log(action);
    notification.close();
  }
})
//Event on notification close
self.addEventListener('notificationclose', function(event){
  console.log('Notification was close', event);
  let notification = event.notification;
})
