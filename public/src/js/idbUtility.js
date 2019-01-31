let dbPromise = idb.open('posts-store', 1, function(db){// opening indexed db with the script we imported (idb.js) and give it a name in first parameter , as a second parameter the version of this db , and third parameter a function.
  //this function can't be avoided , its executed when ever the database was created and we get back an object wich allow us accesing the database.
  //we create a new object store , it's likely table.
  if(! db.objectStoreNames.contains('posts')){
    db.createObjectStore('posts', { keyPath: 'id'});   //this function take two arguments : the name of the store.
                                                     //the second arguments : define an object , in this one we define a primary key of each object will be stored in that object store.
  }                                                 // id is set as the primary key for posts.

});

function writeData(st, data){ // st for the store and data for data stored
  return dbPromise.then(function(db){
    //let's create a transaction with indexed db
    // this method takes two arguments : 1 -> wich store do target. 2-> wich kind of transaction is it.
    let tx = db.transaction(st, 'readwrite');// First step you say what you want for the transaction and then you open explicitly the store.
    let store = tx.objectStore(st);
    store.put(data); // put something in that store
    return tx.complete // complete is just a propertie, returning tx.complete is needed because every time you do a write operation you want to keep the databse integrity and don't get an error.
  });
}

function readAllData (st) {
  return dbPromise.then(function(db){
    let tx = db.transaction(st, 'readonly');
    let store = tx.objectStore(st);
    return store.getAll();
  })

}

function clearAllData(st){
  return dbPromise
    .then(function(db){
      let tx = db.transaction(st, 'readwrite');
      let store = tx.objectStore(st);
      store.clear();
      return tx.complete


    })
}

function deleteItemFromData(st, id) {// it takes two arguments , the store and the id of the item you want to delete
  console.log('st ->', st)
  console.log('id ->', id)

  dbPromise
    .then(function(db) {
      var tx = db.transaction(st, 'readwrite');
      var store = tx.objectStore(st);
      store.delete(id);
      return tx.complete;
    })
    .catch( (error) => {
      console.error(error)
    })
    .then(function() {
      console.log('Item deleted!');
    });
}
