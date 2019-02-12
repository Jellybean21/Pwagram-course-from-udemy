let functions = require('firebase-functions');
let admin = require('firebase-admin');
let cors = require('cors')({origin: true});
let serviceAccount =  require("./pantagram-key.json");
let webpush = require('web-push');
let fs = require('fs');
let UUID = require('uuid-v4');
let os = require('os');
var Busboy = require("busboy");
var path = require('path');
// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
let gcconfig = {
  projectID: 'patagram-b2193',
  keyFilename: 'pantagram-key.json'
}

let gcs = require('@google-cloud/storage')(gcconfig) //this execute a function that we execute immediately and we pass config to that function

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://patagram-b2193.firebaseio.com/'
});

exports.storePostData = functions.https.onRequest(function(request, response){
  cors(request, response, function(){// passing request and response as extra arguments
    //extracting the form data
    let uuid = UUID();
    const busboy = new Busboy({headers: request.headers})
    // These objects will store the values (file + fields) extracted from busboy
    let upload;
    const fields = [];
      // This callback will be invoked for each file uploaded
      busboy.on('file', (fieldname, file, filename, encoding, mimetype) => {
        console.log(
            `File [${fieldname}] filename: ${filename}, encoding: ${encoding}, mimetype: ${mimetype}`
        );
        const filepath = path.join(os.tmpdir(), filename);
        upload = {file: filepath, type: mimetype};
        file.pipe(fs.createWriteStream(filepath))
      })
      // This will invoked on every field detected
      busboy.on('field', function(fieldname, val, fieldnameTruncated, valTruncated, encoding, mimetype){
        fields[fieldname] = val
      })

      // This callback will be invoked after all uploaded files are saved.
      busboy.on('finish', () => {
        let bucket = gcs.bucket('patagram-b2193.appspot.com')
        console.log(bucket);
       bucket.upload(
         upload.file,
          {
           //metadata for the upload , and metadata in the metadata upload is for the file
           uploadType: "media",
           metadata: {
             metadata: {
               contentType: upload.type,
               //generating a default URL download
               firebaseStorageDownloadTokens:  uuid
             }
           }
         },
         function(err, uploadedFile){
           if(!err) {
             admin
             .database()
             .ref('post')
             .push({
               id: fields.id,
               title: fields.title,
               location: fields.location,
               rawLocation: {
                 lat: fields.rawLocationLat,
                 lng: fields.rawLocationLng
               },
               image: "https://firebasestorage.googleapis.com/v0/b/" +
               bucket.name +
               "/o/" +
               encodeURIComponent(uploadedFile.name) +
               "?alt=media&token=" + uuid

             })
             .then(function(){
               //put a valid mail adress as first argument , and your public et privat key as second and third arguments
               webpush.setVapidDetails('mailto:dave_dnb21@hotmail.fr', 'BEtghSwe2phhdR37gL2cdznuj9vPLdds1-3SxIqafgaTp_TfmNZQDeZXmK-wEDJ5dSLHvmBMRVCWnkCrgSsRqH0', 'OOu_gyRGc_iDM2WtYwQPM2BNm4K-xhyWRvZTmCjbLkE');
               return admin
               .database()
               .ref('subscriptions')
               .once('value')

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
                 };
                 webpush.sendNotification(pushConfig, JSON.stringify({
                   title:    'New post',
                   content:  'New post added',
                   openUrl:  '/help',
                   customID: 'liuytredsxcvbn,jhytredcfbnklmoiuytrezsrtyuj'
                 })
                  )// first argument the object with datas to send push to some endpoints, and as second argument the payload
                  .catch(function(error){
                   console.log(error);
                 });
               });
               response
               .status(201)
               .json({message: 'Data stored', id: fields.id });
             })
             .catch(function(err){
               response.status(500).json({error: err});
             });
           }else{
             console.log(err);
           }
         }
       );

     });
     // The raw bytes of the upload will be in request.rawBody.  Send it to busboy, and get
     // a callback when it's finished.
     busboy.end(request.rawBody);
   });
 });
