var data = require('./data');
var location = data.array;
var Dexie = require('dexie');
var db = new Dexie('surfSpots');
db.version(1).stores({
    locations: 'spotId, lat, lng, done'
});


// Don't be confused over Dexie.spawn() and yield here. It's not required for using Dexie,
// but it really simplifies the code. If you're a Promise Ninja, use vanilla promise
// style instead.
Dexie.spawn(function*() {
    var id = yield db.locations.put({spotId: location[0].spotId, lat: location[0].lat, lat: location[0].lng, done: 0});
    console.log("Got id " + id);
    // Now lets add a bunch of tasks
    yield db.locations.bulkPut([
        {spotId: location[0].spotId, lat: location[0].lat, lng: location[0].lng, done: 1},
        {spotId: location[0].spotId, lat: location[0].lat, lng: location[0].lng, done: 1}
    ]);
    // Ok, so let's query it
    
    var locations = yield db.locations.where('done').above(0).toArray();
    console.log("Completed locations: " + JSON.stringify(locations, 0, 2));

    // Ok, so let's complete the 'Test Dexie' task.
    yield db.locations
        .where('spotId')
        .startsWithIgnoreCase('3')
        .modify({done: 1});

    console.log ("All locations should be completed now.");
    console.log ("Now let's delete all old locations:");

    // And let's remove all old tasks:
    yield db.location
        .where('lng')
        .below(10)
        .delete();

    console.log ("Done.");

}).catch (err => {
    console.error ("Uh oh! " + err.stack);
});

