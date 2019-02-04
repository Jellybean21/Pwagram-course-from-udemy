var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var form = document.querySelector('form');
var titleInput = document.querySelector('#title');
var locationInput = document.querySelector('#location');


function openCreatePostModal() {
  createPostArea.style.display = 'block';
  setTimeout(function(){
      createPostArea.style.transform = 'translateY(0)';
  }, 1);

  // setTimeout(function(){
  //
  // }, 1);

  // check if default prompt is set
  if (defferedPrompt){
    //the prompt method
    defferedPrompt.prompt();

    defferedPrompt.userChoice.then(function (choiceResult){// userChoise is a promise where we given the choiceResult
      console.log(choiceResult.outcome); // a string that describe the choice of the user

      if(choiceResult.outcome === 'dismissed'){
        console.log('User cancelled installation');
      }else{
        console.log('User added to home screen');
      }
    });
    defferedPrompt = null;
  }
  //unregister a service worker bind on function openCreatePostModal()
  /*if ('serviceWorker' in navigator){
    navigator.serviceWorker.getRegistrations()
    .then(function (registrations) {
      for (var i = 0; i < registrations.length; i++){
        registrations[i].unregister();
      }
    })
  }
}
*/
}
function closeCreatePostModal() {
  createPostArea.style.transform = 'translateY(100vh)';

}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);
// Not in use , allow to save assets i cache on demand
function onClickSavedButton(event){
  console.log('button clicked');
  if ('caches' in window){ // check if caches object exists
    caches.open('user-requested')
    .then(function(cache){
      cache.add('https://httpbin.org/get');//request will be sent to this url
      cache.add('/src/images/sf-boat.jpg');
    });
  }
}
function clearCards(){
  while(sharedMomentsArea.hasChildNodes()){
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}
function createCard(data){
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp mrmlauto';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url(' + data.image + ')'; // accesing the image from the database.
  cardTitle.style.backgroundSize = 'cover';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  //var cardSaveButton = document.createElement('button');
  //cardSaveButton.textContent = 'Save';
  //cardSaveButton.addEventListener('click', onClickSavedButton);
  //cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

function updateUI(data){ // we expect to get the data from database
  clearCards();
  for(var i = 0; i < data.length; i++){
    createCard(data[i]);
  }
}

let url = 'https://patagram-b2193.firebaseio.com/post.json'; // addind .json at the end because it's a simple requierement from firebase to target the real API endpoint.
let netWorkDataReceived = false;


fetch(url)
  .then(function(res){
    return res.json();
})
  .then(function(data){
    netWorkDataReceived = true; // set true when we get the data from web, with that the only one to use the cache response
    console.log('From web', data);// It's kind of a race , one could be faster than the other one
    let dataArray = [];
    for ( var key in data){
      dataArray.push(data[key]) // we push all the values of keys value pairs into an array, this array will hold the objects and his properties.
    }
    updateUI(dataArray);
});


/*
if ('caches' in window){
  caches.match(url)
  .then(function(response){
    if (response) {
      return response.json();
    }
  }).then(function(data){
    console.log('From cache', data);
    if (!netWorkDataReceived){
    let dataArray = [];
    for (var key in data){
      dataArray.push(data[key]);
    }
    updateUI(dataArray);
    }

  });
}
*/
if ('indexedDB' in window ){
  readAllData('posts')
    .then(function(data){
      if (!netWorkDataReceived){
        console.log('From cache: ', data);
        updateUI(data);
      }
    });
}
// function used to send data directly to the data base w/o passing by the indexedDB
function sendData(){
  fetch('https://us-central1-patagram-b2193.cloudfunctions.net/storePostData', {
    method: 'POST',
    hearders: {'Content-Type': 'application/json',
               'Accept': 'application/json'} ,
      body: JSON.stringify({
      id: new Date().toISOString(),
      title: titleInput.value,
      location: locationInput.value,
      image: 'https://firebasestorage.googleapis.com/v0/b/patagram-b2193.appspot.com/o/sf-boat.jpg?alt=media&token=5a7f4de8-83e6-4c3a-9c94-a92aab337811'
    })//JSON.stringify to turn into Json data
  })
  .then(function(res){
    console.log('Data sent', res);
    updateUI();
  })
}
form.addEventListener('submit', function(event){ //the default of a submit event is to send data to the server.
  event.preventDefault();

  if(titleInput.value.trim() === '' || locationInput.value.trim() === ''){
    return;
    // if input are empty we return it to ignore the submit click
  }
  closeCreatePostModal();


  //let's check if serviceWorker and SyncManager are available

  if('serviceWorker' in navigator && 'SyncManager' in window){
    //with the ready property to make sure it has been configured : installed and activated
    //get access with the serviceWorker
    navigator.serviceWorker.ready.then(function (sw){
      let post = {
        id: new Date().toISOString(),
        title: titleInput.value,
        location: locationInput.value
      };
      writeData('sync-posts', post)
        .then(function(){
          //interact with the serviceWorker
          //the event who trigger the background synchronisation fire in feed.js
          //sw.sync give us access to the sunc manager from the service worker
          //we can add an id tag to clearly identify the synchro task
          return sw.sync.register('sync-new-posts')
          .then(function(){
            let snackbarContainer = document.querySelector('#confirmation-toast');
            let data = {message: 'Your message is saved for sync later'};
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
          })
          .catch(function(error){
            console.log('An error as occured: ', error);
          });
        });


    });
  }else{
    sendData();
  }
});
