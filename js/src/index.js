var data = require('./data');
var $ = require("jquery");
var location = data.array;
var locationsNextThreeHours = data.array2
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
       const locationsNextThreeHours = handleDataResultsNext(resultsArr, values)

       //  sort locations
       var finalArray = locations.concat(locationsNextThreeHours);

        finalArray.sort(function (a, b) {

          if(a.town == b.town)
          {
              return (a.overallRating  < b.overallRating ) ? -1 : (a.overallRating  > b.overallRating ) ? 1 : 0;
          }
          else
          {
              return (a.overallRating  < b.overallRating ) ? -1 : 1;
          }
      });

       const finalLocations = finalArray.filter((element, index) => {
          return index % 2 === 0;
        })
      const finalLocationsNextThreeHours = finalArray.filter((element, index) => {
         return index % 2 === 1;
       })

       console.log(finalLocations);
       console.log(finalLocationsNextThreeHours);

       drawHtml(finalLocations, finalLocationsNextThreeHours);
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


    return locations;
}

const handleDataResultsNext = (results, values) => {

    const currNow = new Date().getTime()
    const locationsNextThreeHours = []

    for (let j = 0; j < results.length; j++) {

        for (let k = 0; k < results[j].length; k++) {

            if (currNow < results[j][k].timestamp*1000 ) {

                const data1 = results[j][k];
                data1.overallRating = data1.solidRating  + data1.fadedRating * 2;
                const nextThreeHours = Object.assign({}, data1, values[j])

                locationsNextThreeHours.push(nextThreeHours)
                break;
            }
        }
    }


    return locationsNextThreeHours;
}


