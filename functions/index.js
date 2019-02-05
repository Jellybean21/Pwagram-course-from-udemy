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
      webpush.setVapidDetails('mailto:dave_dnb21@hotmail.fr', 'BEtghSwe2phhdR37gL2cdznuj9vPLdds1-3SxIqafgaTp_TfmNZQDeZXmK-wEDJ5dSLHvmBMRVCWnkCrgSsRqH0', 'OOu_gyRGc_iDM2WtYwQPM2BNm4K-xhyWRvZTmCjbLkE')
      return admin.database().ref('subscriptions').once('value')

    })
    .then(function(subscriptions){
      subscriptions.forEach(function(sub){
        //firebase will make loop in every keys in the databse and retrieve nested informations in each keys.
        let pushConfig = {
          endpoint: sub.val().endpoint, // val() is a method to extract the real javascript value
          keys : {
            auth: sub.val().keys.auth,
            p256dh: sub.val().keys.p256dh
          }
        }
        webpush.sendNotification(pushConfig, JSON.stringify({
          title:    'New post',
          content:  'New post added',
          openUrl:  '/help'
        }))// first argument the object with datas to send push to some endpoints, and as second argument the payload
        .catch(function(error){
          console.log(error);
        })
      })
      response.status(201).json({message: 'Data stored', id: request.body.id });
    })
    .catch(function(err){
      response.status(500).json({error: err});
    })
  })
})
