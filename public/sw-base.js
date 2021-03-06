importScripts('workbox-sw.prod.v2.1.3.js');
//importing our idbutility and idb scripts to be used
importScripts('src/js/idb.js');
importScripts('src/js/idbUtility.js');
const workboxSW = new self.WorkboxSW();

//Creating anew Route with the Workbow S-W package
//router object
//Inside the registerRoute()you can passe an Express style route, or a regEx.
//It will parse any request we make, automaticaly registers a fetch listner , we dont have to do that manually
// It will test or render every incoming request, and return a hit if URL request contains googleapis.com or gstatic.com
// strategies is an object of workboxSW
//staleWhileRevalidate will reach out the cache to get that resource but also send a fetch request
//And if that fetch requests then return it will cache updated resources
//  It's dynamic caching
workboxSW.router.registerRoute(/.*(?:googleapis|gstatic)\.com.*$/, workboxSW.strategies
.staleWhileRevalidate({
  cacheName: 'google-fonts',
  cacheExpiration: {
    maxEntries:   4,
    maxAgeSeconds:  60 * 60 * 24 * 30,//  In that case it corresponds to every months
    // 60 seconds multiply by 60 is one hour , multiply by 24 it corespond to one day , and multiply per 30 it correponds to one month.
  }
}));
//For CDN we can use string instead reg expression
workboxSW.router.registerRoute('https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css', workboxSW.strategies
.staleWhileRevalidate({
  cacheName: 'material-css'
}));
//WE are now sure the image won't go into the google-fonts cache , removing gstatic and adding firebase.
workboxSW.router.registerRoute(/.*(?:firebasestorage\.googleapis)\.com.*$/, workboxSW.strategies
.staleWhileRevalidate({
  cacheName: 'post-images'
}));

//First of all fetch the url
//And then we can write our own handler.
//second arguments takes a function , this function take an argument passed automatically by WorkBox
//In that function we have to return a response or a promise wich eventually yields a response.
workboxSW.router.registerRoute('https://patagram-b2193.firebaseio.com/post.json', function(arguments){
  console.log(arguments);
  return fetch(arguments.event.request)//now event has his own request property
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
});
workboxSW.router.registerRoute(function(routeData){
  //we return true if its hit , we always handle every route
  //return true;
  //if routeData wich exposes the fetch event and if the request in that fetch event and the headers have an accept header
  // this basicaly checking if the incoming request no matters wich url targeting if it has a header who accept text/html, a validate candidat to get offline html file.
  // this will be true if the incoming request accepts this kind of content
  //routeData is an object , wich has two properties , one is the fetch event and the second the url
  return (routeData.event.request.headers.get('accept').includes('text/html'))
}, function(arguments){
  caches.match(arguments.event.request)
    .then(function (response) {
      if (response) {
        return response;
      } else {
        return fetch(arguments.event.request)
          .then(function (res) {
            return caches.open('dynamic')
              .then(function (cache) {

                // trimCache(CACHE_DYNAMIC_NAME, 3);
                cache.put(arguments.event.request.url, res.clone());
                return res;
                console.log(res);
              })
          })
          .catch(function (err) {
            console.log(err);
            return caches.match('/offline.html')
              .then(function (res) {
              return res;
              });
          });
      }
    })
});
workboxSW.precache([]);