const drawHtml = (arr, arr2) => {
    for (let l = 0; l < arr.length && arr2.length; l++){
        $('#js-cards').append(
        `<div class="card mt-4 mb-4">

          <img class="card-img-top img-fluid" src="https://maps.googleapis.com/maps/api/staticmap?center=${arr[l].lat},${arr[l].lng}&zoom=13&size=500x250&&style=feature:water|element:all|color:0x92afd1&key=AIzaSyBwKCefMD-LRIuQvwoGCbsFkcGKas0hjo4" alt="Card image cap">

          <div class="card-block pt-0 pb-0">
            <div class="row">
              <div class="col">
                <div class="town-text text-center">conditions at ${arr[l].town}</div>
              </div>
            </div>
            <div class="row border-t">
              <div class="col">
                <div class="swell-text text-color text-center swellHeight${l}">${arr[l].swell.components.combined.height}</div>
                <div class="swell-sub-text text-color text-center">SURF HEIGHT - <span>ft</span></div>
              </div>
            </div>
          <div class="row mt-3">
              <div class="col pl-0">
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
            <div class=" row collapse border-t mt-3" id="more-surf-data${l}">
                <div class="row ">
                   <div class="col ">
                       <div class="town-text text-center">
                        SECONDARY CONDITIONS
                       </div>

                   </div>
                </div>
                <div class="col border-t">
                </div>
                <div class="row ">
                  <div class="col pt-3 p-3 pb-0">


                  </div>
                  <div class="col pt-3 p-3 pb-0">

                  </div>
                  <div class="col pt-3 p-3 pb-0">

                  </div>
                  <div class="col pt-3 p-3 pb-0">
                    <div class="wind-direction-text text-color text-center "> <img src="http://cdnimages.magicseaweed.com/30x30/${arr[l].condition.weather}.png"> </div>
                    <div class="wind-direction-sub-text text-color text-center ">WEATHER</div>
                  </div>
                </div>
            </div>
            <div class="row mt-4 btn-container border-t">
              <div class="col-4 mt-3 mb-3">
                <a class="more-data text-center" data-toggle="collapse" href="#more-surf-data${l}" aria-expanded="false" aria-controls="more-data">
                <span>MORE</span>
                </a>
              </div>
              <div class="col-4 mt-3 mb-3">
                <a href="https://maps.google.com?q=${arr[l].lat},${arr[l].lng}" class="share text-center"><span>SHARE</span></a>
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
  $('.navigation').prepend('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" style="enable-background:new 0 0 100 100;" xml:space="preserve"> <g id="Layer_1"> </g> <g id="Layer_2"> <path class="st0" d="M60.7,91.8c-2.4,0-4.3-1.1-5.6-2c-0.9-0.6-1.6-1.5-2.1-2.5L40.3,59.7c-0.2-0.4-0.5-0.8-0.9-1L11,44.2 c-1.6-0.8-2.9-2.3-3.4-4.1c-0.5-1.7-0.3-3.5,0.6-5c0,0,0.1-0.1,0.1-0.1c0.8-1.3,2-2.2,3.5-2.7L81.7,8.6c1-0.3,1.9-0.4,2.9-0.3 c3.2,0.4,5.4,2.5,6,5.7c0.2,1.1,0.1,2.2-0.2,3.3L67,87.3c-0.8,2.5-3.2,4.3-5.8,4.5C61,91.8,60.9,91.8,60.7,91.8z M83.8,12.7 c-0.2,0-0.4,0-0.7,0.1L13.2,36.5c-0.5,0.2-0.8,0.4-1.1,0.8c-0.4,0.6-0.3,1.2-0.2,1.5c0.2,0.6,0.6,1.1,1.1,1.3c0,0,0,0,0,0 l28.3,14.5c1.3,0.7,2.4,1.8,3,3.1l12.8,27.6c0.1,0.3,0.4,0.6,0.6,0.8c0.6,0.4,1.8,1.2,3.1,1.1c0.8,0,1.5-0.6,1.7-1.4l23.4-70 c0.1-0.3,0.1-0.7,0.1-1c-0.3-1.6-1.3-1.9-2.2-2C83.9,12.8,83.8,12.7,83.8,12.7z"/></g> </svg>');
  $('.more-data').prepend('<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" xml:space="preserve" style="shape-rendering:geometricPrecision;text-rendering:geometricPrecision;image-rendering:optimizeQuality;" viewBox="0 0 500 441.91875000000005" x="0px" y="0px" fill-rule="evenodd" clip-rule="evenodd"><g><path class="fil0 str0" d="M38.548 114.784c19.9892,-26.7694 60.4079,-47.282 105.447,-53.5096 41.4662,-5.73316 81.0744,1.45825 105.431,19.1333m-210.879 216.801c19.9892,-26.7695 60.4079,-47.2823 105.447,-53.5096 41.4662,-5.73367 81.0744,1.45774 105.431,19.1328m212.025 -24.0808c-20.6343,25.8111 -61.5328,44.4052 -106.699,48.5039 -41.8399,3.79714 -81.4677,-5.39444 -105.327,-24.4231m-210.878 -56.8355c19.9892,-26.7694 60.4079,-47.2823 105.447,-53.5099 41.4662,-5.73316 81.0744,1.45825 105.431,19.1332m212.025 -115.293c-20.6343,25.8108 -61.5328,44.4049 -106.699,48.5039 -41.8399,3.79731 -81.4677,-5.39428 -105.327,-24.4229m212.026 67.1313c-20.6343,25.8111 -61.5328,44.4049 -106.699,48.5039 -41.8399,3.79731 -81.4677,-5.39428 -105.327,-24.4231"/></g></svg>');
  $('.share').prepend('<svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 100 100" style="enable-background:new 0 0 100 100;" xml:space="preserve"> <path d="M74.1,37.6c1.2,0.5,2.4,0.7,3.6,0.7c1.3,0,2.6-0.3,3.8-0.8c2.4-1,4.2-2.9,5.2-5.3c1-2.4,0.9-5.1-0.1-7.5 c-1-2.4-2.9-4.2-5.3-5.2c-2.4-1-5.1-0.9-7.5,0.1c-2.4,1-4.2,2.9-5.2,5.3c-0.7,1.7-0.8,3.5-0.6,5.2L30,44.5 c-1.8-2.1-4.5-3.5-7.5-3.5c-5.4,0-9.8,4.4-9.8,9.8s4.4,9.8,9.8,9.8c3,0,5.8-1.4,7.6-3.6L66.7,71c0,0.2,0,0.5,0,0.7 c0,5.4,4.4,9.8,9.8,9.8s9.8-4.4,9.8-9.8s-4.4-9.8-9.8-9.8c-3.5,0-6.7,1.9-8.4,4.8L32,52.8c0.1-0.7,0.2-1.4,0.2-2.1 c0-0.8-0.1-1.5-0.3-2.2l37.9-14.2C70.9,35.8,72.4,36.9,74.1,37.6z M76.4,66.4c2.9,0,5.3,2.4,5.3,5.3s-2.4,5.3-5.3,5.3 s-5.3-2.4-5.3-5.3S73.5,66.4,76.4,66.4z M22.5,56c-2.9,0-5.3-2.4-5.3-5.3c0-2.9,2.4-5.3,5.3-5.3s5.3,2.4,5.3,5.3 C27.8,53.6,25.4,56,22.5,56z M72.9,26.6c0.5-1.3,1.5-2.3,2.8-2.9c0.7-0.3,1.4-0.4,2.1-0.4c0.7,0,1.3,0.1,2,0.4 c1.3,0.5,2.3,1.5,2.9,2.8s0.6,2.7,0,4c-0.5,1.3-1.5,2.3-2.8,2.9c-1.3,0.6-2.7,0.6-4,0c-1.3-0.5-2.3-1.5-2.9-2.8v0 C72.4,29.4,72.4,27.9,72.9,26.6z"/></svg>');
}
