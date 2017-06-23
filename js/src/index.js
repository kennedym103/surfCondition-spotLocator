var data = require('./data');
var location = data.array;
var Dexie = require('dexie');
var db = new Dexie('surfSpots');
db.version(1).stores({
    locations: 'spotId, [lat+lng], town'
});


const getGeolocationData = () => {
    return new Promise((resolve, reject) => {
        if (!navigator.geolocation) reject('navigator not supported!')
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;

            resolve({
                currentLat: latitude,
                currentLng: longitude,
            })
        });
    })
}

Dexie.spawn(function*() {
    // Now lets add a bunch of tasks

    for (var i = 0; i < location.length; ++i) {
        yield db.locations.bulkPut([
            { spotId: location[i].spotId, lat: location[i].lat, lng: location[i].lng, town: location[i].town }
        ]);
    }
    // Ok, so let's query it

    getGeolocationData().then(({ currentLat, currentLng }) => {
        var yourSurfSpots = db.locations.where('[lat+lng]').between([currentLat - 2, currentLng - 2], [currentLat + 2, currentLng + 2])
            .toArray();
        yourSurfSpots.then(data => {
            console.log("Done.");
        })
        Promise.resolve(yourSurfSpots).then(function(value) {

        	const spotNumber = value[0].spotId;
        	console.log(spotNumber);
            $.ajax({
                url: "http://magicseaweed.com/api/76b9f172c5acb310986adca80941a8bb/forecast/?spot_id={spotNumber}",

                // The name of the callback parameter, as specified by the YQL service
                    jsonp: "callback",

                // Tell jQuery we're expecting JSONP
                dataType: "jsonp",

                // Tell YQL what we want and that we want JSON
                data: {
                    format: "json"
                },

                // Work with the response
                success: function(data) {
                    return data;
                }
            });

            // "Success"
        }, function(value) {
            // not called
        });
    })

}).catch(err => {
    console.error("Uh oh! " + err.stack);
});
