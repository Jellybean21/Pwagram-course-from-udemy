let defferedPrompt;

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
