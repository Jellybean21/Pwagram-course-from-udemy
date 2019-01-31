var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
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
  createPostArea.style.display = 'none';
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
  cardTitle.style.height = '180px';
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
  /*.then(function(data){
    netWorkDataReceived = true; // set true when we get the data from web, with that the only one to use the cache response
    console.log('From web', data);// It's kind of a race , one could be faster than the other one
    let dataArray = [];
    for ( var key in data){
      dataArray.push(data[key]) // we push all the values of keys value pairs into an array, this array will hold the objects and his properties.
    }
    updateUI(dataArray);
});*/


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
