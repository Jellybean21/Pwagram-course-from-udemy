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
workboxSW.precache([
  {
    "url": "404.html",
    "revision": "0a27a4163254fc8fce870c8cc3a3f94f"
  },
  {
    "url": "favicon.ico",
    "revision": "2cab47d9e04d664d93c8d91aec59e812"
  },
  {
    "url": "index.html",
    "revision": "78695403f0957c44ae5be914ab893107"
  },
  {
    "url": "manifest.json",
    "revision": "73f1eff6b8a1f04e5f1b6c74bf782042"
  },
  {
    "url": "offline.html",
    "revision": "8e2f353bfd3e14b0e81b08f7ae5d5e86"
  },
  {
    "url": "service-worker.js",
    "revision": "5cabbb710593e88bf87daaa2cfc968d4"
  },
  {
    "url": "src/css/app.css",
    "revision": "59d917c544c1928dd9a9e1099b0abd71"
  },
  {
    "url": "src/css/feed.css",
    "revision": "6a3cc2b0fe27aa015df3126b22048b91"
  },
  {
    "url": "src/css/help.css",
    "revision": "1c6d81b27c9d423bece9869b07a7bd73"
  },
  {
    "url": "src/js/app.js",
    "revision": "a8fb873c6941a8b2c23952da1ff1d491"
  },
  {
    "url": "src/js/feed.js",
    "revision": "57053d39b87e767b2c6dd61c2d940368"
  },
  {
    "url": "src/js/fetch.js",
    "revision": "6b82fbb55ae19be4935964ae8c338e92"
  },
  {
    "url": "src/js/idb.js",
    "revision": "017ced36d82bea1e08b08393361e354d"
  },
  {
    "url": "src/js/idbUtility.js",
    "revision": "6eb05ef5c6734ba19604dfb4b381dca9"
  },
  {
    "url": "src/js/material.min.js",
    "revision": "713af0c6ce93dbbce2f00bf0a98d0541"
  },
  {
    "url": "src/js/promise.js",
    "revision": "10c2238dcd105eb23f703ee53067417f"
  },
  {
    "url": "src/js/somesavedcode.js",
    "revision": "0b9c4fc772392117ccfb33119b394787"
  },
  {
    "url": "sw-base.js",
    "revision": "7c36b6c64ff4d3466b24d228396cfe63"
  },
  {
    "url": "sw.js",
    "revision": "8f7679e1b16b385d7b01800608997c2e"
  },
  {
    "url": "workbox-sw.prod.v2.1.3.js",
    "revision": "a9890beda9e5f17e4c68f42324217941"
  },
  {
    "url": "src/images/main-image-lg.jpg",
    "revision": "31b19bffae4ea13ca0f2178ddb639403"
  },
  {
    "url": "src/images/main-image-sm.jpg",
    "revision": "c6bb733c2f39c60e3c139f814d2d14bb"
  },
  {
    "url": "src/images/main-image.jpg",
    "revision": "5c66d091b0dc200e8e89e56c589821fb"
  },
  {
    "url": "src/images/sf-boat.jpg",
    "revision": "0f282d64b0fb306daf12050e812d6a19"
  }
]);
