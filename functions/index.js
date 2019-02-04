let functions = require('firebase-functions');
let admin = require('firebase-admin');
let cors = require('cors')({origin: true});
let serviceAccount =  require("./pantagram-key.json");
let webpush = require('web-push');
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://patagram-b2193.firebaseio.com/'
});

exports.storePostData = functions.https.onRequest(function(request, response){
  cors(request, response, function(){// passing request and response as extra arguments
    admin.database().ref('post').push({
      id: request.body.id,
      title: request.body.title,
      location: request.body.location,
      image: request.body.image
    })
    .then(function(){
      //put a valid mail adress as first argument , and your public et privat key as second and third arguments
      webpush.setVapidDetails('mailto:dave_dnb21@hotmail.fr', 'BGaV7OlvBu7FWeARC8bOzkZ7Bfo3gpaRtf6qLwAhCej3UsdQLbtmGZeM2IYgAVunXoYLXKH4iZSgIxMdW_QeC3M', '')
      response.status(201).json({message: 'Data stored', id: request.body.id });
    })
    .catch(function(err){
      response.status(500).json({error: err});
    })
  })
})
