const express = require('express');
const app = express();

app.get('/', function(req, res){
  res.send('hello world');
});

app.listen(3000);


import React, { Component } from 'react';

import App from '../components/App';

import { 
    actions
} from './actions';

import {
    Store
} from './store';

export default class Main extends Component {
    state = Store

	dispatch(actionName, options) {
		const actionToDo = actions[actionName];
		actionToDo(this.state, options).then((newStore) => {
			this.setState(newStore);
		});	
	}

	render() {
		const sharedProps = {
			dispatch: (...args) => this.dispatch(...args),
		};

        return <App {...this.state} {...sharedProps} /> 
	}
}


// Let us open our database
var DBOpenRequest = window.indexedDB.open("toDoList", 4);

DBOpenRequest.onsuccess = function(event) {
  console.log(' database initialised.');
    
  // store the result of opening the database in the db variable.
  // This is used a lot below
  db = DBOpenRequest.result;
    
  // Run the addData() function to add the data to the database
  addData();
};

function addData() {
  // Create a new object ready to insert into the IDB
  var newItem = [ { taskTitle: "Walk dog", hours: 19, minutes: 30, day: 24, month: "December", year: 2013, notified: "no" } ];

  // open a read/write db transaction, ready for adding the data
  var transaction = db.transaction(["toDoList"], "readwrite");

  // report on the success of opening the transaction
  transaction.oncomplete = function(event) {
    console.log('Transaction completed: database modification finished.');
  };

  transaction.onerror = function(event) {
    console.log('Transaction not opened due to error. Duplicate items not allowed.');
  };

  // create an object store on the transaction
  var objectStore = transaction.objectStore("toDoList");
  console.log(objectStore.name);

  // add our newItem object to the object store
  var objectStoreRequest = objectStore.add(newItem[0]);

  objectStoreRequest.onsuccess = function(event) {
    // report the success of our new item going into the database
    console.log('New item added to DB.');
  };
};
// const request = window.indexedDB.open(Store);
// const result = Object.keys(Store).map(function(e) {
//   return [Store];
// });
// console.log(result);
// console.log(request);

// const r = 10; // require distance
// lat_range = IDBKeyRange.bound(query_lat - r, query_lat + r);
// lng_range = IDBKeyRange.bound(query_lng - r, query_lng + r);

// obj_store = db.objectStore('geopoint');
// lat_key_cursor = obj_store.index('lat').openKeyCursor(lat_range);
// lng_key_cursor = obj_store.index('lng').openKeyCursor(lng_range);

// const compound_index = obj_store.index('lat, lng');
// const range = IDBKeyRange.bound([query_lat - r], [query_lat + r]);
// const cursor = compound_index.openKeyCursor(range);
// cursor.onsuccess = function(e) {
//   const key = e.target.result.key();
//   const lat = key[0];
//   const lng = key[1];
//   if (lng > query_lng - r && lng < query_lng + r) {
//      // we get result
//      const req = obj_store.get(e.target.result.primaryKey());
//      req.onsuccess = function(e2) {
//         console.log(e2.target.result);
//      }
//   }
// }  
