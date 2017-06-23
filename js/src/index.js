var data = require('./data');
var location = data.array;
var Dexie = require('dexie');
var db = new Dexie('surfSpots');
db.version(1).stores({
    locations: 'spotId, [lat+lng], done'
});


const getGeolocationData = () => {
	return new Promise((resolve, reject) => {
		if (!navigator.geolocation) reject('navigator not supported!') 
		navigator.geolocation.getCurrentPosition(position => {
			const {latitude, longitude} = position.coords;

			resolve({
				currentLat: latitude,
				currentLng: longitude,
			})
		});
	})
}

Dexie.spawn(function*() {
        // Now lets add a bunch of tasks
     
     	for (var i=0;i<location.length;++i) {
	    yield db.locations.bulkPut([
	        {spotId: location[i].spotId, lat: location[i].lat, lng: location[i].lng, done: i}
	    ]);
	   }
    // Ok, so let's query it
    
    getGeolocationData().then(({currentLat, currentLng}) => {
		var yourSurfSpots = db.locations.where('[lat+lng]').between([currentLat - 2, currentLng - 2],[currentLat + 2, currentLng + 2])
		.toArray();
		yourSurfSpots.then(data => {
			console.log("Completed locations: " + JSON.stringify(yourSurfSpots));
    		console.log ("Done.");
		})
   		
    })
    
}).catch (err => {
    console.error ("Uh oh! " + err.stack);
});
