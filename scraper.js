const mediablock = document.querySelectorAll('.msw-js-mediaBlock')

const spot_name = mediablock.getAttribute('data-spot-name');

const spot_id = mediablock.getAttribute('data-spot-id');



const express = require('express');
const fs = require('fs');
const request = require('request');
const cheerio = require('cheerio');
const app = express();

app.get('/scrape', function(req, res) {
    // The URL we will scrape from - in our example Anchorman 2.

    url = 'http://magicseaweed.com/site-map.php';

    // The structure of our request call
    // The first parameter is our URL
    // The callback function takes 3 parameters, an error, response status code and the html


    request(url, function(error, response, html){
    if(!error){
        var $ = cheerio.load(html);

    var href;
    var json = { href : ""};

    $('a').filter(function(){
        var data = $(this);
        href = data.text();            
    

        json.href = href;
    })
}

// To write to the system we will use the built in 'fs' library.
// In this example we will pass 3 parameters to the writeFile function
// Parameter 1 :  output.json - this is what the created filename will be called
// Parameter 2 :  JSON.stringify(json, null, 4) - the data to write, here we do an extra step by calling JSON.stringify to make our JSON easier to read
// Parameter 3 :  callback function - a callback function to let us know the status of our function

fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){

    console.log('File successfully written! - Check your project directory for the output.json file');

})

// Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
res.send('Check your console!')

    }) ;
})

app.listen(8081);
console.log('Magic happens on port 8081');
exports = module.exports = app;
