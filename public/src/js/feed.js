var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');

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
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);
function createCard(){
  var cardWrapper = document.createElement('div');
  cardWrapper.classname = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card_title';
  cardTitle.style.backgroundImage = 'url("/src/images/sf-boat.jpg")';
  cardTitle.stylebackgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardSupportingText = document.createElement ('div');
  cardSupportingText.className = 'mdl-card_supporting-text';
  cardSupportingText.textContent = 'In San Francisco';
  cardSupportingText.style.textAlign = 'center';
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

fetch('https://httpbin.org/get')
.then(function(res){
  return res.json();
})
.then(function(data){
  createCard();
})
