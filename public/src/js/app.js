let defferedPrompt;
let enableNotificationsButtons = document.querySelectorAll('.enable-notifications')
if(!window.Promise ){ // that means my browser natively support promises, but if not the case add exclamation mark so i can set this on my own
  window.Promise = Promise;
}
//We register a new serviceWorker
if('serviceWorker' in navigator) {
  navigator.serviceWorker
  .register('/sw.js')//the register return a promise
  .then(function(){
    console.log('ServiceWorker registered')
  }).catch(function(err){
    console.log(err);
  });
}

window.addEventListener('beforeinstallprompt', (e) => {
  console.log('Before the prompt fired');
  event.preventDefault(); // chrome wont be able to show the prompt for installing app
  defferedPrompt = event;
  return false;
});
//display a notification
function displayConfirmNotification(){
  if('serviceWorker' in navigator){
    let options = {
      body: 'Welcome to our new subscibe notifications, enjoy it , have a nice day',
      icon: 'src/images/icons/app-icon-96x96.png',
      image: 'src/images/sf-boat.jpg',
      dir : 'ltr', // direction of the text // in that case : left to right
      lang: 'en-US', //BCP 47 language
      vibrate: [100, 50, 200],
      badge:  '/src/images/icons/app-icon-96x96.png',
      tag: 'confirm-notification',
      renotify: true, // combined with tag its allows you to be alert by a new notification
      actions: [
        {action: 'confirm', title: 'Ok', icon: 'src/images/icons/app-icon-96x96.png'}, // buttons displayed next to the notification.
        {action: 'cancel', title: 'Cancel', icon: 'src/images/icons/app-icon-96x96.png'}
      ]
    };
    navigator.serviceWorker.ready
      .then(function(swreg){ // swreg for serviceWorker registration
        swreg.showNotification('Successfully subscribed (FROM SW)', options) // this is the serviceWorker interface to show notifications. It take same arguments as new Notification
      })
  }
}

function configurePushSub() {
  if (!('serviceWorker' in navigator)) {
    return;
  }

  var reg;
  navigator.serviceWorker.ready
    .then(function(swreg) {
      reg = swreg;
      return swreg.pushManager.getSubscription();
    })
    .then(function(sub) {
      if (sub === null) {
        // Create a new subscription
        var vapidPublicKey = 'BEtghSwe2phhdR37gL2cdznuj9vPLdds1-3SxIqafgaTp_TfmNZQDeZXmK-wEDJ5dSLHvmBMRVCWnkCrgSsRqH0';
        var convertedVapidPublicKey = urlBase64ToUint8Array(vapidPublicKey);
        return reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidPublicKey
        });
      } else {
        // We have a subscription
      }
    })
    .then(function(newSub) {
      return fetch('https://patagram-b2193.firebaseio.com/subscriptions.json', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(newSub)
      })
    })
    .then(function(res) {
      if (res.ok) {
        displayConfirmNotification();
      }
    })
    .catch(function(err) {
      console.log(err);
    });
}


//ask permission for enabling notifications
function askForPermissionNotification(){
  Notification.requestPermission(function(result){
    console.log('USer choice: ', result);
    if( result !== 'granted'){
      console.log('No notification permission granted')
    }else{

      console.log('Permission notification is displayed');
      configurePushSub();
      //displayConfirmNotification();

    }
  })
}
// check if notifications API is supported by browers
if('Notification' in window && 'serviceWorker' in navigator){

  for (var i = 0; i < enableNotificationsButtons.length ; i++){
      enableNotificationsButtons[i].style.display = 'inline-block';
      enableNotificationsButtons[i].addEventListener('click', askForPermissionNotification)
  }

}
