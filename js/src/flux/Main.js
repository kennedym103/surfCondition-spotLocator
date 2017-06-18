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

// DON'T use "const indexedDB = ..." if you're not in a function.
// Moreover, you may need references to some window.IDB* objects:
window.IDBTransaction = window.IDBTransaction || window.webkitIDBTransaction || window.msIDBTransaction || {READ_WRITE: "readwrite"}; // This line should only be needed if it is needed to support the object's constants for older browsers
window.IDBKeyRange = window.IDBKeyRange || window.webkitIDBKeyRange || window.msIDBKeyRange;
// (Mozilla has never prefixed these objects, so we don't need window.mozIDB*)

// Let us open our database
const request = window.indexedDB.open(Store);
const result = Object.keys(Store).map(function(e) {
  return [Store[e]];
});
console.log(result);
console.log(Store);

const r = 10; // require distance
lat_range = IDBKeyRange.bound(query_lat - r, query_lat + r);
lng_range = IDBKeyRange.bound(query_lng - r, query_lng + r);

obj_store = db.objectStore('geopoint');
lat_key_cursor = obj_store.index('lat').openKeyCursor(lat_range);
lng_key_cursor = obj_store.index('lng').openKeyCursor(lng_range);

const compound_index = obj_store.index('lat, lng');
const range = IDBKeyRange.bound([query_lat - r], [query_lat + r]);
const cursor = compound_index.openKeyCursor(range);
cursor.onsuccess = function(e) {
  const key = e.target.result.key();
  const lat = key[0];
  const lng = key[1];
  if (lng > query_lng - r && lng < query_lng + r) {
     // we get result
     const req = obj_store.get(e.target.result.primaryKey());
     req.onsuccess = function(e2) {
        console.log(e2.target.result);
     }
  }
}  