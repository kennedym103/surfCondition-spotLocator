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
        db
            .locations
            .where('[lat+lng]')
            .between([currentLat - 2, currentLng], [currentLat + 2])
            .and(x => (x.lng > currentLng - 2) && (x.lng < currentLng + 2))
            .toArray()
            .then(handleData)
    })
}

// db.table1.where("key1").between(8,12).and(function (x) { return x.key2 >= 3 && x.key2 < 18; }).toArray();


const handleData = (values) => {
    const promises = values.map(value => $.ajax({
        url: `https://magicseaweed.com/api/76b9f172c5acb310986adca80941a8bb/forecast/?spot_id=${value.spotId}`,

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
       surfHeight();
    })
}

const handleDataResults = (results, values) => {

    const currNow = new Date().getTime()
    const locations = []

    for (let j = 0; j < results.length; j++) {

        for (let k = 0; k < results[j].length; k++) {

            if (currNow < results[j][k].timestamp*1000 ) {

                const data = results[j][k-1];
                data.overallRating = data.solidRating  + data.fadedRating * 2;
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
         <div class="card-header card-border--top">
            <div class="row">
              <div class="col">
                <div class="town-text">${arr[l].town}</div>
              </div>
              <div class="col">
                <a class="navigation-text" href="https://maps.google.com?q=${arr[l].lat},${arr[l].lng}">NAVIGATE</a>
               </div>
            </div>
        </div>

        <img class="card-img-top img-fluid" src="https://maps.googleapis.com/maps/api/staticmap?center=${arr[l].lat},${arr[l].lng}&zoom=13&size=500x150&key=AIzaSyBwKCefMD-LRIuQvwoGCbsFkcGKas0hjo4" alt="Card image cap">
            <div class="card-block pt-0">

              <div class="row">
                <div class="col">
                  <div class="swell-text text-color text-center swellHeight${l}">${arr[l].swell.components.combined.height}</div>
                  <div class="swell-sub-text text-color text-center">SWELL HEIGHT - <span>ft</span></div>
                </div>
              </div>


                <div class="row">

                    <div class="col">
                       <div class="card-text">DIRECTION</div>
                        <div>${arr[l].swell.components.primary.compassDirection}</div>
                        <div class="card-text">PERIOD</div>
                        <div>${arr[l].swell.components.primary.period} SECONDS</div>
                    </div>
                </div>
                <div class="row">
                <div class="col">
                        <div class="card-text">WIND</div>
                    </div>
                </div>
                <div class="row">

                   <div class="col">
                        <div>${arr[l].wind.compassDirection}</div>
                    </div>
                    <div class="col">
                        <div>${arr[l].wind.speed} MPH</div>
                    </div>
                </div>
              </div>

              </div>
            </div>
        </div>`);

    }
}

function surfHeight() {
  for (let m = 0; m < 20; m++) {
    if((parseFloat($('.swellHeight'+m).text())) <= 2.5) {
      $('.swellHeight'+m).append('<img src="assets/surf-height-red.png">');
    } else if ((parseFloat($('.swellHeight'+m).text())) > 2.5 && (parseFloat($('.swellHeight'+m).text())) < 4) {
      $('.swellHeight'+m).append('<img src="assets/surf-height-teal.png">');
    } else {
      $('.swellHeight'+m).append('<img src="assets/surf-height-green.png">')
    } ;
  }
}
