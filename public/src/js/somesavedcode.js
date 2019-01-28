let promise = new Promise(function(resolve, reject){ //resolve and reject give us back two basics types of results
  setTimeout(function(){
    //resolve('This is executed once the timer is done');//this simply means the promise is done
    reject({code: 500, message: 'An error as occured'});
    //console.log();
  }, 3000);
});
// Can't use AJAX in service worker
let xhr = new XMLHttpRequest();
xhr.open('GET', 'http://httpbin.org/ip');
xhr.responseType = 'json';

xhr.onload = function(){
  console.log(xhr.response);
};
xhr.onerror = function() {
  console.log('Error!')
};
xhr.send();
fetch('http://httpbin.org/ip')
  .then(function(response){
    console.log(response);
    return response.json();//utility method provided by the fetch API on the response object to extract data and convert it into javascript object
  }).then(function(data){
    console.log(data);
  }).catch(function(err){
    console.log(err);
  });

  fetch('http://httpbin.org/post', {
    method: 'POST', // important method by default is GET
    headers: {
      'Content-Type': 'application/json', //pass a JavaScript object with key values pairs representig the headers you want to set (ex: you can send JSON data)
      'Accept': 'application/json',
    },
    mode: 'cors',//hte response has to include the cors headers
    body: JSON.stringify({message: 'Does this work?'})//we send the actual body here

  })
    .then(function(response){
      console.log(response);
      return response.json();
    }).then(function(data){
      console.log(data);
    }).catch(function(err){
      console.log(err);
    });
//promise.then(function (validationText){
//  return validationText;
//}, function(err){
//  console.log(err.code, err.message);//from the object in the reject result
//}).then(function(newTextValidation){
//  console.log(newTextValidation);
//});
promise.then(function(validationText){
  return validationText;
}).then(function(newTextValidation){
  console.log(newTextValidation)
}).catch(function(err){
  console.log(err.code, err.message);
});

console.log('This is executed right after setTime out');
