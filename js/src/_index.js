var data = require('./data');
var $ = require("jquery");
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
        var yourSurfSpots = db.locations.where('[lat+lng]').between([currentLat - .6, currentLng - .6], [currentLat + .6, currentLng + .6])
            .toArray();
        yourSurfSpots.then(function(value) {

            for (i = 0; i < value.length; i++) {
        	
            let spotNumber = value[i].spotId;
        	console.log(spotNumber);
            
            $.ajax({
                url: `http://magicseaweed.com/api/76b9f172c5acb310986adca80941a8bb/forecast/?spot_id=${spotNumber}`,

                // The name of the callback parameter, as specified by the YQL service
                jsonp: "callback",

                // Tell jQuery we're expecting JSONP
                dataType: "jsonp",

                // Tell YQL what we want and that we want JSON
                data: {
                    format: "json"
                },

                // Work with the response
                success: function(apiData) {
                    console.log(apiData);
                    
                    let curTimestamp = new Date().getHours();
                    let apiTimestamp1 = new Date(apiData[0].localTimestamp).getHours();
                    let apiTimestamp2 = new Date(apiData[1].localTimestamp).getHours();
                    let apiTimestamp3 = new Date(apiData[2].localTimestamp).getHours();

                    console.log('DATE NOW', new Date())
                    console.log('DATE FOR 0', new Date(apiData[0].localTimestamp*1000))

                    if((apiTimestamp1 <= curTimestamp)  && (curTimestamp < apiTimestamp2)) {
                        const sRating = apiData[0].solidRating * 2;
                        const fRating = apiData[0].fadedRating;
                    } else if ((apiTimestamp2 <= curTimestamp)  && (curTimestamp < apiTimestamp3)) {
                        const sRating = apiData[1].solidRating * 2;
                        const fRating = apiData[1].fadedRating;
                    } else {
                        const sRating = apiData[2].solidRating * 2;
                        const fRating = apiData[2].fadedRating;
                    }
                }
            });

            // "Success"
        } // for
    }, function(value) {
            // not called
        });
    })

}).catch(err => {
    console.error("Uh oh! " + err.stack);
});

function spotValue(sRating, fRating) {
  var spotConditions = sRating + fRating;
  return spotConditions;
}