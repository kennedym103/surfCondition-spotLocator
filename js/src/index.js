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

       drawHtml(locations);
       surfHeight();
       addIcons();
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

          <img class="card-img-top img-fluid" src="https://maps.googleapis.com/maps/api/staticmap?center=${arr[l].lat},${arr[l].lng}&zoom=13&size=500x250&&style=feature:water|element:all|color:0x92afd1&key=AIzaSyBwKCefMD-LRIuQvwoGCbsFkcGKas0hjo4" alt="Card image cap">

          <div class="card-block pt-0 pb-0">
            <div class="row">
              <div class="col">
                <div class="town-text text-center">current conditions at ${arr[l].town}</div>
              </div>
            </div>
            <div class="row border-t">
              <div class="col">
                <div class="swell-text text-color text-center swellHeight${l}">${arr[l].swell.components.combined.height}</div>
                <div class="swell-sub-text text-color text-center">SWELL HEIGHT - <span>ft</span></div>
              </div>
            </div>
          <div class="row mt-3">
              <div class="col">
                <div class="wind-direction-text text-color text-center ">${arr[l].wind.compassDirection} <img src="assets/wind-directions/south-west.png"> </div>
                <div class="wind-direction-sub-text text-color text-center ">WIND DIRECTION</div>
              </div>
              <div class="col">
                <div class="wind-speed-text text-color text-center " >${arr[l].wind.speed} <img src="assets/wind-speed.png"></div>
                <div class="wind-speed-sub-text text-color text-center ">WIND SPEED - <span>mph</span></div>
              </div>
              <div class="col">
                <div class="swell-period-text text-color text-center">${arr[l].swell.components.primary.period} <img src="assets/swell-period.png"></div>
                <div class="swell-period-sub-text text-color text-center ">SWELL PERIOD - <span>seconds</span></div>
              </div>
            </div>
            <div class="collapse border-t mt-3" id="more-surf-data${l}">
              <div class="row">
                <div class="col pt-3">
                Anim pariatur cliche reprehenderit, enim eiusmod high life accusamus terry richardson ad squid. Nihil anim keffiyeh helvetica, craft beer labore wes anderson cred nesciunt sapiente ea proident.
                </div>
              </div>
            </div>
            <div class="row mt-4 btn-container border-t">
              <div class="col-4 mt-3 mb-3">
              <a class="btn btn-primary" data-toggle="collapse" href="#more-surf-data${l}" aria-expanded="false" aria-controls="collapseExample">
                Link with href
              </a>
              </div>
              <div class="col-4 mt-3 mb-3">
              </div>
              <div class="col-4 mt-3 mb-3">
              <a class="navigation text-center" href="https://maps.google.com?q=${arr[l].lat},${arr[l].lng}"><span>NAVIGATE</span></a>
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

function addIcons() {
  $('.navigation').prepend('<svg xmlns:x="http://ns.adobe.com/Extensibility/1.0/" xmlns:i="http://ns.adobe.com/AdobeIllustrator/10.0/" xmlns:graph="http://ns.adobe.com/Graphs/1.0/" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="-949 951 100 125" style="enable-background:new -949 951 100 100;" xml:space="preserve"><switch><foreignObject requiredExtensions="http://ns.adobe.com/AdobeIllustrator/10.0/" x="0" y="0" width="1" height="1"/><g i:extraneous="self"><path d="M-886.6,1047.5c-3.6,0-6.9-2-8.4-5.3l-14.6-30.3c0-0.1-0.1-0.2-0.2-0.2l-30.3-14.6c-3.5-1.7-5.5-5.2-5.3-9.1    c0.2-3.8,2.8-7.1,6.4-8.3l74.2-24.7c3.4-1.1,7.1-0.3,9.6,2.3c2.5,2.5,3.4,6.2,2.3,9.6l-24.7,74.2c-1.2,3.6-4.5,6.2-8.3,6.4    C-886.2,1047.5-886.4,1047.5-886.6,1047.5z M-861.9,962.5c-0.1,0-0.3,0-0.4,0.1l-74.2,24.7c-0.8,0.3-0.9,0.9-0.9,1.2    c0,0.3,0,1,0.8,1.3l30.3,14.6c1.7,0.8,3.1,2.2,4,4l14.6,30.3c0.4,0.7,1,0.8,1.3,0.8c0.3,0,1-0.2,1.2-0.9l24.7-74.2    c0.2-0.5,0-1-0.3-1.4C-861.2,962.6-861.5,962.5-861.9,962.5z"/></g></switch></svg>');
}
