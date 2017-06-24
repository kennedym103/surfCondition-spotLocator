var data = require('./data');
var $ = require("jquery");
var location = data.array;
var Dexie = require('dexie');

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

const db = new Dexie('surfSpots');
// db.version(1).stores({
//     locations: 'spotId, [lat+lng], town'
// });
db.open()
    .then(_ => {
        console.log('here')
        const db = new Dexie('surfSpots');
        db.version(1).stores({
            locations: 'spotId, [lat+lng], town'
        });
        db.open();
        main(db)
    })
    .catch(function (err) {
        console.error (err.stack || err);
        console.log('here111')
        const db = new Dexie('surfSpots');
        db.version(1).stores({
            locations: 'spotId, [lat+lng], town'
        });
        for (var i = 0; i < location.length; ++i) {
            console.log(location[i])
            db.locations.bulkPut([{
                spotId: location[i].spotId, 
                lat: location[i].lat, 
                lng: location[i].lng, 
                town: location[i].town
            }]);
        }
        db.open();
        main(db)
    });

const main = (db) => {
     getGeolocationData().then(({ currentLat, currentLng }) => {
        console.log(currentLng, currentLng)
        db
            .locations
            .where('[lat+lng]')
            .between([currentLat - .6, currentLng - .6], [currentLat + .6, currentLng + .6])
            .toArray()
            .then(handleData)
    })  
}


const handleData = (values) => {
    const promises = values.map(value => $.ajax({
        url: `http://magicseaweed.com/api/76b9f172c5acb310986adca80941a8bb/forecast/?spot_id=${value.spotId}`,

        // The name of the callback parameter, as specified by the YQL service
        jsonp: "callback",

        // Tell jQuery we're expecting JSONP
        dataType: "jsonp",

        // Tell YQL what we want and that we want JSON
        data: {
            format: "json"
        },
    }));  

    Promise.all(promises).then(resultsArr => {
       const locations = handleDataResults(resultsArr, values)
       // sort locations

       locations.sort( (a, b) => a.overallRating <= b.overallRating ? 1 : -1);
       
       drawHtml(locations)
    })
}

const handleDataResults = (results, values) => {

    const currNow = new Date().getTime()
    const locations = []

    for (let j = 0; j < results.length; j++) {
        
        for (let k = 0; k < results[j].length; k++) {
                
            if (currNow < results[j][k].timestamp*1000 ) {
             
                const data = results[j][k-1];
                data.overallRating = data.solidRating * 2 + data.fadedRating;
                const dataWithValue = Object.assign({}, data, values[j])

                locations.push(dataWithValue)
                break;
            }
        }
    }

    console.log(locations)
    return locations;
}

const drawHtml = (arr) => {
    for (let l = 0; l < arr.length; l++){
        $('#js-cards').append(
        `<div class="card mt-4 mb-4">
            <img class="card-img-top img-fluid" src="https://maps.googleapis.com/maps/api/staticmap?center=${arr[l].lat},${arr[l].lng}&zoom=13&size=500x300&key=AIzaSyBwKCefMD-LRIuQvwoGCbsFkcGKas0hjo4" alt="Card image cap">
            <div class="card-block">
              <h4 class="card-title">${arr[l].town}</h4>
              <h3 class="card-text">SWELL HEIGHT</h3>
              <h4>${arr[l].swell.maxBreakingHeight} FEET</h4>
              <p><a href="https://maps.google.com?q=${arr[l].lat},${arr[l].lng}">NAVIGATE</a></p>
            </div>
        </div>`);
    }    
}